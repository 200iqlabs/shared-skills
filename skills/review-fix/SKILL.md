---
name: review-fix
description: Use when you need to fetch PR review comments, fix issues in code, commit, push, and reply on GitHub. Invoke with /review-fix or /review-fix <PR-number>.
---

# Review Fix

Fetch PR review comments, fix valid issues, commit, push, and reply on GitHub — all in one command.

**Input**: Optionally specify a PR number (e.g., `/review-fix 55`). If omitted, detect from current branch via `gh pr view`.

## Steps

1. **Detect PR and repo**

   Detect owner/repo from the git remote:

   ```bash
   gh repo view --json nameWithOwner --jq .nameWithOwner
   ```

   If a PR number was provided as argument, use it. Otherwise detect from current branch:

   ```bash
   gh pr view --json number,url,headRefName
   ```

   **Note**: `gh pr view` without a number only works if the current branch has an associated PR. If it fails (e.g., you're on `main`), prompt the user for the PR number — do NOT guess.

   Store the PR branch name (`headRefName`) — you'll need it for pushing later.

2. **Fetch review comments**

   Fetch ALL review comments (the GitHub API paginates at 30 per page by default — you MUST use `--paginate` or you will miss comments on long-running PRs):

   ```bash
   SCRATCH="${SCRATCH:-$(mktemp -d)}"
   gh api --paginate "repos/{owner}/{repo}/pulls/{pr}/comments?per_page=100" > "$SCRATCH/pr-comments.json"
   echo "scratch: $SCRATCH"
   ```

   Write it **outside the repository** — never the repo root. It is throwaway data and has no business appearing in `git status`.

   **Shell state does not survive between tool calls**, so `SCRATCH` set here is gone by the next command. That is why the snippet echoes the path: note it, and either paste it literally into the later commands or repeat the `SCRATCH="${SCRATCH:-$(mktemp -d)}"` line at the top of each one. If your harness gives the session its own scratchpad directory, use that instead and skip `mktemp` entirely — the path is then stable for the whole session.

   Do not let it go unset. An unset variable collapses the path to `/pr-comments.json`, and the redirect dies with a permission error rather than anything that names the real problem.

   `--paginate` with `gh api` automatically follows `Link: rel="next"` headers and concatenates pages into a single JSON array. `per_page=100` is the max — keeps the round-trips low.

   **Sanity check**: after fetching, log `total: <c.length>`. If the PR thread shows more comments than that in the GitHub UI, the fetch missed pages — re-run with `--paginate`.

   **Important**: Do NOT pipe through `jq` — it may not be installed. Parse the file directly with Node, reading the scratch path you just echoed:

   ```bash
   node -e 'const c=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); console.log("total:", c.length)' "$SCRATCH/pr-comments.json"
   ```

   **Filtering logic**:
   - Get the current git user: `git config user.login` or match against GitHub username from `gh api user`
   - Group comments by `in_reply_to_id`: comments with `in_reply_to_id` are replies, those without are top-level
   - Skip top-level comments that already have a reply from our user (check reply chain)
   - Only process top-level comments from the latest review cycle

   **Fetch the review bodies too — some findings are not comments.** The comments endpoint
   returns threads, and returns nothing for a finding the reviewer chose to suppress. Copilot
   suppresses routinely: a review can arrive carrying `### Suppressed comments (2)` in its
   **body** with zero new threads behind it.

   ```bash
   gh api --paginate "repos/{owner}/{repo}/pulls/{pr}/reviews?per_page=100" > "$SCRATCH/pr-reviews.json"
   ```

   Read the body of every review newer than your last reply and scan it for a suppressed block.
   Each entry names a file and a line and reads exactly like a review comment, because it is one
   — it just has no thread to answer in.

   **Treat them as first-class findings.** Measured on `shorts-lab-ai/saas-platform` PR #824: a
   review with zero new threads carried two suppressed ones, both substantive — they caught a
   document asserting a conclusion it warned three paragraphs later could not be drawn. Reading
   threads only reports "nothing to answer", which is wrong in the direction that matters: what
   gets dropped is what the reviewer judged too minor to interrupt with, not too minor to be
   right.

   A suppressed finding has no `comment_id`, so step 8's in-thread reply cannot carry it. Answer
   those together in one top-level PR comment
   (`gh api repos/{owner}/{repo}/issues/{pr}/comments`), naming which you took and which you did
   not.

3. **If there are no comments, you are in the wrong skill**

   Zero top-level comments **and no suppressed findings in any review body** means no review has
   happened yet — check both, because a review carrying only suppressed findings is
   indistinguishable from no review at all through the comments endpoint. The user most likely
   asked for a
   review to be *produced* — "zrób mi review tego PR-a", "tell me what's wrong with it" — and this
   skill acts on feedback that already exists.

   Say so in one line and point at a code review instead. Do not invent findings to fill the gap,
   and do not treat an empty fetch as "nothing to do" and stop silently: both leave the user with
   the impression their request was handled.

   This step exists because the description cannot prevent it. Three separate wordings were
   measured against the trigger set in `evals/`, including one stating the exclusion as an explicit
   principle, and all three trigger on those requests at the same rate. Topical overlap outweighs
   an exclusion clause, so the boundary has to be enforced here, after the fetch, where the answer
   is a fact rather than a guess.

4. **Triage each comment**

   For each comment, read the referenced file and surrounding code, then classify:
   - **FIX**: Valid issue, code change needed
   - **OUTDATED**: References code that has already been changed
   - **DISAGREE**: Technically incorrect or not applicable — prepare reasoned pushback

   For OUTDATED and DISAGREE, do NOT change code — just prepare a reply.

5. **Apply fixes**

   **Work highest severity first.** Where the reviewer tags its comments — `blocker`,
   `should`, `nit`, or whatever scale that repository's review policy defines — fix the most
   serious first and work down. The loop above runs under an iteration cap and a timeout, so
   something may get cut; what gets cut should be the smallest thing, not whatever happened
   to be reported last. Where comments carry no severity at all, keep the order they arrived
   in.

   For each comment classified **FIX**:
   - Read the referenced file and line
   - Apply the fix using Edit tool
   - If a `suggestion` code block is provided in the comment, verify it's correct before applying

6. **Verify**

   Run whatever check this project actually has, after all fixes are applied. Find it rather than assuming it: a `typecheck`, `test` or `lint` script in `package.json`, a test runner, a self-test script, a schema validator. In this repository that is `node hooks/selftest.mjs` and `openspec validate --all`; in a TypeScript project it is usually `pnpm typecheck`.

   If the project has no automated check at all, say so in the summary rather than letting silence imply one passed. If a check fails, fix it before committing.

7. **Commit and push**

   Stage only files that were changed by fixes. Create a single commit:

   ```
   fix: address PR review feedback

   - <brief description of each fix>

   Co-Authored-By: <the co-author line this session is configured to use>
   ```

   Push to the PR's branch (use `headRefName` from step 1):

   ```bash
   git push origin HEAD:<headRefName>
   ```

8. **Reply to each comment**

   **CRITICAL: Send replies ONE AT A TIME, sequentially.** Do NOT send multiple replies in parallel — if one fails, the rest get cancelled and you have to redo them.

   Use the GitHub API to reply in-thread:

   ```bash
   node - "$SCRATCH/reply.json" <<'PAYLOAD'
   const fs = require('fs')
   const body = [
     'Fixed in abc1234 — the first line of the reply.',
     '',
     'A later paragraph, free to contain `code spans` and $dollars.',
   ].join('\n')
   fs.writeFileSync(process.argv[2], JSON.stringify({ body }))
   PAYLOAD
   gh api repos/{owner}/{repo}/pulls/{pr}/comments/{comment_id}/replies --input "$SCRATCH/reply.json" > /dev/null
   ```

   **Never pass the reply body as a shell string.** `-f body="<reply>"` runs any backtick in your text as command substitution and eats backslashes, so a reply that quotes code silently loses exactly the part that mattered — and returns HTTP 200 while doing it. This is not hypothetical: a reply on PR #2 of this repository lost three code spans that way and had to be re-posted with `PATCH repos/{owner}/{repo}/pulls/comments/{reply_id}`.

   The **quoted** heredoc delimiter (`<<'PAYLOAD'`, not `<<PAYLOAD`) is what makes this safe — it stops the shell touching the text at all. Passing the reply as a shell argument instead, even in double quotes, does not help: backticks are substituted inside double quotes too.

   The block above is indented to sit inside this list. **When you actually run it, the closing `PAYLOAD` must start at column 0** — an indented terminator does not close the heredoc and the shell reads to end of input.

   Some shells strip a level of backslash escaping from heredoc bodies. Build multi-line text as an array joined on a newline, as above, rather than relying on escape sequences inside a single string literal.

   **Re-read the thread after replying** and confirm the body says what you meant. A mangled reply is indistinguishable from a good one by response code alone.

   **Do NOT** pipe the output through `jq` or other tools that may not be installed. Redirect to `/dev/null` or use `> /dev/null 2>&1` if you don't need the response.

   Reply guidelines:
   - FIXED: "Fixed in {commit_sha_short} — {brief description of change}"
   - OUTDATED: "This code was refactored in {commit} — {explain current state}"
   - DISAGREE: State technical reasoning. No performative agreement.
   - **NEVER** write "Great point!", "You're absolutely right!", or "Thanks for catching that!"

9. **Summary**

   Print a table:

   ```
   | # | Comment | Action | Reply |
   |---|---------|--------|-------|
   | 1 | timer leak in postWithRetry | FIXED | Fixed in abc1234 |
   | 2 | outdated fire-and-forget | OUTDATED | Refactored since review |
   ```
