# Capability: Skill Evaluation

## Purpose

Requirements for running the skill-creator evaluation process to validate skill quality, triggering accuracy, and compliance with the Agent Skills 2.0 standard.

## Requirements

### Requirement: Skill passes skill-creator evaluation process

Each skill SHALL be evaluated through the full `/skill-creator` workflow, producing eval artifacts in the designated workspace directory.

#### Scenario: Test prompts cover skill's domain

- **WHEN** generating test prompts for the eval
- **THEN** at least 5 test prompts are created in Polish, covering the skill's core use cases and boundary scenarios

#### Scenario: With-skill and without-skill tests run

- **WHEN** running the eval
- **THEN** both with-skill and without-skill baseline tests execute for each test prompt, producing comparable outputs for grading

#### Scenario: Eval artifacts are generated

- **WHEN** the eval completes
- **THEN** the workspace `skills/<name>-workspace/iteration-1/` contains: eval_set.json, grading.json, benchmark.json, timing.json, and feedback.json

### Requirement: Description achieves triggering accuracy target

The SKILL.md description field SHALL be optimized to achieve at least 80% triggering accuracy across the eval set.

#### Scenario: Description optimization is performed

- **WHEN** initial eval results are available
- **THEN** the description is manually analyzed against the eval set and optimized for triggering accuracy (manual process due to Windows run_loop.py limitation)

#### Scenario: Bilingual keywords are present

- **WHEN** reading the optimized description
- **THEN** it contains both Polish and English keywords covering the skill's core use cases

### Requirement: Cosmetic fixes applied based on eval review

The skill SHALL incorporate any cosmetic fixes identified during the eval review process, without changing the fundamental methodology or capabilities.

#### Scenario: Review-driven fixes only

- **WHEN** applying post-eval fixes to SKILL.md
- **THEN** changes are limited to cosmetic improvements (wording, structure, clarity) — no new capabilities, no methodology changes, no new reference files

### Requirement: EVAL-PLAYBOOK.md status is updated

The eval playbook status table SHALL reflect the completed evaluation of each processed skill.

#### Scenario: Status updated to Done

- **WHEN** the eval is complete and all artifacts are generated
- **THEN** the skill's row in EVAL-PLAYBOOK.md shows "Done" status with the relevant commit hash

### Requirement: Skill does not fabricate data when sources are unavailable

When context files are missing or API scripts fail, the skill SHALL report what data is missing and how to provide it, rather than generating fictional data.

#### Scenario: Missing context file

- **WHEN** a required context file (e.g., `context/finances.md`) does not exist
- **THEN** the skill informs the user and suggests running environment-setup

#### Scenario: API script fails

- **WHEN** a data retrieval script fails (e.g., missing API keys)
- **THEN** the skill reports the specific script and required configuration, without fabricating results
