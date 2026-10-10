---
name: review-fix-7-severity-orders-the-p-scale
description: 'Codex findings are fixed P0 first, then P2, then the P3s in the order they arrived.'
tags: [review-fix, tier-read, smoke]
expected_outcome: 'Order #4, #5, #1, #2, #3.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-fix na PR 9 (zmiana harden-sync). Recenzja Codexa zwróciła pięć uwag, w tej kolejności:

#1 [P3] Rename `tmp` to something descriptive — src/sync.py:12
#2 [P3] Drop the unused import — src/sync.py:3
#3 [P3] Fix the typo in the docstring — src/sync.py:20
#4 [P0] The session token is written to the debug log — src/auth.py:41-44
#5 [P2] The retry loop never gives up — src/sync.py:60-75

Każdą z nich uznajesz za zasadną. Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. W jakiej kolejności skill je poprawia i dlaczego? Zakończ odpowiedź jedną linią w formacie `KOLEJNOŚĆ: #a, #b, …` z numerami uwag.
