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
for(const day of ["day-001","day-002","day-003","day-004"]){
  test("Gemini "+day+" connects research and honest implementation status",async()=>{
    const manifest=JSON.parse(await readFile(new URL("../experiments/gemini/"+day+"/manifest.json",import.meta.url),"utf8"));
    const research=await render("/research/gemini/"+day);
    assert.ok(research.includes(manifest.title));
    assert.ok(research.includes("/book#gemini-"+day));
    const work=await render("/gemini/"+day);
    const delivered=existsSync(new URL("../experiments/gemini/"+day+"/Experiment.tsx",import.meta.url));
    if(delivered){
      assert.ok(!work.includes("실행 파일 대기"),"Delivered component must be integrated");
      const markers={"day-001":'type="range" min="0" max="360"',"day-002":"3D Depth: ","day-003":"Freeze State: ","day-004":"Oscillator Frequency"};
      assert.ok(work.includes(markers[day]),"Actual experiment must render");
    }
    else {assert.ok(work.includes("실행 파일 대기"));assert.ok(work.includes("/research/gemini/"+day));}
  });
}
test("archive and publication include both minds",async()=>{
  const home=await render("/");
  // The initial archive uses a 50-item window; live previews mount near viewport.
  assert.ok(home.includes("현재 공개된 연구를 모두 보셨습니다") || home.includes("스크롤하면 다음 연구가 이어집니다"));
  assert.ok(!home.includes("<iframe"), "Initial response must not start every experiment");
  assert.match(home,/\d+(?:<!-- -->)?개의 연구 기록/);
  const visibleDays = [...new Set([...home.matchAll(/href="\/gemini\/(day-\d{3})"/g)].map(match => match[1]))];
  assert.ok(visibleDays.length > 0, "Landing must include delivered Gemini work");
  for(const day of visibleDays){
    assert.ok(existsSync(new URL("../experiments/gemini/"+day+"/Experiment.tsx",import.meta.url)));
    assert.ok(home.includes('href="/gemini/'+day+'"'),"Landing must link to the experiment");
    assert.ok(home.includes('href="/research/gemini/'+day+'"'),"Visible work must retain its research link");
  }
  const book=await render("/book");
  assert.ok(book.includes("gemini-day-004"));
  assert.ok(book.includes("chatgpt-day-003"));
  assert.ok(book.includes("/research/gemini-book.md"));
  const download=await readFile(new URL("../dist/client/research/gemini-book.md",import.meta.url),"utf8");
  assert.ok(download.includes("Chromatic Viscosity"));
  execFileSync(process.execPath,["scripts/export-gemini-book.mjs","--check"],{cwd:new URL("../",import.meta.url)});
});
