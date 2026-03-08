## Context

The CFO agent is part of Phase 2 of the shared-skills multi-agent system. Phase 1 delivered three agents (business-consultant, coach-the-five, linkedin-content) that established patterns for SKILL.md structure, reference files, and progressive disclosure. The CFO agent follows these patterns but introduces a new element: external API integrations via Python scripts.

Current state: placeholder SKILL.md (9 lines). Target: fully functional reactive financial advisor with 7 Python scripts connecting to Revolut Business, Stripe, and inFakt APIs.

## Goals / Non-Goals

**Goals:**
- Reactive CFO agent that answers financial questions without a formal workflow
- Live data access from three external sources (Revolut, Stripe, inFakt)
- Generic agent — no organization-specific data in SKILL.md or references
- Clear boundaries with adjacent agents (tax-advisor, business-consultant, legal, coach-the-five)

**Non-Goals:**
- MCP servers (scripts are lighter, less context overhead)
- Data caching or sync (scripts fetch on-demand)
- Multi-currency conversion (Revolut handles natively)
- Tax analysis, business strategy, legal advice

## Decisions

### 1. Reactive agent pattern (no workflow)

**Decision:** CFO responds to questions directly without a multi-step workflow.
**Rationale:** Unlike business-consultant (discovery → analysis → design → estimation → presentation), CFO questions are typically direct ("how much cash do we have?", "what's our MRR?"). A workflow adds friction without value.
**Alternative considered:** Structured workflow like business-consultant. Rejected because CFO interactions are Q&A, not consulting engagements.

### 2. Python scripts over MCP servers

**Decision:** Each integration is a standalone Python script with `--help`, JSON output, and `argparse`.
**Rationale:** Scripts are simpler, don't consume context window for tool definitions, and can be run independently. MCP servers would add complexity (server lifecycle, OAuth flows) without clear benefit for read-only data fetching.
**Alternative considered:** MCP servers per PRD's future roadmap. Deferred — scripts sufficient for MVP.

### 3. Shared load_env() in each script (no shared module)

**Decision:** Each script contains its own `load_env()` function that reads `tools/common/.env`.
**Rationale:** Avoids Python packaging complexity (no `__init__.py`, no pip install, no import paths). Scripts are self-contained — you can copy one script and it works. The `load_env()` is 8 lines of duplicated code, acceptable trade-off.
**Alternative considered:** Shared `utils.py` module imported by all scripts. Rejected because it introduces import path issues when scripts are run from different directories.

### 4. Three data sources, not one

**Decision:** Revolut (cash/transactions), Stripe (subscriptions/revenue), inFakt (invoices/costs).
**Rationale:** Each source provides different financial data. Revolut = what's in the bank. Stripe = what customers are paying. inFakt = accounting view with categorization. Together they give a complete financial picture.
**Alternative considered:** Revolut-only (defer Stripe/inFakt). Rejected because MRR from Stripe and cost categorization from inFakt are essential for SaaS financial analysis.

### 5. JSON output only (no human-readable mode)

**Decision:** All scripts output JSON to stdout. Human-readable formatting is the agent's job.
**Rationale:** Agent can parse JSON and present it in the most appropriate format for the question. Adding `--summary` or `--format` flags adds complexity without clear need.
**Alternative considered:** Dual output (JSON + human-readable). Rejected — agent handles presentation.

### 6. Credentials in shared tools/common/.env

**Decision:** All API keys in one shared `.env` file, not per-agent.
**Rationale:** Simpler management — one file to configure. Keys are used across agents (e.g., Revolut might also be needed by future tax-advisor scripts). `.env.example` serves as documentation.
**Alternative considered:** Per-agent `.env` files. Rejected — leads to duplication and confusion.

### 7. Two reference files, not three

**Decision:** `financial-analysis-frameworks.md` and `saas-metrics.md`. No `psa-jdg-finance.md`.
**Rationale:** CFO is generic. Polish business entity specifics (PSA vs JDG) belong in `context/` of the consuming repo, not in the shared skill. If needed later, can be added as a reference.
**Alternative considered:** Include `psa-jdg-finance.md` for Polish entity context. Rejected for genericity.

## Risks / Trade-offs

**[Risk] API authentication complexity (especially Revolut OAuth)** → Revolut Business API uses OAuth2 with access tokens that expire. Current implementation uses Bearer token directly. If token refresh is needed, `get_balances.py` will need an OAuth flow or a refresh script. Mitigation: start with long-lived sandbox tokens; add refresh mechanism when moving to production.

**[Risk] inFakt API query parameter format unclear** → Documentation shows both query params and JSON body for filtering. Current implementation tries both approaches. Mitigation: test against live API and adjust.

**[Risk] Stripe MRR calculation edge cases** → Subscriptions with trials, discounts, metered billing, or multi-currency complicate MRR. Current implementation handles interval normalization but not trials/discounts. Mitigation: acceptable for MVP; add discount handling when needed.

**[Risk] load_env() duplication across 7 scripts** → Same 8-line function copy-pasted. If .env format changes, all scripts need updating. Mitigation: acceptable for 7 scripts. If script count grows significantly, refactor to shared module.

**[Trade-off] No data caching** → Every question triggers fresh API calls. This adds latency but ensures data freshness. Acceptable for interactive use where questions are infrequent.

## Open Questions

- Revolut OAuth token lifecycle: how long do tokens last? Do we need a refresh script?
- inFakt API: what fields does the costs endpoint actually return? Documentation is sparse on response schema.
- Should `get_mrr.py` support historical MRR comparison (current month vs previous)?
