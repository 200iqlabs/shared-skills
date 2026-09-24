# Design — where the gate stands and why there

## The constraint that decides everything else

On a private repository under a free-plan organisation, branch protection and rulesets both
answer `403`. No check can be marked required, so **the merge itself cannot be gated** — not by
a workflow, not by the reviewer, not by this loop. Every design below is a consequence of
taking that seriously instead of building something that looks like a gate.

Two kinds of door remain:

| Kind | Example | What it holds |
|---|---|---|
| a door the platform holds | a step that only runs when a person dispatches it | the action itself |
| a record the platform keeps | an issue nobody automated may close | attention, not the action |

This change builds the second. The first is available only where there is a discrete action to
withhold; a merge is not one here.

## Decision: an issue, not a check, not a comment

A check that cannot be required is advisory, and worse, it is advisory in a way that **looks
authoritative** — red next to a merge button reads as a blocker until someone merges anyway and
learns it is not. A pull-request comment is closer, but it is one entry in a thread that grows,
and nothing distinguishes an unanswered one from an answered one.

An issue has the property neither of those has: it is **open or closed**, that state is visible
without reading anything, and closing it is an act with an author. The repository already uses
this shape elsewhere for governance signals, which is evidence about its readability rather
than about this particular gate.

## Decision: the closing act is the sign-off, and no machine performs it

The guardrail sits beside the existing prohibition on merging and approving, and for the same
reason. A gate an automation can close is a gate that closes itself; the interesting failure is
not a malicious one but a helpful one — a later run of the same loop "tidying up" its own
record.

This is why the change adds no companion workflow. Paperwork that files and closes itself is
paperwork nobody reads.

## Decision: match an existing record by exact title, never by search terms

Issue search treats a title query as independent words, so a query built from the pull request
number and a few words also matches unrelated open issues carrying them. Appending the report
to one of those leaves the gate uncreated **while returning success** — the worst shape a
failure can take here. The lookup therefore builds the canonical title once and compares it
whole.

Deduplication is best-effort by design. Listing then creating is not atomic, so two loops
finishing on the same pull request can both create. A duplicate is noise; a missing record is a
gate that was never there. The trade is resolved in favour of noise, explicitly, so that a
future reader does not "fix" it into a check-then-skip that loses records under a race.

## Decision: the body is built in a file

The report carries literal backticks and may carry error text from the fixer sub-agent. Passed
as a shell argument, a backtick becomes command substitution: the record is mangled or the
content executed, **and the call still returns success**. The same rule already governs reply
bodies in the fixer skill, for the same reason and after the same failure.

## Decision: a failed write is announced, not swallowed

Issues disabled, a missing permission, a platform hiccup — each leaves the loop having printed
a report and created nothing. Silence there produces the exact state the change exists to
prevent, and it is indistinguishable from success for anyone reading the report. So: retry
once, then declare the run ungated in a line the report cannot bury.

On an `error` termination the body carries **the error text itself**, not a pointer to the log
entries above it. Those entries live in the session transcript, and outliving that transcript
is the whole purpose of the record.

## Decision: severity orders the fixer's work

The reviewer already ranks its own findings. The loop runs under an iteration cap and a
timeout, so some run will be cut short — and what survives should be chosen, not incidental.
Fixing highest severity first makes the cut fall on the smallest work.

Measured on one pull request in a sibling repository: 61 tagged findings, 9 of the highest
rank, 48 middle, 4 lowest. Under a mapping that collapses the top two into one level, an
interrupted run had no way to tell which nine mattered most.

This sits in the fixer skill rather than in any repository's review policy, because it is a
property of how work is sequenced, not of what the reviewer should look for.

## Rejected: gate the deployment step instead

A pre-build step can refuse to proceed until a sign-off exists for the commit, and unlike
everything above it genuinely blocks. It was rejected for this change: it delays every
deployment including the ones that risk nothing, and it converts a review gate into a release
gate — a different control with a different owner. It stays documented as the variant for
somebody whose risk profile justifies the cost.
