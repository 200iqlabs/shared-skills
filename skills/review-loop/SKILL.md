---
name: review-loop
description: 'Run the whole Claude–Codex review cycle on a pull request unattended — Codex reviews the branch, a fixer judges and fixes the findings, pushes, and the next review runs, until nothing important is left. Use this whenever someone wants the review-and-fix back-and-forth to run by itself across several rounds: "aż przestanie zgłaszać uwagi", "zapętl review i poprawki", "nie chcę tego pilnować", "iterate until the review is clean", "keep cycling codex and fixes until it settles" — even when they never type /review-loop. Takes a PR number and an OpenSpec change name; the change gives the fixer the intent to judge findings against and holds the review record. Do NOT use for a single review-and-fix pass — that is review-fix — nor for an opinion on a pull request, waiting on CI, or polling a deployment.'
---

# Review Loop

Orchestrate an automated Claude↔Codex review cycle on a pull request. Each iteration is one
`review-fix` pass in a sub-agent: Codex reviews the branch against the pull request's base, the
fixer judges each finding against the OpenSpec change, fixes what holds up, records every outcome
in the change's `review.md`, verifies, commits and pushes. The loop ends when a review comes back
clean, when what is left is below the importance line or was rejected, on an error, or at the
iteration cap — and every ending opens a sign-off record that only a person can close.

**Input:** `/review-loop <PR-number> <openspec-change-name> [--max N]`

- `PR-number` — required. The PR to iterate on. No fallback to `gh pr view` on the current branch —
  the PR must be explicit.
- `openspec-change-name` — required. Directory name under `openspec/changes/<name>/`.
- `--max N` — safety-net iteration cap (default `5`). Every iteration spends one Codex review from
  the user's plan; this is what bounds it.

**The helper.** Codex readiness is checked with the script that ships in the sibling `review-fix`
skill:

```bash
HELPER="<this skill's base directory>/../review-fix/scripts/codex-review.mjs"
```

Take the base directory from the line announced when this skill loads, and check the file exists
before pre-flight relies on it.

## Steps

### 1. Pre-flight validation

Run once before iteration 1. Nothing in this step edits, commits or pushes.

1.1. **Detect repo and PR.**

```bash
gh repo view --json nameWithOwner --jq .nameWithOwner
gh pr view <PR> --json number,url,headRefName,baseRefName,state
```

**Note**: do not pipe `gh api` JSON output through `jq` — it may not be installed on all machines.
Parse JSON inline. The `--jq` flag above is safe because it's processed by `gh` itself.

If `state` is not `OPEN`, abort with: `PR #<PR> is not OPEN — current state: <state>`. Otherwise
store `headRefName`, `baseRefName`, `url` and `nameWithOwner`. If the current branch
(`git branch --show-current`) is not `headRefName`, abort and say which branch to check out — the
review reads the local branch, and the loop does not switch branches in someone's working tree.

1.2. **Verify OpenSpec change directory exists.**

```bash
ls openspec/changes/<change-name>/
```

If missing, list nearby candidates:

```bash
ls openspec/changes/
ls openspec/changes/archive/ | tail -10
```

Ask the user: *"I can't find `openspec/changes/<change-name>/`. Candidates listed above. Which is
correct, or should I abort?"* — **pause until user responds**. Do not guess.

1.3. **Check the user wants a cycle driven, not a review written.**

Requests like *"zrób review tego PR-a i powiedz co jest nie tak"* trigger this skill at full rate,
and no wording of the description prevents it — three variants were measured against the trigger
set in `evals/` and none moved the number. Topical overlap beats an exclusion clause, so the check
belongs here instead.

An explicit `/review-loop <PR> <change>` is itself the request for a cycle; this check is for a
skill picked from free text. If nothing in such a request implies repetition — no *until*, *aż*,
*keep going*, *repeat*, no round count, no complaint about having to re-run the review by hand —
then the user wants something else. An opinion with no changes is `/codex:review`, which the user types; one review-and-fix pass
is `review-fix`. Say so in one line and stop.

1.4. **Codex is ready.**

```bash
node "$HELPER" preflight
```

Exit 2 (`"ok": false`) means the Codex plugin is not installed, its install record points nowhere,
or Codex is not signed in. Abort before the first review with the `error` field and the next step:
*run `/codex:setup`, then start the loop again.* There is no fallback reviewer.

If `pointer.ok` is false, print **one** warning and continue: the repository's `AGENTS.md` does not
point Codex at `REVIEW.md` and at `openspec/changes/*/review.md` (`pointer.missing` names what is
absent), so the reviewer works without the policy and may raise again what an earlier round
rejected. The templates are `templates/REVIEW_TEMPLATE.md` and `templates/AGENTS_REVIEW_POINTER.md`
in this plugin. The fixer still catches repeats against the record; the warning is about wasted
rounds, not lost decisions.

1.5. **The working tree is clean.**

```bash
git status --porcelain
```

Anything listed aborts the run: *"The working tree has uncommitted changes. Commit or stash them,
then start the loop again."* Uncommitted work would be reviewed as part of the branch and then swept
into the round's commit, under a message that does not describe it.

1.6. **Check for prior incomplete run.**

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
ls "$REPO_ROOT/.review-loop.log" 2>/dev/null
```

If the log file exists, scan it for entries with `"pr": <PR>`. If the most recent entry for this PR
is an `iter-start` or `iter-end` (not a `terminate`) from the last 24 hours, prompt: *"Previous loop
for PR #<PR> stopped at iteration <K>. Resume from iteration <K+1>, or start fresh from iteration
1?"* — wait for user choice, then set `iteration` accordingly. Either way the record carries every
earlier round: `review-fix` numbers its rounds from `review.md`, not from this counter.

1.7. **Ensure `.review-loop.log` is gitignored.**

```bash
grep -q '^\.review-loop\.log$' "$REPO_ROOT/.gitignore" 2>/dev/null
```

If not present, print a warning: *"`.review-loop.log` is not in `.gitignore`. Consider adding it."*
Do not auto-add — user decides.

1.8. **Initialize loop state (in-memory):**

```
iteration          = 1  (or resumed value from 1.6)
totals             = { important_fixed: 0, minor_fixed: 0, rejected: 0, repeated: 0 }
conventions        = []
termination_reason = null
last_pushed_sha    = null
```

1.9. **Write `run-start` log entry** (step 5 has the format).

### 2. Run iteration N

2.1. **Log iteration start** (`iter-start`, step 5).

2.2. **Dispatch the fixer sub-agent.** Use the `Agent` tool with `subagent_type="general-purpose"`,
`description="review-fix iteration <N> for PR <PR>"`, and this prompt (substitute placeholders with
live values):

```
You are running one iteration of an automated Codex review-and-fix loop.

Context:
- PR number: <PR>
- Repository: <owner>/<repo>
- PR branch (headRefName): <branch>; base: <baseRefName>
- OpenSpec change: <change-name>
- Iteration: <N> of <max>

Before doing anything else, read these files to understand the change's intent and scope:
- openspec/changes/<change-name>/proposal.md
- openspec/changes/<change-name>/design.md            (only if it exists)
- openspec/changes/<change-name>/tasks.md
- openspec/changes/<change-name>/specs/**/*.md
- openspec/changes/<change-name>/review.md            (only if it exists — the decisions so far)
- REVIEW.md                                           (only if it exists — the review policy)

Then invoke the review-fix skill for this PR and change:

  Skill(skill="ss:review-fix", args="<PR> --change <change-name>")

It runs the Codex review itself. Judge each finding against the intent in proposal.md and
design.md: a finding that conflicts with a decision documented there is a candidate for a reasoned
rejection, and one the record already rejected is a repeat, not a new question.

CRITICAL RETURN FORMAT:
The LAST LINE of your response must be a single-line JSON object, nothing else on that line. Lines
above may contain prose summary.

{"important_found": <int>, "important_fixed": <int>, "minor_fixed": <int>, "rejected": <int>, "repeated": <int>, "clean": <bool>, "pushed_commit_sha": <"40-char sha"|null>, "conventions": [<"rule">, ...], "error": <"message"|null>}

- the counts come from this round's rows in review.md, as review-fix's summary defines them;
- `clean`: true only when the review itself came back clean;
- `pushed_commit_sha`: the full 40-character sha of the last commit you pushed (`git rev-parse
  HEAD`, not `--short`), or null if nothing was pushed;
- `conventions`: the candidate rules review-fix listed for CLAUDE.md, or [];
- `error`: null on success, or the reason the round could not complete — the review's own error
  text when the review failed, quoted, not paraphrased.

Both nullable fields take a JSON string or the bare literal null. Never the string "null" —
it is truthy, and the loop reads it as a real error and a real sha.

Fixed one P1, rejected a P2:
{"important_found": 2, "important_fixed": 1, "minor_fixed": 0, "rejected": 1, "repeated": 0, "clean": false, "pushed_commit_sha": "5b431277b031648832d09305755ed48431374a4c", "conventions": [], "error": null}

Clean review, record committed and pushed:
{"important_found": 0, "important_fixed": 0, "minor_fixed": 0, "rejected": 0, "repeated": 0, "clean": true, "pushed_commit_sha": "9c01e2a77f3b9d0a6c41e5b2d8f7a1c3e4b5d6f7", "conventions": [], "error": null}
```

2.3. **Parse the sub-agent return.** Take the sub-agent's full return text, split on newlines, find
the last non-empty line, and `JSON.parse` it. If parsing fails:
- Log `iter-error` with the raw line truncated to 200 characters.
- Set `termination_reason = "error"`.
- Show the user the raw sub-agent output (full, not truncated) so they can debug.
- Go to Step 6.

Then normalise. If `pushed_commit_sha` or `error` came back as the *string* `"null"` (or `"none"`,
or empty), replace it with a real `null`; a missing count is 0, a missing `clean` is false, a
missing `conventions` is `[]`. The string `"null"` is truthy, so without this Step 2.4 ends every
good iteration as an error. The return format is a prompt, not a schema the runtime enforces, so
the parser should not assume it was obeyed.

2.4. **If `error` is non-null:**
- Log `iter-error` with the error.
- Set `termination_reason = "error"`.
- Show the error to the user.
- Go to Step 6.

This is where an exhausted Codex allowance, a review that timed out, output the helper could not
read, a failed check, a test changed without a recorded reason and a rejected push all arrive. None
of them is a clean round, whatever the counts say.

2.5. **Update cumulative totals and log iteration end.**

```
totals.important_fixed += parsed.important_fixed
totals.minor_fixed     += parsed.minor_fixed
totals.rejected        += parsed.rejected
totals.repeated        += parsed.repeated
conventions            += parsed.conventions (without duplicates)
if parsed.pushed_commit_sha: last_pushed_sha = parsed.pushed_commit_sha
```

Log `iter-end` with the counts and the commit.

### 3. Decide next action

From `parsed`, first match wins:

3.1. **Clean.** `parsed.clean` is true: the review found nothing. `termination_reason = "clean"`, go
to Step 6.

3.2. **Push expected but missing.** `parsed.important_fixed > 0` and `parsed.pushed_commit_sha` is
null: the fixer reports fixes the pull request does not have. Log `iter-error` with
`"important_fixed>0 but no pushed_commit_sha"`, `termination_reason = "error"`, go to Step 6.

3.3. **An important finding was fixed.** `parsed.important_fixed > 0`: the fix is new material the
reviewer has not seen. Go to Step 4.

3.4. **Only minor findings.** `parsed.important_found == 0`: everything the review raised sat below
the importance line, and the fixer fixed or recorded it. Another review would be spent on findings
that by definition do not justify one. `termination_reason = "minor-only"`, go to Step 6.

3.5. **Important findings, none fixed.** Otherwise every important finding was rejected or repeated.
Their decisions are committed in the record, and a review of the same code would raise the same
things. `termination_reason = "no-fixes"`, go to Step 6.

**Only an important fix starts another review.** The line between important and minor is the one
`REVIEW.md` draws on its `Important:` line — `P0`–`P2` by default. Under `Important: P0-P1`, a round
whose only fixes were `P2` findings ends here as `minor-only` or `no-fixes`, never as another
round. Minor fixes ride along in the round's commit and wait for the next review that an important
fix earns.

### 4. Continue to the next iteration

```
iteration += 1
```

If `iteration > max`: `termination_reason = "max-iterations"`, go to Step 6. Otherwise return to
Step 2. There is no wait between iterations: each review runs as soon as the previous round's push
is done, inside the next sub-agent.

### 5. Run log

Every event is one JSON line appended to `<repo-root>/.review-loop.log`, timestamped in UTC:

```json
{"ts":"<ISO8601-UTC>","pr":<PR>,"change":"<change-name>","event":"run-start"}
{"ts":"<ISO>","pr":<PR>,"event":"iter-start","iteration":<N>}
{"ts":"<ISO>","pr":<PR>,"event":"iter-end","iteration":<N>,"important_found":<n>,"important_fixed":<n>,"minor_fixed":<n>,"rejected":<n>,"repeated":<n>,"clean":<bool>,"commit":"<sha or null>"}
{"ts":"<ISO>","pr":<PR>,"event":"iter-error","iteration":<N>,"error":"<text>"}
{"ts":"<ISO>","pr":<PR>,"event":"terminate","reason":"<termination_reason>","iterations":<N>}
```

`iter-error` carries `"raw":"<first 200 characters>"` instead of `error` when the return line did
not parse. The log is the local trace of the run and what 1.6 resumes from; the record of what was
found and decided is `review.md`, which travels with the pull request.

### 6. Terminate + report

6.1. **Log termination event** (`terminate`, step 5).

6.2. **Print final report to the user — and write the same text to a file.**

```
Review loop finished after <iteration> iteration(s) — reason: <termination_reason>
Totals: important fixed=<n>, minor fixed=<n>, rejected=<n>, repeated=<n>
Record: openspec/changes/<change-name>/review.md
Last commit: <last_pushed_sha or 'none'>
PR: <url>
```

When `conventions` is not empty, add below it:

```
Candidate rules for CLAUDE.md (proposed, not written):
- <rule>
```

The loop never edits `CLAUDE.md` or any other agent instructions itself; a person decides which of
these become rules.

Choose the scratch directory here, because 6.4 needs the same one, and echo it so the later
blocks can be given it literally:

```bash
SCRATCH="${SCRATCH:-$(mktemp -d)}"   # outside the repository; throwaway
echo "scratch: $SCRATCH"
```

Then write that block into `$SCRATCH/report.md` with your **file-writing tool** — not with a
shell heredoc, for the reason 6.4 gives. Printing the report into the session is not enough:
6.4 concatenates that **file** into the record, and the session transcript is exactly what the
record exists to outlive. A report that only ever reached the terminal leaves 6.4 with nothing
to `cat`, and the gate is opened empty.

6.3. **Add a per-reason follow-up line below the report** — into the session **and** into
`$SCRATCH/report.md`:

- `clean`: *The latest Codex review found nothing on the branch — every finding of earlier rounds is fixed or recorded in `review.md`.*
- `minor-only`: *The latest Codex review raised only findings below the importance line (`REVIEW.md`'s `Important:` line, `P0-P2` without one); they were fixed or recorded, and none of them justified another review.*
- `no-fixes`: *Every important finding of the latest review was rejected or repeated an earlier rejection — the reasons are in `review.md`. Read them: a rejection a person disagrees with is reopened by deleting its row and running the loop again.*
- `max-iterations`: *Hit `--max <N>` iteration cap after a round that fixed an important finding, so the fix itself has not been reviewed. Review it manually or re-run with a higher `--max`.*
- `error`: *Loop aborted due to an error. Manual intervention required — the error text and the tail of the run log follow directly below this line.*

**The `error` line points below itself, and nothing points "above".** Above is the session
transcript, which the sign-off issue exists precisely to outlive; a reader opening that issue
tomorrow has no "above" at all. So the error text goes *under* the follow-up line in the
session too, and 6.4 concatenates it under the report in the record — the same direction in
both places.

**On an `error` termination, also write `$SCRATCH/error.txt`** — again with your file-writing
tool. It carries two things: the error text itself, as the sub-agent or the failing call
produced it, and the tail of the run log, which is the only place the preceding iterations are
recorded:

```bash
SCRATCH="<paste the path 6.2 echoed>"        # 6.2 ran in a different shell; this one has nothing
REPO_ROOT=$(git rev-parse --show-toplevel)   # 1.4 set it, and that shell is gone too
if ! tail -n 20 "$REPO_ROOT/.review-loop.log" > "$SCRATCH/log-tail.txt" 2> "$SCRATCH/tail-err.txt"; then
  printf '> ⚠️ **The run log could not be read** (`%s`), so this record carries the error text\n> without the iteration history that preceded it.\n' \
    "$(tr '\n' ' ' < "$SCRATCH/tail-err.txt")" > "$SCRATCH/log-tail.txt"
  echo "log tail: FAILED — the record will say so in its own body"
fi
```

**A failed `tail` leaves its file behind, which is why the status is read rather than the
file.** The `>` redirect creates `log-tail.txt` before `tail` ever runs, so a missing or
unreadable `.review-loop.log` leaves an *empty* file that the `cat` below appends happily: the
record goes out without the iteration history the spec requires of it, and nothing anywhere
says so. The branch replaces that empty file with a line stating the absence, so it reaches the
record by the same route the log would have, and the `echo` tells the person watching the run —
a different reader, who will not open the issue. The stderr text is substituted through
`printf`'s `%s` argument rather than into its format string, so whatever `tail` wrote cannot be
read as formatting.

**Every shell block from here to the end of step 6 opens by restoring what it reads.** Shell
state does not survive a tool call, and these two variables are the ones that fail silently:
an unset `REPO_ROOT` makes the tail read `/.review-loop.log` — no log tail, so the record loses
the iteration history the spec requires of it — and an unset `SCRATCH` writes every file to the
filesystem root or dies on a permission error. Neither announces itself; both produce a gate
that looks written.

Write the error text into `$SCRATCH/error.txt` with your file-writing tool, then append the
tail to it in a block that restores `SCRATCH` for itself:

```bash
SCRATCH="<paste the path 6.2 echoed>"
cat "$SCRATCH/log-tail.txt" >> "$SCRATCH/error.txt"
```

On every other termination reason leave `$SCRATCH/error.txt` absent. 6.4 decides what to do
about it from the **termination reason**, not from whether the file happens to exist: absent on
a clean run is the expected state and passes silently, absent on an `error` run is a record
that promised the error below the follow-up line and did not carry it, and says so.

Both files are the reason 6.4 can promise a durable record: they are what the follow-up line
points at, and they are what stays behind when the session ends.


6.4. **Open the sign-off issue — this is the human gate.**

The loop has just finished and, up to this point, nothing requires a person to look. The
printed report dies with the session, and a failing check goes stale the moment the next push
paints the branch green. So the record of "this needs human eyes" has to be an object that
outlives the run and that **only a person can close**.

**Find an existing one by exact title, never by search terms.** GitHub treats a title query as
independent words, so `review-loop PR #<PR>` also matches any unrelated open issue carrying
those words and that number — appending the report there would leave the gate uncreated while
looking like success. Build the canonical title once and compare it whole:

```bash
SCRATCH="<paste the path 6.2 echoed>"   # outside the repository; throwaway
TITLE="review-loop finished on PR #<PR> — human sign-off required"
REASON="<termination_reason>"           # the body block needs it and cannot re-derive it
EXISTING=""; LOOKUP_FAILED=""

# Every open issue, not the newest page. `gh issue list --limit N` stops at N, so a gate
# older than N newer issues reads as absent and the loop opens a duplicate; `gh api
# --paginate` follows the Link headers to the end and merges the pages of an array
# endpoint into one array — measured on gh 2.92.0: 11 pages at `per_page=1` came back as
# one valid array of 11. Do not add `--slurp` here; it is for endpoints returning an
# object, and it would wrap this array in another one the `find` below would miss.
if gh api --paginate "repos/<owner>/<repo>/issues?state=open&per_page=100" \
     > "$SCRATCH/open-issues.json" 2> "$SCRATCH/lookup-err.txt"; then
  EXISTING=$(TITLE="$TITLE" node -e '
    const all = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
    const hit = all.find(i => !i.pull_request && i.title === process.env.TITLE);
    if (hit) console.log(hit.number);
  ' "$SCRATCH/open-issues.json" 2>> "$SCRATCH/lookup-err.txt") \
    || { EXISTING=""; LOOKUP_FAILED=1; }
else
  LOOKUP_FAILED=1
fi

# Shell state does not survive to the next tool call; these four do have to.
{ printf 'TITLE=%q\n'         "$TITLE"
  printf 'REASON=%q\n'        "$REASON"
  printf 'EXISTING=%q\n'      "$EXISTING"
  printf 'LOOKUP_FAILED=%q\n' "$LOOKUP_FAILED"
} > "$SCRATCH/gate.env"
```

Four things that block is written to avoid:

- **`SCRATCH` is carried, not re-derived.** 6.2 chose it and echoed it; paste that literal path
  at the top of this block and of every block below. `SCRATCH="${SCRATCH:-$(mktemp -d)}"` run a
  second time would mint a *fresh* directory — the report and the error file written in 6.2/6.3
  would be in the old one, and the body would assemble empty. An unset variable is worse still:
  every path collapses to `/sign-off.md` and both `--body-file` calls die on a permission error.
- **The title is compared in Node against the file, not inside a `--jq` expression.** `gh` does
  not pass jq's `--arg` through `--jq`: the flag consumes the next token as the whole
  expression, so `--jq --arg t "$TITLE" '...'` is a malformed call. Piping it through `head`
  then masks the failure, leaving `EXISTING` empty and the loop creating a fresh issue every
  run. The `issues` endpoint also returns pull requests, which is what `!i.pull_request` drops.
- **A lookup that errored is not a lookup that found nothing — and that covers the parse, not
  just the fetch.** The `if` reads the listing's own status rather than the status of a pipeline
  ending in `head`; the `||` after the command substitution covers the other half, because a
  `node` that cannot start or cannot parse the response also yields an empty `EXISTING` that is
  otherwise indistinguishable from "no record matched". Both routes set `LOOKUP_FAILED`. Say so
  in the report, then take the create path anyway — by the rule below, a duplicate beats a
  missing gate.
- **The four values are persisted before the block ends.** Every command below runs in a new
  shell that inherits nothing, so `TITLE`, `REASON`, `EXISTING` and `LOOKUP_FAILED` would arrive
  empty: the loop would then take the create path on a pull request that already has a gate,
  create it with an empty title, and read every termination as a clean one. `printf %q` writes
  them back in a form `.` can read. The blocks below begin with the two lines that restore them.

**Build the body in a file, never as a shell argument.** The report carries literal backticks
and may carry error text from the sub-agent; inside double quotes a backtick becomes command
substitution, and the record is mangled or executed while the call still returns success. Write it
outside the repository.

**A quoted heredoc is not enough either — the delimiter is still live.** `<<'BODY'` stops
command substitution, but nothing stops a line reading exactly `BODY`: one such line anywhere
in the report, in the sub-agent's error text or in the log tail closes the heredoc early, the
record is truncated there, and everything after it is handed to the shell as commands. Sub-agent
output and log lines are not text you chose, so they never travel through a heredoc. They arrive
as **files**, written with your file-writing tool; only the fixed closing sentence, which you
author and which carries no delimiter, comes from a heredoc:

```bash
SCRATCH="<paste the path 6.2 echoed>"
. "$SCRATCH/gate.env"

# Both written in 6.2 and 6.3 with your file-writing tool, not with a shell heredoc:
#   $SCRATCH/report.md  — the report from 6.2 and its follow-up line from 6.3
#   $SCRATCH/error.txt  — on an `error` termination, the error text and the log tail;
#                         absent or empty otherwise
BODY_INCOMPLETE=""
{
  if [ -n "$LOOKUP_FAILED" ]; then
    cat <<'WARN'
> ⚠️ **The open-issue lookup failed**, so this record was opened without knowing whether one
> was already open for this pull request. Check for a duplicate before closing.

WARN
  fi
  if [ -s "$SCRATCH/report.md" ] && cat "$SCRATCH/report.md"; then :; else
    BODY_INCOMPLETE=1
    cat <<'NOREPORT'
> ⚠️ **The run report could not be read**, so this record carries the closing sentence and
> little else. The report was produced in the session that opened this issue and cannot be
> recovered from here — re-run the loop on this pull request to get one.

NOREPORT
  fi
  if [ "$REASON" = "error" ]; then
    printf '\n'
    if [ -s "$SCRATCH/error.txt" ] && cat "$SCRATCH/error.txt"; then :; else
      BODY_INCOMPLETE=1
      cat <<'NOERROR'
> ⚠️ **The error text could not be read.** This run ended in an error, and the follow-up line
> above promises the error and the tail of the run log directly below it — neither reached this
> record. Both were produced in the session that opened this issue and cannot be recovered from
> here; re-run the loop on this pull request to get them.

NOERROR
    fi
  fi
  cat <<'BODY'

Closing this issue is the sign-off. A person closes it after reading the pull request —
nothing else may: not this loop, not a later run, not a workflow.
BODY
} > "$SCRATCH/sign-off.md"
printf 'BODY_INCOMPLETE=%q\n' "$BODY_INCOMPLETE" >> "$SCRATCH/gate.env"
```

`cat` of a file cannot terminate anything, so no line of the report and no line of the error
text can end the body early. That is the property a quoted delimiter alone does not give you.

**A read that failed is not an empty report.** The closing sentence comes from a heredoc and
always succeeds, so without the test above a missing or unreadable `report.md` yields a
footer-only body, a group that still exits 0, and a gate published as though it carried the
run. The record is still opened — a record nobody can read beats no record, which is the trade
this whole step is built on — but it says so in its own first lines, and `BODY_INCOMPLETE`
carries the same fact into the report, because the two are read by different people. The brace
group runs in this shell rather than a subshell, which is what lets the flag survive the
redirect; it is appended to `gate.env` because the write block below is another tool call.

**The error text is mandatory on an `error` termination, so it is keyed on the reason and not
on the file.** `[ -s error.txt ]` alone answers "is there one", and a missing file then reads as
"there was nothing to say" — which on a clean run is true and on an aborted one is the record
losing the only thing it was opened to carry, while 6.3's follow-up line still promises it
below. `REASON` comes from `gate.env` for the same cause as everything else in this step: the
tool call that knew it has ended. On any other reason the branch is not entered at all, so a
clean run neither warns nor leaves an empty gap where the error would have been.

**On an `error` termination the body carries the error itself, not a pointer to it.** The
follow-up line in 6.3 points below itself and `error.txt` is concatenated below the report, so
the two agree. An earlier wording sent the reader to "the log entries above" — which in the
issue is nothing at all, since the entries above it are the session's, and outliving that
session is the whole purpose of the record.

Then append to the one you found, or create it — checking that it is still open before each
attempt, and retrying once before giving up:

```bash
SCRATCH="<paste the path 6.2 echoed>"
. "$SCRATCH/gate.env"

# The listing was a snapshot, and so is every re-read of it. A person may close the record in
# the seconds before *either* attempt, and `gh issue comment` succeeds on a closed-but-unlocked
# issue — which would file this run under a sign-off already given, the one thing the
# closed-record rule below forbids. So the state is asked for inside the attempt, not once
# outside it: the retry five seconds later asks again rather than trusting what the first one
# was told. On anything other than a confirmed OPEN, create instead.
write_gate() {
  if [ -n "$EXISTING" ]; then
    STATE=$(gh issue view "$EXISTING" --repo <owner>/<repo> --json state --jq .state) || STATE=""
    [ "$STATE" = "OPEN" ] || EXISTING=""     # no `local`: the clear has to outlive the call
  fi
  if [ -n "$EXISTING" ]; then
    gh issue comment "$EXISTING" --repo <owner>/<repo> --body-file "$SCRATCH/sign-off.md"
  else
    gh issue create --repo <owner>/<repo> --title "$TITLE" --body-file "$SCRATCH/sign-off.md"
  fi
}

GATE_WRITTEN=1
write_gate 2> "$SCRATCH/write-err.txt" || {
  sleep 5
  write_gate 2> "$SCRATCH/write-err.txt" || GATE_WRITTEN=""
}

# Both of these have to reach the reporting step, which is another tool call: EXISTING because
# the re-check inside the last attempt may have cleared it, GATE_WRITTEN because it is the only
# record that both attempts failed. `.` reads the last assignment of each, so appending is
# enough — and `write_gate` deliberately assigns EXISTING in the caller's scope, so the value
# persisted here is the one the attempt actually acted on.
{ printf 'EXISTING=%q\n'       "$EXISTING"
  printf 'GATE_WRITTEN=%q\n'   "$GATE_WRITTEN"
} >> "$SCRATCH/gate.env"

if [ -n "$EXISTING" ]; then WHERE="append to #$EXISTING"; else WHERE="create"; fi
if [ -n "$GATE_WRITTEN" ]; then echo "gate: written ($WHERE)"
else echo "gate: NOT WRITTEN after two attempts ($WHERE) — the run is ungated"; fi
```

**Check the exit status, and say it out loud when the write failed.** Issues disabled, a
missing permission, GitHub briefly unavailable — any of them leaves the loop having printed a
report and created no gate, which is the single outcome this step exists to prevent. The
function above exists so the retry is one call rather than a second copy of the branch that can
drift from the first; an empty `GATE_WRITTEN` after it means both attempts failed.

**The state check lives inside the function for the same reason the function exists.** Put once
above it, it is read by the first attempt and inherited by the second — and the five-second gap
between them is exactly the window a person needs to read the pull request and close the
record. The retry would then comment on a closed issue, succeed, and file the run under a
signature already given: the failure this check exists to prevent, reintroduced by the retry
that was supposed to make the step more robust. Inside, each attempt asks for itself, and a
close landing between them turns the retry into a create.

**`GATE_WRITTEN` is written down, not left in the shell.** The block ends with a successful
assignment either way, so its exit status says nothing, and the variable itself dies with the
tool call — a reporting step reading it would see an unset variable on a failed write and on a
clean one alike, and would call an ungated run complete. It is appended to `gate.env` and
echoed; the reporting step restores `SCRATCH`, runs `. "$SCRATCH/gate.env"`, and chooses its
warning from `GATE_WRITTEN`, `EXISTING`, `LOOKUP_FAILED` and `BODY_INCOMPLETE` — with `<error>`
taken from `$SCRATCH/write-err.txt`.

**The re-check narrows the window; it does not close it.** Nothing holds the issue open between
`gh issue view` and `gh issue comment`, so a close landing in that gap still appends to a
signed-off record. A few seconds instead of the whole body-assembly step is the most a
non-atomic pair of calls can offer — and it fails in the direction the rest of this step
prefers: an unreachable or ambiguous state reads as "not open" and takes the create path, so
the worst case is a duplicate rather than a report filed under somebody's signature.

Which line to print is decided by the values restored from `gate.env`, in this order. Exactly
one of the first three applies:

| `GATE_WRITTEN` | `EXISTING` | Print |
|---|---|---|
| empty | empty | **the create path failed** |
| empty | set | **the append path failed** |
| set | either | **the gate was written** — add the lookup line below if `LOOKUP_FAILED` |

**The create path failed** — nothing at all records this pull request:

> ⚠️ **Sign-off issue was NOT created** (`<error>`). Nothing records that this pull request
> needs human eyes — open one by hand before merging.
>
> The open-issue lookup also failed, so a record may already exist and this run could not see
> it — check before opening one. *(this sentence only when `LOOKUP_FAILED` is set)*

**The append path failed** — the gate exists and is open, it just does not carry this run:

> ⚠️ **Sign-off issue #`<EXISTING>` was NOT updated** (`<error>`). The gate is open but its
> last report is from an earlier run — read the pull request itself before merging, and do
> **not** open a second issue.

The two are not interchangeable. Telling a reader that nothing was created when issue
#`<EXISTING>` is sitting open invites them to open the duplicate the exact-title lookup exists
to avoid.

**The lookup failed and the write succeeded** — the record exists, but was written blind.
`LOOKUP_FAILED` is why the same warning is built into the body; print it into the report too:

> ⚠️ **The open-issue lookup failed** (`<contents of $SCRATCH/lookup-err.txt>`), so this run
> could not tell whether a sign-off issue was already open. It opened one anyway. If a
> duplicate is sitting beside it, close the one you did not read.

It goes in both places on purpose. The report is read by whoever watched the run; the issue is
read by whoever opens it tomorrow, and only one of them knows the lookup never completed.

**This line claims a record exists, so it is printed only when one does.** Unconditionally, it
sits under the create-path warning saying "it opened one anyway" directly below a line saying
nothing was created — a report asserting both outcomes, which a reader resolves by believing
whichever they read first. When both failed, the create-path warning governs and carries the
lookup as its own second sentence.

**The body was incomplete** — printed alongside whichever of the three applies, when
`BODY_INCOMPLETE` is set:

> ⚠️ **The sign-off record does not carry the run report** — the report file could not be read
> while the body was assembled, so whatever was written carries its closing sentence and little
> else. Read the pull request on its own terms; the record cannot tell you what the loop did.

Five things about this step are deliberate:

- **It runs for every termination reason, `error` included.** The reasons differ in what the
  person will find, not in whether one is needed; an aborted loop needs a human more than a
  clean one, not less.
- **The list-then-create is not atomic.** Two loops finishing on the same pull request can
  both see nothing and both open an issue. A duplicate is noise; a missing one is a gate that
  was never there. Prefer the noise.
- **A failed lookup takes the create path too**, for the same reason: `LOOKUP_FAILED` means the
  loop does not know whether a gate exists, and guessing "yes" loses the record.
- **The lookup asks for open issues only, the state is re-read before every append, and a closed
  record is never reopened.** A closed record is a sign-off somebody gave, for the state of the
  branch they read. A run finishing after it is work nobody has signed off, so it gets its own
  record rather than reviving a settled one. Reopening would be an automation undoing a
  person's close — the single act this whole step reserves for a human, and the reason a
  duplicate title may legitimately appear in the closed list over the life of a pull request.
- **No label is passed, and none is required.** This repository defines no label for the gate,
  and the create path above deliberately does not invent one. Add `--label` only in a
  repository where you have checked the label exists: a label that exists nowhere fails the
  create, and a failed create loses the record — which is the one outcome this step exists to
  prevent.

## Error handling reference

| Scenario | Detection | Reaction |
|---|---|---|
| PR not OPEN | pre-flight `gh pr view` | abort, no loop |
| Current branch is not the PR's branch | pre-flight 1.1 | abort, name the branch to check out |
| Spec directory missing | pre-flight `ls openspec/changes/<change>/` | prompt user, wait for correction |
| Nothing in the request implies repetition | pre-flight 1.3 | one line pointing at `/codex:review` or `review-fix`, stop |
| Codex plugin not installed, or its install record points nowhere | `preflight` exit 2 in 1.4 | abort before any review, name `/codex:setup`; nothing edited |
| Codex not signed in | `preflight` exit 2 in 1.4 | abort the same way, name `/codex:setup` |
| No `AGENTS.md` pointer to `REVIEW.md` and the record | `preflight` → `pointer.ok: false` | one warning naming the templates; the loop runs |
| Uncommitted changes | `git status --porcelain` in 1.5 | abort: commit or stash first |
| Codex review fails: usage limit, non-zero exit, failure status | sub-agent `error` carries the reviewer's text | `termination_reason="error"`, the text reaches the report and the sign-off record — never read as a clean review |
| Codex review runs past 540 s | the helper stops it; sub-agent `error` | `termination_reason="error"` |
| Review output announces findings the helper cannot parse, or names a path outside the repository | helper verdict `error`; sub-agent `error` | `termination_reason="error"`, quoting the output |
| A check fails and the fixer cannot make it pass | sub-agent `error` | `termination_reason="error"`, nothing from that round committed |
| An existing test changed without a reason in the record | the helper's test guard, exit 4; sub-agent `error` | `termination_reason="error"` naming the files, nothing from that round committed |
| `git push` rejected | sub-agent `error` mentions push failure | `termination_reason="error"`, user resolves rebase/merge |
| Sub-agent return line unparseable | `JSON.parse` fails on last line | `termination_reason="error"`, show raw output |
| Important fixes reported but nothing pushed | Step 3.2 | `termination_reason="error"` |
| Review clean | `clean: true` | `termination_reason="clean"` |
| Only findings below the importance line | `important_found == 0` | `termination_reason="minor-only"` — no further review |
| Every important finding rejected or repeated | `important_found > 0`, `important_fixed == 0` | `termination_reason="no-fixes"` — no further review |
| An important finding fixed at the cap | Step 4 | `termination_reason="max-iterations"` |
| Session closed mid-run | the sub-agent never returns | the log keeps the last state; re-invoke offers resume via 1.6, and `review.md` holds every committed round |

## Guardrails

- **Never** skip the OpenSpec read step inside the sub-agent prompt — judging a finding as fixed,
  rejected or repeated depends on it.
- **Never** read a failed, timed-out or unreadable review as clean. Only `clean: true` from a
  completed review ends the loop as `clean`.
- **Never** start another review after a round that fixed nothing important. Minor findings do not
  extend the loop.
- **Never** pipe `gh api` output through `jq` in generated commands — `jq` may be absent. Parse JSON
  inline or with `gh --jq` (built-in, always available).
- **Never** read or reply to pull-request review comments. The reviewer is Codex, and its findings
  live in `review.md`.
- **Never** merge, close, approve, or request-changes on the PR — `review-loop` only iterates on
  review findings.
- **Never** close the sign-off issue from Step 6.4, in this run or any later one. An issue a
  machine can close is a gate that closes itself, and the whole point of it is that it waits
  for a person.
- **Never** edit `CLAUDE.md` or `AGENTS.md` to adopt a candidate rule; the report proposes them.
- **Never** invoke the `review-fix` skill directly in the orchestrator session — always delegate via
  the `Agent` tool so the main session keeps a clean context across iterations.
- **Never** guess the `openspec-change-name` if the directory is missing — always ask the user
  (Step 1.2).
