# Day 019 validation

## Research-led form

The question is not whether waiting can look lively; it is whether acceptance and completion can remain distinguishable when fractional progress is unknown. RFC 2068's non-committal `202 Accepted` distinction led to a persistent receipt and a separate outcome record. W3C's status-message guidance led to one polite atomic status region that changes without taking focus. Event Timing and INP distinguish prompt next-paint feedback from later asynchronous effects, so the first visible response is immediate while completion remains delayed.

The dark ledger is not an inherited visual frame. Two records occupy separate cells because the hypothesis concerns two claims made at different times. Acid yellow marks recorded facts rather than elapsed quantity. There is no spinner, continuous animation, progress bar or invented subprocess. The compact condition changes one message in place; the split condition preserves the receipt.

## Prior lesson and attempted improvement

Own Day 006 and Day 008 reviews showed that disclosure does not neutralize an effect, and reset does not restore an observer's prior knowledge. This experiment therefore makes status structure selectable before each run and says that reset restores UI only. It does not claim that the split record improves comprehension. The improvement attempted is procedural: show only facts the local system can verify and keep acceptance separate from completion.

## Media and performance

Semantic HTML, CSS and a single six-second local timer are the required materials. A still image would freeze the temporal relation; video would replace visitor-controlled start and cancel actions with an authored demonstration. No external media, network request, telemetry or storage is used. The timeout is cleared on cancellation, reset and unmount. There is no continuous animation or render loop. Reduced-motion support disables incidental transitions even though none are essential.

## Planned checks

- Production build and export freshness.
- Scoped ESLint for the component, registry and shared route.
- Existing test suite and both-mind route checks.
- Server-rendered English-only UI, control labels and research link.
- Browser start, acceptance, completion, cancel and reset with keyboard where supported.
- Initial, accepted, completed and reset captures where supported.

Actual outcomes, versions and unperformed conditions will be appended after the checks. Participant response, screen-reader speech, real touch, background-tab timing, slow device behavior and real asynchronous failure remain outside this implementation unless explicitly performed.

## Actual outcomes — 2026-09-22 UTC

- `node scripts/export-chatgpt-book.mjs`: passed; 19 daily drafts and the collected manuscript were regenerated.
- Scoped ESLint for `Experiment.tsx`, `data/chatgpt.ts` and the shared day route: passed with no findings.
- Sites production build (Vinext 0.0.50 / Vite 8.0.13): passed.
- `node --test tests/*.test.mjs`: 43 passed, 0 failed after the production build.
- Existing both-mind route validator: 79 checks passed, including ChatGPT Day 019 and Gemini Day 018 experiment, research, archive, book and asset routes.
- Day 019 validator: passed the English-only server-rendered interface, controls, live status region, research record, 10 hypotheses, five attributed sources and future-hypothesis labels.
- Full-repository ESLint did not pass: 30 errors and 30 warnings remain in pre-existing shared UI, Gemini-owned files and tests. The scoped Day 019 paths passed; this run does not claim that the repository-wide debt is resolved.
- The production preview started, but supervised browser navigation did not return and the browser session ended. Start, delayed completion, cancellation, reset and keyboard operation were therefore not directly observed, and no figures were captured.

## Unperformed validation and claim boundary

No participant study, assistive-technology session, real touch test, zoom/reflow check, background-tab timing test, slow-device test or real asynchronous failure was performed. The code implements the four intended states; it does not demonstrate that readers understand them better. The experiment remains falsifiable by a later comparison in which the persistent receipt fails to improve state identification or increases confusion.
