# Shared Skills

Modular AI agent library built on the [Agent Skills](https://agentskills.io) standard.

## Agents

| Agent | Description | Status |
|-------|-------------|--------|
| `cfo` | Financial advisor for PSA and JDG entities | 🔲 Planned |
| `tax-advisor` | Polish tax system specialist (CIT, VAT, PIT, ZUS) | 🔲 Planned |
| `legal` | Legal analysis, contracts, GDPR, IP | 🔲 Planned |
| `marketing` | Content creation aligned with brand guidelines | 🔲 Planned |
| `business-consultant` | Strategic sparring partner | 🔲 Planned |
| `product-manager` | Product development support | 🔲 Planned |
| `coach-the-five` | Startup coaching based on "The Five" framework | 🔲 Planned |
| `linkedin-content` | LinkedIn post generation | 🔲 Planned |

## Installation

### Claude Code Plugin
```bash
/plugin marketplace add 200iqlabs/shared-skills
```

### Git Submodule (for repo integration)
```bash
git submodule add https://github.com/200iqlabs/shared-skills.git skills
```

## Creating new agents

Use the `skill-creator` to build agents iteratively:
```bash
/plugin install example-skills@anthropic-agent-skills
```

Then: "I want to create a new agent skill for [purpose]"

## License

- Community skills: Apache 2.0
- Business advisor bundle: Commercial license
