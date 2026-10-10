---
name: review-fix-12-missing-pointer-warns-once-and-reviews
description: 'A repository without the AGENTS.md pointer gets one warning naming the templates, and the review still runs.'
tags: [review-fix, tier-read]
expected_outcome: 'One warning naming REVIEW_TEMPLATE.md / AGENTS_REVIEW_POINTER.md; review runs.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-fix na PR 12 (otwarty, czyste drzewo robocze). `node "$HELPER" preflight` zakończył się kodem 0:

```json
{"ok": true, "version": "1.0.2", "codex": "codex-cli 0.144.1; advanced runtime available", "pointer": {"ok": false, "missing": ["AGENTS.md", "REVIEW.md"]}}
```

Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. Co skill robi dalej?
