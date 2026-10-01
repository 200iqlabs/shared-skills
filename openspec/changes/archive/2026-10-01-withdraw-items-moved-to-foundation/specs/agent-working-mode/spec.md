## MODIFIED Requirements

### Requirement: CO DALEJ closes with exactly one of four endings

The `CO DALEJ` section SHALL end the reply with exactly one of the following, and nothing else:

1. A decision is needed from the user — the section SHALL say so, and the agent SHALL take the decisions through in the same turn without asking whether to: through the agentic-system foundation's task-help skill (`sa-task-help`, decisions mode) when the session has that skill, and otherwise by raising them in the reply one at a time with a recommendation first. The decisions SHALL NOT be written out as prose questions instead.
2. An action is needed from the user — when the session has the foundation's task-help skill, the section SHALL hand the action over under that skill's operator-actions part, whose portion rules apply; otherwise it SHALL hand over exactly one task, stating what to do and how its completion will be recognised, never a list.
3. The agent is waiting on an external process — the section SHALL name what is awaited and state that nothing is needed from the user.
4. The session's task is finished — the section SHALL close with the exact phrase „Sesję można zamknąć." This ending SHALL require that the session had a task and that the task is complete. A session whose task has not yet been set SHALL NOT be reported as closable, even when nothing is pending.

#### Scenario: The next step needs a user decision

- **WHEN** continuing requires the user to choose between options
- **THEN** CO DALEJ SHALL announce the decision, and the decisions SHALL be taken through in the same turn — by the foundation's task-help skill when the session has it — without asking the user whether to proceed to them

#### Scenario: A decision in a session without the foundation

- **WHEN** continuing requires the user to choose and the session has no foundation task-help skill
- **THEN** the reply SHALL raise the decisions one at a time with a recommendation first, and SHALL NOT point the user to a command or skill the session does not have

#### Scenario: Several user actions are outstanding

- **WHEN** more than one action requires the user and the session has no foundation task-help skill
- **THEN** CO DALEJ SHALL present only the first, with what to do and how its completion will be recognised

#### Scenario: User actions in a session with the foundation

- **WHEN** actions require the user and the session has the foundation's task-help skill
- **THEN** CO DALEJ SHALL hand them over under that skill's operator-actions part, in the portions that skill sets

#### Scenario: The work is finished

- **WHEN** nothing remains in the session's task and nothing is needed from the user
- **THEN** CO DALEJ SHALL state „Sesję można zamknąć." so the user can recognise a closable session at a glance

#### Scenario: An external process is running

- **WHEN** the agent is blocked only on a process outside its control
- **THEN** CO DALEJ SHALL name the process and state that the user is not needed

#### Scenario: The session has no task yet

- **WHEN** a reply ends a preparatory step — switching the mode on, installing something — and the user has not yet said what the session is for
- **THEN** CO DALEJ SHALL ask what the session is for under ending 2, and SHALL NOT state „Sesję można zamknąć."
