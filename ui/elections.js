/* Calgary Data Desk: Elections. Who represents the area picked at each level, and the latest official results:
   municipal 2025 (Elections Calgary), provincial 2023 with by-elections since and the 2026 referendum (Elections
   Alberta), federal 2025 (Elections Canada). Results are shown as published: candidates by votes, no ranking,
   no colours by party. elections.py builds the figures; methods.py (topic "elections") explains them. */
'use strict';

let EL = null, elRefQ = 10;
const elPct = (v, d = 1) => isNum(v) ? `${fmt(v * 100, d)}%` : '–';
const elDay = v => (typeof dmy === 'function' ? dmy(v) : v) || '';

async function loadElections() {
  if (EL) return EL;
  try {
    const res = await (await api()).get_elections();
    if (res && res.ok && res.data) EL = res.data;
  } catch (e) { /* shown below */ }
  return EL;
}

// one person: the elected candidate (and the member sitting today, when different)
function elPerson(r, role) {
  if (!r || !r.elected) return '';
  const e = r.elected, m = r.member;
  const today = m && r.changed ? `<div class="el-now">${icon('alert')}<span>Sitting today: <b>${esc(m.name)}</b>${m.caucus ? ` (${esc(m.caucus)})` : ''}</span></div>` : '';
  const shown = m && !r.changed ? m.name : e.name;
  const party = (m && !r.changed && m.caucus) || e.party;
  return `<div class="el-person"><div class="el-role">${esc(role)}</div><div class="el-name">${esc(shown)}</div>
    <div class="el-meta">${party ? esc(party) + ' · ' : ''}${r.acclaimed ? 'elected by acclamation (the only candidate)' : `${elPct(e.share)} of the vote${isNum(r.margin_share) ? `, ahead by ${elPct(r.margin_share)}` : ''}${isNum(r.turnout) ? ` · turnout ${elPct(r.turnout)}` : ''}`}</div>${today}</div>`;
}

function elRidings(level, title, note) {
  const L = (D && D.elections || {})[level];
  if (!L || !(L.ridings || []).length) return '';
  if (isCity()) {                       // all of Calgary: the members by party, the full list is in the tables below
    const by = {};
    L.ridings.forEach(x => { const p = (x.member && !x.changed ? x.member.caucus : null) || (x.elected || {}).party || 'Other'; by[p] = (by[p] || 0) + 1; });
    return `<div class="el-level"><h3>${esc(title)}</h3><div class="el-name">${L.ridings.length} ${level === 'provincial' ? 'MLAs' : 'MPs'}</div>
      <div class="el-meta">${Object.entries(by).sort((a, b) => b[1] - a[1]).map(([p, n]) => `${esc(p)} ${n}`).join(' · ')}</div>
      <p class="card-note">${note} Every ${level === 'provincial' ? 'division' : 'district'} is listed below.</p></div>`;
  }
  const many = L.ridings.length > 1;
  return `<div class="el-level"><h3>${esc(title)}</h3>${L.ridings.map(x => `<div class="el-riding">${elPerson(x, x.riding)}
      ${many ? `<div class="el-share">${elPct(x.share, 0)} of ${esc(W())}'s residents</div>` : ''}
      ${x.by_election ? `<div class="el-share">Latest: by-election, ${esc(elDay(x.last_election))}</div>` : ''}</div>`).join('')}
    <p class="card-note">${note}</p></div>`;
}

function elWho() {
  const E = D && D.elections;
  if (!E) return '<p class="card-note">The election figures are not in this copy of the data yet.</p>';
  const m = E.municipal || {};
  const city = isCity();
  const muni = `<div class="el-level"><h3>City of Calgary (2025)</h3>${elPerson(m.mayor, 'Mayor')}
    ${city ? '' : elPerson(m.councillor, `Councillor, ${W()}`)}
    ${city ? '' : elPerson(m.public_trustee, `Public school trustee (CBE), ${(m.public_trustee || {}).title || ''}`)}
    ${city ? '' : elPerson(m.separate_trustee, `Separate school trustee (CCSD), ${(m.separate_trustee || {}).title || ''}`)}
    <p class="card-note">${m.turnout ? `Calgary's turnout: ${elPct(m.turnout.share, 2)} (${fmt(m.turnout.voters)} voters of ${fmt(m.turnout.electors)} electors). ` : ''}Elections Calgary does not publish turnout by ward.</p></div>`;
  const prov = elRidings('provincial', city ? 'Alberta: Calgary\'s MLAs' : 'Alberta: MLA', `Provincial divisions on the 2019 boundaries. Next provincial general election: ${esc(elDay((E.provincial || {}).next_election))}.`);
  const fed = elRidings('federal', city ? 'Canada: Calgary\'s MPs' : 'Canada: MP', 'Federal electoral districts from the 2023 representation order, first used on 28 April 2025.');
  return `<div class="el-who">${muni}${prov}${fed}</div>
    <p class="card-note">${city ? '' : `A ward and an electoral division or district have different borders: where ${esc(W())} is split between them, each share is of its residents (communities placed by area). `}Shares are of valid votes; "ahead by" is the gap to the second candidate.</p>`;
}

function elRaceTable(race, caption) {
  if (!race) return '';
  return `<table class="data el-race"><caption class="sr-only">${esc(caption)}</caption><thead><tr><th scope="col">Candidate</th><th scope="col">Party</th><th scope="col" class="num">Votes</th><th scope="col" class="num">Share</th></tr></thead><tbody>
    ${race.candidates.map(c => `<tr${c.elected ? ' class="el-win"' : ''}><td>${esc(c.name)}${c.elected ? ` <span class="ac-tag ac-ok">${race.acclaimed ? 'Acclaimed' : 'Elected'}</span>` : ''}${c.incumbent ? ' <small>(incumbent)</small>' : ''}</td><td>${esc(c.party || '–')}</td><td class="num">${race.acclaimed ? '–' : fmt(c.votes)}</td><td class="num">${race.acclaimed ? '–' : elPct(c.share)}</td></tr>`).join('')}
  </tbody></table>`;
}

function elMunicipal() {
  const M = EL && EL.municipal;
  if (!M) return '<p class="card-note">The municipal results could not be read.</p>';
  const ward = isCity() ? 0 : SCOPE;
  const mb = (M.mayor_by_ward || {}).by_ward || {};
  const top = (M.mayor || {}).candidates ? M.mayor.candidates.slice(0, 4).map(c => c.name) : [];
  const byWard = `<div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Ward</th>${top.map(n => `<th scope="col" class="num">${esc(n)}</th>`).join('')}<th scope="col" class="num">Election-day votes</th></tr></thead><tbody>
    ${Object.keys(mb).sort((a, b) => a - b).map(w => { const r = mb[w], by = {}; r.candidates.forEach(c => { by[c.name] = c; });
      return `<tr${+w === ward ? ' class="el-here"' : ''}><th scope="row">Ward ${w}</th>${top.map(n => `<td class="num">${elPct((by[n] || {}).share)}</td>`).join('')}<td class="num">${fmt(r.total)}</td></tr>`; }).join('')}
  </tbody></table></div><p class="card-note">Election-day votes only: ${fmt((M.mayor_by_ward || {}).advance_total)} advance votes were cast at stations open to voters from any ward, so they count for Calgary but cannot be placed in a ward. Shares of each ward's election-day votes.</p>`;
  const wards = Object.keys(M.councillors || {}).sort((a, b) => a - b);
  const council = `<div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Ward</th><th scope="col">Elected</th><th scope="col" class="num">Share</th><th scope="col">Second</th><th scope="col" class="num">Share</th><th scope="col" class="num">Votes cast</th><th scope="col" class="num">Candidates</th></tr></thead><tbody>
    ${wards.map(w => { const r = M.councillors[w], a = r.candidates[0] || {}, b = r.candidates[1] || {};
      return `<tr${+w === ward ? ' class="el-here"' : ''}><th scope="row">Ward ${w}</th><td>${esc(a.name || '')}</td><td class="num">${elPct(a.share)}</td><td>${esc(b.name || '–')}</td><td class="num">${elPct(b.share)}</td><td class="num">${fmt(r.total)}</td><td class="num">${r.candidates.length}</td></tr>`; }).join('')}
  </tbody></table></div>`;
  const tr = (list, label) => `<div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">${esc(label)}</th><th scope="col">Elected</th><th scope="col" class="num">Share</th><th scope="col" class="num">Votes cast</th></tr></thead><tbody>
    ${(list || []).map(r => { const a = r.candidates[0] || {}; return `<tr${(r.wards || []).includes(ward) ? ' class="el-here"' : ''}><th scope="row">${esc(r.title)}</th><td>${esc(a.name || '')}${r.acclaimed ? ' <span class="ac-tag ac-ok">Acclaimed</span>' : ''}</td><td class="num">${r.acclaimed ? '–' : elPct(a.share)}</td><td class="num">${r.acclaimed ? '–' : fmt(r.total)}</td></tr>`; }).join('')}
  </tbody></table></div>`;
  const myRace = ward && M.councillors[String(ward)];
  return `<p class="card-sub">20 October 2025. Calgary's turnout ${M.turnout ? `${elPct(M.turnout.share, 2)}: ${fmt(M.turnout.voters)} voters of ${fmt(M.turnout.electors)} electors on the Permanent Electors Register` : 'not read'}. Official results, corrected after the 27 October 2025 mayoral recount.</p>
    <h3 class="ac-h4">Mayor</h3>${elRaceTable(M.mayor, 'Mayor')}
    <h3 class="ac-h4">Mayor, by ward</h3>${byWard}
    ${myRace ? `<h3 class="ac-h4">Councillor, ${esc(W())}</h3>${elRaceTable(myRace, 'Councillor')}` : ''}
    <h3 class="ac-h4">Councillors, every ward</h3>${council}
    <h3 class="ac-h4">Public school board trustees (CBE)</h3>${tr(M.public_trustees, 'Wards')}
    <h3 class="ac-h4">Separate school board trustees (CCSD)</h3>${tr(M.separate_trustees, 'Wards')}`;
}

function elMine(level) {
  return new Set((((D && D.elections) || {})[level] || {}).ridings ? D.elections[level].ridings.map(r => r.riding) : []);
}

function elProvincial() {
  const P = EL && EL.provincial;
  if (!P) return '<p class="card-note">The provincial results could not be read.</p>';
  const mine = isCity() ? new Set() : elMine('provincial');
  const eds = Object.values(P.general || {}).sort((a, b) => a.name.localeCompare(b.name));
  const seats = {};
  eds.forEach(r => { const p = (r.candidates[0] || {}).party || 'Other'; seats[p] = (seats[p] || 0) + 1; });
  const byes = {};
  (P.byelections || []).forEach(b => { byes[b.ed] = b; });
  const rows = eds.map(r => { const a = r.candidates[0] || {}, b = r.candidates[1] || {}, m = (P.members || {})[r.name], bye = byes[r.name];
    const now = m && m.name && a.name && m.name.split(' ').pop() !== a.name.split(' ').pop() ? `${esc(m.name)} (${esc(m.caucus || '')})${bye ? `, by-election ${esc(elDay(bye.date))}` : ''}` : 'same';
    return `<tr${mine.has(r.name) ? ' class="el-here"' : ''}><th scope="row">${esc(r.name)}</th><td>${esc(a.name || '')}</td><td>${esc(a.party || '')}</td><td class="num">${elPct(a.share)}</td><td class="num">${elPct(r.margin_share)}</td><td class="num">${elPct(r.turnout)}</td><td>${now}</td></tr>`; }).join('');
  const byeHtml = (P.byelections || []).filter(b => b.race).map(b => `<h3 class="ac-h4">By-election, ${esc(b.ed)}, ${esc(elDay(b.date))}</h3>${elRaceTable(b.race, b.ed)}<p class="card-note">${fmt(b.race.electors)} electors; turnout ${elPct(b.race.turnout)}. <a href="${esc(b.url)}" target="_blank" rel="noopener">Elections Alberta official results</a>.</p>`).join('');
  return `<p class="card-sub">2023 general election, 29 May 2023: Calgary's ${eds.length} electoral divisions (2019 boundaries). Elected in Calgary: ${Object.entries(seats).sort((a, b) => b[1] - a[1]).map(([p, n]) => `${esc(p)} ${n}`).join(', ')}.</p>
    <div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Division</th><th scope="col">Elected in 2023</th><th scope="col">Party</th><th scope="col" class="num">Share</th><th scope="col" class="num">Ahead by</th><th scope="col" class="num">Turnout</th><th scope="col">Member today, if different</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${byeHtml}
    <p class="card-note">The next provincial general election is scheduled for ${esc(elDay(P.next_election))}. Alberta's electoral boundaries are being redrawn for it; the divisions here are those of the 2023 election. Members today: Legislative Assembly of Alberta.</p>
    ${elReferendum(P)}`;
}

function elReferendum(P) {
  const R = P.referendum;
  if (!R || !(R.questions || []).length) return '';
  const q = R.questions.find(x => x.number === elRefQ) || R.questions[R.questions.length - 1];
  const mine = isCity() ? new Set() : elMine('provincial');
  const opts = q.options.map(o => o.replace(/^Option \d+ - /, ''));
  const short = q.option_columns;
  const rows = Object.entries(q.by_ed).sort((a, b) => a[0].localeCompare(b[0])).map(([ed, v]) => `<tr${mine.has(ed) ? ' class="el-here"' : ''}><th scope="row">${esc(ed)}</th>${v.shares.map(s => `<td class="num">${elPct(s)}</td>`).join('')}<td class="num">${elPct(v.turnout)}</td></tr>`).join('');
  return `<h3 class="ac-h4" id="el-ref">Provincial referendum, ${esc(elDay(R.date))}</h3>
    <label class="el-q"><span>Question</span><select id="el-refq">${R.questions.map(x => `<option value="${x.number}" ${x.number === q.number ? 'selected' : ''}>Question ${x.number}</option>`).join('')}</select></label>
    <p class="el-question">${esc(q.question || '')}</p>
    <ul class="el-opts">${opts.map((o, i) => `<li><b>${esc(short[i] || '')}</b>: ${esc(o)}</li>`).join('')}</ul>
    <div class="el-ref-sum"><div><span class="el-role">Calgary's ${q.calgary.divisions} divisions</span>${q.calgary.shares.map((s, i) => `<div>${esc(short[i])}: <b>${elPct(s)}</b> (${fmt(q.calgary.votes[i])})</div>`).join('')}</div>
      ${q.alberta ? `<div><span class="el-role">All of Alberta</span>${q.alberta.shares.map((s, i) => `<div>${esc(short[i])}: <b>${elPct(s)}</b> (${fmt(q.alberta.votes[i])})</div>`).join('')}<div>Turnout ${elPct(q.alberta.turnout)}</div></div>` : ''}</div>
    <div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Division</th>${short.map(s => `<th scope="col" class="num">${esc(s)}</th>`).join('')}<th scope="col" class="num">Turnout</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="card-note">Official results by electoral division, Elections Alberta. <a href="${esc(q.url)}" target="_blank" rel="noopener">Question ${q.number} at Elections Alberta</a>.</p>`;
}

function elFederal() {
  const F = EL && EL.federal;
  if (!F) return '<p class="card-note">The federal results could not be read.</p>';
  const mine = isCity() ? new Set() : elMine('federal');
  const eds = Object.values(F.general || {}).sort((a, b) => a.name.localeCompare(b.name));
  const rows = eds.map(r => { const a = r.candidates[0] || {}, m = (F.members || {})[r.name];
    const now = m && a.name && m.name.split(' ').pop() !== a.name.split(' ').pop() ? `${esc(m.name)} (${esc(m.caucus || '')})` : 'same';
    return `<tr${mine.has(r.name) ? ' class="el-here"' : ''}><th scope="row">${esc(r.name)}</th><td>${esc(a.name || '')}</td><td>${esc(a.party || '')}</td><td class="num">${elPct(a.share)}</td><td class="num">${elPct(r.margin_share)}</td><td class="num">${fmt(r.electors)}</td><td class="num">${elPct(r.turnout)}</td><td>${now}</td></tr>`; }).join('');
  return `<p class="card-sub">45th general election, 28 April 2025: Calgary's ${eds.length} federal electoral districts.</p>
    <div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">District</th><th scope="col">Elected</th><th scope="col">Party</th><th scope="col" class="num">Share</th><th scope="col" class="num">Ahead by</th><th scope="col" class="num">Electors</th><th scope="col" class="num">Turnout</th><th scope="col">Member today, if different</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="card-note">Elections Canada official voting results; members today from the House of Commons.</p>`;
}

// ================================================================ ELECTION DATA CENTRE
let elSub = 'room';
const EL_SUBS = [['room', 'Overview'], ['leaders', 'Know your leaders'], ['area', 'Know your constituency'], ['analytics', 'Election Analytics'], ['civic', 'Civic Accountability'], ['results', 'Full results']];
// election days: Alberta's (Election Act s. 38.1, Elections Alberta), municipal (Government of Alberta: 15 October 2029)
// and federal (Canada Elections Act s. 56.1: 15 October 2029, unless an election is called earlier)
const EL_NEXT = [['Alberta general election', '2027-10-18', 'Fixed date in law'], ['Calgary municipal election', '2029-10-15', 'Alberta\'s next municipal general election'],
  ['Federal general election', '2029-10-15', 'Fixed date in law, unless called earlier']];
const EL_PALETTE = ['#0369A1', '#B45309', '#047857', '#7C3AED', '#BE123C', '#0F766E', '#4D7C0F', '#64748B'];
// one colour per party name across every chart on the page (assigned in order of first use; not party colours)
const EL_COLOR = {};
const elColor = label => { if (!EL_COLOR[label]) EL_COLOR[label] = EL_PALETTE[Object.keys(EL_COLOR).length % EL_PALETTE.length]; return EL_COLOR[label]; };
const elDays = d => Math.round((new Date(d + 'T12:00:00') - new Date()) / 86400000);
// live countdowns: to the start of election day, Calgary time (October is daylight time, UTC-6)
const elStart = d => new Date(d + 'T00:00:00-06:00');
const EL_SHORT = { 'Alberta general election': 'Provincial', 'Calgary municipal election': 'Municipal', 'Federal general election': 'Federal' };
function elCountdown(d, big) {
  return `<div class="el-cd${big ? ' el-cd-big' : ''}" data-el-cd="${esc(d)}" role="timer" aria-label="Time until ${esc(elDay(d))}">${['days', 'hrs', 'min', 'sec'].map(u => `<span class="el-cd-u"><b>–</b><i>${u}</i></span>`).join('')}</div>`;
}
function elTick() {
  const now = Date.now();
  document.querySelectorAll('[data-el-cd]').forEach(n => {
    let t = Math.max(0, Math.floor((elStart(n.dataset.elCd) - now) / 1000));
    const v = [Math.floor(t / 86400), Math.floor(t % 86400 / 3600), Math.floor(t % 3600 / 60), t % 60];
    n.querySelectorAll('b').forEach((b, i) => { const x = i ? String(v[i]).padStart(2, '0') : fmt(v[0]); if (b.textContent !== x) b.textContent = x; });
  });
}
setInterval(elTick, 1000);

// a half-circle seat chart: seats in rows, filled left to right by group (largest first)
function elHemicycle(groups, title, sub) {
  const total = groups.reduce((a, g) => a + g.n, 0);
  if (!total) return '';
  const rows = total > 200 ? 9 : total > 60 ? 6 : total > 30 ? 4 : total > 12 ? 2 : 1, R = 150, r0 = rows === 1 ? 150 : rows === 2 ? 105 : 55;
  const radii = Array.from({ length: rows }, (_, i) => r0 + (R - r0) * (rows === 1 ? 1 : i / (rows - 1)));
  const lens = radii.reduce((a, r) => a + r, 0);
  let counts = radii.map(r => Math.floor(total * r / lens));
  for (let k = 0; counts.reduce((a, c) => a + c, 0) < total; k++) counts[rows - 1 - (k % rows)]++;
  const pts = [];
  radii.forEach((r, i) => { const n = counts[i]; for (let j = 0; j < n; j++) { const t = Math.PI * (n === 1 ? 0.5 : j / (n - 1)); pts.push({ x: 170 - r * Math.cos(t), y: 165 - r * Math.sin(t), a: t }); } });
  pts.sort((p, q) => p.a - q.a);
  const arc = Math.PI * R / Math.max(counts[rows - 1] - 1, 1), gap = rows > 1 ? (R - r0) / (rows - 1) : arc;
  const size = Math.max(2.5, Math.min(13, 0.44 * Math.min(arc, gap)));
  let k = 0;
  const dots = [];
  groups.forEach((g, gi) => { for (let j = 0; j < g.n; j++, k++) { const p = pts[k]; if (p) dots.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${size}" fill="${g.color || elColor(g.label)}"><title>${esc(g.label)}</title></circle>`); } });
  return `<div class="el-hemi"><h3>${esc(title)}</h3><svg viewBox="0 0 340 182" role="img" aria-label="${esc(title)}: ${groups.map(g => `${g.label} ${g.n}`).join(', ')}">${dots.join('')}<text x="170" y="160" text-anchor="middle" class="el-hemi-n">${total}</text></svg>
    <ul class="el-legend">${groups.map((g, gi) => `<li><span style="background:${g.color || elColor(g.label)}"></span>${esc(g.label)} <b>${g.n}</b></li>`).join('')}</ul>${sub ? `<p class="card-note">${sub}</p>` : ''}</div>`;
}
const elGroups = by => Object.entries(by).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).map(([label, n]) => ({ label, n }));

function elCouncilSeats() {
  const M = EL.municipal || {};
  const by = {};
  const add = p => { const k = p || 'Independent'; by[k] = (by[k] || 0) + 1; };
  if (M.mayor) add((M.mayor.candidates[0] || {}).party);
  Object.values(M.councillors || {}).forEach(r => add((r.candidates[0] || {}).party));
  return elGroups(by);
}
function elCalgarySeats(level) {
  const L = EL[level] || {}, by = {};
  Object.keys(L.general || {}).forEach(n => { const m = (L.members || {})[n]; const k = (m && m.caucus) || ((L.general[n].candidates || [])[0] || {}).party || 'Other'; by[k] = (by[k] || 0) + 1; });
  return elGroups(by);
}

// insights: facts worked out from the results, the same way for every race (no ranking of people or parties)
function elInsights() {
  const out = [], M = EL.municipal || {}, P = EL.provincial || {}, F = EL.federal || {};
  if (M.mayor) { const [a, b] = M.mayor.candidates; out.push(`<b>Mayor:</b> ${esc(a.name)} won with ${elPct(a.share)} of the vote, ${fmt(M.mayor.margin)} votes ahead of ${esc(b.name)} (${elPct(b.share)}), after the 27 October 2025 recount. ${M.mayor.candidates.length} candidates ran.`); }
  const cw = Object.entries(M.councillors || {});
  if (cw.length) {
    const close = cw.slice().sort((x, y) => x[1].margin_share - y[1].margin_share)[0];
    const plural = cw.filter(([, r]) => (r.candidates[0] || {}).share < 0.4).map(([w]) => +w).sort((a, b) => a - b);
    const kept = cw.filter(([, r]) => r.candidates.some(c => c.incumbent && c.elected)).length;
    const lost = cw.filter(([, r]) => r.candidates.some(c => c.incumbent && !c.elected)).length;
    out.push(`<b>Council:</b> the closest ward race was Ward ${close[0]} (${elPct(close[1].margin_share)} between the first two). ${plural.length} of 14 councillors won with under 40% of the vote (Wards ${plural.join(', ')}). ${kept} sitting councillors were re-elected, ${lost} ran and were not, and ${14 - kept - lost} wards were open seats.`);
  }
  const ce = EL.constituency_wards;
  if (ce) {
    const ws = Object.entries(ce).filter(([, v]) => isNum(v.turnout_est)).sort((a, b) => b[1].turnout_est - a[1].turnout_est);
    if (ws.length) out.push(`<b>Turnout by ward (estimate):</b> highest in Ward ${ws[0][0]} (${elPct(ws[0][1].turnout_est, 0)}), lowest in Ward ${ws[ws.length - 1][0]} (${elPct(ws[ws.length - 1][1].turnout_est, 0)}); Calgary ${elPct((M.turnout || {}).share, 1)}.`);
  }
  const pg = Object.values(P.general || {});
  if (pg.length) {
    const c = pg.slice().sort((a, b) => a.margin_share - b.margin_share).slice(0, 3);
    const t = pg.slice().sort((a, b) => b.turnout - a.turnout);
    out.push(`<b>Alberta 2023:</b> the closest Calgary divisions were ${c.map(r => `${esc(r.name)} (${elPct(r.margin_share)})`).join(', ')}. Turnout ran from ${elPct(t[t.length - 1].turnout, 0)} (${esc(t[t.length - 1].name)}) to ${elPct(t[0].turnout, 0)} (${esc(t[0].name)}).`);
  }
  (P.byelections || []).filter(b => b.race).forEach(b => { const w = b.race.candidates[0]; const g = (P.general || {})[b.ed]; const g0 = g && g.candidates[0];
    out.push(`<b>Since 2023:</b> ${esc(b.ed)} by-election on ${esc(elDay(b.date))}: ${esc(w.name)} (${esc(w.party || '')}) elected with ${elPct(w.share)} on a turnout of ${elPct(b.race.turnout)}${g0 && g0.party !== w.party ? `; the seat was won by ${esc(g0.party)} in 2023` : ''}.`); });
  const fg = Object.values(F.general || {});
  if (fg.length) {
    const c = fg.slice().sort((a, b) => a.margin_share - b.margin_share)[0];
    const t = fg.slice().sort((a, b) => b.turnout - a.turnout);
    out.push(`<b>Canada 2025:</b> the closest Calgary district was ${esc(c.name)} (${elPct(c.margin_share)}). Turnout ran from ${elPct(t[t.length - 1].turnout, 0)} (${esc(t[t.length - 1].name)}) to ${elPct(t[0].turnout, 0)} (${esc(t[0].name)}).`);
  }
  const q = (((P.referendum || {}).questions) || []).find(x => x.number === 10);
  if (q && q.alberta) out.push(`<b>Referendum, 19 October 2026 (question 10):</b> Calgary's divisions ${q.option_columns.map((o, i) => `${esc(o)} ${elPct(q.calgary.shares[i])}`).join(', ')}; all of Alberta ${q.option_columns.map((o, i) => `${esc(o)} ${elPct(q.alberta.shares[i])}`).join(', ')}.`);
  return `<ul class="el-insights">${out.map(x => `<li>${x}</li>`).join('')}</ul>`;
}

function elSplitTable() {
  const S = (D && D.elections || {}).ward_splits;
  if (!S) return '';
  const cell = list => (list || []).map(x => `${esc(x.riding)} <b>${elPct(x.share, 0)}</b>`).join('<br>');
  return `<div class="table-wrap ac-full"><table class="data el-split"><thead><tr><th scope="col">Ward</th><th scope="col">Provincial electoral divisions (MLAs)</th><th scope="col">Federal electoral districts (MPs)</th></tr></thead><tbody>
    ${Object.keys(S).sort((a, b) => a - b).map(w => `<tr${!isCity() && +w === SCOPE ? ' class="el-here"' : ''}><th scope="row">Ward ${w}</th><td>${cell(S[w].provincial)}</td><td>${cell(S[w].federal)}</td></tr>`).join('')}
  </tbody></table></div><p class="card-note">Shares of each ward's residents (the count chosen in Settings). Wards and electoral areas have different borders; communities split by a boundary are split by area.</p>`;
}

// the ward map: 14 wards shaded by a figure per ward, labelled, the ward picked outlined
function elWardMap(values, label, fmtv) {
  const G = (D && D.geo && D.geo.wards) || {};
  const keys = Object.keys(G);
  if (!keys.length) return '';
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  const k = Math.cos(51.05 * Math.PI / 180);
  keys.forEach(w => (G[w].coordinates || []).forEach(poly => poly[0].forEach(([lo, la]) => { x0 = Math.min(x0, lo * k); x1 = Math.max(x1, lo * k); y0 = Math.min(y0, la); y1 = Math.max(y1, la); })));
  const Wd = 520, Ht = Wd * (y1 - y0) / (x1 - x0), sc = Wd / (x1 - x0);
  const P = ([lo, la]) => `${((lo * k - x0) * sc).toFixed(1)},${((y1 - la) * sc).toFixed(1)}`;
  const vals = keys.map(w => values[w]).filter(isNum), lo = Math.min(...vals), hi = Math.max(...vals);
  const shade = v => { if (!isNum(v)) return '#1E293B'; const t = hi > lo ? (v - lo) / (hi - lo) : 0.5; return `hsl(199, ${55 + t * 35}%, ${22 + t * 38}%)`; };
  const paths = keys.map(w => { const d = (G[w].coordinates || []).map(poly => poly.map(r => 'M' + r.map(P).join('L') + 'Z').join('')).join('');
    // label at the area centroid of the ward's largest ring
    let best = null, bestA = 0;
    (G[w].coordinates || []).forEach(poly => { const r = poly[0]; let A2 = 0, cx = 0, cy = 0;
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const f = r[j][0] * r[i][1] - r[i][0] * r[j][1]; A2 += f; cx += (r[j][0] + r[i][0]) * f; cy += (r[j][1] + r[i][1]) * f; }
      if (Math.abs(A2) > bestA) { bestA = Math.abs(A2); best = [cx / (3 * A2), cy / (3 * A2)]; } });
    const c = P(best || (G[w].coordinates || [])[0][0][0]).split(',');
    const on = !isCity() && +w === SCOPE;
    return `<g><path d="${d}" fill="${shade(values[w])}" stroke="${on ? '#FBBF24' : '#0B1220'}" stroke-width="${on ? 3 : 1.2}"><title>Ward ${w}: ${fmtv(values[w])}</title></path><text x="${c[0]}" y="${c[1]}" class="el-map-w">${w}</text><text x="${c[0]}" y="${+c[1] + 14}" class="el-map-v">${fmtv(values[w])}</text></g>`; }).join('');
  return `<svg class="el-map" viewBox="0 0 ${Wd} ${Ht.toFixed(0)}" role="img" aria-label="${esc(label)} by ward">${paths}</svg>
    <div class="el-map-key"><span>${esc(fmtv(lo))}</span><i></i><span>${esc(fmtv(hi))}</span> <b>${esc(label)}</b></div>`;
}

// every race at every level in Calgary, closest first
function elBattle() {
  const out = [], M = EL.municipal || {}, P = EL.provincial || {}, F = EL.federal || {};
  if (M.mayor) out.push(['City', 'Mayor', M.mayor]);
  Object.entries(M.councillors || {}).forEach(([w, r]) => out.push(['City', `Councillor, Ward ${w}`, r]));
  Object.values(P.general || {}).forEach(r => out.push(['Alberta 2023', r.name, r]));
  (P.byelections || []).filter(b => b.race).forEach(b => out.push([`Alberta ${b.date ? b.date.slice(0, 4) : ''} by-election`, b.ed, b.race]));
  Object.values(F.general || {}).forEach(r => out.push(['Canada 2025', r.name, r]));
  return out.filter(x => isNum(x[2].margin_share)).sort((a, b) => a[2].margin_share - b[2].margin_share);
}

function elRoom() {
  const M = EL.municipal || {}, P = EL.provincial || {}, F = EL.federal || {};
  const A = P.chamber, C = F.chamber, CW = EL.constituency_wards || {};
  const cal = elCouncilSeats(), mla = elCalgarySeats('provincial'), mp = elCalgarySeats('federal');
  const split = gs => { const t = gs.reduce((a, g) => a + g.n, 0); return `<div class="el-bar">${gs.map(g => `<span style="width:${g.n / t * 100}%;background:${elColor(g.label)}" title="${esc(g.label)} ${g.n}"></span>`).join('')}</div><div class="el-hero-sub">${gs.map(g => `${esc(g.label)} ${g.n}`).join(' · ')}</div>`; };
  const battle = elBattle(), closest = battle[0];
  const hero = `<section class="el-cr span-12">
    <div class="el-cr-top"><div><div class="el-cr-kicker">Calgary Data Desk</div><h2 class="el-cr-title">Election Data Centre</h2><div class="el-cr-sub">${esc(W())} · official results and the members sitting today · read ${esc(elDay(EL.built_at))}</div></div>
      <div class="el-cr-counts">${EL_NEXT.map(([t, d]) => `<div class="el-cr-count"><div class="el-cr-kicker">${esc(EL_SHORT[t] || t)} · ${esc(elDay(d))}</div>${elCountdown(d, true)}</div>`).join('')}</div></div>
    <div class="el-cr-kpis">
      <div class="el-kpi"><div class="el-kpi-l">City Council</div><div class="el-kpi-n">15</div>${split(cal)}</div>
      <div class="el-kpi"><div class="el-kpi-l">Calgary's MLAs</div><div class="el-kpi-n">26</div>${split(mla)}</div>
      <div class="el-kpi"><div class="el-kpi-l">Calgary's MPs</div><div class="el-kpi-n">11</div>${split(mp)}</div>
      <div class="el-kpi"><div class="el-kpi-l">Municipal turnout 2025</div><div class="el-kpi-n">${elPct((M.turnout || {}).share, 1)}</div><div class="el-hero-sub">${fmt((M.turnout || {}).voters)} of ${fmt((M.turnout || {}).electors)} electors</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Closest race in Calgary</div><div class="el-kpi-n">${closest ? elPct(closest[2].margin_share) : '–'}</div><div class="el-hero-sub">${closest ? `${esc(closest[1])} (${esc(closest[0])})` : ''}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Mayor's winning share</div><div class="el-kpi-n">${elPct(((M.mayor || {}).candidates || [{}])[0].share)}</div><div class="el-hero-sub">${fmt((M.mayor || {}).margin)} votes ahead, ${((M.mayor || {}).candidates || []).length} candidates</div></div>
    </div></section>`;
  const turnMap = elWardMap(Object.fromEntries(Object.entries(CW).map(([w, v]) => [w, v.turnout_est])), 'Estimated turnout, 2025 municipal election', v => elPct(v, 0));
  const tw = Object.entries(CW).sort((a, b) => (b[1].turnout_est || 0) - (a[1].turnout_est || 0));
  const tmax = Math.max(...tw.map(x => x[1].turnout_est || 0), 0.01);
  const bars = `<div class="el-hbars">${tw.map(([w, v]) => `<div class="el-hbar${!isCity() && +w === SCOPE ? ' is-on' : ''}"><span class="el-hbar-l">Ward ${w}</span><span class="el-hbar-t"><i style="width:${(v.turnout_est || 0) / tmax * 100}%"></i></span><span class="el-hbar-v">${elPct(v.turnout_est, 0)}</span></div>`).join('')}
    <div class="el-hbar el-hbar-cal"><span class="el-hbar-l">Calgary</span><span class="el-hbar-t"><i style="width:${((M.turnout || {}).share || 0) / tmax * 100}%"></i></span><span class="el-hbar-v">${elPct((M.turnout || {}).share, 0)}</span></div></div>`;
  const bt = `<div class="table-wrap ac-full"><table class="data el-battle"><thead><tr><th scope="col">Seat</th><th scope="col">Level</th><th scope="col">Elected</th><th scope="col">Second</th><th scope="col" class="num">Ahead by</th><th scope="col">Margin</th></tr></thead><tbody>
    ${battle.slice(0, 12).map(([lvl, seat, r]) => { const a = r.candidates[0] || {}, b2 = r.candidates[1] || {}; return `<tr><th scope="row">${esc(seat)}</th><td>${esc(lvl)}</td><td>${esc(a.name || '')}${a.party ? ` <small>(${esc(a.party)})</small>` : ''}</td><td>${esc(b2.name || '')}${b2.party ? ` <small>(${esc(b2.party)})</small>` : ''}</td><td class="num">${elPct(r.margin_share)}${isNum(r.margin) ? `<br><small>${fmt(r.margin)} votes</small>` : ''}</td><td class="el-mbar"><i style="width:${Math.max(r.margin_share / ((battle[11] || battle[battle.length - 1])[2].margin_share || 1), 0.03) * 100}%"></i></td></tr>`; }).join('')}
  </tbody></table></div><p class="card-note">The 12 closest of ${battle.length} races at every level in Calgary: the gap between the first two candidates, as a share of the votes cast.</p>`;
  const seats = `<div class="el-seats el-seats-big">
    ${elHemicycle(cal, 'Calgary City Council', 'Mayor and 14 councillors, 2025, by local political party.')}
    ${elHemicycle(mla, "Calgary's 26 MLAs", 'Members sitting today.')}
    ${elHemicycle(mp, "Calgary's 11 MPs", 'Members sitting today.')}</div>`;
  const big = [];
  if (A) big.push(elHemicycle(elGroups(A.by_caucus).concat(A.vacant ? [{ label: 'Vacant', n: A.vacant, color: '#CBD5E1' }] : []), `Legislative Assembly of Alberta, ${A.seats} seats`, `Calgary holds 26 of the ${A.seats} seats.`));
  if (C) big.push(elHemicycle(elGroups(C.by_caucus).concat(C.vacant ? [{ label: 'Vacant', n: C.vacant, color: '#CBD5E1' }] : []), `House of Commons, ${C.seats} seats`, `Calgary holds 11 of the ${C.seats} seats.`));
  const next = `<div class="el-next">${EL_NEXT.map(([t, d, n]) => { const k2 = elDays(d); return `<div class="el-tile"><div class="el-role">${esc(t)}</div><div class="el-big">${esc(elDay(d))}</div>${k2 > 0 ? elCountdown(d) : ''}<div class="el-meta">${esc(n)}</div></div>`; }).join('')}</div><p class="card-note">Counting down to the start of election day, Calgary time. A federal election can be called earlier than the fixed date.</p>`;
  return `${hero}
    <section class="card span-7"><div class="card-head"><div><h2>Turnout across Calgary</h2><p class="card-sub">2025 municipal election, ward by ward (estimate${isCity() ? '' : `; ${esc(W())} outlined`})</p></div></div>${turnMap}</section>
    <section class="card span-5"><div class="card-head"><div><h2>Turnout ranking</h2><p class="card-sub">Votes for councillor / estimated electors</p></div></div>${bars}<p class="card-note">Estimates: Elections Calgary publishes turnout for Calgary only. How it's counted: "Elections".</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>Calgary's seats today</h2><p class="card-sub">Each party keeps one colour across these charts; they are not the parties' own colours.</p></div></div>${seats}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Closest races</h2><p class="card-sub">Where the last results were tightest, across city, provincial and federal seats</p></div></div>${bt}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Briefing: what the results show</h2><p class="card-sub">Worked out from the official results, the same way for every race.</p></div></div>${elInsights()}</section>
    ${big.length ? `<section class="card span-12"><div class="card-head"><div><h2>The legislatures</h2><p class="card-sub">Members sitting today</p></div></div><div class="el-seats">${big.join('')}</div></section>` : ''}
    <section class="card span-12"><div class="card-head"><div><h2>Next elections</h2></div></div>${next}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Wards and electoral areas</h2><p class="card-sub">How each ward's residents are split between provincial electoral divisions and federal electoral districts</p></div></div>${elSplitTable()}</section>`;
}

// ---- Know your leaders
function elLeader(role, name, party, lines, links) {
  return `<div class="el-leader"><div class="el-avatar" aria-hidden="true">${esc((name || '?').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join(''))}</div>
    <div><div class="el-role">${esc(role)}</div><div class="el-name">${esc(name || '')}</div>${party ? `<div class="el-meta">${esc(party)}</div>` : ''}
    ${lines.filter(Boolean).map(l => `<div class="el-meta">${l}</div>`).join('')}${(links || []).filter(x => x && x[1]).map(([t, u]) => `<a class="el-link" href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>`).join(' ')}</div></div>`;
}
function elRaceLines(race, when) {
  if (!race) return [];
  const c = race.candidates[0] || {};
  if (race.acclaimed) return [`Elected by acclamation, ${esc(when)}`];
  const inc = race.candidates.find(x => x.incumbent);
  return [`Elected ${esc(when)} with ${fmt(c.votes)} votes (${elPct(c.share)}), ${isNum(race.margin) ? fmt(race.margin) + ' ahead' : ''} of ${race.candidates.length - 1} other candidate${race.candidates.length === 2 ? '' : 's'}`,
    c.incumbent ? 'Re-elected (held the seat before)' : inc ? `The incumbent, ${esc(inc.name)}, also ran` : ''];
}
function elLeaders() {
  const M = EL.municipal || {}, P = EL.provincial || {}, F = EL.federal || {};
  const E = (D && D.elections) || {};
  const city = isCity(), ward = city ? 0 : SCOPE;
  const cards = [];
  if (M.mayor) cards.push(elLeader('Mayor of Calgary', M.mayor.candidates[0].name, M.mayor.candidates[0].party || 'Independent', elRaceLines(M.mayor, '20 Oct 2025')));
  const wards = city ? Object.keys(M.councillors || {}).sort((a, b) => a - b) : [String(ward)];
  wards.forEach(w => { const r = (M.councillors || {})[w]; if (r) cards.push(elLeader(`Councillor, Ward ${w}`, r.candidates[0].name, r.candidates[0].party || 'Independent', elRaceLines(r, '20 Oct 2025'))); });
  const tr = (list, label) => (list || []).filter(r => city || (r.wards || []).includes(ward)).forEach(r => cards.push(elLeader(`${label}, ${r.title}`, r.candidates[0].name, null, elRaceLines(r, '20 Oct 2025'))));
  tr(M.public_trustees, 'Public school trustee (CBE)');
  tr(M.separate_trustees, 'Separate school trustee (CCSD)');
  const byes = {};
  (P.byelections || []).forEach(b => { byes[b.ed] = b; });
  const mine = lvl => city ? Object.keys((EL[lvl] || {}).general || {}).sort() : (((E[lvl] || {}).ridings) || []).map(x => x.riding);
  const share = (lvl, n) => { const x = (((E[lvl] || {}).ridings) || []).find(y => y.riding === n); return !city && x ? `${elPct(x.share, 0)} of ${esc(W())}'s residents live here` : ''; };
  mine('provincial').forEach(n => { const m = (P.members || {})[n] || {}; const b = byes[n]; const race = b && b.race ? b.race : (P.general || {})[n];
    cards.push(elLeader(`MLA, ${n}`, m.name || ((race || {}).candidates || [{}])[0].name, m.caucus, elRaceLines(race, b && b.race ? `${elDay(b.date)} (by-election)` : '29 May 2023').concat([share('provincial', n)]), [['Assembly profile', m.url]])); });
  mine('federal').forEach(n => { const m = (F.members || {})[n] || {}; const race = (F.general || {})[n];
    cards.push(elLeader(`MP, ${n}`, m.name || ((race || {}).candidates || [{}])[0].name, m.caucus, elRaceLines(race, '28 Apr 2025').concat([m.since ? `Member since ${esc(elDay(m.since))}` : '', share('federal', n)]), [['House of Commons profile', m.url]])); });
  return `<section class="card span-12"><div class="card-head"><div><h2>Know your leaders: ${esc(W())}</h2><p class="card-sub">Everyone elected for ${esc(W())}, with how they were elected. ${city ? 'Pick a ward at the top to see only its leaders.' : ''}</p></div></div>
    <div class="el-leaders">${cards.join('')}</div><p class="card-note">From the official results and the Legislative Assembly and House of Commons member lists. "Incumbent" is the person who held the seat going into that election.</p></section>`;
}

// ---- Know your constituency
function elProfileRows(keys) {
  const P = D && D.profile;
  if (!P) return [];
  const want = { people: ['Homes today', 'People per household', 'Children aged 0 to 14'], newcomers: ['Non-permanent residents (work or study permit, asylum claimants)', 'Moved home in the 5 years before the Census'],
    housing: ['Renter households', 'Households spending 30% or more of income on housing', 'Owners with a mortgage'], income: ['Median household income', 'People in low-income households'],
    work: ['Leave for work between noon and 5 a.m.', 'Commute 45 minutes or more', 'Take transit to work'], language: ['Speak a language other than English most often at home'] };
  const rows = [];
  P.groups.forEach(g => (want[g.key] || []).forEach(l => { const it = (g.items || []).find(i => i.label === l); if (it) rows.push(it); }));
  return rows;
}
function elVal(v, unit, label) { return !isNum(v) ? '–' : unit === '%' ? `${fmt(v, Number.isInteger(v) ? 0 : 1)}%` : unit === '$' ? `$${fmt(v)}` : unit === 'x' && /ratio/i.test(label || '') ? `${fmt(v, 1)}x` : fmt(v, v < 10 && !Number.isInteger(v) ? 1 : 0); }

function elArea() {
  const ev = ecView();
  if (ev) return ev;
  // a ward, or every ward side by side: drawn with that area's own figures, whatever the sidebar shows
  const key = ecKey(), w = key === 'W' ? 0 : ecWardOf(key);
  const view = w === SCOPE ? D : PEEK[`${(D && D.population && D.population.method) || ''}/${w}`];
  const pick = ecPicker();
  return pick + withView(view || D, view ? w : SCOPE, elAreaBody);
}
function elAreaBody() {
  const pick = '';
  const E = (D && D.elections) || {}, C = E.constituency || {}, M = EL.municipal || {};
  if (isCity()) {
    const ws = C.wards || {};
    const keys = Object.keys(ws).sort((a, b) => a - b);
    const row = w => ((D.wards_summary || {}).wards || []).find(x => x.ward === +w) || {};
    return pick + `<section class="card span-12"><div class="card-head"><div><h2>Know your constituency: every ward</h2><p class="card-sub">Pick a ward at the top for its full picture, or an MLA's division or an MP's district above.</p></div></div>
      <div class="ea-two"><div><h3 class="fb-h3">Council turnout by ward, 2025 (estimate)</h3>${ecBars(keys.map(w => ({ label: `Ward ${w}`, sub: ((M.councillors || {})[w] || { candidates: [{}] }).candidates[0].name || '', v: ws[w].turnout_est })).sort((a, b) => a.v - b.v), v => elPct(v, 0), 1)}</div>
      <div><h3 class="fb-h3">How close each council race was</h3>${ecBars(keys.map(w => ({ label: `Ward ${w}`, sub: `${fmt(((M.councillors || {})[w] || {}).margin)} votes`, v: ((M.councillors || {})[w] || {}).margin_share })).sort((a, b) => a.v - b.v), v => elPct(v, 1))}</div></div>
      <div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Ward</th><th scope="col">Councillor</th><th scope="col" class="num">Residents</th><th scope="col" class="num">Electors (estimate)</th><th scope="col" class="num">Votes for councillor</th><th scope="col" class="num">Turnout (estimate)</th><th scope="col" class="num">Winner's share</th><th scope="col" class="num">Ahead by</th></tr></thead><tbody>
      ${keys.map(w => { const r = (M.councillors || {})[w] || { candidates: [{}] }; const ward = row(w);
        return `<tr><th scope="row">Ward ${w}</th><td>${esc(r.candidates[0].name || '')}</td><td class="num">${fmt(ward.residents)}</td><td class="num">${fmt(ws[w].electors_est)}</td><td class="num">${fmt(ws[w].votes)}</td><td class="num">${elPct(ws[w].turnout_est, 0)}</td><td class="num">${elPct(r.candidates[0].share)}</td><td class="num">${elPct(r.margin_share)}</td></tr>`; }).join('')}
      </tbody></table></div><p class="card-note">${esc(C.electors_note || '')}</p></section>`;
  }
  const w = String(SCOPE), cw = (C.wards || {})[w] || {}, cr = C.councillor_race || {};
  const ward = D.ward || {}, race = (M.councillors || {})[w] || {};
  const cands = (race.candidates || []).map((c, i) => Object.assign({}, c, { elected: i === 0 }));
  const raceObj = cands.length ? { candidates: cands, turnout: cw.turnout_est, total: race.total, margin: race.margin, margin_share: race.margin_share,
    math: cands.length > 1 && cw.electors_est ? { gap_votes: race.margin, swing_to_flip: (race.margin_share || 0) / 2, did_not_vote: Math.max(0, cw.electors_est - (race.total || 0)), second_needs_from_new_voters: (race.margin || 0) + 1 } : null } : null;
  const tiles = [
    ['Residents', fmt(ward.residents), isNum(ward.growth_pct) ? `${ward.growth_pct > 0 ? '+' : ''}${fmt(ward.growth_pct, 1)}% since the 2021 Census` : ''],
    ['Electors (estimate)', fmt(cw.electors_est), 'Eligible voters, estimated (note below)'],
    ['Turnout, 2025 (estimate)', elPct(cw.turnout_est, 0), `Calgary ${elPct((M.turnout || {}).share, 1)}`],
    ['Councillor race', elPct(cr.winner_share), `${cr.candidates || '–'} candidates; ${isNum(cr.margin) ? fmt(cr.margin) + ' votes between the first two' : ''}`],
    ['Alberta 2023 turnout', elPct(C.provincial_turnout, 0), 'In the ward\'s divisions'],
    ['Canada 2025 turnout', elPct(C.federal_turnout, 0), 'In the ward\'s districts']];
  const facts = [];
  if (cr.incumbent) facts.push(cr.incumbent.elected ? `The sitting councillor, ${esc(cr.incumbent.name)}, was re-elected with ${elPct(cr.incumbent.share)}.` : `The sitting councillor, ${esc(cr.incumbent.name)}, ran and was not re-elected (${elPct(cr.incumbent.share)}).`);
  else if (cr.candidates) facts.push('The sitting councillor did not run: an open seat in 2025.');
  if (isNum(cr.top2_share)) facts.push(`The first two candidates took ${elPct(cr.top2_share, 0)} of the councillor vote; the other ${cr.candidates - 2} took ${elPct(1 - cr.top2_share, 0)}.`);
  if (C.provincial_closest) facts.push(`Closest provincial division touching the ward: ${esc(C.provincial_closest.name)}, decided by ${elPct(C.provincial_closest.margin_share)} in 2023.`);
  if (C.federal_closest) facts.push(`Closest federal district touching the ward: ${esc(C.federal_closest.name)}, decided by ${elPct(C.federal_closest.margin_share)} in 2025.`);
  const growth = (D.communities || []).filter(c => c.residential && isNum(c.residents) && isNum(c.census2021)).map(c => ({ name: c.name, add: c.residents - c.census2021, res: c.residents, g: c.growth_pct, homes: (c.homes_now || 0) - (c.homes_census || 0), rq: c.requests_per_1000 })).sort((a, b) => b.add - a.add);
  const newRes = growth.reduce((a, c) => a + Math.max(c.add, 0), 0);
  if (growth.length) facts.push(`About ${fmt(Math.round(newRes / 100) * 100)} more residents than at the 2021 Census, most of them in ${growth.slice(0, 3).map(c => esc(c.name)).join(', ')}.`);
  const mv = (C.mayor_vs_city || []).slice(0, 6);
  const mayor = mv.length ? ecMulti(mv.map(x => ({ label: x.name, vals: [x.ward, x.calgary] })), [W(), 'Calgary'], v => elPct(v, 1)) + '<p class="card-note">Election-day votes in the ward; Calgary includes advance votes.</p>' : '';
  const st = (C.stations || []).slice(0, 20);
  const stations = st.length ? ecBars(st.map(x => ({ label: x.station + (/advance/i.test(x.type) ? ' (advance)' : ''), sub: `${x.leading} ${elPct(x.shares[x.leading])}`, v: x.total })), v => fmt(v)) + '<p class="card-note">The 20 busiest voting stations for this race, by votes cast; every station together adds up to the official total. Advance stations took votes from voters of several wards.</p>' : '';
  const PG = ((D.profile || {}).groups || []).filter(g => (g.items || []).length);
  const people = PG.length ? PG.map(g => { const pc = g.items.filter(i => i.unit === '%' && isNum(i.ward)), ot = g.items.filter(i => i.unit !== '%' && isNum(i.ward));
    return `<h3 class="fb-h3">${esc(g.title || g.key)}</h3>${ot.length ? ecTiles(ot.map(i => [i.label, elVal(i.ward, i.unit, i.label), `Calgary ${elVal(i.cal, i.unit, i.label)}${i.note ? ' · ' + esc(i.note) : ''}`])) : ''}
      ${pc.length ? ecMulti(pc.map(i => ({ label: i.label + (i.label.startsWith('Non-permanent') ? ' (not eligible to vote)' : ''), vals: [i.ward / 100, isNum(i.cal) ? i.cal / 100 : null] })), [W(), 'Calgary'], v => elPct(v, Number.isInteger(Math.round(v * 1000) / 10) ? 0 : 1)) : ''}`; }).join('')
    + `<p class="card-note">${esc((D.profile.source || {}).name || '')}: 2021 Census, ${esc((D.profile.source || {}).published || '')}. ${esc((D.profile.source || {}).notes || '')}</p>` : '';
  const lists = ((D.profile || {}).groups || []).map(g => g.list).filter(l => l && (l.rows || []).length);
  const origins = lists.length ? lists.map(l => `<div><h3 class="fb-h3">${esc(l.title)}</h3>${ecBars(l.rows.slice(0, 10).map(r => ({ label: r[0], sub: `${fmt(r[1])} people`, v: r[2] })), v => fmt(v, 1) + '%')}${l.note ? `<p class="card-note">${esc(l.note)}</p>` : ''}</div>`).join('') : '';
  const issues = (D.open_by_type || []).filter(t => !/contact us/i.test(t.type)).slice(0, 10);
  const raise = issues.length ? ecBars(issues.map(t => ({ label: typeof niceType === 'function' ? niceType(t.type) : t.type, v: t.n })), v => fmt(v)) + `<p class="card-note">Open 311 requests in ${esc(W())} today. ${fmt((D.summary || {}).requests_per_1000, 0)} requests per 1,000 residents in the last 12 months.</p>` : '';
  const comms = growth.length ? `${ecBars(growth.slice(0, 12).map(c => ({ label: c.name, sub: `${fmt(c.res)} residents · ${fmt(c.homes)} homes added`, v: c.add })), v => (v > 0 ? '+' : '') + fmt(v))}
    <div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Community</th><th scope="col" class="num">Residents</th><th scope="col" class="num">Added since 2021</th><th scope="col" class="num">Homes added</th><th scope="col" class="num">311 per 1,000</th></tr></thead><tbody>${growth.map(c => `<tr><th scope="row">${esc(c.name)}</th><td class="num">${fmt(c.res)}</td><td class="num">${fmt(c.add)}</td><td class="num">${fmt(c.homes)}</td><td class="num">${fmt(c.rq, 0)}</td></tr>`).join('')}</tbody></table></div>` : '';
  const MI = E.micro || {};
  return pick + `<section class="card span-12"><div class="card-head"><div><h2>Know your constituency: ${esc(W())}</h2><p class="card-sub">Councillor ${esc(ecCouncillor(SCOPE))}. The electorate, how it voted and who lives here: facts for any candidate or campaign alike. Pick an MLA's division or an MP's district above for theirs.</p></div></div>
      ${ecTiles(tiles)}
      <ul class="el-insights">${facts.map(f => `<li>${f}</li>`).join('')}</ul><p class="card-note">${esc(C.electors_note || '')}</p></section>
    ${ecCard(6, 'Councillor race, 2025', 'Share of the vote', ecRace(raceObj))}
    ${ecCard(6, 'The arithmetic of the council race', 'What separated first and second, against the electors who stayed home (estimate)', raceObj ? ecMath(raceObj, MI.who, null) : '')}
    ${ecCard(6, `How ${esc(W())} voted for mayor`, '', mayor)}
    ${ecCard(6, 'Councillor race, station by station', '', stations || '<p class="card-note">Station results are not in this copy of the data yet.</p>')}
    ${MI.who ? ecWhoCards(MI.who, W()) : ''}
    ${ecCard(12, `Who lives here: ${esc(W())} and Calgary`, '2021 Census ward profile', people)}
    ${origins ? ecCard(12, 'Languages and countries of birth', 'For outreach and translated materials: what residents speak at home and where immigrants were born', `<div class="el-two">${origins}</div>`) : ''}
    ${ecCard(6, 'What residents raise with the City', 'Open 311 requests by type', raise)}
    <section class="card span-12"><div class="card-head"><div><h2>Overlapping electoral areas</h2></div></div>${elWho()}</section>
    ${ecCard(12, 'Communities', 'Largest growth since the 2021 Census first', comms)}
    ${ecReferendum(C.referendum, W())}`;
}

// ---- Since the election: the first 12 months of the council term against the 12 months before (the dashboard's period)
function elTerm() {
  const S = (D && D.summary) || {}, dev = (D && D.development) || {}, cr = (D && D.crime) || {};
  const W14 = ((D && D.wards_summary) || {}).wards || [];
  const cal = k => W14.reduce((a, w) => a + (w[k] || 0), 0);
  const chg = (a, b) => isNum(a) && b ? (a - b) / b * 100 : null;
  const pc = v => isNum(v) ? `${v > 0 ? '+' : ''}${fmt(v, 1)}%` : '–';
  const rows = [
    ['311 requests', S.requests12, S.requests_prev, chg(cal('requests12'), cal('requests_prev'))],
    ['Infrastructure reports (roads, sidewalks, lights)', S.infra12, S.infra_prev, chg(cal('infra12'), cal('infra_prev'))],
    ['Traffic incidents', S.traffic12, S.traffic_prev, chg(cal('traffic12'), cal('traffic_prev'))],
    ['Crimes reported (police)', cr.crimes, cr.crimes_prev, cr.city_change_pct],
    ['New homes completed', S.new_homes12, S.new_homes_prev, chg(cal('new_homes12'), cal('new_homes_prev'))],
    ['Homes in building permits issued', S.issued_homes12, S.issued_homes_prev, chg(cal('issued_homes12'), cal('issued_homes_prev'))],
    ['Development permit applications', dev.applied, dev.applied_prev, null]];
  const table = `<div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Measure</th><th scope="col" class="num">${esc(D.period || '')}</th><th scope="col" class="num">${esc(D.prev_period || '')}</th><th scope="col" class="num">Change</th><th scope="col" class="num">Calgary's change</th></tr></thead><tbody>
    ${rows.map(([t, a, b, c]) => `<tr><th scope="row">${esc(t)}</th><td class="num">${fmt(a)}</td><td class="num">${fmt(b)}</td><td class="num">${pc(chg(a, b))}</td><td class="num">${isCity() ? '' : pc(c)}</td></tr>`).join('')}
    <tr><th scope="row">311 requests closed within 7 days</th><td class="num">${isNum(S.closed_7_days_pct) ? fmt(S.closed_7_days_pct, 1) + '%' : '–'}</td><td class="num">–</td><td class="num">–</td><td class="num">${isNum(S.closed_7_days_pct_city) && !isCity() ? 'Calgary ' + fmt(S.closed_7_days_pct_city, 1) + '%' : ''}</td></tr>
    <tr><th scope="row">Open 311 requests older than 90 days, today</th><td class="num">${fmt(S.open_over_90_days)}</td><td class="num">–</td><td class="num">–</td><td class="num"></td></tr>
  </tbody></table></div>`;
  const pr = ((D && D.projects) || []).concat(((D && D.roadwork) || []).map(r => ({ title: r.title, kind: r.type, status: r.completion ? `Completion ${r.completion}` : '', budget: r.budget, url: r.url })));
  const projects = pr.length ? `<div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Project</th><th scope="col">Status</th><th scope="col">Completion</th><th scope="col">Budget</th></tr></thead><tbody>${pr.map(x => `<tr><th scope="row">${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)}</a>` : esc(x.title)}${x.kind ? `<br><small>${esc(x.kind)}</small>` : ''}</th><td>${esc(x.status || '')}</td><td>${esc(x.completion || '')}</td><td>${esc(x.budget || '')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="card-note">No major projects listed for this area.</p>';
  const since = ((D && D.big_permits) || []).filter(b => (b.issued || '') >= '2025-10-20');
  const permits = since.length ? `<p class="card-sub">${fmt(since.length)} large building permits issued since 20 October 2025, ${fmt(since.reduce((a, b) => a + (b.cost || 0), 0) / 1e6, 1)} million dollars of construction in all:</p><div class="table-wrap ac-full"><table class="data"><thead><tr><th scope="col">Issued</th><th scope="col">Project</th><th scope="col">Type</th><th scope="col" class="num">Estimated cost</th></tr></thead><tbody>${since.sort((a, b) => (b.cost || 0) - (a.cost || 0)).slice(0, 15).map(b => `<tr><td>${esc(elDay(b.issued))}</td><th scope="row">${esc(b.title)}<br><small>${esc(b.address || '')}</small></th><td>${esc(b.type || '')}</td><td class="num">$${fmt(b.cost)}</td></tr>`).join('')}</tbody></table></div>` : '';
  return `<section class="card span-12"><div class="card-head"><div><h2>Since the election: ${esc(W())}</h2><p class="card-sub">The council elected on 20 October 2025: its first 12 months (${esc(D.period || '')}) against the 12 months before (${esc(D.prev_period || '')}).</p></div></div>${table}
      <p class="card-note">City figures for the area, the same way for every ward. They follow City services, funding from all three governments, growth and the weather as much as anyone's decisions: they describe the area, not one person's record. Police figures: ${esc(cr.period || 'the latest published')}.</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>Projects</h2><p class="card-sub">Major City, school and transit projects in ${esc(W())} and where each stands today</p></div></div>${projects}</section>
    ${permits ? `<section class="card span-12"><div class="card-head"><div><h2>Building since the election</h2></div></div>${permits}</section>` : ''}`;
}

function elResults() {
  return `<section class="card span-12"><div class="card-head"><div><h2>City of Calgary: 2025 general election</h2></div></div>${elMunicipal()}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Alberta: provincial elections in Calgary</h2></div></div>${elProvincial()}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Canada: federal election in Calgary</h2></div></div>${elFederal()}</section>`;
}

async function renderElections() {
  const body = $('#el-body');
  if (!body) return;
  if (!EL) body.innerHTML = '<p class="card-note">Reading the election results…</p>';
  await loadElections();
  $('#el-title').textContent = `Election Data Centre: ${W()}`;
  if (!EL) { body.innerHTML = '<p class="card-note">The election results could not be read.</p>'; return; }
  EL.constituency_wards = (((D && D.elections) || {}).constituency || {}).wards;
  const errs = Object.keys(EL.errors || {});
  if (elSub === 'area' || elSub === 'analytics') await ecPrepare();
  // Election Analytics lives here as a section of its own (elanalytics.js fills it)
  const page = elSub === 'analytics' ? '<div class="span-12 ea-embed"><div class="grid" id="ea-body"></div></div>' : elSub === 'civic' ? '<div class="span-12 ca-embed"><div class="grid" id="ca-body"></div></div>' : elSub === 'leaders' ? elLeaders() : elSub === 'area' ? elArea() : elSub === 'results' ? elResults() : elRoom();
  body.innerHTML = `<nav class="el-subtabs span-12" aria-label="Election Data Centre sections">${EL_SUBS.map(([k, t]) => `<button type="button" class="el-subtab${k === elSub ? ' is-on' : ''}" data-elsub="${k}" ${k === elSub ? 'aria-current="page"' : ''}>${k === 'analytics' ? '<svg class="ic el-subic" aria-hidden="true"><use href="#i-analytics-solid"/></svg>' : ''}${esc(t)}</button>`).join('')}</nav>
    ${page}
    <section class="card span-12"><p class="card-note">Official results as published by Elections Calgary, Elections Alberta and Elections Canada; members today from the Legislative Assembly of Alberta and the House of Commons. Read ${esc(elDay(EL.built_at))}. Facts only: nothing here rates, ranks or recommends any candidate, party or campaign. ${errs.length ? `Not read this time: ${esc(errs.join(', '))}.` : ''} <button type="button" class="link-btn small" data-method="elections">How these are read</button></p></section>`;
  elTick();
  if (typeof ecBind === 'function') ecBind(body, renderElections);
  if (elSub === 'analytics' && window.renderElAnalytics) await window.renderElAnalytics();
  if (elSub === 'civic' && window.renderCivic) await window.renderCivic();
  body.querySelectorAll('[data-elsub]').forEach(b => b.addEventListener('click', () => { elSub = b.dataset.elsub; renderElections(); }));
  const sel = $('#el-refq');
  if (sel) sel.addEventListener('change', () => { elRefQ = +sel.value; const y = window.scrollY; renderElections().then(() => window.scrollTo(0, y)); });
}

// the Dashboard card: who represents the area picked
function renderRepCard() {
  const card = $('#rep-card');
  if (!card) return;
  const E = D && D.elections;
  card.hidden = !E;
  if (!E) return;
  $('#rep-body').innerHTML = elWho();
}

window.renderElections = renderElections;
window.renderRepCard = renderRepCard;
