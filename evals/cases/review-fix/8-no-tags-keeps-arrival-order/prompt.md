---
name: review-fix-8-no-tags-keeps-arrival-order
description: 'With no severity on any finding, no ranking is invented: arrival order stands.'
tags: [review-fix, tier-read]
expected_outcome: 'Order #1 to #6 as they arrived.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-fix na PR 11. Recenzja Codexa zwróciła sześć uwag i żadna nie niesie tagu wagi (helper podał `tag: null` przy każdej), w tej kolejności:

#1 Missing null check on the config path — src/config.py:14
#2 The error message names the wrong file — src/config.py:30
#3 The cache key ignores the locale — src/cache.py:8-12
#4 The retry delay is not capped — src/sync.py:60
#5 SQL is built by string formatting — src/db.py:22-25
#6 The log level is too verbose — src/log.py:4

Każdą uznajesz za zasadną. Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. W jakiej kolejności skill je poprawia? Zakończ odpowiedź jedną linią w formacie `KOLEJNOŚĆ: #a, #b, …` z numerami uwag.
