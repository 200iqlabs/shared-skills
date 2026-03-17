## Requirements

### Requirement: Context-based author identity
The linkedin-content skill SHALL load author identity exclusively from `context/author-profile.md` instead of containing hardcoded author information in SKILL.md. The skill MUST NOT contain any hardcoded author names, roles, company names, or personal details.

#### Scenario: Author profile loaded at session start
- **WHEN** the linkedin-content skill is activated
- **THEN** the skill reads `context/author-profile.md` for author name, role, specialization, voice, values, audience, hashtags, and example posts

#### Scenario: No hardcoded identity in SKILL.md
- **WHEN** reviewing SKILL.md content
- **THEN** there SHALL be no personal names, company names, or role titles embedded in the skill instructions or metadata (except `metadata.author` which identifies the skill creator, not the content author)

### Requirement: Context-based hashtags
The skill MUST NOT contain hardcoded hashtag lists in SKILL.md. All hashtags (both standard and thematic) SHALL be loaded from `context/author-profile.md`. The skill MAY describe how hashtags should be used (quantity, placement) as domain knowledge, but specific hashtag values MUST come from context.

#### Scenario: No hardcoded hashtags in SKILL.md
- **WHEN** reviewing the skill's SKILL.md
- **THEN** the Hashtagi section contains no specific hashtag values — only instructions to load them from `context/author-profile.md`

#### Scenario: Hashtags loaded from context
- **WHEN** generating a post
- **THEN** the skill uses hashtags from the `Standardowe hashtagi` section of `context/author-profile.md`

### Requirement: Domain-agnostic skill instructions
The skill instructions SHALL NOT reference specific industries, technologies, or domains (e.g., "automatyzacja", "AI", "no-code"). The skill MUST be generic enough to serve any author's specialization. Domain-specific context comes from `context/author-profile.md`.

#### Scenario: No hardcoded specialization in intro
- **WHEN** reviewing the skill's intro text
- **THEN** the description says something generic like "buduja pozycje eksperta" without specifying a field

#### Scenario: No hardcoded domain in brainstorm behavior
- **WHEN** the skill describes brainstorm behavior
- **THEN** it says "dopasuj do aktualnych trendow w specjalizacji autora" instead of referencing specific domains

### Requirement: Audience-aware content generation
The skill SHALL use the audience definition from `context/author-profile.md` to tailor post content. The audience context MUST influence hook selection, language register, examples used, and CTA style. The skill MUST NOT contain hardcoded audience descriptions.

#### Scenario: Post tailored to defined audience
- **WHEN** generating a post and `context/author-profile.md` contains an Audiencja section
- **THEN** the skill adapts tone, complexity, and examples to match the target audience (e.g., technical details for IT specialists, business outcomes for managers)

#### Scenario: Brainstorm topics for audience
- **WHEN** the user asks for topic brainstorming
- **THEN** the skill proposes topics relevant to the audience defined in context, not to a hardcoded domain

#### Scenario: No audience in context — generic fallback
- **WHEN** the Audiencja section is missing or contains placeholders
- **THEN** the skill asks the user who their target audience is before generating content, or proceeds with a neutral professional tone

### Requirement: Style learning from example posts
The skill SHALL analyze example posts from `context/author-profile.md` to learn the author's writing patterns and replicate them. This includes structure, hook style, paragraph length, emoji usage, tone, and CTA patterns.

#### Scenario: Style extracted from examples
- **WHEN** generating a post and `context/author-profile.md` contains filled-in example posts
- **THEN** the skill analyzes the examples for recurring patterns (hook type, paragraph structure, emoji density, CTA style) and applies them to new content

#### Scenario: Consistency with past successes
- **WHEN** the user provides example posts that had good reach
- **THEN** the skill treats these as the reference standard for what works and mirrors their structure and tone in new posts

#### Scenario: No example posts — generic fallback
- **WHEN** the example posts section is missing or contains only placeholders
- **THEN** the skill uses its general writing rules from `references/writing-style.md` without author-specific style matching, and suggests the user add example posts for better personalization

### Requirement: Context Dependencies section
The skill MUST include a `## Context Dependencies` section that lists all required and recommended context files with their purpose, following the project convention.

#### Scenario: Context Dependencies section present
- **WHEN** reading the skill's SKILL.md
- **THEN** a `## Context Dependencies` section EXISTS listing `context/author-profile.md` as required, with a description of what it provides

### Requirement: Graceful degradation for missing context
The skill SHALL handle missing or incomplete context with a two-tier fallback strategy: (1) inform the user about missing context and suggest running environment-setup, AND (2) continue operating in a generic mode if the user chooses to proceed without context.

#### Scenario: Missing author-profile.md — notification
- **WHEN** the skill is activated and `context/author-profile.md` does not exist
- **THEN** the skill informs the user that the file is missing and suggests running the environment-setup skill to create it

#### Scenario: Missing author-profile.md — generic fallback
- **WHEN** the skill is activated and `context/author-profile.md` does not exist AND the user wants to proceed anyway
- **THEN** the skill operates in generic mode: asks the user about their role and specialization inline, generates posts without personalized hashtags or example post style matching, and omits author-specific voice/values

#### Scenario: Partial author-profile.md
- **WHEN** `context/author-profile.md` exists but contains `[DO UZUPELNIENIA]` placeholders
- **THEN** the skill warns about incomplete fields, uses the fields that ARE filled in, and treats placeholder fields as missing (generic fallback for those specific aspects)

### Requirement: Domain knowledge stays in references
The file `references/writing-style.md` SHALL remain in the skill's references directory as domain knowledge. It MUST NOT be moved to the context layer.

#### Scenario: Writing style reference preserved
- **WHEN** the migration is complete
- **THEN** `references/writing-style.md` exists in the skill's references directory and is referenced in the skill's reference files table

### Requirement: Example posts in context template
User-specific example posts SHALL be part of the `context/templates/author-profile.template.md` template, not stored in skill references. The template MUST include a section for example posts with `[DO UZUPELNIENIA]` placeholders.

#### Scenario: Template includes example posts section
- **WHEN** reviewing `context/templates/author-profile.template.md`
- **THEN** the template contains a section for example posts with placeholder markers for the user to fill in

#### Scenario: No example-posts.md in skill references
- **WHEN** the migration is complete
- **THEN** no `example-posts.md` file exists in `skills/linkedin-content/references/`
