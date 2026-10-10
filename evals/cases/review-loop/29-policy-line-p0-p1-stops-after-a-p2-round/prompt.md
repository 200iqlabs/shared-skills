---
name: review-loop-29-policy-line-p0-p1-stops-after-a-p2-round
description: 'Under Important: P0-P1, a round whose only fixes were P2 findings ends the loop instead of starting another review.'
tags: [review-loop, tier-read]
expected_outcome: 'DALEJ: koniec (minor-only).'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-loop na PR 12 (zmiana add-auth, `--max 5`). `REVIEW.md` w repozytorium ma linię `Important: P0-P1`. W iteracji 1 recenzja podniosła dwie uwagi `[P2]` i obie poprawiono — w kodzie jest więc nowy materiał. Sub-agent zakończył linią:

```
{"important_found": 0, "important_fixed": 0, "minor_fixed": 2, "rejected": 0, "repeated": 0, "clean": false, "pushed_commit_sha": "5b431277b031648832d09305755ed48431374a4c", "conventions": [], "error": null}
```

Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. Czy pętla uruchamia kolejną recenzję? Na końcu jedna linia: `DALEJ: kolejna iteracja` albo `DALEJ: koniec (<powód zakończenia>)`.
