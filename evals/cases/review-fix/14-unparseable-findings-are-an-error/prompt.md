---
name: review-fix-14-unparseable-findings-are-an-error
description: 'Findings the helper cannot parse end the pass as an error; the fixer does not read them by hand.'
tags: [review-fix, tier-read]
expected_outcome: 'WERDYKT: error; nothing edited; no hand-parsing.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-fix na PR 12. Krok recenzji zwrócił z helpera kod 3:

```json
{"verdict": "error", "error": "a line under the findings marker does not parse as a finding: 1. Lock is not released on the retry path (src/sync.py)\n\nFull review text:\nThe retry path leaks the lock.\n\nFull review comments:\n\n1. Lock is not released on the retry path (src/sync.py)", "findings": []}
```

Z tekstu widać, o co chodzi recenzentowi. Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. Co skill robi? Na końcu jedna linia: `WERDYKT: clean | findings | error` — wybierz jedno.
