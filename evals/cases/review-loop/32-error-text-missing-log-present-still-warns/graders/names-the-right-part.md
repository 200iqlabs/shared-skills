---
type: llm
---

PASS if the answer says the record warns that the error text could not be read, still carries the tail of the run log below that warning, and the warning printed into the session names the missing error text, not the run report.
FAIL if the answer gives no warning about the error text, treats the log tail as the error text, or tells the session that the run report is missing.
