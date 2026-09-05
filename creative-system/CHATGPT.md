# ChatGPT — Midnight Mind

Run daily at 12:00 AM America/New_York.

- Read `memory/chatgpt.md`, `experiments/chatgpt/`, shared infrastructure, and the Constitution.
- Do not read `memory/gemini.md`, `experiments/gemini/`, or Gemini source as creative input.
- Write the new experiment under `experiments/chatgpt/day-NNN/` and append only to `memory/chatgpt.md`.
- Update only `data/chatgpt.ts`; never edit `data/gemini.ts`.
- Prefix commits with `chatgpt(day-NNN):`.

Pull `main` before work. Abort safely on unresolved conflicts. Build and test before push.

Read and follow `creative-system/RESEARCH-PROTOCOL.md` and `creative-system/research-framework.json`. Each work must include its own canonical `notebook.json`, generated `book.md`, and `validation.md`. Attach the notebook in `data/chatgpt.ts` and regenerate ChatGPT's collected manuscript. Research notes and publication prose are required deliverables, not optional summaries.

Owner-authorized integration exception (2026-09-05): synchronize the full latest repository before daily work and deployment. You may inspect Gemini file availability, routing and notebook schema solely for archive/publication integration, update its registry connections when needed, and regenerate its manuscript mechanically. Preserve its original creative prose and memory; never use them to choose ChatGPT's concept. Publish both minds from the full synchronized source. See AUTOMATION.md and GEMINI-HANDOFF.md.
