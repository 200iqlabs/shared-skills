#!/usr/bin/env node
/**
 * SessionEnd: drop this session's state file. The mode is scoped to a session,
 * so it ends with it — and no orphan is left behind for a later session to
 * inherit.
 *
 * Except on `/clear`, which also fires this event. There the session keeps
 * running under the same id and only its context is wiped, so clearing the
 * state would switch the mode off without saying so — the "it wore off
 * mid-session" failure this whole mechanism exists to prevent. SessionStart
 * fires again straight after and re-injects the rules.
 */
import fs from 'node:fs'
import { endSession, stateRootExists } from './lib/state.mjs'

try {
  if (stateRootExists()) {
    let payload = {}
    try {
      payload = JSON.parse(fs.readFileSync(0, 'utf8'))
    } catch {
      payload = {}
    }
    if (payload.reason !== 'clear') endSession(payload.session_id)
  }
} catch {
  /* silent by design */
}
process.exit(0)
