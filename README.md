# Shared Skills

Modular AI agent library built on the [Agent Skills](https://agentskills.io) standard.

## Skills

| Skill | Description | Status |
|-------|-------------|--------|
| `cfo` | Financial advisor and fractional CFO with live data integrations | ✅ Active |
| `tax-advisor` | Polish tax system specialist (CIT, VAT, PIT, ZUS) | ✅ Active |
| `legal` | Legal analysis, contracts, GDPR, IP | ✅ Active |
| `business-consultant` | Strategic sparring partner for IT entrepreneurs | ✅ Active |
| `linkedin-content` | LinkedIn post generation | ✅ Active |
| `marketing` | Content creation aligned with brand guidelines | 🔲 Planned |
| `product-manager` | Product development support | 🔲 Planned |

## Setup

### 1. Install

#### Claude Code Plugin

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
