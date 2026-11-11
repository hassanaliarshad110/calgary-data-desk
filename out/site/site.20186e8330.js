// ---- web.js
// Calgary Insight on the web: stands in for the desktop app's Python bridge (window.pywebview.api).
// Every screen reads the data the daily build wrote to data/ (the same figures the desktop app builds), and
// choices (ward, way of counting residents, theme, map style) are remembered in this browser only.
(() => {
  'use strict';
  const realOpen = window.open.bind(window);
  const DATA = 'data/';
  const store = {
    get(k, d) { try { const v = localStorage.getItem('cdd-web-' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('cdd-web-' + k, JSON.stringify(v)); } catch (e) { /* private window */ } },
  };
  // November 2026: the default way of counting became the City's total shared by actual growth; a choice saved
  // before then goes back to it once
  if ((store.get('pop_v', 0) || 0) < 2) { store.set('pop_method', 'city_actual'); store.set('pop_v', 2); }
  // a link from a ward or community page (calgaryinsight.ca/?ward=5&community=MAR): open that ward
  try {
    const qw = new URLSearchParams(location.search).get('ward');
    if (qw !== null && /^\d{1,2}$/.test(qw) && +qw <= 14) { store.set('scope', +qw); localStorage.setItem('cdd-scope', String(+qw)); }
  } catch (e) { /* the saved area stays */ }
  const held = {};
  const getJSON = (path) => held[path] || (held[path] = fetch(DATA + path, { cache: 'no-cache' }).then(r => {
    if (!r.ok) throw new Error(r.status === 404 ? 'This view is not on the website yet.' : 'The website data could not be read (' + r.status + ').');
    return r.json();
  }).catch(e => { delete held[path]; throw e; }));
  const settingsFile = () => getJSON('settings.json');
  const okMethod = async (m) => { const s = await settingsFile(); const all = s.methods || ['city_actual']; return all.includes(m) ? m : all[0]; };
  const fail = (e) => ({ ok: false, error: String((e && e.message) || e) });
  const today = () => new Date().toISOString().slice(0, 10);

  const api = {
    async load_dashboard(force, period, ward) {
      if (period && period.kind && period.kind !== 'last12') {
        return { ok: false, period_error: true, error: 'The website shows the last 12 complete months, refreshed every morning. Other periods are not on the website yet.' };
      }
      try {
        const w = ward === null || ward === undefined ? store.get('scope', 0) : +ward;
        const m = await okMethod(store.get('pop_method', 'city_actual'));
        if (force) delete held[`${m}/w${w}.json`];
        const data = await getJSON(`${m}/w${w}.json`);
        store.set('scope', w);
        return { ok: true, data };
      } catch (e) { return fail(e); }
    },
    async peek_view(ward) {           // another area's view, for a screen's own filter: the selected area stays as it is
      try { const m = await okMethod(store.get('pop_method', 'city_actual')); return { ok: true, data: await getJSON(`${m}/w${+ward || 0}.json`) }; } catch (e) { return fail(e); }
    },
    async set_scope(w) { store.set('scope', +w || 0); return +w || 0; },
    async compare_wards() {
      try {
        const m = await okMethod(store.get('pop_method', 'city_actual'));
        const c = await getJSON(`${m}/w0.json`);
        const pick = ['wards_summary', 'period', 'prev_period', 'period_spec', 'built_at', 'scope', 'population', 'stale'];
        const data = Object.fromEntries(pick.map(k => [k, c[k]]));
        data.access = c.access ? { kinds: c.access.kinds, city: c.access.city, wards: c.access.wards } : null;
        return { ok: true, data, wards_geo: (c.geo || {}).wards, city_geo: (c.geo || {}).city };
      } catch (e) { return fail(e); }
    },
    async missing_persons() {
      try { return await getJSON(`missing/w${store.get('scope', 0)}.json`); }
      catch (e) { return { ok: false, error: String(e.message || e), appeals: [] }; }
    },
    async get_budget() { try { return { ok: true, data: await getJSON('budget.json') }; } catch (e) { return fail(e); } },
    async get_city_news() {
      try {
        const r = await fetch('https://raw.githubusercontent.com/hassanaliarshad110/calgary-data-desk/news/news/latest.json', { cache: 'no-cache' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const d = await r.json();
        d.articles = (d.articles || []).sort((a, b) => (b.date + (b.published_at || '')).localeCompare(a.date + (a.published_at || '')));
        return { ok: true, data: d };
      } catch (e) { return { ok: false, error: 'Could not reach the published news from this browser (' + (e.message || e) + ').' }; }
    },
    async track_311(id) {
      try {
        if (!/^[A-Za-z0-9-]{4,20}$/.test(id || '')) return { ok: false, error: 'Type the request number as the City gave it, e.g. 26-01234567.' };
        const r = await fetch('https://data.calgary.ca/resource/iahh-g8bj.json?service_request_id=' + encodeURIComponent(id), { cache: 'no-store' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return { ok: true, rows: await r.json() };
      } catch (e) { return { ok: false, error: 'Could not reach the City\'s 311 data from this browser (' + (e.message || e) + ').' }; }
    },
    async get_fedbudget() { try { const r = await fetch('budget/budget2026.json', { cache: 'no-cache' }); if (!r.ok) throw new Error('The federal budget file could not be read (' + r.status + ').'); return { ok: true, data: await r.json() }; } catch (e) { return fail(e); } },
    async get_business() {
      try {
        const [d, ppl] = await Promise.all([getJSON('business.json'), getJSON('business_people.json').catch(() => null)]);
        const m = await okMethod(store.get('pop_method', 'city_actual'));
        return { ok: true, data: d, people: ppl ? (ppl[m] || null) : null };
      } catch (e) { return fail(e); }
    },
    async get_accountability() { try { return { ok: true, data: await getJSON('accountability.json') }; } catch (e) { return fail(e); } },
    async get_capmkt() { try { return { ok: true, data: await getJSON('capmkt.json') }; } catch (e) { return fail(e); } },
    async get_infra() { try { return { ok: true, data: await getJSON('infra.json') }; } catch (e) { return fail(e); } },
    async get_safety_rank() { try { return { ok: true, data: await getJSON('safety_rank.json') }; } catch (e) { return fail(e); } },
    async get_visit() { try { return { ok: true, data: await getJSON('visit.json') }; } catch (e) { return fail(e); } },
    async get_elections() { try { return { ok: true, data: await getJSON('elections.json') }; } catch (e) { return fail(e); } },
    async get_property_tax() { try { return { ok: true, data: await getJSON('tax.json') }; } catch (e) { return fail(e); } },
    async get_methods() { try { return await getJSON('methods.json'); } catch (e) { return []; } },

    // Data sources: City of Calgary datasets are asked directly from this browser; the others were asked by the
    // daily build (their sites do not let a web page ask them directly)
    async live_sources() { try { return (await getJSON('live.json')).sources; } catch (e) { return []; } },
    async test_source(key) {
      let daily = null;
      try { daily = ((await getJSON('live.json')).results || []).find(r => r.key === key) || null; } catch (e) { /* none */ }
      const src = ((await api.live_sources()) || []).find(s => s.key === key);
      if (src && src.target && /^[a-z0-9]{4}-[a-z0-9]{4}$/.test(src.target)) {
        const t0 = performance.now();
        try {
          const [meta, rows] = await Promise.all([
            fetch(`https://data.calgary.ca/api/views/${src.target}.json`).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }),
            fetch(`https://data.calgary.ca/resource/${src.target}.json?$limit=1`).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }),
          ]);
          const upd = meta.rowsUpdatedAt ? new Date(meta.rowsUpdatedAt * 1000) : null;
          return { key, name: src.name, publisher: src.publisher, ok: true, ms: Math.round(performance.now() - t0),
                   updated: upd ? upd.toISOString().slice(0, 16).replace('T', ' ') : null,
                   detail: `${src.target}: answered this browser with ${rows.length} row, ${rows[0] ? Object.keys(rows[0]).length : 0} fields` };
        } catch (e) {
          return { key, name: src.name, publisher: src.publisher, ok: false, ms: Math.round(performance.now() - t0),
                   detail: `Could not reach data.calgary.ca from this browser (${e.message || e}).` };
        }
      }
      if (daily) return { ...daily, detail: `${daily.detail || ''} (checked by the website's daily refresh, ${daily.checked || ''})`.trim() };
      return { key, ok: false, detail: 'Not checked yet.' };
    },

    // settings: remembered in this browser
    async get_settings() {
      let s = {};
      try { s = await settingsFile(); } catch (e) { /* defaults */ }
      return {
        has_key: false, key_hint: '', engines: [], max_engines: 0, providers: [], models: {}, downloads: 'your browser\'s downloads',
        theme: store.get('theme', 'dark'), map_style: store.get('map_style', 'street'),
        has_google_key: false, google_key_hint: '', google_key: '',
        pop_method: await okMethod(store.get('pop_method', 'city_actual')), scope: store.get('scope', 0),
        pop_methods: (s.pop_methods || []).filter(p => !s.methods || s.methods.includes(p.key)), web: true, built: s,
      };
    },
    async set_pop_method(m) { store.set('pop_method', await okMethod(m)); return api.get_settings(); },
    async set_theme(t) { store.set('theme', t); return true; },
    async set_map_style(s) { store.set('map_style', s); return true; },
    async save_settings() { return api.get_settings(); },
    async save_engines() { return api.get_settings(); },
    async remove_google_key() { return api.get_settings(); },
    async remove_key() { return api.get_settings(); },
    async test_engine() { return { ok: false, results: [{ model: '', ok: false, text: 'AI services are set up for the website by its owner.' }] }; },

    // links and files: the browser's own
    async open_url(url) { if (/^https?:\/\//i.test(String(url || ''))) realOpen(String(url), '_blank', 'noopener'); return true; },
    async open_path(p) { if (/^(blob:|https?:)/.test(String(p || ''))) realOpen(String(p), '_blank', 'noopener'); return true; },
    async open_downloads() { return true; },
    async list_downloads() { return []; },
    async save_buildup() {                     // the build's workbook for the area and way of counting on screen
      const m = store.get('pop_method', 'city_actual'), w = store.get('scope', 0);
      const a = document.createElement('a');
      a.href = `data/${m}/buildup_w${w}.xlsx`; a.download = `Population build-up (${w ? 'Ward ' + w : 'Calgary'}).xlsx`;
      document.body.appendChild(a); a.click(); a.remove();
      return { ok: true };
    },
    async save_csv(name, columns, rows) {
      const q = v => { const s = v === null || v === undefined ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
      const text = '﻿' + [columns, ...rows].map(r => r.map(q).join(',')).join('\r\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
      a.download = String(name || 'table').replace(/[^\w\- .()]+/g, '_') + '.csv';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 30000);
      return { ok: true, path: 'your browser\'s downloads', name: a.download, rows: rows.length };
    },
    async set_fullscreen(on) {
      try { if (on && !document.fullscreenElement) await document.documentElement.requestFullscreen(); else if (!on && document.fullscreenElement) await document.exitFullscreen(); } catch (e) { /* not allowed */ }
      return true;
    },

    // Calgary Transit, live (transit.py does the same in the desktop app): every bus and CTrain read from the City's
    // portal in this browser, given its route from the timetable the daily build wrote (data/transit.json)
    async transit_live() {
      try {
        // The City writes a new file for each feed about every 30 seconds, under a new name (its blobId), so the name is
        // read again every time: keeping the first one froze every vehicle where it was when the map opened.
        const T = window.CDD_TRANSIT || (window.CDD_TRANSIT = {});
        const blob = async id => {
          try { const m = await fetch(`https://data.calgary.ca/api/views/${id}.json?_=${Date.now()}`, { cache: 'no-store' }).then(r => r.json()); if (m.blobId) T[id] = m.blobId; }
          catch (e) { /* use the last name read */ }
          return T[id];
        };
        const feed = async (id, name) => {
          const b = await blob(id);
          const urls = [b ? `https://data.calgary.ca/api/views/${id}/files/${b}?filename=${name}` : null, `https://data.calgary.ca/download/${id}/application%2Foctet-stream?_=${Date.now()}`].filter(Boolean);
          let err;
          for (const u of urls) {
            try { const r = await fetch(u, { cache: 'no-store' }); if (r.ok) return new Uint8Array(await r.arrayBuffer()); err = new Error('HTTP ' + r.status); }
            catch (e) { err = e; }
          }
          throw err;
        };
        const [vb, tb, look] = await Promise.all([
          feed('am7c-qe3u', 'vehiclepositions.pb'),
          feed('gs4m-mdc2', 'tripupdates.pb').catch(() => null),
          getJSON('transit.json').catch(() => ({})),
        ]);
        const pb = gtfsRT();
        const extra = tb ? pb.tripRoutes(tb) : {};
        const routes = look.routes || [], to = look.to || [], trips = look.trips || {};
        const byNum = Object.fromEntries(routes.map(r => [r[0], r]));
        const nowS = Date.now() / 1000;
        const vs = pb.vehicles(vb).filter(v => !v.at || nowS - v.at < 600).map(v => {
          const hit = trips[v.trip];
          if (hit) { const r = routes[hit[0]]; return { ...v, route: r[0], name: r[1], kind: r[2], to: to[hit[1]] || '', how: 'timetable' }; }
          if (extra[v.trip]) { const r = byNum[extra[v.trip]]; return { ...v, route: extra[v.trip], name: r ? r[1] : '', kind: r ? r[2] : 'bus', to: '', how: 'trip updates' }; }
          return { ...v, route: '', name: '', kind: 'bus', to: '', how: '' };
        });
        return { ok: true, feed_time: pb.feedTime(vb), read_at: Math.floor(Date.now() / 1000), vehicles: vs,
                 timetable_valid: look.valid || null, page: 'https://data.calgary.ca/d/am7c-qe3u' };
      } catch (e) { return { ok: false, error: `Calgary Transit's live feed could not be read from this browser (${e.message || e}).` }; }
    },

    // the desktop-only parts
    async cam_watch() { return { ok: true }; },
    async newsletter_make() { return { ok: false, error: 'The newsletter is not on the website.' }; },
    async newsletter_save() { return { ok: false, error: 'The newsletter is not on the website.' }; },
    async ask() { return { ok: false, error: 'Data Genie needs the access code.' }; },
    async new_chat() { return true; },
    async analyst_topics() { return []; },
    async analyst_run() { return { ok: false, error: 'Data Scientist needs the access code.' }; },
    async analyst_reports() { return []; },
  };
  // GTFS Realtime (Protocol Buffers), only the fields a vehicle map needs (transit.py has the same in Python)
  function gtfsRT() {
    const varint = (b, i) => { let v = 0, m = 1, x; do { x = b[i++]; v += (x & 127) * m; m *= 128; } while (x & 128); return [v, i]; };
    const fields = (b, s = 0, e = b.length) => {
      const out = []; let i = s;
      while (i < e) {
        let k; [k, i] = varint(b, i);
        const n = Math.floor(k / 8), w = k & 7;
        if (w === 0) { let v; [v, i] = varint(b, i); out.push([n, v]); }
        else if (w === 2) { let l; [l, i] = varint(b, i); out.push([n, b.subarray(i, i + l)]); i += l; }
        else if (w === 5) { out.push([n, new DataView(b.buffer, b.byteOffset + i, 4).getFloat32(0, true)]); i += 4; }
        else if (w === 1) { out.push([n, new DataView(b.buffer, b.byteOffset + i, 8).getFloat64(0, true)]); i += 8; }
        else break;
      }
      return out;
    };
    const first = (fs, n) => { const f = fs.find(x => x[0] === n); return f ? f[1] : undefined; };
    const text = v => v instanceof Uint8Array ? new TextDecoder().decode(v) : (v === undefined ? '' : String(v));
    return {
      feedTime(b) { const h = first(fields(b), 1); return h ? first(fields(h), 3) || null : null; },
      vehicles(b) {
        const out = [];
        for (const [n, ent] of fields(b)) {
          if (n !== 2) continue;
          const vp = first(fields(ent), 4); if (!vp) continue;
          const f = fields(vp), trip = first(f, 1), pos = first(f, 2), veh = first(f, 8), ts = first(f, 5);
          if (!pos) continue;
          const p = fields(pos), lat = first(p, 1), lon = first(p, 2), brg = first(p, 3);
          if (typeof lat !== 'number' || typeof lon !== 'number') continue;
          const vf = veh ? fields(veh) : [];
          out.push({ vehicle: text(first(vf, 2) || first(vf, 1)), trip: trip ? text(first(fields(trip), 1)) : '',
                     lat: Math.round(lat * 1e5) / 1e5, lon: Math.round(lon * 1e5) / 1e5, bearing: typeof brg === 'number' ? Math.round(brg) : null, at: typeof ts === 'number' ? ts : null });
        }
        return out;
      },
      tripRoutes(b) {
        const out = {};
        for (const [n, ent] of fields(b)) {
          if (n !== 2) continue;
          const tu = first(fields(ent), 3); if (!tu) continue;
          const td = first(fields(tu), 1); if (!td) continue;
          const t = fields(td), trip = text(first(t, 1)), route = text(first(t, 5));
          if (trip && route) out[trip] = route;
        }
        return out;
      },
    };
  }
  window.CDD_WEB = { store, getJSON, today };
  // the website opens in the dark theme unless the visitor chose another
  window.CDD_DEFAULT_THEME = store.get('theme', 'dark');
  document.documentElement.dataset.theme = window.CDD_DEFAULT_THEME === 'light' ? 'light' : window.CDD_DEFAULT_THEME === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 'dark';
  window.pywebview = { api };
})();

;
// ---- web-ai.js
// Data Genie and Data Scientist on the website, behind the access code.
// The owner's Claude key is in data/genie.json, locked (AES-GCM) with a key made from the access code (PBKDF2), so the
// page can use it only after the code is typed. The questions then run the desktop app's own agent in a web worker.
(() => {
  'use strict';
  const W = window.CDD_WEB, api = window.pywebview.api;
  const CODE_KEY = 'cdd-web-code', EA_KEY = 'cdd-web-ea-code', BIZ_KEY = 'cdd-web-biz-code';
  let apiKey = '', gateway = '', worker = null, booting = null, seq = 0;   // gateway: the site's AI gateway, for signed-in visitors
  const open_ = { genie: false, ea: false, biz: false };   // Data Genie and the Data Scientist; Election Analytics; the Business Economist (each its own passcode)
  const waiting = new Map();
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

  async function decrypt(code, which = 'genie') {
    let box;
    const file = { ea: 'genie_ea.json', biz: 'genie_biz.json' }[which] || 'genie.json';
    const off = which === 'ea' ? 'The election analyst\'s passcode is not set up on this website yet.' : which === 'biz' ? 'The Business Economist is not switched on yet. Contact the developer.' : 'Data Genie is not switched on for this website yet.';
    try { box = await W.getJSON(file); } catch (e) { throw new Error(off); }
    if (!box || !box.ct) throw new Error(off);
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(code || '').trim()), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(box.salt), iterations: box.iter, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    try {
      return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(box.iv) }, key, b64(box.ct)));
    } catch (e) { throw new Error('That passcode is not right. To get a passcode, contact the developer.'); }
  }

  // while Data Genie, the Data Scientist or the auditor is working, keep a phone's screen on: a phone that sleeps
  // cuts the page's connection to the AI service and the answer is lost
  const LONG = new Set(['ask', 'analyst_run', 'audit_run', 'election_report', 'business_report']);
  let lock = null, busy = 0;
  async function holdScreen() {
    try { if (!lock && navigator.wakeLock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); } } catch (e) { /* not allowed here */ }
  }
  document.addEventListener('visibilitychange', () => { if (busy && document.visibilityState === 'visible') holdScreen(); });
  function call(op, args) {
    const long = LONG.has(op);
    if (long) { busy++; holdScreen(); }
    return new Promise((resolve, reject) => {
      const id = ++seq;
      waiting.set(id, { resolve, reject });
      worker.postMessage({ id, op, args });
    }).finally(() => {
      if (long && --busy <= 0) { busy = 0; if (lock) { lock.release().catch(() => {}); lock = null; } }
    });
  }

  function start() {
    if (booting) return booting;
    worker = new Worker('genie-worker.js');
    worker.onmessage = e => {
      const m = e.data;
      if (typeof m === 'string') {                         // progress from the agent
        try {
          const { event, who } = JSON.parse(m);
          const fn = who === 'scientist' ? window.onAnalystEvent : who === 'auditor' ? window.onAuditEvent : window.onAgentEvent;
          if (fn) fn(event);
        } catch (err) { /* ignore */ }
        return;
      }
      const w = waiting.get(m.id);
      if (!w) return;
      waiting.delete(m.id);
      m.ok ? w.resolve(m.result) : w.reject(new Error(m.error));
    };
    const base = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');
    booting = call('boot', { base }).then(() => call('key', { key: apiKey, gateway }));
    booting.catch(() => { booting = null; });
    return booting;
  }

  // the dashboard on screen, every ward side by side and the property tax estimate, for the agent's tools
  let sent = '';
  async function context() {
    const m = W.store.get('pop_method', 'city_actual'), w = W.store.get('scope', 0);
    const tag = `${m}/${w}`;
    if (tag === sent) return;
    const [dash, city, tax] = await Promise.all([
      api.load_dashboard(false, null, w).then(r => r.ok ? r.data : null),
      api.compare_wards().then(r => r.ok ? r.data.wards_summary : null),
      W.getJSON('tax.json').catch(() => null),
    ]);
    const t = tax ? Object.fromEntries(['year', 'roll_year', 'city', 'by_ward', 'factors', 'rates', 'levy', 'bylaw', 'source'].map(k => [k, tax[k]])) : null;
    await call('context', { dash, wards: city, tax: t });
    sent = tag;
  }

  async function run(op, args) {
    if (!apiKey) return { ok: false, error: 'Enter the passcode first.' };
    try {
      await start();
      await context();
      return await call(op, args);
    } catch (e) { return { ok: false, error: String(e.message || e) }; }
  }

  window.CDD_AI = {
    unlocked: (which = 'genie') => !!apiKey && open_[which],
    // signed in with Google and approved by the owner (web-account.js): a gateway session in place of the passcode;
    // the Claude key stays on the gateway
    async useAccount(session, url, tools = ['genie']) {
      apiKey = session; gateway = url;
      open_.genie = open_.genie || tools.includes('genie');
      open_.ea = open_.ea || tools.includes('election');
      open_.biz = open_.biz || tools.includes('business');
      if (worker && booting) { try { await booting; await call('key', { key: apiKey, gateway }); } catch (e) { /* set again at the next start */ } }
      start().catch(() => {});
      return true;
    },
    viaAccount: () => apiKey.startsWith('cis.'),
    async unlock(code, which = 'genie') {
      apiKey = await decrypt(code, which);
      open_[which] = true;
      try { sessionStorage.setItem({ ea: EA_KEY, biz: BIZ_KEY }[which] || CODE_KEY, String(code).trim()); } catch (e) { /* private window */ }
      start().catch(() => {});                              // load the engine while the visitor reads the screen
      return true;
    },
  };

  // the bridge calls that need the engine
  const getSettings = api.get_settings;
  api.get_settings = async () => ({ ...(await getSettings()), has_key: !!apiKey && open_.genie });
  api.ask = (question, mode, extra) => run('ask', { question, mode, ...(extra || {}) });   // extra: notes, a reopened chat (web-account.js)
  api.new_chat = async () => (worker ? call('new_chat', {}).catch(() => true) : true);
  // extra: earlier reports' research kept in the visitor's memory (web-account.js)
  api.analyst_run = (key, text, depth, extra) => run('analyst_run', { key, text, depth, ...(extra || {}) });
  api.election_report = (text, area, extra) => run('election_report', { text, area, ...(extra || {}) });
  api.business_report = (text, area, extra) => run('business_report', { text, area, ...(extra || {}) });
  api.audit_run = (report) => run('audit_run', { report });
  api.audit_list = async () => { if (!worker || !apiKey) return []; try { await booting; return await call('audit_list', {}); } catch (e) { return []; } };
  api.analyst_reports = async () => { if (!worker || !apiKey) return []; try { await booting; return await call('analyst_reports', {}); } catch (e) { return []; } };
  api.analyst_topics = async (n = 6) => {
    let all = [];
    try { all = await W.getJSON('analyst_topics.json'); } catch (e) { return []; }
    const sc = (((await api.load_dashboard(false, null, W.store.get('scope', 0))).data || {}).scope || {});
    const ward = sc.kind === 'city' ? 0 : (sc.ward || null);
    const place = sc.kind === 'city' ? 'Calgary' : (sc.name || 'the selected area');
    const ONLY = { blue_line: [5] };               // as analyst.ONLY: topics that suit only some areas
    const fill = v => typeof v !== 'string' ? v : v.split('{area}').join(place);   // {area}: the selected area
    const pool = all.filter(t => ward === null || !(t.only || ONLY[t.key]) || (t.only || ONLY[t.key]).includes(ward))
      .sort(() => Math.random() - 0.5);
    const out = [], per = {};
    for (const t of pool) {
      if ((per[t.area] || 0) >= 2) continue;
      per[t.area] = (per[t.area] || 0) + 1;
      out.push(Object.fromEntries(Object.entries(t).map(([k, v]) => [k, k === 'area' ? v : fill(v)])));
      if (out.length >= n) break;
    }
    return out;
  };
  const openPath = api.open_path;
  api.open_path = async (p0) => {
    const print = String(p0 || '').endsWith('#print'), p = String(p0 || '').replace(/#print$/, '');
    if (!String(p || '').startsWith('/home/pyodide/')) return openPath(p);
    if (!worker) return false;
    // a web page (a report): opened at once, from the click, on the website's own report page, then filled in
    const isHtml = /\.html?$/i.test(p);
    const win = isHtml ? window.open('report-view.html' + (print ? '#print' : ''), '_blank') : null;
    try {
      const data = await call('read', { path: p });
      const name = String(p).split('/').pop();
      if (win) {
        const title = name.replace(/\.html?$/i, '').replace(/ \((print|interactive)\)/gi, '').replace(/[<>:"/\\|?*\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90) || 'Calgary Insight report';
        const html = typeof data === 'string' ? data : new TextDecoder().decode(data);
        let done = false;
        const send = () => { if (!done) { try { win.postMessage({ type: 'cdd-report', html, title }, location.origin); } catch (e) { /* not ready */ } } };
        const on = e => { if (e.source !== win || e.origin !== location.origin) return;
          if (e.data && e.data.type === 'cdd-report-ready') send();
          if (e.data && e.data.type === 'cdd-report-got') { done = true; removeEventListener('message', on); } };
        addEventListener('message', on);
        send(); setTimeout(() => removeEventListener('message', on), 60000);
        return true;
      }
      const type = /\.pdf$/i.test(name) ? 'application/pdf' : /\.html?$/i.test(name) ? 'text/html' : /\.csv$/i.test(name) ? 'text/csv'
        : /\.xlsx$/i.test(name) ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/octet-stream';
      const url = URL.createObjectURL(new Blob([data], { type }));
      const a = document.createElement('a');
      a.href = url + (print && type === 'text/html' ? '#print' : '');
      if (!/^(application\/pdf|text\/html)$/.test(type)) a.download = name; else a.target = '_blank';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30 * 60000);   // the tab may still be printing or saving it
      return true;
    } catch (e) { if (win) try { win.close(); } catch (x) { /* already closed */ } return false; }
  };

  // the dashboard switched ward or way of counting: send the new one with the next question
  const load = api.load_dashboard;
  api.load_dashboard = async (...a) => { const r = await load(...a); sent = ''; return r; };
  const setPop = api.set_pop_method;
  api.set_pop_method = async (m) => { sent = ''; return setPop(m); };

  document.addEventListener('cdd-unlocked', () => {
    if (window.renderScientist) window.renderScientist(true);
    const nk = document.getElementById('no-key');
    if (nk) nk.hidden = true;
  });

  // unlocked earlier in this browser session
  let saved = '', savedEa = '', savedBiz = '';
  try { saved = sessionStorage.getItem(CODE_KEY) || ''; savedEa = sessionStorage.getItem(EA_KEY) || ''; savedBiz = sessionStorage.getItem(BIZ_KEY) || ''; } catch (e) { /* none */ }
  if (savedBiz) decrypt(savedBiz, 'biz').then(k => { apiKey = k; open_.biz = true; if (window.renderInvest) window.renderInvest(true); }).catch(() => {});
  if (saved) decrypt(saved).then(k => { apiKey = k; open_.genie = true; if (window.CDD_LOCK) window.CDD_LOCK.open(); }).catch(() => {});
  if (savedEa) decrypt(savedEa, 'ea').then(k => { apiKey = k; open_.ea = true; if (window.renderElAnalytics) window.renderElAnalytics(true); }).catch(() => {});
})();

;
// ---- app.js
/* Calgary Insight (formerly Ward 5 Data Desk) - interface */
'use strict';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const isNum = n => n !== null && n !== undefined && !Number.isNaN(n);
const fmt = (n, d = 0) => !isNum(n) ? '–'
  : Number(n).toLocaleString('en-CA', { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = (n, d = 1, unit = '%') => !isNum(n) ? '–' : (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n), d) + unit;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const niceType = t => String(t || '').replace(/ - GIS$/, '');
const titleCase = s => String(s || '').toLowerCase().replace(/(^|[\s/])\w/g, m => m.toUpperCase());
const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const icon = (id, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const pct = (a, b) => (isNum(a) && b) ? (a - b) / b * 100 : null;
const monthLabel = (m, opts = { month: 'short', year: '2-digit' }) => new Date(m + '-15T12:00:00').toLocaleDateString('en-CA', opts);
const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ymdParts = v => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || '')); return m ? [+m[1], +m[2], +m[3]] : null; };
const TZ = 'America/Edmonton';      // Calgary time, whatever the computer is set to
const localYmd = (t = new Date()) => { try { return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(t); }
  catch (e) { return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; } };
// whole calendar days from a date to the data's own date (the last refresh), so every screen agrees with the dashboard
const daysSince = d => {
  const a = ymdParts(d), b = ymdParts((D && D.built_at) || localYmd());
  if (!a || !b) return null;
  return Math.max(0, Math.round((Date.UTC(b[0], b[1] - 1, b[2]) - Date.UTC(a[0], a[1] - 1, a[2])) / 86400000));
};
// how residents are counted (Settings): words for labels and notes
const popMethod = () => (D && D.population && D.population.method) || 'city_actual';
const popWords = () => ({ model: 'the growth model', census2021: `the ${CY()} Census, without growth`, city_pace: `the ${CY()} Census grown to the City's total`, city_actual: "the City's total, shared by actual growth" })[popMethod()];
const popShort = () => ({ model: 'Live growth model', census2021: `Counted as at the ${CY()} Census`, city_pace: `${CY()} Census grown to the City's total`, city_actual: "City's total, shared by actual growth (homes built)" })[popMethod()];
const popChip = () => ({ model: 'growth model', census2021: `${CY()} Census, no growth`, city_pace: "City's total, one rate", city_actual: "City's total, actual growth" })[popMethod()];
// the federal Census the app counts from (2021 until the City publishes the 2026 Census by community)
const CY = () => (D && D.census && D.census.year) || 2021;
// the exact price of an answer (US dollars, from the tokens used and the model's price list)
const dayWord = n => `${fmt(n)} day${n === 1 ? '' : 's'}`;
const longDate = d => { const p = ymdParts(d); return p ? `${p[2]} ${MON_SHORT[p[1] - 1]} ${p[0]}` : '–'; };
// '2026-11-01 01:57' -> '1 Nov 2026, 1:57 a.m.'
const stampText = v => {
  const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})/.exec(String(v || ''));
  if (!m) return longDate(v);
  const h = +m[2];
  return `${longDate(m[1])}, ${h % 12 || 12}:${m[3]} ${h < 12 ? 'a.m.' : 'p.m.'}`;
};

// ---------------------------------------------------------------- bridge to Python
let apiReady;
const ready = new Promise(r => { apiReady = r; });
window.addEventListener('pywebviewready', () => apiReady(window.pywebview.api));
if (window.pywebview && window.pywebview.api) apiReady(window.pywebview.api);
const api = () => ready;
async function openUrl(url) {
  const a = await api();
  if (a && a.open_url) a.open_url(url);
}

// Every web link opens in the computer's own browser, never inside the app window (which has no Back button).
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (/^https?:\/\//i.test(href)) { e.preventDefault(); e.stopPropagation(); openUrl(href); }
}, true);
window.open = (url) => { if (/^https?:\/\//i.test(String(url || ''))) openUrl(String(url)); return null; };

// ---------------------------------------------------------------- theme
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
let themePref = window.CDD_DEFAULT_THEME || 'system';
const isDark = () => document.documentElement.dataset.theme === 'dark';
function applyTheme() {
  const dark = themePref === 'dark' || (themePref === 'system' && darkQuery.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const b = $('#theme-btn');
  b.innerHTML = dark ? `${icon('sun')}<span>Light mode</span>` : `${icon('moon')}<span>Dark mode</span>`;
  b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  setSeg($('#theme-seg'), themePref);
  if (D) { renderMap(); renderPanel(selected); renderCharts(); if (window.renderExtras) renderExtras(); }
}
async function setTheme(pref) {
  themePref = pref;
  applyTheme();
  const a = await api();
  if (a.set_theme) a.set_theme(pref);
}
darkQuery.addEventListener('change', () => { if (themePref === 'system') applyTheme(); });
$('#theme-btn').addEventListener('click', () => setTheme(isDark() ? 'light' : 'dark'));

// ---------------------------------------------------------------- segmented controls (radio groups)
function setSeg(group, value) {
  $$('[role=radio]', group).forEach(b => {
    const on = Object.values(b.dataset)[0] === value;
    b.setAttribute('aria-checked', on);
    b.tabIndex = on ? 0 : -1;
  });
}
function wireSeg(group, onChange) {
  const radios = $$('[role=radio]', group);
  radios.forEach((b, i) => {
    b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
    b.addEventListener('click', () => { setSeg(group, Object.values(b.dataset)[0]); onChange(Object.values(b.dataset)[0]); });
    b.addEventListener('keydown', e => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = radios[(i + step + radios.length) % radios.length];
      next.focus(); next.click();
    });
  });
}

// ---------------------------------------------------------------- navigation
function show(view) {
  if (!document.getElementById('view-' + view)) view = 'dashboard';   // a screen this version does not have
  $$('.tab').forEach(t => {
    const on = t.dataset.view === view;
    t.classList.toggle('is-on', on);
    on ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current');
  });
  $$('.view').forEach(v => v.classList.toggle('is-on', v.id === 'view-' + view));
  $$('.nav-g').forEach(g => { g.classList.toggle('has-on', !!g.querySelector('.tab.is-on')); g.classList.remove('open'); g.querySelector('.nav-gt') && g.querySelector('.nav-gt').setAttribute('aria-expanded', 'false'); });
  if (view !== 'videos') $$('#view-videos video').forEach(v => v.pause());
  else $$('#view-videos video[data-poster]').forEach(v => { v.poster = v.dataset.poster; v.removeAttribute('data-poster'); });   // posters load only when the page is opened
  if (view === 'files') loadFiles();
  if (view === 'scientist' && window.renderScientist) renderScientist();
  if (view === 'settings') loadSettings();
  if (view === 'dashboard' && map) setTimeout(() => { map.invalidateSize(); if (!selected) zoomToWard(); }, 60);
  if (view === 'issues') renderIssues();
  if (view === 'cameras') renderCameraWall();
  if (view === 'families' && window.renderFamilies) renderFamilies();
  if (view === 'growth' && window.renderGrowth) renderGrowth();
  if (view === 'changes' && window.renderChanges) renderChanges();
  if (view === 'compare' && window.renderCompare) renderCompare();
  if (view === 'sources' && window.renderSources) renderSources();
  if (view === 'methods' && window.renderMethods) renderMethods();
  if (view === 'budget' && window.renderBudget) renderBudget();
  if (view === 'elections' && window.renderElections) renderElections();
  if (view === 'fedbudget' && window.renderFedBudget) renderFedBudget();
  if (view === 'safety' && window.renderSafety) renderSafety();
  if (view === 'visit' && window.renderVisit) renderVisit();
  if (view === 'invest' && window.renderInvest) renderInvest();
  if (view === 'infra' && window.renderInfra) renderInfra();
  if (view === 'capmkt' && window.renderCapMkt) renderCapMkt();
  if (view === 'help' && window.renderHelp) renderHelp();
  if (view === 'citynews' && window.renderCityNews) renderCityNews();
  if (view === 'livemap' && window.renderLiveMap) renderLiveMap();
  if (view === 'elanalytics' && window.renderElAnalytics) renderElAnalytics();
  if (view === 'sources' && window.renderLive) renderLive();
  if (view === 'news' && window.initNews) initNews();
  if (view === 'ask') $('#question').focus();
  setTimeout(markScrollables, 400);
}
// a scrolling table or list can be reached with the keyboard (Tab, then the arrow keys)
function markScrollables() {
  $$('.table-wrap, .tall, .sr-wrap, .scroll-x, .table-scroll, .feed, .thread, .detail, .rank, .record, .status-box, #crime-comms, .brief-feed, .brief-types, .ea-thread, .inf-pave, .ca-votes, .viewer, .el-race, .el-scroll').forEach(el => {
    const scrolls = el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2;
    if (scrolls && !el.hasAttribute('tabindex')) { el.tabIndex = 0; el.dataset.scrollable = '1'; }
    else if (!scrolls && el.dataset.scrollable) { el.removeAttribute('tabindex'); delete el.dataset.scrollable; }
  });
}
{ let t; new MutationObserver(() => { clearTimeout(t); t = setTimeout(markScrollables, 300); }).observe(document.getElementById('main'), { childList: true, subtree: true }); }
window.addEventListener('resize', () => { clearTimeout(window.__msT); window.__msT = setTimeout(markScrollables, 300); });
$$('.tab').forEach(t => t.addEventListener('click', () => { if (t.dataset.view) show(t.dataset.view); setMenu(false); }));
// phones: the sections sit behind a menu button at the top, so every page gets the full width
function setMenu(open) {
  const side = $('.side'), b = $('#menu-btn');
  if (!side || !b) return;
  side.classList.toggle('open', open);
  b.setAttribute('aria-expanded', open ? 'true' : 'false');
  b.setAttribute('aria-label', open ? 'Close the menu' : 'Menu');
}
$('#menu-btn').addEventListener('click', () => setMenu(!$('.side').classList.contains('open')));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('.side').classList.contains('open')) { setMenu(false); $('#menu-btn').focus(); } });
$('#brief-btn') && $('#brief-btn').addEventListener('click', () => setMenu(false));
// navigation layout: the groups down the side, or across the top as menus (?nav=top or ?nav=side remembers the choice)
{
  const q = new URLSearchParams(location.search).get('nav');
  let pref = 'top'; try { pref = q === 'top' || q === 'side' ? q : (localStorage.getItem('nav-layout') || 'top'); if (q === 'top' || q === 'side') localStorage.setItem('nav-layout', q); } catch (e) { pref = q || 'top'; }
  document.documentElement.classList.toggle('topnav', pref !== 'side');
}
function closeGroups(except) { $$('.nav-g.open').forEach(g => { if (g !== except) { g.classList.remove('open'); g.querySelector('.nav-gt').setAttribute('aria-expanded', 'false'); } }); }
$$('.nav-gt').forEach(b => b.addEventListener('click', () => {
  if (!document.documentElement.classList.contains('topnav') || $('.side').classList.contains('open')) return;   // down the side the title is a heading
  const g = b.closest('.nav-g'), open = !g.classList.contains('open');
  closeGroups(g); g.classList.toggle('open', open); b.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) { const first = g.querySelector('.nav-gm .tab'); if (first && b.matches(':focus-visible')) first.focus(); }
}));
document.addEventListener('click', e => { if (!e.target.closest('.nav-g')) closeGroups(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('.nav-g.open')) { const g = $('.nav-g.open'); closeGroups(); g.querySelector('.nav-gt').focus(); } });
$$('.nav-g').forEach(g => g.addEventListener('keydown', e => {
  if (!g.classList.contains('open')) return;
  const items = $$('.nav-gm .tab', g), i = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[0]).focus(); }
  if (e.key === 'ArrowUp') { e.preventDefault(); (items[i - 1] || items[items.length - 1]).focus(); }
}));
document.addEventListener('click', e => {
  const g = e.target.closest('[data-goto]');
  if (g) show(g.dataset.goto);
  const u = e.target.closest('[data-url]');
  if (u && D && D[u.dataset.url]) openUrl(D[u.dataset.url]);
});

// ---------------------------------------------------------------- clock
function tick() {
  const now = new Date();
  const t = now.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', timeZone: TZ });
  $('#clock').textContent = now.toLocaleDateString('en-CA', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ }) + '  ' + t;
  $('#brief-time').textContent = t;
  $('#brief-date').textContent = now.toLocaleDateString('en-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ });
}
tick();
setInterval(tick, 15000);

// ================================================================ CITY OR WARD
// The office chooses what the screens show: the whole city (0) or one of the 14 wards. Every label follows it.
let SCOPE = (() => { try { const v = localStorage.getItem('cdd-scope'); return v === null ? 0 : (+v || 0); } catch { return 0; } })();
const W = () => (D && D.scope && D.scope.ward === SCOPE) ? D.scope.name : (SCOPE ? `Ward ${SCOPE}` : 'Calgary');
const isCity = () => (D && D.scope ? D.scope.kind === 'city' : SCOPE === 0);
// a screen's own area filter: another area's view (kept per way of counting), and drawing with it in place of the
// selected one; the area chosen in the sidebar is left as it is
const PEEK = {};
async function peekView(w) {
  const key = `${(D && D.population && D.population.method) || ''}/${w}`;
  if (w === SCOPE && D) return D;
  if (!PEEK[key]) { const r = await (await api()).peek_view(w); if (!r || !r.ok) throw new Error((r && r.error) || 'That area could not be read.'); PEEK[key] = r.data; }
  return PEEK[key];
}
function withView(view, w, fn) {
  if (!view || view === D) return fn();
  const d0 = D, s0 = SCOPE;
  D = view; SCOPE = w;
  try { return fn(); } finally { D = d0; SCOPE = s0; }
}
// static words in the page that name the area: remembered once, written again whenever the view changes
const SCOPE_NODES = [];
function scopeTextInit() {
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  // published videos keep their own words: a video about Ward 5 stays about Ward 5 whichever area is picked
  for (let n = walk.nextNode(); n; n = walk.nextNode()) if (/Ward 5|2021 Census|since 2021|May 2021/.test(n.nodeValue) && !(n.parentElement && n.parentElement.closest('#view-videos'))) SCOPE_NODES.push([n, null, n.nodeValue]);
  $$('[title],[aria-label],[data-add],input[value],[placeholder]').forEach(el => ['title', 'aria-label', 'data-add', 'value', 'placeholder'].forEach(a => {
    const v = el.getAttribute(a);
    if (v && /Ward 5|2021 Census|since 2021|May 2021/.test(v) && !el.closest('#view-videos')) SCOPE_NODES.push([el, a, v]);
  }));
}
function scopeText() {
  const w = W();
  SCOPE_NODES.forEach(([n, a, t]) => {
    const y = String(CY());
    const v = t.split('Ward 5').join(w).split('2021 Census').join(y + ' Census').split('since 2021').join('since ' + y).split('May 2021').join('May ' + y);
    if (!a) n.nodeValue = v;
    else { n.setAttribute(a, v); if (a === 'value' && n.dataset.edited !== '1') n.value = v; }
  });
  document.title = 'Calgary Insight' + (SCOPE ? ` · Ward ${SCOPE}` : '');
  const sel = $('#scope-sel');
  if (sel && +sel.value !== SCOPE) sel.value = String(SCOPE);
}
function scopeOptions() {
  const sel = $('#scope-sel');
  if (!sel) return;
  const names = (D && D.scope && D.scope.wards) || {};
  sel.innerHTML = '<option value="0">Calgary: all wards</option>' + Array.from({ length: 14 }, (_, i) => i + 1)
    .map(w => { const c = names[w] && names[w].councillor; const last = c ? c.replace(/\s*\(.*?\)\s*/g, ' ').trim().split(/\s+/).pop() : '';
      return `<option value="${w}" title="${esc(c || '')}">Ward ${w}${last ? ' · ' + esc(last) : ''}</option>`; }).join('');
  sel.value = String(SCOPE);
}
async function setScope(w) {
  w = +w || 0;
  if (w === SCOPE && D && D.scope && D.scope.ward === w) return;
  const before = SCOPE;
  SCOPE = w;
  selected = null;                                  // community picks and filters from the last view no longer apply
  if (typeof issueFilter === 'object' && issueFilter) issueFilter.comm = '';
  if (window.resetScopeFilters) resetScopeFilters();
  scopeText();
  await loadDashboard(false);
  if (!D || !D.scope || D.scope.ward !== w) {      // that view could not load: back to the one still on screen
    SCOPE = D && D.scope ? D.scope.ward : before;
    const sel = $('#scope-sel');
    if (sel) sel.value = String(SCOPE);
    scopeText();
    return;
  }
  try { localStorage.setItem('cdd-scope', String(w)); } catch { /* storage off */ }
}
document.addEventListener('DOMContentLoaded', () => {
  scopeTextInit(); scopeOptions(); scopeText();
  const sel = $('#scope-sel');
  if (sel) sel.addEventListener('change', () => setScope(sel.value));
});

// ================================================================ DASHBOARD
window.CDD_DASH = () => D;                               // the area on screen, for the website's own scripts
let D = null, map = null, tiles = null, areaLayer = null, labelLayer = null, trafficLayer = null, cameraLayer = null;
let charts = {}, selected = null, styleArea = null, metric = 'open_per_1000', areas = 'res';
let sortKey = 'requests12', sortDir = -1;
const commName = code => (D && D.communities.find(c => c.code === code) || {}).name || code;

const METRICS = {
  open_per_1000: { label: 'Open 311 requests per 1,000 residents', short: 'open requests per 1,000 residents', d: 1, kind: 'seq', perRes: true },
  requests_per_1000: { label: '311 requests per 1,000 residents a year', short: '311 requests per 1,000 residents a year', d: 0, kind: 'seq', perRes: true },
  infra_per_1000: { label: 'Infrastructure reports per 1,000 residents a year', short: 'infrastructure reports per 1,000 residents a year (the study\'s 21 types)', d: 1, kind: 'seq', perRes: true },
  requests_change_pct: { label: 'Change in 311 requests from the comparison period', short: 'change in 311 requests', d: 1, kind: 'div', pct: true },
  growth_pct: { label: 'Population growth since the ' + CY() + ' Census', short: 'population growth since ' + CY() + '', d: 0, kind: 'seq', pct: true, perRes: true },
};
const RAMPS = {
  seq: { light: ['#E0F2FE', '#9BD7F7', '#4FB3E8', '#1A85C2', '#075985'], dark: ['#0B2537', '#0E4565', '#0F6A98', '#2C9AD3', '#7DD3FC'] },
  div: { light: ['#1D4ED8', '#93C5FD', '#F1F5F9', '#FDBA74', '#C2410C'], dark: ['#3B82F6', '#1E3A8A', '#334155', '#9A3412', '#FB923C'] },
};
const TILES = {
  light: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
};

let period = null;                                         // null: the last 12 months against the 12 before
try { period = JSON.parse(localStorage.getItem('w5-period') || 'null'); } catch { period = null; }
async function loadDashboard(force = false, quiet = false, quick = !force) {
  const btn = $('#refresh');
  btn.disabled = true; btn.classList.add('is-busy');
  if (!quiet) $('#dash-error').hidden = true;
  if (!D) $('#dash-loading').hidden = false;
  setStatus('', force ? 'Refreshing' : 'Loading');
  try {
    const asked = SCOPE, askedPeriod = JSON.stringify(period);
    const res = await (await api()).load_dashboard(force, period, SCOPE, quick);
    if (!res.ok && res.period_error) {                        // a period that can't be used: back to the default
      period = null;
      try { localStorage.removeItem('w5-period'); } catch { /* storage off */ }
      throw new Error(res.error);
    }
    if (!res.ok) throw new Error(res.error);
    D = res.data;
    if (D.scope && D.scope.ward !== SCOPE) { SCOPE = D.scope.ward; try { localStorage.setItem('cdd-scope', String(SCOPE)); } catch { /* storage off */ } }
    scopeOptions(); scopeText(); loadLayers();
    renderDashboard();
    document.dispatchEvent(new CustomEvent('cdd-dash'));          // other screens that show the area's figures
    if (res.needs_refresh) {      // a saved copy shown at once; the fresh one is built behind it and swapped in quietly
      setStatus('stale', `Updating (showing the copy from ${fmt(res.age_hours, 0)} h ago)`);
      setTimeout(async () => {
        if (SCOPE !== asked || JSON.stringify(period) !== askedPeriod) return;
        try {
          const fresh = await (await api()).load_dashboard(false, period, asked, false);
          if (fresh.ok && SCOPE === asked && JSON.stringify(period) === askedPeriod) { D = fresh.data; renderDashboard(); }
        } catch (e) { /* the saved copy stays on screen */ }
      }, 50);
    }
  } catch (e) {
    if (!quiet) {
      $('#dash-error-text').textContent = (e.message || e) + ' Check the internet connection, then try again.';
      $('#dash-error').hidden = false;
    }
    setStatus(D ? 'stale' : '', D ? 'Showing earlier data' : 'Not loaded');
  } finally {
    $('#dash-loading').hidden = true;
    btn.disabled = false; btn.classList.remove('is-busy');
  }
}
$('#refresh').addEventListener('click', () => loadDashboard(true));
$('#retry').addEventListener('click', () => loadDashboard(true));

function setStatus(cls, text) {
  const s = $('#side-status');
  s.className = 'status ' + cls;
  $('.status-text', s).textContent = text;
  s.title = text;
}

function residential() { return D.communities.filter(c => c.residential); }

function renderDashboard() {
  $('#dash-body').hidden = false;
  $('#dash-title').textContent = isCity() ? 'City of Calgary at a glance' : `${W()} at a glance`;
  const nRes = residential().length;
  const who = isCity() ? `City of Calgary, all 14 wards.` : `Ward ${D.ward.number}, Councillor ${esc(D.ward.councillor || '')}.`;
  $('#dash-sub').innerHTML = `${who} ${fmt(D.ward.residents)} residents${popMethod() === 'census2021' ? ' at the ' + CY() + ' Census' : ' today'} in ${nRes} communities <button class="link-btn small pop-chip" data-goto="settings" title="Change how residents are counted (Settings)">${icon('users')}<span>Residents: ${esc(popChip())}</span></button>`;
  $('#period-text').textContent = `${D.period} against ${D.prev_period}`;
  $('#period-pill').hidden = false;
  $('#dash-stamp').textContent = (D.stale ? 'Offline, data from ' : 'Updated ') + stampText(D.built_at);
  $('#board-period').textContent = `${D.period} against ${D.prev_period}. Open requests and residents are as of today.${D.crime ? ` Police figures: ${D.crime.period}, the latest published.` : ''}`;
  $('#tab-open-count').textContent = fmt(D.summary.open_now);
  setStatus(D.stale ? 'stale' : 'ok', D.stale ? 'Offline: earlier data' : 'Live City data');
  renderKpis();
  renderLayerMenu();
  renderMap(true);
  renderPanel(selected);
  renderCharts();
  renderFeed();
  renderPopulation();
  renderAreas();
  renderCamStrip();
  watchCams().then(pullFrames);
  renderBench();
  renderDisorder();
  renderTable();
  renderNotes();
  if (window.renderExtras) renderExtras();
  if (window.renderRepCard) renderRepCard();
  fillIssueFilters();
  if ($('#view-issues').classList.contains('is-on')) renderIssues();
  if ($('#view-cameras').classList.contains('is-on')) renderCameraWall();
  if ($('#view-families').classList.contains('is-on') && window.renderFamilies) renderFamilies();   // the screen on show follows a new ward
  if ($('#view-growth').classList.contains('is-on') && window.renderGrowth) renderGrowth();
  if ($('#view-changes') && $('#view-changes').classList.contains('is-on') && window.renderChanges) renderChanges();
  if ($('#view-elections') && $('#view-elections').classList.contains('is-on') && window.renderElections) renderElections();
  if ($('#view-elanalytics') && $('#view-elanalytics').classList.contains('is-on') && window.renderElAnalytics) renderElAnalytics();
  if (!$('#brief').hidden) renderBrief();
}

// ---------- change chips: colour plus arrow plus words, never colour alone
function chg(v, upIsBad, unit = '%', d = 1, words = 'the year before') {
  if (!isNum(v)) return '';
  const flat = Math.abs(v) < 1;
  const cls = flat ? 'flat' : upIsBad === null ? 'neutral' : (v > 0) === upIsBad ? 'bad' : 'good';
  const dir = flat ? 'flat' : v > 0 ? 'up' : 'down';
  const w = flat ? 'about the same as' : v > 0 ? 'up from' : 'down from';
  return `<span class="chg ${cls}" title="${w} ${words}">${icon(dir)}${signed(v, d, unit)}<span class="sr"> ${w} ${words}</span></span>`;
}

// ---------- status board
function spark(values) {
  const v = values.filter(isNum);
  if (v.length < 2) return '';
  const lo = Math.min(...v), hi = Math.max(...v), w = 100, h = 28;
  const pts = v.map((y, i) => [i / (v.length - 1) * w, h - 3 - (hi === lo ? .5 : (y - lo) / (hi - lo)) * (h - 6)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${line} L${w} ${h} L0 ${h} Z" fill="var(--accent-soft)" stroke="none"/>
    <path d="${line}" fill="none" stroke="var(--chart-2)" stroke-width="1.8" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`;
}
function meter(share, tick, cls = '') {
  const s = Math.max(0, Math.min(1, share || 0));
  return `<div class="meter ${cls}" aria-hidden="true"><span style="width:${(s * 100).toFixed(1)}%"></span>${isNum(tick) ? `<i class="tick" style="left:calc(${(Math.min(1, tick) * 100).toFixed(1)}% - 1px)"></i>` : ''}</div>`;
}
function versus(now, before) {
  const top = Math.max(now || 0, before || 0) || 1;
  return meter(now / top, before / top, 'vs');
}
const cmpWords = () => D && D.period_spec ? D.prev_period : 'the year before';
function renderKpis() {
  const s = D.summary, w = D.ward, dv = D.development;
  const over90 = s.open_now ? s.open_over_90_days / s.open_now : 0;
  const cw = cmpWords();
  const asOf = (() => { const t = (D.built_at || '').slice(0, 10); const d = t ? new Date(t + 'T12:00:00') : new Date();
    return `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${d.getFullYear()}`; })();
  const c = D.crime;
  const crime = c ? [
    [`Crimes reported, ${esc(c.period)}`, fmt(c.crimes), chg(c.change_pct, true, '%', 1, 'the same months a year before'),
      `Calgary Police Service. ${fmt(c.crimes_prev)} a year before (marker). Calgary: ${signed(c.city_change_pct, 1)}`, versus(c.crimes, c.crimes_prev), 'crime'],
    ['Violent crimes', fmt(c.violent), chg(c.violent_change_pct, true, '%', 1, 'the same months a year before'),
      `Assault, robbery and other violence, not domestic. ${fmt(c.violent_prev)} a year before (marker)`, versus(c.violent, c.violent_prev), 'crime'],
  ].filter(Boolean) : [];
  const items = [
    [popMethod() === 'census2021' ? 'Residents (' + CY() + ' Census)' : 'Residents today', fmt(w.residents), popMethod() === 'census2021' ? '' : chg(w.growth_pct, null, '%', 1, 'the ' + CY() + ' Census'),
      `${CY()} Census: ${fmt(w.census2021)} (marker). ${popShort()}.${isCity() && D.population && D.population.city_now && popMethod() === 'model' ? ` The City's own estimate for Calgary is ${fmt(D.population.city_now)}: it also counts more people living in each home since ${CY()} and people in seniors' homes, residences and shelters, which the model can't see.` : ''}${['city_pace', 'city_actual'].includes(popMethod()) ? ` This is above the ${CY()} count partly because the Census counted people in private homes only; the City's total also includes people in seniors' homes, residences and shelters.` : ''}${popMethod() === 'city_actual' && D.population && D.population.actual_factor ? ` Each community: its ${CY()} count × ${fmt(D.population.actual_factor, 4)} + the growth measured from homes built there.` : ''}`, versus(w.residents, w.census2021), 'hero'],
    [`Open 311 requests as of ${asOf}`, fmt(s.open_now), '', `${fmt(s.open_over_90_days)} (${fmt(over90 * 100, 0)}%) open more than 90 days, whenever they were made`, meter(over90)],
    ...crime,
    [`311 requests, ${esc(D.period)}`, fmt(s.requests12), chg(s.requests_change_pct, null, '%', 1, cw),
      `${fmt(s.requests_per_1000, 0)} per 1,000 residents a year`, spark(D.trend.all)],
    ['Closed within 7 days', fmt(s.closed_7_days_pct, 1) + '%', isCity() ? '' : chg(s.closed_7_days_pct - s.closed_7_days_pct_city, false, ' pts', 1, 'Calgary as a whole'),
      `Of the period's requests closed so far. Calgary: ${fmt(s.closed_7_days_pct_city, 1)}% (marker)`, meter(s.closed_7_days_pct / 100, s.closed_7_days_pct_city / 100, 'vs')],
    ['Traffic incidents', fmt(s.traffic12), chg(s.traffic_change_pct, true, '%', 1, cw), `${fmt(s.traffic_prev)} in ${esc(cw)} (marker)`, versus(s.traffic12, s.traffic_prev)],
    ['Homes in building permits issued', fmt(s.issued_homes12), chg(s.issued_homes_change_pct, null, '%', 1, cw),
      `${fmt(s.new_homes12)} applied for. Planned, not yet built. ${fmt(s.issued_homes_prev)} issued in ${esc(cw)} (marker)`, versus(s.issued_homes12, s.issued_homes_prev)],
  ];
  $('#kpis').innerHTML = items.map(([label, value, change, foot, viz, cls]) => `
    <div class="kpi ${cls || ''}" role="listitem">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${value}</div>
      <div class="kpi-foot">${change}<span title="${esc(foot.replace(/<[^>]+>/g, ''))}">${foot}</span></div>
      ${viz}
    </div>`).join('');
  const hero = $('#kpis .kpi.hero');
  if (hero && D.population && D.population.live && popMethod() !== 'census2021') {
    hero.insertAdjacentHTML('beforeend', `<div class="live-pop" title="The City's forecast pace, second by second: the area's residents on the first of this month and of next month, worked out the same way as every figure here, joined by a straight line. Each morning's refresh carries on from there.">
      <span class="live-dot" aria-hidden="true"></span><span class="live-pop-n" id="live-pop-n"></span><small id="live-pop-rate"></small></div>`);
    tickPop();
  }
}
// the live population counter (dashboard.population_live): a straight line between this month's and next month's figures
function livePop(t = Date.now()) {
  const L = D && D.population && D.population.live;
  if (!L || !L.end_ms || L.end_ms <= L.start_ms) return null;
  return L.from + (L.to - L.from) * (t - L.start_ms) / (L.end_ms - L.start_ms);
}
function tickPop() {
  const n = $('#live-pop-n'), L = D && D.population && D.population.live;
  if (!n || !L) return;
  const v = livePop();
  n.textContent = isNum(v) ? fmt(Math.round(v)) : '';      // whole people: it is an estimate along the forecast, not a count
  const r = $('#live-pop-rate');
  if (r && !r.textContent) r.textContent = ` estimate, moving at the forecast pace · ${L.per_day >= 0 ? '+' : '−'}${fmt(Math.abs(L.per_day), Math.abs(L.per_day) < 10 ? 1 : 0)} a day (the figure above is this month's)`;
}
setInterval(tickPop, 1000);

// ---------- map
function scale() {
  const m = METRICS[metric];
  const ramp = RAMPS[m.kind][isDark() ? 'dark' : 'light'];
  const vals = residential().map(c => c[metric]).filter(isNum);
  let breaks;
  if (m.kind === 'div') {
    const top = Math.max(1, ...vals.map(Math.abs));
    breaks = [-top, -.6 * top, -.2 * top, .2 * top, .6 * top, top];
  } else if (isCity() && vals.length > 20) {       // 200-odd communities: equal shares in each shade, so a few extremes don't wash out the rest
    const v = [...vals].sort((a, b) => a - b);
    breaks = [0, 1, 2, 3, 4, 5].map(i => v[Math.min(v.length - 1, Math.round((v.length - 1) * i / 5))]);
  } else {
    const lo = Math.min(...vals), hi = Math.max(...vals);
    breaks = [0, 1, 2, 3, 4, 5].map(i => lo + (hi - lo) * i / 5);
  }
  const color = v => {
    if (!isNum(v)) return null;
    for (let i = 0; i < 5; i++) if (v <= breaks[i + 1] + 1e-9) return ramp[i];
    return ramp[4];
  };
  return { ramp, breaks, color };
}
function metricColor(c, sc) {
  if (!c.residential) return null;
  if (metric === 'growth_pct' && !isNum(c.growth_pct)) return sc.ramp[4];      // built after the 2021 Census
  return sc.color(c[metric]);
}
function fmtMetric(c, m = metric) {
  const v = c[m], M = METRICS[m];
  if (m === 'growth_pct' && c.residential && !isNum(v)) return 'built since ' + CY() + '';
  if (!isNum(v)) return M.perRes ? (c.few_residents ? 'too few residents for a rate' : 'no residents') : '–';
  return M.pct ? signed(v, M.d) : fmt(v, M.d);
}
// a traffic incident: full details, and searches for news about it (opened in the browser)
function trafficPopup(p) {
  const dp = ymdParts(p.date); const day = dp ? `${MON_LONG[dp[1] - 1]} ${dp[2]}, ${dp[0]}` : '';   // search words, as news sites write dates
  const place = String(p.where || '').replace(/\b(NE|NW|SE|SW)\b/g, '').replace(/\s+/g, ' ').trim();
  const q = `${place} Calgary ${day}`;
  const news = 'https://www.google.com/search?tbm=nws&q=' + encodeURIComponent(`"${place}" Calgary crash OR collision OR incident`) + '&tbs=' + encodeURIComponent(`cdr:1,cd_min:${p.date.slice(5, 7)}/${p.date.slice(8)}/${p.date.slice(0, 4)},cd_max:${p.date.slice(5, 7)}/${p.date.slice(8)}/${p.date.slice(0, 4)}`);
  const web = 'https://www.google.com/search?q=' + encodeURIComponent(q + ' traffic');
  return `<div class="tr-pop"><strong>${esc(p.where)}</strong>
    <p>${esc(longDate(p.date))}${p.time ? ', ' + esc(p.time) + ' (Calgary time)' : ''}</p>
    <p>${esc(p.what || 'Traffic incident.')}</p>
    <div class="tr-btns"><button class="btn primary" data-open="${esc(news)}">${icon('search')}<span>Find news</span></button>
      <button class="btn" data-open="${esc(web)}">${icon('open')}<span>Search the web</span></button></div>
    <p class="tr-note">Opens a Google search in your browser for news on that day near this location. The City's record has no more detail.</p></div>`;
}
const camIcon = () => L.divIcon({ className: '', html: `<div class="cam-marker">${icon('camera')}</div>`, iconSize: [22, 22], iconAnchor: [11, 11] });
const camSrc = url => url + (url.includes('?') ? '&' : '?') + 't=' + Math.floor(Date.now() / 60000);

// Base maps: Google when the office saves a Google Maps key, otherwise OpenStreetMap (open source), Esri satellite
// imagery, or the plain grey map. maxNativeZoom keeps the map from asking for tiles that don't exist.
let mapStyle = 'street', googleKey = '', googleReady = null, tileErrors = 0;
const BASES = {
  street: () => L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxNativeZoom: 19, maxZoom: 19, attribution: '&copy; OpenStreetMap contributors. Data: City of Calgary' }),
  street_esri: () => L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    { maxNativeZoom: 18, maxZoom: 19, attribution: 'Tiles &copy; Esri. Data: City of Calgary' }),
  satellite: () => L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxNativeZoom: 18, maxZoom: 19, attribution: 'Imagery &copy; Esri. Data: City of Calgary' }),
  grey: () => L.tileLayer(TILES[isDark() ? 'dark' : 'light'], { maxNativeZoom: 16, maxZoom: 18, attribution: 'Tiles &copy; Esri. Data: City of Calgary' }),
};
function loadGoogle() {
  if (!googleKey) return Promise.resolve(false);
  if (googleReady) return googleReady;
  googleReady = new Promise(resolve => {
    window.gm_authFailure = () => { googleFailed = true; resolve(false); if (map) setBase(); };
    const s = document.createElement('script');
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(googleKey) + '&v=weekly&callback=__gmReady';
    window.__gmReady = () => {
      const p = document.createElement('script');
      p.src = 'vendor/leaflet.googlemutant.js';
      p.onload = () => resolve(true);
      p.onerror = () => resolve(false);
      document.head.appendChild(p);
    };
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
    setTimeout(() => resolve(false), 12000);
  });
  return googleReady;
}
let googleFailed = false;
function baseLayer(style) {
  if (googleKey && !googleFailed && window.L && L.gridLayer && L.gridLayer.googleMutant && style !== 'grey')
    return L.gridLayer.googleMutant({ type: style === 'satellite' ? 'hybrid' : 'roadmap', maxZoom: 19 });
  return (BASES[style] || BASES.street)();
}
function setBase() {
  if (!map) return;
  if (tiles) tiles.remove();
  tiles = baseLayer(mapStyle).addTo(map);
  tiles.bringToBack && tiles.bringToBack();
  tileErrors = 0;
  if (tiles.on) tiles.on('tileerror', () => {          // OpenStreetMap refused: use the free Esri street map instead
    if (++tileErrors === 6 && mapStyle === 'street' && !(googleKey && !googleFailed)) { tiles.remove(); tiles = BASES.street_esri().addTo(map); tiles.bringToBack(); }
  });
  $$('#base-seg button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.base === mapStyle)));
  $('#base-note').textContent = googleKey && !googleFailed && mapStyle !== 'grey' ? 'Google Maps' : googleFailed ? 'Google refused the key: OpenStreetMap shown' : '';
}
function wardBounds() { return L.geoJSON(D.geo.ward).getBounds(); }
function zoomToWard() { if (map && D) { map.invalidateSize(); map.fitBounds(wardBounds(), { padding: [16, 16] }); } }
function zoomToCommunity(code) {
  const g = D && D.geo.communities[code];
  if (map && g) map.fitBounds(L.geoJSON(g).getBounds(), { padding: [30, 30], maxZoom: 15 });
}
const overlay = {};                                        // extra layers, switched on in the layer menu
const LAYERS = [
  ['traffic', 'Traffic incidents, last 90 days', true],
  ['cameras', 'Traffic cameras', true],
  ['childcare', 'Child care', false],
  ['schools', 'Schools', false],
  ['devpermits', 'Development permits', false],
  ['roadwork', 'Being built: City projects, roads, large permits', false],
  ['amenities', 'Recreation, libraries, community centres', false],
  ['playgrounds', 'Playgrounds', false],
  ['stops', 'Transit stops', false],
  ['buses', 'Buses and CTrains, live', false],
];
const layerOn = {};
LAYERS.forEach(([k, , on]) => { layerOn[k] = on; });
// the whole city starts with no point layers (thousands of incidents and cameras would hide the shading); each scope remembers its own
const layerKey = () => (SCOPE === 0 ? 'cdd-layers-city' : 'w5-layers');
let layersFor = null;
function loadLayers() {
  const k = layerKey();
  if (layersFor === k) return;
  layersFor = k;
  LAYERS.forEach(([key, , on]) => { layerOn[key] = SCOPE === 0 ? false : on; });
  try { Object.assign(layerOn, JSON.parse(localStorage.getItem(k) || '{}')); } catch { /* storage off */ }
}
loadLayers();
function dotIcon(cls, html = '') { return L.divIcon({ className: '', html: `<div class="mk ${cls}">${html}</div>`, iconSize: [16, 16], iconAnchor: [8, 8] }); }

function renderMap(fit = false) {
  if (!map) {
    map = L.map('map', { zoomControl: false, attributionControl: true, scrollWheelZoom: false, zoomSnap: .25, maxZoom: 19 });
    // the mouse wheel scrolls the page until the map is clicked, so scrolling past the map doesn't zoom it
    map.on('click focus', () => map.scrollWheelZoom.enable());
    map.on('mouseout', () => map.scrollWheelZoom.disable());
    L.control.zoom({ position: 'topright' }).addTo(map);
    const home = L.control({ position: 'topright' });
    home.onAdd = () => {
      const b = L.DomUtil.create('button', 'map-home');
      b.type = 'button'; b.title = 'Zoom to ' + W() + ''; b.setAttribute('aria-label', 'Zoom to ' + W() + '');
      b.innerHTML = icon('home');
      L.DomEvent.on(b, 'click', e => { L.DomEvent.stop(e); zoomToWard(); });
      return b;
    };
    home.addTo(map);
    map.on('zoomend', () => {
      $('#map').classList.toggle('zoomed-in', map.getZoom() >= 14);
      if (areaLayer && styleArea) areaLayer.eachLayer(l => { if (l.feature && l.feature.properties && l.feature.properties.code) l.setStyle(styleArea(l.feature)); });
    });
    new ResizeObserver(() => { if (map && $('#map').offsetWidth) map.invalidateSize(); }).observe($('#map'));
    setBase();
    fit = true;
  } else if (mapStyle === 'grey') setBase();
  if (fit) zoomToWard();
  [areaLayer, labelLayer, trafficLayer, cameraLayer, ...Object.values(overlay)].forEach(l => l && l.remove());
  Object.keys(overlay).forEach(k => delete overlay[k]);
  const sc = scale();
  const line = cssv('--fg'), edge = cssv('--card');
  // outlines: the City boundary and every ward, under Ward 5
  if (D.geo.city) overlay.city = L.geoJSON(D.geo.city, { style: { color: '#334155', weight: 2.5, fill: false, dashArray: '6 4', interactive: false } }).addTo(map);
  if (D.geo.wards) {
    overlay.wards = L.layerGroup().addTo(map);
    const w5 = D.geo.ward ? L.geoJSON(D.geo.ward).getBounds().pad(0.02) : null;
    Object.entries(D.geo.wards).forEach(([n, g]) => {
      if (!isCity() && n === String(SCOPE)) return;     // the ward on screen has its own outline
      const lay = L.geoJSON(g, { style: { color: '#64748B', weight: 1, fill: false, opacity: .7, interactive: false } }).addTo(overlay.wards);
      if (w5 && !isCity() && !w5.intersects(lay.getBounds())) return;      // name only the wards next to the one on screen
      L.tooltip({ permanent: true, direction: 'center', className: 'ward-label', interactive: false })
        .setLatLng(lay.getBounds().getCenter()).setContent('Ward ' + n).addTo(overlay.wards);
    });
  }
  const features = D.communities.filter(c => D.geo.communities[c.code])
    .map(c => ({ type: 'Feature', properties: c, geometry: D.geo.communities[c.code] }));
  styleArea = f => {
    const c = f.properties, fill = metricColor(c, sc);
    // shading fades as you zoom in, so streets and roofs show through; outlines stay
    const z = map.getZoom ? map.getZoom() : 12;
    const fade = z >= 16 ? .12 : z >= 15 ? .25 : z >= 14 ? .4 : 1;
    const strong = mapStyle === 'grey' ? .85 : mapStyle === 'satellite' ? .55 : .7;
    const base = fill
      ? { color: z >= 14 ? fill : edge, weight: z >= 14 ? 2.5 : 1.5, fillColor: fill, fillOpacity: strong * fade, dashArray: null }
      : { color: cssv('--border-strong'), weight: 1, fillColor: cssv('--muted-2'), fillOpacity: .45 * fade, dashArray: '4 3' };
    return c.code === selected ? { ...base, color: line, weight: 3.5, dashArray: null } : base;
  };
  areaLayer = L.geoJSON({ type: 'FeatureCollection', features }, {
    style: styleArea,
    onEachFeature: (f, layer) => {
      const c = f.properties;
      layer.bindTooltip(`<strong>${esc(c.name)}</strong><br>${esc(METRICS[metric].label)}: <b>${fmtMetric(c)}</b>` +
        (c.residential ? `<br>${fmt(c.residents)} residents${popMethod() === 'census2021' ? ` (${CY()} Census count)` : ` today, ${fmt(c.census2021)} at the ${CY()} Census`}` : '<br>Business or industrial area'),
        { sticky: true, className: 'area-tip' });
      layer.on('click', () => select(c.code, true));
      layer.on('mouseover', () => layer.setStyle({ weight: 3, color: line }));
      layer.on('mouseout', () => areaLayer.resetStyle(layer));
    }
  }).addTo(map);
  L.geoJSON(D.geo.ward, { style: { color: '#0369A1', weight: 4, fill: false, interactive: false } }).addTo(areaLayer);

  if (isCity() && D.geo.wards)                 // the whole city: ward lines for orientation, community names when zoomed in
    Object.values(D.geo.wards).forEach(g => L.geoJSON(g, { style: { color: '#0369A1', weight: 1.6, fill: false, interactive: false } }).addTo(areaLayer));
  labelLayer = L.layerGroup();
  if (!isCity() || map.getZoom() >= 13) labelLayer.addTo(map);
  if (!map._labelsByZoom) {
    map._labelsByZoom = true;
    map.on('zoomend', () => { if (!labelLayer) return; const want = !isCity() || map.getZoom() >= 13;
      if (want && !map.hasLayer(labelLayer)) labelLayer.addTo(map); else if (!want && map.hasLayer(labelLayer)) labelLayer.remove(); });
  }
  areaLayer.eachLayer(l => {
    const c = l.feature && l.feature.properties;
    if (!c || !c.residential || !l.getBounds) return;
    L.tooltip({ permanent: true, direction: 'center', className: 'map-label', interactive: false })
      .setLatLng(l.getCenter()).setContent(esc(c.name)).addTo(labelLayer);
  });

  if (layerOn.traffic) {
    const dot = cssv('--danger');
    trafficLayer = L.layerGroup(D.traffic_points.map(p => L.circleMarker([p.lat, p.lon], {
      radius: 4, color: '#fff', weight: 1, fillColor: dot, fillOpacity: .95
    }).bindTooltip(`<strong>${esc(p.where)}</strong><br>${esc(longDate(p.date))}${p.time ? ', ' + esc(p.time) : ''}. Click for details and news.`, { className: 'wrap-tip' })
      .bindPopup(() => trafficPopup(p), { maxWidth: 300 }))).addTo(map);
  }
  if (layerOn.cameras) {
    cameraLayer = L.layerGroup(D.cameras.filter(c => c.near_ward).map(c => L.marker([c.lat, c.lon], { icon: camIcon(), title: c.name })
      .bindPopup(() => `<div class="cam-pop"><strong>${esc(c.name)}</strong><img src="${esc(latestSrc(c.url))}" alt="Traffic camera at ${esc(c.name)}"></div>`, { maxWidth: 300 })))
      .addTo(map);
  }
  if (window.extraMapLayers) extraMapLayers(overlay, layerOn);
  $('#map-sub').textContent = 'Shaded by ' + METRICS[metric].short + (METRICS[metric].perRes ? '. Grey areas have no residents.' : '.');
  renderLegend(sc);
}
function renderLegend(sc) {
  const M = METRICS[metric];
  const f = v => M.pct ? signed(v, 0) : fmt(v, M.d);
  $('#legend').innerHTML = `<div class="legend-title">${esc(M.label)}</div>
    <div class="legend-scale">${sc.ramp.map((col, i) => `<span class="sw" style="background:${col}" title="${f(sc.breaks[i])} to ${f(sc.breaks[i + 1])}"></span>`).join('')}</div>
    <div class="legend-ends fig"><span>${f(sc.breaks[0])}</span><span>${f(sc.breaks[5])}</span></div>`;
}
function renderLayerMenu() {
  const avail = k => ({
    childcare: !!(D.families && D.families.child_care), schools: !!(D.families && D.families.schools),
    devpermits: !!D.development, roadwork: !!((D.roadwork && D.roadwork.length) || (D.projects && D.projects.length) || (D.big_permits && D.big_permits.length)), amenities: !!D.amenities,
    playgrounds: !!(D.amenities && D.amenities.playgrounds), stops: !!(D.amenities && D.amenities.stops),
  }[k] ?? true);
  $('#layer-list').innerHTML = LAYERS.filter(([k]) => avail(k)).map(([k, label]) => `<label class="lyr"><input type="checkbox" data-layer="${k}" ${layerOn[k] ? 'checked' : ''}>
    <span class="lyr-sw lyr-${k}" aria-hidden="true"></span>${esc(label)}</label>`).join('') +
    `<div class="lyr-sep"></div><div class="lyr-note"><span class="sw hatch"></span>Business and industrial areas</div>
     <div class="lyr-note"><span class="ward-line"></span>${W()} &nbsp;<span class="ward-line other"></span>Other wards &nbsp;<span class="ward-line city"></span>City</div>`;
  $$('#layer-list input').forEach(i => i.addEventListener('change', () => {
    layerOn[i.dataset.layer] = i.checked;
    try { localStorage.setItem(layerKey(), JSON.stringify(layerOn)); } catch { /* storage off */ }
    renderMap();
  }));
  const n = LAYERS.filter(([k]) => avail(k) && layerOn[k]).length;
  $('#layers-btn-n').textContent = n ? String(n) : '';
}
$('#layers-btn').addEventListener('click', e => {
  const m = $('#layer-menu');
  m.hidden = !m.hidden;
  e.currentTarget.setAttribute('aria-expanded', String(!m.hidden));
});
document.addEventListener('click', e => { if (!e.target.closest('#layer-menu, #layers-btn')) { $('#layer-menu').hidden = true; $('#layers-btn').setAttribute('aria-expanded', 'false'); } });
$$('#base-seg button').forEach(b => b.addEventListener('click', async () => {
  mapStyle = b.dataset.base;
  setBase();
  renderMap();
  const a = await api();
  if (a.set_map_style) a.set_map_style(mapStyle);
}));
wireSeg($('#metric-seg'), v => { metric = v; renderMap(); renderPanel(selected); });

// ---------- selection shared by map, panel and table
function select(code, zoom = false) {
  renderPanel(code);
  if (code && zoom) zoomToCommunity(code);
  if (!code && zoom) zoomToWard();
  $$('#comm-table tbody tr').forEach(tr => tr.classList.toggle('is-sel', tr.dataset.code === code));
}

// ---------- side panel: ranked list, or one community
function renderPanel(code) {
  const p = $('#panel');
  selected = code;
  if (window.onCommunityPanel) { try { window.onCommunityPanel(code); } catch (e) { /* the panel still shows */ } }
  if (areaLayer && styleArea) areaLayer.eachLayer(l => { if (l.feature && l.feature.properties.code) l.setStyle(styleArea(l.feature)); });
  if (!code) {
    const M = METRICS[metric], sc = scale();
    const val = c => isNum(c[metric]) ? c[metric] : (metric === 'growth_pct' ? Infinity : null);
    const list = residential().filter(c => val(c) !== null).sort((a, b) => val(b) - val(a));
    const top = Math.max(...list.map(c => isFinite(val(c)) ? Math.abs(val(c)) : 0)) || 1;
    p.innerHTML = `<div class="card-head"><div><h2>Ranked by ${esc(M.short)}</h2><p class="card-sub">Residential communities. Select one for its details.</p></div></div>
      <ol class="rank">${list.map((c, i) => `<li><button data-code="${c.code}" aria-label="${esc(c.name)}, ${fmtMetric(c)}">
        <span class="pos">${i + 1}</span><span class="nm">${esc(c.name)}${c.growing ? '<span class="tag">Growing</span>' : ''}</span><span class="vl">${fmtMetric(c)}</span>
        <span class="bar"><span style="width:${(isFinite(val(c)) ? Math.abs(val(c)) / top * 100 : 100).toFixed(1)}%;background:${metricColor(c, sc)}"></span></span></button></li>`).join('')}</ol>
      <p class="panel-foot">Growing: more than 30% more residents than at the ${CY()} Census, counted with ${popWords()}.</p>`;
    $$('.rank button', p).forEach(b => b.addEventListener('click', () => select(b.dataset.code, true)));
    return;
  }
  const c = D.communities.find(x => x.code === code);
  if (!c) return renderPanel(null);
  const stat = (label, value, extra = '') => `<div class="stat"><dt>${label}</dt><dd>${value}${extra}</dd></div>`;
  const how = { 'people per home': 'homes standing today x 2021 people per home', 'household size': 'new homes x 2021 household size',
    'city average': 'homes standing today x the city-wide people per home (no 2021 count)' }[c.pop_method] || '';
  p.innerHTML = `<button class="back" id="panel-back">${icon('back')}All communities</button>
    <div class="detail">
      <h2>${esc(c.name)}</h2>
      ${c.residential ? `<p class="card-sub">${fmt(c.residents)} residents${popMethod() === 'census2021' ? ` (${CY()} Census count)` : ' today'}. ${CY()} Census: ${c.census2021 ? fmt(c.census2021) : 'not yet built'}.</p>`
        : '<p class="card-sub">Business or industrial area</p>'}
      ${c.growing ? `<span class="flag">${icon('home')}${isNum(c.growth_pct) ? signed(c.growth_pct, 0) + ' since the ' + CY() + ' Census' : 'Built since the ' + CY() + ' Census'}</span>` : ''}
      <dl class="stats">
        ${c.residential ? stat(popMethod() === 'census2021' ? 'Residents (' + CY() + ' Census)' : 'Residents today (' + popChip() + ')', fmt(c.residents), popMethod() === 'census2021' ? '' : chg(c.growth_pct, null, '%', 0, 'the ' + CY() + ' Census')) : ''}
        ${stat('311 requests, ' + esc(D.period), fmt(c.requests12), chg(c.requests_change_pct, null, '%', 1, cmpWords()))}
        ${c.residential ? stat('311 requests per 1,000 a year', fmt(c.requests_per_1000, 0), `<small>${fmt(c.requests_per_1000_prev, 0)} in the comparison period</small>`) : ''}
        ${c.residential ? stat('Infrastructure reports per 1,000 a year', fmt(c.infra_per_1000, 1), `<small>${fmt(c.infra_per_1000_prev, 1)} in the comparison period</small>`) : ''}
        ${stat('Still open as of today', fmt(c.open), `<small>${fmt(c.open_over_90_days)} open more than 90 days</small>`)}
        ${c.residential ? stat('Open requests per 1,000', fmt(c.open_per_1000, 1)) : ''}
        ${stat('Homes in permits issued', fmt(c.issued_homes12), `<small>${fmt(c.new_homes12)} applied for</small>`)}
        ${D.development ? stat('Development permit applications', fmt(c.dev_permits12)) : ''}
        ${communityExtras(c)}
      </dl>
      ${c.residential ? `<p class="drawer-note">${popMethod() === 'model' || (popMethod() === 'city_pace' && !c.census2021) ? `Population (growth model): ${esc(how)}. ` : `Residents counted with ${esc(popWords())}. `}${fmt(c.homes_now)} homes lived in today, ${fmt(c.homes_census)} at the ${CY()} Census.</p>` : ''}
      <h3 class="sub-h">Most common open requests</h3>
      <ul class="open-list">${c.open_top.map(o => `<li><span>${esc(niceType(o.type))}</span><span class="n">${fmt(o.n)}</span><small>Oldest still open: ${esc(o.oldest)}</small></li>`).join('') || '<li><span>None open</span></li>'}</ul>
      ${c.open ? `<button class="btn" id="panel-issues" style="margin-top:12px">${icon('list')}<span>See all ${fmt(c.open)} open issues in ${esc(c.name)}</span></button>` : ''}
      ${window.CDD_COMM_LINK ? window.CDD_COMM_LINK(c) : ''}
    </div>`;
  $('#panel-back').addEventListener('click', () => select(null, true));
  $('#panel-issues')?.addEventListener('click', () => { issueFilter.comm = c.code; $('#f-comm').value = c.code; show('issues'); });
}

function communityExtras(c) {
  if (!c.residential) return '';
  const stat = (label, value, extra = '') => `<div class="stat"><dt>${label}</dt><dd>${value}${extra}</dd></div>`;
  const cc = D.families && D.families.child_care, sc = D.families && D.families.schools, am = D.amenities;
  let out = '';
  const b = cc && cc.by_comm[c.code];
  if (b) out += stat('Licensed child care spaces', fmt(b.spaces), `<small>${isNum(b.per_100_0_14) ? fmt(b.per_100_0_14, 1) + ' per 100 children aged 0 to 14' : ''}</small>`);
  if (sc) {
    const list = sc.schools.filter(x => x.comm === c.code && x.latest);
    out += stat('Students in its schools, ' + esc(sc.latest_year), fmt(list.reduce((t, x) => t + x.latest, 0)), `<small>${list.length} school${list.length === 1 ? '' : 's'}</small>`);
  }
  const a = am && am.by_comm[c.code];
  if (a) out += stat('Playgrounds, transit stops', `${fmt(a.playgrounds)}, ${fmt(a.stops)}`, `<small>${fmt(a.facilities)} recreation facilities, libraries or community centres</small>`);
  return out;
}

// ---------- charts
function chartTheme() {
  Chart.defaults.font.family = "'Fira Sans', 'Segoe UI', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = cssv('--chart-text');
  Chart.defaults.borderColor = cssv('--chart-grid');
}
const tooltipStyle = () => ({
  backgroundColor: cssv('--card-solid') || cssv('--card'), titleColor: cssv('--fg'), bodyColor: cssv('--fg-2'), borderColor: cssv('--border-strong'),
  borderWidth: 1, padding: 10, cornerRadius: 6, boxPadding: 4, animation: { duration: 0 }, caretSize: 6, titleFont: { weight: '600' }, bodyFont: { family: "'Fira Code', monospace" },
});
function renderCharts() {
  chartTheme();
  Object.values(charts).forEach(c => c.destroy());
  const m = D.trend.months, all = D.trend.all, pm = D.trend.prev_months || [], prev = D.trend.prev || [];
  const labels = m.map(x => monthLabel(x, m.length > 12 ? { month: 'short', year: '2-digit' } : { month: 'short' }));
  const c1 = cssv('--chart-1'), c2 = cssv('--chart-2');
  const my = x => x ? monthLabel(x, { month: 'short', year: 'numeric' }) : '';
  const range = (a) => a.length ? `${my(a[0])} to ${my(a[a.length - 1])}` : '';
  $('#trend-sub').textContent = `${W()}, ${range(m)} against ${range(pm)}`;
  charts.trend = new Chart($('#trend'), {
    type: 'line',
    data: { labels, datasets: [
      { label: range(m), data: all, borderColor: c2, backgroundColor: c2, tension: .3, pointRadius: 3, pointHoverRadius: 5, borderWidth: 2.5 },
      { label: 'Comparison: ' + range(pm), data: prev, borderColor: c1, backgroundColor: c1, borderDash: [6, 4], tension: .3, pointRadius: 0, pointHoverRadius: 4, borderWidth: 2 }] },
    options: {
      maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      layout: { padding: { bottom: 4 } },
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'line', boxWidth: 28, padding: 14 } },
        tooltip: { ...tooltipStyle(), callbacks: {
          title: () => '',
          label: ctx => ` ${my(ctx.datasetIndex ? pm[ctx.dataIndex] : m[ctx.dataIndex])}: ${fmt(ctx.parsed.y)}`,
          afterBody: items => {
            const i = items[0].dataIndex, a = all[i], b = prev[i];
            return isNum(a) && b ? ` Change: ${signed(pct(a, b), 1)}` : '';
          } } },
      },
      scales: { y: { beginAtZero: true, grid: { color: cssv('--chart-grid') }, border: { display: false }, ticks: { callback: v => fmt(v) } },
                x: { grid: { display: false } } }
    }
  });
  const top = D.open_by_type.slice(0, 8);
  const short = t => { const s = niceType(t); return s.length > 30 ? s.slice(0, 29) + '…' : s; };
  charts.open = new Chart($('#open-types'), {
    type: 'bar',
    data: { labels: top.map(t => short(t.type)), datasets: [{ label: 'Open requests', data: top.map(t => t.n), backgroundColor: cssv('--chart-bar'), borderRadius: 3, barPercentage: .75 }] },
    options: {
      indexAxis: 'y', maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { ...tooltipStyle(), callbacks: {
        title: items => niceType(top[items[0].dataIndex].type),
        label: ctx => ` ${fmt(ctx.parsed.x)} open`, afterLabel: ctx => ' Oldest still open: ' + top[ctx.dataIndex].oldest } } },
      scales: { x: { grid: { color: cssv('--chart-grid') }, border: { display: false }, ticks: { callback: v => fmt(v) } },
                y: { grid: { display: false }, ticks: { font: { size: 11 }, color: cssv('--fg-2') } } }
    }
  });
}

// ---------- newest reports
function feedItems(n) {
  return D.newest.slice(0, n).map(r => ({ ...r, name: commName(r.comm) }));
}
function renderFeed() {
  $('#feed').innerHTML = feedItems(8).map(r => `<li><span class="t">${esc(niceType(r.type))}</span>
    <span class="status-tag ${r.status === 'Open' ? 'open' : 'closed'}">${esc(r.status)}</span>
    <span class="m">${esc(r.name)}, ${longDate(r.date)}. Request ${esc(r.id)}</span></li>`).join('');
}

// ---------- population today against the 2021 Census
function renderPopulation() {
  const list = residential().slice().sort((a, b) => b.residents - a.residents);
  const top = Math.max(...list.map(c => Math.max(c.residents || 0, c.census2021 || 0)), 1);
  $('#pop-sub').textContent = `${W()}: ${fmt(D.ward.residents)} today, ${fmt(D.ward.census2021)} at the ${CY()} Census (${signed(D.ward.growth_pct, 1)}). Recalculated at every refresh.`;
  const prow = c => `<div class="prow">
      <span class="lbl" title="${esc(c.name)}">${esc(c.name)}</span>
      <span class="ptrack" title="${fmt(c.residents)} today, ${fmt(c.census2021)} in 2021"><span class="m" style="width:${(c.residents / top * 100).toFixed(1)}%"></span>
        ${c.census2021 ? `<i class="c" style="left:calc(${(c.census2021 / top * 100).toFixed(1)}% - 1px)"></i>` : ''}</span>
      <span class="v">${fmt(c.residents)}<small>${c.census2021 ? `2021: ${fmt(c.census2021)} (${signed(c.growth_pct, 0)})` : 'Built since ' + CY() + ''}</small></span></div>`;
  const SHOW = 10;
  $('#popcmp').innerHTML = `<div class="popcmp">${list.slice(0, SHOW).map(prow).join('')}</div>${list.length > SHOW ? `<details class="dash-more"><summary>The other ${fmt(list.length - SHOW)} communities</summary><div class="popcmp">${list.slice(SHOW).map(prow).join('')}</div></details>` : ''}
    <div class="pop-legend"><span><i></i>Today, ${esc(popWords())}</span><span><i class="c"></i>${CY()} Census</span></div>`;
}

// ---------- requests by City service area
function renderAreas() {
  const list = D.service_areas.slice(0, 9);
  const top = Math.max(...list.map(a => Math.max(a.n12, a.prev)), 1);
  $('#areas-sub').textContent = `${D.period}, with the change from ${cmpWords()}`;
  $('#areas').innerHTML = `<ul class="hbars">${list.map(a => `<li><span class="lbl" title="${esc(a.area)}">${esc(a.area)}</span>
    <span class="track"><span style="width:${a.n12 / top * 100}%"></span></span>
    <span class="v">${fmt(a.n12)}<small>${signed(a.change_pct, 0)}</small></span></li>`).join('')}</ul>`;
}

// ---------- cameras
// Each camera: the City publishes one still image, replaced about once a minute. The app keeps the images of the
// last 30 minutes (camfeed.py) and plays them on a loop, oldest to newest, holding on the newest.
const REPLAY = {};                         // url -> [{t, src}]
const FRAME_MS = 450, HOLD_FRAMES = 6;     // speed of the loop; pause on the newest image
let replayTick = 0;
const clockTime = t => new Date(t * 1000).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
function latestSrc(url) { const f = REPLAY[url]; return f && f.length ? f[f.length - 1].src : camSrc(url); }
function camCard(c) {
  const f = REPLAY[c.url] || [];
  // labels sit above and below the picture, never on it, so the camera's own date and time stay readable
  return `<button class="cam" data-cam="${esc(c.url)}" aria-label="Traffic camera at ${esc(c.name)}, replay of the last 30 minutes">
    <span class="cam-top">${c.in_ward ? '<span class="badge-in">' + W() + '</span>' : c.near_ward ? '<span class="badge-in near">Nearby</span>' : '<span></span>'}
    <span class="live" data-stamp>${f.length ? clockTime(f[f.length - 1].t) : 'Latest'}</span></span>
    <span class="cam-pic"><img src="${esc(latestSrc(c.url))}" alt="" loading="lazy" onerror="this.style.visibility='hidden';this.nextElementSibling.hidden=false">
    <span class="off" hidden>Camera offline</span>
    <span class="progress" aria-hidden="true"><i></i></span></span>
    <span class="cap">${esc(c.name)}</span></button>`;
}
function wardCams() { return D.cameras.filter(c => c.near_ward).sort((a, b) => (b.in_ward - a.in_ward) || a.name.localeCompare(b.name)); }
function renderCamStrip() { $('#camstrip').innerHTML = wardCams().filter(c => c.in_ward).slice(0, 4).map(camCard).join(''); }
let camScope = 'ward';
function renderCameraWall() {
  if (!D) return;
  const list = camScope === 'ward' ? wardCams() : D.cameras.slice().sort((a, b) => a.name.localeCompare(b.name));
  $('#cam-sub').textContent = `${list.length} cameras ${camScope === 'ward' && !isCity() ? `in and near ${W()} (${D.cameras.filter(c => c.in_ward).length} inside the ward)` : 'across Calgary'}. Each plays its images from the last 30 minutes on a loop; the City adds a new image about once a minute.`;
  $('#camgrid').innerHTML = list.map(camCard).join('');
  watchCams();
}
wireSeg($('#cam-seg'), v => { camScope = v; renderCameraWall(); });

// which cameras the app collects: Ward 5 and nearby always, plus whatever is on screen
async function watchCams() {
  if (!D) return;
  const urls = wardCams().map(c => c.url).concat($$('.cam[data-cam]').map(b => b.dataset.cam));
  const a = await api();
  if (a.cam_watch) a.cam_watch([...new Set(urls)]);
}
function b64ToUrl(b64) {
  const bin = atob(b64), buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([buf], { type: 'image/jpeg' }));
}
let pulling = false;
async function pullFrames() {
  if (pulling) return;
  pulling = true;
  try {
    const a = await api();
    if (!a.cam_frames) return;
    for (let round = 0; round < 40; round++) {          // the first pull after a restart comes in parts
      const seen = {};
      Object.entries(REPLAY).forEach(([u, f]) => { if (f.length) seen[u] = f[f.length - 1].t; });
      const res = await a.cam_frames(seen);
      if (!res || !res.ok) return;
      const cutoff = res.now - res.keep_minutes * 60;
      Object.entries(res.frames).forEach(([u, list]) => {
        const f = REPLAY[u] || (REPLAY[u] = []);
        list.forEach(x => f.push({ t: x.t, src: b64ToUrl(x.jpg) }));
      });
      Object.values(REPLAY).forEach(f => { while (f.length && f[0].t < cutoff) URL.revokeObjectURL(f.shift().src); });
      if (!res.more) break;
    }
  } finally { pulling = false; }
}
// one clock drives every camera on screen
function stepReplay() {
  if (document.hidden) return;
  replayTick++;
  const tiles = $$('.cam[data-cam]').filter(b => b.offsetParent !== null);
  tiles.forEach(b => {
    const url = b.dataset.cam, f = REPLAY[url];
    const img = $('img', b), stamp = $('[data-stamp]', b), bar = $('.progress i', b);
    if (!img) return;
    if (!f || f.length < 2) {
      if (stamp) stamp.textContent = f && f.length ? `${clockTime(f[0].t)}, replay starting` : 'Latest';
      if (bar) bar.style.width = '0';
      return;
    }
    const span = f.length + HOLD_FRAMES;
    let i = replayTick % span;
    if (i >= f.length) i = f.length - 1;
    b.dataset.i = i;
    if (img.getAttribute('src') !== f[i].src) img.src = f[i].src;
    img.style.visibility = '';
    if (stamp) stamp.textContent = i === f.length - 1 ? `Now ${clockTime(f[i].t)}` : clockTime(f[i].t);
    if (stamp) stamp.classList.toggle('past', i !== f.length - 1);
    if (bar) bar.style.width = (f.length > 1 ? i / (f.length - 1) * 100 : 100) + '%';
  });
}
setInterval(stepReplay, FRAME_MS);
setInterval(pullFrames, 10000);
setInterval(watchCams, 60000);

// ---------- the camera viewer: play, pause, step, drag through the last 30 minutes, speed
const VW = { url: null, i: 0, playing: true, speed: 1, hold: 0, timer: null };
function viewerFrames() { return REPLAY[VW.url] || []; }
function drawViewer() {
  const f = viewerFrames(), box = $('#viewer-box');
  const img = $('#viewer-img'), stamp = $('[data-stamp]', box), bar = $('.progress i', box), range = $('#viewer-range');
  if (!f.length) {
    img.src = camSrc(VW.url);
    stamp.textContent = 'Latest'; bar.style.width = '0';
    range.max = 0; range.value = 0; range.disabled = true;
    $('#viewer-count').textContent = 'Collecting images: the replay starts once the City posts its next image (about a minute).';
    return;
  }
  VW.i = Math.max(0, Math.min(VW.i, f.length - 1));
  const fr = f[VW.i], last = VW.i === f.length - 1;
  if (img.getAttribute('src') !== fr.src) img.src = fr.src;
  stamp.textContent = (last ? 'Now ' : '') + clockTime(fr.t);
  stamp.classList.toggle('past', !last);
  bar.style.width = (f.length > 1 ? VW.i / (f.length - 1) * 100 : 100) + '%';
  range.disabled = f.length < 2; range.max = f.length - 1; range.value = VW.i;
  $('#viewer-count').textContent = `Image ${VW.i + 1} of ${f.length}: ${clockTime(f[0].t)} to ${clockTime(f[f.length - 1].t)}`;
}
function viewerTick() {
  if ($('#viewer').hidden || !VW.playing) return;
  const f = viewerFrames();
  if (f.length < 2) { drawViewer(); return; }
  if (VW.i >= f.length - 1) { if (++VW.hold < HOLD_FRAMES) return; VW.hold = 0; VW.i = 0; } else VW.i++;
  drawViewer();
}
function setViewerSpeed(n) {
  VW.speed = n;
  clearInterval(VW.timer);
  VW.timer = setInterval(viewerTick, FRAME_MS / n);
  $$('#viewer-speed button').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.speed === n)));
}
function setViewerPlaying(on) {
  VW.playing = on;
  const b = $('#viewer-play');
  b.innerHTML = `${icon(on ? 'pause' : 'play')}<span>${on ? 'Pause' : 'Play'}</span>`;
}
function stepViewer(d) { setViewerPlaying(false); VW.i += d; drawViewer(); }
document.addEventListener('click', e => {
  const b = e.target.closest('.cam');
  if (!b || !D) return;
  const c = D.cameras.find(x => x.url === b.dataset.cam);
  if (!c) return;
  VW.url = c.url; VW.i = Math.max(0, viewerFrames().length - 1); VW.hold = 0;
  $('#viewer-box').dataset.cam = c.url;
  $('#viewer-name').textContent = c.name;
  $('#viewer-img').alt = 'Traffic camera at ' + c.name;
  $('#viewer-note').textContent = `${c.in_ward ? 'Inside ' + W() + '' : c.near_ward ? 'Near ' + W() + '' : c.quadrant + ' Calgary'}. City of Calgary traffic camera. The City posts a still image about once a minute and keeps no recording; this replay is the images this app collected in the last 30 minutes. Keys: space plays or pauses, the arrows step.`;
  $('#viewer').hidden = false;
  setViewerPlaying(true);
  setViewerSpeed(VW.speed);
  VW.i = 0;
  drawViewer();
  $('#viewer-close').focus();
});
$('#viewer-close').addEventListener('click', () => { $('#viewer').hidden = true; });
$('#viewer').addEventListener('click', e => { if (e.target.id === 'viewer') $('#viewer').hidden = true; });
$('#viewer-play').addEventListener('click', () => setViewerPlaying(!VW.playing));
$('#viewer-prev').addEventListener('click', () => stepViewer(-1));
$('#viewer-next').addEventListener('click', () => stepViewer(1));
$('#viewer-range').addEventListener('input', e => { setViewerPlaying(false); VW.i = +e.target.value; drawViewer(); });
$$('#viewer-speed button').forEach(b => b.addEventListener('click', () => setViewerSpeed(+b.dataset.speed)));
$('#viewer-latest').addEventListener('click', () => { setViewerPlaying(false); VW.i = viewerFrames().length - 1; drawViewer(); });
document.addEventListener('keydown', e => {
  if ($('#viewer').hidden || e.target.matches('input[type=text], textarea')) return;
  if (e.key === ' ') { e.preventDefault(); setViewerPlaying(!VW.playing); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); stepViewer(-1); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); stepViewer(1); }
});
setInterval(() => $$('img').forEach(img => {        // cameras with no replay yet: fetch the newest image each minute
  if (img.src.includes('trafficcam.calgary.ca')) img.src = img.src.replace(/t=\d+/, 't=' + Math.floor(Date.now() / 60000));
}), 60000);

// ---------- Ward 5 against Calgary
function renderBench() {
  const s = D.summary;
  // the whole city against itself says nothing: the card is for a single ward
  const city = isCity();
  $('#bench-card').hidden = city;
  $$('.bench-mate').forEach(el => { el.classList.toggle('span-6', city); el.classList.toggle('span-4', !city); });
  if (city) return;
  $('#bench-sub').textContent = D.period;
  const pair = (title, ward, city, higherIsGood) => {
    const top = Math.max(ward, city, 1);
    return `<div class="pair">
      <div class="pair-head"><span>${title}</span>${chg(ward - city, higherIsGood === null ? null : !higherIsGood, ' pts', 1, 'Calgary as a whole')}</div>
      <div class="pair-row"><span>${W()}</span><span class="track"><span style="width:${ward / top * 100}%"></span></span><span class="v">${fmt(ward, 1)}%</span></div>
      <div class="pair-row city"><span>Calgary</span><span class="track"><span style="width:${city / top * 100}%"></span></span><span class="v">${fmt(city, 1)}%</span></div>
    </div>`;
  };
  $('#bench').innerHTML = pair('Closed requests that were closed within 7 days', s.closed_7_days_pct, s.closed_7_days_pct_city, true) +
    pair('Requests made through the 311 app', s.app_share_pct, s.app_share_pct_city, null) +
    `<p class="card-note">The chips show the gap in percentage points between ${W()} and the city as a whole.</p>`;
}

// ---------- social disorder
function renderDisorder() {
  const pd = D.crime && D.crime.disorder;
  if (pd) {
    $('#dis-title').textContent = 'Disorder calls to police';
    $('#dis-sub').textContent = `${D.crime.period}, Calgary Police Service`;
    const top = Math.max(...pd.by_type.map(c => c.n), 1);
    $('#disorder').innerHTML = `<div class="big"><span class="kpi-value">${fmt(pd.n)}</span>${chg(pd.change_pct, true, '%', 1, 'the same months a year before')}
        <span class="kpi-foot">${fmt(pd.prev)} a year before</span></div>
      <ul class="hbars">${pd.by_type.map(c => `<li><span class="lbl" title="${esc(c.type)}">${esc(c.type)}</span>
        <span class="track"><span style="width:${c.n / top * 100}%"></span></span><span class="v">${fmt(c.n)}</span></li>`).join('')}</ul>
      <p class="card-note">Calls from the public about disorder, by event. The police changed what counts as disorder in 2025, so the change from a year before may partly reflect the new definition, and earlier years are not directly comparable.</p>`;
    return;
  }
  const d = D.disorder;
  if (!d) { $('#dis-sub').textContent = ''; $('#disorder').innerHTML = '<p class="card-sub">No public data is available.</p>'; return; }
  $('#dis-sub').textContent = d.period + ', latest public data';
  const top = Math.max(...d.by_category.map(c => c.n), 1);
  $('#disorder').innerHTML = `<div class="big"><span class="kpi-value">${fmt(d.last12)}</span>${chg(d.change_pct, true)}
      <span class="kpi-foot">${fmt(d.prev12)} the year before</span></div>
    <ul class="hbars">${d.by_category.map(c => `<li><span class="lbl" title="${esc(titleCase(c.category))}">${esc(titleCase(c.category))}</span>
      <span class="track"><span style="width:${c.n / top * 100}%"></span></span><span class="v">${fmt(c.n)}</span></li>`).join('')}</ul>
    <p class="card-note">This data ends ${esc(d.data_ends)}. Community crime statistics are no longer published as open data.</p>`;
}

// ---------- communities table
const COLS = [
  { key: 'name', label: 'Community', text: true },
  { key: 'residents', label: 'Residents', d: 0, perRes: true },
  { key: 'census2021', label: '' + CY() + ' Census', d: 0, perRes: true },
  { key: 'growth_pct', label: 'Growth', d: 0, perRes: true, pctv: true },
  { key: 'requests12', label: '311 requests', d: 0 },
  { key: 'requests_change_pct', label: 'Change', change: true },
  { key: 'requests_per_1000', label: 'Per 1,000 a year', d: 0, perRes: true, bar: true },
  { key: 'infra_per_1000', label: 'Infrastructure per 1,000', d: 1, perRes: true },
  { key: 'open', label: 'Still open', d: 0 },
  { key: 'open_over_90_days', label: 'Open 90+ days', d: 0 },
  { key: 'issued_homes12', label: 'Homes in permits issued', d: 0 },
  { key: 'dev_permits12', label: 'Development permits', d: 0 },
];
function renderTable() {
  $('#comm-head').innerHTML = COLS.map(c => {
    const on = c.key === sortKey;
    const aria = on ? (sortDir > 0 ? 'ascending' : 'descending') : 'none';
    return `<th scope="col" class="has-sort ${c.text ? '' : 'num'}" aria-sort="${aria}"><button class="sort" data-key="${c.key}">${c.label}<span class="arr" aria-hidden="true">${on ? (sortDir > 0 ? '↑' : '↓') : ''}</span></button></th>`;
  }).join('');
  $$('#comm-head .sort').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.key;
    if (k === sortKey) sortDir = -sortDir; else { sortKey = k; sortDir = k === 'name' ? 1 : -1; }
    renderTable();
    $(`#comm-head .sort[data-key="${k}"]`).focus();
  }));
  const rows = D.communities.filter(c => areas === 'all' || c.residential);
  rows.sort((a, b) => {
    const x = a[sortKey], y = b[sortKey];
    if (sortKey === 'name') return sortDir * String(x).localeCompare(String(y));
    if (!isNum(x) && !isNum(y)) return 0;
    if (!isNum(x)) return 1;
    if (!isNum(y)) return -1;
    return sortDir * (x - y);
  });
  const barTop = Math.max(...residential().map(c => c.requests_per_1000).filter(isNum), 1);
  const cell = (c, col) => {
    const v = c[col.key];
    if (col.text) return `<td class="name-cell">${esc(v)}${c.growing ? '<span class="tag">Growing</span>' : ''}</td>`;
    if (col.perRes && !c.residential) return '<td class="num dash">–</td>';
    if (col.key === 'census2021' && !v) return '<td class="num dash">not built</td>';
    if (col.change) return `<td class="num">${isNum(v) ? chg(v, null) : '<span class="dash">–</span>'}</td>`;
    if (col.pctv) return `<td class="num">${isNum(v) ? signed(v, 0) : '<span class="dash">new</span>'}</td>`;
    if (col.bar && isNum(v)) return `<td class="num"><span class="cell-bar"><i style="width:${Math.round(v / barTop * 56)}px"></i>${fmt(v, col.d)}</span></td>`;
    return `<td class="num">${fmt(v, col.d)}</td>`;
  };
  $('#comm-table tbody').innerHTML = rows.map(c => `<tr data-code="${c.code}" class="pick ${c.residential ? '' : 'nonres'} ${c.code === selected ? 'is-sel' : ''}" tabindex="0" aria-label="${esc(c.name)}, show on the map">
    ${COLS.map(col => cell(c, col)).join('')}</tr>`).join('');
  $$('#comm-table tbody tr').forEach(tr => {
    const pick = () => { select(tr.dataset.code, true); $('#view-dashboard').scrollTo({ top: 0, behavior: 'smooth' }); };
    tr.addEventListener('click', pick);
    tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });
}
wireSeg($('#area-seg'), v => { areas = v; renderTable(); });

function renderNotes() {
  $('#notes').innerHTML = '<details class="src-fold"><summary>Notes on these figures</summary><ul>' +
    '<li>Growing: more than 30% more residents than at the ' + CY() + ' Census, or built since then.</li>' +
    D.notes.map(n => `<li>${esc(n)}</li>`).join('') +
    `<li>Sources: City of Calgary Open Data. ${Object.entries(D.sources).map(([k, v]) => `${esc(k)} (${esc(v)})`).join(', ')}.</li></ul></details>`;
}

// ================================================================ OPEN ISSUES
const issueFilter = { text: '', comm: '', area: '', age: 0, sort: 'new', year: '', nocontact: true };   // newest first; "311 Contact Us" messages counted above, listed only on request
let issueShown = 150, issueRows = [], issueSel = null;
const STUDY = ['2024-10-01', '2026-10-01'];
function fillIssueFilters() {
  const comms = [...new Set(D.open_list.map(r => r.comm))].map(c => [c, commName(c)]).sort((a, b) => a[1].localeCompare(b[1]));
  $('#f-comm').innerHTML = '<option value="">All of ' + W() + '</option>' + comms.map(([c, n]) => `<option value="${esc(c)}">${esc(n)}</option>`).join('');
  $('#f-comm').value = issueFilter.comm;
  const counts = {};
  D.open_list.forEach(r => { counts[r.area] = (counts[r.area] || 0) + 1; });
  $('#f-area').innerHTML = '<option value="">All services</option>' + Object.entries(counts).sort((a, b) => b[1] - a[1])
    .map(([a, n]) => `<option value="${esc(a)}">${esc(a)} (${fmt(n)})</option>`).join('');
  $('#f-area').value = issueFilter.area;
  const years = {};
  D.open_list.forEach(r => { const y = r.date.slice(0, 4); years[y] = (years[y] || 0) + 1; });
  const inStudy = D.open_list.filter(r => r.date >= STUDY[0] && r.date < STUDY[1]).length;
  $('#f-year').innerHTML = '<option value="">Any year</option>' +
    `<option value="study">Study period, Oct 2024 to Sep 2026 (${fmt(inStudy)})</option>` +
    Object.keys(years).sort().reverse().map(y => `<option value="${y}">${y} (${fmt(years[y])})</option>`).join('');
  $('#f-year').value = issueFilter.year;
}
function filteredIssues() {
  const q = issueFilter.text.trim().toLowerCase();
  let rows = D.open_list.filter(r => (!issueFilter.comm || r.comm === issueFilter.comm) && (!issueFilter.area || r.area === issueFilter.area)
    && (!issueFilter.age || daysSince(r.date) > issueFilter.age)
    && (!issueFilter.year || (issueFilter.year === 'study' ? r.date >= STUDY[0] && r.date < STUDY[1] : r.date.startsWith(issueFilter.year)))
    && (!issueFilter.nocontact || r.type !== '311 Contact Us')
    && (!q || [r.id, r.type, r.address, r.agency, commName(r.comm)].join(' ').toLowerCase().includes(q)));
  if (issueFilter.sort === 'new') rows = rows.slice().reverse();
  if (issueFilter.sort === 'type') rows = rows.slice().sort((a, b) => a.type.localeCompare(b.type) || a.date.localeCompare(b.date));
  return rows;
}
function renderIssues(reset = true) {
  if (!D) return;
  if (window.syncTrack311) syncTrack311();
  if (reset) issueShown = 150;
  issueRows = filteredIssues();
  if (isCity()) { renderCityIssues(); return; }
  $('#issues-city').hidden = true;
  $('#issues-export').hidden = false;
  $$('#view-issues .filters, #view-issues .issues-card').forEach(e => { e.hidden = false; });
  const all = D.open_list, over90 = all.filter(r => daysSince(r.date) > 90).length, over365 = all.filter(r => daysSince(r.date) > 365).length;
  const contact = all.filter(r => r.type === '311 Contact Us').length;
  const newest = all.reduce((m, r) => (r.date && r.date > m ? r.date : m), '');
  $('#issues-sub').textContent = `Every 311 request still open in ${W()} as of the last refresh (${longDate(D.built_at)}), whenever it was made.`
    + (newest ? ` The City publishes its 311 file once a day, a day behind: the newest requests in it are from ${longDate(newest)}.` : '');
  $('#issue-stats').innerHTML = [
    [fmt(all.length), 'still open as of today'], [fmt(over90), 'open more than 90 days', 'bad'], [fmt(over365), 'open more than a year', 'bad'],
    [fmt(contact), '"311 Contact Us" messages'],
    [all.length ? longDate(all[0].date) : '–', 'oldest still open', 'bad']].map(([b, s, cls]) => `<div class="istat ${cls || ''}"><b>${b}</b><span>${s}</span></div>`).join('');
  $('#issues-table tbody').innerHTML = issueRows.slice(0, issueShown).map((r, i) => {
    const age = daysSince(r.date);
    return `<tr class="pick ${r.id === issueSel ? 'is-sel' : ''}" data-i="${i}" tabindex="0" aria-label="Request ${esc(r.id)}, ${esc(niceType(r.type))}, show details">
      <td class="mono" data-l="Request">${esc(r.id)}</td><td data-l="Opened">${esc(r.date)}</td><td class="num" data-l="Days open"><span class="age ${age > 365 ? 'old' : ''}">${fmt(age)}</span></td>
      <td class="i-type" data-l="Type">${esc(niceType(r.type))}</td><td data-l="Community">${esc(commName(r.comm))}</td><td class="i-dept" data-l="Department">${esc(r.agency)}</td><td data-l="Last update">${esc(r.updated)}</td></tr>`;
  }).join('') || '<tr><td colspan="7" class="empty">No open issues match these filters.</td></tr>';
  $('#issues-count').textContent = `Showing ${fmt(Math.min(issueShown, issueRows.length))} of ${fmt(issueRows.length)} matching open issues`
    + (issueFilter.nocontact && contact ? ` (${fmt(contact)} "311 Contact Us" messages left out: untick "Hide" to list them)` : '');
  $('#issues-more').hidden = issueShown >= issueRows.length;
  $$('#issues-table tbody tr.pick').forEach(tr => {
    const open = () => {
      $$('#issues-table tbody tr.is-sel').forEach(x => x.classList.remove('is-sel'));
      tr.classList.add('is-sel');
      openIssue(issueRows[+tr.dataset.i]);
    };
    tr.addEventListener('click', open);
    tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
}
// the whole city has too many open requests to list here: show the count for each ward, and pick a ward to list its own
function renderCityIssues() {
  const s = D.summary || {}, ws = D.wards_summary;
  $('#issues-sub').textContent = `311 requests still open in Calgary as of the last refresh (${longDate(D.built_at)}). Choose a ward to list them.`;
  $('#issue-stats').innerHTML = [[fmt(s.open_now), 'still open as of today'], [fmt(s.open_over_90_days), 'open more than 90 days', 'bad'],
    [fmt(s.open_per_1000, 1), 'open per 1,000 residents (requests in residential communities only)']].map(([b, t, cls]) => `<div class="istat ${cls || ''}"><b>${b}</b><span>${t}</span></div>`).join('');
  $$('#view-issues .filters, #view-issues .issues-card').forEach(e => { e.hidden = true; });
  $('#issues-export').hidden = true;
  const box = $('#issues-city');
  box.hidden = false;
  const rows = ws ? [...ws.wards].sort((a, b) => (b.open_per_1000 || 0) - (a.open_per_1000 || 0)) : [];
  box.innerHTML = `<div class="card-head"><div><h2>Open requests in each ward</h2><p class="card-sub">Most open per 1,000 residents first. The rate counts requests in residential communities only, since business and industrial areas have almost no residents; "Still open" counts every request. Choose a ward to list its requests one by one.</p></div></div>
    <div class="table-wrap"><table class="data ward-open"><thead><tr><th scope="col">Ward</th><th scope="col">Councillor</th><th scope="col" class="num">Still open</th><th scope="col" class="num">Open more than 90 days</th><th scope="col" class="num">Open per 1,000 residents</th><th scope="col"><span class="sr">Open the ward</span></th></tr></thead><tbody>
    ${rows.map(r => `<tr><td class="w-name" data-l="Ward">Ward ${r.ward}</td><td class="w-coun" data-l="Councillor">${esc(r.councillor || '')}</td><td class="num" data-l="Still open">${fmt(r.open)}</td><td class="num" data-l="Open over 90 days">${fmt(r.open_over_90_days)}</td><td class="num" data-l="Per 1,000 residents">${fmt(r.open_per_1000, 1)}</td>
      <td><button type="button" class="link-btn" data-scope-ward="${r.ward}">List Ward ${r.ward}'s requests</button></td></tr>`).join('')}</tbody></table></div>`;
  $('#issues-count').textContent = '';
  $('#issues-more').hidden = true;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-scope-ward]');
  if (!b) return;
  const sel = $('#scope-sel');
  if (sel) sel.value = b.dataset.scopeWard;
  setScope(b.dataset.scopeWard);
});
$('#issues-more').addEventListener('click', () => { issueShown += 300; renderIssues(false); });
let typing;
$('#f-text').addEventListener('input', e => { clearTimeout(typing); typing = setTimeout(() => { issueFilter.text = e.target.value; renderIssues(); }, 200); });
$('#f-comm').addEventListener('change', e => { issueFilter.comm = e.target.value; renderIssues(); });
$('#f-area').addEventListener('change', e => { issueFilter.area = e.target.value; renderIssues(); });
$('#f-age').addEventListener('change', e => { issueFilter.age = +e.target.value; renderIssues(); });
$('#f-sort').addEventListener('change', e => { issueFilter.sort = e.target.value; renderIssues(); });
$('#f-year').addEventListener('change', e => { issueFilter.year = e.target.value; renderIssues(); });
$('#f-nocontact').addEventListener('change', e => { issueFilter.nocontact = e.target.checked; renderIssues(); });

const recordUrl = id => 'https://data.calgary.ca/resource/iahh-g8bj.json?service_request_id=' + encodeURIComponent(id);
const mapsUrl = (lat, lon) => `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
const atCentre = r => /centre/i.test(r.where || '') || !r.address;
let drawerMap = null;
function issueFacts(r) {
  const how = { App: 'The 311 Calgary app', Web: 'The 311 website', Other: 'Phone or other' }[r.source] || r.source || '–';
  return [['Opened', longDate(r.date)], ['Last update', longDate(r.updated)], ['Open for', dayWord(daysSince(r.date))],
    ['Community', commName(r.comm)], ...(r.address ? [['Address', r.address]] : []), ['Department', r.agency || '–'],
    ['Service', r.area], ['Reported through', how],
    ['Location', atCentre(r) ? 'The City publishes the community for this request, not its location' : (r.where || '–')]];
}
function openIssue(r) {
  const dr = $('#drawer');
  issueSel = r.id;
  dr.innerHTML = `<div class="drawer-head"><div><p class="card-sub">Request</p><p class="req-num mono">${esc(r.id)}</p><h2>${esc(niceType(r.type))}</h2></div>
      <button class="brief-close" id="drawer-close" aria-label="Close details" style="color:var(--fg);border-color:var(--border-strong)">${icon('x')}</button></div>
    <span class="flag" style="align-self:flex-start">${icon('clock')}Still open after ${dayWord(daysSince(r.date))}</span>
    <dl>${issueFacts(r).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    <div class="mini-map" id="drawer-map" aria-label="Map of ${esc(commName(r.comm))}"></div>
    <div class="drawer-actions">
      <button class="btn primary" id="dr-page">${icon('print')}<span>Request page: print or save as PDF</span></button>
      <button class="btn" id="dr-city">${icon('open')}<span>City's 311 data page</span></button>
      ${!atCentre(r) && isNum(r.lat) ? `<button class="btn" id="dr-maps">${icon('pin')}<span>Location in Google Maps</span></button>` : ''}
      <button class="btn" id="dr-copy">${icon('file')}<span>Copy request number</span></button>
      <button class="btn" id="dr-dash">${icon('dashboard')}<span>Show ${esc(commName(r.comm))} on the dashboard</span></button>
    </div>
    <p class="drawer-note">The City's 311 status page only shows a request to the person who filed it. On the City's data page, search for the request number. Residents can check theirs with the link in their confirmation email or by calling 311.</p>
    <p class="drawer-note"><button class="link-btn small" id="dr-record">Developer record (raw data)</button></p>`;
  dr.hidden = false;
  $('#drawer-close').focus();
  $('#drawer-close').addEventListener('click', () => { dr.hidden = true; issueSel = null; $$('#issues-table tr.is-sel').forEach(x => x.classList.remove('is-sel')); });
  $('#dr-record').addEventListener('click', () => openUrl(recordUrl(r.id)));
  $('#dr-city').addEventListener('click', () => openUrl(D.dataset_page || 'https://data.calgary.ca/d/iahh-g8bj'));
  $('#dr-maps')?.addEventListener('click', () => openUrl(mapsUrl(r.lat, r.lon)));
  $('#dr-page').addEventListener('click', () => openRecordPage(r));
  $('#dr-copy').addEventListener('click', async e => {
    try { await navigator.clipboard.writeText(r.id); e.currentTarget.lastElementChild.textContent = 'Copied'; } catch { /* clipboard blocked */ }
  });
  $('#dr-dash').addEventListener('click', () => { dr.hidden = true; show('dashboard'); select(r.comm, true); $('#view-dashboard').scrollTo({ top: 0, behavior: 'smooth' }); });
  if (drawerMap) { drawerMap.remove(); drawerMap = null; }
  drawerMap = L.map('drawer-map', { zoomControl: false, attributionControl: false });
  baseLayer(mapStyle === 'grey' ? 'grey' : 'street').addTo(drawerMap);
  const g = D.geo.communities[r.comm];
  if (g && atCentre(r)) {
    const lay = L.geoJSON(g, { style: { color: '#0369A1', weight: 3, fillColor: '#38BDF8', fillOpacity: .2 } }).addTo(drawerMap);
    drawerMap.fitBounds(lay.getBounds(), { padding: [10, 10] });
  } else if (isNum(r.lat)) {
    drawerMap.setView([r.lat, r.lon], 15);
    L.circleMarker([r.lat, r.lon], { radius: 8, color: '#fff', weight: 2, fillColor: cssv('--danger'), fillOpacity: 1 }).addTo(drawerMap);
  } else drawerMap.fitBounds(wardBounds());
  setTimeout(() => drawerMap && drawerMap.invalidateSize(), 60);
}
// a clean page for one request, for casework files: print it or save it as a PDF from the print window
function openRecordPage(r) {
  const pg = $('#record');
  pg.innerHTML = `<div class="record-sheet">
    <div class="record-tools no-print"><button class="btn primary" id="rec-print">${icon('print')}<span>Print or save as PDF</span></button>
      <button class="btn" id="rec-close">${icon('x')}<span>Close</span></button></div>
    <header class="record-head"><img src="logo.svg" alt="" width="40" height="40"><div><strong>Calgary Insight</strong><span>Office of Councillor ${esc(D.ward.councillor || '')}</span></div></header>
    <p class="card-sub">311 service request</p>
    <h1 class="mono">${esc(r.id)}</h1>
    <h2>${esc(niceType(r.type))}</h2>
    <p class="record-status">Status: <b>Open</b>, ${dayWord(daysSince(r.date))} since it was made</p>
    <table class="record-table">${issueFacts(r).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>
    <div class="mini-map record-map" id="record-map"></div>
    <footer class="record-foot">Source: City of Calgary, 311 Service Requests open data (data.calgary.ca, dataset iahh-g8bj), as of ${esc(stampText(D.built_at))} Calgary time.
      The City publishes the community for each request, not its address. Printed ${esc(stampText(localYmd() + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ })))}</footer></div>`;
  pg.hidden = false;
  $('#rec-close').addEventListener('click', () => { pg.hidden = true; });
  $('#rec-print').addEventListener('click', () => window.print());
  const rm = L.map('record-map', { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false });
  BASES.grey().addTo(rm);
  const g = D.geo.communities[r.comm];
  if (g) rm.fitBounds(L.geoJSON(g, { style: { color: '#0369A1', weight: 3, fillColor: '#38BDF8', fillOpacity: .25 } }).addTo(rm).getBounds(), { padding: [10, 10] });
  setTimeout(() => rm.invalidateSize(), 60);
}
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('#record').hidden) $('#record').hidden = true;
  else if (!$('#viewer').hidden) $('#viewer').hidden = true;
  else if (!$('#drawer').hidden) $('#drawer').hidden = true;
  else if (!$('#brief').hidden) closeBrief();
});
$('#issues-export').addEventListener('click', e => {
  if (!D) return;
  const cols = ['Request', 'Opened', 'Days open', 'Type', 'Service', 'Community', 'Department', 'Last update', 'Address', 'Community centre (latitude)', 'Community centre (longitude)', 'Developer record'];
  const rows = filteredIssues().map(r => [r.id, r.date, daysSince(r.date), niceType(r.type), r.area, commName(r.comm), r.agency, r.updated, r.address || '', r.lat ?? '', r.lon ?? '', recordUrl(r.id)]);
  const name = '' + W() + ' open issues ' + localYmd() + (issueFilter.comm ? ' ' + commName(issueFilter.comm) : '');
  saveList(e.currentTarget, name, cols, rows);
});

// ---------- "Save this list": saves a CSV to the Files folder and says so on the button
async function saveList(btn, name, cols, rows) {
  const label = btn.querySelector('span') || btn;
  const reset = () => setTimeout(() => { label.textContent = 'Save this list'; btn.disabled = false; }, 4000);
  btn.disabled = true;
  label.textContent = 'Saving…';
  try {
    const a = await api();
    const res = await a.save_csv(name, cols, rows.map(r => r.map(v => v === null || v === undefined ? '' : v)));
    if (res && res.ok) {
      label.textContent = `Saved ${fmt(rows.length)} rows to Files`;
      if (res.path) btn.title = res.path;
    } else label.textContent = 'Could not save: ' + ((res && res.error) || 'unknown problem');
  } catch (err) {
    label.textContent = 'Could not save: ' + (err && err.message ? err.message : err);
  }
  reset();
}

// ================================================================ BRIEFING SCREEN
let briefTimer = null, briefCamIndex = 0, briefRefresh = null;
function renderBrief() {
  const s = D.summary, w = D.ward;
  $('#brief-who').textContent = isCity() || !w.councillor ? 'City of Calgary · Mayor and Council' : `Office of Councillor ${w.councillor}`;
  const k = [
    [popMethod() === 'census2021' ? `Residents (${CY()} Census)` : 'Residents today', fmt(w.residents), popMethod() === 'census2021' ? popShort() : `${CY()} Census ${fmt(w.census2021)} (${signed(w.growth_pct, 1)})`, true],
    ['311 requests still open as of today', fmt(s.open_now), `${fmt(s.open_over_90_days)} open more than 90 days`],
    [`311 requests, ${esc(D.period)}`, fmt(s.requests12), `${signed(s.requests_change_pct, 1)} against ${esc(cmpWords())}`],
    ['Infrastructure reports per 1,000 a year', fmt(s.infra_per_1000, 1), `${fmt(s.infra_per_1000_prev, 1)} in ${esc(cmpWords())}`],
    ['Closed within 7 days', fmt(s.closed_7_days_pct, 1) + '%', `of requests closed so far. Calgary: ${fmt(s.closed_7_days_pct_city, 1)}%`],
  ];
  $('#brief-kpis').innerHTML = k.map(([l, v, sub, acc]) => `<div class="bk"><span>${l}</span><b class="${acc ? 'accent' : ''}">${v}</b><small>${sub}</small></div>`).join('');
  $('#brief-feed').innerHTML = feedItems(40).map(r => `<li><span>${esc(niceType(r.type))}</span><small>${esc(r.name)} · ${esc(longDate(r.date))} · ${esc(r.status)}</small></li>`).join('');
  $('#brief-types').innerHTML = D.open_by_type.slice(0, 6).map(t => `<li><span>${esc(niceType(t.type))}</span><b>${fmt(t.n)}</b></li>`).join('');
  $('#brief-foot').innerHTML = `<span>City of Calgary and Calgary Police open data. Updated ${esc(stampText(D.built_at))} (Calgary time) · Residents: ${esc(popWords())}</span><span>Press Esc to close</span>`;
  showBriefCams();
  if (window.renderBriefSources) renderBriefSources();
}
function showBriefCams() {
  const cams = wardCams().filter(c => c.in_ward);
  if (!cams.length) { $('#brief-cams').innerHTML = ''; return; }
  const pick = [0, 1, 2, 3].map(i => cams[(briefCamIndex + i) % cams.length]);
  $('#brief-cams').innerHTML = pick.map(camCard).join('');
}
async function openBrief() {
  if (!D) return;
  $('#brief').hidden = false;
  renderBrief();
  $('#brief-close').focus();
  const a = await api();
  if (a.set_fullscreen) a.set_fullscreen(true);
  briefTimer = setInterval(() => { briefCamIndex += 4; showBriefCams(); }, 45000);
  briefRefresh = setInterval(() => loadDashboard(true, true), 30 * 60000);
}
async function closeBrief() {
  $('#brief').hidden = true;
  clearInterval(briefTimer); clearInterval(briefRefresh);
  const a = await api();
  if (a.set_fullscreen) a.set_fullscreen(false);
}
$('#brief-btn').addEventListener('click', openBrief);
$('#brief-close').addEventListener('click', closeBrief);

// ================================================================ ASK
let current = null, busy = false, mode = 'fast';
wireSeg($('#mode-seg'), v => { mode = v; });

function addUser(text) {
  $('#welcome')?.remove();
  const m = document.createElement('div');
  m.className = 'msg user';
  m.innerHTML = `<div class="bubble">${esc(text)}</div>`;
  $('#thread').appendChild(m);
}
function stepItem(text) {
  const li = document.createElement('li');
  li.className = 'live';
  li.innerHTML = `<span class="spin" aria-hidden="true"></span><span>${esc(text)}</span>`;
  return li;
}
function finishSteps(el) {
  $$('.steps li.live', el).forEach(li => { li.classList.remove('live'); $('.spin', li)?.replaceWith(document.createRange().createContextualFragment(icon('check'))); });
}
function addBot() {
  const m = document.createElement('div');
  m.className = 'msg bot';
  m.innerHTML = '<ul class="steps" aria-label="Progress"></ul><div class="cards"></div><div class="answer"></div><div class="msg-meta"></div>';
  const t = stepItem('Thinking'); t.dataset.thinking = '1';
  $('.steps', m).appendChild(t);
  $('#thread').appendChild(m);
  scrollDown();
  return m;
}
function scrollDown() { const t = $('#thread'); t.scrollTop = t.scrollHeight; }
function chartPalette() { return [cssv('--chart-2'), cssv('--chart-1'), '#D97706', '#DC2626', '#0D9488', '#64748B']; }

window.onAgentEvent = ev => {
  if (!current) return;
  const steps = $('.steps', current), cards = $('.cards', current);
  if (ev.type === 'step') {
    $('[data-thinking]', steps)?.remove();
    finishSteps(current);
    steps.appendChild(stepItem(ev.text));
  } else if (ev.type === 'chart') {
    chartTheme();
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `<h4>${esc(ev.title)}</h4><div class="chart-holder"><canvas role="img" aria-label="${esc(ev.title)}"></canvas></div>`;
    cards.appendChild(card);
    const pal = chartPalette();
    new Chart($('canvas', card), {
      type: ev.kind === 'line' ? 'line' : 'bar',
      data: { labels: ev.labels, datasets: ev.series.map((s, i) => ({ label: s.name, data: s.values,
        backgroundColor: pal[i % pal.length], borderColor: pal[i % pal.length], borderRadius: 3, tension: .3, pointRadius: 2,
        borderDash: ev.kind === 'line' && i ? [6, 4] : [] })) },
      options: { indexAxis: ev.kind === 'horizontal_bar' ? 'y' : 'x', maintainAspectRatio: false,
        plugins: { legend: { display: ev.series.length > 1, position: 'bottom', labels: { usePointStyle: true } }, tooltip: tooltipStyle() },
        scales: { y: { beginAtZero: true, grid: { color: cssv('--chart-grid') }, title: { display: !!ev.unit && ev.kind !== 'horizontal_bar', text: ev.unit } },
                  x: { grid: { display: ev.kind === 'horizontal_bar', color: cssv('--chart-grid') } } } }
    });
  } else if (ev.type === 'table') {
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `<h4>${esc(ev.title)}</h4><div class="table-scroll"><table class="data"><thead><tr>${ev.columns.map((c, i) => `<th scope="col" class="${ev.rows.length && typeof ev.rows[0][i] === 'number' ? 'num' : ''}">${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${ev.rows.map(r => `<tr>${r.map(v => `<td class="${typeof v === 'number' ? 'num' : ''}">${typeof v === 'number' ? fmt(v, Number.isInteger(v) ? 0 : 1) : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    cards.appendChild(card);
  } else if (ev.type === 'map') {
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `<h4>${esc(ev.title)}</h4><div class="mini-map"></div>`;
    cards.appendChild(card);
    const mm = L.map($('.mini-map', card));
    L.tileLayer(TILES[isDark() ? 'dark' : 'light'], { maxZoom: 17, attribution: 'Tiles &copy; Esri' }).addTo(mm);
    const pts = ev.points.filter(p => p.lat && p.lon), dot = cssv('--danger');
    const g = L.featureGroup(pts.map(p => L.circleMarker([p.lat, p.lon], { radius: 5, color: '#fff', weight: 1.2, fillColor: dot, fillOpacity: .95 })
      .bindTooltip(esc(p.label || '')))).addTo(mm);
    if (pts.length) mm.fitBounds(g.getBounds(), { padding: [20, 20], maxZoom: 15 }); else mm.setView([51.05, -114.07], 10);
  } else if (ev.type === 'download') {
    const card = document.createElement('div'); card.className = 'card file';
    const name = ev.path.split(/[\\/]/).pop();
    card.innerHTML = `${icon('file')}<div><div class="file-name">${esc(name)}</div><div class="file-sub">${fmt(ev.rows)} rows saved to the Downloads folder, Calgary Insight</div></div>
      <button class="btn">${icon('open')}<span>Open file</span></button>`;
    $('button', card).addEventListener('click', async () => (await api()).open_path(ev.path));
    cards.appendChild(card);
  } else if (ev.type === 'report') {
    const card = reportCard(ev);
    cards.appendChild(card);
  }
  scrollDown();
};

async function ask(text) {
  if (busy || !text.trim()) return;
  busy = true; $('#send').disabled = true;
  addUser(text);
  current = addBot();
  try {
    const res = await (await api()).ask(text, mode);
    $('[data-thinking]', current)?.remove();
    finishSteps(current);
    if (!$('.steps li', current)) $('.steps', current).remove();
    if (!res.ok) {
      $('.answer', current).innerHTML = `<div class="err">${esc(res.error)}</div>`;
    } else {
      $('.answer', current).innerHTML = DOMPurify.sanitize(marked.parse(res.text));
      const tok = res.tokens || {};
      // no model name and no price on answers (the owner's choice)
      $('.msg-meta', current).textContent = `${res.tier === 'smart' ? 'Thorough' : 'Fast'} answer${(res.skipped || []).length ? ' · answered by the backup AI service' : ''}`;
    }
  } catch (e) {
    $('[data-thinking]', current)?.remove();
    $('.answer', current).innerHTML = `<div class="err">${esc(e.message || e)}</div>`;
  } finally {
    busy = false; $('#send').disabled = false; current = null; scrollDown();
  }
}
$('#composer').addEventListener('submit', e => { e.preventDefault(); const q = $('#question'); const t = q.value; q.value = ''; q.style.height = ''; ask(t); });
$('#question').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#composer').requestSubmit(); } });
$('#question').addEventListener('input', e => { e.target.style.height = 'auto'; e.target.style.height = Math.max(84, Math.min(e.target.scrollHeight, 340)) + 'px'; });
$$('.suggest button').forEach(b => b.addEventListener('click', () => ask(b.textContent.trim())));
$('#go-settings').addEventListener('click', () => show('settings'));
const welcomeBlock = $('#welcome');   // kept, so New chat can show it again
$('#new-chat').addEventListener('click', async () => {
  if (busy) return;
  await (await api()).new_chat();
  const w = welcomeBlock;
  $('#thread').innerHTML = '';
  if (w) { w.hidden = false; w.style.display = ''; $('#thread').appendChild(w); }
  $('#question').focus();
});

// ================================================================ FILES
async function loadFiles() {
  const a = await api();
  const s = await a.get_settings();
  $('#files-where').textContent = 'Saved to ' + s.downloads;
  const files = await a.list_downloads();
  $('#files').innerHTML = files.length ? files.map((f, i) => `<tr>
      <td><span class="fname">${icon('file')}${esc(f.name)}</span></td><td>${esc(f.modified)}</td>
      <td class="num">${fmt(f.bytes / 1024, 0)} KB</td>
      <td><button class="btn" data-i="${i}">${icon('open')}<span>Open</span></button></td></tr>`).join('')
    : '<tr><td colspan="4" class="empty">No files yet. Ask the assistant to download data, for example: Download all open 311 requests in ' + W() + '.</td></tr>';
  $$('#files button').forEach(b => b.addEventListener('click', () => a.open_path(files[b.dataset.i].path)));
}
$('#open-folder').addEventListener('click', async () => (await api()).open_downloads());

// ================================================================ SETTINGS
async function loadSettings() {
  const s = await (await api()).get_settings();
  window._models = s.models;
  const nk = (s.engines || []).filter(e => e.has_key).length;
  $('#key-badge').textContent = nk ? `${nk} ready` : 'No key yet';
  $('#key-badge').classList.toggle('ok', !!nk);
  $('#no-key') && ($('#no-key').hidden = s.has_key);
  renderEngines(s);
  $('#gkey-status').textContent = s.has_google_key ? `A Google Maps key ending ${s.google_key_hint.slice(3)} is saved. The maps use Google. Remove it before giving this computer to someone else.` : 'No key saved. The maps use OpenStreetMap, which needs no key.';
  $('#gkey-badge').textContent = s.has_google_key ? 'Saved' : 'Not saved';
  $('#gkey-badge').classList.toggle('ok', !!s.has_google_key);
  $('#remove-gkey').disabled = !s.has_google_key;
  if ((s.google_key || '') !== googleKey) {
    googleKey = s.google_key || ''; googleReady = null; googleFailed = false;
    if (googleKey) loadGoogle().then(ok => { if (!ok) googleFailed = true; setBase(); }); else setBase();
  }
  if (s.map_style && s.map_style !== mapStyle) { mapStyle = s.map_style; setBase(); }
  renderPopChoices(s);
  return s;
}
// how residents are counted: four choices, each with the area's total today under it; the default is marked
function renderPopChoices(s) {
  const box = $('#pop-choices');
  if (!box || !s.pop_methods) return;
  const totals = (D && D.population && D.population.by_method) || {};
  const cur = s.pop_method || 'city_actual';
  $('#pop-badge').textContent = (s.pop_methods.find(m => m.key === cur) || {}).short || '';
  box.innerHTML = s.pop_methods.map(m => `<button type="button" role="radio" class="pop-choice${m.key === cur ? ' on' : ''}" aria-checked="${m.key === cur}" data-pop="${m.key}">
      <span class="pc-head"><b>${esc(m.label)}${m.key === 'city_actual' ? ' <small class="pc-default">default</small>' : ''}</b>${isNum(totals[m.key]) ? `<span class="pc-n">${fmt(totals[m.key])}<small>${m.key === 'census2021' ? W() + ', May ' + CY() : '' + W() + ' today'}</small></span>` : ''}</span>
      <span class="pc-about">${esc(m.about)}</span></button>`).join('');
  $$('.pop-choice', box).forEach(b => b.addEventListener('click', async () => {
    if (b.dataset.pop === cur) return;
    $('#pop-hint').textContent = 'Working out the dashboard with the new count…';
    const a = await api();
    const s2 = await a.set_pop_method(b.dataset.pop);
    renderPopChoices(s2);
    await loadDashboard(false, true);
    renderPopChoices(s2);
    $('#pop-hint').textContent = `Saved. Every figure now counts residents with ${popWords()}.`;
  }));
}
wireSeg($('#theme-seg'), v => setTheme(v));
// ----- AI services in priority order
let ENG = [], PROV = [], ENG_MAX = 4;
const provOf = k => PROV.find(p => p.key === k) || PROV[0] || {};
function engFromForm() {
  $$('#eng-list .eng').forEach((li, i) => {
    const e = ENG[i]; if (!e) return;
    e.provider = $('.eng-prov', li).value; e.newKey = $('.eng-key', li).value.trim();
    e.fast = $('.eng-fast', li).value.trim(); e.smart = $('.eng-smart', li).value.trim();
    e.url = $('.eng-url input', li).value.trim(); e.free = $('.eng-free', li).checked;
  });
}
function renderEngines(s) {
  if (s) { ENG = (s.engines || []).map(e => ({ ...e, newKey: '' })); PROV = s.providers || PROV; ENG_MAX = s.max_engines || 4; }
  const box = $('#eng-list');
  if (!box) return;
  if (!ENG.length) box.innerHTML = '<li class="eng-empty">No service yet. Add one and paste its key.</li>';
  else box.innerHTML = ENG.map((e, i) => { const p = provOf(e.provider);
    const state = e.resting ? `<span class="badge warn" title="${esc(e.resting)}">Resting: ${esc(e.resting.replace(/ \(.*$/, ''))}</span>`
      : e.has_key && !e.newKey ? `<span class="badge ok">Key saved ${esc(e.key_hint)}</span>` : e.newKey ? '<span class="badge">New key, not saved yet</span>' : '<span class="badge">No key</span>';
    return `<li class="eng" data-i="${i}">
      <div class="eng-top">
        <span class="eng-n" title="Priority ${i + 1}">${i + 1}</span>
        <select class="eng-prov" aria-label="Service ${i + 1}">${PROV.map(o => `<option value="${o.key}"${o.key === e.provider ? ' selected' : ''}>${esc(o.label)}${o.company && o.company !== o.label ? ' (' + esc(o.company) + ')' : ''}</option>`).join('')}</select>
        ${state}
        <span class="eng-role">${i === 0 ? 'Used first' : 'Backup ' + i}</span>
        <span class="eng-move">
          <button type="button" class="icon-btn" data-up ${i === 0 ? 'disabled' : ''} aria-label="Move up">${icon('arr-up')}</button>
          <button type="button" class="icon-btn" data-down ${i === ENG.length - 1 ? 'disabled' : ''} aria-label="Move down">${icon('arr-down')}</button>
          <button type="button" class="icon-btn" data-del aria-label="Remove">${icon('x')}</button>
        </span>
      </div>
      <p class="field-hint eng-about">${esc(p.about || '')}</p>
      <div class="eng-fields">
        <label class="eng-f eng-kf"><span class="field-label">API key</span><input type="password" class="eng-key" autocomplete="off" value="${esc(e.newKey || '')}" placeholder="${e.has_key ? 'Saved ' + esc(e.key_hint) + ' (paste to replace)' : 'Paste ' + esc(p.key_hint || 'key')}"></label>
        <label class="eng-f"><span class="field-label">Quick answers</span><input class="eng-fast" value="${esc(e.fast || '')}" placeholder="${esc(p.fast || 'model name')}"></label>
        <label class="eng-f"><span class="field-label">Reports and thorough answers</span><input class="eng-smart" value="${esc(e.smart || '')}" placeholder="${esc(p.smart || 'model name')}"></label>
        <label class="eng-f eng-url"${e.provider === 'other' ? '' : ' hidden'}><span class="field-label">Chat address</span><input value="${esc(e.provider === 'other' ? e.url || '' : '')}" placeholder="https://…/v1/chat/completions"></label>
      </div>
      <div class="eng-foot">
        <label class="check"><input type="checkbox" class="eng-free" ${e.free ? 'checked' : ''}> No-cost key</label>
        ${p.key_page ? `<button type="button" class="link-btn" data-page="${esc(p.key_page)}">Get a key ${icon('open')}</button>` : ''}
        <span class="eng-spacer"></span>
        <span class="eng-test-out" role="status"></span>
        <button type="button" class="btn" data-test>${icon('check')}<span>Test</span></button>
      </div></li>`; }).join('');
  $('#eng-add').disabled = ENG.length >= ENG_MAX;
  $('#eng-count').textContent = `${ENG.length} of ${ENG_MAX}. Use the arrows to change the order.`;
  $$('.eng', box).forEach(li => {
    const i = +li.dataset.i;
    const move = d => { engFromForm(); const t = ENG[i]; ENG.splice(i, 1); ENG.splice(i + d, 0, t); renderEngines(); };
    $('[data-up]', li).addEventListener('click', () => move(-1));
    $('[data-down]', li).addEventListener('click', () => move(1));
    $('[data-del]', li).addEventListener('click', () => { engFromForm(); ENG.splice(i, 1); renderEngines(); });
    $('.eng-prov', li).addEventListener('change', () => { engFromForm(); const p = provOf(ENG[i].provider);
      Object.assign(ENG[i], { fast: p.fast, smart: p.smart, free: !!p.free, url: '', has_key: false, key_hint: '', resting: '' }); renderEngines(); });
    $('[data-page]', li)?.addEventListener('click', async b => (await api()).open_url(li.querySelector('[data-page]').dataset.page));
    $('[data-test]', li).addEventListener('click', async () => {
      engFromForm(); const e = ENG[i]; const out = $('.eng-test-out', li); const btn = $('[data-test]', li);
      out.className = 'eng-test-out'; out.textContent = 'Testing…'; btn.disabled = true;
      try {
        const r = await (await api()).test_engine({ id: e.id, provider: e.provider, key: e.newKey, fast: e.fast, smart: e.smart, url: e.url, free: e.free });
        out.classList.add(r.ok ? 'ok' : 'bad');
        out.textContent = r.results.map(x => (x.model ? x.model + ': ' : '') + x.text).join(' · ');
      } catch (err) { out.classList.add('bad'); out.textContent = String(err.message || err); }
      btn.disabled = false;
    });
  });
}
$('#eng-add').addEventListener('click', () => {
  engFromForm();
  if (ENG.length >= ENG_MAX) return;
  const used = new Set(ENG.map(e => e.provider));
  const p = PROV.find(o => !used.has(o.key)) || PROV[0];
  ENG.push({ id: Math.random().toString(36).slice(2, 10), provider: p.key, fast: p.fast, smart: p.smart, free: !!p.free, url: '', has_key: false, key_hint: '', newKey: '' });
  renderEngines();
  $('#eng-list .eng:last-child .eng-key')?.focus();
});
$('#settings-form').addEventListener('submit', async e => {
  e.preventDefault();
  engFromForm();
  const a = await api();
  await a.save_engines(ENG.map(x => ({ id: x.id, provider: x.provider, key: x.newKey, fast: x.fast, smart: x.smart, url: x.url, free: x.free })));
  const s = await a.save_settings(null, null, null, $('#google-key').value);
  $('#google-key').value = '';
  window._models = s.models;
  $('#saved-msg').textContent = 'Settings saved.';
  setTimeout(() => { $('#saved-msg').textContent = ''; }, 2500);
  loadSettings();
});
$('#remove-gkey').addEventListener('click', async () => { const a = await api(); if (a.remove_google_key) await a.remove_google_key(); loadSettings(); });

// ================================================================ start
applyTheme();
(async () => {
  await api();
  const s = await loadSettings();
  if (s.theme && s.theme !== themePref) { themePref = s.theme; applyTheme(); }
  loadDashboard(false);
  setInterval(() => loadDashboard(false, true), 15 * 60000);   // keeps an office screen current (rebuilds hourly)
})();

;
// ---- extra.js
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
  Transit: ['bus', '#0F766E'], Housing: ['home', '#BE185D'], People: ['users', '#4338CA'], Roads: ['cone', '#C2410C'], Budget: ['bars', '#15803D'] };
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
let dsDepth = 'thorough';                       // Quick (the fast, cheaper model) or Thorough (the strongest model)
try { dsDepth = localStorage.getItem('ds-depth') === 'quick' ? 'quick' : 'thorough'; } catch { /* storage off */ }
function showDepth() {
  $$('#ds-depth [data-depth]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.depth === dsDepth)));
  $('#ds-depth-note').textContent = dsDepth === 'quick'
    ? 'Quick uses the fast model: a full report in a few minutes, at about half the cost of Thorough.'
    : 'Thorough uses the strongest model: deeper reasoning, longer reports, about twice the cost and time of Quick.';
}
$$('#ds-depth [data-depth]').forEach(b => b.addEventListener('click', () => {
  dsDepth = b.dataset.depth; try { localStorage.setItem('ds-depth', dsDepth); } catch { /* storage off */ } showDepth();
}));
showDepth();
async function runDs({ key, title, text }) {
  if (dsBusy) return;
  dsBusy = true;
  $$('.ds-topic, #ds-go').forEach(b => { b.disabled = true; });
  $('#ds-run').hidden = false;
  $('#ds-run').classList.remove('is-done');
  $('#ds-run-title').textContent = title || text;
  $('#ds-run-sub').textContent = (dsDepth === 'quick' ? 'Working on it (Quick). This usually takes 3 to 8 minutes; a long report takes longer.'
    : 'Working on it (Thorough, the strongest model). A short report takes 5 to 15 minutes; a long one can take an hour or more.') + ' You can use the rest of Calgary Insight meanwhile; keep this page open.';
  $('#ds-steps').innerHTML = '<li>Planning the analysis</li>';
  $('#ds-result').innerHTML = '';
  setStage(0);
  $('#ds-run').scrollIntoView({ behavior: 'smooth', block: 'start' });
  try {
    const res = await (await api()).analyst_run(key || null, text || null, dsDepth);
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

;
// ---- search.js
/* Calgary Insight: search the site. Screens and their parts, communities, wards, method notes, datasets, electoral
   divisions and districts, videos, places to visit and the day's news headlines, from data/search.json (written at each
   website build) plus whatever is on the page. Ctrl K (or /) opens it; the arrow keys and Enter pick a result. */
'use strict';
(() => {
  const box = $('#site-search'), input = $('#ss-q'), pop = $('#ss-results');
  if (!box || !input || !pop) return;
  let rows = null, loading = null, sel = -1, shown = [];
  const KIND = { screen: 'Screen', part: 'Part of a screen', community: 'Community', ward: 'Ward', method: 'How it\'s counted', dataset: 'Dataset',
                 district: 'Electoral area', video: 'Video', news: 'News', place: 'Visiting Calgary', page: 'Page' };
  const ORDER = ['screen', 'part', 'community', 'ward', 'district', 'place', 'news', 'video', 'method', 'dataset', 'page'];
  const ICON = { screen: 'i-dashboard', part: 'i-next', community: 'i-pin', ward: 'i-users', method: 'i-sigma', dataset: 'i-database',
                 district: 'i-ballot', video: 'i-film', news: 'i-paper', place: 'i-compass', page: 'i-info' };
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, "'");

  // the index: the build's file when there is one, otherwise what the page itself knows
  function fromPage() {
    const out = [];
    $$('.tab[data-view]').forEach(t => out.push({ k: 'screen', t: t.querySelector('span') ? t.querySelector('span').textContent.trim() : t.title, s: t.title || '', v: t.dataset.view, w: '' }));
    const D0 = typeof D !== 'undefined' ? D : null;
    ((D0 && D0.communities) || []).forEach(c => out.push({ k: 'community', t: c.name, s: `Ward ${c.ward}`, code: c.code, ward: c.ward, w: c.code }));
    for (let w = 1; w <= 14; w++) out.push({ k: 'ward', t: `Ward ${w}`, s: 'Ward overview', ward: w, w: '' });
    ((window.METHODS_LIST) || []).forEach(m => out.push({ k: 'method', t: m.name, s: m.used_in || '', v: 'methods', key: m.key, w: '' }));
    return out;
  }
  async function load() {
    if (rows) return rows;
    if (loading) return loading;
    loading = (async () => {
      let idx = null;
      try { idx = window.CDD_WEB && window.CDD_WEB.getJSON ? await window.CDD_WEB.getJSON('search.json') : await (await fetch('data/search.json')).json(); } catch (e) { idx = null; }
      rows = (idx && idx.rows) || fromPage();
      try {                                               // the day's headlines, from the news already loaded or fetched now
        let cn = typeof CN !== 'undefined' ? CN : null;
        if (!cn && typeof api === 'function') { const r = await (await api()).get_city_news(); cn = r && r.ok ? r.data : null; }
        ((cn && cn.articles) || []).forEach(a => rows.push({ k: 'news', t: a.title, s: `${a.date || ''} · ${a.section || 'Calgary News'}`, v: 'citynews', id: a.id, w: (a.topics || []).join(' ') }));
      } catch (e) { /* no news today */ }
      rows.forEach(r => { r._t = norm(r.t); r._s = norm(r.s); r._w = norm(r.w); });
      return rows;
    })();
    return loading;
  }

  function score(r, words) {
    let total = 0;
    for (const q of words) {
      let best = 0;
      if (r._t === q) best = 120;
      else if (r._t.startsWith(q)) best = 100;
      else if (r._t.split(/[^a-z0-9]+/).some(w => w.startsWith(q))) best = 80;
      else if (q.length > 1 && r._t.includes(q)) best = 60;
      else if (r._w.split(/[^a-z0-9]+/).some(w => w.startsWith(q))) best = 35;
      else if (r._s.split(/[^a-z0-9]+/).some(w => w.startsWith(q))) best = 30;
      else if (q.length > 1 && (r._s.includes(q) || r._w.includes(q))) best = 25;
      if (!best) return 0;
      total += best;
    }
    return total + (r.k === 'screen' ? 8 : r.k === 'part' ? 4 : r.k === 'community' ? 3 : 0);
  }
  const mark = (text, words) => {
    let h = esc(text);
    for (const q of words) if (q.length > 1) h = h.replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'i'), '<mark>$1</mark>');
    return h;
  };
  function render(q) {
    const words = norm(q).split(/\s+/).filter(Boolean);
    if (!words.length) { pop.hidden = true; input.setAttribute('aria-expanded', 'false'); shown = []; return; }
    const hits = rows.map(r => [score(r, words), r]).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0] || a[1].t.length - b[1].t.length);
    const byKind = {}, best = {}; shown = [];
    for (const [sc, r] of hits) { const l = byKind[r.k] = byKind[r.k] || []; if (!(r.k in best)) best[r.k] = sc; if (l.length < (r.k === 'community' || r.k === 'news' ? 8 : 6)) { l.push(r); } }
    let html = '';
    for (const k of ORDER.slice().sort((a, b) => (best[b] || 0) - (best[a] || 0) || ORDER.indexOf(a) - ORDER.indexOf(b))) {
      if (!byKind[k]) continue;
      html += `<div class="ss-h">${esc(KIND[k] || k)}</div>`;
      for (const r of byKind[k]) {
        const i = shown.push(r) - 1;
        html += `<button type="button" class="ss-row" role="option" id="ss-opt-${i}" data-i="${i}" aria-selected="false"><svg class="ic" aria-hidden="true"><use href="#${ICON[k] || 'i-next'}"/></svg><span><b>${mark(r.t, words)}</b>${r.s ? `<small>${mark(r.s, words)}</small>` : ''}</span><span class="ss-kind">${k === 'part' ? esc(r.w || '') : ''}</span></button>`;
      }
      if (shown.length >= 40) break;
    }
    pop.innerHTML = html || `<div class="ss-empty">Nothing matches "${esc(q)}". Try a community, a ward, a screen or a word from a method note; Data Genie can answer a question in plain words.</div>`;
    pop.innerHTML += `<div class="ss-foot">${shown.length ? `${shown.length} result${shown.length === 1 ? '' : 's'} · ↑ ↓ to move, Enter to open, Esc to close` : ''}</div>`;
    pop.hidden = false; input.setAttribute('aria-expanded', 'true'); sel = -1; highlight();
    $$('.ss-row', pop).forEach(b => b.addEventListener('click', () => open(shown[+b.dataset.i])));
  }
  function highlight() {
    $$('.ss-row', pop).forEach((b, i) => b.setAttribute('aria-selected', i === sel ? 'true' : 'false'));
    input.setAttribute('aria-activedescendant', sel >= 0 ? `ss-opt-${sel}` : '');
    const b = $(`#ss-opt-${sel}`, pop); if (b) b.scrollIntoView({ block: 'nearest' });
  }

  // wait for a screen to draw, then press the part's own tab
  const wait = (fn, ms = 3000) => new Promise(res => { const t0 = Date.now(); (function tick() { const x = fn(); if (x || Date.now() - t0 > ms) res(x); else setTimeout(tick, 80); })(); });
  async function part(view, label) {
    const want = norm(label);
    const b = await wait(() => $$(`#view-${view} [role="radio"], #view-${view} .el-subtab, #view-${view} .seg button`).find(x => norm(x.textContent).trim().startsWith(want)));
    if (b) b.click();
    return b;
  }
  async function open(r) {
    if (!r) return;
    close(); if (typeof setMenu === 'function') setMenu(false);
    const S = typeof show === 'function' ? show : () => {};
    try {
      if (r.k === 'page' && r.u) { location.href = r.u; return; }
      if (r.k === 'ward') { S('dashboard'); if (typeof setScope === 'function') await setScope(r.ward); return; }
      if (r.k === 'community') {
        S('dashboard');
        if (typeof setScope === 'function' && typeof SCOPE !== 'undefined' && SCOPE !== 0 && SCOPE !== r.ward) await setScope(r.ward);
        await wait(() => typeof D !== 'undefined' && D && (D.communities || []).some(c => c.code === r.code));
        if (typeof select === 'function') select(r.code, true);
        return;
      }
      if (r.k === 'method') { S('methods'); if (window.renderMethods) renderMethods(r.key); return; }
      if (r.k === 'dataset') {
        S('sources');
        const row = await wait(() => $$('#view-sources tr, #view-sources li, #view-sources .src-row').find(x => norm(x.textContent).includes(norm(r.t).slice(0, 30))));
        if (row) { row.scrollIntoView({ block: 'center' }); row.classList.add('ss-flash'); setTimeout(() => row.classList.remove('ss-flash'), 2500); }
        return;
      }
      if (r.k === 'district') {
        S('elections'); await part('elections', 'Know your constituency');
        if (typeof ecSel !== 'undefined' && window.renderElections) { ecSel.key = r.ec; renderElections(); }
        return;
      }
      if (r.k === 'video') { S('videos'); const i = await wait(() => $('#vid-q')); if (i) { i.value = r.q || r.t; i.dispatchEvent(new Event('input', { bubbles: true })); } return; }
      if (r.k === 'news') { S('citynews'); if (typeof cnOpen !== 'undefined' && window.renderCityNews) { cnOpen = r.id; renderCityNews(); } return; }
      if (r.k === 'place') { S('visit'); await wait(() => window.visitOpen); if (window.visitOpen) visitOpen(r.place ? { place: r.place } : { month: r.month }); return; }
      if (r.k === 'part') { S(r.v); await part(r.v, r.p); return; }
      S(r.v);
    } finally {
      if (typeof history !== 'undefined' && history.replaceState && r.v) { const u = new URL(location.href); u.searchParams.set('view', r.v); history.replaceState(null, '', u); }
    }
  }
  function close() { pop.hidden = true; input.setAttribute('aria-expanded', 'false'); sel = -1; box.classList.remove('open'); }

  let t;
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(async () => { await load(); render(input.value.trim()); }, 120); });
  input.addEventListener('focus', () => { box.classList.add('open'); load(); if (input.value.trim() && rows) render(input.value.trim()); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && shown.length) { e.preventDefault(); sel = (sel + 1) % shown.length; highlight(); }
    else if (e.key === 'ArrowUp' && shown.length) { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; highlight(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (shown.length) open(shown[sel >= 0 ? sel : 0]); }
    else if (e.key === 'Escape') { if (!pop.hidden) { e.stopPropagation(); close(); } else if (input.value) { input.value = ''; } else { input.blur(); box.classList.remove('open'); } }
  });
  document.addEventListener('click', e => { if (!e.target.closest('#site-search')) close(); });
  document.addEventListener('keydown', e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || '')) || (e.target.isContentEditable);
    if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) {
      e.preventDefault();
      if ($('.side') && getComputedStyle($('#menu-btn')).display !== 'none' && !$('.side').classList.contains('open') && typeof setMenu === 'function') setMenu(true);
      box.classList.add('open'); input.focus(); input.select();
    }
  });
  box.querySelector('.ic').addEventListener('click', () => { box.classList.add('open'); input.focus(); });
  // Ctrl K reads as Cmd K on a Mac
  if (/Mac|iPhone|iPad/.test(navigator.platform || '')) { const k = $('.ss-kbd', box); if (k) k.textContent = '⌘ K'; }
})();

;
// ---- forecast.js
// ================================================================ GROWTH: FORECAST TO 2030 (srg.py)
// The City's Suburban Residential Growth forecast, shared to new communities, through the growth model and
// Growth vs amenities: residents today and in 2030, and crowding at today's amenities.
let fcSector = '', fcShow = '', fcChart = null;
const FC_TAG = { becomes_crowded: 'ac-gap', more_crowded: 'ac-gap', crowded: 'ac-check', far_growing: 'ac-check', keeps_up: 'ac-ok', no_score: 'ac-few' };
const FC_BAND = { well_below: 'Well below', below: 'Below', around: 'Around', above: 'Above' };
const fcTag = (S, r) => `<span class="ac-tag ${FC_TAG[r] || ''}">${esc((S.readings || {})[r] || r)}</span>`;
const fcN = (v, d = 0) => isNum(v) ? fmt(v, d) : '–';
const fcArrow = (a, b, d = 2) => `${fcN(a, d)} <span class="fc-to" aria-label="to">→</span> <b>${fcN(b, d)}</b>`;
const fcScore = x => {
  if (!x || !isNum(x.now)) return '<span class="dash">–</span>';
  const pl = isNum(x.planned);
  return `${fcN(x.now, 2)} <span class="fc-to" aria-label="to">→</span> <b>${fcN(pl ? x.planned : x.then, 2)}</b><small>${esc(FC_BAND[x.band_now] || '')} → ${esc(FC_BAND[pl ? x.band_planned : x.band_then] || '')}${pl ? ` · nothing new: ${fcN(x.then, 2)}` : ''}</small>`;
};
const fcCrowd = (c, d) => { c = c || {}; const pl = isNum(c.planned); return `${fcN(c.now, d)} <span class="fc-to" aria-label="to">→</span> <b>${fcN(pl ? c.planned : c.then, d)}</b>${pl && c.planned !== c.then ? `<small>nothing new: ${fcN(c.then, d)}</small>` : ''}`; };
const fcPlanned = r => [isNum(r.planned_park_ha) && r.planned_park_ha >= 0.1 ? `${fmt(r.planned_park_ha, 1)} ha of park and school reserve` : '',
  ...(r.planned_facilities || []).map(f => `${f.title}${f.opens ? ' (' + f.opens + ')' : ''}`)].filter(Boolean).join('; ');
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
      <th scope="col">Local amenities score<small>today → ${y1} with what is planned; 1.00 = Calgary today</small></th><th scope="col">District facilities score<small>today → ${y1} with what is planned</small></th>
      <th scope="col" class="num">Playgrounds per 1,000 children<small>within 400 m</small></th><th scope="col" class="num">Park ha per 1,000 residents<small>within 400 m</small></th><th scope="col">Already planned<small>reserve land, facilities due by ${y1}</small></th><th scope="col">Falls below 0.80 by ${y1}</th><th scope="col">Far today<small>under half of homes within reach</small></th></tr></thead><tbody>
    ${rows.map(r => `<tr><td>${esc(r.name)}${r.in_forecast ? '' : ' <small class="muted">neighbour</small>'}</td>${city ? `<td class="num">${r.ward || '–'}</td>` : ''}<td>${esc(secName(r.sector))}<small class="muted"> ${esc(titleCase(r.srg || ''))}</small></td><td>${fcTag(S, r.reading)}</td>
      <td class="num">${fcN(r.recent_homes)}</td><td class="num"><b>${fcN(r.forecast_homes)}</b>${isNum(r.forecast_homes_low) && r.in_forecast ? `<small class="sc-range">${fcN(r.forecast_homes_low)} to ${fcN(r.forecast_homes_high)}</small>` : ''}</td>
      <td class="num">${fcArrow(r.residents_now, r.residents_2030, 0)}</td><td class="num">${isNum(r.growth_pct) ? signed(r.growth_pct, 0) : (r.residents_2030 ? 'new' : '–')}</td>
      <td>${fcScore((r.scores || {}).local)}</td><td>${fcScore((r.scores || {}).district)}</td>
      <td class="num">${fcCrowd((r.crowding || {}).playground, 2)}</td><td class="num">${fcCrowd((r.crowding || {}).park, 1)}</td><td class="wrap">${esc(fcPlanned(r)) || '<span class="dash">–</span>'}</td>
      <td class="wrap">${esc(fcKindWords(S, r.falls_below)) || '<span class="dash">–</span>'}</td><td class="wrap">${esc(fcKindWords(S, r.far_from)) || '<span class="dash">–</span>'}</td></tr>`).join('')
      || `<tr><td colspan="${city ? 15 : 14}" class="empty">No communities match. ${(S.communities || []).length ? 'Choose another sector or "Every community".' : `The forecast adds no homes in ${esc(W())}: its communities are established, and none of them shares amenities with a growing one enough to change its reading.`}</td></tr>`}
    </tbody></table></div>`;
  const shows = [['', 'Every community'], ['crowding', `More crowded by ${y1} (${fmt(worse)})`], ['far', 'Far from amenities today'], ['neighbours', 'Neighbours affected']];
  const showSeg = `<div class="seg small" role="radiogroup" id="fc-show">${shows.map(([k, l]) => `<button type="button" role="radio" aria-checked="${k === fcShow}" data-v="${k}">${esc(l)}</button>`).join('')}</div>`;

  const cgT = `<div class="table-wrap ac-full"><table class="data fc-cg"><thead><tr><th scope="col">Amenity</th><th scope="col">Within</th><th scope="col">Measure</th><th scope="col" class="num">Calgary today</th><th scope="col" class="num">${y1}, nothing new</th><th scope="col" class="num">${y1}, with what is planned</th><th scope="col" class="num">Change</th></tr></thead><tbody>
    ${Object.entries(cg).map(([k, v]) => { const e = isNum(v.planned) ? v.planned : v.then; return `<tr><td>${esc(K[k] || k)}</td><td>${fmt(v.distance_m)} m</td><td>${esc(v.unit)}</td><td class="num">${fcN(v.now, 2)}</td><td class="num">${fcN(v.then, 2)}</td><td class="num"><b>${fcN(v.planned, 2)}</b></td><td class="num">${isNum(v.now) && v.now ? signed(100 * (e - v.now) / v.now, 0) : '–'}</td></tr>`; }).join('')}
    </tbody></table></div>`;

  // 3. the projects the growth needs
  const P = (S.infrastructure || {}).projects || [];
  const infT = `<div class="table-wrap tall"><table class="data fc-inf"><thead><tr><th scope="col">Project</th><th scope="col">Service</th><th scope="col">Kind</th><th scope="col">Area plans it supports</th><th scope="col" class="num">Length on the map</th></tr></thead><tbody>
    ${P.map(p => `<tr><td class="wrap"><b>${esc(p.project)}</b></td><td>${esc(p.service)}</td><td>${esc(p.type)}</td><td class="wrap">${esc(p.plans.join('; '))}</td><td class="num">${isNum(p.km) ? fmt(p.km, 1) + ' km' : '–'}</td></tr>`).join('')}
    </tbody></table></div>`;

  box.innerHTML = `<div class="gap-scope ac-head fc-head"><h2 class="h3">The City's forecast to ${y1}, community by community <span class="ac-est">Estimate</span></h2>
      <p class="ac-lead">${esc(lead)}</p>
      <p class="card-note">From the City's Suburban Residential Growth (SRG) forecast, ${esc(dmy(S.edition))} edition: homes "absorbed" (built and lived in) in new communities each year, ${S.first_year} to ${y0 - 1}, and the City's forecast for ${y0} to ${y1}. The range is the City's own low and high yearly averages, by kind of home.</p></div>
    <div class="gap-scope"><div class="fc-chart-head"><h2 class="h3">New homes each year${fcSector ? ', ' + esc(secName(fcSector)) + ' sector' : ', all sectors'}</h2>${sel}</div>
      <p class="fc-key"><span class="fc-sw fc-sw-past" aria-hidden="true"></span>Built and lived in <span class="fc-sw fc-sw-fc" aria-hidden="true"></span>City forecast</p>
      <div class="fc-chart"><canvas id="fc-canvas" role="img" aria-label="New homes in new communities each year, ${S.first_year} to ${y1}, the last five years the City's forecast"></canvas></div>
      ${secT}<p class="card-note">Homes and people as the City publishes them, sector by sector (e7ib-v9n4). People per home is the forecast's people over its homes: the City's own figure for each kind of home. The Centre sector has no new communities, so no rows.</p></div>
    <div class="gap-scope"><h2 class="h3">Who grows, and what it does to amenities nearby</h2>
      <p class="ac-lead">Each sector's forecast is shared among its new communities by the homes built in each one in the last five years. Residents in ${y1} are today's (${esc(S.method || popChip())}) plus that share of the forecast people; Growth vs amenities is then worked out again with today's amenities. Scores are against Calgary <b>today</b>, so a score falls only where crowding itself gets worse.</p>
      <div class="ac-row">${showSeg}</div>
      ${commT}
      <p class="card-note"><b>Readings</b> (local amenities score: playgrounds, parks, transit stops and community centres, in ${y1} with what is planned): ${fcTag(S, 'becomes_crowded')} from around Calgary's level or above to below 0.80; ${fcTag(S, 'more_crowded')} below 0.80 today and a lower band, or 10% lower, by ${y1}; ${fcTag(S, 'crowded')} below 0.80 today and about the same; ${fcTag(S, 'far_growing')} under half of homes within reach of a playground, park or transit stop and growing 10% or more; ${fcTag(S, 'keeps_up')} none of these. "Neighbour": a community the forecast adds no homes to, whose playgrounds, parks or centres are shared with growing ones enough to change its band. <button type="button" class="link-btn small" data-method="growth_forecast">How the forecast is worked out</button></p>
      <h3 class="ac-h4">Calgary's amenities per person, today and in ${y1}</h3>${cgT}
      <p class="card-note">Calgary's figure in ${y1} counts only the forecast's new-community growth; growth in established communities is not in the City's forecast.</p></div>
    ${S.planned ? `<div class="gap-scope"><h2 class="h3">What is already planned</h2>
      <p class="card-sub">Added to the ${y1} figures above ("with what is planned"). <b>Park land:</b> ${fmt(S.planned.park_ha, 0)} ha in ${fmt(S.planned.park_polygons)} parcels across Calgary's new communities${city ? '' : `, ${fmt(S.planned.park_ha_scope, 0)} ha of it in ${esc(W())}`}, zoned as reserve in the City's Land Use Bylaw but not yet in its parks inventory: ${Object.entries(S.planned.park_ha_by_zone || {}).map(([z, ha]) => `${esc((S.planned.zones || {})[z] || z)} (${z}) ${fmt(ha, 0)} ha`).join(', ')}. That is land the developer has set aside for parks, schools and natural areas and not yet handed over as a finished City park. <b>Facilities</b> being built or funded and due by ${y1}:</p>
      <div class="table-wrap"><table class="data fc-pl"><thead><tr><th scope="col">Facility</th><th scope="col">Adds</th><th scope="col">Opens</th><th scope="col">Stage</th></tr></thead><tbody>
      ${(S.planned.facilities || []).map(f => `<tr><td class="wrap">${f.url ? `<button class="link-btn" data-open="${esc(f.url)}">${esc(f.title)}</button>` : esc(f.title)}</td><td>${esc(K[f.kind] || f.kind)}</td><td>${f.opens ? esc(String(f.opens)) : 'Under construction, date not given'}</td><td class="wrap">${esc(f.status || '')}</td></tr>`).join('') || '<tr><td colspan="4" class="empty">None listed.</td></tr>'}
      </tbody></table></div>
      <p class="card-note">Not added because no published list has them: new playgrounds (developers build most of them with each phase) and new transit stops. Schools and fire stations being built are on "Being built", with every other major project in ${esc(W())}. Facilities planned in area structure plans but not funded are not counted.</p></div>` : ''}
    <div class="gap-scope"><h2 class="h3">Projects the new homes need</h2>
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
      'Children 0-14 today', `Children 0-14 ${y1}`, 'Local amenities score today', `Local amenities score ${y1}, nothing new`, `Local amenities score ${y1}, with what is planned`, 'District facilities score today', `District facilities score ${y1}, nothing new`, `District facilities score ${y1}, with what is planned`, 'Planned park and school reserve (ha)', 'Planned facilities',
      ...Object.keys(S.kinds || {}).flatMap(k => [`${S.kinds[k]} crowding today`, `${S.kinds[k]} crowding ${y1}, nothing new`, `${S.kinds[k]} crowding ${y1}, with what is planned`]), `Falls below 0.80 by ${y1}`, 'Far from today'],
    rows: fcRows(S).map(r => [r.name, r.ward || '', titleCase(r.sector || ''), titleCase(r.srg || ''), (S.readings || {})[r.reading] || r.reading, r.recent_homes ?? '', r.share_of_sector ?? '',
      r.forecast_homes, r.forecast_homes_low ?? '', r.forecast_homes_high ?? '', r.forecast_people, r.residents_now, r.residents_2030, r.growth_pct ?? '', r.children_now, r.children_2030,
      ((r.scores || {}).local || {}).now ?? '', ((r.scores || {}).local || {}).then ?? '', ((r.scores || {}).local || {}).planned ?? '',
      ((r.scores || {}).district || {}).now ?? '', ((r.scores || {}).district || {}).then ?? '', ((r.scores || {}).district || {}).planned ?? '',
      r.planned_park_ha ?? '', (r.planned_facilities || []).map(f => f.title + (f.opens ? ' (' + f.opens + ')' : '')).join('; '),
      ...Object.keys(S.kinds || {}).flatMap(k => [((r.crowding || {})[k] || {}).now ?? '', ((r.crowding || {})[k] || {}).then ?? '', ((r.crowding || {})[k] || {}).planned ?? '']),
      fcKindWords(S, r.falls_below), fcKindWords(S, r.far_from)]),
  };
}

;
// ---- compare.js
/* Calgary Insight: compare wards. Every ward side by side, from the whole-city figures for the same period. */
'use strict';

// Each measure: where it is in a ward's row, how to show it, and which way is better (null: neither).
const CMP_METRICS = [
  { g: 'People and growth', k: 'residents', get label() { return popMethod() === 'census2021' ? 'Residents (' + CY() + ' Census count)' : 'Residents today'; }, d: 0, better: null },
  { g: 'People and growth', k: 'growth_pct', get label() { return ['city_pace', 'city_actual'].includes(popMethod()) ? 'Above the ' + CY() + ' Census count (includes people the Census count left out)' : 'Growth since the ' + CY() + ' Census'; }, d: 1, unit: '%', better: null },
  { g: 'People and growth', k: 'children_0_14', label: 'Children aged 0 to 14 (estimate)', d: 0, better: null },
  { g: '311', k: 'requests_per_1000', label: '311 requests per 1,000 residents a year', d: 0, better: null },
  { g: '311', k: 'infra_per_1000', label: 'Infrastructure reports per 1,000 residents a year', d: 1, better: null },
  // 311 counts are not scored better or worse: fewer reports can mean problems are not being reported (the 311 study)
  { g: '311', k: 'open_per_1000', label: 'Open requests per 1,000 residents (requests in residential communities)', d: 1, better: null },
  { g: '311', k: 'closed_7_days_pct', label: 'Requests closed within 7 days', d: 1, unit: '%', better: 'high' },
  { g: '311', k: 'app_share_pct', label: 'Requests made on a phone (311 Calgary)', d: 1, unit: '%', better: null },
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
];
const CMP_AMENITY = ['playgrounds', 'local_park_ha', 'benches', 'picnic_tables', 'basketball', 'goal_posts', 'washrooms',
  'off_leash', 'trees', 'rec_facilities', 'libraries', 'community_centres', 'transit_stops'];

let CMP = { data: null, geo: null, forPeriod: undefined, main: null, others: new Set(), picked: false, metric: 'ac:playground', map: null, layer: null, loading: null };
try {
  const saved = JSON.parse(localStorage.getItem('cdd-compare') || 'null');
  if (saved) { CMP.main = saved.main; CMP.others = new Set(saved.picked ? (saved.others || []).filter(w => w >= 1 && w <= 14) : []); CMP.picked = !!saved.picked; CMP.metric = saved.metric || CMP.metric; }
} catch { /* storage off */ }
const cmpSave = () => { try { localStorage.setItem('cdd-compare', JSON.stringify({ main: CMP.main, others: [...CMP.others], picked: CMP.picked, metric: CMP.metric })); } catch { /* storage off */ } };

function cmpMetrics() {
  const ws = (CMP.data || {}).wards_summary || {};
  const kinds = ws.amenity_kinds || {};
  const am = CMP_AMENITY.filter(k => kinds[k]).map(k => ({
    g: 'Amenities', k: 'am:' + k, d: k === 'trees' ? 0 : 2, better: 'high',
    label: kinds[k].per === 'children' ? `${kinds[k].label} per 1,000 children` : `${kinds[k].label} per 1,000 residents`,
  }));
  // Growth vs amenities (revised 5 November 2026): share of homes within the first distance, in any community
  const A = (CMP.data || {}).access || {}, ak = A.kinds || {};
  const ac = ['playground', 'park', 'transit_stop', 'community_centre', 'rec_centre', 'library'].filter(k => ak[k]).map(k => ({
    g: 'Amenities', k: 'ac:' + k, d: 0, unit: '%', better: null,
    label: `Homes within ${(ak[k].thresholds_m || [])[0] >= 1000 ? (ak[k].thresholds_m[0] / 1000) + ' km' : (ak[k].thresholds_m || [])[0] + ' m'} of ${ak[k].label === 'Public park' ? 'a public park' : 'a' + (/^[aeiou]/i.test(ak[k].label) ? 'n ' : ' ') + ak[k].label.toLowerCase()} (any community)`,
  }));
  return [...CMP_METRICS, ...ac, ...am];
}
const cmpAc = (ward, k) => { const w = (((CMP.data || {}).access || {}).wards || []).find(x => x.ward === ward); const v = w && (w[k] || {}).share_1; return isNum(v) ? v * 100 : null; };
const cmpVal = (row, k) => !row ? null : k.startsWith('am:') ? ((row.amenities || {})[k.slice(3)] ?? null)
  : k.startsWith('ac:') ? cmpAc(row.ward, k.slice(3)) : (row[k] ?? null);
const cmpCity = k => { const ws = CMP.data.wards_summary; if (k.startsWith('ac:')) { const v = ((((CMP.data.access || {}).city || {})[k.slice(3)]) || {}).share_1; return isNum(v) ? v * 100 : null; }
  return k.startsWith('am:') ? (ws.amenities_city || {})[k.slice(3)] ?? null : ws.city[k] ?? null; };
const cmpFmt = (m, v) => !isNum(v) ? '–' : m.signed ? signed(v, m.d, m.unit || '') : fmt(v, m.d) + (m.unit || '');
const ord = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');

function cmpRank(m, ward) {
  const rows = CMP.data.wards_summary.wards.filter(r => isNum(cmpVal(r, m.k)));
  const dir = m.better === 'low' ? 1 : -1;                          // rank 1: best, or highest when neither is better
  // equal values (as shown) share a place: rank = 1 + how many wards come before it
  const shown = r => Math.round(cmpVal(r, m.k) * Math.pow(10, m.d || 0));
  const me = rows.find(r => r.ward === ward);
  if (!me) return null;
  return { n: 1 + rows.filter(r => dir * (shown(r) - shown(me)) < 0).length, of: rows.length };
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
  if (!CMP.main) CMP.main = SCOPE || 1;
  // by default the ward in focus against Calgary only; other wards are added from "Compare with"
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
  $('#cmp-note').textContent = `${ws.note || ''} Crime: ${ws.crime_period || 'the latest months published'}. Amenities: homes within reach of each amenity, in any community (Growth vs amenities); City assets in open data per 1,000 residents (playgrounds per 1,000 children) counted inside each ward.`;
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

;
// ---- budget.js
/* Calgary Insight: the City budget (live from Calgary Open Budget), and live connection tests for every source. */
'use strict';

// ================================================================ CITY BUDGET
let BUD = null, budYear = null, budChart = null;
const money = m => !isNum(m) ? '–' : m >= 1000 ? `$${fmt(m / 1000, 2)} billion` : `$${fmt(m, 1)} million`;
const moneyShort = m => !isNum(m) ? '–' : m >= 1000 ? `$${fmt(m / 1000, 2)}B` : `$${fmt(m, 0)}M`;
// "$12.5 million" -> 12.5 (millions of dollars); the largest amount named in a text
function millions(text) {
  let best = null;
  String(text || '').replace(/\$\s*([\d.,]+)\s*(billion|million|thousand|[bmk])?/gi, (_, n, u) => {
    let v = parseFloat(n.replace(/,/g, '')); u = (u || '').toLowerCase();
    v = u.startsWith('b') ? v * 1000 : u.startsWith('m') ? v : u.startsWith('t') || u === 'k' ? v / 1000 : v / 1e6;
    if (isNum(v)) best = Math.max(best || 0, v);
    return '';
  });
  return best;
}

async function loadBudget(force = false) {
  try {
    const res = await (await api()).get_budget(force);
    if (!res.ok) throw new Error(res.error);
    BUD = res.data;
    $('#bud-error').hidden = true;
  } catch (e) {
    $('#bud-error').textContent = `The budget could not be loaded from the City's open data: ${e.message || e}`;
    $('#bud-error').hidden = false;
  }
}

async function renderBudget() {
  if (!BUD) await loadBudget();
  if (!BUD) return;
  const years = BUD.years;
  if (!budYear) budYear = years.includes('2026') ? '2026' : years[years.length - 1];
  $('#bud-year').innerHTML = years.map(y => `<option ${y === budYear ? 'selected' : ''}>${y}</option>`).join('');
  const T = BUD.totals[budYear] || {}, op = T.operating, cap = T.capital;
  const people = D && D.population ? D.population.city_now : null;
  // a year past the current budget cycle has no operating budget: its capital is spending Council already approved, in
  // earlier budgets, for multi-year projects that run into that year; it is not a budget for that year
  const ahead = !op && !!cap;
  $('#bud-sub').textContent = ahead
    ? `${budYear}: no budget has been set for this year. The capital figure is spending Council already approved in earlier budgets for multi-year projects that run into ${budYear}, as the City's open budget data lists it.${+budYear <= 2030 ? ' The proposed 2027 to 2030 budget, now before Council, would add to it.' : ''} Live from Calgary Open Budget.`
    : `The City of Calgary's ${budYear} budget: ${[op ? (op.status || '').toLowerCase() + ' operating' : '', cap ? (cap.status || '').toLowerCase() + ' capital' : ''].filter(Boolean).join(' and ')}. Live from Calgary Open Budget.`;
  const prev = BUD.totals[String(+budYear - 1)] || {};
  const ch = (a, b) => a && b && b.value ? signed((a.value / b.value - 1) * 100, 1) + ' on ' + (+budYear - 1) : '';
  $('#bud-stats').innerHTML = [
    [op ? money(op.value) : '–', `operating budget${op ? ', ' + (op.status || '').toLowerCase() : ''} ${ch(op, prev.operating)}`],
    [cap ? money(cap.value) : '–', ahead ? `capital already approved for ${budYear} (multi-year projects)` : `capital budget${cap ? ', ' + (cap.status || '').toLowerCase() : ''} ${ch(cap, prev.capital)}`],
    [op && people ? '$' + fmt(op.value * 1e6 / people) : '–', `operating per resident (${fmt(people)} people, the City's estimate)`],
    [cap && people && !ahead ? '$' + fmt(cap.value * 1e6 / people) : '–', ahead ? 'per resident: not shown for a future year' : 'capital per resident'],
  ].map(([b, s]) => `<div class="istat"><b>${b}</b><span>${esc(s)}</span></div>`).join('');

  const bars = (sel, list) => {
    const top = Math.max(1, ...(list || []).map(d => d.value));
    $(sel).innerHTML = (list || []).map((d, i) => `<div class="cmp-bar bud-bar"><span class="cmp-bar-n">${i + 1}</span><span class="cmp-bar-l" title="${esc(d.name)}">${esc(d.name)}</span>
      <span class="cmp-bar-t"><span class="cmp-bar-f" style="left:0;width:${Math.max(.5, d.value / top * 100)}%"></span></span><span class="cmp-bar-v">${moneyShort(d.value)}</span></div>`).join('')
      || `<p class="card-sub">No ${sel === '#bud-op' ? 'operating' : 'capital'} budget is published for ${budYear}.</p>`;
  };
  const BD = BUD.by_department[budYear] || {};
  bars('#bud-op', BD.operating); bars('#bud-cap', BD.capital);
  $('#bud-op-title').textContent = `Operating budget by department, ${budYear}`;
  $('#bud-cap-title').textContent = `Capital budget by department, ${budYear}`;

  // year by year
  if (typeof Chart !== 'undefined') {
    if (budChart) budChart.destroy();
    budChart = new Chart($('#bud-trend'), {
      type: 'bar',
      data: { labels: years, datasets: [
        { label: 'Operating', data: years.map(y => (BUD.totals[y].operating || {}).value ?? null), backgroundColor: cssv('--chart-bar') },
        { label: 'Capital', data: years.map(y => (BUD.totals[y].capital || {}).value ?? null), backgroundColor: '#D9A93E' }] },
      options: { maintainAspectRatio: false, plugins: { tooltip: { callbacks: { label: c => `${c.dataset.label}: ${money(c.parsed.y)} (${(BUD.totals[c.label][c.dataset.label.toLowerCase()] || {}).status || ''})` } } },
        scales: { y: { ticks: { callback: v => moneyShort(v) } } } },
    });
  }
  $('#bud-trend-sub').textContent = 'Millions of dollars. Past years show what was approved or actually spent, as the City lists them. Years after 2026 have no budget yet: their capital is spending already approved in earlier budgets for multi-year projects, which is why it falls away; the proposed 2027 to 2030 budget would add to it.';

  // every service
  const rows = [];
  ['operating', 'capital'].forEach(k => (BD[k] || []).forEach(d => d.units.forEach(u => rows.push([k, d.name, u.name, u.value]))));
  $('#bud-table thead').innerHTML = '<tr><th scope="col">Budget</th><th scope="col">Department</th><th scope="col">Service (business unit)</th><th scope="col" class="num">Millions of dollars</th></tr>';
  $('#bud-table tbody').innerHTML = rows.map(r => `<tr><td>${r[0] === 'operating' ? 'Operating' : 'Capital'}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td class="num">${fmt(r[3], 1)}</td></tr>`).join('');
  $('#bud-table-sub').textContent = `${rows.length} lines for ${budYear}, as the City publishes them.`;
  renderPlan();
  renderRevenue();
  renderTax();
  renderBudgetWards();
  $('#bud-notes').innerHTML = `${esc(BUD.note)} Source: City of Calgary, <button class="link-btn small" data-open="${esc(BUD.page)}">Calgary Open Budget (${esc(BUD.dataset)})</button>, read ${esc(BUD.fetched || '')}; the City's <button class="link-btn small" data-open="${esc(BUD.budget_page)}">budget pages</button>.`;
}

// the proposed 2027-2030 budget: what it would cost a typical household, the tax path, water, investments, and the
// City's open data by department (data/budget_2027.json and nnnm-9sfh)
function renderPlan() {
  const P = BUD && BUD.plan_2027, O = BUD && BUD.proposed;
  $('#bud-plan-card').hidden = !P;
  if (!P) return;
  const d = s => new Date(s.length === 7 ? s + '-15T12:00:00' : s + 'T12:00:00').toLocaleDateString('en-CA', s.length === 7 ? { month: 'long', year: 'numeric' } : { month: 'long', day: 'numeric', year: 'numeric' });
  $('#bud-plan-sub').textContent = `${P.status} Council deliberations begin the week of November 23, 2026; approval is expected in December.`;
  const H = P.household, W = P.water_2027, T = P.tax_path;
  const cum = (T.pct.reduce((a, p) => a * (1 + p / 100), 1) - 1) * 100;
  const link = (u, t) => `<button class="link-btn small" data-open="${esc(u)}">${esc(t)}</button>`;
  const dep = O && O.by_department;
  const yrs = O ? O.years : [];
  const depNames = dep ? [...new Set(yrs.flatMap(y => ((dep[y] || {}).operating || []).map(x => x.name)))] : [];
  const opv = (y, n) => (((dep[y] || {}).operating || []).find(x => x.name === n) || {}).value;
  $('#bud-plan').innerHTML = `
    <div class="bud-plan-grid">
      <div><h3>What it would cost a typical home in 2027</h3>
        <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Each month</th><th scope="col" class="num">2026</th><th scope="col" class="num">2027 proposed</th><th scope="col" class="num">Change</th></tr></thead>
        <tbody>${H.lines.map(l => `<tr${l.item === 'Total' ? ' class="cmp-city-row"' : ''}><td>${l.item === 'Total' ? '<b>Total</b>' : esc(l.item)}</td><td class="num">$${fmt(l.m2026)}</td><td class="num">$${fmt(l.m2027)}</td><td class="num"><b>+$${fmt(l.change)}</b></td></tr>`).join('')}</tbody></table></div>
        <p class="card-sub">That is about $${fmt(H.lines[2].change * 12)} more a year. ${esc(H.basis)} Source: ${link(H.url, H.source)}.</p>
        <p><a class="btn small" href="studies/what-calgarians-pay/calculator.html">Work out your own bill, 2026 to 2030</a> <a class="btn small" href="studies/what-calgarians-pay/">How Calgary compares</a></p></div>
      <div><h3>Property tax, year by year</h3>
        <div class="bud-path">${T.years.map((y, i) => `<div class="istat"><b>+${fmt(T.pct[i], 1)}%</b><span>${y}${i ? ' (reported)' : ''}</span></div>`).join('')}</div>
        <p class="card-sub">If every year passes as proposed, the City would collect about ${fmt(cum, 0)}% more property tax from existing properties in 2030 than in 2026 (each year's increase compounds on the last). ${esc(T.source)} ${esc(T.context)}</p></div>
    </div>
    <h3>Water, wastewater and stormwater in 2027</h3>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Service (${esc(W.basis)})</th><th scope="col" class="num">2026 rate</th><th scope="col" class="num">2027 rate</th><th scope="col" class="num">Change</th><th scope="col" class="num">A month more</th><th scope="col" class="num">2027 a month</th></tr></thead>
      <tbody>${W.lines.map(l => `<tr><td>${esc(l.item)}</td><td class="num">${esc(l.rate2026)}</td><td class="num">${esc(l.rate2027)}</td><td class="num">+${fmt(l.pct, 1)}%</td><td class="num">+$${fmt(l.change, 2)}</td><td class="num">$${fmt(l.bill2027, 2)}</td></tr>`).join('')}
      <tr class="cmp-city-row"><td><b>Typical bill</b></td><td class="num">$${fmt(W.total.bill2026, 2)}</td><td class="num"></td><td class="num"><b>+${fmt(W.total.pct, 1)}%</b></td><td class="num"><b>+$${fmt(W.total.change, 2)}</b></td><td class="num"><b>$${fmt(W.total.bill2027, 2)}</b></td></tr></tbody></table></div>
    <p class="card-sub">${esc(W.four_year)} Source: ${link(W.url, W.source)}. Water rates were set by Council separately; the budget's household figure adds waste and recycling.</p>
    ${O ? `<h3>Operating budget by department, proposed</h3>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Department ($ millions, net of recoveries)</th>${yrs.map(y => `<th scope="col" class="num">${y}</th>`).join('')}</tr></thead>
      <tbody>${depNames.map(n => `<tr><td>${esc(n)}</td>${yrs.map(y => `<td class="num">${opv(y, n) != null ? fmt(opv(y, n), 0) : '–'}</td>`).join('')}</tr>`).join('')}
      <tr class="cmp-city-row"><td><b>Total operating</b></td>${yrs.map(y => `<td class="num"><b>${fmt(((O.totals[y] || {}).operating || {}).proposed, 0)}</b></td>`).join('')}</tr>
      <tr><td>Capital, new (proposed)</td>${yrs.map(y => `<td class="num">${fmt(((O.totals[y] || {}).capital || {}).proposed, 0)}</td>`).join('')}</tr>
      <tr><td>Capital, approved in earlier budgets</td>${yrs.map(y => `<td class="num">${fmt(((O.totals[y] || {}).capital || {}).approved, 0)}</td>`).join('')}</tr></tbody></table></div>
    <p class="card-sub">${esc(O.note)} ${esc(P.comparability)} Source: City of Calgary, ${link(O.page, 'open data: 2027–2030 Budget (' + O.dataset + ')')}${O.fetched ? ', read ' + esc(O.fetched) : ''}.</p>` : ''}
    <h3>What the money would buy (the City's highlights)</h3>
    <ul class="bud-inv">${P.investments.map(([g, a, w]) => `<li><b>${esc(a)}</b> ${esc(w)} <span class="card-sub">${esc(g)}</span></li>`).join('')}</ul>
    <p class="card-sub">Where 2027 revenue would come from: ${P.revenue_2027_pct.map(([n, p]) => `${esc(n)} ${p}%`).join(', ')}.</p>
    <p class="card-sub">Documents: ${P.documents.map(([t, u]) => link(u, t)).join(' · ')}. Have your say: written comments and registration to speak are open on the City's budget page. Figures as published by the City on ${esc(d(P.presented))}; they will change if Council amends the budget.</p>`;
}

// where the money comes from: operating revenue by source (the City's budget book)
function renderRevenue() {
  const R = BUD && BUD.revenue;
  $('#bud-rev-card').hidden = !R;
  if (!R) return;
  const yi = R.years.indexOf(budYear), i = yi >= 0 ? yi : R.years.length - 1, y = R.years[i];
  const total = R.total[i];
  const lines = R.lines.map(l => ({ ...l, v: l.values[i] })).sort((a, b) => b.v - a.v);
  $('#bud-rev-title').textContent = `Where the money comes from, ${y}`;
  $('#bud-rev-sub').textContent = `Operating revenue by source, $${fmt(total)} million in all (not counting $${fmt(R.reserve_withdrawal[i])} million drawn from reserves).${yi < 0 ? ` The budget book gives revenue to ${y}.` : ''}`;
  const top = Math.max(...lines.map(l => l.v));
  $('#bud-rev').innerHTML = lines.map((l, k) => `<div class="cmp-bar bud-bar${k === 0 ? ' main' : ''}"><span class="cmp-bar-n">${fmt(l.v / total * 100, 0)}%</span><span class="cmp-bar-l" title="${esc(l.note || l.name)}">${esc(l.name)}</span>
    <span class="cmp-bar-t"><span class="cmp-bar-f" style="left:0;width:${l.v / top * 100}%"></span></span><span class="cmp-bar-v">${moneyShort(l.v)}</span></div>`).join('');
  $('#bud-rev-table thead').innerHTML = `<tr><th scope="col">Source ($ millions)</th>${R.years.map(x => `<th scope="col" class="num">${x}</th>`).join('')}<th scope="col" class="num">Change ${R.years[R.years.length - 2]} to ${R.years[R.years.length - 1]}</th></tr>`;
  const ch = l => { const n = l.values.length; return signed((l.values[n - 1] / l.values[n - 2] - 1) * 100, 0); };
  $('#bud-rev-table tbody').innerHTML = R.lines.map(l => `<tr><td title="${esc(l.note || '')}">${esc(l.name)}</td>${l.values.map(v => `<td class="num">${fmt(v)}</td>`).join('')}<td class="num">${ch(l)}</td></tr>`).join('')
    + `<tr class="cmp-city-row"><td><b>Total operating revenue</b></td>${R.total.map(v => `<td class="num"><b>${fmt(v)}</b></td>`).join('')}<td class="num">${signed((R.total[R.total.length - 1] / R.total[R.total.length - 2] - 1) * 100, 0)}</td></tr>`;
  $('#bud-rev-note').innerHTML = `Source: ${esc(R.source)}. Figures are as the City published them, in millions, so a column can differ from its total by 1 through rounding. The City publishes revenue by source in its budget book, not in open data, so these figures are kept with Calgary Insight and updated with each budget. Of these sources, only property tax can be placed by ward (below); user fees, franchise fees, investment income, grants and the ENMAX dividend have no location. <button class="link-btn small" data-open="${esc(R.page)}">The City's budget pages</button>`;
}

// property tax by ward: an estimate from the assessment roll and the tax bylaw
let TAX = null;
async function renderTax() {
  const box = $('#bud-tax');
  if (!TAX) {
    try { const r = await (await api()).get_property_tax(false); if (!r.ok) throw new Error(r.error); TAX = r.data; }
    catch (e) { box.innerHTML = `<p class="card-sub">The property tax estimate could not be worked out: ${esc(e.message || e)}</p>`; return; }
  }
  const T = TAX, cityTot = T.city.total, city = isCity();
  const wardsRes = {}; ((D && D.wards_summary && D.wards_summary.wards) || (CMP && CMP.data && CMP.data.wards_summary && CMP.data.wards_summary.wards) || []).forEach(r => { wardsRes[r.ward] = r.residents; });
  const allRes = Object.values(wardsRes).reduce((a, b) => a + (b || 0), 0);
  $('#bud-tax-title').textContent = city ? `Property tax by ward, ${T.year} (estimate)` : `Property tax in ${W()}, ${T.year} (estimate)`;
  $('#bud-tax-sub').innerHTML = `The City does not publish property tax by ward. This estimates the tax <b>billed</b> (not collected) from every property's assessed value and the ${esc(T.bylaw)} rates. Calgary's total equals the bylaw's levy: <b>${money(cityTot / 1e6)}</b>, of which ${money(T.city.municipal.total / 1e6)} is City tax and ${money(T.city.education.total / 1e6)} is the Province's education tax.`;
  const pct = (a, b) => b ? fmt(a / b * 100, 1) + '%' : '–';
  if (city) {
    const rows = Object.entries(T.by_ward).map(([w, v]) => ({ w: +w, ...v })).sort((a, b) => a.w - b.w);
    box.innerHTML = `<div class="table-wrap"><table class="data"><thead><tr><th scope="col">Ward</th><th scope="col">Councillor</th><th scope="col" class="num">Property tax billed</th><th scope="col" class="num">City share</th><th scope="col" class="num">Education (Province)</th><th scope="col" class="num">Paid on homes</th><th scope="col" class="num">Per resident</th><th scope="col" class="num">Share of Calgary's tax</th><th scope="col" class="num">Share of its residents</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td>Ward ${r.w}</td><td>${esc(((T.wards || {})[r.w] || {}).councillor || '')}</td><td class="num">${money(r.total / 1e6)}</td><td class="num">${money(r.municipal / 1e6)}</td><td class="num">${money(r.education / 1e6)}</td><td class="num">${pct(r.residential, r.total)}</td><td class="num">${wardsRes[r.w] ? '$' + fmt(r.total / wardsRes[r.w]) : '–'}</td><td class="num">${pct(r.total, cityTot)}</td><td class="num">${allRes && wardsRes[r.w] ? pct(wardsRes[r.w], allRes) : '–'}</td></tr>`).join('')}
      ${(() => { const sum = k => rows.reduce((a, r) => a + (r[k] || 0), 0), left = cityTot - sum('total');
        return left > 1000 ? `<tr><td colspan="2">Not in any ward (land the City's ward table leaves out)</td><td class="num">${money(left / 1e6)}</td><td class="num">${money((T.city.municipal.total - sum('municipal')) / 1e6)}</td><td class="num">${money((T.city.education.total - sum('education')) / 1e6)}</td><td class="num"></td><td class="num"></td><td class="num">${pct(left, cityTot)}</td><td class="num"></td></tr>` : ''; })()}
      <tr class="cmp-city-row"><td><b>Calgary</b></td><td></td><td class="num"><b>${money(cityTot / 1e6)}</b></td><td class="num">${money(T.city.municipal.total / 1e6)}</td><td class="num">${money(T.city.education.total / 1e6)}</td><td class="num">${pct(T.city.municipal.residential + T.city.education.residential, cityTot)}</td><td class="num">${allRes ? '$' + fmt(cityTot / allRes) : '–'}</td><td class="num">100%</td><td class="num">100%</td></tr></tbody></table></div>
      ${taxRecon(T)}
      <p class="card-note"><b>City share</b> is the municipal tax the City keeps; the rest of each bill is the Province's education tax, which the City collects and passes to the Government of Alberta. <b>Paid on homes</b> is the share paid on residential property (houses, condos, rental buildings); the rest is business, industrial and other non-residential property, which pays about 4.6 times the residential City rate. Residents counted with ${esc(popWords())}.</p>`;
    return;
  }
  const mine = Object.entries(T.by_comm).filter(([, e]) => e.ward === SCOPE).map(([c, e]) => ({ c, ...e })).sort((a, b) => b.total - a.total);
  const wv = T.by_ward[String(SCOPE)] || { total: 0, municipal: 0, education: 0, residential: 0 };
  const res = D && D.ward ? D.ward.residents : null;
  const commRes = {}; (D.communities || []).forEach(c => { commRes[c.code] = c.residents; });
  box.innerHTML = `<div class="issue-stats">${[[money(wv.total / 1e6), `property tax billed in ${W()} (${pct(wv.total, cityTot)} of Calgary's)`], [money(wv.municipal / 1e6), 'of it City tax'], [res ? '$' + fmt(wv.total / res) : '–', 'per resident'], [pct(wv.residential, wv.total), 'paid on homes']].map(([b, s]) => `<div class="istat"><b>${b}</b><span>${esc(s)}</span></div>`).join('')}</div>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Community</th><th scope="col" class="num">Property tax billed</th><th scope="col" class="num">City share</th><th scope="col" class="num">Paid on homes</th><th scope="col" class="num">Per resident</th><th scope="col" class="num">Properties</th></tr></thead><tbody>
    ${mine.map(e => `<tr><td>${esc(titleCase(e.name || e.c))}</td><td class="num">${money(e.total / 1e6)}</td><td class="num">${money(e.municipal.total / 1e6)}</td><td class="num">${pct(e.municipal.residential + e.education.residential, e.total)}</td><td class="num">${commRes[e.c] ? '$' + fmt(e.total / commRes[e.c]) : '–'}</td><td class="num">${fmt(e.accounts)}</td></tr>`).join('')}</tbody></table></div>`;
}

// the City share placed in wards against the budget book's property tax revenue line
function taxRecon(T) {
  const R = BUD && BUD.revenue;
  const i = R ? R.years.indexOf(String(T.year)) : -1;
  const line = i >= 0 ? R.lines.find(l => /property tax/i.test(l.name)) : null;
  if (!line) return '';
  const placed = Object.values(T.by_ward || {}).reduce((a, w) => a + (w.municipal || 0), 0);
  const bud = line.values[i] * 1e6, gap = bud - placed;
  return `<div class="tax-recon"><div><b>${money(bud / 1e6)}</b><span>${esc(T.year)} budget: property tax revenue, including levies</span></div>
    <div><b>${money(placed / 1e6)}</b><span>City share billed under the tax bylaw, placed in the wards above (${fmt(placed / bud * 100, 1)}%)</span></div>
    <div><b>${money(gap / 1e6)}</b><span>Not placed by ward: local improvement and community revitalization levies, tax from properties added during the year, and ${money((T.city.municipal.total - placed) / 1e6)} billed on land outside the ward table</span></div></div>`;
}

// what can be placed in a ward: City projects and road projects with a stated cost
function renderBudgetWards() {
  const box = $('#bud-ward');
  if (!D) { box.innerHTML = ''; return; }
  const wardOf = {}; (D.communities || []).forEach(c => { wardOf[c.code] = c.ward; });
  // City budget spending only: projects the City (or its housing company) owns, and City road projects. Private and
  // other-government projects are on Growth vs amenities; they are not City spending.
  const cityOwned = p => /city of calgary|calgary housing company/i.test(p.owner || '');
  const items = [
    ...(D.projects || []).filter(p => p.state !== 'completed' && cityOwned(p)).map(p => ({ title: p.title, kind: p.kind || 'Project', owner: p.owner || '', cost: millions(p.budget), text: p.budget || '', comm: p.comm, url: p.url, state: p.state })),
    ...(D.roadwork || []).map(r => ({ title: r.title, kind: 'Road project', owner: 'City of Calgary', cost: millions(r.budget), text: r.budget || '', comm: r.comm, url: r.url, state: 'building' })),
  ];
  // a line that runs through several wards is not placed in one; a cost shared among several listed items ("Part of
  // $3.9 million") is not added once per item
  items.forEach(i => { i.multi = /green line/i.test(i.title); i.shared = /^\s*(about\s+)?part of/i.test(i.text); });
  const city = isCity();
  $('#bud-ward-title').textContent = city ? 'City projects by ward' : `${W()}: City projects that can be placed`;
  $('#bud-ward-sub').innerHTML = `<b>The City publishes its budget by department and service, not by ward.</b> What can be placed in ${city ? 'each ward' : esc(W())} is City of Calgary projects being built or planned, and City road projects, each with the whole project's published cost. That is usually spent over several years and often shared with the province or the federal government, so it is not a year's budget and is not divided per resident. Private and other-government projects are on Growth vs amenities.`;
  const withCost = items.filter(i => isNum(i.cost));
  const counted = withCost.filter(i => !i.multi && !i.shared);
  const multi = withCost.filter(i => i.multi);
  const shared = withCost.filter(i => i.shared);
  const extra = (multi.length ? `<p class="card-note">Not placed in a ward because it runs through several: ${multi.map(i => `${esc(i.title)} (${money(i.cost)})`).join('; ')}.</p>` : '')
    + (shared.length ? `<p class="card-note">${fmt(shared.length)} listed project${shared.length === 1 ? '' : 's'} share${shared.length === 1 ? 's' : ''} a cost published for several together (for example ${esc(shared[0].text)}); ${shared.length === 1 ? 'it is' : 'they are'} counted but not added to the totals.</p>` : '');
  if (city) {
    const byW = {};
    withCost.forEach(i => { if (i.multi) return; const w = wardOf[i.comm]; if (!w) return; const b = byW[w] = byW[w] || { n: 0, sum: 0 }; b.n++; if (!i.shared) b.sum += i.cost; });
    const ws = (D.wards_summary || {}).wards || [];
    box.innerHTML = `<div class="table-wrap"><table class="data"><thead><tr><th scope="col">Ward</th><th scope="col">Councillor</th><th scope="col" class="num">City projects with a published cost</th><th scope="col" class="num">Their whole cost</th></tr></thead><tbody>
      ${ws.map(r => { const b = byW[r.ward] || { n: 0, sum: 0 }; return `<tr><td>Ward ${r.ward}</td><td>${esc(r.councillor || '')}</td><td class="num">${fmt(b.n)}</td><td class="num">${b.sum ? money(b.sum) : '–'}</td></tr>`; }).join('')}
      </tbody></table></div>${extra}<p class="card-note">Only City projects listed on Calgary Insight with a published cost and a location. Large plants serve the whole city wherever they stand (for example the Fish Creek and Bonnybrook wastewater plants), and a ward with few listed may still have City spending: maintenance, services and programs are budgeted city-wide.</p>`;
    return;
  }
  box.innerHTML = withCost.length ? `<div class="table-wrap"><table class="data"><thead><tr><th scope="col">Project</th><th scope="col">Kind</th><th scope="col">Owner</th><th scope="col">Community</th><th scope="col" class="num">Published cost</th></tr></thead><tbody>
    ${withCost.sort((a, b) => b.cost - a.cost).map(i => `<tr><td class="wrap">${i.url ? `<button class="link-btn" data-open="${esc(i.url)}">${esc(i.title)}</button>` : esc(i.title)}${i.multi ? ' <small>(runs through several wards; not in the total)</small>' : ''}</td><td>${esc(i.kind)}</td><td>${esc(i.owner)}</td><td>${esc(i.comm ? commName(i.comm) : '')}</td><td class="num" title="${esc(i.text)}">${i.shared ? esc(i.text) : money(i.cost)}</td></tr>`).join('')}
    <tr class="cmp-city-row"><td colspan="4"><b>Total of the City costs published</b></td><td class="num"><b>${money(counted.reduce((a, i) => a + i.cost, 0))}</b></td></tr></tbody></table></div>
    ${shared.length ? `<p class="card-note">Costs shared among several items are shown as published and not added to the total.</p>` : ''}
    <p class="card-note">${fmt(items.length - withCost.length)} more City projects are listed without a published cost. Costs are each whole project's, as the City publishes them, often over several years and shared with other governments. Private and other-government projects are on Growth vs amenities.</p>`
    : `<p class="card-sub">No City project with a published cost is listed for ${esc(W())}.</p>`;
}

$('#bud-year').addEventListener('change', e => { budYear = e.target.value; renderBudget(); });
$('#bud-export').addEventListener('click', e => {
  if (!BUD) return;
  const BD = BUD.by_department[budYear] || {};
  const rows = [];
  ['operating', 'capital'].forEach(k => (BD[k] || []).forEach(d => d.units.forEach(u => rows.push([k === 'operating' ? 'Operating' : 'Capital', d.name, u.name, u.value]))));
  saveList(e.currentTarget, `City of Calgary budget ${budYear}`, ['Budget', 'Department', 'Service (business unit)', 'Millions of dollars'], rows);
});
window.renderBudget = renderBudget;

// ================================================================ LIVE CONNECTION TESTS
let LIVE = null, liveRunning = 0;
async function renderLive() {
  if (!LIVE) {
    try { LIVE = (await (await api()).live_sources()).map(s => ({ ...s, res: null })); } catch (e) { LIVE = []; }
  }
  const pill = r => !r ? '<span class="live-pill idle">Not tested</span>' : r.testing ? '<span class="live-pill run">Testing…</span>'
    : r.ok ? '<span class="live-pill ok">Live</span>' : '<span class="live-pill bad">No answer</span>';
  $('#live-table tbody').innerHTML = LIVE.map((s, i) => { const r = s.res;
    return `<tr><td>${esc(s.name)}${s.target ? `<small class="mono"> ${esc(s.target)}</small>` : ''}</td><td>${esc(s.publisher)}</td><td>${pill(r)}</td>
      <td class="num">${r && isNum(r.ms) ? fmt(r.ms) + ' ms' : ''}</td><td>${r && r.updated ? esc(r.updated) : ''}</td><td class="wrap live-detail">${r && r.detail ? esc(r.detail) : ''}</td>
      <td><button type="button" class="btn small" data-live="${i}" ${r && r.testing ? 'disabled' : ''}>Test</button></td></tr>`; }).join('');
  const done = LIVE.filter(s => s.res && !s.res.testing), ok = done.filter(s => s.res.ok).length;
  $('#live-sum').textContent = done.length ? `${ok} of ${done.length} tested answered live` : `${LIVE.length} sources`;
}
async function testLive(i) {
  const s = LIVE[i];
  s.res = { testing: true }; renderLive();
  try { s.res = await (await api()).test_source(s.key); } catch (e) { s.res = { ok: false, detail: String(e.message || e) }; }
  renderLive();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-live]');
  if (b) testLive(+b.dataset.live);
});
$('#live-all').addEventListener('click', async () => {
  if (liveRunning || !LIVE) return;
  liveRunning = 1;
  const queue = LIVE.map((_, i) => i);
  const worker = async () => { while (queue.length) await testLive(queue.shift()); };
  await Promise.all([worker(), worker(), worker(), worker()]);     // four at a time
  liveRunning = 0;
});
window.renderLive = renderLive;

;
// ---- elections.js
/* Calgary Insight: Elections. Who represents the area picked at each level, and the latest official results:
   municipal 2025 (Elections Calgary), provincial 2023 with by-elections since and the 2026 referendum (Elections
   Alberta), federal 2025 (Elections Canada). Results are shown as published: candidates by votes, no ranking,
   no colours by party. elections.py builds the figures; methods.py (topic "elections") explains them. */
'use strict';

let EL = null, elRefQ = 10;
const elPct = (v, d = 1) => isNum(v) ? `${fmt(v * 100, d)}%` : '–';
const elDay = v => (typeof dmy === 'function' ? dmy(v) : v) || '';

async function loadElections() {
  if (EL) return EL;
  try {
    const res = await (await api()).get_elections();
    if (res && res.ok && res.data) EL = res.data;
  } catch (e) { /* shown below */ }
  return EL;
}

// one person: the elected candidate (and the member sitting today, when different)
function elPerson(r, role) {
  if (!r || !r.elected) return '';
  const e = r.elected, m = r.member;
  const today = m && r.changed ? `<div class="el-now">${icon('alert')}<span>Sitting today: <b>${esc(m.name)}</b>${m.caucus ? ` (${esc(m.caucus)})` : ''}</span></div>` : '';
  const shown = m && !r.changed ? m.name : e.name;
  const party = (m && !r.changed && m.caucus) || e.party;
  return `<div class="el-person"><div class="el-role">${esc(role)}</div><div class="el-name">${esc(shown)}</div>
    <div class="el-meta">${party ? esc(party) + ' · ' : ''}${r.acclaimed ? 'elected by acclamation (the only candidate)' : `${elPct(e.share)} of the vote${isNum(r.margin_share) ? `, ahead by ${elPct(r.margin_share)}` : ''}${isNum(r.turnout) ? ` · turnout ${elPct(r.turnout)}` : ''}`}</div>${today}</div>`;
}

function elRidings(level, title, note) {
  const L = (D && D.elections || {})[level];
  if (!L || !(L.ridings || []).length) return '';
  if (isCity()) {                       // all of Calgary: the members by party, the full list is in the tables below
    const by = {};
    L.ridings.forEach(x => { const p = (x.member && !x.changed ? x.member.caucus : null) || (x.elected || {}).party || 'Other'; by[p] = (by[p] || 0) + 1; });
    return `<div class="el-level"><h3>${esc(title)}</h3><div class="el-name">${L.ridings.length} ${level === 'provincial' ? 'MLAs' : 'MPs'}</div>
      <div class="el-meta">${Object.entries(by).sort((a, b) => b[1] - a[1]).map(([p, n]) => `${esc(p)} ${n}`).join(' · ')}</div>
      <p class="card-note">${note} Every ${level === 'provincial' ? 'division' : 'district'} is listed below.</p></div>`;
  }
  const many = L.ridings.length > 1;
  return `<div class="el-level"><h3>${esc(title)}</h3>${L.ridings.map(x => `<div class="el-riding">${elPerson(x, x.riding)}
      ${many ? `<div class="el-share">${elPct(x.share, 0)} of ${esc(W())}'s residents</div>` : ''}
      ${x.by_election ? `<div class="el-share">Latest: by-election, ${esc(elDay(x.last_election))}</div>` : ''}</div>`).join('')}
    <p class="card-note">${note}</p></div>`;
}

function elWho() {
  const E = D && D.elections;
  if (!E) return '<p class="card-note">The election figures are not in this copy of the data yet.</p>';
  const m = E.municipal || {};
  const city = isCity();
  const muni = `<div class="el-level"><h3>City of Calgary (2025)</h3>${elPerson(m.mayor, 'Mayor')}
    ${city ? '' : elPerson(m.councillor, `Councillor, ${W()}`)}
    ${city ? '' : elPerson(m.public_trustee, `Public school trustee (CBE), ${(m.public_trustee || {}).title || ''}`)}
    ${city ? '' : elPerson(m.separate_trustee, `Separate school trustee (CCSD), ${(m.separate_trustee || {}).title || ''}`)}
    <p class="card-note">${m.turnout ? `Calgary's turnout: ${elPct(m.turnout.share, 2)} (${fmt(m.turnout.voters)} voters of ${fmt(m.turnout.electors)} electors). ` : ''}Elections Calgary does not publish turnout by ward.</p></div>`;
  const prov = elRidings('provincial', city ? 'Alberta: Calgary\'s MLAs' : 'Alberta: MLA', `Provincial divisions on the 2019 boundaries. Next provincial general election: ${esc(elDay((E.provincial || {}).next_election))}.`);
  const fed = elRidings('federal', city ? 'Canada: Calgary\'s MPs' : 'Canada: MP', 'Federal electoral districts from the 2023 representation order, first used on 28 April 2025.');
  return `<div class="el-who">${muni}${prov}${fed}</div>
    <p class="card-note">${city ? '' : `A ward and an electoral division or district have different borders: where ${esc(W())} is split between them, each share is of its residents (communities placed by area). `}Shares are of valid votes; "ahead by" is the gap to the second candidate.</p>`;
}

function elRaceTable(race, caption) {
  if (!race) return '';
  return `<table class="data el-race"><caption class="sr-only">${esc(caption)}</caption><thead><tr><th scope="col">Candidate</th><th scope="col">Party</th><th scope="col" class="num">Votes</th><th scope="col" class="num">Share</th></tr></thead><tbody>
    ${race.candidates.map(c => `<tr${c.elected ? ' class="el-win"' : ''}><td>${esc(c.name)}${c.elected ? ` <span class="ac-tag ac-ok">${race.acclaimed ? 'Acclaimed' : 'Elected'}</span>` : ''}${c.incumbent ? ' <small>(incumbent)</small>' : ''}</td><td>${esc(c.party || '–')}</td><td class="num">${race.acclaimed ? '–' : fmt(c.votes)}</td><td class="num">${race.acclaimed ? '–' : elPct(c.share)}</td></tr>`).join('')}
  </tbody></table>`;
}

function elMunicipal() {
  const M = EL && EL.municipal;
  if (!M) return '<p class="card-note">The municipal results could not be read.</p>';
  const ward = isCity() ? 0 : SCOPE;
  const mb = (M.mayor_by_ward || {}).by_ward || {};
  const top = (M.mayor || {}).candidates ? M.mayor.candidates.slice(0, 4).map(c => c.name) : [];
  const byWard = `<div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Ward</th>${top.map(n => `<th scope="col" class="num">${esc(n)}</th>`).join('')}<th scope="col" class="num">Election-day votes</th></tr></thead><tbody>
    ${Object.keys(mb).sort((a, b) => a - b).map(w => { const r = mb[w], by = {}; r.candidates.forEach(c => { by[c.name] = c; });
      return `<tr${+w === ward ? ' class="el-here"' : ''}><th scope="row">Ward ${w}</th>${top.map(n => `<td class="num">${elPct((by[n] || {}).share)}</td>`).join('')}<td class="num">${fmt(r.total)}</td></tr>`; }).join('')}
  </tbody></table></div><p class="card-note">Election-day votes only: ${fmt((M.mayor_by_ward || {}).advance_total)} advance votes were cast at stations open to voters from any ward, so they count for Calgary but cannot be placed in a ward. Shares of each ward's election-day votes.</p>`;
  const wards = Object.keys(M.councillors || {}).sort((a, b) => a - b);
  const council = `<div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Ward</th><th scope="col">Elected</th><th scope="col" class="num">Share</th><th scope="col">Second</th><th scope="col" class="num">Share</th><th scope="col" class="num">Votes cast</th><th scope="col" class="num">Candidates</th></tr></thead><tbody>
    ${wards.map(w => { const r = M.councillors[w], a = r.candidates[0] || {}, b = r.candidates[1] || {};
      return `<tr${+w === ward ? ' class="el-here"' : ''}><th scope="row">Ward ${w}</th><td>${esc(a.name || '')}</td><td class="num">${elPct(a.share)}</td><td>${esc(b.name || '–')}</td><td class="num">${elPct(b.share)}</td><td class="num">${fmt(r.total)}</td><td class="num">${r.candidates.length}</td></tr>`; }).join('')}
  </tbody></table></div>`;
  const tr = (list, label) => `<div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">${esc(label)}</th><th scope="col">Elected</th><th scope="col" class="num">Share</th><th scope="col" class="num">Votes cast</th></tr></thead><tbody>
    ${(list || []).map(r => { const a = r.candidates[0] || {}; return `<tr${(r.wards || []).includes(ward) ? ' class="el-here"' : ''}><th scope="row">${esc(r.title)}</th><td>${esc(a.name || '')}${r.acclaimed ? ' <span class="ac-tag ac-ok">Acclaimed</span>' : ''}</td><td class="num">${r.acclaimed ? '–' : elPct(a.share)}</td><td class="num">${r.acclaimed ? '–' : fmt(r.total)}</td></tr>`; }).join('')}
  </tbody></table></div>`;
  const myRace = ward && M.councillors[String(ward)];
  return `<p class="card-sub">20 October 2025. Calgary's turnout ${M.turnout ? `${elPct(M.turnout.share, 2)}: ${fmt(M.turnout.voters)} voters of ${fmt(M.turnout.electors)} electors on the Permanent Electors Register` : 'not read'}. Official results, corrected after the 27 October 2025 mayoral recount.</p>
    <h3 class="ac-h4">Mayor</h3>${elRaceTable(M.mayor, 'Mayor')}
    <h3 class="ac-h4">Mayor, by ward</h3>${byWard}
    ${myRace ? `<h3 class="ac-h4">Councillor, ${esc(W())}</h3>${elRaceTable(myRace, 'Councillor')}` : ''}
    <h3 class="ac-h4">Councillors, every ward</h3>${council}
    <h3 class="ac-h4">Public school board trustees (CBE)</h3>${tr(M.public_trustees, 'Wards')}
    <h3 class="ac-h4">Separate school board trustees (CCSD)</h3>${tr(M.separate_trustees, 'Wards')}`;
}

function elMine(level) {
  return new Set((((D && D.elections) || {})[level] || {}).ridings ? D.elections[level].ridings.map(r => r.riding) : []);
}

function elProvincial() {
  const P = EL && EL.provincial;
  if (!P) return '<p class="card-note">The provincial results could not be read.</p>';
  const mine = isCity() ? new Set() : elMine('provincial');
  const eds = Object.values(P.general || {}).sort((a, b) => a.name.localeCompare(b.name));
  const seats = {};
  eds.forEach(r => { const p = (r.candidates[0] || {}).party || 'Other'; seats[p] = (seats[p] || 0) + 1; });
  const byes = {};
  (P.byelections || []).forEach(b => { byes[b.ed] = b; });
  const rows = eds.map(r => { const a = r.candidates[0] || {}, b = r.candidates[1] || {}, m = (P.members || {})[r.name], bye = byes[r.name];
    const now = m && m.name && a.name && m.name.split(' ').pop() !== a.name.split(' ').pop() ? `${esc(m.name)} (${esc(m.caucus || '')})${bye ? `, by-election ${esc(elDay(bye.date))}` : ''}` : 'same';
    return `<tr${mine.has(r.name) ? ' class="el-here"' : ''}><th scope="row">${esc(r.name)}</th><td>${esc(a.name || '')}</td><td>${esc(a.party || '')}</td><td class="num">${elPct(a.share)}</td><td class="num">${elPct(r.margin_share)}</td><td class="num">${elPct(r.turnout)}</td><td>${now}</td></tr>`; }).join('');
  const byeHtml = (P.byelections || []).filter(b => b.race).map(b => `<h3 class="ac-h4">By-election, ${esc(b.ed)}, ${esc(elDay(b.date))}</h3>${elRaceTable(b.race, b.ed)}<p class="card-note">${fmt(b.race.electors)} electors; turnout ${elPct(b.race.turnout)}. <a href="${esc(b.url)}" target="_blank" rel="noopener">Elections Alberta official results</a>.</p>`).join('');
  return `<p class="card-sub">2023 general election, 29 May 2023: Calgary's ${eds.length} electoral divisions (2019 boundaries). Elected in Calgary: ${Object.entries(seats).sort((a, b) => b[1] - a[1]).map(([p, n]) => `${esc(p)} ${n}`).join(', ')}.</p>
    <div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Division</th><th scope="col">Elected in 2023</th><th scope="col">Party</th><th scope="col" class="num">Share</th><th scope="col" class="num">Ahead by</th><th scope="col" class="num">Turnout</th><th scope="col">Member today, if different</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${byeHtml}
    <p class="card-note">The next provincial general election is scheduled for ${esc(elDay(P.next_election))}. Alberta's electoral boundaries are being redrawn for it; the divisions here are those of the 2023 election. Members today: Legislative Assembly of Alberta.</p>
    ${elReferendum(P)}`;
}

function elReferendum(P) {
  const R = P.referendum;
  if (!R || !(R.questions || []).length) return '';
  const q = R.questions.find(x => x.number === elRefQ) || R.questions[R.questions.length - 1];
  const mine = isCity() ? new Set() : elMine('provincial');
  const opts = q.options.map(o => o.replace(/^Option \d+ - /, ''));
  const short = q.option_columns;
  const rows = Object.entries(q.by_ed).sort((a, b) => a[0].localeCompare(b[0])).map(([ed, v]) => `<tr${mine.has(ed) ? ' class="el-here"' : ''}><th scope="row">${esc(ed)}</th>${v.shares.map(s => `<td class="num">${elPct(s)}</td>`).join('')}<td class="num">${elPct(v.turnout)}</td></tr>`).join('');
  return `<h3 class="ac-h4" id="el-ref">Provincial referendum, ${esc(elDay(R.date))}</h3>
    <label class="el-q"><span>Question</span><select id="el-refq">${R.questions.map(x => `<option value="${x.number}" ${x.number === q.number ? 'selected' : ''}>Question ${x.number}</option>`).join('')}</select></label>
    <p class="el-question">${esc(q.question || '')}</p>
    <ul class="el-opts">${opts.map((o, i) => `<li><b>${esc(short[i] || '')}</b>: ${esc(o)}</li>`).join('')}</ul>
    <div class="el-ref-sum"><div><span class="el-role">Calgary's ${q.calgary.divisions} divisions</span>${q.calgary.shares.map((s, i) => `<div>${esc(short[i])}: <b>${elPct(s)}</b> (${fmt(q.calgary.votes[i])})</div>`).join('')}</div>
      ${q.alberta ? `<div><span class="el-role">All of Alberta</span>${q.alberta.shares.map((s, i) => `<div>${esc(short[i])}: <b>${elPct(s)}</b> (${fmt(q.alberta.votes[i])})</div>`).join('')}<div>Turnout ${elPct(q.alberta.turnout)}</div></div>` : ''}</div>
    <div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Division</th>${short.map(s => `<th scope="col" class="num">${esc(s)}</th>`).join('')}<th scope="col" class="num">Turnout</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="card-note">Official results by electoral division, Elections Alberta. <a href="${esc(q.url)}" target="_blank" rel="noopener">Question ${q.number} at Elections Alberta</a>.</p>`;
}

function elFederal() {
  const F = EL && EL.federal;
  if (!F) return '<p class="card-note">The federal results could not be read.</p>';
  const mine = isCity() ? new Set() : elMine('federal');
  const eds = Object.values(F.general || {}).sort((a, b) => a.name.localeCompare(b.name));
  const rows = eds.map(r => { const a = r.candidates[0] || {}, m = (F.members || {})[r.name];
    const now = m && a.name && m.name.split(' ').pop() !== a.name.split(' ').pop() ? `${esc(m.name)} (${esc(m.caucus || '')})` : 'same';
    return `<tr${mine.has(r.name) ? ' class="el-here"' : ''}><th scope="row">${esc(r.name)}</th><td>${esc(a.name || '')}</td><td>${esc(a.party || '')}</td><td class="num">${elPct(a.share)}</td><td class="num">${elPct(r.margin_share)}</td><td class="num">${fmt(r.electors)}</td><td class="num">${elPct(r.turnout)}</td><td>${now}</td></tr>`; }).join('');
  return `<p class="card-sub">45th general election, 28 April 2025: Calgary's ${eds.length} federal electoral districts.</p>
    <div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">District</th><th scope="col">Elected</th><th scope="col">Party</th><th scope="col" class="num">Share</th><th scope="col" class="num">Ahead by</th><th scope="col" class="num">Electors</th><th scope="col" class="num">Turnout</th><th scope="col">Member today, if different</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="card-note">Elections Canada official voting results; members today from the House of Commons.</p>`;
}

// ================================================================ ELECTION DATA CENTRE
let elSub = 'room';
const EL_SUBS = [['room', 'Overview'], ['leaders', 'Know your leaders'], ['area', 'Know your constituency'], ['analytics', 'Election Analytics'], ['civic', 'Civic Accountability'], ['results', 'Full results']];
// election days: Alberta's (Election Act s. 38.1, Elections Alberta), municipal (Government of Alberta: 15 October 2029)
// and federal (Canada Elections Act s. 56.1: 15 October 2029, unless an election is called earlier)
const EL_NEXT = [['Alberta general election', '2027-10-18', 'Fixed date in law'], ['Calgary municipal election', '2029-10-15', 'Alberta\'s next municipal general election'],
  ['Federal general election', '2029-10-15', 'Fixed date in law, unless called earlier']];
const EL_PALETTE = ['#0369A1', '#B45309', '#047857', '#7C3AED', '#BE123C', '#0F766E', '#4D7C0F', '#64748B'];
// one colour per party name across every chart on the page (assigned in order of first use; not party colours)
const EL_COLOR = {};
const elColor = label => { if (!EL_COLOR[label]) EL_COLOR[label] = EL_PALETTE[Object.keys(EL_COLOR).length % EL_PALETTE.length]; return EL_COLOR[label]; };
const elDays = d => Math.round((new Date(d + 'T12:00:00') - new Date()) / 86400000);
// live countdowns: to the start of election day, Calgary time (October is daylight time, UTC-6)
const elStart = d => new Date(d + 'T00:00:00-06:00');
const EL_SHORT = { 'Alberta general election': 'Provincial', 'Calgary municipal election': 'Municipal', 'Federal general election': 'Federal' };
function elCountdown(d, big) {
  return `<div class="el-cd${big ? ' el-cd-big' : ''}" data-el-cd="${esc(d)}" role="timer" aria-label="Time until ${esc(elDay(d))}">${['days', 'hrs', 'min', 'sec'].map(u => `<span class="el-cd-u"><b>–</b><i>${u}</i></span>`).join('')}</div>`;
}
function elTick() {
  const now = Date.now();
  document.querySelectorAll('[data-el-cd]').forEach(n => {
    let t = Math.max(0, Math.floor((elStart(n.dataset.elCd) - now) / 1000));
    const v = [Math.floor(t / 86400), Math.floor(t % 86400 / 3600), Math.floor(t % 3600 / 60), t % 60];
    n.querySelectorAll('b').forEach((b, i) => { const x = i ? String(v[i]).padStart(2, '0') : fmt(v[0]); if (b.textContent !== x) b.textContent = x; });
  });
}
setInterval(elTick, 1000);

// a half-circle seat chart: seats in rows, filled left to right by group (largest first)
function elHemicycle(groups, title, sub) {
  const total = groups.reduce((a, g) => a + g.n, 0);
  if (!total) return '';
  const rows = total > 200 ? 9 : total > 60 ? 6 : total > 30 ? 4 : total > 12 ? 2 : 1, R = 150, r0 = rows === 1 ? 150 : rows === 2 ? 105 : 55;
  const radii = Array.from({ length: rows }, (_, i) => r0 + (R - r0) * (rows === 1 ? 1 : i / (rows - 1)));
  const lens = radii.reduce((a, r) => a + r, 0);
  let counts = radii.map(r => Math.floor(total * r / lens));
  for (let k = 0; counts.reduce((a, c) => a + c, 0) < total; k++) counts[rows - 1 - (k % rows)]++;
  const pts = [];
  radii.forEach((r, i) => { const n = counts[i]; for (let j = 0; j < n; j++) { const t = Math.PI * (n === 1 ? 0.5 : j / (n - 1)); pts.push({ x: 170 - r * Math.cos(t), y: 165 - r * Math.sin(t), a: t }); } });
  pts.sort((p, q) => p.a - q.a);
  const arc = Math.PI * R / Math.max(counts[rows - 1] - 1, 1), gap = rows > 1 ? (R - r0) / (rows - 1) : arc;
  const size = Math.max(2.5, Math.min(13, 0.44 * Math.min(arc, gap)));
  let k = 0;
  const dots = [];
  groups.forEach((g, gi) => { for (let j = 0; j < g.n; j++, k++) { const p = pts[k]; if (p) dots.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${size}" fill="${g.color || elColor(g.label)}"><title>${esc(g.label)}</title></circle>`); } });
  return `<div class="el-hemi"><h3>${esc(title)}</h3><svg viewBox="0 0 340 182" role="img" aria-label="${esc(title)}: ${groups.map(g => `${g.label} ${g.n}`).join(', ')}">${dots.join('')}<text x="170" y="160" text-anchor="middle" class="el-hemi-n">${total}</text></svg>
    <ul class="el-legend">${groups.map((g, gi) => `<li><span style="background:${g.color || elColor(g.label)}"></span>${esc(g.label)} <b>${g.n}</b></li>`).join('')}</ul>${sub ? `<p class="card-note">${sub}</p>` : ''}</div>`;
}
const elGroups = by => Object.entries(by).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).map(([label, n]) => ({ label, n }));

function elCouncilSeats() {
  const M = EL.municipal || {};
  const by = {};
  const add = p => { const k = p || 'Independent'; by[k] = (by[k] || 0) + 1; };
  if (M.mayor) add((M.mayor.candidates[0] || {}).party);
  Object.values(M.councillors || {}).forEach(r => add((r.candidates[0] || {}).party));
  return elGroups(by);
}
function elCalgarySeats(level) {
  const L = EL[level] || {}, by = {};
  Object.keys(L.general || {}).forEach(n => { const m = (L.members || {})[n]; const k = (m && m.caucus) || ((L.general[n].candidates || [])[0] || {}).party || 'Other'; by[k] = (by[k] || 0) + 1; });
  return elGroups(by);
}

// insights: facts worked out from the results, the same way for every race (no ranking of people or parties)
function elInsights() {
  const out = [], M = EL.municipal || {}, P = EL.provincial || {}, F = EL.federal || {};
  if (M.mayor) { const [a, b] = M.mayor.candidates; out.push(`<b>Mayor:</b> ${esc(a.name)} won with ${elPct(a.share)} of the vote, ${fmt(M.mayor.margin)} votes ahead of ${esc(b.name)} (${elPct(b.share)}), after the 27 October 2025 recount. ${M.mayor.candidates.length} candidates ran.`); }
  const cw = Object.entries(M.councillors || {});
  if (cw.length) {
    const close = cw.slice().sort((x, y) => x[1].margin_share - y[1].margin_share)[0];
    const plural = cw.filter(([, r]) => (r.candidates[0] || {}).share < 0.4).map(([w]) => +w).sort((a, b) => a - b);
    const kept = cw.filter(([, r]) => r.candidates.some(c => c.incumbent && c.elected)).length;
    const lost = cw.filter(([, r]) => r.candidates.some(c => c.incumbent && !c.elected)).length;
    out.push(`<b>Council:</b> the closest ward race was Ward ${close[0]} (${elPct(close[1].margin_share)} between the first two). ${plural.length} of 14 councillors won with under 40% of the vote (Wards ${plural.join(', ')}). ${kept} sitting councillors were re-elected, ${lost} ran and were not, and ${14 - kept - lost} wards were open seats.`);
  }
  const ce = EL.constituency_wards;
  if (ce) {
    const ws = Object.entries(ce).filter(([, v]) => isNum(v.turnout_est)).sort((a, b) => b[1].turnout_est - a[1].turnout_est);
    if (ws.length) out.push(`<b>Turnout by ward (estimate):</b> highest in Ward ${ws[0][0]} (${elPct(ws[0][1].turnout_est, 0)}), lowest in Ward ${ws[ws.length - 1][0]} (${elPct(ws[ws.length - 1][1].turnout_est, 0)}); Calgary ${elPct((M.turnout || {}).share, 1)}.`);
  }
  const pg = Object.values(P.general || {});
  if (pg.length) {
    const c = pg.slice().sort((a, b) => a.margin_share - b.margin_share).slice(0, 3);
    const t = pg.slice().sort((a, b) => b.turnout - a.turnout);
    out.push(`<b>Alberta 2023:</b> the closest Calgary divisions were ${c.map(r => `${esc(r.name)} (${elPct(r.margin_share)})`).join(', ')}. Turnout ran from ${elPct(t[t.length - 1].turnout, 0)} (${esc(t[t.length - 1].name)}) to ${elPct(t[0].turnout, 0)} (${esc(t[0].name)}).`);
  }
  (P.byelections || []).filter(b => b.race).forEach(b => { const w = b.race.candidates[0]; const g = (P.general || {})[b.ed]; const g0 = g && g.candidates[0];
    out.push(`<b>Since 2023:</b> ${esc(b.ed)} by-election on ${esc(elDay(b.date))}: ${esc(w.name)} (${esc(w.party || '')}) elected with ${elPct(w.share)} on a turnout of ${elPct(b.race.turnout)}${g0 && g0.party !== w.party ? `; the seat was won by ${esc(g0.party)} in 2023` : ''}.`); });
  const fg = Object.values(F.general || {});
  if (fg.length) {
    const c = fg.slice().sort((a, b) => a.margin_share - b.margin_share)[0];
    const t = fg.slice().sort((a, b) => b.turnout - a.turnout);
    out.push(`<b>Canada 2025:</b> the closest Calgary district was ${esc(c.name)} (${elPct(c.margin_share)}). Turnout ran from ${elPct(t[t.length - 1].turnout, 0)} (${esc(t[t.length - 1].name)}) to ${elPct(t[0].turnout, 0)} (${esc(t[0].name)}).`);
  }
  const q = (((P.referendum || {}).questions) || []).find(x => x.number === 10);
  if (q && q.alberta) out.push(`<b>Referendum, 19 October 2026 (question 10):</b> Calgary's divisions ${q.option_columns.map((o, i) => `${esc(o)} ${elPct(q.calgary.shares[i])}`).join(', ')}; all of Alberta ${q.option_columns.map((o, i) => `${esc(o)} ${elPct(q.alberta.shares[i])}`).join(', ')}.`);
  return `<ul class="el-insights">${out.map(x => `<li>${x}</li>`).join('')}</ul>`;
}

function elSplitTable() {
  const S = (D && D.elections || {}).ward_splits;
  if (!S) return '';
  const cell = list => (list || []).map(x => `${esc(x.riding)} <b>${elPct(x.share, 0)}</b>`).join('<br>');
  return `<div class="table-wrap ac-full"><table class="data el-split"><thead><tr><th scope="col">Ward</th><th scope="col">Provincial electoral divisions (MLAs)</th><th scope="col">Federal electoral districts (MPs)</th></tr></thead><tbody>
    ${Object.keys(S).sort((a, b) => a - b).map(w => `<tr${!isCity() && +w === SCOPE ? ' class="el-here"' : ''}><th scope="row">Ward ${w}</th><td>${cell(S[w].provincial)}</td><td>${cell(S[w].federal)}</td></tr>`).join('')}
  </tbody></table></div><p class="card-note">Shares of each ward's residents (the count chosen in Settings). Wards and electoral areas have different borders; communities split by a boundary are split by area.</p>`;
}

// the ward map: 14 wards shaded by a figure per ward, labelled, the ward picked outlined
function elWardMap(values, label, fmtv) {
  const G = (D && D.geo && D.geo.wards) || {};
  const keys = Object.keys(G);
  if (!keys.length) return '';
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  const k = Math.cos(51.05 * Math.PI / 180);
  keys.forEach(w => (G[w].coordinates || []).forEach(poly => poly[0].forEach(([lo, la]) => { x0 = Math.min(x0, lo * k); x1 = Math.max(x1, lo * k); y0 = Math.min(y0, la); y1 = Math.max(y1, la); })));
  const Wd = 520, Ht = Wd * (y1 - y0) / (x1 - x0), sc = Wd / (x1 - x0);
  const P = ([lo, la]) => `${((lo * k - x0) * sc).toFixed(1)},${((y1 - la) * sc).toFixed(1)}`;
  const vals = keys.map(w => values[w]).filter(isNum), lo = Math.min(...vals), hi = Math.max(...vals);
  const shade = v => { if (!isNum(v)) return '#1E293B'; const t = hi > lo ? (v - lo) / (hi - lo) : 0.5; return `hsl(199, ${55 + t * 35}%, ${22 + t * 38}%)`; };
  const paths = keys.map(w => { const d = (G[w].coordinates || []).map(poly => poly.map(r => 'M' + r.map(P).join('L') + 'Z').join('')).join('');
    // label at the area centroid of the ward's largest ring
    let best = null, bestA = 0;
    (G[w].coordinates || []).forEach(poly => { const r = poly[0]; let A2 = 0, cx = 0, cy = 0;
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const f = r[j][0] * r[i][1] - r[i][0] * r[j][1]; A2 += f; cx += (r[j][0] + r[i][0]) * f; cy += (r[j][1] + r[i][1]) * f; }
      if (Math.abs(A2) > bestA) { bestA = Math.abs(A2); best = [cx / (3 * A2), cy / (3 * A2)]; } });
    const c = P(best || (G[w].coordinates || [])[0][0][0]).split(',');
    const on = !isCity() && +w === SCOPE;
    return `<g><path d="${d}" fill="${shade(values[w])}" stroke="${on ? '#FBBF24' : '#0B1220'}" stroke-width="${on ? 3 : 1.2}"><title>Ward ${w}: ${fmtv(values[w])}</title></path><text x="${c[0]}" y="${c[1]}" class="el-map-w">${w}</text><text x="${c[0]}" y="${+c[1] + 14}" class="el-map-v">${fmtv(values[w])}</text></g>`; }).join('');
  return `<svg class="el-map" viewBox="0 0 ${Wd} ${Ht.toFixed(0)}" role="img" aria-label="${esc(label)} by ward">${paths}</svg>
    <div class="el-map-key"><span>${esc(fmtv(lo))}</span><i></i><span>${esc(fmtv(hi))}</span> <b>${esc(label)}</b></div>`;
}

// every race at every level in Calgary, closest first
function elBattle() {
  const out = [], M = EL.municipal || {}, P = EL.provincial || {}, F = EL.federal || {};
  if (M.mayor) out.push(['City', 'Mayor', M.mayor]);
  Object.entries(M.councillors || {}).forEach(([w, r]) => out.push(['City', `Councillor, Ward ${w}`, r]));
  Object.values(P.general || {}).forEach(r => out.push(['Alberta 2023', r.name, r]));
  (P.byelections || []).filter(b => b.race).forEach(b => out.push([`Alberta ${b.date ? b.date.slice(0, 4) : ''} by-election`, b.ed, b.race]));
  Object.values(F.general || {}).forEach(r => out.push(['Canada 2025', r.name, r]));
  return out.filter(x => isNum(x[2].margin_share)).sort((a, b) => a[2].margin_share - b[2].margin_share);
}

function elRoom() {
  const M = EL.municipal || {}, P = EL.provincial || {}, F = EL.federal || {};
  const A = P.chamber, C = F.chamber, CW = EL.constituency_wards || {};
  const cal = elCouncilSeats(), mla = elCalgarySeats('provincial'), mp = elCalgarySeats('federal');
  const split = gs => { const t = gs.reduce((a, g) => a + g.n, 0); return `<div class="el-bar">${gs.map(g => `<span style="width:${g.n / t * 100}%;background:${elColor(g.label)}" title="${esc(g.label)} ${g.n}"></span>`).join('')}</div><div class="el-hero-sub">${gs.map(g => `${esc(g.label)} ${g.n}`).join(' · ')}</div>`; };
  const battle = elBattle(), closest = battle[0];
  const hero = `<section class="el-cr span-12">
    <div class="el-cr-top"><div><div class="el-cr-kicker">Calgary Insight</div><h2 class="el-cr-title">Election Data Centre</h2><div class="el-cr-sub">${esc(W())} · official results and the members sitting today · read ${esc(elDay(EL.built_at))}</div></div>
      <div class="el-cr-counts">${EL_NEXT.map(([t, d]) => `<div class="el-cr-count"><div class="el-cr-kicker">${esc(EL_SHORT[t] || t)} · ${esc(elDay(d))}</div>${elCountdown(d, true)}</div>`).join('')}</div></div>
    <div class="el-cr-kpis">
      <div class="el-kpi"><div class="el-kpi-l">City Council</div><div class="el-kpi-n">15</div>${split(cal)}</div>
      <div class="el-kpi"><div class="el-kpi-l">Calgary's MLAs</div><div class="el-kpi-n">26</div>${split(mla)}</div>
      <div class="el-kpi"><div class="el-kpi-l">Calgary's MPs</div><div class="el-kpi-n">11</div>${split(mp)}</div>
      <div class="el-kpi"><div class="el-kpi-l">Municipal turnout 2025</div><div class="el-kpi-n">${elPct((M.turnout || {}).share, 1)}</div><div class="el-hero-sub">${fmt((M.turnout || {}).voters)} of ${fmt((M.turnout || {}).electors)} electors</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Closest race in Calgary</div><div class="el-kpi-n">${closest ? elPct(closest[2].margin_share) : '–'}</div><div class="el-hero-sub">${closest ? `${esc(closest[1])} (${esc(closest[0])})` : ''}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Mayor's winning share</div><div class="el-kpi-n">${elPct(((M.mayor || {}).candidates || [{}])[0].share)}</div><div class="el-hero-sub">${fmt((M.mayor || {}).margin)} votes ahead, ${((M.mayor || {}).candidates || []).length} candidates</div></div>
    </div></section>`;
  const turnMap = elWardMap(Object.fromEntries(Object.entries(CW).map(([w, v]) => [w, v.turnout_est])), 'Estimated turnout, 2025 municipal election', v => elPct(v, 0));
  const tw = Object.entries(CW).sort((a, b) => (b[1].turnout_est || 0) - (a[1].turnout_est || 0));
  const tmax = Math.max(...tw.map(x => x[1].turnout_est || 0), 0.01);
  const bars = `<div class="el-hbars">${tw.map(([w, v]) => `<div class="el-hbar${!isCity() && +w === SCOPE ? ' is-on' : ''}"><span class="el-hbar-l">Ward ${w}</span><span class="el-hbar-t"><i style="width:${(v.turnout_est || 0) / tmax * 100}%"></i></span><span class="el-hbar-v">${elPct(v.turnout_est, 0)}</span></div>`).join('')}
    <div class="el-hbar el-hbar-cal"><span class="el-hbar-l">Calgary</span><span class="el-hbar-t"><i style="width:${((M.turnout || {}).share || 0) / tmax * 100}%"></i></span><span class="el-hbar-v">${elPct((M.turnout || {}).share, 0)}</span></div></div>`;
  const bt = `<div class="table-wrap ac-full"><table class="data el-battle"><thead><tr><th scope="col">Seat</th><th scope="col">Level</th><th scope="col">Elected</th><th scope="col">Second</th><th scope="col" class="num">Ahead by</th><th scope="col">Margin</th></tr></thead><tbody>
    ${battle.slice(0, 12).map(([lvl, seat, r]) => { const a = r.candidates[0] || {}, b2 = r.candidates[1] || {}; return `<tr><th scope="row">${esc(seat)}</th><td>${esc(lvl)}</td><td>${esc(a.name || '')}${a.party ? ` <small>(${esc(a.party)})</small>` : ''}</td><td>${esc(b2.name || '')}${b2.party ? ` <small>(${esc(b2.party)})</small>` : ''}</td><td class="num">${elPct(r.margin_share)}${isNum(r.margin) ? `<br><small>${fmt(r.margin)} votes</small>` : ''}</td><td class="el-mbar"><i style="width:${Math.max(r.margin_share / ((battle[11] || battle[battle.length - 1])[2].margin_share || 1), 0.03) * 100}%"></i></td></tr>`; }).join('')}
  </tbody></table></div><p class="card-note">The 12 closest of ${battle.length} races at every level in Calgary: the gap between the first two candidates, as a share of the votes cast.</p>`;
  const seats = `<div class="el-seats el-seats-big">
    ${elHemicycle(cal, 'Calgary City Council', 'Mayor and 14 councillors, 2025, by local political party.')}
    ${elHemicycle(mla, "Calgary's 26 MLAs", 'Members sitting today.')}
    ${elHemicycle(mp, "Calgary's 11 MPs", 'Members sitting today.')}</div>`;
  const big = [];
  if (A) big.push(elHemicycle(elGroups(A.by_caucus).concat(A.vacant ? [{ label: 'Vacant', n: A.vacant, color: '#CBD5E1' }] : []), `Legislative Assembly of Alberta, ${A.seats} seats`, `Calgary holds 26 of the ${A.seats} seats.`));
  if (C) big.push(elHemicycle(elGroups(C.by_caucus).concat(C.vacant ? [{ label: 'Vacant', n: C.vacant, color: '#CBD5E1' }] : []), `House of Commons, ${C.seats} seats`, `Calgary holds 11 of the ${C.seats} seats.`));
  const next = `<div class="el-next">${EL_NEXT.map(([t, d, n]) => { const k2 = elDays(d); return `<div class="el-tile"><div class="el-role">${esc(t)}</div><div class="el-big">${esc(elDay(d))}</div>${k2 > 0 ? elCountdown(d) : ''}<div class="el-meta">${esc(n)}</div></div>`; }).join('')}</div><p class="card-note">Counting down to the start of election day, Calgary time. A federal election can be called earlier than the fixed date.</p>`;
  return `${hero}
    <section class="card span-7"><div class="card-head"><div><h2>Turnout across Calgary</h2><p class="card-sub">2025 municipal election, ward by ward (estimate${isCity() ? '' : `; ${esc(W())} outlined`})</p></div></div>${turnMap}</section>
    <section class="card span-5"><div class="card-head"><div><h2>Turnout ranking</h2><p class="card-sub">Votes for councillor / estimated electors</p></div></div>${bars}<p class="card-note">Estimates: Elections Calgary publishes turnout for Calgary only. How it's counted: "Elections".</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>Calgary's seats today</h2><p class="card-sub">Each party keeps one colour across these charts; they are not the parties' own colours.</p></div></div>${seats}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Closest races</h2><p class="card-sub">Where the last results were tightest, across city, provincial and federal seats</p></div></div>${bt}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Briefing: what the results show</h2><p class="card-sub">Worked out from the official results, the same way for every race.</p></div></div>${elInsights()}</section>
    ${big.length ? `<section class="card span-12"><div class="card-head"><div><h2>The legislatures</h2><p class="card-sub">Members sitting today</p></div></div><div class="el-seats">${big.join('')}</div></section>` : ''}
    <section class="card span-12"><div class="card-head"><div><h2>Next elections</h2></div></div>${next}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Wards and electoral areas</h2><p class="card-sub">How each ward's residents are split between provincial electoral divisions and federal electoral districts</p></div></div>${elSplitTable()}</section>`;
}

// ---- Know your leaders
function elLeader(role, name, party, lines, links) {
  return `<div class="el-leader"><div class="el-avatar" aria-hidden="true">${esc((name || '?').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join(''))}</div>
    <div><div class="el-role">${esc(role)}</div><div class="el-name">${esc(name || '')}</div>${party ? `<div class="el-meta">${esc(party)}</div>` : ''}
    ${lines.filter(Boolean).map(l => `<div class="el-meta">${l}</div>`).join('')}${(links || []).filter(x => x && x[1]).map(([t, u]) => `<a class="el-link" href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>`).join(' ')}</div></div>`;
}
function elRaceLines(race, when) {
  if (!race) return [];
  const c = race.candidates[0] || {};
  if (race.acclaimed) return [`Elected by acclamation, ${esc(when)}`];
  const inc = race.candidates.find(x => x.incumbent);
  return [`Elected ${esc(when)} with ${fmt(c.votes)} votes (${elPct(c.share)}), ${isNum(race.margin) ? fmt(race.margin) + ' ahead' : ''} of ${race.candidates.length - 1} other candidate${race.candidates.length === 2 ? '' : 's'}`,
    c.incumbent ? 'Re-elected (held the seat before)' : inc ? `The incumbent, ${esc(inc.name)}, also ran` : ''];
}
function elLeaders() {
  const M = EL.municipal || {}, P = EL.provincial || {}, F = EL.federal || {};
  const E = (D && D.elections) || {};
  const city = isCity(), ward = city ? 0 : SCOPE;
  const cards = [];
  if (M.mayor) cards.push(elLeader('Mayor of Calgary', M.mayor.candidates[0].name, M.mayor.candidates[0].party || 'Independent', elRaceLines(M.mayor, '20 Oct 2025')));
  const wards = city ? Object.keys(M.councillors || {}).sort((a, b) => a - b) : [String(ward)];
  wards.forEach(w => { const r = (M.councillors || {})[w]; if (r) cards.push(elLeader(`Councillor, Ward ${w}`, r.candidates[0].name, r.candidates[0].party || 'Independent', elRaceLines(r, '20 Oct 2025'))); });
  const tr = (list, label) => (list || []).filter(r => city || (r.wards || []).includes(ward)).forEach(r => cards.push(elLeader(`${label}, ${r.title}`, r.candidates[0].name, null, elRaceLines(r, '20 Oct 2025'))));
  tr(M.public_trustees, 'Public school trustee (CBE)');
  tr(M.separate_trustees, 'Separate school trustee (CCSD)');
  const byes = {};
  (P.byelections || []).forEach(b => { byes[b.ed] = b; });
  const mine = lvl => city ? Object.keys((EL[lvl] || {}).general || {}).sort() : (((E[lvl] || {}).ridings) || []).map(x => x.riding);
  const share = (lvl, n) => { const x = (((E[lvl] || {}).ridings) || []).find(y => y.riding === n); return !city && x ? `${elPct(x.share, 0)} of ${esc(W())}'s residents live here` : ''; };
  mine('provincial').forEach(n => { const m = (P.members || {})[n] || {}; const b = byes[n]; const race = b && b.race ? b.race : (P.general || {})[n];
    cards.push(elLeader(`MLA, ${n}`, m.name || ((race || {}).candidates || [{}])[0].name, m.caucus, elRaceLines(race, b && b.race ? `${elDay(b.date)} (by-election)` : '29 May 2023').concat([share('provincial', n)]), [['Assembly profile', m.url]])); });
  mine('federal').forEach(n => { const m = (F.members || {})[n] || {}; const race = (F.general || {})[n];
    cards.push(elLeader(`MP, ${n}`, m.name || ((race || {}).candidates || [{}])[0].name, m.caucus, elRaceLines(race, '28 Apr 2025').concat([m.since ? `Member since ${esc(elDay(m.since))}` : '', share('federal', n)]), [['House of Commons profile', m.url]])); });
  return `<section class="card span-12"><div class="card-head"><div><h2>Know your leaders: ${esc(W())}</h2><p class="card-sub">Everyone elected for ${esc(W())}, with how they were elected. ${city ? 'Pick a ward at the top to see only its leaders.' : ''}</p></div></div>
    <div class="el-leaders">${cards.join('')}</div><p class="card-note">From the official results and the Legislative Assembly and House of Commons member lists. "Incumbent" is the person who held the seat going into that election.</p></section>`;
}

// ---- Know your constituency
function elProfileRows(keys) {
  const P = D && D.profile;
  if (!P) return [];
  const want = { people: ['Homes today', 'People per household', 'Children aged 0 to 14'], newcomers: ['Non-permanent residents (work or study permit, asylum claimants)', 'Moved home in the 5 years before the Census'],
    housing: ['Renter households', 'Households spending 30% or more of income on housing', 'Owners with a mortgage'], income: ['Median household income', 'People in low-income households'],
    work: ['Leave for work between noon and 5 a.m.', 'Commute 45 minutes or more', 'Take transit to work'], language: ['Speak a language other than English most often at home'] };
  const rows = [];
  P.groups.forEach(g => (want[g.key] || []).forEach(l => { const it = (g.items || []).find(i => i.label === l); if (it) rows.push(it); }));
  return rows;
}
function elVal(v, unit, label) { return !isNum(v) ? '–' : unit === '%' ? `${fmt(v, Number.isInteger(v) ? 0 : 1)}%` : unit === '$' ? `$${fmt(v)}` : unit === 'x' && /ratio/i.test(label || '') ? `${fmt(v, 1)}x` : fmt(v, v < 10 && !Number.isInteger(v) ? 1 : 0); }

function elArea() {
  const ev = ecView();
  if (ev) return ev;
  // a ward, or every ward side by side: drawn with that area's own figures, whatever the sidebar shows
  const key = ecKey(), w = key === 'W' ? 0 : ecWardOf(key);
  const view = w === SCOPE ? D : PEEK[`${(D && D.population && D.population.method) || ''}/${w}`];
  const pick = ecPicker();
  return pick + withView(view || D, view ? w : SCOPE, elAreaBody);
}
function elAreaBody() {
  const pick = '';
  const E = (D && D.elections) || {}, C = E.constituency || {}, M = EL.municipal || {};
  if (isCity()) {
    const ws = C.wards || {};
    const keys = Object.keys(ws).sort((a, b) => a - b);
    const row = w => ((D.wards_summary || {}).wards || []).find(x => x.ward === +w) || {};
    return pick + `<section class="card span-12"><div class="card-head"><div><h2>Know your constituency: every ward</h2><p class="card-sub">Pick a ward at the top for its full picture, or an MLA's division or an MP's district above.</p></div></div>
      <div class="ea-two"><div><h3 class="fb-h3">Council turnout by ward, 2025 (estimate)</h3>${ecBars(keys.map(w => ({ label: `Ward ${w}`, sub: ((M.councillors || {})[w] || { candidates: [{}] }).candidates[0].name || '', v: ws[w].turnout_est })).sort((a, b) => a.v - b.v), v => elPct(v, 0), 1)}</div>
      <div><h3 class="fb-h3">How close each council race was</h3>${ecBars(keys.map(w => ({ label: `Ward ${w}`, sub: `${fmt(((M.councillors || {})[w] || {}).margin)} votes`, v: ((M.councillors || {})[w] || {}).margin_share })).sort((a, b) => a.v - b.v), v => elPct(v, 1))}</div></div>
      <div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Ward</th><th scope="col">Councillor</th><th scope="col" class="num">Residents</th><th scope="col" class="num">Electors (estimate)</th><th scope="col" class="num">Votes for councillor</th><th scope="col" class="num">Turnout (estimate)</th><th scope="col" class="num">Winner's share</th><th scope="col" class="num">Ahead by</th></tr></thead><tbody>
      ${keys.map(w => { const r = (M.councillors || {})[w] || { candidates: [{}] }; const ward = row(w);
        return `<tr><th scope="row">Ward ${w}</th><td>${esc(r.candidates[0].name || '')}</td><td class="num">${fmt(ward.residents)}</td><td class="num">${fmt(ws[w].electors_est)}</td><td class="num">${fmt(ws[w].votes)}</td><td class="num">${elPct(ws[w].turnout_est, 0)}</td><td class="num">${elPct(r.candidates[0].share)}</td><td class="num">${elPct(r.margin_share)}</td></tr>`; }).join('')}
      </tbody></table></div><p class="card-note">${esc(C.electors_note || '')}</p></section>`;
  }
  const w = String(SCOPE), cw = (C.wards || {})[w] || {}, cr = C.councillor_race || {};
  const ward = D.ward || {}, race = (M.councillors || {})[w] || {};
  const cands = (race.candidates || []).map((c, i) => Object.assign({}, c, { elected: i === 0 }));
  const raceObj = cands.length ? { candidates: cands, turnout: cw.turnout_est, total: race.total, margin: race.margin, margin_share: race.margin_share,
    math: cands.length > 1 && cw.electors_est ? { gap_votes: race.margin, swing_to_flip: (race.margin_share || 0) / 2, did_not_vote: Math.max(0, cw.electors_est - (race.total || 0)), second_needs_from_new_voters: (race.margin || 0) + 1 } : null } : null;
  const tiles = [
    ['Residents', fmt(ward.residents), isNum(ward.growth_pct) ? `${ward.growth_pct > 0 ? '+' : ''}${fmt(ward.growth_pct, 1)}% since the 2021 Census` : ''],
    ['Electors (estimate)', fmt(cw.electors_est), 'Eligible voters, estimated (note below)'],
    ['Turnout, 2025 (estimate)', elPct(cw.turnout_est, 0), `Calgary ${elPct((M.turnout || {}).share, 1)}`],
    ['Councillor race', elPct(cr.winner_share), `${cr.candidates || '–'} candidates; ${isNum(cr.margin) ? fmt(cr.margin) + ' votes between the first two' : ''}`],
    ['Alberta 2023 turnout', elPct(C.provincial_turnout, 0), 'In the ward\'s divisions'],
    ['Canada 2025 turnout', elPct(C.federal_turnout, 0), 'In the ward\'s districts']];
  const facts = [];
  if (cr.incumbent) facts.push(cr.incumbent.elected ? `The sitting councillor, ${esc(cr.incumbent.name)}, was re-elected with ${elPct(cr.incumbent.share)}.` : `The sitting councillor, ${esc(cr.incumbent.name)}, ran and was not re-elected (${elPct(cr.incumbent.share)}).`);
  else if (cr.candidates) facts.push('The sitting councillor did not run: an open seat in 2025.');
  if (isNum(cr.top2_share)) facts.push(`The first two candidates took ${elPct(cr.top2_share, 0)} of the councillor vote; the other ${cr.candidates - 2} took ${elPct(1 - cr.top2_share, 0)}.`);
  if (C.provincial_closest) facts.push(`Closest provincial division touching the ward: ${esc(C.provincial_closest.name)}, decided by ${elPct(C.provincial_closest.margin_share)} in 2023.`);
  if (C.federal_closest) facts.push(`Closest federal district touching the ward: ${esc(C.federal_closest.name)}, decided by ${elPct(C.federal_closest.margin_share)} in 2025.`);
  const growth = (D.communities || []).filter(c => c.residential && isNum(c.residents) && isNum(c.census2021)).map(c => ({ name: c.name, add: c.residents - c.census2021, res: c.residents, g: c.growth_pct, homes: (c.homes_now || 0) - (c.homes_census || 0), rq: c.requests_per_1000 })).sort((a, b) => b.add - a.add);
  const newRes = growth.reduce((a, c) => a + Math.max(c.add, 0), 0);
  if (growth.length) facts.push(`About ${fmt(Math.round(newRes / 100) * 100)} more residents than at the 2021 Census, most of them in ${growth.slice(0, 3).map(c => esc(c.name)).join(', ')}.`);
  const mv = (C.mayor_vs_city || []).slice(0, 6);
  const mayor = mv.length ? ecMulti(mv.map(x => ({ label: x.name, vals: [x.ward, x.calgary] })), [W(), 'Calgary'], v => elPct(v, 1)) + '<p class="card-note">Election-day votes in the ward; Calgary includes advance votes.</p>' : '';
  const st = (C.stations || []).slice(0, 20);
  const stations = st.length ? ecBars(st.map(x => ({ label: x.station + (/advance/i.test(x.type) ? ' (advance)' : ''), sub: `${x.leading} ${elPct(x.shares[x.leading])}`, v: x.total })), v => fmt(v)) + '<p class="card-note">The 20 busiest voting stations for this race, by votes cast; every station together adds up to the official total. Advance stations took votes from voters of several wards.</p>' : '';
  const PG = ((D.profile || {}).groups || []).filter(g => (g.items || []).length);
  const people = PG.length ? PG.map(g => { const pc = g.items.filter(i => i.unit === '%' && isNum(i.ward)), ot = g.items.filter(i => i.unit !== '%' && isNum(i.ward));
    return `<h3 class="fb-h3">${esc(g.title || g.key)}</h3>${ot.length ? ecTiles(ot.map(i => [i.label, elVal(i.ward, i.unit, i.label), `Calgary ${elVal(i.cal, i.unit, i.label)}${i.note ? ' · ' + esc(i.note) : ''}`])) : ''}
      ${pc.length ? ecMulti(pc.map(i => ({ label: i.label + (i.label.startsWith('Non-permanent') ? ' (not eligible to vote)' : ''), vals: [i.ward / 100, isNum(i.cal) ? i.cal / 100 : null] })), [W(), 'Calgary'], v => elPct(v, Number.isInteger(Math.round(v * 1000) / 10) ? 0 : 1)) : ''}`; }).join('')
    + `<p class="card-note">${esc((D.profile.source || {}).name || '')}: 2021 Census, ${esc((D.profile.source || {}).published || '')}. ${esc((D.profile.source || {}).notes || '')}</p>` : '';
  const lists = ((D.profile || {}).groups || []).map(g => g.list).filter(l => l && (l.rows || []).length);
  const origins = lists.length ? lists.map(l => `<div><h3 class="fb-h3">${esc(l.title)}</h3>${ecBars(l.rows.slice(0, 10).map(r => ({ label: r[0], sub: `${fmt(r[1])} people`, v: r[2] })), v => fmt(v, 1) + '%')}${l.note ? `<p class="card-note">${esc(l.note)}</p>` : ''}</div>`).join('') : '';
  const issues = (D.open_by_type || []).filter(t => !/contact us/i.test(t.type)).slice(0, 10);
  const raise = issues.length ? ecBars(issues.map(t => ({ label: typeof niceType === 'function' ? niceType(t.type) : t.type, v: t.n })), v => fmt(v)) + `<p class="card-note">Open 311 requests in ${esc(W())} today. ${fmt((D.summary || {}).requests_per_1000, 0)} requests per 1,000 residents in the last 12 months.</p>` : '';
  const comms = growth.length ? `${ecBars(growth.slice(0, 12).map(c => ({ label: c.name, sub: `${fmt(c.res)} residents · ${fmt(c.homes)} homes added`, v: c.add })), v => (v > 0 ? '+' : '') + fmt(v))}
    <div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Community</th><th scope="col" class="num">Residents</th><th scope="col" class="num">Added since 2021</th><th scope="col" class="num">Homes added</th><th scope="col" class="num">311 per 1,000</th></tr></thead><tbody>${growth.map(c => `<tr><th scope="row">${esc(c.name)}</th><td class="num">${fmt(c.res)}</td><td class="num">${fmt(c.add)}</td><td class="num">${fmt(c.homes)}</td><td class="num">${fmt(c.rq, 0)}</td></tr>`).join('')}</tbody></table></div>` : '';
  const MI = E.micro || {};
  return pick + `<section class="card span-12"><div class="card-head"><div><h2>Know your constituency: ${esc(W())}</h2><p class="card-sub">Councillor ${esc(ecCouncillor(SCOPE))}. The electorate, how it voted and who lives here: facts for any candidate or campaign alike. Pick an MLA's division or an MP's district above for theirs.</p></div></div>
      ${ecTiles(tiles)}
      <ul class="el-insights">${facts.map(f => `<li>${f}</li>`).join('')}</ul><p class="card-note">${esc(C.electors_note || '')}</p></section>
    ${ecCard(6, 'Councillor race, 2025', 'Share of the vote', ecRace(raceObj))}
    ${ecCard(6, 'The arithmetic of the council race', 'What separated first and second, against the electors who stayed home (estimate)', raceObj ? ecMath(raceObj, MI.who, null) : '')}
    ${ecCard(6, `How ${esc(W())} voted for mayor`, '', mayor)}
    ${ecCard(6, 'Councillor race, station by station', '', stations || '<p class="card-note">Station results are not in this copy of the data yet.</p>')}
    ${MI.who ? ecWhoCards(MI.who, W()) : ''}
    ${ecCard(12, `Who lives here: ${esc(W())} and Calgary`, '2021 Census ward profile', people)}
    ${origins ? ecCard(12, 'Languages and countries of birth', 'For outreach and translated materials: what residents speak at home and where immigrants were born', `<div class="el-two">${origins}</div>`) : ''}
    ${ecCard(6, 'What residents raise with the City', 'Open 311 requests by type', raise)}
    <section class="card span-12"><div class="card-head"><div><h2>Overlapping electoral areas</h2></div></div>${elWho()}</section>
    ${ecCard(12, 'Communities', 'Largest growth since the 2021 Census first', comms)}
    ${ecReferendum(C.referendum, W())}`;
}

// ---- Since the election: the first 12 months of the council term against the 12 months before (the dashboard's period)
function elTerm() {
  const S = (D && D.summary) || {}, dev = (D && D.development) || {}, cr = (D && D.crime) || {};
  const W14 = ((D && D.wards_summary) || {}).wards || [];
  const cal = k => W14.reduce((a, w) => a + (w[k] || 0), 0);
  const chg = (a, b) => isNum(a) && b ? (a - b) / b * 100 : null;
  const pc = v => isNum(v) ? `${v > 0 ? '+' : ''}${fmt(v, 1)}%` : '–';
  const rows = [
    ['311 requests', S.requests12, S.requests_prev, chg(cal('requests12'), cal('requests_prev'))],
    ['Infrastructure reports (roads, sidewalks, lights)', S.infra12, S.infra_prev, chg(cal('infra12'), cal('infra_prev'))],
    ['Traffic incidents', S.traffic12, S.traffic_prev, chg(cal('traffic12'), cal('traffic_prev'))],
    ['Crimes reported (police)', cr.crimes, cr.crimes_prev, cr.city_change_pct],
    ['New homes completed', S.new_homes12, S.new_homes_prev, chg(cal('new_homes12'), cal('new_homes_prev'))],
    ['Homes in building permits issued', S.issued_homes12, S.issued_homes_prev, chg(cal('issued_homes12'), cal('issued_homes_prev'))],
    ['Development permit applications', dev.applied, dev.applied_prev, null]];
  const table = `<div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Measure</th><th scope="col" class="num">${esc(D.period || '')}</th><th scope="col" class="num">${esc(D.prev_period || '')}</th><th scope="col" class="num">Change</th><th scope="col" class="num">Calgary's change</th></tr></thead><tbody>
    ${rows.map(([t, a, b, c]) => `<tr><th scope="row">${esc(t)}</th><td class="num">${fmt(a)}</td><td class="num">${fmt(b)}</td><td class="num">${pc(chg(a, b))}</td><td class="num">${isCity() ? '' : pc(c)}</td></tr>`).join('')}
    <tr><th scope="row">311 requests closed within 7 days</th><td class="num">${isNum(S.closed_7_days_pct) ? fmt(S.closed_7_days_pct, 1) + '%' : '–'}</td><td class="num">–</td><td class="num">–</td><td class="num">${isNum(S.closed_7_days_pct_city) && !isCity() ? 'Calgary ' + fmt(S.closed_7_days_pct_city, 1) + '%' : ''}</td></tr>
    <tr><th scope="row">Open 311 requests older than 90 days, today</th><td class="num">${fmt(S.open_over_90_days)}</td><td class="num">–</td><td class="num">–</td><td class="num"></td></tr>
  </tbody></table></div>`;
  const pr = ((D && D.projects) || []).concat(((D && D.roadwork) || []).map(r => ({ title: r.title, kind: r.type, status: r.completion ? `Completion ${r.completion}` : '', budget: r.budget, url: r.url })));
  const projects = pr.length ? `<div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Project</th><th scope="col">Status</th><th scope="col">Completion</th><th scope="col">Budget</th></tr></thead><tbody>${pr.map(x => `<tr><th scope="row">${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)}</a>` : esc(x.title)}${x.kind ? `<br><small>${esc(x.kind)}</small>` : ''}</th><td>${esc(x.status || '')}</td><td>${esc(x.completion || '')}</td><td>${esc(x.budget || '')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="card-note">No major projects listed for this area.</p>';
  const since = ((D && D.big_permits) || []).filter(b => (b.issued || '') >= '2025-10-20');
  const permits = since.length ? `<p class="card-sub">${fmt(since.length)} large building permits issued since 20 October 2025, ${fmt(since.reduce((a, b) => a + (b.cost || 0), 0) / 1e6, 1)} million dollars of construction in all:</p><div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Issued</th><th scope="col">Project</th><th scope="col">Type</th><th scope="col" class="num">Estimated cost</th></tr></thead><tbody>${since.sort((a, b) => (b.cost || 0) - (a.cost || 0)).slice(0, 15).map(b => `<tr><td>${esc(elDay(b.issued))}</td><th scope="row">${esc(b.title)}<br><small>${esc(b.address || '')}</small></th><td>${esc(b.type || '')}</td><td class="num">$${fmt(b.cost)}</td></tr>`).join('')}</tbody></table></div>` : '';
  return `<section class="card span-12"><div class="card-head"><div><h2>Since the election: ${esc(W())}</h2><p class="card-sub">The council elected on 20 October 2025: its first 12 months (${esc(D.period || '')}) against the 12 months before (${esc(D.prev_period || '')}).</p></div></div>${table}
      <p class="card-note">City figures for the area, the same way for every ward. They follow City services, funding from all three governments, growth and the weather as much as anyone's decisions: they describe the area, not one person's record. Police figures: ${esc(cr.period || 'the latest published')}.</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>Projects</h2><p class="card-sub">Major City, school and transit projects in ${esc(W())} and where each stands today</p></div></div>${projects}</section>
    ${permits ? `<section class="card span-12"><div class="card-head"><div><h2>Building since the election</h2></div></div>${permits}</section>` : ''}`;
}

function elResults() {
  return `<section class="card span-12"><div class="card-head"><div><h2>City of Calgary: 2025 general election</h2></div></div>${elMunicipal()}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Alberta: provincial elections in Calgary</h2></div></div>${elProvincial()}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Canada: federal election in Calgary</h2></div></div>${elFederal()}</section>`;
}

async function renderElections() {
  const body = $('#el-body');
  if (!body) return;
  if (!EL) body.innerHTML = '<p class="card-note">Reading the election results…</p>';
  await loadElections();
  $('#el-title').textContent = `Election Data Centre: ${W()}`;
  if (!EL) { body.innerHTML = '<p class="card-note">The election results could not be read.</p>'; return; }
  EL.constituency_wards = (((D && D.elections) || {}).constituency || {}).wards;
  const errs = Object.keys(EL.errors || {});
  if (elSub === 'area' || elSub === 'analytics') await ecPrepare();
  // Election Analytics lives here as a section of its own (elanalytics.js fills it)
  const page = elSub === 'analytics' ? '<div class="span-12 ea-embed"><div class="grid" id="ea-body"></div></div>' : elSub === 'civic' ? '<div class="span-12 ca-embed"><div class="grid" id="ca-body"></div></div>' : elSub === 'leaders' ? elLeaders() : elSub === 'area' ? elArea() : elSub === 'results' ? elResults() : elRoom();
  body.innerHTML = `<nav class="el-subtabs span-12" aria-label="Election Data Centre sections">${EL_SUBS.map(([k, t]) => `<button type="button" class="el-subtab${k === elSub ? ' is-on' : ''}" data-elsub="${k}" ${k === elSub ? 'aria-current="page"' : ''}>${k === 'analytics' ? '<svg class="ic el-subic" aria-hidden="true"><use href="#i-analytics-solid"/></svg>' : ''}${esc(t)}</button>`).join('')}</nav>
    ${page}
    <section class="card span-12"><p class="card-note">Official results as published by Elections Calgary, Elections Alberta and Elections Canada; members today from the Legislative Assembly of Alberta and the House of Commons. Read ${esc(elDay(EL.built_at))}. Facts only: nothing here rates, ranks or recommends any candidate, party or campaign. ${errs.length ? `Not read this time: ${esc(errs.join(', '))}.` : ''} <button type="button" class="link-btn small" data-method="elections">How these are read</button></p></section>`;
  elTick();
  if (typeof ecBind === 'function') ecBind(body, renderElections);
  if (elSub === 'analytics' && window.renderElAnalytics) await window.renderElAnalytics();
  if (elSub === 'civic' && window.renderCivic) await window.renderCivic();
  body.querySelectorAll('[data-elsub]').forEach(b => b.addEventListener('click', () => { elSub = b.dataset.elsub; renderElections(); }));
  const sel = $('#el-refq');
  if (sel) sel.addEventListener('change', () => { elRefQ = +sel.value; const y = window.scrollY; renderElections().then(() => window.scrollTo(0, y)); });
}

// the Dashboard card: who represents the area picked
function renderRepCard() {
  const card = $('#rep-card');
  if (!card) return;
  const E = D && D.elections;
  card.hidden = !E;
  if (!E) return;
  $('#rep-body').innerHTML = elWho();
}

window.renderElections = renderElections;
window.renderRepCard = renderRepCard;

;
// ---- constituency.js
/* Calgary Insight: Know your constituency for every elected member from Calgary: the councillor's ward, each MLA's
   provincial electoral division and each MP's federal electoral district. Charts of who lives there (age, households,
   work, languages), the last result and its arithmetic, turnout by voting location or poll, the wards it overlaps and
   the 2026 referendum. elections.py (areas) builds the figures. Facts only, the same way for every seat. */
'use strict';

// the screen's own filter: any ward (councillor), electoral division (MLA) or electoral district (MP), whatever area
// the sidebar shows. Keys: 'w:5', 'p:Calgary-Elbow', 'f:Calgary Centre', or every one side by side: 'W', 'P', 'F'
let ecSel = { key: null };
const ecP = (v, d = 0) => isNum(v) ? `${fmt(v * 100, d)}%` : '–';
const ecLevel = { provincial: ['Provincial electoral division', 'MLA', 'division'], federal: ['Federal electoral district', 'MP', 'district'] };
function ecCityView() { return SCOPE === 0 && D ? D : PEEK[`${(D && D.population && D.population.method) || ''}/0`]; }
function ecAreas() { const v = ecCityView() || D; return ((v && v.elections) || {}).areas || {}; }
function ecKey() {
  if (!ecSel.key) ecSel.key = SCOPE ? `w:${SCOPE}` : 'W';
  return ecSel.key;
}
function ecWardOf(key) { const m = /^w:(\d+)$/.exec(key || ''); return m ? +m[1] : null; }
function ecArea(key) {
  const m = /^([pf]):(.+)$/.exec(key || '');
  if (!m) return null;
  return ((ecAreas()[m[1] === 'p' ? 'provincial' : 'federal']) || {})[m[2]] || null;
}
// read what the chosen constituency needs: the whole city's figures for divisions and districts, a ward's own view
async function ecPrepare() {
  const key = ecKey(), w = ecWardOf(key);
  try {
    if (!ecCityView()) await peekView(0);
    if (w !== null && w !== SCOPE) await peekView(w);
  } catch (e) { ecSel.key = SCOPE ? `w:${SCOPE}` : 'W'; }
}
function ecCouncillor(w) { const r = ((EL || {}).municipal || {}).councillors || {}; return (((r[String(w)] || {}).candidates || [])[0] || {}).name || ''; }

// ---- small charts (no party colours: the winner is the highlighted bar)
function ecBars(items, f, max) {
  max = max || Math.max(...items.map(x => x.v || 0), 1e-9);
  return `<div class="fb-bars">${items.map(x => `<div class="fb-bar${x.on ? ' is-on' : ''}"><span class="fb-bar-l">${esc(x.label)}${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</span><span class="fb-bar-t"><i style="width:${Math.max(0, (x.v || 0) / max * 100)}%"></i></span><span class="fb-bar-v">${esc(f(x.v))}</span></div>`).join('')}</div>`;
}
// several series per row (this area, Calgary, Alberta)
function ecMulti(rows, names, f, max) {
  max = max || Math.max(...rows.flatMap(r => r.vals.map(v => v || 0)), 1e-9);
  return `<div class="ec-key">${names.map((n, i) => `<span><i class="ec-s${i}"></i>${esc(n)}</span>`).join('')}</div>
    <div class="ec-multi">${rows.map(r => `<div class="ec-mrow"><span class="ec-ml">${esc(r.label)}</span><span class="ec-mt">${r.vals.map((v, i) => `<span class="ec-mb"><i class="ec-s${i}" style="width:${isNum(v) ? Math.max(0, v / max * 100) : 0}%"></i><b>${isNum(v) ? esc(f(v)) : '–'}</b></span>`).join('')}</span></div>`).join('')}</div>`;
}
function ecTiles(list) {
  return `<div class="el-next">${list.filter(Boolean).map(([t, v, n]) => `<div class="el-tile"><div class="el-role">${esc(t)}</div><div class="el-big">${v}</div><div class="el-meta">${n || ''}</div></div>`).join('')}</div>`;
}
function ecCard(span, title, sub, inner) {
  return inner ? `<section class="card span-${span}"><div class="card-head"><div><h2>${title}</h2>${sub ? `<p class="card-sub">${sub}</p>` : ''}</div></div>${inner}</section>` : '';
}
function ecRace(r) {
  if (!r || !(r.candidates || []).length) return '';
  return ecBars(r.candidates.map(c => ({ label: c.name, sub: [c.party, c.incumbent ? 'incumbent' : '', `${fmt(c.votes)} votes`].filter(Boolean).join(' · '), v: c.share, on: c.elected })), v => ecP(v, 1), 1);
}

// the arithmetic of the last result: what it would have taken for the runner-up to come first
function ecMath(race, who, rate) {
  const m = (race || {}).math, c = (race || {}).candidates || [];
  if (!m || c.length < 2) return '';
  const grown = who && isNum(who.population_now) && isNum(who.population_2021) && who.population_2021 ? who.population_now - who.population_2021 : null;
  const newEl = isNum(grown) && grown > 0 && rate ? Math.round(grown * rate) : null;
  const items = [{ label: 'Votes between first and second', sub: `${c[0].name} ahead of ${c[1].name}`, v: m.gap_votes },
    { label: 'Electors on the list who did not vote', sub: `${ecP(1 - (race.turnout || 0))} of the list`, v: m.did_not_vote }];
  if (newEl) items.push({ label: 'Potential new electors since 2021 (estimate)', sub: `${fmt(grown)} more residents x ${ecP(rate)} electors per resident`, v: newEl });
  return `${ecTiles([['Uniform swing that would tie it', isNum(m.swing_to_flip) ? `${fmt(m.swing_to_flip * 100, 1)} pts` : '–', 'from the winner to the runner-up (half the margin)'],
    ['New votes the runner-up needs', fmt(m.second_needs_from_new_voters), 'if every other vote stayed the same'],
    ['Share of non-voters that is', isNum(m.did_not_vote) && m.did_not_vote ? ecP(m.second_needs_from_new_voters / m.did_not_vote, 1) : '–', 'of the electors who did not vote last time']])}
    ${ecBars(items, v => fmt(v))}
    <p class="card-note">Arithmetic on the official result, not a forecast: it holds every other vote still. Swing and turnout scenarios for any candidate can be built in Election Analytics.</p>`;
}

function ecWhoCards(w, place) {
  if (!w || !w.population) return ecCard(12, 'Who lives here', '', '<p class="card-note">No Census figures for this area yet.</p>');
  const tiles = [['Residents today', fmt(w.population_now || w.population), w.method || ''], ['Aged 20 and over', fmt(w.adults20), 'the age group that votes'],
    ['Households', fmt(w.households), isNum(w.avg_hh) ? `${fmt(w.avg_hh, 2)} people per household` : ''], ['Families with children', ecP(w.families_kids), `one-parent ${ecP(w.one_parent)}`],
    ['In the labour force', ecP(w.participation), `unemployment ${ecP(w.unemployment, 1)} (May 2021)`], ['Self-employed', ecP(w.self_employed), 'of people with a job']];
  const ages = [['Under 20', w.under20], ['20 to 64', w.age20_64], ['65 and over', w.age65]].map(([l, v]) => ({ label: l, v }));
  const hh = [['Live alone', w.one_person_hh], ['5 or more in the home', w.big_hh], ['Never married (15+)', w.never_married]].map(([l, v]) => ({ label: l, v }));
  return ecCard(6, `Age and sex: ${esc(place)}`, `Residents today by 5-year age band: each community's 2021 Census mix scaled to its residents now${w.method ? ` (${esc(w.method)})` : ''}`, eaPyramid(w))
    + ecCard(6, 'Households and work', `${w.not_in_census ? `${fmt(w.not_in_census)} residents live in communities built since 2021, with no Census profile yet. ` : ''}Rates are the 2021 Census's`,
      `${ecTiles(tiles)}<h3 class="fb-h3">Age groups</h3>${ecBars(ages, v => ecP(v), 1)}<h3 class="fb-h3">Homes</h3>${ecBars(hh, v => ecP(v), 1)}
      ${(w.top_occupations || []).length ? `<h3 class="fb-h3">Most common occupations</h3>${ecBars(w.top_occupations.map(([k, v]) => ({ label: k, v })), v => fmt(v))}` : ''}
      ${(w.top_industries || []).length ? `<h3 class="fb-h3">Industries people work in</h3>${ecBars(w.top_industries.map(([k, v]) => ({ label: k, v })), v => fmt(v))}` : ''}`);
}

function ecCommunities(w) {
  const rows = ((w || {}).communities || []);
  if (!rows.length) return '';
  const C = Object.fromEntries(((D && D.communities) || []).map(c => [c.code, c]));
  const nm = r => (C[r.code] || {}).name || (r.name && r.name === r.name.toUpperCase() ? r.name.toLowerCase().replace(/(^|[\s\-'/(])([a-z])/g, (m, p, c) => p + c.toUpperCase()) : r.name) || r.code;
  return ecCard(12, 'Community by community', 'Residents today in the part of each community inside this area, with its 2021 Census profile',
    `${ecBars(rows.slice(0, 15).map(r => ({ label: nm(r), sub: `${ecP(r.share, 1)} of the area${isNum(r.inside) && r.inside < 0.995 ? ` · ${ecP(r.inside)} of the community is inside` : ''}`, v: r.residents })), v => fmt(v))}
    <div class="table-wrap"><table class="data ea-ctable"><thead><tr><th scope="col">Community</th><th class="num" scope="col">Residents</th><th class="num" scope="col">Share of area</th><th class="num" scope="col">Under 20</th><th class="num" scope="col">65+</th><th class="num" scope="col">Per household</th><th class="num" scope="col">Families with children</th><th class="num" scope="col">Unemployment</th><th scope="col">Top occupation</th></tr></thead>
    <tbody>${rows.map(r => `<tr><th scope="row">${esc(nm(r))}</th><td class="num">${fmt(r.residents)}</td><td class="num">${ecP(r.share, 1)}</td><td class="num">${ecP(r.under20)}</td><td class="num">${ecP(r.age65)}</td><td class="num">${isNum(r.avg_hh) ? fmt(r.avg_hh, 1) : '–'}</td><td class="num">${ecP(r.families_kids)}</td><td class="num">${isNum(r.unemployment) ? fmt(r.unemployment, 0) + '%' : '–'}</td><td>${esc(r.top_occupation || '–')}</td></tr>`).join('')}</tbody></table></div>`);
}

function ecReferendum(ref, place) {
  if (!(ref || []).length) return '';
  return ecCard(12, 'The 2026 referendum here', 'Share for the first option of each question: Yes, and for question 10, remain a province',
    `${ecMulti(ref.map(q => ({ label: `Q${q.number}: ${(t => t.length > 120 ? t.slice(0, 118) + '…' : t)((q.question || '').replace(/^Question \d+:\s*/, ''))}`, vals: [q.area[0], (q.calgary || [])[0], (q.alberta || [])[0]] })), [place, 'Calgary', 'Alberta'], v => ecP(v, 0), 1)}
    <p class="card-note">Elections Alberta's results by electoral division (19 October 2026). A federal district's figure averages the provincial divisions it overlaps by the share of its residents in each.</p>`);
}

function ecTurnoutProv(st, name) {
  const s = (st || {}).summary, rows = ((st || {}).stations || []).filter(x => isNum(x.turnout));
  if (!s || !rows.length) return '';
  return ecCard(12, 'Turnout by voting location, 2023', `Every election-day voting location in ${esc(name)}, lowest turnout first`,
    `${ecTiles([['Locations', fmt(s.election_day_stations), ''], ['Lowest', ecP(s.turnout_low), ''], ['Middle', ecP(s.turnout_median), ''], ['Highest', ecP(s.turnout_high), '']])}
    <div class="ea-two"><div><h3 class="fb-h3">Locations by turnout</h3>${eaHist(s.bands, 'Voting locations by turnout')}</div>
    <div><h3 class="fb-h3">Locations led</h3>${ecBars(Object.entries(s.stations_led || {}).sort((a, b) => b[1] - a[1]).map(([p, n]) => ({ label: p, v: n })), v => fmt(v))}</div></div>
    <h3 class="fb-h3">Every location</h3>${ecBars(rows.slice().sort((a, b) => a.turnout - b.turnout).map(x => ({ label: x.name, sub: `${fmt(x.electors)} on the list · ${x.lead || ''} ${ecP(x.lead_share)} · ahead by ${ecP(x.margin, 1)}`, v: x.turnout })), v => ecP(v), 1)}
    <p class="card-note">Elections Alberta's Statement of Vote (2019 boundaries). Election-day ballots over names on the list: advance and other ballots are counted separately, so locations read lower than the division's turnout.</p>`);
}
function ecTurnoutFed(pp, name) {
  const s = (pp || {}).summary;
  if (!s) return '';
  const ways = s.part_by_way || {}, psw = s.party_share_by_way || {};
  const big = Object.keys(psw).filter(p => (psw[p].election_day || 0) >= 0.03 || (psw[p].advance_polls || 0) >= 0.03);
  return ecCard(12, 'Turnout poll by poll, 2025', `Elections Canada's results for every poll in ${esc(name)}`,
    `${ecTiles([['Polls', fmt(s.polls), `${fmt(s.advance_polls)} advance polls`], ['Lowest poll', ecP(s.turnout_low), ''], ['Middle poll', ecP(s.turnout_median), ''], ['Highest poll', ecP(s.turnout_high), 'registration at the poll can pass 100%']])}
    <div class="ea-two"><div><h3 class="fb-h3">Polls by turnout</h3>${eaHist(s.bands, 'Polls by turnout')}</div>
      <div><h3 class="fb-h3">When people voted</h3>${ecBars([['Election day', ways.election_day], ['Advance polls', ways.advance_polls], ['Special ballot or mail', ways.special_and_mail]].map(([l, v]) => ({ label: l, v })), v => ecP(v), 1)}</div></div>
    <h3 class="fb-h3">Each party's share, by way of voting</h3>${ecMulti(big.map(p => ({ label: p, vals: [psw[p].election_day, psw[p].advance_polls, psw[p].special_and_mail] })), ['Election day', 'Advance polls', 'Special / mail'], v => ecP(v, 0), 1)}
    <div class="ea-two"><div><h3 class="fb-h3">Lowest-turnout polls</h3>${ecBars((pp.lowest_turnout || []).map(r => ({ label: `Poll ${r.poll}`, sub: `${fmt(r.ballots)} of ${fmt(r.electors)} · led ${r.lead || ''}`, v: r.turnout })), v => ecP(v), 1)}</div>
      <div><h3 class="fb-h3">Closest polls</h3>${ecBars((pp.closest || []).map(r => ({ label: `Poll ${r.poll}`, sub: `${fmt(r.ballots)} votes · ${r.lead || ''} ${ecP(r.lead_share)}`, v: r.margin })), v => ecP(v, 1))}</div></div>
    <p class="card-note">Poll numbers are Elections Canada's; advance polls are numbered in the 600s; special ballots and mail-in votes are counted for the district as a whole. Polls with no votes (merged with another) are left out of the turnout figures.</p>`);
}

// ---- one division or district
function ecRiding(A) {
  const [lvlName, role, word] = ecLevel[A.level], r = A.last || {}, w = A.who || {}, mem = A.member || {};
  const win = (r.candidates || []).find(c => c.elected) || (r.candidates || [])[0] || {};
  const elPerRes = r.electors && w.population_now ? r.electors / w.population_now : null;
  const facts = [];
  if ((A.wards || []).length) facts.push(`Its residents live in ${A.wards.length === 1 ? 'one ward' : `${A.wards.length} wards`}: ${A.wards.map(x => `Ward ${x.ward} (${ecP(x.share)}${ecCouncillor(x.ward) ? `, Councillor ${esc(ecCouncillor(x.ward))}` : ''})`).join(', ')}.`);
  if (A.by_election) facts.push(`The latest result is the by-election of ${esc(elDay(A.last_date))}; the 2023 general election is shown below it.`);
  if (isNum(w.population_now) && isNum(w.population_2021) && w.population_2021) facts.push(`About ${fmt(w.population_now)} residents today against ${fmt(w.population_2021)} at the 2021 Census (${w.population_now >= w.population_2021 ? '+' : ''}${fmt(w.population_now - w.population_2021)})${w.not_in_census ? `; ${fmt(w.not_in_census)} live in communities built since` : ''}.`);
  const head = `<section class="card span-12"><div class="card-head"><div><h2>Know your constituency: ${esc(A.name)}</h2><p class="card-sub">${lvlName} · ${role}: <b>${esc(mem.name || win.name || '')}</b>${mem.caucus ? ` (${esc(mem.caucus)})` : ''}${mem.url ? ` · <a href="${esc(mem.url)}" target="_blank" rel="noopener">profile</a>` : ''}</p></div></div>
    ${ecTiles([['Residents today', fmt(A.residents), w.method || ''], ['Electors on the list', fmt(r.electors), `last election, ${esc(elDay(A.last_date))}`], ['Turnout', ecP(r.turnout, 1), `${fmt(r.ballots || r.total)} ballots`],
      ['Winner\'s share', ecP(win.share, 1), esc(win.name || '')], ['Ahead by', ecP(r.margin_share, 1), `${fmt(r.margin)} votes`], ['Electors per resident', isNum(elPerRes) ? ecP(elPerRes) : '–', 'adult citizens on the list / residents today']])}
    <ul class="el-insights">${facts.map(f => `<li>${f}</li>`).join('')}</ul></section>`;
  const res = ecCard(6, `Last result${A.by_election ? ' (by-election)' : ''}`, `${esc(elDay(A.last_date))}: share of the vote`, ecRace(r) + (A.general ? `<h3 class="fb-h3">2023 general election</h3>${ecRace(A.general)}` : ''));
  const math = ecCard(6, 'The arithmetic of the last result', 'What separated first and second, against the electors who stayed home', ecMath(r, w, elPerRes));
  const turn = A.level === 'provincial' ? ecTurnoutProv(A.stations, A.name) : ecTurnoutFed(A.polls, A.name);
  const wards = (A.wards || []).length ? ecCard(6, `Wards in this ${word}`, 'Share of its residents in each ward', ecBars(A.wards.map(x => ({ label: `Ward ${x.ward}`, sub: ecCouncillor(x.ward) ? `Councillor ${ecCouncillor(x.ward)} · ${fmt(x.residents)} residents` : `${fmt(x.residents)} residents`, v: x.share })), v => ecP(v), 1)) : '';
  const mayor = (A.mayor || []).length ? ecCard(6, 'How it voted for mayor, 2025', 'Estimated from the wards it overlaps, weighted by residents', ecMulti(A.mayor.map(x => ({ label: x.name, vals: [x.area, x.calgary] })), [A.name, 'Calgary'], v => ecP(v, 1))) : '';
  return head + res + math + ecWhoCards(w, A.name) + turn + wards + mayor + ecReferendum(A.referendum, A.name) + ecCommunities(w)
    + `<section class="card span-12"><p class="card-note">${esc(ecAreas().note || '')}</p></section>`;
}

// ---- every seat side by side (all of Calgary)
function ecAllSeats(level) {
  const L = ecAreas()[level] || {}, [lvlName, role] = ecLevel[level];
  const rows = Object.values(L).sort((a, b) => ((a.last || {}).margin_share || 9) - ((b.last || {}).margin_share || 9));
  if (!rows.length) return '<section class="card span-12"><p class="card-note">These figures appear after the next refresh of the election results.</p></section>';
  return ecCard(12, `Every ${lvlName.toLowerCase()} in Calgary`, 'Closest result first. Pick one above for its full picture.',
    `${ecBars(rows.map(a => ({ label: a.name, sub: `${role} ${(a.member || {}).name || ''} · turnout ${ecP((a.last || {}).turnout)}`, v: (a.last || {}).margin_share })), v => ecP(v, 1))}
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">${level === 'provincial' ? 'Division' : 'District'}</th><th scope="col">${role}</th><th class="num" scope="col">Residents today</th><th class="num" scope="col">Electors</th><th class="num" scope="col">Turnout</th><th class="num" scope="col">Winner's share</th><th class="num" scope="col">Votes between 1st and 2nd</th><th class="num" scope="col">Swing to tie</th><th class="num" scope="col">65 and over</th><th class="num" scope="col">Under 20</th></tr></thead>
    <tbody>${rows.map(a => { const r = a.last || {}, w = a.who || {}, c = (r.candidates || [])[0] || {}; return `<tr><th scope="row"><button type="button" class="link-btn" data-ecsel="${level[0]}:${esc(a.name)}">${esc(a.name)}</button></th><td>${esc((a.member || {}).name || c.name || '')}</td><td class="num">${fmt(a.residents)}</td><td class="num">${fmt(r.electors)}</td><td class="num">${ecP(r.turnout)}</td><td class="num">${ecP(c.share, 1)}</td><td class="num">${fmt((r.math || {}).gap_votes)}</td><td class="num">${isNum((r.math || {}).swing_to_flip) ? fmt(r.math.swing_to_flip * 100, 1) + ' pts' : '–'}</td><td class="num">${ecP(w.age65)}</td><td class="num">${ecP(w.under20)}</td></tr>`; }).join('')}</tbody></table></div>`);
}

// the picker: whose constituency (three lists, any of them, on this screen only)
function ecPicker() {
  const key = ecKey(), A = ecAreas(), p = Object.keys(A.provincial || {}).sort(), f = Object.keys(A.federal || {}).sort();
  const C = ((EL || {}).municipal || {}).councillors || {};
  const wards = Array.from({ length: 14 }, (_, i) => i + 1);
  const w = ecWardOf(key);
  const mem = (lvl, n) => (((A[lvl] || {})[n] || {}).member || {}).name || '';
  const sel = (id, label, all, allKey, opts) => `<label class="ec-pf"><span>${label}</span><select id="${id}" class="select${opts.some(([k]) => k === key) || key === allKey ? ' is-on' : ''}"><option value="">Choose…</option><option value="${allKey}" ${key === allKey ? 'selected' : ''}>${all}</option>${opts.map(([k, t]) => `<option value="${esc(k)}" ${k === key ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`;
  return `<div class="ec-pick span-12"><span class="ec-pick-l">Whose constituency</span>
    ${sel('ec-w', 'Councillor', 'All 14 wards side by side', 'W', wards.map(n => [`w:${n}`, `Ward ${n}${((C[n] || {}).candidates || [{}])[0].name ? ' · ' + C[n].candidates[0].name : ''}`]))}
    ${sel('ec-p', 'MLA', `All ${p.length} electoral divisions`, 'P', p.map(n => [`p:${n}`, `${n}${mem('provincial', n) ? ' · ' + mem('provincial', n) : ''}`]))}
    ${sel('ec-f', 'MP', `All ${f.length} electoral districts`, 'F', f.map(n => [`f:${n}`, `${n}${mem('federal', n) ? ' · ' + mem('federal', n) : ''}`]))}
    <span class="muted small">Only this screen changes${w !== null && w !== SCOPE ? `; the rest of Calgary Insight still shows ${esc(W())}` : ''}.</span></div>`;
}

// the view for the Election Data Centre's "Know your constituency" (null: a ward, drawn by elections.js)
function ecView() {
  const key = ecKey();
  if (key === 'P' || key === 'F') return ecPicker() + ecAllSeats(key === 'P' ? 'provincial' : 'federal');
  const A = ecArea(key);
  return A ? ecPicker() + ecRiding(A) : null;
}
function ecBind(root, rerender) {
  const go = v => { if (!v) return; ecSel.key = v; const y = window.scrollY; Promise.resolve(rerender()).then(() => window.scrollTo(0, y)); };
  root.querySelectorAll('[data-ecsel]').forEach(b => b.addEventListener('click', () => go(b.dataset.ecsel)));
  ['#ec-w', '#ec-p', '#ec-f'].forEach(id => { const s = root.querySelector(id); if (s) s.addEventListener('change', () => go(s.value)); });
}
window.ecView = ecView;

;
// ---- fedbudget.js
// Federal Budget 2026: the Government of Canada's budget, tabled 5 November 2026.
// Read from the official budget pages (budget.canada.ca) and Finance Canada's Federal Support to Provinces and Territories tables.
let FB = null, fbSub = 'overview', fbProv = 'AB', fbQ = '', fbChap = 0, fbSort = 'size', fbOpen = new Set();
const FB_SUBS = [['overview', 'Overview'], ['provinces', 'Province by province'], ['calgary', 'Calgary and Alberta'], ['measures', 'Every measure'], ['tax', 'Tax changes'], ['tables', 'Fiscal tables']];
const FB_PROV_ORDER = ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'];

async function loadFedBudget() {
  if (FB) return FB;
  try { const res = await (await api()).get_fedbudget(); if (res && res.ok && res.data) FB = res.data; } catch (e) { /* shown below */ }
  return FB;
}
// money: tables are in millions (chapters, tax, transfers) or billions (fiscal); show $ billions once a figure reaches 1,000 million
const fbM = (m, signed) => { if (!isNum(m)) return '–'; const s = signed && m > 0 ? '+' : '', a = Math.abs(m), neg = m < 0 ? '−' : '';
  return a >= 1000 ? `${s}${neg}$${fmt(a / 1000, a >= 100000 ? 0 : 1)}B` : `${s}${neg}$${fmt(a, a < 10 && a % 1 ? 1 : 0)}M`; };
const fbB = (b, signed) => !isNum(b) ? '–' : `${signed && b > 0 ? '+' : ''}${b < 0 ? '−' : ''}$${fmt(Math.abs(b), 1)}B`;
const fbRow = (t, start) => (t.rows || []).find(r => r.v && r.label === start) || (t.rows || []).find(r => r.v && r.label.startsWith(start));
const fbYr = c => String(c).replace(/^(\d{4})-(\d{2})$/, '$1–$2');
const fbDoc = d => (FB.docs || {})[d] || { name: d, url: FB.source };
const fbPill = (t, cls = '') => `<span class="fb-pill ${cls}">${esc(t)}</span>`;

// vertical bars with negatives allowed; series = [{name, color, v:[...]}]
function fbColumns(cols, series, fmtFn, h = 190) {
  const all = series.flatMap(s => s.v).filter(isNum), max = Math.max(0, ...all), min = Math.min(0, ...all), span = (max - min) || 1;
  const W = 640, top = min < 0 ? 22 : 18, bot = 26, ih = h - top - bot, gw = W / cols.length, bw = Math.min(26, (gw - 14) / series.length);
  const y = v => top + (max - v) / span * ih, y0 = y(0);
  let g = `<line x1="0" x2="${W}" y1="${y0}" y2="${y0}" class="fb-axis"/>`;
  cols.forEach((c, i) => {
    const x0 = i * gw + (gw - bw * series.length) / 2;
    series.forEach((s, k) => { const v = s.v[i]; if (!isNum(v)) return; const yy = Math.min(y(v), y0), hh = Math.max(1, Math.abs(y(v) - y0));
      g += `<rect x="${x0 + k * bw}" y="${yy}" width="${bw - 3}" height="${hh}" rx="2" fill="${s.color}"><title>${esc(s.name)} ${esc(fbYr(c))}: ${esc(fmtFn(v))}</title></rect>`;
      if (k === series.length - 1 || series.length === 1) {   // a negative bar's value sits inside its end, clear of the year labels
        g += `<text x="${x0 + k * bw + (bw - 3) / 2}" y="${v < 0 ? y0 - 5 : y(v) - 5}" class="fb-val" text-anchor="middle">${esc(fmtFn(v))}</text>`;
      } });
    g += `<text x="${i * gw + gw / 2}" y="${h - 8}" class="fb-lab" text-anchor="middle">${esc(fbYr(c))}</text>`;
  });
  const key = series.length > 1 ? `<div class="fb-key">${series.map(s => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';
  return `${key}<svg class="fb-cols" viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(series.map(s => s.name).join(', '))}">${g}</svg>`;
}
// horizontal bars: [{label, v, sub, on}]
function fbBars(items, fmtFn) {
  const max = Math.max(...items.map(x => Math.abs(x.v || 0)), 1e-9);
  return `<div class="fb-bars">${items.map(x => `<div class="fb-bar${x.on ? ' is-on' : ''}"><span class="fb-bar-l">${esc(x.label)}${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</span><span class="fb-bar-t"><i class="${(x.v || 0) < 0 ? 'neg' : ''}" style="width:${Math.abs(x.v || 0) / max * 100}%"></i></span><span class="fb-bar-v">${esc(fmtFn(x.v))}</span></div>`).join('')}</div>`;
}

// ---- Overview
function fbOverview() {
  const A8 = FB.fiscal['Table A1.8'], A9 = FB.fiscal['Table A1.9'], A10 = FB.fiscal['Table A1.10'], A6 = FB.fiscal['Table A1.6'], A5 = FB.fiscal['Table A1.5'], O = FB.overview;
  const cols = A8.cols, Y = 1;   // 2026-27
  const bal = fbRow(A8, 'Budgetary balance').v, rev = fbRow(A8, 'Budgetary revenues').v, exp = fbRow(A8, 'Total expenses').v, pdc = fbRow(A8, 'Public debt charges').v;
  const debt = fbRow(A8, 'Federal debt').v, pct = A8.rows.filter(r => r.label === 'Federal debt' && r.v), debtPct = (pct[pct.length - 1] || {}).v || [];
  const balPct = (A8.rows.filter(r => r.label === 'Budgetary balance' && r.v)[1] || {}).v || [];
  const meas = fbRow(O, 'Subtotal – Budget 2026 measures').v, seu = fbRow(O, 'Budgetary balance – SEU 2026').v;
  const op = fbRow(A6, 'F. Day-to-day').v, capI = fbRow(A5, 'Capital investments in Budget 2026').v;
  const def5 = fbRow(FB.defence, 'Cash basis').v, defPct = fbRow(FB.defence, 'GDP percentage').raw;
  const m5 = meas.slice(1).reduce((a, b) => a + (b || 0), 0);
  const hero = `<section class="el-cr fb-hero span-12">
    <div class="el-cr-top"><div><div class="el-cr-kicker">Government of Canada · tabled ${esc(elDayFB(FB.tabled))}</div><h2 class="el-cr-title">${esc(FB.title)}</h2>
      <div class="el-cr-sub">${esc(FB.tabled_by)} · figures for 2026–27 unless noted · every number links back to the budget's own tables</div></div>
      <div class="el-cr-count"><div class="el-cr-kicker">Deficit, 2026–27</div><div class="el-cr-days">${fbB(bal[Y])}</div><div class="el-cr-sub">${fmt(Math.abs(balPct[Y]), 1)}% of GDP</div></div></div>
    <div class="el-cr-kpis">
      <div class="el-kpi"><div class="el-kpi-l">Revenue</div><div class="el-kpi-n">${fbB(rev[Y])}</div><div class="el-hero-sub">${fbB(rev[Y] - rev[0], true)} on 2025–26</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Spending</div><div class="el-kpi-n">${fbB(exp[Y])}</div><div class="el-hero-sub">${fbB(exp[Y] - exp[0], true)} on 2025–26</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Interest on the debt</div><div class="el-kpi-n">${fbB(pdc[Y])}</div><div class="el-hero-sub">${fmt(pdc[Y] / exp[Y] * 100, 1)}% of spending; ${fbB(pdc[5])} by 2030–31</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Federal debt</div><div class="el-kpi-n">${fbB(debt[Y])}</div><div class="el-hero-sub">${fmt(debtPct[Y], 1)}% of GDP</div></div>
      <div class="el-kpi"><div class="el-kpi-l">New measures, 5 years</div><div class="el-kpi-n">${fbB(-m5)}</div><div class="el-hero-sub">net cost of Budget 2026 measures, 2026–27 to 2030–31</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Defence (cash)</div><div class="el-kpi-n">${fbM(def5[0])}</div><div class="el-hero-sub">${esc(defPct[0])} of GDP in 2026–27, ${esc(defPct[1])} from 2027–28</div></div>
    </div></section>`;
  const deficit = fbColumns(cols, [{ name: 'Spring Economic Update 2026', color: '#94A3B8', v: seu }, { name: 'Budget 2026', color: '#0369A1', v: bal }], v => fbB(v));
  const opc = fbColumns(cols, [{ name: 'Day-to-day operating balance', color: '#047857', v: op }], v => fbB(v), 170);
  const capc = fbColumns(cols, [{ name: 'Capital investment', color: '#B45309', v: capI }], v => fbB(v), 170);
  // revenue and spending, 2026-27
  const rv = ['Personal income tax', 'Corporate income tax', 'Goods and Services Tax', 'Employment Insurance premium revenues', 'Non-resident income tax', 'Customs import duties', 'Other excise taxes/duties', 'Enterprise Crown corporations', 'Other programs', 'Net foreign exchange']
    .map(l => { const r = fbRow(A9, l); return r ? { label: r.label.replace(' revenues', '').replace('Net foreign exchange revenues and return on investments', 'Foreign exchange and investments'), v: r.v[Y] } : null; }).filter(Boolean).sort((a, b) => b.v - a.v);
  const ex = ['Old Age Security', 'Employment Insurance benefits', 'Canada Child Benefit', 'Canada Health Transfer', 'Canada Social Transfer', 'Equalization', 'Territorial Formula Financing', 'Health agreements', 'Canada-wide early learning', 'Build Communities Strong Fund', 'Other transfer payments', 'Other direct program expenses', 'Public debt charges']
    .map(l => { const r = fbRow(A10, l); return r ? { label: r.label.replace(' program', '').replace(' with provinces and territories', ' (provinces)'), v: r.v[Y] } : null; }).filter(Boolean).sort((a, b) => b.v - a.v);
  // measures by chapter
  const ch = FB.chapters.map(c => ({ label: `${c.n}. ${c.name}`, v: c.net[5], sub: `${fbM(c.net[0])} in 2026–27` }));
  const strat = `<div class="fb-strats">${FB.strategies.map(s => `<div class="fb-strat"><div class="fb-strat-n">${esc(s.amount.replace('*', '') || '—')}</div><div class="fb-strat-t">${esc(s.name)}</div><ul>${s.lines.slice(0, 5).map(l => `<li>${esc(l)}</li>`).join('')}</ul></div>`).join('')}</div>`;
  const econ = FB.fiscal['Table A1.2'], er = [];
  (econ.rows || []).forEach((r, k) => { if (r.head && /^(Real GDP growth$|GDP inflation|Nominal GDP growth|Unemployment rate|Consumer Price Index|3-month|10-year|Exchange rate|West Texas)/.test(r.label)) { const b = econ.rows.slice(k + 1).find(x => x.v && x.label === 'Budget 2026'); if (b) er.push({ label: r.label, raw: b.raw }); } });
  const econT = er.length ? `<div class="table-wrap"><table class="data"><thead><tr><th scope="col">Private sector average</th>${econ.cols.map(c => `<th scope="col" class="num">${esc(c)}</th>`).join('')}</tr></thead><tbody>${er.map(r => `<tr><th scope="row">${esc(r.label)}</th>${r.raw.map(x => `<td class="num">${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
  return `${hero}
    <section class="card span-6"><div class="card-head"><div><h2>Deficit path</h2><p class="card-sub">Budgetary balance, $ billions: Budget 2026 against the Spring Economic Update 2026</p></div></div>${deficit}<p class="card-note">Source: Budget 2026, Annex 1, Table A1.8, and the overview's Table 1.</p></section>
    <section class="card span-6"><div class="card-head"><div><h2>Two lines the budget is judged on</h2><p class="card-sub">Its fiscal anchors: day-to-day spending covered by revenue, and capital investment</p></div></div>${opc}${capc}<p class="card-note">Day-to-day operating balance (Table A1.6) and capital investment (Table A1.5), $ billions.</p></section>
    <section class="card span-6"><div class="card-head"><div><h2>Where the money comes from</h2><p class="card-sub">Revenue, 2026–27, $ billions</p></div></div>${fbBars(rv, v => fbB(v))}<p class="card-note">Table A1.9. Total ${fbB(rev[Y])}.</p></section>
    <section class="card span-6"><div class="card-head"><div><h2>Where it goes</h2><p class="card-sub">Spending, 2026–27, $ billions</p></div></div>${fbBars(ex, v => fbB(v))}<p class="card-note">Table A1.10. Other fiscal arrangements (a ${fbB(fbRow(A10, 'Other fiscal arrangements').v[Y])} recovery) not shown.</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>New measures by chapter</h2><p class="card-sub">Net cost over five years, 2026–27 to 2030–31. Open "Every measure" for the line items.</p></div></div>${fbBars(ch, v => fbM(v))}</section>
    <section class="card span-12"><div class="card-head"><div><h2>The national strategies</h2><p class="card-sub">Over $140 billion across strategies set out in the Budget in brief (cash basis)</p></div></div>${strat}</section>
    ${econT ? `<section class="card span-12"><div class="card-head"><div><h2>The economy the budget assumes</h2><p class="card-sub">Average of private sector forecasts surveyed for Budget 2026, % unless noted (Table A1.2)</p></div></div>${econT}</section>` : ''}`;
}
const elDayFB = d => (typeof dmy === 'function' ? dmy(d) : d) || '';

// ---- Province by province
function fbProvTransfers(p) {
  const t = p.transfers; if (!t) return '';
  const Y = t.years.length - 1, tot = t.rows.find(r => r.label.startsWith('Total')), pc = t.rows.find(r => r.label.startsWith('Per Capita'));
  const parts = t.rows.filter(r => !r.label.startsWith('Total') && !r.label.startsWith('Per Capita') && (r.v[Y] || 0) !== 0);
  const kp = `<div class="fb-kpis">${[[`Federal transfers, ${fbYr(t.years[Y])}`, fbM(tot.v[Y]), `${fbM(tot.v[Y] - tot.v[Y - 1], true)} on the year before`],
    ['Per person', `$${fmt(pc.v[Y])}`, `Canada: $${fmt(fbRow(FB.transfers_canada, 'Per Capita').v[Y])}`],
    ...parts.map(r => [r.label, fbM(r.v[Y]), `${fmt((r.v[Y] / tot.v[Y]) * 100, 0)}% of the total`])].map(([l, n, s]) => `<div class="fb-kpi"><div class="fb-kpi-l">${esc(l)}</div><div class="fb-kpi-n">${esc(n)}</div><div class="fb-kpi-s">${esc(s)}</div></div>`).join('')}</div>`;
  const ten = fbColumns(t.years, [{ name: 'Major transfers', color: '#0369A1', v: tot.v }], v => fbM(v), 170);
  return `${kp}<h3 class="fb-h3">Ten years of major transfers</h3>${ten}<p class="card-note">Canada Health Transfer, Canada Social Transfer, Equalization${p.code === 'NS' ? ', offshore offsets' : ''}${['YT', 'NT', 'NU'].includes(p.code) ? ', Territorial Formula Financing' : ''}, $ millions. ${esc(t.note)} Source: Finance Canada, Federal Support to Provinces and Territories.</p>`;
}
function fbMentions(ms, max = 60) {
  if (!ms.length) return '<p class="muted">No other passage in the budget names this province or its cities.</p>';
  return `<ol class="fb-mentions">${ms.slice(0, max).map(m => `<li><div class="fb-m-src"><a href="${esc(fbDoc(m.doc).url)}" target="_blank" rel="noopener">${esc(fbDoc(m.doc).name)}</a>${m.topic && /^[A-Z0-9]/.test(m.topic) ? ` · ${esc(m.topic)}` : ''}${(m.money || []).map(x => ' ' + fbPill(x, 'money')).join('')}</div><p>${esc(m.text)}</p></li>`).join('')}</ol>`;
}
const fbList = (title, items, note) => items && items.length ? `<div class="fb-listcard"><h3 class="fb-h3">${esc(title)} <small>${items.length}</small></h3><ul>${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>${note ? `<p class="card-note">${esc(note)}</p>` : ''}</div>` : '';

// ---- federal revenue collected and spending in each province (Statistics Canada; the budget gives Canada only)
function fbAccounts(code, full) {
  const BP = FB.by_province; if (!BP) return '';
  const ys = BP.years, Y = ys[ys.length - 1], all = BP.by_year[Y], x = all[code]; if (!x) return '';
  const est = ((BP.estimate_2026_27 || {}).by || {})[code], L = BP.labels;
  const pp = v => isNum(v) ? `${v < 0 ? '−' : ''}$${fmt(Math.abs(v))}` : '–';
  const bal = x.balance, more = bal >= 0;
  const kp = `<div class="fb-kpis">${[[`Federal revenue collected, ${Y}`, fbM(x.revenue), `${fmt((x.share_of_revenue || 0) * 100, 1)}% of all federal revenue`],
    [`Federal spending there, ${Y}`, fbM(x.spending), `${pp(x.spending_per_person)} per person`],
    ['Collected minus spent', fbM(bal, true), `${pp(x.balance_per_person)} per person · ${more ? 'more collected than spent' : 'more spent than collected'}`],
    ['2026–27 revenue (estimate)', isNum(est) ? fbB(est) : '–', `Budget 2026's $${fmt(BP.estimate_2026_27.national_revenue_billions, 1)}B shared by ${Y} shares`]]
    .map(([l, n, s]) => `<div class="fb-kpi"><div class="fb-kpi-l">${esc(l)}</div><div class="fb-kpi-n">${esc(n)}</div><div class="fb-kpi-s">${esc(s)}</div></div>`).join('')}</div>`;
  const rev = L.rev.map(([k, l]) => ({ label: l, v: x.rev[k] })).filter(r => isNum(r.v) && r.v !== 0).sort((a, b) => b.v - a.v);
  const sp = L.spend.filter(([k]) => !['defence', 'oas', 'ei_benefits', 'ccb', 'cht', 'cst'].includes(k)).map(([k, l]) => ({ label: l, v: x.spend[k],
    sub: k === 'to_households' ? `OAS ${fbM(x.spend.oas)} · EI ${fbM(x.spend.ei_benefits)} · Canada Child Benefit ${fbM(x.spend.ccb)}` : k === 'to_provinces' ? `Canada Health Transfer ${fbM(x.spend.cht)} · Canada Social Transfer ${fbM(x.spend.cst)}` : k === 'goods_services' ? `defence ${fbM(x.spend.defence)}` : '' }))
    .filter(r => isNum(r.v) && r.v !== 0).sort((a, b) => b.v - a.v);
  const trend = fbColumns(ys, [{ name: 'Revenue collected', color: '#0369A1', v: ys.map(y => (BP.by_year[y][code] || {}).revenue) }, { name: 'Spending there', color: '#B45309', v: ys.map(y => (BP.by_year[y][code] || {}).spending) }], v => fbM(v), 190);
  const one = `<section class="card span-12"><div class="card-head"><div><h2>Federal revenue and spending in ${esc(x.name)}</h2><p class="card-sub">The budget gives revenue for Canada only. Statistics Canada splits federal revenue and spending by province every year: this is ${esc(Y)}, the latest.</p></div></div>
    ${kp}<div class="ea-two"><div><h3 class="fb-h3">Where the revenue comes from <small>${esc(Y)}</small></h3>${fbBars(rev, v => fbM(v))}</div><div><h3 class="fb-h3">What is spent there <small>${esc(Y)}</small></h3>${fbBars(sp, v => fbM(v))}</div></div>
    <h3 class="fb-h3">${ys.length} years</h3>${trend}</section>`;
  if (!full) return one;
  const order = Object.entries(all).filter(([c]) => c !== 'CA').sort((a, b) => (b[1].balance || 0) - (a[1].balance || 0));
  const table = `<div class="table-wrap sr-wrap"><table class="data"><thead><tr><th scope="col">Province or territory</th><th class="num" scope="col">Revenue collected</th><th class="num" scope="col">Share</th><th class="num" scope="col">Spending there</th><th class="num" scope="col">Collected minus spent</th><th class="num" scope="col">Per person</th><th class="num" scope="col">2026–27 revenue (estimate)</th></tr></thead>
    <tbody>${order.map(([c, r]) => `<tr class="${c === code ? 'sr-cal' : ''}"><th scope="row">${esc(r.name)}</th><td class="num">${fbM(r.revenue)}</td><td class="num">${fmt((r.share_of_revenue || 0) * 100, 1)}%</td><td class="num">${fbM(r.spending)}</td><td class="num">${fbM(r.balance, true)}</td><td class="num">${pp(r.balance_per_person)}</td><td class="num">${isNum((BP.estimate_2026_27.by || {})[c]) ? fbB(BP.estimate_2026_27.by[c]) : '–'}</td></tr>`).join('')}
    <tr><th scope="row">Canada</th><td class="num">${fbM(all.CA.revenue)}</td><td class="num">100%</td><td class="num">${fbM(all.CA.spending)}</td><td class="num">${fbM(all.CA.balance, true)}</td><td class="num">${pp(all.CA.balance_per_person)}</td><td class="num">${fbB(BP.estimate_2026_27.national_revenue_billions)}</td></tr></tbody></table></div>`;
  return one + `<section class="card span-12"><div class="card-head"><div><h2>Every province and territory, ${esc(Y)}</h2><p class="card-sub">Federal revenue collected in each, federal spending there, and the difference per resident</p></div></div>
    ${fbBars(order.filter(([c]) => c !== 'XX').sort((a, b) => (b[1].balance_per_person || 0) - (a[1].balance_per_person || 0)).map(([c, r]) => ({ label: r.name, v: r.balance_per_person, on: c === code, sub: `${fbM(r.revenue)} collected · ${fbM(r.spending)} spent` })), v => pp(v))}
    ${table}<p class="card-note">${esc(BP.how)} ${esc((BP.estimate_2026_27 || {}).how || '')} Source: <a href="${esc(BP.source.url)}" target="_blank" rel="noopener">${esc(BP.source.publisher)}, ${esc(BP.source.title)}</a>; population: <a href="${esc(BP.source.population)}" target="_blank" rel="noopener">table 17-10-0009-01</a>.</p></section>`;
}
function fbProvinces() {
  const P = Object.fromEntries(FB.provinces.map(p => [p.code, p])), p = P[fbProv] || P.AB;
  const Y = p.transfers ? p.transfers.years.length - 1 : 0;
  const tiles = `<div class="fb-ptiles" role="tablist" aria-label="Province or territory">${FB_PROV_ORDER.map(c => { const q = P[c]; const t = q.transfers; const tot = t ? t.rows.find(r => r.label.startsWith('Total')).v[Y] : null;
    return `<button type="button" role="tab" class="fb-ptile${c === p.code ? ' is-on' : ''}" data-fbprov="${c}" aria-selected="${c === p.code}"><b>${esc(c)}</b><span>${esc(q.name)}</span><small>${fbM(tot)} · ${q.mentions.length + q.major_projects.length + q.communities_fund.length} items</small></button>`; }).join('')}</div>`;
  const pcRows = FB_PROV_ORDER.map(c => { const t = P[c].transfers; return { label: P[c].name, v: t ? t.rows.find(r => r.label.startsWith('Per Capita')).v[Y] : 0, on: c === p.code }; }).sort((a, b) => b.v - a.v);
  const totRows = FB_PROV_ORDER.map(c => { const t = P[c].transfers; return { label: P[c].name, v: t ? t.rows.find(r => r.label.startsWith('Total')).v[Y] : 0, on: c === p.code }; }).sort((a, b) => b.v - a.v);
  const def = (p.defence || []).filter(d => d.items.length);
  const named = (p.major_projects || []).length + (p.communities_fund || []).length + (p.festivals || []).length + def.reduce((a, d) => a + d.items.length, 0);
  return `<section class="card span-12"><div class="card-head"><div><h2>Pick a province or territory</h2><p class="card-sub">Everything the budget names in each one, and the federal transfers it receives</p></div></div>${tiles}</section>
    <section class="el-cr fb-hero span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Budget 2026 · province by province</div><h2 class="el-cr-title">${esc(p.name)}</h2><div class="el-cr-sub">${named} projects and investments named · ${p.mentions.length} passages of the budget mention it</div></div></div></section>
    ${fbAccounts(p.code, true)}
    <section class="card span-7"><div class="card-head"><div><h2>Federal transfers</h2><p class="card-sub">Major transfers to ${esc(p.name)}</p></div></div>${fbProvTransfers(p)}</section>
    <section class="card span-5"><div class="card-head"><div><h2>Transfers per person</h2><p class="card-sub">${esc(fbYr(p.transfers.years[Y]))}, dollars per resident</p></div></div>${fbBars(pcRows, v => '$' + fmt(v))}<p class="card-note">Equalization goes to provinces with less capacity to raise revenue, so per-person amounts differ widely.</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>Named in the budget</h2><p class="card-sub">Projects and investments the budget lists for ${esc(p.name)}</p></div></div><div class="fb-lists">
      ${fbList('Major projects (Major Projects Office)', p.major_projects, 'Projects referred to the Major Projects Office, from the Budget in brief.')}
      ${fbList('Build Communities Strong Fund projects', p.communities_fund, 'Projects the budget proposes to support, Chapter 3.')}
      ${def.map(d => fbList(`Defence investments: ${d.region}`, d.items, d.region === p.name ? 'Figure 5.1, Chapter 5.' : d.region === 'Multi-regional' ? 'Figure 5.1, Chapter 5, among the investments spanning several regions.' : `Figure 5.1, Chapter 5, listed for the ${d.region} region.`)).join('')}
      ${fbList('Festivals funded in 2026', p.festivals, 'Could receive more in 2027–28, subject to application (Figure 4.1).')}
      ${named ? '' : '<p class="muted">The budget\'s lists name no projects here; see the passages below.</p>'}</div></section>
    <section class="card span-12"><div class="card-head"><div><h2>Every passage that mentions ${esc(p.name)}</h2><p class="card-sub">The budget's own words, with the dollar figures in each passage</p></div></div>${fbMentions(p.mentions)}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Transfers across Canada</h2><p class="card-sub">Major transfers, ${esc(fbYr(p.transfers.years[Y]))}</p></div></div>${fbBars(totRows, v => fbM(v))}</section>`;
}

// ---- Calgary and Alberta
function fbCalgary() {
  const AB = FB.provinces.find(p => p.code === 'AB'), C3 = FB.chapters.find(c => c.n === 3), s31 = C3.sections.find(s => s.id === '3.1');
  const hh = (s31 ? s31.items : []).filter(i => !i.name.startsWith('Realignment')).map(i => ({ ...i, chap: 3, sec: '3.1 Delivering a boost today', url: C3.url }));
  const cal = [].concat(AB.communities_fund.filter(x => /Calgary/.test(x)).map(x => ({ t: x, src: 'Build Communities Strong Fund, Chapter 3' })),
    FB.calgary.map(m => ({ t: m.text, src: fbDoc(m.doc).name })));
  const t = AB.transfers, Y = t.years.length - 1, tot = t.rows.find(r => r.label.startsWith('Total'));
  return `<section class="el-cr fb-hero span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Budget 2026 · closer to home</div><h2 class="el-cr-title">Calgary and Alberta</h2><div class="el-cr-sub">What the federal budget names here, and the national measures every Calgary household can see</div></div>
    <div class="el-cr-count"><div class="el-cr-kicker">Major transfers to Alberta, ${esc(fbYr(t.years[Y]))}</div><div class="el-cr-days">${fbM(tot.v[Y])}</div><div class="el-cr-sub">$${fmt(t.rows.find(r => r.label.startsWith('Per Capita')).v[Y])} per Albertan</div></div></div></section>
    ${fbAccounts('AB', false)}
    <section class="card span-6"><div class="card-head"><div><h2>Named for Calgary</h2><p class="card-sub">Places in Calgary the budget names</p></div></div><ul class="fb-cal">${cal.map(x => `<li><p>${esc(x.t)}</p><small>${esc(x.src)}</small></li>`).join('')}</ul></section>
    <section class="card span-6"><div class="card-head"><div><h2>Named for Alberta</h2><p class="card-sub">Major projects, community projects and defence work</p></div></div><div class="fb-lists one">${fbList('Major projects', AB.major_projects)}${fbList('Build Communities Strong Fund', AB.communities_fund)}${(AB.defence || []).filter(d => d.items.length).map(d => fbList(`Defence: ${d.region}`, d.items)).join('')}${fbList('Festivals funded in 2026', AB.festivals)}</div></section>
    <section class="card span-12"><div class="card-head"><div><h2>For households everywhere, Calgary included</h2><p class="card-sub">Chapter 3.1, "Delivering a boost today": the measures that reach people directly</p></div></div>${fbMeasureTable(hh, true)}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Alberta in the budget's words</h2><p class="card-sub">${AB.mentions.length} passages</p></div></div>${fbMentions(AB.mentions)}</section>`;
}

// ---- Every measure
function fbAllItems() {
  const out = [];
  FB.chapters.forEach(c => c.sections.forEach(s => s.items.forEach(i => out.push({ ...i, chap: c.n, chapName: c.name, sec: s.id === 'add' ? 'Additional investments' : `${s.id} ${s.name}`, url: c.url }))));
  return out;
}
function fbMeasureRow(i, k, detail) {
  const id = `${i.chap}|${i.name}`, open = fbOpen.has(id) || detail;
  const txt = (i.text || []).map(x => `<p>${esc(x.text)}</p>`).join('') || (i.desc ? `<p>${esc(i.desc)}</p>` : '');
  const less = (i.less || []).map(l => `<div class="fb-less">Less: ${esc(l.name)} ${l.v.slice(0, 5).map(v => `<span>${fbM(v)}</span>`).join(' ')}</div>`).join('');
  return `<tr class="fb-mrow${open ? ' is-open' : ''}" data-fbm="${esc(id)}"><th scope="row"><button type="button" class="fb-mbtn" aria-expanded="${open}">${esc(i.name)}</button>${i.capital ? fbPill('capital', 'cap') : ''}<small>${esc(i.sec)}</small></th>
    ${i.v.slice(0, 5).map(v => `<td class="num">${fbM(v)}</td>`).join('')}<td class="num fb-tot">${fbM(i.v[5])}</td></tr>
    ${open && (txt || less) ? `<tr class="fb-mtext"><td colspan="7">${less}${txt}<a href="${esc(i.url)}" target="_blank" rel="noopener">Read it in Chapter ${i.chap}</a></td></tr>` : ''}`;
}
function fbMeasureTable(items, detail) {
  return `<div class="table-wrap"><table class="data fb-mtable"><thead><tr><th scope="col">Measure ($ millions)</th>${['2026–27', '2027–28', '2028–29', '2029–30', '2030–31'].map(c => `<th scope="col" class="num">${c}</th>`).join('')}<th scope="col" class="num">5 years</th></tr></thead>
    <tbody>${items.map((i, k) => fbMeasureRow(i, k, detail)).join('')}</tbody></table></div>`;
}
function fbMeasures() {
  let it = fbAllItems();
  const q = fbQ.trim().toLowerCase();
  if (fbChap) it = it.filter(i => i.chap === fbChap);
  if (q) it = it.filter(i => (i.name + ' ' + i.sec + ' ' + (i.desc || '') + ' ' + (i.text || []).map(x => x.text).join(' ')).toLowerCase().includes(q));
  if (fbSort === 'size') it.sort((a, b) => Math.abs(b.v[5] || 0) - Math.abs(a.v[5] || 0));
  const total = it.reduce((a, i) => a + (i.v[5] || 0) + (i.less || []).reduce((x, l) => x + (l.v[5] || 0), 0), 0);
  const chips = `<div class="chips">${[[0, 'All chapters']].concat(FB.chapters.map(c => [c.n, `${c.n}. ${c.name}`])).map(([n, t]) => `<button type="button" class="chip${fbChap === n ? ' on' : ''}" data-fbchap="${n}"><i style="background:var(--accent)"></i>${esc(t)}</button>`).join('')}</div>`;
  return `<section class="card span-12"><div class="card-head"><div><h2>Every measure in Budget 2026</h2><p class="card-sub">${it.length} line items from the chapter tables. Click a measure to read what the budget says about it.</p></div></div>
    <div class="fb-tools"><input type="search" id="fb-q" placeholder="Search measures and their text: housing, child care, defence, Alberta…" value="${esc(fbQ)}" aria-label="Search measures">
      <div class="seg small" role="radiogroup" aria-label="Order">${[['size', 'Largest first'], ['book', 'Budget order']].map(([k, t]) => `<button type="button" role="radio" aria-checked="${fbSort === k}" data-fbsort="${k}">${t}</button>`).join('')}</div></div>
    ${chips}<p class="fb-sum">${it.length} measures · net ${fbM(total)} over five years${q ? ` matching "${esc(fbQ)}"` : ''}</p>${fbMeasureTable(it)}
    <p class="card-note">Amounts are the budget's chapter tables, $ millions, accrual basis; a negative amount is a saving or new revenue. "Less" lines (funds from existing budgets, projected revenue) are shown under their measure. Measures marked capital include capital investment.</p></section>`;
}

// ---- Tax changes and fiscal tables
function fbTable(t, unit) {
  return `<div class="table-wrap"><table class="data fb-ftable"><thead><tr><th scope="col">${esc(unit || '')}</th>${(t.cols || []).map(c => `<th scope="col" class="num">${esc(fbYr(c))}</th>`).join('')}</tr></thead><tbody>
    ${t.rows.map(r => r.head ? `<tr class="fb-head"><th colspan="${(t.cols || []).length + 1}">${esc(r.label)}</th></tr>` : `<tr${/^Total|^Budgetary balance$|Total budgetary/.test(r.label) ? ' class="fb-total"' : ''}><th scope="row">${esc(r.label)}</th>${r.raw.map(x => `<td class="num">${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${t.note ? `<p class="card-note">${esc(t.note)}</p>` : ''}`;
}
function fbTax() {
  const t = FB.tax_measures;
  return `<section class="card span-12"><div class="card-head"><div><h2>Tax changes</h2><p class="card-sub">Revenue impact of the proposed tax measures, $ millions. A positive amount is less revenue for Ottawa (a tax cut or credit); negative is more.</p></div></div>${fbTable(t, '$ millions')}<p class="card-note">Source: <a href="${esc(t.source)}" target="_blank" rel="noopener">Tax measures: supplementary information</a>, Table 1.</p></section>`;
}
function fbTables() {
  const F = FB.fiscal, T = [['Table A1.8', 'Summary statement of transactions', '$ billions'], ['Table A1.9', 'The revenue outlook', '$ billions'], ['Table A1.10', 'The expense outlook', '$ billions'],
    ['Table A1.6', 'Day-to-day operating balance', '$ billions'], ['Table A1.5', 'Capital investments', '$ billions'], ['Table A1.11', 'Borrowing needs', '$ billions']];
  return T.map(([k, n, u]) => F[k] ? `<section class="card span-12"><div class="card-head"><div><h2>${esc(n)}</h2><p class="card-sub">${esc(F[k].caption)}</p></div></div>${fbTable(F[k], u)}</section>` : '').join('')
    + `<section class="card span-12"><div class="card-head"><div><h2>How the deficit changed since spring</h2><p class="card-sub">${esc(FB.overview.caption)}</p></div></div>${fbTable(FB.overview, '$ billions')}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Core defence spending</h2><p class="card-sub">${esc(FB.defence.caption)}</p></div></div>${fbTable(FB.defence, '$ millions')}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Major transfers, all provinces and territories</h2><p class="card-sub">Finance Canada, $ millions</p></div></div>${fbTable({ cols: FB.transfers_canada.years, rows: FB.transfers_canada.rows.map(r => ({ label: r.label, raw: r.v.map(v => isNum(v) ? fmt(v) : '–') })), note: FB.transfers_canada.note }, '$ millions')}</section>`;
}

async function renderFedBudget() {
  const body = $('#fb-body'); if (!body) return;
  if (!FB) body.innerHTML = '<section class="card span-12"><p class="muted">Reading the federal budget…</p></section>';
  await loadFedBudget();
  if (!FB) { body.innerHTML = '<section class="card span-12"><p>The federal budget could not be read just now. Try again in a minute.</p></section>'; return; }
  const page = { overview: fbOverview, provinces: fbProvinces, calgary: fbCalgary, measures: fbMeasures, tax: fbTax, tables: fbTables }[fbSub] || fbOverview;
  body.innerHTML = `<nav class="el-subtabs span-12" aria-label="Federal budget sections">${FB_SUBS.map(([k, t]) => `<button type="button" class="el-subtab${k === fbSub ? ' is-on' : ''}" data-fbsub="${k}" ${k === fbSub ? 'aria-current="page"' : ''}>${esc(t)}</button>`).join('')}</nav>
    ${page()}
    <section class="card span-12"><p class="card-note">From the official <a href="${esc(FB.source)}" target="_blank" rel="noopener">Budget 2026</a> documents, tabled ${esc(elDayFB(FB.tabled))}, and Finance Canada's <a href="${esc(FB.transfers_source)}" target="_blank" rel="noopener">Federal Support to Provinces and Territories</a>. Projections are the government's own. Facts only: nothing here rates the budget or recommends anything. <button type="button" class="link-btn small" data-method="fedbudget">How this is read</button></p></section>`;
  const re = () => { const y = window.scrollY; renderFedBudget().then(() => window.scrollTo(0, y)); };
  body.querySelectorAll('[data-fbsub]').forEach(b => b.addEventListener('click', () => { fbSub = b.dataset.fbsub; renderFedBudget(); }));
  body.querySelectorAll('[data-fbprov]').forEach(b => b.addEventListener('click', () => { fbProv = b.dataset.fbprov; re(); }));
  body.querySelectorAll('[data-fbchap]').forEach(b => b.addEventListener('click', () => { fbChap = +b.dataset.fbchap; re(); }));
  body.querySelectorAll('[data-fbsort]').forEach(b => b.addEventListener('click', () => { fbSort = b.dataset.fbsort; re(); }));
  body.querySelectorAll('.fb-mbtn').forEach(b => b.addEventListener('click', () => { const id = b.closest('tr').dataset.fbm; fbOpen.has(id) ? fbOpen.delete(id) : fbOpen.add(id); re(); }));
  const q = $('#fb-q');
  if (q) { let t; q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { fbQ = q.value; const pos = q.selectionStart; renderFedBudget().then(() => { const n = $('#fb-q'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }); }, 250); }); }
}
window.renderFedBudget = renderFedBudget;

;
// ---- safety.js
/* Calgary Insight: Canada's safest cities by Statistics Canada's Crime Severity Index, Calgary picked out, this year
   and last. safety_rank.py builds the figures; methods.py (topic "safest_cities") explains them. */
'use strict';

let SR = null, srQ = '', srProv = '';
async function loadSafety() {
  if (SR) return SR;
  try { const r = await (await api()).get_safety_rank(); if (r && r.ok && r.data) SR = r.data; } catch (e) { /* shown below */ }
  return SR;
}
const srIs = (x, c) => !!(x && c && x.name === c.name && x.prov === c.prov);
const srN = (v, d = 1) => isNum(v) ? fmt(v, d) : '–';
function srMove(c) {
  if (!isNum(c.rank_prev)) return '<span class="sr-mv">new</span>';
  const m = c.rank_prev - c.rank;
  return m === 0 ? '<span class="sr-mv">same</span>' : `<span class="sr-mv ${m > 0 ? 'up' : 'down'}" title="${m > 0 ? 'Up' : 'Down'} ${Math.abs(m)} places from #${c.rank_prev}">${m > 0 ? '▲' : '▼'} ${Math.abs(m)}</span>`;
}
function srRow(c, cal) {
  return `<tr class="${cal ? 'sr-cal' : ''}"><td class="num"><b>${c.rank}</b></td><td>${srMove(c)}</td><th scope="row">${esc(c.name)}</th><td>${esc(c.prov)}</td><td>${esc(c.police)}</td><td class="num">${fmt(c.population)}</td>
    <td class="sr-barcell"><span class="sr-bar"><i style="width:${Math.min(100, (c.csi || 0) / 200 * 100)}%"></i></span><b>${srN(c.csi)}</b></td><td class="num">${srN(c.csi_prev)}</td><td class="num">${isNum(c.rank_prev) ? '#' + c.rank_prev : '–'}</td><td class="num">${srN(c.violent)}</td></tr>`;
}
function srTable(rows, cal) {
  return `<div class="table-wrap sr-wrap"><table class="data sr-table"><thead><tr><th scope="col" class="num">Rank</th><th scope="col">Since last year</th><th scope="col">City</th><th scope="col">Prov.</th><th scope="col">Policed by</th><th scope="col" class="num">Population</th><th scope="col">Crime Severity Index</th><th scope="col" class="num">Last year's index</th><th scope="col" class="num">Last year's rank</th><th scope="col" class="num">Violent index</th></tr></thead>
    <tbody>${rows.map(x => srRow(x, srIs(x, cal))).join('')}${cal && cal.rank && !rows.some(x => srIs(x, cal)) ? `<tr class="sr-gap"><td colspan="10">…</td></tr>${srRow(cal, true)}` : ''}</tbody></table></div>`;
}

async function renderSafety() {
  const body = $('#sr-body'); if (!body) return;
  if (!SR) body.innerHTML = '<section class="card span-12"><p class="muted">Reading the ranking…</p></section>';
  await loadSafety();
  if (!SR) { body.innerHTML = '<section class="card span-12"><p>The ranking is not on the website yet. It appears after the next refresh.</p></section>'; return; }
  const d = SR, c = d.calgary || {}, m = d.calgary_cma || {};
  const chg = isNum(c.csi) && isNum(c.csi_prev) && c.csi_prev ? (c.csi - c.csi_prev) / c.csi_prev * 100 : null;
  const better = (d.cities || []).filter(x => isNum(x.csi) && isNum(x.csi_prev) && x.csi_prev && (x.csi - x.csi_prev) / x.csi_prev * 100 < (chg || 0)).length;
  const moved = isNum(c.rank_prev) ? c.rank_prev - c.rank : null;
  const why = isNum(moved) && isNum(chg) ? (moved < 0 && chg < 0 ? `Calgary's index fell ${fmt(Math.abs(chg), 1)}%, but ${fmt(better)} cities fell faster, so it moved down ${Math.abs(moved)} places.`
    : moved > 0 && chg > 0 ? `Calgary's index rose ${fmt(chg, 1)}%, but less than in other cities, so it moved up ${moved} places.`
    : moved === 0 ? `Calgary held its place; its index ${chg < 0 ? 'fell' : 'rose'} ${fmt(Math.abs(chg), 1)}%.`
    : `Calgary's index ${chg < 0 ? 'fell' : 'rose'} ${fmt(Math.abs(chg), 1)}% and it moved ${moved > 0 ? 'up' : 'down'} ${Math.abs(moved)} places.`) : '';
  const large = (d.cities || []).filter(x => x.rank_large).sort((a, b) => a.rank_large - b.rank_large);
  const hero = `<section class="el-cr span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Statistics Canada · Crime Severity Index ${d.year}</div><h2 class="el-cr-title">Canada's safest cities</h2>
      <div class="el-cr-sub">Every city of ${fmt(d.min_population)} people or more, by police-reported crime weighted by how serious it is. Lower is safer. ${d.year} against ${d.prev_year}.</div></div></div>
    <div class="el-cr-kpis">
      <div class="el-kpi"><div class="el-kpi-l">Calgary among ${fmt(d.cities_ranked)} cities</div><div class="el-kpi-n">#${c.rank || '–'}</div><div class="el-hero-sub">${d.prev_year}: #${c.rank_prev || '–'} of ${fmt(d.cities_ranked_prev)}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Among ${fmt(d.large_ranked)} cities of 100,000+</div><div class="el-kpi-n">#${c.rank_large || '–'}</div><div class="el-hero-sub">${d.prev_year}: #${c.rank_large_prev || '–'}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Calgary's index</div><div class="el-kpi-n">${srN(c.csi)}</div><div class="el-hero-sub">${d.prev_year}: ${srN(c.csi_prev)} (${isNum(chg) ? (chg > 0 ? '+' : '') + fmt(chg, 1) + '%' : '–'})</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Violent crime index</div><div class="el-kpi-n">${srN(c.violent)}</div><div class="el-hero-sub">${d.prev_year}: ${srN(c.violent_prev)}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Metro area among ${fmt((d.cmas || []).length)}</div><div class="el-kpi-n">#${m.rank || '–'}</div><div class="el-hero-sub">${d.prev_year}: #${m.rank_prev || '–'} · index ${srN(m.csi)}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Canada</div><div class="el-kpi-n">${srN(d.canada)}</div><div class="el-hero-sub">${d.prev_year}: ${srN(d.canada_prev)}</div></div>
    </div></section>`;
  const calCard = `<section class="card span-12 sr-calcard"><div class="card-head"><div><h2>Where Calgary stands</h2><p class="card-sub">${esc(why)} Calgary's police service clears ${srN(c.cleared, 0)}% of crime by weighted clearance rate.</p></div></div>
    ${srTable([c].filter(x => x.rank), c)}</section>`;
  const provs = [...new Set((d.cities || []).map(x => x.prov))].sort();
  const q = srQ.trim().toLowerCase();
  const found = q || srProv ? (d.cities || []).filter(x => (!q || x.name.toLowerCase().includes(q)) && (!srProv || x.prov === srProv)) : null;
  const top = `<section class="card span-12"><div class="card-head"><div><h2>The 50 safest cities, ${d.year}</h2><p class="card-sub">Rank 1 has the lowest Crime Severity Index. Calgary is shown after the list at its own place.</p></div>
      <div class="card-tools sr-tools"><label class="sr-only" for="sr-q">Find a city</label><input id="sr-q" type="search" placeholder="Find any city" value="${esc(srQ)}">
      <label class="sr-only" for="sr-prov">Province</label><select id="sr-prov"><option value="">All provinces</option>${provs.map(p => `<option ${p === srProv ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select></div></div>
    ${found ? `<p class="card-sub">${fmt(found.length)} of ${fmt(d.cities_ranked)} cities</p>${srTable(found, c)}` : srTable(d.top50 || [], c)}</section>`;
  const big = `<section class="card span-6"><div class="card-head"><div><h2>Cities of 100,000 or more</h2><p class="card-sub">Lowest index first; Calgary highlighted</p></div></div>
    ${ecBars(large.map(x => ({ label: `${x.rank_large}. ${x.name}`, sub: `${x.prov} · last year #${x.rank_large_prev || '–'}`, v: x.csi, on: srIs(x, c) })), v => srN(v))}</section>`;
  const cma = `<section class="card span-6"><div class="card-head"><div><h2>Metropolitan areas</h2><p class="card-sub">The city and the towns around it together (census metropolitan areas)</p></div></div>
    ${ecBars((d.cmas || []).map(x => ({ label: `${x.rank}. ${x.name}`, sub: `last year #${x.rank_prev || '–'} · ${srN(x.csi_prev)}`, v: x.csi, on: x.name.startsWith('Calgary') })), v => srN(v))}</section>`;
  body.innerHTML = hero + calCard + top + big + cma
    + `<section class="card span-12"><p class="card-note">${esc(d.how || '')} Sources: ${(d.sources || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher)}: ${esc(s.title)}</a>`).join('; ')}. <button type="button" class="link-btn small" data-method="safest_cities">How this is ranked</button></p></section>`;
  const inp = $('#sr-q');
  if (inp) { let t; inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { srQ = inp.value; const p = inp.selectionStart; renderSafety().then(() => { const n = $('#sr-q'); if (n) { n.focus(); n.setSelectionRange(p, p); } }); }, 250); }); }
  const ps = $('#sr-prov'); if (ps) ps.addEventListener('change', () => { srProv = ps.value; renderSafety(); });
}
window.renderSafety = renderSafety;

;
// ---- visit.js
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
    + `<a class="card span-12 vi-game" href="visit/explore/#beyond"><img src="visit/explore/daytrips/img/img_14_0.jpg" alt="Moraine Lake in Banff National Park" width="640" height="360" loading="lazy"><span class="vi-game-t"><b>Day trips: where can you get in 2 hours?</b><span>Choose a drive time and watch the Rockies, lakes, badlands and World Heritage Sites light up on the dial, each with photos and the route from downtown. Photo: Moraine Lake, public domain (Wikimedia Commons).</span></span><span class="vi-game-go">Open the day-trip dial →</span></a>`
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

;
// ---- infra.js
/* Calgary Insight: Infrastructure condition. Where roads and pipes are wearing out (water main breaks, the age and
   material of the water network, the City's paving plan, its own condition figures) and whether 311 requests about them
   are rising in the same places. infra.py builds the figures; methods.py (topic "infra") explains them. */
'use strict';

let INF = null, infArea = null, infSort = 'signals';
async function loadInfra() {
  if (INF) return INF;
  try { const r = await (await api()).get_infra(); if (r && r.ok && r.data) INF = r.data; } catch (e) { /* shown below */ }
  return INF;
}
const infPct = (a, b) => (isNum(a) && isNum(b) && b > 0 ? (a / b - 1) * 100 : null);
const infChg = v => (isNum(v) ? `${v > 0 ? '+' : ''}${fmt(v, 0)}%` : '–');
function infName(c) { const n = ((INF && INF.names) || {})[c] || c; return n; }

// the communities of the area chosen: all of Calgary, a ward, or one community
function infCodes(city) {
  const comms = ((city && city.communities) || []).filter(c => c.code);
  const a = infArea === null ? (SCOPE ? `w${SCOPE}` : 'all') : infArea;
  if (a.startsWith('w')) return comms.filter(c => c.ward === +a.slice(1));
  if (a.startsWith('c:')) return comms.filter(c => c.code === a.slice(2));
  return comms;
}

// one row per community: condition, 311 and the plan, with the signals that flag it
function infRow(c, today) {
  const b = (INF.by_comm || {})[c.code] || {}, br = b.breaks || {}, mn = b.mains || {}, pv = b.paving || {}, rq = b.req || {};
  const r = k => rq[k] || [0, 0];
  const row = { code: c.code, name: c.name || infName(c.code), residents: c.residents || 0, ward: c.ward,
    br12: br.n12 || 0, brPrev: br.nprev || 0, km: mn.km || 0, medYear: mn.median_year, oldKm: mn.old_km || 0, ciKm: mn.cast_iron_km || 0,
    roads: r('roads'), side: r('sidewalks'), lights: r('lights'), water: r('water'), sewer: r('sewer'),
    paveNext: (pv.next_year || 0) + (pv.this_year || 0), pave5: pv.five_year || 0, paveRecent: pv.recent || 0 };
  row.brRate = row.km ? row.br12 / row.km * 100 : null;
  row.oldShare = row.km ? row.oldKm / row.km : null;
  row.ciShare = row.km ? row.ciKm / row.km : null;
  const up = (x, min, by) => x[0] >= min && x[1] > 0 && x[0] / x[1] - 1 >= by;
  row.flags = [];
  // water: the network wearing out, and water requests rising in the same community
  const wBreaks = row.br12 >= 3 && row.br12 > row.brPrev, wOld = row.km >= 5 && ((row.medYear && today - row.medYear >= 50) || (row.oldShare || 0) >= 0.4);
  const wCast = row.km >= 5 && (row.ciShare || 0) >= 0.25, wReq = up(row.water, 5, 0.15);
  if (wBreaks) row.flags.push(['cond', 'Water main breaks rising']);
  if (wOld) row.flags.push(['cond', 'Ageing water mains']);
  if (wCast) row.flags.push(['cond', 'Much cast iron']);
  if (wReq) row.flags.push(['req', 'Water requests up']);
  // roads: road and pothole requests rising sharply where no paving is planned
  const rReq = up(row.roads, 30, 0.25), noPave = !(row.paveNext + row.pave5);
  if (rReq) row.flags.push(['req', 'Road and pothole requests up']);
  if (rReq && noPave) row.flags.push(['cond', 'No paving planned']);
  if (up(row.side, 10, 0.25)) row.flags.push(['req', 'Sidewalk requests up']);
  if (up(row.lights, 10, 0.25)) row.flags.push(['req', 'Streetlight requests up']);
  row.water = row.water; row.bothWater = (wBreaks || wOld || wCast) && wReq; row.bothRoads = rReq && noPave;
  row.both = row.bothWater || row.bothRoads;
  return row;
}

async function renderInfra() {
  const body = $('#inf-body'); if (!body) return;
  if (!INF) body.innerHTML = '<section class="card span-12"><p class="muted">Reading the infrastructure figures…</p></section>';
  await loadInfra();
  if (!INF) { body.innerHTML = '<section class="card span-12"><p>The infrastructure figures are not on the website yet. They appear after the next refresh.</p></section>'; return; }
  let city = null;
  try { city = SCOPE === 0 && D ? D : await peekView(0); } catch (e) { city = D; }
  const today = +String(INF.today || '').slice(0, 4) || new Date().getFullYear();
  const comms = infCodes(city).filter(c => c.residential !== false);
  const rows = comms.map(c => infRow(c, today));
  const sum = k => rows.reduce((a, r) => a + (typeof k === 'function' ? k(r) : r[k] || 0), 0);
  const ctx = INF.context || {}, pq = ctx.pavement || {};
  const wards = [...new Set(((city && city.communities) || []).map(c => c.ward).filter(Boolean))].sort((a, b) => a - b);
  const a = infArea === null ? (SCOPE ? `w${SCOPE}` : 'all') : infArea;
  const placeName = a === 'all' ? 'Calgary' : a.startsWith('w') ? `Ward ${a.slice(1)}` : infName(a.slice(2));
  const areaSel = `<div class="card-tools sr-tools"><label class="sr-only" for="inf-area">Area</label><select id="inf-area" class="select">
      <option value="all" ${a === 'all' ? 'selected' : ''}>All of Calgary</option>${wards.map(w => `<option value="w${w}" ${a === `w${w}` ? 'selected' : ''}>Ward ${w}</option>`).join('')}
      <optgroup label="One community">${((city && city.communities) || []).filter(c => c.residential).slice().sort((x, y) => x.name.localeCompare(y.name)).map(c => `<option value="c:${c.code}" ${a === `c:${c.code}` ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</optgroup></select></div>`;

  const br12 = sum('br12'), brPrev = sum('brPrev'), km = sum('km'), oldKm = sum('oldKm'), ciKm = sum('ciKm');
  const rd12 = sum(r => r.roads[0]), rdPrev = sum(r => r.roads[1]), wt12 = sum(r => r.water[0]), wtPrev = sum(r => r.water[1]);
  const pave = sum('paveNext') + sum('pave5');
  const hero = `<section class="el-cr span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Infrastructure condition · ${esc(placeName)}</div><h2 class="el-cr-title">Where roads and pipes are wearing out</h2>
      <div class="el-cr-sub">Water main breaks, the age of the water network, the City's paving plan and its own condition figures, set against 311 requests about the same things.</div></div>${areaSel}</div>
    <div class="el-cr-kpis">
      <div class="el-kpi"><div class="el-kpi-l">Calgary's roads in poor condition</div><div class="el-kpi-n">${pq.poor ?? '–'}%</div><div class="el-hero-sub">${pq.good ?? '–'}% good, ${pq.fair ?? '–'}% fair (City, ${esc(pq.as_of || '')})</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Water main breaks, 12 months</div><div class="el-kpi-n">${fmt(br12)}</div><div class="el-hero-sub">${infChg(infPct(br12, brPrev))} on the 12 months before (${fmt(brPrev)})</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Water mains 50 years or older</div><div class="el-kpi-n">${km ? fmt(oldKm / km * 100, 0) : '–'}%</div><div class="el-hero-sub">${fmt(oldKm, 0)} of ${fmt(km, 0)} km</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Cast iron mains</div><div class="el-kpi-n">${km ? fmt(ciKm / km * 100, 0) : '–'}%</div><div class="el-hero-sub">${fmt(ciKm, 0)} km, the material that breaks most</div></div>
      <div class="el-kpi"><div class="el-kpi-l">311: roads and potholes</div><div class="el-kpi-n">${fmt(rd12)}</div><div class="el-hero-sub">${infChg(infPct(rd12, rdPrev))} on the 12 months before</div></div>
      <div class="el-kpi"><div class="el-kpi-l">311: water mains and valves</div><div class="el-kpi-n">${fmt(wt12)}</div><div class="el-hero-sub">${infChg(infPct(wt12, wtPrev))} on the 12 months before</div></div>
    </div></section>`;

  // the communities where condition is slipping and complaints are rising
  const sorters = { signals: (x, y) => (y.both - x.both) || (y.flags.length - x.flags.length) || (y.br12 - x.br12), breaks: (x, y) => y.br12 - x.br12,
    rate: (x, y) => (y.brRate || 0) - (x.brRate || 0), age: (x, y) => (x.medYear || 9999) - (y.medYear || 9999), roads: (x, y) => y.roads[0] - x.roads[0] };
  const list = rows.filter(r => r.km || r.roads[0] || r.br12).sort(sorters[infSort] || sorters.signals);
  const both = list.filter(r => r.both);
  const flagHtml = r => r.flags.map(([k, t]) => `<span class="inf-flag ${k}">${esc(t)}</span>`).join('');
  const shown = list.slice(0, a.startsWith('c:') ? 1 : 60);
  const table = `<section class="card span-12"><div class="card-head"><div><h2>Wearing out, and complaints rising</h2><p class="card-sub">${fmt(both.length)} of ${fmt(list.length)} communities in ${esc(placeName)} show both: ${fmt(list.filter(r => r.bothWater).length)} where the water network is wearing out (breaks rising, ageing mains or much cast iron) and water requests to 311 are up 15% or more on the year before; ${fmt(list.filter(r => r.bothRoads).length)} where road and pothole requests are up 25% or more and no paving is planned.</p></div>
      <div class="card-tools"><label class="sr-only" for="inf-sort">Sort by</label><select id="inf-sort" class="select">${[['signals', 'Both first'], ['breaks', 'Most water main breaks'], ['rate', 'Breaks per 100 km'], ['age', 'Oldest water mains'], ['roads', 'Most road requests']].map(([k, t]) => `<option value="${k}" ${k === infSort ? 'selected' : ''}>${t}</option>`).join('')}</select><button class="btn" id="inf-csv">Download CSV</button></div></div>
    <div class="table-wrap"><table class="data inf-table"><thead><tr><th scope="col">Community</th><th class="num" scope="col">Water main breaks, 12 months</th><th class="num" scope="col">Per 100 km of main</th><th class="num" scope="col">Mains: middle year laid</th><th class="num" scope="col">50+ years old</th><th class="num" scope="col">Cast iron</th>
      <th class="num" scope="col">311 roads and potholes</th><th class="num" scope="col">311 sidewalks</th><th class="num" scope="col">311 streetlights</th><th class="num" scope="col">311 water</th><th class="num" scope="col">Paving planned (km)</th><th scope="col">Signals</th></tr></thead>
    <tbody>${shown.map(r => `<tr class="${r.both ? 'inf-both' : ''}"><th scope="row">${esc(r.name)}${r.ward ? `<small class="muted"> · Ward ${r.ward}</small>` : ''}</th>
      <td class="num"><b>${fmt(r.br12)}</b> <small class="muted">(${fmt(r.brPrev)})</small></td><td class="num">${isNum(r.brRate) ? fmt(r.brRate, 1) : '–'}</td><td class="num">${r.medYear || '–'}</td><td class="num">${isNum(r.oldShare) ? fmt(r.oldShare * 100, 0) + '%' : '–'}</td><td class="num">${isNum(r.ciShare) ? fmt(r.ciShare * 100, 0) + '%' : '–'}</td>
      ${['roads', 'side', 'lights', 'water'].map(k => `<td class="num">${fmt(r[k][0])} <small class="${infPct(r[k][0], r[k][1]) > 0 ? 'inf-up' : 'muted'}">${infChg(infPct(r[k][0], r[k][1]))}</small></td>`).join('')}
      <td class="num">${r.paveNext + r.pave5 ? fmt(r.paveNext + r.pave5, 1) : '–'}</td><td class="inf-flags">${flagHtml(r) || '<span class="muted">–</span>'}</td></tr>`).join('')}</tbody></table></div>
    <p class="card-note">Water main breaks: this year's 12 months, the 12 before in brackets. 311 columns: requests in the last 12 months and the change on the 12 before. Highlighted rows show both: a condition signal and rising 311 requests about the same thing. Paving planned: this year, next year and the tentative five-year plan. A flag is a lead to look into, not a finding: more requests can also mean more people reporting.</p></section>`;

  // Calgary by year
  const by = INF.city || {}, yrs = Object.keys(by.breaks_by_year || {}).map(Number).filter(y => y >= today - 15 && y < today).sort();
  const allY = Object.entries(by.breaks_by_year || {}).filter(([y]) => +y < today), peak = allY.reduce((m, x) => (x[1] > m[1] ? x : m), ['', 0]), last = allY[allY.length - 1] || ['', 0];
  const breaksCard = `<section class="card span-6"><div class="card-head"><div><h2>Water main breaks in Calgary, by year</h2><p class="card-sub">Every recorded break; ${today} so far is left out. Breaks peaked at ${fmt(peak[1])} in ${peak[0]} and were ${fmt(last[1])} in ${last[0]}, as the City replaced cast iron mains; the ageing network still left is where they happen.</p></div></div>
    ${ecBars(yrs.map(y => ({ label: String(y), v: by.breaks_by_year[y] })), v => fmt(v))}</section>`;
  const rqY = by.requests_by_year || {}, ry = [...new Set(Object.values(rqY).flatMap(o => Object.keys(o).map(Number)))].filter(y => y < today).sort();
  const reqCard = `<section class="card span-6"><div class="card-head"><div><h2>311 requests about infrastructure, by year</h2><p class="card-sub">All of Calgary; ${today} so far is left out</p></div></div>
    ${Object.entries(INF.requests || {}).map(([k, v]) => `<h3 class="inf-h4">${esc(v.label)}</h3>${ecBars(ry.slice(-5).map(y => ({ label: String(y), v: (rqY[k] || {})[y] || 0 })), x => fmt(x))}`).join('')}</section>`;

  // the oldest networks in the area
  const oldest = rows.filter(r => r.km >= 5 && r.medYear).sort((x, y) => x.medYear - y.medYear).slice(0, 15);
  const ageCard = `<section class="card span-6"><div class="card-head"><div><h2>Oldest water networks</h2><p class="card-sub">The year by which half of each community's water mains (by length) had been laid</p></div></div>
    ${ecBars(oldest.map(r => ({ label: r.name, v: today - r.medYear, sub: `middle year ${r.medYear} · ${fmt(r.km, 0)} km · ${isNum(r.ciShare) ? fmt(r.ciShare * 100, 0) : 0}% cast iron` })), v => `${fmt(v)} yrs`)}</section>`;

  // the paving plan in the area
  const codes = new Set(comms.map(c => c.code));
  const proj = (INF.projects || []).filter(p => codes.has(p[1]) || (a === 'all' && !p[1]));
  const lab = { this_year: 'This year', next_year: 'Next year', five_year: 'Five-year plan' };
  const paveCard = `<section class="card span-6"><div class="card-head"><div><h2>The City's paving plan</h2><p class="card-sub">${fmt(proj.length)} road sections in ${esc(placeName)}; ${fmt(pave, 1)} km this year, next year and in the tentative five-year plan</p></div></div>
    <div class="table-wrap inf-pave"><table class="data"><thead><tr><th scope="col">When</th><th scope="col">Street</th><th scope="col">From</th><th scope="col">To</th><th class="num" scope="col">km</th></tr></thead>
    <tbody>${proj.slice(0, 120).map(p => `<tr><td>${esc(lab[p[0]] || p[0])}</td><th scope="row">${esc(p[2] || '')}<small class="muted"> ${esc(infName(p[1] || ''))}</small></th><td>${esc(p[3] || '')}</td><td>${esc(p[4] || '')}</td><td class="num">${fmt(p[5], 2)}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">No paving listed here.</td></tr>'}</tbody></table></div></section>`;

  // the City's own condition figures
  const cr = (ctx.critical || {}).rows || [];
  const pqBar = `<div class="inf-pqi"><span style="width:${pq.good}%" class="g">${pq.good}% good</span><span style="width:${pq.fair}%" class="f">${pq.fair}% fair</span><span style="width:${pq.poor}%" class="p">${pq.poor}% poor</span></div>`;
  const cityCard = `<section class="card span-12"><div class="card-head"><div><h2>The City's own condition figures</h2><p class="card-sub">Not published as open data by road or pipe, so kept here with their sources</p></div></div>
    <h3 class="inf-h4">Roads: ${esc(pq.scale || '')}</h3>${pqBar}
    <p class="card-sub">Calgary, ${esc(pq.as_of || '')}. Canada's average: ${pq.canada_good}% good. The network is slipping by ${esc(pq.decline || '')}. The City's targets for roads in good condition or better: ${Object.entries(pq.targets || {}).map(([k, v]) => `${k.toLowerCase()} ${v}%`).join(', ')}. Inspected: ${esc(pq.inspected || '')}. <a href="${esc((pq.source || {}).url || '#')}" target="_blank" rel="noopener">${esc((pq.source || {}).publisher || '')}: ${esc((pq.source || {}).title || '')}</a></p>
    <p class="card-sub"><b>${(ctx.overall_poor || {}).pct}%</b> ${esc((ctx.overall_poor || {}).what || '')}. <a href="${esc(((ctx.overall_poor || {}).source || {}).url || '#')}" target="_blank" rel="noopener">${esc(((ctx.overall_poor || {}).source || {}).title || '')}</a></p>
    <h3 class="inf-h4">Critical assets in poor or very poor condition</h3>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Asset</th><th scope="col">If it fails</th><th scope="col">Condition</th><th scope="col">Money set aside</th></tr></thead>
    <tbody>${cr.map(r => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td><td class="wrap">${esc(r[2])}</td><td class="wrap">${esc(r[3])}</td></tr>`).join('')}</tbody></table></div>
    <p class="card-note">Source: <a href="${esc(((ctx.critical || {}).source || {}).url || '#')}" target="_blank" rel="noopener">${esc(((ctx.critical || {}).source || {}).title || '')}</a>, City of Calgary, 2026.</p></section>`;

  // ward by ward: every ward side by side (all of Calgary), or the chosen ward against Calgary
  const allRows = ((city && city.communities) || []).filter(c => c.code && c.residential !== false && c.ward).map(c => infRow(c, today));
  const agg = rs => {
    const g = { res: 0, br12: 0, brPrev: 0, km: 0, oldKm: 0, ciKm: 0, pave: 0, both: 0, n: rs.length };
    ['roads', 'side', 'lights', 'water'].forEach(k => { g[k] = [0, 0]; });
    rs.forEach(r => { g.res += r.residents; g.br12 += r.br12; g.brPrev += r.brPrev; g.km += r.km; g.oldKm += r.oldKm; g.ciKm += r.ciKm; g.pave += r.paveNext + r.pave5; g.both += r.both ? 1 : 0;
      ['roads', 'side', 'lights', 'water'].forEach(k => { g[k][0] += r[k][0]; g[k][1] += r[k][1]; }); });
    g.oldShare = g.km ? g.oldKm / g.km : null; g.ciShare = g.km ? g.ciKm / g.km : null; g.brRate = g.km ? g.br12 / g.km * 100 : null;
    g.roads1k = g.res ? g.roads[0] / g.res * 1000 : null;
    return g;
  };
  const W = wards.map(w => ({ w, ...agg(allRows.filter(r => r.ward === w)) })), C = agg(allRows);
  const wCells = g => `<td class="num">${fmt(g.res)}</td><td class="num"><b>${fmt(g.br12)}</b> <small class="muted">(${fmt(g.brPrev)})</small></td><td class="num">${isNum(g.brRate) ? fmt(g.brRate, 1) : '–'}</td><td class="num">${isNum(g.oldShare) ? fmt(g.oldShare * 100, 0) + '%' : '–'}</td><td class="num">${isNum(g.ciShare) ? fmt(g.ciShare * 100, 0) + '%' : '–'}</td>
      ${['roads', 'side', 'lights', 'water'].map(k => `<td class="num">${fmt(g[k][0])} <small class="${infPct(g[k][0], g[k][1]) > 0 ? 'inf-up' : 'muted'}">${infChg(infPct(g[k][0], g[k][1]))}</small></td>`).join('')}
      <td class="num">${isNum(g.roads1k) ? fmt(g.roads1k, 1) : '–'}</td><td class="num">${fmt(g.pave, 1)}</td><td class="num">${fmt(g.both)} <small class="muted">of ${fmt(g.n)}</small></td>`;
  const wHead = `<tr><th scope="col">Ward</th><th class="num" scope="col">Residents</th><th class="num" scope="col">Water main breaks, 12 months</th><th class="num" scope="col">Per 100 km of main</th><th class="num" scope="col">Mains 50+ years old</th><th class="num" scope="col">Cast iron</th>
      <th class="num" scope="col">311 roads and potholes</th><th class="num" scope="col">311 sidewalks</th><th class="num" scope="col">311 streetlights</th><th class="num" scope="col">311 water</th><th class="num" scope="col">Road requests per 1,000 residents</th><th class="num" scope="col">Paving planned (km)</th><th class="num" scope="col">Communities flagged</th></tr>`;
  const chosenW = a.startsWith('w') ? +a.slice(1) : null;
  const wardTable = `<section class="card span-12"><div class="card-head"><div><h2>Ward by ward</h2><p class="card-sub">${chosenW ? `Ward ${chosenW} against every other ward and all of Calgary.` : 'Every ward side by side.'} Tap a ward to look inside it. 311 columns: the last 12 months and the change on the 12 before.</p></div><div class="card-tools"><button class="btn" id="inf-wcsv">Download CSV</button></div></div>
    <div class="table-wrap"><table class="data inf-table"><thead>${wHead}</thead><tbody>
    ${W.map(g => `<tr class="${g.w === chosenW ? 'inf-chosen' : ''}"><th scope="row"><button type="button" class="link-btn" data-infw="${g.w}">Ward ${g.w}</button></th>${wCells(g)}</tr>`).join('')}
    <tr class="inf-total"><th scope="row">All of Calgary</th>${wCells(C)}</tr></tbody></table></div>
    <p class="card-note">Communities are placed in the ward holding most of their area. Flagged: communities showing both a condition signal and rising 311 requests (see the table below).</p></section>`;
  const wBars = (title, sub, f, fmtv) => `<section class="card span-6"><div class="card-head"><div><h2>${title}</h2><p class="card-sub">${sub}</p></div></div>${ecBars(W.filter(g => isNum(f(g))).sort((x, y) => f(y) - f(x)).map(g => ({ label: `Ward ${g.w}`, v: f(g), on: g.w === chosenW })), fmtv)}</section>`;
  const wardCharts = wBars('Ageing water mains, by ward', 'Share of the length of water main laid 50 or more years ago', g => g.oldShare === null ? null : g.oldShare * 100, v => fmt(v, 0) + '%')
    + wBars('Road and pothole requests, by ward', 'Requests to 311 in the last 12 months, per 1,000 residents', g => g.roads1k, v => fmt(v, 1));
  const errs = Object.keys(INF.errors || {});
  body.innerHTML = hero + wardTable + wardCharts + table + breaksCard + reqCard + ageCard + paveCard + cityCard
    + `<section class="card span-12"><p class="card-note">${errs.length ? `Not read at this refresh: ${esc(errs.join(', '))}. ` : ''}Sources: ${(INF.sources || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher)}: ${esc(s.title)}</a>`).join('; ')}. Read ${esc(String(INF.built_at || '').slice(0, 10))}. <button type="button" class="link-btn small" data-method="infra">How this is worked out</button></p></section>`;
  const s = $('#inf-area'); if (s) s.addEventListener('change', () => { infArea = s.value; renderInfra(); });
  body.querySelectorAll('[data-infw]').forEach(b => b.addEventListener('click', () => { infArea = 'w' + b.dataset.infw; renderInfra().then(() => { const t = $('#inf-body .inf-table'); if (t) t.scrollIntoView({ block: 'start' }); }); }));
  const wc = $('#inf-wcsv'); if (wc) wc.addEventListener('click', async () => {
    const line = (name, g) => [name, g.res, g.br12, g.brPrev, isNum(g.brRate) ? +g.brRate.toFixed(2) : '', +g.km.toFixed(1), isNum(g.oldShare) ? +(g.oldShare * 100).toFixed(1) : '', isNum(g.ciShare) ? +(g.ciShare * 100).toFixed(1) : '',
      g.roads[0], g.roads[1], g.side[0], g.side[1], g.lights[0], g.lights[1], g.water[0], g.water[1], isNum(g.roads1k) ? +g.roads1k.toFixed(2) : '', +g.pave.toFixed(2), g.both, g.n];
    await (await api()).save_csv('Infrastructure condition by ward', ['Ward', 'Residents', 'Water main breaks, 12 months', 'Breaks, 12 months before', 'Breaks per 100 km', 'Water mains (km)', '50+ years old (%)', 'Cast iron (%)',
      '311 roads, 12 months', '311 roads, before', '311 sidewalks, 12 months', '311 sidewalks, before', '311 streetlights, 12 months', '311 streetlights, before', '311 water, 12 months', '311 water, before', 'Road requests per 1,000 residents', 'Paving planned (km)', 'Communities flagged', 'Communities'],
      [...W.map(g => line(`Ward ${g.w}`, g)), line('All of Calgary', C)]);
  });
  const so = $('#inf-sort'); if (so) so.addEventListener('change', () => { infSort = so.value; renderInfra(); });
  const csv = $('#inf-csv'); if (csv) csv.addEventListener('click', async () => {
    await (await api()).save_csv(`Infrastructure condition - ${placeName}`, ['Community', 'Ward', 'Water main breaks, 12 months', 'Breaks, 12 months before', 'Breaks per 100 km', 'Water mains (km)', 'Middle year laid', '50+ years old (%)', 'Cast iron (%)',
      '311 roads, 12 months', '311 roads, before', '311 sidewalks, 12 months', '311 sidewalks, before', '311 streetlights, 12 months', '311 streetlights, before', '311 water, 12 months', '311 water, before', 'Paving planned (km)', 'Signals'],
      list.map(r => [r.name, r.ward || '', r.br12, r.brPrev, isNum(r.brRate) ? +r.brRate.toFixed(2) : '', r.km, r.medYear || '', isNum(r.oldShare) ? +(r.oldShare * 100).toFixed(1) : '', isNum(r.ciShare) ? +(r.ciShare * 100).toFixed(1) : '',
        r.roads[0], r.roads[1], r.side[0], r.side[1], r.lights[0], r.lights[1], r.water[0], r.water[1], +(r.paveNext + r.pave5).toFixed(2), r.flags.map(f => f[1]).join('; ')]));
  });
}
window.renderInfra = renderInfra;

;
// ---- help.js
/* Calgary Insight: Find help near me. Shelters, meals, day spaces, health care and help lines, nearest first when the
   visitor shares their location. The location stays in the browser: it is used to sort and to draw "you are here", and
   is never sent anywhere. The list (help/help.json) comes from the Calgary Homeless Foundation's 2026 Supports and
   Resources Guide and Alberta's list of Calgary homeless shelters; shelters for people leaving abuse are listed by phone
   only, never on the map, because their locations are kept private for safety. */
'use strict';

let HELP = null, helpKind = 'shelter', helpWho = '', helpMe = null, helpMap = null, helpMsg = '';
async function loadHelp() {
  if (HELP) return HELP;
  try { const r = await fetch('help/help.json', { cache: 'no-cache' }); if (r.ok) HELP = await r.json(); } catch (e) { /* shown below */ }
  return HELP;
}
const HELP_KINDS = [['shelter', 'A bed tonight'], ['food', 'Food and meals'], ['day', 'Day spaces, showers, ID'], ['health', 'Health and recovery'], ['safe', 'Leaving abuse']];
const HELP_WHO = [['', 'Everyone'], ['men', 'Men'], ['women', 'Women'], ['families', 'Families'], ['youth', 'Youth 12 to 17']];
function helpKm(a, b) { const R = 6371, t = Math.PI / 180, dLat = (b[0] - a[0]) * t, dLon = (b[1] - a[1]) * t; const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * t) * Math.cos(b[0] * t) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
const helpTel = p => String(p || '').replace(/[^\d+]/g, '');
const helpWhoOk = (p, w) => {
  if (!w) return true;
  const t = (p.who || '').toLowerCase();
  if (w === 'men') return /\bmen\b|all adults|adults/.test(t) && !/women/.test(t);
  if (w === 'women') return /women|all adults|adults/.test(t);
  if (w === 'families') return /famil|children/.test(t);
  if (w === 'youth') return /youth|12 to 17|ages 1[2-5]/.test(t);
  return true;
};
function helpDir(p, mode) {
  const to = isNum(p.lat) ? `${p.lat},${p.lon}` : encodeURIComponent(`${p.address}, Calgary, AB`);
  return `https://www.google.com/maps/dir/?api=1&destination=${to}&travelmode=${mode}`;
}
function helpCard(p) {
  const d = helpMe && isNum(p.lat) ? helpKm(helpMe, [p.lat, p.lon]) : null;
  const walk = isNum(d) ? Math.round(d / 4.5 * 60) : null;
  return `<article class="help-card${p.always ? ' is-247' : ''}">
    <div class="help-top"><h3>${esc(p.name)}</h3>${/24\/7/.test(p.hours || '') ? '<span class="help-247">Open 24/7</span>' : ''}</div>
    <p class="help-who">${esc(p.who || '')}</p>
    ${p.address ? `<p class="help-addr">${esc((p.unit ? p.unit + ', ' : '') + p.address)}${isNum(d) ? ` · <b>${fmt(d, d < 10 ? 1 : 0)} km</b>${walk <= 90 ? `, about ${fmt(walk)} min walk` : ''}` : ''}</p>` : '<p class="help-addr">Location kept private for safety: call and they will tell you where to go.</p>'}
    ${p.hours ? `<p class="help-hours">${esc(p.hours)}</p>` : ''}
    <div class="help-btns">${p.phone ? `<a class="btn primary" href="tel:${helpTel(p.phone)}">Call ${esc(p.phone)}</a>` : ''}
      ${isNum(p.lat) || p.address ? `<a class="btn" href="${helpDir(p, 'walking')}" target="_blank" rel="noopener">Walk there</a><a class="btn" href="${helpDir(p, 'transit')}" target="_blank" rel="noopener">By bus or train</a>` : ''}
      ${p.url ? `<a class="btn" href="${esc(p.url)}" target="_blank" rel="noopener">Website</a>` : ''}</div>
    ${p.phone2 ? `<p class="help-more">Also: <a href="tel:${helpTel(p.phone2)}">${esc(p.phone2)}</a></p>` : ''}</article>`;
}

async function renderHelp() {
  const body = $('#help-body'); if (!body) return;
  if (!HELP) body.innerHTML = '<section class="card span-12"><p class="muted">Loading the list…</p></section>';
  await loadHelp();
  if (!HELP) { body.innerHTML = '<section class="card span-12 help-urgent"><p>The list could not be loaded. <b>Call or text 2-1-1</b> any time, day or night, for a shelter bed, food and help. In danger: <b>call 9-1-1</b>.</p></section>'; return; }
  const all = HELP.places || [];
  let list = all.filter(p => p.kind === helpKind && (helpKind !== 'shelter' || helpWhoOk(p, helpWho)));
  if (helpMe) list = list.slice().sort((a, b) => (isNum(a.lat) ? helpKm(helpMe, [a.lat, a.lon]) : 1e9) - (isNum(b.lat) ? helpKm(helpMe, [b.lat, b.lon]) : 1e9));
  const lines = HELP.lines || [];
  const urgent = `<section class="card span-12 help-urgent"><div class="help-urgent-in">
      <a class="help-big danger" href="tel:911"><b>9-1-1</b><span>In danger or someone is not responding</span></a>
      <a class="help-big" href="tel:211"><b>2-1-1</b><span>Call or text, 24/7: shelter beds, food, any help</span></a>
      <a class="help-big" href="tel:988"><b>9-8-8</b><span>Suicide crisis line, call or text, 24/7</span></a>
      <a class="help-big" href="tel:4032664357"><b>403-266-4357</b><span>Distress Centre Calgary, 24/7</span></a></div></section>`;
  const near = `<section class="card span-12 help-find"><div class="card-head"><div><h2>What do you need?</h2><p class="card-sub">${helpMe ? 'Nearest to you first.' : 'Share your location to see the nearest first. It stays on your phone and is never sent anywhere.'} Call before you go: beds fill and hours change.</p></div>
      <div class="card-tools"><button type="button" class="btn primary help-loc" id="help-loc">${helpMe ? 'Update my location' : '📍 Use my location'}</button></div></div>
    ${helpMsg ? `<p class="help-msg" role="status">${esc(helpMsg)}</p>` : ''}
    <div class="help-kinds" role="radiogroup" aria-label="What do you need">${HELP_KINDS.map(([k, t]) => `<button type="button" class="chip${k === helpKind ? ' is-on' : ''}" role="radio" aria-checked="${k === helpKind}" data-helpkind="${k}">${t}</button>`).join('')}</div>
    ${helpKind === 'shelter' ? `<div class="help-kinds small" role="radiogroup" aria-label="Who is it for">${HELP_WHO.map(([k, t]) => `<button type="button" class="chip${k === helpWho ? ' is-on' : ''}" role="radio" aria-checked="${k === helpWho}" data-helpwho="${k}">${t}</button>`).join('')}</div>` : ''}
    ${helpKind === 'safe' ? '<p class="card-sub help-safe">These shelters keep their addresses private so nobody can follow you there. Call: they will help you get there safely. If you are in danger now, call 9-1-1.</p>' : ''}
    ${list.some(p => isNum(p.lat)) ? '<div id="help-map" class="help-map" role="region" aria-label="Map of the places listed"></div>' : ''}
    <div class="help-list">${list.map(helpCard).join('') || '<p class="muted">Nothing listed here. Call or text 2-1-1 for help finding it.</p>'}</div></section>`;
  const more = `<section class="card span-12"><div class="card-head"><div><h2>More help lines</h2><p class="card-sub">Tap a number to call</p></div></div>
    <div class="help-lines">${lines.map(l => `<a class="help-line" href="tel:${helpTel(l.phone)}"><b>${esc(l.phone)}</b><span>${esc(l.name)}${l.note ? ` · ${esc(l.note)}` : ''}</span></a>`).join('')}</div>
    <p class="card-note">${esc(HELP.note || '')} Sources: ${(HELP.sources || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join('; ')}. Checked ${esc(HELP.checked || '')}. During extreme cold or heat, extra spaces open: <a href="https://www.calgaryhomeless.com/ewr" target="_blank" rel="noopener">calgaryhomeless.com/ewr</a>.</p></section>`;
  body.innerHTML = urgent + near + more;
  body.querySelectorAll('[data-helpkind]').forEach(b => b.addEventListener('click', () => { helpKind = b.dataset.helpkind; renderHelp(); }));
  body.querySelectorAll('[data-helpwho]').forEach(b => b.addEventListener('click', () => { helpWho = b.dataset.helpwho; renderHelp(); }));
  const lb = $('#help-loc');
  if (lb) lb.addEventListener('click', () => {
    if (!navigator.geolocation) { helpMsg = 'This browser cannot share a location. The list is sorted with downtown first.'; renderHelp(); return; }
    lb.disabled = true; lb.textContent = 'Finding you…';
    navigator.geolocation.getCurrentPosition(pos => { helpMe = [pos.coords.latitude, pos.coords.longitude]; helpMsg = ''; renderHelp(); },
      err => { helpMsg = err && err.code === 1 ? 'Location was not shared. That is fine: the list is below, and 2-1-1 can tell you what is closest.' : 'Your location could not be found just now. The list is below.'; renderHelp(); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  });
  helpDrawMap(list);
}
function helpDrawMap(list) {
  const el = $('#help-map'); if (!el || typeof L === 'undefined') return;
  if (helpMap) { try { helpMap.remove(); } catch (e) { /* gone */ } helpMap = null; }
  try {
    helpMap = L.map(el, { scrollWheelZoom: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(helpMap);
    const pts = [];
    list.filter(p => isNum(p.lat)).forEach(p => {
      pts.push([p.lat, p.lon]);
      L.circleMarker([p.lat, p.lon], { radius: 8, color: '#0B1220', weight: 2, fillColor: /24\/7/.test(p.hours || '') ? '#F59E0B' : '#38BDF8', fillOpacity: 0.95 })
        .bindPopup(`<b>${esc(p.name)}</b><br>${esc(p.address || '')}<br>${p.phone ? `<a href="tel:${helpTel(p.phone)}">${esc(p.phone)}</a> · ` : ''}<a href="${helpDir(p, 'walking')}" target="_blank" rel="noopener">Directions</a>`).addTo(helpMap);
    });
    if (helpMe) { L.circleMarker(helpMe, { radius: 9, color: '#fff', weight: 3, fillColor: '#22C55E', fillOpacity: 1 }).bindTooltip('You are here').addTo(helpMap); pts.push(helpMe); }
    if (helpMe && pts.length > 1) {
      const near = list.filter(p => isNum(p.lat)).slice(0, 3).map(p => [p.lat, p.lon]);
      helpMap.fitBounds(L.latLngBounds([helpMe, ...near]).pad(0.25));
    } else if (pts.length) helpMap.fitBounds(L.latLngBounds(pts).pad(0.15));
    else helpMap.setView([51.045, -114.06], 12);
  } catch (e) { el.innerHTML = '<p class="card-note">The map could not be drawn here; the list below has every place.</p>'; }
}
window.renderHelp = renderHelp;

;
// ---- accountability.js
/* Calgary Insight: Civic Accountability, a section of the Election Data Centre. Eight pages: the manifestos, promise
   against reality, each representative's documented record, voting records, government commitments, budgets and
   projects, the history of every assessment, and the method. Commitments are researched by hand with a source for every
   one (accountability/commitments.json); official records are read at every refresh (accountability.py). Nothing is
   rated without evidence, and the same rules apply to every party, person and government. */
'use strict';

let CA = null, CAR = null, caPage = 'promises', caLevel = '', caType = '', caStatus = '', caOpen = null;
const CA_PAGES = [['manifesto', 'Manifesto Tracker', '📜'], ['promises', 'Promise vs Reality', '⚖️'], ['reps', 'Representative Performance', '👥'], ['records', 'Legislative & Voting Records', '🗳️'],
  ['gov', 'Government Commitments', '🏛️'], ['budget', 'Budget & Project Delivery', '🏗️'], ['history', 'Accountability History', '🕒'], ['method', 'Methodology & Evidence', '🔎']];
const CA_LEVEL = { municipal: 'City of Calgary', provincial: 'Alberta', federal: 'Canada' };
const CA_TYPE = { candidate: 'Candidate promise', party: 'Party promise', government: 'Government commitment' };
const CA_TONE = { 'Delivered': 'good', 'Delivered late': 'good', 'On track': 'good', 'In progress': 'mid', 'Partly delivered': 'mid', 'Stalled': 'bad', 'Not started': 'bad', 'Broken': 'bad', 'Not yet assessed': 'none' };

async function loadCivic() {
  if (!CA) { try { const r = await fetch('accountability/commitments.json', { cache: 'no-cache' }); if (r.ok) CA = await r.json(); } catch (e) { /* shown below */ } }
  if (!CAR) { try { const r = await (await api()).get_accountability(); if (r && r.ok) CAR = r.data; } catch (e) { /* the records are optional */ } }
}
const caBadge = s => `<span class="ca-status ${CA_TONE[s] || 'none'}">${esc(s)}</span>`;
const caSrc = e => e.url && e.url !== '#elections' ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.source || 'Source')}</a>` : e.url === '#elections' ? `<button type="button" class="link-btn" data-caelsub="results">${esc(e.source)}</button>` : esc(e.source || '');
const caDate = d => { if (!d) return ''; const [y, m, dd] = String(d).split('-'); const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; return dd ? `${M[+m - 1]} ${+dd}, ${y}` : m ? `${M[+m - 1]} ${y}` : y; };
function caFilters(list) {
  const LBL = { 'ca-level': 'Government', 'ca-type': 'Kind of record', 'ca-status': 'Status' };
  const sel = (id, v, opts) => `<select id="${id}" class="select" aria-label="${LBL[id] || 'Filter'}">${opts.map(([k, t]) => `<option value="${k}" ${k === v ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
  return `<div class="card-tools sr-tools">${sel('ca-level', caLevel, [['', 'Every government'], ...Object.entries(CA_LEVEL)])}${sel('ca-type', caType, [['', 'Every kind'], ...Object.entries(CA_TYPE)])}${list ? sel('ca-status', caStatus, [['', 'Every status'], ...Object.keys(CA.statuses || {}).map(s => [s, s])]) : ''}</div>`;
}
// an entry waiting on a dated decision (watch: {date, event}): from the day after, until its outcome is recorded and the
// watch removed, it says so plainly instead of leaving text written before the decision to read as current
const caToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const caAwaiting = c => !!(c.watch && c.watch.date && c.watch.date < caToday());
const caKeep = c => (!caLevel || c.level === caLevel) && (!caType || c.type === caType) && (!caStatus || c.status === caStatus);
function caCard(c) {
  const open = caOpen === c.id;
  const doc = (CA.documents || []).find(d => d.id === c.doc);
  return `<article class="ca-item${open ? ' is-open' : ''}" id="ca-${c.id}">
    <button type="button" class="ca-head" data-caopen="${c.id}" aria-expanded="${open}"><span class="ca-tags"><span class="ca-tag lvl-${c.level}">${esc(CA_LEVEL[c.level] || c.level)}</span><span class="ca-tag">${esc(CA_TYPE[c.type] || c.type)}</span></span>
      <span class="ca-title">${esc(c.title)}</span>${caBadge(c.status)}</button>
    <div class="ca-sub">${esc(c.who)}${c.made ? ` · committed ${esc(caDate(c.made))}` : ''}${c.expected ? ` · timeline: ${esc(c.expected.charAt(0).toLowerCase() + c.expected.slice(1))}` : ''}${c.missed ? ' · <b class="ca-missed">deadline missed</b>' : ''}${c.disputed ? ' · <b class="ca-disp">disputed</b>' : ''}${caAwaiting(c) ? ' · <b class="ca-await">awaiting outcome</b>' : ''}</div>
    ${open ? `<div class="ca-body">${caAwaiting(c) ? `<p class="ca-await-note"><b>Awaiting the outcome.</b> ${esc(c.watch.event || 'The decision')} was due on ${esc(caDate(c.watch.date))}; its result has not been recorded here yet, so the text below was written before it.</p>` : ''}<p><b>Where it stands.</b> ${esc(c.progress || '')}</p>${c.missed ? `<p><b>Deadline.</b> ${esc(c.missed)}</p>` : ''}
      ${c.disputed ? `<p class="ca-disputed"><b>Disputed.</b> ${esc(c.disputed)}${c.disputed_url ? ` <a href="${esc(c.disputed_url)}" target="_blank" rel="noopener">Read the other view</a>` : ''}</p>` : ''}
      ${c.funding ? `<p><b>Money.</b> Promised: ${esc(c.funding.promised || '–')}. Allocated: ${esc(c.funding.allocated || '–')}. Spent: ${esc(c.funding.spent || '–')}.</p>` : ''}
      <p><b>Evidence.</b></p><ul class="ca-ev">${(c.evidence || []).map(e => `<li><span class="muted">${esc(caDate(e.date))}</span> ${esc(e.text)}: ${caSrc(e)}</li>`).join('')}</ul>
      ${doc ? `<p class="card-note">From: ${esc(doc.title)} · ${esc(doc.who)}. <a href="${esc(doc.url)}" target="_blank" rel="noopener">Source document</a></p>` : ''}
      <div class="ca-actions">${(c.data || []).map(d => caLink(d)).join('')}<button type="button" class="btn small" data-ask="${esc(caAsk(c))}">Check the latest evidence with Data Genie</button></div></div>` : ''}</article>`;
}
const caAsk = c => `What is the latest evidence on this commitment: "${c.title}" (${c.who})? Our status is "${c.status}", last checked ${caDate(CA.checked)}. Check official sources and news since then, say whether the status should change, and cite the sources.`;
function caLink(d) {
  const L = { development: ['dashboard', 'Building and development figures'], infra: ['infra', 'Infrastructure condition'], budget: ['budget', 'City budget'], fedbudget: ['fedbudget', 'Federal Budget 2026'], elections: ['elections', 'Referendum results'], safety: ['safety', 'Crime and safety'] }[d];
  return L ? `<button type="button" class="btn small" data-cago="${L[0]}">${esc(L[1])}</button>` : '';
}

// ---- the pages
function caManifesto() {
  const docs = (CA.documents || []).filter(d => (!caLevel || d.level === caLevel) && (!caType || d.type === caType));
  return `<section class="card span-12"><div class="card-head"><div><h2>Manifesto Tracker</h2><p class="card-sub">Party platforms and candidate commitments for the elections that chose Calgary's City council, its MLAs and its MPs, with the promises tracked from each</p></div>${caFilters(false)}</div>
    <div class="ca-docs">${docs.map(d => { const items = (CA.commitments || []).filter(c => c.doc === d.id);
      return `<div class="ca-doc"><div class="ca-tags"><span class="ca-tag lvl-${d.level}">${esc(CA_LEVEL[d.level])}</span><span class="ca-tag">${esc(CA_TYPE[d.type])}</span></div><h3>${esc(d.title)}</h3><p class="ca-sub">${esc(d.who)} · published ${esc(caDate(d.date))}</p>
        <p class="card-sub">${esc(d.note || '')}</p><p><a href="${esc(d.url)}" target="_blank" rel="noopener">Original source</a></p>
        ${items.length ? `<ul class="ca-mini">${items.map(c => `<li><button type="button" class="ca-plink" data-cajump="${c.id}">${esc(c.title)}</button> ${caBadge(c.status)}</li>`).join('')}</ul>` : '<p class="muted small">No promises from this document tracked yet.</p>'}</div>`; }).join('')}</div>
    <p class="card-note">Promises of parties and candidates who did not win office are listed for the record but not rated: they had no power to deliver them.</p></section>`;
}
function caPromises() {
  const list = (CA.commitments || []).filter(caKeep);
  const count = s => list.filter(c => c.status === s).length;
  const tones = ['Delivered', 'Delivered late', 'On track', 'In progress', 'Partly delivered', 'Stalled', 'Not started', 'Broken', 'Not yet assessed'].filter(count);
  return `<section class="card span-12"><div class="card-head"><div><h2>Promise vs Reality</h2><p class="card-sub">Each commitment: what was promised and when, when it was due, what has happened, the evidence and where it stands. Tap one to see the evidence.</p></div>${caFilters(true)}</div>
    <div class="ca-sum">${tones.map(s => `<button type="button" class="ca-sumi" data-castatus="${esc(s)}">${caBadge(s)}<b>${count(s)}</b></button>`).join('')}</div>
    <div class="ca-list">${list.map(caCard).join('') || '<p class="muted">Nothing matches these filters.</p>'}</div></section>`;
}
function caMatch(list, name) {   // a member's record by last name, e.g. "Raj Dhaliwal" and "Rajdeep Dhaliwal"
  const last = String(name || '').trim().split(/\s+/).pop().toLowerCase();
  return Object.entries(list || {}).find(([k]) => k.toLowerCase().split(/[\s.]+/).pop() === last);
}
function caReps() {
  const M = (EL && EL.municipal) || {}, P = (EL && EL.provincial) || {}, F = (EL && EL.federal) || {}, E = (D && D.elections) || {};
  const city = isCity(), ward = city ? 0 : SCOPE;
  const cv = (CAR && CAR.council) || {}, hoc = (CAR && CAR.hoc) || {}, bills = ((CAR && CAR.bills) || {}).calgary || [];
  const nDiv = (hoc.divisions || []).length;
  const rows = [];
  const mayor = M.mayor && M.mayor.candidates[0].name;
  const council = (who, office, area) => { const m = caMatch(cv.members, who); const r = m && m[1];
    rows.push({ office, who, area,
      ind: r ? `${fmt(r.votes)} recorded votes (${fmt(r.for)} for, ${fmt(r.against)} against${r.absent ? `, ${fmt(r.absent)} absent` : ''}) from ${caDate(cv.from)} to ${caDate(cv.to)}` : 'No recorded votes found under this name' }); };
  if (mayor) council(mayor, 'Mayor', 'All of Calgary');
  (city ? Object.keys(M.councillors || {}).sort((a, b) => a - b) : [String(ward)]).forEach(w => { const r = (M.councillors || {})[w]; if (r) council(r.candidates[0].name, `Councillor, Ward ${w}`, `Ward ${w}`); });
  const mine = lvl => city ? Object.keys((EL[lvl] || {}).general || {}).sort() : (((E[lvl] || {}).ridings) || []).map(x => x.riding);
  mine('provincial').forEach(n => { const m = (P.members || {})[n] || {};
    rows.push({ office: `MLA, ${n}`, who: m.name || '', party: m.caucus, area: n,
      ind: 'Votes not published as open data' }); });
  mine('federal').forEach(n => { const m = (F.members || {})[n] || {}; const h = (hoc.mps || {})[n]; const b = bills.filter(x => x.riding === n);
    rows.push({ office: `MP, ${n}`, who: m.name || (h && h.name) || '', party: m.caucus || (h && h.caucus), area: n,
      ind: h ? `Voted in ${fmt(h.recorded)} of ${fmt(nDiv)} recorded divisions this Parliament (${fmt(h.yea)} yea, ${fmt(h.nay)} nay, ${fmt(h.paired)} paired)${b.length ? `; sponsored ${b.length} bill${b.length > 1 ? 's' : ''}` : ''}` : 'Votes not read at this refresh' }); });
  const promises = name => { if (!name) return []; const n = String(name).replace(/\s*\([^)]*\)\s*/g, ' ').trim(), last = n.split(/\s+/).pop();
    const re = new RegExp(`\\b${last.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?!\\s*\\d)`, 'i');
    return (CA.commitments || []).filter(c => String(c.who || '').toLowerCase().includes(n.toLowerCase()) || (last.length > 3 && re.test(String(c.who || '').replace(/\(Ward \d+\)/g, '')))); };
  const LV = [['City council', 'Mayor and councillors set City bylaws, the City budget and property tax, and represent residents on City services.', r => /^(Mayor|Councillor)/.test(r.office)],
    ['Alberta Legislature', 'MLAs make provincial laws (health, schools, policing, the powers of cities) and approve the provincial budget. The Legislature publishes bills and Hansard, the record of debates, but not members\' votes as open data, so votes are not counted here.', r => /^MLA/.test(r.office)],
    ['House of Commons', 'MPs make federal laws (immigration, criminal law, income tax, transfers to provinces) and approve federal spending.', r => /^MP/.test(r.office)]];
  const table = rs => `<div class="table-wrap ca-repw"><table class="data ca-reps"><thead><tr><th scope="col">Office</th><th scope="col">Member</th><th scope="col">Documented record</th><th scope="col">Commitments tracked</th></tr></thead>
    <tbody>${rs.map(r => { const p = promises(r.who); return `<tr><th scope="row">${esc(r.office)}</th><td>${esc(r.who)}${r.party ? `<div class="muted small">${esc(r.party)}</div>` : ''}</td><td class="wrap">${esc(r.ind)}</td><td class="wrap ca-pcell">${p.length ? p.map(c => `<div><button type="button" class="ca-plink" data-cajump="${c.id}">${esc(c.title)}</button> ${caBadge(c.status)}</div>`).join('') : '<span class="muted">None tracked yet</span>'}</td></tr>`; }).join('')}</tbody></table></div>`;
  return `<section class="card span-12"><div class="card-head"><div><h2>Representative Performance: ${esc(W())}</h2><p class="card-sub">Everyone elected for ${esc(W())}: what their office is responsible for, the commitments they made, and what official records document. Pick a ward at the top to see its members only.</p></div></div>
    ${LV.map(([h, resp, f]) => { const rs = rows.filter(f); return rs.length ? `<h3 class="ca-h3">${esc(h)}</h3><p class="card-sub">${esc(resp)}</p>${table(rs)}` : ''; }).join('')}
    <p class="card-note">Voting counts are not a grade: most votes are unanimous, and members also work in committees and with residents. Paired: an MP absent by agreement with one from another party, so the result is unchanged. For what has happened in ${esc(W())} over the council's term, see Budget & Project Delivery.</p></section>`;
}
const caRes = r => { const t = String(r || ''); return /carried|agreed/i.test(t) ? (/agreed/i.test(t) ? 'Agreed to' : 'Carried') : /lost|defeat|negatived/i.test(t) ? (/negatived/i.test(t) ? 'Negatived' : 'Lost') : t; };
function caRecords() {
  const cv = (CAR && CAR.council) || {}, hoc = (CAR && CAR.hoc) || {}, bills = ((CAR && CAR.bills) || {}).calgary || [];
  const M = (EL && EL.municipal) || {};   // the elected council only, mayor first; committees also record citizen members' votes
  const elected = [M.mayor && M.mayor.candidates[0].name, ...Object.keys(M.councillors || {}).sort((a, b) => a - b).map(w => M.councillors[w].candidates[0].name)].filter(Boolean);
  const names = elected.map(n => (caMatch(cv.members, n) || [])[0]).filter(Boolean);
  const div = (cv.divided || []).slice(0, 40);
  const council = `<section class="card span-12"><div class="card-head"><div><h2>City council: divided votes</h2><p class="card-sub">${fmt(cv.motions || 0)} motions with recorded votes from ${esc(caDate(cv.from))} to ${esc(caDate(cv.to))}; ${fmt(cv.divided_n || 0)} were not unanimous. How each member voted on those:</p></div></div>
    ${div.length ? `<div class="table-wrap ca-votes"><table class="data compact"><thead><tr><th scope="col">Date</th><th scope="col">Meeting</th><th scope="col">Motion</th><th scope="col">Result</th>${names.map(n => `<th scope="col" class="ca-vn" title="${esc(n)}">${esc(n.split(/\s+/).pop())}</th>`).join('')}</tr></thead>
      <tbody>${div.map(m => `<tr><td>${esc(m.date)}</td><td class="wrap">${esc(m.meeting || '')}</td><td class="wrap ca-motion">${m.text.length > 220 ? `<details class="ca-why"><summary>${esc(m.text.slice(0, 200).replace(/\s+\S*$/, ''))}…</summary><p>${esc(m.text)}</p></details>` : esc(m.text)}</td><td>${esc(caRes(m.result))} <small class="muted">${m.for}–${m.against}</small></td>${names.map(n => { const v = (m.votes || {})[n] || ''; return `<td class="ca-v ${/^(yes|for)/i.test(v) ? 'y' : /^(no|against)/i.test(v) ? 'n' : ''}">${esc(v ? (/^(yes|for)/i.test(v) ? 'Yes' : /^(no|against)/i.test(v) ? 'No' : v) : '·')}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="muted">The council votes were not read at this refresh.</p>'}
    <p class="card-note">From the City's open data on council and committee votes; the full minutes are in the City's meeting portal. Committee participation is shown where the City records committee votes.</p></section>`;
  const mps = Object.entries(hoc.mps || {}).sort((a, b) => a[0].localeCompare(b[0]));
  const lasts = mps.map(([, m]) => m.name.split(/\s+/).pop());
  const mpLab = n => { const w = n.split(/\s+/), l = w[w.length - 1]; return lasts.filter(x => x === l).length > 1 ? `${w[0][0]}. ${l}` : w.length > 2 ? w.slice(1).join(' ') : l; };
  const ds = (hoc.divisions || []).slice(0, 25);
  const commons = `<section class="card span-12"><div class="card-head"><div><h2>House of Commons: how Calgary's MPs voted</h2><p class="card-sub">The ${fmt(ds.length)} most recent of ${fmt((hoc.divisions || []).length)} recorded divisions this Parliament</p></div></div>
    ${ds.length ? `<div class="table-wrap ca-votes"><table class="data compact"><thead><tr><th scope="col">Date</th><th scope="col">Vote on</th><th scope="col">Result</th>${mps.map(([r, m]) => `<th scope="col" class="ca-vn" title="${esc(m.name)}, ${esc(r)}">${esc(mpLab(m.name))}</th>`).join('')}</tr></thead>
      <tbody>${ds.map(d => `<tr><td>${esc(d.date)}</td><td class="wrap ca-motion">${esc(d.subject || '')}</td><td>${esc(caRes(d.result))} <small class="muted">${d.yeas}–${d.nays}</small></td>${mps.map(([, m]) => { const v = (m.votes || {})[d.n] || ''; return `<td class="ca-v ${v === 'Yea' ? 'y' : v === 'Nay' ? 'n' : ''}">${esc(v || '·')}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="muted">The House of Commons votes were not read at this refresh.</p>'}
    <p class="card-note">· means no vote was recorded for that MP (absent, or not an MP at the time). From the House of Commons' published votes.</p></section>`;
  const billsCard = `<section class="card span-6"><div class="card-head"><div><h2>Bills sponsored by Calgary MPs</h2><p class="card-sub">This Parliament, from LEGISinfo</p></div></div>
    ${bills.length ? `<ul class="ca-mini">${bills.map(b => `<li><a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.bill)}</a> ${esc(b.title || '')} <span class="muted small">· ${esc(b.sponsor || '')} · ${esc(b.stage || b.status || '')}</span></li>`).join('')}</ul>` : '<p class="muted">No bill sponsored by a Calgary MP so far this Parliament. Government bills are sponsored by ministers; none of them represents Calgary.</p>'}</section>`;
  const ab = `<section class="card span-6"><div class="card-head"><div><h2>Alberta Legislature</h2><p class="card-sub">Bills and the record of debates</p></div></div>
    <p class="card-sub">The Legislative Assembly publishes bills, their status and Hansard, but not members' votes as open data, so votes are not counted here.</p>
    <p><a href="https://www.assembly.ab.ca/assembly-business/bills/bill-status" target="_blank" rel="noopener">Bill status</a> · <a href="https://www.assembly.ab.ca/assembly-business/transcripts/hansard-transcripts" target="_blank" rel="noopener">Hansard</a> · <a href="https://www.assembly.ab.ca/members/members-of-the-legislative-assembly" target="_blank" rel="noopener">Members</a></p></section>`;
  return council + commons + billsCard + ab;
}
function caGov() {
  const list = (CA.commitments || []).filter(c => c.type === 'government' && caKeep(c));
  const m = (CAR && CAR.city_measures) || null;
  const rows = (m && m.rows) || [];
  const cols = rows.length ? Object.keys(rows[0]).filter(k => /^_?\d{4}|^q\d_\d{4}/.test(k)).sort((a, b) => (a.match(/\d{4}/)[0] + a).localeCompare(b.match(/\d{4}/)[0] + b)) : [];
  const lab = k => k.replace(/^q(\d)_(\d{4})_value$/, 'Q$1 $2').replace(/^_/, '').replace(/_value$/, '');
  return `<section class="card span-12"><div class="card-head"><div><h2>Government Commitments</h2><p class="card-sub">Formal commitments by the City, the Province and Canada that affect Calgary: announced, approved and being delivered</p></div>${caFilters(true)}</div>
    <div class="ca-list">${list.map(caCard).join('') || '<p class="muted">Nothing matches these filters.</p>'}</div></section>
    <section class="card span-12"><div class="card-head"><div><h2>The City's own measures against its targets</h2><p class="card-sub">${m ? `${esc(m.name.replace(/ - Performance Measures$/, ''))}: the measures the City reports to council for its priorities, with its targets. Many targets are for the end of 2026, so a mid-year figure is part of the year.` : 'Not read at this refresh'}</p></div></div>
    ${rows.length ? `<div class="table-wrap ca-repw"><table class="data ca-meas"><thead><tr><th scope="col">Measure</th>${cols.map(k => `<th scope="col" class="num">${esc(lab(k))}</th>`).join('')}<th scope="col">Target</th></tr></thead>
      <tbody>${[...new Set(rows.map(r => r.council_priority_area || ''))].map(g => `<tr class="ca-grp"><th scope="rowgroup" colspan="${cols.length + 2}">${esc(g)}</th></tr>${rows.filter(r => (r.council_priority_area || '') === g).map(r => `<tr><th scope="row" class="wrap">${esc(r.performance_measure_name || '')}${r.story_behind_the_number ? `<details class="ca-why"><summary>The City's explanation</summary><p>${esc(r.story_behind_the_number)}</p></details>` : ''}</th>${cols.map(k => `<td class="num">${esc(r[k] || '–')}</td>`).join('')}<td class="wrap">${esc(r.target && r.target !== 'N/A' ? r.target : '–')}</td></tr>`).join('')}`).join('')}</tbody></table></div>` : ''}
    <p class="card-note">From the City of Calgary's progress reports to council (open data). Targets and explanations are the City's own.</p></section>`;
}
function caBudget() {
  const list = (CA.commitments || []).filter(c => c.funding && caKeep(c));
  const term = typeof elTerm === 'function' ? elTerm() : '';
  return `<section class="card span-12"><div class="card-head"><div><h2>Budget & Project Delivery</h2><p class="card-sub">Promised against allocated funding, spending where it is published, and where each project stands</p></div>${caFilters(false)}</div>
    <div class="table-wrap ca-repw"><table class="data ca-budget"><thead><tr><th scope="col">Project</th><th scope="col">Promised</th><th scope="col">Allocated</th><th scope="col">Spent</th><th scope="col">Due</th><th scope="col">Status</th></tr></thead>
    <tbody>${list.map(c => `<tr><th scope="row" class="wrap"><button type="button" class="ca-plink" data-cajump="${c.id}">${esc(c.title)}</button></th><td class="wrap">${esc(c.funding.promised || '–')}</td><td class="wrap">${esc(c.funding.allocated || '–')}</td><td class="wrap">${esc(c.funding.spent || '–')}</td><td>${esc(c.expected || '')}</td><td>${caBadge(c.status)}</td></tr>`).join('')}</tbody></table></div>
    <p class="card-note">For the City's budget line by line, see City budget; for roads and pipes, Infrastructure condition.</p></section>
    ${term}`;
}
function caHistory() {
  const ev = [];
  (CA.commitments || []).filter(caKeep).forEach(c => (c.history || []).forEach(h => ev.push({ ...h, c })));
  ev.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return `<section class="card span-12"><div class="card-head"><div><h2>Accountability History</h2><p class="card-sub">Every change in a commitment's status, newest first, with what changed and why. Disputed assessments are marked.</p></div>${caFilters(false)}</div>
    <ol class="ca-hist">${ev.map(e => `<li><span class="ca-hd">${esc(caDate(e.date))}</span><span>${caBadge(e.status === 'Made' ? 'Not yet assessed' : e.status === 'Disputed' ? 'Partly delivered' : e.status).replace(/>[^<]*</, `>${esc(e.status)}<`)}</span>
      <span><button type="button" class="ca-plink" data-cajump="${e.c.id}">${esc(e.c.title)}</button>${e.note ? ` <span class="muted">${esc(e.note)}</span>` : ''}</span></li>`).join('')}</ol>
    <p class="card-note">Last full check of every commitment: ${esc(caDate(CA.checked))}. Official voting and progress records refresh every day.</p></section>`;
}
function caMethod() {
  return `<section class="card span-12"><div class="card-head"><div><h2>Methodology & Evidence</h2><p class="card-sub">How commitments are chosen, checked and rated</p></div></div>
    <div class="ca-method">
      <h3>What is tracked</h3><p>Promises made by parties and candidates that formed government or won office (City council, the Alberta government and the Government of Canada), and formal commitments by those governments that affect Calgary. Each is labelled as a party promise, a candidate promise or a government commitment. Promises of those who did not win office are listed, not rated.</p>
      <h3>What counts as evidence</h3><p>An official record first: a law and its Royal Assent, a council decision, a budget document, a government or City report, a contract or a completed project. News reports are used for dates and figures they quote from those records. Opinion is never evidence; where a rating is disputed, the other view is linked.</p>
      <h3>Statuses</h3><ul>${Object.entries(CA.statuses || {}).map(([k, v]) => `<li>${caBadge(k)} ${esc(v)}</li>`).join('')}</ul>
      <h3>Verification</h3><p>Every commitment carries its source document and date, the evidence for its current status with links, and a history of every change. Commitments are re-checked every week and when news breaks, and the day after any dated decision an entry is waiting on; until that result is recorded, the entry is marked as awaiting the outcome. Official voting and progress records are read again every day.</p>
      <h3>Fairness</h3><p>The same rules for every party, person and government. A status describes a commitment, not a person; voting counts describe attendance and positions, not quality of work.</p>
      <h3>Corrections and limitations</h3><p>Coverage starts with the largest, best-documented commitments and grows. The Alberta Legislature does not publish members' votes as open data. City council votes in open data begin ${esc(caDate((CAR && CAR.council && CAR.council.from) || ''))}. To report an error or suggest a commitment, use the contact form on Invest in Calgary or the developer's contact.</p>
      <h3>Sources read every day</h3><p>${((CAR && CAR.sources) || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher)}: ${esc(s.title)}</a>`).join(' · ')}</p></div></section>`;
}

async function renderCivic() {
  const body = $('#ca-body'); if (!body) return;
  if (!CA) body.innerHTML = '<section class="card span-12"><p class="muted">Reading the commitments…</p></section>';
  await loadCivic();
  if (!CA) { body.innerHTML = '<section class="card span-12"><p>The commitments could not be read just now.</p></section>'; return; }
  const all = CA.commitments || [];
  const done = all.filter(c => /^Delivered/.test(c.status)).length, track = all.filter(c => ['On track', 'In progress'].includes(c.status)).length;
  const hero = `<section class="el-cr span-12 ca-hero"><div class="el-cr-top"><div><div class="el-cr-kicker">Election Data Centre · Civic Accountability</div><h2 class="el-cr-title">Promises, records and results</h2>
      <div class="el-cr-sub">What Calgary's governments and elected members committed to, what the official record shows, and the evidence for every status. City, Alberta and Canada.</div></div></div>
    <div class="el-cr-kpis"><div class="el-kpi"><div class="el-kpi-l">Commitments tracked</div><div class="el-kpi-n">${fmt(all.length)}</div><div class="el-hero-sub">from ${fmt((CA.documents || []).length)} platforms and government records</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Delivered</div><div class="el-kpi-n">${fmt(done)}</div><div class="el-hero-sub">${fmt(all.filter(c => c.status === 'Delivered late').length)} of them late</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Under way</div><div class="el-kpi-n">${fmt(track)}</div><div class="el-hero-sub">on track or in progress</div></div>
      ${CAR && CAR.council ? `<div class="el-kpi"><div class="el-kpi-l">Council votes recorded</div><div class="el-kpi-n">${fmt(((CAR || {}).council || {}).motions || 0)}</div><div class="el-hero-sub">${fmt(((CAR || {}).council || {}).divided_n || 0)} not unanimous</div></div>` : ''}
      ${CAR && CAR.hoc ? `<div class="el-kpi"><div class="el-kpi-l">Commons divisions</div><div class="el-kpi-n">${fmt((((CAR || {}).hoc || {}).divisions || []).length)}</div><div class="el-hero-sub">with every Calgary MP's vote</div></div>` : ''}
      <div class="el-kpi"><div class="el-kpi-l">Last checked</div><div class="el-kpi-n ca-small">${esc(caDate(CA.checked))}</div><div class="el-hero-sub">records refresh daily</div></div></div></section>`;
  const nav = `<nav class="ca-nav span-12" aria-label="Civic Accountability pages">${CA_PAGES.map(([k, t, i]) => `<button type="button" class="ca-navb${k === caPage ? ' is-on' : ''}" data-capage="${k}" ${k === caPage ? 'aria-current="page"' : ''}><span aria-hidden="true">${i}</span>${esc(t)}</button>`).join('')}</nav>`;
  const page = { manifesto: caManifesto, promises: caPromises, reps: caReps, records: caRecords, gov: caGov, budget: caBudget, history: caHistory, method: caMethod }[caPage] || caPromises;
  body.innerHTML = hero + nav + page();
  const re = () => { const y = window.scrollY; renderCivic().then(() => window.scrollTo(0, y)); };
  body.querySelectorAll('[data-capage]').forEach(b => b.addEventListener('click', () => { caPage = b.dataset.capage; caOpen = null; renderCivic(); }));
  body.querySelectorAll('[data-caopen]').forEach(b => b.addEventListener('click', () => { caOpen = caOpen === b.dataset.caopen ? null : b.dataset.caopen; re(); }));
  body.querySelectorAll('[data-cajump]').forEach(b => b.addEventListener('click', () => { caOpen = b.dataset.cajump; caPage = 'promises'; caLevel = caType = caStatus = ''; renderCivic().then(() => { const el = document.getElementById('ca-' + caOpen); if (el) el.scrollIntoView({ block: 'start' }); }); }));
  body.querySelectorAll('[data-castatus]').forEach(b => b.addEventListener('click', () => { caStatus = caStatus === b.dataset.castatus ? '' : b.dataset.castatus; re(); }));
  body.querySelectorAll('[data-cago]').forEach(b => b.addEventListener('click', () => show(b.dataset.cago)));
  body.querySelectorAll('[data-caelsub]').forEach(b => b.addEventListener('click', () => { elSub = b.dataset.caelsub; renderElections(); }));
  [['ca-level', v => { caLevel = v; }], ['ca-type', v => { caType = v; }], ['ca-status', v => { caStatus = v; }]].forEach(([id, f]) => { const s = $('#' + id); if (s) s.addEventListener('change', () => { f(s.value); re(); }); });
}
window.renderCivic = renderCivic;

;
// ---- capmkt.js
/* Calgary Insight: Calgary Capital Markets. Calgary's public companies, from official sources: a company list checked
   by hand (head office city and source for each, capmkt/companies.json) and totals worked out at every refresh from
   TMX's monthly listed-issuer file (capmkt.py). TMX does not allow its file to be redistributed, so only totals are
   shown from it, never one company's figures; a total over fewer than three companies shows a count only. No share
   prices: no source is both open and licensed for publishing them. */
'use strict';

let CMC = null, CMD = null, cmSub = 'overview', cmQ = '', cmEx = '', cmInd = '', cmGrp = 'calgary', cmPage = 0;
const CM_SUBS = [['overview', 'Overview'], ['directory', 'Company directory'], ['industries', 'Industries'], ['activity', 'Market activity'],
  ['performance', 'Company performance'], ['footprint', "Calgary's footprint"], ['history', 'History'], ['method', 'Sources and method']];
async function loadCapMkt() {
  if (!CMC) { try { const r = await fetch('capmkt/companies.json', { cache: 'no-cache' }); if (r.ok) CMC = await r.json(); } catch (e) { /* shown below */ } }
  if (!CMD) { try { const r = await (await api()).get_capmkt(); if (r && r.ok) CMD = r.data; } catch (e) { /* the totals are optional */ } }
}
const cmB = v => isNum(v) ? (v >= 1e12 ? `$${fmt(v / 1e12, 2)} trillion` : v >= 1e9 ? `$${fmt(v / 1e9, v >= 1e11 ? 0 : 1)} billion` : `$${fmt(v / 1e6, 0)} million`) : '–';
const cmPct = v => isNum(v) ? `${fmt(v * 100, 1)}%` : '–';
const cmMonth = d => { if (!d) return ''; const [y, m] = d.split('-'); return `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][+m - 1]} ${y}`; };
const cmT = () => (CMD && CMD.totals) || null;
const cmCos = () => (CMC && CMC.companies) || [];
function cmKpi(label, value, sub, method) {
  return `<div class="el-kpi cm-kpi"><div class="el-kpi-l">${esc(label)}</div><div class="el-kpi-n">${value}</div><div class="el-hero-sub">${esc(sub || '')}</div>${method ? `<details class="cm-how"><summary>How it's counted</summary><p>${esc(method)}</p></details>` : ''}</div>`;
}
function cmBars(rows, valKey, fmtFn) {
  const max = Math.max(1, ...rows.map(r => r[valKey] || 0));
  return `<div class="cm-bars">${rows.map(r => `<div class="cm-bar"><span class="cm-bl">${esc(r.label)}</span><span class="cm-bt"><i style="width:${Math.max(1, (r[valKey] || 0) / max * 100)}%"></i></span><b>${fmtFn(r[valKey], r)}</b></div>`).join('')}</div>`;
}

function cmOverview() {
  const T = cmT(), cos = cmCos(), cal = cos.filter(c => c.group === 'calgary');
  const src = T ? `TMX listed-issuer file, ${cmMonth(T.month)} month-end` : 'TMX file not read at this refresh';
  const C = T ? T.calgary : null, A = T ? T.alberta : null;
  const ind = C ? Object.entries(C.by_industry).map(([k, v]) => ({ label: k, n: v.n, mcap: v.mcap })) : [];
  const size = C ? Object.entries(C.by_size).map(([k, v]) => ({ label: k, n: v })) : [];
  return `<section class="el-cr span-12 cm-hero"><div class="el-cr-top"><div><div class="el-cr-kicker">Calgary Capital Markets</div><h2 class="el-cr-title">Calgary's public companies</h2>
      <div class="el-cr-sub">Companies headquartered in Calgary and listed on Canada's stock exchanges: how many, how much they are worth together, in which industries, and Calgary's place in Canada's public markets. Each head office is checked against the company's own website or filings.</div></div></div>
    <div class="el-cr-kpis">
      ${cmKpi('Calgary-headquartered companies', fmt(cal.length), `TSX ${fmt(cal.filter(c => c.exchange === 'TSX').length)} · TSXV ${fmt(cal.filter(c => c.exchange === 'TSXV').length)}; ${fmt(cos.filter(c => c.group === 'unconfirmed').length)} more Alberta companies still to confirm`, 'Companies on the TSX and TSXV that TMX lists with an Alberta head office, each checked against its own website or filings (a few, where the website blocks automated reading, against Wikipedia, marked). Funds, exchange-traded products and capital pool companies are left out. TSXV companies\' industry follows the exchange\'s sector until checked. Checked ' + (CMC ? CMC.checked : '') + '.')}
      ${cmKpi('Their total market value', C ? cmB(C.all.mcap) : '–', src, 'The sum of each company\'s market capitalization in TMX\'s monthly file (quoted shares at the month-end price), for the companies confirmed in Calgary. Not a live figure.')}
      ${cmKpi("Share of Canada's listed market value", C ? cmPct(C.share_of_canada_mcap) : '–', 'TSX and TSXV operating companies', 'Calgary companies\' market value over that of every operating company on the TSX and TSXV (funds and exchange-traded products left out), same month.')}
      ${cmKpi('Alberta-headquartered, TSX and TSXV', A ? fmt(A.all.n) : '–', A ? Object.entries(A.by_exchange).map(([k, v]) => `${k} ${fmt(v.n)}`).join(' · ') : '', 'Operating companies TMX lists with an Alberta head office, by exchange. The TMX file gives the province only, not the city.')}
      ${cmKpi('New Alberta listings, last 12 months', A ? fmt(A.new_12m.n) : '–', A ? Object.entries(A.new_12m.by_type).map(([k, v]) => `${k} ${v}`).join(' · ') : '', 'Alberta-headquartered operating companies whose listing date in the TMX file falls in the last 12 months, by how they listed (IPO, qualifying transaction, reverse takeover, graduation from the TSXV and others).')}
      ${cmKpi('Canadian Securities Exchange', 'Not yet', 'no downloadable list of CSE companies found', 'The CSE publishes its listings as web pages only. Calgary companies on the CSE will be added by hand.')}</div></section>
    <section class="card span-6"><div class="card-head"><div><h2>Calgary companies by industry</h2><p class="card-sub">Number of companies; total market value where three or more</p></div></div>
      ${ind.length ? cmBars(ind, 'n', (v, r) => `${fmt(v)}${isNum(r.mcap) ? ` · ${cmB(r.mcap)}` : ''}`) : '<p class="muted">Not read at this refresh.</p>'}</section>
    <section class="card span-6"><div class="card-head"><div><h2>Calgary companies by size</h2><p class="card-sub">Market value at the TMX month-end</p></div></div>
      ${size.length ? cmBars(size, 'n', v => fmt(v)) : '<p class="muted">Not read at this refresh.</p>'}
      <p class="card-note">Bands: large C$10 billion or more; mid C$2 to 10 billion; small C$300 million to 2 billion; micro under C$300 million.</p></section>`;
}
function cmRows() {
  const q = cmQ.trim().toLowerCase();
  return cmCos().filter(c => (!cmGrp || c.group === cmGrp) && (!cmEx || c.exchange === cmEx) && (!cmInd || c.industry === cmInd)
    && (!q || `${c.name} ${c.ticker} ${c.city || ''} ${c.sub || ''}`.toLowerCase().includes(q)));
}
function cmDirectory() {
  const cos = cmCos(), rows = cmRows(), G = (CMC && CMC.groups) || {}, sec = (CMD && CMD.sec) || {}, tc = (CMD && CMD.ticker_check) || {};
  const inds = [...new Set(cos.map(c => c.industry))].sort();
  const per = 50, pages = Math.max(1, Math.ceil(rows.length / per)); cmPage = Math.min(cmPage, pages - 1);
  const LBL = { 'cm-grp': 'Group', 'cm-ex': 'Exchange', 'cm-ind': 'Industry' };
  const sel = (id, v, opts) => `<select id="${id}" class="select" aria-label="${LBL[id] || 'Filter'}">${opts.map(([k, t]) => `<option value="${esc(k)}" ${k === v ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
  return `<section class="card span-12"><div class="card-head"><div><h2>Company directory</h2><p class="card-sub">${esc(CMC ? CMC.coverage : '')} ${fmt(rows.length)} match.</p></div>
      <div class="card-tools sr-tools"><label class="sr-only" for="cm-q">Search</label><input id="cm-q" type="search" placeholder="Name, ticker or city" value="${esc(cmQ)}">
      ${sel('cm-grp', cmGrp, [['', 'Every group'], ...Object.entries(G)])}${sel('cm-ex', cmEx, [['', 'Every exchange'], ['TSX', 'TSX'], ['TSXV', 'TSXV']])}${sel('cm-ind', cmInd, [['', 'Every industry'], ...inds.map(i => [i, i])])}
      <button class="btn" id="cm-csv">Download CSV</button></div></div>
    <div class="table-wrap ca-repw"><table class="data cm-dir"><thead><tr><th scope="col">Company</th><th scope="col">Exchange</th><th scope="col">Head office</th><th scope="col">Industry</th><th scope="col">Filings and links</th></tr></thead>
    <tbody>${rows.slice(cmPage * per, cmPage * per + per).map(c => { const s = sec[c.ticker];
      return `<tr><th scope="row">${esc(c.name)}<div class="muted small">${esc(c.ticker)}${tc[c.ticker] === false ? ' · <span class="cm-warn" title="Not found under this ticker in TMX\'s company directory">ticker to check</span>' : ''}</div></th>
        <td>${esc(c.exchange)}</td><td class="wrap">${esc(c.city || 'Not yet confirmed')}<div class="muted small">${esc(G[c.group] || '')}${c.note ? `: ${esc(c.note)}` : ''}</div>${c.hq_source ? `<a class="small" href="${esc(c.hq_source)}" target="_blank" rel="noopener">Source</a>${/wikipedia/.test(c.hq_source) ? ' <span class="muted small">(Wikipedia)</span>' : ''}` : ''}</td>
        <td class="wrap">${esc(c.industry)}<div class="muted small">${esc(c.sub || '')}</div></td>
        <td class="wrap cm-links">${c.website ? `<a href="${esc(c.website)}" target="_blank" rel="noopener">Website</a>` : ''}
          <a href="https://www.sedarplus.ca/" target="_blank" rel="noopener" title="Search the company on SEDAR+">SEDAR+</a>
          <a href="https://money.tmx.com/en/quote/${encodeURIComponent(c.ticker)}" target="_blank" rel="noopener" title="Quote on TMX Money (delayed)">Quote</a>
          ${s && s.filings_url ? `<a href="${esc(s.filings_url)}" target="_blank" rel="noopener">SEC filings</a>` : ''}
          ${s && s.latest_filing ? `<div class="muted small">Latest US filing: ${esc(s.latest_filing[0])}, ${esc(s.latest_filing[1])}</div>` : ''}</td></tr>`; }).join('') || '<tr><td colspan="5" class="empty">Nothing matches these filters.</td></tr>'}</tbody></table></div>
    <div class="iv-pager"><button class="btn" data-cmpage="-1" ${cmPage ? '' : 'disabled'}>Previous</button><span>Page ${cmPage + 1} of ${pages}</span><button class="btn" data-cmpage="1" ${cmPage < pages - 1 ? '' : 'disabled'}>Next</button></div>
    <p class="card-note">Head office groups are kept apart: headquartered in Calgary; headquartered elsewhere with an office in Calgary; headquartered in Alberta outside Calgary; and companies TMX lists in Alberta whose own address is elsewhere. Market value, share price and revenue are not shown company by company: TMX's file may not be redistributed, and prices need a licensed feed. Each company's quote (delayed) is one tap away on TMX Money.</p></section>`;
}
function cmIndustries() {
  const T = cmT(); if (!T) return '<section class="card span-12"><p class="muted">The totals were not read at this refresh.</p></section>';
  const C = T.calgary.by_industry, A = T.alberta.by_sector;
  const tbl = (obj, tot) => `<div class="table-wrap ca-repw"><table class="data"><thead><tr><th scope="col">Industry</th><th scope="col" class="num">Companies</th><th scope="col" class="num">Total market value</th><th scope="col" class="num">Share of the value</th></tr></thead>
    <tbody>${Object.entries(obj).map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td class="num">${fmt(v.n)}</td><td class="num">${isNum(v.mcap) ? cmB(v.mcap) : '<span class="muted">fewer than 3</span>'}</td><td class="num">${isNum(v.mcap) && tot ? cmPct(v.mcap / tot) : ''}</td></tr>`).join('')}</tbody></table></div>`;
  return `<section class="card span-12"><div class="card-head"><div><h2>Calgary-headquartered companies by industry</h2><p class="card-sub">Our industry groups, from what each company does (TSXV companies: from the exchange's sector until checked); ${esc(cmMonth(T.month))} month-end values</p></div></div>${tbl(C, T.calgary.all.mcap)}
      <p class="card-note">Energy includes oil and gas producers, royalty companies and energy services. A total over fewer than three companies is not shown, because it would give a company's own figure from TMX's file.</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>Every Alberta-headquartered company by TMX sector</h2><p class="card-sub">TSX and TSXV operating companies, by the sector TMX gives</p></div></div>${tbl(A, T.alberta.all.mcap)}</section>`;
}
function cmActivity() {
  const T = cmT(), A = T && T.alberta;
  return `<section class="card span-12"><div class="card-head"><div><h2>New listings</h2><p class="card-sub">Alberta-headquartered operating companies listed in the 12 months to ${esc(T ? cmMonth(T.month) : '')}, by how they came to market</p></div></div>
      ${A ? cmBars(Object.entries(A.new_12m.by_type).map(([k, v]) => ({ label: k, n: v })), 'n', v => fmt(v)) : '<p class="muted">Not read at this refresh.</p>'}
      <p class="card-note">From TMX's listing date and listing type. IPO: initial public offering. QT: qualifying transaction (a capital pool company's first business). RTO: reverse takeover. TSXV Grad: moved up from the TSX Venture Exchange. TSX Comedown: moved from the TSX to the TSXV. Delistings and the companies that left are not in a single month's file; they will show as the count changes month to month.</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>Deals, financings and announcements</h2><p class="card-sub">Being compiled</p></div></div>
      <p>Major equity financings, mergers and acquisitions, delistings and announcements involving Calgary companies will be listed here, each with its source, marked as completed or proposed, and with its Calgary connection stated. Until then, TMX publishes Canada-wide financing totals every month.</p>
      <p><a href="https://www.tsx.com/en/listings/current-market-statistics" target="_blank" rel="noopener">TMX market statistics</a> · <a href="https://www.sedarplus.ca/" target="_blank" rel="noopener">SEDAR+ filings</a></p></section>`;
}
function cmPerformance() {
  const sec = (CMD && CMD.sec) || {}, cos = cmCos().filter(c => sec[c.ticker] && sec[c.ticker].series);
  const yrs = s => s ? Object.keys(s.years) : [];
  const val = (s, y) => { if (!s || !isNum(s.years[y])) return '–'; const v = s.years[y]; return /USD\/shares|CAD\/shares|\/shares/.test(s.unit) ? `${s.unit.split('/')[0]} ${fmt(v, 2)}` : `${s.unit} ${cmB(v).replace('$', '')}`; };
  const body = cos.length ? cos.map(c => { const S = sec[c.ticker].series, ys = [...new Set([...yrs(S.revenue), ...yrs(S.net_income), ...yrs(S.dividends_per_share)])].sort().slice(-5);
    return `<details class="cm-co"><summary><b>${esc(c.name)}</b> <span class="muted">${esc(c.ticker)} · ${esc(sec[c.ticker].annual_form ? sec[c.ticker].annual_form[0] : '')}</span></summary>
      <div class="table-wrap ca-repw"><table class="data compact"><thead><tr><th scope="col">Fiscal year</th>${ys.map(y => `<th scope="col" class="num">${y}</th>`).join('')}</tr></thead><tbody>
      ${[['Revenue', S.revenue], ['Net income', S.net_income], ['Dividends per share', S.dividends_per_share]].map(([l, s]) => `<tr><th scope="row">${l}</th>${ys.map(y => `<td class="num">${val(s, y)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="card-note">From the company's annual reports filed with the US SEC (${esc(sec[c.ticker].latest_filing ? `latest filing ${sec[c.ticker].latest_filing[1]}` : '')}). <a href="${esc(sec[c.ticker].filings_url)}" target="_blank" rel="noopener">Filings</a></p></details>`; }).join('')
    : `<p>Company financial results will appear here for the Calgary companies that also file with the US Securities and Exchange Commission, which publishes them as open data: revenue, net income and dividends per share by year. ${CMD && CMD.errors && CMD.errors.sec ? `<span class="muted">${esc(CMD.errors.sec)}</span>` : ''}</p>`;
  return `<section class="card span-12"><div class="card-head"><div><h2>Company performance: financial results</h2><p class="card-sub">What the companies earned, from their own filings. This is the company's financial performance, not its share price.</p></div></div>${body}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Share prices and index comparison</h2><p class="card-sub">Not shown</p></div></div>
      <p>Share prices, market value over time and comparison with the S&amp;P/TSX indices need a data feed licensed for publishing; none is both open and licensed. Each company's delayed quote is linked from the directory. If a licensed end-of-day feed is added later, price history will appear here, labelled with its date and source.</p></section>`;
}
function cmFootprint() {
  const T = cmT(), H = (CMD && CMD.history) || [];
  if (!T) return '<section class="card span-12"><p class="muted">The totals were not read at this refresh.</p></section>';
  const share = [{ label: 'Calgary-headquartered (checked)', v: T.calgary.share_of_canada_mcap }, { label: 'All of Alberta', v: T.alberta.share_mcap }];
  return `<section class="card span-6"><div class="card-head"><div><h2>Share of Canada's listed market value</h2><p class="card-sub">TSX and TSXV operating companies, ${esc(cmMonth(T.month))}</p></div></div>
      ${cmBars(share, 'v', v => cmPct(v))}<p class="card-note">Alberta: ${fmt(T.alberta.all.n)} of Canada's ${fmt(T.canada.all.n)} operating companies (${cmPct(T.alberta.share_count)}) and ${cmPct(T.alberta.share_mcap)} of their value. Calgary companies hold ${cmPct(T.calgary.share_of_alberta_mcap)} of Alberta's value.</p></section>
    <section class="card span-6"><div class="card-head"><div><h2>Energy at the centre</h2><p class="card-sub">Calgary's checked companies, TSX and TSXV</p></div></div>
      ${(() => { const e = T.calgary.by_industry['Energy: oil and gas'], p = T.calgary.by_industry['Pipelines, utilities and power']; return `<p>${e ? `${fmt(e.n)} of the ${fmt(T.calgary.all.n)} Calgary-headquartered companies checked are in oil and gas production, royalties or energy services, worth ${cmB(e.mcap)} together (${cmPct(e.mcap / T.calgary.all.mcap)} of the total).` : ''} ${p ? `Pipelines, utilities and power add ${fmt(p.n)} companies and ${cmB(p.mcap)}.` : ''}</p>`; })()}
      <p class="card-note">From the TMX month-end values; the industry groups are ours.</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>Over time</h2><p class="card-sub">One point for each TMX month read; head office moves will show as companies enter or leave the list</p></div></div>
      <div class="table-wrap ca-repw"><table class="data"><thead><tr><th scope="col">Month</th><th scope="col" class="num">Calgary companies (checked)</th><th scope="col" class="num">Their value</th><th scope="col" class="num">Alberta companies</th><th scope="col" class="num">Alberta's value</th></tr></thead>
      <tbody>${H.slice().reverse().map(h => `<tr><th scope="row">${esc(cmMonth(h.month))}</th><td class="num">${fmt(h.calgary_n)}</td><td class="num">${cmB(h.calgary_mcap)}</td><td class="num">${fmt(h.alberta_n)}</td><td class="num">${cmB(h.alberta_mcap)}</td></tr>`).join('')}</tbody></table></div>
      <p class="card-note">The series starts with the first month read. How many companies moved their head office into or out of Calgary can only be counted from here on, as the checked list is kept month by month.</p></section>`;
}
function cmHistory() {
  return `<section class="card span-12"><div class="card-head"><div><h2>Calgary's stock exchange</h2><p class="card-sub">From the first exchange in Alberta to the TSX Venture Exchange</p></div></div>
    <ol class="ca-hist cm-hist">
      <li><span class="ca-hd">October 25, 1913</span><span></span><span>The exchange is incorporated by an act of the Province of Alberta, and begins trading in 1914 in the Lougheed Building in Calgary, during the Turner Valley oil boom.</span></li>
      <li><span class="ca-hd">1917 to 1925</span><span></span><span>Trading stops.</span></li>
      <li><span class="ca-hd">1926</span><span></span><span>It reopens as the Calgary Stock Exchange.</span></li>
      <li><span class="ca-hd">1975</span><span></span><span>Renamed the Alberta Stock Exchange.</span></li>
      <li><span class="ca-hd">November 29, 1999</span><span></span><span>The Alberta and Vancouver stock exchanges combine to form the Canadian Venture Exchange (CDNX), under an agreement among Canada's exchanges that left senior companies to Toronto and derivatives to Montréal. The new exchange's corporate head office was in Calgary.</span></li>
      <li><span class="ca-hd">2001</span><span></span><span>The Toronto Stock Exchange's owner, TSX Group (now TMX Group), acquires the Canadian Venture Exchange, which becomes the TSX Venture Exchange. Calgary remains one of its head office cities, with Vancouver.</span></li>
      <li><span class="ca-hd">Today</span><span></span><span>Calgary companies list on the TSX, the TSX Venture Exchange and the Canadian Securities Exchange; ${CMD && CMD.totals ? `Alberta-headquartered companies hold ${cmPct(CMD.totals.alberta.share_mcap)} of the value of Canada's TSX and TSXV operating companies.` : ''}</span></li></ol>
    <p class="card-note">Sources: <a href="https://searcharchives.ucalgary.ca/alberta-stock-exchange" target="_blank" rel="noopener">University of Calgary Archives: Alberta Stock Exchange</a>; <a href="https://en.wikipedia.org/wiki/TSX_Venture_Exchange" target="_blank" rel="noopener">TSX Venture Exchange (Wikipedia)</a>.</p></section>`;
}
function cmMethod() {
  const E = (CMD && CMD.errors) || {};
  return `<section class="card span-12"><div class="card-head"><div><h2>Sources and method</h2><p class="card-sub">What each figure is, where it comes from and what it leaves out</p></div></div>
    <div class="ca-method">
      <h3>The company list</h3><p>Every company TMX lists with an Alberta head office, starting with the Toronto Stock Exchange, is checked company by company: the head office city from the company's own website or filings (or Wikipedia, marked, where the website blocks automated reading), the group it belongs to, its industry and website. Groups are never mixed: headquartered in Calgary; headquartered elsewhere with an office in Calgary; headquartered in Alberta outside Calgary; listed in Alberta by TMX but with an address elsewhere; not yet confirmed. Tickers are checked against TMX's company directories at every refresh. Last full check: ${esc(CMC ? CMC.checked : '')}.</p>
      <h3>Totals</h3><p>Counts and market values come from TMX's monthly file of TSX and TSXV issuers (${esc(cmT() ? cmMonth(cmT().month) : '')}): market capitalization is the quoted shares at the month-end price. Funds and exchange-traded products are left out. TMX does not allow the file to be copied or redistributed, so only totals are published, worked out the same way every month; a total over fewer than three companies shows a count only.</p>
      <h3>Financial results</h3><p>Revenue, net income and dividends per share come from the annual reports companies file with the US Securities and Exchange Commission, as published in its open financial data. Only companies that also file in the United States are covered.</p>
      <h3>Not available</h3><p>Live, delayed or historical share prices, market value over time and index comparisons need a licensed data feed. Company filings do not carry share prices. The Canadian Securities Exchange publishes no downloadable company list. SEDAR+ holds every Canadian filing but does not allow automated collection.</p>
      <h3>Updates</h3><p>Totals and ticker checks: every website refresh; TMX's file changes monthly. Company list: re-checked each quarter and when a company lists, merges or moves.</p>
      ${Object.keys(E).length ? `<h3>At this refresh</h3><ul>${Object.entries(E).map(([k, v]) => `<li>${esc(k)}: ${esc(v)}</li>`).join('')}</ul>` : ''}
      <h3>Sources</h3><p>${((CMD && CMD.sources) || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher)}: ${esc(s.title)}</a>`).join(' · ')}</p></div></section>`;
}

async function renderCapMkt() {
  const body = $('#cm-body'); if (!body) return;
  const y = window.scrollY;
  if (!CMC) body.innerHTML = '<section class="card span-12"><p class="muted">Reading the company list…</p></section>';
  await loadCapMkt();
  if (!CMC) { body.innerHTML = '<section class="card span-12"><p>The company list could not be read just now.</p></section>'; return; }
  const page = { overview: cmOverview, directory: cmDirectory, industries: cmIndustries, activity: cmActivity, performance: cmPerformance, footprint: cmFootprint, history: cmHistory, method: cmMethod }[cmSub] || cmOverview;
  body.innerHTML = `<nav class="el-subtabs span-12" aria-label="Calgary Capital Markets sections">${CM_SUBS.map(([k, t]) => `<button type="button" class="el-subtab${k === cmSub ? ' is-on' : ''}" data-cmsub="${k}" ${k === cmSub ? 'aria-current="page"' : ''}>${esc(t)}</button>`).join('')}</nav>`
    + page() + `<section class="card span-12"><p class="card-note">Totals from TMX Group's listed-issuer file (${esc(cmT() ? cmMonth(cmT().month) : 'not read')}), credited to TMX; head offices checked by hand${CMD && CMD.stale ? '; the totals are from the last refresh that read the file' : ''}. Not investment advice. <button type="button" class="link-btn small" data-method="capmkt">How this is worked out</button></p></section>`;
  const re = () => renderCapMkt().then(() => window.scrollTo(0, y));
  body.querySelectorAll('[data-cmsub]').forEach(b => b.addEventListener('click', () => { cmSub = b.dataset.cmsub; renderCapMkt(); }));
  body.querySelectorAll('[data-cmpage]').forEach(b => b.addEventListener('click', () => { cmPage += +b.dataset.cmpage; re(); }));
  [['cm-grp', v => { cmGrp = v; }], ['cm-ex', v => { cmEx = v; }], ['cm-ind', v => { cmInd = v; }]].forEach(([id, f]) => { const s = $('#' + id); if (s) s.addEventListener('change', () => { f(s.value); cmPage = 0; re(); }); });
  const q = $('#cm-q'); if (q) { let t; q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { cmQ = q.value; cmPage = 0; const p = q.selectionStart; re().then(() => { const n = $('#cm-q'); if (n) { n.focus(); n.setSelectionRange(p, p); } }); }, 250); }); }
  const csv = $('#cm-csv'); if (csv) csv.addEventListener('click', async () => { const G = CMC.groups || {};
    await (await api()).save_csv('Calgary public companies', ['Company', 'Ticker', 'Exchange', 'Head office', 'Group', 'Industry', 'Type', 'Website', 'Head office source'],
      cmRows().map(c => [c.name, c.ticker, c.exchange, c.city || '', G[c.group] || '', c.industry, c.sub || '', c.website || '', c.hq_source || ''])); });
}
window.renderCapMkt = renderCapMkt;

;
// ---- invest.js
/* Calgary Insight: Invest in Calgary. Every business we can find in Calgary (City business licences and
   OpenStreetMap), grouped and searchable; where each kind of business is underserved for the people who live nearby;
   growth and new licences; and the Business Economist (behind its own passcode) that writes business
   plans from all the data on Calgary Insight. business.py builds the list; the index is worked out here with the
   residents counted the way chosen in Settings. */
'use strict';

let ivFSrc = '', ivDirMap = null, ivDirView = null, ivDirLayer = null;
let IV = null, IVP = null, ivSub = 'opps', ivCat = 'grocery', ivRad = 2, ivQ = '', ivFCat = '', ivFComm = '', ivPage = 0, ivMap = null;
let ivBusy = false, ivThread = [], ivOwn = null;
const IV_SUBS = [['opps', 'Opportunities'], ['index', 'Underserved index'], ['list', 'Business directory'], ['growth', 'Growth'], ['economist', 'Business Economist']];
const ivMon = ym => { const [y, m] = String(ym).split('-'); return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m - 1] || m} ${y}`; };
const ivP = (v, d = 0) => isNum(v) ? `${fmt(v * 100, d)}%` : '–';

async function loadInvest() {
  if (IV) return IV;
  try { const r = await (await api()).get_business(); if (r && r.ok && r.data) { IV = r.data; IVP = r.people || null; if (ivHomeOk() && !ivRadSet) ivRad = 800; } } catch (e) { /* shown below */ }
  return IV;
}
// distance: 400 or 800 = metres from every home (the Growth vs amenities way); 1, 2 or 3 = km around a community's centre
let ivRadSet = false;
function ivHomeOk() { const A = IV && IV.home_access; return !!(A && A.city && Object.keys(A.city).length && A.share_m && A.typ_m); }
const ivWalkR = r => r >= 100;                       // 400 or 800 m: walking distance
const ivHome = r => ivHomeOk() && (ivWalkR(r) || r <= 3);   // measured from every home (walk, or 1 to 3 km around a home)
const ivDist = r => ivWalkR(r) ? `${fmt(r)} m` : `${r} km`;
const ivRadTxt = r => ivHome(r) ? `${ivDist(r)} of home` : `${r} km`;
const ivWalk = r => r <= 400 ? 'five-minute walk' : 'ten-minute walk';
// where a business was found: City licence (L), OpenStreetMap (O), Overture Maps (V); several letters = counted once
function ivSrc(code) {
  if (code === 'H') return 'City licence (home-based)';
  const n = { L: 'City licence', O: 'OpenStreetMap', V: 'Overture Maps', B: 'City licence + OpenStreetMap' };
  return String(code || '').split('').map(c => n[c]).filter(Boolean).join(' + ');
}
const ivUrl = u => { const t = String(u || '').trim(); return /^https?:\/\//i.test(t) ? t : ''; };
function ivCats(local) { return (IV.categories || []).filter(c => !local || c.local); }
function ivLabel(k) { return ((IV.categories || []).find(c => c.key === k) || {}).label || k; }
function ivName(c) { const n = (IV.names || {})[c] || c; return n === n.toUpperCase() ? n.toLowerCase().replace(/(^|[\s\-'/(])([a-z])/g, (m, p, x) => p + x.toUpperCase()) : n; }
// residents of every community, counted the way chosen in Settings
function ivPeople() {
  const out = {};
  if (IVP) Object.entries(IVP).forEach(([c, v]) => { out[c] = Array.isArray(v) ? { now: v[0], c21: v[1] } : { now: v, c21: null }; });
  else ((D && D.communities) || []).forEach(c => { if (isNum(c.residents)) out[c.code] = { now: c.residents, c21: c.census2021 }; });
  return out;
}
function ivKm(a, b) { const R = 6371, t = Math.PI / 180, dLat = (b[1] - a[1]) * t, dLon = (b[0] - a[0]) * t; const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * t) * Math.cos(b[1] * t) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }

// the underserved index for one category: businesses within reach against Calgary's rate for the people within reach
let ivIdxKey = '', ivIdx = null;
function ivIndex(cat, rad) {
  const key = `${cat}/${rad}/${Object.keys(IVP || {}).length}`;
  if (key === ivIdxKey) return ivIdx;
  const P = ivPeople(), C = IV.centres || {}, B = IV.communities || {};
  if (ivHome(rad)) return ivIndexHome(cat, rad, key, P, B);
  const codes = Object.keys(C).filter(c => P[c] && P[c].now > 0);
  const totPeople = codes.reduce((a, c) => a + P[c].now, 0);
  const totBiz = Object.values(B).reduce((a, x) => a + ((x.count || {})[cat] || 0), 0);
  const rate = totPeople ? totBiz / totPeople : 0;
  const rows = codes.filter(c => P[c].now >= 500).map(c => {
    let people = 0, biz = 0, grow = 0, c21 = 0;
    Object.keys(C).forEach(j => { if (ivKm(C[c], C[j]) <= rad) { const p = P[j] || {}; people += p.now || 0; if (isNum(p.c21)) { c21 += p.c21; grow += p.now || 0; } biz += (((B[j] || {}).count) || {})[cat] || 0; } });
    const expected = people * rate;
    return { code: c, name: ivName(c), residents: P[c].now, reach: Math.round(people), biz, expected, index: expected ? biz / expected : null, gap: expected - biz,
      growth: c21 ? grow / c21 - 1 : null, here: (((B[c] || {}).count) || {})[cat] || 0, per10k: people ? biz / people * 1e4 : null };
  });
  ivIdxKey = key; ivIdx = { rows, rate, per10k: rate * 1e4, totBiz, totPeople };
  return ivIdx;
}
// from every home: walking distance (the share of homes within 400 or 800 m of one, wherever it is), or 1 to 3 km
// (how many a typical home has within reach, against a typical Calgary home)
function ivIndexHome(cat, rad, key, P, B) {
  const A = IV.home_access, S = A.share_m || [], V = A.typ_m || [], walk = ivWalkR(rad), m = walk ? rad : rad * 1000;
  const ks = S.indexOf(m), ka = S.length + V.indexOf(m), cityA = (A.city || {})[cat] || [];
  const cityShare = isNum(cityA[ks]) ? cityA[ks] / 100 : null, cityAvg = walk ? null : cityA[ka];
  const totPeople = Object.values(P).reduce((a, p) => a + (p.now || 0), 0);
  const totBiz = Object.values(B).reduce((a, x) => a + ((x.count || {})[cat] || 0), 0);
  const rows = Object.keys(P).filter(c => P[c].now >= 500 && ((A.by_comm || {})[c] || {})[cat]).map(c => {
    const a = A.by_comm[c][cat], now = P[c].now, share = a[ks] / 100, without = now * (1 - share);
    const avg = walk ? null : a[ka], short = walk ? null : Math.max(0, cityAvg - avg);
    const index = walk ? (cityShare ? share / cityShare : null) : (cityAvg ? avg / cityAvg : null);
    return { code: c, name: ivName(c), residents: now, reach: now, share, cityShare, without, avg, cityAvg, short, index,
      gap: walk ? without : short, growth: isNum(P[c].c21) && P[c].c21 ? now / P[c].c21 - 1 : null,
      here: (((B[c] || {}).count) || {})[cat] || 0, homes: A.by_comm[c].u };
  });
  ivIdxKey = key; ivIdx = { rows, home: true, walk, city: cityShare, cityAvg, totBiz, totPeople, per10k: totPeople ? totBiz / totPeople * 1e4 : 0 };
  return ivIdx;
}
// the biggest gaps across every neighbourhood category
// A community and kind of business is judged only when at least 15,000 people live within reach (fewer is too small a
// market to call a gap); it is a gap when what is within reach is under 60% of Calgary's rate and at least 1.5 short.
// out.checked: how many pairs were judged, so the count can be read as a share at every distance.
function ivOpportunities(rad) {
  const out = [];
  let checked = 0;
  ivCats(true).forEach(c => {
    const I = ivIndex(c.key, rad);
    I.rows.forEach(r => {
      if (I.home) {                 // walking: under 60% of Calgary's share of homes and 1,000 residents or more without one;
        if (r.index === null) return;   // 1 to 3 km: a typical home has under 60% of what a typical Calgary home has, 1 or more short
        // only where it is normal in Calgary: a quarter of homes have one this close, or a typical home has one this near
        if (I.walk ? (I.city || 0) < 0.25 : (I.cityAvg || 0) < 1) return;
        checked++;
        if (r.index < 0.6 && (I.walk ? r.without >= 1000 : r.short >= 1 && r.residents >= 1000)) out.push({ ...r, cat: c.key, label: c.label, city: I.per10k });
        return;
      }
      if (r.reach < 15000 || r.index === null) return;
      checked++;
      if (r.index < 0.6 && r.gap >= 1.5) out.push({ ...r, cat: c.key, label: c.label, city: I.per10k });
    });
  });
  // one row per community and category; the most people within reach of the fewest businesses first
  out.sort((a, b) => b.gap - a.gap);
  out.checked = checked;
  out.communities = new Set(out.map(o => o.code)).size;
  return out;
}
// how many communities (of 500+ people) have 15,000 people or more within each distance
let ivJKey = '', ivJ = null;
function ivJudged() {
  const key = Object.keys(IVP || {}).length + '/' + Object.keys(IV.centres || {}).length;
  if (key === ivJKey) return ivJ;
  const P = ivPeople(), C = IV.centres || {};
  const codes = Object.keys(C).filter(c => P[c] && P[c].now >= 500);
  ivJ = { all: codes.length };
  [1, 2, 3].forEach(r => { ivJ[r] = codes.filter(c => Object.keys(C).reduce((a, j) => a + (ivKm(C[c], C[j]) <= r ? ((P[j] || {}).now || 0) : 0), 0) >= 15000).length; });
  ivJKey = key;
  return ivJ;
}
let ivGCat = '', ivGComm = '', ivGPage = 0;
const IV_GPAGE = 50;
// one sentence that says what a gap is, in plain words
function ivGapLine(o) {
  if (ivHome(ivRad) && ivWalkR(ivRad)) return `${fmt(o.share * 100, 0)}% of homes in ${o.name} are within ${fmt(ivRad)} m of ${o.label.toLowerCase()}, against ${fmt(o.cityShare * 100, 0)}% across Calgary. About ${fmt(o.without, 0)} residents have none within a ${ivWalk(ivRad)}, counting any just across the community line.`;
  if (ivHome(ivRad)) return `A typical home in ${o.name} has ${fmt(o.avg, 1)} ${o.label.toLowerCase()} within ${ivRad} km, against ${fmt(o.cityAvg, 1)} for a typical Calgary home: about ${fmt(o.short, 0)} fewer. ${fmt(o.share * 100, 0)}% of its homes have at least one within ${ivRad} km (Calgary ${fmt(o.cityShare * 100, 0)}%).`;
  return `${fmt(o.reach)} people live within ${ivRad} km of ${o.name}. They have ${fmt(o.biz)} ${o.biz === 1 ? 'place' : 'places'} of this kind within reach; at Calgary's average (${fmt(o.city, 1)} per 10,000 people) they would have about ${fmt(o.expected, 0)}, so about ${fmt(o.gap, 0)} more could be supported.`;
}
// the columns of a gap table, for the distance chosen
function ivGapHead() {
  if (ivHome(ivRad) && ivWalkR(ivRad)) return `<th class="num" scope="col">Homes within ${fmt(ivRad)} m</th><th class="num" scope="col">Calgary</th><th class="num" scope="col">Residents without one</th><th class="num" scope="col">Index</th>`;
  if (ivHome(ivRad)) return `<th class="num" scope="col">Within ${ivRad} km of a typical home</th><th class="num" scope="col">Calgary's typical home</th><th class="num" scope="col">Short by</th><th class="num" scope="col">Index</th>`;
  return `<th class="num" scope="col">Within ${ivRad} km</th><th class="num" scope="col">At Calgary's rate</th><th class="num" scope="col">Missing</th><th class="num" scope="col">Index</th>`;
}
function ivGapCells(o) {
  if (ivHome(ivRad) && ivWalkR(ivRad)) return `<td class="num">${fmt(o.share * 100, 0)}%</td><td class="num">${fmt(o.cityShare * 100, 0)}%</td><td class="num"><b>${fmt(o.without, 0)}</b></td><td class="num">${fmt(o.index * 100, 0)}</td>`;
  if (ivHome(ivRad)) return `<td class="num">${fmt(o.avg, 1)}</td><td class="num">${fmt(o.cityAvg, 1)}</td><td class="num"><b>${fmt(o.short, 1)}</b></td><td class="num">${fmt(o.index * 100, 0)}</td>`;
  return `<td class="num">${fmt(o.biz)}</td><td class="num">${fmt(o.expected, 1)}</td><td class="num"><b>${fmt(o.gap, 1)}</b></td><td class="num">${fmt(o.index * 100, 0)}</td>`;
}
function ivAllGaps(ops) {
  const cats = [...new Set(ops.map(o => o.cat))].map(k => [k, ivLabel(k)]).sort((a, b) => a[1].localeCompare(b[1]));
  const comms = [...new Set(ops.map(o => o.code))].map(k => [k, ivName(k)]).sort((a, b) => a[1].localeCompare(b[1]));
  const rows = ops.filter(o => (!ivGCat || o.cat === ivGCat) && (!ivGComm || o.code === ivGComm));
  const pages = Math.max(1, Math.ceil(rows.length / IV_GPAGE));
  ivGPage = Math.min(Math.max(0, ivGPage), pages - 1);
  const shown = rows.slice(ivGPage * IV_GPAGE, (ivGPage + 1) * IV_GPAGE);
  return `<section class="card span-12" id="iv-allgaps"><div class="card-head"><div><h2>Every gap (${fmt(ops.length)})</h2><p class="card-sub">Each row is one community and one kind of business, with what it means. Pick a kind of business or a community to narrow it down; tap a community's name to see that kind of business on the map.</p></div>
      <div class="card-tools sr-tools"><label class="sr-only" for="iv-gcat">Kind of business</label><select id="iv-gcat" class="select"><option value="">Every kind of business</option>${cats.map(([k, l]) => `<option value="${k}" ${k === ivGCat ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
      <label class="sr-only" for="iv-gcomm">Community</label><select id="iv-gcomm" class="select"><option value="">Every community</option>${comms.map(([k, l]) => `<option value="${k}" ${k === ivGComm ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
      <button type="button" class="btn small" id="iv-gapcsv">Download (CSV)</button></div></div>
    <p class="card-sub">${fmt(rows.length)} ${rows.length === 1 ? 'gap' : 'gaps'}${pages > 1 ? `, showing ${fmt(ivGPage * IV_GPAGE + 1)} to ${fmt(Math.min(rows.length, (ivGPage + 1) * IV_GPAGE))}` : ''}</p>
    <div class="table-wrap"><table class="data iv-gaps"><thead><tr><th scope="col">Community</th><th scope="col">Business</th>${ivGapHead()}<th scope="col">What it means</th></tr></thead>
    <tbody>${shown.map(o => `<tr><th scope="row"><button type="button" class="link-btn" data-ivgo="${o.cat}">${esc(o.name)}</button></th><td>${esc(o.label)}</td>${ivGapCells(o)}<td class="iv-why">${esc(ivGapLine(o))}</td></tr>`).join('') || `<tr><td colspan="7">No gaps match.</td></tr>`}</tbody></table></div>
    ${pages > 1 ? `<div class="iv-pager"><button type="button" class="btn small" data-ivgpage="-1" ${ivGPage === 0 ? 'disabled' : ''}>Previous</button><span>Page ${ivGPage + 1} of ${pages}</span><button type="button" class="btn small" data-ivgpage="1" ${ivGPage >= pages - 1 ? 'disabled' : ''}>Next</button></div>` : ''}</section>`;
}

function ivByComm(ops) {
  const m = {};
  ops.forEach(o => { (m[o.code] = m[o.code] || []).push(o); });
  return Object.entries(m).sort((a, b) => b[1].length - a[1].length || b[1].reduce((x, o) => x + o.gap, 0) - a[1].reduce((x, o) => x + o.gap, 0)).slice(0, 15)
    .map(([c, xs]) => ({ label: ivName(c), v: xs.length, sub: xs.slice().sort((a, b) => b.gap - a.gap).slice(0, 4).map(o => ivHome(ivRad) && ivWalkR(ivRad) ? `${o.label} (${fmt(o.share * 100, 0)}% of homes)` : `${o.label} (${fmt(o.gap, 0)} short)`).join(' · ') }));
}
function ivTabs() {
  return `<nav class="el-subtabs span-12" aria-label="Invest in Calgary sections">${IV_SUBS.map(([k, t]) => `<button type="button" class="el-subtab${k === ivSub ? ' is-on' : ''}" data-ivsub="${k}" ${k === ivSub ? 'aria-current="page"' : ''}>${esc(t)}${k === 'economist' ? ' <span class="iv-lockmark" aria-label="needs a passcode">🔒</span>' : ''}</button>`).join('')}</nav>`;
}
function ivKpis(list) { return `<div class="el-cr-kpis">${list.map(([l, n, s]) => `<div class="el-kpi"><div class="el-kpi-l">${esc(l)}</div><div class="el-kpi-n">${n}</div><div class="el-hero-sub">${esc(s || '')}</div></div>`).join('')}</div>`; }
function ivCatSelect(id, local, val) {
  const groups = {};
  ivCats(local).forEach(c => { (groups[c.group] = groups[c.group] || []).push(c); });
  return `<select id="${id}" class="select">${Object.entries(groups).map(([g, cs]) => `<optgroup label="${esc(g)}">${cs.map(c => `<option value="${c.key}" ${c.key === val ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</optgroup>`).join('')}</select>`;
}
function ivRadius() {
  const b = (r, t, tip) => `<button type="button" role="radio" aria-checked="${r === ivRad}" data-ivrad="${r}" title="${esc(tip)}">${t}</button>`;
  return `<div class="iv-radbox"><div class="seg small" role="radiogroup" aria-label="Distance">${ivHomeOk() ? b(400, '400 m walk', 'Share of homes within 400 m (about a five-minute walk) of one, wherever it is') + b(800, '800 m walk', 'Share of homes within 800 m (about a ten-minute walk) of one, wherever it is') : ''}${[1, 2, 3].map(r => b(r, `${r} km`, ivHomeOk() ? `How many a typical home has within ${r} km, against a typical Calgary home` : `Businesses against people within ${r} km of each community's centre`)).join('')}</div>
    <div class="iv-radhint">${ivHomeOk() ? 'All measured from every home · walk: one close by? · km: how much choice?' : 'Market size around each community'}</div></div>`;
}

// ---- Opportunities: the main dashboard
function ivOpps() {
  const T = IV.totals || {}, comms = Object.values(IV.communities || {});
  const new12 = comms.reduce((a, x) => a + (x.new12 || 0), 0), prev = comms.reduce((a, x) => a + (x.new_prev || 0), 0);
  const ops = ivOpportunities(ivRad);
  const seen = new Set(), top = ops.filter(o => { const k = o.code + o.cat; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 25);
  const byCat = {};
  ops.forEach(o => { byCat[o.cat] = (byCat[o.cat] || 0) + o.gap; });
  const catRows = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => ({ label: ivLabel(k), v, sub: `${ops.filter(o => o.cat === k).length} communities below 60% of Calgary's ${ivHome(ivRad) ? 'share' : 'rate'}` }));
  const grow = comms.map(x => ({ c: Object.keys(IV.communities).find(k => IV.communities[k] === x), x })).filter(o => o.x.new12 >= 5).sort((a, b) => b.x.new12 - a.x.new12).slice(0, 12);
  return `<section class="el-cr span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Invest in Calgary</div><h2 class="el-cr-title">Where Calgary needs more business</h2>
      <div class="el-cr-sub">${ivHome(ivRad) && ivWalkR(ivRad) ? `Every business we can find, measured from every home: the share of homes within ${fmt(ivRad)} m (a ${ivWalk(ivRad)}) of each kind, wherever it is.` : ivHome(ivRad) ? `Every business we can find, measured from every home: how many of each kind a typical home has within ${ivRad} km, against a typical Calgary home.` : `Every business we can find, set against the people who live within ${ivRad} km.`} Residents are counted the way chosen in Settings.</div></div>${ivRadius()}</div>
    ${ivKpis([['Licensed businesses', fmt(T.licences), 'City of Calgary business licences'], isNum(T.in_both) ? ['Businesses, counted once', fmt(T.unique), `${fmt(T.in_both)} found in more than one source (City licences, OpenStreetMap${T.overture_places ? ', Overture Maps' : ''}), counted once`] : ['Mapped places', fmt(T.osm_places), 'shops, clinics, banks and more on OpenStreetMap'],
      ['New licences, last 12 months', fmt(new12), `${new12 >= prev ? '+' : ''}${prev ? fmt((new12 / prev - 1) * 100, 0) + '%' : '–'} on the 12 months before`], ['Gaps found', `<button type="button" class="iv-kpilink" data-ivjump="iv-allgaps">${fmt(ops.length)}</button>`, `in ${fmt(ops.communities)} communities: ${ops.checked ? fmt(ops.length / ops.checked * 100, 0) : 0}% of the ${fmt(ops.checked)} checked. See every one below`],
      ['Categories', fmt(ivCats().length), `${ivCats(true).length} serve the neighbourhood`], ['Communities', fmt(Object.keys(IV.communities || {}).length), 'with at least one business']])}
      ${ivHome(ivRad) ? `<p class="iv-radnote"><b>How this is measured.</b> From every home on the City's property roll (weighted by its units) to the businesses of each kind around it, wherever they are: a supermarket 400 m away across the community line counts. ${ivWalkR(ivRad) ? `Walking distance asks: is there one close by? A gap: under 60% of Calgary's share of homes within ${fmt(ivRad)} m, and at least 1,000 residents without one; only kinds of business that at least a quarter of Calgary's homes have this close are judged.` : `1 to 3 km asks: how much choice is there? A typical home is the middle one, so a few homes downtown with hundreds of restaurants nearby do not set the bar. A gap: a typical home has under 60% of what a typical Calgary home has within ${ivRad} km, at least one business short, in a community of 1,000 or more; only kinds a typical Calgary home has within ${ivRad} km are judged.`} Every community is judged the same way, whatever its size.</p>` : `<p class="iv-radnote"><b>Why the number of gaps changes with the distance.</b> A community is only judged when at least 15,000 people live within reach; fewer is too small a market to call anything missing. Of the ${fmt(ivJudged().all)} communities with 500 or more residents, ${fmt(ivJudged()[1])} have that many people within 1 km, ${fmt(ivJudged()[2])} within 2 km and ${fmt(ivJudged()[3])} within 3 km: a wider circle lets more communities be judged, so more gaps are found. Of the places judged, the share that are gaps falls as the circle widens (${ops.checked ? fmt(ops.length / ops.checked * 100, 0) : 0}% at ${ivRad} km), because a wider circle takes in more businesses and more people, and evens out. Wider circles also overlap: one short area can show up for several neighbouring communities.</p>`}</section>
    <section class="card span-12"><div class="card-head"><div><h2>The biggest gaps</h2><p class="card-sub">${ivHome(ivRad) && ivWalkR(ivRad) ? `Communities where far fewer homes are within ${fmt(ivRad)} m of a kind of business than across Calgary. Most residents without one first.` : ivHome(ivRad) ? `Communities whose homes have far fewer of a kind of business within ${ivRad} km than a typical Calgary home. Most short first.` : `Communities where people within ${ivRad} km have far fewer of a kind of business than Calgary has per person. "Missing" = how many more it would take to reach Calgary's average.`}</p></div></div>
      <div class="table-wrap sr-wrap"><table class="data"><thead><tr><th scope="col">Community</th><th scope="col">Business</th>${ivHome(ivRad) ? '<th class="num" scope="col">Residents</th>' : `<th class="num" scope="col">People within ${ivRad} km</th>`}${ivGapHead()}<th class="num" scope="col">Growth since 2021</th></tr></thead>
      <tbody>${top.map(o => `<tr><th scope="row"><button type="button" class="link-btn" data-ivgo="${o.cat}">${esc(o.name)}</button></th><td>${esc(o.label)}</td><td class="num">${fmt(o.reach)}</td>${ivGapCells(o)}<td class="num">${isNum(o.growth) ? (o.growth > 0 ? '+' : '') + fmt(o.growth * 100, 0) + '%' : '–'}</td></tr>`).join('')}</tbody></table></div>
      <p class="card-note">${ivHome(ivRad) && ivWalkR(ivRad) ? `Index: the community's share of homes within ${fmt(ivRad)} m as a share of Calgary's (100 = Calgary's average).` : ivHome(ivRad) ? `Index: what a typical home here has within ${ivRad} km, as a share of a typical Calgary home (100 = Calgary's average).` : `Index: businesses within reach as a share of what Calgary's average per person would give (100 = Calgary's average).`} A gap is a lead to check, not a guarantee: a big store just outside the radius, zoning, rents and who the customers are all matter. The Business Economist works these through for a specific plan.</p></section>
    <section class="card span-6"><div class="card-head"><div><h2>Kinds of business with the most room</h2><p class="card-sub">${ivHome(ivRad) && ivWalkR(ivRad) ? `Residents without one within ${fmt(ivRad)} m, added up over every gap` : ivHome(ivRad) ? 'Businesses short for a typical home, added up over every gap' : 'Missing businesses added up over every gap'}</p></div></div>${ecBars(catRows, v => fmt(v, 0))}</section>
    <section class="card span-6"><div class="card-head"><div><h2>Where new businesses are opening</h2><p class="card-sub">New City licences in the last 12 months</p></div></div>${ecBars(grow.map(o => ({ label: ivName(o.c), v: o.x.new12, sub: `${fmt(o.x.new_prev)} the 12 months before` })), v => fmt(v))}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Communities with the most gaps</h2><p class="card-sub">How many kinds of everyday business are short within ${ivRadTxt(ivRad)}, and the biggest of them</p></div></div>${ecBars(ivByComm(ops), v => fmt(v))}</section>
    ${ivAllGaps(ops)}`;
}

// ---- Underserved index for one category, with the map
function ivIndexPage() {
  if (ivHome(ivRad) && !((IV.home_access || {}).city || {})[ivCat]) ivCat = 'grocery';   // walking distance: everyday kinds only
  const I = ivIndex(ivCat, ivRad), rows = I.rows.slice().sort((a, b) => b.gap - a.gap);
  if (I.home) return ivIndexHomePage(I, rows);
  return `<section class="card span-12"><div class="card-head"><div><h2>Underserved index: ${esc(ivLabel(ivCat))}</h2><p class="card-sub">Calgary has ${fmt(I.totBiz)}: ${fmt(I.per10k, 1)} for every 10,000 residents. For each community: how many are within ${ivRad} km against that rate for the people within ${ivRad} km.</p></div>
      <div class="card-tools sr-tools"><label class="sr-only" for="iv-cat">Kind of business</label>${ivCatSelect('iv-cat', false, ivCat)}${ivRadius()}</div></div>
    <div id="iv-map" class="iv-map" role="region" aria-label="Map of the underserved index"></div>
    <div class="ec-key"><span><i style="background:#B91C1C"></i>Under half Calgary's rate</span><span><i style="background:#F59E0B"></i>50 to 90</span><span><i style="background:#94A3B8"></i>90 to 110</span><span><i style="background:#047857"></i>Over 110</span><span>Circle size: people within reach</span></div></section>
    <section class="card span-12"><div class="card-head"><div><h2>Every community</h2><p class="card-sub">Most missing first: the most people within reach of the fewest businesses</p></div><div class="card-tools"><button class="btn" id="iv-csv">Download CSV</button></div></div>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Community</th><th class="num" scope="col">Residents</th><th class="num" scope="col">In the community</th><th class="num" scope="col">People within ${ivRad} km</th><th class="num" scope="col">Within ${ivRad} km</th><th class="num" scope="col">Per 10,000</th><th class="num" scope="col">At Calgary's rate</th><th class="num" scope="col">Index</th><th class="num" scope="col">Missing</th></tr></thead>
    <tbody>${rows.map(r => `<tr><th scope="row">${esc(r.name)}</th><td class="num">${fmt(r.residents)}</td><td class="num">${fmt(r.here)}</td><td class="num">${fmt(r.reach)}</td><td class="num">${fmt(r.biz)}</td><td class="num">${fmt(r.per10k, 1)}</td><td class="num">${fmt(r.expected, 1)}</td><td class="num">${isNum(r.index) ? fmt(r.index * 100, 0) : '–'}</td><td class="num">${r.gap > 0 ? fmt(r.gap, 1) : '–'}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function ivIndexHomePage(I, rows) {
  const d = ivDist(ivRad), w = I.walk;
  const sub = w ? `Across Calgary, ${fmt((I.city || 0) * 100, 0)}% of homes are within ${d} (a ${ivWalk(ivRad)}) of one. For each community: the share of its homes within ${d} of one, wherever it is, against that figure.`
    : `A typical Calgary home has ${fmt(I.cityAvg || 0, 1)} within ${d}. For each community: how many a typical home there has within ${d}, wherever they are, against that figure.`;
  return `<section class="card span-12"><div class="card-head"><div><h2>Underserved index: ${esc(ivLabel(ivCat))}</h2><p class="card-sub">${sub}</p></div>
      <div class="card-tools sr-tools"><label class="sr-only" for="iv-cat">Kind of business</label>${ivCatSelect('iv-cat', true, ivCat)}${ivRadius()}</div></div>
    <div id="iv-map" class="iv-map" role="region" aria-label="Map of the underserved index"></div>
    <div class="ec-key"><span><i style="background:#B91C1C"></i>Under half Calgary's ${w ? 'share' : 'figure'}</span><span><i style="background:#F59E0B"></i>50 to 90</span><span><i style="background:#94A3B8"></i>90 to 110</span><span><i style="background:#047857"></i>Over 110</span><span>Circle size: residents</span></div></section>
    <section class="card span-12"><div class="card-head"><div><h2>Every community</h2><p class="card-sub">${w ? `Most residents without one within ${d} first` : 'Most short first'}</p></div><div class="card-tools"><button class="btn" id="iv-csv">Download CSV</button></div></div>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Community</th><th class="num" scope="col">Residents</th><th class="num" scope="col">In the community</th><th class="num" scope="col">Homes within ${d}</th><th class="num" scope="col">Calgary</th>${w ? '' : `<th class="num" scope="col">Within ${d} of a typical home</th><th class="num" scope="col">Calgary's typical home</th>`}<th class="num" scope="col">Index</th><th class="num" scope="col">${w ? 'Residents without one' : 'Short by'}</th></tr></thead>
    <tbody>${rows.map(x => `<tr><th scope="row">${esc(x.name)}</th><td class="num">${fmt(x.residents)}</td><td class="num">${fmt(x.here)}</td><td class="num">${fmt(x.share * 100, 0)}%</td><td class="num">${fmt((x.cityShare || 0) * 100, 0)}%</td>${w ? '' : `<td class="num">${fmt(x.avg, 1)}</td><td class="num">${fmt(x.cityAvg, 1)}</td>`}<td class="num">${isNum(x.index) ? fmt(x.index * 100, 0) : '–'}</td><td class="num">${w ? fmt(x.without, 0) : fmt(x.short, 1)}</td></tr>`).join('')}</tbody></table></div>
    <p class="card-note">"In the community" counts the businesses inside its boundary; the figures from homes count any within ${d}, inside or outside it.</p></section>`;
}
function ivDrawMap() {
  const el = $('#iv-map'); if (!el || typeof L === 'undefined') return;
  if (ivMap) { try { ivMap.remove(); } catch (e) { /* gone */ } ivMap = null; }
  try {
    ivMap = L.map(el, { scrollWheelZoom: false }).setView([51.045, -114.06], 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap contributors' }).addTo(ivMap);
    const I = ivIndex(ivCat, ivRad), C = IV.centres || {};
    I.rows.forEach(r => { const c = C[r.code]; if (!c || !isNum(r.index)) return;
      const col = r.index < 0.5 ? '#B91C1C' : r.index < 0.9 ? '#F59E0B' : r.index <= 1.1 ? '#94A3B8' : '#047857';
      L.circleMarker([c[1], c[0]], { radius: Math.max(4, Math.min(16, Math.sqrt(r.reach) / (I.home ? 9 : 18))), color: col, fillColor: col, fillOpacity: 0.55, weight: 1 })
        .bindTooltip(I.home ? (I.walk ? `${esc(r.name)}: ${fmt(r.share * 100, 0)}% of homes within ${fmt(ivRad)} m (Calgary ${fmt(r.cityShare * 100, 0)}%), index ${fmt(r.index * 100, 0)}` : `${esc(r.name)}: a typical home has ${fmt(r.avg, 1)} within ${ivRad} km (Calgary ${fmt(r.cityAvg, 1)}), index ${fmt(r.index * 100, 0)}`) : `${esc(r.name)}: ${fmt(r.biz)} within ${ivRad} km for ${fmt(r.reach)} people (index ${fmt(r.index * 100, 0)})`).addTo(ivMap); });
  } catch (e) { el.innerHTML = '<p class="card-note">The map could not be drawn here.</p>'; }
}

// ---- Business directory
// the directory's filters, shared by the table, the map and the CSV
const IV_SRC = [['', 'Every source'], ['L', 'City licence'], ['O', 'OpenStreetMap'], ['V', 'Overture Maps'], ['multi', 'Found in more than one']];
function ivDirRows() {
  const q = ivQ.trim().toLowerCase();
  return (IV.businesses || []).filter(r => (!ivFCat || r[1] === ivFCat) && (!ivFComm || r[3] === ivFComm)
    && (!ivFSrc || (ivFSrc === 'multi' ? String(r[9] || '').replace('H', '').length > 1 : String(r[9] || '').replace('H', 'L').includes(ivFSrc)))
    && (!q || (r[0] || '').toLowerCase().includes(q) || (r[2] || '').toLowerCase().includes(q) || (r[4] || '').toLowerCase().includes(q)));
}
const IV_GCOL = ['#38BDF8', '#F59E0B', '#22C55E', '#A78BFA', '#F472B6', '#EF4444', '#2DD4BF', '#FACC15', '#FFFFFF', '#FB923C', '#94A3B8', '#84CC16'];
function ivGroups() { return [...new Set(ivCats().map(c => c.group))]; }
function ivColor(cat) { const c = (IV.categories || []).find(x => x.key === cat); const g = ivGroups(); return IV_GCOL[Math.max(0, g.indexOf(c ? c.group : '')) % IV_GCOL.length]; }
// every business as a dot, drawn on one canvas so tens of thousands stay quick; a tap finds the nearest dot
function ivDirDraw(rows) {
  const el = $('#iv-dirmap'); if (!el || typeof L === 'undefined') return;
  if (ivDirMap) { try { ivDirView = { c: ivDirMap.getCenter(), z: ivDirMap.getZoom() }; ivDirMap.remove(); } catch (e) { /* gone */ } ivDirMap = null; }
  const pts = rows.filter(r => isNum(r[7]) && isNum(r[8]));
  const map = ivDirMap = L.map(el, { scrollWheelZoom: false, preferCanvas: true });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
  const Dots = L.Layer.extend({
    onAdd(m) { this._c = L.DomUtil.create('canvas', 'iv-dots leaflet-zoom-hide'); m.getPanes().overlayPane.appendChild(this._c); m.on('moveend zoomend resize', this._draw, this); this._draw(); },
    onRemove(m) { L.DomUtil.remove(this._c); m.off('moveend zoomend resize', this._draw, this); },
    _draw() {
      const m = this._map, size = m.getSize(), c = this._c, dpr = window.devicePixelRatio || 1;
      L.DomUtil.setPosition(c, m.containerPointToLayerPoint([0, 0]));
      c.width = size.x * dpr; c.height = size.y * dpr; c.style.width = size.x + 'px'; c.style.height = size.y + 'px';
      const g = c.getContext('2d'); g.scale(dpr, dpr);
      const z = m.getZoom(), r = z >= 16 ? 5 : z >= 14 ? 3.5 : z >= 12 ? 2.4 : 1.6, b = m.getBounds().pad(0.05);
      this._xy = [];
      for (const p of pts) {
        if (!b.contains([p[8], p[7]])) continue;
        const q = m.latLngToContainerPoint([p[8], p[7]]);
        g.beginPath(); g.arc(q.x, q.y, r, 0, 6.2832); g.fillStyle = ivColor(p[1]); g.globalAlpha = 0.85; g.fill();
        if (z >= 15) { g.globalAlpha = 1; g.lineWidth = 1; g.strokeStyle = '#0B1220'; g.stroke(); }
        this._xy.push([q.x, q.y, p]);
      }
    },
  });
  const dots = ivDirLayer = new Dots().addTo(map);
  map.on('click', e => {
    const q = e.containerPoint; let best = null;
    for (const [x, y, p] of dots._xy || []) { const d = (x - q.x) ** 2 + (y - q.y) ** 2; if (d < 144 && (!best || d < best[0])) best = [d, p]; }
    if (!best) return;
    const p = best[1], web = ivUrl(p[10]);
    L.popup().setLatLng([p[8], p[7]]).setContent(`<b>${esc(p[0] || '(no name)')}</b><br>${esc(ivLabel(p[1]))}${p[2] ? ` · ${esc(p[2])}` : ''}<br>${esc(p[4] || '')}${p[3] ? ` · ${esc(ivName(p[3]))}` : ''}<br><small>Found in: ${esc(ivSrc(p[9]))}</small>${web ? `<br><a href="${esc(web)}" target="_blank" rel="noopener nofollow">Website</a>` : ''}${p[11] ? `${web ? ' · ' : '<br>'}${esc(p[11])}` : ''}`).openOn(map);
  });
  if (ivFComm || !ivDirView) {
    if (pts.length) map.fitBounds(L.latLngBounds(pts.map(p => [p[8], p[7]])).pad(0.05)); else map.setView([51.045, -114.06], 11);
  } else map.setView(ivDirView.c, ivDirView.z);
}
function ivList() {
  const q = ivQ.trim().toLowerCase(), B = IV.businesses || [];
  const rows = ivDirRows();
  const per = 100, pages = Math.max(1, Math.ceil(rows.length / per)); ivPage = Math.min(ivPage, pages - 1);
  const comms = Object.keys(IV.communities || {}).sort((a, b) => ivName(a).localeCompare(ivName(b)));
  const src = ivSrc;
  return `<section class="card span-12"><div class="card-head"><div><h2>Business directory</h2><p class="card-sub">${fmt(B.length)} businesses and places from City of Calgary business licences, OpenStreetMap and Overture Maps, each counted once. ${fmt(rows.length)} match the filters; ${fmt(rows.filter(r => isNum(r[7])).length)} of them are on the map.</p></div>
      <div class="card-tools sr-tools"><label class="sr-only" for="iv-q">Search</label><input id="iv-q" type="search" placeholder="Name, type or address" value="${esc(ivQ)}">
      <label class="sr-only" for="iv-fcat">Category</label><select id="iv-fcat" class="select"><option value="">Every category</option>${ivCats().map(c => `<option value="${c.key}" ${c.key === ivFCat ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select>
      <label class="sr-only" for="iv-fsrc">Found in</label><select id="iv-fsrc" class="select">${IV_SRC.map(([k, t]) => `<option value="${k}" ${k === ivFSrc ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>
      <label class="sr-only" for="iv-fcomm">Community</label><select id="iv-fcomm" class="select"><option value="">Every community</option>${comms.map(c => `<option value="${c}" ${c === ivFComm ? 'selected' : ''}>${esc(ivName(c))}</option>`).join('')}</select>
      <button class="btn" id="iv-listcsv">Download CSV</button></div></div>
    <div class="iv-dirmapwrap"><div id="iv-dirmap" class="iv-dirmap" role="region" aria-label="Map of the businesses that match the filters"></div>
      <div class="iv-dirlegend">${ivGroups().map((g, i) => `<span><i style="background:${IV_GCOL[i % IV_GCOL.length]}"></i>${esc(g)}</span>`).join('')}<span class="muted">Tap a dot for the business.</span></div></div>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Business</th><th scope="col">Category</th><th scope="col">Type</th><th scope="col">Community</th><th scope="col">Address</th><th scope="col">First licensed</th><th scope="col">Source</th></tr></thead>
    <tbody>${rows.slice(ivPage * per, ivPage * per + per).map(r => `<tr><th scope="row">${esc(r[0] || '(no name)')}${ivUrl(r[10]) ? ` <a class="iv-web" href="${esc(ivUrl(r[10]))}" target="_blank" rel="noopener nofollow" title="Website">↗</a>` : ''}${r[11] ? `<div class="iv-phone">${esc(r[11])}</div>` : ''}</th><td>${esc(ivLabel(r[1]))}</td><td class="wrap">${esc(r[2] || '')}</td><td>${esc(ivName(r[3]))}</td><td>${esc(r[4] || '')}</td><td>${esc(r[5] || '')}</td><td>${esc(src(r[9]))}</td></tr>`).join('')}</tbody></table></div>
    <div class="iv-pager"><button class="btn" data-ivpage="-1" ${ivPage ? '' : 'disabled'}>Previous</button><span>Page ${ivPage + 1} of ${pages}</span><button class="btn" data-ivpage="1" ${ivPage < pages - 1 ? '' : 'disabled'}>Next</button></div>
    <p class="card-note">Three open sources. The City licenses only some kinds of business (food, personal services, contractors, vehicle repair, liquor and others); most shops, clinics and offices need none, so they come from OpenStreetMap (mapped by volunteers) and Overture Maps (open place data with websites and phone numbers, from the Overture Maps Foundation). A business found in more than one source is shown and counted once, with every source it was found in: the same name within 80 m, nearly the same name within 200 m, or the same name at the same address; a map source listing one place twice is counted once too. Two branches of a chain stay two. Neither map source is complete, and a place listed may have closed.</p></section>`;
}

// ---- Growth
function ivGrowth() {
  const tr = IV.trend || [], groups = [...new Set(tr.flatMap(([, v]) => Object.keys(v)))];
  const years = {};
  tr.forEach(([m, v]) => { const y = m.slice(0, 4); years[y] = years[y] || {}; Object.entries(v).forEach(([g, n]) => { years[y][g] = (years[y][g] || 0) + n; }); });
  const ys = Object.keys(years).sort().slice(-5), last12 = tr.slice(-13, -1), prev12 = tr.slice(-25, -13);
  const sum = (arr, g) => arr.reduce((a, [, v]) => a + (v[g] || 0), 0);
  const gRows = groups.map(g => ({ label: g, v: sum(last12, g), sub: `${fmt(sum(prev12, g))} the 12 months before` })).sort((a, b) => b.v - a.v);
  const months = tr.slice(-24);
  return `<section class="card span-12"><div class="card-head"><div><h2>New business licences, month by month</h2><p class="card-sub">The month each business was first licensed by the City (businesses still licensed today)</p></div></div>
      ${ecBars(months.map(([m, v]) => ({ label: ivMon(m), v: Object.values(v).reduce((a, n) => a + n, 0) })), v => fmt(v))}
      <p class="card-note">A business that closed is no longer in the City's list, so older months count only the businesses that survived: compare recent months with each other, not with years ago.</p></section>
    <section class="card span-6"><div class="card-head"><div><h2>By kind of business, last 12 complete months</h2></div></div>${ecBars(gRows, v => fmt(v))}</section>
    <section class="card span-6"><div class="card-head"><div><h2>By year</h2><p class="card-sub">Still licensed today, by year first licensed</p></div></div>${ecBars(ys.map(y => ({ label: y, v: Object.values(years[y]).reduce((a, n) => a + n, 0) })), v => fmt(v))}</section>`;
}

// ---- Business Economist (its own passcode)
function ivLocked() { return !!(window.CDD_AI && window.CDD_AI.unlocked && !window.CDD_AI.unlocked('biz')); }
function ivContact() {
  const to = (window.CDD_CONTACT || '').trim();
  return `<section class="card span-6 iv-contact"><div class="card-head"><div><h2>Talk to the developer</h2><p class="card-sub">For a passcode, a business plan, or to have your own business data analysed</p></div></div>
    <form id="iv-form" class="iv-form">
      <label>Your name<input name="name" required autocomplete="name"></label>
      <label>Business or idea<input name="business" placeholder="for example: a café in Martindale"></label>
      <label>Email<input name="email" type="email" required autocomplete="email"></label>
      <label>Phone (optional)<input name="phone" type="tel" autocomplete="tel"></label>
      <label>I'm interested in<select name="want"><option>A business plan for a new location</option><option>Analysis of my existing business data</option><option>A passcode for the Business Economist</option><option>Something else</option></select></label>
      <label>Message<textarea name="msg" rows="4"></textarea></label>
      <button class="btn primary" type="submit">${to ? 'Send' : 'Prepare the message'}</button>
      <p class="card-note" id="iv-formmsg" role="status">${to ? 'Opens your email with the message ready to send. Nothing is sent until you press send there.' : 'The contact address is being set up; your message will be ready to copy.'}</p></form></section>`;
}
function ivEconomist() {
  const locked = ivLocked();
  const msgs = ivThread.map(m => `<div class="ea-msg ${m.who}">${m.who === 'you' ? esc(m.text) : (m.html || esc(m.text || ''))}${m.cards ? `<div class="ea-cards">${m.cards}</div>` : ''}</div>`).join('');
  const pitch = `<section class="el-cr span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Invest in Calgary</div><h2 class="el-cr-title">The Business Economist</h2>
      <div class="el-cr-sub">A business plan built on Calgary's own data: who lives within reach and how fast it is growing, households and incomes, the competition street by street, transit stops nearby, crime and 311 issues, weather through the year, rents and new homes. Every figure sourced; the full plan comes as a PDF, an interactive report and an Excel workbook that can be audited.</div></div></div>
    <div class="iv-offer"><div><b>For a new business</b><span>Where to open, how many customers are within reach, the competition, the numbers to break even, and the risks.</span></div>
      <div><b>For an existing business</b><span>Share your own sales data (it stays in your browser) to find trends, seasons, your best days, and where to grow.</span></div>
      <div><b>For investors</b><span>Which kinds of business Calgary is short of, where, and how fast those areas are growing.</span></div></div></section>`;
  const chat = `${window.sampleReport ? sampleReport('biz') : ''}<section class="card span-6 ea-chat"><div class="card-head"><div><h2>Ask the Business Economist</h2><p class="card-sub">Business plans, locations, competition and the numbers behind them</p></div></div>
    ${locked ? `<div class="web-lock ea-lock"><h3>The Business Economist needs its passcode</h3><p>Everything else on Invest in Calgary is open to everyone. The Business Economist needs its own passcode. <b>To get a passcode, contact the developer</b> with the form on this page.</p>
      <form id="iv-unlock"><label class="sr-only" for="iv-code">Business Economist passcode</label><input type="password" id="iv-code" autocomplete="off" placeholder="Business Economist passcode"><button type="submit" class="btn primary">Unlock</button></form><p class="web-lock-msg" id="iv-lockmsg" role="status"></p></div>`
      : `<div class="ea-thread" id="iv-thread">${msgs || '<p class="muted">Describe the business and where you are thinking of opening, or ask which kinds of business a community is short of.</p>'}</div>
      <form class="ea-form" id="iv-ask"><textarea id="iv-text" rows="3" placeholder="For example: a halal grocery in northeast Calgary. Where, and what would it take to break even?" aria-label="Question for the Business Economist"></textarea>
        <div class="ea-btns"><button class="btn primary" type="submit" ${ivBusy ? 'disabled' : ''}>${ivBusy ? 'Working…' : 'Ask'}</button><button class="btn" type="button" id="iv-plan" ${ivBusy ? 'disabled' : ''}>Full business plan</button></div></form>`}
    <p class="card-note">General information from public data, not financial, legal or investment advice. Projections are models with stated assumptions and ranges.</p></section>`;
  const own = `<section class="card span-12"><div class="card-head"><div><h2>Your own business data</h2><p class="card-sub">Open a spreadsheet of your sales (CSV with a date and an amount). It is read in your browser and never sent anywhere; only the summary below is shared if you ask the Economist about it.</p></div>
      <div class="card-tools"><label class="btn" for="iv-file">Open a CSV file</label><input type="file" id="iv-file" accept=".csv,text/csv" hidden></div></div>
    <div id="iv-own">${ivOwn ? ivOwnView() : '<p class="muted">No file opened yet.</p>'}</div></section>`;
  return pitch + chat + ivContact() + own;
}

// owner data: read a CSV in the browser and summarise it
function ivParseCsv(text) {
  // a CSV reader for one file: quoted fields may hold commas, quotes ("") and line breaks
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cur.trim()); cur = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur.trim()); cur = ''; if (row.some(x => x)) rows.push(row); row = []; }
    else cur += ch;
  }
  row.push(cur.trim()); if (row.some(x => x)) rows.push(row);
  return rows;
}
// a date as the file writes it: 2025-03-07, 2025/03/07, 03/07/2025 (month first), 7 Mar 2025, with or without a time
function ivDate(v) {
  const t = String(v || '').trim();
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(t);
  if (m) return ivYmd(+m[1], +m[2], +m[3]);
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/.exec(t);
  if (m) return +m[1] > 12 ? ivYmd(+m[3], +m[2], +m[1]) : ivYmd(+m[3], +m[1], +m[2]);
  if (!/[a-z]{3}/i.test(t) || !/\d{4}/.test(t)) return null;     // "7 Mar 2025", "March 7, 2025"
  const d = new Date(t);
  return isNaN(d) ? null : ivYmd(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
function ivYmd(y, mo, d) {
  if (y < 1990 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return { ym: `${y}-${String(mo).padStart(2, '0')}`, dow: new Date(Date.UTC(y, mo - 1, d)).getUTCDay() };
}
function ivNum(v) {
  let t = String(v ?? '').trim(); if (!t) return NaN;
  const neg = /^\(.*\)$/.test(t) || /^-/.test(t.replace(/^[$\s]+/, ''));
  t = t.replace(/[()$€£,\s]|CAD|USD/gi, '').replace(/^-/, '');
  if (!/^\d*\.?\d+$/.test(t)) return NaN;
  return (neg ? -1 : 1) * parseFloat(t);
}
function ivOwnAnalyse(rows) {
  if (!rows || rows.length < 3) return { error: 'The file has too few rows to analyse.' };
  const head = rows[0].map(h => String(h || '').trim()), body = rows.slice(1), probe = body.slice(0, 50);
  const share = (i, f) => probe.filter(r => f(r[i])).length / Math.max(1, probe.length);
  const dateCols = head.map((h, i) => i).filter(i => share(i, v => ivDate(v)) >= 0.8);
  const di = dateCols.find(i => /date|created|time|day|paid|order/i.test(head[i])) ?? dateCols[0];
  const numCols = head.map((h, i) => i).filter(i => i !== di && share(i, v => isFinite(ivNum(v))) >= 0.8);
  const rank = h => /^(total|net sales|net total|gross sales|sales|amount|revenue|total sales)$/i.test(h) ? 0 : /net sales|gross sales|total(?! ?qty)/i.test(h) && !/sub|tax|discount|ship|qty|quantity|count/i.test(h) ? 1
    : /amount|sales|revenue|price|net/i.test(h) && !/tax|discount|ship|qty|quantity/i.test(h) ? 2 : 9;
  const ni = numCols.slice().sort((a, b) => rank(head[a]) - rank(head[b]))[0];
  if (di === undefined || ni === undefined) return { error: 'Could not find a date column and an amount column in this file. It needs one column of dates and one of amounts (sales, totals or revenue).' };
  const ci = head.findIndex((h, i) => i !== di && i !== ni && /item|product|category|service|lineitem|description/i.test(h));
  const byM = {}, byW = [0, 0, 0, 0, 0, 0, 0], byC = {};
  let total = 0, n = 0, skipped = 0;
  body.forEach(r => { const d = ivDate(r[di]), v = ivNum(r[ni]); if (!d || !isFinite(v)) { skipped++; return; }
    byM[d.ym] = (byM[d.ym] || 0) + v; byW[d.dow] += v; total += v; n++;
    if (ci >= 0 && r[ci]) byC[r[ci]] = (byC[r[ci]] || 0) + v; });
  const keys = Object.keys(byM).sort(); if (!keys.length) return { error: 'No row had both a date and an amount.' };
  // every calendar month from the first to the last, months with no sales as 0
  const ms = []; let [y, mo] = keys[0].split('-').map(Number); const [y1, m1] = keys[keys.length - 1].split('-').map(Number);
  while (y < y1 || (y === y1 && mo <= m1)) { ms.push(`${y}-${String(mo).padStart(2, '0')}`); mo++; if (mo > 12) { mo = 1; y++; } }
  const now = new Date(), cur = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const full = ms[ms.length - 1] >= cur ? ms.filter(k => k < cur) : ms;          // this month is not over yet
  const val = k => byM[k] || 0, last = full.slice(-12), prev = full.slice(-24, -12), s = a => a.reduce((x, k) => x + val(k), 0);
  return { cols: [head[di], head[ni], ci >= 0 ? head[ci] : null], n, skipped, total, months: ms.map(k => [k, Math.round(val(k))]), weekday: byW.map(Math.round),
    last12: s(last), prev12: prev.length === 12 ? s(prev) : null, partial: full.length < ms.length, from: ms[0], to: ms[ms.length - 1], best: full.slice().sort((a, b) => val(b) - val(a)).slice(0, 3).map(ivMon),
    top: Object.entries(byC).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => [k, Math.round(v)]) };
}
function ivOwnView() {
  const o = ivOwn;
  if (o.error) return `<p class="err">${esc(o.error)}</p>`;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], m = o.months.slice(-24);
  return `<div class="fb-kpis">${[['Rows read', fmt(o.n), `dates: "${o.cols[0]}", amounts: "${o.cols[1]}"${o.skipped ? `; ${fmt(o.skipped)} rows without both skipped` : ''}`], ['Total', '$' + fmt(o.total), `${o.from} to ${o.to}, ${o.months.length} months`], [o.partial ? 'Last 12 complete months' : 'Last 12 months in the file', '$' + fmt(o.last12), isNum(o.prev12) ? `${o.last12 >= o.prev12 ? '+' : ''}${fmt((o.last12 / o.prev12 - 1) * 100, 1)}% on the 12 before` : ''], ['Best months', esc(o.best.join(', ')), '']].map(([l, n, s]) => `<div class="fb-kpi"><div class="fb-kpi-l">${esc(l)}</div><div class="fb-kpi-n">${n}</div><div class="fb-kpi-s">${esc(s)}</div></div>`).join('')}</div>
    <h3 class="fb-h3">Month by month <small>the last ${m.length} months${o.partial ? '; this month is not over' : ''}</small></h3>${ecBars(m.map(x => ({ label: ivMon(x[0]), v: x[1] })), v => '$' + fmt(v))}
    <div class="ea-two"><div><h3 class="fb-h3">By day of the week</h3>${ecBars(o.weekday.map((v, i) => ({ label: days[i], v })), v => '$' + fmt(v))}</div>
    ${o.top.length ? `<div><h3 class="fb-h3">Top ${esc(o.cols[2])}</h3>${ecBars(o.top.map(([k, v]) => ({ label: k, v })), v => '$' + fmt(v))}</div>` : ''}</div>
    ${ivLocked() ? '' : '<button class="btn primary" id="iv-ownask">Ask the Economist about these trends</button>'}`;
}
function ivOwnSummary() {
  const o = ivOwn; if (!o || o.error) return '';
  return `My business data summary (from my own sales file; ${o.n} rows): monthly ${o.cols[1]} totals ${JSON.stringify(o.months.slice(-24))}; by weekday Sunday..Saturday ${JSON.stringify(o.weekday)}; last 12 months ${Math.round(o.last12)}${isNum(o.prev12) ? `, the 12 before ${Math.round(o.prev12)}` : ''}${o.top.length ? `; top ${o.cols[2]} ${JSON.stringify(o.top)}` : ''}.`;
}

async function ivAsk(q, full) {
  if (ivBusy || !q.trim()) return;
  ivBusy = true;
  const bot = { who: 'bot', text: full ? 'Planning the business plan…' : 'Working on it…' };
  ivThread.push({ who: 'you', text: full ? `Full business plan: ${q}` : q }, bot);
  renderInvest(true);
  const cards = [], done = typeof eaCatch === 'function' ? eaCatch(bot, cards) : () => {};
  try {
    const a = await api();
    const res = full ? await a.business_report(q, isCity() ? 'Calgary' : W()) : await a.ask(`[Business Economist] Area selected: ${isCity() ? 'all of Calgary' : W()}. ${q}`, 'audit');
    if (res && res.ok) { bot.html = (window.DOMPurify && window.marked) ? DOMPurify.sanitize(marked.parse(res.text || '')) : esc(res.text || ''); bot.text = ''; if (res.report && !cards.some(c => c.includes('ea-report')) && typeof eaReportCard === 'function') cards.unshift(eaReportCard(typeof res.report === 'string' ? { pdf: res.report } : res.report)); }
    else bot.text = (res && res.error) || 'The Business Economist could not answer this time.';
  } catch (e) { bot.text = String(e.message || e); }
  bot.cards = cards.join('');
  done();
  ivBusy = false;
  renderInvest(true);
}

async function renderInvest(keep) {
  const body = $('#iv-body'); if (!body) return;
  const y = window.scrollY;
  if (!IV) body.innerHTML = '<section class="card span-12"><p class="muted">Reading the business list…</p></section>';
  await loadInvest();
  if (!IV) { body.innerHTML = '<section class="card span-12"><p>The business list is not on the website yet. It appears after the next refresh.</p></section>'; return; }
  const page = { opps: ivOpps, index: ivIndexPage, list: ivList, growth: ivGrowth, economist: ivEconomist }[ivSub] || ivOpps;
  body.innerHTML = ivTabs() + page() + `<section class="card span-12"><p class="card-note">Sources: ${(IV.sources || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher)}: ${esc(s.title)}</a>`).join('; ')}. Read ${esc((IV.built_at || '').slice(0, 10))}. Residents: ${esc(((D && D.population) || {}).method_label || 'the count chosen in Settings')}. <button type="button" class="link-btn small" data-method="invest">How this is worked out</button></p></section>`;
  const re = () => renderInvest(true);
  body.querySelectorAll('[data-ivsub]').forEach(b => b.addEventListener('click', () => { ivSub = b.dataset.ivsub; renderInvest(); }));
  body.querySelectorAll('[data-ivrad]').forEach(b => b.addEventListener('click', () => { ivRad = +b.dataset.ivrad; ivRadSet = true; ivGPage = 0; re(); }));
  body.querySelectorAll('[data-ivgo]').forEach(b => b.addEventListener('click', () => { ivCat = b.dataset.ivgo; ivSub = 'index'; renderInvest(); }));
  body.querySelectorAll('[data-ivpage]').forEach(b => b.addEventListener('click', () => { ivPage += +b.dataset.ivpage; re(); }));
  body.querySelectorAll('[data-ivgpage]').forEach(b => b.addEventListener('click', () => { ivGPage += +b.dataset.ivgpage; re().then(() => { const g = $('#iv-allgaps'); if (g) g.scrollIntoView({ block: 'start' }); }); }));
  body.querySelectorAll('[data-ivjump]').forEach(b => b.addEventListener('click', () => { const g = document.getElementById(b.dataset.ivjump); if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  const gc = $('#iv-gcat'); if (gc) gc.addEventListener('change', () => { ivGCat = gc.value; ivGPage = 0; re(); });
  const gm = $('#iv-gcomm'); if (gm) gm.addEventListener('change', () => { ivGComm = gm.value; ivGPage = 0; re(); });
  const gcsv = $('#iv-gapcsv'); if (gcsv) gcsv.addEventListener('click', async () => { const ops = ivOpportunities(ivRad).filter(o => (!ivGCat || o.cat === ivGCat) && (!ivGComm || o.code === ivGComm));
    if (ivHome(ivRad) && !ivWalkR(ivRad)) await (await api()).save_csv(`Business gaps - ${ivRad} km from home`, ['Community', 'Business', 'Residents', `Within ${ivRad} km of a typical home`, "Calgary's typical home", 'Short by', `Homes with one within ${ivRad} km (%)`, 'Index', 'What it means'],
      ops.map(o => [o.name, o.label, o.residents, o.avg, o.cityAvg, +o.short.toFixed(2), +(o.share * 100).toFixed(1), +(o.index * 100).toFixed(0), ivGapLine(o)]));
    else if (ivHome(ivRad)) await (await api()).save_csv(`Business gaps - ${ivRad} m from home`, ['Community', 'Business', 'Residents', `Homes within ${ivRad} m (%)`, 'Calgary (%)', 'Residents without one', 'Index', 'Growth since 2021', 'What it means'],
      ops.map(o => [o.name, o.label, o.residents, +(o.share * 100).toFixed(1), +(o.cityShare * 100).toFixed(1), Math.round(o.without), +(o.index * 100).toFixed(0), isNum(o.growth) ? +(o.growth * 100).toFixed(0) : '', ivGapLine(o)]));
    else await (await api()).save_csv(`Business gaps - ${ivRad} km`, ['Community', 'Business', `People within ${ivRad} km`, `Businesses within ${ivRad} km`, "At Calgary's rate", 'Missing', 'Index', 'Growth since 2021', 'What it means'],
      ops.map(o => [o.name, o.label, o.reach, o.biz, +o.expected.toFixed(1), +o.gap.toFixed(1), +(o.index * 100).toFixed(0), isNum(o.growth) ? +(o.growth * 100).toFixed(0) : '', ivGapLine(o)])); });
  const cs = $('#iv-cat'); if (cs) cs.addEventListener('change', () => { ivCat = cs.value; re(); });
  const fc = $('#iv-fcat'); if (fc) fc.addEventListener('change', () => { ivFCat = fc.value; ivPage = 0; re(); });
  const fm = $('#iv-fcomm'); if (fm) fm.addEventListener('change', () => { ivFComm = fm.value; ivPage = 0; re(); });
  const fsr = $('#iv-fsrc'); if (fsr) fsr.addEventListener('change', () => { ivFSrc = fsr.value; ivPage = 0; re(); });
  const iq = $('#iv-q'); if (iq) { let t; iq.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { ivQ = iq.value; ivPage = 0; const p = iq.selectionStart; renderInvest(true).then(() => { const n = $('#iv-q'); if (n) { n.focus(); n.setSelectionRange(p, p); } }); }, 300); }); }
  const csv1 = $('#iv-csv'); if (csv1) csv1.addEventListener('click', async () => { const I = ivIndex(ivCat, ivRad);
    if (I.home && !I.walk) { await (await api()).save_csv(`Underserved index - ${ivLabel(ivCat)} - ${ivRad} km from home`, ['Community', 'Residents', 'In the community', `Homes with one within ${ivRad} km (%)`, 'Calgary (%)', `Within ${ivRad} km of a typical home`, "Calgary's typical home", 'Index', 'Short by'], I.rows.map(r => [r.name, r.residents, r.here, +(r.share * 100).toFixed(1), +((r.cityShare || 0) * 100).toFixed(1), r.avg, r.cityAvg, r.index && +(r.index * 100).toFixed(0), +r.short.toFixed(2)])); return; }
    if (I.home) { await (await api()).save_csv(`Underserved index - ${ivLabel(ivCat)} - ${ivRad} m from home`, ['Community', 'Residents', 'In the community', `Homes within ${ivRad} m (%)`, 'Calgary (%)', 'Index', 'Residents without one'], I.rows.map(r => [r.name, r.residents, r.here, +(r.share * 100).toFixed(1), +((r.cityShare || 0) * 100).toFixed(1), r.index && +(r.index * 100).toFixed(0), Math.round(r.without)])); return; } await (await api()).save_csv(`Underserved index - ${ivLabel(ivCat)} - ${ivRad} km`, ['Community', 'Residents', 'In the community', `People within ${ivRad} km`, `Within ${ivRad} km`, 'Per 10,000', "At Calgary's rate", 'Index', 'Missing'], I.rows.map(r => [r.name, r.residents, r.here, r.reach, r.biz, r.per10k && +r.per10k.toFixed(2), +r.expected.toFixed(2), r.index && +(r.index * 100).toFixed(0), +r.gap.toFixed(2)])); });
  const csv2 = $('#iv-listcsv'); if (csv2) csv2.addEventListener('click', async () => { const rows = ivDirRows(); await (await api()).save_csv('Calgary businesses', ['Business', 'Category', 'Type', 'Community', 'Address', 'First licensed', 'Status', 'Longitude', 'Latitude', 'Found in', 'Website', 'Phone'], rows.map(r => [r[0], ivLabel(r[1]), r[2], ivName(r[3]), r[4], r[5], r[6], r[7], r[8], ivSrc(r[9]), ivUrl(r[10]), r[11] || ''])); });
  const f = $('#iv-form');
  if (f) f.addEventListener('submit', e => { e.preventDefault(); const d = Object.fromEntries(new FormData(f).entries()), to = (window.CDD_CONTACT || '').trim();
    const text = `Name: ${d.name}\nBusiness or idea: ${d.business}\nEmail: ${d.email}\nPhone: ${d.phone}\nInterested in: ${d.want}\n\n${d.msg}`;
    if (to) { location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent('Invest in Calgary: ' + d.want)}&body=${encodeURIComponent(text)}`; $('#iv-formmsg').textContent = 'Your email should open with the message ready. Press send there.'; }
    else { navigator.clipboard && navigator.clipboard.writeText(text).catch(() => {}); $('#iv-formmsg').textContent = 'The contact address is being set up. Your message is copied, ready to paste.'; } });
  const u = $('#iv-unlock');
  if (u) u.addEventListener('submit', async e => { e.preventDefault(); const msg = $('#iv-lockmsg'); msg.textContent = 'Checking';
    try { await window.CDD_AI.unlock($('#iv-code').value, 'biz'); renderInvest(true); } catch (err) { msg.textContent = String(err.message || err); } });
  const ask = $('#iv-ask');
  if (ask) { ask.addEventListener('submit', e => { e.preventDefault(); ivAsk($('#iv-text').value); }); $('#iv-text').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask.requestSubmit(); } }); }
  const plan = $('#iv-plan'); if (plan) plan.addEventListener('click', () => ivAsk($('#iv-text').value.trim() || 'Which kinds of business Calgary is short of, where, and a business plan for the strongest one', true));
  const file = $('#iv-file'); if (file) file.addEventListener('change', async () => { const fl = file.files[0]; if (!fl) return; try { ivOwn = ivOwnAnalyse(ivParseCsv(await fl.text())); } catch (err) { ivOwn = { error: String(err.message || err) }; } re(); });
  const oa = $('#iv-ownask'); if (oa) oa.addEventListener('click', () => ivAsk(`${ivOwnSummary()} What are the trends, the seasons, my best days, and where can I grow?`));
  body.querySelectorAll('[data-eap]').forEach(b => b.addEventListener('click', async () => (await api()).open_path(b.dataset.eap)));
  if (ivSub === 'index') ivDrawMap();
  if (ivSub === 'list') ivDirDraw(ivDirRows()); else if (ivDirMap) { try { ivDirMap.remove(); } catch (e) { /* gone */ } ivDirMap = null; ivDirView = null; }
  const th = $('#iv-thread'); if (th) th.scrollTop = th.scrollHeight;
  if (keep) window.scrollTo(0, y);
}
window.renderInvest = renderInvest;

// signed in with an approved email (web-account.js): the Business Economist unlocks without its passcode
document.addEventListener('cdd-unlocked', () => { if ($('#iv-body') && $('#iv-unlock')) renderInvest(true); });

;
// ---- videos.js
/* Calgary Insight: Video Explainers, sorted by topic and area so the page stays easy to use as videos are added.
   Each video card in index.html carries data-cat (its topic) and data-area (a ward or all of Calgary). */
'use strict';
(() => {
  const grid = $('#vid-grid'), bar = $('#vid-bar');
  if (!grid || !bar) return;
  const cards = $$('.vid-card', grid);
  let cat = '', area = '', q = '';
  const count = (k, v) => cards.filter(c => (c.dataset[k] || '') === v).length;
  const cats = [...new Set(cards.map(c => c.dataset.cat).filter(Boolean))].sort();
  const areas = [...new Set(cards.map(c => c.dataset.area).filter(Boolean))].sort();
  function draw() {
    bar.innerHTML = `<div class="vid-chips" role="radiogroup" aria-label="Topic">${[['', `All topics (${cards.length})`], ...cats.map(c => [c, `${c} (${count('cat', c)})`])].map(([v, t]) => `<button type="button" class="chip${v === cat ? ' is-on' : ''}" role="radio" aria-checked="${v === cat}" data-vcat="${esc(v)}">${esc(t)}</button>`).join('')}</div>
      <div class="vid-tools">${areas.length > 1 ? `<label class="sr-only" for="vid-area">Area</label><select id="vid-area" class="select"><option value="">Every area</option>${areas.map(a => `<option ${a === area ? 'selected' : ''}>${esc(a)}</option>`).join('')}</select>` : ''}
      <label class="sr-only" for="vid-q">Search the videos</label><input id="vid-q" type="search" placeholder="Search titles and transcripts" value="${esc(q)}"></div>`;
    let shown = 0;
    cards.forEach(c => { const ok = (!cat || c.dataset.cat === cat) && (!area || c.dataset.area === area) && (!q || c.textContent.toLowerCase().includes(q.toLowerCase()));
      c.hidden = !ok; if (!ok) { const v = c.querySelector('video'); if (v) v.pause(); } else shown++; });
    bar.insertAdjacentHTML('beforeend', `<p class="muted small vid-count">${shown === cards.length ? `${cards.length} videos, newest first` : `${shown} of ${cards.length} videos`}</p>`);
    $$('[data-vcat]', bar).forEach(b => b.addEventListener('click', () => { cat = b.dataset.vcat; draw(); }));
    const s = $('#vid-area', bar); if (s) s.addEventListener('change', () => { area = s.value; draw(); });
    const i = $('#vid-q', bar); if (i) { let t; i.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { q = i.value.trim(); const p = i.selectionStart; draw(); const n = $('#vid-q', bar); n.focus(); n.setSelectionRange(p, p); }, 250); }); }
  }
  // each card shows its topic and area
  cards.forEach(c => { const h = c.querySelector('.card-sub'); if (h && c.dataset.cat) h.insertAdjacentHTML('afterbegin', `<span class="vid-tag">${esc(c.dataset.cat)}</span>${c.dataset.area ? `<span class="vid-tag alt">${esc(c.dataset.area)}</span>` : ''}`); });
  draw();
})();

// Sample reports, open to everyone, shown in the passcode-locked tools (Election Analytics, Business Economist),
// each with its explainer video on the Video Explainers page.
const SAMPLE_REPORTS = {
  ea: { title: "Calgary's 26 electoral divisions: a field guide for the 2027 Alberta election", base: 'reports/election-analytics-sample-2027',
    what: 'What a candidate in each electoral division can do in October 2027: the arithmetic of every seat, turnout, the 2026 referendum, social media, awareness and youth engagement, and a preview of all 26 Calgary divisions.', video: 'vid-ea2027' },
  biz: { title: 'Calgary: a hub of innovation, leadership and future growth', base: 'reports/invest-in-calgary-sample',
    what: 'For a new investor: the infrastructure to use, the ease of doing business, the resources available, how Calgary compares with other cities, where the openings are, and the risks.', video: 'vid-invest' },
};
function sampleReport(kind) {
  const r = SAMPLE_REPORTS[kind]; if (!r) return '';
  return `<section class="card span-12 sample-rep"><div class="sample-rep-in"><div><div class="sample-rep-k">Sample report · open to everyone</div><h3>${esc(r.title)}</h3><p>${esc(r.what)}</p></div>
    <div class="file-actions"><a class="btn primary" href="${r.base}.pdf" target="_blank" rel="noopener">PDF</a><a class="btn" href="${r.base}.html" target="_blank" rel="noopener">Interactive report</a><a class="btn" href="${r.base}.xlsx" download>Excel</a><button type="button" class="btn" data-vidgo="${r.video}">▶ Watch the video</button></div></div></section>`;
}
window.sampleReport = sampleReport;
document.addEventListener('click', e => {
  const b = e.target.closest('[data-vidgo]'); if (!b) return;
  show('videos');
  setTimeout(() => { const c = document.getElementById(b.dataset.vidgo); if (c) { c.hidden = false; c.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, 150);
});

;
// ---- track311.js
// Open issues: look up one 311 request by its number, and how quickly each City department closes requests.
// "Closed" is the department closing the request in its system; the open data does not say whether the problem was fixed.
let t311Res = null, t311Q = '', t311Busy = false, deptView = 'dept';
const T311_CAVEAT = 'What a status cannot tell you: "Closed" means the department closed the request in its system. It does not '
  + 'confirm the problem was fixed: the work may be scheduled for later, the request may have been passed to another City '
  + 'system or team, or it may be outside the City\'s responsibility. The open data has no notes on what was done, who '
  + 'did it, or when the department took it on; it shows the department responsible, the status and the dates.';
const t311Comm = x => { const c = x.comm_code && typeof commName === 'function' ? commName(x.comm_code) : '';
  return c && c !== x.comm_code ? c : (x.comm_name || '').toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase()); };
const t311Days = (a, b) => (a && b) ? Math.max(0, Math.round((new Date(b.slice(0, 10)) - new Date(a.slice(0, 10))) / 86400000)) : null;

function t311Card() {
  const r = t311Res;
  let res = '';
  if (t311Busy) res = '<p class="muted">Looking it up in the City\'s 311 open data…</p>';
  else if (r && r.error) res = `<p class="t311-err">${esc(r.error)}</p>`;
  else if (r && r.rows && !r.rows.length) res = `<p class="t311-err">No request numbered ${esc(r.id)} in the City's 311 open data. Check the number (it looks like 26-01234567). The City publishes its file once a day, a day behind, so a request made today will not be there yet.</p>`;
  else if (r && r.rows) res = r.rows.map(x => {
    const st = x.status_description || '', closed = /^Closed/.test(st), opened = x.requested_date, done = x.closed_date;
    const age = closed ? t311Days(opened, done) : t311Days(opened, new Date().toISOString());
    const DT = D && D.dept_times, typ = DT && (DT.types || []).find(t => t.type === x.service_name && t.dept === x.agency_responsible);
    const dep = DT && (DT.city || []).find(t => t.dept === x.agency_responsible);
    const typical = typ ? `For ${esc(x.service_name)} in ${esc(W())} over the last 12 months: ${fmt(typ.within7 / typ.n * 100, 0)}% closed within 7 days, ${fmt(typ.open / typ.n * 100, 0)}% still open${isNum(typ.avg_days) ? `, ${fmt(typ.avg_days, 1)} days on average to close` : ''}.`
      : dep ? `${esc(x.agency_responsible)} across Calgary over the last 12 months: ${fmt(dep.within7 / dep.n * 100, 0)}% closed within 7 days, ${fmt(dep.open / dep.n * 100, 0)}% still open.` : '';
    const steps = [['Made', opened, `Channel: ${x.source || 'not stated'}`, true], ['Department responsible', null, x.agency_responsible || 'Not stated', true],
      ['Last update', x.updated_date, '', !!x.updated_date], [closed ? 'Closed in the City\'s system' : (/^Duplicate/.test(st) ? st : 'Still open'), closed ? done : null, closed ? (age ? `${fmt(age)} day${age === 1 ? '' : 's'} after it was made` : 'the day it was made') : `open ${fmt(age)} day${age === 1 ? '' : 's'} so far`, closed]];
    return `<div class="t311-res">
      <div class="t311-head"><div><div class="t311-id mono">${esc(x.service_request_id)}</div><div class="t311-type">${esc(typeof niceType === 'function' ? niceType(x.service_name) : x.service_name)}</div>
        <div class="muted small">${esc([x.address, t311Comm(x)].filter(Boolean).join(' · '))}</div></div>
        <span class="t311-st ${closed ? 'closed' : 'open'}">${esc(st || 'Unknown')}</span></div>
      <ol class="t311-steps">${steps.map(([t, d, n, on]) => `<li class="${on ? 'on' : ''}"><b>${esc(t)}</b>${d ? ` <span class="mono">${esc(String(d).slice(0, 10))}</span>` : ''}${n ? `<small>${esc(n)}</small>` : ''}</li>`).join('')}</ol>
      ${typical ? `<p class="t311-typ">${typical}</p>` : ''}
      ${closed ? '<p class="t311-warn"><b>Closed is not the same as fixed.</b> If the problem is still there, call 311 or contact 311 Calgary online with this number and ask what was done.</p>' : ''}
    </div>`;
  }).join('');
  return `<div class="card-head"><div><h2>Track a request</h2><p class="card-sub">Type a 311 request number to see which department has it, its status and its dates</p></div></div>
    <form class="t311-form" id="t311-form"><input id="t311-q" type="search" inputmode="text" autocomplete="off" placeholder="Request number, e.g. 26-01234567" value="${esc(t311Q)}" aria-label="311 request number">
      <button class="btn primary" type="submit">Look up</button></form>${res}
    <p class="card-note">${esc(T311_CAVEAT)} Request numbers name no one. Source: City of Calgary 311 Service Requests (iahh-g8bj), published daily.</p>`;
}

function deptCard() {
  const DT = D && D.dept_times;
  if (!DT || DT.error) return `<div class="card-head"><div><h2>How quickly departments close requests</h2></div></div><p class="muted">Not read this time${DT && DT.error ? `: ${esc(DT.error)}` : ''}.</p>`;
  const city = Object.fromEntries((DT.city || []).map(r => [r.dept, r]));
  const rows = (deptView === 'dept' ? DT.area : (DT.types || []).slice(0, 25)).filter(r => r.n >= 5);
  const pct = (a, n) => n ? a / n * 100 : 0;
  const bar = r => `<span class="dt-bar" title="Closed within 7 days ${fmt(pct(r.within7, r.n), 0)}%, 8 to 30 days ${fmt(pct(r.within30, r.n), 0)}%, 31 to 90 days ${fmt(pct(r.within90, r.n), 0)}%, over 90 days ${fmt(pct(r.over90, r.n), 0)}%, still open ${fmt(pct(r.open, r.n), 0)}%">${[['within7', 'a'], ['within30', 'b'], ['within90', 'c'], ['over90', 'd'], ['open', 'o']].map(([k, c]) => `<i class="${c}" style="width:${pct(r[k], r.n)}%"></i>`).join('')}</span>`;
  const head = `<tr><th scope="col">${deptView === 'dept' ? 'Department' : 'Request type'}</th><th scope="col" class="num">Requests</th><th scope="col">Closed within 7 days · 30 · 90 · later · still open</th><th scope="col" class="num">Within 7 days</th><th scope="col" class="num">Still open</th><th scope="col" class="num">Average days to close</th>${!isCity() && deptView === 'dept' ? '<th scope="col" class="num">Calgary: within 7 days</th>' : ''}</tr>`;
  const body = rows.map(r => `<tr><th scope="row">${esc(deptView === 'dept' ? r.dept : (typeof niceType === 'function' ? niceType(r.type) : r.type))}${deptView === 'dept' ? '' : `<small>${esc(r.dept)}</small>`}</th><td class="num">${fmt(r.n)}</td><td>${bar(r)}</td>
    <td class="num">${fmt(pct(r.within7, r.n), 0)}%</td><td class="num">${fmt(pct(r.open, r.n), 0)}%</td><td class="num">${isNum(r.avg_days) ? fmt(r.avg_days, 1) : '–'}</td>
    ${!isCity() && deptView === 'dept' ? `<td class="num">${city[r.dept] ? fmt(pct(city[r.dept].within7, city[r.dept].n), 0) + '%' : '–'}</td>` : ''}</tr>`).join('');
  return `<div class="card-head"><div><h2>How quickly departments close requests</h2><p class="card-sub">311 requests made in ${esc(W())} between ${esc(longDate(DT.start))} and ${esc(longDate(DT.end))} (duplicates left out), by how long the department took to close them</p></div>
      <div class="seg small" role="radiogroup" aria-label="Group by">${[['dept', 'Departments'], ['type', 'Request types']].map(([k, t]) => `<button type="button" role="radio" aria-checked="${deptView === k}" data-deptview="${k}">${t}</button>`).join('')}</div></div>
    <div class="dt-key"><span><i class="a"></i>within 7 days</span><span><i class="b"></i>8 to 30</span><span><i class="c"></i>31 to 90</span><span><i class="d"></i>over 90</span><span><i class="o"></i>still open</span></div>
    <div class="table-wrap"><table class="data dt-table"><thead>${head}</thead><tbody>${body || '<tr><td colspan="7" class="empty">No requests in this period.</td></tr>'}</tbody></table></div>
    <p class="card-note">Days to close = the closed date minus the date the request was made; the average counts closed requests only. Requests made near the end of the period have had less time to close, so "still open" is higher for recent work. ${esc(T311_CAVEAT)}</p>`;
}

async function t311Lookup(id) {
  t311Q = (id || '').trim();
  if (!/^[A-Za-z0-9-]{4,20}$/.test(t311Q)) { t311Res = { error: 'Type the request number as the City gave it, e.g. 26-01234567.' }; renderTrack311(); return; }
  t311Busy = true; renderTrack311();
  try { const r = await (await api()).track_311(t311Q); t311Res = r && r.ok ? { id: t311Q, rows: r.rows || [] } : { error: (r && r.error) || 'The City\'s 311 data could not be read just now.' }; }
  catch (e) { t311Res = { error: 'The City\'s 311 data could not be read just now.' }; }
  t311Busy = false; renderTrack311();
}

function renderTrack311() {
  const tc = $('#track-card'), dc = $('#dept-card');
  if (tc) {
    tc.innerHTML = t311Card();
    $('#t311-form').addEventListener('submit', e => { e.preventDefault(); t311Lookup($('#t311-q').value); });
  }
  if (dc) {
    dc.innerHTML = deptCard();
    dc.querySelectorAll('[data-deptview]').forEach(b => b.addEventListener('click', () => { deptView = b.dataset.deptview; renderTrack311(); }));
  }
}
let t311D = null;
// called whenever Open issues is drawn: redraw the two cards only when new data has arrived (keeps a typed number)
function syncTrack311() { if (t311D !== D || !$('#track-card').innerHTML) { t311D = D; renderTrack311(); } }
window.renderTrack311 = renderTrack311; window.syncTrack311 = syncTrack311;

;
// ---- citynews.js
// Calgary News: daily articles about Calgary, each written from the reports it cites. Read live from the published
// editions (the repository's news branch), so a new edition appears as soon as it is published.
let CN = null, cnTopic = '', cnQ = '', cnOpen = null, cnDay = '';
const CN_DAY = d => (typeof dmy === 'function' ? dmy(d) : d) || '';
const CN_LONG = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return d; } };

async function loadCityNews(force) {
  if (CN && !force) return CN;
  try { const r = await (await api()).get_city_news(); if (r && r.ok && r.data) CN = r.data; else CN = { error: (r && r.error) || 'not read' }; }
  catch (e) { CN = { error: String(e) }; }
  return CN;
}
// body text with [n] markers turned into links to the article's sources
function cnBody(a) {
  return (a.body || []).map(p => `<p>${esc(p).replace(/\[(\d+)\]/g, (m, n) => { const s = (a.sources || [])[+n - 1]; return s ? `<a class="cn-cite" href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.outlet + ': ' + s.title)}">[${n}]</a>` : m; })}</p>`).join('');
}
function cnSources(a) {
  return `<ol class="cn-sources">${(a.sources || []).map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a><span>${esc(s.outlet)}${s.published ? ` · ${esc(CN_DAY(s.published))}` : ''}</span></li>`).join('')}</ol>`;
}
const cnOutlets = a => [...new Set((a.sources || []).map(s => s.outlet.replace(/ \(.*\)$/, '')))];
const CN_SECTIONS = ['City Hall', 'Public safety', 'Transit and roads', 'Housing and development', 'Business and economy', 'Community and events', 'Environment and weather', 'Alberta and Canada'];
const CN_TINT = { 'City Hall': '#0369A1', 'Public safety': '#B91C1C', 'Transit and roads': '#7C3AED', 'Housing and development': '#B45309', 'Business and economy': '#047857', 'Community and events': '#DB2777', 'Environment and weather': '#0F766E', 'Alberta and Canada': '#475569' };
const cnCredit = im => `Reference image: ${esc(im.credit)}, <a href="${esc(im.license_url || im.page)}" target="_blank" rel="noopener">${esc(im.license)}</a>, via <a href="${esc(im.page)}" target="_blank" rel="noopener">Wikimedia Commons</a>`;
function cnPic(a, big) {
  const im = a.image, tint = CN_TINT[a.section] || '#334155';
  if (im && im.url) return `<figure class="cn-pic${big ? ' big' : ''}"><img src="${esc(im.url)}" alt="${esc(im.alt || a.image_query || '')}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('figure').classList.add('noimg')"><span class="cn-pic-sec" style="background:${tint}">${esc(a.section || '')}</span></figure>`;
  return `<figure class="cn-pic noimg${big ? ' big' : ''}" style="--tint:${tint}"><span class="cn-pic-sec" style="background:${tint}">${esc(a.section || '')}</span></figure>`;
}
function cnCard(a, lead) {
  return `<div class="cn-card${lead ? ' cn-lead' : ''}" data-cn="${esc(a.id)}" tabindex="0" role="button" aria-label="Read: ${esc(a.title)}">
    ${cnPic(a, lead)}<div class="cn-card-t"><div class="cn-topics">${(a.topics || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
    <h3>${esc(a.title)}</h3><p class="cn-dek">${esc(a.dek)}</p>
    <div class="cn-meta">${esc(CN_DAY(a.date))} · ${(a.sources || []).length} source${(a.sources || []).length === 1 ? '' : 's'}: ${esc(cnOutlets(a).slice(0, 3).join(', '))}${cnOutlets(a).length > 3 ? '…' : ''}</div></div></div>`;
}
const CN_PAL = ['#0369A1', '#B45309', '#047857', '#7C3AED', '#BE123C', '#0F766E'];
function cnChart(a, c) {
  const unit = c.unit || '', f = v => !isNum(v) ? '–' : (unit === '$B' ? (v < 0 ? '−' : '') + '$' + fmt(Math.abs(v), 1) + 'B' : unit === '%' ? fmt(v, 1) + '%' : fmt(v, Math.abs(v) < 10 && v % 1 ? 1 : 0) + (unit && unit !== '$B' ? ' ' + unit : ''));
  const s = (a.sources || [])[c.source - 1];
  let body;
  if (c.kind === 'hbar') {
    const vals = c.series[0].values, max = Math.max(...vals.map(v => Math.abs(v || 0)), 1e-9);
    body = `<div class="fb-bars">${c.labels.map((l, i) => `<div class="fb-bar"><span class="fb-bar-l">${esc(l)}</span><span class="fb-bar-t"><i style="width:${Math.abs(vals[i] || 0) / max * 100}%"></i></span><span class="fb-bar-v">${esc(f(vals[i]))}</span></div>`).join('')}</div>`;
  } else if (typeof fbColumns === 'function') {
    body = fbColumns(c.labels, c.series.map((sr, i) => ({ name: sr.name, color: CN_PAL[i % CN_PAL.length], v: sr.values })), f);
  } else body = '';
  return `<figure class="cn-chart"><figcaption><b>${esc(c.title)}</b>${unit ? ` <span class="muted">(${esc(unit)})</span>` : ''}</figcaption>${body}
    ${s ? `<p class="card-note">Source: <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.outlet)}, ${esc(s.title)}</a> [${c.source}]</p>` : ''}</figure>`;
}
function cnArticle(a) {
  return `<section class="card span-12 cn-reader"><button type="button" class="link-btn small" id="cn-back">← All stories</button>
    <div class="cn-topics">${(a.topics || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
    <h2 class="cn-title">${esc(a.title)}</h2><p class="cn-dek big">${esc(a.dek)}</p>
    ${a.image && a.image.url ? `<figure class="cn-hero"><img src="${esc(a.image.url)}" alt="${esc(a.image.alt || '')}" referrerpolicy="no-referrer"><figcaption>${cnCredit(a.image)}. It shows the subject, not the event itself.</figcaption></figure>` : ''}
    <div class="cn-meta">${esc(a.section || '')} · Calgary Insight · ${esc(CN_LONG(a.date))} · written from ${(a.sources || []).length} source${(a.sources || []).length === 1 ? '' : 's'}</div>
    ${(a.key_facts || []).length ? `<ul class="cn-facts">${a.key_facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
    <div class="cn-text">${cnBody(a)}</div>
    ${(a.charts || []).map(c => cnChart(a, c)).join('')}
    ${a.location ? `<h3 class="cn-h3">Where</h3><div class="cn-map" id="cn-map"></div><p class="card-note">${esc(a.location.label)}</p>` : ''}
    <h3 class="cn-h3">Sources</h3>${cnSources(a)}
    <p class="card-note">Each statement is marked with the source it comes from; follow the link to read the original report. This article summarises those reports in its own words and adds no opinion.</p>
    ${document.body.dataset.web && a.id ? `<p class="card-note"><a href="news/${esc(a.id)}/">This story's own page, to share or bookmark ↗</a></p>` : ''}</section>`;
}

async function renderCityNews() {
  const body = $('#cn-body'); if (!body) return;
  if (!CN) body.innerHTML = '<section class="card span-12"><p class="muted">Reading today\'s Calgary News…</p></section>';
  await loadCityNews();
  if (!CN || CN.error) { body.innerHTML = `<section class="card span-12"><p>Calgary News could not be read just now. ${esc((CN || {}).error || '')}</p></section>`; return; }
  const all = CN.articles || [];
  const art = cnOpen && all.find(a => a.id === cnOpen);
  if (art) {
    body.innerHTML = cnArticle(art); $('#cn-back').addEventListener('click', () => { cnOpen = null; renderCityNews(); }); window.scrollTo(0, 0);
    if (art.location && window.L && $('#cn-map')) {
      try { const m = L.map('cn-map', { scrollWheelZoom: false }).setView([+art.location.lat, +art.location.lon], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap contributors' }).addTo(m);
        L.marker([+art.location.lat, +art.location.lon]).addTo(m).bindPopup(esc(art.location.label)); } catch (e) { /* map optional */ }
    }
    return;
  }
  const dates = [...new Set(all.map(a => a.date))].sort().reverse();
  const topics = [...new Set(all.flatMap(a => a.topics || []))].sort();
  const q = cnQ.trim().toLowerCase();
  let list = all.filter(a => (!cnDay || a.date === cnDay) && (!cnTopic || (a.topics || []).includes(cnTopic))
    && (!q || [a.title, a.dek, ...(a.body || []), ...(a.sources || []).map(s => s.outlet + ' ' + s.title)].join(' ').toLowerCase().includes(q)));
  const today = dates[0], filtered = cnTopic || q || cnDay;
  const todays = filtered ? list : list.filter(a => a.date === today), older = filtered ? [] : list.filter(a => a.date !== today);
  const head = `<section class="cn-mast span-12"><div class="cn-mast-top"><div><div class="el-cr-kicker">Calgary Insight</div><h2 class="cn-mast-title">Calgary News</h2>
      <div class="el-cr-sub">${esc(CN_LONG(today))}</div></div>
      <div class="cn-tools"><input type="search" id="cn-q" placeholder="Search the news" value="${esc(cnQ)}" aria-label="Search Calgary News">
        <select id="cn-day" aria-label="Day"><option value="">Every day</option>${dates.map(d => `<option value="${d}"${d === cnDay ? ' selected' : ''}>${esc(CN_DAY(d))}</option>`).join('')}</select></div></div>
    <div class="cn-chips">${['', ...topics].map(t => `<button type="button" class="chip${t === cnTopic ? ' on' : ''}" data-cntopic="${esc(t)}">${esc(t || 'All topics')}</button>`).join('')}</div></section>`;
  const grid = arts => `<div class="cn-grid">${arts.map(a => cnCard(a, false)).join('')}</div>`;
  const secs = (CN.sections || CN_SECTIONS);
  let page = '';
  if (!list.length) page = '<section class="card span-12"><p class="muted">No stories match.</p></section>';
  else if (filtered) page = `<section class="card span-12"><div class="card-head"><div><h2>${fmt(list.length)} stor${list.length === 1 ? 'y' : 'ies'}</h2></div></div>${grid(list)}</section>`;
  else {
    const lead = todays.find(a => a.image) || todays[0], rest = todays.filter(a => a !== lead);
    page = `<section class="card span-12 cn-front"><div class="cn-leadwrap">${cnCard(lead, true)}</div>
      ${secs.map(sec => { const xs = rest.filter(a => a.section === sec); return xs.length ? `<div class="cn-sec"><h2 class="cn-sec-h" style="--tint:${CN_TINT[sec] || '#334155'}">${esc(sec)}</h2>${grid(xs)}</div>` : ''; }).join('')}
      ${rest.filter(a => !secs.includes(a.section)).length ? `<div class="cn-sec"><h2 class="cn-sec-h">More</h2>${grid(rest.filter(a => !secs.includes(a.section)))}</div>` : ''}</section>
      ${older.length ? `<section class="card span-12"><div class="card-head"><div><h2>Earlier</h2><p class="card-sub">The last ${fmt(CN.keep_days || 60)} days</p></div></div>${grid(older)}</section>` : ''}`;
  }
  body.innerHTML = head + page
    + `<section class="card span-12"><p class="card-note">Pictures are reference images of the place or subject from Wikimedia Commons, credited under each story; they are not photos of the events. <button type="button" class="link-btn small" data-method="citynews">How the news is made</button></p></section>`;
  const open = el => { cnOpen = el.dataset.cn; renderCityNews(); };
  body.querySelectorAll('[data-cn]').forEach(el => { el.addEventListener('click', () => open(el)); el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); } }); });
  body.querySelectorAll('[data-cntopic]').forEach(b => b.addEventListener('click', () => { cnTopic = b.dataset.cntopic; renderCityNews(); }));
  $('#cn-day').addEventListener('change', e => { cnDay = e.target.value; renderCityNews(); });
  const qi = $('#cn-q'); let t;
  qi.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { cnQ = qi.value; const pos = qi.selectionStart; renderCityNews().then(() => { const n = $('#cn-q'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }); }, 250); });
}
window.renderCityNews = renderCityNews;

;
// ---- livemap.js
// Live map: Calgary News stories where they happened, live traffic incidents, the newest 311 requests and police-reported
// crime by community, on one map. Traffic and 311 are read straight from the City's open data in the browser and read
// again every few minutes while the page is open; the news comes from the published editions (citynews.js).
const LM = { map: null, groups: {}, on: { news: true, traffic: true, r311: false, crime: true }, newsDays: 7, safetyOnly: false,
  traffic: null, r311: null, city: null, read: {}, timer: null, tick: null, err: {} };
// every visit opens with the layers on: a layer switched off last time stayed hidden and looked broken
try { localStorage.removeItem('lm-on'); } catch { /* storage off */ }
const LM_CITY = 'https://data.calgary.ca/resource/';
const LM_RAMP = { light: ['#FEF3C7', '#FCD34D', '#F59E0B', '#D97706', '#92400E'], dark: ['#3B2A0B', '#6B4510', '#A16207', '#D97706', '#FCD34D'] };
const lmDark = () => (typeof isDark === 'function' ? isDark() : document.documentElement.dataset.theme === 'dark');
const lmAgo = t => { if (!t) return ''; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m === 1 ? '1 min ago' : m < 60 ? m + ' min ago' : Math.round(m / 60) + ' h ago'; };
const lmUtc = h => new Date(Date.now() - h * 3600e3).toISOString().slice(0, 19);
// Calgary local date and time from a floating timestamp the City publishes
const lmWhen = (s, utc) => { if (!s) return ''; const d = new Date(utc ? s + 'Z' : s); return isNaN(d) ? s : d.toLocaleString('en-CA', { timeZone: 'America/Edmonton', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); };
const lmSave = () => {};

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
// the middle of a community or ward shape, for a story that names the place but gives no exact point
function lmMid(g) {
  if (!g || !g.coordinates) return null;
  const ring = g.type === 'MultiPolygon' ? g.coordinates.map(p => p[0]).sort((a, b) => b.length - a.length)[0] : g.type === 'Polygon' ? g.coordinates[0] : null;
  if (!ring || !ring.length) return null;
  const n = ring.length; return [ring.reduce((t, c) => t + c[1], 0) / n, ring.reduce((t, c) => t + c[0], 0) / n];
}
function lmPlace(a) {
  if (a.location && isFinite(+a.location.lat) && isFinite(+a.location.lon) && +a.location.lat) return { ...a };
  const C = LM.city; if (!C || !C.geo) return null;
  const geo = C.geo.communities || {};
  for (const c of a.communities || []) {
    const k = String(c).trim().toUpperCase();
    const row = (C.communities || []).find(r => r.code === k || String(r.name || '').toUpperCase() === k);
    const ll = row && lmMid(geo[row.code]);
    if (ll) return { ...a, location: { lat: ll[0], lon: ll[1], label: row.name } };
  }
  const wg = C.geo.wards || {};
  for (const w of a.wards || []) {
    const g = wg[w] || wg[String(w)] || (Array.isArray(wg) ? wg[+w] : null);
    const ll = lmMid(g && g.geometry ? g.geometry : g);
    if (ll) return { ...a, location: { lat: ll[0], lon: ll[1], label: 'Ward ' + w } };
  }
  return null;
}
function lmNews() {
  const all = ((typeof CN !== 'undefined' && CN && CN.articles) || []).map(lmPlace).filter(Boolean);
  // stories placed on the same spot are spread a little so each pin can be tapped
  const seen = {};
  all.forEach(a => { const k = (+a.location.lat).toFixed(4) + ',' + (+a.location.lon).toFixed(4); const i = seen[k] = (seen[k] || 0) + 1;
    if (i > 1) a.location = { ...a.location, lat: +a.location.lat + .0035 * Math.sin(i * 2.4), lon: +a.location.lon + .0055 * Math.cos(i * 2.4) }; });
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
  // each layer is drawn as soon as its data arrives, so a slow file never holds the others back
  await Promise.all([loadCityNews(), lmCity(), lmTraffic(), LM.on.r311 ? lm311() : null].map(p => Promise.resolve(p).catch(() => null).then(() => lmDraw())));
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

;
// ---- elanalytics.js
// Election Analytics: micro-level election detail, deep analysis and arithmetic models of how a candidate can win: who lives there
// (2021 Census by community), every provincial voting location and federal poll, and an analyst to ask questions.
// The screens are open to everyone; asking the analyst needs the access code on the website (as Data Genie does).
let eaBusy = false, eaThread = [], eaProvSel = 0, eaFedSel = 0;
const EA_PCT = (v, d = 0) => isNum(v) ? fmt(v * 100, d) + '%' : '–';
const eaCol = p => (typeof elColor === 'function' ? elColor(p || 'Other') : '#64748B');

// age pyramid: men left, women right, 5-year bands (85 and over together)
function eaPyramid(w) {
  if (!w || !w.population) return '<p class="muted">No Census figures for this area.</p>';
  const lab = w.bands.slice(0, 17).concat(['85+']);
  const fold = a => a.slice(0, 17).concat([a.slice(17).reduce((x, y) => x + y, 0)]);
  const m = fold(w.men), f = fold(w.women), max = Math.max(...m, ...f, 1);
  const W = 520, rowH = 15, top = 18, mid = W / 2, half = mid - 44;
  let g = `<text x="${mid - 50}" y="12" class="ea-ax" text-anchor="end">Men</text><text x="${mid + 50}" y="12" class="ea-ax">Women</text>`;
  lab.slice().reverse().forEach((b, k) => {
    const i = lab.length - 1 - k, y = top + k * rowH, wm = m[i] / max * half, wf = f[i] / max * half;
    g += `<rect x="${mid - 36 - wm}" y="${y}" width="${wm}" height="${rowH - 3}" fill="#0369A1" rx="2"><title>Men ${b}: ${fmt(m[i])}</title></rect>
      <rect x="${mid + 36}" y="${y}" width="${wf}" height="${rowH - 3}" fill="#B45309" rx="2"><title>Women ${b}: ${fmt(f[i])}</title></rect>
      <text x="${mid}" y="${y + rowH - 5}" class="ea-ax" text-anchor="middle">${esc(b)}</text>`;
  });
  return `<svg class="ea-pyr" viewBox="0 0 ${W} ${top + lab.length * rowH + 4}" role="img" aria-label="Population by age and sex, 2021 Census">${g}</svg>`;
}
function eaBars(items, fmtFn, max) {
  max = max || Math.max(...items.map(x => x.v || 0), 1e-9);
  return `<div class="fb-bars">${items.map(x => `<div class="fb-bar"><span class="fb-bar-l">${esc(x.label)}${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</span><span class="fb-bar-t"><i style="width:${(x.v || 0) / max * 100}%;${x.color ? `background:${x.color}` : ''}"></i></span><span class="fb-bar-v">${esc(fmtFn(x.v))}</span></div>`).join('')}</div>`;
}
function eaHist(b, title) {
  if (!b) return '';
  const max = Math.max(...b.counts, 1);
  return `<div class="ea-hist" role="img" aria-label="${esc(title)}">${b.labels.map((l, i) => `<div class="ea-hcol"><span class="ea-hn">${b.counts[i] || ''}</span><i style="height:${b.counts[i] / max * 100}%"></i><span class="ea-hl">${esc(l)}</span></div>`).join('')}</div>`;
}

function eaWho(M) {
  const w = M.who || {}, P = (D && D.profile) || {};
  const groups = (P.groups || []).map(g => g.list).filter(l => l && (l.rows || []).length);
  const tiles = [['Residents today', fmt(w.population_now || w.population)], ['Under 20', EA_PCT(w.under20)], ['20 to 64', EA_PCT(w.age20_64)], ['65 and over', EA_PCT(w.age65)],
    ['Households (estimate)', fmt(w.households)], ['People per household', isNum(w.avg_hh) ? fmt(w.avg_hh, 2) : '–'], ['Families with children', EA_PCT(w.families_kids)], ['One-parent families', EA_PCT(w.one_parent)],
    ['In the labour force (15+)', EA_PCT(w.participation)], ['Unemployment', EA_PCT(w.unemployment, 1)], ['Self-employed', EA_PCT(w.self_employed)], ['Never married (15+)', EA_PCT(w.never_married)]];
  return `<section class="card span-6"><div class="card-head"><div><h2>Age and sex</h2><p class="card-sub">Residents today by 5-year age band: each community's 2021 Census mix scaled to its residents now${w.method ? ` (${esc(w.method)})` : ''}</p></div></div>${eaPyramid(w)}</section>
    <section class="card span-6"><div class="card-head"><div><h2>Households and work</h2><p class="card-sub">Today's residents with each community's 2021 Census mix; rates are the Census's${w.not_in_census ? `; ${fmt(w.not_in_census)} residents live in communities built since 2021, with no Census profile yet` : ''}</p></div></div>
      <div class="fb-kpis">${tiles.map(([l, n]) => `<div class="fb-kpi"><div class="fb-kpi-l">${esc(l)}</div><div class="fb-kpi-n">${esc(n)}</div></div>`).join('')}</div>
      ${(w.top_occupations || []).length ? `<h3 class="fb-h3">Most common occupations</h3>${eaBars(w.top_occupations.map(([k, v]) => ({ label: k, v })), v => fmt(v))}` : ''}
      ${groups.map(l => `<h3 class="fb-h3">${esc(l.title)}</h3>${eaBars(l.rows.slice(0, 6).map(r => ({ label: r[0], sub: fmt(r[1]) + ' people', v: r[2] })), v => fmt(v) + '%', 100)}${l.note ? `<p class="card-note">${esc(l.note)}</p>` : ''}`).join('')}</section>`;
}
function eaCommunities(M) {
  const rows = ((M.who || {}).communities || []);
  if (!rows.length) return '';
  const C = Object.fromEntries(((D && D.communities) || []).map(c => [c.code, c]));
  return `<section class="card span-12"><div class="card-head"><div><h2>Community by community</h2><p class="card-sub">Who lives in each community (2021 Census) and what residents raise through 311 now</p></div></div>
    <div class="table-wrap"><table class="data ea-ctable"><thead><tr><th scope="col">Community</th><th class="num" scope="col">Residents now</th><th class="num" scope="col">Share of area</th><th class="num" scope="col">Under 20</th><th class="num" scope="col">20–64</th><th class="num" scope="col">65+</th><th class="num" scope="col">Per household</th><th class="num" scope="col">Families with children</th><th class="num" scope="col">Unemployment</th><th scope="col">Top occupation</th><th scope="col">Most common open 311 issue</th></tr></thead>
    <tbody>${rows.map(r => { const c = C[r.code] || {}; return `<tr><th scope="row">${esc(c.name || r.name || r.code)}</th><td class="num">${fmt(r.residents)}</td><td class="num">${EA_PCT(r.share, 1)}</td><td class="num">${EA_PCT(r.under20)}</td><td class="num">${EA_PCT(r.age20_64)}</td><td class="num">${EA_PCT(r.age65)}</td><td class="num">${isNum(r.avg_hh) ? fmt(r.avg_hh, 1) : '–'}</td><td class="num">${EA_PCT(r.families_kids)}</td><td class="num">${isNum(r.unemployment) ? fmt(r.unemployment, 0) + '%' : '–'}</td><td>${esc(r.top_occupation || '–')}</td><td>${esc((t => t ? (typeof niceType === 'function' ? niceType(t) : t) : '–')(Array.isArray(c.open_top) ? ((c.open_top.find(t => !/contact us/i.test(t.type || '')) || {}).type || '') : (c.open_top && typeof c.open_top === 'object' ? (c.open_top.type || '') : c.open_top)))}</td></tr>`; }).join('')}</tbody></table></div>
    <p class="card-note">Census figures are for 2021; residents now are the dashboard's count. Unemployment is the Census rate for people 15 and over in the labour force; the 2021 Census was taken in May 2021, during the pandemic.</p></section>`;
}
function eaProvincial(M) {
  const list = (M.provincial || []).filter(x => x.stations);
  if (!list.length) return '';
  const x = list[Math.min(eaProvSel, list.length - 1)], st = (x.stations || []).filter(s => isNum(s.turnout));
  const sum = x.summary || {};
  const bars = st.slice().sort((a, b) => a.turnout - b.turnout).map(s => ({ label: s.name || s.loc, sub: `${s.type} · ${fmt(s.electors)} on the list · ${s.lead || ''} ${EA_PCT(s.lead_share)}`, v: s.turnout, color: eaCol(s.lead) }));
  return `<section class="card span-12"><div class="card-head"><div><h2>Provincial voting locations, 2023</h2><p class="card-sub">Every election-day location in the electoral divisions covering ${esc(W())}, by turnout; bar colour = the party that led there</p></div>
      ${list.length > 1 ? `<div class="seg small" role="radiogroup" aria-label="Electoral division">${list.map((d, i) => `<button type="button" role="radio" aria-checked="${i === eaProvSel}" data-eaprov="${i}">${esc(d.riding)} (${EA_PCT(d.share)})</button>`).join('')}</div>` : ''}</div>
    <div class="fb-kpis">${[['Share of the area\'s residents', EA_PCT(x.share)], ['Division turnout', EA_PCT(x.turnout, 1)], ['Locations', fmt(sum.election_day_stations)], ['Lowest location', EA_PCT(sum.turnout_low)], ['Middle location', EA_PCT(sum.turnout_median)], ['Highest location', EA_PCT(sum.turnout_high)]].map(([l, n]) => `<div class="fb-kpi"><div class="fb-kpi-l">${esc(l)}</div><div class="fb-kpi-n">${esc(n)}</div></div>`).join('')}</div>
    <div class="ea-key">${Object.entries(sum.stations_led || {}).map(([p, n]) => `<span><i style="background:${eaCol(p)}"></i>${esc(p)} led ${fmt(n)}</span>`).join('')}</div>
    ${eaBars(bars, v => EA_PCT(v), 1)}
    <p class="card-note">Elections Alberta's Statement of Vote (2019 boundaries). A location serves the voting areas listed for it, which may reach beyond the ward. Turnout here is election-day ballots over names on the list; advance and other ballots are counted separately, so locations read lower than the division's overall turnout${sum.other_locations ? ` (${fmt(sum.other_locations)} other locations)` : ''}.</p></section>`;
}
function eaFederal(M) {
  const list = (M.federal || []).filter(x => x.summary);
  if (!list.length) return '';
  const x = list[Math.min(eaFedSel, list.length - 1)], s = x.summary || {};
  const ways = s.part_by_way || {}, psw = s.party_share_by_way || {};
  const big = Object.keys(psw).filter(p => (psw[p].election_day || 0) >= 0.03 || (psw[p].advance_polls || 0) >= 0.03);
  const wayRows = big.map(p => `<tr><th scope="row"><i class="ea-dot" style="background:${eaCol(p)}"></i>${esc(p)}</th><td class="num">${EA_PCT(psw[p].election_day, 1)}</td><td class="num">${EA_PCT(psw[p].advance_polls, 1)}</td><td class="num">${EA_PCT(psw[p].special_and_mail, 1)}</td><td class="num">${fmt((s.polls_led || {})[p] || 0)}</td></tr>`).join('');
  return `<section class="card span-12"><div class="card-head"><div><h2>Federal polls, 2025</h2><p class="card-sub">Poll by poll in the electoral districts covering ${esc(W())}</p></div>
      ${list.length > 1 ? `<div class="seg small" role="radiogroup" aria-label="Electoral district">${list.map((d, i) => `<button type="button" role="radio" aria-checked="${i === eaFedSel}" data-eafed="${i}">${esc(d.riding)} (${EA_PCT(d.share)})</button>`).join('')}</div>` : ''}</div>
    <div class="fb-kpis">${[['Share of the area\'s residents', EA_PCT(x.share)], ['District turnout', EA_PCT(x.turnout, 1)], ['Polls', fmt(s.polls)], ['Lowest poll', EA_PCT(s.turnout_low)], ['Middle poll', EA_PCT(s.turnout_median)], ['Highest poll', EA_PCT(s.turnout_high)]].map(([l, n]) => `<div class="fb-kpi"><div class="fb-kpi-l">${esc(l)}</div><div class="fb-kpi-n">${esc(n)}</div></div>`).join('')}</div>
    <div class="ea-two"><div><h3 class="fb-h3">Polls by turnout</h3>${eaHist(s.bands, 'Polls by turnout')}</div>
      <div><h3 class="fb-h3">How people voted, and when</h3><p class="muted small">Votes cast on election day ${EA_PCT(ways.election_day)}, at advance polls ${EA_PCT(ways.advance_polls)}, by special ballot or mail ${EA_PCT(ways.special_and_mail)}</p>
        <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Party</th><th class="num" scope="col">Election day</th><th class="num" scope="col">Advance polls</th><th class="num" scope="col">Special / mail</th><th class="num" scope="col">Polls led</th></tr></thead><tbody>${wayRows}</tbody></table></div></div></div>
    <div class="ea-two"><div><h3 class="fb-h3">Lowest-turnout polls</h3><div class="table-wrap"><table class="data"><thead><tr><th scope="col">Poll</th><th class="num" scope="col">Electors</th><th class="num" scope="col">Voted</th><th class="num" scope="col">Turnout</th><th scope="col">Led</th></tr></thead><tbody>${(x.lowest_turnout || []).map(r => `<tr><td>${esc(r.poll)}</td><td class="num">${fmt(r.electors)}</td><td class="num">${fmt(r.ballots)}</td><td class="num">${EA_PCT(r.turnout)}</td><td>${esc(r.lead || '')}</td></tr>`).join('')}</tbody></table></div></div>
      <div><h3 class="fb-h3">Closest polls</h3><div class="table-wrap"><table class="data"><thead><tr><th scope="col">Poll</th><th class="num" scope="col">Votes</th><th scope="col">Led</th><th class="num" scope="col">Ahead by</th></tr></thead><tbody>${(x.closest || []).map(r => `<tr><td>${esc(r.poll)}</td><td class="num">${fmt(r.ballots)}</td><td>${esc(r.lead || '')}</td><td class="num">${EA_PCT(r.margin, 1)}</td></tr>`).join('')}</tbody></table></div></div></div>
    <p class="card-note">Elections Canada's poll-by-poll results. Poll numbers are Elections Canada's; polls cover the whole district, so not all are inside the ward. Advance polls are numbered in the 600s; special ballots and mail-in votes are counted for the district as a whole. Polls with no votes (merged with another poll) are left out of the turnout figures; a poll can pass 100% when people register at the poll on election day.</p></section>`;
}

// ---- the analyst (chat)
const EA_SUGGEST = ['Under what model could a candidate win the next race here? Show the assumptions and the arithmetic', 'Model three turnout scenarios for the next election here: votes needed to win in each', 'Where in this area was turnout lowest, and who lives there?', 'Which age groups are largest here, and how does that compare with Calgary?',
  'How did advance voting differ from election-day voting?', 'Which voting locations were closest between the top two parties?',
  'What do residents raise most through 311, community by community?', 'Build a briefing on this area with the arithmetic of a win'];
function eaLocked() { return !!(window.CDD_AI && window.CDD_AI.unlocked && !window.CDD_AI.unlocked('ea')); }
function eaArea() {
  const key = ecKey(), A = ecArea(key), w = ecWardOf(key);
  return A ? `${A.name} (${ecLevel[A.level][0].toLowerCase()}; ${ecLevel[A.level][1]} ${(A.member || {}).name || ''}; riding="${A.name}")`
    : key === 'W' || w === 0 ? 'all of Calgary' : w ? `Ward ${w}` : (isCity() ? 'all of Calgary' : W());
}
// a finished report: PDF, interactive, Excel, and an audit of it
function eaReportCard(ev) {
  const pdf = ev.pdf || ev.print || (/\.pdf$/i.test(ev.path || '') ? ev.path : null), inter = ev.interactive;
  const p = x => esc(x);
  return `<div class="ea-report"><div><b>${esc(ev.title || ev.name || 'Election report')}</b><small>${[pdf || inter ? 'PDF' : '', inter ? 'interactive report' : '', ev.xlsx ? 'Excel workbook with every calculation' : ''].filter(Boolean).join(' · ')}</small></div>
    <div class="file-actions">${pdf ? `<button class="btn primary" data-eap="${p(pdf)}${/\.html?$/i.test(pdf) ? '#print' : ''}">PDF</button>` : inter ? `<button class="btn primary" data-eap="${p(inter)}#print">PDF</button>` : ''}${inter ? `<button class="btn" data-eap="${p(inter)}">Interactive</button>` : ''}${ev.xlsx ? `<button class="btn" data-eap="${p(ev.xlsx)}">Excel</button>` : ''}${pdf || inter ? `<button class="btn" data-eaaudit="${p(pdf || inter)}">Audit this report</button>` : ''}</div></div>`;
}
function eaChat() {
  const locked = eaLocked();
  const msgs = eaThread.map(m => `<div class="ea-msg ${m.who}">${m.who === 'you' ? esc(m.text) : (m.html || esc(m.text || ''))}${m.cards ? `<div class="ea-cards">${m.cards}</div>` : ''}</div>`).join('');
  return `${window.sampleReport ? sampleReport('ea') : ''}<section class="card span-12 ea-chat"><div class="card-head"><div><h2>Ask the election analyst</h2><p class="card-sub">Micro-level detail, deep analysis and arithmetic models of how a candidate can win in ${esc(eaPlace())}, from every figure on this page and the rest of Calgary Insight. Ask a question for an answer here, or build a full report (PDF, interactive report and an Excel workbook with every calculation) that can be audited.</p></div></div>
    ${locked ? `<div class="web-lock ea-lock"><h3>The election analyst needs its passcode</h3><p>Every chart and table on this page is open to everyone. Asking the analyst needs the Election Analytics passcode, which is separate from the Data Genie one. <b>To get a passcode, contact the developer.</b></p>
      <form id="ea-unlock"><label class="sr-only" for="ea-code">Election Analytics passcode</label><input type="password" id="ea-code" autocomplete="off" placeholder="Election Analytics passcode"><button type="submit" class="btn primary">Unlock</button></form><p class="web-lock-msg" id="ea-lockmsg" role="status"></p></div>`
      : `<div class="ea-thread" id="ea-thread">${msgs || `<div class="ea-suggest">${EA_SUGGEST.map(s => `<button type="button" class="chip" data-easug="${esc(s)}">${esc(s)}</button>`).join('')}</div>`}</div>
      <form class="ea-form" id="ea-form"><textarea id="ea-q" rows="2" placeholder="Ask about turnout, who lives here, voting locations, the arithmetic of a win…" aria-label="Question for the election analyst"></textarea>
        <div class="ea-btns"><button class="btn primary" type="submit" ${eaBusy ? 'disabled' : ''}>${eaBusy ? 'Working…' : 'Ask'}</button><button class="btn" type="button" id="ea-report" ${eaBusy ? 'disabled' : ''} title="A full, auditable report: PDF, interactive report and Excel workbook. Takes 5 to 15 minutes.">Build full report</button></div></form>`}
    <p class="card-note">Answers use official results and the Census, and say which figures are estimates. Projections and win scenarios are mathematical models, with every assumption, the arithmetic and a range, never certainties. The same rigour for any candidate or party; it never suggests targeting or discouraging any group.</p></section>`;
}
function eaCatch(bot, cards) {
  const prevA = window.onAgentEvent, prevS = window.onAnalystEvent;
  const h = ev => {
    if (ev.type === 'step') { bot.text = ev.text + '…'; const t = $('#ea-thread .ea-msg.bot:last-child'); if (t) t.firstChild.textContent = bot.text; }
    else if (ev.type === 'table') cards.push(`<div class="card"><h4>${esc(ev.title)}</h4><div class="table-scroll"><table class="data"><thead><tr>${ev.columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${ev.rows.map(r => `<tr>${r.map(v => `<td>${typeof v === 'number' ? fmt(v, Number.isInteger(v) ? 0 : 1) : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`);
    else if (ev.type === 'chart') cards.push(`<div class="card"><h4>${esc(ev.title)}</h4>${eaBars((ev.labels || []).map((l, i) => ({ label: String(l), v: ((ev.series || [])[0] || { values: [] }).values[i] })), v => fmt(v, Number.isInteger(v) ? 0 : 1))}</div>`);
    else if (ev.type === 'report') cards.unshift(eaReportCard(ev));
  };
  window.onAgentEvent = h; window.onAnalystEvent = h;
  return () => { window.onAgentEvent = prevA; window.onAnalystEvent = prevS; };
}
async function eaAsk(q, full) {
  if (eaBusy || !q.trim()) return;
  eaBusy = true;
  const bot = { who: 'bot', text: full ? 'Planning the report…' : 'Working on it…' };
  eaThread.push({ who: 'you', text: full ? `Full report: ${q}` : q }, bot);
  renderElAnalytics(true);
  const cards = [], done = eaCatch(bot, cards);
  try {
    const a = await api();
    // the strongest model for every Election Analytics answer; a full report goes through the report writer
    const res = full ? await a.election_report(q, eaArea()) : await a.ask(`[Election Analytics] Area: ${eaArea()}. ${q}`, 'audit');
    if (res && res.ok) { bot.html = (window.DOMPurify && window.marked) ? DOMPurify.sanitize(marked.parse(res.text || '')) : esc(res.text || ''); bot.text = ''; if (res.report && !cards.some(c => c.includes('ea-report'))) cards.unshift(eaReportCard(typeof res.report === 'string' ? { pdf: res.report } : res.report)); }
    else bot.text = (res && res.error) || 'The analyst could not answer this time.';
  } catch (e) { bot.text = String(e.message || e); }
  bot.cards = cards.join('');
  done();
  eaBusy = false;
  renderElAnalytics(true);
}
async function eaAudit(path) {
  if (eaBusy) return;
  eaBusy = true;
  const bot = { who: 'bot', text: 'Auditing the report: every figure is worked out again from the data…' };
  eaThread.push({ who: 'you', text: 'Audit this report' }, bot);
  renderElAnalytics(true);
  const prev = window.onAuditEvent;
  window.onAuditEvent = ev => { if (ev.type === 'step') { bot.text = ev.text + '…'; const t = $('#ea-thread .ea-msg.bot:last-child'); if (t) t.firstChild.textContent = bot.text; } else if (prev) prev(ev); };
  try {
    const res = await (await api()).audit_run(path);
    const cp = res && res.corrected ? (typeof res.corrected === 'string' ? res.corrected : (res.corrected.pdf || res.corrected.interactive || '')) : '';
    if (res && res.ok) { bot.text = ''; bot.html = `<p><b>Audit finished.</b> ${esc(res.verdict || '')} ${fmt(res.findings || 0)} finding${res.findings === 1 ? '' : 's'}.</p>`; bot.cards = `<div class="ea-report"><div><b>Audit report</b><small>every finding with the reviewer's decision${cp ? '; a corrected report was made' : ''}</small></div><div class="file-actions">${res.page ? `<button class="btn primary" data-eap="${esc(res.page)}">Open the audit</button>` : ''}${cp ? `<button class="btn" data-eap="${esc(cp)}">Corrected report</button>` : ''}</div></div>`; }
    else bot.text = (res && res.error) || 'The audit could not be finished.';
  } catch (e) { bot.text = String(e.message || e); }
  window.onAuditEvent = prev;
  eaBusy = false;
  renderElAnalytics(true);
}

function eaPlace() { const key = ecKey(), A = ecArea(key), w = ecWardOf(key); return A ? A.name : key === 'W' ? 'all of Calgary' : w ? `Ward ${w}` : W(); }
function eaBindAll(body) {
  body.querySelectorAll('[data-easug]').forEach(b => b.addEventListener('click', () => eaAsk(b.dataset.easug)));
  body.querySelectorAll('[data-eap]').forEach(b => b.addEventListener('click', async () => (await api()).open_path(b.dataset.eap)));
  body.querySelectorAll('[data-eaaudit]').forEach(b => b.addEventListener('click', () => eaAudit(b.dataset.eaaudit)));
  const rb = $('#ea-report');
  if (rb) rb.addEventListener('click', () => { const t = $('#ea-q').value.trim(); eaAsk(t || `A complete election analysis of ${eaPlace()}: who lives here, how it voted, the arithmetic of the last result and at least three models of how a candidate can win the next race`, true); });
  const f = $('#ea-form');
  if (f) { f.addEventListener('submit', e => { e.preventDefault(); const t = $('#ea-q').value; eaAsk(t); });
    $('#ea-q').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); f.requestSubmit(); } }); }
  const u = $('#ea-unlock');
  if (u) u.addEventListener('submit', async e => { e.preventDefault(); const msg = $('#ea-lockmsg'); msg.textContent = 'Checking';
    try { await window.CDD_AI.unlock($('#ea-code').value, 'ea'); renderElAnalytics(true); } catch (err) { msg.textContent = String(err.message || err); } });
  if (typeof ecBind === 'function') ecBind(body, () => renderElAnalytics(true));
  if (typeof elTick === 'function') elTick();
  const th = $('#ea-thread'); if (th) th.scrollTop = th.scrollHeight;
}
// an MLA's division or an MP's district: its own hero, the analyst and the full picture (constituency.js)
function eaRiding(body, A, keepScroll, y) {
  const r = A.last || {}, w = A.who || {}, lv = ecLevel[A.level], m = r.math || {};
  const nx = (typeof EL_NEXT !== 'undefined' ? EL_NEXT : []).filter(([t]) => A.level === 'provincial' ? /alberta|provinc/i.test(t) : /canada|federal/i.test(t));
  const hero = `<section class="el-cr span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Election Analytics · ${esc(lv[0])}</div><h2 class="el-cr-title">${esc(A.name)}</h2><div class="el-cr-sub">${esc(lv[1])}: ${esc((A.member || {}).name || '')}${(A.member || {}).caucus ? ` (${esc(A.member.caucus)})` : ''} · last result ${esc(elDay(A.last_date))}${A.by_election ? ' (by-election)' : ''}</div></div>
      ${nx.length && typeof elCountdown === 'function' ? `<div class="el-cr-counts">${nx.slice(0, 1).map(([t, d]) => `<div class="el-cr-count"><div class="el-cr-kicker">${esc(t)} · ${esc(elDay(d))}</div>${elCountdown(d, true)}</div>`).join('')}</div>` : ''}</div>
    <div class="el-cr-kpis">
      <div class="el-kpi"><div class="el-kpi-l">Residents today</div><div class="el-kpi-n">${fmt(A.residents)}</div><div class="el-hero-sub">${esc(w.method || '')}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Electors on the list</div><div class="el-kpi-n">${fmt(r.electors)}</div><div class="el-hero-sub">turnout ${EA_PCT(r.turnout, 1)}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Votes between 1st and 2nd</div><div class="el-kpi-n">${fmt(m.gap_votes)}</div><div class="el-hero-sub">ahead by ${EA_PCT(r.margin_share, 1)}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Swing that would tie it</div><div class="el-kpi-n">${isNum(m.swing_to_flip) ? fmt(m.swing_to_flip * 100, 1) : '–'}<small> pts</small></div><div class="el-hero-sub">uniform, winner to runner-up</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Did not vote</div><div class="el-kpi-n">${fmt(m.did_not_vote)}</div><div class="el-hero-sub">electors on the list</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Aged 65 and over</div><div class="el-kpi-n">${EA_PCT(w.age65)}</div><div class="el-hero-sub">under 20: ${EA_PCT(w.under20)}</div></div>
    </div></section>`;
  body.innerHTML = ecPicker() + hero + eaChat() + ecRiding(A);
  eaBindAll(body);
  if (keepScroll) window.scrollTo(0, y);
}

async function renderElAnalytics(keepScroll) {
  const body = $('#ea-body'); if (!body) return;
  const y = window.scrollY;
  await ecPrepare();
  const key = ecKey(), RA = ecArea(key);
  if (RA) return eaRiding(body, RA, keepScroll, y);
  if (key === 'P' || key === 'F') { body.innerHTML = ecPicker() + eaChat() + ecAllSeats(key === 'P' ? 'provincial' : 'federal'); eaBindAll(body); if (keepScroll) window.scrollTo(0, y); return; }
  // a ward, or all of Calgary: drawn with that area's own figures, whatever the sidebar shows
  const wk = key === 'W' ? 0 : ecWardOf(key), view = wk === SCOPE ? D : PEEK[`${(D && D.population && D.population.method) || ''}/${wk}`];
  const pick = ecPicker();
  return withView(view || D, view ? wk : SCOPE, () => eaWardBody(body, keepScroll, y, pick));
}
function eaWardBody(body, keepScroll, y, pick) {
  const M = D && D.elections && D.elections.micro;
  const C = (D && D.elections && D.elections.constituency) || {}, cw = ((C.wards || {})[String(SCOPE)]) || {};
  if (!M || M.error) { body.innerHTML = `<section class="card span-12"><p>Election Analytics is not ready for this area yet${M && M.error ? ` (${esc(M.error)})` : ''}. It appears after the next refresh of the election results.</p></section>`; return; }
  const w = M.who || {}, prov = M.provincial || [], fed = M.federal || [];
  const avg = (xs) => { const t = xs.reduce((a, x) => a + (x.share || 0), 0); return t ? xs.reduce((a, x) => a + (x.turnout || 0) * (x.share || 0), 0) / t : null; };
  const nx = (typeof EL_NEXT !== 'undefined' ? EL_NEXT : []);
  const hero = `<section class="el-cr span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Election Analytics</div><h2 class="el-cr-title">${esc(W())}</h2><div class="el-cr-sub">Who lives here, how they voted, and where turnout was low: Census 2021 by community, 2023 provincial voting locations, 2025 federal polls, 2025 council race</div></div>
      ${nx.length && typeof elCountdown === 'function' ? `<div class="el-cr-counts">${nx.slice(0, 1).map(([t, d]) => `<div class="el-cr-count"><div class="el-cr-kicker">${esc(t)} · ${esc(typeof elDay === 'function' ? elDay(d) : d)}</div>${elCountdown(d, true)}</div>`).join('')}</div>` : ''}</div>
    <div class="el-cr-kpis">
      <div class="el-kpi"><div class="el-kpi-l">Residents today</div><div class="el-kpi-n">${fmt(w.population_now || w.population)}</div><div class="el-hero-sub">${w.method ? esc(w.method) + ' · ' : ''}about ${fmt(w.adults20)} aged 20 and over</div></div>
      ${!isCity() && cw.electors_est ? `<div class="el-kpi"><div class="el-kpi-l">Electors (estimate)</div><div class="el-kpi-n">${fmt(cw.electors_est)}</div><div class="el-hero-sub">council turnout 2025 about ${EA_PCT(cw.turnout_est)}</div></div>` : ''}
      <div class="el-kpi"><div class="el-kpi-l">Provincial turnout 2023</div><div class="el-kpi-n">${EA_PCT(avg(prov))}</div><div class="el-hero-sub">divisions covering the area</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Federal turnout 2025</div><div class="el-kpi-n">${EA_PCT(avg(fed))}</div><div class="el-hero-sub">districts covering the area</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Aged 65 and over</div><div class="el-kpi-n">${EA_PCT(w.age65)}</div><div class="el-hero-sub">under 20: ${EA_PCT(w.under20)}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">People per household</div><div class="el-kpi-n">${isNum(w.avg_hh) ? fmt(w.avg_hh, 2) : '–'}</div><div class="el-hero-sub">${EA_PCT(w.big_hh)} of homes have 5 or more</div></div>
    </div></section>`;
  body.innerHTML = pick + hero + eaChat() + eaWho(M) + eaCommunities(M) + (isCity() ? `<section class="card span-12"><p class="muted">Choose a ward at the top to see every voting location and poll in it.</p></section>` : eaProvincial(M) + eaFederal(M))
    + `<section class="card span-12"><p class="card-note">${esc(M.notes || '')} Facts only: nothing here rates, ranks or recommends any candidate, party or campaign. <button type="button" class="link-btn small" data-method="elections">How these are read</button></p></section>`;
  body.querySelectorAll('[data-eaprov]').forEach(b => b.addEventListener('click', () => { eaProvSel = +b.dataset.eaprov; renderElAnalytics(true); }));
  body.querySelectorAll('[data-eafed]').forEach(b => b.addEventListener('click', () => { eaFedSel = +b.dataset.eafed; renderElAnalytics(true); }));
  eaBindAll(body);
  if (keepScroll) window.scrollTo(0, y);
}
window.renderElAnalytics = renderElAnalytics;
document.addEventListener('cdd-unlocked', () => { if ($('#ea-body')) renderElAnalytics(true); });

;
// ---- audit.js
// ================================================================ REPORT AUDITOR (a tab of Data Scientist)
// Chinook audits a report (re-running every figure), Bow reviews each finding and makes the corrected report,
// Rundle checks only those findings were dealt with (the names shown; the models are set in auditor.py). The engine side is auditor.py.
let auBusy = false;
wireSeg($('#ds-tabs'), v => {
  $('#ds-make').hidden = v !== 'make';
  $('#ds-audit').hidden = v !== 'audit';
  if (v === 'audit') renderAuditor();
});

async function renderAuditor() {
  const a = await api();
  const reports = (await a.analyst_reports()).filter(r => !/\(audited\)\s*$/i.test(r.title || ''));
  const box = $('#au-reports');
  box.innerHTML = reports.length ? `<div class="ds-rows">${reports.slice(0, 40).map((r, i) => `<div class="ds-row">
      <div class="ds-row-main"><b>${esc(r.title || 'Report')}</b><small>${esc(stampText(r.made))}</small></div>
      <div class="file-actions"><button class="btn" data-p="${esc(r.interactive || r.pdf)}">${icon('open')}<span>Open</span></button>
      <button class="btn primary" data-audit="${i}" ${auBusy ? 'disabled' : ''}>${icon('check')}<span>Audit</span></button></div></div>`).join('')}</div>`
    : '<p class="card-sub ds-empty">No reports to audit yet. Make one on the Make reports tab first.</p>';
  $$('[data-p]', box).forEach(b => b.addEventListener('click', () => a.open_path(b.dataset.p)));
  $$('[data-audit]', box).forEach(b => b.addEventListener('click', () => runAudit(reports[+b.dataset.audit])));
  loadAudits();
}

async function loadAudits() {
  const a = await api();
  const list = a.audit_list ? await a.audit_list() : [];
  const box = $('#au-list');
  box.innerHTML = list.length ? `<div class="ds-rows">${list.map(x => `<div class="ds-row">
      <div class="ds-row-main"><b>${esc(x.title)}</b><small>${esc(x.made)} · ${fmt(x.findings)} finding${x.findings === 1 ? '' : 's'}, ${fmt(x.fixed)} fixed${x.open ? `, <span class="neg">${fmt(x.open)} still open</span>` : ''}</small></div>
      <div class="file-actions"><button class="btn primary" data-p="${esc(x.page)}">${icon('check')}<span>Audit findings</span></button>
      ${x.corrected_pdf ? `<button class="btn" data-p="${esc(x.corrected_pdf)}${/\.html?$/i.test(x.corrected_pdf) ? '#print' : ''}">${icon('file')}<span>Corrected report (PDF)</span></button>` : ''}
      ${x.corrected_interactive ? `<button class="btn" data-p="${esc(x.corrected_interactive)}">${icon('open')}<span>Interactive</span></button>` : ''}
      ${x.corrected_xlsx ? `<button class="btn" data-p="${esc(x.corrected_xlsx)}">${icon('download')}<span>Excel</span></button>` : ''}</div></div>`).join('')}</div>`
    : '<p class="card-sub ds-empty">No audits yet.</p>';
  $$('[data-p]', box).forEach(b => b.addEventListener('click', () => a.open_path(b.dataset.p)));
}

function auStage(n, done = false) {
  $$('#au-stages li').forEach(li => { const k = +li.dataset.stage; li.classList.toggle('done', done || k < n); li.classList.toggle('on', !done && k === n); });
}

async function runAudit(r) {
  if (auBusy || !r) return;
  auBusy = true;
  $$('[data-audit]').forEach(b => { b.disabled = true; });
  $('#au-run').hidden = false;
  $('#au-run').classList.remove('is-done');
  $('#au-run-title').textContent = 'Audit: ' + (r.title || 'Report');
  $('#au-run-sub').textContent = 'Working on it. This usually takes 5 to 15 minutes; you can use the rest of Calgary Insight meanwhile.';
  $('#au-steps').innerHTML = '';
  $('#au-result').innerHTML = '';
  auStage(0);
  $('#au-run').scrollIntoView({ behavior: 'smooth', block: 'start' });
  try {
    const res = await (await api()).audit_run(r.pdf || r.interactive);
    if (!res.ok) { auStage(-1); $('#au-run-sub').textContent = 'The audit could not be finished.'; $('#au-result').innerHTML = `<div class="err">${esc(res.error)}</div>`; }
    else {
      auStage(3, true);
      $('#au-run').classList.add('is-done');
      $('#au-run-sub').textContent = `Done: ${res.findings} finding${res.findings === 1 ? '' : 's'}.`;
      $('#au-result').innerHTML = `<div class="answer"><p><b>Final check:</b> ${esc(res.verdict || '')}</p></div>
        <div class="file-actions"><button class="btn primary" data-p="${esc(res.page)}">${icon('check')}<span>Open the audit findings</span></button>
        ${res.corrected && res.corrected.pdf ? `<button class="btn" data-p="${esc(res.corrected.pdf)}${/\.html?$/i.test(res.corrected.pdf) ? '#print' : ''}">${icon('file')}<span>Corrected report (PDF)</span></button>` : ''}
        ${res.corrected && res.corrected.interactive ? `<button class="btn" data-p="${esc(res.corrected.interactive)}">${icon('open')}<span>Corrected report (interactive)</span></button>` : ''}</div>`;
      $$('#au-result [data-p]').forEach(b => b.addEventListener('click', async () => (await api()).open_path(b.dataset.p)));
    }
  } catch (e) {
    auStage(-1);
    $('#au-result').innerHTML = `<div class="err">${esc(e.message || e)}</div>`;
  } finally {
    auBusy = false;
    renderAuditor();
  }
}

window.onAuditEvent = ev => {
  if (ev.type === 'stage') {
    auStage({ audit: 0, review: 1, final: 2 }[ev.stage] || 0);
    $('#au-steps').insertAdjacentHTML('beforeend', `<li><b>${esc(ev.text)}</b></li>`);
  } else if (ev.type === 'step') {
    $('#au-steps').insertAdjacentHTML('beforeend', `<li>${esc(ev.text)}</li>`);
  }
};

;
// ---- buses.js
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

;
// ---- web-ui.js
// Calgary Insight on the web: wording for a browser instead of a desktop app, the daily refresh time, and the
// access-code lock in front of the AI screens.
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const set = (sel, text) => { const el = $(sel); if (el) el.textContent = text; };

  set('#settings-title + .meta', 'Saved in this browser only');
  set('#pop-hint', 'The choice is saved in this browser. Every figure on the website is worked out under each way of counting every morning.');
  const sys = document.querySelector('[data-theme-pref="system"]');
  if (sys) sys.textContent = 'Match this device';
  const sub = document.querySelector('#theme-seg') && document.querySelector('#theme-seg').closest('.card').querySelector('.card-sub');
  if (sub) sub.textContent = 'Light, dark, or follow this device';

  // shareable addresses: calgaryinsight.ca/?view=growth opens that screen, and the address follows the screen shown
  if (typeof window.show === 'function') {
    const orig = window.show;
    window.show = function (view) {
      orig.apply(this, arguments);
      try {
        const u = new URL(location.href);
        if (view && view !== 'dashboard') u.searchParams.set('view', view); else u.searchParams.delete('view');
        history.replaceState(null, '', u.pathname + u.search + u.hash);
      } catch (e) { /* the address stays as it was */ }
    };
    const first = new URLSearchParams(location.search).get('view');
    if (first && document.getElementById('view-' + first)) setTimeout(() => window.show(first), 0);
  }

  // when the data was refreshed, and whose it is
  const foot = document.createElement('div');
  foot.className = 'web-foot';
  foot.innerHTML = 'Refreshed every morning from public data. Not affiliated with The City of Calgary. <a href="wards/">Wards</a> · <a href="communities/">Communities</a> · <a href="news/">News</a> · <a href="ask/">Data Genie</a> · <a href="game/">Game</a>';
  // ...and the community it names, once the ward's figures are on screen
  const wantComm = new URLSearchParams(location.search).get('community');
  if (wantComm) {
    const pick = () => { const D = window.CDD_DASH && window.CDD_DASH(); if (D && (D.communities || []).some(c => c.code === wantComm) && typeof window.select === 'function') { document.removeEventListener('cdd-dash', pick); setTimeout(() => window.select(wantComm, true), 300); } };
    document.addEventListener('cdd-dash', pick);
  }
  const side = $('.side-foot');
  if (side) side.appendChild(foot);
  window.CDD_WEB.getJSON('built.json').then(b => {
    const bad = (b.steps || []).filter(s => !s.ok).length;
    foot.innerHTML = `Data refreshed ${esc(b.built_at)} (Calgary time)${bad ? `, ${bad} source${bad > 1 ? 's' : ''} not reached` : ''}. From public data; not affiliated with The City of Calgary. <a href="wards/">Wards</a> · <a href="communities/">Communities</a> · <a href="news/">News</a> · <a href="ask/">Data Genie</a> · <a href="game/">Game</a>`;
    const st = $('#side-status'); if (st) st.title = foot.textContent;
  }).catch(() => {});


  // traffic cameras: the website shows each camera's latest image (the desktop app also keeps 30 minutes to replay)
  const camWords = el => {
    if (!el) return;
    const fix = () => {
      const t = el.textContent, n = t.replace(/Each plays its images from the last 30 minutes on a loop; the City adds a new image about once a minute\./,
        'Each shows the City\'s latest image, refreshed every minute here.')
        .replace('Each camera replays its last 30 minutes on a loop', 'The City\'s latest image from each camera, refreshed every minute');
      if (n !== t) el.textContent = n;
    };
    fix();
    new MutationObserver(fix).observe(el, { childList: true, characterData: true, subtree: true });
  };
  camWords($('#cam-sub'));
  camWords($('#camstrip-title') && $('#camstrip-title').parentElement.querySelector('.card-sub'));
  setInterval(() => {
    document.querySelectorAll('.cam[data-cam] img').forEach(img => {
      if (document.hidden || !img.isConnected) return;
      const u = img.closest('.cam').dataset.cam;
      img.style.visibility = '';
      if (img.nextElementSibling) img.nextElementSibling.hidden = true;
      img.src = u + (u.includes('?') ? '&' : '?') + 't=' + Math.floor(Date.now() / 60000);
    });
  }, 60000);

  // the contact address for Invest in Calgary's form (set in the website build)
  window.CDD_WEB.getJSON('settings.json').then(st => { window.CDD_CONTACT = (st && st.contact) || ''; }).catch(() => {});

  // the newsletter is made by the desktop app: not on the website at all
  document.querySelectorAll('.tab[data-view="news"], [data-goto="news"]').forEach(el => el.remove());
  const newsView = $('#view-news');
  if (newsView) newsView.remove();

  // Data Genie and Data Scientist: open to everyone like Election Analytics (the figures, charts and ready-made questions),
  // with the chat bar and the report buttons locked until an approved Google sign-in or the passcode (web-ai.js does the rest)
  const NAME = { '#view-ask': 'Data Genie', '#view-scientist': 'The Data Scientist' };
  let locked = true;
  const bar = sel => `<div class="web-lock web-lock-bar" data-lockfor="${sel}"><div class="wlb-text"><b><svg class="ic" aria-hidden="true"><use href="#i-key"/></svg>${NAME[sel]} is locked</b>
      <span>Sign in with an approved Google account, or enter the passcode.<span class="wlb-more"> ${sel === '#view-ask' ? 'Pick a question and it waits in the box below until you unlock.' : 'Every topic and figure is shown; making a report needs access.'} To get access, contact the developer.</span></span></div>
    <form><label class="sr-only" for="code-${sel.slice(6)}">Passcode</label><input type="password" id="code-${sel.slice(6)}" autocomplete="off" placeholder="Passcode">
    <button type="submit" class="btn primary">Unlock</button></form><p class="web-lock-msg" role="status"></p></div>`;
  const nudge = (v, text) => {
    const l = v && v.querySelector('.web-lock-bar'); if (!l) return;
    l.classList.remove('wlb-flash'); void l.offsetWidth; l.classList.add('wlb-flash');
    l.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const m = l.querySelector('.web-lock-msg'); if (m && text) { m.textContent = text; m.classList.add('info'); }
    const i = l.querySelector('input'); if (i) i.focus({ preventScroll: true });
  };
  // the figures for the selected area, from the dashboard already on screen
  const n0 = v => v === null || v === undefined || Number.isNaN(+v) ? '–' : Math.round(+v).toLocaleString('en-CA');
  const n1 = v => v === null || v === undefined || Number.isNaN(+v) ? '–' : (+v).toLocaleString('en-CA', { maximumFractionDigits: 1 });
  const pc = v => v === null || v === undefined || Number.isNaN(+v) ? '' : `<small class="${+v > 0 ? 'up' : 'down'}">${+v > 0 ? '+' : ''}${n1(v)}% on the year before</small>`;
  function bars(rows, fmtv) {
    const max = Math.max(...rows.map(r => r.v || 0), 1e-9);
    return `<div class="fb-bars">${rows.map(r => `<div class="fb-bar"><span class="fb-bar-l">${esc(r.label)}</span><span class="fb-bar-t"><i style="width:${(r.v || 0) / max * 100}%"></i></span><span class="fb-bar-v">${esc(fmtv(r.v))}</span></div>`).join('')}</div>`;
  }
  function months(t) {
    const ms = t.months || [], vs = t.all || []; if (!vs.length) return '';
    const max = Math.max(...vs, 1), W = 360, H = 140, gw = W / vs.length;
    const lab = m => { const d = new Date(String(m).slice(0, 7) + '-15T12:00:00'); return isNaN(d) ? String(m) : d.toLocaleDateString('en-CA', { month: 'short' }); };
    return `<svg class="wsn-cols" viewBox="0 0 ${W} ${H}" role="img" aria-label="311 requests by month">${vs.map((v, i) => { const h = v / max * (H - 36);
      return `<rect x="${i * gw + 4}" y="${H - 20 - h}" width="${gw - 8}" height="${h}" rx="2"><title>${esc(ms[i])}: ${n0(v)}</title></rect><text x="${i * gw + gw / 2}" y="${H - 5}" text-anchor="middle">${esc(lab(ms[i]))}</text>`; }).join('')}</svg>`;
  }
  function snapshot(sel) {
    const D = window.CDD_DASH && window.CDD_DASH();
    if (!D || !D.summary) return '';
    const S = D.summary, C = D.crime || {}, area = (D.scope && D.scope.name) || (D.ward && D.ward.number ? 'Ward ' + D.ward.number : 'Calgary');
    const tiles = [['Residents', n0((D.ward || {}).residents), ''], ['311 requests, last 12 months', n0(S.requests12), pc(S.requests_change_pct)],
      ['Open 311 requests now', n0(S.open_now), S.open_over_90_days ? `<small>${n0(S.open_over_90_days)} open over 90 days</small>` : ''],
      ['Crimes per 1,000 residents', n1(C.per_1000), C.city_per_1000 ? `<small>Calgary ${n1(C.city_per_1000)}</small>` : ''],
      ['Crimes reported to police', n0(C.crimes), pc(C.change_pct)], ['Closed within 7 days', S.closed_7_days_pct ? n1(S.closed_7_days_pct) + '%' : '–', '']];
    const types = (D.open_by_type || []).filter(t => !/contact us/i.test(t.type || '')).slice(0, 6).map(t => ({ label: String(t.type || '').replace(/ - GIS$/, ''), v: t.n }));
    const cats = (C.by_category || []).slice(0, 6).map(c => ({ label: c.label || c.category, v: c.n }));
    return `<section class="card wsn" data-snap="${sel}"><div class="card-head"><div><h2>${esc(area)} in figures</h2><p class="card-sub">What ${sel === '#view-ask' ? 'Data Genie answers' : 'the Data Scientist builds reports'} from, among over 400 public datasets: the area selected on the dashboard${D.period ? `, ${esc(D.period)}` : ''}${C.period ? `; police figures ${esc(C.period)}` : ''}</p></div></div>
      <div class="fb-kpis">${tiles.map(([l, v, x]) => `<div class="fb-kpi"><div class="fb-kpi-l">${esc(l)}</div><div class="fb-kpi-n">${v}</div>${x}</div>`).join('')}</div>
      <div class="wsn-two">${(D.trend || {}).all ? `<div><h3 class="fb-h3">311 requests by month</h3>${months(D.trend)}</div>` : ''}
        ${types.length ? `<div><h3 class="fb-h3">Most common open 311 requests</h3>${bars(types, n0)}</div>` : ''}
        ${cats.length ? `<div><h3 class="fb-h3">Crimes by kind</h3>${bars(cats, n0)}</div>` : ''}</div></section>`;
  }
  function paintSnap() {
    const ask = $('#welcome'), sug = ask && ask.querySelector('.suggest');
    if (sug) { const old = ask.querySelector('.wsn'); if (old) old.remove(); sug.insertAdjacentHTML('beforebegin', snapshot('#view-ask')); }
    const top = $('#ds-make .ds-sec-head');
    if (top) { const old = $('#ds-make .wsn'); if (old) old.remove(); top.insertAdjacentHTML('beforebegin', snapshot('#view-scientist')); }
  }
  // a click or submit that needs the AI, while locked: keep the question and point at the lock
  document.addEventListener('click', e => {
    if (!locked) return;
    const sug = e.target.closest('#view-ask .suggest button');
    if (sug) { e.preventDefault(); e.stopPropagation(); const q = $('#question'); if (q) q.value = sug.textContent.trim(); nudge($('#view-ask'), 'Your question is ready: unlock to ask it.'); return; }
    const ds = e.target.closest('#view-scientist .ds-topic, #view-scientist #ds-go, #view-scientist [data-audit], #view-scientist #au-reports button');
    if (ds) { e.preventDefault(); e.stopPropagation(); if (ds.classList.contains('ds-topic')) { const t = $('#ds-text'), b = ds.querySelector('b'); if (t && b) t.value = b.textContent; }
      nudge($('#view-scientist'), 'Unlock to make this report.'); }
  }, true);
  document.addEventListener('submit', e => {
    if (!locked || !e.target.matches('#composer, #ds-own')) return;
    e.preventDefault(); e.stopPropagation(); nudge(e.target.closest('.view'), 'Unlock to ask.');
  }, true);
  document.addEventListener('keydown', e => {
    if (locked && e.key === 'Enter' && !e.shiftKey && e.target.id === 'question') { e.preventDefault(); e.stopPropagation(); nudge($('#view-ask'), 'Unlock to ask.'); }
  }, true);
  window.CDD_LOCK = {
    lock() {
      locked = true;
      Object.keys(NAME).forEach(sel => {
        const v = $(sel);
        if (!v || v.querySelector('.web-lock-bar')) return;
        v.classList.add('web-chatlock');
        const where = sel === '#view-ask' ? $('#composer') : $('#ds-tabs');
        if (!where) return;
        where.insertAdjacentHTML(sel === '#view-ask' ? 'beforebegin' : 'afterend', bar(sel));
        v.querySelector('.web-lock-bar form').addEventListener('submit', async e => {
          e.preventDefault(); e.stopPropagation();
          const msg = v.querySelector('.web-lock-bar .web-lock-msg');
          msg.classList.remove('info'); msg.textContent = 'Checking';
          try {
            if (!window.CDD_AI) throw new Error(NAME[sel] + ' is not switched on for this website yet.');
            await window.CDD_AI.unlock(e.target.querySelector('input').value);
            window.CDD_LOCK.open();
          } catch (err) { msg.textContent = String(err.message || err); }
        });
      });
      const q = $('#question'); if (q) q.placeholder = 'Locked: sign in or enter the passcode above to ask';
    },
    open() {
      locked = false;
      Object.keys(NAME).forEach(sel => { const v = $(sel); if (!v) return; v.classList.remove('web-chatlock', 'web-locked'); v.querySelectorAll('.web-lock-bar').forEach(l => l.remove()); });
      const q = $('#question'); if (q) { q.placeholder = 'Ask a question about City of Calgary data, or ask for a full report with charts and maps'; if (q.value && $('#view-ask.is-on')) q.focus(); }
      document.dispatchEvent(new CustomEvent('cdd-unlocked'));
    },
    get locked() { return locked; },
  };

  // ---- links that keep what you picked: ?view=issues&ward=7&community=MAR opens the same screen, ward and community
  const setParam = (k, v) => {
    try {
      const u = new URL(location.href);
      if (v === null || v === undefined || v === '' || v === 0) u.searchParams.delete(k); else u.searchParams.set(k, v);
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    } catch (e) { /* the address stays as it was */ }
  };
  let commPick = new URLSearchParams(location.search).get('community') || '';
  window.onCommunityPanel = code => { commPick = code || ''; setParam('community', commPick); };
  document.addEventListener('cdd-dash', () => {
    const D = window.CDD_DASH && window.CDD_DASH();
    if (!D) return;
    const w = D.scope && D.scope.ward ? +D.scope.ward : 0;
    setParam('ward', w);
    if (commPick && !(D.communities || []).some(c => c.code === commPick)) { commPick = ''; setParam('community', ''); }
    wardLink(w);
  });

  // ---- every community and ward has its own page (communities/<name>/, wards/<n>/): link to them from the dashboard
  let pages = null;
  const pagesP = fetch('communities/pages.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : []).then(p => (pages = p)).catch(() => (pages = []));
  window.CDD_COMM_LINK = c => {
    const p = (pages || []).find(x => x.code === c.code);
    return p ? `<a class="btn web-comm-page" href="${esc(p.path)}">${esc(c.name)}'s own page: figures to share and print ↗</a>` : '';
  };
  pagesP.then(() => { const D = window.CDD_DASH && window.CDD_DASH(); if (D && commPick && typeof window.select === 'function' && $('#panel .detail')) window.select(commPick); });
  function wardLink(w) {            // in the finder row: the page of the ward on screen
    const a = $('#web-ward-page');
    if (!a) return;
    a.hidden = !w;
    if (w) { a.href = `wards/${w}/`; a.textContent = `Ward ${w}'s page`; }
  }
  // a "find your community" box at the top of the overview
  const head = $('#dash-body') && $('#dash-body').parentElement;
  if (head) {
    head.insertAdjacentHTML('afterbegin', `<div class="web-finder" role="search">
      <label for="web-find">Find your community</label>
      <div class="web-find-box"><input id="web-find" type="search" autocomplete="off" placeholder="Type a community, e.g. Martindale" aria-controls="web-find-list">
      <ul id="web-find-list" class="web-find-list" role="listbox" hidden></ul></div>
      <span class="web-find-all"><a id="web-ward-page" href="wards/" hidden></a><a href="communities/">All 270 communities</a><a href="wards/">All 14 wards</a><a href="311/">311</a><a href="crime/">Crime</a><a href="growth/">Growth</a></span></div>`);
    const inp = $('#web-find'), list = $('#web-find-list');
    pagesP.then(p => { const n = $('.web-find-all a[href="communities/"]'); if (n && p.length) n.textContent = `All ${p.length} communities`; });
    const norm = t => String(t).toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, ' ').trim();
    inp.addEventListener('input', () => {
      const q = norm(inp.value);
      if (!q || !pages) { list.hidden = true; return; }
      const hits = pages.filter(p => norm(p.name).includes(q)).sort((a, b) => norm(a.name).indexOf(q) - norm(b.name).indexOf(q)).slice(0, 8);
      list.innerHTML = hits.length ? hits.map(p => `<li role="option"><a href="${esc(p.path)}"><b>${esc(p.name)}</b><span>Ward ${esc(p.ward || '')}</span></a></li>`).join('')
        : '<li class="none">No community by that name. <a href="communities/">See them all</a></li>';
      list.hidden = false;
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { const a = list.querySelector('a'); if (a && !list.hidden) { e.preventDefault(); location.href = a.href; } } if (e.key === 'Escape') { list.hidden = true; } });
    document.addEventListener('click', e => { if (!e.target.closest('.web-finder')) list.hidden = true; });
  }
  // the figures follow the area and refresh whenever either screen is opened
  if (typeof window.show === 'function') {
    const prev = window.show;
    window.show = function (view) { prev.apply(this, arguments); if (view === 'ask' || view === 'scientist') { try { paintSnap(); } catch (e) { /* figures optional */ } } };
  }
  document.addEventListener('cdd-dash', () => { try { paintSnap(); } catch (e) { /* figures optional */ } });
  if (window.CDD_AI && window.CDD_AI.unlocked && window.CDD_AI.unlocked()) window.CDD_LOCK.open(); else window.CDD_LOCK.lock();
})();

;
// ---- web-account.js
// Data Genie's memory and the optional sign-in.
// Memory: past chats (to reopen and carry on) and short notes the visitor lets Data Genie keep (their area, role,
// interests). It works without an account, in the visitor's own browser. Signing in with Google (optional) keeps the same
// memory in the visitor's own record (Firebase: users/{uid}, readable only by them), so it follows them to other devices.
// Sign-in appears only when the site has a Firebase project (settings.json: firebase).
(() => {
  'use strict';
  const W = window.CDD_WEB, api = window.pywebview && window.pywebview.api;
  if (!W || !api) return;
  const KEY = 'cdd-genie-memory-v1', MAX_CHATS = 60, MAX_TURNS = 40, MAX_ANSWER = 12000, MAX_NOTES = 60, MAX_RESEARCH = 30;
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const now = () => new Date().toISOString();
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // ---------------------------------------------------------------- the memory (browser first, account when signed in)
  let mem = load();
  let chatId = null, restore = null, user = null, db = null, fb = null, cloudTimer = null;
  function load() {
    try { const m = JSON.parse(localStorage.getItem(KEY) || 'null'); if (m && Array.isArray(m.chats)) return { on: true, notes: [], research: [], ...m }; } catch (e) { /* private window */ }
    return { on: true, notes: [], chats: [], research: [] };
  }
  function save(toCloud = true) {
    mem.chats = mem.chats.sort((a, b) => (b.updated || '').localeCompare(a.updated || '')).slice(0, MAX_CHATS);
    mem.notes = mem.notes.slice(-MAX_NOTES);
    mem.research = (mem.research || []).slice(0, MAX_RESEARCH);
    try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* full or blocked: the memory lasts this visit */ }
    if (toCloud && user && db) { clearTimeout(cloudTimer); cloudTimer = setTimeout(pushCloud, 800); }
    renderChats();
  }
  const notesText = () => mem.on ? mem.notes.map(n => '- ' + n.text).join('\n') : '';
  function addNote(text) {
    text = String(text || '').trim();
    if (!text || !mem.on) return;
    if (!mem.notes.some(n => n.text.toLowerCase() === text.toLowerCase())) mem.notes.push({ id: newId(), text, at: now() });
    save(); flash(`Noted for later chats: “${text}”`, () => { mem.notes = mem.notes.filter(n => n.text !== text); save(); });
  }
  function removeNotes(words) {
    const w = String(words || '').toLowerCase().split(/\s+/).filter(Boolean);
    const before = mem.notes.length;
    mem.notes = mem.notes.filter(n => !w.every(x => n.text.toLowerCase().includes(x)));
    if (mem.notes.length !== before) { save(); flash('Removed from Data Genie\'s notes.'); }
  }
  function recordTurn(q, a) {
    if (!mem.on || !q || !a) return;
    let c = mem.chats.find(x => x.id === chatId);
    if (!c) { chatId = newId(); c = { id: chatId, title: q.slice(0, 80), turns: [], created: now() }; mem.chats.unshift(c); }
    c.turns.push({ q: q.slice(0, 4000), a: String(a).slice(0, MAX_ANSWER) });
    c.turns = c.turns.slice(-MAX_TURNS);
    c.updated = now();
    save();
  }
  window.CDD_MEMORY = { notesText, addNote, removeNotes };

  // ---------------------------------------------------------------- wiring into Data Genie
  const ask = api.ask;
  api.ask = async (question, mode) => {
    const res = await ask(question, mode, { notes: notesText(), restore: takeRestore() });
    if (res && res.ok) recordTurn(question, res.text);
    return res;
  };
  function takeRestore() { const r = restore; restore = null; return r; }
  // earlier reports' research: kept when a report is made, sent with the next one so it starts from it (only new data fetched)
  function keepResearch(rec) {
    if (!rec || !mem.on) return;
    mem.research = [rec, ...(mem.research || []).filter(r => r.id !== rec.id)];
    save();
    if (user && db) db.collection('users').doc(user.uid).collection('research').doc(String(rec.id).slice(0, 140)).set(rec).catch(() => {});
  }
  const withResearch = fn => fn && ((...a) => { const n = fn.length - 1; /* the last parameter is extra */ const args = a.slice(0, n); while (args.length < n) args.push(undefined);
    return fn(...args, { research: mem.on ? (mem.research || []) : [] }); });
  api.analyst_run = withResearch(api.analyst_run);
  api.election_report = withResearch(api.election_report);
  api.business_report = withResearch(api.business_report);
  const onAnalyst = window.onAnalystEvent;
  window.onAnalystEvent = ev => { if (ev && ev.type === 'research') { keepResearch(ev.record); return; } if (onAnalyst) onAnalyst(ev); };
  const onEvent = window.onAgentEvent;
  window.onAgentEvent = ev => {
    if (ev && ev.type === 'memory') { ev.op === 'add' ? addNote(ev.text) : removeNotes(ev.text); return; }
    if (ev && ev.type === 'research') { keepResearch(ev.record); return; }
    if (onEvent) onEvent(ev);
  };
  const newBtn = $('#new-chat');
  if (newBtn) newBtn.addEventListener('click', () => { chatId = null; restore = null; }, true);

  function openChat(id) {
    const c = mem.chats.find(x => x.id === id);
    if (!c || typeof window.addUser !== 'function') return;
    chatId = id; restore = c.turns.map(t => ({ q: t.q, a: t.a }));
    const th = $('#thread');
    th.innerHTML = '';
    for (const t of c.turns) {
      window.addUser(t.q);
      const b = window.addBot();
      $('.steps', b)?.remove();
      $('.answer', b).innerHTML = window.DOMPurify ? DOMPurify.sanitize(marked.parse(t.a)) : esc(t.a);
      $('.msg-meta', b).textContent = 'From a saved chat';
    }
    th.scrollTop = th.scrollHeight;
    closePop();
    $('#question')?.focus();
  }

  // ---------------------------------------------------------------- past chats (in Data Genie's top bar)
  let pop = null;
  function chatsButton() {
    const bar = newBtn && newBtn.parentElement;
    if (!bar || $('#past-chats')) return;
    const b = document.createElement('button');
    b.className = 'btn'; b.id = 'past-chats'; b.type = 'button'; b.setAttribute('aria-haspopup', 'true'); b.setAttribute('aria-expanded', 'false');
    b.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-clock"/></svg><span>Past chats</span>';
    b.addEventListener('click', e => { e.stopPropagation(); pop ? closePop() : openPop(b); });
    bar.insertBefore(b, newBtn);
  }
  function openPop(b) {
    pop = document.createElement('div');
    pop.className = 'acct-pop'; pop.setAttribute('role', 'menu');
    b.setAttribute('aria-expanded', 'true');
    b.parentElement.style.position = 'relative';
    b.parentElement.appendChild(pop);
    renderChats();
    setTimeout(() => document.addEventListener('click', outside), 0);
  }
  function outside(e) { if (pop && !pop.contains(e.target)) closePop(); }
  function closePop() {
    if (!pop) return;
    pop.remove(); pop = null; document.removeEventListener('click', outside);
    $('#past-chats')?.setAttribute('aria-expanded', 'false');
  }
  function renderChats() {
    if (!pop) return;
    const where = user ? `Kept in your account (${esc(user.email || user.displayName || 'signed in')})` : 'Kept in this browser only. Sign in to keep them on every device.';
    pop.innerHTML = `<div class="acct-pop-head"><strong>Past chats</strong><span>${where}</span></div>` +
      (mem.chats.length ? mem.chats.map(c => `<div class="acct-chat"><button type="button" role="menuitem" data-open="${c.id}"><span>${esc(c.title)}</span>
        <small>${esc(new Date(c.updated || c.created).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }))} · ${c.turns.length} question${c.turns.length === 1 ? '' : 's'}</small></button>
        <button type="button" class="acct-x" data-del="${c.id}" aria-label="Delete this chat" title="Delete this chat">×</button></div>`).join('')
        : '<p class="acct-empty">No saved chats yet. Your questions to Data Genie are kept here so you can come back to them.</p>') +
      `<div class="acct-pop-foot"><button type="button" class="btn" data-acct>${user ? 'Your account and notes' : 'Sign in or manage memory'}</button></div>`;
    pop.querySelectorAll('[data-open]').forEach(x => x.addEventListener('click', () => openChat(x.dataset.open)));
    pop.querySelectorAll('[data-del]').forEach(x => x.addEventListener('click', e => {
      e.stopPropagation(); mem.chats = mem.chats.filter(c => c.id !== x.dataset.del); if (chatId === x.dataset.del) chatId = null; save();
      if (user && db) db.collection('users').doc(user.uid).collection('chats').doc(x.dataset.del).delete().catch(() => {});
    }));
    pop.querySelector('[data-acct]').addEventListener('click', () => { closePop(); openAccount(); });
  }

  // ---------------------------------------------------------------- a short notice with Undo
  let flashEl = null;
  function flash(text, undo) {
    flashEl?.remove();
    flashEl = document.createElement('div');
    flashEl.className = 'acct-flash'; flashEl.setAttribute('role', 'status');
    flashEl.innerHTML = `<span>${esc(text)}</span>${undo ? '<button type="button">Undo</button>' : ''}`;
    if (undo) flashEl.querySelector('button').addEventListener('click', () => { undo(); flashEl.remove(); });
    // inside the account window when it is open: a modal window sits above the page, so a message on the page is hidden
    (dlg && dlg.open ? dlg : document.body).appendChild(flashEl);
    const el = flashEl; setTimeout(() => el.remove(), 7000);
  }

  // ---------------------------------------------------------------- the account panel (sign-in is optional)
  let dlg = null;
  function openAccount() {
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'acct-dlg'; dlg.setAttribute('aria-labelledby', 'acct-title');
      document.body.appendChild(dlg);
      dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    }
    renderAccount();
    dlg.showModal();
    refreshMe();
  }
  function renderAccount() {
    if (!dlg) return;
    const signIn = fbConfig
      ? (user
        ? `<div class="acct-who">${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : ''}<div><strong>${esc(user.displayName || 'Signed in')}</strong><span>${esc(user.email || '')}</span></div></div>
           <p class="acct-small">Your chats and notes are kept in your own record. Only you can read them; the site's owner does not use them for anything else.</p>
           <div class="acct-row"><button type="button" class="btn" data-out>Sign out</button></div>`
        : `<p>An account is optional. Everything works without one; signing in only keeps your chats and notes on every device you use.</p>
           <button type="button" class="acct-google" data-google><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.7 1.2 9.2 3.6l6.9-6.9C35.9 2.4 30.4 0 24 0 14.6 0 6.6 5.4 2.7 13.2l8 6.2C12.6 13.5 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/><path fill="#FBBC05" d="M10.7 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-8-6.2C1 16.6 0 20.2 0 24s1 7.4 2.7 10.8l8-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.2 0-11.4-4-13.3-9.9l-8 6.2C6.6 42.6 14.6 48 24 48z"/></svg><span>Continue with Google</span></button>
           <p class="acct-small">Google tells this site your name, email and picture. Nothing is posted anywhere. The site's owner sees who has signed in (name, email and when), to approve people for the AI tools.</p>`)
      : '<p class="acct-small">Signing in is not switched on for this website yet. Your memory is kept in this browser.</p>';
    dlg.innerHTML = `<form method="dialog" class="acct-body">
      <div class="acct-head"><h2 id="acct-title">${user ? 'Your account' : 'Sign in (optional)'}</h2><button class="acct-close" aria-label="Close">×</button></div>
      ${signIn}
      ${aiSection()}
      <h3>Data Genie's memory</h3>
      <label class="acct-switch"><input type="checkbox" data-on ${mem.on ? 'checked' : ''}><span>Remember my chats and what I tell Data Genie</span></label>
      <p class="acct-small">${mem.chats.length} saved chat${mem.chats.length === 1 ? '' : 's'} and ${(mem.research || []).length} report${(mem.research || []).length === 1 ? '' : 's'}' research (a new report starts from it and fetches only newer data). Notes Data Genie keeps about you (it uses them only where they change an answer):</p>
      <ul class="acct-notes">${mem.notes.length ? mem.notes.map(n => `<li><span>${esc(n.text)}</span><button type="button" data-note="${n.id}" aria-label="Delete this note">×</button></li>`).join('') : '<li class="acct-empty">No notes yet. Tell Data Genie your community or what you follow, and it will remember.</li>'}</ul>
      <div class="acct-row"><input type="text" data-new maxlength="300" placeholder="Add a note, e.g. I live in Bowness" aria-label="Add a note"><button type="button" class="btn" data-add>Add</button></div>
      <div class="acct-row acct-danger"><button type="button" class="btn" data-wipe>Delete all chats, notes and research${user ? ' (here and in my account)' : ''}</button></div>
    </form>`;
    const q = s => dlg.querySelector(s);
    q('[data-google]')?.addEventListener('click', signInGoogle);
    q('[data-out]')?.addEventListener('click', () => fb && fb.auth().signOut());
    q('[data-on]').addEventListener('change', e => { mem.on = e.target.checked; save(); });
    dlg.querySelectorAll('[data-revoke]').forEach(b => b.addEventListener('click', async () => {
      try { await gwFetch('/admin/users', { method: 'POST', body: JSON.stringify({ email: b.dataset.revoke, remove: true }) }); flash(`${b.dataset.revoke} removed.`); }
      catch (e) { flash(String(e.message || e)); }
      loadAdmin();
    }));
    dlg.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
      const u = ((admin && admin.users) || []).find(x => x.email === b.dataset.edit);
      if (!u) return;
      q('[data-grant]').value = u.email; q('[data-grant-limit]').value = u.limit_usd == null ? '' : u.limit_usd;
      dlg.querySelectorAll('[data-tool]').forEach(c => { c.checked = (u.tools || ['genie']).includes(c.dataset.tool); });
      q('[data-grant]').focus();
    }));
    q('[data-csv]')?.addEventListener('click', peopleCsv);
    dlg.querySelectorAll('[data-approve]').forEach(b => b.addEventListener('click', async () => {
      b.disabled = true;
      try { await gwFetch('/admin/users', { method: 'POST', body: JSON.stringify({ email: b.dataset.approve, limit_usd: null, tools: ['genie'] }) }); flash(`${b.dataset.approve} can now use Data Genie and the Data Scientist.`); }
      catch (e) { flash(String(e.message || e)); }
      loadAdmin();
    }));
    q('[data-grant-add]')?.addEventListener('click', async () => {
      const email = q('[data-grant]').value.trim(), lim = q('[data-grant-limit]').value.trim();
      if (!email) return;
      const tools = [...dlg.querySelectorAll('[data-tool]')].filter(c => c.checked).map(c => c.dataset.tool);
      if (!tools.length) { flash('Tick at least one AI tool.'); return; }
      try { await gwFetch('/admin/users', { method: 'POST', body: JSON.stringify({ email, limit_usd: lim === '' ? null : Number(lim), tools }) }); flash(`${email} can now use the AI tools you ticked.`); }
      catch (e) { flash(String(e.message || e)); }
      loadAdmin();
    });
    dlg.querySelectorAll('[data-note]').forEach(b => b.addEventListener('click', () => { mem.notes = mem.notes.filter(n => n.id !== b.dataset.note); save(); renderAccount(); }));
    const add = () => { const v = q('[data-new]').value.trim(); if (v) { mem.notes.push({ id: newId(), text: v, at: now() }); save(); renderAccount(); } };
    q('[data-add]').addEventListener('click', add);
    q('[data-new]').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
    let armed = false;
    q('[data-wipe]').addEventListener('click', async e => {
      if (!armed) { armed = true; e.target.textContent = 'Press again to delete everything'; return; }
      const ids = mem.chats.map(c => c.id);
      const rids = (mem.research || []).map(r => r.id);
      mem = { on: mem.on, notes: [], chats: [], research: [] }; chatId = null; save(false);
      if (user && db) {
        const ref = db.collection('users').doc(user.uid);
        await Promise.all(ids.map(id => ref.collection('chats').doc(id).delete().catch(() => {})));
        await Promise.all(rids.map(id => ref.collection('research').doc(String(id).slice(0, 140)).delete().catch(() => {})));
        await ref.set({ notes: [], on: mem.on, updated: now() }).catch(() => {});
      }
      renderAccount(); flash('All chats and notes deleted.');
    });
  }

  // ---------------------------------------------------------------- the AI tools for approved people (gateway/worker.js)
  // Signed in and approved by the owner: Data Genie and the Data Scientist unlock with a gateway session (the Claude key
  // stays on the gateway, which also keeps each person's daily spending limit). The passcode still works as before.
  let gw = '', ai = null, admin = null;
  async function gwFetch(path, opts = {}) {
    const t = await user.getIdToken();
    const r = await fetch(gw + path, { ...opts, headers: { authorization: 'Bearer ' + t, 'content-type': 'application/json', ...(opts.headers || {}) } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error((j.error && j.error.message) || `The AI gateway answered ${r.status}`);
    return j;
  }
  async function aiAccess() {
    if (!user || !gw) { ai = null; return; }
    try {
      const j = await gwFetch('/session', { method: 'POST' });
      ai = { ...j, session: undefined };
      if (window.CDD_AI && window.CDD_AI.useAccount) {
        await window.CDD_AI.useAccount(j.session, gw, j.tools || ['genie']);
        if ((j.tools || []).includes('genie')) window.CDD_LOCK && window.CDD_LOCK.open();
        document.dispatchEvent(new CustomEvent('cdd-unlocked'));           // Election Analytics and the Business Economist redraw
      }
      if (ai.owner) loadAdmin();
    } catch (e) { ai = { allowed: false, message: String(e.message || e) }; }
    renderAccount(); lockButtons();
  }
  async function refreshMe() { if (user && gw && ai && ai.allowed) { try { ai = { ...ai, ...(await gwFetch('/me')) }; renderAccount(); } catch (e) { /* keep the last */ } } }
  async function loadAdmin() {
    try { const [u, p, t] = await Promise.all([gwFetch('/admin/users'), gwFetch('/admin/seen').catch(e => ({ error: String(e.message || e) })), gwFetch('/admin/traffic').catch(e => ({ error: String(e.message || e) }))]); admin = { ...u, seen: p, traffic: t }; }
    catch (e) { admin = { error: String(e.message || e) }; }
    renderAccount();
  }
  const when = t => { if (!t) return ''; const d = new Date(t); return isNaN(d) ? String(t) : d.toLocaleString('en-CA', { timeZone: 'America/Edmonton', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); };
  function peopleCsv() {
    const rows = [['Email', 'Name', 'First signed in', 'Last signed in', 'Days signed in', 'Approved for AI tools']]
      .concat((((admin || {}).seen || {}).people || []).map(p => [p.email, p.name || '', p.first || '', p.last || '', p.days || '', p.owner ? 'owner' : p.approved ? 'yes' : 'no']));
    const csv = rows.map(r => r.map(v => /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v)).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' }));
    a.download = 'Calgary Insight sign-ins ' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000);
  }
  function trafficSection() {
    const T = (admin || {}).traffic;
    if (!T) return '';
    if (T.error) return `<h3>Website traffic</h3><p class="acct-small">${esc(T.error)}</p>`;
    const n = v => Number(v || 0).toLocaleString('en-CA');
    const tile = (label, d) => `<div class="acct-stat"><b>${n(d.visitors)}</b><span>${label}</span><small>${n(d.views)} page views</small></div>`;
    const days = T.days || [], max = Math.max(1, ...days.map(d => d.visitors));
    const short = d => new Date(d + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
    const list = (rows, name) => rows && rows.length ? `<ul class="acct-notes acct-traffic">${rows.map(r => `<li><span>${esc(name ? name(r.name) : r.name)}</span><b>${n(r.count)}</b></li>`).join('')}</ul>` : '<p class="acct-small">Nothing counted yet.</p>';
    let country = c => c;
    try { const dn = new Intl.DisplayNames(['en'], { type: 'region' }); country = c => dn.of(c) || c; } catch (e) { /* the code is shown */ }
    return `<h3>Website traffic</h3><p class="acct-small">Visitors to calgaryinsight.ca${T.since ? `, counted since ${esc(short(T.since))}` : ''}. A visitor is one browser in one day, so the 7 and 30 day figures add up each day's visitors. Counted anonymously, with no cookies; search engine robots are left out.</p>
      <div class="acct-stats">${tile('Today', T.today)}${tile('Yesterday', T.yesterday)}${tile('Last 7 days', T.last7)}${tile('Last 30 days', T.last30)}</div>
      ${days.length > 1 ? `<div class="acct-bars" role="img" aria-label="Visitors per day, last 30 days">${days.map(d => `<i style="height:${Math.max(3, Math.round(d.visitors / max * 100))}%" title="${esc(short(d.day))}: ${n(d.visitors)} visitors, ${n(d.views)} page views"></i>`).join('')}</div><p class="acct-small">Visitors per day, ${esc(short(days[0].day))} to ${esc(short(days[days.length - 1].day))}.</p>` : ''}
      <h4>Most viewed pages (30 days, page views)</h4>${list(T.pages)}
      <h4>Where visitors came from (30 days)</h4>${list(T.sources)}
      <h4>Countries (30 days, visitors)</h4>${list(T.countries, country)}`;
  }
  function peopleSection() {
    const S = (admin || {}).seen;
    if (!S) return '';
    if (S.error) return `<h3>People who signed in</h3><p class="acct-small">${esc(S.error)}</p>`;
    const ppl = S.people || [];
    return `<h3>People who signed in (${ppl.length})</h3><p class="acct-small">Everyone who has signed in with Google since this list began, newest first. Approve someone to give them Data Genie and the Data Scientist; click their name in the list above to change it.</p>
      <ul class="acct-notes acct-people">${ppl.length ? ppl.map(p => `<li><div class="acct-user"><span>${esc(p.name ? p.name + ' · ' : '')}${esc(p.email)}</span><small>Last ${esc(when(p.last))} · first ${esc(when(p.first))} · ${p.days || 1} day${(p.days || 1) === 1 ? '' : 's'}</small></div>${p.owner ? '<b class="acct-tag">owner</b>' : p.approved ? '<b class="acct-tag ok">approved</b>' : `<button type="button" class="btn small" data-approve="${esc(p.email)}">Approve</button>`}</li>`).join('') : '<li class="acct-empty">Nobody yet.</li>'}</ul>
      ${ppl.length ? '<div class="acct-row"><button type="button" class="btn" data-csv>Download the list (CSV)</button></div>' : ''}`;
  }
  const money = v => v == null ? 'no limit' : '$' + Number(v).toFixed(2);
  function aiSection() {
    if (!gw || !fbConfig) return '';
    if (!user) return '<h3>AI tools</h3><p class="acct-small">Approved people can use Data Genie and the Data Scientist by signing in, with no passcode.</p>';
    if (!ai) return '<h3>AI tools</h3><p class="acct-small">Checking your access…</p>';
    if (!ai.allowed) return `<h3>AI tools</h3><p class="acct-small">${esc(ai.message || 'Your email is not approved for the AI tools yet.')} The passcode still works.</p>`;
    const names = { genie: 'Data Genie and the Data Scientist', election: 'Election Analytics', business: 'the Business Economist' };
    const mine = (ai.tools || []).map(t => names[t]).filter(Boolean);
    let out = `<h3>AI tools</h3><p class="acct-small">On for ${esc(ai.email)}: ${esc(mine.join(', ').replace(/, ([^,]*)$/, ' and $1'))} need${mine.length === 1 && !mine[0].includes(' and ') ? 's' : ''} no passcode. ${ai.owner ? 'As the owner you have no daily limit' : `Daily limit ${money(ai.limit_usd)}`}; used today ${money(ai.spent_usd)}.</p>`;
    if (ai.owner) {
      const users = (admin && admin.users) || [];
      out += `<h3>Manage access</h3><p class="acct-small">People who can use the AI tools by signing in with Google. A blank limit means the default (${money(admin && admin.default_limit_usd)} a day); removing someone stops them at once.</p>
        <ul class="acct-notes">${admin && admin.error ? `<li class="acct-empty">${esc(admin.error)}</li>` : users.length ? users.map(u => `<li><button type="button" class="acct-user" data-edit="${esc(u.email)}" title="Change this person's tools or limit"><span>${esc(u.email)}</span><small>${esc((u.tools || ['genie']).map(t => ({ genie: 'Genie & Scientist', election: 'Elections', business: 'Business' })[t]).join(' · '))} · ${u.limit_usd == null ? 'default limit' : money(u.limit_usd) + ' a day'} · ${money(u.spent_usd)} today</small></button><button type="button" data-revoke="${esc(u.email)}" aria-label="Remove ${esc(u.email)}">×</button></li>`).join('') : '<li class="acct-empty">Nobody else yet.</li>'}</ul>
        <div class="acct-row"><input type="email" data-grant maxlength="200" placeholder="name@gmail.com" aria-label="Email to approve"><input type="number" data-grant-limit min="0" max="1000" step="1" placeholder="$/day" aria-label="Daily limit in dollars" style="max-width:90px"></div>
        <div class="acct-row acct-tools"><label><input type="checkbox" data-tool="genie" checked> Data Genie &amp; Data Scientist</label><label><input type="checkbox" data-tool="election"> Election Analytics</label><label><input type="checkbox" data-tool="business"> Business Economist</label></div>
        <div class="acct-row"><button type="button" class="btn" data-grant-add>Approve</button><span class="acct-small">Click a name above to change it.</span></div>` + trafficSection() + peopleSection();
    }
    return out;
  }
  function lockButtons() {           // the passcode screens also offer signing in
    if (!gw || !fbConfig) return;
    const locks = [...document.querySelectorAll('.web-lock')];
    for (const id of ['#ea-unlock', '#iv-unlock']) { const f = document.querySelector(id); if (f && f.parentElement) locks.push(f.parentElement); }
    locks.forEach(l => {
      if (l.querySelector('.acct-lock')) return;
      const p = document.createElement('p'); p.className = 'acct-lock';
      p.innerHTML = user && ai && !ai.allowed
        ? `Signed in as ${esc(user.email)}, which is not approved yet: ask the developer to add it.`
        : 'Or <button type="button" class="btn">sign in with Google</button> if the developer has approved your email.';
      p.querySelector('button')?.addEventListener('click', () => signInGoogle());
      l.appendChild(p);
    });
  }

  // ---------------------------------------------------------------- Google sign-in (Firebase), only when configured
  let fbConfig = null;
  const script = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error('could not load ' + src)); document.head.appendChild(s); });
  async function firebaseUp() {
    if (fb) return fb;
    if (!window.firebase) {
      await script(SDK + 'firebase-app-compat.js');
      await Promise.all([script(SDK + 'firebase-auth-compat.js'), script(SDK + 'firebase-firestore-compat.js')]);
    }
    const { googleClientId, googleRedirect, ...cfg } = fbConfig;
    fb = window.firebase; fb.initializeApp(cfg); db = fb.firestore();
    if (pendingToken) { const t = pendingToken; pendingToken = null; useToken(t); }
    if (googleClientId) gisUp(googleClientId).catch(() => {});
    // back from Google's sign-in page: say what happened if it did not work (the signed-in account arrives below)
    let back = false;
    try { back = !!sessionStorage.getItem('cdd-redirecting'); sessionStorage.removeItem('cdd-redirecting'); } catch (x) { /* ignore */ }
    fb.auth().getRedirectResult().then(r => { if (back && !(r && r.user)) flash('Google sign-in came back without an account. Press Continue with Google again; if it keeps happening, allow pop-ups for calgaryinsight.ca.'); })
      .catch(e => flash('Sign-in did not work: ' + (e.message || e)));
    fb.auth().onAuthStateChanged(async u => {
      user = u || null;
      try { user ? localStorage.setItem('cdd-signed-in', '1') : localStorage.removeItem('cdd-signed-in'); } catch (e) { /* ignore */ }
      if (user) await pullCloud();
      sideButton(); renderAccount(); renderChats();
      document.querySelectorAll('.acct-lock').forEach(x => x.remove());
      if (user) aiAccess(); else { ai = null; admin = null; lockButtons(); }
    });
    return fb;
  }
  // The Google window must open straight from the click: a browser blocks a window opened after a wait (loading the
  // sign-in code), and the old fall-back, a full-page redirect, comes back signed out in today's browsers because the
  // sign-in runs on another domain (firebaseapp.com). So the code is loaded ahead, and the window opens at once.
  // Google Identity Services: Google's sign-in window hands the account straight back to calgaryinsight.ca, and
  // Firebase signs in with it. (Firebase's own window hands it over through calgary-insight.firebaseapp.com, which
  // browsers now keep apart from this site, so the account never arrived: back to the screen, signed out.)
  let gis = null;
  function gisUp(clientId) {
    if (gis) return Promise.resolve(gis);
    const go = () => {
      gis = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId, scope: 'openid email profile',
        callback: async r => {
          if (!r || r.error || !r.access_token) { flash('Google sign-in did not finish' + (r && r.error ? ': ' + (r.error_description || r.error) : '.')); return; }
          flash('Signing you in…');
          try { await fb.auth().signInWithCredential(fb.auth.GoogleAuthProvider.credential(null, r.access_token)); flash('Signed in.'); }
          catch (e) { flash('Sign-in did not work (' + (e.code || 'error') + '): ' + (e.message || e)); }
        },
        error_callback: e => { if (e && e.type !== 'popup_closed') flash(e.type === 'popup_failed_to_open' ? 'Your browser blocked the Google sign-in window. Allow pop-ups for calgaryinsight.ca and try again.' : 'Google sign-in did not finish.'); },
      });
      return gis;
    };
    if (window.google && window.google.accounts && window.google.accounts.oauth2) return Promise.resolve(go());
    return script('https://accounts.google.com/gsi/client').then(go);
  }
  // Whole-page sign-in: off to Google and straight back to this page with the account in the address (#access_token),
  // which works in every phone browser. Switched on when the site's own address is a registered return address
  // (settings: firebase.googleRedirect); otherwise Google's sign-in window is used.
  const OAUTH_KEY = 'cdd-oauth-state';
  function redirectSignIn(clientId) {
    const state = Math.random().toString(36).slice(2) + Date.now().toString(36);
    try { sessionStorage.setItem(OAUTH_KEY, JSON.stringify({ state, back: location.pathname + location.search })); } catch (e) { /* ignore */ }
    const q = new URLSearchParams({ client_id: clientId, redirect_uri: location.origin + '/', response_type: 'token', scope: 'openid email profile',
      state, prompt: 'select_account', include_granted_scopes: 'true' });
    location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + q;
  }
  let pendingToken = null;
  (function backFromGoogle() {
    if (!/access_token=|error=/.test(location.hash)) return;
    const h = new URLSearchParams(location.hash.slice(1));
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(OAUTH_KEY) || 'null'); sessionStorage.removeItem(OAUTH_KEY); } catch (e) { /* ignore */ }
    if (!saved || saved.state !== h.get('state')) return;
    history.replaceState(null, '', saved.back || '/');
    if (h.get('access_token')) pendingToken = h.get('access_token');
    else setTimeout(() => flash('Google sign-in did not finish: ' + (h.get('error_description') || h.get('error'))), 500);
  })();
  async function useToken(token) {
    flash('Signing you in…');
    try { await fb.auth().signInWithCredential(fb.auth.GoogleAuthProvider.credential(null, token)); flash('Signed in.'); }
    catch (e) { flash('Sign-in did not work (' + (e.code || 'error') + '): ' + (e.message || e)); }
  }
  function signInGoogle() {
    if (fbConfig && fbConfig.googleClientId && fbConfig.googleRedirect) { redirectSignIn(fbConfig.googleClientId); return; }
    if (fb && gis) { gis.requestAccessToken({ prompt: 'select_account' }); return; }   // straight from the click
    if (fb && fbConfig && fbConfig.googleClientId) {
      flash('Getting Google sign-in ready…');
      gisUp(fbConfig.googleClientId).then(() => flash('Ready: press Continue with Google again.')).catch(e => flash('Google sign-in could not load: ' + (e.message || e)));
      return;
    }
    if (!fb) {
      flash('Getting Google sign-in ready…');
      firebaseUp().then(() => flash('Ready: press Continue with Google again.')).catch(e => flash('Google sign-in could not load: ' + (e.message || e)));
      return;
    }
    const p = new fb.auth.GoogleAuthProvider();
    p.setCustomParameters({ prompt: 'select_account' });
    fb.auth().signInWithPopup(p).catch(e => {
      const c = (e && e.code) || '';
      if (/popup-closed|cancelled-popup/.test(c)) return;
      // no window (blocked, or a phone or app view that cannot open one): the whole page goes to Google and back;
      // the sign-in code now starts on every visit, so the result is picked up when the page comes back
      if (/popup-blocked|operation-not-supported|web-storage-unsupported/.test(c)) {
        try { sessionStorage.setItem('cdd-redirecting', '1'); } catch (x) { /* ignore */ }
        flash('Opening Google sign-in…');
        fb.auth().signInWithRedirect(p).catch(x => flash('Sign-in did not work: ' + (x.message || x)));
        return;
      }
      flash(/unauthorized-domain/.test(c) ? 'Google sign-in is not switched on for this address yet (Firebase: Authentication, Settings, Authorized domains).'
        : 'Sign-in did not work: ' + (e.message || e));
    });
  }
  async function pullCloud() {          // the account's memory, joined with this browser's (newest copy of each chat wins)
    try {
      const ref = db.collection('users').doc(user.uid);
      const [doc, chats, research] = await Promise.all([ref.get(), ref.collection('chats').orderBy('updated', 'desc').limit(MAX_CHATS).get(),
        ref.collection('research').limit(MAX_RESEARCH).get().catch(() => null)]);
      const d = doc.exists ? doc.data() : {};
      const notes = [...(d.notes || [])];
      for (const n of mem.notes) if (!notes.some(x => x.text.toLowerCase() === n.text.toLowerCase())) notes.push(n);
      const byId = new Map();
      chats.forEach(c => { const x = c.data(); byId.set(c.id, { ...x, _synced: x.updated }); });
      for (const c of mem.chats) if (!byId.has(c.id) || (byId.get(c.id).updated || '') < (c.updated || '')) byId.set(c.id, c);
      const rs = new Map((mem.research || []).map(r => [r.id, r]));
      if (research) research.forEach(r => { if (!rs.has(r.id)) rs.set(r.id, r.data()); });
      mem = { on: d.on === undefined ? mem.on : d.on, notes, chats: [...byId.values()],
              research: [...rs.values()].sort((a, b) => String(b.made || '').localeCompare(String(a.made || ''))) };
      save(true);
    } catch (e) { flash('Your account\'s memory could not be read just now; this browser\'s is used.'); }
  }
  async function pushCloud() {
    if (!user || !db) return;
    try {
      const ref = db.collection('users').doc(user.uid);
      await ref.set({ notes: mem.notes, on: mem.on, updated: now() });
      const changed = mem.chats.filter(c => !c._synced || c._synced < c.updated);
      await Promise.all(changed.map(c => ref.collection('chats').doc(c.id).set({ id: c.id, title: c.title, turns: c.turns, created: c.created || c.updated, updated: c.updated })
        .then(() => { c._synced = c.updated; })));
      try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* ignore */ }
    } catch (e) { /* offline: tried again with the next change */ }
  }

  // ---------------------------------------------------------------- the button in the side bar
  function sideButton() {
    const foot = document.querySelector('.side-foot');
    if (!foot) return;
    let b = $('#acct-btn');
    if (!b) {
      b = document.createElement('button');
      b.id = 'acct-btn'; b.type = 'button'; b.className = 'theme-btn acct-side';
      b.addEventListener('click', openAccount);
      foot.insertBefore(b, foot.firstChild);
    }
    b.innerHTML = user
      ? `${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : '<svg class="ic" aria-hidden="true"><use href="#i-users"/></svg>'}<span>${esc((user.displayName || 'Account').split(' ')[0])}</span>`
      : `<svg class="ic" aria-hidden="true"><use href="#i-users"/></svg><span>${fbConfig ? 'Sign in' : 'Memory'}</span>`;
    lockButtons();
    b.title = user ? 'Your account and Data Genie\'s memory' : (fbConfig ? 'Sign in (optional) and Data Genie\'s memory' : 'Data Genie\'s memory');
  }

  (async () => {
    try { const st = (await W.getJSON('settings.json')) || {}; fbConfig = st.firebase || null; gw = String(st.ai_gateway || '').replace(/\/+$/, ''); } catch (e) { fbConfig = null; }
    chatsButton(); sideButton(); lockButtons();
    if (fbConfig) {                        // a returning visitor who signed in before is signed in again quietly
      let back = false;
      try { back = !!localStorage.getItem('cdd-signed-in'); } catch (e) { /* ignore */ }
      if (back || pendingToken) firebaseUp().catch(() => {});
      else {                               // everyone else: the sign-in code loads once the page is idle, so the button works at once
        const later = () => firebaseUp().catch(() => {});
        if ('requestIdleCallback' in window) requestIdleCallback(later, { timeout: 4000 }); else setTimeout(later, 2500);
      }
    }
  })();
})();
