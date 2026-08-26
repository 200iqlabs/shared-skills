# Evals for `review-fix`

Two sets, and one blocker worth keeping.

- `evals.json` — 6 behavioural prompts, each aimed at a defect this skill actually shipped with:
  a reply body carrying code spans, verification in a repo with no JavaScript toolchain, an
  outdated comment, a wrong comment needing pushback, scratch data leaking into the repo, and
  five threads that must each end with exactly one reply.
- `trigger-eval.json` — 20 triggering queries, 10 positive and 10 negative.

The negatives are deliberately near-misses: asking *for* a review, fixing failing CI, summarising
what a reviewer said without touching code, replying to an issue comment, merging. Each shares
vocabulary with this skill and belongs somewhere else.

## Triggering is UNMEASURED, not measured-and-passing

The repo's 80% bar has not been cleared here, and the honest reason is that it could not be
measured on this machine.

`skill-creator`'s optimiser (`scripts/run_loop.py`) reads the `claude -p` subprocess with
`select.select` on a pipe. On Windows that raises `OSError [WinError 10093]` — `select` there works
on sockets only. Reproduced directly:

```
select na potoku: BLAD -> OSError [WinError 10093]
```

The consequence is a measurement that looks like a result. Trigger detection always returns "not
triggered", so **every negative passes and every positive fails**, and the number never moves no
matter what the description says. A full five-iteration run produced exactly that: `trigger_rate:
0.0` on all 20 queries, a flat 50% score at every iteration, and a `best_description` chosen among
candidates that had all scored identically on no signal at all.

**That description was not applied.** Adopting it would have meant shipping a change justified by a
measurement that never happened — the same pattern that let this skill ship broken in the first
place.

## What one select-free run showed

A hand-written runner without `select` does execute correctly. On one positive query the subprocess
did not consult the skill — it went straight to `Bash` and started hunting for the PR across
repositories. One data point, not a measurement, but it points the same way as the thin original
description did.

## What the current description rests on

Craft, not evidence. It was widened to carry natural-language triggers in both Polish and English,
and to state the boundary against `review-loop` in both directions. It is untested. Treat the
triggering rate as unknown until the measurement path works.

## To finish this properly

Either fix the `select` call upstream in `skill-creator` (it lives in the plugin cache and must not
be edited in place), or write a small local runner that reads the subprocess without `select` and
detects a trigger from the `tool_use` blocks in the stream. The second is maybe an hour of work and
would unblock the 80% bar for every skill in this repository, not just this one.
