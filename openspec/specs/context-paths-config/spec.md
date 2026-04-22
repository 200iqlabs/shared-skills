# context-paths-config Specification

## Purpose
TBD - created by archiving change parametrize-ingest-context-paths. Update Purpose after archive.
## Requirements
### Requirement: Project CLAUDE.md declares context paths in a dedicated section

A project consuming context-aware skills SHALL declare its context folder layout in a `## Context Paths` section of the project's root `CLAUDE.md`. The section SHALL list scope types as keys and one or more repository-relative folder paths as values, in a markdown nested-list format.

#### Scenario: Well-formed Context Paths section is recognized
- **WHEN** `CLAUDE.md` contains a `## Context Paths` section listing `clients:` followed by one or more indented `- context/<path>` entries
- **THEN** a skill reading the section SHALL resolve `clients` to the list of paths and use them for scanning

#### Scenario: Multiple paths per scope type are supported
- **WHEN** a scope type (e.g. `prospects`) has two or more indented paths
- **THEN** a skill SHALL treat all listed paths as valid targets and operate on matches in every one

#### Scenario: Unknown scope types are ignored by unaware skills
- **WHEN** the section contains a scope type a skill does not consume (e.g. `/ingest` does not know about `partners`)
- **THEN** the skill SHALL ignore that entry without failing

### Requirement: Ingest skill resolves folder paths from Context Paths section

The `/ingest` skill SHALL read the `## Context Paths` section of the current project's `CLAUDE.md` to determine which folders to scan for clients and projects. The skill SHALL NOT contain hardcoded repo-specific path prefixes (such as `context/plsoft/`) in its instructions.

#### Scenario: /ingest without arguments scans all declared client and project paths
- **WHEN** the user runs `/ingest` with no argument and `CLAUDE.md` declares `clients:` and `projects:` entries
- **THEN** the skill scans the inbox of every declared client folder and project folder for unprocessed files

#### Scenario: /ingest NAME processes matches across all declared scopes
- **WHEN** the user runs `/ingest LAVEL` and `LAVEL` exists in more than one declared path (e.g. both `context/200iq-labs/clients/LAVEL` and `context/qamera/customers/LAVEL`)
- **THEN** the skill processes the inbox of every matching folder, without prompting for disambiguation

#### Scenario: /ingest NAME with no match reports an error
- **WHEN** the user runs `/ingest UNKNOWN` and no folder named `UNKNOWN` exists in any declared path
- **THEN** the skill reports a name-not-found error listing the paths that were searched

### Requirement: Missing Context Paths section produces actionable error

When a skill that depends on `## Context Paths` runs in a project whose `CLAUDE.md` does not contain the section, the skill SHALL halt with an error message that includes a copy-pasteable example of the correct section.

#### Scenario: Missing section halts with example
- **WHEN** the user runs `/ingest` in a project whose `CLAUDE.md` has no `## Context Paths` section
- **THEN** the skill stops before any file operation and returns a message explaining that the section is required, including a block showing the expected format

#### Scenario: Empty Context Paths section is valid but no-op
- **WHEN** the section exists but declares no scope types (or all scope types are empty lists)
- **THEN** `/ingest` reports that no folders are configured and exits cleanly without error

