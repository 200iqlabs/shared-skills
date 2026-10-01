# Tasks — withdraw-items-moved-to-foundation

## 1. Remove the items

- [x] 1.1 Delete `commands/decisions.md`, `commands/explain-design.md`, `commands/explain-diff.md` and `commands/orientation.md`. Verify `commands/` holds only `working-mode.md` and `slides/`.
- [x] 1.2 Delete `skills/task-delegation/` with its evals. Verify no tracked file under `skills/task-delegation/` remains.

## 2. Reroute the working mode

- [x] 2.1 Rewrite endings 1 and 2 of `CO DALEJ` in `hooks/rules/10-reply-skeleton.md`: a decision goes to the foundation's task-help skill (`sa-task-help`, decisions mode) when the session has it, otherwise one at a time in the reply with the recommendation first; an action goes to that skill's operator-actions part when present, otherwise exactly one task with what to do and how completion is recognised. Verify against the MODIFIED requirement in the delta spec.
- [x] 2.2 Align item 5 of `hooks/rules/30-stop-list.md` with the same routing. Verify the five stop reasons themselves are unchanged.
- [x] 2.3 Run `node hooks/selftest.mjs`. Verify it exits green.

## 3. Docs and checks

- [x] 3.1 Remove the five items from `README.md` and record the removal and the new routing in `CHANGELOG.md` under `[Unreleased]`.
- [x] 3.2 Stop citing the removed skill in `skills/review-loop/evals/README.md`.
- [x] 3.3 Search the tracked files outside `openspec/changes/archive/` and the dated `CHANGELOG.md` entries for `/ss:decisions`, `explain-design`, `explain-diff`, `task-delegation` and `orientation` command references. Verify no live file points to a removed item.
- [x] 3.4 Run `claude plugin validate .` and `openspec validate withdraw-items-moved-to-foundation --strict`. Verify both pass.
