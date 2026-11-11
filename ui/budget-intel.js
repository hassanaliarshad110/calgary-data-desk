/* Calgary Insight: Budget Intelligence & Accountability Centre (view-budget-intelligence).

   One screen that brings together what the site already refreshes every morning (the City's open budget, revenue,
   property tax by ward, the City's performance measures, infrastructure condition) with every business case in the
   City's "2027-2030 budget request business cases" (ui/budget-intel/business-cases.json, read from the City's PDF by
   tools/budget_intel_extract.py). Nothing here replaces the City budget screen; it reads the same data through the same
   bridge (get_budget, get_property_tax, get_accountability, get_infra, compare_wards).

   Rules kept throughout: every figure carries what kind of figure it is (approved, actual, proposed, reported,
   calculated, hypothetical); a figure the City has not published is shown as "not published", never as zero; nothing
   citywide is divided among wards or communities; sums are shown with what was added. */
(() => {
  'use strict';
  const DOC = 'https://www.calgary.ca/content/dam/www/ca/city-manager/documents/2027-2030-budget/2027-2030-operating-capital-budget-requests.pdf';
  const Y4 = ['2027', '2028', '2029', '2030'];
  const SECTIONS = [
    ['overview', 'Overview', 'dashboard'], ['operating', 'Operating', 'coins'], ['capital', 'Capital', 'crane'], ['revenue', 'Revenue and tax', 'budget'],
    ['actual', 'Budget vs actual', 'compare'], ['cases', 'Business cases', 'file'], ['projects', 'Capital projects', 'cone'],
    ['performance', 'Performance', 'activity'], ['simulator', 'Tax simulator', 'sliders'], ['links', 'Connected data', 'layers'], ['checks', 'Data checks', 'check'],
  ];
  const S = {
    sec: 'overview', loading: null, BUD: null, TAX: null, CMP: null, ACC: null, INF: null, BC: null, XW: null, err: {},
    layer: 'tax', charts: {}, map: null, opYear: '2026', capYear: '2027', revYear: '2026',
    f: { q: '', type: '', theme: '', dept: '', ward: '', rationale: '', risk: '', stage: '', fund: '', flag: '', sort: 'n' }, open: null, page: 0, checks: null,
  };
  const PAGE = 25;

  // ---------------------------------------------------------------- small helpers
  const sum = a => (a || []).reduce((x, y) => x + (y || 0), 0);
  const usd = m => !isNum(m) ? '–' : Math.abs(m) >= 1000 ? `$${fmt(m / 1000, 2)} billion` : Math.abs(m) >= 1 ? `$${fmt(m, 1)} million` : m === 0 ? '$0' : `$${fmt(Math.round(m * 1e6))}`;
  const usdS = m => !isNum(m) ? '–' : Math.abs(m) >= 1000 ? `$${fmt(m / 1000, 2)}B` : Math.abs(m) >= 100 ? `$${fmt(m, 0)}M` : `$${fmt(m, 1)}M`;
  const usdZ = m => m ? usdS(m) : '–';
  const share = (a, b, d = 0) => b ? fmt(a / b * 100, d) + '%' : '–';
  const st = (kind, text) => `<span class="bi-st ${kind}">${esc(text)}</span>`;
  const ST = { Approved: 'approved', Actual: 'actual', Proposed: 'proposed' };
  const dash = v => v === null || v === undefined ? '–' : fmt(v, Number.isInteger(v) ? 0 : 1);
  // a link is only ever made to a web address (http or https) or to a page of this site; anything else in a data file is shown as plain text
  const safeUrl = u => { const t = String(u === null || u === undefined ? '' : u).trim(); return /^https?:\/\/[^\s"'<>]+$/i.test(t) || /^[A-Za-z0-9_.~\/?#=&%-]+$/.test(t) && !/^[a-z][a-z0-9+.-]*:/i.test(t) ? t : ''; };
  const src = (label, url) => safeUrl(url) ? `<a href="${esc(safeUrl(url))}" target="_blank" rel="noopener">${esc(label)}</a>` : esc(label);
  const pageLink = (p, text) => `<a class="bi-read" href="${DOC}#page=${p}" target="_blank" rel="noopener">${icon('open')}<span>${esc(text)}</span></a>`;
  const css = n => getComputedStyle($('#view-budget-intelligence .bi') || document.documentElement).getPropertyValue(n).trim();
  const series = i => css('--bi-s' + (i + 1));
  const empty = (what, why) => `<div class="bi-empty"><b>${esc(what)}</b><br>${esc(why || '')}</div>`;
  const bars = (rows, opt = {}) => {                 // rows: [label, value, sublabel?, onclick-id?, [parts]]
    const top = Math.max(1e-9, ...rows.map(r => r[1] || 0));
    return `<div class="bi-bars">${rows.map(r => `<div class="bi-bar">${r[3] ? `<button type="button" class="b-l" data-case="${r[3]}" title="${esc(r[0])}">${esc(r[0])}</button>` : `<span class="b-l" title="${esc(r[0])}">${esc(r[0])}</span>`}
      <span class="b-v">${(opt.f || usdS)(r[1])}</span><span class="b-t">${(r[4] || [[r[1], opt.color]]).map(p => `<i style="width:${Math.max(.6, p[0] / top * 100)}%;${p[1] ? `--bc:${p[1]}` : ''}"></i>`).join('')}</span>${r[2] ? `<span class="b-s">${r[2]}</span>` : ''}</div>`).join('')}</div>`;
  };
  const kill = k => { if (S.charts[k]) { S.charts[k].destroy(); delete S.charts[k]; } };
  const chart = (k, el, cfg) => { kill(k); if (typeof Chart === 'undefined' || !el) return null; if (typeof chartTheme === 'function') chartTheme(); S.charts[k] = new Chart(el, cfg); return S.charts[k]; };

  // names as the City prints them -> the City's open-data names (ui/budget-intel/crosswalk.json)
  const deptKey = d => ((S.XW && S.XW.departments[d]) || {}).open_data || d;
  const deptLabel = d => ((S.XW && S.XW.departments[d]) || {}).label || deptKey(d);          // how the centre names it in lists
  const budDept = d => (S.XW && S.XW.budget_departments[deptKey(d)]) || deptKey(d);
  const buKey = b => ((S.XW && S.XW.business_units[b]) || {}).open_data || b;
  const ratKey = r => ((S.XW && S.XW.rationales[r]) || {}).same_as || r;
  const capOf = c => c.type === 'capital' ? (c.cap_k[0] || 0) / 1000 : 0;          // $ millions, the City's four-year consideration (with 2031 and later)
  const oneOf = c => c.type === 'operating' ? sum(c.one_time_m) : 0;
  const ongOf = c => c.type === 'operating' ? sum(c.ongoing_m) : 0;
  const fteOf = c => c.type === 'operating' ? sum(c.ftes) : 0;
  const cases = () => (S.BC && S.BC.cases) || [];

  // ---------------------------------------------------------------- data
  async function getStatic(path) {
    const r = await fetch(path, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`${path} could not be read (${r.status})`);
    return r.json();
  }
  async function load() {
    if (S.loading) return S.loading;
    S.loading = (async () => {
      const a = await api();
      const want = {
        BUD: () => a.get_budget().then(r => { if (!r.ok) throw new Error(r.error); return r.data; }),
        TAX: () => a.get_property_tax().then(r => { if (!r.ok) throw new Error(r.error); return r.data; }),
        CMP: () => a.compare_wards().then(r => { if (!r.ok) throw new Error(r.error); return r; }),
        BC: () => getStatic('budget-intel/business-cases.json'),
        XW: () => getStatic('budget-intel/crosswalk.json'),
      };
      await Promise.all(Object.entries(want).map(([k, fn]) => fn().then(v => { S[k] = v; }).catch(e => { S.err[k] = String((e && e.message) || e); })));
    })();
    return S.loading;
  }
  async function lazy(k) {                           // the larger files, read only when their section is opened
    if (S[k] || S.err[k]) return;
    try {
      const a = await api();
      const r = k === 'ACC' ? await a.get_accountability() : await a.get_infra();
      if (!r.ok) throw new Error(r.error);
      S[k] = r.data;
    } catch (e) { S.err[k] = String((e && e.message) || e); }
  }

  // ---------------------------------------------------------------- frame
  function rail() {
    const n = cases().length;
    $('#bi-rail').innerHTML = `<div class="bi-rail-h">The centre</div>` + SECTIONS.map(([k, label, ic]) =>
      `<button type="button" role="radio" data-sec="${k}" aria-checked="${k === S.sec}" tabindex="${k === S.sec ? 0 : -1}">${icon(ic)}<span>${label}</span>${k === 'cases' && n ? `<b>${n}</b>` : ''}</button>`).join('');
  }
  function go(sec, keep) {
    if (!SECTIONS.some(s => s[0] === sec)) sec = 'overview';
    S.sec = sec;
    try { const u = new URL(location.href); if (sec === 'overview') u.searchParams.delete('bi'); else u.searchParams.set('bi', sec); history.replaceState(null, '', u.pathname + u.search + u.hash); } catch (e) { /* the address stays */ }
    Object.keys(S.charts).forEach(kill);
    if (S.map) { S.map.remove(); S.map = null; }
    rail();
    const main = $('#bi-main');
    main.innerHTML = '';
    const fail = e => { main.innerHTML = `<section class="card">${empty('This section could not be drawn', String((e && e.message) || e))}</section>`; };
    try { const r = ({ overview, operating, capital, revenue, actual, cases: casesView, projects, performance, simulator, links, checks })[sec](main); if (r && r.catch) r.catch(fail); } catch (e) { fail(e); }
    if (!keep) { const v = $('#view-budget-intelligence'); if (v && v.scrollTo) v.scrollTo({ top: 0 }); }
    const cur = $('#bi-rail [aria-checked="true"]'); if (cur && cur.scrollIntoView && window.innerWidth <= 980) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  function header() {
    const b = S.BUD, bits = [];
    if (b && b.fetched) bits.push(`City open budget read ${stampText(b.fetched)}`);
    if (S.BC) bits.push(`business cases read ${longDate(S.BC.source.read)}`);
    $('#bi-fresh').textContent = bits.join(' · ') || 'Loading';
    const errs = Object.entries(S.err).filter(([k]) => ['BUD', 'BC', 'XW'].includes(k));
    $('#bi-error').hidden = !errs.length;
    if (errs.length) $('#bi-error').textContent = 'Part of the centre could not be loaded, so the sections that need it show what is missing: ' + errs.map(([k, v]) => ({ BUD: 'the City budget', BC: 'the business cases', XW: 'the names crosswalk' })[k] + ' (' + v + ')').join('; ');
  }

  // ---------------------------------------------------------------- figures used in several places
  function fig() {
    const b = S.BUD, P = b && b.proposed, T = b && b.totals;
    const o = {};
    if (T) {
      o.op26 = (T['2026'] || {}).operating; o.cap26 = (T['2026'] || {}).capital;
    }
    if (P) {
      const pt = y => (P.totals || {})[y] || {};
      o.op27 = (pt('2027').operating || {}).proposed;
      o.capProp = sum(Y4.map(y => (pt(y).capital || {}).proposed));
      o.capAppr = sum(Y4.map(y => (pt(y).capital || {}).approved));
      o.capPropY = Y4.map(y => (pt(y).capital || {}).proposed || 0);
    }
    const C = cases(), cap = C.filter(c => c.type === 'capital'), op = C.filter(c => c.type === 'operating');
    o.nCap = cap.length; o.nOp = op.length;
    o.bcCap = sum(cap.map(capOf)); o.bcCapY = [1, 2, 3, 4].map(i => sum(cap.map(c => c.cap_k[i])) / 1000); o.bcCapLater = sum(cap.map(c => c.cap_k[5])) / 1000;
    o.bcOne = sum(op.map(oneOf)); o.bcOng = [0, 1, 2, 3].map(i => sum(op.map(c => c.ongoing_m[i]))); o.bcFte = [0, 1, 2, 3].map(i => sum(op.map(c => c.ftes[i])));
    o.split = [0, 1, 2, 3].map(i => sum(cap.map(c => c.cap_k[0] * c.split[i] / 100)) / 1000);
    return o;
  }

  // ================================================================ OVERVIEW
  function overview(main) {
    const b = S.BUD, F = fig(), plan = b && b.plan_2027, today = new Date().toISOString().slice(0, 10);
    const sched = (plan && plan.schedule) || [];
    const nextI = sched.findIndex(s => (s.when.length === 7 ? s.when + '-31' : s.when) >= today);
    const stage = sched.length ? `<div class="bi-stage">${sched.map((s, i) => `<div class="${nextI === -1 || i < nextI ? 'done' : i === nextI ? 'next' : ''}"><b>${esc(s.when.length === 7 ? new Date(s.when + '-15T12:00:00').toLocaleDateString('en-CA', { month: 'long', year: 'numeric' }) : longDate(s.when))}</b>${esc(s.what)}</div>`).join('')}</div>` : '';
    const hh = plan && plan.household && plan.household.lines.find(l => l.item === 'Total');
    const k = (label, value, note, status, color) => `<div class="bi-kpi" style="--kc:${color || 'var(--accent)'}"><div class="k-l"><span>${label}</span>${status || ''}</div><div class="k-v">${value}</div><div class="k-n">${note}</div></div>`;
    const kpis = [];
    if (F.op26) kpis.push(k('Operating budget, 2026', usdS(F.op26.value), 'Day-to-day services, net of recoveries. City open budget.', st(ST[F.op26.status] || 'estimate', F.op26.status), series(0)));
    if (F.cap26) kpis.push(k('Capital budget, 2026', usdS(F.cap26.value), 'Building and replacing things that last. City open budget.', st(ST[F.cap26.status] || 'estimate', F.cap26.status), series(0)));
    if (isNum(F.op27)) kpis.push(k('Operating, 2027', usdS(F.op27), 'Counted differently from 2026 by the City, so the two are not compared here.', st('proposed', 'Proposed'), series(1)));
    if (isNum(F.capProp)) kpis.push(k('New capital, 2027–2030', usdS(F.capProp), `Plus ${usdS(F.capAppr)} that Council approved in earlier budgets for the same years.`, st('proposed', 'Proposed'), series(1)));
    if (plan) kpis.push(k('Property tax revenue, 2027', `+${fmt(plan.headline.tax_revenue_increase_2027_pct)}%`, 'Increase required from existing properties, as the City states it.', st('proposed', 'Proposed'), series(7)));
    if (hh) kpis.push(k('Typical home, a month', `$${fmt(hh.m2026)} <small>→</small> $${fmt(hh.m2027)}`, 'Property tax, water and waste, 2026 to 2027. The City’s estimate.', st('estimate', 'City estimate'), series(7)));
    if (S.BC) kpis.push(k('Business cases', fmt(cases().length), `${fmt(F.nOp)} operating and ${fmt(F.nCap)} capital requests, each with its page in the City’s document.`, st('proposed', 'Proposed'), series(2)));
    if (S.BC) kpis.push(k('New positions, 2027', fmt(F.bcFte[0]), `Full-time equivalents in the operating requests; ${fmt(sum(F.bcFte))} when the four years’ figures are added.`, st('proposed', 'Proposed'), series(2)));

    const top = cases().filter(c => c.type === 'capital').sort((a, c) => capOf(c) - capOf(a)).slice(0, 8);
    const themes = (S.BC ? S.BC.themes : []).map(t => [t, sum(cases().filter(c => c.theme === t).map(capOf)), cases().filter(c => c.theme === t).length, cases().filter(c => c.theme === t && c.type === 'capital').length]);
    main.innerHTML = `
      <section class="card"><div class="card-head"><div><h2>Where the City’s money is going, and what is still to be decided</h2>
        <p class="card-sub">${plan ? esc(plan.status) : 'The proposed 2027–2030 budget'}</p></div></div>
        <p class="bi-lead">Calgary’s Council is deciding a four-year budget. This centre shows <b>what is approved</b>, <b>what was actually spent</b> where the City publishes it, and <b>what is only proposed</b>, each marked as such, with every one of the ${S.BC ? fmt(cases().length) : ''} requests behind the proposal and the page of the City’s document it comes from.</p>
        ${stage}</section>
      <div class="bi-kpis">${kpis.join('') || empty('The figures could not be loaded', S.err.BUD)}</div>
      <div class="bi-cmd">
        <section class="card"><div class="card-head"><div><h2>Map layers</h2><p class="card-sub">By ward. Citywide spending is never divided among wards.</p></div></div>
          <div class="bi-layers" id="bi-layers" role="radiogroup" aria-label="What the map shows"></div></section>
        <section class="card"><div class="card-head"><div><h2 id="bi-map-title">Calgary’s 14 wards</h2><p class="card-sub" id="bi-map-sub"></p></div></div>
          <div class="bi-map" id="bi-map" role="img" aria-label="Map of Calgary’s wards, shaded by the chosen layer"></div>
          <div class="bi-legend" id="bi-legend"></div><div id="bi-map-table"></div></section>
        <div class="bi-side">
          <section class="card"><div class="card-head"><div><h2>What the new capital is for</h2><p class="card-sub">The City’s own split of each capital request, weighted by its dollars</p></div></div>
            ${S.BC ? `<div class="bi-donut"><canvas id="bi-split" role="img" aria-label="New capital by purpose"></canvas><div class="mid"><b>${usdS(F.bcCap)}</b><span>${fmt(F.nCap)} capital requests</span></div></div>
            <ul class="bi-key">${['Maintenance, replacement', 'Growth', 'Service enhancement', 'Transformative'].map((n, i) => `<li><i style="background:${series(i)}"></i><span>${n}</span><b>${usdS(F.split[i])}</b><em>${share(F.split[i], sum(F.split))}</em></li>`).join('')}</ul>
            <p class="bi-src">${st('calc', 'Calculated')} Each request’s four-year amount times the City’s percentage for each purpose, added up.</p>` : empty('Business cases not loaded', S.err.BC)}</section>
          <section class="card"><div class="card-head"><div><h2>Why each request is made</h2><p class="card-sub">The City’s stated reason, all ${fmt(cases().length)} requests</p></div></div>
            ${S.BC ? bars(Object.entries(cases().reduce((m, c) => { const r = ratKey(c.rationale); m[r] = (m[r] || 0) + 1; return m; }, {})).sort((a, c) => c[1] - a[1]).map(([n, v]) => [n, v]), { f: v => fmt(v), color: series(2) }) : ''}</section>
        </div>
      </div>
      <div class="bi-three">
        <section class="card"><div class="card-head"><div><h2>Largest capital requests</h2><p class="card-sub">Four-year amount proposed. Select one to open it.</p></div></div>
          ${top.length ? bars(top.map(c => [c.title, capOf(c), esc(c.bu) + (c.wards === 'all' ? ' · all wards' : ' · ward ' + c.wards.join(', ')), c.n])) : empty('Business cases not loaded', S.err.BC)}</section>
        <section class="card"><div class="card-head"><div><h2>New capital by Council priority</h2><p class="card-sub">The six priorities the City files every request under</p></div></div>
          ${themes.length ? bars(themes.sort((a, c) => c[1] - a[1]).map(t => [t[0], t[1], `${fmt(t[3])} capital requests (and ${fmt(t[2] - t[3])} operating, not in the bar)`]), { color: series(0) }) : ''}</section>
        <section class="card"><div class="card-head"><div><h2>Checks on the data</h2><p class="card-sub">Run on today’s figures in your browser</p></div><div class="card-tools"><button type="button" class="link-btn small" data-sec="checks">All checks</button></div></div>
          <div class="bi-alerts" id="bi-alerts"></div></section>
      </div>
      <p class="notes">Sources: ${b ? src('City of Calgary open budget, 2023–2026 (' + b.dataset + ')', b.page) + ' · ' + src('2027–2030 Budget open data (' + b.proposed.dataset + ')', b.proposed.page) + ' · ' : ''}${src('2027–2030 budget request business cases (PDF, 792 pages)', DOC)}. Calgary Insight is independent and not affiliated with The City of Calgary.</p>`;
    if (S.BC) chart('split', $('#bi-split'), { type: 'doughnut', data: { labels: ['Maintenance or replacement', 'Growth', 'Service enhancement', 'Transformative'], datasets: [{ data: F.split.map(v => Math.round(v * 10) / 10), backgroundColor: [0, 1, 2, 3].map(series), borderColor: cssv('--card'), borderWidth: 2 }] },
      options: { maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.label}: ${usd(c.parsed)}` } } } } });
    const A = runChecks().filter(c => c.res !== 'pass').slice(0, 4);
    const passed = runChecks().filter(c => c.res === 'pass').length;
    $('#bi-alerts').innerHTML = `<div class="bi-alert ok">${icon('check')}<div><b>${fmt(passed)} of ${fmt(runChecks().length)} checks passed</b><span>Totals add up, and the business cases match the City’s open data.</span></div></div>`
      + A.map(c => `<div class="bi-alert ${c.res}">${icon(c.res === 'gap' ? 'alert' : 'info')}<div><b>${esc(c.title)}</b><span>${esc(c.short)}</span></div></div>`).join('');
    mapLayers();
  }

  // ---------------------------------------------------------------- the ward map
  const LAYERS = {
    tax: { name: 'Property tax levied, 2026', sub: 'Municipal tax on all property in the ward', status: ['calc', 'Calculated from the tax roll'], unit: v => usdS(v / 1e6),
      note: 'The City’s 2026 municipal tax rates applied to every assessed property, added by ward. Downtown wards carry most business property.',
      val: w => { const t = S.TAX && S.TAX.by_ward[w]; return t ? t.municipal : null; } },
    people: { name: 'Residents', sub: 'How many people live in the ward', status: ['estimate', 'Estimate'], unit: v => fmt(v),
      note: 'Calgary Insight’s estimate for today, which adds up to the City’s own population figure.',
      val: w => { const r = wardRow(w); return r ? r.residents : null; } },
    infra: { name: 'Infrastructure reports to 311', sub: 'Roads, sidewalks, lights, water, sewer: last 12 months', status: ['actual', 'Counted'], unit: v => fmt(v),
      note: 'Reports made by residents. A report is not a confirmed failure, and wards with more people make more reports.',
      val: w => { const r = wardRow(w); return r ? r.infra12 : null; } },
    cases: { name: 'Capital requests naming the ward', sub: 'Proposed requests that list this ward', status: ['proposed', 'Proposed'], unit: v => fmt(v),
      note: 'Most new capital (see below) is for all wards and is not placed anywhere. A request that names several wards is counted in each, and its dollars are not divided.',
      val: w => cases().filter(c => c.type === 'capital' && Array.isArray(c.wards) && c.wards.includes(+w)).length },
  };
  const wardRow = w => ((((S.CMP || {}).data || {}).wards_summary || {}).wards || []).find(r => String(r.ward) === String(w));
  function mapLayers() {
    $('#bi-layers').innerHTML = Object.entries(LAYERS).map(([k, L]) => `<label><input type="radio" name="bi-layer" value="${k}" ${k === S.layer ? 'checked' : ''}><span>${L.name}<small>${L.sub}</small></span></label>`).join('');
    drawMap();
  }
  function mix(a, b, t) {
    const h = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)), A = h(a), B = h(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  function drawMap() {
    const L0 = LAYERS[S.layer], geo = S.CMP && S.CMP.wards_geo, box = $('#bi-map');
    if (!box) return;
    $('#bi-map-title').innerHTML = `${esc(L0.name)} ${st(L0.status[0], L0.status[1])}`;
    $('#bi-map-sub').textContent = L0.note;
    const ws = Array.from({ length: 14 }, (_, i) => String(i + 1));
    const vals = ws.map(w => L0.val(w));
    const have = vals.filter(v => isNum(v) && v > 0), lo = Math.min(...have), hi = Math.max(...have);
    const colour = v => !isNum(v) || v <= 0 ? css('--bi-map-none') : mix(css('--bi-map-lo'), css('--bi-map-hi'), hi > lo ? (v - lo) / (hi - lo) : 1);
    $('#bi-legend').innerHTML = have.length ? `<span>${L0.unit(lo)}</span><i></i><span>${L0.unit(hi)}</span><u>none or not published</u>` : '';
    const rows = ws.map((w, i) => [w, vals[i]]).sort((a, c) => (c[1] || 0) - (a[1] || 0));
    $('#bi-map-table').innerHTML = `<details class="bi-acc" style="margin-top:10px"><summary><span class="link-btn small">Show these figures as a table</span></summary><div class="table-wrap"><table class="data"><thead><tr><th scope="col">Ward</th><th scope="col">Councillor</th><th scope="col" class="num">${esc(L0.name)}</th></tr></thead><tbody>
      ${rows.map(([w, v]) => `<tr><td>Ward ${w}</td><td>${esc((wardRow(w) || {}).councillor || '')}</td><td class="num">${isNum(v) && v > 0 ? L0.unit(v) : '<span class="bi-na">none</span>'}</td></tr>`).join('')}</tbody></table></div></details>`;
    if (S.layer === 'cases') {
      const cap = cases().filter(c => c.type === 'capital'), all = cap.filter(c => c.wards === 'all'), named = cap.filter(c => c.wards !== 'all'), one = named.filter(c => c.wards.length === 1);
      $('#bi-map-table').insertAdjacentHTML('afterbegin', `<p class="card-note"><b>${usd(sum(all.map(capOf)))}</b> of the ${usd(sum(cap.map(capOf)))} in new capital (${fmt(all.length)} requests) is for all wards. ${fmt(named.length)} requests name wards (${usd(sum(named.map(capOf)))}); ${fmt(one.length)} of those name a single ward (${usd(sum(one.map(capOf)))}).</p>`);
    }
    if (!geo || typeof L === 'undefined') { box.innerHTML = empty('The ward map could not be drawn', S.err.CMP || 'The ward boundaries were not loaded. The figures are in the table below.'); return; }
    if (S.map) { S.map.remove(); S.map = null; }
    box.innerHTML = '';
    const m = S.map = L.map(box, { zoomControl: true, attributionControl: false, scrollWheelZoom: false, zoomSnap: .25, minZoom: 9, maxZoom: 13 });
    const group = L.featureGroup().addTo(m);
    ws.forEach((w, i) => {
      if (!geo[w]) return;
      const v = vals[i], r = wardRow(w) || {};
      const lay = L.geoJSON({ type: 'Feature', geometry: geo[w] }, { style: { color: css('--bi-map-line'), weight: 1.5, fillColor: colour(v), fillOpacity: .92 } }).addTo(group);
      lay.bindTooltip(`<b>Ward ${w}</b>${r.councillor ? ' · ' + esc(r.councillor) : ''}<br>${esc(L0.name)}: <b>${isNum(v) && v > 0 ? L0.unit(v) : 'none'}</b>`, { sticky: true });
      lay.on('mouseover', () => lay.setStyle({ weight: 3, color: cssv('--accent') })).on('mouseout', () => lay.setStyle({ weight: 1.5, color: css('--bi-map-line') }));
      L.marker(lay.getBounds().getCenter(), { interactive: false, keyboard: false, icon: L.divIcon({ className: 'bi-wl', html: w, iconSize: [24, 14] }) }).addTo(m);
    });
    m.fitBounds(group.getBounds(), { padding: [8, 8] });
    setTimeout(() => { if (S.map === m) { m.invalidateSize(); m.fitBounds(group.getBounds(), { padding: [8, 8] }); } }, 120);
  }

  // ================================================================ OPERATING
  const seg = (id, items, cur) => `<div class="bi-seg" id="${id}" role="group">${items.map(([v, label]) => `<button type="button" data-v="${v}" aria-pressed="${v === cur}">${label}</button>`).join('')}</div>`;
  const deptAcc = (list, parts) => (list || []).length ? (() => {
    const top = Math.max(...list.map(d => d.value));
    return list.map(d => `<details class="bi-acc"><summary><div class="bi-bar"><span class="b-l">${esc(d.name)}</span><span class="b-v">${usdS(d.value)}</span>
      <span class="b-t">${(parts ? [[d.approved || 0, series(2)], [d.proposed || 0, series(1)]].filter(p => p[0] > 0) : [[d.value, series(0)]]).map(p => `<i style="width:${Math.max(.6, p[0] / top * 100)}%;--bc:${p[1]}"></i>`).join('')}</span>
      <span class="b-s">${fmt((d.units || []).length)} business unit line${(d.units || []).length === 1 ? '' : 's'}. Select to open.</span></div></summary>
      <div class="bi-sub">${bars((d.units || []).map(u => [u.name + (u.status ? ` (${u.status})` : ''), u.value]), { color: series(0) })}</div></details>`).join('');
  })() : empty('Not published for this year', 'The City’s open data has no figure here. It is not zero.');

  function operating(main) {
    const b = S.BUD;
    if (!b) { main.innerHTML = `<section class="card">${empty('The City budget could not be loaded', S.err.BUD)}</section>`; return; }
    const P = b.proposed, yrsA = b.years.filter(y => b.totals[y].operating), yrs = [...yrsA, ...Y4.filter(y => P && P.totals[y] && P.totals[y].operating)];
    if (!yrs.includes(S.opYear)) S.opYear = yrsA[yrsA.length - 1];
    const y = S.opYear, isP = !yrsA.includes(y);
    const list = isP ? P.by_department[y].operating : b.by_department[y].operating;
    const total = isP ? P.totals[y].operating.proposed : b.totals[y].operating.value, status = isP ? 'Proposed' : b.totals[y].operating.status;
    const op = cases().filter(c => c.type === 'operating');
    const byD = {};
    op.forEach(c => { const k = deptLabel(c.dept); const r = byD[k] = byD[k] || { n: 0, one: 0, ong: [0, 0, 0, 0], fte: [0, 0, 0, 0] }; r.n++; r.one += oneOf(c); c.ongoing_m.forEach((v, i) => { r.ong[i] += v || 0; }); c.ftes.forEach((v, i) => { r.fte[i] += v || 0; }); });
    const rows = Object.entries(byD).sort((a, c) => (sum(c[1].ong) + c[1].one) - (sum(a[1].ong) + a[1].one));
    const F = fig();
    main.innerHTML = `
      <section class="card"><div class="card-head"><div><h2>Operating budget by year</h2><p class="card-sub">Day-to-day services, net of recoveries, millions of dollars</p></div></div>
        <div class="bi-chart"><canvas id="bi-op-chart" role="img" aria-label="Operating budget by year: approved 2023 to 2026, proposed 2027 to 2030"></canvas></div>
        <p class="card-note"><b>Why there is no line joining 2026 to 2027:</b> ${esc((b.plan_2027 || {}).comparability || 'The City counts operating spending differently in its 2027–2030 data.')}</p></section>
      <section class="card"><div class="card-head"><div><h2>By department, ${y} ${st(ST[status] || 'estimate', status)}</h2><p class="card-sub">${usd(total)} in all. Select a department to see its business units.</p></div>
        <div class="card-tools">${seg('bi-op-years', yrs.map(v => [v, v]), y)}</div></div>
        ${deptAcc(list)}
        <p class="bi-src">Source: ${src(isP ? `2027–2030 Budget open data (${P.dataset}), read ${P.fetched}` : `City of Calgary open budget (${b.dataset}), read ${b.fetched}`, isP ? P.page : b.page)}</p></section>
      <section class="card"><div class="card-head"><div><h2>What the operating requests would add ${st('proposed', 'Proposed')}</h2><p class="card-sub">${fmt(op.length)} operating business cases, by department</p></div><div class="card-tools"><button type="button" class="link-btn small" data-sec="cases" data-type="operating">Open all ${fmt(op.length)}</button></div></div>
        ${op.length ? `<div class="table-wrap"><table class="data"><thead><tr><th scope="col">Department</th><th scope="col" class="num">Requests</th><th scope="col" class="num">One-time, 2027–30</th>${Y4.map(v => `<th scope="col" class="num">Ongoing ${v}</th>`).join('')}<th scope="col" class="num">Positions 2027</th><th scope="col" class="num">Positions, four years added</th></tr></thead><tbody>
          ${rows.map(([n, r]) => `<tr><td>${esc(n)}</td><td class="num">${fmt(r.n)}</td><td class="num">${usdZ(r.one)}</td>${r.ong.map(v => `<td class="num">${usdZ(v)}</td>`).join('')}<td class="num">${fmt(r.fte[0])}</td><td class="num">${fmt(sum(r.fte))}</td></tr>`).join('')}
          <tr class="tot"><td>All operating requests</td><td class="num">${fmt(op.length)}</td><td class="num">${usdS(F.bcOne)}</td>${F.bcOng.map(v => `<td class="num">${usdS(v)}</td>`).join('')}<td class="num">${fmt(F.bcFte[0])}</td><td class="num">${fmt(sum(F.bcFte))}</td></tr></tbody></table></div>
        <p class="card-note">${st('calc', 'Calculated')} Each request’s own figures, added by department. “Ongoing” figures are additions to the base budget in that year, shown as the City prints them. Where the centre gives one ongoing amount for a request it adds the yearly figures, as the City itself does in its notes (for example on requests 124 and 293). The cash cost over the four years, which would count each addition again in every later year, is not worked out, because the document does not state it. Where the document prints a department’s name in more than one way, the match is listed under Data checks.${op.some(c => isNum(c.full_one_time_m)) ? ` One-time amounts are what each table shows: for ${fmt(op.filter(c => isNum(c.full_one_time_m)).length)} requests the City’s note says the budget includes only part of the full request (${usd(sum(op.filter(c => isNum(c.full_one_time_m)).map(c => sum(c.one_time_m))))} of ${usd(sum(op.filter(c => isNum(c.full_one_time_m)).map(c => c.full_one_time_m)))}); they are listed under Data checks.` : ''}</p>` : empty('Business cases not loaded', S.err.BC)}</section>`;
    const lab = [...yrsA, ...Y4];
    chart('op', $('#bi-op-chart'), { type: 'bar', data: { labels: lab, datasets: [
      { label: 'Approved', data: lab.map(v => yrsA.includes(v) ? b.totals[v].operating.value : null), backgroundColor: series(2), borderRadius: 4 },
      { label: 'Proposed (counted differently)', data: lab.map(v => !yrsA.includes(v) && P && P.totals[v] ? (P.totals[v].operating || {}).proposed : null), backgroundColor: series(1), borderRadius: 4 }] },
      options: { maintainAspectRatio: false, scales: { x: { stacked: true, grid: { display: false } }, y: { ticks: { callback: v => usdS(v) } } }, plugins: { tooltip: { callbacks: { label: c => `${c.dataset.label}: ${usd(c.parsed.y)}` } } } } });
  }

  // ================================================================ CAPITAL
  function capital(main) {
    const b = S.BUD;
    if (!b) { main.innerHTML = `<section class="card">${empty('The City budget could not be loaded', S.err.BUD)}</section>`; return; }
    const P = b.proposed, past = b.years.filter(y => +y <= 2026 && b.totals[y].capital), yrs = [...past, ...Y4];
    if (!yrs.includes(S.capYear)) S.capYear = '2027';
    const y = S.capYear, isP = +y >= 2027;
    const list = isP ? P.by_department[y].capital : b.by_department[y].capital;
    const cap = cases().filter(c => c.type === 'capital'), F = fig();
    const group = (key, f = capOf) => Object.entries(cap.reduce((m, c) => { [].concat(key(c)).forEach(k => { const r = m[k] = m[k] || [0, 0]; r[0] += f(c); r[1]++; }); return m; }, {})).sort((a, c) => c[1][0] - a[1][0]);
    const needs = [0, 1, 2, 3, 4].map(i => sum(cap.map(c => c.needs_k[i])) / 1000);
    main.innerHTML = `
      <section class="card"><div class="card-head"><div><h2>Capital budget by year</h2><p class="card-sub">Millions of dollars. Each bar says what kind of figure it is.</p></div></div>
        <div class="bi-chart"><canvas id="bi-cap-chart" role="img" aria-label="Capital by year: actual 2023 and 2024, approved 2025 and 2026, approved earlier and newly proposed for 2027 to 2030"></canvas></div>
        <p class="card-note">2023 and 2024 are what was spent; 2025 and 2026 are the approved budget; for 2027 to 2030 the lower part is capital Council approved in earlier budgets for projects that run into those years, and the upper part is what the proposed budget would add. Sources: ${src(`open budget (${b.dataset})`, b.page)} for 2023 to 2026, ${src(`2027–2030 Budget (${P.dataset})`, P.page)} for 2027 to 2030.</p></section>
      <section class="card"><div class="card-head"><div><h2>By department, ${y} ${isP ? st('approved', 'Approved earlier') + ' ' + st('proposed', 'Proposed') : st(ST[b.totals[y].capital.status] || 'estimate', b.totals[y].capital.status)}</h2>
        <p class="card-sub">${isP ? `${usd(P.totals[y].capital.approved)} approved in earlier budgets and ${usd(P.totals[y].capital.proposed)} newly proposed` : usd(b.totals[y].capital.value) + ' in all'}. Select a department to see its business units.</p></div>
        <div class="card-tools">${seg('bi-cap-years', yrs.map(v => [v, v]), y)}</div></div>
        ${deptAcc(list, isP)}</section>
      ${cap.length ? `<section class="card"><div class="card-head"><div><h2>The ${fmt(cap.length)} capital requests ${st('proposed', 'Proposed')}</h2><p class="card-sub">${usd(F.bcCap)} over four years (${usd(F.bcCapLater)} of it in 2031 or later)</p></div><div class="card-tools"><button type="button" class="link-btn small" data-sec="cases" data-type="capital">Open all ${fmt(cap.length)}</button></div></div>
        <div class="bi-two">
          <div><h3>By the City’s service area</h3>${bars(group(c => c.service_area).map(([n, v]) => [n, v[0], `${fmt(v[1])} request${v[1] === 1 ? '' : 's'}`]))}</div>
          <div><h3>How far along</h3>${bars(group(c => c.stage).map(([n, v]) => [n, v[0], `${fmt(v[1])} requests`]), { color: series(2) })}
            <h3>Kind of request</h3>${bars(group(c => c.kind).map(([n, v]) => [n, v[0], `${fmt(v[1])} requests`]), { color: series(2) })}
            <h3>Where the money would come from</h3>${bars(group(c => c.funding.split(',').map(x => x.trim())).map(([n, v]) => [n, v[0], `${fmt(v[1])} requests draw on it`]), { color: series(6) })}
            <p class="bi-src">A request can draw on several sources and the document does not say how much from each, so these bars overlap: each is the full amount of the requests that name that source, and they do not add to the total.</p></div>
        </div>
        <p class="card-note">${fmt(cap.filter(c => c.required).length)} of the ${fmt(cap.length)} requests are marked by the City as “Required”. ${fmt(cap.filter(c => c.new).length)} are new opportunities and ${fmt(cap.filter(c => !c.new).length)} continue existing ones.</p></section>
      <section class="card"><div class="card-head"><div><h2>Proposed for the budget, and the City’s stated ten-year needs</h2><p class="card-sub">Two rows the City prints in every capital request, added across all ${fmt(cap.length)}</p></div></div>
        <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Added across all capital requests</th>${Y4.map(v => `<th scope="col" class="num">${v}</th>`).join('')}<th scope="col" class="num">2031 and later</th></tr></thead><tbody>
          <tr><td>4-Year Capital Budget Consideration ${st('proposed', 'Proposed')}</td>${F.bcCapY.map(v => `<td class="num">${usdS(v)}</td>`).join('')}<td class="num">${usdS(F.bcCapLater)}</td></tr>
          <tr><td>10-Year Capital Infrastructure Needs ${st('estimate', 'City estimate')}</td>${needs.map(v => `<td class="num">${usdS(v)}</td>`).join('')}</tr></tbody></table></div>
        <p class="card-note">Shown as printed and added up. The document does not explain how the two rows relate (for example, whether a year’s need already counts money approved in earlier budgets), so no gap between them is worked out here.</p></section>` : `<section class="card">${empty('Business cases not loaded', S.err.BC)}</section>`}`;
    const lab = [...past, ...Y4];
    const pick = (v, s) => +v <= 2026 ? (b.totals[v].capital.status === s ? b.totals[v].capital.value : null) : null;
    chart('cap', $('#bi-cap-chart'), { type: 'bar', data: { labels: lab, datasets: [
      { label: 'Actual (spent)', data: lab.map(v => pick(v, 'Actual')), backgroundColor: series(0), borderRadius: 4 },
      { label: 'Approved', data: lab.map(v => +v <= 2026 ? pick(v, 'Approved') : (P.totals[v].capital.approved ?? null)), backgroundColor: series(2), borderRadius: 4 },
      { label: 'Proposed (new)', data: lab.map(v => +v >= 2027 ? (P.totals[v].capital.proposed ?? null) : null), backgroundColor: series(1), borderRadius: 4 }] },
      options: { maintainAspectRatio: false, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, ticks: { callback: v => usdS(v) } } }, plugins: { tooltip: { callbacks: { label: c => `${c.dataset.label}: ${usd(c.parsed.y)}` } } } } });
  }

  // ================================================================ REVENUE AND TAX
  function revenue(main) {
    const b = S.BUD, R = b && b.revenue, plan = b && b.plan_2027, T = S.TAX;
    if (!b) { main.innerHTML = `<section class="card">${empty('The City budget could not be loaded', S.err.BUD)}</section>`; return; }
    if (R && !R.years.includes(S.revYear)) S.revYear = R.years[R.years.length - 1];
    const i = R ? R.years.indexOf(S.revYear) : -1;
    const tp = plan && plan.tax_path;
    const wards = T ? Object.entries(T.by_ward).map(([w, v]) => [w, v]).sort((a, c) => c[1].municipal - a[1].municipal) : [];
    main.innerHTML = `
      ${R ? `<section class="card"><div class="card-head"><div><h2>Where the money comes from, ${S.revYear} ${st('estimate', 'Budget book')}</h2><p class="card-sub">Operating revenue by source: $${fmt(R.total[i])} million in all, not counting $${fmt(R.reserve_withdrawal[i])} million drawn from reserves</p></div>
        <div class="card-tools">${seg('bi-rev-years', R.years.map(v => [v, v]), S.revYear)}</div></div>
        <div class="bi-two"><div>${bars(R.lines.map(l => [l.name, l.values[i], share(l.values[i], R.total[i]) + ' of operating revenue' + (l.note ? '. ' + esc(l.note) : '')]).sort((a, c) => c[1] - a[1]), { f: v => '$' + fmt(v) + 'M' })}</div>
        <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Source ($ millions)</th>${R.years.map(v => `<th scope="col" class="num">${v}</th>`).join('')}</tr></thead><tbody>
          ${R.lines.map(l => `<tr><td>${esc(l.name)}</td>${l.values.map(v => `<td class="num">${fmt(v)}</td>`).join('')}</tr>`).join('')}
          <tr class="tot"><td>Total</td>${R.total.map(v => `<td class="num">${fmt(v)}</td>`).join('')}</tr>
          <tr><td>Drawn from reserves (not in the total)</td>${R.reserve_withdrawal.map(v => `<td class="num">${fmt(v)}</td>`).join('')}</tr></tbody></table></div></div>
        <p class="card-note">Source: ${esc(R.source)}. The City publishes revenue by source in its budget book, not as open data, so these figures are kept by hand and updated with each budget. ${src('The City’s budget pages', R.page)}</p></section>` : ''}
      ${plan ? `<section class="card"><div class="card-head"><div><h2>The property tax path in the proposed budget</h2><p class="card-sub">Increase in municipal property tax revenue from existing properties</p></div></div>
        <div class="bi-kpis">${tp.years.map((yy, k) => `<div class="bi-kpi" style="--kc:${series(7)}"><div class="k-l"><span>${yy}</span>${k === 0 ? st('proposed', 'Proposed · City') : st('reported', 'Reported · news')}</div><div class="k-v">+${fmt(tp.pct[k], Number.isInteger(tp.pct[k]) ? 0 : 1)}%</div><div class="k-n">${k === 0 ? 'Stated on the City’s budget page.' : 'From news reports of the presentation to Council; not on the City’s page.'}</div></div>`).join('')}</div>
        <p class="card-note">${esc(tp.source)} ${tp.urls.map((u, k) => src(['City budget page', 'LiveWire Calgary', 'Yahoo News Canada'][k] || 'source', u)).join(' · ')}</p>
        ${plan.revenue_2027_pct ? `<h3>Where 2027 operating revenue would come from ${st('proposed', 'Proposed')}</h3>${bars(plan.revenue_2027_pct.map(([n, v]) => [n, v]), { f: v => fmt(v) + '%', color: series(7) })}` : ''}</section>` : ''}
      ${T ? `<section class="card"><div class="card-head"><div><h2>Municipal property tax levied by ward, ${T.year} ${st('calc', 'Calculated from the tax roll')}</h2><p class="card-sub">The only City revenue that has a location. $${fmt(T.city.municipal.total / 1e6, 1)} million citywide.</p></div><div class="card-tools"><button type="button" class="link-btn small" data-goto="budget">Community detail on the City budget screen</button></div></div>
        <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Ward</th><th scope="col">Councillor</th><th scope="col" class="num">Municipal tax levied</th><th scope="col" class="num">Share of the city</th><th scope="col" class="num">Provincial education tax (not City revenue)</th></tr></thead><tbody>
          ${wards.map(([w, v]) => `<tr><td>Ward ${w}</td><td>${esc(((T.wards || {})[w] || {}).councillor || '')}</td><td class="num">${usdS(v.municipal / 1e6)}</td><td class="num">${share(v.municipal, T.city.municipal.total, 1)}</td><td class="num">${usdS(v.education / 1e6)}</td></tr>`).join('')}</tbody></table></div>
        <p class="card-note">Every assessed property times the ${T.year} tax rate for its class, added by ward (${esc(T.bylaw)}). Where the tax is raised is not where it is spent: the City budgets by department and service, not by ward. <button type="button" class="link-btn small" data-method="property_tax">How it’s estimated</button></p></section>` : `<section class="card">${empty('Property tax by ward could not be loaded', S.err.TAX)}</section>`}`;
  }

  // ================================================================ BUDGET VS ACTUAL
  function actual(main) {
    const b = S.BUD;
    if (!b) { main.innerHTML = `<section class="card">${empty('The City budget could not be loaded', S.err.BUD)}</section>`; return; }
    const P = b.proposed, yrs = b.years.filter(y => +y <= 2030);
    const cell = (y, f) => {
      const out = [], t = (b.totals[y] || {})[f];
      if (+y <= 2026 || !P || !P.totals[y]) { if (t) out.push([t.value, t.status]); }
      else {
        const p = P.totals[y][f] || {};
        if (isNum(p.approved) && p.approved) out.push([p.approved, 'Approved']);
        if (isNum(p.proposed)) out.push([p.proposed, 'Proposed']);
      }
      return out.length ? out.map(([v, s]) => `${usdS(v)}${st(ST[s] || 'estimate', s)}`).join('<br>') : st('none', 'Not published');
    };
    main.innerHTML = `
      <section class="card"><div class="card-head"><div><h2>Can the budget be compared with what was spent?</h2><p class="card-sub">What the City’s open data holds for each year</p></div></div>
        <p class="bi-lead"><b>Not yet, and this centre does not pretend otherwise.</b> For every year and fund, the City’s open budget publishes one figure: either the approved budget or the actual spending, never both. A year with no actual figure is shown as “not published”. It is not zero, and no variance is worked out from figures that do not exist.</p>
        <div class="table-wrap" style="margin-top:12px"><table class="data bi-matrix"><thead><tr><th scope="col">Millions of dollars</th>${yrs.map(y => `<th scope="col" class="num">${y}</th>`).join('')}</tr></thead><tbody>
          <tr><th scope="row">Operating</th>${yrs.map(y => `<td>${cell(y, 'operating')}</td>`).join('')}</tr>
          <tr><th scope="row">Capital</th>${yrs.map(y => `<td>${cell(y, 'capital')}</td>`).join('')}</tr></tbody></table></div>
        <p class="card-note">2023 to 2026 are from the ${src(`open budget (${b.dataset})`, b.page)}; 2027 to 2030 are from the ${src(`2027–2030 Budget open data (${P.dataset})`, P.page)}, where “Approved” is capital approved in earlier budgets. The years after 2030 are left out here: the two datasets spread already-approved capital over the years differently (see Data checks), so adding 2031 and 2032 from one to 2027 to 2030 from the other could count the same money twice.</p></section>
      <section class="card"><div class="card-head"><div><h2>What is missing, and where it exists</h2><p class="card-sub">Recorded as gaps, not filled with estimates</p></div></div>
        <div class="bi-alerts">
          <div class="bi-alert gap">${icon('alert')}<div><b>Operating spending against budget</b><span>The open budget lists operating as “Approved” for every year from 2023 to 2026 and publishes no actual. The City reports actual operating results in its annual financial report and year-end reports (PDF), which are not yet read into Calgary Insight.</span></div></div>
          <div class="bi-alert gap">${icon('alert')}<div><b>Capital budget for the years with actuals</b><span>For 2023 and 2024 the open budget shows capital actually spent, and no longer shows what was budgeted for those years, so the two cannot be set side by side from this source.</span></div></div>
          <div class="bi-alert gap">${icon('alert')}<div><b>Spending by project</b><span>No open dataset gives each capital project’s approved budget, spending to date and expected completion. See Capital projects.</span></div></div>
          <div class="bi-alert note">${icon('info')}<div><b>What would close the gap</b><span>Reading the City’s year-end financial reports for 2023 to 2025 (operating and capital, budget and actual, by department) into a hand-kept file with page references, the way revenue is kept today. This is proposed, not built.</span></div></div>
        </div></section>`;
  }

  // ================================================================ BUSINESS CASES
  const amount = c => c.type === 'capital' ? capOf(c) : oneOf(c) + ongOf(c);
  function filtered() {
    const f = S.f, q = f.q.trim().toLowerCase();
    const L = cases().filter(c =>
      (!q || `${c.title} ${c.dept} ${c.bu} ${c.budget_id || ''} ${c.service_area || ''} #${c.n}`.toLowerCase().includes(q))
      && (!f.type || c.type === f.type) && (!f.theme || c.theme === f.theme) && (!f.dept || deptLabel(c.dept) === f.dept)
      && (!f.ward || (f.ward === 'all' ? c.wards === 'all' : Array.isArray(c.wards) && c.wards.includes(+f.ward)))
      && (!f.rationale || ratKey(c.rationale) === f.rationale) && (!f.risk || c.risk === f.risk) && (!f.stage || c.stage === f.stage)
      && (!f.fund || (c.funding || '').split(',').map(x => x.trim()).includes(f.fund))
      && (!f.flag || (f.flag === 'required' ? c.required : f.flag === 'new' ? c.new : f.flag === 'notes' ? c.footnotes : true)));
    if (f.sort === 'amount') L.sort((a, c) => amount(c) - amount(a));
    else if (f.sort === 'fte') L.sort((a, c) => fteOf(c) - fteOf(a));
    else L.sort((a, c) => a.n - c.n);
    return L;
  }
  const uniq = (f) => [...new Set(cases().flatMap(c => [].concat(f(c))).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
  const opts = (list, cur, any) => `<option value="">${any}</option>` + list.map(v => { const [val, label] = Array.isArray(v) ? v : [v, v]; return `<option value="${esc(val)}" ${String(val) === String(cur) ? 'selected' : ''}>${esc(label)}</option>`; }).join('');
  function caseDetail(c) {
    const xw = S.XW || {}, areas = ((xw.service_areas || {}).areas || {})[c.service_area] || [];
    const dk = deptKey(c.dept), bk = buKey(c.bu);
    const names = ['Maintenance or replacement', 'Growth', 'Service enhancement', 'Transformative'];
    const table = c.type === 'capital'
      ? `<table><thead><tr><th>$ thousands</th>${Y4.map(y => `<th>${y}</th>`).join('')}<th>2031+</th><th>Total</th></tr></thead><tbody>
          <tr><td>Proposed</td>${[1, 2, 3, 4, 5].map(i => `<td>${dash(c.cap_k[i])}</td>`).join('')}<td><b>${dash(c.cap_k[0])}</b></td></tr>
          <tr><td>10-year need</td>${c.needs_k.map(v => `<td>${dash(v)}</td>`).join('')}<td></td></tr></tbody></table>
         <p class="bi-src">The City’s rows “4-Year Capital Budget Consideration” (proposed) and “10-Year Capital Infrastructure Needs”, as printed; 2031+ is 2031 and later.</p>
         <h3>What it is for, by the City’s own split</h3><div class="bi-split">${c.split.map((v, i) => v ? `<i style="width:${v}%;background:${series(i)}" title="${names[i]} ${v}%"></i>` : '').join('')}</div>
         <p class="bi-src">${c.split.map((v, i) => v ? `${names[i]} ${v}%` : '').filter(Boolean).join(' · ')}</p>`
      : `<table><thead><tr><th></th>${Y4.map(y => `<th>${y}</th>`).join('')}</tr></thead><tbody>
          <tr><td>One-time ($M)</td>${c.one_time_m.map(v => `<td>${dash(v)}</td>`).join('')}</tr>
          <tr><td>Ongoing ($M)</td>${c.ongoing_m.map(v => `<td>${dash(v)}</td>`).join('')}</tr>
          <tr><td>Positions (FTEs)</td>${c.ftes.map(v => `<td>${dash(v)}</td>`).join('')}</tr></tbody></table>
         <p class="bi-src">The City’s table “Proposed funding amount”, as printed, in millions of dollars and full-time equivalents. A dash is the City’s own (nil).</p>
         ${c.footnotes ? `<div class="bi-alert warn" style="margin-top:8px">${icon('info')}<div><b>The City adds a note under this table</b><span>${isNum(c.full_one_time_m) ? `The note gives the full one-time amount as ${usd(c.full_one_time_m)} and says the 2027–2030 budget includes only part of it; the table above shows that part (${usd(sum(c.one_time_m))}). ` : 'It qualifies these figures (for example, how the amount is shared among business units). '}Read it on page ${c.page}.</span></div></div>` : ''}`;
    const fact = (k, v) => v === null || v === undefined || v === '' ? '' : `<dt>${k}</dt><dd>${v}</dd>`;
    const tableX = table.replace('<table>', '<div class="bi-x"><table>').replace('</table>', '</table></div>');
    return `<div class="bi-case"><div class="bi-case-grid"><div>
        <h3>${c.n}. ${esc(c.title)}</h3><p>${st('proposed', 'Proposed · not approved')} ${c.type === 'capital' && c.required ? st('estimate', 'Marked “Required” by the City') : ''}</p>
        ${tableX}
        ${pageLink(c.page, `Read the City’s description, benefits and risks: page ${c.page} of its document`)}</div>
      <div><dl class="bi-facts">
        ${fact('Council priority', esc(c.theme))}
        ${fact('Department', esc(c.dept) + (dk !== c.dept ? ` <small>(open data: ${esc(dk)})</small>` : ''))}
        ${fact('Business unit', esc(c.bu) + (bk !== c.bu ? ` <small>(open data: ${esc(bk)})</small>` : ''))}
        ${fact('Reason given', esc(c.rationale))}
        ${c.type === 'capital' ? fact('Budget ID', esc(c.budget_id)) + fact('Kind', esc(c.kind)) + fact('Ward(s)', c.wards === 'all' ? 'All wards' : 'Ward ' + c.wards.join(', ')) + fact('Stage', esc(c.stage)) + fact('New or existing', c.new ? 'New opportunity' : 'Existing opportunity') + fact('Funding source', esc(c.funding)) + fact('Service area', esc(c.service_area)) + fact('Corporate risk', esc(c.corp_risk)) + fact('Operating risk', esc(c.op_risk))
          : fact('City’s risk rating', c.risk ? esc(c.risk) : '<span class="bi-na">not stated</span>') + fact('Measured by', c.metric ? esc(c.metric) : '<span class="bi-na">no measure stated</span>') + fact('Long-term plan', esc(c.plan))}
        </dl>
        ${areas.length ? `<h3>Data on the same subject</h3><p class="bi-src" style="margin-top:0">${areas.map(a => a[0].includes('/') && safeUrl(a[0]) ? `<a href="${esc(safeUrl(a[0]))}">${esc(a[1])}</a>: ${esc(a[2])}` : `<button type="button" class="link-btn small" data-goto="${esc(a[0])}">${esc(a[1])}</button> ${esc(a[2])}`).join('<br>')}</p>` : ''}
      </div></div></div>`;
  }
  function casesView(main) {
    if (!S.BC) { main.innerHTML = `<section class="card">${empty('The business cases could not be loaded', S.err.BC)}</section>`; return; }
    const f = S.f, src0 = S.BC.source;
    main.innerHTML = `
      <section class="card"><div class="card-head"><div><h2>Every budget request, searchable ${st('proposed', 'Proposed')}</h2>
        <p class="card-sub">${fmt(cases().length)} business cases from the City’s ${fmt(src0.pages)}-page document. ${esc(S.BC.status)}</p></div>
        <div class="card-tools"><button type="button" class="btn" id="bi-export">${icon('download')}<span>Save this list</span></button></div></div>
        <div class="bi-filters">
          <label>Search<input type="search" id="bi-q" placeholder="Words in the title, a department, a Budget ID or a number" value="${esc(f.q)}" autocomplete="off"></label>
          <label>Kind<select data-f="type">${opts([['operating', 'Operating'], ['capital', 'Capital']], f.type, 'Operating and capital')}</select></label>
          <label>Council priority<select data-f="theme">${opts(S.BC.themes, f.theme, 'All six')}</select></label>
          <label>Department<select data-f="dept">${opts(uniq(c => deptLabel(c.dept)), f.dept, 'All departments')}</select></label>
          <label>Ward<select data-f="ward">${opts([['all', 'All-wards requests'], ...Array.from({ length: 14 }, (_, i) => [i + 1, 'Names ward ' + (i + 1)])], f.ward, 'Any')}</select></label>
        </div>
        <details class="bi-acc" style="margin-top:10px;border:0" ${f.rationale || f.risk || f.stage || f.fund || f.flag || f.sort !== 'n' ? 'open' : ''}><summary><span class="link-btn small">More filters and sorting</span></summary>
        <div class="bi-filters bi-more">
          <label>Reason given<select data-f="rationale">${opts(uniq(c => ratKey(c.rationale)), f.rationale, 'Any')}</select></label>
          <label>City’s risk rating (operating)<select data-f="risk">${opts(['Low', 'Slight', 'Medium', 'High', 'Extensive'], f.risk, 'Any')}</select></label>
          <label>Stage (capital)<select data-f="stage">${opts(uniq(c => c.stage), f.stage, 'Any')}</select></label>
          <label>Funding source (capital)<select data-f="fund">${opts(uniq(c => (c.funding || '').split(',').map(x => x.trim())), f.fund, 'Any')}</select></label>
          <label>Only<select data-f="flag">${opts([['required', 'Marked “Required” by the City'], ['new', 'New opportunities'], ['notes', 'With a City note on the figures']], f.flag, 'Everything')}</select></label>
          <label>Order<select data-f="sort">${[['n', 'The City’s numbering'], ['amount', 'Largest amount first'], ['fte', 'Most positions first']].map(([v, l]) => `<option value="${v}" ${f.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        </div></details>
        <div id="bi-case-list"></div>
        <p class="card-note">Read from ${src(src0.title + ' (' + src0.publisher + ')', src0.url)} on ${longDate(src0.read)}; the City’s file was last changed ${esc(src0.modified ? longDate(src0.modified) : 'on a date it does not state')}. Amounts, positions, names and categories are the City’s own, checked row by row against a second reading of the document (see Data checks). The City’s descriptions, benefits and risk statements are not copied here: each request links to its page.</p></section>`;
    listCases();
  }
  function listCases() {
    const box = $('#bi-case-list'); if (!box) return;
    const L = filtered(), pages = Math.max(1, Math.ceil(L.length / PAGE));
    if (S.open) { const i = L.findIndex(c => c.n === S.open); if (i >= 0) S.page = Math.floor(i / PAGE); }
    S.page = Math.min(S.page, pages - 1);
    const cap = L.filter(c => c.type === 'capital'), op = L.filter(c => c.type === 'operating'), slice = L.slice(S.page * PAGE, S.page * PAGE + PAGE);
    box.innerHTML = `<div class="bi-sum" aria-live="polite"><span><b>${fmt(L.length)}</b> request${L.length === 1 ? '' : 's'}</span>
        ${cap.length ? `<span><b>${usd(sum(cap.map(capOf)))}</b> capital over four years (${fmt(cap.length)})</span>` : ''}
        ${op.length ? `<span><b>${usd(sum(op.map(oneOf)))}</b> one-time operating (${fmt(op.length)})</span><span><b>${fmt(sum(op.map(c => c.ftes[0] || 0)))}</b> positions in 2027</span>` : ''}</div>
      ${L.length ? `<div class="bi-list" role="list">
        <div class="bi-row bi-row-h" aria-hidden="true"><span>No.</span><span>Request</span><span>Kind</span><span class="c-a">Proposed</span><span>Ward(s) or positions</span><span class="c-p">Page</span></div>
        ${slice.map(c => `<div class="bi-item${S.open === c.n ? ' open' : ''}" role="listitem" id="bi-c${c.n}"><div class="bi-row">
          <span class="c-n">${c.n}</span>
          <span class="c-t"><button type="button" data-case="${c.n}" aria-expanded="${S.open === c.n}">${esc(c.title)}</button><small>${esc(c.dept)} · ${esc(c.bu)}</small></span>
          <span class="c-k">${c.type === 'capital' ? 'Capital' : 'Operating'}</span>
          <span class="c-a">${c.type === 'capital' ? usdS(capOf(c)) : `${oneOf(c) ? usdS(oneOf(c)) + ' one-time' : ''}${oneOf(c) && ongOf(c) ? '<br>' : ''}${ongOf(c) ? usdS(ongOf(c)) + ' ongoing' : ''}${!oneOf(c) && !ongOf(c) ? '–' : ''}`}</span>
          <span class="c-w">${c.type === 'capital' ? (c.wards === 'all' ? 'All wards' : 'Ward ' + c.wards.join(', ')) : (fteOf(c) ? fmt(fteOf(c)) + (fteOf(c) === 1 ? ' position' : ' positions') : 'No positions')}</span>
          <span class="c-p"><a href="${DOC}#page=${c.page}" target="_blank" rel="noopener" aria-label="Page ${c.page} of the City’s document">p. ${c.page}</a></span></div>
          ${S.open === c.n ? caseDetail(c) : ''}</div>`).join('')}</div>
        <div class="bi-pager"><span>Showing ${fmt(S.page * PAGE + 1)} to ${fmt(Math.min(L.length, S.page * PAGE + PAGE))} of ${fmt(L.length)}. Operating “ongoing” is the request’s yearly additions to the base budget, added together as the City does in its own notes.</span>
          <span><button type="button" class="btn" data-page="-1" ${S.page === 0 ? 'disabled' : ''}>Previous</button> <button type="button" class="btn" data-page="1" ${S.page >= pages - 1 ? 'disabled' : ''}>Next</button></span></div>`
        : empty('No request matches these filters', 'Clear a filter or try a shorter search.')}`;
  }
  function openCase(n) {
    S.open = +n;
    if (S.sec !== 'cases') { S.f = { q: '', type: '', theme: '', dept: '', ward: '', rationale: '', risk: '', stage: '', fund: '', flag: '', sort: 'n' }; go('cases', true); }
    else listCases();
    const row = $('#bi-c' + n); if (row) row.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  // ================================================================ CAPITAL PROJECTS
  function projects(main) {
    const cap = cases().filter(c => c.type === 'capital'), pr = cap.filter(c => c.kind === 'Project').sort((a, c) => capOf(c) - capOf(a));
    const stages = Object.entries(cap.reduce((m, c) => { const r = m[c.stage] = m[c.stage] || [0, 0]; r[0] += capOf(c); r[1]++; return m; }, {})).sort((a, c) => a[0].localeCompare(c[0]));
    main.innerHTML = `
      <section class="card"><div class="card-head"><div><h2>Following a capital project from request to completion</h2><p class="card-sub">What can be tracked today, and what the City does not publish</p></div></div>
        <p class="bi-lead">Each capital request says how far along it is, on the City’s four stages. That is tracked here for every request. <b>Spending to date, changes to a project’s budget and its expected completion are not published as open data</b>, so they are listed as missing instead of being estimated.</p>
        <div class="bi-chain">${stages.map(([n, v]) => `<div><small>${esc(n.split(':')[0])}</small><b>${fmt(v[1])}</b><span>${esc((n.split(':')[1] || '').trim())}<br>${usdS(v[0])} proposed</span></div>`).join('')}</div></section>
      <section class="card"><div class="card-head"><div><h2>The ${fmt(pr.length)} requests that are single projects ${st('proposed', 'Proposed')}</h2><p class="card-sub">The other ${fmt(cap.length - pr.length)} capital requests are programs that fund many pieces of work. Select a project to open its business case.</p></div></div>
        ${pr.length ? `<div class="table-wrap"><table class="data bi-cases"><thead><tr><th scope="col" class="num">No.</th><th scope="col">Project</th><th scope="col">Stage</th><th scope="col">Ward(s)</th><th scope="col" class="num">Proposed, four years</th><th scope="col">Budget ID</th><th scope="col" class="num">Page</th></tr></thead><tbody>
          ${pr.map(c => `<tr><td class="num">${c.n}</td><td class="t"><button type="button" data-case="${c.n}">${esc(c.title)}</button><small>${esc(c.bu)} · ${c.new ? 'new' : 'existing'}</small></td><td>${esc(c.stage)}</td><td>${c.wards === 'all' ? 'All wards' : 'Ward ' + c.wards.join(', ')}</td><td class="num">${usdS(capOf(c))}</td><td>${esc(c.budget_id)}</td><td class="num"><a href="${DOC}#page=${c.page}" target="_blank" rel="noopener">${c.page}</a></td></tr>`).join('')}</tbody></table></div>` : empty('Business cases not loaded', S.err.BC)}</section>
      <section class="card"><div class="card-head"><div><h2>Projects already under way</h2><p class="card-sub">On other Calgary Insight screens</p></div></div>
        <p class="bi-lead">City projects being built now, with each published cost, are listed by ward on the <button type="button" class="link-btn small" data-goto="budget">City budget screen</button>, and every major project in each ward, public and private, is on <button type="button" class="link-btn small" data-goto="growth">Growth vs amenities</button>. They are not repeated here, and they are not matched to the requests above: the City publishes no identifier that joins a project under construction to a budget request.</p>
        <div class="bi-alerts" style="margin-top:12px">
          <div class="bi-alert gap">${icon('alert')}<div><b>Approved budget against spending to date, by project</b><span>Not published as open data. The open budget gives capital by business unit and year only.</span></div></div>
          <div class="bi-alert gap">${icon('alert')}<div><b>Completion dates, and whether they have moved</b><span>Not published as open data. The business cases give a stage, not a date.</span></div></div>
          <div class="bi-alert gap">${icon('alert')}<div><b>A common project number across City sources</b><span>The Budget IDs in the business cases (for example P258_000) do not appear in the open budget or in the City’s construction listings, so a request cannot be followed into delivery by its number.</span></div></div>
        </div></section>`;
  }

  // ================================================================ PERFORMANCE
  async function performance(main) {
    main.innerHTML = `<section class="card">${empty('Loading the City’s performance measures', '')}</section>`;
    await lazy('ACC');
    if (S.sec !== 'performance') return;
    const M = S.ACC && S.ACC.city_measures, rows = (M && M.rows) || [];
    const areas = [...new Set(rows.map(r => r.council_priority_area))];
    const v = x => x === undefined || x === null || x === '' ? '<span class="bi-na">–</span>' : esc(x);
    const withM = cases().filter(c => c.type === 'operating' && c.metric);
    main.innerHTML = `
      <section class="card"><div class="card-head"><div><h2>How the City reports its own performance ${st('actual', 'Reported by the City')}</h2>
        <p class="card-sub">${M ? `${esc(M.name)}, ${fmt(rows.length)} measures, updated by the City ${longDate(String(M.updated).slice(0, 10))}` : ''}</p></div></div>
        <p class="bi-lead">These are the City’s measures and targets, exactly as it publishes them. <b>They are shown beside the budget, not explained by it:</b> a measure that moves after money is spent does not show that the money moved it.</p>
        ${rows.length ? areas.map(a => `<h3>${esc(a)}</h3><div class="table-wrap"><table class="data"><thead><tr><th scope="col" class="wrap">Measure</th><th scope="col" class="num">2022</th><th scope="col" class="num">2023</th><th scope="col" class="num">2024</th><th scope="col" class="num">2025</th><th scope="col" class="num">Q1 2026</th><th scope="col" class="num">Q2 2026</th><th scope="col" class="num">Target</th></tr></thead><tbody>
          ${rows.filter(r => r.council_priority_area === a).map(r => `<tr><td class="wrap">${esc(r.performance_measure_name)}</td><td class="num">${v(r._2022_value)}</td><td class="num">${v(r._2023_value)}</td><td class="num">${v(r._2024_value)}</td><td class="num">${v(r._2025_value)}</td><td class="num">${v(r.q1_2026_value)}</td><td class="num">${v(r.q2_2026_value)}</td><td class="num">${v(r.target)}</td></tr>`).join('')}</tbody></table></div>`).join('')
          : empty('The City’s performance measures could not be loaded', S.err.ACC || 'The dataset returned no rows today.')}
        ${M ? `<p class="card-note">Source: ${src(`City of Calgary open data (${M.dataset})`, 'https://data.calgary.ca/d/' + M.dataset)}. A dash means the City gave no value. No judgment is made here on whether a target was met, because the City does not state for each measure whether higher or lower is better.</p>` : ''}</section>
      <section class="card"><div class="card-head"><div><h2>What each operating request says it should be measured by ${st('proposed', 'Proposed')}</h2><p class="card-sub">${fmt(withM.length)} of ${fmt(cases().filter(c => c.type === 'operating').length)} operating requests name a measure; the rest name none</p></div></div>
        ${withM.length ? `<div class="table-wrap tall"><table class="data bi-cases"><thead><tr><th scope="col" class="num">No.</th><th scope="col">Request</th><th scope="col" class="wrap">The measure the City names</th><th scope="col" class="num">Page</th></tr></thead><tbody>
          ${withM.map(c => `<tr><td class="num">${c.n}</td><td class="t"><button type="button" data-case="${c.n}">${esc(c.title)}</button><small>${esc(c.dept)}</small></td><td class="wrap">${esc(c.metric)}</td><td class="num"><a href="${DOC}#page=${c.page}" target="_blank" rel="noopener">${c.page}</a></td></tr>`).join('')}</tbody></table></div>
          <p class="card-note">This is a list to hold the City to: once the budget is decided, each funded request can be checked against the measure it named. The capital requests do not name measures.</p>` : empty('Business cases not loaded', S.err.BC)}</section>`;
  }

  // ================================================================ TAX SIMULATOR (hypothetical)
  function simulator(main) {
    const T = S.TAX, plan = S.BUD && S.BUD.plan_2027;
    if (!T) { main.innerHTML = `<section class="card">${empty('The 2026 tax rates could not be loaded, so the simulator is off', S.err.TAX)}</section>`; return; }
    const rate = T.rates.municipal.residential, levy = T.city.municipal.total, prop = plan ? plan.headline.tax_revenue_increase_2027_pct : 15;
    const typical = 706000;
    main.innerHTML = `
      <section class="card"><div class="card-head"><div><h2>What a tax increase would mean for one home ${st('hypo', 'Hypothetical')}</h2><p class="card-sub">Municipal property tax only, residential property</p></div></div>
        <div class="bi-hypo"><b>This is a what-if, not a tax bill and not a forecast.</b> It applies one percentage evenly to this year’s tax. Real bills depend on how each home’s 2027 assessment changes against the rest of the city, and on what Council finally approves.</div>
        <div class="bi-sim"><div>
          <label>Your home’s 2026 assessed value<input type="number" id="bi-sim-v" min="50000" max="20000000" step="1000" value="${typical}" inputmode="numeric"></label>
          <label for="bi-sim-p">Increase in municipal property tax for 2027: <output id="bi-sim-p-out">${fmt(prop, 1)}%</output>
            <input type="range" id="bi-sim-p" min="0" max="20" step="0.5" value="${prop}" aria-describedby="bi-sim-hint"></label>
          <p class="bi-src" id="bi-sim-hint">${st('proposed', 'Proposed')} The proposed budget asks for ${fmt(prop)}% more property tax revenue from existing properties in 2027. Move the slider to see other outcomes Council could choose.</p>
        </div><div><div class="bi-sim-out" id="bi-sim-out" aria-live="polite"></div></div></div>
        <h3>How it is worked out</h3>
        <dl class="bi-facts">
          <dt>2026 tax</dt><dd>Assessed value × the 2026 municipal residential rate, ${rate} (${esc(T.bylaw)}) ${st('approved', 'Approved')}</dd>
          <dt>2027 what-if</dt><dd>2026 tax × (1 + the percentage chosen) ${st('hypo', 'Hypothetical')}</dd>
          <dt>Citywide</dt><dd>The percentage chosen × the 2026 municipal levy on all property, $${fmt(levy / 1e6, 1)} million ${st('calc', 'Calculated')}</dd>
          <dt>Left out</dt><dd>Provincial education property tax, water, wastewater, stormwater and waste charges; business and other non-residential property.</dd>
          <dt>Why the City’s figure differs</dt><dd>${plan && plan.household ? `For its typical home the City estimates $${fmt(plan.household.lines[0].m2026)} a month in 2026 and $${fmt(plan.household.lines[0].m2027)} in 2027, about ${fmt((plan.household.lines[0].m2027 / plan.household.lines[0].m2026 - 1) * 100, 0)}% more, because 2027 assessments shift the share each property type pays. ` : ''}An even percentage cannot show that shift.</dd>
        </dl>
        <p class="card-note">For the whole household bill from 2026 to 2030 (tax, water and waste, on the City’s own figures) use the <a href="studies/what-calgarians-pay/calculator.html">bill calculator</a> from the study What Calgarians pay.</p></section>`;
    const run = () => {
      const val = Math.max(0, +$('#bi-sim-v').value || 0), p = +$('#bi-sim-p').value;
      const t26 = val * rate, t27 = t26 * (1 + p / 100);
      $('#bi-sim-p-out').textContent = fmt(p, 1) + '%';
      $('#bi-sim-out').innerHTML = [
        ['$' + fmt(t26), `2026 municipal tax, a year ($${fmt(t26 / 12)} a month)`],
        ['$' + fmt(t27), `2027 at +${fmt(p, 1)}%, a year ($${fmt(t27 / 12)} a month)`],
        ['+$' + fmt(t27 - t26), `more a year (+$${fmt((t27 - t26) / 12, 2)} a month)`],
        [usd(levy * p / 100 / 1e6), `raised citywide by ${fmt(p, 1)}% on the 2026 levy`],
      ].map(([a, c]) => `<div><b>${a}</b><span>${c}</span></div>`).join('');
    };
    $('#bi-sim-v').addEventListener('input', run); $('#bi-sim-p').addEventListener('input', run); run();
  }

  // ================================================================ CONNECTED DATA
  async function links(main) {
    main.innerHTML = `<section class="card">${empty('Loading infrastructure condition', '')}</section>`;
    await lazy('INF');
    if (S.sec !== 'links') return;
    const cap = cases().filter(c => c.type === 'capital'), I = S.INF, xw = (S.XW || {}).service_areas || {};
    const area = n => { const L = cap.filter(c => c.service_area === n); return [sum(L.map(capOf)), L.length]; };
    const cell = (label, value, note) => `<div><small>${label}</small><b>${value}</b><span>${note}</span></div>`;
    const bc = n => { const [v, k] = area(n); return cell(`Proposed capital · ${esc(n)}`, usdS(v), `${fmt(k)} request${k === 1 ? '' : 's'} ${st('proposed', 'Proposed')}`); };
    const ry = I && I.city && I.city.requests_by_year, lastFull = String(new Date().getFullYear() - 1);
    const pav = I && I.context && I.context.pavement, san = I && I.city && I.city.sanitary;
    const rowsA = Object.entries(cap.reduce((m, c) => { const r = m[c.service_area] = m[c.service_area] || [0, 0]; r[0] += capOf(c); r[1]++; return m; }, {})).sort((a, c) => c[1][0] - a[1][0]);
    main.innerHTML = `
      <section class="card"><div class="card-head"><div><h2>The budget beside what the data shows</h2><p class="card-sub">Side by side, on purpose. Not cause and effect.</p></div></div>
        <p class="bi-lead">Each strip puts a proposed amount next to figures Calgary Insight already tracks on the same subject. <b>Nothing is divided among communities, and a report to 311 is a resident’s report, not a confirmed failure.</b> Where the site holds no data on a subject, that is said.</p>
        <h3>Roads</h3><div class="bi-chain">${bc('Roads & Pathways')}
          ${pav ? cell('Pavement in good condition', fmt(pav.good) + '%', `${fmt(pav.fair)}% fair, ${fmt(pav.poor)}% poor, ${esc(pav.as_of)} ${st('actual', 'City figure')}`) : cell('Pavement condition', '–', esc(S.err.INF || 'not loaded'))}
          ${ry && ry.roads ? cell(`Road reports to 311, ${lastFull}`, fmt(ry.roads[lastFull]), `potholes, roadway and back lanes ${st('actual', 'Counted')}`) : ''}</div>
        <p class="bi-src"><button type="button" class="link-btn small" data-goto="infra">Infrastructure condition</button> has the paving plan and every community.</p>
        <h3>Water and sewer</h3><div class="bi-chain">${bc('Water Utilities')}
          ${I && I.city ? cell(I.city.breaks_through ? `Water main breaks, 12 months to ${longDate(I.city.breaks_through)}` : 'Water main breaks, last 12 months', fmt(I.city.breaks_n12), `${fmt(I.city.breaks_nprev)} in the 12 months before ${st('actual', 'Counted')}`) + cell('Water mains 50 years or older', share(I.city.old_km, I.city.mains_km), `${fmt(I.city.old_km)} of ${fmt(I.city.mains_km)} km ${st('calc', 'Calculated')}`) : ''}
          ${san ? cell('Sewer lines past a typical service life', fmt(san.past_typical_pct, 1) + '%', `of ${fmt(san.n)} sanitary service lines, by material ${st('calc', 'Calculated')}`) : ''}</div>
        <p class="bi-src"><button type="button" class="link-btn small" data-goto="infra">Infrastructure condition</button> · <a href="studies/calgary-sewers/">Calgary’s ageing sewers (report)</a></p>
        <h3>Transit, recreation and parks</h3><div class="bi-chain">${bc('Transit')}${bc('Recreation')}${bc('Parks & Urban Forestry')}${bc('Community & Culture')}</div>
        <p class="bi-src"><button type="button" class="link-btn small" data-goto="growth">Growth vs amenities</button> measures how near homes are to transit stops, parks, playgrounds, recreation centres and libraries, by community.</p>
        <h3>Public safety</h3><div class="bi-chain">${bc('Police')}${bc('Fire')}${bc('Emergency Management')}${bc('Bylaw')}</div>
        <p class="bi-src"><button type="button" class="link-btn small" data-goto="dashboard">Dashboard</button> has police-reported crime by community · <a href="studies/calgary-police/">Calgary Police: performance, resources and the budget request (study)</a>. ${esc(xw.gaps || '')}</p></section>
      <section class="card"><div class="card-head"><div><h2>Every service area and where its data lives</h2><p class="card-sub">${esc(xw.relationship || '')}</p></div></div>
        <div class="table-wrap"><table class="data"><thead><tr><th scope="col">The City’s service area</th><th scope="col" class="num">Capital requests</th><th scope="col" class="num">Proposed, four years</th><th scope="col" class="wrap">On Calgary Insight</th></tr></thead><tbody>
          ${rowsA.map(([n, v]) => { const L = (xw.areas || {})[n] || []; return `<tr><td><button type="button" class="link-btn small" data-sec="cases" data-q="${esc(n)}">${esc(n)}</button></td><td class="num">${fmt(v[1])}</td><td class="num">${usdS(v[0])}</td><td class="wrap">${L.length ? L.map(a => a[0].includes('/') ? `<a href="${esc(a[0])}">${esc(a[1])}</a>` : `<button type="button" class="link-btn small" data-goto="${esc(a[0])}">${esc(a[1])}</button>`).join(' ') : (n === 'All Services' ? '<span class="bi-na">not specific to one service</span>' : '<span class="bi-na">no screen on this subject yet</span>')}</td></tr>`; }).join('')}</tbody></table></div>
        <p class="card-note">How records are joined: a request belongs to a department and business unit (matched to the City’s open budget by name), a Council priority, a service area and, for capital, one or more wards or all wards. Operating requests carry no service area or ward in the City’s document. The name matches are listed under Data checks.</p></section>`;
  }

  // ================================================================ DATA CHECKS (the validation engine)
  function runChecks() {
    if (S.checks) return S.checks;
    const out = [], b = S.BUD, P = b && b.proposed, C = cases(), cap = C.filter(c => c.type === 'capital'), op = C.filter(c => c.type === 'operating'), T = S.TAX;
    const add = (res, title, short, body, meta) => out.push({ res, title, short, body: body || '', meta: meta || {} });
    const tbl = (head, rows) => `<div class="table-wrap" style="margin-top:8px"><table class="data"><thead><tr>${head.map((h, i) => `<th scope="col" class="${i ? 'num' : ''}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((v, i) => `<td class="${i ? 'num' : ''}">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    if (S.BC) {
      const ns = C.map(c => c.n).sort((a, c) => a - c), contiguous = ns.every((n, i) => n === i + 1);
      add(contiguous && C.length === S.BC.counts.cases ? 'pass' : 'warn', 'Every business case was read', `${fmt(C.length)} cases, numbered 1 to ${fmt(C.length)} with none missing.`,
        `The City’s contents list ${fmt(C.length)} requests; all were read (${fmt(op.length)} operating, ${fmt(cap.length)} capital). When the file was made, each title was matched to the contents, each printed page number to the PDF’s own page, and every figure row was read a second time with a different PDF reader (1,152 rows, no differences).`,
        { Formula: 'case numbers = 1, 2, 3 … N; count = the count stored when the file was made', Inputs: 'ui/budget-intel/business-cases.json', Source: S.BC.source.url, Period: 'The City’s document as last changed ' + longDate(S.BC.source.modified) });
      const badTot = cap.filter(c => Math.abs((c.cap_k[0] || 0) - sum(c.cap_k.slice(1))) > 3);
      add(badTot.length ? 'warn' : 'pass', 'Each capital request’s total equals its years', badTot.length ? `${fmt(badTot.length)} requests do not add up.` : `All ${fmt(cap.length)} totals equal the sum of 2027 to 2030 and later (within $3,000 of rounding).`,
        badTot.length ? 'Requests: ' + badTot.map(c => c.n).join(', ') : '', { Formula: '|total − (2027 + 2028 + 2029 + 2030 + 2031 and later)| ≤ 3 ($000s)', Inputs: 'cap_k of each capital case', Limits: 'The City rounds each year to $1,000.' });
      const badSplit = cap.filter(c => ![99, 100, 101].includes(sum(c.split)));
      add(badSplit.length ? 'warn' : 'pass', 'Each capital request’s four purposes add to 100%', badSplit.length ? `${fmt(badSplit.length)} do not.` : `All ${fmt(cap.length)} do.`, badSplit.map(c => c.n).join(', '),
        { Formula: 'maintenance + growth + service enhancement + transformative = 100% (±1)' });
      const neg = C.filter(c => [].concat(c.cap_k || [], c.one_time_m || [], c.ongoing_m || [], c.ftes || []).some(v => v < 0));
      add(neg.length ? 'note' : 'pass', 'No negative amounts', neg.length ? `${fmt(neg.length)} requests carry a negative figure (a reduction).` : 'No request carries a negative amount or position count.', neg.map(c => c.n).join(', '), { Formula: 'every figure ≥ 0' });
    }
    if (S.BC && P) {
      const od = Y4.map(y => (P.totals[y].capital || {}).proposed || 0), bc = [1, 2, 3, 4].map(i => sum(cap.map(c => c.cap_k[i])) / 1000);
      const worst = Math.max(...od.map((v, i) => v ? Math.abs(bc[i] - v) / v * 100 : 0));
      add(worst < 0.5 ? 'pass' : 'warn', 'The capital requests add up to the City’s open data', worst < 0.5 ? `Within ${fmt(worst, 2)}% in every year from 2027 to 2030.` : `They differ by up to ${fmt(worst, 1)}%: the open data or the document may have changed.`,
        tbl(['Proposed capital ($ millions)', ...Y4, '2027–2030'], [
          ['Sum of the ' + fmt(cap.length) + ' capital business cases', ...bc.map(v => fmt(v, 1)), fmt(sum(bc), 1)],
          ['City open data, “Proposed” capital', ...od.map(v => fmt(v, 1)), fmt(sum(od), 1)],
          ['Difference', ...bc.map((v, i) => fmt(v - od[i], 1)), fmt(sum(bc) - sum(od), 1)]])
        + '<p style="margin-top:8px">Two City sources published separately agree to within a few million dollars of $13 billion. The small difference is not explained by either source; the open data rounds each line to $0.1 million.</p>',
        { Formula: 'Σ cases’ amount for the year ÷ 1,000 compared with Σ open-data rows where fund = Capital and status = Proposed', Inputs: `business-cases.json; ${P.dataset} (read ${P.fetched})`, Period: '2027 to 2030', Limits: 'Passes when every year is within 0.5%.' });
      // by business unit
      const o = {}, c2 = {};
      Y4.forEach(y => ((P.by_department[y] || {}).capital || []).forEach(d => (d.units || []).forEach(u => { if (u.status === 'proposed') o[u.name] = (o[u.name] || 0) + u.value; })));
      cap.forEach(c => { const k = buKey(c.bu); c2[k] = (c2[k] || 0) + sum(c.cap_k.slice(1, 5)) / 1000; });
      const names = [...new Set([...Object.keys(o), ...Object.keys(c2)])].sort();
      const diff = names.map(n => [n, c2[n] || 0, o[n] || 0, (c2[n] || 0) - (o[n] || 0)]), off = diff.filter(r => Math.abs(r[3]) > 1), net = sum(off.map(r => r[3]));
      // for a unit that differs: is there one request whose amount equals the difference in every year? (worked out from today's data)
      const oy = {};
      Y4.forEach((y, i) => ((P.by_department[y] || {}).capital || []).forEach(d => (d.units || []).forEach(u => { if (u.status === 'proposed') (oy[u.name] = oy[u.name] || [0, 0, 0, 0])[i] += u.value; })));
      const one = off.map(r => {
        const mine = cap.filter(c => buKey(c.bu) === r[0]);
        const dy = [0, 1, 2, 3].map(i => sum(mine.map(c => c.cap_k[i + 1])) / 1000 - ((oy[r[0]] || [])[i] || 0));
        const hit = mine.find(c => sum(c.cap_k.slice(1, 5)) > 0 && [0, 1, 2, 3].every(i => Math.abs((c.cap_k[i + 1] || 0) / 1000 - dy[i]) <= 0.2));
        return hit ? [r[0], hit] : null;
      }).filter(Boolean);
      add(off.length ? 'note' : 'pass', 'The same check, business unit by business unit', off.length ? `${fmt(names.length - off.length)} of ${fmt(names.length)} business units match within $1 million; ${fmt(off.length)} differ, and their differences net to ${usd(Math.abs(net))}.` : `All ${fmt(names.length)} business units match within $1 million.`,
        (off.length ? `<p>The ${fmt(off.length)} that differ almost cancel out, which suggests the two sources file some of the same projects under different business units (for example the unit that asks for a project and the unit that builds it). That is an inference from the numbers; the City has not published a mapping.</p>` : '')
        + (one.length ? `<p style="margin-top:8px">For ${fmt(one.length)} of them, a single request equals the difference in every year from 2027 to 2030 (within $0.2 million), which is what would be seen if the open data files that request under another unit: ${one.map(([n, c]) => `${esc(n)}: <button type="button" class="link-btn small" data-case="${c.n}">${c.n}. ${esc(c.title)}</button> (${usd(sum(c.cap_k.slice(1, 5)) / 1000)})`).join('; ')}.</p>` : '')
        + tbl(['Business unit ($ millions, 2027–2030)', 'Business cases', 'Open data, proposed', 'Difference'], diff.sort((a, c) => Math.abs(c[3]) - Math.abs(a[3])).map(r => [esc(r[0]), fmt(r[1], 1), fmt(r[2], 1), (Math.abs(r[3]) > 1 ? '<b>' : '') + fmt(Math.abs(r[3]) < 0.05 ? 0 : r[3], 1) + (Math.abs(r[3]) > 1 ? '</b>' : '')])),
        { Formula: 'for each business unit: Σ cases (2027–2030) − Σ open-data proposed capital (2027–2030)', Inputs: `business-cases.json, crosswalk.json, ${P.dataset}`, Limits: 'Business-unit names are matched through the crosswalk; a difference over $1 million is listed.' });
    }
    if (b) {
      const bad = [];
      b.years.forEach(y => ['operating', 'capital'].forEach(f => { const t = (b.totals[y] || {})[f], L = (b.by_department[y] || {})[f]; if (t && L && Math.abs(sum(L.map(d => d.value)) - t.value) > 0.6) bad.push(`${y} ${f}`); }));
      add(bad.length ? 'warn' : 'pass', 'Open budget: departments add up to each year’s total', bad.length ? 'They do not for: ' + bad.join(', ') : `For every year and fund from ${b.years[0]} to ${b.years[b.years.length - 1]}.`, '',
        { Formula: '|Σ departments − total| ≤ $0.6 million', Inputs: `${b.dataset} (read ${b.fetched})` });
      add('gap', 'Budget against actual spending cannot be compared', 'The open budget gives one figure per year and fund: approved or actual, never both.',
        'Operating is “Approved” for every year; capital is “Actual” for the oldest years and “Approved” after. So no variance is shown anywhere in the centre. See Budget vs actual for what would close the gap.', { Source: b.page });
      if (P) {
        const rows = Y4.filter(y => (b.totals[y] || {}).capital && isNum((P.totals[y].capital || {}).approved)).map(y => [y, b.totals[y].capital.value, P.totals[y].capital.approved]);
        const differs = rows.filter(r => Math.abs(r[1] - r[2]) > 1);
        // where the largest difference sits, unit by unit, as each dataset names its units (worked out from today's data; nothing is merged or renamed)
        let where = '';
        if (differs.length) {
          const yr = differs.slice().sort((x, y) => Math.abs(y[2] - y[1]) - Math.abs(x[2] - x[1]))[0][0];
          const unitsOf = (L, status) => { const m = {}; (L || []).forEach(d => (d.units || []).forEach(u => { if (!status || u.status === status) m[u.name] = (m[u.name] || 0) + u.value; })); return m; };
          const A = unitsOf((b.by_department[yr] || {}).capital), B = unitsOf(((P.by_department || {})[yr] || {}).capital, 'approved');
          const top = [...new Set([...Object.keys(A), ...Object.keys(B)])].map(n => [n, A[n], B[n], (B[n] || 0) - (A[n] || 0)]).filter(r => Math.abs(r[3]) >= 5).sort((x, y) => Math.abs(y[3]) - Math.abs(x[3])).slice(0, 10);
          const cellM = v => isNum(v) ? fmt(v, 1) : '<span class="bi-na">not listed</span>';
          if (top.length) where = `<p style="margin-top:10px"><b>Where the ${yr} difference is.</b> Business units as each dataset names them, where the two differ by $5 million or more:</p>`
            + tbl(['Business unit', `Open budget (${b.dataset})`, `2027–2030 Budget (${P.dataset})`, 'Difference'], top.map(r => [esc(r[0]), cellM(r[1]), cellM(r[2]), (r[3] > 0 ? '+' : '') + fmt(r[3], 1)]))
            + '<p style="margin-top:8px">A unit listed in only one dataset may be the same work under another name; the centre does not merge names. Money can also be moved between years from one publication to the next, so a difference in one year is not by itself a change in the total.</p>';
        }
        if (rows.length) add(differs.length ? 'note' : 'pass', 'Two City datasets give different figures for capital already approved', differs.length ? `For ${differs.map(r => r[0]).join(', ')} the 2023–2026 open budget and the 2027–2030 open data disagree.` : 'They agree.',
          tbl(['Capital already approved ($ millions)', ...rows.map(r => r[0])], [[`Open budget (${b.dataset})`, ...rows.map(r => fmt(r[1], 1))], [`2027–2030 Budget (${P.dataset})`, ...rows.map(r => fmt(r[2], 1))], ['Difference', ...rows.map(r => fmt(r[2] - r[1], 1))]])
          + '<p style="margin-top:8px">Neither figure is changed. The centre uses the 2027–2030 data for those years, because it is the newer publication and it is the one the proposed budget is built on; the City budget screen uses it for those years too, so the two are never added together. The City has not published a reconciliation.</p>' + where,
          { Formula: 'approved capital for the year, one dataset minus the other', Inputs: `${b.dataset}; ${P.dataset}` });
        const plan = b.plan_2027;
        if (plan) {
          const tot = sum(Y4.map(y => (P.totals[y].capital.approved || 0) + (P.totals[y].capital.proposed || 0)));
          add('note', 'The City’s headline for four-year capital is higher than its open data', `Headline: $${fmt(plan.headline.capital_2027_2030_billion)} billion. Open data for 2027 to 2030: ${usd(tot)}.`,
            `The open data adds to ${usd(tot)} for 2027 to 2030 (approved earlier plus proposed). The headline may count amounts in later years or be rounded up; the published sources do not say. The centre shows the open-data sums and does not use the headline in any calculation.`,
            { Formula: 'Σ approved + proposed capital, 2027–2030', Inputs: P.dataset, Source: (plan.documents || [[]])[0][1] || '' });
        }
      }
      if (b.revenue) {
        const R = b.revenue, bad2 = R.years.filter((y, i) => Math.abs(sum(R.lines.map(l => l.values[i])) - R.total[i]) > 2);
        add(bad2.length ? 'warn' : 'pass', 'Revenue sources add up to the total', bad2.length ? 'They do not for ' + bad2.join(', ') : `For ${R.years[0]} to ${R.years[R.years.length - 1]}, within $2 million of rounding.`, '', { Formula: '|Σ sources − total| ≤ 2 ($ millions)', Inputs: R.source });
      }
    }
    if (T) {
      const s = sum(Object.values(T.by_ward).map(v => v.municipal)), d = (T.city.municipal.total - s) / T.city.municipal.total * 100;
      add(Math.abs(d) < 0.5 ? 'pass' : 'warn', 'Property tax by ward adds up to the citywide levy', `The 14 wards hold ${fmt(100 - d, 2)}% of the municipal levy.`, `Citywide $${fmt(T.city.municipal.total / 1e6, 1)} million; wards $${fmt(s / 1e6, 1)} million. The remainder is property that has no ward in the assessment data.`,
        { Formula: 'Σ wards ÷ citywide', Inputs: `tax.json (${T.dataset}, read ${T.fetched})`, Period: String(T.year) });
    }
    if (S.BC && S.XW) {
      const od = new Set(), ob = new Set();
      if (P) Y4.forEach(y => ['operating', 'capital'].forEach(f => ((P.by_department[y] || {})[f] || []).forEach(d => { od.add(d.name); (d.units || []).forEach(u => ob.add(u.name)); })));
      const dn = uniq(c => c.dept), bn = uniq(c => c.bu);
      const dMapped = dn.filter(n => S.XW.departments[n]), bMapped = bn.filter(n => S.XW.business_units[n]);
      const bMiss = P ? bn.filter(n => !ob.has(buKey(n))) : [];
      add(bMiss.length ? 'note' : 'pass', 'Names matched between the two City sources', `${fmt(dn.length)} department names and ${fmt(bn.length)} business-unit names in the document; ${fmt(dMapped.length + bMapped.length)} needed a match by hand${bMiss.length ? `, ${fmt(bMiss.length)} could not be matched` : ''}.`,
        tbl(['As the document prints it', 'Open-data name', 'Why'], [...dMapped.map(n => [esc(n), esc(S.XW.departments[n].open_data), esc(S.XW.departments[n].basis)]), ...bMapped.map(n => [esc(n), esc(S.XW.business_units[n].open_data), esc(S.XW.business_units[n].basis)]),
          ...bMiss.map(n => [esc(n), '<span class="bi-na">not matched</span>', esc((S.XW.business_units_unmatched || {})[n] || 'Not in the open data’s list of business units with a budget line in 2027 to 2030.')])]),
        { Inputs: 'ui/budget-intel/crosswalk.json', Limits: 'The document’s names are never changed; the match is used only to group and compare.' });
    }
    const part = cases().filter(c => isNum(c.full_one_time_m));
    if (part.length) add('note', 'Some one-time requests are only partly in the proposed budget', `${fmt(part.length)} requests: ${usd(sum(part.map(c => sum(c.one_time_m))))} in their tables, ${usd(sum(part.map(c => c.full_one_time_m)))} stated as the full amounts.`,
      '<p>For these requests the City’s note under the table gives a larger four-year total than the table, and says the rest may or will be considered in later budget adjustments. The centre’s one-time totals add the tables, which is what the proposed budget includes; they are not the full amounts the notes state.</p>'
      + tbl(['Request', 'In the table ($M)', 'Full amount in the City’s note ($M)'], part.map(c => [`<button type="button" class="link-btn small" data-case="${c.n}">${c.n}. ${esc(c.title)}</button>`, fmt(sum(c.one_time_m), 1), fmt(c.full_one_time_m, 1)]))
      + '<p style="margin-top:8px">Both columns are the City’s figures as printed. Where a note’s own wording of the included amount differs from the table by $0.1 million, that is the City’s rounding; nothing is adjusted.</p>',
      { Formula: 'Σ one-time amounts in the table, against the total stated in the note', Inputs: 'one_time_m and full_one_time_m of each operating case' });
    add('note', 'Operating requests cannot be reconciled to a published total', 'The City publishes no total that the 124 operating requests should add to.', 'The open data gives each business unit’s whole operating budget, not the part that comes from new requests, so there is nothing to check the sum against. The requests’ own figures were still read twice and agree.', {});
    return (S.checks = out);
  }
  function checks(main) {
    const L = runChecks(), n = k => L.filter(c => c.res === k).length;
    const word = { pass: 'Passed', note: 'To know', warn: 'Check', gap: 'Missing' };
    main.innerHTML = `
      <section class="card"><div class="card-head"><div><h2>Checks on the figures in this centre</h2><p class="card-sub">Run in your browser on today’s data: ${fmt(n('pass'))} passed, ${fmt(n('note'))} to know about, ${fmt(n('warn'))} to check, ${fmt(n('gap'))} missing</p></div><div class="card-tools"><button type="button" class="link-btn small" data-method="budget_intelligence">How it’s counted</button></div></div>
        <p class="bi-lead">Every check says what was compared and how, so anyone can repeat it. <b>Nothing in a source is ever corrected to make a check pass:</b> where two City sources disagree, both figures are shown.</p>
        <div style="margin-top:12px">${L.map(c => `<details class="bi-check"><summary><span class="res ${c.res}">${word[c.res]}</span><span><b>${esc(c.title)}</b><br><span style="color:var(--muted-fg);font-size:12.5px">${esc(c.short)}</span></span></summary>
          <div class="body">${c.body}${Object.keys(c.meta).length ? `<dl>${Object.entries(c.meta).filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : ''}</div></details>`).join('')}</div></section>
      <section class="card"><div class="card-head"><div><h2>How fresh each source is</h2></div></div>
        <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Source</th><th scope="col">Kept up to date by</th><th scope="col">Last read</th></tr></thead><tbody>
          ${S.BUD ? `<tr><td>${src(`City open budget, 2023–2026 (${S.BUD.dataset})`, S.BUD.page)}</td><td>The morning refresh</td><td>${esc(S.BUD.fetched)}</td></tr><tr><td>${src(`2027–2030 Budget open data (${S.BUD.proposed.dataset})`, S.BUD.proposed.page)}</td><td>The morning refresh</td><td>${esc(S.BUD.proposed.fetched)}</td></tr>
          <tr><td>Revenue by source; the proposed budget’s headline, tax path and household figures</td><td>By hand, from the City’s budget documents</td><td>${esc((S.BUD.plan_2027 || {}).checked || '')}</td></tr>` : ''}
          ${S.TAX ? `<tr><td>Property assessments and the 2026 tax rates (${esc(S.TAX.dataset)})</td><td>The morning refresh</td><td>${esc(S.TAX.fetched)}</td></tr>` : ''}
          ${S.BC ? `<tr><td>${src('2027–2030 budget request business cases (PDF)', S.BC.source.url)}</td><td>By hand, when the City publishes a new version</td><td>${esc(S.BC.source.read)} (the City’s file last changed ${esc(longDate(S.BC.source.modified))})</td></tr>` : ''}
          <tr><td>The City’s performance measures; infrastructure condition</td><td>The morning refresh</td><td>Shown on their own sections</td></tr></tbody></table></div>
        <p class="card-note">The business cases are a snapshot of a document, not a live feed. If the City changes its open data after Council’s decisions, the first two reconciliation checks above will stop passing, which is the signal to read the new document.</p></section>`;
  }

  // ---------------------------------------------------------------- events and start
  async function renderBudgetIntel() {
    const view = $('#view-budget-intelligence'); if (!view) return;
    if (!S.BUD && !S.BC && !Object.keys(S.err).length) $('#bi-main').innerHTML = `<section class="card">${empty('Loading the budget and the business cases', '')}</section>`;
    await load();
    header();
    let sec = S.sec;
    try { const q = new URLSearchParams(location.search); if (q.get('bi')) sec = q.get('bi'); if (q.get('case') && S.BC) { S.open = +q.get('case'); sec = 'cases'; } } catch (e) { /* none */ }
    go(sec, true);
  }
  // Every redraw replaces the buttons it contains, so the focus is put back on the control that was used: a keyboard or
  // screen-reader user stays where they were instead of being sent to the top of the page.
  const refocus = sel => { const el = document.querySelector(sel); if (el) el.focus({ preventScroll: true }); };
  document.addEventListener('click', e => {
    const view = e.target.closest('#view-budget-intelligence'); if (!view) return;
    const s = e.target.closest('[data-sec]');
    if (s) {
      const inRail = !!s.closest('#bi-rail'), sec = s.dataset.sec;
      if (s.dataset.type !== undefined || s.dataset.q !== undefined) { S.f = { q: s.dataset.q || '', type: s.dataset.type || '', theme: '', dept: '', ward: '', rationale: '', risk: '', stage: '', fund: '', flag: '', sort: 'amount' }; S.open = null; S.page = 0; }
      go(sec);
      if (inRail) refocus(`#bi-rail [data-sec="${S.sec}"]`); else { const m = $('#bi-main'); m.tabIndex = -1; m.focus({ preventScroll: true }); }
      return;
    }
    const c = e.target.closest('[data-case]');
    if (c) { const n = +c.dataset.case; if (S.sec === 'cases' && S.open === n) { S.open = null; listCases(); } else openCase(n); refocus(`#bi-case-list [data-case="${n}"]`); return; }
    const pg = e.target.closest('[data-page]');
    if (pg) { const dir = pg.dataset.page; S.page += +dir; S.open = null; listCases(); const t = $('#bi-case-list'); if (t) t.scrollIntoView({ block: 'start' }); refocus(`.bi-pager [data-page="${dir}"]:not([disabled])`); if (!document.activeElement || !document.activeElement.closest('.bi-pager')) refocus('.bi-pager [data-page]:not([disabled])'); return; }
    const v = e.target.closest('.bi-seg [data-v]');
    if (v) { const id = v.parentElement.id; if (id === 'bi-op-years') S.opYear = v.dataset.v; if (id === 'bi-cap-years') S.capYear = v.dataset.v; if (id === 'bi-rev-years') S.revYear = v.dataset.v; go(S.sec, true); refocus(`#${id} [data-v="${v.dataset.v}"]`); return; }
    if (e.target.closest('#bi-export')) {
      const L = filtered();
      saveList(e.target.closest('#bi-export'), 'Calgary 2027-2030 budget requests', ['No.', 'Title', 'Kind', 'Council priority', 'Department', 'Business unit', 'Reason given', 'Capital total ($000s)', 'Capital 2027', 'Capital 2028', 'Capital 2029', 'Capital 2030', 'Capital 2031 and later', 'One-time 2027 ($M)', 'One-time 2028', 'One-time 2029', 'One-time 2030', 'Ongoing 2027 ($M)', 'Ongoing 2028', 'Ongoing 2029', 'Ongoing 2030', 'FTEs 2027', 'FTEs 2028', 'FTEs 2029', 'FTEs 2030', 'Full one-time amount in the City note ($M)', 'Ward(s)', 'Stage', 'Funding source', 'Service area', 'Budget ID', 'Status', 'Page in the City document'],
        L.map(c => [c.n, c.title, c.type, c.theme, c.dept, c.bu, c.rationale, ...(c.cap_k || Array(6).fill('')), ...(c.one_time_m || Array(4).fill('')), ...(c.ongoing_m || Array(4).fill('')), ...(c.ftes || Array(4).fill('')), isNum(c.full_one_time_m) ? c.full_one_time_m : '',
          c.type === 'capital' ? (c.wards === 'all' ? 'All wards' : c.wards.join('; ')) : '', c.stage || '', c.funding || '', c.service_area || '', c.budget_id || '', 'Proposed, not approved', c.page]));
    }
  });
  document.addEventListener('change', e => {
    if (!e.target.closest('#view-budget-intelligence')) return;
    if (e.target.name === 'bi-layer') { S.layer = e.target.value; drawMap(); return; }
    const f = e.target.dataset && e.target.dataset.f;
    if (f) { S.f[f] = e.target.value; S.page = 0; S.open = null; listCases(); }
  });
  // the section rail is a radio group: the arrow keys, Home and End move between sections, as in the rest of the site
  document.addEventListener('keydown', e => {
    const b = e.target.closest && e.target.closest('#bi-rail [role="radio"]'); if (!b) return;
    const all = Array.from(document.querySelectorAll('#bi-rail [role="radio"]')), i = all.indexOf(b);
    const to = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: all.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const sec = all[(to + all.length) % all.length].dataset.sec;
    go(sec, true);
    const n = document.querySelector(`#bi-rail [data-sec="${sec}"]`); if (n) n.focus();
  });
  let qT;
  document.addEventListener('input', e => { if (e.target.id === 'bi-q') { clearTimeout(qT); qT = setTimeout(() => { S.f.q = e.target.value; S.page = 0; S.open = null; listCases(); }, 180); } });

  // the screen draws itself when it is opened; the City budget screen and every other screen are untouched
  window.renderBudgetIntel = renderBudgetIntel;
  if (typeof window.show === 'function') {
    const base = window.show;
    window.show = function (view) {
      const r = base.apply(this, arguments);
      if (view === 'budget-intelligence') renderBudgetIntel();
      else { try { const u = new URL(location.href); if (u.searchParams.has('bi') || u.searchParams.has('case')) { u.searchParams.delete('bi'); u.searchParams.delete('case'); history.replaceState(null, '', u.pathname + u.search + u.hash); } } catch (e) { /* the address stays */ } }
      return r;
    };
  }
  // the theme changed: colours in charts and the map are read from the page, so draw the section again
  new MutationObserver(() => { const v = $('#view-budget-intelligence'); if (v && v.classList.contains('is-on') && (S.BUD || S.BC)) go(S.sec, true); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
