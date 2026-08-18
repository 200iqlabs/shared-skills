---
description: Restate what this session is working on, what it is for, where it has got to, and what (if anything) is wanted from the user — in plain Polish
---

# Orientation

Cel: w jednej krótkiej odpowiedzi odtworzyć wątek sesji. Dwie sytuacje, w których się tego używa:

- użytkownik nie zrozumiał poprzedniej odpowiedzi,
- użytkownik wraca do sesji po przerwie i nie pamięta, na czym stanęliście.

Opcjonalny zakres: `$ARGUMENTS`. Pusto → cała bieżąca sesja.

Działa **niezależnie od trybu pracy** (`/ss:working-mode`). Jeśli tryb jest wyłączony, ta komenda
i tak odpowiada po polsku i i tak trzyma się poniższych zasad — po to została wywołana.

## Odpowiedz na cztery rzeczy

Zawsze w tej kolejności, każda krótko:

```
**Gdzie jesteśmy:** <nad czym pracujemy — jedna linia>
**Po co:** <co to daje w praktyce — jedna linia>
**Stan:** <co jest zrobione i potwierdzone, co jest w trakcie>
**Od ciebie:** <czego potrzebuję — albo wprost, że niczego>
```

Jeśli niczego nie potrzebujesz od użytkownika, powiedz to wprost i nazwij, co robisz dalej —
`Od ciebie: nic. Lecę dalej z <X>.` Cisza w tym miejscu czyta się jak ukryte oczekiwanie i
zatrzymuje pracę bez powodu.

## Streszczenie, nie powtórka

Długość ma wynikać ze **stanu pracy**, nie z liczby kroków, które do niego doprowadziły. Po
trzygodzinnej sesji z czterdziestoma wywołaniami narzędzi orientacja może mieć pięć linijek — i
zwykle powinna.

Nie odtwarzaj transkryptu, nie wyliczaj wywołań narzędzi, nie opowiadaj przebiegu. Szczegół
techniczny wchodzi tylko wtedy, gdy zmienia to, co użytkownik zrobi za chwilę. Jeśli nie zmienia —
wypada.

To nie jest też druga próba wytłumaczenia poprzedniej odpowiedzi. Jeśli użytkownik jej nie
zrozumiał, powtórzenie jej innymi słowami nie pomoże — cofnij się i powiedz, nad czym w ogóle
pracujecie i po co.

## Stan opisuj zweryfikowany, nie zamierzony

Rozdziel trzy rzeczy: **zrobione i sprawdzone**, **zrobione ale niesprawdzone**, **zaplanowane**.
Krok, który się wykonał, ale którego wyniku nikt nie sprawdził, opisz jako niesprawdzony — nie
jako gotowy. To jest dokładnie ten moment, w którym optymistyczny raport kosztuje później godzinę.

Jeśli część zakresu została pominięta — nazwij ją i powiedz dlaczego. Pominięcie, o którym
użytkownik się nie dowie, wraca jako niespodzianka na końcu.

## Routing: nie wypisuj tu zaległości

Orientacja mówi **ile** czegoś czeka, a nie **co** — wyliczanie tego tutaj robi z niej właśnie tę
ścianę tekstu, przed którą ma chronić.

- **Decyzje** (użytkownik ma coś wybrać) → powiedz ile ich jest i przejdź do `/ss:decisions`,
  które bierze je pojedynczo.
- **Zadania** (użytkownik ma coś zrobić) → powiedz ile ich jest i przejdź do umiejętności
  `ss:task-delegation`, która podaje pierwsze i czeka.
- **Jedno i drugie** → najpierw decyzje: zadanie oparte na nierozstrzygniętym wyborze często
  przestaje być potrzebne.

Jedno zadanie albo jedna decyzja to nadal routing, nie wyjątek — przekazujesz je tym samym torem.

## Zasady

- Po polsku, zwykłym językiem, bez żargonu. Termin, którego nie da się uniknąć, glosujesz w
  nawiasie przy pierwszym użyciu.
- Cztery bloki, zawsze te same etykiety. Stały kształt jest po to, żeby dało się go znaleźć wzrokiem
  przy przewijaniu.
- Nie zaczynaj tu nowej pracy. Orientacja kończy się stanem i routingiem, nie implementacją.
