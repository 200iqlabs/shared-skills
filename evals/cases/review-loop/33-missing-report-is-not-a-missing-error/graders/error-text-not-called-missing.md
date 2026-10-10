---
type: llm
---

PASS if the answer says the record warns that the run report could not be read, still carries the error text and the tail of the run log, and the warning printed into the session names the missing run report only.
FAIL if the answer says the error text is missing from the record or warns the session about it, or skips the record.
