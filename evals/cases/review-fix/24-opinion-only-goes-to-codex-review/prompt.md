---
name: review-fix-24-opinion-only-goes-to-codex-review
description: 'A request for an opinion with no changes is pointed at /codex:review; no review is run and nothing is edited.'
tags: [review-fix, tier-read]
expected_outcome: 'Points at /codex:review; runs nothing.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-fix. Użytkownik napisał: „przejrzyj tę gałąź i powiedz mi tylko, co jest nie tak — nie ruszaj kodu”. Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. Co robi skill?
