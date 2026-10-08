# Review loop: "no review run" only from positive evidence

## Why

When the wait for a Copilot review expires, step 5.3 of `review-loop` asks the review workflow
whether a run for the current review request is still going. It answered by listing runs and
narrowing the list — by workflow, run name, head sha and creation time — and **an empty result
was the verdict**: `no-run`, *no review is coming*. That verdict is the false alarm the step was
written to prevent, and every narrowing condition is a separate way to produce it.

Four review rounds on pull request 11 found that defect four times, through four different
mechanisms: a sha compared for full equality, a created-at bound on the path before the first
review, a listing truncated before the client-side filter ran, and the wrong run picked among
several that matched. The defects did not repeat — they moved up the pipeline, into fetching and
filtering. The condition set before the fourth round was that if logic rather than naming came
back, the fragment needed rewriting. Logic came back.

Patching the fifth mechanism would add a fifth condition, and with it a fifth place where the right
run can be dropped in silence. The surface grows with every fix; the approach does not converge.

## What changes

- **The default answer is inverted.** Step 5.3 starts every visit from `unknown` instead of
  `no-run`, and only positive evidence overwrites it.
- **Absence needs proof.** `no-run` is concluded only when the scoped listing succeeded (exit 0,
  output parsed as a JSON array) and holds no run at all — empty before any name, sha or time test.
  It is the only proof no filter can manufacture.
- **Everything else is inconclusive.** A listing that holds runs none of which is identifiable as
  this request's (`no-match`), a listing that may be cut at `--limit` (`listing-truncated`), and a
  `Copilot` workflow that does not resolve (`workflow-not-found`) wait on the same extension budget
  as an unfinished run. At the cap the loop ends with the new `timeout_outcome` **`unknown`**,
  whose report line says *check manually*, names the reason, and asserts neither a missing review
  nor a disabled Copilot. This replaces `no-run` on every path that was not proof.
- **"Still running" is asked of every review run on the sha.** If any of them is unfinished —
  including the run the push started, which predates the created-at bound — the loop keeps waiting
  whichever run is newest; a terminal diagnosis (`run-failed`, `run-completed-no-review`) is read
  from the newest run this request started, only once nothing on the sha is unfinished.
- The termination report, the error-handling table and the `--poll-timeout` description follow.
- Seven behavioural evals (16–22) cover the new paths, three of them the mechanisms that produced a
  false `no-run` in review.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `code-review-loop`: adds requirements for the run check at the end of a wait — when a missing
  review run may be concluded, what an inconclusive check does, and how several matching runs are
  read. The spec so far covered only the sign-off record and the fixer's ordering.

## Non-goals

- **No new filter.** The identification conditions stay as they are; none is added, and none is
  tightened to turn an inconclusive answer into a certain one.
- A failed `gh run list` keeps its retry-then-`error` path. It is the loop's own fault (auth,
  network, rate limit), and `error` carries its text into the sign-off record.
- Step 5.2's polling of the reviews endpoint, the extension size and the cap are unchanged.
- The skill's `description`; triggering is out of scope.

## Impact

- `skills/review-loop/SKILL.md` — step 5.3 rewritten; the `--poll-timeout` flag text, step 6.3's
  report lines and the error-handling table updated.
- `skills/review-loop/evals/evals.json` and `README.md` — evals 16–22 and how to run them.
- `skills/review-loop/SKILL.md` frontmatter — the `description` is quoted, its text unchanged. It
  failed to parse as YAML before this change, so the skill loaded with empty metadata; found by
  `claude plugin validate`, which this change has to pass.
- A run that would have ended `no-run` on a branch where Copilot has already run now spends up to
  three more extensions (15 minutes by default) and ends `unknown`. That is the price, paid only in
  the state the loop could not read.
