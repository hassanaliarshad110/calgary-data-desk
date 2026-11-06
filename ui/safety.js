/* Calgary Data Desk: Canada's safest cities by Statistics Canada's Crime Severity Index, Calgary picked out, this year
   and last. safety_rank.py builds the figures; methods.py (topic "safest_cities") explains them. */
'use strict';

let SR = null, srQ = '', srProv = '';
async function loadSafety() {
  if (SR) return SR;
  try { const r = await (await api()).get_safety_rank(); if (r && r.ok && r.data) SR = r.data; } catch (e) { /* shown below */ }
  return SR;
}
const srIs = (x, c) => !!(x && c && x.name === c.name && x.prov === c.prov);
const srN = (v, d = 1) => isNum(v) ? fmt(v, d) : '–';
function srMove(c) {
  if (!isNum(c.rank_prev)) return '<span class="sr-mv">new</span>';
  const m = c.rank_prev - c.rank;
  return m === 0 ? '<span class="sr-mv">same</span>' : `<span class="sr-mv ${m > 0 ? 'up' : 'down'}" title="${m > 0 ? 'Up' : 'Down'} ${Math.abs(m)} places from #${c.rank_prev}">${m > 0 ? '▲' : '▼'} ${Math.abs(m)}</span>`;
}
function srRow(c, cal) {
  return `<tr class="${cal ? 'sr-cal' : ''}"><td class="num"><b>${c.rank}</b></td><td>${srMove(c)}</td><th scope="row">${esc(c.name)}</th><td>${esc(c.prov)}</td><td>${esc(c.police)}</td><td class="num">${fmt(c.population)}</td>
    <td class="sr-barcell"><span class="sr-bar"><i style="width:${Math.min(100, (c.csi || 0) / 200 * 100)}%"></i></span><b>${srN(c.csi)}</b></td><td class="num">${srN(c.csi_prev)}</td><td class="num">${isNum(c.rank_prev) ? '#' + c.rank_prev : '–'}</td><td class="num">${srN(c.violent)}</td></tr>`;
}
function srTable(rows, cal) {
  return `<div class="table-wrap sr-wrap"><table class="data sr-table"><thead><tr><th scope="col" class="num">Rank</th><th scope="col">Since last year</th><th scope="col">City</th><th scope="col">Prov.</th><th scope="col">Policed by</th><th scope="col" class="num">Population</th><th scope="col">Crime Severity Index</th><th scope="col" class="num">Last year's index</th><th scope="col" class="num">Last year's rank</th><th scope="col" class="num">Violent index</th></tr></thead>
    <tbody>${rows.map(x => srRow(x, srIs(x, cal))).join('')}${cal && cal.rank && !rows.some(x => srIs(x, cal)) ? `<tr class="sr-gap"><td colspan="10">…</td></tr>${srRow(cal, true)}` : ''}</tbody></table></div>`;
}

async function renderSafety() {
  const body = $('#sr-body'); if (!body) return;
  if (!SR) body.innerHTML = '<section class="card span-12"><p class="muted">Reading the ranking…</p></section>';
  await loadSafety();
  if (!SR) { body.innerHTML = '<section class="card span-12"><p>The ranking is not on the website yet. It appears after the next refresh.</p></section>'; return; }
  const d = SR, c = d.calgary || {}, m = d.calgary_cma || {};
  const chg = isNum(c.csi) && isNum(c.csi_prev) && c.csi_prev ? (c.csi - c.csi_prev) / c.csi_prev * 100 : null;
  const better = (d.cities || []).filter(x => isNum(x.csi) && isNum(x.csi_prev) && x.csi_prev && (x.csi - x.csi_prev) / x.csi_prev * 100 < (chg || 0)).length;
  const moved = isNum(c.rank_prev) ? c.rank_prev - c.rank : null;
  const why = isNum(moved) && isNum(chg) ? (moved < 0 && chg < 0 ? `Calgary's index fell ${fmt(Math.abs(chg), 1)}%, but ${fmt(better)} cities fell faster, so it moved down ${Math.abs(moved)} places.`
    : moved > 0 && chg > 0 ? `Calgary's index rose ${fmt(chg, 1)}%, but less than in other cities, so it moved up ${moved} places.`
    : moved === 0 ? `Calgary held its place; its index ${chg < 0 ? 'fell' : 'rose'} ${fmt(Math.abs(chg), 1)}%.`
    : `Calgary's index ${chg < 0 ? 'fell' : 'rose'} ${fmt(Math.abs(chg), 1)}% and it moved ${moved > 0 ? 'up' : 'down'} ${Math.abs(moved)} places.`) : '';
  const large = (d.cities || []).filter(x => x.rank_large).sort((a, b) => a.rank_large - b.rank_large);
  const hero = `<section class="el-cr span-12"><div class="el-cr-top"><div><div class="el-cr-kicker">Statistics Canada · Crime Severity Index ${d.year}</div><h2 class="el-cr-title">Canada's safest cities</h2>
      <div class="el-cr-sub">Every city of ${fmt(d.min_population)} people or more, by police-reported crime weighted by how serious it is. Lower is safer. ${d.year} against ${d.prev_year}.</div></div></div>
    <div class="el-cr-kpis">
      <div class="el-kpi"><div class="el-kpi-l">Calgary among ${fmt(d.cities_ranked)} cities</div><div class="el-kpi-n">#${c.rank || '–'}</div><div class="el-hero-sub">${d.prev_year}: #${c.rank_prev || '–'} of ${fmt(d.cities_ranked_prev)}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Among ${fmt(d.large_ranked)} cities of 100,000+</div><div class="el-kpi-n">#${c.rank_large || '–'}</div><div class="el-hero-sub">${d.prev_year}: #${c.rank_large_prev || '–'}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Calgary's index</div><div class="el-kpi-n">${srN(c.csi)}</div><div class="el-hero-sub">${d.prev_year}: ${srN(c.csi_prev)} (${isNum(chg) ? (chg > 0 ? '+' : '') + fmt(chg, 1) + '%' : '–'})</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Violent crime index</div><div class="el-kpi-n">${srN(c.violent)}</div><div class="el-hero-sub">${d.prev_year}: ${srN(c.violent_prev)}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Metro area among ${fmt((d.cmas || []).length)}</div><div class="el-kpi-n">#${m.rank || '–'}</div><div class="el-hero-sub">${d.prev_year}: #${m.rank_prev || '–'} · index ${srN(m.csi)}</div></div>
      <div class="el-kpi"><div class="el-kpi-l">Canada</div><div class="el-kpi-n">${srN(d.canada)}</div><div class="el-hero-sub">${d.prev_year}: ${srN(d.canada_prev)}</div></div>
    </div></section>`;
  const calCard = `<section class="card span-12 sr-calcard"><div class="card-head"><div><h2>Where Calgary stands</h2><p class="card-sub">${esc(why)} Calgary's police service clears ${srN(c.cleared, 0)}% of crime by weighted clearance rate.</p></div></div>
    ${srTable([c].filter(x => x.rank), c)}</section>`;
  const provs = [...new Set((d.cities || []).map(x => x.prov))].sort();
  const q = srQ.trim().toLowerCase();
  const found = q || srProv ? (d.cities || []).filter(x => (!q || x.name.toLowerCase().includes(q)) && (!srProv || x.prov === srProv)) : null;
  const top = `<section class="card span-12"><div class="card-head"><div><h2>The 50 safest cities, ${d.year}</h2><p class="card-sub">Rank 1 has the lowest Crime Severity Index. Calgary is shown after the list at its own place.</p></div>
      <div class="card-tools sr-tools"><label class="sr-only" for="sr-q">Find a city</label><input id="sr-q" type="search" placeholder="Find any city" value="${esc(srQ)}">
      <label class="sr-only" for="sr-prov">Province</label><select id="sr-prov"><option value="">All provinces</option>${provs.map(p => `<option ${p === srProv ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select></div></div>
    ${found ? `<p class="card-sub">${fmt(found.length)} of ${fmt(d.cities_ranked)} cities</p>${srTable(found, c)}` : srTable(d.top50 || [], c)}</section>`;
  const big = `<section class="card span-6"><div class="card-head"><div><h2>Cities of 100,000 or more</h2><p class="card-sub">Lowest index first; Calgary highlighted</p></div></div>
    ${ecBars(large.map(x => ({ label: `${x.rank_large}. ${x.name}`, sub: `${x.prov} · last year #${x.rank_large_prev || '–'}`, v: x.csi, on: srIs(x, c) })), v => srN(v))}</section>`;
  const cma = `<section class="card span-6"><div class="card-head"><div><h2>Metropolitan areas</h2><p class="card-sub">The city and the towns around it together (census metropolitan areas)</p></div></div>
    ${ecBars((d.cmas || []).map(x => ({ label: `${x.rank}. ${x.name}`, sub: `last year #${x.rank_prev || '–'} · ${srN(x.csi_prev)}`, v: x.csi, on: x.name.startsWith('Calgary') })), v => srN(v))}</section>`;
  body.innerHTML = hero + calCard + top + big + cma
    + `<section class="card span-12"><p class="card-note">${esc(d.how || '')} Sources: ${(d.sources || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher)}: ${esc(s.title)}</a>`).join('; ')}. <button type="button" class="link-btn small" data-method="safest_cities">How this is ranked</button></p></section>`;
  const inp = $('#sr-q');
  if (inp) { let t; inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { srQ = inp.value; const p = inp.selectionStart; renderSafety().then(() => { const n = $('#sr-q'); if (n) { n.focus(); n.setSelectionRange(p, p); } }); }, 250); }); }
  const ps = $('#sr-prov'); if (ps) ps.addEventListener('change', () => { srProv = ps.value; renderSafety(); });
}
window.renderSafety = renderSafety;
