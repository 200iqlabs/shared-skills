---
name: review-fix-11-not-signed-in-stops-the-same-way
description: 'Codex installed but not signed in stops the pass the same way, naming /codex:setup.'
tags: [review-fix, tier-read]
expected_outcome: 'Stops before reviewing; names /codex:setup.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-fix na PR 12. `node "$HELPER" preflight` zakończył się kodem 2:

```json
{"ok": false, "version": "1.0.2", "scope": "user", "error": "Codex is not signed in: not authenticated", "next": "/codex:setup"}
```

Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. Co skill robi dalej?
