# Spec Delta

## MODIFIED Requirements

### Requirement: Skill passes skill-creator evaluation process

Each skill SHALL be evaluated through the full `/skill-creator` workflow, producing eval artifacts. A skill without
behavioural cases in the plugin eval suite produces them in the designated workspace directory. A skill whose
behavioural cases live in the plugin eval suite (capability `skill-behaviour-evals`) runs the eval step of that
workflow as `claude plugin eval` over its cases. Its eval artifacts are that run's results.

#### Scenario: Test prompts cover skill's domain

- **WHEN** generating test prompts for the eval
- **THEN** at least 5 test prompts are created in Polish, covering the skill's core use cases and boundary scenarios

#### Scenario: With-skill and without-skill tests run

- **WHEN** running the eval
- **THEN** both with-skill and without-skill baseline tests execute for each test prompt, producing comparable outputs
  for grading. For a skill with plugin eval cases, this is the no-plugin ablation arm of `claude plugin eval`

#### Scenario: Eval artifacts are generated

- **WHEN** the eval completes
- **THEN** for a skill without plugin eval cases, the workspace `skills/<name>-workspace/iteration-1/` contains:
  eval_set.json, grading.json, benchmark.json, timing.json, and feedback.json; for a skill with plugin eval cases, the
  run's results directory contains `aggregate-result.json` and `report.html`

#### Scenario: Skill with plugin eval cases is evaluated by its cases

- **WHEN** a skill whose behavioural cases live in the plugin eval suite is created or significantly modified
- **THEN** the eval step runs its cases with `claude plugin eval`, and a case added for the modification is written
  as a plugin eval case, not into an `evals.json`
