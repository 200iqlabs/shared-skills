# code-review-loop Specification

## Purpose

How the review skills turn a local Codex review of a branch into fixes and a durable trail. A clean result is concluded only from a review that completed and was read — a failed, exhausted or unreadable one is an error, never "nothing found". Every finding of every round is recorded in the change with its outcome, so a rejected finding is not judged again and the pull request carries the whole record. Fixes follow the reviewer's order of severity, only important findings extend the loop, and an existing test is not rewritten without a recorded reason. The loop ends in a record on the pull request that only a person can close, so a review the machine ran and fixed is never mistaken for a change a human has judged fit to land.

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

### Requirement: Fixes are applied in the reviewer's order of severity

Where findings carry severity tags, the fixer SHALL apply fixes from highest severity downwards,
so that an interrupted run leaves the least serious work undone. Where findings carry no severity,
the fixer SHALL preserve the order in which they arrived and SHALL NOT invent a ranking.

The scale SHALL be the one the repository's review policy defines, and `P0` > `P1` > `P2` > `P3`
— the scale the reviewer assigns — where it defines none. The sort SHALL be stable: findings of
equal severity keep their arrival order. A tag the scale does not define SHALL be treated as
untagged rather than mapped into the scale, and in a batch where only some findings carry
severity, the untagged ones SHALL follow every tagged one, among themselves in arrival order.

#### Scenario: Severity and arrival order disagree

- **WHEN** three lowest-rank findings arrive before one highest-rank finding
- **THEN** the highest-rank finding SHALL be fixed first

#### Scenario: No severity tags are present

- **WHEN** no finding carries a severity tag
- **THEN** the fixer SHALL work in arrival order

#### Scenario: Only some comments carry a severity tag

- **WHEN** a batch mixes tagged and untagged findings, and one tag is a word the scale does not
  define
- **THEN** the tagged findings SHALL be fixed first, in rank order
- **AND** the untagged ones and the one carrying the unrecognised tag SHALL follow, in the
  order they arrived

### Requirement: Findings come from a local Codex review of the branch

`review-fix` and `review-loop` SHALL obtain findings by running a Codex review of the branch
against its base — the pull request's base branch when the branch has a pull request — through the
installed Codex plugin. They SHALL NOT read pull-request review comments as findings and SHALL NOT
reply to them.

Before the first review, each skill SHALL confirm that the Codex plugin is installed and that Codex
is ready and signed in. Where either is not the case, it SHALL stop before reviewing, editing or
committing anything, and SHALL name `/codex:setup` as the next step.

Where the reviewed repository's agent instructions do not point the reviewer at its review policy
and at the change's review record, the skill SHALL warn once before the first review and continue.
The absence of that pointer SHALL NOT stop the run.

#### Scenario: The plugin is not installed

- **WHEN** a skill is invoked and the Codex plugin is not installed
- **THEN** it SHALL stop before the first review and name `/codex:setup`
- **AND** SHALL NOT edit, commit or push anything

#### Scenario: Codex is installed but not signed in

- **WHEN** the plugin is installed and Codex reports that it is not authenticated
- **THEN** the skill SHALL stop the same way, naming `/codex:setup`

#### Scenario: Copilot comments sit on the pull request

- **WHEN** the pull request carries review comments from Copilot or from a person
- **THEN** the skill SHALL NOT treat them as findings
- **AND** SHALL NOT post replies to them

#### Scenario: The reviewed repository has no pointer for the reviewer

- **WHEN** the reviewed repository has no agent instructions pointing at its review policy and the
  review record
- **THEN** the skill SHALL print one warning naming the missing pointer and the template to use
- **AND** SHALL run the review anyway

### Requirement: A clean review is concluded only from a completed, recognised review

A skill SHALL conclude that the reviewer has no findings only when the review command exited
successfully, the review reported success, and its output was recognised as a review carrying no
findings. A non-zero exit, a review that reports failure, an exhausted usage limit, or output that
announces findings the skill cannot parse SHALL end the run with reason `error`, carrying the
reviewer's own error text, and SHALL NOT be reported as a clean review.

#### Scenario: The usage limit is exhausted mid-run

- **WHEN** the review in round 3 fails because the Codex usage limit is exhausted
- **THEN** the loop SHALL terminate with reason `error` and carry the reviewer's message into the
  report and the sign-off record
- **AND** SHALL NOT report that the reviewer had nothing left to say

#### Scenario: The output format moved

- **WHEN** the review exits 0 and its output contains a findings section whose entries the skill
  cannot parse
- **THEN** the skill SHALL end with reason `error`, quoting the unrecognised output
- **AND** SHALL NOT treat the round as having zero findings

#### Scenario: A genuinely clean review

- **WHEN** the review exits 0, reports success, and its output is recognised as carrying no
  findings
- **THEN** the loop SHALL terminate as clean

### Requirement: Every finding of every round is recorded in the change

When a skill runs for an OpenSpec change, it SHALL record every finding of every round in that
change's review record: the round, the finding's severity, location and title, and its outcome —
fixed, with the commit that fixed it; rejected, with a one-sentence reason; or repeated, naming the
round that rejected it — together with the checks the round ran and their result. The record SHALL
be committed with the round, including a round that changed no code, so that it reaches the pull
request.

Before judging a round's findings, the fixer SHALL read the record. A finding the record already
rejected SHALL be marked repeated, and SHALL NOT be fixed or judged again within that change. A
person reopens a rejected finding by removing its entry from the record; the skills SHALL NOT
remove or rewrite earlier entries.

Where a skill runs without an OpenSpec change, it SHALL state in its summary that no review record
was written.

#### Scenario: A rejected finding comes back in the next round

- **WHEN** round 1 rejected a finding with a reason and round 2's review raises the same finding
- **THEN** round 2 SHALL mark it repeated, naming round 1
- **AND** SHALL NOT change code for it

#### Scenario: A later run meets an earlier rejection

- **WHEN** a run on the next day reviews the same change and Codex raises a finding the record
  rejected in an earlier run
- **THEN** the fixer SHALL mark it repeated and SHALL NOT judge it again

#### Scenario: A round that fixed nothing still reaches the pull request

- **WHEN** every finding of a round is rejected or repeated
- **THEN** the round's entries SHALL be committed and pushed
- **AND** the loop SHALL then terminate without another review

#### Scenario: A single pass outside any change

- **WHEN** `review-fix` runs on a branch with no OpenSpec change given
- **THEN** its summary SHALL state that no review record was written

### Requirement: Only important findings extend the loop

The loop SHALL run another review only after a round that fixed at least one important finding.
The line between important findings and minor ones SHALL be the one the repository's review policy
defines, and `P0`–`P2` important, `P3` minor, where it defines none. Every minor finding SHALL be
either fixed in the same round or recorded, and minor findings SHALL NOT by themselves cause
another review.

#### Scenario: Only minor findings remain

- **WHEN** a review carries only `P3` findings and the policy defines no line of its own
- **THEN** the round SHALL fix or record them and the loop SHALL terminate after committing
- **AND** SHALL NOT run another review

#### Scenario: An important finding was fixed

- **WHEN** a round fixes a `P1` finding
- **THEN** the loop SHALL run another review, unless the iteration cap is reached

#### Scenario: Every important finding was rejected

- **WHEN** a round's important findings are all rejected or repeated
- **THEN** the loop SHALL terminate without another review

#### Scenario: The policy moves the line

- **WHEN** the repository's review policy declares `P0`–`P1` important
- **THEN** a round whose only fixes are `P2` findings SHALL NOT cause another review

### Requirement: A fix does not rewrite an existing test without a recorded reason

Before committing a round, the fixer SHALL check whether the round changed a test that existed
before the round. Such a change SHALL be committed only when the review record names the finding
that required it and states why. Otherwise the round SHALL end with reason `error` before anything
is committed, naming the test files. Adding new tests SHALL NOT be restricted.

#### Scenario: A check fails and the fixer edits an assertion

- **WHEN** a fix makes an existing test fail and the fixer changes that test's assertion without
  recording a reason
- **THEN** the round SHALL end with reason `error`, naming the test file
- **AND** nothing from that round SHALL be committed

#### Scenario: The finding is about the test itself

- **WHEN** a finding states that an existing test asserts the wrong behaviour, and the record
  names that finding as the reason for changing the test
- **THEN** the change to the test SHALL be committed with the round

#### Scenario: A new test is added

- **WHEN** a fix adds a test file that did not exist before the round
- **THEN** the round SHALL commit it without requiring a recorded reason

### Requirement: The report proposes conventions, it does not write them

The final report SHALL list the fixed findings that read as conventions of the repository rather
than one-off defects, as candidate rules for the repository's agent instructions. The skills SHALL
NOT edit those instructions themselves.

#### Scenario: A finding names a convention

- **WHEN** a round fixes a finding that amounts to a rule of the repository, such as how amounts of
  money are represented
- **THEN** the final report SHALL list it as a candidate rule
- **AND** the run SHALL leave the repository's agent instructions unchanged

### Requirement: The fixer verifies a round with the reviewed repository's own checks

After a round's fixes are in, the fixer SHALL run the checks of the repository under review: those
the `Checks` section of its `REVIEW.md` lists, with the conditions it attaches, when that section
exists; otherwise those the project itself declares — scripts and targets in its manifests and
build files, the check commands its documentation or its CI workflow names, a self-test script it
ships. The fixer SHALL NOT run a command because a skill's text or example shows it, and SHALL NOT
carry a check over from another repository. When it finds no check, the record and the summary
SHALL say so, rather than letting silence imply that a check passed.

#### Scenario: The review policy lists the checks

- **WHEN** `REVIEW.md` has a `Checks` section listing `npm test` and, when `tools/` changed,
  `python -m pytest tests/`
- **THEN** the fixer SHALL run `npm test`, and `python -m pytest tests/` only when the round
  changed `tools/`

#### Scenario: No Checks section, and the project declares its own

- **WHEN** `REVIEW.md` has no `Checks` section, `pyproject.toml` configures pytest and the CI
  workflow runs `ruff check .` and `pytest`
- **THEN** the fixer SHALL run `pytest` and `ruff check .`
- **AND** SHALL NOT run a command of the plugin's own repository, such as
  `node hooks/selftest.mjs` or `claude plugin validate .`, nor an `npm` script the repository does
  not have

#### Scenario: The project declares no check

- **WHEN** the repository has no `Checks` section and declares no check anywhere
- **THEN** the fixer SHALL run no check, and the record and the summary SHALL say that the project
  has none
