## ADDED Requirements

### Requirement: The loop terminates into a record only a person can close

When the review loop terminates, it SHALL leave the pull request carrying an open issue whose
closing constitutes the human sign-off: it SHALL append its report to the open sign-off record
it finds, and SHALL create one where it finds none. One open record per pull request is the
normal outcome, not an invariant the loop can guarantee — where two runs finish concurrently,
or where the lookup cannot complete, a duplicate SHALL be accepted, because the requirement
below resolves that race in favour of creating. The record SHALL be created for every
termination reason, including `error` — an aborted run needs a person more than a clean one,
not less. The loop, any later run of it, and any workflow SHALL NOT close that issue, and SHALL
NOT reopen one a person has closed.

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
