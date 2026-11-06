// Calgary Data Desk on the web: stands in for the desktop app's Python bridge (window.pywebview.api).
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
