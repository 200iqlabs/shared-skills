---
name: "Slides: Build"
description: Transform draft.md → slides.md with Marp frontmatter, render to PDF (and optionally HTML). The "apply" step that produces a shareable deliverable.
category: Slides
tags: [slides, marp, render]
---

Render the active workspace's `draft.md` into a Marp-ready `slides.md`, then output `slides/output/<slug>.pdf` (and optionally `.html`).

**Input:** Optional positional `<slug>` to target a specific workspace. Optional `--html` flag to also generate HTML for presenter mode.

**Steps**

1. **Load skill knowledge.** Invoke the `slides` skill (Skill tool, `skill: "slides"`) — full behavior for build mode is in its SKILL.md under "Mode: build" and rendering command is documented under "Rendering command".

2. **Resolve target workspace.** Explicit slug or most-recently-modified. Announce the target before acting.

3. **Follow the build mode steps from SKILL.md:**
   - Verify `draft.md` is non-empty
   - Read brief frontmatter to determine theme, size (via format→size map), paginate, footer
   - Transform `draft.md` → `slides.md`: inject Marp frontmatter, convert `## Slide N — <title>` to slide structure, insert `---` between slides, apply `<!-- _class: lead -->` to slide 1 and `<!-- _class: end -->` to last slide, convert `> note:` lines to HTML comment speaker notes
   - Invoke Marp CLI via `npx --yes @marp-team/marp-cli@<pinned>` with `--theme-set slides/themes/ --pdf --allow-local-files --output slides/output/<slug>.pdf`
   - If `--html` passed, also write `slides/output/<slug>.html`
   - On non-zero exit, surface stdout + stderr to user
   - Update `brief.md` frontmatter `status: built`

4. **Report.** Output paths, file sizes, render time, quick sanity check hints (slide count matches, Marp didn't emit warnings).

**Output**

```
Working on: slides/workspace/<slug>/

Generated: slides.md (7 slides, theme=plsoft-dark, size=1:1)
Rendering with Marp CLI v3.x (cached)...
✓ slides/output/<slug>.pdf (1.1 MB, rendered in 4.2s)

Next: open the PDF to verify, /slides:tweak for layout fixes, or /slides:archive when done
```

**Guardrails**

- Do NOT regenerate content from `draft.md` — just transform structure into Marp form
- Always pass `--allow-local-files` so relative image paths work
- If Marp exits non-zero, DO NOT silently retry — show the error to user and pause
- Overwrite existing `slides/output/<slug>.pdf` without prompting (user is iterating)
- If `slides.md` already existed and user manually edited it, preserve those edits unless `--regenerate-slides` is explicitly passed
