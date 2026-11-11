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
