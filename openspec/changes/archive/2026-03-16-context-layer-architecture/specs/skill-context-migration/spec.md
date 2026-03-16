## ADDED Requirements

### Requirement: Business-consultant skill uses context layer
The business-consultant SKILL.md SHALL reference context files instead of containing hardcoded personal identity. User-specific reference files SHALL be replaced with context templates.

#### Scenario: No hardcoded identity in SKILL.md
- **WHEN** reading business-consultant SKILL.md
- **THEN** the Overview section describes a universal consultant role and references `context/consultant-profile.md` for user-specific identity

#### Scenario: Portfolio moved to context template
- **WHEN** checking business-consultant references/
- **THEN** projekty.md no longer exists in references/ and its content is represented in `context/templates/projects-portfolio.template.md`

#### Scenario: Case studies moved to context template
- **WHEN** checking business-consultant references/
- **THEN** case-study-eventowa.md and case-study-faktury.md no longer exist in references/ and their pattern is represented in the projects-portfolio template

#### Scenario: Manifest retains methodology only
- **WHEN** reading business-consultant references/manifest.md
- **THEN** it contains consulting philosophy and principles without personal name, contact info, or personal branding header

#### Scenario: Domain knowledge stays in references
- **WHEN** checking business-consultant references/
- **THEN** discovery-questions.md, pricing-guidelines.md, and tech-stack-comparison.md remain unchanged

### Requirement: Legal skill uses context layer
The legal SKILL.md SHALL reference context files instead of containing hardcoded entity names (PLSoft, 200IQ Labs).

#### Scenario: No hardcoded entity names in SKILL.md
- **WHEN** reading legal SKILL.md
- **THEN** it references `context/legal-entities.md` instead of mentioning PLSoft or 200IQ Labs by name

#### Scenario: Entity context moved to context template
- **WHEN** checking legal references/
- **THEN** entity-context.md no longer exists and its structure is represented in `context/templates/legal-entities.template.md`

#### Scenario: Document backlog moved to context template
- **WHEN** checking legal references/
- **THEN** document-backlog.md no longer exists and its structure is included in the legal-entities template

#### Scenario: Domain knowledge stays in references
- **WHEN** checking legal references/
- **THEN** legal-scope.md, workflow-draft.md, and workflow-brief.md remain unchanged

### Requirement: LinkedIn-content skill uses context layer
The linkedin-content SKILL.md SHALL reference context files instead of containing hardcoded author identity.

#### Scenario: No hardcoded author in SKILL.md
- **WHEN** reading linkedin-content SKILL.md
- **THEN** it references `context/author-profile.md` instead of hardcoding "Pawel Lipowczan" or "Technical Lead @ Automation House"

#### Scenario: Example posts moved to context template
- **WHEN** checking linkedin-content references/
- **THEN** example-posts.md no longer exists and its structure is represented in `context/templates/author-profile.template.md` (examples section)

#### Scenario: Writing style stays in references
- **WHEN** checking linkedin-content references/
- **THEN** writing-style.md remains unchanged as domain knowledge

### Requirement: Tax-advisor skill standardizes context references
The tax-advisor SKILL.md SHALL use standardized context/ paths and remove hardcoded business form assumptions.

#### Scenario: Business form context externalized
- **WHEN** reading tax-advisor SKILL.md
- **THEN** it references `context/legal-entities.md` for entity details instead of hardcoding JDG/PSA specifics

#### Scenario: All references remain as domain knowledge
- **WHEN** checking tax-advisor references/
- **THEN** all 4 reference files (polish-tax-system, it-tax-optimization, jdg-vs-psa-tax, tax-calendar) remain unchanged

### Requirement: CFO skill standardizes context reference
The cfo SKILL.md SHALL use the standardized `context/finances.md` path consistently.

#### Scenario: Context reference is standardized
- **WHEN** reading cfo SKILL.md
- **THEN** it references `context/finances.md` with the standard Context Dependencies section format

### Requirement: Documentation reflects context layer architecture
README.md, CLAUDE.md, and skill templates SHALL document the context layer architecture and setup workflow.

#### Scenario: README includes setup workflow
- **WHEN** reading README.md
- **THEN** it describes the three-step workflow: (1) Fork or plugin install, (2) Run environment-setup skill, (3) Ready to use

#### Scenario: CLAUDE.md documents context layer
- **WHEN** reading CLAUDE.md
- **THEN** it includes a section on context layer architecture explaining the separation of domain knowledge (references/) and user context (context/)

#### Scenario: SKILL_TEMPLATE includes context dependencies
- **WHEN** reading templates/SKILL_TEMPLATE.md
- **THEN** it includes a `## Context Dependencies` section template
