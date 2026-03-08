# Proposal: Build CFO Agent

## Problem
The CFO agent is currently a placeholder (9 lines). Phase 2 of the PRD requires a fully functional financial advisor agent with integrations to external data sources (Revolut, Stripe, inFakt).

## Solution
Build a reactive CFO agent that answers financial questions by gathering context from static files (`context/finances.md` in consuming repos) and dynamic data from external APIs. No formal workflow — the agent receives a question, collects relevant data, analyzes, and responds.

### Key design decisions
- **Generic** — no organization-specific data in SKILL.md or references; all specifics come from `context/` in the consuming repo
- **Reactive, not process-driven** — unlike business-consultant, CFO doesn't follow a multi-step workflow; it responds to questions directly
- **Three external data sources**: Revolut Business (cash, transactions), Stripe (subscriptions, revenue), inFakt (invoices, costs)
- **Sharp boundaries** with tax-advisor (no tax optimization), business-consultant (no strategy), legal (no contracts)
- **Polish language** with English SaaS metrics terminology (MRR, churn, CAC/LTV)

## Capabilities
- **agent-definition**: CFO agent SKILL.md with reactive financial advisor persona, behavioral triggers, reference files, and boundaries
- **revolut-integration**: Python scripts for Revolut Business API (account balances, transaction history)
- **stripe-integration**: Python scripts for Stripe API (subscriptions, MRR calculation, revenue from invoices)
- **infakt-integration**: Python scripts for inFakt API (invoices, costs with categorization)

## Scope

### In scope
- `agents/cfo/SKILL.md` — full agent definition (~120 lines)
- `agents/cfo/references/financial-analysis-frameworks.md` — Unit Economics, Break-even, Scenario analysis
- `agents/cfo/references/saas-metrics.md` — MRR/ARR, churn, CAC/LTV definitions and benchmarks
- `agents/cfo/scripts/get_balances.py` — Revolut: account balances
- `agents/cfo/scripts/get_transactions.py` — Revolut: transactions with date/type filters
- `agents/cfo/scripts/get_subscriptions.py` — Stripe: active subscriptions
- `agents/cfo/scripts/get_mrr.py` — Stripe: calculate MRR from active subscriptions
- `agents/cfo/scripts/get_revenue.py` — Stripe: invoices/charges for a period
- `agents/cfo/scripts/get_invoices.py` — inFakt: issued/unpaid invoices
- `agents/cfo/scripts/get_costs.py` — inFakt: costs with categorization
- `tools/common/.env.example` update — add REVOLUT_TOKEN, STRIPE_KEY, INFAKT_API_KEY

### Out of scope
- Tax-related analysis (→ tax-advisor agent)
- Business strategy (→ business-consultant agent)
- Company valuation / exit (→ coach-the-five agent)
- Personal investment advice
- Operational accounting (booking entries, reconciliation)
- GUI / dashboard for financial data

## Non-goals
- Building MCP servers for any of the integrations
- Real-time data sync or caching
- Multi-currency conversion logic (Revolut handles this natively)

## References
- PRD US-003 (Agent CFO — analiza finansowa)
- PRD Section 3.3 (Agent Skills format)
- Revolut Business API: `GET /accounts`, `GET /transactions`
- Stripe API: `GET /v1/subscriptions`, `GET /v1/invoices`
- inFakt API: `GET /api/v3/invoices.json`, `GET /api/v3/costs.json` (auth: `X-inFakt-ApiKey` header)
