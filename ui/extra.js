/* Calgary Insight: period picker, data status, families and schools, growth and amenities.
   Uses the helpers and state defined in app.js. */
'use strict';

// ================================================================ PERIOD PICKER
const ymNow = () => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); };
function openPeriodMenu(open) {
  const m = $('#period-menu');
  m.hidden = !open;
  $('#period-pill').setAttribute('aria-expanded', String(open));
  if (open && D && D.period_spec) {
    const ps = D.period_spec;
    $$('#pm-quick button').forEach(b => b.classList.toggle('is-on', b.dataset.kind === ps.kind));
    $('#pm-start').value = ps.start; $('#pm-end').value = ps.end;
    $('#pm-cstart').value = ps.cstart; $('#pm-cend').value = ps.cend;
    $('#pm-start').max = $('#pm-end').max = $('#pm-cstart').max = $('#pm-cend').max = ymNow();
  }
}
function choosePeriod(p) {
  period = p && p.kind !== 'last12' ? p : null;
  try { period ? localStorage.setItem('w5-period', JSON.stringify(period)) : localStorage.removeItem('w5-period'); } catch { /* storage off */ }
  openPeriodMenu(false);
  $('#period-text').textContent = 'Loading the new period…';
  loadDashboard(false);
}
$('#period-pill').addEventListener('click', e => { e.stopPropagation(); openPeriodMenu($('#period-menu').hidden); });
document.addEventListener('click', e => { if (!e.target.closest('#period-menu, #period-pill')) openPeriodMenu(false); });
$$('#pm-quick button').forEach(b => b.addEventListener('click', () => choosePeriod({ kind: b.dataset.kind })));
$('#pm-own').addEventListener('change', e => $$('.pm-cmp').forEach(x => { x.hidden = !e.target.checked; }));
$('#pm-apply').addEventListener('click', () => {
  const st = $('#pm-start').value, en = $('#pm-end').value;
  const msg = $('#pm-msg');
  if (!st || !en || st > en) { msg.textContent = 'Pick a start month and an end month after it.'; return; }
  if (en > ymNow()) { msg.textContent = 'The period can only include complete months, up to ' + ymNow() + '.'; return; }
  const p = { kind: 'custom', start: st, end: en };
  if ($('#pm-own').checked) {
    if (!$('#pm-cstart').value || !$('#pm-cend').value || $('#pm-cstart').value > $('#pm-cend').value) { msg.textContent = 'Pick a comparison start and end month.'; return; }
    p.cstart = $('#pm-cstart').value; p.cend = $('#pm-cend').value;
  }
  choosePeriod(p);
});

// ================================================================ DATA STATUS
function renderStatusLabel() {
  if (!D || !D.status) return;
  const bad = D.status.filter(x => !x.ok);
  const sr = D.status.find(x => x.name === '311 requests');
  const today = localYmd();
  const when = sr && sr.city_updated ? (sr.city_updated.slice(0, 10) === today ? 'today' : longDate(sr.city_updated.slice(0, 10))) : '';
  if (D.stale) setStatus('stale', 'Offline: earlier data');
  else if (bad.length) setStatus('stale', `Live, ${bad.length} source${bad.length > 1 ? 's' : ''} not loaded`);
  else setStatus('ok', when ? `Live: 311 updated ${when}` : 'Live City data');
}
function openStatus() {
  if (!D || !D.status) return;
  $('#status-sub').textContent = `Dashboard built ${stampText(D.built_at)} (Calgary time)${D.stale ? ', offline: showing the last saved copy' : ''}.`;
  $('#status-table tbody').innerHTML = D.status.map((x, i) => {
    const pub = x.city_updated ? stampText(x.city_updated) : x.published ? 'Latest: ' + x.published : '–';
    const state = !x.ok ? `<span class="st bad">${icon('alert')}Not loaded</span>${x.error ? `<small>${esc(x.error)}</small>` : ''}`
      : x.note && /ends/i.test(x.note) ? `<span class="st warn">${icon('clock')}${esc(x.note)}</span>`
      : `<span class="st ok">${icon('check')}Loaded</span>${x.note ? `<small>${esc(x.note)}</small>` : ''}`;
    return `<tr class="pick" data-i="${i}" tabindex="0"><td>${esc(x.name)}</td><td>${esc(pub)}</td><td>${esc(x.fetched ? stampText(x.fetched) : '')}</td><td>${state}</td></tr>`;
  }).join('');
  $$('#status-table tbody tr').forEach(tr => {
    const go = () => { const x = D.status[+tr.dataset.i]; if (x.page) openUrl(x.page); };
    tr.addEventListener('click', go);
    tr.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });
  $('#status-dlg').hidden = false;
  $('#status-close').focus();
}
$('#side-status').addEventListener('click', openStatus);
$('#status-close').addEventListener('click', () => { $('#status-dlg').hidden = true; });
$('#status-dlg').addEventListener('click', e => { if (e.target.id === 'status-dlg') $('#status-dlg').hidden = true; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { $('#status-dlg').hidden = true; $('#fam-drawer').hidden = true; openPeriodMenu(false); } });

// ================================================================ DASHBOARD CARDS
let xcharts = {};
const fam = () => (D && D.families) || {};
function renderExtras() {
  Object.values(xcharts).forEach(c => c.destroy());
  xcharts = {};
  renderStatusLabel();
  renderChildCareCards();
  renderSchoolCards();
  renderGrowthCards();
  renderPopSeries();
  renderSafety();
  renderProfile();
  renderSourceNotes();
  const extra = [];
  if (fam().child_care || fam().schools)
    extra.push('Child care and school enrolment: Government of Alberta open data (Child Care Information; Student enrolment by school, authority and grade level), under the Open Government Licence – Alberta. Children aged 0 to 14 are ' + CY() + ' Census counts grown with ' + popWords() + '.');
  if (extra.length) $('#notes ul').insertAdjacentHTML('beforeend', extra.map(n => `<li>${esc(n)}</li>`).join(''));
}
function renderChildCareCards() {
  const cc = fam().child_care;
  $('#cc-card').hidden = $('#ccc-card').hidden = !cc;
  if (!cc) return;
  const first = cc.quarters[0], last = cc.quarters[cc.quarters.length - 1];
  $('#cc-sub').textContent = `How many children ${W()}'s licensed programs may care for at once, ${first.quarter} to ${last.quarter}`;
  const flagged = cc.programs.filter(p => p.counted && p.actions_12m).length;
  $('#cc-kpis').innerHTML = [
    [fmt(cc.spaces), `licensed child care spaces, ${cc.as_of}`, chg(pct(cc.spaces, cc.spaces_first), false, '%', 0, cc.first_quarter)],
    [fmt(cc.per_100_0_14, 1), `spaces per 100 children aged 0 to 14 (about ${fmt(cc.children_0_14)} estimated; ${CY()} Census: ${fmt(cc.children_0_14_2021)})`, ''],
    [fmt(cc.daycare_per_100_0_4, 1), `daycare and preschool spaces per 100 children under 5 (about ${fmt(cc.children_0_4)}; 2021: ${fmt(cc.children_0_4_2021)})`, ''],
    [fmt(cc.programs_counted), 'licensed child care programs (daycares, preschools, before- and after-school care)', ''],
    [fmt(flagged), 'programs where the province found a rule breach and ordered a fix, last 12 months', ''],
  ].map(([v, l, c]) => `<div class="mini"><b>${v}</b>${c}<span>${l}</span></div>`).join('');
  chartTheme();
  const q = cc.quarters, pal = [cssv('--chart-2'), '#0D9488', '#D97706', '#64748B'];
  xcharts.cc = new Chart($('#cc-chart'), {
    type: 'bar',
    data: { labels: q.map(x => x.quarter), datasets: [
      { label: 'Daycare', data: q.map(x => x.daycare), backgroundColor: pal[0] },
      { label: 'Out-of-school care', data: q.map(x => x.osc), backgroundColor: pal[1] },
      { label: 'Preschool', data: q.map(x => x.preschool), backgroundColor: pal[2] },
      { label: 'Other licensed', data: q.map(x => x.other), backgroundColor: pal[3] }] },
    options: { maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10 } },
        tooltip: { ...tooltipStyle(), callbacks: { footer: items => 'Total: ' + fmt(items.reduce((t, i) => t + i.parsed.y, 0)) + ' spaces' } } },
      scales: { x: { stacked: true, grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
                y: { stacked: true, beginAtZero: true, grid: { color: cssv('--chart-grid') }, ticks: { callback: v => fmt(v) } } } }
  });
  // a rate per 100 children means nothing where almost nobody lives (business parks, the university campus, land not
  // built yet): those are left out and named in the note
  const all = residential().map(c => ({ c, b: cc.by_comm[c.code] || {} }));
  const few = all.filter(r => (r.c.residents || 0) < 100 || (r.b.k0_14 || 0) < 20);
  const rows = all.filter(r => !few.includes(r)).sort((a, b) => (a.b.per_100_0_14 ?? -1) - (b.b.per_100_0_14 ?? -1));
  const top = Math.max(...rows.map(r => r.b.per_100_0_14 || 0), 1);
  $('#cc-comm').innerHTML = `<ul class="hbars">${rows.map(({ c, b }) => `<li class="${(b.spaces || 0) === 0 ? 'zero' : ''}" title="${esc(c.name)}: ${fmt(b.spaces || 0)} spaces; about ${fmt(b.k0_14)} children aged 0 to 14 (${CY()} Census: ${b.k0_14_2021 ? fmt(b.k0_14_2021) : 'not built'})">
      <span class="lbl">${esc(c.name)}</span>
      <span class="track"><span style="width:${(b.per_100_0_14 || 0) / top * 100}%"></span></span>
      <span class="v">${b.spaces ? fmt(b.per_100_0_14, 1) : '<b class="none">None</b>'}<small>${fmt(b.spaces || 0)} spaces, ~${fmt(b.k0_14)} children</small></span></li>`).join('')}</ul>
    <p class="card-note">Lowest first. ${W()} as a whole: ${fmt(cc.per_100_0_14, 1)}. ${esc(cc.children_note || '')} Family day home agencies are not counted.${few.length ? ` Left out because almost no children live there (fewer than 20, or under 100 residents): ${esc(few.map(r => titleCase(r.c.name)).join(', '))}. Their spaces still count in the total.` : ''}${few.some(r => r.c.code === 'UOC') ? ' The University of Calgary campus is its own community with no homes counted by the Census; its child care centre (West Campus, 3820 24 Avenue NW) is placed by its address in University District, next door.' : ''}</p>`;
}
function renderSchoolCards() {
  const sc = fam().schools;
  $('#sc-card').hidden = $('#scl-card').hidden = !sc;
  if (!sc) return;
  const t = sc.totals, first = t[0], last = t[t.length - 1];
  $('#sc-sub').textContent = `${fmt(last.students)} students at the ${sc.schools.filter(x => x.latest).length} schools located in ${W()}, ${sc.latest_year}: ${signed(pct(last.students, first.students), 0)} since ${first.year}. Includes students who live outside the ward.`;
  chartTheme();
  xcharts.sc = new Chart($('#sc-chart'), {
    type: 'bar',
    data: { labels: t.map(x => x.year.replace(/^(\d{4})\/\d{2}(\d{2})$/, '$1–$2')), datasets: [{ label: 'Students', data: t.map(x => x.students), backgroundColor: cssv('--chart-bar'), borderRadius: 3 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...tooltipStyle(), callbacks: { label: c => ' ' + fmt(c.parsed.y) + ' students' } } },
      scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: cssv('--chart-grid') }, ticks: { callback: v => fmt(v) } } } }
  });
  const list = sc.schools.filter(x => x.latest).slice(0, 8);
  $('#scl-sub').textContent = `${sc.latest_year}, with the change since ${list[0] && list[0].base_year ? list[0].base_year : 'five years earlier'}`;
  $('#sc-list').innerHTML = `<table class="data compact"><thead><tr><th scope="col">School</th><th scope="col">Grades</th><th scope="col">Community</th><th scope="col" class="num">Students</th><th scope="col" class="num">Change</th></tr></thead>
    <tbody>${list.map(x => `<tr><td>${esc(x.name)}</td><td>${esc(shortGrades(x.grades))}</td><td>${esc(commName(x.comm))}</td><td class="num">${fmt(x.latest)}</td>
      <td class="num">${isNum(x.change_pct) ? chg(x.change_pct, null, '%', 0, x.base_year) : '<span class="dash">–</span>'}</td></tr>`).join('')}</tbody></table>`;
}
const shortGrades = g => String(g || '').replace(/Grade /g, '').replace(' to ', '–');
function renderGrowthCards() {
  const dv = D.development, rw = D.roadwork, am = D.amenities;
  $('#dp-card').hidden = !dv; $('#rw-card').hidden = !rw; $('#am-card').hidden = !am;
  if (dv) {
    $('#dp-sub').textContent = `Applications made ${D.period}`;
    const types = dv.by_type || [];
    const big = types.filter(t => t.larger), small = types.filter(t => !t.larger);
    const top = Math.max(...types.map(t => t.n), 1);
    const row = t => `<li><span class="lbl" title="${esc(t.type)}">${esc(t.type)}</span><span class="track"><span class="${t.larger ? '' : 'grey'}" style="width:${t.n / top * 100}%"></span></span><span class="v">${fmt(t.n)}</span></li>`;
    $('#dp-sum').innerHTML = `<div class="big"><span class="kpi-value">${fmt(dv.larger)}</span>${chg(dv.larger_change_pct, null, '%', 1, cmpWords())}
        <span class="kpi-foot">larger developments: new homes and apartment buildings, changes of use, new commercial and industrial buildings. ${fmt(dv.larger_released)} approved so far. All applications: ${fmt(dv.applied)}.</span></div>
      <ul class="hbars dp-types">${big.map(row).join('')}</ul>
      <details class="dp-more"><summary>Smaller applications: ${fmt(small.reduce((t, x) => t + x.n, 0))}</summary><ul class="hbars dp-types">${small.map(row).join('')}</ul></details>
      <p class="card-note">A development permit is the City's approval of what can be built on a property or how it is used, before a building permit. "Change of use" includes new child care centres, schools, clinics and places of worship. Source: City of Calgary Development Permits, by the permit's ward.</p>`;
  }
  if (rw) {
    const rwItem = r => `<li><div><strong>${esc(r.title)}</strong>
        <small>${esc(r.type)}${r.completion ? '. Expected to finish: ' + esc(r.completion) : ''}${r.budget ? '. Budget: ' + esc(r.budget) : ''}${r.in_ward ? '' : '. Just outside ' + W() + ''}</small></div>
        ${r.url ? `<button class="btn icon-only" data-open="${esc(r.url)}" aria-label="Project page for ${esc(r.title)}">${icon('open')}</button>` : ''}</li>`;
    $('#rw-list').innerHTML = rw.length ? `<ul class="rw">${rw.slice(0, 5).map(rwItem).join('')}</ul>${rw.length > 5 ? `<details class="dash-more"><summary>${fmt(rw.length - 5)} more projects</summary><ul class="rw">${rw.slice(5).map(rwItem).join('')}</ul></details>` : ''}
        <p class="card-note">The City lists its larger road projects here; smaller repairs and utility work are not included.</p>`
      : '<p class="card-sub">No City road construction projects are listed in or near ' + W() + ' right now.</p>';
  }
  if (am) {
    const kids = (fam().child_care || {}).by_comm || {};
    const rows = residential().map(c => {
      const a = am.by_comm[c.code] || {}, k = (kids[c.code] || {}).k0_14;
      return { c, a, kpp: a.playgrounds && k ? Math.round(k / a.playgrounds) : null };
    }).sort((x, y) => (y.kpp ?? Infinity) - (x.kpp ?? Infinity));
    $('#am-sum').innerHTML = `<table class="data compact wrap-head"><thead><tr><th scope="col">Community</th><th scope="col" class="num">Play&shy;grounds</th><th scope="col" class="num">Children per playground</th><th scope="col" class="num">Stops per 1,000</th></tr></thead>
      <tbody>${rows.map(({ c, a, kpp }) => `<tr><td>${esc(c.name)}</td><td class="num">${fmt(a.playgrounds)}</td><td class="num">${kpp ? fmt(kpp) : '<span class="dash">–</span>'}</td><td class="num">${fmt(a.stops_per_1000, 1)}</td></tr>`).join('')}</tbody></table>
      <p class="card-note">Most children per playground first. Playgrounds are City play structures; children are aged 0 to 14.</p>
      ${(D.projects || []).filter(p => p.amenity && (p.state === 'building' || p.state === 'completed')).map(p => `<p class="coming">${icon(p.state === 'completed' ? 'check' : 'crane')}<span><b>${p.state === 'completed' ? 'Now open' : 'Being built'}:</b> <button class="link-btn small" data-open="${esc(p.url)}">${esc(p.title)}</button>, ${esc(p.comm ? commName(p.comm) : '' + W() + '')}. ${esc(p.status)}. ${esc(p.budget)}.</span></p>`).join('')}`;
  }
}
document.addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) openUrl(b.dataset.open); });

// ================================================================ MAP LAYERS
function extraMapLayers(overlay, on) {
  const cc = fam().child_care, sc = fam().schools, dv = D.development, rw = D.roadwork, am = D.amenities;
  const pin = (lat, lon, cls, html, tip) => L.marker([lat, lon], { icon: dotIcon(cls, html) }).bindTooltip(tip);
  if (on.childcare && cc) overlay.childcare = L.layerGroup(cc.programs.filter(p => isNum(p.lat)).map(p =>
    pin(p.lat, p.lon, 'mk-cc', '', `<strong>${esc(p.name)}</strong><br>${esc(p.kind)}, ${fmt(p.capacity)} spaces${p.actions_12m ? `<br>${fmt(p.actions_12m)} enforcement action(s) in 12 months` : ''}`))).addTo(map);
  if (on.schools && sc) overlay.schools = L.layerGroup(sc.schools.filter(x => isNum(x.lat)).map(x =>
    pin(x.lat, x.lon, 'mk-sc', '', `<strong>${esc(x.name)}</strong><br>${esc(x.grades)}${x.latest ? `, ${fmt(x.latest)} students` : ''}`))).addTo(map);
  if (on.devpermits && dv) overlay.devpermits = L.layerGroup(dv.list.filter(p => p.lat).slice(0, 800).map(p =>
    L.circleMarker([p.lat, p.lon], { radius: 4, color: '#fff', weight: 1, fillColor: '#7C3AED', fillOpacity: .9 })
      .bindTooltip(`<strong>${esc(p.id)}</strong> ${esc(p.status)}<br>${esc(p.address)}<br>${esc(p.category)}`))).addTo(map);
  if (on.roadwork) overlay.roadwork = L.layerGroup([
    ...(D.projects || []).filter(p => isNum(p.lat)).map(p => pin(p.lat, p.lon, 'mk-rw', icon('crane'), `<strong>${esc(p.title)}</strong><br>${esc(p.status || '')}<br>${esc(p.budget || '')}`)),
    ...(rw || []).map(r => pin(r.lat, r.lon, 'mk-rw', icon('cone'), `<strong>${esc(r.title)}</strong><br>${esc(r.completion || '')}`)),
    ...(D.big_permits || []).filter(p => isNum(p.lat)).map(p => pin(p.lat, p.lon, 'mk-rw', icon('crane'), `<strong>${esc(p.title)}</strong><br>Building permit ${esc(p.id)}, ${esc(p.budget)}<br>${esc(p.address)}`)),
  ]).addTo(map);
  if (on.amenities && am) overlay.amenities = L.layerGroup(am.facilities.map(f => pin(f.lat, f.lon, 'mk-am', '', `<strong>${esc(f.name)}</strong><br>${esc(f.type)}`))).addTo(map);
  if (on.playgrounds && am && am.playgrounds) overlay.playgrounds = L.layerGroup(am.playgrounds.map(p =>
    L.circleMarker([p[0], p[1]], { radius: 3.5, color: '#fff', weight: 1, fillColor: '#16A34A', fillOpacity: .95 }).bindTooltip('Playground' + (p[2] ? ': ' + esc(p[2]) : '')))).addTo(map);
  if (on.stops && am && am.stops) overlay.stops = L.layerGroup(am.stops.map(p =>
    L.circleMarker([p[0], p[1]], { radius: 2.5, color: '#0F172A', weight: .5, fillColor: '#F59E0B', fillOpacity: .9 }).bindTooltip(esc(p[2] || 'Transit stop')))).addTo(map);
  if (window.busLayer) busLayer(overlay, !!on.buses);
}

// ================================================================ FAMILIES TAB
let famView = 'cc';
wireSeg($('#fam-seg'), v => { famView = v; renderFamilies(); });
const ccF = { text: '', comm: '', kind: '', record: '', size: '', sort: 'spaces' };
const scF = { text: '', comm: '', board: '', level: '', change: '', sort: 'students' };
const boardGroup = b => /catholic/i.test(b || '') ? 'Catholic' : /calgary school division|calgary board/i.test(b || '') ? 'Public' : 'Other';
function ccRows() {
  const cc = fam().child_care;
  if (!cc) return [];
  const q = ccF.text.trim().toLowerCase();
  let rows = cc.programs.filter(p => (!ccF.comm || p.comm === ccF.comm) && (!ccF.kind || p.kind === ccF.kind)
    && (!ccF.record || (ccF.record === 'breach' ? p.noncompliance_12m > 0 : ccF.record === 'action' ? p.actions_12m > 0 : (!p.noncompliance_12m && !p.actions_12m)))
    && (!ccF.size || (ccF.size === 's' ? p.capacity < 50 : ccF.size === 'm' ? p.capacity >= 50 && p.capacity <= 100 : p.capacity > 100))
    && (!q || [p.name, p.address, p.phone].join(' ').toLowerCase().includes(q)));
  const by = { spaces: (a, b) => b.capacity - a.capacity, breaches: (a, b) => b.noncompliance_12m - a.noncompliance_12m || b.actions_12m - a.actions_12m,
    name: (a, b) => a.name.localeCompare(b.name), newest: (a, b) => quarterKey(b.since) - quarterKey(a.since) };
  return rows.slice().sort(by[ccF.sort] || by.spaces);
}
const quarterKey = q => { const m = /^(\w{3}) (\d{4})$/.exec(q || ''); return m ? +m[2] * 12 + ['Mar', 'Jun', 'Sep', 'Dec'].indexOf(m[1]) * 3 : 0; };
function scRows() {
  const sc = fam().schools;
  if (!sc) return [];
  const q = scF.text.trim().toLowerCase();
  let rows = sc.schools.filter(x => (!scF.comm || x.comm === scF.comm) && (!scF.board || boardGroup(x.board) === scF.board)
    && (!scF.level || (x.level || []).includes(scF.level))
    && (!scF.change || (scF.change === 'up' ? x.change_pct > 0 : scF.change === 'down' ? x.change_pct < 0 : true))
    && (!q || (x.name || '').toLowerCase().includes(q)));
  const by = { students: (a, b) => (b.latest || 0) - (a.latest || 0), growth: (a, b) => (b.change_pct ?? -1e9) - (a.change_pct ?? -1e9), name: (a, b) => a.name.localeCompare(b.name) };
  return rows.slice().sort(by[scF.sort] || by.students);
}
function famFilters() {
  const cc = fam().child_care, sc = fam().schools;
  const opt = (v, l, cur) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(l)}</option>`;
  const comms = residential().map(c => opt(c.code, c.name, famView === 'cc' ? ccF.comm : scF.comm)).join('');
  const box = $('#fam-filters');
  if (famView === 'cc' && cc) {
    const kinds = [...new Set(cc.programs.map(p => p.kind))].sort();
    box.innerHTML = `<label class="f-search">${icon('search')}<span class="sr">Search</span><input id="ff-text" type="search" placeholder="Search program name, address or phone" value="${esc(ccF.text)}"></label>
      <label><span>Community</span><select data-f="comm"><option value="">All of ${W()}</option>${comms}</select></label>
      <label><span>Type</span><select data-f="kind"><option value="">All types</option>${kinds.map(k => opt(k, k, ccF.kind)).join('')}</select></label>
      <label><span>Inspection record, 12 months</span><select data-f="record">${opt('', 'Any', ccF.record)}${opt('breach', 'With a rule breach found', ccF.record)}${opt('action', 'With an enforcement action', ccF.record)}${opt('clean', 'No breaches found', ccF.record)}</select></label>
      <label><span>Size</span><select data-f="size">${opt('', 'Any', ccF.size)}${opt('s', 'Under 50 spaces', ccF.size)}${opt('m', '50 to 100 spaces', ccF.size)}${opt('l', 'Over 100 spaces', ccF.size)}</select></label>
      <label><span>Sort</span><select data-f="sort">${opt('spaces', 'Most spaces', ccF.sort)}${opt('breaches', 'Most rule breaches', ccF.sort)}${opt('name', 'Name', ccF.sort)}${opt('newest', 'Newest licence', ccF.sort)}</select></label>`;
  } else if (famView === 'sc' && sc) {
    box.innerHTML = `<label class="f-search">${icon('search')}<span class="sr">Search</span><input id="ff-text" type="search" placeholder="Search school name" value="${esc(scF.text)}"></label>
      <label><span>Community</span><select data-f="comm"><option value="">All of ${W()}</option>${comms}</select></label>
      <label><span>Board</span><select data-f="board">${opt('', 'Any', scF.board)}${opt('Public', 'Public (Calgary School Division)', scF.board)}${opt('Catholic', 'Catholic', scF.board)}${opt('Other', 'Other', scF.board)}</select></label>
      <label><span>Grades</span><select data-f="level">${opt('', 'Any', scF.level)}${opt('elementary', 'Elementary (kindergarten to 6)', scF.level)}${opt('junior', 'Junior high (7 to 9)', scF.level)}${opt('high', 'High school (10 to 12)', scF.level)}</select></label>
      <label><span>Enrolment</span><select data-f="change">${opt('', 'Any', scF.change)}${opt('up', 'Growing', scF.change)}${opt('down', 'Shrinking', scF.change)}</select></label>
      <label><span>Sort</span><select data-f="sort">${opt('students', 'Most students', scF.sort)}${opt('growth', 'Fastest growth', scF.sort)}${opt('name', 'Name', scF.sort)}</select></label>`;
  } else { box.innerHTML = ''; return; }
  const F = famView === 'cc' ? ccF : scF;
  let t;
  $('#ff-text', box).addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { F.text = e.target.value; renderFamilies(true); }, 200); });
  $$('select[data-f]', box).forEach(sel => sel.addEventListener('change', () => { F[sel.dataset.f] = sel.value; renderFamilies(true); }));
}
function renderFamilies(keepFilters) {
  if (!D) return;
  const cc = fam().child_care, sc = fam().schools, head = $('#fam-table thead'), body = $('#fam-table tbody');
  if (!keepFilters) famFilters();
  $('#fam-compare').hidden = famView !== 'sc' || !sc || !cc;
  if (famView === 'cc') {
    if (!cc) { $('#fam-stats').innerHTML = ''; head.innerHTML = ''; body.innerHTML = `<tr><td class="empty">Child care data is not available right now. ${esc((fam().errors || []).join(' '))}</td></tr>`; return; }
    const progs = ccRows(), counted = progs.filter(p => p.counted);
    $('#fam-sub').textContent = `Each row is one licensed program: a daycare, preschool or before- and after-school care service at one address. ${W()}, ${cc.as_of} (Government of Alberta).`;
    $('#fam-stats').innerHTML = [[fmt(counted.reduce((t, p) => t + p.capacity, 0)), 'licensed spaces (how many children may be cared for at once)'], [fmt(counted.length), 'programs counted'],
      [fmt(progs.filter(p => p.noncompliance_12m).length), 'with a rule breach found, 12 months', 'bad'],
      [fmt(progs.filter(p => p.actions_12m).length), 'ordered to fix something, 12 months', 'bad'],
      [fmt(progs.length) + ' of ' + fmt(cc.programs.length), 'programs shown']].map(([b, s, c]) => `<div class="istat ${c || ''}"><b>${b}</b><span>${s}</span></div>`).join('');
    head.innerHTML = '<tr><th scope="col">Program</th><th scope="col">Type</th><th scope="col">Community</th><th scope="col" class="num">Spaces</th><th scope="col">Licensed since</th><th scope="col" class="num">Inspection visits, 12 months</th><th scope="col" class="num">Rule breaches found, 12 months</th><th scope="col">Latest enforcement</th></tr>';
    body.innerHTML = progs.map((p, i) => `<tr class="pick" data-i="${i}" tabindex="0">
      <td>${esc(p.name)}</td><td>${esc(p.kind)}${p.counted ? '' : ' <span class="tag muted">not counted</span>'}</td><td>${esc(p.comm ? commName(p.comm) : '–')}</td>
      <td class="num">${fmt(p.capacity)}</td><td>${esc(p.since || '')}</td><td class="num">${fmt(p.visits_12m)}</td>
      <td class="num">${p.noncompliance_12m ? `<span class="age old">${fmt(p.noncompliance_12m)}</span>` : '0'}</td><td>${esc(p.last_action || '–')}</td></tr>`).join('')
      || '<tr><td colspan="8" class="empty">No programs match these filters.</td></tr>';
    $$('#fam-table tbody tr.pick').forEach(tr => {
      const go = () => { $$('#fam-table tr.is-sel').forEach(x => x.classList.remove('is-sel')); tr.classList.add('is-sel'); openProgram(progs[+tr.dataset.i]); };
      tr.addEventListener('click', go);
      tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    $('#fam-notes').innerHTML = `<strong>What a rule breach means:</strong> a provincial licensing officer inspected the program and found something that did not meet Alberta's child care licensing rules, for example staff-to-child ratios, records, equipment or safety. The usual result is an "order to remedy": the program must fix it by a set date, and a follow-up visit checks it. A breach does not mean a child was harmed; many are paperwork or equipment. ${esc(cc.note)} "Licensed since" is the first quarter the program appears in the province's files (from March 2021). Source: <button class="link-btn small" data-open="${esc(cc.page)}">Government of Alberta, Child Care Information</button>.`;
  } else {
    if (!sc) { $('#fam-stats').innerHTML = ''; head.innerHTML = ''; body.innerHTML = '<tr><td class="empty">School enrolment data is not available right now.</td></tr>'; return; }
    const years = sc.years.slice(-4), rows = scRows(), t = sc.totals;
    $('#fam-sub').textContent = `Students enrolled at each school located in ${W()}, ${sc.years[0]} to ${sc.latest_year} (Government of Alberta). Includes students who live outside the ward.`;
    $('#fam-stats').innerHTML = [[fmt(rows.reduce((n, x) => n + (x.latest || 0), 0)), `students, ${sc.latest_year}`], [signed(pct(t[t.length - 1].students, t[0].students), 0), `all ${W()} schools since ${t[0].year}`],
      [fmt(rows.length) + ' of ' + fmt(sc.schools.length), 'schools shown'], [fmt((sc.unmatched || []).length), 'schools not in the province\'s file']]
      .map(([b, s]) => `<div class="istat"><b>${b}</b><span>${s}</span></div>`).join('');
    head.innerHTML = `<tr><th scope="col">School</th><th scope="col">Board</th><th scope="col">Grades</th><th scope="col">Community</th>${years.map(y => `<th scope="col" class="num">${esc(y.replace(/^(\d{4})\/\d{2}(\d{2})$/, '$1–$2'))}</th>`).join('')}<th scope="col" class="num">Change</th></tr>`;
    body.innerHTML = rows.map(x => `<tr><td>${esc(x.name)}</td><td>${esc(x.board || '')}</td><td>${esc(shortGrades(x.grades))}</td><td>${esc(x.comm ? commName(x.comm) : '–')}</td>
      ${years.map(y => `<td class="num">${isNum(x.enrolment[y]) ? fmt(x.enrolment[y]) : '<span class="dash">–</span>'}</td>`).join('')}
      <td class="num">${isNum(x.change_pct) ? chg(x.change_pct, null, '%', 0, x.base_year) : '<span class="dash">–</span>'}</td></tr>`).join('')
      || `<tr><td colspan="${years.length + 5}" class="empty">No schools match these filters.</td></tr>`;
    renderCompare();
    $('#fam-notes').innerHTML = `${esc(sc.note)} Change is against ${esc(sc.schools[0] && sc.schools[0].base_year || 'five years earlier')}; it is not shown for schools that had fewer than 50 students then.${(sc.unmatched || []).length ? ' Not in the province\'s file: ' + esc(sc.unmatched.join(', ')) + '.' : ''} Source: <button class="link-btn small" data-open="${esc(sc.page)}">Government of Alberta, student enrolment</button>.`;
  }
}
// school-age children (estimate) against students at Ward 5 schools
function renderCompare() {
  const sc = fam().schools, ps = D.pop_series, cc = fam().child_care;
  if (!sc || !ps || !cc) return;
  const t = sc.totals, y21 = t.find(x => x.year === '2021/2022') || t[0], yNow = t[t.length - 1];
  const kids21 = (ps.census_children_0_14 || 0) - (ps.census_children_0_4 || 0);
  const kidsNow = (cc.children_0_14 || 0) - (cc.children_0_4 || 0);
  $('#fam-compare').innerHTML = `<div class="card-head"><div><h2>School-age children against students</h2><p class="card-sub">Ages 5 to 14 living in ${W()}, against students in kindergarten to Grade 9 at ${W()} schools</p></div></div>
    <table class="data compact"><thead><tr><th scope="col"><span class="sr">Group</span></th><th scope="col" class="num">2021</th><th scope="col" class="num">Today</th><th scope="col" class="num">Growth</th></tr></thead><tbody>
      <tr><td>Children aged 5 to 14 living in ${W()}</td><td class="num">${fmt(kids21)} <small>(Census)</small></td><td class="num">${fmt(kidsNow)} <small>(estimate)</small></td><td class="num">${signed(pct(kidsNow, kids21), 0)}</td></tr>
      <tr><td>Students, kindergarten to Grade 9, at ${W()} schools</td><td class="num">${fmt(y21.k_to_9)} <small>(${esc(y21.year)})</small></td><td class="num">${fmt(yNow.k_to_9)} <small>(${esc(yNow.year)})</small></td><td class="num">${signed(pct(yNow.k_to_9, y21.k_to_9), 0)}</td></tr>
      <tr><td>Students as a share of children</td><td class="num">${fmt(y21.k_to_9 / kids21 * 100, 0)}%</td><td class="num">${fmt(yNow.k_to_9 / kidsNow * 100, 0)}%</td><td></td></tr>
    </tbody></table>
    <p class="card-note">If enrolment grows faster than the estimate of children, the estimate may be too low. Other things move these numbers too: students cross ward lines both ways (Catholic, charter and private schools, and high schools elsewhere), new schools draw students in, and kindergarten is not exactly age 5. ${esc(cc.children_note || '')}</p>`;
}
function openProgram(p) {
  const dr = $('#fam-drawer');
  dr.innerHTML = `<div class="drawer-head"><div><p class="card-sub">${esc(p.kind)}</p><h2>${esc(p.name)}</h2></div>
      <button class="brief-close" id="fam-close" aria-label="Close details" style="color:var(--fg);border-color:var(--border-strong)">${icon('x')}</button></div>
    <dl><dt>Address</dt><dd>${esc(p.address)} ${esc(p.postal || '')}</dd><dt>Community</dt><dd>${esc(p.comm ? commName(p.comm) : '–')}</dd>
      <dt>Licensed spaces</dt><dd>${fmt(p.capacity)}${p.counted ? '' : ' (agency: not counted in ' + W() + ' totals)'}</dd>
      <dt>Phone</dt><dd>${esc(p.phone || '–')}</dd><dt>Licensed since</dt><dd>${esc(p.since || '–')}</dd>
      <dt>Last visit</dt><dd>${esc(p.last_visit || '–')}</dd></dl>
    <h3 class="sub-h">Inspection record</h3>
    <ul class="record-list">${(p.record || []).slice().reverse().map(r => `<li class="${r.action ? 'act' : r.finding ? 'find' : ''}">
      <b>${esc(r.date)}</b> ${esc(r.reason)}${r.finding ? `<br><span>Rule breach found: ${esc(r.finding)}</span>` : ''}${r.action ? `<br><span>Action: ${esc(r.action)}${r.remedy ? ', remedied ' + esc(r.remedy) : ''}</span>` : ''}</li>`).join('') || '<li>No inspections on file.</li>'}</ul>
    <p class="drawer-note">From the Government of Alberta's Child Care Information files. The province publishes these records quarterly.</p>`;
  dr.hidden = false;
  $('#fam-close').addEventListener('click', () => { dr.hidden = true; });
  $('#fam-close').focus();
}
$('#fam-export').addEventListener('click', e => {
  const button = e.currentTarget;
  if (!D) return;
  const cc = fam().child_care, sc = fam().schools;
  let name, cols, rows;
  if (famView === 'cc' && cc) {
    name = '' + W() + ' child care programs ' + cc.as_of;
    cols = ['Program', 'Type', 'Community', 'Address', 'Postal code', 'Phone', 'Licensed spaces', 'Counted in ' + W() + ' totals', 'Licensed since', 'Inspection visits, 12 months', 'Rule breaches found, 12 months', 'Enforcement actions, 12 months', 'Latest enforcement'];
    rows = ccRows().map(p => [p.name, p.kind, p.comm ? commName(p.comm) : '', p.address, p.postal, p.phone, p.capacity, p.counted ? 'Yes' : 'No', p.since || '', p.visits_12m, p.noncompliance_12m, p.actions_12m, p.last_action || '']);
  } else if (sc) {
    name = '' + W() + ' school enrolment ' + sc.latest_year.replace('/', '-');
    cols = ['School', 'Board', 'Grades', 'Community', ...sc.years];
    rows = scRows().map(x => [x.name, x.board, x.grades, x.comm ? commName(x.comm) : '', ...sc.years.map(y => x.enrolment[y] ?? '')]);
  } else return;
  saveList(button, name, cols, rows);
});

// ================================================================ GROWTH TAB
let grView = 'gap';
wireSeg($('#gr-seg'), v => { grView = v; renderGrowth(); });
const grFilter = { text: '', comm: '', status: '', type: 'larger' };
function grRows() {
  const dv = D.development;
  if (!dv) return [];
  const q = grFilter.text.trim().toLowerCase();
  const typeOk = p => !grFilter.type || (grFilter.type === 'larger' ? (dv.larger_types || []).includes(p.type) : p.type === grFilter.type);
  return dv.list.filter(p => typeOk(p) && (!grFilter.comm || p.comm === grFilter.comm) && (!grFilter.status || p.status === grFilter.status)
    && (!q || [p.id, p.address, p.category, p.what, p.use].join(' ').toLowerCase().includes(q)));
}
// City projects, road projects and the largest non-housing building permits, as one list
function beingBuilt() {
  const where = r => r.address || (r.in_ward === false ? 'Near ' + W() + '' : (r.comm ? commName(r.comm) : '' + W() + ''));
  return [
    ...[...(D.projects || [])].sort((a, b) => ({ building: 0, planned: 1, completed: 2 }[a.state] ?? 1) - ({ building: 0, planned: 1, completed: 2 }[b.state] ?? 1)).map(p => ({ title: p.title, url: p.url, state: p.state, overdue: p.overdue_note, done: p.completed_note, kind: (p.kind || 'Project') + (p.owner ? ' (' + p.owner + ')' : ''), stage: p.state === 'completed' ? p.completed_note : `${p.status}${p.completion ? '. ' + p.completion : ''}`, cost: p.budget, where: [p.comm ? commName(p.comm) : '', p.address].filter((x, i, a) => x && a.indexOf(x) === i).join(', '), what: p.what })),
    ...(D.roadwork || []).map(r => ({ title: r.title, url: r.url, kind: r.type || 'Road project', stage: r.completion ? 'Expected to finish ' + r.completion : '', cost: r.budget, where: r.in_ward ? (r.comm ? commName(r.comm) : '' + W() + '') : 'Near ' + W() + '', what: r.what })),
    ...(D.big_permits || []).map(p => ({ title: p.title, id: p.id, kind: 'Building permit' + (p.type ? ': ' + p.type : ''), stage: `Issued ${dmy(p.issued)}${p.status ? ', ' + p.status : ''}`, cost: p.budget, where: `${p.comm ? commName(p.comm) + ', ' : ''}${p.address || ''}`, what: '' })),
  ];
}
function renderGrowth() {
  if (!D) return;
  const head = $('#gr-table thead'), body = $('#gr-table tbody');
  $('#gr-filters').hidden = grView !== 'dp';
  $('#gr-note').hidden = grView !== 'dp';
  $('#gr-table').classList.toggle('bb', grView === 'rw');
  $('#gr-gap').hidden = !['gap', 'assets', 'recon', 'srg'].includes(grView);
  $('#gr-list').hidden = ['gap', 'assets', 'recon', 'srg'].includes(grView);
  if (grView === 'gap') { renderGap(); return; }
  if (grView === 'srg') { renderForecast(); return; }
  if (grView === 'recon') { renderRecon(); return; }
  if (grView === 'assets') { renderAssets(); return; }
  if (grView === 'dp') {
    const dv = D.development;
    if (!dv) { head.innerHTML = ''; body.innerHTML = '<tr><td class="empty">Development permit data is not available right now.</td></tr>'; $('#gr-stats').innerHTML = ''; return; }
    const rz = dv.rezoning, dpOnly = dv.list.filter(p => !p.rezoning);
    const comms = [...new Set(dv.list.map(p => p.comm))].filter(Boolean).map(c => [c, commName(c)]).sort((a, b) => a[1].localeCompare(b[1]));
    $('#gr-comm').innerHTML = '<option value="">All of ' + W() + '</option>' + comms.map(([c, n]) => `<option value="${esc(c)}">${esc(n)}</option>`).join('');
    $('#gr-comm').value = grFilter.comm;
    const rzStatus = {};
    dv.list.filter(p => p.rezoning).forEach(p => { if (!dv.by_status.some(s => s.status === p.status)) rzStatus[p.status] = (rzStatus[p.status] || 0) + 1; });
    $('#gr-status').innerHTML = '<option value="">Any status</option>' + dv.by_status.map(s => `<option value="${esc(s.status)}">${esc(s.status)} (${fmt(s.n)})</option>`).join('')
      + Object.entries(rzStatus).map(([k, n]) => `<option value="${esc(k)}">${esc(k)} (rezoning, ${fmt(n)})</option>`).join('');
    const rzN = dv.list.filter(p => p.rezoning).length;
    $('#gr-type').innerHTML = `<option value="larger">Larger developments and rezonings (${fmt(dv.larger + rzN)})</option><option value="">All types (${fmt(dv.applied + rzN)})</option>` +
      (rz ? `<option value="Rezoning (land use change)">Rezoning applications (LOC) (${fmt(rzN)})</option>` : '') +
      (dv.by_type || []).map(t => `<option value="${esc(t.type)}">${esc(t.type)} (${fmt(t.n)})</option>`).join('');
    $('#gr-type').value = grFilter.type;
    $('#gr-note').hidden = false;
    $('#gr-note').innerHTML = `${icon('alert')}<div>${dv.list_complete === false ? `<strong>The list holds the newest ${fmt(dpOnly.length)} of ${fmt(dv.applied)} development permit applications</strong> (the counts above include all of them; choose a ward for its full list). ` : ''}<strong>What this list shows.</strong> Development permits (DP numbers) are the City's approval of what can be built on a property or how it is used, before a building permit. ${rz ? 'Rezoning applications (LOC numbers) ask Council to change what a property may be used for and go to a public hearing; every one made in the period and every one still open is listed (hearing dates are on Council agendas, not in the open data). ' : ''}${grFilter.type === 'larger' ? 'Showing larger developments and rezonings: new homes and apartment buildings, changes of use (including new child care centres, schools and clinics), new commercial and industrial buildings, and rezoning applications. Choose "All types" in Type to include basement suites, signs, home businesses, small exceptions to the rules and renovations.' : 'Showing ' + (grFilter.type ? '"' + esc(grFilter.type) + '"' : 'every type, from basement suites to new buildings') + '.'}</div>`;
    $('#gr-status').value = grFilter.status;
    $('#gr-sub').textContent = `Development permit and rezoning applications in ${W()}, ${D.period}`;
    $('#gr-stats').innerHTML = [[fmt(dv.applied), 'development permit applications'], [fmt(dv.released), 'approved and released'], [fmt(dv.in_review), 'in review or on hold'],
      [fmt(dv.refused), 'refused'], [fmt(dv.cancelled), 'cancelled'],
      ...(rz ? [[fmt(rz.applied), 'rezoning applications'], [fmt(rz.open), 'rezonings still open']] : [])].map(([b, s]) => `<div class="istat"><b>${b}</b><span>${s}</span></div>`).join('');
    const rows = grRows();
    head.innerHTML = '<tr><th scope="col">Permit</th><th scope="col">Applied</th><th scope="col">Status</th><th scope="col">Type</th><th scope="col">Address</th><th scope="col">Community</th><th scope="col">Proposed use</th><th scope="col">Description</th><th scope="col">Decision</th></tr>';
    body.innerHTML = rows.slice(0, 600).map(p => `<tr><td class="mono">${esc(p.id)}</td><td>${esc(p.applied)}</td><td>${esc(p.status)}</td><td>${esc(p.type)}</td><td>${esc(p.address)}</td>
      <td>${esc(p.comm ? commName(p.comm) : '–')}</td><td>${esc(p.rezoning ? (p.use || '') : titleCase(p.use || ''))}</td><td class="wrap">${esc(p.what)}</td><td>${esc(p.decision ? p.decision + (p.decided ? ', ' + p.decided : '') : '–')}</td></tr>`).join('')
      || '<tr><td colspan="9" class="empty">No permits match these filters.</td></tr>';
    $('#gr-notes').innerHTML = `Showing ${fmt(Math.min(rows.length, 600))} of ${fmt(rows.length)}. Sources: City of Calgary open data, Development Permits${rz ? ' and Land Use Redesignation Applications (rezonings, placed by their map point)' : ''}. Each permit's full file is on the City's <button class="link-btn small" data-open="${esc(dv.page)}">Development Map (permit application search)</button>: search for the permit number.`;
  } else if (grView === 'am') {
    const am = D.amenities;
    if (!am) { head.innerHTML = ''; body.innerHTML = '<tr><td class="empty">Amenity data is not available right now.</td></tr>'; $('#gr-stats').innerHTML = ''; return; }
    const kids = (fam().child_care || {}).by_comm || {};
    $('#gr-sub').textContent = 'Recreation facilities, libraries, community centres, playgrounds and transit stops in each ' + W() + ' community';
    $('#gr-stats').innerHTML = [[fmt(am.facilities_total), 'recreation facilities, libraries and community centres'], [fmt(am.playgrounds_total), 'playgrounds'], [fmt(am.stops_total), 'active transit stops']]
      .map(([b, s]) => `<div class="istat"><b>${b}</b><span>${s}</span></div>`).join('');
    const coming = (D.projects || []).filter(p => p.amenity && p.state !== 'completed');
    if (coming.length) {
      $('#gr-note').hidden = false;
      $('#gr-note').innerHTML = `${icon('crane')}<div><strong>Being built:</strong> ${coming.map(p => `<button class="link-btn" data-open="${esc(p.url)}">${esc(p.title.replace(/ \(.*\)$/, ''))}</button>`).join(' · ')}. Not counted in the table until they open; stage, cost and timing are under "Being built".</div>`;
    }
    head.innerHTML = '<tr><th scope="col">Community</th><th scope="col" class="num">Residents today</th><th scope="col" class="num">Children 0 to 14</th><th scope="col" class="num">Playgrounds</th><th scope="col" class="num">Children per playground</th><th scope="col" class="num">Transit stops</th><th scope="col" class="num">Stops per 1,000</th><th scope="col">Facilities</th></tr>';
    body.innerHTML = residential().map(c => {
      const a = am.by_comm[c.code] || {}, k = (kids[c.code] || {}).k0_14, fac = am.facilities.filter(f => f.comm === c.code);
      return `<tr><td>${esc(c.name)}</td><td class="num">${fmt(c.residents)}</td><td class="num">${fmt(k)}</td><td class="num">${fmt(a.playgrounds)}</td>
        <td class="num">${a.playgrounds && k ? fmt(Math.round(k / a.playgrounds)) : '<span class="dash">–</span>'}</td><td class="num">${fmt(a.stops)}</td><td class="num">${fmt(a.stops_per_1000, 1)}</td>
        <td class="wrap">${fac.map(f => esc(f.name)).join('; ') || '<span class="dash">None listed</span>'}</td></tr>`;
    }).join('');
    $('#gr-notes').textContent = 'Sources: City of Calgary open data: Recreation Facilities, Community Services (libraries, community centres), Playground Equipment (play structures) and Calgary Transit Stops (active stops). Facilities in business and industrial areas are on the map but not in this table.';
  } else {
    const items = beingBuilt();
    const bp = D.big_permits;
    $('#gr-sub').textContent = 'What is being built in and near ' + W() + ': City projects, road projects and the largest building permits (not homes)';
    $('#gr-stats').innerHTML = [[fmt((D.projects || []).filter(p => p.state !== 'completed').length), 'major projects being built or planned: City, schools, airport, private'], [fmt((D.roadwork || []).length), 'road projects'],
      [bp ? fmt(bp.length) : '–', `building permits over $1 million (not homes), ${esc(D.period)}`]].map(([b, s]) => `<div class="istat"><b>${b}</b><span>${s}</span></div>`).join('');
    head.innerHTML = '<tr><th scope="col">Project</th><th scope="col">Kind</th><th scope="col">Stage</th><th scope="col">Cost</th><th scope="col">Where</th></tr>';
    const badge = r => r.state === 'completed' ? '<span class="bb-b done">Open now</span>' : r.state === 'building' ? '<span class="bb-b build">Being built</span>' : r.state === 'planned' ? '<span class="bb-b plan">Planned</span>' : '';
    body.innerHTML = items.map(r => `<tr class="${r.state === 'completed' ? 'bb-done' : ''}"><td class="wrap bb-proj">${badge(r)}${r.url ? `<button class="link-btn" data-open="${esc(r.url)}">${esc(r.title)}</button>` : `<b>${esc(r.title)}</b>`}${r.id ? `<small class="mono"> ${esc(r.id)}</small>` : ''}${r.what ? `<small class="bb-what" title="${esc(r.what)}">${esc(r.what)}</small>` : ''}</td>
      <td class="wrap">${esc(r.kind)}</td><td class="wrap">${esc(r.stage)}${r.overdue ? `<small class="bb-over">${icon('alert')}${esc(r.overdue)}</small>` : ''}</td><td class="wrap">${esc(r.cost)}</td><td class="wrap">${esc(r.where)}</td></tr>`).join('')
      || '<tr><td colspan="5" class="empty">Nothing is listed as being built in or near ' + W() + ' right now.</td></tr>';
    $('#gr-notes').textContent = 'Sources: each major project\'s own page (City, Alberta Major Projects, school boards, the airport, news reports; checked ' + dmy(((D.projects || [])[0] || {}).checked || '') + '); Road Construction Projects open data; Building Permits open data (permits issued in the period for work other than homes, estimated cost over $1 million).' + (bp ? '' : ' The building permit list could not be loaded at the last refresh.');
  }
}
// the asset inventory: how many of each asset the City lists, ward by ward and for Calgary (or each community of a ward)
function renderAssets() {
  const g = D.amenity_gap, box = $('#gr-gap');
  if (!g || !g.kinds) { box.innerHTML = '<p class="empty">City asset data is not available right now. It is counted again at the next refresh.</p>'; $('#gr-stats').innerHTML = ''; return; }
  const kinds = g.kinds, keys = Object.keys(kinds), city = isCity(), ws = D.wards_summary;
  const dec = k => k.endsWith('_ha') ? 1 : 0;
  let cols, rows, title, sub;
  if (city && ws && ws.amenity_counts_city) {
    title = 'Assets in every ward and in Calgary';
    cols = ['Calgary', ...ws.wards.map(w => 'Ward ' + w.ward)];
    rows = keys.map(k => [kinds[k].label, ws.amenity_counts_city[k], ...ws.wards.map(w => (w.amenity_counts || {})[k])]);
    if (ws.amenity_counts_other_city) Object.keys(ws.amenity_counts_other_city).forEach(k => { keys.push(k); rows.push([(kinds[k] || { label: k }).label + ", private accessible to the community (OpenStreetMap)", ws.amenity_counts_other_city[k], ...ws.wards.map(w => (w.amenity_counts_other || {})[k] || 0)]); });
    if (ws.amenity_counts_private_city) Object.keys(ws.amenity_counts_private_city).forEach(k => { keys.push(k); rows.push([(kinds[k] || { label: k }).label + ", gated, residents only (OpenStreetMap; counted only when ticked)", ws.amenity_counts_private_city[k], ...ws.wards.map(w => (w.amenity_counts_private || {})[k] || 0)]); });
    sub = 'How many of each asset the City of Calgary lists in its open data, in each ward and in all of Calgary. Park space is in hectares.';
  } else {
    title = `Assets in ${W()}, community by community`;
    const comms = (g.by_comm || []).slice().sort((a, b) => String(a.name).localeCompare(String(b.name)));
    cols = [W(), 'Calgary', ...comms.map(c => titleCase(c.name))];
    rows = keys.map(k => [kinds[k].label, ((g.scope || {})[k] || {}).n, ((g.city || {})[k] || {}).n, ...comms.map(c => (c.n || {})[k])]);
    const ob = (g.other || {}).by_comm || {}, cityOther = (D.wards_summary || {}).amenity_counts_other_city;
    if (g.other) ['playgrounds', 'basketball', 'fitness', 'off_leash', 'local_park_ha'].forEach(k => { keys.push(k); rows.push([(kinds[k] || { label: k }).label + ", private accessible to the community (OpenStreetMap)", comms.reduce((a, c) => a + ((ob[c.code] || {})[k] || 0), 0), cityOther ? cityOther[k] : null, ...comms.map(c => (ob[c.code] || {})[k] || 0)]); });
    const obp = (g.other || {}).by_comm_private || {}, cityPriv = (D.wards_summary || {}).amenity_counts_private_city;
    if (Object.keys(obp).length) ['playgrounds', 'basketball', 'fitness', 'off_leash', 'local_park_ha'].forEach(k => { keys.push(k); rows.push([(kinds[k] || { label: k }).label + ", gated, residents only (OpenStreetMap; counted only when ticked)", comms.reduce((a, c) => a + ((obp[c.code] || {})[k] || 0), 0), cityPriv ? cityPriv[k] : null, ...comms.map(c => (obp[c.code] || {})[k] || 0)]); });
    sub = `How many of each asset the City of Calgary lists in each lived-in ${W()} community, in ${W()} and in all of Calgary. Park space is in hectares.`;
  }
  $('#gr-sub').textContent = 'Every public asset the City lists: benches, playgrounds, courts, washrooms, fountains, park space, trees, facilities and transit stops';
  $('#gr-stats').innerHTML = '';
  box.innerHTML = `<div class="gap-scope" id="gap-assets"><div class="gap-assets-head"><h2 class="h3">${esc(title)}</h2>
      <button type="button" class="btn small" id="gap-assets-save">${icon('download')}<span>Save this table</span></button></div>
    <p class="card-sub">${esc(sub)} Counted ${esc(g.counted ? dmy(g.counted) : '')}.</p>
    <div class="table-wrap tall"><table class="data gap-assets"><thead><tr><th scope="col">Asset</th>${cols.map((c, i) => `<th scope="col" class="num ${i < (city ? 1 : 2) ? 'cmp-city' : ''}">${esc(c)}</th>`).join('')}</tr></thead><tbody>
    ${rows.map(r => `<tr><td>${esc(r[0])}</td>${r.slice(1).map((v, i) => `<td class="num ${i < (city ? 1 : 2) ? 'cmp-city' : ''}">${i < (city ? 1 : 2) ? '<b>' + fmt(v, dec(keys[rows.indexOf(r)])) + '</b>' : fmt(v, dec(keys[rows.indexOf(r)]))}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div></div>`;
  $('#gap-assets-save').addEventListener('click', async () => {
    const r = await (await api()).save_csv(title, ['Asset', ...cols], rows.map(x => x.map(v => v ?? '')));
    if (r && r.ok) $('#gap-assets-save span').textContent = 'Saved';
  });
  $('#gr-notes').textContent = 'Sources: City of Calgary open data: Parks Seating, Playground Equipment, Parks Sport Equipment, Parks Plumbing Fixtures, Parks Wayfinder Garbage and Recycle, Parks Off Leash Areas, Parks Sites, Public Trees, Recreation Facilities, Community Services and Calgary Transit Stops. A ward is its communities; assets in business and industrial areas count in the ward and Calgary totals.';
}

// ---------- Growth vs amenities (revised 5 November 2026): how near homes are to amenities, and crowding (access.py)
let acKind = 'playground', acFar = false, acMapMode = 'near', acWard = '', acMapObj = null, acLayer = null;
let acOther = false, acPrivate = false;   // the optional filter: private amenities that are not the City's (OpenStreetMap), playgrounds and parks only
// the tab's figures, with the playground and park ones swapped for the filter's when it is on
function acData() {
  const A = D && D.access;
  if (!A || !acOther || !A.with_other) return A;
  const v = A.with_other[acPrivate && A.with_other.osm_private ? 'osm_private' : 'osm'];
  if (!v) return A;
  const byW = {}, byC = {};
  (v.wards || []).forEach(w => { byW[w.ward] = w; });
  (v.communities || []).forEach(c => { byC[c.code] = c; });
  const fk = {}; (v.findings || []).forEach(f => { fk[f.kind] = f; });
  return { ...A, city: { ...A.city, ...v.city }, wards: (A.wards || []).map(w => ({ ...w, ...(byW[w.ward] || {}) })),
    communities: (A.communities || []).map(c => ({ ...c, ...(byC[c.code] || {}) })), crowding_groups: v.crowding_groups,
    sensitivity: v.sensitivity, findings: (A.findings || []).map(f => fk[f.kind] || f), _variant: v };
}
const AC_ORDER = ['playground', 'park', 'transit_stop', 'community_centre', 'rec_centre', 'library'];
const AC_CROWD = ['playground', 'park'];
const acPct = v => isNum(v) ? fmt(v * 100, 0) + '%' : '–';
const acM = m => !isNum(m) ? '–' : m >= 1000 ? fmt(m / 1000, m % 1000 ? 1 : 0) + ' km' : fmt(m) + ' m';
const acTh = (A, k, far) => (A.kinds[k].thresholds_m || [])[far ? 1 : 0];
const acUnit = k => k === 'playground' ? 'playgrounds per 1,000 children' : 'park hectares per 1,000 residents';
const acCrowdKey = (A, k, far) => 'crowding_' + acTh(A, k, far);
const acKinds = A => AC_ORDER.filter(k => A.kinds[k]);
const AC_TAG = { too_few_homes: 'ac-few', gap: 'ac-gap', gap_check: 'ac-check', no_gap: 'ac-ok' };
const acTag = (A, r) => `<span class="ac-tag ${AC_TAG[r] || ''}">${esc((A.readings || {})[r] || r || '–')}</span>`;
const acBar = (v, cls = '') => `<span class="ac-bar ${cls}" aria-hidden="true"><i style="width:${isNum(v) ? Math.round(v * 100) : 0}%"></i></span>`;

// the headline in words, worked out from the figures: nothing in it is written in advance
function acHeadline(A) {
  const f = (A.findings || []).filter(x => isNum(x.new) && isNum(x.old));
  if (!f.length) return '';
  const word = k => ({ playground: 'playgrounds', park: 'parks', transit_stop: 'transit stops', community_centre: 'community centres', rec_centre: 'indoor recreation centres', library: 'libraries' })[k] || k;
  const one = x => `${word(x.kind)} (${acPct(x.new)} within ${acM(x.distance_m)}, against ${acPct(x.old)})`;
  const list = xs => xs.length < 2 ? xs.map(one).join('') : xs.slice(0, -1).map(one).join(', ') + ' and ' + one(xs[xs.length - 1]);
  // within 5 points of older homes reads as "about as near"; the figures are beside it in the table
  const near = f.filter(x => Math.abs(x.points_behind) <= 5), behind = f.filter(x => x.points_behind > 5), ahead = f.filter(x => x.points_behind < -5);
  const parts = [];
  if (near.length) parts.push(`about as near as older homes to ${list(near)}`);
  if (behind.length) parts.push(`farther from ${list(behind)}`);
  if (ahead.length) parts.push(`nearer to ${list(ahead)}`);
  return `Homes built since ${A.growth_year} are ` + (parts.length > 1 ? parts.slice(0, -1).join(', ') + ', but ' + parts[parts.length - 1] : parts[0]) + '.';
}
function acCrowdWords(A) {
  const g = A.crowding_groups || {}, c = A.city || {};
  const out = [];
  AC_CROWD.forEach(k => {
    const th = acTh(A, k, false), x = g[`${k}_${th}`] || {}, cv = (c[k] || {})['crowding_' + th];
    if (!isNum(cv)) return;
    out.push(`${k === 'playground' ? 'Playgrounds' : 'Parks'} within ${acM(th)}: ${fmt(cv, k === 'park' ? 1 : 2)} ${acUnit(k)} across Calgary` +
      (isNum(x.newer) && isNum(x.rest) ? `; ${fmt(x.newer, k === 'park' ? 1 : 2)} in the ${fmt(g.newer_count)} communities where a quarter or more of homes were built since ${A.growth_year}, ${fmt(x.rest, k === 'park' ? 1 : 2)} in the rest` : '') + '.');
  });
  return out;
}

// the screen's own area filter: any ward or all of Calgary, whatever area the sidebar shows
let grArea = null;
function renderGap() {
  const w = grArea === null ? SCOPE : grArea, box = $('#gr-gap');
  const key = `${(D && D.population && D.population.method) || ''}/${w}`;
  if (w !== SCOPE && !PEEK[key]) {
    box.innerHTML = '<p class="muted">Reading that area…</p>';
    peekView(w).then(() => renderGap()).catch(() => { grArea = null; renderGap(); });
    return;
  }
  withView(w === SCOPE ? D : PEEK[key], w, renderGapInner);
  const wards = ((D.wards_summary || {}).wards || []).map(x => x.ward).sort((a, b) => a - b);
  const list = wards.length ? wards : Array.from({ length: 14 }, (_, i) => i + 1);
  const meth = ((D.population || {}).method_label) || '';
  box.insertAdjacentHTML('afterbegin', `<div class="gr-area"><label class="field"><span>Area on this screen</span><select id="gr-area"><option value="0" ${w === 0 ? 'selected' : ''}>All of Calgary</option>${list.map(n => `<option value="${n}" ${w === n ? 'selected' : ''}>Ward ${n}</option>`).join('')}</select></label>
    <p class="card-note">${w !== SCOPE ? `Showing ${w ? 'Ward ' + w : 'all of Calgary'} here; the rest of Calgary Insight still shows ${esc(W())}. ` : ''}Residents counted: <b>${esc(meth)}</b> (change it in Settings). Distances are measured from homes, so the shares of homes within reach stay the same under every way of counting; residents, children and crowding follow it.</p></div>`);
  const sel = $('#gr-area');
  if (sel) sel.addEventListener('change', () => { const v = +sel.value; grArea = v === SCOPE ? null : v; renderGap(); });
}
function renderGapInner() {
  const A = acData(), box = $('#gr-gap');
  if (!A || !A.city) {
    $('#gr-stats').innerHTML = ''; $('#gr-notes').textContent = '';
    box.innerHTML = '<p class="empty">The Growth vs amenities figures are not available right now. They are worked out again at the next refresh.</p>';
    return;
  }
  const kinds = acKinds(A), city = isCity();
  if (!kinds.includes(acKind)) acKind = kinds[0];
  const K = A.kinds[acKind], crowd = AC_CROWD.includes(acKind);
  if (!crowd && acMapMode === 'crowding') acMapMode = 'near';
  const th = acTh(A, acKind, acFar), shareKey = acFar ? 'share_2' : 'share_1';
  $('#gr-sub').textContent = 'How near homes are to everyday amenities, in any community, and how many people share the playgrounds and parks within reach';
  $('#gr-stats').innerHTML = '';

  // 1. the headline: are new homes keeping up? (Calgary-wide, homes built since 2021 against older homes)
  const head = `<div class="gap-scope ac-head"><h2 class="h3">Are new homes keeping up?</h2>
    <p class="ac-lead">${esc(acHeadline(A))}</p>
    <div class="table-wrap ac-full"><table class="data ac-keep"><thead><tr><th scope="col">Amenity</th><th scope="col">Distance</th><th scope="col">Homes built since ${A.growth_year}</th><th scope="col">Homes built before ${A.growth_year}</th><th scope="col" class="num">Difference</th><th scope="col">All homes, Calgary</th></tr></thead><tbody>
    ${kinds.map(k => { const c = A.city[k] || {}, d = isNum(c.share_new_1) && isNum(c.share_old_1) ? Math.round((c.share_new_1 - c.share_old_1) * 100) : null;
      return `<tr><td>${esc(A.kinds[k].label)}</td><td>within ${acM(acTh(A, k, false))}</td><td>${acBar(c.share_new_1, 'new')}<b>${acPct(c.share_new_1)}</b></td><td>${acBar(c.share_old_1)}${acPct(c.share_old_1)}</td><td class="num">${isNum(d) ? signed(d, 0, ' pts') : '–'}</td><td>${acPct(c.share_1)} <small class="ac-med">median ${acM(c.median_m)}</small></td></tr>`; }).join('')}
    </tbody></table></div>
    <p class="card-note">Share of homes (dwelling units) within the distance of the nearest one, in any community, straight-line. ${fmt(A.homes.units)} homes on the City's property roll (${fmt(A.homes.records)} records; ${fmt(A.homes.units_estimated)} rental units estimated from assessed value). "Built since ${A.growth_year}": year of construction ${A.growth_year} or later; homes with no year are in neither group.</p>
    <h3 class="ac-h4">Crowding at playgrounds and parks <span class="ac-est">Estimate</span></h3>
    <ul class="ac-crowd">${acCrowdWords(A).map(x => `<li>${esc(x)}</li>`).join('')}${acNearCrowdedWords(A).map(x => `<li class="ac-nc-line">${esc(x)}</li>`).join('')}</ul>
    ${scData() ? `<p class="card-note">Crowding counts everyone who can reach a playground or park, from any community: children from the next community who use the same playground share it too. "Near, but crowded" uses the score below (the community's crowding against Calgary's).</p>` : ''}
    ${Object.keys(A.sensitivity || {}).length ? `<p class="card-note"><b>How much the estimate moves:</b> Calgary's playground figure (within ${acM(acTh(A, 'playground', false))}) under each way of counting residents: ${Object.entries(A.sensitivity).map(([m, v]) => `${esc(acMethodName(m))} ${fmt(((v.playground || {})[String(acTh(A, 'playground', false))]), 2)}${m === popMethod() ? ' (in use)' : ''}`).join(' · ')} playgrounds per 1,000 children.</p>` : ''}
    <p class="card-note">Crowding spreads the estimated children (0 to 14) and residents of each community evenly over its homes (the ${CY()} Census plus modelled growth, not counted), counts each playground as one whatever its size, and will be firmed up with the 2026 Census age data in 2027. It is shown beside Calgary's figure only: no tier, no combined score.</p></div>`;

  // 2. the 14 wards, the same measures, in ward order
  const wardRows = (A.wards || []).slice().sort((a, b) => a.ward - b.ward);
  const curWard = city ? (acWard ? +acWard : null) : (D.ward || {}).number;
  const wardsTable = `<div class="gap-scope"><div class="ac-row"><h2 class="h3">Every ward, the same measures</h2>
      <div class="seg small" role="radiogroup" aria-label="Distance" id="ac-far"><button type="button" role="radio" aria-checked="${!acFar}" data-far="0">First distance</button><button type="button" role="radio" aria-checked="${acFar}" data-far="1">Second distance</button></div></div>
    <div class="table-wrap ac-full"><table class="data ac-wards"><thead><tr><th scope="col">Ward</th>${kinds.map(k => `<th scope="col" class="num">${esc(A.kinds[k].label)}<small>within ${acM(acTh(A, k, acFar))}</small></th>`).join('')}${AC_CROWD.filter(k => A.kinds[k]).map(k => `<th scope="col" class="num">${k === 'playground' ? 'Playground crowding' : 'Park crowding'}<small>${k === 'playground' ? 'per 1,000 children' : 'ha per 1,000 residents'}, ${acM(acTh(A, k, acFar))}</small></th>`).join('')}</tr></thead><tbody>
    ${wardRows.map(w => `<tr class="${w.ward === curWard ? 'ac-cur' : ''}"><td>Ward ${w.ward}</td>${kinds.map(k => `<td class="num">${acPct((w[k] || {})[acFar ? 'share_2' : 'share_1'])}</td>`).join('')}${AC_CROWD.filter(k => A.kinds[k]).map(k => `<td class="num">${fmt((w[k] || {})[acCrowdKey(A, k, acFar)], k === 'park' ? 1 : 2)}</td>`).join('')}</tr>`).join('')}
    <tr class="cmp-city-row"><td><b>Calgary</b></td>${kinds.map(k => `<td class="num"><b>${acPct((A.city[k] || {})[acFar ? 'share_2' : 'share_1'])}</b></td>`).join('')}${AC_CROWD.filter(k => A.kinds[k]).map(k => `<td class="num"><b>${fmt((A.city[k] || {})[acCrowdKey(A, k, acFar)], k === 'park' ? 1 : 2)}</b></td>`).join('')}</tr>
    </tbody></table></div><p class="card-note">Wards in number order. Share of homes within the distance; crowding is an estimate (above). A ward is its communities.</p></div>`;

  // 3. communities: table and map
  const wardsHere = [...new Set((A.communities || []).map(r => r.ward).filter(Boolean))].sort((a, b) => a - b);
  if (acWard && !wardsHere.includes(+acWard)) acWard = '';
  const rows = (A.communities || []).filter(r => !acWard || r.ward === +acWard).slice().sort((a, b) => String(a.name).localeCompare(String(b.name)));
  const cityVal = (A.city[acKind] || {});
  const ck = acCrowdKey(A, acKind, acFar);
  const ctl = `<div class="gap-ctl ac-ctl">
      <label class="field"><span>Amenity</span><select id="ac-kind">${kinds.map(k => `<option value="${k}" ${k === acKind ? 'selected' : ''}>${esc(A.kinds[k].label)}</option>`).join('')}</select></label>
      ${city && wardsHere.length > 1 ? `<label class="field"><span>Ward</span><select id="ac-ward"><option value="">All of Calgary</option>${wardsHere.map(w => `<option value="${w}" ${String(w) === String(acWard) ? 'selected' : ''}>Ward ${w}</option>`).join('')}</select></label>` : ''}
      ${scData() ? `<label class="check"><input type="checkbox" id="ac-nearonly" ${acNearOnly ? 'checked' : ''}> Only near, but crowded</label>` : ''}
      <div class="seg small" role="radiogroup" aria-label="Map shows" id="ac-mapmode"><button type="button" role="radio" aria-checked="${acMapMode === 'near'}" data-mm="near">Map: near</button>${crowd ? `<button type="button" role="radio" aria-checked="${acMapMode === 'crowding'}" data-mm="crowding">Map: crowding</button>` : ''}${scData() ? `<button type="button" role="radio" aria-checked="${acMapMode === 'score'}" data-mm="score">Map: score</button>` : ''}</div></div>`;
  const commTable = `<div class="table-wrap tall"><table class="data ac-comm" id="gap-table"><thead><tr><th scope="col">Community</th>${city ? '<th scope="col" class="num">Ward</th>' : ''}<th scope="col" class="num">Homes</th><th scope="col" class="num">Residents<small>${esc(((D.population || {}).method_label || '').split(',')[0])}</small></th><th scope="col" class="num">Children 0 to 14</th><th scope="col" class="num">New<small>built since ${A.growth_year}</small></th>
      <th scope="col">Within ${acM(th)}<small>Calgary ${acPct(cityVal[shareKey])}</small></th><th scope="col" class="num">New homes<small>within ${acM(acTh(A, acKind, false))}</small></th><th scope="col" class="num">Older homes<small>within ${acM(acTh(A, acKind, false))}</small></th><th scope="col" class="num">Median</th><th scope="col">Reading</th>
      ${scData() ? `<th scope="col">Score<small>crowding against Calgary's, range</small></th>` : ''}
      ${crowd ? `<th scope="col" class="num">Crowding<small>${esc(acUnit(acKind))}, ${acM(th)}; Calgary ${fmt(cityVal[ck], acKind === 'park' ? 1 : 2)}</small></th>` : ''}</tr></thead><tbody>
    ${rows.filter(r => !acNearOnly || acNearCrowded(r, acKind)).map(r => { const x = r[acKind] || {}, sc = acScore(r.code, acKind), nc = acNearCrowded(r, acKind);
      return `<tr><td>${esc(r.name)}</td>${city ? `<td class="num">${r.ward || '–'}</td>` : ''}<td class="num">${fmt(r.units)}</td><td class="num">${fmt(r.residents)}</td><td class="num">${fmt(r.children)}</td><td class="num">${r.units ? acPct(r.units_new / r.units) : '–'}</td>
        <td>${acBar(x[shareKey])}<b>${acPct(x[shareKey])}</b></td><td class="num">${acPct(x.share_new_1)}</td><td class="num">${acPct(x.share_old_1)}</td><td class="num">${x.median_beyond ? 'over ' + acM(acTh(A, acKind, true)) : acM(x.median_m)}</td><td>${acTag(A, x.reading)}${nc ? ' <span class="ac-tag ac-nc">Near, but crowded</span>' : ''}</td>
        ${scData() ? `<td>${scCell(sc)} ${sc ? scTag(sc) : ''}</td>` : ''}
        ${crowd ? `<td class="num">${fmt(x[ck], acKind === 'park' ? 1 : 2)}</td>` : ''}</tr>`; }).join('') || '<tr><td colspan="12" class="empty">No communities to show.</td></tr>'}
    </tbody></table></div>
    <p class="card-note"><b>Reading</b> (a stated rule for each community and amenity, not a score): <span class="ac-tag ac-ok">${esc(A.readings.no_gap)}</span> half or more of homes within ${acM(acTh(A, acKind, false))}; <span class="ac-tag ac-gap">${esc(A.readings.gap)}</span> fewer than half; <span class="ac-tag ac-check">${esc(A.readings.gap_check)}</span> a measured gap where ${fmt(A.rules.recent_share * 100)}% or more of homes were built since ${A.recent_from_year} (developer-built amenities may not be in the City's inventory yet); <span class="ac-tag ac-few">${esc(A.readings.too_few_homes)}</span> under ${fmt(A.rules.min_units)} homes. Readings are never combined across amenities.${scData() ? ` <span class="ac-tag ac-nc">Near, but crowded</span> most homes within reach, but the score is under 0.80: what is within reach is shared by more people than Calgary's average.` : ''} ${esc(K.basis || '')}</p>`;
  const mapBlock = `<div class="ac-mapwrap"><div id="ac-map" class="ac-map" role="region" aria-label="Map of communities: ${esc(K.label)}, ${acMapMode === 'near' ? 'share of homes within ' + acM(th) : 'crowding'}"></div><div class="ac-legend" id="ac-legend"></div></div>`;

  // 4. limitations, method, sources
  const lim = `<div class="gap-scope ac-lim"><h2 class="h3">What these figures do not measure</h2><ul>${(A.limitations || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <p class="card-note"><button type="button" class="link-btn small" data-method="access">How the distances are worked out</button> · <button type="button" class="link-btn small" data-method="access_crowding">How crowding is worked out</button> · Worked out ${A.counted ? dmy(A.counted) : ''}; amenities are read again every week and the property roll every month.</p></div>`;
  const W0 = (D.access || {}).with_other || {};
  const otherSwitch = W0.osm ? `<div class="gap-scope gap-other-switch"><label class="check big"><input type="checkbox" id="ac-other" ${acOther ? 'checked' : ''}>
      <span><b>Count private amenities accessible to the community</b> (OpenStreetMap: developer, school and other playgrounds and parks that are not the City's, every one the City already lists taken out). Changes the playground and park figures only; transit stops and facilities stay the City's.</span></label>
      ${W0.osm_private ? `<label class="check big gap-private"><input type="checkbox" id="ac-private" ${acPrivate ? 'checked' : ''} ${acOther ? '' : 'disabled'}>
      <span><b>Also count gated, residents-only ones</b> (marked private in OpenStreetMap: homeowners' association and condo parks and playgrounds). Off by default.</span></label>` : ''}
      <p class="card-note">${acOther ? `<b>On:</b> ${esc(A._variant ? A._variant.label : '')}. Added: ${fmt(((A._variant || {}).added || {}).playground)} playgrounds and ${fmt(((A._variant || {}).added || {}).park)} parks (a park as a circle of its own area around its middle, since OpenStreetMap parks are kept as a point and an area). Volunteer-mapped: coverage is uneven.` : '<b>Off:</b> every figure counts the City\'s own amenities only.'} <button type="button" class="link-btn small" data-method="other_amenities">How they are found and matched</button></p></div>` : '';
  const rev = `<div class="banner info ac-rev">${icon('alert')}<div><strong>${esc(A.revision.split('. ')[0])}.</strong> ${esc(A.revision.split('. ').slice(1).join('. '))} <button type="button" class="link-btn" data-goto="changes">What changed</button></div></div>`;

  box.innerHTML = `${rev}${otherSwitch}${head}${wardsTable}
    <div class="gap-head"><h2 class="h3">${city ? (acWard ? 'Ward ' + acWard + ', community by community' : 'Every community') : 'Each community in ' + esc(W())}: ${esc(K.label.toLowerCase())}</h2>${ctl}</div>
    ${mapBlock}${commTable}${scHtml(A)}${lim}${growthChecks()}`;
  acDrawMap(A, rows, th, shareKey, ck);
  $('#gr-notes').textContent = `Sources: City of Calgary open data: Current Year Property Assessments (4bsw-nn7w, homes), Playground Equipment (bdu9-amk8), Parks Sites (kami-qbfh), Calgary Transit Stops (muzh-c9qc), Community Services (x34e-bcjz: community centres, libraries), Recreation Facilities (hxfu-6d96); children and residents: the ${CY()} Census by community and the growth model (${popWords()}).`;
}
// ---------- amenity scores (added 5 November 2026): crowding against Calgary's, under every assumption (scores.py)
let scGroup = 'local', scFilter = '', scOpen = null, acNearOnly = false;
// a community's score for one amenity, and "near, but crowded": most homes within reach, yet each one within reach is
// shared by more people than Calgary's average (score under 0.80), children and residents from any community counted
const acScore = (code, k) => (((scData() || {}).communities || {})[code] || {}).amenities?.[k] || null;
const acNearCrowded = (r, k) => { const x = (r || {})[k] || {}, sc = acScore(r.code, k); return x.reading === 'no_gap' && sc && isNum(sc.score) && Math.round(sc.score * 100) < 80 ? sc : null; };
// the typical (median) community's score: shown when it sits under 0.80, as for parks, where a few very large parks lift Calgary's figure
function acMedianNote(k) {
  const v = Object.values((scData() || {}).communities || {}).map(r => ((r.amenities || {})[k] || {}).score).filter(isNum).sort((a, b) => a - b);
  if (!v.length) return '';
  const m = v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
  return Math.round(m * 100) < 80 ? ` The typical community scores ${fmt(m, 2)} for ${k === 'park' ? 'parks' : 'this amenity'}: Calgary's figure is an average over every resident and is lifted by the communities next to a few very large parks, so ${fmt(v.filter(x => Math.round(x * 100) < 80).length)} of ${fmt(v.length)} communities fall under 0.80.` : '';
}
function acNearCrowdedWords(A) {
  if (!scData()) return [];
  const out = [];
  AC_CROWD.forEach(k => {
    const rows = (A.communities || []).filter(r => acNearCrowded(r, k));
    if (!rows.length) return;
    const cons = rows.filter(r => acNearCrowded(r, k).consistency === 'consistent_gap').length;
    out.push(`Near, but crowded (${k === 'playground' ? 'playgrounds' : 'parks'}): ${fmt(rows.length)} communities${isCity() ? '' : ' in ' + W()} have most homes within ${acM(acTh(A, k, false))} of ${k === 'playground' ? 'a playground' : 'a park'}, yet what is within reach is shared by more ${k === 'playground' ? 'children' : 'residents'} than Calgary's average (score under 0.80; ${fmt(cons)} of them under every assumption). Examples: ${rows.slice().sort((a, b) => acNearCrowded(a, k).score - acNearCrowded(b, k).score).slice(0, 5).map(r => r.name + ' ' + fmt(acNearCrowded(r, k).score, 2)).join(', ')}.${acMedianNote(k)}`);
  });
  return out;
}
const SC_GROUPS = { local: 'Local amenities', district: 'District facilities' };
// the amenities in a group, in words, from the data (the groups are set with each amenity in access.py)
function scGroupWords(S, g) {
  const names = { playground: 'playground', park: 'park', transit_stop: 'transit stop', community_centre: 'community centre', rec_centre: 'indoor recreation centre', library: 'library' };
  const ks = ((S.groups || {})[g] || []).map(k => names[k] || k);
  return ks.length > 1 ? ks.slice(0, -1).join(', ') + ' and ' + ks[ks.length - 1] : (ks[0] || '');
}
const SC_ALL = 'All six amenities';
const SC_BAND = { well_below: 'Well below', below: 'Below', around: 'Around', above: 'Above' };
const SC_LABEL = { consistent_gap: 'Consistent gap', depends: 'Depends on assumptions', none: 'No gap' };
const SC_TAG = { consistent_gap: 'ac-gap', depends: 'ac-check', none: 'ac-ok' };
function scData() {           // the scores, with the private amenities filter's when it is on
  const S = D && D.access && D.access.scores;
  if (!S) return null;
  if (!acOther || !S.with_other) return S;
  const v = S.with_other[acPrivate && S.with_other.osm_private ? 'osm_private' : 'osm'];
  return v ? { ...S, ...v } : S;
}
const scGet = (row, g) => !row ? null : g === 'overall' ? row.overall : (row.groups || {})[g];
const scNum = v => isNum(v) ? fmt(v, 2) : '–';
const scCell = x => !x || !isNum(x.score) ? '<span class="dash">–</span>'
  : `<b>${scNum(x.score)}</b> <small class="sc-range">${scNum(x.low)} to ${scNum(x.high)}</small>${x.scenarios < x.scenarios_possible ? `<sup class="sc-fewer" title="Scored ${x.scenarios} of ${x.scenarios_possible} ways (no ${CY()} Census count)">${x.scenarios}/${x.scenarios_possible}</sup>` : ''}`;
const scTag = x => x && x.consistency ? `<span class="ac-tag ${SC_TAG[x.consistency]}">${SC_LABEL[x.consistency]}</span>` : '';
function scHtml(A) {
  const S = scData();
  if (!S) return '';
  const city = isCity(), names = {}; (A.communities || []).forEach(r => { names[r.code] = r; });
  const sw = (id, opts, cur) => `<div class="seg small" role="radiogroup" id="${id}">${opts.map(([k, l]) => `<button type="button" role="radio" aria-checked="${k === cur}" data-v="${k}">${esc(l)}</button>`).join('')}</div>`;
  let rows = Object.entries(S.communities || {}).map(([code, r]) => ({ code, r, c: names[code] || { name: code }, x: scGet(r, scGroup) }))
    .filter(o => !acWard || (o.c.ward === +acWard));
  if (scFilter) rows = rows.filter(o => o.x && o.x.consistency === scFilter);
  rows.sort((a, b) => ((a.x || {}).score ?? 9) - ((b.x || {}).score ?? 9));
  const nCons = Object.values(S.communities || {}).filter(r => (scGet(r, scGroup) || {}).consistency === 'consistent_gap').length;
  const nDep = Object.values(S.communities || {}).filter(r => (scGet(r, scGroup) || {}).consistency === 'depends').length;
  const kinds = acKinds(A), pm = S.default_people || 'model';
  const detail = o => `<tr class="sc-detail"><td colspan="${city ? 8 : 7}"><div class="sc-det">
      <div class="sc-det-groups">${['local', 'district'].map(g => { const x = scGet(o.r, g); return `<div><b>${SC_GROUPS[g]}</b><span>${scCell(x)}</span><span>${x && x.band ? SC_BAND[x.band] + ' Calgary' : ''} ${scTag(x)}</span></div>`; }).join('')}
        <div class="sc-all"><b>${SC_ALL}</b><span>${scCell(scGet(o.r, 'overall'))}</span><span>${scTag(scGet(o.r, 'overall'))}</span><small>One average of six different amenities (8 ways: also local two thirds, district one third). It can hide a gap in one group; read the local and district scores first.</small></div></div>
      <div class="table-wrap-inner"><table class="data sc-am"><thead><tr><th scope="col">Amenity</th><th scope="col" class="num">Score<small>1.00 = Calgary</small></th><th scope="col">Range, 4 ways</th><th scope="col">Label</th><th scope="col" class="num">Crowding<small>count in Settings, shorter distance</small></th><th scope="col" class="num">Calgary</th></tr></thead><tbody>
      ${kinds.map(k => { const x = (o.r.amenities || {})[k] || {}, cw = ((S.crowding || {})[o.code] || {})[k] || {}, d0 = String(acTh(A, k, false));
        return `<tr><td>${esc(A.kinds[k].label)}</td><td class="num"><b>${scNum(x.score)}</b></td><td>${isNum(x.low) ? scNum(x.low) + ' to ' + scNum(x.high) : '–'}${x.scenarios < x.scenarios_possible ? ` <small>(${x.scenarios} of ${x.scenarios_possible} ways)</small>` : ''}</td><td>${scTag(x)}</td>
          <td class="num">${scNum(cw[pm + '|' + d0])}</td><td class="num">${scNum((((S.calgary || {})[k] || {})[pm] || {})[d0])}</td></tr>`; }).join('')}
      </tbody></table></div><p class="card-note">Crowding: playgrounds per 1,000 children; park hectares per 1,000 residents; transit stops per 1,000 residents; community centres, recreation centres and libraries per 100,000 residents; all within reach, an estimate.</p></div></td></tr>`;
  const table = `<div class="table-wrap tall"><table class="data sc-table"><thead><tr><th scope="col">Community</th>${city ? '<th scope="col" class="num">Ward</th>' : ''}<th scope="col" class="num">Homes</th>
      <th scope="col">Local amenities<small>score, range</small></th><th scope="col">Local: label</th><th scope="col">District facilities<small>score, range</small></th><th scope="col">District: label</th><th scope="col"><span class="sr">Details</span></th></tr></thead><tbody>
    ${rows.map(o => `<tr class="sc-row${scOpen === o.code ? ' open' : ''}" data-sc="${esc(o.code)}"><td>${esc(o.c.name)}</td>${city ? `<td class="num">${o.c.ward || '–'}</td>` : ''}<td class="num">${fmt(o.c.units)}</td>
      <td>${scCell(scGet(o.r, 'local'))}</td><td>${scTag(scGet(o.r, 'local'))}</td><td>${scCell(scGet(o.r, 'district'))}</td><td>${scTag(scGet(o.r, 'district'))}</td><td><button type="button" class="link-btn small" data-sc-open="${esc(o.code)}">${scOpen === o.code ? 'Hide' : 'Details'}</button></td></tr>${scOpen === o.code ? detail(o) : ''}`).join('')
      || `<tr><td colspan="8" class="empty">No communities to show.</td></tr>`}
    </tbody></table></div>`;
  const wards = Object.entries(S.wards || {}).sort((a, b) => +a[0] - +b[0]);
  const curWard = city ? (acWard ? +acWard : null) : (D.ward || {}).number;
  const wardTable = `<h3 class="ac-h4">Every ward, the same scores</h3><div class="table-wrap ac-full"><table class="data sc-wards"><thead><tr><th scope="col">Ward</th><th scope="col">Local amenities</th><th scope="col">Local: label</th><th scope="col">District facilities</th><th scope="col">District: label</th></tr></thead><tbody>
    ${wards.map(([w, r]) => `<tr class="${+w === curWard ? 'ac-cur' : ''}"><td>Ward ${w}</td><td>${scCell(scGet(r, 'local'))}</td><td>${scTag(scGet(r, 'local'))}</td><td>${scCell(scGet(r, 'district'))}</td><td>${scTag(scGet(r, 'district'))}</td></tr>`).join('')}
    </tbody></table></div><p class="card-note">Wards in number order. A ward's score is its people-weighted crowding against Calgary's, worked out the same way as a community's.</p>`;
  return `<div class="gap-scope sc-card" id="acs-card"><h2 class="h3">Where amenities fall behind, under every assumption <span class="ac-est">Added ${dmy(S.added)}</span></h2>
    <p class="ac-lead">Each amenity's score is the community's crowding figure divided by Calgary's: 1.00 is Calgary's level of that amenity within reach, per person who shares it. Local amenities average ${scGroupWords(S, 'local')}; district facilities average ${scGroupWords(S, 'district')}. Each score is worked out 4 ways (2 distances x 2 counts of residents: ${esc((S.people || {})[S.default_people] || popChip())}, the count chosen in Settings, and the ${CY()} Census). The figure shown is the shorter distance with the count chosen in Settings; the range runs from the lowest to the highest of the 4.</p>
    <p class="card-note"><b>Labels:</b> <span class="ac-tag ac-gap">Consistent gap</span> below 0.80 in every way with a figure; <span class="ac-tag ac-check">Depends on assumptions</span> below 0.80 in some ways; <span class="ac-tag ac-ok">No gap</span> never below 0.80. <b>Bands</b> of the figure shown: under 0.50 well below Calgary, 0.50 to 0.80 below, 0.80 to under 1.25 around, 1.25 or more above. Each amenity is capped at 2.00 before averaging; a group score needs every amenity in the group. Change the count of residents in Settings and every score follows. <sup class="sc-fewer">2/4</sup> scored fewer ways (no ${CY()} Census count: built since). ${acOther ? '<b>Private amenities counted</b> (the filter above): playground and park scores include them.' : ''}</p>
    <div class="ac-row">${sw('sc-group', Object.entries(SC_GROUPS).map(([k, l]) => [k, 'Filter and sort by: ' + l]), scGroup)}${sw('sc-filter', [['', 'Every community'], ['consistent_gap', `Consistent gaps (${fmt(nCons)})`], ['depends', `Depends (${fmt(nDep)})`]], scFilter)}</div>
    ${table}<p class="card-note">Lowest ${esc(SC_GROUPS[scGroup].toLowerCase())} score first. Communities with under ${fmt(A.rules.min_units)} homes are not scored. The 0.80 line and the bands are choices, applied the same way to every community; the comparison is with Calgary's own level, not a standard of adequate provision. <button type="button" class="link-btn small" data-method="access_scores">How the scores are worked out</button></p>
    ${wardTable}</div>`;
}
document.addEventListener('click', e => {
  const g = e.target.closest('#sc-group [data-v]'); if (g) { scGroup = g.dataset.v; renderGap(); return; }
  const f = e.target.closest('#sc-filter [data-v]'); if (f) { scFilter = f.dataset.v; renderGap(); return; }
  const o = e.target.closest('[data-sc-open]'); if (o) { scOpen = scOpen === o.dataset.scOpen ? null : o.dataset.scOpen; renderGap(); }
});
const acMethodName = m => ({ city_actual: "City's total, actual growth", city_pace: "City's total, one rate", model: 'growth model', census2021: CY() + ' Census' })[m] || m;

function acDrawMap(A, rows, th, shareKey, ck) {
  const el = $('#ac-map');
  if (!el || typeof L === 'undefined' || !D.geo || !D.geo.communities) { if (el) el.hidden = true; return; }
  if (acMapObj) { acMapObj.remove(); acMapObj = null; }
  acMapObj = L.map(el, { zoomControl: true, attributionControl: true, scrollWheelZoom: false, zoomSnap: .25 });
  L.tileLayer(TILES[isDark() ? 'dark' : 'light'], { maxZoom: 18, attribution: 'Tiles &copy; Esri. Data: City of Calgary' }).addTo(acMapObj);
  const ramp = RAMPS.seq[isDark() ? 'dark' : 'light'];
  const crowd = acMapMode === 'crowding', scoreMode = acMapMode === 'score' && scData();
  const SCm = scoreMode ? (scData().communities || {}) : {};
  const val = r => scoreMode ? ((SCm[r.code] || {}).amenities?.[acKind] || {}).score : (r[acKind] || {})[crowd ? ck : shareKey];
  // near: fixed steps of 20 points; crowding: five equal-sized groups of the communities shown (an estimate)
  let cuts;
  if (scoreMode) cuts = [0.5, 0.8, 1.25, 1e9];
  else if (crowd) {
    const vs = rows.filter(r => (r[acKind] || {}).reading !== 'too_few_homes').map(val).filter(isNum).sort((a, b) => a - b);
    cuts = vs.length ? [1, 2, 3, 4].map(i => vs[Math.floor(i * vs.length / 5)]) : [0, 0, 0, 0];
  } else cuts = [.2, .4, .6, .8];
  const step = v => scoreMode ? [0.5, 0.8, 1.25].filter(c => Math.round(v * 100) / 100 >= c).length * 4 / 3 : cuts.filter(c => v >= c).length;
  const feats = rows.filter(r => D.geo.communities[r.code]).map(r => ({ type: 'Feature', properties: r, geometry: D.geo.communities[r.code] }));
  acLayer = L.geoJSON({ type: 'FeatureCollection', features: feats }, {
    style: f => { const r = f.properties, v = val(r), few = scoreMode ? !isNum(v) : (r[acKind] || {}).reading === 'too_few_homes';
      return few || !isNum(v) ? { color: cssv('--border-strong'), weight: 1, fillColor: cssv('--muted-2'), fillOpacity: .35, dashArray: '4 3' }
        : { color: cssv('--card'), weight: 1, fillColor: ramp[Math.min(ramp.length - 1, Math.round(step(v) * (ramp.length - 1) / 4))], fillOpacity: .78 }; },
    onEachFeature: (f, lay) => { const r = f.properties, x = r[acKind] || {};
      if (scoreMode) { const x = (SCm[r.code] || {}).amenities?.[acKind]; lay.bindTooltip(`<b>${esc(r.name)}</b>${r.ward ? ' · Ward ' + r.ward : ''}<br>${esc(A.kinds[acKind].label)} score: ${x && isNum(x.score) ? scNum(x.score) + ' (' + scNum(x.low) + ' to ' + scNum(x.high) + ')' : 'not scored'}${x && x.consistency ? '<br>' + SC_LABEL[x.consistency] : ''}<br>${acPct((r[acKind] || {}).share_1)} of homes within ${acM(acTh(A, acKind, false))}${acNearCrowded(r, acKind) ? '<br><b>Near, but crowded</b>' : ''}`, { sticky: true, className: 'area-tip' }); return; }
      lay.bindTooltip(`<b>${esc(r.name)}</b>${r.ward ? ' · Ward ' + r.ward : ''}<br>${esc(A.kinds[acKind].label)}: ${acPct(x[shareKey])} of homes within ${acM(th)}` +
        (AC_CROWD.includes(acKind) ? `<br>Crowding (estimate): ${fmt(x[ck], acKind === 'park' ? 1 : 2)} ${esc(acUnit(acKind))}` : '') + `<br>${esc((A.readings || {})[x.reading] || '')}`, { sticky: true, className: 'area-tip' }); },
  }).addTo(acMapObj);
  const b = acLayer.getBounds();
  if (b.isValid()) acMapObj.fitBounds(b, { padding: [12, 12] }); else acMapObj.setView([51.045, -114.06], 10);
  const lab = scoreMode ? ['under 0.50 (well below)', '0.50 to 0.80 (below)', '0.80 to under 1.25 (around)', '1.25 or more (above)'] : crowd ? [`under ${fmt(cuts[0], 2)}`, `${fmt(cuts[0], 2)} to ${fmt(cuts[1], 2)}`, `${fmt(cuts[1], 2)} to ${fmt(cuts[2], 2)}`, `${fmt(cuts[2], 2)} to ${fmt(cuts[3], 2)}`, `${fmt(cuts[3], 2)} or more`]
    : ['under 20%', '20 to 40%', '40 to 60%', '60 to 80%', '80% or more'];
  $('#ac-legend').innerHTML = `<b>${scoreMode ? esc(A.kinds[acKind].label) + ' score, 1.00 = Calgary (shorter distance, count in Settings)' : crowd ? esc(acUnit(acKind)) + ' (estimate, five equal groups)' : 'Share of homes within ' + acM(th)}</b>` +
    lab.map((t, i) => `<span><i style="background:${ramp[Math.round((scoreMode ? i * 4 / 3 : i) * (ramp.length - 1) / 4)]}"></i>${esc(t)}</span>`).join('') + `<span><i class="ac-few-sw"></i>${esc(A.readings.too_few_homes)}</span>`;
}

// What changed (5 November 2026): the old and new method side by side, and what changed in the findings
function renderChanges() {
  const A = D && D.access, box = $('#chg-body');
  if (!box) return;
  const old = [
    ['What is measured', 'City assets counted inside each community\'s boundary, per 1,000 residents (playgrounds per 1,000 children).', 'The straight-line distance from every home to the nearest amenity, in any community; and for playgrounds and parks, how many children or residents share the ones within reach.'],
    ['A playground across the street, in the next community', 'Counted as zero for the community it serves.', 'Counted: the nearest one is found wherever it is.'],
    ['Amenities', 'Benches, picnic tables, playgrounds, sports equipment, fitness equipment, bins, off-leash areas, neighbourhood park space, trees, transit stops (and facilities for wards).', 'Playgrounds, public parks, transit stops, community centres, indoor recreation centres, libraries.'],
    ['How they combine', 'Each kind against Calgary, capped at 2.00 and averaged into one "amenity level".', 'Never combined: each amenity on its own, no overall score.'],
    ['Growth', '"Not kept up with growth" when a community grew over 20% since 2021 (or was new) and sat below 0.75; Needs attention tiers Urgent, High, Watch with a growth weight.', 'Homes built since 2021 against older homes, amenity by amenity. A reading for each community: Measured gap, Check inventory, Most homes within reach, Too few homes.'],
    ['People', 'Residents and children from the population estimate in every figure.', 'Distance: homes from the property roll, no population estimate. Crowding only: children and residents from the estimate, shown as an estimate with how much it moves.'],
  ];
  const f = A ? (A.findings || []) : [];
  const fl = A ? (A.old_flagged_now || []) : [];
  const kinds = A ? acKinds(A) : [];
  const cnt = k => fl.filter(r => (r[k] || {}).reading === 'no_gap').length;
  box.innerHTML = `<div class="banner info">${icon('alert')}<div><strong>Revised 5 November 2026.</strong> ${esc(A ? A.revision.split('. ').slice(1).join('. ') : '')}</div></div>
    <section class="card"><h2>The method, before and after</h2><div class="table-wrap"><table class="data chg-table"><thead><tr><th scope="col"><span class="sr">Figure</span></th><th scope="col">Before (until 5 November 2026)</th><th scope="col">Now</th></tr></thead><tbody>
    ${old.map(([a, b, c]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td><td>${esc(c)}</td></tr>`).join('')}</tbody></table></div>
    <p class="card-note">Why: an audit on 5 November 2026 found the boundary count misled. North Haven Upper has no playground inside its boundary, yet 96% of its homes are within 400 m of one. Across about 215 communities, the rank agreement between the old playground figure and the share of homes within 400 m was about 0.45. <button type="button" class="link-btn small" data-method="access_revision">The full note</button></p></section>
    <section class="card"><h2>What changed in the findings</h2>
    <div class="chg-two"><div><h3>Before</h3><ul>
      <li>45 communities grew more than 20% since 2021 or were new; per resident they had fewer amenities: about 2.7 playgrounds per 1,000 children against 4.6 in the rest of Calgary, and 2 transit stops per 1,000 residents against nearly 4.</li>
      <li>23 communities were flagged as not having kept up with growth (home to about 230,000 people).</li>
      <li>The Needs attention tab ranked communities Urgent, High or Watch.</li></ul></div>
    <div><h3>Now</h3><ul>${A ? `<li>${esc(acHeadline(A))}</li>${acCrowdWords(A).map(x => `<li>Crowding (estimate): ${esc(x)}</li>`).join('')}` : '<li>The new figures are not available right now.</li>'}
      <li>The list of 23 communities is replaced: each community now has a reading for each amenity, never an overall rank.</li></ul></div></div></section>
    ${fl.length ? `<section class="card"><h2>The 23 communities on the earlier list, read with the new method</h2>
      <p class="card-sub">Share of homes within the first distance, and the reading, amenity by amenity. Of the 23, ${kinds.map(k => `${cnt(k)} have most homes within reach of ${esc((A.kinds[k].plural || k))}`).join('; ')}.</p>
      <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Community</th><th scope="col" class="num">Homes</th>${kinds.map(k => `<th scope="col">${esc(A.kinds[k].label)}<small>within ${acM(acTh(A, k, false))}</small></th>`).join('')}</tr></thead><tbody>
      ${fl.slice().sort((a, b) => String(a.name).localeCompare(String(b.name))).map(r => `<tr><td>${esc(r.name)}</td><td class="num">${fmt(r.units)}</td>${kinds.map(k => `<td>${acPct((r[k] || {}).share_1)} ${acTag(A, (r[k] || {}).reading)}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div></section>` : ''}
    ${A && A.scores ? `<section class="card"><h2>Added amenity scores, ${dmy(A.scores.added)}</h2><ul>
      <li>Crowding for all six amenities (transit stops per 1,000 residents; community centres, recreation centres and libraries per 100,000 residents), and a score for each: the community's crowding against Calgary's (1.00 = Calgary).</li>
      <li>Local and district scores, each worked out 4 ways (2 distances x 2 counts of residents: the one chosen in Settings and the ${CY()} Census), shown as the figure for the count in use with its range. An all-six score is in each community's details only, since one average can hide a gap in one group.</li>
      <li>Labels instead of a ranking: consistent gap, depends on assumptions, no gap. Local amenities: ${fmt(Object.values(A.scores.communities || {}).filter(r => ((r.groups || {}).local || {}).consistency === 'consistent_gap').length)} communities shown with a consistent gap, ${fmt(Object.values(A.scores.communities || {}).filter(r => ((r.groups || {}).local || {}).consistency === 'depends').length)} depending on the assumptions; district facilities: ${fmt(Object.values(A.scores.communities || {}).filter(r => ((r.groups || {}).district || {}).consistency === 'consistent_gap').length)} and ${fmt(Object.values(A.scores.communities || {}).filter(r => ((r.groups || {}).district || {}).consistency === 'depends').length)}.</li>
</ul></section>` : ''}
    <section class="card"><h2>Also removed</h2><ul>
      <li>The amenity level and the "Needs attention" tab with its Urgent, High and Watch tiers, the growth weight and the "what it would take" list.</li>
      <li>Per-resident amenity counts as headline figures. The City's asset counts are still listed under Growth vs amenities, Assets.</li>
      <li>Data Genie no longer has the earlier figures; it explains the new ones and their limits.</li></ul></section>`;
}
document.addEventListener('click', e => {
  const g = e.target.closest('[data-goto]');
  if (g && typeof show === 'function') { show(g.dataset.goto); if (g.dataset.goto === 'changes') renderChanges(); }
  const far = e.target.closest('#ac-far [data-far]');
  if (far) { acFar = far.dataset.far === '1'; renderGap(); }
  const mm = e.target.closest('#ac-mapmode [data-mm]');
  if (mm) { acMapMode = mm.dataset.mm; renderGap(); }
});
// is the area's growth since the Census believable? (dashboard.growth_checks: the code is the method)
function growthChecks() {
  const G = D && D.population && D.population.checks;
  if (!G || !(G.checks || []).length) return '';
  const names = { city_pace: "City's total, one rate for all", city_actual: "City's total, shared by actual growth", model: 'Growth model (homes)' };
  const cur = popMethod();
  return `<div class="gap-scope growth-checks"><h2 class="h3">How much has ${esc(W())} grown since ${CY()}? Checks against independent data</h2>
    <p class="card-sub">${CY() === 2021 ? 'The 2026 Census was taken in May 2026, but its counts are not published yet (population counts are due February 10, 2027), so' : 'Since the ' + CY() + ' Census,'} every figure today is an estimate. These checks use data the estimates do not rely on in the same way.</p>
    <div class="gc-list">${G.checks.map(c => `<div class="gc-item${c.key === 'homes_per_home' ? ' gc-key' : ''}"><div class="gc-top"><b>${esc(c.label)}</b><span class="gc-n">${signed(c.growth_pct, 1, '%')}${isNum(c.real_growth_pct) ? `<small>real growth ${signed(c.real_growth_pct, 1, '%')}</small>` : ''}</span></div><p>${esc(c.how)}</p></div>`).join('')}
      <div class="gc-item gc-range"><div class="gc-top"><b>Range of the checks</b><span class="gc-n">${signed(G.low, 1, '%')} to ${signed(G.high, 1, '%')}</span></div><p>Growth since the ${CY()} Census count, from the lowest check to the highest.</p></div></div>
    <h4 class="gc-h">Each way of counting residents against the checks</h4>
    <div class="gc-list">${Object.entries(G.models || {}).filter(([k, v]) => isNum(v) && names[k]).map(([k, v]) => `<div class="gc-item gc-model${k === cur ? ' gc-cur' : ''}"><div class="gc-top"><b>${esc(names[k])}${k === cur ? ' <small>(in use)</small>' : ''}</b><span class="gc-n">${signed(v, 1, '%')}<small>${({ within: 'within the range', near: 'within 1 point of the range', below: 'below the range', above: 'above the range' })[(G.verdict || {})[k]] || ''}</small></span></div></div>`).join('')}</div>
    <p class="card-note">${esc(G.settles_it || '')} <button type="button" class="link-btn small" data-method="population_choice">How residents are counted</button></p></div>`;
}
function gapMeter(v) {
  if (!isNum(v)) return '<span class="gap-meter"></span>';
  return `<span class="gap-meter" aria-hidden="true"><i style="width:${Math.min(100, v * 50)}%"></i><b></b></span>`;
}
document.addEventListener('change', e => {
  if (e.target.id === 'ac-kind') { acKind = e.target.value; renderGap(); }
  if (e.target.id === 'ac-ward') { acWard = e.target.value; renderGap(); }
  if (e.target.id === 'ac-nearonly') { acNearOnly = e.target.checked; renderGap(); }
  if (e.target.id === 'ac-other') { acOther = e.target.checked; if (!acOther) acPrivate = false; renderGap(); }
  if (e.target.id === 'ac-private') { acPrivate = e.target.checked; renderGap(); }
});
let grTyping;
$('#gr-text').addEventListener('input', e => { clearTimeout(grTyping); grTyping = setTimeout(() => { grFilter.text = e.target.value; renderGrowth(); }, 200); });
$('#gr-comm').addEventListener('change', e => { grFilter.comm = e.target.value; renderGrowth(); });
$('#gr-status').addEventListener('change', e => { grFilter.status = e.target.value; renderGrowth(); });
$('#gr-type').addEventListener('change', e => { grFilter.type = e.target.value; renderGrowth(); });
$('#gr-export').addEventListener('click', e => {
  const button = e.currentTarget;
  if (!D) return;
  let name, cols, rows;
  if (grView === 'assets') { const sv = $('#gap-assets-save'); if (sv) sv.click(); return; }
  if (grView === 'recon') { const sv = $('#rc-save'); if (sv) sv.click(); return; }
  if (grView === 'srg') { const x = forecastExport(); if (x) saveList(button, x.name, x.cols, x.rows); return; }
  if (grView === 'dp' && D.development) {
    name = '' + W() + ' development permits ' + D.period;
    cols = ['Permit', 'Applied', 'Status', 'Type', 'Category', 'Address', 'Community', 'Proposed use', 'Description', 'Decision', 'Decision date'];
    rows = grRows().map(p => [p.id, p.applied, p.status, p.type, p.category, p.address, p.comm ? commName(p.comm) : '', p.use, p.what, p.decision, p.decided]);
  } else if (grView === 'am' && D.amenities) {
    name = '' + W() + ' amenities by community';
    cols = ['Community', 'Residents today', 'Playgrounds', 'Transit stops', 'Transit stops per 1,000', 'Facilities'];
    rows = residential().map(c => { const x = D.amenities.by_comm[c.code] || {}; return [c.name, c.residents, x.playgrounds, x.stops, x.stops_per_1000, D.amenities.facilities.filter(f => f.comm === c.code).map(f => f.name).join('; ')]; });
  } else if (grView === 'gap' && D.access) {
    const A = acData(), ks = acKinds(A);
    name = 'Growth vs amenities, ' + W() + ', ' + (A.counted || '') + (A._variant ? ', ' + A._variant.label : '');
    cols = ['Community', 'Ward', 'Homes (units)', 'Homes built since ' + A.growth_year,
      ...ks.flatMap(k => [A.kinds[k].label + ' within ' + acTh(A, k, false) + ' m', A.kinds[k].label + ' within ' + acTh(A, k, true) + ' m',
        A.kinds[k].label + ', built since ' + A.growth_year + ', within ' + acTh(A, k, false) + ' m', A.kinds[k].label + ', older, within ' + acTh(A, k, false) + ' m',
        A.kinds[k].label + ', median distance (m)', A.kinds[k].label + ', reading',
        ...(AC_CROWD.includes(k) ? [A.kinds[k].label + ' crowding within ' + acTh(A, k, false) + ' m (estimate)', A.kinds[k].label + ' crowding within ' + acTh(A, k, true) + ' m (estimate)'] : [])])];
    rows = (A.communities || []).map(r => [r.name, r.ward || '', r.units, r.units_new, ...ks.flatMap(k => { const x = r[k] || {};
      return [x.share_1, x.share_2, x.share_new_1, x.share_old_1, x.median_m ?? '', (A.readings || {})[x.reading] || '',
        ...(AC_CROWD.includes(k) ? [x['crowding_' + acTh(A, k, false)], x['crowding_' + acTh(A, k, true)]] : [])]; })]);
  } else {
    name = 'Being built in ' + W() + ' ' + D.period;
    cols = ['Project', 'Permit', 'Kind', 'Stage', 'Cost', 'Where', 'Details', 'Project page'];
    rows = beingBuilt().map(r => [r.title, r.id || '', r.kind, r.stage, r.cost, r.where, r.what, r.url || '']);
  }
  saveList(button, name, cols, rows);
});

// ================================================================ POPULATION MONTH BY MONTH
let popmView = 'res';
const popmOn = new Set(['ward']);
wireSeg($('#popm-seg'), v => { popmView = v; renderPopSeries(); });
const POP_COLORS = ['#0369A1', '#DB2777', '#0D9488', '#D97706', '#7C3AED', '#16A34A', '#DC2626', '#64748B', '#0EA5E9', '#A16207', '#334155'];
function renderPopSeries() {
  const ps = D && D.pop_series;
  $('#popm-card').hidden = !ps;
  if (!ps) return;
  if (xcharts.popm) xcharts.popm.destroy();
  const comms = residential();
  if (popmView !== 'res') { popmOn.clear(); popmOn.add('ward'); }
  const chip = ([k, n], i) => `<button type="button" class="chip ${popmOn.has(k) ? 'on' : ''}" data-k="${k}" aria-pressed="${popmOn.has(k)}"><i style="background:${POP_COLORS[i % POP_COLORS.length]}"></i>${esc(n)}</button>`;
  const all = [['ward', '' + W() + ''], ...comms.map(c => [c.code, c.name])].map((x, i) => chip(x, i));
  const wasOpen = !!($('#popm-chips details') || {}).open;
  $('#popm-chips').innerHTML = popmView === 'res'
    ? (all.length > 16 ? all[0] + `<details class="dash-more"${wasOpen ? ' open' : ''}><summary>Add communities (${fmt(all.length - 1)})</summary><div class="chips">${all.slice(1).join('')}</div></details>` : all.join(''))
    : '<span class="card-sub">Children are shown for ' + W() + ' as a whole.</span>';
  $$('#popm-chips .chip').forEach(b => b.addEventListener('click', () => {
    popmOn.has(b.dataset.k) ? popmOn.delete(b.dataset.k) : popmOn.add(b.dataset.k);
    if (!popmOn.size) popmOn.add('ward');
    renderPopSeries();
  }));
  const labels = ps.months.map(m => monthLabel(m, { month: 'short', year: 'numeric' }));
  const ward = ps.months.map((_, i) => Object.values(ps.by_comm).reduce((t, a) => t + (a[i] || 0), 0));
  const sets = [];
  const add = (label, data, color, census) => sets.push({ label, data, borderColor: color, backgroundColor: color, borderWidth: 2.2, pointRadius: 0, pointHoverRadius: 4, tension: .2, _census: census });
  if (popmView === 'res') {
    [['ward', '' + W() + ''], ...comms.map(c => [c.code, c.name])].forEach(([k, n], i) => {
      if (!popmOn.has(k)) return;
      const cen = k === 'ward' ? Object.values(ps.census).reduce((t, v) => t + v, 0) : ps.census[k];
      add(n, k === 'ward' ? ward : ps.by_comm[k], POP_COLORS[i % POP_COLORS.length], cen);
    });
  } else {
    const k14 = popmView === 'k14';
    add(k14 ? 'Children aged 0 to 14, ' + W() + '' : 'Children under 5, ' + W() + '', k14 ? ps.children_0_14 : ps.children_0_4, '#DB2777', k14 ? ps.census_children_0_14 : ps.census_children_0_4);
  }
  // the 2021 Census count, as a marked point on Census day for each line
  sets.slice().forEach(d => { if (d._census) sets.push({ label: d.label + ': ' + CY() + ' Census', data: [d._census, ...Array(ps.months.length - 1).fill(null)], borderColor: d.borderColor, backgroundColor: '#fff', pointRadius: 6, pointStyle: 'rectRot', pointBorderWidth: 2, showLine: false, _marker: true }); });
  chartTheme();
  xcharts.popm = new Chart($('#popm-chart'), {
    type: 'line', data: { labels, datasets: sets },
    options: { maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10, filter: i => !sets[i.datasetIndex]._marker } },
        tooltip: { ...tooltipStyle(), filter: i => !sets[i.datasetIndex]._marker || i.dataIndex === 0, callbacks: {
          label: c => {
            const d = sets[c.datasetIndex];
            if (d._marker) return ` ${d.label}: ${fmt(c.parsed.y)}`;
            return ` ${d.label}: ${fmt(c.parsed.y)}${d._census ? ` (${signed(pct(c.parsed.y, d._census), 1)} since the ${CY()} Census)` : ''}`;
          } } } },
      scales: { x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } },
                y: { grid: { color: cssv('--chart-grid') }, ticks: { callback: v => fmt(v) } } } }
  });
  const last = ward[ward.length - 1], cen = Object.values(ps.census).reduce((t, v) => t + v, 0);
  $('#popm-sub').textContent = popmView === 'res'
    ? `${W()}: ${fmt(cen)} at the ${CY()} Census (May ${CY()}), about ${fmt(last)} now (${signed(pct(last, cen), 1)}). Select communities to compare.`
    : `${W()} children ${popmView === 'k14' ? 'aged 0 to 14' : 'under 5'}: ${fmt(popmView === 'k14' ? ps.census_children_0_14 : ps.census_children_0_4)} at the ${CY()} Census, about ${fmt((popmView === 'k14' ? ps.children_0_14 : ps.children_0_4).slice(-1)[0])} now (estimate).`;
  $('#popm-note').textContent = popmView === 'res'
    ? ({ model: 'Each month is worked out with the growth model: homes on the City\'s property roll, counted as lived in one year after they are built, times ' + CY() + ' Census people per home, plus rental buildings. Diamonds mark the ' + CY() + ' Census counts.',
         census2021: 'Residents are counted as at the ' + CY() + ' Census (Settings), so the line stays flat. Switch to the growth model in Settings to see growth since ' + CY() + '.',
         city_pace: 'Each month is the ' + CY() + ' Census grown at one rate for all of Calgary, so the whole city matches the City\'s own population estimate and forecast for that month. Diamonds mark the ' + CY() + ' Census counts.',
         city_actual: 'Each month: every community\'s ' + CY() + ' Census count times one factor, plus the growth the growth model measured there (homes built), so growth lands where homes were built and the whole city matches the City\'s own estimate and forecast for that month. Diamonds mark the ' + CY() + ' Census counts.' })[popMethod()]
    : `Estimate, not a count: each community's ${CY()} Census children, plus children for residents added since ${CY()} at the share seen in 2021 in the communities that were new at the Census across Calgary (${fmt(ps.new_share_0_14, 1)}% aged 0 to 14, ${fmt(ps.new_share_0_4, 1)}% under 5). No public count of children by community exists after 2021.`;
}

// ================================================================ CRIME AND SAFETY
let csiView = 'csi';
wireSeg($('#csi-seg'), v => { csiView = v; renderSafety(); });
const CSI_COLORS = { Calgary: '#DC2626', Edmonton: '#0369A1', Vancouver: '#0D9488', Toronto: '#7C3AED', 'Montréal': '#D97706', Winnipeg: '#64748B', Ottawa: '#16A34A', Canada: '#334155' };
function renderWardCrime() {
  const c = D && D.crime;
  $('#crime-card').hidden = !c;
  $('#crime-head').hidden = !c && !(D && D.safety);
  if (!c) return;
  if (xcharts.crime) xcharts.crime.destroy();
  $$('.crime-cmp').forEach(el => { el.textContent = `(change vs ${c.prev_period})`; });
  $('#crime-sub').textContent = `${c.period} against ${c.prev_period}. Calgary Police Service, by month${c.moved ? `: the police have published up to ${c.latest}` : ''}.`;
  const kpi = (label, v, ch, foot, upBad = true) => `<div class="ck"><span class="t">${esc(label)}</span><span class="v">${v}</span>${chg(ch, upBad, '%', 1, 'the same months a year before')}<span class="f">${foot}</span></div>`;
  $('#crime-kpis').innerHTML =
    kpi('Crimes reported', fmt(c.crimes), c.change_pct, `${fmt(c.crimes_prev)} a year before. Calgary: ${signed(c.city_change_pct, 1)}.`) +
    kpi('Violent crimes', fmt(c.violent), c.violent_change_pct, `assault, robbery and other violence, not domestic`) +
    kpi('Per 1,000 residents a year', fmt(c.per_1000, 1), null, `Calgary: ${fmt(c.city_per_1000, 1)}. ${W()} has ${fmt(c.share_of_city_pct, 1)}% of Calgary's crime and ${fmt(c.residents_share_pct, 1)}% of its residents.`) +
    (c.disorder ? kpi('Disorder calls', fmt(c.disorder.n), c.disorder.change_pct, `calls to police about disturbances, suspicious people, noise and more`) : '');
  const top = Math.max(...c.by_category.map(x => x.n), 1);
  $('#crime-cats').innerHTML = c.by_category.map(x => `<li><span class="lbl" title="${esc(x.category)}">${esc(x.label || x.category)}</span><span class="track"><span class="${x.violent ? 'viol' : ''}" style="width:${x.n / top * 100}%"></span></span><span class="v">${fmt(x.n)}</span>${chg(x.change_pct, true)}</li>`).join('');
  const rows = c.by_comm.filter(x => x.n || x.prev);
  $('#crime-comms').innerHTML = `<table class="data compact"><thead><tr><th scope="col">Community</th><th scope="col" class="num">Crimes</th><th scope="col" class="num">Per 1,000</th><th scope="col">vs ${esc(c.prev_period)}</th></tr></thead>
    <tbody>${rows.map(x => `<tr><td>${esc(x.name)}${x.code && !x.residents ? ' <small class="dash">business area</small>' : ''}</td><td class="num">${fmt(x.n)}</td><td class="num">${x.per_1000 !== null && x.per_1000 !== undefined ? fmt(x.per_1000, 1) : '<span class="dash">–</span>'}</td><td>${chg(x.change_pct, true)}</td></tr>`).join('')}</tbody></table>`;
  const m = c.monthly, half = Math.floor(m.n.length / 2);
  chartTheme();
  xcharts.crime = new Chart($('#crime-chart'), {
    type: 'bar', data: { labels: m.months.slice(half), datasets: [
      { label: c.period, data: m.n.slice(half), backgroundColor: cssv('--accent') || '#0B6BB5', borderRadius: 3, maxBarThickness: 34 },
      { label: 'A year before', data: m.n.slice(0, half), backgroundColor: cssv('--chart-grid') || '#CBD5E1', borderRadius: 3, maxBarThickness: 34 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10 } },
      tooltip: { ...tooltipStyle(), callbacks: { title: it => it[0].label, label: x => ` ${x.datasetIndex ? m.months[x.dataIndex] : m.months[half + x.dataIndex]}: ${fmt(x.parsed.y)} crimes` } } },
      scales: { x: { grid: { display: false } }, y: { grid: { color: cssv('--chart-grid') }, ticks: { callback: v => fmt(v) } } } }
  });
  $('#crime-note').textContent = `Crimes reported to the Calgary Police Service in ${W()}'s communities, including its business and industrial areas and the airport; per 1,000 uses the estimated residents in ${c.population_month || 'the middle of the period'}. The police count the most serious offence in each incident, leave out unfounded reports and domestic violence, and leave out incidents with no location. Calgary's rate uses the City's population for that month (${fmt(c.city_population)}, from the City's Calgary and Region Economic Outlook: 1,558,700 in April 2025, 1,583,200 forecast for April 2026). Source: Calgary Police Service community safety data (${c.file || 'quarterly file'}).`;
}
$('#crime-dash').addEventListener('click', () => openUrl((D && D.crime && D.crime.source) || 'https://www.calgarypolice.ca/transparency-and-accountability/community-safety-dashboard---monthly-snapshot.html#dashdata'));
$('#crime-file').addEventListener('click', () => openUrl((D && D.crime && (D.crime.link || D.crime.source)) || 'https://www.calgarypolice.ca/transparency-and-accountability/community-safety-dashboard---monthly-snapshot.html#dashdata'));

function renderRents() {
  const r = D && D.rents;
  $('#rent-card').hidden = !r;
  if (!r) return;
  const A = r.areas || {};
  if (!A.calgary) { $('#rent-card').hidden = true; return; }
  const zoneName = ((A.northeast || {}).name || 'Survey zone').replace(/^Zone \d+ ?[-–]? ?/, '');
  const rows = [['ward5', W() + ' area'], ['northeast', zoneName + ' zone'], ['calgary', 'Calgary']].filter(([k]) => A[k] && !(isCity() && k !== 'calgary'));
  const q = c => c && c.quality ? `<sup class="q q-${c.quality}" title="CMHC reliability: ${({ a: 'excellent', b: 'very good', c: 'good', d: 'use with caution' })[c.quality] || c.quality}">${c.quality}</sup>` : '';
  const money = c => c && isNum(c.value) ? '$' + fmt(c.value) + q(c) : '<span class="dash" title="Not published by CMHC (too few units)">–</span>';
  const pctc = c => c && isNum(c.value) ? fmt(c.value, 1) + '%' + q(c) : '<span class="dash">–</span>';
  const cal = A.calgary, w = isCity() ? cal : (A.ward5 || A.northeast || cal);
  const here = isCity() ? 'Calgary' : (A.ward5 ? W() + ' area' : zoneName + ' zone');
  const diff = (a, b) => isNum(a) && isNum(b) ? a - b : null;
  const rd = diff(w && w.rent && w.rent.Total.value, cal.rent.Total.value), vd = diff(w && w.vacancy && w.vacancy.Total.value, cal.vacancy.Total.value);
  $('#rent-sub').textContent = `CMHC Rental Market Survey, ${r.survey || 'latest'}: purpose-built rental apartments. Surveyed each October.`;
  $('#rent-kpis').innerHTML = `
    <div class="ck"><span class="t">Average rent, ${esc(here)}</span><span class="v">$${fmt(w.rent.Total.value)}</span>${isNum(rd) ? `<span class="chg ${Math.abs(rd) < 10 ? 'flat' : rd > 0 ? 'bad' : 'good'}">${rd >= 0 ? '+' : '−'}$${fmt(Math.abs(rd))}</span>` : ''}<span class="f">Calgary: $${fmt(cal.rent.Total.value)}. Two bedroom: $${fmt(w.rent['2 Bedroom'].value)}.</span></div>
    <div class="ck"><span class="t">Vacancy rate, ${esc(here)}</span><span class="v">${fmt(w.vacancy.Total.value, 1)}%</span>${isNum(vd) ? `<span class="chg neutral">${vd >= 0 ? '+' : '−'}${fmt(Math.abs(vd), 1)} pts</span>` : ''}<span class="f">Calgary: ${fmt(cal.vacancy.Total.value, 1)}%. Share of rental apartments empty and ready to rent.</span></div>
    <div class="ck"><span class="t">Rental apartments surveyed</span><span class="v">${fmt(w.units && w.units.Total.value)}</span><span class="f">Calgary: ${fmt(cal.units && cal.units.Total.value)}.</span></div>`;
  $('#rent-table').innerHTML = `<table class="data compact"><thead><tr><th scope="col">Area</th><th scope="col" class="num">1 bedroom</th><th scope="col" class="num">2 bedroom</th><th scope="col" class="num">3 bedroom +</th><th scope="col" class="num">All units</th><th scope="col" class="num">Vacancy</th><th scope="col" class="num">Units</th></tr></thead>
    <tbody>${rows.map(([k, n]) => { const a = A[k]; return `<tr><td>${esc(n)}</td><td class="num">${money(a.rent['1 Bedroom'])}</td><td class="num">${money(a.rent['2 Bedroom'])}</td><td class="num">${money(a.rent['3 Bedroom +'])}</td><td class="num"><b>${money(a.rent.Total)}</b></td><td class="num">${pctc(a.vacancy && a.vacancy.Total)}</td><td class="num">${fmt(a.units && a.units.Total.value)}</td></tr>`; }).join('')}</tbody></table>
    <p class="card-note">${isCity() ? '' : A.ward5 ? `${W()} area is CMHC's neighbourhood "${esc(A.ward5.name || '')}"${SCOPE === 5 ? ', which also takes in Coral Springs, Horizon and Sunridge' : `, which holds ${fmt(A.ward5.matched)} of the ward's ${fmt(A.ward5.of)} communities`}. ` : 'No CMHC neighbourhood matches this ward\'s communities, so the survey zone is shown. '}Rents are what tenants pay now in purpose-built rental apartments (not condos or basement suites, and not asking rents for empty units). Small letters are CMHC's reliability grades: a excellent to d use with caution.</p>`;
}

// ---------- who lives in Ward 5: the City's Ward 5 profile (2021 Census), Ward 5 against Calgary
let profView = 'all';
// a new ward or the whole city: community filters from the last view no longer apply
window.resetScopeFilters = () => { ccF.comm = ''; scF.comm = ''; grFilter.comm = ''; profView = 'all'; };
function renderProfile() {
  const P = D && D.profile;
  $('#profile-card').hidden = !P;
  if (!P) return;
  const groups = P.groups || [];
  if (profView !== 'all' && !groups.some(g => g.key === profView)) profView = 'all';
  const gr = D.ward && D.ward.growth_pct;
  $('#prof-sub').textContent = (P.partial ? 'The ' + CY() + ' Census by ward (City of Calgary open data, May ' + CY() + '): ' : 'The City of Calgary\'s ' + W() + ' profile, ' + CY() + ' Census (May ' + CY() + '): ') + W() + ' against Calgary. ' + (P.now ? `Residents, homes and children today follow the population setting (${P.now.method_label}, ${P.now.as_of_label}); the shares are from the Census, the latest full count of who lives here.` : 'The latest count of who lives here' + (isNum(gr) && Math.abs(gr) >= 3 ? `; ${W()} has ${gr > 0 ? 'grown' : 'shrunk'} about ${fmt(Math.abs(gr), 0)}% since.` : '.'));
  $('#prof-seg').innerHTML = [['all', 'Highlights'], ...groups.map(g => [g.key, g.title.replace(/ \(.*\)/, '')])]
    .map(([k, t]) => `<button type="button" role="radio" aria-checked="${k === profView}" data-prof="${k}">${esc(t)}</button>`).join('');
  $$('#prof-seg button').forEach(b => b.addEventListener('click', () => { profView = b.dataset.prof; renderProfile(); }));
  const val = (v, u) => !isNum(v) ? '–' : u === '%' ? fmt(v, v % 1 ? 1 : 0) + '%' : u === '$' ? '$' + fmt(v) : u === 'x' ? fmt(v, 1) : fmt(v);
  const row = it => {
    const big = isNum(it.w5) && isNum(it.cal) && it.cal > 0 && Math.abs(it.w5 / it.cal - 1) >= .25;
    const bars = it.unit === '%' && isNum(it.cal) ? `<span class="pf-bars"><i class="w" style="width:${Math.min(100, it.w5)}%"></i><i class="c" style="width:${Math.min(100, it.cal)}%"></i></span>` : '';
    return `<li class="${big ? 'hi' : ''}${it.now ? ' now' : ''}"><span class="pf-l">${esc(it.label)}${it.note ? `<small>${esc(it.note)}</small>` : ''}</span>
      <span class="pf-v">${val(it.w5, it.unit)}</span><span class="pf-c">${isNum(it.cal) ? val(it.cal, it.unit) : ''}</span>${bars}</li>`;
  };
  const list = l => l ? `<div class="pf-list"><h4>${esc(l.title)}</h4>${l.rows.map(r => `<div class="pf-lr"><span>${esc(r[0])}</span><span class="track"><span style="width:${Math.min(100, r[2])}%"></span></span><b>${fmt(r[2])}%</b><small>${fmt(r[1])}</small></div>`).join('')}<p class="card-note">${esc(l.note || '')}</p></div>` : '';
  const head = '<li class="pf-h"><span></span><span>' + W() + '</span><span>Calgary</span><span></span></li>';
  let shown;
  if (profView === 'all') {        // the differences that matter most for the office: 25% or more away from Calgary
    shown = groups.map(g => ({ ...g, items: g.items.filter(it => it.unit !== 'n' && isNum(it.w5) && isNum(it.cal) && it.cal > 0 && Math.abs(it.w5 / it.cal - 1) >= .25), list: null }))
      .filter(g => g.items.length);
  } else shown = groups.filter(g => g.key === profView);
  $('#prof-body').innerHTML = `<div class="pf-grid${profView === 'all' ? '' : ' one'}">${shown.map(g => `<div class="pf-group"><h3>${esc(g.title)}</h3><ul class="pf">${head}${g.items.map(row).join('')}</ul>${profView === 'all' ? '' : list(g.list)}</div>`).join('')}</div>
    <p class="card-note">${profView === 'all' ? 'Highlights: where ' + W() + ' differs from Calgary by a quarter or more. Choose a topic for every figure. ' : ''}${esc(P.source.notes)} Bars: <i class="pf-key w"></i>${W()} <i class="pf-key c"></i>Calgary.</p>`;
}

function renderSafety() {
  renderWardCrime();
  renderRents();
  const s = D && D.safety;
  $('#csi-card').hidden = !s;
  if (!s) return;
  if (xcharts.csi) xcharts.csi.destroy();
  const order = ['Calgary', 'Canada', ...s.ranking.map(r => r.city).filter(c => c !== 'Calgary')];
  const sets = order.filter(c => s.series[c] && s.series[c][csiView]).map(c => ({
    label: c === 'Canada' ? 'Canada (all)' : c, data: s.series[c][csiView], borderColor: CSI_COLORS[c] || '#94A3B8',
    backgroundColor: CSI_COLORS[c] || '#94A3B8', borderWidth: c === 'Calgary' ? 3.4 : 1.6, borderDash: c === 'Canada' ? [6, 4] : [],
    pointRadius: c === 'Calgary' ? 2.5 : 0, pointHoverRadius: 4, tension: .2 }));
  chartTheme();
  xcharts.csi = new Chart($('#csi-chart'), {
    type: 'line', data: { labels: s.years.map(String), datasets: sets },
    options: { maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10 } },
        tooltip: { ...tooltipStyle(), itemSort: (a, b) => b.parsed.y - a.parsed.y, callbacks: { label: c => ` ${c.dataset.label}: ${fmt(c.parsed.y, 1)}` } } },
      scales: { x: { grid: { display: false } }, y: { grid: { color: cssv('--chart-grid') }, ticks: { callback: v => fmt(v) } } } }
  });
  const names = { csi: 'Crime Severity Index', violent: 'Violent Crime Severity Index', non_violent: 'Non-violent Crime Severity Index' };
  const c = s.calgary, ch = s.calgary_change_pct;
  $('#csi-sub').textContent = `${names[csiView]}, ${s.years[0]} to ${s.latest_year}. Statistics Canada, yearly.`;
  const rank = s.ranking.findIndex(r => r.city === 'Calgary') + 1;
  $('#csi-side').innerHTML = `<div class="big"><span class="kpi-value">${fmt(c.csi, 1)}</span>${chg(ch.csi, true)}
      <span class="kpi-foot">Calgary in ${s.latest_year}, against ${fmt(s.canada, 1)} for Canada. ${fmt(Math.abs(s.calgary_10yr_pct || 0), 0)}% ${s.calgary_10yr_pct < 0 ? 'lower' : 'higher'} than in ${s.years[0]}.</span></div>
    <ul class="csi-list">
      <li><span>Violent crime</span><b>${fmt(c.violent, 1)}</b>${chg(ch.violent, true)}</li>
      <li><span>Non-violent crime</span><b>${fmt(c.non_violent, 1)}</b>${chg(ch.non_violent, true)}</li>
      <li><span>Rank of ${s.ranking.length} large cities</span><b>${rank}</b><small>1 = most severe</small></li></ul>`;
  $('#csi-note').textContent = `The Crime Severity Index weighs each police-reported crime by how serious it is (from court sentences), per person, so a murder counts far more than a shoplifting. 100 is Canada in 2006. Calgary is the Calgary metropolitan area, policed almost entirely by the Calgary Police Service. Source: Statistics Canada, table ${s.table}. Changes are from the year before.`;

}
window.renderSafety = renderSafety;

// ================================================================ DATA SOURCES
const DATASETS_OF = () => [
  { name: '311 Service Requests', id: 'iahh-g8bj', pub: 'City of Calgary', what: 'Every 311 request: type, date, status, department, community and how it was made. Updated daily, back to 2012.', used: 'Dashboard, Open issues, the study',
    ask: ['Download 311 data for our study period for ' + W() + '', 'Which ' + W() + ' community has the most open pothole requests?', 'Chart 311 requests in Saddle Ridge by month for the last two years'] },
  { name: 'Traffic Incidents', id: '35ra-9556', pub: 'City of Calgary', what: 'Reported traffic incidents with exact locations.', used: 'Dashboard map and key figures',
    ask: ['Map traffic incidents in ' + W() + ' in the last 90 days', 'Which ' + W() + ' intersections had the most traffic incidents this year?'] },
  { name: 'Building Permits', id: 'c2es-76ed', pub: 'City of Calgary', what: 'Building permits with housing units, project cost and status.', used: 'Homes in building permits',
    ask: ['How many new homes were approved in Cornerstone each year since 2020?', 'Download building permits issued in ' + W() + ' this year'] },
  { name: 'Development Permits', id: '6933-unw5', pub: 'City of Calgary', what: 'Development permit applications and decisions, with ward and community.', used: 'Growth vs amenities',
    ask: ['List new child care centres and schools applied for in ' + W() + ' this year', 'Download development permits for ' + W() + ' in the last 12 months'] },
  { name: 'Land Use Redesignation Applications', id: '33vi-ew4s', pub: 'City of Calgary', what: 'Rezoning applications (LOC numbers): changes to what a property may be used for, decided by Council at a public hearing. Placed in a ward and community by their map point.', used: 'Growth vs amenities (Development and rezoning)',
    ask: ['Which rezoning applications are still open in ' + W() + '?', 'Find rezoning application LOC2025-0257'] },
  { name: 'Road Construction Projects', id: 'sizs-hgef', pub: 'City of Calgary', what: 'The City\'s larger road projects, with budgets and timing.', used: 'Growth vs amenities, map',
    ask: ['What road construction is planned near ' + W() + '?'] },
  { name: 'Recreation Facilities', id: 'hxfu-6d96', pub: 'City of Calgary', what: 'Leisure centres, arenas, pools, sports fields and more.', used: 'Amenities, Growth vs amenities',
    ask: ['Which recreation facilities are in or near ' + W() + '?'] },
  { name: 'Community Services', id: 'x34e-bcjz', pub: 'City of Calgary', what: 'Libraries, community centres and other City services.', used: 'Amenities, Growth vs amenities',
    ask: ['List libraries and community centres in ' + W() + ''] },
  { name: 'Playground Equipment', id: 'bdu9-amk8', pub: 'City of Calgary', what: 'City playground equipment and play structures.', used: 'Amenities, map, Growth vs amenities',
    ask: ['How many playgrounds does each ' + W() + ' community have?'] },
  { name: 'Calgary Transit Stops', id: 'muzh-c9qc', pub: 'City of Calgary', what: 'Active and inactive transit stops.', used: 'Amenities, map, Growth vs amenities',
    ask: ['Which ' + W() + ' communities have the fewest transit stops per resident?'] },
  { name: 'Traffic Cameras', id: 'k7p9-kppz', pub: 'City of Calgary', what: 'Camera locations and their still images.', used: 'Traffic cameras, Briefing screen',
    ask: ['List the traffic cameras in ' + W() + ''] },
  { name: 'Property Assessments', id: '4bsw-nn7w', pub: 'City of Calgary', what: 'Every property on the assessment roll, with year built.', used: 'growth model (population today), Growth vs amenities (where every home is)',
    ask: ['How many homes were built in ' + W() + ' each year since 2015?'] },
  { name: '' + CY() + ' Census by Community', id: 'f9wk-wej9', pub: 'City of Calgary (Statistics Canada)', what: 'Population by age and household counts for every community, 2021.', used: 'Population and children',
    ask: ['Compare the age profile of Taradale and Cornerstone in the ' + CY() + ' Census'] },
  { name: 'Social Disorder Statistics', id: '4evm-wx9a', pub: 'City of Calgary (Calgary Police Service)', what: 'Police-reported social disorder by community. Public data ends July 2025.', used: 'Dashboard',
    ask: ['How did social disorder in ' + W() + ' change from 2023 to 2025?'] },
  { name: 'Schools', id: 'fd9t-tdn2', pub: 'City of Calgary', what: 'School locations, boards and grades.', used: 'Families and schools, map',
    ask: ['List the schools in ' + W() + ' with their grades'] },
  { name: 'Ward and community boundaries', id: 'tz8z-hyaz', pub: 'City of Calgary', what: 'Ward, community and City boundaries.', used: 'Every map', ask: [] },
  { name: 'Child Care Information', id: '', page: 'https://open.alberta.ca/opendata/childcareinformation', pub: 'Government of Alberta', what: 'Every licensed child care program, its capacity, and its inspections and enforcement, quarterly.', used: 'Families and schools',
    ask: ['Which ' + W() + ' child care programs had an order to remedy in the last year?'] },
  { name: 'Student enrolment by school', id: '', page: 'https://open.alberta.ca/opendata/student-enrolment-by-school-authority-and-grade-level', pub: 'Government of Alberta', what: 'Students enrolled at each school by grade, every school year.', used: 'Families and schools',
    ask: ['Which ' + W() + ' schools grew the most in the last five years?'] },
  { name: 'Community safety data', id: '', page: 'https://www.calgarypolice.ca/transparency-and-accountability/community-safety-dashboard---monthly-snapshot.html#dashdata', pub: 'Calgary Police Service', what: 'Crime by type, community and ward each month since 2020, and calls about disorder. Published every quarter; the data behind the police Community Safety Dashboard.', used: 'Dashboard (crime in ' + W() + '), Newsletter',
    ask: ['Which ' + W() + ' communities had the most vehicle thefts in the last 12 months?', 'How has violent crime in ' + W() + ' changed compared with a year ago?'] },
  { name: 'Community Crime Statistics, 2012 to 2019', id: '848s-4m4z', pub: 'City of Calgary (Calgary Police Service)', what: 'The older police crime counts by community and month, published on the City\'s open data site until 2019. For 2020 onward use Community safety data.', used: 'Data Genie',
    ask: ['How did crime in ' + W() + ' communities change from 2012 to 2019?'] },
    { name: 'Rental Market Survey', id: '', page: 'https://www03.cmhc-schl.gc.ca/hmip-pimh/en/TableMapChart?id=0140&t=3', pub: 'CMHC', what: 'Average rent, vacancy and the number of purpose-built rental apartments, by bedroom count, for Calgary, the Northeast zone and the neighbourhood that covers ' + W() + '. Surveyed each October.', used: 'Dashboard (rents and vacancy), Newsletter',
    ask: ['How do rents in the ' + W() + ' area compare with Calgary?'] },
  { name: 'Ward profile (' + CY() + ' Census)', id: '', page: 'https://www.calgary.ca/communities/profiles/wards.html', pub: 'City of Calgary (Statistics Canada)', what: 'Who lives in ' + W() + ' against Calgary: household size, ages, languages spoken at home, immigrants and recent arrivals, renters, crowding, housing costs, income and work. ' + CY() + ' Census, the latest full count.', used: 'Dashboard (who lives in ' + W() + '), Data Genie',
    ask: ['Which languages should ' + W() + ' notices be translated into, and how many residents would that reach?'] },
  { name: 'Crime Severity Index', id: '', page: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3510002601', pub: 'Statistics Canada', what: 'How much police-reported crime there is and how serious it is, for Calgary and every large city, each year since 1998. City level, not by ward.', used: 'Dashboard (crime in Calgary)',
    ask: ['How does Calgary\'s Crime Severity Index compare with Edmonton over the last 10 years?'] },
  { name: 'Daily climate data, Calgary airport', id: '', page: 'https://climate.weather.gc.ca/', pub: 'Environment and Climate Change Canada', what: 'Daily temperature, rain, snow and snow depth back to 1881. The airport station is inside ' + W() + '.', used: 'Data Genie',
    ask: ['How has Calgary\'s winter snowfall changed over the last 10 years?', 'Chart the hottest summers in Calgary since 2000'] },
  // the rest of what the app reads, so every number on screen has its source listed here
  { name: 'City population outlook', id: '', page: 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/corporate-economics/calgary-and-region-economic-outlook/Calgary-and-Region-Economic-Outlook-2026-Spring.pdf', pub: 'City of Calgary (Corporate Economics)', what: 'The City\'s population estimate and forecast for Calgary (Calgary and Region Economic Outlook 2026-2031, Spring 2026, Table 4, page 19), and its forecast of children. A published report, not open data: its figures are kept with Calgary Insight and updated with each new outlook.', used: 'Residents today (the default way of counting), live counter, children',
    ask: ['How is the population of Martindale worked out today?'] },
  { name: '2021 Census households by community', id: 'msjx-5ygv', pub: 'City of Calgary (Statistics Canada)', what: 'Private households by community in the 2021 Census.', used: 'Growth model (people per home)', ask: [] },
  { name: '2021 Census by ward', id: 'k4pr-cznc', pub: 'City of Calgary (Statistics Canada)', what: 'Ages, households, families and work for every ward in the 2021 Census (with jzfi-qvb4 and b5q8-82zn, and the same tables for Calgary).', used: 'Who lives in each ward',
    ask: ['How big are households in each ward?'] },
  { name: 'Parks Seating', id: 'ikeb-n5bc', pub: 'City of Calgary', what: 'Park benches and picnic tables.', used: 'Growth vs amenities, Assets list', ask: [] },
  { name: 'Parks Sport Equipment', id: 'da6k-wpxb', pub: 'City of Calgary', what: 'Basketball hoops, sports field goal posts and disc golf baskets.', used: 'Growth vs amenities, Assets list', ask: [] },
  { name: 'Parks Plumbing Fixtures', id: 'jjkg-kv4n', pub: 'City of Calgary', what: 'Park washrooms and drinking fountains.', used: 'Growth vs amenities', ask: [] },
  { name: 'Parks Wayfinder Garbage and Recycle', id: 'fwyk-8pth', pub: 'City of Calgary', what: 'Park garbage and recycling bins.', used: 'Growth vs amenities', ask: [] },
  { name: 'Parks Off Leash Areas', id: 'enr4-crti', pub: 'City of Calgary', what: 'Off-leash dog areas (outlines).', used: 'Growth vs amenities, Assets list', ask: [] },
  { name: 'Parks Sites', id: 'kami-qbfh', pub: 'City of Calgary', what: 'Every City park site (outlines), for park space and neighbourhood park space.', used: 'Growth vs amenities (distance to a park, park crowding), Assets list', ask: [] },
  { name: 'Public Trees', id: 'tfs4-3wwa', pub: 'City of Calgary', what: 'Every tree the City maintains.', used: 'Growth vs amenities', ask: [] },
  { name: 'Community District Boundaries', id: 'surr-xmvs', pub: 'City of Calgary', what: 'Community outlines, for placing amenities and programs in a community.', used: 'Every community count', ask: [] },
  { name: 'Amenities that are not the City\'s', id: '', page: 'https://www.openstreetmap.org/copyright', pub: 'OpenStreetMap contributors (Open Database Licence)', what: 'Playgrounds, parks, basketball courts, fitness stations and dog parks mapped by volunteers, read through the Overpass API every week; every one matching a City amenity is taken out.', used: 'Growth vs amenities (optional filter: playgrounds and parks), Assets list',
    ask: ['List the private amenities accessible to the community in Taradale with links'] },
  { name: 'Calgary Open Budget', id: 'fqax-i3nz', pub: 'City of Calgary', what: 'Every line of the City\'s operating and capital budget, by department and business unit.', used: 'City budget',
    ask: ['What is the City\'s 2026 operating budget by department?'] },
  { name: 'Budget book: operating revenue by source', id: '', page: 'https://www.calgary.ca/our-finances/budget.html', pub: 'City of Calgary', what: 'Operating revenue by source (property tax, user fees, franchise fees and so on) from the 2026 Budget as approved, Budget Overview, page 24. A published book, not open data: kept with Calgary Insight and updated with each budget.', used: 'City budget', ask: [] },
  { name: '2026 Property Tax Bylaw', id: '', page: 'https://municipalaffairs.gov.ab.ca/cfml/FinancialTaxRateSearch/pdf/tr_bylaws/2026_Bylaw_CALGARY_0046.pdf', pub: 'City of Calgary (Alberta Municipal Affairs)', what: 'The 2026 tax rates and levy (Bylaw 9M2026), applied to the assessment roll (4bsw-nn7w) to estimate property tax by ward and community. A bylaw document: its rates are kept with Calgary Insight.', used: 'City budget (property tax by ward)',
    ask: ['How much property tax does each ward pay?'] },
  { name: 'Missing-person appeals', id: '', page: 'https://newsroom.calgary.ca/police-news-releases/', pub: 'Calgary Police Service (City newsroom)', what: 'Missing-person news releases, read live from the City newsroom feed; nothing is saved, and an appeal disappears when the police take it down.', used: 'Dashboard', ask: [] },
];
const srcPage = d => d.page || ('https://data.calgary.ca/d/' + d.id);
const METHOD_KEY = { 'fqax-i3nz': 'budget', 'msjx-5ygv': 'population', 'k4pr-cznc': 'profile_wards', 'ikeb-n5bc': 'amenities', 'da6k-wpxb': 'amenities', 'jjkg-kv4n': 'amenities', 'fwyk-8pth': 'amenities', 'enr4-crti': 'amenities', 'kami-qbfh': 'access', 'tfs4-3wwa': 'amenities', 'surr-xmvs': 'wards', 'iahh-g8bj': '311', '35ra-9556': 'traffic', 'c2es-76ed': 'permits', '6933-unw5': 'dp', '33vi-ew4s': 'rezoning', 'sizs-hgef': 'roads',
  'hxfu-6d96': 'access', 'x34e-bcjz': 'access', 'bdu9-amk8': 'access', 'muzh-c9qc': 'access', 'k7p9-kppz': 'cameras',
  '4bsw-nn7w': 'population', 'f9wk-wej9': 'population', '4evm-wx9a': 'city_disorder', 'fd9t-tdn2': 'schools' };
const methodKey = d => METHOD_KEY[d.id] || ({ 'Child Care Information': 'child_care', 'Student enrolment by school': 'schools',
  'Daily climate data, Calgary airport': 'weather', 'Community safety data': 'police', 'Crime Severity Index': 'csi', 'Rental Market Survey': 'rents', ['Ward profile (' + CY() + ' Census)']: 'profile',
  'Amenities that are not the City\'s': 'other_amenities', '2026 Property Tax Bylaw': 'property_tax', 'City population outlook': 'population_choice' })[d.name];
let METHODS = null;
async function loadMethods() {
  if (METHODS) return METHODS;
  try { const a = await api(); METHODS = a.get_methods ? await a.get_methods() : []; } catch (e) { METHODS = []; }
  return METHODS;
}
function methodHtml(d) {
  const m = (METHODS || []).find(x => x.key === methodKey(d));
  if (!m) return '';
  const list = (xs, tag = 'ul') => xs && xs.length ? `<${tag}>${xs.map(x => `<li>${esc(x)}</li>`).join('')}</${tag}>` : '';
  return `<details class="src-method"><summary>How it is counted</summary>
    ${list(m.method)}
    ${m.excel && m.excel.length ? `<p class="sm-h">Check it yourself in Excel</p>${list(m.excel, 'ol')}` : ''}
    ${m.cautions && m.cautions.length ? `<p class="sm-h">Keep in mind</p>${list(m.cautions)}` : ''}
    <p class="sm-foot">Updated: ${esc(m.updated)}. Used in: ${esc(m.used_in)}.</p></details>`;
}
// ---------- how every figure is worked out: every method note, searchable; [data-method] buttons open one
function renderMethods(openKey) {
  if (!METHODS) { loadMethods().then(() => renderMethods(openKey)); return; }
  const q = ($('#meth-text').value || '').trim().toLowerCase();
  const list = (xs, tag = 'ul') => xs && xs.length ? `<${tag}>${xs.map(x => `<li>${esc(x)}</li>`).join('')}</${tag}>` : '';
  const ids = d => (d || '').split(/,\s*/).map(x => /^[a-z0-9]{4}-[a-z0-9]{4}$/.test(x.trim())
    ? `<button class="link-btn small" data-open="https://data.calgary.ca/d/${esc(x.trim())}">${esc(x.trim())}</button>` : esc(x.trim())).join(', ');
  const shown = METHODS.filter(m => !q || JSON.stringify(m).toLowerCase().includes(q));
  $('#meth-list').innerHTML = shown.map(m => `<details class="card meth" id="meth-${esc(m.key)}" ${m.key === openKey || (q && shown.length <= 3) ? 'open' : ''}>
      <summary><h2>${esc(m.name)}</h2><span class="card-sub">${esc(m.publisher)}${m.updated ? ' · ' + esc(m.updated) : ''}</span></summary>
      <p class="meth-meta"><b>Data:</b> ${ids(m.dataset)}${m.page ? ` · <button class="link-btn small" data-open="${esc(m.page)}">source page</button>` : ''}<br><b>Used in:</b> ${esc(m.used_in)}</p>
      <p class="sm-h">How it is worked out</p>${list(m.method, 'ol')}
      ${m.excel && m.excel.length ? `<p class="sm-h">Check it yourself</p>${list(m.excel, 'ol')}` : ''}
      ${m.cautions && m.cautions.length ? `<p class="sm-h">Keep in mind</p>${list(m.cautions)}` : ''}
      ${m.code ? `<p class="meth-meta"><b>In the code:</b> <code>${esc(m.code)}</code> (Data Genie can show it)</p>` : ''}
    </details>`).join('') || '<p class="card-sub">Nothing matches.</p>';
  if (openKey) { const el = document.getElementById('meth-' + openKey); if (el) setTimeout(() => el.scrollIntoView({ block: 'start' }), 50); }
}
$('#meth-text').addEventListener('input', () => renderMethods());
document.addEventListener('click', e => {
  const b = e.target.closest('[data-method]');
  if (!b) return;
  e.preventDefault();
  show('methods');
  renderMethods(b.dataset.method);
});
window.renderMethods = renderMethods;

function renderSources() {
  if (!METHODS) { loadMethods().then(() => renderSources()); }
  const pubs = [...new Set(DATASETS_OF().map(d => d.pub.replace(/ \(.*\)$/, '')))];
  const sel = $('#src-pub'), cur = sel.value;
  sel.innerHTML = '<option value="">All publishers</option>' + pubs.map(p => `<option ${p === cur ? 'selected' : ''}>${esc(p)}</option>`).join('');
  const q = $('#src-text').value.trim().toLowerCase();
  const list = DATASETS_OF().filter(d => (!sel.value || d.pub.startsWith(sel.value)) && (!q || [d.name, d.what, d.used, d.pub, ...d.ask].join(' ').toLowerCase().includes(q)));
  $('#src-grid').innerHTML = list.map(d => `<article class="card src">
      <div class="src-head"><div><h3>${esc(d.name)}</h3><p class="card-sub">${esc(d.pub)}${d.id ? ' · ' + esc(d.id) : ''}</p></div>
        <button class="btn icon-only" data-open="${esc(srcPage(d))}" aria-label="Open the ${esc(d.name)} page">${icon('open')}</button></div>
      <p>${esc(d.what)}</p>
      <p class="src-used"><b>Used in:</b> ${esc(d.used)}</p>
      ${d.name === 'Community safety data' && D && D.crime && D.crime.link ? `<button type="button" class="btn src-dl" data-open="${esc(D.crime.link)}">${icon('download')}<span>Download the data file: Jan 2020 to ${esc(D.crime.latest)}</span></button><p class="card-note">"Open" goes to the police page at <b>Dashboard data download</b>; its <b>Download Community Safety Data</b> button gives this same file. Every crime number on Calgary Insight can be checked in it (sheet Community Crime: filter Ward or Community, Year, Month; add up Total Crime).</p>` : ''}
      ${methodHtml(d)}
      ${d.ask.length ? `<div class="src-ask">${d.ask.map(a => `<button type="button" class="ask-chip" data-ask="${esc(a)}">${icon(/^download/i.test(a) ? 'download' : /^chart|^map|^compare/i.test(a) ? 'bars' : 'chat')}<span>${esc(a)}</span></button>`).join('')}</div>` : ''}
    </article>`).join('') || '<p class="card-sub">No datasets match.</p>';
}
$('#src-text').addEventListener('input', renderSources);
$('#src-pub').addEventListener('change', renderSources);
$('#src-catalogue').addEventListener('click', () => openUrl('https://data.calgary.ca/browse'));
// selecting an example puts it in Data Genie, ready to send (so nothing costs anything until you press Enter)
document.addEventListener('click', e => {
  const b = e.target.closest('[data-ask]');
  if (!b) return;
  if (!$('#brief').hidden) closeBrief();
  show('ask');
  const q = $('#question');
  q.value = b.dataset.ask;
  q.dispatchEvent(new Event('input'));
  q.focus();
});
function renderBriefSources() {
  $('#brief-sources').innerHTML = `<span class="bs-title">Data on Calgary Insight, ready to ask about, analyze or download</span>` +
    DATASETS_OF().map(d => `<span class="bs-chip">${esc(d.name)}<small>${esc(d.pub.replace(/ \(.*\)$/, '').replace('City of Calgary', 'City').replace('Government of Alberta', 'Alberta').replace('Environment and Climate Change Canada', 'Env. Canada'))}</small></span>`).join('');
}

// ================================================================ NEWSLETTER
const NEWS_SECTIONS_OF = () => [['glance', 'At a glance'], ['requests', 'What residents reported to 311'], ['communities', 'Community by community'],
  ['open', 'Requests still open'], ['growth', 'Growth and new development'], ['families', 'Families, child care and schools'],
  ['safety', 'Crime and safety'], ['rents', 'Rents and vacancy'], ['investment', 'Investment coming to ' + W() + ''], ['roads', 'Road construction'], ['contact', 'Contact the office']];
let newsInit = false, newsLast = null;
const ymOf = d => d.toISOString().slice(0, 7);
function newsLatest() { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d; }
function newsQuick(v) {
  const end = newsLatest(), start = new Date(end);
  if (v === 'last3') start.setMonth(start.getMonth() - 2);
  if (v === 'last12') start.setMonth(start.getMonth() - 11);
  if (v === 'ytd') start.setMonth(0);
  $('#news-from').value = ymOf(start); $('#news-to').value = ymOf(end);
  newsRangeNote();
}
function newsRangeNote() {
  const a = $('#news-from').value, b = $('#news-to').value;
  if (!a || !b) return;
  const n = (+b.slice(0, 4) - +a.slice(0, 4)) * 12 + (+b.slice(5) - +a.slice(5)) + 1;
  const nm = v => monthLabel(v, { month: 'long', year: 'numeric' });
  $('#news-range-note').textContent = n < 1 ? 'The first month must come before the last.'
    : n > 36 ? 'Choose 36 months or fewer.'
    : `${n === 1 ? nm(a) : nm(a) + ' to ' + nm(b)} (${n} month${n === 1 ? '' : 's'}), compared with the same months a year earlier.`;
  $('#news-make').disabled = n < 1 || n > 36;
}
function initNews() {
  if (newsInit) return;
  newsInit = true;
  const max = ymOf(newsLatest());
  ['#news-from', '#news-to'].forEach(id => { $(id).max = max; $(id).min = '2019-01'; $(id).addEventListener('change', () => { $$('#news-quick button').forEach(b => { b.classList.remove('is-on'); b.setAttribute('aria-checked', 'false'); }); newsRangeNote(); }); });
  wireSeg($('#news-quick'), newsQuick);
  $('#news-sections').innerHTML = NEWS_SECTIONS_OF().map(([k, n]) => `<label class="nf-check"><input type="checkbox" value="${k}" checked><span>${esc(n)}</span></label>`).join('');
  newsQuick('lastmonth');
}
function newsStatus(t, bad) { const el = $('#news-status'); el.textContent = t; el.classList.toggle('bad', !!bad); }
function showNewsPreview(html) {
  const f = $('#news-frame');
  $('#news-empty').hidden = true;
  f.onload = () => { try { f.contentDocument.designMode = 'on'; } catch (e) { /* preview still shows */ } };
  f.srcdoc = html;
}
async function newsAfterSave(res) {
  if (!res || !res.path) return;
  newsLast.path = res.path;
  $('#news-open').disabled = false;
  newsStatus(res.kind === 'pdf' ? `Saved as ${res.name} in Files, and opened.` : (res.warning || 'Saved as a web page.'), res.kind !== 'pdf');
}
$('#news-make').addEventListener('click', async () => {
  const btn = $('#news-make'), label = btn.querySelector('span');
  const opts = { start: $('#news-from').value, end: $('#news-to').value, title: $('#news-title').value.trim(),
    message: $('#news-msg').value, sections: $$('#news-sections input:checked').map(i => i.value), positive_only: !!$('#news-good')?.checked, pdf: true };
  if (!opts.sections.length) { newsStatus('Choose at least one section.', true); return; }
  btn.disabled = true; label.textContent = 'Working…';
  newsStatus('Getting the figures for those months from the City and Province. This takes up to a minute the first time.');
  try {
    const a = await api();
    const res = await a.newsletter_make(opts);
    if (!res || !res.ok) { newsStatus((res && res.error) || 'The newsletter could not be made.', true); return; }
    newsLast = { period: res.period, path: null };
    $('#news-prev-sub').textContent = `${res.period}${res.stale ? '. The City could not be reached, so the last saved figures are used.' : ''}. Click any text to change it.`;
    showNewsPreview(res.html);
    $('#news-save').disabled = false;
    await newsAfterSave(res);
  } catch (err) {
    newsStatus('The newsletter could not be made: ' + (err && err.message ? err.message : err), true);
  } finally { btn.disabled = false; label.textContent = 'Create newsletter (PDF)'; }
});
$('#news-save').addEventListener('click', async () => {
  const f = $('#news-frame'), btn = $('#news-save');
  if (!newsLast || !f.contentDocument) return;
  btn.disabled = true; newsStatus('Saving…');
  try {
    const doc = f.contentDocument;
    const html = '<!doctype html>\n' + doc.documentElement.outerHTML;
    const res = await (await api()).newsletter_save(html, newsLast.period);
    if (res && res.ok) await newsAfterSave(res); else newsStatus((res && res.error) || 'Could not save.', true);
  } catch (err) { newsStatus('Could not save: ' + (err && err.message ? err.message : err), true); }
  btn.disabled = false;
});
$('#news-open').addEventListener('click', async () => { if (newsLast && newsLast.path) (await api()).open_path(newsLast.path); });
window.initNews = initNews;


// ================================================================ SOURCE NOTES (every card: source, link, data to, note)
const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dmy = v => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || '')); return m ? `${+m[3]} ${MON3[+m[2] - 1]} ${m[1]}` : (v ? String(v) : ''); };
const stat = prefix => ((D && D.status) || []).find(x => x.name.startsWith(prefix)) || {};
const cityDs = (name, id, prefix) => () => { const st = stat(prefix); return { name, pub: 'City of Calgary', url: 'https://data.calgary.ca/d/' + id,
  to: st.city_updated ? `updated by the City ${dmy(st.city_updated)}` : '', ok: st.ok !== false }; };
const SRC = {
  r311: cityDs('311 Service Requests', 'iahh-g8bj', '311 requests'),
  traffic: cityDs('Traffic Incidents', '35ra-9556', 'Traffic incidents'),
  permits: cityDs('Building Permits', 'c2es-76ed', 'Building permits'),
  dp: cityDs('Development Permits', '6933-unw5', 'Development permits'),
  roads: cityDs('Road Construction Projects', 'sizs-hgef', 'Road construction'),
  rec: cityDs('Recreation Facilities', 'hxfu-6d96', 'Recreation facilities'),
  stops: cityDs('Calgary Transit Stops', 'muzh-c9qc', 'Transit stops'),
  play: cityDs('Playground Equipment', 'bdu9-amk8', 'Playgrounds'),
  svc: cityDs('Community Services', 'x34e-bcjz', 'Libraries and community'),
  cams: cityDs('Traffic Cameras', 'k7p9-kppz', 'Traffic cameras'),
  schools: cityDs('Schools (locations)', 'fd9t-tdn2', 'Schools'),
  cityDisorder: cityDs('Social Disorder Statistics', '4evm-wx9a', 'Police-reported social disorder'),
  pop: () => { const st = stat('Population model'); const m = popMethod();
    if (m === 'census2021') return { name: '' + CY() + ' Census by Community', pub: 'City of Calgary (Statistics Canada)', url: 'https://data.calgary.ca/d/f9wk-wej9', to: 'counted on May 11, 2021, without growth (Settings)' };
    if (m === 'city_pace' || m === 'city_actual') return { name: "" + CY() + " Census by Community, grown to the City's total", pub: 'City of Calgary', url: 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/corporate-economics/calgary-and-region-economic-outlook/Calgary-and-Region-Economic-Outlook-2026-Spring.pdf', to: "City population estimates and forecast (Calgary and Region Economic Outlook 2026-2031, Table 4, page 19)" };
    return { name: 'growth model: ' + CY() + ' Census by Community and Property Assessments', pub: 'City of Calgary',
    url: 'https://data.calgary.ca/d/4bsw-nn7w', to: `${CY()} Census (May ${CY()}), grown with the property roll${st.city_updated ? ` updated ${dmy(st.city_updated)}` : ''}` }; },
  police: () => { const c = D.crime || {}; return { name: 'Community safety data file' + (c.file ? ` (${c.file})` : ''), pub: 'Calgary Police Service', url: c.source || 'https://www.calgarypolice.ca/transparency-and-accountability/community-safety-dashboard---monthly-snapshot.html#dashdata',
    to: c.latest ? `data to the end of ${c.latest} (published every quarter)` : '' }; },
  profile: () => { const p = (D.profile || {}).source || {}; return { name: p.name || '' + W() + ' profile', pub: 'City of Calgary (Statistics Canada ' + CY() + ' Census)', url: p.page || 'https://www.calgary.ca/communities/profiles/wards.html', to: 'May 11, 2021' }; },
  csi: () => { const s = D.safety || {}; return { name: 'Crime Severity Index, table 35-10-0026-01', pub: 'Statistics Canada', url: s.page || 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3510002601',
    to: s.latest_year ? `data to ${s.latest_year} (published each July)` : '' }; },
  cmhc: () => { const r = D.rents || {}; return { name: 'Rental Market Survey', pub: 'CMHC', url: r.page || 'https://www03.cmhc-schl.gc.ca/hmip-pimh/en/TableMapChart?id=0140&t=3',
    to: r.survey ? `survey of ${r.survey} (yearly)` : '' }; },
  cc: () => { const c = (fam().child_care || {}); return { name: 'Child Care Information', pub: 'Government of Alberta', url: c.page || 'https://open.alberta.ca/opendata/childcareinformation',
    to: c.as_of ? `data to the ${c.as_of} quarter (published quarterly)` : '' }; },
  sch: () => { const c = (fam().schools || {}); return { name: 'Student enrolment by school', pub: 'Government of Alberta', url: c.page || 'https://open.alberta.ca/opendata/student-enrolment-by-school-authority-and-grade-level',
    to: c.latest_year ? `school year ${c.latest_year} (published yearly)` : '' }; },
};
const periodWords = () => D ? `${D.period}, compared with ${D.prev_period}` : '';
// card -> sources and a short note on what the card shows
const CARD_SOURCES = [
  ['.board', ['r311', 'police', 'traffic', 'permits', 'dp', 'pop'], () => `311, traffic, permits: ${periodWords()}. Crime: ${D.crime ? D.crime.period : 'not loaded'}. Open requests and residents are as of the last refresh (${dmy(D.built_at)}).`],
  ['[aria-labelledby="map-title"]', ['r311', 'pop', 'traffic', 'cams'], () => 'Most 311 requests are recorded at the community\'s centre point, not the exact address, so 311 is shaded by community. Traffic incidents: last 90 days of the period.'],
  ['[aria-labelledby="trend-title"]', ['r311'], () => `Requests by the month they were made, ${periodWords()}. Duplicates are left out.`],
  ['[aria-labelledby="feed-title"]', ['r311'], () => 'The newest requests the City has published; names and contact details are never published.'],
  ['#profile-card', ['profile'], () => CY() === 2021 ? 'People in private households, 2021 ward boundaries, as of May 2021 (income: 2020). Calgary Insight switches to the 2026 Census by itself when the City publishes it (expected 2027).' : `People in private households, as of May ${CY()}.`],
  ['#crime-card', ['police'], () => 'Every number here is in the police spreadsheet (link: police page, "Download Community Safety Data").'],
  ['#rent-card', ['cmhc'], () => 'Purpose-built rental apartments only; rents for ' + (isCity() ? 'Calgary as a whole' : (((D.rents || {}).areas || {}).ward5 ? 'the whole ' + W() + ' area' : 'the CMHC survey zone ' + W() + ' is in')) + ', not each community.'],
  ['#csi-card', ['csi'], () => 'City-wide only: no ward or community figures exist for this index.'],
  ['[aria-labelledby="pop-title"]', ['pop'], () => 'An estimate, not a count: the next Census figures by community are expected in 2027.'],
  ['[aria-labelledby="areas-title"]', ['r311'], () => `${periodWords()}. Service area is the first part of each 311 request type.`],
  ['#popm-card', ['pop'], () => 'Each month is estimated with the growth model; diamonds are ' + CY() + ' Census counts.'],
  ['#cc-card', ['cc', 'pop'], () => `Children are estimated: ${CY()} Census children grown with ${popWords()}.`],
  ['#ccc-card', ['cc', 'pop'], () => 'Licensed spaces against estimated children by community.'],
  ['#sc-card', ['sch', 'schools'], () => 'Students enrolled at the schools located inside ' + W() + ' (school locations: City of Calgary Schools dataset). Students are counted where they go to school, not where they live.'],
  ['#scl-card', ['sch', 'schools'], () => 'Change is since five school years earlier.'],
  ['#dp-card', ['dp'], () => `Applications made ${D ? D.period : ''}, by the permit's ward.`],
  ['#rw-card', ['roads'], () => 'The City\'s larger road projects only.'],
  ['#am-card', ['rec', 'stops', 'play', 'svc', 'pop'], () => 'Facilities as listed by the City today; rates use today\'s estimated residents.'],
  ['[aria-labelledby="camstrip-title"]', ['cams'], () => 'The City posts a new still image about once a minute and keeps no recording.'],
  ['[aria-labelledby="open-title"]', ['r311'], () => `Requests still open at the last refresh (${D ? dmy(D.built_at) : ''}), whenever they were made.`],
  ['[aria-labelledby="bench-title"]', ['r311'], () => periodWords()],
  ['[aria-labelledby="dis-title"]', () => (D && D.crime && D.crime.disorder) ? ['police'] : ['cityDisorder'], () => (D && D.crime && D.crime.disorder) ? `Calls to police about disorder, ${D.crime.period}. The police changed what counts as disorder in 2025.` : 'The City\'s disorder data ends in July 2025.'],
  ['.table-card', ['r311', 'pop', 'permits', 'dp'], () => `${periodWords()}. Residents today: ${popWords()}.`],
  ['#view-issues .content', ['r311'], () => `Every ${W()} request marked Open in the City's records at the last refresh (${D ? dmy(D.built_at) : ''}). Some are years old and may already be fixed.`],
  ['#view-families .content', ['cc', 'sch', 'schools', 'pop'], () => 'Inspection records are the Government of Alberta\'s; children are estimates.'],
  ['#view-growth .content', ['dp', 'rec', 'stops', 'play', 'svc', 'roads'], () => `Development permit applications made ${D ? D.period : ''}.`],
  ['#view-cameras .content', ['cams'], () => 'Images refresh about once a minute; replays cover the last 30 minutes.'],
];
// each source's method note, so every card links to how its figures are worked out
const SRC_METHOD = { r311: ['311', 'rates'], traffic: ['traffic'], permits: ['permits'], dp: ['dp'], roads: ['roads'],
  rec: ['amenities'], stops: ['amenities'], play: ['amenities'], svc: ['amenities'], cams: ['cameras'], schools: ['schools'],
  cityDisorder: ['city_disorder'], pop: ['population', 'population_choice'], police: ['police'], profile: [() => SCOPE === 5 ? 'profile' : 'profile_wards'],
  csi: ['csi'], cmhc: ['rents', 'rents_area'], cc: ['child_care', 'children'], sch: ['schools'] };
function sourceFootHtml(keys, note) {
  const ks = typeof keys === 'function' ? keys() : keys;
  const mk = [...new Set(ks.flatMap(k => (SRC_METHOD[k] || []).map(x => typeof x === 'function' ? x() : x)))];
  const how = mk.length ? `<span class="src-note"><span class="src-k">How it's counted</span> ${mk.map(k => { const m = (METHODS || []).find(x => x.key === k);
    return `<button type="button" class="link-btn small" data-method="${esc(k)}">${esc(m ? m.name : k)}</button>`; }).join(' · ')}</span>` : '';
  const list = ks.map(k => SRC[k] && SRC[k]()).filter(Boolean);
  const src = list.map(x => `<button type="button" class="src-link" data-open="${esc(x.url)}" title="Open ${esc(x.name)}">${esc(x.name)} (${esc(x.pub)})${icon('open')}</button>${x.to ? `<span class="src-to">: ${esc(x.to)}</span>` : ''}`).join('<span class="src-sep">·</span>');
  return `<span class="src-k">Source</span> ${src}${note ? `<span class="src-note"><span class="src-k">Note</span> ${esc(note)}</span>` : ''}${how}`;
}
function renderSourceNotes() {
  if (!D) return;
  if (!METHODS) { loadMethods().then(() => { if (METHODS && METHODS.length) renderSourceNotes(); }); }
  CARD_SOURCES.forEach(([sel, keys, note]) => {
    const host = $(sel);
    if (!host) return;
    const fold = !!host.closest('#view-dashboard');
    let el = host.querySelector(':scope > .src-foot');
    if (!el) { el = document.createElement(fold ? 'div' : 'p'); el.className = 'src-foot'; host.appendChild(el); }
    try { const h = sourceFootHtml(keys, note());
      el.innerHTML = fold ? `<details class="src-fold"${(el.querySelector('details') || {}).open ? ' open' : ''}><summary>Sources and how it's counted</summary>${h}</details>` : h; } catch (e) { el.remove(); }
  });
}
window.renderSourceNotes = renderSourceNotes;
// the community details panel is redrawn on every selection: add its source line each time
const panelEl = $('#panel');
if (panelEl) new MutationObserver(() => {
  if (!D || panelEl.querySelector(':scope > .src-foot') || !panelEl.children.length) return;
  const el = document.createElement('div'); el.className = 'src-foot';
  el.innerHTML = `<details class="src-fold"><summary>Sources and how it's counted</summary>${sourceFootHtml(['r311', 'pop', 'permits'], `311 and permits: ${periodWords()}. Residents: today's estimate.`)}</details>`;
  panelEl.appendChild(el);
}).observe(panelEl, { childList: true });

window.renderSources = renderSources;
window.renderBriefSources = renderBriefSources;

window.renderExtras = renderExtras;
window.extraMapLayers = extraMapLayers;
window.renderFamilies = renderFamilies;

// ================================================================ POPULATION BUILD-UP (dashboard.population_recon, population.py)
// Community by community: homes on the property roll x people per home + rental units x people per unit = the growth
// model, then the step to the way of counting chosen in Settings. One community at a time, every property on the roll.
const RC_TYPES = { R110: 'House (detached)', R111: 'House', R120: 'Semi-detached or duplex', R121: 'Semi-detached or duplex',
  R201: 'Condo apartment, low-rise', R202: 'Condo apartment, low-rise', R301: 'Condo apartment, high-rise', R302: 'Condo apartment, high-rise',
  R401: 'Townhouse or row unit', R402: 'Townhouse or row unit' };
const rcType = c => RC_TYPES[c] || ('Other residential (' + c + ')');
let rcComm = '', rcProps = null, rcLoading = false;
function renderRecon() {
  const R = D && D.population && D.population.recon, box = $('#gr-gap');
  $('#gr-sub').textContent = 'How the population is built from the property roll: every home and rental unit, times people per home, adding up to the total';
  if (!R) { $('#gr-stats').innerHTML = ''; box.innerHTML = '<p class="empty">The build-up is not available in this refresh.</p>'; return; }
  const T = R.totals, m = popMethod();
  $('#gr-stats').innerHTML = [[fmt(T.homes_now, 0), 'homes on the property roll: houses, condos and other homes, each its own account'],
    [fmt(T.units_now, 0), 'flats in rented-out apartment buildings (one account per building, so counted apart)'],
    [fmt(T.homes_now + T.units_now, 0), 'homes in all'], [fmt(T.residents), 'residents, ' + popChip()]]
    .map(([b, s]) => `<div class="istat"><b>${b}</b><span>${esc(s)}</span></div>`).join('');
  const rows = [...R.rows].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  const stepHead = { city_actual: 'City forecast top-up (shared by actual growth)', city_pace: 'City forecast top-up (one rate for all)', census2021: 'Step to the ' + CY() + ' Census', model: 'Step' }[m] || 'Step';
  rcComm = rcComm && rows.some(r => r.code === rcComm) ? rcComm : '';
  box.innerHTML = `<div class="gap-scope"><h2 class="h3">${esc(W())}: from homes to residents</h2>
    <p class="card-sub">Read across each row: <b>homes × people per home</b>, plus <b>rental units × people per unit</b>, gives the estimate from homes; the City forecast top-up then takes it to the residents shown on the site (${esc(popWords())}). Choose a community to list every property behind its figure.</p>
    <p class="card-sub"><b>Why rental units are listed apart:</b> a rented-out apartment building is one account (one roll number) on the City's property roll for the whole building, so it would count as one home. Its flats are counted instead, from the City's building permits or, where no permit was found, estimated from its assessed value. Condo flats are each their own account on the roll, so they are counted as homes directly.</p>
    ${D.srg && D.srg.scope ? `<p class="card-note"><b>Looking ahead:</b> the City's Suburban Residential Growth forecast adds ${fmt(D.srg.scope.forecast_people)} people in ${esc(W())}'s new communities from ${D.srg.first_forecast_year} to ${D.srg.last_year}, taking these residents from ${fmt(D.srg.scope.residents_now)} to ${fmt(D.srg.scope.residents_2030)}. <button type="button" class="link-btn small" id="rc-fc">Forecast to ${D.srg.last_year}</button></p>` : ''}
    <p><button type="button" class="btn" id="rc-xlsx">${icon('download')}<span>Save the build-up as Excel</span></button> <small class="card-note">Homes × people per home = residents, community by community, with the sums as Excel formulas, and every rental building with where its number of units comes from.</small></p>
    <div class="table-wrap tall"><table class="data rc-table"><thead><tr><th scope="col">Community</th><th scope="col" class="num">${CY()} Census residents</th><th scope="col" class="num">${CY()} households</th>
      <th scope="col" class="num">Homes on Census day</th><th scope="col" class="num">Homes today</th><th scope="col" class="num">People per home</th><th scope="col" class="num">People in homes</th>
      <th scope="col" class="num">Rental units today</th><th scope="col" class="num">People per unit</th><th scope="col" class="num">People in rental units</th>
      <th scope="col" class="num">Estimate from homes</th><th scope="col">${esc(stepHead)}</th><th scope="col" class="num">Residents (in use)</th><th scope="col">How the model counted it</th></tr></thead><tbody>
    ${rows.map(r => `<tr${r.code === rcComm ? ' class="is-sel"' : ''}><td><button type="button" class="link-btn rc-pick" data-c="${esc(r.code)}">${esc(titleCase(r.name))}</button></td>
      <td class="num">${r.census2021 ? fmt(r.census2021) : 'new'}</td><td class="num">${r.households_2021 ? fmt(r.households_2021) : 'new'}</td><td class="num">${fmt(r.homes_census, 1)}</td><td class="num">${fmt(r.homes_now, 1)}</td>
      <td class="num">${fmt(r.people_per_home, 3)}</td><td class="num">${isNum(r.people_in_homes) ? fmt(r.people_in_homes, 1) : '–'}</td>
      <td class="num">${fmt(r.units_now, 1)}</td><td class="num">${fmt(r.people_per_unit, 2)}</td><td class="num">${isNum(r.people_in_units) ? fmt(r.people_in_units, 1) : '–'}</td>
      <td class="num"><b>${fmt(r.population)}</b></td><td class="wrap rc-step">${esc(r.step || '')}${r.rounding ? ` (rounding ${signed(r.rounding, 0, '')})` : ''}</td><td class="num"><b>${fmt(r.residents)}</b></td>
      <td class="wrap rc-how">${esc(r.method === 'people per home' ? 'Per-home average' : r.method === 'household size' ? 'Household size (homes on Census day too far from Census households)' : r.census2021 ? "Calgary's average (fewer than 20 homes on Census day)" : "Calgary's average (built since " + CY() + ')')}: ${esc(r.how || '')}</td></tr>`).join('')}
    <tr class="cmp-city-row"><td><b>${esc(W())}</b></td><td class="num"><b>${fmt(T.census2021)}</b></td><td></td><td class="num"><b>${fmt(T.homes_census, 0)}</b></td><td class="num"><b>${fmt(T.homes_now, 0)}</b></td><td></td><td class="num"><b>${fmt(T.people_in_homes, 0)}</b></td><td class="num"><b>${fmt(T.units_now, 0)}</b></td><td></td><td class="num"><b>${fmt(T.people_in_units, 0)}</b></td><td class="num"><b>${fmt(T.population)}</b></td><td></td><td class="num"><b>${fmt(T.residents)}</b></td><td></td></tr>
    </tbody></table></div>
    ${(() => { const hsr = rows.filter(r => r.method === 'household size'); return hsr.length ? `<p class="card-note">People in homes and in rental units are not split for the ${hsr.length} ${hsr.length === 1 ? 'community' : 'communities'} counted by household size (${esc(hsr.slice(0, 6).map(r => titleCase(r.name)).join(', '))}${hsr.length > 6 ? '…' : ''}): their residents are the ${CY()} count + the change in homes x the ${CY()} household size, so the two "people in" totals add up to ${fmt(T.people_in_homes + T.people_in_units, 0)}, and the other ${fmt(T.population - T.people_in_homes - T.people_in_units, 0)} come from those communities (and from any community kept at its ${CY()} count, see its note). "Homes on Census day" and "Homes today" leave out rental units, which are in their own column.</p>` : ''; })()}
    <p class="card-note">Homes: residential property with a building and a residential use on the City's property roll (4bsw-nn7w): commercial, vacant lots, parking stalls and storage lockers are left out; each home counts one year after its year of construction. People per home: ${CY()} Census residents (less the people in rental units) / homes on Census day, the same for every kind of home in a community; rental apartment buildings are one account on the roll, so their units come from building permits or, without one, from assessed value. Communities whose homes were more than 15% off the Census household count use the 2021 household size for the change only. <button type="button" class="link-btn small" data-method="homes">How homes are counted</button> <button type="button" class="link-btn small" data-method="population">The growth model</button></p></div>
    <div class="gap-scope" id="rc-props"></div>`;
  const fcBtn = $('#rc-fc'); if (fcBtn) fcBtn.addEventListener('click', () => { const t = $('#gr-seg [data-gr="srg"]'); if (t) t.click(); });
  $$('.rc-pick', box).forEach(b => b.addEventListener('click', () => { rcComm = b.dataset.c; rcProps = null; renderRecon(); loadProps(); }));
  $('#rc-xlsx').addEventListener('click', async e => {
    const btn = e.currentTarget, sp = btn.querySelector('span'), a = await api();
    const r = a.save_buildup ? await a.save_buildup() : { ok: false, error: 'Not available here.' };
    sp.textContent = r && r.ok ? 'Saved' : ('Could not save: ' + ((r && r.error) || ''));
    setTimeout(() => { sp.textContent = 'Save the build-up as Excel'; }, 3000);
  });
  $('#gr-notes').textContent = `Sources: City of Calgary open data: Current Year Property Assessments (4bsw-nn7w), the ${CY()} Census by community (f9wk-wej9) and households (msjx-5ygv), building permits matched to rental buildings; the City's population outlook for the step to the City's total.`;
  renderProps();
}
async function loadProps() {
  const R = D.population.recon, c = rcComm;
  if (!c || rcLoading) return;
  rcLoading = true; renderProps();
  try {
    const q = `https://data.calgary.ca/resource/4bsw-nn7w.json?$select=roll_number,address,sub_property_use,year_of_construction,assessed_value&$where=${encodeURIComponent(R.homes_where + " AND comm_code='" + c + "'")}&$order=address&$limit=50000`;
    const r = await fetch(q);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    rcProps = { comm: c, rows: await r.json() };
  } catch (e) { rcProps = { comm: c, error: String(e.message || e) }; }
  rcLoading = false; renderProps();
}
function homeShare(R, year) {                               // population.GrowthModel.home_share
  const tt = R.t - R.lag, y = Math.floor(tt), f = tt - y;
  if (!isNum(year)) return 0;
  if (y >= R.roll_year) return year <= R.roll_year - 1 ? 1 : 0;
  return year <= y - 1 ? 1 : (year === y ? f : 0);
}
function propRows() {
  const R = D.population.recon, row = R.rows.find(x => x.code === rcComm);
  if (!rcProps || rcProps.comm !== rcComm || !rcProps.rows || !row) return null;
  const rollKey = v => String(v || '').replace(/^0+/, '');
  const rentRolls = new Set(R.rentals.filter(x => x.comm === rcComm).map(x => rollKey(x.roll)));
  const k = row.method === 'household size' ? null : row.people_per_home;
  return rcProps.rows.map(p => {
    const yr = p.year_of_construction ? Math.round(+p.year_of_construction) : null;
    const rental = rentRolls.has(rollKey(p.roll_number));
    const share = rental ? 0 : homeShare(R, yr);
    return { roll: p.roll_number, address: p.address, type: rental ? 'Rental apartment building (units listed below)' : rcType(p.sub_property_use), code: p.sub_property_use,
      year: yr, value: +p.assessed_value || null, share, people: k !== null ? share * k : null,
      note: rental ? 'Counted by its units, not as one home' : share === 0 ? 'Not lived in yet (built ' + (yr || '?') + ')' : share < 1 ? 'Part of the year: built ' + yr + ', counted ' + fmt(share * 100, 0) + '% lived in' : '' };
  });
}
function renderProps() {
  const el = $('#rc-props');
  if (!el) return;
  const R = D.population.recon, row = R.rows.find(x => x.code === rcComm);
  if (!rcComm || !row) { el.innerHTML = '<p class="empty">Choose a community above to list every property behind its figure.</p>'; return; }
  if (rcLoading) { el.innerHTML = `<p class="empty">Reading every property in ${esc(titleCase(row.name))} from the City's property roll…</p>`; return; }
  if (rcProps && rcProps.error) { el.innerHTML = `<p class="empty">The City's property roll could not be read just now (${esc(rcProps.error)}). Try again in a minute.</p>`; return; }
  const P = propRows();
  if (!P) { el.innerHTML = ''; return; }
  const rent = R.rentals.filter(x => x.comm === rcComm);
  const homes = P.reduce((a, p) => a + p.share, 0), people = P.reduce((a, p) => a + (p.people || 0), 0);
  const byType = {};
  P.forEach(p => { const t = byType[p.type] || (byType[p.type] = { n: 0, homes: 0, people: 0 }); t.n++; t.homes += p.share; t.people += p.people || 0; });
  const unitsPeople = rent.length ? (row.people_in_units ?? null) : 0;
  const beyond = row.homes_now - homes;
  const hs = row.method === 'household size';
  el.innerHTML = `<div class="gap-assets-head"><h2 class="h3">Every property in ${esc(titleCase(row.name))}</h2>
      <button type="button" class="btn small" id="rc-save">${icon('download')}<span>Save every property</span></button></div>
    <p class="card-sub">Read live from the City's property roll just now: ${fmt(P.length)} accounts that count as homes. People per home: ${fmt(row.people_per_home, 4)}${hs ? ' (2021 household size: this community uses the change in homes only, see the note)' : ''}.</p>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Kind of home</th><th scope="col" class="num">Accounts</th><th scope="col" class="num">Homes lived in</th><th scope="col" class="num">People</th></tr></thead><tbody>
      ${Object.entries(byType).sort((a, b) => b[1].n - a[1].n).map(([t, v]) => `<tr><td>${esc(t)}</td><td class="num">${fmt(v.n)}</td><td class="num">${fmt(v.homes, 1)}</td><td class="num">${hs ? '–' : fmt(v.people, 1)}</td></tr>`).join('')}
      <tr><td>Rental units in ${fmt(rent.length)} apartment buildings (${fmt(row.units_permit, 0)} from building permits, ${fmt(row.units_built, 0)} by year built, ${fmt(row.units_estimated, 0)} estimated from assessed value)</td><td class="num">${fmt(rent.length)}</td><td class="num">${fmt(row.units_now, 1)} units</td><td class="num">${hs ? '–' : fmt(unitsPeople, 1)}</td></tr>
      ${Math.abs(beyond) >= 0.5 ? `<tr><td>Difference from the roll read just now (homes added or removed since the morning refresh, or homes the model adds after the roll year at last year's pace)</td><td></td><td class="num">${fmt(beyond, 1)}</td><td class="num">${hs ? '–' : fmt(beyond * row.people_per_home, 1)}</td></tr>` : ''}
      <tr class="cmp-city-row"><td><b>Growth model total</b></td><td></td><td class="num"><b>${fmt(row.homes_now + row.units_now, 1)}</b></td><td class="num"><b>${fmt(row.population)}</b>${hs ? '' : ` <small>(${fmt(people + (unitsPeople || 0) + (Math.abs(beyond) >= 0.5 ? beyond * row.people_per_home : 0), 1)} added up here)</small>`}</td></tr>
      <tr><td>${esc(row.step || '')}</td><td></td><td></td><td class="num"><b>${fmt(row.residents)}</b> <small>${esc(popChip())}</small></td></tr>
    </tbody></table></div>
    <div class="table-wrap tall"><table class="data"><thead><tr><th scope="col">Address</th><th scope="col">Kind</th><th scope="col" class="num">Year built</th><th scope="col" class="num">Assessed value</th><th scope="col" class="num">Share lived in</th><th scope="col" class="num">People</th><th scope="col">Note</th></tr></thead><tbody>
      ${P.slice(0, 600).map(p => `<tr><td>${esc(p.address || '')}</td><td>${esc(p.type)}</td><td class="num">${p.year || '–'}</td><td class="num">${p.value ? '$' + fmt(p.value) : '–'}</td><td class="num">${fmt(p.share, 2)}</td><td class="num">${isNum(p.people) ? fmt(p.people, 2) : '–'}</td><td class="wrap">${esc(p.note)}</td></tr>`).join('')}
      ${rent.map(x => `<tr class="rc-rent"><td>Roll ${esc(x.roll)}${x.address ? `<small>${esc(x.address)}</small>` : ''}</td><td>Rental apartment building</td><td class="num">${x.year_of_construction || '–'}</td><td></td><td class="num">${fmt(x.units)} units</td><td class="num">${hs ? '–' : fmt(x.units * row.people_per_unit, 1)}</td><td class="wrap">${x.source === 'permit' ? 'Units from building permit ' + (x.permits || []).map(q => `<a href="https://data.calgary.ca/resource/c2es-76ed.json?permitnum=${encodeURIComponent(q.num)}" target="_blank" rel="noopener">${esc(q.num)}</a>`).join(', ') : x.source === 'estimated' ? 'Units estimated from assessed value' + (row.estimate_scale < 1 ? ` (scaled x ${fmt(row.estimate_scale, 3)})` : '') : 'Units by year built'}</td></tr>`).join('')}
    </tbody></table></div>${P.length > 600 ? `<p class="card-note">The first 600 homes are shown; "Save every property" has all ${fmt(P.length)}.</p>` : ''}`;
  $('#rc-save').addEventListener('click', async () => {
    const r = await (await api()).save_csv(`Population build-up, ${titleCase(row.name)}`, ['Roll number', 'Address', 'Kind', 'Use code', 'Year built', 'Assessed value', 'Share lived in', 'People per home', 'People', 'Note'],
      [...P.map(p => [p.roll, p.address, p.type, p.code, p.year, p.value, Math.round(p.share * 1e4) / 1e4, row.people_per_home, isNum(p.people) ? Math.round(p.people * 1e4) / 1e4 : '', p.note]),
       ...rent.map(x => [x.roll, x.address || '', 'Rental apartment building', x.code, x.year_of_construction, '', '', row.people_per_unit, Math.round(x.units * row.people_per_unit * 100) / 100, `${x.units} units (${x.source === 'permit' ? 'building permit ' + (x.permits || []).map(q => q.num).join(', ') : x.source})`]),
       ['', '', 'Growth model total', '', '', '', '', '', row.population, row.how], ['', '', 'Residents in use', '', '', '', '', '', row.residents, row.step]]);
    if (r && r.ok) $('#rc-save span').textContent = 'Saved';
  });
}

window.renderGrowth = renderGrowth;


// ================================================================ REPORTS (Data Genie and Data Scientist)
function reportCard(ev) {
  const card = document.createElement('div'); card.className = 'card file report';
  const pdf = ev.pdf || ev.print || (/\.pdf$/i.test(ev.path || '') ? ev.path : null);
  const bits = [pdf ? 'PDF' : null, ev.interactive ? 'interactive version' : null, ev.xlsx ? 'Excel workbook' : null].filter(Boolean);
  card.innerHTML = `${icon('news')}<div><div class="file-name">${esc(ev.title || ev.name || 'Report')}</div><div class="file-sub">${esc(bits.join(', '))}${ev.visuals ? `, ${fmt(ev.visuals)} chart${ev.visuals === 1 ? '' : 's'}, maps and tables` : ''}. Saved in Files.${ev.warning ? ' ' + esc(ev.warning) : ''}</div></div>
    <div class="file-actions">${pdf ? `<button class="btn primary" data-p="${esc(pdf)}${/\.html?$/i.test(pdf) ? '#print' : ''}">${icon('file')}<span>PDF</span></button>` : ev.interactive ? `<button class="btn primary" data-p="${esc(ev.interactive)}#print">${icon('file')}<span>PDF</span></button>` : ''}${ev.interactive ? `<button class="btn" data-p="${esc(ev.interactive)}">${icon('open')}<span>Interactive</span></button>` : ''}${ev.xlsx ? `<button class="btn" data-p="${esc(ev.xlsx)}">${icon('download')}<span>Excel</span></button>` : ''}</div>`;
  $$('[data-p]', card).forEach(b => b.addEventListener('click', async () => (await api()).open_path(b.dataset.p)));
  return card;
}
window.reportCard = reportCard;

// ================================================================ DATA SCIENTIST
const DS_AREA = { '311': ['list', '#0369A1'], Safety: ['shield', '#B91C1C'], Growth: ['crane', '#B45309'], Families: ['child', '#7C3AED'],
  Transit: ['bus', '#0F766E'], Housing: ['home', '#BE185D'], People: ['users', '#4338CA'], Roads: ['cone', '#C2410C'] };
let dsBusy = false;
async function renderScientist(fresh = true) {
  const a = await api();
  const s = await a.get_settings();
  $('#ds-nokey').hidden = !!s.has_key;
  if (fresh || !$('#ds-topics').children.length) {
    const topics = await a.analyst_topics(6);
    $('#ds-topics').innerHTML = topics.map(t => { const [ic, col] = DS_AREA[t.area] || ['bars', '#0369A1'];
      return `<button type="button" class="ds-topic" data-key="${esc(t.key)}" style="--ds:${col}" ${dsBusy ? 'disabled' : ''}>
        <span class="ds-top"><span class="ds-ic2">${icon(ic)}</span><span class="ds-area">${esc(t.area)}</span></span>
        <b>${esc(t.title)}</b><span class="ds-about">${esc(t.about)}</span>
        <span class="ds-go2">Make this report ${icon('next')}</span></button>`; }).join('');
    $$('.ds-topic').forEach(b => b.addEventListener('click', () => runDs({ key: b.dataset.key, title: $('b', b).textContent })));
  }
  loadDsReports();
}
window.renderScientist = renderScientist;
async function loadDsReports() {
  const list = await (await api()).analyst_reports();
  const box = $('#ds-reports');
  if (!list.length) { box.innerHTML = '<p class="card-sub ds-empty">No reports yet. Pick a topic above, or describe your own.</p>'; return; }
  box.innerHTML = `<div class="ds-rows">${list.slice(0, 40).map((r, i) => `<div class="ds-row">
      <div class="ds-row-main"><b>${esc(r.title || 'Report')}</b><small>${esc(stampText(r.made))}${r.question ? ' · ' + esc(String(r.question).replace(/^Data Scientist request:.*?Topic: /, '').slice(0, 140)) : ''}</small></div>
      <div class="file-actions">${r.pdf ? `<button class="btn primary" data-p="${esc(r.pdf)}${/\.html?$/i.test(r.pdf) ? '#print' : ''}">${icon('file')}<span>PDF</span></button>` : r.interactive ? `<button class="btn primary" data-p="${esc(r.interactive)}#print">${icon('file')}<span>PDF</span></button>` : ''}${r.interactive ? `<button class="btn" data-p="${esc(r.interactive)}">${icon('open')}<span>Interactive</span></button>` : ''}${r.xlsx ? `<button class="btn" data-p="${esc(r.xlsx)}">${icon('download')}<span>Excel</span></button>` : ''}</div></div>`).join('')}</div>`;
  $$('[data-p]', box).forEach(b => b.addEventListener('click', async () => (await api()).open_path(b.dataset.p)));
}
// which stage a step belongs to, from the words the engine uses
const dsStage = t => /writing the report/i.test(t) ? 3 : /drawing|placing points|building a table|chart|map/i.test(t) ? 2 : /working out|calculat/i.test(t) ? 1 : 0;
function setStage(n, done = false) {
  $$('#ds-stages li').forEach(li => { const k = +li.dataset.stage; li.classList.toggle('done', done || k < n); li.classList.toggle('on', !done && k === n); });
}
async function runDs({ key, title, text }) {
  if (dsBusy) return;
  dsBusy = true;
  $$('.ds-topic, #ds-go').forEach(b => { b.disabled = true; });
  $('#ds-run').hidden = false;
  $('#ds-run').classList.remove('is-done');
  $('#ds-run-title').textContent = title || text;
  $('#ds-run-sub').textContent = 'Working on it. This usually takes 3 to 8 minutes; you can use the rest of Calgary Insight meanwhile.';
  $('#ds-steps').innerHTML = '<li>Planning the analysis</li>';
  $('#ds-result').innerHTML = '';
  setStage(0);
  $('#ds-run').scrollIntoView({ behavior: 'smooth', block: 'start' });
  try {
    const res = await (await api()).analyst_run(key || null, text || null);
    if (!res.ok) { $('#ds-result').innerHTML = `<div class="err">${esc(res.error)}</div>`; $('#ds-run-sub').textContent = 'The report could not be finished.'; setStage(-1); }
    else {
      setStage(4, true);
      $('#ds-run').classList.add('is-done');
      $('#ds-run-sub').textContent = 'Done. The files are below and in Your reports.';
      $('#ds-result').insertAdjacentHTML('beforeend', `<div class="answer ds-findings">${DOMPurify.sanitize(marked.parse(res.text || ''))}</div>`);
    }
  } catch (e) {
    setStage(-1);
    $('#ds-result').innerHTML = `<div class="err">${esc(e.message || e)}</div>`;
  } finally {
    dsBusy = false;
    $$('.ds-topic, #ds-go').forEach(b => { b.disabled = false; });
    loadDsReports();
  }
}
window.onAnalystEvent = ev => {
  if (ev.type === 'step') {
    $('#ds-steps').insertAdjacentHTML('beforeend', `<li>${esc(ev.text)}</li>`);
    const cur = Math.max(...$$('#ds-stages li.on, #ds-stages li.done').map(li => +li.dataset.stage), 0);
    setStage(Math.max(cur, dsStage(ev.text)));
  } else if (ev.type === 'report') {
    $('#ds-result').prepend(reportCard(ev));
  }
};
$('#ds-shuffle').addEventListener('click', () => renderScientist(true));
$$('#ds-chips button').forEach(b => b.addEventListener('click', () => {
  const t = $('#ds-text'); t.value = (t.value.trim() + ' ' + b.dataset.add).trim(); t.focus();
}));
$('#ds-own').addEventListener('submit', e => { e.preventDefault(); const t = $('#ds-text').value.trim(); if (t) runDs({ text: t, title: t.length > 110 ? t.slice(0, 107) + '…' : t }); });

// ================================================================ MISSING PERSONS (police appeals, live)
async function loadMissing(force = false) {
  const box = $('#mp-list'); if (!box) return;
  if (force) $('#mp-sub').textContent = 'Checking the Calgary Police news releases…';
  let r;
  try { r = await (await api()).missing_persons(!!force); } catch (e) { r = { ok: false, error: String(e.message || e), appeals: [] }; }
  const list = r.appeals || [];
  const w5 = list.filter(a => a.ward5), other = list.filter(a => !a.ward5);
  window._mpPage = r.page;
  $('#mp-sub').textContent = !r.ok ? 'Could not check right now (no internet connection?).'
    : `${w5.length ? `${w5.length} appeal${w5.length === 1 ? '' : 's'} naming a ${W()} community` : 'No appeals naming a ' + W() + ' community'}${other.length ? `, ${other.length} elsewhere in Calgary` : ''}. Checked ${stampText(r.checked).replace(/\.$/, "")}${r.stale ? ' (last successful check)' : ''}.`;
  $('#mp-card').classList.toggle('has-w5', !!w5.length);
  const item = a => `<li class="mp-item${a.ward5 ? ' w5' : ''}">
      <div class="mp-main"><div class="mp-top">${a.ward5 ? '<span class="badge warn">' + W() + '</span>' : ''}<b>${esc(a.title)}</b></div>
        <p>${esc(a.summary)}</p>
        <small>${a.communities.length ? 'Names ' + esc(a.communities.join(', ')) + ' · ' : a.place ? 'Last seen near ' + esc(a.place) + ' · ' : ''}Posted ${esc(stampText(a.posted))}</small></div>
      <button class="btn" data-mp="${esc(a.link)}">${icon('open')}<span>Police release</span></button></li>`;
  box.innerHTML = !list.length
    ? `<div class="mp-empty">${icon('check')}<div><b>No active missing-person appeals from the Calgary Police right now.</b><span>New appeals appear here as soon as the police post them.</span></div></div>`
    : `<ul class="mp-ul">${w5.map(item).join('')}</ul>${other.length ? `<details class="mp-more"${w5.length ? '' : ' open'}><summary>Elsewhere in Calgary (${other.length})</summary><ul class="mp-ul">${other.map(item).join('')}</ul></details>` : ''}`;
  $$('[data-mp]', box).forEach(b => b.addEventListener('click', async () => (await api()).open_url(b.dataset.mp)));
}
window.loadMissing = loadMissing;
$('#mp-check')?.addEventListener('click', () => loadMissing(true));
$('#mp-page')?.addEventListener('click', async () => (await api()).open_url(window._mpPage || 'https://newsroom.calgary.ca/police-news-releases/'));
$('#refresh')?.addEventListener('click', () => loadMissing(true));
(async () => { await api(); loadMissing(false); setInterval(() => loadMissing(true), 10 * 60000); })();
