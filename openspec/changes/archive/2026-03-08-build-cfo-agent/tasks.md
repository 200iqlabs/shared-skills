# Tasks: Build CFO Agent

## T1: SKILL.md — agent definition
- [x] Replace placeholder with full SKILL.md (~115 lines)
- [x] YAML frontmatter: name, description (pushy, PL+EN keywords)
- [x] Behavioral triggers (ile mamy kasy, ile wydaliśmy, MRR, scenario analysis)
- [x] Reference file table with load conditions
- [x] Sharp boundaries with tax-advisor, business-consultant, legal, coach-the-five
- [x] Response format guidelines (data provenance, trends, recommendations)

## T2: Reference files
- [x] `references/financial-analysis-frameworks.md` — Unit Economics, Break-even, DuPont, Scenario analysis, Cash Flow, Runway, Cost Optimization
- [x] `references/saas-metrics.md` — MRR/ARR, churn, CAC/LTV, ARPU, Gross Margin, Burn Multiple, Rule of 40, Quick Diagnostic

## T3: Revolut scripts
- [x] `scripts/get_balances.py` — GET /accounts, --currency, --active-only, JSON output
- [x] `scripts/get_transactions.py` — GET /transactions, --from, --to, --type, --count, auto-pagination

## T4: Stripe scripts
- [x] `scripts/get_subscriptions.py` — GET /v1/subscriptions, --status, --limit, auto-pagination
- [x] `scripts/get_mrr.py` — Calculate MRR from active subs, interval normalization, --currency, --detailed
- [x] `scripts/get_revenue.py` — GET /v1/invoices, --from, --to, --status, revenue by currency and month

## T5: inFakt scripts
- [x] `scripts/get_invoices.py` — GET /api/v3/invoices.json, --unpaid, --from, --to, auto-pagination
- [x] `scripts/get_costs.py` — GET /api/v3/costs.json, --from, --to, --group-by category/month

## T6: Environment config
- [x] Updated `tools/common/.env.example` with STRIPE_SECRET_KEY and INFAKT_API_KEY
