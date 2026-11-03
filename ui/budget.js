/* Calgary Data Desk: the City budget (live from Calgary Open Budget), and live connection tests for every source. */
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
  $('#bud-sub').textContent = `The City of Calgary's ${budYear} budget: ${[op ? (op.status || '').toLowerCase() + ' operating' : '', cap ? (cap.status || '').toLowerCase() + ' capital' : ''].filter(Boolean).join(' and ')}. Live from Calgary Open Budget.`;
  const prev = BUD.totals[String(+budYear - 1)] || {};
  const ch = (a, b) => a && b && b.value ? signed((a.value / b.value - 1) * 100, 1) + ' on ' + (+budYear - 1) : '';
  $('#bud-stats').innerHTML = [
    [op ? money(op.value) : '–', `operating budget${op ? ', ' + (op.status || '').toLowerCase() : ''} ${ch(op, prev.operating)}`],
    [cap ? money(cap.value) : '–', `capital budget${cap ? ', ' + (cap.status || '').toLowerCase() : ''} ${ch(cap, prev.capital)}`],
    [op && people ? '$' + fmt(op.value * 1e6 / people) : '–', `operating per resident (${fmt(people)} people, the City's estimate)`],
    [cap && people ? '$' + fmt(cap.value * 1e6 / people) : '–', 'capital per resident'],
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
  $('#bud-trend-sub').textContent = 'Millions of dollars. Past years show what was approved or actually spent, as the City lists them; capital years ahead are what Council has approved so far.';

  // every service
  const rows = [];
  ['operating', 'capital'].forEach(k => (BD[k] || []).forEach(d => d.units.forEach(u => rows.push([k, d.name, u.name, u.value]))));
  $('#bud-table thead').innerHTML = '<tr><th scope="col">Budget</th><th scope="col">Department</th><th scope="col">Service (business unit)</th><th scope="col" class="num">Millions of dollars</th></tr>';
  $('#bud-table tbody').innerHTML = rows.map(r => `<tr><td>${r[0] === 'operating' ? 'Operating' : 'Capital'}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td class="num">${fmt(r[3], 1)}</td></tr>`).join('');
  $('#bud-table-sub').textContent = `${rows.length} lines for ${budYear}, as the City publishes them.`;
  renderRevenue();
  renderTax();
  renderBudgetWards();
  $('#bud-notes').innerHTML = `${esc(BUD.note)} Source: City of Calgary, <button class="link-btn small" data-open="${esc(BUD.page)}">Calgary Open Budget (${esc(BUD.dataset)})</button>, read ${esc(BUD.fetched || '')}; the City's <button class="link-btn small" data-open="${esc(BUD.budget_page)}">budget pages</button>.`;
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
  $('#bud-rev-note').innerHTML = `Source: ${esc(R.source)}. The City publishes revenue by source in its budget book, not in open data, so these figures are kept with the app and updated with each budget. Of these sources, only property tax can be placed by ward (below); user fees, franchise fees, investment income, grants and the ENMAX dividend have no location. <button class="link-btn small" data-open="${esc(R.page)}">The City's budget pages</button>`;
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
  const bud = line.values[i] * 1e6, placed = T.city.municipal.total, gap = bud - placed;
  return `<div class="tax-recon"><div><b>${money(bud / 1e6)}</b><span>${esc(T.year)} budget: property tax revenue, including levies</span></div>
    <div><b>${money(placed / 1e6)}</b><span>City share billed under the tax bylaw, placed in the wards above (${fmt(placed / bud * 100, 1)}%)</span></div>
    <div><b>${money(gap / 1e6)}</b><span>Not placed by ward: local improvement and community revitalization levies, and tax from properties added during the year</span></div></div>`;
}

// what can be placed in a ward: City projects and road projects with a stated cost
function renderBudgetWards() {
  const box = $('#bud-ward');
  if (!D) { box.innerHTML = ''; return; }
  const wardOf = {}; (D.communities || []).forEach(c => { wardOf[c.code] = c.ward; });
  const items = [
    ...(D.projects || []).filter(p => p.state !== 'completed').map(p => ({ title: p.title, kind: p.kind || 'Project', owner: p.owner || '', cost: millions(p.budget), text: p.budget || '', comm: p.comm, url: p.url, state: p.state })),
    ...(D.roadwork || []).map(r => ({ title: r.title, kind: 'Road project', owner: 'City of Calgary', cost: millions(r.budget), text: r.budget || '', comm: r.comm, url: r.url, state: 'building' })),
  ];
  const city = isCity();
  $('#bud-ward-title').textContent = city ? 'By ward' : `${W()}: spending that can be placed`;
  $('#bud-ward-sub').innerHTML = `<b>The City publishes its budget by department and service, not by ward.</b> What can be placed in ${city ? 'each ward' : esc(W())} is spending tied to a location: City and partner projects being built or planned, and road projects, each with the cost its owner has published.`;
  const withCost = items.filter(i => isNum(i.cost));
  if (city) {
    const byW = {};
    withCost.forEach(i => { const w = wardOf[i.comm]; if (!w) return; const b = byW[w] = byW[w] || { n: 0, sum: 0 }; b.n++; b.sum += i.cost; });
    const ws = (D.wards_summary || {}).wards || [];
    box.innerHTML = `<div class="table-wrap"><table class="data"><thead><tr><th scope="col">Ward</th><th scope="col">Councillor</th><th scope="col" class="num">Projects with a published cost</th><th scope="col" class="num">Their cost</th><th scope="col" class="num">Per resident</th></tr></thead><tbody>
      ${ws.map(r => { const b = byW[r.ward] || { n: 0, sum: 0 }; return `<tr><td>Ward ${r.ward}</td><td>${esc(r.councillor || '')}</td><td class="num">${fmt(b.n)}</td><td class="num">${b.n ? money(b.sum) : '–'}</td><td class="num">${b.n && r.residents ? '$' + fmt(b.sum * 1e6 / r.residents) : '–'}</td></tr>`; }).join('')}
      </tbody></table></div><p class="card-note">Only projects listed in the app with a published cost and a location; a ward with none listed may still have City spending (maintenance, services and programs are budgeted city-wide).</p>`;
    return;
  }
  box.innerHTML = withCost.length ? `<div class="table-wrap"><table class="data"><thead><tr><th scope="col">Project</th><th scope="col">Kind</th><th scope="col">Owner</th><th scope="col">Community</th><th scope="col" class="num">Published cost</th></tr></thead><tbody>
    ${withCost.sort((a, b) => b.cost - a.cost).map(i => `<tr><td class="wrap">${i.url ? `<button class="link-btn" data-open="${esc(i.url)}">${esc(i.title)}</button>` : esc(i.title)}</td><td>${esc(i.kind)}</td><td>${esc(i.owner)}</td><td>${esc(i.comm ? commName(i.comm) : '')}</td><td class="num" title="${esc(i.text)}">${money(i.cost)}</td></tr>`).join('')}
    <tr class="cmp-city-row"><td colspan="4"><b>Total of the costs published</b></td><td class="num"><b>${money(withCost.reduce((a, i) => a + i.cost, 0))}</b></td></tr></tbody></table></div>
    <p class="card-note">${fmt(items.length - withCost.length)} more projects are listed without a published cost (see Growth and amenities, Being built). Costs are as their owners publish them, often over several years and shared with other governments.</p>`
    : `<p class="card-sub">No project with a published cost is listed for ${esc(W())}.</p>`;
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
