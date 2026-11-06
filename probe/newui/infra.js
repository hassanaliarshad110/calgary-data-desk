/* Calgary Insight: Infrastructure condition. Where roads and pipes are wearing out (water main breaks, the age and
   material of the water network, the City's paving plan, its own condition figures) and whether 311 requests about them
   are rising in the same places. infra.py builds the figures; methods.py (topic "infra") explains them. */
'use strict';

let INF = null, infArea = null, infSort = 'signals';
async function loadInfra() {
  if (INF) return INF;
  try { const r = await (await api()).get_infra(); if (r && r.ok && r.data) INF = r.data; } catch (e) { /* shown below */ }
  return INF;
}
const infPct = (a, b) => (isNum(a) && isNum(b) && b > 0 ? (a / b - 1) * 100 : null);
const infChg = v => (isNum(v) ? `${v > 0 ? '+' : ''}${fmt(v, 0)}%` : '–');
function infName(c) { const n = ((INF && INF.names) || {})[c] || c; return n; }

// the communities of the area chosen: all of Calgary, a ward, or one community
function infCodes(city) {
  const comms = ((city && city.communities) || []).filter(c => c.code);
  const a = infArea === null ? (SCOPE ? `w${SCOPE}` : 'all') : infArea;
  if (a.startsWith('w')) return comms.filter(c => c.ward === +a.slice(1));
  if (a.startsWith('c:')) return comms.filter(c => c.code === a.slice(2));
  return comms;
}

// one row per community: condition, 311 and the plan, with the signals that flag it
function infRow(c, today) {
  const b = (INF.by_comm || {})[c.code] || {}, br = b.breaks || {}, mn = b.mains || {}, pv = b.paving || {}, rq = b.req || {};
  const r = k => rq[k] || [0, 0];
  const row = { code: c.code, name: c.name || infName(c.code), residents: c.residents || 0, ward: c.ward,
    br12: br.n12 || 0, brPrev: br.nprev || 0, km: mn.km || 0, medYear: mn.median_year, oldKm: mn.old_km || 0, ciKm: mn.cast_iron_km || 0,
    roads: r('roads'), side: r('sidewalks'), lights: r('lights'), water: r('water'), sewer: r('sewer'),
    paveNext: (pv.next_year || 0) + (pv.this_year || 0), pave5: pv.five_year || 0, paveRecent: pv.recent || 0 };
  row.brRate = row.km ? row.br12 / row.km * 100 : null;
  row.oldShare = row.km ? row.oldKm / row.km : null;
  row.ciShare = row.km ? row.ciKm / row.km : null;
  const up = (x, min, by) => x[0] >= min && x[1] > 0 && x[0] / x[1] - 1 >= by;
  row.flags = [];
  // water: the network wearing out, and water requests rising in the same community
  const wBreaks = row.br12 >= 3 && row.br12 > row.brPrev, wOld = row.km >= 5 && ((row.medYear && today - row.medYear >= 50) || (row.oldShare || 0) >= 0.4);
  const wCast = row.km >= 5 && (row.ciShare || 0) >= 0.25, wReq = up(row.water, 5, 0.15);
  if (wBreaks) row.flags.push(['cond', 'Water main breaks rising']);
  if (wOld) row.flags.push(['cond', 'Ageing water mains']);
  if (wCast) row.flags.push(['cond', 'Much cast iron']);
  if (wReq) row.flags.push(['req', 'Water requests up']);
  // roads: road and pothole requests rising sharply where no paving is planned
  const rReq = up(row.roads, 30, 0.25), noPave = !(row.paveNext + row.pave5);
  if (rReq) row.flags.push(['req', 'Road and pothole requests up']);
  if (rReq && noPave) row.flags.push(['cond', 'No paving planned']);
  if (up(row.side, 10, 0.25)) row.flags.push(['req', 'Sidewalk requests up']);
  if (up(row.lights, 10, 0.25)) row.flags.push(['req', 'Streetlight requests up']);
  row.water = row.water; row.bothWater = (wBreaks || wOld || wCast) && wReq; row.bothRoads = rReq && noPave;
  row.both = row.bothWater || row.bothRoads;
  return row;
}

async function renderInfra() {
  const body = $('#inf-body'); if (!body) return;
  if (!INF) body.innerHTML = '<section class="card span-12"><p class="muted">Reading the infrastructure figures…</p></section>';
  await loadInfra();
  if (!INF) { body.innerHTML = '<section class="card span-12"><p>The infrastructure figures are not on the website yet. They appear after the next refresh.</p></section>'; return; }
  let city = null;
  try { city = SCOPE === 0 && D ? D : await peekView(0); } catch (e) { city = D; }
  const today = +String(INF.today || '').slice(0, 4) || new Date().getFullYear();
  const comms = infCodes(city).filter(c => c.residential !== false);
  const rows = comms.map(c => infRow(c, today));
  const sum = k => rows.reduce((a, r) => a + (typeof k === 'function' ? k(r) : r[k] || 0), 0);
  const ctx = INF.context || {}, pq = ctx.pavement || {};
  const wards = [...new Set(((city && city.communities) || []).map(c => c.ward).filter(Boolean))].sort((a, b) => a - b);
  const a = infArea === null ? (SCOPE ? `w${SCOPE}` : 'all') : infArea;
  const placeName = a === 'all' ? 'Calgary' : a.startsWith('w') ? `Ward ${a.slice(1)}` : infName(a.slice(2));
  const areaSel = `<div class="card-tools sr-tools"><label class="sr-only" for="inf-area">Area</label><select id="inf-area" class="select">
      <option value="all" ${a === 'all' ? 'selected' : ''}>All of Calgary</option>${wards.map(w => `<option value="w${w}" ${a === `w${w}` ? 'selected' : ''}>Ward ${w}</option>`).join('')}
      <optgroup label="One community">${((city && city.communities) || []).filter(c => c.residential).slice().sort((x, y) => x.name.localeCompare(y.name)).map(c => `<option value="c:${c.code}" ${a === `c:${c.code}` ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</optgroup></select></div>`;

  const br12 = sum('br12'), brPrev = sum('brPrev'), km = sum('km'), oldKm = sum('oldKm'), ciKm = sum('ciKm');
  const rd12 = sum(r => r.roads[0]), rdPrev = sum(r => r.roads[1]), wt12 = sum(r => r.water[0]), wtPrev = sum(r => r.water[1]);
  const pave = sum('paveNext') + sum('pave5');
  const hero = `<section class="el-cr span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Infrastructure condition · ${esc(placeName)}</div><h2 class="el-cr-title">Where roads and pipes are wearing out</h2>
      <div class="el-cr-sub">Water main breaks, the age of the water network, the City's paving plan and its own condition figures, set against 311 requests about the same things.</div></div>${areaSel}</div>
    <div class="el-cr-kpis">
      <div class="el-kpi"><div class="el-kpi-l">Calgary's roads in poor condition</div><div class="el-kpi-n">${pq.poor ?? '–'}%</div><div class="el-hero-sub">${pq.good ?? '–'}% good, ${pq.fair ?? '–'}% fair (City, ${esc(pq.as_of || '')})</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Water main breaks, 12 months</div><div class="el-kpi-n">${fmt(br12)}</div><div class="el-hero-sub">${infChg(infPct(br12, brPrev))} on the 12 months before (${fmt(brPrev)})</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Water mains 50 years or older</div><div class="el-kpi-n">${km ? fmt(oldKm / km * 100, 0) : '–'}%</div><div class="el-hero-sub">${fmt(oldKm, 0)} of ${fmt(km, 0)} km</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Cast iron mains</div><div class="el-kpi-n">${km ? fmt(ciKm / km * 100, 0) : '–'}%</div><div class="el-hero-sub">${fmt(ciKm, 0)} km, the material that breaks most</div></div>
      <div class="el-kpi"><div class="el-kpi-l">311: roads and potholes</div><div class="el-kpi-n">${fmt(rd12)}</div><div class="el-hero-sub">${infChg(infPct(rd12, rdPrev))} on the 12 months before</div></div>
      <div class="el-kpi"><div class="el-kpi-l">311: water mains and valves</div><div class="el-kpi-n">${fmt(wt12)}</div><div class="el-hero-sub">${infChg(infPct(wt12, wtPrev))} on the 12 months before</div></div>
    </div></section>`;

  // the communities where condition is slipping and complaints are rising
  const sorters = { signals: (x, y) => (y.both - x.both) || (y.flags.length - x.flags.length) || (y.br12 - x.br12), breaks: (x, y) => y.br12 - x.br12,
    rate: (x, y) => (y.brRate || 0) - (x.brRate || 0), age: (x, y) => (x.medYear || 9999) - (y.medYear || 9999), roads: (x, y) => y.roads[0] - x.roads[0] };
  const list = rows.filter(r => r.km || r.roads[0] || r.br12).sort(sorters[infSort] || sorters.signals);
  const both = list.filter(r => r.both);
  const flagHtml = r => r.flags.map(([k, t]) => `<span class="inf-flag ${k}">${esc(t)}</span>`).join('');
  const shown = list.slice(0, a.startsWith('c:') ? 1 : 60);
  const table = `<section class="card span-12"><div class="card-head"><div><h2>Wearing out, and complaints rising</h2><p class="card-sub">${fmt(both.length)} of ${fmt(list.length)} communities in ${esc(placeName)} show both: ${fmt(list.filter(r => r.bothWater).length)} where the water network is wearing out (breaks rising, ageing mains or much cast iron) and water requests to 311 are up 15% or more on the year before; ${fmt(list.filter(r => r.bothRoads).length)} where road and pothole requests are up 25% or more and no paving is planned.</p></div>
      <div class="card-tools"><label class="sr-only" for="inf-sort">Sort by</label><select id="inf-sort" class="select">${[['signals', 'Both first'], ['breaks', 'Most water main breaks'], ['rate', 'Breaks per 100 km'], ['age', 'Oldest water mains'], ['roads', 'Most road requests']].map(([k, t]) => `<option value="${k}" ${k === infSort ? 'selected' : ''}>${t}</option>`).join('')}</select><button class="btn" id="inf-csv">Download CSV</button></div></div>
    <div class="table-wrap"><table class="data inf-table"><thead><tr><th scope="col">Community</th><th class="num" scope="col">Water main breaks, 12 months</th><th class="num" scope="col">Per 100 km of main</th><th class="num" scope="col">Mains: middle year laid</th><th class="num" scope="col">50+ years old</th><th class="num" scope="col">Cast iron</th>
      <th class="num" scope="col">311 roads and potholes</th><th class="num" scope="col">311 sidewalks</th><th class="num" scope="col">311 streetlights</th><th class="num" scope="col">311 water</th><th class="num" scope="col">Paving planned (km)</th><th scope="col">Signals</th></tr></thead>
    <tbody>${shown.map(r => `<tr class="${r.both ? 'inf-both' : ''}"><th scope="row">${esc(r.name)}${r.ward ? `<small class="muted"> · Ward ${r.ward}</small>` : ''}</th>
      <td class="num"><b>${fmt(r.br12)}</b> <small class="muted">(${fmt(r.brPrev)})</small></td><td class="num">${isNum(r.brRate) ? fmt(r.brRate, 1) : '–'}</td><td class="num">${r.medYear || '–'}</td><td class="num">${isNum(r.oldShare) ? fmt(r.oldShare * 100, 0) + '%' : '–'}</td><td class="num">${isNum(r.ciShare) ? fmt(r.ciShare * 100, 0) + '%' : '–'}</td>
      ${['roads', 'side', 'lights', 'water'].map(k => `<td class="num">${fmt(r[k][0])} <small class="${infPct(r[k][0], r[k][1]) > 0 ? 'inf-up' : 'muted'}">${infChg(infPct(r[k][0], r[k][1]))}</small></td>`).join('')}
      <td class="num">${r.paveNext + r.pave5 ? fmt(r.paveNext + r.pave5, 1) : '–'}</td><td class="inf-flags">${flagHtml(r) || '<span class="muted">–</span>'}</td></tr>`).join('')}</tbody></table></div>
    <p class="card-note">Water main breaks: this year's 12 months, the 12 before in brackets. 311 columns: requests in the last 12 months and the change on the 12 before. Highlighted rows show both: a condition signal and rising 311 requests about the same thing. Paving planned: this year, next year and the tentative five-year plan. A flag is a lead to look into, not a finding: more requests can also mean more people reporting.</p></section>`;

  // Calgary by year
  const by = INF.city || {}, yrs = Object.keys(by.breaks_by_year || {}).map(Number).filter(y => y >= today - 15 && y < today).sort();
  const allY = Object.entries(by.breaks_by_year || {}).filter(([y]) => +y < today), peak = allY.reduce((m, x) => (x[1] > m[1] ? x : m), ['', 0]), last = allY[allY.length - 1] || ['', 0];
  const breaksCard = `<section class="card span-6"><div class="card-head"><div><h2>Water main breaks in Calgary, by year</h2><p class="card-sub">Every recorded break; ${today} so far is left out. Breaks peaked at ${fmt(peak[1])} in ${peak[0]} and were ${fmt(last[1])} in ${last[0]}, as the City replaced cast iron mains; the ageing network still left is where they happen.</p></div></div>
    ${ecBars(yrs.map(y => ({ label: String(y), v: by.breaks_by_year[y] })), v => fmt(v))}</section>`;
  const rqY = by.requests_by_year || {}, ry = [...new Set(Object.values(rqY).flatMap(o => Object.keys(o).map(Number)))].filter(y => y < today).sort();
  const reqCard = `<section class="card span-6"><div class="card-head"><div><h2>311 requests about infrastructure, by year</h2><p class="card-sub">All of Calgary; ${today} so far is left out</p></div></div>
    ${Object.entries(INF.requests || {}).map(([k, v]) => `<h4 class="inf-h4">${esc(v.label)}</h4>${ecBars(ry.slice(-5).map(y => ({ label: String(y), v: (rqY[k] || {})[y] || 0 })), x => fmt(x))}`).join('')}</section>`;

  // the oldest networks in the area
  const oldest = rows.filter(r => r.km >= 5 && r.medYear).sort((x, y) => x.medYear - y.medYear).slice(0, 15);
  const ageCard = `<section class="card span-6"><div class="card-head"><div><h2>Oldest water networks</h2><p class="card-sub">The year by which half of each community's water mains (by length) had been laid</p></div></div>
    ${ecBars(oldest.map(r => ({ label: r.name, v: today - r.medYear, sub: `middle year ${r.medYear} · ${fmt(r.km, 0)} km · ${isNum(r.ciShare) ? fmt(r.ciShare * 100, 0) : 0}% cast iron` })), v => `${fmt(v)} yrs`)}</section>`;

  // the paving plan in the area
  const codes = new Set(comms.map(c => c.code));
  const proj = (INF.projects || []).filter(p => codes.has(p[1]) || (a === 'all' && !p[1]));
  const lab = { this_year: 'This year', next_year: 'Next year', five_year: 'Five-year plan' };
  const paveCard = `<section class="card span-6"><div class="card-head"><div><h2>The City's paving plan</h2><p class="card-sub">${fmt(proj.length)} road sections in ${esc(placeName)}; ${fmt(pave, 1)} km this year, next year and in the tentative five-year plan</p></div></div>
    <div class="table-wrap inf-pave"><table class="data"><thead><tr><th scope="col">When</th><th scope="col">Street</th><th scope="col">From</th><th scope="col">To</th><th class="num" scope="col">km</th></tr></thead>
    <tbody>${proj.slice(0, 120).map(p => `<tr><td>${esc(lab[p[0]] || p[0])}</td><th scope="row">${esc(p[2] || '')}<small class="muted"> ${esc(infName(p[1] || ''))}</small></th><td>${esc(p[3] || '')}</td><td>${esc(p[4] || '')}</td><td class="num">${fmt(p[5], 2)}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">No paving listed here.</td></tr>'}</tbody></table></div></section>`;

  // the City's own condition figures
  const cr = (ctx.critical || {}).rows || [];
  const pqBar = `<div class="inf-pqi"><span style="width:${pq.good}%" class="g">${pq.good}% good</span><span style="width:${pq.fair}%" class="f">${pq.fair}% fair</span><span style="width:${pq.poor}%" class="p">${pq.poor}% poor</span></div>`;
  const cityCard = `<section class="card span-12"><div class="card-head"><div><h2>The City's own condition figures</h2><p class="card-sub">Not published as open data by road or pipe, so kept here with their sources</p></div></div>
    <h4 class="inf-h4">Roads: ${esc(pq.scale || '')}</h4>${pqBar}
    <p class="card-sub">Calgary, ${esc(pq.as_of || '')}. Canada's average: ${pq.canada_good}% good. The network is slipping by ${esc(pq.decline || '')}. The City's targets for roads in good condition or better: ${Object.entries(pq.targets || {}).map(([k, v]) => `${k.toLowerCase()} ${v}%`).join(', ')}. Inspected: ${esc(pq.inspected || '')}. <a href="${esc((pq.source || {}).url || '#')}" target="_blank" rel="noopener">${esc((pq.source || {}).publisher || '')}: ${esc((pq.source || {}).title || '')}</a></p>
    <p class="card-sub"><b>${(ctx.overall_poor || {}).pct}%</b> ${esc((ctx.overall_poor || {}).what || '')}. <a href="${esc(((ctx.overall_poor || {}).source || {}).url || '#')}" target="_blank" rel="noopener">${esc(((ctx.overall_poor || {}).source || {}).title || '')}</a></p>
    <h4 class="inf-h4">Critical assets in poor or very poor condition</h4>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Asset</th><th scope="col">If it fails</th><th scope="col">Condition</th><th scope="col">Money set aside</th></tr></thead>
    <tbody>${cr.map(r => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td><td class="wrap">${esc(r[2])}</td><td class="wrap">${esc(r[3])}</td></tr>`).join('')}</tbody></table></div>
    <p class="card-note">Source: <a href="${esc(((ctx.critical || {}).source || {}).url || '#')}" target="_blank" rel="noopener">${esc(((ctx.critical || {}).source || {}).title || '')}</a>, City of Calgary, 2026.</p></section>`;

  // ward by ward: every ward side by side (all of Calgary), or the chosen ward against Calgary
  const allRows = ((city && city.communities) || []).filter(c => c.code && c.residential !== false && c.ward).map(c => infRow(c, today));
  const agg = rs => {
    const g = { res: 0, br12: 0, brPrev: 0, km: 0, oldKm: 0, ciKm: 0, pave: 0, both: 0, n: rs.length };
    ['roads', 'side', 'lights', 'water'].forEach(k => { g[k] = [0, 0]; });
    rs.forEach(r => { g.res += r.residents; g.br12 += r.br12; g.brPrev += r.brPrev; g.km += r.km; g.oldKm += r.oldKm; g.ciKm += r.ciKm; g.pave += r.paveNext + r.pave5; g.both += r.both ? 1 : 0;
      ['roads', 'side', 'lights', 'water'].forEach(k => { g[k][0] += r[k][0]; g[k][1] += r[k][1]; }); });
    g.oldShare = g.km ? g.oldKm / g.km : null; g.ciShare = g.km ? g.ciKm / g.km : null; g.brRate = g.km ? g.br12 / g.km * 100 : null;
    g.roads1k = g.res ? g.roads[0] / g.res * 1000 : null;
    return g;
  };
  const W = wards.map(w => ({ w, ...agg(allRows.filter(r => r.ward === w)) })), C = agg(allRows);
  const wCells = g => `<td class="num">${fmt(g.res)}</td><td class="num"><b>${fmt(g.br12)}</b> <small class="muted">(${fmt(g.brPrev)})</small></td><td class="num">${isNum(g.brRate) ? fmt(g.brRate, 1) : '–'}</td><td class="num">${isNum(g.oldShare) ? fmt(g.oldShare * 100, 0) + '%' : '–'}</td><td class="num">${isNum(g.ciShare) ? fmt(g.ciShare * 100, 0) + '%' : '–'}</td>
      ${['roads', 'side', 'lights', 'water'].map(k => `<td class="num">${fmt(g[k][0])} <small class="${infPct(g[k][0], g[k][1]) > 0 ? 'inf-up' : 'muted'}">${infChg(infPct(g[k][0], g[k][1]))}</small></td>`).join('')}
      <td class="num">${isNum(g.roads1k) ? fmt(g.roads1k, 1) : '–'}</td><td class="num">${fmt(g.pave, 1)}</td><td class="num">${fmt(g.both)} <small class="muted">of ${fmt(g.n)}</small></td>`;
  const wHead = `<tr><th scope="col">Ward</th><th class="num" scope="col">Residents</th><th class="num" scope="col">Water main breaks, 12 months</th><th class="num" scope="col">Per 100 km of main</th><th class="num" scope="col">Mains 50+ years old</th><th class="num" scope="col">Cast iron</th>
      <th class="num" scope="col">311 roads and potholes</th><th class="num" scope="col">311 sidewalks</th><th class="num" scope="col">311 streetlights</th><th class="num" scope="col">311 water</th><th class="num" scope="col">Road requests per 1,000 residents</th><th class="num" scope="col">Paving planned (km)</th><th class="num" scope="col">Communities flagged</th></tr>`;
  const chosenW = a.startsWith('w') ? +a.slice(1) : null;
  const wardTable = `<section class="card span-12"><div class="card-head"><div><h2>Ward by ward</h2><p class="card-sub">${chosenW ? `Ward ${chosenW} against every other ward and all of Calgary.` : 'Every ward side by side.'} Tap a ward to look inside it. 311 columns: the last 12 months and the change on the 12 before.</p></div><div class="card-tools"><button class="btn" id="inf-wcsv">Download CSV</button></div></div>
    <div class="table-wrap"><table class="data inf-table"><thead>${wHead}</thead><tbody>
    ${W.map(g => `<tr class="${g.w === chosenW ? 'inf-chosen' : ''}"><th scope="row"><button type="button" class="link-btn" data-infw="${g.w}">Ward ${g.w}</button></th>${wCells(g)}</tr>`).join('')}
    <tr class="inf-total"><th scope="row">All of Calgary</th>${wCells(C)}</tr></tbody></table></div>
    <p class="card-note">Communities are placed in the ward holding most of their area. Flagged: communities showing both a condition signal and rising 311 requests (see the table below).</p></section>`;
  const wBars = (title, sub, f, fmtv) => `<section class="card span-6"><div class="card-head"><div><h2>${title}</h2><p class="card-sub">${sub}</p></div></div>${ecBars(W.filter(g => isNum(f(g))).sort((x, y) => f(y) - f(x)).map(g => ({ label: `Ward ${g.w}`, v: f(g), on: g.w === chosenW })), fmtv)}</section>`;
  const wardCharts = wBars('Ageing water mains, by ward', 'Share of the length of water main laid 50 or more years ago', g => g.oldShare === null ? null : g.oldShare * 100, v => fmt(v, 0) + '%')
    + wBars('Road and pothole requests, by ward', 'Requests to 311 in the last 12 months, per 1,000 residents', g => g.roads1k, v => fmt(v, 1));
  const errs = Object.keys(INF.errors || {});
  body.innerHTML = hero + wardTable + wardCharts + table + breaksCard + reqCard + ageCard + paveCard + cityCard
    + `<section class="card span-12"><p class="card-note">${errs.length ? `Not read at this refresh: ${esc(errs.join(', '))}. ` : ''}Sources: ${(INF.sources || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher)}: ${esc(s.title)}</a>`).join('; ')}. Read ${esc(String(INF.built_at || '').slice(0, 10))}. <button type="button" class="link-btn small" data-method="infra">How this is worked out</button></p></section>`;
  const s = $('#inf-area'); if (s) s.addEventListener('change', () => { infArea = s.value; renderInfra(); });
  body.querySelectorAll('[data-infw]').forEach(b => b.addEventListener('click', () => { infArea = 'w' + b.dataset.infw; renderInfra().then(() => { const t = $('#inf-body .inf-table'); if (t) t.scrollIntoView({ block: 'start' }); }); }));
  const wc = $('#inf-wcsv'); if (wc) wc.addEventListener('click', async () => {
    const line = (name, g) => [name, g.res, g.br12, g.brPrev, isNum(g.brRate) ? +g.brRate.toFixed(2) : '', +g.km.toFixed(1), isNum(g.oldShare) ? +(g.oldShare * 100).toFixed(1) : '', isNum(g.ciShare) ? +(g.ciShare * 100).toFixed(1) : '',
      g.roads[0], g.roads[1], g.side[0], g.side[1], g.lights[0], g.lights[1], g.water[0], g.water[1], isNum(g.roads1k) ? +g.roads1k.toFixed(2) : '', +g.pave.toFixed(2), g.both, g.n];
    await (await api()).save_csv('Infrastructure condition by ward', ['Ward', 'Residents', 'Water main breaks, 12 months', 'Breaks, 12 months before', 'Breaks per 100 km', 'Water mains (km)', '50+ years old (%)', 'Cast iron (%)',
      '311 roads, 12 months', '311 roads, before', '311 sidewalks, 12 months', '311 sidewalks, before', '311 streetlights, 12 months', '311 streetlights, before', '311 water, 12 months', '311 water, before', 'Road requests per 1,000 residents', 'Paving planned (km)', 'Communities flagged', 'Communities'],
      [...W.map(g => line(`Ward ${g.w}`, g)), line('All of Calgary', C)]);
  });
  const so = $('#inf-sort'); if (so) so.addEventListener('change', () => { infSort = so.value; renderInfra(); });
  const csv = $('#inf-csv'); if (csv) csv.addEventListener('click', async () => {
    await (await api()).save_csv(`Infrastructure condition - ${placeName}`, ['Community', 'Ward', 'Water main breaks, 12 months', 'Breaks, 12 months before', 'Breaks per 100 km', 'Water mains (km)', 'Middle year laid', '50+ years old (%)', 'Cast iron (%)',
      '311 roads, 12 months', '311 roads, before', '311 sidewalks, 12 months', '311 sidewalks, before', '311 streetlights, 12 months', '311 streetlights, before', '311 water, 12 months', '311 water, before', 'Paving planned (km)', 'Signals'],
      list.map(r => [r.name, r.ward || '', r.br12, r.brPrev, isNum(r.brRate) ? +r.brRate.toFixed(2) : '', r.km, r.medYear || '', isNum(r.oldShare) ? +(r.oldShare * 100).toFixed(1) : '', isNum(r.ciShare) ? +(r.ciShare * 100).toFixed(1) : '',
        r.roads[0], r.roads[1], r.side[0], r.side[1], r.lights[0], r.lights[1], r.water[0], r.water[1], +(r.paveNext + r.pave5).toFixed(2), r.flags.map(f => f[1]).join('; ')]));
  });
}
window.renderInfra = renderInfra;
