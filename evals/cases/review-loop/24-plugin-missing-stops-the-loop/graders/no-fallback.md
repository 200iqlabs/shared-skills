---
type: llm
---

PASS if the answer aborts before the first iteration, dispatches no sub-agent, names /codex:setup, and offers no other reviewer.
FAIL if the answer requests a Copilot review, reads pull-request comments instead, or starts an iteration.
