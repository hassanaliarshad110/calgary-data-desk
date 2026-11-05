// Calgary News: daily articles about Calgary, each written from the reports it cites. Read live from the published
// editions (the repository's news branch), so a new edition appears as soon as it is published.
let CN = null, cnTopic = '', cnQ = '', cnOpen = null, cnDay = '';
const CN_DAY = d => (typeof dmy === 'function' ? dmy(d) : d) || '';
const CN_LONG = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return d; } };

async function loadCityNews(force) {
  if (CN && !force) return CN;
  try { const r = await (await api()).get_city_news(); if (r && r.ok && r.data) CN = r.data; else CN = { error: (r && r.error) || 'not read' }; }
  catch (e) { CN = { error: String(e) }; }
  return CN;
}
// body text with [n] markers turned into links to the article's sources
function cnBody(a) {
  return (a.body || []).map(p => `<p>${esc(p).replace(/\[(\d+)\]/g, (m, n) => { const s = (a.sources || [])[+n - 1]; return s ? `<a class="cn-cite" href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.outlet + ': ' + s.title)}">[${n}]</a>` : m; })}</p>`).join('');
}
function cnSources(a) {
  return `<ol class="cn-sources">${(a.sources || []).map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a><span>${esc(s.outlet)}${s.published ? ` · ${esc(CN_DAY(s.published))}` : ''}</span></li>`).join('')}</ol>`;
}
const cnOutlets = a => [...new Set((a.sources || []).map(s => s.outlet.replace(/ \(.*\)$/, '')))];
const CN_SECTIONS = ['City Hall', 'Public safety', 'Transit and roads', 'Housing and development', 'Business and economy', 'Community and events', 'Environment and weather', 'Alberta and Canada'];
const CN_TINT = { 'City Hall': '#0369A1', 'Public safety': '#B91C1C', 'Transit and roads': '#7C3AED', 'Housing and development': '#B45309', 'Business and economy': '#047857', 'Community and events': '#DB2777', 'Environment and weather': '#0F766E', 'Alberta and Canada': '#475569' };
const cnCredit = im => `Reference image: ${esc(im.credit)}, <a href="${esc(im.license_url || im.page)}" target="_blank" rel="noopener">${esc(im.license)}</a>, via <a href="${esc(im.page)}" target="_blank" rel="noopener">Wikimedia Commons</a>`;
function cnPic(a, big) {
  const im = a.image, tint = CN_TINT[a.section] || '#334155';
  if (im && im.url) return `<figure class="cn-pic${big ? ' big' : ''}"><img src="${esc(im.url)}" alt="${esc(im.alt || a.image_query || '')}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('figure').classList.add('noimg')"><span class="cn-pic-sec" style="background:${tint}">${esc(a.section || '')}</span></figure>`;
  return `<figure class="cn-pic noimg${big ? ' big' : ''}" style="--tint:${tint}"><span class="cn-pic-sec" style="background:${tint}">${esc(a.section || '')}</span></figure>`;
}
function cnCard(a, lead) {
  return `<article class="cn-card${lead ? ' cn-lead' : ''}" data-cn="${esc(a.id)}" tabindex="0" role="button" aria-label="Read: ${esc(a.title)}">
    ${cnPic(a, lead)}<div class="cn-card-t"><div class="cn-topics">${(a.topics || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
    <h3>${esc(a.title)}</h3><p class="cn-dek">${esc(a.dek)}</p>
    <div class="cn-meta">${esc(CN_DAY(a.date))} · ${(a.sources || []).length} source${(a.sources || []).length === 1 ? '' : 's'}: ${esc(cnOutlets(a).slice(0, 3).join(', '))}${cnOutlets(a).length > 3 ? '…' : ''}</div></div></article>`;
}
function cnArticle(a) {
  return `<section class="card span-12 cn-reader"><button type="button" class="link-btn small" id="cn-back">← All stories</button>
    <div class="cn-topics">${(a.topics || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
    <h2 class="cn-title">${esc(a.title)}</h2><p class="cn-dek big">${esc(a.dek)}</p>
    ${a.image && a.image.url ? `<figure class="cn-hero"><img src="${esc(a.image.url)}" alt="${esc(a.image.alt || '')}" referrerpolicy="no-referrer"><figcaption>${cnCredit(a.image)}. It shows the subject, not the event itself.</figcaption></figure>` : ''}
    <div class="cn-meta">${esc(a.section || '')} · Calgary Data Desk · ${esc(CN_LONG(a.date))} · written from ${(a.sources || []).length} source${(a.sources || []).length === 1 ? '' : 's'}</div>
    ${(a.key_facts || []).length ? `<ul class="cn-facts">${a.key_facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
    <div class="cn-text">${cnBody(a)}</div>
    ${a.location ? `<h3 class="cn-h3">Where</h3><div class="cn-map" id="cn-map"></div><p class="card-note">${esc(a.location.label)}</p>` : ''}
    <h3 class="cn-h3">Sources</h3>${cnSources(a)}
    <p class="card-note">Each statement is marked with the source it comes from; follow the link to read the original report. This article summarises those reports in its own words and adds no opinion.</p></section>`;
}

async function renderCityNews() {
  const body = $('#cn-body'); if (!body) return;
  if (!CN) body.innerHTML = '<section class="card span-12"><p class="muted">Reading today\'s Calgary News…</p></section>';
  await loadCityNews();
  if (!CN || CN.error) { body.innerHTML = `<section class="card span-12"><p>Calgary News could not be read just now. ${esc((CN || {}).error || '')}</p></section>`; return; }
  const all = CN.articles || [];
  const art = cnOpen && all.find(a => a.id === cnOpen);
  if (art) {
    body.innerHTML = cnArticle(art); $('#cn-back').addEventListener('click', () => { cnOpen = null; renderCityNews(); }); window.scrollTo(0, 0);
    if (art.location && window.L && $('#cn-map')) {
      try { const m = L.map('cn-map', { scrollWheelZoom: false }).setView([+art.location.lat, +art.location.lon], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap contributors' }).addTo(m);
        L.marker([+art.location.lat, +art.location.lon]).addTo(m).bindPopup(esc(art.location.label)); } catch (e) { /* map optional */ }
    }
    return;
  }
  const dates = [...new Set(all.map(a => a.date))].sort().reverse();
  const topics = [...new Set(all.flatMap(a => a.topics || []))].sort();
  const q = cnQ.trim().toLowerCase();
  let list = all.filter(a => (!cnDay || a.date === cnDay) && (!cnTopic || (a.topics || []).includes(cnTopic))
    && (!q || [a.title, a.dek, ...(a.body || []), ...(a.sources || []).map(s => s.outlet + ' ' + s.title)].join(' ').toLowerCase().includes(q)));
  const today = dates[0], filtered = cnTopic || q || cnDay;
  const todays = filtered ? list : list.filter(a => a.date === today), older = filtered ? [] : list.filter(a => a.date !== today);
  const head = `<section class="cn-mast span-12"><div class="cn-mast-top"><div><div class="el-cr-kicker">Calgary Data Desk</div><h2 class="cn-mast-title">Calgary News</h2>
      <div class="el-cr-sub">${esc(CN_LONG(today))} · new stories every evening at 6 · every article cites its sources</div></div>
      <div class="cn-tools"><input type="search" id="cn-q" placeholder="Search the news" value="${esc(cnQ)}" aria-label="Search Calgary News">
        <select id="cn-day" aria-label="Day"><option value="">Every day</option>${dates.map(d => `<option value="${d}"${d === cnDay ? ' selected' : ''}>${esc(CN_DAY(d))}</option>`).join('')}</select></div></div>
    <div class="cn-chips">${['', ...topics].map(t => `<button type="button" class="chip${t === cnTopic ? ' on' : ''}" data-cntopic="${esc(t)}">${esc(t || 'All topics')}</button>`).join('')}</div></section>`;
  const grid = arts => `<div class="cn-grid">${arts.map(a => cnCard(a, false)).join('')}</div>`;
  const secs = (CN.sections || CN_SECTIONS);
  let page = '';
  if (!list.length) page = '<section class="card span-12"><p class="muted">No stories match.</p></section>';
  else if (filtered) page = `<section class="card span-12"><div class="card-head"><div><h2>${fmt(list.length)} stor${list.length === 1 ? 'y' : 'ies'}</h2></div></div>${grid(list)}</section>`;
  else {
    const lead = todays.find(a => a.image) || todays[0], rest = todays.filter(a => a !== lead);
    page = `<section class="card span-12 cn-front"><div class="cn-leadwrap">${cnCard(lead, true)}</div>
      ${secs.map(sec => { const xs = rest.filter(a => a.section === sec); return xs.length ? `<div class="cn-sec"><h2 class="cn-sec-h" style="--tint:${CN_TINT[sec] || '#334155'}">${esc(sec)}</h2>${grid(xs)}</div>` : ''; }).join('')}
      ${rest.filter(a => !secs.includes(a.section)).length ? `<div class="cn-sec"><h2 class="cn-sec-h">More</h2>${grid(rest.filter(a => !secs.includes(a.section)))}</div>` : ''}</section>
      ${older.length ? `<section class="card span-12"><div class="card-head"><div><h2>Earlier</h2><p class="card-sub">The last ${fmt(CN.keep_days || 60)} days</p></div></div>${grid(older)}</section>` : ''}`;
  }
  body.innerHTML = head + page
    + `<section class="card span-12"><p class="card-note">Pictures are reference images of the place or subject from Wikimedia Commons, credited under each story; they are not photos of the events. Each evening the day's Calgary stories are found in published reports (City of Calgary, news outlets, governments), written up in plain words, and checked against their sources; every statement is marked with the source it comes from. Facts only: no opinion and nothing recommended. Data Genie and the Data Scientist can read these articles. <button type="button" class="link-btn small" data-method="citynews">How the news is made</button></p></section>`;
  const open = el => { cnOpen = el.dataset.cn; renderCityNews(); };
  body.querySelectorAll('[data-cn]').forEach(el => { el.addEventListener('click', () => open(el)); el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); } }); });
  body.querySelectorAll('[data-cntopic]').forEach(b => b.addEventListener('click', () => { cnTopic = b.dataset.cntopic; renderCityNews(); }));
  $('#cn-day').addEventListener('change', e => { cnDay = e.target.value; renderCityNews(); });
  const qi = $('#cn-q'); let t;
  qi.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { cnQ = qi.value; const pos = qi.selectionStart; renderCityNews().then(() => { const n = $('#cn-q'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }); }, 250); });
}
window.renderCityNews = renderCityNews;
