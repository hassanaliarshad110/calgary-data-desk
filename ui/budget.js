/* Calgary Insight: the City budget (live from Calgary Open Budget), and live connection tests for every source. */
'use strict';

// ================================================================ CITY BUDGET
let BUD = null, budYear = null, budChart = null;
const money = m => !isNum(m) ? '–' : m >= 1000 ? `$${fmt(m / 1000, 2)} billion` : `$${fmt(m, 1)} million`;
const moneyShort = m => !isNum(m) ? '–' : m >= 1000 ? `$${fmt(m / 1000, 2)}B` : `$${fmt(m, 0)}M`;
// "$12.5 million" -> 12.5 (millions of dollars); the largest amount named in a text
function millions(text) {
  let best = null;
  String(text || '').replace(/\$\s*([\d.,]+)\s*(billion|million|thousand|[bmk])?/gi, (_, n, u) => {
    let v = parseFloat(n.replace(/,/g, '')); u = (u || '').toLowerCase();
    v = u.startsWith('b') ? v * 1000 : u.startsWith('m') ? v : u.startsWith('t') || u === 'k' ? v / 1000 : v / 1e6;
    if (isNum(v)) best = Math.max(best || 0, v);
    return '';
  });
  return best;
}

async function loadBudget(force = false) {
  try {
    const res = await (await api()).get_budget(force);
    if (!res.ok) throw new Error(res.error);
    BUD = res.data;
    $('#bud-error').hidden = true;
  } catch (e) {
    $('#bud-error').textContent = `The budget could not be loaded from the City's open data: ${e.message || e}`;
    $('#bud-error').hidden = false;
  }
}

async function renderBudget() {
  if (!BUD) await loadBudget();
  if (!BUD) return;
  const years = BUD.years;
  if (!budYear) budYear = years.includes('2026') ? '2026' : years[years.length - 1];
  $('#bud-year').innerHTML = years.map(y => `<option ${y === budYear ? 'selected' : ''}>${y}</option>`).join('');
  const T = BUD.totals[budYear] || {}, op = T.operating, cap = T.capital;
  const people = D && D.population ? D.population.city_now : null;
  // a year past the current budget cycle has no operating budget: its capital is spending Council already approved, in
  // earlier budgets, for multi-year projects that run into that year; it is not a budget for that year
  const ahead = !op && !!cap;
  $('#bud-sub').textContent = ahead
    ? `${budYear}: no budget has been set for this year. The capital figure is spending Council already approved in earlier budgets for multi-year projects that run into ${budYear}, as the City's open budget data lists it.${+budYear <= 2030 ? ' The proposed 2027 to 2030 budget, now before Council, would add to it.' : ''} Live from Calgary Open Budget.`
    : `The City of Calgary's ${budYear} budget: ${[op ? (op.status || '').toLowerCase() + ' operating' : '', cap ? (cap.status || '').toLowerCase() + ' capital' : ''].filter(Boolean).join(' and ')}. Live from Calgary Open Budget.`;
  const prev = BUD.totals[String(+budYear - 1)] || {};
  const ch = (a, b) => a && b && b.value ? signed((a.value / b.value - 1) * 100, 1) + ' on ' + (+budYear - 1) : '';
  $('#bud-stats').innerHTML = [
    [op ? money(op.value) : '–', `operating budget${op ? ', ' + (op.status || '').toLowerCase() : ''} ${ch(op, prev.operating)}`],
    [cap ? money(cap.value) : '–', ahead ? `capital already approved for ${budYear} (multi-year projects)` : `capital budget${cap ? ', ' + (cap.status || '').toLowerCase() : ''} ${ch(cap, prev.capital)}`],
    [op && people ? '$' + fmt(op.value * 1e6 / people) : '–', `operating per resident (${fmt(people)} people, the City's estimate)`],
    [cap && people && !ahead ? '$' + fmt(cap.value * 1e6 / people) : '–', ahead ? 'per resident: not shown for a future year' : 'capital per resident'],
  ].map(([b, s]) => `<div class="istat"><b>${b}</b><span>${esc(s)}</span></div>`).join('');

  const bars = (sel, list) => {
    const top = Math.max(1, ...(list || []).map(d => d.value));
    $(sel).innerHTML = (list || []).map((d, i) => `<div class="cmp-bar bud-bar"><span class="cmp-bar-n">${i + 1}</span><span class="cmp-bar-l" title="${esc(d.name)}">${esc(d.name)}</span>
      <span class="cmp-bar-t"><span class="cmp-bar-f" style="left:0;width:${Math.max(.5, d.value / top * 100)}%"></span></span><span class="cmp-bar-v">${moneyShort(d.value)}</span></div>`).join('')
      || `<p class="card-sub">No ${sel === '#bud-op' ? 'operating' : 'capital'} budget is published for ${budYear}.</p>`;
  };
  const BD = BUD.by_department[budYear] || {};
  bars('#bud-op', BD.operating); bars('#bud-cap', BD.capital);
  $('#bud-op-title').textContent = `Operating budget by department, ${budYear}`;
  $('#bud-cap-title').textContent = `Capital budget by department, ${budYear}`;

  // year by year
  if (typeof Chart !== 'undefined') {
    if (budChart) budChart.destroy();
    budChart = new Chart($('#bud-trend'), {
      type: 'bar',
      data: { labels: years, datasets: [
        { label: 'Operating', data: years.map(y => (BUD.totals[y].operating || {}).value ?? null), backgroundColor: cssv('--chart-bar') },
        { label: 'Capital', data: years.map(y => (BUD.totals[y].capital || {}).value ?? null), backgroundColor: '#D9A93E' }] },
      options: { maintainAspectRatio: false, plugins: { tooltip: { callbacks: { label: c => `${c.dataset.label}: ${money(c.parsed.y)} (${(BUD.totals[c.label][c.dataset.label.toLowerCase()] || {}).status || ''})` } } },
        scales: { y: { ticks: { callback: v => moneyShort(v) } } } },
    });
  }
  $('#bud-trend-sub').textContent = 'Millions of dollars. Past years show what was approved or actually spent, as the City lists them. Years after 2026 have no budget yet: their capital is spending already approved in earlier budgets for multi-year projects, which is why it falls away; the proposed 2027 to 2030 budget would add to it.';

  // every service
  const rows = [];
  ['operating', 'capital'].forEach(k => (BD[k] || []).forEach(d => d.units.forEach(u => rows.push([k, d.name, u.name, u.value]))));
  $('#bud-table thead').innerHTML = '<tr><th scope="col">Budget</th><th scope="col">Department</th><th scope="col">Service (business unit)</th><th scope="col" class="num">Millions of dollars</th></tr>';
  $('#bud-table tbody').innerHTML = rows.map(r => `<tr><td>${r[0] === 'operating' ? 'Operating' : 'Capital'}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td class="num">${fmt(r[3], 1)}</td></tr>`).join('');
  $('#bud-table-sub').textContent = `${rows.length} lines for ${budYear}, as the City publishes them.`;
  renderPlan();
  renderRevenue();
  renderTax();
  renderBudgetWards();
  $('#bud-notes').innerHTML = `${esc(BUD.note)} Source: City of Calgary, <button class="link-btn small" data-open="${esc(BUD.page)}">Calgary Open Budget (${esc(BUD.dataset)})</button>, read ${esc(BUD.fetched || '')}; the City's <button class="link-btn small" data-open="${esc(BUD.budget_page)}">budget pages</button>.`;
}

// the proposed 2027-2030 budget: what it would cost a typical household, the tax path, water, investments, and the
// City's open data by department (data/budget_2027.json and nnnm-9sfh)
function renderPlan() {
  const P = BUD && BUD.plan_2027, O = BUD && BUD.proposed;
  $('#bud-plan-card').hidden = !P;
  if (!P) return;
  const d = s => new Date(s.length === 7 ? s + '-15T12:00:00' : s + 'T12:00:00').toLocaleDateString('en-CA', s.length === 7 ? { month: 'long', year: 'numeric' } : { month: 'long', day: 'numeric', year: 'numeric' });
  $('#bud-plan-sub').textContent = `${P.status} Council deliberations begin the week of November 23, 2026; approval is expected in December.`;
  const H = P.household, W = P.water_2027, T = P.tax_path;
  const cum = (T.pct.reduce((a, p) => a * (1 + p / 100), 1) - 1) * 100;
  const link = (u, t) => `<button class="link-btn small" data-open="${esc(u)}">${esc(t)}</button>`;
  const dep = O && O.by_department;
  const yrs = O ? O.years : [];
  const depNames = dep ? [...new Set(yrs.flatMap(y => ((dep[y] || {}).operating || []).map(x => x.name)))] : [];
  const opv = (y, n) => (((dep[y] || {}).operating || []).find(x => x.name === n) || {}).value;
  $('#bud-plan').innerHTML = `
    <div class="bud-plan-grid">
      <div><h3>What it would cost a typical home in 2027</h3>
        <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Each month</th><th scope="col" class="num">2026</th><th scope="col" class="num">2027 proposed</th><th scope="col" class="num">Change</th></tr></thead>
        <tbody>${H.lines.map(l => `<tr${l.item === 'Total' ? ' class="cmp-city-row"' : ''}><td>${l.item === 'Total' ? '<b>Total</b>' : esc(l.item)}</td><td class="num">$${fmt(l.m2026)}</td><td class="num">$${fmt(l.m2027)}</td><td class="num"><b>+$${fmt(l.change)}</b></td></tr>`).join('')}</tbody></table></div>
        <p class="card-sub">That is about $${fmt(H.lines[2].change * 12)} more a year. ${esc(H.basis)} Source: ${link(H.url, H.source)}.</p></div>
      <div><h3>Property tax, year by year</h3>
        <div class="bud-path">${T.years.map((y, i) => `<div class="istat"><b>+${fmt(T.pct[i], 1)}%</b><span>${y}${i ? ' (reported)' : ''}</span></div>`).join('')}</div>
        <p class="card-sub">If every year passes as proposed, the City would collect about ${fmt(cum, 0)}% more property tax from existing properties in 2030 than in 2026 (each year's increase compounds on the last). ${esc(T.source)} ${esc(T.context)}</p></div>
    </div>
    <h3>Water, wastewater and stormwater in 2027</h3>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Service (${esc(W.basis)})</th><th scope="col" class="num">2026 rate</th><th scope="col" class="num">2027 rate</th><th scope="col" class="num">Change</th><th scope="col" class="num">A month more</th><th scope="col" class="num">2027 a month</th></tr></thead>
      <tbody>${W.lines.map(l => `<tr><td>${esc(l.item)}</td><td class="num">${esc(l.rate2026)}</td><td class="num">${esc(l.rate2027)}</td><td class="num">+${fmt(l.pct, 1)}%</td><td class="num">+$${fmt(l.change, 2)}</td><td class="num">$${fmt(l.bill2027, 2)}</td></tr>`).join('')}
      <tr class="cmp-city-row"><td><b>Typical bill</b></td><td class="num">$${fmt(W.total.bill2026, 2)}</td><td class="num"></td><td class="num"><b>+${fmt(W.total.pct, 1)}%</b></td><td class="num"><b>+$${fmt(W.total.change, 2)}</b></td><td class="num"><b>$${fmt(W.total.bill2027, 2)}</b></td></tr></tbody></table></div>
    <p class="card-sub">${esc(W.four_year)} Source: ${link(W.url, W.source)}. Water rates were set by Council separately; the budget's household figure adds waste and recycling.</p>
    ${O ? `<h3>Operating budget by department, proposed</h3>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Department ($ millions, net of recoveries)</th>${yrs.map(y => `<th scope="col" class="num">${y}</th>`).join('')}</tr></thead>
      <tbody>${depNames.map(n => `<tr><td>${esc(n)}</td>${yrs.map(y => `<td class="num">${opv(y, n) != null ? fmt(opv(y, n), 0) : '–'}</td>`).join('')}</tr>`).join('')}
      <tr class="cmp-city-row"><td><b>Total operating</b></td>${yrs.map(y => `<td class="num"><b>${fmt(((O.totals[y] || {}).operating || {}).proposed, 0)}</b></td>`).join('')}</tr>
      <tr><td>Capital, new (proposed)</td>${yrs.map(y => `<td class="num">${fmt(((O.totals[y] || {}).capital || {}).proposed, 0)}</td>`).join('')}</tr>
      <tr><td>Capital, approved in earlier budgets</td>${yrs.map(y => `<td class="num">${fmt(((O.totals[y] || {}).capital || {}).approved, 0)}</td>`).join('')}</tr></tbody></table></div>
    <p class="card-sub">${esc(O.note)} ${esc(P.comparability)} Source: City of Calgary, ${link(O.page, 'open data: 2027–2030 Budget (' + O.dataset + ')')}${O.fetched ? ', read ' + esc(O.fetched) : ''}.</p>` : ''}
    <h3>What the money would buy (the City's highlights)</h3>
    <ul class="bud-inv">${P.investments.map(([g, a, w]) => `<li><b>${esc(a)}</b> ${esc(w)} <span class="card-sub">${esc(g)}</span></li>`).join('')}</ul>
    <p class="card-sub">Where 2027 revenue would come from: ${P.revenue_2027_pct.map(([n, p]) => `${esc(n)} ${p}%`).join(', ')}.</p>
    <p class="card-sub">Documents: ${P.documents.map(([t, u]) => link(u, t)).join(' · ')}. Have your say: written comments and registration to speak are open on the City's budget page. Figures as published by the City on ${esc(d(P.presented))}; they will change if Council amends the budget.</p>`;
}

// where the money comes from: operating revenue by source (the City's budget book)
function renderRevenue() {
  const R = BUD && BUD.revenue;
  $('#bud-rev-card').hidden = !R;
  if (!R) return;
  const yi = R.years.indexOf(budYear), i = yi >= 0 ? yi : R.years.length - 1, y = R.years[i];
  const total = R.total[i];
  const lines = R.lines.map(l => ({ ...l, v: l.values[i] })).sort((a, b) => b.v - a.v);
  $('#bud-rev-title').textContent = `Where the money comes from, ${y}`;
  $('#bud-rev-sub').textContent = `Operating revenue by source, $${fmt(total)} million in all (not counting $${fmt(R.reserve_withdrawal[i])} million drawn from reserves).${yi < 0 ? ` The budget book gives revenue to ${y}.` : ''}`;
  const top = Math.max(...lines.map(l => l.v));
  $('#bud-rev').innerHTML = lines.map((l, k) => `<div class="cmp-bar bud-bar${k === 0 ? ' main' : ''}"><span class="cmp-bar-n">${fmt(l.v / total * 100, 0)}%</span><span class="cmp-bar-l" title="${esc(l.note || l.name)}">${esc(l.name)}</span>
    <span class="cmp-bar-t"><span class="cmp-bar-f" style="left:0;width:${l.v / top * 100}%"></span></span><span class="cmp-bar-v">${moneyShort(l.v)}</span></div>`).join('');
  $('#bud-rev-table thead').innerHTML = `<tr><th scope="col">Source ($ millions)</th>${R.years.map(x => `<th scope="col" class="num">${x}</th>`).join('')}<th scope="col" class="num">Change ${R.years[R.years.length - 2]} to ${R.years[R.years.length - 1]}</th></tr>`;
  const ch = l => { const n = l.values.length; return signed((l.values[n - 1] / l.values[n - 2] - 1) * 100, 0); };
  $('#bud-rev-table tbody').innerHTML = R.lines.map(l => `<tr><td title="${esc(l.note || '')}">${esc(l.name)}</td>${l.values.map(v => `<td class="num">${fmt(v)}</td>`).join('')}<td class="num">${ch(l)}</td></tr>`).join('')
    + `<tr class="cmp-city-row"><td><b>Total operating revenue</b></td>${R.total.map(v => `<td class="num"><b>${fmt(v)}</b></td>`).join('')}<td class="num">${signed((R.total[R.total.length - 1] / R.total[R.total.length - 2] - 1) * 100, 0)}</td></tr>`;
  $('#bud-rev-note').innerHTML = `Source: ${esc(R.source)}. Figures are as the City published them, in millions, so a column can differ from its total by 1 through rounding. The City publishes revenue by source in its budget book, not in open data, so these figures are kept with Calgary Insight and updated with each budget. Of these sources, only property tax can be placed by ward (below); user fees, franchise fees, investment income, grants and the ENMAX dividend have no location. <button class="link-btn small" data-open="${esc(R.page)}">The City's budget pages</button>`;
}

// property tax by ward: an estimate from the assessment roll and the tax bylaw
let TAX = null;
async function renderTax() {
  const box = $('#bud-tax');
  if (!TAX) {
    try { const r = await (await api()).get_property_tax(false); if (!r.ok) throw new Error(r.error); TAX = r.data; }
    catch (e) { box.innerHTML = `<p class="card-sub">The property tax estimate could not be worked out: ${esc(e.message || e)}</p>`; return; }
  }
  const T = TAX, cityTot = T.city.total, city = isCity();
  const wardsRes = {}; ((D && D.wards_summary && D.wards_summary.wards) || (CMP && CMP.data && CMP.data.wards_summary && CMP.data.wards_summary.wards) || []).forEach(r => { wardsRes[r.ward] = r.residents; });
  const allRes = Object.values(wardsRes).reduce((a, b) => a + (b || 0), 0);
  $('#bud-tax-title').textContent = city ? `Property tax by ward, ${T.year} (estimate)` : `Property tax in ${W()}, ${T.year} (estimate)`;
  $('#bud-tax-sub').innerHTML = `The City does not publish property tax by ward. This estimates the tax <b>billed</b> (not collected) from every property's assessed value and the ${esc(T.bylaw)} rates. Calgary's total equals the bylaw's levy: <b>${money(cityTot / 1e6)}</b>, of which ${money(T.city.municipal.total / 1e6)} is City tax and ${money(T.city.education.total / 1e6)} is the Province's education tax.`;
  const pct = (a, b) => b ? fmt(a / b * 100, 1) + '%' : '–';
  if (city) {
    const rows = Object.entries(T.by_ward).map(([w, v]) => ({ w: +w, ...v })).sort((a, b) => a.w - b.w);
    box.innerHTML = `<div class="table-wrap"><table class="data"><thead><tr><th scope="col">Ward</th><th scope="col">Councillor</th><th scope="col" class="num">Property tax billed</th><th scope="col" class="num">City share</th><th scope="col" class="num">Education (Province)</th><th scope="col" class="num">Paid on homes</th><th scope="col" class="num">Per resident</th><th scope="col" class="num">Share of Calgary's tax</th><th scope="col" class="num">Share of its residents</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td>Ward ${r.w}</td><td>${esc(((T.wards || {})[r.w] || {}).councillor || '')}</td><td class="num">${money(r.total / 1e6)}</td><td class="num">${money(r.municipal / 1e6)}</td><td class="num">${money(r.education / 1e6)}</td><td class="num">${pct(r.residential, r.total)}</td><td class="num">${wardsRes[r.w] ? '$' + fmt(r.total / wardsRes[r.w]) : '–'}</td><td class="num">${pct(r.total, cityTot)}</td><td class="num">${allRes && wardsRes[r.w] ? pct(wardsRes[r.w], allRes) : '–'}</td></tr>`).join('')}
      ${(() => { const sum = k => rows.reduce((a, r) => a + (r[k] || 0), 0), left = cityTot - sum('total');
        return left > 1000 ? `<tr><td colspan="2">Not in any ward (land the City's ward table leaves out)</td><td class="num">${money(left / 1e6)}</td><td class="num">${money((T.city.municipal.total - sum('municipal')) / 1e6)}</td><td class="num">${money((T.city.education.total - sum('education')) / 1e6)}</td><td class="num"></td><td class="num"></td><td class="num">${pct(left, cityTot)}</td><td class="num"></td></tr>` : ''; })()}
      <tr class="cmp-city-row"><td><b>Calgary</b></td><td></td><td class="num"><b>${money(cityTot / 1e6)}</b></td><td class="num">${money(T.city.municipal.total / 1e6)}</td><td class="num">${money(T.city.education.total / 1e6)}</td><td class="num">${pct(T.city.municipal.residential + T.city.education.residential, cityTot)}</td><td class="num">${allRes ? '$' + fmt(cityTot / allRes) : '–'}</td><td class="num">100%</td><td class="num">100%</td></tr></tbody></table></div>
      ${taxRecon(T)}
      <p class="card-note"><b>City share</b> is the municipal tax the City keeps; the rest of each bill is the Province's education tax, which the City collects and passes to the Government of Alberta. <b>Paid on homes</b> is the share paid on residential property (houses, condos, rental buildings); the rest is business, industrial and other non-residential property, which pays about 4.6 times the residential City rate. Residents counted with ${esc(popWords())}.</p>`;
    return;
  }
  const mine = Object.entries(T.by_comm).filter(([, e]) => e.ward === SCOPE).map(([c, e]) => ({ c, ...e })).sort((a, b) => b.total - a.total);
  const wv = T.by_ward[String(SCOPE)] || { total: 0, municipal: 0, education: 0, residential: 0 };
  const res = D && D.ward ? D.ward.residents : null;
  const commRes = {}; (D.communities || []).forEach(c => { commRes[c.code] = c.residents; });
  box.innerHTML = `<div class="issue-stats">${[[money(wv.total / 1e6), `property tax billed in ${W()} (${pct(wv.total, cityTot)} of Calgary's)`], [money(wv.municipal / 1e6), 'of it City tax'], [res ? '$' + fmt(wv.total / res) : '–', 'per resident'], [pct(wv.residential, wv.total), 'paid on homes']].map(([b, s]) => `<div class="istat"><b>${b}</b><span>${esc(s)}</span></div>`).join('')}</div>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Community</th><th scope="col" class="num">Property tax billed</th><th scope="col" class="num">City share</th><th scope="col" class="num">Paid on homes</th><th scope="col" class="num">Per resident</th><th scope="col" class="num">Properties</th></tr></thead><tbody>
    ${mine.map(e => `<tr><td>${esc(titleCase(e.name || e.c))}</td><td class="num">${money(e.total / 1e6)}</td><td class="num">${money(e.municipal.total / 1e6)}</td><td class="num">${pct(e.municipal.residential + e.education.residential, e.total)}</td><td class="num">${commRes[e.c] ? '$' + fmt(e.total / commRes[e.c]) : '–'}</td><td class="num">${fmt(e.accounts)}</td></tr>`).join('')}</tbody></table></div>`;
}

// the City share placed in wards against the budget book's property tax revenue line
function taxRecon(T) {
  const R = BUD && BUD.revenue;
  const i = R ? R.years.indexOf(String(T.year)) : -1;
  const line = i >= 0 ? R.lines.find(l => /property tax/i.test(l.name)) : null;
  if (!line) return '';
  const placed = Object.values(T.by_ward || {}).reduce((a, w) => a + (w.municipal || 0), 0);
  const bud = line.values[i] * 1e6, gap = bud - placed;
  return `<div class="tax-recon"><div><b>${money(bud / 1e6)}</b><span>${esc(T.year)} budget: property tax revenue, including levies</span></div>
    <div><b>${money(placed / 1e6)}</b><span>City share billed under the tax bylaw, placed in the wards above (${fmt(placed / bud * 100, 1)}%)</span></div>
    <div><b>${money(gap / 1e6)}</b><span>Not placed by ward: local improvement and community revitalization levies, tax from properties added during the year, and ${money((T.city.municipal.total - placed) / 1e6)} billed on land outside the ward table</span></div></div>`;
}

// what can be placed in a ward: City projects and road projects with a stated cost
function renderBudgetWards() {
  const box = $('#bud-ward');
  if (!D) { box.innerHTML = ''; return; }
  const wardOf = {}; (D.communities || []).forEach(c => { wardOf[c.code] = c.ward; });
  // City budget spending only: projects the City (or its housing company) owns, and City road projects. Private and
  // other-government projects are on Growth vs amenities; they are not City spending.
  const cityOwned = p => /city of calgary|calgary housing company/i.test(p.owner || '');
  const items = [
    ...(D.projects || []).filter(p => p.state !== 'completed' && cityOwned(p)).map(p => ({ title: p.title, kind: p.kind || 'Project', owner: p.owner || '', cost: millions(p.budget), text: p.budget || '', comm: p.comm, url: p.url, state: p.state })),
    ...(D.roadwork || []).map(r => ({ title: r.title, kind: 'Road project', owner: 'City of Calgary', cost: millions(r.budget), text: r.budget || '', comm: r.comm, url: r.url, state: 'building' })),
  ];
  // a line that runs through several wards is not placed in one; a cost shared among several listed items ("Part of
  // $3.9 million") is not added once per item
  items.forEach(i => { i.multi = /green line/i.test(i.title); i.shared = /^\s*(about\s+)?part of/i.test(i.text); });
  const city = isCity();
  $('#bud-ward-title').textContent = city ? 'City projects by ward' : `${W()}: City projects that can be placed`;
  $('#bud-ward-sub').innerHTML = `<b>The City publishes its budget by department and service, not by ward.</b> What can be placed in ${city ? 'each ward' : esc(W())} is City of Calgary projects being built or planned, and City road projects, each with the whole project's published cost. That is usually spent over several years and often shared with the province or the federal government, so it is not a year's budget and is not divided per resident. Private and other-government projects are on Growth vs amenities.`;
  const withCost = items.filter(i => isNum(i.cost));
  const counted = withCost.filter(i => !i.multi && !i.shared);
  const multi = withCost.filter(i => i.multi);
  const shared = withCost.filter(i => i.shared);
  const extra = (multi.length ? `<p class="card-note">Not placed in a ward because it runs through several: ${multi.map(i => `${esc(i.title)} (${money(i.cost)})`).join('; ')}.</p>` : '')
    + (shared.length ? `<p class="card-note">${fmt(shared.length)} listed project${shared.length === 1 ? '' : 's'} share${shared.length === 1 ? 's' : ''} a cost published for several together (for example ${esc(shared[0].text)}); ${shared.length === 1 ? 'it is' : 'they are'} counted but not added to the totals.</p>` : '');
  if (city) {
    const byW = {};
    withCost.forEach(i => { if (i.multi) return; const w = wardOf[i.comm]; if (!w) return; const b = byW[w] = byW[w] || { n: 0, sum: 0 }; b.n++; if (!i.shared) b.sum += i.cost; });
    const ws = (D.wards_summary || {}).wards || [];
    box.innerHTML = `<div class="table-wrap"><table class="data"><thead><tr><th scope="col">Ward</th><th scope="col">Councillor</th><th scope="col" class="num">City projects with a published cost</th><th scope="col" class="num">Their whole cost</th></tr></thead><tbody>
      ${ws.map(r => { const b = byW[r.ward] || { n: 0, sum: 0 }; return `<tr><td>Ward ${r.ward}</td><td>${esc(r.councillor || '')}</td><td class="num">${fmt(b.n)}</td><td class="num">${b.sum ? money(b.sum) : '–'}</td></tr>`; }).join('')}
      </tbody></table></div>${extra}<p class="card-note">Only City projects listed on Calgary Insight with a published cost and a location. Large plants serve the whole city wherever they stand (for example the Fish Creek and Bonnybrook wastewater plants), and a ward with few listed may still have City spending: maintenance, services and programs are budgeted city-wide.</p>`;
    return;
  }
  box.innerHTML = withCost.length ? `<div class="table-wrap"><table class="data"><thead><tr><th scope="col">Project</th><th scope="col">Kind</th><th scope="col">Owner</th><th scope="col">Community</th><th scope="col" class="num">Published cost</th></tr></thead><tbody>
    ${withCost.sort((a, b) => b.cost - a.cost).map(i => `<tr><td class="wrap">${i.url ? `<button class="link-btn" data-open="${esc(i.url)}">${esc(i.title)}</button>` : esc(i.title)}${i.multi ? ' <small>(runs through several wards; not in the total)</small>' : ''}</td><td>${esc(i.kind)}</td><td>${esc(i.owner)}</td><td>${esc(i.comm ? commName(i.comm) : '')}</td><td class="num" title="${esc(i.text)}">${i.shared ? esc(i.text) : money(i.cost)}</td></tr>`).join('')}
    <tr class="cmp-city-row"><td colspan="4"><b>Total of the City costs published</b></td><td class="num"><b>${money(counted.reduce((a, i) => a + i.cost, 0))}</b></td></tr></tbody></table></div>
    ${shared.length ? `<p class="card-note">Costs shared among several items are shown as published and not added to the total.</p>` : ''}
    <p class="card-note">${fmt(items.length - withCost.length)} more City projects are listed without a published cost. Costs are each whole project's, as the City publishes them, often over several years and shared with other governments. Private and other-government projects are on Growth vs amenities.</p>`
    : `<p class="card-sub">No City project with a published cost is listed for ${esc(W())}.</p>`;
}

$('#bud-year').addEventListener('change', e => { budYear = e.target.value; renderBudget(); });
$('#bud-export').addEventListener('click', e => {
  if (!BUD) return;
  const BD = BUD.by_department[budYear] || {};
  const rows = [];
  ['operating', 'capital'].forEach(k => (BD[k] || []).forEach(d => d.units.forEach(u => rows.push([k === 'operating' ? 'Operating' : 'Capital', d.name, u.name, u.value]))));
  saveList(e.currentTarget, `City of Calgary budget ${budYear}`, ['Budget', 'Department', 'Service (business unit)', 'Millions of dollars'], rows);
});
window.renderBudget = renderBudget;

// ================================================================ LIVE CONNECTION TESTS
let LIVE = null, liveRunning = 0;
async function renderLive() {
  if (!LIVE) {
    try { LIVE = (await (await api()).live_sources()).map(s => ({ ...s, res: null })); } catch (e) { LIVE = []; }
  }
  const pill = r => !r ? '<span class="live-pill idle">Not tested</span>' : r.testing ? '<span class="live-pill run">Testing…</span>'
    : r.ok ? '<span class="live-pill ok">Live</span>' : '<span class="live-pill bad">No answer</span>';
  $('#live-table tbody').innerHTML = LIVE.map((s, i) => { const r = s.res;
    return `<tr><td>${esc(s.name)}${s.target ? `<small class="mono"> ${esc(s.target)}</small>` : ''}</td><td>${esc(s.publisher)}</td><td>${pill(r)}</td>
      <td class="num">${r && isNum(r.ms) ? fmt(r.ms) + ' ms' : ''}</td><td>${r && r.updated ? esc(r.updated) : ''}</td><td class="wrap live-detail">${r && r.detail ? esc(r.detail) : ''}</td>
      <td><button type="button" class="btn small" data-live="${i}" ${r && r.testing ? 'disabled' : ''}>Test</button></td></tr>`; }).join('');
  const done = LIVE.filter(s => s.res && !s.res.testing), ok = done.filter(s => s.res.ok).length;
  $('#live-sum').textContent = done.length ? `${ok} of ${done.length} tested answered live` : `${LIVE.length} sources`;
}
async function testLive(i) {
  const s = LIVE[i];
  s.res = { testing: true }; renderLive();
  try { s.res = await (await api()).test_source(s.key); } catch (e) { s.res = { ok: false, detail: String(e.message || e) }; }
  renderLive();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-live]');
  if (b) testLive(+b.dataset.live);
});
$('#live-all').addEventListener('click', async () => {
  if (liveRunning || !LIVE) return;
  liveRunning = 1;
  const queue = LIVE.map((_, i) => i);
  const worker = async () => { while (queue.length) await testLive(queue.shift()); };
  await Promise.all([worker(), worker(), worker(), worker()]);     // four at a time
  liveRunning = 0;
});
window.renderLive = renderLive;
