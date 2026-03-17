## MODIFIED Requirements

### Requirement: Context gathering before answering
The agent SHALL load data from context files in `context/` directory BEFORE providing analysis. Specifically, the agent SHALL read `context/legal-entities.md` (required) and `context/company.md` (recommended) at session start. The agent SHALL NOT reference `company/` directory or any other legacy context paths. When context files provide insufficient data for the question at hand, the agent SHALL ask clarifying questions rather than guessing.

#### Scenario: Context data loaded successfully
- **WHEN** user asks a tax question and `context/legal-entities.md` exists
- **THEN** agent SHALL read the file and use entity data (business form, profile, relationships) to inform the analysis without re-asking

#### Scenario: Missing context for comparison
- **WHEN** user asks to compare tax options without providing income or cost data
- **THEN** agent SHALL ask 2-3 targeted questions before proceeding

#### Scenario: Context directory reference standardization
- **WHEN** the agent gathers context from files
- **THEN** it SHALL look only in `context/` directory (e.g., `context/legal-entities.md`, `context/company.md`), never in `company/` or other legacy paths

#### Scenario: Missing required context file
- **WHEN** a required context file (e.g., `context/legal-entities.md`) does not exist
- **THEN** the agent SHALL display: "Brakuje pliku [nazwa]. Uruchom skill environment-setup aby przygotować środowisko." and then ask the user directly for the needed information to proceed

#### Scenario: Missing recommended context file
- **WHEN** a recommended context file (e.g., `context/company.md`) does not exist
- **THEN** the agent SHALL proceed without it but MAY suggest creating it for richer analysis
