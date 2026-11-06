/* Calgary Insight: Video Explainers, sorted by topic and area so the page stays easy to use as videos are added.
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

// Sample reports, open to everyone, shown in the passcode-locked tools (Election Analytics, Business Economist),
// each with its explainer video on the Video Explainers page.
const SAMPLE_REPORTS = {
  ea: { title: "Calgary's 26 electoral divisions: a field guide for the 2027 Alberta election", base: 'reports/election-analytics-sample-2027',
    what: 'What a candidate in each electoral division can do in October 2027: the arithmetic of every seat, turnout, the 2026 referendum, social media, awareness and youth engagement, and a preview of all 26 Calgary divisions.', video: 'vid-ea2027' },
  biz: { title: 'Calgary: a hub of innovation, leadership and future growth', base: 'reports/invest-in-calgary-sample',
    what: 'For a new investor: the infrastructure to use, the ease of doing business, the resources available, how Calgary compares with other cities, where the openings are, and the risks.', video: 'vid-invest' },
};
function sampleReport(kind) {
  const r = SAMPLE_REPORTS[kind]; if (!r) return '';
  return `<section class="card span-12 sample-rep"><div class="sample-rep-in"><div><div class="sample-rep-k">Sample report · open to everyone</div><h3>${esc(r.title)}</h3><p>${esc(r.what)}</p></div>
    <div class="file-actions"><a class="btn primary" href="${r.base}.pdf" target="_blank" rel="noopener">PDF</a><a class="btn" href="${r.base}.html" target="_blank" rel="noopener">Interactive report</a><a class="btn" href="${r.base}.xlsx" download>Excel</a><button type="button" class="btn" data-vidgo="${r.video}">▶ Watch the video</button></div></div></section>`;
}
window.sampleReport = sampleReport;
document.addEventListener('click', e => {
  const b = e.target.closest('[data-vidgo]'); if (!b) return;
  show('videos');
  setTimeout(() => { const c = document.getElementById(b.dataset.vidgo); if (c) { c.hidden = false; c.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, 150);
});
