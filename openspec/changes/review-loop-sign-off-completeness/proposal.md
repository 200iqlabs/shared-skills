# Review loop: the sign-off record says which part of its body is missing

## Why

On an `error` ending, step 6.3 of `review-loop` writes the error text into `error.txt` and then
appends the tail of the run log to the same file. If the log is missing, the "tail" is the line
saying the run log could not be read. Step 6.4 decides whether the error text arrived by testing
`[ -s error.txt ]`. That test is true whenever the log tail was appended, whether or not the error
text itself ever reached the file. So the warning "The error text could not be read" never fires:
the record goes out without the error text and without saying so. Kept eval case 15 found this
while `review-via-codex` was re-running the sign-off cases. Two of three runs read the text
correctly and declined to print a warning the skill can never produce. The same text is on
`master`, so the defect predates that change.

Codex flagged a neighbouring defect in the same step (trial 1.4 of `review-via-codex`, pull
request 10): one `BODY_INCOMPLETE` flag covers both a missing report and a missing error text. The
session warning it selects always says the run report is missing, so a run whose report arrived
but whose error text did not tells the person watching the wrong thing.

## What Changes

- **The error text gets its own file.** On an `error` ending, `error.txt` holds the error text
  and nothing else. The log tail stays in `log-tail.txt`, where 6.3 already writes it, or that
  file holds the line saying the log could not be read. 6.4 concatenates the two one under the
  other. Its test of `error.txt` now answers only whether the error text arrived. Neither the log
  tail nor the line about a missing log can stand in for the error text.
- **6.4 guards the log tail too.** If `log-tail.txt` is missing or empty when the body is
  assembled, the body says the tail did not reach the record, in the place it would have taken.
  It no longer leaves a silent gap.
- **Two flags instead of one.** `REPORT_MISSING` and `ERROR_MISSING` replace `BODY_INCOMPLETE`
  and travel through `gate.env` the same way. The report printed into the session gets one warning
  for each: the existing line about the run report, and a new line about the error text that tells
  the person watching to copy the error into the record before the session ends.
- **The run-log warning stops claiming the error text is there.** The line 6.3 writes for an
  unreadable log said the record "carries the error text without the iteration history". When the
  error text is missing too, that line contradicts the warning above it. It now says only that
  the record carries no iteration history for this run.
- Two new behavioural eval cases: the error text missing while the log is present, and a missing
  report that must not be reported as a missing error text. Kept cases 14 and 15 are re-run on
  this branch.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `code-review-loop`: the requirement *A run that could not create its record is declared
  ungated* now decides whether the error text arrived from the error text alone, and decides,
  carries and reports the report's absence and the error text's absence separately. It gains
  scenarios for an aborted run missing both its error text and its run log, and for a body
  missing only one of its two parts.

## Non-goals

- The lookup, the write, the retry, the state re-check before an append, and the three-way choice
  between the create, append and written lines in 6.4 stay as they are.
- The wording of the follow-up lines in 6.3 is unchanged, including the `error` line that points
  below itself.
- The session is not given a new warning for a missing log tail. 6.3's `log tail: FAILED` echo
  already tells the person watching, and the record carries the line.
- Kept cases 4–15 are not migrated to `evals/cases/`. That is `behavioural-skill-evals` group 5.
- The skill's `description` and its triggering are out of scope.

## Impact

- `skills/review-loop/SKILL.md`: step 6.3 (`error.txt` holds the error text alone, the run-log
  line is reworded) and step 6.4 (body assembly, the two flags, the session warnings and the text
  explaining them).
- `evals/cases/review-loop/`: two new decision cases. `skills/review-loop/evals/README.md` gets
  their rows, the re-run of 14 and 15, and the defect note marked fixed.
- `CHANGELOG.md`: one entry under Fixed.
- Built on `change/review-via-codex` (pull request 22). This change merges after it.
