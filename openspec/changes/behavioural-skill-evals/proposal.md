# Behavioural skill evals as `claude plugin eval` cases

## Why

Four skills carry 38 behavioural cases in `skills/<skill>/evals/evals.json` (`review-fix` 9,
`review-loop` 22, `linkedin-content` 3, `prd` 4). Each case is a prompt and a prose
`expected_output`, with no assertion. They run only by hand through `/skill-creator`, and only a
person reading every transcript can tell a pass from a fail. Two of the four files have already
drifted without anyone noticing. The three `linkedin-content` cases ask for exactly what the
skill's description now excludes, since it became a brief-driven engine. The `prd` cases point at
`fixtures/…` files that were never committed.

Claude Code 2.1.292 ships `claude plugin eval`. It runs cases with checkable graders, a no-plugin
baseline arm, scaffolded workspaces and a cost ceiling. The `skill-evals-in-ci` change rejected it
for trigger accuracy and named it as the candidate for behavioural evals. On 2026-10-10 two of
the existing cases were run through it on `claude-opus-5-5`. Both graded cleanly and both
separated the skill from the no-plugin arm (Δ +0.50 and +1.00).

## What Changes

- **New suite in `evals/cases/`**, declared in `.claude-plugin/plugin.json` as
  `"experimental": { "evals": "evals/cases" }`, with one directory per skill. Run results go to
  `evals/cases/results/`, which is gitignored. `evals/harness/` is reserved for the fake
  command-line tools that later shell cases need. It sits outside the eval directory because
  the agent under test cannot read that directory.
- **Three tiers, named by what a case is granted.** `tier-read` cases get read-only tools, and
  sometimes read-only scaffolded files. `tier-write` cases may also write files. `tier-shell`
  cases get a shell and fake CLIs. The first two run anywhere, Windows included. Shell cases need
  the OS sandbox, so they run only on Linux or under WSL2. A case that describes a state partway
  through a run asks what the skill does there, without running anything. That makes it a
  decision case, whatever its tier.
- **Every case has at least one deterministic grader on its outcome** (`regex`, `file_exists`,
  `tool_used`). `llm` graders are limited to short targets with PASS/FAIL rubrics.
- **Migration, per skill:**
  - `prd`: all 4 cases become `tier-write` cases on scaffolded input. The fixtures are written,
    synthetic, from scratch, and they carry the exact strings the graders match. The expectation
    of case 2 is updated to the current two-path protocol. A fifth case covers the scope-cut
    rule, the skill's central rule, which no case tests today. It also brings the skill to the
    five prompts `skill-evaluation` requires.
  - `linkedin-content`: the 3 cases are converted to the by-name fallback mode, which reads a
    synthetic author profile. They gain 3 new brief-mode cases. The skill's primary contract has
    no case today. All 6 are `tier-read`.
  - `review-loop`: cases 4, 5 and the sign-off cases 6–15 become `tier-read` decision cases now.
    All of them survive `review-via-codex`. Cases 1–3 and 16–22 are **not migrated**, because
    `review-via-codex` (task 4.6) retires them. They stay in `evals.json` until that change
    deletes it.
  - `review-fix`: case 2 becomes a `tier-read` decision case with a read-only scaffold.
    `review-via-codex` removes comment fetching and in-thread replies (task 3.6), and with them
    the reply-based expectations of cases 1, 3, 4, 5 and 6. Its task 3.3 rewrites cases 7–9 for
    `P0`–`P3`. Cases 3 and 4 also check a judgement that survives the switch: no code change for
    a finding that is already outdated or wrong, and a reasoned rejection. No case in
    `review-via-codex` names that judgement. This is a coordination item, like the request that
    its new cases be written straight into this suite.
  - **If `review-via-codex` merges first**, this change migrates the review cases as that change
    left them: the kept ones and its new ones. The old ids are not migrated.
  - Every case that is not automated is listed in the skill's `evals/README.md`, with the reason.
- **One format per skill**, with one stated exception. A skill's `evals.json` is deleted once
  each of its cases is migrated, retired or listed as manual. The exception is cases that a named
  in-flight change retires or rewrites: they wait in `evals.json` until that change deletes them,
  and the skill's README says so. For skills with a suite, `CLAUDE.md`'s mandatory skill-creator
  workflow runs `claude plugin eval` in place of skill-creator's eval step.
- **Version comparison tool `tools/plugin-eval-compare.py`.** It runs the same cases against the
  branch and a base ref (`origin/master` by default) and prints the cases that flipped. That is
  the baseline the `review-loop` README actually asks for: the previous skill, not the absence of
  one.
- **CI: a `behaviour` job in `.github/workflows/skill-evals.yml`** (from `skill-evals-in-ci`).
  It runs on manual dispatch and, after a trial period, on the weekly schedule, and never on
  `pull_request`. It is not part of `skill-evals-gate` and is never a required check. It runs
  under a cost ceiling and publishes scores and costs only, never transcripts or judge evidence.
- **The shell tier is designed and spiked, not built.** The fake `gh` and the fake Codex runtime
  wait for `review-via-codex` to settle what `review-fix` and `review-loop` call. This change runs
  the two sandbox spikes they depend on and records the results.

## Capabilities

### New Capabilities
- `skill-behaviour-evals`: where behavioural cases live and in what format, the tiers and where
  each may run, grader rules, fixtures, how skills are loaded, baselines (the no-plugin arm and
  version comparison), the list of cases that are not automated, and how CI runs the suite
  without gating on it.

### Modified Capabilities
- `skill-evaluation`: *Skill passes skill-creator evaluation process* gains the plugin-eval path.
  For a skill whose cases live in the suite, "run the eval" means `claude plugin eval` over those
  cases. The with/without comparison is the no-plugin arm when a case is added. A change to an
  existing skill is compared with the skill's base revision instead. The eval artifacts are the
  run's `aggregate-result.json` and `report.html`, not a skill-creator workspace.

## Impact

- **New:** `evals/cases/**` (24 cases with fixtures), `evals/README.md`,
  `tools/plugin-eval-compare.py` and `tools/plugin-eval-summary.py` with tests, and a `behaviour`
  job in `skill-evals.yml`.
- **Changed:** `.claude-plugin/plugin.json` (the `experimental.evals` key passes
  `claude plugin validate`; verified), `.gitignore`, the evals READMEs of all four skills,
  `CLAUDE.md` (skill-creator workflow, step 3) and `CHANGELOG.md`.
- **Removed:** `evals.json` in `prd` and `linkedin-content`. `review-loop`'s file shrinks to the
  10 cases that `review-via-codex` retires, and `review-fix`'s to the 8 that it retires or
  rewrites. Both files go away with that change.
- **Depends on:** `skill-evals-in-ci` for the workflow, the secret and the pinned model. It is
  coordinated with `review-via-codex` for the scope of both review skills. See design, *Open
  Questions*.
- **Cost (measured 2026-10-10, CLI 2.1.292, `claude-opus-5-5`):** $0.36 per run of a
  `review-loop` decision case with the plugin and $0.08 without. A `prd` case costs $0.22 with
  and $0.16 without. Each judge-graded run adds about $0.004. Runs do not share a prompt cache, so
  three runs cost three times one. A full phase-1 run is about **$22** with `--ablation none` and
  about **$30** with the no-plugin arm (24 cases × 3 runs). The routine mix, with the no-plugin
  arm for `prd` and `linkedin-content` only, is about $27 a run. Weekly, that is about
  **$115 a month**. Design, *Cost*, has the table.
- **Out of scope:** trigger accuracy, which stays with `tools/skill-trigger-eval.py`. Building the
  shell tier, which is a follow-up after `review-via-codex`. Cases for the 18 skills that have
  none.
