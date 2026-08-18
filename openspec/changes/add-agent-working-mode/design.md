## Context

See `proposal.md` — Why. Four facts constrain the approach:

1. **A one-shot instruction decays.** The `caveman` plugin solved the same delivery problem and its own source documents why a `SessionStart` injection is not enough: *"The SessionStart hook injects the full ruleset once, but models lose it when other plugins inject competing style instructions every turn. This keeps caveman visible in the model's attention on every user message."* It therefore re-injected a short reminder on `UserPromptSubmit`. Any design that relies on a command run once at session start inherits the decay it describes.
2. **Native output styles are gone.** The `explanatory-output-style` plugin exists specifically to recreate a deprecated built-in output style as a `SessionStart` hook. The native route for "change how every reply is written" is closed; hooks are what remains.
3. **`ss` ships no hooks today.** It has `commands/` and `skills/` only. This change adds a `hooks/` directory, which is the first time the plugin reaches past its own skills into the harness.
4. **`/ss:decisions` already encodes the target interaction shape** — one item at a time, Polish, plain language, a progress counter (`DECYZJA X z N`), recommendation first. The task-delegation protocol is the same shape with different content.

## Goals / Non-Goals

**Goals:**
- Rules survive a long session without the user re-invoking anything.
- The user can tell at a glance, mid-transcript, which thread a session is on.
- Stopping to ask the user becomes a bounded, enumerable event rather than a judgement call.
- The whole mechanism can be switched off in one move, and leaves nothing running when it is.

**Non-Goals:**
- Replacing `/goal` / `ss:prepare-goal` for bounded autonomous runs. Those remain the heavy-duty anti-stall tool; this is the always-on lightweight layer.
- Changing `/ss:decisions`. This change routes to it and copies its shape; it does not modify it.
- Enforcing a reply style in English-language projects. Off by default is a feature, not a limitation.

## Decisions

### D1 — Session-scoped switch, reinforced per turn

The user turns the mode on with a command; hooks keep it alive for the rest of the session.

*Alternatives considered.* **Always on** — no command to remember, but forces Polish and one house style into every project including English-language repositories and shared work. **Always on with a per-project opt-out** — most convenient day to day, but the most moving parts to maintain and the hardest to diagnose when it misbehaves. **Command only, no hooks** — zero configuration footprint, but this is exactly the decay documented in Context (1); the user would experience it as the mode "wearing off" mid-session with no signal.

### D2 — Hooks ship inside the plugin, never written into `~/.claude/settings.json`

The hook manifest lives in the plugin's own `hooks/` directory, so disabling or removing the plugin genuinely stops it.

*Rationale.* This is a direct lesson from the removal that preceded this change. `caveman` was marked disabled in `enabledPlugins` yet kept running, because its installer had also written standalone entries into the user's global settings and dropped scripts into `~/.claude/hooks/`. Turning the plugin off touched none of that. Cleanup required editing global settings, deleting six scripts, a state file, thirteen orphaned temporary files, two cache directories and two registry entries. A plugin whose off switch does not actually switch it off is worse than one with no off switch, because the user believes the field is clear when it is not.

### D3 — Three artifacts, not one

Working mode, task-delegation protocol, and orientation command ship together.

*Alternatives considered.* **Mode only**, with task delegation folded in as a rule — lighter, but the protocol could not then be invoked deliberately. **Mode plus task protocol**, dropping the orientation command on the theory that a good reply style makes it unnecessary — rejected because the orientation command serves a second, independent need the style cannot: re-entering a session after hours away, where the problem is not comprehension of the last reply but recovery of the whole thread.

### D4 — Fixed-shape orientation header, emitted selectively

The header has a constant two-line shape (`Gdzie jesteśmy:` / `Po co:`) and appears at enumerated moments rather than on every reply.

*Rationale.* A constant shape is what makes scroll-back work — the eye finds it without reading. Free-form prose carrying the same information blends into the reply and cannot be scanned for, which defeats the multi-session use case that motivates it. Emitting it on every reply was rejected as noise during rapid back-and-forth.

### D5 — The "when" is a closed list, not a judgement

The header fires on: first reply in a session; first reply after a resume or a context compaction; completion of a multi-step piece of work; any reply that asks a question, delegates a task, or requests a decision; a change of topic or stage; explicit user request. Outside the list, no header.

*Rationale.* D4 leaves open who decides what counts as important. Delegating that to the agent's judgement reintroduces the failure this change exists to fix — the agent already judged its replies clear while the user did not understand them. The same reasoning drives the anti-stall rule: both are expressed as enumerated lists precisely because the agent's sense of "important enough" is the unreliable component. A closed list is also observable: the user can notice it stopped working.

*Alternative considered.* Inverting the default — header always, suppressed only for an obvious short exchange — errs toward excess rather than absence and is a reasonable fallback if the list proves too narrow in use.

### D6 — Remove the competing style plugin rather than override it

`explanatory-output-style` was removed from the user's configuration rather than overridden by a precedence rule in the new mode.

*Rationale.* It instructs the agent to add educational asides and explicitly permits exceeding normal reply length — the opposite of this change's contract. Two live style instructions in one context is the exact configuration that produced the original symptom (fragmented *and* long *and* technical). A precedence rule is brittle: when it stops holding there is no error, only a gradual drift back, and nothing in the transcript says which instruction won.

### D7 — State keyed by session, with a global fallback

Mode state is keyed by session identifier where the hook payload provides one, falling back to a single global flag otherwise.

*Rationale.* "Session-scoped" (D1) is a lie if the state file is global: switching the mode on in one window would switch it on in every parallel session, which directly contradicts the user's working pattern of several concurrent sessions. `caveman` used a single global flag and left thirteen orphaned temporaries behind it; both are avoidable.

### D8 — Task delegation is a skill, not a command

The agent reaches for it when it has work to hand over; the user does not have to know it exists.

*Rationale.* The trigger is the agent noticing it cannot proceed alone. A command would require the user to detect that situation and name it — the same burden this change removes. The orientation command stays a command because there the user is the one who notices.

## Risks / Trade-offs

- **A hook running on every user message adds latency on Windows.** → Mirror the proven shape: a small script that reads one state file and exits immediately when the mode is off, with a short timeout, emitting nothing rather than failing loudly.
- **The user forgets to switch the mode on and concludes it does not work.** → The switch command confirms in one line; consider a visible indicator, noting that the statusline slot is now free.
- **Reinstalling `caveman` or `explanatory-output-style` silently breaks this.** → The switch command can check for competing style hooks when it runs and say so, rather than letting the user rediscover it as unexplained drift.
- **The anti-stall list is too permissive and the agent barrels past something it should have raised.** → The permitted stop reasons stay in one file and start conservative: irreversible or production actions, spending or outbound sending, missing access the agent cannot obtain, and a genuine fork in requirements.
- **The trigger list (D5) proves too narrow and the header disappears when wanted.** → D4's alternative (header by default, suppressed for short exchanges) is a one-line inversion, so this is cheap to correct after real use.
- **Polish leaks into projects where it is unwanted.** → Off by default (D1); the mode governs prose to the user only, never code, commits or pull requests.

## Migration Plan

1. Land the three artifacts in `shared-skills`; the user updates the `ss` plugin.
2. Switch on in one session, work normally, and judge by whether the thread is recoverable after a break.
3. Tune the two lists (stop reasons, header triggers) from real use — they are the parts expected to move.

Rollback is switching the mode off, or disabling the plugin. Per D2 that is sufficient by construction; nothing survives outside the plugin. The preceding cleanup of `caveman` and `explanatory-output-style` is already done and is not part of this rollback.

## Open Questions

- Exact wording of the two header labels — cosmetic, settles in use.
- Whether the task-delegation skill should also be invocable as a command for the case where the user wants to pull outstanding work rather than wait for it to be offered.
- Whether a "no header for N turns" fallback is worth adding on top of the D5 list.
