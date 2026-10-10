# Spec Delta

## MODIFIED Requirements

### Requirement: Skill passes skill-creator evaluation process

Each skill SHALL be evaluated through the full `/skill-creator` workflow, producing eval artifacts. A skill without
behavioural cases in the plugin eval suite produces them in the designated workspace directory. A skill whose
behavioural cases live in the plugin eval suite (capability `skill-behaviour-evals`) runs the eval step of that
workflow as `claude plugin eval` over its cases. Its eval artifacts are that run's results.

#### Scenario: Test prompts cover skill's domain

- **WHEN** generating test prompts for the eval
- **THEN** at least 5 test prompts are created in Polish, covering the skill's core use cases and boundary scenarios.
  For a skill with plugin eval cases, the count includes its suite cases and any cases still waiting in its
  `evals.json` for a named in-flight change

#### Scenario: With-skill and without-skill tests run

- **WHEN** running the eval
- **THEN** both with-skill and without-skill baseline tests execute for each test prompt, producing comparable outputs
  for grading. For a skill with plugin eval cases, every case runs with the no-plugin arm of `claude plugin eval` in
  the calibration run that adds it

#### Scenario: Modified skill is compared with its previous version

- **WHEN** a skill with plugin eval cases is significantly modified
- **THEN** its cases run against both the base revision of the skill and the modified one, with identical model, judge
  and run count, and the cases whose pass or fail differs are listed. The previous version is the baseline for a
  modification; the no-plugin arm is not required again for cases it already calibrated

#### Scenario: Eval artifacts are generated

- **WHEN** the eval completes
- **THEN** for a skill without plugin eval cases, the workspace `skills/<name>-workspace/iteration-1/` contains:
  eval_set.json, grading.json, benchmark.json, timing.json, and feedback.json; for a skill with plugin eval cases, the
  run's results directory contains `aggregate-result.json` and `report.html`

#### Scenario: Skill with plugin eval cases is evaluated by its cases

- **WHEN** a skill whose behavioural cases live in the plugin eval suite is created or significantly modified
- **THEN** the eval step runs its cases with `claude plugin eval`, and a case added for the modification is written
  as a plugin eval case, not into an `evals.json`
