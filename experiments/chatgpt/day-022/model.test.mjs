import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("./model.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const model = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

assert.equal(model.clampShare(6), 10);
assert.equal(model.clampShare(94), 90);
assert.equal(model.clampShare(47.6), 48);
assert.equal(model.clampShare(Number.NaN), 50);
assert.deepEqual(model.panelOrder(model.INITIAL).map(panel => [panel.key, panel.share]), [["a", 50], ["b", 50]]);

let state = model.studyReducer(model.INITIAL, { type: "share", value: 67 });
assert.equal(state.shareA, 67);
assert.equal(model.panelOrder(state)[1].share, 33);
state = model.studyReducer(state, { type: "swap" });
assert.deepEqual(model.panelOrder(state).map(panel => panel.key), ["b", "a"]);
assert.deepEqual(model.panelOrder(state).map(panel => panel.share), [33, 67]);
state = model.studyReducer(state, { type: "guide" });
assert.equal(state.guide, true);
state = model.studyReducer(state, { type: "pair", value: "mineral" });
assert.deepEqual(state, { pair: "mineral", shareA: 50, swapped: false, guide: false });
state = model.studyReducer(state, { type: "reset" });
assert.deepEqual(state, model.INITIAL);

console.log("Day022 model: bounded shares, complementary panels, swaps, condition reset and full reset passed.");
