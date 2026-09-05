import assert from "node:assert/strict";
import test from "node:test";
import worker from "../dist/server/index.js";

for (const [path, marker] of [
  ["/chatgpt/day-001", "SILENCE"],
  ["/chatgpt/day-002", "What we remove"],
  ["/chatgpt/day-003", "Focus rearranges"],
]) {
  test(path + " renders its experiment", async () => {
    const response = await worker.fetch(new Request("http://localhost" + path),
      { ASSETS: { fetch: async () => new Response("", { status: 404 }) } },
      { waitUntil() {}, passThroughOnException() {} });
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes(marker));
  });
}
