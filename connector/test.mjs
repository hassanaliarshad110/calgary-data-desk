// Tests the Calgary Insight connector the way Claude and ChatGPT talk to it. The site's files are read from a local
// copy (MIRROR=dir, made by connector/mirror.py and web/mcp_answers.py); City open data is read live when LIVE=1.
import fs from 'node:fs';
import path from 'node:path';
import worker, { tools } from './worker.js';

const MIRROR = process.env.MIRROR, LIVE = process.env.LIVE === '1';
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  const u = String(url);
  if (u.startsWith('https://site.test/')) {
    const f = path.join(MIRROR, u.slice('https://site.test/'.length));
    return fs.existsSync(f) ? new Response(fs.readFileSync(f)) : new Response('not found', { status: 404 });
  }
  if (!LIVE) return new Response('offline', { status: 503 });
  return realFetch(url, opts && { method: opts.method, headers: opts.headers, body: opts.body });
};
const ENV = { SITE_URL: 'https://site.test/' };
let fails = 0;
const check = (c, what) => { if (!c) { fails++; console.log('FAIL', what); } else console.log('ok  ', what); };
const call = async body => {
  const r = await worker.fetch(new Request('https://x.workers.dev/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), ENV, {});
  const t = await r.text(); let o = null; try { o = t ? JSON.parse(t) : null; } catch (e) { o = t; }
  return { status: r.status, body: o };
};
const tool = async (name, args) => {
  const r = (await call({ jsonrpc: '2.0', id: 9, method: 'tools/call', params: { name, arguments: args } })).body.result;
  let data = r.structuredContent; if (!data) { try { data = JSON.parse(r.content[0].text); } catch (e) { data = r.content[0].text; } }
  return { r, data, len: r.content[0].text.length };
};

const init = await call({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } });
check(init.body.result.serverInfo.name === 'calgary-insight' && init.body.result.protocolVersion === '2025-06-18', 'initialize');
const list = (await call({ jsonrpc: '2.0', id: 2, method: 'tools/list' })).body.result.tools;
check(list.length === tools.length && list.some(t => t.name === 'search') && list.some(t => t.name === 'fetch'), `tools/list: ${list.length} tools`);
check(list.every(t => !/Hassan/i.test(t.description)) && !/Hassan/i.test(init.body.result.instructions), 'no personal name in the connector');

if (MIRROR) {
  const idx = JSON.parse(fs.readFileSync(path.join(MIRROR, 'data/mcp/index.json'), 'utf8'));
  console.log(`answers: ${Object.keys(idx.files).length} files, ${(idx.total_bytes / 1e6).toFixed(1)} MB, ${Object.keys(idx.failed).length} not written`);
  const big = Object.entries(idx.files).sort((a, b) => b[1] - a[1]).slice(0, 12);
  console.log('largest:', big.map(([k, v]) => `${k} ${(v / 1e3).toFixed(0)} kB`).join(', '));
  const ov = await tool('calgary_overview', {});
  check(!ov.r.isError && ov.len > 500, `calgary_overview (all of Calgary): ${ov.len} characters`);
  const o5 = await tool('calgary_overview', { ward: 5 });
  check(!o5.r.isError && o5.len > 500, `calgary_overview ward 5: ${o5.len} characters`);
  for (const s of ['crime', 'traffic', 'communities', 'access', 'elections', 'profile', 'growth_forecast', 'property_tax']) {
    const x = await tool('get_dashboard', { section: s, ward: 3 });
    check(!x.r.isError, `get_dashboard ${s} ward 3: ${x.len} characters${x.r.isError ? ' ' + x.r.content[0].text : ''}`);
  }
  for (const [s, p] of [['wards'], ['budget_intelligence'], ['budget_intelligence', 'departments'], ['tourism', 'countries'], ['school_tax', 'boards'], ['police_study'], ['city_news'], ['federal_budget', 'chapter'], ['visiting', 'sights'], ['safest_cities']]) {
    const x = await tool('get_dashboard', { section: s, part: p, chapter: p === 'chapter' ? 2 : undefined });
    check(!x.r.isError, `get_dashboard ${s}${p ? ' ' + p : ''}: ${x.len} characters${x.r.isError ? ' ' + x.r.content[0].text : ''}`);
  }
  const cw = await tool('compare_wards', {});
  check(!cw.r.isError && cw.len > 1000, 'compare_wards');
  const br = await tool('budget_requests', { find: 'transit' });
  check(!br.r.isError && br.data.matched > 0, `budget_requests "transit": ${br.data.matched} requests`);
  const b1 = await tool('budget_requests', { case_number: 1 });
  check(!b1.r.isError, 'budget_requests case 1');
  const bad = await tool('get_dashboard', { section: 'tourism', part: 'nope' });
  check(bad.r.isError, 'unknown part: an error listing the parts');
  const nw = await tool('get_dashboard', { section: 'city_news', find: 'transit' });
  check(!nw.r.isError, 'city_news narrowed with find');
  const so = await tool('search_open_data', { query: 'dog licences' });
  check(so.data.datasets && so.data.datasets.length > 0, `search_open_data "dog licences": ${so.data.datasets && so.data.datasets[0] && so.data.datasets[0].name}`);
  const gm = await tool('get_method', { topic: 'population' });
  check(gm.data.methods && gm.data.methods.length > 0, 'get_method population');
  const se = await tool('search', { query: 'crime in ward 7' });
  check(se.data.results.some(r => r.id === 'dash:7:crime'), 'search: crime in ward 7');
  const fe = await tool('fetch', { id: 'dash:7:crime' });
  check(fe.data.id === 'dash:7:crime' && fe.data.text.length > 100, 'fetch: crime in ward 7');
  if (LIVE && so.data.datasets && so.data.datasets[0]) {
    const id = so.data.datasets[0].id;
    const de = await tool('describe_open_dataset', { dataset_id: id });
    check(!de.r.isError && de.data.columns.length > 0, `describe_open_dataset ${id} (live)`);
    const q = await tool('query_open_data', { dataset_id: id, limit: 5 });
    check(!q.r.isError && q.data.row_count > 0, `query_open_data ${id} (live): ${q.r.isError ? q.r.content[0].text : q.data.row_count + ' rows'}`);
  }
}
check((await tool('describe_open_dataset', { dataset_id: 'bad id' })).r.isError, 'bad dataset id is an error');
console.log(fails ? `\n${fails} FAILED` : '\nall passed');
process.exit(fails ? 1 : 0);
