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

### Requirement: Skill renders diagrams with Excalidraw when configured
The skill SHALL use Excalidraw API to generate interactive diagrams when API credentials are available.

#### Scenario: Excalidraw is configured
- **WHEN** Excalidraw API credentials are available in the environment
- **THEN** the skill generates an Excalidraw diagram and provides a link or file

#### Scenario: Excalidraw is not configured
- **WHEN** Excalidraw API credentials are not available
- **THEN** the skill falls back to Mermaid flowchart format with the same block structure

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
