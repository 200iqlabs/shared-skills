# Design — a verdict of absence is earned, not inferred

## The shape of the old check, and why it could not be fixed in place

Step 5.3 did three things in one pipeline: fetch a listing, narrow it to the run for this review
request, and read the verdict off what was left. The third step treated **an empty result as an
answer**. That made the check's correctness the conjunction of every narrowing condition being
right, all the time, in every case — and each condition has to be right in two directions: it
must keep the run it is looking for, and drop the ones it is not.

Review found the conditions wrong in the first direction four times. Each fix was local and
correct; each round found the same verdict produced by the next condition along. A fifth fix
would be a fifth condition. The defect is not in any one filter but in letting a filter's empty
output stand for a fact about the world.

## Decision: invert the default

The step now starts from `unknown` and lets only positive evidence overwrite it. With the default
inverted, a filter that fails can only move the answer toward *I don't know* — it costs patience,
never a false verdict. Any future error in identification produces at worst `unknown`, which sends
a person to look.

| What the step established | Answer |
|---|---|
| a run identified for this request, and its state | wait, or `run-unfinished` / `run-failed` / `run-completed-no-review` |
| the listing succeeded and holds no run at all | `no-run` |
| anything else | inconclusive → wait while extensions remain → `unknown` |

## Decision: what counts as proof of absence

The task that opened this change sketched the proof as *the workflow exists, the branch listed
without error, and no run matches the version*. The last clause is still a filter: the sha
comparison was the first of the four defects, and an empty result from it is exactly the false
alarm being retired. So the condition adopted here is stronger — **the listing holds no run at
all**, before any name, sha or time test. The first two clauses of the sketch survive inside it:
a listing scoped with `--workflow Copilot` that succeeds is proof the workflow exists, and success
is defined as exit 0 with output that parses as a JSON array, never as empty stdout.

What the stronger condition gives up: on a branch where Copilot already ran — every iteration
after the first — `no-run` becomes unreachable, and a request that started no run ends as
`unknown` after the extensions. That is the honest answer there. Copilot demonstrably works on the
branch, so the `no-run` line (*check whether Copilot is enabled here*) would point at the wrong
thing; `unknown` with `no-match` points at the pull request and at the runs that do exist.

## Decision: inconclusive states wait, on the same budget

An inconclusive listing is most often one read too early. It therefore waits like an unfinished
run, from the **same** `poll_extensions` budget: a wait that alternates — nothing identifiable on
one visit, an unfinished run on the next — is one wait, and two budgets would double the bound the
cap exists to keep. At the cap the outcome is whatever the last visit established.

## Decision: `workflow-not-found` is inconclusive, not `no-run`

The old step made a not-found failure the one exception that concluded `no-run`. It is not proof:
it says either that Copilot review never ran in the repository or that the workflow carries a name
other than the one asked for — and that name was itself a defect site in the fourth round. It now
takes the inconclusive path with its own reason, and the report points at `gh workflow list --all`
and the reviewers sidebar. Other failures of the listing keep retry-then-`error`, because they
are faults in the loop's own access and `error` carries their text into the sign-off record.

## Decision: "still running" is a question over the whole set

The fourth defect was selection: the step read the newest matching run, and before that fix it
read an older one. Choosing better does not remove the choice. Step 5.3 now works with two sets:
`on_sha`, every review run against the sha the wait is about, and `matching`, the subset the
created-at bound identifies as this request's own runs (the next section says why they differ).
Whether the review may still be coming is asked over **all of `on_sha`** — any unfinished run in
it keeps the wait open, and so does one that completed inside the grace period — and a single run,
the newest of `matching`, names the ending only once nothing in `on_sha` is unfinished or freshly
completed. Every clause over a set requires at least one member; over an empty set *every run has
completed* is vacuously true, which would be a certain answer built from nothing.

## Decision: the created-at bound picks the ending, not the wait

In the retrigger case a lower bound on creation time picks out the run this request started. The
run the push started carries the same sha but is routinely older than the bound — `review-fix`
pushes and then posts its replies before the wait is stamped — and step 5.2 accepts any review
written against the sha, so that run may still deliver the review. The still-running question and
the completion grace therefore read every review run on the sha; the bound applies only to naming
the ending. This removes a condition from the question that keeps the wait open, rather than
adding one.

## Rejected: more precise identification

Tightening the filters — matching the request id, reading run logs, correlating with the review
request event — would make identification better and leave the structure that failed in place: a
precise filter that misfires once still produces a confident wrong answer. The task that opened
this change rules it out explicitly.

## Rejected: `error` for every inconclusive state

`error` ends the loop at once and reads as a fault in the machinery. Most inconclusive states
resolve on the next visit, and the ones that do not are about the pull request, not the loop.
