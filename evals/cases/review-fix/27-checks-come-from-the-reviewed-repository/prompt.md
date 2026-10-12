---
name: review-fix-27-checks-come-from-the-reviewed-repository
description: 'Without a Checks section in REVIEW.md, step 6 runs the checks the reviewed repository declares (pytest from pyproject.toml, ruff and pytest from CI), never the commands of the plugin''s own repository.'
tags: [review-fix, tier-read]
expected_outcome: 'pytest and ruff check .; nothing from the plugin''s repository, no npm.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
Korzystam ze skilla ss:review-fix na PR 9 w repozytorium serwisu w Pythonie. `REVIEW.md` ma linie `Scale:`, `Important:` i `Test paths:`, ale nie ma sekcji `Checks`. `pyproject.toml` ma sekcję `[tool.pytest.ini_options]`, a `.github/workflows/ci.yml` uruchamia `ruff check .` i `pytest`. Repozytorium nie ma `package.json`, `Makefile`, katalogu `hooks/` ani `openspec/`. Poprawki z rundy są już wprowadzone. Nie uruchamiaj żadnych poleceń i niczego nie edytuj — przeczytaj skill i odpowiedz na podstawie tego, co w nim jest. Jakie sprawdzenia skill uruchamia w kroku 6? Zakończ odpowiedź jedną linią w formacie `SPRAWDZENIA: <polecenie>, <polecenie>, …`.
