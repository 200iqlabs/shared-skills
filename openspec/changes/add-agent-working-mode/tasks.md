Open questions from `design.md` resolved before writing this list:

- **Should the task-delegation protocol also be invocable as a command?** No. `session-orientation` already gives the user a pull path that routes to the protocol, so a second entry point would be redundant. D8 stands: skill only. Revisit only if the orientation route proves too indirect in use.
- **Header label wording** and the **"no header for N turns" fallback** stay deferred. Neither changes a spec, the approach, or this list.

## 1. Hook plumbing

- [x] 1.1 Create `hooks/` in the plugin root with a hook manifest — the plugin's first hooks. Wire nothing into `~/.claude/settings.json` (design D2); disabling the plugin must stop everything.
- [x] 1.2 Implement session-keyed mode state: keyed by session identifier where the hook payload carries one, single global flag as fallback (D7). Clean up the state file on deactivation so no orphans accumulate.
- [x] 1.3 Implement the session-start hook: emit the full rule set when the mode is active for that session, emit nothing when it is not.
- [x] 1.4 Implement the per-turn reinforcement hook: short reminder on every user message while active, nothing at all while inactive.
- [x] 1.5 Harden both hooks for Windows: fast exit when the state file is absent, short timeout, silent failure, no output on any error path.
- [x] 1.6 Verify the off path end to end — mode off, then plugin disabled — and confirm no injection reaches the session in either case (`agent-working-mode`, "Deactivation leaves nothing running").

## 2. Working-mode rules

- [x] 2.1 Write the reply-style contract: Polish, business meaning first, glossing of unavoidable terms, and the explicit carve-out for code, commits, PR bodies and other non-user audiences.
- [x] 2.2 Write the orientation-header definition: two constant labelled lines, identical layout across every emission.
- [x] 2.3 Write the header trigger list as a closed enumeration of the six conditions, with an explicit prohibition on emitting by the agent's own judgement of importance (D5).
- [x] 2.4 Write the stop list as a closed enumeration of permitted stop reasons, with uncertainty explicitly excluded and the state-an-assumption-and-continue rule spelled out.
- [x] 2.5 Write the obstruction-diagnosis rule: distinguish a crashed hook, a permission classifier, and a genuine impossibility before reporting a blocker; confirm an absence through a source that reports a different signal.
- [x] 2.6 Keep the two lists (2.3, 2.4) in one file each so they can be tuned from use without touching anything else.

## 3. Mode switch command

- [x] 3.1 Create the command that activates and deactivates the mode for the current session, following the existing `commands/` conventions (English filename, Polish user-facing text).
- [x] 3.2 On activation, confirm in one line and state that the mode covers this session only.
- [x] 3.3 On activation, detect any other always-on style or verbosity instruction in effect, name it, and warn that the two will conflict (`agent-working-mode`, "Competing always-on style instructions are surfaced").
- [x] 3.4 On deactivation, confirm and clear the state.

## 4. Task-delegation skill

- [x] 4.1 Run `/skill-creator` for the task-delegation skill — required by the repo's mandatory workflow; do not hand-write `SKILL.md`.
- [x] 4.2 Model the interaction on `commands/decisions.md`: one item per turn, position-of-total counter, plain Polish framing before the ask, no batched lists.
- [x] 4.3 Encode the delegation filter — only work the agent cannot perform itself; convenience, uncertainty and a wish for confirmation are not grounds.
- [x] 4.4 Encode confirm/question/decline handling: a question keeps the protocol on the current task; only confirmation, declining or deferral advances it.
- [x] 4.5 Encode set re-derivation when an answer makes a later task moot or surfaces a new one, including renumbering and telling the user.
- [x] 4.6 Encode stage bounding and the resume-on-exhaustion rule — after the last task the agent continues its own work rather than waiting.
- [x] 4.7 Encode the split from decisions: a choice routes to the decision sweep, an action stays here.
- [x] 4.8 Generate at least 5 test prompts and run evals; iterate the description until triggering accuracy reaches the repo's ≥ 80% bar.

## 5. Session-orientation command

- [x] 5.1 Create the orientation command following the existing `commands/` conventions.
- [x] 5.2 Encode the four things an orientation answers: what, what for, where it has got to, what is wanted from the user — including the explicit "nothing is needed, continuing with X" case.
- [x] 5.3 Encode the summary-not-replay rule: length follows the state of the work, not the number of steps taken.
- [x] 5.4 Encode routing — decisions to the decision sweep, tasks to the delegation skill, neither listed inline.
- [x] 5.5 Encode the verified-state rule: unverified work reported as unverified, skipped scope named as skipped.
- [x] 5.6 Confirm the command works with the working mode inactive (`session-orientation`, "Requested in a session without the working mode").

## 6. Verification

- [x] 6.1 Run a real session with the mode on: confirm the header appears at each of the six trigger conditions and at none of the short exchanges between them.
- [ ] 6.2 Confirm persistence late in a long session and across a context compaction — the failure mode this change exists to prevent.
- [x] 6.3 Confirm two concurrent sessions are independent: activating in one leaves the other untouched (D7).
- [x] 6.4 Exercise the delegation protocol with a set of at least three tasks, including one that becomes moot mid-run, and confirm nothing is ever batched.
- [x] 6.5 Exercise the stop list against a case the agent would previously have stopped on but should now resolve itself.
- [x] 6.6 Confirm code, commit messages and PR bodies written while the mode is active are unaffected by the reply-style contract.

## 7. Documentation and release

- [x] 7.1 Add both commands to the command table in `README.md`, matching the existing row format.
- [x] 7.2 Add the new skill to the skill listing in `README.md`.
- [x] 7.3 Document the `hooks/` directory in `CLAUDE.md` — the plugin's architecture section currently describes skills, commands, tools, templates and context only.
- [x] 7.4 Record the change in `CHANGELOG.md`.
- [x] 7.5 Note in the user-facing documentation that the mode conflicts with always-on style plugins, naming `explanatory-output-style` and `caveman` as the known cases.
