---
name: review-loop
description: Use when you want to automatically iterate between Claude and Copilot PR reviews — fix comments, push, wait for Copilot re-review, repeat until stable. Invoke with /review-loop <PR-number> <openspec-change-name>.
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
gh api repos/<owner>/<repo>/pulls/<PR>/reviews
```

Parse the JSON response. Compute:
- `pre_loop_last_copilot_review_id` = maximum `id` among reviews where `user.login == "copilot-pull-request-reviewer[bot]"`, or `0` if no such reviews exist.

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

{"fixed": <int>, "outdated": <int>, "disagreed": <int>, "pushed_commit_sha": "<sha or null>", "error": "<message or null>"}

- `fixed`: count of FIX-classified comments that resulted in code changes.
- `outdated`: count of OUTDATED comments (reply-only, no code change).
- `disagreed`: count of DISAGREE comments (reply-only with technical reasoning).
- `pushed_commit_sha`: the sha of your commit if you pushed, otherwise null.
- `error`: null on success, or a short string describing why you couldn't complete (e.g., "typecheck failed", "push rejected").
```

2.3. **Parse the sub-agent return.** Take the sub-agent's full return text, split on newlines, find the last non-empty line, and `JSON.parse` it. If parsing fails:
- Log: `{"ts":"<ISO>","pr":<PR>,"event":"iter-error","iteration":<N>,"raw":"<last-line-truncated-to-200-chars>"}`
- Set `termination_reason = "error"`.
- Show the user the raw sub-agent output (full, not truncated) so they can debug.
- Go to Step 6.

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

3.3. **Push happened — continue to retrigger.**

If `parsed.fixed > 0` AND `parsed.pushed_commit_sha` is non-null:
- Proceed to Step 4.

3.4. **Defensive: push expected but missing.**

If `parsed.fixed > 0` AND `parsed.pushed_commit_sha` is null:
- Sub-agent reported fixes but did not push — treat as error.
- Log: `{"ts":"<ISO>","pr":<PR>,"event":"iter-error","iteration":<N>,"error":"fixed>0 but no pushed_commit_sha"}`
- Set `termination_reason = "error"`, go to Step 6.

### 4. Retrigger Copilot review

4.1. **Idempotency check — skip if recent duplicate.**

Fetch the most recent PR issue comment (top-level conversation, not review comments):

```bash
gh api repos/<owner>/<repo>/issues/<PR>/comments
```

Parse JSON. Take the last element of the array. Determine the current user's login:

```bash
gh api user --jq .login
```

If the last comment's `user.login` equals the current user's login AND `body` is exactly `@copilot review` (trimmed) AND `created_at` is within the last 5 minutes of current time:
- Log: `{"ts":"<ISO>","pr":<PR>,"event":"retrigger-skipped","reason":"recent-duplicate"}`
- Skip to Step 5.

4.2. **Post retrigger comment.**

```bash
gh pr comment <PR> --body "@copilot review"
```

If exit code is non-zero, sleep 30 seconds and retry once. If the retry also fails:
- Log: `{"ts":"<ISO>","pr":<PR>,"event":"retrigger-failed","exit_code":<code>}`
- Set `termination_reason = "error"`.
- Go to Step 6.

4.3. **Record retrigger timestamp** (used as the start point for `poll_timeout` in Step 5):

```
retrigger_started_at = now()
```

Log:

```json
{"ts":"<ISO>","pr":<PR>,"event":"copilot-retrigger"}
```

**Known limitation — Actions-free trigger.** The `@copilot review` comment mechanism runs through a GitHub Actions workflow and therefore consumes Actions minutes. When Actions billing is exhausted, this path silently fails to fire a new review (the comment posts but Copilot never responds).

The UI's "Re-request review" refresh icon next to Copilot in the PR reviewers sidebar uses a different path that does not depend on Actions. Attempts to reproduce it via REST (`DELETE` + `POST` to `/requested_reviewers` with `reviewers[]=Copilot`, login `Copilot`, bot id `175728472`) have been empirically observed not to trigger an immediate review — so the exact endpoint the UI uses is unknown from documentation alone. To add a reliable Actions-free retrigger here, the endpoint needs to be captured from the browser Network tab while clicking the refresh icon, then wired into Step 4 above as the primary path with `@copilot review` as fallback.

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
  reviews = gh api repos/<owner>/<repo>/pulls/<PR>/reviews
  candidates = [r for r in reviews
                 if r.user.login == "copilot-pull-request-reviewer[bot]"
                 and r.id > last_copilot_review_id]
  if candidates:
    new_id = max(c.id for c in candidates)
    last_copilot_review_id = new_id
    log {"ts":"<ISO>","pr":<PR>,"event":"review-detected","review_id":new_id}
    goto 5.4 (continue)
  else:
    sleep(poll_interval)   # default 30s — use ScheduleWakeup if >= 60s remain
```

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
- `timeout`: *Copilot didn't submit a review within `<poll_timeout>`s. Check the PR in GitHub UI; re-run when Copilot has responded.*
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
| Copilot silent past `poll_timeout` | polling loop exits without match | `termination_reason="timeout"`, suggest manual UI check |
| `gh pr comment` for `@copilot review` fails | non-zero exit code | retry once after 30s; still failing → `termination_reason="error"` |
| Session closed mid-wait | `ScheduleWakeup` doesn't fire | loop dies silently; log preserves last state; re-invoke offers resume via 1.4 |
| Fixed > 0 but no pushed_commit_sha | defensive check in Step 3.4 | `termination_reason="error"` |

## Guardrails

- **Never** skip the OpenSpec read step inside the sub-agent prompt — classification of DISAGREE vs. FIX depends on it.
- **Never** pipe `gh api` output through `jq` in generated commands — `jq` may be absent. Parse JSON inline or with `gh --jq` (built-in, always available).
- **Never** post multiple PR review replies in parallel — the `review-fix` skill already enforces sequential posting; don't override.
- **Never** merge, close, approve, or request-changes on the PR — `review-loop` only iterates on review comments.
- **Never** invoke the `review-fix` skill directly in the orchestrator session — always delegate via the `Agent` tool so the main session keeps a clean context across iterations.
- **Never** guess the `openspec-change-name` if the directory is missing — always ask the user (Step 1.2).
