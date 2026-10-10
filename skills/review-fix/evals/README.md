# Evals for `review-fix`

Since `review-via-codex` the skill runs a Codex review itself and acts on its findings; it no
longer reads pull-request comments or replies to them. Its evals follow:

- **Behavioural cases** live in [`evals/cases/review-fix/`](../../../evals/cases/review-fix/) as
  `claude plugin eval` cases, in the format the `behavioural-skill-evals` change fixes. Every case
  is a `tier-read` decision case: the prompt names the skill in prose, states the run's state (a
  `preflight` or `review` payload from the helper, rows of `review.md`, a test-guard result), asks
  what the skill does, and says not to run anything. Each carries a `tool_used: Skill` indicator, at
  least one deterministic `regex` grader on the answer, and an `llm` rubric where the decision is
  semantic.
- `evals.json` keeps **case 2 only** (verification without a JavaScript toolchain), which
  `behavioural-skill-evals` migrates in its group 5.
- `trigger-eval.json` — 20 triggering queries, 10 positive and 10 negative, rewritten for the new
  boundary (below).
- The helper the skill calls, `scripts/codex-review.mjs`, has its own check:
  `node skills/review-fix/scripts/selftest.mjs` (no Codex needed; four of its fixtures are real
  review payloads).

## Running the behavioural cases

From the repository root, on Windows or anywhere else (no shell grant is needed):

```bash
claude plugin eval . --eval-dir evals/cases --case 'review-fix-*' --tag tier-read --runs 3 --ablation none --model claude-opus-5-5 --judge-model claude-haiku-5-5 --threshold 0.8 --no-publish
```

`--ablation none`: for decision cases the no-plugin arm says nothing (the prompt names steps that
mean nothing without the skill). The baseline that matters is the previous version of the skill:
check out `origin/master` in a detached worktree, copy `evals/cases/` into it, and run the same
command there (`behavioural-skill-evals` turns this into `tools/plugin-eval-compare.py`).

## Case map

Old ids are those of `evals.json` before `review-via-codex`. "Base" is one run against
`origin/master` (the Copilot version); "branch" is three runs against the `review-via-codex` branch.
Measured 2026-10-10, Claude Code 2.1.292, `claude-opus-5-5`, judge `claude-haiku-5-5`.

| id | case | task | branch | base | what it checks |
|---|---|---|---|---|---|
| 1 | — | 3.6 | retired | — | reply body survives backticks; there are no replies any more |
| 2 | `evals.json` | — | kept | — | verification without a JS toolchain; migrates with `behavioural-skill-evals` |
| 3 | — | 3.6 | retired | — | outdated comment; the judgement returns as case 17 |
| 4 | — | 3.6 | retired | — | wrong comment; the judgement returns as case 18 |
| 5 | — | 3.6 | retired | — | scratch data outside the repository; returns as a `tier-shell` case once the harness exists |
| 6 | — | 3.6 | retired | — | every thread answered once |
| 7 | `7-severity-orders-the-p-scale` | 3.3 | 1.00 | 0.33 | P0, then P2, then the P3s in arrival order |
| 8 | `8-no-tags-keeps-arrival-order` | 3.3 | 1.00 | 1.00 | no tag anywhere: arrival order, no invented ranking |
| 9 | `9-unknown-tag-is-treated-as-untagged` | 3.3 | 1.00 | 0.33 | an undefined tag is untagged; untagged follow tagged |
| 10 | `10-plugin-missing-stops-before-review` | 3.1 | 1.00 | 0.67 | stop, `/codex:setup`, no fallback to Copilot comments |
| 11 | `11-not-signed-in-stops-the-same-way` | 3.1 | 1.00 | 0.67 | the same stop when Codex is signed out |
| 12 | `12-missing-pointer-warns-once-and-reviews` | 3.1 | 1.00 | 0.33 | one warning naming the templates, then the review |
| 13 | `13-usage-limit-is-an-error-not-clean` | 3.2 | 1.00 | 0.80 | an exhausted allowance is an error, quoted, never clean |
| 14 | `14-unparseable-findings-are-an-error` | 3.2 | 1.00 | 1.00 | unreadable findings are an error; no reading by hand |
| 15 | `15-clean-review-is-recorded-and-pushed` | 3.2, 3.4 | 1.00 | 0.50 | a clean review is still recorded as the next round and pushed |
| 16 | `16-repeated-rejection-is-not-fixed-again` | 3.3 | 1.00 | 0.20 | a reworded finding the record rejected is a repeat of R1-2 |
| 17 | `17-stale-finding-gets-a-first-rejection` | 3.3 | 1.00 | 0.80 | first rejection: the code no longer exists |
| 18 | `18-wrong-finding-gets-a-first-rejection` | 3.3 | 1.00 | 0.80 | first rejection: the design decided otherwise |
| 19 | `19-nothing-fixed-still-commits-the-record` | 3.4 | 1.00 | 0.50 | a round that fixed nothing commits its record alone |
| 20 | `20-no-change-means-no-record` | 3.4 | 1.00 | 0.25 | no OpenSpec change: no `review.md`, and the summary says so |
| 21 | `21-edited-assertion-without-reason-is-an-error` | 3.5 | 1.00 | 1.00 | an existing test changed without a reason ends the round |
| 22 | `22-reasoned-test-change-commits` | 3.5 | 1.00 | 1.00 | a reasoned test change commits |
| 23 | `23-new-test-commits-without-a-reason` | 3.5 | 1.00 | 1.00 | a new test needs no reason |
| 24 | `24-opinion-only-goes-to-codex-review` | 3.6 | 1.00 | 0.33 | an opinion with no changes goes to `/codex:review` |
| 25 | `25-reviewed-working-tree-is-committed-even-when-clean` | 5.4 | 1.00 | 0.25 | no PR, dirty tree, clean review: the reviewed work is still committed, not pushed |
| 26 | `26-repository-scale-orders-the-fixes` | 5.4 | 1.00 | 1.00 | `Scale: blocker, should, nit` orders the fixes; a `[P1]` outside it goes last |

**All 18 cases pass on the branch, 3 runs each (score 1.00 every time); 10 fail against the base.**
Cases 25 and 26 came later, from the Codex findings of task 5.4 (fixed by hand at the owner's
request, sign-off issue #23): both 1.00 in 3 runs; 25 fails against the base, 26 does not, because
the old text already put the repository's own scale first. After those fixes the whole suite was
run once more as a regression check: every case at 1.00 except 12, whose answer was right but
speculated, from the eval sandbox's own git state, that the branch check would stop the pass. Its
prompt now says the run is on the pull request's branch; 1.00 in 3 runs since.
The eight that also pass against the base (8, 13, 14, 17, 18, 21–23) state a failure, a guard
result or a design reason so plainly in the prompt that a careful agent reaches the decision
without the new text. They stay as guards against regression, not as evidence of the change.
Cases 17 and 18 are the judgement old cases 3 and 4 checked through replies; it survives the move
to Codex, which is why the base passes them too.

Cost: about $0.20 per run on `claude-opus-5-5`, judge included (the 18 cases × 3 runs cost
$10.7); against the base about $0.21 per run.

**Waiting for the shell tier** (a fake `codex-companion.mjs` and `gh`, after the spikes S1 and S2 of
`behavioural-skill-evals`): the halves where the command is the point — the helper's parse on real
output inside a run, `git diff --name-status` in the test guard, the two commits of a round. The
helper's own selftest covers the parsing and the guard today.

## Triggering

Measured with `tools/skill-trigger-eval.py` (isolated mode), 20 queries × 3 runs on
`claude-opus-5`, 2026-10-10, against the new set in `trigger-eval.json`:

| Description | Accuracy | Miss |
|---|---|---|
| Shipped with `review-via-codex` (the only variant tried) | **19/20 = 95%** | *"zrób review moich zmian i od razu napraw co jest do naprawienia, zanim otworzę PR"* — a positive, 0.33 |

It clears the 80% bar on the first variant, so no other wording was measured. All ten negatives
score 0.00, the opinion-only requests included (*"powiedz mi tylko co jest nie tak…"*, *"can you
review PR #12 and tell me what's wrong with it"*); the second is a query the old description lost on
every variant. With the review now produced by the skill, the line between "fix it" and "only tell
me" is one the description can draw.

The number is not comparable with the old 90%: the set changed with the boundary. All ten
positives are new (they used to be about comments already on a pull request), four negatives are
new (an opinion only, a loop, a teammate's comments, setting up Codex), and six are unchanged.

**A caveat about the runner.** The nested `claude -p` loads the installed plugins, the published
`ss` among them, and only the throwaway test command counts as a trigger. An installed
`ss:review-fix` therefore competes with the description under test, and a query it wins reads as a
miss. Measured in the same session for `review-loop`, where it cost one query; here it may explain
the 0.33.

## Why the boundary moved

Before `review-via-codex` the skill acted on review comments that already existed, so a request to
*produce* a review was the one it had to refuse — and step 3 enforced that after the fetch, because
no wording of the description kept those requests out (three variants, one number: 90%). The skill
now produces the review itself, so "review this and fix it" is squarely its job. What it must not
take is a request for an opinion alone; that goes to `/codex:review`, which only the user can type.
Step 1 enforces it, for the same reason step 3 used to: describing what a skill is not for does not
stop it triggering.
