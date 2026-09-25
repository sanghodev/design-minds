import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import worker from "../../../dist/server/index.js";

const env = { ASSETS: { fetch: async () => new Response("", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };

for (const path of ["/chatgpt/day-022", "/research/chatgpt/day-022", "/", "/research", "/book"]) {
  const response = await worker.fetch(new Request("https://test.invalid" + path), env, ctx);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  if (path === "/chatgpt/day-022") {
    const main = html.match(/<main[\s\S]*?<\/main>/)?.[0];
    assert.ok(main);
    assert.match(main, /lang="en"/);
    assert.doesNotMatch(main, /[\uac00-\ud7af]/);
    for (const marker of ["When does a color become", "Color pair", "Signal", "Evening", "Mineral", "Show halfway", "Swap sides", "Reset", 'type="range"', 'role="status"', 'aria-live="polite"']) assert.ok(main.includes(marker), marker);
    assert.equal((main.match(/data-color=/g) || []).length, 2);
    assert.match(main, /min="10"/);
    assert.match(main, /max="90"/);
    assert.doesNotMatch(main, /Research 0|Originality 0|Technical 0/);
  }
}

const notebook = JSON.parse(await readFile("experiments/chatgpt/day-022/notebook.json", "utf8"));
for (const key of ["summary", "question", "observation", "limitation", "nextQuestion", "provenance"]) assert.ok(notebook[key].length > 20, key);
for (const key of ["chapter", "hook", "scene", "argument", "counterpoint", "readerExercise", "futureSignal", "revisit", "figurePlan", "rights", "status"]) assert.ok(notebook.book[key].length > 5, key);
assert.equal(notebook.sources.length, 5);
for (const source of notebook.sources) {
  assert.equal(source.accessed, "2026-09-25");
  for (const key of ["title", "publisher", "url", "kind", "use", "limitation"]) assert.ok(source[key]);
}
for (const term of ["관찰된 신호", "미래 가설", "반증 조건"]) assert.ok(notebook.book.futureSignal.includes(term));

const manifest = JSON.parse(await readFile("experiments/chatgpt/day-022/manifest.json", "utf8"));
assert.equal(new Set(manifest.hypotheses.map(h => h.idea)).size, 10);
for (const h of manifest.hypotheses) {
  assert.equal(h.scores.length, 4);
  assert.ok(h.scores.every(n => n >= 1 && n <= 5));
  assert.ok(h.reason.length > 40);
}

const figures = JSON.parse(await readFile("experiments/chatgpt/day-022/figures/index.json", "utf8"));
assert.equal(figures.status, "missing");
assert.equal(figures.captured.length, 0);
assert.equal(figures.planned.length, 3);

console.log("Day022: English color-area UI, routes, research contract and explicit missing-figure record passed. Not browser or participant evidence.");
