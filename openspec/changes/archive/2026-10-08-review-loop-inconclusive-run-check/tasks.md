# Tasks

## 1. Step 5.3 of `review-loop`

- [x] 1.1 Start every visit from `timeout_outcome = "unknown"` and
      `inconclusive_reason = "unclassified"`, set before the listing is read.
- [x] 1.2 Conclude `no-run` only from a listing that succeeded (exit 0, JSON array) and holds no
      run at all before any name, sha or time test — immediately, without extensions.
- [x] 1.3 Route an empty identification result to the inconclusive case: `no-match`, or
      `listing-truncated` when the listing holds as many runs as `--limit` asked for.
- [x] 1.4 Turn the `workflow-not-found` exception from `no-run` into the inconclusive case.
- [x] 1.5 Inconclusive extends from the shared `poll_extensions` budget; at the cap it ends as
      `timeout_outcome = "unknown"`. Log the extension and the timeout with the reason.
- [x] 1.6 Decide "still running" — and the completion grace — over every review run on the sha,
      the created-at bound not applied; read the terminal diagnosis from the newest run this request
      started, only when nothing on the sha is unfinished; guard every set condition against an
      empty set, and make the grace and the endings a strict complement at 90s.
- [x] 1.8 A state that reaches the inconclusive case with a run in `matching` keeps
      `unclassified`, so a defect in the step is reported as one rather than as a missing match.
- [x] 1.7 Keep every identification condition as it was — none added, none tightened.

## 2. Report and reference

- [x] 2.1 Step 6.3: an `unknown` line ("check manually") with one sentence per reason; the
      `no-run` line says the listing came back complete and empty.
- [x] 2.2 Error-handling table: `no-run` row narrowed to the empty listing, a new row for the
      inconclusive state, the unfinished-run and failed-listing rows updated.
- [x] 2.3 `--poll-timeout`: 5.3 also extends while it cannot tell whether a run exists.
- [x] 2.4 Quote the frontmatter `description`, text unchanged. Unquoted, its `: ` made the YAML
      fail to parse — on `origin/master` too — so the skill loaded with empty metadata and
      `claude plugin validate` failed.

## 3. Evals

- [x] 3.1 `review-loop` 16 (runs exist, none for the sha), 17 (empty listing is `no-run`), 18
      (workflow not found), 19 (truncated listing), 20 (an older run still in progress), 21 (failed
      command is not an empty listing), 22 (the push-started run, older than the created-at bound,
      still in progress).
- [x] 3.2 `skills/review-loop/evals/README.md`: the new group and how to run the behavioural evals.
- [x] 3.3 Run evals 16–22 against this branch and against `origin/master` as the baseline — run
      on 2026-10-08 against `57eb68d`: **7/7 pass on the branch**; on the baseline 16, 18, 19, 20 and
      22 fail and 17 and 21 pass, the split `evals/README.md` predicts. 14 isolated runs, each given
      only a copy of one version's `SKILL.md` under a neutral name and the case prompt; graded twice,
      once by a grader blind to the version, with all 14 grades agreeing.
- [x] 3.4 The `run-unfinished` report line names a run on `<sha>`, not "for this review request": at
      the cap the run comes from every review run on the sha, which may be the push-started one
      outside `matching` (found by the eval run, case 22).

## 4. Open in review

- [x] 4.1 Review by the plugin owner on the pull request, then merge — merged on 2026-10-08 as
      `1e5842f` after three Copilot rounds, the last with no findings. `claude plugin update
      ss@shared-skills` and a session restart are each user's own step.
- [x] 4.2 After merging, archive this change and fold its requirements into
      `openspec/specs/code-review-loop/spec.md`; widen that spec's Purpose, which today speaks only
      of how the loop ends.
