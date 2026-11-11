/* Calgary Insight: Invest in Calgary. Every business we can find in Calgary (City business licences and
   OpenStreetMap), grouped and searchable; where each kind of business is underserved for the people who live nearby;
   growth and new licences; and the Business Economist (behind its own passcode) that writes business
   plans from all the data on Calgary Insight. business.py builds the list; the index is worked out here with the
   residents counted the way chosen in Settings. */
'use strict';

let ivFSrc = '', ivDirMap = null, ivDirView = null, ivDirLayer = null;
let IV = null, IVP = null, ivSub = 'opps', ivCat = 'grocery', ivRad = 2, ivQ = '', ivFCat = '', ivFComm = '', ivPage = 0, ivMap = null;
let ivBusy = false, ivThread = [], ivOwn = null;
const IV_SUBS = [['opps', 'Opportunities'], ['index', 'Underserved index'], ['list', 'Business directory'], ['growth', 'Growth'], ['economist', 'Business Economist']];
const ivMon = ym => { const [y, m] = String(ym).split('-'); return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m - 1] || m} ${y}`; };
const ivP = (v, d = 0) => isNum(v) ? `${fmt(v * 100, d)}%` : '–';

async function loadInvest() {
  if (IV) return IV;
  try { const r = await (await api()).get_business(); if (r && r.ok && r.data) { IV = r.data; IVP = r.people || null; if (ivHomeOk() && !ivRadSet) ivRad = 800; } } catch (e) { /* shown below */ }
  return IV;
}
// distance: 400 or 800 = metres from every home (the Growth vs amenities way); 1, 2 or 3 = km around a community's centre
let ivRadSet = false;
function ivHomeOk() { const A = IV && IV.home_access; return !!(A && A.city && Object.keys(A.city).length && A.share_m && A.typ_m); }
const ivWalkR = r => r >= 100;                       // 400 or 800 m: walking distance
const ivHome = r => ivHomeOk() && (ivWalkR(r) || r <= 3);   // measured from every home (walk, or 1 to 3 km around a home)
const ivDist = r => ivWalkR(r) ? `${fmt(r)} m` : `${r} km`;
const ivRadTxt = r => ivHome(r) ? `${ivDist(r)} of home` : `${r} km`;
const ivWalk = r => r <= 400 ? 'five-minute walk' : 'ten-minute walk';
// where a business was found: City licence (L), OpenStreetMap (O), Overture Maps (V); several letters = counted once
function ivSrc(code) {
  if (code === 'H') return 'City licence (home-based)';
  const n = { L: 'City licence', O: 'OpenStreetMap', V: 'Overture Maps', B: 'City licence + OpenStreetMap' };
  return String(code || '').split('').map(c => n[c]).filter(Boolean).join(' + ');
}
const ivUrl = u => { const t = String(u || '').trim(); return /^https?:\/\//i.test(t) ? t : ''; };
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
  if (ivHome(rad)) return ivIndexHome(cat, rad, key, P, B);
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
// from every home: walking distance (the share of homes within 400 or 800 m of one, wherever it is), or 1 to 3 km
// (how many a typical home has within reach, against a typical Calgary home)
function ivIndexHome(cat, rad, key, P, B) {
  const A = IV.home_access, S = A.share_m || [], V = A.typ_m || [], walk = ivWalkR(rad), m = walk ? rad : rad * 1000;
  const ks = S.indexOf(m), ka = S.length + V.indexOf(m), cityA = (A.city || {})[cat] || [];
  const cityShare = isNum(cityA[ks]) ? cityA[ks] / 100 : null, cityAvg = walk ? null : cityA[ka];
  const totPeople = Object.values(P).reduce((a, p) => a + (p.now || 0), 0);
  const totBiz = Object.values(B).reduce((a, x) => a + ((x.count || {})[cat] || 0), 0);
  const rows = Object.keys(P).filter(c => P[c].now >= 500 && ((A.by_comm || {})[c] || {})[cat]).map(c => {
    const a = A.by_comm[c][cat], now = P[c].now, share = a[ks] / 100, without = now * (1 - share);
    const avg = walk ? null : a[ka], short = walk ? null : Math.max(0, cityAvg - avg);
    const index = walk ? (cityShare ? share / cityShare : null) : (cityAvg ? avg / cityAvg : null);
    return { code: c, name: ivName(c), residents: now, reach: now, share, cityShare, without, avg, cityAvg, short, index,
      gap: walk ? without : short, growth: isNum(P[c].c21) && P[c].c21 ? now / P[c].c21 - 1 : null,
      here: (((B[c] || {}).count) || {})[cat] || 0, homes: A.by_comm[c].u };
  });
  ivIdxKey = key; ivIdx = { rows, home: true, walk, city: cityShare, cityAvg, totBiz, totPeople, per10k: totPeople ? totBiz / totPeople * 1e4 : 0 };
  return ivIdx;
}
// the biggest gaps across every neighbourhood category
// A community and kind of business is judged only when at least 15,000 people live within reach (fewer is too small a
// market to call a gap); it is a gap when what is within reach is under 60% of Calgary's rate and at least 1.5 short.
// out.checked: how many pairs were judged, so the count can be read as a share at every distance.
function ivOpportunities(rad) {
  const out = [];
  let checked = 0;
  ivCats(true).forEach(c => {
    const I = ivIndex(c.key, rad);
    I.rows.forEach(r => {
      if (I.home) {                 // walking: under 60% of Calgary's share of homes and 1,000 residents or more without one;
        if (r.index === null) return;   // 1 to 3 km: a typical home has under 60% of what a typical Calgary home has, 1 or more short
        // only where it is normal in Calgary: a quarter of homes have one this close, or a typical home has one this near
        if (I.walk ? (I.city || 0) < 0.25 : (I.cityAvg || 0) < 1) return;
        checked++;
        if (r.index < 0.6 && (I.walk ? r.without >= 1000 : r.short >= 1 && r.residents >= 1000)) out.push({ ...r, cat: c.key, label: c.label, city: I.per10k });
        return;
      }
      if (r.reach < 15000 || r.index === null) return;
      checked++;
      if (r.index < 0.6 && r.gap >= 1.5) out.push({ ...r, cat: c.key, label: c.label, city: I.per10k });
    });
  });
  // one row per community and category; the most people within reach of the fewest businesses first
  out.sort((a, b) => b.gap - a.gap);
  out.checked = checked;
  out.communities = new Set(out.map(o => o.code)).size;
  return out;
}
// how many communities (of 500+ people) have 15,000 people or more within each distance
let ivJKey = '', ivJ = null;
function ivJudged() {
  const key = Object.keys(IVP || {}).length + '/' + Object.keys(IV.centres || {}).length;
  if (key === ivJKey) return ivJ;
  const P = ivPeople(), C = IV.centres || {};
  const codes = Object.keys(C).filter(c => P[c] && P[c].now >= 500);
  ivJ = { all: codes.length };
  [1, 2, 3].forEach(r => { ivJ[r] = codes.filter(c => Object.keys(C).reduce((a, j) => a + (ivKm(C[c], C[j]) <= r ? ((P[j] || {}).now || 0) : 0), 0) >= 15000).length; });
  ivJKey = key;
  return ivJ;
}
let ivGCat = '', ivGComm = '', ivGPage = 0;
const IV_GPAGE = 50;
// one sentence that says what a gap is, in plain words
function ivGapLine(o) {
  if (ivHome(ivRad) && ivWalkR(ivRad)) return `${fmt(o.share * 100, 0)}% of homes in ${o.name} are within ${fmt(ivRad)} m of ${o.label.toLowerCase()}, against ${fmt(o.cityShare * 100, 0)}% across Calgary. About ${fmt(o.without, 0)} residents have none within a ${ivWalk(ivRad)}, counting any just across the community line.`;
  if (ivHome(ivRad)) return `A typical home in ${o.name} has ${fmt(o.avg, 1)} ${o.label.toLowerCase()} within ${ivRad} km, against ${fmt(o.cityAvg, 1)} for a typical Calgary home: about ${fmt(o.short, 0)} fewer. ${fmt(o.share * 100, 0)}% of its homes have at least one within ${ivRad} km (Calgary ${fmt(o.cityShare * 100, 0)}%).`;
  return `${fmt(o.reach)} people live within ${ivRad} km of ${o.name}. They have ${fmt(o.biz)} ${o.biz === 1 ? 'place' : 'places'} of this kind within reach; at Calgary's average (${fmt(o.city, 1)} per 10,000 people) they would have about ${fmt(o.expected, 0)}, so about ${fmt(o.gap, 0)} more could be supported.`;
}
// the columns of a gap table, for the distance chosen
function ivGapHead() {
  if (ivHome(ivRad) && ivWalkR(ivRad)) return `<th class="num" scope="col">Homes within ${fmt(ivRad)} m</th><th class="num" scope="col">Calgary</th><th class="num" scope="col">Residents without one</th><th class="num" scope="col">Index</th>`;
  if (ivHome(ivRad)) return `<th class="num" scope="col">Within ${ivRad} km of a typical home</th><th class="num" scope="col">Calgary's typical home</th><th class="num" scope="col">Short by</th><th class="num" scope="col">Index</th>`;
  return `<th class="num" scope="col">Within ${ivRad} km</th><th class="num" scope="col">At Calgary's rate</th><th class="num" scope="col">Missing</th><th class="num" scope="col">Index</th>`;
}
function ivGapCells(o) {
  if (ivHome(ivRad) && ivWalkR(ivRad)) return `<td class="num">${fmt(o.share * 100, 0)}%</td><td class="num">${fmt(o.cityShare * 100, 0)}%</td><td class="num"><b>${fmt(o.without, 0)}</b></td><td class="num">${fmt(o.index * 100, 0)}</td>`;
  if (ivHome(ivRad)) return `<td class="num">${fmt(o.avg, 1)}</td><td class="num">${fmt(o.cityAvg, 1)}</td><td class="num"><b>${fmt(o.short, 1)}</b></td><td class="num">${fmt(o.index * 100, 0)}</td>`;
  return `<td class="num">${fmt(o.biz)}</td><td class="num">${fmt(o.expected, 1)}</td><td class="num"><b>${fmt(o.gap, 1)}</b></td><td class="num">${fmt(o.index * 100, 0)}</td>`;
}
function ivAllGaps(ops) {
  const cats = [...new Set(ops.map(o => o.cat))].map(k => [k, ivLabel(k)]).sort((a, b) => a[1].localeCompare(b[1]));
  const comms = [...new Set(ops.map(o => o.code))].map(k => [k, ivName(k)]).sort((a, b) => a[1].localeCompare(b[1]));
  const rows = ops.filter(o => (!ivGCat || o.cat === ivGCat) && (!ivGComm || o.code === ivGComm));
  const pages = Math.max(1, Math.ceil(rows.length / IV_GPAGE));
  ivGPage = Math.min(Math.max(0, ivGPage), pages - 1);
  const shown = rows.slice(ivGPage * IV_GPAGE, (ivGPage + 1) * IV_GPAGE);
  return `<section class="card span-12" id="iv-allgaps"><div class="card-head"><div><h2>Every gap (${fmt(ops.length)})</h2><p class="card-sub">Each row is one community and one kind of business, with what it means. Pick a kind of business or a community to narrow it down; tap a community's name to see that kind of business on the map.</p></div>
      <div class="card-tools sr-tools"><label class="sr-only" for="iv-gcat">Kind of business</label><select id="iv-gcat" class="select"><option value="">Every kind of business</option>${cats.map(([k, l]) => `<option value="${k}" ${k === ivGCat ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
      <label class="sr-only" for="iv-gcomm">Community</label><select id="iv-gcomm" class="select"><option value="">Every community</option>${comms.map(([k, l]) => `<option value="${k}" ${k === ivGComm ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
      <button type="button" class="btn small" id="iv-gapcsv">Download (CSV)</button></div></div>
    <p class="card-sub">${fmt(rows.length)} ${rows.length === 1 ? 'gap' : 'gaps'}${pages > 1 ? `, showing ${fmt(ivGPage * IV_GPAGE + 1)} to ${fmt(Math.min(rows.length, (ivGPage + 1) * IV_GPAGE))}` : ''}</p>
    <div class="table-wrap"><table class="data iv-gaps"><thead><tr><th scope="col">Community</th><th scope="col">Business</th>${ivGapHead()}<th scope="col">What it means</th></tr></thead>
    <tbody>${shown.map(o => `<tr><th scope="row"><button type="button" class="link-btn" data-ivgo="${o.cat}">${esc(o.name)}</button></th><td>${esc(o.label)}</td>${ivGapCells(o)}<td class="iv-why">${esc(ivGapLine(o))}</td></tr>`).join('') || `<tr><td colspan="7">No gaps match.</td></tr>`}</tbody></table></div>
    ${pages > 1 ? `<div class="iv-pager"><button type="button" class="btn small" data-ivgpage="-1" ${ivGPage === 0 ? 'disabled' : ''}>Previous</button><span>Page ${ivGPage + 1} of ${pages}</span><button type="button" class="btn small" data-ivgpage="1" ${ivGPage >= pages - 1 ? 'disabled' : ''}>Next</button></div>` : ''}</section>`;
}

function ivByComm(ops) {
  const m = {};
  ops.forEach(o => { (m[o.code] = m[o.code] || []).push(o); });
  return Object.entries(m).sort((a, b) => b[1].length - a[1].length || b[1].reduce((x, o) => x + o.gap, 0) - a[1].reduce((x, o) => x + o.gap, 0)).slice(0, 15)
    .map(([c, xs]) => ({ label: ivName(c), v: xs.length, sub: xs.slice().sort((a, b) => b.gap - a.gap).slice(0, 4).map(o => ivHome(ivRad) && ivWalkR(ivRad) ? `${o.label} (${fmt(o.share * 100, 0)}% of homes)` : `${o.label} (${fmt(o.gap, 0)} short)`).join(' · ') }));
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
function ivRadius() {
  const b = (r, t, tip) => `<button type="button" role="radio" aria-checked="${r === ivRad}" data-ivrad="${r}" title="${esc(tip)}">${t}</button>`;
  return `<div class="iv-radbox"><div class="seg small" role="radiogroup" aria-label="Distance">${ivHomeOk() ? b(400, '400 m walk', 'Share of homes within 400 m (about a five-minute walk) of one, wherever it is') + b(800, '800 m walk', 'Share of homes within 800 m (about a ten-minute walk) of one, wherever it is') : ''}${[1, 2, 3].map(r => b(r, `${r} km`, ivHomeOk() ? `How many a typical home has within ${r} km, against a typical Calgary home` : `Businesses against people within ${r} km of each community's centre`)).join('')}</div>
    <div class="iv-radhint">${ivHomeOk() ? 'All measured from every home · walk: one close by? · km: how much choice?' : 'Market size around each community'}</div></div>`;
}

// ---- Opportunities: the main dashboard
function ivOpps() {
  const T = IV.totals || {}, comms = Object.values(IV.communities || {});
  const new12 = comms.reduce((a, x) => a + (x.new12 || 0), 0), prev = comms.reduce((a, x) => a + (x.new_prev || 0), 0);
  const ops = ivOpportunities(ivRad);
  const seen = new Set(), top = ops.filter(o => { const k = o.code + o.cat; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 25);
  const byCat = {};
  ops.forEach(o => { byCat[o.cat] = (byCat[o.cat] || 0) + o.gap; });
  const catRows = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => ({ label: ivLabel(k), v, sub: `${ops.filter(o => o.cat === k).length} communities below 60% of Calgary's ${ivHome(ivRad) ? 'share' : 'rate'}` }));
  const grow = comms.map(x => ({ c: Object.keys(IV.communities).find(k => IV.communities[k] === x), x })).filter(o => o.x.new12 >= 5).sort((a, b) => b.x.new12 - a.x.new12).slice(0, 12);
  return `<section class="el-cr span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Invest in Calgary</div><h2 class="el-cr-title">Where Calgary needs more business</h2>
      <div class="el-cr-sub">${ivHome(ivRad) && ivWalkR(ivRad) ? `Every business we can find, measured from every home: the share of homes within ${fmt(ivRad)} m (a ${ivWalk(ivRad)}) of each kind, wherever it is.` : ivHome(ivRad) ? `Every business we can find, measured from every home: how many of each kind a typical home has within ${ivRad} km, against a typical Calgary home.` : `Every business we can find, set against the people who live within ${ivRad} km.`} Residents are counted the way chosen in Settings.</div></div>${ivRadius()}</div>
    ${ivKpis([['Licensed businesses', fmt(T.licences), 'City of Calgary business licences'], isNum(T.in_both) ? ['Businesses, counted once', fmt(T.unique), `${fmt(T.in_both)} found in more than one source (City licences, OpenStreetMap${T.overture_places ? ', Overture Maps' : ''}), counted once`] : ['Mapped places', fmt(T.osm_places), 'shops, clinics, banks and more on OpenStreetMap'],
      ['New licences, last 12 months', fmt(new12), `${new12 >= prev ? '+' : ''}${prev ? fmt((new12 / prev - 1) * 100, 0) + '%' : '–'} on the 12 months before`], ['Gaps found', `<button type="button" class="iv-kpilink" data-ivjump="iv-allgaps">${fmt(ops.length)}</button>`, `in ${fmt(ops.communities)} communities: ${ops.checked ? fmt(ops.length / ops.checked * 100, 0) : 0}% of the ${fmt(ops.checked)} checked. See every one below`],
      ['Categories', fmt(ivCats().length), `${ivCats(true).length} serve the neighbourhood`], ['Communities', fmt(Object.keys(IV.communities || {}).length), 'with at least one business']])}
      ${ivHome(ivRad) ? `<p class="iv-radnote"><b>How this is measured.</b> From every home on the City's property roll (weighted by its units) to the businesses of each kind around it, wherever they are: a supermarket 400 m away across the community line counts. ${ivWalkR(ivRad) ? `Walking distance asks: is there one close by? A gap: under 60% of Calgary's share of homes within ${fmt(ivRad)} m, and at least 1,000 residents without one; only kinds of business that at least a quarter of Calgary's homes have this close are judged.` : `1 to 3 km asks: how much choice is there? A typical home is the middle one, so a few homes downtown with hundreds of restaurants nearby do not set the bar. A gap: a typical home has under 60% of what a typical Calgary home has within ${ivRad} km, at least one business short, in a community of 1,000 or more; only kinds a typical Calgary home has within ${ivRad} km are judged.`} Every community is judged the same way, whatever its size.</p>` : `<p class="iv-radnote"><b>Why the number of gaps changes with the distance.</b> A community is only judged when at least 15,000 people live within reach; fewer is too small a market to call anything missing. Of the ${fmt(ivJudged().all)} communities with 500 or more residents, ${fmt(ivJudged()[1])} have that many people within 1 km, ${fmt(ivJudged()[2])} within 2 km and ${fmt(ivJudged()[3])} within 3 km: a wider circle lets more communities be judged, so more gaps are found. Of the places judged, the share that are gaps falls as the circle widens (${ops.checked ? fmt(ops.length / ops.checked * 100, 0) : 0}% at ${ivRad} km), because a wider circle takes in more businesses and more people, and evens out. Wider circles also overlap: one short area can show up for several neighbouring communities.</p>`}</section>
    <section class="card span-12"><div class="card-head"><div><h2>The biggest gaps</h2><p class="card-sub">${ivHome(ivRad) && ivWalkR(ivRad) ? `Communities where far fewer homes are within ${fmt(ivRad)} m of a kind of business than across Calgary. Most residents without one first.` : ivHome(ivRad) ? `Communities whose homes have far fewer of a kind of business within ${ivRad} km than a typical Calgary home. Most short first.` : `Communities where people within ${ivRad} km have far fewer of a kind of business than Calgary has per person. "Missing" = how many more it would take to reach Calgary's average.`}</p></div></div>
      <div class="table-wrap sr-wrap"><table class="data"><thead><tr><th scope="col">Community</th><th scope="col">Business</th>${ivHome(ivRad) ? '<th class="num" scope="col">Residents</th>' : `<th class="num" scope="col">People within ${ivRad} km</th>`}${ivGapHead()}<th class="num" scope="col">Growth since 2021</th></tr></thead>
      <tbody>${top.map(o => `<tr><th scope="row"><button type="button" class="link-btn" data-ivgo="${o.cat}">${esc(o.name)}</button></th><td>${esc(o.label)}</td><td class="num">${fmt(o.reach)}</td>${ivGapCells(o)}<td class="num">${isNum(o.growth) ? (o.growth > 0 ? '+' : '') + fmt(o.growth * 100, 0) + '%' : '–'}</td></tr>`).join('')}</tbody></table></div>
      <p class="card-note">${ivHome(ivRad) && ivWalkR(ivRad) ? `Index: the community's share of homes within ${fmt(ivRad)} m as a share of Calgary's (100 = Calgary's average).` : ivHome(ivRad) ? `Index: what a typical home here has within ${ivRad} km, as a share of a typical Calgary home (100 = Calgary's average).` : `Index: businesses within reach as a share of what Calgary's average per person would give (100 = Calgary's average).`} A gap is a lead to check, not a guarantee: a big store just outside the radius, zoning, rents and who the customers are all matter. The Business Economist works these through for a specific plan.</p></section>
    <section class="card span-6"><div class="card-head"><div><h2>Kinds of business with the most room</h2><p class="card-sub">${ivHome(ivRad) && ivWalkR(ivRad) ? `Residents without one within ${fmt(ivRad)} m, added up over every gap` : ivHome(ivRad) ? 'Businesses short for a typical home, added up over every gap' : 'Missing businesses added up over every gap'}</p></div></div>${ecBars(catRows, v => fmt(v, 0))}</section>
    <section class="card span-6"><div class="card-head"><div><h2>Where new businesses are opening</h2><p class="card-sub">New City licences in the last 12 months</p></div></div>${ecBars(grow.map(o => ({ label: ivName(o.c), v: o.x.new12, sub: `${fmt(o.x.new_prev)} the 12 months before` })), v => fmt(v))}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Communities with the most gaps</h2><p class="card-sub">How many kinds of everyday business are short within ${ivRadTxt(ivRad)}, and the biggest of them</p></div></div>${ecBars(ivByComm(ops), v => fmt(v))}</section>
    ${ivAllGaps(ops)}`;
}

// ---- Underserved index for one category, with the map
function ivIndexPage() {
  if (ivHome(ivRad) && !((IV.home_access || {}).city || {})[ivCat]) ivCat = 'grocery';   // walking distance: everyday kinds only
  const I = ivIndex(ivCat, ivRad), rows = I.rows.slice().sort((a, b) => b.gap - a.gap);
  if (I.home) return ivIndexHomePage(I, rows);
  return `<section class="card span-12"><div class="card-head"><div><h2>Underserved index: ${esc(ivLabel(ivCat))}</h2><p class="card-sub">Calgary has ${fmt(I.totBiz)}: ${fmt(I.per10k, 1)} for every 10,000 residents. For each community: how many are within ${ivRad} km against that rate for the people within ${ivRad} km.</p></div>
      <div class="card-tools sr-tools"><label class="sr-only" for="iv-cat">Kind of business</label>${ivCatSelect('iv-cat', false, ivCat)}${ivRadius()}</div></div>
    <div id="iv-map" class="iv-map" role="region" aria-label="Map of the underserved index"></div>
    <div class="ec-key"><span><i style="background:#B91C1C"></i>Under half Calgary's rate</span><span><i style="background:#F59E0B"></i>50 to 90</span><span><i style="background:#94A3B8"></i>90 to 110</span><span><i style="background:#047857"></i>Over 110</span><span>Circle size: people within reach</span></div></section>
    <section class="card span-12"><div class="card-head"><div><h2>Every community</h2><p class="card-sub">Most missing first: the most people within reach of the fewest businesses</p></div><div class="card-tools"><button class="btn" id="iv-csv">Download CSV</button></div></div>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Community</th><th class="num" scope="col">Residents</th><th class="num" scope="col">In the community</th><th class="num" scope="col">People within ${ivRad} km</th><th class="num" scope="col">Within ${ivRad} km</th><th class="num" scope="col">Per 10,000</th><th class="num" scope="col">At Calgary's rate</th><th class="num" scope="col">Index</th><th class="num" scope="col">Missing</th></tr></thead>
    <tbody>${rows.map(r => `<tr><th scope="row">${esc(r.name)}</th><td class="num">${fmt(r.residents)}</td><td class="num">${fmt(r.here)}</td><td class="num">${fmt(r.reach)}</td><td class="num">${fmt(r.biz)}</td><td class="num">${fmt(r.per10k, 1)}</td><td class="num">${fmt(r.expected, 1)}</td><td class="num">${isNum(r.index) ? fmt(r.index * 100, 0) : '–'}</td><td class="num">${r.gap > 0 ? fmt(r.gap, 1) : '–'}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function ivIndexHomePage(I, rows) {
  const d = ivDist(ivRad), w = I.walk;
  const sub = w ? `Across Calgary, ${fmt((I.city || 0) * 100, 0)}% of homes are within ${d} (a ${ivWalk(ivRad)}) of one. For each community: the share of its homes within ${d} of one, wherever it is, against that figure.`
    : `A typical Calgary home has ${fmt(I.cityAvg || 0, 1)} within ${d}. For each community: how many a typical home there has within ${d}, wherever they are, against that figure.`;
  return `<section class="card span-12"><div class="card-head"><div><h2>Underserved index: ${esc(ivLabel(ivCat))}</h2><p class="card-sub">${sub}</p></div>
      <div class="card-tools sr-tools"><label class="sr-only" for="iv-cat">Kind of business</label>${ivCatSelect('iv-cat', true, ivCat)}${ivRadius()}</div></div>
    <div id="iv-map" class="iv-map" role="region" aria-label="Map of the underserved index"></div>
    <div class="ec-key"><span><i style="background:#B91C1C"></i>Under half Calgary's ${w ? 'share' : 'figure'}</span><span><i style="background:#F59E0B"></i>50 to 90</span><span><i style="background:#94A3B8"></i>90 to 110</span><span><i style="background:#047857"></i>Over 110</span><span>Circle size: residents</span></div></section>
    <section class="card span-12"><div class="card-head"><div><h2>Every community</h2><p class="card-sub">${w ? `Most residents without one within ${d} first` : 'Most short first'}</p></div><div class="card-tools"><button class="btn" id="iv-csv">Download CSV</button></div></div>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Community</th><th class="num" scope="col">Residents</th><th class="num" scope="col">In the community</th><th class="num" scope="col">Homes within ${d}</th><th class="num" scope="col">Calgary</th>${w ? '' : `<th class="num" scope="col">Within ${d} of a typical home</th><th class="num" scope="col">Calgary's typical home</th>`}<th class="num" scope="col">Index</th><th class="num" scope="col">${w ? 'Residents without one' : 'Short by'}</th></tr></thead>
    <tbody>${rows.map(x => `<tr><th scope="row">${esc(x.name)}</th><td class="num">${fmt(x.residents)}</td><td class="num">${fmt(x.here)}</td><td class="num">${fmt(x.share * 100, 0)}%</td><td class="num">${fmt((x.cityShare || 0) * 100, 0)}%</td>${w ? '' : `<td class="num">${fmt(x.avg, 1)}</td><td class="num">${fmt(x.cityAvg, 1)}</td>`}<td class="num">${isNum(x.index) ? fmt(x.index * 100, 0) : '–'}</td><td class="num">${w ? fmt(x.without, 0) : fmt(x.short, 1)}</td></tr>`).join('')}</tbody></table></div>
    <p class="card-note">"In the community" counts the businesses inside its boundary; the figures from homes count any within ${d}, inside or outside it.</p></section>`;
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
      L.circleMarker([c[1], c[0]], { radius: Math.max(4, Math.min(16, Math.sqrt(r.reach) / (I.home ? 9 : 18))), color: col, fillColor: col, fillOpacity: 0.55, weight: 1 })
        .bindTooltip(I.home ? (I.walk ? `${esc(r.name)}: ${fmt(r.share * 100, 0)}% of homes within ${fmt(ivRad)} m (Calgary ${fmt(r.cityShare * 100, 0)}%), index ${fmt(r.index * 100, 0)}` : `${esc(r.name)}: a typical home has ${fmt(r.avg, 1)} within ${ivRad} km (Calgary ${fmt(r.cityAvg, 1)}), index ${fmt(r.index * 100, 0)}`) : `${esc(r.name)}: ${fmt(r.biz)} within ${ivRad} km for ${fmt(r.reach)} people (index ${fmt(r.index * 100, 0)})`).addTo(ivMap); });
  } catch (e) { el.innerHTML = '<p class="card-note">The map could not be drawn here.</p>'; }
}

// ---- Business directory
// the directory's filters, shared by the table, the map and the CSV
const IV_SRC = [['', 'Every source'], ['L', 'City licence'], ['O', 'OpenStreetMap'], ['V', 'Overture Maps'], ['multi', 'Found in more than one']];
function ivDirRows() {
  const q = ivQ.trim().toLowerCase();
  return (IV.businesses || []).filter(r => (!ivFCat || r[1] === ivFCat) && (!ivFComm || r[3] === ivFComm)
    && (!ivFSrc || (ivFSrc === 'multi' ? String(r[9] || '').replace('H', '').length > 1 : String(r[9] || '').replace('H', 'L').includes(ivFSrc)))
    && (!q || (r[0] || '').toLowerCase().includes(q) || (r[2] || '').toLowerCase().includes(q) || (r[4] || '').toLowerCase().includes(q)));
}
const IV_GCOL = ['#38BDF8', '#F59E0B', '#22C55E', '#A78BFA', '#F472B6', '#EF4444', '#2DD4BF', '#FACC15', '#FFFFFF', '#FB923C', '#94A3B8', '#84CC16'];
function ivGroups() { return [...new Set(ivCats().map(c => c.group))]; }
function ivColor(cat) { const c = (IV.categories || []).find(x => x.key === cat); const g = ivGroups(); return IV_GCOL[Math.max(0, g.indexOf(c ? c.group : '')) % IV_GCOL.length]; }
// every business as a dot, drawn on one canvas so tens of thousands stay quick; a tap finds the nearest dot
function ivDirDraw(rows) {
  const el = $('#iv-dirmap'); if (!el || typeof L === 'undefined') return;
  if (ivDirMap) { try { ivDirView = { c: ivDirMap.getCenter(), z: ivDirMap.getZoom() }; ivDirMap.remove(); } catch (e) { /* gone */ } ivDirMap = null; }
  const pts = rows.filter(r => isNum(r[7]) && isNum(r[8]));
  const map = ivDirMap = L.map(el, { scrollWheelZoom: false, preferCanvas: true });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
  const Dots = L.Layer.extend({
    onAdd(m) { this._c = L.DomUtil.create('canvas', 'iv-dots leaflet-zoom-hide'); m.getPanes().overlayPane.appendChild(this._c); m.on('moveend zoomend resize', this._draw, this); this._draw(); },
    onRemove(m) { L.DomUtil.remove(this._c); m.off('moveend zoomend resize', this._draw, this); },
    _draw() {
      const m = this._map, size = m.getSize(), c = this._c, dpr = window.devicePixelRatio || 1;
      L.DomUtil.setPosition(c, m.containerPointToLayerPoint([0, 0]));
      c.width = size.x * dpr; c.height = size.y * dpr; c.style.width = size.x + 'px'; c.style.height = size.y + 'px';
      const g = c.getContext('2d'); g.scale(dpr, dpr);
      const z = m.getZoom(), r = z >= 16 ? 5 : z >= 14 ? 3.5 : z >= 12 ? 2.4 : 1.6, b = m.getBounds().pad(0.05);
      this._xy = [];
      for (const p of pts) {
        if (!b.contains([p[8], p[7]])) continue;
        const q = m.latLngToContainerPoint([p[8], p[7]]);
        g.beginPath(); g.arc(q.x, q.y, r, 0, 6.2832); g.fillStyle = ivColor(p[1]); g.globalAlpha = 0.85; g.fill();
        if (z >= 15) { g.globalAlpha = 1; g.lineWidth = 1; g.strokeStyle = '#0B1220'; g.stroke(); }
        this._xy.push([q.x, q.y, p]);
      }
    },
  });
  const dots = ivDirLayer = new Dots().addTo(map);
  map.on('click', e => {
    const q = e.containerPoint; let best = null;
    for (const [x, y, p] of dots._xy || []) { const d = (x - q.x) ** 2 + (y - q.y) ** 2; if (d < 144 && (!best || d < best[0])) best = [d, p]; }
    if (!best) return;
    const p = best[1], web = ivUrl(p[10]);
    L.popup().setLatLng([p[8], p[7]]).setContent(`<b>${esc(p[0] || '(no name)')}</b><br>${esc(ivLabel(p[1]))}${p[2] ? ` · ${esc(p[2])}` : ''}<br>${esc(p[4] || '')}${p[3] ? ` · ${esc(ivName(p[3]))}` : ''}<br><small>Found in: ${esc(ivSrc(p[9]))}</small>${web ? `<br><a href="${esc(web)}" target="_blank" rel="noopener nofollow">Website</a>` : ''}${p[11] ? `${web ? ' · ' : '<br>'}${esc(p[11])}` : ''}`).openOn(map);
  });
  if (ivFComm || !ivDirView) {
    if (pts.length) map.fitBounds(L.latLngBounds(pts.map(p => [p[8], p[7]])).pad(0.05)); else map.setView([51.045, -114.06], 11);
  } else map.setView(ivDirView.c, ivDirView.z);
}
function ivList() {
  const q = ivQ.trim().toLowerCase(), B = IV.businesses || [];
  const rows = ivDirRows();
  const per = 100, pages = Math.max(1, Math.ceil(rows.length / per)); ivPage = Math.min(ivPage, pages - 1);
  const comms = Object.keys(IV.communities || {}).sort((a, b) => ivName(a).localeCompare(ivName(b)));
  const src = ivSrc;
  return `<section class="card span-12"><div class="card-head"><div><h2>Business directory</h2><p class="card-sub">${fmt(B.length)} businesses and places from City of Calgary business licences, OpenStreetMap and Overture Maps, each counted once. ${fmt(rows.length)} match the filters; ${fmt(rows.filter(r => isNum(r[7])).length)} of them are on the map.</p></div>
      <div class="card-tools sr-tools"><label class="sr-only" for="iv-q">Search</label><input id="iv-q" type="search" placeholder="Name, type or address" value="${esc(ivQ)}">
      <label class="sr-only" for="iv-fcat">Category</label><select id="iv-fcat" class="select"><option value="">Every category</option>${ivCats().map(c => `<option value="${c.key}" ${c.key === ivFCat ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select>
      <label class="sr-only" for="iv-fsrc">Found in</label><select id="iv-fsrc" class="select">${IV_SRC.map(([k, t]) => `<option value="${k}" ${k === ivFSrc ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>
      <label class="sr-only" for="iv-fcomm">Community</label><select id="iv-fcomm" class="select"><option value="">Every community</option>${comms.map(c => `<option value="${c}" ${c === ivFComm ? 'selected' : ''}>${esc(ivName(c))}</option>`).join('')}</select>
      <button class="btn" id="iv-listcsv">Download CSV</button></div></div>
    <div class="iv-dirmapwrap"><div id="iv-dirmap" class="iv-dirmap" role="region" aria-label="Map of the businesses that match the filters"></div>
      <div class="iv-dirlegend">${ivGroups().map((g, i) => `<span><i style="background:${IV_GCOL[i % IV_GCOL.length]}"></i>${esc(g)}</span>`).join('')}<span class="muted">Tap a dot for the business.</span></div></div>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Business</th><th scope="col">Category</th><th scope="col">Type</th><th scope="col">Community</th><th scope="col">Address</th><th scope="col">First licensed</th><th scope="col">Source</th></tr></thead>
    <tbody>${rows.slice(ivPage * per, ivPage * per + per).map(r => `<tr><th scope="row">${esc(r[0] || '(no name)')}${ivUrl(r[10]) ? ` <a class="iv-web" href="${esc(ivUrl(r[10]))}" target="_blank" rel="noopener nofollow" title="Website">↗</a>` : ''}${r[11] ? `<div class="iv-phone">${esc(r[11])}</div>` : ''}</th><td>${esc(ivLabel(r[1]))}</td><td class="wrap">${esc(r[2] || '')}</td><td>${esc(ivName(r[3]))}</td><td>${esc(r[4] || '')}</td><td>${esc(r[5] || '')}</td><td>${esc(src(r[9]))}</td></tr>`).join('')}</tbody></table></div>
    <div class="iv-pager"><button class="btn" data-ivpage="-1" ${ivPage ? '' : 'disabled'}>Previous</button><span>Page ${ivPage + 1} of ${pages}</span><button class="btn" data-ivpage="1" ${ivPage < pages - 1 ? '' : 'disabled'}>Next</button></div>
    <p class="card-note">Three open sources. The City licenses only some kinds of business (food, personal services, contractors, vehicle repair, liquor and others); most shops, clinics and offices need none, so they come from OpenStreetMap (mapped by volunteers) and Overture Maps (open place data with websites and phone numbers, from the Overture Maps Foundation). A business found in more than one source is shown and counted once, with every source it was found in: the same name within 80 m, nearly the same name within 200 m, or the same name at the same address; a map source listing one place twice is counted once too. Two branches of a chain stay two. Neither map source is complete, and a place listed may have closed.</p></section>`;
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
      <p class="card-note" id="iv-formmsg" role="status">${to ? 'Opens your email with the message ready to send. Nothing is sent until you press send there.' : 'The contact address is being set up; your message will be ready to copy.'}</p></form></section>`;
}
function ivEconomist() {
  const locked = ivLocked();
  const msgs = ivThread.map(m => `<div class="ea-msg ${m.who}">${m.who === 'you' ? esc(m.text) : (m.html || esc(m.text || ''))}${m.cards ? `<div class="ea-cards">${m.cards}</div>` : ''}</div>`).join('');
  const pitch = `<section class="el-cr span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Invest in Calgary</div><h2 class="el-cr-title">The Business Economist</h2>
      <div class="el-cr-sub">A business plan built on Calgary's own data: who lives within reach and how fast it is growing, households and incomes, the competition street by street, transit stops nearby, crime and 311 issues, weather through the year, rents and new homes. Every figure sourced; the full plan comes as a PDF, an interactive report and an Excel workbook that can be audited.</div></div></div>
    <div class="iv-offer"><div><b>For a new business</b><span>Where to open, how many customers are within reach, the competition, the numbers to break even, and the risks.</span></div>
      <div><b>For an existing business</b><span>Share your own sales data (it stays in your browser) to find trends, seasons, your best days, and where to grow.</span></div>
      <div><b>For investors</b><span>Which kinds of business Calgary is short of, where, and how fast those areas are growing.</span></div></div></section>`;
  const chat = `${window.sampleReport ? sampleReport('biz') : ''}<section class="card span-6 ea-chat"><div class="card-head"><div><h2>Ask the Business Economist</h2><p class="card-sub">Business plans, locations, competition and the numbers behind them</p></div></div>
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
  body.querySelectorAll('[data-ivrad]').forEach(b => b.addEventListener('click', () => { ivRad = +b.dataset.ivrad; ivRadSet = true; ivGPage = 0; re(); }));
  body.querySelectorAll('[data-ivgo]').forEach(b => b.addEventListener('click', () => { ivCat = b.dataset.ivgo; ivSub = 'index'; renderInvest(); }));
  body.querySelectorAll('[data-ivpage]').forEach(b => b.addEventListener('click', () => { ivPage += +b.dataset.ivpage; re(); }));
  body.querySelectorAll('[data-ivgpage]').forEach(b => b.addEventListener('click', () => { ivGPage += +b.dataset.ivgpage; re().then(() => { const g = $('#iv-allgaps'); if (g) g.scrollIntoView({ block: 'start' }); }); }));
  body.querySelectorAll('[data-ivjump]').forEach(b => b.addEventListener('click', () => { const g = document.getElementById(b.dataset.ivjump); if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  const gc = $('#iv-gcat'); if (gc) gc.addEventListener('change', () => { ivGCat = gc.value; ivGPage = 0; re(); });
  const gm = $('#iv-gcomm'); if (gm) gm.addEventListener('change', () => { ivGComm = gm.value; ivGPage = 0; re(); });
  const gcsv = $('#iv-gapcsv'); if (gcsv) gcsv.addEventListener('click', async () => { const ops = ivOpportunities(ivRad).filter(o => (!ivGCat || o.cat === ivGCat) && (!ivGComm || o.code === ivGComm));
    if (ivHome(ivRad) && !ivWalkR(ivRad)) await (await api()).save_csv(`Business gaps - ${ivRad} km from home`, ['Community', 'Business', 'Residents', `Within ${ivRad} km of a typical home`, "Calgary's typical home", 'Short by', `Homes with one within ${ivRad} km (%)`, 'Index', 'What it means'],
      ops.map(o => [o.name, o.label, o.residents, o.avg, o.cityAvg, +o.short.toFixed(2), +(o.share * 100).toFixed(1), +(o.index * 100).toFixed(0), ivGapLine(o)]));
    else if (ivHome(ivRad)) await (await api()).save_csv(`Business gaps - ${ivRad} m from home`, ['Community', 'Business', 'Residents', `Homes within ${ivRad} m (%)`, 'Calgary (%)', 'Residents without one', 'Index', 'Growth since 2021', 'What it means'],
      ops.map(o => [o.name, o.label, o.residents, +(o.share * 100).toFixed(1), +(o.cityShare * 100).toFixed(1), Math.round(o.without), +(o.index * 100).toFixed(0), isNum(o.growth) ? +(o.growth * 100).toFixed(0) : '', ivGapLine(o)]));
    else await (await api()).save_csv(`Business gaps - ${ivRad} km`, ['Community', 'Business', `People within ${ivRad} km`, `Businesses within ${ivRad} km`, "At Calgary's rate", 'Missing', 'Index', 'Growth since 2021', 'What it means'],
      ops.map(o => [o.name, o.label, o.reach, o.biz, +o.expected.toFixed(1), +o.gap.toFixed(1), +(o.index * 100).toFixed(0), isNum(o.growth) ? +(o.growth * 100).toFixed(0) : '', ivGapLine(o)])); });
  const cs = $('#iv-cat'); if (cs) cs.addEventListener('change', () => { ivCat = cs.value; re(); });
  const fc = $('#iv-fcat'); if (fc) fc.addEventListener('change', () => { ivFCat = fc.value; ivPage = 0; re(); });
  const fm = $('#iv-fcomm'); if (fm) fm.addEventListener('change', () => { ivFComm = fm.value; ivPage = 0; re(); });
  const fsr = $('#iv-fsrc'); if (fsr) fsr.addEventListener('change', () => { ivFSrc = fsr.value; ivPage = 0; re(); });
  const iq = $('#iv-q'); if (iq) { let t; iq.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { ivQ = iq.value; ivPage = 0; const p = iq.selectionStart; renderInvest(true).then(() => { const n = $('#iv-q'); if (n) { n.focus(); n.setSelectionRange(p, p); } }); }, 300); }); }
  const csv1 = $('#iv-csv'); if (csv1) csv1.addEventListener('click', async () => { const I = ivIndex(ivCat, ivRad);
    if (I.home && !I.walk) { await (await api()).save_csv(`Underserved index - ${ivLabel(ivCat)} - ${ivRad} km from home`, ['Community', 'Residents', 'In the community', `Homes with one within ${ivRad} km (%)`, 'Calgary (%)', `Within ${ivRad} km of a typical home`, "Calgary's typical home", 'Index', 'Short by'], I.rows.map(r => [r.name, r.residents, r.here, +(r.share * 100).toFixed(1), +((r.cityShare || 0) * 100).toFixed(1), r.avg, r.cityAvg, r.index && +(r.index * 100).toFixed(0), +r.short.toFixed(2)])); return; }
    if (I.home) { await (await api()).save_csv(`Underserved index - ${ivLabel(ivCat)} - ${ivRad} m from home`, ['Community', 'Residents', 'In the community', `Homes within ${ivRad} m (%)`, 'Calgary (%)', 'Index', 'Residents without one'], I.rows.map(r => [r.name, r.residents, r.here, +(r.share * 100).toFixed(1), +((r.cityShare || 0) * 100).toFixed(1), r.index && +(r.index * 100).toFixed(0), Math.round(r.without)])); return; } await (await api()).save_csv(`Underserved index - ${ivLabel(ivCat)} - ${ivRad} km`, ['Community', 'Residents', 'In the community', `People within ${ivRad} km`, `Within ${ivRad} km`, 'Per 10,000', "At Calgary's rate", 'Index', 'Missing'], I.rows.map(r => [r.name, r.residents, r.here, r.reach, r.biz, r.per10k && +r.per10k.toFixed(2), +r.expected.toFixed(2), r.index && +(r.index * 100).toFixed(0), +r.gap.toFixed(2)])); });
  const csv2 = $('#iv-listcsv'); if (csv2) csv2.addEventListener('click', async () => { const rows = ivDirRows(); await (await api()).save_csv('Calgary businesses', ['Business', 'Category', 'Type', 'Community', 'Address', 'First licensed', 'Status', 'Longitude', 'Latitude', 'Found in', 'Website', 'Phone'], rows.map(r => [r[0], ivLabel(r[1]), r[2], ivName(r[3]), r[4], r[5], r[6], r[7], r[8], ivSrc(r[9]), ivUrl(r[10]), r[11] || ''])); });
  const f = $('#iv-form');
  if (f) f.addEventListener('submit', e => { e.preventDefault(); const d = Object.fromEntries(new FormData(f).entries()), to = (window.CDD_CONTACT || '').trim();
    const text = `Name: ${d.name}\nBusiness or idea: ${d.business}\nEmail: ${d.email}\nPhone: ${d.phone}\nInterested in: ${d.want}\n\n${d.msg}`;
    if (to) { location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent('Invest in Calgary: ' + d.want)}&body=${encodeURIComponent(text)}`; $('#iv-formmsg').textContent = 'Your email should open with the message ready. Press send there.'; }
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
  if (ivSub === 'list') ivDirDraw(ivDirRows()); else if (ivDirMap) { try { ivDirMap.remove(); } catch (e) { /* gone */ } ivDirMap = null; ivDirView = null; }
  const th = $('#iv-thread'); if (th) th.scrollTop = th.scrollHeight;
  if (keep) window.scrollTo(0, y);
}
window.renderInvest = renderInvest;

// signed in with an approved email (web-account.js): the Business Economist unlocks without its passcode
document.addEventListener('cdd-unlocked', () => { if ($('#iv-body') && $('#iv-unlock')) renderInvest(true); });
