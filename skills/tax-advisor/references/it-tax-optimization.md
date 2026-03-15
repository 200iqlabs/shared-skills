# Optymalizacja podatkowa dla firm IT

> **last_updated:** 2026-03-15
> **dotyczy:** rok podatkowy 2025/2026
> **status:** wymaga corocznej weryfikacji stawek i warunków

---

## IP Box (Innovation Box)

Preferencyjna stawka 5% PIT/CIT od dochodów z kwalifikowanych praw własności intelektualnej.

### Kwalifikowane prawa IP
- Autorskie prawo do programu komputerowego (najczęściej w IT)
- Patent
- Prawo ochronne na wzór użytkowy
- Prawo z rejestracji wzoru przemysłowego

### Warunki stosowania
1. **Prowadzenie działalności B+R** — prace rozwojowe nad oprogramowaniem
2. **Odrębna ewidencja** — wyodrębnienie przychodów i kosztów per prawo IP
3. **Nexus (wskaźnik)** — im więcej prac B+R prowadzonych samodzielnie, tym wyższy procent dochodu kwalifikowanego
4. **Interpretacja indywidualna** — rekomendowana przed pierwszym zastosowaniem

### Wzór nexus
```
Nexus = (a + b) × 1.3 / (a + b + c + d)

a = koszty B+R prowadzone samodzielnie
b = koszty B+R od podmiotów niepowiązanych
c = koszty B+R od podmiotów powiązanych
d = koszty nabycia gotowego IP
```

Nexus ≤ 1.0. Im bliżej 1.0, tym lepiej.

### Typowe scenariusze IT
| Scenariusz | Kwalifikuje się? | Uwagi |
|-----------|-----------------|-------|
| Tworzenie własnego SaaS | ✅ TAK | Autorskie prawo do kodu |
| Usługi programistyczne B2B (tworzenie kodu dla klienta) | ⚠️ ZALEŻY | Tylko jeśli prawa IP pozostają u programisty (licencja, nie przeniesienie) |
| Przeniesienie praw autorskich na klienta | ❌ NIE | IP Box dotyczy dochodów z posiadanego IP |
| Utrzymanie / support istniejącego systemu | ❌ NIE | Brak elementu B+R |
| Rozwój nowych funkcji w istniejącym produkcie | ✅ TAK | Jeśli spełnia definicję prac rozwojowych |

### Ryzyka
- 🔴 Kontrole skarbowe IP Box są częste — dokumentacja musi być solidna
- 🔴 Wymagana ewidencja od początku roku (nie można zastosować wstecz bez ewidencji)
- 🟡 Interpretacja "prac rozwojowych" vs "rutynowych" bywa subiektywna

---

## Ulga B+R (Badania i Rozwój)

Odliczenie od podstawy opodatkowania kosztów kwalifikowanych B+R (podwójne odliczenie).

### Mechanizm
Koszty B+R są:
1. Księgowane jako normalne KUP (pomniejszają dochód)
2. Dodatkowo odliczane od podstawy opodatkowania (do 200% kosztów kwalifikowanych)

### Koszty kwalifikowane B+R
- Wynagrodzenia pracowników zaangażowanych w B+R (proporcjonalnie do czasu)
- Materiały i surowce zużyte w B+R
- Ekspertyzy i opinie naukowe
- Korzystanie z aparatury badawczej
- Amortyzacja sprzętu używanego w B+R

### Warunki
- Wyodrębnienie kosztów B+R w ewidencji
- Działalność twórcza, systematyczna, zwiększająca wiedzę
- Brak finansowania z dotacji (koszty sfinansowane z dotacji nie kwalifikują się)

### Łączenie z IP Box
- **Można łączyć**, ale nie do tych samych dochodów
- Strategia: ulga B+R na koszty rozwoju → IP Box na dochody z gotowego produktu
- 🔴 Wymaga precyzyjnej ewidencji i rozdzielenia

---

## Estoński CIT (ryczałt od dochodów spółek)

Podatek płacony dopiero przy dystrybucji zysku (wypłacie dywidendy), nie przy osiągnięciu dochodu.

### Stawki (przy dystrybucji)

| Typ podatnika | CIT estońsk | PIT dywidenda | Efektywna łączna |
|---------------|------------|---------------|------------------|
| Mały podatnik | 10% | 19% (z odliczeniem 90% CIT) | ~20% |
| Duży podatnik | 20% | 19% (z odliczeniem 70% CIT) | ~25% |

### Warunki wejścia
1. Forma prawna: sp. z o.o., PSA, S.A., S.K.A., spółdzielnia (NIE JDG)
2. Wspólnicy/akcjonariusze: wyłącznie osoby fizyczne
3. Brak udziałów/akcji w innych podmiotach
4. Zatrudnienie: min. 3 osoby (UoP, nie B2B) lub wynagrodzenia ≥ 3× średnie wynagrodzenie
5. Przychody pasywne (odsetki, tantiemy) < 50% przychodów
6. Prowadzenie ksiąg rachunkowych (pełna księgowość)

### Zalety
- Brak podatku do momentu wypłaty → reinwestycja bez obciążenia
- Niższa efektywna stawka niż standardowy CIT+PIT
- Uproszczona ewidencja (brak KUP, amortyzacji podatkowej)

### Wady / Ryzyka
- 🟡 Ukryte zyski — świadczenia na rzecz wspólników (np. wynajem auta spółki) opodatkowane jak dystrybucja
- 🟡 Wydatki niezwiązane z działalnością — opodatkowane jak dystrybucja
- 🔴 Wyjście z estońskiego CIT → korekta (domiaru podatku za okres estońskiego CIT)
- 🟡 Wymóg zatrudnienia na UoP (nie B2B) — problem dla firm IT korzystających głównie z kontraktów B2B

### Estoński CIT a IT
Atrakcyjny dla spółek reinwestujących zysk w rozwój produktu. Mniej atrakcyjny gdy:
- Wspólnicy potrzebują regularnej wypłaty zysku
- Firma korzysta głównie z kontraktorów B2B (problem z wymogiem zatrudnienia)
- Wspólnik korzysta z majątku spółki (ukryte zyski)

---

## Ryczałt ewidencjonowany dla IT

Uproszczona forma opodatkowania JDG — podatek od przychodu (nie dochodu).

### Stawki dla usług IT

| PKD | Opis | Stawka ryczałtu |
|-----|------|----------------|
| 62.01.Z | Działalność związana z oprogramowaniem | 12% |
| 62.02.Z | Doradztwo w zakresie informatyki | 12% |
| 62.03.Z | Zarządzanie zasobami informatycznymi | 12% |
| 62.09.Z | Pozostała działalność usługowa IT | 12% |
| 63.11.Z | Przetwarzanie danych, hosting | 12% |

### Kiedy ryczałt jest korzystny
- Niskie koszty uzyskania przychodów (< ~20% przychodu)
- Praca samodzielna (brak dużych wydatków na zespół)
- Freelancer / jednoosobowy software house
- Efektywna stawka: 12% przychodu + ~4.9% składka zdrowotna (zryczałtowana)

### Kiedy ryczałt jest niekorzystny
- Wysokie koszty (sprzęt, podwykonawcy, biuro) — nie można ich odliczyć
- Planowana amortyzacja dużych inwestycji
- Potrzeba rozliczenia IP Box (nie łączy się z ryczałtem)

### Składka zdrowotna na ryczałcie (2025)

| Roczny przychód | Miesięczna składka zdrowotna |
|-----------------|------------------------------|
| Do 60 000 PLN | ~420 PLN |
| 60 001 – 300 000 PLN | ~700 PLN |
| Powyżej 300 000 PLN | ~1 260 PLN |

Połowa składki zdrowotnej jest odliczalna od przychodu.

---

## Porównanie form — szybka tabela decyzyjna

| Kryterium | Liniowy 19% | Ryczałt 12% | IP Box 5% | Estoński CIT |
|-----------|------------|-------------|-----------|-------------|
| Forma prawna | JDG | JDG | JDG/spółka | Spółka |
| Podatek od | Dochodu | Przychodu | Dochodu z IP | Dystrybucji |
| KUP | ✅ Tak | ❌ Nie | ✅ Tak | N/A |
| Ewidencja | Standardowa | Uproszczona | Rozszerzona (per IP) | Uproszczona |
| Składka zdrowotna | 4,9% dochodu | Zryczałtowana | 4,9% dochodu | Brak (spółka) |
| Dla kogo najlepszy | Wysokie koszty | Niskie koszty | Własny produkt IP | Reinwestycja w spółce |
