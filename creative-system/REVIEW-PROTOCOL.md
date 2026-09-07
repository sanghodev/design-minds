# ChatGPT post-production review

Owner-approved 2026-09-07. Read alongside the Constitution and research protocol. This is internal critical review, not external peer review or certification of graduate-level research.

## Eligibility and isolation

Review only a committed ChatGPT day with `review-ready.json` containing `status: "ready"`, `day`, and `completedAt` (ISO timestamp). Resolve its original commit from Git history and record that SHA. The producer writes this marker only after implementation, notebook, exports and validation are complete. It must publish the marker in the same commit as those deliverables. Do not review unfinished work or manufacture a ready marker for it.

Use an isolated checkout of current full GitHub main. Select the oldest ready day without a completed review, at most one per run. If none is ready, leave work untouched; the next run catches up. Never create another experiment day. Never use Gemini creative work or memory as input. Preserve the whole tree and hosting adapter.

## Critical method

Inspect and interact with the work before reading its author's interpretation; if interaction is unavailable, record that limitation. Then read sources, notebook and validation. Verify source-specific claims with primary sources where available. Review five dimensions: question/evidence logic; research-led visual decisions; whether the interaction tests the question; responsive/accessibility/performance execution; honest and interesting publication prose. Explain concrete findings and counterarguments, not decorative scores. No forced visual novelty or inherited template.

Preserve initial findings before fixes. Make at most two correction passes, prioritizing unsupported claims and broken experiences. A valid correction may narrow a claim rather than add complexity. Re-run relevant checks after each pass. Never invent user studies, successful tests, external peer review or measured improvement. Unresolved participant/expert/print validation remains an explicit gap.

Verdict: `publishable`, `publishable-after-revision`, `exploratory`, or `hold`. These are editorial judgments with reasons, not credentials. A hold preserves the historical artifact and labels the unresolved issue in canonical publication notes; it does not silently delete existing work. Do not publish failing code. If safe repair cannot be completed, retain findings in a review branch and report the blocker.

## Publication record

In the same day create `review.md` with original commit, reviewed commit, timestamps, initial findings, claim/source checks, attempted corrections, actual commands/results, verdict, remaining counterarguments and next question. Preserve original history; do not amend the original creation commit. Save supported before/after screenshots under `review-figures/`, with captions, provenance and version. Explicitly list missing captures.

Write `revision-story.md` in Korean: an actual scene, original assumption, objection, change, evidence versus interpretation, unresolved limitation and reader-interest argument. Never invent the scene as participant behavior. Update canonical notebook/book fields with the review lesson and links to these records; regenerate daily and collected manuscripts using `node scripts/export-chatgpt-book.mjs`. Append supported lessons to own memory. Mark review completion in `review.md` with `Review-Status: complete` only after the review process and evidence recording finish; this is not a pass verdict.

Every seventh completed own review, add `weekly-review.md` in that day: recurring weaknesses across own studies, strongest and weakest evidence, changed judgment, overdue follow-ups and concrete next tests. This is part of the daily review task, not a separate concurrent writer. Index its path in own memory and summarize it in canonical notebook publication notes.

## Commit and publication

Inspect intended diff; validate schema, manuscript freshness, build, available tests/lint and both minds' registered routes without adopting Gemini content. Stage only own reviewed changes and necessary publication integration. Use `chatgpt(review-day-NNN): title`. Recheck main immediately before push; if moved, rebase once, rerun affected checks, and abort on conflict. Never force push or replace a newer whole-site snapshot. Use existing authorized hosting workflow when available; report source push and full-site publication separately. Git compare-and-rebase is conflict control, not proof that another task is idle.
