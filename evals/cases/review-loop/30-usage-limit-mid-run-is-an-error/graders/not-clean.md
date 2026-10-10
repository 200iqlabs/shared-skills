---
type: llm
---

PASS if the answer terminates the loop with reason error, carries the reviewer's usage-limit message into the report and into the sign-off issue, and does not say the reviewer had nothing left to say.
FAIL if the answer ends the loop as clean, keeps iterating, or skips the sign-off record.
