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
  api.read_file = async (p) => { if (!worker) return null; await booting; return call('read', { path: p }); };   // a report's file, to keep with the account
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
    const cloud = /^cloud:/.test(p);                     // a report kept with the visitor's account (web-account.js)
    if (!cloud && !String(p || '').startsWith('/home/pyodide/')) return openPath(p);
    if (!cloud && !worker) return false;
    // a web page (a report): opened at once, from the click, on the website's own report page, then filled in
    const isHtml = /\.html?$/i.test(p);
    const win = isHtml ? window.open('report-view.html' + (print ? '#print' : ''), '_blank') : null;
    try {
      const data = cloud ? await window.CDD_REPORTS.fetch(p) : await call('read', { path: p });
      const name = cloud ? decodeURIComponent(String(p).split('/').slice(2).join('/')) : String(p).split('/').pop();
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
