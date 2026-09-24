import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import worker from "../../../dist/server/index.js";

const env = { ASSETS: { fetch: async () => new Response("", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };
for (const path of ["/chatgpt/day-021", "/research/chatgpt/day-021", "/", "/research", "/book"]) {
  const response = await worker.fetch(new Request("https://test.invalid" + path), env, ctx);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  if (path === "/chatgpt/day-021") {
    const main = html.match(/<main[\s\S]*?<\/main>/)?.[0];
    assert.ok(main);
    assert.match(main, /lang="en"/);
    assert.doesNotMatch(main, /[\uac00-\ud7af]/);
    for (const marker of ["When is a gap", "Pair-aware kerning", "Uniform tracking only", "Show character bands", "Swap rows", "Reset", 'type="range"', 'role="status"', 'aria-live="polite"']) assert.ok(main.includes(marker), marker);
    assert.equal((main.match(/data-specimen=/g) || []).length, 2);
    assert.match(main, /min="-4"/);
    assert.match(main, /max="16"/);
    assert.doesNotMatch(main, /Research 0|Originality 0|Technical 0/);
  }
}
const notebook = JSON.parse(await readFile("experiments/chatgpt/day-021/notebook.json", "utf8"));
for (const key of ["summary", "question", "observation", "limitation", "nextQuestion", "provenance"]) assert.ok(notebook[key].length > 20, key);
for (const key of ["chapter", "hook", "scene", "argument", "counterpoint", "readerExercise", "futureSignal", "revisit", "figurePlan", "rights", "status"]) assert.ok(notebook.book[key].length > 5, key);
assert.equal(notebook.sources.length, 5);
for (const source of notebook.sources) {
  assert.equal(source.accessed, "2026-09-24");
  for (const key of ["title", "publisher", "url", "kind", "use", "limitation"]) assert.ok(source[key]);
}
for (const term of ["관찰된 신호", "미래 가설", "반증 조건"]) assert.ok(notebook.book.futureSignal.includes(term));
const manifest = JSON.parse(await readFile("experiments/chatgpt/day-021/manifest.json", "utf8"));
assert.equal(new Set(manifest.hypotheses.map(h => h.idea)).size, 10);
for (const h of manifest.hypotheses) { assert.equal(h.scores.length, 4); assert.ok(h.scores.every(n => n >= 1 && n <= 5)); assert.ok(h.reason.length > 40); }
const ledger = JSON.parse(await readFile("experiments/chatgpt/day-021/asset-ledger.json", "utf8"));
assert.equal(ledger.assets[0].sha256, "693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3");
const synthesis = await readFile("experiments/chatgpt/day-021/synthesis-week-003.md", "utf8");
assert.ok(synthesis.length > 1000);
console.log("Day021: English paired word UI, spacing controls, routes, research contract, asset ledger and weekly synthesis passed. Not browser/participant evidence.");
