## Purpose

An on-demand restatement of what a session is working on, why, where it has got to, and what is outstanding — for the two moments when the transcript alone does not answer that: a reply the user could not follow, and a session returned to after working elsewhere.

## ADDED Requirements

### Requirement: Orientation is available on demand at any point

The user SHALL be able to request an orientation at any point in a session, including immediately after a reply they did not understand, and including in a session where the working mode is not active.

#### Scenario: Requested after an unclear reply

- **WHEN** the user requests an orientation directly after a reply they could not follow
- **THEN** the agent SHALL produce an orientation rather than repeating or elaborating the previous reply

#### Scenario: Requested in a session without the working mode

- **WHEN** the user requests an orientation while the working mode is inactive
- **THEN** the orientation SHALL still be produced and SHALL still obey this capability's requirements

### Requirement: Orientation answers four things

An orientation SHALL state: what is being worked on, what it is for in practical terms, where the work has got to, and what — if anything — is currently wanted from the user. Where nothing is wanted from the user, the orientation SHALL say so explicitly and state what the agent is continuing with.

#### Scenario: Work is in progress with nothing outstanding

- **WHEN** an orientation is requested and the agent needs nothing from the user
- **THEN** it SHALL say that nothing is needed and name what it is proceeding with

#### Scenario: Something is outstanding

- **WHEN** an orientation is requested and something is awaiting the user
- **THEN** the orientation SHALL name it and SHALL state whether it is a decision or a task

### Requirement: Orientation is a summary, not a replay

An orientation SHALL be written in plain language, short enough to read in one pass. It SHALL NOT reproduce the transcript, enumerate tool calls, or recount the sequence of steps taken. Detail SHALL be included only where it changes what the user would do next.

#### Scenario: A long session is summarised

- **WHEN** an orientation is requested after a long session with many steps
- **THEN** its length SHALL reflect the state of the work, not the number of steps taken to reach it

#### Scenario: Technical detail is not load-bearing

- **WHEN** implementation detail would not change the user's next action
- **THEN** it SHALL be omitted from the orientation

### Requirement: Outstanding decisions are routed to the decision sweep

Where the orientation finds that what is outstanding is one or more decisions, it SHALL hand over to the decision-sweep flow rather than listing the decisions in its own output.

#### Scenario: Two decisions are outstanding

- **WHEN** an orientation finds two unresolved decisions
- **THEN** it SHALL say so and hand over to the decision-sweep flow, which raises them one at a time

### Requirement: Outstanding tasks are routed to the delegation protocol

Where the orientation finds that what is outstanding is work for the user, it SHALL hand over to the task-delegation protocol rather than listing the tasks in its own output.

#### Scenario: Several tasks are outstanding

- **WHEN** an orientation finds three tasks requiring the user
- **THEN** it SHALL say how many there are and hand over to the delegation protocol, which raises the first one only

### Requirement: Orientation reflects verified state, not intent

An orientation SHALL describe what has actually been done and confirmed, and SHALL distinguish it from what is planned or believed to be done. Work that was attempted but not verified SHALL be reported as unverified.

#### Scenario: A step was attempted but not confirmed

- **WHEN** an earlier step ran but its result was never checked
- **THEN** the orientation SHALL report it as unverified rather than as complete

#### Scenario: Part of the work was skipped

- **WHEN** part of the requested scope was left out
- **THEN** the orientation SHALL say what was left out and why
