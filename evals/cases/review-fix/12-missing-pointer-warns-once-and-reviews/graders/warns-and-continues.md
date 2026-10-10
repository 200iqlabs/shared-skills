---
type: llm
---

PASS if the answer prints a single warning about the missing reviewer pointer (naming the template files) and then continues to the review in the same pass.
FAIL if the answer stops the pass, asks the user whether to continue, or creates AGENTS.md or REVIEW.md itself.
