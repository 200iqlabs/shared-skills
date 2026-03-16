> **Dependency:** The `context-layer-architecture` change MUST be implemented first. It establishes the context/ directory, templates, environment-setup skill, and the Context Dependencies convention. Do not start this change until context-layer-architecture is merged.

## 1. Migrate user data to context layer

- [ ] 1.1 Remove `projekty.md` from `skills/business-consultant/references/` (content migrates to `context/projects-portfolio`)
- [ ] 1.2 Remove `case-study-eventowa.md` from `skills/business-consultant/references/` (content migrates to `context/projects-portfolio`)
- [ ] 1.3 Remove `case-study-faktury.md` from `skills/business-consultant/references/` (content migrates to `context/projects-portfolio`)
- [ ] 1.4 Strip personal identity from `manifest.md` — remove personal branding header, contact info block, personal name references. Keep all 5 consulting principles and collaboration model (methodology only)
- [ ] 1.5 Verify context templates exist: `context/templates/consultant-profile.template.md` and `context/templates/projects-portfolio.template.md` (created by context-layer-architecture change)

## 2. Update SKILL.md for context layer

- [ ] 2.1 Remove hardcoded identity from Overview section (strip "niezalezny konsultant, wczesniej Technical Lead w Automation House" — replace with universal consultant description)
- [ ] 2.2 Add `## Context Dependencies` section declaring: `context/consultant-profile` (identity, background, contact) and `context/projects-portfolio` (past projects, case studies)
- [ ] 2.3 Add graceful fallback instructions: when context files are missing, warn user, suggest environment-setup skill, continue with reduced capability
- [ ] 2.4 Verify frontmatter description contains no personal references and triggers generically

## 3. Verify migration

- [ ] 3.1 Review all modified files for remaining personal/company name leaks
- [ ] 3.2 Confirm domain knowledge files remain in references/: discovery-questions.md, pricing-guidelines.md, tech-stack-comparison.md, manifest.md
- [ ] 3.3 Confirm user-specific files are removed from references/: projekty.md, case-study-eventowa.md, case-study-faktury.md

## 4. Run skill-creator evaluation

- [ ] 4.1 Launch `/skill-creator` on the migrated skills/business-consultant/SKILL.md
- [ ] 4.2 Generate 5+ test prompts in Polish covering: discovery, analysis, solution design, estimation, proposal
- [ ] 4.3 Run with-skill and without-skill baseline tests in parallel
- [ ] 4.4 Run grading with `--static` flag (Windows encoding workaround)
- [ ] 4.5 Generate benchmark.json and review results in browser

## 5. Optimize and finalize

- [ ] 5.1 Apply cosmetic fixes to SKILL.md based on eval review (wording, structure, clarity only)
- [ ] 5.2 Manually optimize description for triggering accuracy (target ≥80%) — analyze eval set vs description, ensure bilingual keywords
- [ ] 5.3 Verify eval artifacts exist in skills/business-consultant-workspace/iteration-1/ (eval_set.json, grading.json, benchmark.json, timing.json, feedback.json)
- [ ] 5.4 Update EVAL-PLAYBOOK.md: set business-consultant status to "Done" with commit hash
