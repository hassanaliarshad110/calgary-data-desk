/* Calgary Data Desk: Invest in Calgary. Every business we can find in Calgary (City business licences and
   OpenStreetMap), grouped and searchable; where each kind of business is underserved for the people who live nearby;
   growth and new licences; and the Business Economist (behind its own passcode) that writes business
   plans from all the data on the Data Desk. business.py builds the list; the index is worked out here with the
   residents counted the way chosen in Settings. */
'use strict';

let IV = null, IVP = null, ivSub = 'opps', ivCat = 'grocery', ivRad = 2, ivQ = '', ivFCat = '', ivFComm = '', ivPage = 0, ivMap = null;
let ivBusy = false, ivThread = [], ivOwn = null;
const IV_SUBS = [['opps', 'Opportunities'], ['index', 'Underserved index'], ['list', 'Business directory'], ['growth', 'Growth'], ['economist', 'Business Economist']];
const ivMon = ym => { const [y, m] = String(ym).split('-'); return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m - 1] || m} ${y}`; };
const ivP = (v, d = 0) => isNum(v) ? `${fmt(v * 100, d)}%` : '–';

async function loadInvest() {
  if (IV) return IV;
  try { const r = await (await api()).get_business(); if (r && r.ok && r.data) { IV = r.data; IVP = r.people || null; } } catch (e) { /* shown below */ }
  return IV;
}
function ivCats(local) { return (IV.categories || []).filter(c => !local || c.local); }
function ivLabel(k) { return ((IV.categories || []).find(c => c.key === k) || {}).label || k; }
function ivName(c) { const n = (IV.names || {})[c] || c; return n === n.toUpperCase() ? n.toLowerCase().replace(/(^|[\s\-'/(])([a-z])/g, (m, p, x) => p + x.toUpperCase()) : n; }
// residents of every community, counted the way chosen in Settings
function ivPeople() {
  const out = {};
  if (IVP) Object.entries(IVP).forEach(([c, v]) => { out[c] = Array.isArray(v) ? { now: v[0], c21: v[1] } : { now: v, c21: null }; });
  else ((D && D.communities) || []).forEach(c => { if (isNum(c.residents)) out[c.code] = { now: c.residents, c21: c.census2021 }; });
  return out;
}
function ivKm(a, b) { const R = 6371, t = Math.PI / 180, dLat = (b[1] - a[1]) * t, dLon = (b[0] - a[0]) * t; const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * t) * Math.cos(b[1] * t) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }

// the underserved index for one category: businesses within reach against Calgary's rate for the people within reach
let ivIdxKey = '', ivIdx = null;
function ivIndex(cat, rad) {
  const key = `${cat}/${rad}/${Object.keys(IVP || {}).length}`;
  if (key === ivIdxKey) return ivIdx;
  const P = ivPeople(), C = IV.centres || {}, B = IV.communities || {};
  const codes = Object.keys(C).filter(c => P[c] && P[c].now > 0);
  const totPeople = codes.reduce((a, c) => a + P[c].now, 0);
  const totBiz = Object.values(B).reduce((a, x) => a + ((x.count || {})[cat] || 0), 0);
  const rate = totPeople ? totBiz / totPeople : 0;
  const rows = codes.filter(c => P[c].now >= 500).map(c => {
    let people = 0, biz = 0, grow = 0, c21 = 0;
    Object.keys(C).forEach(j => { if (ivKm(C[c], C[j]) <= rad) { const p = P[j] || {}; people += p.now || 0; if (isNum(p.c21)) { c21 += p.c21; grow += p.now || 0; } biz += (((B[j] || {}).count) || {})[cat] || 0; } });
    const expected = people * rate;
    return { code: c, name: ivName(c), residents: P[c].now, reach: Math.round(people), biz, expected, index: expected ? biz / expected : null, gap: expected - biz,
      growth: c21 ? grow / c21 - 1 : null, here: (((B[c] || {}).count) || {})[cat] || 0, per10k: people ? biz / people * 1e4 : null };
  });
  ivIdxKey = key; ivIdx = { rows, rate, per10k: rate * 1e4, totBiz, totPeople };
  return ivIdx;
}
// the biggest gaps across every neighbourhood category
function ivOpportunities(rad) {
  const out = [];
  ivCats(true).forEach(c => {
    const I = ivIndex(c.key, rad);
    I.rows.filter(r => r.reach >= 15000 && r.index !== null && r.index < 0.6 && r.gap >= 1.5).forEach(r => out.push({ ...r, cat: c.key, label: c.label, city: I.per10k }));
  });
  // one row per community and category; the most people within reach of the fewest businesses first
  return out.sort((a, b) => b.gap - a.gap);
}

function ivTabs() {
  return `<nav class="el-subtabs span-12" aria-label="Invest in Calgary sections">${IV_SUBS.map(([k, t]) => `<button type="button" class="el-subtab${k === ivSub ? ' is-on' : ''}" data-ivsub="${k}" ${k === ivSub ? 'aria-current="page"' : ''}>${esc(t)}${k === 'economist' ? ' <span class="iv-lockmark" aria-label="needs a passcode">🔒</span>' : ''}</button>`).join('')}</nav>`;
}
function ivKpis(list) { return `<div class="el-cr-kpis">${list.map(([l, n, s]) => `<div class="el-kpi"><div class="el-kpi-l">${esc(l)}</div><div class="el-kpi-n">${n}</div><div class="el-hero-sub">${esc(s || '')}</div></div>`).join('')}</div>`; }
function ivCatSelect(id, local, val) {
  const groups = {};
  ivCats(local).forEach(c => { (groups[c.group] = groups[c.group] || []).push(c); });
  return `<select id="${id}" class="select">${Object.entries(groups).map(([g, cs]) => `<optgroup label="${esc(g)}">${cs.map(c => `<option value="${c.key}" ${c.key === val ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</optgroup>`).join('')}</select>`;
}
function ivRadius() { return `<div class="seg small" role="radiogroup" aria-label="Distance">${[1, 2, 3].map(r => `<button type="button" role="radio" aria-checked="${r === ivRad}" data-ivrad="${r}">${r} km</button>`).join('')}</div>`; }

// ---- Opportunities: the main dashboard
function ivOpps() {
  const T = IV.totals || {}, comms = Object.values(IV.communities || {});
  const new12 = comms.reduce((a, x) => a + (x.new12 || 0), 0), prev = comms.reduce((a, x) => a + (x.new_prev || 0), 0);
  const ops = ivOpportunities(ivRad);
  const seen = new Set(), top = ops.filter(o => { const k = o.code + o.cat; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 25);
  const byCat = {};
  ops.forEach(o => { byCat[o.cat] = (byCat[o.cat] || 0) + o.gap; });
  const catRows = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => ({ label: ivLabel(k), v, sub: `${ops.filter(o => o.cat === k).length} communities below 60% of Calgary's rate` }));
  const grow = comms.map(x => ({ c: Object.keys(IV.communities).find(k => IV.communities[k] === x), x })).filter(o => o.x.new12 >= 5).sort((a, b) => b.x.new12 - a.x.new12).slice(0, 12);
  return `<section class="el-cr span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Invest in Calgary</div><h2 class="el-cr-title">Where Calgary needs more business</h2>
      <div class="el-cr-sub">Every business we can find, set against the people who live within ${ivRad} km. Residents are counted the way chosen in Settings.</div></div>${ivRadius()}</div>
    ${ivKpis([['Licensed businesses', fmt(T.licences), 'City of Calgary business licences'], ['Mapped places', fmt(T.osm_places), 'shops, clinics, banks and more on OpenStreetMap'],
      ['New licences, last 12 months', fmt(new12), `${new12 >= prev ? '+' : ''}${prev ? fmt((new12 / prev - 1) * 100, 0) + '%' : '–'} on the 12 months before`], ['Gaps found', fmt(ops.length), 'community and category pairs below 60% of Calgary\'s rate'],
      ['Categories', fmt(ivCats().length), `${ivCats(true).length} serve the neighbourhood`], ['Communities', fmt(Object.keys(IV.communities || {}).length), 'with at least one business']])}</section>
    <section class="card span-12"><div class="card-head"><div><h2>The biggest gaps</h2><p class="card-sub">Communities where people within ${ivRad} km have far fewer of a kind of business than Calgary has per person. "Missing" = how many more it would take to reach Calgary's average.</p></div></div>
      <div class="table-wrap sr-wrap"><table class="data"><thead><tr><th scope="col">Community</th><th scope="col">Business</th><th class="num" scope="col">People within ${ivRad} km</th><th class="num" scope="col">Businesses within ${ivRad} km</th><th class="num" scope="col">At Calgary's rate</th><th class="num" scope="col">Missing</th><th class="num" scope="col">Index</th><th class="num" scope="col">Growth since 2021</th></tr></thead>
      <tbody>${top.map(o => `<tr><th scope="row"><button type="button" class="link-btn" data-ivgo="${o.cat}">${esc(o.name)}</button></th><td>${esc(o.label)}</td><td class="num">${fmt(o.reach)}</td><td class="num">${fmt(o.biz)}</td><td class="num">${fmt(o.expected, 1)}</td><td class="num"><b>${fmt(o.gap, 1)}</b></td><td class="num">${fmt(o.index * 100, 0)}</td><td class="num">${isNum(o.growth) ? (o.growth > 0 ? '+' : '') + fmt(o.growth * 100, 0) + '%' : '–'}</td></tr>`).join('')}</tbody></table></div>
      <p class="card-note">Index: businesses within reach as a share of what Calgary's average per person would give (100 = Calgary's average). A gap is a lead to check, not a guarantee: a big store just outside the radius, zoning, rents and who the customers are all matter. The Business Economist works these through for a specific plan.</p></section>
    <section class="card span-6"><div class="card-head"><div><h2>Kinds of business with the most room</h2><p class="card-sub">Missing businesses added up over every gap</p></div></div>${ecBars(catRows, v => fmt(v, 0))}</section>
    <section class="card span-6"><div class="card-head"><div><h2>Where new businesses are opening</h2><p class="card-sub">New City licences in the last 12 months</p></div></div>${ecBars(grow.map(o => ({ label: ivName(o.c), v: o.x.new12, sub: `${fmt(o.x.new_prev)} the 12 months before` })), v => fmt(v))}</section>`;
}

// ---- Underserved index for one category, with the map
function ivIndexPage() {
  const I = ivIndex(ivCat, ivRad), rows = I.rows.slice().sort((a, b) => b.gap - a.gap);
  return `<section class="card span-12"><div class="card-head"><div><h2>Underserved index: ${esc(ivLabel(ivCat))}</h2><p class="card-sub">Calgary has ${fmt(I.totBiz)}: ${fmt(I.per10k, 1)} for every 10,000 residents. For each community: how many are within ${ivRad} km against that rate for the people within ${ivRad} km.</p></div>
      <div class="card-tools sr-tools"><label class="sr-only" for="iv-cat">Kind of business</label>${ivCatSelect('iv-cat', false, ivCat)}${ivRadius()}</div></div>
    <div id="iv-map" class="iv-map" role="img" aria-label="Map of the underserved index"></div>
    <div class="ec-key"><span><i style="background:#B91C1C"></i>Under half Calgary's rate</span><span><i style="background:#F59E0B"></i>50 to 90</span><span><i style="background:#94A3B8"></i>90 to 110</span><span><i style="background:#047857"></i>Over 110</span><span>Circle size: people within reach</span></div></section>
    <section class="card span-12"><div class="card-head"><div><h2>Every community</h2><p class="card-sub">Most missing first: the most people within reach of the fewest businesses</p></div><div class="card-tools"><button class="btn" id="iv-csv">Download CSV</button></div></div>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Community</th><th class="num" scope="col">Residents</th><th class="num" scope="col">In the community</th><th class="num" scope="col">People within ${ivRad} km</th><th class="num" scope="col">Within ${ivRad} km</th><th class="num" scope="col">Per 10,000</th><th class="num" scope="col">At Calgary's rate</th><th class="num" scope="col">Index</th><th class="num" scope="col">Missing</th></tr></thead>
    <tbody>${rows.map(r => `<tr><th scope="row">${esc(r.name)}</th><td class="num">${fmt(r.residents)}</td><td class="num">${fmt(r.here)}</td><td class="num">${fmt(r.reach)}</td><td class="num">${fmt(r.biz)}</td><td class="num">${fmt(r.per10k, 1)}</td><td class="num">${fmt(r.expected, 1)}</td><td class="num">${isNum(r.index) ? fmt(r.index * 100, 0) : '–'}</td><td class="num">${r.gap > 0 ? fmt(r.gap, 1) : '–'}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function ivDrawMap() {
  const el = $('#iv-map'); if (!el || typeof L === 'undefined') return;
  if (ivMap) { try { ivMap.remove(); } catch (e) { /* gone */ } ivMap = null; }
  try {
    ivMap = L.map(el, { scrollWheelZoom: false }).setView([51.045, -114.06], 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap contributors' }).addTo(ivMap);
    const I = ivIndex(ivCat, ivRad), C = IV.centres || {};
    I.rows.forEach(r => { const c = C[r.code]; if (!c || !isNum(r.index)) return;
      const col = r.index < 0.5 ? '#B91C1C' : r.index < 0.9 ? '#F59E0B' : r.index <= 1.1 ? '#94A3B8' : '#047857';
      L.circleMarker([c[1], c[0]], { radius: Math.max(4, Math.min(16, Math.sqrt(r.reach) / 18)), color: col, fillColor: col, fillOpacity: 0.55, weight: 1 })
        .bindTooltip(`${esc(r.name)}: ${fmt(r.biz)} within ${ivRad} km for ${fmt(r.reach)} people (index ${fmt(r.index * 100, 0)})`).addTo(ivMap); });
  } catch (e) { el.innerHTML = '<p class="card-note">The map could not be drawn here.</p>'; }
}

// ---- Business directory
function ivList() {
  const q = ivQ.trim().toLowerCase(), B = IV.businesses || [];
  const rows = B.filter(r => (!ivFCat || r[1] === ivFCat) && (!ivFComm || r[3] === ivFComm) && (!q || (r[0] || '').toLowerCase().includes(q) || (r[2] || '').toLowerCase().includes(q) || (r[4] || '').toLowerCase().includes(q)));
  const per = 100, pages = Math.max(1, Math.ceil(rows.length / per)); ivPage = Math.min(ivPage, pages - 1);
  const comms = Object.keys(IV.communities || {}).sort((a, b) => ivName(a).localeCompare(ivName(b)));
  const src = { L: 'City licence', H: 'City licence (home-based)', O: 'OpenStreetMap' };
  return `<section class="card span-12"><div class="card-head"><div><h2>Business directory</h2><p class="card-sub">${fmt(B.length)} businesses and places: City of Calgary business licences and OpenStreetMap. ${fmt(rows.length)} match.</p></div>
      <div class="card-tools sr-tools"><label class="sr-only" for="iv-q">Search</label><input id="iv-q" type="search" placeholder="Name, type or address" value="${esc(ivQ)}">
      <label class="sr-only" for="iv-fcat">Category</label><select id="iv-fcat" class="select"><option value="">Every category</option>${ivCats().map(c => `<option value="${c.key}" ${c.key === ivFCat ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select>
      <label class="sr-only" for="iv-fcomm">Community</label><select id="iv-fcomm" class="select"><option value="">Every community</option>${comms.map(c => `<option value="${c}" ${c === ivFComm ? 'selected' : ''}>${esc(ivName(c))}</option>`).join('')}</select>
      <button class="btn" id="iv-listcsv">Download CSV</button></div></div>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Business</th><th scope="col">Category</th><th scope="col">Type</th><th scope="col">Community</th><th scope="col">Address</th><th scope="col">First licensed</th><th scope="col">Source</th></tr></thead>
    <tbody>${rows.slice(ivPage * per, ivPage * per + per).map(r => `<tr><th scope="row">${esc(r[0] || '(no name)')}</th><td>${esc(ivLabel(r[1]))}</td><td class="wrap">${esc(r[2] || '')}</td><td>${esc(ivName(r[3]))}</td><td>${esc(r[4] || '')}</td><td>${esc(r[5] || '')}</td><td>${esc(src[r[9]] || '')}</td></tr>`).join('')}</tbody></table></div>
    <div class="iv-pager"><button class="btn" data-ivpage="-1" ${ivPage ? '' : 'disabled'}>Previous</button><span>Page ${ivPage + 1} of ${pages}</span><button class="btn" data-ivpage="1" ${ivPage < pages - 1 ? '' : 'disabled'}>Next</button></div>
    <p class="card-note">The City licenses only some kinds of business (food, personal services, contractors, vehicle repair, liquor and others); most shops, clinics and offices need none, so they come from OpenStreetMap, mapped by volunteers and not complete. The same business can appear in both.</p></section>`;
}

// ---- Growth
function ivGrowth() {
  const tr = IV.trend || [], groups = [...new Set(tr.flatMap(([, v]) => Object.keys(v)))];
  const years = {};
  tr.forEach(([m, v]) => { const y = m.slice(0, 4); years[y] = years[y] || {}; Object.entries(v).forEach(([g, n]) => { years[y][g] = (years[y][g] || 0) + n; }); });
  const ys = Object.keys(years).sort().slice(-5), last12 = tr.slice(-13, -1), prev12 = tr.slice(-25, -13);
  const sum = (arr, g) => arr.reduce((a, [, v]) => a + (v[g] || 0), 0);
  const gRows = groups.map(g => ({ label: g, v: sum(last12, g), sub: `${fmt(sum(prev12, g))} the 12 months before` })).sort((a, b) => b.v - a.v);
  const months = tr.slice(-24);
  return `<section class="card span-12"><div class="card-head"><div><h2>New business licences, month by month</h2><p class="card-sub">The month each business was first licensed by the City (businesses still licensed today)</p></div></div>
      ${ecBars(months.map(([m, v]) => ({ label: ivMon(m), v: Object.values(v).reduce((a, n) => a + n, 0) })), v => fmt(v))}
      <p class="card-note">A business that closed is no longer in the City's list, so older months count only the businesses that survived: compare recent months with each other, not with years ago.</p></section>
    <section class="card span-6"><div class="card-head"><div><h2>By kind of business, last 12 complete months</h2></div></div>${ecBars(gRows, v => fmt(v))}</section>
    <section class="card span-6"><div class="card-head"><div><h2>By year</h2><p class="card-sub">Still licensed today, by year first licensed</p></div></div>${ecBars(ys.map(y => ({ label: y, v: Object.values(years[y]).reduce((a, n) => a + n, 0) })), v => fmt(v))}</section>`;
}

// ---- Business Economist (its own passcode)
function ivLocked() { return !!(window.CDD_AI && window.CDD_AI.unlocked && !window.CDD_AI.unlocked('biz')); }
function ivContact() {
  const to = (window.CDD_CONTACT || '').trim();
  return `<section class="card span-6 iv-contact"><div class="card-head"><div><h2>Talk to the developer</h2><p class="card-sub">For a passcode, a business plan, or to have your own business data analysed</p></div></div>
    <form id="iv-form" class="iv-form">
      <label>Your name<input name="name" required autocomplete="name"></label>
      <label>Business or idea<input name="business" placeholder="for example: a café in Martindale"></label>
      <label>Email<input name="email" type="email" required autocomplete="email"></label>
      <label>Phone (optional)<input name="phone" type="tel" autocomplete="tel"></label>
      <label>I'm interested in<select name="want"><option>A business plan for a new location</option><option>Analysis of my existing business data</option><option>A passcode for the Business Economist</option><option>Something else</option></select></label>
      <label>Message<textarea name="msg" rows="4"></textarea></label>
      <button class="btn primary" type="submit">${to ? 'Send' : 'Prepare the message'}</button>
      <p class="card-note" id="iv-formmsg" role="status">${to ? 'Opens your email app with the message ready to send. Nothing is sent until you press send there.' : 'The contact address is being set up; your message will be ready to copy.'}</p></form></section>`;
}
function ivEconomist() {
  const locked = ivLocked();
  const msgs = ivThread.map(m => `<div class="ea-msg ${m.who}">${m.who === 'you' ? esc(m.text) : (m.html || esc(m.text || ''))}${m.cards ? `<div class="ea-cards">${m.cards}</div>` : ''}</div>`).join('');
  const pitch = `<section class="el-cr span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Invest in Calgary</div><h2 class="el-cr-title">The Business Economist</h2>
      <div class="el-cr-sub">A business plan built on Calgary's own data: who lives within reach and how fast it is growing, households and incomes, the competition street by street, transit stops nearby, crime and 311 issues, weather through the year, rents and new homes. Every figure sourced; the full plan comes as a PDF, an interactive report and an Excel workbook that can be audited.</div></div></div>
    <div class="iv-offer"><div><b>For a new business</b><span>Where to open, how many customers are within reach, the competition, the numbers to break even, and the risks.</span></div>
      <div><b>For an existing business</b><span>Share your own sales data (it stays in your browser) to find trends, seasons, your best days, and where to grow.</span></div>
      <div><b>For investors</b><span>Which kinds of business Calgary is short of, where, and how fast those areas are growing.</span></div></div></section>`;
  const chat = `<section class="card span-6 ea-chat"><div class="card-head"><div><h2>Ask the Business Economist</h2><p class="card-sub">Business plans, locations, competition and the numbers behind them</p></div></div>
    ${locked ? `<div class="web-lock ea-lock"><h3>The Business Economist needs its passcode</h3><p>Everything else on Invest in Calgary is open to everyone. The Business Economist needs its own passcode. <b>To get a passcode, contact the developer</b> with the form on this page.</p>
      <form id="iv-unlock"><label class="sr-only" for="iv-code">Business Economist passcode</label><input type="password" id="iv-code" autocomplete="off" placeholder="Business Economist passcode"><button type="submit" class="btn primary">Unlock</button></form><p class="web-lock-msg" id="iv-lockmsg" role="status"></p></div>`
      : `<div class="ea-thread" id="iv-thread">${msgs || '<p class="muted">Describe the business and where you are thinking of opening, or ask which kinds of business a community is short of.</p>'}</div>
      <form class="ea-form" id="iv-ask"><textarea id="iv-text" rows="3" placeholder="For example: a halal grocery in northeast Calgary. Where, and what would it take to break even?" aria-label="Question for the Business Economist"></textarea>
        <div class="ea-btns"><button class="btn primary" type="submit" ${ivBusy ? 'disabled' : ''}>${ivBusy ? 'Working…' : 'Ask'}</button><button class="btn" type="button" id="iv-plan" ${ivBusy ? 'disabled' : ''}>Full business plan</button></div></form>`}
    <p class="card-note">General information from public data, not financial, legal or investment advice. Projections are models with stated assumptions and ranges.</p></section>`;
  const own = `<section class="card span-12"><div class="card-head"><div><h2>Your own business data</h2><p class="card-sub">Open a spreadsheet of your sales (CSV with a date and an amount). It is read in your browser and never sent anywhere; only the summary below is shared if you ask the Economist about it.</p></div>
      <div class="card-tools"><label class="btn" for="iv-file">Open a CSV file</label><input type="file" id="iv-file" accept=".csv,text/csv" hidden></div></div>
    <div id="iv-own">${ivOwn ? ivOwnView() : '<p class="muted">No file opened yet.</p>'}</div></section>`;
  return pitch + chat + ivContact() + own;
}

// owner data: read a CSV in the browser and summarise it
function ivParseCsv(text) {
  // a CSV reader for one file: quoted fields may hold commas, quotes ("") and line breaks
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cur.trim()); cur = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur.trim()); cur = ''; if (row.some(x => x)) rows.push(row); row = []; }
    else cur += ch;
  }
  row.push(cur.trim()); if (row.some(x => x)) rows.push(row);
  return rows;
}
// a date as the file writes it: 2025-03-07, 2025/03/07, 03/07/2025 (month first), 7 Mar 2025, with or without a time
function ivDate(v) {
  const t = String(v || '').trim();
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(t);
  if (m) return ivYmd(+m[1], +m[2], +m[3]);
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/.exec(t);
  if (m) return +m[1] > 12 ? ivYmd(+m[3], +m[2], +m[1]) : ivYmd(+m[3], +m[1], +m[2]);
  if (!/[a-z]{3}/i.test(t) || !/\d{4}/.test(t)) return null;     // "7 Mar 2025", "March 7, 2025"
  const d = new Date(t);
  return isNaN(d) ? null : ivYmd(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
function ivYmd(y, mo, d) {
  if (y < 1990 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return { ym: `${y}-${String(mo).padStart(2, '0')}`, dow: new Date(Date.UTC(y, mo - 1, d)).getUTCDay() };
}
function ivNum(v) {
  let t = String(v ?? '').trim(); if (!t) return NaN;
  const neg = /^\(.*\)$/.test(t) || /^-/.test(t.replace(/^[$\s]+/, ''));
  t = t.replace(/[()$€£,\s]|CAD|USD/gi, '').replace(/^-/, '');
  if (!/^\d*\.?\d+$/.test(t)) return NaN;
  return (neg ? -1 : 1) * parseFloat(t);
}
function ivOwnAnalyse(rows) {
  if (!rows || rows.length < 3) return { error: 'The file has too few rows to analyse.' };
  const head = rows[0].map(h => String(h || '').trim()), body = rows.slice(1), probe = body.slice(0, 50);
  const share = (i, f) => probe.filter(r => f(r[i])).length / Math.max(1, probe.length);
  const dateCols = head.map((h, i) => i).filter(i => share(i, v => ivDate(v)) >= 0.8);
  const di = dateCols.find(i => /date|created|time|day|paid|order/i.test(head[i])) ?? dateCols[0];
  const numCols = head.map((h, i) => i).filter(i => i !== di && share(i, v => isFinite(ivNum(v))) >= 0.8);
  const rank = h => /^(total|net sales|net total|gross sales|sales|amount|revenue|total sales)$/i.test(h) ? 0 : /net sales|gross sales|total(?! ?qty)/i.test(h) && !/sub|tax|discount|ship|qty|quantity|count/i.test(h) ? 1
    : /amount|sales|revenue|price|net/i.test(h) && !/tax|discount|ship|qty|quantity/i.test(h) ? 2 : 9;
  const ni = numCols.slice().sort((a, b) => rank(head[a]) - rank(head[b]))[0];
  if (di === undefined || ni === undefined) return { error: 'Could not find a date column and an amount column in this file. It needs one column of dates and one of amounts (sales, totals or revenue).' };
  const ci = head.findIndex((h, i) => i !== di && i !== ni && /item|product|category|service|lineitem|description/i.test(h));
  const byM = {}, byW = [0, 0, 0, 0, 0, 0, 0], byC = {};
  let total = 0, n = 0, skipped = 0;
  body.forEach(r => { const d = ivDate(r[di]), v = ivNum(r[ni]); if (!d || !isFinite(v)) { skipped++; return; }
    byM[d.ym] = (byM[d.ym] || 0) + v; byW[d.dow] += v; total += v; n++;
    if (ci >= 0 && r[ci]) byC[r[ci]] = (byC[r[ci]] || 0) + v; });
  const keys = Object.keys(byM).sort(); if (!keys.length) return { error: 'No row had both a date and an amount.' };
  // every calendar month from the first to the last, months with no sales as 0
  const ms = []; let [y, mo] = keys[0].split('-').map(Number); const [y1, m1] = keys[keys.length - 1].split('-').map(Number);
  while (y < y1 || (y === y1 && mo <= m1)) { ms.push(`${y}-${String(mo).padStart(2, '0')}`); mo++; if (mo > 12) { mo = 1; y++; } }
  const now = new Date(), cur = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const full = ms[ms.length - 1] >= cur ? ms.filter(k => k < cur) : ms;          // this month is not over yet
  const val = k => byM[k] || 0, last = full.slice(-12), prev = full.slice(-24, -12), s = a => a.reduce((x, k) => x + val(k), 0);
  return { cols: [head[di], head[ni], ci >= 0 ? head[ci] : null], n, skipped, total, months: ms.map(k => [k, Math.round(val(k))]), weekday: byW.map(Math.round),
    last12: s(last), prev12: prev.length === 12 ? s(prev) : null, partial: full.length < ms.length, from: ms[0], to: ms[ms.length - 1], best: full.slice().sort((a, b) => val(b) - val(a)).slice(0, 3).map(ivMon),
    top: Object.entries(byC).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => [k, Math.round(v)]) };
}
function ivOwnView() {
  const o = ivOwn;
  if (o.error) return `<p class="err">${esc(o.error)}</p>`;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], m = o.months.slice(-24);
  return `<div class="fb-kpis">${[['Rows read', fmt(o.n), `dates: "${o.cols[0]}", amounts: "${o.cols[1]}"${o.skipped ? `; ${fmt(o.skipped)} rows without both skipped` : ''}`], ['Total', '$' + fmt(o.total), `${o.from} to ${o.to}, ${o.months.length} months`], [o.partial ? 'Last 12 complete months' : 'Last 12 months in the file', '$' + fmt(o.last12), isNum(o.prev12) ? `${o.last12 >= o.prev12 ? '+' : ''}${fmt((o.last12 / o.prev12 - 1) * 100, 1)}% on the 12 before` : ''], ['Best months', esc(o.best.join(', ')), '']].map(([l, n, s]) => `<div class="fb-kpi"><div class="fb-kpi-l">${esc(l)}</div><div class="fb-kpi-n">${n}</div><div class="fb-kpi-s">${esc(s)}</div></div>`).join('')}</div>
    <h3 class="fb-h3">Month by month <small>the last ${m.length} months${o.partial ? '; this month is not over' : ''}</small></h3>${ecBars(m.map(x => ({ label: ivMon(x[0]), v: x[1] })), v => '$' + fmt(v))}
    <div class="ea-two"><div><h3 class="fb-h3">By day of the week</h3>${ecBars(o.weekday.map((v, i) => ({ label: days[i], v })), v => '$' + fmt(v))}</div>
    ${o.top.length ? `<div><h3 class="fb-h3">Top ${esc(o.cols[2])}</h3>${ecBars(o.top.map(([k, v]) => ({ label: k, v })), v => '$' + fmt(v))}</div>` : ''}</div>
    ${ivLocked() ? '' : '<button class="btn primary" id="iv-ownask">Ask the Economist about these trends</button>'}`;
}
function ivOwnSummary() {
  const o = ivOwn; if (!o || o.error) return '';
  return `My business data summary (from my own sales file; ${o.n} rows): monthly ${o.cols[1]} totals ${JSON.stringify(o.months.slice(-24))}; by weekday Sunday..Saturday ${JSON.stringify(o.weekday)}; last 12 months ${Math.round(o.last12)}${isNum(o.prev12) ? `, the 12 before ${Math.round(o.prev12)}` : ''}${o.top.length ? `; top ${o.cols[2]} ${JSON.stringify(o.top)}` : ''}.`;
}

async function ivAsk(q, full) {
  if (ivBusy || !q.trim()) return;
  ivBusy = true;
  const bot = { who: 'bot', text: full ? 'Planning the business plan…' : 'Working on it…' };
  ivThread.push({ who: 'you', text: full ? `Full business plan: ${q}` : q }, bot);
  renderInvest(true);
  const cards = [], done = typeof eaCatch === 'function' ? eaCatch(bot, cards) : () => {};
  try {
    const a = await api();
    const res = full ? await a.business_report(q, isCity() ? 'Calgary' : W()) : await a.ask(`[Business Economist] Area selected: ${isCity() ? 'all of Calgary' : W()}. ${q}`, 'audit');
    if (res && res.ok) { bot.html = (window.DOMPurify && window.marked) ? DOMPurify.sanitize(marked.parse(res.text || '')) : esc(res.text || ''); bot.text = ''; if (res.report && !cards.some(c => c.includes('ea-report')) && typeof eaReportCard === 'function') cards.unshift(eaReportCard(typeof res.report === 'string' ? { pdf: res.report } : res.report)); }
    else bot.text = (res && res.error) || 'The Business Economist could not answer this time.';
  } catch (e) { bot.text = String(e.message || e); }
  bot.cards = cards.join('');
  done();
  ivBusy = false;
  renderInvest(true);
}

async function renderInvest(keep) {
  const body = $('#iv-body'); if (!body) return;
  const y = window.scrollY;
  if (!IV) body.innerHTML = '<section class="card span-12"><p class="muted">Reading the business list…</p></section>';
  await loadInvest();
  if (!IV) { body.innerHTML = '<section class="card span-12"><p>The business list is not on the website yet. It appears after the next refresh.</p></section>'; return; }
  const page = { opps: ivOpps, index: ivIndexPage, list: ivList, growth: ivGrowth, economist: ivEconomist }[ivSub] || ivOpps;
  body.innerHTML = ivTabs() + page() + `<section class="card span-12"><p class="card-note">Sources: ${(IV.sources || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher)}: ${esc(s.title)}</a>`).join('; ')}. Read ${esc((IV.built_at || '').slice(0, 10))}. Residents: ${esc(((D && D.population) || {}).method_label || 'the count chosen in Settings')}. <button type="button" class="link-btn small" data-method="invest">How this is worked out</button></p></section>`;
  const re = () => renderInvest(true);
  body.querySelectorAll('[data-ivsub]').forEach(b => b.addEventListener('click', () => { ivSub = b.dataset.ivsub; renderInvest(); }));
  body.querySelectorAll('[data-ivrad]').forEach(b => b.addEventListener('click', () => { ivRad = +b.dataset.ivrad; re(); }));
  body.querySelectorAll('[data-ivgo]').forEach(b => b.addEventListener('click', () => { ivCat = b.dataset.ivgo; ivSub = 'index'; renderInvest(); }));
  body.querySelectorAll('[data-ivpage]').forEach(b => b.addEventListener('click', () => { ivPage += +b.dataset.ivpage; re(); }));
  const cs = $('#iv-cat'); if (cs) cs.addEventListener('change', () => { ivCat = cs.value; re(); });
  const fc = $('#iv-fcat'); if (fc) fc.addEventListener('change', () => { ivFCat = fc.value; ivPage = 0; re(); });
  const fm = $('#iv-fcomm'); if (fm) fm.addEventListener('change', () => { ivFComm = fm.value; ivPage = 0; re(); });
  const iq = $('#iv-q'); if (iq) { let t; iq.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { ivQ = iq.value; ivPage = 0; const p = iq.selectionStart; renderInvest(true).then(() => { const n = $('#iv-q'); if (n) { n.focus(); n.setSelectionRange(p, p); } }); }, 300); }); }
  const csv1 = $('#iv-csv'); if (csv1) csv1.addEventListener('click', async () => { const I = ivIndex(ivCat, ivRad); await (await api()).save_csv(`Underserved index - ${ivLabel(ivCat)} - ${ivRad} km`, ['Community', 'Residents', 'In the community', `People within ${ivRad} km`, `Within ${ivRad} km`, 'Per 10,000', "At Calgary's rate", 'Index', 'Missing'], I.rows.map(r => [r.name, r.residents, r.here, r.reach, r.biz, r.per10k && +r.per10k.toFixed(2), +r.expected.toFixed(2), r.index && +(r.index * 100).toFixed(0), +r.gap.toFixed(2)])); });
  const csv2 = $('#iv-listcsv'); if (csv2) csv2.addEventListener('click', async () => { const q = ivQ.trim().toLowerCase(); const rows = (IV.businesses || []).filter(r => (!ivFCat || r[1] === ivFCat) && (!ivFComm || r[3] === ivFComm) && (!q || (r[0] || '').toLowerCase().includes(q) || (r[2] || '').toLowerCase().includes(q) || (r[4] || '').toLowerCase().includes(q))); await (await api()).save_csv('Calgary businesses', ['Business', 'Category', 'Type', 'Community', 'Address', 'First licensed', 'Status', 'Longitude', 'Latitude', 'Source'], rows.map(r => [r[0], ivLabel(r[1]), r[2], ivName(r[3]), r[4], r[5], r[6], r[7], r[8], r[9] === 'O' ? 'OpenStreetMap' : 'City licence'])); });
  const f = $('#iv-form');
  if (f) f.addEventListener('submit', e => { e.preventDefault(); const d = Object.fromEntries(new FormData(f).entries()), to = (window.CDD_CONTACT || '').trim();
    const text = `Name: ${d.name}\nBusiness or idea: ${d.business}\nEmail: ${d.email}\nPhone: ${d.phone}\nInterested in: ${d.want}\n\n${d.msg}`;
    if (to) { location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent('Invest in Calgary: ' + d.want)}&body=${encodeURIComponent(text)}`; $('#iv-formmsg').textContent = 'Your email app should open with the message ready. Press send there.'; }
    else { navigator.clipboard && navigator.clipboard.writeText(text).catch(() => {}); $('#iv-formmsg').textContent = 'The contact address is being set up. Your message is copied, ready to paste.'; } });
  const u = $('#iv-unlock');
  if (u) u.addEventListener('submit', async e => { e.preventDefault(); const msg = $('#iv-lockmsg'); msg.textContent = 'Checking';
    try { await window.CDD_AI.unlock($('#iv-code').value, 'biz'); renderInvest(true); } catch (err) { msg.textContent = String(err.message || err); } });
  const ask = $('#iv-ask');
  if (ask) { ask.addEventListener('submit', e => { e.preventDefault(); ivAsk($('#iv-text').value); }); $('#iv-text').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask.requestSubmit(); } }); }
  const plan = $('#iv-plan'); if (plan) plan.addEventListener('click', () => ivAsk($('#iv-text').value.trim() || 'Which kinds of business Calgary is short of, where, and a business plan for the strongest one', true));
  const file = $('#iv-file'); if (file) file.addEventListener('change', async () => { const fl = file.files[0]; if (!fl) return; try { ivOwn = ivOwnAnalyse(ivParseCsv(await fl.text())); } catch (err) { ivOwn = { error: String(err.message || err) }; } re(); });
  const oa = $('#iv-ownask'); if (oa) oa.addEventListener('click', () => ivAsk(`${ivOwnSummary()} What are the trends, the seasons, my best days, and where can I grow?`));
  body.querySelectorAll('[data-eap]').forEach(b => b.addEventListener('click', async () => (await api()).open_path(b.dataset.eap)));
  if (ivSub === 'index') ivDrawMap();
  const th = $('#iv-thread'); if (th) th.scrollTop = th.scrollHeight;
  if (keep) window.scrollTo(0, y);
}
window.renderInvest = renderInvest;
