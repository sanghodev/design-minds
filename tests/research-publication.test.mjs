import assert from "node:assert/strict";
import test from "node:test";
import { readdir, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import worker from "../dist/server/index.js";

const root=new URL("../",import.meta.url);
const days=(await readdir(new URL("experiments/chatgpt/",root))).filter(d=>/^day-\d{3}$/.test(d));
for(const day of days){
  const manifest=JSON.parse(await readFile(new URL("experiments/chatgpt/"+day+"/manifest.json",root),"utf8"));
  if(manifest.status!=="published")continue;
  test(day+" has a complete research and publication record",async()=>{
    const n=JSON.parse(await readFile(new URL("experiments/chatgpt/"+day+"/notebook.json",root),"utf8"));
    assert.equal(n.schemaVersion,1);
    for(const key of ["recorded","provenance","category","summary","question","observation","limitation","nextQuestion"])assert.ok(typeof n[key]==="string"&&n[key].trim(),key);
    assert.ok(n.method.length && n.tags.length && n.sources.length);
    for(const x of n.sources){
      assert.equal(new URL(x.url).protocol,"https:");
      for(const key of ["title","publisher","accessed","kind","use","limitation"])assert.ok(x[key],key);
    }
    for(const key of ["chapter","hook","scene","argument","counterpoint","readerExercise","futureSignal","revisit","figurePlan","rights","status"])assert.ok(n.book[key]?.trim(),key);
    const r=await worker.fetch(new Request("http://localhost/research/chatgpt/"+day),{ASSETS:{fetch:async()=>new Response("",{status:404})}},{waitUntil(){},passThroughOnException(){}});
    assert.equal(r.status,200);assert.ok((await r.text()).includes(manifest.title));
  });
}
for(const [path,marker] of [["/research","연구의 중심 질문"],["/book","매일의 실험"]]){
  test(path+" renders the document",async()=>{
    const r=await worker.fetch(new Request("http://localhost"+path),{ASSETS:{fetch:async()=>new Response("",{status:404})}},{waitUntil(){},passThroughOnException(){}});
    assert.equal(r.status,200);assert.ok((await r.text()).includes(marker));
  });
}
test("exports exactly match canonical notebooks",()=>{
  execFileSync(process.execPath,["scripts/export-chatgpt-book.mjs","--check"],{cwd:root});
});
test("download manuscripts are included in the deployment assets",async()=>{
  for(const file of ["chatgpt-book.md","design-minds-research-framework.md"]){
    const content=await readFile(new URL("dist/client/research/"+file,root),"utf8");
    const source=await readFile(new URL("public/research/"+file,root),"utf8");
    assert.equal(content,source);
    assert.match(content,/^# Design Minds/);
  }
});
test("unknown and malformed notebook days return 404",async()=>{
  for(const path of ["/research/chatgpt/day-999","/research/chatgpt/day-1"]){
    const r=await worker.fetch(new Request("http://localhost"+path),{ASSETS:{fetch:async()=>new Response("",{status:404})}},{waitUntil(){},passThroughOnException(){}});
    assert.equal(r.status,404);
  }
});
