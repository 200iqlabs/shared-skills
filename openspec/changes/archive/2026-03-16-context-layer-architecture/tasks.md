## 1. Context directory structure

- [x] 1.1 Create `context/` directory with `README.md` explaining purpose, setup workflow, and context file types
- [x] 1.2 Add `context/*.md` (except README.md) to `.gitignore`
- [x] 1.3 Create `context/templates/company.template.md`
- [x] 1.4 Create `context/templates/consultant-profile.template.md`
- [x] 1.5 Create `context/templates/projects-portfolio.template.md`
- [x] 1.6 Create `context/templates/author-profile.template.md`
- [x] 1.7 Create `context/templates/finances.template.md`
- [x] 1.8 Create `context/templates/legal-entities.template.md`

## 2. Environment setup skill

- [x] 2.1 Create `skills/environment-setup/SKILL.md` with context audit, guided creation workflow, and completion summary
- [x] 2.2 Run `/skill-creator` eval on environment-setup skill (separate follow-up — just create initial version here)

## 3. Migrate business-consultant to context layer

- [x] 3.1 Remove hardcoded identity from `skills/business-consultant/SKILL.md` Overview, reference context/consultant-profile.md
- [x] 3.2 Add `## Context Dependencies` section to business-consultant SKILL.md
- [x] 3.3 Move `references/projekty.md` content to `context/templates/projects-portfolio.template.md` (anonymize as template)
- [x] 3.4 Move `references/case-study-eventowa.md` and `case-study-faktury.md` patterns into projects-portfolio template
- [x] 3.5 Remove personal identity from `references/manifest.md` (keep methodology, remove name/contact/branding header)
- [x] 3.6 Delete moved reference files from business-consultant/references/
- [x] 3.7 Update SKILL.md reference table to reflect new file locations

## 4. Migrate legal to context layer

- [x] 4.1 Remove hardcoded entity names (PLSoft, 200IQ Labs) from `skills/legal/SKILL.md`, reference context/legal-entities.md
- [x] 4.2 Add `## Context Dependencies` section to legal SKILL.md
- [x] 4.3 Move `references/entity-context.md` content to `context/templates/legal-entities.template.md`
- [x] 4.4 Move `references/document-backlog.md` structure into legal-entities template
- [x] 4.5 Delete moved reference files from legal/references/
- [x] 4.6 Update SKILL.md reference table

## 5. Migrate linkedin-content to context layer

- [x] 5.1 Remove hardcoded author identity from `skills/linkedin-content/SKILL.md`, reference context/author-profile.md
- [x] 5.2 Add `## Context Dependencies` section to linkedin-content SKILL.md
- [x] 5.3 Move `references/example-posts.md` content to `context/templates/author-profile.template.md`
- [x] 5.4 Delete moved reference file from linkedin-content/references/
- [x] 5.5 Update SKILL.md reference table

## 6. Standardize tax-advisor and cfo context references

- [x] 6.1 Replace hardcoded JDG/PSA context in `skills/tax-advisor/SKILL.md` with reference to context/legal-entities.md
- [x] 6.2 Add `## Context Dependencies` section to tax-advisor SKILL.md
- [x] 6.3 Add `## Context Dependencies` section to cfo SKILL.md (standardize existing context/finances.md reference)

## 7. Update documentation and templates

- [x] 7.1 Update `README.md` — add three-step setup workflow (fork/install → environment-setup → ready)
- [x] 7.2 Update `CLAUDE.md` — add Context Layer section explaining domain knowledge vs user context separation
- [x] 7.3 Update `templates/SKILL_TEMPLATE.md` — add `## Context Dependencies` section template
- [x] 7.4 Update `templates/CONTEXT_TEMPLATE.md` — align with new context/ architecture

## 8. Verify migration

- [x] 8.1 Check no personal names, company names, or contact info remain in any SKILL.md
- [x] 8.2 Check all moved reference files are deleted from references/ directories
- [x] 8.3 Check context/templates/ has all 6 template files with [DO UZUPELNIENIA] placeholders
- [x] 8.4 Check all modified skills have Context Dependencies section
- [x] 8.5 Check .gitignore excludes context/*.md but not context/README.md and context/templates/
