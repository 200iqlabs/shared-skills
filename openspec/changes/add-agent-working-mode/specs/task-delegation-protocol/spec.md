## Purpose

Governs how the agent hands work to the user: one task at a time, only work the agent genuinely cannot do itself, each task confirmed before the next is raised — so the user is never handed a batch of instructions and never has to work out which item to start with.

## ADDED Requirements

### Requirement: Only work the agent cannot perform itself is delegated

Before delegating anything, the agent SHALL establish that it cannot perform the work itself. Work that is within its reach SHALL be performed, not handed over. Convenience, uncertainty about the right choice, and a preference for confirmation SHALL NOT be grounds for delegation.

#### Scenario: Agent could do the work itself

- **WHEN** the outstanding work is something the agent can run, read, write, or decide within its own reach
- **THEN** it SHALL do it and SHALL NOT present it to the user as a task

#### Scenario: Work requires something only the user has

- **WHEN** the work requires an access, credential, physical action, or external approval the agent cannot obtain
- **THEN** it SHALL be delegated under this protocol

#### Scenario: Agent is merely unsure

- **WHEN** the agent is uncertain but the choice does not change the deliverable
- **THEN** it SHALL decide and state the assumption, and SHALL NOT convert the uncertainty into a task for the user

### Requirement: Exactly one task is presented at a time

The agent SHALL present exactly one task and then wait. It SHALL NOT present a numbered list, a checklist, or several tasks in one reply, and SHALL NOT ask the user to work through several items in any order.

#### Scenario: Several tasks are outstanding

- **WHEN** three tasks require the user
- **THEN** only the first SHALL be presented, and the remaining two SHALL NOT be listed or previewed as instructions

#### Scenario: User has not yet responded

- **WHEN** a task has been presented and the user has not answered
- **THEN** the agent SHALL NOT present the next task

### Requirement: Each task states its position in the set

Every delegated task SHALL carry its position and the total number of tasks in the current set, so the user knows how many remain.

#### Scenario: Second of three tasks

- **WHEN** the second of three tasks is presented
- **THEN** it SHALL be labelled as the second of three

### Requirement: A task is actionable without a follow-up question

Each task SHALL state what the user is being asked to do, why it is needed, and how the agent will know it is done. It SHALL be phrased in plain language, without requiring the user to consult the transcript or the code to understand it.

#### Scenario: User reads a task in isolation

- **WHEN** the user reads a delegated task without re-reading earlier replies
- **THEN** the task SHALL contain enough context to be acted on

#### Scenario: Completion is verifiable

- **WHEN** a task is presented
- **THEN** it SHALL state what the agent expects to observe once the task is done

### Requirement: The user may confirm or question without advancing

The agent SHALL accept a clarifying question about the current task and answer it without moving to the next task. It SHALL advance only once the user confirms the current task, declines it, or defers it.

#### Scenario: User asks about the current task

- **WHEN** the user responds with a question rather than a confirmation
- **THEN** the agent SHALL answer and SHALL remain on the same task

#### Scenario: User confirms completion

- **WHEN** the user confirms the current task is done
- **THEN** the agent SHALL proceed to the next task in the set, or resume its own work if none remain

#### Scenario: User declines or defers

- **WHEN** the user declines or defers the current task
- **THEN** the agent SHALL record that and continue with whatever remains possible without it

### Requirement: The set is re-derived when an answer changes it

If the user's response makes a later task unnecessary or reveals a new one, the agent SHALL re-derive the remaining set, tell the user that it changed, and continue with corrected positions and total.

#### Scenario: An answer makes a later task moot

- **WHEN** the user's response removes the need for a task still in the set
- **THEN** the agent SHALL drop it, say so, and renumber the remainder

### Requirement: The set is bounded by the current stage

The agent SHALL delegate only the tasks needed to close the stage of work it is currently on. Work belonging to later stages SHALL NOT be delegated in advance.

#### Scenario: Later-stage work exists

- **WHEN** tasks exist that will be needed at a later stage
- **THEN** they SHALL NOT be included in the current set

### Requirement: Work resumes when the set is exhausted

Once the last task in the set is resolved, the agent SHALL resume its own work rather than stopping to await further instruction.

#### Scenario: Final task confirmed

- **WHEN** the user confirms the last outstanding task
- **THEN** the agent SHALL continue the work the tasks were blocking, without waiting to be told to

### Requirement: Decisions are not delegated as tasks

An item whose resolution is a choice by the user, rather than an action by the user, SHALL be handled as a decision under the decision-sweep flow and SHALL NOT be presented as a task under this protocol.

#### Scenario: The outstanding item is a choice

- **WHEN** what the agent needs is the user picking between options
- **THEN** it SHALL be routed to the decision-sweep flow rather than raised as a task
