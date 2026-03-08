# Shared Skills

Modular AI agent library built on the [Agent Skills](https://agentskills.io) standard.

## Skills

| Skill | Description | Status |
|-------|-------------|--------|
| `cfo` | Financial advisor for PSA and JDG entities | ✅ Active |
| `tax-advisor` | Polish tax system specialist (CIT, VAT, PIT, ZUS) | 🔲 Planned |
| `legal` | Legal analysis, contracts, GDPR, IP | 🔲 Planned |
| `marketing` | Content creation aligned with brand guidelines | 🔲 Planned |
| `business-consultant` | Strategic sparring partner | ✅ Active |
| `product-manager` | Product development support | 🔲 Planned |
| `coach-the-five` | Startup coaching based on "The Five" framework | ✅ Active |
| `linkedin-content` | LinkedIn post generation | ✅ Active |

## Installation

### Claude Code Plugin
```bash
/plugin marketplace add 200iqlabs/shared-skills
```

### Git Submodule (for repo integration)
```bash
git submodule add https://github.com/200iqlabs/shared-skills.git skills
```

## Creating new skills

Use the `skill-creator` to build skills iteratively:
```bash
/plugin install example-skills@anthropic-agent-skills
```

Then: "I want to create a new agent skill for [purpose]"

## License

Apache 2.0
