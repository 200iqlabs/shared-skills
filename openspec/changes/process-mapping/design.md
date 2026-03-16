## Context

Business-consultant and other consulting skills frequently need process maps when analyzing client workflows. The current approach generates Mermaid flowcharts inline, but these are limited: flat text boxes, no structured metadata per step, not interactively editable by clients.

From the eval session feedback: each process step should be a block with three parts — **action name**, **actor** (who performs it), **tool/system** (what they use). This structure makes maps immediately actionable for identifying automation opportunities.

Excalidraw provides an API for generating interactive, visually rich diagrams that can be shared and collaboratively edited. However, not all users will have Excalidraw configured, so Mermaid flowcharts remain the fallback.

## Goals / Non-Goals

**Goals:**
- Create a `process-mapping` skill that generates structured process maps
- Support Excalidraw API rendering as primary output
- Fall back to Mermaid flowcharts when Excalidraw is not configured
- Define a consistent block format: action/actor/tool per step
- Support AS-IS (current state) and TO-BE (target state) maps
- Enable business-consultant to delegate diagram generation to this skill

**Non-Goals:**
- Building a full diagramming tool (this is process maps only, not ERDs, sequence diagrams, etc.)
- Creating a custom rendering engine — leverage Excalidraw API and Mermaid
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

### 3. Rendering strategy — Excalidraw first, Mermaid fallback

**Choice:**
1. Check if Excalidraw API credentials are configured (via environment variable or context)
2. If yes → generate Excalidraw JSON, call API, return link/file
3. If no → generate Mermaid flowchart with the same block structure as text

**Why:** Excalidraw produces richer, editable output. But it requires API setup. Mermaid works everywhere without configuration. The skill should be useful immediately, with Excalidraw as an upgrade path.

### 4. Process input format — natural language with structured extraction

**Choice:** The skill accepts natural language process descriptions (meeting notes, bullet lists, narrative text) and extracts steps, actors, and tools. It can also accept structured input (numbered steps).

**Why:** Users describe processes in free-form text during discovery calls. The skill should handle messy real-world input, not require a specific format.

### 5. Integration with business-consultant — reference in SKILL.md

**Choice:** Update business-consultant SKILL.md to reference process-mapping skill when process diagrams are needed. Add a note: "For process maps, invoke the process-mapping skill."

**Why:** Simple, non-invasive integration. Business-consultant already has the workflow context; it delegates the visualization to a specialist skill.

## Risks / Trade-offs

**[Excalidraw API availability]** → Mitigation: Mermaid fallback ensures the skill always works. Excalidraw is an enhancement, not a requirement.

**[Block format in Mermaid limitations]** → Mitigation: Mermaid subgraphs or multi-line node labels can approximate the three-part block structure. Won't be as clean as Excalidraw but functional.

**[Excalidraw API may change]** → Mitigation: Encapsulate API interaction in a reference file or script. Changes isolated to one file.

**[Over-engineering for simple processes]** → Mitigation: The skill should handle both simple (3-step) and complex (20-step) processes gracefully. Don't force the full block format on trivial flows.

## Open Questions

- Which Excalidraw API to use? (excalidraw.com API, self-hosted, or the npm library for generating JSON?) — Decision: resolve during implementation by checking context7 for current Excalidraw API docs.
- Should the skill save diagrams to files or return inline? — Decision: both — file for Excalidraw (.excalidraw or link), inline for Mermaid.
