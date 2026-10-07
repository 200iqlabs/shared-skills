# Context — dane uzytkownika

Pliki kontekstowe specyficzne dla Twojej organizacji sa uzywane przez skille do personalizacji porad i rekomendacji. Dane firmy leza w `company/` (w korzeniu repozytorium, w ktorym pracujesz), pozostale pliki w tym katalogu (`context/`); szablony do wszystkich plikow leza tutaj, w `context/templates/`.

## Jak skonfigurowac

**Opcja 1 (zalecana):** Uruchom skill `environment-setup` — przeprowadzi Cie krok po kroku przez tworzenie wszystkich plikow kontekstowych.

**Opcja 2 (reczna):** Skopiuj szablony z `context/templates/` i uzupelnij dane:
```bash
mkdir -p company/data
cp context/templates/company.template.md company/data/company.md
# Edytuj company/data/company.md — zamien [DO UZUPELNIENIA] na swoje dane
```

Szablon `legal-entities` kopiuj tak samo do `company/data/`; pozostale szablony do `context/` (np. `cp context/templates/finances.template.md context/finances.md`).

## Dostepne typy kontekstu

| Plik | Uzywany przez | Zawartosc |
|------|---------------|-----------|
| `company/data/company.md` | legal, tax-advisor, cfo | Dane firmy, forma prawna, struktura zespolu |
| `company/data/legal-entities.md` | legal, tax-advisor | Podmioty prawne, relacje, backlog dokumentow |
| `context/consultant-profile.md` | business-consultant | Filozofia konsultingowa, doswiadczenie, podejscie |
| `context/projects-portfolio.md` | business-consultant | Zrealizowane projekty, case studies, wzorce architektoniczne |
| `context/author-profile.md` | linkedin-content | Persona autora, audiencja, przyklady postow |
| `context/finances.md` | cfo | Budzet, cele finansowe, struktura kosztow |
| `context/process-mapping.md` | process-mapping | Konfiguracja mapowania procesow |
| `company/brand/writing-style.md` (opcjonalny, bez szablonu) | linkedin-content | Autorytatywne zasady stylu; bez niego skill uzywa `references/writing-style.md` |
| `company/brand/brand-design.md`, `company/brand/tone-of-voice.md` (opcjonalne, bez szablonow) | `/ss:slides:init` | Kolory i typografia, ton komunikacji dla katalogu `slides/` |

## Wazne

- Dane firmy zmienily miejsce: `company.md` i `legal-entities.md` lezaly w `context/`, teraz leza w `company/data/`, a pliki marki w `company/brand/`. Skille czytaja tylko nowe sciezki i nie szukaja plikow w starych (brak sciezki zapasowej) — stare pliki przenies recznie wedlug tabeli wyzej
- W tym repozytorium (praca na forku shared-skills) `.gitignore` obejmuje `context/*.md` (poza README.md), `company/data/*.md` i `company/brand/` — Twoje dane nie trafia do repozytorium. Gdy uzywasz shared-skills jako wtyczki w wlasnym repozytorium, ten `.gitignore` u Ciebie nie dziala: o tym, czy `company/` i `context/` sa sledzone przez git, decydujesz sam
- Szablony w `context/templates/` sa dystrybuowane z repozytorium
- Nie usuwaj tego pliku README.md — jest sledzony przez git
