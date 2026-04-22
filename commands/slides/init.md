---
name: "Slides: Init"
description: Bootstrap the slides/ workspace — directory structure, theme CSS from brand reference, config.yaml, project.md. Idempotent — safe to re-run.
category: Slides
tags: [slides, marp, setup]
---

Bootstrap or repair the `slides/` workspace at repo root for the `slides` skill.

**Input:** Optional flag `--regenerate-theme` to overwrite only `slides/themes/plsoft-dark.css` using current `context/brand/brand-design.md` values.

**Steps**

1. **Load skill knowledge.** Invoke the `slides` skill (Skill tool, `skill: "slides"`) — full behavior for init mode is in its SKILL.md under "Mode: init".

2. **Follow the init mode steps from SKILL.md:**
   - Verify Node 18+
   - Create `slides/{workspace,output,archive,themes,_explore}` with `.gitkeep` where empty
   - Parse `context/brand/brand-design.md` (if present) for color and typography tokens
   - Generate `slides/themes/plsoft-dark.css` from the skill's template, substituting placeholders
   - Write `slides/config.yaml` from template, filling author/footer from detected identity
   - Write `slides/project.md` from template; pull key points from `context/brand/tone-of-voice.md` if present
   - Pre-warm `npx @marp-team/marp-cli` and render a throwaway dummy deck to confirm Chromium cache
   - Report what was created vs skipped

3. **`--regenerate-theme` shortcut:** If this flag is passed, perform only brand-parse + theme render. Do NOT touch config.yaml, project.md, directories, or the Marp pre-warm.

**Output**

Summary report:
- Node version + Marp CLI version
- Files created (list)
- Files skipped because already present (list)
- Brand reference used (path or "not found, used defaults")
- Next step suggestion: `/slides:explore` for a new deck idea, or `/slides:new <slug>` if you already know what to build

**Guardrails**

- Do NOT overwrite existing files unless `--regenerate-theme` is passed (and then only the theme CSS)
- If Node < 18, halt with a clear error before creating anything
- If `context/brand/brand-design.md` is absent, fall back to the skill's neutral defaults (document this in the report)
- If Marp pre-warm fails (network, Chromium download), report the error but keep the created files — user can retry
