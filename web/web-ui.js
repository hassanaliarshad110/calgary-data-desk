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
  foot.innerHTML = 'Refreshed every morning from public data. Not affiliated with The City of Calgary. <a href="wards/">Wards</a> · <a href="communities/">Communities</a> · <a href="game/">Game</a>';
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
    foot.innerHTML = `Data refreshed ${esc(b.built_at)} (Calgary time)${bad ? `, ${bad} source${bad > 1 ? 's' : ''} not reached` : ''}. From public data; not affiliated with The City of Calgary. <a href="wards/">Wards</a> · <a href="communities/">Communities</a> · <a href="game/">Game</a>`;
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

  // ---- the game: its own page (calgaryinsight.ca/game/), linked from the side bar under Visiting Calgary
  const vt = $('.tab-visit');
  if (vt && !$('#web-game-tab')) vt.insertAdjacentHTML('afterend', '<a class="tab" id="web-game-tab" href="game/" title="YYC City Stories: a free game on the real map of Calgary, with four characters and 18 missions that teach City services"><svg class="ic" aria-hidden="true"><use href="#i-play"/></svg><span>Game: YYC City Stories</span></a>');

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
    // the game, right under the finder on the home screen
    head.querySelector('.web-finder').insertAdjacentHTML('afterend', `<a class="web-game-promo" href="game/">
      <img src="game/img/hero.jpg" alt="" width="1600" height="900" loading="lazy">
      <span class="wgp-t"><span class="wgp-k">New · free game</span><b>YYC City Stories</b>
      <span>Play the real map of Calgary as Ali, Natalia, Chris or Jean: 18 missions that teach City services, from the CTrain to recycling.</span></span>
      <span class="wgp-go">Play ▸</span></a>`);
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
