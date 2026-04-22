---
name: "Slides: Draft"
description: Generate or iterate draft.md content for the active deck. Reads brief + sources, produces plain markdown (no Marp syntax). Runs as many times as needed.
category: Slides
tags: [slides, marp, content]
---

Generate or iterate slide content in `draft.md` for the active workspace. Content-only — no Marp frontmatter or slide separators.

**Input:** Optional positional `<slug>` to target a specific workspace. Otherwise operates on the most recently modified workspace. Optional free-form instruction describing what to change (e.g., `"shorten slide 3 and add a stronger hook"`).

**Steps**

1. **Load skill knowledge.** Invoke the `slides` skill (Skill tool, `skill: "slides"`) — full behavior for draft mode is in its SKILL.md under "Mode: draft".

2. **Resolve target workspace.** If slug passed, use it. Else, pick most-recently-modified under `slides/workspace/`. Announce which workspace you're acting on before editing.

3. **Follow the draft mode steps from SKILL.md:**
   - Read `brief.md` (frontmatter + body), `slides/project.md`, `slides/config.yaml`, all files under `sources/`, and `slides/_explore/<slug>-ideas.md` if present
   - Determine operation: initial generation, instruction-driven patch, or review summary
   - Produce/update `draft.md` as plain markdown: `## Slide N — <title>` per slide, bullet/prose body, `> note:` for speaker notes, NO Marp frontmatter, NO `---` between slides
   - Respect manual user edits on re-invocation (diff check)
   - Apply quality guardrails: hook, one idea per slide, CTA, language match

4. **Report.** Slide count, word count, summary of changes (if patching), suggestion to run `/slides:build` when content is ready.

**Output**

```
Working on: slides/workspace/<slug>/

Draft updated: 7 slides, ~180 words
Changes:
- Slide 1: new hook added
- Slide 3: condensed from 60 to 25 words

Next: /slides:build when ready
```

**Guardrails**

- Do NOT add Marp directives, frontmatter, or `---` separators — those are `/slides:build`'s job
- Do NOT revert manual edits the user made to `draft.md` between invocations
- If `draft.md` contains no content and no instruction was given, run initial generation from brief + sources
- If brief has no goal or no sources, ask the user before guessing
- Suggest splitting any slide that exceeds ~40 words of body prose
