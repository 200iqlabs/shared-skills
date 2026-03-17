## Context

The linkedin-content skill passed eval (commit f223474) but still contains hardcoded personal data: author identity ("Pawel Lipowczan"), domain references ("automatyzacja i AI"), specific hashtag lists, and audience assumptions. The context-layer-architecture change established the pattern: user data in `context/`, domain knowledge in `references/`. This skill needs to follow that pattern.

Current state of SKILL.md has three categories of content:
1. **User-specific** (must move to context): author identity, hashtags, audience, example posts, domain references
2. **Domain knowledge** (stays in references): writing-style.md rules, post type definitions, formatting guidelines
3. **Skill logic** (stays in SKILL.md): how to structure posts, when to load files, response format, boundaries

## Goals / Non-Goals

**Goals:**
- Remove ALL hardcoded user-specific content from SKILL.md
- Make the skill domain-agnostic — usable by any author in any field
- Implement two-tier graceful degradation (notify + generic fallback)
- Ensure audience and example posts actively shape generated content (not just loaded passively)

**Non-Goals:**
- Re-evaluating the skill or changing its triggering description
- Modifying writing-style.md or post type definitions
- Adding new features beyond context layer migration
- Changing the context template structure (already created by context-layer-architecture)

## Decisions

### Decision 1: Edit-in-place vs. rewrite SKILL.md

**Chosen: Edit-in-place** — surgically remove/replace hardcoded content while preserving the proven skill structure.

*Alternative: Full rewrite.* Rejected because the skill already passed eval. A rewrite risks breaking working behavior and would require re-evaluation. The changes are localized enough for targeted edits.

### Decision 2: Fallback strategy — block vs. degrade gracefully

**Chosen: Two-tier degradation** — (1) notify about missing context + suggest environment-setup, (2) continue in generic mode if user proceeds.

The skill instructions will define three operating modes:
- **Full context**: all fields present → personalized posts matching author's style, audience, hashtags
- **Partial context**: some fields filled, some placeholders → use what's available, ask about missing aspects inline
- **No context**: file missing entirely → warn once, then operate as a generic LinkedIn ghostwriter using only writing-style.md rules

*Alternative: Hard block (refuse to generate without context).* Rejected — too rigid for a content tool. Users should be able to try the skill immediately and see value before investing time in context setup.

### Decision 3: How to handle hardcoded hashtags section

**Chosen: Replace values with loading instruction.** Keep the `### Hashtagi` section header but change the content from specific hashtags to an instruction to load them from `context/author-profile.md`. Include a note about hashtag count/placement rules (domain knowledge) without specific values.

*Alternative: Remove the section entirely.* Rejected — the section also contains domain knowledge about hashtag usage conventions (3-5 max, at the end of post, not in body) that should stay.

### Decision 4: How to handle domain references in instructions

**Chosen: Replace specific domains with context-relative phrasing.** For example:
- "eksperta w automatyzacji i AI" → "eksperta w swojej dziedzinie"
- "trendow w automatyzacji/AI" → "trendow w specjalizacji autora (z kontekstu)"
- Remove thematic hashtag examples (#make, #n8n, etc.)

### Decision 5: How the skill uses audience and example posts

**Chosen: Active analysis instructions in SKILL.md.** Add explicit instructions telling the skill to:
- Analyze example posts for structural patterns (hook type, paragraph length, emoji density, CTA style) and replicate them
- Adapt tone and complexity to match the defined audience
- When brainstorming, propose topics relevant to the audience, not to a hardcoded domain

This is skill logic (stays in SKILL.md), not user data — it describes *how* to use the context, not *what* the context contains.

## Risks / Trade-offs

**[Quality regression without context]** → In generic mode, posts will be less personalized and may feel generic. Mitigation: the notification clearly communicates that adding context improves results, and the skill suggests adding example posts when generating without them.

**[Breaking existing eval results]** → Structural changes to SKILL.md could affect triggering or response quality. Mitigation: edit-in-place approach preserves proven structure. Description (frontmatter) is explicitly NOT changed. Non-goal: re-evaluation is not required since changes are structural, not behavioral.

**[Partial context edge cases]** → A profile with only name filled but everything else as placeholders could produce odd results. Mitigation: the skill checks individual sections, not just file existence. Each section degrades independently.

## Migration Plan

1. Edit SKILL.md — remove hardcoded content, add context loading instructions
2. Verify `context/templates/author-profile.template.md` has all needed sections (already exists)
3. Delete `references/example-posts.md` if still present (already removed in prior work)
4. Manual smoke test: activate skill without context file → verify notification appears
5. Manual smoke test: activate skill with filled context → verify personalized output

No rollback needed — this is a content edit to a single SKILL.md file, easily reverted via git.
