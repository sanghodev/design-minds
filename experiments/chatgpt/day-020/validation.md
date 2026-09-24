# Day 020 validation

## Before implementation: owner-direction check

1. Curiosity: does a crossbar at half the cap height also look balanced? The specimen is an authored geometric H, with E as a separate letter condition.
2. The visitor moves one crossbar vertically. Its thickness, letter skeleton, width, cap height and color remain fixed within a letter condition. An unchanged 50-percent specimen stays alongside it.
3. The question concerns the visible upper/lower spaces of a letter. A status message or prose-only account cannot provide that comparison.
4. Carry Day007's manipulable spatial typography, Day008's distinction between measured invariants and appearance, and Day009's simultaneous comparison. Do not copy their palette or page shell. The pair follows this question's need for a stable reference.
5. A later counterbalanced study could find no departure from geometric halfway, or an effect dominated by the reference/guide. Implemented geometry is not participant evidence. Capture/input results must be recorded after testing.

## Research-led form and prior lesson

Johnston's 1906 discussion of actual versus apparent crossbar centers motivates the adjustable capital, not a prescribed correct offset. The 2026-03-27 CSS Anchor Positioning draft centers boxes, a current technical distinction from visual judgment; this work does not use that experimental API. SVG's explicit coordinates permit stable specimens independent of font loading. WCAG's dragging guidance motivates clickable step controls in addition to the native slider. Reflow guidance motivates a shrinking equal-size pair and wrapping controls.

Own completed Day006/008 review lessons: disclosure does not neutralize perception and numeric equality is not proof of equal appearance. The guide is therefore optional and no success score is given. Day009's paired revision is a useful procedural reference but its review file still says pending-validation; do not report that review as completed. A fixed 50-percent starting value and visible reference still prime the comparison. Swapping sides is an exploratory control, not randomized counterbalancing.

## Media and performance rationale

The two glyphs are original skeletal SVG constructions, not a typeface or a facsimile of Johnston's plates. No external font, image, video, audio, network request, storage or analytics is needed. SVG is selected for exact editable geometry; generated photography would add uncontrolled shape and perspective, and video would replace visitor-selected positions with an authored sequence. No continuous motion or timer is required. Reduced-motion and forced-color rules remain part of the implementation.

## Source and revisit checks

Sources were accessed 2026-09-23. Johnston's 1906 primary text, page 274, was read in a Gutenberg transcription released 2014-10-10 and updated 2024-10-24; it is a historical craft prescription, not a modern participant study. The CSS draft is dated 2026-03-27; the SVG2 Candidate Recommendation is dated 2018-10-04. WAI page publication dates are unknown. Broad searches returned irrelevant results; only the directly opened primary documents inform the work.

Own Day031 onward, framework checks 2026-10-05/2026-12-04, and subsequent 30/90-day revisits are not yet due on 2026-09-23. Day020 adds Day050/2026-10-23 and Day110/2026-12-22, whichever comes first. No seventh-day synthesis or thirtieth-day chapter is due today.

## Validation results

- `npm run build`: passed (Vinext production compilation and Worker assets). Prebuild synchronized the existing Gemini registry and mechanically regenerated both manuscripts, retaining delivered Gemini Days019/020 and the Sites adapter. No Gemini creative prose or memory was used as input or rewritten.
- `node --test tests/*.test.mjs`: 44/44 passed, including canonical notebook/export equality and deployment manuscript assets.
- `node --test experiments/chatgpt/day-020/model.test.mjs`: 6/6 passed. Covers coordinate mapping, bounded/nonfinite inputs, invariant state, side/guide reversal, letter-condition reset and full reset.
- `node experiments/chatgpt/day-010/validate-routes.mjs`: 85/85 route/asset checks passed for both minds through Day020, archives, research and book downloads. This is Worker server rendering, not deployed-browser interaction.
- `node experiments/chatgpt/day-020/validate.mjs`: passed English server-rendered UI, two specimens, controls, routes and research contract. Internal hypothesis count: 10; attributed sources: 5.
- Scoped ESLint for Day020 component/model, ChatGPT registry and shared experiment route: passed. `npm run lint`: failed with 31 errors and 32 warnings in existing shared/other-mind/test code. These are not silently waived or repaired outside scope; global lint is not green.
- `git diff --check`: passed. The initial merge of full current main (2189bafd5a027be1080fe654f557b66c2f737499) conflicted only in the generated ChatGPT collection; it was resolved by rerunning the canonical exporter, preserving both source histories.
- Browser interaction/captures: not performed. The required browser skill was unavailable (`skill package is not available`); no alternate browser path was substituted. Initial/action/reset are listed as missing in `figures/index.json`. Keyboard and touch support are implemented, not device-tested. Actual 320px/400% reflow, screen-reader announcements, forced colors and print output remain unverified.
- No participant study, timed task, calibrated display measurement, usability improvement or model-weight learning is claimed. Code and publication validation is finished with these explicit limitations; the independent post-production review has not been written by the producer.
- Source push and full-site deployment are separate subsequent operations; their actual results belong in the delivery report, not an advance success claim here.
