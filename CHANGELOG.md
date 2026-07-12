# Changelog

## [Unreleased]

### Added
- **Developer-workflow skills** (migrated from loose global `~/.claude/skills/`): `review-fix`
  (PR review comments → fix → commit → push → reply), `review-loop` (automated Claude↔Copilot
  review cycle), `prepare-openspec-goal` (transcript-checkable `/goal` completion condition for
  OpenSpec changes). Kept `prepare-openspec-goal` separate from the generic `prepare-goal`.
- **Slash commands** (migrated from loose global `~/.claude/commands/`): `/decisions` (one-at-a-time
  decision sweep, PL), `/explain-diff` (walk a diff file-by-file, PL), `/explain-design` (walk an
  OpenSpec `design.md` heading-by-heading, PL).
- Initial project structure
- 8 agent skill placeholders
- Shared tools directory (ClickUp, Revolut, Google Drive)
- Plugin marketplace configuration
- OpenSpec initialization
- Templates for new agents and contexts

### Changed
- **BREAKING** `skills/ingest`: path resolution is now driven by a `## Context Paths`
  section in the consuming project's root `CLAUDE.md`. Hardcoded `context/plsoft/...`
  references have been removed. Downstream repos MUST add a `## Context Paths`
  section declaring `clients:` and/or `projects:` paths before pulling this update,
  or `/ingest` will halt with an actionable error. See
  `openspec/specs/context-paths-config/spec.md` for the contract and
  `skills/ingest/SKILL.md` for the expected format.
