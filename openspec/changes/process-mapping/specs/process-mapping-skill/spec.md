## ADDED Requirements

### Requirement: Process mapping skill exists
A skill at `skills/process-mapping/SKILL.md` SHALL generate structured process maps from textual process descriptions.

#### Scenario: Skill is discoverable
- **WHEN** a user asks to map a process, create a process diagram, visualize a workflow, or draw a flowchart
- **THEN** the process-mapping skill triggers and begins the mapping workflow

#### Scenario: Skill triggers from Polish requests
- **WHEN** a user asks "zmapuj proces", "narysuj flowchart", "mapa procesu", or "diagram przepływu"
- **THEN** the process-mapping skill triggers

### Requirement: Process steps use three-part block format
Each process step SHALL be represented as a block containing: action name, actor (who performs it), and tool/system (what they use).

#### Scenario: Complete step information
- **WHEN** generating a process map from a description that includes who does what and with which tool
- **THEN** each step block contains all three parts: action, actor, tool

#### Scenario: Partial step information
- **WHEN** a process description omits the actor or tool for a step
- **THEN** the skill marks the missing part as "?" or asks the user to clarify

### Requirement: Skill renders diagrams as .excalidraw files by default
The skill SHALL generate `.excalidraw` JSON files as the primary output format. These files open natively in Obsidian (Excalidraw plugin), VS Code, and excalidraw.com.

#### Scenario: Default rendering
- **WHEN** generating a process map without explicit format preference
- **THEN** the skill outputs a `.excalidraw` file to the project directory

#### Scenario: Excalidraw file opens in Obsidian
- **WHEN** the user opens the generated `.excalidraw` file in Obsidian with Excalidraw plugin
- **THEN** the diagram renders correctly with blocks, arrows, and colors

### Requirement: Skill supports online publishing via Excalidraw API
The skill SHALL support publishing diagrams online when API is configured, for sharing with clients.

#### Scenario: Online sharing requested and API configured
- **WHEN** the user requests online sharing AND Excalidraw API credentials are configured in context
- **THEN** the skill publishes the diagram and provides a shareable link

#### Scenario: Online sharing requested but API not configured
- **WHEN** the user requests online sharing BUT no API credentials are configured
- **THEN** the skill suggests alternatives: sharing the `.excalidraw` file directly, opening in excalidraw.com manually, or configuring the API

### Requirement: Skill falls back to Mermaid
The skill SHALL support Mermaid flowchart output when explicitly requested or for markdown embedding.

#### Scenario: User requests Mermaid format
- **WHEN** the user explicitly asks for Mermaid output
- **THEN** the skill generates a Mermaid flowchart with the same block structure as text

#### Scenario: Markdown embedding
- **WHEN** the process map is needed inline within a markdown document
- **THEN** the skill generates Mermaid format for embedding

### Requirement: Skill uses context-aware color palette
The skill SHALL read design tokens from the project context when available.

#### Scenario: Project has vibe-coding design system
- **WHEN** the project contains `design-system.md` or `design-tokens.css` (from vibe-coding)
- **THEN** the skill maps process element colors to the project's design tokens

#### Scenario: Process-mapping context has color overrides
- **WHEN** `context/process-mapping.md` defines custom color mappings
- **THEN** the skill uses those colors instead of defaults

#### Scenario: No design context available
- **WHEN** neither project design system nor context file exists
- **THEN** the skill uses its built-in default semantic palette

### Requirement: Skill supports AS-IS and TO-BE maps
The skill SHALL support generating both current-state (AS-IS) and future-state (TO-BE) process maps.

#### Scenario: AS-IS only
- **WHEN** the user describes a current process
- **THEN** the skill generates an AS-IS map

#### Scenario: AS-IS and TO-BE
- **WHEN** the user describes a current process and asks for improvement recommendations
- **THEN** the skill generates both AS-IS and TO-BE maps, highlighting changes between them

### Requirement: Skill accepts natural language input
The skill SHALL extract process steps from unstructured text (meeting notes, narratives, bullet lists) as well as structured numbered steps.

#### Scenario: Unstructured meeting notes
- **WHEN** the user provides free-form meeting notes describing a process
- **THEN** the skill identifies and extracts the process steps in order

#### Scenario: Structured step list
- **WHEN** the user provides a numbered list of steps
- **THEN** the skill maps them directly to process blocks

### Requirement: Business-consultant delegates process mapping
The business-consultant SKILL.md SHALL reference the process-mapping skill for generating process diagrams.

#### Scenario: Business-consultant needs a process map
- **WHEN** the business-consultant skill needs to create a process diagram during discovery or analysis
- **THEN** it suggests invoking the process-mapping skill for diagram generation

### Requirement: Environment-setup includes process-mapping context
The environment-setup skill SHALL include `context/process-mapping.md` in its audit and creation flow.

#### Scenario: Setup wizard lists process-mapping context
- **WHEN** running environment-setup
- **THEN** `context/process-mapping.md` appears in the context file audit table with "process-mapping" as the consuming skill
