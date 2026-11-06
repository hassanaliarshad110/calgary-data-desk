// Federal Budget 2026: the Government of Canada's budget, tabled 5 November 2026.
// Read from the official budget pages (budget.canada.ca) and Finance Canada's Federal Support to Provinces and Territories tables.
let FB = null, fbSub = 'overview', fbProv = 'AB', fbQ = '', fbChap = 0, fbSort = 'size', fbOpen = new Set();
const FB_SUBS = [['overview', 'Overview'], ['provinces', 'Province by province'], ['calgary', 'Calgary and Alberta'], ['measures', 'Every measure'], ['tax', 'Tax changes'], ['tables', 'Fiscal tables']];
const FB_PROV_ORDER = ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'];

async function loadFedBudget() {
  if (FB) return FB;
  try { const res = await (await api()).get_fedbudget(); if (res && res.ok && res.data) FB = res.data; } catch (e) { /* shown below */ }
  return FB;
}
// money: tables are in millions (chapters, tax, transfers) or billions (fiscal); show $ billions once a figure reaches 1,000 million
const fbM = (m, signed) => { if (!isNum(m)) return '–'; const s = signed && m > 0 ? '+' : '', a = Math.abs(m), neg = m < 0 ? '−' : '';
  return a >= 1000 ? `${s}${neg}$${fmt(a / 1000, a >= 100000 ? 0 : 1)}B` : `${s}${neg}$${fmt(a, a < 10 && a % 1 ? 1 : 0)}M`; };
const fbB = (b, signed) => !isNum(b) ? '–' : `${signed && b > 0 ? '+' : ''}${b < 0 ? '−' : ''}$${fmt(Math.abs(b), 1)}B`;
const fbRow = (t, start) => (t.rows || []).find(r => r.v && r.label === start) || (t.rows || []).find(r => r.v && r.label.startsWith(start));
const fbYr = c => String(c).replace(/^(\d{4})-(\d{2})$/, '$1–$2');
const fbDoc = d => (FB.docs || {})[d] || { name: d, url: FB.source };
const fbPill = (t, cls = '') => `<span class="fb-pill ${cls}">${esc(t)}</span>`;

// vertical bars with negatives allowed; series = [{name, color, v:[...]}]
function fbColumns(cols, series, fmtFn, h = 190) {
  const all = series.flatMap(s => s.v).filter(isNum), max = Math.max(0, ...all), min = Math.min(0, ...all), span = (max - min) || 1;
  const W = 640, top = min < 0 ? 22 : 18, bot = 26, ih = h - top - bot, gw = W / cols.length, bw = Math.min(26, (gw - 14) / series.length);
  const y = v => top + (max - v) / span * ih, y0 = y(0);
  let g = `<line x1="0" x2="${W}" y1="${y0}" y2="${y0}" class="fb-axis"/>`;
  cols.forEach((c, i) => {
    const x0 = i * gw + (gw - bw * series.length) / 2;
    series.forEach((s, k) => { const v = s.v[i]; if (!isNum(v)) return; const yy = Math.min(y(v), y0), hh = Math.max(1, Math.abs(y(v) - y0));
      g += `<rect x="${x0 + k * bw}" y="${yy}" width="${bw - 3}" height="${hh}" rx="2" fill="${s.color}"><title>${esc(s.name)} ${esc(fbYr(c))}: ${esc(fmtFn(v))}</title></rect>`;
      if (k === series.length - 1 || series.length === 1) {   // a negative bar's value sits inside its end, clear of the year labels
        g += `<text x="${x0 + k * bw + (bw - 3) / 2}" y="${v < 0 ? y0 - 5 : y(v) - 5}" class="fb-val" text-anchor="middle">${esc(fmtFn(v))}</text>`;
      } });
    g += `<text x="${i * gw + gw / 2}" y="${h - 8}" class="fb-lab" text-anchor="middle">${esc(fbYr(c))}</text>`;
  });
  const key = series.length > 1 ? `<div class="fb-key">${series.map(s => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';
  return `${key}<svg class="fb-cols" viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(series.map(s => s.name).join(', '))}">${g}</svg>`;
}
// horizontal bars: [{label, v, sub, on}]
function fbBars(items, fmtFn) {
  const max = Math.max(...items.map(x => Math.abs(x.v || 0)), 1e-9);
  return `<div class="fb-bars">${items.map(x => `<div class="fb-bar${x.on ? ' is-on' : ''}"><span class="fb-bar-l">${esc(x.label)}${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</span><span class="fb-bar-t"><i class="${(x.v || 0) < 0 ? 'neg' : ''}" style="width:${Math.abs(x.v || 0) / max * 100}%"></i></span><span class="fb-bar-v">${esc(fmtFn(x.v))}</span></div>`).join('')}</div>`;
}

// ---- Overview
function fbOverview() {
  const A8 = FB.fiscal['Table A1.8'], A9 = FB.fiscal['Table A1.9'], A10 = FB.fiscal['Table A1.10'], A6 = FB.fiscal['Table A1.6'], A5 = FB.fiscal['Table A1.5'], O = FB.overview;
  const cols = A8.cols, Y = 1;   // 2026-27
  const bal = fbRow(A8, 'Budgetary balance').v, rev = fbRow(A8, 'Budgetary revenues').v, exp = fbRow(A8, 'Total expenses').v, pdc = fbRow(A8, 'Public debt charges').v;
  const debt = fbRow(A8, 'Federal debt').v, pct = A8.rows.filter(r => r.label === 'Federal debt' && r.v), debtPct = (pct[pct.length - 1] || {}).v || [];
  const balPct = (A8.rows.filter(r => r.label === 'Budgetary balance' && r.v)[1] || {}).v || [];
  const meas = fbRow(O, 'Subtotal – Budget 2026 measures').v, seu = fbRow(O, 'Budgetary balance – SEU 2026').v;
  const op = fbRow(A6, 'F. Day-to-day').v, capI = fbRow(A5, 'Capital investments in Budget 2026').v;
  const def5 = fbRow(FB.defence, 'Cash basis').v, defPct = fbRow(FB.defence, 'GDP percentage').raw;
  const m5 = meas.slice(1).reduce((a, b) => a + (b || 0), 0);
  const hero = `<section class="el-cr fb-hero span-12">
    <div class="el-cr-top"><div><div class="el-cr-kicker">Government of Canada · tabled ${esc(elDayFB(FB.tabled))}</div><h2 class="el-cr-title">${esc(FB.title)}</h2>
      <div class="el-cr-sub">${esc(FB.tabled_by)} · figures for 2026–27 unless noted · every number links back to the budget's own tables</div></div>
      <div class="el-cr-count"><div class="el-cr-kicker">Deficit, 2026–27</div><div class="el-cr-days">${fbB(bal[Y])}</div><div class="el-cr-sub">${fmt(Math.abs(balPct[Y]), 1)}% of GDP</div></div></div>
    <div class="el-cr-kpis">
      <div class="el-kpi"><div class="el-kpi-l">Revenue</div><div class="el-kpi-n">${fbB(rev[Y])}</div><div class="el-hero-sub">${fbB(rev[Y] - rev[0], true)} on 2025–26</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Spending</div><div class="el-kpi-n">${fbB(exp[Y])}</div><div class="el-hero-sub">${fbB(exp[Y] - exp[0], true)} on 2025–26</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Interest on the debt</div><div class="el-kpi-n">${fbB(pdc[Y])}</div><div class="el-hero-sub">${fmt(pdc[Y] / exp[Y] * 100, 1)}% of spending; ${fbB(pdc[5])} by 2030–31</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Federal debt</div><div class="el-kpi-n">${fbB(debt[Y])}</div><div class="el-hero-sub">${fmt(debtPct[Y], 1)}% of GDP</div></div>
      <div class="el-kpi"><div class="el-kpi-l">New measures, 5 years</div><div class="el-kpi-n">${fbB(-m5)}</div><div class="el-hero-sub">net cost of Budget 2026 measures, 2026–27 to 2030–31</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Defence (cash)</div><div class="el-kpi-n">${fbM(def5[0])}</div><div class="el-hero-sub">${esc(defPct[0])} of GDP in 2026–27, ${esc(defPct[1])} from 2027–28</div></div>
    </div></section>`;
  const deficit = fbColumns(cols, [{ name: 'Spring Economic Update 2026', color: '#94A3B8', v: seu }, { name: 'Budget 2026', color: '#0369A1', v: bal }], v => fbB(v));
  const opc = fbColumns(cols, [{ name: 'Day-to-day operating balance', color: '#047857', v: op }], v => fbB(v), 170);
  const capc = fbColumns(cols, [{ name: 'Capital investment', color: '#B45309', v: capI }], v => fbB(v), 170);
  // revenue and spending, 2026-27
  const rv = ['Personal income tax', 'Corporate income tax', 'Goods and Services Tax', 'Employment Insurance premium revenues', 'Non-resident income tax', 'Customs import duties', 'Other excise taxes/duties', 'Enterprise Crown corporations', 'Other programs', 'Net foreign exchange']
    .map(l => { const r = fbRow(A9, l); return r ? { label: r.label.replace(' revenues', '').replace('Net foreign exchange revenues and return on investments', 'Foreign exchange and investments'), v: r.v[Y] } : null; }).filter(Boolean).sort((a, b) => b.v - a.v);
  const ex = ['Old Age Security', 'Employment Insurance benefits', 'Canada Child Benefit', 'Canada Health Transfer', 'Canada Social Transfer', 'Equalization', 'Territorial Formula Financing', 'Health agreements', 'Canada-wide early learning', 'Build Communities Strong Fund', 'Other transfer payments', 'Other direct program expenses', 'Public debt charges']
    .map(l => { const r = fbRow(A10, l); return r ? { label: r.label.replace(' program', '').replace(' with provinces and territories', ' (provinces)'), v: r.v[Y] } : null; }).filter(Boolean).sort((a, b) => b.v - a.v);
  // measures by chapter
  const ch = FB.chapters.map(c => ({ label: `${c.n}. ${c.name}`, v: c.net[5], sub: `${fbM(c.net[0])} in 2026–27` }));
  const strat = `<div class="fb-strats">${FB.strategies.map(s => `<div class="fb-strat"><div class="fb-strat-n">${esc(s.amount.replace('*', '') || '—')}</div><div class="fb-strat-t">${esc(s.name)}</div><ul>${s.lines.slice(0, 5).map(l => `<li>${esc(l)}</li>`).join('')}</ul></div>`).join('')}</div>`;
  const econ = FB.fiscal['Table A1.2'], er = [];
  (econ.rows || []).forEach((r, k) => { if (r.head && /^(Real GDP growth$|GDP inflation|Nominal GDP growth|Unemployment rate|Consumer Price Index|3-month|10-year|Exchange rate|West Texas)/.test(r.label)) { const b = econ.rows.slice(k + 1).find(x => x.v && x.label === 'Budget 2026'); if (b) er.push({ label: r.label, raw: b.raw }); } });
  const econT = er.length ? `<div class="table-wrap"><table class="data"><thead><tr><th scope="col">Private sector average</th>${econ.cols.map(c => `<th scope="col" class="num">${esc(c)}</th>`).join('')}</tr></thead><tbody>${er.map(r => `<tr><th scope="row">${esc(r.label)}</th>${r.raw.map(x => `<td class="num">${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
  return `${hero}
    <section class="card span-6"><div class="card-head"><div><h2>Deficit path</h2><p class="card-sub">Budgetary balance, $ billions: Budget 2026 against the Spring Economic Update 2026</p></div></div>${deficit}<p class="card-note">Source: Budget 2026, Annex 1, Table A1.8, and the overview's Table 1.</p></section>
    <section class="card span-6"><div class="card-head"><div><h2>Two lines the budget is judged on</h2><p class="card-sub">Its fiscal anchors: day-to-day spending covered by revenue, and capital investment</p></div></div>${opc}${capc}<p class="card-note">Day-to-day operating balance (Table A1.6) and capital investment (Table A1.5), $ billions.</p></section>
    <section class="card span-6"><div class="card-head"><div><h2>Where the money comes from</h2><p class="card-sub">Revenue, 2026–27, $ billions</p></div></div>${fbBars(rv, v => fbB(v))}<p class="card-note">Table A1.9. Total ${fbB(rev[Y])}.</p></section>
    <section class="card span-6"><div class="card-head"><div><h2>Where it goes</h2><p class="card-sub">Spending, 2026–27, $ billions</p></div></div>${fbBars(ex, v => fbB(v))}<p class="card-note">Table A1.10. Other fiscal arrangements (a ${fbB(fbRow(A10, 'Other fiscal arrangements').v[Y])} recovery) not shown.</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>New measures by chapter</h2><p class="card-sub">Net cost over five years, 2026–27 to 2030–31. Open "Every measure" for the line items.</p></div></div>${fbBars(ch, v => fbM(v))}</section>
    <section class="card span-12"><div class="card-head"><div><h2>The national strategies</h2><p class="card-sub">Over $140 billion across strategies set out in the Budget in brief (cash basis)</p></div></div>${strat}</section>
    ${econT ? `<section class="card span-12"><div class="card-head"><div><h2>The economy the budget assumes</h2><p class="card-sub">Average of private sector forecasts surveyed for Budget 2026, % unless noted (Table A1.2)</p></div></div>${econT}</section>` : ''}`;
}
const elDayFB = d => (typeof dmy === 'function' ? dmy(d) : d) || '';

// ---- Province by province
function fbProvTransfers(p) {
  const t = p.transfers; if (!t) return '';
  const Y = t.years.length - 1, tot = t.rows.find(r => r.label.startsWith('Total')), pc = t.rows.find(r => r.label.startsWith('Per Capita'));
  const parts = t.rows.filter(r => !r.label.startsWith('Total') && !r.label.startsWith('Per Capita') && (r.v[Y] || 0) !== 0);
  const kp = `<div class="fb-kpis">${[[`Federal transfers, ${fbYr(t.years[Y])}`, fbM(tot.v[Y]), `${fbM(tot.v[Y] - tot.v[Y - 1], true)} on the year before`],
    ['Per person', `$${fmt(pc.v[Y])}`, `Canada: $${fmt(fbRow(FB.transfers_canada, 'Per Capita').v[Y])}`],
    ...parts.map(r => [r.label, fbM(r.v[Y]), `${fmt((r.v[Y] / tot.v[Y]) * 100, 0)}% of the total`])].map(([l, n, s]) => `<div class="fb-kpi"><div class="fb-kpi-l">${esc(l)}</div><div class="fb-kpi-n">${esc(n)}</div><div class="fb-kpi-s">${esc(s)}</div></div>`).join('')}</div>`;
  const ten = fbColumns(t.years, [{ name: 'Major transfers', color: '#0369A1', v: tot.v }], v => fbM(v), 170);
  return `${kp}<h3 class="fb-h3">Ten years of major transfers</h3>${ten}<p class="card-note">Canada Health Transfer, Canada Social Transfer, Equalization${p.code === 'NS' ? ', offshore offsets' : ''}${['YT', 'NT', 'NU'].includes(p.code) ? ', Territorial Formula Financing' : ''}, $ millions. ${esc(t.note)} Source: Finance Canada, Federal Support to Provinces and Territories.</p>`;
}
function fbMentions(ms, max = 60) {
  if (!ms.length) return '<p class="muted">No other passage in the budget names this province or its cities.</p>';
  return `<ol class="fb-mentions">${ms.slice(0, max).map(m => `<li><div class="fb-m-src"><a href="${esc(fbDoc(m.doc).url)}" target="_blank" rel="noopener">${esc(fbDoc(m.doc).name)}</a>${m.topic && /^[A-Z0-9]/.test(m.topic) ? ` · ${esc(m.topic)}` : ''}${(m.money || []).map(x => ' ' + fbPill(x, 'money')).join('')}</div><p>${esc(m.text)}</p></li>`).join('')}</ol>`;
}
const fbList = (title, items, note) => items && items.length ? `<div class="fb-listcard"><h3 class="fb-h3">${esc(title)} <small>${items.length}</small></h3><ul>${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>${note ? `<p class="card-note">${esc(note)}</p>` : ''}</div>` : '';

// ---- federal revenue collected and spending in each province (Statistics Canada; the budget gives Canada only)
function fbAccounts(code, full) {
  const BP = FB.by_province; if (!BP) return '';
  const ys = BP.years, Y = ys[ys.length - 1], all = BP.by_year[Y], x = all[code]; if (!x) return '';
  const est = ((BP.estimate_2026_27 || {}).by || {})[code], L = BP.labels;
  const pp = v => isNum(v) ? `${v < 0 ? '−' : ''}$${fmt(Math.abs(v))}` : '–';
  const bal = x.balance, more = bal >= 0;
  const kp = `<div class="fb-kpis">${[[`Federal revenue collected, ${Y}`, fbM(x.revenue), `${fmt((x.share_of_revenue || 0) * 100, 1)}% of all federal revenue`],
    [`Federal spending there, ${Y}`, fbM(x.spending), `${pp(x.spending_per_person)} per person`],
    ['Collected minus spent', fbM(bal, true), `${pp(x.balance_per_person)} per person · ${more ? 'more collected than spent' : 'more spent than collected'}`],
    ['2026–27 revenue (estimate)', isNum(est) ? fbB(est) : '–', `Budget 2026's $${fmt(BP.estimate_2026_27.national_revenue_billions, 1)}B shared by ${Y} shares`]]
    .map(([l, n, s]) => `<div class="fb-kpi"><div class="fb-kpi-l">${esc(l)}</div><div class="fb-kpi-n">${esc(n)}</div><div class="fb-kpi-s">${esc(s)}</div></div>`).join('')}</div>`;
  const rev = L.rev.map(([k, l]) => ({ label: l, v: x.rev[k] })).filter(r => isNum(r.v) && r.v !== 0).sort((a, b) => b.v - a.v);
  const sp = L.spend.filter(([k]) => !['defence', 'oas', 'ei_benefits', 'ccb', 'cht', 'cst'].includes(k)).map(([k, l]) => ({ label: l, v: x.spend[k],
    sub: k === 'to_households' ? `OAS ${fbM(x.spend.oas)} · EI ${fbM(x.spend.ei_benefits)} · Canada Child Benefit ${fbM(x.spend.ccb)}` : k === 'to_provinces' ? `Canada Health Transfer ${fbM(x.spend.cht)} · Canada Social Transfer ${fbM(x.spend.cst)}` : k === 'goods_services' ? `defence ${fbM(x.spend.defence)}` : '' }))
    .filter(r => isNum(r.v) && r.v !== 0).sort((a, b) => b.v - a.v);
  const trend = fbColumns(ys, [{ name: 'Revenue collected', color: '#0369A1', v: ys.map(y => (BP.by_year[y][code] || {}).revenue) }, { name: 'Spending there', color: '#B45309', v: ys.map(y => (BP.by_year[y][code] || {}).spending) }], v => fbM(v), 190);
  const one = `<section class="card span-12"><div class="card-head"><div><h2>Federal revenue and spending in ${esc(x.name)}</h2><p class="card-sub">The budget gives revenue for Canada only. Statistics Canada splits federal revenue and spending by province every year: this is ${esc(Y)}, the latest.</p></div></div>
    ${kp}<div class="ea-two"><div><h3 class="fb-h3">Where the revenue comes from <small>${esc(Y)}</small></h3>${fbBars(rev, v => fbM(v))}</div><div><h3 class="fb-h3">What is spent there <small>${esc(Y)}</small></h3>${fbBars(sp, v => fbM(v))}</div></div>
    <h3 class="fb-h3">${ys.length} years</h3>${trend}</section>`;
  if (!full) return one;
  const order = Object.entries(all).filter(([c]) => c !== 'CA').sort((a, b) => (b[1].balance || 0) - (a[1].balance || 0));
  const table = `<div class="table-wrap sr-wrap"><table class="data"><thead><tr><th scope="col">Province or territory</th><th class="num" scope="col">Revenue collected</th><th class="num" scope="col">Share</th><th class="num" scope="col">Spending there</th><th class="num" scope="col">Collected minus spent</th><th class="num" scope="col">Per person</th><th class="num" scope="col">2026–27 revenue (estimate)</th></tr></thead>
    <tbody>${order.map(([c, r]) => `<tr class="${c === code ? 'sr-cal' : ''}"><th scope="row">${esc(r.name)}</th><td class="num">${fbM(r.revenue)}</td><td class="num">${fmt((r.share_of_revenue || 0) * 100, 1)}%</td><td class="num">${fbM(r.spending)}</td><td class="num">${fbM(r.balance, true)}</td><td class="num">${pp(r.balance_per_person)}</td><td class="num">${isNum((BP.estimate_2026_27.by || {})[c]) ? fbB(BP.estimate_2026_27.by[c]) : '–'}</td></tr>`).join('')}
    <tr><th scope="row">Canada</th><td class="num">${fbM(all.CA.revenue)}</td><td class="num">100%</td><td class="num">${fbM(all.CA.spending)}</td><td class="num">${fbM(all.CA.balance, true)}</td><td class="num">${pp(all.CA.balance_per_person)}</td><td class="num">${fbB(BP.estimate_2026_27.national_revenue_billions)}</td></tr></tbody></table></div>`;
  return one + `<section class="card span-12"><div class="card-head"><div><h2>Every province and territory, ${esc(Y)}</h2><p class="card-sub">Federal revenue collected in each, federal spending there, and the difference per resident</p></div></div>
    ${fbBars(order.filter(([c]) => c !== 'XX').sort((a, b) => (b[1].balance_per_person || 0) - (a[1].balance_per_person || 0)).map(([c, r]) => ({ label: r.name, v: r.balance_per_person, on: c === code, sub: `${fbM(r.revenue)} collected · ${fbM(r.spending)} spent` })), v => pp(v))}
    ${table}<p class="card-note">${esc(BP.how)} ${esc((BP.estimate_2026_27 || {}).how || '')} Source: <a href="${esc(BP.source.url)}" target="_blank" rel="noopener">${esc(BP.source.publisher)}, ${esc(BP.source.title)}</a>; population: <a href="${esc(BP.source.population)}" target="_blank" rel="noopener">table 17-10-0009-01</a>.</p></section>`;
}
function fbProvinces() {
  const P = Object.fromEntries(FB.provinces.map(p => [p.code, p])), p = P[fbProv] || P.AB;
  const Y = p.transfers ? p.transfers.years.length - 1 : 0;
  const tiles = `<div class="fb-ptiles" role="tablist" aria-label="Province or territory">${FB_PROV_ORDER.map(c => { const q = P[c]; const t = q.transfers; const tot = t ? t.rows.find(r => r.label.startsWith('Total')).v[Y] : null;
    return `<button type="button" role="tab" class="fb-ptile${c === p.code ? ' is-on' : ''}" data-fbprov="${c}" aria-selected="${c === p.code}"><b>${esc(c)}</b><span>${esc(q.name)}</span><small>${fbM(tot)} · ${q.mentions.length + q.major_projects.length + q.communities_fund.length} items</small></button>`; }).join('')}</div>`;
  const pcRows = FB_PROV_ORDER.map(c => { const t = P[c].transfers; return { label: P[c].name, v: t ? t.rows.find(r => r.label.startsWith('Per Capita')).v[Y] : 0, on: c === p.code }; }).sort((a, b) => b.v - a.v);
  const totRows = FB_PROV_ORDER.map(c => { const t = P[c].transfers; return { label: P[c].name, v: t ? t.rows.find(r => r.label.startsWith('Total')).v[Y] : 0, on: c === p.code }; }).sort((a, b) => b.v - a.v);
  const def = (p.defence || []).filter(d => d.items.length);
  const named = (p.major_projects || []).length + (p.communities_fund || []).length + (p.festivals || []).length + def.reduce((a, d) => a + d.items.length, 0);
  return `<section class="card span-12"><div class="card-head"><div><h2>Pick a province or territory</h2><p class="card-sub">Everything the budget names in each one, and the federal transfers it receives</p></div></div>${tiles}</section>
    <section class="el-cr fb-hero span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Budget 2026 · province by province</div><h2 class="el-cr-title">${esc(p.name)}</h2><div class="el-cr-sub">${named} projects and investments named · ${p.mentions.length} passages of the budget mention it</div></div></div></section>
    ${fbAccounts(p.code, true)}
    <section class="card span-7"><div class="card-head"><div><h2>Federal transfers</h2><p class="card-sub">Major transfers to ${esc(p.name)}</p></div></div>${fbProvTransfers(p)}</section>
    <section class="card span-5"><div class="card-head"><div><h2>Transfers per person</h2><p class="card-sub">${esc(fbYr(p.transfers.years[Y]))}, dollars per resident</p></div></div>${fbBars(pcRows, v => '$' + fmt(v))}<p class="card-note">Equalization goes to provinces with less capacity to raise revenue, so per-person amounts differ widely.</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>Named in the budget</h2><p class="card-sub">Projects and investments the budget lists for ${esc(p.name)}</p></div></div><div class="fb-lists">
      ${fbList('Major projects (Major Projects Office)', p.major_projects, 'Projects referred to the Major Projects Office, from the Budget in brief.')}
      ${fbList('Build Communities Strong Fund projects', p.communities_fund, 'Projects the budget proposes to support, Chapter 3.')}
      ${def.map(d => fbList(`Defence investments: ${d.region}`, d.items, d.region === p.name ? 'Figure 5.1, Chapter 5.' : d.region === 'Multi-regional' ? 'Figure 5.1, Chapter 5, among the investments spanning several regions.' : `Figure 5.1, Chapter 5, listed for the ${d.region} region.`)).join('')}
      ${fbList('Festivals funded in 2026', p.festivals, 'Could receive more in 2027–28, subject to application (Figure 4.1).')}
      ${named ? '' : '<p class="muted">The budget\'s lists name no projects here; see the passages below.</p>'}</div></section>
    <section class="card span-12"><div class="card-head"><div><h2>Every passage that mentions ${esc(p.name)}</h2><p class="card-sub">The budget's own words, with the dollar figures in each passage</p></div></div>${fbMentions(p.mentions)}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Transfers across Canada</h2><p class="card-sub">Major transfers, ${esc(fbYr(p.transfers.years[Y]))}</p></div></div>${fbBars(totRows, v => fbM(v))}</section>`;
}

// ---- Calgary and Alberta
function fbCalgary() {
  const AB = FB.provinces.find(p => p.code === 'AB'), C3 = FB.chapters.find(c => c.n === 3), s31 = C3.sections.find(s => s.id === '3.1');
  const hh = (s31 ? s31.items : []).filter(i => !i.name.startsWith('Realignment')).map(i => ({ ...i, chap: 3, sec: '3.1 Delivering a boost today', url: C3.url }));
  const cal = [].concat(AB.communities_fund.filter(x => /Calgary/.test(x)).map(x => ({ t: x, src: 'Build Communities Strong Fund, Chapter 3' })),
    FB.calgary.map(m => ({ t: m.text, src: fbDoc(m.doc).name })));
  const t = AB.transfers, Y = t.years.length - 1, tot = t.rows.find(r => r.label.startsWith('Total'));
  return `<section class="el-cr fb-hero span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Budget 2026 · closer to home</div><h2 class="el-cr-title">Calgary and Alberta</h2><div class="el-cr-sub">What the federal budget names here, and the national measures every Calgary household can see</div></div>
    <div class="el-cr-count"><div class="el-cr-kicker">Major transfers to Alberta, ${esc(fbYr(t.years[Y]))}</div><div class="el-cr-days">${fbM(tot.v[Y])}</div><div class="el-cr-sub">$${fmt(t.rows.find(r => r.label.startsWith('Per Capita')).v[Y])} per Albertan</div></div></div></section>
    ${fbAccounts('AB', false)}
    <section class="card span-6"><div class="card-head"><div><h2>Named for Calgary</h2><p class="card-sub">Places in Calgary the budget names</p></div></div><ul class="fb-cal">${cal.map(x => `<li><p>${esc(x.t)}</p><small>${esc(x.src)}</small></li>`).join('')}</ul></section>
    <section class="card span-6"><div class="card-head"><div><h2>Named for Alberta</h2><p class="card-sub">Major projects, community projects and defence work</p></div></div><div class="fb-lists one">${fbList('Major projects', AB.major_projects)}${fbList('Build Communities Strong Fund', AB.communities_fund)}${(AB.defence || []).filter(d => d.items.length).map(d => fbList(`Defence: ${d.region}`, d.items)).join('')}${fbList('Festivals funded in 2026', AB.festivals)}</div></section>
    <section class="card span-12"><div class="card-head"><div><h2>For households everywhere, Calgary included</h2><p class="card-sub">Chapter 3.1, "Delivering a boost today": the measures that reach people directly</p></div></div>${fbMeasureTable(hh, true)}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Alberta in the budget's words</h2><p class="card-sub">${AB.mentions.length} passages</p></div></div>${fbMentions(AB.mentions)}</section>`;
}

// ---- Every measure
function fbAllItems() {
  const out = [];
  FB.chapters.forEach(c => c.sections.forEach(s => s.items.forEach(i => out.push({ ...i, chap: c.n, chapName: c.name, sec: s.id === 'add' ? 'Additional investments' : `${s.id} ${s.name}`, url: c.url }))));
  return out;
}
function fbMeasureRow(i, k, detail) {
  const id = `${i.chap}|${i.name}`, open = fbOpen.has(id) || detail;
  const txt = (i.text || []).map(x => `<p>${esc(x.text)}</p>`).join('') || (i.desc ? `<p>${esc(i.desc)}</p>` : '');
  const less = (i.less || []).map(l => `<div class="fb-less">Less: ${esc(l.name)} ${l.v.slice(0, 5).map(v => `<span>${fbM(v)}</span>`).join(' ')}</div>`).join('');
  return `<tr class="fb-mrow${open ? ' is-open' : ''}" data-fbm="${esc(id)}"><th scope="row"><button type="button" class="fb-mbtn" aria-expanded="${open}">${esc(i.name)}</button>${i.capital ? fbPill('capital', 'cap') : ''}<small>${esc(i.sec)}</small></th>
    ${i.v.slice(0, 5).map(v => `<td class="num">${fbM(v)}</td>`).join('')}<td class="num fb-tot">${fbM(i.v[5])}</td></tr>
    ${open && (txt || less) ? `<tr class="fb-mtext"><td colspan="7">${less}${txt}<a href="${esc(i.url)}" target="_blank" rel="noopener">Read it in Chapter ${i.chap}</a></td></tr>` : ''}`;
}
function fbMeasureTable(items, detail) {
  return `<div class="table-wrap"><table class="data fb-mtable"><thead><tr><th scope="col">Measure ($ millions)</th>${['2026–27', '2027–28', '2028–29', '2029–30', '2030–31'].map(c => `<th scope="col" class="num">${c}</th>`).join('')}<th scope="col" class="num">5 years</th></tr></thead>
    <tbody>${items.map((i, k) => fbMeasureRow(i, k, detail)).join('')}</tbody></table></div>`;
}
function fbMeasures() {
  let it = fbAllItems();
  const q = fbQ.trim().toLowerCase();
  if (fbChap) it = it.filter(i => i.chap === fbChap);
  if (q) it = it.filter(i => (i.name + ' ' + i.sec + ' ' + (i.desc || '') + ' ' + (i.text || []).map(x => x.text).join(' ')).toLowerCase().includes(q));
  if (fbSort === 'size') it.sort((a, b) => Math.abs(b.v[5] || 0) - Math.abs(a.v[5] || 0));
  const total = it.reduce((a, i) => a + (i.v[5] || 0) + (i.less || []).reduce((x, l) => x + (l.v[5] || 0), 0), 0);
  const chips = `<div class="chips">${[[0, 'All chapters']].concat(FB.chapters.map(c => [c.n, `${c.n}. ${c.name}`])).map(([n, t]) => `<button type="button" class="chip${fbChap === n ? ' on' : ''}" data-fbchap="${n}"><i style="background:var(--accent)"></i>${esc(t)}</button>`).join('')}</div>`;
  return `<section class="card span-12"><div class="card-head"><div><h2>Every measure in Budget 2026</h2><p class="card-sub">${it.length} line items from the chapter tables. Click a measure to read what the budget says about it.</p></div></div>
    <div class="fb-tools"><input type="search" id="fb-q" placeholder="Search measures and their text: housing, child care, defence, Alberta…" value="${esc(fbQ)}" aria-label="Search measures">
      <div class="seg small" role="radiogroup" aria-label="Order">${[['size', 'Largest first'], ['book', 'Budget order']].map(([k, t]) => `<button type="button" role="radio" aria-checked="${fbSort === k}" data-fbsort="${k}">${t}</button>`).join('')}</div></div>
    ${chips}<p class="fb-sum">${it.length} measures · net ${fbM(total)} over five years${q ? ` matching "${esc(fbQ)}"` : ''}</p>${fbMeasureTable(it)}
    <p class="card-note">Amounts are the budget's chapter tables, $ millions, accrual basis; a negative amount is a saving or new revenue. "Less" lines (funds from existing budgets, projected revenue) are shown under their measure. Measures marked capital include capital investment.</p></section>`;
}

// ---- Tax changes and fiscal tables
function fbTable(t, unit) {
  return `<div class="table-wrap"><table class="data fb-ftable"><thead><tr><th scope="col">${esc(unit || '')}</th>${(t.cols || []).map(c => `<th scope="col" class="num">${esc(fbYr(c))}</th>`).join('')}</tr></thead><tbody>
    ${t.rows.map(r => r.head ? `<tr class="fb-head"><th colspan="${(t.cols || []).length + 1}">${esc(r.label)}</th></tr>` : `<tr${/^Total|^Budgetary balance$|Total budgetary/.test(r.label) ? ' class="fb-total"' : ''}><th scope="row">${esc(r.label)}</th>${r.raw.map(x => `<td class="num">${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${t.note ? `<p class="card-note">${esc(t.note)}</p>` : ''}`;
}
function fbTax() {
  const t = FB.tax_measures;
  return `<section class="card span-12"><div class="card-head"><div><h2>Tax changes</h2><p class="card-sub">Revenue impact of the proposed tax measures, $ millions. A positive amount is less revenue for Ottawa (a tax cut or credit); negative is more.</p></div></div>${fbTable(t, '$ millions')}<p class="card-note">Source: <a href="${esc(t.source)}" target="_blank" rel="noopener">Tax measures: supplementary information</a>, Table 1.</p></section>`;
}
function fbTables() {
  const F = FB.fiscal, T = [['Table A1.8', 'Summary statement of transactions', '$ billions'], ['Table A1.9', 'The revenue outlook', '$ billions'], ['Table A1.10', 'The expense outlook', '$ billions'],
    ['Table A1.6', 'Day-to-day operating balance', '$ billions'], ['Table A1.5', 'Capital investments', '$ billions'], ['Table A1.11', 'Borrowing needs', '$ billions']];
  return T.map(([k, n, u]) => F[k] ? `<section class="card span-12"><div class="card-head"><div><h2>${esc(n)}</h2><p class="card-sub">${esc(F[k].caption)}</p></div></div>${fbTable(F[k], u)}</section>` : '').join('')
    + `<section class="card span-12"><div class="card-head"><div><h2>How the deficit changed since spring</h2><p class="card-sub">${esc(FB.overview.caption)}</p></div></div>${fbTable(FB.overview, '$ billions')}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Core defence spending</h2><p class="card-sub">${esc(FB.defence.caption)}</p></div></div>${fbTable(FB.defence, '$ millions')}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Major transfers, all provinces and territories</h2><p class="card-sub">Finance Canada, $ millions</p></div></div>${fbTable({ cols: FB.transfers_canada.years, rows: FB.transfers_canada.rows.map(r => ({ label: r.label, raw: r.v.map(v => isNum(v) ? fmt(v) : '–') })), note: FB.transfers_canada.note }, '$ millions')}</section>`;
}

async function renderFedBudget() {
  const body = $('#fb-body'); if (!body) return;
  if (!FB) body.innerHTML = '<section class="card span-12"><p class="muted">Reading the federal budget…</p></section>';
  await loadFedBudget();
  if (!FB) { body.innerHTML = '<section class="card span-12"><p>The federal budget could not be read just now. Try again in a minute.</p></section>'; return; }
  const page = { overview: fbOverview, provinces: fbProvinces, calgary: fbCalgary, measures: fbMeasures, tax: fbTax, tables: fbTables }[fbSub] || fbOverview;
  body.innerHTML = `<nav class="el-subtabs span-12" aria-label="Federal budget sections">${FB_SUBS.map(([k, t]) => `<button type="button" class="el-subtab${k === fbSub ? ' is-on' : ''}" data-fbsub="${k}" ${k === fbSub ? 'aria-current="page"' : ''}>${esc(t)}</button>`).join('')}</nav>
    ${page()}
    <section class="card span-12"><p class="card-note">From the official <a href="${esc(FB.source)}" target="_blank" rel="noopener">Budget 2026</a> documents, tabled ${esc(elDayFB(FB.tabled))}, and Finance Canada's <a href="${esc(FB.transfers_source)}" target="_blank" rel="noopener">Federal Support to Provinces and Territories</a>. Projections are the government's own. Facts only: nothing here rates the budget or recommends anything. <button type="button" class="link-btn small" data-method="fedbudget">How this is read</button></p></section>`;
  const re = () => { const y = window.scrollY; renderFedBudget().then(() => window.scrollTo(0, y)); };
  body.querySelectorAll('[data-fbsub]').forEach(b => b.addEventListener('click', () => { fbSub = b.dataset.fbsub; renderFedBudget(); }));
  body.querySelectorAll('[data-fbprov]').forEach(b => b.addEventListener('click', () => { fbProv = b.dataset.fbprov; re(); }));
  body.querySelectorAll('[data-fbchap]').forEach(b => b.addEventListener('click', () => { fbChap = +b.dataset.fbchap; re(); }));
  body.querySelectorAll('[data-fbsort]').forEach(b => b.addEventListener('click', () => { fbSort = b.dataset.fbsort; re(); }));
  body.querySelectorAll('.fb-mbtn').forEach(b => b.addEventListener('click', () => { const id = b.closest('tr').dataset.fbm; fbOpen.has(id) ? fbOpen.delete(id) : fbOpen.add(id); re(); }));
  const q = $('#fb-q');
  if (q) { let t; q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { fbQ = q.value; const pos = q.selectionStart; renderFedBudget().then(() => { const n = $('#fb-q'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }); }, 250); }); }
}
window.renderFedBudget = renderFedBudget;
