---
name: prepare-goal
description: "Przygotowuje gotowy tekst completion condition dla komendy /goal w Claude Code (v2.1.139+).
  Bierze luźny opis zadania i produkuje sformułowanie, które ewaluator (mały model) potrafi sprawdzić
  z samego transkryptu rozmowy. Triggeruje WYŁĄCZNIE na komendę /prepare-goal — nie auto-triggeruj
  na keywords typu 'goal', 'cel sesji', 'cel zadania'. Używaj gdy user pisze /prepare-goal <opis>
  lub /prepare-goal i chce sformułować warunek zakończenia dla autonomicznej pętli /goal."
license: Apache-2.0
---

# /prepare-goal — Formułowanie completion condition dla /goal

Produkuje gotowy tekst do wklejenia po `/goal ...` w Claude Code. Wymusza strukturę, której
ewaluator (mały model, np. Haiku) potrafi ocenić wyłącznie z transkryptu — bo ewaluator
**nie uruchamia narzędzi**, ocenia tylko to, co Claude już napisał w rozmowie.

## Invocation

```
/prepare-goal <luźny opis zadania>
/prepare-goal                          → poproś usera o opis
```

## Co to jest /goal (kontekst)

`/goal <condition>` w Claude Code uruchamia autonomiczną pętlę: po każdej turze mały model
sprawdza, czy condition jest spełniony. Jeśli nie — Claude robi kolejną turę. Jeśli tak —
goal się czyści. Max 4000 znaków. Działa też w trybie headless: `claude -p "/goal ..."`.

Dobry condition musi być sprawdzalny **z transkryptu**. Ewaluator nie czyta plików ani
nie odpala testów — patrzy tylko na to, co Claude napisał w odpowiedziach.

## Anatomia dobrego goal (4 elementy — wszystkie obowiązkowe)

1. **End state** — jeden mierzalny stan końcowy (test exit code, plik istnieje, lista pusta,
   licznik = N). Nie "kod jest lepszy", nie "research jest kompletny".
2. **Proof in transcript** — jak Claude udowodni, że to się stało, w swojej wiadomości.
   Przykłady: "wkleja output `npm test` z `exits 0`", "wkleja `git status` pokazujący clean",
   "wymienia ścieżki utworzonych plików", "podaje listę URL-i z metadanymi".
3. **Constraints** — co NIE może się zmienić po drodze (inne testy, inne pliki, scope).
   Pomijaj jeśli naprawdę nie ma ograniczeń — ale zwykle są.
4. **Turn/time bound** — `or stop after N turns`. Bez tego goal może lecieć w nieskończoność.
   Domyślnie 15 tur dla małych zadań, 30 dla średnich, 50 dla dużych.

## Workflow

### Krok 1: Sparsuj opis usera

Zidentyfikuj typ zadania: kod / content / research / ingest / inne. Wyciągnij z opisu:
- co ma powstać/się zmienić (kandydat na end state)
- jak to można potwierdzić (kandydat na proof)
- co jest poza zakresem (kandydat na constraints)

### Krok 2: Audyt — czy brakuje czegoś krytycznego

Jeśli brakuje **mierzalności** lub **sposobu weryfikacji**, zadaj jedno-dwa precyzyjne pytania
ZANIM wygenerujesz tekst. Przykłady braków:

| Sygnał w opisie | Pytanie do usera |
|---|---|
| "popraw kod" bez wskazania czego | "Co konkretnie ma być spełnione na końcu — testy przechodzą? lint clean? jakaś konkretna funkcja działa?" |
| "research o X" bez liczby/struktury | "Ile źródeł? Jakie pola na każde źródło (URL, data, autor, kluczowa teza)?" |
| "napisz post" bez kryteriów | "Jakiej długości? Jakie elementy muszą być (hook, CTA, dane)? Gdzie zapisać?" |
| "przeprocesuj inbox" bez liczby plików | "Ile plików jest w inbox? Czy każdy musi trafić do archive/ + catalog.md update?" |

Nie pytaj o constraints — jeśli user nie wspomni, dodaj rozsądny default ("no other files modified").

### Krok 3: Wygeneruj output

Pokaż usera **gotową komendę** do skopiowania w bloku kodu, oraz krótkie wyjaśnienie wyborów
(co jest end state, jak ewaluator to sprawdzi, jaki bound). Format:

````
```
/goal <condition tekst>
```

**Co ewaluator sprawdza w transkrypcie:** <1-2 zdania>
**Bound:** <N tur — uzasadnienie>
````

Jeśli zadanie jest naprawdę duże, zasugeruj rozbicie na 2-3 sekwencyjne /goale zamiast jednego.

## Przykłady (przed/po)

### Przykład 1 — kod

**User:** `/prepare-goal popraw testy w module auth, są jakieś padające`

**Brak:** nie wiadomo które testy, ani jak Claude potwierdzi. Pytanie:
> Które konkretnie testy mają zielono? Cały `test/auth/`, czy konkretne pliki? I czy lint też musi być clean?

**Załóżmy:** "cały `test/auth/`, lint clean, nie ruszać innych testów".

**Output:**
```
/goal all tests in test/auth pass with exit code 0 and npm run lint exits 0; you prove this by pasting the final lines of the test output showing the pass count and the lint command output in your last message; no test file outside test/auth is modified (git status confirms this); or stop after 25 turns
```

### Przykład 2 — research

**User:** `/prepare-goal zrób research o 5 firmach z branży proptech w PL`

**Brak:** jakie pola na firmę, gdzie zapisać.

**Pytanie:** Jakie pola dla każdej firmy (nazwa, URL, opis, fundatorzy, runda)? Zapis do pojedynczego MD czy 5 plików?

**Załóżmy:** "1 plik `research/proptech-pl.md`, pola: nazwa, URL, opis 2-3 zdania, fundatorzy, ostatnia runda".

**Output:**
```
/goal the file research/proptech-pl.md exists and contains entries for exactly 5 distinct Polish proptech companies; each entry has all of: company name (H2), URL, 2-3 sentence description, founders, last funding round (or "unknown" with note); you prove completion by listing the 5 company names in your last message and confirming the file path was written; no other files in research/ are modified; or stop after 20 turns
```

### Przykład 3 — ingest

**User:** `/prepare-goal przetwórz inbox klienta TTTR, są tam 3 transkrypcje`

**Brak:** nic kluczowego.

**Output:**
```
/goal every file currently in context/plsoft/clients/TTTR/inbox/ has been processed via /ingest workflow: moved to archive/ with date prefix, knowledge files in TTTR/<project>/data/ updated or created, and TTTR/catalog.md plus clients/_index.md reflect the changes; you prove this by listing each processed filename with its archive destination and the catalog entry added; no client folder other than TTTR is touched; or stop after 15 turns
```

## Anti-wzorce (czego nie pisać)

- ❌ "kod jest lepszy", "research kompletny", "post dobrze napisany" — niemierzalne
- ❌ "Claude przeczyta plik X i sprawdzi" — ewaluator nie czyta plików
- ❌ Brak bound — może lecieć w nieskończoność
- ❌ Wiele różnych end states w jednym goal — rozbij na sekwencję
- ❌ Condition > 4000 znaków — przekrocz limit, nie zadziała

## Edge cases

- **User podaje 2+ niezależne cele:** zaproponuj rozbicie na sekwencję `/goal A` → po wykonaniu → `/goal B`. Nie sklejaj.
- **Zadanie wymaga uruchomienia komendy (testy, build):** zaznacz wprost w condition że Claude ma wkleić output komendy do wiadomości — inaczej ewaluator nie zobaczy wyniku.
- **Zadanie czysto kreatywne (pisanie postu, brainstorm):** end state = "plik X istnieje i ma ≥N słów" lub "lista N pomysłów w ostatniej wiadomości". Nie próbuj mierzyć jakości.
- **Headless (`claude -p`):** ten sam format działa, dodaj w wyjaśnieniu że można odpalić w terminalu.

## Format odpowiedzi (zawsze ten sam)

1. (Opcjonalnie) 1-2 pytania o brakujące elementy
2. Blok z gotową komendą `/goal ...`
3. 2-3 linijki: co ewaluator sprawdza + dlaczego taki bound
4. (Jeśli stosowne) propozycja rozbicia na sekwencję

Bez długich wstępów. Bez powtarzania opisu usera.
