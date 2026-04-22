---
name: slides
description: "Markdown-to-presentation workflow using Marp. Generate PDF decks (LinkedIn carousels, talk slides, workshop materials) from markdown sources. Triggers on '/slides:*' commands (init, explore, new, draft, build, tweak, archive). Also triggers on 'zrób deck', 'wygeneruj prezentację', 'carousel linkedin', 'marp', 'prezentacja z markdown', 'slajdy na wystąpienie', 'slajdy z posta', 'generate slides', 'make a deck'."
license: Apache-2.0
---

# slides — Markdown-to-Presentation Workflow

Turn markdown (posts, notes, briefs, inline prompts) into PDF decks via Marp. All artifacts live in `slides/` at repo root; rendering happens locally through `npx @marp-team/marp-cli`. The skill is brand-agnostic: it uses Marp's built-in themes by default and optionally generates a custom branded theme from the target repo's brand reference.

## When to use

**Use this skill when the user:**
- Invokes any `/slides:*` command (`init`, `explore`, `new`, `draft`, `build`, `tweak`, `archive`)
- Asks to generate a presentation, deck, carousel, or slides from markdown
- Mentions Marp, LinkedIn carousel (document post), or wants to convert a post/article into slides
- Wants to iterate on slide content before rendering

**Do NOT use when:**
- User wants to edit an existing PPTX or Keynote file (Marp is markdown-only)
- User needs heavy per-slide custom layouts with designer-like control (Figma/Canva territory)

## Invocation

The skill is invoked via one of seven slash commands, each mapping to a phase in the lifecycle:

```
/slides:init                         → bootstrap slides/ structure in this repo
/slides:explore <topic>              → brainstorm before committing to a workspace
/slides:new <slug> [--context <m>]   → create active workspace for a deck
/slides:draft [instruction]          → generate/iterate content (draft.md)
/slides:build [--html]               → render draft.md → slides.md → PDF
/slides:tweak <instruction>          → adjust layout on slides.md, re-render
/slides:archive [slug]               → move workspace to archive, keep PDF
```

The slash commands in `.claude/commands/slides/` are thin wrappers that route here with the appropriate mode. The rest of this document is the single source of truth for behavior in every mode.

## Lifecycle (OpenSpec-inspired)

```
explore (optional)     →  _explore/<slug>-ideas.md
       ↓
   new <slug>          →  workspace/<slug>/{brief.md, draft.md, sources/}
       ↓
   draft (iterate)     →  workspace/<slug>/draft.md       (plain markdown)
       ↓
   build               →  workspace/<slug>/slides.md      (Marp markdown)
                       →  output/<slug>.pdf               (final)
       ↓
   tweak (optional)    →  workspace/<slug>/slides.md patched, re-rendered
       ↓
   archive             →  archive/<slug>/ (full workspace)
                       →  output/<slug>.pdf remains
```

**Separation of concerns:**
- **draft.md** = content (what the deck says, prose per slide, no Marp syntax)
- **slides.md** = form (Marp frontmatter + `---` separators + layout classes)
- `/draft` edits content only; `/tweak` edits form only. This keeps iterations focused.

## Folder conventions

Every repo using this skill has the following layout at its root (created by `/slides:init`):

```
slides/
  project.md                # per-repo narrative guidance (audience, tone, language, brand)
  config.yaml               # per-repo structured defaults (theme, format, author, footer, versions)
  themes/                   # custom CSS themes (optional — empty folder is fine)
    <name>.css              # present only if init generated a brand theme
  workspace/                # active decks — each in its own subfolder
    <slug>/
      brief.md              # frontmatter metadata (see "Brief schema" below) + short narrative brief
      sources/              # source materials (copied/linked .md, .txt, .html) — all read by /draft
      draft.md              # iterable content, plain markdown, one level-1 heading per slide
      slides.md             # (after /build) Marp markdown, frontmatter + slide separators
      notes.md              # (optional) speaker notes, decisions, iteration log
  output/                   # final renders, flat
    <slug>.pdf
    <slug>.html             # only when /build --html was used
  archive/                  # archived workspaces — structure matches workspace/
    <slug>/...
  _explore/                 # brainstorm artifacts, pre-workspace
    <slug>-ideas.md
```

**Top-level `slides/` rule:** do NOT nest `slides/` inside `context/` or project folders. The whole point of centralization is discoverability and portability between repos. Project/client relevance is captured in brief frontmatter, not folder paths.

## Brief schema

Every workspace has a `brief.md` whose frontmatter drives downstream commands. Required keys:

```yaml
---
slug: my-deck                  # kebab-case, matches folder name
title: "My Deck — working title"
context: ""                    # optional tag, free-form string (e.g., "projects/<name>", "clients/<name>", "personal", or blank)
audience: "e.g., LinkedIn tech followers, PL"
format: carousel-square        # carousel | carousel-square | talk | workshop
duration: ""                   # e.g., "30 minutes" for talks; blank for carousels
language: pl                   # pl | en
theme: default                 # theme name; "default" = Marp built-in; otherwise name of CSS in slides/themes/
created: 2026-04-22
status: draft                  # draft | built | archived
---
```

**Format implications:**
| format | size | paginate | typical slides |
|---|---|---|---|
| `carousel` | 16:9 | true | 6–10 |
| `carousel-square` | 1:1 (1080×1080) | false | 6–10 |
| `talk` | 16:9 | true | 15–30 |
| `workshop` | 16:9 | true | 20–60 |

Body of `brief.md` (below frontmatter) is a short narrative: goal, hook, key takeaway, 3–5 bullet points of structure.

## Config schema (`slides/config.yaml`)

```yaml
# Required
default_theme: default           # "default" | "gaia" | "uncover" (Marp built-ins) or custom theme name (matches a CSS file in themes_dir)
default_format: carousel-square
default_size: 1080x1080          # overridden by format when known
author: ""                       # used in footer template
footer: ""                       # free-form footer text; empty = no footer
themes_dir: slides/themes        # where custom CSS themes live, passed to Marp as --theme-set
marp_cli_version: "^3"           # semver range for npx call

# Optional — triggers custom theme generation on /slides:init
brand_reference: ""              # path to a brand-design document (markdown with color/typography tables). If set and the file exists, init generates a branded theme CSS from the template.
brand_theme_name: ""             # target theme filename (without .css). Required if brand_reference is set.
```

Read on every command invocation. Users override per-deck via brief frontmatter.

## Project doc (`slides/project.md`)

Narrative guidance the agent reads before generating any content. Covers:
- **Audience:** who consumes these decks most often
- **Tone:** direct/casual/formal, language preferences, inclusivity
- **Language default:** e.g., `pl` or `en`
- **Brand:** pointer to brand reference (if any) and key points
- **Primary formats:** which formats dominate (affects default suggestions)
- **Anti-patterns:** what to avoid (e.g., generic stock imagery, overly corporate language)

Treated like `openspec/project.md` — not ingested verbatim, but informs tone and choices.

## Theme strategy

The skill ships with **zero branded CSS**. Themes come from three sources:

1. **Marp built-ins** (default): `default`, `gaia`, `uncover`. Always available, no setup. Good enough for most decks.
2. **Custom repo themes:** user drops a CSS file into `slides/themes/` and references it by name from `brief.md` or `config.yaml`. Marp picks it up via `--theme-set slides/themes/`.
3. **Generated from brand reference:** if `slides/config.yaml` declares both `brand_reference` (path to a brand doc) and `brand_theme_name`, `/slides:init` parses the brand doc and generates `slides/themes/<brand_theme_name>.css` from the template shipped with this skill (`themes/brand-dark-template.css`). Re-runnable via `/slides:init --regenerate-theme`.

### Brand reference parser (used only when config.brand_reference is set)

The parser looks for:
- **Color tables** under headings matching `/color|palette|token/i` in the brand doc. Expected columns include a name (`primary`, `primary-500`, `bg`, `text`, etc.) and a hex value. The parser maps recognized semantic names to placeholders in `brand-dark-template.css`:

  | Placeholder | Recognized names (case-insensitive, first match wins) |
  |---|---|
  | `{{PRIMARY}}` | `primary-500`, `primary`, `accent`, `brand` |
  | `{{PRIMARY_LIGHT}}` | `primary-400`, `primary-light`, `accent-light` |
  | `{{PRIMARY_DARK}}` | `primary-700`, `primary-dark`, `accent-dark` |
  | `{{SECONDARY}}` | `secondary-500`, `secondary`, `accent-2` |
  | `{{BG_MAIN}}` | `dark-900`, `bg`, `bg-main`, `background` |
  | `{{BG_CODE}}` | `dark-800`, `bg-code`, `code-bg` |
  | `{{BG_CARD}}` | `dark-700`, `bg-card`, `card-bg` |
  | `{{BORDER}}` | `dark-600`, `border`, `divider` |
  | `{{TEXT}}` | `gray-100`, `text`, `text-primary`, `body` |
  | `{{TEXT_HEADING}}` | `text-heading`, `heading`, defaults to `#ffffff` if absent |
  | `{{TEXT_MUTED}}` | `gray-500`, `text-muted`, `muted`, `caption` |

- **Typography** under headings matching `/typograph|font/i`. Expected to list a sans font and a mono font (by name or family). Maps to `{{FONT_SANS}}` and `{{FONT_MONO}}`. `{{FONT_IMPORT_URL}}` is constructed as the Google Fonts `@import` URL for the discovered fonts with common weight ranges.

If any placeholder has no match, the parser falls back to sensible defaults (`#ff4081`, `#000000`, `Inter`, `JetBrains Mono`) and WARNS the user — encourage them to add the missing token to the brand doc or edit the generated CSS manually.

### No brand reference → no custom theme

If `brand_reference` is empty or the file doesn't exist, `/slides:init` does NOT create anything in `themes/`. The skill uses Marp's `default` theme. User can always drop their own CSS into `slides/themes/` later and reference it by filename-without-extension.

## Marp syntax essentials

### Frontmatter (top of `slides.md`)
```yaml
---
marp: true
theme: default                 # or custom theme name matching a file in themes_dir
size: 16:9                     # or 1:1, 4:3
paginate: true
header: ""                     # optional
footer: ""                     # optional, from config
---
```

### Slide separators
Each `---` on its own line starts a new slide.

### Per-slide directives
Inline HTML-style comments within a slide (must be first lines of that slide):
```markdown
<!-- _class: lead -->          # apply class 'lead' to this slide only
<!-- _backgroundColor: #0a0a0a -->
<!-- _paginate: false -->
```

Global directives (affect all following slides until overridden):
```markdown
<!-- class: content -->
<!-- backgroundColor: #0a0a0a -->
```

### Layout classes
Marp built-in themes ship with their own classes (e.g., `gaia` offers `lead`, `invert`). Custom themes can define additional classes. The `brand-dark-template.css` shipped with this skill defines:

| class | purpose |
|---|---|
| `lead` | Title slide — large centered title with gradient accent |
| `content` | Default — title + body (no class needed) |
| `section` | Section divider — single centered heading |
| `quote` | Pulled quote — large italic text, attribution |
| `code` | Code-focused slide — enlarged mono font |
| `end` | Closing slide — CTA, contact info |

Use as `<!-- _class: lead -->` at start of slide. When using Marp's built-in themes, prefer the classes they document in the Marp docs.

### Images
```markdown
![bg](image.png)                    # full-bleed background
![bg fit](image.png)                # fit, not cover
![bg right:40%](image.png)          # split layout: image on right, content on left
![w:400](image.png)                 # inline, sized
```

### Speaker notes
```markdown
<!--
These are speaker notes, visible in HTML presenter mode.
Not exported to PDF (by default).
-->
```

## Rendering command

Standard invocation (all modes that render):
```bash
npx --yes @marp-team/marp-cli@<pinned-version> \
  slides/workspace/<slug>/slides.md \
  --theme-set slides/themes/ \
  --pdf \
  --output slides/output/<slug>.pdf \
  --allow-local-files
```

Add `--html slides/output/<slug>.html` when user passes `--html`.

`<pinned-version>` comes from `slides/config.yaml` field `marp_cli_version` (default `^3`).

**Error handling:** if Marp exits non-zero, capture stdout+stderr and show to user. Common causes:
- Missing Chromium → Marp downloads on first run (progress visible)
- Invalid frontmatter → syntax error in slides.md
- Unknown theme name → check `slides/themes/` contents and config

## Mode-specific behavior

The seven command files in `.claude/commands/slides/` each invoke this skill and specify a mode. Below is the behavior for each mode. **If a slash command file contradicts this document, this document wins** — command files are thin routing layers.

### Mode: init

**Purpose:** Bootstrap `slides/` in this repo.

**Steps:**
1. Check Node version: `node --version`. If < 18, halt with error.
2. Check if `slides/` exists:
   - If it does and this is not `--regenerate-theme` invocation, enumerate existing files; for each file in the plan, either skip (exists) or create (missing). Report the summary.
   - If it doesn't, create fully.
3. Create directories: `slides/{workspace,output,archive,themes,_explore}`. Add `.gitkeep` to each empty one.
4. Write `slides/config.yaml` from `templates/config-skeleton.yaml`. Ask the user (or infer):
   - `author` — try `git config user.name`, else blank
   - `footer` — offer "<author> · <brand-name>" pattern if brand reference exists, else blank
   - `brand_reference` — ask user; if they point to a path that exists, set it; otherwise leave blank
   - `brand_theme_name` — if brand_reference is set, ask (default: `brand-dark`)
5. Write `slides/project.md` from `templates/project-skeleton.md`. If the user supplied a `tone-of-voice.md` or similar reference during setup, include key points with attribution; otherwise leave placeholders.
6. **Theme generation (only if `brand_reference` set and file exists):**
   - Parse the brand doc (see "Brand reference parser" above)
   - Substitute placeholders in `themes/brand-dark-template.css` (shipped with this skill)
   - Write output to `slides/themes/<brand_theme_name>.css` with a header comment: `/* Generated from <brand_reference> — regenerate via /slides:init --regenerate-theme. Manual edits may be overwritten. */`
   - Warn on any placeholders that fell back to defaults
   - If `brand_reference` is blank or missing, SKIP this step entirely — Marp built-ins will be used
7. Pre-warm Marp: `npx --yes @marp-team/marp-cli@<version> --version`. Report progress ("Downloading Marp CLI on first run…"). On success, render a tiny dummy deck to verify Chromium cache: create a temp file with one `# Test` slide, render to `slides/.tmp-init.pdf`, then delete it (and the temp source).
8. Print summary: what was created, what was skipped, Node version, Marp version, theme in use (built-in or generated path).

**`--regenerate-theme` flag:**
- Precondition: `brand_reference` and `brand_theme_name` both set in `slides/config.yaml` and the reference file exists
- Re-runs brand-doc parse and theme render only. Overwrites `slides/themes/<brand_theme_name>.css`. Does not touch config, project, directories, or dummy render.
- If the preconditions aren't met, halt with a clear error.

### Mode: explore

**Purpose:** Brainstorm a deck concept before committing to a workspace.

**Steps:**
1. Read `slides/config.yaml` and `slides/project.md` for context. If missing, suggest `/slides:init`.
2. Parse topic from args. If absent, ask the user what they want to present.
3. Conduct interactive brainstorm. Ask (one at a time or grouped, agent's judgment):
   - What's the goal — to inform, persuade, celebrate, teach?
   - Who is the audience (specificity beats generic "tech people")?
   - How long / what format? Suggest format based on topic and channel.
   - What source materials exist? Offer to scan known locations declared in `project.md`.
   - What's the hook — a provocation, a question, a surprising data point?
   - Any structural ideas — "contrarian take + evidence + CTA", "problem → approach → result", "listicle"?
   - Variants: if the agent sees two or three viable angles, name them and ask user to pick.
4. Derive a slug: kebab-case, max 40 chars, lowercase ASCII. If topic is date-sensitive (weekly, event), prefix with date (`YYYY-MM-DD-<topic>`). Confirm slug with user.
5. Write `slides/_explore/<slug>-ideas.md`. If file exists, append a dated section (`## YYYY-MM-DD HH:MM — Round N`) rather than overwriting.
6. Summarize: slug chosen, next step is `/slides:new <slug>` which will consume the ideas file.

**`<slug>-ideas.md` structure:**
```markdown
# <title> — Exploration notes

**Slug:** <slug>
**Created:** YYYY-MM-DD
**Status:** exploring

## Topic
<one-paragraph framing>

## Audience
...

## Goal
...

## Format
carousel-square | carousel | talk | workshop

## Source materials
- path/or/link — <one-line relevance>

## Hook ideas
- ...

## Structural options
### Option A — <name>
<brief outline>
### Option B — <name>
...

## Decisions
- <date> Chose format X because...
- <date> Selected Option A.
```

### Mode: new

**Purpose:** Create active workspace for a deck.

**Steps:**
1. Validate slug (kebab-case, 1–60 chars, lowercase ASCII, digits, hyphens).
2. Check `slides/workspace/<slug>/` — if exists, halt with error pointing to `/slides:draft` for continuation or `/slides:new <different-slug>`.
3. Parse `--context <metadata>`. If present, soft-validate: does `context/<metadata>` (or just `<metadata>` if it's already a full path) resolve to an existing path? Warn if not, continue anyway (user may be planning ahead).
4. Create `slides/workspace/<slug>/` with:
   - `brief.md` from `templates/brief-skeleton.md`, filling frontmatter:
     - `slug: <slug>`
     - `created: <today>`
     - `context: <metadata or "">`
     - `format: <from config default>`
     - `theme: <from config default>`
     - `language: <from config default>`
     - `status: draft`
     - Other fields left as placeholders, with prompt in body asking user to fill
   - Empty `draft.md`
   - Empty `sources/` directory (with `.gitkeep`)
5. Check for `slides/_explore/<slug>-ideas.md`. If exists, pre-fill brief from it: audience, goal, format, hook go into body; add a "## Pre-work" section linking the ideas file.
6. Report: workspace path, summary of pre-fill (if any), next step is `/slides:draft`.

### Mode: draft

**Purpose:** Generate or iterate `draft.md` content.

**Steps:**
1. Resolve target workspace:
   - If slug passed as positional arg (`/slides:draft <slug> [instruction]`), use it.
   - Else, pick the most-recently-modified subfolder under `slides/workspace/`. Display the chosen target explicitly before proceeding.
2. Read `brief.md` frontmatter + body, `slides/project.md`, `slides/config.yaml`, and all files under `sources/`. Also read `slides/_explore/<slug>-ideas.md` if present (for additional context).
3. Determine operation:
   - **Initial draft:** `draft.md` is empty or only contains placeholder. Generate fresh content.
   - **Patch:** `draft.md` is non-empty and instruction is provided. Apply targeted edit, preserve unaffected slides verbatim.
   - **Review:** `draft.md` non-empty, no instruction. Summarize current state and ask what to change.
4. Output format — plain markdown:
   - Each slide = one `## Slide N — <title>` heading
   - Below heading: bullet points or prose for slide content
   - Speaker notes (optional): `> note:` lines
   - NO Marp frontmatter, NO `---` separators between slides (those come in `/build`)
   - Slide count guided by brief format (see format→count table above)
5. Respect manual user edits: diff the current `draft.md` vs your last known state (from this session). If user edited manually, treat their version as canonical — do not revert.
6. After write, report: slide count, total word count, which slides changed (if patch), and suggestion to `/slides:build` when ready.

**Content quality guardrails:**
- Hook on slide 1: concrete, specific, ideally with a number or provocation.
- Body slides: one main idea per slide. If a slide has >40 words of prose, suggest splitting.
- CTA on final slide (or last two): explicit ask — follow, comment, link, next action.
- Language: match brief `language` field (default from project.md).

### Mode: build

**Purpose:** Transform `draft.md` into Marp `slides.md` and render to PDF.

**Steps:**
1. Resolve target workspace (same rule as draft mode).
2. Verify `draft.md` is non-empty. If empty, halt with instruction to run `/slides:draft` first.
3. Read brief frontmatter. Determine:
   - Theme: brief.theme or config.default_theme (use Marp built-in if equals `default`/`gaia`/`uncover`)
   - Size: from format→size table
   - Paginate: format dependent
   - Footer: config.footer (blank = no footer directive)
4. Transform `draft.md` → `slides.md`:
   - Prepend frontmatter (marp, theme, size, paginate, optional footer)
   - Replace `## Slide N — <title>` with slide content under the title (promote to `#` or keep as `##` per theme defaults)
   - Insert `---` between slides
   - Apply first-slide `<!-- _class: lead -->` for title slide (when the theme supports it — for Marp built-ins, `lead` exists in `gaia` and `uncover`, NOT in `default`)
   - Apply last-slide `<!-- _class: end -->` for closing slide (only if the chosen theme defines `end`)
   - Convert `> note:` lines to `<!-- ... -->` speaker notes
5. Invoke Marp CLI (see "Rendering command" above) with `--pdf`. Add `--html` flag if user requested.
6. Write outputs to `slides/output/<slug>.pdf` (and `.html`). Overwrite existing.
7. Update `brief.md` frontmatter: `status: built`.
8. Report: output paths, file sizes, render time. Suggest `/slides:tweak` for layout adjustments or sharing path for the PDF.

### Mode: tweak

**Purpose:** Adjust layout on `slides.md` without touching `draft.md`.

**Steps:**
1. Resolve target workspace.
2. Verify `slides.md` exists. If not, halt: "run /slides:build first".
3. Record `draft.md` mtime before edit.
4. Apply user instruction to `slides.md` only. Typical tweaks:
   - Split a dense slide into two
   - Change a slide's `_class` (e.g., `content` → `quote`)
   - Add/remove a `<!-- _backgroundColor: ... -->` directive
   - Reorder slides
   - Adjust footer/header for specific slides
5. Verify `draft.md` mtime unchanged. If changed, halt with error (defensive — should not happen).
6. Re-invoke Marp CLI (same as build mode's render step).
7. Report: what changed in slides.md, re-render status.

### Mode: archive

**Purpose:** Move completed workspace to archive, preserve output.

**Steps:**
1. Resolve target (explicit slug arg or most-recently-modified active workspace).
2. Verify `slides/workspace/<slug>/` exists. If not, halt with error.
3. Move: `slides/workspace/<slug>/` → `slides/archive/<slug>/`. Preserve mtimes.
4. Verify `slides/output/<slug>.pdf` exists. If not, warn (archive proceeds).
5. Optionally update `brief.md` (now in archive) frontmatter: `status: archived`.
6. Report: archive path, output path (confirming it's still there), hint that `/slides:new <slug>` can reuse the slug later (archive doesn't reserve the name in workspace/).

## Context Dependencies

Required (for full workflow):
- `slides/config.yaml` — created by `/slides:init`
- `slides/project.md` — created by `/slides:init`

Recommended (if repo has branding):
- A brand reference doc declared in `config.brand_reference` — triggers custom theme generation on init
- A tone-of-voice reference declared in project.md — enriches project-level guidance

If any required file is missing when a workflow command (not `init`) runs, halt and instruct the user to run `/slides:init`.

## Dependencies

- Node 18+ (runtime for Marp CLI)
- `@marp-team/marp-cli` (pinned via config, pulled via `npx --yes` — no global install)
- Chromium — downloaded automatically by Marp CLI on first PDF render

## Known limitations (Phase 1)

- Only the bundled `brand-dark-template.css` for brand generation; light/hybrid templates are post-Phase-1
- Only PDF (default) and HTML (opt-in); no PPTX or PNG
- No LinkedIn auto-publish; user uploads PDF manually
- Chromium sandbox issues on some Linux setups — Marp CLI docs cover workarounds
