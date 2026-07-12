---
description: Walk through an OpenSpec design.md topic by topic, one heading at a time, in plain Polish — accept to continue, ask to go deeper
---

# Explain design

Cel: przeprowadzić użytkownika **temat po temacie** przez plik `design.md` zmiany OpenSpec, **jeden nagłówek = jedna odpowiedź**, prostym polskim — tak żeby zrozumiał każdą decyzję i jej powód w spokojnym tempie, bez ściany tekstu.

Opcjonalny zakres: `$ARGUMENTS` (nazwa changu albo ścieżka do `design.md`). Jak pusto → wykryj aktywny change.

## Ustal plik (z `$ARGUMENTS`)

1. **Nazwa changu** → `openspec/changes/<name>/design.md`.
2. **Pusto** → wykryj:
   - jeden change w `openspec/changes/` (poza `archive/`) z `design.md` → użyj go,
   - kilka → wypisz listę i zapytaj **który** (jedno pytanie, nie zgaduj),
   - jeśli jakiś `design.md` jest już w kontekście tej rozmowy → użyj tego.
3. **Ścieżka do `design.md`** (istnieje na dysku) → użyj wprost.

Jak w changu nie ma `design.md` → powiedz wprost (może być tylko `proposal.md` / `tasks.md`), zaproponuj inny plik albo zakończ. Nie wymyślaj treści.

## Cięcie na tematy (każdy nagłówek = jeden temat)

Najpierw przeczytaj cały `design.md` i policz tematy. Tnij **najdrobniej**, w kolejności z pliku:

1. `## Context` → 1 temat
2. `## Goals / Non-Goals` → 1 temat
3. `## Decisions` → **każda** `### N. <tytuł>` to **osobny** temat
4. `## Risks / Trade-offs` → każde ryzyko osobno (albo jako jeden temat, jeśli krótkie/jest ich mało)

Policz wszystkie i numeruj `temat X z N`. Struktura nagłówków może się różnić między plikami — trzymaj zasadę „każdy nagłówek to temat", nie sztywną listę powyżej.

## Cel: edukacja / gloss

- **Audytorium:** doświadczony programista (15+ lat), ale nowy w JS/TS i części narzędzi. Fundamentów (wzorce, architektura, koncepcje) nie tłumacz od zera.
- **Gloss tylko terminy infra / tooling / framework** przy **pierwszym** użyciu — np. „Redis (szybka baza klucz–wartość w pamięci)", „WYSIWYG (edytor pokazujący od razu sformatowany tekst, nie surowy markdown)", „UUID v4 (losowy 128-bitowy identyfikator, praktycznie nie do zgadnięcia)". Gdy termin wraca — sam termin.
- Nie glossuj ogólnego CS. Tłumacz **sens decyzji i jej powód**, nie definicje z podręcznika.

## Format jednego tematu

**Decyzja** (`### N. ...`) — dokładnie taki blok:

```
**Decyzja 3: Milkdown jako edytor WYSIWYG**  (temat 5 z 11)

- O co chodzi: jedno zdanie prostym językiem.
- Czemu tak: 2–3 zdania — powód po ludzku.
- Co odrzucono / trade-off: krótko, jak w pliku jest alternatywa albo kompromis.

_OK = następny temat • albo zadaj pytanie_
```

**Sekcja ramowa** (Context / Goals / Non-Goals / Risks):

```
**Context**  (temat 1 z 11)

W skrócie: 2–4 zdania o czym ta sekcja i czemu ważna.

_OK = następny temat • albo zadaj pytanie_
```

**Otwarta kwestia** (gdy temat to realnie nierozstrzygnięta rzecz — TODO, „?", „do ustalenia", wariant bez wyboru):
- nie udawaj, że to wyjaśniona decyzja,
- powiedz wprost „to jeszcze otwarte",
- **dodaj swoją rekomendację** (jedną, z krótkim uzasadnieniem),
- czekaj na decyzję użytkownika — pojedynczo, jeden temat naraz.

Stopka `_OK = następny temat • albo zadaj pytanie_` pod **każdym** tematem.

## Pętla interakcji (rdzeń)

Komunikacja **free-text**, NIE `AskUserQuestion`.

1. **Start:** jedna linijka — który plik i ile tematów, np.
   „`design.md` changu `publish-document`: 11 tematów, idę po kolei." → potem **od razu temat 1**.
2. Pokaż **jeden** temat (format wyżej). **Zatrzymaj się i czekaj.**
3. Odpowiedź użytkownika:
   - `OK` / `dalej` / `next` / kciuk → następny temat.
   - **Cokolwiek innego = pytanie** → odpowiedz prosto i konkretnie, **zostań na tym samym temacie**, na końcu znów stopka, czekaj.
   - Jeśli to była otwarta kwestia i użytkownik podał decyzję → zanotuj wybór i przejdź dalej.
4. **Nie przechodź dalej bez akceptacji.** Jeden temat wisi aż padnie `OK` (albo decyzja przy otwartej kwestii).
5. **Koniec** (po ostatnim temacie): krótka mapa — każda decyzja jednym zdaniem + jedno-dwa zdania o ogólnym sensie całego designu (+ ewentualne decyzje, które użytkownik podjął po drodze). Potem **stop** (nie implementuj, chyba że poprosi).

## Język i forma

- **Po polsku**, krótko, po ludzku. Termin techniczny nazwany + gloss w nawiasie przy 1. użyciu (tylko infra/tooling — patrz wyżej).
- **Jeden temat = jedna odpowiedź.** Nigdy nie zrzucaj kilku tematów naraz ani całej listy „omów wszystko" — pojedynczość to sens komendy.
- Odpowiedź jak najkrótsza; przy pytaniu drąż tyle, ile trzeba, ale zostań przy temacie.
- Nie implementuj i nie zmieniaj plików — to komenda do czytania i zrozumienia designu.

## Zasady

- Jeden temat na odpowiedź. Pytanie ≠ akceptacja — bez `OK` nie idź dalej.
- Realnie otwarte kwestie z pliku → flaguj i dawaj rekomendację, nie udawaj decyzji.
- Gloss tylko terminy specyficzne (infra/tooling/framework), nie ogólny CS — audytorium to senior z innych języków.
- Nie wymyślaj tematów ani treści, których nie ma w `design.md`.
