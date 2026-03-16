## Context

The business-consultant skill is a fully implemented skill migrated from Claude Projects. It currently contains personal references to a specific consultant (name, contact info, company history) and specific client names baked into SKILL.md and reference files. Per the new context layer architecture, user-specific data must be migrated to `context/` (gitignored, populated via environment-setup skill), while domain knowledge stays in `references/`.

After migration, the skill is evaluated through the skill-creator process to validate triggering accuracy and response quality.

Prior evals (linkedin-content, tax-advisor) established the eval pattern. This change adds context layer migration as a prerequisite step before eval.

**Dependency:** The `context-layer-architecture` change must be implemented first. It establishes the `context/` directory, templates infrastructure, environment-setup skill, and the `## Context Dependencies` convention that this change consumes.

## Goals / Non-Goals

**Goals:**
- Migrate user-specific data from references/ to context/ per context layer architecture
- Add `## Context Dependencies` section to SKILL.md with graceful fallback behavior
- Strip hardcoded identity from SKILL.md Overview and manifest.md
- Run full skill-creator eval (test prompts → with/without-skill tests → grading → benchmark)
- Achieve ≥80% triggering accuracy on the description
- Update EVAL-PLAYBOOK.md status upon completion

**Non-Goals:**
- Rewriting the skill's consulting methodology or workflow
- Adding new reference files or capabilities
- Changing pricing guidelines or ranges
- Creating the context layer infrastructure (that's context-layer-architecture)
- Full rewrite — only context migration + eval-driven cosmetic fixes

## Decisions

### 1. Context layer migration — move user data to context/, keep domain knowledge in references/

**Choice:** Instead of anonymizing personal data in place, migrate it to the context layer:
- **Move to context/:** `projekty.md` (project history) → `context/projects-portfolio`, `case-study-eventowa.md` + `case-study-faktury.md` (user case studies) → `context/projects-portfolio`, identity parts of `manifest.md` (name, contact, personal branding) → `context/consultant-profile`
- **Keep in references/:** `discovery-questions.md`, `pricing-guidelines.md`, `tech-stack-comparison.md`, methodology-only parts of `manifest.md`
- **Remove from SKILL.md:** hardcoded identity ("niezalezny konsultant, wczesniej Technical Lead w Automation House")

**Why:** The context layer architecture separates user-specific data (gitignored, per-environment) from domain knowledge (shared, version-controlled). This makes the skill distributable without leaking personal data, while allowing each user to populate their own consultant profile and project history via the environment-setup skill. Domain knowledge (discovery frameworks, pricing models, tech comparisons) is universally useful and stays in references/.

**Alternative considered:** In-place anonymization (replacing real names with generic descriptors). Rejected because it still bakes assumptions about a single consultant's experience into shared code. The context layer is a cleaner separation that supports multiple users.

### 2. manifest.md — strip identity, keep methodology as reference

**Choice:** Remove personal branding header ("Manifest Niezaleznego Konsultanta — Pawel Lipowczan"), contact info block, and any personal identity references. Keep the 5 consulting principles and collaboration model as domain knowledge in references/.

**Why:** The methodology (Problem przed Rozwiazaniem, Mierzalnosc, Agnostycyzm Technologiczny, Transparentnosc, Ewolucja zamiast Rewolucji) is universally applicable domain knowledge — it belongs in references/. The personal identity wrapper belongs in context/consultant-profile.

### 3. Context Dependencies section — graceful fallback on missing context

**Choice:** Add a `## Context Dependencies` section to SKILL.md declaring:
- `context/consultant-profile` — consultant identity, background, contact info
- `context/projects-portfolio` — past projects, case studies, portfolio

When context files are missing, the skill MUST: warn the user, suggest running the environment-setup skill, and continue with reduced capability (generic consulting advice without personalized portfolio or identity).

**Why:** This is a mandatory convention from the context layer architecture. It ensures the skill works out-of-the-box (degraded but functional) while prompting users to set up their environment for full capability.

### 4. Eval approach — follow established playbook with Windows workarounds

**Choice:** Use `/skill-creator` with the same approach as tax-advisor eval:
- Generate 5+ test prompts in Polish (matching real user patterns)
- Run with-skill vs without-skill baseline tests in parallel
- Grade with assertions via script + `--static` flag (Windows cp1252 workaround)
- Manual description optimization (run_loop.py doesn't work on Windows)
- Workspace: `skills/business-consultant-workspace/iteration-1/`

**Why:** Proven process from prior evals. Windows workarounds are documented in EVAL-PLAYBOOK.md.

### 5. Test prompt focus areas

**Choice:** Cover all 5 workflow phases from the skill to ensure broad evaluation:
1. Discovery — analyzing meeting notes, suggesting questions
2. Analysis — identifying bottlenecks, mapping processes
3. Solution design — architecture, tool selection (Make vs n8n vs Zapier)
4. Estimation — time/cost breakdown, pricing
5. Proposal/offer — ROI calculation, offer structure

**Why:** The skill's broad scope (discovery → offer) is a triggering risk. Test prompts must cover all phases to ensure the description captures the full range.

## Risks / Trade-offs

**[Context files missing degrades skill quality]** → Mitigation: Graceful fallback with clear warning. The skill still provides domain knowledge (frameworks, pricing models, tech comparisons) without context. The environment-setup suggestion gives users a path to full capability.

**[Migration breaks existing users]** → Mitigation: Context-layer-architecture change provides migration tooling. Users who had the old skill will need to run environment-setup once to populate context files. This is a one-time setup cost.

**[Description triggering for broad skill]** → Mitigation: The skill covers many use cases (discovery, analysis, design, estimation, offers). Description optimization phase will specifically test edge cases where the skill should/shouldn't trigger. Polish + English keywords in description help bilingual triggering.

**[Windows eval tooling limitations]** → Mitigation: Use `--static` flag for review generation. Do description optimization manually instead of via run_loop.py. Both workarounds are proven from prior evals.

## Open Questions

- Exact content split for manifest.md: how much of the collaboration model section is "methodology" (stays in references/) vs "personal working style" (goes to context/consultant-profile)? Decision: resolve during implementation by checking if content is universally applicable or consultant-specific.
