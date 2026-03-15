## ADDED Requirements

### Requirement: Tax advisor agent SKILL.md with structured advisory persona
The system SHALL provide a tax-advisor agent defined in `skills/tax-advisor/SKILL.md` that acts as a Polish tax advisory assistant. The agent SHALL follow the legal skill pattern: structured work modes (slash commands), risk signaling (🟢🟡🔴), reference-based progressive disclosure, and [DO UZUPEŁNIENIA] data safety. The SKILL.md SHALL follow Agent Skills spec format with YAML frontmatter (name + description) and markdown body under 500 lines.

#### Scenario: Agent triggers on tax questions
- **WHEN** user asks about CIT, PIT, VAT, ZUS, IP Box, estoński CIT, B+R, ryczałt, składka zdrowotna, or tax optimization
- **THEN** the tax-advisor agent SHALL trigger based on its description keywords (PL and EN)

#### Scenario: Agent follows legal skill advisory pattern
- **WHEN** tax-advisor agent is triggered
- **THEN** agent SHALL use work modes (/analiza, /porównanie, /optymalizacja, /kalendarz, /brief), risk signaling, and [DO UZUPEŁNIENIA] placeholders consistent with the legal skill

### Requirement: Tax advisor reference files for progressive disclosure
The agent SHALL include four reference files loaded on-demand: `references/polish-tax-system.md` (CIT, PIT, VAT, ZUS rates and rules), `references/it-tax-optimization.md` (IP Box, B+R, estoński CIT, ryczałt IT), `references/jdg-vs-psa-tax.md` (entity type tax comparison), and `references/tax-calendar.md` (filing deadlines by month).

#### Scenario: Agent loads references on demand
- **WHEN** user asks a question requiring specific tax knowledge
- **THEN** agent SHALL load only the relevant reference file(s), not all references upfront
