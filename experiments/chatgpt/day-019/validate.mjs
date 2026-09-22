import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import worker from "../../../dist/server/index.js";

const env = { ASSETS: { fetch: async () => new Response("", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };

for (const path of ["/chatgpt/day-019", "/research/chatgpt/day-019", "/", "/research", "/book"]) {
  const response = await worker.fetch(new Request("https://test.invalid" + path), env, ctx);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.ok(html.length > 200, path);
  if (path === "/chatgpt/day-019") {
    const main = html.match(/<main[\s\S]*?<\/main>/)?.[0];
    assert.ok(main);
    assert.match(main, /lang="en"/);
    assert.doesNotMatch(main, /[\uac00-\ud7af]/);
    for (const marker of ["Accepted is", "Send request", "Cancel", "Reset", "role=\"status\"", "aria-live=\"polite\""]) {
      assert.ok(main.includes(marker), marker);
    }
  }
}

const manifest = JSON.parse(await readFile("experiments/chatgpt/day-019/manifest.json", "utf8"));
assert.equal(manifest.hypotheses.length, 10);
assert.equal(new Set(manifest.hypotheses.map((item) => item.idea)).size, 10);
assert.equal(manifest.status, "published");

const notebook = JSON.parse(await readFile("experiments/chatgpt/day-019/notebook.json", "utf8"));
assert.equal(notebook.sources.length, 5);
assert.match(notebook.book.futureSignal, /관찰된 신호/);
assert.match(notebook.book.futureSignal, /미래 가설/);
assert.match(notebook.book.futureSignal, /반증 조건/);

console.log("Day019 server-rendered UI, research routes, hypotheses and publication fields passed. No browser-input or participant claim.");
