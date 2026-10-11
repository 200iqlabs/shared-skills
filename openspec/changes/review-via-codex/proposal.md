# Review loop: Codex reviews the branch locally instead of Copilot reviewing it remotely

## Why

Copilot reviews a pull request remotely and on its own schedule, so most of `review-loop` exists
to wait for it and to decide whether a review is coming at all: steps 4–5 are about 400 of the
skill's 1114 lines, and three of the eight requirements in `code-review-loop` regulate nothing
but Copilot's review runs. The Codex plugin for Claude Code (`codex@openai-codex`) reviews the
branch locally in one call that ends with a result or an error — in a fresh context, from a model
that did not write the change. On small diffs a review took 40–97 s in trial runs. The owner is
moving the review process to Codex, and the two review skills have to follow.

## What Changes

- **BREAKING** `review-fix` no longer reads pull-request review comments. It runs a Codex review
  of the branch through the installed plugin's runtime, judges each finding, fixes, verifies,
  commits, and pushes when the branch has a pull request. In-thread replies on GitHub go away:
  Codex findings have no threads.
- **BREAKING** `review-loop` no longer requests Copilot or waits for it. The REST re-request, the
  scheduled wake-ups, the polling of `pulls/<n>/reviews` and the run check of step 5.3 with its
  five timeout outcomes are removed. An iteration is: Codex review → fixer sub-agent → push.
- **BREAKING** Both skills require the Codex plugin and a signed-in Codex CLI. Pre-flight stops
  with a pointer to `/codex:setup` when either is missing. There is no Copilot fallback.
- **New: a durable review record per change.** `openspec/changes/<change>/review.md` records every
  finding of every round with its outcome — fixed with its commit, rejected with a one-sentence
  reason, or repeated — and the output of the checks that ran. The fixer reads it before judging,
  in every round and in every later run, so a finding rejected once is not judged again from
  scratch. It is committed with the round, so the pull request carries the whole record in its
  diff.
- **New: review policy in `REVIEW.md`**, pointed to from `AGENTS.md`, which Codex reads on its
  own. The plugin ships a template for both; pre-flight warns when the reviewed repository has no
  pointer. This repository gets its own pair, since the loop reviews it too.
- **Changed: only important findings extend the loop.** A round is forced by findings at `P0`–`P2`
  by default; `P3` findings are fixed in passing or recorded, and never by themselves start
  another round. `REVIEW.md` may move the line.
- **Changed: the severity scale.** Codex's `P0` > `P1` > `P2` > `P3` replaces Copilot's
  `blocker` > `should` > `nit` as the default; a scale defined in the repository's policy still
  wins.
- **New: existing tests are protected.** A fix that changes a test file which existed before the
  round needs a reason recorded in `review.md`; without one, the round ends in an error before
  anything is committed.
- **New: a clean verdict needs evidence.** "No findings" is concluded only from a review that
  exited 0 and whose output was parsed; a failed run, an exhausted plan limit or output the parser
  does not recognise ends the run as `error`, never as clean.
- The final report lists findings that look like repository conventions, as candidate
  `CLAUDE.md` rules — proposals only.
- Kept: the sign-off issue as the human gate, one fixer sub-agent per iteration, `--max`, and the
  run log.
- Descriptions, evals, `README.md`, `hooks/rules/50-shipping.md` and `CHANGELOG.md` follow.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `code-review-loop`: removes the three requirements about Copilot review runs (positive evidence
  of a missing run, the inconclusive check, every run on the sha); adds requirements for a clean
  verdict only from a completed, parsed review, for the per-change review record, for important
  findings alone extending the loop, and for protecting existing tests; changes the default
  severity scale to `P0`–`P3`. The four requirements on the sign-off record are unchanged.

## Non-goals

- **No `--reviewer copilot`.** Keeping both paths would keep the whole waiting machinery to
  maintain. The Copilot path stays in git history.
- **No reading of human review comments.** Every one of the 61 top-level review comments in this
  repository (2026-08-25 to 2026-10-08) came from Copilot; none from a person.
- **No adversarial review in the loop.** Its prompt tells Codex to break confidence in the change
  and to approve only when it cannot defend a single finding, which works against a loop that ends
  when the reviewer has nothing important left. It stays a command a person runs by hand.
- **No automatic review of every pull request.** The working-mode shipping rule remains the
  advisory guarantee; review in CI is a separate change.
- The plugin's internals are not vendored. The skills call the installed plugin's runtime and
  break loudly, not silently, when its interface moves.

## Impact

- `skills/review-fix/SKILL.md`, `skills/review-loop/SKILL.md` and both `evals/` directories
  (rewritten through `/skill-creator`, as this repository requires).
- New templates for `REVIEW.md` and the `AGENTS.md` pointer; this repository's own `REVIEW.md` and
  `AGENTS.md`.
- `README.md` (skill table), `hooks/rules/50-shipping.md` (step 4 names the review flow),
  `CHANGELOG.md`.
- New dependency: the `codex@openai-codex` plugin and a ChatGPT plan that includes Codex. Each
  round spends the user's Codex allowance; `--max` bounds it.
- Repositories that still have Copilot's automatic review switched on will keep receiving its
  comments, which neither skill reads any more.
