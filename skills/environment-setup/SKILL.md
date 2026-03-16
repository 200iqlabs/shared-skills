---
name: environment-setup
description: "Guided setup wizard for configuring the shared-skills environment. Use
  when: the user wants to set up their environment, configure context files, prepare
  the system for first use, or is missing context files that other skills need.
  Trigger on: 'set up environment', 'configure context', 'prepare environment',
  'missing context files', 'environment setup', 'skonfiguruj srodowisko',
  'przygotuj kontekst', 'brakuje pliku context/', 'jak zaczac',
  'pierwsza konfiguracja', 'onboarding'. Also trigger when another skill reports
  missing context files and suggests running environment-setup."
license: Apache-2.0
metadata:
  author: 200IQ Labs
  version: "1.0"
---

# Environment Setup — Kreator srodowiska

Skill prowadzacy przez konfiguracje plikow kontekstowych wymaganych przez pozostale skille w shared-skills.

## Instructions

### Workflow

#### 1. Audyt istniejacych plikow kontekstowych

Na poczatku sprawdz, ktore pliki kontekstowe juz istnieja:

```
context/company.md
context/consultant-profile.md
context/projects-portfolio.md
context/author-profile.md
context/finances.md
context/legal-entities.md
```

Dla kazdego pliku okresl status:
- **Istnieje** — plik jest na miejscu
- **Brakuje** — plik nie istnieje, do utworzenia

Przedstaw wynik audytu w tabeli:

| Plik | Status | Uzywany przez |
|------|--------|---------------|
| `context/company.md` | [status] | legal, tax-advisor, cfo |
| `context/consultant-profile.md` | [status] | business-consultant |
| `context/projects-portfolio.md` | [status] | business-consultant |
| `context/author-profile.md` | [status] | linkedin-content |
| `context/finances.md` | [status] | cfo |
| `context/legal-entities.md` | [status] | legal, tax-advisor |

#### 2. Guided creation — tworzenie brakujacych plikow

Dla kazdego brakujacego pliku:

1. Zapytaj uzytkownika czy chce go teraz utworzyc (moze pominac opcjonalne)
2. Przeczytaj odpowiedni szablon z `context/templates/`
3. Zadaj celowane pytania dla kazdej sekcji szablonu
4. Zapisz uzupelniony plik do `context/`
5. Potwierdz utworzenie

**Kolejnosc tworzenia** (od najczesciej uzywanych):
1. `company.md` — podstawowe dane firmy
2. `legal-entities.md` — podmioty prawne (legal, tax-advisor)
3. `finances.md` — dane finansowe (cfo)
4. `consultant-profile.md` — profil konsultanta (business-consultant)
5. `projects-portfolio.md` — portfolio projektow (business-consultant)
6. `author-profile.md` — profil autora LinkedIn (linkedin-content)

**Wazne:** Uzytkownik moze pominac dowolny plik. Nie blokuj procesu.

#### 3. Podsumowanie

Po zakonczeniu pokaz:

| Plik | Status | Skille gotowe do uzycia |
|------|--------|------------------------|
| ... | Utworzony / Pominiety / Juz istnial | ... |

Jesli wszystkie wymagane pliki sa na miejscu:
> "Srodowisko jest skonfigurowane. Wszystkie skille sa gotowe do uzycia."

Jesli niektore pliki pominieto:
> "Ponizsze skille beda dzialac z ograniczona funkcjonalnoscia: [lista]. Mozesz wrocic do konfiguracji w dowolnym momencie."

### Zasady

- **Nie twórz fikcyjnych danych** — jesli uzytkownik nie zna odpowiedzi, zostaw `[DO UZUPELNIENIA]`
- **Nie pytaj o dane wrazliwe** (NIP, PESEL, numery kont) — zostaw jako `[DO UZUPELNIENIA]`
- **Jedno pytanie na raz** — nie zalewaj uzytkownika lista pytan
- **Szanuj istniejace pliki** — nie nadpisuj plikow ktore juz istnieja, chyba ze uzytkownik wprost poprosi

## Boundaries

- Ten skill TYLKO konfiguruje pliki kontekstowe — nie uruchamia innych skilli
- Nie modyfikuje plikow w `references/` ani `SKILL.md`
- Nie konfiguruje integracji API (klucze API, .env) — to osobny proces
