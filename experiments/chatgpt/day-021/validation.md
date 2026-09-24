# Day 021 validation

## Owner-direction check

1. Concrete curiosity: can one uniform amount of tracking make unlike letter pairs look evenly spaced? The specimen is a large live word containing diagonal, vertical and overhanging pairs.
2. The visitor changes one added tracking value applied to both rows. Word, Inter file, size, weight and color within each comparison stay fixed. The visible relationship is pair-aware GPOS positioning versus kerning disabled.
3. The difference exists in the negative spaces between real glyph shapes. Prose or a status label cannot provide the simultaneous comparison.
4. Carry Day009's simultaneous typographic specimen and Day007's type-as-space principle. Day021 does not reuse their shell or palette; full-width rows follow the need to compare one word without remembering a prior state.
5. Identical rendering, reversed judgments across word/order/size, or font-loading and browser differences would challenge the interpretation. Implemented states exist in code; browser captures and participant observations do not yet exist.

## Research-led form and prior lessons

The 2026-08-14 CSS Text Level 4 draft distinguishes added tracking from kerning. OpenType 1.9.1 describes pair adjustment positioning. These lead to identical tracking in both rows while the kerning condition differs. Johnston's 1906 discussion of sufficient interspaces and adapting spacing to circumstances supplies a historical craft precedent, not a quantitative rule. Day006/008 review lessons remain: disclosing a rule does not neutralize perception, and equal values do not prove equal appearance. Therefore labels and optional bands describe conditions without announcing a winning row.

## Media and rights

The exact locally bundled Inter WOFF2 is reused because real font positioning is the research material. Its SHA-256 is `693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3`; the bundled OFL text hash is `262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a`. See `asset-ledger.json`. Rasterized words would prevent live spacing and selection; invented SVG glyphs would replace the font's pair data with authored approximations. No external image, video, audio, network request, storage or analytics is used.

## Revisit and integration checks

Sources accessed 2026-09-24. No existing 30/90-day or framework revisit is due before 2026-10-05. Day021 adds Day051/2026-10-24 and Day111/2026-12-23. Because this is the twenty-first own research day, `synthesis-week-003.md` is included. Day030 chapter work is not yet due. Full current main was synchronized before production; Gemini executable files through Day023 were preserved for archive and publication integration, while `.gdoc` shortcuts were not treated as executable work or creative input.

## Validation results

- `node --test experiments/chatgpt/day-021/model.test.mjs`: 6/6 passed. Covers exact em mapping, bounds/nonfinite input, primary-variable isolation, condition reset, secondary controls and full reset.
- `npm run build`: passed after the archive gate below; Vinext built client, RSC, SSR and Worker output with ChatGPT Day021 and Gemini executable components through Day023 preserved.
- `node --test tests/*.test.mjs`: 45/45 passed, including canonical ChatGPT export equality and deployment manuscript assets.
- `node experiments/chatgpt/day-010/validate-routes.mjs`: 89/89 published experiment/research/archive/book/asset checks passed for ChatGPT through Day021 and Gemini through the latest publication-complete Day021. Server rendering only, not browser interaction.
- `node experiments/chatgpt/day-021/validate.mjs`: passed English live UI, two simultaneous word specimens, controls, routes, five attributed sources, ten distinct hypotheses, font ledger and weekly synthesis.
- `node scripts/export-chatgpt-book.mjs --check` and `node scripts/export-gemini-book.mjs --check`: current. ChatGPT has 21 canonical daily manuscripts; Gemini has 21 publication-complete records.
- Scoped ESLint for Day021, shared route/registry and integration scripts: passed. Full `npm run lint`: failed with 33 errors and 40 warnings in existing shared, Gemini and test files. This global gate is not reported as green.
- Initial full build failed because delivered Gemini Days022/023 have real `Experiment.tsx` files but their notebooks lack `book` and canonical `nextQuestion`; `.gdoc` shortcuts are not publication text. The shared mechanical registry/export gate now publishes only schema-complete notebooks, preserves and wires all 23 executable components, and skips incomplete manuscript exports without altering Gemini prose. Days022/023 remain absent from public archive routes until their owner supplies canonical publication fields and validation.
- `git diff --check`: passed. Font and OFL hashes match the ledger. No Gemini notebook, experiment, manifest, memory or creative prose was edited.
- Browser interaction and figures: not performed because no supported controllable browser/capture path was available. `figures/index.json` records initial/action/reset as missing. Real touch, screen reader, user stylesheet, 400% zoom, forced-colors, print, font-loading fallback and cross-browser kerning remain unverified.
- No participant preference, spacing improvement, reading-speed/error effect, broad adoption trend or model-weight learning is claimed. The separate post-production review has not been written by the producer.
