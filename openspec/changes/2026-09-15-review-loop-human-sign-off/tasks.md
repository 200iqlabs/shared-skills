# Tasks

## 1. Terminal step in the loop

- [x] 1.1 Add step 6.4: open the sign-off issue after the report, for **every** termination
      reason including `error`.
- [x] 1.2 Find an existing record by exact canonical title, never by search terms.
- [x] 1.3 Build the body in a file outside the repository and pass it with `--body-file`, on
      the create path and the append path alike.
- [x] 1.4 Carry the error text in the body when the reason is `error`, rather than pointing at
      log entries that die with the session.
- [x] 1.5 Retry a failed write once, then declare the run ungated in a line the report cannot
      bury.
- [x] 1.6 State the closing sentence verbatim in the body: a person closes it, nothing else may.

## 2. Guardrail

- [x] 2.1 Add the prohibition on closing the sign-off issue beside the existing prohibitions on
      merging, closing and approving.

## 3. Fixer ordering

- [x] 3.1 Apply fixes highest severity first; keep arrival order where comments carry no
      severity at all.

## 4. Evals

- [x] 4.1 `review-loop`: a decoy issue whose title carries the same words and number is not
      mistaken for the gate.
- [x] 4.2 `review-loop`: a failed create is announced as an ungated run, not reported as
      complete.
- [x] 4.3 `review-fix`: severity decides order, and the no-severity fallback keeps arrival
      order.
- [x] 4.4 Update `skills/review-fix/evals/README.md` — it still states six prompts and omits
      the severity case.
- [x] 4.5 Update `skills/review-loop/evals/README.md` for the two added cases.

## 5. Open in review

- [x] 5.1 Paginate the open-issue lookup, or otherwise make the exact-title match complete —
      `--limit 200` can miss an older record and create a duplicate.
- [x] 5.2 Define `SCRATCH` inside `review-loop` — the loop never set it, so every `--body-file`
      path collapsed and no gate could be written.
- [x] 5.3 Replace the malformed `--jq --arg` lookup: `gh` consumes the next token as the whole
      expression, so the match never ran and `head` hid the failure.
- [x] 5.4 Read the listing's own exit status — a failed lookup takes the create path and says
      so, instead of passing for "no record exists".
- [x] 5.5 Split the ungated warning: a failed append names the open issue rather than telling
      the reader nothing was created.
- [ ] 5.6 Re-run the review loop until the reviewer has nothing new.

## Out of scope

- Any workflow that closes, reaps or reports on these issues.
- Changes to either skill's `description`.
- Gating the deployment step (documented as a rejected alternative in `design.md`).
