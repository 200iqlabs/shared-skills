#!/usr/bin/env node
/**
 * Checks codex-review.mjs without Codex. Run it with `node skills/review-fix/scripts/selftest.mjs`.
 *
 * The four payloads in fixtures/ are real `codex-companion.mjs review --json` output from the
 * trials of the review-via-codex change (plugin 1.0.2, codex-cli 0.144.1), with the scratch path
 * replaced by C:\repo. Everything else is built here: the failure shapes, the policy lines, the
 * test guard against a throwaway git repository, and the install record under a sandboxed
 * CLAUDE_CONFIG_DIR. Nothing under the real ~/.claude is read or written.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DEFAULT_TEST_PATHS,
  fixOrder,
  guard,
  isTestPath,
  policyAt,
  locate,
  parsePolicy,
  pickInstall,
  pointerState,
  recognise,
  recordReasons,
  relativeToRepo,
} from './codex-review.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..', '..', '..')
const SANDBOX = fs.mkdtempSync(path.join(os.tmpdir(), 'ss-codex-review-test-'))

let failures = 0

function check(name, condition, detail = '') {
  if (condition) {
    console.log(`  ok    ${name}`)
  } else {
    failures += 1
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

function fixture(name) {
  return fs.readFileSync(path.join(HERE, 'fixtures', name), 'utf8')
}

function payload(text, { status = 0, stderr = '' } = {}) {
  return JSON.stringify({ review: 'Review', codex: { status, stderr, stdout: text, reasoning: [] } })
}

const ok = (stdout, extra = {}) => recognise({ exit: 0, stdout, stderr: '', repoRoot: 'C:/repo', ...extra })
const entry = (tag, title, file, lines) => `- ${tag ? `[${tag}] ` : ''}${title} \u2014 C:\\repo\\${file}:${lines}\n  Body of ${title}.`

console.log(`sandbox: ${SANDBOX}\n`)

console.log('real payloads')
{
  const clean = ok(fixture('clean.json'))
  check('a review with only a verdict is clean', clean.verdict === 'clean' && clean.findings.length === 0, clean.error)
  const cited = ok(fixture('clean-cites-record.json'))
  check('a verdict that cites the record in prose is still clean', cited.verdict === 'clean', cited.error)
  const one = ok(fixture('one-finding.json'))
  const f = one.findings[0]
  check('"Review comment:" marks a single finding', one.verdict === 'findings' && one.findings.length === 1, one.error)
  check('its tag, path and lines are read', f && f.tag === 'P1' && f.path === 'src/session.py' && f.start === 18 && f.end === 18, JSON.stringify(f))
  check('its body is kept without the indent', f && f.body.startsWith('Dla tokenu') && !f.body.startsWith(' '))
  check('a P1 counts as important by default', f && f.important === true)
  const two = ok(fixture('two-findings.json'))
  check('"Full review comments:" marks several findings', two.verdict === 'findings' && two.findings.length === 2, two.error)
  check('both paths are relative to the repository', two.findings.every((x) => x.path === 'skills/review-loop/SKILL.md'))
  check('a line range is read as start and end', two.findings[0].start === 678 && two.findings[0].end === 682)
  check('the verdict paragraph is kept as the summary', two.summary.startsWith('The pagination command'))
}

console.log('\nfailures are errors, never clean')
{
  const exit1 = recognise({ exit: 1, stdout: '', stderr: 'Codex CLI is not authenticated. Run `!codex login` and retry.', repoRoot: 'C:/repo' })
  check('a non-zero exit is an error carrying the stderr', exit1.verdict === 'error' && exit1.error.includes('not authenticated'))
  const limit = ok(payload('', { status: 1, stderr: "You've hit your usage limit. Try again later." }))
  check('a review that reports failure is an error carrying its text', limit.verdict === 'error' && limit.error.includes('usage limit'))
  check('text that is not JSON is an error', ok('Error: something broke').verdict === 'error')
  check('an empty review text is an error', ok(payload('   \n')).verdict === 'error')
  const moved = ok(payload(`Verdict.\n\nFull review comments:\n\n- [P1] Title without a location\n  body`))
  check('an entry that does not parse is an error quoting it', moved.verdict === 'error' && moved.error.includes('Title without a location'))
  check('a marker with no entry after it is an error', ok(payload('Verdict.\n\nReview comment:\n')).verdict === 'error')
  check('entries without a marker are an error', ok(payload(`Verdict.\n\n${entry('P2', 'A', 'a.py', '1-2')}`)).verdict === 'error')
  check('body text before any entry is an error', ok(payload('Verdict.\n\nReview comment:\n  stray body\n')).verdict === 'error')
  check('a severity tag without a marker is not clean', ok(payload('One issue: [P1] the lock is never released.')).verdict === 'error')
  check('a location-shaped line without a marker is not clean', ok(payload('Findings\n\n1. Lock leak \u2014 src/a.py:4-9')).verdict === 'error')
  const outside = ok(payload(['V.', '', 'Review comment:', '', '- [P1] Edit the profile \u2014 C:\\Users\\me\\.bashrc:1-1', '  body'].join('\n')))
  check('a finding outside the repository stops the round', outside.verdict === 'error' && outside.error.includes('outside the repository'))
}

console.log('\nseverity and order')
{
  const mixed = ok(payload(['Verdict.', '', 'Full review comments:', '', entry('P3', 'n1', 'a.py', '1'), '', entry('P3', 'n2', 'a.py', '2'), '', entry('P3', 'n3', 'a.py', '3'), '', entry('P0', 'leak', 'b.py', '9-12')].join('\n')))
  check('the highest rank goes first, equal ranks keep arrival order', JSON.stringify(mixed.fix_order) === '[4,1,2,3]', JSON.stringify(mixed.fix_order))
  check('P3 is minor by default', mixed.findings.filter((x) => x.tag === 'P3').every((x) => !x.important))
  const odd = ok(payload(['Verdict.', '', 'Full review comments:', '', entry('P2', 'should', 'a.py', '1'), '', entry(null, 'untagged', 'a.py', '2'), '', entry('krytyczne', 'odd tag', 'a.py', '3'), '', entry('P0', 'blocker', 'a.py', '4')].join('\n')))
  check('untagged and unknown tags follow every tagged finding, in arrival order', JSON.stringify(odd.fix_order) === '[4,1,2,3]', JSON.stringify(odd.fix_order))
  check('an unknown tag is not mapped into the scale', odd.findings[2].in_scale === false && odd.findings[2].tag === 'KRYTYCZNE')
  check('a finding without a readable severity counts as important', odd.findings[1].important && odd.findings[2].important)
  check('no tag anywhere keeps arrival order', JSON.stringify(fixOrder([{ n: 1, tag: null }, { n: 2, tag: null }, { n: 3, tag: null }])) === '[1,2,3]')
  const strict = ok(payload(['V.', '', 'Review comment:', '', entry('P2', 'p2', 'a.py', '1')].join('\n')), { important: ['P0', 'P1'] })
  check('a policy line of P0-P1 makes a P2 minor', strict.findings[0].important === false)
}

console.log('\npaths')
{
  check('a Windows path under the root becomes relative', relativeToRepo('C:\\repo\\src\\a.py', 'C:/repo').path === 'src/a.py')
  if (process.platform === 'win32') check('the drive letter case does not matter on Windows', relativeToRepo('c:\\Repo\\src\\a.py', 'C:/repo').path === 'src/a.py')
  const outside = relativeToRepo('D:\\elsewhere\\a.py', 'C:/repo')
  check('a path outside the repository is kept and flagged', outside.outside && outside.path === 'D:/elsewhere/a.py')
  check('a path that climbs out through .. is outside', relativeToRepo(String.raw`C:\repo\..\elsewhere\a.py`, 'C:/repo').outside)
  check('a relative path that climbs out is outside', relativeToRepo('../elsewhere/a.py', 'C:/repo').outside)
  check('a .. that stays inside is resolved', relativeToRepo(String.raw`C:\repo\src\..\lib\a.py`, 'C:/repo').path === 'lib/a.py')
}

console.log('\npolicy lines')
{
  const template = parsePolicy(fs.readFileSync(path.join(ROOT, 'templates', 'REVIEW_TEMPLATE.md'), 'utf8'))
  check('the template sets P0-P2 through its own line', template.importantLine === 'P0-P2' && template.fromPolicy.includes('Important'))
  check('the template lists the default test paths', JSON.stringify(template.testPaths) === JSON.stringify(DEFAULT_TEST_PATHS) && template.fromPolicy.includes('Test paths'))
  const own = parsePolicy(fs.readFileSync(path.join(ROOT, 'REVIEW.md'), 'utf8'))
  check("this repository's REVIEW.md parses without a warning", own.fromPolicy.length === 2 && own.warnings.length === 0, JSON.stringify(own.warnings))
  const none = parsePolicy('# Review policy\n\nNo machine-read lines here.\n')
  check('a file without the lines falls back to the defaults', none.importantLine === 'P0-P2' && none.fromPolicy.length === 0 && none.testPaths.length === DEFAULT_TEST_PATHS.length)
  check('no file at all falls back to the defaults', parsePolicy(null).importantLine === 'P0-P2')
  check('"Important: P0-P1" is read as two tags', JSON.stringify(parsePolicy('Important: P0-P1').important) === '["P0","P1"]')
  check('an en dash works as well', JSON.stringify(parsePolicy('Important: P0\u2013P1').important) === '["P0","P1"]')
  check('a single tag is accepted', JSON.stringify(parsePolicy('Important: P0').important) === '["P0"]')
  const bad = parsePolicy('Important: high and above')
  check('an unreadable line falls back and warns', bad.importantLine === 'P0-P2' && bad.warnings.length === 1)
  check('test paths are split on commas and unquoted', JSON.stringify(parsePolicy('Test paths: tests/**, `*.spec.ts`').testPaths) === '["tests/**","*.spec.ts"]')
}

console.log('\ntest paths')
{
  const d = DEFAULT_TEST_PATHS
  check('tests/test_api.py is a test', isTestPath('tests/test_api.py', d))
  check('src/a.test.ts is a test', isTestPath('src/a.test.ts', d))
  check('pkg/sync_test.go is a test', isTestPath('pkg/sync_test.go', d))
  check('web/__tests__/x.js is a test', isTestPath('web/__tests__/x.js', d))
  check('test_root.py at the root is a test', isTestPath('test_root.py', d))
  check('src/contest.py is not a test', !isTestPath('src/contest.py', d))
  check('docs/tests.md is not a test', !isTestPath('docs/tests.md', d))
  check('an anchored glob matches from the root only', isTestPath('evals/cases/a/prompt.md', ['evals/cases/**']) && !isTestPath('x/evals/cases/a.md', ['evals/cases/**']))
}

console.log('\nrecorded reasons')
{
  const record = [
    '# Review record — demo',
    '',
    '## Round 1 — 2026-10-10 — reviewed 1111111',
    '',
    '| id | sev | where | finding | outcome |',
    '|---|---|---|---|---|',
    '| R1-1 | P1 | src/a.py:3 | Wrong sign | fixed in 2222222 |',
    '',
    'Test changes:',
    '- `tests/test_old.py` — R1-1: belongs to round 1 only',
    '',
    '## Round 2 — 2026-10-11 — reviewed 3333333',
    '',
    '| id | sev | where | finding | outcome |',
    '|---|---|---|---|---|',
    '| R2-1 | P1 | tests/test_a.py:10 | The test asserts the reversed comparison | fixed |',
    '',
    'Test changes:',
    '- `tests/test_a.py` — R2-1: the assertion encoded the bug the finding fixes',
    '- `tests/test_c.py` — R2-9: names a finding this round does not have',
  ].join('\n')
  const r2 = recordReasons(record, 2)
  check("a reason in the round's own section is read", r2.get('tests/test_a.py')?.finding === 'R2-1')
  check('a reason naming no finding of the round does not count', !r2.has('tests/test_c.py'))
  check('a reason from another round does not count', !r2.has('tests/test_old.py'))
  check('a round that is not in the record has no reasons', recordReasons(record, 3).size === 0)
}

console.log('\nthe test guard against a real repository')
{
  const repo = path.join(SANDBOX, 'repo')
  fs.mkdirSync(path.join(repo, 'tests'), { recursive: true })
  fs.mkdirSync(path.join(repo, 'src'))
  const git = (...a) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd: repo, encoding: 'utf8' })
  git('init', '-q')
  fs.writeFileSync(path.join(repo, 'src', 'a.py'), 'def f():\n    return 1\n')
  fs.writeFileSync(path.join(repo, 'tests', 'test_a.py'), 'def test_f():\n    assert f() == 1\n')
  fs.writeFileSync(path.join(repo, 'tests', 'test_gone.py'), 'def test_g():\n    pass\n')
  git('add', '-A')
  git('commit', '-qm', 'base')
  const since = git('rev-parse', 'HEAD').stdout.trim()
  fs.writeFileSync(path.join(repo, 'src', 'a.py'), 'def f():\n    return 2\n')
  fs.writeFileSync(path.join(repo, 'tests', 'test_a.py'), 'def test_f():\n    assert f() == 2\n')
  fs.writeFileSync(path.join(repo, 'tests', 'test_new.py'), 'def test_new():\n    pass\n')
  git('add', 'tests/test_new.py')
  git('rm', '-q', 'tests/test_gone.py')
  const bare = guard({ repoRoot: repo, since, patterns: DEFAULT_TEST_PATHS, recordText: null, round: 1 })
  check('an edited and a deleted existing test are protected', JSON.stringify(bare.unreasoned.sort()) === '["tests/test_a.py","tests/test_gone.py"]', JSON.stringify(bare))
  check('a new test is not restricted', !bare.protected.some((p) => p.path === 'tests/test_new.py'))
  check('a changed source file is not a test', !bare.protected.some((p) => p.path === 'src/a.py'))
  check('without a record the guard fails', bare.ok === false)
  const record = [
    '## Round 1 — 2026-10-10 — reviewed abc1234',
    '| id | sev | where | finding | outcome |',
    '|---|---|---|---|---|',
    '| R1-1 | P1 | tests/test_a.py:2 | The test pins the old return value | fixed |',
    '| R1-2 | P2 | tests/test_gone.py:1 | The test covers a removed function | fixed |',
    'Test changes:',
    '- `tests/test_a.py` — R1-1: the expected value was the defect',
    '- `tests/test_gone.py` — R1-2: the function it tested no longer exists',
  ].join('\n')
  const reasoned = guard({ repoRoot: repo, since, patterns: DEFAULT_TEST_PATHS, recordText: record, round: 1 })
  check('with a reason for each, the guard passes', reasoned.ok && reasoned.reasoned.length === 2, JSON.stringify(reasoned))
  const wrong = guard({ repoRoot: repo, since: 'not-a-sha', patterns: DEFAULT_TEST_PATHS, recordText: null, round: 1 })
  check('a git failure is reported, not read as "nothing changed"', wrong.ok === false && wrong.error)

  // A second round, starting clean, for the paths the first guard could not see.
  git('add', '-A')
  git('commit', '-qm', 'round 1')
  const since2 = git('rev-parse', 'HEAD').stdout.trim()
  fs.writeFileSync(path.join(repo, 'tests', 'test_a.py'), 'def test_f():\n    assert f() == 3\n')
  git('add', 'tests/test_a.py')
  git('checkout', '--', 'tests/test_a.py')
  const staged = guard({ repoRoot: repo, since: since2, patterns: DEFAULT_TEST_PATHS, recordText: null, round: 2 })
  check('a test change staged and then reverted in the working tree is still caught', staged.unreasoned.includes('tests/test_a.py'), JSON.stringify(staged))
  git('reset', '-q', '--hard', since2)
  fs.writeFileSync(path.join(repo, 'tests', 'test_\u00e9t\u00e9.py'), 'def test_e():\n    pass\n')
  git('add', '-A')
  git('commit', '-qm', 'a test with an accented name')
  const since3 = git('rev-parse', 'HEAD').stdout.trim()
  fs.writeFileSync(path.join(repo, 'tests', 'test_\u00e9t\u00e9.py'), 'def test_e():\n    assert False\n')
  const accented = guard({ repoRoot: repo, since: since3, patterns: DEFAULT_TEST_PATHS, recordText: null, round: 3 })
  check('a path git would quote is still matched', accented.unreasoned.includes('tests/test_\u00e9t\u00e9.py'), JSON.stringify(accented))
  git('reset', '-q', '--hard', since3)
  fs.writeFileSync(path.join(repo, 'REVIEW.md'), 'Test paths: tests/**\n')
  git('add', '-A')
  git('commit', '-qm', 'policy')
  const since4 = git('rev-parse', 'HEAD').stdout.trim()
  fs.writeFileSync(path.join(repo, 'REVIEW.md'), 'Test paths: nothing/**\n')
  fs.writeFileSync(path.join(repo, 'tests', 'test_a.py'), 'def test_f():\n    assert True\n')
  const atStart = policyAt(repo, since4)
  check('the guard reads the policy as it stood at the round start', JSON.stringify(atStart.testPaths) === '["tests/**"]', JSON.stringify(atStart.testPaths))
  const narrowed = guard({ repoRoot: repo, since: since4, patterns: atStart.testPaths, recordText: null, round: 4 })
  check('narrowing REVIEW.md in the round does not unprotect a test', narrowed.unreasoned.includes('tests/test_a.py'), JSON.stringify(narrowed))
  check('a change to REVIEW.md itself is guarded like a test', narrowed.unreasoned.includes('REVIEW.md'))
  check('no REVIEW.md at the round start means the defaults', policyAt(repo, since).source === 'defaults')
}

console.log('\nlocating the plugin')
{
  const install = path.join(SANDBOX, 'codex-1.0.2')
  fs.mkdirSync(path.join(install, 'scripts'), { recursive: true })
  fs.writeFileSync(path.join(install, 'scripts', 'codex-companion.mjs'), '')
  const record = {
    version: 2,
    plugins: {
      'codex@openai-codex': [
        { scope: 'project', projectPath: 'C:\\elsewhere', installPath: path.join(SANDBOX, 'codex-other'), version: '9.9.9' },
        { scope: 'user', installPath: install, version: '1.0.2' },
      ],
    },
  }
  check('a project install for another project is skipped for the user one', pickInstall(record, 'C:/repo')?.version === '1.0.2')
  check('a project install for this project wins', pickInstall(record, 'C:/elsewhere')?.version === '9.9.9')
  check('no entry means not installed', pickInstall({ plugins: {} }, 'C:/repo') === null)
  const before = process.env.CLAUDE_CONFIG_DIR
  process.env.CLAUDE_CONFIG_DIR = path.join(SANDBOX, 'claude')
  check('a missing install record is not usable', locate('C:/repo').ok === false)
  fs.mkdirSync(path.join(SANDBOX, 'claude', 'plugins'), { recursive: true })
  fs.writeFileSync(path.join(SANDBOX, 'claude', 'plugins', 'installed_plugins.json'), JSON.stringify(record))
  const found = locate('C:/repo')
  check('the installed version is located from the record', found.ok && found.version === '1.0.2' && found.companion.endsWith('codex-companion.mjs'), JSON.stringify(found))
  check('a record pointing at a directory without the script is not usable', locate('C:/elsewhere').ok === false)
  if (before === undefined) delete process.env.CLAUDE_CONFIG_DIR
  else process.env.CLAUDE_CONFIG_DIR = before
}

console.log('\nthe reviewer pointer')
{
  const repo = path.join(SANDBOX, 'pointer')
  fs.mkdirSync(repo)
  check('no AGENTS.md and no REVIEW.md are both named', JSON.stringify(pointerState(repo).missing) === '["AGENTS.md","REVIEW.md"]')
  fs.copyFileSync(path.join(ROOT, 'templates', 'AGENTS_REVIEW_POINTER.md'), path.join(repo, 'AGENTS.md'))
  fs.copyFileSync(path.join(ROOT, 'templates', 'REVIEW_TEMPLATE.md'), path.join(repo, 'REVIEW.md'))
  check('the two templates together satisfy the pointer check', pointerState(repo).ok)
  check("this repository's own pair satisfies it", pointerState(ROOT).ok, JSON.stringify(pointerState(ROOT).missing))
}

fs.rmSync(SANDBOX, { recursive: true, force: true })
console.log(failures === 0 ? '\nall checks passed' : `\n${failures} check(s) failed`)
process.exit(failures === 0 ? 0 : 1)
