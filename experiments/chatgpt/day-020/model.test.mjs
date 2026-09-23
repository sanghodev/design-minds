import test from "node:test";
import assert from "node:assert/strict";
import { INITIAL, studyReducer, crossbarCenter, clampHeight, CAP_TOP, CAP_HEIGHT, BAR_THICKNESS } from "./model.ts";

test("crossbar center is an exact fraction of cap height", () => {
  assert.equal(crossbarCenter(50), 210);
  assert.equal(crossbarCenter(44), 189.6);
  for (let p = 32; p <= 68; p++) {
    const center = crossbarCenter(p);
    assert.ok(center - BAR_THICKNESS / 2 > CAP_TOP);
    assert.ok(center + BAR_THICKNESS / 2 < CAP_TOP + CAP_HEIGHT);
  }
});
test("out of range and nonfinite input stays bounded", () => {
  assert.equal(clampHeight(-2), 32);
  assert.equal(clampHeight(90), 68);
  assert.equal(clampHeight(NaN), 50);
  assert.equal(clampHeight(Infinity), 50);
  assert.equal(clampHeight(44.3), 44);
});
test("height changes only the variable", () => {
  assert.deepEqual(studyReducer(INITIAL, { type: "height", value: 44 }), { ...INITIAL, height: 44 });
  assert.equal(INITIAL.height, 50);
});
test("guides and side exchange do not change geometry", () => {
  const adjusted = studyReducer(INITIAL, { type: "height", value: 44 });
  const guided = studyReducer(adjusted, { type: "guides" });
  const swapped = studyReducer(guided, { type: "swap" });
  assert.equal(swapped.height, 44);
  assert.equal(swapped.letter, "H");
  assert.deepEqual(studyReducer(studyReducer(swapped, { type: "swap" }), { type: "guides" }), adjusted);
});
test("letter change begins a separate comparison condition", () => {
  assert.deepEqual(studyReducer({ letter: "H", height: 62, guides: true, swapped: true }, { type: "letter", value: "E" }), { ...INITIAL, letter: "E" });
});
test("reset restores all authored initial conditions", () => {
  assert.deepEqual(studyReducer({ letter: "E", height: 44, guides: true, swapped: true }, { type: "reset" }), INITIAL);
});
