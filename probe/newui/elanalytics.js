// Election Analytics: micro-level election detail, deep analysis and arithmetic models of how a candidate can win: who lives there
// (2021 Census by community), every provincial voting location and federal poll, and an analyst to ask questions.
// The screens are open to everyone; asking the analyst needs the access code on the website (as Data Genie does).
let eaBusy = false, eaThread = [], eaProvSel = 0, eaFedSel = 0;
const EA_PCT = (v, d = 0) => isNum(v) ? fmt(v * 100, d) + '%' : '–';
const eaCol = p => (typeof elColor === 'function' ? elColor(p || 'Other') : '#64748B');

// age pyramid: men left, women right, 5-year bands (85 and over together)
function eaPyramid(w) {
  if (!w || !w.population) return '<p class="muted">No Census figures for this area.</p>';
  const lab = w.bands.slice(0, 17).concat(['85+']);
  const fold = a => a.slice(0, 17).concat([a.slice(17).reduce((x, y) => x + y, 0)]);
  const m = fold(w.men), f = fold(w.women), max = Math.max(...m, ...f, 1);
  const W = 520, rowH = 15, top = 18, mid = W / 2, half = mid - 44;
  let g = `<text x="${mid - 50}" y="12" class="ea-ax" text-anchor="end">Men</text><text x="${mid + 50}" y="12" class="ea-ax">Women</text>`;
  lab.slice().reverse().forEach((b, k) => {
    const i = lab.length - 1 - k, y = top + k * rowH, wm = m[i] / max * half, wf = f[i] / max * half;
    g += `<rect x="${mid - 36 - wm}" y="${y}" width="${wm}" height="${rowH - 3}" fill="#0369A1" rx="2"><title>Men ${b}: ${fmt(m[i])}</title></rect>
      <rect x="${mid + 36}" y="${y}" width="${wf}" height="${rowH - 3}" fill="#B45309" rx="2"><title>Women ${b}: ${fmt(f[i])}</title></rect>
      <text x="${mid}" y="${y + rowH - 5}" class="ea-ax" text-anchor="middle">${esc(b)}</text>`;
  });
  return `<svg class="ea-pyr" viewBox="0 0 ${W} ${top + lab.length * rowH + 4}" role="img" aria-label="Population by age and sex, 2021 Census">${g}</svg>`;
}
function eaBars(items, fmtFn, max) {
  max = max || Math.max(...items.map(x => x.v || 0), 1e-9);
  return `<div class="fb-bars">${items.map(x => `<div class="fb-bar"><span class="fb-bar-l">${esc(x.label)}${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</span><span class="fb-bar-t"><i style="width:${(x.v || 0) / max * 100}%;${x.color ? `background:${x.color}` : ''}"></i></span><span class="fb-bar-v">${esc(fmtFn(x.v))}</span></div>`).join('')}</div>`;
}
function eaHist(b, title) {
  if (!b) return '';
  const max = Math.max(...b.counts, 1);
  return `<div class="ea-hist" role="img" aria-label="${esc(title)}">${b.labels.map((l, i) => `<div class="ea-hcol"><span class="ea-hn">${b.counts[i] || ''}</span><i style="height:${b.counts[i] / max * 100}%"></i><span class="ea-hl">${esc(l)}</span></div>`).join('')}</div>`;
}

function eaWho(M) {
  const w = M.who || {}, P = (D && D.profile) || {};
  const groups = (P.groups || []).map(g => g.list).filter(l => l && (l.rows || []).length);
  const tiles = [['Residents today', fmt(w.population_now || w.population)], ['Under 20', EA_PCT(w.under20)], ['20 to 64', EA_PCT(w.age20_64)], ['65 and over', EA_PCT(w.age65)],
    ['Households (estimate)', fmt(w.households)], ['People per household', isNum(w.avg_hh) ? fmt(w.avg_hh, 2) : '–'], ['Families with children', EA_PCT(w.families_kids)], ['One-parent families', EA_PCT(w.one_parent)],
    ['In the labour force (15+)', EA_PCT(w.participation)], ['Unemployment', EA_PCT(w.unemployment, 1)], ['Self-employed', EA_PCT(w.self_employed)], ['Never married (15+)', EA_PCT(w.never_married)]];
  return `<section class="card span-6"><div class="card-head"><div><h2>Age and sex</h2><p class="card-sub">Residents today by 5-year age band: each community's 2021 Census mix scaled to its residents now${w.method ? ` (${esc(w.method)})` : ''}</p></div></div>${eaPyramid(w)}</section>
    <section class="card span-6"><div class="card-head"><div><h2>Households and work</h2><p class="card-sub">Today's residents with each community's 2021 Census mix; rates are the Census's${w.not_in_census ? `; ${fmt(w.not_in_census)} residents live in communities built since 2021, with no Census profile yet` : ''}</p></div></div>
      <div class="fb-kpis">${tiles.map(([l, n]) => `<div class="fb-kpi"><div class="fb-kpi-l">${esc(l)}</div><div class="fb-kpi-n">${esc(n)}</div></div>`).join('')}</div>
      ${(w.top_occupations || []).length ? `<h3 class="fb-h3">Most common occupations</h3>${eaBars(w.top_occupations.map(([k, v]) => ({ label: k, v })), v => fmt(v))}` : ''}
      ${groups.map(l => `<h3 class="fb-h3">${esc(l.title)}</h3>${eaBars(l.rows.slice(0, 6).map(r => ({ label: r[0], sub: fmt(r[1]) + ' people', v: r[2] })), v => fmt(v) + '%', 100)}${l.note ? `<p class="card-note">${esc(l.note)}</p>` : ''}`).join('')}</section>`;
}
function eaCommunities(M) {
  const rows = ((M.who || {}).communities || []);
  if (!rows.length) return '';
  const C = Object.fromEntries(((D && D.communities) || []).map(c => [c.code, c]));
  return `<section class="card span-12"><div class="card-head"><div><h2>Community by community</h2><p class="card-sub">Who lives in each community (2021 Census) and what residents raise through 311 now</p></div></div>
    <div class="table-wrap"><table class="data ea-ctable"><thead><tr><th scope="col">Community</th><th class="num" scope="col">Residents now</th><th class="num" scope="col">Share of area</th><th class="num" scope="col">Under 20</th><th class="num" scope="col">20–64</th><th class="num" scope="col">65+</th><th class="num" scope="col">Per household</th><th class="num" scope="col">Families with children</th><th class="num" scope="col">Unemployment</th><th scope="col">Top occupation</th><th scope="col">Most common open 311 issue</th></tr></thead>
    <tbody>${rows.map(r => { const c = C[r.code] || {}; return `<tr><th scope="row">${esc(c.name || r.name || r.code)}</th><td class="num">${fmt(r.residents)}</td><td class="num">${EA_PCT(r.share, 1)}</td><td class="num">${EA_PCT(r.under20)}</td><td class="num">${EA_PCT(r.age20_64)}</td><td class="num">${EA_PCT(r.age65)}</td><td class="num">${isNum(r.avg_hh) ? fmt(r.avg_hh, 1) : '–'}</td><td class="num">${EA_PCT(r.families_kids)}</td><td class="num">${isNum(r.unemployment) ? fmt(r.unemployment, 0) + '%' : '–'}</td><td>${esc(r.top_occupation || '–')}</td><td>${esc((t => t ? (typeof niceType === 'function' ? niceType(t) : t) : '–')(Array.isArray(c.open_top) ? ((c.open_top.find(t => !/contact us/i.test(t.type || '')) || {}).type || '') : (c.open_top && typeof c.open_top === 'object' ? (c.open_top.type || '') : c.open_top)))}</td></tr>`; }).join('')}</tbody></table></div>
    <p class="card-note">Census figures are for 2021; residents now are the dashboard's count. Unemployment is the Census rate for people 15 and over in the labour force; the 2021 Census was taken in May 2021, during the pandemic.</p></section>`;
}
function eaProvincial(M) {
  const list = (M.provincial || []).filter(x => x.stations);
  if (!list.length) return '';
  const x = list[Math.min(eaProvSel, list.length - 1)], st = (x.stations || []).filter(s => isNum(s.turnout));
  const sum = x.summary || {};
  const bars = st.slice().sort((a, b) => a.turnout - b.turnout).map(s => ({ label: s.name || s.loc, sub: `${s.type} · ${fmt(s.electors)} on the list · ${s.lead || ''} ${EA_PCT(s.lead_share)}`, v: s.turnout, color: eaCol(s.lead) }));
  return `<section class="card span-12"><div class="card-head"><div><h2>Provincial voting locations, 2023</h2><p class="card-sub">Every election-day location in the electoral divisions covering ${esc(W())}, by turnout; bar colour = the party that led there</p></div>
      ${list.length > 1 ? `<div class="seg small" role="radiogroup" aria-label="Electoral division">${list.map((d, i) => `<button type="button" role="radio" aria-checked="${i === eaProvSel}" data-eaprov="${i}">${esc(d.riding)} (${EA_PCT(d.share)})</button>`).join('')}</div>` : ''}</div>
    <div class="fb-kpis">${[['Share of the area\'s residents', EA_PCT(x.share)], ['Division turnout', EA_PCT(x.turnout, 1)], ['Locations', fmt(sum.election_day_stations)], ['Lowest location', EA_PCT(sum.turnout_low)], ['Middle location', EA_PCT(sum.turnout_median)], ['Highest location', EA_PCT(sum.turnout_high)]].map(([l, n]) => `<div class="fb-kpi"><div class="fb-kpi-l">${esc(l)}</div><div class="fb-kpi-n">${esc(n)}</div></div>`).join('')}</div>
    <div class="ea-key">${Object.entries(sum.stations_led || {}).map(([p, n]) => `<span><i style="background:${eaCol(p)}"></i>${esc(p)} led ${fmt(n)}</span>`).join('')}</div>
    ${eaBars(bars, v => EA_PCT(v), 1)}
    <p class="card-note">Elections Alberta's Statement of Vote (2019 boundaries). A location serves the voting areas listed for it, which may reach beyond the ward. Turnout here is election-day ballots over names on the list; advance and other ballots are counted separately, so locations read lower than the division's overall turnout${sum.other_locations ? ` (${fmt(sum.other_locations)} other locations)` : ''}.</p></section>`;
}
function eaFederal(M) {
  const list = (M.federal || []).filter(x => x.summary);
  if (!list.length) return '';
  const x = list[Math.min(eaFedSel, list.length - 1)], s = x.summary || {};
  const ways = s.part_by_way || {}, psw = s.party_share_by_way || {};
  const big = Object.keys(psw).filter(p => (psw[p].election_day || 0) >= 0.03 || (psw[p].advance_polls || 0) >= 0.03);
  const wayRows = big.map(p => `<tr><th scope="row"><i class="ea-dot" style="background:${eaCol(p)}"></i>${esc(p)}</th><td class="num">${EA_PCT(psw[p].election_day, 1)}</td><td class="num">${EA_PCT(psw[p].advance_polls, 1)}</td><td class="num">${EA_PCT(psw[p].special_and_mail, 1)}</td><td class="num">${fmt((s.polls_led || {})[p] || 0)}</td></tr>`).join('');
  return `<section class="card span-12"><div class="card-head"><div><h2>Federal polls, 2025</h2><p class="card-sub">Poll by poll in the electoral districts covering ${esc(W())}</p></div>
      ${list.length > 1 ? `<div class="seg small" role="radiogroup" aria-label="Electoral district">${list.map((d, i) => `<button type="button" role="radio" aria-checked="${i === eaFedSel}" data-eafed="${i}">${esc(d.riding)} (${EA_PCT(d.share)})</button>`).join('')}</div>` : ''}</div>
    <div class="fb-kpis">${[['Share of the area\'s residents', EA_PCT(x.share)], ['District turnout', EA_PCT(x.turnout, 1)], ['Polls', fmt(s.polls)], ['Lowest poll', EA_PCT(s.turnout_low)], ['Middle poll', EA_PCT(s.turnout_median)], ['Highest poll', EA_PCT(s.turnout_high)]].map(([l, n]) => `<div class="fb-kpi"><div class="fb-kpi-l">${esc(l)}</div><div class="fb-kpi-n">${esc(n)}</div></div>`).join('')}</div>
    <div class="ea-two"><div><h3 class="fb-h3">Polls by turnout</h3>${eaHist(s.bands, 'Polls by turnout')}</div>
      <div><h3 class="fb-h3">How people voted, and when</h3><p class="muted small">Votes cast on election day ${EA_PCT(ways.election_day)}, at advance polls ${EA_PCT(ways.advance_polls)}, by special ballot or mail ${EA_PCT(ways.special_and_mail)}</p>
        <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Party</th><th class="num" scope="col">Election day</th><th class="num" scope="col">Advance polls</th><th class="num" scope="col">Special / mail</th><th class="num" scope="col">Polls led</th></tr></thead><tbody>${wayRows}</tbody></table></div></div></div>
    <div class="ea-two"><div><h3 class="fb-h3">Lowest-turnout polls</h3><div class="table-wrap"><table class="data"><thead><tr><th scope="col">Poll</th><th class="num" scope="col">Electors</th><th class="num" scope="col">Voted</th><th class="num" scope="col">Turnout</th><th scope="col">Led</th></tr></thead><tbody>${(x.lowest_turnout || []).map(r => `<tr><td>${esc(r.poll)}</td><td class="num">${fmt(r.electors)}</td><td class="num">${fmt(r.ballots)}</td><td class="num">${EA_PCT(r.turnout)}</td><td>${esc(r.lead || '')}</td></tr>`).join('')}</tbody></table></div></div>
      <div><h3 class="fb-h3">Closest polls</h3><div class="table-wrap"><table class="data"><thead><tr><th scope="col">Poll</th><th class="num" scope="col">Votes</th><th scope="col">Led</th><th class="num" scope="col">Ahead by</th></tr></thead><tbody>${(x.closest || []).map(r => `<tr><td>${esc(r.poll)}</td><td class="num">${fmt(r.ballots)}</td><td>${esc(r.lead || '')}</td><td class="num">${EA_PCT(r.margin, 1)}</td></tr>`).join('')}</tbody></table></div></div></div>
    <p class="card-note">Elections Canada's poll-by-poll results. Poll numbers are Elections Canada's; polls cover the whole district, so not all are inside the ward. Advance polls are numbered in the 600s; special ballots and mail-in votes are counted for the district as a whole. Polls with no votes (merged with another poll) are left out of the turnout figures; a poll can pass 100% when people register at the poll on election day.</p></section>`;
}

// ---- the analyst (chat)
const EA_SUGGEST = ['Under what model could a candidate win the next race here? Show the assumptions and the arithmetic', 'Model three turnout scenarios for the next election here: votes needed to win in each', 'Where in this area was turnout lowest, and who lives there?', 'Which age groups are largest here, and how does that compare with Calgary?',
  'How did advance voting differ from election-day voting?', 'Which voting locations were closest between the top two parties?',
  'What do residents raise most through 311, community by community?', 'Build a briefing on this area with the arithmetic of a win'];
function eaLocked() { return !!(window.CDD_AI && window.CDD_AI.unlocked && !window.CDD_AI.unlocked('ea')); }
function eaArea() {
  const key = ecKey(), A = ecArea(key), w = ecWardOf(key);
  return A ? `${A.name} (${ecLevel[A.level][0].toLowerCase()}; ${ecLevel[A.level][1]} ${(A.member || {}).name || ''}; riding="${A.name}")`
    : key === 'W' || w === 0 ? 'all of Calgary' : w ? `Ward ${w}` : (isCity() ? 'all of Calgary' : W());
}
// a finished report: PDF, interactive, Excel, and an audit of it
function eaReportCard(ev) {
  const pdf = ev.pdf || ev.print || (/\.pdf$/i.test(ev.path || '') ? ev.path : null), inter = ev.interactive;
  const p = x => esc(x);
  return `<div class="ea-report"><div><b>${esc(ev.title || ev.name || 'Election report')}</b><small>${[pdf || inter ? 'PDF' : '', inter ? 'interactive report' : '', ev.xlsx ? 'Excel workbook with every calculation' : ''].filter(Boolean).join(' · ')}</small></div>
    <div class="file-actions">${pdf ? `<button class="btn primary" data-eap="${p(pdf)}${/\.html?$/i.test(pdf) ? '#print' : ''}">PDF</button>` : inter ? `<button class="btn primary" data-eap="${p(inter)}#print">PDF</button>` : ''}${inter ? `<button class="btn" data-eap="${p(inter)}">Interactive</button>` : ''}${ev.xlsx ? `<button class="btn" data-eap="${p(ev.xlsx)}">Excel</button>` : ''}${pdf || inter ? `<button class="btn" data-eaaudit="${p(pdf || inter)}">Audit this report</button>` : ''}</div></div>`;
}
function eaChat() {
  const locked = eaLocked();
  const msgs = eaThread.map(m => `<div class="ea-msg ${m.who}">${m.who === 'you' ? esc(m.text) : (m.html || esc(m.text || ''))}${m.cards ? `<div class="ea-cards">${m.cards}</div>` : ''}</div>`).join('');
  return `${window.sampleReport ? sampleReport('ea') : ''}<section class="card span-12 ea-chat"><div class="card-head"><div><h2>Ask the election analyst</h2><p class="card-sub">Micro-level detail, deep analysis and arithmetic models of how a candidate can win in ${esc(eaPlace())}, from every figure on this page and the rest of Calgary Insight. Ask a question for an answer here, or build a full report (PDF, interactive report and an Excel workbook with every calculation) that can be audited.</p></div></div>
    ${locked ? `<div class="web-lock ea-lock"><h3>The election analyst needs its passcode</h3><p>Every chart and table on this page is open to everyone. Asking the analyst needs the Election Analytics passcode, which is separate from the Data Genie one. <b>To get a passcode, contact the developer.</b></p>
      <form id="ea-unlock"><label class="sr-only" for="ea-code">Election Analytics passcode</label><input type="password" id="ea-code" autocomplete="off" placeholder="Election Analytics passcode"><button type="submit" class="btn primary">Unlock</button></form><p class="web-lock-msg" id="ea-lockmsg" role="status"></p></div>`
      : `<div class="ea-thread" id="ea-thread">${msgs || `<div class="ea-suggest">${EA_SUGGEST.map(s => `<button type="button" class="chip" data-easug="${esc(s)}">${esc(s)}</button>`).join('')}</div>`}</div>
      <form class="ea-form" id="ea-form"><textarea id="ea-q" rows="2" placeholder="Ask about turnout, who lives here, voting locations, the arithmetic of a win…" aria-label="Question for the election analyst"></textarea>
        <div class="ea-btns"><button class="btn primary" type="submit" ${eaBusy ? 'disabled' : ''}>${eaBusy ? 'Working…' : 'Ask'}</button><button class="btn" type="button" id="ea-report" ${eaBusy ? 'disabled' : ''} title="A full, auditable report: PDF, interactive report and Excel workbook. Takes 5 to 15 minutes.">Build full report</button></div></form>`}
    <p class="card-note">Answers use official results and the Census, and say which figures are estimates. Projections and win scenarios are mathematical models, with every assumption, the arithmetic and a range, never certainties. The same rigour for any candidate or party; it never suggests targeting or discouraging any group.</p></section>`;
}
function eaCatch(bot, cards) {
  const prevA = window.onAgentEvent, prevS = window.onAnalystEvent;
  const h = ev => {
    if (ev.type === 'step') { bot.text = ev.text + '…'; const t = $('#ea-thread .ea-msg.bot:last-child'); if (t) t.firstChild.textContent = bot.text; }
    else if (ev.type === 'table') cards.push(`<div class="card"><h4>${esc(ev.title)}</h4><div class="table-scroll"><table class="data"><thead><tr>${ev.columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${ev.rows.map(r => `<tr>${r.map(v => `<td>${typeof v === 'number' ? fmt(v, Number.isInteger(v) ? 0 : 1) : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`);
    else if (ev.type === 'chart') cards.push(`<div class="card"><h4>${esc(ev.title)}</h4>${eaBars((ev.labels || []).map((l, i) => ({ label: String(l), v: ((ev.series || [])[0] || { values: [] }).values[i] })), v => fmt(v, Number.isInteger(v) ? 0 : 1))}</div>`);
    else if (ev.type === 'report') cards.unshift(eaReportCard(ev));
  };
  window.onAgentEvent = h; window.onAnalystEvent = h;
  return () => { window.onAgentEvent = prevA; window.onAnalystEvent = prevS; };
}
async function eaAsk(q, full) {
  if (eaBusy || !q.trim()) return;
  eaBusy = true;
  const bot = { who: 'bot', text: full ? 'Planning the report…' : 'Working on it…' };
  eaThread.push({ who: 'you', text: full ? `Full report: ${q}` : q }, bot);
  renderElAnalytics(true);
  const cards = [], done = eaCatch(bot, cards);
  try {
    const a = await api();
    // the strongest model for every Election Analytics answer; a full report goes through the report writer
    const res = full ? await a.election_report(q, eaArea()) : await a.ask(`[Election Analytics] Area: ${eaArea()}. ${q}`, 'audit');
    if (res && res.ok) { bot.html = (window.DOMPurify && window.marked) ? DOMPurify.sanitize(marked.parse(res.text || '')) : esc(res.text || ''); bot.text = ''; if (res.report && !cards.some(c => c.includes('ea-report'))) cards.unshift(eaReportCard(typeof res.report === 'string' ? { pdf: res.report } : res.report)); }
    else bot.text = (res && res.error) || 'The analyst could not answer this time.';
  } catch (e) { bot.text = String(e.message || e); }
  bot.cards = cards.join('');
  done();
  eaBusy = false;
  renderElAnalytics(true);
}
async function eaAudit(path) {
  if (eaBusy) return;
  eaBusy = true;
  const bot = { who: 'bot', text: 'Auditing the report: every figure is worked out again from the data…' };
  eaThread.push({ who: 'you', text: 'Audit this report' }, bot);
  renderElAnalytics(true);
  const prev = window.onAuditEvent;
  window.onAuditEvent = ev => { if (ev.type === 'step') { bot.text = ev.text + '…'; const t = $('#ea-thread .ea-msg.bot:last-child'); if (t) t.firstChild.textContent = bot.text; } else if (prev) prev(ev); };
  try {
    const res = await (await api()).audit_run(path);
    const cp = res && res.corrected ? (typeof res.corrected === 'string' ? res.corrected : (res.corrected.pdf || res.corrected.interactive || '')) : '';
    if (res && res.ok) { bot.text = ''; bot.html = `<p><b>Audit finished.</b> ${esc(res.verdict || '')} ${fmt(res.findings || 0)} finding${res.findings === 1 ? '' : 's'}.</p>`; bot.cards = `<div class="ea-report"><div><b>Audit report</b><small>every finding with the reviewer's decision${cp ? '; a corrected report was made' : ''}</small></div><div class="file-actions">${res.page ? `<button class="btn primary" data-eap="${esc(res.page)}">Open the audit</button>` : ''}${cp ? `<button class="btn" data-eap="${esc(cp)}">Corrected report</button>` : ''}</div></div>`; }
    else bot.text = (res && res.error) || 'The audit could not be finished.';
  } catch (e) { bot.text = String(e.message || e); }
  window.onAuditEvent = prev;
  eaBusy = false;
  renderElAnalytics(true);
}

function eaPlace() { const key = ecKey(), A = ecArea(key), w = ecWardOf(key); return A ? A.name : key === 'W' ? 'all of Calgary' : w ? `Ward ${w}` : W(); }
function eaBindAll(body) {
  body.querySelectorAll('[data-easug]').forEach(b => b.addEventListener('click', () => eaAsk(b.dataset.easug)));
  body.querySelectorAll('[data-eap]').forEach(b => b.addEventListener('click', async () => (await api()).open_path(b.dataset.eap)));
  body.querySelectorAll('[data-eaaudit]').forEach(b => b.addEventListener('click', () => eaAudit(b.dataset.eaaudit)));
  const rb = $('#ea-report');
  if (rb) rb.addEventListener('click', () => { const t = $('#ea-q').value.trim(); eaAsk(t || `A complete election analysis of ${eaPlace()}: who lives here, how it voted, the arithmetic of the last result and at least three models of how a candidate can win the next race`, true); });
  const f = $('#ea-form');
  if (f) { f.addEventListener('submit', e => { e.preventDefault(); const t = $('#ea-q').value; eaAsk(t); });
    $('#ea-q').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); f.requestSubmit(); } }); }
  const u = $('#ea-unlock');
  if (u) u.addEventListener('submit', async e => { e.preventDefault(); const msg = $('#ea-lockmsg'); msg.textContent = 'Checking';
    try { await window.CDD_AI.unlock($('#ea-code').value, 'ea'); renderElAnalytics(true); } catch (err) { msg.textContent = String(err.message || err); } });
  if (typeof ecBind === 'function') ecBind(body, () => renderElAnalytics(true));
  if (typeof elTick === 'function') elTick();
  const th = $('#ea-thread'); if (th) th.scrollTop = th.scrollHeight;
}
// an MLA's division or an MP's district: its own hero, the analyst and the full picture (constituency.js)
function eaRiding(body, A, keepScroll, y) {
  const r = A.last || {}, w = A.who || {}, lv = ecLevel[A.level], m = r.math || {};
  const nx = (typeof EL_NEXT !== 'undefined' ? EL_NEXT : []).filter(([t]) => A.level === 'provincial' ? /alberta|provinc/i.test(t) : /canada|federal/i.test(t));
  const hero = `<section class="el-cr span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Election Analytics · ${esc(lv[0])}</div><h2 class="el-cr-title">${esc(A.name)}</h2><div class="el-cr-sub">${esc(lv[1])}: ${esc((A.member || {}).name || '')}${(A.member || {}).caucus ? ` (${esc(A.member.caucus)})` : ''} · last result ${esc(elDay(A.last_date))}${A.by_election ? ' (by-election)' : ''}</div></div>
      ${nx.length && typeof elCountdown === 'function' ? `<div class="el-cr-counts">${nx.slice(0, 1).map(([t, d]) => `<div class="el-cr-count"><div class="el-cr-kicker">${esc(t)} · ${esc(elDay(d))}</div>${elCountdown(d, true)}</div>`).join('')}</div>` : ''}</div>
    <div class="el-cr-kpis">
      <div class="el-kpi"><div class="el-kpi-l">Residents today</div><div class="el-kpi-n">${fmt(A.residents)}</div><div class="el-hero-sub">${esc(w.method || '')}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Electors on the list</div><div class="el-kpi-n">${fmt(r.electors)}</div><div class="el-hero-sub">turnout ${EA_PCT(r.turnout, 1)}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Votes between 1st and 2nd</div><div class="el-kpi-n">${fmt(m.gap_votes)}</div><div class="el-hero-sub">ahead by ${EA_PCT(r.margin_share, 1)}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Swing that would tie it</div><div class="el-kpi-n">${isNum(m.swing_to_flip) ? fmt(m.swing_to_flip * 100, 1) : '–'}<small> pts</small></div><div class="el-hero-sub">uniform, winner to runner-up</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Did not vote</div><div class="el-kpi-n">${fmt(m.did_not_vote)}</div><div class="el-hero-sub">electors on the list</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Aged 65 and over</div><div class="el-kpi-n">${EA_PCT(w.age65)}</div><div class="el-hero-sub">under 20: ${EA_PCT(w.under20)}</div></div>
    </div></section>`;
  body.innerHTML = ecPicker() + hero + eaChat() + ecRiding(A);
  eaBindAll(body);
  if (keepScroll) window.scrollTo(0, y);
}

async function renderElAnalytics(keepScroll) {
  const body = $('#ea-body'); if (!body) return;
  const y = window.scrollY;
  await ecPrepare();
  const key = ecKey(), RA = ecArea(key);
  if (RA) return eaRiding(body, RA, keepScroll, y);
  if (key === 'P' || key === 'F') { body.innerHTML = ecPicker() + eaChat() + ecAllSeats(key === 'P' ? 'provincial' : 'federal'); eaBindAll(body); if (keepScroll) window.scrollTo(0, y); return; }
  // a ward, or all of Calgary: drawn with that area's own figures, whatever the sidebar shows
  const wk = key === 'W' ? 0 : ecWardOf(key), view = wk === SCOPE ? D : PEEK[`${(D && D.population && D.population.method) || ''}/${wk}`];
  const pick = ecPicker();
  return withView(view || D, view ? wk : SCOPE, () => eaWardBody(body, keepScroll, y, pick));
}
function eaWardBody(body, keepScroll, y, pick) {
  const M = D && D.elections && D.elections.micro;
  const C = (D && D.elections && D.elections.constituency) || {}, cw = ((C.wards || {})[String(SCOPE)]) || {};
  if (!M || M.error) { body.innerHTML = `<section class="card span-12"><p>Election Analytics is not ready for this area yet${M && M.error ? ` (${esc(M.error)})` : ''}. It appears after the next refresh of the election results.</p></section>`; return; }
  const w = M.who || {}, prov = M.provincial || [], fed = M.federal || [];
  const avg = (xs) => { const t = xs.reduce((a, x) => a + (x.share || 0), 0); return t ? xs.reduce((a, x) => a + (x.turnout || 0) * (x.share || 0), 0) / t : null; };
  const nx = (typeof EL_NEXT !== 'undefined' ? EL_NEXT : []);
  const hero = `<section class="el-cr span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Election Analytics</div><h2 class="el-cr-title">${esc(W())}</h2><div class="el-cr-sub">Who lives here, how they voted, and where turnout was low: Census 2021 by community, 2023 provincial voting locations, 2025 federal polls, 2025 council race</div></div>
      ${nx.length && typeof elCountdown === 'function' ? `<div class="el-cr-counts">${nx.slice(0, 1).map(([t, d]) => `<div class="el-cr-count"><div class="el-cr-kicker">${esc(t)} · ${esc(typeof elDay === 'function' ? elDay(d) : d)}</div>${elCountdown(d, true)}</div>`).join('')}</div>` : ''}</div>
    <div class="el-cr-kpis">
      <div class="el-kpi"><div class="el-kpi-l">Residents today</div><div class="el-kpi-n">${fmt(w.population_now || w.population)}</div><div class="el-hero-sub">${w.method ? esc(w.method) + ' · ' : ''}about ${fmt(w.adults20)} aged 20 and over</div></div>
      ${!isCity() && cw.electors_est ? `<div class="el-kpi"><div class="el-kpi-l">Electors (estimate)</div><div class="el-kpi-n">${fmt(cw.electors_est)}</div><div class="el-hero-sub">council turnout 2025 about ${EA_PCT(cw.turnout_est)}</div></div>` : ''}
      <div class="el-kpi"><div class="el-kpi-l">Provincial turnout 2023</div><div class="el-kpi-n">${EA_PCT(avg(prov))}</div><div class="el-hero-sub">divisions covering the area</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Federal turnout 2025</div><div class="el-kpi-n">${EA_PCT(avg(fed))}</div><div class="el-hero-sub">districts covering the area</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Aged 65 and over</div><div class="el-kpi-n">${EA_PCT(w.age65)}</div><div class="el-hero-sub">under 20: ${EA_PCT(w.under20)}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">People per household</div><div class="el-kpi-n">${isNum(w.avg_hh) ? fmt(w.avg_hh, 2) : '–'}</div><div class="el-hero-sub">${EA_PCT(w.big_hh)} of homes have 5 or more</div></div>
    </div></section>`;
  body.innerHTML = pick + hero + eaChat() + eaWho(M) + eaCommunities(M) + (isCity() ? `<section class="card span-12"><p class="muted">Choose a ward at the top to see every voting location and poll in it.</p></section>` : eaProvincial(M) + eaFederal(M))
    + `<section class="card span-12"><p class="card-note">${esc(M.notes || '')} Facts only: nothing here rates, ranks or recommends any candidate, party or campaign. <button type="button" class="link-btn small" data-method="elections">How these are read</button></p></section>`;
  body.querySelectorAll('[data-eaprov]').forEach(b => b.addEventListener('click', () => { eaProvSel = +b.dataset.eaprov; renderElAnalytics(true); }));
  body.querySelectorAll('[data-eafed]').forEach(b => b.addEventListener('click', () => { eaFedSel = +b.dataset.eafed; renderElAnalytics(true); }));
  eaBindAll(body);
  if (keepScroll) window.scrollTo(0, y);
}
window.renderElAnalytics = renderElAnalytics;
document.addEventListener('cdd-unlocked', () => { if ($('#ea-body')) renderElAnalytics(true); });
