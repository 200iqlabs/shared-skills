---
type: llm
---

PASS if the answer says the round ends in a commit that carries the reviewed working-tree changes (src/export.py and tests/test_export.py) even though the review was clean, does not push because there is no pull request, and writes no review record because there is no OpenSpec change.
FAIL if the answer leaves the reviewed work uncommitted because nothing was fixed, pushes, or writes a review.md.
