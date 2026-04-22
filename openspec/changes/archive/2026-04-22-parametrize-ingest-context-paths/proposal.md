## Why

The `/ingest` skill hardcodes PLSoft-specific paths (`context/plsoft/clients/`, `context/plsoft/projects/`) into its instructions. This breaks reusability — any other repo using shared-skills cannot use `/ingest` without adopting the `plsoft/` prefix, which is semantically nonsensical outside PLSoft. The 200IQ LABS repo (`agentic-ai-system`) is about to adopt a client/project management structure and needs `/ingest` to work with its own paths.

## What Changes

- **BREAKING**: Remove hardcoded `context/plsoft/clients/` and `context/plsoft/projects/` path references from `skills/ingest/SKILL.md`.
- Introduce `## Context Paths` convention in project `CLAUDE.md` — declarative section listing paths per scope type (`clients`, `customers`, `prospects`, `projects`), as a YAML-like nested list supporting **multiple paths per scope type**.
- `/ingest` reads `## Context Paths` from the current project's `CLAUDE.md` and operates on all declared paths.
- When a name passed to `/ingest NAME` matches entries in multiple declared paths, the skill ingests in **all matches** (no disambiguation prompt) — consistent with user decision to accept parallel processing.
- When `## Context Paths` section is missing from `CLAUDE.md`, the skill fails with a clear error instructing how to add the section.
- **Companion migration (not code, but documented)**: `agentic-ai-private/CLAUDE.md` must receive a `## Context Paths` section (declaring `clients: context/plsoft/clients`, `projects: context/plsoft/projects`) before the next submodule pull, to avoid breakage.

Out of scope:
- Multi-scope name resolution with disambiguation (explicitly deferred).
- Airtable/Stripe sync skills (separate change in `agentic-ai-system`).

## Capabilities

### New Capabilities
- `context-paths-config`: Declarative convention in project `CLAUDE.md` defining where context folders live per scope type (clients, customers, prospects, projects). Consumed by skills that operate on context folders.

### Modified Capabilities
<!-- None: existing specs (context-layer, etc.) do not describe the ingest skill's path resolution. The ingest skill behavior is covered implicitly by the skill file, not by a formal spec yet. -->

## Impact

- **File modified**: `skills/ingest/SKILL.md` — path references replaced by lookup into `## Context Paths` section of project `CLAUDE.md`.
- **File created**: `openspec/specs/context-paths-config/spec.md` (via this change).
- **Cross-repo impact**:
  - `agentic-ai-private` (submodule consumer): requires `CLAUDE.md` update to add `## Context Paths`. A companion prompt (documented in `design.md`) is provided for the user to run manually in that repo after this change merges.
  - `agentic-ai-system` (submodule consumer): depends on this change to adopt the new structure in the follow-up change `adopt-client-project-structure`.
- No new dependencies. No API surface changes outside skill instructions.
