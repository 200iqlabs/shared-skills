## Why

Current plugin structure uses a non-standard `agents/` folder for skills, two separate bundles (commercial vs community) with explicit path references, and a nested plugin manifest. Since all skills are going fully open source (Apache 2.0), the dual-bundle split is unnecessary. Aligning with the Claude Code plugin standard (`skills/` directory with auto-discovery) simplifies the architecture and removes maintenance overhead.

## What Changes

- **BREAKING**: Rename `agents/` → `skills/` to match Claude Code plugin standard
- **BREAKING**: Replace nested two-bundle manifest (`plugins/business-advisor-skills/` + `plugins/community-skills/`) with a single flat `plugin.json`
- Remove explicit path references from `plugin.json` — rely on auto-discovery from `skills/`
- Unify license to Apache 2.0 across all skills (remove `license: commercial` from SKILL.md frontmatter)
- Update CLAUDE.md to reflect new structure

## Capabilities

### New Capabilities

_(none — this is a restructuring, not new functionality)_

### Modified Capabilities

- `agent-definition`: Spec references `agents/` paths which change to `skills/`. Frontmatter `license: commercial` field is removed.

## Impact

- **File paths**: Every reference to `agents/<name>/` changes to `skills/<name>/`
- **Plugin manifest**: `.claude-plugin/plugins/` directory and its contents are replaced by a single `.claude-plugin/plugin.json`
- **CLAUDE.md**: Architecture section needs updating
- **Tools**: Any tool scripts referencing `agents/` paths need updating
- **Specs**: `agent-definition` spec references `agents/` paths
- **Existing installs**: Users who installed the plugin will need to reinstall after this change
