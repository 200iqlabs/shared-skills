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
- **Plugin renamed `200iqlabs-agent-skills` → `ss`.** Skills and commands now carry the
  `ss:` prefix (`ss:cfo`, `ss:ingest`, `/ss:decisions`). The publisher identity moved to
  fields built for it: `displayName` ("200IQ LABS Agent Skills"), the marketplace `owner`,
  and the install path `ss@shared-skills`. The marketplace entry also gained full
  provenance metadata — `author`, `homepage`, `repository`, `license` (Apache-2.0),
  `category` and `keywords` — so the licence is visible to anyone browsing the catalogue,
  not only to those who open the repository.
  - **On Claude Code ≥ 2.1.193 the rename resolves itself, but finish it with one
    command.** A `renames` map in `marketplace.json` maps the old name to the new one, so
    the plugin never reports `failed to load`; it shows a one-time `Renamed to "ss"` notice
    and Claude Code rewrites the `enabledPlugins` key in your settings by itself. Measured
    on a live GitHub-hosted marketplace, though, the *install record* was dropped in the
    process — the plugin then stops appearing in `claude plugin list` even though the
    settings key is correct. One command restores it:
    ```bash
    claude plugin marketplace update shared-skills
    claude plugin install ss@shared-skills
    ```
  - **On older versions** the rename surfaces as `plugin-not-found`. Same fix.
  - **Command names change**, and old written references stop working:
    `/decisions` → `/ss:decisions`, `/explain-diff` → `/ss:explain-diff`,
    `/explain-design` → `/ss:explain-design`, and the whole slides namespace
    `/ss:slides:init`, `/ss:slides:new`, `/ss:slides:draft`, `/ss:slides:build`,
    `/ss:slides:explore`, `/ss:slides:tweak`, `/ss:slides:archive`.
- **BREAKING** `skills/ingest`: path resolution is now driven by a `## Context Paths`
  section in the consuming project's root `CLAUDE.md`. Hardcoded `context/plsoft/...`
  references have been removed. Downstream repos MUST add a `## Context Paths`
  section declaring `clients:` and/or `projects:` paths before pulling this update,
  or `/ingest` will halt with an actionable error. See
  `openspec/specs/context-paths-config/spec.md` for the contract and
  `skills/ingest/SKILL.md` for the expected format.
