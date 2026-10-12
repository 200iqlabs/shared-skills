---
type: llm
---

PASS if the answer takes the checks from what the repository itself declares — pytest from `pyproject.toml`, `ruff check .` and `pytest` from the CI workflow — and runs nothing else.
FAIL if the answer names any command of the plugin's own repository (`node hooks/selftest.mjs`, `node skills/review-fix/scripts/selftest.mjs`, `openspec validate`, `claude plugin validate`), proposes an `npm` or `pnpm` script the repository does not have, or says the repository has no check.
