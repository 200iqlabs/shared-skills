## Purpose

A session-scoped mode that governs how the agent talks to the user and when it is allowed to stop, so that a long session stays readable, a session returned to after a break can be re-entered without re-reading it, and the agent does not halt on work it could finish itself.

## ADDED Requirements

### Requirement: Mode is inactive until explicitly switched on

The mode SHALL be inactive by default. Activation SHALL apply to the session in which it was requested and SHALL NOT alter the behaviour of any other session running concurrently.

#### Scenario: Fresh session without activation

- **WHEN** a session starts and the user has not activated the mode
- **THEN** the agent SHALL write replies as it otherwise would, with no language, length or stopping constraint imposed by this capability

#### Scenario: Activation applies from that point on

- **WHEN** the user activates the mode mid-session
- **THEN** every subsequent reply in that session SHALL obey this capability's requirements

#### Scenario: A parallel session is unaffected

- **WHEN** the mode is active in one session and the user works in a second session started separately
- **THEN** the second session SHALL remain unaffected until activated on its own

### Requirement: Mode persists for the whole session once active

Once active, the mode SHALL remain in effect for every subsequent reply until the user deactivates it or the session ends. Elapsed turns, intervening tool use, and summarisation or compaction of earlier context SHALL NOT weaken or silently end it.

#### Scenario: Still in effect late in a long session

- **WHEN** the mode was activated and many exchanges have since taken place
- **THEN** replies SHALL still obey the reply-style contract and the stopping rules

#### Scenario: Still in effect after context is compacted

- **WHEN** earlier conversation has been summarised or compacted away
- **THEN** the mode SHALL remain in effect

### Requirement: Deactivation leaves nothing running

The user SHALL be able to switch the mode off. When off — whether switched off, never switched on, or the providing plugin is disabled or removed — this capability SHALL have no observable effect on replies and SHALL contribute nothing to the session's context.

#### Scenario: User switches the mode off

- **WHEN** the user deactivates the mode
- **THEN** subsequent replies SHALL be free of every constraint this capability imposes

#### Scenario: Providing plugin is disabled

- **WHEN** the plugin that provides this capability is disabled or removed
- **THEN** no part of this capability SHALL continue to run or inject instructions in any session

### Requirement: Reply-style contract

While active, prose addressed to the user SHALL be written in Polish, SHALL lead with what the work means in practical terms before any technical detail, and SHALL be as short as the content allows. Unavoidable technical or English terms SHALL be glossed in plain Polish at first use. Filler, hedging and restatement of what the user already said SHALL be omitted.

This contract SHALL apply only to prose addressed to the user. Code, commit messages, pull-request descriptions, file contents, and text destined for any audience other than the user SHALL be unaffected.

#### Scenario: An unavoidable technical term appears

- **WHEN** a reply must use a term with no plain-language equivalent
- **THEN** the term SHALL be glossed in parentheses at first use in that session

#### Scenario: Agent writes a commit message

- **WHEN** the agent writes a commit message, pull-request body, or code comment while the mode is active
- **THEN** it SHALL be written in that artefact's normal register and language, unconstrained by this contract

#### Scenario: A result and its meaning are both reported

- **WHEN** the agent reports the outcome of a piece of work
- **THEN** the reply SHALL state what it means for the product or the user before any implementation detail

### Requirement: Orientation header has a constant shape

When emitted, the orientation header SHALL occupy the top of the reply, SHALL use the same two labelled lines every time, and SHALL state the current thread of work and its purpose. Its shape SHALL NOT vary between replies within a session, so that it can be located by eye when scrolling back.

#### Scenario: Header is emitted

- **WHEN** a reply meets one of the header trigger conditions
- **THEN** the reply SHALL open with both labelled lines, identifying the current thread of work and stating in one line what it is for

#### Scenario: Two headers in one session are comparable

- **WHEN** two replies in the same session both carry a header
- **THEN** both SHALL use identical labels and layout, differing only in content

### Requirement: Orientation header fires on a closed list of conditions

The header SHALL be emitted when, and only when, at least one of the following holds:

- it is the agent's first reply in a session
- it is the first reply after a session resume, or after earlier context was summarised or compacted
- the reply concludes a piece of work that took several steps
- the reply asks the user a question, delegates a task, or requests a decision
- the topic or the stage of work has changed since the previous reply
- the user has asked where things stand

The agent SHALL NOT emit the header on the basis of its own assessment that a reply is important. Outside the listed conditions the header SHALL be omitted.

#### Scenario: Short confirming exchange

- **WHEN** the user asks a brief follow-up within the same thread and the reply neither concludes multi-step work nor asks anything of the user
- **THEN** the reply SHALL NOT carry a header

#### Scenario: Agent needs something from the user

- **WHEN** a reply asks a question, delegates a task, or requests a decision
- **THEN** the reply SHALL carry a header, so that the user can answer without reconstructing the context

#### Scenario: User returns to the session

- **WHEN** the session is resumed, or the user asks where things stand
- **THEN** the next reply SHALL carry a header

#### Scenario: Work moves to a different stage

- **WHEN** the agent finishes one stage and begins another
- **THEN** the first reply of the new stage SHALL carry a header reflecting the new stage

### Requirement: Stopping is permitted only for enumerated reasons

While active, the agent SHALL continue working without handing control back to the user unless at least one of the following holds:

- the next action is irreversible, or targets production
- the next action spends money or sends something outside the project
- the agent lacks an access or credential it cannot obtain itself
- the requirements contain a genuine fork, where different answers produce materially different deliverables
- the agent has a task for the user, or a decision for the user, and is handing it over under the protocols that govern those

Uncertainty alone SHALL NOT be grounds to stop. Where the agent is unsure but the choice does not change the deliverable, it SHALL choose, state the assumption it made, and continue.

#### Scenario: Agent is unsure about a reversible choice

- **WHEN** the agent must pick between options that do not change the outcome for the user, such as a name or a file location
- **THEN** it SHALL choose, state the choice in one line, and continue without waiting

#### Scenario: Next action targets production

- **WHEN** the next action would write to production, spend money, or send something outbound
- **THEN** the agent SHALL stop and ask before proceeding

#### Scenario: Agent has finished part of a larger job

- **WHEN** the agent completes one part of work the user asked for and the remaining parts are within its reach
- **THEN** it SHALL continue to the remaining parts rather than reporting the intermediate result and waiting

### Requirement: An obstruction is diagnosed before it is reported as a blocker

Before reporting that something cannot be done, the agent SHALL establish that the obstruction is genuine rather than an artefact of its own tooling. A failing hook, a permission prompt, a classifier declining a command, and an absent result SHALL each be distinguished from the underlying work being impossible.

#### Scenario: Tooling fails without a usable error

- **WHEN** a command fails with no output, an empty error, or a message that could equally indicate a broken hook or a refused permission
- **THEN** the agent SHALL determine which of those occurred before telling the user that the task is blocked

#### Scenario: An absence is treated as evidence

- **WHEN** the agent observes only the absence of an expected result
- **THEN** it SHALL confirm the state through a source that reports a different kind of signal before concluding that something is broken

### Requirement: Competing always-on style instructions are surfaced

When the mode is activated, the agent SHALL check whether another always-on instruction governing reply style or length is in effect, and SHALL tell the user if one is found.

#### Scenario: Another style instruction is present at activation

- **WHEN** the user activates the mode while a separate always-on style or verbosity instruction is active
- **THEN** the agent SHALL name it and state that the two will conflict, rather than proceeding silently
