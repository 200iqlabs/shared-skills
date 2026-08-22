# Tasks — restructure-working-mode-reply-skeleton

## 1. Rule texts

- [x] 1.1 Rewrite `hooks/rules/00-reply-style.md` to the modified contract: Polish, business meaning, describe-by-effect instead of parenthesised glosses, technical detail (tool names, paths, commands, identifiers) only on request or when the user cannot act without it; the code/commit/PR exemption stays. Verify the file no longer mentions glossing and states both entry routes for technical vocabulary.
- [x] 1.2 Replace `hooks/rules/10-orientation-header.md` with a single reply-skeleton rule file covering: the three mandatory sections `KONTEKST` / `WYNIK` / `CO DALEJ` in constant order and bold labels, the optional `OTWARTE TEMATY`, the section contracts (KONTEKST = the session's task in 1–2 business sentences, stable; WYNIK = verified facts only, failures plainly; OTWARTE TEMATY = non-blocking observations, omitted when empty), applicability to every turn-ending reply with no agent judgment, and the mid-turn status-note exemption. Verify against the five ADDED requirements in the delta spec.
- [x] 1.3 Delete `hooks/rules/20-header-triggers.md`. Verify the rules directory holds no trigger list and that `node hooks/session-start.mjs` output (see 2.1) references no triggers.
- [x] 1.4 Encode the four closed `CO DALEJ` endings in the skeleton rule file: decision → invoke the decision-sweep flow automatically in the same turn (never prose questions); one user task → task-delegation protocol; external wait → name it, state nothing is needed; done → exact phrase „Sesję można zamknąć.". Verify the list is closed (a fifth ending is explicitly disallowed).
- [x] 1.5 Align item 5 wording in `hooks/rules/30-stop-list.md` with the automatic routing (handover happens via the CO DALEJ ending, not as a separate judgment). Verify the five stop reasons themselves are unchanged.
- [x] 1.6 Rewrite `hooks/rules/reminder.md` to restate the skeleton and describe-by-effect contract in no more space than the current reminder occupies. Verify by line count against the current file (4 lines).

## 2. Hook scripts

- [x] 2.1 Update the compaction notice in `hooks/session-start.mjs` (currently "…carries the orientation header (trigger 2)") to state that the first reply after compaction carries the skeleton like any other turn-ending reply. Verify by grepping the file for "trigger" (no hits) and "skeleton"/section labels (present).
- [x] 2.2 Review `hooks/selftest.mjs` assertions that quote rule text (the compaction check asserts on "compacted" and "does not weaken") and update any that break. Verify `node hooks/selftest.mjs` exits green.

## 3. Command and docs

- [x] 3.1 Update `commands/working-mode.md`: activation step 4 must describe the first reply's skeleton obligation instead of "it carries the orientation header"; the Rules section stays otherwise intact. Verify no mention of the old header remains anywhere in `commands/`.
- [x] 3.2 Update the mode's description in `README.md` (and the `/ss:working-mode` row if it names the header) to name the three sections. Verify by grepping README for "Gdzie jesteśmy" (no hits).
- [x] 3.3 Record the change in `CHANGELOG.md`. Verify the entry names the skeleton and the removal of the conditional header.

## 4. Verification in a real session

- [ ] 4.1 Run a session with the mode on and confirm: a trivial one-sentence exchange still carries all three sections; a multi-step piece of work emits mid-turn notes without the skeleton and a final reply with it.
- [ ] 4.2 Confirm the decision ending: create a situation with an open decision and verify the same turn emits the skeleton and then enters the decision flow (one question, recommendation first) without asking permission to do so.
- [ ] 4.3 Confirm the done ending: finish a task and verify the reply closes with the exact phrase „Sesję można zamknąć.".
- [ ] 4.4 Confirm describe-by-effect: provoke a reply that previously would have glossed a term and verify the term is replaced by a plain-Polish description, with technical names appearing only after an explicit request.
- [ ] 4.5 Confirm persistence: late in the same session, verify replies still carry the skeleton (the per-message reminder is doing its job).

## 5. Release

- [ ] 5.1 Merge to main and update the installed plugin from the marketplace (never edit the cache copy under `~/.claude/plugins/cache/` directly). Verify a **fresh** session with the mode on emits the skeleton — sessions already running keep the old rules until restarted.
