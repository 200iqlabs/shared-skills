## ADDED Requirements

### Requirement: Skill passes skill-creator evaluation process
The CFO skill SHALL be evaluated through the full skill-creator (Agent Skills 2.0) process, producing all required eval artifacts in the workspace directory.

#### Scenario: Test prompts are generated
- **WHEN** starting the eval process
- **THEN** at least 5 realistic test prompts are created in Polish, covering financial analysis, budgeting, cash flow, tax planning boundary, and SaaS metrics

#### Scenario: With-skill and without-skill baselines are compared
- **WHEN** running the eval suite
- **THEN** both with-skill and without-skill baseline tests are executed and results are stored for comparison

#### Scenario: Grading and benchmark artifacts are produced
- **WHEN** the eval completes
- **THEN** the workspace at skills/cfo-workspace/iteration-1/ contains: eval_set.json, grading.json, benchmark.json, timing.json, and feedback.json

#### Scenario: Viewer is generated with static flag
- **WHEN** generating the eval viewer
- **THEN** the `--static` flag is used to avoid Windows cp1252 encoding errors

### Requirement: Description is optimized for triggering accuracy
The SKILL.md description field SHALL be optimized to achieve ≥ 80% triggering accuracy against the eval set.

#### Scenario: Description covers eval set trigger phrases
- **WHEN** comparing the eval_set.json prompts against the description field
- **THEN** each test prompt contains keywords or phrases that match the description's trigger terms

#### Scenario: Description does not overtrigger on non-financial queries
- **WHEN** a user asks about tax law, legal compliance, or business strategy
- **THEN** the description's terms do not cause the CFO skill to trigger (these belong to tax-advisor, legal, business-consultant respectively)

### Requirement: EVAL-PLAYBOOK.md reflects completed audit
The docs/EVAL-PLAYBOOK.md status table SHALL be updated to mark the CFO skill as complete, reflecting that all 6 skills in the audit have been processed.

#### Scenario: CFO row is marked done
- **WHEN** reading the status table in EVAL-PLAYBOOK.md
- **THEN** the CFO row shows "✅ Done" with the relevant commit hash

#### Scenario: Audit summary is complete
- **WHEN** reviewing the full status table
- **THEN** all 6 skills have a terminal status (✅ Done or ⏭️ Skipped), with no remaining ⏳ Pending entries for skills that have been processed
