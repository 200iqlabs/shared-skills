---
name: ingest
description: "Process raw files from client inbox into structured knowledge. Use when
  user wants to ingest a transcript, CSV, email, or any raw data into a client's
  knowledge base. Triggers on '/ingest', 'process inbox', 'przetworz transkrypcje',
  'wrzuc do bazy wiedzy', 'przetwórz dane klienta'. Also triggers when user pastes
  text with '/ingest CLIENT_NAME' prefix. Przetwarzanie danych klienta, transkrypcje
  ze spotkan, import danych, wciaganie informacji do systemu."
license: Apache-2.0
---

# /ingest — Client Data Ingestion

Process raw files from a client's `inbox/` folder (or inline text) into structured
knowledge files in the appropriate project's `data/` directory.

## Invocation

```
/ingest                          → scan inbox/ of all clients
/ingest CLIENT_NAME              → scan only this client's inbox/
/ingest CLIENT_NAME <text>       → process inline pasted text
```

## Prerequisites

Before processing, read these files in order:
1. If no client specified: `context/plsoft/clients/_index.md` (find clients with inbox files)
2. Client's `catalog.md` (understand existing knowledge files)
3. Client's `client.md` (identify active projects)
4. Active project's `project.md` (understand scope for routing)

## Processing Flow

### Step 1: Identify inputs

**File mode:** Scan `CLIENT/inbox/` for files. If no files found, report and stop.

**Inline mode:** User pasted text after the command. Treat as virtual file.

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

**File mode:**
```bash
mv "CLIENT/inbox/original-name.ext" "CLIENT/archive/YYYY-MM-DD_original-name.ext"
```

**Inline mode:**
Save the raw pasted text to:
```
CLIENT/archive/YYYY-MM-DD_inline-<detected-type>.md
```
Example: `archive/2026-04-14_inline-meeting-notes.md`

### Step 6: Generate ingest summary

Create `PROJECT/data/ingest-YYYY-MM-DD.md`:

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

1. Update `CLIENT/catalog.md`:
   - Add entries for new files created in `data/`
   - Update dates/summaries for modified files
   - Add archive entry
   - Update `files:` count and `updated:` timestamp in frontmatter

2. Update `clients/_index.md`:
   - Update `Last Activity` for the client
   - Update `Inbox Status` (should now show 0 or fewer files)
   - Add entry to `Recent Changes`
   - Update `updated:` timestamp in frontmatter

### Step 8: Report

Display a summary to the user:
- How many files were processed
- Which knowledge files were updated or created
- Where raw files were archived
- Any issues or questions that need user input

## What /ingest Does NOT Do

- Does not generate PDFs, emails, agendas (user does this in conversation)
- Does not modify `output/` — write-only folder for generated artifacts
- Does not read `archive/` — only writes to it
- Does not change project status — that's a user/agent decision in conversation
- Does not push to git — user commits when ready
