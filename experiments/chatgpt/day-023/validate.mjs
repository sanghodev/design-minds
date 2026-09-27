import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import worker from "../../../dist/server/index.js";

const env = { ASSETS: { fetch: async () => new Response("", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };

for (const path of ["/chatgpt/day-023", "/research/chatgpt/day-023", "/", "/research", "/book"]) {
  const response = await worker.fetch(new Request("https://test.invalid" + path), env, ctx);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  if (path === "/chatgpt/day-023") {
    const main = html.match(/<main[\s\S]*?<\/main>/)?.[0];
    assert.ok(main);
    assert.match(main, /lang="en"/);
    assert.doesNotMatch(main, /[\uac00-\ud7af]/);
    for (const marker of ["Does an edge make the", "Edge-attached", "Enclosed", "Highlighted area", "Move strip", "Swap colors", "Reset", 'type="range"', 'role="status"', 'aria-live="polite"']) assert.ok(main.includes(marker), marker);
    assert.equal((main.match(/data-region=/g) || []).length, 2);
    assert.match(main, /min="16"/);
    assert.match(main, /max="64"/);
    assert.doesNotMatch(main, /Research 0|Originality 0|Technical 0/);
  }
}

const notebook = JSON.parse(await readFile("experiments/chatgpt/day-023/notebook.json", "utf8"));
for (const key of ["summary", "question", "observation", "limitation", "nextQuestion", "provenance"]) assert.ok(notebook[key].length > 20, key);
for (const key of ["chapter", "hook", "scene", "argument", "counterpoint", "readerExercise", "futureSignal", "revisit", "figurePlan", "rights", "status"]) assert.ok(notebook.book[key].length > 5, key);
assert.equal(notebook.sources.length, 6);
for (const source of notebook.sources) {
  assert.equal(source.accessed, "2026-09-27");
  for (const key of ["title", "publisher", "url", "kind", "use", "limitation"]) assert.ok(source[key]);
}
for (const term of ["관찰된 신호", "미래 가설", "반증 조건"]) assert.ok(notebook.book.futureSignal.includes(term));

const manifest = JSON.parse(await readFile("experiments/chatgpt/day-023/manifest.json", "utf8"));
assert.equal(new Set(manifest.hypotheses.map(hypothesis => hypothesis.idea)).size, 10);
for (const hypothesis of manifest.hypotheses) {
  assert.equal(hypothesis.scores.length, 4);
  assert.ok(hypothesis.scores.every(score => score >= 1 && score <= 5));
  assert.ok(hypothesis.reason.length > 40);
}

const figures = JSON.parse(await readFile("experiments/chatgpt/day-023/figures/index.json", "utf8"));
assert.equal(figures.status, "missing");
assert.equal(figures.captured.length, 0);
assert.equal(figures.planned.length, 3);

console.log("Day023: English equal-area boundary UI, routes, research contract and explicit missing-figure record passed. Not browser or participant evidence.");
