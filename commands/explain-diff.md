---
description: Walk through code changes (PR / branch vs main) or a given path, one file at a time, in plain Polish — accept to continue, ask to go deeper
---

# Explain diff

Cel: przeprowadzić użytkownika **plik po pliku** przez zmiany w kodzie (albo przez wskazany kod), **jeden plik = jedna odpowiedź**, tak żeby mógł je zrozumieć i zaakceptować w spokojnym tempie — bez ściany tekstu, bez wrzucania wszystkiego naraz.

Opcjonalny zakres: `$ARGUMENTS` (numer PR, nazwa brancha / ref, albo ścieżka/folder/glob). Jak pusto → diff bieżącego brancha vs `origin/main`.

## Cel: edukacja (najważniejsze — waży na całości)

Ten proces ma **uczyć**, nie tylko streszczać. Z czasem użytkownik ma czytać taki kod **bez** tłumaczenia.

- **Audytorium:** doświadczony programista (15+ lat), ale **nie w JS/TS**. Fundamenty — wzorce, async, DI, koncepcje architektury, struktury danych — zna dobrze. **Nie tłumacz ich od zera.**
- **Edukacja celuje w specyfikę JS/TS i ekosystemu**: idiomy, składnia, dziwactwa (`this`, event loop, system typów TS, destructuring, moduły, konwencje bibliotek/frameworków). Tu są wyjaśnienia.
- **Mapuj, nie wykładaj.** Gdy znany koncept wraca w JS/TS, mów „to jak X, które znasz z innych języków, tylko w JS robi się to tak…" zamiast definiować X od podstaw.
- **Nazywaj rzeczy po imieniu.** Używaj prawdziwego terminu (technicznego, często angielskiego), a tuż obok daj krótki gloss w nawiasie przy **pierwszym** użyciu — np. „middleware (warstwa pośrednia przepuszczająca każdy request)". Gdy termin wraca, używaj już samego terminu (utrwalanie słownictwa).
- Gloss tylko przy rzeczach **language/framework-specific**, nie przy ogólnym CS.
- Przy `wyjaśnij X` tłumacz **koncept**, nie tylko ten jeden plik — buduj fundament, nie łatkę.
- Jak coś to ważny ogólny wzorzec JS/TS (Promise, closure, generics, dekorator…), zaznacz „to się przyda wszędzie, nie tylko tu".

## Język i forma

- **Pisz po polsku.** Terminy techniczne PL/EN, ale z glossą jak wyżej.
- **Jeden plik = jedna odpowiedź.** Nigdy nie omawiaj kilku plików w jednym bloku — pojedynczość to cały sens tej komendy.
- **Krótko i po ludzku.** Opis jednego pliku to kilka zdań + krótka lista, nie esej.
- **Nie zaczynaj implementacji.** Ta komenda tłumaczy, nie zmienia kodu.

## Wykrywanie zakresu (z `$ARGUMENTS`)

Ustal tryb na podstawie argumentu:

1. **Pusto** → diff bieżącego brancha vs `origin/main`. Użyj merge-base, żeby pokazać **tylko** zmiany tego brancha, nie szum rozjazdu:
   `git diff --stat $(git merge-base origin/main HEAD) HEAD`
   (fallback: jak brak `origin/main`, użyj lokalnego `main`; jak brak `main`, zapytaj o bazę).
2. **Liczba lub `#123`** → tryb PR: `gh pr diff 123` (+ `gh pr view 123 --json files` dla listy plików).
3. **Istniejąca ścieżka / folder / glob** (sprawdź czy istnieje na dysku) → **tryb statyczny**: opis kodu bez diffa.
4. **Inny tekst** → potraktuj jak git ref (np. `HEAD~3`, nazwa brancha) i zrób diff vs ten ref (merge-base jak w pkt 1).

W razie wątpliwości co do bazy porównania — zapytaj jednym zdaniem, nie zgaduj w ciemno.

## Kolejność plików

Sortuj w **logicznej kolejności do czytania**, nie alfabetycznie:
1. najważniejsza logika / entry point / rdzeń zmiany
2. kod wspierający (helpery, typy, modele)
3. config, build, testy — na końcu

## Format jednego pliku

Dla każdego pliku wypisz dokładnie taki blok:

```
**ścieżka/do/pliku.ts**  (plik 2 z 7)

- **Rola:** jedno zdanie — po co ten plik istnieje.
- **Co robi:** 2–3 zdania prostym językiem.
- **Co się zmieniło:** punkty po ludzku, z numerami linii (np. „L34–41: dodany guard clause…").

_OK = następny plik • albo zadaj pytanie (np. „wyjaśnij X")_
```

- W **trybie statycznym** ostatnia sekcja nazywa się **„Ważne kawałki:"** zamiast „Co się zmieniło:" — najistotniejsze fragmenty pliku zamiast diffa.
- Numery linii zawsze gdy się da — żeby użytkownik mógł od razu znaleźć miejsce.
- Stopka `_OK = … • albo zadaj pytanie_` pod **każdym** plikiem.

## Pętla interakcji (rdzeń)

To jest komunikacja **free-text**, NIE `AskUserQuestion` (żadnych przycisków).

1. **Start:** jedna linijka wstępu — ile plików i jaka baza, np.
   „Znalazłem 7 zmienionych plików (branch vs `origin/main`), idę po kolei." — a potem **od razu plik 1**.
2. Pokaż **jeden** plik (format wyżej). **Zatrzymaj się i czekaj.**
3. Czytaj odpowiedź użytkownika:
   - `OK` / `dalej` / `next` / `ok` / kciuk → przejdź do **następnego** pliku.
   - **Cokolwiek innego = pytanie** → odpowiedz prosto i konkretnie (koncept, nie łatka — patrz „Cel: edukacja"), **zostań na tym samym pliku**, na końcu znów pokaż stopkę `_OK = następny • albo zadaj pytanie_` i czekaj.
4. **Nie przechodź dalej bez akceptacji.** Jeden plik wisi aż użytkownik powie OK.
5. **Koniec** (po ostatnim pliku): krótka mapa — lista plików, każdy jednym zdaniem, + jedno-dwa zdania o ogólnym sensie całej zmiany. Potem **stop** (nie implementuj, chyba że użytkownik o to poprosi).

## Edge cases

- **Brak zmian** → powiedz wprost i zakończ (nie wymyślaj plików).
- **Dużo plików (>~15)** → uprzedź na starcie, zaproponuj zawężenie (np. „same pliki w `src/`?"), ale jak użytkownik nie zawęzi — jedź po kolei mimo to.
- **Numer PR, ale brak `gh`** → powiedz, że brakuje GitHub CLI, zaproponuj tryb brancha (`git diff` vs main) jako alternatywę.
- **Plik binarny / wygenerowany / lockfile** → jedno zdanie („zmiana wygenerowana / lockfile, nic do czytania") i traktuj jak zaakceptowany, żeby nie marnować tury — chyba że użytkownik dopyta.

## Zasady

- Jeden plik na odpowiedź. Nigdy nie zrzucaj kilku plików naraz ani numerowanej listy „omów wszystkie" — to niszczy sens komendy.
- Pisz po polsku, krótko, po ludzku; żargon nazwany i objaśniony w nawiasie przy 1. użyciu.
- Edukuj na poziomie JS/TS-specyfiki, nie ogólnego CS (audytorium to senior z innych języków).
- Nie przechodź dalej bez `OK`. Pytanie ≠ akceptacja.
- Nie implementuj i nie zmieniaj kodu — to komenda do czytania i nauki.
