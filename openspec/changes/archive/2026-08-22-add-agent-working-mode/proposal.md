## Why

Replies from the agent are hard to follow: they mix jargon, technical detail and English filler, and they do not say what the work is *for*. The user runs several Claude Code sessions in parallel; returning to one after a break means re-reading the transcript to recover the thread. Separately, the agent stops mid-task to ask about things it could resolve itself, and when it genuinely does need the user it dumps several requests at once.

Two competing style injections were the immediate cause and have now been removed from the user's configuration: the `caveman` hooks (terse fragments, dropped words) and the `explanatory-output-style` plugin (educational asides, explicit permission to exceed normal length). Nothing currently fills that space, so the behaviour is undefined rather than fixed.

## What Changes

- **New session-scoped working mode**, switched on with a command and kept alive by plugin-shipped hooks. Off by default so English-language projects are unaffected.
- **Reply style contract**: Polish, short, business meaning first, no unglossed jargon.
- **Orientation header** (`Gdzie jesteśmy` / `Po co`) emitted on a *closed list* of moments, not on the agent's judgement of what is important.
- **Anti-stall rule** expressed as a closed list of permitted stop reasons; everything outside the list means continue. Includes the known false blockers (a crashed hook reported as a refusal, a permission classifier reported as an impossibility, reporting an intermediate result and waiting, stopping because of uncertainty instead of stating an assumption).
- **New task-delegation protocol** as a skill: the agent hands the user one task at a time, only tasks it cannot perform itself, and waits for confirmation before the next — a sibling of the existing `/ss:decisions` command, reusing its one-at-a-time shape.
- **New orientation command**: on demand, restate what is being worked on, why, and what (if anything) is wanted from the user. Serves both "I do not understand this reply" and "I am returning to this session after a break".
- **First hooks in the `ss` plugin.** Until now `ss` shipped only skills and commands; it will now also influence the harness. Not breaking, but it widens the plugin's blast radius and therefore requires an explicit off switch.

## Capabilities

### New Capabilities

- `agent-working-mode`: the session-scoped switch, the background reinforcement that keeps the rules alive across a long session, the reply-style contract, the orientation-header trigger list, and the anti-stall stop list.
- `task-delegation-protocol`: how the agent hands work to the user — one at a time, only what it cannot do itself, confirm-then-continue.
- `session-orientation`: the on-demand command that restates the current thread, its purpose, and any outstanding ask.

### Modified Capabilities

None. `/ss:decisions` is a routing target for this change but its own behaviour is unchanged, and it has no spec under `openspec/specs/` today.

## Impact

**New files in this repo**
- `commands/` — the mode switch and the orientation command
- `skills/` — the task-delegation skill
- `hooks/` — hook manifest plus script(s); a directory the plugin does not have yet

**Behavioural surface**
- Applies to every project the user opens once the mode is switched on, so the switch must be per-session and unambiguous.
- Routes decisions to the existing `/ss:decisions` rather than duplicating it.
- Coexists with `ss:prepare-goal` / `ss:prepare-openspec-goal`: those drive a bounded autonomous loop, this is the always-on lightweight version.

**Constraints observed**
- Hooks run on Windows, on every user message when active. They must be fast, fail silently, and emit nothing at all when the mode is off.
- The mode must not fight another style injection. This change assumes `caveman` and `explanatory-output-style` stay removed; reinstating either reintroduces the original problem.
