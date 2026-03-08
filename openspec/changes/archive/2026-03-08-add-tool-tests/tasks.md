## 1. Setup

- [x] 1.1 Add pytest configuration (pytest marker `live_api` registration) in `pyproject.toml` or `pytest.ini`
- [x] 1.2 Create `tests/conftest.py` with `.env` loading fixture — `pytest.fail()` with clear message on missing keys for `live_api` marked tests
- [x] 1.3 Add `requirements-dev.txt` with `pytest` dependency

## 2. Revolut Integration Tests (tools/ + agents/cfo/)

- [x] 2.1 Create `tests/test_revolut.py` — test `tools/revolut/get_balance.py`: valid JSON, list response, expected fields (id, balance, currency)
- [x] 2.2 Add test for `tools/revolut/get_transactions.py` JSON output: valid JSON, list response
- [x] 2.3 Add test for `tools/revolut/get_transactions.py` CSV output: header line validation
- [x] 2.4 Add test for `agents/cfo/scripts/get_balances.py`: valid JSON, expected structure, currency filter
- [x] 2.5 Add test for `agents/cfo/scripts/get_transactions.py`: valid JSON, expected structure

## 3. ClickUp Integration Tests

- [x] 3.1 Create `tests/test_clickup.py` — test `get_tasks.sh`: valid JSON, "tasks" key present
- [x] 3.2 Add mock test for `create_task.sh`: validate JSON payload construction with correct fields
- [x] 3.3 Add mock test for `create_task.sh`: special character escaping in name/description

## 4. Stripe Integration Tests (agents/cfo/)

- [x] 4.1 Create `tests/test_stripe.py` — test `get_subscriptions.py`: valid JSON, expected structure
- [x] 4.2 Add test for `get_revenue.py`: valid JSON, revenue summary structure
- [x] 4.3 Add test for `get_mrr.py`: valid JSON, MRR output structure

## 5. inFakt Integration Tests (agents/cfo/)

- [x] 5.1 Create `tests/test_infakt.py` — test `get_invoices.py`: valid JSON, expected structure
- [x] 5.2 Add test for `get_costs.py`: valid JSON, expected structure

## 6. Unit Tests — Business Logic (agents/cfo/)

- [x] 6.1 Create `tests/test_cfo_logic.py` — unit test `calculate_mrr()`: interval normalization (yearly÷12, weekly×52/12), currency grouping
- [x] 6.2 Add unit test for `summarize_costs()`: grouping by category and month, correct totals
- [x] 6.3 Add unit test for `summarize_invoices()`: net/gross totals calculation
- [x] 6.4 Add unit test for `summarize_revenue()`: currency/month grouping, timestamp conversion

## 7. Fix Known Bugs

- [x] 7.1 Fix JSON injection vulnerability in `create_task.sh` — escape `$NAME` and `$DESC` before embedding in JSON payload
