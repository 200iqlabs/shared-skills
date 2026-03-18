## Why

The CFO skill is fully implemented with live data integrations (Revolut, Stripe, inFakt), but hasn't been evaluated through the skill-creator process (Agent Skills 2.0). This is the last skill in the audit queue. Additionally, the skill references coach-the-five (line 105: "exit, wycena, PE → odsyłaj do coach-the-five") which has been moved to private-skills repo — this reference needs updating.

The project has adopted a **context layer architecture** (see `context-layer-architecture` change) that separates user-specific data (`context/`) from domain knowledge (`references/`). The CFO skill needs to be standardized to this architecture — though it's already the cleanest skill, since it already expects `context/finances.md` and its reference files are pure domain knowledge.

## What Changes

- **Context layer standardization** — add `## Context Dependencies` section to SKILL.md, standardize the existing `context/finances.md` reference to match the new architecture conventions. Fix stale coach-the-five boundary reference (moved to private-skills) → replace with generic "external advisor". This work depends on `context-layer-architecture` being implemented first (directory structure, templates, environment-setup skill must exist).
- Run skill through `/skill-creator` eval process (test prompts → with-skill vs without-skill baseline → grading → benchmark)
- Apply cosmetic fixes if review reveals issues
- Optimize description for triggering accuracy
- Update EVAL-PLAYBOOK.md status — mark full audit as complete

## Dependencies

- **`context-layer-architecture`** — MUST be implemented first. The CFO context standardization relies on `context/` directory, `context/templates/finances.template.md`, and the environment-setup skill existing. The eval part can proceed independently.

## Scope

- `skills/cfo/SKILL.md` — context standardization (add Context Dependencies section), fix coach-the-five ref, description optimization, minor fixes
- `skills/cfo-workspace/iteration-1/` — eval artifacts (eval_set.json, grading.json, benchmark.json, timing.json, feedback.json)
- `docs/EVAL-PLAYBOOK.md` — final status update for all skills

## Non-goals

- Full rewrite of the skill
- Changes to financial scripts or data integrations
- Adding new reference files or metrics frameworks
- Migrating reference files to context/ (CFO references are already pure domain knowledge — they stay in references/)
