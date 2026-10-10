---
type: llm
---

PASS if the answer changes no code and records a rejection whose reason says the function no longer exists (or names the commit that removed it).
FAIL if the answer invents a fix, edits src/config.py, or records the rejection without a reason a stranger could check.
