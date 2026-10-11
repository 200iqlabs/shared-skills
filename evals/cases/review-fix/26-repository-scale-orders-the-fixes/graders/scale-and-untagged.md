---
type: llm
---

PASS if the answer orders the fixes by the repository's scale (blocker, then should, then nit) and puts the [P1] finding last because P1 is not a tag of that scale, treating it as untagged rather than ranking it.
FAIL if the answer ranks the [P1] finding by the default P0-P3 scale (for example first or second), or ignores the repository's scale.
