## MODIFIED Requirements

### Requirement: Boundary references use only public skills or generic advisors
The CFO SKILL.md boundaries section SHALL NOT reference skills that exist only in private repositories. All boundary redirections SHALL point to either public shared-skills agents or generic external advisor descriptions.

#### Scenario: coach-the-five reference is replaced
- **WHEN** reading the Boundaries section of skills/cfo/SKILL.md
- **THEN** line 105 ("exit, wycena, PE → odsyłaj do coach-the-five") is replaced with a generic boundary (e.g., "exit, wycena, PE → odsyłaj do zewnętrznego doradcy ds. wyceny")

#### Scenario: All boundary targets are resolvable
- **WHEN** checking each boundary redirection in the Boundaries section
- **THEN** every referenced skill (tax-advisor, business-consultant, legal) exists in the skills/ directory, or the redirection uses generic language ("external advisor") instead of a skill name

## ADDED Requirements

### Requirement: SKILL.md declares context dependencies using standard format
The CFO SKILL.md SHALL contain a `## Context Dependencies` section that declares all required and recommended context files using the table format defined by the context layer architecture.

#### Scenario: Context Dependencies section exists
- **WHEN** reading skills/cfo/SKILL.md
- **THEN** there is a `## Context Dependencies` section with a table listing `context/finances.md` as Required and `context/company.md` as Recommended

#### Scenario: Missing context warning references environment-setup skill
- **WHEN** a required context file (e.g., `context/finances.md`) is missing
- **THEN** the skill's instructions direct the agent to warn the user with: "Brakuje pliku [file]. Uruchom skill environment-setup aby przygotować środowisko."

#### Scenario: Skill degrades gracefully without context files
- **WHEN** context files are missing
- **THEN** the skill continues with reduced capability (uses only live script data and references/) rather than blocking entirely

### Requirement: Reference files contain only domain knowledge
The files in skills/cfo/references/ SHALL contain only reusable domain knowledge (frameworks, benchmarks, methodologies), not user-specific financial data.

#### Scenario: financial-analysis-frameworks.md is domain knowledge
- **WHEN** reading `references/financial-analysis-frameworks.md`
- **THEN** it contains generic financial analysis frameworks, not company-specific data

#### Scenario: saas-metrics.md is domain knowledge
- **WHEN** reading `references/saas-metrics.md`
- **THEN** it contains generic SaaS metric definitions and industry benchmarks, not company-specific metrics

### Requirement: context/finances.md reference is standardized
The SKILL.md SHALL reference `context/finances.md` using the standardized convention from the context layer architecture, including the warning pattern for missing files and reference to the environment-setup skill.

#### Scenario: Existing "Brakuje context/finances.md" message is updated
- **WHEN** reading the instructions body in SKILL.md
- **THEN** the missing-file warning includes the suggestion to run environment-setup skill, following the pattern: "Brakuje pliku context/finances.md. Uruchom skill environment-setup aby przygotować środowisko."
