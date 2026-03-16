## Why

The business-consultant skill was migrated from Claude Projects and is fully implemented, but hasn't been evaluated through the skill-creator process (Agent Skills 2.0). Without eval data, we can't confirm triggering accuracy or response quality. The skill has a broad scope (discovery, analysis, estimation, proposals) which makes triggering accuracy especially important to validate.

Additionally, the skill contains hardcoded personal data (identity, project history, case studies) directly in SKILL.md and reference files. Per the new context layer architecture, user-specific data should live in `context/` (gitignored, populated via environment-setup skill), while domain knowledge stays in `references/`.

## Dependencies

- **context-layer-architecture** — must be implemented first. That change establishes the `context/` directory structure, templates, environment-setup skill, and the `## Context Dependencies` convention. This change consumes that infrastructure.

## What Changes

- **Migrate user data to context layer** — move personal/company-specific content out of SKILL.md and references/ into context/ files (gitignored). Specifically:
  - `projekty.md` → `context/projects-portfolio` (user's project history)
  - `case-study-eventowa.md` + `case-study-faktury.md` → `context/projects-portfolio` (user's case studies)
  - Identity parts of `manifest.md` (name, contact, personal branding) → `context/consultant-profile`
- **Keep domain knowledge in references/** — discovery-questions.md, pricing-guidelines.md, tech-stack-comparison.md, and methodology-only parts of manifest.md stay in references/
- **Remove hardcoded identity from SKILL.md** — strip "niezalezny konsultant, wczesniej Technical Lead w Automation House" from Overview
- **Add `## Context Dependencies` section to SKILL.md** — declare required context files, graceful fallback when missing
- Run skill through `/skill-creator` eval process (test prompts → with-skill vs without-skill baseline → grading → benchmark)
- Apply cosmetic fixes if review reveals issues
- Optimize description for triggering accuracy
- Update EVAL-PLAYBOOK.md status

## Scope

- `skills/business-consultant/SKILL.md` — context migration, Context Dependencies section, description optimization, minor fixes
- `skills/business-consultant/references/manifest.md` — strip identity, keep methodology only
- `skills/business-consultant/references/projekty.md` — remove (migrated to context/)
- `skills/business-consultant/references/case-study-eventowa.md` — remove (migrated to context/)
- `skills/business-consultant/references/case-study-faktury.md` — remove (migrated to context/)
- `context/templates/consultant-profile.template.md` — new template (created by context-layer-architecture change)
- `context/templates/projects-portfolio.template.md` — new template (created by context-layer-architecture change)
- `skills/business-consultant-workspace/iteration-1/` — eval artifacts (eval_set.json, grading.json, benchmark.json, timing.json, feedback.json)

## Non-goals

- Full rewrite of the skill
- Adding new reference files or capabilities
- Changing pricing guidelines or consulting methodology
- Creating the context layer infrastructure itself (that's context-layer-architecture)
