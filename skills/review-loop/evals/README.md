# Evals for `review-loop`

- `evals.json` — 22 behavioural prompts covering the states this loop handles badly when it
  handles them badly, in five groups.

  **The loop itself (1–5):** a repository where Copilot has never reviewed, a first-ever pull
  request where the availability check has nothing to read, a timeout that must not assert which
  of two causes it hit, a missing OpenSpec change directory, and a clean termination that must
  not read as "all fixed".

  **Which record the gate lands in (6, 8, 10, 11):** an unrelated open issue whose title carries
  the same words and pull-request number and must not be mistaken for the sign-off record; a
  record a person already closed, which must not be reopened or reused; an open record under the
  canonical title, which must be appended to rather than duplicated; and a lookup that errored,
  which must create rather than read its own failure as "none exists". The fourth is what keeps
  the sixth honest: alone, it passes a regression that always takes the create path.

  **What the run says about its outcome (7, 12, 13):** a failed create announced as an ungated
  run instead of reported as complete; a failed *append*, which must name the open issue rather
  than claim nothing was created; and a failed lookup followed by a failed create, which must
  produce one outcome instead of two contradictory paragraphs. Between them the three walk the
  `GATE_WRITTEN` × `EXISTING` × `LOOKUP_FAILED` matrix that decides which warning is printed.

  **What the record carries (9, 14, 15):** an error text carrying the heredoc delimiter, which
  must not truncate the record it is written into; a report that could not be read, where the
  record is opened anyway and says so rather than passing for a gate that carried the run; and an
  aborted run whose error text and run log never arrived, where the body must not promise them
  below a line that carries nothing.

  **Whether a review is still coming (16–22):** the run check in step 5.3 concludes that no review
  run exists only from a listing that succeeded and holds nothing (17); a listing holding runs
  none of which matches the pushed sha (16), a listing that may be cut at `--limit` (19) and a
  `Copilot` workflow that does not resolve (18) are inconclusive — they wait, and at the cap end as
  `unknown` with "check manually", never as `no-run`. One unfinished run among several keeps the
  wait open whichever is newest (20) — the run the push started included, though it predates the
  created-at bound that picks out this request's own run (22) — and a failed command is not read as the empty listing that
  would prove absence (21). The first three are each one of the mechanisms that produced a false
  `no-run` in the review rounds this rule came out of; 17 is what keeps them honest — without it,
  a regression that never concludes `no-run` passes the group.
- `trigger-eval.json` — 20 triggering queries, 10 positive and 10 negative.

## Measured triggering: 95%, and it does not move either

Run with `tools/skill-trigger-eval.py`, 20 queries x 3 runs on `claude-opus-5`.

| Description | Accuracy |
|---|---|
| Shipped | **19/20 = 95%** |
| Shipped + the exclusion stated as an explicit principle | 19/20 = 95% |

All ten positives trigger in both. The tightened variant was **not adopted** — it bought nothing,
and an unmeasured-against-baseline change that also fails to improve is not worth the diff. (A run
or two per pass was lost to timeouts and excluded by the harness.)

No baseline exists for the wording this skill carried before the previous change; that run was
stopped before finishing. So nothing here claims the current description is better than what came
before — only that it is measured and clears the repo's 80% bar.

## The boundary against `review-fix` holds

The first negative is the one that matters: *"popraw komentarze copilota na PR 12 i odpisz na nie"*
scores **0.00** in both variants. The same sentence is a **positive** in `review-fix`'s set. One
pass belongs there; repeat-until-quiet belongs here. The two sets are written to disagree on
purpose, so a description blurring that line fails one of them. Neither does.

The other negatives are adjacent loops that are not this loop: waiting on CI, re-running a flaky
test suite, polling a deployment, scheduling a daily check. Sharing the word "loop" is what makes
them useful.

## The one failure is shared, and is not a wording problem

*"zrób review tego PR-a i powiedz co jest nie tak"* triggers at 1.00 in both variants, including
the one that explicitly excludes requests to produce a review. `review-fix` fails on two queries of
the same shape across three of its own variants. Five measurements across two skills, and the
number never moves.

See `../../review-fix/evals/README.md` for the conclusion drawn from it: describing what a skill is
for works, describing what it is not for does not. The boundary is enforced in step 1.3b of this
skill instead — if nothing in the request implies repetition, the user wants an opinion rather than
an unattended loop, and the skill says so and points elsewhere.

## Running the behavioural evals

They are not run in CI and cost model calls, so they run by hand. In a session in this repository,
run `/skill-creator` on `skills/review-loop` and have it evaluate `evals/evals.json` — the whole set,
or the ids a change touched — with the skill on the branch under test against the previous version
as the baseline (`git show origin/master:skills/review-loop/SKILL.md` into a scratch copy). A case
that passes with both versions does not show the change did anything; for 16, 18, 19, 20 and 22
the baseline is expected to fail.

## What is hard to evaluate here

Parts of `evals.json` resist a single-turn eval. The pre-flight Copilot check and the timeout branch
only reveal themselves in a repository where Copilot is absent or silent, which is a property of the
environment rather than of the prompt. Expect those two to need a fixture or a manual run — the same
limitation as any skill whose moment arrives several turns after the prompt.
