## ADDED Requirements

### Requirement: The loop terminates into a record only a person can close

When the review loop terminates, it SHALL create or update exactly one issue per pull request
whose closing constitutes the human sign-off for that pull request. The record SHALL be created
for every termination reason, including `error` — an aborted run needs a person more than a
clean one, not less. The loop, any later run of it, and any workflow SHALL NOT close that
issue.

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

### Requirement: An existing record is identified by its exact title

The loop SHALL locate an existing sign-off record by comparing the whole canonical title, and
SHALL NOT rely on a term-based issue search. Where the lookup cannot be made exhaustive, the
loop SHALL create rather than skip: a duplicate record is acceptable, a missing one is not.

#### Scenario: An unrelated issue shares the words and the number

- **WHEN** an open issue titled `Flaky test on PR #12 breaks review-loop` exists and the loop
  terminates on pull request 12
- **THEN** the loop SHALL NOT treat that issue as the sign-off record
- **AND** SHALL create a new one under the canonical title

### Requirement: The record's body is built in a file, never as a shell argument

The loop SHALL write the record body to a file outside the repository and pass it by file
reference. It SHALL NOT interpolate the report into a shell argument.

#### Scenario: The report contains backticks

- **WHEN** the report or a sub-agent error message contains backticks
- **THEN** the text SHALL reach the record unchanged and SHALL NOT be executed

### Requirement: A run that could not create its record is declared ungated

The loop SHALL check the outcome of creating or updating the record, retry once on failure,
and on a second failure SHALL state that the run is ungated and that a record must be opened by
hand before merging. It SHALL NOT report the run as complete as though the record existed.

#### Scenario: Issues are disabled on the repository

- **WHEN** creating the record fails twice
- **THEN** the loop SHALL print an explicit ungated warning alongside the report

### Requirement: Fixes are applied in the reviewer's order of severity

Where review comments carry severity tags, the fixer SHALL apply fixes from highest severity
downwards, so that an interrupted run leaves the least serious work undone. Where comments
carry no severity, the fixer SHALL preserve the order in which they arrived and SHALL NOT
invent a ranking.

#### Scenario: Severity and arrival order disagree

- **WHEN** three lowest-rank comments arrive before one highest-rank comment
- **THEN** the highest-rank comment SHALL be fixed first

#### Scenario: No severity tags are present

- **WHEN** no comment carries a severity tag
- **THEN** the fixer SHALL work in arrival order
