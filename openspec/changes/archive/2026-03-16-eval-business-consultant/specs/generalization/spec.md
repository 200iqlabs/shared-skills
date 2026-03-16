## ADDED Requirements

### Requirement: User-specific data is migrated to context layer

The business-consultant skill SHALL NOT contain user-specific data (personal identity, project history, case studies) in SKILL.md or references/. User-specific content SHALL be migrated to context/ files, which are gitignored and populated via the environment-setup skill.

#### Scenario: projekty.md is removed from references/

- **WHEN** listing files in `skills/business-consultant/references/`
- **THEN** `projekty.md` is not present (its content has been migrated to `context/projects-portfolio`)

#### Scenario: Case study files are removed from references/

- **WHEN** listing files in `skills/business-consultant/references/`
- **THEN** `case-study-eventowa.md` and `case-study-faktury.md` are not present (their content has been migrated to `context/projects-portfolio`)

#### Scenario: SKILL.md Overview contains no hardcoded identity

- **WHEN** reading the SKILL.md Overview section
- **THEN** it describes a universal consultant role without referencing any specific person, company, or employment history (e.g., no "niezalezny konsultant", no "Technical Lead w Automation House")

#### Scenario: Skill metadata is generic

- **WHEN** reading the SKILL.md frontmatter
- **THEN** the description field triggers on business consulting queries without implying a specific consultant identity

### Requirement: manifest.md retains only domain knowledge

The manifest.md reference file SHALL contain only universally applicable consulting methodology (principles, collaboration model). All personal identity, branding headers, and contact information SHALL be removed.

#### Scenario: Header is neutral

- **WHEN** reading the manifest.md title
- **THEN** it describes a consulting philosophy or methodology without naming a specific person

#### Scenario: Contact section is removed

- **WHEN** reading manifest.md to the end
- **THEN** there is no contact information block (no email, phone, or personal website)

#### Scenario: Consulting principles are preserved

- **WHEN** reading manifest.md
- **THEN** all 5 fundamental principles remain intact: Problem przed Rozwiazaniem, Mierzalnosc, Agnostycyzm Technologiczny, Transparentnosc, Ewolucja zamiast Rewolucji

### Requirement: SKILL.md declares Context Dependencies

The SKILL.md SHALL contain a `## Context Dependencies` section that declares which context files the skill uses and how it behaves when they are missing.

#### Scenario: Context Dependencies section exists

- **WHEN** reading SKILL.md
- **THEN** there is a `## Context Dependencies` section listing `context/consultant-profile` and `context/projects-portfolio`

#### Scenario: Graceful fallback when context files are missing

- **WHEN** a declared context file does not exist
- **THEN** the skill warns the user about missing context, suggests running the environment-setup skill, and continues with reduced capability (generic consulting advice without personalized portfolio or identity)

### Requirement: Domain knowledge stays in references/

The references/ directory SHALL retain all universally applicable domain knowledge files that are not user-specific.

#### Scenario: Domain knowledge files are preserved

- **WHEN** listing files in `skills/business-consultant/references/`
- **THEN** the following files are present: `discovery-questions.md`, `pricing-guidelines.md`, `tech-stack-comparison.md`, `manifest.md` (methodology only)
