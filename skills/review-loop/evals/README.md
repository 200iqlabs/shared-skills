# Evals for `review-loop`

- `evals.json` — 7 behavioural prompts covering the states this loop handles badly when it handles
  them badly: a repository where Copilot has never reviewed, a first-ever pull request where the
  availability check has nothing to read, a timeout that must not assert which of two causes it
  hit, a missing OpenSpec change directory, a clean termination that must not read as
  "all fixed", an unrelated open issue whose title carries the same words and pull-request number
  and must not be mistaken for the sign-off record, and a failed create that must be announced as
  an ungated run instead of being reported as complete.
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

## What is hard to evaluate here

Parts of `evals.json` resist a single-turn eval. The pre-flight Copilot check and the timeout branch
only reveal themselves in a repository where Copilot is absent or silent, which is a property of the
environment rather than of the prompt. Expect those two to need a fixture or a manual run — the same
limitation `task-delegation` recorded, where the moment the skill matters arrives several turns after
the prompt.
