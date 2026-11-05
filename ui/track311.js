// Open issues: look up one 311 request by its number, and how quickly each City department closes requests.
// "Closed" is the department closing the request in its system; the open data does not say whether the problem was fixed.
let t311Res = null, t311Q = '', t311Busy = false, deptView = 'dept';
const T311_CAVEAT = 'What a status cannot tell you: "Closed" means the department closed the request in its system. It does not '
  + 'confirm the problem was fixed: the work may be scheduled for later, the request may have been passed to another City '
  + 'system or team, or it may be outside the City\'s responsibility. The open data has no notes on what was done, who '
  + 'did it, or when the department took it on; it shows the department responsible, the status and the dates.';
const t311Comm = x => { const c = x.comm_code && typeof commName === 'function' ? commName(x.comm_code) : '';
  return c && c !== x.comm_code ? c : (x.comm_name || '').toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase()); };
const t311Days = (a, b) => (a && b) ? Math.max(0, Math.round((new Date(b.slice(0, 10)) - new Date(a.slice(0, 10))) / 86400000)) : null;

function t311Card() {
  const r = t311Res;
  let res = '';
  if (t311Busy) res = '<p class="muted">Looking it up in the City\'s 311 open data…</p>';
  else if (r && r.error) res = `<p class="t311-err">${esc(r.error)}</p>`;
  else if (r && r.rows && !r.rows.length) res = `<p class="t311-err">No request numbered ${esc(r.id)} in the City's 311 open data. Check the number (it looks like 26-01234567). The City publishes its file once a day, a day behind, so a request made today will not be there yet.</p>`;
  else if (r && r.rows) res = r.rows.map(x => {
    const st = x.status_description || '', closed = /^Closed/.test(st), opened = x.requested_date, done = x.closed_date;
    const age = closed ? t311Days(opened, done) : t311Days(opened, new Date().toISOString());
    const DT = D && D.dept_times, typ = DT && (DT.types || []).find(t => t.type === x.service_name && t.dept === x.agency_responsible);
    const dep = DT && (DT.city || []).find(t => t.dept === x.agency_responsible);
    const typical = typ ? `For ${esc(x.service_name)} in ${esc(W())} over the last 12 months: ${fmt(typ.within7 / typ.n * 100, 0)}% closed within 7 days, ${fmt(typ.open / typ.n * 100, 0)}% still open${isNum(typ.avg_days) ? `, ${fmt(typ.avg_days, 1)} days on average to close` : ''}.`
      : dep ? `${esc(x.agency_responsible)} across Calgary over the last 12 months: ${fmt(dep.within7 / dep.n * 100, 0)}% closed within 7 days, ${fmt(dep.open / dep.n * 100, 0)}% still open.` : '';
    const steps = [['Made', opened, `Channel: ${x.source || 'not stated'}`, true], ['Department responsible', null, x.agency_responsible || 'Not stated', true],
      ['Last update', x.updated_date, '', !!x.updated_date], [closed ? 'Closed in the City\'s system' : (/^Duplicate/.test(st) ? st : 'Still open'), closed ? done : null, closed ? (age ? `${fmt(age)} day${age === 1 ? '' : 's'} after it was made` : 'the day it was made') : `open ${fmt(age)} day${age === 1 ? '' : 's'} so far`, closed]];
    return `<div class="t311-res">
      <div class="t311-head"><div><div class="t311-id mono">${esc(x.service_request_id)}</div><div class="t311-type">${esc(typeof niceType === 'function' ? niceType(x.service_name) : x.service_name)}</div>
        <div class="muted small">${esc([x.address, t311Comm(x)].filter(Boolean).join(' · '))}</div></div>
        <span class="t311-st ${closed ? 'closed' : 'open'}">${esc(st || 'Unknown')}</span></div>
      <ol class="t311-steps">${steps.map(([t, d, n, on]) => `<li class="${on ? 'on' : ''}"><b>${esc(t)}</b>${d ? ` <span class="mono">${esc(String(d).slice(0, 10))}</span>` : ''}${n ? `<small>${esc(n)}</small>` : ''}</li>`).join('')}</ol>
      ${typical ? `<p class="t311-typ">${typical}</p>` : ''}
      ${closed ? '<p class="t311-warn"><b>Closed is not the same as fixed.</b> If the problem is still there, call 311 or use the 311 Calgary app with this number and ask what was done.</p>' : ''}
    </div>`;
  }).join('');
  return `<div class="card-head"><div><h2>Track a request</h2><p class="card-sub">Type a 311 request number to see which department has it, its status and its dates</p></div></div>
    <form class="t311-form" id="t311-form"><input id="t311-q" type="search" inputmode="text" autocomplete="off" placeholder="Request number, e.g. 26-01234567" value="${esc(t311Q)}" aria-label="311 request number">
      <button class="btn primary" type="submit">Look up</button></form>${res}
    <p class="card-note">${esc(T311_CAVEAT)} Request numbers name no one. Source: City of Calgary 311 Service Requests (iahh-g8bj), published daily.</p>`;
}

function deptCard() {
  const DT = D && D.dept_times;
  if (!DT || DT.error) return `<div class="card-head"><div><h2>How quickly departments close requests</h2></div></div><p class="muted">Not read this time${DT && DT.error ? `: ${esc(DT.error)}` : ''}.</p>`;
  const city = Object.fromEntries((DT.city || []).map(r => [r.dept, r]));
  const rows = (deptView === 'dept' ? DT.area : (DT.types || []).slice(0, 25)).filter(r => r.n >= 5);
  const pct = (a, n) => n ? a / n * 100 : 0;
  const bar = r => `<span class="dt-bar" title="Closed within 7 days ${fmt(pct(r.within7, r.n), 0)}%, 8 to 30 days ${fmt(pct(r.within30, r.n), 0)}%, 31 to 90 days ${fmt(pct(r.within90, r.n), 0)}%, over 90 days ${fmt(pct(r.over90, r.n), 0)}%, still open ${fmt(pct(r.open, r.n), 0)}%">${[['within7', 'a'], ['within30', 'b'], ['within90', 'c'], ['over90', 'd'], ['open', 'o']].map(([k, c]) => `<i class="${c}" style="width:${pct(r[k], r.n)}%"></i>`).join('')}</span>`;
  const head = `<tr><th scope="col">${deptView === 'dept' ? 'Department' : 'Request type'}</th><th scope="col" class="num">Requests</th><th scope="col">Closed within 7 days · 30 · 90 · later · still open</th><th scope="col" class="num">Within 7 days</th><th scope="col" class="num">Still open</th><th scope="col" class="num">Average days to close</th>${!isCity() && deptView === 'dept' ? '<th scope="col" class="num">Calgary: within 7 days</th>' : ''}</tr>`;
  const body = rows.map(r => `<tr><th scope="row">${esc(deptView === 'dept' ? r.dept : (typeof niceType === 'function' ? niceType(r.type) : r.type))}${deptView === 'dept' ? '' : `<small>${esc(r.dept)}</small>`}</th><td class="num">${fmt(r.n)}</td><td>${bar(r)}</td>
    <td class="num">${fmt(pct(r.within7, r.n), 0)}%</td><td class="num">${fmt(pct(r.open, r.n), 0)}%</td><td class="num">${isNum(r.avg_days) ? fmt(r.avg_days, 1) : '–'}</td>
    ${!isCity() && deptView === 'dept' ? `<td class="num">${city[r.dept] ? fmt(pct(city[r.dept].within7, city[r.dept].n), 0) + '%' : '–'}</td>` : ''}</tr>`).join('');
  return `<div class="card-head"><div><h2>How quickly departments close requests</h2><p class="card-sub">311 requests made in ${esc(W())} between ${esc(longDate(DT.start))} and ${esc(longDate(DT.end))} (duplicates left out), by how long the department took to close them</p></div>
      <div class="seg small" role="radiogroup" aria-label="Group by">${[['dept', 'Departments'], ['type', 'Request types']].map(([k, t]) => `<button type="button" role="radio" aria-checked="${deptView === k}" data-deptview="${k}">${t}</button>`).join('')}</div></div>
    <div class="dt-key"><span><i class="a"></i>within 7 days</span><span><i class="b"></i>8 to 30</span><span><i class="c"></i>31 to 90</span><span><i class="d"></i>over 90</span><span><i class="o"></i>still open</span></div>
    <div class="table-wrap"><table class="data dt-table"><thead>${head}</thead><tbody>${body || '<tr><td colspan="7" class="empty">No requests in this period.</td></tr>'}</tbody></table></div>
    <p class="card-note">Days to close = the closed date minus the date the request was made; the average counts closed requests only. Requests made near the end of the period have had less time to close, so "still open" is higher for recent work. ${esc(T311_CAVEAT)}</p>`;
}

async function t311Lookup(id) {
  t311Q = (id || '').trim();
  if (!/^[A-Za-z0-9-]{4,20}$/.test(t311Q)) { t311Res = { error: 'Type the request number as the City gave it, e.g. 26-01234567.' }; renderTrack311(); return; }
  t311Busy = true; renderTrack311();
  try { const r = await (await api()).track_311(t311Q); t311Res = r && r.ok ? { id: t311Q, rows: r.rows || [] } : { error: (r && r.error) || 'The City\'s 311 data could not be read just now.' }; }
  catch (e) { t311Res = { error: 'The City\'s 311 data could not be read just now.' }; }
  t311Busy = false; renderTrack311();
}

function renderTrack311() {
  const tc = $('#track-card'), dc = $('#dept-card');
  if (tc) {
    tc.innerHTML = t311Card();
    $('#t311-form').addEventListener('submit', e => { e.preventDefault(); t311Lookup($('#t311-q').value); });
  }
  if (dc) {
    dc.innerHTML = deptCard();
    dc.querySelectorAll('[data-deptview]').forEach(b => b.addEventListener('click', () => { deptView = b.dataset.deptview; renderTrack311(); }));
  }
}
let t311D = null;
// called whenever Open issues is drawn: redraw the two cards only when new data has arrived (keeps a typed number)
function syncTrack311() { if (t311D !== D || !$('#track-card').innerHTML) { t311D = D; renderTrack311(); } }
window.renderTrack311 = renderTrack311; window.syncTrack311 = syncTrack311;
