#!/usr/bin/env node
/**
 * Helper for the review-fix and review-loop skills. It locates the installed Codex plugin, runs
 * its built-in review, recognises the result strictly, reads the review policy, and guards the
 * tests that existed before a round. Every subcommand prints one JSON object on stdout.
 *
 *   preflight [--repo DIR]
 *   review    [--repo DIR] (--base REF | --scope auto) --out FILE [--timeout-sec N] [--policy FILE]
 *   parse     FILE [--repo DIR] [--exit N] [--policy FILE]
 *   policy    [--repo DIR] [--policy FILE]
 *   guard     --since SHA [--repo DIR] [--policy FILE] [--record FILE --round N]
 *
 * Exit codes: 0 done; 2 Codex is not usable (preflight); 3 the review is an error (review,
 * parse); 4 an existing test changed without a recorded reason (guard); 1 this script failed or
 * was called wrongly. `node selftest.mjs` beside this file checks it.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export const PLUGIN_KEY = 'codex@openai-codex'
export const DEFAULT_SCALE = ['P0', 'P1', 'P2', 'P3']
export const DEFAULT_IMPORTANT = ['P0', 'P1', 'P2']
export const DEFAULT_TEST_PATHS = [
  '**/test/**',
  '**/tests/**',
  '**/__tests__/**',
  '*.test.*',
  '*.spec.*',
  'test_*.py',
  '*_test.py',
  '*_test.go',
]
// Codex renders the marker itself, in English, whatever language the findings are written in.
const MARKER = /^(Full review comments|Review comment):\s*$/
const ENTRY_LIKE = /^\s*-\s+\[[^\]]+\]/
// Traces of a findings block in a format this parser does not know: a severity tag, or a line
// ending in a location. Either one means "clean" cannot be concluded.
const FINDING_TRACE = [/\[P\d\]/, /—\s*\S+:\d+(?:-\d+)?\s*$/]
// `- [P1] <title> — <path>:<start>-<end>`. The tag is optional, so an untagged entry still parses
// and is ordered as untagged instead of failing the round.
const ENTRY = /^- (?:\[([^\]]+)\]\s+)?(.+) — (.+?)(?::(\d+)(?:-(\d+))?)?\s*$/
// Under the 600 s cap of a foreground Bash call, so a review that outgrows it fails here, visibly.
const DEFAULT_TIMEOUT_SEC = 540

// ---------- paths ----------

function slash(p) {
  return String(p).replace(/\\/g, '/').replace(/\/+$/, '')
}

function fold(s) {
  return process.platform === 'win32' ? s.toLowerCase() : s
}

export function relativeToRepo(p, repoRoot) {
  const file = slash(p)
  if (!repoRoot) return { path: file, outside: false }
  const root = slash(repoRoot)
  if (fold(file).startsWith(fold(root) + '/')) return { path: file.slice(root.length + 1), outside: false }
  return { path: file, outside: /^([A-Za-z]:\/|\/)/.test(file) }
}

function repoRootOf(dir) {
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: dir, encoding: 'utf8' })
  return r.status === 0 ? r.stdout.trim() : null
}

function clip(s, n = 2000) {
  const t = String(s ?? '').trim()
  return t.length > n ? `${t.slice(0, n)} …` : t
}

// ---------- locating the plugin ----------

export function claudeDir() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude')
}

// The install record lists one entry per scope. A project or local install counts only for its
// own project; the highest version directory in the cache is not necessarily the installed one.
export function pickInstall(record, repoRoot) {
  const raw = record?.plugins?.[PLUGIN_KEY]
  const entries = Array.isArray(raw) ? raw : raw ? [raw] : []
  const own = entries.find(
    (e) =>
      (e.scope === 'project' || e.scope === 'local') &&
      e.projectPath &&
      repoRoot &&
      fold(slash(e.projectPath)) === fold(slash(repoRoot)),
  )
  return own || entries.find((e) => e.scope === 'user' || !e.scope) || null
}

export function locate(repoRoot) {
  const file = path.join(claudeDir(), 'plugins', 'installed_plugins.json')
  let record
  try {
    record = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (err) {
    return { ok: false, error: `cannot read ${file}: ${err.message}` }
  }
  const entry = pickInstall(record, repoRoot)
  if (!entry || !entry.installPath) {
    return { ok: false, error: `the ${PLUGIN_KEY} plugin is not installed for this repository` }
  }
  const companion = path.join(entry.installPath, 'scripts', 'codex-companion.mjs')
  if (!fs.existsSync(companion)) {
    return { ok: false, error: `the install record points at ${entry.installPath}, which has no scripts/codex-companion.mjs` }
  }
  return { ok: true, version: entry.version ?? null, scope: entry.scope ?? null, installPath: entry.installPath, companion }
}

export function pointerState(repoRoot) {
  let agents = null
  try {
    agents = fs.readFileSync(path.join(repoRoot, 'AGENTS.md'), 'utf8')
  } catch {
    /* no AGENTS.md */
  }
  const policy = fs.existsSync(path.join(repoRoot, 'REVIEW.md'))
  const ok = Boolean(agents && agents.includes('REVIEW.md') && /openspec\/changes\/\*\/review\.md/.test(agents) && policy)
  const missing = []
  if (!agents) missing.push('AGENTS.md')
  else {
    if (!agents.includes('REVIEW.md')) missing.push('the REVIEW.md pointer in AGENTS.md')
    if (!/openspec\/changes\/\*\/review\.md/.test(agents)) missing.push('the openspec/changes/*/review.md pointer in AGENTS.md')
  }
  if (!policy) missing.push('REVIEW.md')
  return { ok, missing }
}

export function preflight(repoRoot) {
  const where = locate(repoRoot)
  if (!where.ok) return { ...where, next: '/codex:setup' }
  const r = spawnSync(process.execPath, [where.companion, 'setup', '--json'], { cwd: repoRoot || process.cwd(), encoding: 'utf8' })
  let setup
  try {
    setup = JSON.parse(r.stdout)
  } catch {
    return { ...where, ok: false, error: `codex setup did not answer in JSON (exit ${r.status}): ${clip(r.stderr || r.stdout)}`, next: '/codex:setup' }
  }
  const stop = (error) => ({ ...where, ok: false, error, next: '/codex:setup' })
  if (!setup?.codex?.available) return stop(`Codex CLI is not available: ${setup?.codex?.detail ?? 'unknown'}`)
  if (!setup?.auth?.loggedIn) return stop(`Codex is not signed in: ${setup?.auth?.detail ?? 'unknown'}`)
  if (setup.ready !== true) return stop('codex setup reports it is not ready')
  return { ...where, ok: true, codex: setup.codex.detail, pointer: repoRoot ? pointerState(repoRoot) : null }
}

// ---------- policy ----------

export function parsePolicy(text) {
  const out = { important: [...DEFAULT_IMPORTANT], importantLine: 'P0-P2', testPaths: [...DEFAULT_TEST_PATHS], fromPolicy: [], warnings: [] }
  if (typeof text !== 'string') return out
  const imp = text.match(/^Important:[ \t]*(.*)$/im)
  if (imp) {
    const m = imp[1].trim().match(/^(P\d)(?:\s*[-–]\s*(P\d))?$/i)
    const lo = m ? Number(m[1].slice(1)) : NaN
    const hi = m ? Number((m[2] ?? m[1]).slice(1)) : NaN
    if (m && lo <= hi) {
      out.important = []
      for (let i = lo; i <= hi; i++) out.important.push(`P${i}`)
      out.importantLine = m[2] ? `P${lo}-P${hi}` : `P${lo}`
      out.fromPolicy.push('Important')
    } else {
      out.warnings.push(`the Important line "${imp[1].trim()}" is not a tag or a range like P0-P2; using P0-P2`)
    }
  }
  const tp = text.match(/^Test paths:[ \t]*(.*)$/im)
  if (tp) {
    const list = tp[1]
      .split(',')
      .map((s) => s.trim().replace(/^`|`$/g, ''))
      .filter(Boolean)
    if (list.length) {
      out.testPaths = list
      out.fromPolicy.push('Test paths')
    } else {
      out.warnings.push('the Test paths line is empty; using the defaults')
    }
  }
  return out
}

export function readPolicy(repoRoot, file) {
  const target = file || (repoRoot ? path.join(repoRoot, 'REVIEW.md') : 'REVIEW.md')
  let text = null
  try {
    text = fs.readFileSync(target, 'utf8')
  } catch {
    /* no policy file: the defaults apply */
  }
  return { source: text === null ? 'defaults' : target, ...parsePolicy(text) }
}

// ---------- recognising a review ----------

// Tagged findings first, by rank, keeping arrival order within a rank; then the untagged ones and
// those whose tag the scale does not define, in arrival order. No tag anywhere: arrival order.
export function fixOrder(findings, scale = DEFAULT_SCALE) {
  const rank = (f) => (f.tag && scale.includes(f.tag) ? scale.indexOf(f.tag) : null)
  const ranked = findings.filter((f) => rank(f) !== null).sort((a, b) => rank(a) - rank(b) || a.n - b.n)
  const rest = findings.filter((f) => rank(f) === null)
  return [...ranked, ...rest].map((f) => f.n)
}

// Strict in both directions: "clean" needs a review that exited 0, reported success and matches
// the clean shape; output that announces findings must parse completely, or the round is an error.
export function recognise({ exit, stdout, stderr, repoRoot, important = DEFAULT_IMPORTANT, scale = DEFAULT_SCALE }) {
  const error = (message) => ({ verdict: 'error', error: message, findings: [] })
  if (exit !== 0) return error(`the review command exited ${exit}: ${clip(stderr) || clip(stdout) || 'no output'}`)
  let payload
  try {
    payload = JSON.parse(stdout)
  } catch {
    return error(`the review command printed something other than JSON: ${clip(stdout) || 'nothing'}`)
  }
  const codex = payload?.codex
  if (!codex || codex.status !== 0) {
    return error(`the review reported failure (status ${codex?.status ?? 'missing'}): ${clip(codex?.stderr) || clip(codex?.stdout) || 'no text'}`)
  }
  const text = typeof codex.stdout === 'string' ? codex.stdout : ''
  if (!text.trim()) return error('the review succeeded but returned no text')
  const lines = text.split(/\r?\n/)
  const markerAt = lines.findIndex((l) => MARKER.test(l.trim()))
  const summary = clip((markerAt === -1 ? lines : lines.slice(0, markerAt)).join('\n'), 4000)
  if (markerAt === -1) {
    if (lines.some((l) => ENTRY_LIKE.test(l))) return error(`the review lists entries without a findings marker:\n${clip(text)}`)
    if (lines.some((l) => FINDING_TRACE.some((re) => re.test(l)))) {
      return error(`the review carries a severity tag or a location but no findings marker, so it cannot be read as clean:\n${clip(text)}`)
    }
    return { verdict: 'clean', summary, findings: [], error: null }
  }
  const findings = []
  for (const line of lines.slice(markerAt + 1)) {
    if (!line.trim()) {
      if (findings.length) findings[findings.length - 1].bodyLines.push('')
      continue
    }
    if (/^(\s{2,}|\t)/.test(line)) {
      if (!findings.length) return error(`body text before the first finding: ${clip(line)}`)
      findings[findings.length - 1].bodyLines.push(line.replace(/^(\s{2}|\t)/, ''))
      continue
    }
    const m = line.match(ENTRY)
    if (!m) return error(`a line under the findings marker does not parse as a finding: ${clip(line)}\n\nFull review text:\n${clip(text)}`)
    const where = relativeToRepo(m[3].trim(), repoRoot)
    // The fixer edits the files findings name, so a finding outside the repository stops the round.
    if (where.outside) return error(`a finding names a path outside the repository (${where.path}); nothing outside it is edited:\n${clip(line)}`)
    findings.push({
      n: findings.length + 1,
      tag: m[1] ? m[1].trim().toUpperCase() : null,
      title: m[2].trim(),
      path: where.path,
      start: m[4] ? Number(m[4]) : null,
      end: m[5] ? Number(m[5]) : m[4] ? Number(m[4]) : null,
      bodyLines: [],
    })
  }
  if (!findings.length) return error(`the findings marker is present but no finding follows:\n${clip(text)}`)
  for (const f of findings) {
    f.body = f.bodyLines.join('\n').trim()
    delete f.bodyLines
    f.in_scale = Boolean(f.tag && scale.includes(f.tag))
    // A finding whose severity cannot be read is not assumed minor.
    f.important = f.in_scale ? important.includes(f.tag) : true
  }
  return { verdict: 'findings', summary, findings, fix_order: fixOrder(findings, scale), error: null }
}

// ---------- the test guard ----------

export function globToRegExp(glob) {
  const g = glob.replace(/\\/g, '/')
  let re = ''
  for (let i = 0; i < g.length; i++) {
    const c = g[i]
    if (c === '*' && g[i + 1] === '*') {
      if (g[i + 2] === '/') {
        re += '(?:.*/)?'
        i += 2
      } else {
        re += '.*'
        i += 1
      }
    } else if (c === '*') re += '[^/]*'
    else if (c === '?') re += '[^/]'
    else if (c === '/' && g.slice(i + 1) === '**') {
      re += '(?:/.*)?'
      break
    } else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  }
  // A glob without a slash matches the file name anywhere, as in .gitignore.
  return new RegExp(g.includes('/') ? `^${re}$` : `(?:^|/)${re}$`)
}

export function isTestPath(file, patterns) {
  const f = slash(file)
  return patterns.some((p) => globToRegExp(p).test(f))
}

// Reasons live in the round's own section, as `- \`path\` — R2-1: why`, and must name a finding
// of that round's table.
export function recordReasons(recordText, round) {
  const reasons = new Map()
  if (typeof recordText !== 'string') return reasons
  const lines = recordText.split(/\r?\n/)
  const start = lines.findIndex((l) => new RegExp(`^##\\s+Round\\s+${round}\\b`).test(l))
  if (start === -1) return reasons
  let end = lines.findIndex((l, i) => i > start && /^##\s/.test(l))
  if (end === -1) end = lines.length
  const section = lines.slice(start, end)
  const ids = new Set(section.map((l) => l.match(/^\|\s*(R\d+-\d+)\s*\|/)?.[1]).filter(Boolean))
  for (const l of section) {
    const m = l.match(/^\s*-\s+`?([^`]+?)`?\s+(?:—|--|-)\s+(R\d+-\d+)\s*:\s*(\S.*)$/)
    if (m && ids.has(m[2])) reasons.set(slash(m[1]), { finding: m[2], reason: m[3].trim() })
  }
  return reasons
}

export function guard({ repoRoot, since, patterns, recordText, round }) {
  const r = spawnSync('git', ['diff', '--name-status', '-M', since], { cwd: repoRoot, encoding: 'utf8' })
  if (r.status !== 0) return { ok: false, error: `git diff against ${since} failed: ${clip(r.stderr)}`, protected: [], reasoned: [], unreasoned: [] }
  const changed = []
  for (const line of r.stdout.split(/\r?\n/).filter(Boolean)) {
    const [status, from] = line.split('\t')
    // Added files are new tests and never restricted; a rename counts from the path that existed.
    if (/^[MDTR]/.test(status)) changed.push({ status: status[0], path: slash(from) })
  }
  const reasons = recordReasons(recordText, round)
  const prot = changed.filter((c) => isTestPath(c.path, patterns))
  const reasoned = prot.filter((c) => reasons.has(c.path)).map((c) => ({ path: c.path, ...reasons.get(c.path) }))
  const unreasoned = prot.filter((c) => !reasons.has(c.path)).map((c) => c.path)
  return { ok: unreasoned.length === 0, protected: prot, reasoned, unreasoned, error: null }
}

// ---------- command line ----------

function parseArgs(argv) {
  const out = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) {
      out._.push(a)
      continue
    }
    const next = argv[i + 1]
    if (next === undefined || next.startsWith('--')) out[a.slice(2)] = true
    else {
      out[a.slice(2)] = next
      i++
    }
  }
  return out
}

function print(obj, code = 0) {
  process.stdout.write(`${JSON.stringify(obj, null, 2)}\n`)
  process.exitCode = code
}

function main(argv) {
  const [cmd, ...rest] = argv
  const o = parseArgs(rest)
  const repoRoot = o.repo ? String(o.repo) : repoRootOf(process.cwd())

  if (cmd === 'preflight') {
    const res = preflight(repoRoot)
    return print(res, res.ok ? 0 : 2)
  }
  if (cmd === 'policy') return print(readPolicy(repoRoot, o.policy))
  if (cmd === 'parse') {
    if (!o._[0]) return print({ error: 'parse needs the payload file' }, 1)
    const saved = JSON.parse(fs.readFileSync(o._[0], 'utf8'))
    const policy = readPolicy(repoRoot, o.policy)
    // A file written by `review` carries the exit status; a bare companion payload does not.
    const raw =
      saved && 'exit' in saved && 'stdout' in saved
        ? saved
        : { exit: o.exit === undefined ? 0 : Number(o.exit), stdout: JSON.stringify(saved), stderr: '' }
    const res = recognise({ ...raw, repoRoot, important: policy.important })
    return print({ ...res, policy: { source: policy.source, important: policy.importantLine } }, res.verdict === 'error' ? 3 : 0)
  }
  if (cmd === 'review') {
    if (!o.out) return print({ error: 'review needs --out FILE' }, 1)
    if (!o.base && o.scope !== 'auto') return print({ error: 'review needs --base REF or --scope auto' }, 1)
    const where = locate(repoRoot)
    if (!where.ok) return print({ verdict: 'error', error: where.error, next: '/codex:setup', findings: [] }, 3)
    const target = o.base ? ['--base', String(o.base)] : ['--scope', 'auto']
    const timeoutSec = Number(o['timeout-sec'] || DEFAULT_TIMEOUT_SEC)
    const started = Date.now()
    const r = spawnSync(process.execPath, [where.companion, 'review', '--json', ...target], {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      timeout: timeoutSec * 1000,
    })
    const seconds = Math.round((Date.now() - started) / 1000)
    const timedOut = r.error?.code === 'ETIMEDOUT'
    const raw = { exit: timedOut ? null : r.status, signal: r.signal ?? null, seconds, stdout: r.stdout ?? '', stderr: r.stderr ?? '' }
    fs.mkdirSync(path.dirname(path.resolve(o.out)), { recursive: true })
    fs.writeFileSync(o.out, JSON.stringify(raw, null, 2))
    const policy = readPolicy(repoRoot, o.policy)
    const res = timedOut
      ? { verdict: 'error', error: `the review did not finish within ${timeoutSec}s and was stopped`, findings: [] }
      : recognise({ ...raw, repoRoot, important: policy.important })
    const out = { ...res, seconds, payload: path.resolve(o.out), plugin: where.version, policy: { source: policy.source, important: policy.importantLine } }
    return print(out, res.verdict === 'error' ? 3 : 0)
  }
  if (cmd === 'guard') {
    if (!o.since) return print({ error: 'guard needs --since SHA' }, 1)
    const policy = readPolicy(repoRoot, o.policy)
    let recordText = null
    if (o.record) {
      try {
        recordText = fs.readFileSync(o.record, 'utf8')
      } catch {
        /* no record: every protected change is unreasoned */
      }
    }
    const res = guard({ repoRoot, since: String(o.since), patterns: policy.testPaths, recordText, round: Number(o.round || 0) })
    return print({ ...res, testPaths: policy.testPaths }, res.error ? 1 : res.ok ? 0 : 4)
  }
  return print({ error: `unknown subcommand ${cmd ?? '(none)'}; use preflight, review, parse, policy or guard` }, 1)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    main(process.argv.slice(2))
  } catch (err) {
    print({ error: `codex-review.mjs failed: ${err.message}` }, 1)
  }
}
