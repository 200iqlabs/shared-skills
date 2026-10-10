# Tasks

## 1. Facts the skill text depends on (before any `SKILL.md` is touched)

- [x] 1.1 Run the built-in review (`codex-companion.mjs review --base <ref> --json`) on a branch
      whose diff has no defect; keep the raw payload in a scratch directory and fill the "clean"
      row of the recognition table in `design.md` decision 2 with its exact shape. Done when the
      row quotes real output, not an assumption.
- [x] 1.2 In a scratch repository, plant one defect, write `REVIEW.md` (with a rule Codex would
      not follow by default, e.g. reply language) and an `AGENTS.md` pointer to it and to a
      `review.md` that rejects the planted finding with a reason. Review with and without the
      pointer. Record in `design.md` decision 6 whether Codex applied the policy and whether it
      raised the rejected finding again; if it ignored the pointer, switch the templates to the
      inline variant before group 2.
- [x] 1.3 Add a `review.md` to a scratch change and run `openspec validate --strict`; confirm the
      extra file is accepted and that `openspec archive` keeps it. Record the result in decision 5.
- [x] 1.4 Time the built-in review on a large diff (a past multi-file pull request of this
      repository, `--base` its merge base). Record the seconds in decision 4; if a review can come
      near the 600 s cap, adopt the background path there before group 3.

## 2. Templates and this repository's own policy

- [ ] 2.1 `templates/REVIEW_TEMPLATE.md`: the three passes, the minor-finding cap, and the
      machine-read `Important:` and `Test paths:` lines in the form decision 6 fixes. Verify the
      two lines parse with the pattern the skills will use, and that a file without them falls
      back to the defaults.
- [ ] 2.2 `templates/AGENTS_REVIEW_POINTER.md` (or the inline variant, per 1.2): the pointer to
      `REVIEW.md` and to `openspec/changes/*/review.md`. Verify against the scratch repository
      from 1.2 that a review run with it behaves as 1.2 recorded.
- [ ] 2.3 This repository's own `REVIEW.md` and `AGENTS.md`, from the templates, naming its checks
      (`node hooks/selftest.mjs`, `openspec validate --all`). Verify a built-in review on a scratch
      branch here cites a rule from `REVIEW.md`.

## 3. `review-fix` (through `/skill-creator`, as `CLAUDE.md` requires)

Every behavioural case named in groups 3 and 4 is a `claude plugin eval` case under
`evals/cases/<skill>/`, in the format of `behavioural-skill-evals` (design decision 10), not an
entry in `evals.json`. "Eval" below means such a case.

- [ ] 3.1 Pre-flight: resolve the plugin from `installed_plugins.json`, run `setup --json`, detect
      the pull request and fetch its base, warn once on a missing `AGENTS.md` pointer. Behavioural
      evals: plugin missing, Codex not signed in, pointer missing — each stops or warns as the
      first ADDED requirement says, with nothing edited.
- [ ] 3.2 Run the review and parse it per decision 2: entries, path normalisation, the strict
      recognition table, the background path if 1.4 required it. Evals: usage limit exhausted,
      unparseable findings block, genuinely clean review.
- [ ] 3.3 Judge findings as fix / reject / repeated against `review.md`, ordered `P0`–`P3` or by
      the policy's scale, with the stable-sort rules kept. Rewrite evals 7–9 for findings (they keep
      their ids, so `behavioural-skill-evals` can map them); add an eval where a finding repeats a
      rejection, and two for a **first** rejection, which old evals 3 and 4 checked through replies:
      a finding about code the branch no longer has, and a finding that contradicts the change's
      design. Both end with no code change and a `rejected: <reason>` row.
- [ ] 3.4 Append the round to `review.md` (decision 5 format, checks line included) and commit it
      with the round, a record-only round included; push only when the branch has a pull request.
      Evals: a round that fixed nothing still commits its record; a run without a change says no
      record was written.
- [ ] 3.5 Test guard per decision 8, before the commit. Evals: an edited assertion without a
      reason ends as `error` with nothing committed; a reasoned test change commits; a new test
      commits.
- [ ] 3.6 Remove comment fetching (suppressed comments included) and in-thread replies; turn step
      3 into "an opinion only goes to `/codex:review`"; summary table with outcomes and convention
      candidates. Verify `SKILL.md` no longer mentions `pulls/{pr}/comments` or `/replies`, and add
      an eval for an opinion-only request.
- [ ] 3.7 Rewrite the description and `trigger-eval.json`; measure with
      `python tools/skill-trigger-eval.py --runs 3 --model claude-opus-5`. Done at ≥ 80%, with the
      number and the variants tried written into `evals/README.md`.

## 4. `review-loop` (through `/skill-creator`)

- [ ] 4.1 Pre-flight: drop the Copilot baseline and history checks (1.3, 1.3a); add Codex readiness
      and a clean working tree; keep the change-directory check, the repetition check (1.3b),
      resume and the `.gitignore` warning. Evals: dirty working tree, plugin missing.
- [ ] 4.2 Iteration: the sub-agent prompt reads the change artifacts and `REVIEW.md`, invokes
      `review-fix`, and returns the line from decision 4; keep the normalisation of the string
      `"null"`. Eval: a return line with `"null"` strings parses to real nulls.
- [ ] 4.3 Stop rule per decision 7 and the importance line; delete steps 4–5, `ScheduleWakeup`, and
      the `--wait-initial`, `--poll-interval` and `--poll-timeout` flags. Verify `SKILL.md` no
      longer mentions `requested_reviewers`, `ScheduleWakeup` or `gh run list`. Evals: minor-only
      ends without another review; a fixed `P1` starts one; all important findings rejected ends as
      `no-fixes`; a policy line of `P0-P1` stops after a `P2`-only round.
- [ ] 4.4 Report: new reasons in 6.2–6.3, the convention-candidate section, step 6.4 untouched
      beyond the follow-up text. Re-run the sign-off evals 6–15 unchanged; all must pass.
- [ ] 4.5 Rewrite the error-handling table and the guardrails: no Copilot rows; one row per Codex
      failure path. Verify every termination reason in decision 7 has a row.
- [ ] 4.6 Retire `review-loop` evals 1–3 and 16–22 (Copilot availability, timeout, run check) and
      `review-fix` evals 1 and 3–9 from `evals.json` (7–9 now live in `evals/cases/`). Add the new
      `review-loop` evals: plugin missing, usage limit mid-run, minor-only, a rejection met again in
      a later run, dirty working tree. Keep `review-loop` 4–5 and 6–15 and `review-fix` 2 in
      `evals.json` for `behavioural-skill-evals` group 5 to migrate (its design D11), renaming the
      reason `no-comments` to `clean` where they name it. Run the new evals with
      `claude plugin eval` against the branch (three runs) and against `origin/master` (one run,
      from a worktree of the base with the cases copied in, as that change's D7 describes). Run the
      kept 4–15 against both as the same kind of decision case, from scratch copies that are not
      committed and are handed to `behavioural-skill-evals` through the shared notes. Record the
      split, the scores and the cost in both skills' `evals/README.md`.
- [ ] 4.7 Rewrite the description ("Claude–Codex") and `trigger-eval.json`; measure as in 3.7.
      Done at ≥ 80%, recorded in `evals/README.md`.

## 5. Documentation and integration

- [ ] 5.1 `README.md`: both skill rows, a Codex prerequisite section naming the plugin version the
      skills were verified against, and the note that Copilot's automatic review keeps posting
      where it is switched on. Verify the rows match the new descriptions.
- [ ] 5.2 `hooks/rules/50-shipping.md` step 4: `review-fix` is a single Codex pass, not a pass over
      comments already left. Verify `node hooks/selftest.mjs` passes.
- [ ] 5.3 `CHANGELOG.md`: a **BREAKING** entry (Copilot removed, Codex plugin required, new record
      and policy files). Verify `claude plugin validate .` passes, as `plugin-validate.yml` does in
      CI.
- [ ] 5.4 First real run, before merging: `/ss:review-loop <PR> review-via-codex` on this change's
      own pull request, from a session started in this worktree with
      `claude --plugin-dir <worktree>`. `claude plugin update ss@shared-skills` cannot serve here:
      it installs the published `master`, which does not carry the new skills until this pull
      request merges. A `--plugin-dir` copy of `ss` takes precedence over the installed one
      (probe of 2026-10-10: a copy with a marked `review-loop` loaded through `--plugin-dir`, and
      `Skill(ss:review-loop)` returned the marked text), so the run and its sub-agents use the
      branch's skills. Done when it ends with one of the new termination reasons, this change's
      `review.md` holds its rounds, and a sign-off issue exists. After the merge, the same command
      from an updated install is the manual smoke test, not part of this task.
- [ ] 5.5 After merging, archive this change and rewrite the Purpose of
      `openspec/specs/code-review-loop/spec.md`, which still speaks of waiting for a reviewer that
      may never answer. Verify `openspec validate --all` passes.
