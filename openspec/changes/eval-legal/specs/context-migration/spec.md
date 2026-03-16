## ADDED Requirements

### Requirement: User data migrated from references/ to context/
The legal skill's user-specific data SHALL be migrated from `references/` to the `context/` directory per the context layer architecture. Specifically, `entity-context.md` and `document-backlog.md` SHALL be merged into `context/legal-entities.md`. The original files in `references/` SHALL be removed after migration.

**Dependency**: Requires `context-layer-architecture` change to be implemented first (context/ directory, templates, environment-setup skill).

#### Scenario: entity-context.md is removed from references/
- **WHEN** the migration is complete
- **THEN** `skills/legal/references/entity-context.md` SHALL NOT exist
- **AND** its content (entity structure, roles, relationships, RODO roles) SHALL be represented in `context/templates/legal-entities.template.md`

#### Scenario: document-backlog.md is removed from references/
- **WHEN** the migration is complete
- **THEN** `skills/legal/references/document-backlog.md` SHALL NOT exist
- **AND** its content (document status tracking per entity) SHALL be merged into `context/templates/legal-entities.template.md`

#### Scenario: Domain knowledge files stay in references/
- **WHEN** reviewing the skill after migration
- **THEN** `references/legal-scope.md`, `references/workflow-draft.md`, and `references/workflow-brief.md` SHALL remain in `skills/legal/references/`
- **AND** they SHALL NOT contain references to specific companies or persons

### Requirement: SKILL.md contains no hardcoded entity references
The legal skill's SKILL.md SHALL NOT contain references to specific company names (PLSoft, 200IQ Labs), specific person names (Pawel Lipowczan), or hardcoded entity configurations. The skill MUST reference `context/legal-entities.md` for entity-specific information.

#### Scenario: Title is generic
- **WHEN** reading the SKILL.md title (# heading)
- **THEN** it SHALL describe a generic Polish legal assistant for IT entrepreneurs, not referencing any company name

#### Scenario: Description frontmatter is generic
- **WHEN** reading the `description` field in YAML frontmatter
- **THEN** it SHALL trigger on Polish legal queries for IT entrepreneurs generally, without mentioning PLSoft, 200IQ Labs, or specific person names

#### Scenario: Body references context/ for entity data
- **WHEN** the skill body references business entities
- **THEN** it SHALL direct the agent to read `context/legal-entities.md` for entity-specific information
- **AND** it SHALL use generic terms like "podmioty uzytkownika" instead of hardcoded names

#### Scenario: OWU mode is generic
- **WHEN** reading the `/owu` work mode description
- **THEN** it SHALL describe OWU creation for the user's primary entity, not for a specific company

#### Scenario: Zero hardcoded references remain
- **WHEN** grepping all files in `skills/legal/` for "PLSoft", "200IQ", "Lipowczan"
- **THEN** there SHALL be zero matches

### Requirement: SKILL.md declares context dependencies
The legal skill's SKILL.md SHALL contain a `## Context Dependencies` section that declares which context files it uses, whether they are required or recommended, and what happens when they are missing.

#### Scenario: Context Dependencies section exists
- **WHEN** reading SKILL.md
- **THEN** it SHALL contain a `## Context Dependencies` section with a table listing at minimum `context/legal-entities.md`

#### Scenario: Missing context triggers warning
- **WHEN** a required or recommended context file is missing
- **THEN** the skill SHALL inform the user about the missing file and suggest running environment-setup skill
- **AND** the skill SHALL continue with reduced capability rather than blocking

### Requirement: Skill preserves core behavior after migration
The migrated skill SHALL preserve all existing work modes, risk signaling system, data safety rules, and communication style. Migration MUST NOT alter the skill's legal reasoning capabilities or boundaries.

#### Scenario: All work modes preserved
- **WHEN** listing available work modes in the migrated skill
- **THEN** all six modes SHALL be present: `/analiza`, `/draft`, `/brief`, `/owu`, `/checklist`, `/porownanie`

#### Scenario: Risk signaling unchanged
- **WHEN** the skill produces a legal analysis
- **THEN** it SHALL begin with the risk signal (green/yellow/red) exactly as before migration

#### Scenario: Data safety rules intact
- **WHEN** the skill encounters sensitive data
- **THEN** it SHALL use `[DO UZUPELNIENIA]` markers and NEVER include actual sensitive data
