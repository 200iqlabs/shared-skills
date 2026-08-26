# Evals for `review-loop`

- `evals.json` — 5 behavioural prompts covering the states this loop handles badly when it handles
  them badly: a repository where Copilot has never reviewed, a first-ever pull request where the
  availability check has nothing to read, a timeout that must not assert which of two causes it
  hit, a missing OpenSpec change directory, and a clean termination that must not read as
  "all fixed".
- `trigger-eval.json` — 20 triggering queries, 10 positive and 10 negative.

## Measured triggering: 95%

Run with `tools/skill-trigger-eval.py`, 20 queries x 3 runs on `claude-opus-5`.

**19/20 = 95%** for the description now shipped. All ten positives trigger, nine of ten negatives
stay quiet. (One run of one query was lost to a timeout and excluded by the harness.)

The description was widened by hand before this measurement — natural-language triggers in Polish
and English, plus an explicit boundary against `review-fix`. **No baseline was taken for the
previous description**, so this is not a claim that the rewrite improved anything; the run for the
old wording was stopped before it finished. What can be said is that the shipped version is
measured and clears the repo's 80% bar. On `review-fix` the equivalent rewrite turned out to buy
nothing and was reverted — treat any assumption of improvement here with the same suspicion until
someone runs the baseline.

## The boundary against `review-fix` holds

The first negative is the one that matters: *"popraw komentarze copilota na PR 12 i odpisz na nie"*
scores **0.00** — it never triggers this skill. The same sentence is a **positive** in
`review-fix`'s set. One pass belongs there; repeat-until-quiet belongs here. The two sets are
written to disagree on purpose, so a description blurring that line fails one of them. Neither
does.

The other negatives are adjacent loops that are not this loop: waiting on CI, re-running a flaky
test suite, polling a deployment, scheduling a daily check. Sharing the word "loop" is what makes
them useful.

## The one failure is shared with `review-fix`

*"zrób review tego PR-a i powiedz co jest nie tak"* triggers and should not. `review-fix` fails on
two queries of exactly the same shape — a request to **produce** a review rather than act on
feedback that already exists. Three failures across two skills, one missing distinction. See
`../../review-fix/evals/README.md` for the full picture and the tightened wording that was drafted
for it but never measured.

## What is hard to evaluate here

Parts of `evals.json` resist a single-turn eval. The pre-flight Copilot check and the timeout branch
only reveal themselves in a repository where Copilot is absent or silent, which is a property of the
environment rather than of the prompt. Expect those two to need a fixture or a manual run — the same
limitation `task-delegation` recorded, where the moment the skill matters arrives several turns after
the prompt.
