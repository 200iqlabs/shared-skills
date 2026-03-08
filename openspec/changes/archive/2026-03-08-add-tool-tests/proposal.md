## Why

Skrypty w `tools/` i `agents/cfo/scripts/` to wrappery na zewnętrzne API (Revolut, ClickUp, Stripe, inFakt). Brak testów oznacza, że zmiany mogą wprowadzić regresję bez żadnego sygnału. Skrypty CFO zawierają logikę biznesową (kalkulacja MRR, grupowanie kosztów, sumowanie przychodów) która jest szczególnie podatna na regresję. Potrzebujemy testów integracyjnych z prawdziwym API (uruchamianych lokalnie), unit testów logiki biznesowej oraz mockowanych testów dla operacji zapisu.

## What Changes

- Dodanie pytest jako test runnera dla `tools/` i `agents/cfo/scripts/`
- Testy integracyjne (live API) dla operacji read-only: Revolut, ClickUp, Stripe, inFakt
- Unit testy logiki biznesowej: calculate_mrr, summarize_costs, summarize_invoices, summarize_revenue
- Testy mockowane dla operacji write: ClickUp create_task (walidacja payloadu, parsowania argumentów)
- Fixture w `conftest.py` ładujący `.env` — przy braku kluczy: wyraźny error z komunikatem co uzupełnić (nie cichy skip)
- Marker `live_api` do odróżnienia testów wymagających kluczy od unit/mock testów

## Capabilities

### New Capabilities
- `tool-testing`: Framework testowy dla skryptów CLI — pytest runner, conftest z .env loading, asercje na kształt danych (status, valid JSON, expected fields), mockowanie write operations, unit testy logiki biznesowej

### Modified Capabilities
<!-- None — no existing spec-level requirements are changing -->

## Impact

- Nowy katalog `tests/` z plikami testowymi
- Nowa zależność: `pytest` (dev dependency)
- Wymaga `tools/common/.env` z kluczami API do uruchomienia testów live (REVOLUT_API_KEY, CLICKUP_API_TOKEN, STRIPE_API_KEY, INFAKT_API_KEY)
- Nie wpływa na istniejący kod w `tools/` ani `agents/`
