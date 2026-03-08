## ADDED Requirements

### Requirement: Test runner configuration
System SHALL use pytest as the sole test runner. Test files SHALL reside in `tests/` directory. Configuration SHALL be defined in `pyproject.toml` or `pytest.ini`.

#### Scenario: Running all tests
- **WHEN** developer runs `pytest tests/`
- **THEN** all test files in `tests/` are discovered and executed

#### Scenario: Running only live API tests
- **WHEN** developer runs `pytest tests/ -m live_api`
- **THEN** only tests marked with `@pytest.mark.live_api` are executed

### Requirement: Environment loading with clear error messages
The test framework SHALL load API keys from `tools/common/.env`. When required keys are missing, tests SHALL fail with a message specifying which key is missing and how to set it up.

#### Scenario: All keys present
- **WHEN** `tools/common/.env` exists with all required keys
- **THEN** tests proceed normally using those keys

#### Scenario: Missing API key
- **WHEN** a test requires `REVOLUT_API_KEY` but it is not set in `.env`
- **THEN** the test SHALL fail with message containing "REVOLUT_API_KEY not set" and "Copy tools/common/.env.example"

#### Scenario: Missing .env file
- **WHEN** `tools/common/.env` does not exist
- **THEN** live_api tests SHALL fail with message containing ".env not found" and setup instructions

### Requirement: Revolut read-only integration tests
The system SHALL test Revolut API read operations against the real API. Tests SHALL validate response shape, not specific values.

#### Scenario: Get balance returns valid account data
- **WHEN** `get_balance.py` is executed with valid API credentials
- **THEN** output SHALL be valid JSON, SHALL be a list, and each item SHALL contain "id", "balance", and "currency" fields

#### Scenario: Get transactions returns valid transaction data
- **WHEN** `get_transactions.py` is executed with valid API credentials and `--days 7`
- **THEN** output SHALL be valid JSON and SHALL be a list

#### Scenario: Get transactions CSV format
- **WHEN** `get_transactions.py` is executed with `--format csv`
- **THEN** output SHALL contain a header line "date,description,amount,currency,type"

### Requirement: ClickUp read-only integration tests
The system SHALL test ClickUp API read operations against the real API.

#### Scenario: Get tasks returns valid data
- **WHEN** `get_tasks.sh` is executed with a valid list ID and API token
- **THEN** output SHALL be valid JSON and SHALL contain a "tasks" key

### Requirement: ClickUp write operation mock tests
The system SHALL test ClickUp write operations using mocked HTTP calls. Tests SHALL validate argument parsing and payload construction without making real API calls.

#### Scenario: Create task builds correct JSON payload
- **WHEN** `create_task.sh` is called with list_id="123", name="Test Task", description="A description"
- **THEN** the curl command SHALL receive a valid JSON payload with "name" and "description" fields matching the input

#### Scenario: Create task handles special characters
- **WHEN** `create_task.sh` is called with name containing quotes or special characters
- **THEN** the JSON payload SHALL properly escape those characters

### Requirement: CFO Revolut integration tests
The system SHALL test CFO agent Revolut scripts against the real API.

#### Scenario: Get balances returns valid data
- **WHEN** `agents/cfo/scripts/get_balances.py` is executed with valid Revolut credentials
- **THEN** output SHALL be valid JSON containing a "accounts" key with a list, each item containing "id", "balance", and "currency"

#### Scenario: Get balances filtered by currency
- **WHEN** `get_balances.py` is executed with `--currency PLN`
- **THEN** all returned accounts SHALL have currency "PLN"

#### Scenario: Get transactions with pagination
- **WHEN** `agents/cfo/scripts/get_transactions.py` is executed with valid credentials
- **THEN** output SHALL be valid JSON containing a "transactions" key with a list

### Requirement: CFO Stripe integration tests
The system SHALL test CFO agent Stripe scripts against the real API.

#### Scenario: Get subscriptions returns valid data
- **WHEN** `agents/cfo/scripts/get_subscriptions.py` is executed with valid Stripe credentials
- **THEN** output SHALL be valid JSON containing "subscriptions" key with a list and "total" key with a number

#### Scenario: Get revenue returns valid data
- **WHEN** `agents/cfo/scripts/get_revenue.py` is executed with valid Stripe credentials
- **THEN** output SHALL be valid JSON containing revenue summary grouped by currency

### Requirement: CFO inFakt integration tests
The system SHALL test CFO agent inFakt scripts against the real API.

#### Scenario: Get invoices returns valid data
- **WHEN** `agents/cfo/scripts/get_invoices.py` is executed with valid inFakt credentials
- **THEN** output SHALL be valid JSON containing "invoices" key with a list and "summary" with totals

#### Scenario: Get costs returns valid data
- **WHEN** `agents/cfo/scripts/get_costs.py` is executed with valid inFakt credentials
- **THEN** output SHALL be valid JSON containing "costs" key with a list and "summary" with totals

### Requirement: CFO business logic unit tests
The system SHALL unit test business logic functions without API calls. Tests SHALL use fixture data and validate calculations.

#### Scenario: MRR calculation normalizes intervals
- **WHEN** `calculate_mrr()` receives subscriptions with yearly, monthly, and weekly intervals
- **THEN** all amounts SHALL be normalized to monthly values (yearly÷12, weekly×52/12)

#### Scenario: MRR calculation groups by currency
- **WHEN** `calculate_mrr()` receives subscriptions in PLN and EUR
- **THEN** result SHALL contain separate MRR entries per currency

#### Scenario: Cost summarization groups by category
- **WHEN** `summarize_costs()` receives costs with `--group-by category`
- **THEN** result SHALL contain per-category breakdown with net, gross, and count

#### Scenario: Cost summarization groups by month
- **WHEN** `summarize_costs()` receives costs with `--group-by month`
- **THEN** result SHALL contain per-month breakdown sorted chronologically

#### Scenario: Invoice summarization calculates totals
- **WHEN** `summarize_invoices()` receives a list of invoices
- **THEN** result SHALL contain correct sum of net and gross amounts

#### Scenario: Revenue summarization groups by currency and month
- **WHEN** `summarize_revenue()` receives Stripe invoices in multiple currencies
- **THEN** result SHALL contain per-currency, per-month breakdown

### Requirement: Test isolation
Mock tests and unit tests SHALL NOT require API credentials. Live API tests SHALL NOT modify external state (read-only operations only).

#### Scenario: Mock and unit tests run without credentials
- **WHEN** no `.env` file exists
- **THEN** tests NOT marked with `live_api` SHALL still pass

#### Scenario: Live tests are read-only
- **WHEN** live API tests execute
- **THEN** no data SHALL be created, modified, or deleted in external systems
