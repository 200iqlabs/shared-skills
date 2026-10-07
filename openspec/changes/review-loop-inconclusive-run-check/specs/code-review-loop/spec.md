## ADDED Requirements

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

### Requirement: Whether a review is still running is decided over every matching run

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

#### Scenario: All identified runs have completed

- **WHEN** every identified run completed more than the grace period ago and the newest has a
  conclusion other than success
- **THEN** the loop SHALL report a failed run, naming the newest run and its conclusion
