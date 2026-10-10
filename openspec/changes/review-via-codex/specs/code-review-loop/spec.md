# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: A missing review run is concluded only from positive evidence

**Reason**: It regulated the Copilot review workflow's runs, read through `gh run list` after a
wait expired. The Codex review is a local call that ends with a result or an error; there is no
remote run to find, and no wait that can expire without an answer.

**Migration**: The principle survives as *A clean review is concluded only from a completed,
recognised review*: a verdict of absence still needs evidence, and a failure is still an `error`,
never a clean result.

### Requirement: An inconclusive check waits, then ends as unknown

**Reason**: The inconclusive state existed because a run listing could hold runs none of which was
identifiable as the current request's. A local review has no listing and no identification step.

**Migration**: None needed. The `timeout` termination reason and its `unknown` outcome disappear
with the wait; a review that cannot be read ends as `error`.

### Requirement: Whether a review is still running is decided over every review run on the sha

**Reason**: Several Copilot runs could carry the same head sha — the push, the re-request, an
abandoned earlier loop. A local review is one process the skill starts and waits for.

**Migration**: None needed. The skill waits for its own review command to exit.
