## Why

The linkedin-content skill has already passed eval (Agent Skills 2.0, commit f223474). However, it still contains hardcoded personal identity in SKILL.md ("Pawel Lipowczan", "Technical Lead @ Automation House") and user-specific content in references/example-posts.md. After the context-layer-architecture change lands, this skill needs migration to use the context layer.

**Dependency:** Requires `context-layer-architecture` to be implemented first.

## What Changes

- Remove hardcoded author identity from SKILL.md, reference `context/author-profile.md`
- Move `references/example-posts.md` content to `context/templates/author-profile.template.md`
- Add `## Context Dependencies` section to SKILL.md
- Add graceful fallback for missing context files
- Keep `references/writing-style.md` in place (domain knowledge)

## Capabilities

- linkedin-content-migration — migrate skill to context layer architecture

## Scope

- `skills/linkedin-content/SKILL.md` — remove hardcoded identity, add context deps, update references
- `skills/linkedin-content/references/example-posts.md` — move to context template, delete original
- `context/templates/author-profile.template.md` — may need updates if not already created by context-layer-architecture

## Non-goals

- Re-evaluating the skill (already passed eval)
- Changing writing style rules or domain knowledge
- Modifying skill description or triggering behavior
