# Tasks

## 1. The skill and the template

- [x] 1.1 Step 6 of `skills/review-fix/SKILL.md`: the `Checks` section of `REVIEW.md` first, then
      what the project declares on its own, and the rule that a check never comes from the skill,
      the plugin or another repository. Replace the list of this repository's checks with one
      example from a project unlike it. Verify that no command of this repository is left in step
      6. Verified with a search: `selftest`, `plugin validate` and `openspec validate` no longer
      appear in the step.
- [x] 1.2 Step 7's record example: `Checks: pytest — 14/14 passed`, matching the Python project of
      its rows. Verify that `hooks/selftest.mjs` no longer appears anywhere in `SKILL.md`. Verified
      with a search.
- [x] 1.3 `templates/REVIEW_TEMPLATE.md`: the `Checks (adapt)` comment says what the fixer runs
      without the section, and that it says so when it finds none.

## 2. Evals

- [x] 2.1 New decision case `evals/cases/review-fix/27-checks-come-from-the-reviewed-repository/`,
      in the format of cases 7–26: tag `tier-read`, a `tool_used: Skill` indicator, a regex on the
      final `SPRAWDZENIA:` line that requires `pytest` and rejects `selftest`, `plugin validate`,
      `openspec`, `npm` and `pnpm` on that line, a regex for `ruff`, and an `llm` rubric. Verify
      the two regexes against sample answers. Verified with Node against five answers: the right
      one and one with `ruff` before `pytest` pass, one naming `node hooks/selftest.mjs`, one
      adding `npm test` and one saying there is no check fail.
- [x] 2.2 Run case 27, 3 runs, on this branch and on `origin/master` as the base, with
      `--ablation none --model claude-opus-5-5 --judge-model claude-haiku-5-5` (about $1.20 for
      both sides). Done when every deterministic grader passes in every branch run and the branch
      scores at least 0.8. Record both scores in `skills/review-fix/evals/README.md`. Paid: run it
      only on the owner's consent.
      - **Done on 2026-10-12, on the owner's consent in chat; $1.02 for both sides.** Branch: 1.00
        in all three runs, every grader passing, rubric PASS PASS PASS each time. Base (the case
        copied into a detached worktree of `origin/master`): 0.80, no run passing.
      - **The base reaches the right checks.** Every base answer ends on `pytest` and
        `ruff check .`, and both regexes pass. The rubric fails it because the answer names this
        repository's commands while setting them aside. The case therefore measures that the old
        text puts those commands in front of the fixer, not that `claude-opus-5-5` runs them.

## 3. Documentation and checks

- [x] 3.1 `CHANGELOG.md`: one entry under Fixed, naming the visible effect.
- [x] 3.2 `node hooks/selftest.mjs`, `node skills/review-fix/scripts/selftest.mjs`,
      `openspec validate --all --strict` and `claude plugin validate .` pass.
- [x] 3.3 Open the pull request to `master` on `change/review-fix-project-checks`. Do not merge.
      — opened as #27.

## 4. After merge

- [x] 4.1 Archive this change and fold the added requirement into
      `openspec/specs/code-review-loop/spec.md`. — #27 was merged as `906fe35` on 2026-10-12 and
      the plugin was updated to it; this change is archived in the pull request that ticks this box.
