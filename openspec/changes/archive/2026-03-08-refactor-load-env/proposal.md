## Why

Wszystkie 7 skryptów w `agents/cfo/scripts/` definiuje identyczną funkcję `load_env()` (~14 linii każdy). To duplikacja kodu która utrudnia utrzymanie — zmiana logiki ładowania .env wymaga edycji 7 plików. Analogicznie `tools/common/helpers.sh` zawiera `load_env()` dla bash, ale skrypty Python nie mają wspólnego odpowiednika.

## What Changes

- Wyciągnięcie wspólnej funkcji `load_env()` do współdzielonego modułu Python (`tools/common/env.py` lub podobny)
- Zastąpienie zduplikowanych definicji `load_env()` w 7 skryptach CFO importem z modułu wspólnego
- Zachowanie kompatybilności wstecznej — skrypty nadal działają tak samo

## Capabilities

### New Capabilities
- `shared-env-loader`: Współdzielony moduł Python do ładowania zmiennych środowiskowych z `.env`, eliminujący duplikację w skryptach agentów

### Modified Capabilities
<!-- None — behavior doesn't change, only implementation -->

## Impact

- Nowy plik: `tools/common/env.py` (lub `tools/common/python_helpers.py`)
- Modyfikacja 7 plików w `agents/cfo/scripts/` — usunięcie lokalnego `load_env()`, dodanie importu
- Potencjalnie wymaga `__init__.py` lub modyfikacji `sys.path` w skryptach
- Zależność: najlepiej realizować PO `add-tool-tests` — testy złapią ewentualną regresję
