# Day024 validation

Validated 2026-09-28 before the creation commit.

## Passed

- Parsed `manifest.json`, `notebook.json`, `figures/index.json` and `review-ready.json` as JSON.
- `node --test experiments/chatgpt/day-024/model.test.mjs`: 6/6 passed. These assertions cover clamping, the 33% center calculation, logical-side positioning, mirroring, color swap and reset. They are state-model tests, not browser or perception evidence.
- `npm run build`: bounded Vinext production build completed all five environments and registered `/`, `/:mind/:day`, `/book`, `/research` and `/research/:mind/:day`.
- `node --test tests/*.test.mjs`: 48/48 passed, including all ChatGPT Day001–024 research records, existing ChatGPT/Gemini routes, both archives, both book exports and downloadable assets.
- `node experiments/chatgpt/day-024/validate.mjs`: experiment and research routes returned 200; the server-rendered experiment contained English-only live UI markers, two square specimens, range/status semantics and no decorative score output. Notebook, source, future-signal, hypothesis and missing-figure contracts passed.
- `node scripts/export-chatgpt-book.mjs --check`: 24 daily manuscripts and the collected ChatGPT manuscript were current.
- `node scripts/export-gemini-book.mjs --check`: the mechanically collected Gemini manuscript remained current with 26 source records. Partial original drafts are preserved in that raw export; the live book surface separately admits only schema-complete publication records.
- Scoped ESLint passed for Day024 and every changed TypeScript/JavaScript integration file.
- `git diff --check` passed.

## Shared integration correction

The latest upstream Gemini tree supplied 27 executable components, but only 10 notebooks currently contain every required publication field and a next question. The generated registry had promoted all 27 and `/book` failed while rendering missing fields. The integration generator now marks only schema-complete records `published`, keeps the remaining 17 `research-only`, and the live book surface includes only complete publication records. The raw collected Gemini manuscript remains a mechanical preservation export. Gemini notebook prose, components and memory were not rewritten.

## Known failures and missing evidence

- Whole-tree `npm run lint` remains red with 47 errors and 66 warnings in previously committed shared UI, tests, and Gemini current/backup components. The Day024 and changed integration scope passes; unrelated Gemini creative source and backups were not altered.
- No supported browser capture was completed. Initial, action and reset figures remain explicitly missing in `figures/index.json`.
- Hydrated pointer, hardware touch, browser keyboard behavior, screen-reader speech, forced-colors rendering, 400% zoom, print, multiple browsers, calibrated color, performance timing and participant perception were not tested.
- The centered reference and labels may prime interpretation. Increasing margin also changes horizontal position and centrality; the page does not isolate edge contact.
