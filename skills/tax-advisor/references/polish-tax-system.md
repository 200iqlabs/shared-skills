# Polski system podatkowy — przegląd dla przedsiębiorców IT

> **last_updated:** 2026-03-15
> **dotyczy:** rok podatkowy 2025/2026
> **status:** wymaga corocznej weryfikacji stawek i progów

---

## CIT (podatek dochodowy od osób prawnych)

Dotyczy: PSA, sp. z o.o., inne osoby prawne

| Parametr | Wartość |
|----------|---------|
| Stawka podstawowa | 19% |
| Stawka preferencyjna (mały podatnik) | 9% |
| Próg małego podatnika | przychody do 2 mln EUR brutto rocznie |
| Zaliczki | miesięczne lub kwartalne (mały podatnik) |
| Zeznanie roczne | CIT-8, termin: koniec 3. miesiąca po zakończeniu roku podatkowego |

**Mały podatnik** — przychody ze sprzedaży brutto (z VAT) w poprzednim roku ≤ 2 mln EUR. Stawka 9% dotyczy dochodów operacyjnych (nie zysków kapitałowych).

### Estoński CIT (ryczałt od dochodów spółek)

Alternatywna forma opodatkowania — szczegóły w `it-tax-optimization.md`.

### Koszty uzyskania przychodów (KUP) — najczęstsze w IT
- Wynagrodzenia (umowy B2B, UoP, zlecenia)
- Sprzęt komputerowy i oprogramowanie
- Usługi chmurowe (AWS, GCP, Azure)
- Biuro / coworking
- Szkolenia i konferencje
- Podróże służbowe
- Amortyzacja środków trwałych i WNiP

---

## PIT (podatek dochodowy od osób fizycznych)

Dotyczy: JDG, wspólnicy spółek osobowych, osoby fizyczne

### Formy opodatkowania JDG

| Forma | Stawka | Dla kogo |
|-------|--------|----------|
| Skala podatkowa | 12% do 120 000 PLN, 32% powyżej | Domyślna. Kwota wolna 30 000 PLN |
| Podatek liniowy | 19% flat | IT freelancerzy, B2B. Brak kwoty wolnej, brak wspólnego rozliczenia |
| Ryczałt ewidencjonowany | 12% lub 8,5% (zależnie od PKD) | IT: zazwyczaj 12% dla usług IT (PKD 62.0x). Szczegóły w `it-tax-optimization.md` |

### Skala podatkowa — progi 2025/2026

| Dochód roczny | Stawka | Podatek |
|---------------|--------|---------|
| Do 30 000 PLN | 0% | Kwota wolna |
| 30 001 – 120 000 PLN | 12% | |
| Powyżej 120 000 PLN | 32% | |

### Danina solidarnościowa
- 4% od nadwyżki dochodu ponad 1 mln PLN rocznie
- Dotyczy: skala podatkowa, podatek liniowy, zyski kapitałowe

---

## VAT (podatek od towarów i usług)

| Parametr | Wartość |
|----------|---------|
| Stawka podstawowa | 23% |
| Stawka obniżona | 8% / 5% / 0% (nie dotyczy typowych usług IT) |
| Zwolnienie podmiotowe | obrót do 200 000 PLN rocznie |
| JPK_V7M / JPK_V7K | obowiązkowe dla czynnych podatników VAT |
| Termin rozliczenia | do 25. dnia miesiąca następnego (miesięcznie lub kwartalnie) |

### VAT w usługach IT — kluczowe zasady
- Usługi IT dla firm z PL → VAT 23%
- Usługi IT dla firm z UE (B2B) → reverse charge (0% VAT, faktura z adnotacją "odwrotne obciążenie")
- Usługi IT dla firm spoza UE (B2B) → nie podlega VAT w PL
- SaaS dla konsumentów UE → VAT OSS (stawka kraju nabywcy)
- Licencje na oprogramowanie → VAT 23% (krajowe)

### VAT OSS (One Stop Shop)
Dla sprzedaży SaaS/digital do konsumentów w UE:
- Rejestracja w jednym kraju UE
- Rozliczenie VAT wg stawek krajów nabywców
- Próg: od pierwszej transakcji (brak progu de minimis od 2021)

---

## ZUS (składki na ubezpieczenia społeczne)

### JDG — składki przedsiębiorcy

| Składka | Podstawa | Uwagi |
|---------|----------|-------|
| Emerytalna | 19,52% podstawy | |
| Rentowa | 8% podstawy | |
| Chorobowa | 2,45% (dobrowolna) | |
| Wypadkowa | 1,67% (typowa) | |
| Fundusz Pracy | 2,45% | Zwolnienie w pierwszych 6 miesiącach |
| **Razem (z chorobową)** | **~34%** podstawy | |

### Podstawy wymiaru składek JDG

| Okres | Podstawa | Przybliżona kwota miesięczna (2025) |
|-------|----------|--------------------------------------|
| Ulga na start | brak ZUS społecznego | 0 PLN (tylko zdrowotna) — max 6 miesięcy |
| Preferencyjny ZUS | 30% minimalnego wynagrodzenia | ~440 PLN/mies. — przez 24 miesiące |
| Mały ZUS Plus | proporcjonalna do dochodu | dla przychodów do 120 000 PLN/rok |
| Pełny ZUS | 60% prognozowanego przeciętnego wynagrodzenia | ~1 600 PLN/mies. |

### Składka zdrowotna JDG (od 2022 — Polski Ład)

| Forma opodatkowania | Składka zdrowotna | Minimalna |
|---------------------|-------------------|-----------|
| Skala podatkowa | 9% dochodu | od minimalnego wynagrodzenia |
| Podatek liniowy | 4,9% dochodu | od minimalnego wynagrodzenia |
| Ryczałt | zryczałtowana (3 progi przychodowe) | zależy od progu |

**Ważne:** Składka zdrowotna NIE jest odliczana od podatku (od 2022). Częściowe odliczenie możliwe przy liniowym i ryczałcie (jako KUP / odliczenie od przychodu).

### PSA — składki wspólników/zarządu
- Członek zarządu na powołanie → brak ZUS (tylko PIT od wynagrodzenia)
- Członek zarządu na UoP/B2B → pełne składki
- Akcjonariusz niepracujący → brak ZUS
- Akcjonariusz świadczący pracę/usługi na rzecz spółki → obowiązek ZUS (od 2023)

---

## Podatek u źródła (WHT)

Dotyczy wypłat za granicę (licencje, usługi niematerialne):

| Typ | Stawka | Uwagi |
|-----|--------|-------|
| Licencje oprogramowania | 20% | Możliwość obniżenia na podstawie UPO |
| Usługi doradcze/zarządcze | 20% | |
| Dywidendy | 19% | UPO może obniżyć do 5-15% |
| Odsetki | 20% | UPO może obniżyć do 5-10% |

Certyfikat rezydencji kontrahenta pozwala zastosować stawkę z umowy o unikaniu podwójnego opodatkowania (UPO).

---

## Inne obowiązki

### JPK (Jednolity Plik Kontrolny)
- JPK_V7M — miesięczny (czynni podatnicy VAT rozliczający się miesięcznie)
- JPK_V7K — kwartalny (mali podatnicy VAT)
- JPK_KR, JPK_EWP — na żądanie organu

### Kasa fiskalna
- Usługi IT B2B → zwolnienie (sprzedaż tylko dla firm)
- Sprzedaż SaaS do osób fizycznych → obowiązek po przekroczeniu 20 000 PLN/rok (lub kasa online/wirtualna)

### Ceny transferowe
- Obowiązek dokumentacji dla transakcji z podmiotami powiązanymi > progów
- PSA z jednym akcjonariuszem = powiązanie z JDG tego samego właściciela
- Progi: 500 000 PLN (usługi), 10 mln PLN (towary/środki trwałe)
