---
description: Surface open decisions one at a time, each with a recommendation, and wait for the answer before the next
---

# Decision sweep

Goal: drive every unresolved decision in the current context to a clear answer, **one at a time**, so the user can reply in sequence without losing track.

Optional scope: `$ARGUMENTS` (e.g. a change name, a file, a feature). If empty, use the current conversation/work as scope.

## Język i forma (najważniejsze)

The user often drowns in a single English wall-of-text where every topic is mashed together. This command exists to prevent exactly that. So, when talking to the user:

- **Always write in Polish** — questions, options, and the final recap. (Default; only switch if the user is clearly working in English.)
- **One topic at a time.** Never merge several decisions into one block — separating them is the whole point.
- **Plain, human language.** Before the options, say in 1–2 sentences what the decision actually means and why it matters. No jargon dumps, no dense paragraphs.
- **Translate jargon.** If a technical or English term is unavoidable, gloss it in parentheses on first use (e.g. "ryczałt (stały procent od przychodu)"). Otherwise avoid it.
- **No English filler in option labels.** Short Polish labels; put the trade-off in the description.

## Procedure

1. **Collect.** Scan the current context (this conversation, any open explore/proposal/spec, recently read code) and list every genuinely-open decision or ambiguity. A "decision" is a fork where the user's answer changes what gets built — NOT something you can resolve yourself from the code or a sensible default. Resolve those silently and state the default you took.

2. **Order.** Sequence the decisions so earlier answers don't get invalidated by later ones (schema/shape before details; blocking before optional; cheap-reversible last).

3. **Ask one at a time.** For EACH decision, in order:
   - Use the `AskUserQuestion` tool with a **single** question (do not batch multiple decisions into one call).
   - Begin the question text with a progress counter: `DECYZJA X z N: <temat>` so the user always knows how many remain and feels you are going through them in order.
   - Then give a 1–2 sentence plain-Polish framing: `O co chodzi: ...` (what is actually being chosen) and `Czemu ważne: ...` (what the answer blocks or affects). Keep it short — this explanation must not itself become a wall of text.
   - Give 2–4 concrete, mutually-exclusive options with short Polish labels (1–5 words); put the trade-off in each description.
   - Put **your recommendation first** and mark it `(rec)` with a one-line rationale in its description.
   - Wait for the answer. Do NOT move to the next decision until this one is answered.

4. **Adapt.** If an answer changes the remaining set (makes a later decision moot, or surfaces a new one), re-collect and re-order before continuing. Tell the user when this happens.

5. **Summarise.** When all decisions are resolved, output a compact recap in Polish: `decyzja → wybór` for each, plus any defaults you took silently in step 1. Then state the next action (e.g. "gotowe do /opsx:new") and stop — do not start implementing unless the user asked you to.

## Rules

- One decision per `AskUserQuestion` call. Never dump a numbered list of questions as plain text and ask the user to answer them all at once — that defeats the purpose.
- Write to the user in Polish, in plain human language, one topic at a time. Explain each decision before its options; never emit an English wall-of-text. (See "Język i forma".)
- Always carry a recommendation. "No opinion" is rarely true; if genuinely neutral, say why and pick the lower-risk/cheaper-to-reverse option as the rec.
- Don't invent decisions to look thorough. If there's nothing real to decide, say so and stop.
- Keep each option label short (1–5 words); put the trade-off in the description.
