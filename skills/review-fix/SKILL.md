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
   gh api --paginate "repos/{owner}/{repo}/pulls/{pr}/comments?per_page=100" > pr-comments.json
   ```

   `--paginate` with `gh api` automatically follows `Link: rel="next"` headers and concatenates pages into a single JSON array. `per_page=100` is the max — keeps the round-trips low.

   **Sanity check**: after fetching, log `total: <c.length>`. If the PR thread shows more comments than that in the GitHub UI, the fetch missed pages — re-run with `--paginate`.

   **Important**: Do NOT pipe through `jq` — it may not be installed. Parse the JSON output directly with Node (`require('./pr-comments.json')`).

   **Filtering logic**:
   - Get the current git user: `git config user.login` or match against GitHub username from `gh api user`
   - Group comments by `in_reply_to_id`: comments with `in_reply_to_id` are replies, those without are top-level
   - Skip top-level comments that already have a reply from our user (check reply chain)
   - Only process top-level comments from the latest review cycle

3. **Triage each comment**

   For each comment, read the referenced file and surrounding code, then classify:
   - **FIX**: Valid issue, code change needed
   - **OUTDATED**: References code that has already been changed
   - **DISAGREE**: Technically incorrect or not applicable — prepare reasoned pushback

   For OUTDATED and DISAGREE, do NOT change code — just prepare a reply.

4. **Apply fixes**

   For each FIXABLE comment:
   - Read the referenced file and line
   - Apply the fix using Edit tool
   - If a `suggestion` code block is provided in the comment, verify it's correct before applying

5. **Verify**

   Run `pnpm typecheck` after all fixes are applied. If it fails, fix the issue before committing.

6. **Commit and push**

   Stage only files that were changed by fixes. Create a single commit:

   ```
   fix: address PR review feedback

   - <brief description of each fix>

   Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
   ```

   Push to the PR's branch (use `headRefName` from step 1):

   ```bash
   git push origin HEAD:<headRefName>
   ```

7. **Reply to each comment**

   **CRITICAL: Send replies ONE AT A TIME, sequentially.** Do NOT send multiple replies in parallel — if one fails, the rest get cancelled and you have to redo them.

   Use the GitHub API to reply in-thread:

   ```bash
   gh api repos/{owner}/{repo}/pulls/{pr}/comments/{comment_id}/replies -X POST -f body="<reply>"
   ```

   **Do NOT** pipe the output through `jq` or other tools that may not be installed. Redirect to `/dev/null` or use `> /dev/null 2>&1` if you don't need the response.

   Reply guidelines:
   - FIXED: "Fixed in {commit_sha_short} — {brief description of change}"
   - OUTDATED: "This code was refactored in {commit} — {explain current state}"
   - DISAGREE: State technical reasoning. No performative agreement.
   - **NEVER** write "Great point!", "You're absolutely right!", or "Thanks for catching that!"

8. **Summary**

   Print a table:

   ```
   | # | Comment | Action | Reply |
   |---|---------|--------|-------|
   | 1 | timer leak in postWithRetry | FIXED | Fixed in abc1234 |
   | 2 | outdated fire-and-forget | OUTDATED | Refactored since review |
   ```
