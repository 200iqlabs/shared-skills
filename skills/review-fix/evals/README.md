# Evals for `review-fix`

- `evals.json` — 6 behavioural prompts, each aimed at a defect this skill actually shipped with:
  a reply body carrying code spans, verification in a repo with no JavaScript toolchain, an
  outdated comment, a wrong comment needing pushback, scratch data leaking into the repo, and
  five threads that must each end with exactly one reply.
- `trigger-eval.json` — 20 triggering queries, 10 positive and 10 negative.

The negatives are deliberately near-misses: asking *for* a review, fixing failing CI, summarising
what a reviewer said without touching code, replying to an issue comment, merging. Each shares
vocabulary with this skill and belongs somewhere else.

## Measured triggering: 90%, and the rewrite that was reverted

Run with `tools/skill-trigger-eval.py`, 20 queries x 3 runs on `claude-opus-5`.

| Description | Accuracy |
|---|---|
| Shipped (unchanged) | **18/20 = 90%** |
| A hand-written rewrite | 18/20 = 90% |

The rewrite was **reverted**. It was wider, carried Polish triggers and named the boundary against
`review-loop` — and it moved nothing. Same accuracy, same two failures, differences in per-query
confidence well inside the noise of three runs.

That is the whole finding. The shipped description was already over the bar; it only *looked* thin.
Rewriting it was a change made on the way something read rather than on what it did, and the
measurement is what caught that. This is also exactly what CLAUDE.md's `/skill-creator` mandate
exists to prevent, and the reviewer on PR #5 was right to raise it.

## The two failures are a boundary, not a wording problem

Both descriptions let these through:

- *"zrób mi review tych zmian zanim zacommituję, szukam błędów w logice"*
- *"can you review PR #12 and tell me what's wrong with it"*

Both are requests to **produce** a review. `review-loop` fails the same way on
*"zrób review tego PR-a i powiedz co jest nie tak"* — three failures across two skills, one shape.
The pair has no clause separating *assess this code* from *act on feedback that already exists*,
and no phrasing tried so far supplies one.

A tightened variant stating that boundary as a principle was drafted and queued; the run was
stopped before producing a number, so nothing is claimed for it. It is worth finishing — and it
should be measured on both skills, not assumed to carry over.

## Two corrections to an earlier revision of this file

**The runner already existed.** `tools/skill-trigger-eval.py`, committed in `504999d` on
2026-08-18. An earlier revision recommended writing one, estimated at an hour, and nearly did.
The tool was built, never used, and therefore invisible — the same pattern that let this skill ship
broken.

**The measurement failure had two causes, not one.** `skill-creator`'s optimiser reads its
subprocess with `select.select` on a pipe, which raises `OSError [WinError 10093]` on Windows. But
running the measurement from inside this repository also breaks it: the nested `claude -p` inherits
`CLAUDE.md` and the open work, behaves like a coding agent on this codebase, and explores instead of
consulting the skill. Every query then scores 0.00 for reasons unrelated to the description. Fixing
`select` alone would not have been enough — which is why the local runner uses a neutral scratch
directory.
