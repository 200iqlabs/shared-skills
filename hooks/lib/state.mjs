/**
 * Session-scoped state for the `ss` agent working mode.
 *
 * Design D2: state lives under the user's Claude config directory and the hooks
 * live inside the plugin. Nothing is ever written into settings.json, so
 * disabling the plugin stops the hooks, and with them the whole mechanism.
 *
 * Design D7: state is keyed by session id, with a single global flag as the
 * fallback for the case where no session id is available. The switch command
 * reads the session id from CLAUDE_CODE_SESSION_ID, which is the same id the
 * hook payloads carry; a global-only flag would leak the mode into every
 * parallel session, which is exactly what "session-scoped" must not mean.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const STALE_SESSION_MS = 7 * 24 * 60 * 60 * 1000 // orphan sweep horizon

export function configDir() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude')
}

export function stateRoot() {
  return path.join(configDir(), 'ss', 'agent-working-mode')
}

export function sessionsDir() {
  return path.join(stateRoot(), 'sessions')
}

export function globalPath() {
  return path.join(stateRoot(), 'global.json')
}

export function sessionPath(sessionId) {
  return path.join(sessionsDir(), `${sanitize(sessionId)}.json`)
}

/** Session ids come from a hook payload or the environment; keep them filename-safe. */
export function sanitize(id) {
  return String(id).replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 128)
}

/** The session id visible to a slash command running through the Bash tool. */
export function envSessionId() {
  return process.env.CLAUDE_CODE_SESSION_ID || process.env.CLAUDE_SESSION_ID || null
}

/** Cheapest possible "is anything switched on anywhere" probe. */
export function stateRootExists() {
  try {
    return fs.existsSync(stateRoot())
  } catch {
    return false
  }
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(value, null, 2))
}

function removeExisting(file) {
  try {
    if (!fs.existsSync(file)) return false
    fs.rmSync(file, { force: true })
    return true
  } catch {
    return false
  }
}

function listSessionFiles() {
  try {
    return fs
      .readdirSync(sessionsDir())
      .filter((name) => name.endsWith('.json'))
      .map((name) => path.join(sessionsDir(), name))
  } catch {
    return []
  }
}

/** Activate for one session, or globally when no session id is available (D7). */
export function activate({ sessionId, cwd, now }) {
  const record = {
    active: true,
    cwd: cwd ?? null,
    activatedAt: new Date(now).toISOString(),
  }
  writeJson(sessionId ? sessionPath(sessionId) : globalPath(), record)
  return record
}

/**
 * Deactivate: this session's own state file, plus the global fallback, which by
 * definition belongs to no single session and would otherwise keep the mode on.
 * Other sessions' files are left alone — that is what keeps them independent.
 */
export function deactivate({ sessionId }) {
  const removed = []
  if (!stateRootExists()) return removed
  if (sessionId && removeExisting(sessionPath(sessionId))) removed.push(sessionId)
  if (removeExisting(globalPath())) removed.push('global')
  return removed
}

/** The mode is scoped to a session, so it ends with it. */
export function endSession(sessionId) {
  if (!stateRootExists() || !sessionId) return false
  return removeExisting(sessionPath(sessionId))
}

export function isActive({ sessionId, now: _now }) {
  if (!stateRootExists()) return false
  if (sessionId && readJson(sessionPath(sessionId))?.active === true) return true
  return readJson(globalPath())?.active === true
}

export function status({ sessionId, now }) {
  return {
    active: isActive({ sessionId, now }),
    sessionId: sessionId ?? null,
    stateRoot: stateRoot(),
  }
}

/** Drop session files no session could still own, so orphans cannot pile up. */
export function pruneStale(now) {
  if (!stateRootExists()) return 0
  let pruned = 0
  for (const file of listSessionFiles()) {
    try {
      if (now - fs.statSync(file).mtimeMs > STALE_SESSION_MS && removeExisting(file)) pruned += 1
    } catch {
      /* ignore */
    }
  }
  return pruned
}
