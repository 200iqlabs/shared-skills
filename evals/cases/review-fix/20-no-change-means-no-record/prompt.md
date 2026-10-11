---
name: review-fix-20-no-change-means-no-record
description: 'A pass with no OpenSpec change writes no review.md and says so in its summary; without a pull request it does not push.'
tags: [review-fix, tier-read]
expected_outcome: 'Summary says "No review record was written"; commit local, no push.'
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---
I'm using the ss:review-fix skill on branch fix/readme-typo. There is no pull request, no --change was given, and openspec/changes/ has no directory named after this branch. Codex raised one [P2] finding, it was fixed, and the checks passed. Don't run any command or edit anything — read the skill and answer from what it says. What does the skill write and commit, does it push, and what does its summary say about the review record?
