# Design — review-via-codex

## Context

See `proposal.md` — Why. The facts that shape the approach:

- The Codex plugin exposes review as two slash commands, `/codex:review` and
  `/codex:adversarial-review`. Both carry `disable-model-invocation: true`: a skill cannot run them.
  Both are thin wrappers over one runtime script, `scripts/codex-companion.mjs`, inside the
  plugin's install directory.
- `codex-companion.mjs review [--base <ref>] [--scope auto|working-tree|branch] [--json]` runs the
  built-in reviewer in the foreground. With `--json` it prints a payload whose `codex.status` is the
  exit status and whose `codex.stdout` is the review text. It accepts no instructions of its own.
- The review text, as observed in trial runs, is a short verdict followed by a block:

  ```
  Full review comments:

  - [P1] <title> — <absolute path>:<start>-<end>
    <body>
  ```

  A clean review is the verdict paragraph alone, with no findings marker (task 1.1, below).
- `codex-companion.mjs setup --json` reports whether Codex is installed and authenticated.
- The install directory is recorded in `~/.claude/plugins/installed_plugins.json` under
  `codex@openai-codex`. The cache can hold more than one version at once — on the owner's machine
  `1.0.2` is the installed one while `1.0.4` sits beside it — so the highest version on disk is not
  the installed one.
- Codex reads `AGENTS.md` in the repository root, the way Claude reads `CLAUDE.md`.
- A Bash call in the foreground is capped at 600 s. Trial reviews of small diffs took 40–97 s;
  Copilot's reviews of growing branches took 8–16 min. Codex reviewed an 11-file, 988-line diff in
  81 s (task 1.4, decision 4).

## Goals / Non-Goals

**Goals:**

- One review mechanism for both skills; `review-loop` keeps delegating each round to `review-fix`
  in a sub-agent.
- Every way the review can fail ends visibly as `error`; nothing fails into "clean".
- The record of what was found and decided lives in the repository, inside the change, and reaches
  the pull request.

**Non-Goals:**

- Parsing Codex output beyond what the loop needs (severity, location, title, body).
- Matching findings across rounds by string equality — Codex rewords freely.
- Any change to the sign-off record (step 6.4) beyond the text of its follow-up lines.

## Decisions

### 1. Call the plugin's runtime, located through the install record

The skills run `node "<installPath>/scripts/codex-companion.mjs" review --base <ref> --json`, with
`installPath` read from `installed_plugins.json`. Pre-flight runs `setup --json` once and stops on
anything other than ready and authenticated.

*Alternatives.* Invoking `codex` directly would skip the plugin's target selection, job tracking
and authentication check, and duplicate them in two skills. Vendoring the script would drift from
the installed plugin. Picking the highest version directory is wrong on the owner's own machine
today.

### 2. The built-in `review`, parsed; `adversarial-review` stays manual

The structured JSON of `adversarial-review` is tempting, but its prompt is to break confidence in
the change and to approve only when no finding can be defended. Two adversarial trial runs on one
change, before and after a fix, both ended "do not ship". A loop that ends when the reviewer runs
out of important findings needs the built-in reviewer.

The parser reads entries of the form `- [P<n>] <title> — <path>:<start>-<end>` plus the indented
body, and turns absolute paths into repository-relative ones. Recognition is strict in both
directions:

| Exit / `codex.status` | Output | Verdict |
|---|---|---|
| 0 / 0 | at least one entry parsed, every entry under the findings marker parsed | findings |
| 0 / 0 | non-empty text, no findings marker, no line shaped like an entry | clean |
| 0 / 0 | findings marker present, an entry fails to parse | `error` |
| 0 / 0 | neither shape | `error` |
| anything else | — | `error`, with the reviewer's text |

The built-in reviewer takes no instructions, so the review policy and the record reach it only
through the repository: `AGENTS.md` and the record committed in the diff (decision 5).

**What the output looks like (tasks 1.1, 1.2 and 1.4, 2026-10-10, plugin 1.0.2, codex-cli
0.144.1).** Six reviews, all exit 0 with `codex.status` 0:

- *Clean* (1.1, a one-line README fix, 53 s): `codex.stdout` was the verdict alone —
  "The README change accurately reflects the existing `farewell` helper and does not affect code
  behavior or tests." A second clean result (1.2, 74 s) had the same shape in Polish and named a
  finding the record had rejected, in prose, without an entry.
- *Findings*: the verdict paragraph, a blank line, a marker line, then entries. The marker is
  `Review comment:` for one finding and `Full review comments:` for several — both occurred, so the
  parser accepts both. The marker stays in English when the policy makes the model write Polish:
  Codex renders it, not the model.
- An entry is `- [P1] <title> — <path>:<start>-<end>`. The separator is U+2014, the path is
  absolute (`C:\Users\…\src\session.py` on Windows, backslashes included), and the body follows
  indented by two spaces, with a blank line between entries.
- The line numbers can be off: the same `return` on line 20 was reported as `20-20` in two runs
  and `18-18` in a third. The fixer reads around the location rather than trusting the line.

The recognition is implemented once, in `skills/review-fix/scripts/codex-review.mjs`, which both
skills call; the model does not parse the text by eye. A finding with no tag, or a tag outside the
scale, is untagged for ordering (the spec's rule) and counts as important, because its severity
cannot be shown to be minor.

### 3. What the review is run against

- With a pull request: `git fetch origin <baseRefName>`, then `--base origin/<baseRefName>`, so
  the review sees exactly the pull request's diff, whatever the repository's default branch.
- `review-fix` without a pull request: the plugin's `auto` scope (the working tree when dirty,
  otherwise the branch against the default branch). It commits and does not push.
- `review-loop` requires a clean working tree at pre-flight. Uncommitted work would be reviewed and
  then swept into the round's commit.

### 4. Where the review runs, and how long it may take

`review-fix` runs the review itself, so a single pass needs no orchestrator. `review-loop` still
dispatches one `review-fix` sub-agent per round and keeps its own context clean. The loop no longer
schedules wake-ups. A round is synchronous: the sub-agent returns once its review, fixes and push
are done.

The review runs in the foreground with the 600 s cap. **Task 1.4 measured it: 81 s** for the
whole diff of pull request #10 of this repository (11 files, +988/−12, `--base` its parent), against
43–93 s for the small trial diffs. The heaviest review measured sits at under a sixth of the cap, so
the background path (`status <job> --wait --json`, then `result <job> --json`) is not adopted. The
helper stops a review that runs past 540 s and reports it as `error`, so a review that does
outgrow the cap fails visibly inside the Bash call instead of being killed by it. A timeout of the
review itself ends as `error`, never as clean.

The sub-agent's return line grows to carry what the new stop rule reads:

```
{"important_fixed": <int>, "minor_fixed": <int>, "rejected": <int>, "repeated": <int>,
 "clean": <bool>, "pushed_commit_sha": <"40-char sha"|null>, "error": <"message"|null>}
```

### 5. The review record: `openspec/changes/<change>/review.md`

One append-only section per round, headed by the round number, the date and the reviewed sha:

```markdown
## Round 2 — 2026-10-11 — reviewed 5b43127

| id | sev | where | finding | outcome |
|---|---|---|---|---|
| R2-1 | P1 | src/sync.py:40-52 | Lock does not cover the retry path | fixed in 9c01e2a |
| R2-2 | P2 | src/sync.py:88 | Log line carries an email address | rejected: the address is the operator's own login, not customer data |
| R2-3 | P2 | docs/flow.md:12 | Step 3 has no measurable condition | repeats R1-4 |

Checks: `node hooks/selftest.mjs` — 14/14 passed
```

- **Repeated** is the fixer's judgement against the rejected entries — same place, same claim —
  not string equality. A false match would hide a real finding, so a repeated row keeps its own
  location and points at the rejection it matched. A person reopens a finding by deleting that
  rejection.
- **Committed every round**, alone when nothing else changed, so the pull request carries the whole
  record and the next run and the next review read it.
- **Archived with the change.** `openspec archive` moves the directory, record included. **Task 1.3
  confirmed it** (openspec 1.13.2, scratch copy of this repository): with a `review.md` beside the
  artifacts, `openspec validate review-via-codex --strict` passes; `openspec archive
  review-via-codex --yes` moved the change to `archive/2026-10-10-review-via-codex/` with
  `review.md` intact, and applied this change's delta to the main spec (+6, ~1, −3), which then
  validated.

*Alternatives.* A PR comment per round is visible on the timeline, but Codex never reads it, so a
rejection would be judged again in every run. The sign-off issue alone loses everything between
runs. The local `.review-loop.log` is gitignored.

### 6. Policy in `REVIEW.md`, pointer in `AGENTS.md`

`REVIEW.md` in the repository root holds the policy: three passes (bugs, security, compliance with
the change's specs and design), which severities count as important, a cap of five minor findings
per review, and optionally the test paths for decision 8. Two lines in it are machine-read:

```
Important: P0-P2
Test paths: tests/**, **/*.test.ts
```

`AGENTS.md` carries the pointer: read `REVIEW.md` before reviewing, and read
`openspec/changes/*/review.md` before raising a finding again. The plugin ships both as templates
in `templates/`. If task 1.2 shows Codex not following the pointer, the policy moves inline into
the `AGENTS.md` template, and the machine-read lines move with it.

**Task 1.2 result: Codex follows the pointer, so the policy stays in `REVIEW.md`.** A scratch
repository with two planted defects (an inverted expiry check, a swallowed exception in a
best-effort audit call), a `REVIEW.md` whose rule Codex does not follow by default (write every
finding in Polish), and a `review.md` in the branch. Four reviews:

| Run | `REVIEW.md` | `AGENTS.md` pointer | `review.md` rejects | Result |
|---|---|---|---|---|
| control | — | — | — | English; `[P1]` inverted expiry only — the swallowed exception is not raised at all |
| pointer | yes | yes | the swallowed exception | Polish; the same `[P1]` only |
| no pointer | yes | — | the swallowed exception | Polish; the same `[P1]` only |
| pointer, round 2 | yes | yes | the inverted expiry, with a reason | Polish; **clean**: "the reversed comparison was deliberately rejected in the review record and the code has not changed since" |

- The policy was applied with the pointer. In a repository of two files Codex also found
  `REVIEW.md` without it, so the pointer is not the only route in, but it costs one line and is the
  route that does not depend on Codex exploring a larger tree.
- The first rejection says nothing, because the control never raises that finding. The second
  does: Codex withheld a `[P1]` it raised in all three earlier runs, citing the record. A rejection
  can therefore remove a finding from the review itself. The fixer's repeated check stays, because a
  review that does raise it again still has to be caught, and a person reopens a finding by deleting
  its rejection from the record.

**Group 2 checks, same day, through the helper.** The `AGENTS.md` template, put into the round-2
scratch repository, reproduced the 1.2 result: Polish and clean, citing the record (70 s). On a
scratch branch of this repository, a hook that writes to stderr on a malformed payload drew a `[P2]`
saying the diagnostic "lacks the required `ss-hook:` prefix" — a rule placed in that branch's
`REVIEW.md` only, so the citation can only have come from there (49 s). A first attempt with a rule
that `CLAUDE.md` also states was cited too, but could not tell the two sources apart.

*Why not `AGENTS.md` alone.* `REVIEW.md` is the policy file any reviewer can be pointed at,
including a Claude reviewer in CI later. `AGENTS.md` is Codex's own entry point and stays one
pointer long.

### 7. Termination reasons

| Reason | When |
|---|---|
| `clean` | the review was recognised as carrying no findings |
| `minor-only` | the review's findings were all below the importance line; they were fixed or recorded |
| `no-fixes` | the round's important findings were all rejected or repeated |
| `max-iterations` | `--max` reached |
| `error` | any failure, the review's included |

`timeout` and its five outcomes disappear, and so does `no-comments`, renamed to `clean`. The
sign-off record keeps its whole mechanism; only the per-reason follow-up lines in step 6.3 are
rewritten.

### 8. The test guard is a check in the skill, not a hook

Before the commit, `git diff --name-status <round-start-sha>` lists files the round modified or
deleted. A file present at the start of the round and matching the test paths is a protected
test. The paths come from `REVIEW.md`, or by default from `**/test/**`, `**/tests/**`,
`**/__tests__/**`, `*.test.*`, `*.spec.*`, `test_*.py`, `*_test.py` and `*_test.go`. A protected
test passes only with a record row naming the finding and the reason.

*Alternative.* A `PreToolUse` hook would be deterministic before the edit rather than before the
commit. A hook shipped in this plugin, however, would run in every session of every user, not only
during a review round, and the plugin's hooks must never block.

### 9. Skill rewrite goes through `/skill-creator`

The repository requires it for any significant `SKILL.md` change. The trigger boundary also turns
around. `review-fix` now produces a review itself, so the request it must not take is no longer
"review this" but "only tell me what is wrong". That request goes to `/codex:review`, which only
reads. Step 3 of `review-fix` and step 1.3b of `review-loop` change accordingly, and the trigger
evals are re-measured against the 80% bar.

### 10. Behavioural cases are `claude plugin eval` cases, not `evals.json` entries

`behavioural-skill-evals` (proposed in #21, not yet implemented) moves the behavioural cases of
both review skills to `claude plugin eval` and asks this change to write its new cases in that
format from the start. They go to `evals/cases/review-fix/` and `evals/cases/review-loop/`,
shaped as that change's D2–D5 fix them:

- one directory per case, `<id>-<slug>`, with `prompt.md` (frontmatter `name: <skill>-<id>-<slug>`,
  tags `[<skill>, tier-read]`, `allowed_tools: [Skill, Read, Glob, Grep]`) and `graders/*.md`;
- **decision cases**: the prompt names the skill in prose, states the run's state partway through
  (a `setup --json` payload, a review's text, a `review.md` row), asks what the skill does, and says
  not to run anything; `tool_used: Skill` is the plugin-fired indicator;
- at least one deterministic grader (`regex`) on the answer; `llm` graders only on the final
  message, with concrete PASS and FAIL lines;
- a read-only scaffold where the state is a file — a `review.md` holding a rejection, a
  `REVIEW.md` that moves the importance line.

Every case is `tier-read`. The shell tier (a fake `codex-companion.mjs`, a fake `gh`) waits for
that change's spikes S1 and S2, so the halves of a case where the command's shape is the point —
the parser on real output, `git diff --name-status` in the test guard — are listed as pending in
the skills' `evals/README.md`. New ids continue each skill's numbering; the rewritten ordering
cases of `review-fix` keep 7–9, so the mapping stays traceable.

This change does not add the manifest key `experimental.evals` (that change's task 1.1). Every
command passes `--eval-dir evals/cases`, and `evals/cases/results/` is gitignored. The cases this
change keeps (`review-loop` 4–5 and 6–15, `review-fix` 2) stay in `evals.json` for that change's
group 5 to migrate, as its D11 provides for this merge order. They are re-run here from scratch
copies in the same format, so "kept and still passing" is graded rather than read off a transcript.

The comparison with the base revision is done by hand until `tools/plugin-eval-compare.py` exists:
a detached worktree of `origin/master`, the branch's cases copied in, one run per case. A new case
is expected to fail there, since the base has no Codex path. That is the flip that shows the case
measures the change.

## Risks / Trade-offs

- [The plugin changes its arguments or output format] → strict recognition ends the run as `error`
  quoting the output; the README names the plugin version the skills were verified against.
- [Codex keeps finding new `P2`s every round] → `--max` caps it; the report shows what each round
  found, and `REVIEW.md` can move the importance line.
- [A wrong "repeated" match hides a real finding] → the row stays in the record with its location,
  and a person reopens it by deleting the rejection.
- [Codex ignores the `AGENTS.md` pointer] → task 1.2 checks it before any skill text is written;
  fallback is inline policy (decision 6).
- [A large diff outlasts 600 s] → task 1.4 measures it; fallback is a background run plus
  `status --wait` (decision 4).
- [The plan's Codex allowance runs out mid-loop] → `error` with the reviewer's message; the
  sign-off record carries it.
- [Users without a ChatGPT plan lose both skills] → **BREAKING** in `CHANGELOG.md` and `README.md`;
  pre-flight names `/codex:setup`.
- [Copilot's automatic review keeps posting on repositories that have it switched on] → README
  note. Switching it off is a per-repository setting outside this plugin.

## Migration Plan

1. Ship both skills, the templates, this repository's own `REVIEW.md` and `AGENTS.md`, and a
   **BREAKING** changelog entry in one plugin release.
2. Users: `/codex:setup`, then add `REVIEW.md` and the `AGENTS.md` pointer from the templates.
3. Owner's repositories: switch off Copilot's automatic review where it is on.
4. Rollback: revert the release commit and `claude plugin update ss@shared-skills`. The Copilot
   versions come back unchanged from git history.

## Open Questions

- None left from group 1. The shell tier of `behavioural-skill-evals` (its spike S2) will say
  whether the install record is readable inside an eval run; if it is not, the helper needs an
  `EVAL_*` override for the runtime path, which is a change to decision 1 for later.
