## Why

Skills like business-consultant frequently need to create process maps (AS-IS and TO-BE) when analyzing client workflows. Currently, process diagrams are generated as Mermaid flowcharts which are functional but limited — they can't show rich block structure (action/actor/tool per step) and aren't easily editable by clients. Excalidraw offers interactive, visually appealing diagrams that can be opened in Obsidian (primary work environment) or shared online with clients.

Two proven open-source Excalidraw skills (coleam00/excalidraw-diagram-skill, ooiyeefei/ccc) provide a reference base for JSON templates, validation, and arrow routing — no need to reinvent.

## What Changes

- **New skill `process-mapping`** — creates structured process maps from textual process descriptions
- **Three-tier rendering** — `.excalidraw` file (default, opens in Obsidian/VS Code) → online API publishing (for client sharing) → Mermaid fallback
- **Standardized block format** — each process step is a block with three parts: action name, actor, tool/system
- **Context-aware theming** — reads project design system (vibe-coding artifacts) for color palette
- **Integration with business-consultant** — business-consultant delegates process mapping to this skill
- **AS-IS / TO-BE support** — can generate current-state and future-state maps, highlighting changes
- **Environment-setup update** — adds `context/process-mapping.md` to setup wizard

## Capabilities

### New Capabilities
- `process-mapping-skill`: Skill definition, process parsing, block formatting, diagram generation with Excalidraw/Mermaid rendering, context-aware theming

### Modified Capabilities
- `skill-context-migration`: business-consultant SKILL.md update to reference process-mapping skill
- `environment-setup`: Add process-mapping context to audit and creation flow

## Impact

- `skills/process-mapping/SKILL.md` — new skill
- `skills/process-mapping/references/` — JSON schema, element templates, color palette, arrows/layout, validation (adapted from coleam00 + ooiyeefei)
- `skills/business-consultant/SKILL.md` — update to delegate process mapping
- `skills/environment-setup/SKILL.md` — add process-mapping context to audit
- `context/templates/process-mapping.md` — new context template
