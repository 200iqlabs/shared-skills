---
name: "Slides: Archive"
description: Move a completed workspace from slides/workspace/<slug>/ to slides/archive/<slug>/. The final PDF in slides/output/ is retained.
category: Slides
tags: [slides, marp, lifecycle]
---

Finalize a deck: move its workspace to the archive while keeping the rendered PDF in `slides/output/`.

**Input:** Optional positional `<slug>`. If absent, archives the most-recently-modified workspace.

**Steps**

1. **Load skill knowledge.** Invoke the `slides` skill (Skill tool, `skill: "slides"`) — full behavior for archive mode is in its SKILL.md under "Mode: archive".

2. **Resolve target workspace.** Announce it before acting.

3. **Follow the archive mode steps from SKILL.md:**
   - Verify `slides/workspace/<slug>/` exists — halt gracefully if not
   - Move `slides/workspace/<slug>/` → `slides/archive/<slug>/` preserving all files and timestamps
   - Verify `slides/output/<slug>.pdf` still exists — warn if missing (archive proceeds regardless)
   - Update the moved `brief.md` frontmatter: `status: archived`

4. **Report.** Archive path, confirmation that the PDF is preserved, note that the slug is now free for reuse in `/slides:new`.

**Output**

```
✓ Moved slides/workspace/<slug>/ → slides/archive/<slug>/
✓ slides/output/<slug>.pdf preserved (1.1 MB)

Slug <slug> is now free — can be reused with /slides:new <slug>
```

**Guardrails**

- Do NOT delete anything — archive is a move, not a cleanup
- Do NOT remove `slides/output/<slug>.pdf` — that's the final deliverable
- If an archive entry with the same slug already exists (user archived twice), suffix with `-archived-<timestamp>` to avoid collision
- If `slides/workspace/<slug>/` does not exist, exit with a clear error — do not try to be clever
