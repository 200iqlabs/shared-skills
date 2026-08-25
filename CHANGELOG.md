# Changelog

## [Unreleased]

### Added
- **Agent working mode** (`/ss:working-mode`) — a session-scoped switch that puts replies under one
  contract: Polish, business meaning before technical detail, things named by what they do rather
  than by a term plus a translation; a fixed `KONTEKST` / `WYNIK` / `CO DALEJ` skeleton on every
  reply that hands control back (plus an optional `OTWARTE TEMATY`); and a closed list of the
  only reasons the agent may stop and hand control back. Off by default, scoped to the session it
  was switched on in, and unaffected by long sessions or context compaction. Conflicts with
  always-on style plugins (`explanatory-output-style`, `caveman`) — the command names one if it
  finds it.
- **The plugin's first hooks** (`hooks/`). `SessionStart` injects the rule set, `UserPromptSubmit`
  reinforces it each turn, `SessionEnd` clears the session's state. They ship inside the plugin and
  write nothing into `~/.claude/settings.json`, so disabling the plugin stops them; when the mode is
  off they emit nothing at all. `node hooks/selftest.mjs` covers the on path, the off path, session
  isolation and the silent-failure paths.
- **`ss:task-delegation` skill** — hands work to the user one task at a time, only work the agent
  cannot do itself, with a position counter and a stated completion signal; a question keeps the
  protocol on the current task, and the set is re-derived when an answer changes it. The action-side
  sibling of `/ss:decisions`, which keeps the choices.
- **`/ss:orientation`** — on demand, restates what the session is working on, what for, where it has
  got to, and what is wanted from the user; reports unverified work as unverified, and routes
  outstanding decisions and tasks to their own flows instead of listing them.
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
- **Working-mode replies restructured around a constant skeleton.** Every reply that hands control
  back now opens with `KONTEKST` (what the session is working on and what for), `WYNIK` (what the
  step produced, confirmed facts only, failures stated plainly) and `CO DALEJ`, optionally followed
  by `OTWARTE TEMATY`. **The conditional orientation header (`Gdzie jesteśmy:` / `Po co:`) and its
  closed list of six trigger conditions are removed** — the header fired on none of them when a
  user glanced at a parallel session that had kept running, which was the one case it existed for.
  The skeleton is unconditional instead: no triggers, no judgment about which replies deserve
  orientation, and mid-turn progress notes are the only exemption. `CO DALEJ` closes with exactly
  one of four endings — a decision (which routes into `/ss:decisions` in the same turn, never as
  prose questions), one delegated task, a named external wait, or „Sesję można zamknąć." Glossing a
  term in parentheses is gone too: the thing is described by what it does, and tool names, paths
  and commands appear only on request or when the user cannot act without them. **BREAKING** for
  anything matching on the old header lines. `/ss:orientation`, `/ss:decisions` and
  `ss:task-delegation` are unchanged; sessions already running keep the old rules until restarted.

  Two replies are exempt from the skeleton and no others: a status note emitted mid-turn, and the
  `/ss:working-mode` confirmation for `on`, `off` or `status`. Each of those stays a single line —
  the switch is run, waited for, and only then is the session's actual task stated, so sections
  stacked above a one-line confirmation orient nobody.
- **Work reaches the default branch through a branch, a pull request and a review.** A direct push
  happens only when the user explicitly asks for it, and is announced in one line before it
  happens rather than after. A repository's own history is explicitly not consent — this project
  had never opened a pull request, and that absence was read as licence to push the working-mode
  rules straight to `master` unreviewed. The stop list's first reason now names pushing to the
  default branch, merging a pull request and publishing a release outright, because "targets
  production" on its own reads as deployed systems and did not bring `git push` to mind.
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
