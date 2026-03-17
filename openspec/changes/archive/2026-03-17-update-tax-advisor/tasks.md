## 1. Update SKILL.md context references

- [x] 1.1 Remove `company/` from context path references in the "Zbieranie kontekstu" section (line 22) — replace with explicit `context/` file paths (e.g., `context/legal-entities.md`, `context/company.md`)
- [x] 1.2 Verify that all other context file references in SKILL.md use `context/` path (no other legacy paths remain)

## 2. Context data loading and missing context handling

- [x] 2.1 Update "Zbieranie kontekstu" section to explicitly instruct the agent to load data from context files before answering
- [x] 2.2 Add clear missing-context message: when a required context file doesn't exist, inform user ("Brakuje pliku [nazwa]. Uruchom skill environment-setup aby przygotować środowisko.") and then ask directly for the needed data
- [x] 2.3 Ensure the graceful fallback on line 14 (`context/legal-entities.md`) is consistent with the new missing-context message pattern

## 3. Verify existing implementation

- [x] 3.1 Confirm `## Context Dependencies` section lists correct files and includes the environment-setup suggestion
- [x] 3.2 Confirm `context/templates/legal-entities.template.md` exists and is usable
