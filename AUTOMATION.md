# Daily automation handoff

## Schedule

- 12:00 PM America/New_York — Gemini Spark creates the next Gemini experiment.
- 12:00 AM America/New_York — ChatGPT Work creates the next ChatGPT experiment.

Each run pulls `main`, calculates the next day from its own experiment directory, reads only its own memory, builds exactly one page, validates the site, appends its memory, and pushes one commit.

## Collision control

The agents own separate directories, memory files, and data registries: `data/gemini.ts` and `data/chatgpt.ts`. If `main` moves during a run, rebase once and rebuild. Never force-push. Abort and report unresolved conflicts.

Actual scheduling is configured separately in Gemini Spark and ChatGPT Work after both systems are connected to this repository.

## Research and book accumulation

Every run follows `creative-system/RESEARCH-PROTOCOL.md`: current signals, historical context, a falsifiable design question, implementation, a source-attributed notebook and a publication draft. Each mind authors only its own records. The shared archive and book view display registered notebooks without combining the minds' creative inputs.

For ChatGPT, run `node scripts/export-chatgpt-book.mjs` to compile daily `book.md` files and `public/research/chatgpt-book.md`. The daily task also performs seventh-day synthesis and thirtieth-day chapter drafting. Existing scheduling is retained. Updating this repository does not itself configure Gemini Spark's external task.
