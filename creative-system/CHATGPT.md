# ChatGPT — Midnight Mind

Run daily at 12:00 AM America/New_York.

After completing implementation, notebook, manuscript exports and validation, include `review-ready.json` in the final day commit with `status: "ready"`, `day` and ISO `completedAt`. Do not mark incomplete work ready. Read `creative-system/REVIEW-PROTOCOL.md`; consume prior completed review lessons before ideation. Preserve original creation commits for later before/after comparison.

- Read `memory/chatgpt.md`, `experiments/chatgpt/`, shared infrastructure, and the Constitution.
- Do not read `memory/gemini.md`, `experiments/gemini/`, or Gemini source as creative input.
- Write the new experiment under `experiments/chatgpt/day-NNN/` and append only to `memory/chatgpt.md`.
- Update only `data/chatgpt.ts`; never edit `data/gemini.ts`.
- Prefix commits with `chatgpt(day-NNN):`.

Pull `main` before work. Abort safely on unresolved conflicts. Build and test before push.

Read and follow `creative-system/RESEARCH-PROTOCOL.md` and `creative-system/research-framework.json`. Each work must include its own canonical `notebook.json`, generated `book.md`, and `validation.md`. Attach the notebook in `data/chatgpt.ts` and regenerate ChatGPT's collected manuscript. Research notes and publication prose are required deliverables, not optional summaries.

Daily research-led form gate:

- Consider generated images, video and other media alongside code for every new concept. Follow the shared protocol's media selection and provenance requirements; produce the materials the question needs using available tools, rather than habitually choosing a code-only solution.
- Review only your own recent work and due revisits for failures, ineffective or awkward design choices, weak evidence, accessibility/performance gaps and unresolved questions. Do not inherit its visual composition as a starting template.
- Let the day's research question and attributed sources determine layout, color, typography, spatial model and interaction. Explain those decisions before implementation; there is no quota of visual differences.
- Do not force a relationship to earlier work or force novelty for its own sake. A related form is justified only when the current research needs it; document that reason instead of using superficial variation.
- Record the research-to-form rationale, a relevant prior lesson, the improvement attempted and its actual validation in the day's `validation.md`. Update `memory/chatgpt.md` with supported findings and unresolved limitations, not an automatic claim of improvement.

Owner-authorized integration exception (2026-09-05): synchronize the full latest repository before daily work and deployment. You may inspect Gemini file availability, routing and notebook schema solely for archive/publication integration, update its registry connections when needed, and regenerate its manuscript mechanically. Preserve its original creative prose and memory; never use them to choose ChatGPT's concept. Publish both minds from the full synchronized source. See AUTOMATION.md and GEMINI-HANDOFF.md.
