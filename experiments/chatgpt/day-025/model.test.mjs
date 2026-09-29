import test from "node:test";
import assert from "node:assert/strict";
import { clampShift, frameStyle, INITIAL, MAX_SHIFT, relationLabel, signedShift, studyReducer } from "./model.ts";

test("the maximum frame shift equals the initial internal margin", () => {
  assert.equal(MAX_SHIFT, 17);
  assert.equal(clampShift(-4), 0);
  assert.equal(clampShift(30), 17);
  assert.equal(clampShift(Number.NaN), INITIAL.shift);
});

test("right and left shifts are equal and opposite", () => {
  assert.equal(signedShift({ ...INITIAL, shift: 12, side: "right" }), 12);
  assert.equal(signedShift({ ...INITIAL, shift: 12, side: "left" }), -12);
});

test("frame transform leaves the square model untouched", () => {
  assert.deepEqual(frameStyle({ ...INITIAL, shift: 8 }), { transform: "translateX(12.5%)" });
});

test("endpoint labels describe construction, not perception", () => {
  assert.equal(relationLabel(0), "equal space on every side");
  assert.equal(relationLabel(17), "one frame edge touching the square");
});

test("mirror and panel swap preserve frame magnitude", () => {
  const mirrored = studyReducer({ ...INITIAL, shift: 11 }, { type: "mirror" });
  assert.deepEqual(mirrored, { shift: 11, side: "left", swappedPanels: false });
  assert.deepEqual(studyReducer(mirrored, { type: "swap-panels" }), { shift: 11, side: "left", swappedPanels: true });
});

test("reset restores the disclosed initial comparison", () => {
  assert.deepEqual(studyReducer({ shift: 17, side: "left", swappedPanels: true }, { type: "reset" }), INITIAL);
});
