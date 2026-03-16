**Dependency:** Tasks in section 1 require `context-layer-architecture` change to be implemented first. Section 2+ (evaluation) can proceed independently.

## 1. Context layer standardization

- [ ] 1.1 Add `## Context Dependencies` section to skills/cfo/SKILL.md with standard table format — declare `context/finances.md` (Required) and `context/company.md` (Recommended)
- [ ] 1.2 Standardize the existing "Brakuje context/finances.md" warning in SKILL.md to include environment-setup skill suggestion: "Brakuje pliku context/finances.md. Uruchom skill environment-setup aby przygotować środowisko."
- [ ] 1.3 Replace coach-the-five boundary reference on line 105 of skills/cfo/SKILL.md with generic "odsyłaj do zewnętrznego doradcy ds. wyceny"
- [ ] 1.4 Verify all boundary targets (tax-advisor, business-consultant, legal) exist in skills/ directory
- [ ] 1.5 Verify reference files (financial-analysis-frameworks.md, saas-metrics.md) contain only domain knowledge — no user-specific data to migrate

## 2. Evaluation — skill-creator process

- [ ] 2.1 Run /skill-creator on skills/cfo/SKILL.md — generate at least 5 realistic test prompts in Polish covering: financial analysis, budgeting, cash flow, tax planning boundary, SaaS metrics
- [ ] 2.2 Get user approval on test prompts
- [ ] 2.3 Run with-skill and without-skill baseline tests
- [ ] 2.4 Grade results with assertions → produce grading.json (use --static flag for Windows encoding workaround)
- [ ] 2.5 Generate benchmark.json from grading results
- [ ] 2.6 Generate eval viewer with --static flag (Windows encoding workaround)
- [ ] 2.7 Get user review of eval results

## 3. Post-eval fixes and optimization

- [ ] 3.1 Apply cosmetic fixes to SKILL.md if eval review reveals issues
- [ ] 3.2 Optimize description field for triggering accuracy (manual process — run_loop.py doesn't work on Windows; analyze eval set vs description keywords manually)
- [ ] 3.3 Verify eval workspace at skills/cfo-workspace/iteration-1/ contains: eval_set.json, grading.json, benchmark.json, timing.json, feedback.json

## 4. Audit completion

- [ ] 4.1 Update docs/EVAL-PLAYBOOK.md — mark CFO row as "✅ Done" with commit hash
- [ ] 4.2 Add summary note that full audit is complete (all 6 skills processed)
- [ ] 4.3 Verify all 6 skills in the audit table have terminal status (no remaining ⏳ Pending for processed skills)
