# Day025 validation

Validated 2026-09-29 before the creation commit.

## Owner-direction check

1. **Concrete curiosity and specimen:** can a moving frame alter how a fixed centered square is related to its field? Two equal square fields make fixed screen coordinates and changing frame relation visible.
2. **Variable and constants:** the adjustable frame translates 0–17% of field width. Square position, size, color and orientation; frame size, stroke and vertical position; and field geometry remain constant.
3. **Why visual and interactive:** prose cannot supply simultaneous evidence that the square remains on the same center axes while the frame reaches contact. Reversible movement and a fixed reference make that construction inspectable.
4. **Day007–009 principle:** the specimen leads, the meaningful visual relation is directly manipulable, and the comparison does not depend on memory. The nested moving frame follows today's relative-position question rather than copying an older palette or shell.
5. **Challenge and evidence:** side, order, motion history, labels, frame asymmetry and color may explain any impression. Implemented states and model tests will be verified; browser captures and participant observations do not yet exist.

## Research-led form

The 2026 frame-effect study motivated moving the surrounding boundary while leaving the object fixed. Lissitzky supplies historical evidence that geometric relationships can organize a visual sequence, not evidence for this perceptual claim. The CSS transform and accessibility sources lead to an exact one-axis frame translation, semantic presets, reduced-motion support and non-drag alternatives. The relevant Day024 limitation is the contact/position confound; today's attempted correction fixes the square coordinates. It still does not isolate contact from frame asymmetry or motion history.

## Passed

- Parsed `manifest.json`, `notebook.json` and `figures/index.json` as JSON. `review-ready.json` was added only after these checks, export, implementation validation and the full build completed.
- `node --test experiments/chatgpt/day-025/model.test.mjs`: 6/6 passed. These assertions cover the 17% contact calculation, clamping, equal/opposite directions, field-relative transform conversion, construction labels, panel swap and reset. They are state-model tests, not browser or perception evidence.
- `node scripts/export-chatgpt-book.mjs` exported 25 daily manuscripts and the collected ChatGPT manuscript; `--check` passed afterward.
- `npm run build`: bounded Vinext production build completed all five environments and registered `/`, `/:mind/:day`, `/book`, `/research` and `/research/:mind/:day`.
- `node --test tests/*.test.mjs`: 49/49 passed, including all ChatGPT Day001–025 research records, existing ChatGPT/Gemini routes, both archives, both book exports and starter UI components.
- `node experiments/chatgpt/day-025/validate.mjs`: experiment and research routes returned 200; the server-rendered experiment contained English-only live UI, two fixed-square/two-frame specimens, range/status semantics, the 17% endpoint and no decorative score output. Notebook, source, future-signal, hypothesis and missing-figure contracts passed.
- A separate full-tree worker pass returned 200 for 107 experiment, research, archive and book routes: ChatGPT Day001–025, Gemini Day001–027, `/`, `/research` and `/book`. Both manuscript files were present and non-empty.
- `node scripts/export-gemini-book.mjs --check`: the mechanically collected Gemini manuscript remained current with 26 source records. Gemini creative source, notebooks and memory were not rewritten.
- Scoped ESLint passed for Day025 and every changed TypeScript/JavaScript integration file.
- `git diff --check` passed before the final marker and is repeated after the intended diff review.

## Known failures and missing evidence

- Whole-tree `npm run lint` remains red with 47 errors and 67 warnings in previously committed shared UI, tests, and Gemini current/backup components. Day025 and its changed integration scope pass; unrelated Gemini creative source and backups were not altered.
- No supported browser capture was completed. Initial, action and reset figures remain explicitly missing in `figures/index.json`.
- Hydrated pointer, hardware touch, browser keyboard behavior, screen-reader speech, reduced-motion rendering, forced colors, 400% zoom, print, multiple browsers, performance timing and participant perception were not tested.
- The fixed reference, axes and labels may prime interpretation. Moving the frame also changes frame centrality, margin symmetry and motion history; the page does not isolate edge contact.
