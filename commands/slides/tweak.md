---
name: "Slides: Tweak"
description: Adjust slides.md layout (split slides, change _class, reorder) without touching draft.md. Re-renders PDF after edit.
category: Slides
tags: [slides, marp, layout]
---

Apply layout-level adjustments to `slides.md` (already built) without touching `draft.md`. Meant for "this slide is too dense", "change this to a quote layout", "reorder slides 3 and 4" — form-level tweaks after content is locked.

**Input:** Required instruction describing the layout change. Optional positional `<slug>` (else most-recently-modified workspace).

**Steps**

1. **Load skill knowledge.** Invoke the `slides` skill (Skill tool, `skill: "slides"`) — full behavior for tweak mode is in its SKILL.md under "Mode: tweak".

2. **Resolve target workspace.** Announce it before acting.

3. **Follow the tweak mode steps from SKILL.md:**
   - Verify `slides.md` exists — if not, halt with "run /slides:build first"
   - Record `draft.md` mtime before edit
   - Apply instruction to `slides.md` only (split slide, change `_class`, add `_backgroundColor`, reorder, adjust header/footer per slide)
   - Assert `draft.md` mtime unchanged — fail loudly if it was touched
   - Re-invoke Marp CLI to re-render the PDF (and HTML if it was generated last time)

4. **Report.** What changed in slides.md (concise diff summary), re-render status, path to updated PDF.

**Output**

```
Working on: slides/workspace/<slug>/

slides.md edited:
- Slide 5 split into 5a + 5b
- Slide 2 class changed content → quote

Re-rendering...
✓ slides/output/<slug>.pdf updated (1.2 MB, 3.8s)
```

**Guardrails**

- This command MUST NOT modify `draft.md`. If your instruction requires content changes, bounce to `/slides:draft` instead
- If instruction is vague ("make it better"), ask for specifics
- If re-render fails, keep the edited slides.md but report the error
- Do not add new content — only rearrange, split, reclassify, restyle existing slides
