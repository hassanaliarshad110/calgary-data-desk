/* Calgary Data Desk: Calgary Capital Markets. Calgary's public companies, from official sources: a company list checked
   by hand (head office city and source for each, capmkt/companies.json) and totals worked out at every refresh from
   TMX's monthly listed-issuer file (capmkt.py). TMX does not allow its file to be redistributed, so only totals are
   shown from it, never one company's figures; a total over fewer than three companies shows a count only. No share
   prices: no source is both open and licensed for publishing them. */
'use strict';

let CMC = null, CMD = null, cmSub = 'overview', cmQ = '', cmEx = '', cmInd = '', cmGrp = 'calgary', cmPage = 0;
const CM_SUBS = [['overview', 'Overview'], ['directory', 'Company directory'], ['industries', 'Industries'], ['activity', 'Market activity'],
  ['performance', 'Company performance'], ['footprint', "Calgary's footprint"], ['history', 'History'], ['method', 'Sources and method']];
async function loadCapMkt() {
  if (!CMC) { try { const r = await fetch('capmkt/companies.json', { cache: 'no-cache' }); if (r.ok) CMC = await r.json(); } catch (e) { /* shown below */ } }
  if (!CMD) { try { const r = await (await api()).get_capmkt(); if (r && r.ok) CMD = r.data; } catch (e) { /* the totals are optional */ } }
}
const cmB = v => isNum(v) ? (v >= 1e12 ? `$${fmt(v / 1e12, 2)} trillion` : v >= 1e9 ? `$${fmt(v / 1e9, v >= 1e11 ? 0 : 1)} billion` : `$${fmt(v / 1e6, 0)} million`) : '–';
const cmPct = v => isNum(v) ? `${fmt(v * 100, 1)}%` : '–';
const cmMonth = d => { if (!d) return ''; const [y, m] = d.split('-'); return `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][+m - 1]} ${y}`; };
const cmT = () => (CMD && CMD.totals) || null;
const cmCos = () => (CMC && CMC.companies) || [];
function cmKpi(label, value, sub, method) {
  return `<div class="el-kpi cm-kpi"><div class="el-kpi-l">${esc(label)}</div><div class="el-kpi-n">${value}</div><div class="el-hero-sub">${esc(sub || '')}</div>${method ? `<details class="cm-how"><summary>How it's counted</summary><p>${esc(method)}</p></details>` : ''}</div>`;
}
function cmBars(rows, valKey, fmtFn) {
  const max = Math.max(1, ...rows.map(r => r[valKey] || 0));
  return `<div class="cm-bars">${rows.map(r => `<div class="cm-bar"><span class="cm-bl">${esc(r.label)}</span><span class="cm-bt"><i style="width:${Math.max(1, (r[valKey] || 0) / max * 100)}%"></i></span><b>${fmtFn(r[valKey], r)}</b></div>`).join('')}</div>`;
}

function cmOverview() {
  const T = cmT(), cos = cmCos(), cal = cos.filter(c => c.group === 'calgary');
  const src = T ? `TMX listed-issuer file, ${cmMonth(T.month)} month-end` : 'TMX file not read at this refresh';
  const C = T ? T.calgary : null, A = T ? T.alberta : null;
  const ind = C ? Object.entries(C.by_industry).map(([k, v]) => ({ label: k, n: v.n, mcap: v.mcap })) : [];
  const size = C ? Object.entries(C.by_size).map(([k, v]) => ({ label: k, n: v })) : [];
  return `<section class="el-cr span-12 cm-hero"><div class="el-cr-top"><div><div class="el-cr-kicker">Calgary Capital Markets</div><h2 class="el-cr-title">Calgary's public companies</h2>
      <div class="el-cr-sub">Companies headquartered in Calgary and listed on Canada's stock exchanges: how many, how much they are worth together, in which industries, and Calgary's place in Canada's public markets. Each head office is checked against the company's own website or filings.</div></div></div>
    <div class="el-cr-kpis">
      ${cmKpi('Calgary-headquartered, TSX', fmt(cal.filter(c => c.exchange === 'TSX').length), `checked by hand; ${fmt(cos.filter(c => c.group === 'unconfirmed').length)} more Alberta companies still to confirm`, 'Companies TMX lists with an Alberta head office, each checked against its own website or filings (a few, where the website blocks automated reading, against Wikipedia, marked). Funds and exchange-traded products are left out. Checked ' + (CMC ? CMC.checked : '') + '.')}
      ${cmKpi('Their total market value', C ? cmB(C.all.mcap) : '–', src, 'The sum of each company\'s market capitalization in TMX\'s monthly file (quoted shares at the month-end price), for the companies confirmed in Calgary. Not a live figure.')}
      ${cmKpi("Share of Canada's listed market value", C ? cmPct(C.share_of_canada_mcap) : '–', 'TSX and TSXV operating companies', 'Calgary companies\' market value over that of every operating company on the TSX and TSXV (funds and exchange-traded products left out), same month.')}
      ${cmKpi('Alberta-headquartered, TSX and TSXV', A ? fmt(A.all.n) : '–', A ? Object.entries(A.by_exchange).map(([k, v]) => `${k} ${fmt(v.n)}`).join(' · ') : '', 'Operating companies TMX lists with an Alberta head office, by exchange. The TMX file gives the province only, not the city.')}
      ${cmKpi('New Alberta listings, last 12 months', A ? fmt(A.new_12m.n) : '–', A ? Object.entries(A.new_12m.by_type).map(([k, v]) => `${k} ${v}`).join(' · ') : '', 'Alberta-headquartered operating companies whose listing date in the TMX file falls in the last 12 months, by how they listed (IPO, qualifying transaction, reverse takeover, graduation from the TSXV and others).')}
      ${cmKpi('Canadian Securities Exchange', 'Not yet', 'no downloadable list of CSE companies found', 'The CSE publishes its listings as web pages only. Calgary companies on the CSE will be added by hand.')}</div></section>
    <section class="card span-6"><div class="card-head"><div><h2>Calgary companies by industry</h2><p class="card-sub">Number of companies; total market value where three or more</p></div></div>
      ${ind.length ? cmBars(ind, 'n', (v, r) => `${fmt(v)}${isNum(r.mcap) ? ` · ${cmB(r.mcap)}` : ''}`) : '<p class="muted">Not read at this refresh.</p>'}</section>
    <section class="card span-6"><div class="card-head"><div><h2>Calgary companies by size</h2><p class="card-sub">Market value at the TMX month-end</p></div></div>
      ${size.length ? cmBars(size, 'n', v => fmt(v)) : '<p class="muted">Not read at this refresh.</p>'}
      <p class="card-note">Bands: large C$10 billion or more; mid C$2 to 10 billion; small C$300 million to 2 billion; micro under C$300 million.</p></section>`;
}
function cmRows() {
  const q = cmQ.trim().toLowerCase();
  return cmCos().filter(c => (!cmGrp || c.group === cmGrp) && (!cmEx || c.exchange === cmEx) && (!cmInd || c.industry === cmInd)
    && (!q || `${c.name} ${c.ticker} ${c.city || ''} ${c.sub || ''}`.toLowerCase().includes(q)));
}
function cmDirectory() {
  const cos = cmCos(), rows = cmRows(), G = (CMC && CMC.groups) || {}, sec = (CMD && CMD.sec) || {}, tc = (CMD && CMD.ticker_check) || {};
  const inds = [...new Set(cos.map(c => c.industry))].sort();
  const per = 50, pages = Math.max(1, Math.ceil(rows.length / per)); cmPage = Math.min(cmPage, pages - 1);
  const sel = (id, v, opts) => `<select id="${id}" class="select">${opts.map(([k, t]) => `<option value="${esc(k)}" ${k === v ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
  return `<section class="card span-12"><div class="card-head"><div><h2>Company directory</h2><p class="card-sub">${esc(CMC ? CMC.coverage : '')} ${fmt(rows.length)} match.</p></div>
      <div class="card-tools sr-tools"><label class="sr-only" for="cm-q">Search</label><input id="cm-q" type="search" placeholder="Name, ticker or city" value="${esc(cmQ)}">
      ${sel('cm-grp', cmGrp, [['', 'Every group'], ...Object.entries(G)])}${sel('cm-ex', cmEx, [['', 'Every exchange'], ['TSX', 'TSX'], ['TSXV', 'TSXV']])}${sel('cm-ind', cmInd, [['', 'Every industry'], ...inds.map(i => [i, i])])}
      <button class="btn" id="cm-csv">Download CSV</button></div></div>
    <div class="table-wrap ca-repw"><table class="data cm-dir"><thead><tr><th scope="col">Company</th><th scope="col">Exchange</th><th scope="col">Head office</th><th scope="col">Industry</th><th scope="col">Filings and links</th></tr></thead>
    <tbody>${rows.slice(cmPage * per, cmPage * per + per).map(c => { const s = sec[c.ticker];
      return `<tr><th scope="row">${esc(c.name)}<div class="muted small">${esc(c.ticker)}${tc[c.ticker] === false ? ' · <span class="cm-warn" title="Not found under this ticker in TMX\'s company directory">ticker to check</span>' : ''}</div></th>
        <td>${esc(c.exchange)}</td><td class="wrap">${esc(c.city || 'Not yet confirmed')}<div class="muted small">${esc(G[c.group] || '')}${c.note ? `: ${esc(c.note)}` : ''}</div>${c.hq_source ? `<a class="small" href="${esc(c.hq_source)}" target="_blank" rel="noopener">Source</a>${/wikipedia/.test(c.hq_source) ? ' <span class="muted small">(Wikipedia)</span>' : ''}` : ''}</td>
        <td class="wrap">${esc(c.industry)}<div class="muted small">${esc(c.sub || '')}</div></td>
        <td class="wrap cm-links">${c.website ? `<a href="${esc(c.website)}" target="_blank" rel="noopener">Website</a>` : ''}
          <a href="https://www.sedarplus.ca/" target="_blank" rel="noopener" title="Search the company on SEDAR+">SEDAR+</a>
          <a href="https://money.tmx.com/en/quote/${encodeURIComponent(c.ticker)}" target="_blank" rel="noopener" title="Quote on TMX Money (delayed)">Quote</a>
          ${s && s.filings_url ? `<a href="${esc(s.filings_url)}" target="_blank" rel="noopener">SEC filings</a>` : ''}
          ${s && s.latest_filing ? `<div class="muted small">Latest US filing: ${esc(s.latest_filing[0])}, ${esc(s.latest_filing[1])}</div>` : ''}</td></tr>`; }).join('') || '<tr><td colspan="5" class="empty">Nothing matches these filters.</td></tr>'}</tbody></table></div>
    <div class="iv-pager"><button class="btn" data-cmpage="-1" ${cmPage ? '' : 'disabled'}>Previous</button><span>Page ${cmPage + 1} of ${pages}</span><button class="btn" data-cmpage="1" ${cmPage < pages - 1 ? '' : 'disabled'}>Next</button></div>
    <p class="card-note">Head office groups are kept apart: headquartered in Calgary; headquartered elsewhere with an office in Calgary; headquartered in Alberta outside Calgary; and companies TMX lists in Alberta whose own address is elsewhere. Market value, share price and revenue are not shown company by company: TMX's file may not be redistributed, and prices need a licensed feed. Each company's quote (delayed) is one tap away on TMX Money.</p></section>`;
}
function cmIndustries() {
  const T = cmT(); if (!T) return '<section class="card span-12"><p class="muted">The totals were not read at this refresh.</p></section>';
  const C = T.calgary.by_industry, A = T.alberta.by_sector;
  const tbl = (obj, tot) => `<div class="table-wrap ca-repw"><table class="data"><thead><tr><th scope="col">Industry</th><th scope="col" class="num">Companies</th><th scope="col" class="num">Total market value</th><th scope="col" class="num">Share of the value</th></tr></thead>
    <tbody>${Object.entries(obj).map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td class="num">${fmt(v.n)}</td><td class="num">${isNum(v.mcap) ? cmB(v.mcap) : '<span class="muted">fewer than 3</span>'}</td><td class="num">${isNum(v.mcap) && tot ? cmPct(v.mcap / tot) : ''}</td></tr>`).join('')}</tbody></table></div>`;
  return `<section class="card span-12"><div class="card-head"><div><h2>Calgary-headquartered companies by industry</h2><p class="card-sub">Our industry groups, from what each company does; ${esc(cmMonth(T.month))} month-end values</p></div></div>${tbl(C, T.calgary.all.mcap)}
      <p class="card-note">Energy includes oil and gas producers, royalty companies and energy services. A total over fewer than three companies is not shown, because it would give a company's own figure from TMX's file.</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>Every Alberta-headquartered company by TMX sector</h2><p class="card-sub">TSX and TSXV operating companies, by the sector TMX gives</p></div></div>${tbl(A, T.alberta.all.mcap)}</section>`;
}
function cmActivity() {
  const T = cmT(), A = T && T.alberta;
  return `<section class="card span-12"><div class="card-head"><div><h2>New listings</h2><p class="card-sub">Alberta-headquartered operating companies listed in the 12 months to ${esc(T ? cmMonth(T.month) : '')}, by how they came to market</p></div></div>
      ${A ? cmBars(Object.entries(A.new_12m.by_type).map(([k, v]) => ({ label: k, n: v })), 'n', v => fmt(v)) : '<p class="muted">Not read at this refresh.</p>'}
      <p class="card-note">From TMX's listing date and listing type. IPO: initial public offering. QT: qualifying transaction (a capital pool company's first business). RTO: reverse takeover. TSXV Grad: moved up from the TSX Venture Exchange. TSX Comedown: moved from the TSX to the TSXV. Delistings and the companies that left are not in a single month's file; they will show as the count changes month to month.</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>Deals, financings and announcements</h2><p class="card-sub">Being compiled</p></div></div>
      <p>Major equity financings, mergers and acquisitions, delistings and announcements involving Calgary companies will be listed here, each with its source, marked as completed or proposed, and with its Calgary connection stated. Until then, TMX publishes Canada-wide financing totals every month.</p>
      <p><a href="https://www.tsx.com/en/listings/current-market-statistics" target="_blank" rel="noopener">TMX market statistics</a> · <a href="https://www.sedarplus.ca/" target="_blank" rel="noopener">SEDAR+ filings</a></p></section>`;
}
function cmPerformance() {
  const sec = (CMD && CMD.sec) || {}, cos = cmCos().filter(c => sec[c.ticker] && sec[c.ticker].series);
  const yrs = s => s ? Object.keys(s.years) : [];
  const val = (s, y) => { if (!s || !isNum(s.years[y])) return '–'; const v = s.years[y]; return /USD\/shares|CAD\/shares|\/shares/.test(s.unit) ? `${s.unit.split('/')[0]} ${fmt(v, 2)}` : `${s.unit} ${cmB(v).replace('$', '')}`; };
  const body = cos.length ? cos.map(c => { const S = sec[c.ticker].series, ys = [...new Set([...yrs(S.revenue), ...yrs(S.net_income), ...yrs(S.dividends_per_share)])].sort().slice(-5);
    return `<details class="cm-co"><summary><b>${esc(c.name)}</b> <span class="muted">${esc(c.ticker)} · ${esc(sec[c.ticker].annual_form ? sec[c.ticker].annual_form[0] : '')}</span></summary>
      <div class="table-wrap ca-repw"><table class="data compact"><thead><tr><th scope="col">Fiscal year</th>${ys.map(y => `<th scope="col" class="num">${y}</th>`).join('')}</tr></thead><tbody>
      ${[['Revenue', S.revenue], ['Net income', S.net_income], ['Dividends per share', S.dividends_per_share]].map(([l, s]) => `<tr><th scope="row">${l}</th>${ys.map(y => `<td class="num">${val(s, y)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="card-note">From the company's annual reports filed with the US SEC (${esc(sec[c.ticker].latest_filing ? `latest filing ${sec[c.ticker].latest_filing[1]}` : '')}). <a href="${esc(sec[c.ticker].filings_url)}" target="_blank" rel="noopener">Filings</a></p></details>`; }).join('')
    : `<p>Company financial results will appear here for the Calgary companies that also file with the US Securities and Exchange Commission, which publishes them as open data: revenue, net income and dividends per share by year. ${CMD && CMD.errors && CMD.errors.sec ? `<span class="muted">${esc(CMD.errors.sec)}</span>` : ''}</p>`;
  return `<section class="card span-12"><div class="card-head"><div><h2>Company performance: financial results</h2><p class="card-sub">What the companies earned, from their own filings. This is the company's financial performance, not its share price.</p></div></div>${body}</section>
    <section class="card span-12"><div class="card-head"><div><h2>Share prices and index comparison</h2><p class="card-sub">Not shown</p></div></div>
      <p>Share prices, market value over time and comparison with the S&amp;P/TSX indices need a data feed licensed for publishing; none is both open and licensed. Each company's delayed quote is linked from the directory. If a licensed end-of-day feed is added later, price history will appear here, labelled with its date and source.</p></section>`;
}
function cmFootprint() {
  const T = cmT(), H = (CMD && CMD.history) || [];
  if (!T) return '<section class="card span-12"><p class="muted">The totals were not read at this refresh.</p></section>';
  const share = [{ label: 'Calgary-headquartered (checked)', v: T.calgary.share_of_canada_mcap }, { label: 'All of Alberta', v: T.alberta.share_mcap }];
  return `<section class="card span-6"><div class="card-head"><div><h2>Share of Canada's listed market value</h2><p class="card-sub">TSX and TSXV operating companies, ${esc(cmMonth(T.month))}</p></div></div>
      ${cmBars(share, 'v', v => cmPct(v))}<p class="card-note">Alberta: ${fmt(T.alberta.all.n)} of Canada's ${fmt(T.canada.all.n)} operating companies (${cmPct(T.alberta.share_count)}) and ${cmPct(T.alberta.share_mcap)} of their value. Calgary companies hold ${cmPct(T.calgary.share_of_alberta_mcap)} of Alberta's value.</p></section>
    <section class="card span-6"><div class="card-head"><div><h2>Energy at the centre</h2><p class="card-sub">Calgary's checked companies</p></div></div>
      ${(() => { const e = T.calgary.by_industry['Energy: oil and gas'], p = T.calgary.by_industry['Pipelines, utilities and power']; return `<p>${e ? `${fmt(e.n)} of the ${fmt(T.calgary.all.n)} Calgary-headquartered TSX companies checked are in oil and gas production, royalties or energy services, worth ${cmB(e.mcap)} together (${cmPct(e.mcap / T.calgary.all.mcap)} of the total).` : ''} ${p ? `Pipelines, utilities and power add ${fmt(p.n)} companies and ${cmB(p.mcap)}.` : ''}</p>`; })()}
      <p class="card-note">From the TMX month-end values; the industry groups are ours.</p></section>
    <section class="card span-12"><div class="card-head"><div><h2>Over time</h2><p class="card-sub">One point for each TMX month read; head office moves will show as companies enter or leave the list</p></div></div>
      <div class="table-wrap ca-repw"><table class="data"><thead><tr><th scope="col">Month</th><th scope="col" class="num">Calgary companies (checked)</th><th scope="col" class="num">Their value</th><th scope="col" class="num">Alberta companies</th><th scope="col" class="num">Alberta's value</th></tr></thead>
      <tbody>${H.slice().reverse().map(h => `<tr><th scope="row">${esc(cmMonth(h.month))}</th><td class="num">${fmt(h.calgary_n)}</td><td class="num">${cmB(h.calgary_mcap)}</td><td class="num">${fmt(h.alberta_n)}</td><td class="num">${cmB(h.alberta_mcap)}</td></tr>`).join('')}</tbody></table></div>
      <p class="card-note">The series starts with the first month read. How many companies moved their head office into or out of Calgary can only be counted from here on, as the checked list is kept month by month.</p></section>`;
}
function cmHistory() {
  return `<section class="card span-12"><div class="card-head"><div><h2>Calgary's stock exchange</h2><p class="card-sub">From the first exchange in Alberta to the TSX Venture Exchange</p></div></div>
    <ol class="ca-hist cm-hist">
      <li><span class="ca-hd">October 25, 1913</span><span></span><span>The exchange is incorporated by an act of the Province of Alberta, and begins trading in 1914 in the Lougheed Building in Calgary, during the Turner Valley oil boom.</span></li>
      <li><span class="ca-hd">1917 to 1925</span><span></span><span>Trading stops.</span></li>
      <li><span class="ca-hd">1926</span><span></span><span>It reopens as the Calgary Stock Exchange.</span></li>
      <li><span class="ca-hd">1975</span><span></span><span>Renamed the Alberta Stock Exchange.</span></li>
      <li><span class="ca-hd">November 29, 1999</span><span></span><span>The Alberta and Vancouver stock exchanges combine to form the Canadian Venture Exchange (CDNX), under an agreement among Canada's exchanges that left senior companies to Toronto and derivatives to Montréal. The new exchange's corporate head office was in Calgary.</span></li>
      <li><span class="ca-hd">2001</span><span></span><span>The Toronto Stock Exchange's owner, TSX Group (now TMX Group), acquires the Canadian Venture Exchange, which becomes the TSX Venture Exchange. Calgary remains one of its head office cities, with Vancouver.</span></li>
      <li><span class="ca-hd">Today</span><span></span><span>Calgary companies list on the TSX, the TSX Venture Exchange and the Canadian Securities Exchange; ${CMD && CMD.totals ? `Alberta-headquartered companies hold ${cmPct(CMD.totals.alberta.share_mcap)} of the value of Canada's TSX and TSXV operating companies.` : ''}</span></li></ol>
    <p class="card-note">Sources: <a href="https://searcharchives.ucalgary.ca/alberta-stock-exchange" target="_blank" rel="noopener">University of Calgary Archives: Alberta Stock Exchange</a>; <a href="https://en.wikipedia.org/wiki/TSX_Venture_Exchange" target="_blank" rel="noopener">TSX Venture Exchange (Wikipedia)</a>.</p></section>`;
}
function cmMethod() {
  const E = (CMD && CMD.errors) || {};
  return `<section class="card span-12"><div class="card-head"><div><h2>Sources and method</h2><p class="card-sub">What each figure is, where it comes from and what it leaves out</p></div></div>
    <div class="ca-method">
      <h3>The company list</h3><p>Every company TMX lists with an Alberta head office, starting with the Toronto Stock Exchange, is checked company by company: the head office city from the company's own website or filings (or Wikipedia, marked, where the website blocks automated reading), the group it belongs to, its industry and website. Groups are never mixed: headquartered in Calgary; headquartered elsewhere with an office in Calgary; headquartered in Alberta outside Calgary; listed in Alberta by TMX but with an address elsewhere; not yet confirmed. Tickers are checked against TMX's company directories at every refresh. Last full check: ${esc(CMC ? CMC.checked : '')}.</p>
      <h3>Totals</h3><p>Counts and market values come from TMX's monthly file of TSX and TSXV issuers (${esc(cmT() ? cmMonth(cmT().month) : '')}): market capitalization is the quoted shares at the month-end price. Funds and exchange-traded products are left out. TMX does not allow the file to be copied or redistributed, so only totals are published, worked out the same way every month; a total over fewer than three companies shows a count only.</p>
      <h3>Financial results</h3><p>Revenue, net income and dividends per share come from the annual reports companies file with the US Securities and Exchange Commission, as published in its open financial data. Only companies that also file in the United States are covered.</p>
      <h3>Not available</h3><p>Live, delayed or historical share prices, market value over time and index comparisons need a licensed data feed. Company filings do not carry share prices. The Canadian Securities Exchange publishes no downloadable company list. SEDAR+ holds every Canadian filing but does not allow automated collection.</p>
      <h3>Updates</h3><p>Totals and ticker checks: every website refresh; TMX's file changes monthly. Company list: re-checked each quarter and when a company lists, merges or moves.</p>
      ${Object.keys(E).length ? `<h3>At this refresh</h3><ul>${Object.entries(E).map(([k, v]) => `<li>${esc(k)}: ${esc(v)}</li>`).join('')}</ul>` : ''}
      <h3>Sources</h3><p>${((CMD && CMD.sources) || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher)}: ${esc(s.title)}</a>`).join(' · ')}</p></div></section>`;
}

async function renderCapMkt() {
  const body = $('#cm-body'); if (!body) return;
  const y = window.scrollY;
  if (!CMC) body.innerHTML = '<section class="card span-12"><p class="muted">Reading the company list…</p></section>';
  await loadCapMkt();
  if (!CMC) { body.innerHTML = '<section class="card span-12"><p>The company list could not be read just now.</p></section>'; return; }
  const page = { overview: cmOverview, directory: cmDirectory, industries: cmIndustries, activity: cmActivity, performance: cmPerformance, footprint: cmFootprint, history: cmHistory, method: cmMethod }[cmSub] || cmOverview;
  body.innerHTML = `<nav class="el-subtabs span-12" aria-label="Calgary Capital Markets sections">${CM_SUBS.map(([k, t]) => `<button type="button" class="el-subtab${k === cmSub ? ' is-on' : ''}" data-cmsub="${k}" ${k === cmSub ? 'aria-current="page"' : ''}>${esc(t)}</button>`).join('')}</nav>`
    + page() + `<section class="card span-12"><p class="card-note">Totals from TMX Group's listed-issuer file (${esc(cmT() ? cmMonth(cmT().month) : 'not read')}), credited to TMX; head offices checked by hand${CMD && CMD.stale ? '; the totals are from the last refresh that read the file' : ''}. Not investment advice. <button type="button" class="link-btn small" data-method="capmkt">How this is worked out</button></p></section>`;
  const re = () => renderCapMkt().then(() => window.scrollTo(0, y));
  body.querySelectorAll('[data-cmsub]').forEach(b => b.addEventListener('click', () => { cmSub = b.dataset.cmsub; renderCapMkt(); }));
  body.querySelectorAll('[data-cmpage]').forEach(b => b.addEventListener('click', () => { cmPage += +b.dataset.cmpage; re(); }));
  [['cm-grp', v => { cmGrp = v; }], ['cm-ex', v => { cmEx = v; }], ['cm-ind', v => { cmInd = v; }]].forEach(([id, f]) => { const s = $('#' + id); if (s) s.addEventListener('change', () => { f(s.value); cmPage = 0; re(); }); });
  const q = $('#cm-q'); if (q) { let t; q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { cmQ = q.value; cmPage = 0; const p = q.selectionStart; re().then(() => { const n = $('#cm-q'); if (n) { n.focus(); n.setSelectionRange(p, p); } }); }, 250); }); }
  const csv = $('#cm-csv'); if (csv) csv.addEventListener('click', async () => { const G = CMC.groups || {};
    await (await api()).save_csv('Calgary public companies', ['Company', 'Ticker', 'Exchange', 'Head office', 'Group', 'Industry', 'Type', 'Website', 'Head office source'],
      cmRows().map(c => [c.name, c.ticker, c.exchange, c.city || '', G[c.group] || '', c.industry, c.sub || '', c.website || '', c.hq_source || ''])); });
}
window.renderCapMkt = renderCapMkt;
