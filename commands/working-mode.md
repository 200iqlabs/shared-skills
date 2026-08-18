---
description: Switch the ss working mode on or off for this session — Polish replies, orientation header, closed stop list. Off by default.
argument-hint: "[on|off|status]"
---

# Working mode

Switches the `ss` working mode for **this session only**. While it is on, the plugin's hooks
inject the rule set at session start and a short reminder on every user message, so the rules
survive a long session and a context compaction.

Argument: `$ARGUMENTS`.

- empty, `on`, `wlacz`, `włącz` → activate
- `off`, `wylacz`, `wyłącz` → deactivate
- `status` → report the current state and stop

## Activate

1. Run the switch:

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/hooks/mode.mjs" on
   ```

   If it fails, say so plainly and stop — do not pretend the mode is on.

2. **Check for a competing always-on instruction** before confirming. Gather the facts:

   ```bash
   cat ~/.claude/settings.json 2>/dev/null | head -80
   ls ~/.claude/hooks/ 2>/dev/null
   ```

   Something counts as a **conflict** only if it governs **how replies are written** — language,
   length, tone, verbosity, or a mandated reply structure. Known cases: the `caveman` hooks
   (terse fragments, dropped words) and the `explanatory-output-style` plugin (educational
   asides, explicit permission to exceed normal length). A configured `outputStyle`, or a
   `SessionStart` / `UserPromptSubmit` hook that injects style instructions, counts too.

   Something does **not** count merely because it also injects on every message. Safety and
   policy injections (for example `security-guidance`) share the same per-turn channel as this
   mode's reminder but say nothing about how to write — they coexist with it. Do not report them
   as conflicts.

   If you find a genuine conflict: name it, say in one sentence what it demands, and say that the
   two instructions will fight and this one may lose. Do not disable anything yourself — that is
   the user's call.

3. Confirm in **one line, in Polish**, and state the scope explicitly, e.g.:

   > Tryb pracy ss włączony — tylko w tej sesji. Wyłączasz przez `/ss:working-mode off`.

   Add the conflict warning underneath only if step 2 found one.

4. **Start obeying the rules in this very reply.** The hook fires on the next user message, so
   the confirmation itself is yours to get right: Polish, short, business meaning first. This is
   your first reply under the mode, so it carries the orientation header.

The rules you are now under are the files in `${CLAUDE_PLUGIN_ROOT}/hooks/rules/`. Read them if
they are not already in your context.

## Deactivate

1. Run:

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/hooks/mode.mjs" off
   ```

2. Confirm in one Polish line that the mode is off and the state is cleared — from the next
   message on, nothing is injected. Drop the rules immediately; do not keep writing under them
   out of habit.

## Status

Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/hooks/mode.mjs" status
```

Report the result in one Polish line and stop.

## Rules

- The mode covers **this session**. Other sessions running in parallel are untouched, including
  ones open in the same directory.
- Never write hook entries into `~/.claude/settings.json`, and never copy scripts into
  `~/.claude/hooks/`. Everything ships inside the plugin so that disabling the plugin genuinely
  stops it.
- The reply-style contract governs prose addressed to the user. Code, commit messages, PR bodies
  and file contents stay as they were.
