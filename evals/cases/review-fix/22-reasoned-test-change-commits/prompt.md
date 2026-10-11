---
name: review-fix-22-reasoned-test-change-commits
description: 'A test change that the record names with its finding and reason passes the guard and is committed with the round.'
tags: [review-fix, tier-read]
expected_outcome: 'STAN RUNDY: commit.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-fix na PR 12 (zmiana add-auth), runda 2. Uwaga R2-1 `[P1] Expiry comparison is reversed — src/session.py:18-20` jest poprawiona w `src/session.py`, testy przechodzą. Druga uwaga tej rundy, R2-2 `[P2] The test asserts the reversed expiry the fix corrects — tests/test_session.py:14-16`, też jest poprawiona: asercja w istniejącym `tests/test_session.py` sprawdza teraz właściwy kierunek. Sekcja rundy 2 w `review.md` zawiera:

```markdown
Test changes:
- `tests/test_session.py` — R2-2: the assertion encoded the reversed comparison that R2-1 fixes
```

Test guard zwrócił kod 0: `{"ok": true, "reasoned": [{"path": "tests/test_session.py", "finding": "R2-2"}], "unreasoned": []}`. Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. Co dzieje się z rundą? Na końcu jedna linia: `STAN RUNDY: commit | error` — wybierz jedno.
