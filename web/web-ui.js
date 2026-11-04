// Calgary Data Desk on the web: wording for a browser instead of a desktop app, the daily refresh time, and the
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

  // when the data was refreshed, and whose it is
  const foot = document.createElement('div');
  foot.className = 'web-foot';
  foot.innerHTML = 'Refreshed every morning from public data. Not affiliated with The City of Calgary.';
  const side = $('.side-foot');
  if (side) side.appendChild(foot);
  window.CDD_WEB.getJSON('built.json').then(b => {
    const bad = (b.steps || []).filter(s => !s.ok).length;
    foot.innerHTML = `Data refreshed ${esc(b.built_at)} (Calgary time)${bad ? `, ${bad} source${bad > 1 ? 's' : ''} not reached` : ''}. From public data; not affiliated with The City of Calgary.`;
  }).catch(() => {});


  // traffic cameras: the website shows each camera's latest image (the desktop app also keeps 30 minutes to replay)
  const camWords = el => {
    if (!el) return;
    const fix = () => {
      const t = el.textContent, n = t.replace(/Each plays its images from the last 30 minutes on a loop; the City adds a new image about once a minute\./,
        'Each shows the City\'s latest image, refreshed every minute here. The desktop app also replays the last 30 minutes.')
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

  // the newsletter is made by the desktop app
  const news = $('#view-news .content');
  if (news) {
    news.insertAdjacentHTML('beforebegin', '<div class="content"><p class="web-note"><b>The newsletter is made in the desktop app.</b> On the website, every figure it uses is on the dashboard, Compare wards and the topic screens.</p></div>');
    news.hidden = true;
    const saved = $('#view-news [data-goto="files"]');
    if (saved) saved.hidden = true;
  }

  // Data Genie and Data Scientist: locked until the access code is given (web-ai.js does the rest)
  const LOCKED = ['#view-ask', '#view-scientist'];
  const html = (name, sel) => `<div class="web-lock"><h2>${name} needs the access code</h2>
    <p>${name} runs on an AI language model linked to the website owner's personal API key, so it is open to people with an access code. Enter the access code you were given. It is kept in this browser until you close it.</p>
    <form><label class="sr-only" for="code-${sel.slice(6)}">Access code</label><input type="password" id="code-${sel.slice(6)}" autocomplete="off" placeholder="Access code">
    <button type="submit" class="btn primary">Unlock</button></form><p class="web-lock-msg" role="status"></p></div>`;
  window.CDD_LOCK = {
    lock() {
      LOCKED.forEach(sel => {
        const v = $(sel);
        if (!v || v.querySelector('.web-lock')) return;
        v.classList.add('web-locked');
        const name = sel === '#view-ask' ? 'Data Genie' : 'Data Scientist';
        const top = v.querySelector(':scope > .topbar');
        top ? top.insertAdjacentHTML('afterend', html(name, sel)) : v.insertAdjacentHTML('afterbegin', html(name, sel));
        v.querySelector('.web-lock form').addEventListener('submit', async e => {
          e.preventDefault();
          const msg = v.querySelector('.web-lock-msg');
          msg.textContent = 'Checking';
          try {
            if (!window.CDD_AI) throw new Error('Data Genie is not switched on for this website yet.');
            await window.CDD_AI.unlock(e.target.querySelector('input').value);
            window.CDD_LOCK.open();
          } catch (err) { msg.textContent = String(err.message || err); }
        });
      });
    },
    open() {
      LOCKED.forEach(sel => { const v = $(sel); if (!v) return; v.classList.remove('web-locked'); const l = v.querySelector('.web-lock'); if (l) l.remove(); });
      document.dispatchEvent(new CustomEvent('cdd-unlocked'));
    },
  };
  if (window.CDD_AI && window.CDD_AI.unlocked && window.CDD_AI.unlocked()) window.CDD_LOCK.open(); else window.CDD_LOCK.lock();
})();
