#!/usr/bin/env node
/**
 * SessionStart: inject the full working-mode rule set when the mode is active
 * for this session, and nothing at all when it is not.
 *
 * Every failure path is silent and exits 0. A hook that cannot do its job must
 * not break the session it runs in.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isActive, pruneStale, stateRootExists } from './lib/state.mjs'

const RULES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'rules')

function readPayload() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'))
  } catch {
    return {}
  }
}

/**
 * Only this hook knows whether the session was just resumed or just compacted —
 * from the model's side a resumed turn looks like any other turn, so the second
 * header trigger would be left to guesswork. Saying it outright makes it
 * mechanical.
 */
function resumeNote(source) {
  if (source === 'resume') {
    return 'This session has just been resumed. Your next reply is the first one after the resume, so it carries the orientation header (trigger 2).'
  }
  if (source === 'compact') {
    return "This session's earlier context has just been summarised (compacted). The rules above are in force exactly as before — the compaction does not weaken them. Your next reply is the first one after the compaction, so it carries the orientation header (trigger 2)."
  }
  return null
}

function ruleSet(source) {
  const parts = fs
    .readdirSync(RULES_DIR)
    .filter((name) => name.endsWith('.md') && name !== 'reminder.md')
    .sort()
    .map((name) => fs.readFileSync(path.join(RULES_DIR, name), 'utf8').trim())
    .filter(Boolean)
  if (!parts.length) return null
  const note = resumeNote(source)
  return [
    '# Tryb pracy `ss` (ss:working-mode) — aktywny w tej sesji',
    '',
    'These rules govern how you talk to the user and when you may stop, for the rest of this',
    'session. They stay in force through long sessions and across context compaction. The user',
    'switches them off with `/ss:working-mode off`.',
    '',
    parts.join('\n\n'),
    ...(note ? ['', '## Right now', '', note] : []),
  ].join('\n')
}

try {
  // Fast path: nothing has ever been switched on, so there is nothing to read.
  if (!stateRootExists()) process.exit(0)

  const payload = readPayload()
  const now = Date.now()
  pruneStale(now)

  if (!isActive({ sessionId: payload.session_id, now })) process.exit(0)

  const rules = ruleSet(payload.source)
  if (!rules) process.exit(0)

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: rules,
      },
    })
  )
} catch {
  /* silent by design */
}
process.exit(0)
