---
name: environment-setup
description: "Guided setup wizard for configuring the shared-skills environment. Use
  when: the user wants to set up their environment, configure context files, prepare
  the system for first use, or is missing context files that other skills need.
  Trigger on: 'set up environment', 'configure context', 'prepare environment',
  'missing context files', 'environment setup', 'skonfiguruj srodowisko',
  'przygotuj kontekst', 'brakuje pliku context/', 'brakuje pliku company/',
  'jak zaczac', 'pierwsza konfiguracja', 'onboarding'. Also trigger when another skill reports
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

Dane firmy (`company.md`, `legal-entities.md`) leza w `company/data/`, pozostale pliki kontekstowe w `context/`. Na poczatku sprawdz, ktore z nich juz istnieja:

```
company/data/company.md
context/consultant-profile.md
context/projects-portfolio.md
context/author-profile.md
context/finances.md
company/data/legal-entities.md
context/process-mapping.md
```

Dla kazdego pliku okresl status:
- **Istnieje** — plik jest na miejscu
- **Brakuje** — plik nie istnieje, do utworzenia

Przedstaw wynik audytu w tabeli:

| Plik | Status | Uzywany przez |
|------|--------|---------------|
| `company/data/company.md` | [status] | legal, tax-advisor, cfo |
| `context/consultant-profile.md` | [status] | business-consultant |
| `context/projects-portfolio.md` | [status] | business-consultant |
| `context/author-profile.md` | [status] | linkedin-content |
| `context/finances.md` | [status] | cfo |
| `company/data/legal-entities.md` | [status] | legal, tax-advisor |
| `context/process-mapping.md` | [status] | process-mapping |

Opcjonalne pliki marki — `company/brand/writing-style.md` (linkedin-content), `company/brand/brand-design.md` i `company/brand/tone-of-voice.md` (`/ss:slides:init`) — nie maja szablonow i nie sa tworzone przez ten skill; skille czytaja je, gdy uzytkownik sam je zalozyl. Jesli istnieja, odnotuj to w audycie, jesli nie — nie licz ich jako brakujacych.

#### 2. Guided creation — tworzenie brakujacych plikow

Dla kazdego brakujacego pliku:

1. Zapytaj uzytkownika czy chce go teraz utworzyc (moze pominac opcjonalne)
2. Przeczytaj odpowiedni szablon z `context/templates/<nazwa>.template.md` (katalog szablonow jest dostarczany razem z shared-skills i zostaje tam, gdzie jest — zmienia sie tylko miejsce zapisu gotowego pliku)
3. Zadaj celowane pytania dla kazdej sekcji szablonu
4. Zapisz uzupelniony plik pod sciezka z listy ponizej: dane firmy do `company/data/`, pozostale pliki do `context/` (jesli katalog docelowy nie istnieje, utworz go)
5. Potwierdz utworzenie

**Kolejnosc tworzenia** (od najczesciej uzywanych; pelna sciezka to miejsce zapisu, szablon ma te sama nazwe z dopiskiem `.template`):
1. `company/data/company.md` — podstawowe dane firmy
2. `company/data/legal-entities.md` — podmioty prawne (legal, tax-advisor)
3. `context/finances.md` — dane finansowe (cfo)
4. `context/consultant-profile.md` — profil konsultanta (business-consultant)
5. `context/projects-portfolio.md` — portfolio projektow (business-consultant)
6. `context/author-profile.md` — profil autora LinkedIn (linkedin-content)
7. `context/process-mapping.md` — konfiguracja mapowania procesow (process-mapping)

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
- **Nie zmieniaj `.gitignore` sam** — poza forkiem shared-skills pliki w `company/` nie sa domyslnie wylaczone z gita; jesli uzytkownik nie chce, zeby dane firmy w nim byly, zaproponuj dopisanie `company/data/` i `company/brand/` i zrob to dopiero po jego zgodzie

## Boundaries

- Ten skill TYLKO konfiguruje pliki kontekstowe — nie uruchamia innych skilli
- Nie modyfikuje plikow w `references/` ani `SKILL.md`
- Nie konfiguruje integracji API (klucze API, .env) — to osobny proces
