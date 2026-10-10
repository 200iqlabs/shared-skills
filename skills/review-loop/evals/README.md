# Evals for `review-loop`

Since `review-via-codex` the loop no longer requests Copilot or waits for it. Each iteration is one
`review-fix` pass in a sub-agent, and the loop ends as `clean`, `minor-only`, `no-fixes`,
`max-iterations` or `error`. Its evals follow:

- **New behavioural cases** live in [`evals/cases/review-loop/`](../../../evals/cases/review-loop/)
  as `claude plugin eval` cases, in the format the `behavioural-skill-evals` change fixes: `tier-read`
  decision cases that name the skill in prose, state the run's state (a `preflight` payload, a
  sub-agent's return line, `git status`, a record row), ask what the loop does and say not to run
  anything. Each carries a `tool_used: Skill` indicator and at least one deterministic `regex`
  grader on the answer; `llm` rubrics judge only the final message.
- `evals.json` keeps **cases 4–15** — the missing change directory, the clean ending and the ten
  sign-off cases — for `behavioural-skill-evals` to migrate in its group 5. Where their prompts
  named an ending that no longer exists, it was renamed: `no-comments` → `clean` (5, 6, 8, 10, 14),
  `timeout` → `minor-only` (13). Case 5's expectation now reads "clean"; nothing else changed.
- `trigger-eval.json` — 20 triggering queries, 10 positive and 10 negative, with Codex in place of
  Copilot (below).

## Running the behavioural cases

```bash
claude plugin eval . --eval-dir evals/cases --case 'review-loop-*' --tag tier-read --runs 3 --ablation none --model claude-opus-5-5 --judge-model claude-haiku-5-5 --threshold 0.8 --no-publish
```

The baseline that answers "did this change break anything" is the previous version of the skill,
not the absence of one: run the same command in a detached worktree of `origin/master` with
`evals/cases/` copied in (`behavioural-skill-evals` turns this into
`tools/plugin-eval-compare.py`).

## Case map

Measured 2026-10-10, Claude Code 2.1.292, `claude-opus-5-5`, judge `claude-haiku-5-5`. "Branch" is
three runs against the `review-via-codex` branch; "base" is runs against `origin/master`.

| id | case | task | branch | base | what it checks |
|---|---|---|---|---|---|
| 1–3 | — | 4.6 | retired | — | Copilot never reviewed here, first-ever PR, timeout wording |
| 4–15 | `evals.json` | 4.4 | kept | — | change directory, clean ending, sign-off record — see below |
| 16–22 | — | 4.6 | retired | — | the run check of the old step 5.3 |
| 23 | `23-dirty-working-tree-stops` | 4.1 | 1.00 | 1.00 | uncommitted changes abort before the first review |
| 24 | `24-plugin-missing-stops-the-loop` | 4.1 | 1.00 | 0.67 | stop, `/codex:setup`, no Copilot fallback |
| 25 | `25-null-strings-read-as-null` | 4.2 | 1.00 | 0.25 | `"error": "null"` is a real null; the loop goes on |
| 26 | `26-minor-only-ends-without-another-review` | 4.3 | 1.00 | 0.50 | only minor findings: `minor-only`, no further review |
| 27 | `27-fixed-p1-starts-another-review` | 4.3 | 1.00 | 0.33 | a fixed important finding starts another review |
| 28 | `28-important-all-rejected-ends-no-fixes` | 4.3 | 1.00 | 0.75 | important findings all rejected or repeated: `no-fixes` |
| 29 | `29-policy-line-p0-p1-stops-after-a-p2-round` | 4.3 | 1.00 | 0.20 | under `Important: P0-P1`, P2 fixes do not start a review |
| 30 | `30-usage-limit-mid-run-is-an-error` | 4.6 | 1.00 | 1.00 | an exhausted allowance in round 3 is `error`, carried to the sign-off |
| 31 | `31-rejection-met-again-in-a-later-run` | 4.6 | 1.00 | 0.67 | yesterday's rejection: a repeat, round 3, `no-fixes` |

**All nine pass on the branch, 3 runs each (1.00 every time); seven fail against the base**, one run
each. Cases 23 and 30 pass against the base as well — a dirty tree and an error carried to the
sign-off are things the old text also handled — so they guard against regression rather than show
the change. Cost: about $0.28 per run on the branch ($7.5 for the nine × 3), $0.40 against the base,
whose skill was 1,113 lines.

### The kept cases, re-run (task 4.4)

`behavioural-skill-evals` has not migrated cases 4–15 yet, so this change re-ran them from scratch
copies in the same decision-case format: graders on the answer, the sign-off cases matched only on
step 6.4 strings (the canonical title, `Closing this issue is the sign-off`, the warning texts), as
that change's design prescribes. The copies are not committed; they were handed over to it through
the shared notes. Step 6.4 itself is unchanged apart from one sentence that pointed at
`review-fix`'s reply bodies.

| id | branch (3 runs) | base | note |
|---|---|---|---|
| 4 | 1.00 | 1.00 (1 run) | |
| 5 | 0.78 | 0.67 (3 runs) | the judge's "does not claim every finding was fixed" fails on both; one branch run answered without loading the skill |
| 6 | 1.00 | 1.00 (1 run) | |
| 7 | 1.00 | 1.00 (1 run) | |
| 8 | 1.00 | 1.00 (1 run) | |
| 9 | 0.83 | 0.92 (3 runs) | Polish answers paraphrase the closing sentence instead of quoting it; the regex is too literal |
| 10 | 1.00 | 0.67 (1 run) | |
| 11 | 0.78 | 0.89 (3 runs) | one branch run phrased the lookup failure without the words the regex wants |
| 12 | 1.00 | 1.00 (1 run) | |
| 13 | 1.00 | 1.00 (1 run) | |
| 14 | 0.67 | 0.78 (3 runs) | the answers open the record with the warning first, as required; the Haiku judge rejects most of them on both sides |
| 15 | 0.78 | 1.00 (3 runs) | see below |
| 2 (`review-fix`) | 1.00 | 1.00 (1 run) | |

No sign-off case loses behaviour to this change: where the branch scores below 1.00, the base
scores the same within the noise of the same graders, apart from 15. These graders are
uncalibrated scratch copies; `behavioural-skill-evals` calibrates them (its task 5.3).

**Case 15 found a defect that predates this change.** On an `error` ending with no run log, step 6.3
writes "the run log could not be read" into `error.txt` through `log-tail.txt`. That leaves
`error.txt` non-empty, so 6.4's `[ -s error.txt ]` passes and the "error text could not be read"
warning never fires: the record goes out without the error text and without saying so. Two of the
three branch runs worked this out from the text and declined to print the warning the case expects.
The text is the same on `origin/master`; the follow-up is to key that warning on whether the error
text itself arrived, not on the file. Trial 1.4 of `review-via-codex` (Codex on pull request #10)
raised a neighbouring defect in the same step: one `BODY_INCOMPLETE` flag covers both a missing
report and a missing error text.

## Triggering

Measured with `tools/skill-trigger-eval.py` (isolated mode), 20 queries × 3 runs on
`claude-opus-5`, 2026-10-10:

| Description | Accuracy | Misses |
|---|---|---|
| Shipped with `review-via-codex` (the only variant tried) | **18/20 = 90%** | *"leć z codexem na PR 12 dla changu add-auth aż przestanie zgłaszać ważne uwagi…"* 0.00; *"PR 8, zmiana restructure-working-mode — review, popraw, wypchnij, kolejne review…"* 0.33 |

It clears the 80% bar on the first variant, so no other wording was measured. All ten negatives
score 0.00, the single-pass request that is `review-fix`'s positive included.

**The 0.00 is the installed copy of this same skill winning, not the description failing.** The
nested `claude -p` loads the installed plugins, the published `ss` among them, and only the
throwaway test command counts as a trigger. Run once on its own in a neutral directory, the 0.00
query went straight to `Skill(ss:review-loop)` — the installed, Copilot-era copy, whose description
carries *"az przestanie zglaszac uwagi"* almost word for word. After `claude plugin update` that
installed copy is this description, so the query triggers it. Read 90% as a lower bound.

The old set scored 95% (19/20) against the Copilot description; the set changed with the reviewer
(seven positives and three negatives reworded for Codex), so the two numbers are not a comparison.

## The boundary against `review-fix`

The first negative is the one that matters: *"przepuść PR 12 raz przez codexa i popraw co
znajdzie"* — one pass, which is `review-fix`'s positive. Repeat-until-quiet belongs here. Requests
for an opinion alone (*"zrób review tego PR-a i powiedz co jest nie tak"*) trigger topically
whatever the description says, so step 1.3 turns them away after triggering, pointing at
`/codex:review` or `review-fix`.
