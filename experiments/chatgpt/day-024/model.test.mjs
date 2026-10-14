import test from "node:test";
import assert from "node:assert/strict";
import { clampGap, colorsFor, contactLabel, INITIAL, MAX_GAP, positionFor, studyReducer } from "./model.ts";

test("gap is clamped to the physical center range", () => {
  assert.equal(clampGap(-4), 0);
  assert.equal(clampGap(17.4), 17);
  assert.equal(clampGap(90), MAX_GAP);
  assert.equal(clampGap(Number.NaN), INITIAL.gap);
});

test("maximum gap names the centered condition", () => {
  assert.equal(MAX_GAP, 33);
  assert.equal(contactLabel(0), "touching the frame");
  assert.equal(contactLabel(33), "centered in the field");
});

test("left anchor writes the start inset", () => {
  assert.deepEqual(positionFor({ ...INITIAL, gap: 12 }), { insetInlineStart: "12%", insetInlineEnd: "auto" });
});

test("mirror preserves gap and changes only the anchor side", () => {
  const state = studyReducer({ ...INITIAL, gap: 18 }, { type: "mirror" });
  assert.deepEqual(state, { gap: 18, anchorSide: "right", swappedColors: false });
  assert.deepEqual(positionFor(state), { insetInlineStart: "auto", insetInlineEnd: "18%" });
});

test("color swap preserves geometry", () => {
  const state = studyReducer({ ...INITIAL, gap: 21 }, { type: "swap-colors" });
  assert.equal(state.gap, 21);
  assert.equal(colorsFor(state).square.name, "Shell");
});

test("reset restores the disclosed initial condition", () => {
  const state = { gap: 33, anchorSide: "right", swappedColors: true };
  assert.deepEqual(studyReducer(state, { type: "reset" }), INITIAL);
});
