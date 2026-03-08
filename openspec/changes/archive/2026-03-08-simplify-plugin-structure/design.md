## Context

The project currently uses a non-standard plugin structure with `agents/` folder containing SKILL.md files and a two-tier bundle system (`business-advisor-skills` + `community-skills`) split by license. Per Claude Code plugin standard, skills belong in a `skills/` directory with auto-discovery. The commercial/community license split has no technical enforcement (public repo), so all skills are moving to Apache 2.0.

## Goals / Non-Goals

**Goals:**
- Align with Claude Code plugin standard directory structure
- Simplify from two bundles to one plugin with auto-discovery
- Unify licensing to Apache 2.0

**Non-Goals:**
- Changing skill content or behavior
- Adding new skills
- Modifying tool scripts functionality

## Decisions

### 1. Rename `agents/` → `skills/`

**Choice**: Direct rename at repo root.
**Rationale**: Claude Code auto-discovers skills from `skills/` directory. The `agents/` directory in plugin standard is reserved for subagent definitions (.md files), which is a different concept. Renaming aligns semantics with the standard.
**Alternative considered**: Keep `agents/` and add explicit paths in plugin.json — rejected because it fights auto-discovery and adds maintenance burden.

### 2. Flatten plugin manifest to single plugin.json

**Choice**: Replace `.claude-plugin/plugins/{business-advisor-skills,community-skills}/plugin.json` with a single `.claude-plugin/plugin.json` without explicit skill paths.
**Rationale**: With auto-discovery from `skills/`, explicit paths are unnecessary. Single manifest is simpler and matches the standard structure.
**Alternative considered**: Keep two bundles but both Apache 2.0 — rejected because the split serves no purpose without license differentiation.

### 3. Remove `license: commercial` from SKILL.md frontmatter

**Choice**: Remove or change to `license: Apache-2.0` in all SKILL.md files that have `license: commercial`.
**Rationale**: All skills are now open source. Commercial license in a public repo provided no real protection.

### 4. Update all path references

**Choice**: Find-and-replace `agents/` → `skills/` across CLAUDE.md, specs, templates, and documentation.
**Rationale**: Consistency. Stale references cause confusion.

## Risks / Trade-offs

- **[Breaking change for existing installs]** → Users must reinstall the plugin. Acceptable given the project is early-stage with few external users.
- **[Git history discontinuity]** → `git mv agents/ skills/` preserves history per-file. Use `git mv` not manual rename.
- **[Auto-discovery loads ALL skills]** → No way to selectively exclude skills from loading. Acceptable — all skills are open source now.
