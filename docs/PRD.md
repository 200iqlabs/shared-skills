# PRD: PLSoft Multi-Agent System

**Wersja:** 1.3
**Data:** 2026-03-07
**Autor:** Paweł Lipowczan
**Status:** DRAFT

> **Rebrand note (2026-04-17):** Wszystkie wzmianki "Shorts Lab" w tym
> dokumencie są historyczne. Po rebrandzie: firma = **200IQ LABS** (PSA),
> produkt = **Qamera AI** (qamera.ai). Treść PRD pozostaje bez zmian dla
> zachowania kontekstu historycznego.

**Changelog:**
- v1.3: Renamed repos (shared-skills, agentic-ai-system, agentic-ai-private), GitHub org 200iqlabs
- v1.2: Alignment z Agent Skills spec (agentskills.io), skill-creator jako narzędzie budowy agentów, plugin marketplace jako kanał dystrybucji
- v1.1: Odpowiedzi na otwarte pytania, OpenSpec zamiast PIV, dodanie agentów Coach The Five i LinkedIn Content
- v1.0: Inicjalny draft

---

## 1. Podsumowanie wykonawcze

### 1.1 Cel projektu
Zbudowanie modularnego systemu wieloagentowego opartego o Claude Code + Git, zgodnego ze standardem Agent Skills (agentskills.io), który zapewni spójne wsparcie decyzyjne w codziennej pracy — od finansów przez prawo po marketing — z separacją kontekstów między działalnością osobistą (PLSoft) a spółką (200IQ LABS PSA).

### 1.2 Problem
Obecnie wiedza i kontekst biznesowy są rozproszone między wieloma Claude Projects, promptami w Obsidian, i ad-hoc konwersacjami. Przełączanie między kontekstami (spółka vs JDG vs prywatne) jest manualne i podatne na wyciek informacji. Brak orkiestracji — nie da się w jednej sesji poprosić o analizę finansową z uwzględnieniem implikacji podatkowych. System nie jest przenośny ani skalowalny na inne firmy.

### 1.3 Rozwiązanie
Trzy repozytoria Git z współdzieloną biblioteką agentów (skills) jako git submodule. Każdy agent to SKILL.md zgodny ze standardem Agent Skills + dedykowane skrypty narzędziowe (lekkie CLI scripts zamiast ciężkich MCP serwerów). Agenci budowani iteracyjnie przy pomocy oficjalnego `skill-creator`. Orkiestracja przez CLAUDE.md w każdym repozytorium, kontekst biznesowy w plikach Markdown. Dystrybucja komercyjna przez Claude Code plugin marketplace. Metodologia rozwoju oparta o OpenSpec (SDD).

### 1.4 Metryki sukcesu

| Metryka | Cel | Sposób pomiaru |
|---------|-----|----------------|
| Czas dostępu do kontekstu | < 30s od pytania do odpowiedzi z pełnym kontekstem | Porównanie z obecnym workflow (otwórz Project → przypomnij kontekst → pytanie) |
| Kompozycja agentów | Możliwość użycia 2+ agentów w jednej sesji | Test: "Przeanalizuj finansowo i prawnie ten scenariusz" |
| Separacja danych | 0 wycieków danych PLSoft do repo 200IQ LABS | Code review + `grep -r "PLSoft" agentic-ai-system/` zwraca 0 |
| Onboarding wspólnika | Przemek produktywnie korzysta z systemu w < 1 dzień | Obserwacja pierwszej sesji |
| Przenośność | Adaptacja dla nowego klienta w < 4h | Test: sklonuj repo, podmień kontekst, zweryfikuj agentów |
| Szybsze decyzje | Redukcja czasu od pytania do decyzji o 50%+ | Subiektywna ocena po 2 tygodniach użytkowania |
| Triggering accuracy | Każdy skill triggeruje się poprawnie w ≥ 80% przypadków | Evals z skill-creator (quantitative benchmark) |

---

## 2. Kontekst

### 2.1 Użytkownicy docelowi

**Persona 1: Paweł (primary)**
- Rola: CTO / Cofounder 200IQ LABS + właściciel PLSoft (JDG)
- Charakterystyka: Techniczny (17+ lat w IT), pracuje w terminalu (Claude Code, Cursor, VS Code), zarządza wieloma kontekstami jednocześnie
- Potrzeby: Szybki dostęp do wyspecjalizowanych "doradców" AI bez przełączania narzędzi, separacja kontekstów biznesowych, mniej context-switchingu
- Pain points: Rozproszenie promptów i kontekstu, manualne przełączanie Projects, brak kompozycji agentów

**Persona 2: Przemek (secondary)**
- Rola: CEO / Cofounder 200IQ LABS
- Charakterystyka: Bardzo techniczny — poradzi sobie z Claude Code CLI, Git, terminalem
- Potrzeby: Dostęp do systemu decyzyjnego spółki (finanse, strategia, marketing), samodzielna praca z systemem
- Pain points: Brak spójnego źródła wiedzy o stanie spółki

**Persona 3: Przyszły klient (tertiary, post-MVP)**
- Rola: Właściciel/manager firmy
- Charakterystyka: Zróżnicowana techniczność
- Potrzeby: Gotowy framework agentów AI do wdrożenia w swojej firmie
- Kanał: Claude Code plugin marketplace lub consulting wdrożeniowy

### 2.2 Założenia
- Claude Code pozostaje stabilnym narzędziem z obsługą CLAUDE.md, skills i bash
- Standard Agent Skills (agentskills.io) będzie rozwijany i adoptowany przez kolejne narzędzia AI
- Git submodules są wystarczające do współdzielenia skills między repo
- Obaj founders (Paweł + Przemek) sprawnie pracują z Claude Code CLI i Git
- Skrypty bash/Python z `curl` do API wystarczą zamiast MCP dla większości integracji
- Dane wrażliwe (klucze API, hasła) w `.env` + `.gitignore`, nie w plikach kontekstowych
- PLSoft (JDG) najprawdopodobniej zostaje jako osobna działalność
- Metodologia rozwoju: OpenSpec (SDD)

### 2.3 Zależności zewnętrzne
- Claude Code CLI (Anthropic) — silnik wykonawczy
- Agent Skills standard (agentskills.io) — format skills
- Skill-creator (anthropics/skills) — narzędzie do budowy i testowania agentów
- Git + GitHub (prywatne repozytoria) — hosting
- OpenSpec CLI — workflow spec-driven development
- API zewnętrzne: ClickUp, Google Calendar, Gmail
- Revolut Business API — dane transakcyjne
- Google Drive (współdzielony) — dokumenty firmowe

---

## 3. Wymagania funkcjonalne

### 3.1 Scope MVP

| ID | Funkcjonalność | Priorytet | Status |
|----|----------------|-----------|--------|
| F1 | Architektura 3 repozytoriów z git submodule | MUST | Planned |
| F2 | Shared Skills Library — 8 agentów (zgodnych z Agent Skills spec) | MUST | Planned |
| F3 | CLAUDE.md orkiestrator per repo | MUST | Planned |
| F4 | Kontekst biznesowy w plikach MD | MUST | Planned |
| F5 | Skill-creator workflow do budowy i testowania agentów | MUST | Planned |
| F6 | Skrypty narzędziowe (CLI tools) per agent | SHOULD | Planned |
| F7 | Migracja istniejących promptów/Projects | SHOULD | Planned |
| F8 | Onboarding guide dla Przemka | SHOULD | Planned |
| F9 | OpenSpec initialization per repo | SHOULD | Planned |
| F10 | Plugin marketplace config (.claude-plugin) | SHOULD | Planned |
| F11 | CI/CD — linting i walidacja SKILL.md + skryptów | COULD | Planned |
| F12 | Template repo dla nowych klientów | COULD | Planned |

### 3.2 User Stories

---

#### US-001: Orkiestracja wielu agentów w jednej sesji
**Jako** Paweł
**Chcę** zadać pytanie wymagające wiedzy z wielu dziedzin (np. finanse + prawo)
**Aby** otrzymać spójną, wielowymiarową analizę bez przełączania kontekstów

**Kryteria akceptacji:**
- [ ] CLAUDE.md poprawnie routuje pytanie do odpowiednich skills
- [ ] Odpowiedź syntetyzuje perspektywy obu agentów
- [ ] Przy konflikcie rekomendacji (np. CFO vs Legal) — jawnie go sygnalizuje
- [ ] Czas odpowiedzi porównywalny z pojedynczym agentem

**Notatki techniczne:** CLAUDE.md definiuje routing logic. Skills ładują się na żądanie. Kluczowe: `description` w YAML frontmatter musi być precyzyjny — to główny mechanizm triggerowania.

---

#### US-002: Separacja kontekstów PLSoft / 200IQ LABS
**Jako** Paweł
**Chcę** mieć pewność że dane PLSoft nigdy nie pojawią się w sesji 200IQ LABS (i odwrotnie)
**Aby** móc bezpiecznie współdzielić repo spółki z Przemkiem

**Kryteria akceptacji:**
- [ ] Repo `agentic-ai-system` nie zawiera żadnych referencji do PLSoft
- [ ] Repo `agentic-ai-private` nie zawiera danych spółki
- [ ] Shared skills (submodule) nie zawierają żadnych danych — tylko logikę agentów
- [ ] `.gitignore` wyklucza pliki z danymi wrażliwymi
- [ ] Test: `grep -r "PLSoft" agentic-ai-system/` zwraca 0 wyników

---

#### US-003: Agent CFO — analiza finansowa
**Jako** Paweł lub Przemek
**Chcę** zapytać o stan finansów spółki / JDG i otrzymać analizę z rekomendacjami
**Aby** podejmować szybsze decyzje finansowe oparte na danych

**Kryteria akceptacji:**
- [ ] Agent zna aktualny kontekst finansowy (z plików `context/company/finances.md`)
- [ ] Odpowiada na pytania typu: cash flow, runway, budżet, prognozy
- [ ] Potrafi zasugerować optymalizacje kosztowe
- [ ] Rozumie specyfikę PSA (prosta spółka akcyjna) i JDG
- [ ] Przy braku danych — jawnie informuje co trzeba uzupełnić zamiast zgadywać
- [ ] Opcjonalnie: integracja z Revolut Business API (skrypt pobierający transakcje)

**Notatki techniczne:** Triggering keywords w description: finanse, budżet, koszty, przychody, cash flow, runway, rentowność, optymalizacja kosztowa. Źródła: `context/finances.md`, ewentualnie `scripts/get_transactions.py`.

---

#### US-004: Agent Doradca Podatkowy
**Jako** Paweł
**Chcę** konsultować kwestie podatkowe (CIT, VAT, PIT, ZUS) dla obu form działalności
**Aby** minimalizować ryzyko podatkowe i optymalizować obciążenia

**Kryteria akceptacji:**
- [ ] Agent zna różnice podatkowe między JDG a PSA
- [ ] Odpowiada na pytania o: CIT-e, VAT, PIT, ZUS, składkę zdrowotną
- [ ] Rozumie IP Box, B+R, estoński CIT w kontekście firm IT
- [ ] Jawnie zaznacza granicę swojej wiedzy i sugeruje konsultację z doradcą podatkowym
- [ ] Potrafi przygotować brief z pytaniami dla doradcy podatkowego

**Notatki techniczne:** `scripts/tax-calendar.sh` — przypomnienia o terminach. `references/polish-tax-system.md` ładowany on-demand.

---

#### US-005: Agent Prawnik / Legal
**Jako** Paweł lub Przemek
**Chcę** uzyskać wstępną analizę prawną (umowy, RODO, IP, KSH)
**Aby** przygotować brief dla prawnika lub podjąć decyzję w prostych kwestiach

**Kryteria akceptacji:**
- [ ] Agent analizuje umowy (NDA, B2B, licencje) pod kątem ryzyk
- [ ] Zna specyfikę PSA (KSH) i prawa IT (prawa autorskie do kodu, SaaS)
- [ ] Pomaga przygotować drafty dokumentów prawnych
- [ ] Rozumie RODO w kontekście produktu AI (Shorts Lab)
- [ ] Zawsze zaznacza że nie zastępuje porady prawnej

**Notatki techniczne:** Migracja istniejącego skill `legal-assistant` z projektu claude.ai. Pattern wzorowany na `doc-coauthoring` z anthropics/skills.

---

#### US-006: Agent Marketing / Content
**Jako** Paweł lub Przemek
**Chcę** tworzyć materiały marketingowe spójne z brand guidelines
**Aby** utrzymać regularną obecność online i pozyskiwać klientów/użytkowników

**Kryteria akceptacji:**
- [ ] Agent zna tone of voice obu marek (PLSoft, 200IQ LABS / Shorts Lab)
- [ ] Generuje: posty LinkedIn, opisy produktów, email marketing, treści na stronę
- [ ] Rozumie grupę docelową produktu (fotografowie, e-commerce, agencje kreatywne)
- [ ] Utrzymuje spójność z istniejącym contentem (newsletter, blog)
- [ ] Adaptuje styl do kanału (LinkedIn profesjonalny, social media luźniejszy)

**Notatki techniczne:** Wzorowany na `brand-guidelines` + `internal-comms` z anthropics/skills. Struktura: typ komunikacji → wczytaj odpowiedni reference file z guidelines.

---

#### US-007: Agent Konsultant Biznesowy
**Jako** Paweł
**Chcę** mieć sparring partnera do decyzji strategicznych
**Aby** walidować pomysły biznesowe i identyfikować ryzyka przed wdrożeniem

**Kryteria akceptacji:**
- [ ] Agent zna obecny model biznesowy obu firm
- [ ] Potrafi przeprowadzić analizę SWOT, Business Model Canvas, pricing strategy
- [ ] Challenger mindset — kwestionuje założenia, proponuje alternatywy
- [ ] Rozumie rynek AI/generative AI i competitive landscape
- [ ] Wspiera decyzję PLSoft vs 200IQ LABS (konsolidacja działalności)

**Notatki techniczne:** Migracja istniejącego projektu "Konsultant biznesowy" z claude.ai. Jeden z pierwszych do budowy ze skill-creatorem.

---

#### US-008: Agent Product Manager (Shorts Lab)
**Jako** Paweł lub Przemek
**Chcę** mieć wsparcie w zarządzaniu rozwojem produktu Shorts Lab
**Aby** priorytetyzować features, planować roadmapę i podejmować decyzje produktowe

**Kryteria akceptacji:**
- [ ] Agent zna aktualny stan produktu (features, stack, użytkownicy)
- [ ] Pomaga w priorytetyzacji backlogu (RICE, MoSCoW)
- [ ] Generuje user stories i kryteria akceptacji
- [ ] Rozumie rynek virtual photography / AI-generated content
- [ ] Wspiera planowanie sprintów i release'ów

---

#### US-009: Agent Coach "The Five" (startup coaching)
**Jako** Paweł
**Chcę** mieć coaching oparty o framework z książki o startupach
**Aby** systematycznie pracować nad rozwojem spółki z perspektywy startup methodology

**Kryteria akceptacji:**
- [ ] Agent zna framework "The Five" i stosuje go w kontekście 200IQ LABS
- [ ] Prowadzi ustrukturyzowane sesje coachingowe
- [ ] Zadaje celne pytania zamiast dawać gotowe odpowiedzi
- [ ] Trackuje postępy między sesjami (w plikach context/)
- [ ] Integruje się z agentem Konsultant Biznesowy dla głębszych analiz

**Notatki techniczne:** Migracja z claude.ai. `references/the-five-framework.md` z kluczowymi koncepcjami.

---

#### US-010: Agent LinkedIn Content Generator
**Jako** Paweł
**Chcę** szybko generować angażujące posty LinkedIn
**Aby** utrzymać regularną obecność i budować personal brand

**Kryteria akceptacji:**
- [ ] Agent zna mój tone of voice na LinkedIn (z historycznych postów)
- [ ] Generuje posty w różnych formatach (storytelling, tips, opinia, case study)
- [ ] Rozumie algorytm LinkedIn (hooks, formatting, CTA)
- [ ] Sugeruje tematy na podstawie trendów i mojej ekspertyzy
- [ ] Może być używany niezależnie lub jako sub-skill agenta Marketing

**Notatki techniczne:** Migracja z claude.ai. Może działać standalone lub wywoływany przez Marketing skill. `references/linkedin-best-practices.md` + `assets/post-templates/`.

---

#### US-011: Budowa agentów z skill-creatorem
**Jako** Paweł
**Chcę** budować agentów iteracyjnie, z testami i benchmarkami
**Aby** mieć pewność że każdy agent triggeruje się poprawnie i daje jakościowe odpowiedzi

**Kryteria akceptacji:**
- [ ] Skill-creator zainstalowany w Claude Code (`/plugin install example-skills@anthropic-agent-skills`)
- [ ] Każdy agent przechodzi pełen cykl: intent → interview → draft → test → evaluate → iterate → package
- [ ] Dla każdego agenta istnieje zestaw test prompts (min. 5 per agent)
- [ ] Triggering accuracy ≥ 80% (mierzone przez skill-creator evals)
- [ ] Każdy agent zapakowany jako `.skill` file
- [ ] Description każdego skilla zoptymalizowany przez `run_loop.py`

**Notatki techniczne:**
Workflow per agent:
```
1. claude> "Chcę stworzyć skill CFO / Financial Advisor"
2. skill-creator: capture intent → interview → edge cases
3. skill-creator: draft SKILL.md (Agent Skills spec compliant)
4. skill-creator: generate test prompts
5. skill-creator: run tests → generate eval viewer → human review
6. skill-creator: iterate based on feedback
7. skill-creator: optimize description (triggering)
8. skill-creator: package as .skill file
```

---

#### US-012: Custom CLI tools zamiast MCP
**Jako** Paweł
**Chcę** lekkie skrypty bash/Python per integracja zamiast pełnych MCP serwerów
**Aby** minimalizować zużycie kontekstu i mieć pełną kontrolę nad tym co idzie do API

**Kryteria akceptacji:**
- [ ] Każda integracja to osobny skrypt w `scripts/` per skill lub w `tools/` shared
- [ ] Skrypty przyjmują argumenty CLI i zwracają JSON/tekst
- [ ] Klucze API w `.env`, skrypty czytają przez `source .env` lub `dotenv`
- [ ] Claude Code może wywołać skrypt przez `bash scripts/get_tasks.sh "query"`
- [ ] Wyjątek: Gmail i Google Calendar mogą używać MCP (OAuth flow)
- [ ] Każdy skrypt ma `--help` z opisem użycia

---

#### US-013: Migracja istniejących promptów
**Jako** Paweł
**Chcę** przenieść istniejące Claude Projects i prompty do nowego systemu
**Aby** nie tracić wypracowanego kontekstu i logiki agentów

**Kryteria akceptacji:**
- [ ] Zidentyfikowane wszystkie istniejące Projects w claude.ai (Konsultant biznesowy, Coach The Five, LinkedIn Content Generator, Legal Assistant, inne)
- [ ] Zidentyfikowane prompty w Obsidian i innych lokalizacjach
- [ ] Każdy prompt przekonwertowany do formatu Agent Skills (YAML frontmatter + markdown body)
- [ ] Knowledge files z Projects przeniesione do `references/` w odpowiednich skills
- [ ] Walidacja: każdy zmigrowany agent przechodzi test prompts ze skill-creatora

---

#### US-014: Plugin marketplace (dystrybucja komercyjna)
**Jako** Paweł
**Chcę** dystrybuować zestaw agentów jako Claude Code plugin
**Aby** umożliwić klientom łatwą instalację i zakup

**Kryteria akceptacji:**
- [ ] Repo `shared-skills` skonfigurowane jako plugin marketplace (`.claude-plugin/`)
- [ ] Agenci dostępni jako dwa plugin bundles: `business-advisor-skills` (komercyjny) i `community-skills` (open source)
- [ ] Instalacja jedną komendą: `/plugin install business-advisor-skills@200iqlabs-agent-skills`
- [ ] Każdy skill ma `.skill` file (wygenerowany przez skill-creator `package_skill.py`)
- [ ] README z instrukcją instalacji i wymaganiami

**Notatki techniczne:**
```
.claude-plugin/
├── manifest.json          # Plugin marketplace config
├── plugins/
│   ├── business-advisor-skills/
│   │   └── plugin.json   # Bundle: cfo, tax, legal, business-consultant, pm, coach
│   └── community-skills/
│       └── plugin.json   # Bundle: marketing, linkedin-content (open source)
```

---

### 3.3 Standard Agent Skills — format agentów

Wszystkie agenty w systemie muszą być zgodne ze standardem Agent Skills (agentskills.io).

**Struktura agenta:**
```
skills/{skill-name}/
├── SKILL.md              # YAML frontmatter + markdown instrukcje
├── scripts/              # Executable code for deterministic tasks
│   └── *.sh / *.py
├── references/           # Docs loaded into context as-needed
│   └── *.md
└── assets/               # Files used in output (templates, etc.)
    └── *
```

**Format SKILL.md (zgodny ze specyfikacją):**
```yaml
---
name: agent-name
description: "Clear description of what this skill does AND when to use it.
  Include specific trigger contexts and keywords. Be 'pushy' —
  skill-creator research shows undertriggering is more common than
  overtriggering."
---

# Agent Display Name

## Overview
Who is this agent, what's their role and expertise.

## Instructions
Step-by-step how the agent should behave.
When to load which reference files.

## Response Format
How to structure outputs.

## Boundaries
What this agent does NOT do.
When to defer to a human specialist.
```

**Progressive disclosure (3-level loading):**
1. **Metadata** (name + description) — zawsze w kontekście (~100 words)
2. **SKILL.md body** — ładowane gdy skill triggeruje (< 500 lines)
3. **References + scripts** — on-demand (unlimited, scripts execute without loading)

**Kluczowe zasady:**
- SKILL.md < 500 lines (jeśli więcej → przenieś do references/)
- Description musi być "pushy" — lepiej overtrigger niż undertrigger
- Scripts: deterministic/repetitive tasks (API calls, data parsing)
- References: loaded when needed, not always
- Assets: templates, fonts, icons used in outputs

---

## 4. Wymagania niefunkcjonalne

### 4.1 Wydajność

| Metryka | Wymaganie |
|---------|-----------|
| Ładowanie kontekstu | Skills + context files < 30% okna kontekstowego Claude |
| SKILL.md body | < 500 lines per agent (standard Agent Skills) |
| Metadata (name + desc) | ~100 words per agent |
| Czas odpowiedzi skryptów | < 5s per wywołanie API |
| Rozmiar repo | < 50MB per repo (bez .env, danych wrażliwych) |

### 4.2 Bezpieczeństwo
- [ ] Klucze API wyłącznie w `.env` (gitignored)
- [ ] `.env.example` z opisem wymaganych zmiennych (bez wartości)
- [ ] Repo 200IQ LABS: dostęp tylko Paweł + Przemek (GitHub private)
- [ ] Repo PLSoft: dostęp tylko Paweł (GitHub private)
- [ ] Shared skills: publiczne (GitHub public) — nie zawiera danych
- [ ] Brak hardkodowanych danych personalnych w SKILL.md
- [ ] Pre-commit hook sprawdzający wzorce (klucze API, NIP, PESEL)

### 4.3 Utrzymywalność
- [ ] Każdy agent testowalny w izolacji (skill-creator test prompts)
- [ ] Aktualizacja agenta w jednym miejscu propaguje do wszystkich repo (submodule)
- [ ] Dokumentacja inline w każdym SKILL.md i skrypcie
- [ ] CHANGELOG.md w shared-skills dla śledzenia zmian agentów
- [ ] Każdy agent ma `.skill` package file (łatwa reinstalacja)

### 4.4 Zgodność ze standardami
- [ ] Wszystkie skills zgodne z Agent Skills spec (agentskills.io)
- [ ] YAML frontmatter: `name` + `description` (required)
- [ ] Opcjonalne: `compatibility` (tools, dependencies)
- [ ] Plugin marketplace manifest zgodny ze specyfikacją Claude Code

### 4.5 Przenośność i komercjalizacja
- [ ] Struktura repo nadaje się do klonowania i adaptacji dla klienta
- [ ] Kontekst biznesowy w osobnym katalogu (`context/`) — łatwy do podmiany
- [ ] Brak zależności od konkretnego OS (bash + Python cross-platform)
- [ ] Agent Skills standard = kompatybilność z wieloma narzędziami AI (nie tylko Claude Code)
- [ ] Licencja: community skills Apache 2.0 (open source), business bundle = produkt komercyjny

---

## 5. Stack technologiczny

### 5.1 Core

| Komponent | Technologia | Uzasadnienie |
|-----------|-------------|--------------|
| Silnik AI | Claude Code CLI | Natywna obsługa CLAUDE.md, skills, bash |
| Format agentów | Agent Skills (agentskills.io) | Otwarty standard, multi-tool kompatybilność, plugin ecosystem |
| Budowa agentów | skill-creator (anthropics/skills) | Iteracyjny workflow z testami i benchmarkami |
| Wersjonowanie | Git + GitHub | Znane narzędzie, natywna integracja z Claude Code |
| Submodule sharing | Git submodules | Współdzielenie skills bez duplikacji |
| Metodologia | OpenSpec (SDD) | Lekki, spec-driven, brownfield-first |
| Kontekst biznesowy | Markdown files | Czytelne, edytowalne, wersjonowane |
| Skrypty narzędziowe | Bash + Python | Lekkie, uniwersalne |
| Zarządzanie sekretami | `.env` + dotenv | Standard branżowy |
| Dystrybucja | Claude Code plugin marketplace | Natywna dystrybucja skills |

### 5.2 Gotowe skills z anthropics/skills do wykorzystania

| Skill | Użycie w projekcie |
|-------|-------------------|
| `skill-creator` | Narzędzie do budowy i testowania każdego agenta |
| `brand-guidelines` | Wzorzec dla agenta Marketing (struktura: typ → reference file) |
| `internal-comms` | Wzorzec komunikacji (typy dokumentów → odpowiedni template) |
| `doc-coauthoring` | Pattern dla agenta Legal (collaborative document review) |
| `mcp-builder` | Na później — gdy/jeśli będziemy budować custom MCP servery |
| `frontend-design` | Przy pracy nad UI Shorts Lab |

### 5.3 Integracje zewnętrzne

| Serwis | Cel | Metoda | Priorytet |
|--------|-----|--------|-----------|
| ClickUp | Zarządzanie zadaniami | Custom bash scripts (API token) | SHOULD |
| Revolut Business | Dane transakcyjne, salda | Custom Python scripts (API) | SHOULD |
| Google Calendar | Planowanie, terminy | MCP (wymaga OAuth) | COULD |
| Gmail | Komunikacja, follow-upy | MCP (wymaga OAuth) | COULD |
| Google Drive | Dokumenty firmowe | Custom scripts / MCP | COULD |

### 5.4 CI/CD (Faza 6)

| Komponent | Technologia | Cel |
|-----------|-------------|-----|
| SKILL.md validation | GitHub Actions + Agent Skills validator | Zgodność ze specyfikacją, line count < 500 |
| Shellcheck | GitHub Actions | Jakość skryptów bash |
| Pre-commit hooks | Husky lub pre-commit | Wykrywanie wycieków danych wrażliwych |
| Triggering tests | skill-creator `run_eval.py` | Regression testing triggering accuracy |

---

## 6. Architektura

### 6.1 Diagram repozytoriów

```
┌──────────────────────────────────────────────────────────┐
│                     GitHub                                │
│                                                          │
│                                                          │
│  ┌── 200iqlabs org ──────────────────────┐  ┌──────────┐│
│  │                                       │  │plipowczan││
│  │ ┌─────────────────┐ ┌──────────────┐  │  │          ││
│  │ │ shared-skills    │ │ agentic-ai-  │  │  │ agentic- ││
│  │ │ (PUBLIC)         │ │ system       │  │  │ ai-      ││
│  │ │                  │ │ (PRIVATE)    │  │  │ private  ││
│  │ │ • .claude-plugin/│ │              │  │  │ (PRIVATE)││
│  │ │ • skills/         │◄┤ • skills/ ──┼──┼──┤ • skills/││
│  │ │ • tools/         │ │  (submodule) │  │  │  (submod)││
│  │ │ • openspec/      │ │ • context/   │  │  │ • contxt/││
│  │ │                  │ │ • CLAUDE.md  │  │  │ • CLAUDE ││
│  │ │ 👤 Paweł        │ │              │  │  │   .md    ││
│  │ │ 👤 Przemek       │ │ 👤 Paweł    │  │  │          ││
│  │ │ 👤 (community)   │ │ 👤 Przemek   │  │  │ 👤 Paweł ││
│  │ └─────────────────┘ └──────────────┘  │  │          ││
│  └───────────────────────────────────────┘  └──────────┘│
└──────────────────────────────────────────────────────────┘
```

### 6.2 Struktura repozytorium: `shared-skills`

```
shared-skills/
├── README.md
├── CHANGELOG.md
├── LICENSE                          # Apache 2.0 (community skills)
├── .claude-plugin/                  # Plugin marketplace config
│   └── plugin.json
├── openspec/
│   ├── project.md
│   ├── AGENTS.md
│   └── specs/
├── skills/
│   ├── cfo/
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   │   ├── get_transactions.py
│   │   │   └── get_balance.py
│   │   └── references/
│   │       ├── financial-analysis-frameworks.md
│   │       └── psa-jdg-specifics.md
│   ├── tax-advisor/
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   │   └── tax-calendar.sh
│   │   └── references/
│   │       ├── polish-tax-system.md
│   │       └── it-company-tax-optimization.md
│   ├── legal/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── legal-scope.md
│   │       ├── workflow-draft.md
│   │       └── workflow-brief.md
│   ├── marketing/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   │   ├── content-frameworks.md
│   │   │   └── channel-guidelines/
│   │   │       ├── linkedin.md
│   │   │       ├── email.md
│   │   │       └── website.md
│   │   └── assets/
│   │       └── post-templates/
│   ├── business-consultant/
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── analysis-frameworks.md
│   ├── product-manager/
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── prioritization-frameworks.md
│   ├── coach-the-five/
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── the-five-framework.md
│   └── linkedin-content/
│       ├── SKILL.md
│       ├── references/
│       │   └── linkedin-best-practices.md
│       └── assets/
│           └── post-templates/
├── tools/                            # Shared CLI tools
│   ├── clickup/
│   │   ├── get_tasks.sh
│   │   ├── create_task.sh
│   │   └── README.md
│   ├── google-drive/
│   │   └── search_files.sh
│   └── common/
│       ├── .env.example
│       └── helpers.sh
├── evals/                            # Test prompts per agent
│   ├── cfo-evals.json
│   ├── tax-advisor-evals.json
│   └── ...
└── templates/                        # For new client onboarding
    ├── SKILL_TEMPLATE.md
    ├── CONTEXT_TEMPLATE.md
    └── CLAUDE_MD_TEMPLATE.md
```

### 6.3 Struktura repozytorium: `agentic-ai-system`

```
agentic-ai-system/
├── CLAUDE.md                        # Orkiestrator spółki
├── .claude/
│   └── settings.json
├── openspec/
│   ├── project.md
│   ├── AGENTS.md
│   └── specs/
├── skills/ → (submodule: shared-skills)
├── context/
│   ├── company/
│   │   ├── company-info.md          # KRS, umowa spółki, udziałowcy
│   │   ├── finances.md              # Budżet, runway, MRR, koszty
│   │   ├── team.md                  # Zespół, role, kompetencje
│   │   └── strategy.md             # Wizja, misja, cele roczne
│   ├── product/
│   │   ├── shorts-lab-overview.md   # Opis produktu, stack, architektura
│   │   ├── roadmap.md               # Roadmap, backlog, priorytety
│   │   ├── users.md                 # Persony, segmenty, feedback
│   │   └── competitors.md           # Analiza konkurencji
│   ├── clients/
│   │   └── client-list.md
│   ├── operations/
│   │   ├── processes.md
│   │   └── kpis.md
│   └── brand/
│       ├── tone-of-voice.md
│       └── brand-guidelines.md
├── .env
├── .env.example
└── .gitignore
```

### 6.4 Struktura repozytorium: `agentic-ai-private`

```
agentic-ai-private/
├── CLAUDE.md                        # Orkiestrator PLSoft + prywatny
├── .claude/
│   └── settings.json
├── openspec/
│   ├── project.md
│   ├── AGENTS.md
│   └── specs/
├── skills/ → (submodule: shared-skills)
├── context/
│   ├── plsoft/
│   │   ├── company-info.md
│   │   ├── finances.md
│   │   ├── clients.md
│   │   └── services.md
│   ├── personal/
│   │   ├── goals.md
│   │   ├── learning.md
│   │   └── notes.md
│   ├── brand/
│   │   └── tone-of-voice.md
│   └── newsletter/
│       ├── newsletter-config.md
│       └── archive/
├── .env
├── .env.example
└── .gitignore
```

### 6.5 Przepływ danych — przykładowa sesja

```
Paweł: "Jakie są implikacje podatkowe przejścia z JDG na pełne
        działanie w ramach spółki?"

CLAUDE.md routing:
  → Reads available_skills metadata (name + description per agent)
  → "podatkowe" matches tax-advisor description
  → "spółka" + "JDG" + "finanse" matches cfo description
  → "przejście" + "strategia" matches business-consultant description

Claude Code:
  1. Loads SKILL.md body for 3 triggered agents
  2. CFO agent reads: references/psa-jdg-specifics.md + context/plsoft/finances.md
  3. Tax agent reads: references/polish-tax-system.md + references/it-company-tax-optimization.md
  4. Business consultant reads: references/analysis-frameworks.md + context/plsoft/company-info.md
  5. Synthesizes 3 perspectives into unified response
  6. Flags conflicts (e.g. "podatkowo korzystne, ale prawnie złożone")
  7. Suggests brief do konsultacji z doradcą podatkowym
```

### 6.6 Workflow budowy agenta (skill-creator)

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│ 1. CAPTURE  │───▶│ 2. INTERVIEW │───▶│  3. DRAFT    │
│   INTENT    │    │  & RESEARCH  │    │   SKILL.md   │
│             │    │              │    │ (Agent Skills │
│ What, When, │    │ Edge cases,  │    │  spec format) │
│ Output fmt  │    │ formats,     │    │              │
│             │    │ dependencies │    │              │
└─────────────┘    └──────────────┘    └──────┬───────┘
                                              │
┌─────────────┐    ┌──────────────┐    ┌──────▼───────┐
│ 6. PACKAGE  │◀───│ 5. ITERATE   │◀───│ 4. TEST &    │
│   .skill    │    │              │    │   EVALUATE   │
│             │    │ Improve based│    │              │
│ Ready for   │    │ on feedback  │    │ Test prompts │
│ marketplace │    │ & benchmarks │    │ Eval viewer  │
│             │    │              │    │ Human review │
└──────┬──────┘    └──────────────┘    └──────────────┘
       │
       ▼
┌──────────────┐
│ 7. OPTIMIZE  │
│ DESCRIPTION  │
│              │
│ run_loop.py  │
│ Triggering   │
│ accuracy     │
└──────────────┘
```

### 6.7 OpenSpec workflow w kontekście systemu

```
# Dodanie nowego agenta
/opsx:propose add-agent-hr-advisor
  → openspec/changes/add-agent-hr-advisor/
    ├── proposal.md      # Dlaczego potrzebujemy tego agenta
    ├── specs/            # Wymagania: trigger, role, boundaries
    ├── design.md         # Struktura SKILL.md, references, scripts
    └── tasks.md          # Kroki implementacji (incl. skill-creator workflow)

/opsx:apply              # Implementacja z skill-creatorem
/opsx:archive            # Archiwizacja, aktualizacja specs
```

---

## 7. Out of Scope

### 7.1 Nie realizujemy w MVP
- GUI / web interface — system działa wyłącznie w terminalu (Claude Code CLI)
- Automatyczna synchronizacja kontekstu między repo (manualne `git pull`)
- Persistent memory między sesjami Claude Code
- Własny hosting modeli AI
- Automatyczne aktualizacje danych finansowych z systemu księgowego (wFirma, inFakt)
- RAG / wektorowa baza wiedzy
- Custom MCP servers (na razie skrypty CLI)

### 7.2 Przyszłe rozszerzenia (backlog)
- **Revolut → finances.md** — skrypt parsujący transakcje → aktualizacja kontekstu
- **Google Drive sync** — automatyczne pobieranie kluczowych dokumentów
- **Web dashboard** — lekki frontend do przeglądania kontekstu (read-only)
- **Onboarding wizard** — interaktywny setup dla nowych klientów
- **Agent marketplace** — publiczny katalog skills do sprzedaży
- **Metryki użycia** — tracking które agenty są najczęściej używane
- **RAG na dokumentach** — dla dużych zbiorów przekraczających okno kontekstowe
- **Notyfikacje** — agent proaktywnie przypomina o terminach
- **Cross-tool compatibility** — testowanie skills w Cursor, Windsurf, Copilot
- **Custom MCP servers** — dla integracji wymagających dwukierunkowej komunikacji

---

## 8. Ryzyka i mitygacje

| Ryzyko | P-stwo | Wpływ | Mitygacja |
|--------|--------|-------|-----------|
| Kontekst agentów przekracza okno Claude | MED | HIGH | Progressive disclosure (3-level loading). SKILL.md < 500 lines. References on-demand |
| Skill undertriggering | HIGH | MED | "Pushy" descriptions. Optimization z `run_loop.py`. Evals per agent. Regression testing w CI |
| Git submodule friction | LOW | MED | Oba founders techniczni. Skrypt `update.sh`. Dokumentacja w README |
| Dane wrażliwe wyciekną do repo | LOW | HIGH | Pre-commit hook. `.gitignore` template. Code review |
| Agenty halucynują w kwestiach prawnych/podatkowych | HIGH | HIGH | Jawne boundaries w SKILL.md. References z aktualnymi przepisami. Zawsze sugestia konsultacji |
| Claude Code zmieni API/zachowanie | LOW | HIGH | Agent Skills to otwarty standard — przenośny na inne narzędzia. Minimalna zależność od specyfik |
| Kontekst w plikach MD dezaktualizuje się | HIGH | MED | Data w nagłówku każdego context/ file. CLAUDE.md reminder: "jeśli dane > 30 dni — poinformuj" |
| Agent Skills standard zmieni się w breaking way | LOW | MED | Standard jest prosty (YAML + MD). Skill-creator + validator jako safety net |
| Shared skills publiczne → ktoś skopiuje | MED | LOW | Wartość w bundle + templates + onboarding, nie w pojedynczych skills. Apache 2.0 community, komercyjny bundle |

---

## 9. Plan implementacji

| Faza | Zakres | Estymacja | Deliverables |
|------|--------|-----------|--------------|
| **Faza 0: Setup** | 3 repo na GitHub, git submodule, `.claude-plugin/`, OpenSpec init, install skill-creator | 0.5 dnia | Repo ze strukturą + tooling |
| **Faza 1: First 3 agents** | Skill-creator workflow dla: Konsultant biznesowy, Coach The Five, LinkedIn Content (migracja z claude.ai) | 2-3 dni | 3 przetestowane agenty z eval sets |
| **Faza 2: Remaining 5 agents** | Skill-creator workflow dla: CFO, Tax, Legal, Marketing, PM | 3-4 dni | 8 agentów total, all tested |
| **Faza 3: Kontekst** | Wypełnienie plików context/ danymi biznesowymi obu firm | 2-3 dni | Kontekst dla obu repo |
| **Faza 4: Tools** | Skrypty CLI (ClickUp, Revolut, Google Drive) | 2-3 dni | Działające skrypty + integracja |
| **Faza 5: Onboarding** | Guide dla Przemka, wspólna sesja testowa | 1 dzień | Dokumentacja + przeszkolony Przemek |
| **Faza 6: Hardening** | CI/CD, pre-commit hooks, triggering regression tests, plugin marketplace config | 1-2 dni | Produkcyjny system |

**Łącznie MVP: ~12-16 dni** (part-time, równolegle z innymi obowiązkami)

**Kolejność Fazy 1:** Zaczynam od 3 istniejących projektów z claude.ai bo:
1. Mają przetestowane prompty → szybsza konwersja do SKILL.md
2. Walidują koncepcję na realnych use case'ach
3. Skill-creator może iterować na istniejącej jakości
4. Szybko dają wartość w codziennej pracy

---

## 10. Strategia komercjalizacji

### 10.1 Model licencyjny

| Warstwa | Licencja | Zawartość |
|---------|----------|-----------|
| Community skills | Apache 2.0 | Wybrane skills (marketing, linkedin-content), templates, skill template |
| Business advisor bundle | Komercyjna | Pełny zestaw 8 agentów + orkiestrator + evals + onboarding guide |
| Wdrożenie u klienta | Usługa consulting | Adaptacja kontekstu, custom agents, szkolenie |

### 10.2 Kanały dystrybucji

1. **Claude Code plugin marketplace** — `/plugin marketplace add plsoft/shared-skills` → instalacja jedną komendą
2. **GitHub** — community skills publicznie, business bundle prywatnie (access na zaproszenie lub zakup)
3. **Consulting PLSoft / 200IQ LABS** — wdrożenie + konfiguracja u klienta

### 10.3 Wartość dla klienta

Klient kupuje nie pojedyncze prompty, ale:
1. **Przetestowaną architekturę wieloagentową** z eval sets i proven triggering accuracy
2. **Gotowe templates** do adaptacji (context/, CLAUDE.md, OpenSpec)
3. **Onboarding i konfigurację** pod firmę klienta
4. **Standard-compliant skills** działające z wieloma narzędziami AI (nie vendor lock-in)
5. **Wsparcie i aktualizacje** agentów

### 10.4 Cross-tool portability (przyszłość)

Agent Skills to otwarty standard. Skills zbudowane w tym projekcie mogą potencjalnie działać z:
- Claude Code (natywnie)
- Cursor (via Agent Skills support)
- Windsurf
- GitHub Copilot CLI
- Inne narzędzia adoptujące standard

To poszerza rynek z "użytkownicy Claude" do "użytkownicy dowolnego AI coding tool."

---

## Appendix

### A. Słownik pojęć

| Termin | Definicja |
|--------|-----------|
| Agent / Skill | Modułowa jednostka AI z własnym SKILL.md, references, scripts i assets |
| Agent Skills | Otwarty standard formatu skills (agentskills.io) |
| CLAUDE.md | Plik konfiguracyjny Claude Code w rootcie repo — definiuje kontekst i routing |
| SKILL.md | Plik definiujący zachowanie agenta (YAML frontmatter + markdown instructions) |
| Context files | Pliki Markdown z danymi biznesowymi specyficznymi dla danego repo |
| Orkiestrator | Logika w CLAUDE.md decydująca który agent/skill obsłuży zapytanie |
| Progressive disclosure | 3-level loading: metadata → body → references (oszczędność kontekstu) |
| Skill-creator | Oficjalne narzędzie Anthropic do iteracyjnego budowania i testowania skills |
| Plugin marketplace | Mechanizm dystrybucji skills w Claude Code |
| Git submodule | Mechanizm Git pozwalający osadzić jedno repo wewnątrz drugiego |
| MCP | Model Context Protocol — standard integracji narzędzi z Claude |
| OpenSpec | Spec-Driven Development framework — lekki, brownfield-first |
| SDD | Spec-Driven Development — metodologia gdzie specyfikacja napędza implementację |
| PSA | Prosta Spółka Akcyjna — forma prawna 200IQ LABS |
| JDG | Jednoosobowa Działalność Gospodarcza — forma prawna PLSoft |

### B. Referencje
- Agent Skills standard: https://agentskills.io
- Agent Skills spec: https://agentskills.io/specification
- Anthropic skills repo: https://github.com/anthropics/skills
- Skill-creator: https://github.com/anthropics/skills/tree/main/skills/skill-creator
- Claude Code docs: https://docs.anthropic.com/en/docs/claude-code
- OpenSpec: https://github.com/Fission-AI/OpenSpec
- OpenSpec docs: https://openspec.dev
- Git submodules: https://git-scm.com/book/en/v2/Git-Tools-Submodules
- ClickUp API: https://clickup.com/api
- Revolut Business API: https://developer.revolut.com/docs/business/
