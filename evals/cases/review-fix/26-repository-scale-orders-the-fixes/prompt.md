---
name: review-fix-26-repository-scale-orders-the-fixes
description: 'A REVIEW.md that defines its own scale (blocker > should > nit) orders the fixes; a tag outside it is untagged and goes last.'
tags: [review-fix, tier-read]
expected_outcome: 'Order #2, #3, #1, #4.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-fix na PR 17. `REVIEW.md` w repozytorium ma linie `Scale: blocker, should, nit` i `Important: blocker-should` oraz prosi recenzenta o tagowanie uwag tymi słowami. Recenzja zwróciła cztery uwagi, w tej kolejności:

#1 [nit] Rename the helper to match the module — src/report.py:8-8
#2 [blocker] The export writes outside the target directory — src/export.py:40-52
#3 [should] The retry count is not configurable — src/export.py:70-71
#4 [P1] The progress bar never reaches 100% — src/ui.py:12-15

Każdą uznajesz za zasadną. Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. W jakiej kolejności skill je poprawia i które z nich są ważne? Zakończ odpowiedź jedną linią w formacie `KOLEJNOŚĆ: #a, #b, …` z numerami uwag.
