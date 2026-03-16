# Capability: Skill Evaluation

## Purpose

Requirements for running the skill-creator evaluation process to validate skill quality, triggering accuracy, and compliance with the Agent Skills 2.0 standard.

## Requirements

### Requirement: Skill passes skill-creator evaluation process

The business-consultant skill (after context layer migration) SHALL be evaluated through the full `/skill-creator` workflow, producing eval artifacts in the designated workspace directory.

#### Scenario: Test prompts cover all workflow phases

- **WHEN** generating test prompts for the eval
- **THEN** at least 5 test prompts are created in Polish, covering: discovery (meeting notes/questions), analysis (bottleneck identification), solution design (architecture/tool selection), estimation (time/cost), and proposal/offer preparation

#### Scenario: With-skill and without-skill tests run

- **WHEN** running the eval
- **THEN** both with-skill and without-skill baseline tests execute for each test prompt, producing comparable outputs for grading

#### Scenario: Eval artifacts are generated

- **WHEN** the eval completes
- **THEN** the workspace `skills/business-consultant-workspace/iteration-1/` contains: eval_set.json, grading.json, benchmark.json, timing.json, and feedback.json

### Requirement: Description achieves triggering accuracy target

The SKILL.md description field SHALL be optimized to achieve at least 80% triggering accuracy across the eval set.

#### Scenario: Description optimization is performed

- **WHEN** initial eval results are available
- **THEN** the description is manually analyzed against the eval set and optimized for triggering accuracy (manual process due to Windows run_loop.py limitation)

#### Scenario: Bilingual keywords are present

- **WHEN** reading the optimized description
- **THEN** it contains both Polish and English keywords covering the skill's core use cases (discovery, analysis, estimation, proposals, consulting)

### Requirement: Cosmetic fixes applied based on eval review

The skill SHALL incorporate any cosmetic fixes identified during the eval review process, without changing the fundamental methodology or capabilities.

#### Scenario: Review-driven fixes only

- **WHEN** applying post-eval fixes to SKILL.md
- **THEN** changes are limited to cosmetic improvements (wording, structure, clarity) — no new capabilities, no methodology changes, no new reference files

### Requirement: EVAL-PLAYBOOK.md status is updated

The eval playbook status table SHALL reflect the completed evaluation of the business-consultant skill.

#### Scenario: Status updated to Done

- **WHEN** the eval is complete and all artifacts are generated
- **THEN** the business-consultant row in EVAL-PLAYBOOK.md shows "Done" status with the relevant commit hash
