# SaaS Metrics Reference

## Revenue Metrics

### MRR (Monthly Recurring Revenue)
Suma miesięcznych opłat ze wszystkich aktywnych subskrypcji.

```
MRR = Σ (monthly subscription amount per active customer)
```

**Składniki MRR:**
- **New MRR** — nowi klienci w danym miesiącu
- **Expansion MRR** — upgrade'y istniejących klientów
- **Contraction MRR** — downgrade'y
- **Churned MRR** — utraceni klienci
- **Net New MRR** = New + Expansion - Contraction - Churned

### ARR (Annual Recurring Revenue)
```
ARR = MRR × 12
```
Używaj ARR gdy MRR > 1M PLN lub w kontekście wyceny/fundraisingu.

### Revenue Growth Rate
```
MoM Growth = (MRR this month - MRR last month) / MRR last month × 100%
YoY Growth = (ARR this year - ARR last year) / ARR last year × 100%
```

---

## Customer Metrics

### Churn Rate
```
Customer Churn = Customers lost / Customers at start of period × 100%
Revenue Churn = Churned MRR / MRR at start of period × 100%
Net Revenue Churn = (Churned MRR - Expansion MRR) / MRR at start × 100%
```

**Benchmarki:**
| Segment | Dobry churn (miesięczny) |
|---------|------------------------|
| Enterprise SaaS | < 0.5% |
| Mid-market SaaS | < 1% |
| SMB SaaS | < 3% |
| Consumer SaaS | < 5% |

**Net negative churn** (expansion > churn) = znak zdrowego biznesu.

### ARPU (Average Revenue Per User)
```
ARPU = MRR / Active Customers
```

---

## Acquisition Metrics

### CAC (Customer Acquisition Cost)
```
CAC = (Sales + Marketing costs) / New Customers
```

Uwzględnij: reklamy, content, narzędzia marketingowe, eventy, wynagrodzenia sales/marketing.

### CAC Payback Period
```
Payback = CAC / (ARPU × Gross Margin %)
```

**Benchmarki:**
| Payback | Ocena |
|---------|-------|
| < 6 mies. | Świetny |
| 6-12 mies. | Dobry |
| 12-18 mies. | Akceptowalny (jeśli niski churn) |
| > 18 mies. | Problemowy |

### LTV (Lifetime Value)
```
LTV = ARPU × Gross Margin % × (1 / Monthly Churn Rate)
```

### LTV/CAC
```
LTV/CAC > 3:1 = zdrowy biznes
```

---

## Efficiency Metrics

### Gross Margin
```
Gross Margin = (Revenue - COGS) / Revenue × 100%
```

COGS w SaaS: hosting, infra, third-party APIs, customer support.

**Benchmarki SaaS Gross Margin:**
| | Typowy |
|---|---|
| Best-in-class | > 80% |
| Dobry | 70-80% |
| OK | 60-70% |
| Niski | < 60% |

### Burn Multiple
```
Burn Multiple = Net Burn / Net New ARR
```

| Burn Multiple | Ocena |
|---------------|-------|
| < 1x | Świetny |
| 1-2x | Dobry |
| 2-3x | OK na wczesnym etapie |
| > 3x | Nieefektywny |

### Rule of 40
```
Rule of 40 = Revenue Growth Rate (%) + Profit Margin (%)
```
Cel: > 40%. Firmy mogą rosnąć szybko z niską marżą LUB rosnąć wolno z wysoką marżą.

---

## Quick Diagnostic

Przy pytaniu "jak idzie biznes SaaS?" zbierz te metryki:

| Metryka | Jak pobrać |
|---------|-----------|
| MRR | `scripts/get_mrr.py` |
| MRR Growth (MoM) | `scripts/get_mrr.py` (porównaj z poprzednim miesiącem) |
| Active Subscriptions | `scripts/get_subscriptions.py` |
| Revenue (period) | `scripts/get_revenue.py --from --to` |
| Cash Position | `scripts/get_balances.py` |
| Burn Rate | `scripts/get_transactions.py` (sum expenses last 3 months / 3) |
| Runway | Cash / Burn Rate |
