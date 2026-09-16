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
- `--poll-timeout S` — seconds to wait for a new Copilot review after a push before step 5.3 checks the workflow state (default `1500`). **Not a hard cap**: 5.3 extends the window while a review run for this push is still unfinished, so the total wait can exceed it — the final report quotes what was actually waited, not this flag. Copilot's review time scales with the size of the diff: measured across six consecutive rounds on one PR, 8m2s → 12m3s → 8m6s → 9m47s → 15m42s, growing as the branch grew. A 600s default expires mid-review on anything substantial, and the run that expires looks exactly like a run that never started.

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
poll_extensions        = 0
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
poll_deadline = retrigger_started_at + poll_timeout   # poll_timeout default 1500s
```

(In the pre-review wait case where no retrigger happened, use `iter_started_at + poll_timeout` as the deadline instead. `iter_started_at` is the timestamp from Step 2.1.)

**Re-entering from 5.3 does not recompute this.** 5.3 can hand the loop back with a deadline of
its own — when it does, resume at the `Loop:` block below and leave `poll_deadline` as 5.3 set
it. Recomputing it from the top would restore the deadline that had just expired and turn the
extension into an immediate second timeout.

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

5.3. **Timeout — but check whether the review is still running first.**

The deadline expiring is not evidence that nothing is coming. Before declaring a timeout,
read the state of the review workflow — **scoped to this push's request**:

```bash
gh run list --branch <branch> --limit 20 --json databaseId,name,status,conclusion,createdAt,updatedAt,headSha
```

Keep only runs named `Running Copilot Code Review` that were created at or after
`retrigger_started_at` (`iter_started_at` in the pre-review case) **and** whose `headSha`
matches `last_pushed_sha` under the `sha_eq` prefix rule above; when `last_pushed_sha` is null
— the pre-review case — the created-at bound is the whole filter. A bare
`gh run list --branch <branch>` is worse than no check at all: an unfinished run left on the
branch by an abandoned or resumed earlier loop satisfies the first case below forever, so a
request that never started would wait indefinitely — this step's own failure, pointed the
other way. `--json` is also what supplies the timestamps the cases below read; the default
table output carries no completion time.

- **A matching run exists and its `status` is not `completed`** — `queued`, `waiting`,
  `requested`, `pending` and `in_progress` all say the same thing here, and exempting only
  `in_progress` would declare a timeout on a run that has not begun executing yet. This is
  *not* a timeout: the review is still being computed and the window was simply too short. Do
  not fall through to the timeout below — give the loop a new deadline and **go back to the
  `Loop:` block in 5.2**:

  ```
  poll_extensions += 1
  poll_deadline    = now() + 300          # seconds
  ```

  Log it: `{"ts":"<ISO>","pr":<PR>,"event":"copilot-poll-extended","run_elapsed_seconds":<now() - run.createdAt>,"extension":<poll_extensions>}`.
  5.2 resumes polling the reviews endpoint and comes back here when the new deadline expires;
  the same three cases apply again. **Stop extending at `poll_extensions == 3`** — a wedged run
  would otherwise hold the loop open for hours. At the cap, fall through to the timeout below
  with `run_unfinished = true`, which the report renders differently from a missing run.

  **That log line is diagnostic, not a feedback loop.** Nothing reads it back: 1.4 restores the
  iteration number only, and 1.6 takes `poll_timeout` from the flag or the default on every
  invocation — so the next run does *not* inherit a calibrated window by itself. The elapsed
  time is there for the operator, as the number that says what to pass to `--poll-timeout` next
  time.

- **A matching run `completed` less than ~90s ago** — not a timeout yet either. The review
  object lands a few seconds *after* the run reports completion (the race described in 5.2), so
  set `poll_deadline = run.updatedAt + 90s`, leave `poll_extensions` alone, and go back to the
  `Loop:` block in 5.2. `gh run list` exposes no `completedAt`; on a finished run `updatedAt`
  *is* that timestamp, which is why the grace period needs `--json` rather than the table
  output. The absence of a review only means something once that grace has passed.

- **No matching run at all — or one that completed more than ~90s ago with no review** — a
  real timeout. Proceed below.

The check exists because the first case and the last are indistinguishable from the polling
loop alone, and they call for opposite responses: one wants more patience, the other wants the
user to look at the PR. Reporting the first as the second sends somebody to debug a working
system. It is the mirror of the rule above about not keying on a *completed* run — a finished
run is not proof a review landed, and an unfinished one is proof a verdict would be premature.

Once a real timeout is established:

- Compute the wait actually served: `poll_elapsed = now() - retrigger_started_at`
  (`iter_started_at` in the pre-review case). With extensions this exceeds `poll_timeout`, and
  it — not the flag — is what the report quotes.
- Log: `{"ts":"<ISO>","pr":<PR>,"event":"copilot-timeout","seconds":<poll_elapsed>,"poll_timeout":<poll_timeout>,"extensions":<poll_extensions>,"run_unfinished":<true|false>}`
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

6.2. **Print final report to the user.**

```
Review loop finished after <iteration> iteration(s) — reason: <termination_reason>
Totals: fixed=<totals.fixed>, outdated=<totals.outdated>, disagreed=<totals.disagreed>
Last commit: <last_pushed_sha or 'none'>
PR: <url>
```

6.3. **Add a per-reason follow-up line below the report:**

- `no-comments`: *Copilot produced no new comments on the latest push — PR looks clean from Copilot's perspective.*
- `no-fixes`: *Copilot's latest comments were all OUTDATED or DISAGREE — no code changes were needed.*
- `max-iterations`: *Hit `--max <N>` iteration cap. Copilot may still have feedback; review manually or re-run with a higher `--max`.*
- `timeout`: *Copilot didn't submit a review within `<poll_elapsed>`s — `<poll_timeout>`s plus `<poll_extensions>` extension(s) granted by step 5.3, which ended on `<no review run for this push | a review run still unfinished at the extension cap>`. A still-unfinished run means the review is slow, not absent: re-run with a higher `--poll-timeout`. No run at all does not say whether Copilot is merely slow or does not review this repository — check the PR in the GitHub UI: if a review is there, re-run; if the reviewers sidebar offers no Copilot entry at all, it is not enabled here and re-running will time out again.*
- `error`: *Loop aborted due to an error (see log entries above). Manual intervention required.*

## Error handling reference

| Scenario | Detection | Reaction |
|---|---|---|
| PR not OPEN | pre-flight `gh pr view` | abort, no loop |
| Spec directory missing | pre-flight `ls openspec/changes/<change>/` | prompt user, wait for correction |
| Sub-agent JSON unparseable | `JSON.parse` fails on last line | `termination_reason="error"`, show raw output, abort |
| Sub-agent reports error | JSON `error` field non-null | `termination_reason="error"`, show, abort |
| `pnpm typecheck` failed inside review-fix | sub-agent returns `pushed_commit_sha=null` + non-null `error` | `termination_reason="error"`, user fixes manually |
| `git push` rejected | sub-agent `error` mentions push failure | `termination_reason="error"`, user resolves rebase/merge |
| Copilot silent past `poll_timeout` | polling loop exits without match, **and** step 5.3 finds no unfinished review run for this push | `termination_reason="timeout"`, suggest manual UI check |
| Review run for this push not `completed` at the deadline | scoped `gh run list` in step 5.3 (any status but `completed`) | not a timeout — extend `poll_deadline` by 300s, log the elapsed time, return to 5.2; at most 3 extensions |
| Review run finished seconds before the deadline | scoped run `completed` less than ~90s ago | not a timeout — poll until `updatedAt + 90s` before concluding (review objects trail the run) |
| Stale unfinished run from an earlier loop on the branch | run created before `retrigger_started_at`, or a different `headSha` | excluded by 5.3's scoping — unscoped, it would extend the wait forever |
| Reviewer request over REST fails | non-zero exit code from `gh api` | retry once after 30s; still failing → `termination_reason="error"` (no comment fallback — see Step 4) |
| Session closed mid-wait | `ScheduleWakeup` doesn't fire | loop dies silently; log preserves last state; re-invoke offers resume via 1.4 |
| Fixed > 0 but no pushed_commit_sha | defensive check in Step 3.4 | `termination_reason="error"` |

## Guardrails

- **Never** skip the OpenSpec read step inside the sub-agent prompt — classification of DISAGREE vs. FIX depends on it.
- **Never** pipe `gh api` output through `jq` in generated commands — `jq` may be absent. Parse JSON inline or with `gh --jq` (built-in, always available).
- **Never** post multiple PR review replies in parallel — the `review-fix` skill already enforces sequential posting; don't override.
- **Never** merge, close, approve, or request-changes on the PR — `review-loop` only iterates on review comments.
- **Never** invoke the `review-fix` skill directly in the orchestrator session — always delegate via the `Agent` tool so the main session keeps a clean context across iterations.
- **Never** guess the `openspec-change-name` if the directory is missing — always ask the user (Step 1.2).
