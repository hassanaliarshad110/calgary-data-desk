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

async function renderElections() {
  const body = $('#el-body');
  if (!body) return;
  if (!EL) body.innerHTML = '<p class="card-note">Reading the election results…</p>';
  await loadElections();
  $('#el-title').textContent = `Elections: ${W()}`;
  const errs = Object.keys((EL || {}).errors || {});
  body.innerHTML = `
    <section class="card span-12"><div class="card-head"><div><h2>Who represents ${esc(W())}</h2><p class="card-sub">The people elected at each level, with their last result.</p></div></div>${elWho()}</section>
    <section class="card span-12"><div class="card-head"><div><h2>City of Calgary: 2025 general election</h2></div></div>${elMunicipal()}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Alberta: provincial elections in Calgary</h2></div></div>${elProvincial()}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Canada: federal election in Calgary</h2></div></div>${elFederal()}</section>
    <section class="card span-12"><p class="card-note">Official results as published by Elections Calgary, Elections Alberta and Elections Canada; members today from the Legislative Assembly of Alberta and the House of Commons. Read ${EL ? esc(elDay(EL.built_at)) : ''}. Candidates are listed by votes; nothing here ranks or rates anyone. ${errs.length ? `Not read this time: ${esc(errs.join(', '))}.` : ''} <button type="button" class="link-btn small" data-method="elections">How these are read</button></p></section>`;
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
