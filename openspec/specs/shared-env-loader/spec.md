## Requirements

### Requirement: Shared load_env function
The system SHALL provide a shared Python function `load_env()` in `tools/common/env.py` that loads environment variables from a `.env` file.

#### Scenario: Load existing .env file
- **WHEN** `load_env()` is called with a path to an existing `.env` file
- **THEN** all key-value pairs from the file SHALL be loaded into `os.environ`

#### Scenario: Missing .env file
- **WHEN** `load_env()` is called and the `.env` file does not exist
- **THEN** the function SHALL print an error to stderr and exit with code 1

#### Scenario: Default .env path
- **WHEN** `load_env()` is called without arguments
- **THEN** it SHALL default to `tools/common/.env` relative to the project root

### Requirement: CFO scripts use shared module
All Python scripts in `agents/cfo/scripts/` SHALL import `load_env` from the shared module instead of defining it locally.

#### Scenario: No local load_env definition
- **WHEN** any CFO script in `agents/cfo/scripts/` is inspected
- **THEN** it SHALL NOT contain a local `load_env()` function definition

#### Scenario: Import from shared module
- **WHEN** any CFO script needs to load environment variables
- **THEN** it SHALL import from `tools/common/env`

### Requirement: Backward compatibility
The migration SHALL NOT change observable behavior of any script.

#### Scenario: Scripts produce identical output
- **WHEN** any CFO script is executed before and after the migration with the same `.env` and arguments
- **THEN** the output SHALL be identical
