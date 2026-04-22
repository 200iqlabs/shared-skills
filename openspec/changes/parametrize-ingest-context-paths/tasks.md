## 1. Skill instructions

- [ ] 1.1 Update `skills/ingest/SKILL.md` Prerequisites section: replace hardcoded `context/plsoft/clients/_index.md` and `context/plsoft/projects/_index.md` references with a lookup into `## Context Paths` section of the project's `CLAUDE.md`
- [ ] 1.2 Update `skills/ingest/SKILL.md` Processing Flow Step 1 and Step 5 (Archive): remove all `CLIENT/...` example paths that implicitly assume `context/plsoft/clients/`; rewrite to use abstract placeholders (`<clients_path>/<NAME>/...`) and reference the Context Paths lookup
- [ ] 1.3 Update `skills/ingest/SKILL.md` Step 7 (Update indexes): same abstraction for `clients/_index.md` and `projects/_index.md` references
- [ ] 1.4 Add a new "Context Paths contract" subsection near the top of `skills/ingest/SKILL.md` that documents: the `## Context Paths` section format, scope types the skill reads (`clients`, `projects`), multi-path behavior (process all matches), missing-section error text with example
- [ ] 1.5 Grep `skills/ingest/` for any remaining `plsoft` occurrences; remove or replace with abstract wording

## 2. Consumer migration docs (agentic-ai-private)

- [ ] 2.1 In `design.md`, confirm the companion prompt text is final (already included). No code change in this repo.
- [ ] 2.2 Add a note to `README.md` or plugin changelog (if one exists) flagging that downstream `CLAUDE.md` must declare `## Context Paths` — breaking change for consumers

## 3. Specs

- [ ] 3.1 Verify `openspec/changes/parametrize-ingest-context-paths/specs/context-paths-config/spec.md` is correct (already written in this change; no further change needed here — this task is a placeholder for review during apply)

## 4. Verification

- [ ] 4.1 Walk through `skills/ingest/SKILL.md` as a fresh reader: confirm no PLSoft-specific strings remain, and the instructions are self-contained (a consumer can follow them given only the `## Context Paths` section in their `CLAUDE.md`)
- [ ] 4.2 Dry-run trace: with a hypothetical `## Context Paths` containing two `prospects:` paths, confirm the instructions walk through scanning both correctly
- [ ] 4.3 Dry-run trace: confirm the error path when `## Context Paths` is absent matches Requirement "Missing Context Paths section produces actionable error" in the spec

## 5. Ship

- [ ] 5.1 Commit in `shared-skills` with message `feat(ingest): parametrize context paths via CLAUDE.md convention`
- [ ] 5.2 After merge, in `agentic-ai-private`: update submodule pointer (`git submodule update --remote shared-skills`), apply the companion prompt from `design.md`, verify `/ingest` works on one real client with an inbox file
- [ ] 5.3 Update submodule pointer in `agentic-ai-system` as a prerequisite for starting change `adopt-client-project-structure`

## 6. Archive

- [ ] 6.1 After verification in both consumer repos, run `/opsx:archive parametrize-ingest-context-paths` to move the change to archived state and sync the new spec into `openspec/specs/context-paths-config/`
