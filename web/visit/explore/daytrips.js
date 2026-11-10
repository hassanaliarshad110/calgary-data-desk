/* Beyond Calgary: the drive-time dial. Calgary at the centre, a ring for every hour of driving, each place in its real
   direction from downtown. A needle sweeps the dial clockwise; the places within the chosen drive time blink as it
   passes. A place opens with its photos (Wikimedia Commons, each with its licence), what to know, the route from
   downtown (OSRM on OpenStreetMap, with no traffic) and its official links. Data: daytrips/daytrips.json. */
'use strict';
window.DayTrips = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const C = 400, RMAX = 352, TMAX = 360, SWEEP = 6, NS = 'http://www.w3.org/2000/svg';
  const rad = m => RMAX * Math.sqrt(Math.min(m, TMAX) / TMAX);
  const hm = m => m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}`;
  const KINDS = [['all', 'Everything'], ['mountains', 'Mountains and lakes'], ['badlands', 'Badlands and dinosaurs'], ['indigenous', 'Indigenous history'], ['towns', 'Towns'], ['near', 'Close to the city']];
  const T0 = performance.now() / 1000;
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
                  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private window */ } } };
  let data = null;
  const load = () => data ? Promise.resolve(data) : fetch('daytrips/daytrips.json').then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(d => (data = d));

  async function mount(root, opts) {
    root.innerHTML = '<p class="loading">Loading the places beyond Calgary…</p>';
    let D;
    try { D = await load(); } catch (e) { root.innerHTML = '<p class="empty">The places beyond Calgary could not load. Reload the page to try again.</p>'; return; }
    const P = D.places;
    const st = Object.assign({ t: 120, kind: 'all', unesco: false, sel: 'forget-me-not-pond-kananaskis' }, store.get('ci-daytrips', {}), { ph: 0 });
    if (opts.select && P.find(p => p.id === opts.select)) st.sel = opts.select;
    const save = () => store.set('ci-daytrips', { t: st.t, kind: st.kind, unesco: st.unesco, sel: st.sel });
    P.forEach(p => { const a = (p.bearing - 90) * Math.PI / 180, r = rad(p.min); p.x = C + r * Math.cos(a); p.y = C + r * Math.sin(a); });

    root.innerHTML = `<div class="dt">
      <h2 class="sec">Beyond Calgary</h2>
      <p class="lead">Choose how long you want to drive. Every place within that time lights up on the dial, set in its real direction from downtown. Tap a dot for photos, what to know and the route from downtown Calgary. These places are <b>outside the city</b>.</p>
      <div class="dt-controls">
        <div class="dt-ctl dt-time"><label for="dt-t">Drive from downtown, up to<output id="dt-tout" for="dt-t"></output></label>
          <input type="range" id="dt-t" min="30" max="360" step="15">
          <div class="dt-ticks" aria-hidden="true"><span>30 min</span><span>1 h</span><span>2 h</span><span>3 h</span><span>4 h</span><span>5 h</span><span>6 h</span></div></div>
        <div class="dt-ctl"><span class="dt-lab" id="dt-kl">What you want to see</span><div class="dt-chips" role="group" aria-labelledby="dt-kl" id="dt-kinds">
          ${KINDS.map(([k, t]) => `<button type="button" class="dt-chip" data-k="${k}" aria-pressed="${k === st.kind}">${esc(t)}</button>`).join('')}</div></div>
        <div class="dt-ctl"><span class="dt-lab" id="dt-ul">World Heritage</span><div class="dt-chips" role="group" aria-labelledby="dt-ul"><button type="button" class="dt-chip" id="dt-unesco" aria-pressed="${st.unesco}">UNESCO sites only</button></div></div>
      </div>
      <p class="dt-count" id="dt-count" aria-live="polite"></p>
      <div class="dt-main">
        <div class="dt-dialbox">
          <svg class="dt-dial" id="dt-dial" viewBox="0 0 800 800" role="img" aria-label="Drive-time dial: Calgary at the centre, a ring for every hour of driving, each place in its direction from downtown">
            <defs><linearGradient id="dt-trail" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f2a33a" stop-opacity="0"/><stop offset="1" stop-color="#f2a33a" stop-opacity=".28"/></linearGradient></defs>
            <g id="dt-rings"></g><circle class="dt-sweep" id="dt-sweep" cx="400" cy="400" r="0"/>
            <g class="dt-needle"><path class="dt-trail" id="dt-ntr"/><line id="dt-nl" x1="400" y1="400" x2="400" y2="400"/><circle class="dt-tip" id="dt-nt" cx="400" cy="400" r="4"/></g>
            <g id="dt-rays"></g><g id="dt-pts"></g>
            <g class="dt-city"><circle cx="400" cy="400" r="7"/><circle cx="400" cy="400" r="13" fill="none" stroke="#fff" stroke-opacity=".5"/><text x="400" y="432" text-anchor="middle">CALGARY</text></g>
          </svg>
          <div class="dt-legend"><span><i style="background:var(--glacier)"></i>Place</span><span><i style="background:var(--chinook)"></i>UNESCO World Heritage Site</span><span>Rings: hours of driving, not distance</span></div>
        </div>
        <article class="dt-guide" id="dt-guide" aria-live="polite"></article>
      </div>
      <h3 class="dt-h">In your range, nearest first</h3><div class="dt-cards" id="dt-cards"></div>
      ${opts.notes ? `<p class="note">${opts.notes}</p>` : ''}
      <p class="note">Drive times and routes: OSRM routing on OpenStreetMap data from downtown Calgary, checked ${esc(new Date(D.checked + 'T12:00:00').toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' }))}, with no traffic; allow more time in summer traffic and on winter roads. Photos: Wikimedia Commons, each under the licence named with it. Place descriptions marked Wikipedia: Wikipedia, CC BY-SA 4.0.</p>
    </div>`;
    const $ = s => root.querySelector(s);
    const rings = $('#dt-rings');
    for (let h = 1; h <= 6; h++) {
      el('circle', { class: 'dt-ring', cx: C, cy: C, r: rad(h * 60), 'data-h': h }, rings);
      const a = -62 * Math.PI / 180, r = rad(h * 60);
      el('text', { class: 'dt-rlab', x: C + r * Math.cos(a) + 4, y: C + r * Math.sin(a) - 4 }, rings).textContent = h + ' h';
    }
    [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([t, b]) => { const a = (b - 90) * Math.PI / 180;
      el('text', { class: 'dt-compass', x: C + 384 * Math.cos(a), y: C + 384 * Math.sin(a) + 5, 'text-anchor': 'middle' }, rings).textContent = t; });
    const G = {};
    P.forEach(p => {
      const g = el('g', { class: 'dt-pt' + (p.unesco ? ' unesco' : ''), tabindex: 0, role: 'button', 'aria-label': `${p.name}, ${hm(p.min)} drive` }, $('#dt-pts'));
      el('circle', { class: 'dt-hit', cx: p.x, cy: p.y, r: 18 }, g);
      el('circle', { class: 'dt-ping', cx: p.x, cy: p.y, r: 7 }, g);
      el('circle', { class: 'dt-halo', cx: p.x, cy: p.y, r: 11 }, g);
      el('circle', { class: 'dt-dot', cx: p.x, cy: p.y, r: 6.5 }, g);
      el('title', {}, g).textContent = `${p.name} · ${hm(p.min)}`;
      g.addEventListener('click', () => select(p.id, true));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(p.id, true); } });
      G[p.id] = g;
    });
    root.querySelector('#dt-kinds').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (!b) return; st.kind = b.dataset.k; root.querySelectorAll('#dt-kinds .dt-chip').forEach(c => c.setAttribute('aria-pressed', c === b)); render(); });
    $('#dt-unesco').addEventListener('click', () => { st.unesco = !st.unesco; $('#dt-unesco').setAttribute('aria-pressed', st.unesco); render(); });
    const tin = $('#dt-t'); tin.value = st.t; tin.addEventListener('input', () => { st.t = +tin.value; render(); });
    $('#dt-cards').addEventListener('click', e => { const c = e.target.closest('.dt-card'); if (c) select(c.dataset.id, true); });

    const matches = p => (st.kind === 'all' || p.tags.includes(st.kind)) && (!st.unesco || p.unesco);
    let shown = new Set();
    function render() {
      const r = rad(st.t), a = -35 * Math.PI / 180;
      $('#dt-tout').textContent = hm(st.t);
      $('#dt-sweep').setAttribute('r', r);
      $('#dt-nl').setAttribute('y2', C - r); $('#dt-nt').setAttribute('cy', C - r);
      $('#dt-ntr').setAttribute('d', `M${C} ${C}L${C + r * Math.sin(a)} ${C - r * Math.cos(a)}A${r} ${r} 0 0 1 ${C} ${C - r}Z`);
      const tr = root.querySelector('#dt-trail'); tr.setAttribute('x1', C + r * Math.sin(a)); tr.setAttribute('y1', C - r * Math.cos(a)); tr.setAttribute('x2', C); tr.setAttribute('y2', C - r);
      root.querySelectorAll('.dt-ring').forEach(c => c.classList.toggle('in', +c.dataset.h * 60 <= st.t));
      const now = new Set();
      P.forEach(p => {
        const g = G[p.id], ok = matches(p), inr = p.min <= st.t;
        g.classList.toggle('off', !ok); g.classList.toggle('out', ok && !inr); g.classList.toggle('in', ok && inr);
        if (ok && inr) {
          now.add(p.id);
          if (!shown.has(p.id)) {    // blinks in step with the needle: brightest as the needle passes over it
            const t = performance.now() / 1000 - T0, d = ((p.bearing / 360 * SWEEP - t) % SWEEP + SWEEP) % SWEEP - SWEEP;
            g.querySelectorAll('.dt-ping,.dt-dot').forEach(c => { c.style.animationDelay = d.toFixed(2) + 's'; });
          }
        }
      });
      shown = now;
      const n = now.size, u = P.filter(p => now.has(p.id) && p.unesco).length;
      $('#dt-count').innerHTML = n ? `<b>${n}</b> place${n === 1 ? '' : 's'} within ${hm(st.t)} of downtown${u ? `, ${u} of them UNESCO World Heritage` : ''}.` : `Nothing that matches within ${hm(st.t)}. Drive a little further.`;
      const list = P.filter(p => now.has(p.id)).sort((a, b) => a.min - b.min);
      $('#dt-cards').innerHTML = list.length ? list.map(p => `<button type="button" class="dt-card" data-id="${p.id}"><img src="${esc((p.photos[0] || {}).src || '')}" alt="" loading="lazy">
        <span><b>${esc(p.name)}</b><small>${hm(p.min)} · ${p.km} km${p.unesco ? ' · <span class="u">UNESCO</span>' : ''}</small></span></button>`).join('')
        : '<p class="empty">No places match. Try a longer drive or another kind of place.</p>';
      save(); mark();
    }
    function mark() {
      P.forEach(p => G[p.id].classList.toggle('sel', p.id === st.sel));
      const R = $('#dt-rays'); R.innerHTML = '';
      const p = P.find(x => x.id === st.sel);
      if (p) el('line', { class: 'dt-ray', x1: C, y1: C, x2: p.x, y2: p.y }, R);
      root.querySelectorAll('.dt-card').forEach(c => c.setAttribute('aria-current', c.dataset.id === st.sel));
    }
    function select(id, scroll) {
      st.sel = id; st.ph = 0; save(); mark(); guide();
      if (scroll && window.matchMedia('(max-width: 900px)').matches) $('#dt-guide').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function photo(p) {
      const ph = p.photos[st.ph] || p.photos[0];
      const box = $('#dt-ph');
      if (!ph || !box) return;
      box.querySelector('img').src = ph.src;
      const n = box.querySelector('.dt-n'); if (n) n.textContent = `${st.ph + 1} / ${p.photos.length}`;
      $('#dt-credit').innerHTML = `Photo: <a href="${esc(ph.page)}" rel="noopener">${esc(ph.by)}</a>, ${esc(ph.lic)}, via Wikimedia Commons`;
    }
    function guide() {
      const p = P.find(x => x.id === st.sel); if (!p) return;
      const len = p.min <= 60 ? 'A half day' : p.min <= 150 ? 'A day trip' : p.min <= 240 ? 'A long day, or stay a night' : 'Best with a night or two';
      $('#dt-guide').innerHTML = `
        ${p.photos.length ? `<div class="dt-ph" id="dt-ph"><img alt="${esc(p.name)}">${p.photos.length > 1 ? `<button type="button" class="dt-nav prev" aria-label="Previous photo">‹</button><button type="button" class="dt-nav next" aria-label="Next photo">›</button><span class="dt-n"></span>` : ''}</div>
          <p class="dt-credit" id="dt-credit"></p>` : ''}
        <div class="dt-gbody">
          <div class="k">Outside Calgary</div><h2>${esc(p.name)}</h2>
          <div><span class="badge est">${hm(p.min)} drive</span><span class="badge">${p.km} km by road</span><span class="badge">${len}</span>${p.unesco ? `<span class="badge unesco">UNESCO: ${esc(p.unesco)}</span>` : ''}</div>
          <p class="dt-what">${esc(p.what)}.</p>
          ${p.about ? `<p>${esc(p.about)}</p><p class="note">From <a href="${esc(p.wiki)}" rel="noopener">Wikipedia</a>, CC BY-SA 4.0</p>` : ''}
          ${p.visitors ? `<p class="note">Visitors: <b>${p.visitors.visitors.toLocaleString('en-CA')}</b> in ${esc(p.visitors.period)} (<a href="${esc(p.visitors.url)}" rel="noopener">${esc(p.visitors.source)}</a>)</p>` : ''}
          ${p.know.length ? `<div class="k">Good to know</div><ul>${p.know.map(([t, u]) => `<li>${esc(t)}${u ? ` <a href="${esc(u)}" rel="noopener">Details</a>` : ''}</li>`).join('')}</ul>` : ''}
          <div class="k">Getting there from downtown Calgary</div>
          <ol class="dt-steps">${p.route.map(([r, k]) => `<li><span>${esc(r)}</span><b>${k} km</b></li>`).join('')}<li class="end"><span>Arrive at ${esc(p.name)}</span><b>${p.km} km in all</b></li></ol>
          <div class="map dt-rmap" id="dt-rmap" role="img" aria-label="Map of the route from Calgary to ${esc(p.name)}"></div>
          <div class="links">${p.links.map(l => `<a href="${esc(l.u)}" rel="noopener">${esc(l.t)} ↗</a>`).join('')}<a href="https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=51.0447%2C-114.0719%3B${p.lat}%2C${p.lon}" rel="noopener">Directions on OpenStreetMap ↗</a></div>
        </div>`;
      photo(p);
      const step = d => { st.ph = (st.ph + d + p.photos.length) % p.photos.length; photo(p); };
      root.querySelector('#dt-guide .prev')?.addEventListener('click', () => step(-1));
      root.querySelector('#dt-guide .next')?.addEventListener('click', () => step(1));
      if (opts.routeMap) opts.routeMap($('#dt-rmap'), p);
    }
    render(); guide();
  }
  return { mount };
})();
