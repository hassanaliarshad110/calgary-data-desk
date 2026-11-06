/* Calgary Data Desk: Know your constituency for every elected member from Calgary: the councillor's ward, each MLA's
   provincial electoral division and each MP's federal electoral district. Charts of who lives there (age, households,
   work, languages), the last result and its arithmetic, turnout by voting location or poll, the wards it overlaps and
   the 2026 referendum. elections.py (areas) builds the figures. Facts only, the same way for every seat. */
'use strict';

let ecSel = { scope: null, key: 'ward' };
const ecP = (v, d = 0) => isNum(v) ? `${fmt(v * 100, d)}%` : '–';
const ecLevel = { provincial: ['Provincial electoral division', 'MLA', 'division'], federal: ['Federal electoral district', 'MP', 'district'] };

function ecAreas() { return ((D && D.elections) || {}).areas || {}; }
function ecKey() {
  if (ecSel.scope !== SCOPE) ecSel = { scope: SCOPE, key: isCity() ? 'all' : 'ward' };
  return ecSel.key;
}
function ecArea(key) {
  const m = /^([pf]):(.+)$/.exec(key || '');
  if (!m) return null;
  return ((ecAreas()[m[1] === 'p' ? 'provincial' : 'federal']) || {})[m[2]] || null;
}
function ecCouncillor(w) { const r = ((EL || {}).municipal || {}).councillors || {}; return (((r[String(w)] || {}).candidates || [])[0] || {}).name || ''; }

// ---- small charts (no party colours: the winner is the highlighted bar)
function ecBars(items, f, max) {
  max = max || Math.max(...items.map(x => x.v || 0), 1e-9);
  return `<div class="fb-bars">${items.map(x => `<div class="fb-bar${x.on ? ' is-on' : ''}"><span class="fb-bar-l">${esc(x.label)}${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</span><span class="fb-bar-t"><i style="width:${Math.max(0, (x.v || 0) / max * 100)}%"></i></span><span class="fb-bar-v">${esc(f(x.v))}</span></div>`).join('')}</div>`;
}
// several series per row (this area, Calgary, Alberta)
function ecMulti(rows, names, f, max) {
  max = max || Math.max(...rows.flatMap(r => r.vals.map(v => v || 0)), 1e-9);
  return `<div class="ec-key">${names.map((n, i) => `<span><i class="ec-s${i}"></i>${esc(n)}</span>`).join('')}</div>
    <div class="ec-multi">${rows.map(r => `<div class="ec-mrow"><span class="ec-ml">${esc(r.label)}</span><span class="ec-mt">${r.vals.map((v, i) => `<span class="ec-mb"><i class="ec-s${i}" style="width:${isNum(v) ? Math.max(0, v / max * 100) : 0}%"></i><b>${isNum(v) ? esc(f(v)) : '–'}</b></span>`).join('')}</span></div>`).join('')}</div>`;
}
function ecTiles(list) {
  return `<div class="el-next">${list.filter(Boolean).map(([t, v, n]) => `<div class="el-tile"><div class="el-role">${esc(t)}</div><div class="el-big">${v}</div><div class="el-meta">${n || ''}</div></div>`).join('')}</div>`;
}
function ecCard(span, title, sub, inner) {
  return inner ? `<section class="card span-${span}"><div class="card-head"><div><h2>${title}</h2>${sub ? `<p class="card-sub">${sub}</p>` : ''}</div></div>${inner}</section>` : '';
}
function ecRace(r) {
  if (!r || !(r.candidates || []).length) return '';
  return ecBars(r.candidates.map(c => ({ label: c.name, sub: [c.party, c.incumbent ? 'incumbent' : '', `${fmt(c.votes)} votes`].filter(Boolean).join(' · '), v: c.share, on: c.elected })), v => ecP(v, 1), 1);
}

// the arithmetic of the last result: what it would have taken for the runner-up to come first
function ecMath(race, who, rate) {
  const m = (race || {}).math, c = (race || {}).candidates || [];
  if (!m || c.length < 2) return '';
  const grown = who && isNum(who.population_now) && isNum(who.population_2021) && who.population_2021 ? who.population_now - who.population_2021 : null;
  const newEl = isNum(grown) && grown > 0 && rate ? Math.round(grown * rate) : null;
  const items = [{ label: 'Votes between first and second', sub: `${c[0].name} ahead of ${c[1].name}`, v: m.gap_votes },
    { label: 'Electors on the list who did not vote', sub: `${ecP(1 - (race.turnout || 0))} of the list`, v: m.did_not_vote }];
  if (newEl) items.push({ label: 'Potential new electors since 2021 (estimate)', sub: `${fmt(grown)} more residents x ${ecP(rate)} electors per resident`, v: newEl });
  return `${ecTiles([['Uniform swing that would tie it', isNum(m.swing_to_flip) ? `${fmt(m.swing_to_flip * 100, 1)} pts` : '–', 'from the winner to the runner-up (half the margin)'],
    ['New votes the runner-up needs', fmt(m.second_needs_from_new_voters), 'if every other vote stayed the same'],
    ['Share of non-voters that is', isNum(m.did_not_vote) && m.did_not_vote ? ecP(m.second_needs_from_new_voters / m.did_not_vote, 1) : '–', 'of the electors who did not vote last time']])}
    ${ecBars(items, v => fmt(v))}
    <p class="card-note">Arithmetic on the official result, not a forecast: it holds every other vote still. Swing and turnout scenarios for any candidate can be built in Election Analytics.</p>`;
}

function ecWhoCards(w, place) {
  if (!w || !w.population) return ecCard(12, 'Who lives here', '', '<p class="card-note">No Census figures for this area yet.</p>');
  const tiles = [['Residents today', fmt(w.population_now || w.population), w.method || ''], ['Aged 20 and over', fmt(w.adults20), 'the age group that votes'],
    ['Households', fmt(w.households), isNum(w.avg_hh) ? `${fmt(w.avg_hh, 2)} people per household` : ''], ['Families with children', ecP(w.families_kids), `one-parent ${ecP(w.one_parent)}`],
    ['In the labour force', ecP(w.participation), `unemployment ${ecP(w.unemployment, 1)} (May 2021)`], ['Self-employed', ecP(w.self_employed), 'of people with a job']];
  const ages = [['Under 20', w.under20], ['20 to 64', w.age20_64], ['65 and over', w.age65]].map(([l, v]) => ({ label: l, v }));
  const hh = [['Live alone', w.one_person_hh], ['5 or more in the home', w.big_hh], ['Never married (15+)', w.never_married]].map(([l, v]) => ({ label: l, v }));
  return ecCard(6, `Age and sex: ${esc(place)}`, `Residents today by 5-year age band: each community's 2021 Census mix scaled to its residents now${w.method ? ` (${esc(w.method)})` : ''}`, eaPyramid(w))
    + ecCard(6, 'Households and work', `${w.not_in_census ? `${fmt(w.not_in_census)} residents live in communities built since 2021, with no Census profile yet. ` : ''}Rates are the 2021 Census's`,
      `${ecTiles(tiles)}<h3 class="fb-h3">Age groups</h3>${ecBars(ages, v => ecP(v), 1)}<h3 class="fb-h3">Homes</h3>${ecBars(hh, v => ecP(v), 1)}
      ${(w.top_occupations || []).length ? `<h3 class="fb-h3">Most common occupations</h3>${ecBars(w.top_occupations.map(([k, v]) => ({ label: k, v })), v => fmt(v))}` : ''}
      ${(w.top_industries || []).length ? `<h3 class="fb-h3">Industries people work in</h3>${ecBars(w.top_industries.map(([k, v]) => ({ label: k, v })), v => fmt(v))}` : ''}`);
}

function ecCommunities(w) {
  const rows = ((w || {}).communities || []);
  if (!rows.length) return '';
  const C = Object.fromEntries(((D && D.communities) || []).map(c => [c.code, c]));
  const nm = r => (C[r.code] || {}).name || (r.name && r.name === r.name.toUpperCase() ? r.name.toLowerCase().replace(/(^|[\s\-'/(])([a-z])/g, (m, p, c) => p + c.toUpperCase()) : r.name) || r.code;
  return ecCard(12, 'Community by community', 'Residents today in the part of each community inside this area, with its 2021 Census profile',
    `${ecBars(rows.slice(0, 15).map(r => ({ label: nm(r), sub: `${ecP(r.share, 1)} of the area${isNum(r.inside) && r.inside < 0.995 ? ` · ${ecP(r.inside)} of the community is inside` : ''}`, v: r.residents })), v => fmt(v))}
    <div class="table-wrap"><table class="data ea-ctable"><thead><tr><th scope="col">Community</th><th class="num" scope="col">Residents</th><th class="num" scope="col">Share of area</th><th class="num" scope="col">Under 20</th><th class="num" scope="col">65+</th><th class="num" scope="col">Per household</th><th class="num" scope="col">Families with children</th><th class="num" scope="col">Unemployment</th><th scope="col">Top occupation</th></tr></thead>
    <tbody>${rows.map(r => `<tr><th scope="row">${esc(nm(r))}</th><td class="num">${fmt(r.residents)}</td><td class="num">${ecP(r.share, 1)}</td><td class="num">${ecP(r.under20)}</td><td class="num">${ecP(r.age65)}</td><td class="num">${isNum(r.avg_hh) ? fmt(r.avg_hh, 1) : '–'}</td><td class="num">${ecP(r.families_kids)}</td><td class="num">${isNum(r.unemployment) ? fmt(r.unemployment, 0) + '%' : '–'}</td><td>${esc(r.top_occupation || '–')}</td></tr>`).join('')}</tbody></table></div>`);
}

function ecReferendum(ref, place) {
  if (!(ref || []).length) return '';
  return ecCard(12, 'The 2026 referendum here', 'Share for the first option of each question: Yes, and for question 10, remain a province',
    `${ecMulti(ref.map(q => ({ label: `Q${q.number}: ${(t => t.length > 120 ? t.slice(0, 118) + '…' : t)((q.question || '').replace(/^Question \d+:\s*/, ''))}`, vals: [q.area[0], (q.calgary || [])[0], (q.alberta || [])[0]] })), [place, 'Calgary', 'Alberta'], v => ecP(v, 0), 1)}
    <p class="card-note">Elections Alberta's results by electoral division (19 October 2026). A federal district's figure averages the provincial divisions it overlaps by the share of its residents in each.</p>`);
}

function ecTurnoutProv(st, name) {
  const s = (st || {}).summary, rows = ((st || {}).stations || []).filter(x => isNum(x.turnout));
  if (!s || !rows.length) return '';
  return ecCard(12, 'Turnout by voting location, 2023', `Every election-day voting location in ${esc(name)}, lowest turnout first`,
    `${ecTiles([['Locations', fmt(s.election_day_stations), ''], ['Lowest', ecP(s.turnout_low), ''], ['Middle', ecP(s.turnout_median), ''], ['Highest', ecP(s.turnout_high), '']])}
    <div class="ea-two"><div><h3 class="fb-h3">Locations by turnout</h3>${eaHist(s.bands, 'Voting locations by turnout')}</div>
    <div><h3 class="fb-h3">Locations led</h3>${ecBars(Object.entries(s.stations_led || {}).sort((a, b) => b[1] - a[1]).map(([p, n]) => ({ label: p, v: n })), v => fmt(v))}</div></div>
    <h3 class="fb-h3">Every location</h3>${ecBars(rows.slice().sort((a, b) => a.turnout - b.turnout).map(x => ({ label: x.name, sub: `${fmt(x.electors)} on the list · ${x.lead || ''} ${ecP(x.lead_share)} · ahead by ${ecP(x.margin, 1)}`, v: x.turnout })), v => ecP(v), 1)}
    <p class="card-note">Elections Alberta's Statement of Vote (2019 boundaries). Election-day ballots over names on the list: advance and other ballots are counted separately, so locations read lower than the division's turnout.</p>`);
}
function ecTurnoutFed(pp, name) {
  const s = (pp || {}).summary;
  if (!s) return '';
  const ways = s.part_by_way || {}, psw = s.party_share_by_way || {};
  const big = Object.keys(psw).filter(p => (psw[p].election_day || 0) >= 0.03 || (psw[p].advance_polls || 0) >= 0.03);
  return ecCard(12, 'Turnout poll by poll, 2025', `Elections Canada's results for every poll in ${esc(name)}`,
    `${ecTiles([['Polls', fmt(s.polls), `${fmt(s.advance_polls)} advance polls`], ['Lowest poll', ecP(s.turnout_low), ''], ['Middle poll', ecP(s.turnout_median), ''], ['Highest poll', ecP(s.turnout_high), 'registration at the poll can pass 100%']])}
    <div class="ea-two"><div><h3 class="fb-h3">Polls by turnout</h3>${eaHist(s.bands, 'Polls by turnout')}</div>
      <div><h3 class="fb-h3">When people voted</h3>${ecBars([['Election day', ways.election_day], ['Advance polls', ways.advance_polls], ['Special ballot or mail', ways.special_and_mail]].map(([l, v]) => ({ label: l, v })), v => ecP(v), 1)}</div></div>
    <h3 class="fb-h3">Each party's share, by way of voting</h3>${ecMulti(big.map(p => ({ label: p, vals: [psw[p].election_day, psw[p].advance_polls, psw[p].special_and_mail] })), ['Election day', 'Advance polls', 'Special / mail'], v => ecP(v, 0), 1)}
    <div class="ea-two"><div><h3 class="fb-h3">Lowest-turnout polls</h3>${ecBars((pp.lowest_turnout || []).map(r => ({ label: `Poll ${r.poll}`, sub: `${fmt(r.ballots)} of ${fmt(r.electors)} · led ${r.lead || ''}`, v: r.turnout })), v => ecP(v), 1)}</div>
      <div><h3 class="fb-h3">Closest polls</h3>${ecBars((pp.closest || []).map(r => ({ label: `Poll ${r.poll}`, sub: `${fmt(r.ballots)} votes · ${r.lead || ''} ${ecP(r.lead_share)}`, v: r.margin })), v => ecP(v, 1))}</div></div>
    <p class="card-note">Poll numbers are Elections Canada's; advance polls are numbered in the 600s; special ballots and mail-in votes are counted for the district as a whole. Polls with no votes (merged with another) are left out of the turnout figures.</p>`);
}

// ---- one division or district
function ecRiding(A) {
  const [lvlName, role, word] = ecLevel[A.level], r = A.last || {}, w = A.who || {}, mem = A.member || {};
  const win = (r.candidates || []).find(c => c.elected) || (r.candidates || [])[0] || {};
  const elPerRes = r.electors && w.population_now ? r.electors / w.population_now : null;
  const facts = [];
  if ((A.wards || []).length) facts.push(`Its residents live in ${A.wards.length === 1 ? 'one ward' : `${A.wards.length} wards`}: ${A.wards.map(x => `Ward ${x.ward} (${ecP(x.share)}${ecCouncillor(x.ward) ? `, Councillor ${esc(ecCouncillor(x.ward))}` : ''})`).join(', ')}.`);
  if (A.by_election) facts.push(`The latest result is the by-election of ${esc(elDay(A.last_date))}; the 2023 general election is shown below it.`);
  if (isNum(w.population_now) && isNum(w.population_2021) && w.population_2021) facts.push(`About ${fmt(w.population_now)} residents today against ${fmt(w.population_2021)} at the 2021 Census (${w.population_now >= w.population_2021 ? '+' : ''}${fmt(w.population_now - w.population_2021)})${w.not_in_census ? `; ${fmt(w.not_in_census)} live in communities built since` : ''}.`);
  const head = `<section class="card span-12"><div class="card-head"><div><h2>Know your constituency: ${esc(A.name)}</h2><p class="card-sub">${lvlName} · ${role}: <b>${esc(mem.name || win.name || '')}</b>${mem.caucus ? ` (${esc(mem.caucus)})` : ''}${mem.url ? ` · <a href="${esc(mem.url)}" target="_blank" rel="noopener">profile</a>` : ''}</p></div></div>
    ${ecTiles([['Residents today', fmt(A.residents), w.method || ''], ['Electors on the list', fmt(r.electors), `last election, ${esc(elDay(A.last_date))}`], ['Turnout', ecP(r.turnout, 1), `${fmt(r.ballots || r.total)} ballots`],
      ['Winner\'s share', ecP(win.share, 1), esc(win.name || '')], ['Ahead by', ecP(r.margin_share, 1), `${fmt(r.margin)} votes`], ['Electors per resident', isNum(elPerRes) ? ecP(elPerRes) : '–', 'adult citizens on the list / residents today']])}
    <ul class="el-insights">${facts.map(f => `<li>${f}</li>`).join('')}</ul></section>`;
  const res = ecCard(6, `Last result${A.by_election ? ' (by-election)' : ''}`, `${esc(elDay(A.last_date))}: share of the vote`, ecRace(r) + (A.general ? `<h3 class="fb-h3">2023 general election</h3>${ecRace(A.general)}` : ''));
  const math = ecCard(6, 'The arithmetic of the last result', 'What separated first and second, against the electors who stayed home', ecMath(r, w, elPerRes));
  const turn = A.level === 'provincial' ? ecTurnoutProv(A.stations, A.name) : ecTurnoutFed(A.polls, A.name);
  const wards = (A.wards || []).length ? ecCard(6, `Wards in this ${word}`, 'Share of its residents in each ward', ecBars(A.wards.map(x => ({ label: `Ward ${x.ward}`, sub: ecCouncillor(x.ward) ? `Councillor ${ecCouncillor(x.ward)} · ${fmt(x.residents)} residents` : `${fmt(x.residents)} residents`, v: x.share })), v => ecP(v), 1)) : '';
  const mayor = (A.mayor || []).length ? ecCard(6, 'How it voted for mayor, 2025', 'Estimated from the wards it overlaps, weighted by residents', ecMulti(A.mayor.map(x => ({ label: x.name, vals: [x.area, x.calgary] })), [A.name, 'Calgary'], v => ecP(v, 1))) : '';
  return head + res + math + ecWhoCards(w, A.name) + turn + wards + mayor + ecReferendum(A.referendum, A.name) + ecCommunities(w)
    + `<section class="card span-12"><p class="card-note">${esc(ecAreas().note || '')}</p></section>`;
}

// ---- every seat side by side (all of Calgary)
function ecAllSeats(level) {
  const L = ecAreas()[level] || {}, [lvlName, role] = ecLevel[level];
  const rows = Object.values(L).sort((a, b) => ((a.last || {}).margin_share || 9) - ((b.last || {}).margin_share || 9));
  if (!rows.length) return '<section class="card span-12"><p class="card-note">These figures appear after the next refresh of the election results.</p></section>';
  return ecCard(12, `Every ${lvlName.toLowerCase()} in Calgary`, 'Closest result first. Pick one above for its full picture.',
    `${ecBars(rows.map(a => ({ label: a.name, sub: `${role} ${(a.member || {}).name || ''} · turnout ${ecP((a.last || {}).turnout)}`, v: (a.last || {}).margin_share })), v => ecP(v, 1))}
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">${level === 'provincial' ? 'Division' : 'District'}</th><th scope="col">${role}</th><th class="num" scope="col">Residents today</th><th class="num" scope="col">Electors</th><th class="num" scope="col">Turnout</th><th class="num" scope="col">Winner's share</th><th class="num" scope="col">Votes between 1st and 2nd</th><th class="num" scope="col">Swing to tie</th><th class="num" scope="col">65 and over</th><th class="num" scope="col">Under 20</th></tr></thead>
    <tbody>${rows.map(a => { const r = a.last || {}, w = a.who || {}, c = (r.candidates || [])[0] || {}; return `<tr><th scope="row"><button type="button" class="link-btn" data-ecsel="${level[0]}:${esc(a.name)}">${esc(a.name)}</button></th><td>${esc((a.member || {}).name || c.name || '')}</td><td class="num">${fmt(a.residents)}</td><td class="num">${fmt(r.electors)}</td><td class="num">${ecP(r.turnout)}</td><td class="num">${ecP(c.share, 1)}</td><td class="num">${fmt((r.math || {}).gap_votes)}</td><td class="num">${isNum((r.math || {}).swing_to_flip) ? fmt(r.math.swing_to_flip * 100, 1) + ' pts' : '–'}</td><td class="num">${ecP(w.age65)}</td><td class="num">${ecP(w.under20)}</td></tr>`; }).join('')}</tbody></table></div>`);
}

// the picker: whose constituency
function ecPicker() {
  const key = ecKey(), A = ecAreas(), p = Object.keys(A.provincial || {}), f = Object.keys(A.federal || {});
  if (isCity()) {
    const lvl = key === 'all' ? 'all' : key[0].toLowerCase();
    const names = lvl === 'p' ? p : lvl === 'f' ? f : [];
    return `<div class="ec-pick span-12"><span class="ec-pick-l">Whose constituency</span><div class="seg small" role="radiogroup" aria-label="Level">
      ${[['all', 'Councillors: all 14 wards'], ['P', `MLAs: ${p.length} divisions`], ['F', `MPs: ${f.length} districts`]].map(([k, t]) => `<button type="button" role="radio" aria-checked="${lvl === k.toLowerCase() || (k === 'all' && lvl === 'all')}" data-ecsel="${k}">${t}</button>`).join('')}</div>
      ${names.length ? `<label class="sr-only" for="ec-name">${lvl === 'p' ? 'Electoral division' : 'Electoral district'}</label><select id="ec-name" class="select"><option value="${lvl.toUpperCase()}">All side by side</option>${names.map(n => `<option value="${lvl}:${esc(n)}" ${key === `${lvl}:${n}` ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>` : ''}
      <span class="muted small">Pick a ward at the top for a councillor's ward.</span></div>`;
  }
  const btn = (k, t, s) => `<button type="button" role="radio" aria-checked="${key === k}" data-ecsel="${esc(k)}">${esc(t)}<small>${esc(s)}</small></button>`;
  return `<div class="ec-pick span-12"><span class="ec-pick-l">Whose constituency</span><div class="seg small ec-seg" role="radiogroup" aria-label="Constituency">
    ${btn('ward', W(), `Councillor ${ecCouncillor(SCOPE)}`)}
    ${p.map(n => btn(`p:${n}`, n, `MLA ${((A.provincial[n].member) || {}).name || ''}`)).join('')}
    ${f.map(n => btn(`f:${n}`, n, `MP ${((A.federal[n].member) || {}).name || ''}`)).join('')}</div></div>`;
}

// the view for the Election Control Room's "Know your constituency" (null: the ward or all-wards view of elections.js)
function ecView() {
  const key = ecKey();
  if (key === 'P' || key === 'F') return ecPicker() + ecAllSeats(key === 'P' ? 'provincial' : 'federal');
  const A = ecArea(key);
  return A ? ecPicker() + ecRiding(A) : null;
}
function ecBind(root, rerender) {
  root.querySelectorAll('[data-ecsel]').forEach(b => b.addEventListener('click', () => { ecKey(); ecSel.key = b.dataset.ecsel; const y = window.scrollY; Promise.resolve(rerender()).then(() => window.scrollTo(0, y)); }));
  const s = root.querySelector('#ec-name');
  if (s) s.addEventListener('change', () => { ecSel.key = s.value; const y = window.scrollY; Promise.resolve(rerender()).then(() => window.scrollTo(0, y)); });
}
window.ecView = ecView;
