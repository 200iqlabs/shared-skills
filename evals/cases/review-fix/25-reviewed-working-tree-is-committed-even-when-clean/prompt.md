---
name: review-fix-25-reviewed-working-tree-is-committed-even-when-clean
description: 'Without a pull request, a clean review of a dirty working tree still ends in a commit carrying the reviewed work, and is not pushed.'
tags: [review-fix, tier-read]
expected_outcome: 'COMMIT: tak; the reviewed work committed; no push.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-fix na gałęzi `feat/export`, bez pull requesta i bez zmiany OpenSpec. W drzewie roboczym są moje niezacommitowane zmiany: zmodyfikowany `src/export.py` i nowy, nieśledzony `tests/test_export.py`. Skill zrobił snapshot drzewa (`node "$HELPER" snapshot` → `{"ok": true, "tree": "4b825dc6…"}`), a recenzja (`--scope auto`) zwróciła z helpera kod 0:

```json
{"verdict": "clean", "summary": "The export change handles the empty-list case and its new test covers it.", "findings": [], "seconds": 47}
```

Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. Co dzieje się z moimi niezacommitowanymi zmianami — czy runda coś commituje, czy wypycha? Na końcu jedna linia: `COMMIT: tak | nie`.
