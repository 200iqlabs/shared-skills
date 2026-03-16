# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shared Skills is a modular AI agent library for business advisory, built on the [Agent Skills](https://agentskills.io) standard. It provides specialized agent personas (CFO, tax advisor, legal, marketing, etc.) as Claude Code skills, distributed via plugin marketplace or git submodules.

## Architecture

### Skills (`skills/`)
Each skill is a directory with a `SKILL.md` file using YAML frontmatter for routing metadata and markdown body for instructions. The frontmatter `description` field controls when the skill triggers — it should be "pushy" (undertriggering > overtriggering). Skills reference supporting files via `references/` subdirectories. Auto-discovered by the plugin system.

### Plugin System (`.claude-plugin/`)
- `plugin.json` — plugin manifest (name, description, author, license)
- Skills are auto-discovered from `skills/` directory — no explicit paths needed

### Tools (`tools/`)
Lightweight CLI scripts (bash/python) for external API integrations (ClickUp, Revolut). Preferred over MCP servers to minimize context window usage. Shared helpers in `tools/common/helpers.sh`. Setup: `cp tools/common/.env.example tools/common/.env`.

### Templates (`templates/`)
- `SKILL_TEMPLATE.md` — skeleton for new agent skills
- `CONTEXT_TEMPLATE.md` — skeleton for organization-specific context files
- `CLAUDE_MD_TEMPLATE.md` — skeleton for multi-agent system CLAUDE.md

### OpenSpec (`openspec/`)
Project specification used with the OpenSpec workflow skills (opsx:*) for structured change management.

### Context Layer (`context/`) — PLANNED

User-specific data lives in `context/`, separate from domain knowledge in skill `references/`. This enables clean distribution: fork/install → run environment-setup skill → ready to use.

**Architecture:**
- `context/templates/` — tracked in git, distributed with repo. Template files with `[DO UZUPELNIENIA]` placeholders
- `context/*.md` — gitignored. Created by users (manually or via environment-setup skill)
- `references/` — domain knowledge only (methodologies, frameworks, checklists). Stays in each skill

**Context types:**
| File | Used by | Content |
|------|---------|---------|
| `company.md` | legal, tax-advisor, cfo | Entity details, legal structure, team |
| `consultant-profile.md` | business-consultant | Consulting philosophy, experience, approach |
| `projects-portfolio.md` | business-consultant | Past projects, case studies, architecture patterns |
| `author-profile.md` | linkedin-content | Author persona, audience, example posts |
| `finances.md` | cfo | Budget, goals, financial structure |
| `legal-entities.md` | legal, tax-advisor | Entity details, relationships, document backlog |

**Skill convention:** Each skill that uses context files MUST have a `## Context Dependencies` section listing required/recommended files and a warning message for missing files.

**Status:** Architecture defined in `openspec/changes/context-layer-architecture/`. Not yet implemented.

## Key Conventions

- Skills use progressive disclosure: metadata → body → references (load references only when needed)
- Most agents are currently placeholders (Phase 0) — check for the "PLACEHOLDER" marker before assuming implementation exists
- All skills are Apache 2.0 licensed
- Language: many agent skills target Polish-speaking users (tax, legal, business consulting contexts)

## Setup Workflow (for users)

1. **Fork or plugin install** — `git clone`/`git submodule add` or `/plugin marketplace add 200iqlabs/shared-skills`
2. **Run environment-setup skill** — guides through creating context files step-by-step
3. **Ready to use** — skills automatically load domain knowledge + user context

## Creating or Modifying Skills — MANDATORY workflow

When creating a new skill or significantly modifying an existing one, you MUST use the `/skill-creator` workflow. Do NOT write SKILL.md files directly.

**Required steps:**
1. `/skill-creator` — capture intent, interview for edge cases, draft SKILL.md
2. Generate test prompts (min. 5 per agent)
3. Run evals and review results
4. Iterate based on feedback and benchmarks
5. Optimize description for triggering accuracy (target ≥ 80%)

**Why:** Hand-written skill descriptions undertrigger. skill-creator's interview process surfaces edge cases, and its eval loop ensures the description actually works. Skipping this produces lower-quality agents.

**When to use skill-creator:**
- Building a new skill from scratch
- Replacing a placeholder skill with a real implementation
- Rewriting or significantly expanding a skill's description or instructions
- Optimizing triggering accuracy for an existing skill

**When you can skip it:**
- Minor edits (typo fixes, adding a reference file, updating a date)
- Changes only to reference files or scripts (not SKILL.md itself)
