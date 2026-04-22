---
name: ingest
description: "Process raw files from client or project inbox into structured knowledge.
  Use when user wants to ingest a transcript, CSV, email, or any raw data into a
  client's or project's knowledge base. Triggers on '/ingest', 'process inbox',
  'przetworz transkrypcje', 'wrzuc do bazy wiedzy', 'przetwórz dane klienta',
  'przetwórz dane projektu'. Also triggers when user pastes text with '/ingest NAME'
  prefix. Przetwarzanie danych klienta/projektu, transkrypcje ze spotkan, import
  danych, wciaganie informacji do systemu."
license: Apache-2.0
---

# /ingest — Data Ingestion

Process raw files from a client's or project's `inbox/` folder (or inline text) into
structured knowledge files in the appropriate `data/` directory.

## Invocation

```
/ingest                          → scan inbox/ of all declared client AND project folders
/ingest NAME                     → scan this client's or project's inbox/
/ingest NAME <text>              → process inline pasted text
```

## Context Paths contract

This skill is project-agnostic. It resolves folder locations from a `## Context Paths`
section in the current project's root `CLAUDE.md`. The section declares scope types
as keys and one or more repo-relative folder paths as values, in a markdown nested list.

**Expected format:**

```markdown
## Context Paths

clients:
  - context/<org>/clients
projects:
  - context/<org>/projects
```

**Scope types consumed by this skill:** `clients`, `projects`. Other scope types
(`customers`, `prospects`, `partners`, etc.) are ignored silently — they may be
consumed by other skills.

**Multi-path behavior:** a scope type MAY list multiple paths. When resolving a
name or scanning inboxes, the skill processes **all** matching folders across
**all** declared paths. No disambiguation prompt: parallel ingest across matches
is the accepted behavior.

**Missing section — halt with actionable error:** if `CLAUDE.md` does not contain
a `## Context Paths` section, stop before any file operation and print:

> `/ingest` requires a `## Context Paths` section in the project's `CLAUDE.md`.
> Add a section like this, then retry:
>
> ```markdown
> ## Context Paths
>
> clients:
>   - context/<org>/clients
> projects:
>   - context/<org>/projects
> ```

**Empty section — no-op, not an error:** if the section exists but declares no
scope types (or all lists are empty), report "no folders configured" and exit
cleanly.

## Prerequisites

Before processing, resolve paths from `## Context Paths` in the project `CLAUDE.md`.
Let `<clients_paths>` and `<projects_paths>` be the lists of declared folders for
those scope types (each may be empty or contain multiple entries).

Then read files in order:

**For clients:**
1. If no name specified: each `<clients_path>/_index.md` across all declared client paths (find clients with inbox files)
2. Client's `catalog.md` (understand existing knowledge files)
3. Client's `client.md` (identify active projects)
4. Active project's `project.md` (understand scope for routing)

**For projects:**
1. If no name specified: each `<projects_path>/_index.md` across all declared project paths (find projects with inbox files)
2. Project's `catalog.md` (understand existing knowledge files)
3. Project's `project.md` (understand scope)

**Name resolution:** when a `NAME` is specified, search every declared path.
Check `<projects_paths>` first, then `<clients_paths>`. If `NAME` matches in
multiple paths (within or across scope types), process **all** matches in
parallel. If no match in any declared path, report a name-not-found error
listing the paths that were searched.

## Processing Flow

### Step 1: Identify inputs

**File mode:** for each matched folder, scan `<matched_folder>/inbox/` for files.
If no files found in any match, report and stop.

**Inline mode:** user pasted text after the command. Treat as virtual file and
apply to every matched folder (normally there is only one match when text is
pasted inline).

### Step 2: Route to project

1. Read `client.md` → list projects with statuses
2. Filter to **Active** projects only (skip Completed / On Hold)
3. Routing logic:
   - **1 active project** → automatic routing
   - **2+ active projects** → analyze file content vs. each project's scope (from `project.md`)
     - Clear match → automatic
     - Relevant to multiple → update all
     - Ambiguous → ask user
   - **0 active projects** → ask user (may need new project or reactivation)

**Project routing (flat):** projects consumed by this skill have no sub-projects.
All ingested content routes directly to `<matched_folder>/data/`. Read
`project.md` to understand scope.

### Step 3: Identify file type

| Type | Recognition | Processing approach |
|------|------------|-------------------|
| Meeting transcript | Long Q&A, speaker names, `transcript`/`meeting` in name | Extract findings, update existing knowledge files, create new topic files |
| CSV / spreadsheet | `.csv`, `.xlsx`, `.tsv` extension | Analyze data, integrate into relevant `data/` files |
| Email / brief | Email headers, `Re:`, short structured content | Extract decisions/action items to `project.md`, key context to `data/` |
| Client document | PDF, DOCX, structured MD | Read, extract key info to `data/` |
| Unknown | No match | Ask user |

### Step 4: Process content

1. Read the file/text thoroughly
2. Read `catalog.md` → identify existing files in target project's `data/`
3. For each existing knowledge file: determine if new content should be added
4. **Update** existing files with new information (append, merge, enrich)
5. **Create** new files if the content covers a topic with no existing file
6. When creating new files, use descriptive kebab-case names matching the topic

### Step 5: Archive raw source

Let `<matched_folder>` be the client or project folder resolved in Step 1.

**File mode:**
```bash
mv "<matched_folder>/inbox/original-name.ext" "<matched_folder>/archive/YYYY-MM-DD_original-name.ext"
```

**Inline mode:**
Save the raw pasted text to:
```
<matched_folder>/archive/YYYY-MM-DD_inline-<detected-type>.md
```
Example: `archive/2026-04-14_inline-meeting-notes.md`

When multiple folders matched (parallel ingest), repeat the archive step per match.

### Step 6: Generate ingest summary

Create `<matched_folder>/data/ingest-YYYY-MM-DD.md`:

```markdown
# Ingest Summary — YYYY-MM-DD

## Source
- [filename or "inline text"] ([type], [size/line count])

## Actions taken
### Updated files
- filename.md — what was added/changed

### Created files
- filename.md — what it contains and why it was created

## Archived to
- archive/YYYY-MM-DD_filename.ext
```

If multiple ingests happen on the same day, append a counter: `ingest-YYYY-MM-DD-2.md`.

### Step 7: Update indexes

1. Update `<matched_folder>/catalog.md`:
   - Add entries for new files created in `data/`
   - Update dates/summaries for modified files
   - Add archive entry
   - Update `files:` count and `updated:` timestamp in frontmatter

2. Update the `_index.md` of the **declared path** containing the matched folder
   (i.e. `<clients_path>/_index.md` for a client, `<projects_path>/_index.md`
   for a project):
   - Update `Last Activity`
   - Update `Inbox Status` (should now show 0 or fewer files)
   - Add entry to `Recent Changes`
   - Update `updated:` timestamp in frontmatter

When a name matched in multiple declared paths, update the `_index.md` in each
path that contained a match.

### Step 8: Report

Display a summary to the user:
- How many files were processed (and in how many matched folders, if more than one)
- Which knowledge files were updated or created
- Where raw files were archived
- Any issues or questions that need user input

## What /ingest Does NOT Do

- Does not generate PDFs, emails, agendas (user does this in conversation)
- Does not modify `output/` — write-only folder for generated artifacts
- Does not read `archive/` — only writes to it
- Does not change project status — that's a user/agent decision in conversation
- Does not push to git — user commits when ready
