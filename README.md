# Shared Skills

Modular AI agent library built on the [Agent Skills](https://agentskills.io) standard.

## Skills

Installed as a plugin, every skill and command carries the `ss:` prefix — it comes from
the plugin's `name` field and keeps these skills apart from your repo-local ones.

### Business advisory

| Skill | Description | Status |
|-------|-------------|--------|
| `ss:cfo` | Financial advisor and fractional CFO with live data integrations | ✅ Active |
| `ss:tax-advisor` | Polish tax system specialist (CIT, VAT, PIT, ZUS) | ✅ Active |
| `ss:legal` | Legal analysis, contracts, GDPR, IP | ✅ Active |
| `ss:business-consultant` | Strategic sparring partner for IT entrepreneurs | ✅ Active |
| `ss:linkedin-content` | LinkedIn post generation | ✅ Active |
| `ss:process-mapping` | Process flow diagrams (Excalidraw/Mermaid) with action/actor/tool blocks | ✅ Active |
| `ss:vibe-coding` | AI-driven UI creation — design briefs, tokens, component generation | ✅ Active |
| `ss:environment-setup` | Guided setup wizard for context files | ✅ Active |
| `ss:marketing` | Content creation aligned with brand guidelines | 🔲 Planned |
| `ss:product-manager` | Product development support | 🔲 Planned |

### Developer workflow

Coding-agent skills for PR review, review loops, and OpenSpec `/goal` prep.

| Skill | Description | Status |
|-------|-------------|--------|
| `ss:review-fix` | Fetch PR review comments, fix valid issues, commit, push, reply on GitHub (`/ss:review-fix [PR]`) | ✅ Active |
| `ss:review-loop` | Automated Claude↔Copilot review cycle on a PR until stable (`/ss:review-loop <PR> <change>`) | ✅ Active |
| `ss:prepare-openspec-goal` | Formulate a transcript-checkable completion condition for `/goal` implementing an OpenSpec change | ✅ Active |

## Commands

Slash commands bundled with the plugin (`commands/`).

| Command | Description |
|---------|-------------|
| `/ss:decisions` | Surface open decisions one at a time, each with a recommendation, and wait for the answer (PL) |
| `/ss:explain-diff` | Walk through code changes (PR / branch vs main) one file at a time, in plain Polish |
| `/ss:explain-design` | Walk through an OpenSpec `design.md` topic by topic, one heading at a time (PL) |
| `/ss:slides:init` | Bootstrap the `slides/` workspace — structure, theme CSS, `config.yaml`, `project.md`. Idempotent |
| `/ss:slides:explore` | Brainstorm a deck concept before committing to a workspace; ideas persist across sessions |
| `/ss:slides:new` | Create an active workspace at `slides/workspace/<slug>/` — `brief.md`, empty `draft.md`, `sources/` |
| `/ss:slides:draft` | Generate or iterate `draft.md` from brief + sources, as plain markdown (no Marp syntax) |
| `/ss:slides:build` | `draft.md` → `slides.md` with Marp frontmatter, rendered to PDF (optionally HTML) |
| `/ss:slides:tweak` | Adjust `slides.md` layout (split slides, `_class`, reorder) without touching `draft.md` |
| `/ss:slides:archive` | Move a completed workspace to `slides/archive/<slug>/`; the PDF in `slides/output/` stays |

## Setup

### 1. Install

#### Claude Code Plugin

1. Add the marketplace:
```bash
claude plugin marketplace add 200iqlabs/shared-skills
```

2. Install the plugin:
```bash
claude plugin install ss@shared-skills
```

3. Verify installation:
```bash
claude plugin list
```

> Already installed under the old name `200iqlabs-agent-skills`? Nothing to do on
> Claude Code ≥ 2.1.193 — the rename migrates itself. See [CHANGELOG.md](CHANGELOG.md).

#### Git Submodule (for repo integration)
```bash
git submodule add https://github.com/200iqlabs/shared-skills.git skills
```

### 2. Configure environment

Run the `environment-setup` skill to create your context files:
```
"Set up my environment" → triggers environment-setup skill
```

This guides you through creating context files (`context/company.md`, `context/finances.md`, etc.) that personalize skills for your organization. See `context/README.md` for details.

### 3. Ready to use

Skills automatically load domain knowledge + your context files.

## Usage

Skills trigger automatically based on your questions — no special commands needed.

**Examples:**
- *"Przeanalizuj moje finanse z Revolut"* → triggers `cfo`
- *"Napisz post na LinkedIn o AI w biznesie"* → triggers `linkedin-content`
- *"Jakie mam opcje optymalizacji podatkowej?"* → triggers `tax-advisor`
- *"Oceń tę umowę z kontrahentem"* → triggers `legal`
- *"Zmapuj proces obsługi reklamacji z notatek ze spotkania"* → triggers `process-mapping`
- *"Chcę zbudować landing page — pokaż mi jak"* → triggers `vibe-coding`

**Verify a skill is active:** run Claude Code with `--verbose` flag or toggle verbose mode with `Ctrl+O` during a session.

## Creating new skills

Use the `skill-creator` to build skills iteratively:
```bash
/plugin install example-skills@anthropic-agent-skills
```

Then: "I want to create a new agent skill for [purpose]"

See [CLAUDE.md](CLAUDE.md) for the mandatory skill-creator workflow.

## License

Apache 2.0
