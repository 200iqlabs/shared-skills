## Purpose

The Polish tax advisor skill — what it covers, the five modes it works in, the context it gathers before answering, how it signals risk and attributes its sources, where its boundaries against the other agents run, and how it behaves when data is missing or its reference figures have aged.

## Requirements

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
The agent SHALL load data from context files in `context/` directory BEFORE providing analysis. Specifically, the agent SHALL read `context/legal-entities.md` (required) and `context/company.md` (recommended) at session start. The agent SHALL NOT reference `company/` directory or any other legacy context paths. When context files provide insufficient data for the question at hand, the agent SHALL ask clarifying questions rather than guessing.

#### Scenario: Context data loaded successfully
- **WHEN** user asks a tax question and `context/legal-entities.md` exists
- **THEN** agent SHALL read the file and use entity data (business form, profile, relationships) to inform the analysis without re-asking

#### Scenario: Missing context for comparison
- **WHEN** user asks to compare tax options without providing income or cost data
- **THEN** agent SHALL ask 2-3 targeted questions before proceeding

#### Scenario: Context directory reference standardization
- **WHEN** the agent gathers context from files
- **THEN** it SHALL look only in `context/` directory (e.g., `context/legal-entities.md`, `context/company.md`), never in `company/` or other legacy paths

#### Scenario: Missing required context file
- **WHEN** a required context file (e.g., `context/legal-entities.md`) does not exist
- **THEN** the agent SHALL display: "Brakuje pliku [nazwa]. Uruchom skill environment-setup aby przygotować środowisko." and then ask the user directly for the needed information to proceed

#### Scenario: Missing recommended context file
- **WHEN** a recommended context file (e.g., `context/company.md`) does not exist
- **THEN** the agent SHALL proceed without it but MAY suggest creating it for richer analysis

### Requirement: Inline risk signaling consistent with legal skill
The agent SHALL use risk markers (🟢 BEZPIECZNE, 🟡 DO WERYFIKACJI, 🔴 WYMAGANA KONSULTACJA) INLINE next to specific claims, not as a document-level header. Exception: /brief mode skips risk signaling entirely (it's redundant when preparing for a consultation).

#### Scenario: A claim carries uncertainty

- **WHEN** the agent states a rate, threshold or interpretation whose certainty is not uniform
- **THEN** it SHALL place the risk marker inline beside that claim, and SHALL NOT gather the markers into a document-level header

#### Scenario: The agent is preparing a brief

- **WHEN** the agent is working in `/brief` mode
- **THEN** it SHALL omit risk signalling entirely, the brief being written to be taken to a consultation

### Requirement: Source attribution for data provenance
The agent SHALL cite the source and validity period for specific rates, thresholds, and deadlines: reference file name + last_updated date + when the data expires (e.g., "stawki ważne do końca roku podatkowego 2026"). General knowledge SHALL be marked as such.

#### Scenario: A specific rate or deadline is quoted

- **WHEN** the reply states a rate, threshold or deadline drawn from a reference file
- **THEN** it SHALL name the file, its `last_updated` date, and the period for which the figure holds

#### Scenario: The answer rests on general knowledge

- **WHEN** the reply draws on general knowledge rather than a reference file
- **THEN** it SHALL say so, so the reader can tell a sourced figure from an unsourced one

### Requirement: Sharp boundaries with other agents
The agent SHALL NOT handle financial analysis (→ CFO), contract/compliance analysis (→ legal), or business strategy (→ business-consultant). The agent SHALL explicitly redirect users to the appropriate agent.

#### Scenario: The question belongs to another agent

- **WHEN** the user asks for financial analysis, contract or compliance review, or business strategy
- **THEN** the agent SHALL not answer it here, and SHALL name the agent that owns it — CFO, legal, or business-consultant respectively

### Requirement: Data safety with [DO UZUPEŁNIENIA] pattern
The agent SHALL never include sensitive data (NIP, PESEL, REGON, specific revenue amounts, bank account numbers) in responses. The agent SHALL use [DO UZUPEŁNIENIA] placeholders only in output documents (briefs, templates), not in analytical content.

#### Scenario: Sensitive identifiers would otherwise appear

- **WHEN** an answer would carry a NIP, PESEL, REGON, a specific revenue figure or a bank account number
- **THEN** the agent SHALL leave them out of the reply

#### Scenario: An output document needs a value only the user holds

- **WHEN** the agent produces a brief or template containing a field it must not fill itself
- **THEN** it SHALL mark that field `[DO UZUPEŁNIENIA]`, and SHALL NOT use that placeholder inside analytical prose

### Requirement: Reference data staleness awareness
Each reference file SHALL include a `last_updated` date. The agent SHALL warn when data is older than 6 months and indicate the natural expiration cycle of the data (annual for rates, quarterly for ZUS bases, etc.).

#### Scenario: A reference file has aged

- **WHEN** the agent uses a reference file whose `last_updated` date is more than six months old
- **THEN** it SHALL warn that the figures may have moved, and SHALL name the cycle on which they are revised — annual for rates, quarterly for the ZUS basis
