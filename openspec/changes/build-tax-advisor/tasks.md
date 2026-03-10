## 1. Reference Files

- [ ] 1.1 Create `skills/tax-advisor/references/polish-tax-system.md` — CIT, PIT, VAT, ZUS overview with rates, thresholds, and rules. Include `last_updated` header.
- [ ] 1.2 Create `skills/tax-advisor/references/it-tax-optimization.md` — IP Box, B+R ulga, estoński CIT, ryczałt for IT companies. Include `last_updated` header.
- [ ] 1.3 Create `skills/tax-advisor/references/jdg-vs-psa-tax.md` — side-by-side comparison of tax burden for JDG vs PSA. Include `last_updated` header.
- [ ] 1.4 Create `skills/tax-advisor/references/tax-calendar.md` — key tax deadlines by month (CIT, VAT, PIT, ZUS, JPK_V7). Include `last_updated` header.

## 2. SKILL.md (via /skill-creator)

- [ ] 2.1 Run `/skill-creator` to build tax-advisor skill — capture intent, interview, draft SKILL.md, generate test prompts, evaluate, iterate
- [ ] 2.2 Feed design decisions into skill-creator: work modes (/analiza, /porównanie, /optymalizacja, /kalendarz, /brief), risk signaling (🟢🟡🔴), reference loading, boundaries with CFO/legal, data safety ([DO UZUPEŁNIENIA])
- [ ] 2.3 Optimize description with skill-creator for triggering accuracy (PL+EN keywords)
- [ ] 2.4 Verify SKILL.md is under 500 lines

## 3. Specs Update

- [ ] 3.1 Sync delta specs to `openspec/specs/agent-definition/spec.md` (append tax-advisor requirements)
- [ ] 3.2 Create `openspec/specs/tax-advisor-agent/spec.md` (new capability spec)
