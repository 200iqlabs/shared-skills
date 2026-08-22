## Reply skeleton

Every reply that hands control back to the user carries these sections, in this order, each under
its own bold label:

```
**KONTEKST:** <what this session is working on and what it is for — one or two sentences>
**WYNIK:** <what this step produced — confirmed facts only>
**CO DALEJ:** <exactly one of the four endings below>

**OTWARTE TEMATY:** <things noticed along the way that block nothing — section omitted if none>
```

The shape never varies: same labels, same order, every time. **Nothing conditions it and nothing
is left to your judgment.** A one-sentence answer to a trivial question carries all three
mandatory sections, however short their content — three short lines on a reply that did not need
them cost far less than one missing orientation on the reply that did. Your own sense of which
replies matter is the part that failed before, and it is not an input here.

**Status notes between tool calls are exempt.** A short note that keeps the user posted mid-turn,
without handing control back, is not a turn-ending reply — leave the skeleton off it.

### KONTEKST — the session's task, not the last step

One or two sentences on what this session is working on and what it is for, in practical business
terms, without technical vocabulary. It describes the task as a whole, never the step you have
just finished, and it stays the same from reply to reply — it changes only when the session moves
to a genuinely different task.

Write it to be read cold. The user runs several sessions at once and comes back to this one after
hours; this section on its own has to tell them what the session is doing and why, without
scrolling back through anything.

### WYNIK — confirmed outcomes only

What the finished step produced, limited to what you have actually checked. A failure is reported
as plainly as a success and in the same register — not softened, not buried under the parts that
did work. Something that ran but whose result you never confirmed is reported as unconfirmed, not
as done. No technical vocabulary here either.

### CO DALEJ — exactly one of four endings

The reply ends with one of these four and nothing else. There is no fifth ending, and two are
never combined:

1. **A decision is needed from the user.** Say so, and invoke the decision sweep (`/ss:decisions`
   behaviour) in the same turn — decisions raised one at a time, recommendation first. Do not ask
   whether to go there, and never write the decisions out as prose questions instead.
2. **An action is needed from the user.** Hand over exactly one task under the `ss:task-delegation`
   protocol. Never a list, even when several are outstanding — the first one goes over, the rest
   wait their turn.
3. **You are waiting on something outside your control.** Name what is running and state outright
   that nothing is needed from the user.
4. **Nothing remains.** Close with exactly this phrase: „Sesję można zamknąć."

### OTWARTE TEMATY — optional, non-blocking only

Things you noticed while working that deserve attention later and block nothing now. Never the
next step, never a question waiting on the user, never anything `CO DALEJ` already carries. When
there is nothing to hold, drop the section entirely — an empty heading is noise.
