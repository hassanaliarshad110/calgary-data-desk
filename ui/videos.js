/* Calgary Data Desk: Video Explainers, sorted by topic and area so the page stays easy to use as videos are added.
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
