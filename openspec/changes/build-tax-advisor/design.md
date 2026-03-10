## Context

The tax-advisor skill is one of 8 planned agents in the shared-skills library. Currently a placeholder. Two adjacent agents (CFO, legal) are fully built and explicitly redirect tax questions to tax-advisor, creating a dead end for users.

The legal skill established a strong pattern for "structured advisory" agents: slash-command work modes, risk signaling (🟢🟡🔴), reference-based progressive disclosure, and [DO UZUPEŁNIENIA] data safety. The CFO skill established the "data-driven advisor" pattern with script integrations and behavior-per-question-type tables.

Tax advisor is knowledge-heavy (not data-driven), so it follows the legal pattern more closely.

## Goals / Non-Goals

**Goals:**
- Full SKILL.md replacing placeholder, following Agent Skills spec and legal skill pattern
- Reference files with Polish tax knowledge (CIT, PIT, VAT, ZUS, IP Box, estoński CIT, B+R)
- Structured work modes matching how users actually ask tax questions
- Clear boundaries with CFO, legal, and business-consultant
- JDG vs PSA comparison as a first-class capability

**Non-Goals:**
- No script integrations (tax advice is knowledge-based, not API-data-based)
- No tax calendar script — static reference file is sufficient
- No actual tax calculations (agent is advisory, not a calculator)
- No international tax (Polish tax system only)
- Not a replacement for a licensed tax advisor (doradca podatkowy)

## Decisions

### 1. Follow legal skill pattern, not CFO pattern

**Decision**: Structure SKILL.md with work modes (slash commands), risk signaling, and reference-based knowledge — mirroring the legal skill.

**Rationale**: Tax advice is knowledge-interpretation work (like legal), not data-retrieval work (like CFO). Users ask "what are the tax implications of X" not "show me my tax data."

**Alternatives considered**: CFO-style behavior tables per question type. Rejected — tax questions are more nuanced and benefit from structured modes rather than pattern matching.

### 2. Work modes

**Decision**: Five slash-command modes:

| Mode | Purpose |
|------|---------|
| `/analiza` | Tax implications analysis ("co jeśli zrobię X?") |
| `/porównanie` | Compare tax options (JDG vs PSA, ryczałt vs liniowy, CIT vs estoński CIT) |
| `/optymalizacja` | Tax optimization recommendations for current situation |
| `/kalendarz` | Tax deadlines and obligations for current/upcoming period |
| `/brief` | Prepare structured questions for a licensed tax advisor |

**Rationale**: Maps to the five real ways users interact with tax topics. `/brief` is critical — the agent must facilitate (not replace) professional advice.

### 3. Four reference files

**Decision**:
- `references/polish-tax-system.md` — overview of CIT, PIT, VAT, ZUS, thresholds, rates
- `references/it-tax-optimization.md` — IP Box, B+R, estoński CIT, ryczałt for IT
- `references/jdg-vs-psa-tax.md` — side-by-side comparison of tax burden for both entity types
- `references/tax-calendar.md` — key deadlines by month (CIT, VAT, PIT, ZUS, JPK)

**Rationale**: Splits knowledge by concern. Each file loaded only when relevant (progressive disclosure). Calendar is static — easier to maintain and update annually than a script.

### 4. Risk signaling like legal

**Decision**: Use the same 🟢🟡🔴 system from legal skill. Bias toward 🔴 for anything involving specific amounts, deadlines, or regulatory interpretation.

**Rationale**: Tax errors have financial consequences. Consistency with legal skill means users learn one signaling system.

### 5. Language: Polish for interactions, Polish tax terms preserved

**Decision**: Agent communicates in Polish. Tax terminology stays in original form (CIT, PIT, VAT, ZUS, JPK_V7, ryczałt, estoński CIT). No anglicization of Polish-specific concepts.

**Rationale**: Polish tax system has no English equivalents for many concepts. Target users are Polish.

## Risks / Trade-offs

- **Tax law changes frequently** → Reference files need annual review. Add `last_updated` header to each reference. Agent warns when referencing data older than 6 months.
- **Hallucination risk on specific rates/thresholds** → All numbers go in reference files (single source of truth), not in SKILL.md body. Agent instructed to cite reference or state uncertainty.
- **Overlap with CFO on "financial optimization"** → Clear boundary: if it's about reducing tax burden → tax-advisor. If it's about reducing operational costs → CFO. Both agents state this in their boundaries.
- **Overlap with legal on regulatory compliance** → Tax compliance → tax-advisor. RODO/contract compliance → legal. Clear in boundaries of both.
