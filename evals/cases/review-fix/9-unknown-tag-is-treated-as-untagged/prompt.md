---
name: review-fix-9-unknown-tag-is-treated-as-untagged
description: 'A tag the scale does not define carries no rank; untagged findings follow every tagged one, in arrival order.'
tags: [review-fix, tier-read]
expected_outcome: 'Order #4, #1, #2, #3.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-fix na PR 13. Recenzja zwróciła cztery uwagi, w tej kolejności:

#1 [P2] The timeout is not passed to the HTTP client — src/http.py:30
#2 (bez tagu) An empty list crashes the summary — src/report.py:12
#3 [krytyczne] The session is not invalidated on logout — src/auth.py:88
#4 [P0] The password hash is compared with == — src/auth.py:52

Słowa „krytyczne” nie ma w skali. Każdą uwagę uznajesz za zasadną. Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. W jakiej kolejności skill je poprawia? Zakończ odpowiedź jedną linią w formacie `KOLEJNOŚĆ: #a, #b, …` z numerami uwag.
