## ADDED Requirements

### Requirement: Fetch active subscriptions from Stripe
The system SHALL provide `agents/cfo/scripts/get_subscriptions.py` that fetches subscriptions via `GET /v1/subscriptions`. The script SHALL support `--status` filter (active, past_due, canceled, ended, all) and `--limit`, handle pagination, and output JSON with total count and subscription list.

#### Scenario: Fetch active subscriptions
- **WHEN** script is run without arguments
- **THEN** it SHALL return all active subscriptions with total count

#### Scenario: Fetch all statuses
- **WHEN** script is run with `--status all`
- **THEN** it SHALL return subscriptions regardless of status

#### Scenario: Automatic pagination
- **WHEN** there are more than 100 subscriptions
- **THEN** script SHALL paginate using `starting_after` cursor

### Requirement: Calculate MRR from active subscriptions
The system SHALL provide `agents/cfo/scripts/get_mrr.py` that calculates Monthly Recurring Revenue by summing normalized amounts from all active subscription items. The script SHALL normalize different billing intervals (day, week, month, year) to monthly amounts.

#### Scenario: Calculate MRR
- **WHEN** script is run without arguments
- **THEN** it SHALL return MRR and ARR (MRR × 12) grouped by currency

#### Scenario: Normalize yearly subscription to monthly
- **WHEN** a subscription bills 1200 PLN/year
- **THEN** it SHALL contribute 100 PLN/month to MRR

#### Scenario: Normalize weekly subscription to monthly
- **WHEN** a subscription bills 100 PLN/week
- **THEN** it SHALL contribute approximately 433.33 PLN/month to MRR (100 × 52/12)

#### Scenario: Filter by currency
- **WHEN** script is run with `--currency PLN`
- **THEN** it SHALL only include PLN-denominated subscriptions

#### Scenario: Detailed breakdown
- **WHEN** script is run with `--detailed`
- **THEN** it SHALL include per-subscription breakdown with customer and plan info

### Requirement: Fetch revenue from Stripe invoices
The system SHALL provide `agents/cfo/scripts/get_revenue.py` that fetches paid invoices for a date range via `GET /v1/invoices` and summarizes revenue by currency and month.

#### Scenario: Fetch revenue for a quarter
- **WHEN** script is run with `--from 2026-01-01 --to 2026-03-31`
- **THEN** it SHALL return total revenue and monthly breakdown grouped by currency

#### Scenario: Filter by invoice status
- **WHEN** script is run with `--status paid` (default)
- **THEN** it SHALL only include paid invoices in revenue calculation

### Requirement: Authentication via STRIPE_SECRET_KEY
All Stripe scripts SHALL authenticate using `STRIPE_SECRET_KEY` from `tools/common/.env` via HTTP Basic Auth.

#### Scenario: Missing API key
- **WHEN** `STRIPE_SECRET_KEY` is not set
- **THEN** scripts SHALL output JSON error message and exit with code 1
