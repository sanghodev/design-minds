# Day008 post-production review — A Color Is Never Alone

Review-Status: complete

- Original creation commit: `325591ccd710adeb0f20e9add0b4e99641864fdd`
- Review baseline: `db4823b14a06c5b13aaedf749b8c3844f746c8e5` (GitHub `main` at review checkout)
- Corrected source: this review commit, titled `chatgpt(review-day-008): A Color Is Never Alone`; the immutable SHA is the Git history record because a commit cannot contain its own hash.
- Reviewed: 2026-09-12
- Scope: ChatGPT Day008 plus canonical ChatGPT notebook, manuscript and memory records. No Gemini creative source or memory was used as research input or rewritten.

## Inspection boundary and initial findings

I inspected `Experiment.tsx`, its CSS, route registration and the rendered-source structure before reading the author's manifest, notebook, book or validation. The actual interactive browser view remained unavailable: the bounded Sites preview attempts first found absent dependencies and then exposed an incompatibility between the repository's Next.js dev command and the preview service's Vite-style flags. I did not start an alternate unsupervised browser path or claim visual, hydration, pointer, touch or assistive-technology results.

The initial source inspection found:

1. The two central samples do share the literal CSS value `#bfa48b`; their size and placement are symmetric. Swap and reset are reversible, and the common-gray state holds both backgrounds equal.
2. The page asks the reader to look first, but the heading and figcaption immediately disclose that the samples are identical and show the value. That makes the proposed pre-disclosure judgment impossible in the published interaction and can prime the response.
3. The optional bridge is visually useful as a continuity demonstration but changes local surround and figure-ground structure. It cannot be treated as an independent control.
4. The three named background pairs are authored examples. The source contains no measured luminance, chroma matching, display calibration or rationale establishing them as controlled psychophysical stimuli.
5. Native buttons and select have visible focus, 44px minimum height and pressed states. The figure has a programmatic description, the status is textual, reduced motion is inert, and forced-colors mode warns that the stimulus is replaced. Actual screen-reader speech, zoom, forced-colors rendering and hardware touch were not tested.
6. Typography and neutral controls remain secondary to the two-field comparison. On narrow CSS viewports the controls wrap and the field retains a 240px minimum height, but actual mobile layout was not captured.

These are preserved initial findings; later corrections do not erase them.

## Question, evidence and source checks

The defensible question is whether a web interface can expose the difference between a constant CSS color value and changing authored surrounds. It is not whether this page proves a universal illusion, improves color understanding or identifies a perceptual mechanism.

- The Josef & Anni Albers Foundation's workshop page describes “One Color Becomes Two” as an activity based on *Interaction of Color*. This supports the historical educational precedent, not the efficacy of this interface. Verified 2026-09-12: <https://www.albersfoundation.org/learning/workshops>.
- MDN documents relative color syntax as a way to calculate output colors from an origin color, and records a 2025-12-16 modification date. It supports the distinction between programmatic color relationships and this page's perceptual question; it does not show adoption or reader demand. Verified 2026-09-12: <https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Colors/Using_relative_colors>.
- W3C's Understanding SC 1.4.1 says information conveyed by color needs another cue and explicitly notes that programmatic access alone does not necessarily satisfy sighted readers who cannot distinguish colors. The page's text states support the functional meaning of controls, not equivalent access to the color experience. Verified 2026-09-12: <https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html>.
- Krauskopf, Zaidi and Mandler's 1986 observer experiment measured simultaneous color induction and found that several simple receptor/opponent interaction hypotheses did not predict results as well as a higher-level account. This is counterevidence against treating a two-field screen as a self-validating demonstration or mechanism test. The present work does not reproduce their apparatus or measurements. Verified via PubMed 2026-09-12: <https://pubmed.ncbi.nlm.nih.gov/3772638/>; DOI `10.1364/JOSAA.3.001752`.

No source verifies the chosen three background pairs, the common-gray condition as an educational improvement, or a reader-comprehension gain.

## Corrections

### Pass 1 — separate observation from disclosure

The initial statement and constant-value figcaption were replaced with a neutral prompt. A pressed-state “색값 공개하기” control now independently reveals both sample values and both current background values. Reset hides them again. This aligns the implementation with the reader exercise and makes value disclosure observable as its own intervention.

This is a procedural correction, not evidence that priming has been removed or comprehension has improved. The figure's accessible description continues to disclose actual values because a nonvisual user cannot inspect the color field itself; that is a functional alternative, not a comparable perceptual trial.

### Pass 2 — narrow the stimulus claim

The live footer, limitation, counterpoint and publication status now state that the three pairs are authored screen examples, not measured or luminance/chroma-equated stimuli. The notebook adds the primary induction paper as a counterevidence boundary. The reader exercise distinguishes a personal observation sequence from a randomized participant study.

No palette was redesigned to force a stronger effect. That would have created a more persuasive picture without the measurement needed to justify it.

## Validation record

Executed results before source commit:

- `node scripts/export-chatgpt-book.mjs` exported all nine ChatGPT daily manuscripts and the collected manuscript. `node scripts/export-chatgpt-book.mjs --check` then reported current exports.
- Direct JSON parsing, the review marker assertion and a collected-manuscript content assertion passed.
- Scoped ESLint passed for the corrected Day008 component, ChatGPT registry and shared experiment route. A later pass also includes the research route and research type changed to expose review links.
- Whole-tree `npm run lint` remained red with 6 errors and 11 warnings in previously committed Gemini components, a Gemini validation harness and `tests/archive-window.test.mjs`. None was changed because this review must not rewrite Gemini creative work or broaden into unrelated cleanup.
- `npm run build` and the Sites build helper both completed a Next.js 16.2.6 production build with TypeScript and registered dynamic experiment/research routes.
- A local production-server pass returned HTTP 200 for all 36 experiment/research URLs across ChatGPT and Gemini Days001–009 plus `/`, `/book`, `/research` and both collected manuscript assets (41 checks total). Day008 research HTML included `review.md` and the verdict; experiment HTML included the corrected hidden-value initial caption.
- `tests/archive-window.test.mjs` passed 5/5. The whole test command passed those five before six harness entries failed to initialize: five expect a Vinext `dist/server/index.js` that the current Next build does not emit, and `ui-components.test.mjs` imports uninstalled `vite`. These are infrastructure mismatches before route assertions, not Day008 interaction failures or successful end-to-end tests.
- Supervised browser QA: unavailable for the reason above; no screenshot evidence exists.

## Verdict

`publishable-after-revision` — an internal editorial judgment, not external peer review, a graduate-level credential, or evidence of measured improvement.

The work is publishable as a transparent, reversible screen-based comparison after the disclosure and stimulus-language corrections. It remains exploratory as perceptual research. Its strongest contribution is the staged distinction between looking, revealing numeric values and changing surround; its weakest evidence is the absence of observer measurements and calibrated stimuli.

## Remaining objections and next test

- A “value hidden” interface can still prime judgment through the title, surrounding explanation, prior familiarity or task order.
- The common-gray state changes both surrounds at once and can aid direct comparison without proving a learning effect.
- The bridge changes local context; it remains explanation, not validation.
- CSS literals do not guarantee identical emitted light across display pipelines, devices, brightness, ambient light or print.
- No desktop/mobile screenshots, real touch, 200% zoom, forced-colors, screen-reader, color-vision-condition, color-managed display, participant or print-proof evidence was obtained.

Next: in a fixed, calibrated setup, randomize disclosure timing and background order, record “same / different / uncertain” before and after disclosure, and separate perceptual matching from comprehension of the numeric invariant.
