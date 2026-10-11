---
name: review-loop-25-null-strings-read-as-null
description: 'A return line carrying the string "null" for error is normalised to a real null, so a good iteration continues.'
tags: [review-loop, tier-read]
expected_outcome: 'DALEJ: kolejna iteracja.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-loop na PR 12 (zmiana add-auth, `--max 5`). Sub-agent iteracji 2 zakończył odpowiedź taką ostatnią linią:

```
{"important_found": 1, "important_fixed": 1, "minor_fixed": 0, "rejected": 0, "repeated": 0, "clean": false, "pushed_commit_sha": "5b431277b031648832d09305755ed48431374a4c", "conventions": [], "error": "null"}
```

Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. Jak skill odczytuje tę linię i co robi dalej? Na końcu jedna linia: `DALEJ: kolejna iteracja` albo `DALEJ: koniec (<powód zakończenia>)`.
