# Wytyczne Cenowe
## Filozofia "Value-Based Pricing"

> "Nie sprzedaję czasu – dostarczam wyniki"

---

## Fundamenty wyceny

### ❌ Czego NIE robimy

- **Wycena godzinowa** - systemowo sprzeczna z interesem klienta
- **Wycena "od projektu" bez analizy wartości** - strzelanie w ciemno
- **Porównywanie się do stawek rynkowych** - nasza wartość to nie "godziny programisty"
- **Rabaty bez uzasadnienia** - obniżają postrzeganą wartość

### ✅ Co robimy

- **Wyceniamy wartość, którą dostarczamy**
- **Dzielimy ryzyko z klientem** (ROI-based pricing)
- **Budujemy długoterminowe relacje** (MRR)
- **Transparentnie komunikujemy metodologię wyceny**

---

## Model wyceny projektów

### Krok 1: Kwantyfikacja problemu

Przed wyceną ZAWSZE ustal z klientem:

| Metryka | Pytanie | Przykład |
|---------|---------|----------|
| **Czas** | Ile godzin/miesiąc zajmuje obecny proces? | 40h/miesiąc |
| **Koszt godziny** | Jaki jest koszt pracy osoby wykonującej? | 80 zł/h |
| **Błędy** | Ile błędów powstaje? Jaki jest koszt błędu? | 5 błędów/miesiąc × 500 zł |
| **Opóźnienia** | Ile kosztuje opóźnienie w procesie? | 2 dni × utracone przychody |
| **Skala** | Ile razy proces się powtarza? | 200 razy/miesiąc |

**Formuła podstawowa:**
```
Roczna wartość problemu = (Czas × Koszt) + (Błędy × Koszt błędu) + Koszty ukryte
```

### Krok 2: Określenie zakresu automatyzacji

| Poziom | Opis | Typowa redukcja |
|--------|------|-----------------|
| **Pełna automatyzacja** | Zero interwencji człowieka | 90-95% czasu |
| **Wspomagana** | Człowiek zatwierdza/weryfikuje | 70-80% czasu |
| **Częściowa** | Automatyzacja wybranych kroków | 40-60% czasu |

### Krok 3: Wycena oparta na wartości

**Zasada:** Klient płaci 15-30% rocznej wartości rozwiązania

```
Cena projektu = Roczna oszczędność × 0.15 do 0.30
```

**Przykład:**
- Obecny koszt procesu: 40h × 80 zł × 12 miesięcy = 38 400 zł/rok
- Automatyzacja redukuje o 80% = oszczędność 30 720 zł/rok
- Cena projektu: 30 720 × 0.20 = **6 144 zł**
- ROI dla klienta w pierwszym roku: **400%**

---

## Widełki cenowe (orientacyjne)

### Quick Wins (1-2 tygodnie)

| Typ | Zakres | Widełki |
|-----|--------|---------|
| **Mikro-automatyzacja** | 1 prosty scenariusz, bez integracji | 2 000 - 5 000 zł |
| **Integracja A↔B** | Połączenie 2 systemów, sync danych | 4 000 - 8 000 zł |
| **Automatyzacja dokumentów** | Generowanie z szablonu | 3 000 - 7 000 zł |
| **Alert/powiadomienie** | Monitoring + Slack/email | 2 000 - 4 000 zł |

### Projekty średnie (2-6 tygodni)

| Typ | Zakres | Widełki |
|-----|--------|---------|
| **System automatyzacji** | 3-5 scenariuszy, wielokrokowy proces | 8 000 - 20 000 zł |
| **Integracja multi-system** | 3+ systemy, transformacja danych | 12 000 - 30 000 zł |
| **Chatbot FAQ** | Baza wiedzy, podstawowy RAG | 10 000 - 25 000 zł |
| **Dashboard/raportowanie** | Agregacja danych, wizualizacje | 8 000 - 18 000 zł |

### Projekty duże (1-3 miesiące)

| Typ | Zakres | Widełki |
|-----|--------|---------|
| **System end-to-end** | Pełna automatyzacja procesu biznesowego | 25 000 - 60 000 zł |
| **Chatbot zaawansowany** | RAG + integracje + voice | 30 000 - 70 000 zł |
| **Custom aplikacja** | Dedykowane rozwiązanie | 40 000 - 100 000+ zł |
| **Transformacja procesu** | Redesign + automatyzacja + szkolenia | 50 000 - 150 000 zł |

---

## Model MRR (Monthly Recurring Revenue)

### Pakiety utrzymania

| Pakiet | Zakres | Cena/miesiąc |
|--------|--------|--------------|
| **Basic** | Monitoring, alerty, max 2h reakcji/miesiąc | 500 - 1 000 zł |
| **Standard** | Basic + drobne modyfikacje, max 5h/miesiąc | 1 500 - 3 000 zł |
| **Premium** | Standard + priorytet, rozwój systemu, max 10h/miesiąc | 3 000 - 6 000 zł |
| **Enterprise** | Dedykowany czas, SLA, nielimitowane wsparcie | 8 000 - 15 000+ zł |

### Argumenty za MRR (dla klienta)

1. **Spokój** - ktoś czuwa nad systemami 24/7
2. **Priorytet** - szybsza reakcja niż dla klientów ad-hoc
3. **Przewidywalność** - stały koszt vs nieprzewidywalne naprawy
4. **Ewolucja** - system rozwija się z potrzebami
5. **Gwarancja ciągłości** - nie zostaniesz z martwym systemem

### Kalkulacja MRR

```
MRR = (Wartość spokoju + Koszt przestoju × prawdopodobieństwo) / 12
```

**Przykład:**
- Koszt 1h przestoju systemu: 5 000 zł
- Prawdopodobieństwo awarii/rok bez utrzymania: 20%
- Oczekiwany koszt: 5 000 × 0.20 = 1 000 zł/rok
- Plus wartość "spokoju" i priorytetowej obsługi: 500 zł/miesiąc
- **Rekomendowany MRR: 1 000 - 1 500 zł/miesiąc**

---

## Struktura oferty

### Elementy każdej oferty

```markdown
## 1. Zrozumienie problemu
[Opis problemu klienta własnymi słowami - potwierdzenie zrozumienia]

## 2. Proponowane rozwiązanie
[Architektura, podejście, etapy]

## 3. Wartość biznesowa
| Metryka | Obecnie | Po wdrożeniu | Oszczędność |
|---------|---------|--------------|-------------|
| Czas procesu | X h/mies | Y h/mies | Z h/mies |
| Błędy | X/mies | Y/mies | -Z% |
| ... | ... | ... | ... |

**Roczna wartość rozwiązania: XX XXX zł**

## 4. Inwestycja
| Element | Cena |
|---------|------|
| Wdrożenie | XX XXX zł |
| Utrzymanie (opcja) | X XXX zł/mies |

**ROI w pierwszym roku: XXX%**
**Zwrot inwestycji po: X miesiącach**

## 5. Harmonogram
[Etapy z datami]

## 6. Następne kroki
[Co dalej]
```

---

## Negocjacje - zasady

### Kiedy możemy zejść z ceny

✅ Długoterminowa współpraca (MRR)
✅ Case study / referencje (wartość marketingowa)
✅ Ciekawy technologicznie projekt (wartość edukacyjna)
✅ Większy scope = lepsze warunki jednostkowe

### Kiedy NIE schodzimy z ceny

❌ "Bo konkurencja jest tańsza" - różna wartość
❌ "Bo budżet jest mniejszy" - dopasujmy scope
❌ "Na próbę" - Quick Win to nasza "próba"
❌ Presja czasowa klienta - to dodatkowe ryzyko

### Alternatywy dla obniżki ceny

1. **Zmniejsz scope** - MVP zamiast full solution
2. **Podziel na etapy** - Quick Win → rozszerzenie
3. **Odroczona płatność** - część po osiągnięciu KPI
4. **Barter** - usługi/produkty klienta

---

## Czerwone flagi w rozmowach o cenie

⚠️ Klient pyta o stawkę godzinową na początku rozmowy
⚠️ Porównuje nas do freelancerów z Upwork
⚠️ Chce wycenę bez discovery
⚠️ Naciska na rabat bez uzasadnienia
⚠️ "Mamy mały budżet, ale duże plany"
⚠️ Negocjuje cenę utrzymania przed wdrożeniem

---

## Szablony odpowiedzi

### "Jaka jest Wasza stawka godzinowa?"

> "Nie pracuję w modelu godzinowym, ponieważ jest on sprzeczny z interesem klienta - im szybciej rozwiążę problem, tym mniej zarabiam. Zamiast tego wyceniam wartość, którą dostarczam. Czy możemy porozmawiać o tym, jaki problem chcecie rozwiązać i jaką wartość ma to dla Waszej firmy?"

### "To drogo, konkurencja jest tańsza"

> "Rozumiem. Czy mogę zapytać - jaka jest ta konkurencyjna oferta i co dokładnie obejmuje? Chętnie wyjaśnię, co różni nasze podejście i dlaczego wierzę, że ROI z naszej współpracy będzie znacznie wyższe."

### "Czy możecie dać rabat?"

> "Zamiast obniżać cenę, co zwykle oznacza obniżenie jakości lub zakresu, wolę dopasować rozwiązanie do Waszego budżetu. Czy możemy przejrzeć zakres i zobaczyć, co jest absolutnie kluczowe na start, a co możemy dodać w kolejnych etapach?"

---

## Checklist przed wysłaniem oferty

- [ ] Kwantyfikacja problemu potwierdzona z klientem
- [ ] ROI wyliczone i sensowne
- [ ] Scope jasno zdefiniowany
- [ ] Ryzyka zidentyfikowane
- [ ] Harmonogram realistyczny
- [ ] MRR zaproponowany jako opcja
- [ ] Oferta przeliczona pod marżę (min. 40%)
