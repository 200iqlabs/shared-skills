## Context

Shared-skills repo is distributed two ways: fork + customize, or plugin install + customize. After installation, users must provide organization-specific context. Currently this context is scattered across skill references/ directories and hardcoded in SKILL.md files. We need a clean separation between domain knowledge and user context.

Analysis of existing skills shows:
- **business-consultant**: 3 USER_CONTEXT refs (projekty.md, 2 case studies) + hardcoded identity in SKILL.md
- **legal**: 2 USER_CONTEXT refs (entity-context.md, document-backlog.md) + hardcoded entity names in SKILL.md
- **linkedin-content**: 1 USER_CONTEXT ref (example-posts.md) + hardcoded author name/role in SKILL.md
- **tax-advisor**: 0 USER_CONTEXT refs but hardcoded business forms (JDG/PSA) in SKILL.md; already checks for context/
- **cfo**: 0 USER_CONTEXT refs; already expects context/finances.md

## Goals / Non-Goals

**Goals:**
- Establish context/ directory as the single source for all user-specific data
- Define standard context file types with templates
- Skills declare context dependencies and handle missing files gracefully
- New environment-setup skill guides users through context creation
- Migrate all existing user context out of references/ into context/ templates

**Non-Goals:**
- Changing skill domain knowledge or methodology
- Building a complex dependency resolution system (simple file checks are sufficient)
- Automating context creation beyond the setup skill's guided workflow

## Decisions

### 1. Context directory structure — flat with typed templates

**Choice:**
```
context/
├── README.md                    # Explains what goes here
├── company.md                   # Legal entity, structure, team
├── consultant-profile.md        # Consulting philosophy, experience, approach
├── projects-portfolio.md        # Past projects, case studies
├── author-profile.md            # Content creation persona, audience, brand
├── finances.md                  # Budget, goals, financial structure
├── legal-entities.md            # Entity details, relationships, legal docs backlog
└── templates/                   # Template versions of each file above
    ├── company.template.md
    ├── consultant-profile.template.md
    ├── projects-portfolio.template.md
    ├── author-profile.template.md
    ├── finances.template.md
    └── legal-entities.template.md
```

**Why:** Flat structure keeps it simple. Templates live alongside as `.template.md` so the setup skill can copy template → actual file. Context files are shared across skills (e.g., company.md is used by legal, tax-advisor, cfo).

**Alternative considered:** Nested context per skill (context/legal/, context/cfo/). Rejected because context is cross-cutting — company.md is needed by 4+ skills.

### 2. Context dependency declaration — comment block in SKILL.md

**Choice:** Add a `## Context Dependencies` section to each SKILL.md that lists required context files and what happens if they're missing:

```markdown
## Context Dependencies

| File | Required | Used for |
|------|----------|----------|
| `context/company.md` | Yes | Entity details, business structure |
| `context/consultant-profile.md` | Yes | Consulting philosophy, approach |
| `context/projects-portfolio.md` | Recommended | Architecture patterns, case studies |

> If required context files are missing, inform the user:
> "Brakuje pliku [file]. Uruchom skill environment-setup aby przygotować środowisko."
```

**Why:** Declarative, human-readable, no tooling needed. The skill's instructions tell the agent to check for files and warn if missing. Simple, works with any Claude Code setup.

**Alternative considered:** YAML frontmatter field for dependencies. Rejected because frontmatter is parsed by the plugin system for routing only — adding non-routing fields would require plugin changes.

### 3. Migration strategy — move files, leave domain knowledge in references/

**Choice:** Per skill:

| Skill | Move to context/ | Keep in references/ |
|-------|-------------------|---------------------|
| business-consultant | projekty.md → projects-portfolio.md, case studies → projects-portfolio.md (merged), manifest identity → consultant-profile.md | discovery-questions.md, pricing-guidelines.md, tech-stack-comparison.md, manifest.md (methodology only) |
| legal | entity-context.md → legal-entities.md, document-backlog.md → legal-entities.md (merged) | legal-scope.md, workflow-draft.md, workflow-brief.md |
| linkedin-content | example-posts.md → author-profile.md (examples section) | writing-style.md |
| tax-advisor | JDG/PSA context from SKILL.md → legal-entities.md | all 4 reference files (pure domain knowledge) |
| cfo | (already expects context/finances.md) | financial-analysis-frameworks.md, saas-metrics.md |

**Why:** Clean separation — references/ = reusable domain knowledge, context/ = user fills in. Some files merge because the context is related (entity-context + document-backlog both describe legal entity state).

### 4. Environment setup skill — interview-driven wizard

**Choice:** New `skills/environment-setup/` skill that:
1. Checks which context files exist and which are missing
2. Walks user through creating each missing file step-by-step
3. Uses templates as starting structure
4. Asks targeted questions to fill in each section
5. Validates completeness at the end

**Why:** Fork/install users need guided onboarding. A skill-based approach means it works in any Claude Code session — no external tooling needed. Interview format ensures quality context.

### 5. Graceful degradation — warn, don't block

**Choice:** Skills check for context files at the start of relevant operations. If missing:
- Show warning with file name and purpose
- Suggest running environment-setup skill
- Continue with reduced capability (use domain knowledge only, skip personalized advice)

**Why:** Blocking would make skills unusable until full setup. Warning + degradation lets users get value immediately while encouraging full setup.

### 6. Git handling of context files — gitignore actual, track templates

**Choice:**
- `context/templates/` — tracked in git (distributed with repo)
- `context/*.md` (except README.md) — added to .gitignore
- `context/README.md` — tracked (explains the directory)

**Why:** User context contains personal/company data that shouldn't be in a public repo. Templates are the distributable part.

## Risks / Trade-offs

**[Breaking existing setups]** → Mitigation: Skills will check both old paths (references/) and new paths (context/) during transition. Old reference files that were moved will have a one-line redirect comment pointing to new location.

**[Context file proliferation]** → Mitigation: Keep to 5-6 context files max. Merge related content (entity-context + document-backlog → legal-entities.md). Environment-setup skill only creates what's needed.

**[Template maintenance burden]** → Mitigation: Templates are simple markdown with [PLACEHOLDER] markers. They change rarely — only when skills add new context requirements.

## Open Questions

- Should context/ live at repo root or under a configurable path? (Decision: repo root for now — simplest. Can add config later if needed.)
- Should the environment-setup skill be built through /skill-creator? (Decision: yes, after this architecture change lands.)
