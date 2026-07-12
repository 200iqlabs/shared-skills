---
name: prepare-openspec-goal
description: "Przygotowuje gotowy tekst completion condition dla komendy /goal w Claude Code (v2.1.139+),
  dostosowany do implementacji OpenSpec change. Bierze nazwę changu z openspec/changes/<name>/
  i produkuje sformułowanie, które ewaluator (mały model, Haiku) potrafi sprawdzić z samego
  transkryptu rozmowy. Triggeruje WYŁĄCZNIE na komendę /prepare-openspec-goal — nie auto-triggeruj
  na keywords typu 'goal', 'openspec', 'change'. Używaj gdy user pisze
  /prepare-openspec-goal <change-name> i chce sformułować warunek zakończenia dla autonomicznej
  pętli /goal implementującej openspec change."
license: Apache-2.0
---

# /prepare-openspec-goal — completion condition dla implementacji OpenSpec change

Produkuje gotowy tekst do wklejenia po `/goal ...`, sformatowany pod implementację konkretnego
OpenSpec change (`openspec/changes/<name>/`). Ewaluator (mały model) **nie uruchamia narzędzi** —
ocenia tylko to, co Claude wkleił do rozmowy, więc condition musi wymuszać pokazywanie
weryfikowalnych dowodów w wiadomościach.

## Invocation

```
/prepare-openspec-goal <change-name>
/prepare-openspec-goal                 → poproś usera o nazwę changu (lista z openspec/changes/)
```

## Co to jest /goal (kontekst, skrót z docs)

`/goal <condition>` — autonomiczna pętla: po każdej turze Haiku sprawdza condition vs transkrypt.
Brak spełnienia → kolejna tura. Spełnione → goal clear. Limit 4000 znaków. Działa w trybie
headless: `claude -p "/goal ..."`.

Pełna dokumentacja: https://code.claude.com/docs/en/goal

## Anatomia goalu dla OpenSpec change (5 elementów)

1. **Identyfikacja changu** — pełna ścieżka `openspec/changes/<name>/`, żeby ewaluator
   widział o czym mowa i Claude miał konkretny scope.
2. **End state** — wszystkie taski w `tasks.md` mają `- [x]`, `openspec validate <name> --strict`
   exit 0, `pnpm typecheck` + `pnpm lint` exit 0. Liczbowo: 0 unchecked items.
3. **Proof in transcript** — Claude w ostatniej wiadomości wkleja:
   - output `grep -c "^- \[ \]" openspec/changes/<name>/tasks.md` pokazujący `0`
   - output `openspec validate <name> --strict` z `valid` / exit 0
   - output `pnpm typecheck` z exit 0
   - listę zmienionych plików (`git diff --name-only main...HEAD`) i potwierdzenie że wszystkie
     mieszczą się w scope changu (nie ruszone obce featury)
4. **Constraints** — nie ruszamy plików spoza scope changu (poza `openspec/changes/<name>/`
   i plików wymienionych w tasks.md / specs/ deltas); inne testy w repo nadal przechodzą;
   nie modyfikujemy archived changes ani innych aktywnych changes.
5. **Turn/time bound** — `or stop after N turns`. Default:
   - small change (≤10 tasków, brak design.md): **20 tur**
   - medium (10–25 tasków, jest design.md): **40 tur**
   - large (>25 tasków, wiele plików): **60 tur** + zasugeruj rozbicie na sekwencję

## Workflow

### Krok 1: Sparsuj nazwę changu

Sprawdź czy `openspec/changes/<name>/` istnieje. Jeśli nie — zaproponuj `ls openspec/changes/`
i poproś o wybór. Jeśli user nie podał nazwy — zrób listing i zapytaj.

### Krok 2: Quick audit changu (decyduje o bound i rozbiciu)

Sprawdź:
- `wc -l openspec/changes/<name>/tasks.md` i `grep -c "^- \[ \]" openspec/changes/<name>/tasks.md`
  → liczba tasków
- Czy istnieje `openspec/changes/<name>/design.md` → sygnał complexity
- Czy istnieje `openspec/changes/<name>/specs/` z deltami → ile spec capabilities ruszamy
- `head -20 proposal.md` → jakiego rzędu zmiana (UI refactor / DB migration / new feature)
- **`grep "^## " openspec/changes/<name>/tasks.md`** → lista sekcji H2 (potrzebne do kroku 2a)

Sygnały do rozbicia na sekwencję `/goal A` → `/goal B`:
- >40 unchecked tasków
- design.md wymienia wiele etapów (np. "Phase 1 / Phase 2")
- tasks.md ma top-level sekcje, które dało się robić niezależnie (refactor + migracja + testy)

W razie wątpliwości — zaproponuj rozbicie sekwencyjne po sekcjach H2 w tasks.md.

### Krok 2a: Wykryj sekcje nieweryfikowalne z transkryptu (OBOWIĄZKOWE)

Z listy sekcji H2 oznacz jako **nieweryfikowalne** każdą zawierającą (case-insensitive)
któreś ze słów-kluczy:

`manual`, `manualny`, `manualnie`, `devtools`, `wizualnie`, `visual`, `QA`,
`smoke test`, `smoke audyt`, `weryfikacja przed mergem`, `merge`, `pre-merge`,
`changelog`, `release notes`, `screenshot`, `responsywność` (gdy w kontekście
otwierania w przeglądarce)

Reguła: **wyklucz te sekcje z goala**. Ewaluator (Haiku) nie umie ocenić z transkryptu
„wygląda dobrze na 768×600", „PR description napisane", „smoke test na devie zielony" —
Claude może to tylko gołosłownie zadeklarować, co psuje całą pętlę.

Wymień te sekcje userowi jawnie pod blokiem `/goal` jako *do-it-yourself po zakończeniu pętli*.
Jeśli **wszystkie** sekcje są nieweryfikowalne (np. change typu „manual QA round") — powiedz
userowi że `/goal` nie jest właściwym narzędziem; lepszy `/loop` z manualnym potwierdzeniem
albo zwykły review.

### Krok 3: Wygeneruj output

**Default:** condition zawsze zaczyna się od `start by invoking /opsx:apply <name> to drive
the implementation, then continue until: <proof template>`.

Powód: `/goal` standalone bez `/opsx:apply` na świeży OpenSpec change traci całą wiedzę
domenową skilla `/opsx:apply` (konwencje update'u `specs/` deltas, kolejność czytania
artifacts, patterns zaznaczania tasków). Bez tego dostajesz gorszy `/opsx:apply` z narzutem
pasting evidence w każdej turze.

**Edge case bez `/opsx:apply`:** TYLKO gdy user jawnie mówi „dokończ resztki" — wcześniej
odpalał `/opsx:apply` interaktywnie, urwał na limicie kontekstu, część tasków zaznaczona.
Wtedy condition zaczyna się od `continue implementing remaining unchecked tasks of
openspec/changes/<name>/: ...`. Zob. „Edge case: finishing leftovers" niżej.

Format wyjścia (zawsze ten sam):

````
```
/goal <condition tekst>
```

**Change:** openspec/changes/<name>/ (<N> tasków, design.md: yes/no)
**Co ewaluator sprawdza w transkrypcie:** <2-3 zdania konkretnie jakie outputy muszą wpaść>
**Bound:** <N tur — uzasadnienie z auditu>
**Sugerowana sekwencja (jeśli stosowne):** <opis rozbicia>
````

### Krok 4: Wskaż jak odpalić

Po bloku komendy dorzuć jednolinijkową podpowiedź:
- interaktywnie: wklej do Claude Code w tym repo
- headless: `claude -p "/goal ..."` (przyda się przy długich tureach w tle)

Zalecenie: jeśli change jest świeży (tasks.md w pełni `- [ ]`), zasugeruj odpalić goal
**po** uruchomieniu `/opsx:apply <name>` albo zaszyć invocation w samym condition
(zob. przykład 2).

## Przykład 1 — mały change UI

**User:** `/prepare-openspec-goal fix-modal-responsiveness`

**Audit:** 18 tasków, 4 niezaznaczone sekcje (Primitive / Refactor x2 / Audit), jest design.md,
zasięg: `packages/ui/src/shadcn/dialog.tsx` + 4-6 plików w `apps/web/.../photo-shoot/_components/`.

**Output:**

```
/goal start by invoking /opsx:apply fix-modal-responsiveness to drive the implementation, then continue until: every checkbox in openspec/changes/fix-modal-responsiveness/tasks.md is marked [x] (you prove this by pasting the output of `grep -c "^- \[ \]" openspec/changes/fix-modal-responsiveness/tasks.md` showing 0 in your final message); `openspec validate fix-modal-responsiveness --strict` exits 0 and you paste the final lines of its output; `pnpm --filter web typecheck` exits 0 and you paste the last 5 lines; `pnpm --filter web lint` exits 0 and you paste the last 5 lines; the diff stays within scope — you paste `git diff --name-only main...HEAD` and the only paths touched are openspec/changes/fix-modal-responsiveness/**, packages/ui/src/shadcn/dialog.tsx, and files under apps/web/app/home/[account]/content-generation/photo-shoot/_components/ (no archived openspec changes, no other active changes, no unrelated features modified); or stop after 30 turns
```

**Change:** openspec/changes/fix-modal-responsiveness/ (18 tasków, design.md: yes)
**Co ewaluator sprawdza:** ostatnia wiadomość Claude'a musi zawierać 4 outputy komend (grep tasków = 0, openspec validate, typecheck, lint) + listę zmienionych plików zawężoną do dialog primitive i photo-shoot components.
**Bound:** 30 tur — medium change, design.md jest ale tasks są krótkie i mechaniczne.

### Headless

```
claude -p "/goal implement openspec change at openspec/changes/fix-modal-responsiveness/: ..."
```

## Przykład 2 — edge case: finishing leftovers (BEZ `/opsx:apply`)

Scenariusz: user wcześniej odpalił `/opsx:apply add-failed-jobs-retry` interaktywnie,
zrobił ~70% tasków, urwał (limit kontekstu / koniec dnia). Teraz chce autonomiczne
dokończenie reszty. Tu `/opsx:apply` w pierwszej turze nie ma sensu — zacząłby od początku.

```
/goal continue implementing remaining unchecked tasks of openspec/changes/add-failed-jobs-retry/ (tasks.md already has partial progress — pick up from first `- [ ]` and continue) until: every checkbox in openspec/changes/add-failed-jobs-retry/tasks.md is [x] (prove by pasting `grep -c "^- \[ \]" openspec/changes/add-failed-jobs-retry/tasks.md` = 0); `openspec validate add-failed-jobs-retry --strict` exits 0 (paste output); `pnpm --filter web typecheck` exits 0 (paste tail); diff stays within openspec/changes/add-failed-jobs-retry/** plus files listed in the change's tasks.md (paste `git diff --name-only main...HEAD`); or stop after 25 turns
```

**Kiedy ten wariant:** TYLKO gdy user jawnie powie „dokończ resztki" / „pick up where I left off"
/ „pozostałe taski". W każdym innym przypadku — default z `/opsx:apply` w pierwszej turze.

## Przykład 2a — change z manual QA / merge ritual sekcjami

**User:** `/prepare-openspec-goal fix-modal-responsiveness`

**Audit:** 37 unchecked, 0 checked, 8 sekcji H2, design.md: yes.
Sekcje: `1. Primitive` / `2. Refactor Configure Photo Shoot` / `3. Refactor uploader` /
`4. Audyt sąsiednich modali` / `5. Smoke audyt poza content-generation` /
`6. Manualny test responsywności` / `7. Docs i konwencja` / `8. Weryfikacja przed mergem`.

**Krok 2a:** sekcja 6 (słowo `Manualny`) i sekcja 8 (`Weryfikacja przed mergem`,
`merge`) → **nieweryfikowalne, wyłącz z goala**. Sekcja 5 (`Smoke audyt`) — w tasks
opisana jako otwarcie modali w devtools → **też wyłącz**.

Mechaniczne sekcje do pętli: 1, 2, 3, 4, 7.

**Output:**

```
/goal start by invoking /opsx:apply fix-modal-responsiveness to drive the implementation, focusing only on sections 1, 2, 3, 4, 7 of tasks.md (skip sections 5, 6, 8 — those are manual QA / merge ritual handled outside this loop), then continue until: every `- [ ]` under headings "## 1.", "## 2.", "## 3.", "## 4.", "## 7." in openspec/changes/fix-modal-responsiveness/tasks.md is now `- [x]` (prove this by pasting the output of `awk '/^## (1|2|3|4|7)\./{p=1} /^## (5|6|8)\./{p=0} p' openspec/changes/fix-modal-responsiveness/tasks.md | grep -c "^- \[ \]"` showing 0 in your final message); `openspec validate fix-modal-responsiveness --strict` exits 0 and you paste the final lines; `pnpm --filter web typecheck` exits 0 and you paste the last 5 lines; `pnpm --filter web lint` exits 0 and you paste the last 5 lines; you paste `git diff --name-only main...HEAD` and the only paths touched are openspec/changes/fix-modal-responsiveness/**, packages/ui/src/shadcn/dialog.tsx, and files under apps/web/app/home/[account]/content-generation/photo-shoot/_components/ (no archived openspec changes, no other active changes, no unrelated features modified); or stop after 40 turns
```

**Change:** openspec/changes/fix-modal-responsiveness/ (37 tasków, design.md: yes)
**Mechaniczne sekcje w pętli:** 1, 2, 3, 4, 7
**Nieweryfikowalne — zrób ręcznie po /goal:** sekcja 5 (smoke audyt w devtools),
sekcja 6 (manualny test responsywności w 4 rozdzielczościach), sekcja 8
(merge checklist + changelog entry — zob. `CLAUDE.md` Changelog Process).
**Co ewaluator sprawdza:** awk-filtered grep tasków = 0 dla {1,2,3,4,7}, validate, typecheck, lint, git diff zawężony do dialog + photo-shoot.
**Bound:** 40 tur — mechaniczne taski (zamiana klas), 5 sekcji × średnio 4 taski.

### Awk pattern — filtrowanie tasks.md po sekcjach

Wybrane sekcje (include): `awk '/^## (1|2|3|4|7)\./{p=1} /^## (5|6|8)\./{p=0} p' tasks.md`

Wzór:
- `/^## (A|B|C)\./{p=1}` — przy nagłówku z numerów do **włączenia** podnieś flag
- `/^## (X|Y|Z)\./{p=0}` — przy nagłówku z numerów do **wyłączenia** opuść flag
- `p` — drukuj linie gdy flag = 1

Wszystkie numery sekcji (1–8) muszą wpaść do jednego z dwóch wzorców, inaczej `awk`
przestanie filtrować na końcu zakresu.

## Przykład 3 — large change → sekwencja

**User:** `/prepare-openspec-goal e2e-test-expansion`

**Audit:** 60+ tasków, sekcje H2 podzielone na: setup fixtures / billing flows / team flows
/ admin flows / CI integration. Każda sekcja > 10 tasków.

**Output (zamiast jednego /goal):**

```
# Sekwencja 4 goali — każda sekcja osobno

# 1) setup fixtures
/goal start by invoking /opsx:apply e2e-test-expansion focusing only on section "## 1." of tasks.md, then continue until: every `- [ ]` under heading "## 1." is now `- [x]` (paste `awk '/^## 1\./,/^## 2\./' openspec/changes/e2e-test-expansion/tasks.md | grep -c "^- \[ \]"` = 0); `pnpm --filter web-e2e exec playwright test --list` exits 0 (paste tail); diff touches only apps/e2e/** and openspec/changes/e2e-test-expansion/**; or stop after 25 turns

# 2) billing flows  (odpal po zaliczeniu #1)
/goal ... (analogicznie dla sekcji 2.)

# 3) team flows
/goal ...

# 4) finalize: validate + typecheck + lint full
/goal openspec validate e2e-test-expansion --strict exits 0 (paste output); pnpm typecheck exits 0 (paste tail); pnpm lint exits 0 (paste tail); `grep -c "^- \[ \]" openspec/changes/e2e-test-expansion/tasks.md` = 0 (paste output); or stop after 15 turns
```

**Dlaczego sekwencja:** 60 tasków w jednym goalu = wysoka szansa na zgubienie wątku przez
evaluatora i przekroczenie bound. Mniejsze cele = krótsze konteksty + łatwiejsze sprawdzanie.

## Anti-wzorce specyficzne dla OpenSpec

- ❌ **`/goal` bez `/opsx:apply` w pierwszej turze** na świeży change — tracisz domain
  knowledge skilla apply (konwencje update'u `specs/`, kolejność czytania artifacts).
  Wyjątek: scenariusz „finishing leftovers" (zob. Przykład 2).
- ❌ "all tasks done" bez wymuszenia `grep -c "^- \[ \]" = 0` — ewaluator nie widzi `tasks.md`
- ❌ pominięcie `openspec validate --strict` — change z brakującymi spec deltami przejdzie
  "all checked" ale nie jest gotowy do archive
- ❌ brak `git diff --name-only` w proof — Claude może niechcący ruszyć inne pliki
  (typowo: `apps/e2e/.env`, package.json lockfile) i nikt tego nie wyłapie
- ❌ doklejanie do goala "and run `/opsx:archive`" — archive ma osobny ritual (changelog,
  commit message, walidacja), nie pakuj tego w pętlę autonomiczną
- ❌ Condition > 4000 znaków — przy dużych changes łatwo przekroczyć; wtedy sekwencja

## Edge cases

- **Change ma już część tasków zaznaczonych:** condition zostaje ten sam (`grep = 0`),
  evaluator policzy tylko niezaznaczone. Wspomnij to userowi w wyjaśnieniu.
- **Change tylko docs/spec (brak kodu):** pomiń `pnpm typecheck`/`lint` z proof — zostaw
  `openspec validate --strict` + `grep tasks = 0`. Bound: 10 tur.
- **Change wymaga migracji DB:** dorzuć do proof `pnpm --filter web supabase migrations up`
  exit 0 i `pnpm supabase:web:typegen` exit 0 (paste tail).
- **Change w worktree:** w condition użyj ścieżki `openspec/changes/<name>/` tak samo —
  worktree dzieli openspec/ z main checkoutem (sprawdź `git status` przed goalem).
- **Brak design.md, ale tasks.md > 30:** poproś usera o decyzję — sekwencja czy mimo wszystko
  jeden goal z bound 50 tur.

## Format odpowiedzi (zawsze ten sam)

1. (Opcjonalnie) jedno pytanie jeśli nazwa changu nieznana / change nie istnieje
2. Quick audit changu (2-3 linijki: liczba tasków, design.md y/n, scope plików z proposal.md)
3. **Lista sekcji H2** z oznaczeniem które są mechaniczne (w goalu) a które nieweryfikowalne (DIY)
4. Blok z gotową komendą `/goal ...` (z `awk`-filtrem jeśli wykluczamy sekcje)
5. 4 linijki: change ID + mechaniczne sekcje + DIY sekcje + co ewaluator sprawdza + bound
6. (Jeśli stosowne) propozycja rozbicia na sekwencję
7. Jednolinijkowa podpowiedź headless

Bez długich wstępów. Bez powtarzania proposal.md.
