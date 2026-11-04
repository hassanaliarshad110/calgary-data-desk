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
        return { ok: false, period_error: true, error: 'The website shows the last 12 complete months, refreshed every morning. Other periods are in the desktop app.' };
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
    async set_scope(w) { store.set('scope', +w || 0); return +w || 0; },
    async compare_wards() {
      try {
        const m = await okMethod(store.get('pop_method', 'city_actual'));
        const c = await getJSON(`${m}/w0.json`);
        const pick = ['wards_summary', 'period', 'prev_period', 'period_spec', 'built_at', 'scope', 'population', 'stale'];
        return { ok: true, data: Object.fromEntries(pick.map(k => [k, c[k]])), wards_geo: (c.geo || {}).wards, city_geo: (c.geo || {}).city };
      } catch (e) { return fail(e); }
    },
    async missing_persons() {
      try { return await getJSON(`missing/w${store.get('scope', 0)}.json`); }
      catch (e) { return { ok: false, error: String(e.message || e), appeals: [] }; }
    },
    async get_budget() { try { return { ok: true, data: await getJSON('budget.json') }; } catch (e) { return fail(e); } },
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
        theme: store.get('theme', 'system'), map_style: store.get('map_style', 'street'),
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

    // the desktop-only parts
    async cam_watch() { return { ok: true }; },
    async newsletter_make() { return { ok: false, error: 'The newsletter is made in the desktop app.' }; },
    async newsletter_save() { return { ok: false, error: 'The newsletter is made in the desktop app.' }; },
    async ask() { return { ok: false, error: 'Data Genie needs the access code.' }; },
    async new_chat() { return true; },
    async analyst_topics() { return []; },
    async analyst_run() { return { ok: false, error: 'Data Scientist needs the access code.' }; },
    async analyst_reports() { return []; },
  };
  window.CDD_WEB = { store, getJSON, today };
  window.pywebview = { api };
})();
