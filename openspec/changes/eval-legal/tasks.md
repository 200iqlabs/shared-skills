**Dependency**: Tasks in section 1-3 require `context-layer-architecture` change to be completed first (context/ directory, templates, environment-setup skill must exist).

## 1. Migrate user data to context/

- [ ] 1.1 Verify `context-layer-architecture` is implemented — `context/` directory, `context/templates/legal-entities.template.md`, and environment-setup skill exist
- [ ] 1.2 Remove `references/entity-context.md` (content now covered by context/templates/legal-entities.template.md)
- [ ] 1.3 Remove `references/document-backlog.md` (content merged into context/templates/legal-entities.template.md)
- [ ] 1.4 Audit `references/legal-scope.md` for company-specific references (PLSoft, 200IQ Labs, Lipowczan) — remove any found
- [ ] 1.5 Audit `references/workflow-draft.md` and `references/workflow-brief.md` for company-specific references — remove any found

## 2. Update SKILL.md for context layer

- [ ] 2.1 Rewrite SKILL.md title — from "Asystent Prawny — PLSoft & 200IQ Labs" to a generic Polish legal assistant title for IT entrepreneurs
- [ ] 2.2 Rewrite `description` frontmatter — remove PLSoft/200IQ Labs/Pawel Lipowczan, generalize entity types (JDG/PSA → "jednoosobowa dzialalnosc, spolki"), keep aggressive triggering style
- [ ] 2.3 Rewrite SKILL.md body — replace hardcoded entity references with references to `context/legal-entities.md`
- [ ] 2.4 Update `/owu` mode description from "PLSoft OWU" to "OWU dla podmiotu uzytkownika"
- [ ] 2.5 Remove all remaining company-specific references from body sections
- [ ] 2.6 Add `## Context Dependencies` section with table declaring `context/legal-entities.md` (Recommended) and `context/company.md` (Recommended), plus graceful degradation instructions

## 3. Verify context migration

- [ ] 3.1 Grep all files in `skills/legal/` for "PLSoft", "200IQ", "Lipowczan" — confirm zero matches
- [ ] 3.2 Confirm all six work modes are present (`/analiza`, `/draft`, `/brief`, `/owu`, `/checklist`, `/porownanie`)
- [ ] 3.3 Confirm risk signaling system is unchanged
- [ ] 3.4 Confirm data safety rules and `[DO UZUPELNIENIA]` pattern are intact
- [ ] 3.5 Confirm `references/` only contains domain knowledge files: legal-scope.md, workflow-draft.md, workflow-brief.md

## 4. Run skill-creator eval

- [ ] 4.1 Run `/skill-creator` on the migrated `skills/legal/SKILL.md` — generate eval_set.json with >= 5 test prompts in Polish covering contracts, RODO, IP, corporate law, compliance
- [ ] 4.2 Run with-skill vs without-skill baseline comparison and generate grading.json
- [ ] 4.3 Use `--static` flag for generate_review.py (Windows encoding workaround)
- [ ] 4.4 Generate benchmark.json — review scores and identify issues
- [ ] 4.5 If triggering accuracy < 80%, manually optimize description and re-run eval (run_loop.py doesn't work on Windows)
- [ ] 4.6 Apply cosmetic fixes if review reveals quality issues
- [ ] 4.7 Workspace: `skills/legal-workspace/iteration-1/`

## 5. Finalize

- [ ] 5.1 Update `docs/EVAL-PLAYBOOK.md` — set legal skill status to "Done" with commit hash
- [ ] 5.2 Commit all changes
