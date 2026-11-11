// Second-stage user-experience audit of the Budget Intelligence screen. Everything here runs in headless Chromium:
// "phone" and "tablet" are emulated devices (viewport, touch, user agent), not real devices.
// usage: node ux.js <base-url> <business-cases.json> <out-dir>
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.argv[2], BC = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), OUT = process.argv[4];
fs.mkdirSync(OUT, { recursive: true });
const R = [];
const ok = (group, name, cond, detail, kind) => { R.push({ group, name, result: cond ? 'PASS' : 'FAIL', detail: String(detail === undefined ? '' : detail).slice(0, 300), tested_on: kind || 'desktop Chromium (headless)' }); console.log((cond ? 'PASS ' : 'FAIL ') + group + ' | ' + name + (detail !== undefined ? '  [' + String(detail).slice(0, 160) + ']' : '')); };
const SECTIONS = ['overview', 'operating', 'capital', 'revenue', 'actual', 'cases', 'projects', 'performance', 'simulator', 'links', 'checks'];
const C = BC.cases, DOC = BC.source.url;
const sum = a => a.reduce((x, y) => x + (y || 0), 0);
const known = t => /at score \(/.test(t) && /startsWith/.test(t);          // the site-search defect that is already on the live site

(async () => {
  const browser = await chromium.launch();
  const watch = (page, errs) => page.on('pageerror', e => { const t = String(e.stack || e.message || e); if (!known(t)) errs.push(t.slice(0, 220)); });

  // ------------------------------------------------------------------ 1. every section, three screen sizes, two themes
  const DEV = [['desktop 1440x900', { viewport: { width: 1440, height: 900 } }, 'desktop Chromium (headless)'],
    ['tablet (emulated iPad Mini)', { ...devices['iPad Mini'] }, 'emulated tablet (Chromium, iPad Mini profile)'],
    ['phone (emulated iPhone 13)', { ...devices['iPhone 13'] }, 'emulated phone (Chromium, iPhone 13 profile)'],
    ['small phone (emulated 360x640)', { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, 'emulated phone (Chromium, 360x640)']];
  for (const [label, opts, kind] of DEV) {
    for (const theme of ['light', 'dark']) {
      const ctx = await browser.newContext({ ...opts, colorScheme: theme }); const p = await ctx.newPage(); const errs = [], bad = [];
      watch(p, errs);
      p.on('response', r => { if (r.url().startsWith(BASE) && r.status() >= 400) bad.push(r.status() + ' ' + r.url().replace(BASE, '')); });
      await p.addInitScript(t => { try { localStorage.setItem('theme', t); } catch (e) { /* none */ } }, theme);
      const res = [];
      for (const s of SECTIONS) {
        await p.goto(`${BASE}/?view=budget-intelligence&bi=${s}`, { waitUntil: 'domcontentloaded' });
        await p.waitForSelector('#bi-main > *', { timeout: 20000 });
        await p.waitForTimeout(s === 'performance' || s === 'links' || s === 'overview' ? 1800 : 700);
        await p.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
        await p.waitForTimeout(250);
        const info = await p.evaluate(s => {
          const v = document.getElementById('view-budget-intelligence'), m = document.getElementById('bi-main');
          const cur = document.querySelector('#bi-rail [aria-checked="true"]');
          const wide = [...m.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 2 && !e.closest('.table-wrap, .bi-x, .leaflet-container, .bi-rail, canvas'); }).length;
          return { on: v.classList.contains('is-on'), len: m.innerText.trim().length, cur: cur && cur.dataset.sec, pageScroll: document.scrollingElement.scrollWidth - innerWidth, viewScroll: v.scrollWidth - v.clientWidth, wide,
            failed: /could not be (drawn|loaded)/i.test(m.innerText), theme: document.documentElement.getAttribute('data-theme') };
        }, s);
        res.push([s, info]);
      }
      const short = res.filter(([s, i]) => !i.on || i.len < 300 || i.cur !== s || i.failed).map(([s, i]) => `${s}:${i.len}`);
      const over = res.filter(([s, i]) => i.pageScroll > 1 || i.viewScroll > 1 || i.wide).map(([s, i]) => `${s}:${i.pageScroll}/${i.viewScroll}/${i.wide}`);
      ok('1 sections', `${label}, ${theme}: all eleven sections draw with content`, !short.length, short.join(' ') || res.map(([s, i]) => i.len).join(' '), kind);
      ok('1 sections', `${label}, ${theme}: no sideways scrolling of the page, nothing wider than the screen`, !over.length, over.join(' ') || 'none', kind);
      ok('1 sections', `${label}, ${theme}: no script errors, no failed requests`, !errs.length && !bad.length, JSON.stringify([...errs, ...bad]).slice(0, 250), kind);
      await ctx.close();
    }
  }

  // ------------------------------------------------------------------ 2. mobile navigation
  {
    const kind = 'emulated phone (Chromium, iPhone 13 profile)';
    const ctx = await browser.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage(); const errs = []; watch(p, errs);
    await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(2500);
    await p.tap('#menu-btn'); await p.waitForTimeout(400);
    ok('2 mobile navigation', 'the site menu opens from the menu button', await p.evaluate(() => document.querySelector('.side').classList.contains('open')), '', kind);
    const tab = p.locator('.tab[data-view="budget-intelligence"]');
    if (!(await tab.isVisible())) { await p.locator('.nav-g[data-group="money"] .nav-gt').tap(); await p.waitForTimeout(300); }
    ok('2 mobile navigation', 'Budget Intelligence is listed under Money, after City budget', await p.evaluate(() => { const t = [...document.querySelectorAll('.nav-g[data-group="money"] .tab')].map(x => x.dataset.view); return t.indexOf('budget-intelligence') === t.indexOf('budget') + 1; }), '', kind);
    await tab.tap(); await p.waitForSelector('#bi-main > *'); await p.waitForTimeout(1200);
    ok('2 mobile navigation', 'tapping it opens the screen and closes the menu', await p.evaluate(() => document.getElementById('view-budget-intelligence').classList.contains('is-on') && !document.querySelector('.side').classList.contains('open')), '', kind);
    const visited = [];
    for (const s of SECTIONS) {
      const b = p.locator(`#bi-rail [data-sec="${s}"]`); await b.scrollIntoViewIfNeeded(); await b.tap(); await p.waitForTimeout(s === 'performance' || s === 'links' ? 1500 : 500);
      const st = await p.evaluate(() => { const c = document.querySelector('#bi-rail [aria-checked="true"]'), r = c.getBoundingClientRect(); return { sec: c.dataset.sec, inView: r.left >= -1 && r.right <= innerWidth + 1, len: document.getElementById('bi-main').innerText.length, url: location.search }; });
      visited.push(st.sec === s && st.inView && st.len > 300 && (s === 'overview' ? !/bi=/.test(st.url) : st.url.includes('bi=' + s)) ? null : `${s}:${JSON.stringify(st)}`);
    }
    ok('2 mobile navigation', 'each of the eleven sections opens from the section strip, the chosen one stays in view, and the address keeps it', visited.every(v => !v), visited.filter(Boolean).join(' ') || 'all eleven', kind);
    const tap = await p.evaluate(() => [...document.querySelectorAll('#bi-rail [role="radio"]')].map(b => b.getBoundingClientRect()).filter(r => r.height < 40 || r.width < 40).length);
    ok('2 mobile navigation', 'section buttons are at least 40 px in each direction for a finger', tap === 0, tap + ' smaller', kind);
    await p.goto(BASE + '/?view=budget-intelligence&case=82', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.bi-case', { timeout: 20000 });
    ok('2 mobile navigation', 'a link to one request (?case=82) opens that request on a phone', (await p.locator('.bi-item.open .c-t button').innerText()).includes('GamePLAN'), '', kind);
    await p.goBack().catch(() => {});
    ok('2 mobile navigation', 'no script errors', !errs.length, JSON.stringify(errs).slice(0, 200), kind);
    await ctx.close();
  }

  // ------------------------------------------------------------------ 3. filtering, against counts worked out here from the data file
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); const p = await ctx.newPage(); const errs = []; watch(p, errs);
    await p.goto(BASE + '/?view=budget-intelligence&bi=cases', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.bi-list');
    const shown = async () => { await p.waitForTimeout(260); const t = (await p.locator('.bi-sum').innerText()).replace(/\s+/g, ' '); return +t.match(/^([\d,]+) request/)[1].replace(/,/g, ''); };
    const set = async (f, v) => { await p.selectOption(`[data-f="${f}"]`, String(v)); };
    await p.click('details.bi-acc > summary');
    const opts = async f => p.evaluate(f => [...document.querySelector(`[data-f="${f}"]`).options].map(o => o.value).filter(Boolean), f);
    const deptLabel = async () => p.evaluate(() => null);
    let n = 0, wrong = [];
    // every value of every filter, one at a time
    const expect = { type: v => C.filter(c => c.type === v).length, theme: v => C.filter(c => c.theme === v).length,
      ward: v => C.filter(c => v === 'all' ? c.wards === 'all' : Array.isArray(c.wards) && c.wards.includes(+v)).length,
      risk: v => C.filter(c => c.risk === v).length, stage: v => C.filter(c => c.stage === v).length,
      fund: v => C.filter(c => (c.funding || '').split(',').map(x => x.trim()).includes(v)).length,
      flag: v => C.filter(c => v === 'required' ? c.required : v === 'new' ? c.new : c.footnotes).length };
    for (const f of Object.keys(expect)) for (const v of await opts(f)) { await set(f, v); const got = await shown(), want = expect[f](v); n++; if (got !== want) wrong.push(`${f}=${v}: ${got} vs ${want}`); await set(f, ''); }
    ok('3 filtering', `every value of seven filters, one at a time (${n} values), shows the number of requests counted from the data file`, !wrong.length, wrong.join('; ') || `${n} of ${n}`);
    // department and reason: the screen groups the document's spellings; totals over all values must cover every case exactly once
    for (const f of ['dept', 'rationale']) { let tot = 0; const vs = await opts(f); for (const v of vs) { await set(f, v); tot += await shown(); await set(f, ''); } ok('3 filtering', `the ${f === 'dept' ? 'department' : 'reason given'} values (${vs.length}) together cover all 384 requests once`, tot === 384, tot); }
    // combinations
    wrong = []; n = 0;
    for (const [t, w] of [['capital', '7'], ['capital', 'all'], ['capital', '5'], ['operating', ''], ['capital', '14']]) for (const th of ['', ...BC.themes.slice(0, 3)]) {
      await set('type', t); await set('ward', w); await set('theme', th);
      const want = C.filter(c => c.type === t && (!w || (w === 'all' ? c.wards === 'all' : Array.isArray(c.wards) && c.wards.includes(+w))) && (!th || c.theme === th)).length, got = await p.evaluate(() => { const s = document.querySelector('.bi-sum'); return s ? +s.innerText.match(/^([\d,]+)/)[1].replace(/,/g, '') : 0; });
      await p.waitForTimeout(200); const g2 = await p.evaluate(() => { const s = document.querySelector('.bi-sum b'); return +s.innerText.replace(/,/g, ''); });
      n++; if (g2 !== want) wrong.push(`${t}/${w}/${th}: ${g2} vs ${want}`);
    }
    await set('type', ''); await set('ward', ''); await set('theme', '');
    ok('3 filtering', `combined filters (kind x ward x Council priority, ${n} combinations) match counts from the data file`, !wrong.length, wrong.join('; ') || `${n} of ${n}`);
    // search
    wrong = []; const words = ['police', 'water', 'transit', 'P854_000', '#82', 'green line', 'fire', 'recreation', 'zzzz'];
    for (const q of words) { await p.fill('#bi-q', q); await p.waitForTimeout(450); const want = C.filter(c => `${c.title} ${c.dept} ${c.bu} ${c.budget_id || ''} ${c.service_area || ''} #${c.n}`.toLowerCase().includes(q.toLowerCase())).length;
      const got = await p.evaluate(() => { const s = document.querySelector('.bi-sum b'); return s ? +s.innerText.replace(/,/g, '') : 0; }); if (got !== want) wrong.push(`${q}: ${got} vs ${want}`); }
    ok('3 filtering', `search (${words.length} searches: words, a Budget ID, a number, nothing found) matches the data file`, !wrong.length, wrong.join('; ') || words.join(', '));
    ok('3 filtering', 'a search with no match shows a plain "no request matches" message, not an empty page', await p.locator('#bi-case-list .bi-empty').count() === 1);
    await p.fill('#bi-q', ''); await p.waitForTimeout(450);
    // the summary line's money and positions, for one filter, against the file
    await set('type', 'operating'); await p.waitForTimeout(300);
    const line = (await p.locator('.bi-sum').innerText()).replace(/\s+/g, ' ');
    const op = C.filter(c => c.type === 'operating');
    ok('3 filtering', 'the totals line for operating requests equals the data file (one-time dollars, 2027 positions)', line.includes(`$${sum(op.map(c => sum(c.one_time_m))).toFixed(1)} million`) && line.includes(`${sum(op.map(c => c.ftes[0]))} positions in 2027`), line);
    await set('type', '');
    // paging: walk every page, collect every row and every link to the City's document
    const seen = [], links = [];
    for (;;) {
      const rows = await p.evaluate(() => [...document.querySelectorAll('.bi-item')].map(i => ({ n: +i.querySelector('.c-n').innerText, href: i.querySelector('.c-p a').getAttribute('href'), target: i.querySelector('.c-p a').target, rel: i.querySelector('.c-p a').rel, label: i.querySelector('.c-p a').getAttribute('aria-label') })));
      seen.push(...rows.map(r => r.n)); links.push(...rows);
      const next = p.locator('.bi-pager [data-page="1"]'); if (await next.isDisabled()) break; await next.click(); await p.waitForTimeout(120);
    }
    ok('3 filtering', 'paging through the whole list shows every request once, in the City\'s order', seen.length === 384 && seen.every((v, i) => v === i + 1), `${seen.length} rows over ${Math.ceil(seen.length / 25)} pages`);

    // ---------------------------------------------------------------- 4. PDF links
    const badL = links.filter(l => { const c = C[l.n - 1]; return l.href !== `${DOC}#page=${c.page}` || l.target !== '_blank' || !/noopener/.test(l.rel) || !l.label; });
    ok('4 PDF links', 'all 384 rows link to the City\'s PDF at that request\'s own page, opening in a new tab', !badL.length, badL.slice(0, 4).map(l => l.n + ':' + l.href).join(' ') || `384 of 384, e.g. ${links[81].href.slice(-60)}`);
    ok('4 PDF links', 'the link address is the City\'s own (calgary.ca) and the same file that was read', /^https:\/\/www\.calgary\.ca\//.test(DOC) && links.every(l => l.href.startsWith(DOC)), DOC);
    // detail links for a spread of cases
    const sample = [1, 14, 16, 32, 55, 82, 104, 124, 178, 219, 253, 300, 384]; let badD = [];
    for (const k of sample) { await p.goto(`${BASE}/?view=budget-intelligence&case=${k}`, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.bi-case', { timeout: 20000 });
      const hs = await p.evaluate(() => [...document.querySelectorAll('.bi-case a[href*="#page="]')].map(a => a.getAttribute('href'))); const want = `${DOC}#page=${C[k - 1].page}`;
      if (!hs.length || hs.some(h => h !== want)) badD.push(k + ':' + hs.join(',')); }
    ok('4 PDF links', `inside an opened request (${sample.length} tried, across both kinds), every "read it in the City\'s document" link goes to its page`, !badD.length, badD.join(' ') || sample.join(', '));

    // ---------------------------------------------------------------- 5. export
    await p.goto(BASE + '/?view=budget-intelligence&bi=cases', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.bi-list');
    const csvOf = async () => { const [d] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), p.click('#bi-export')]); const f = path.join(OUT, d.suggestedFilename()); await d.saveAs(f); return { name: d.suggestedFilename(), text: fs.readFileSync(f, 'utf8') }; };
    const parse = t => { const rows = []; let row = [], cell = '', q = false; t = t.replace(/^﻿/, '');
      for (let i = 0; i < t.length; i++) { const ch = t[i]; if (q) { if (ch === '"' && t[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; } else if (ch === '"') q = true; else if (ch === ',') { row.push(cell); cell = ''; } else if (ch === '\r') { /* skip */ } else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else cell += ch; }
      row.push(cell); rows.push(row); return rows; };
    const all = await csvOf(); const rows = parse(all.text), H = rows[0], col = name => H.indexOf(name);
    ok('5 export', '"Save this list" downloads a CSV file with one row per request and a heading row', rows.length === 385 && /\.csv$/.test(all.name), `${all.name}: ${rows.length - 1} rows, ${H.length} columns`);
    let diff = [];
    rows.slice(1).forEach((r, i) => { const c = C[i]; const num = v => v === null || v === undefined ? '' : String(v);
      const want = { 'No.': String(c.n), 'Title': c.title, 'Kind': c.type, 'Council priority': c.theme, 'Department': c.dept, 'Business unit': c.bu, 'Reason given': c.rationale,
        'Capital total ($000s)': c.cap_k ? num(c.cap_k[0]) : '', 'Capital 2027': c.cap_k ? num(c.cap_k[1]) : '', 'Capital 2030': c.cap_k ? num(c.cap_k[4]) : '', 'Capital 2031 and later': c.cap_k ? num(c.cap_k[5]) : '',
        'One-time 2027 ($M)': c.one_time_m ? num(c.one_time_m[0]) : '', 'One-time 2028': c.one_time_m ? num(c.one_time_m[1]) : '', 'Ongoing 2027 ($M)': c.ongoing_m ? num(c.ongoing_m[0]) : '', 'Ongoing 2030': c.ongoing_m ? num(c.ongoing_m[3]) : '',
        'FTEs 2027': c.ftes ? num(c.ftes[0]) : '', 'FTEs 2030': c.ftes ? num(c.ftes[3]) : '', 'Full one-time amount in the City note ($M)': c.full_one_time_m === undefined ? '' : num(c.full_one_time_m),
        'Ward(s)': c.type === 'capital' ? (c.wards === 'all' ? 'All wards' : c.wards.join('; ')) : '', 'Stage': c.stage || '', 'Funding source': c.funding || '', 'Service area': c.service_area || '', 'Budget ID': c.budget_id || '', 'Status': 'Proposed, not approved', 'Page in the City document': String(c.page) };
      for (const k of Object.keys(want)) { if (col(k) < 0) diff.push('missing column ' + k); else if (r[col(k)] !== want[k]) diff.push(`${c.n} ${k}: ${r[col(k)]} | ${want[k]}`); } });
    ok('5 export', 'every exported cell checked (25 columns x 384 rows) equals the data file, including dashes kept as blanks and the status "Proposed, not approved"', !diff.length, [...new Set(diff)].slice(0, 4).join('; ') || '9,600 cells');
    const capSum = sum(rows.slice(1).map(r => +r[col('Capital total ($000s)')] || 0));
    ok('5 export', 'the exported capital totals add to the same $13,051,480 thousand as the screen', capSum === 13051480, capSum);
    await p.selectOption('[data-f="type"]', 'capital'); await p.selectOption('[data-f="ward"]', '7'); await p.waitForTimeout(300);
    const part = await csvOf(); const pr = parse(part.text);
    ok('5 export', 'with filters on, the export holds only the filtered requests', pr.length - 1 === C.filter(c => c.type === 'capital' && Array.isArray(c.wards) && c.wards.includes(7)).length, `${pr.length - 1} rows`);
    ok('5 export', 'a title with commas and quotation marks survives the export', rows[14][col('Title')] === C[13].title, rows[14][col('Title')].slice(0, 60));
    ok('3-5 explorer', 'no script errors during filtering, paging, links and exports', !errs.length, JSON.stringify(errs).slice(0, 200));
    await ctx.close();
  }

  // ------------------------------------------------------------------ 6. theme switching
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' }); const p = await ctx.newPage(); const errs = []; watch(p, errs);
    await p.goto(BASE + '/?view=budget-intelligence', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#bi-main > *'); await p.waitForTimeout(2000);
    const look = () => p.evaluate(() => { const cs = e => getComputedStyle(e); const card = document.querySelector('#bi-main .card'), rail = document.querySelector('#bi-rail'), k = document.querySelector('.bi-kpi, .kpi');
      const cv = document.querySelector('#bi-main canvas'); let px = null; if (cv && cv.width) { try { const d = cv.getContext('2d').getImageData(Math.floor(cv.width / 2), 4, 1, 1).data; px = [...d].join(','); } catch (e) { px = 'n/a'; } }
      return { theme: document.documentElement.getAttribute('data-theme'), body: cs(document.body).backgroundColor, card: card && cs(card).backgroundColor, text: card && cs(card).color, rail: rail && cs(rail).backgroundColor, canvases: document.querySelectorAll('#bi-main canvas').length, map: !!document.querySelector('#bi-main .leaflet-container'), mapBg: (document.querySelector('#bi-main .leaflet-container') ? cs(document.querySelector('#bi-main .leaflet-container')).backgroundColor : null) }; });
    const a = await look();
    await p.click('#theme-btn'); await p.waitForTimeout(900); const b2 = await look();
    await p.click('#theme-btn'); await p.waitForTimeout(900); const c3 = await look();
    ok('6 theme', 'the site\'s own theme button switches the screen between light and dark and back', a.theme !== b2.theme && a.theme === c3.theme, `${a.theme} -> ${b2.theme} -> ${c3.theme}`);
    ok('6 theme', 'the screen\'s surfaces change with the theme (page, card, text, map)', a.card !== b2.card && a.text !== b2.text && a.body !== b2.body && a.mapBg !== b2.mapBg && a.card === c3.card, `card ${a.card} -> ${b2.card}; text ${a.text} -> ${b2.text}; map ${a.mapBg} -> ${b2.mapBg}`);
    ok('6 theme', 'charts and the map are still drawn after switching', b2.canvases === a.canvases && a.canvases > 0 && b2.map === a.map, `${a.canvases} charts, map ${a.map}`);
    // every section in the other theme without reloading
    let bad = [];
    for (const s of SECTIONS) { await p.click(`#bi-rail [data-sec="${s}"]`); await p.waitForTimeout(s === 'performance' || s === 'links' ? 1300 : 350); await p.click('#theme-btn'); await p.waitForTimeout(350);
      const st = await p.evaluate(() => ({ len: document.getElementById('bi-main').innerText.length, failed: /could not be drawn/i.test(document.getElementById('bi-main').innerText) })); if (st.len < 300 || st.failed) bad.push(s); }
    ok('6 theme', 'switching the theme while on each of the eleven sections keeps the section drawn', !bad.length, bad.join(' ') || 'all eleven');
    ok('6 theme', 'no script errors while switching', !errs.length, JSON.stringify(errs).slice(0, 200));
    await ctx.close();
  }

  // ------------------------------------------------------------------ 7. keyboard
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errs = []; watch(p, errs);
    await p.goto(BASE + '/?view=budget-intelligence', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#bi-main > *'); await p.waitForTimeout(1500);
    const act = () => p.evaluate(() => { const a = document.activeElement; return { tag: a.tagName, sec: a.dataset && a.dataset.sec, id: a.id, inRail: !!a.closest('#bi-rail'), outline: getComputedStyle(a).outlineStyle + ' ' + getComputedStyle(a).outlineWidth, shadow: getComputedStyle(a).boxShadow }; });
    const tabstops = await p.evaluate(() => [...document.querySelectorAll('#bi-rail [role="radio"]')].filter(b => b.tabIndex === 0).length);
    ok('7 keyboard', 'the section list is one Tab stop (the chosen section), as a radio group should be', tabstops === 1, tabstops + ' tab stops');
    await p.focus('#bi-rail [aria-checked="true"]');
    const seq = [];
    for (const key of ['ArrowDown', 'ArrowDown', 'ArrowRight', 'ArrowUp', 'End', 'Home', 'ArrowUp', 'ArrowDown']) { await p.keyboard.press(key); await p.waitForTimeout(350); const a = await act(); const cur = await p.evaluate(() => document.querySelector('#bi-rail [aria-checked="true"]').dataset.sec); seq.push(`${key}:${cur}${a.inRail && a.sec === cur ? '' : '(focus lost)'}`); }
    ok('7 keyboard', 'arrow keys, Home and End move between sections, wrap at the ends, and keep the focus on the chosen section', seq.join(' ') === 'ArrowDown:operating ArrowDown:capital ArrowRight:revenue ArrowUp:capital End:checks Home:overview ArrowUp:checks ArrowDown:overview', seq.join(' '));
    const fo = await act();
    ok('7 keyboard', 'the focused section button shows a visible focus mark', !/^none/.test(fo.outline) && !/ 0px$/.test(fo.outline) || (fo.shadow && fo.shadow !== 'none'), fo.outline + ' | ' + fo.shadow);
    // reach the explorer with the keyboard only and open a request with Enter
    await p.focus('#bi-rail [aria-checked="true"]'); for (let i = 0; i < 5; i++) { await p.keyboard.press('ArrowDown'); await p.waitForTimeout(250); }
    ok('7 keyboard', 'five presses of the down arrow from the overview reach "Business cases"', await p.evaluate(() => document.querySelector('#bi-rail [aria-checked="true"]').dataset.sec) === 'cases');
    const order = [];
    for (let i = 0; i < 12; i++) { await p.keyboard.press('Tab'); const a = await p.evaluate(() => { const e = document.activeElement; return e.id || (e.dataset && (e.dataset.f || (e.dataset.case ? 'case' + e.dataset.case : ''))) || e.tagName.toLowerCase() + (e.getAttribute('href') ? ':link' : ''); }); order.push(a); }
    ok('7 keyboard', 'Tab from the section list goes through the export button, the search box and the filters, then the list, in reading order', order.slice(0, 6).join(' ') === 'bi-export bi-q type theme dept ward' && order.includes('case1'), order.join(' '));
    await p.focus('[data-case="1"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
    const opened = await p.evaluate(() => ({ open: !!document.querySelector('#bi-c1 .bi-case'), exp: document.querySelector('[data-case="1"]').getAttribute('aria-expanded'), focusOn: document.activeElement.dataset && document.activeElement.dataset.case }));
    ok('7 keyboard', 'Enter on a request opens it, says so to assistive technology (aria-expanded) and keeps the focus on it', opened.open && opened.exp === 'true' && opened.focusOn === '1', JSON.stringify(opened));
    await p.keyboard.press('Enter'); await p.waitForTimeout(300);
    ok('7 keyboard', 'Enter again closes it', await p.evaluate(() => !document.querySelector('#bi-c1 .bi-case')));
    await p.focus('.bi-pager [data-page="1"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(350);
    const pgf = await p.evaluate(() => ({ inPager: !!(document.activeElement.closest && document.activeElement.closest('.bi-pager')), dir: document.activeElement.dataset && document.activeElement.dataset.page, first: +document.querySelector('.bi-item .c-n').innerText }));
    ok('7 keyboard', '"Next" with Enter moves to the next 25 requests and the focus stays on "Next"', pgf.inPager && pgf.dir === '1' && pgf.first === 26, JSON.stringify(pgf));
    await p.goto(BASE + '/?view=budget-intelligence&bi=operating', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#bi-main .bi-seg [data-v]', { timeout: 20000 });
    const segs = await p.evaluate(() => [...document.querySelectorAll('#bi-main .bi-seg [data-v]')].map(b => b.parentElement.id + '|' + b.dataset.v + '|' + b.getAttribute('aria-pressed')));
    const target = segs.find(x => x.endsWith('|false')); if (target) { const [id, v] = target.split('|'); await p.focus(`#${id} [data-v="${v}"]`); await p.keyboard.press('Enter'); await p.waitForTimeout(500);
      const sf = await p.evaluate(() => ({ id: document.activeElement.parentElement && document.activeElement.parentElement.id, v: document.activeElement.dataset && document.activeElement.dataset.v, pressed: document.activeElement.getAttribute && document.activeElement.getAttribute('aria-pressed') }));
      ok('7 keyboard', 'choosing a year with Enter redraws the section and the focus stays on the chosen year', sf.id === id && sf.v === v && sf.pressed === 'true', JSON.stringify(sf)); }
    await p.goto(BASE + '/?view=budget-intelligence', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#bi-main [data-sec]', { timeout: 20000 }); await p.waitForTimeout(800);
    const link = await p.evaluate(() => { const b = document.querySelector('#bi-main [data-sec]'); return b ? b.dataset.sec : null; });
    await p.focus('#bi-main [data-sec]'); await p.keyboard.press('Enter'); await p.waitForTimeout(600);
    const lf = await p.evaluate(() => ({ sec: document.querySelector('#bi-rail [aria-checked="true"]').dataset.sec, focus: document.activeElement.id }));
    ok('7 keyboard', 'a link inside a section that leads to another section moves the focus to the new section\'s content', lf.sec === link && lf.focus === 'bi-main', JSON.stringify(lf));
    await p.goto(BASE + '/?view=budget-intelligence&bi=cases', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.bi-list');
    await p.focus('#bi-q'); await p.keyboard.type('police'); await p.waitForTimeout(500);
    ok('7 keyboard', 'typing in the search box keeps the focus in the box while the list updates', await p.evaluate(() => document.activeElement.id === 'bi-q' && document.activeElement.value === 'police'));
    await p.focus('[data-f="type"]'); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(300);
    ok('7 keyboard', 'a filter can be changed from the keyboard and keeps the focus', await p.evaluate(() => document.activeElement.dataset.f === 'type' && document.activeElement.value !== ''), await p.evaluate(() => document.activeElement.value));
    // map layer radios and the simulator from the keyboard
    await p.goto(BASE + '/?view=budget-intelligence', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#bi-layers input', { timeout: 20000 }); await p.focus('#bi-layers input:checked'); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(500);
    ok('7 keyboard', 'the map\'s "what the map shows" choices change with the arrow keys', await p.evaluate(() => document.querySelector('#bi-layers input:checked').value !== 'tax'), await p.evaluate(() => document.querySelector('#bi-layers input:checked').value));
    await p.goto(BASE + '/?view=budget-intelligence&bi=simulator', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#bi-main input', { timeout: 20000 });
    const simIn = await p.evaluate(() => [...document.querySelectorAll('#bi-main input, #bi-main select')].map(e => ({ type: e.type, labelled: !!(e.labels && e.labels.length) || !!e.getAttribute('aria-label') || !!e.getAttribute('aria-labelledby') })));
    ok('7 keyboard', 'the simulator\'s inputs are ordinary labelled form controls (reachable and adjustable from the keyboard)', simIn.length > 0 && simIn.every(i => i.labelled), JSON.stringify(simIn));
    const before = await p.evaluate(() => document.getElementById('bi-main').innerText); const rng = p.locator('#bi-main input[type="range"]').first();
    if (await rng.count()) { await rng.focus(); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300); ok('7 keyboard', 'moving the simulator\'s slider with the arrow keys changes the result', before !== await p.evaluate(() => document.getElementById('bi-main').innerText)); }
    await p.goto(BASE + '/?view=budget-intelligence&bi=checks', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.bi-check');
    await p.focus('.bi-check summary'); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
    ok('7 keyboard', 'a data check opens with Enter (native details element)', await p.evaluate(() => document.querySelector('.bi-check').open));
    ok('7 keyboard', 'no script errors', !errs.length, JSON.stringify(errs).slice(0, 200));
    await ctx.close();
  }

  // ------------------------------------------------------------------ 8. accessibility: a hand-written audit of the screen's markup and colours
  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme }); const p = await ctx.newPage(); const errs = []; watch(p, errs);
    const tot = { names: [], labels: [], tables: [], headings: [], imgs: [], contrast: [], ids: [], lists: [], lang: [] }; let checkedText = 0, skippedText = 0; const perSec = [];
    for (const s of SECTIONS) {
      await p.goto(`${BASE}/?view=budget-intelligence&bi=${s}${s === 'cases' ? '&case=82' : ''}`, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#bi-main > *', { timeout: 20000 });
      await p.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme); await p.waitForTimeout(s === 'performance' || s === 'links' || s === 'overview' ? 1800 : 600);
      if (s === 'checks') await p.evaluate(() => document.querySelectorAll('.bi-check').forEach(d => { d.open = true; }));
      const r = await p.evaluate(s => {
        const root = document.getElementById('view-budget-intelligence'), out = { names: [], labels: [], tables: [], headings: [], imgs: [], contrast: [], ids: [], lists: [], n: 0 };
        const vis = e => { const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 0 && r.height > 0 && c.visibility !== 'hidden' && c.display !== 'none'; };
        const name = e => (e.getAttribute('aria-label') || '').trim() || (e.getAttribute('aria-labelledby') ? (document.getElementById(e.getAttribute('aria-labelledby')) || {}).innerText || '' : '') || (e.innerText || '').trim() || (e.getAttribute('title') || '').trim();
        root.querySelectorAll('button, a[href], summary, [role="radio"], [role="button"]').forEach(e => { if (vis(e) && !name(e)) out.names.push(e.outerHTML.slice(0, 90)); });
        root.querySelectorAll('input, select, textarea').forEach(e => { if (vis(e) && !((e.labels && e.labels.length) || e.getAttribute('aria-label') || e.getAttribute('aria-labelledby'))) out.labels.push(e.outerHTML.slice(0, 90)); });
        root.querySelectorAll('table').forEach(t => { if (!vis(t)) return; const ths = t.querySelectorAll('th'); if (!ths.length) out.tables.push('no header cells: ' + t.innerText.slice(0, 40)); else if (t.classList.contains('data') && [...t.querySelectorAll('thead th')].some(h => !h.getAttribute('scope'))) out.tables.push('header without scope: ' + t.innerText.slice(0, 40)); });
        let last = 1; root.querySelectorAll('h1, h2, h3, h4').forEach(h => { if (!vis(h)) return; const l = +h.tagName[1]; if (l - last > 1) out.headings.push(`${h.tagName} after h${last}: ${h.innerText.slice(0, 40)}`); last = l; });
        root.querySelectorAll('svg, img, canvas').forEach(e => { if (!vis(e)) return; const hid = e.getAttribute('aria-hidden') === 'true' || e.closest('[aria-hidden="true"]'); const nm = e.getAttribute('aria-label') || e.getAttribute('alt') || (e.getAttribute('role') === 'img' && e.getAttribute('aria-labelledby')); if (!hid && !nm && !e.closest('.leaflet-container')) out.imgs.push(e.tagName + ' ' + (e.id || e.className.baseVal || e.className || '').toString().slice(0, 40)); });
        const seen = {}; root.querySelectorAll('[id]').forEach(e => { if (seen[e.id]) out.ids.push(e.id); seen[e.id] = 1; });
        root.querySelectorAll('[role="list"]').forEach(l => { if ([...l.children].some(c => c.getAttribute('role') !== 'listitem' && c.getAttribute('aria-hidden') !== 'true')) out.lists.push('list with a child that is not an item'); });
        // colour contrast of every visible piece of text against the colour behind it
        const rgb = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(x => parseFloat(x)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
        const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
        const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
        // the colours that can be behind a piece of text: solid backgrounds are layered; a gradient gives one candidate per colour stop (the worst is used); a picture cannot be measured
        const bgOf = e => { const stack = []; for (let x = e; x; x = x.parentElement) { const cs = getComputedStyle(x);
            if (cs.backgroundImage && cs.backgroundImage !== 'none') { if (/url\(/.test(cs.backgroundImage)) return null; const stops = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).map(rgb).filter(Boolean); if (stops.length) stack.push({ stops }); }
            const c = rgb(cs.backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a === 1) break; } }
          let bases = [{ r: 255, g: 255, b: 255, a: 1 }];
          for (let i = stack.length - 1; i >= 0; i--) { const it = stack[i]; bases = it.stops ? bases.flatMap(b => it.stops.map(st => over(st, b))).slice(0, 24) : bases.map(b => over(it, b)); }
          return bases; };
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const done = new Set();
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const t = n.nodeValue.trim(), e = n.parentElement; if (!t || !e || done.has(e) || !vis(e) || e.closest('.leaflet-container, canvas, [aria-hidden="true"], option') || e.tagName === 'OPTION') continue; done.add(e);
          const cs = getComputedStyle(e); if (+cs.opacity < 1 || e.closest('[disabled]')) continue;
          const bgs = bgOf(e); if (!bgs) { out.skipped = (out.skipped || 0) + 1; continue; } const fg0 = rgb(cs.color); if (!fg0) continue;
          let ratio = 99, bg = bgs[0];
          for (const b of bgs) { const fg = over(fg0, b), L1 = lum(fg), L2 = lum(b), r = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); if (r < ratio) { ratio = r; bg = b; } }
          const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700, large = size >= 24 || (bold && size >= 18.66);
          out.n++; if (ratio < (large ? 3 : 4.5)) out.contrast.push(`${ratio.toFixed(2)} ${Math.round(size)}px "${t.slice(0, 28)}" .${(e.className || '').toString().slice(0, 24)} ${cs.color} on rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`);
        }
        return out;
      }, s);
      for (const k of Object.keys(tot)) if (r[k]) tot[k].push(...r[k].map(x => `${s}: ${x}`)); checkedText += r.n; skippedText += r.skipped || 0; perSec.push(`${s}:${r.n}`);
    }
    const uniq = a => [...new Set(a.map(x => x.replace(/^[a-z]+: /, '')))];
    const kind = 'desktop Chromium (headless), ' + theme + ' theme';
    ok('8 accessibility', `${theme}: every button, link and control has a name a screen reader can read`, !tot.names.length, uniq(tot.names).slice(0, 3).join(' | ') || 'all', kind);
    ok('8 accessibility', `${theme}: every form control has a label`, !tot.labels.length, uniq(tot.labels).slice(0, 3).join(' | ') || 'all', kind);
    ok('8 accessibility', `${theme}: every table has header cells (data tables with scope)`, !tot.tables.length, uniq(tot.tables).slice(0, 3).join(' | ') || 'all', kind);
    ok('8 accessibility', `${theme}: headings do not skip a level`, !tot.headings.length, uniq(tot.headings).slice(0, 3).join(' | ') || 'all', kind);
    ok('8 accessibility', `${theme}: charts and pictures are named or marked as decoration`, !tot.imgs.length, uniq(tot.imgs).slice(0, 4).join(' | ') || 'all', kind);
    ok('8 accessibility', `${theme}: no repeated ids; lists are built from list items`, !tot.ids.length && !tot.lists.length, uniq([...tot.ids, ...tot.lists]).slice(0, 4).join(' | ') || 'none', kind);
    ok('8 accessibility', `${theme}: text contrast is at least 4.5 to 1 (3 to 1 for large text) on every section (${checkedText} pieces of text measured; ${skippedText} over a picture could not be measured)`, !tot.contrast.length, `${uniq(tot.contrast).length} kinds below: ` + uniq(tot.contrast).slice(0, 6).join(' | ') + ' || measured per section: ' + perSec.join(' '), kind);
    ok('8 accessibility', `${theme}: no script errors`, !errs.length, JSON.stringify(errs).slice(0, 200), kind);
    fs.writeFileSync(path.join(OUT, `a11y-${theme}.json`), JSON.stringify(tot, null, 1));
    await ctx.close();
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const p = await ctx.newPage();
    await p.goto(BASE + '/?view=budget-intelligence', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#bi-main > *'); await p.waitForTimeout(1500);
    const st = await p.evaluate(() => ({ lang: document.documentElement.lang, title: document.title, h1: document.querySelectorAll('#view-budget-intelligence h1').length, labelled: document.getElementById('view-budget-intelligence').getAttribute('aria-labelledby'), live: !!document.querySelector('#bi-error'), rg: document.getElementById('bi-rail').getAttribute('aria-label'), checked: document.querySelectorAll('#bi-rail [aria-checked="true"]').length,
      zoom: (() => { const m = document.querySelector('meta[name="viewport"]'); return m ? m.content : ''; })() }));
    ok('8 accessibility', 'the page states its language, the screen has one main heading that names it, and the section list is a named radio group with one choice marked', st.lang === 'en' && st.h1 === 1 && st.labelled === 'bi-title' && !!st.rg && st.checked === 1, JSON.stringify(st));
    ok('8 accessibility', 'pinch zoom is not switched off', !/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/.test(st.zoom), st.zoom);
    await p.setViewportSize({ width: 640, height: 900 }); await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await p.waitForTimeout(500);
    const z = await p.evaluate(() => ({ page: document.scrollingElement.scrollWidth - innerWidth, view: document.getElementById('view-budget-intelligence').scrollWidth - document.getElementById('view-budget-intelligence').clientWidth }));
    ok('8 accessibility', 'with text at 200% on a 640 px wide window the page still does not scroll sideways', z.page <= 1 && z.view <= 1, JSON.stringify(z));
    await ctx.close();
  }

  await browser.close();
  const fail = R.filter(r => r.result === 'FAIL');
  fs.writeFileSync(path.join(OUT, 'ux-results.json'), JSON.stringify({ when: new Date().toISOString(), engine: 'Playwright Chromium, headless', note: 'Phone and tablet results are emulated devices, not real devices. No screen reader was run.', passed: R.length - fail.length, failed: fail.length, results: R }, null, 1));
  console.log(`\npassed ${R.length - fail.length} failed ${fail.length}`);
})().catch(e => { console.error('AUDIT STOPPED', e); process.exit(2); });
