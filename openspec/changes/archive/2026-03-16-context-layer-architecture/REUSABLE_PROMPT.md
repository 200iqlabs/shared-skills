# Reusable Prompt: Context Layer Dependency

Use this prompt as preamble when working on any change that depends on the context-layer-architecture change. Copy and paste the relevant sections into your change's proposal or session context.

---

## Prompt (Polish)

```
Kontekst architektoniczny: Ten change zależy od `context-layer-architecture` (openspec/changes/context-layer-architecture/).

Kluczowe zasady:
1. Dane użytkownika (firmy, osoby, portfolio, finanse) → `context/` (gitignorowane, tworzone przez environment-setup skill)
2. Wiedza domenowa (metodologie, frameworki, checklisty) → `references/` (w katalogu skilla)
3. Każdy skill który używa plików kontekstu MUSI mieć sekcję `## Context Dependencies` z tabelą: plik, wymagany/rekomendowany, cel
4. Brakujące pliki kontekstu → ostrzeżenie: "Brakuje pliku [X]. Uruchom skill environment-setup aby przygotować środowisko." + kontynuuj z ograniczoną funkcjonalnością
5. Szablony kontekstu w `context/templates/*.template.md` — z markerami [DO UZUPEŁNIENIA]

Dostępne typy kontekstu:
- `context/company.md` — dane firmy, forma prawna, zespół
- `context/consultant-profile.md` — filozofia konsultacyjna, doświadczenie, podejście
- `context/projects-portfolio.md` — zrealizowane projekty, case studies
- `context/author-profile.md` — persona autora, odbiorcy, przykładowe posty
- `context/finances.md` — budżet, cele finansowe
- `context/legal-entities.md` — podmioty prawne, relacje, backlog dokumentów

Przy migracji skilla:
1. Zidentyfikuj USER_CONTEXT vs DOMAIN pliki w references/
2. Przenieś USER_CONTEXT do odpowiedniego szablonu context/templates/
3. Usuń przeniesione pliki z references/
4. Zaktualizuj SKILL.md — usuń hardkodowane dane osobowe, dodaj referencje do context/
5. Dodaj sekcję ## Context Dependencies
6. Zaktualizuj tabelę referencji
```

---

## Prompt (English)

```
Architectural context: This change depends on `context-layer-architecture` (openspec/changes/context-layer-architecture/).

Key principles:
1. User data (companies, people, portfolio, finances) → `context/` (gitignored, created by environment-setup skill)
2. Domain knowledge (methodologies, frameworks, checklists) → `references/` (in skill directory)
3. Every skill using context files MUST have a `## Context Dependencies` section with table: file, required/recommended, purpose
4. Missing context files → warning: "Missing file [X]. Run the environment-setup skill to prepare your environment." + continue with reduced capability
5. Context templates in `context/templates/*.template.md` — with [PLACEHOLDER] markers

Available context types:
- `context/company.md` — company details, legal structure, team
- `context/consultant-profile.md` — consulting philosophy, experience, approach
- `context/projects-portfolio.md` — past projects, case studies
- `context/author-profile.md` — author persona, audience, example posts
- `context/finances.md` — budget, financial goals
- `context/legal-entities.md` — legal entities, relationships, document backlog

When migrating a skill:
1. Identify USER_CONTEXT vs DOMAIN files in references/
2. Move USER_CONTEXT to appropriate context/templates/ template
3. Delete moved files from references/
4. Update SKILL.md — remove hardcoded personal data, add context/ references
5. Add ## Context Dependencies section
6. Update reference table
```

---

## Changes that need this prompt

| Change | Status | What needs updating |
|--------|--------|---------------------|
| `eval-business-consultant` | Artifacts complete, redesigned | Context layer migration + eval. Blocked by context-layer-architecture |
| `eval-legal` | Artifacts complete, redesigned | Context layer migration + eval. Blocked by context-layer-architecture |
| `eval-cfo` | Artifacts complete, redesigned | Context layer standardization + eval. Blocked by context-layer-architecture |
| `update-linkedin-content` | Proposal only | Already eval'd, needs context layer migration only. Blocked by context-layer-architecture |
| `update-tax-advisor` | Proposal only | Already eval'd, needs context layer standardization only. Blocked by context-layer-architecture |
