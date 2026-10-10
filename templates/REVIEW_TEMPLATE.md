<!--
REVIEW.md template. Copy it to REVIEW.md in the repository root and adapt the sections marked
"adapt". Codex reads this file through the pointer in AGENTS.md (templates/AGENTS_REVIEW_POINTER.md);
the ss review skills (`review-fix`, `review-loop`) also read the two machine-read lines at the end.
Delete this comment once the file is yours.
-->

# Review policy

Read this before reviewing a change in this repository, and follow it.

## Three passes

Review every change in three passes, and report what each one finds:

1. **Bugs.** Code that does not do what its name, its docstring, its tests or the change's design
   says it does. Edge cases the change introduces: empty input, the first and the last item, a
   failed call, a retry, a concurrent caller.
2. **Security.** Secrets in code, configuration or logs; untrusted input reaching a shell, a query,
   a path or a template; personal data written somewhere it should not go; a permission check that
   a new path skips.
3. **Compliance.** The change against its own intent. When the branch carries an OpenSpec change,
   read `openspec/changes/<change>/proposal.md`, `design.md` and `specs/` and report where the code
   does something the design rejects or leaves out something a requirement asks for. Then the
   change against the repository rules below.

## Severity

Tag every finding `P0`–`P3`:

- `P0` — breaks the product, loses data or opens a hole; nothing ships with it.
- `P1` — wrong behaviour a user will meet; fix before merging.
- `P2` — wrong behaviour in a narrower case, or a gap a requirement names; fix in this change.
- `P3` — worth fixing, harmless if it waits.

The findings on the `Important:` line below are the ones that start another review round.

## Minor findings

Report at most five findings below the importance line per review — the five that matter most.
Do not report what a formatter or a linter settles, and do not restate a finding in other words.

## Earlier decisions

Before raising a finding, read `openspec/changes/*/review.md`. A finding recorded there as
`rejected` was judged and declined with a reason. Do not raise it again unless the code it names
has changed since that decision; if it has, say what changed.

## Repository rules (adapt)

<!-- Rules a reviewer could not infer from the code alone, one line each, for example:
- Amounts of money are integers in the smallest currency unit, never floats.
- Every public endpoint checks the caller's organisation before it reads anything.
-->

## Checks (adapt)

<!-- The commands that verify a change here. The fixer runs them after every round. For example:
- `npm test`
- `npm run typecheck`
-->

## Machine-read lines

The review skills read the two lines below exactly as written: `Important:` takes one tag or a
range (`P0-P1`, `P0-P2`); `Test paths:` takes comma-separated globs, where a glob without a `/`
matches a file name anywhere. Existing files on those paths may change in a review round only with
a reason recorded in `review.md`. Without these lines the skills use the values shown.

Important: P0-P2
Test paths: **/test/**, **/tests/**, **/__tests__/**, *.test.*, *.spec.*, test_*.py, *_test.py, *_test.go
