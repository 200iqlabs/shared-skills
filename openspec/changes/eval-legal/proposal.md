## Why

The legal skill was migrated from Claude Projects and is fully implemented, but contains hardcoded references to specific companies (PLSoft JDG, 200IQ Labs PSA) and a specific person (Pawel Lipowczan). It also hasn't been evaluated through the skill-creator process (Agent Skills 2.0). linkedin-content and tax-advisor already passed this audit.

The project has adopted a **context layer architecture** (see change: `context-layer-architecture`) that separates user-specific data into `context/` (gitignored) and keeps domain knowledge in `references/`. The legal skill needs to be migrated to this architecture before evaluation.

## What Changes

- **Context layer migration** — move user-specific data from `references/` to `context/` templates. Specifically: merge `entity-context.md` + `document-backlog.md` into `context/legal-entities.md`. Keep domain knowledge files (`legal-scope.md`, `workflow-draft.md`, `workflow-brief.md`) in `references/`. Remove hardcoded entity names from SKILL.md and replace with references to `context/legal-entities.md`. Add `## Context Dependencies` section to SKILL.md.
- **Skill evaluation** — run skill through `/skill-creator` eval process (test prompts in Polish, with-skill vs without-skill baseline, grading, benchmark)
- Apply cosmetic fixes if review reveals issues
- Optimize description for triggering accuracy
- Update EVAL-PLAYBOOK.md status

## Dependencies

- **`context-layer-architecture`** — MUST be implemented first. The context migration part of this change relies on `context/` directory, templates infrastructure, and environment-setup skill being in place.

## Scope

- `skills/legal/SKILL.md` — context migration (replace hardcoded entities with context/ references, add Context Dependencies section), description optimization, minor fixes
- `skills/legal/references/entity-context.md` — remove (content migrated to context/legal-entities.md template)
- `skills/legal/references/document-backlog.md` — remove (content migrated to context/legal-entities.md template)
- `skills/legal/references/legal-scope.md` — keep in references/ (domain knowledge), audit for company-specific references
- `skills/legal/references/workflow-draft.md` — keep in references/ (domain knowledge)
- `skills/legal/references/workflow-brief.md` — keep in references/ (domain knowledge)
- `context/templates/legal-entities.template.md` — create (if not already created by context-layer-architecture)
- `skills/legal-workspace/iteration-1/` — eval artifacts (eval_set.json, grading.json, benchmark.json, timing.json, feedback.json)
- `docs/EVAL-PLAYBOOK.md` — status update

## Non-goals

- Full rewrite of the skill — this is context migration + audit, not a rebuild
- Adding new reference files or work modes
- Changing the skill's core behavior, risk signaling system, or boundaries
- Creating the context layer architecture itself (separate change)
- Building the environment-setup skill (separate change)
