// Second-stage security checks of the Budget Intelligence screen, in a running copy of the site (headless Chromium).
// 1. what the screen asks the site for, and whether it writes anything; 2. what it sends over the network;
// 3. whether text from the data files can run as code (markup injected into every text field of the two data files);
// 4. whether the address bar can be used to inject anything.
// usage: node sec.js <base-url> <out.json>
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.argv[2], OUT = process.argv[3];
const R = [];
const ok = (name, cond, detail) => { R.push({ name, result: cond ? 'PASS' : 'FAIL', detail: String(detail === undefined ? '' : detail).slice(0, 500) }); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  [' + String(detail).slice(0, 260) + ']' : '')); };
const SECTIONS = ['overview', 'operating', 'capital', 'revenue', 'actual', 'cases', 'projects', 'performance', 'simulator', 'links', 'checks'];
const known = t => /at score \(/.test(t) && /startsWith/.test(t);

(async () => {
  const browser = await chromium.launch();

  // ---------------------------------------------------------------- 1 and 2: bridge calls, storage, network
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => { const t = String(e.stack || e.message || e); if (!known(t)) errs.push(t.slice(0, 200)); });
    const reqs = []; let record = false;
    p.on('request', r => { if (record) reqs.push({ method: r.method(), url: r.url(), type: r.resourceType(), post: !!r.postData() }); });
    await p.addInitScript(() => {
      window.__log = { storage: [], cookie: [], history: [], idb: [], open: [], beacon: [] };
      const si = Storage.prototype.setItem, ri = Storage.prototype.removeItem;
      Storage.prototype.setItem = function (k, v) { if (window.__rec) window.__log.storage.push('set ' + k); return si.apply(this, arguments); };
      Storage.prototype.removeItem = function (k) { if (window.__rec) window.__log.storage.push('remove ' + k); return ri.apply(this, arguments); };
      const d = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
      Object.defineProperty(document, 'cookie', { get() { return d.get.call(document); }, set(v) { if (window.__rec) window.__log.cookie.push(String(v).slice(0, 60)); d.set.call(document, v); } });
      const rs = history.replaceState, ps = history.pushState;
      history.replaceState = function (a, b, u) { if (window.__rec) window.__log.history.push('replace ' + u); return rs.apply(this, arguments); };
      history.pushState = function (a, b, u) { if (window.__rec) window.__log.history.push('push ' + u); return ps.apply(this, arguments); };
      const io = indexedDB.open.bind(indexedDB); indexedDB.open = function (n) { if (window.__rec) window.__log.idb.push(n); return io.apply(null, arguments); };
      const wo = window.open; window.open = function (u) { if (window.__rec) window.__log.open.push(String(u)); return null; };
      if (navigator.sendBeacon) { const sb = navigator.sendBeacon.bind(navigator); navigator.sendBeacon = function (u) { if (window.__rec) window.__log.beacon.push(String(u)); return sb.apply(null, arguments); }; }
    });
    await p.goto(BASE + '/?view=help', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3500);
    // wrap every function of the site's bridge so each call from now on is recorded
    const wrapped = await p.evaluate(async () => { const a = await api(); window.__calls = []; let n = 0; for (const k of Object.keys(a)) if (typeof a[k] === 'function') { const f = a[k]; a[k] = function () { window.__calls.push(k); return f.apply(this, arguments); }; n++; } const b = await api(); return { n, same: a === b }; });
    ok('the test can see every call the screen makes to the site (the bridge object is one shared object)', wrapped.same && wrapped.n > 20, JSON.stringify(wrapped));
    await p.evaluate(() => { window.__rec = true; }); record = true;
    await p.evaluate(() => show('budget-intelligence')); await p.waitForSelector('#bi-main > *'); await p.waitForTimeout(2500);
    for (const s of SECTIONS) { await p.click(`#bi-rail [data-sec="${s}"]`); await p.waitForTimeout(s === 'performance' || s === 'links' ? 1800 : 500); }
    await p.click('#bi-rail [data-sec="cases"]'); await p.waitForSelector('.bi-list');
    await p.fill('#bi-q', 'police'); await p.waitForTimeout(400); await p.selectOption('[data-f="type"]', 'capital'); await p.waitForTimeout(250); await p.fill('#bi-q', ''); await p.selectOption('[data-f="type"]', ''); await p.waitForTimeout(400);
    await p.click('[data-case="1"]'); await p.waitForTimeout(250); await p.click('.bi-pager [data-page="1"]'); await p.waitForTimeout(250);
    await p.click('#bi-rail [data-sec="simulator"]'); await p.waitForSelector('#bi-sim-v'); await p.fill('#bi-sim-v', '750000'); await p.waitForTimeout(250);
    await p.click('#bi-rail [data-sec="overview"]'); await p.waitForSelector('#bi-layers input'); for (const v of ['people', 'infra', 'cases', 'tax']) { await p.check(`#bi-layers input[value="${v}"]`); await p.waitForTimeout(300); }
    const noTheme = await p.evaluate(() => ({ calls: window.__calls.slice(), storage: window.__log.storage.slice() }));
    await p.click('#theme-btn'); await p.waitForTimeout(500); await p.click('#theme-btn'); await p.waitForTimeout(500);       // the site's own theme button (not part of the new screen)
    const before = await p.evaluate(() => ({ calls: window.__calls.slice(), log: JSON.parse(JSON.stringify(window.__log)) }));
    await p.click('#bi-rail [data-sec="cases"]'); await p.waitForSelector('#bi-export');
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), p.click('#bi-export')]);
    const after = await p.evaluate(() => ({ calls: window.__calls.slice(), log: JSON.parse(JSON.stringify(window.__log)) }));
    record = false;
    const uniq = a => [...new Set(a)].sort();
    const reads = uniq(noTheme.calls), allow = ['get_budget', 'get_property_tax', 'compare_wards', 'get_accountability', 'get_infra'];
    const themeCalls = uniq(before.calls.slice(noTheme.calls.length));
    ok('browsing all eleven sections, filtering, opening a request, paging, the simulator and the map: the screen makes exactly the five read calls it is written to use, and no other', reads.join(',') === allow.slice().sort().join(',') && !noTheme.storage.length, 'calls: ' + reads.join(', ') + '; browser storage writes: ' + (noTheme.storage.length || 'none'));
    ok('pressing the site\'s own theme button adds only the site\'s existing theme call (set_theme, which saves the light or dark choice in this browser)', themeCalls.join(',') === 'set_theme', 'calls: ' + (themeCalls.join(', ') || 'none'));
    const exportCalls = after.calls.slice(before.calls.length);
    ok('"Save this list" makes exactly one more call, save_csv, which hands a file to the browser\'s downloads', exportCalls.length === 1 && exportCalls[0] === 'save_csv' && /\.csv$/.test(dl.suggestedFilename()), exportCalls.join(', ') + ' -> ' + dl.suggestedFilename());
    const themeKeys = uniq(after.log.storage);
    ok('nothing is stored in the browser by the screen (the only storage writes are the site\'s own theme setting, made by the theme button)', themeKeys.every(k => /theme/i.test(k)), themeKeys.join(', ') || 'none');
    ok('no cookie is set, no browser database is opened, no beacon is sent, no window is opened by script', !after.log.cookie.length && !after.log.idb.length && !after.log.beacon.length && !after.log.open.length, JSON.stringify({ cookie: after.log.cookie, idb: after.log.idb, beacon: after.log.beacon, open: after.log.open }));
    const hist = uniq(after.log.history.map(h => h.replace(/^(replace|push) /, '$1 ')));
    ok('the address bar is only rewritten in place to remember the section (no new history entries, same page)', after.log.history.every(h => /^replace \/?\??/.test(h) && !/^replace https?:\/\/(?!localhost)/.test(h)) && !after.log.history.some(h => /^push/.test(h)), hist.slice(0, 6).join(' | '));
    const origin = new URL(BASE).origin;
    const outside = uniq(reqs.filter(r => !r.url.startsWith(origin) && !r.url.startsWith('data:') && !r.url.startsWith('blob:')).map(r => r.method + ' ' + new URL(r.url).host));
    const nonGet = reqs.filter(r => r.method !== 'GET' || r.post);
    ok('every network request while the screen is open is a GET to the site itself: nothing is sent anywhere', !nonGet.length && !outside.length, `${reqs.length} requests; other hosts: ${outside.join(', ') || 'none'}; not GET: ${nonGet.length}`);
    const files = uniq(reqs.filter(r => r.url.startsWith(origin)).map(r => new URL(r.url).pathname.replace(/^\//, '')));
    ok('the files it reads are the site\'s existing data files and its own two', files.every(f => /^(data\/|budget-intel\/|vendor\/|communities\/|$|index\.html|.*\.(css|js|svg|png|ico|woff2?|json))/.test(f)), files.join(', '));
    ok('no script errors', !errs.length, JSON.stringify(errs).slice(0, 200));
    fs.writeFileSync(OUT.replace(/\.json$/, '-calls.json'), JSON.stringify({ bridge_calls_while_browsing: reads, bridge_calls_by_the_site_theme_button: themeCalls, bridge_calls_on_export: exportCalls, storage_writes: themeKeys, history: hist, files_requested: files, requests: reqs.length, requests_to_other_hosts: outside, requests_not_get: nonGet.length }, null, 1));
    await ctx.close();
  }

  // ---------------------------------------------------------------- 3: markup injected into the data files
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errs = [], dialogs = [];
    p.on('pageerror', e => { const t = String(e.stack || e.message || e); if (!known(t)) errs.push(t.slice(0, 200)); });
    p.on('dialog', d => { dialogs.push(d.message()); d.dismiss().catch(() => {}); });
    const BAD = '"\'><img src=x onerror="window.__xss=(window.__xss||0)+1"><script>window.__xss=(window.__xss||0)+100</script><svg onload="window.__xss=(window.__xss||0)+1000">';
    const poison = (o, keep) => { if (typeof o === 'string') return o + BAD; if (Array.isArray(o)) return o.map(x => poison(x, keep)); if (o && typeof o === 'object') { const r = {}; for (const [k, v] of Object.entries(o)) r[k] = keep.includes(k) ? v : poison(v, keep); return r; } return o; };
    let touched = 0;
    await p.route('**/budget-intel/business-cases.json', async route => { const r = await route.fetch(); const j = await r.json();
      // every text field of every request and of the file's heading is given markup; "type" and "wards" are kept so the screen still has something to draw; the document's address is made a javascript: address
      j.cases = j.cases.map(c => poison(c, ['type', 'wards'])); j.status = j.status + BAD; j.source = { ...j.source, title: j.source.title + BAD, url: 'javascript:window.__xss=(window.__xss||0)+5000//', modified: j.source.modified }; j.themes = j.themes.map(t => t + BAD); touched++;
      await route.fulfill({ response: r, json: j }); });
    await p.route('**/budget-intel/crosswalk.json', async route => { const r = await route.fetch(); const j = await r.json(); touched++; await route.fulfill({ response: r, json: poison(j, []) }); });
    const state = [];
    for (const s of SECTIONS) {
      await p.goto(`${BASE}/?view=budget-intelligence&bi=${s}`, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#bi-main > *', { timeout: 20000 }); await p.waitForTimeout(s === 'performance' || s === 'links' || s === 'overview' ? 2000 : 800);
      if (s === 'cases') { await p.click('[data-case]'); await p.waitForTimeout(400); await p.fill('#bi-q', 'img'); await p.waitForTimeout(500); await p.fill('#bi-q', ''); await p.waitForTimeout(400); await p.click('details.bi-acc > summary'); await p.waitForTimeout(200); }
      if (s === 'checks') await p.evaluate(() => document.querySelectorAll('.bi-check').forEach(d => { d.open = true; }));
      state.push(await p.evaluate(s => { const v = document.getElementById('view-budget-intelligence'); return { s, xss: window.__xss || 0, imgs: v.querySelectorAll('img[src="x"]').length, scripts: v.querySelectorAll('script').length, svgOnload: v.querySelectorAll('svg[onload]').length, handlers: [...v.querySelectorAll('*')].filter(e => [...e.attributes].some(a => /^on/i.test(a.name))).length,
        jsLinks: [...v.querySelectorAll('a[href]')].filter(a => /^\s*javascript:/i.test(a.getAttribute('href'))).length, shownAsText: v.innerText.includes('<img src=x onerror='), len: v.innerText.length }; }, s));
    }
    // follow a link to the document, if any link was drawn, to see that nothing runs
    await p.goto(`${BASE}/?view=budget-intelligence&bi=cases`, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#bi-main > *'); await p.waitForTimeout(800);
    const hrefs = await p.evaluate(() => [...document.querySelectorAll('#view-budget-intelligence a[href]')].map(a => a.getAttribute('href')).slice(0, 400));
    const pg0 = ctx.pages().length; const a1 = p.locator('#view-budget-intelligence .c-p a').first(); if (await a1.count()) { await a1.click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(600); }
    const ran = await p.evaluate(() => window.__xss || 0);
    ok('the test data reached the screen (both data files were replaced with copies carrying markup in every text field)', touched >= 2 && state.some(x => x.shownAsText), `files replaced ${touched} times; markup visible as plain text on: ${state.filter(x => x.shownAsText).map(x => x.s).join(', ')}`);
    ok('no injected markup ran as code on any of the eleven sections (no element, script or handler was created from the data)', state.every(x => !x.xss && !x.imgs && !x.scripts && !x.svgOnload && !x.handlers) && !dialogs.length, JSON.stringify(state.filter(x => x.xss || x.imgs || x.scripts || x.svgOnload || x.handlers).slice(0, 3)) + ' dialogs ' + dialogs.length);
    const jl = state.reduce((n, x) => n + x.jsLinks, 0);
    ok('a javascript: address planted as the document\'s address is not used as a link, and clicking a document link runs nothing', jl === 0 && ran === 0, `links with a javascript: address: ${jl}; code ran: ${ran}; first link: ${(hrefs.find(h => /page=/.test(h)) || hrefs[0] || 'none').slice(0, 70)}`);
    ok('every section still draws with the tampered data (no crash)', state.every(x => x.len > 200) && !errs.length, JSON.stringify(errs).slice(0, 200) || state.map(x => x.len).join(' '));
    await ctx.close();
  }

  // ---------------------------------------------------------------- 4: the address bar
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errs = [], dialogs = [];
    p.on('pageerror', e => { const t = String(e.stack || e.message || e); if (!known(t)) errs.push(t.slice(0, 200)); }); p.on('dialog', d => { dialogs.push(d.message()); d.dismiss().catch(() => {}); });
    const tries = ['bi=%3Cimg%20src%3Dx%20onerror%3Dwindow.__xss%3D1%3E', 'bi=cases&case=%3Cscript%3Ewindow.__xss%3D1%3C%2Fscript%3E', 'bi=__proto__', 'bi=constructor', 'case=99999', 'case=-1', 'case=1e9', 'bi=cases&case=82%22%3E%3Cimg%20src%3Dx%20onerror%3Dwindow.__xss%3D1%3E'];
    const out = [];
    for (const q of tries) { await p.goto(`${BASE}/?view=budget-intelligence&${q}`, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#bi-main > *', { timeout: 20000 }); await p.waitForTimeout(900);
      out.push(await p.evaluate(q => ({ q, xss: window.__xss || 0, sec: (document.querySelector('#bi-rail [aria-checked="true"]') || {}).dataset ? document.querySelector('#bi-rail [aria-checked="true"]').dataset.sec : null, imgs: document.querySelectorAll('#view-budget-intelligence img[src="x"]').length, len: document.getElementById('bi-main').innerText.length, failed: /could not be drawn/i.test(document.getElementById('bi-main').innerText) }), q)); }
    ok('unknown or hostile values in the address (?bi=..., ?case=...) run nothing and fall back to a normal section', out.every(o => !o.xss && !o.imgs && o.len > 200 && !o.failed && ['overview', 'cases'].includes(o.sec)) && !dialogs.length && !errs.length, out.map(o => `${o.q.slice(0, 22)}→${o.sec}`).join(' | ') + ' ' + JSON.stringify(errs).slice(0, 120));
    await ctx.close();
  }
  await browser.close();
  const fail = R.filter(r => r.result === 'FAIL');
  fs.writeFileSync(OUT, JSON.stringify({ when: new Date().toISOString(), engine: 'Playwright Chromium, headless', passed: R.length - fail.length, failed: fail.length, results: R }, null, 1));
  console.log(`\npassed ${R.length - fail.length} failed ${fail.length}`);
})().catch(e => { console.error('STOPPED', e); process.exit(2); });
