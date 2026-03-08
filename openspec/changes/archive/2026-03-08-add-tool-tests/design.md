## Context

Skrypty w `tools/` to cienkie wrappery na API (Revolut, ClickUp). Skrypty w `agents/cfo/scripts/` to bardziej rozbudowane wrappery na API Revolut, Stripe i inFakt z logiką biznesową (kalkulacja MRR, grupowanie kosztów/przychodów, sumowanie faktur). Bash skrypty używają `curl`, Python skrypty używają `requests`. Brak jakichkolwiek testów.

## Goals / Non-Goals

**Goals:**
- Regression testing dla skryptów read-only z live API (`tools/` + `agents/cfo/scripts/`)
- Unit testy logiki biznesowej w skryptach CFO (calculate_mrr, summarize_costs, summarize_invoices, summarize_revenue) — bez API
- Walidacja payloadu i argumentów dla operacji write (mockowane)
- Wyraźny error message gdy brak kluczy API (nie cichy skip)
- Wzorzec łatwy do powielenia dla nowych skryptów

**Non-Goals:**
- CI pipeline (testy live wymagają lokalnych credentiali; unit testy mogą iść w CI w przyszłości)
- Testowanie logiki `helpers.sh` w izolacji (za mało logiki)
- Contract tests / schema validation API responses
- Refaktoryzacja zduplikowanego `load_env()` (osobna zmiana)

## Decisions

### pytest jako jedyny test runner
Bash skrypty testowane przez `subprocess.run()`, Python skrypty importowane lub uruchamiane jako subprocess. Jeden runner, jeden `pip install pytest`.

**Alternatywa**: bats dla bash + pytest dla Python — odrzucone, bo dodaje drugi tool bez realnej korzyści.

### Marker `live_api` + error przy braku kluczy
Testy live API oznaczone `@pytest.mark.live_api`. Fixture `env_keys` ładuje `.env` i przy braku wymaganych kluczy wywołuje `pytest.fail()` z komunikatem co uzupełnić. Dzięki temu developer od razu widzi co jest potrzebne.

**Alternatywa**: `pytest.skip()` — odrzucone, bo cichy skip maskuje brak konfiguracji.

### Asercje na kształt danych, nie wartości
Testy sprawdzają: status code, valid JSON, obecność expected fields, typy wartości. Nie sprawdzają konkretnych kwot, nazw tasków, itp.

### Mockowanie write operations przez monkeypatch/subprocess
`create_task.sh` testowany z zamockowanym `curl` — podmieniamy `curl` na skrypt zwracający sztywną odpowiedź. Walidujemy czy payload JSON jest poprawnie zbudowany (w tym escapowanie znaków specjalnych).

### Unit testy logiki biznesowej przez import
Skrypty CFO mają funkcje z logiką (np. `calculate_mrr()`, `summarize_costs()`). Testujemy je bezpośrednio przez import Pythonowy z podanymi fixture danymi — bez wywołania API. To daje najwyższe ROI bo tu jest realna logika i realne ryzyko regresji.

### Struktura testów per integracja
Osobny plik testowy per API/integracja, nie per katalog źródłowy. Skrypty Revolut z `tools/` i `agents/cfo/scripts/` testowane w tym samym `test_revolut.py`.

## Risks / Trade-offs

- [Flaky tests z powodu API downtime] → Akceptowalne — testy lokalne, developer może po prostu powtórzyć
- [Revolut rate limiting] → Niskie ryzyko przy kilku testach, ale warto mieć `--count 1` w transactions
- [Stripe/inFakt rate limiting] → Podobne — kilka read-only calls nie powinno być problemem
- [Zmiana API response shape] → Test złapie regresję — to jest cel
- [Import skryptów CFO wymaga poprawnej struktury modułów] → Skrypty mają `if __name__ == "__main__"` guard, więc import jest bezpieczny
