# Day 023 validation

Validation date: 2026-09-27 UTC

## Scope

The implementation compares two boundary constructions while preserving the same two opaque CSS colors, equal square field dimensions and the highlighted region's area share. In the edge-attached field, strip width equals the selected percentage. In the enclosed field, square side equals the square root of that percentage. Strip side and color assignment are reversible checks, not outcome measures.

Closure is not isolated. Aspect ratio, perimeter, compactness, center position and frame contact also differ. The interface and research note state that limitation.

## Implemented support

- Native range input plus 44px decrement and increment buttons; keyboard, pointer and touch-capable controls share one reducer.
- Explicit Move strip, Swap colors and Reset buttons. Each exposes current state through pressed state or live text.
- English-only live interface, lang="en", text labels and an atomic polite status. Each image role names construction, colors, area and strip position.
- Color state is repeated with names and percentages outside the fields. Forced-colors uses a hatch for the highlighted region. Focus-visible, narrow-screen, print and reduced-motion styles are present.
- No automatic movement, decorative score, response persistence, analytics, generated media or participant claim.

## Automated results

- node --test experiments/chatgpt/day-*/model.test.mjs: 19/19 passed, including six Day023 checks for bounds, equal-area square math, geometry-preserving checks and reset.
- npm test: production build passed and 47/47 repository tests passed. Vinext client, RSC, SSR and Worker outputs include ChatGPT Day023 while preserving 25 Gemini executable components and 21 publication-complete Gemini records.
- node experiments/chatgpt/day-023/validate.mjs: passed the English-only live UI, two-field construction, range bounds, state text, five page routes, six attributed sources, ten hypotheses and missing-figure contract.
- node experiments/chatgpt/day-010/validate-routes.mjs: 93/93 published experiment, research, archive, book and asset checks passed for ChatGPT through Day023 and Gemini through publication-complete Day021. This is server rendering, not browser interaction.
- node scripts/export-chatgpt-book.mjs --check and node scripts/export-gemini-book.mjs --check: current. ChatGPT has 23 canonical daily manuscripts; Gemini has 21 publication-complete manuscripts while its 25 executable components remain wired.
- Scoped ESLint for Day023 plus the shared experiment route and ChatGPT registry passed. Full npm run lint failed with 33 errors and 50 warnings in existing shared, Gemini and test files; Day023 contributes no lint finding.
- git diff --check: passed. No Gemini notebook, experiment, manifest, memory or creative prose was edited.

## Manual / browser evidence

No supported controllable browser or screenshot path was available. Initial, action and reset figures are therefore missing and are listed in figures/index.json. No direct viewport, pointer, touch, keyboard-in-browser, screen-reader, forced-colors, 400% zoom, print or color-managed-display session is claimed.

## Research boundary

The fields prove implemented equality of mathematical area and CSS color values, not equal perceptual roles. No visitor reported a figure-ground judgment. The current scientific source uses different textured stimuli and tasks; it does not validate this flat-color composition. Shape, compactness, position, luminance, terminology, display and surrounding light remain possible confounds.

## Publication boundary

book.md and the collected manuscript are mechanical exports from notebook.json. The Korean draft distinguishes implementation from participant observation, labels current signal versus future hypothesis, supplies revisit conditions and keeps rights and missing evidence explicit. Human editorial, rights and fact review remain outstanding.
