# OpenSpec Instructions

When working on this project, follow the OpenSpec workflow:
1. `/opsx:propose` — Draft a change proposal
2. `/opsx:apply` — Implement the change
3. `/opsx:archive` — Archive and update specs

## Project Structure
- `agents/` — Agent skills (SKILL.md + references/ + scripts/)
- `tools/` — Shared CLI tools
- `evals/` — Test prompts and benchmarks per agent
- `templates/` — Templates for new agents and contexts

## Agent Development Workflow
Use skill-creator for building/modifying agents:
1. Capture intent → Interview → Draft SKILL.md
2. Generate test prompts → Run evals → Human review
3. Iterate → Optimize description → Package
