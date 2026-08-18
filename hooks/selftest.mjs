#!/usr/bin/env node
/**
 * End-to-end check of the working-mode hooks against an isolated state
 * directory. Run it with `node hooks/selftest.mjs`; it touches nothing under
 * the real ~/.claude.
 *
 * Covers the off path (nothing switched on, switched off, plugin absent), the
 * on path, independence of two concurrent sessions, and the failure paths that
 * must stay silent.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HOOKS = path.dirname(fileURLToPath(import.meta.url))
const SANDBOX = fs.mkdtempSync(path.join(os.tmpdir(), 'ss-working-mode-test-'))
const ENV = { ...process.env, CLAUDE_CONFIG_DIR: SANDBOX }

let failures = 0

function check(name, condition, detail = '') {
  if (condition) {
    console.log(`  ok    ${name}`)
  } else {
    failures += 1
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

function runHook(script, payload, { raw } = {}) {
  return spawnSync(process.execPath, [path.join(HOOKS, script)], {
    input: raw ?? JSON.stringify(payload ?? {}),
    encoding: 'utf8',
    env: ENV,
  })
}

function runMode(action, sessionId) {
  return spawnSync(process.execPath, [path.join(HOOKS, 'mode.mjs'), action], {
    encoding: 'utf8',
    env: { ...ENV, CLAUDE_CODE_SESSION_ID: sessionId },
    cwd: process.cwd(),
  })
}

const A = { session_id: 'session-alpha', cwd: process.cwd() }
const B = { session_id: 'session-beta', cwd: process.cwd() }

console.log(`state sandbox: ${SANDBOX}\n`)

console.log('off — nothing has ever been switched on')
{
  const start = runHook('session-start.mjs', { ...A, source: 'startup' })
  const turn = runHook('user-prompt-submit.mjs', { ...A, prompt: 'czesc' })
  check('session-start emits nothing', start.stdout === '' && start.status === 0, start.stdout)
  check('user-prompt-submit emits nothing', turn.stdout === '' && turn.status === 0, turn.stdout)
}

console.log('\non — activated for session alpha')
{
  const on = runMode('on', A.session_id)
  check('switch reports success', on.status === 0 && /WLACZONY/.test(on.stdout), on.stdout + on.stderr)

  const start = runHook('session-start.mjs', { ...A, source: 'startup' })
  const parsed = start.stdout ? JSON.parse(start.stdout) : null
  const context = parsed?.hookSpecificOutput?.additionalContext ?? ''
  check('session-start injects the rule set', context.length > 500, `${context.length} chars`)
  check('rule set carries the stop list', context.includes('closed list'))
  check('rule set carries the header shape', context.includes('Gdzie jesteśmy'))
  check('rule set carries the code carve-out', context.includes('commit messages'))

  const resumed = runHook('session-start.mjs', { ...A, source: 'resume' })
  const resumedContext = resumed.stdout ? JSON.parse(resumed.stdout).hookSpecificOutput.additionalContext : ''
  check('a resume is named as a resume', resumedContext.includes('just been resumed'))

  const compacted = runHook('session-start.mjs', { ...A, source: 'compact' })
  const compactedContext = compacted.stdout ? JSON.parse(compacted.stdout).hookSpecificOutput.additionalContext : ''
  check('a compaction is named, and the rules restated as unweakened', compactedContext.includes('compacted') && compactedContext.includes('does not weaken'))

  const turn = runHook('user-prompt-submit.mjs', { ...A, prompt: 'dalej' })
  const reminder = turn.stdout ? JSON.parse(turn.stdout).hookSpecificOutput.additionalContext : ''
  check('per-turn reminder is emitted', reminder.includes('Tryb pracy'), reminder)
  check('reminder stays short', reminder.length < 600, `${reminder.length} chars`)
}

console.log('\nisolation — a second session is untouched (D7)')
{
  const start = runHook('session-start.mjs', { ...B, source: 'startup' })
  const turn = runHook('user-prompt-submit.mjs', { ...B, prompt: 'czesc' })
  check('session beta gets no rule set', start.stdout === '', start.stdout)
  check('session beta gets no reminder', turn.stdout === '', turn.stdout)

  const status = spawnSync(process.execPath, [path.join(HOOKS, 'mode.mjs'), 'status'], {
    encoding: 'utf8',
    env: { ...ENV, CLAUDE_CODE_SESSION_ID: B.session_id },
  })
  check('status for beta reads inactive', /NIEAKTYWNY/.test(status.stdout), status.stdout)
}

console.log('\nfailure paths stay silent')
{
  const noStdin = spawnSync(process.execPath, [path.join(HOOKS, 'user-prompt-submit.mjs')], {
    input: '',
    encoding: 'utf8',
    env: ENV,
  })
  check('empty stdin exits 0 without output', noStdin.status === 0 && noStdin.stdout === '', noStdin.stdout)

  const garbage = runHook('user-prompt-submit.mjs', null, { raw: 'not json at all' })
  check('malformed payload exits 0 without output', garbage.status === 0 && garbage.stdout === '', garbage.stdout)

  fs.writeFileSync(path.join(SANDBOX, 'ss', 'agent-working-mode', 'sessions', 'session-alpha.json'), '{ broken')
  const corrupt = runHook('user-prompt-submit.mjs', { ...A, prompt: 'x' })
  check('corrupt state file exits 0 without output', corrupt.status === 0 && corrupt.stdout === '', corrupt.stdout)
}

console.log('\nsession end clears the session file')
{
  runMode('on', A.session_id)
  const file = path.join(SANDBOX, 'ss', 'agent-working-mode', 'sessions', 'session-alpha.json')
  check('state file exists while active', fs.existsSync(file))
  runHook('session-end.mjs', { ...A, reason: 'clear' })
  check('state survives /clear — same session, wiped context only', fs.existsSync(file))
  runHook('session-end.mjs', { ...A, reason: 'exit' })
  check('state file is gone after session end', !fs.existsSync(file))
}

console.log('\noff — switched off explicitly')
{
  runMode('on', A.session_id)
  const off = runMode('off', A.session_id)
  check('switch reports deactivation', off.status === 0 && /WYLACZONY/.test(off.stdout), off.stdout)

  const start = runHook('session-start.mjs', { ...A, source: 'startup' })
  const turn = runHook('user-prompt-submit.mjs', { ...A, prompt: 'dalej' })
  check('session-start emits nothing again', start.stdout === '', start.stdout)
  check('user-prompt-submit emits nothing again', turn.stdout === '', turn.stdout)

  const sessions = path.join(SANDBOX, 'ss', 'agent-working-mode', 'sessions')
  const left = fs.existsSync(sessions) ? fs.readdirSync(sessions) : []
  check('no orphan state files remain', left.length === 0, left.join(', '))
}

fs.rmSync(SANDBOX, { recursive: true, force: true })

console.log(failures === 0 ? '\nall checks passed' : `\n${failures} check(s) failed`)
process.exit(failures === 0 ? 0 : 1)
