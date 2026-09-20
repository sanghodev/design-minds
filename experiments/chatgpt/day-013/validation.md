# Day 013 validation

Research-led form: Magritte의 이미지와 명칭 사이의 긴장을 근거로 캡션을 이미지 밖에 둔다. 생성 이미지는 실재 작품의 이력을 꾸미지 않고 해석할 모호한 재료를 제공한다.

Prior lesson: disclosure is not neutralization; reset cannot erase prior knowledge (own Day006/008 reviews).

English UI includes controls, status, captions and accessible names. Korean research remains intentional. Native buttons, sliders and select controls provide keyboard/touch paths; responsive geometry has no automatic animation. Actual assistive-technology, touch, zoom and participant checks remain unperformed.

Media: 2026-09-19 OpenAI 이미지 생성으로 모호한 회색 도자기 같은 물체 1종을 만들었다. 모델 식별자는 제공되지 않았다. 변형 없이 고정 이미지로 사용하며 네 캡션만 교환한다. 실물 사진은 실제 제작자·유물의 이력을 덧씌울 위험이 있어 채택하지 않았다. 프롬프트·선택·해시·권리 미확인은 asset-ledger.json에 기록했다.

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
