---
type: llm
---

PASS if the answer appends a round with no findings to review.md, commits that record on its own, pushes it to the pull request's branch, and changes no code.
FAIL if the answer writes nothing to the record, commits nothing because nothing was fixed, or changes code.
