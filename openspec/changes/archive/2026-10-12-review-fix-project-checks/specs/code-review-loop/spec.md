## ADDED Requirements

### Requirement: The fixer verifies a round with the reviewed repository's own checks

After a round's fixes are in, the fixer SHALL run the checks of the repository under review: those
the `Checks` section of its `REVIEW.md` lists, with the conditions it attaches, when that section
exists; otherwise those the project itself declares — scripts and targets in its manifests and
build files, the check commands its documentation or its CI workflow names, a self-test script it
ships. The fixer SHALL NOT run a command because a skill's text or example shows it, and SHALL NOT
carry a check over from another repository. When it finds no check, the record and the summary
SHALL say so, rather than letting silence imply that a check passed.

#### Scenario: The review policy lists the checks

- **WHEN** `REVIEW.md` has a `Checks` section listing `npm test` and, when `tools/` changed,
  `python -m pytest tests/`
- **THEN** the fixer SHALL run `npm test`, and `python -m pytest tests/` only when the round
  changed `tools/`

#### Scenario: No Checks section, and the project declares its own

- **WHEN** `REVIEW.md` has no `Checks` section, `pyproject.toml` configures pytest and the CI
  workflow runs `ruff check .` and `pytest`
- **THEN** the fixer SHALL run `pytest` and `ruff check .`
- **AND** SHALL NOT run a command of the plugin's own repository, such as
  `node hooks/selftest.mjs` or `claude plugin validate .`, nor an `npm` script the repository does
  not have

#### Scenario: The project declares no check

- **WHEN** the repository has no `Checks` section and declares no check anywhere
- **THEN** the fixer SHALL run no check, and the record and the summary SHALL say that the project
  has none
