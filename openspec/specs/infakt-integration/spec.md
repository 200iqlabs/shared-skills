## ADDED Requirements

### Requirement: Fetch invoices from inFakt API
The system SHALL provide `agents/cfo/scripts/get_invoices.py` that fetches invoices via `GET /api/v3/invoices.json`. The script SHALL support `--unpaid` flag (filter by `paid_date_null=true`), `--from` and `--to` date filters, handle pagination, and output JSON with summary (count, total_net, total_gross) and invoice list.

#### Scenario: Fetch all invoices
- **WHEN** script is run without arguments
- **THEN** it SHALL return all invoices with summary totals

#### Scenario: Fetch unpaid invoices
- **WHEN** script is run with `--unpaid`
- **THEN** it SHALL return only invoices without a payment date

#### Scenario: Filter by date range
- **WHEN** script is run with `--from 2026-01-01 --to 2026-03-31`
- **THEN** it SHALL return only invoices within that date range

#### Scenario: Automatic pagination
- **WHEN** there are more invoices than per_page limit
- **THEN** script SHALL paginate using metainfo.total_pages

### Requirement: Fetch costs from inFakt API
The system SHALL provide `agents/cfo/scripts/get_costs.py` that fetches costs via `GET /api/v3/costs.json`. The script SHALL support `--from` and `--to` date filters and `--group-by` (category or month) for summarization.

#### Scenario: Fetch all costs
- **WHEN** script is run without arguments
- **THEN** it SHALL return all costs with summary (count, total_net, total_gross)

#### Scenario: Group costs by category
- **WHEN** script is run with `--group-by category`
- **THEN** it SHALL return costs grouped by category with per-category net/gross totals, sorted by gross descending

#### Scenario: Group costs by month
- **WHEN** script is run with `--group-by month`
- **THEN** it SHALL return costs grouped by month with per-month totals, sorted chronologically

#### Scenario: Filter by date range
- **WHEN** script is run with `--from 2026-01-01 --to 2026-01-31`
- **THEN** it SHALL return only costs within that date range

### Requirement: Authentication via INFAKT_API_KEY
All inFakt scripts SHALL authenticate using `X-inFakt-ApiKey` header with value from `INFAKT_API_KEY` in `tools/common/.env`.

#### Scenario: Missing API key
- **WHEN** `INFAKT_API_KEY` is not set
- **THEN** scripts SHALL output JSON error message and exit with code 1
