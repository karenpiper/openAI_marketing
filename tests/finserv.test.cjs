const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, path) => module._compile(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, path);
const { initialFinserv, finservResult } = require('../lib/finserv.ts');
test('anonymous signals cannot create a download, event or Sales handoff', () => {
 const r = finservResult({ ...initialFinserv, downloaded: true, event: 'attended', meeting: true });
 assert.equal(r.next, 'Capture email on the landing page');
 assert.equal(r.sales, 'Continue marketing nurture');
 assert.equal(r.history.length, 1);
});
test('Top 20 broad entry switches to roundtable without automatically prompting Sales on download', () => {
 const r = finservResult({ ...initialFinserv, entry: 'broad', captured: true, downloaded: true });
 assert.equal(r.track, 'Top 20');
 assert.match(r.next, /roundtable/);
 assert.match(r.sales, /active follow-up pending/);
});
test('Top 20 registration prompts Account Director follow-up', () => {
 assert.equal(finservResult({ ...initialFinserv, captured: true, downloaded: true, event: 'registered' }).sales, 'Account Director follow-up prompted');
});
test('broader audience gets webinar and only direct requests trigger Sales', () => {
 const s = { ...initialFinserv, top20: false, entry: 'broad', captured: true, downloaded: true };
 assert.match(finservResult(s).next, /webinar/);
 assert.equal(finservResult({ ...s, event: 'attended' }).sales, 'Continue marketing nurture');
 assert.equal(finservResult({ ...s, meeting: true }).sales, 'Route meeting request to Sales');
});
test('both tracks receive proof when the guide is not downloaded', () => {
 for (const top20 of [true, false]) assert.match(finservResult({ ...initialFinserv, top20, captured: true }).next, /relevant proof/);
});
