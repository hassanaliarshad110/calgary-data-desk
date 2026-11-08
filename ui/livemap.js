// Live map: Calgary News stories where they happened, live traffic incidents, the newest 311 requests and police-reported
// crime by community, on one map. Traffic and 311 are read straight from the City's open data in the browser and read
// again every few minutes while the page is open; the news comes from the published editions (citynews.js).
const LM = { map: null, groups: {}, on: { news: true, traffic: true, r311: false, crime: true }, newsDays: 7, safetyOnly: false,
  traffic: null, r311: null, city: null, read: {}, timer: null, tick: null, err: {} };
try { Object.assign(LM.on, JSON.parse(localStorage.getItem('lm-on') || '{}')); } catch { /* storage off */ }
const LM_CITY = 'https://data.calgary.ca/resource/';
const LM_RAMP = { light: ['#FEF3C7', '#FCD34D', '#F59E0B', '#D97706', '#92400E'], dark: ['#3B2A0B', '#6B4510', '#A16207', '#D97706', '#FCD34D'] };
const lmDark = () => (typeof isDark === 'function' ? isDark() : document.documentElement.dataset.theme === 'dark');
const lmAgo = t => { if (!t) return ''; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m === 1 ? '1 min ago' : m < 60 ? m + ' min ago' : Math.round(m / 60) + ' h ago'; };
const lmUtc = h => new Date(Date.now() - h * 3600e3).toISOString().slice(0, 19);
// Calgary local date and time from a floating timestamp the City publishes
const lmWhen = (s, utc) => { if (!s) return ''; const d = new Date(utc ? s + 'Z' : s); return isNaN(d) ? s : d.toLocaleString('en-CA', { timeZone: 'America/Edmonton', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); };
const lmSave = () => { try { localStorage.setItem('lm-on', JSON.stringify(LM.on)); } catch { /* storage off */ } };

async function lmGet(id, q) {
  const r = await fetch(LM_CITY + id + '.json?' + new URLSearchParams(q), { cache: 'no-store' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
async function lmTraffic() {
  try {
    LM.traffic = (await lmGet('35ra-9556', { $select: 'start_dt_utc,incident_info,description,quadrant,latitude,longitude',
      $where: `start_dt_utc>'${lmUtc(24)}' AND latitude IS NOT NULL`, $order: 'start_dt_utc DESC', $limit: 400 })).filter(r => +r.latitude && +r.longitude);
    LM.read.traffic = Date.now(); delete LM.err.traffic;
  } catch (e) { LM.err.traffic = String(e.message || e); }
}
async function lm311() {
  try {
    const since = new Date(Date.now() - 3 * 864e5).toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' });
    LM.r311 = (await lmGet('iahh-g8bj', { $select: 'service_request_id,requested_date,status_description,service_name,comm_name,address,latitude,longitude',
      $where: `requested_date>='${since}' AND latitude IS NOT NULL`, $order: 'requested_date DESC', $limit: 1500 })).filter(r => +r.latitude && +r.longitude);
    LM.read.r311 = Date.now(); delete LM.err.r311;
  } catch (e) { LM.err.r311 = String(e.message || e); }
}
async function lmCity() {
  if (LM.city) return;
  try { const r = await (await api()).peek_view(0); if (r && r.ok) LM.city = r.data; else LM.err.crime = (r && r.error) || 'not read'; }
  catch (e) { LM.err.crime = String(e.message || e); }
}
function lmNews() {
  const all = ((typeof CN !== 'undefined' && CN && CN.articles) || []).filter(a => a.location && isFinite(+a.location.lat) && isFinite(+a.location.lon));
  const dates = [...new Set(all.map(a => a.date))].sort().reverse();
  const newest = dates[0] || '';
  const from = newest ? new Date(new Date(newest + 'T12:00:00') - (LM.newsDays - 1) * 864e5).toISOString().slice(0, 10) : '';
  return all.filter(a => a.date >= from && (!LM.safetyOnly || a.section === 'Public safety'));
}

function lmPopNews(a) {
  const src = (a.sources || []).slice(0, 4);
  return `<div class="lm-pop"><span class="lm-sec" style="background:${CN_TINT[a.section] || '#334155'}">${esc(a.section || 'Calgary News')}</span>
    <b>${esc(a.title)}</b><p>${esc(a.dek || '')}</p>
    ${(a.key_facts || []).length ? `<ul>${a.key_facts.slice(0, 4).map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
    <p class="lm-small">${esc(a.location.label || '')} · ${esc(CN_DAY(a.date))}</p>
    ${src.length ? `<p class="lm-small">Sources: ${src.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.outlet)}</a>`).join(', ')}</p>` : ''}
    <button type="button" class="btn small" data-lmread="${esc(a.id)}">Read the story</button></div>`;
}
function lmDraw() {
  const m = LM.map; if (!m) return;
  Object.values(LM.groups).forEach(g => g.remove());
  LM.groups = {};
  // police-reported crime per 1,000 residents, shaded by community
  const C = LM.city;
  if (LM.on.crime && C && C.geo && C.geo.communities) {
    // the police figures by community (crime.by_comm), else the community rows
    const byc = Object.fromEntries((((C.crime || {}).by_comm) || []).filter(x => x.code).map(x => [x.code, x]));
    const rows = (C.communities || []).map(c => byc[c.code] ? { ...c, crime_per_1000: byc[c.code].per_1000, crimes: byc[c.code].n } : c)
      .filter(c => isNum(c.crime_per_1000) && C.geo.communities[c.code]);
    const vals = rows.map(c => c.crime_per_1000).sort((a, b) => a - b);
    const q = [.2, .4, .6, .8].map(p => vals[Math.floor(p * (vals.length - 1))]);
    const ramp = LM_RAMP[lmDark() ? 'dark' : 'light'];
    const col = v => ramp[q.filter(x => v > x).length];
    LM.breaks = { q, ramp, max: vals[vals.length - 1] };
    LM.groups.crime = L.geoJSON({ type: 'FeatureCollection', features: rows.map(c => ({ type: 'Feature', properties: c, geometry: C.geo.communities[c.code] })) }, {
      style: f => ({ color: lmDark() ? '#1E293B' : '#FFFFFF', weight: .8, fillColor: col(f.properties.crime_per_1000), fillOpacity: .55 }),
      onEachFeature: (f, l) => { const c = f.properties; l.bindTooltip(`<b>${esc(c.name)}</b><br>${fmt(c.crime_per_1000, 1)} crimes per 1,000 residents a year<br>${fmt(c.crimes)} crimes reported to police, ${esc((C.crime || {}).period || 'last 12 months')}`, { sticky: true, className: 'area-tip' }); },
    }).addTo(m);
  }
  if (LM.on.r311 && LM.r311) {
    LM.groups.r311 = L.layerGroup(LM.r311.map(r => L.circleMarker([+r.latitude, +r.longitude], { radius: 4, weight: 1, color: '#FFFFFF', fillColor: '#64748B', fillOpacity: .85 })
      .bindPopup(`<div class="lm-pop"><span class="lm-sec" style="background:#64748B">311 request</span><b>${esc(typeof niceType === 'function' ? niceType(r.service_name || '') : r.service_name || '')}</b>
        <p class="lm-small">${esc(r.comm_name || '')}${r.address ? ' · ' + esc(r.address) : ''}<br>Made ${esc(lmWhen(r.requested_date))} · ${esc(r.status_description || '')}<br>Request ${esc(r.service_request_id)}</p>
        <p class="lm-small">A 311 request is a request for City service, not a crime report.</p></div>`))).addTo(m);
  }
  if (LM.on.traffic && LM.traffic) {
    LM.groups.traffic = L.layerGroup(LM.traffic.map(r => L.marker([+r.latitude, +r.longitude], { icon: L.divIcon({ className: '', html: '<div class="lm-tr" aria-hidden="true"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }), title: r.incident_info || 'Traffic incident' })
      .bindPopup(`<div class="lm-pop"><span class="lm-sec" style="background:#C2410C">Traffic incident</span><b>${esc(r.incident_info || '')}</b><p>${esc(r.description || '')}</p>
        <p class="lm-small">Reported ${esc(lmWhen(r.start_dt_utc, true))}${r.quadrant ? ' · ' + esc(r.quadrant) : ''} · City of Calgary traffic incidents</p></div>`))).addTo(m);
  }
  if (LM.on.news) {
    LM.groups.news = L.layerGroup(lmNews().map(a => L.marker([+a.location.lat, +a.location.lon], {
      icon: L.divIcon({ className: '', html: `<div class="lm-news" style="--t:${CN_TINT[a.section] || '#334155'}" aria-hidden="true"></div>`, iconSize: [22, 22], iconAnchor: [11, 20] }),
      title: a.title, zIndexOffset: 1000 }).bindPopup(lmPopNews(a), { maxWidth: 320 }))).addTo(m);
  }
  lmSide();
}
function lmSide() {
  const box = $('#lm-list'); if (!box) return;
  const news = LM.on.news ? lmNews() : [];
  const tr = LM.on.traffic ? (LM.traffic || []) : [];
  const counts = `<div class="lm-counts">${[['news', 'Stories on the map', news.length], ['traffic', 'Traffic incidents, last 24 h', (LM.traffic || []).length], ['r311', '311 requests, last 3 days', (LM.r311 || []).length]]
    .map(([k, l, n]) => `<div class="fb-kpi"><div class="fb-kpi-l">${l}</div><div class="fb-kpi-n">${LM.err[k] ? '–' : !LM.on[k] && !n ? '<small class="muted">off</small>' : fmt(n)}</div></div>`).join('')}</div>`;
  const item = (cls, t, s, ll) => `<li><button type="button" class="lm-item ${cls}" data-ll="${ll}"><b>${esc(t)}</b><small>${esc(s)}</small></button></li>`;
  box.innerHTML = counts + (news.length ? `<h3 class="fb-h3">Stories</h3><ul class="lm-items">${news.map(a => item('n', a.title, `${a.section || ''} · ${a.location.label || ''} · ${CN_DAY(a.date)}`, `${a.location.lat},${a.location.lon}`)).join('')}</ul>` : '')
    + (tr.length ? `<h3 class="fb-h3">Traffic now</h3><ul class="lm-items">${tr.slice(0, 25).map(r => item('t', r.incident_info || 'Traffic incident', `${lmWhen(r.start_dt_utc, true)} · ${r.description || ''}`, `${r.latitude},${r.longitude}`)).join('')}</ul>` : '')
    + (!news.length && !tr.length ? '<p class="muted">Turn on a layer to list what is on the map.</p>' : '');
  box.querySelectorAll('[data-ll]').forEach(b => b.addEventListener('click', () => {
    const [la, lo] = b.dataset.ll.split(',').map(Number);
    LM.map.setView([la, lo], Math.max(LM.map.getZoom(), 14));
    Object.values(LM.groups).forEach(g => g.eachLayer && g.eachLayer(l => { if (l.getLatLng && l.getLatLng().lat === la && l.getLatLng().lng === lo && l.openPopup) l.openPopup(); }));
  }));
  lmStamp();
}
function lmStamp() {
  const el = $('#lm-stamp'); if (!el) return;
  const t = LM.read.traffic;
  el.innerHTML = `<span class="lm-live${t && !LM.err.traffic ? '' : ' off'}"></span>${LM.err.traffic ? 'Traffic could not be read just now' : t ? 'Traffic updated ' + lmAgo(t) : 'Reading traffic…'}${LM.read.r311 ? ` · 311 read ${lmAgo(LM.read.r311)}` : ''}`;
  const lg = $('#lm-legend');
  if (lg) lg.innerHTML = LM.on.crime && LM.breaks ? `<span>Crimes per 1,000 residents a year:</span><span>under ${fmt(LM.breaks.q[0], 0)}</span><span class="lm-ramp">${LM.breaks.ramp.map((c, i) => `<i style="background:${c}" title="${i === 0 ? 'up to ' + fmt(LM.breaks.q[0], 0) : i === 4 ? 'over ' + fmt(LM.breaks.q[3], 0) : fmt(LM.breaks.q[i - 1], 0) + ' to ' + fmt(LM.breaks.q[i], 0)}"></i>`).join('')}</span><span>over ${fmt(LM.breaks.q[3], 0)}</span><span class="lm-small">(each colour is a fifth of Calgary's communities)</span>` : '';
  const pe = $('#lm-period'); if (pe && LM.city && LM.city.crime && LM.city.crime.period) pe.textContent = LM.city.crime.period;
}

async function renderLiveMap() {
  const body = $('#lm-body'); if (!body) return;
  if (!LM.map) {
    body.innerHTML = `<section class="card span-12 lm-card">
      <div class="lm-bar"><div class="lm-layers" role="group" aria-label="Layers">
        ${[['news', 'News stories'], ['traffic', 'Traffic, live'], ['r311', '311 requests'], ['crime', 'Crime by community']].map(([k, l]) => `<button type="button" class="chip lm-chip-${k}${LM.on[k] ? ' on' : ''}" aria-pressed="${LM.on[k]}" data-lm="${k}">${l}</button>`).join('')}</div>
        <div class="lm-opts"><select id="lm-days" aria-label="Stories from"><option value="1">Today's stories</option><option value="7" selected>The last 7 days</option><option value="30">The last 30 days</option><option value="60">The last 60 days</option></select>
          <label class="lm-check"><input type="checkbox" id="lm-safety"> Public safety only</label></div>
        <div class="lm-stamp" id="lm-stamp" role="status"></div></div>
      <div class="lm-wrap"><div class="lm-map" id="lm-map" role="region" aria-label="Live map of Calgary"></div><aside class="lm-side" id="lm-list"></aside></div>
      <div class="lm-legend" id="lm-legend"></div>
      <p class="card-note"><b>What each layer is.</b> <b>News stories</b>: Calgary News articles placed where the story happened, as its sources describe it; each popup gives the key facts and links to the original reports. <b>Traffic</b>: incidents the City of Calgary reports (dataset 35ra-9556), read again every 2 minutes while this page is open. <b>311 requests</b>: requests for City service (potholes, noise, graffiti), not crimes; the City's file is updated daily (dataset iahh-g8bj). <b>Crime by community</b>: crimes reported to the Calgary Police Service per 1,000 residents a year, <span id="lm-period">${esc(((LM.city || {}).crime || {}).period || 'the latest 12 months published')}</span>. The police publish counts by community and month, not the place of each crime, so single crimes are not on the map.</p></section>
      <section class="card span-12 lm-help"><div class="card-head"><div><h2>What you can do</h2><p class="card-sub">If you see something happening, or have information about a crime</p></div></div>
        <div class="lm-calls">
          <div><b class="lm-n red">911</b><span>Emergency: a crime in progress, a fire, or someone hurt or in danger</span></div>
          <div><b class="lm-n">403-266-1234</b><span>Calgary Police non-emergency: report a crime after the fact or something suspicious</span></div>
          <div><b class="lm-n">1-800-222-8477</b><span>Crime Stoppers: give a tip anonymously (calgarycrimestoppers.org)</span></div>
          <div><b class="lm-n">311</b><span>City services: potholes, graffiti, noise, an abandoned vehicle (403-268-2489 from outside Calgary)</span></div>
          <div><b class="lm-n">511</b><span>Alberta 511: highway and road conditions</span></div>
        </div></section>`;
    LM.map = L.map('lm-map', { zoomControl: true, scrollWheelZoom: false, zoomSnap: .25 }).setView([51.045, -114.06], 10.75);
    LM.map.on('click focus', () => LM.map.scrollWheelZoom.enable());
    LM.map.on('mouseout', () => LM.map.scrollWheelZoom.disable());
    L.tileLayer(typeof TILES !== 'undefined' ? TILES[lmDark() ? 'dark' : 'light'] : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: 'Esri, OpenStreetMap contributors · City of Calgary, Calgary Police Service' }).addTo(LM.map);
    new ResizeObserver(() => LM.map && LM.map.invalidateSize()).observe($('#lm-map'));
    body.addEventListener('click', e => {
      const b = e.target.closest('[data-lm]');
      if (b) { const k = b.dataset.lm; LM.on[k] = !LM.on[k]; b.classList.toggle('on', LM.on[k]); b.setAttribute('aria-pressed', String(LM.on[k])); lmSave(); if (k === 'r311' && LM.on.r311 && !LM.r311) lm311().then(lmDraw); lmDraw(); }
    });
    LM.map.on('popupopen', e => {
      const btn = e.popup.getElement() && e.popup.getElement().querySelector('[data-lmread]');
      if (btn) btn.addEventListener('click', () => { cnOpen = btn.dataset.lmread; show('citynews'); });
    });
    $('#lm-days').addEventListener('change', e => { LM.newsDays = +e.target.value; lmDraw(); });
    $('#lm-safety').addEventListener('change', e => { LM.safetyOnly = e.target.checked; lmDraw(); });
  } else setTimeout(() => LM.map.invalidateSize(), 60);
  lmStamp();
  await Promise.all([loadCityNews(), lmCity(), lmTraffic(), LM.on.r311 ? lm311() : null]);
  lmDraw();
  // live: traffic every 2 minutes, 311 every 10, only while this page is on screen
  clearInterval(LM.timer); clearInterval(LM.tick);
  const here = () => !document.hidden && $('#view-livemap') && $('#view-livemap').classList.contains('is-on');
  let n = 0;
  LM.timer = setInterval(async () => {
    if (!here()) return;
    n++;
    await Promise.all([lmTraffic(), LM.on.r311 && n % 5 === 0 ? lm311() : null]);
    if (LM.map._popup && LM.map.hasLayer(LM.map._popup)) lmStamp(); else lmDraw();   // keep an open popup open
  }, 120000);
  LM.tick = setInterval(() => { if (here()) lmStamp(); }, 30000);
}
window.renderLiveMap = renderLiveMap;
