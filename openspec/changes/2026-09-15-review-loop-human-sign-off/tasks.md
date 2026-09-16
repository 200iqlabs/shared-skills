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
- [ ] 5.6 Re-run the review loop until the reviewer has nothing new. Open by construction: it is
      the loop this change is being reviewed by, and it closes when a round comes back with no new
      findings — not before. The change staying in `openspec/changes/` rather than the archive is
      what marks it in progress.
- [x] 5.7 Keep dynamic text out of the heredoc: the report, the sub-agent error and the log tail
      arrive as files, so a line reading `BODY` cannot close the body early.
- [x] 5.8 Consume `LOOKUP_FAILED` — the warning goes into the report *and* into the record, since
      only one of their readers watched the run.
- [x] 5.9 Resolve the spec's own contradiction: one **open** record is the normal outcome, and a
      duplicate from a race or an incomplete lookup is stated as accepted in the same requirement.
- [x] 5.10 State what happens to a record a person closed — a new one is opened, the closed one is
      never reopened or reused — in the spec, in the skill and in an eval.
- [x] 5.11 Produce `report.md` and `error.txt` where 6.4 expects them: 6.2 and 6.3 wrote to the
      session only, so every `cat` in the body assembly had nothing to read.
- [x] 5.12 Carry `SCRATCH`, `TITLE`, `EXISTING` and `LOOKUP_FAILED` across tool calls — shell
      state dies between them, and the write block was reading four empty variables.
- [x] 5.13 Mark the lookup failed when the *parser* fails, not only the fetch: a `node` that
      cannot run yields the same empty `EXISTING` as "no record matched".
- [x] 5.14 Put the write behind one callable and invoke it at most twice — the retry the prose
      promised existed nowhere in the block a reader copies.
- [x] 5.15 Re-read the record's state immediately before appending: `gh issue comment` succeeds
      on a closed issue, which would file a run under a sign-off already given.
- [x] 5.16 Qualify the terminal guarantee by a successful write, so it stops contradicting the
      requirement that lets both attempts fail and declares the run ungated.
- [x] 5.17 Restore `SCRATCH` **and `REPO_ROOT`** at the top of the 6.3 error block — both died
      with the earlier tool call, so the log tail went to `/log-tail.txt` and the record lost the
      iteration history the spec requires of it.
- [x] 5.18 Carry `GATE_WRITTEN`, and the `EXISTING` the state re-check may have cleared, into
      `gate.env`: the write block ends with a successful assignment either way, so its status
      says nothing and the reporting step could call an ungated run complete.
- [x] 5.19 Test `report.md` before assembling the body — the fixed closing heredoc always
      succeeds, so a missing report yielded a footer-only record published as though it carried
      the run. It is opened anyway, saying so in the body and through `BODY_INCOMPLETE`.
- [x] 5.20 Make the lookup-failed line conditional on a successful write, so the report stops
      saying that nothing was created and that one was opened anyway in consecutive paragraphs.
- [x] 5.21 Point the `error` follow-up line *below* itself: the error text and log tail are
      concatenated after the report, and an issue has no "above" — that was the session.
- [x] 5.22 Encode the severity scale in `review-fix` rather than gesturing at it: where the
      precedence comes from, a stable sort, an unrecognised tag treated as untagged, and untagged
      comments last in a mixed batch.
- [x] 5.23 State the closed-record rule as best-effort in the spec — the re-check narrows the
      non-atomic window between `view` and `comment`; it does not close it.
- [x] 5.24 Align `proposal.md` with the spec on duplicates: "one issue per pull request" read as
      an invariant the change had already, deliberately, declined to guarantee.

## Still open at the end of the review rounds

- **5.6 above**, by construction: the loop closes when a round returns nothing new.
- **No eval covers the warning matrix** (`GATE_WRITTEN` × `EXISTING` × `LOOKUP_FAILED`) or the
  unreadable-report path added in 5.19/5.20. The spec has scenarios for both; the behavioural
  suites do not, and writing them was not attempted in the round that added the requirements.
  Worth one eval each before this change is archived.

## Out of scope

- Any workflow that closes, reaps or reports on these issues.
- Changes to either skill's `description`.
- Gating the deployment step (documented as a rejected alternative in `design.md`).
