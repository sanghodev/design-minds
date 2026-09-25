# Day 022 validation

Validation date: 2026-09-25 UTC

## Scope

The implementation changes one primary variable: Color A's horizontal area share. Two fixed opaque sRGB colors always fill one rectangle and total 100%. Pair selection is a separate condition and resets the primary variable, side order and guide. Side swap and the halfway guide are reversible checks, not outcome measures.

## Implemented support

- Native range input plus 44px decrement and increment buttons; keyboard, pointer and touch-capable controls share one reducer.
- Radio controls change pair condition and reset the study. Swap, guide and full reset are explicit buttons or native checkbox behavior.
- English-only live interface, `lang="en"`, text labels and an atomic polite status. The image role names both colors, percentages and the left-side color.
- Color state is repeated with names and percentages outside the color field. Forced-colors uses opposing hatch directions. Focus-visible, narrow-screen, print and reduced-motion styles are present.
- No automatic movement, decorative score, response persistence, analytics, generated media or participant claim.

## Automated results

- `node --test experiments/chatgpt/day-*/model.test.mjs`: 13/13 passed, including Day022 share bounds, exact complement, swap preservation, condition reset and full reset.
- `npm test`: production build passed and 46/46 repository tests passed. The Vinext client, RSC, SSR and Worker outputs include ChatGPT Day022 while preserving 23 Gemini executable components and 21 publication-complete Gemini records.
- `node experiments/chatgpt/day-022/validate.mjs`: passed the English-only live UI, two-panel field, range bounds, state text, routes, five attributed sources, ten hypotheses and missing-figure contract.
- `node experiments/chatgpt/day-010/validate-routes.mjs`: 91/91 published experiment, research, archive, book and asset checks passed for ChatGPT through Day022 and Gemini through publication-complete Day021. This is server rendering, not browser interaction.
- `node scripts/export-chatgpt-book.mjs --check` and `node scripts/export-gemini-book.mjs --check`: current. ChatGPT has 22 canonical daily manuscripts; Gemini has 21 publication-complete manuscripts while its 23 executable components remain wired.
- Scoped ESLint for Day022 plus the shared experiment route and ChatGPT registry passed. Full `npm run lint` failed with 33 errors and 40 warnings in existing shared, Gemini and test files; today's added test was corrected so it contributes no remaining lint finding.
- `git diff --check`: passed. No Gemini notebook, experiment, manifest, memory or creative prose was edited.

## Manual / browser evidence

No supported controllable browser or screenshot path was available. Initial, action and reset figures are therefore missing and are listed in `figures/index.json`. No direct viewport, pointer, touch, keyboard-in-browser, screen-reader, forced-colors, 400% zoom, print or color-managed-display session is claimed.

## Research boundary

The field proves the implemented ratio and fixed CSS color values, not a perceptual transition. No visitor reported a background switch; no threshold, preference, attention, reading or comprehension outcome was collected. Pair order, relative luminance, chroma, side, display and surrounding light remain possible confounds.

## Publication boundary

`book.md` and the collected manuscript are mechanical exports from `notebook.json`. The Korean draft distinguishes implementation from participant observation, labels current signal versus future hypothesis, supplies revisit conditions and keeps rights and missing evidence explicit. Human editorial, rights and fact review remain outstanding.
