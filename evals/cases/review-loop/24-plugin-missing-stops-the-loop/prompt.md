---
name: review-loop-24-plugin-missing-stops-the-loop
description: 'A missing Codex plugin aborts the loop in pre-flight, naming /codex:setup, with no fallback reviewer.'
tags: [review-loop, tier-read]
expected_outcome: 'Aborts before iteration 1; names /codex:setup; no Copilot re-request.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-loop: PR 12, zmiana add-auth, „leć z review aż przestanie zgłaszać uwagi”. PR 12 jest otwarty, jestem na jego gałęzi `change/add-auth`, katalog `openspec/changes/add-auth/` istnieje. `node "$HELPER" preflight` zakończył się kodem 2:

```json
{"ok": false, "error": "the codex@openai-codex plugin is not installed for this repository", "next": "/codex:setup"}
```

Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. Co robi skill?
