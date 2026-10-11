---
name: review-loop-23-dirty-working-tree-stops
description: 'Uncommitted changes abort the loop before the first review, asking to commit or stash.'
tags: [review-loop, tier-read, smoke]
expected_outcome: 'Aborts before iteration 1; commit or stash; does neither itself.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-loop: PR 12, zmiana add-auth, „zapętl review i poprawki, aż się uspokoi”. PR 12 jest otwarty, jestem na jego gałęzi `change/add-auth`, katalog `openspec/changes/add-auth/` istnieje, a preflight Codexa zwrócił `"ok": true` ze wskaźnikiem w porządku. `git status --porcelain` wypisuje:

```
 M src/session.py
?? notes.txt
```

Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. Co robi skill?
