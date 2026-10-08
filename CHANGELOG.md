# Changelog

## [Unreleased]

### Added
- **`/ss:decisions`, `/ss:explain-design` and `/ss:explain-diff` are back, invoked by the user
  only** — restored at the plugin owner's request on 2026-10-01 with `disable-model-invocation: true`,
  so they never enter the model's skill listing and run only when typed. The decisions and
  understanding modes of the foundation's `sa-task-help` stay the one route the model picks itself,
  and the working mode's routing is unchanged.

### Changed
- **`review-loop` concludes "no review run" only from positive evidence** — when the wait for a
  Copilot review expires, step 5.3 starts from the new timeout outcome `unknown` instead of `no-run`.
  `no-run` now needs a run listing that succeeded and holds no run at all; a listing whose runs
  none match the pushed sha, one that may be cut at `--limit`, and a `Copilot` workflow that does
  not resolve are inconclusive — they wait on the same extension budget as an unfinished run and,
  at the cap, end as `unknown` with a report line that says to check manually. Any review run on
  the sha still unfinished keeps the wait open, whichever is newest — the one the push started
  included, though it predates the bound that picks out the request's own run. A loop that used
  to stop with `no-run` on a branch where Copilot had already run may now wait up to three more
  extensions before ending `unknown`.
- **Company data is read from `company/`, not `context/`** (breaking) — `legal`, `tax-advisor`,
  `cfo` and `environment-setup` read `company/data/company.md` and `company/data/legal-entities.md`;
  `linkedin-content` reads `company/brand/writing-style.md` and `/ss:slides:init` reads
  `company/brand/brand-design.md` and `company/brand/tone-of-voice.md`. There is no fallback to the
  old paths: a repository that keeps these files under `context/` has to move them. The
  `environment-setup` wizard, the OpenSpec specs, `CLAUDE.md`, `context/README.md` and the context
  template follow the same layout: the wizard saves company data under `company/data/`, the other
  context files stay in `context/`, the templates stay in `context/templates/`, and this
  repository's `.gitignore` now also covers `company/data/*.md` and `company/brand/`. To keep using
  the skills, move `context/company.md` and `context/legal-entities.md` to `company/data/` and any
  `context/brand/` files to `company/brand/`.

### Fixed
- **`tax-advisor` has one rule about amounts and identifiers** — the context-gathering steps told
  the model to ask for income and revenue before answering, while the "data security" section,
  marked inviolable, forbade asking for them and required every revenue or income amount to be
  marked `[DO UZUPEŁNIENIA]`; one rule always broke the other. A single section now settles it:
  the skill asks for an approximate annual revenue range and the cost level, never exact amounts
  or identifiers, and computes on that range; an amount the user gives to be converted (an invoice
  to net out) is an input it computes on directly; `[DO UZUPEŁNIENIA]` stays for exact amounts and
  identifiers in output documents (the brief, document templates), never in the analysis. The
  "missing context file" message now appears once, in `## Context Dependencies`, instead of three
  times, worded exactly as the `tax-advisor-agent` spec requires (`Brakuje pliku [nazwa]. Uruchom
  skill environment-setup aby przygotować środowisko.`, with Polish diacritics). The rule that
  `/brief` skips risk signalling is likewise stated once, in the `/brief` mode, instead of twice.
  Skill version 1.0 → 1.1.
- **`review-loop` loads its metadata again** — the frontmatter `description` carried an unquoted
  `: `, so the YAML failed to parse and the skill loaded with empty metadata, its description
  silently dropped. It is quoted now, the text unchanged; `claude plugin validate` passes.

### Removed
- **`/ss:decisions`, `/ss:explain-design`, `/ss:explain-diff`, `/ss:orientation` and the
  `ss:task-delegation` skill** — all five moved to the 200IQ LABS agentic-system foundation: the
  decision sweep and the two walk-throughs are the decisions and understanding modes of its
  task-help skill (`sa-task-help`), delegation is that skill's operator-actions part, and
  orientation is the skill `sa-orientation`. The plugin no longer ships them, so a repository with
  the foundation reaches each piece of work one way only. **The working mode now routes to the
  foundation when it is there**: a decision and a user action go to `sa-task-help` when the session
  has it, and without it the reply raises decisions one at a time, recommendation first, and hands
  over one task at a time with how its completion will be recognised. Repositories that relied on
  the removed items without the foundation keep the last published copies in git history
  (`git show 5e512d0:commands/decisions.md`, and the same for the other paths).
- **`ss:ingest`** — the skill that turns inbox files and pasted text into an entity's knowledge moved
  to the 200IQ LABS agentic-system foundation as `sa-ingest`, where it finds entities through the
  foundation's entity layout module instead of a `## Context Paths` section. The plugin no longer
  ships it, so a repository never sees the same skill twice (`ingest` from the foundation and
  `ss:ingest` from here). Repositories that relied on `/ss:ingest` without the foundation keep the
  last published copy in git history (`git show f220bae:skills/ingest/SKILL.md`).

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

  Two exemptions exist and no others: a status note emitted mid-turn, and the `/ss:working-mode`
  confirmations for `on`, `off` and `status` — three named replies. Each of those stays a single line —
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
