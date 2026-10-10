## MODIFIED Requirements

### Requirement: A run that could not create its record is declared ungated

The loop SHALL check the outcome of creating or updating the record, retry once on failure,
and on a second failure SHALL state that the run is ungated and that a record must be opened by
hand before merging. It SHALL NOT report the run as complete as though the record existed.

Each warning the loop prints SHALL be conditional on the outcome it describes: where the write
failed, the loop SHALL NOT print a line asserting a record was opened, and where it succeeded,
SHALL NOT print one asserting none was. The outcome of the write SHALL be carried to whatever
step prints the warning, and SHALL NOT be left in state that step cannot read.

The same holds for what the body carries. Whether the run report reached the body and whether
the error text reached it SHALL be decided, carried and reported separately. The loop SHALL NOT
warn that the report is missing because the error text is, nor the other way round. Other text in
the body SHALL NOT count as either of them having arrived.

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
- **AND** the report printed into the session SHALL say that the record does not carry the run
  report

#### Scenario: An `error` termination whose error text never reached the body

- **WHEN** the termination reason is `error` and the error text itself is missing, empty or
  unreadable at body-assembly time
- **THEN** the record SHALL say in its own body that it does not carry the error text the
  follow-up line promises below itself, and the report printed into the session SHALL say the
  same
- **AND** whether the error text arrived SHALL be decided from the error text alone: neither the
  tail of the run log nor a line saying the log could not be read SHALL count as the error text
  having arrived
- **AND** on any other termination reason an absent error text SHALL pass without a warning. The
  obligation follows from the reason, not from whether a file happens to exist

#### Scenario: An aborted run is missing both its error text and its run log

- **WHEN** the termination reason is `error`, the error text never reached the body, and the run
  log is missing
- **THEN** the record SHALL state both absences: that it does not carry the error text, and, in
  the place the iteration history would have taken, that the run log could not be read
- **AND** neither statement SHALL stand in for the other, and neither SHALL claim that the other
  part arrived

#### Scenario: Only one part of the body is missing

- **WHEN** the report reached the body and the error text did not, or the error text reached it
  and the report did not
- **THEN** the warning printed into the session SHALL name the part that is missing
- **AND** SHALL NOT describe the part that arrived as missing

#### Scenario: The run log cannot be read

- **WHEN**, on an `error` termination, the run log is missing or unreadable, or its tail never
  reached the body
- **THEN** the record SHALL carry a line stating that the iteration history could not be
  captured, in the place that history would have taken
- **AND** the loop SHALL NOT publish a record that is silently missing it. An empty file left
  behind by a failed read is not an empty log
