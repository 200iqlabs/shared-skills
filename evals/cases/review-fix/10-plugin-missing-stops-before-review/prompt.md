---
name: review-fix-10-plugin-missing-stops-before-review
description: 'Without the Codex plugin the pass stops before reviewing or editing anything, names /codex:setup, and does not fall back to PR comments.'
tags: [review-fix, tier-read]
expected_outcome: 'Stops; names /codex:setup; nothing edited; Copilot comments ignored.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-fix na PR 12 (gałąź change/add-auth). Pierwszy krok skilla, `node "$HELPER" preflight`, zakończył się kodem 2 i wypisał:

```json
{"ok": false, "error": "the codex@openai-codex plugin is not installed for this repository", "next": "/codex:setup"}
```

Na PR wiszą też trzy komentarze Copilota sprzed tygodnia. Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. Co skill robi dalej i czym kończy się ten przebieg?
