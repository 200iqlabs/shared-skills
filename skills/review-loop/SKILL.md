---
name: review-loop
description: Run the whole Claude-Copilot review cycle on a pull request unattended — fix the comments, push, wait for the next review, repeat until the reviewer has nothing new. Use this whenever someone wants the back-and-forth to run by itself across several rounds: "az przestanie zglaszac uwagi", "zapetl poprawki i review", "nie chce tego pilnowac", "iterate automatically until it settles", "keep cycling until copilot is quiet" — even when they never type /review-loop. Takes a PR number and an OpenSpec change name, which give the fixer the intent to judge comments against. Do NOT use for a single pass over the comments already on a PR — that is review-fix — nor for producing a review, waiting on CI, or polling a deployment.
---

# Review Loop

Orchestrate an automated Claude↔Copilot review cycle on a pull request. Each iteration: read the OpenSpec change for context, run `review-fix` (fetch + classify + fix + push + reply), retrigger Copilot, wait for its next review, repeat. Terminate when Copilot has nothing new to say, or on a safety-net iteration cap.

**Input:** `/review-loop <PR-number> <openspec-change-name> [--max N] [--wait-initial S] [--poll-interval S] [--poll-timeout S]`

- `PR-number` — required. The PR to iterate on. No fallback to `gh pr view` on current branch — the PR must be explicit.
- `openspec-change-name` — required. Directory name under `openspec/changes/<name>/`.
- `--max N` — safety-net iteration cap (default `5`).
- `--wait-initial S` — seconds to sleep after each push before polling (default `180`).
- `--poll-interval S` — seconds between polls (default `30`).
- `--poll-timeout S` — total seconds to wait for a new Copilot review after a push (default `600`).

## Steps

### 1. Pre-flight validation

Run once before iteration 1.

1.1. **Detect repo and PR.**

```bash
gh repo view --json nameWithOwner --jq .nameWithOwner
gh pr view <PR> --json number,url,headRefName,state
```

**Note**: do not pipe `gh api` JSON output through `jq` — it may not be installed on all machines. Parse JSON inline. The `--jq` flag above is safe because it's processed by `gh` itself.

If `state` is not `OPEN`, abort with: `PR #<PR> is not OPEN — current state: <state>`. Otherwise store `headRefName`, `url`, and `nameWithOwner`.

1.2. **Verify OpenSpec change directory exists.**

```bash
ls openspec/changes/<change-name>/
```

If missing, list nearby candidates:

```bash
ls openspec/changes/
ls openspec/changes/archive/ | tail -10
```

Ask the user: *"I can't find `openspec/changes/<change-name>/`. Candidates listed above. Which is correct, or should I abort?"* — **pause until user responds**. Do not guess.

1.3. **Compute Copilot baseline.**

```bash
gh api --paginate "repos/<owner>/<repo>/pulls/<PR>/reviews?per_page=100"
```

Parse the JSON response. Compute:
- `pre_loop_last_copilot_review_id` = maximum `id` among reviews where `user.login == "copilot-pull-request-reviewer[bot]"`, or `0` if no such reviews exist.

1.3a. **Check that Copilot reviews this repo at all.**

The loop cannot otherwise tell *Copilot has not answered yet* from *Copilot does not review here*, and both look identical for the whole `wait_initial + poll_timeout` window. Look for any prior review by the bot across recent pull requests:

```bash
gh api "repos/<owner>/<repo>/pulls?state=all&per_page=10" --jq '.[].number'
```

For each number returned, fetch `repos/<owner>/<repo>/pulls/<n>/reviews` and look for `user.login == "copilot-pull-request-reviewer[bot]"`. Then:

- **Found at least one** — Copilot reviews here. Proceed.
- **None found, and the repo has prior pull requests** — warn before starting: *"Copilot has never reviewed a pull request in this repository. If it is not enabled, this run will spend <wait_initial + poll_timeout>s per iteration and then report a timeout it cannot distinguish from Copilot simply being slow. Continue anyway?"* — wait for the user.
- **The repo has no prior pull requests** — the check is inconclusive, not negative. Say so in one line and proceed; a first-ever PR has no history to read.

This is advisory. Never abort on it by itself — a repo can have Copilot enabled today and no history of it.

1.3b. **Check the user wants a cycle driven, not a review written.**

Requests like *"zrób review tego PR-a i powiedz co jest nie tak"* trigger this skill at full rate,
and no wording of the description prevents it — three variants were measured against the trigger
set in `evals/` and none moved the number. Topical overlap beats an exclusion clause, so the check
belongs here instead.

If nothing in the request implies repetition — no *until*, *aż*, *keep going*, *repeat*, no round
count, no complaint about having to re-request the review by hand — then the user wants an opinion
on the pull request, not an unattended loop over it. Say so in one line and point at a code review.

A single pass over comments that already exist is the neighbouring case, and it belongs to
`review-fix`. The giveaway between the two is the same: nothing is repeated.

1.4. **Check for prior incomplete run.**

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
ls "$REPO_ROOT/.review-loop.log" 2>/dev/null
```

If the log file exists, scan it for entries with `"pr": <PR>`. If the most recent entry for this PR is an `iter-start` or `iter-end` (not a `terminate`) from the last 24 hours, prompt: *"Previous loop for PR #<PR> stopped at iteration <K>. Resume from iteration <K+1>, or start fresh from iteration 1?"* — wait for user choice, then set `iteration` accordingly.

1.5. **Ensure `.review-loop.log` is gitignored.**

```bash
grep -q '^\.review-loop\.log$' "$REPO_ROOT/.gitignore" 2>/dev/null
```

If not present, print a warning: *"`.review-loop.log` is not in `.gitignore`. Consider adding it."* Do not auto-add — user decides.

1.6. **Initialize loop state (in-memory):**

```
iteration              = 1  (or resumed value from 1.4)
last_copilot_review_id = pre_loop_last_copilot_review_id
totals                 = { fixed: 0, outdated: 0, disagreed: 0 }
termination_reason     = null
last_pushed_sha        = null
```

1.7. **Write `run-start` log entry.** Append one JSON line to `<repo-root>/.review-loop.log`:

```json
{"ts":"<ISO8601-UTC>","pr":<PR>,"change":"<change-name>","event":"run-start"}
```

### 2. Run iteration N

2.1. **Log iteration start and record timestamp.**

```
iter_started_at = now()
```

Append to `.review-loop.log`:

```json
{"ts":"<ISO8601-UTC>","pr":<PR>,"event":"iter-start","iteration":<N>}
```

2.2. **Dispatch the fixer sub-agent.** Use the `Agent` tool with `subagent_type="general-purpose"`, `description="review-fix iteration <N> for PR <PR>"`, and this prompt (substitute placeholders with live values):

```
You are running one iteration of an automated Copilot review-fix loop.

Context:
- PR number: <PR>
- Repository: <owner>/<repo>
- PR branch (headRefName): <branch>
- OpenSpec change: <change-name>
- Iteration: <N> of <max>

Before doing anything else, read these files to understand the PR's intent and scope:
- openspec/changes/<change-name>/proposal.md
- openspec/changes/<change-name>/design.md            (only if it exists)
- openspec/changes/<change-name>/tasks.md
- openspec/changes/<change-name>/specs/**/*.md

Then invoke the review-fix skill for this PR:

  Skill(skill="review-fix", args="<PR>")

Use the OpenSpec context to inform your FIX / OUTDATED / DISAGREE classification of each Copilot comment. A comment that conflicts with the intent documented in proposal.md or design.md is a candidate for DISAGREE with a grounded technical reply.

CRITICAL RETURN FORMAT:
The LAST LINE of your response must be a single-line JSON object, nothing else on that line. Lines above may contain prose summary.

{"fixed": <int>, "outdated": <int>, "disagreed": <int>, "pushed_commit_sha": <"40-char sha"|null>, "error": <"message"|null>}

- `fixed`: count of FIX-classified comments that resulted in code changes.
- `outdated`: count of OUTDATED comments (reply-only, no code change).
- `disagreed`: count of DISAGREE comments (reply-only with technical reasoning).
- `pushed_commit_sha`: the **full 40-character** sha of your commit if you pushed, otherwise null. Take it from `git rev-parse HEAD`, not `--short` — the loop matches this against `commit_id` from the reviews endpoint, which is always full-length.
- `error`: null on success, or a short string describing why you couldn't complete (e.g., "typecheck failed", "push rejected").

Both nullable fields take a JSON string or the bare literal null. Never the string "null" —
it is truthy, and the loop reads it as a real error and a real sha.

Fixed two, pushed:
{"fixed": 2, "outdated": 0, "disagreed": 1, "pushed_commit_sha": "5b431277b031648832d09305755ed48431374a4c", "error": null}

Nothing needed a code change:
{"fixed": 0, "outdated": 1, "disagreed": 2, "pushed_commit_sha": null, "error": null}
```

2.3. **Parse the sub-agent return.** Take the sub-agent's full return text, split on newlines, find the last non-empty line, and `JSON.parse` it. If parsing fails:
- Log: `{"ts":"<ISO>","pr":<PR>,"event":"iter-error","iteration":<N>,"raw":"<last-line-truncated-to-200-chars>"}`
- Set `termination_reason = "error"`.
- Show the user the raw sub-agent output (full, not truncated) so they can debug.
- Go to Step 6.

Then normalise the two nullable fields. If `parsed.pushed_commit_sha` or `parsed.error` came back as the *string* `"null"` (or `"none"`, or empty), replace it with a real `null`. The string is truthy, so without this Step 2.4 ends every clean iteration as an error, and Step 5 compares shas against `"null"` and never matches. Same reasoning as the sha length above: the return format is a prompt, not a schema the runtime enforces, so the parser should not assume it was obeyed.

2.4. **If `parsed.error` is non-null:**
- Log: `{"ts":"<ISO>","pr":<PR>,"event":"iter-error","iteration":<N>,"error":"<parsed.error>"}`
- Set `termination_reason = "error"`.
- Show `parsed.error` to user.
- Go to Step 6.

2.5. **Update cumulative totals and log iteration end.**

```
totals.fixed     += parsed.fixed
totals.outdated  += parsed.outdated
totals.disagreed += parsed.disagreed
if parsed.pushed_commit_sha: last_pushed_sha = parsed.pushed_commit_sha
```

Log:

```json
{"ts":"<ISO>","pr":<PR>,"event":"iter-end","iteration":<N>,"fixed":<parsed.fixed>,"outdated":<parsed.outdated>,"disagreed":<parsed.disagreed>,"commit":"<parsed.pushed_commit_sha or null>"}
```

### 3. Decide next action

Based on `parsed` values from Step 2.

3.1. **All comments handled, nothing to push (no-fixes exit).**

If `parsed.fixed == 0` AND `parsed.outdated + parsed.disagreed > 0`:
- All comments were replied-to but no code changed. Copilot has no new material to review.
- Set `termination_reason = "no-fixes"`.
- Go to Step 6.

3.2. **Nothing at all (either pre-review or terminal).**

If `parsed.fixed == 0` AND `parsed.outdated == 0` AND `parsed.disagreed == 0`:

3.2a. **Pre-review wait case.** If `iteration == 1` AND `pre_loop_last_copilot_review_id == 0`:
- Copilot hasn't submitted its first review yet. Skip push and retrigger — there's nothing to retrigger against.
- Go directly to Step 5.1 (initial sleep) without executing Step 4.

3.2b. **Clean terminal case.** Otherwise:
- Copilot has stopped finding issues.
- Set `termination_reason = "no-comments"`.
- Go to Step 6.

This branch is only as trustworthy as the fetch behind it. A Copilot review can carry findings
that never become threads — they appear as `### Suppressed comments (N)` in the review body —
and a sub-agent reading the comments endpoint alone returns all zeros for such a review, which
lands here and terminates the loop as clean. `review-fix` step 2 reads the review bodies for
exactly this reason; a sub-agent that skipped it will end the loop one round early and report
success.

3.3. **Push happened — continue to retrigger.**

If `parsed.fixed > 0` AND `parsed.pushed_commit_sha` is non-null:
- Proceed to Step 4.

3.4. **Defensive: push expected but missing.**

If `parsed.fixed > 0` AND `parsed.pushed_commit_sha` is null:
- Sub-agent reported fixes but did not push — treat as error.
- Log: `{"ts":"<ISO>","pr":<PR>,"event":"iter-error","iteration":<N>,"error":"fixed>0 but no pushed_commit_sha"}`
- Set `termination_reason = "error"`, go to Step 6.

### 4. Retrigger Copilot review

**Request the reviewer over REST. Do not post a comment.** `@copilot review` as a PR comment does not order a re-review — it wakes the Copilot **coding agent**, which reads the thread, replies in prose that the findings are already addressed, and finishes green having produced no review at all. `pulls/<n>/reviews` does not grow. A successful run plus a polite reply is indistinguishable from a real review arriving, and the loop then spends `wait_initial + poll_timeout` before reporting a `timeout` it cannot tell apart from "Copilot does not review this repository".

The two are distinguishable in `gh run list --branch <branch>` if you ever need to confirm it: the automatic review on PR open runs as `Running Copilot Code Review`; the comment runs as `Addressing comment on PR #<n>`.

4.1. **Request the review.**

```bash
gh api --method POST repos/<owner>/<repo>/pulls/<PR>/requested_reviewers \
  -f "reviewers[]=copilot-pull-request-reviewer[bot]"
```

Two traps live in this one call:

- **The login must carry the `[bot]` suffix.** Without it GitHub answers `422 Reviews may only be requested from collaborators`, which reads as "Copilot cannot be requested on this repository" and is why this path was once written off.
- **The response comes back with `requested_reviewers: []`, and that is not a failure.** An empty list immediately after the request is normal — `gh pr view` shows it empty too — and the review still arrives, measured at 2-4 minutes across four consecutive runs. Reading that empty list as failure is the main way this path gets abandoned.

There is no idempotency check to do here. Re-requesting a reviewer who is already requested is harmless, unlike posting the same comment twice.

If the `gh api` call itself returns non-zero, sleep 30 seconds and retry once. If the retry also fails:
- Log: `{"ts":"<ISO>","pr":<PR>,"event":"retrigger-failed","exit_code":<code>}`
- Set `termination_reason = "error"`.
- Go to Step 6.

Do **not** fall back to `gh pr comment <PR> --body "@copilot review"`. It is not a weaker version of this call; it summons a different agent and guarantees the timeout described above.

4.2. **Record retrigger timestamp** (used as the start point for `poll_timeout` in Step 5):

```
retrigger_started_at = now()
```

Log:

```json
{"ts":"<ISO>","pr":<PR>,"event":"copilot-retrigger"}
```

**Why not the comment, in one more place.** The comment mechanism also runs through a GitHub Actions workflow and consumes Actions minutes; when Actions billing is exhausted it fails silently, the comment posting successfully either way. The UI's "Re-request review" refresh icon beside Copilot in the reviewers sidebar does not depend on Actions — the REST call above is the scriptable equivalent.

### 5. Wait for Copilot review

5.1. **Initial sleep via `ScheduleWakeup`.**

Invoke the `ScheduleWakeup` tool:
- `delaySeconds`: `wait_initial` (default 180).
- `reason`: `"Waiting for Copilot to finish reviewing PR #<PR> push <last_pushed_sha>"` (or equivalent if no push happened in the pre-review case — reference the initial review instead).
- `prompt`: the original `/review-loop <PR> <change-name> [flags]` command — the runtime re-enters this skill on wakeup. Pass `--resume` if not already present so Step 1.4 detects the in-flight run.

The main session ends here; wakeup continues in Step 5.2.

5.2. **Polling loop after wakeup.**

Set a polling deadline:

```
poll_deadline = retrigger_started_at + poll_timeout   # poll_timeout default 600s
```

(In the pre-review wait case where no retrigger happened, use `iter_started_at + poll_timeout` as the deadline instead. `iter_started_at` is the timestamp from Step 2.1.)

Loop:

```
while now() < poll_deadline:
  reviews = gh api --paginate "repos/<owner>/<repo>/pulls/<PR>/reviews?per_page=100"
  candidates = [r for r in reviews
                 if r.user.login == "copilot-pull-request-reviewer[bot]"
                 and r.id > last_copilot_review_id]
  fresh = [c for c in candidates
            if last_pushed_sha == null or sha_eq(c.commit_id, last_pushed_sha)]
  if fresh:
    new_id = max(c.id for c in fresh)
    last_copilot_review_id = new_id
    log {"ts":"<ISO>","pr":<PR>,"event":"review-detected","review_id":new_id}
    goto 5.4 (continue)
  else:
    sleep(poll_interval)   # default 30s — use ScheduleWakeup if >= 60s remain
```

**Freshness is decided by `commit_id`, not by time and not by id alone.** Every entry in `pulls/<n>/reviews` carries the sha it was written against. That is the only cheap way to tell "the reviewer saw my fix" from "an older review just surfaced", and it is why the filter above compares against `last_pushed_sha`:

```bash
gh api --paginate "repos/<owner>/<repo>/pulls/<PR>/reviews?per_page=100" --jq '.[] | "\(.id) \(.commit_id) \(.submitted_at)"'
```

**Compare shas by prefix, not by equality.** `commit_id` from the API is always the full 40 characters. `last_pushed_sha` arrives from the sub-agent's `pushed_commit_sha`, and a sub-agent asked for "the sha" returns the 7-character one about as readily — `review-fix`, the sub-agent in question, is told to write replies as `Fixed in {commit_sha_short}`, so the short form is the value already in its hand. Strict `==` then never matches, `fresh` stays empty, and the loop times out with the right review sitting in the list it just fetched.

```
sha_eq(a, b) = a.startswith(b) or b.startswith(a)
```

Step 2.2 asks for the full sha as well. Both, not either: the contract is a prompt, not a validated schema, so instructing a sub-agent is not the same as being able to rely on it.

**Every reviews fetch needs `--paginate`.** The endpoint pages at 30 by default and returns reviews oldest-first, so the newest review sits on the *last* page — an unpaginated fetch reads precisely the wrong half for a "has a new review landed?" check, and the loop times out staring at page one. This bites sooner than 30 rounds suggests: posting an in-thread reply creates a review object too, so one iteration adds the Copilot review plus one per reply. PR #9 of this repository reached four reviews after two rounds.

**Take the max over `fresh`, not over `candidates`.** Gating on "some candidate matches" while selecting the highest id among *all* of them hands back a review written against a different sha — and since the next pass keeps only `r.id > last_copilot_review_id`, the fresh review that was skipped over becomes permanently invisible. The loop then waits out `poll_timeout` for a review it already had.

**Do not use a completed Actions run as the signal.** The review object appears a few seconds *after* the run reports completion, so a watcher keyed on `Running Copilot Code Review` finishing reports "run done, no review" while the review is a minute from landing. Poll the reviews endpoint; keep run state at most as a secondary exit condition.

If the loop exits without finding a new review, go to 5.3.

5.3. **Timeout.**

- Log: `{"ts":"<ISO>","pr":<PR>,"event":"copilot-timeout","seconds":<poll_timeout>}`
- Set `termination_reason = "timeout"`.
- Go to Step 6.

5.4. **Continue to next iteration.**

Increment iteration:

```
iteration += 1
```

If `iteration > max`:
- Set `termination_reason = "max-iterations"`.
- Go to Step 6.

Otherwise, return to Step 2 (run iteration N).

### 6. Terminate + report

6.1. **Log termination event.**

```json
{"ts":"<ISO>","pr":<PR>,"event":"terminate","reason":"<termination_reason>","iterations":<iteration>}
```

6.2. **Print final report to the user — and write the same text to a file.**

```
Review loop finished after <iteration> iteration(s) — reason: <termination_reason>
Totals: fixed=<totals.fixed>, outdated=<totals.outdated>, disagreed=<totals.disagreed>
Last commit: <last_pushed_sha or 'none'>
PR: <url>
```

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

- `no-comments`: *Copilot produced no new comments on the latest push — PR looks clean from Copilot's perspective.*
- `no-fixes`: *Copilot's latest comments were all OUTDATED or DISAGREE — no code changes were needed.*
- `max-iterations`: *Hit `--max <N>` iteration cap. Copilot may still have feedback; review manually or re-run with a higher `--max`.*
- `timeout`: *Copilot didn't submit a review within `<poll_timeout>`s. This does not say which of two things happened: Copilot is slow, or Copilot does not review this repository. Check the PR in the GitHub UI — if a review is there, re-run; if the reviewers sidebar offers no Copilot entry at all, it is not enabled here and re-running will time out again.*
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
tail -n 20 "$REPO_ROOT/.review-loop.log" > "$SCRATCH/log-tail.txt"
```

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

On every other termination reason leave `$SCRATCH/error.txt` absent — 6.4 tests it with `-s`
and skips it when it is missing or empty.

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

# Shell state does not survive to the next tool call; these three do have to.
{ printf 'TITLE=%q\n'         "$TITLE"
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
- **The three values are persisted before the block ends.** Every command below runs in a new
  shell that inherits nothing, so `TITLE`, `EXISTING` and `LOOKUP_FAILED` would arrive empty:
  the loop would then take the create path on a pull request that already has a gate, and create
  it with an empty title. `printf %q` writes them back in a form `.` can read. The blocks below
  begin with the two lines that restore them.

**Build the body in a file, never as a shell argument.** The report carries literal backticks
and may carry error text from the sub-agent; inside double quotes a backtick becomes command
substitution, and the record is mangled or executed while the call still returns success. Same
rule and same reason as the reply bodies in `review-fix`. Write it outside the repository.

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
  if [ -s "$SCRATCH/error.txt" ]; then
    printf '\n'
    cat "$SCRATCH/error.txt" || BODY_INCOMPLETE=1
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

**On an `error` termination the body carries the error itself, not a pointer to it.** The
follow-up line in 6.3 points below itself and `error.txt` is concatenated below the report, so
the two agree. An earlier wording sent the reader to "the log entries above" — which in the
issue is nothing at all, since the entries above it are the session's, and outliving that
session is the whole purpose of the record.

Then append to the one you found, or create it — checking first that it is still open, and
retrying once before giving up:

```bash
SCRATCH="<paste the path 6.2 echoed>"
. "$SCRATCH/gate.env"

# The listing was a snapshot. A person may have closed the record in the seconds since, and
# `gh issue comment` succeeds on a closed-but-unlocked issue — which would file this run under
# a sign-off already given, the one thing the closed-record rule below forbids. Ask for the
# state now, and on anything other than a confirmed OPEN, create instead.
if [ -n "$EXISTING" ]; then
  STATE=$(gh issue view "$EXISTING" --repo <owner>/<repo> --json state --jq .state) || STATE=""
  [ "$STATE" = "OPEN" ] || EXISTING=""
fi

write_gate() {
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
# the re-check above may have cleared it, GATE_WRITTEN because it is the only record that both
# attempts failed. `.` reads the last assignment of each, so appending is enough.
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
- **The lookup asks for open issues only, the state is re-read before appending, and a closed
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
| Spec directory missing | pre-flight `ls openspec/changes/<change>/` | prompt user, wait for correction |
| Sub-agent JSON unparseable | `JSON.parse` fails on last line | `termination_reason="error"`, show raw output, abort |
| Sub-agent reports error | JSON `error` field non-null | `termination_reason="error"`, show, abort |
| `pnpm typecheck` failed inside review-fix | sub-agent returns `pushed_commit_sha=null` + non-null `error` | `termination_reason="error"`, user fixes manually |
| `git push` rejected | sub-agent `error` mentions push failure | `termination_reason="error"`, user resolves rebase/merge |
| Copilot silent past `poll_timeout` | polling loop exits without match | `termination_reason="timeout"`, suggest manual UI check |
| Reviewer request over REST fails | non-zero exit code from `gh api` | retry once after 30s; still failing → `termination_reason="error"` (no comment fallback — see Step 4) |
| Session closed mid-wait | `ScheduleWakeup` doesn't fire | loop dies silently; log preserves last state; re-invoke offers resume via 1.4 |
| Fixed > 0 but no pushed_commit_sha | defensive check in Step 3.4 | `termination_reason="error"` |

## Guardrails

- **Never** skip the OpenSpec read step inside the sub-agent prompt — classification of DISAGREE vs. FIX depends on it.
- **Never** pipe `gh api` output through `jq` in generated commands — `jq` may be absent. Parse JSON inline or with `gh --jq` (built-in, always available).
- **Never** post multiple PR review replies in parallel — the `review-fix` skill already enforces sequential posting; don't override.
- **Never** merge, close, approve, or request-changes on the PR — `review-loop` only iterates on review comments.
- **Never** close the sign-off issue from Step 6.4, in this run or any later one. An issue a
  machine can close is a gate that closes itself, and the whole point of it is that it waits
  for a person.
- **Never** invoke the `review-fix` skill directly in the orchestrator session — always delegate via the `Agent` tool so the main session keeps a clean context across iterations.
- **Never** guess the `openspec-change-name` if the directory is missing — always ask the user (Step 1.2).
