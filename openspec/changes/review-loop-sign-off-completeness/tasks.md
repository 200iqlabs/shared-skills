# Tasks

## 1. Steps 6.3 and 6.4 of `review-loop` (through `/skill-creator`, as CLAUDE.md requires)

- [x] 1.1 Step 6.3: `error.txt` holds the error text and nothing else. Remove the block that
      appends `log-tail.txt` to it, and say why the two files stay apart. Reword the run-log line
      so it no longer says the record carries the error text. Verify that no line of `SKILL.md`
      writes or appends anything but the error text to `error.txt`. Verified: the only writer is
      the file-writing tool in 6.3; the shell only reads it, in 6.4.
- [x] 1.2 Step 6.4 body assembly: give `error.txt` and `log-tail.txt` their own `[ -s ] && cat`
      tests, with a `printf '\n'` between them and a fixed line where the tail would be when
      `log-tail.txt` is absent or empty. NOERROR speaks of the error text alone. Persist
      `REPORT_MISSING` and `ERROR_MISSING` to `gate.env` instead of `BODY_INCOMPLETE`. Verify by
      running the block from `SKILL.md` in a scratch shell against every combination of report,
      error text and log tail present or absent, on `error` and on `clean`. Each case must give
      the body lines and flag values the spec's scenarios require. Verified on 24 combinations
      (report × error text × log tail present, unreadable or never captured × `error`/`clean`),
      with the 6.3 tail block and the 6.4 body block extracted verbatim. Every branch row matches
      the scenarios. On the base, NOERROR never fires once the tail block has run, and an error
      text without a final newline was glued to the first log line. The separator is
      `printf '\n\n'`, so a blank line survives that case.
- [x] 1.3 Step 6.4 reporting: replace the single "body was incomplete" warning with one for the
      run report and one for the error text. Update the list of values the reporting step reads
      and the comments naming the scratch files. Verify that `BODY_INCOMPLETE` no longer appears
      in `SKILL.md`. Verified with a search.

## 2. Evals

- [x] 2.1 New decision cases in `evals/cases/review-loop/`: 32 (error text missing, log present:
      NOERROR fires and the log tail follows it) and 33 (report missing, error text present: the
      session names the report and not the error text). Same format as 23–31: tag `tier-read`, a
      `tool_used: Skill` indicator, a deterministic `regex`, an `llm` rubric on the final message.
- [x] 2.2 Run 14 and 15 (the scratch copies handed over in the shared notes) and 32 and 33, 3 runs
      each, on this branch and on `origin/change/review-via-codex` as the base. Use
      `--ablation none --model claude-opus-5-5 --judge-model claude-haiku-5-5`. Done when every
      deterministic grader passes in every branch run of 15, 32 and 33, case 15 scores at least
      0.8, and case 14 scores no lower than its base.
      - **Done on 2026-10-10, two branch rounds.** Every deterministic grader passed in every
        branch run of 15, 32 and 33. Branch scores: 15 at 1.00 and 1.00, 32 at 1.00 and 1.00
        (base 0.67), 33 at 1.00 and 1.00 (base 1.00).
      - **Case 14 is level with its base: 0.89 and 0.78 on the branch, 0.89 on the base.** Its
        regex passes in every run on both sides. Every miss is the Haiku rubric, and every failed
        answer was read: each opens the record with the warning first, as the case requires.
      - **Also re-run as regression guards, because they touch the error path:** 9 (1.00, base
        0.75 on the paraphrased closing sentence) and 30 (1.00, base 1.00).
      - **Case 15 does not separate the versions.** The base answers quote the warning while
        explaining that it cannot fire. Case 32 is the one that does.
- [x] 2.3 `skills/review-loop/evals/README.md`: rows for 32 and 33, the re-run of 14 and 15 with
      branch and base scores, and the case-15 defect note marked fixed by this change.

## 3. Documentation and checks

- [x] 3.1 `CHANGELOG.md`: one entry under Fixed. Verify it names the visible effect (the warning
      now fires; the session warning names the right part).
- [x] 3.2 `openspec validate --all --strict`, `node hooks/selftest.mjs` and `claude plugin
      validate .` pass.
- [ ] 3.3 Open the pull request to `master` on `change/review-loop-sign-off-completeness`, with
      its dependency on pull request 22 stated. Do not merge.

## 4. After merge

- [ ] 4.1 Archive this change after `review-via-codex` is archived, and fold the modified
      requirement into `openspec/specs/code-review-loop/spec.md`.
