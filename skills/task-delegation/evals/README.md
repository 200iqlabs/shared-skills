# Evals for `task-delegation`

Two sets, and one finding worth keeping.

- `evals.json` — 7 behavioural prompts covering the protocol: a three-task set, the delegation
  filter rejecting a convenience ask, a decision routed away, a question that must not advance the
  set, re-derivation when an answer makes a task moot, resumption after the last task, and a user
  demanding a batched list.
- `trigger-eval.json` — 20 triggering queries, 10 positive and 10 negative.

## Measured triggering: 75%, below the repo's 80% bar

Best measured accuracy for the shipped description is **15/20 (75%)** — all 10 negatives pass, 5
of 10 positives. Closed deliberately at that number rather than tuned further; the reason is in
what the failures have in common.

**The positives that pass reliably are the ones that name the behaviour**: "wypisz mi wszystko co
muszę zrobić" (0.80), "utknąłeś na tym imporcie? jak coś jest po mojej stronie to dawaj, tylko po
kolei" (1.00). **The positives that fail are the ones where the handover point has not been reached
yet**: "zrób integrację z Resend", "ogarnij konfigurację domeny". A single-turn eval never gets
there — the agent starts working, and the moment it would reach for this skill is several turns
away. What this skill actually keys on is the agent's own state, which the harness cannot stage.

"czego ode mnie potrzebujesz" sits between the two and swings between 0.00 and 1.00 across runs:
the model treats it as directly answerable, which is the documented reason skills go unconsulted.

Four measured rounds, none of which found a description that lifted the failing group. One
attempted improvement — reframing the opening around the agent's internal state and appending a
clause about the user pre-announcing their side — measured **worse** (60%), and was reverted. The
shipped description is the original.

Since all 10 negatives pass in every round, the risk here is under-triggering, not over-triggering.

## Running them

The skill-creator plugin's `scripts/run_eval.py` does not work on Windows: it drives the
`claude -p` subprocess with `select.select()` on a pipe, which only accepts sockets there and
fails with WinError 10093. Every query then scores 0.00 regardless of the description. Use the
repo's runner instead:

```bash
python tools/skill-trigger-eval.py \
  --eval-set skills/task-delegation/evals/trigger-eval.json \
  --skill-path skills/task-delegation \
  --model claude-opus-5 --runs 5
```

Two things it does that the original does not: it runs in a scratch project, so the nested session
does not inherit this repo's CLAUDE.md and start behaving like a coding agent on this codebase;
and it counts a timeout as a lost run rather than as a non-trigger, so machine load cannot
masquerade as a description that fails to match. Both mistakes produced misleading numbers here
before they were fixed.
