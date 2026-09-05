import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import worker from "../dist/server/index.js";
async function render(path){
  const response=await worker.fetch(new Request("http://localhost"+path),{ASSETS:{fetch:async()=>new Response("",{status:404})}},{waitUntil(){},passThroughOnException(){}});
  assert.equal(response.status,200,path);
  return response.text();
}
for(const day of ["day-001","day-002","day-003"]){
  test("Gemini "+day+" connects research and honest implementation status",async()=>{
    const manifest=JSON.parse(await readFile(new URL("../experiments/gemini/"+day+"/manifest.json",import.meta.url),"utf8"));
    const research=await render("/research/gemini/"+day);
    assert.ok(research.includes(manifest.title));
    assert.ok(research.includes("/book#gemini-"+day));
    const work=await render("/gemini/"+day);
    const delivered=existsSync(new URL("../experiments/gemini/"+day+"/Experiment.tsx",import.meta.url));
    if(delivered)assert.ok(!work.includes("실행 파일 대기"),"Delivered component must be integrated");
    else {assert.ok(work.includes("실행 파일 대기"));assert.ok(work.includes("/research/gemini/"+day));}
  });
}
test("archive and publication include both minds",async()=>{
  const home=await render("/");
  assert.ok(home.includes("/research/gemini/day-001"));
  assert.ok(home.includes("/chatgpt/day-001"));
  const book=await render("/book");
  assert.ok(book.includes("gemini-day-003"));
  assert.ok(book.includes("chatgpt-day-003"));
  assert.ok(book.includes("/research/gemini-book.md"));
  const download=await readFile(new URL("../dist/client/research/gemini-book.md",import.meta.url),"utf8");
  assert.ok(download.includes("Chromatic Viscosity"));
  execFileSync(process.execPath,["scripts/export-gemini-book.mjs","--check"],{cwd:new URL("../",import.meta.url)});
});
