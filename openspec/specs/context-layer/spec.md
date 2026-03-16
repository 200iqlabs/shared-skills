## Purpose

Defines the context layer architecture: the `context/` directory structure, templates, gitignore rules, skill context dependency declarations, and graceful degradation when context files are missing.

## Requirements

### Requirement: Context directory exists at repo root
The repository SHALL have a `context/` directory at the root level containing templates and a README explaining its purpose.

#### Scenario: Fresh clone has context structure
- **WHEN** cloning or forking the repository
- **THEN** the `context/` directory exists with `README.md`, `templates/` subdirectory, and template files for each context type

### Requirement: Context templates cover all user-specific data types
The `context/templates/` directory SHALL contain template files for each type of user-specific context that skills require.

#### Scenario: All template types are present
- **WHEN** listing files in `context/templates/`
- **THEN** the following templates exist: `company.template.md`, `consultant-profile.template.md`, `projects-portfolio.template.md`, `author-profile.template.md`, `finances.template.md`, `legal-entities.template.md`

#### Scenario: Templates use placeholder markers
- **WHEN** reading any template file
- **THEN** it contains `[PLACEHOLDER]` markers or `[DO UZUPEŁNIENIA]` markers in sections that require user input, with brief guidance on what to fill in

### Requirement: User context files are gitignored
Actual context files (not templates) SHALL be excluded from version control to prevent leaking personal/company data.

#### Scenario: Gitignore excludes context files
- **WHEN** a user creates `context/company.md` from the template
- **THEN** git status does not show it as an untracked file

#### Scenario: Templates and README are tracked
- **WHEN** checking git status
- **THEN** `context/README.md` and `context/templates/*.template.md` are tracked in git

### Requirement: Context README explains the setup workflow
The `context/README.md` SHALL explain what context files are, how to create them, and reference the environment-setup skill.

#### Scenario: README includes setup instructions
- **WHEN** reading `context/README.md`
- **THEN** it explains: (1) purpose of context files, (2) how to create them from templates, (3) recommendation to use environment-setup skill, (4) list of available context types and which skills use them

### Requirement: Skills declare context dependencies
Each skill's SKILL.md SHALL include a `## Context Dependencies` section that lists required and recommended context files.

#### Scenario: Context dependencies table is present
- **WHEN** reading a skill's SKILL.md that uses context files
- **THEN** it contains a `## Context Dependencies` section with a table listing file path, required/recommended status, and purpose

#### Scenario: Missing context warning instruction is present
- **WHEN** reading the Context Dependencies section
- **THEN** it includes an instruction to warn users about missing required files and suggest running the environment-setup skill

### Requirement: Skills handle missing context gracefully
Skills SHALL check for required context files and warn users if they are missing, without blocking operation entirely.

#### Scenario: Required context file is missing
- **WHEN** a skill needs `context/company.md` and the file does not exist
- **THEN** the skill informs the user: "Brakuje pliku context/company.md. Uruchom skill environment-setup aby przygotować środowisko." and continues with domain knowledge only

#### Scenario: Recommended context file is missing
- **WHEN** a skill would benefit from `context/projects-portfolio.md` but it does not exist
- **THEN** the skill notes the limitation but proceeds without warning
