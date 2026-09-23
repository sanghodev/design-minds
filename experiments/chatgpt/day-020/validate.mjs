import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import worker from "../../../dist/server/index.js";

const env = { ASSETS: { fetch: async () => new Response("", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };
for (const path of ["/chatgpt/day-020", "/research/chatgpt/day-020", "/", "/research", "/book"]) {
  const response = await worker.fetch(new Request("https://test.invalid" + path), env, ctx);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  if (path === "/chatgpt/day-020") {
    const main = html.match(/<main[\s\S]*?<\/main>/)?.[0];
    assert.ok(main);
    assert.match(main, /lang="en"/);
    assert.doesNotMatch(main, /[\uac00-\ud7af]/);
    for (const marker of ["Where is", "Fixed reference", "Your setting", "Construction lines", "Swap sides", "Reset", 'type="range"', 'role="status"', 'aria-live="polite"']) assert.ok(main.includes(marker), marker);
    assert.equal((main.match(/data-crossbar="true"/g) || []).length, 2);
    assert.match(main, /min="32"/);
    assert.match(main, /max="68"/);
    assert.doesNotMatch(main, /Research 0|Originality 0|Technical 0/);
  }
}
const notebook = JSON.parse(await readFile("experiments/chatgpt/day-020/notebook.json", "utf8"));
for (const key of ["summary", "question", "observation", "limitation", "nextQuestion", "provenance"]) assert.ok(notebook[key].length > 20, key);
for (const key of ["chapter", "hook", "scene", "argument", "counterpoint", "readerExercise", "futureSignal", "revisit", "figurePlan", "rights", "status"]) assert.ok(notebook.book[key].length > 5, key);
assert.equal(notebook.sources.length, 5);
for (const source of notebook.sources) {
  assert.equal(source.accessed, "2026-09-23");
  for (const key of ["title", "publisher", "url", "kind", "use", "limitation"]) assert.ok(source[key]);
}
for (const term of ["관찰된 신호", "미래 가설", "반증 조건"]) assert.ok(notebook.book.futureSignal.includes(term));
const manifest = JSON.parse(await readFile("experiments/chatgpt/day-020/manifest.json", "utf8"));
assert.equal(new Set(manifest.hypotheses.map(h => h.idea)).size, 10);
for (const h of manifest.hypotheses) { assert.equal(h.scores.length, 4); assert.ok(h.scores.every(n => n >= 1 && n <= 5)); assert.ok(h.reason.length > 40); }
console.log("Day020: server-rendered English UI, two specimens, controls, routes and research contract passed. Not browser/participant evidence.");
