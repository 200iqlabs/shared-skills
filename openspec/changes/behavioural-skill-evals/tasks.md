# Tasks

## 1. Suite skeleton and the two sandbox spikes

- [ ] 1.1 Add `"experimental": { "evals": "evals/cases" }` to `.claude-plugin/plugin.json`. Create
  `evals/cases/` and add `evals/cases/results/` to `.gitignore`. Verify that
  `claude plugin validate .` reports no new warning, that `claude plugin eval . --case 'none-*'`
  prints `Using eval directory evals/cases/`, and that the `plugin-validate` workflow passes on
  Linux and Windows.
- [ ] 1.2 **Spike S1 (WSL2 Ubuntu or a throwaway Linux CI job; needs Claude Code and a
  credential there).** Write one throwaway `tier-shell` case in a scratch copy of the plugin, with
  `--allow-tools "Bash(*)"`. In it, a script on `PATH` outside `$HOME` prints a marker, `mktemp -d`
  writes a file under `$TMPDIR`, and the case tries to read a file under the real `$HOME`. Record
  in design D9 which of the three succeeded, with the run's output quoted, and whether a harness
  under the checkout is reachable or must be copied (for example to `/opt/ss-eval/bin`). Verify
  that D9 quotes observed output, not expectations.
- [ ] 1.3 **Spike S2 (same environment).** Have the scaffold write
  `$HOME/.claude/plugins/installed_plugins.json`, with a `codex@openai-codex` entry pointing at a
  fake `scripts/codex-companion.mjs` that also lives under the run's `HOME`. Record whether the
  agent's `Read` and `Bash` can read the install record and run the script. Write the answer into
  D9, and pass it to the owner for `review-via-codex` decision 1 (an `EVAL_*` override is needed
  if neither can). Verify that D9 states the answer and the date.

## 2. Run summary: lost runs and the sanitised output (`tools/plugin-eval-summary.py`)

- [ ] 2.1 Implement loading `aggregate-result.json` and classifying each run as lost or counted,
  per design D8. Lost: usage or rate limit, authentication, overloaded or 5xx API, transport,
  wall-clock timeout, and `skippedPaidGraders`. Counted: everything else, including `max_turns`.
  Recompute each case score over its counted runs, and mark the suite inconclusive on any lost run
  or on `partial: true`. Verify with `tests/test_plugin_eval_summary.py`, which uses synthetic
  documents: a rate-limit error is lost, a turn-cap error is counted, a run with
  `skippedPaidGraders` is lost, `partial: true` makes the suite inconclusive, and one case's score
  is recomputed without its lost run.
- [ ] 2.2 Emit two outputs: a Markdown table (case, score, Δ, lost runs, cost, names of failing
  graders) and a sanitised JSON that carries no `explanation`, `evidence`, `prompt` or trace path
  at any depth. Verify with a test that walks the sanitised JSON for those keys. Also run the tool
  on a real `aggregate-result.json` from a local run and check that the table matches the CLI's
  summary table.
- [ ] 2.3 Document the tool in `tools/README.md` (input, both outputs, the lost/counted rule).
  Verify that the documented command runs as written.

## 3. `prd`: five `tier-write` cases

- [ ] 3.1 Write synthetic fixtures under each case directory: `mentormatch` (Track Tech),
  `klasa` (non-technical founder, Lovable, Track Builder), `thin` (two lines),
  `mikrobiota-split` (`icp.md`, `positioning.md`, `gtm-plan.md`, `landing-brief.md` with a Brand
  section: `#0E7C66`, `#E8B04B`, Source Sans 3, voice "Masz kontrolę") and `scope-cut` (a
  complete input whose founder lists booking, payments and chat as must-have). Each input carries
  one landing-page sentence that the PRD must reproduce verbatim. No real person, company or
  client appears. Verify that each string a grader matches occurs exactly once in its fixtures
  (`grep -c`).
- [ ] 3.2 Write the five cases from the design's `prd` table (old 0–3 and the new case 4). Each
  gets frontmatter `name: prd-<id>-<slug>`, tags `[prd, tier-write]` (`smoke` on case 2), and the
  prompt starting with `/ss:prd`. Each gets a `case.yaml` with a `scaffold.sh` that copies
  `$(dirname "$0")/fixtures/.` and fails on a missing file, plus graders as listed. Every grader on
  `prd.md` is a `regex` or `file_exists`, the one-user-story check included (design D5). Verify
  that `claude plugin eval . --case 'prd-*' --tag tier-write --scaffold --allow-tools Write Edit
  --runs 1 --ablation none --model claude-opus-5-5 --judge-model claude-haiku-5-5` loads all five
  cases without a load error and that every grader prints a verdict. Also check the
  one-user-story pattern against two hand-written `prd.md` samples, one with one story in §3 and
  one with two.
- [ ] 3.3 Calibrate. Run the same command with `--runs 3 --ablation with-without`, then summarise
  it with the tool from group 2. Loosen any pattern that failed on output a person judges
  correct. Rewrite any case whose no-plugin arm reaches 0.8. Create `skills/prd/evals/README.md`
  with the old-id mapping, the per-case WITH/W/OUT/Δ, the cost, the model, the judge and the
  Claude Code version. Verify that the README table is complete and that every case below 0.8
  WITH, or at or above 0.8 W/OUT, has a written reason.
- [ ] 3.4 Delete `skills/prd/evals/evals.json`. Verify that `git ls-files skills/prd/evals` lists
  only `README.md`, and that the README maps ids 0–3 and names case 4 as new.
- [ ] 3.5 Write `evals/README.md`. It covers what the suite is, the three tiers and where each
  runs, and the local commands (`tier-read`; `tier-write` with `--scaffold --allow-tools Write
  Edit`), each with `--eval-dir evals/cases` and the pinned models. It explains how to add a case
  (name prefix, tags, at least one deterministic grader, fixtures beside the case), carries the
  cost table, and links to each skill's README. Verify that the `tier-write` command runs as
  written on Windows with `--tag smoke`. The `tier-read` command is verified in 4.3.

## 4. `linkedin-content`: six `tier-read` cases

- [ ] 4.1 Write the fixtures. One is a fictional `context/author-profile.md` (persona, audience,
  two unusual hashtags, one example post). The others are three briefs in the skill's contract
  shape (channel, thesis with grounds, constraints, result contract): one with a ground to quote
  verbatim, one with a thesis marked as having no ground, and one whose contract asks for an item
  the brief does not supply. Verify that each matched string occurs exactly once (`grep -c`) and
  that the profile names no real person.
- [ ] 4.2 Write the six cases from the design's `linkedin-content` table. Each gets
  `name: linkedin-content-<id>-<slug>` and tags `[linkedin-content, tier-read]`. The prompt starts
  with `/ss:linkedin-content`, followed by the note, the post to rewrite, or the brief. The
  read-only scaffold copies the profile. Verify that `claude plugin eval . --case
  'linkedin-content-*' --tag tier-read --scaffold --runs 1 --ablation none` (pinned models) loads
  all six and every grader prints a verdict.
- [ ] 4.3 Calibrate as in 3.3. Create `skills/linkedin-content/evals/README.md` with the mapping
  (old 1–3 to the fallback cases), the scores and cost. Note that the old "w stylu Pawła"
  expectation is dropped and why. Link the README from `evals/README.md`. Verify that the README
  is complete, as in 3.3, and that the `tier-read` command in `evals/README.md` runs as written
  with `--tag smoke`.
- [ ] 4.4 Delete `skills/linkedin-content/evals/evals.json`. Verify that `git ls-files` lists only
  `README.md` in that directory.

## 5. `review-loop` and `review-fix`: decision cases

Which cases this group migrates depends on the merge order (design D11). Before starting, check
whether `review-via-codex` has merged: its pull request is merged, or `origin/master` no longer
mentions `requested_reviewers` in `skills/review-loop/SKILL.md`.

- [ ] 5.1 Write the `review-loop` cases as decision cases. **If `review-via-codex` has not
  merged:** the twelve from the design's table (4, 5, 6–15). **If it has:** every case in
  `review-loop`'s `evals.json` at that point, kept and new alike, with graders written by the same
  rules. Each prompt names `ss:review-loop` in prose, states the run's state, asks what the skill
  does, and says not to run any command. Each case gets `allowed_tools: [Skill, Read, Glob,
  Grep]`, a `tool_used: Skill` indicator, at least one deterministic grader on the answer, and,
  for the sign-off cases, graders that match only step 6.4 strings. Case 4 gets a read-only
  scaffold of `openspec/changes/` with an archived near-name. Verify that a `--runs 1` run with
  `--case 'review-loop-*' --tag tier-read` loads every case written and that the indicator fires
  in each with-arm run.
- [ ] 5.2 Write the `review-fix` cases the same way. **If `review-via-codex` has not merged:**
  case 2, with a read-only scaffold (`hooks/selftest.mjs`, `openspec/`, no `package.json`).
  **If it has:** every case in its `evals.json` at that point. A case that needs the shell tier is
  written, tagged `tier-shell` and excluded from runs until group-1 spikes and the follow-up
  harness exist. Verify as in 5.1 for the `tier-read` cases.
- [ ] 5.3 Calibrate both skills once with the no-plugin arm. Rewrite any case whose no-plugin
  arm reaches 0.8, or record in the README why it is kept as it is, as in 3.3. Record
  WITH/W/OUT/Δ and cost in their `evals/README.md`. Replace the "Running the behavioural evals"
  section with the plugin-eval commands and add the mapping table, in which every old id falls
  into exactly one group: migrated, retired by `review-via-codex` (with its task number),
  rewritten by `review-via-codex` (with its task number), or shell variant pending. Name the
  coordination item for `review-fix` 3 and 4 (design D11) in that README. Verify that every id in
  the old files appears in exactly one group, and that every case at or above 0.8 W/OUT has been
  rewritten or carries its reason.
- [ ] 5.4 **If `review-via-codex` has not merged:** remove the migrated ids from both
  `evals.json` files. `review-loop` keeps 1–3 and 16–22, and `review-fix` keeps 1 and 3–9. Verify
  that both files parse and hold exactly the ids the README lists as retired or rewritten by
  `review-via-codex`. **If it has merged:** delete both files, and verify that
  `git ls-files skills/review-loop/evals skills/review-fix/evals` lists no `evals.json`.

## 6. Version comparison (`tools/plugin-eval-compare.py`)

- [ ] 6.1 Implement the pure part: load two sanitised summaries (from group 2) and list each case
  with its base score, branch score and flip, plus cases present on one side only and lost runs.
  Verify with `tests/test_plugin_eval_compare.py` on synthetic summaries: a pass that becomes a
  fail, a new case, and a case whose only failure is a lost run (not a flip).
- [ ] 6.2 Implement the runner per design D7. It adds a detached worktree at `--base` (default
  `origin/master`), copies the branch's `evals/cases/` into it, sets the manifest key there, runs
  each selected tier on both sides with identical flags and `--ablation none --json`, and removes
  the worktree in a `finally`. Verify that `--base HEAD --case 'prd-2-*' --tag tier-write
  --runs 1` reports no flip, and that `git worktree list` shows no leftover afterwards, also
  after an interrupted run.
- [ ] 6.3 Document the tool in `tools/README.md` and in `evals/README.md` ("before merging a
  change to a skill with cases"). Verify that the documented command runs as written.

## 7. Workflow rule and changelog

- [ ] 7.1 Update `CLAUDE.md`, "Creating or Modifying Skills". For a skill with cases in
  `evals/cases/`, step 3 is `claude plugin eval` over its cases plus the comparison from group 6,
  and new cases go into the suite, not into `evals.json`. Verify that the paragraph names both
  commands and that `openspec validate behavioural-skill-evals --strict` passes.
- [ ] 7.2 Add a `CHANGELOG.md` entry naming the suite, the manifest key, the removed `evals.json`
  files, the two tools and the measured cost. Verify that `claude plugin validate .` passes.

## 8. CI: `behaviour` job in `skill-evals.yml` (after `skill-evals-in-ci` has merged)

- [ ] 8.1 Add the job per design D10. It takes `workflow_dispatch` inputs `suite`
  (`triggers`/`behaviour`/`both`), `skill` (a case-name glob) and `ablation`, and its `if:`
  excludes `pull_request`. It installs the Claude Code version `surface` resolved, puts the key in
  one step's `env`, and runs one invocation per tier with `--json`, `--trust-plugin`,
  `--scaffold`, `--no-publish`, `--threshold 0.8`, `-j 4`, `--max-cost-usd` and the pinned
  models. It writes the summary tool's Markdown to the step summary and uploads only the sanitised
  JSON. `skill-evals-gate` does not need it. Verify with `actionlint` passing, with
  `grep -E "pull_request_target|workflow_run"` finding nothing, and with a dispatch on a branch
  (`suite=behaviour`, `skill=prd-*`) whose summary shows the table and whose artifact has no
  `evidence` or `explanation` key.
- [ ] 8.2 Trial: dispatch the whole suite on `master` two to four times. Record the cost and
  duration per run, and the cases whose score moved between runs, in `evals/README.md`. Verify
  that the README carries the run links.
- [ ] 8.3 **Owner:** decide on the weekly schedule, based on the measured cost from 8.2. If no,
  the job stays dispatch-only, and the decision with its date goes into `evals/README.md`. If yes,
  let the scheduled event run `suite=both`. Verify that the next scheduled run executes the
  `behaviour` job and that the gate's result is unaffected by it.

## 9. Integration check

- [ ] 9.1 From a clean checkout on Windows, run the two commands from `evals/README.md` over the
  whole suite (`--runs 1`). Verify that every `tier-read` and `tier-write` case loads (24 if
  `review-via-codex` had not merged before group 5), that none is refused, that `git status`
  shows nothing under `evals/cases/results/`, and that
  `openspec validate behavioural-skill-evals --strict` and `claude plugin validate .` both pass.
