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
    // the index is built in a local list and published only when every entry is ready: typing while the news is still
    // being fetched used to reach entries whose search words were not prepared yet
    loading = (async () => {
      let idx = null, list = [];
      try { idx = window.CDD_WEB && window.CDD_WEB.getJSON ? await window.CDD_WEB.getJSON('search.json') : await (await fetch('data/search.json')).json(); } catch (e) { idx = null; }
      try { list = ((idx && idx.rows) || fromPage()).slice(); } catch (e) { list = []; }
      try {                                               // the day's headlines, from the news already loaded or fetched now
        let cn = typeof CN !== 'undefined' ? CN : null;
        if (!cn && typeof api === 'function') { const r = await (await api()).get_city_news(); cn = r && r.ok ? r.data : null; }
        ((cn && cn.articles) || []).forEach(a => list.push({ k: 'news', t: a.title, s: `${a.date || ''} · ${a.section || 'Calgary News'}`, v: 'citynews', id: a.id, w: (a.topics || []).join(' ') }));
      } catch (e) { /* no news today */ }
      list.forEach(r => { r._t = norm(r.t); r._s = norm(r.s); r._w = norm(r.w); });
      rows = list;
      return rows;
    })();
    loading.catch(() => { loading = null; });           // a failed load is tried again on the next keystroke
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
    if (!rows) return;
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
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(async () => { try { await load(); } catch (e) { return; } render(input.value.trim()); }, 120); });
  input.addEventListener('focus', () => { box.classList.add('open'); load().catch(() => {}); if (input.value.trim() && rows) render(input.value.trim()); });
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
