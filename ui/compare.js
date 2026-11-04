/* Calgary Data Desk: compare wards. Every ward side by side, from the whole-city figures for the same period. */
'use strict';

// Each measure: where it is in a ward's row, how to show it, and which way is better (null: neither).
const CMP_METRICS = [
  { g: 'People and growth', k: 'residents', get label() { return popMethod() === 'census2021' ? 'Residents (' + CY() + ' Census count)' : 'Residents today'; }, d: 0, better: null },
  { g: 'People and growth', k: 'growth_pct', get label() { return ['city_pace', 'city_actual'].includes(popMethod()) ? 'Above the ' + CY() + ' Census count (includes people the Census count left out)' : 'Growth since the ' + CY() + ' Census'; }, d: 1, unit: '%', better: null },
  { g: 'People and growth', k: 'children_0_14', label: 'Children aged 0 to 14 (estimate)', d: 0, better: null },
  { g: '311', k: 'requests_per_1000', label: '311 requests per 1,000 residents a year', d: 0, better: null },
  { g: '311', k: 'infra_per_1000', label: 'Infrastructure reports per 1,000 residents a year', d: 1, better: null },
  // 311 counts are not scored better or worse: fewer reports can mean problems are not being reported (the 311 study)
  { g: '311', k: 'open_per_1000', label: 'Open requests per 1,000 residents', d: 1, better: null },
  { g: '311', k: 'closed_7_days_pct', label: 'Requests closed within 7 days', d: 1, unit: '%', better: 'high' },
  { g: '311', k: 'app_share_pct', label: 'Requests made through the 311 app', d: 1, unit: '%', better: null },
  { g: 'Safety', k: 'crime_per_1000', label: 'Crimes per 1,000 residents a year', d: 1, better: 'low' },
  { g: 'Safety', k: 'crime_change_pct', label: 'Change in crime from a year earlier', d: 1, unit: '%', signed: true, better: 'low' },
  { g: 'Safety', k: 'violent_change_pct', label: 'Change in violent crime', d: 1, unit: '%', signed: true, better: 'low' },
  { g: 'Traffic', k: 'traffic12', label: 'Traffic incidents reported', d: 0, better: null },
  { g: 'Traffic', k: 'traffic_per_1000', label: 'Traffic incidents per 1,000 residents a year', d: 1, better: 'low' },
  { g: 'Homes', k: 'homes_now', label: 'Homes lived in today (City property roll)', d: 0, better: null },
  { g: 'Homes', k: 'homes_census', get label() { return 'Homes lived in at the ' + CY() + ' Census (same count)'; }, d: 0, better: null },
  { g: 'Homes', k: 'households_2021', get label() { return 'Households counted by the ' + CY() + ' Census (check)'; }, d: 0, better: null },
  { g: 'Homes', k: 'homes_growth_pct', get label() { return 'Growth in homes since the ' + CY() + ' Census'; }, d: 1, unit: '%', better: null },
  { g: 'Homes', k: 'people_per_home', get label() { return 'Residents per home (' + popChip() + ')'; }, d: 2, better: null },
  { g: 'Building', k: 'new_homes12', label: 'New homes in building permit applications', d: 0, better: null },
  { g: 'Building', k: 'dev_permits12', label: 'Development permit applications', d: 0, better: null },
  { g: 'Families', k: 'child_care_per_100_kids', label: 'Licensed child care spaces per 100 children (0 to 14)', d: 1, better: 'high' },
  { g: 'Families', k: 'daycare_per_100_0_4', label: 'Daycare and preschool spaces per 100 children under 5', d: 1, better: 'high' },
  { g: 'Families', k: 'schools', label: 'Schools', d: 0, better: null },
  { g: 'Families', k: 'students', label: 'Students enrolled', d: 0, better: null },
  { g: 'Amenities', k: 'amenity_level', get label() { return 'Amenity level, City amenities only, residents: ' + popChip() + ' (1.00 = Calgary)'; }, d: 2, better: 'high' },
  { g: 'Amenities', k: 'amenity_level_all', get label() { return "Amenity level, City and non-City amenities (OpenStreetMap), residents: " + popChip() + ' (1.00 = Calgary\'s City level)'; }, d: 2, better: 'high' },
  { g: 'Amenities', k: 'alm:city_pace', label: "Amenity level, City's total, one rate for all (1.00 = Calgary)", d: 2, better: 'high' },
  { g: 'Amenities', k: 'alm:city_actual', label: "Amenity level, City's total shared by actual growth (1.00 = Calgary)", d: 2, better: 'high' },
  { g: 'Amenities', k: 'alm:model', label: 'Amenity level, residents by the growth model', d: 2, better: 'high' },
  { g: 'Amenities', k: 'alm:census2021', label: 'Amenity level, residents by the ' + CY() + ' Census', d: 2, better: 'high' },
];
const CMP_AMENITY = ['playgrounds', 'local_park_ha', 'benches', 'picnic_tables', 'basketball', 'goal_posts', 'washrooms',
  'off_leash', 'trees', 'rec_facilities', 'libraries', 'community_centres', 'transit_stops'];

let CMP = { data: null, geo: null, forPeriod: undefined, main: null, others: new Set(), picked: false, metric: 'alm:city_actual', map: null, layer: null, loading: null };
try {
  const saved = JSON.parse(localStorage.getItem('cdd-compare') || 'null');
  if (saved) { CMP.main = saved.main; CMP.others = new Set((saved.others || []).filter(w => w >= 1 && w <= 14)); CMP.picked = !!saved.picked; CMP.metric = saved.metric || CMP.metric; }
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
const cmpCity = k => { const ws = CMP.data.wards_summary; if (k.startsWith('alm:') || k === 'amenity_level') return 1; return k.startsWith('am:') ? (ws.amenities_city || {})[k.slice(3)] ?? null : ws.city[k] ?? null; };
const cmpFmt = (m, v) => !isNum(v) ? '–' : m.signed ? signed(v, m.d, m.unit || '') : fmt(v, m.d) + (m.unit || '');
const ord = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');

function cmpRank(m, ward) {
  const rows = CMP.data.wards_summary.wards.filter(r => isNum(cmpVal(r, m.k)));
  const dir = m.better === 'low' ? 1 : -1;                          // rank 1: best, or highest when neither is better
  rows.sort((a, b) => dir * (cmpVal(a, m.k) - cmpVal(b, m.k)));
  const i = rows.findIndex(r => r.ward === ward);
  return i < 0 ? null : { n: i + 1, of: rows.length };
}

// the comparison belongs to a period and a way of counting residents: either changing means loading it again
const cmpKey = () => JSON.stringify([period || null, popMethod()]);

async function loadCompare(force = false) {
  if (CMP.loading) return CMP.loading;           // one load at a time; callers wait for the one running
  $('#cmp-loading').hidden = !!CMP.data && !force;
  $('#cmp-error').hidden = true;
  const want = cmpKey();
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
  if (!CMP.data || CMP.forPeriod !== cmpKey()) {
    await loadCompare();
    if (CMP.data && CMP.forPeriod !== cmpKey()) await loadCompare();   // the period changed while loading
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

// the ward in focus against Calgary: points for percentages, share of Calgary for counts, difference for rates
const CMP_COUNTS = new Set(['homes_now', 'homes_census', 'households_2021', 'residents', 'children_0_14', 'traffic12', 'new_homes12', 'dev_permits12', 'schools', 'students']);
function cmpVsCity(m, v, city) {
  if (!isNum(v) || !isNum(city) || city === 0) return { text: '–', cls: '' };
  if (CMP_COUNTS.has(m.k)) return { text: fmt(v / city * 100, 1) + '% of Calgary', cls: '' };
  const diff = m.unit === '%' ? v - city : (v / city - 1) * 100;
  const side = Math.abs(diff) < (m.unit === '%' ? 0.05 : 0.5) ? 'same as Calgary' : (diff > 0 ? 'above Calgary' : 'below Calgary');
  const text = side === 'same as Calgary' ? side : m.unit === '%' ? `${fmt(Math.abs(diff), 1)} pts ${side}` : `${fmt(Math.abs(diff), 0)}% ${side}`;
  let cls = '';
  if (m.better && Math.abs(m.unit === '%' ? diff / Math.abs(city || 1) : diff / 100) >= .1) cls = ((diff > 0) === (m.better === 'high')) ? 'good' : 'bad';
  return { text, cls };
}

function renderCmpTable() {
  const ws = CMP.data.wards_summary;
  const others = [...CMP.others].sort((a, b) => a - b);
  const row = w => ws.wards.find(r => r.ward === w);
  const cellFor = (m, w, main, city) => {
    const v = cmpVal(row(w), m.k);
    const rk = cmpRank(m, w);
    let cls = '';
    if (m.better && isNum(v) && isNum(city) && city !== 0 && Math.abs(v / city - 1) >= .1) cls = ((v > city) === (m.better === 'high')) ? 'good' : 'bad';
    // its place among the wards (not against Calgary), in plain order: "2nd lowest of 14 wards", never best or worst
    const hi = rk ? (m.better === 'low' ? rk.of - rk.n + 1 : rk.n) : 0;           // 1 = the highest value
    const rank = rk ? `<small class="cmp-rank" title="Place among the ${rk.of} wards, by value">${hi === 1 ? 'highest' : hi === rk.of ? 'lowest' : hi <= rk.of / 2 ? ord(hi) + ' highest' : ord(rk.of - hi + 1) + ' lowest'} of ${rk.of} wards</small>` : '';
    return `<td class="num ${main ? 'cmp-main' : ''} ${cls}">${cmpFmt(m, v)}${rank}</td>`;
  };
  $('#cmp-table thead').innerHTML = `<tr><th scope="col">Measure</th><th scope="col" class="num cmp-main">Ward ${CMP.main}<small>${esc((row(CMP.main) || {}).councillor || '')}</small></th>`
    + `<th scope="col" class="num cmp-vs">Ward ${CMP.main} against Calgary<small>difference from Calgary's figure</small></th><th scope="col" class="num cmp-city">Calgary<small>all 14 wards added together</small></th>`
    + others.map(w => `<th scope="col" class="num">Ward ${w}<small>${esc((row(w) || {}).councillor || '')}</small></th>`).join('') + '</tr>';
  let group = '';
  $('#cmp-table tbody').innerHTML = cmpMetrics().map(m => {
    const head = m.g !== group ? `<tr class="cmp-group"><th colspan="${others.length + 4}" scope="rowgroup">${esc(m.g)}</th></tr>` : '';
    group = m.g;
    const city = cmpCity(m.k);
    const vs = cmpVsCity(m, cmpVal(row(CMP.main), m.k), city);
    return `${head}<tr data-k="${m.k}" class="${m.k === CMP.metric ? 'is-sel' : ''}"><th scope="row"><button type="button" class="link-btn cmp-m" data-k="${m.k}">${esc(m.label)}</button></th>`
      + cellFor(m, CMP.main, true, city) + `<td class="num cmp-vs ${vs.cls}">${vs.text}</td><td class="num cmp-city">${cmpFmt(m, city)}</td>`
      + others.map(w => cellFor(m, w, false, city)).join('') + '</tr>';
  }).join('');
  $('#cmp-table-sub').innerHTML = `Two different comparisons. <b>Under each ward's figure: its place among the 14 wards</b> (for example "2nd lowest of 14 wards": a place, not a judgment; fewer 311 reports can mean problems are not being reported). <b>"Against Calgary": how far it is from Calgary's own figure</b>, which is all 14 wards added together: every request and every resident in the city, so a big ward counts for more than a small one. A ward can be 2nd lowest of 14 and 32% below Calgary at the same time: they measure different things. Green or red only where higher or lower is clearly better (crime, traffic incidents, requests closed within 7 days, amenities), and only when 10% or more from Calgary. Choose a measure to rank every ward. <button type="button" class="link-btn small" data-method="compare">How each measure is worked out</button>`;
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
