import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import worker from '../../../dist/server/index.js';
const env={ASSETS:{fetch:async()=>new Response('',{status:404})}};
const context={waitUntil(){},passThroughOnException(){}};
for(let day=11;day<=18;day++){
 const slug=`day-${String(day).padStart(3,'0')}`;
 const response=await worker.fetch(new Request(`https://test.invalid/chatgpt/${slug}`),env,context);
 assert.equal(response.status,200);
 const html=await response.text();
 const main=html.match(/<main[\s\S]*?<\/main>/)?.[0];
 assert.ok(main,slug);assert.match(main,/lang="en"/);assert.doesNotMatch(main,/[\uac00-\ud7af]/);
 assert.match(main,/>Reset<\/button>/);
 assert.ok(main.includes(`/research/chatgpt/${slug}`));
 const m=JSON.parse(await readFile(`experiments/chatgpt/${slug}/manifest.json`));
 assert.equal(m.hypotheses.length,10);assert.equal(new Set(m.hypotheses.map(x=>x.idea)).size,10);
 for(const h of m.hypotheses){assert.equal(h.scores.length,4);assert.ok(h.reason.length>15);}
 console.log(`${slug}: English rendered UI, reset, research link and hypothesis record passed.`);
}
for(const day of ['011','013']){
 const ledger=JSON.parse(await readFile(`experiments/chatgpt/day-${day}/asset-ledger.json`));
 for(const file of [ledger.file,ledger.file.replace('public/','dist/client/')]){
  const bytes=await readFile(file);assert.equal(bytes.length,ledger.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),ledger.sha256);
 }
}
console.log('8 English UI checks and both source/deployment media hash checks passed. No browser input claim.');
