// interaction tests for the Budget Intelligence screen
const { chromium, devices } = require('playwright');
const R = []; const ok = (name, cond, detail) => { R.push({ name, pass: !!cond, detail: String(detail === undefined ? '' : detail).slice(0, 160) }); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  [' + String(detail).slice(0, 140) + ']' : '')); };
(async () => {
  const base = 'http://localhost:8802';
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); const p = await ctx.newPage();
  const errs = [], known = []; p.on('pageerror', e => { const t = String(e.stack || e.message || e); (/at score \(/.test(t) && /startsWith/.test(t) ? known : errs).push(t.slice(0, 200)); });
  const sum = async () => (await p.locator('.bi-sum').innerText()).replace(/\s+/g, ' ');
  await p.goto(base + '/?view=budget-intelligence&bi=cases', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.bi-list');
  ok('explorer lists all cases', /^384 requests/.test(await sum()), await sum());
  await p.selectOption('[data-f="type"]', 'capital'); ok('filter kind = capital', /^260 requests/.test(await sum()), await sum());
  await p.selectOption('[data-f="ward"]', '7'); ok('filter ward 7 (capital)', /^16 requests/.test(await sum()), await sum());
  await p.selectOption('[data-f="ward"]', 'all'); ok('filter all-wards requests', /^226 requests/.test(await sum()), await sum());
  await p.selectOption('[data-f="ward"]', ''); await p.selectOption('[data-f="type"]', 'operating'); ok('filter kind = operating', /^124 requests/.test(await sum()) && /855 positions/.test(await sum()), await sum());
  await p.selectOption('[data-f="type"]', ''); await p.selectOption('[data-f="theme"]', 'Safe city'); ok('filter Council priority = Safe city', /^63 requests/.test(await sum()), await sum());
  await p.selectOption('[data-f="theme"]', ''); await p.selectOption('[data-f="dept"]', 'Infrastructure Services'); ok('filter department = Infrastructure Services', /^76 requests/.test(await sum()), await sum());
  await p.selectOption('[data-f="dept"]', '');
  await p.fill('#bi-q', 'pavement'); await p.waitForTimeout(500); ok('search "pavement" finds case 55', (await p.locator('.bi-list').innerText()).includes('Pavement Rehabilitation Program'), await sum());
  await p.fill('#bi-q', 'P258_000'); await p.waitForTimeout(500); ok('search by Budget ID', /^1 request /.test(await sum()) && (await p.locator('.bi-list').innerText()).includes('Waste & Recycling Services - Facilities'), await sum());
  await p.fill('#bi-q', 'zzzz-nothing'); await p.waitForTimeout(500); ok('no match shows an empty state', await p.locator('#bi-case-list .bi-empty').count() === 1);
  await p.fill('#bi-q', ''); await p.waitForTimeout(500);
  await p.click('details.bi-acc > summary >> text=More filters'); 
  await p.selectOption('[data-f="sort"]', 'amount'); const first = await p.locator('.bi-item .c-t button').first().innerText(); ok('sort: largest amount first', first.startsWith('Wastewater Treatment Plants Program'), first);
  await p.selectOption('[data-f="sort"]', 'fte'); const f2 = await p.locator('.bi-item .c-w').first().innerText(); ok('sort: most positions first', /positions/.test(f2), f2);
  await p.selectOption('[data-f="sort"]', 'n');
  await p.selectOption('[data-f="flag"]', 'required'); ok('filter: marked Required', /^66 requests/.test(await sum()), await sum());
  await p.selectOption('[data-f="flag"]', 'notes'); ok('filter: with a City note', /^20 requests/.test(await sum()), await sum());
  await p.selectOption('[data-f="flag"]', ''); await p.selectOption('[data-f="stage"]', 'Stage 4: Execute'); ok('filter: stage 4', /^96 requests/.test(await sum()), await sum());
  await p.selectOption('[data-f="stage"]', ''); await p.selectOption('[data-f="risk"]', 'Extensive'); ok('filter: risk rating Extensive', /^37 requests/.test(await sum()), await sum());
  await p.selectOption('[data-f="risk"]', ''); await p.selectOption('[data-f="fund"]', 'Grants'); ok('filter: funding source Grants', /^71 requests/.test(await sum()), await sum());
  await p.selectOption('[data-f="fund"]', ''); await p.selectOption('[data-f="rationale"]', 'Explicit Direction from Council'); ok('filter: reason given (grouped)', /^52 requests/.test(await sum()), await sum());
  await p.selectOption('[data-f="rationale"]', '');
  await p.click('[data-page="1"]'); ok('paging: next page starts at 26', (await p.locator('.bi-item .c-n').first().innerText()).trim() === '26');
  await p.click('[data-page="-1"]');
  await p.click('.bi-item .c-t button >> nth=1'); ok('open a case shows its detail', await p.locator('.bi-case').count() === 1 && (await p.locator('.bi-case').innerText()).includes('page 12 of its document'), (await p.locator('.bi-case h3').first().innerText()));
  const href = await p.locator('.bi-case a.bi-read').getAttribute('href'); ok('case links to its page in the City PDF', /2027-2030-operating-capital-budget-requests\.pdf#page=12$/.test(href), href);
  await p.click('.bi-item.open .c-t button'); ok('close the case', await p.locator('.bi-case').count() === 0);
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), p.click('#bi-export')]);
  const path = await dl.path(); const csv = require('fs').readFileSync(path, 'utf8'); const lines = csv.trim().split(/\r\n/);
  ok('export: a CSV of the list with a header and 384 rows', lines.length === 385 && lines[0].includes('Page in the City document'), dl.suggestedFilename() + ' ' + lines.length + ' lines');
  ok('export: case 55 row carries 420196', lines.some(l => /^55,/.test(l) && l.includes('420196')), (lines.find(l => /^55,/.test(l)) || '').slice(0, 110));
  // map layers
  await p.goto(base + '/?view=budget-intelligence', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#bi-map .leaflet-interactive');
  ok('map draws 14 wards', await p.locator('#bi-map path.leaflet-interactive').count() === 14, await p.locator('#bi-map path.leaflet-interactive').count());
  for (const [v, t] of [['people', 'Residents'], ['infra', 'Infrastructure reports to 311'], ['cases', 'Capital requests naming the ward'], ['tax', 'Property tax levied, 2026']]) {
    await p.check(`input[name="bi-layer"][value="${v}"]`); await p.waitForTimeout(500);
    ok('map layer: ' + t, (await p.locator('#bi-map-title').innerText()).startsWith(t) && await p.locator('#bi-map path.leaflet-interactive').count() === 14, (await p.locator('#bi-legend').innerText()).replace(/\s+/g, ' '));
  }
  await p.click('#bi-map-table summary'); ok('map has a table alternative with 14 rows', await p.locator('#bi-map-table tbody tr').count() === 14);
  await p.click('.bi-bar button.b-l >> nth=0'); await p.waitForTimeout(700); ok('a ranked bar opens its case in the explorer', (await p.locator('.bi-case h3').first().innerText()).startsWith('31. Wastewater Treatment Plants Program'), new URL(p.url()).search);
  // addresses
  ok('address carries the section', new URL(p.url()).searchParams.get('bi') === 'cases', p.url());
  await p.evaluate(() => window.show('budget')); await p.waitForTimeout(600);
  ok('leaving removes the centre\'s address parameters; City budget opens', !new URL(p.url()).searchParams.has('bi') && new URL(p.url()).searchParams.get('view') === 'budget' && await p.locator('#view-budget.is-on').count() === 1, p.url());
  ok('City budget screen still renders its figures', (await p.locator('#bud-stats').innerText()).includes('$4.62 billion'), (await p.locator('#bud-stats').innerText()).replace(/\s+/g, ' ').slice(0, 80));
  await p.evaluate(() => window.show('budget-intelligence')); await p.waitForTimeout(800); ok('coming back shows the centre again', await p.locator('#view-budget-intelligence.is-on').count() === 1);
  // simulator arithmetic
  await p.click('#bi-rail [data-sec="simulator"]'); await p.fill('#bi-sim-v', '500000'); await p.locator('#bi-sim-p').fill('10'); await p.waitForTimeout(300);
  const so = (await p.locator('#bi-sim-out').innerText()).replace(/\s+/g, ' '); ok('simulator: $500,000 at 10% gives $1,945 then $2,140', so.includes('$1,945') && so.includes('$2,140') && so.includes('+$195'), so.slice(0, 150));
  // site search finds the screen
  await p.click('#ss-q'); await p.fill('#ss-q', 'budg'); await p.waitForTimeout(1500);      // the index loads on first use
  await p.fill('#ss-q', 'budget intelligence'); await p.waitForTimeout(1200); ok('site search lists the new screen', (await p.locator('#ss-results').innerText()).includes('Budget Intelligence'));
  await p.fill('#ss-q', 'tax simulator'); await p.waitForTimeout(1200); await p.locator('#ss-results [role="option"]').first().click(); await p.waitForTimeout(3000);
  ok('site search result "Tax simulator" opens the centre on that section', await p.locator('#view-budget-intelligence.is-on').count() === 1 && (await p.locator('#bi-rail [aria-checked="true"]').innerText()).includes('Tax simulator'));
  // phone: no sideways scroll in any section
  const m = await (await b.newContext({ ...devices['iPhone 13'] })).newPage(); let wide = [];
  for (const s of ['overview', 'operating', 'capital', 'revenue', 'actual', 'cases', 'projects', 'performance', 'simulator', 'links', 'checks']) {
    await m.goto(base + '/?view=budget-intelligence&bi=' + s, { waitUntil: 'domcontentloaded' }); await m.waitForTimeout(3000);
    const o = await m.evaluate(() => { const v = document.querySelector('#view-budget-intelligence'); return [document.documentElement.scrollWidth, document.documentElement.clientWidth, v.scrollWidth, v.clientWidth]; });
    if (o[0] > o[1] + 1 || o[2] > o[3] + 1) wide.push(s + ' ' + o.join('/'));
  }
  ok('phone: no section scrolls sideways', wide.length === 0, wide.join('; '));
  ok('no script errors from the new screen during all of the above', errs.length === 0, errs.join(' | '));
  console.log('NOTE  pre-existing site-search error (also on the production build) seen', known.length, 'time(s)');
  require('fs').writeFileSync('interact-results.json', JSON.stringify({ known_preexisting_search_error_seen: known.length, passed: R.filter(r => r.pass).length, failed: R.filter(r => !r.pass).length, tests: R }, null, 1));
  console.log('passed', R.filter(r => r.pass).length, 'failed', R.filter(r => !r.pass).length);
  await b.close();
})().catch(e => { console.log('CRASH', e.message.slice(0, 400)); process.exit(1); });
