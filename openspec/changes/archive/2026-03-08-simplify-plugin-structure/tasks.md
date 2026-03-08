## 1. Rename agents to skills

- [x] 1.1 `git mv agents/ skills/` to rename directory preserving git history
- [x] 1.2 Remove `license: commercial` from all SKILL.md frontmatter (change to Apache-2.0 or remove field)

## 2. Flatten plugin manifest

- [x] 2.1 Replace `.claude-plugin/manifest.json` with standard single-plugin format (remove `plugins` array, keep name/description/author)
- [x] 2.2 Delete `.claude-plugin/plugins/` directory (both bundle plugin.json files)

## 3. Remove duplicate skills from platform folders

- [x] 3.1 Delete `.claude/skills/business-consultant/` (duplicated from plugin)
- [x] 3.2 Delete `.claude/skills/coach-the-five/` (duplicated from plugin)
- [x] 3.3 Delete `.cursor/skills/business-consultant/` (duplicated from plugin)
- [x] 3.4 Delete `.cursor/skills/coach-the-five/` (duplicated from plugin)
- [x] 3.5 Delete `.cursor/skills/linkedin-content/` (duplicated from plugin)
- [x] 3.6 Delete `.github/skills/business-consultant/` (duplicated from plugin)
- [x] 3.7 Delete `.github/skills/coach-the-five/` (duplicated from plugin)
- [x] 3.8 Delete `.github/skills/linkedin-content/` (duplicated from plugin)
- [x] 3.9 Delete `.agent/skills/business-consultant/` (duplicated from plugin)

## 4. Update path references

- [x] 4.1 Update CLAUDE.md — replace `agents/` references with `skills/`, update Architecture section
- [x] 4.2 Update `openspec/specs/agent-definition/spec.md` — replace `agents/` paths with `skills/`
- [x] 4.3 Update `templates/` files — replace any `agents/` references with `skills/`
- [x] 4.4 Update `docs/PRD.md` — replace any `agents/` references with `skills/`
- [x] 4.5 Grep for any remaining `agents/` references in non-archived files and fix them
