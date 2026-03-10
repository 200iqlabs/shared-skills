## Why

The tax-advisor skill is a placeholder (Phase 2) while the two related skills — CFO and legal — are already fully built. Tax questions are the most common cross-cutting concern: CFO explicitly redirects tax queries to tax-advisor, and legal marks taxes as out of scope. Without a working tax-advisor, users hit a dead end on CIT/VAT/PIT/ZUS questions. Additionally, tax season and the ongoing JDG-vs-PSA decision make this skill immediately useful.

## What Changes

- Replace the placeholder `skills/tax-advisor/SKILL.md` with a fully specified agent following the legal/CFO pattern
- Create reference files for Polish tax system knowledge (progressive disclosure)
- Add a static tax calendar reference for key deadlines
- Define clear boundaries with CFO (financial analysis) and legal (contract/compliance)
- Add structured work modes (analysis, comparison, optimization brief, calendar)

## Capabilities

### New Capabilities
- `tax-advisor-agent`: Tax advisory skill with Polish tax system expertise (CIT, PIT, VAT, ZUS, IP Box, estoński CIT, B+R), structured work modes, and reference-based progressive disclosure. Covers both JDG and PSA entity types.

### Modified Capabilities
- `agent-definition`: Adding tax-advisor agent requirements alongside existing CFO agent definition (new requirement blocks, no breaking changes to existing ones)

## Impact

- `skills/tax-advisor/SKILL.md` — full rewrite from placeholder
- `skills/tax-advisor/references/` — new reference files (polish-tax-system.md, it-tax-optimization.md, jdg-vs-psa-tax.md, tax-calendar.md)
- `openspec/specs/agent-definition/spec.md` — new requirement blocks for tax-advisor
- No impact on existing skills, tools, or plugin config
