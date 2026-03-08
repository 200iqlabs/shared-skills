## 1. Shared Module

- [x] 1.1 Create `tools/common/env.py` with `load_env()` function extracted from CFO scripts
- [x] 1.2 Ensure default path resolution works from any script location (project root relative)

## 2. Migrate CFO Scripts

- [x] 2.1 Update `agents/cfo/scripts/get_balances.py` — replace local `load_env()` with import from `tools/common/env`
- [x] 2.2 Update `agents/cfo/scripts/get_transactions.py`
- [x] 2.3 Update `agents/cfo/scripts/get_subscriptions.py`
- [x] 2.4 Update `agents/cfo/scripts/get_mrr.py`
- [x] 2.5 Update `agents/cfo/scripts/get_invoices.py`
- [x] 2.6 Update `agents/cfo/scripts/get_costs.py`
- [x] 2.7 Update `agents/cfo/scripts/get_revenue.py`

## 3. Verify

- [x] 3.1 Run existing tests (`pytest tests/`) to confirm no regression
