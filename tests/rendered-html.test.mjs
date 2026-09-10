import assert from "node:assert/strict";
import test from "node:test";

test("renders the research archive with usable entry points", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /연구 작품 색인/);
  assert.match(html, /href="\/book"/);
  const visibleDay = html.match(/href="\/gemini\/(day-\d{3})"/)?.[1];
  assert.ok(visibleDay, "At least one Gemini work must be visible");
  assert.ok(html.includes('href="/research/gemini/'+visibleDay+'"'), "Visible work must have a paired research link");
  assert.match(html, /type="search"/);
});
