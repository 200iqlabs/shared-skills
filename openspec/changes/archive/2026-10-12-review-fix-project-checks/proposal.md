# Review fix: the checks come from the repository under review

## Why

Step 6 of `review-fix` tells the fixer to run the project's own checks after the fixes. It names
`REVIEW.md`'s `Checks` section first, and then, as its example, the checks of this repository:
`node hooks/selftest.mjs`, `node skills/review-fix/scripts/selftest.mjs`,
`openspec validate --all --strict` and `claude plugin validate .`. The skill runs in other
repositories, from the plugin cache. There, "in this repository" reads as the repository being
reviewed, and a fixer in a repository whose `REVIEW.md` has no `Checks` section can take the
plugin's own commands for the checks to run. They either fail, which ends the round as an error,
or they pass vacuously and the round reports a check that never looked at the code.

A session in a product repository found this on 2026-10-12 while moving that repository's review
loop to Codex. There the `Checks` section of its `REVIEW.md` hides the problem; any repository
without one is exposed. The example in step 7's record (`Checks: node hooks/selftest.mjs — 14/14
passed`) carries the same command into a record whose other rows describe a Python project.

## What Changes

- **Step 6 names the two sources and nothing else.** The `Checks` section of `REVIEW.md`, run as it
  is written, conditions included. Without it, what the project declares on its own: the scripts in
  `package.json`, the targets of a `Makefile`, the test setup in `pyproject.toml`, the commands its
  `README`, `CONTRIBUTING` or `AGENTS.md` names, the test and lint steps of its CI workflow, a
  self-test script it ships. The step says that a check never comes from the skill, the plugin or
  another repository, and its one example is a project explicitly unlike this one (a Python service
  with pytest and ruff).
- **The paragraph on a project with no check stays as it is**: the fixer says so in the record and
  the summary.
- **Step 7's record example** shows `pytest`, the check of the Python project its rows describe.
- **`templates/REVIEW_TEMPLATE.md`**, in its `Checks (adapt)` comment, says what the fixer runs
  when the section is missing.
- One new behavioural case, 27: a Python repository with no `Checks` section, where the answer must
  name pytest and ruff and nothing from this plugin's repository.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `code-review-loop`: gains the requirement *The fixer verifies a round with the reviewed
  repository's own checks*.

## Non-goals

- The skill's `description` and its triggering are untouched, so the trigger accuracy recorded in
  `skills/review-fix/evals/README.md` still describes the description that ships.
- How a failing check ends the round (fix and re-run, or an error with nothing committed) and the
  record's `Checks:` line stay as they are.
- `review-loop` has no example checks of its own; it runs `review-fix` as its round, so it follows
  the new text without an edit.
- `skills/review-fix/evals/evals.json` case 2 keeps its expected output. It runs in this repository,
  whose `REVIEW.md` lists `node hooks/selftest.mjs` and `openspec validate` in its `Checks`
  section, which the new step reads first.
- The files of `behavioural-skill-evals` are not edited. Its task 5.2 plans case 2 as a read-only
  scaffold of `hooks/selftest.mjs` and `openspec/` with no `package.json`, and its rubric expects
  `openspec validate`. Under the new step an `openspec/` directory alone declares no check, so when
  that case is written its scaffold has to name the command (a `Checks` section or a `README`), or
  the rubric has to drop it. The pull request names this for whoever writes that case.

## Impact

- `skills/review-fix/SKILL.md`: step 6 and the record example in step 7.
- `templates/REVIEW_TEMPLATE.md`: the comment in `Checks (adapt)`.
- `evals/cases/review-fix/27-checks-come-from-the-reviewed-repository/`: a new decision case.
  `skills/review-fix/evals/README.md` gets its row.
- `CHANGELOG.md`: one entry under Fixed.
