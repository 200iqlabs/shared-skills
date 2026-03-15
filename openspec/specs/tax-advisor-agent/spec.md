## ADDED Requirements

### Requirement: Tax advisor SKILL.md with Polish tax system expertise
The system SHALL provide a tax-advisor agent defined in `skills/tax-advisor/SKILL.md` that acts as a tax advisory assistant for Polish entrepreneurs operating as JDG (jednoosobowa działalność gospodarcza) and PSA (prosta spółka akcyjna). The SKILL.md SHALL follow Agent Skills spec format with YAML frontmatter (name + description) and markdown body under 500 lines.

#### Scenario: Agent triggers on tax-related questions
- **WHEN** user asks about CIT, PIT, VAT, ZUS, składka zdrowotna, IP Box, estoński CIT, B+R, ryczałt, optymalizacja podatkowa, or JDG-vs-PSA tax comparison
- **THEN** the tax-advisor agent SHALL trigger based on its bilingual description keywords (PL and EN)

#### Scenario: Agent does not trigger on financial analysis questions
- **WHEN** user asks about cash flow, runway, revenue analysis, or budget planning
- **THEN** the tax-advisor agent SHALL NOT trigger (these belong to CFO agent)

### Requirement: Bilingual pushy description with PL and EN tax keywords
The SKILL.md description SHALL include both Polish and English tax keywords to maximize triggering accuracy. The description SHALL be "pushy" per Agent Skills best practices. English framing with Polish terms in parentheses for routing clarity.

#### Scenario: Description contains key trigger words
- **WHEN** SKILL.md frontmatter is parsed
- **THEN** description SHALL contain: CIT, PIT, VAT, ZUS, składka zdrowotna, IP Box, estoński CIT, B+R, ryczałt, tax optimization, tax planning, JDG vs PSA, forma opodatkowania, and natural-language triggers like "ile zostanie mi netto z faktury"

### Requirement: Five structured work modes
The agent SHALL support five work modes activated by slash commands or inferred from context:

#### Scenario: /analiza mode
- **WHEN** user asks "jakie są konsekwencje podatkowe X?" or uses /analiza
- **THEN** agent SHALL gather context, analyze tax implications, identify relevant taxes, and signal risk inline per-claim

#### Scenario: /porównanie mode
- **WHEN** user asks to compare tax options or uses /porównanie
- **THEN** agent SHALL gather context (income, costs), produce structured comparison with numerical examples, and provide conditional recommendation

#### Scenario: /optymalizacja mode
- **WHEN** user asks about reducing tax burden or uses /optymalizacja
- **THEN** agent SHALL gather context, identify applicable strategies, assess eligibility, and prioritize by implementation complexity

#### Scenario: /kalendarz mode
- **WHEN** user asks about tax deadlines or uses /kalendarz
- **THEN** agent SHALL gather context (entity type, tax form, employees), load tax-calendar.md, and present only relevant deadlines

#### Scenario: /brief mode
- **WHEN** user wants to prepare for a tax advisor meeting or uses /brief
- **THEN** agent SHALL generate structured brief with: Warunki wstępne (prerequisites check), Sytuacja, Pytania do doradcy, Kontekst, Dokumenty. No risk signaling in this mode.

### Requirement: Context gathering before answering
The agent SHALL check available context files and ask clarifying questions BEFORE providing analysis, rather than scattering [DO UZUPEŁNIENIA] placeholders in analytical content. Placeholders are reserved for output documents (briefs, templates).

#### Scenario: Missing context for comparison
- **WHEN** user asks to compare tax options without providing income or cost data
- **THEN** agent SHALL ask 2-3 targeted questions before proceeding

### Requirement: Inline risk signaling consistent with legal skill
The agent SHALL use risk markers (🟢 BEZPIECZNE, 🟡 DO WERYFIKACJI, 🔴 WYMAGANA KONSULTACJA) INLINE next to specific claims, not as a document-level header. Exception: /brief mode skips risk signaling entirely (it's redundant when preparing for a consultation).

### Requirement: Source attribution for data provenance
The agent SHALL cite the source and validity period for specific rates, thresholds, and deadlines: reference file name + last_updated date + when the data expires (e.g., "stawki ważne do końca roku podatkowego 2026"). General knowledge SHALL be marked as such.

### Requirement: Sharp boundaries with other agents
The agent SHALL NOT handle financial analysis (→ CFO), contract/compliance analysis (→ legal), or business strategy (→ business-consultant). The agent SHALL explicitly redirect users to the appropriate agent.

### Requirement: Data safety with [DO UZUPEŁNIENIA] pattern
The agent SHALL never include sensitive data (NIP, PESEL, REGON, specific revenue amounts, bank account numbers) in responses. The agent SHALL use [DO UZUPEŁNIENIA] placeholders only in output documents (briefs, templates), not in analytical content.

### Requirement: Reference data staleness awareness
Each reference file SHALL include a `last_updated` date. The agent SHALL warn when data is older than 6 months and indicate the natural expiration cycle of the data (annual for rates, quarterly for ZUS bases, etc.).
