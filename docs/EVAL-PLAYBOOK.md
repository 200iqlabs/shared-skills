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

## Status audytu

| # | Skill | Status | Uwagi |
|---|-------|--------|-------|
| 1 | linkedin-content | ✅ Done | commit f223474 |
| 2 | tax-advisor | ✅ Done | commit 2eee495, 2 iteracje |
| 3 | coach-the-five | ⏭️ Pominięty | Przeniesiony do private-skills |
| 4 | legal | ✅ Done | commit b4e6d82, context migration + eval, 2 iterations |
| 5 | business-consultant | ✅ Done | context migration + eval, 1 iteration |
| 6 | cfo | ✅ Done | context standardization + eval, 1 iteration (re-run for methodology fix) |

---

## 1. legal

```
Kontekst: Przeprowadzam audit skilli pod kątem zgodności z procesem skill-creator (Agent Skills 2.0). Skille linkedin-content i tax-advisor już przeszły ten proces. Teraz kolej na legal.

Zadanie: Użyj /skill-creator żeby przepuścić istniejący skill skills/legal/SKILL.md przez pełny proces ewaluacji:

1. Przeczytaj SKILL.md i wszystkie pliki referencyjne
2. WAŻNE: Przed ewaluacją — przeprowadź migrację do context layer (patrz: openspec/changes/context-layer-architecture/). Przenieś dane użytkownika z references/ do context/ (entity-context.md i document-backlog.md → context/legal-entities.md). Usuń hardkodowane nazwy firm (PLSoft, 200IQ Labs) z SKILL.md — zastąp referencjami do context/legal-entities.md. Dodaj sekcję ## Context Dependencies. Zachowaj polskie prawo, tryby pracy i sygnalizację ryzyka w references/.
3. Zaproponuj 5+ realistycznych test prompts (po polsku, jak prawdziwy użytkownik by pisał)
4. Po mojej akceptacji — uruchom 10+ testów (5 with-skill + 5 without-skill baseline) równolegle
5. Zrób grading (assertions sprawdzane skryptem) + benchmark.json
6. Wygeneruj viewer z --static (Windows encoding issue) i otwórz w przeglądarce
7. Po moim review — zastosuj kosmetyczne poprawki jeśli potrzebne (bez nowej iteracji testów)
8. Zrób description optimization ręcznie (run_loop.py nie działa na Windows) — przeanalizuj eval set vs description, zaproponuj poprawki
9. Workspace: skills/legal-workspace/iteration-1/

Wzoruj się na procesie linkedin-content — pełna struktura workspace z timing.json, grading.json, benchmark.json, feedback.json.
```

---

## 2. business-consultant

```
Kontekst: Przeprowadzam audit skilli pod kątem zgodności z procesem skill-creator (Agent Skills 2.0). Skille linkedin-content, tax-advisor i legal już przeszły ten proces. Teraz kolej na business-consultant.

Zadanie: Użyj /skill-creator żeby przepuścić istniejący skill skills/business-consultant/SKILL.md przez pełny proces ewaluacji:

1. Przeczytaj SKILL.md i wszystkie pliki referencyjne
2. WAŻNE: Przed ewaluacją — przeprowadź migrację do context layer (patrz: openspec/changes/context-layer-architecture/). Przenieś dane użytkownika z references/ do context/ (projekty.md, case studies → context/projects-portfolio, manifest.md identity → context/consultant-profile). Usuń hardkodowaną tożsamość z SKILL.md — zastąp referencjami do context/. Dodaj sekcję ## Context Dependencies. Zachowaj stack technologiczny, workflow konsultacyjny i filozofię w references/.
3. Zaproponuj 5+ realistycznych test prompts (po polsku, jak prawdziwy użytkownik by pisał)
4. Po mojej akceptacji — uruchom 10+ testów (5 with-skill + 5 without-skill baseline) równolegle
5. Zrób grading (assertions sprawdzane skryptem) + benchmark.json
6. Wygeneruj viewer z --static (Windows encoding issue) i otwórz w przeglądarce
7. Po moim review — zastosuj kosmetyczne poprawki jeśli potrzebne (bez nowej iteracji testów)
8. Zrób description optimization ręcznie (run_loop.py nie działa na Windows) — przeanalizuj eval set vs description, zaproponuj poprawki
9. Workspace: skills/business-consultant-workspace/iteration-1/

Wzoruj się na procesie linkedin-content — pełna struktura workspace z timing.json, grading.json, benchmark.json, feedback.json.
```

---

## 3. cfo

```
Kontekst: Przeprowadzam audit skilli pod kątem zgodności z procesem skill-creator (Agent Skills 2.0). Skille linkedin-content, tax-advisor, legal i business-consultant już przeszły ten proces. Teraz kolej na cfo (ostatni).

Zadanie: Użyj /skill-creator żeby przepuścić istniejący skill skills/cfo/SKILL.md przez pełny proces ewaluacji:

1. Przeczytaj SKILL.md i wszystkie pliki referencyjne
2. WAŻNE: Przed ewaluacją — przeprowadź standaryzację context layer (patrz: openspec/changes/context-layer-architecture/). CFO jest już dość generyczny — dodaj sekcję ## Context Dependencies (context/finances.md, context/company.md). Napraw stały reference do coach-the-five (przeniesiony do private-skills) — zmień na ogólne "odsyłaj do zewnętrznego doradcy". Wszystkie pliki references/ to wiedza domenowa — zostają.
3. Zaproponuj 5+ realistycznych test prompts (po polsku, jak prawdziwy użytkownik by pisał)
4. Po mojej akceptacji — uruchom 10+ testów (5 with-skill + 5 without-skill baseline) równolegle
5. Zrób grading (assertions sprawdzane skryptem) + benchmark.json
6. Wygeneruj viewer z --static (Windows encoding issue) i otwórz w przeglądarce
7. Po moim review — zastosuj kosmetyczne poprawki jeśli potrzebne (bez nowej iteracji testów)
8. Zrób description optimization ręcznie (run_loop.py nie działa na Windows) — przeanalizuj eval set vs description, zaproponuj poprawki
9. Workspace: skills/cfo-workspace/iteration-1/

Wzoruj się na procesie linkedin-content — pełna struktura workspace z timing.json, grading.json, benchmark.json, feedback.json.

To ostatni skill w audycie. Po zakończeniu zrób podsumowanie statusu wszystkich skilli.
```
