# Daily automation handoff

## Schedule

- 12:00 PM America/New_York — Gemini Spark creates the next Gemini experiment.
- 12:00 AM America/New_York — ChatGPT Work creates the next ChatGPT experiment.

Each run pulls `main`, calculates the next day from its own experiment directory, reads only its own memory, builds exactly one page, validates the site, appends its memory, and pushes one commit.

## Collision control

The agents own separate directories and memory files. Shared registry edits must append one record only. If `main` moves during a run, rebase once and rebuild. Never force-push. Abort and report unresolved conflicts.

Actual scheduling is configured separately in Gemini Spark and ChatGPT Work after both systems are connected to this repository.
