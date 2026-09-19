# Day010 — Between Is Not Belonging

Recorded 2026-09-19. Creation validation, not a post-production review or participant study.

## Source and recovery

- Started from full GitHub main `a90f758efc9c9f373589de630793dfe376dbe76b`; ChatGPT Day009 already existed and Day001 was not scaffold seed.
- Main moved to `0f612bfcb73f64b2b9e1915e78d06676fb41c2d9`. Stashed local work, rebased once, restored it, and regenerated three conflicting generated integration files mechanically. No Gemini notebook, creative source or memory was rewritten. Full rebuild followed.
- Preserved the established Sites adapter from source commit `2554708d34f45479eac984bc43b2ab22dac0ba7c`: package manifest/lock, Vite/Worker plugin and installation/environment scripts. The GitHub-only source had no runnable Worker adapter and tests expected that output.
- Gemini Day017/018 real Experiment.tsx files arrived in the new main. Day018 initially failed server rendering because it uses hooks without a client boundary. Added a generated client gateway in shared routing without editing its creative component. All 18 Gemini experiment and research pages then rendered.
- Automation inspection showed both Midnight and Critical Review disabled. Both were re-enabled on the owner's request. The tool did not expose a disable reason or detailed run history; do not invent one or treat enabled state as successful production.

## Research-led form and evidence

- Sources: W3C CSS Gaps Working Draft (2026-06-24), Wertheimer original (1923, translated 1938), W3C relationship guidance (updated 2026-03-09), accessed 2026-09-19.
- Question/variable/constants/challenge and ten scored alternatives are in manifest.json. Scores select work; they are not outcomes. The historical mechanism is attributed, not claimed as an invention.
- Exact reversible SVG positions make the interval the material. Monochrome marks avoid a color-group cue; ordered IDs enable notes; separately revealed brackets identify authored membership. Generated photography/video would introduce irrelevant appearance/perspective/timing. No generated media was required or produced.
- Prior lesson: Day008 review found disclosure before observation; Day006 review distinguished disclosure from correcting perception. Attempted improvement: hidden initial membership and separate reveal action. Server HTML verifies hidden initial membership, not absence of priming or better comprehension.
- No 30/90-day follow-up is due yet. Existing Day031–039/094–099 revisits remain; framework checks planned October 5 / December 4. Day010 revisit dates: October 19 / December 18, or own Day040/100 if earlier. Weekly/chapter output not due on Day010.

## Actual checks

- Integrity-pinned installation completed. Vinext 0.0.50 / Vite 8.0.13 production Worker build passed after synchronization and routing correction.
- `node experiments/chatgpt/day-010/validate-routes.mjs`: **61 passed** — 56 experiment/research paths (10 ChatGPT + 18 Gemini), 3 archive/framework/book pages, 2 byte-matched manuscript assets. This invokes the built Worker; it is not live deployment or hydration validation.
- `node scripts/export-chatgpt-book.mjs --check`: current, 10 daily manuscripts. Gemini exporter check: current, 18 notebooks, mechanically preserved.
- Scoped ESLint: passed for Day010 component and route-validation script, ChatGPT registry, shared experiment page and registry generator.
- Full Node suite: **31/34 passed**. Three pre-existing starter component tests cannot import absent `components/ui/progress.tsx`, `chart.tsx`, `sidebar.tsx`. No tests were deleted or weakened to claim a green suite.
- Whole-tree ESLint: **28 errors / 28 warnings**, in existing Gemini components/versioned files and archive-window test. Not rewritten within independent creative ownership. Scoped changed production files passed.
- Browser: supervised preview started. Cloud navigation/DOM request did not return after a bounded wait and the orchestration was stopped. Subsequent runtime no longer held the browser binding. **No keyboard/touch/desktop/mobile interaction, screenshots, assistive-technology or zoom result is claimed.** Missing initial/action/reset captures are recorded in figures/index.json.
- Source inspection: native range/buttons/input; 44px minimum control height; visible focus; SVG name/description and textual membership; no animation loop, no external media, no network submission or durable note storage; reduced-motion and forced-colors CSS. This is implementation evidence, not device certification.

## Publication boundary

Implementation, canonical notebook, generated book, memory and this validation record are ready for committed exploratory review, with the above gaps disclosed. Source push and deployment are performed after this record and must be confirmed separately in the delivery response. A ready marker does not assert participant efficacy or all repository checks green. This task does not write the separate critical review's verdict.

## Remaining gaps and lesson

Real participants, counterbalanced direction/disclosure, calibrated viewing, physical touch, screen-reader speech, enlargement, matched screenshots and print proof remain outstanding. Main lesson: resetting the screen does not reset a reader's knowledge; hiding disclosed membership again cannot recreate a first observation.
