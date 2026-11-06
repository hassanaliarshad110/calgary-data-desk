// ================================================================ GROWTH: FORECAST TO 2030 (srg.py)
// The City's Suburban Residential Growth forecast, shared to new communities, through the growth model and
// Growth vs amenities: residents today and in 2030, and crowding at today's amenities.
let fcSector = '', fcShow = '', fcChart = null;
const FC_TAG = { becomes_crowded: 'ac-gap', more_crowded: 'ac-gap', crowded: 'ac-check', far_growing: 'ac-check', keeps_up: 'ac-ok', no_score: 'ac-few' };
const FC_BAND = { well_below: 'Well below', below: 'Below', around: 'Around', above: 'Above' };
const fcTag = (S, r) => `<span class="ac-tag ${FC_TAG[r] || ''}">${esc((S.readings || {})[r] || r)}</span>`;
const fcN = (v, d = 0) => isNum(v) ? fmt(v, d) : '–';
const fcArrow = (a, b, d = 2) => `${fcN(a, d)} <span class="fc-to" aria-label="to">→</span> <b>${fcN(b, d)}</b>`;
const fcScore = x => !x || !isNum(x.now) ? '<span class="dash">–</span>'
  : `${fcN(x.now, 2)} <span class="fc-to" aria-label="to">→</span> <b>${fcN(x.then, 2)}</b><small>${esc(FC_BAND[x.band_now] || '')} → ${esc(FC_BAND[x.band_then] || '')}</small>`;
const fcKindWords = (S, ks) => (ks || []).map(k => ((S.kinds || {})[k] || k).toLowerCase()).join(', ');

function fcRows(S) {
  let rows = S.communities || [];
  if (fcSector) rows = rows.filter(r => r.sector === fcSector);
  if (fcShow === 'crowding') rows = rows.filter(r => ['becomes_crowded', 'more_crowded'].includes(r.reading));
  if (fcShow === 'far') rows = rows.filter(r => (r.far_from || []).length);
  if (fcShow === 'neighbours') rows = rows.filter(r => !r.in_forecast);
  return rows;
}

function renderForecast() {
  const S = D && D.srg, box = $('#gr-gap');
  $('#gr-sub').textContent = "The City's forecast of new homes in new communities, through the growth model and Growth vs amenities";
  if (!S || !S.sectors) {
    $('#gr-stats').innerHTML = ''; $('#gr-notes').textContent = '';
    box.innerHTML = '<p class="empty">The City\'s Suburban Residential Growth forecast is not available in this refresh. It is read again at the next one.</p>';
    return;
  }
  const C = S.city, y0 = S.first_forecast_year, y1 = S.last_year, sc = S.scope || {}, city = isCity();
  const secName = s => ((S.sectors.find(x => x.sector === s) || {}).name) || titleCase(s || '');
  $('#gr-stats').innerHTML = [
    [fmt(C.forecast_homes), `new homes forecast in Calgary's new communities, ${y0} to ${y1} (range ${fmt(C.forecast_homes_low)} to ${fmt(C.forecast_homes_high)})`],
    [fmt(C.forecast_people), `people in them (range ${fmt(C.forecast_people_low)} to ${fmt(C.forecast_people_high)})`],
    [fmt(C.past5_homes), `new homes in the five years before, ${y0 - 5} to ${y0 - 1}`],
    ...(city ? [] : [[fmt(sc.forecast_people), `of the forecast people in ${W()} (${fmt(sc.communities_in_forecast)} new ${sc.communities_in_forecast === 1 ? 'community' : 'communities'})`]]),
    [`${fmt(sc.residents_now)} → ${fmt(sc.residents_2030)}`, `residents of ${W()}, today and in ${y1} (${esc(S.method || popChip())})`],
  ].map(([b, s]) => `<div class="istat"><b>${b}</b><span>${s}</span></div>`).join('');

  const n = S.counts || {}, worse = (n.becomes_crowded || 0) + (n.more_crowded || 0);
  const lead = `The City forecasts ${fmt(C.forecast_homes)} new homes and ${fmt(C.forecast_people)} people in new communities from ${y0} to ${y1}, `
    + `${C.past5_homes ? (C.forecast_homes >= C.past5_homes ? 'up ' : 'down ') + fmt(Math.abs(100 * (C.forecast_homes - C.past5_homes) / C.past5_homes), 0) + '% on the five years before' : ''}. `
    + `With today's amenities, ${fmt(worse)} of the ${fmt((S.communities || []).length)} communities shown ${worse === 1 ? 'gets' : 'get'} more crowded by ${y1}`
    + `${n.becomes_crowded ? `, ${fmt(n.becomes_crowded)} of them from around Calgary's level today to below it` : ''}.`;

  // 1. the sectors: what happened and the forecast, year by year
  const sel = `<label class="field fc-sel"><span>Sector</span><select id="fc-sector"><option value="">All seven sectors</option>${S.sectors.map(s => `<option value="${esc(s.sector)}" ${fcSector === s.sector ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label>`;
  const secT = `<div class="table-wrap ac-full"><table class="data fc-sec"><thead><tr><th scope="col">Sector</th><th scope="col" class="num">Homes ${y0 - 5} to ${y0 - 1}</th><th scope="col" class="num">Forecast homes ${y0} to ${y1}</th><th scope="col">Range</th><th scope="col" class="num">Forecast people</th><th scope="col" class="num">Share of Calgary's forecast</th><th scope="col" class="num">Apartments</th><th scope="col" class="num">People per home</th></tr></thead><tbody>
    ${S.sectors.map(s => `<tr class="${fcSector === s.sector ? 'ac-cur' : ''}"><td><button type="button" class="link-btn" data-fc-sector="${esc(s.sector)}">${esc(s.name)}</button></td><td class="num">${fmt(s.past5_homes)}</td><td class="num"><b>${fmt(s.forecast_homes)}</b></td><td>${fmt(s.forecast_homes_low)} to ${fmt(s.forecast_homes_high)}</td><td class="num">${fmt(s.forecast_people)}</td><td class="num">${fmt(100 * s.share_of_forecast, 1)}%</td><td class="num">${fmt(100 * (s.apartment_share_forecast || 0), 0)}%</td><td class="num">${fmt(s.people_per_home, 2)}</td></tr>`).join('')}
    <tr class="cmp-city-row"><td><b>Calgary</b></td><td class="num"><b>${fmt(C.past5_homes)}</b></td><td class="num"><b>${fmt(C.forecast_homes)}</b></td><td>${fmt(C.forecast_homes_low)} to ${fmt(C.forecast_homes_high)}</td><td class="num"><b>${fmt(C.forecast_people)}</b></td><td class="num">100%</td><td class="num">${fmt(100 * (C.forecast_by_type.ap || 0) / C.forecast_homes, 0)}%</td><td class="num">${fmt(C.forecast_people / C.forecast_homes, 2)}</td></tr>
    </tbody></table></div>`;

  // 2. communities: today and in 2030
  const rows = fcRows(S), K = S.kinds || {};
  const cg = S.calgary_crowding || {};
  const commT = `<div class="table-wrap tall"><table class="data fc-comm"><thead><tr><th scope="col">Community</th>${city ? '<th scope="col" class="num">Ward</th>' : ''}<th scope="col">Sector</th><th scope="col">Reading</th>
      <th scope="col" class="num">Homes built, last 5 years</th><th scope="col" class="num">Forecast homes<small>${y0} to ${y1}</small></th><th scope="col" class="num">Residents<small>today → ${y1}</small></th><th scope="col" class="num">Growth</th>
      <th scope="col">Local amenities score<small>today → ${y1}, 1.00 = Calgary today</small></th><th scope="col">District facilities score<small>today → ${y1}</small></th>
      <th scope="col" class="num">Playgrounds per 1,000 children<small>within 400 m</small></th><th scope="col" class="num">Park ha per 1,000 residents<small>within 400 m</small></th><th scope="col">Falls below 0.80 by ${y1}</th><th scope="col">Far today<small>under half of homes within reach</small></th></tr></thead><tbody>
    ${rows.map(r => `<tr><td>${esc(r.name)}${r.in_forecast ? '' : ' <small class="muted">neighbour</small>'}</td>${city ? `<td class="num">${r.ward || '–'}</td>` : ''}<td>${esc(secName(r.sector))}<small class="muted"> ${esc(titleCase(r.srg || ''))}</small></td><td>${fcTag(S, r.reading)}</td>
      <td class="num">${fcN(r.recent_homes)}</td><td class="num"><b>${fcN(r.forecast_homes)}</b>${isNum(r.forecast_homes_low) && r.in_forecast ? `<small class="sc-range">${fcN(r.forecast_homes_low)} to ${fcN(r.forecast_homes_high)}</small>` : ''}</td>
      <td class="num">${fcArrow(r.residents_now, r.residents_2030, 0)}</td><td class="num">${isNum(r.growth_pct) ? signed(r.growth_pct, 0) : (r.residents_2030 ? 'new' : '–')}</td>
      <td>${fcScore((r.scores || {}).local)}</td><td>${fcScore((r.scores || {}).district)}</td>
      <td class="num">${fcArrow(((r.crowding || {}).playground || {}).now, ((r.crowding || {}).playground || {}).then)}</td><td class="num">${fcArrow(((r.crowding || {}).park || {}).now, ((r.crowding || {}).park || {}).then, 1)}</td>
      <td class="wrap">${esc(fcKindWords(S, r.falls_below)) || '<span class="dash">–</span>'}</td><td class="wrap">${esc(fcKindWords(S, r.far_from)) || '<span class="dash">–</span>'}</td></tr>`).join('')
      || `<tr><td colspan="${city ? 14 : 13}" class="empty">No communities match. ${(S.communities || []).length ? 'Choose another sector or "Every community".' : `The forecast adds no homes in ${esc(W())}: its communities are established, and none of them shares amenities with a growing one enough to change its reading.`}</td></tr>`}
    </tbody></table></div>`;
  const shows = [['', 'Every community'], ['crowding', `More crowded by ${y1} (${fmt(worse)})`], ['far', 'Far from amenities today'], ['neighbours', 'Neighbours affected']];
  const showSeg = `<div class="seg small" role="radiogroup" id="fc-show">${shows.map(([k, l]) => `<button type="button" role="radio" aria-checked="${k === fcShow}" data-v="${k}">${esc(l)}</button>`).join('')}</div>`;

  const cgT = `<div class="table-wrap ac-full"><table class="data fc-cg"><thead><tr><th scope="col">Amenity</th><th scope="col">Within</th><th scope="col">Measure</th><th scope="col" class="num">Calgary today</th><th scope="col" class="num">Calgary in ${y1}</th><th scope="col" class="num">Change</th></tr></thead><tbody>
    ${Object.entries(cg).map(([k, v]) => `<tr><td>${esc(K[k] || k)}</td><td>${fmt(v.distance_m)} m</td><td>${esc(v.unit)}</td><td class="num">${fcN(v.now, 2)}</td><td class="num"><b>${fcN(v.then, 2)}</b></td><td class="num">${isNum(v.now) && v.now ? signed(100 * (v.then - v.now) / v.now, 0) : '–'}</td></tr>`).join('')}
    </tbody></table></div>`;

  // 3. the projects the growth needs
  const P = (S.infrastructure || {}).projects || [];
  const infT = `<div class="table-wrap tall"><table class="data fc-inf"><thead><tr><th scope="col">Project</th><th scope="col">Service</th><th scope="col">Kind</th><th scope="col">Area plans it supports</th><th scope="col" class="num">Length on the map</th></tr></thead><tbody>
    ${P.map(p => `<tr><td class="wrap"><b>${esc(p.project)}</b></td><td>${esc(p.service)}</td><td>${esc(p.type)}</td><td class="wrap">${esc(p.plans.join('; '))}</td><td class="num">${isNum(p.km) ? fmt(p.km, 1) + ' km' : '–'}</td></tr>`).join('')}
    </tbody></table></div>`;

  box.innerHTML = `<div class="gap-scope ac-head fc-head"><h3>The City's forecast to ${y1}, community by community <span class="ac-est">Estimate</span></h3>
      <p class="ac-lead">${esc(lead)}</p>
      <p class="card-note">From the City's Suburban Residential Growth (SRG) forecast, ${esc(dmy(S.edition))} edition: homes "absorbed" (built and lived in) in new communities each year, ${S.first_year} to ${y0 - 1}, and the City's forecast for ${y0} to ${y1}. The range is the City's own low and high yearly averages, by kind of home.</p></div>
    <div class="gap-scope"><div class="fc-chart-head"><h3>New homes each year${fcSector ? ', ' + esc(secName(fcSector)) + ' sector' : ', all sectors'}</h3>${sel}</div>
      <p class="fc-key"><span class="fc-sw fc-sw-past" aria-hidden="true"></span>Built and lived in <span class="fc-sw fc-sw-fc" aria-hidden="true"></span>City forecast</p>
      <div class="fc-chart"><canvas id="fc-canvas" role="img" aria-label="New homes in new communities each year, ${S.first_year} to ${y1}, the last five years the City's forecast"></canvas></div>
      ${secT}<p class="card-note">Homes and people as the City publishes them, sector by sector (e7ib-v9n4). People per home is the forecast's people over its homes: the City's own figure for each kind of home. The Centre sector has no new communities, so no rows.</p></div>
    <div class="gap-scope"><h3>Who grows, and what it does to amenities nearby</h3>
      <p class="ac-lead">Each sector's forecast is shared among its new communities by the homes built in each one in the last five years. Residents in ${y1} are today's (${esc(S.method || popChip())}) plus that share of the forecast people; Growth vs amenities is then worked out again with today's amenities. Scores are against Calgary <b>today</b>, so a score falls only where crowding itself gets worse.</p>
      <div class="ac-row">${showSeg}</div>
      ${commT}
      <p class="card-note"><b>Readings</b> (local amenities score: playgrounds, parks, transit stops and community centres): ${fcTag(S, 'becomes_crowded')} from around Calgary's level or above to below 0.80; ${fcTag(S, 'more_crowded')} below 0.80 today and a lower band, or 10% lower, by ${y1}; ${fcTag(S, 'crowded')} below 0.80 today and about the same; ${fcTag(S, 'far_growing')} under half of homes within reach of a playground, park or transit stop and growing 10% or more; ${fcTag(S, 'keeps_up')} none of these. "Neighbour": a community the forecast adds no homes to, whose playgrounds, parks or centres are shared with growing ones enough to change its band. <button type="button" class="link-btn small" data-method="growth_forecast">How the forecast is worked out</button></p>
      <h4 class="ac-h4">Calgary's amenities per person, today and in ${y1}</h4>${cgT}
      <p class="card-note">Calgary's figure in ${y1} counts only the forecast's new-community growth; growth in established communities is not in the City's forecast.</p></div>
    <div class="gap-scope"><h3>Projects the new homes need</h3>
      <p class="card-sub">${fmt(P.length)} growth-related capital projects the City lists for future suburban homes (${Object.entries((S.infrastructure || {}).by_service || {}).map(([k, v]) => `${esc(k.toLowerCase())} ${fmt(v)}`).join(', ')}), each with the area structure plans it supports. Stage, cost and timing are not in this dataset.</p>
      ${infT}</div>`;
  $('#gr-notes').innerHTML = `What this cannot show: ${(S.limits || []).map(esc).join(' ')} Sources: City of Calgary open data: <button class="link-btn small" data-open="https://data.calgary.ca/d/e7ib-v9n4">Suburban Residential Growth (SRG) Forecast (e7ib-v9n4)</button>, <button class="link-btn small" data-open="https://data.calgary.ca/d/szyj-edpn">SRG Policy Infrastructure Lines (szyj-edpn)</button>, <button class="link-btn small" data-open="https://data.calgary.ca/d/surr-xmvs">Community District Boundaries (sector and SRG class, surr-xmvs)</button>; residents, homes and amenities as on the rest of Growth vs amenities.`;

  $('#fc-sector').addEventListener('change', e => { fcSector = e.target.value; renderForecast(); });
  fcDrawChart(S);
}

function fcDrawChart(S) {
  const el = $('#fc-canvas');
  if (fcChart) { fcChart.destroy(); fcChart = null; }
  if (!el || typeof Chart === 'undefined') return;
  const src = fcSector ? (S.sectors.find(s => s.sector === fcSector) || {}).series : S.city.series;
  if (!src) return;
  const bar = cssv('--chart-bar');
  const hex = /^#?([0-9a-f]{6})$/i.exec(String(bar).trim());
  const soft = hex ? `rgba(${parseInt(hex[1].slice(0, 2), 16)},${parseInt(hex[1].slice(2, 4), 16)},${parseInt(hex[1].slice(4, 6), 16)},0.35)` : bar;
  fcChart = new Chart(el, {
    type: 'bar',
    data: { labels: src.map(x => String(x.year)), datasets: [{ label: 'New homes', data: src.map(x => Math.round(x.homes || 0)),
      backgroundColor: src.map(x => x.forecast ? soft : bar), borderColor: bar, borderWidth: src.map(x => x.forecast ? 1.5 : 0),
      borderRadius: 4, borderSkipped: 'bottom', barPercentage: .78, categoryPercentage: .9 }] },
    options: { responsive: true, maintainAspectRatio: false, animation: false,
      plugins: { legend: { display: false },
        tooltip: { callbacks: {
          title: it => { const x = src[it[0].dataIndex]; return `${x.year}${x.forecast ? ' (City forecast)' : ''}`; },
          label: it => { const x = src[it.dataIndex]; return `${fmt(x.homes)} homes, ${fmt(x.people)} people`; },
          afterLabel: it => { const x = src[it.dataIndex]; return Object.entries(S.types).map(([k, l]) => `${l}: ${isNum(x[k + '_homes']) ? fmt(x[k + '_homes']) : 'counted with the others'}`).join('\n'); } } } },
      scales: { y: { beginAtZero: true, grid: { color: cssv('--chart-grid') }, border: { display: false }, ticks: { callback: v => fmt(v) }, title: { display: true, text: 'New homes' } },
        x: { grid: { display: false } } } }
  });
}

document.addEventListener('click', e => {
  const s = e.target.closest('[data-fc-sector]');
  if (s) { fcSector = fcSector === s.dataset.fcSector ? '' : s.dataset.fcSector; renderForecast(); return; }
  const v = e.target.closest('#fc-show [data-v]');
  if (v) { fcShow = v.dataset.v; renderForecast(); }
});

// the rows for "Save this list"
function forecastExport() {
  const S = D && D.srg;
  if (!S) return null;
  const y1 = S.last_year;
  return {
    name: `Growth forecast to ${y1}, ${W()}`,
    cols: ['Community', 'Ward', 'Sector', 'SRG class', 'Reading', 'Homes built in the last 5 years', 'Share of the sector forecast',
      `Forecast homes ${S.first_forecast_year}-${y1}`, 'Forecast homes, low', 'Forecast homes, high', 'Forecast people', 'Residents today', `Residents ${y1}`, 'Growth %',
      'Children 0-14 today', `Children 0-14 ${y1}`, 'Local amenities score today', `Local amenities score ${y1}`, 'District facilities score today', `District facilities score ${y1}`,
      ...Object.keys(S.kinds || {}).flatMap(k => [`${S.kinds[k]} crowding today`, `${S.kinds[k]} crowding ${y1}`]), `Falls below 0.80 by ${y1}`, 'Far from today'],
    rows: fcRows(S).map(r => [r.name, r.ward || '', titleCase(r.sector || ''), titleCase(r.srg || ''), (S.readings || {})[r.reading] || r.reading, r.recent_homes ?? '', r.share_of_sector ?? '',
      r.forecast_homes, r.forecast_homes_low ?? '', r.forecast_homes_high ?? '', r.forecast_people, r.residents_now, r.residents_2030, r.growth_pct ?? '', r.children_now, r.children_2030,
      ((r.scores || {}).local || {}).now ?? '', ((r.scores || {}).local || {}).then ?? '', ((r.scores || {}).district || {}).now ?? '', ((r.scores || {}).district || {}).then ?? '',
      ...Object.keys(S.kinds || {}).flatMap(k => [((r.crowding || {})[k] || {}).now ?? '', ((r.crowding || {})[k] || {}).then ?? '']),
      fcKindWords(S, r.falls_below), fcKindWords(S, r.far_from)]),
  };
}
