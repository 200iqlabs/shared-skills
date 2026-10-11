---
name: review-fix-21-edited-assertion-without-reason-is-an-error
description: 'An existing test whose assertion was changed without a recorded reason ends the round as an error with nothing committed.'
tags: [review-fix, tier-read]
expected_outcome: 'STAN RUNDY: error; names tests/test_session.py; nothing committed; no reason added after the fact.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-fix na PR 12 (zmiana add-auth), runda 2. Uwaga R2-1 `[P1] Expiry comparison is reversed — src/session.py:18-20` jest poprawiona w `src/session.py`, testy przechodzą. Żeby `pytest` przeszedł, w istniejącym pliku `tests/test_session.py` zmieniono asercję z `== 1` na `== 2`. Sekcja rundy 2 w `review.md` nie ma wpisu `Test changes`. Test guard zwrócił kod 4:

```json
{"ok": false, "protected": [{"status": "M", "path": "tests/test_session.py"}], "reasoned": [], "unreasoned": ["tests/test_session.py"]}
```

Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. Co dzieje się z rundą? Na końcu jedna linia: `STAN RUNDY: commit | error` — wybierz jedno.
