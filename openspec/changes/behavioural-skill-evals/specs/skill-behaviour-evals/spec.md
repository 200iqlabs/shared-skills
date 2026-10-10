# Spec Delta

## Purpose

Keeps each skill's behavioural cases as runnable `claude plugin eval` cases with checkable
graders, so whether a skill still behaves as written is a score anyone can reproduce. It also
covers where a case may run, what it may depend on, what it is compared against, and how CI runs
the suite without turning it into a merge gate.

## ADDED Requirements

### Requirement: Behavioural cases live in one plugin-eval suite

Behavioural cases SHALL be `claude plugin eval` cases under the eval directory that the plugin
manifest declares in `experimental.evals`, grouped in one subdirectory per skill. Each case name
SHALL begin with its skill's name, so that one skill's cases can be selected by name. Run results
written under that directory SHALL NOT be committed. A skill SHALL NOT keep behavioural cases in
two formats at once. Its skill-creator `evals.json` SHALL be removed once every case it held has
been migrated, retired by a named change, or listed as not automated.

#### Scenario: Running one skill's cases
- **WHEN** a maintainer runs `claude plugin eval .` from the repository root with
  `--case '<skill>-*'` and one tier tag
- **THEN** only that skill's cases of that tier run, and the eval directory is resolved from the
  manifest without an `--eval-dir` flag

#### Scenario: Manifest key survives validation
- **WHEN** `claude plugin validate .` runs on Linux and Windows with the `experimental.evals` key
  present
- **THEN** validation passes with no new error or warning attributable to the key

#### Scenario: A migrated skill keeps no `evals.json`
- **WHEN** every case of a skill's `evals.json` is migrated, retired or listed as not automated
- **THEN** the file is deleted in the same change, and the skill's `evals/README.md` maps each old
  case id to its case directory, to the change that retired it, or to the reason it stays manual

### Requirement: Every case is gradeable without reading a transcript

Each case SHALL carry at least one deterministic grader on its outcome: a `regex` on the final
message or on a produced file, a `file_exists`, or a `tool_used` or `tool_order` on what the run
did. An `llm` grader SHALL state its rubric as concrete PASS and FAIL conditions and SHALL judge
only the final message or a short file. Long generated files SHALL be graded by `regex` on their
contents. A check that something must not happen SHALL be scored in both arms.

#### Scenario: Generated document checked by pattern
- **WHEN** a case produces a multi-section document
- **THEN** its structure and the strings it must carry over from the input are checked by `regex`
  graders on the file's contents, not by a judge reading the whole file

#### Scenario: Prohibition holds without the plugin too
- **WHEN** a grader asserts that a tool was not called or a file was not created
- **THEN** it is marked `arm: both`, so the no-plugin arm is held to the same prohibition

#### Scenario: Judge sees a short target
- **WHEN** a case uses an `llm` grader
- **THEN** the grader's focus is the final message or a file short enough to read whole, and its
  body names what passes and what fails

### Requirement: Cases declare a tier, and shell cases run only under a sandbox

Each case SHALL carry exactly one tier tag, named after what it is granted. A `tier-read` case is
granted only read-only tools. A `tier-write` case is also granted file-writing tools, but no
shell. A `tier-shell` case is granted a shell. Each tier SHALL run as its own invocation, because
a tool grant applies to every case in an invocation. `tier-shell` cases SHALL be selected only on
a machine with an OS sandbox backend. A case that describes a state partway through a run SHALL
ask what the skill does in that state and SHALL say that no command is to be run.

#### Scenario: Windows run
- **WHEN** a maintainer on native Windows runs the documented local commands
- **THEN** only `tier-read` and `tier-write` cases are selected, and none is refused for lacking a
  sandbox

#### Scenario: Read-tier case never holds a write grant
- **WHEN** the suite is run locally or in CI
- **THEN** `tier-read` cases run in an invocation without `--allow-tools`, so a grant meant for
  `tier-write` cases never reaches them

#### Scenario: Decision case asks for the decision
- **WHEN** a case describes a state partway through a run, such as a failed lookup or an exhausted
  wait
- **THEN** its prompt asks what the skill does in that state and says no command is to be run, so
  a run that tried and failed to execute something is not graded as a wrong decision

### Requirement: Fixtures are synthetic, committed and local to the case

Everything a case needs SHALL be committed beside the case and copied into the run's workspace
by the case's scaffold script: files, git state, and per-case answers for any fake command-line
tool. A case SHALL NOT depend on a live service, on a real pull request, on the real Codex
runtime, or on data about a real person or client. The scaffold SHALL locate the case's own files
relative to itself, not through an absolute path.

#### Scenario: Missing fixture fails loudly
- **WHEN** a fixture file the scaffold copies is missing
- **THEN** the scaffold exits non-zero and the run is reported as `scaffold failed`, not graded on
  an empty workspace

#### Scenario: Author persona
- **WHEN** a case needs an author profile or brand data
- **THEN** it uses a fictional persona committed as a fixture, never the maintainer's or a
  client's profile

### Requirement: The skill under test is loaded deterministically

A case SHALL load its skill without depending on the description triggering it. A case that hands
the skill its input SHALL start with the skill's slash command. A decision case SHALL name the
skill in prose and SHALL carry a `tool_used: Skill` grader as the plugin-fired indicator, because
a slash command would start a run instead of asking about one. Trigger accuracy SHALL NOT be
measured by this suite.

#### Scenario: Slash-invoked case has no Skill indicator
- **WHEN** a case starts with the skill's slash command
- **THEN** it carries no `tool_used: Skill` grader, because the command expands the skill without
  a `Skill` tool call, and that indicator would read as a failure in every run

#### Scenario: Decision case where the skill did not load
- **WHEN** a decision case's with-arm run never invokes the skill
- **THEN** the report shows the plugin-fired indicator as failed beside the score, so a failure
  to load is distinguishable from a wrong decision

### Requirement: Each case has a baseline that answers its question

A case SHALL be measured against the no-plugin arm in its first calibration run. A case whose
no-plugin arm scores at least the pass threshold does not exercise the skill and SHALL be
rewritten or listed as such in the skill's README. A change to a skill that already has cases
SHALL be compared with the same cases run against the base revision of that skill. Cases that
flipped between base and branch SHALL be listed.

#### Scenario: Calibration finds a case the model passes alone
- **WHEN** a case scores at or above the threshold in the no-plugin arm of its calibration run
- **THEN** the case is not counted as evidence for the skill until it is rewritten, and the README
  says so

#### Scenario: Skill change compared with its base
- **WHEN** a pull request changes a skill that has cases
- **THEN** the comparison runs the branch's cases against both the base revision and the branch,
  with identical model, judge and run count, and lists every case whose pass or fail differs

### Requirement: Cases that cannot be automated are listed with a reason

A behavioural expectation SHALL NOT be dropped silently. Each case that is not migrated SHALL
appear in its skill's `evals/README.md`, in one of three groups: retired by a named change,
waiting for the shell tier, or manual with a stated reason.

#### Scenario: Case retired by another change
- **WHEN** a case covers behaviour that another change removes
- **THEN** the README names that change and the task that retires the case, and the case stays
  where it was until that change deletes it

### Requirement: CI runs the suite on demand and on schedule, never as a gate

The behavioural suite SHALL run in CI only on manual dispatch and on a schedule, never on
`pull_request`, `pull_request_target` or `workflow_run`. Its result SHALL NOT feed a required
status check. Each CI run SHALL pin the agent model and the judge model and SHALL set a cost
ceiling. It SHALL publish only case names, scores, deltas, costs and failing grader names. It
SHALL NOT publish transcripts, judge evidence or grader explanations.

#### Scenario: Scheduled run below threshold
- **WHEN** a scheduled run ends with a case below the threshold
- **THEN** the job fails and its summary names the case and its failing graders, and no pull
  request is blocked by it

#### Scenario: Published output
- **WHEN** a CI run uploads its results
- **THEN** the uploaded file carries scores and costs per case and no model output

### Requirement: A lost run is not a score

A run that ended on an infrastructure error SHALL be reported as lost, not as a low score.
Infrastructure errors are a usage or rate limit, an authentication failure, an overloaded API, a
transport failure, and the per-run wall-clock timeout. A run whose paid graders the cost ceiling
skipped also counts as lost. A run that hit its turn cap is the skill's own behaviour and SHALL be
scored. A suite run with lost runs, or with a partial result, SHALL be reported as inconclusive,
worded differently from a failure.

#### Scenario: Rate limit mid-suite
- **WHEN** some runs end with a usage-limit or rate-limit error
- **THEN** the summary lists them as lost with the error, excludes them from case scores, and
  reports the run as inconclusive rather than as a regression

#### Scenario: Cost ceiling reached
- **WHEN** the run stops at `--max-cost-usd` and the result is marked partial
- **THEN** the run is reported as inconclusive, with the cases that did not run named
