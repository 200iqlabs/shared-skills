# Workflow: Generowanie dokumentów (/draft)

## Kiedy używać
Użytkownik chce wygenerować dokument prawny: umowę, regulamin, pismo, politykę, NDA, OWU, lub inny dokument formalny.

## Format wyjściowy
Zapisz draft jako **osobny plik .md** (np. `nda-draft.md`, `umowa-b2b-draft.md`). W odpowiedzi konwersacyjnej podaj krótkie podsumowanie: co zawiera draft, oznaczenia ryzyka per-sekcja, i co użytkownik powinien zweryfikować. Nie wklejaj treści dokumentu inline w odpowiedzi.

## Krok 1: Zbieranie wymagań

Zapytaj o następujące informacje (w jednym pytaniu, nie rozbijaj na wiele tur):

1. **Typ dokumentu** — umowa B2B, NDA, umowa o przeniesienie IP, polityka prywatności, itp.
2. **Strony dokumentu** — opisz role (np. "zleceniodawca" i "zleceniobiorca"), NIE proś o dane identyfikacyjne
3. **Przedmiot** — co dokument reguluje (np. "świadczenie usług programistycznych")
4. **Kluczowe warunki** — czas trwania, zakres, odpowiedzialność, kary, wypowiedzenie
5. **Specjalne wymagania** — np. klauzula arbitrażowa, prawo właściwe, język dokumentu

Zasady zbierania:
- NIE proś o dane wrażliwe (NIP, PESEL, adresy, kwoty) — te zawsze oznaczaj jako [DO UZUPEŁNIENIA]
- Jeśli użytkownik podaje dane wrażliwe spontanicznie — poinformuj, że nie umieścisz ich w dokumencie i zastosujesz oznaczenia
- Możesz zaproponować typowe warunki dla danego typu dokumentu jeśli użytkownik nie wie

## Krok 2: Generowanie draftu

Struktura typowego dokumentu prawnego:

```
[TYTUŁ DOKUMENTU]

zawarta w dniu [DO UZUPEŁNIENIA: data] w [DO UZUPEŁNIENIA: miejscowość]

pomiędzy:

[DO UZUPEŁNIENIA: pełna nazwa pierwszej strony], z siedzibą w [DO UZUPEŁNIENIA: adres],
wpisaną do [DO UZUPEŁNIENIA: rejestr], NIP: [DO UZUPEŁNIENIA: NIP],
reprezentowaną przez [DO UZUPEŁNIENIA: imię i nazwisko, stanowisko],
zwaną dalej „[Rolą]"

a

[DO UZUPEŁNIENIA: pełna nazwa drugiej strony], ...
zwaną dalej „[Rolą]"

§ 1 Przedmiot umowy
§ 2 Zakres obowiązków
§ 3 Wynagrodzenie
§ 4 Prawa autorskie / IP (jeśli dotyczy)
§ 5 Poufność
§ 6 Odpowiedzialność
§ 7 Czas trwania i rozwiązanie
§ 8 Postanowienia końcowe
```

Zasady generowania:
- Profesjonalny język prawniczy
- Wszystkie dane identyfikacyjne i kwoty jako [DO UZUPEŁNIENIA: opis]
- Numeracja paragrafów (§) i ustępów
- Klauzule standardowe: poufność, rozstrzyganie sporów, zmiany umowy, klauzula salwatoryjna
- Prawo polskie jako domyślne prawo właściwe (chyba że ustalono inaczej)

## Krok 3: Iteracja

Po wygenerowaniu draftu:
- Przedstaw dokument użytkownikowi
- Zapytaj czy chce zmiany (dodanie/usunięcie klauzul, zmiana warunków)
- Wdrażaj zmiany iteracyjnie
- Przy każdej wersji wskaż co się zmieniło

## Krok 4: Finalizacja

Oznacz dokument sygnalizacją:
- 🟢 Gotowe do użycia — proste dokumenty wewnętrzne (regulaminy, procedury)
- 🟡 Rekomendowana weryfikacja prawnika — umowy z kontrahentami, NDA, OWU
- 🔴 Wymagana weryfikacja prawnika — umowy o dużej wartości, founders agreement, zmiany statutu, umowy z inwestorami

## Typowe dokumenty — wskazówki

### NDA (umowa o zachowaniu poufności)
- Dwustronna vs jednostronna — zapytaj
- Czas obowiązywania poufności (zwykle 2-5 lat)
- Definicja informacji poufnych — szeroka ale precyzyjna
- Wyjątki od poufności (informacje publiczne, niezależnie uzyskane)
- Kary umowne za naruszenie

### Umowa B2B (świadczenie usług)
- Zakres usług — precyzyjny opis lub odniesienie do załącznika/zamówienia
- Wynagrodzenie — fixed, T&M, retainer
- Prawa autorskie — przeniesienie vs licencja, pola eksploatacji
- SLA jeśli dotyczy
- Odpowiedzialność — ograniczenie do wartości umowy jest standardem

### Founders Agreement
- 🔴 Zawsze wymaga weryfikacji prawnika
- Vesting schedule — cliff + linear vesting
- Podział ról i odpowiedzialności
- Mechanizmy wyjścia (good leaver / bad leaver)
- IP assignment — cały dotychczasowy wkład
- Non-compete i non-solicit
- Podejmowanie decyzji, deadlock resolution
