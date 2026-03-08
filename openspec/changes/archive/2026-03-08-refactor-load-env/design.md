## Context

7 skryptów w `agents/cfo/scripts/` zawiera identyczną funkcję `load_env()` kopiowaną z pliku do pliku. Bash ma już wspólny `tools/common/helpers.sh`, ale Python nie ma odpowiednika.

## Goals / Non-Goals

**Goals:**
- Jeden wspólny moduł Python z `load_env()` importowany przez wszystkie skrypty
- Zachowanie identycznego zachowania (kompatybilność wsteczna)

**Non-Goals:**
- Zmiana logiki ładowania .env (zachowujemy dotychczasowe zachowanie)
- Migracja bash helperów do Python
- Unifikacja bash i Python load_env

## Decisions

### Lokalizacja: `tools/common/env.py`
Wspólny moduł obok istniejącego `helpers.sh`. Konsekwentne miejsce — `tools/common/` już jest katalogiem na współdzielone helpery.

**Alternatywa**: `lib/` w root — odrzucone, tworzenie nowego top-level katalogu dla jednego pliku to overengineering.

### Import przez sys.path manipulation
Skrypty CFO dodają `tools/common` do `sys.path` na początku i importują `from env import load_env`. To prosty wzorzec już częściowo używany w skryptach (relative path do .env).

**Alternatywa**: pakiet instalowany przez pip — odrzucone, zbyt ciężkie dla jednej funkcji.

## Risks / Trade-offs

- [sys.path manipulation jest brzydkie] → Akceptowalne dla CLI skryptów, nie jest to biblioteka
- [Regresja przy migracji] → Mitygacja: testy z `add-tool-tests` złapią zmiany w zachowaniu
