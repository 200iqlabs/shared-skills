# Design — restructure-working-mode-reply-skeleton

## Context

See `proposal.md` — Why. The mode's machinery (state under `~/.claude/ss/agent-working-mode/`, session-start injection, per-message reminder, session isolation, selftest) shipped in `add-agent-working-mode` and works; the operator's complaint is entirely about the reply contract the rules produce. This change is therefore a rules-text change riding on unchanged machinery.

Decisions below were settled with the operator in the explore session on 2026-08-22; do not re-open them without new evidence.

## Goals / Non-Goals

**Goals**

- A user returning to any parallel session understands from the last reply alone what the session is doing, what just happened, and what happens next.
- Zero agent judgment in when orientation appears.
- Replies readable without technical background; reading effort proportional to content.

**Non-Goals**

- No change to activation/deactivation, state storage, hook wiring, or session isolation.
- No change to `/ss:orientation`, `/ss:decisions`, or the `task-delegation` skill themselves — the skeleton routes into them.
- No attempt to restyle mid-turn status notes.

## Decisions

- **D1 — Skeleton is unconditional on turn-ending replies.** The six-trigger list failed the primary scenario (glancing at a session that kept running matches no trigger), and agent judgment about "important" replies is the exact mechanism that failed before `add-agent-working-mode`. Constancy beats economy: three short lines on a trivial reply are cheaper than one missing orientation on the reply that mattered. Alternative (widening the trigger list) rejected — every widening still leaves a gap and still asks the agent to judge.
- **D2 — Labels: `KONTEKST` / `WYNIK` / `CO DALEJ` + optional `OTWARTE TEMATY`.** Chosen by the operator from three previewed variants. `WYNIK` over `ZROBIONE` because it is neutral and covers failures; `CO DALEJ` over `KOLEJNY KROK` because "Sesję można zamknąć" is not a step; `OTWARTE TEMATY` over the English calque `DO ZAADRESOWANIA`.
- **D3 — `CO DALEJ` is a closed list of four endings.** Same design philosophy as the stop list: enumerations survive long sessions, judgment does not. The decision ending auto-invokes the decision-sweep flow in the same turn — the operator's explicit requirement — so open questions can never again be buried as prose.
- **D4 — Describe-by-effect replaces glossing.** A gloss is the term plus ballast; the operator named glossed sentences as the thing that made reading exhausting. The plain-Polish description replaces the term instead of accompanying it. Technical vocabulary enters only on request or when the user cannot act without it.
- **D5 — Mid-turn status notes are exempt.** The returning user reads the last turn-ending reply, not the scroll of progress notes; a skeleton on every note would multiply the very noise this change removes.
- **D6 — The header dies; it is not kept alongside the skeleton.** Two orientation mechanisms would compete for the top of the reply and drift apart. `10-orientation-header.md` and `20-header-triggers.md` are replaced by a single skeleton rule file; the file count change is deliberate (the injector globs the rules directory, so deletion is safe).
- **D7 — Ordering with the decision flow: skeleton first, then the question tool.** The turn that raises a decision emits the skeleton text, then invokes the decision sweep in the same turn. The skeleton is the orientation; the sweep is the interaction.
- **D8 — Machinery untouched.** Only rule texts, the reminder, one hard-coded string in the session-start hook (the compaction notice references "trigger 2"), possibly selftest assertions that quote rule text, and the activation command's step 4. Nothing is written outside the plugin.

## Risks / Trade-offs

- **Skeleton fatigue on rapid exchanges** — accepted cost (D1); sections may be one-liners, the shape may not vary.
- **Stale `KONTEKST`** — a section copied forward mechanically could describe a finished task. Mitigation: the spec ties KONTEKST to the session's task and requires it to change when the task changes.
- **Rules must stay short** — the per-message reminder is re-injected every turn; rewriting it as a long restatement would tax every reply. Keep it within its current size.
- **Active sessions do not pick up new rules mid-flight** — rules inject at session start; sessions already running keep the old contract until restarted. Accepted; noted in release step.

## Migration / Rollout

Merge → update the installed plugin (the copy under `~/.claude/plugins/cache/` is a working copy and must never be edited directly) → new sessions get the skeleton. No state migration: the mode's on/off state files are unaffected.
