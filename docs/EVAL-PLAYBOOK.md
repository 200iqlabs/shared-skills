# Skill Evaluation Playbook

Prompt do uruchomienia w nowej sesji Claude Code dla każdego skilla.
Skopiuj odpowiedni prompt, wklej jako pierwszą wiadomość w nowej sesji.

---

## Jak to działa

1. Otwórz nową sesję Claude Code
2. Skopiuj prompt dla danego skilla
3. Wklej i uruchom
4. Skill-creator poprowadzi Cię przez proces (test prompts → review → iterate → description optimization)
5. Na końcu powiedz "commit"

### Znane issues na Windows
- `generate_review.py` wymaga `--static` (encoding error cp1252)
- `run_loop.py` nie działa na Windows (socket errors) — description optimization trzeba robić ręcznie

---

## 1. coach-the-five

```
Kontekst: Przeprowadzam audit skilli pod kątem zgodności z procesem skill-creator (Agent Skills 2.0). Skill linkedin-content już przeszedł ten proces (commit 2e4c281). Teraz kolej na coach-the-five.

Zadanie: Użyj /skill-creator żeby przepuścić istniejący skill skills/coach-the-five/SKILL.md przez pełny proces ewaluacji:

1. Przeczytaj SKILL.md i wszystkie pliki referencyjne
2. Zaproponuj 3 realistyczne test prompts (po polsku, jak prawdziwy użytkownik by pisał)
3. Po mojej akceptacji — uruchom 6 testów (3 with-skill + 3 without-skill baseline) równolegle
4. Zrób grading (assertions sprawdzane skryptem) + benchmark.json
5. Wygeneruj viewer z --static (Windows encoding issue) i otwórz w przeglądarce
6. Po moim review — zastosuj kosmetyczne poprawki jeśli potrzebne (bez nowej iteracji testów)
7. Zrób description optimization ręcznie (run_loop.py nie działa na Windows) — przeanalizuj eval set vs description, zaproponuj poprawki
8. Workspace: skills/coach-the-five-workspace/iteration-1/

Wzoruj się na procesie linkedin-content — pełna struktura workspace z timing.json, grading.json, benchmark.json, feedback.json.
```

---

## 2. legal

```
Kontekst: Przeprowadzam audit skilli pod kątem zgodności z procesem skill-creator (Agent Skills 2.0). Skille linkedin-content i coach-the-five już przeszły ten proces. Teraz kolej na legal.

Zadanie: Użyj /skill-creator żeby przepuścić istniejący skill skills/legal/SKILL.md przez pełny proces ewaluacji:

1. Przeczytaj SKILL.md i wszystkie pliki referencyjne
2. Zaproponuj 3 realistyczne test prompts (po polsku, jak prawdziwy użytkownik by pisał)
3. Po mojej akceptacji — uruchom 6 testów (3 with-skill + 3 without-skill baseline) równolegle
4. Zrób grading (assertions sprawdzane skryptem) + benchmark.json
5. Wygeneruj viewer z --static (Windows encoding issue) i otwórz w przeglądarce
6. Po moim review — zastosuj kosmetyczne poprawki jeśli potrzebne (bez nowej iteracji testów)
7. Zrób description optimization ręcznie (run_loop.py nie działa na Windows) — przeanalizuj eval set vs description, zaproponuj poprawki
8. Workspace: skills/legal-workspace/iteration-1/

Wzoruj się na procesie linkedin-content — pełna struktura workspace z timing.json, grading.json, benchmark.json, feedback.json.
```

---

## 3. business-consultant

```
Kontekst: Przeprowadzam audit skilli pod kątem zgodności z procesem skill-creator (Agent Skills 2.0). Skille linkedin-content, coach-the-five i legal już przeszły ten proces. Teraz kolej na business-consultant.

Zadanie: Użyj /skill-creator żeby przepuścić istniejący skill skills/business-consultant/SKILL.md przez pełny proces ewaluacji:

1. Przeczytaj SKILL.md i wszystkie pliki referencyjne
2. Zaproponuj 3 realistyczne test prompts (po polsku, jak prawdziwy użytkownik by pisał)
3. Po mojej akceptacji — uruchom 6 testów (3 with-skill + 3 without-skill baseline) równolegle
4. Zrób grading (assertions sprawdzane skryptem) + benchmark.json
5. Wygeneruj viewer z --static (Windows encoding issue) i otwórz w przeglądarce
6. Po moim review — zastosuj kosmetyczne poprawki jeśli potrzebne (bez nowej iteracji testów)
7. Zrób description optimization ręcznie (run_loop.py nie działa na Windows) — przeanalizuj eval set vs description, zaproponuj poprawki
8. Workspace: skills/business-consultant-workspace/iteration-1/

Wzoruj się na procesie linkedin-content — pełna struktura workspace z timing.json, grading.json, benchmark.json, feedback.json.
```

---

## 4. cfo

```
Kontekst: Przeprowadzam audit skilli pod kątem zgodności z procesem skill-creator (Agent Skills 2.0). Skille linkedin-content, coach-the-five, legal i business-consultant już przeszły ten proces. Teraz kolej na cfo (ostatni).

Zadanie: Użyj /skill-creator żeby przepuścić istniejący skill skills/cfo/SKILL.md przez pełny proces ewaluacji:

1. Przeczytaj SKILL.md i wszystkie pliki referencyjne
2. Zaproponuj 3 realistyczne test prompts (po polsku, jak prawdziwy użytkownik by pisał)
3. Po mojej akceptacji — uruchom 6 testów (3 with-skill + 3 without-skill baseline) równolegle
4. Zrób grading (assertions sprawdzane skryptem) + benchmark.json
5. Wygeneruj viewer z --static (Windows encoding issue) i otwórz w przeglądarce
6. Po moim review — zastosuj kosmetyczne poprawki jeśli potrzebne (bez nowej iteracji testów)
7. Zrób description optimization ręcznie (run_loop.py nie działa na Windows) — przeanalizuj eval set vs description, zaproponuj poprawki
8. Workspace: skills/cfo-workspace/iteration-1/

Wzoruj się na procesie linkedin-content — pełna struktura workspace z timing.json, grading.json, benchmark.json, feedback.json.

To ostatni skill w audycie. Po zakończeniu zrób podsumowanie statusu wszystkich 5 skilli.
```
