## Context

Business-consultant and other consulting skills frequently need process maps when analyzing client workflows. The current approach generates Mermaid flowcharts inline, but these are limited: flat text boxes, no structured metadata per step, not interactively editable by clients.

From the eval session feedback: each process step should be a block with three parts — **action name**, **actor** (who performs it), **tool/system** (what they use). This structure makes maps immediately actionable for identifying automation opportunities.

Two mature open-source Excalidraw skills exist (coleam00/excalidraw-diagram-skill, ooiyeefei/ccc excalidraw) with proven JSON templates, validation checklists, arrow routing patterns, and color palettes. These provide a solid reference base instead of building from scratch.

The primary consumption environment is **Obsidian** with the Excalidraw plugin, but diagrams also need to be shareable with clients who may not use Obsidian.

## Goals / Non-Goals

**Goals:**
- Create a `process-mapping` skill that generates structured process maps
- Support `.excalidraw` file rendering as primary output (opens in Obsidian, VS Code, excalidraw.com)
- Support online publishing via Excalidraw API for client sharing
- Fall back to Mermaid flowcharts when neither rendering mode is desired
- Define a consistent block format: action/actor/tool per step
- Support AS-IS (current state) and TO-BE (target state) maps
- Use project's design system (from vibe-coding artifacts) for color palette when available
- Enable business-consultant to delegate diagram generation to this skill

**Non-Goals:**
- Building a general-purpose diagramming skill (this is process maps only — architecture diagrams etc. use dedicated Excalidraw skills)
- Creating a custom rendering engine — leverage existing Excalidraw JSON format and references from proven skills
- Supporting real-time collaborative editing within Claude Code sessions
- Replacing all Mermaid usage across all skills — only process-specific mapping

## Decisions

### 1. Skill architecture — standalone skill with cross-skill invocation

**Choice:** Create `skills/process-mapping/SKILL.md` as a standalone skill. Business-consultant references it for process diagrams. Other skills can also invoke it.

**Why:** Process mapping is a reusable capability, not specific to business consulting. Legal might need workflow maps, CFO might need financial process flows. Standalone skill keeps it modular.

**Alternative considered:** Embedding process mapping logic directly in business-consultant. Rejected because it would duplicate logic if other skills need process maps.

### 2. Block format — three-part structure per step

**Choice:** Each process step is represented as:
```
┌─────────────────────┐
│  [Action Name]      │
│  Actor: [who]       │
│  Tool: [what]       │
└─────────────────────┘
```

**Why:** User feedback from eval session — this structure immediately shows who does what and with which tool, making it easy to identify automation candidates (replace actor with system, replace manual tool with automated one).

### 3. Rendering strategy — three tiers

**Choice:** Three rendering tiers, not two:

1. **Primary: `.excalidraw` file** — Generated locally, opens natively in Obsidian (Excalidraw plugin), VS Code (Excalidraw extension), and excalidraw.com. This is the default output.
2. **Online: Excalidraw API** — When client sharing is needed and API is configured, publish the diagram online for collaborative access. Useful for consulting engagements where the client doesn't use Obsidian.
3. **Fallback: Mermaid** — When the user explicitly prefers text-based output or for embedding in markdown documents.

**Why:** Obsidian is the primary work environment, so `.excalidraw` files are the natural default. But consulting work requires sharing with clients who may not have Obsidian — the online API option solves this. Mermaid remains as universal fallback.

**File format:** Standard `.excalidraw` JSON (not `.excalidraw.md`). Obsidian's Excalidraw plugin handles both formats, and `.excalidraw` is more portable (works directly in VS Code, excalidraw.com, etc.). The Obsidian plugin auto-discovers `.excalidraw` files.

### 4. Reference base — adapt from existing Excalidraw skills

**Choice:** Adapt reference materials from two proven open-source skills:
- **coleam00/excalidraw-diagram-skill** (1.6k stars) — Design philosophy ("diagrams that argue"), color palette system, element templates, JSON schema, render & validate pipeline
- **ooiyeefei/ccc excalidraw** (315 stars) — Arrow routing patterns, validation checklist, cloud palettes, complete JSON examples

We adapt (not copy) these references, focusing on what's relevant for process mapping specifically.

**Why:** These skills have been battle-tested and solve the hard problems (arrow routing, text binding, validation). Reinventing this would be wasteful. Our value-add is the process-specific block format, AS-IS/TO-BE logic, and context-aware theming.

### 5. Context-aware color palette — vibe-coding integration

**Choice:** The skill reads design tokens from the target project's context:
1. First check: project-local `design-system.md` or `design-tokens.css` (generated by vibe-coding skill)
2. Then check: `context/process-mapping.md` for skill-specific overrides
3. Fallback: built-in default palette (semantic colors from coleam00's color-palette.md)

**Why:** When skills are used in a project with an established design system (created via vibe-coding), diagrams should match the project's visual identity. Clients notice when diagrams don't match the brand.

**Color mapping for process blocks:**

| Process element | Semantic role | Default color |
|----------------|---------------|---------------|
| Start/Trigger | Start | Orange stroke + light orange fill |
| Regular step | Process | Primary/Neutral blue |
| Decision/Gateway | Decision | Amber |
| Automated step | AI/System | Purple |
| Manual step | Human action | Green |
| End/Result | End | Green stroke + light green fill |
| Risk/Warning | Error | Red |

### 6. Process input format — natural language with structured extraction

**Choice:** The skill accepts natural language process descriptions (meeting notes, bullet lists, narrative text) and extracts steps, actors, and tools. It can also accept structured input (numbered steps).

**Why:** Users describe processes in free-form text during discovery calls. The skill should handle messy real-world input, not require a specific format.

### 7. Integration with business-consultant — reference in SKILL.md

**Choice:** Update business-consultant SKILL.md to reference process-mapping skill when process diagrams are needed. Add a note: "For process maps, invoke the process-mapping skill."

**Why:** Simple, non-invasive integration. Business-consultant already has the workflow context; it delegates the visualization to a specialist skill.

### 8. Environment-setup integration

**Choice:** Add `context/process-mapping.md` to the environment-setup skill's audit and creation flow. This context file stores:
- Preferred output format (excalidraw / mermaid)
- Default output path
- Color overrides (if not using vibe-coding design system)
- Excalidraw API config (if using online sharing)

**Why:** Following the established context layer pattern. Other skills (legal, cfo, etc.) each have their context file. Process-mapping should too, especially for rendering preferences.

## Risks / Trade-offs

**[Excalidraw JSON complexity]** → Mitigation: Using proven references from coleam00/ooiyeefei reduces risk. JSON schema and element templates are already documented and validated.

**[Block format in Mermaid limitations]** → Mitigation: Mermaid subgraphs or multi-line node labels can approximate the three-part block structure. Won't be as clean as Excalidraw but functional.

**[Excalidraw API availability for online sharing]** → Mitigation: Online sharing is optional. The primary `.excalidraw` file always works locally. API publishing is an upgrade path.

**[Design system may not exist]** → Mitigation: Three-tier fallback (project design system → context file → defaults). The skill always works, just with varying levels of brand alignment.

**[Large process maps]** → Mitigation: Follow coleam00's section-by-section approach for large diagrams. Build JSON incrementally, not in one pass.

## Open Questions

- ~~Which Excalidraw API to use?~~ → Resolved: excalidraw.com for online sharing. Local `.excalidraw` files are the primary output.
- ~~Should the skill save diagrams to files or return inline?~~ → Resolved: `.excalidraw` files saved to project, Mermaid returned inline.
- Excalidraw API for online publishing — is there a stable public API, or do we need to use excalidraw+ (paid)? → Investigate during implementation.
