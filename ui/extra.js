/* Ward 5 Data Desk: period picker, data status, families and schools, growth and amenities.
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
    $('#rw-list').innerHTML = rw.length ? `<ul class="rw">${rw.map(r => `<li><div><strong>${esc(r.title)}</strong>
        <small>${esc(r.type)}${r.completion ? '. Expected to finish: ' + esc(r.completion) : ''}${r.budget ? '. Budget: ' + esc(r.budget) : ''}${r.in_ward ? '' : '. Just outside ' + W() + ''}</small></div>
        ${r.url ? `<button class="btn icon-only" data-open="${esc(r.url)}" aria-label="Project page for ${esc(r.title)}">${icon('open')}</button>` : ''}</li>`).join('')}</ul>
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
    <table class="data compact"><thead><tr><th scope="col"></th><th scope="col" class="num">2021</th><th scope="col" class="num">Today</th><th scope="col" class="num">Growth</th></tr></thead><tbody>
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
  $('#gr-gap').hidden = !['gap', 'assets', 'recon'].includes(grView);
  $('#gr-list').hidden = ['gap', 'assets', 'recon'].includes(grView);
  if (grView === 'gap') { renderGap(); return; }
  if (grView === 'recon') { renderRecon(); return; }
  if (grView === 'assets') { renderAssets(); return; }
  if (grView === 'dp') {
    const dv = D.development;
    if (!dv) { head.innerHTML = ''; body.innerHTML = '<tr><td class="empty">Development permit data is not available right now.</td></tr>'; $('#gr-stats').innerHTML = ''; return; }
    const comms = [...new Set(dv.list.map(p => p.comm))].filter(Boolean).map(c => [c, commName(c)]).sort((a, b) => a[1].localeCompare(b[1]));
    $('#gr-comm').innerHTML = '<option value="">All of ' + W() + '</option>' + comms.map(([c, n]) => `<option value="${esc(c)}">${esc(n)}</option>`).join('');
    $('#gr-comm').value = grFilter.comm;
    $('#gr-status').innerHTML = '<option value="">Any status</option>' + dv.by_status.map(s => `<option value="${esc(s.status)}">${esc(s.status)} (${fmt(s.n)})</option>`).join('');
    $('#gr-type').innerHTML = `<option value="larger">Larger developments only (${fmt(dv.larger)})</option><option value="">All types (${fmt(dv.applied)})</option>` +
      (dv.by_type || []).map(t => `<option value="${esc(t.type)}">${esc(t.type)} (${fmt(t.n)})</option>`).join('');
    $('#gr-type').value = grFilter.type;
    $('#gr-note').hidden = false;
    $('#gr-note').innerHTML = `${icon('alert')}<div>${dv.list_complete === false ? `<strong>The list holds the newest ${fmt(dv.list.length)} of ${fmt(dv.applied)} applications</strong> (the counts above include all of them; choose a ward for its full list). ` : ''}<strong>What this list shows.</strong> Development permits are the City's approval of what can be built on a property or how it is used, before a building permit. ${grFilter.type === 'larger' ? 'Showing larger developments: new homes and apartment buildings, changes of use (including new child care centres, schools and clinics) and new commercial and industrial buildings. Choose "All types" in Type to include basement suites, signs, home businesses, small exceptions to the rules and renovations.' : 'Showing ' + (grFilter.type ? '"' + esc(grFilter.type) + '"' : 'every type, from basement suites to new buildings') + '.'}</div>`;
    $('#gr-status').value = grFilter.status;
    $('#gr-sub').textContent = `Development permit applications in ${W()}, ${D.period}`;
    $('#gr-stats').innerHTML = [[fmt(dv.applied), 'applications'], [fmt(dv.released), 'approved and released'], [fmt(dv.in_review), 'in review or on hold'],
      [fmt(dv.refused), 'refused'], [fmt(dv.cancelled), 'cancelled']].map(([b, s]) => `<div class="istat"><b>${b}</b><span>${s}</span></div>`).join('');
    const rows = grRows();
    head.innerHTML = '<tr><th scope="col">Permit</th><th scope="col">Applied</th><th scope="col">Status</th><th scope="col">Type</th><th scope="col">Address</th><th scope="col">Community</th><th scope="col">Proposed use</th><th scope="col">Description</th><th scope="col">Decision</th></tr>';
    body.innerHTML = rows.slice(0, 600).map(p => `<tr><td class="mono">${esc(p.id)}</td><td>${esc(p.applied)}</td><td>${esc(p.status)}</td><td>${esc(p.type)}</td><td>${esc(p.address)}</td>
      <td>${esc(p.comm ? commName(p.comm) : '–')}</td><td>${esc(titleCase(p.use || ''))}</td><td class="wrap">${esc(p.what)}</td><td>${esc(p.decision ? p.decision + (p.decided ? ', ' + p.decided : '') : '–')}</td></tr>`).join('')
      || '<tr><td colspan="9" class="empty">No permits match these filters.</td></tr>';
    $('#gr-notes').innerHTML = `Showing ${fmt(Math.min(rows.length, 600))} of ${fmt(rows.length)}. Source: City of Calgary, Development Permits open data. Each permit's full file is on the City's <button class="link-btn small" data-open="${esc(dv.page)}">Development Map (permit application search)</button>: search for the permit number.`;
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
    $('#gr-notes').textContent = 'Sources: City of Calgary open data: Recreation Facilities, Community Services (libraries, community centres), Playground Equipment (play structures) and Calgary Transit Stops (active stops). Facilities in business areas, like the Saddle Ridge community centre, are on the map but not in this table.';
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
// ---------- amenity gap: where amenities have not kept up with growth
let gapKind = '', gapFlagged = false, gapOther = false, gapPrivate = false;   // gapOther: add amenities that are not the City's (OpenStreetMap); gapPrivate: residents-only (access=private) ones too, off unless chosen
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
  box.innerHTML = `<div class="gap-scope" id="gap-assets"><div class="gap-assets-head"><h3>${esc(title)}</h3>
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

function renderGap() {
  const g = D.amenity_gap, box = $('#gr-gap');
  if (!g || !g.by_comm) {
    $('#gr-stats').innerHTML = ''; $('#gr-notes').textContent = '';
    box.innerHTML = '<p class="empty">City asset data is not available right now. It is counted again at the next refresh.</p>';
    return;
  }
  const kinds = g.kinds || {}, keys = Object.keys(kinds);
  if (gapKind && !kinds[gapKind]) gapKind = '';
  const city = isCity();
  const wardOf = {};
  (D.communities || []).forEach(c => { wardOf[c.code] = c.ward; });
  const unit = k => kinds[k].per === 'children' ? 'per 1,000 children' : 'per 1,000 residents';
  const kd = (k, v) => k === 'trees' ? fmt(v, 0) : fmt(v, 2);
  const flagged = g.by_comm.filter(r => r.flag);
  const scopeLevel = (() => {
    const v = keys.map(k => ((g.scope || {})[k] || {}).vs_city).filter(isNum).map(x => Math.min(2, x));
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  })();
  $('#gr-sub').textContent = city
    ? 'Public amenities in every Calgary community against its residents and growth since ' + CY() + ''
    : 'Public amenities in each ' + W() + ' community against its residents and growth, compared with the city';
  const stats = [[fmt(flagged.length), `communities where amenities have not kept up with growth (grew over ${g.growth_pct_threshold}% since ${CY()} or are new, and sit below ${fmt(g.level_threshold, 2)})`]];
  if (!city && isNum(scopeLevel)) stats.unshift([fmt(scopeLevel, 2), 'amenity level of ' + W() + ', City amenities only (1.00 = the city level)']);
  if (!city && isNum(g.level_all)) stats.splice(1, 0, [fmt(g.level_all, 2), 'with private amenities accessible to the community too (developer, school; OpenStreetMap)']);
  if (city && D.wards_summary) {
    const low = [...D.wards_summary.wards].filter(w => isNum(w.amenity_level)).sort((a, b) => a.amenity_level - b.amenity_level)[0];
    if (low) stats.push([`Ward ${low.ward}`, `lowest amenity level of the 14 wards (${fmt(low.amenity_level, 2)} City only${isNum(low.amenity_level_all) ? ', ' + fmt(low.amenity_level_all, 2) + ' with private accessible' : ''})`]);
  }
  $('#gr-stats').innerHTML = stats.map(([b, s]) => `<div class="istat"><b>${b}</b><span>${s}</span></div>`).join('');

  // the ward against the city, kind by kind
  // every asset counted in each ward and in all of Calgary (the city view), so the office can read the inventory
  const ws = city && D.wards_summary;
  const assetTable = ws && ws.amenity_counts_city ? `<div class="gap-scope" id="gap-assets"><div class="gap-assets-head"><h3>Assets in every ward</h3>
      <button type="button" class="btn small" id="gap-assets-save">${icon('download')}<span>Save this table</span></button></div>
    <p class="card-sub">How many of each the City's open data lists in each ward and in Calgary as a whole (park space in hectares). Counted ${esc(stampText(g.counted || ''))}.</p>
    <div class="table-wrap"><table class="data gap-assets"><thead><tr><th scope="col">Asset</th>${ws.wards.map(w => `<th scope="col" class="num">Ward ${w.ward}</th>`).join('')}<th scope="col" class="num">Calgary</th></tr></thead><tbody>
    ${keys.map(k => `<tr><td>${esc(kinds[k].label)}</td>${ws.wards.map(w => `<td class="num">${fmt((w.amenity_counts || {})[k], k.endsWith('_ha') ? 1 : 0)}</td>`).join('')}<td class="num"><b>${fmt(ws.amenity_counts_city[k], k.endsWith('_ha') ? 1 : 0)}</b></td></tr>`).join('')}
    </tbody></table></div></div>` : '';
  const scopeTable = city ? assetTable : `<div class="gap-scope"><h3>${esc(W())} against Calgary</h3>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Amenity</th><th scope="col" class="num">${esc(W())}</th><th scope="col" class="num">Calgary</th><th scope="col" class="num">${esc(W())}, per 1,000</th><th scope="col" class="num">Calgary, per 1,000</th><th scope="col">Against the city</th></tr></thead><tbody>
    ${keys.map(k => { const s = (g.scope || {})[k] || {}, c = (g.city || {})[k] || {}; const v = s.vs_city;
      return `<tr><td>${esc(kinds[k].label)} <small class="gap-short">${unit(k)}</small></td><td class="num">${fmt(s.n, k.endsWith('_ha') ? 1 : 0)}</td><td class="num">${fmt(c.n, k.endsWith('_ha') ? 1 : 0)}</td><td class="num">${kd(k, s.per_1000)}</td><td class="num">${kd(k, c.per_1000)}</td>
        <td>${gapMeter(v)}<span class="gap-level ${isNum(v) ? (v < g.level_threshold ? 'low' : v >= 1 ? 'high' : '') : ''}">${isNum(v) ? fmt(v * 100, 0) + '%' : '–'}</span></td></tr>`; }).join('')}
    </tbody></table></div></div>`;

  let rows = g.by_comm.filter(r => !gapFlagged || r.flag);
  if (gapKind) rows = [...rows].sort((a, b) => ((a.per_1000 || {})[gapKind] ?? 1e9) - ((b.per_1000 || {})[gapKind] ?? 1e9));
  else rows = [...rows].sort((a, b) => (b.flag - a.flag) || ((a.level ?? 9) - (b.level ?? 9)));
  const shortList = r => (r.short || []).filter(k => kinds[k]).sort((a, b) => (r.vs_city[a] ?? 1) - (r.vs_city[b] ?? 1)).slice(0, 4)
    .map(k => `${esc(kinds[k].label)} ${isNum(r.vs_city[k]) ? fmt(r.vs_city[k] * 100, 0) + '%' : ''}`).join(' · ');
  const wardCol = city ? '<th scope="col" class="num">Ward</th>' : '';
  // the amenity level under every way of counting residents (and with amenities that are not the City's)
  const mKeysC = Object.keys(g.by_method || {}).filter(k => (g.by_method[k] || {}).communities);
  const mShort = { city_actual: "City's total, actual growth", city_pace: "City's total, one rate", model: 'growth model', census2021: CY() + ' Census' };
  const withO = gapOther && !!g.other;               // the "add non-City amenities" switch
  const hasP = !!(g.other && Object.keys(g.other.by_comm_private || {}).length) || isNum(g.level_all_private);
  const withP = withO && gapPrivate && hasP;          // the "include private ones" filter (off by default)
  const sfx = withP ? '_private' : '';                // which figures: open-to-all non-City ones, or private ones too
  const allWord = withP ? 'City + private accessible + gated residents-only' : 'City + private amenities accessible to the community';
  const head = gapKind
    ? `<tr><th scope="col">Community</th>${wardCol}<th scope="col" class="num">Residents today</th><th scope="col" class="num">Growth from homes built since ${CY()}<small>growth model</small></th><th scope="col" class="num">${esc(kinds[gapKind].label)}</th><th scope="col" class="num">${unit(gapKind)}</th><th scope="col">Against the city</th></tr>`
    : `<tr><th scope="col">Community</th>${wardCol}<th scope="col" class="num">Residents today</th><th scope="col" class="num">Growth from homes built since ${CY()}<small>growth model, used for the flags</small></th><th scope="col" class="num">Children 0 to 14</th>${(mKeysC.length ? mKeysC : ['']).map(k => `<th scope="col" class="${k === popMethod() ? 'gm-cur' : ''}">Amenity level${k ? ', ' + esc(mShort[k] || k) : ''}<small>${withO ? allWord : 'City amenities only'}</small></th>`).join('')}<th scope="col">Furthest behind the city</th></tr>`;
  const body = rows.slice(0, 400).map(r => {
    const name = `${esc(r.name)}${r.flag ? '<span class="gap-flag">Not kept up</span>' : ''}`;
    const ward = city ? `<td class="num">${wardOf[r.code] ? wardOf[r.code] : '–'}</td>` : '';
    const grow = `<td class="num">${isNum(r.growth_pct) ? signed(r.growth_pct, 1, '%') : r.new ? 'New since ' + CY() + '' : '–'}</td>`;
    if (gapKind) {
      const v = (r.vs_city || {})[gapKind];
      return `<tr><td>${name}</td>${ward}<td class="num">${fmt(r.residents)}</td>${grow}<td class="num">${fmt((r.n || {})[gapKind], gapKind.endsWith('_ha') ? 1 : 0)}</td>
        <td class="num">${kd(gapKind, (r.per_1000 || {})[gapKind])}</td><td>${gapMeter(v)}<span class="gap-level ${isNum(v) && v < g.level_threshold ? 'low' : ''}">${isNum(v) ? fmt(v * 100, 0) + '%' : '–'}</span></td></tr>`;
    }
    return `<tr><td>${name}</td>${ward}<td class="num">${fmt(r.residents)}</td>${grow}<td class="num">${fmt(r.children_0_14)}</td>
      ${(mKeysC.length ? mKeysC : ['']).map(k => { const BMk = (g.by_method || {})[k] || {};
        const v = withO ? (k ? (BMk['communities_all' + sfx] || {})[r.code] : r['level_all' + sfx]) : (k ? (BMk.communities || {})[r.code] : r.level);
        return `<td class="${k === popMethod() ? 'gm-cur' : ''}">${gapMeter(v)}<span class="gap-level ${isNum(v) ? (v < g.level_threshold ? 'low' : v >= 1 ? 'high' : '') : ''}">${fmt(v, 2)}</span></td>`; }).join('')}<td class="wrap gap-short">${shortList(r) || '–'}</td></tr>`;
  }).join('') || `<tr><td colspan="7" class="empty">No ${gapFlagged ? 'flagged ' : ''}communities to show.</td></tr>`;

  // the same levels under each way of counting residents
  const BM = g.by_method || {}, mKeys = Object.keys(BM);
  const lv = v => isNum(v) ? `${gapMeter(v)}<span class="gap-level ${v < g.level_threshold ? 'low' : v >= 1 ? 'high' : ''}">${fmt(v, 2)}</span>` : '–';
  let methodTable = '';
  if (city && D.wards_summary && mKeys.length) {
    const names = D.wards_summary.pop_methods || {};
    methodTable = `<div class="gap-scope"><h3>Every ward under each way of counting residents</h3>
      <div class="table-wrap"><table class="data" id="gap-methods"><thead><tr><th scope="col">Ward</th><th scope="col">Councillor</th>${mKeys.map(k => `<th scope="col" class="num ${k === popMethod() ? 'gm-cur' : ''}">Growth since ${CY()}, ${esc(mShort[k] || names[k] || BM[k].label)}</th>`).join('')}${mKeys.map(k => `<th scope="col" class="${k === popMethod() ? 'gm-cur' : ''}">Amenity level, ${esc(names[k] || BM[k].label)}<small>${withO ? allWord : 'City amenities only'}</small></th>`).join('')}</tr></thead><tbody>
      ${[...D.wards_summary.wards].sort((a, b) => ((withO ? a['amenity_level_all' + sfx] : a.amenity_level) ?? 9) - ((withO ? b['amenity_level_all' + sfx] : b.amenity_level) ?? 9)).map(r => `<tr><td>Ward ${r.ward}</td><td>${esc(r.councillor || '')}</td>${mKeys.map(k => `<td class="num ${k === popMethod() ? 'gm-cur' : ''}">${isNum((r.growth_pct_by_method || {})[k]) ? signed(r.growth_pct_by_method[k], 1, '%') : (k === popMethod() ? signed(r.growth_pct, 1, '%') : '–')}</td>`).join('')}${mKeys.map(k => `<td class="${k === popMethod() ? 'gm-cur' : ''}">${lv(((withO ? r['amenity_level_all' + sfx + '_by_method'] : r.amenity_level_by_method) || {})[k])}</td>`).join('')}</tr>`).join('')}
      <tr class="cmp-city-row"><td><b>Calgary</b></td><td></td>${mKeys.map(k => { const cg = ((D.wards_summary.city || {}).growth_pct_by_method || {})[k]; return `<td class="num ${k === popMethod() ? 'gm-cur' : ''}">${isNum(cg) ? signed(cg, 1, '%') : (k === popMethod() ? signed((D.wards_summary.city || {}).growth_pct, 1, '%') : '–')}</td>`; }).join('')}${mKeys.map(() => `<td>${lv(withO ? (D.wards_summary.city || {})['amenity_level_all' + sfx] : 1)}</td>`).join('')}</tr>
      </tbody></table></div><p class="card-note">Lowest first. 1.00 = the Calgary level of City amenities.${withO ? ' With private amenities accessible to the community added (playgrounds, parks, courts, fitness stations and dog parks that are not the City\'s, City ones taken out), measured against the same Calgary level, so Calgary itself reads above 1.00.' : ''}</p></div>`;
  } else if (mKeys.length) {
    methodTable = `<div class="gap-scope"><h3>${esc(W())} under each way of counting residents</h3>
      <div class="table-wrap"><table class="data" id="gap-methods"><thead><tr><th scope="col">Residents counted by</th><th scope="col" class="num">Residents</th><th scope="col">Amenity level of ${esc(W())}<small>${withO ? allWord : 'City amenities only'}</small></th><th scope="col" class="num">Communities not kept up (City amenities)</th></tr></thead><tbody>
      ${mKeys.map(k => `<tr${k === popMethod() ? ' class="gc-cur"' : ''}><td>${esc(BM[k].label)}${k === popMethod() ? ' <small>(in use)</small>' : ''}</td><td class="num">${fmt(BM[k].residents)}</td><td>${lv(withO ? BM[k]['level_all' + sfx] : BM[k].level)}</td><td class="num">${fmt((BM[k].flagged || []).length)}</td></tr>`).join('')}
      </tbody></table></div><p class="card-note">Calgary is 1.00 under every count. Fewer residents (the ${CY()} Census) means more amenities per resident, so fast-growing areas look better than they are; the growth model counts the people living there now.</p></div>`;
  }
  // the whole method, in plain words, with every dataset
  const method = `<details class="gap-method"><summary>How the amenity level is worked out</summary>
    <ol>${(g.method || []).map(x => `<li>${esc(x)}</li>`).join('')}</ol>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Amenity</th><th scope="col">Per</th><th scope="col">In community levels</th><th scope="col" class="num">Calgary count</th><th scope="col" class="num">Calgary per 1,000</th><th scope="col">City dataset</th></tr></thead><tbody>
    ${keys.map(k => { const c = (g.city || {})[k] || {}; return `<tr><td>${esc(kinds[k].label)}</td><td>${kinds[k].per === 'children' ? '1,000 children 0 to 14' : '1,000 residents'}</td><td>${kinds[k].local ? 'Yes' : 'Ward and city only'}</td><td class="num">${fmt(c.n, k.endsWith('_ha') ? 1 : 0)}</td><td class="num">${kd(k, c.per_1000)}</td>
      <td>${kinds[k].dataset ? `<button class="link-btn small" data-open="https://data.calgary.ca/d/${esc(kinds[k].dataset)}">${esc(kinds[k].dataset)}</button>` : ''}</td></tr>`; }).join('')}
    </tbody></table></div><p class="card-note"><button type="button" class="link-btn small" data-method="amenity_gap">Every formula the app uses</button> · Counted ${g.counted ? dmy(g.counted) : ''}; the City's asset files are read again every week. Communities and their residents: Community District Boundaries (surr-xmvs), the ${CY()} Census by community and the City's property assessment roll (the growth model).</p></details>`;

  const ost = (g.other || {}).stats || {};
  const otherSwitch = g.other ? `<div class="gap-scope gap-other-switch"><label class="check big"><input type="checkbox" id="gap-other" ${gapOther ? 'checked' : ''}>
      <span><b>Count private amenities accessible to the community</b> (source: OpenStreetMap: developer, school and other playgrounds, parks, courts, fitness stations and dog parks that are not the City's, with every one the City already lists taken out so nothing counts twice)</span></label>
      ${hasP ? `<label class="check big gap-private"><input type="checkbox" id="gap-private" ${gapPrivate ? 'checked' : ''} ${gapOther ? '' : 'disabled'}>
      <span><b>Also count gated, residents-only ones</b> (marked private in OpenStreetMap: homeowners' association and condo parks and playgrounds). Off by default.</span></label>` : ''}
      <p class="card-note">${withO ? (withP ? 'On, gated residents-only ones included: every amenity level below counts them.' : 'On: every amenity level below counts private amenities accessible to the community; gated residents-only ones are left out.') : 'Off: every amenity level below counts the City\'s own amenities only.'} Calgary-wide, accessible to the community: ${fmt((ost.playgrounds || {}).kept)} playgrounds, ${fmt((ost.basketball || {}).kept)} basketball courts, ${fmt((ost.fitness || {}).kept)} fitness stations, ${fmt((ost.off_leash || {}).kept)} dog parks and ${fmt((ost.local_park_ha || {}).kept)} parks.${hasP ? ` Gated, residents-only (only when ticked): ${fmt((ost.playgrounds || {}).private || 0)} playgrounds, ${fmt((ost.basketball || {}).private || 0)} basketball courts, ${fmt((ost.fitness || {}).private || 0)} fitness stations, ${fmt((ost.off_leash || {}).private || 0)} dog parks and ${fmt((ost.local_park_ha || {}).private || 0)} parks.` : ''} <button type="button" class="link-btn small" data-method="other_amenities">How they are found and matched</button></p></div>` : '';
  box.innerHTML = `${otherSwitch}${growthChecks()}${method}${methodTable}${scopeTable}
    <div class="gap-head"><h3>${city ? 'Every community' : 'Each community in ' + esc(W())}</h3>
      <div class="gap-ctl"><label class="field"><span>Show</span><select id="gap-kind"><option value="">Overall amenity level</option>${keys.map(k => `<option value="${k}" ${k === gapKind ? 'selected' : ''}>${esc(kinds[k].label)}</option>`).join('')}</select></label>
      <label class="check"><input type="checkbox" id="gap-flagged" ${gapFlagged ? 'checked' : ''}> Only communities that have not kept up</label></div></div>
    <div class="table-wrap tall"><table class="data" id="gap-table"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
  const sv = $('#gap-assets-save');
  if (sv) sv.addEventListener('click', async () => {
    const r = await (await api()).save_csv('Assets by ward', ['Asset', ...ws.wards.map(w => 'Ward ' + w.ward), 'Calgary'],
      keys.map(k => [kinds[k].label, ...ws.wards.map(w => (w.amenity_counts || {})[k] ?? ''), ws.amenity_counts_city[k] ?? '']));
    if (r && r.ok) sv.querySelector('span').textContent = 'Saved';
  });
  $('#gr-notes').textContent = `${g.note || ''} Counted ${g.counted ? dmy(g.counted) : ''}. Sources: City of Calgary open data: Parks Seating, Playground Equipment, Parks Sport Equipment, Parks Plumbing Fixtures, Parks Wayfinder Garbage and Recycle, Parks Off Leash Areas, Parks Sites, Public Trees, Recreation Facilities, Community Services and Calgary Transit Stops.`;
}
// is the area's growth since the Census believable? (dashboard.growth_checks: the code is the method)
function growthChecks() {
  const G = D && D.population && D.population.checks;
  if (!G || !(G.checks || []).length) return '';
  const names = { city_pace: "City's total, one rate for all", city_actual: "City's total, shared by actual growth", model: 'Growth model (homes)' };
  const cur = popMethod();
  return `<div class="gap-scope growth-checks"><h3>How much has ${esc(W())} grown since ${CY()}? Checks against independent data</h3>
    <p class="card-sub">Nobody has counted residents since the ${CY()} Census, so every figure today is an estimate. These checks use data the estimates do not rely on in the same way.</p>
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
  if (e.target.id === 'gap-kind') { gapKind = e.target.value; renderGap(); }
  if (e.target.id === 'gap-flagged') { gapFlagged = e.target.checked; renderGap(); }
  if (e.target.id === 'gap-other') { gapOther = e.target.checked; renderGap(); }
  if (e.target.id === 'gap-private') { gapPrivate = e.target.checked; renderGap(); }
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
  if (grView === 'dp' && D.development) {
    name = '' + W() + ' development permits ' + D.period;
    cols = ['Permit', 'Applied', 'Status', 'Type', 'Category', 'Address', 'Community', 'Proposed use', 'Description', 'Decision', 'Decision date'];
    rows = grRows().map(p => [p.id, p.applied, p.status, p.type, p.category, p.address, p.comm ? commName(p.comm) : '', p.use, p.what, p.decision, p.decided]);
  } else if (grView === 'am' && D.amenities) {
    name = '' + W() + ' amenities by community';
    cols = ['Community', 'Residents today', 'Playgrounds', 'Transit stops', 'Transit stops per 1,000', 'Facilities'];
    rows = residential().map(c => { const x = D.amenities.by_comm[c.code] || {}; return [c.name, c.residents, x.playgrounds, x.stops, x.stops_per_1000, D.amenities.facilities.filter(f => f.comm === c.code).map(f => f.name).join('; ')]; });
  } else if (grView === 'gap' && D.amenity_gap) {
    const g = D.amenity_gap, keys = Object.keys(g.kinds || {});
    const wardOf = {}; (D.communities || []).forEach(c => { wardOf[c.code] = c.ward; });
    name = 'Amenity gap, ' + W() + ', ' + (g.counted || '');
    cols = ['Community', 'Ward', 'Residents today', 'Growth since ' + CY() + ' (%)', 'New since ' + CY() + '', 'Children 0 to 14', 'Amenity level, City only (1.00 = city)', 'Amenity level with non-City (OpenStreetMap)', 'Not kept up with growth',
      ...keys.map(k => g.kinds[k].label + (g.kinds[k].per === 'children' ? ' per 1,000 children' : ' per 1,000 residents')),
      ...keys.map(k => g.kinds[k].label + ', against the city')];
    rows = g.by_comm.map(r => [r.name, wardOf[r.code] || '', r.residents, r.growth_pct, r.new ? 'yes' : '', r.children_0_14, r.level, r.level_all ?? '', r.flag ? 'yes' : '',
      ...keys.map(k => (r.per_1000 || {})[k]), ...keys.map(k => (r.vs_city || {})[k])]);
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
  $('#popm-chips').innerHTML = popmView === 'res'
    ? [['ward', '' + W() + ''], ...comms.map(c => [c.code, c.name])].map(([k, n], i) => `<button type="button" class="chip ${popmOn.has(k) ? 'on' : ''}" data-k="${k}" aria-pressed="${popmOn.has(k)}"><i style="background:${POP_COLORS[i % POP_COLORS.length]}"></i>${esc(n)}</button>`).join('')
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
    : `Estimate, not a count: each community's ${CY()} Census children, plus children for residents added since ${CY()} at the share seen in ${W()}'s newest communities in 2021 (${fmt(ps.new_share_0_14, 1)}% aged 0 to 14, ${fmt(ps.new_share_0_4, 1)}% under 5). No public count of children by community exists after 2021.`;
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
  $('#prof-sub').textContent = (P.partial ? 'The ' + CY() + ' Census by ward (City of Calgary open data, May ' + CY() + '): ' : 'The City of Calgary\'s ' + W() + ' profile, ' + CY() + ' Census (May ' + CY() + '): ') + W() + ' against Calgary. The latest count of who lives here' + (isNum(gr) && Math.abs(gr) >= 3 ? `; ${W()} has ${gr > 0 ? 'grown' : 'shrunk'} about ${fmt(Math.abs(gr), 0)}% since.` : '.');
  $('#prof-seg').innerHTML = [['all', 'Highlights'], ...groups.map(g => [g.key, g.title.replace(/ \(.*\)/, '')])]
    .map(([k, t]) => `<button type="button" role="radio" aria-checked="${k === profView}" data-prof="${k}">${esc(t)}</button>`).join('');
  $$('#prof-seg button').forEach(b => b.addEventListener('click', () => { profView = b.dataset.prof; renderProfile(); }));
  const val = (v, u) => !isNum(v) ? '–' : u === '%' ? fmt(v, v % 1 ? 1 : 0) + '%' : u === '$' ? '$' + fmt(v) : u === 'x' ? fmt(v, 1) : fmt(v);
  const row = it => {
    const big = isNum(it.w5) && isNum(it.cal) && it.cal > 0 && Math.abs(it.w5 / it.cal - 1) >= .25;
    const bars = it.unit === '%' && isNum(it.cal) ? `<span class="pf-bars"><i class="w" style="width:${Math.min(100, it.w5)}%"></i><i class="c" style="width:${Math.min(100, it.cal)}%"></i></span>` : '';
    return `<li class="${big ? 'hi' : ''}"><span class="pf-l">${esc(it.label)}${it.note ? `<small>${esc(it.note)}</small>` : ''}</span>
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
  { name: 'Road Construction Projects', id: 'sizs-hgef', pub: 'City of Calgary', what: 'The City\'s larger road projects, with budgets and timing.', used: 'Growth vs amenities, map',
    ask: ['What road construction is planned near ' + W() + '?'] },
  { name: 'Recreation Facilities', id: 'hxfu-6d96', pub: 'City of Calgary', what: 'Leisure centres, arenas, pools, sports fields and more.', used: 'Amenities',
    ask: ['Which recreation facilities are in or near ' + W() + '?'] },
  { name: 'Community Services', id: 'x34e-bcjz', pub: 'City of Calgary', what: 'Libraries, community centres and other City services.', used: 'Amenities',
    ask: ['List libraries and community centres in ' + W() + ''] },
  { name: 'Playground Equipment', id: 'bdu9-amk8', pub: 'City of Calgary', what: 'City playground equipment and play structures.', used: 'Amenities, map',
    ask: ['How many playgrounds does each ' + W() + ' community have?'] },
  { name: 'Calgary Transit Stops', id: 'muzh-c9qc', pub: 'City of Calgary', what: 'Active and inactive transit stops.', used: 'Amenities, map',
    ask: ['Which ' + W() + ' communities have the fewest transit stops per resident?'] },
  { name: 'Traffic Cameras', id: 'k7p9-kppz', pub: 'City of Calgary', what: 'Camera locations and their still images.', used: 'Traffic cameras, Briefing screen',
    ask: ['List the traffic cameras in ' + W() + ''] },
  { name: 'Property Assessments', id: '4bsw-nn7w', pub: 'City of Calgary', what: 'Every property on the assessment roll, with year built.', used: 'growth model (population today)',
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
  { name: 'City population outlook', id: '', page: 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/corporate-economics/calgary-and-region-economic-outlook/Calgary-and-Region-Economic-Outlook-2026-Spring.pdf', pub: 'City of Calgary (Corporate Economics)', what: 'The City\'s population estimate and forecast for Calgary (Calgary and Region Economic Outlook 2026-2031, Spring 2026, Table 4, page 19), and its forecast of children. A published report, not open data: its figures are kept with the app and updated with each new outlook.', used: 'Residents today (the default way of counting), live counter, children',
    ask: ['How is the population of Martindale worked out today?'] },
  { name: '2021 Census households by community', id: 'msjx-5ygv', pub: 'City of Calgary (Statistics Canada)', what: 'Private households by community in the 2021 Census.', used: 'Growth model (people per home)', ask: [] },
  { name: '2021 Census by ward', id: 'k4pr-cznc', pub: 'City of Calgary (Statistics Canada)', what: 'Ages, households, families and work for every ward in the 2021 Census (with jzfi-qvb4 and b5q8-82zn, and the same tables for Calgary).', used: 'Who lives in each ward',
    ask: ['How big are households in each ward?'] },
  { name: 'Parks Seating', id: 'ikeb-n5bc', pub: 'City of Calgary', what: 'Park benches and picnic tables.', used: 'Growth vs amenities, Needs attention', ask: [] },
  { name: 'Parks Sport Equipment', id: 'da6k-wpxb', pub: 'City of Calgary', what: 'Basketball hoops, sports field goal posts and disc golf baskets.', used: 'Growth vs amenities, Needs attention', ask: [] },
  { name: 'Parks Plumbing Fixtures', id: 'jjkg-kv4n', pub: 'City of Calgary', what: 'Park washrooms and drinking fountains.', used: 'Growth vs amenities', ask: [] },
  { name: 'Parks Wayfinder Garbage and Recycle', id: 'fwyk-8pth', pub: 'City of Calgary', what: 'Park garbage and recycling bins.', used: 'Growth vs amenities', ask: [] },
  { name: 'Parks Off Leash Areas', id: 'enr4-crti', pub: 'City of Calgary', what: 'Off-leash dog areas (outlines).', used: 'Growth vs amenities, Needs attention', ask: [] },
  { name: 'Parks Sites', id: 'kami-qbfh', pub: 'City of Calgary', what: 'Every City park site (outlines), for park space and neighbourhood park space.', used: 'Growth vs amenities, Needs attention', ask: [] },
  { name: 'Public Trees', id: 'tfs4-3wwa', pub: 'City of Calgary', what: 'Every tree the City maintains.', used: 'Growth vs amenities', ask: [] },
  { name: 'Community District Boundaries', id: 'surr-xmvs', pub: 'City of Calgary', what: 'Community outlines, for placing amenities and programs in a community.', used: 'Every community count', ask: [] },
  { name: 'Amenities that are not the City\'s', id: '', page: 'https://www.openstreetmap.org/copyright', pub: 'OpenStreetMap contributors (Open Database Licence)', what: 'Playgrounds, parks, basketball courts, fitness stations and dog parks mapped by volunteers, read through the Overpass API every week; every one matching a City amenity is taken out.', used: 'Growth vs amenities, Needs attention (when ticked)',
    ask: ['List the private amenities accessible to the community in Taradale with links'] },
  { name: 'Calgary Open Budget', id: 'fqax-i3nz', pub: 'City of Calgary', what: 'Every line of the City\'s operating and capital budget, by department and business unit.', used: 'City budget',
    ask: ['What is the City\'s 2026 operating budget by department?'] },
  { name: 'Budget book: operating revenue by source', id: '', page: 'https://www.calgary.ca/our-finances/budget.html', pub: 'City of Calgary', what: 'Operating revenue by source (property tax, user fees, franchise fees and so on) from the 2026 Budget as approved, Budget Overview, page 24. A published book, not open data: kept with the app and updated with each budget.', used: 'City budget', ask: [] },
  { name: '2026 Property Tax Bylaw', id: '', page: 'https://municipalaffairs.gov.ab.ca/cfml/FinancialTaxRateSearch/pdf/tr_bylaws/2026_Bylaw_CALGARY_0046.pdf', pub: 'City of Calgary (Alberta Municipal Affairs)', what: 'The 2026 tax rates and levy (Bylaw 9M2026), applied to the assessment roll (4bsw-nn7w) to estimate property tax by ward and community. A bylaw document: its rates are kept with the app.', used: 'City budget (property tax by ward)',
    ask: ['How much property tax does each ward pay?'] },
  { name: 'Missing-person appeals', id: '', page: 'https://newsroom.calgary.ca/police-news-releases/', pub: 'Calgary Police Service (City newsroom)', what: 'Missing-person news releases, read live from the City newsroom feed; nothing is saved, and an appeal disappears when the police take it down.', used: 'Dashboard', ask: [] },
];
const srcPage = d => d.page || ('https://data.calgary.ca/d/' + d.id);
const METHOD_KEY = { 'fqax-i3nz': 'budget', 'msjx-5ygv': 'population', 'k4pr-cznc': 'profile_wards', 'ikeb-n5bc': 'amenity_gap', 'da6k-wpxb': 'amenity_gap', 'jjkg-kv4n': 'amenity_gap', 'fwyk-8pth': 'amenity_gap', 'enr4-crti': 'amenity_gap', 'kami-qbfh': 'amenity_gap', 'tfs4-3wwa': 'amenity_gap', 'surr-xmvs': 'wards', 'iahh-g8bj': '311', '35ra-9556': 'traffic', 'c2es-76ed': 'permits', '6933-unw5': 'dp', 'sizs-hgef': 'roads',
  'hxfu-6d96': 'amenities', 'x34e-bcjz': 'amenities', 'bdu9-amk8': 'amenities', 'muzh-c9qc': 'amenities', 'k7p9-kppz': 'cameras',
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
  return `<details class="src-method"><summary>How the app counts it</summary>
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
      <summary><h3>${esc(m.name)}</h3><span class="card-sub">${esc(m.publisher)}${m.updated ? ' · ' + esc(m.updated) : ''}</span></summary>
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
      ${d.name === 'Community safety data' && D && D.crime && D.crime.link ? `<button type="button" class="btn src-dl" data-open="${esc(D.crime.link)}">${icon('download')}<span>Download the data file: Jan 2020 to ${esc(D.crime.latest)}</span></button><p class="card-note">"Open" goes to the police page at <b>Dashboard data download</b>; its <b>Download Community Safety Data</b> button gives this same file. Every crime number in the app can be checked in it (sheet Community Crime: filter Ward or Community, Year, Month; add up Total Crime).</p>` : ''}
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
  $('#brief-sources').innerHTML = `<span class="bs-title">Data in this app, ready to ask about, analyze or download</span>` +
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
  ['#profile-card', ['profile'], () => CY() === 2021 ? 'People in private households, 2021 ward boundaries, as of May 2021 (income: 2020). The app switches to the 2026 Census by itself when the City publishes it (expected 2027).' : `People in private households, as of May ${CY()}.`],
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
  ['[aria-labelledby="camstrip-title"]', ['cams'], () => 'The City posts a new still image about once a minute and keeps no recording; the app keeps the last 30 minutes.'],
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
    let el = host.querySelector(':scope > .src-foot');
    if (!el) { el = document.createElement('p'); el.className = 'src-foot'; host.appendChild(el); }
    try { el.innerHTML = sourceFootHtml(keys, note()); } catch (e) { el.remove(); }
  });
}
window.renderSourceNotes = renderSourceNotes;
// the community details panel is redrawn on every selection: add its source line each time
const panelEl = $('#panel');
if (panelEl) new MutationObserver(() => {
  if (!D || panelEl.querySelector(':scope > .src-foot') || !panelEl.children.length) return;
  const el = document.createElement('p'); el.className = 'src-foot';
  el.innerHTML = sourceFootHtml(['r311', 'pop', 'permits'], `311 and permits: ${periodWords()}. Residents: today's estimate.`);
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
  $('#gr-stats').innerHTML = [[fmt(T.homes_now, 0), 'homes lived in on the property roll (rental units counted separately)'], [fmt(T.units_now, 0), 'rental units (apartment buildings)'],
    [fmt(T.population), 'residents by the growth model'], [fmt(T.residents), 'residents, ' + popChip() + ' (in use)']]
    .map(([b, s]) => `<div class="istat"><b>${b}</b><span>${esc(s)}</span></div>`).join('');
  const rows = [...R.rows].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  const stepHead = { city_actual: "Step to the City's total, actual growth", city_pace: "Step to the City's total, one rate", census2021: 'Step to the ' + CY() + ' Census', model: 'Step' }[m] || 'Step';
  rcComm = rcComm && rows.some(r => r.code === rcComm) ? rcComm : '';
  box.innerHTML = `<div class="gap-scope"><h3>${esc(W())}: from homes to residents</h3>
    <p class="card-sub">Read across each row: homes and rental units on the City's property roll, times people per home or per unit, give the growth model's residents; the last columns take it to the way of counting chosen in Settings (${esc(popWords())}). Choose a community to list every property behind its figure.</p>
    <div class="table-wrap tall"><table class="data rc-table"><thead><tr><th scope="col">Community</th><th scope="col" class="num">${CY()} Census residents</th><th scope="col" class="num">${CY()} households</th>
      <th scope="col" class="num">Homes on Census day</th><th scope="col" class="num">Homes today</th><th scope="col" class="num">People per home</th><th scope="col" class="num">People in homes</th>
      <th scope="col" class="num">Rental units today</th><th scope="col" class="num">People per unit</th><th scope="col" class="num">People in rental units</th>
      <th scope="col" class="num">Growth model</th><th scope="col">${esc(stepHead)}</th><th scope="col" class="num">Residents (in use)</th><th scope="col">How the model counted it</th></tr></thead><tbody>
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
  $$('.rc-pick', box).forEach(b => b.addEventListener('click', () => { rcComm = b.dataset.c; rcProps = null; renderRecon(); loadProps(); }));
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
  const rentRolls = new Set(R.rentals.filter(x => x.comm === rcComm).map(x => String(x.roll)));
  const k = row.method === 'household size' ? null : row.people_per_home;
  return rcProps.rows.map(p => {
    const yr = p.year_of_construction ? Math.round(+p.year_of_construction) : null;
    const rental = rentRolls.has(String(p.roll_number));
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
  el.innerHTML = `<div class="gap-assets-head"><h3>Every property in ${esc(titleCase(row.name))}</h3>
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
      ${rent.map(x => `<tr class="rc-rent"><td>Roll ${esc(x.roll)}</td><td>Rental apartment building</td><td class="num">${x.year_of_construction || '–'}</td><td></td><td class="num">${fmt(x.units)} units</td><td class="num">${hs ? '–' : fmt(x.units * row.people_per_unit, 1)}</td><td class="wrap">${x.source === 'permit' ? 'Units from its building permit' : x.source === 'estimated' ? 'Units estimated from assessed value' + (row.estimate_scale < 1 ? ` (scaled x ${fmt(row.estimate_scale, 3)})` : '') : 'Units by year built'}</td></tr>`).join('')}
    </tbody></table></div>${P.length > 600 ? `<p class="card-note">The first 600 homes are shown; "Save every property" has all ${fmt(P.length)}.</p>` : ''}`;
  $('#rc-save').addEventListener('click', async () => {
    const r = await (await api()).save_csv(`Population build-up, ${titleCase(row.name)}`, ['Roll number', 'Address', 'Kind', 'Use code', 'Year built', 'Assessed value', 'Share lived in', 'People per home', 'People', 'Note'],
      [...P.map(p => [p.roll, p.address, p.type, p.code, p.year, p.value, Math.round(p.share * 1e4) / 1e4, row.people_per_home, isNum(p.people) ? Math.round(p.people * 1e4) / 1e4 : '', p.note]),
       ...rent.map(x => [x.roll, '', 'Rental apartment building', x.code, x.year_of_construction, '', '', row.people_per_unit, Math.round(x.units * row.people_per_unit * 100) / 100, `${x.units} units (${x.source})`]),
       ['', '', 'Growth model total', '', '', '', '', '', row.population, row.how], ['', '', 'Residents in use', '', '', '', '', '', row.residents, row.step]]);
    if (r && r.ok) $('#rc-save span').textContent = 'Saved';
  });
}

window.renderGrowth = renderGrowth;


// ================================================================ REPORTS (Data Genie and Data Scientist)
function reportCard(ev) {
  const card = document.createElement('div'); card.className = 'card file report';
  const pdf = ev.pdf || (/\.pdf$/i.test(ev.path || '') ? ev.path : null);
  const bits = [pdf ? 'PDF' : null, ev.interactive ? 'interactive version' : null, ev.xlsx ? 'Excel workbook' : null].filter(Boolean);
  card.innerHTML = `${icon('news')}<div><div class="file-name">${esc(ev.title || ev.name || 'Report')}</div><div class="file-sub">${esc(bits.join(', '))}${ev.visuals ? `, ${fmt(ev.visuals)} chart${ev.visuals === 1 ? '' : 's'}, maps and tables` : ''}. Saved in Files.${ev.warning ? ' ' + esc(ev.warning) : ''}</div></div>
    <div class="file-actions">${pdf ? `<button class="btn primary" data-p="${esc(pdf)}">${icon('file')}<span>PDF</span></button>` : ev.interactive ? `<button class="btn primary" data-p="${esc(ev.interactive)}#print">${icon('file')}<span>PDF</span></button>` : ''}${ev.interactive ? `<button class="btn" data-p="${esc(ev.interactive)}">${icon('open')}<span>Interactive</span></button>` : ''}${ev.xlsx ? `<button class="btn" data-p="${esc(ev.xlsx)}">${icon('download')}<span>Excel</span></button>` : ''}</div>`;
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
      <div class="file-actions">${r.pdf ? `<button class="btn primary" data-p="${esc(r.pdf)}">${icon('file')}<span>PDF</span></button>` : r.interactive ? `<button class="btn primary" data-p="${esc(r.interactive)}#print">${icon('file')}<span>PDF</span></button>` : ''}${r.interactive ? `<button class="btn" data-p="${esc(r.interactive)}">${icon('open')}<span>Interactive</span></button>` : ''}${r.xlsx ? `<button class="btn" data-p="${esc(r.xlsx)}">${icon('download')}<span>Excel</span></button>` : ''}</div></div>`).join('')}</div>`;
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
  $('#ds-run-sub').textContent = 'Working on it. This usually takes 3 to 8 minutes; you can use the rest of the app meanwhile.';
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
