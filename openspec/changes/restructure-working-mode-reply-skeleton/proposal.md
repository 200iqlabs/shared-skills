# Restructure working-mode replies around a constant skeleton

## Why

The shipped working mode still fails its primary user scenario: returning to one of several parallel sessions and understanding at a glance what it is doing. The orientation header fires on a closed list of six conditions, and "user glances at the tail of a session that kept running" is not one of them — so the last reply usually carries no orientation. Separately, the gloss-in-parentheses rule produces long, heavy sentences ("tłumaczenia są skomplikowane i długie"), and replies still lean technical. The operator reports reading the output is exhausting.

## What Changes

- **Every reply that ends a turn carries a fixed four-section skeleton**: `KONTEKST` (what this session is doing and why, business terms, stable across the session), `WYNIK` (what this step produced, verified facts only, failures included), `CO DALEJ` (exactly one of four closed endings), and optional `OTWARTE TEMATY` (non-blocking items noticed along the way). No trigger conditions, no agent judgment about when it is needed — mid-turn status notes are the only exemption.
- **The `Gdzie jesteśmy / Po co` orientation header and its six-trigger list are removed** — the `KONTEKST` section takes over their role unconditionally. **BREAKING** for anyone pattern-matching the old header lines.
- **`CO DALEJ` has a closed list of four endings**: (1) a decision is needed → the decision-sweep flow (`/ss:decisions` behaviour) is invoked automatically in the same turn, never written out as prose questions; (2) one task for the user → the task-delegation protocol, one item at a time; (3) waiting on an external process, nothing needed from the user; (4) the work is done → the exact phrase „Sesję można zamknąć."
- **The `/ss:working-mode` confirmations are exempt from the skeleton.** Activation, deactivation and status each collapse to a single line reporting what the command did. The operator runs the switch first, waits, and only then states the real task — so three sections above a one-line confirmation orient nobody. The exemption is a closed list of three named replies, alongside mid-turn status notes; it is not a judgment about which replies are "only confirmations".
- **Work reaches the default branch through a branch, a pull request and a review.** A direct push is taken only when the user explicitly asks for it, and is announced in one line before it happens rather than after. The repository's own history is not evidence of consent: this project had never opened a pull request, and the agent read that as licence to push the working-mode rules straight to `master` unreviewed. The stop list's "targets production" is widened to name pushing to the default branch, merging a pull request and publishing a release, because it plainly failed to bring those to mind.
- **Glossing is replaced by describe-by-effect**: instead of a technical term plus a parenthesised translation, the thing is described by what it does in plain Polish. Technical detail (tool names, file paths, commands, library names) appears only when the user asks for it or when the user cannot act without it.
- Rule texts, the per-message reminder, the activation command, and the hard-coded trigger reference in the session-start hook are updated accordingly. The hook machinery itself (state, injection, session isolation) is untouched.
- The on-demand `/ss:orientation` command, the task-delegation skill, and the decision-sweep command are unchanged.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `agent-working-mode`: gains a requirement that work reaches the default branch through a branch and a pull request, and the stop-list requirement is modified so that "targets production" names pushing, merging and publishing outright. The two orientation-header requirements (constant shape, closed trigger list) are removed and replaced by reply-skeleton requirements (constant skeleton in every turn-ending reply; section contracts for KONTEKST, WYNIK, CO DALEJ, OTWARTE TEMATY; closed list of four CO DALEJ endings with automatic routing to the decision sweep and the delegation protocol). The reply-style contract is modified: glossing is dropped in favour of describe-by-effect, and technical detail becomes on-request only.

## Impact

- `hooks/rules/00-reply-style.md` — strengthened contract (describe-by-effect, technical detail on request).
- `hooks/rules/10-orientation-header.md`, `hooks/rules/20-header-triggers.md` — replaced by a single reply-skeleton rule file.
- `hooks/rules/30-stop-list.md` — wording of item 5 aligned with the automatic routing in CO DALEJ; item 1 names pushing to the default branch, merging a pull request and publishing a release. The five reasons themselves are unchanged.
- `hooks/rules/50-shipping.md` — new: the default branch → pull request → review route, and the one named exception.
- `hooks/rules/reminder.md` — rewritten to restate the skeleton instead of the header.
- `hooks/session-start.mjs` — the compaction message references "orientation header (trigger 2)"; must reference the skeleton instead.
- `hooks/selftest.mjs` — assertions that quote rule text may need updating.
- `commands/working-mode.md` — activation step 4 describes the first reply's obligations; must describe the skeleton.
- `README.md` / `CHANGELOG.md` — user-facing description of the mode.
- After merge: plugin update so the installed copy under `~/.claude/plugins/cache/` picks up the new rules.
