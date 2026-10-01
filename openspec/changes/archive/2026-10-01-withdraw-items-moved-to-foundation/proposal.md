# Withdraw the plugin items that moved to the agentic-system foundation

## Why

Five plugin items now live in the 200IQ LABS agentic-system foundation: the decision sweep and the two walk-throughs became the decisions and understanding modes of the foundation's task-help skill (`sa-task-help`), the task-delegation skill became its operator-actions section, and the orientation command became the foundation skill `sa-orientation`. While the plugin still ships them, a repository with the foundation sees two routes to the same work, and the plugin's entries take the choice away from the foundation's skill: in a triggering test on 29.09 the foundation skill was picked for 3 of 14 operator utterances with the plugin's commands in the skill list, and for 9 of 14 without them. The foundation's rule is that what moves into it leaves the plugin, so each item reaches a repository one way only — `ingest` went the same way on 29.09.

The working mode cannot simply lose the files: its reply skeleton and stop list route every decision to `/ss:decisions` and every user action to `ss:task-delegation`. It needs a new routing target that works both with and without the foundation, because the plugin is public and also runs in repositories that do not have it.

## What Changes

- **Removed commands**: `/ss:decisions`, `/ss:explain-design`, `/ss:explain-diff`, `/ss:orientation`. **BREAKING** for anyone invoking them.
- **Removed skill**: `ss:task-delegation`, with its evals. **BREAKING** for anyone relying on it.
- **The working mode routes to the foundation when it is there.** A decision goes to the foundation's task-help skill (`sa-task-help`, decisions mode) when the session has it; without it, the decisions are raised in the reply one at a time, recommendation first. A user action goes to the operator-actions part of the same skill when the session has it — its portion rules apply; without it, exactly one task is handed over in the reply, with what to do and how completion will be recognised.
- Rule texts (`hooks/rules/10-reply-skeleton.md`, `hooks/rules/30-stop-list.md`), `README.md` and `CHANGELOG.md` are updated accordingly. The hook machinery is untouched.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `agent-working-mode`: the closed list of `CO DALEJ` endings routes a decision and a user action to the foundation's task-help skill when the session has it, and keeps a self-contained fallback for sessions without it.
- `task-delegation-protocol`: removed — the capability lives in the foundation's task-help skill (operator actions).
- `session-orientation`: removed — the capability lives in the foundation skill `sa-orientation`.

## Impact

- `commands/decisions.md`, `commands/explain-design.md`, `commands/explain-diff.md`, `commands/orientation.md` — deleted.
- `skills/task-delegation/` — deleted.
- `hooks/rules/10-reply-skeleton.md`, `hooks/rules/30-stop-list.md` — routing rewritten.
- `README.md`, `CHANGELOG.md` — the removed items and the new routing.
- `skills/review-loop/evals/README.md` — no longer cites the removed skill as the precedent for a limitation.
- After publishing: `claude plugin update ss@shared-skills` on every station, and a new session, for the removal to reach the agent.
