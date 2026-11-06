/* Calgary Insight: Civic Accountability, a section of the Election Data Centre. Eight pages: the manifestos, promise
   against reality, each representative's documented record, voting records, government commitments, budgets and
   projects, the history of every assessment, and the method. Commitments are researched by hand with a source for every
   one (accountability/commitments.json); official records are read at every refresh (accountability.py). Nothing is
   rated without evidence, and the same rules apply to every party, person and government. */
'use strict';

let CA = null, CAR = null, caPage = 'promises', caLevel = '', caType = '', caStatus = '', caOpen = null;
const CA_PAGES = [['manifesto', 'Manifesto Tracker', '📜'], ['promises', 'Promise vs Reality', '⚖️'], ['reps', 'Representative Performance', '👥'], ['records', 'Legislative & Voting Records', '🗳️'],
  ['gov', 'Government Commitments', '🏛️'], ['budget', 'Budget & Project Delivery', '🏗️'], ['history', 'Accountability History', '🕒'], ['method', 'Methodology & Evidence', '🔎']];
const CA_LEVEL = { municipal: 'City of Calgary', provincial: 'Alberta', federal: 'Canada' };
const CA_TYPE = { candidate: 'Candidate promise', party: 'Party promise', government: 'Government commitment' };
const CA_TONE = { 'Delivered': 'good', 'Delivered late': 'good', 'On track': 'good', 'In progress': 'mid', 'Partly delivered': 'mid', 'Stalled': 'bad', 'Not started': 'bad', 'Broken': 'bad', 'Not yet assessed': 'none' };

async function loadCivic() {
  if (!CA) { try { const r = await fetch('accountability/commitments.json', { cache: 'no-cache' }); if (r.ok) CA = await r.json(); } catch (e) { /* shown below */ } }
  if (!CAR) { try { const r = await (await api()).get_accountability(); if (r && r.ok) CAR = r.data; } catch (e) { /* the records are optional */ } }
}
const caBadge = s => `<span class="ca-status ${CA_TONE[s] || 'none'}">${esc(s)}</span>`;
const caSrc = e => e.url && e.url !== '#elections' ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.source || 'Source')}</a>` : e.url === '#elections' ? `<button type="button" class="link-btn" data-caelsub="results">${esc(e.source)}</button>` : esc(e.source || '');
const caDate = d => { if (!d) return ''; const [y, m, dd] = String(d).split('-'); const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; return dd ? `${M[+m - 1]} ${+dd}, ${y}` : m ? `${M[+m - 1]} ${y}` : y; };
function caFilters(list) {
  const sel = (id, v, opts) => `<select id="${id}" class="select">${opts.map(([k, t]) => `<option value="${k}" ${k === v ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
  return `<div class="card-tools sr-tools">${sel('ca-level', caLevel, [['', 'Every government'], ...Object.entries(CA_LEVEL)])}${sel('ca-type', caType, [['', 'Every kind'], ...Object.entries(CA_TYPE)])}${list ? sel('ca-status', caStatus, [['', 'Every status'], ...Object.keys(CA.statuses || {}).map(s => [s, s])]) : ''}</div>`;
}
const caKeep = c => (!caLevel || c.level === caLevel) && (!caType || c.type === caType) && (!caStatus || c.status === caStatus);
function caCard(c) {
  const open = caOpen === c.id;
  const doc = (CA.documents || []).find(d => d.id === c.doc);
  return `<article class="ca-item${open ? ' is-open' : ''}" id="ca-${c.id}">
    <button type="button" class="ca-head" data-caopen="${c.id}" aria-expanded="${open}"><span class="ca-tags"><span class="ca-tag lvl-${c.level}">${esc(CA_LEVEL[c.level] || c.level)}</span><span class="ca-tag">${esc(CA_TYPE[c.type] || c.type)}</span></span>
      <span class="ca-title">${esc(c.title)}</span>${caBadge(c.status)}</button>
    <div class="ca-sub">${esc(c.who)}${c.made ? ` · committed ${esc(caDate(c.made))}` : ''}${c.expected ? ` · timeline: ${esc(c.expected.charAt(0).toLowerCase() + c.expected.slice(1))}` : ''}${c.missed ? ' · <b class="ca-missed">deadline missed</b>' : ''}${c.disputed ? ' · <b class="ca-disp">disputed</b>' : ''}</div>
    ${open ? `<div class="ca-body"><p><b>Where it stands.</b> ${esc(c.progress || '')}</p>${c.missed ? `<p><b>Deadline.</b> ${esc(c.missed)}</p>` : ''}
      ${c.disputed ? `<p class="ca-disputed"><b>Disputed.</b> ${esc(c.disputed)}${c.disputed_url ? ` <a href="${esc(c.disputed_url)}" target="_blank" rel="noopener">Read the other view</a>` : ''}</p>` : ''}
      ${c.funding ? `<p><b>Money.</b> Promised: ${esc(c.funding.promised || '–')}. Allocated: ${esc(c.funding.allocated || '–')}. Spent: ${esc(c.funding.spent || '–')}.</p>` : ''}
      <p><b>Evidence.</b></p><ul class="ca-ev">${(c.evidence || []).map(e => `<li><span class="muted">${esc(caDate(e.date))}</span> ${esc(e.text)}: ${caSrc(e)}</li>`).join('')}</ul>
      ${doc ? `<p class="card-note">From: ${esc(doc.title)} · ${esc(doc.who)}. <a href="${esc(doc.url)}" target="_blank" rel="noopener">Source document</a></p>` : ''}
      <div class="ca-actions">${(c.data || []).map(d => caLink(d)).join('')}<button type="button" class="btn small" data-ask="${esc(caAsk(c))}">Check the latest evidence with Data Genie</button></div></div>` : ''}</article>`;
}
const caAsk = c => `What is the latest evidence on this commitment: "${c.title}" (${c.who})? Our status is "${c.status}", last checked ${caDate(CA.checked)}. Check official sources and news since then, say whether the status should change, and cite the sources.`;
function caLink(d) {
  const L = { development: ['dashboard', 'Building and development figures'], infra: ['infra', 'Infrastructure condition'], budget: ['budget', 'City budget'], fedbudget: ['fedbudget', 'Federal Budget 2026'], elections: ['elections', 'Referendum results'], safety: ['safety', 'Crime and safety'] }[d];
  return L ? `<button type="button" class="btn small" data-cago="${L[0]}">${esc(L[1])}</button>` : '';
}

// ---- the pages
function caManifesto() {
  const docs = (CA.documents || []).filter(d => (!caLevel || d.level === caLevel) && (!caType || d.type === caType));
  return `<section class="card span-12"><div class="card-head"><div><h2>Manifesto Tracker</h2><p class="card-sub">Party platforms and candidate commitments for the elections that chose Calgary's City council, its MLAs and its MPs, with the promises tracked from each</p></div>${caFilters(false)}</div>
    <div class="ca-docs">${docs.map(d => { const items = (CA.commitments || []).filter(c => c.doc === d.id);
      return `<div class="ca-doc"><div class="ca-tags"><span class="ca-tag lvl-${d.level}">${esc(CA_LEVEL[d.level])}</span><span class="ca-tag">${esc(CA_TYPE[d.type])}</span></div><h3>${esc(d.title)}</h3><p class="ca-sub">${esc(d.who)} · published ${esc(caDate(d.date))}</p>
        <p class="card-sub">${esc(d.note || '')}</p><p><a href="${esc(d.url)}" target="_blank" rel="noopener">Original source</a></p>
        ${items.length ? `<ul class="ca-mini">${items.map(c => `<li><button type="button" class="ca-plink" data-cajump="${c.id}">${esc(c.title)}</button> ${caBadge(c.status)}</li>`).join('')}</ul>` : '<p class="muted small">No promises from this document tracked yet.</p>'}</div>`; }).join('')}</div>
    <p class="card-note">Promises of parties and candidates who did not win office are listed for the record but not rated: they had no power to deliver them.</p></section>`;
}
function caPromises() {
  const list = (CA.commitments || []).filter(caKeep);
  const count = s => list.filter(c => c.status === s).length;
  const tones = ['Delivered', 'Delivered late', 'On track', 'In progress', 'Partly delivered', 'Stalled', 'Not started', 'Broken', 'Not yet assessed'].filter(count);
  return `<section class="card span-12"><div class="card-head"><div><h2>Promise vs Reality</h2><p class="card-sub">Each commitment: what was promised and when, when it was due, what has happened, the evidence and where it stands. Tap one to see the evidence.</p></div>${caFilters(true)}</div>
    <div class="ca-sum">${tones.map(s => `<button type="button" class="ca-sumi" data-castatus="${esc(s)}">${caBadge(s)}<b>${count(s)}</b></button>`).join('')}</div>
    <div class="ca-list">${list.map(caCard).join('') || '<p class="muted">Nothing matches these filters.</p>'}</div></section>`;
}
function caMatch(list, name) {   // a member's record by last name, e.g. "Raj Dhaliwal" and "Rajdeep Dhaliwal"
  const last = String(name || '').trim().split(/\s+/).pop().toLowerCase();
  return Object.entries(list || {}).find(([k]) => k.toLowerCase().split(/[\s.]+/).pop() === last);
}
function caReps() {
  const M = (EL && EL.municipal) || {}, P = (EL && EL.provincial) || {}, F = (EL && EL.federal) || {}, E = (D && D.elections) || {};
  const city = isCity(), ward = city ? 0 : SCOPE;
  const cv = (CAR && CAR.council) || {}, hoc = (CAR && CAR.hoc) || {}, bills = ((CAR && CAR.bills) || {}).calgary || [];
  const nDiv = (hoc.divisions || []).length;
  const rows = [];
  const mayor = M.mayor && M.mayor.candidates[0].name;
  const council = (who, office, area) => { const m = caMatch(cv.members, who); const r = m && m[1];
    rows.push({ office, who, area,
      ind: r ? `${fmt(r.votes)} recorded votes (${fmt(r.for)} for, ${fmt(r.against)} against${r.absent ? `, ${fmt(r.absent)} absent` : ''}) from ${caDate(cv.from)} to ${caDate(cv.to)}` : 'No recorded votes found under this name' }); };
  if (mayor) council(mayor, 'Mayor', 'All of Calgary');
  (city ? Object.keys(M.councillors || {}).sort((a, b) => a - b) : [String(ward)]).forEach(w => { const r = (M.councillors || {})[w]; if (r) council(r.candidates[0].name, `Councillor, Ward ${w}`, `Ward ${w}`); });
  const mine = lvl => city ? Object.keys((EL[lvl] || {}).general || {}).sort() : (((E[lvl] || {}).ridings) || []).map(x => x.riding);
  mine('provincial').forEach(n => { const m = (P.members || {})[n] || {};
    rows.push({ office: `MLA, ${n}`, who: m.name || '', party: m.caucus, area: n,
      ind: 'Votes not published as open data' }); });
  mine('federal').forEach(n => { const m = (F.members || {})[n] || {}; const h = (hoc.mps || {})[n]; const b = bills.filter(x => x.riding === n);
    rows.push({ office: `MP, ${n}`, who: m.name || (h && h.name) || '', party: m.caucus || (h && h.caucus), area: n,
      ind: h ? `Voted in ${fmt(h.recorded)} of ${fmt(nDiv)} recorded divisions this Parliament (${fmt(h.yea)} yea, ${fmt(h.nay)} nay, ${fmt(h.paired)} paired)${b.length ? `; sponsored ${b.length} bill${b.length > 1 ? 's' : ''}` : ''}` : 'Votes not read at this refresh' }); });
  const promises = name => { if (!name) return []; const n = String(name).replace(/\s*\([^)]*\)\s*/g, ' ').trim(), last = n.split(/\s+/).pop();
    const re = new RegExp(`\\b${last.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?!\\s*\\d)`, 'i');
    return (CA.commitments || []).filter(c => String(c.who || '').toLowerCase().includes(n.toLowerCase()) || (last.length > 3 && re.test(String(c.who || '').replace(/\(Ward \d+\)/g, '')))); };
  const LV = [['City council', 'Mayor and councillors set City bylaws, the City budget and property tax, and represent residents on City services.', r => /^(Mayor|Councillor)/.test(r.office)],
    ['Alberta Legislature', 'MLAs make provincial laws (health, schools, policing, the powers of cities) and approve the provincial budget. The Legislature publishes bills and Hansard, the record of debates, but not members\' votes as open data, so votes are not counted here.', r => /^MLA/.test(r.office)],
    ['House of Commons', 'MPs make federal laws (immigration, criminal law, income tax, transfers to provinces) and approve federal spending.', r => /^MP/.test(r.office)]];
  const table = rs => `<div class="table-wrap ca-repw"><table class="data ca-reps"><thead><tr><th scope="col">Office</th><th scope="col">Member</th><th scope="col">Documented record</th><th scope="col">Commitments tracked</th></tr></thead>
    <tbody>${rs.map(r => { const p = promises(r.who); return `<tr><th scope="row">${esc(r.office)}</th><td>${esc(r.who)}${r.party ? `<div class="muted small">${esc(r.party)}</div>` : ''}</td><td class="wrap">${esc(r.ind)}</td><td class="wrap ca-pcell">${p.length ? p.map(c => `<div><button type="button" class="ca-plink" data-cajump="${c.id}">${esc(c.title)}</button> ${caBadge(c.status)}</div>`).join('') : '<span class="muted">None tracked yet</span>'}</td></tr>`; }).join('')}</tbody></table></div>`;
  return `<section class="card span-12"><div class="card-head"><div><h2>Representative Performance: ${esc(W())}</h2><p class="card-sub">Everyone elected for ${esc(W())}: what their office is responsible for, the commitments they made, and what official records document. Pick a ward at the top to see its members only.</p></div></div>
    ${LV.map(([h, resp, f]) => { const rs = rows.filter(f); return rs.length ? `<h3 class="ca-h3">${esc(h)}</h3><p class="card-sub">${esc(resp)}</p>${table(rs)}` : ''; }).join('')}
    <p class="card-note">Voting counts are not a grade: most votes are unanimous, and members also work in committees and with residents. Paired: an MP absent by agreement with one from another party, so the result is unchanged. For what has happened in ${esc(W())} over the council's term, see Budget & Project Delivery.</p></section>`;
}
const caRes = r => { const t = String(r || ''); return /carried|agreed/i.test(t) ? (/agreed/i.test(t) ? 'Agreed to' : 'Carried') : /lost|defeat|negatived/i.test(t) ? (/negatived/i.test(t) ? 'Negatived' : 'Lost') : t; };
function caRecords() {
  const cv = (CAR && CAR.council) || {}, hoc = (CAR && CAR.hoc) || {}, bills = ((CAR && CAR.bills) || {}).calgary || [];
  const M = (EL && EL.municipal) || {};   // the elected council only, mayor first; committees also record citizen members' votes
  const elected = [M.mayor && M.mayor.candidates[0].name, ...Object.keys(M.councillors || {}).sort((a, b) => a - b).map(w => M.councillors[w].candidates[0].name)].filter(Boolean);
  const names = elected.map(n => (caMatch(cv.members, n) || [])[0]).filter(Boolean);
  const div = (cv.divided || []).slice(0, 40);
  const council = `<section class="card span-12"><div class="card-head"><div><h2>City council: divided votes</h2><p class="card-sub">${fmt(cv.motions || 0)} motions with recorded votes from ${esc(caDate(cv.from))} to ${esc(caDate(cv.to))}; ${fmt(cv.divided_n || 0)} were not unanimous. How each member voted on those:</p></div></div>
    ${div.length ? `<div class="table-wrap ca-votes"><table class="data compact"><thead><tr><th scope="col">Date</th><th scope="col">Meeting</th><th scope="col">Motion</th><th scope="col">Result</th>${names.map(n => `<th scope="col" class="ca-vn" title="${esc(n)}">${esc(n.split(/\s+/).pop())}</th>`).join('')}</tr></thead>
      <tbody>${div.map(m => `<tr><td>${esc(m.date)}</td><td class="wrap">${esc(m.meeting || '')}</td><td class="wrap ca-motion">${m.text.length > 220 ? `<details class="ca-why"><summary>${esc(m.text.slice(0, 200).replace(/\s+\S*$/, ''))}…</summary><p>${esc(m.text)}</p></details>` : esc(m.text)}</td><td>${esc(caRes(m.result))} <small class="muted">${m.for}–${m.against}</small></td>${names.map(n => { const v = (m.votes || {})[n] || ''; return `<td class="ca-v ${/^(yes|for)/i.test(v) ? 'y' : /^(no|against)/i.test(v) ? 'n' : ''}">${esc(v ? (/^(yes|for)/i.test(v) ? 'Yes' : /^(no|against)/i.test(v) ? 'No' : v) : '·')}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="muted">The council votes were not read at this refresh.</p>'}
    <p class="card-note">From the City's open data on council and committee votes; the full minutes are in the City's meeting portal. Committee participation is shown where the City records committee votes.</p></section>`;
  const mps = Object.entries(hoc.mps || {}).sort((a, b) => a[0].localeCompare(b[0]));
  const lasts = mps.map(([, m]) => m.name.split(/\s+/).pop());
  const mpLab = n => { const w = n.split(/\s+/), l = w[w.length - 1]; return lasts.filter(x => x === l).length > 1 ? `${w[0][0]}. ${l}` : w.length > 2 ? w.slice(1).join(' ') : l; };
  const ds = (hoc.divisions || []).slice(0, 25);
  const commons = `<section class="card span-12"><div class="card-head"><div><h2>House of Commons: how Calgary's MPs voted</h2><p class="card-sub">The ${fmt(ds.length)} most recent of ${fmt((hoc.divisions || []).length)} recorded divisions this Parliament</p></div></div>
    ${ds.length ? `<div class="table-wrap ca-votes"><table class="data compact"><thead><tr><th scope="col">Date</th><th scope="col">Vote on</th><th scope="col">Result</th>${mps.map(([r, m]) => `<th scope="col" class="ca-vn" title="${esc(m.name)}, ${esc(r)}">${esc(mpLab(m.name))}</th>`).join('')}</tr></thead>
      <tbody>${ds.map(d => `<tr><td>${esc(d.date)}</td><td class="wrap ca-motion">${esc(d.subject || '')}</td><td>${esc(caRes(d.result))} <small class="muted">${d.yeas}–${d.nays}</small></td>${mps.map(([, m]) => { const v = (m.votes || {})[d.n] || ''; return `<td class="ca-v ${v === 'Yea' ? 'y' : v === 'Nay' ? 'n' : ''}">${esc(v || '·')}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="muted">The House of Commons votes were not read at this refresh.</p>'}
    <p class="card-note">· means no vote was recorded for that MP (absent, or not an MP at the time). From the House of Commons' published votes.</p></section>`;
  const billsCard = `<section class="card span-6"><div class="card-head"><div><h2>Bills sponsored by Calgary MPs</h2><p class="card-sub">This Parliament, from LEGISinfo</p></div></div>
    ${bills.length ? `<ul class="ca-mini">${bills.map(b => `<li><a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.bill)}</a> ${esc(b.title || '')} <span class="muted small">· ${esc(b.sponsor || '')} · ${esc(b.stage || b.status || '')}</span></li>`).join('')}</ul>` : '<p class="muted">No bill sponsored by a Calgary MP so far this Parliament. Government bills are sponsored by ministers; none of them represents Calgary.</p>'}</section>`;
  const ab = `<section class="card span-6"><div class="card-head"><div><h2>Alberta Legislature</h2><p class="card-sub">Bills and the record of debates</p></div></div>
    <p class="card-sub">The Legislative Assembly publishes bills, their status and Hansard, but not members' votes as open data, so votes are not counted here.</p>
    <p><a href="https://www.assembly.ab.ca/assembly-business/bills/bill-status" target="_blank" rel="noopener">Bill status</a> · <a href="https://www.assembly.ab.ca/assembly-business/transcripts/hansard-transcripts" target="_blank" rel="noopener">Hansard</a> · <a href="https://www.assembly.ab.ca/members/members-of-the-legislative-assembly" target="_blank" rel="noopener">Members</a></p></section>`;
  return council + commons + billsCard + ab;
}
function caGov() {
  const list = (CA.commitments || []).filter(c => c.type === 'government' && caKeep(c));
  const m = (CAR && CAR.city_measures) || null;
  const rows = (m && m.rows) || [];
  const cols = rows.length ? Object.keys(rows[0]).filter(k => /^_?\d{4}|^q\d_\d{4}/.test(k)).sort((a, b) => (a.match(/\d{4}/)[0] + a).localeCompare(b.match(/\d{4}/)[0] + b)) : [];
  const lab = k => k.replace(/^q(\d)_(\d{4})_value$/, 'Q$1 $2').replace(/^_/, '').replace(/_value$/, '');
  return `<section class="card span-12"><div class="card-head"><div><h2>Government Commitments</h2><p class="card-sub">Formal commitments by the City, the Province and Canada that affect Calgary: announced, approved and being delivered</p></div>${caFilters(true)}</div>
    <div class="ca-list">${list.map(caCard).join('') || '<p class="muted">Nothing matches these filters.</p>'}</div></section>
    <section class="card span-12"><div class="card-head"><div><h2>The City's own measures against its targets</h2><p class="card-sub">${m ? `${esc(m.name.replace(/ - Performance Measures$/, ''))}: the measures the City reports to council for its priorities, with its targets. Many targets are for the end of 2026, so a mid-year figure is part of the year.` : 'Not read at this refresh'}</p></div></div>
    ${rows.length ? `<div class="table-wrap ca-repw"><table class="data ca-meas"><thead><tr><th scope="col">Measure</th>${cols.map(k => `<th scope="col" class="num">${esc(lab(k))}</th>`).join('')}<th scope="col">Target</th></tr></thead>
      <tbody>${[...new Set(rows.map(r => r.council_priority_area || ''))].map(g => `<tr class="ca-grp"><th scope="rowgroup" colspan="${cols.length + 2}">${esc(g)}</th></tr>${rows.filter(r => (r.council_priority_area || '') === g).map(r => `<tr><th scope="row" class="wrap">${esc(r.performance_measure_name || '')}${r.story_behind_the_number ? `<details class="ca-why"><summary>The City's explanation</summary><p>${esc(r.story_behind_the_number)}</p></details>` : ''}</th>${cols.map(k => `<td class="num">${esc(r[k] || '–')}</td>`).join('')}<td class="wrap">${esc(r.target && r.target !== 'N/A' ? r.target : '–')}</td></tr>`).join('')}`).join('')}</tbody></table></div>` : ''}
    <p class="card-note">From the City of Calgary's progress reports to council (open data). Targets and explanations are the City's own.</p></section>`;
}
function caBudget() {
  const list = (CA.commitments || []).filter(c => c.funding && caKeep(c));
  const term = typeof elTerm === 'function' ? elTerm() : '';
  return `<section class="card span-12"><div class="card-head"><div><h2>Budget & Project Delivery</h2><p class="card-sub">Promised against allocated funding, spending where it is published, and where each project stands</p></div>${caFilters(false)}</div>
    <div class="table-wrap ca-repw"><table class="data ca-budget"><thead><tr><th scope="col">Project</th><th scope="col">Promised</th><th scope="col">Allocated</th><th scope="col">Spent</th><th scope="col">Due</th><th scope="col">Status</th></tr></thead>
    <tbody>${list.map(c => `<tr><th scope="row" class="wrap"><button type="button" class="ca-plink" data-cajump="${c.id}">${esc(c.title)}</button></th><td class="wrap">${esc(c.funding.promised || '–')}</td><td class="wrap">${esc(c.funding.allocated || '–')}</td><td class="wrap">${esc(c.funding.spent || '–')}</td><td>${esc(c.expected || '')}</td><td>${caBadge(c.status)}</td></tr>`).join('')}</tbody></table></div>
    <p class="card-note">For the City's budget line by line, see City budget; for roads and pipes, Infrastructure condition.</p></section>
    ${term}`;
}
function caHistory() {
  const ev = [];
  (CA.commitments || []).filter(caKeep).forEach(c => (c.history || []).forEach(h => ev.push({ ...h, c })));
  ev.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return `<section class="card span-12"><div class="card-head"><div><h2>Accountability History</h2><p class="card-sub">Every change in a commitment's status, newest first, with what changed and why. Disputed assessments are marked.</p></div>${caFilters(false)}</div>
    <ol class="ca-hist">${ev.map(e => `<li><span class="ca-hd">${esc(caDate(e.date))}</span><span>${caBadge(e.status === 'Made' ? 'Not yet assessed' : e.status === 'Disputed' ? 'Partly delivered' : e.status).replace(/>[^<]*</, `>${esc(e.status)}<`)}</span>
      <span><button type="button" class="ca-plink" data-cajump="${e.c.id}">${esc(e.c.title)}</button>${e.note ? ` <span class="muted">${esc(e.note)}</span>` : ''}</span></li>`).join('')}</ol>
    <p class="card-note">Last full check of every commitment: ${esc(caDate(CA.checked))}. Official voting and progress records refresh every day.</p></section>`;
}
function caMethod() {
  return `<section class="card span-12"><div class="card-head"><div><h2>Methodology & Evidence</h2><p class="card-sub">How commitments are chosen, checked and rated</p></div></div>
    <div class="ca-method">
      <h3>What is tracked</h3><p>Promises made by parties and candidates that formed government or won office (City council, the Alberta government and the Government of Canada), and formal commitments by those governments that affect Calgary. Each is labelled as a party promise, a candidate promise or a government commitment. Promises of those who did not win office are listed, not rated.</p>
      <h3>What counts as evidence</h3><p>An official record first: a law and its Royal Assent, a council decision, a budget document, a government or City report, a contract or a completed project. News reports are used for dates and figures they quote from those records. Opinion is never evidence; where a rating is disputed, the other view is linked.</p>
      <h3>Statuses</h3><ul>${Object.entries(CA.statuses || {}).map(([k, v]) => `<li>${caBadge(k)} ${esc(v)}</li>`).join('')}</ul>
      <h3>Verification</h3><p>Every commitment carries its source document and date, the evidence for its current status with links, and a history of every change. Commitments are re-checked at least each quarter and when news breaks; official voting and progress records are read again every day.</p>
      <h3>Fairness</h3><p>The same rules for every party, person and government. A status describes a commitment, not a person; voting counts describe attendance and positions, not quality of work.</p>
      <h3>Corrections and limitations</h3><p>Coverage starts with the largest, best-documented commitments and grows. The Alberta Legislature does not publish members' votes as open data. City council votes in open data begin ${esc(caDate((CAR && CAR.council && CAR.council.from) || ''))}. To report an error or suggest a commitment, use the contact form on Invest in Calgary or the developer's contact.</p>
      <h3>Sources read every day</h3><p>${((CAR && CAR.sources) || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher)}: ${esc(s.title)}</a>`).join(' · ')}</p></div></section>`;
}

async function renderCivic() {
  const body = $('#ca-body'); if (!body) return;
  if (!CA) body.innerHTML = '<section class="card span-12"><p class="muted">Reading the commitments…</p></section>';
  await loadCivic();
  if (!CA) { body.innerHTML = '<section class="card span-12"><p>The commitments could not be read just now.</p></section>'; return; }
  const all = CA.commitments || [];
  const done = all.filter(c => /^Delivered/.test(c.status)).length, track = all.filter(c => ['On track', 'In progress'].includes(c.status)).length;
  const hero = `<section class="el-cr span-12 ca-hero"><div class="el-cr-top"><div><div class="el-cr-kicker">Election Data Centre · Civic Accountability</div><h2 class="el-cr-title">Promises, records and results</h2>
      <div class="el-cr-sub">What Calgary's governments and elected members committed to, what the official record shows, and the evidence for every status. City, Alberta and Canada.</div></div></div>
    <div class="el-cr-kpis"><div class="el-kpi"><div class="el-kpi-l">Commitments tracked</div><div class="el-kpi-n">${fmt(all.length)}</div><div class="el-hero-sub">from ${fmt((CA.documents || []).length)} platforms and government records</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Delivered</div><div class="el-kpi-n">${fmt(done)}</div><div class="el-hero-sub">${fmt(all.filter(c => c.status === 'Delivered late').length)} of them late</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Under way</div><div class="el-kpi-n">${fmt(track)}</div><div class="el-hero-sub">on track or in progress</div></div>
      ${CAR && CAR.council ? `<div class="el-kpi"><div class="el-kpi-l">Council votes recorded</div><div class="el-kpi-n">${fmt(((CAR || {}).council || {}).motions || 0)}</div><div class="el-hero-sub">${fmt(((CAR || {}).council || {}).divided_n || 0)} not unanimous</div></div>` : ''}
      ${CAR && CAR.hoc ? `<div class="el-kpi"><div class="el-kpi-l">Commons divisions</div><div class="el-kpi-n">${fmt((((CAR || {}).hoc || {}).divisions || []).length)}</div><div class="el-hero-sub">with every Calgary MP's vote</div></div>` : ''}
      <div class="el-kpi"><div class="el-kpi-l">Last checked</div><div class="el-kpi-n ca-small">${esc(caDate(CA.checked))}</div><div class="el-hero-sub">records refresh daily</div></div></div></section>`;
  const nav = `<nav class="ca-nav span-12" aria-label="Civic Accountability pages">${CA_PAGES.map(([k, t, i]) => `<button type="button" class="ca-navb${k === caPage ? ' is-on' : ''}" data-capage="${k}" ${k === caPage ? 'aria-current="page"' : ''}><span aria-hidden="true">${i}</span>${esc(t)}</button>`).join('')}</nav>`;
  const page = { manifesto: caManifesto, promises: caPromises, reps: caReps, records: caRecords, gov: caGov, budget: caBudget, history: caHistory, method: caMethod }[caPage] || caPromises;
  body.innerHTML = hero + nav + page();
  const re = () => { const y = window.scrollY; renderCivic().then(() => window.scrollTo(0, y)); };
  body.querySelectorAll('[data-capage]').forEach(b => b.addEventListener('click', () => { caPage = b.dataset.capage; caOpen = null; renderCivic(); }));
  body.querySelectorAll('[data-caopen]').forEach(b => b.addEventListener('click', () => { caOpen = caOpen === b.dataset.caopen ? null : b.dataset.caopen; re(); }));
  body.querySelectorAll('[data-cajump]').forEach(b => b.addEventListener('click', () => { caOpen = b.dataset.cajump; caPage = 'promises'; caLevel = caType = caStatus = ''; renderCivic().then(() => { const el = document.getElementById('ca-' + caOpen); if (el) el.scrollIntoView({ block: 'start' }); }); }));
  body.querySelectorAll('[data-castatus]').forEach(b => b.addEventListener('click', () => { caStatus = caStatus === b.dataset.castatus ? '' : b.dataset.castatus; re(); }));
  body.querySelectorAll('[data-cago]').forEach(b => b.addEventListener('click', () => show(b.dataset.cago)));
  body.querySelectorAll('[data-caelsub]').forEach(b => b.addEventListener('click', () => { elSub = b.dataset.caelsub; renderElections(); }));
  [['ca-level', v => { caLevel = v; }], ['ca-type', v => { caType = v; }], ['ca-status', v => { caStatus = v; }]].forEach(([id, f]) => { const s = $('#' + id); if (s) s.addEventListener('change', () => { f(s.value); re(); }); });
}
window.renderCivic = renderCivic;
