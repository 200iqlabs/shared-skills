# Evals for `review-fix`

- `evals.json` — 6 behavioural prompts, each aimed at a defect this skill actually shipped with:
  a reply body carrying code spans, verification in a repo with no JavaScript toolchain, an
  outdated comment, a wrong comment needing pushback, scratch data leaking into the repo, and
  five threads that must each end with exactly one reply.
- `trigger-eval.json` — 20 triggering queries, 10 positive and 10 negative.

## Measured triggering: 90%, and it does not move

Run with `tools/skill-trigger-eval.py`, 20 queries x 3 runs on `claude-opus-5`.

| Description | Accuracy | The two contested negatives |
|---|---|---|
| Shipped (unchanged) | **18/20 = 90%** | 1.00 / 0.67 |
| A hand-written rewrite | 18/20 = 90% | 1.00 / 1.00 |
| Rewrite + the exclusion stated as an explicit principle | 18/20 = 90% | 1.00 / 1.00 |

Three descriptions, one number. The rewrite was reverted; the tightened variant was never adopted.
**The shipped description stands unchanged**, because nothing measured beat it.

## The finding: an exclusion clause is a weak signal

Every failure, in every variant, is the same shape — a request to **produce** a review:

- *"zrób mi review tych zmian zanim zacommituję, szukam błędów w logice"*
- *"can you review PR #12 and tell me what's wrong with it"*

`review-loop` fails identically on *"zrób review tego PR-a i powiedz co jest nie tak"*, at 95%
across two variants of its own. Three failures, two skills, one missing distinction.

The third variant above says outright that a request to look at code and say what is wrong remains
a code review even when it names a pull request. It changed nothing: both queries still trigger on
every run. The working explanation is that this skill's positive territory — review comments, a PR,
fixing, replying — overlaps these requests so heavily on the surface that relevance is settled
before an exclusion is weighed.

**Generalisable to any skill here: describing what a skill is for works; describing what it is not
for does not.** Do not spend a fourth wording on this.

## Where the boundary is enforced instead

Step 3 of the skill. After the fetch, "are there comments?" is a fact rather than a guess — zero
top-level comments means no review has happened and the user wanted one written. The skill says so
and points at a code review. Triggering stays wrong; the outcome stops being wrong.

## Two corrections to an earlier revision of this file

**The runner already existed.** `tools/skill-trigger-eval.py`, committed in `504999d` on
2026-08-18. An earlier revision recommended writing one, estimated at an hour, and nearly did. The
tool was built, never used, and therefore invisible — the same pattern that let this skill ship
broken.

**The measurement failure had two causes, not one.** `skill-creator`'s optimiser reads its
subprocess with `select.select` on a pipe, which raises `OSError [WinError 10093]` on Windows. But
running the measurement from inside this repository also breaks it: the nested `claude -p` inherits
`CLAUDE.md` and the open work, behaves like a coding agent on this codebase, and explores instead of
consulting the skill. Every query then scores 0.00 for reasons unrelated to the description. Fixing
`select` alone would not have been enough — which is why the local runner uses a neutral scratch
directory.
