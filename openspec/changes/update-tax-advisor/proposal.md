## Why

The tax-advisor skill has already passed eval (Agent Skills 2.0, commit 2eee495). However, it still contains hardcoded business form assumptions in SKILL.md (JDG and PSA specifics) and references `context/` and `company/` directories that don't exist yet. After the context-layer-architecture change lands, this skill needs standardization to use the new context layer properly.

**Dependency:** Requires `context-layer-architecture` to be implemented first.

## What Changes

- Replace hardcoded JDG/PSA context in SKILL.md with reference to `context/legal-entities.md`
- Standardize context/ path references (remove `company/` fallback)
- Add `## Context Dependencies` section to SKILL.md
- Add graceful fallback for missing context files
- All reference files stay in place (pure domain knowledge)

## Capabilities

- tax-advisor-migration — migrate skill to context layer architecture

## Scope

- `skills/tax-advisor/SKILL.md` — externalize entity context, add context deps, standardize paths
- `context/templates/legal-entities.template.md` — may need updates if not already created by context-layer-architecture

## Non-goals

- Re-evaluating the skill (already passed eval)
- Changing tax domain knowledge or reference files
- Modifying skill description or triggering behavior
