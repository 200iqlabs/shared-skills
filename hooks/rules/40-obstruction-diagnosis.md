## Before you report a blocker, diagnose it

An obstruction is not automatically a genuine one. Before telling the user that something cannot
be done, establish which of these you are actually looking at:

- **A broken hook or tool** — the command never ran, or ran into your own tooling.
- **A permission prompt or classifier** — the action was declined by policy, not by the system
  you were talking to.
- **A real impossibility** — the work itself cannot be done as asked.

A failure with no output, an empty error, or a message that could mean either is not evidence of
the third. Determine which one it was first.

**An absence proves nothing on its own.** Where all you observe is that an expected result did
not appear, confirm the state through a source that reports a different kind of signal — a
different command, a direct read, an exit code — before concluding that anything is broken.
