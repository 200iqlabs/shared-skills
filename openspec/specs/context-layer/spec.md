## Purpose

Defines the context layer architecture: the `context/` directory structure and the `company/` directory that holds company data, templates, gitignore rules, skill context dependency declarations, and graceful degradation when context files are missing.

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

### Requirement: Company data lives under company/
Company data files SHALL be stored under `company/` at the root of the repository the skills run in, not under `context/`: `company/data/company.md` and `company/data/legal-entities.md` for company data, and `company/brand/` for the optional brand files (`writing-style.md`, `brand-design.md`, `tone-of-voice.md`), which have no templates. The templates of the company data files remain in `context/templates/`. Skills SHALL read only these paths and SHALL NOT fall back to the former `context/company.md` or `context/legal-entities.md`.

#### Scenario: Company data is read from company/
- **WHEN** a skill needs the company data
- **THEN** it reads `company/data/company.md` or `company/data/legal-entities.md` and does not look for `context/company.md` or `context/legal-entities.md`

#### Scenario: Templates stay in context/templates
- **WHEN** the user creates `company/data/company.md` from the template
- **THEN** the template is `context/templates/company.template.md` and only the saved file is placed under `company/data/`

### Requirement: User context files are gitignored
Actual context files (not templates) SHALL be excluded from version control in this repository to prevent leaking personal/company data. The `.gitignore` covers `context/*.md` (except `context/README.md`), `company/data/*.md` and `company/brand/`.

#### Scenario: Gitignore excludes context files
- **WHEN** a user creates `context/finances.md` or `company/data/company.md` from a template in a clone of this repository
- **THEN** git status does not show it as an untracked file

#### Scenario: Plugin used in another repository
- **WHEN** the plugin is used inside a repository other than shared-skills
- **THEN** the `.gitignore` of shared-skills does not apply there and the user decides whether `company/` and `context/` are tracked by git

#### Scenario: Templates and README are tracked
- **WHEN** checking git status
- **THEN** `context/README.md` and `context/templates/*.template.md` are tracked in git

### Requirement: Context README explains the setup workflow
The `context/README.md` SHALL explain what context files are, how to create them, and reference the environment-setup skill.

#### Scenario: README includes setup instructions
- **WHEN** reading `context/README.md`
- **THEN** it explains: (1) purpose of context files, (2) how to create them from templates, (3) recommendation to use environment-setup skill, (4) list of available context types, where each is stored (`company/` or `context/`) and which skills use them

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
- **WHEN** a skill needs `company/data/company.md` and the file does not exist
- **THEN** the skill informs the user: "Brakuje pliku company/data/company.md. Uruchom skill environment-setup aby przygotować środowisko." and continues with domain knowledge only

#### Scenario: Recommended context file is missing
- **WHEN** a skill would benefit from `context/projects-portfolio.md` but it does not exist
- **THEN** the skill notes the limitation but proceeds without warning
