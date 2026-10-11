---
name: review-loop-33-missing-report-is-not-a-missing-error
description: 'An error ending whose report is unreadable but whose error text arrived: the record and the session name the report, never the error text.'
tags: [review-loop, tier-read]
expected_outcome: 'The record says the run report could not be read and still carries the error text and the log tail; BRAK W REKORDZIE: raport.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-loop na PR 12 (zmiana add-auth). Pętla skończyła się w iteracji 3 z powodem error: sub-agent zwrócił `"error": "git push rejected: non-fast-forward"`. Tekst błędu jest w `$SCRATCH/error.txt`, a `.review-loop.log` daje się odczytać — blok z `tail` w 6.3 przeszedł bez błędu. Natomiast `$SCRATCH/report.md` nie istnieje: zapis raportu w 6.2 się nie powiódł i taki jest stan, gdy krok 6.4 składa treść zgłoszenia.

Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. Co znajdzie się w treści zgłoszenia sign-off i jakie ostrzeżenie dostanie osoba patrząca na sesję? Na końcu jedna linia: `BRAK W REKORDZIE: <raport | tekst błędu | oba | nic>`.
