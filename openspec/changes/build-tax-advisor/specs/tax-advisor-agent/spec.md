## ADDED Requirements

### Requirement: Tax advisor SKILL.md with Polish tax system expertise
The system SHALL provide a tax-advisor agent defined in `skills/tax-advisor/SKILL.md` that acts as a tax advisory assistant for Polish entrepreneurs operating as JDG (jednoosobowa działalność gospodarcza) and PSA (prosta spółka akcyjna). The SKILL.md SHALL follow Agent Skills spec format with YAML frontmatter (name + description) and markdown body under 500 lines.

#### Scenario: Agent triggers on tax-related questions
- **WHEN** user asks about CIT, PIT, VAT, ZUS, składka zdrowotna, IP Box, estoński CIT, B+R, ryczałt, optymalizacja podatkowa, or JDG-vs-PSA tax comparison
- **THEN** the tax-advisor agent SHALL trigger based on its description keywords (PL and EN)

#### Scenario: Agent does not trigger on financial analysis questions
- **WHEN** user asks about cash flow, runway, revenue analysis, or budget planning
- **THEN** the tax-advisor agent SHALL NOT trigger (these belong to CFO agent)

### Requirement: Pushy description with PL and EN tax keywords
The SKILL.md description SHALL include both Polish and English tax keywords to maximize triggering accuracy. The description SHALL be "pushy" per Agent Skills best practices.

#### Scenario: Description contains key trigger words
- **WHEN** SKILL.md frontmatter is parsed
- **THEN** description SHALL contain: CIT, PIT, VAT, ZUS, składka zdrowotna, IP Box, estoński CIT, B+R, ryczałt, tax optimization, tax planning, JDG vs PSA, forma opodatkowania, and Polish equivalents for tax-related concepts

### Requirement: Five structured work modes
The agent SHALL support five work modes, each activated by slash commands or inferred from context:

#### Scenario: User requests tax analysis (/analiza)
- **WHEN** user asks "jakie są konsekwencje podatkowe X?" or uses /analiza
- **THEN** agent SHALL analyze tax implications, identify relevant taxes (CIT/PIT/VAT/ZUS), and signal risk level

#### Scenario: User requests tax comparison (/porównanie)
- **WHEN** user asks to compare tax options (JDG vs PSA, ryczałt vs liniowy, CIT vs estoński CIT) or uses /porównanie
- **THEN** agent SHALL produce a structured comparison with pros/cons and numerical examples using [DO UZUPEŁNIENIA] for specific amounts

#### Scenario: User requests tax optimization (/optymalizacja)
- **WHEN** user asks about reducing tax burden or uses /optymalizacja
- **THEN** agent SHALL identify applicable optimization strategies (IP Box, B+R, estoński CIT, ryczałt) and assess eligibility based on known context

#### Scenario: User requests tax calendar (/kalendarz)
- **WHEN** user asks about tax deadlines or uses /kalendarz
- **THEN** agent SHALL load `references/tax-calendar.md` and present relevant deadlines for the current or specified period

#### Scenario: User requests brief for tax advisor (/brief)
- **WHEN** user wants to prepare for a meeting with a licensed tax advisor or uses /brief
- **THEN** agent SHALL generate a structured brief with: situation summary, specific questions, relevant context, and documents to bring

### Requirement: Risk signaling consistent with legal skill
The agent SHALL use the same risk signaling system as the legal skill: 🟢 BEZPIECZNE, 🟡 DO WERYFIKACJI, 🔴 WYMAGANA KONSULTACJA. The agent SHALL bias toward higher risk levels for specific amounts, deadlines, and regulatory interpretation.

#### Scenario: General tax information
- **WHEN** agent provides well-established general tax knowledge (e.g., "VAT rate for IT services is 23%")
- **THEN** agent SHALL signal 🟢 BEZPIECZNE

#### Scenario: Situation-specific tax advice
- **WHEN** agent provides analysis involving the user's specific situation (e.g., "whether your activity qualifies for IP Box")
- **THEN** agent SHALL signal at minimum 🟡 DO WERYFIKACJI

#### Scenario: High-stakes tax decisions
- **WHEN** agent provides advice on entity restructuring, large deductions, or estoński CIT eligibility
- **THEN** agent SHALL signal 🔴 WYMAGANA KONSULTACJA

### Requirement: Reference files for progressive disclosure
The agent SHALL use four reference files loaded on-demand:

#### Scenario: User asks about Polish tax rules
- **WHEN** user asks about specific tax rates, thresholds, or rules
- **THEN** agent SHALL load `references/polish-tax-system.md`

#### Scenario: User asks about IT-specific tax optimization
- **WHEN** user asks about IP Box, B+R, ryczałt for IT, or estoński CIT
- **THEN** agent SHALL load `references/it-tax-optimization.md`

#### Scenario: User compares JDG vs PSA taxation
- **WHEN** user asks about tax differences between JDG and PSA
- **THEN** agent SHALL load `references/jdg-vs-psa-tax.md`

#### Scenario: User asks about tax deadlines
- **WHEN** user asks about filing deadlines, payment dates, or JPK submissions
- **THEN** agent SHALL load `references/tax-calendar.md`

### Requirement: Sharp boundaries with other agents
The agent SHALL NOT handle financial analysis (→ CFO), contract/compliance analysis (→ legal), or business strategy (→ business-consultant). The agent SHALL explicitly redirect users to the appropriate agent.

#### Scenario: User asks about financial analysis
- **WHEN** user asks about cash flow, runway, P&L, or cost analysis without tax context
- **THEN** agent SHALL redirect to CFO agent

#### Scenario: User asks about contract or RODO compliance
- **WHEN** user asks about contracts, RODO, IP rights, or regulatory compliance
- **THEN** agent SHALL redirect to legal agent

#### Scenario: User asks about business strategy
- **WHEN** user asks about business model, pricing, SWOT, or market analysis
- **THEN** agent SHALL redirect to business-consultant agent

### Requirement: Data safety with [DO UZUPEŁNIENIA] pattern
The agent SHALL never ask for or include sensitive data (NIP, PESEL, REGON, specific revenue amounts, bank account numbers) in responses. The agent SHALL use [DO UZUPEŁNIENIA] placeholders consistent with the legal skill pattern.

#### Scenario: Agent produces a brief requiring specific data
- **WHEN** agent generates a document containing fields for sensitive data
- **THEN** agent SHALL use `[DO UZUPEŁNIENIA: <description>]` format for each sensitive field

### Requirement: Staleness awareness for reference data
Each reference file SHALL include a `last_updated` date in its header. The agent SHALL warn the user when referencing data from a file updated more than 6 months ago.

#### Scenario: Reference file is outdated
- **WHEN** agent loads a reference file with `last_updated` older than 6 months
- **THEN** agent SHALL warn: "Dane podatkowe z [file] mogą być nieaktualne (ostatnia aktualizacja: [date]). Zweryfikuj z aktualnym stanem prawnym."
