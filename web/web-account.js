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
    document.body.appendChild(flashEl);
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
           <p class="acct-small">Google tells this site your name, email and picture. Nothing is posted anywhere.</p>`)
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
    q('[data-grant-add]')?.addEventListener('click', async () => {
      const email = q('[data-grant]').value.trim(), lim = q('[data-grant-limit]').value.trim();
      if (!email) return;
      try { await gwFetch('/admin/users', { method: 'POST', body: JSON.stringify({ email, limit_usd: lim === '' ? null : Number(lim) }) }); flash(`${email} can now use the AI tools.`); }
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
      if (window.CDD_AI && window.CDD_AI.useAccount) { await window.CDD_AI.useAccount(j.session, gw); window.CDD_LOCK && window.CDD_LOCK.open(); }
      if (ai.owner) loadAdmin();
    } catch (e) { ai = { allowed: false, message: String(e.message || e) }; }
    renderAccount(); lockButtons();
  }
  async function refreshMe() { if (user && gw && ai && ai.allowed) { try { ai = { ...ai, ...(await gwFetch('/me')) }; renderAccount(); } catch (e) { /* keep the last */ } } }
  async function loadAdmin() { try { admin = await gwFetch('/admin/users'); } catch (e) { admin = { error: String(e.message || e) }; } renderAccount(); }
  const money = v => v == null ? 'no limit' : '$' + Number(v).toFixed(2);
  function aiSection() {
    if (!gw || !fbConfig) return '';
    if (!user) return '<h3>AI tools</h3><p class="acct-small">Approved people can use Data Genie and the Data Scientist by signing in, with no passcode.</p>';
    if (!ai) return '<h3>AI tools</h3><p class="acct-small">Checking your access…</p>';
    if (!ai.allowed) return `<h3>AI tools</h3><p class="acct-small">${esc(ai.message || 'Your email is not approved for the AI tools yet.')} The passcode still works.</p>`;
    let out = `<h3>AI tools</h3><p class="acct-small">On for ${esc(ai.email)}: Data Genie and the Data Scientist need no passcode. ${ai.owner ? 'As the owner you have no daily limit' : `Daily limit ${money(ai.limit_usd)}`}; used today ${money(ai.spent_usd)}.</p>`;
    if (ai.owner) {
      const users = (admin && admin.users) || [];
      out += `<h3>Manage access</h3><p class="acct-small">People who can use the AI tools by signing in with Google. A blank limit means the default (${money(admin && admin.default_limit_usd)} a day); removing someone stops them at once.</p>
        <ul class="acct-notes">${admin && admin.error ? `<li class="acct-empty">${esc(admin.error)}</li>` : users.length ? users.map(u => `<li><span>${esc(u.email)} · ${u.limit_usd == null ? 'default limit' : money(u.limit_usd) + ' a day'} · ${money(u.spent_usd)} today</span><button type="button" data-revoke="${esc(u.email)}" aria-label="Remove ${esc(u.email)}">×</button></li>`).join('') : '<li class="acct-empty">Nobody else yet.</li>'}</ul>
        <div class="acct-row"><input type="email" data-grant maxlength="200" placeholder="name@gmail.com" aria-label="Email to approve"><input type="number" data-grant-limit min="0" max="1000" step="1" placeholder="$/day" aria-label="Daily limit in dollars" style="max-width:90px"><button type="button" class="btn" data-grant-add>Approve</button></div>`;
    }
    return out;
  }
  function lockButtons() {           // the passcode screens also offer signing in
    if (!gw || !fbConfig) return;
    document.querySelectorAll('.web-lock').forEach(l => {
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
    fb = window.firebase; fb.initializeApp(fbConfig); db = fb.firestore();
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
  async function signInGoogle() {
    try {
      await firebaseUp();
      const p = new fb.auth.GoogleAuthProvider();
      await fb.auth().signInWithPopup(p).catch(e => (e && /popup/i.test(e.code || '') ? fb.auth().signInWithRedirect(p) : Promise.reject(e)));
    } catch (e) { flash('Sign-in did not work: ' + (e.message || e)); }
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
      try { if (localStorage.getItem('cdd-signed-in')) firebaseUp().catch(() => {}); } catch (e) { /* ignore */ }
    }
  })();
})();
