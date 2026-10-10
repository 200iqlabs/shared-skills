# Review policy

Read this before reviewing a change in this repository, and follow it. `AGENTS.md` points here;
the `review-fix` and `review-loop` skills read the two machine-read lines at the end.

## Three passes

Review every change in three passes, and report what each one finds:

1. **Bugs.** Instructions or code that do not do what they say: a step whose command fails as
   written, a branch of a procedure no state can reach, a script whose output a later step reads
   differently, a test that cannot fail.
2. **Security.** Secrets, tokens or personal data in a skill, an eval case, a fixture or a log; text
   that reaches a shell as an argument instead of a file; a command that writes outside the
   repository or the session's scratch directory.
3. **Compliance.** When the branch carries an OpenSpec change, read
   `openspec/changes/<change>/proposal.md`, `design.md` and `specs/`, and report where the change
   does something its design rejects or leaves out what a requirement asks for. Then the change
   against the repository rules below.

## Severity

Tag every finding `P0`–`P3`:

- `P0` — a skill or hook that breaks every session that loads it, or leaks data; nothing ships.
- `P1` — a skill that does the wrong thing on its main path; fix before merging.
- `P2` — wrong behaviour on a narrower path, or a requirement left out; fix in this change.
- `P3` — worth fixing, harmless if it waits.

## Minor findings

Report at most five findings below the importance line per review — the five that matter most.
Do not report wording preferences in prose, and do not restate a finding in other words.

## Earlier decisions

Before raising a finding, read `openspec/changes/*/review.md`. A finding recorded there as
`rejected` was judged and declined with a reason. Do not raise it again unless the text or code it
names has changed since that decision; if it has, say what changed.

## Repository rules

- **This repository is public.** No client names, real people's data, private paths, credentials
  or the owner's private context in skills, evals, fixtures, templates or docs. User data lives in
  `company/` and `context/*.md`, which are gitignored.
- **Hooks never block a prompt.** They fail silently, print nothing when the working mode is off,
  and write nothing into `~/.claude/settings.json` or `~/.claude/hooks/`.
- **A skill that reads context files** has a `## Context Dependencies` section with the warning it
  prints for a missing file.
- **Shell commands in skills do not pipe through `jq`**, which may be absent; they parse JSON with
  Node or with `gh --jq`.
- **Text that leaves the machine** — a pull-request comment, an issue body — travels as a file,
  never as a shell argument, where backticks and `$` would be expanded.
- **A significant `SKILL.md` change comes with its measurement**: the skill's `evals/README.md`
  records the trigger accuracy of the description it ships (the bar is 80%).
- **Every case in `evals/cases/`** has at least one deterministic grader (`regex`, `tool_used`,
  `file_exists`).
- **A user-visible change has a `CHANGELOG.md` entry**, marked breaking where it breaks something.

## Checks

The fixer runs these after every round, and the review may cite them:

- `node hooks/selftest.mjs`
- `node skills/review-fix/scripts/selftest.mjs`
- `openspec validate --all --strict`
- `claude plugin validate .`
- `python -m pytest tests/` when `tools/` changed

## Machine-read lines

Important: P0-P2
Test paths: tests/**, hooks/selftest.mjs, skills/*/scripts/selftest.mjs, skills/*/scripts/fixtures/**, skills/*/evals/*.json, evals/cases/**
