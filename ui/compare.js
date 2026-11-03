/* Calgary Data Desk: compare wards. Every ward side by side, from the whole-city figures for the same period. */
'use strict';

// Each measure: where it is in a ward's row, how to show it, and which way is better (null: neither).
const CMP_METRICS = [
  { g: 'People and growth', k: 'residents', label: 'Residents today', d: 0, better: null },
  { g: 'People and growth', k: 'growth_pct', label: 'Growth since the ' + CY() + ' Census', d: 1, unit: '%', better: null },
  { g: 'People and growth', k: 'children_0_14', label: 'Children aged 0 to 14 (estimate)', d: 0, better: null },
  { g: '311', k: 'requests_per_1000', label: '311 requests per 1,000 residents a year', d: 0, better: null },
  { g: '311', k: 'infra_per_1000', label: 'Infrastructure reports per 1,000 residents a year', d: 1, better: null },
  { g: '311', k: 'open_per_1000', label: 'Open requests per 1,000 residents', d: 1, better: 'low' },
  { g: '311', k: 'closed_7_days_pct', label: 'Requests closed within 7 days', d: 1, unit: '%', better: 'high' },
  { g: '311', k: 'app_share_pct', label: 'Requests made through the 311 app', d: 1, unit: '%', better: null },
  { g: 'Safety', k: 'crime_per_1000', label: 'Crimes per 1,000 residents a year', d: 1, better: 'low' },
  { g: 'Safety', k: 'crime_change_pct', label: 'Change in crime from a year earlier', d: 1, unit: '%', signed: true, better: 'low' },
  { g: 'Safety', k: 'violent_change_pct', label: 'Change in violent crime', d: 1, unit: '%', signed: true, better: 'low' },
  { g: 'Traffic', k: 'traffic12', label: 'Traffic incidents reported', d: 0, better: null },
  { g: 'Traffic', k: 'traffic_per_1000', label: 'Traffic incidents per 1,000 residents a year', d: 1, better: 'low' },
  { g: 'Building', k: 'new_homes12', label: 'New homes in building permit applications', d: 0, better: null },
  { g: 'Building', k: 'dev_permits12', label: 'Development permit applications', d: 0, better: null },
  { g: 'Families', k: 'child_care_per_100_kids', label: 'Licensed child care spaces per 100 children (0 to 14)', d: 1, better: 'high' },
  { g: 'Families', k: 'daycare_per_100_0_4', label: 'Daycare and preschool spaces per 100 children under 5', d: 1, better: 'high' },
  { g: 'Families', k: 'schools', label: 'Schools', d: 0, better: null },
  { g: 'Families', k: 'students', label: 'Students enrolled', d: 0, better: null },
  { g: 'Amenities', k: 'alm:model', label: 'Amenity level, residents by the growth model (1.00 = Calgary)', d: 2, better: 'high' },
  { g: 'Amenities', k: 'alm:census2021', label: 'Amenity level, residents by the ' + CY() + ' Census', d: 2, better: 'high' },
  { g: 'Amenities', k: 'alm:city_pace', label: "Amenity level, residents grown to the City's total", d: 2, better: 'high' },
];
const CMP_AMENITY = ['playgrounds', 'local_park_ha', 'benches', 'picnic_tables', 'basketball', 'goal_posts', 'washrooms',
  'off_leash', 'trees', 'rec_facilities', 'libraries', 'community_centres', 'transit_stops'];

let CMP = { data: null, geo: null, forPeriod: undefined, main: null, others: new Set(), picked: false, metric: 'alm:model', map: null, layer: null, loading: null };
try {
  const saved = JSON.parse(localStorage.getItem('cdd-compare') || 'null');
  if (saved) { CMP.main = saved.main; CMP.others = new Set((saved.others || []).filter(w => w >= 1 && w <= 14)); CMP.picked = !!saved.picked; CMP.metric = saved.metric === 'amenity_level' ? 'alm:model' : (saved.metric || CMP.metric); }
} catch { /* storage off */ }
const cmpSave = () => { try { localStorage.setItem('cdd-compare', JSON.stringify({ main: CMP.main, others: [...CMP.others], picked: CMP.picked, metric: CMP.metric })); } catch { /* storage off */ } };

function cmpMetrics() {
  const ws = (CMP.data || {}).wards_summary || {};
  const kinds = ws.amenity_kinds || {};
  const am = CMP_AMENITY.filter(k => kinds[k]).map(k => ({
    g: 'Amenities', k: 'am:' + k, d: k === 'trees' ? 0 : 2, better: 'high',
    label: kinds[k].per === 'children' ? `${kinds[k].label} per 1,000 children` : `${kinds[k].label} per 1,000 residents`,
  }));
  return [...CMP_METRICS, ...am];
}
const cmpVal = (row, k) => !row ? null : k.startsWith('am:') ? ((row.amenities || {})[k.slice(3)] ?? null)
  : k.startsWith('alm:') ? ((row.amenity_level_by_method || {})[k.slice(4)] ?? (k === 'alm:model' ? row.amenity_level ?? null : null)) : (row[k] ?? null);
const cmpCity = k => { const ws = CMP.data.wards_summary; if (k.startsWith('alm:')) return 1; return k.startsWith('am:') ? (ws.amenities_city || {})[k.slice(3)] ?? null : ws.city[k] ?? null; };
const cmpFmt = (m, v) => !isNum(v) ? '–' : m.signed ? signed(v, m.d, m.unit || '') : fmt(v, m.d) + (m.unit || '');
const ord = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');

function cmpRank(m, ward) {
  const rows = CMP.data.wards_summary.wards.filter(r => isNum(cmpVal(r, m.k)));
  const dir = m.better === 'low' ? 1 : -1;                          // rank 1: best, or highest when neither is better
  rows.sort((a, b) => dir * (cmpVal(a, m.k) - cmpVal(b, m.k)));
  const i = rows.findIndex(r => r.ward === ward);
  return i < 0 ? null : { n: i + 1, of: rows.length };
}

async function loadCompare(force = false) {
  if (CMP.loading) return CMP.loading;           // one load at a time; callers wait for the one running
  $('#cmp-loading').hidden = !!CMP.data && !force;
  $('#cmp-error').hidden = true;
  const want = JSON.stringify(period);
  CMP.loading = (async () => {
    try {
      const res = await (await api()).compare_wards(force, period);
      if (!res.ok) throw new Error(res.error);
      CMP.data = res.data; CMP.geo = res.wards_geo; CMP.forPeriod = want;
    } catch (e) {
      $('#cmp-error').textContent = `The comparison could not be loaded: ${e.message || e}`;
      $('#cmp-error').hidden = false;
    } finally {
      CMP.loading = null;
      $('#cmp-loading').hidden = true;
    }
  })();
  return CMP.loading;
}

async function renderCompare() {
  if (!CMP.data || CMP.forPeriod !== JSON.stringify(period)) {
    await loadCompare();
    if (CMP.data && CMP.forPeriod !== JSON.stringify(period)) await loadCompare();   // the period changed while loading
  }
  if (!CMP.data || !CMP.data.wards_summary) return;
  const ws = CMP.data.wards_summary;
  if (!CMP.main) CMP.main = SCOPE || 5;
  if (!CMP.others.size && !CMP.picked) [...ws.wards].sort((a, b) => (b.residents || 0) - (a.residents || 0)).slice(0, 3)
    .forEach(r => { if (r.ward !== CMP.main) CMP.others.add(r.ward); });
  CMP.others.delete(CMP.main);
  const name = w => { const r = ws.wards.find(x => x.ward === w); return `Ward ${w}${r && r.councillor ? ' · ' + r.councillor : ''}`; };
  $('#cmp-sub').textContent = `${CMP.data.period} against ${CMP.data.prev_period}. All 14 wards from the same City data, with Calgary as a whole.`;
  $('#cmp-main').innerHTML = ws.wards.map(r => `<button type="button" role="radio" aria-checked="${r.ward === CMP.main}" class="chip ${r.ward === CMP.main ? 'on' : ''}" data-w="${r.ward}" title="${esc(name(r.ward))}"><i style="background:var(--accent)"></i>Ward ${r.ward}</button>`).join('');
  $('#cmp-others').innerHTML = ws.wards.filter(r => r.ward !== CMP.main).map(r => `<button type="button" aria-pressed="${CMP.others.has(r.ward)}" class="chip ${CMP.others.has(r.ward) ? 'on' : ''}" data-w="${r.ward}" title="${esc(name(r.ward))}"><i style="background:var(--fg-2)"></i>Ward ${r.ward}</button>`).join('');
  renderCmpTable();
  renderCmpRank();
  renderCmpMap();
}

function renderCmpTable() {
  const ws = CMP.data.wards_summary;
  const cols = [CMP.main, ...[...CMP.others].sort((a, b) => a - b)];
  const row = w => ws.wards.find(r => r.ward === w);
  $('#cmp-table thead').innerHTML = `<tr><th scope="col">Measure</th>${cols.map((w, i) => `<th scope="col" class="num ${i ? '' : 'cmp-main'}">Ward ${w}<small>${esc((row(w) || {}).councillor || '')}</small></th>`).join('')}<th scope="col" class="num cmp-city">Calgary</th></tr>`;
  let group = '';
  $('#cmp-table tbody').innerHTML = cmpMetrics().map(m => {
    const head = m.g !== group ? `<tr class="cmp-group"><th colspan="${cols.length + 2}" scope="rowgroup">${esc(m.g)}</th></tr>` : '';
    group = m.g;
    const city = cmpCity(m.k);
    const cells = cols.map((w, i) => {
      const v = cmpVal(row(w), m.k);
      const rk = cmpRank(m, w);
      let cls = '';
      if (m.better && isNum(v) && isNum(city) && city !== 0 && Math.abs(v / city - 1) >= .1) cls = ((v > city) === (m.better === 'high')) ? 'good' : 'bad';
      const rank = rk ? `<small class="cmp-rank">${m.better ? (rk.n === 1 ? 'best' : rk.n === rk.of ? 'last' : ord(rk.n)) : (rk.n === 1 ? 'highest' : rk.n === rk.of ? 'lowest' : ord(rk.n) + ' highest')} of ${rk.of}</small>` : '';
      return `<td class="num ${i ? '' : 'cmp-main'} ${cls}">${cmpFmt(m, v)}${rank}</td>`;
    }).join('');
    return `${head}<tr data-k="${m.k}" class="${m.k === CMP.metric ? 'is-sel' : ''}"><th scope="row"><button type="button" class="link-btn cmp-m" data-k="${m.k}">${esc(m.label)}</button></th>${cells}<td class="num cmp-city">${cmpFmt(m, city)}</td></tr>`;
  }).join('');
  $('#cmp-table-sub').innerHTML = `Ward ${CMP.main} first, then the wards you chose. Green: better than Calgary by 10% or more; red: worse. Choose a measure to rank every ward. <button type="button" class="link-btn small" data-method="compare">How each measure is worked out</button>`;
  $('#cmp-note').textContent = `${ws.note || ''} Crime: ${ws.crime_period || 'the latest months published'}. Amenities: City assets in open data per 1,000 residents (playgrounds per 1,000 children); the amenity level averages them against the city.`;
}

function renderCmpRank() {
  const ws = CMP.data.wards_summary;
  const ms = cmpMetrics();
  const m = ms.find(x => x.k === CMP.metric) || ms[0];
  CMP.metric = m.k;
  $('#cmp-metric').innerHTML = ms.map(x => `<option value="${x.k}" ${x.k === m.k ? 'selected' : ''}>${esc(x.label)}</option>`).join('');
  const rows = ws.wards.filter(r => isNum(cmpVal(r, m.k))).sort((a, b) => (m.better === 'low' ? 1 : -1) * (cmpVal(a, m.k) - cmpVal(b, m.k)));
  const vals = rows.map(r => cmpVal(r, m.k));
  const city = cmpCity(m.k);
  const lo = Math.min(0, ...vals, isNum(city) ? city : 0), hi = Math.max(0, ...vals, isNum(city) ? city : 0) || 1;
  const pos = v => (v - lo) / (hi - lo) * 100;
  $('#cmp-rank-title').textContent = m.label;
  $('#cmp-rank-sub').textContent = m.better ? `Best first. The line is Calgary as a whole (${cmpFmt(m, city)}).` : `Highest first. The line is Calgary as a whole (${cmpFmt(m, city)}).`;
  $('#cmp-bars').innerHTML = rows.map((r, i) => {
    const v = cmpVal(r, m.k);
    const cls = r.ward === CMP.main ? 'main' : CMP.others.has(r.ward) ? 'other' : '';
    const a = pos(Math.min(0, v)), b = pos(Math.max(0, v));
    return `<div class="cmp-bar ${cls}"><span class="cmp-bar-n">${i + 1}</span><span class="cmp-bar-l">Ward ${r.ward}</span>
      <span class="cmp-bar-t"><span class="cmp-bar-f" style="left:${a}%;width:${Math.max(.5, b - a)}%"></span>${isNum(city) ? `<span class="cmp-bar-c" style="left:${pos(city)}%"></span>` : ''}</span>
      <span class="cmp-bar-v">${cmpFmt(m, v)}</span></div>`;
  }).join('') || '<p class="card-sub">No figures for this measure.</p>';
}

function renderCmpMap() {
  if (!CMP.geo || typeof L === 'undefined') return;
  const ms = cmpMetrics();
  const m = ms.find(x => x.k === CMP.metric) || ms[0];
  if (!CMP.map) {
    CMP.map = L.map('cmp-map', { zoomControl: false, attributionControl: true, scrollWheelZoom: false, zoomSnap: .25 });
    L.tileLayer(TILES[isDark() ? 'dark' : 'light'], { maxZoom: 18, attribution: 'Esri' }).addTo(CMP.map);
  }
  if (CMP.layer) CMP.layer.remove();
  const ws = CMP.data.wards_summary;
  const vals = ws.wards.map(r => cmpVal(r, m.k)).filter(isNum);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const ramp = RAMPS.seq[isDark() ? 'dark' : 'light'];
  const colour = v => {
    if (!isNum(v)) return cssv('--muted');
    let t = hi === lo ? .5 : (v - lo) / (hi - lo);
    if (m.better === 'low') t = 1 - t;                     // darker is always better where one way is better
    return ramp[Math.min(ramp.length - 1, Math.floor(t * ramp.length))];
  };
  const feats = Object.entries(CMP.geo).map(([w, g]) => ({ type: 'Feature', properties: { ward: +w }, geometry: g }));
  CMP.layer = L.geoJSON({ type: 'FeatureCollection', features: feats }, {
    style: f => {
      const w = f.properties.ward, r = ws.wards.find(x => x.ward === w);
      const main = w === CMP.main, other = CMP.others.has(w);
      return { fillColor: colour(cmpVal(r, m.k)), fillOpacity: .78, color: main ? cssv('--accent') : other ? cssv('--fg') : cssv('--card'),
        weight: main ? 4 : other ? 2.5 : 1 };
    },
    onEachFeature: (f, lay) => {
      const r = ws.wards.find(x => x.ward === f.properties.ward);
      lay.bindTooltip(`<b>Ward ${f.properties.ward}</b>${r && r.councillor ? ' · ' + esc(r.councillor) : ''}<br>${esc(m.label)}: ${cmpFmt(m, cmpVal(r, m.k))}`, { sticky: true });
      lay.on('click', () => { toggleOther(f.properties.ward); });
    },
  }).addTo(CMP.map);
  setTimeout(() => { CMP.map.invalidateSize(); CMP.map.fitBounds(CMP.layer.getBounds(), { padding: [8, 8] }); }, 30);
  $('#cmp-map-sub').textContent = `${m.label}. ${m.better ? 'Darker is better.' : 'Darker is higher.'} Ward ${CMP.main} is outlined in blue; click a ward to add it.`;
  $('#cmp-legend').innerHTML = isNum(lo) ? `<span>${cmpFmt(m, m.better === 'low' ? hi : lo)}</span>${ramp.map(c => `<i style="background:${c}"></i>`).join('')}<span>${cmpFmt(m, m.better === 'low' ? lo : hi)}</span>` : '';
}

function toggleOther(w) {
  if (w === CMP.main) return;
  CMP.others.has(w) ? CMP.others.delete(w) : CMP.others.add(w);
  CMP.picked = true;
  cmpSave(); renderCompare();
}
document.addEventListener('click', e => {
  const a = e.target.closest('#cmp-main [data-w]');
  if (a) { CMP.main = +a.dataset.w; CMP.others.delete(CMP.main); cmpSave(); renderCompare(); return; }
  const b = e.target.closest('#cmp-others [data-w]');
  if (b) { toggleOther(+b.dataset.w); return; }
  const m = e.target.closest('.cmp-m');
  if (m) { CMP.metric = m.dataset.k; cmpSave(); renderCmpTable(); renderCmpRank(); renderCmpMap(); }
});
$('#cmp-all').addEventListener('click', () => { if (!CMP.data) return; CMP.picked = true; CMP.data.wards_summary.wards.forEach(r => { if (r.ward !== CMP.main) CMP.others.add(r.ward); }); cmpSave(); renderCompare(); });
$('#cmp-none').addEventListener('click', () => { CMP.others.clear(); CMP.picked = true; cmpSave(); if (CMP.data) renderCompare(); });
$('#cmp-metric').addEventListener('change', e => { CMP.metric = e.target.value; cmpSave(); renderCmpTable(); renderCmpRank(); renderCmpMap(); });
$('#cmp-export').addEventListener('click', async () => {
  if (!CMP.data) return;
  const ws = CMP.data.wards_summary;
  const ms = cmpMetrics();
  const cols = ['Measure', ...ws.wards.map(r => `Ward ${r.ward}`), 'Calgary'];
  const rows = ms.map(m => [m.label, ...ws.wards.map(r => cmpVal(r, m.k)), cmpCity(m.k)]);
  try {
    const res = await (await api()).save_csv(`Wards compared ${CMP.data.period}`, cols, rows.map(r => r.map(v => v === null || v === undefined ? '' : v)));
    if (res && res.ok === false) throw new Error(res.error);
    $('#cmp-error').hidden = true;
  } catch (e) { $('#cmp-error').textContent = `Could not save: ${e.message || e}`; $('#cmp-error').hidden = false; }
});
window.renderCompare = renderCompare;
