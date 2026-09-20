# Day 014 validation

Research-led form: 동작을 표본으로 나타내는 원리를 수동 시간 슬라이더와 고정 궤적으로 분해한다. 자동 재생을 없애 독자가 속도를 정하고 모션 감소 설정에도 같은 자료가 남게 한다.

Prior lesson: disclosure is not neutralization; reset cannot erase prior knowledge (own Day006/008 reviews).

English UI includes controls, status, captions and accessible names. Korean research remains intentional. Native buttons, sliders and select controls provide keyboard/touch paths; responsive geometry has no automatic animation. Actual assistive-technology, touch, zoom and participant checks remain unperformed.

Media: 코드로 만든 도식과 의미 있는 HTML을 사용했다. 같은 자료의 좌표·상태를 직접 바꾸는 성질이 필요하므로 생성 영상이나 고정 이미지는 핵심 변수를 얼려 버린다.

Sources were opened with web research on their recorded access dates. Unknown publication dates remain unknown. Day014's attempted Library of Congress and Penn Muybridge pages were inaccessible; they are not used as evidence.

Commands and results will be appended after validation. Initial/action/reset screenshots remain missing.

## Actual validation — 2026-09-20

- Sites production build: passed (Vinext 0.0.50 / Vite 8.0.13).
- `node --test tests/*.test.mjs`: 42 passed, 0 failed. Includes all 18 ChatGPT notebook records and manuscript freshness.
- `node experiments/chatgpt/day-010/validate-routes.mjs`: 77 passed, including both minds through Day018, archive/research/book and both manuscript assets. These are server-rendering checks, not browser input tests.
- Scoped ESLint for all eight components, own registry and shared route: 0 errors; one Day013 native-image optimization warning. The 2,038,564-byte PNG reserves 1536×1024 dimensions and has an error fallback; no compression or measured LCP improvement is claimed. Inter is 352,240 bytes and locally licensed.
- Full `npm run lint`: 30 errors, 30 warnings in the full preserved tree (prior shared support/Gemini/tests plus one new image warning). Not a clean global lint gate; no Gemini creative source was rewritten.
- `git diff --check`: passed.
- Supervised preview started at terminal.local:4173. Browser runtime connected, but navigation to Day011 did not return; bounded attempt terminated. No actual page interaction or screenshot was completed.
- Initial/action/reset capture ledger remains missing. Keyboard, touch, screenreader, zoom, forced-colors and print behavior are implementation provisions, not completed device tests.
- No participant observations, response-time data or measured design improvement.

Publication-ready as an exploratory implementation and documented draft, with the above evidence gaps. Review-ready marker enables separate internal review; it is not a claim that missing browser/participant tests passed.

Final catch-up check: `node experiments/chatgpt/day-018/validate-backfill.mjs` passed for all eight rendered English interfaces, reset/research links, ten unique hypotheses per record, and both source/deployment media hashes. This remains server-rendering and file verification.
