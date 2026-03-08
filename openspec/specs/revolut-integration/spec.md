## ADDED Requirements

### Requirement: Fetch account balances from Revolut Business API
The system SHALL provide `skills/cfo/scripts/get_balances.py` that fetches all account balances via `GET /api/1.0/accounts`. The script SHALL output JSON to stdout, support `--currency` filter and `--active-only` flag, and authenticate using Bearer token from `REVOLUT_API_KEY` env var.

#### Scenario: Fetch all balances
- **WHEN** script is run without arguments
- **THEN** it SHALL return JSON array of all accounts with id, name, balance, currency, state

#### Scenario: Filter by currency
- **WHEN** script is run with `--currency EUR`
- **THEN** it SHALL return only EUR-denominated accounts

#### Scenario: Missing API key
- **WHEN** `REVOLUT_API_KEY` is not set
- **THEN** script SHALL output JSON error message and exit with code 1

### Requirement: Fetch transactions from Revolut Business API
The system SHALL provide `skills/cfo/scripts/get_transactions.py` that fetches transactions via `GET /api/1.0/transactions` with date range filtering. The script SHALL support `--from`, `--to`, `--type`, and `--count` parameters, handle pagination automatically, and output JSON to stdout.

#### Scenario: Fetch transactions for date range
- **WHEN** script is run with `--from 2026-01-01 --to 2026-01-31`
- **THEN** it SHALL return all transactions within that date range

#### Scenario: Filter by transaction type
- **WHEN** script is run with `--type card_payment`
- **THEN** it SHALL return only card payment transactions

#### Scenario: Automatic pagination
- **WHEN** result set exceeds page size
- **THEN** script SHALL automatically paginate using time-based cursor and return all results

#### Scenario: Default date range
- **WHEN** script is run without `--from` and `--to`
- **THEN** it SHALL default to last 30 days

### Requirement: Environment configuration via shared .env
All Revolut scripts SHALL load credentials from `tools/common/.env` using a shared `load_env()` function. The `REVOLUT_API_URL` SHALL default to `https://b2b.revolut.com/api/1.0` if not set.

#### Scenario: .env file exists
- **WHEN** `tools/common/.env` exists with `REVOLUT_API_KEY`
- **THEN** scripts SHALL use the configured key

#### Scenario: Sandbox configuration
- **WHEN** `REVOLUT_API_URL` is set to sandbox URL
- **THEN** scripts SHALL use the sandbox endpoint
