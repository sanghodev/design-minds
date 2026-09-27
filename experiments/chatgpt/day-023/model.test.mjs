import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("./model.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const model = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

test("share is bounded and rounded", () => {
  assert.equal(model.clampShare(2), 16);
  assert.equal(model.clampShare(88), 64);
  assert.equal(model.clampShare(41.6), 42);
  assert.equal(model.clampShare(Number.NaN), 36);
});

test("enclosed square preserves the strip's area share", () => {
  for (const share of [16, 36, 50, 64]) {
    const side = model.squareSidePercent(share) / 100;
    assert.ok(Math.abs(side * side - share / 100) < 1e-12);
  }
});

test("moving the strip preserves share and color assignment", () => {
  const next = model.studyReducer(model.INITIAL, { type: "move-strip" });
  assert.deepEqual(next, { share: 36, stripSide: "right", swappedColors: false });
});

test("swapping colors preserves geometry", () => {
  const next = model.studyReducer(model.INITIAL, { type: "swap-colors" });
  assert.equal(next.share, 36);
  assert.equal(next.stripSide, "left");
  assert.equal(model.colorsFor(next).region.name, "Ink");
});

test("share action changes both constructions through one state", () => {
  const next = model.studyReducer(model.INITIAL, { type: "share", value: 49 });
  assert.equal(next.share, 49);
  assert.equal(model.squareSidePercent(next.share), 70);
});

test("reset restores the disclosed initial condition", () => {
  let state = model.studyReducer(model.INITIAL, { type: "share", value: 61 });
  state = model.studyReducer(state, { type: "move-strip" });
  state = model.studyReducer(state, { type: "swap-colors" });
  assert.deepEqual(model.studyReducer(state, { type: "reset" }), model.INITIAL);
});
