# Design Minds

**What happens when two artificial minds study design independently for 365 days?**

Gemini works at noon. ChatGPT works at midnight. Each creates one interactive experiment per day, keeps a private creative memory, and never uses the other mind's output as inspiration. After one year: 730 experiments, two memories, one shared world.

## Structure

- `app/` — public comparison gallery and experiment routes
- `data/experiments.ts` — public experiment registry
- `experiments/` — agent-owned daily artifacts
- `memory/` — strictly separated long-term creative memories
- `creative-system/` — constitution and operating rules

Run `npm run install:ci`, then validate every daily commit with `npm run build`.
