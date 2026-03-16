## Context

The legal skill is a fully implemented Polish legal assistant migrated from Claude Projects. It contains hardcoded references to specific companies (PLSoft JDG, 200IQ Labs PSA) and a specific person (Pawel Lipowczan), making it non-distributable.

The project has adopted a **context layer architecture** (change: `context-layer-architecture`) that cleanly separates:
- **User data** (companies, people, portfolio, finances) → `context/` directory (gitignored, created by environment-setup skill)
- **Domain knowledge** (methodologies, frameworks, checklists) → `references/` directory (tracked in git, distributed with skill)

This change migrates the legal skill to this architecture and then evaluates it through skill-creator.

Current state of the legal skill's files:
- `SKILL.md` — title, description, body all reference PLSoft/200IQ Labs/Pawel Lipowczan
- `references/entity-context.md` — entirely company-specific (names, roles, entity details) → USER DATA
- `references/document-backlog.md` — lists specific documents for specific entities → USER DATA
- `references/legal-scope.md` — describes legal competency areas → DOMAIN KNOWLEDGE
- `references/workflow-draft.md` — describes document drafting process → DOMAIN KNOWLEDGE
- `references/workflow-brief.md` — describes lawyer brief process → DOMAIN KNOWLEDGE

## Goals / Non-Goals

**Goals:**
- Migrate user-specific data from references/ to context/ per the context layer architecture
- Add Context Dependencies section to SKILL.md
- Remove all hardcoded company/person references from SKILL.md
- Preserve the skill's strengths: risk signaling system, work modes, data safety rules
- Run through skill-creator eval to validate triggering accuracy (target >= 80%)
- Update EVAL-PLAYBOOK.md status upon completion

**Non-Goals:**
- Full rewrite of skill logic or adding new work modes
- Translating the skill to English
- Creating the context layer infrastructure itself (prerequisite change)
- Changing the risk signaling system

## Decisions

### 1. Entity context + document backlog → context/legal-entities.md

**Decision**: Migrate `references/entity-context.md` and `references/document-backlog.md` into a single `context/legal-entities.md` file. The template `context/templates/legal-entities.template.md` (created by context-layer-architecture change) provides the structure with `[DO UZUPELNIENIA]` placeholders.

**Why merge**: Both files describe the same concern — the user's legal entity state. entity-context.md has entity structure/roles, document-backlog.md has the document status per entity. Merging reduces context file count and keeps related data together.

**Why context/ not references/**: This is user-specific data (company names, owner details, specific documents). It must be gitignored and created per-user via environment-setup skill.

### 2. Domain knowledge stays in references/

**Decision**: Keep `legal-scope.md`, `workflow-draft.md`, and `workflow-brief.md` in `references/`. Audit them for any company-specific references and remove if found.

**Why**: These files describe legal methodologies and processes that are universal to Polish IT law. They are domain knowledge, not user data. They should be distributed with the skill.

### 3. SKILL.md — replace hardcoded names with context/ references

**Decision**: Remove all hardcoded entity names (PLSoft JDG, 200IQ Labs PSA, Pawel Lipowczan) from SKILL.md. Replace with generic references to `context/legal-entities.md`. The `/owu` mode description changes from "PLSoft OWU" to "OWU dla podmiotu uzytkownika". Add a `## Context Dependencies` section declaring required context files.

**Why not just parameterize in references/**: The context layer architecture explicitly separates user data (context/) from domain knowledge (references/). Keeping entity-specific data in references/ would violate this architecture and prevent proper gitignoring.

### 4. Context Dependencies section — graceful degradation

**Decision**: Add a `## Context Dependencies` section to SKILL.md with a table of required context files and graceful degradation behavior:

```markdown
## Context Dependencies

| File | Required | Used for |
|------|----------|----------|
| `context/legal-entities.md` | Recommended | Entity details, relationships, document backlog |
| `context/company.md` | Recommended | Business structure, team |

> If context files are missing, inform the user:
> "Brakuje pliku [file]. Uruchom skill environment-setup aby przygotowac srodowisko."
> Continue with reduced capability — provide general legal guidance without entity-specific context.
```

**Why "Recommended" not "Required"**: The skill can provide useful general legal advice even without entity context. Blocking would reduce utility for new users.

### 5. Eval process — follows EVAL-PLAYBOOK

**Decision**: Follow the eval playbook's prescribed process (documented in `docs/EVAL-PLAYBOOK.md`). Run through `/skill-creator` after context migration is complete. Known Windows issues: use `--static` flag for review generation, manual description optimization (run_loop.py doesn't work on Windows).

**Why after migration**: Evaluating before migration would test the old hardcoded skill. We need to validate the migrated version.

## Risks / Trade-offs

**[Dependency on context-layer-architecture]** → Context migration cannot proceed until the context/ directory structure, templates, and environment-setup skill are in place. **Mitigation**: The eval part can be spec'd and prepped independently. Context migration tasks are clearly marked as blocked.

**[Loss of specificity for current user]** → After migration, the skill won't have entity context until the user runs environment-setup. **Mitigation**: Graceful degradation — skill warns about missing context and continues with general advice. User can populate context/legal-entities.md to restore full capability.

**[Triggering regression]** → Description changes during migration could reduce triggering accuracy. **Mitigation**: skill-creator eval will measure this; iterate until >= 80% accuracy.

**[Windows eval limitations]** → `run_loop.py` doesn't work on Windows. **Mitigation**: Manual description optimization as documented in playbook.

## Open Questions

- Should `legal-scope.md` sections that reference specific entity types (JDG, PSA) be kept as-is since they describe general legal competency, or should they be made more generic? (Leaning: keep — JDG/PSA are general legal concepts, not user-specific.)
