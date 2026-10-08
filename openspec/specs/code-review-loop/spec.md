# code-review-loop Specification

## Purpose

How the automated review loop ends: when a wait for the reviewer may conclude that no review is coming — only from positive evidence, so that a check it cannot read ends as "check manually" rather than as a false absence — and the durable record it leaves on the pull request that only a person can close, so a review the machine ran and fixed is never mistaken for a change a human has judged fit to land.

## Requirements

### Requirement: The loop terminates into a record only a person can close

When the review loop terminates, it SHALL attempt to leave the pull request carrying an open
issue whose closing constitutes the human sign-off: it SHALL append its report to the open
sign-off record it finds, and SHALL create one where it finds none. Where the write succeeds,
such a record SHALL exist; where it fails on both attempts, the requirement *A run that could
not create its record is declared ungated* governs instead, and the loop SHALL announce the
absence rather than assert this guarantee. **The obligation is to write the record or to say it
could not** — a record the platform refused is not an outcome the loop can produce, and a spec
demanding it would be unimplementable rather than strict.

One open record per pull request is the normal outcome, not an invariant the loop can
guarantee — where two runs finish concurrently, or where the lookup cannot complete, a
duplicate SHALL be accepted, because the requirement below resolves that race in favour of
creating. The attempt SHALL be made for every termination reason, including `error` — an
aborted run needs a person more than a clean one, not less. The loop, any later run of it, and
any workflow SHALL NOT close that issue, and SHALL NOT reopen one a person has closed.

The record SHALL state, verbatim, that a person closes it after reading the pull request and
that nothing else may. The record SHALL NOT claim to block the merge, and the loop SHALL NOT
request changes, approve, or merge in order to make it blocking.

#### Scenario: A clean run still leaves a record

- **WHEN** the loop terminates because the reviewer produced no new comments
- **THEN** a sign-off issue SHALL exist for that pull request, carrying the report and the
  closing sentence

#### Scenario: An aborted run leaves a record carrying its own error

- **WHEN** the loop terminates with reason `error`
- **THEN** the record SHALL contain the error text and the last log lines themselves
- **AND** SHALL NOT refer the reader to log entries that exist only in the ended session

#### Scenario: No automation closes the record

- **WHEN** a later run of the loop finds an open sign-off issue for the same pull request
- **THEN** it SHALL append its report to that issue
- **AND** SHALL NOT close it, and SHALL NOT open a second one

#### Scenario: The previous record was signed off and closed

- **WHEN** the loop terminates on a pull request whose earlier sign-off record a person has
  closed
- **THEN** it SHALL open a new record for this run
- **AND** SHALL NOT reopen the closed one and SHALL NOT append to it — the closed record is the
  sign-off given for the branch that person read, and work finished after it has not been
  signed off

#### Scenario: The record is closed while the loop is writing

- **WHEN** the loop has found an open record and is about to append to it
- **THEN** it SHALL re-read that record's state immediately before appending, and SHALL treat
  anything other than a confirmed open state — including an unreachable or ambiguous answer —
  as no record, taking the create path
- **AND** it SHALL do so before **every** attempt, the retry included: a state read taken before
  a failed attempt says nothing about the seconds that pass before the next one, which is time
  enough for the close it exists to detect
- **AND** the obligation SHALL be read as best-effort: the two calls are not atomic, so a close
  landing between them still appends, and the loop SHALL document that residual window rather
  than claim to have closed it. Narrowing it to those two calls is the most a non-atomic pair
  can offer, and it fails toward a duplicate rather than toward a report filed under a
  signature already given

### Requirement: An existing record is identified by its exact title

The loop SHALL locate an existing sign-off record by comparing the whole canonical title
against the **open** issues of the repository, and SHALL NOT rely on a term-based issue search.
Where the lookup cannot be made exhaustive, or cannot complete at all, the loop SHALL create
rather than skip: a duplicate record is acceptable, a missing one is not.

#### Scenario: An unrelated issue shares the words and the number

- **WHEN** an open issue titled `Flaky test on PR #12 breaks review-loop` exists and the loop
  terminates on pull request 12
- **THEN** the loop SHALL NOT treat that issue as the sign-off record
- **AND** SHALL create a new one under the canonical title

#### Scenario: The lookup itself fails

- **WHEN** listing the repository's open issues returns an error
- **THEN** the loop SHALL take the create path rather than read the failure as "no record
  exists"
- **AND** the report and the record SHALL both state that the lookup did not complete and that
  a duplicate may exist

### Requirement: The record's body is built in a file, never as a shell argument

The loop SHALL write the record body to a file outside the repository and pass it by file
reference. It SHALL NOT interpolate the report into a shell argument, and SHALL NOT carry text
it did not author — the report, a sub-agent error, a log tail — through a shell heredoc. Such
text SHALL reach the body as a file whose contents are concatenated.

#### Scenario: The report contains backticks

- **WHEN** the report or a sub-agent error message contains backticks
- **THEN** the text SHALL reach the record unchanged and SHALL NOT be executed

#### Scenario: The error text contains the heredoc delimiter

- **WHEN** a line of the report or of the sub-agent's error reads exactly as the delimiter of
  the heredoc that carries the fixed closing sentence
- **THEN** the body SHALL still contain that line and everything after it
- **AND** no part of the text SHALL be handed to the shell as a command

### Requirement: A run that could not create its record is declared ungated

The loop SHALL check the outcome of creating or updating the record, retry once on failure,
and on a second failure SHALL state that the run is ungated and that a record must be opened by
hand before merging. It SHALL NOT report the run as complete as though the record existed.

Each warning the loop prints SHALL be conditional on the outcome it describes: where the write
failed, the loop SHALL NOT print a line asserting a record was opened, and where it succeeded,
SHALL NOT print one asserting none was. The outcome of the write SHALL be carried to whatever
step prints the warning, and SHALL NOT be left in state that step cannot read.

#### Scenario: Issues are disabled on the repository

- **WHEN** creating the record fails twice
- **THEN** the loop SHALL print an explicit ungated warning alongside the report

#### Scenario: The lookup failed and so did the create

- **WHEN** the lookup did not complete and both write attempts then failed
- **THEN** the report SHALL state that nothing was created and that a record may already exist
  unseen
- **AND** SHALL NOT also state that a record was opened anyway

#### Scenario: The report file cannot be read while the body is assembled

- **WHEN** the report file is missing or unreadable at body-assembly time
- **THEN** the record SHALL still be opened, and SHALL say in its own body that it does not
  carry the report
- **AND** the loop SHALL NOT publish a record consisting only of its fixed closing sentence as
  though it carried the run

#### Scenario: An `error` termination whose error text never reached the body

- **WHEN** the termination reason is `error` and the error file is missing or empty at
  body-assembly time
- **THEN** the record SHALL say in its own body that it does not carry the error text the
  follow-up line promises below itself, and the loop SHALL treat the body as incomplete
- **AND** on any other termination reason an absent error file SHALL pass without a warning —
  the obligation follows from the reason, not from whether a file happens to exist

#### Scenario: The run log cannot be read

- **WHEN** the run log is missing or unreadable while the error file is being assembled
- **THEN** the record SHALL carry a line stating that the iteration history could not be
  captured, in the place that history would have occupied
- **AND** the loop SHALL NOT publish a record that is silently missing it — an empty file left
  behind by a failed read is not an empty log

### Requirement: Fixes are applied in the reviewer's order of severity

Where review comments carry severity tags, the fixer SHALL apply fixes from highest severity
downwards, so that an interrupted run leaves the least serious work undone. Where comments
carry no severity, the fixer SHALL preserve the order in which they arrived and SHALL NOT
invent a ranking.

The scale SHALL be the one the repository's review policy defines, and `blocker` > `should` >
`nit` where it defines none. The sort SHALL be stable: comments of equal severity keep their
arrival order. A tag the scale does not define SHALL be treated as untagged rather than mapped
into the scale, and in a batch where only some comments carry severity, the untagged ones SHALL
follow every tagged one, among themselves in arrival order.

#### Scenario: Severity and arrival order disagree

- **WHEN** three lowest-rank comments arrive before one highest-rank comment
- **THEN** the highest-rank comment SHALL be fixed first

#### Scenario: No severity tags are present

- **WHEN** no comment carries a severity tag
- **THEN** the fixer SHALL work in arrival order

#### Scenario: Only some comments carry a severity tag

- **WHEN** a batch mixes tagged and untagged comments, and one tag is a word the scale does not
  define
- **THEN** the tagged comments SHALL be fixed first, in rank order
- **AND** the untagged ones and the one carrying the unrecognised tag SHALL follow, in the
  order they arrived

### Requirement: A missing review run is concluded only from positive evidence

When the wait for a review expires and the loop checks the review workflow, it SHALL conclude
that no review run exists for the current review request only when the scoped run listing
succeeded — the command exited 0 and its output parsed as a JSON array — and holds no run at all,
before any test of run name, head sha or creation time. The loop SHALL NOT conclude it from an
empty result of those tests, from a listing that may be truncated, from a failed command, or from a
workflow that does not resolve. The loop SHALL start every check from the outcome `unknown` and
SHALL overwrite it only on positive evidence. The loop SHALL NOT add or tighten an identification
condition in order to reach a certain verdict.

#### Scenario: Runs exist on the branch, none for the pushed sha

- **WHEN** the listing holds review runs from earlier iterations and none of them matches the sha
  of the latest push
- **THEN** the loop SHALL NOT report `no-run`
- **AND** SHALL treat the check as inconclusive with reason `no-match`

#### Scenario: The listing is empty

- **WHEN** the scoped listing exits 0 and returns an empty array
- **THEN** the loop SHALL terminate with timeout outcome `no-run` without spending extensions

#### Scenario: The listing may be truncated

- **WHEN** the listing returns as many runs as its limit asked for and none of them is identified
  as the current request's
- **THEN** the loop SHALL treat the check as inconclusive with reason `listing-truncated`

#### Scenario: The workflow does not resolve

- **WHEN** the listing fails because no workflow of the expected name exists
- **THEN** the loop SHALL treat the check as inconclusive with reason `workflow-not-found`
- **AND** SHALL NOT report `no-run` and SHALL NOT terminate with `error`

#### Scenario: The listing command fails

- **WHEN** the listing exits non-zero with empty output, for a reason other than an unresolved
  workflow, and the one retry fails the same way
- **THEN** the loop SHALL terminate with reason `error`
- **AND** SHALL NOT read the empty output as an empty listing

### Requirement: An inconclusive check waits, then ends as unknown

While extensions remain, an inconclusive check SHALL extend the deadline and resume polling,
drawing on the same per-wait extension budget as an unfinished run. When the budget is spent and
the check is still inconclusive, the loop SHALL terminate with reason `timeout` and timeout outcome
`unknown`. The report SHALL tell the reader to check manually, SHALL name the inconclusive reason
with a reason-specific next step, and SHALL NOT state that no review run exists or that the
reviewer is not enabled.

#### Scenario: The cap is reached while no run is identifiable

- **WHEN** the extensions of the current wait are spent and the last check was inconclusive
- **THEN** the loop SHALL terminate with timeout outcome `unknown` and its reason
- **AND** the report SHALL say to check manually and SHALL NOT say that no review run was created

#### Scenario: An inconclusive check is followed by an unfinished run

- **WHEN** one check is inconclusive and the next one finds an unfinished run for the request
- **THEN** both extensions SHALL count against one budget, and at the cap the outcome SHALL be the
  one the last check established

### Requirement: Whether a review is still running is decided over every review run on the sha

The loop SHALL keep waiting, within the extension budget, while any review run against the sha
the wait is about is unfinished — regardless of which run is newest, and including a run created
before the creation-time bound that identifies the current request's own runs. It SHALL make a
terminal diagnosis — a failed run, or a run that completed without a review — only when every
review run on that sha has completed and at least one run is identified as the current request's,
and SHALL read that diagnosis from the newest identified run. A condition over a set of runs SHALL
NOT be satisfied by an empty set.

#### Scenario: An older matching run is still in progress

- **WHEN** the newest identified run completed successfully minutes ago without a review and an
  older identified run is still in progress
- **THEN** the loop SHALL NOT report that the run completed without a review
- **AND** SHALL extend the wait while extensions remain

#### Scenario: The run the push started predates the creation-time bound

- **WHEN** the run the current request started completed successfully without a review, and a run
  on the same sha started by the push, created before the bound, is still in progress
- **THEN** the loop SHALL extend the wait while extensions remain
- **AND** SHALL NOT report that the run completed without a review

#### Scenario: Every run on the sha has completed

- **WHEN** every review run on the sha the wait is about — identified as the current request's
  or not — completed at least the grace period ago, and the newest identified run has a
  conclusion other than success
- **THEN** the loop SHALL report a failed run, naming the newest run and its conclusion
