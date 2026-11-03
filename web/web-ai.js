// Data Genie and Data Scientist on the website, behind the access code.
// The owner's Claude key is in data/genie.json, locked (AES-GCM) with a key made from the access code (PBKDF2), so the
// page can use it only after the code is typed. The questions then run the desktop app's own agent in a web worker.
(() => {
  'use strict';
  const W = window.CDD_WEB, api = window.pywebview.api;
  const CODE_KEY = 'cdd-web-code';
  let apiKey = '', worker = null, booting = null, seq = 0;
  const waiting = new Map();
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

  async function decrypt(code) {
    let box;
    try { box = await W.getJSON('genie.json'); } catch (e) { throw new Error('Data Genie is not switched on for this website yet.'); }
    if (!box || !box.ct) throw new Error('Data Genie is not switched on for this website yet.');
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(code || '').trim()), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(box.salt), iterations: box.iter, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    try {
      return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(box.iv) }, key, b64(box.ct)));
    } catch (e) { throw new Error('That access code is not right.'); }
  }

  function call(op, args) {
    return new Promise((resolve, reject) => {
      const id = ++seq;
      waiting.set(id, { resolve, reject });
      worker.postMessage({ id, op, args });
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
          const fn = who === 'scientist' ? window.onAnalystEvent : window.onAgentEvent;
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
    booting = call('boot', { base }).then(() => call('key', { key: apiKey }));
    booting.catch(() => { booting = null; });
    return booting;
  }

  // the dashboard on screen, every ward side by side and the property tax estimate, for the agent's tools
  let sent = '';
  async function context() {
    const m = W.store.get('pop_method', 'model'), w = W.store.get('scope', 0);
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
    if (!apiKey) return { ok: false, error: 'Enter the access code first.' };
    try {
      await start();
      await context();
      return await call(op, args);
    } catch (e) { return { ok: false, error: String(e.message || e) }; }
  }

  window.CDD_AI = {
    unlocked: () => !!apiKey,
    async unlock(code) {
      apiKey = await decrypt(code);
      try { sessionStorage.setItem(CODE_KEY, String(code).trim()); } catch (e) { /* private window */ }
      start().catch(() => {});                              // load the engine while the visitor reads the screen
      return true;
    },
  };

  // the bridge calls that need the engine
  const getSettings = api.get_settings;
  api.get_settings = async () => ({ ...(await getSettings()), has_key: !!apiKey });
  api.ask = (question, mode) => run('ask', { question, mode });
  api.new_chat = async () => (worker ? call('new_chat', {}).catch(() => true) : true);
  api.analyst_run = (key, text) => run('analyst_run', { key, text });
  api.analyst_reports = async () => { if (!worker || !apiKey) return []; try { await booting; return await call('analyst_reports', {}); } catch (e) { return []; } };
  api.analyst_topics = async (n = 6) => {
    let all = [];
    try { all = await W.getJSON('analyst_topics.json'); } catch (e) { return []; }
    const place = (((await api.load_dashboard(false, null, W.store.get('scope', 0))).data || {}).scope || {}).name || 'Ward 5';
    const pool = all.slice().sort(() => Math.random() - 0.5), out = [], per = {};
    for (const t of pool) {
      if ((per[t.area] || 0) >= 2) continue;
      per[t.area] = (per[t.area] || 0) + 1;
      out.push(Object.fromEntries(Object.entries(t).map(([k, v]) => [k, typeof v === 'string' && place !== 'Ward 5' ? v.split('Ward 5').join(place) : v])));
      if (out.length >= n) break;
    }
    return out;
  };
  const openPath = api.open_path;
  api.open_path = async (p) => {
    if (!String(p || '').startsWith('/home/pyodide/')) return openPath(p);
    if (!worker) return false;
    try {
      const data = await call('read', { path: p });
      const name = String(p).split('/').pop();
      const type = /\.pdf$/i.test(name) ? 'application/pdf' : /\.html?$/i.test(name) ? 'text/html' : /\.csv$/i.test(name) ? 'text/csv'
        : /\.xlsx$/i.test(name) ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/octet-stream';
      const url = URL.createObjectURL(new Blob([data], { type }));
      const a = document.createElement('a');
      a.href = url;
      if (!/^(application\/pdf|text\/html)$/.test(type)) a.download = name; else a.target = '_blank';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 120000);
      return true;
    } catch (e) { return false; }
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
  let saved = '';
  try { saved = sessionStorage.getItem(CODE_KEY) || ''; } catch (e) { /* none */ }
  if (saved) decrypt(saved).then(k => { apiKey = k; if (window.CDD_LOCK) window.CDD_LOCK.open(); }).catch(() => {});
})();
