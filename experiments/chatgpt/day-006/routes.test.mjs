import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../../../dist/server/index.js';
import {readFileSync} from 'node:fs';
for(const mind of ['chatgpt','gemini']) for(let day=1;day<=(mind==='chatgpt'?6:5);day++) for(const prefix of ['', '/research']) {
 const path=`${prefix}/${mind}/day-${String(day).padStart(3,'0')}`;
 test(path, async()=>{const r=await worker.fetch(new Request('http://localhost'+path),{ASSETS:{fetch:async()=>new Response('',{status:404})}},{waitUntil(){},passThroughOnException(){}}); assert.equal(r.status,200); assert.ok((await r.text()).length>1000);});
}
test('day006 selection and notebook structure',()=>{
 const base=new URL('./',import.meta.url);const m=JSON.parse(readFileSync(new URL('manifest.json',base)));const n=JSON.parse(readFileSync(new URL('notebook.json',base)));
 assert.equal(m.hypotheses.length,10);assert.equal(m.day,6);assert.equal(n.sources.length,4);for(const key of ['chapter','hook','scene','argument','counterpoint','readerExercise','futureSignal','revisit','figurePlan','rights','status'])assert.ok(n.book[key]);
});
