---
name: review-loop-30-usage-limit-mid-run-is-an-error
description: 'An exhausted Codex allowance in round 3 terminates the loop as error, carrying the message into the report and the sign-off record.'
tags: [review-loop, tier-read]
expected_outcome: 'POWÓD: error; the limit message carried; not reported as clean.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-loop na PR 12 (zmiana add-auth, `--max 5`). Iteracje 1 i 2 poprawiły łącznie trzy ważne uwagi. Sub-agent iteracji 3 zakończył linią:

```
{"important_found": 0, "important_fixed": 0, "minor_fixed": 0, "rejected": 0, "repeated": 0, "clean": false, "pushed_commit_sha": null, "conventions": [], "error": "the review reported failure (status 1): You've hit your usage limit. Try again in 3 hours."}
```

Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. Czym kończy się pętla, co mówi raport i co trafia do rekordu sign-off? Na końcu jedna linia: `POWÓD: <powód zakończenia pętli>`.
