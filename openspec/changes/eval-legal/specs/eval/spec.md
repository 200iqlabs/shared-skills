## ADDED Requirements

### Requirement: Skill passes skill-creator evaluation
The legal skill SHALL be evaluated through the `/skill-creator` process (Agent Skills 2.0), producing eval artifacts in `skills/legal-workspace/iteration-1/`. The evaluation MUST follow the same process used for linkedin-content and tax-advisor skills. The evaluation MUST run on the migrated version of the skill (after context layer migration).

#### Scenario: Eval artifacts are generated
- **WHEN** the skill-creator eval process completes
- **THEN** the workspace SHALL contain: eval_set.json (test prompts), grading.json (with/without-skill comparison), benchmark.json (scoring results), timing.json, and feedback.json

#### Scenario: Minimum test prompt coverage
- **WHEN** generating test prompts for the eval
- **THEN** there SHALL be at least 5 test prompts in Polish covering different work modes and legal domains (contracts, RODO, IP, corporate law, compliance)
- **AND** the prompts SHALL be written as a real Polish IT entrepreneur would write them

#### Scenario: Windows workarounds applied
- **WHEN** running the eval on Windows
- **THEN** `generate_review.py` SHALL be invoked with the `--static` flag to avoid cp1252 encoding errors
- **AND** description optimization SHALL be performed manually (run_loop.py does not work on Windows)

### Requirement: Triggering accuracy meets threshold
The skill's `description` field SHALL achieve a triggering accuracy of >= 80% as measured by the skill-creator eval process. If initial accuracy is below threshold, the description MUST be iteratively optimized.

#### Scenario: Description triggers on explicit legal queries
- **WHEN** a user asks about contracts, RODO, IP protection, corporate law, or compliance in Polish
- **THEN** the skill SHALL be triggered

#### Scenario: Description triggers on implicit legal queries
- **WHEN** a user asks about "umowa z klientem", "ochrona danych", "przeniesienie praw autorskich", or "warunki wspolpracy" without explicitly mentioning law
- **THEN** the skill SHALL be triggered

#### Scenario: Description does not trigger on non-legal queries
- **WHEN** a user asks about tax calculations, financial planning, or marketing strategy
- **THEN** the skill SHALL NOT be triggered

### Requirement: EVAL-PLAYBOOK status is updated
Upon completion of the eval process, the `docs/EVAL-PLAYBOOK.md` status table SHALL be updated to reflect the legal skill's completion status.

#### Scenario: Status table reflects completion
- **WHEN** the eval process is complete and results are satisfactory
- **THEN** the legal skill row in EVAL-PLAYBOOK.md SHALL show "Done" with the relevant commit hash
