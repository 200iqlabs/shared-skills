## ADDED Requirements

### Requirement: Every turn-ending reply carries the reply skeleton

Every reply that hands control back to the user SHALL open with the sections `KONTEKST`, `WYNIK` and `CO DALEJ`, in that order, each under its constant bold label; an optional `OTWARTE TEMATY` section MAY follow them. The shape SHALL be identical in every such reply — same labels, same order — regardless of how small the reply is, and the agent SHALL NOT judge whether the skeleton is warranted. Status notes emitted mid-turn, between tool calls, are not turn-ending replies and SHALL NOT carry the skeleton.

#### Scenario: A trivial answer still carries the skeleton

- **WHEN** the user asks a small question and the answer is one sentence
- **THEN** the reply SHALL still carry all three mandatory sections, however short their content

#### Scenario: A mid-turn status note is exempt

- **WHEN** the agent emits a brief progress note between tool calls without handing control back
- **THEN** the note SHALL NOT carry the skeleton

#### Scenario: Two replies in one session are comparable by eye

- **WHEN** two turn-ending replies from the same session are compared
- **THEN** both SHALL use identical labels in identical order, differing only in content

### Requirement: KONTEKST states the session's task in business terms

The `KONTEKST` section SHALL state, in one or two sentences, what this session is working on and what it is for, in practical business terms and without technical vocabulary. It SHALL describe the session's task, not the most recent step, and SHALL remain stable across replies, changing only when the session's task itself changes. It SHALL be readable in isolation: a user returning to the session after working elsewhere SHALL understand from this section alone what the session is doing and why.

#### Scenario: User returns to a parallel session after hours

- **WHEN** the user returns to a session that kept working and reads only the last reply's KONTEKST
- **THEN** they SHALL learn what the session is working on and why, without scrolling back

#### Scenario: The session's task changes

- **WHEN** the session moves to a genuinely different task
- **THEN** KONTEKST SHALL change to describe the new task, and SHALL otherwise stay the same from reply to reply

### Requirement: WYNIK reports verified outcomes only

The `WYNIK` section SHALL state what the completed step produced, limited to facts the agent has confirmed. Failures SHALL be reported as plainly as successes. Work attempted but not verified SHALL be reported as unverified, not as done. The section SHALL be written without technical vocabulary.

#### Scenario: A step failed

- **WHEN** the step's outcome is a failure
- **THEN** WYNIK SHALL say so directly, in the same plain register as a success

#### Scenario: A step ran but was not checked

- **WHEN** an action ran but its result was never confirmed
- **THEN** WYNIK SHALL report it as unverified rather than as complete

### Requirement: CO DALEJ closes with exactly one of four endings

The `CO DALEJ` section SHALL end the reply with exactly one of the following, and nothing else:

1. A decision is needed from the user — the section SHALL say so, and the agent SHALL invoke the decision-sweep flow automatically in the same turn, raising decisions one at a time with a recommendation first. The decisions SHALL NOT be written out as prose questions instead.
2. An action is needed from the user — the section SHALL hand over exactly one task under the task-delegation protocol, never a list.
3. The agent is waiting on an external process — the section SHALL name what is awaited and state that nothing is needed from the user.
4. The session's task is finished — the section SHALL close with the exact phrase „Sesję można zamknąć." This ending SHALL require that the session had a task and that the task is complete. A session whose task has not yet been set SHALL NOT be reported as closable, even when nothing is pending.

#### Scenario: The next step needs a user decision

- **WHEN** continuing requires the user to choose between options
- **THEN** CO DALEJ SHALL announce the decision and the decision-sweep flow SHALL be invoked in the same turn, without asking the user whether to proceed to it

#### Scenario: Several user actions are outstanding

- **WHEN** more than one action requires the user
- **THEN** CO DALEJ SHALL present only the first, under the delegation protocol

#### Scenario: The work is finished

- **WHEN** nothing remains in the session's task and nothing is needed from the user
- **THEN** CO DALEJ SHALL state „Sesję można zamknąć." so the user can recognise a closable session at a glance

#### Scenario: An external process is running

- **WHEN** the agent is blocked only on a process outside its control
- **THEN** CO DALEJ SHALL name the process and state that the user is not needed

#### Scenario: The session has no task yet

- **WHEN** a reply ends a preparatory step — switching the mode on, installing something — and the user has not yet said what the session is for
- **THEN** CO DALEJ SHALL ask what the session is for under ending 2, and SHALL NOT state „Sesję można zamknąć."

### Requirement: OTWARTE TEMATY collects non-blocking observations

The optional `OTWARTE TEMATY` section SHALL contain only items noticed during the work that deserve attention later and do not block the current task. It SHALL NOT contain the next step, questions awaiting the user, or anything already covered by CO DALEJ. When there is nothing to hold, the section SHALL be omitted entirely.

#### Scenario: A side issue is noticed

- **WHEN** the agent notices a problem outside the current task while working
- **THEN** it SHALL appear under OTWARTE TEMATY rather than expanding WYNIK or CO DALEJ

#### Scenario: Nothing was noticed

- **WHEN** no non-blocking items are outstanding
- **THEN** the reply SHALL carry only the three mandatory sections

## MODIFIED Requirements

### Requirement: Reply-style contract

While active, prose addressed to the user SHALL be written in Polish, SHALL carry business meaning, and SHALL be as short as the content allows. A technical or English term SHALL NOT be introduced with a parenthesised gloss; where the natural name of a thing is technical, the reply SHALL instead describe the thing by its effect in plain Polish. Technical detail — tool names, file paths, commands, identifiers, library names — SHALL appear only when the user asks for it, or when the user cannot perform their own next action without it. Filler, hedging and restatement of what the user already said SHALL be omitted.

This contract SHALL apply only to prose addressed to the user. Code, commit messages, pull-request descriptions, file contents, and text destined for any audience other than the user SHALL be unaffected.

#### Scenario: An unavoidable technical term appears

- **WHEN** a reply needs to refer to something whose natural name is a technical term
- **THEN** it SHALL describe the thing by what it does, and SHALL NOT emit the term with a parenthesised translation

#### Scenario: The user asks for technical detail

- **WHEN** the user requests the technical specifics of a result
- **THEN** the reply SHALL provide them, and this SHALL be the only route by which unprompted technical vocabulary enters the conversation

#### Scenario: Agent writes a commit message

- **WHEN** the agent writes a commit message, pull-request body, or code comment while the mode is active
- **THEN** it SHALL be written in that artefact's normal register and language, unconstrained by this contract

#### Scenario: A result and its meaning are both reported

- **WHEN** the agent reports the outcome of a piece of work
- **THEN** the reply SHALL state what it means for the product or the user, and SHALL omit implementation detail unless the user has asked for it

## REMOVED Requirements

### Requirement: Orientation header has a constant shape

**Reason**: Replaced by the reply skeleton. The `KONTEKST` section now carries the orientation in every turn-ending reply, so a separately-shaped header no longer exists.
**Migration**: None for users. Rule texts and the session-start compaction notice stop referencing the two-line header; the skeleton requirements above define the constant shape instead.

### Requirement: Orientation header fires on a closed list of conditions

**Reason**: Conditional orientation is the failure this change corrects — returning to a parallel session that kept running matched none of the six triggers, so the reply the user actually looks at usually carried no orientation. The skeleton is unconditional, so trigger evaluation disappears.
**Migration**: No trigger list to maintain; every turn-ending reply orients. The on-demand orientation command remains for deeper "where are we" requests.
