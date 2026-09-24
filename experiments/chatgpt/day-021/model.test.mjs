import test from "node:test";
import assert from "node:assert/strict";
import { INITIAL, MAX_TRACKING, MIN_TRACKING, clampTracking, studyReducer, trackingEm } from "./model.ts";

test("tracking maps integer hundredths to em", () => {
  assert.equal(trackingEm(0), 0);
  assert.equal(trackingEm(12), 0.12);
  assert.equal(trackingEm(-4), -0.04);
});
test("tracking is bounded and rejects nonfinite input", () => {
  assert.equal(clampTracking(-20), MIN_TRACKING);
  assert.equal(clampTracking(40), MAX_TRACKING);
  assert.equal(clampTracking(NaN), 0);
  assert.equal(clampTracking(3.6), 4);
});
test("tracking changes only the primary variable", () => {
  assert.deepEqual(studyReducer(INITIAL, { type: "tracking", value: 8 }), { ...INITIAL, tracking: 8 });
});
test("word change starts a separate condition", () => {
  assert.deepEqual(studyReducer({ word: "AVATAR", tracking: 8, guides: true, swapped: true }, { type: "word", value: "WAYWARD" }), { ...INITIAL, word: "WAYWARD" });
});
test("guides and row exchange preserve spacing", () => {
  const adjusted = studyReducer(INITIAL, { type: "tracking", value: 7 });
  const guided = studyReducer(adjusted, { type: "guides" });
  const swapped = studyReducer(guided, { type: "swap" });
  assert.equal(swapped.tracking, 7);
  assert.equal(swapped.word, "AVATAR");
});
test("reset restores all authored conditions", () => {
  assert.deepEqual(studyReducer({ word: "TOY", tracking: 16, guides: true, swapped: true }, { type: "reset" }), INITIAL);
});
