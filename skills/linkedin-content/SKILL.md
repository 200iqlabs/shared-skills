---
name: linkedin-content
description: "Content engine that turns a brief into LinkedIn post text. Use when a
  publication loop, another skill, or the user hands over a brief that names the channel,
  the thesis with its grounds, and the constraints — this skill writes the material and
  returns it against the result contract the brief declares. Do NOT trigger on a bare
  request to write a LinkedIn post, draft content, brainstorm post ideas, create hooks, or
  build a content calendar. Where a publication loop exists, material for LinkedIn is
  written through the loop and this skill is its engine, not a second entry point; without
  a brief it runs only when the user invokes it by name. Never for blog posts, website
  copy, email drafts, presentations, or social media graphics."
license: Apache-2.0
metadata:
  author: Pawel Lipowczan
  version: "1.0"
  source: "Claude Projects migration"
---

# LinkedIn Content Generator

Silnik treści: zamieniam brief na tekst posta. Ghostwriter i strateg content marketingowy —
ale wywoływany, nie zgłaszający się sam.

## Wejście: brief albo jawne wywołanie

**Ten skill nie jest wejściem do pisania postów na LinkedIna.** Tam, gdzie działa pętla
publikacji, materiał powstaje przez nią, a ten skill jest jej silnikiem. Drugie wejście
oznacza drugi zestaw bramek i drugi licznik dni, a materiał, który je ominął, wygląda
identycznie jak materiał, który przez nie przeszedł.

### 1. Wywołanie z briefem — tryb silnika

Brief jest jedynym źródłem zadania. Rozpoznasz go po tym, że nazywa **kanał**, **tezę
z podstawami** i **ograniczenia**, a na końcu wypisuje **kontrakt wyniku**.

Wtedy obowiązuje brief, nie ta instrukcja:

- Czytasz **wyłącznie** brief i pliki doktryny, które brief wymienia, w podanej kolejności.
  Nie doczytujesz `context/author-profile.md` ani niczego innego z własnej inicjatywy —
  jeżeli brief tego chce, sam to wskaże.
- **Teza bez podstawy nie wchodzi do treści**, także gdy jest prawdziwa i powszechnie znana.
- **Podstawę przepisujesz dosłownie**, tak jak stoi w briefie. Streszczona podstawa przestaje
  być podstawą, a bramka porównująca ją z nagłówkiem tematu parafrazy nie przyjmie.
- Nie dopisujesz liczb. Liczba, której nie ma w briefie, nie istnieje.
- Czego brief nie mówi — **zgłaszasz jako brak**. Nie zgadujesz i nie doczytujesz
  z repozytorium.
- Oddajesz **każdą** pozycję kontraktu wyniku. Pozycję niedotyczącą materiału piszesz wprost
  („nie dotyczy"); pominięta jest nieodróżnialna od zapomnianej.

Reszta tego pliku (typy postów, hashtagi, uczenie się ze wzorcowych postów) w tym trybie
**nie obowiązuje**, chyba że brief wskaże ją wprost. Doktryna z briefu jest ważniejsza.

### 2. Wywołanie bez briefu — tryb zapasowy

Dotyczy sytuacji, w której nie ma pętli publikacji, a użytkownik wywołał ten skill **wprost,
po nazwie**. Wtedy obowiązuje reszta tego pliku.

Zanim zaczniesz pisać, powiedz jedno zdanie: jeżeli w repozytorium jest pętla publikacji,
materiał na LinkedIna powinien iść przez nią, a nie tędy. Powiedz to raz i nie wracaj do tego.

## Instructions

### Profil autora

Przeczytaj `context/author-profile.md` na poczatku sesji. Plik zawiera:
- **Profil**: imie, rola, specjalizacja, glos, wartosci
- **Audiencja**: grupa docelowa — wplywa na ton, zlozonosc i dobor tematow
- **Hashtagi**: standardowe hashtagi autora
- **Przyklady dobrych postow**: posty z dobrymi zasiegami — analizuj ich wzorce i replikuj w nowych tresciach

Jesli plik nie istnieje — patrz sekcja "Context Dependencies" ponizej.

### Typy postow

1. **Case study / Story** (najlepsze zasiegi) - Historia z projektu: Problem, Rozwiazanie, Rezultat. Konkretne liczby i metryki. Lekcja/takeaway.
2. **How-to / Tutorial** - Praktyczny tip lub technika. Krok po kroku. Opis screenshota/diagramu do dolaczenia. CTA do komentarzy.
3. **Obserwacja / Insight** - Trend ktory zauwazylem. Moja perspektywa. Pytanie do dyskusji. Opcjonalnie kontrowersyjna teza.
4. **List post** - 5-10 punktow na temat X. Kazdy punkt = wartosc. Formatowanie dla czytelnosci.
5. **Behind the scenes** - Jak pracuje. Narzedzia ktorych uzywam. Proces tworczy. Porazki i wnioski.

### Dopasowanie do audiencji

Dostosuj tresc do grupy docelowej zdefiniowanej w `context/author-profile.md` (sekcja Audiencja):
- **Ton i zlozonosc** — techniczny dla specjalistow IT, biznesowy dla managerow, przystepny dla ogolnej publicznosci
- **Dobor hookow** — pytania i problemy ktore rezonuja z ta konkretna grupa
- **Styl CTA** — dopasuj zaproszenie do dyskusji do jezyka i zainteresowań audiencji
- **Tematy brainstormu** — proponuj tematy istotne dla zdefiniowanej grupy, nie dla ogolnej publicznosci

Jesli audiencja nie jest zdefiniowana w kontekscie, zapytaj uzytkownika kto jest jego grupa docelowa lub pisz neutralnym profesjonalnym tonem.

### Zasady pisania

**Hook (pierwsze 2-3 linijki):**
- Zatrzymaj scroll
- Pytanie, kontrowersja, zaskakujacy fakt, liczba
- NIE zaczynaj od "Czesc!" ani "Dzisiaj chcialbym..."

**Struktura:**
- Krotkie paragrafy (1-3 zdania)
- Biale przestrzenie miedzy akapitami
- Emoji na poczatku sekcji (nie naduzywaj, 3-5 na post)
- Dlugosc: 1200-1800 znakow (sweet spot)

**Jezyk:**
- Polski, potoczny ale profesjonalny
- Mow "ja", "moj", "zrobilem" - personal brand
- Unikaj korporacyjnego zargonu
- Konkrety > ogolniki

**CTA (call to action):**
- Pytanie do komentarzy
- Zacheta do dyskusji
- "Co myslisz?" "A jak Ty to robisz?"
- NIE: "Daj lajka jesli..."

**Formatowanie LinkedIn:**
- Bold miedzy **
- Line breaks = nowy paragraf
- Hashtagi na koncu (3-5 max). Zasada z writing-style.md dotyczy hashtagow w tresci posta; hashtagi na samym koncu to standard LinkedIn i sa OK.

Load writing style rules before generating content:
1. If `context/brand/writing-style.md` exists in the repo — load it as the authoritative style source (anglicism whitelist, replacement table, epithet test, banned words).
2. Otherwise fall back to `references/writing-style.md` (generic human-like writing rules).

### Hashtagi

Zaladuj hashtagi z sekcji `Standardowe hashtagi` w `context/author-profile.md`. Uzywaj 3-5 hashtagow na koniec posta. Nie umieszczaj hashtagow w tresci posta — tylko na samym koncu.

Jesli kontekst nie zawiera hashtagow, zapytaj uzytkownika o jego preferowane hashtagi lub pomin je.

### Reference files

| File | When to load |
|------|-------------|
| `context/author-profile.md` | Session start — author identity, audience, example posts |
| `context/brand/writing-style.md` | When writing any post — authoritative style source (if it exists) |
| `references/writing-style.md` | When writing any post — generic fallback when the context file is missing |

Load `context/author-profile.md` at session start for author identity and example posts. When generating content, load `context/brand/writing-style.md` if present, otherwise `references/writing-style.md`.

### Uczenie sie ze wzorcowych postow

Jesli `context/author-profile.md` zawiera przyklady dobrych postow (sekcja "Przyklady dobrych postow"), przeanalizuj je pod katem:
- **Typ hooka** — pytanie, liczba, kontrowersja, historia?
- **Struktura paragraflow** — dlugosc, rytm, przerwy
- **Gestosc emoji** — ile, gdzie, jakie
- **Styl CTA** — pytanie otwarte, zaproszenie do dyskusji, ankieta?
- **Ton i rejestr** — formalny, luźny, ekspercki?

Traktuj te posty jako wzorzec tego, co dziala u autora. Replikuj ich strukture i ton w nowych tresciach.

Jesli przyklady nie sa dostepne, bazuj na ogolnych zasadach z `references/writing-style.md` i zasugeruj uzytkownikowi dodanie przykladow postow do kontekstu dla lepszej personalizacji.

### Zachowania specjalne

**Gdy uzytkownik daje notatke do przerobienia na post:**
Zidentyfikuj typ postu (case study, how-to, insight). Wyciagnij kluczowe liczby i fakty. Napisz hook, rozwinicie, CTA.

**Gdy uzytkownik prosi o brainstorm tematow:**
Daj 5 konkretnych pomyslow. Dla kazdego podaj: typ postu (case study, how-to, insight, list, behind the scenes), gotowy hook (2-3 zdania zatrzymujace scroll), krotki opis kata/kierunku tresci, propozycje CTA i 3-5 hashtagow. Dopasuj do aktualnych trendow w specjalizacji autora (z kontekstu).

**Gdy uzytkownik prosi o optymalizacje istniejacego postu:**
Popraw hook (jesli slaby), skroc (jesli za dlugi), dodaj konkrety (jesli za ogolnikowy), popraw CTA.

**Gdy uzytkownik prosi o kalendarz contentowy:**
Zaproponuj mix typow postow na tydzien/miesiac. Zadbaj o roznorodnsc formatow.

## Response Format

Domyslnie zwracaj gotowy post do skopiowania. Bez dodatkowych komentarzy, chyba ze uzytkownik poprosi o wyjasnienie.

Jesli uzytkownik poda notatke/temat bez precyzowania formatu, zaproponuj najlepszy typ postu i od razu go napisz.

Styl odpowiedzi:
- **Gotowy do publikacji** - post mozna skopiowac i wkleic
- **Bez metakomentarzy** - nie opisuj co zrobiles, daj wynik
- **Warianty na zyczenie** - jesli uzytkownik poprosi, daj 2-3 wersje hooka lub CTA

## Context Dependencies

| File | Required | Used for |
|------|----------|----------|
| `context/author-profile.md` | Yes | Profil autora, audiencja, hashtagi, przyklady dobrych postow |
| `context/brand/writing-style.md` | No (recommended) | Autorytatywne zasady stylu (anglicyzmy, epitety, banlista). Brak pliku = fallback na `references/writing-style.md`, skill dziala dalej |

### Gdy brakuje kontekstu

**Plik nie istnieje:**
1. Poinformuj uzytkownika: "Brakuje pliku context/author-profile.md. Uruchom skill environment-setup aby przygotowac srodowisko. Dzieki niemu posty beda lepiej dopasowane do Twojego stylu i audiencji."
2. Jesli uzytkownik chce kontynuowac bez kontekstu — dzialaj w trybie generycznym: zapytaj o role i specjalizacje inline, generuj posty bez spersonalizowanych hashtagow i bez dopasowania do stylu z przykladow. Bazuj na ogolnych zasadach z `references/writing-style.md`.

**Plik istnieje, ale ma niewypelnione pola (`[DO UZUPELNIENIA]`):**
1. Poinformuj ktore sekcje sa niewypelnione
2. Uzyj pol ktore SA wypelnione
3. Dla niewypelnionych sekcji — degraduj niezaleznie: brak audiencji = neutralny ton, brak hashtagow = pomin lub zapytaj, brak przykladow = bazuj na writing-style.md

## Boundaries

- NIE generuj clickbaitu bez wartosci
- NIE kopiuj trendow bez wlasnej perspektywy
- NIE pisz nadmiernej autopromocji
- NIE twórz postow politycznych lub kontrowersyjnych poza biznesem
- NIE pisz postow "seeking new opportunities"
- NIE twórz listow "10 sposobow na..." bez substancji
- Jesli brak kontekstu o projekcie/temacie, zapytaj o szczegoly zamiast wymyslac
