import test from "node:test";
import assert from "node:assert/strict";
import { clampGap, frameInset, frameSize, INITIAL, MAX_GAP, relationLabel, studyReducer } from "./model.ts";

test("gap is clamped to the disclosed construction interval", () => {
  assert.equal(clampGap(-3), 0);
  assert.equal(clampGap(30), MAX_GAP);
  assert.equal(clampGap(Number.NaN), INITIAL.gap);
});

test("the frame contracts symmetrically around the fixed square", () => {
  assert.equal(frameSize(18), 66);
  assert.equal(frameSize(9), 48);
  assert.equal(frameSize(0), 30);
  assert.equal(frameInset(18), 17);
  assert.equal(frameInset(0), 35);
});

test("coincident endpoint shares the square geometry", () => {
  assert.equal(frameSize(0), 30);
  assert.equal(frameInset(0), (100 - 30) / 2);
  assert.equal(relationLabel(0), "frame and square edges coincide");
});

test("labels describe construction rather than perception", () => {
  assert.equal(relationLabel(18), "the widest construction gap");
  assert.equal(relationLabel(3), "3% space on every side");
  assert.equal(relationLabel(9), "9% symmetric space on every side");
});

test("anchor reversal and construction reveal do not change the gap", () => {
  const reversed = studyReducer({ ...INITIAL, gap: 4 }, { type: "reverse-anchors" });
  assert.deepEqual(reversed, { gap: 4, reversedAnchors: true, showConstruction: false });
  assert.deepEqual(studyReducer(reversed, { type: "toggle-construction" }), { gap: 4, reversedAnchors: true, showConstruction: true });
});

test("reset restores the neutral middle comparison", () => {
  assert.deepEqual(studyReducer({ gap: 0, reversedAnchors: true, showConstruction: true }, { type: "reset" }), INITIAL);
});
