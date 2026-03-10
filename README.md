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

1. Add the marketplace:
```bash
/plugin marketplace add 200iqlabs/shared-skills
```

2. Install the plugin:
```bash
/plugin install 200iqlabs-agent-skills
```

3. Verify installation:
```bash
/plugin list
```

### Git Submodule (for repo integration)
```bash
git submodule add https://github.com/200iqlabs/shared-skills.git skills
```

## Usage

Skills trigger automatically based on your questions — no special commands needed.

**Examples:**
- *"Przeanalizuj moje finanse z Revolut"* → triggers `cfo`
- *"Napisz post na LinkedIn o AI w biznesie"* → triggers `linkedin-content`
- *"Jakie mam opcje optymalizacji podatkowej?"* → triggers `tax-advisor`
- *"Oceń tę umowę z kontrahentem"* → triggers `legal`

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
