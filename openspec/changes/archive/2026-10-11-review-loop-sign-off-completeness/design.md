# Design

## Context

Step 6 of `review-loop` writes the sign-off record from files in a scratch directory. Each step
runs its shell in a separate tool call, so it can only pass what it knows through files. The
current flow on an `error` ending (see proposal.md, Why):

| Step | Writes | With |
|---|---|---|
| 6.2 | `report.md`: the report | file-writing tool |
| 6.3 | `report.md`: appends the follow-up line | file-writing tool |
| 6.3 | `log-tail.txt`: the last 20 log lines, or a line saying the log could not be read | shell (`tail`, `printf`) |
| 6.3 | `error.txt`: the error text | file-writing tool |
| 6.3 | `error.txt`: appends `log-tail.txt` | shell (`cat >>`) |
| 6.4 | `sign-off.md`: `report.md`, then `error.txt` if `[ -s ]`, else NOERROR; `BODY_INCOMPLETE` to `gate.env` | shell |

The last 6.3 row is the defect: after it, `error.txt` is non-empty whenever the tail block ran,
whatever happened to the error text. The 6.4 rule that body text never travels through a heredoc
still applies. Text the skill did not author reaches the body only as a file passed to `cat`, or
as a `printf '%s'` argument.

## Goals / Non-Goals

**Goals:**

- The test that selects NOERROR reads only the error text.
- The record and the session report name exactly the parts of the body that are missing.

**Non-Goals:**

- No change to the gate's lookup, write, retry or state re-check, or to the three-way choice of
  the create, append and written lines.
- No new session warning for a missing log tail (proposal.md, Non-goals).

## Decisions

### 1. The error text and the log tail stay in separate files

`error.txt` carries the error text only. 6.3 no longer appends the tail to it. 6.4 concatenates
`error.txt` and `log-tail.txt` one under the other, each behind its own `[ -s ] && cat` test.
Each file's content is then its own evidence, the same pattern 6.4 already uses for `report.md`.
Nothing but the error text can make `error.txt` non-empty, so `[ -s error.txt ]` means "the
error text arrived".

*Alternative considered: a flag file.* 6.3 could test `[ -s error.txt ]` before appending the
tail and persist the result as `ERROR_TEXT=1`. 6.4 would then key NOERROR on that flag. Rejected:

- It adds a fourth persisted value whose absence also has to be read, because a skipped block
  and a missing error look the same.
- `error.txt` would still mix two sources, so NOERROR would print *after* the log tail it
  precedes in every other case.
- It keeps the fragile order "write, then test, then append" spread across two tool calls.

Separate files need no ordering and no new state.

### 2. 6.4 guards `log-tail.txt` with the same test

Now that 6.4 reads `log-tail.txt` itself, an absent or empty file would leave a silent gap where
the history should be: the failure 6.3's tail block was written to prevent. So 6.4 prints a
fixed line in its place: the tail of the run log did not reach this record, so it carries no
iteration history for this run. 6.3's failure branch still writes its own line with `tail`'s
stderr, because only 6.3 has that text. The 6.4 line covers the remaining case, where the tail
was never captured.

A `printf '\n'` goes between the two files. The file-writing tool does not always end the error
text with a newline. Before this change, `cat >>` then glued its last line to the first log line.

### 3. Two flags, `REPORT_MISSING` and `ERROR_MISSING`

They replace `BODY_INCOMPLETE` and are appended to `gate.env` with `printf %q`, as before. Each
session warning is then one test of one value. *Alternative: one variable listing the missing
parts* (`MISSING="report error"`). Rejected: every reader would need a substring test, and
`gate.env` keeps one fact per line.

The new session warning for `ERROR_MISSING` asks the person watching to copy the error from the
session into the record before the session ends. That person is the only reader who can still
recover the error; the issue's own NOERROR line can only point at a re-run.

### 4. The run-log line in 6.3 stops vouching for the error text

The current line says the record "carries the error text without the iteration history". When
NOERROR is printed above it, the body asserts both that the error text is missing and that it
is there. The line now says only that the record carries no iteration history for this run. It
describes its own part of the body and nothing else, as the spec's new scenario for a run
missing both parts requires.

## Risks / Trade-offs

- [Out of habit, the model writes the log tail into `error.txt` anyway] → 6.3 says that nothing
  but the error text goes into that file, and says why. New eval case 32 (error text missing, log
  present) fails if the warning does not fire.
- [A genuinely empty error string from the sub-agent reads as "missing"] → Intended. The spec
  treats missing, empty and unreadable alike, and an empty error explains nothing to the reader of
  the record.
- [The body grows one fixed line when the tail was never captured] → That is the point of the
  guard. On a normal `error` run, `log-tail.txt` is non-empty and nothing changes.
- [Kept cases 14 and 15 are scratch copies with uncalibrated Haiku judges] → Their deterministic
  regex graders decide pass or fail here. The llm rubrics are reported, and
  `behavioural-skill-evals` calibrates them when it migrates the cases.

## Migration Plan

None. The scratch directory is throwaway and each run creates it fresh. A record opened before
this change keeps its body. The next run appends a body built the new way.
