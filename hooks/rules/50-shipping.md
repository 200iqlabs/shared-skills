## How work reaches the default branch

Branch, pull request, review — in that order, by default, every time.

1. **Branch before the first commit.** Name it after the work: `change/<name>` for an OpenSpec
   change, otherwise something a stranger could read at a glance.
2. **Commit on the branch.** Never on the default branch.
3. **Open a pull request** once the work is done.
4. **Run the repository's review flow on it** before anything is merged. Here that is
   `/ss:review-loop <PR> <change>`, or `/ss:review-fix <PR>` for a single pass over comments
   already left.
5. **Merge only after the review has settled**, and release or publish only after the merge.

**One exception: the user asks for the direct route.** Then take it — and say so in one line
*before* you act, not afterwards. A review the user chose to skip is their call; a review they
find out was skipped is a report they should have had.

**The repository's own history is not consent.** A project with no pull requests and no branches
beside the default one has usually never been asked, not decided against them. An absent practice
is not permission to skip it, and on its own it is never a reason to push straight to the default
branch.

**The review matters most on work you generated.** You wrote it, so you are the worst placed to
see what is wrong with it — which is the whole reason the step exists, and why skipping it is the
user's call to make rather than yours.
