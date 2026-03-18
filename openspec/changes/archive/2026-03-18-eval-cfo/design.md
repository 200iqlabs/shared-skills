## Context

The CFO skill is the most mature skill in the shared-skills repo — it has live data integrations (Revolut, Stripe, inFakt), structured behavioral patterns, reference files, and clear boundary definitions. It's the last skill in the Agent Skills 2.0 audit queue (5 of 6 skills already processed: linkedin-content ✅, tax-advisor ✅, coach-the-five ⏭️ skipped, legal ⏳, business-consultant ⏳).

The project has adopted a **context layer architecture** (`context-layer-architecture` change) that cleanly separates:
- **User data** (companies, people, portfolio, finances) → `context/` (gitignored, created by environment-setup skill)
- **Domain knowledge** (methodologies, frameworks, checklists) → `references/` (tracked in skill directory)

The CFO skill is already the cleanest in the repo — it already expects `context/finances.md` and its reference files (`financial-analysis-frameworks.md`, `saas-metrics.md`) are pure domain knowledge. The main work is standardization: adding the `## Context Dependencies` section and fixing the stale coach-the-five boundary reference.

Current issues:
- Line 105 references `coach-the-five` which has been moved to `private-skills` repo
- No `## Context Dependencies` section (the context layer architecture requires every skill using context files to declare them)
- `context/finances.md` reference exists but isn't standardized to the new convention (missing warning + environment-setup suggestion for missing files)
- Skill has never been through the skill-creator eval process

## Goals / Non-Goals

**Goals:**
- Standardize the skill to the context layer architecture (add Context Dependencies section, standardize context/finances.md reference)
- Fix the stale `coach-the-five` boundary reference → generic "external advisor" language
- Run full skill-creator eval process (test prompts, with/without-skill baseline, grading, benchmark)
- Optimize the `description` field for triggering accuracy (target ≥ 80%)
- Mark the full audit as complete in EVAL-PLAYBOOK.md

**Non-Goals:**
- Rewriting the skill's core logic or behavioral patterns
- Modifying financial scripts or data integrations (tools/)
- Adding new reference files or metrics frameworks
- Changing the skill's language (remains Polish)
- Migrating reference files (they're already pure domain knowledge — stay in references/)

## Decisions

### 1. Context layer standardization: minimal changes needed

The CFO skill requires the least migration work of any skill in the repo. Its reference files are already pure domain knowledge, and it already expects `context/finances.md`. The standardization work is:

1. Add `## Context Dependencies` section with the standard table format declaring `context/finances.md` and `context/company.md`
2. Standardize the existing "Brakuje context/finances.md" warning to include the environment-setup skill suggestion
3. Fix the coach-the-five boundary reference

**Dependency:** This work requires `context-layer-architecture` to be implemented first (so `context/templates/finances.template.md` and the environment-setup skill exist). The eval part can proceed independently.

**Comparison with other skills:**
- business-consultant: heavy migration (3 USER_CONTEXT refs + hardcoded identity)
- legal: heavy migration (2 USER_CONTEXT refs + hardcoded entity names)
- linkedin-content: moderate migration (1 USER_CONTEXT ref + hardcoded author)
- tax-advisor: light migration (hardcoded JDG/PSA context)
- **cfo: lightest — just standardization, no file migration needed**

### 2. coach-the-five boundary fix

**Approach:** Replace `"exit, wycena, PE → odsyłaj do coach-the-five"` with `"exit, wycena, PE → odsyłaj do zewnętrznego doradcy ds. wyceny"`. This removes the private-skills dependency while keeping the boundary clear.

**Alternative considered:** Removing the boundary entirely — rejected because valuation is a legitimate boundary that users should be warned about.

### 3. Context Dependencies section follows standard format

**Approach:** Use the table format defined by context-layer-architecture:

```markdown
## Context Dependencies

| File | Required | Used for |
|------|----------|----------|
| `context/finances.md` | Yes | Budżet, cele finansowe, struktura kosztów |
| `context/company.md` | Recommended | Struktura firmy, zespół, branża |

> Jeśli brakuje wymaganych plików kontekstowych, poinformuj użytkownika:
> "Brakuje pliku [file]. Uruchom skill environment-setup aby przygotować środowisko."
> Kontynuuj z ograniczoną funkcjonalnością — używaj tylko danych ze skryptów i references/.
```

**Why `context/company.md` as Recommended:** The CFO can function with just financial data from scripts, but company context improves advice quality (e.g., knowing team size for headcount analysis, knowing entity structure for tax-relevant financial planning).

### 4. Eval process follows established pattern from prior skills

Use the same process proven with linkedin-content and tax-advisor:
1. Generate 5+ test prompts (Polish, realistic user phrasing) covering financial analysis, budgeting, cash flow, tax planning boundary, SaaS metrics
2. Run with-skill vs without-skill baseline tests
3. Grade with assertions via script → grading.json + benchmark.json
4. Generate viewer with `--static` flag (Windows cp1252 encoding workaround)
5. Apply cosmetic fixes if review reveals issues
6. Description optimization done manually (run_loop.py doesn't work on Windows)

**Workspace:** `skills/cfo-workspace/iteration-1/`

### 5. Description optimization strategy

The current description is already comprehensive (covers SaaS metrics, Polish keywords, financial scenarios). Optimization will focus on:
- Ensuring eval set triggers reliably map to description keywords
- Checking for missing trigger phrases discovered during eval
- Keeping the description length reasonable while covering edge cases

### 6. EVAL-PLAYBOOK.md update as final step

After CFO eval completes, update the playbook status table to mark CFO as ✅ Done. Since this is the last skill, add a summary note that the full audit is complete.

## Risks / Trade-offs

**[Dependency on context-layer-architecture]** → The context standardization part cannot proceed until context-layer-architecture is implemented. Mitigation: the eval part (concern 2) can proceed independently — the two concerns are separable.

**[Eval may reveal deeper issues]** → If grading shows the skill significantly underperforms without-skill baseline in some areas, cosmetic fixes may not suffice. Mitigation: the proposal scopes this as "cosmetic fixes if review reveals issues" — a full rewrite is a separate change.

**[Description optimization without run_loop.py]** → Manual optimization is less systematic than automated loop. Mitigation: the prior two skills (linkedin-content, tax-advisor) were also done manually on Windows with good results.

**[coach-the-five boundary removal affects routing]** → Users asking about valuations will no longer be directed to a specific skill. Mitigation: "external advisor" is a safer recommendation for a public repo — the actual routing can be configured per-installation via private skills.
