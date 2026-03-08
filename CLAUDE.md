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

## Key Conventions

- Skills use progressive disclosure: metadata → body → references (load references only when needed)
- Skill descriptions are optimized via `skill-creator` evals — use `/skill-creator` to create or refine agents
- Most agents are currently placeholders (Phase 0) — check for the "PLACEHOLDER" marker before assuming implementation exists
- All skills are Apache 2.0 licensed
- Language: many agent skills target Polish-speaking users (tax, legal, business consulting contexts)
