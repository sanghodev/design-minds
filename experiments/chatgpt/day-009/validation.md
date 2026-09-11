# Day009 — validation record

Actual writing date: 2026-09-11. Baseline main: 325591ccd710adeb0f20e9add0b4e99641864fdd. Owner requested completion through Day009 after Day008 was published. This is an additional authorized creation, not a claim that a missed scheduled run succeeded.

## Research-led form

Own unresolved question: stable text order does not determine visual reading, and the initial research disproportionately used English. Sources accessed 2026-09-11: W3C Hangul layout Group Note Draft dated 2026-03-21; MDN text-wrap-style modified 2026-06-08; Seoul Museum of History's December 1896 newspaper exhibit; WCAG Reflow guidance. The historical source contextualizes reading situations, not a causal claim about line breaks. Ten hypotheses, scores, reasons and the strongest alternative are in manifest.json.

The single cobalt field and large live Korean sentence expose the line silhouette. A right boundary marks the available measure. The console stays separate from the text. No previous work's two-color comparison or editorial proof frame is inherited. Color is held fixed as a contrast choice, not claimed as a historical reconstruction. Images and video were considered but would freeze the native text layout being examined; no media generation is claimed.

Primary comparison: fixed 11em, balance off, normal versus keep-all. Width and balance are independently available exploration controls; changing them together cannot isolate causation. In small viewports the visible measure is capped by available width. overflow-wrap:anywhere is an emergency safety fallback and can override word preservation for overly long tokens. System fonts and browser algorithms affect actual line ends.

## Actual verification

- Scoped ESLint passed for the Day009 component, ChatGPT registry and shared route.
- Sites/Vinext production build passed with both minds' full committed tree retained.
- node --test tests/*.test.mjs: 33/33 passed, including research schemas, export freshness, archive/book links and packaged manuscript contents.
- Direct built-worker verification returned 200 for all 36 registered experiment/research routes: ChatGPT Days001–009 and Gemini Days001–009. Day009 initial HTML includes its Korean title, full sentence, 11em setting, keep-all style and reset control.
- Both manuscript exporters ran; Gemini output remained unchanged. No Gemini creative content, memory or notebook was changed.
- Whole-tree lint rechecked: 8 pre-existing errors / 12 warnings remain in shared/UI/test and Gemini sources. This is not a clean repository lint pass.
- git diff --check passed. Review scope is own Day009, memory, registry, generated ChatGPT manuscript and the minimal shared route import/branch.

## Figures and unperformed tests

No browser-control/capture capability was exposed in this run. Actual initial/action/reset captures are missing. Native range/radio/checkbox/button controls implement mouse/touch/keyboard paths, but SSR checks do not prove successful hydration or interaction. Actual touch, browser keyboard behavior, reduced-motion and forced-colors rendering, balance support, 400% enlargement, screenreader speech and print are untested. No participant reading times, comprehension or preference evidence was collected.

Figure plan: initial 11em/keep-all/no balance; action at the same measure with normal breaks; reset to original settings. Save browser/font/viewport/zoom/version provenance when capture becomes available. Do not substitute generated screenshots. No seventh/thirtieth synthesis is due for Day009; Day031+ and Day039/099 revisits remain pending.

Ready handoff means this exploratory implementation, notebook, exports and documented validation are finished for independent review. It does not certify graduate-level research, resolve the above evidence gaps or claim deployment before the hosting result. Source push and deployment are reported separately after completion.
