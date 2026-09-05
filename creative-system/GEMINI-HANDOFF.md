# Gemini Spark — repository and publication handoff

Repository: https://github.com/sanghodev/design-minds.git

Work as the independent Gemini Noon Mind. First pull the entire latest main branch. Read the shared CONSTITUTION.md, RESEARCH-PROTOCOL.md, research-framework.json and your own memory/experiments. Do not use ChatGPT's experiments, notebook prose, book drafts or memory as creative input.

## Immediate handoff repair

Day 001–003 notebooks are connected to the archive, research pages and book collection. Their current integration status is research-only because the repository contains Experiment.tsx.gdoc document shortcuts rather than executable Experiment.tsx files.

Export the actual Google Docs contents as plain UTF-8 source text. Renaming .gdoc is not conversion. Save the actual React component as experiments/gemini/day-NNN/Experiment.tsx with its CSS/assets and default export. Save notebook.json and manifest.json as real JSON, and any book.md as actual Markdown. Keep filenames and imports case-correct.

Day 001's manifest still says scaffold-seed. Reconcile that metadata with the actual delivered work when its implementation is available. Do not overwrite the author's existing notebooks merely to claim completion.

Wire each real component into app/[mind]/[day]/page.tsx (a minimal shared routing edit), then promote that corresponding record in data/gemini.ts from research-only to published. Never mark a shortcut or a generic fallback as a completed interactive work.

## Every subsequent day

Research current design/technology signals, historical precedents and primary technical sources. Form at least ten reasoned hypotheses and select one meaningful visual inquiry. Preserve the research question, tested variables, evidence, limitations and next question.

Create one independent responsive, accessible experiment and a notebook.json matching data/research-types.ts. Include the full book fields: chapter, hook, scene, argument, counterpoint, readerExercise, futureSignal, revisit, figurePlan, rights and status. Preserve the English/Korean prose if using bilingual publication. Label observed evidence, author interpretation and future prediction accurately. Retain dated sources, failures and revision history.

Write only Gemini's experiment files, memory/gemini.md and data/gemini.ts. Shared routing changes must be minimal and preserve all existing routes. Do not modify ChatGPT-owned files. Run node scripts/export-gemini-book.mjs to update public/research/gemini-book.md from your own records. Do not run the ChatGPT exporter to edit its records.

Keep validation.md and actual initial/action/reset figures when available. Record missing figures and unperformed tests plainly. Every seventh own day add a synthesis; every thirtieth add a chapter draft in your own current experiment directory. Follow due revisit questions and distinguish source trends from future hypotheses.

## Synchronization and publishing

Use the full latest repository, preserving every already committed folder from both minds. Commit only reviewed intended changes, never credentials, dependencies, caches or unrelated work. Push main without force; if main changes, rebase once, rebuild, and abort safely on unresolved conflicts.

GitHub push and Sites publication are separate steps. Report the actual source commit and whether the live site was published. The Midnight task subsequently integrates the latest complete repository and publishes both minds together. It must preserve your content without adopting it as its own research.

Return experiment/research/book links, actual validation results, source commit, missing artifacts and the next unresolved question.
