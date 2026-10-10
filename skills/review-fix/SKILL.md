---
name: review-fix
description: 'Run one Codex review of the current branch and act on every finding — fix what holds up, reject what does not with a one-line reason, verify, commit, and push when the branch has a pull request. Use this whenever someone wants a review pass that ends in fixes rather than a list: "zrób review i popraw co znajdzie", "przepuść to przez Codexa i napraw", "review my branch and fix what is real before I open the PR", "one review pass on PR 12, fix and push", or /review-fix [PR]. With an OpenSpec change it records each finding and its outcome in the change''s review.md, so a rejected finding is not judged again. Needs the codex@openai-codex plugin. An opinion with no changes is /codex:review; repeating until the reviewer is quiet is review-loop.'
---

# Review Fix

One pass: Codex reviews the branch in a fresh context, you judge each finding against what the
change is meant to do, fix what holds up, record what does not, verify, commit, and push when the
branch has a pull request.

**Input:** `/review-fix [PR-number] [--change <openspec-change-name>]`

- `PR-number` — optional. Without it, the current branch's pull request if it has one.
- `--change` — the OpenSpec change whose `review.md` records this pass. `review-loop` always passes
  it. Without it, a branch named `change/<name>` with an `openspec/changes/<name>/` directory names
  the change; say which one you took. Otherwise there is no change and no record.

**The helper.** Everything that has to be exact — finding the Codex plugin, running its review,
reading the result, reading the review policy, checking tests — goes through one script:

```bash
HELPER="<this skill's base directory>/scripts/codex-review.mjs"
```

Take the base directory from the line announced when this skill loads; the skill lives in the
plugin cache, so there is no fixed path to guess. Every subcommand prints one JSON object. Do not
parse Codex's text yourself: the helper's verdict is strict in both directions, and a hand-made
reading is exactly what turns a failed review into a clean one.

## Steps

### 1. Is a fix wanted at all?

This skill edits code and commits. If the request asks only for an opinion — *"powiedz co jest
nie tak"*, *"just tell me what's wrong"*, *"nie ruszaj kodu"* — and nothing in it asks for changes,
say in one line that `/codex:review` gives Codex's findings without touching anything (the user
types it; it cannot be run from a skill), and stop. Running a review here and then not acting on
it would spend the user's Codex allowance on half of what this skill is for.

Repeating until the reviewer has nothing important left is `review-loop`; one pass is this skill.

### 2. Pre-flight

2.1. **Codex is ready.**

```bash
node "$HELPER" preflight
```

Exit 2 (`"ok": false`) means the plugin is missing, the install record points nowhere, or Codex is
not signed in. Stop there — before reviewing, editing or committing anything — and print the
`error` field and the next step: *run `/codex:setup`, then run this again.* There is no fallback
reviewer.

If `pointer.ok` is false, print **one** warning and carry on: the repository has no `AGENTS.md`
pointer to its review policy and to the review record (`pointer.missing` names what is absent), so
Codex reviews without the policy and may raise again what an earlier round rejected. The templates
are `templates/REVIEW_TEMPLATE.md` and `templates/AGENTS_REVIEW_POINTER.md` in this plugin
(`<base directory>/../../templates/`). A missing pointer never stops the run.

2.2. **The pull request, if there is one.**

```bash
gh pr view <PR> --json number,url,headRefName,baseRefName,state   # without <PR>: the current branch's
```

- **A PR number was given and it is not the current branch** (`headRefName` differs from
  `git branch --show-current`): stop and say which branch to check out. Do not switch branches in
  someone's working tree.
- **There is a pull request.** It must be `OPEN`. The working tree must be clean
  (`git status --porcelain` empty): uncommitted work would be reviewed and then swept into the
  round's commit. Fetch its base so the review sees exactly the pull request's diff, whatever the
  repository's default branch is:

  ```bash
  git fetch origin <baseRefName>
  ```

  The review target is `--base origin/<baseRefName>`, and the round ends with a push.
- **There is no pull request** (`gh pr view` reports none for this branch): the target is
  `--scope auto` — the working tree when it is dirty, otherwise the branch against the default
  branch. The round commits and does not push. If `gh` failed for any other reason — not signed in,
  no network — say so, because a pull request may exist that this pass will then not push to.

  **When the dirty working tree is the target**, the reviewed work is part of the round: the round
  always ends in a commit that carries it, together with any fixes, even when nothing was fixed
  (step 9). Say so before the review, so nobody is surprised to find their uncommitted work
  committed.

2.3. **The record and the starting point.** With a change, the record is
`openspec/changes/<change>/review.md`. Read all of it now: every earlier round, whoever ran it. The
next round number is one more than the highest `## Round N` in it, or 1.

Note the round's starting point; the test guard in step 8 compares against it. Normally that is the
commit:

```bash
git rev-parse HEAD
```

When the dirty working tree is the target, it is a snapshot of that working tree instead — the
helper writes it as a tree object, untracked files included, without touching the index:

```bash
node "$HELPER" snapshot          # → {"ok": true, "tree": "<sha>"}
```

Measured from `HEAD`, the person's own uncommitted edits to tests would count as the round's and
stop it in step 8; measured from the snapshot, only what the fixer changed counts.

### 3. Review

```bash
SCRATCH="<the session's scratch directory, or one from mktemp -d — outside the repository>"
node "$HELPER" review --base origin/<baseRefName> --out "$SCRATCH/review-round-<N>.json"   # or --scope auto
```

Give the Bash call its full 600-second timeout. Reviews measured 43–93 s, and the helper stops one
that passes 540 s and reports it as an error rather than letting the call be killed.

The `verdict` decides everything after this:

- **`error`** — the command failed, the review reported failure (an exhausted usage limit arrives
  this way), it timed out, or its output announced findings the helper could not read. Stop with the
  `error` text quoted as it is, edit nothing, and say the review did not complete. **An error is
  never a clean review**: "Codex found nothing" is a claim that needs a review that finished and
  was read.
- **`clean`** — nothing to fix. With a change, the round is still recorded (step 7) and committed,
  so the pull request shows that a review happened and what it said. When the working tree was the
  target, the reviewed work is committed too (step 9).
- **`findings`** — each one carries `tag`, `title`, `path` (repository-relative), `start`/`end`,
  `body`, and `important`; `fix_order` is the order to work in.

### 4. Judge each finding

Read before you judge: the change's `proposal.md`, `design.md` and `specs/` when there is a change,
the repository's `REVIEW.md` when there is one, and the code around each location. Codex's line
numbers can be off by a few lines, so read the function, not the line.

Every finding gets exactly one outcome:

- **repeated** — the record already holds a `rejected` row for it: the same place (the same file
  and function, not necessarily the same line) and the same claim, in whatever words. Do not judge
  it again and do not change code for it; the decision was made, with a reason, and a person
  reopens it by deleting that row. When unsure, it is not a repeat — a false match hides a real
  finding, so judge it.
- **fix** — the finding holds up. Code changes follow in step 5.
- **rejected** — it does not hold up: it contradicts the change's design (a deliberate
  fire-and-forget the design names), misreads the code, or names code the branch no longer has.
  No code change. Write the reason in one sentence a stranger could check — not "disagree", but
  what makes the finding wrong.

**Minor findings** — those with `important: false`, below the line `REVIEW.md` draws (by default
`P0`–`P2` important, `P3` minor) — are fixed in passing when the fix is small and plainly right;
otherwise record them as `rejected: minor — <why it can wait>`. Either way each one is recorded, and
none of them alone is a reason for another review. A finding whose severity cannot be read counts
as important.

Pull-request review comments from people or bots are not findings. This skill does not read them
and does not reply to them.

### 5. Apply the fixes, highest severity first

Work in `fix_order`. It ranks by the repository's scale — `REVIEW.md`'s `Scale:` line, or
`P0` > `P1` > `P2` > `P3` without one — and keeps three rules, so the order says no more than the
reviewer did:

- equal severity keeps arrival order;
- a tag the scale does not define is treated as untagged, not guessed into a neighbouring rank;
- untagged findings follow every tagged one, among themselves in arrival order — and where nothing
  is tagged, the arrival order stands.

The `review` output names the scale and the importance line it applied (`policy`). If the run is cut
short, what is left undone should be the least serious work.

Edit only files inside the repository, and only for findings judged **fix**.

### 6. Verify

Run the checks the project actually has, after all fixes are in. `REVIEW.md` lists them when it has
a `Checks` section; otherwise find them — a `test`, `typecheck` or `lint` script in `package.json`,
a test runner, a self-test script, a schema validator. In this repository they are
`node hooks/selftest.mjs`, `node skills/review-fix/scripts/selftest.mjs`,
`openspec validate --all --strict` and `claude plugin validate .`.

If a check fails, fix the cause and run it again. If you cannot make it pass, the round ends as an
error with nothing committed. If the project has no automated check at all, say so in the record
and the summary rather than letting silence imply one passed.

### 7. Write the round into the record

With a change, append — never rewrite earlier sections:

```markdown
## Round 2 — 2026-10-11 — reviewed 5b43127

| id | sev | where | finding | outcome |
|---|---|---|---|---|
| R2-1 | P1 | src/sync.py:40-52 | Lock does not cover the retry path | fixed |
| R2-2 | P2 | src/sync.py:88 | Log line carries an email address | rejected: the address is the operator's own login, not customer data |
| R2-3 | P2 | docs/flow.md:12 | Step 3 has no measurable condition | repeats R1-4 |

Test changes:
- `tests/test_sync.py` — R2-1: the test asserted the unlocked retry that the finding fixes

Checks: `node hooks/selftest.mjs` — 14/14 passed
```

- The heading carries the round number, today's date and the short sha the review ran against.
- A new file starts with `# Review record — <change>` above the first round.
- A clean round has no table: `No findings.` and the first sentence of Codex's verdict.
- A repeated row keeps its own location and names the row it matched.
- `Test changes:` lists every **existing** test file the round changed, each with the finding that
  required it and why. Leave the line out when none changed. New test files need no entry.
- `fixed` rows get their commit in step 9.

Without a change, write nothing and say in the summary that no review record was written.

### 8. Guard the existing tests

```bash
node "$HELPER" guard --since <round start: the sha, or the snapshot tree> --record openspec/changes/<change>/review.md --round <N>
```

(Without a change, leave out `--record` and `--round`. When the working tree was the target, run
`git add -A` first: the round commits everything it reviewed anyway, and an untracked file the
fixer edited is only visible to the guard once it is staged.) The helper lists every file the round
modified, deleted or renamed — in the index or the working tree — that existed at the round's start
and matches the test paths: the `Test paths:` line of `REVIEW.md` **as it stood at the round's
start**, or the defaults (`**/test/**`, `**/tests/**`, `*.test.*`, `*.spec.*`, `test_*.py`,
`*_test.py`, `*_test.go`, …). `REVIEW.md` itself is guarded the same way, since it defines what the
guard protects: a round cannot narrow the paths and pass its own check.

Exit 4 means a protected test changed without a `Test changes` entry naming a finding of this round.
The round ends as an **error before anything is committed**, naming the files. Leave the edits in
the working tree for the person to look at, and do not "fix" the guard by writing a reason after the
fact that the finding did not give. The rule exists because the cheapest way to make a failing check
pass is to change what it asserts — and a test edited to agree with new code proves nothing. Without
a change there is no record, so any change to an existing test ends the round this way. Adding new
tests is never restricted.

### 9. Commit

Stage only what the round changed — and, when the working tree was the target, everything that was
reviewed — leaving the record out of the first commit. Two commits, so the record can name the fix:

1. **The fixes**, when there are any:

   ```
   fix: address Codex review round <N>

   - <one line per fixed finding>

   Co-Authored-By: <the co-author line this session is configured to use>
   ```

   When the working tree was the target, this commit is made **every round**, fixes or not, because
   it also carries the work that was reviewed. Its subject then says so —
   `chore: commit the work reviewed in Codex review round <N>`, with the fixes listed below it — and
   the summary names the files it took in.

2. **The record**, with each `fixed` row completed as `fixed in <short sha of commit 1>`:

   ```
   docs(review): record Codex review round <N> of <change>
   ```

A round that fixed nothing — everything rejected or repeated, or a clean review — still commits its
record, alone. That commit is how the decision reaches the pull request, and how the next review
and the next run find it. Without a change there is no record: there is only the first commit — when
something was fixed, or when the working tree was the target.

### 10. Push

Only when the branch has a pull request:

```bash
git push origin HEAD:<headRefName>
```

Without a pull request, leave the commits local and say so.

### 11. Summary

```
| # | sev | where | finding | outcome |
|---|-----|-------|---------|---------|
| R2-1 | P1 | src/sync.py:40-52 | Lock does not cover the retry path | fixed in 9c01e2a |
| R2-2 | P2 | src/sync.py:88 | Log line carries an email address | rejected: operator's own login |
```

Then, in this order:

- the checks and their result, or that the project has none;
- where the record is (`openspec/changes/<change>/review.md`), or **"No review record was written —
  this pass ran without an OpenSpec change."**;
- the commits, and whether they were pushed;
- **Candidate rules for `CLAUDE.md`** — fixed findings that read as conventions of the repository
  rather than one-off defects (*amounts of money are integers in the smallest unit*, *every
  endpoint checks the caller's organisation*). Propose them; do not edit `CLAUDE.md` or any other
  agent instructions yourself. Leave the section out when there are none.

**When a caller asks for counts** (`review-loop` does), take them from this round's record:
`important_found` and `important_fixed` count findings with `important: true`, found and fixed;
`minor_fixed` counts the fixed minor ones; `rejected` and `repeated` count those outcomes; `clean`
is true only for a `clean` verdict; `pushed_commit_sha` is the full sha of the last commit pushed
(`git rev-parse HEAD`), or null when nothing was pushed.

## Guardrails

- **Never** treat a failed, timed-out or unreadable review as clean. The helper says `error`; so do
  you.
- **Never** edit, commit or push anything after a pre-flight stop or a review error.
- **Never** change an existing test without the record entry step 8 checks for.
- **Never** rewrite or delete earlier rounds of the record. Deleting a rejection is how a person
  reopens a finding — it is theirs to do.
- **Never** edit `CLAUDE.md` or `AGENTS.md` to adopt a convention a finding suggested; list it.
- **Never** pipe JSON through `jq`, which may be absent; the helper and `gh --jq` cover every
  parse this skill needs.
- **Never** write scratch files into the repository.
