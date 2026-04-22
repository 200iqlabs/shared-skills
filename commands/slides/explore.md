---
name: "Slides: Explore"
description: Brainstorm a deck concept before committing to a workspace. Captures ideas to slides/_explore/<slug>-ideas.md that persists across sessions.
category: Slides
tags: [slides, marp, brainstorm]
---

Enter brainstorm mode for a new deck — the pre-workspace phase where you shape audience, goal, format, hook, and structure before creating any durable workspace.

**Input:** Free-form topic description after `/slides:explore`. Can be vague ("something on AI tooling") or specific ("carousel recapping this week's AI news, PL audience").

**Steps**

1. **Load skill knowledge.** Invoke the `slides` skill (Skill tool, `skill: "slides"`) — full behavior for explore mode is in its SKILL.md under "Mode: explore".

2. **Verify setup.** Confirm `slides/config.yaml` and `slides/project.md` exist. If missing, halt with instruction to run `/slides:init` first.

3. **Conduct interactive brainstorm.** Follow the SKILL.md explore mode guidance — cover audience, goal, format, source materials, hook ideas, and structural options. Prefer asking one or two grouped questions at a time over interrogating with a rigid script. Use ASCII diagrams when they would clarify structure.

4. **Propose a slug.** Kebab-case, ≤40 chars. Date-prefixed if the content is time-bound (weekly, event-specific). Confirm with user before writing.

5. **Persist to `slides/_explore/<slug>-ideas.md`.** If the file already exists (follow-up explore session), append a dated section rather than overwriting. Use the structure defined in SKILL.md explore mode.

6. **Summarize and hand off.** Report: chosen slug, key decisions, source materials identified, next step is `/slides:new <slug>` — which will consume this ideas file.

**Output**

Brainstorm notes saved to `slides/_explore/<slug>-ideas.md` plus a brief summary in chat with:
- Final slug
- One-line goal
- Audience
- Format
- Source materials lineup
- Two or three competing structural options (if applicable) with a recommendation

**Guardrails**

- Do NOT create `slides/workspace/<slug>/` — that is `/slides:new`'s job
- Do NOT generate an actual draft or Marp file — exploration is pre-content
- If the user's input is specific enough to skip brainstorm entirely, suggest `/slides:new <slug>` directly instead of wasting their time
- Append on re-invocation, do not overwrite the ideas file
