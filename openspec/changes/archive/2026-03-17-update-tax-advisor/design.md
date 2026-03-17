## Context

The tax-advisor skill was built and evaluated (commit 2eee495) before the context layer architecture was finalized. It already references `context/legal-entities.md` and has a `## Context Dependencies` section, but contains a leftover `company/` fallback path and hardcoded JDG/PSA assumptions in the description that should come from context files instead.

The context layer architecture (separate change) establishes the pattern: user data in `context/*.md` (gitignored), templates in `context/templates/` (tracked), domain knowledge in skill `references/`. The `legal-entities.template.md` template already exists.

## Goals / Non-Goals

**Goals:**
- Remove `company/` fallback path reference from context-gathering instructions (line 22)
- Ensure context file references follow the standardized pattern from context-layer-architecture
- Keep the skill functionally identical — no behavioral changes

**Non-Goals:**
- Changing the skill description or triggering behavior (already evaluated)
- Modifying reference files (pure domain knowledge, unaffected)
- Re-evaluating the skill
- Adding new context file dependencies beyond what's already defined

## Decisions

### 1. Remove `company/` path reference, keep only `context/`

**Decision:** Remove `(np. context/, company/)` from line 22 and reference only `context/` directory.

**Rationale:** The `company/` directory was a pre-context-layer convention. The context layer architecture standardizes on `context/*.md` files. Keeping `company/` creates confusion about where data should live.

**Alternative considered:** Supporting both paths for backward compatibility. Rejected because no users have `company/` files yet (the skill is new), and dual paths would undermine the context layer standard.

### 2. No changes to description frontmatter

**Decision:** Leave the `description` field as-is, including "JDG and PSA" mentions.

**Rationale:** The description's job is triggering accuracy, not data accuracy. "JDG and PSA" are the most common business forms for Polish IT entrepreneurs and serve as strong trigger signals. The skill body already loads entity-specific context from `context/legal-entities.md` at runtime, so the description doesn't create hardcoded assumptions — it just helps routing.

### 3. Minimal-touch approach

**Decision:** Change only the `company/` reference on line 22. Don't restructure or refactor surrounding content.

**Rationale:** The skill passed eval. The context dependencies section and graceful fallback are already correctly implemented. Minimizing changes preserves the evaluated behavior.

## Risks / Trade-offs

**[Low] Template drift** — If `legal-entities.template.md` is updated by context-layer-architecture after this change, the skill's expectations might not match the template fields.
→ Mitigation: This change doesn't depend on template content, only on the file path convention. Template updates are backward-compatible by design.

**[Low] Missing context file UX** — The current fallback message (line 14) says to ask the user about their business form. The Context Dependencies section (line 166) suggests running environment-setup. These are slightly different instructions.
→ Mitigation: Both are valid paths. The inline fallback (ask user) is the immediate UX; the Context Dependencies warning is for systematic setup. No change needed.
