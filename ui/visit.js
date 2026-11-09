/* Calgary Insight: Visiting Calgary. What to see, where to stay, the weather by month and over the years, what is on
   each month, and how to get around; visit.py builds data/visit.json (Environment and Climate Change Canada daily
   records since 1885, OpenStreetMap places inside the city, and hand-checked facts with their sources). */
'use strict';

let VI = null, viSub = 'overview', viWx = null, viCharts = {}, viMap = null, viArea = '';
const VI_SUBS = [['overview', 'Overview'], ['weather', 'Weather'], ['whatson', "What's on"], ['places', 'What to see'], ['stay', 'Where to stay'], ['around', 'Getting around']];
const VI_FIT = { warm: ['Warm and sunny', 'a sunny day above about 18 °C'], cool: ['Cool', 'between 5 and 18 °C'], cold: ['Cold', 'below freezing'], wet: ['Rain or snow', 'wet weather'] };
const viN = (v, d = 0) => isNum(v) ? fmt(v, d) : '–';
const viT = v => isNum(v) ? `${v < 0 ? '−' : ''}${fmt(Math.abs(v), 1)} °C` : '–';
const viDate = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

async function loadVisit() {
  if (VI) return VI;
  try { const r = await (await api()).get_visit(); if (r && r.ok && r.data) VI = r.data; else VI = { error: (r && r.error) || 'not read' }; }
  catch (e) { VI = { error: String(e) }; }
  return VI;
}

// which weather today suits: from the forecast when the site was built, otherwise the month's normal
function viTodayFit() {
  const w = (VI && VI.weather) || {}, t = viLive || w.today || {}, now = t.now || {}, days = t.forecast || [];
  const cond = String((now.condition || (days[0] || {}).summary || '')).toLowerCase();
  if (/rain|snow|shower|flurr|drizzle|storm/.test(cond)) return 'wet';
  let hi = isNum(now.temperature_c) ? now.temperature_c : null;
  const d0 = days.find(d => isNum(d.high_c)); if (d0) hi = Math.max(hi == null ? -99 : hi, d0.high_c);
  if (hi == null) { const n = (w.normals || [])[new Date().getMonth()]; hi = n ? n.high : 10; }
  return hi >= 18 ? 'warm' : hi >= 5 ? 'cool' : 'cold';
}
// Environment Canada allows the page to read the live forecast itself; the one read at the refresh is the fallback
let viLive = null, viLiveTried = false;
async function viFetchLive() {
  if (viLiveTried) return viLive; viLiveTried = true;
  try {
    const r = await fetch('https://api.weather.gc.ca/collections/citypageweather-realtime/items/ab-52?f=json&lang=en', { cache: 'no-cache' });
    const p = (await r.json()).properties || {}, cc = p.currentConditions || {}, en = v => (v && typeof v === 'object' && 'en' in v) ? v.en : v;
    const fg = p.forecastGroup || {};
    const num = v => { const x = parseFloat(en(v)); return isNaN(x) ? null : x; };
    viLive = { live: true, issued_utc: en(fg.timestamp), now: { condition: en(cc.condition), temperature_c: num((cc.temperature || {}).value), wind_chill: num((cc.windChill || {}).value),
      wind_kmh: num(((cc.wind || {}).speed || {}).value), wind_direction: en(((cc.wind || {}).direction || {}).value), observed_at_utc: en(cc.timestamp) },
      forecast: (fg.forecasts || []).map(f => { const temps = {}; ((f.temperatures || {}).temperature || []).forEach(t => { temps[en(t.class)] = num(t.value); });
        return { period: en((f.period || {}).textForecastName), summary: en((f.textSummary || {}).value || f.textSummary), high_c: temps.high == null ? null : temps.high, low_c: temps.low == null ? null : temps.low }; }) };
    if (!isNum(viLive.now.temperature_c) && !viLive.forecast.length) viLive = null;
  } catch (e) { viLive = null; }
  return viLive;
}

function viTabs() {
  return `<nav class="el-subtabs span-12" aria-label="Visiting Calgary sections">${VI_SUBS.map(([k, t]) => `<button type="button" class="el-subtab${k === viSub ? ' is-on' : ''}" data-visub="${k}" ${k === viSub ? 'aria-current="page"' : ''}>${esc(t)}</button>`).join('')}</nav>`;
}
function viLink(url, text) { return url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}</a>` : esc(text); }

// ---------------------------------------------------------------- today and the weather chooser
function viTodayCard() {
  const w = VI.weather || {}, t = viLive || w.today || {}, now = t.now || {}, days = (t.forecast || []).slice(0, 6);
  if (!days.length && !isNum(now.temperature_c)) return '';
  const when = t.live ? 'live from Environment Canada' : 'Environment Canada, read when the site was refreshed';
  const short = p => String(p || '').replace(/^(Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day/, (m, d) => d.slice(0, 3));
  const strip = days.map(d => `<div class="vi-fday"><b>${esc(short(d.period))}</b><span>${isNum(d.high_c) ? viT(d.high_c) : isNum(d.low_c) ? viT(d.low_c) : ''}</span><small title="${esc(d.summary || '')}">${esc((d.summary || '').split('.')[0])}</small></div>`).join('');
  return `<div class="vi-today"><div class="vi-now"><div class="vi-now-t">${isNum(now.temperature_c) ? viT(now.temperature_c) : '–'}</div><div><b>${esc(now.condition || 'Calgary now')}</b>
    <small>${isNum(now.wind_kmh) ? `wind ${fmt(now.wind_kmh)} km/h ${esc(now.wind_direction || '')}` : ''}${isNum(now.wind_chill) && isNum(now.temperature_c) && now.temperature_c <= 5 ? ` · feels like ${viT(now.wind_chill)}` : ''}</small>
    <small>${when}</small></div></div><div class="vi-fstrip">${strip}</div></div>`;
}
function viChooser() {
  const fit = viWx || (viWx = viTodayFit());
  const all = (VI.top || []).filter(p => (p.fit || []).includes(fit)), picks = [], seen = {};
  for (let round = 0; picks.length < Math.min(8, all.length); round++) all.forEach(p => { if (picks.length < 8 && !picks.includes(p) && (seen[p.area] || 0) === round) { picks.push(p); seen[p.area] = round + 1; } });
  return `<section class="card span-12 vi-choose"><div class="card-head"><div><h2>What suits the weather</h2><p class="card-sub">Pick the weather you have (today's is picked for you) and see what Calgary is good for in it</p></div></div>
    <div class="seg vi-seg" role="radiogroup" aria-label="Weather">${Object.entries(VI_FIT).map(([k, [t, d]]) => `<button type="button" role="radio" aria-checked="${k === fit}" data-vifit="${k}" title="${esc(d)}">${esc(t)}</button>`).join('')}</div>
    <div class="vi-picks">${picks.map(p => `<button type="button" class="vi-pick" data-viplace="${esc(p.id)}"><b>${esc(p.name)}</b><small>${esc(p.kind)}${p.indoor ? ' · indoors' : ''} · ${esc(p.area)}</small><span>${esc(p.what)}</span></button>`).join('')}</div>
    <p class="card-note">${fit === 'wet' ? 'Wet days are rare: Calgary has about 2,400 hours of sunshine a year, the most of any big city in Canada.' : fit === 'cold' ? 'Cold days are often sunny and still; the +15 walkways, the CTrain and the malls keep a downtown day warm.' : fit === 'warm' ? 'The air is dry at 1,045 m, so the sun is strong and evenings cool quickly: carry water and a layer.' : 'Most of spring and fall: a jacket by day, a coat by night, and the mountains an hour and a half away.'}</p></section>`;
}

// ---------------------------------------------------------------- the sections
function viOverview() {
  const w = VI.weather || {}, stats = VI.stats || [];
  const sun = `<div class="el-kpi"><div class="el-kpi-l">Sunshine</div><div class="el-kpi-n">2,396 h</div><div class="el-hero-sub">a year: the most of any big Canadian city (Environment Canada normals, 1981 to 2010)</div></div>`;
  return `<section class="el-cr span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Visiting Calgary</div><h2 class="el-cr-title">A city of 1.6 million at the foot of the Rockies</h2>
      <p class="el-hero-sub">Calgary is Canada's sunniest big city and its highest, an hour and a half from Banff, with the Stampede each July, two rivers through the middle and ${fmt((VI.sights || []).length || 0)} mapped sights. This page puts the facts a visitor needs in one place: the weather month by month and over the years, what is on, what to see, where the hotels are and how to get around, from public data and the organisers' own pages.</p></div>
      ${viTodayCard()}</div>
    <div class="el-cr-kpis">${stats.slice(0, 4).map(s => `<div class="el-kpi"><div class="el-kpi-l">${esc(s.what)}</div><div class="el-kpi-n">${esc(s.n)}</div><div class="el-hero-sub">${esc(s.source)}</div></div>`).join('')}${sun}</div></section>
    ${viChooser()}
    <section class="card span-6"><div class="card-head"><div><h2>Facts worth knowing</h2><p class="card-sub">Each with its source</p></div></div>
      <dl class="vi-facts">${(VI.facts || []).map(f => `<div><dt>${esc(f.title)}</dt><dd>${esc(f.what)} ${viLink(f.url, 'Source')}</dd></div>`).join('')}</dl></section>
    <section class="card span-6"><div class="card-head"><div><h2>Day trips</h2><p class="card-sub">Road distance from downtown</p></div></div>
      <ul class="vi-trips">${(VI.day_trips || []).map(d => `<li><b>${viLink(d.url, d.name)}</b> <span class="vi-km">${fmt(d.km)} km</span><p>${esc(d.what)}</p></li>`).join('')}</ul>
      <p class="card-note">Five national parks are within a day's drive: Banff, Jasper, Kootenay, Yoho and Waterton Lakes. Check 511 Alberta for road conditions in winter.</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>This month</h2><p class="card-sub">What is usually on</p></div></div>${viMonth((VI.months || [])[new Date().getMonth()], true)}</section>`;
}

function viMonth(m, brief) {
  if (!m) return '';
  const n = ((VI.weather || {}).normals || [])[m.n - 1];
  return `<div class="vi-month" id="vi-month-${m.n}"><div class="vi-month-h"><h3>${esc(m.name)}</h3>${n ? `<span class="vi-month-wx" title="Average daily high and low, ${esc((VI.weather || {}).normals_period || '')}">${viT(n.high)} / ${viT(n.low)}${isNum(n.snow_cm) && n.snow_cm >= 1 ? ` · ${fmt(n.snow_cm)} cm snow` : isNum(n.rain_mm) ? ` · ${fmt(n.rain_mm)} mm rain` : ''}</span>` : ''}</div>
    <p class="muted">${esc(m.about)}</p>
    <ul class="vi-events">${(m.events || []).slice(0, brief ? 4 : 20).map(e => `<li><b>${viLink(e.url, e.name)}</b><span>${esc(e.what)}</span></li>`).join('')}</ul></div>`;
}
function viWhatsOn() {
  return `<section class="card span-12"><div class="card-head"><div><h2>What is on, month by month</h2><p class="card-sub">Recurring festivals, seasons and sports, with the organiser's page for the year's dates; the averages are the daily high and low for the month</p></div></div>
    <div class="vi-months">${(VI.months || []).map(m => viMonth(m)).join('')}</div>
    <p class="card-note">Dates are the organisers' habit, not a promise: check their page. Alberta's general holidays (Family Day in February, Victoria Day in May, Canada Day, the August civic holiday, Labour Day, Thanksgiving in October) bring long weekends and closures.</p></section>`;
}

function viWeather() {
  const w = VI.weather || {};
  if (!w.normals) return `<section class="card span-12"><p>The weather figures are not on the website yet. They appear after the next refresh.</p></section>`;
  const N = w.normals, r = w.records || {}, yrs = (w.years || []).filter(y => !y.partial);
  const warm = yrs.slice(-30), early = yrs.slice(0, 30);
  const mean = a => a.length ? a.reduce((s, y) => s + (y.mean || 0), 0) / a.length : null;
  const trend = isNum(mean(warm)) && isNum(mean(early)) ? mean(warm) - mean(early) : null;
  const rows = N.map(n => `<tr><th scope="row">${esc(n.name)}</th><td class="num">${viT(n.high)}</td><td class="num">${viT(n.low)}</td><td class="num">${viN(n.rain_mm)}</td><td class="num">${viN(n.snow_cm)}</td><td class="num">${viN(n.days_20)}</td><td class="num">${viN(n.days_frost)}</td><td class="num">${viN(n.days_m20)}</td><td class="num">${viN(n.days_snow_on_ground)}</td></tr>`).join('');
  const last = (w.last12 || []).map(m => `<tr><th scope="row">${esc(m.name)} ${m.y}</th><td class="num">${viT(m.high)}</td><td class="num">${viT(m.low)}</td><td class="num">${viT(m.mean)}</td><td class="num">${viT(m.normal_mean)}</td><td class="num ${isNum(m.mean) && isNum(m.normal_mean) ? (m.mean - m.normal_mean > 0.5 ? 'good' : m.mean - m.normal_mean < -0.5 ? 'bad' : '') : ''}">${isNum(m.mean) && isNum(m.normal_mean) ? (m.mean - m.normal_mean >= 0 ? '+' : '−') + fmt(Math.abs(m.mean - m.normal_mean), 1) : '–'}</td><td class="num">${viN(m.snow_cm)}</td></tr>`).join('');
  const rec = (label, x, unit) => x ? `<div class="vi-rec"><b>${esc(label)}</b><span class="vi-rec-v">${unit === 'c' ? viT(x.value) : `${fmt(x.value, 1)} ${unit}`}</span><small>${viDate(x.date)}</small></div>` : '';
  return `<section class="card span-12"><div class="card-head"><div><h2>The year in Calgary</h2><p class="card-sub">Average of each month, ${esc(w.normals_period)}, from Environment Canada's daily records at the airport</p></div></div>
      <div class="chart-holder"><canvas id="vi-normals" role="img" aria-label="Average daily high and low by month"></canvas></div>
      <div class="table-wrap"><table class="data vi-table"><thead><tr><th scope="col">Month</th><th scope="col" class="num">Daily high</th><th scope="col" class="num">Daily low</th><th scope="col" class="num">Rain, mm</th><th scope="col" class="num">Snow, cm</th><th scope="col" class="num">Days 20 °C or more</th><th scope="col" class="num">Days below 0 °C at night</th><th scope="col" class="num">Days −20 °C or colder</th><th scope="col" class="num">Days with snow on the ground</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="card-note">Highs and lows are the average of each day's; snow is what fell, not what lies. Calgary's weather swings: a Chinook can bring +10 °C in January, and in the airport's record snow of a centimetre or more has fallen in every month but July.</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>Over the years, since ${w.first_year}</h2><p class="card-sub">Every year with a full record${isNum(trend) ? `; the last 30 years average ${trend >= 0 ? '+' : '−'}${fmt(Math.abs(trend), 1)} °C against the first 30` : ''}</p></div></div>
      <div class="vi-charts"><div class="chart-holder"><canvas id="vi-ymean" role="img" aria-label="Annual mean temperature by year"></canvas></div><div class="chart-holder"><canvas id="vi-yhot" role="img" aria-label="Days of 25 °C or more by year"></canvas></div>
      <div class="chart-holder"><canvas id="vi-ycold" role="img" aria-label="Days of −20 °C or colder by year"></canvas></div><div class="chart-holder"><canvas id="vi-ysnow" role="img" aria-label="Snowfall by year"></canvas></div></div>
      <p class="card-note">Thin line: the year; thick line: the ten-year average. The station moved across the airport in 2012, so the two records are joined.</p></section>
    <section class="card span-6"><div class="card-head"><div><h2>Records in the data</h2><p class="card-sub">Calgary airport, ${w.first_year} to today</p></div></div>
      <div class="vi-recs">${rec('Hottest day', r.hottest, 'c')}${rec('Coldest day', r.coldest, 'c')}${rec('Most snow in a day', r.most_snow_day, 'cm')}${rec('Most rain in a day', r.most_rain_day, 'mm')}${rec('Deepest snow on the ground', r.deepest_snow, 'cm')}
        ${r.warmest_year ? `<div class="vi-rec"><b>Warmest year</b><span class="vi-rec-v">${viT(r.warmest_year.mean)}</span><small>${r.warmest_year.y}</small></div>` : ''}${r.coldest_year ? `<div class="vi-rec"><b>Coldest year</b><span class="vi-rec-v">${viT(r.coldest_year.mean)}</span><small>${r.coldest_year.y}</small></div>` : ''}
        ${r.latest_spring_snow ? `<div class="vi-rec"><b>Latest spring snow (1 cm or more)</b><span class="vi-rec-v">${viDate(r.latest_spring_snow).replace(/^\d+ |, \d{4}$/g, '')}</span><small>${r.latest_spring_snow.slice(0, 4)}</small></div>` : ''}${r.earliest_fall_snow ? `<div class="vi-rec"><b>Earliest fall snow (1 cm or more)</b><span class="vi-rec-v">${viDate(r.earliest_fall_snow)}</span></div>` : ''}</div></section>
    <section class="card span-6"><div class="card-head"><div><h2>The last twelve months</h2><p class="card-sub">Against the ${esc(w.normals_period)} average</p></div></div>
      <div class="table-wrap"><table class="data vi-table"><thead><tr><th scope="col">Month</th><th scope="col" class="num">High</th><th scope="col" class="num">Low</th><th scope="col" class="num">Mean</th><th scope="col" class="num">Normal</th><th scope="col" class="num">Difference</th><th scope="col" class="num">Snow, cm</th></tr></thead><tbody>${last}</tbody></table></div></section>`;
}
function viDrawWeather() {
  const w = VI.weather || {}; if (!w.normals || typeof Chart === 'undefined') return;
  chartTheme(); Object.values(viCharts).forEach(c => c.destroy()); viCharts = {};
  const c1 = cssv('--chart-1'), c2 = cssv('--chart-2');
  const el = $('#vi-normals'); if (el) viCharts.n = new Chart(el, { type: 'bar', data: { labels: w.normals.map(n => n.name.slice(0, 3)), datasets: [
    { label: 'Daily high', data: w.normals.map(n => n.high), backgroundColor: '#F59E0B', borderRadius: 4 }, { label: 'Daily low', data: w.normals.map(n => n.low), backgroundColor: c1, borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }, tooltip: tooltipStyle() }, scales: { y: { title: { display: true, text: '°C' } } } } });
  const yrs = (w.years || []).filter(y => !y.partial);
  const avg10 = (key) => yrs.map((y, i) => { const s = yrs.slice(Math.max(0, i - 9), i + 1).map(x => x[key]).filter(isNum); return s.length >= 7 ? s.reduce((a, b) => a + b, 0) / s.length : null; });
  const line = (id, key, label, color, unit) => { const e = $('#' + id); if (!e) return; viCharts[id] = new Chart(e, { type: 'line', data: { labels: yrs.map(y => y.y), datasets: [
    { label, data: yrs.map(y => y[key]), borderColor: color, borderWidth: 1, pointRadius: 0, tension: 0 }, { label: '10-year average', data: avg10(key), borderColor: color, borderWidth: 3, pointRadius: 0, tension: .2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: label, align: 'start' }, tooltip: tooltipStyle() },
      scales: { x: { ticks: { maxTicksLimit: 8 } }, y: { title: { display: true, text: unit } } }, interaction: { mode: 'index', intersect: false } } }); };
  line('vi-ymean', 'mean', 'Mean temperature', '#F59E0B', '°C'); line('vi-yhot', 'days_25', 'Days of 25 °C or more', '#DC2626', 'days');
  line('vi-ycold', 'days_m20', 'Days of −20 °C or colder', c1, 'days'); line('vi-ysnow', 'snow_cm', 'Snowfall', c2, 'cm');
}

function viPlaceCard(p) {
  return `<article class="card vi-place" id="vi-place-${esc(p.id)}"><h3>${viLink(p.url, p.name)}</h3><p class="vi-place-k">${esc(p.kind)}${p.indoor ? ' · indoors' : ''} · ${esc(p.community || p.area)}${p.closed_until ? ` · reopens ${esc(p.closed_until)}` : ''}</p><p>${esc(p.what)}</p>
    <p class="vi-fit">${(p.fit || []).map(f => `<span>${esc((VI_FIT[f] || [f])[0])}</span>`).join('')}</p></article>`;
}
function viPlaces() {
  const areas = {}; (VI.top || []).forEach(p => (areas[p.area] = areas[p.area] || []).push(p));
  const more = (VI.sights || []).filter(s => !(VI.top || []).some(t => t.osm && t.osm === s.osm));
  const byKind = {}; more.forEach(s => (byKind[s.label] = byKind[s.label] || []).push(s));
  return `<section class="card span-12"><div class="card-head"><div><h2>What to see</h2><p class="card-sub">The best-known places, by area; the map shows every sight mapped in OpenStreetMap inside the city</p></div></div>
      <div id="vi-map" class="vi-map" role="region" aria-label="Map of the sights"></div></section>
    ${Object.entries(areas).map(([a, ps]) => `<section class="span-12 vi-area"><h2 class="vi-area-h">${esc(a)}</h2><p class="muted">${esc(((VI.areas_about || []).find(x => x.area === a) || {}).about || '')}</p><div class="vi-grid">${ps.map(viPlaceCard).join('')}</div></section>`).join('')}
    <section class="card span-12"><div class="card-head"><div><h2>More places on the map</h2><p class="card-sub">${fmt(more.length)} more sights, galleries, viewpoints and works of public art mapped in OpenStreetMap; a missing place means nobody has mapped it yet</p></div></div>
      ${Object.entries(byKind).sort((a, b) => b[1].length - a[1].length).map(([k, l]) => `<details class="vi-more"><summary>${esc(k)} <span class="muted">(${l.length})</span></summary><ul class="vi-list">${l.map(s => `<li>${viLink(s.url, s.name)} <span class="muted">${esc(s.community || '')}</span></li>`).join('')}</ul></details>`).join('')}
      <p class="card-note">© OpenStreetMap contributors (ODbL). Listing is not a recommendation.</p></section>`;
}
function viDrawMap() {
  const el = $('#vi-map'); if (!el || typeof L === 'undefined') return;
  if (viMap) { viMap.remove(); viMap = null; }
  viMap = L.map(el, { scrollWheelZoom: false }).setView([51.045, -114.07], 11);
  (typeof BASES !== 'undefined' ? BASES.street() : L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' })).addTo(viMap);
  (VI.sights || []).forEach(s => L.circleMarker([s.lat, s.lon], { radius: 4, color: '#7DD3FC', weight: 1, fillOpacity: .5 }).bindTooltip(`${esc(s.name)} · ${esc(s.label)}`).addTo(viMap));
  (VI.top || []).forEach(p => { if (isNum(p.lat)) L.circleMarker([p.lat, p.lon], { radius: 8, color: '#F7DC97', fillColor: '#F59E0B', weight: 2, fillOpacity: .9 }).bindTooltip(`<b>${esc(p.name)}</b><br>${esc(p.kind)}`).on('click', () => visitOpen({ place: p.id })).addTo(viMap); });
  setTimeout(() => viMap.invalidateSize(), 80);
}

function viStay() {
  const areas = VI.areas || [], stays = (VI.stays || []).filter(s => !viArea || s.area === viArea);
  const labels = VI.stay_labels || {};
  return `<section class="card span-12"><div class="card-head"><div><h2>Where the hotels are</h2><p class="card-sub">${fmt((VI.stays || []).length)} hotels, motels, hostels and guest houses mapped in OpenStreetMap inside the city, by area</p></div></div>
      <div class="table-wrap"><table class="data vi-table"><thead><tr><th scope="col">Area</th><th scope="col">What it is like</th><th scope="col" class="num">Places to stay</th><th scope="col" class="num">of them hotels</th><th scope="col" class="num">Sights nearby</th></tr></thead>
      <tbody>${areas.map(a => `<tr class="${viArea === a.area ? 'is-sel' : ''}"><th scope="row"><button type="button" class="link-btn" data-viarea="${esc(a.area)}">${esc(a.area)}</button></th><td class="vi-about">${esc(a.about)}</td><td class="num">${fmt(a.stays)}</td><td class="num">${fmt(a.hotels)}</td><td class="num">${fmt(a.sights)}</td></tr>`).join('')}</tbody></table></div>
      <p class="card-note">Hotels add Alberta's 4% tourism levy and many a 6% destination marketing fee to the 5% GST. Listing is not a recommendation; prices and availability are on the hotels' own pages.</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>${viArea ? esc(viArea) : 'Every place to stay'}</h2><p class="card-sub">As mapped in OpenStreetMap${viArea ? ` · <button type="button" class="link-btn" data-viarea="">show all areas</button>` : ''}</p></div></div>
      <div class="table-wrap tall"><table class="data vi-table"><thead><tr><th scope="col">Name</th><th scope="col">Kind</th><th scope="col">Community</th><th scope="col">Area</th><th scope="col">Website</th></tr></thead>
      <tbody>${stays.map(s => `<tr><th scope="row">${esc(s.name)}</th><td>${esc(labels[s.kind] || s.kind)}</td><td>${esc(s.community || '')}</td><td>${esc(s.area)}</td><td>${s.url ? viLink(s.url, 'site') : ''}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function viAround() {
  return `<section class="card span-12"><div class="card-head"><div><h2>Getting around</h2><p class="card-sub">Checked ${esc(VI.checked || '')} against the pages linked; fares change each January</p></div></div>
      <div class="vi-grid">${(VI.getting_around || []).map(g => `<article class="card vi-ga"><h3>${esc(g.title)}</h3><p>${esc(g.what)}</p><p class="vi-src">${viLink(g.url, 'Source')}</p></article>`).join('')}</div></section>`;
}

async function renderVisit() {
  const body = $('#vi-body'); if (!body) return;
  if (!VI) body.innerHTML = '<section class="card span-12"><p class="muted">Reading…</p></section>';
  await loadVisit();
  if (!VI || VI.error) { body.innerHTML = `<section class="card span-12"><p>Visiting Calgary is not on the website yet. It appears after the next refresh.</p></section>`; return; }
  if (!viLiveTried && viSub === 'overview') viFetchLive().then(l => { if (l) { viWx = null; renderVisit(); } });
  const page = viSub === 'weather' ? viWeather() : viSub === 'whatson' ? viWhatsOn() : viSub === 'places' ? viPlaces() : viSub === 'stay' ? viStay() : viSub === 'around' ? viAround() : viOverview();
  // on the website: the door into Calgary, with the Calgary song (calgaryinsight.ca/visit/)
  const door = document.body.dataset.web && viSub === 'overview' ? `<a class="card span-12 vi-door" href="visit/"><span class="vi-door-k">New · sound on</span><b>Step through the door</b><span>Welcome to Calgary: the city in pictures, with the chorus of the Calgary song, "Under One Sky"</span><span class="vi-door-go">Open the door →</span></a>`
    + `<a class="card span-12 vi-game" href="visit/explore/"><img src="visit/img/tile-river.jpg" alt="" width="640" height="360" loading="lazy"><span class="vi-game-t"><b>Explore Calgary: plan your days</b><span>A trip planner, a map of what to see with filters, collections like Calgary in 24 hours and the best things to do at no charge, and day trips within a few hours.</span></span><span class="vi-game-go">Open the planner →</span></a>`
    + `<a class="card span-12 vi-game" href="game/"><img src="game/img/eau-claire.jpg" alt="" width="640" height="360" loading="lazy"><span class="vi-game-t"><b>Explore Calgary's streets before you arrive</b><span>Walk downtown, ride the CTrain and try City services, from transit fares to 311, in YYC City Stories, a free game on the real map of Calgary.</span></span><span class="vi-game-go">Explore in the game →</span></a>` : '';
  body.innerHTML = viTabs() + door + page + `<section class="card span-12"><p class="card-note">Sources: ${(VI.sources || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher)}: ${esc(s.title)}</a>`).join('; ')}. Facts and events checked by hand on ${esc(VI.checked || '')}; the weather is read again every morning.</p></section>`;
  body.querySelectorAll('[data-visub]').forEach(b => b.addEventListener('click', () => { viSub = b.dataset.visub; renderVisit(); }));
  body.querySelectorAll('[data-vifit]').forEach(b => b.addEventListener('click', () => { viWx = b.dataset.vifit; renderVisit(); }));
  body.querySelectorAll('[data-viplace]').forEach(b => b.addEventListener('click', () => visitOpen({ place: b.dataset.viplace })));
  body.querySelectorAll('[data-viarea]').forEach(b => b.addEventListener('click', () => { viArea = b.dataset.viarea; renderVisit(); }));
  if (viSub === 'weather') viDrawWeather();
  if (viSub === 'places') viDrawMap();
}
// the site search and the map jump to one place or one month
async function visitOpen(what) {
  await loadVisit(); if (!VI || VI.error) return;
  if (what && what.place) { viSub = 'places'; await renderVisit(); const el = $(`#vi-place-${CSS.escape(String(what.place))}`) || $$('.vi-place').find(x => x.textContent.includes(what.place)); if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('ss-flash'); setTimeout(() => el.classList.remove('ss-flash'), 2500); } }
  else if (what && what.month) { viSub = 'whatson'; await renderVisit(); const el = $(`#vi-month-${what.month}`); if (el) el.scrollIntoView({ block: 'start' }); }
}
window.renderVisit = renderVisit;
window.visitOpen = visitOpen;
