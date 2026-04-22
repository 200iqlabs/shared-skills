## Context

The `shared-skills` repository is a plugin library consumed as a git submodule by multiple downstream repos. Today only one consumer exists in practice (`agentic-ai-private`, PLSoft), and the `/ingest` skill reflects that — its instructions reference `context/plsoft/clients/` and `context/plsoft/projects/` by name. A second consumer (`agentic-ai-system`, 200IQ LABS) is about to adopt the pattern with different top-level paths (`context/200iq-labs/clients/`, `context/qamera/customers/`, etc.), and a single consumer is also introducing **multiple paths per scope type** (two prospect folders — `200iq-labs/prospects/` and `qamera/prospects/`).

Stakeholders:
- `shared-skills` maintainer (Paweł) — changes must stay backwards-compatible where possible.
- `agentic-ai-private` (Paweł personal) — cannot break; requires companion `CLAUDE.md` update.
- `agentic-ai-system` (200IQ LABS) — blocked on this change before adopting new structure.

## Goals / Non-Goals

**Goals:**
- Remove all `plsoft/` string literals from `skills/ingest/SKILL.md`.
- Define a declarative, documented convention (`## Context Paths` in `CLAUDE.md`) that any downstream repo can adopt.
- Support lists of paths per scope type — the ingest skill processes matching entries across all declared paths.
- Give a clear error when the section is missing, with a concrete example fix.
- Ship with companion instructions so `agentic-ai-private` migrates without drama.

**Non-Goals:**
- Multi-scope name collision resolution with interactive disambiguation — accepted behavior is "process all matches simultaneously" (user decision).
- Formal machine-readable config (e.g. YAML file outside `CLAUDE.md`) — the convention lives inside `CLAUDE.md` because that's what skills already read.
- Renaming or restructuring other skills that might use context paths — out of scope.
- Any change to the `context-layer` spec — unrelated.

## Decisions

### Decision 1: Convention location — `CLAUDE.md` section (not a new config file)
`CLAUDE.md` is already loaded into every conversation. Adding a `## Context Paths` section piggybacks on that load, requires no new tooling, and keeps configuration colocated with prose documentation that already describes the repo.

Alternatives considered:
- **Separate `openspec/context-paths.yaml`** — cleaner schema, but adds a file skills must parse; duplicates information that would also need to be prose-documented in `CLAUDE.md` anyway.
- **Frontmatter in `CLAUDE.md`** — works for machine parsing but breaks human reading; markdown section is better for mixed audience.

### Decision 2: List-per-scope syntax (markdown nested list)
```markdown
## Context Paths
clients:
  - context/200iq-labs/clients
prospects:
  - context/200iq-labs/prospects
  - context/qamera/prospects
projects:
  - context/projects
```

Rationale: skills already read markdown; nested lists are unambiguous to the LLM; no YAML parser needed. Scope types are free-text (not a fixed enum) — the skill looks up only the scope types it cares about (`clients`, `projects` today), others can be added by other skills later.

Alternatives considered:
- **Flat table** — less flexible for multi-path.
- **YAML fenced block** — same syntax as markdown list above but with fence; adds parse complexity for no benefit.

### Decision 3: Multi-path behavior — process all matches, no prompt
When `/ingest LAVEL` is run and `LAVEL` exists in more than one declared path, ingest processes in all. User explicitly accepted this (exploration pyt. 13 follow-up): "nic nie szkodzi żeby zrobić ingest od razu w dwóch miejscach jednocześnie jeśli nazwy się pokrywają".

Alternatives considered:
- **Prompt for disambiguation** — interrupts flow; user rejected.
- **First-match wins** — surprising for the second occurrence; silently ignores data.

### Decision 4: Missing-section error is actionable, not silent fallback
If `CLAUDE.md` has no `## Context Paths`, `/ingest` halts with a message containing a copy-pasteable example block. No fallback to `context/plsoft/` — that would mask misconfiguration and leak the old hardcode.

### Decision 5: Companion prompt for `agentic-ai-private`, not automated
`shared-skills` cannot reach into its consumers. The companion is a short, copy-pasteable prompt saved in `design.md` (below) that the user runs in the `agentic-ai-private` repo right after pulling the new submodule commit.

## Risks / Trade-offs

- **Risk**: Consumer repos that pull shared-skills before updating their `CLAUDE.md` will see `/ingest` fail.
  → **Mitigation**: Clear error message with fix; companion prompt provided for `agentic-ai-private`; `agentic-ai-system` has not yet adopted so no breakage.

- **Risk**: LLM parses the nested list inconsistently across sessions.
  → **Mitigation**: Skill instructions show the exact expected format and give a worked example in the skill body.

- **Risk**: Scope type naming drift (one repo uses `clients`, another uses `customers` for the same concept).
  → **Mitigation**: Non-goal for this change; accepted — each skill declares which scope types it reads. Future change can introduce aliases if needed.

- **Trade-off**: Convention lives in prose (`CLAUDE.md`) rather than a machine-parseable file. Easier to write, harder to validate. Acceptable for now given the single-operator scale.

## Migration Plan

1. Merge this change in `shared-skills` (new spec + updated `SKILL.md`).
2. In `agentic-ai-private`:
   - Update submodule pointer: `git submodule update --remote shared-skills`.
   - Apply companion prompt (see below) to add `## Context Paths` to `CLAUDE.md`.
   - Verify: run `/ingest` on a client with an inbox file; confirm behavior unchanged.
3. In `agentic-ai-system`: proceed with change `adopt-client-project-structure` (which updates its `CLAUDE.md` with `## Context Paths` as part of its own scope).

**Rollback**: revert the SKILL.md change in shared-skills (single file). The new spec file can stay — it describes a convention that remains valid whether or not the skill has adopted it.

### Companion prompt for `agentic-ai-private`

Run this in the `agentic-ai-private` repo after updating the submodule:

> Dodaj do `CLAUDE.md` nową sekcję `## Context Paths` zaraz za sekcją "Context Files" (ok. linia 26). Treść:
>
> ```markdown
> ## Context Paths
>
> Declarative paths consumed by skills that operate on context folders (e.g. `/ingest`). Each scope type lists the folders the skill should scan.
>
> clients:
>   - context/plsoft/clients
> projects:
>   - context/plsoft/projects
> ```
>
> Następnie uruchom `/ingest` na dowolnym istniejącym kliencie z plikiem w `inbox/` i potwierdź, że zachowanie jest identyczne z wcześniejszym (plik przetworzony, zarchiwizowany, `catalog.md` i `_index.md` zaktualizowane).

## Open Questions

- Should `/ingest` emit a warning (not error) if `## Context Paths` contains a scope type it doesn't recognize? → Default: ignore silently. Other skills may care.
- Should the spec enforce a minimum set of scope types (e.g. at least `clients` or `projects`)? → No; skills decide what they need. Empty `## Context Paths` is valid (nothing to ingest).
