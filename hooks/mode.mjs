#!/usr/bin/env node
/**
 * The switch behind `/ss:working-mode`. Run by the command, not by a hook.
 *
 *   node hooks/mode.mjs on|off|status
 *
 * Prints one short Polish line. Exits 0 on success, 1 on a usage error.
 */
import { activate, deactivate, envSessionId, status } from './lib/state.mjs'

const action = (process.argv[2] || 'status').toLowerCase()
const sessionId = envSessionId()
const cwd = process.cwd()
const now = Date.now()

try {
  if (action === 'on') {
    activate({ sessionId, cwd, now })
    const scope = sessionId ? 'tej sesji' : 'wszystkich sesji (brak identyfikatora sesji)'
    console.log(`Tryb pracy ss: WLACZONY dla ${scope}.`)
  } else if (action === 'off') {
    deactivate({ sessionId })
    console.log('Tryb pracy ss: WYLACZONY. Stan wyczyszczony.')
  } else if (action === 'status') {
    const current = status({ sessionId, now })
    console.log(`Tryb pracy ss: ${current.active ? 'AKTYWNY' : 'NIEAKTYWNY'}.`)
  } else {
    console.error('Uzycie: node hooks/mode.mjs on|off|status')
    process.exit(1)
  }
} catch (error) {
  console.error(`Tryb pracy ss: nie udalo sie wykonac "${action}" (${error.message}).`)
  process.exit(1)
}
