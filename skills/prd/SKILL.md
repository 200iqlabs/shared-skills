---
name: prd
description: >-
  Generuje 1-2 stronicowy, agent-ready PRD dla MVP budowanego w 7 dni (Faza 1
  playbooka PLSoft 7-Day MVP / AI Startup Builders Week 3). Bierze insighty z
  Week 1 (Problem-Solution Fit) i Week 2 (GTM/ICP/Value Proposition + LP) —
  dostarczone w dowolnym układzie plików (jeden dokument, osobne icp/positioning/
  gtm-plan/landing-brief, folder, notatki) plus brand — i sprowadza je do jednego
  dokumentu prd.md, który agent (Claude Code lub Lovable/v0) rozumie i pod który
  generuje kod. Triggeruj
  na komendę /prd ORAZ gdy founder-uczestnik programu chce zrobić PRD pod MVP,
  spisać scope na 7 dni, przerobić output W1/W2 na dokument dla agenta, albo
  pyta "jak napisać PRD dla mojego MVP", "spnij to w PRD", "scope na MVP".
  Triggeruj też gdy ktoś chce ograniczyć/przyciąć zakres (scope) MVP do jednego
  core flow i spisać to w dokument pod agenta, oraz gdy osoba nietechniczna
  buduje aplikację w Lovable/v0 i potrzebuje PRD/spisanego zakresu pod swoje
  MVP. Nie triggeruj na pełne PRD dla zewnętrznego klienta z fixed-price (to
  software-delivery-playbook, 9-day), ani na czysty UI/design brief (to
  vibe-coding).
license: Apache-2.0
---

# /prd — Agent-ready PRD dla 7-dniowego MVP

Sprowadza insighty Week 1 / Week 2 do **jednego dokumentu `prd.md`**, pod który
agent generuje kod bez chaosu. To Faza 1 [[mvp-7-day-playbook]]. Output zostaje
skonsumowany przez Fazę 3 (dekompozycja na `/goal`-e) i ostatecznie przez build
w Track Tech (Claude Code + `/prepare-goal` → `/goal`) lub Track Builder (Lovable/v0).

## Invocation

```
/prd <opcjonalnie nazwa projektu>
/prd                                → poproś o nazwę i wskazanie prd-input.md
```

## Jedyna zasada, która decyduje o sukcesie: tnij do JEDNEGO Core Flow

7 dni starczy na **jedną ścieżkę użytkownika zrobioną dobrze ALBO trzy zrobione źle.**
To nie jest pełny PRD dla klienta — to ostry brief pod jeden tydzień buildu. Jeśli
czujesz, że potrzebujesz 2 user stories w Core Flow, wybierz ważniejszą; druga idzie
do §6 Out of scope. Większość Twojej pracy w tym skillu to **odmawianie**, nie dodawanie.

Dlaczego: agent dostając PRD na 8 stron z trzema flow dryfuje w niuansach i po D7
masz trzy half-baked ścieżki zamiast jednego działającego MVP na Demo Day.

## Input contract — liczy się informacja, nie pliki

PRD powstaje z insightów Week 1 (Problem-Solution Fit) i Week 2 (GTM / ICP / Value
Proposition / LP). **Nie ma znaczenia, w ilu plikach ani pod jakimi nazwami** founder
je dostarczy — jeden skonsolidowany dokument, cztery osobne pliki z W2
(`icp.md`, `positioning.md`, `gtm-plan.md`, `landing-brief.md`), cały folder repo,
czy wklejone notatki. Founder wskazuje materiały; Ty czytasz to, co wskazał, i sprawdzasz,
czy **treść** pokrywa poniższą checklistę — nie czy istnieje plik o konkretnej nazwie.

**Czego PRD potrzebuje (input checklist):**

| Informacja | Zasila sekcję | Zwykle pochodzi z |
|---|---|---|
| Problem-Solution Fit + kto jest zdesperowany | §1, §2 | W1 Discovery |
| ICP + 1 persona (+ wnioski z social listeningu) | §2 | W2 ICP |
| Value Proposition / positioning / JTBD / key messaging | §1, §3 | W2 positioning |
| Model monetyzacji + zarys unit economics | §1 | W2 Lean Canvas / GTM |
| Brief LP + link do opublikowanego LP (headline, sekcje, CTA) | §1 | W2 landing brief |
| Brand: konkretne HEX-y, fonty, voice & tone | §5 | LP Week 2 |

Jedna pozycja rozbita na trzy pliki — w porządku. Jeden plik pokrywający kilka pozycji —
też. **Przeczytaj wszystko, co founder wskazał, zanim ocenisz kompletność** — brak pliku
o danej nazwie to nie to samo co brak informacji (może siedzieć w innym pliku).

**Jeśli materiały nie pokrywają checklisty** (nie ma ich w ogóle, są szczątkowe, albo
brakuje krytycznej pozycji — mierzalny problem, 1 persona, value proposition, model
przychodu) → nie zgaduj i nie generuj od razu. Najpierw krótko podsumuj, czego brakuje
(1-3 zdania, wskaż której pozycji checklisty), a potem **przedstaw userowi dwie ścieżki
do wyboru**:

> **Ścieżka 1 — dostarczasz materiały:** wskazujesz dodatkowe pliki/notatki z W1/W2
> (w dowolnym układzie). Generuję PRD z nich; jeśli czegoś nadal zabraknie, dopytam tylko o luki.
>
> **Ścieżka 2 — seria pytań:** przeprowadzam Cię przez brakujące elementy pytaniami.

Zasady Ścieżki 2 (wywiad):
- **Jedno pytanie naraz** — nigdy ściana tekstu z 6 pytaniami.
- **Do każdego pytania dodaj rekomendację** ("na podstawie tego co napisałeś,
  sugerowałbym X, bo...") — founder może ją przyjąć jednym słowem.
- **Każde pytanie można pominąć** — ale przy pominięciu powiedz wprost, czym to grozi:
  PRD w tym miejscu będzie zgadywany i może być nietrafiony. Founder pomija świadomie,
  nie przez przeoczenie.
- Kolejność pytań: problem & kto jest zdesperowany → ICP/persona → value proposition →
  monetization → core action → track. (Od "dlaczego" do "czym".)

Dlaczego ten protokół: bez niego model uprzejmie zmyśli ICP, metryki i persony z jednego
zdania pomysłu — PRD wygląda kompletnie, ale jest generic i nie pasuje do żadnego
zwalidowanego LP. Founder może świadomie zaakceptować luki; nie może ich dostać w pakiecie
bez ostrzeżenia.

**Jeśli brakuje tylko pojedynczych pozycji checklisty** (np. jest problem, nie ma
monetization), pomiń wybór ścieżek — od razu zadaj 1-2 precyzyjne pytania (z rekomendacją,
jedno naraz).

## Jak prowadzisz rozmowę

1. Przeczytaj wszystkie wskazane materiały (jeden plik, wiele plików, folder, wklejone
   notatki). Wyciągnij surowiec do każdej z 8 sekcji, mapując treść na input checklist.
2. Jeśli któraś krytyczna pozycja checklisty nie jest pokryta (mierzalny problem, 1 persona,
   model przychodu, pomysł na core action) → dopytaj, jedno pytanie naraz.
3. Aktywnie **proponuj cięcia**: jak widzisz 3 features, powiedz wprost które 2 idą
   do Out of scope i dlaczego. Founder = klient, ale Twoja rola to dyscyplina scope'u.
4. Wygeneruj `prd.md` w strukturze poniżej. Zapisz do repo uczestnika jako `prd.md`
   (1 plik, **bez** date-prefixa — to live dokument przez cały tydzień).
5. Po wygenerowaniu: pokaż §6 Out of scope i §7 Open Questions wprost — to są dwie
   sekcje, które najczęściej ratują deadline. Zaproponuj przejście do Fazy 3 (dekompozycja).

## Struktura `prd.md` — 8 sekcji (9 dla Track Builder), ≤ 2 strony

Każda sekcja **maksymalnie pół strony**. Jeśli sekcja nie ma treści, napisz "n/d" —
nie watuj. To jest świadomie odchudzony PRD (pełny 8-sekcyjny PRD dla klienta żyje w
[[software-delivery-playbook]] §3; tutaj insighty W1/W2 dostarczają większość treści).

§1-§8 są zawsze. **§9 Component Inventory generujesz wyłącznie dla Track Builder** —
patrz warunek pod §8. Track Tech zostaje przy 8 sekcjach.

### Header block (zawsze, przed §1)

Dokument otwiera blok nagłówkowy — wszystkie bazowe informacje zwięźle w jednym miejscu,
żeby każdy (founder, Paweł, agent) wiedział od pierwszej linii co to jest i do czego służy:

```markdown
# PRD — <NAZWA> (MVP 7 dni)

> **Cel dokumentu:** Spiąć input z Week 1 / Week 2 w wykonalny PRD pod 7-dniowe MVP.
> **Track / Stack:** <Track Tech: Claude Code + Next.js 15 + Supabase + Vercel | Track Builder: Lovable/v0 + Supabase + Vercel>
> **Data:** <YYYY-MM-DD> · **Status:** live dokument (aktualizowany przez W3)
```

### §1 — Problem-Solution Fit + Value Proposition

Jeden akapit. **Przepisz 1:1 z LP Week 2 / W1, nie reformułuj** — copy z LP jest już
zwalidowany, Twoja parafraza tylko wprowadzi drift. Dodaj na końcu **AI Build Summary**:
jedno zdanie w trybie rozkazującym, machine-readable, dla agenta.

> AI Build Summary (przykład): "Zbuduj aplikację web Next.js 15 + Supabase, w której
> junior dev loguje się Google, przegląda mentorów, rezerwuje 30-min slot i dostaje
> link do Zoom. Bez płatności realnych w V1 (fake checkout). Musi działać pod publicznym URL."

To zdanie to pierwsza rzecz, którą agent czyta — odpowiada "co budować i jaki jest
najtwardszy constraint", zanim dotknie ekranów.

### §2 — ICP + 1 persona

Z W2 (i Discovery W1 jeśli było). Jedna persona, nie pięć. Kto i **dlaczego jest
zdesperowany** — desperacja klienta to paliwo MVP. Max 4-5 zdań.

### §3 — Core Flow (TO jest cały scope V1)

Serce dokumentu. **Dokładnie jedna** user story end-to-end z acceptance criteria.

**Job to Be Done** (rama, która chroni przed technically-correct-but-wrong):
> "Gdy [sytuacja], chcę [motywacja], żeby [oczekiwany rezultat]."

**User story:**
> "Jako [rola] chcę [akcja], żeby [korzyść]."

**Flow tekstowo** (na poziomie ekranów — nie potrzebujesz Figmy):
> Ekran A (login) → Sign in z Google → Ekran B (lista X) → klik item → Ekran C (detail + akcja Y) → potwierdzenie

**Acceptance criteria** (binarne, pass/fail — tak żeby agent/QA zweryfikował bez
dwuznaczności; "działa poprawnie" to NIE kryterium):
- [ ] ...
- [ ] Edge case: [opis]
- [ ] Error state: [co się dzieje gdy X zawiedzie]

### §4 — Data model (3-5 encji MAX)

Kształt danych, które Core Flow tworzy/czyta/zmienia. Tyle precyzji, żeby agent
wygenerował schema bez zgadywania. Track Tech → interfejsy TypeScript z komentarzami
przy nieoczywistych polach; Track Builder → tabele Supabase opisane słownie (nazwa,
pola, typy, relacje FK). Jeśli encji > 5 → prawie na pewno scope za szeroki, wróć do §3.

### §5 — Tech stack lock (Track + wersje)

**Decyzja zalockowana — zmiana w środku tygodnia = restart.** Wybierz JEDEN track:

| | Track Tech | Track Builder |
|---|---|---|
| Stack | Claude Code + Next.js + Supabase + Vercel + shadcn/ui | Lovable/v0 + Supabase + Vercel |
| Dla kogo | Founder-tech, długi runway kodu | Founder-biznes, MVP-do-walidacji |

Wymień **konkretne wersje** (Next.js 15, nie "latest" — "latest" sprawia, że agent
łapie breaking changes). Track determinuje §4 i całą Fazę 4.

**Brand reference (podsekcja §5, zawsze):** wklej do PRD esencję informacji brandowych —
konkretne HEX-y, font names, 1-2 zdania voice & tone i dla kogo ten styl jest
(dopasowanie do ICP z §2) — **niezależnie skąd przyszły** (osobny plik brandowy, sekcja
w briefie LP, fragment notatek). PRD ma być **samowystarczalny dla agenta**: w Fazie 4
agent dostaje często sam `prd.md` + prompt, a bez brandu w dokumencie generuje generic
UI, który nie pasuje do LP. Nie kopiuj całej specyfikacji brandu — esencja, 5-8 linii.
Jeśli brandu nie ma w żadnym materiale → to pozycja do dopytania (Open Question / pytanie
do foundera), nie do zmyślenia.

### §6 — Out of scope (min. 5 rzeczy, które kuszą ale NIE wchodzą)

Najważniejsza sekcja po §3. Wymień konkretnie co NIE wchodzi do V1: auth wieloma
metodami, role/permissions, admin panel, realne płatności, powiadomienia email,
wyszukiwarka, itd. — chyba że jedno z nich JEST Core Flow. Bez tej sekcji masz scope
creep w D4 i zagrożony deadline.

### §7 — Open Questions (decyzje wymagające inputu — agent ma PYTAĆ, nie zgadywać)

Lista decyzji, których agent nie podejmuje sam: wybór konkretnego providera/SaaS
oznaczonego TBD, treści marketingowe, cokolwiek poza stack lockiem §5. Każda pozycja
z ownerem (Ty / Paweł). W Fazie 4 agent przerywa właśnie na tych punktach.

### §8 — Definition of Done MVP V1 (boolean checklist)

Sprawdzalne haczyki, nie "MVP gotowe":
- [ ] Production URL działa publicznie (incognito → core flow przechodzi)
- [ ] Core Flow §3 pass smoke test end-to-end
- [ ] Mobile responsive (≥375px)
- [ ] Analytics events firują / hooks na miejscu (`data-analytics-event` na core przyciskach)
- [ ] [dodatkowe per projekt]

### §9 — Component Inventory (TYLKO Track Builder)

**Generuj tę sekcję wyłącznie gdy §5 lock = Track Builder.** Pomiń ją całkowicie dla
Track Tech — tam shadcn/ui komponuje komponenty sam z user flow §3, osobna lista to
narzut bez zwrotu.

Dlaczego dla Buildera tak: Lovable/v0 generują UI **na poziomie pojedynczego komponentu**,
więc płaska, wyliczalna lista to dla nich gotowy build-brief. Bez niej generujesz
ekran-po-ekranie i gubisz empty/error states.

Wymień każdy znaczący element UI Core Flow §3: formularze, karty, modale, przyciski,
nawigację, empty states, error states. Mapuj do user story:

| Komponent | Typ | Opis | Story |
|---|---|---|---|
| [nazwa] | Form / Layout / Action / Display / Navigation / Modal | co robi | US1 |

**Obowiązkowo: instrukcja użycia dla foundera.** Pamiętaj, że czyta to osoba
nietechniczna — sekcja §9 w wygenerowanym PRD musi zaczynać się od 2-3 zdań prostym
językiem JAK z niej korzystać i PO CO, np.:

> *Jak używać tej listy: buduj w Lovable po jednym komponencie naraz, w kolejności
> z tabeli — opisz narzędziu pojedynczy wiersz (nazwa + opis + brand), obejrzyj wynik,
> dopiero potem bierz następny. Dlaczego: prosząc o cały ekran naraz tracisz kontrolę
> i Lovable pomija stany puste/błędów. Kolumna "Story" mówi, którą część Core Flow
> z §3 dany komponent realizuje — jak komponent nie mapuje się na story, to znak,
> że nie jest potrzebny w V1.*

Żargon bez wyjaśnienia ("każdy wiersz = jeden prompt", "mapuje do US1") zostawia
foundera z pytaniem "co mam z tym zrobić?" — i sekcja idzie do kosza.

## Handoff do Fazy 3

Po akceptacji `prd.md` następny krok to dekompozycja Core Flow §3 na **3-5 sekwencyjnych
goals** (`goals.md`): G1 foundation → G2 data → G3 core flow UI → G4 integration/edge
→ G5 deploy + analytics. Każdy goal potem leci przez `/prepare-goal` → `/goal` (Track Tech)
lub jako milestone w narzędziu (Track Builder). Zaproponuj to przejście usera, ale samej
dekompozycji nie rób w tym skillu — to osobny krok playbooka §5.

## Anti-wzorce (czego NIE robić)

- ❌ PRD na 8 stron jak dla zewnętrznego klienta → agent dryfuje, 7 dni nie wystarczy
- ❌ Core Flow = 3 user stories "bo wszystkie ważne" → 1 dobrze > 3 źle
- ❌ Brak §6 Out of scope → scope creep w D4
- ❌ Reformułowanie value proposition z LP zamiast 1:1 → drift od zwalidowanego copy
- ❌ Stack "latest" zamiast wersji → breaking changes w trakcie buildu
- ❌ Generowanie PRD z pustych/szczątkowych materiałów (zgadywanie W1/W2) → generic MVP nie pasujący do LP
- ❌ Upieranie się przy pliku o konkretnej nazwie zamiast czytania treści, którą founder dostarczył (1 plik czy 10 — bez znaczenia)
- ❌ Data model na 10 encji → znak że scope §3 za szeroki, wróć i tnij

## Format odpowiedzi

1. (Jeśli brak inputu) 1-2 pytania o ścieżkę pliku albo brakujące elementy W1/W2
2. (Jeśli widzisz za szeroki scope) jawna propozycja cięć: co → Out of scope i dlaczego
3. Wygenerowany `prd.md` zapisany do repo + krótkie podsumowanie cięć scope'u
4. Wskazanie §6 i §7 + propozycja przejścia do Fazy 3 (dekompozycja na goals)

Bez długich wstępów. Bez powtarzania całego inputu W1/W2.
