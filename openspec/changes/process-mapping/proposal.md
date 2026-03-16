## Why

Skills like business-consultant frequently need to create process maps (AS-IS and TO-BE) when analyzing client workflows. Currently, process diagrams are generated as Mermaid flowcharts which are functional but limited — they can't show rich block structure (action/actor/tool per step) and aren't easily editable by clients. Excalidraw offers interactive, visually appealing diagrams that clients can collaboratively edit, but there's no standardized skill for generating them.

A dedicated process-mapping skill provides a reusable capability that any consulting skill can invoke when a process diagram is needed, with intelligent fallback to Mermaid when Excalidraw isn't configured.

## What Changes

- **New skill `process-mapping`** — creates structured process maps from textual process descriptions
- **Excalidraw-first rendering** — generates diagrams via Excalidraw API when configured, with Mermaid fallback
- **Standardized block format** — each process step is a block with three parts: action name, actor, tool/system
- **Integration with business-consultant** — business-consultant delegates process mapping to this skill
- **AS-IS / TO-BE support** — can generate current-state and future-state maps side by side

## Capabilities

### New Capabilities
- `process-mapping-skill`: Skill definition, process parsing, block formatting, diagram generation with Excalidraw/Mermaid rendering

### Modified Capabilities
- `skill-context-migration`: business-consultant SKILL.md update to reference process-mapping skill for diagram generation

## Impact

- `skills/process-mapping/SKILL.md` — new skill
- `skills/process-mapping/references/` — block format templates, Excalidraw API patterns
- `skills/business-consultant/SKILL.md` — update to delegate process mapping
