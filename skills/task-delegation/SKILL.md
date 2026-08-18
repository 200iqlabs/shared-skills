---
name: task-delegation
description: "Use when you have work that needs the user rather than you — a login, a credential, an approval, a purchase, a physical action, access to a system you cannot reach, or a step only they are permitted to take. Hands it over one task at a time, in Polish, with a position counter, and waits for confirmation before raising the next. Trigger this instead of writing a numbered to-do list for the user, instead of ending a reply with several asks at once, and instead of 'oto co musisz zrobić: 1... 2... 3...'. Also trigger on 'co mam zrobić', 'czego ode mnie potrzebujesz', 'daj mi zadania', 'co jest po mojej stronie', 'what do you need from me'. Do NOT use when the user has to pick between options — that is a decision and belongs to /ss:decisions."
license: Apache-2.0
---

# Task delegation

Hand work to the user **one task at a time**, and only work you genuinely cannot do yourself.

A batch of instructions looks efficient and reads as a wall. The user has to work out which item
to start with, which ones depend on each other, and which have quietly stopped applying since you
wrote them. One task, confirmed, then the next — that is the whole protocol. It is the sibling of
`/ss:decisions`, which does the same thing for choices.

Write to the user in Polish, in plain language.

## Before anything: is this really a task for the user?

Most of what feels like a task for the user is work you have not tried yet. Filter hard:

**Delegate** work that needs something you do not have and cannot get: a credential or an access,
an approval from someone outside the project, a payment, a physical action, a click in a system
you cannot reach, a step only the user is permitted to take.

**Do not delegate** because it would be quicker to ask, because you are unsure which way to go, or
because you would like the reassurance of a confirmation. Uncertainty that does not change the
deliverable is yours to resolve: choose, state the assumption in one line, and carry on.

**Not a task at all** if what you need is the user *choosing* between options rather than *doing*
something. That is a decision — route it to `/ss:decisions` and say that is where it is going.
Mixing the two is what produces replies the user cannot answer in one pass.

If the filter empties the list, say so and keep working. An empty list is a good outcome.

## Bound the set to the stage you are on

Collect only the tasks needed to close the piece of work in front of you. Work that will matter
two stages from now is not yet real — requirements move, and a task raised early is often a task
raised twice. Keeping the set short is also what makes the counter meaningful: "1 z 2" is a
promise the user can hold you to.

## Present one task

For each task, in order, one per reply:

```
**ZADANIE X z N: <krótki temat>**

<1–2 zdania: co trzeba zrobić i po co — zwykłym językiem, bez żargonu>

Skąd będę wiedzieć, że gotowe: <co zaobserwuję — plik, status, odpowiedź, zrzut ekranu>
```

Then stop and wait. Do not list the remaining tasks, do not preview them, do not add "a potem
jeszcze...". The counter already tells the user how many are left; that is enough.

A task has to survive being read on its own, hours later, without the transcript. Someone reading
only that block should know what to do, why it matters, and what "done" looks like. If it does
not, you have written a reminder to yourself, not a task.

Order the set so that earlier answers cannot invalidate later tasks — access before the thing that
needs the access, blocking before optional.

## Handling what comes back

- **A question** — answer it and stay on the same task. Asking is not progress through the set;
  it is the user trying to do the current task properly. Re-present nothing, just answer.
- **Confirmation** — move to the next task, or, if that was the last one, resume your own work.
- **A decline or a deferral** — record it, say what it costs, and continue with whatever remains
  possible without it. Do not argue and do not re-raise it in the same set.

## Re-derive when an answer changes the set

An answer often removes a later task or reveals a new one. When that happens, redo the set before
presenting anything else, tell the user in one line what changed, and continue with corrected
numbers:

> Twoja odpowiedź załatwiła też zadanie 3 — zostają dwa, nie trzy.

Silently renumbering is worse than not numbering at all: the counter is the thing the user is
tracking, and it has to stay honest.

## When the set is empty

Once the last task is resolved, go back to work. The tasks existed to unblock something — resume
it rather than reporting that you are unblocked and waiting to be told to continue.

## Worked example

**Input:** the agent needs a Stripe API key, needs the user to approve a pull request, and needs to
know whether invoices go out weekly or monthly.

**Filter:** the key and the approval are tasks. The invoicing cadence is a choice — it goes to
`/ss:decisions`, not into this set.

**Output (first reply):**

> **ZADANIE 1 z 2: klucz API do Stripe**
>
> Potrzebuję klucza testowego ze Stripe, żeby podpiąć płatności — bez niego nie uruchomię ani
> jednego przelewu na środowisku testowym. Wygenerujesz go w panelu Stripe → Developers → API keys
> (klucz testowy, zaczyna się od `sk_test_`).
>
> Skąd będę wiedzieć, że gotowe: wklejasz go tutaj albo mówisz, że jest już w `.env`.
>
> (Osobno: cykl fakturowania — tygodniowy czy miesięczny — to decyzja, nie zadanie. Wezmę ją przez
> `/ss:decisions`, jak zamkniemy zadania.)

Then wait. Task 2 is not mentioned beyond the counter.
