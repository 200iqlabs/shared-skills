## 1. Remove hardcoded user-specific content from SKILL.md

- [x] 1.1 Remove hardcoded intro domain reference — change "buduja pozycje eksperta w automatyzacji i AI" to generic phrasing ("eksperta w swojej dziedzinie")
- [x] 1.2 Replace hardcoded hashtag values in `### Hashtagi` section — remove specific hashtags (#automatyzacja, #nocode, #make, #n8n, etc.), keep usage rules (3-5 max, at end of post), add instruction to load from `context/author-profile.md`
- [x] 1.3 Replace hardcoded domain references in brainstorm behavior — change "trendow w automatyzacji/AI" to "trendow w specjalizacji autora"

## 2. Add context loading and active usage instructions

- [x] 2.1 Update `### Profil autora` section — ensure it instructs to read `context/author-profile.md` for identity, audience, hashtags, and example posts
- [x] 2.2 Add audience-aware content instructions — add explicit guidance to adapt tone, complexity, hooks, and CTA style to match the audience defined in context
- [x] 2.3 Add example posts analysis instructions — add guidance to analyze example posts for structural patterns (hook type, paragraph length, emoji density, CTA style) and replicate them in new content

## 3. Implement graceful degradation

- [x] 3.1 Update `## Context Dependencies` section — ensure it lists `context/author-profile.md` as required with clear description
- [x] 3.2 Add two-tier fallback instructions — (1) notify about missing file + suggest environment-setup, (2) if user proceeds, operate in generic mode using only writing-style.md rules
- [x] 3.3 Add partial context handling — instruct skill to use filled fields and treat `[DO UZUPELNIENIA]` placeholders as missing, degrading per-section independently

## 4. Clean up and verify

- [x] 4.1 Verify `references/example-posts.md` does not exist (already removed)
- [x] 4.2 Verify `context/templates/author-profile.template.md` has all needed sections (Profil, Audiencja, Hashtagi, Przyklady dobrych postow)
- [x] 4.3 Verify `references/writing-style.md` is still referenced in the Reference files table
- [x] 4.4 Review full SKILL.md for any remaining hardcoded personal data, domain-specific terms, or audience assumptions
