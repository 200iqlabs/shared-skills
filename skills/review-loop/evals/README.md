# Evals for `review-loop`

- `evals.json` — 5 behavioural prompts covering the states this loop handles badly when it handles
  them badly: a repository where Copilot has never reviewed, a first-ever pull request where the
  availability check has nothing to read, a timeout that must not assert which of two causes it
  hit, a missing OpenSpec change directory, and a clean termination that must not read as "all
  fixed".
- `trigger-eval.json` — 20 triggering queries, 10 positive and 10 negative.

The boundary that matters is the first negative: *"popraw komentarze copilota na PR 12 i odpisz na
nie"* is a single pass and belongs to `review-fix`. The same sentence is a **positive** in that
skill's set. One pass goes there; repeat-until-quiet comes here. The two sets are written to
disagree on purpose, so a description that blurs the line fails one of them.

The other negatives are adjacent loops that are not this loop: waiting on CI, re-running a flaky
test suite, polling a deployment, scheduling a daily check. Sharing the word "loop" is exactly what
makes them useful negatives.

## Triggering is UNMEASURED

Same blocker as `review-fix` — see `../../review-fix/evals/README.md` for the reproduction. In
short: `skill-creator`'s optimiser reads its subprocess with `select.select` on a pipe, which
raises on Windows, so trigger detection always returns "not triggered". Every negative passes,
every positive fails, and the score is flat across iterations regardless of the description. The
`best_description` such a run produces is not evidence of anything and was not applied.

The current description was widened by hand: natural-language triggers in Polish and English, and
the `review-fix` boundary stated explicitly. It is untested.

## A note on what this skill can and cannot be evaluated on

Even with a working measurement, some of `evals.json` is hard to stage. The pre-flight Copilot
check and the timeout branch only reveal themselves in a repository where Copilot is absent or
silent, which is a property of the environment rather than of the prompt. Expect those two to need
a fixture or a manual run rather than a single-turn eval — the same limitation `task-delegation`
recorded, where the moment the skill matters is several turns after the prompt.
