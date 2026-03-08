## MODIFIED Requirements

### Requirement: CFO agent SKILL.md with reactive financial advisor persona
The system SHALL provide a CFO agent defined in `skills/cfo/SKILL.md` that acts as a reactive financial advisor. The agent SHALL respond to financial questions by gathering context from static files and dynamic API data. The SKILL.md SHALL follow Agent Skills spec format with YAML frontmatter (name + description) and markdown body under 500 lines.

#### Scenario: Agent triggers on financial questions
- **WHEN** user asks about cash flow, runway, budget, costs, revenue, or profitability
- **THEN** the CFO agent SHALL trigger based on its description keywords (PL and EN)

#### Scenario: Agent gathers context before answering
- **WHEN** user asks a financial question
- **THEN** agent SHALL first check `context/finances.md` for static context and use appropriate scripts for live data

#### Scenario: Agent reports missing data
- **WHEN** required data is not available (missing context file or unconfigured API)
- **THEN** agent SHALL explicitly state what data is missing and how to provide it

### Requirement: Pushy description with PL and EN keywords
The SKILL.md description SHALL include both Polish and English financial keywords to maximize triggering accuracy. The description SHALL be "pushy" per Agent Skills best practices — undertriggering is worse than overtriggering.

#### Scenario: Description contains key trigger words
- **WHEN** SKILL.md frontmatter is parsed
- **THEN** description SHALL contain: cash flow, runway, burn rate, revenue, costs, profitability, budget, MRR, ARR, churn, CAC, LTV, and Polish equivalents

### Requirement: Sharp boundaries with other agents
The agent SHALL NOT handle tax optimization (→ tax-advisor), business strategy (→ business-consultant), contract analysis (→ legal), or company valuation (→ coach-the-five). The agent SHALL explicitly redirect users to the appropriate agent.

#### Scenario: User asks about tax optimization
- **WHEN** user asks about CIT, VAT, PIT, ZUS, IP Box, or estoński CIT
- **THEN** agent SHALL redirect to tax-advisor agent

#### Scenario: User asks about business strategy
- **WHEN** user asks about business model, SWOT, pivot, or competitive analysis
- **THEN** agent SHALL redirect to business-consultant agent

### Requirement: Reference files for financial analysis
The agent SHALL include two reference files loaded on-demand via progressive disclosure: `references/financial-analysis-frameworks.md` (Unit Economics, Break-even, DuPont, Scenario analysis, Cash Flow, Runway, Cost Optimization) and `references/saas-metrics.md` (MRR/ARR, churn, CAC/LTV, ARPU, Gross Margin, Burn Multiple, Rule of 40).

#### Scenario: User asks for financial analysis
- **WHEN** user requests analysis involving frameworks (break-even, scenario planning, unit economics)
- **THEN** agent SHALL load `references/financial-analysis-frameworks.md`

#### Scenario: User asks about SaaS metrics
- **WHEN** user asks about MRR, churn, CAC/LTV, or SaaS health
- **THEN** agent SHALL load `references/saas-metrics.md`

### Requirement: Response format with data provenance
The agent SHALL always include data source attribution (Revolut/Stripe/inFakt/context) in responses, show trends when historical data is available, and provide actionable recommendations.

#### Scenario: Agent presents financial data
- **WHEN** agent responds with financial figures
- **THEN** response SHALL indicate the source of data and include comparison with previous period when available

### Requirement: Skill location follows plugin standard
All agent skills SHALL be located in `skills/<name>/SKILL.md` at the plugin root, following Claude Code plugin auto-discovery convention. The `license` field in SKILL.md frontmatter SHALL be `Apache-2.0` or omitted.

#### Scenario: Plugin auto-discovery finds skills
- **WHEN** Claude Code scans the plugin directory
- **THEN** all skills in `skills/*/SKILL.md` SHALL be discovered automatically without explicit path references in plugin.json
