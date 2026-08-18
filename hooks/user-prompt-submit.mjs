#!/usr/bin/env node
/**
 * UserPromptSubmit: a short reminder on every user message while the mode is
 * active, nothing at all while it is inactive.
 *
 * This channel is shared with every other per-turn injection in the session
 * (safety guidance, other plugins). The reminder therefore stays short and names
 * itself, so it reads as one identifiable voice rather than loose instructions.
 *
 * A SessionStart injection alone decays — competing instructions arrive every
 * turn and the one-shot rule set loses the model's attention. This is what keeps
 * the mode alive late in a long session and after compaction.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isActive, stateRootExists } from './lib/state.mjs'

const REMINDER = path.join(path.dirname(fileURLToPath(import.meta.url)), 'rules', 'reminder.md')

try {
  if (!stateRootExists()) process.exit(0)

  let payload = {}
  try {
    payload = JSON.parse(fs.readFileSync(0, 'utf8'))
  } catch {
    payload = {}
  }

  if (!isActive({ sessionId: payload.session_id, now: Date.now() })) {
    process.exit(0)
  }

  const reminder = fs.readFileSync(REMINDER, 'utf8').trim()
  if (!reminder) process.exit(0)

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: reminder,
      },
    })
  )
} catch {
  /* silent by design */
}
process.exit(0)
