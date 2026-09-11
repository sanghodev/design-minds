import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Exercise the actual TSX server render with large fixture archives without
// publishing invented experiments or needing an external browser.
const require = createRequire(import.meta.url);
const cache = new Map();
function component(file) {
  if (cache.has(file)) return cache.get(file);
  const code = ts.transpileModule(readFileSync(new URL("../app/" + file, import.meta.url), "utf8"), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  const scopedRequire = (name) => {
    if (name.endsWith(".css")) return {};
    if (name === "./ResearchCard") return component("ResearchCard.tsx");
    if (name === "next/link") return ({ prefetch, ...props }) => React.createElement("a", props);
    return require(name);
  };
  runInThisContext("(function(require,module,exports){" + code + "\n})")(scopedRequire, module, module.exports);
  cache.set(file, module.exports);
  return module.exports;
}
const Archive = component("Archive.tsx").default;
for (const count of [0, 49, 50, 51, 730]) {
  test("archive renders a bounded first window for " + count + " records", () => {
    const entries = Array.from({ length: count }, (_, i) => ({
      status: "published", mind: i % 2 ? "gemini" : "chatgpt", day: Math.floor(i / 2) + 1,
      date: "2026-09-11", title: "Fixture " + i, discipline: "Test", hypothesis: "Fixture only",
    }));
    const html = renderToStaticMarkup(React.createElement(Archive, { entries }));
    assert.equal((html.match(/<article/g) || []).length, Math.min(count, 50));
    assert.ok(!html.includes("<iframe"), "No executable experiment is loaded in initial HTML");
    assert.equal(html.includes("다음 50개 연구 펼치기"), count > 50);
    assert.ok(html.includes('href="#archive-publication"'));
    if (!count) assert.ok(html.includes("조건에 맞는 공개 연구가 없습니다"));
    if (count && count <= 50) assert.ok(html.includes("현재 공개된 연구를 모두 보셨습니다"));
  });
}
