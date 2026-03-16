## Why

Shared-skills is distributed via fork or plugin install. After installation, users need to provide organization-specific context (company details, portfolio, financial data). Currently this context is mixed into skill `references/` directories alongside domain knowledge, and some skills hardcode personal data in SKILL.md. This makes the repo non-distributable without manual cleanup and creates confusion about what users need to fill in.

A clean separation between domain knowledge (stays in references/) and user context (lives in context/) enables:
- Fork/install → run setup skill → ready to use
- Clear dependency tree: skills declare what context they need
- Graceful degradation: missing context → warning + link to setup skill

## What Changes

- **Context layer architecture** — establish `context/` directory with standardized templates for user-specific data
- **Skill context dependency system** — skills declare required context files; missing files trigger warnings
- **Environment setup skill** — new skill that guides users through creating all required context files step-by-step
- **Migrate user context out of references/** — move user-specific files from skill references/ to context/ templates
- **Update SKILL.md files** — replace hardcoded personal data with context/ file references
- **Update documentation** — README, CLAUDE.md, templates to reflect new architecture

## Capabilities

- context-layer — directory structure, templates, dependency declarations
- environment-setup-skill — new skill for guided context creation
- skill-context-migration — migrate existing skills to use context layer

## Scope

Files to create:
- `context/.gitkeep` + `context/README.md` (explains what goes here)
- `context/templates/` — template files for each context type
- `skills/environment-setup/SKILL.md` — new setup skill

Files to modify:
- `skills/business-consultant/SKILL.md` — remove hardcoded identity, reference context/
- `skills/business-consultant/references/` — move projekty.md, case studies, manifest.md identity parts to context templates
- `skills/legal/SKILL.md` — remove hardcoded PLSoft/200IQ Labs, reference context/
- `skills/legal/references/` — move entity-context.md, document-backlog.md to context templates
- `skills/linkedin-content/SKILL.md` — remove hardcoded author name/role, reference context/
- `skills/linkedin-content/references/` — move example-posts.md to context template
- `skills/tax-advisor/SKILL.md` — standardize context/ references (already partially done)
- `skills/cfo/SKILL.md` — standardize context/ reference (already expects context/finances.md)
- `templates/CONTEXT_TEMPLATE.md` — expand with context types
- `templates/SKILL_TEMPLATE.md` — add context dependency section
- `README.md` — add setup workflow documentation
- `CLAUDE.md` — add context layer architecture documentation

## Non-goals

- Rewriting skill domain knowledge or methodology
- Changing skill behavior or capabilities
- Creating the environment-setup skill's full eval (separate change)
- Migrating tools/ configuration (stays as .env)
