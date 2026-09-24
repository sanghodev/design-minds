import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import worker from '../../../dist/server/index.js';
const env = { ASSETS: { fetch: async () => new Response('', { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };
let count = 0;
for (const mind of ['chatgpt', 'gemini']) {
  for (const day of (await readdir(`experiments/${mind}`)).filter(d => /^day-\d{3}$/.test(d))) {
    if (mind === 'gemini') {
      const notebook = JSON.parse(await readFile(`experiments/${mind}/${day}/notebook.json`, 'utf8'));
      if (!notebook.nextQuestion || !notebook.book) continue;
    }
    for (const path of [`/${mind}/${day}`, `/research/${mind}/${day}`]) {
      console.log('Checking', path);
      const response = await worker.fetch(new Request('https://test.invalid' + path), env, ctx);
      assert.equal(response.status, 200, path);
      const html = await response.text();
      assert.ok(html.length > 100, path);
      if (path === '/chatgpt/day-010') {
        assert.ok(html.includes('소속 비공개'));
        assert.ok(html.includes('type="range"'));
        assert.ok(!html.includes('A = 01'));
      }
      count++;
    }
  }
}
for (const path of ['/', '/research', '/book']) {
  const response = await worker.fetch(new Request('https://test.invalid' + path), env, ctx);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.ok(html.includes(path === '/research' ? '연구의 중심 질문' : 'Between Is Not Belonging'), path);
  count++;
}
for (const file of ['chatgpt-book.md', 'gemini-book.md']) {
  assert.equal(await readFile('dist/client/research/' + file, 'utf8'), await readFile('public/research/' + file, 'utf8'));
  count++;
}
console.log(`${count} route/asset checks passed. Server rendering only; not browser interaction.`);
