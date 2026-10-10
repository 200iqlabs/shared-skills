# Design

## Context

See `proposal.md` for the motivation. The state that shapes the approach:

- **The cases today.** `evals.json` holds a prompt and a prose `expected_output` per case:
  `review-fix` 9, `review-loop` 22, `linkedin-content` 3, `prd` 4. They are run through
  `/skill-creator`, which runs each prompt with and without the skill and leaves grading to a
  person. `claude plugin eval` reads neither `evals.json` nor `trigger-eval.json`, and
  skill-creator does not read plugin-eval cases.
- **Two files are stale.** `linkedin-content` became a brief-driven engine whose description says
  *"Do NOT trigger on a bare request to write a LinkedIn post … brainstorm post ideas"*. All three
  of its cases are bare requests, and their expectation is "w stylu Pawła", which is private data
  this public repository cannot carry. The `prd` cases name `fixtures/mentormatch/…`,
  `fixtures/klasa/…`, `fixtures/thin/…` and `fixtures/mikrobiota-split/…`. None of these exist,
  and `git log --all` shows they were never committed. Case 2's expectation (ask one or two
  questions) also predates the current protocol, which first names the gaps and then offers two
  paths.
- **`review-via-codex` (in flight, not merged) is BREAKING for both review skills.** Its task
  4.6 retires `review-loop` cases 1–3 and 16–22 (Copilot availability, timeout, run check) and
  keeps 4–5 and 6–15. Its task 4.4 re-runs the sign-off cases 6–15 *unchanged*. Its tasks
  3.3–3.6 remove comment fetching and in-thread replies from `review-fix`, which retires cases 1,
  5 and 6. They also rewrite 3–4 as rejections and 7–9 for the `P0`–`P3` scale. Case 2 survives.
  Its pre-flight resolves the Codex runtime through `~/.claude/plugins/installed_plugins.json`.
- **The tool, as observed on 2026-10-10 (CLI 2.1.292, Windows 11, `claude-opus-5-5`):**
  - A copy of this plugin under the scratchpad ran two cases from `evals.json`, rewritten as
    plugin-eval cases. `review-loop` #16 scored 1.00 with the plugin and 0.00 without (Δ +1.00).
    `prd` #2 scored 1.00 and 0.50 (Δ +0.50). Every grader type used (`regex`, `llm`,
    `tool_used`, `file_exists` with `arm: both`) behaved as documented.
  - **A slash command loads the skill without a `Skill` tool call.** With `/ss:prd` in the
    prompt, the with-arm followed the skill (it quoted its "Ścieżka 1 / Ścieżka 2" protocol), yet
    `tool_used: Skill` counted 0 calls. A prompt naming the skill in prose ("Korzystam ze skilla
    ss:review-loop") produced one `Skill` call.
  - A scaffold script ran on Windows (Git Bash). `$0` is the script's own path inside the case
    directory, so a scaffold can copy fixtures that sit beside it.
  - `"experimental": { "evals": "evals/cases" }` passes `claude plugin validate`. The only warning
    is the missing `version`, which the repository has today. `claude plugin eval` reports
    `Using eval directory evals/cases/ from …plugin.json`.
  - Runs share no prompt cache. Three consecutive runs of one case cost $0.362, $0.361 and $0.354.
    Each run has its own workspace and `HOME`, so its prompt prefix is written afresh. That makes
    the cost per run flat, unlike the trigger runner, whose warm runs cost a third of a cold one.
  - `--case` matches the case name, not its path, and combines with `--tag` as AND: `--case
    'prd-*' --tag tier-write` found nothing for an untagged case named `prd-2-…`.
  - A `Bash` grant on native Windows is refused, because there is no sandbox backend. WSL2 Ubuntu
    is present on the maintainer's machine, and CI is Linux.

## Goals / Non-Goals

**Goals:**
- Every behavioural expectation becomes a score that is reproducible from the command line, or
  is named in a README with the reason it is not one.
- `tier-read` and `tier-write` cases run on the maintainer's Windows machine with no extra setup.
- Comparing a skill change with its base revision takes one command.

**Non-Goals:**
- Trigger accuracy. `tools/skill-trigger-eval.py` keeps it. A behavioural case loads its skill
  deterministically, so it says nothing about triggering.
- Building the shell tier (fake `gh`, fake Codex runtime). It is designed here, and its two
  prerequisite spikes run here. Its build waits for `review-via-codex` to fix what the review
  skills call.
- A merge gate on behaviour. Per-case scores from three runs with an LLM judge are too noisy to
  block on before calibration data exists.

## Decisions

### D1. `claude plugin eval` for behaviour, although it was rejected for triggers

`skill-evals-in-ci` D1 rejected the native tool for trigger accuracy for four reasons. It has no
set accuracy, it counts lost runs as zero, it hides the `Skill` grader in two-arm runs, and it
would have broken the existing baselines. For behaviour, three of the four reasons fall away.
Behavioural cases are independent, so a per-case threshold is the right unit. The `Skill` grader
is only an indicator here (D4). The prose cases have no baseline numbers to break. The fourth
reason, lost runs, is handled outside the tool (D8).

What the tool adds is exactly what `evals.json` lacks: graders that pass or fail without a person
reading the transcript, a no-plugin arm, scaffolded workspaces, a cost ceiling and a JSON result.

*Alternative:* extending `skill-creator`'s format with assertions. That would mean a second
runner to maintain, which `skill-evals-in-ci` already declined to build for triggers. Its
optimiser also cannot run on Windows (`select` on a pipe, see `review-fix/evals/README.md`).

### D2. Layout: `evals/cases/` named in the manifest, per-skill subdirectories

```
.claude-plugin/plugin.json        "experimental": { "evals": "evals/cases" }
evals/
  README.md                       how to run, tiers, costs, index of skills
  cases/                          the eval directory; the agent under test cannot read it
    prd/0-track-tech-eight-sections/
      prompt.md                   frontmatter: tags, limits, allowed_tools; body: the prompt
      case.yaml                   context.scaffold_script (only where a scaffold is needed)
      scaffold.sh
      fixtures/...                copied into the workspace by scaffold.sh
      graders/*.md
    linkedin-content/...
    review-loop/...
    review-fix/...
    results/                      gitignored
  harness/                        phase 2: fake gh, fake Codex runtime (agent-readable)
skills/<skill>/evals/
  README.md                       mapping old id -> case dir | retired by | manual because
  trigger-eval.json               unchanged; read by tools/skill-trigger-eval.py
```

**Why not the default `evals/`.** The fake CLIs of the shell tier have to be executable by
the agent's sandboxed shell. The eval directory is hidden from the agent. Putting the cases one
level down leaves `evals/harness/` beside them, readable, under one umbrella. The manifest key
makes `claude plugin eval .` work without a flag. Every documented command also passes
`--eval-dir evals/cases`, which is harmless when the key is honoured and keeps working if the
experimental key is renamed.

**Why not inside `skills/<skill>/evals/`.** The eval directory is one directory. Pointing it at
`skills/` would hide every skill's `references/` from the agent under test, and any `prompt.md`
anywhere under a skill would load as a case.

**Case names.** Each case sets `name: <skill>-<old id>-<slug>` in its frontmatter
(`review-loop-12-failed-append-names-the-open-issue`), inside a directory named
`<skill>/<old id>-<slug>`. The name matters because `--case` filters on the case name, not the
path, and `--tag` matches any of its tags (OR). "One skill in one tier" is therefore
`--case 'review-loop-*' --tag tier-read`. The old id keeps the README mapping and `git log`
traceable across the migration. Tags on every case: the skill name, one tier tag (D3), and
`smoke` on one cheap case per skill.

### D3. Three tiers by grant, run as separate invocations

| Tier | What the case gets | Grants | Runs on |
|---|---|---|---|
| `tier-read` | A prompt, sometimes read-only scaffolded files; the result is the final message | none (`Skill`, `Read`, `Glob`, `Grep`) | anywhere |
| `tier-write` | Scaffolded input files; it may write its output | `--allow-tools Write Edit` | anywhere |
| `tier-shell` | A scaffolded git repository, fake CLIs on `PATH` | `Bash(...)`, `Write`, `Edit` | Linux or WSL2 only |

The tiers are named by grant because the grant decides the two things that matter
operationally. An `--allow-tools` grant applies to every case in an invocation, so a read case run
together with write cases would also hold `Write`. And a shell grant needs the OS sandbox.
**Each tier is therefore its own invocation** (`--tag tier-read`, `--tag tier-write
--allow-tools Write Edit`), in the local command, the compare tool and CI alike.

**A decision case is honest about what it measures.** "Decision case" names how a prompt is
framed, not a tier. Its prompt states the state partway through a run ("the lookup command
failed, then both create attempts failed") and asks what the skill does, *without running
anything*. It tests that the skill's text leads the model to the right decision. It does not test
that the commands are built correctly. Where the command's shape is the point (a body file
instead of a shell argument, a heredoc delimiter, an empty file that is not a report), the case
also gets a `tier-shell` variant later (D9). The README marks it until then.

### D4. Loading the skill: slash command, or the skill named in prose

Trigger accuracy is not this suite's question, so a case must not depend on the description
firing.

- **A case that hands the skill its input starts with the slash command** (`/ss:prd …`,
  `/ss:linkedin-content …`). The expansion is deterministic, and it is how a user invokes these
  skills. **No `tool_used: Skill` grader** goes on these cases: the probe showed it reads 0 even
  when the skill was followed.
- **A decision case names the skill in prose** ("Korzystam ze skilla ss:review-loop …") and
  carries `tool_used: Skill` as the plugin-fired indicator. A slash command would expand the
  skill as instructions to *start a run* (pre-flight, `gh` calls), which is the opposite of asking
  for a decision.

The `evals.json` prompts use `/prd`. They are rewritten to `/ss:prd`, which is the name the
plugin exposes.

### D5. Graders

- **One deterministic grader on the outcome, at least.** Typical forms: an exact string from
  the input that must appear verbatim in the output (a value proposition, a HEX colour, a ground
  quoted in a brief); a token naming the decision (`no-comments`, `#77`); `file_exists` with
  `exists: false` for "did not write a PRD"; `tool_used … max: 0` for "did not read the author
  profile".
- **Prohibitions carry `arm: both`**, so the no-plugin arm is held to them too.
- **`llm` graders judge the final message only**, with a rubric of concrete PASS and FAIL lines.
  A generated document is judged by `regex` on its contents only. That includes structural
  properties: "§3 holds exactly one user story" is a pattern requiring one `Jako ` between the §3
  and §4 headings, plus a `not_contains` pattern for two of them (a tempered token,
  `(?:(?!§\s*4)[\s\S])*?`, keeps the match inside §3).
- **Graders on the `review-loop` sign-off cases match only step 6.4 strings**: the canonical
  title `review-loop finished on PR #<n> — human sign-off required`, the closing sentence
  `Closing this issue is the sign-off`, and the warning texts. `review-via-codex` rewrites the
  Copilot follow-up lines of 6.3 but leaves 6.4 untouched and promises to re-run 6–15 unchanged.
  Graders that matched 6.3 wording would fail on that change for reasons unrelated to behaviour.
- **Models are pinned in every documented command:** `--model claude-opus-5-5`, the same as the
  trigger CI, and `--judge-model claude-haiku-5-5`. In the probe the default judge cost about
  $0.004 per run, and its three votes agreed in every run (12 of 12). The calibration run
  re-checks this per case. A case where the judge splits moves to `--judge-model` Sonnet, or its
  rubric is tightened.

### D6. Fixtures: synthetic, beside the case, copied by the scaffold

A scaffold is a few lines: `cp -R "$(dirname "$0")/fixtures/." .` plus `git init` and commits
where a case needs history. The probe confirmed that `$0` resolves inside the case directory.
The fixtures are **written for the graders**: a `prd-input.md` carries one landing-page sentence
that the PRD must reproduce verbatim, and a brief carries one ground that the post must quote.
That turns "rewrites 1:1, does not paraphrase" into a `regex`.

No fixture describes a real person or client. The `linkedin-content` fallback cases get a
fictional author profile whose hashtags are unusual enough that their appearance proves the
profile was read. Brief-mode cases get the same file in the workspace as a temptation, plus a
`tool_used: Read … author-profile … max: 0` grader, because in brief mode the skill must not open
it on its own.

*Alternatives:* `context.add_dirs` grants read access only, and the skills here write into the
directories they read (`prd` writes `fixtures/<x>/prd.md`). `context.history_file` replays an
internal transcript format that is brittle across CLI versions, runs one arm by default, and
already contains the skill text, so the no-plugin arm would not be skill-free.

### D7. Two baselines, for two questions

- **"Does the skill do anything?"** is the no-plugin arm (`--ablation with-without`). It runs in
  every case's calibration run. A case whose no-plugin arm reaches the threshold does not exercise
  the skill and is rewritten (spec: *Each case has a baseline that answers its question*). For
  `prd` and `linkedin-content`, which generate content a capable model could produce unaided, the
  Δ is the claim itself, and it stays in their routine runs.
- **"Did this change break or fix anything?"** is the base revision, not the absence of the
  skill. The `review-loop` README already says so ("the skill on the branch under test against the
  previous version as the baseline"). For `review-loop` decision cases the no-plugin arm is
  uninformative: the prompt names steps that mean nothing without the skill (#16: 0.00 without),
  so routine runs use `--ablation none`.

`tools/plugin-eval-compare.py --base <ref> [--case <glob>] [--tag <tag>] [--runs N]` does the
second comparison. It works like this:

1. `git worktree add --detach <tmp> <base>`.
2. Copy the branch's `evals/cases/` into the worktree, so both sides run the same cases. Set the
   manifest key there, because the base may predate the suite.
3. Run `claude plugin eval` on both with identical flags, `--ablation none` and `--json`, one
   invocation per selected tier.
4. Print per case: base score, branch score, flip (pass to fail or fail to pass), and lost runs.
5. Remove the worktree, even on failure.

Its pure parts (loading two result documents, classifying runs, detecting flips) are tested with
synthetic result JSON in `tests/`.

### D8. Lost runs are classified outside the tool

`claude plugin eval` grades a run that hit a rate limit on whatever it produced, usually 0, and
does not mark the suite partial. This is the failure the trigger runner was written to avoid.
`tools/plugin-eval-summary.py` reads `aggregate-result.json` and classifies each run:

- **Lost**: `error` matches a usage or rate limit, an authentication failure, an overloaded or
  5xx API response, a transport failure, or the per-run wall-clock timeout. Runs whose paid
  graders the cost ceiling skipped (`skippedPaidGraders`) are lost too.
- **Counted**: everything else, including a run that hit `max_turns`. Looping until the turn cap
  is the skill's behaviour, not the infrastructure's.

It recomputes each case score over its counted runs. It reports the suite as **inconclusive**
when any run was lost or `partial` is true, and it emits two outputs. One is a Markdown table
(case, score, Δ, lost runs, cost, names of failing graders). The other is a sanitised JSON with no
`explanation`, `evidence` or prompt fields. The CI job publishes nothing else (D10).

### D9. Shell tier: designed here, built after `review-via-codex`

**Fake CLIs, not MCP mocks.** `gh` is a command-line tool, and the plugin declares no MCP server.
Mocks substitute only for servers the plugin declares, and adding a test-only server to a shipped
plugin would ship it to every user. So `evals/harness/` holds small Node scripts:
- **`gh`** answers from a per-case `harness/gh.json` that the scaffold copied into the workspace.
  The file maps an argument pattern to stdout, stderr and an exit code, and every call is
  appended to `.harness/calls.jsonl` in the workspace. Graders read that log
  (`target: { source: file, path: .harness/calls.jsonl }`): the reply or issue body exactly as it
  arrived after the shell, the order of writes, and whether `issue reopen` ever ran.
- **A fake `codex-companion.mjs`** answers `setup --json` and `review --json` from per-case
  findings, in the payload shape `review-via-codex` task 1.1 records.

Runs grant `Bash(gh *)`, `Bash(git *)`, `Bash(node *)`, `Write` and `Edit`. A bare
`git init --bare` repository in the workspace serves as `origin`, so pushes succeed offline.

**Two facts must hold first, and this change measures both (tasks 1.2 and 1.3):**
- **S1, sandbox reach.** Under the Linux sandbox, can the agent's shell run a script on `PATH`
  that lies outside `$HOME`, and can it write to `$TMPDIR`? The skills put scratch files "outside
  the repository", which inside a run means outside the workspace. On GitHub runners the checkout
  sits under `$HOME` (`/home/runner/work`), which the sandbox makes unreadable, so CI must copy
  the harness elsewhere (for example `/opt/ss-eval/bin`) and prepend it to `PATH`.
- **S2, Codex runtime resolution.** `review-via-codex` pre-flight reads
  `~/.claude/plugins/installed_plugins.json`. Inside a run, `HOME` is a temporary directory, and
  the documentation says Claude Code configuration is unreadable from the sandbox. If a
  scaffold-written install record under the run's `HOME` cannot be read, the review skills need an
  `EVAL_*`-variable override for the runtime path to be testable at all. That is a decision for
  `review-via-codex` decision 1, and this change only hands it the measured answer.

*Alternatives:* a live test repository on GitHub with real pull requests (needs a token in CI,
the state drifts, Copilot or Codex behaviour is not reproducible); `context.history_file` (D6).

### D10. CI: a `behaviour` job in `skill-evals.yml`, dispatch first, weekly later

The job goes into the workflow from `skill-evals-in-ci`, beside `measure`. It reuses
`surface`'s resolved Claude Code version, the same secret, the same "key in one step's env" rule
and `permissions: contents: read`.

- **Events:** `workflow_dispatch` with inputs `suite` (`triggers` | `behaviour` | `both`, default
  `triggers`), `skill` (case glob) and `ablation`. A `schedule` is added only if the owner
  enables it after the trial (task 8.3). Never `pull_request`; the job's `if:` excludes it.
- **Not in the gate.** `skill-evals-gate` does not `need` it, and it is never a required check. A
  failed scheduled run notifies the cron line's author, which is the drift signal.
- **Invocation:** `--tag tier-read`, then `--tag tier-write --allow-tools Write Edit`, each with
  `--trust-plugin --scaffold --no-publish --json <file> --threshold 0.8 -j 4
  --max-cost-usd <about 1.5 × expected>` and the pinned models. **`--json` matters for safety, not
  only for parsing:** without it the CLI prints the highest-weight failing grader's explanation to
  the job log, and that explanation can quote model output.
- **Output:** the step summary and an artifact with the sanitised JSON from D8. No
  `report.html`, no `aggregate-result.json`, no traces. The reason is the one `skill-evals-in-ci`
  D6 gives. In a `tier-read` or `tier-write` run, the agent may be able to `Read` its own process environment (`/proc/self/environ`), which
  holds the API key, and a hostile `SKILL.md` could print it into the final message, which then
  reaches the evidence fields.
- **Threshold 0.8.** With three runs, one failed `llm` grader out of three in one run still
  passes. A wholly failed run, or a grader failing in two runs, does not.
- **Cadence.** Dispatch only during a trial of two to four runs. Then weekly, in the same
  schedule event as the trigger measurement, if the owner accepts about $115 a month for the
  routine mix (*Cost*). Nightly runs are not proposed (about $800 a month). A nightly run that measures only when
  `skills/{prd,linkedin-content,review-fix,review-loop}/**` or `evals/cases/**` changed on
  `master` would be cheap, but it adds a cache key. It is left for when the weekly signal proves
  useful.

### D11. Retirement and the boundary with `review-via-codex`

This change migrates only cases that `review-via-codex` keeps. The cases it retires or rewrites
stay in the skill's `evals.json` until that change deletes them. So for a while `review-loop` and
`review-fix` hold both formats, which is the one exception the spec allows. Their READMEs say
which case is where. Migrating the retiring cases would be cheap (the #16 probe needed one prompt
and three graders), but it would be throwaway work.

**The order of the two changes decides what group 5 of the tasks migrates:**
- **This change merges first.** It migrates the kept ids (`review-loop` 4, 5, 6–15;
  `review-fix` 2) and trims both `evals.json` files to the ids that `review-via-codex` retires or
  rewrites. That change then deletes the files.
- **`review-via-codex` merges first.** Its task 4.6 has added new cases to `review-loop`'s
  `evals.json` (plugin missing, usage limit mid-run, minor-only, a rejection met again, dirty
  working tree). Its tasks 3.1–3.5 have added new ones to `review-fix`'s. Group 5 then migrates
  every case that file holds at that point, kept and new alike, and deletes both files.
- **`review-via-codex` is dropped.** The retiring cases migrate as decision cases under the same
  rules, and both files are deleted.

Three coordination items belong to `review-via-codex` and are not tasks here:
- Its new behavioural cases (tasks 3.1–3.6, 4.1–4.6) should be written into `evals/cases/` in
  this format rather than into `evals.json`.
- S2's answer feeds its decision 1.
- `review-fix` cases 3 and 4 lose their reply-based expectations with task 3.6. They also check a
  judgement that survives the switch: no code change for a finding that is outdated or wrong, and
  a reasoned rejection recorded instead. Task 3.3 adds a case for a finding that repeats an
  earlier rejection, but no case names a first rejection of an outdated or wrong finding.

## Case mapping

`read`, `write` and `shell` are the tiers (D3). "Kept by codex" means that `review-via-codex`
keeps the case. Grader names are indicative; the exact patterns are calibrated in the first run.

### `prd`: 4 of 4 migrated plus 1 new, `tier-write`, ablation with-without

| # | Case | Fixtures | Graders |
|---|---|---|---|
| 0 | `0-track-tech-eight-sections` | `fixtures/mentormatch/{prd-input,brand}.md` with a verbatim landing-page sentence, Track Tech stated | `file_exists fixtures/mentormatch/prd.md`; regex(file): the landing sentence verbatim, `AI Build Summary`, `Next\.js\s*\d+`; regex(file) `not_contains` `§\s*9\|Component Inventory`, `\blatest\b`; regex(file): §6 holds ≥ 5 list items, §8 holds `- [ ]`; regex(file): exactly one `Jako ` between the §3 and §4 headings (D5); `tool_order` Read(prd-input) before Write(prd.md) |
| 1 | `1-track-builder-component-inventory` | `fixtures/klasa/{prd-input,brand}.md`, a non-technical founder on Lovable | `file_exists`; regex(file) `§\s*9` and `Component Inventory`, ≥ 3 table rows typed Form/Modal/Display/…, a "Jak używać" instruction; regex(file) `not_contains` `interface\s+\w+\s*\{` (no TypeScript in §4) |
| 2 | `2-thin-input-asks-first` (probed) | `fixtures/thin/prd-input.md` (two lines) | `file_exists **/prd.md exists:false arm:both` (a write grant makes the temptation real); `tool_used Read prd-input`; llm(last message): names the missing items, offers the two paths or asks ≤ 2 questions with a recommendation, invents no ICP. Expectation updated to the current two-path protocol |
| 3 | `3-split-inputs-read-whole` | `fixtures/mikrobiota-split/{icp,positioning,gtm-plan,landing-brief}.md`, brand inside `landing-brief.md` | one `tool_used Read` per file; regex(file) `#0E7C66`, `#E8B04B` (`flags: i`), `Source Sans 3`, the landing sentence verbatim; regex(file) `not_contains` `§\s*9`; llm(last message): no complaint about a missing `prd-input.md` or `brand.md` |
| 4 (new) | `4-scope-cut-to-one-core-flow` | `fixtures/scope-cut/prd-input.md`: complete W1/W2 input whose founder lists three features as must-have (booking, payments, chat) | `file_exists`; regex(file): exactly one `Jako ` inside §3 (D5); regex(file): both cut features named after the §6 heading; llm(last message): names which two features go to §6 and why, before or with the document |

Case 4 is new. "Cut to one Core Flow" is the rule the skill calls the one that decides success,
and no existing case exercises it. It also brings `prd` to the five prompts the
`skill-evaluation` spec asks of every skill.

### `linkedin-content`: 3 converted, 3 added, `tier-read`, ablation with-without

The three old cases move into the **by-name fallback mode**. It is the only mode in which the
skill still writes from a bare note, and it is still in the skill's body. The brief mode, which is
the skill's contract today, gets cases for the first time. Every case scaffolds a fictional
`context/author-profile.md` read-only. The post is the final message, so nothing needs a write
grant.

| # | Case | Graders |
|---|---|---|
| 1 (old 1) | `1-fallback-case-study-from-note` | regex: one sentence pointing at the publication loop (`pętl`, `flags: i`); regex: a profile hashtag; regex: `6`, `15 minut`, `120` carried over; regex `not_contains` `^(Cześć\|Dzisiaj chciałbym)` (`flags: mi`); `tool_used Read author-profile min:1`; llm: hook, problem-solution-result, CTA as a question, no "daj lajka" |
| 2 (old 2) | `2-fallback-five-ideas` | llm: exactly five ideas, each with a type, a hook and a CTA; regex: a profile hashtag |
| 3 (old 3) | `3-fallback-rewrite-drops-banned-words` | regex `not_contains` `przełomow\|zrewolucjoniz\|niezwykł\|game[ -]?changer` (`flags: i`); regex `not_contains` `^Cześć` (`flags: mi`); llm: shorter, concrete, ends with a question |
| 4 | `4-brief-grounds-quoted-verbatim` | regex: the brief's ground verbatim; regex: every result-contract label; `tool_used Read author-profile max:0 arm:both` (the profile is a temptation here); llm: no number absent from the brief |
| 5 | `5-brief-ungrounded-thesis-stays-out` | regex `not_contains` the ungrounded thesis's distinctive phrase; regex: every contract label |
| 6 | `6-brief-gap-reported-not-guessed` | regex: the contract item without a source is marked `brak` or `nie dotyczy`; regex `not_contains` `https?://` (no invented link) |

### `review-loop`: 12 of 22 migrated (`tier-read` decision cases), 10 retired by `review-via-codex`

| # | Case | Status | Graders (all with `tool_used: Skill` as indicator) |
|---|---|---|---|
| 1 | copilot-absence-detected-before-waiting | retired (codex 4.6) | — |
| 2 | first-ever-pr-reported-as-inconclusive | retired (codex 4.6) | — |
| 3 | timeout-names-both-possibilities | retired (codex 4.6) | — |
| 4 | `4-missing-change-directory-prompts` | kept by codex; read-only scaffold of `openspec/changes/` and `archive/` | regex: the archived candidate's directory name; llm: lists the candidates and asks, does not pick one and carry on |
| 5 | `5-clean-termination-when-nothing-new` | kept | regex `no-comments`; llm: stops now with totals across iterations and does not claim everything was fixed |
| 6 | `6-sign-off-issue-matched-by-exact-title` | kept; shell variant later | regex: the canonical title for PR #12; regex `Closing this issue is the sign-off`; llm: the near-miss issue is not reused, the body goes through a file outside the repository |
| 7 | `7-ungated-run-is-announced` | kept | regex `NOT created`; llm: one retry, then a line saying nothing records the need for human eyes and an issue must be opened by hand; not reported complete |
| 8 | `8-closed-record-is-not-reopened` | kept | regex: the canonical title; llm: a new record, and the closed one is neither reopened nor commented on |
| 9 | `9-delimiter-in-error-text-does-not-truncate` | kept; shell variant later | regex `error\.txt` (the error text travels as the file 6.2 writes); regex `Closing this issue is the sign-off`; llm: the error text reaches the body as a concatenated file, not a heredoc; the closing sentence stays last |
| 10 | `10-open-record-is-appended-to` | kept | regex `gh issue comment`; llm: no second issue, nothing closed or edited, state re-read right before the append |
| 11 | `11-failed-lookup-creates-and-warns-twice` | kept | regex `lookup failed` (`flags: i`); llm: takes the create path, and the duplicate warning goes in both the report and the body, only after the write succeeded |
| 12 | `12-failed-append-names-the-open-issue` | kept | regex `#77`; regex `NOT updated`; llm: tells the reader not to open a second issue; not reported complete |
| 13 | `13-lookup-and-create-failed-one-outcome` | kept | regex `NOT created`; llm: a single outcome, without the "opened anyway" line |
| 14 | `14-unreadable-report-record-admits-it` | kept; shell variant later | regex `could not be read`; llm: the record is still opened, says so in its first lines, and the same fact reaches the session report |
| 15 | `15-aborted-run-without-error-text-says-so` | kept; shell variant later | regex `error text could not be read` (`flags: i`); llm: the missing log is reported where it would have been; keyed on the reason, not the file |
| 16–22 | run-check family (5.3) | retired (codex 4.6) | — (#16 was the probe: Δ +1.00) |

### `review-fix`: 1 of 9 migrated now

| # | Case | Status | Plan |
|---|---|---|---|
| 1 | reply-body-survives-backticks | retired (codex 3.6: no in-thread replies) | — |
| 2 | `2-verification-without-a-js-toolchain` | kept by codex; `tier-read` decision case with a read-only scaffold (`hooks/selftest.mjs`, `openspec/`, no `package.json`) | llm: names `node hooks/selftest.mjs` and `openspec validate`, not `pnpm`; regex `selftest\.mjs` |
| 3 | outdated-comment-gets-no-code-change | retired (codex 3.6: no replies) | the surviving judgement (no code change, reasoned rejection) is a coordination item for `review-via-codex` (D11) |
| 4 | wrong-comment-gets-reasoned-pushback | retired (codex 3.6) | as 3 |
| 5 | scratch-data-stays-out-of-the-repo | retired (codex 3.6: no comment fetch) | the principle returns as a `tier-shell` case on the Codex payload |
| 6 | every-thread-answered-one-at-a-time | retired (codex 3.6) | — |
| 7–9 | severity ordering | rewritten by codex 3.3 for `P0`–`P3` | decision cases ("in what order"), plus `tier-shell` cases with `tool_order` on `Edit` paths once the harness exists |

### Not automated, by reason

- **Retired by `review-via-codex`:** `review-loop` 1–3 and 16–22 (task 4.6); `review-fix` 1, 3,
  4, 5 and 6 (task 3.6). **Rewritten by it:** `review-fix` 7–9 (task 3.3). The judgement that
  cases 3 and 4 also cover is a coordination item (D11).
- **Waiting for the shell tier:** the command-shape halves of `review-loop` 6, 9, 14 and 15. The
  decision halves run now.
- **Manual by nature:** an end-to-end loop on a real pull request with a real reviewer. Timing,
  the reviewer's own behaviour and the GitHub UI are not reproducible in a sandbox. It stays a
  documented manual smoke test, once per release of either review skill. Also manual: post quality
  beyond the rubric for `linkedin-content`, which a person judges. The old "w stylu Pawła"
  expectation is dropped, because the author's data cannot sit in a public suite.

## Cost

**Measured** on 2026-10-10 (CLI 2.1.292, `claude-opus-5-5`, default judge, Windows 11):

| Case | Arm | Runs | Turns | Cost / run | Judge / run | Wall / run |
|---|---|---:|---:|---:|---:|---:|
| `review-loop` #16 (`tier-read`, decision) | with | 4 | 4 | $0.354–0.362 | $0.0035–0.0040 | 26–29 s |
| `review-loop` #16 | without | 1 | 3 | $0.081 | $0.0023 | 18 s |
| `prd` #2 (`tier-write`, scaffold) | with | 1 | 3 | $0.224 | $0.0028 | 18 s |
| `prd` #2 | without | 1 | 4 | $0.163 | $0.0025 | 47 s |

The `review-loop` with-arm writes about 38k tokens to cache (most of it the 1,100-line skill),
reads 39k and writes 2.2k of output. The prefix cache does not carry over between runs (Context).

**Modelled** per run from those numbers: a `review-fix` or `linkedin-content` case about $0.20
with and $0.10 without. A `prd` case that writes the full document about $0.30 with (about 4k more
output tokens than the measured thin case) and $0.20 without. A `tier-shell` case, phase 2, about
$1.0–1.5 (10–20 turns over a context of about 70k, read from cache within the run).

**Per suite run, phase 1 (24 cases × 3 runs):**

| Selection | `--ablation none` | with no-plugin arm | routine (D7) |
|---|---:|---:|---:|
| `review-loop` (12) | ~$13.0 | ~$15.8 | ~$13.0 (none) |
| `linkedin-content` (6) | ~$4.0 | ~$6.1 | ~$6.1 (with arm) |
| `prd` (5) | ~$4.3 | ~$7.1 | ~$7.1 (with arm) |
| `review-fix` (1) | ~$0.6 | ~$0.9 | ~$0.6 (none) |
| **Whole suite** | **~$22** | **~$30** | **~$27** |

Judge calls add about $0.5 to a whole-suite run. A version comparison is twice the
`--ablation none` figure for the selected skill: about $26 for `review-loop` and $8.5 for `prd`.
Wall time is about 32 minutes serial for the whole suite with `--ablation none` (72 runs) and
about 47 minutes for the routine mix (105 runs). At `-j 4` that is about 8 and 12 minutes.

**Monthly in CI on Opus 5.5:** dispatch only, pay per use. The routine mix weekly is about
**$115**, and nightly about $800 (not proposed). On `claude-sonnet-5-5` each figure roughly
halves (modelled from list prices). Its scores would be a separate baseline.

## Risks / Trade-offs

- **[Decision cases measure the reading, not the doing.]** A model can state the right step and
  still build the command wrong. → Each README labels the tier of every case. The cases where the
  command is the point are listed as waiting for the shell tier, so their status is visible
  and not implied.
- **[Judge noise.]** A Haiku judge can mark a correct answer wrong when the wording differs from
  the rubric. → Short rubrics with concrete PASS and FAIL lines; a deterministic grader beside
  every judge; calibration re-checks vote agreement and escalates single cases to a Sonnet judge.
- **[The experimental manifest key changes.]** → Every command also passes `--eval-dir
  evals/cases`. `plugin-validate` in CI would flag a key that the CLI starts rejecting.
- **[Two formats per review skill for a while.]** → The README mapping is the single place that
  says where each case lives. The overlap ends when `review-via-codex` deletes the files.
- **[Synthetic fixtures can be easier than real input.]** → Fixtures copy the structure and length
  of real W1/W2 outputs and briefs, and the calibration's no-plugin arm shows whether a case is
  too easy.
- **[Cost grows with cases.]** → `--max-cost-usd` on every CI run, per-skill dispatch, and
  `--ablation none` by default for skills where the no-plugin arm is uninformative.
- **[Prompt injection through a crafted skill in CI.]** → Only the sanitised summary leaves the
  runner, `--json` keeps explanations out of the log, and the key is dedicated and capped (as in
  `skill-evals-in-ci`).

## Migration Plan

1. Land the skeleton, the two tools, the 24 phase-1 cases and the README mappings. Delete
   `evals.json` in `prd` and `linkedin-content`. Handle the review skills' files according to the
   merge order (D11).
2. Run calibration locally (with the no-plugin arm, three runs, per skill). Record the scores,
   cost and model in each `evals/README.md`. Rewrite the cases the model passes alone.
3. Once `skill-evals-in-ci` has merged and its secret exists, add the `behaviour` job, then
   dispatch two to four times.
4. **Owner:** decide the weekly schedule.
5. Follow-up change after `review-via-codex`: build the harness on top of S1 and S2, add the
   `tier-shell` cases, and install `bubblewrap` and `socat` in CI.

**Rollback:** remove the manifest key and `evals/cases/`. No skill reads either, so nothing at
runtime changes. Removing the `behaviour` job stops all spend.

## Open Questions

- **The coordination items with `review-via-codex` (D11).** Whether that change writes its cases
  straight into this suite, and whether it adds a case for a first rejection, is the owner's call
  on that change. Group 5 of this change's tasks covers both merge orders, whichever is chosen.
- **Judge model.** Haiku 5.5 is pinned by default; calibration may move individual cases or the
  whole suite to Sonnet. This changes the cost by cents.
- **Exact patterns for the generated `prd.md`.** Heading style (`## §1 —` or `### §1`) is
  matched loosely and tightened after calibration.
