/* Explore Calgary: the trip planner, the experience map, collections, neighbourhoods, what's on, Beyond Calgary and
   all from one city file (data/<city>.json, written by web/explore.py from the places the site checks).
   The planner works by rules on that data, in the browser: it never invents a place, a price or an opening hour.
   Distances are straight lines between places; travel times are estimates at typical speeds and say so. */
'use strict';
(() => {
  const CITY = (new URLSearchParams(location.search).get('city') || 'calgary').replace(/[^a-z-]/g, '');
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
                  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private window */ } } };
  // a street map with roads, rivers and names (the plain dark canvas showed almost nothing at city scale)
  const TILE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const TILE2 = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
  const ATTR = 'Map © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> · Calgary Insight';
  const CAT_COL = { attractions: '#f2a33a', parks: '#9bc47a', views: '#5cc8c2', walks: '#7fb0e0', museums: '#c79bf2', food: '#f28b5a', shopping: '#e8c86a',
                    night: '#e2738c', family: '#f5d76e', history: '#d9a679', culture: '#b48cf0', winter: '#a8d8f0', photo: '#ffffff' };
  const DAY_COL = ['#f2a33a', '#5cc8c2', '#e2738c', '#9bc47a', '#c79bf2', '#7fb0e0', '#f5d76e'];
  const COST = { free: ['No entry charge', 'free'], paid: ['Paid entry: see the official site', ''], varies: ['Depends on the event', ''] };
  const FIT = { warm: 'warm days', cool: 'cool days', cold: 'cold days', wet: 'rain or snow' };
  let D = null, P = {}, tab = 'plan', maps = {}, detailFor = null;

  const km = (a, b) => { const r = Math.PI / 180, la1 = a[0] * r, la2 = b[0] * r, dl = (b[1] - a[1]) * r, dp = la2 - la1;
    return 2 * 6371 * Math.asin(Math.sqrt(Math.sin(dp / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dl / 2) ** 2)); };
  const ll = p => [p.lat, p.lon];
  // typical speeds over straight-line distance, with a detour factor: an estimate, labelled as one
  const MODES = { walking: { label: 'Walking', kmh: 4.5, detour: 1.3, wait: 0, reach: 2.6 }, cycling: { label: 'Cycling', kmh: 14, detour: 1.25, wait: 0, reach: 7 },
                  transit: { label: 'Public transit', kmh: 20, detour: 1.35, wait: 10, reach: 9 }, driving: { label: 'Driving', kmh: 32, detour: 1.3, wait: 5, reach: 30 } };
  const legMin = (d, m) => d < 0.15 ? 2 : Math.round(d * MODES[m].detour / MODES[m].kmh * 60 + MODES[m].wait);
  const mins = m => m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}` : `${m} min`;

  // ---------------------------------------------------------------- load
  async function load() {
    try {
      const r = await fetch(`data/${CITY}.json`, { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      D = await r.json();
    } catch (e) {
      $('#main').innerHTML = `<p class="empty">The places could not be loaded just now (${esc(e.message)}). The <a href="../">Visit Calgary guides</a> are still available.</p>`;
      return;
    }
    D.places.forEach(p => { P[p.id] = p; });
    foot();
    window.addEventListener('hashchange', route);
    route();
  }

  function route() {
    const h = (location.hash || '#plan').slice(1).split('/');
    tab = ['plan', 'map', 'collections', 'neighbourhoods', 'whatson', 'beyond'].includes(h[0]) ? h[0] : 'plan';
    document.querySelectorAll('#tabs a').forEach(a => a.toggleAttribute('aria-current', a.dataset.tab === tab));
    Object.values(maps).forEach(m => m.remove()); maps = {};
    ({ plan: viewPlan, map: viewMap, collections: viewCollections, neighbourhoods: viewAreas, whatson: viewWhatsOn, beyond: viewBeyond })[tab](h[1]);
  }

  function baseMap(el, centre, zoom) {
    const m = L.map(el, { scrollWheelZoom: false, zoomControl: true }).setView(centre || D.city.centre, zoom || D.city.zoom);
    const base = L.tileLayer(TILE, { maxZoom: 19, attribution: ATTR }).addTo(m);
    let bad = 0;                   // OpenStreetMap unreachable: Esri's street map instead
    base.on('tileerror', () => { if (++bad === 4) { m.removeLayer(base); L.tileLayer(TILE2, { maxNativeZoom: 18, maxZoom: 19, attribution: 'Tiles © Esri · Calgary Insight' }).addTo(m).bringToBack(); } });
    m.on('click focus', () => m.scrollWheelZoom.enable());
    setTimeout(() => m.invalidateSize(), 50);
    return m;
  }
  const pinIcon = (col, out) => L.divIcon({ className: '', html: `<div class="pin${out ? ' out' : ''}" style="background:${col}"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] });
  const numIcon = (n, col) => L.divIcon({ className: '', html: `<div class="pinnum" style="background:${col}">${n}</div>`, iconSize: [24, 24], iconAnchor: [12, 12] });

  // ---------------------------------------------------------------- the trip planner
  const DEF = { days: 2, interests: [], budget: 'moderate', style: 'balanced', transport: 'transit', season: seasonNow() };
  function seasonNow() { const m = new Date().getMonth() + 1; return m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 10 ? 'autumn' : m >= 3 && m <= 5 ? 'spring' : 'winter'; }
  let prefs = Object.assign({}, DEF, store.get(`explore-prefs-${CITY}`, {}));
  let trip = store.get(`explore-trip-${CITY}`, null), seed = 1;

  function seg(name, opts, multi) {
    return `<div class="${multi ? 'chips' : 'seg'}" role="group" data-f="${name}">${opts.map(([v, t]) => {
      const on = multi ? prefs[name].includes(v) : String(prefs[name]) === String(v);
      return `<button type="button" data-v="${v}" aria-pressed="${on}">${esc(t)}</button>`; }).join('')}</div>`;
  }
  function viewPlan() {
    const I = D.interests.map(i => [i, i[0].toUpperCase() + i.slice(1)]);
    $('#main').innerHTML = `<h2 class="sec">Plan a trip</h2>
      <p class="lead">Tell us how long you have and what you like; the planner builds days from places Calgary Insight has checked, grouped so you spend your time there, not getting there. Prices and hours change: each place links to its official page.</p>
      <div class="form">
        <div class="field"><span>How long</span>${seg('days', [[1, '1 day'], [2, '2 days'], [3, '3 days'], [5, '5 days'], [7, '7 days']])}</div>
        <div class="field"><span>What you like (any number)</span>${seg('interests', I, true)}</div>
        <div class="cols">
          <div class="field"><span>Budget</span>${seg('budget', [['free', 'No cost'], ['low', 'Low-cost'], ['moderate', 'Moderate'], ['premium', 'Premium']])}</div>
          <div class="field"><span>Pace</span>${seg('style', [['relaxed', 'Relaxed'], ['balanced', 'Balanced'], ['packed', 'Packed']])}</div>
        </div>
        <div class="cols">
          <div class="field"><span>Getting around</span>${seg('transport', [['walking', 'Walking'], ['transit', 'Transit'], ['cycling', 'Cycling'], ['driving', 'Driving']])}</div>
          <div class="field"><span>Season</span>${seg('season', [['spring', 'Spring'], ['summer', 'Summer'], ['autumn', 'Autumn'], ['winter', 'Winter']])}</div>
        </div>
        <div class="go"><button class="btn" id="build">${trip ? 'Build a new plan' : 'Build my plan'}</button>${trip ? '<button class="btn ghost" id="again">Shuffle</button>' : ''}<span class="note">Private: your plan is saved in this browser only.</span></div>
      </div>
      <div id="tripout"></div>`;
    $('#main').querySelectorAll('[data-f]').forEach(g => g.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const f = g.dataset.f, multi = g.classList.contains('chips');
      if (multi) { const v = b.dataset.v; prefs[f] = prefs[f].includes(v) ? prefs[f].filter(x => x !== v) : prefs[f].concat(v); }
      else prefs[f] = f === 'days' ? +b.dataset.v : b.dataset.v;
      store.set(`explore-prefs-${CITY}`, prefs);
      g.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', multi ? prefs[f].includes(x.dataset.v) : String(prefs[f]) === x.dataset.v));
    }));
    $('#build').addEventListener('click', () => { seed = 1; makeTrip(); });
    const ag = $('#again'); if (ag) ag.addEventListener('click', () => { seed++; makeTrip(); });
    if (trip) drawTrip();
  }

  function seasonOk(p, s) {
    if (p.closed) return false;
    if (s === 'winter') return p.indoor || p.winter || p.fit.includes('cold');
    if (s === 'summer') return p.fit.includes('warm') || p.indoor;
    return p.fit.includes('cool') || p.indoor;
  }
  function score(p) {
    let s = 1 + 2.5 * p.interests.filter(i => prefs.interests.includes(i)).length;
    if (!prefs.interests.length) s += p.categories.includes('attractions') ? 1.5 : 0.5;
    if (prefs.budget === 'low' && p.cost === 'free') s += 1;
    if (prefs.budget === 'premium' && p.cost === 'paid') s += 0.5;
    if (prefs.interests.includes('nightlife') && p.evening) s += 1;
    // a small, repeatable shuffle so "Shuffle" offers a different plan of similar quality
    const h = [...(p.id + seed)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);
    return s + (h % 100) / 140;
  }
  const BUDGET_PAID = { free: 0, low: 1, moderate: 2, premium: 9 };
  const PACE = { relaxed: { stops: 3, min: 300 }, balanced: { stops: 4, min: 420 }, packed: { stops: 6, min: 560 } };

  function makeTrip() {
    const pace = PACE[prefs.style], mode = prefs.transport, reach = MODES[mode].reach;
    let pool = D.places.filter(p => seasonOk(p, prefs.season) && (prefs.budget !== 'free' || p.cost === 'free'))
      .map(p => ({ p, s: score(p) })).sort((a, b) => b.s - a.s);
    // walking and cycling stay central: drop places far from the centre unless they are strongly wanted
    if (mode === 'walking' || mode === 'cycling') pool = pool.filter(x => km(ll(x.p), D.city.centre) <= (mode === 'walking' ? 4 : 12) || x.s > 6);
    const used = new Set(), days = [];
    // a day out of town when there is time for one and the pace allows
    // (not on a free budget: the parks need a pass and the trips a car, a tour or a shuttle)
    const beyondDays = prefs.budget === 'free' ? 0 : prefs.days >= 3 ? (prefs.days >= 5 ? 2 : 1) : 0;
    for (let d = 0; d < prefs.days - beyondDays; d++) {
      const seedP = pool.find(x => !used.has(x.p.id));
      if (!seedP) break;
      const day = { stops: [seedP.p.id] }; used.add(seedP.p.id);
      let total = seedP.p.minutes, paid = seedP.p.cost === 'paid' ? 1 : 0, here = ll(seedP.p);
      while (day.stops.length < pace.stops) {
        const cand = pool.filter(x => !used.has(x.p.id) && km(here, ll(x.p)) <= reach && !(x.p.cost === 'paid' && paid >= BUDGET_PAID[prefs.budget]))
          .map(x => ({ ...x, d: km(here, ll(x.p)) })).sort((a, b) => (b.s - b.d * 0.8) - (a.s - a.d * 0.8))[0];
        if (!cand) break;
        const add = cand.p.minutes + legMin(cand.d, mode);
        if (total + add > pace.min) break;
        day.stops.push(cand.p.id); used.add(cand.p.id); total += add; here = ll(cand.p);
        if (cand.p.cost === 'paid') paid++;
      }
      // the evening place goes last
      day.stops.sort((a, b) => (P[a].evening && prefs.interests.includes('nightlife') ? 1 : 0) - (P[b].evening && prefs.interests.includes('nightlife') ? 1 : 0));
      days.push(day);
    }
    const bp = beyondPick(beyondDays);
    bp.forEach(b => days.push({ beyond: b }));
    trip = { prefs: { ...prefs }, days, made: new Date().toISOString().slice(0, 10) };
    store.set(`explore-trip-${CITY}`, trip);
    viewPlan();
    $('#tripout').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function beyondPick(n) {
    if (!n) return [];
    const B = D.beyond.places;
    const wants = prefs.interests;
    const order = [];
    if (prefs.season === 'winter') order.push('Banff (town)', 'Canmore', 'Royal Tyrrell Museum (Drumheller)');
    else {
      if (!wants.length || wants.some(w => ['nature', 'adventure', 'photography'].includes(w))) order.push('Banff (town)', 'Kananaskis Village', 'Lake Louise (lake)', 'Canmore');
      if (wants.some(w => ['history', 'family', 'culture'].includes(w))) order.push('Royal Tyrrell Museum (Drumheller)', 'Head-Smashed-In Buffalo Jump', 'Blackfoot Crossing Historical Park');
      order.push('Banff (town)', 'Royal Tyrrell Museum (Drumheller)', 'Canmore');
    }
    const seen = new Set(), out = [];
    for (const name of order) { const p = B.find(x => x.place === name); if (p && !seen.has(name)) { seen.add(name); out.push(name); } if (out.length >= n) break; }
    return out;
  }

  function drawTrip() {
    const t = trip, mode = t.prefs.transport, out = $('#tripout');
    if (!t.days.length) { out.innerHTML = '<p class="empty">No places match all of those choices. Try another season, budget or way of getting around.</p>'; return; }
    const B = n => D.beyond.places.find(x => x.place === n);
    const html = t.days.map((d, i) => {
      const col = DAY_COL[i % DAY_COL.length];
      if (d.beyond) {
        const b = B(d.beyond) || { drive_minutes: 0, road_km: '?' };
        return `<section class="day"><header><h3>Day ${i + 1}: ${esc(d.beyond)}</h3><small>${mode === 'driving' ? `about ${mins(b.drive_minutes)} each way by car (estimate)` : 'by tour or shuttle: no CTrain or city bus goes there'}</small></header>
          <div class="stop"><div class="num" style="background:${col}">${i + 1}</div><div><b data-beyond="${esc(d.beyond)}">${esc(d.beyond)}</b><p>${esc(b.what || '')}</p>
          ${b.season ? `<p>${esc(b.season)}</p>` : ''}<p><span class="badge out">Outside Calgary</span>${b.unesco_world_heritage ? `<span class="badge unesco">UNESCO World Heritage</span>` : ''}<span class="badge est">${b.road_km} km by road</span></p></div><span></span></div></section>`;
      }
      let total = 0;
      const rows = d.stops.map((id, j) => {
        const p = P[id]; if (!p) return '';
        let leg = '';
        if (j > 0) { const dist = km(ll(P[d.stops[j - 1]]), ll(p)); const walk = (mode === 'transit' || mode === 'driving') && dist < 1.2;
          const m = legMin(dist, walk ? 'walking' : mode); total += m;
          leg = `<div class="leg">↓ ${dist.toFixed(1)} km straight line · about ${mins(m)} ${walk ? 'on foot' : MODES[mode].label.toLowerCase()} (estimate)</div>`; }
        total += p.minutes;
        return `${leg}<div class="stop"><div class="num" style="background:${col}">${j + 1}</div><div><b data-id="${p.id}">${esc(p.name)}</b>
          <p>${esc(p.what || '')}</p><p><span class="badge${p.cost === 'free' ? ' free' : ''}">${COST[p.cost][0]}</span><span class="badge est">~${mins(p.minutes)} suggested</span>${p.evening && j === d.stops.length - 1 ? '<span class="badge">Good in the evening</span>' : ''}</p></div>
          <button class="x" data-rm="${i}:${j}" aria-label="Remove ${esc(p.name)}">×</button></div>`;
      }).join('');
      return `<section class="day"><header><h3>Day ${i + 1}</h3><small>${d.stops.length} places · about ${mins(total)} with travel (estimate)</small></header>${rows}</section>`;
    }).join('');
    out.innerHTML = `<div class="trip"><div><div class="go" style="margin-bottom:1rem"><button class="btn ghost small" id="copy">Copy as text</button><button class="btn ghost small" id="clear">Clear plan</button>
        <span class="note">Planned ${esc(t.made)} for ${esc(t.prefs.season)}, ${esc(MODES[mode].label.toLowerCase())}.</span></div>${html}
        <p class="note">Travel times are estimates from straight-line distance at typical speeds; for transit use <a href="https://www.calgarytransit.com/" rel="noopener">Calgary Transit's trip planner</a>. Suggested times are a guide, not opening hours.</p></div>
      <div class="mapbox"><div class="map" id="tripmap"></div></div></div>`;
    const m = maps.trip = baseMap($('#tripmap'));
    const pts = [];
    t.days.forEach((d, i) => {
      const col = DAY_COL[i % DAY_COL.length];
      if (d.beyond) { const b = B(d.beyond); if (b && b.lat) L.marker([b.lat, b.lon], { icon: numIcon('D' + (i + 1), col) }).addTo(m).bindTooltip(`Day ${i + 1}: ${d.beyond}`); return; }
      const line = d.stops.map(id => ll(P[id]));
      L.polyline(line, { color: col, weight: 2, opacity: .7, dashArray: '4 6' }).addTo(m);
      d.stops.forEach((id, j) => { const p = P[id]; L.marker(ll(p), { icon: numIcon(j + 1, col) }).addTo(m).on('click', () => detail(p)).bindTooltip(`Day ${i + 1} · ${p.name}`); pts.push(ll(p)); });
    });
    if (pts.length) m.fitBounds(pts, { padding: [30, 30], maxZoom: 14 });
    out.querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', () => detail(P[b.dataset.id])));
    out.querySelectorAll('[data-beyond]').forEach(b => b.addEventListener('click', () => beyondDetail(B(b.dataset.beyond))));
    out.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => {
      const [i, j] = b.dataset.rm.split(':').map(Number); trip.days[i].stops.splice(j, 1);
      if (!trip.days[i].stops.length) trip.days.splice(i, 1);
      store.set(`explore-trip-${CITY}`, trip); drawTrip();
    }));
    $('#copy').addEventListener('click', async () => {
      const txt = trip.days.map((d, i) => `Day ${i + 1}${d.beyond ? ': ' + d.beyond : ''}\n` + (d.stops || []).map((id, j) => `  ${j + 1}. ${P[id].name}${P[id].url ? ' (' + P[id].url + ')' : ''}`).join('\n')).join('\n\n')
        + '\n\nPlanned with Explore Calgary, calgaryinsight.ca/visit/explore/';
      try { await navigator.clipboard.writeText(txt); $('#copy').textContent = 'Copied'; } catch (e) { prompt('Copy your plan:', txt); }
    });
    $('#clear').addEventListener('click', () => { trip = null; store.set(`explore-trip-${CITY}`, null); viewPlan(); });
  }
  function addToTrip(p) {
    if (!trip) { trip = { prefs: { ...prefs }, days: [{ stops: [] }], made: new Date().toISOString().slice(0, 10) }; }
    let d = trip.days.find(x => x.stops && x.stops.length < 6);
    if (!d) { d = { stops: [] }; trip.days.push(d); }
    if (!trip.days.some(x => (x.stops || []).includes(p.id))) d.stops.push(p.id);
    store.set(`explore-trip-${CITY}`, trip);
  }

  // ---------------------------------------------------------------- the experience map
  let mapCats = new Set(), mapQ = '', showBeyond = false, showStations = false;
  function viewMap() {
    $('#main').innerHTML = `<h2 class="sec">The map</h2><p class="lead">Every place Calgary Insight has checked. Pick categories (any number), search, and tap a place for what it offers and its official page.</p>
      <div class="chips" id="cats" style="margin-bottom:.8rem">${D.categories.map(c => `<button type="button" data-c="${c.id}" aria-pressed="${mapCats.has(c.id)}"><span style="color:${CAT_COL[c.id]}">●</span> ${esc(c.label)}</button>`).join('')}</div>
      <div class="mapbar"><input type="search" id="q" placeholder="Search places" value="${esc(mapQ)}" aria-label="Search places">
        <label class="note"><input type="checkbox" id="sb" ${showBeyond ? 'checked' : ''}> Beyond Calgary</label>
        <label class="note"><input type="checkbox" id="ss" ${showStations ? 'checked' : ''}> CTrain stations</label><span class="count" id="cnt"></span></div>
      <div class="map" id="bigmap"></div><div class="list" id="maplist" style="margin-top:1rem"></div>`;
    const m = maps.big = baseMap($('#bigmap'));
    const layer = L.layerGroup().addTo(m);
    const draw = () => {
      layer.clearLayers();
      const q = mapQ.trim().toLowerCase();
      const ps = D.places.filter(p => (!mapCats.size || p.categories.some(c => mapCats.has(c))) && (!q || (p.name + ' ' + (p.what || '') + ' ' + (p.area || '')).toLowerCase().includes(q)));
      ps.forEach(p => L.marker(ll(p), { icon: pinIcon(CAT_COL[p.categories.find(c => !mapCats.size || mapCats.has(c)) || p.categories[0]]), title: p.name }).addTo(layer).on('click', () => detail(p)));
      let nb = 0;
      if (showBeyond) D.beyond.places.filter(b => b.lat && (!q || b.place.toLowerCase().includes(q))).forEach(b => { nb++; L.marker([b.lat, b.lon], { icon: pinIcon('#5cc8c2', true), title: b.place }).addTo(layer).on('click', () => beyondDetail(b)); });
      if (showStations) D.stations.forEach(s => L.marker([s.lat, s.lon], { icon: L.divIcon({ className: '', html: '<div class="station"></div>', iconSize: [8, 8] }), title: s.name + ' CTrain' }).addTo(layer).bindTooltip(s.name + ' (CTrain)'));
      $('#cnt').textContent = `${ps.length} place${ps.length === 1 ? '' : 's'}${showBeyond ? ` + ${nb} beyond Calgary` : ''}`;
      $('#maplist').innerHTML = ps.length ? ps.slice(0, 60).map(p => `<div class="row"><div><b data-id="${p.id}">${esc(p.name)}</b><p>${esc(p.kind || '')} · ${esc(p.area || '')}</p></div><span class="badge${p.cost === 'free' ? ' free' : ''}">${p.cost === 'free' ? 'No charge' : p.cost === 'paid' ? 'Paid' : 'Varies'}</span></div>`).join('')
        : '<p class="empty">Nothing matches. Clear a category or the search.</p>';
      $('#maplist').querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', () => detail(P[b.dataset.id])));
      if (showBeyond && nb) m.fitBounds(D.beyond.places.filter(b => b.lat).map(b => [b.lat, b.lon]).concat([D.city.centre]), { padding: [20, 20] });
    };
    $('#cats').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const c = b.dataset.c;
      mapCats.has(c) ? mapCats.delete(c) : mapCats.add(c); b.setAttribute('aria-pressed', mapCats.has(c)); draw(); });
    $('#q').addEventListener('input', e => { mapQ = e.target.value; draw(); });
    $('#sb').addEventListener('change', e => { showBeyond = e.target.checked; if (!showBeyond) m.setView(D.city.centre, D.city.zoom); draw(); });
    $('#ss').addEventListener('change', e => { showStations = e.target.checked; draw(); });
    draw();
  }

  // ---------------------------------------------------------------- collections
  function viewCollections(id) {
    const c = id && D.collections.find(x => x.id === id);
    if (c) {
      const ps = c.places.map(i => P[i]).filter(Boolean);
      const bs = (c.beyond || []).map(n => D.beyond.places.find(x => x.place === n)).filter(Boolean);
      $('#main').innerHTML = `<p><a href="#collections">← All collections</a></p><h2 class="sec">${esc(c.title)}</h2><p class="lead">${esc(c.blurb)}</p>
        <div class="split"><div class="list">${ps.map((p, i) => `<div class="row"><div><b data-id="${p.id}">${i + 1}. ${esc(p.name)}</b><p>${esc(p.what || '')}</p></div><span class="badge${p.cost === 'free' ? ' free' : ''}">${p.cost === 'free' ? 'No charge' : p.cost === 'paid' ? 'Paid' : 'Varies'}</span></div>`).join('')}
          ${bs.map(b => `<div class="row"><div><b data-beyond="${esc(b.place)}">${esc(b.place)}</b><p>${esc(b.what)}</p></div><span class="badge out">${mins(b.drive_minutes)} drive</span></div>`).join('')}
          ${c.tip ? `<p class="note">${esc(c.tip)}</p>` : ''}<div class="go"><button class="btn" id="planthis">Plan days from this collection</button>${c.guide ? `<a class="btn ghost" href="../${esc(c.guide)}/">Read the guide</a>` : ''}</div></div>
          <div><div class="map" id="cmap"></div></div></div>`;
      const m = maps.c = baseMap($('#cmap'));
      const pts = ps.map(p => { L.marker(ll(p), { icon: numIcon(ps.indexOf(p) + 1, '#f2a33a') }).addTo(m).on('click', () => detail(p)); return ll(p); });
      bs.forEach(b => { L.marker([b.lat, b.lon], { icon: pinIcon('#5cc8c2', true) }).addTo(m).on('click', () => beyondDetail(b)); pts.push([b.lat, b.lon]); });
      if (pts.length) m.fitBounds(pts, { padding: [30, 30], maxZoom: 14 });
      $('#main').querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', () => detail(P[b.dataset.id])));
      $('#main').querySelectorAll('[data-beyond]').forEach(b => b.addEventListener('click', () => beyondDetail(D.beyond.places.find(x => x.place === b.dataset.beyond))));
      $('#planthis').addEventListener('click', () => {
        const per = PACE[prefs.style].stops, days = [];
        const open = ps.filter(p => !p.closed);
        // nearest-neighbour order, then split into days of the chosen pace
        const order = []; let left = open.slice(), here = D.city.centre;
        while (left.length) { left.sort((a, b) => km(here, ll(a)) - km(here, ll(b))); const n = left.shift(); order.push(n.id); here = ll(n); }
        for (let i = 0; i < order.length; i += per) days.push({ stops: order.slice(i, i + per) });
        bs.forEach(b => days.push({ beyond: b.place }));
        trip = { prefs: { ...prefs, days: days.length }, days, made: new Date().toISOString().slice(0, 10), from: c.title };
        store.set(`explore-trip-${CITY}`, trip); location.hash = '#plan';
      });
      return;
    }
    $('#main').innerHTML = `<h2 class="sec">Collections</h2><p class="lead">Ways into the city, each made of real places with their official pages. Open one to see it on the map or turn it into a plan.</p>
      <div class="grid">${D.collections.map(c => { const ph = c.places.map(i => P[i]).find(p => p && p.photo);
        return `<article class="card">${ph ? `<div class="ph"><img src="../img/${esc(ph.photo)}.jpg" alt="" loading="lazy"></div>` : ''}
        <div class="bd"><h3>${esc(c.title)}</h3><p>${esc(c.blurb)}</p><p class="note">${c.places.length + (c.beyond || []).length} places</p>
        <div class="act"><a class="btn small" href="#collections/${c.id}">Open</a></div></div></article>`; }).join('')}</div>`;
  }

  // ---------------------------------------------------------------- neighbourhoods
  function viewAreas(sel) {
    const A = D.neighbourhoods, a = sel && A.find(x => slug(x.area) === sel);
    $('#main').innerHTML = `<h2 class="sec">Neighbourhoods</h2><p class="lead">Calgary's visitor districts: what is there, the CTrain stations nearby, and roughly how long to give each one.</p>
      <div class="split"><div class="list">${A.map(x => `<div class="row" ${a === x ? 'style="border-color:var(--chinook)"' : ''}><div><b data-a="${slug(x.area)}">${esc(x.area)}</b><p>${esc(x.about)}</p>
        <p>${x.places.length} places · ${x.free} at no charge · ${x.ctrain.length ? 'CTrain: ' + esc(x.ctrain.slice(0, 4).join(', ')) : 'Best by car or bus'}</p></div><span class="t">${esc(x.time)}</span></div>`).join('')}
        <p class="note">Time to give each district is a rough guide from the suggested time at its places.</p></div>
        <div><div class="map" id="amap"></div><div class="list" id="alist" style="margin-top:.8rem"></div></div></div>`;
    const m = maps.a = baseMap($('#amap'));
    const show = x => {
      m.eachLayer(l => { if (l instanceof L.Marker) m.removeLayer(l); });
      const ps = x.places.map(i => P[i]);
      ps.forEach(p => L.marker(ll(p), { icon: pinIcon(CAT_COL[p.categories[0]]) }).addTo(m).on('click', () => detail(p)).bindTooltip(p.name));
      D.stations.filter(s => x.ctrain.includes(s.name)).forEach(s => L.marker([s.lat, s.lon], { icon: L.divIcon({ className: '', html: '<div class="station"></div>', iconSize: [8, 8] }) }).addTo(m).bindTooltip(s.name + ' (CTrain)'));
      m.fitBounds(ps.map(ll), { padding: [40, 40], maxZoom: 15 });
      $('#alist').innerHTML = ps.map(p => `<div class="row"><div><b data-id="${p.id}">${esc(p.name)}</b><p>${esc(p.kind || '')}</p></div><span class="badge${p.cost === 'free' ? ' free' : ''}">${p.cost === 'free' ? 'No charge' : p.cost === 'paid' ? 'Paid' : 'Varies'}</span></div>`).join('');
      $('#alist').querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', () => detail(P[b.dataset.id])));
    };
    show(a || A[0]);
    $('#main').querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => { location.hash = '#neighbourhoods/' + b.dataset.a; }));
  }
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // ---------------------------------------------------------------- what's on
  function viewWhatsOn() {
    const now = new Date().getMonth() + 1;
    const ms = D.months.slice().sort((a, b) => ((a.n - now + 12) % 12) - ((b.n - now + 12) % 12));
    $('#main').innerHTML = `<h2 class="sec">What's on</h2><p class="lead">Calgary's annual events by the month they are usually held, starting this month. Dates move from year to year: confirm with the organiser before you plan around one.</p>
      ${ms.map(m => `<section class="month${m.n === now ? ' now' : ''}"><h3>${esc(m.name)}${m.n === now ? ' · this month' : ''}</h3><p class="note">${esc(m.about || '')}</p>
        <ul>${(m.events || []).map(e => `<li><b>${e.url ? `<a href="${esc(e.url)}" rel="noopener">${esc(e.name)} ↗</a>` : esc(e.name)}</b> ${esc(e.what || '')} <span class="badge est">Usually held in ${esc(m.name)}</span></li>`).join('')}</ul></section>`).join('')}
      <p class="note">For this week's Calgary stories, see <a href="../../?view=citynews">Calgary News</a>. Events here are recurring; Calgary Insight lists a dated event only when the organiser has published its date.</p>`;
  }

  // ---------------------------------------------------------------- beyond Calgary
  let ring = 'all';
  // Beyond Calgary: the drive-time dial (daytrips.js); a place's route is drawn on the street map
  function viewBeyond(sel) {
    const B = D.beyond || {};
    window.DayTrips.mount($('#main'), {
      select: sel, notes: [B.banff_note, B.unesco].filter(Boolean).map(esc).join(' '),
      routeMap(el, p) {
        if (maps.r) { maps.r.remove(); delete maps.r; }
        const m = maps.r = baseMap(el, [51, -114.6], 8);
        const line = L.polyline(p.line, { color: '#f2a33a', weight: 4, opacity: .9 }).addTo(m);
        L.circleMarker(D.city.centre, { radius: 7, color: '#fff', fillColor: '#fff', fillOpacity: 1 }).addTo(m).bindTooltip('Downtown Calgary');
        L.circleMarker([p.lat, p.lon], { radius: 8, color: '#0c1020', weight: 2, fillColor: '#f2a33a', fillOpacity: 1 }).addTo(m).bindTooltip(p.name);
        m.fitBounds(line.getBounds(), { padding: [18, 18] });
      },
    });
  }

  // ---------------------------------------------------------------- the detail panel
  function detail(p) {
    if (!p) return;
    detailFor = p.id;
    const cr = (D.photo_credits || {})[p.photo];
    const links = [p.url ? `<a href="${esc(p.url)}" rel="noopener">Official site ↗</a>` : '', ...(p.links || []).filter(l => l.url !== p.url).map(l => `<a href="${esc(l.url)}" rel="noopener">${esc(l.text)} ↗</a>`),
      p.guide ? `<a href="../${esc(p.guide)}/">${esc(p.guide_title)} guide</a>` : '', p.osm ? `<a href="https://www.openstreetmap.org/${esc(p.osm)}" rel="noopener">OpenStreetMap ↗</a>` : '',
      `<a href="https://www.openstreetmap.org/directions?to=${p.lat}%2C${p.lon}" rel="noopener">Directions ↗</a>`].filter(Boolean).join('');
    $('#detail').innerHTML = `<button class="close" aria-label="Close">×</button>
      ${p.photo ? `<div class="ph"><img src="../img/${esc(p.photo)}.jpg" alt="${esc(p.name)}">${cr ? `<small>Photo: ${esc(cr.artist)}${cr.lic ? ', ' + esc(cr.lic) : ''}</small>` : ''}</div>` : '<div style="height:3.4rem"></div>'}
      <div class="bd"><div class="k">${esc(p.kind || '')}${p.area ? ' · ' + esc(p.area) : ''}</div><h2>${esc(p.name)}</h2>
        <div>${p.closed ? `<span class="badge closed">${p.closed === 'rebuilding' ? 'Being rebuilt' : 'Closed until ' + esc(p.closed)}</span>` : ''}<span class="badge${p.cost === 'free' ? ' free' : ''}">${COST[p.cost][0]}</span><span class="badge est">~${mins(p.minutes)} suggested</span>${p.indoor ? '<span class="badge">Indoors</span>' : ''}</div>
        ${p.address ? `<p class="note">${esc(p.address)}</p>` : p.community ? `<p class="note">${esc(p.community)}</p>` : ''}
        <p>${esc(p.offers || p.what || '')}</p>
        ${p.tips && p.tips.length ? `<div class="k">Good to know</div><ul>${p.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
        <p class="note">Best on ${p.fit.map(f => FIT[f]).join(', ')}.</p>
        <div class="links">${links}</div>
        <div class="go"><button class="btn small" id="addtrip">Add to my trip</button></div>
        <p class="note">Source: ${esc(p.source)}. Hours and prices: check the official site.</p></div>`;
    openPanel();
    $('#addtrip').addEventListener('click', () => { addToTrip(p); $('#addtrip').textContent = 'Added: see Plan a trip'; });
  }
  function beyondDetail(b) {
    if (!b) return;
    $('#detail').innerHTML = `<button class="close" aria-label="Close">×</button><div style="height:3.4rem"></div><div class="bd">
      <div class="k">Outside Calgary · ${b.road_km} km by road</div><h2>${esc(b.place)}</h2>
      <div><span class="badge out">Outside Calgary</span><span class="badge est">About ${mins(b.drive_minutes)} by car (estimate)</span>${b.unesco_world_heritage ? `<span class="badge unesco">UNESCO: ${esc(b.unesco_world_heritage)}</span>` : ''}</div>
      <p>${esc(b.what)}</p>${b.season ? `<p class="note">${esc(b.season)}</p>` : ''}
      ${b.visitors ? `<p class="note">${Number(b.visitors.visitors).toLocaleString('en-CA')} visitors (${esc(b.visitors.period)}). Source: <a href="${esc(b.visitors.url)}" rel="noopener">${esc(b.visitors.source)}</a></p>` : ''}
      <div class="links">${b.lat ? `<a href="https://www.openstreetmap.org/directions?to=${b.lat}%2C${b.lon}" rel="noopener">Directions ↗</a>` : ''}</div>
      <p class="note">Drive time from downtown Calgary, OpenStreetMap routing without traffic.</p></div>`;
    openPanel();
  }
  function openPanel() {
    const el = $('#detail'); el.hidden = false; el.scrollTop = 0;
    el.querySelector('.close').addEventListener('click', closePanel); el.querySelector('.close').focus();
  }
  function closePanel() { $('#detail').hidden = true; detailFor = null; }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#detail').hidden) closePanel(); });

  function foot() {
    $('#foot').innerHTML = `<p>${esc(D.disclaimer)}</p><p>Places last checked: ${esc(D.checked)}.</p>
      <ul>${D.sources.map(s => `<li><b>${esc(s.name)}</b>: ${esc(s.what)}${s.url ? ` (<a href="${esc(s.url)}" rel="noopener">licence</a>)` : ''}</li>`).join('')}</ul>
      <p>For businesses, researchers and government: <a href="../../tourism-intelligence/">Tourism Intelligence</a> (Calgary's visitor economy, with sources). · <a href="../">Visit Calgary guides</a> · <a href="../../">Calgary Insight</a> · <a href="../../about/">Corrections and suggestions</a></p>`;
  }

  load();
})();
