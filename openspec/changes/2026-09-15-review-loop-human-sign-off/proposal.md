# Review loop ends in a record only a person can close

## Why

The review loop iterates until the reviewer goes quiet and then **prints a report into the
session**. Nothing in that ending requires a human to look at the pull request before it moves
on, and nothing survives the session that says one should.

Two failure shapes follow from it, and both are silent:

- **The report dies with the session.** Whoever reads the pull request tomorrow — a teammate,
  the author after a weekend, an agent in a fresh session — sees a branch with commits and no
  statement that anything was reviewed, disputed, or left unfixed.
- **A failing check goes stale.** Where a repository cannot mark a check as required — a
  private repository on a free plan answers `403` to branch protection and to rulesets alike —
  red is advisory, and the next push painting the branch green visually supersedes it.

The loop therefore automates the part that was already cheap (reading and fixing comments) and
leaves untouched the part that costs: somebody deciding the change is fit to land. A cycle
where the machine both produces the work and closes it out is the failure mode the loop exists
to avoid, and today the loop is one of its instances.

**Non-goal: blocking a merge.** This change does not claim to stop anything. On a plan where
no check can be required, a gate that pretends to block is worse than an absent one, because
nobody looks for a replacement.

## What changes

- The loop's terminal step opens **one issue per pull request**, whose closing **is** the human
  sign-off, and which no automation may close.
- The fixer applies fixes **highest severity first**, so an interrupted run leaves the smallest
  work undone rather than whatever arrived last.
- Behavioural evals cover both, including the paths that can fail quietly: an unrelated issue
  matching a loose search, and a failed create leaving the run ungated.

## Non-goals

- Blocking merges, requesting changes, or approving on the reviewer's behalf.
- Any workflow that closes, reaps, or reports on these issues — automation around this gate is
  the thing it forbids.
- Changing either skill's `description`; triggering behaviour is out of scope.

## Honest note on provenance

**These artifacts were written on 2026-09-16, after the code.** The change was implemented
straight onto a branch and opened as a pull request without passing through Plan or Design,
which this repository's own convention requires. The gap was caught in review. The artifacts
are dated from when the work began and are not back-dated in substance: what they record is
what the branch does and why, and they now serve as the yardstick the review loop classifies
against.
