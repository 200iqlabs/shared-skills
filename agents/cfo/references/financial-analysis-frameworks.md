# Financial Analysis Frameworks

## Unit Economics

Analiza rentowności na poziomie pojedynczej jednostki (klient, transakcja, produkt).

### Kluczowe metryki
- **CAC (Customer Acquisition Cost)** — koszt pozyskania klienta = marketing spend / nowi klienci
- **LTV (Lifetime Value)** — wartość klienta w czasie = ARPU × avg. lifetime
- **LTV/CAC ratio** — zdrowy biznes: LTV/CAC > 3:1
- **Payback period** — czas zwrotu CAC = CAC / monthly ARPU (cel: < 12 miesięcy)

### Jak liczyć
```
CAC = (marketing + sales costs) / new customers acquired
LTV = ARPU × (1 / monthly churn rate)
LTV/CAC = LTV / CAC
Payback = CAC / (ARPU × gross margin %)
```

### Interpretacja
| LTV/CAC | Sygnał |
|---------|--------|
| < 1:1 | Biznes traci pieniądze na każdym kliencie |
| 1-3:1 | Niski margines, trudno skalować |
| 3-5:1 | Zdrowy biznes, można skalować |
| > 5:1 | Niedoinwestowany growth — można wydać więcej na pozyskanie |

---

## Break-even Analysis

Punkt, w którym przychody pokrywają koszty.

### Formuła
```
Break-even (units) = Fixed Costs / (Price per unit - Variable cost per unit)
Break-even (revenue) = Fixed Costs / Contribution Margin %
Contribution Margin = (Revenue - Variable Costs) / Revenue
```

### Zastosowanie
- Nowy produkt/feature: ile klientów/sprzedaży potrzeba
- Decyzja o zatrudnieniu: jak nowy koszt wpływa na break-even
- Zmiana cen: symulacja wpływu na próg rentowności

---

## Scenario Analysis

Porównanie wariantów decyzji finansowej.

### Struktura
Dla każdej decyzji przygotuj 3 scenariusze:

| | Optimistic | Base | Pessimistic |
|---|---|---|---|
| Założenia | Najlepszy realistyczny case | Najbardziej prawdopodobny | Najgorszy realistyczny case |
| Revenue impact | +X% | 0% | -Y% |
| Cost impact | +A PLN/mies. | +B PLN/mies. | +C PLN/mies. |
| Runway impact | +N mies. | 0 mies. | -M mies. |
| Break-even shift | -K mies. | 0 | +L mies. |

### Kiedy używać
- "Czy nas stać na X?"
- Decyzja o nowym narzędziu/usłudze
- Zatrudnienie vs outsourcing
- Zmiana modelu cenowego

---

## DuPont Analysis (uproszczona)

Rozbicie rentowności na komponenty.

```
ROE = Net Profit Margin × Asset Turnover × Financial Leverage

Net Profit Margin = Net Income / Revenue
Asset Turnover = Revenue / Total Assets
Financial Leverage = Total Assets / Equity
```

### Zastosowanie dla małej firmy
- Czy niska rentowność wynika z niskiej marży czy niskiego obrotu?
- Gdzie jest dźwignia do poprawy?

---

## Cash Flow Analysis

### Struktura
```
Operating Cash Flow
  + Revenue received
  - Operating expenses paid
  - Taxes paid
  = Net Operating CF

Investing Cash Flow
  - Equipment/software purchases
  - Long-term investments
  = Net Investing CF

Financing Cash Flow
  + Capital injections
  + Loans received
  - Loan repayments
  - Dividends/distributions
  = Net Financing CF

Net Cash Flow = Operating + Investing + Financing
```

### Red flags
- Operating CF ujemny przez 3+ miesięcy
- Revenue rośnie ale Operating CF spada (problem z collections)
- Zależność od Financing CF (pożyczki) do pokrycia operacji

---

## Runway Calculation

```
Monthly Burn Rate = avg(total monthly expenses, last 3 months)
Cash Runway = Current Cash / Monthly Burn Rate
```

### Interpretacja
| Runway | Status | Akcja |
|--------|--------|-------|
| > 18 mies. | Komfortowy | Można inwestować w growth |
| 12-18 mies. | Zdrowy | Monitoruj trendy |
| 6-12 mies. | Uwaga | Zacznij optymalizację kosztów lub szukaj finansowania |
| < 6 mies. | Krytyczny | Natychmiastowa akcja: cięcia lub funding |

---

## Cost Optimization Framework

### Kategoryzacja kosztów
1. **Must-have** — bez tego firma nie działa (infra, narzędzia core, płace)
2. **Should-have** — istotne ale nie krytyczne (marketing, narzędzia pomocnicze)
3. **Nice-to-have** — komfort, można wyciąć (subskrypcje premium, perki)

### Podejście
1. Pogrupuj wydatki: fixed vs variable, must/should/nice
2. Dla each nice-to-have: czy używamy? ROI?
3. Dla each should-have: czy jest tańsza alternatywa?
4. Dla fixed costs: czy można renegocjować?
5. Quick wins first, structural changes second
