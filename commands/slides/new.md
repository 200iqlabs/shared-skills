---
name: "Slides: New"
description: Create a new active workspace for a deck at slides/workspace/<slug>/. Scaffolds brief.md, empty draft.md, and sources/ folder. Consumes exploration ideas if present.
category: Slides
tags: [slides, marp, workspace]
---

Create a new active workspace for an individual deck under `slides/workspace/<slug>/`.

**Input:** `<slug>` (kebab-case, required) plus optional `--context <metadata>` to tag the deck with its project/client/personal origin (free-form string, soft-validated against `context/`).

**Steps**

1. **Load skill knowledge.** Invoke the `slides` skill (Skill tool, `skill: "slides"`) — full behavior for new mode is in its SKILL.md under "Mode: new".

2. **Verify setup.** Confirm `slides/config.yaml` exists. If missing, halt with instruction to run `/slides:init` first.

3. **Follow the new mode steps from SKILL.md:**
   - Validate slug (kebab-case, 1–60 chars)
   - Halt if `slides/workspace/<slug>/` already exists
   - Soft-validate `--context <metadata>` against `context/` paths (warn if mismatch, continue anyway)
   - Create workspace with `brief.md` (from template, frontmatter pre-filled), empty `draft.md`, `sources/` folder with `.gitkeep`
   - If `slides/_explore/<slug>-ideas.md` exists, consume it: pre-fill brief body with audience/goal/format/hook discovered during exploration, link the ideas file in "Pre-work" section

4. **Report.** Workspace path, summary of pre-fills (if any), next step is `/slides:draft`.

**Output**

```
✓ Created slides/workspace/<slug>/
  brief.md        (pre-filled from _explore/<slug>-ideas.md)
  draft.md        (empty)
  sources/        (drop source materials here)

Next: /slides:draft to generate initial content
```

**Guardrails**

- Do NOT overwrite an existing workspace — halt with clear error
- Do NOT create any Marp `slides.md` — that happens in `/slides:build`
- If `--context` doesn't match a real path under `context/`, warn but continue (user may be planning)
- Slug validation: kebab-case only, no uppercase, no underscores, no leading digit unless date-prefixed
