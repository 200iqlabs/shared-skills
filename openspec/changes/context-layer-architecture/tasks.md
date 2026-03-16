## 1. Context directory structure

- [ ] 1.1 Create `context/` directory with `README.md` explaining purpose, setup workflow, and context file types
- [ ] 1.2 Add `context/*.md` (except README.md) to `.gitignore`
- [ ] 1.3 Create `context/templates/company.template.md`
- [ ] 1.4 Create `context/templates/consultant-profile.template.md`
- [ ] 1.5 Create `context/templates/projects-portfolio.template.md`
- [ ] 1.6 Create `context/templates/author-profile.template.md`
- [ ] 1.7 Create `context/templates/finances.template.md`
- [ ] 1.8 Create `context/templates/legal-entities.template.md`

## 2. Environment setup skill

- [ ] 2.1 Create `skills/environment-setup/SKILL.md` with context audit, guided creation workflow, and completion summary
- [ ] 2.2 Run `/skill-creator` eval on environment-setup skill (separate follow-up — just create initial version here)

## 3. Migrate business-consultant to context layer

- [ ] 3.1 Remove hardcoded identity from `skills/business-consultant/SKILL.md` Overview, reference context/consultant-profile.md
- [ ] 3.2 Add `## Context Dependencies` section to business-consultant SKILL.md
- [ ] 3.3 Move `references/projekty.md` content to `context/templates/projects-portfolio.template.md` (anonymize as template)
- [ ] 3.4 Move `references/case-study-eventowa.md` and `case-study-faktury.md` patterns into projects-portfolio template
- [ ] 3.5 Remove personal identity from `references/manifest.md` (keep methodology, remove name/contact/branding header)
- [ ] 3.6 Delete moved reference files from business-consultant/references/
- [ ] 3.7 Update SKILL.md reference table to reflect new file locations

## 4. Migrate legal to context layer

- [ ] 4.1 Remove hardcoded entity names (PLSoft, 200IQ Labs) from `skills/legal/SKILL.md`, reference context/legal-entities.md
- [ ] 4.2 Add `## Context Dependencies` section to legal SKILL.md
- [ ] 4.3 Move `references/entity-context.md` content to `context/templates/legal-entities.template.md`
- [ ] 4.4 Move `references/document-backlog.md` structure into legal-entities template
- [ ] 4.5 Delete moved reference files from legal/references/
- [ ] 4.6 Update SKILL.md reference table

## 5. Migrate linkedin-content to context layer

- [ ] 5.1 Remove hardcoded author identity from `skills/linkedin-content/SKILL.md`, reference context/author-profile.md
- [ ] 5.2 Add `## Context Dependencies` section to linkedin-content SKILL.md
- [ ] 5.3 Move `references/example-posts.md` content to `context/templates/author-profile.template.md`
- [ ] 5.4 Delete moved reference file from linkedin-content/references/
- [ ] 5.5 Update SKILL.md reference table

## 6. Standardize tax-advisor and cfo context references

- [ ] 6.1 Replace hardcoded JDG/PSA context in `skills/tax-advisor/SKILL.md` with reference to context/legal-entities.md
- [ ] 6.2 Add `## Context Dependencies` section to tax-advisor SKILL.md
- [ ] 6.3 Add `## Context Dependencies` section to cfo SKILL.md (standardize existing context/finances.md reference)

## 7. Update documentation and templates

- [ ] 7.1 Update `README.md` — add three-step setup workflow (fork/install → environment-setup → ready)
- [ ] 7.2 Update `CLAUDE.md` — add Context Layer section explaining domain knowledge vs user context separation
- [ ] 7.3 Update `templates/SKILL_TEMPLATE.md` — add `## Context Dependencies` section template
- [ ] 7.4 Update `templates/CONTEXT_TEMPLATE.md` — align with new context/ architecture

## 8. Verify migration

- [ ] 8.1 Check no personal names, company names, or contact info remain in any SKILL.md
- [ ] 8.2 Check all moved reference files are deleted from references/ directories
- [ ] 8.3 Check context/templates/ has all 6 template files with [DO UZUPELNIENIA] placeholders
- [ ] 8.4 Check all modified skills have Context Dependencies section
- [ ] 8.5 Check .gitignore excludes context/*.md but not context/README.md and context/templates/
