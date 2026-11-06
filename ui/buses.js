// Calgary Transit, live: every bus and CTrain on the map with its route number, read again every 30 seconds while the
// layer is on. The desktop app reads the City's portal from Python (transit.py); the website reads it in the browser
// (web.js). Both answer transit_live() with the same shape.
(() => {
  'use strict';
  const EVERY = 30;                       // seconds between reads (the feed is written about every 30 seconds)
  const LATE = 150;                       // positions older than this are flagged as behind
  const B = { group: null, marks: new Map(), timer: null, data: null, busy: false, status: null, route: '', error: '' };
  const calgaryTime = s => new Date(s * 1000).toLocaleTimeString('en-CA', { timeZone: 'America/Edmonton', hour: 'numeric', minute: '2-digit', second: '2-digit' });
  const ago = s => s < 90 ? `${Math.max(0, Math.round(s))} s ago` : `${Math.round(s / 60)} min ago`;
  const isTrain = v => v.kind === 'ctrain';
  const lineOf = v => v.route === '201' ? 'red' : v.route === '202' ? 'blue' : 'train';
  const label = v => isTrain(v) ? ({ red: 'Red', blue: 'Blue' }[lineOf(v)] || 'CTrain') : (v.route || '–');

  function busIcon(v) {
    const cls = (isTrain(v) ? 'bus-' + lineOf(v) : v.route ? '' : 'bus-none') + (v.at && Date.now() / 1000 - v.at > 180 ? ' bus-stale' : '');
    const dir = Number.isFinite(v.bearing) ? `<i class="bus-dir" style="transform:rotate(${v.bearing}deg)"></i>` : '';
    return L.divIcon({ className: '', html: `<div class="bus-mk ${cls}">${dir}<b>${esc(label(v))}</b></div>`, iconSize: [34, 20], iconAnchor: [17, 10] });
  }
  function tip(v) {
    const what = isTrain(v) ? 'CTrain' : 'Bus';
    const head = v.route ? `<strong>${isTrain(v) ? '' : 'Route '}${esc(isTrain(v) ? v.name || 'CTrain' : v.route)}</strong>${!isTrain(v) && v.name ? ' ' + esc(v.name) : ''}`
      : '<strong>Route not given</strong>';
    const rep = v.at ? Date.now() / 1000 - v.at : null;
    return `${head}${v.to ? `<br>Toward ${esc(v.to)}` : ''}<br>${what} ${esc(v.vehicle || '')}${rep !== null ? ` &middot; reported ${ago(rep)}` : ''}${rep > 180 ? '<br><small>Not reported for a while: it may be stopped, or its locator may be off.</small>' : ''}` +
      (v.route ? '' : '<br><small>Not on a timetabled trip: usually going to or from the garage.</small>');
  }
  const shown = v => !B.route || v.route === B.route || label(v).toLowerCase() === B.route.toLowerCase();

  function draw() {
    if (!B.group || !B.data) return;
    const seen = new Set();
    (B.data.vehicles || []).forEach(v => {
      if (!v.at && v.time) v.at = v.time;            // the desktop app names it time
      const id = v.vehicle || (v.trip + v.lat);
      if (!shown(v)) return;
      seen.add(id);
      const key = label(v) + '|' + v.kind + '|' + v.bearing + '|' + (v.at && Date.now() / 1000 - v.at > 180 ? 's' : '');
      let m = B.marks.get(id);
      if (!m) {
        m = L.marker([v.lat, v.lon], { icon: busIcon(v), keyboard: false, zIndexOffset: 500 }).bindTooltip(() => tip(m._v), { className: 'wrap-tip' });
        m._key = key;
        B.marks.set(id, m);
        m.addTo(B.group);
      } else {
        m.setLatLng([v.lat, v.lon]);
        if (m._key !== key) { m.setIcon(busIcon(v)); m._key = key; }
        if (!B.group.hasLayer(m)) m.addTo(B.group);
      }
      m._v = v;
    });
    B.marks.forEach((m, id) => { if (!seen.has(id)) { B.group.removeLayer(m); B.marks.delete(id); } });
    status();
  }

  function status() {
    if (!B.status) return;
    const box = B.status.getContainer();
    if (!box) return;
    const d = B.data;
    if (!d) { box.querySelector('.bus-line').textContent = B.error || 'Reading Calgary Transit\'s live feed…'; return; }
    const vs = d.vehicles || [], now = Date.now() / 1000, age = d.feed_time ? now - d.feed_time : null;
    const inView = map ? vs.filter(v => shown(v) && map.getBounds().contains([v.lat, v.lon])).length : 0;
    const buses = vs.filter(v => !isTrain(v)).length, trains = vs.length - buses;
    const routes = new Set(vs.filter(v => v.route && !isTrain(v)).map(v => v.route)).size;
    box.querySelector('.bus-line').innerHTML = `<b>${fmt(buses)}</b> buses on <b>${fmt(routes)}</b> routes${trains ? `, <b>${fmt(trains)}</b> CTrains` : ''}` +
      ` &middot; ${fmt(inView)} in view${B.route ? ` (route ${esc(B.route)})` : ''}`;
    const t = box.querySelector('.bus-time');
    t.textContent = age === null ? '' : `Positions at ${calgaryTime(d.feed_time)}, ${ago(age)}` + (B.error ? '. Last read failed; showing the one before.' : '');
    t.classList.toggle('late', age !== null && age > LATE);
    t.title = age !== null && age > LATE ? 'Calgary Transit\'s feed reached this page late. The positions are as of the time shown.' : '';
  }

  async function refresh() {
    if (B.busy || !B.group || document.hidden) return;
    B.busy = true;
    try {
      const r = await (await api()).transit_live();
      if (r && r.ok) { B.data = r; B.error = ''; }
      else B.error = (r && r.error) || 'Calgary Transit\'s live feed could not be read.';
    } catch (e) { B.error = 'Calgary Transit\'s live feed could not be read.'; }
    B.busy = false;
    draw();
    status();
  }

  function statusControl() {
    const c = L.control({ position: 'bottomleft' });
    c.onAdd = () => {
      const d = L.DomUtil.create('div', 'bus-status');
      d.innerHTML = `<div class="bus-head"><span class="bus-live" aria-hidden="true"></span>Calgary Transit, live
        <label class="bus-find">Route <input type="text" inputmode="numeric" maxlength="6" placeholder="all" aria-label="Show one route" value="${esc(B.route)}"></label></div>
        <div class="bus-line"></div><div class="bus-time"></div>`;
      L.DomEvent.disableClickPropagation(d);
      L.DomEvent.disableScrollPropagation(d);
      d.querySelector('input').addEventListener('input', e => { B.route = e.target.value.trim(); draw(); });
      return d;
    };
    return c;
  }

  function start() {
    if (!B.timer) B.timer = setInterval(refresh, EVERY * 1000);
    if (!B.data || Date.now() / 1000 - (B.data.read_at || 0) > EVERY - 5) refresh(); else draw();
  }
  function stop() {
    clearInterval(B.timer);
    B.timer = null;
    if (B.status) { B.status.remove(); B.status = null; }
  }

  // called by extraMapLayers on every map redraw
  window.busLayer = (overlay, on) => {
    if (!map) return;
    if (!on) { stop(); return; }
    if (!B.group) {
      B.group = L.layerGroup();
      map.on('moveend', status);
    }
    overlay.buses = B.group.addTo(map);
    if (!B.status) B.status = statusControl().addTo(map);
    status();
    start();
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && B.timer) refresh(); });
})();
