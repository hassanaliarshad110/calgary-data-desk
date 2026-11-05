/* Calgary Data Desk (formerly Ward 5 Data Desk) - interface */
'use strict';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const isNum = n => n !== null && n !== undefined && !Number.isNaN(n);
const fmt = (n, d = 0) => !isNum(n) ? '–'
  : Number(n).toLocaleString('en-CA', { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = (n, d = 1, unit = '%') => !isNum(n) ? '–' : (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n), d) + unit;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const niceType = t => String(t || '').replace(/ - GIS$/, '');
const titleCase = s => String(s || '').toLowerCase().replace(/(^|[\s/])\w/g, m => m.toUpperCase());
const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const icon = (id, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const pct = (a, b) => (isNum(a) && b) ? (a - b) / b * 100 : null;
const monthLabel = (m, opts = { month: 'short', year: '2-digit' }) => new Date(m + '-15T12:00:00').toLocaleDateString('en-CA', opts);
const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ymdParts = v => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || '')); return m ? [+m[1], +m[2], +m[3]] : null; };
const TZ = 'America/Edmonton';      // Calgary time, whatever the computer is set to
const localYmd = (t = new Date()) => { try { return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(t); }
  catch (e) { return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; } };
// whole calendar days from a date to the data's own date (the last refresh), so every screen agrees with the dashboard
const daysSince = d => {
  const a = ymdParts(d), b = ymdParts((D && D.built_at) || localYmd());
  if (!a || !b) return null;
  return Math.max(0, Math.round((Date.UTC(b[0], b[1] - 1, b[2]) - Date.UTC(a[0], a[1] - 1, a[2])) / 86400000));
};
// how residents are counted (Settings): words for labels and notes
const popMethod = () => (D && D.population && D.population.method) || 'city_actual';
const popWords = () => ({ model: 'the growth model', census2021: `the ${CY()} Census, without growth`, city_pace: `the ${CY()} Census grown to the City's total`, city_actual: "the City's total, shared by actual growth" })[popMethod()];
const popShort = () => ({ model: 'Live growth model', census2021: `Counted as at the ${CY()} Census`, city_pace: `${CY()} Census grown to the City's total`, city_actual: "City's total, shared by actual growth (homes built)" })[popMethod()];
const popChip = () => ({ model: 'growth model', census2021: `${CY()} Census, no growth`, city_pace: "City's total, one rate", city_actual: "City's total, actual growth" })[popMethod()];
// the federal Census the app counts from (2021 until the City publishes the 2026 Census by community)
const CY = () => (D && D.census && D.census.year) || 2021;
// the exact price of an answer (US dollars, from the tokens used and the model's price list)
const dayWord = n => `${fmt(n)} day${n === 1 ? '' : 's'}`;
const longDate = d => { const p = ymdParts(d); return p ? `${p[2]} ${MON_SHORT[p[1] - 1]} ${p[0]}` : '–'; };
// '2026-11-01 01:57' -> '1 Nov 2026, 1:57 a.m.'
const stampText = v => {
  const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})/.exec(String(v || ''));
  if (!m) return longDate(v);
  const h = +m[2];
  return `${longDate(m[1])}, ${h % 12 || 12}:${m[3]} ${h < 12 ? 'a.m.' : 'p.m.'}`;
};

// ---------------------------------------------------------------- bridge to Python
let apiReady;
const ready = new Promise(r => { apiReady = r; });
window.addEventListener('pywebviewready', () => apiReady(window.pywebview.api));
if (window.pywebview && window.pywebview.api) apiReady(window.pywebview.api);
const api = () => ready;
async function openUrl(url) {
  const a = await api();
  if (a && a.open_url) a.open_url(url);
}

// Every web link opens in the computer's own browser, never inside the app window (which has no Back button).
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (/^https?:\/\//i.test(href)) { e.preventDefault(); e.stopPropagation(); openUrl(href); }
}, true);
window.open = (url) => { if (/^https?:\/\//i.test(String(url || ''))) openUrl(String(url)); return null; };

// ---------------------------------------------------------------- theme
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
let themePref = 'system';
const isDark = () => document.documentElement.dataset.theme === 'dark';
function applyTheme() {
  const dark = themePref === 'dark' || (themePref === 'system' && darkQuery.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const b = $('#theme-btn');
  b.innerHTML = dark ? `${icon('sun')}<span>Light mode</span>` : `${icon('moon')}<span>Dark mode</span>`;
  b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  setSeg($('#theme-seg'), themePref);
  if (D) { renderMap(); renderPanel(selected); renderCharts(); if (window.renderExtras) renderExtras(); }
}
async function setTheme(pref) {
  themePref = pref;
  applyTheme();
  const a = await api();
  if (a.set_theme) a.set_theme(pref);
}
darkQuery.addEventListener('change', () => { if (themePref === 'system') applyTheme(); });
$('#theme-btn').addEventListener('click', () => setTheme(isDark() ? 'light' : 'dark'));

// ---------------------------------------------------------------- segmented controls (radio groups)
function setSeg(group, value) {
  $$('[role=radio]', group).forEach(b => {
    const on = Object.values(b.dataset)[0] === value;
    b.setAttribute('aria-checked', on);
    b.tabIndex = on ? 0 : -1;
  });
}
function wireSeg(group, onChange) {
  const radios = $$('[role=radio]', group);
  radios.forEach((b, i) => {
    b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
    b.addEventListener('click', () => { setSeg(group, Object.values(b.dataset)[0]); onChange(Object.values(b.dataset)[0]); });
    b.addEventListener('keydown', e => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = radios[(i + step + radios.length) % radios.length];
      next.focus(); next.click();
    });
  });
}

// ---------------------------------------------------------------- navigation
function show(view) {
  $$('.tab').forEach(t => {
    const on = t.dataset.view === view;
    t.classList.toggle('is-on', on);
    on ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current');
  });
  $$('.view').forEach(v => v.classList.toggle('is-on', v.id === 'view-' + view));
  if (view !== 'videos') $$('#view-videos video').forEach(v => v.pause());
  if (view === 'files') loadFiles();
  if (view === 'scientist' && window.renderScientist) renderScientist();
  if (view === 'settings') loadSettings();
  if (view === 'dashboard' && map) setTimeout(() => { map.invalidateSize(); if (!selected) zoomToWard(); }, 60);
  if (view === 'issues') renderIssues();
  if (view === 'cameras') renderCameraWall();
  if (view === 'families' && window.renderFamilies) renderFamilies();
  if (view === 'growth' && window.renderGrowth) renderGrowth();
  if (view === 'changes' && window.renderChanges) renderChanges();
  if (view === 'compare' && window.renderCompare) renderCompare();
  if (view === 'sources' && window.renderSources) renderSources();
  if (view === 'methods' && window.renderMethods) renderMethods();
  if (view === 'budget' && window.renderBudget) renderBudget();
  if (view === 'elections' && window.renderElections) renderElections();
  if (view === 'fedbudget' && window.renderFedBudget) renderFedBudget();
  if (view === 'sources' && window.renderLive) renderLive();
  if (view === 'news' && window.initNews) initNews();
  if (view === 'ask') $('#question').focus();
}
$$('.tab').forEach(t => t.addEventListener('click', () => { if (t.dataset.view) show(t.dataset.view); setMenu(false); }));
// phones: the sections sit behind a menu button at the top, so every page gets the full width
function setMenu(open) {
  const side = $('.side'), b = $('#menu-btn');
  if (!side || !b) return;
  side.classList.toggle('open', open);
  b.setAttribute('aria-expanded', open ? 'true' : 'false');
  b.setAttribute('aria-label', open ? 'Close the menu' : 'Menu');
}
$('#menu-btn').addEventListener('click', () => setMenu(!$('.side').classList.contains('open')));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('.side').classList.contains('open')) { setMenu(false); $('#menu-btn').focus(); } });
$('#brief-btn') && $('#brief-btn').addEventListener('click', () => setMenu(false));
document.addEventListener('click', e => {
  const g = e.target.closest('[data-goto]');
  if (g) show(g.dataset.goto);
  const u = e.target.closest('[data-url]');
  if (u && D && D[u.dataset.url]) openUrl(D[u.dataset.url]);
});

// ---------------------------------------------------------------- clock
function tick() {
  const now = new Date();
  const t = now.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', timeZone: TZ });
  $('#clock').textContent = now.toLocaleDateString('en-CA', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ }) + '  ' + t;
  $('#brief-time').textContent = t;
  $('#brief-date').textContent = now.toLocaleDateString('en-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ });
}
tick();
setInterval(tick, 15000);

// ================================================================ CITY OR WARD
// The office chooses what the screens show: the whole city (0) or one of the 14 wards. Every label follows it.
let SCOPE = (() => { try { const v = localStorage.getItem('cdd-scope'); return v === null ? 0 : (+v || 0); } catch { return 0; } })();
const W = () => (D && D.scope && D.scope.ward === SCOPE) ? D.scope.name : (SCOPE ? `Ward ${SCOPE}` : 'Calgary');
const isCity = () => (D && D.scope ? D.scope.kind === 'city' : SCOPE === 0);
// static words in the page that name the area: remembered once, written again whenever the view changes
const SCOPE_NODES = [];
function scopeTextInit() {
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) if (/Ward 5|2021 Census|since 2021|May 2021/.test(n.nodeValue)) SCOPE_NODES.push([n, null, n.nodeValue]);
  $$('[title],[aria-label],[data-add],input[value],[placeholder]').forEach(el => ['title', 'aria-label', 'data-add', 'value', 'placeholder'].forEach(a => {
    const v = el.getAttribute(a);
    if (v && /Ward 5|2021 Census|since 2021|May 2021/.test(v)) SCOPE_NODES.push([el, a, v]);
  }));
}
function scopeText() {
  const w = W();
  SCOPE_NODES.forEach(([n, a, t]) => {
    const y = String(CY());
    const v = t.split('Ward 5').join(w).split('2021 Census').join(y + ' Census').split('since 2021').join('since ' + y).split('May 2021').join('May ' + y);
    if (!a) n.nodeValue = v;
    else { n.setAttribute(a, v); if (a === 'value' && n.dataset.edited !== '1') n.value = v; }
  });
  document.title = 'Calgary Data Desk' + (SCOPE ? ` · Ward ${SCOPE}` : '');
  const sel = $('#scope-sel');
  if (sel && +sel.value !== SCOPE) sel.value = String(SCOPE);
}
function scopeOptions() {
  const sel = $('#scope-sel');
  if (!sel) return;
  const names = (D && D.scope && D.scope.wards) || {};
  sel.innerHTML = '<option value="0">Calgary: all wards</option>' + Array.from({ length: 14 }, (_, i) => i + 1)
    .map(w => { const c = names[w] && names[w].councillor; const last = c ? c.replace(/\s*\(.*?\)\s*/g, ' ').trim().split(/\s+/).pop() : '';
      return `<option value="${w}" title="${esc(c || '')}">Ward ${w}${last ? ' · ' + esc(last) : ''}</option>`; }).join('');
  sel.value = String(SCOPE);
}
async function setScope(w) {
  w = +w || 0;
  if (w === SCOPE && D && D.scope && D.scope.ward === w) return;
  const before = SCOPE;
  SCOPE = w;
  selected = null;                                  // community picks and filters from the last view no longer apply
  if (typeof issueFilter === 'object' && issueFilter) issueFilter.comm = '';
  if (window.resetScopeFilters) resetScopeFilters();
  scopeText();
  await loadDashboard(false);
  if (!D || !D.scope || D.scope.ward !== w) {      // that view could not load: back to the one still on screen
    SCOPE = D && D.scope ? D.scope.ward : before;
    const sel = $('#scope-sel');
    if (sel) sel.value = String(SCOPE);
    scopeText();
    return;
  }
  try { localStorage.setItem('cdd-scope', String(w)); } catch { /* storage off */ }
}
document.addEventListener('DOMContentLoaded', () => {
  scopeTextInit(); scopeOptions(); scopeText();
  const sel = $('#scope-sel');
  if (sel) sel.addEventListener('change', () => setScope(sel.value));
});

// ================================================================ DASHBOARD
let D = null, map = null, tiles = null, areaLayer = null, labelLayer = null, trafficLayer = null, cameraLayer = null;
let charts = {}, selected = null, styleArea = null, metric = 'open_per_1000', areas = 'res';
let sortKey = 'requests12', sortDir = -1;
const commName = code => (D && D.communities.find(c => c.code === code) || {}).name || code;

const METRICS = {
  open_per_1000: { label: 'Open 311 requests per 1,000 residents', short: 'open requests per 1,000 residents', d: 1, kind: 'seq', perRes: true },
  requests_per_1000: { label: '311 requests per 1,000 residents a year', short: '311 requests per 1,000 residents a year', d: 0, kind: 'seq', perRes: true },
  infra_per_1000: { label: 'Infrastructure reports per 1,000 residents a year', short: 'infrastructure reports per 1,000 residents a year (the study\'s 21 types)', d: 1, kind: 'seq', perRes: true },
  requests_change_pct: { label: 'Change in 311 requests from the comparison period', short: 'change in 311 requests', d: 1, kind: 'div', pct: true },
  growth_pct: { label: 'Population growth since the ' + CY() + ' Census', short: 'population growth since ' + CY() + '', d: 0, kind: 'seq', pct: true, perRes: true },
};
const RAMPS = {
  seq: { light: ['#E0F2FE', '#9BD7F7', '#4FB3E8', '#1A85C2', '#075985'], dark: ['#0B2537', '#0E4565', '#0F6A98', '#2C9AD3', '#7DD3FC'] },
  div: { light: ['#1D4ED8', '#93C5FD', '#F1F5F9', '#FDBA74', '#C2410C'], dark: ['#3B82F6', '#1E3A8A', '#334155', '#9A3412', '#FB923C'] },
};
const TILES = {
  light: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
};

let period = null;                                         // null: the last 12 months against the 12 before
try { period = JSON.parse(localStorage.getItem('w5-period') || 'null'); } catch { period = null; }
async function loadDashboard(force = false, quiet = false, quick = !force) {
  const btn = $('#refresh');
  btn.disabled = true; btn.classList.add('is-busy');
  if (!quiet) $('#dash-error').hidden = true;
  if (!D) $('#dash-loading').hidden = false;
  setStatus('', force ? 'Refreshing' : 'Loading');
  try {
    const asked = SCOPE, askedPeriod = JSON.stringify(period);
    const res = await (await api()).load_dashboard(force, period, SCOPE, quick);
    if (!res.ok && res.period_error) {                        // a period that can't be used: back to the default
      period = null;
      try { localStorage.removeItem('w5-period'); } catch { /* storage off */ }
      throw new Error(res.error);
    }
    if (!res.ok) throw new Error(res.error);
    D = res.data;
    if (D.scope && D.scope.ward !== SCOPE) { SCOPE = D.scope.ward; try { localStorage.setItem('cdd-scope', String(SCOPE)); } catch { /* storage off */ } }
    scopeOptions(); scopeText(); loadLayers();
    renderDashboard();
    if (res.needs_refresh) {      // a saved copy shown at once; the fresh one is built behind it and swapped in quietly
      setStatus('stale', `Updating (showing the copy from ${fmt(res.age_hours, 0)} h ago)`);
      setTimeout(async () => {
        if (SCOPE !== asked || JSON.stringify(period) !== askedPeriod) return;
        try {
          const fresh = await (await api()).load_dashboard(false, period, asked, false);
          if (fresh.ok && SCOPE === asked && JSON.stringify(period) === askedPeriod) { D = fresh.data; renderDashboard(); }
        } catch (e) { /* the saved copy stays on screen */ }
      }, 50);
    }
  } catch (e) {
    if (!quiet) {
      $('#dash-error-text').textContent = (e.message || e) + ' Check the internet connection, then try again.';
      $('#dash-error').hidden = false;
    }
    setStatus(D ? 'stale' : '', D ? 'Showing earlier data' : 'Not loaded');
  } finally {
    $('#dash-loading').hidden = true;
    btn.disabled = false; btn.classList.remove('is-busy');
  }
}
$('#refresh').addEventListener('click', () => loadDashboard(true));
$('#retry').addEventListener('click', () => loadDashboard(true));

function setStatus(cls, text) {
  const s = $('#side-status');
  s.className = 'status ' + cls;
  $('.status-text', s).textContent = text;
  s.title = text;
}

function residential() { return D.communities.filter(c => c.residential); }

function renderDashboard() {
  $('#dash-body').hidden = false;
  $('#dash-title').textContent = isCity() ? 'City of Calgary at a glance' : `${W()} at a glance`;
  const nRes = residential().length;
  const who = isCity() ? `City of Calgary, all 14 wards.` : `Ward ${D.ward.number}, Councillor ${esc(D.ward.councillor || '')}.`;
  $('#dash-sub').innerHTML = `${who} ${fmt(D.ward.residents)} residents${popMethod() === 'census2021' ? ' at the ' + CY() + ' Census' : ' today'} in ${nRes} communities <button class="link-btn small pop-chip" data-goto="settings" title="Change how residents are counted (Settings)">${icon('users')}<span>Residents: ${esc(popChip())}</span></button>`;
  $('#period-text').textContent = `${D.period} against ${D.prev_period}`;
  $('#period-pill').hidden = false;
  $('#dash-stamp').textContent = (D.stale ? 'Offline, data from ' : 'Updated ') + stampText(D.built_at);
  $('#board-period').textContent = `${D.period} against ${D.prev_period}. Open requests and residents are as of today.${D.crime ? ` Police figures: ${D.crime.period}, the latest published.` : ''}`;
  $('#tab-open-count').textContent = fmt(D.summary.open_now);
  setStatus(D.stale ? 'stale' : 'ok', D.stale ? 'Offline: earlier data' : 'Live City data');
  renderKpis();
  renderLayerMenu();
  renderMap(true);
  renderPanel(selected);
  renderCharts();
  renderFeed();
  renderPopulation();
  renderAreas();
  renderCamStrip();
  watchCams().then(pullFrames);
  renderBench();
  renderDisorder();
  renderTable();
  renderNotes();
  if (window.renderExtras) renderExtras();
  if (window.renderRepCard) renderRepCard();
  fillIssueFilters();
  if ($('#view-issues').classList.contains('is-on')) renderIssues();
  if ($('#view-cameras').classList.contains('is-on')) renderCameraWall();
  if ($('#view-families').classList.contains('is-on') && window.renderFamilies) renderFamilies();   // the screen on show follows a new ward
  if ($('#view-growth').classList.contains('is-on') && window.renderGrowth) renderGrowth();
  if ($('#view-changes') && $('#view-changes').classList.contains('is-on') && window.renderChanges) renderChanges();
  if ($('#view-elections') && $('#view-elections').classList.contains('is-on') && window.renderElections) renderElections();
  if (!$('#brief').hidden) renderBrief();
}

// ---------- change chips: colour plus arrow plus words, never colour alone
function chg(v, upIsBad, unit = '%', d = 1, words = 'the year before') {
  if (!isNum(v)) return '';
  const flat = Math.abs(v) < 1;
  const cls = flat ? 'flat' : upIsBad === null ? 'neutral' : (v > 0) === upIsBad ? 'bad' : 'good';
  const dir = flat ? 'flat' : v > 0 ? 'up' : 'down';
  const w = flat ? 'about the same as' : v > 0 ? 'up from' : 'down from';
  return `<span class="chg ${cls}" title="${w} ${words}">${icon(dir)}${signed(v, d, unit)}<span class="sr"> ${w} ${words}</span></span>`;
}

// ---------- status board
function spark(values) {
  const v = values.filter(isNum);
  if (v.length < 2) return '';
  const lo = Math.min(...v), hi = Math.max(...v), w = 100, h = 28;
  const pts = v.map((y, i) => [i / (v.length - 1) * w, h - 3 - (hi === lo ? .5 : (y - lo) / (hi - lo)) * (h - 6)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${line} L${w} ${h} L0 ${h} Z" fill="var(--accent-soft)" stroke="none"/>
    <path d="${line}" fill="none" stroke="var(--chart-2)" stroke-width="1.8" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`;
}
function meter(share, tick, cls = '') {
  const s = Math.max(0, Math.min(1, share || 0));
  return `<div class="meter ${cls}" aria-hidden="true"><span style="width:${(s * 100).toFixed(1)}%"></span>${isNum(tick) ? `<i class="tick" style="left:calc(${(Math.min(1, tick) * 100).toFixed(1)}% - 1px)"></i>` : ''}</div>`;
}
function versus(now, before) {
  const top = Math.max(now || 0, before || 0) || 1;
  return meter(now / top, before / top, 'vs');
}
const cmpWords = () => D && D.period_spec ? D.prev_period : 'the year before';
function renderKpis() {
  const s = D.summary, w = D.ward, dv = D.development;
  const over90 = s.open_now ? s.open_over_90_days / s.open_now : 0;
  const cw = cmpWords();
  const asOf = (() => { const t = (D.built_at || '').slice(0, 10); const d = t ? new Date(t + 'T12:00:00') : new Date();
    return `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${d.getFullYear()}`; })();
  const c = D.crime;
  const crime = c ? [
    [`Crimes reported, ${esc(c.period)}`, fmt(c.crimes), chg(c.change_pct, true, '%', 1, 'the same months a year before'),
      `Calgary Police Service. ${fmt(c.crimes_prev)} a year before (marker). Calgary: ${signed(c.city_change_pct, 1)}`, versus(c.crimes, c.crimes_prev), 'crime'],
    ['Violent crimes', fmt(c.violent), chg(c.violent_change_pct, true, '%', 1, 'the same months a year before'),
      `Assault, robbery and other violence, not domestic. ${fmt(c.violent_prev)} a year before (marker)`, versus(c.violent, c.violent_prev), 'crime'],
    isCity() ? ['Crimes per 1,000 residents a year', fmt(c.per_1000, 1), '',
      'Calgary Police Service figures for the whole city. Each ward against Calgary is under Compare wards', '', 'crime'] :
    ['Crimes per 1,000 residents a year', fmt(c.per_1000, 1), chg(c.per_1000 - c.city_per_1000, true, ' vs Calgary', 1, 'Calgary as a whole'),
      `Calgary: ${fmt(c.city_per_1000, 1)} (marker), so ${W()} is ${fmt(Math.abs(c.per_1000 - c.city_per_1000), 1)} ${c.per_1000 >= c.city_per_1000 ? 'above' : 'below'} per 1,000. ${W()} has ${fmt(c.share_of_city_pct, 1)}% of Calgary's crime and ${fmt(c.residents_share_pct, 1)}% of its residents`, versus(c.per_1000, c.city_per_1000), 'crime'],
    c.disorder ? ['Disorder calls to police', fmt(c.disorder.n), chg(c.disorder.change_pct, true, '%', 1, 'the same months a year before'),
      `Disturbances, suspicious people, noise and more. ${fmt(c.disorder.prev)} a year before (marker)`, versus(c.disorder.n, c.disorder.prev), 'crime'] : null,
  ].filter(Boolean) : [];
  const items = [
    [popMethod() === 'census2021' ? 'Residents (' + CY() + ' Census)' : 'Residents today', fmt(w.residents), popMethod() === 'census2021' ? '' : chg(w.growth_pct, null, '%', 1, 'the ' + CY() + ' Census'),
      `${CY()} Census: ${fmt(w.census2021)} (marker). ${popShort()}.${isCity() && D.population && D.population.city_now && popMethod() === 'model' ? ` The City's own estimate for Calgary is ${fmt(D.population.city_now)}: it also counts more people living in each home since ${CY()} and people in seniors' homes, residences and shelters, which the model can't see.` : ''}${['city_pace', 'city_actual'].includes(popMethod()) ? ` This is above the ${CY()} count partly because the Census counted people in private homes only; the City's total also includes people in seniors' homes, residences and shelters.` : ''}${popMethod() === 'city_actual' && D.population && D.population.actual_factor ? ` Each community: its ${CY()} count × ${fmt(D.population.actual_factor, 4)} + the growth measured from homes built there.` : ''}`, versus(w.residents, w.census2021), 'hero'],
    [`Open 311 requests as of ${asOf}`, fmt(s.open_now), '', `${fmt(s.open_over_90_days)} (${fmt(over90 * 100, 0)}%) open more than 90 days, whenever they were made`, meter(over90)],
    ...crime,
    [`311 requests, ${esc(D.period)}`, fmt(s.requests12), chg(s.requests_change_pct, null, '%', 1, cw),
      `${fmt(s.requests_per_1000, 0)} per 1,000 residents a year`, spark(D.trend.all)],
    ['Infrastructure reports per 1,000 a year', fmt(s.infra_per_1000, 1), chg(pct(s.infra_per_1000, s.infra_per_1000_prev), null, '%', 1, cw),
      `Roads, water and sewer, parks: the study's 21 types. ${fmt(s.infra_per_1000_prev, 1)} in ${esc(cw)} (marker)`, versus(s.infra_per_1000, s.infra_per_1000_prev)],
    ['Closed within 7 days', fmt(s.closed_7_days_pct, 1) + '%', isCity() ? '' : chg(s.closed_7_days_pct - s.closed_7_days_pct_city, false, ' pts', 1, 'Calgary as a whole'),
      `Of the period's requests closed so far. Calgary: ${fmt(s.closed_7_days_pct_city, 1)}% (marker)`, meter(s.closed_7_days_pct / 100, s.closed_7_days_pct_city / 100, 'vs')],
    ['Traffic incidents', fmt(s.traffic12), chg(s.traffic_change_pct, true, '%', 1, cw), `${fmt(s.traffic_prev)} in ${esc(cw)} (marker)`, versus(s.traffic12, s.traffic_prev)],
    ['Homes in building permits issued', fmt(s.issued_homes12), chg(s.issued_homes_change_pct, null, '%', 1, cw),
      `${fmt(s.new_homes12)} applied for. Planned, not yet built. ${fmt(s.issued_homes_prev)} issued in ${esc(cw)} (marker)`, versus(s.issued_homes12, s.issued_homes_prev)],
    dv ? ['Larger development applications', fmt(dv.larger), chg(dv.larger_change_pct, null, '%', 1, cw),
      `New homes and apartments, changes of use, commercial and industrial. All development permit applications: ${fmt(dv.applied)} (most are basement suites, signs and home businesses)`, versus(dv.larger, dv.larger_prev)]
      : ['Development permit applications', '–', '', 'Not available right now', ''],
  ];
  $('#kpis').innerHTML = items.map(([label, value, change, foot, viz, cls]) => `
    <div class="kpi ${cls || ''}" role="listitem">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${value}</div>
      <div class="kpi-foot">${change}<span title="${esc(foot.replace(/<[^>]+>/g, ''))}">${foot}</span></div>
      ${viz}
    </div>`).join('');
  const hero = $('#kpis .kpi.hero');
  if (hero && D.population && D.population.live && popMethod() !== 'census2021') {
    hero.insertAdjacentHTML('beforeend', `<div class="live-pop" title="The City's forecast pace, second by second: the area's residents on the first of this month and of next month, worked out the same way as every figure here, joined by a straight line. Each morning's refresh carries on from there.">
      <span class="live-dot" aria-hidden="true"></span><span class="live-pop-n" id="live-pop-n"></span><small id="live-pop-rate"></small></div>`);
    tickPop();
  }
}
// the live population counter (dashboard.population_live): a straight line between this month's and next month's figures
function livePop(t = Date.now()) {
  const L = D && D.population && D.population.live;
  if (!L || !L.end_ms || L.end_ms <= L.start_ms) return null;
  return L.from + (L.to - L.from) * (t - L.start_ms) / (L.end_ms - L.start_ms);
}
function tickPop() {
  const n = $('#live-pop-n'), L = D && D.population && D.population.live;
  if (!n || !L) return;
  const v = livePop();
  n.textContent = isNum(v) ? fmt(v, Math.abs(L.per_day) < 20 ? 4 : 3) : '';      // a ward grows slowly: more decimals so it moves
  const r = $('#live-pop-rate');
  if (r && !r.textContent) r.textContent = ` live, at the forecast pace · ${L.per_day >= 0 ? '+' : '−'}${fmt(Math.abs(L.per_day), Math.abs(L.per_day) < 10 ? 1 : 0)} a day (the figure above is this month's)`;
}
setInterval(tickPop, 1000);

// ---------- map
function scale() {
  const m = METRICS[metric];
  const ramp = RAMPS[m.kind][isDark() ? 'dark' : 'light'];
  const vals = residential().map(c => c[metric]).filter(isNum);
  let breaks;
  if (m.kind === 'div') {
    const top = Math.max(1, ...vals.map(Math.abs));
    breaks = [-top, -.6 * top, -.2 * top, .2 * top, .6 * top, top];
  } else if (isCity() && vals.length > 20) {       // 200-odd communities: equal shares in each shade, so a few extremes don't wash out the rest
    const v = [...vals].sort((a, b) => a - b);
    breaks = [0, 1, 2, 3, 4, 5].map(i => v[Math.min(v.length - 1, Math.round((v.length - 1) * i / 5))]);
  } else {
    const lo = Math.min(...vals), hi = Math.max(...vals);
    breaks = [0, 1, 2, 3, 4, 5].map(i => lo + (hi - lo) * i / 5);
  }
  const color = v => {
    if (!isNum(v)) return null;
    for (let i = 0; i < 5; i++) if (v <= breaks[i + 1] + 1e-9) return ramp[i];
    return ramp[4];
  };
  return { ramp, breaks, color };
}
function metricColor(c, sc) {
  if (!c.residential) return null;
  if (metric === 'growth_pct' && !isNum(c.growth_pct)) return sc.ramp[4];      // built after the 2021 Census
  return sc.color(c[metric]);
}
function fmtMetric(c, m = metric) {
  const v = c[m], M = METRICS[m];
  if (m === 'growth_pct' && c.residential && !isNum(v)) return 'built since ' + CY() + '';
  if (!isNum(v)) return M.perRes ? (c.few_residents ? 'too few residents for a rate' : 'no residents') : '–';
  return M.pct ? signed(v, M.d) : fmt(v, M.d);
}
// a traffic incident: full details, and searches for news about it (opened in the browser)
function trafficPopup(p) {
  const dp = ymdParts(p.date); const day = dp ? `${MON_LONG[dp[1] - 1]} ${dp[2]}, ${dp[0]}` : '';   // search words, as news sites write dates
  const place = String(p.where || '').replace(/\b(NE|NW|SE|SW)\b/g, '').replace(/\s+/g, ' ').trim();
  const q = `${place} Calgary ${day}`;
  const news = 'https://www.google.com/search?tbm=nws&q=' + encodeURIComponent(`"${place}" Calgary crash OR collision OR incident`) + '&tbs=' + encodeURIComponent(`cdr:1,cd_min:${p.date.slice(5, 7)}/${p.date.slice(8)}/${p.date.slice(0, 4)},cd_max:${p.date.slice(5, 7)}/${p.date.slice(8)}/${p.date.slice(0, 4)}`);
  const web = 'https://www.google.com/search?q=' + encodeURIComponent(q + ' traffic');
  return `<div class="tr-pop"><strong>${esc(p.where)}</strong>
    <p>${esc(longDate(p.date))}${p.time ? ', ' + esc(p.time) + ' (Calgary time)' : ''}</p>
    <p>${esc(p.what || 'Traffic incident.')}</p>
    <div class="tr-btns"><button class="btn primary" data-open="${esc(news)}">${icon('search')}<span>Find news</span></button>
      <button class="btn" data-open="${esc(web)}">${icon('open')}<span>Search the web</span></button></div>
    <p class="tr-note">Opens a Google search in your browser for news on that day near this location. The City's record has no more detail.</p></div>`;
}
const camIcon = () => L.divIcon({ className: '', html: `<div class="cam-marker">${icon('camera')}</div>`, iconSize: [22, 22], iconAnchor: [11, 11] });
const camSrc = url => url + (url.includes('?') ? '&' : '?') + 't=' + Math.floor(Date.now() / 60000);

// Base maps: Google when the office saves a Google Maps key, otherwise OpenStreetMap (open source), Esri satellite
// imagery, or the plain grey map. maxNativeZoom keeps the map from asking for tiles that don't exist.
let mapStyle = 'street', googleKey = '', googleReady = null, tileErrors = 0;
const BASES = {
  street: () => L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxNativeZoom: 19, maxZoom: 19, attribution: '&copy; OpenStreetMap contributors. Data: City of Calgary' }),
  street_esri: () => L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    { maxNativeZoom: 18, maxZoom: 19, attribution: 'Tiles &copy; Esri. Data: City of Calgary' }),
  satellite: () => L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxNativeZoom: 18, maxZoom: 19, attribution: 'Imagery &copy; Esri. Data: City of Calgary' }),
  grey: () => L.tileLayer(TILES[isDark() ? 'dark' : 'light'], { maxNativeZoom: 16, maxZoom: 18, attribution: 'Tiles &copy; Esri. Data: City of Calgary' }),
};
function loadGoogle() {
  if (!googleKey) return Promise.resolve(false);
  if (googleReady) return googleReady;
  googleReady = new Promise(resolve => {
    window.gm_authFailure = () => { googleFailed = true; resolve(false); if (map) setBase(); };
    const s = document.createElement('script');
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(googleKey) + '&v=weekly&callback=__gmReady';
    window.__gmReady = () => {
      const p = document.createElement('script');
      p.src = 'vendor/leaflet.googlemutant.js';
      p.onload = () => resolve(true);
      p.onerror = () => resolve(false);
      document.head.appendChild(p);
    };
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
    setTimeout(() => resolve(false), 12000);
  });
  return googleReady;
}
let googleFailed = false;
function baseLayer(style) {
  if (googleKey && !googleFailed && window.L && L.gridLayer && L.gridLayer.googleMutant && style !== 'grey')
    return L.gridLayer.googleMutant({ type: style === 'satellite' ? 'hybrid' : 'roadmap', maxZoom: 19 });
  return (BASES[style] || BASES.street)();
}
function setBase() {
  if (!map) return;
  if (tiles) tiles.remove();
  tiles = baseLayer(mapStyle).addTo(map);
  tiles.bringToBack && tiles.bringToBack();
  tileErrors = 0;
  if (tiles.on) tiles.on('tileerror', () => {          // OpenStreetMap refused: use the free Esri street map instead
    if (++tileErrors === 6 && mapStyle === 'street' && !(googleKey && !googleFailed)) { tiles.remove(); tiles = BASES.street_esri().addTo(map); tiles.bringToBack(); }
  });
  $$('#base-seg button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.base === mapStyle)));
  $('#base-note').textContent = googleKey && !googleFailed && mapStyle !== 'grey' ? 'Google Maps' : googleFailed ? 'Google refused the key: free map shown' : '';
}
function wardBounds() { return L.geoJSON(D.geo.ward).getBounds(); }
function zoomToWard() { if (map && D) { map.invalidateSize(); map.fitBounds(wardBounds(), { padding: [16, 16] }); } }
function zoomToCommunity(code) {
  const g = D && D.geo.communities[code];
  if (map && g) map.fitBounds(L.geoJSON(g).getBounds(), { padding: [30, 30], maxZoom: 15 });
}
const overlay = {};                                        // extra layers, switched on in the layer menu
const LAYERS = [
  ['traffic', 'Traffic incidents, last 90 days', true],
  ['cameras', 'Traffic cameras', true],
  ['childcare', 'Child care', false],
  ['schools', 'Schools', false],
  ['devpermits', 'Development permits', false],
  ['roadwork', 'Being built: City projects, roads, large permits', false],
  ['amenities', 'Recreation, libraries, community centres', false],
  ['playgrounds', 'Playgrounds', false],
  ['stops', 'Transit stops', false],
  ['buses', 'Buses and CTrains, live', false],
];
const layerOn = {};
LAYERS.forEach(([k, , on]) => { layerOn[k] = on; });
// the whole city starts with no point layers (thousands of incidents and cameras would hide the shading); each scope remembers its own
const layerKey = () => (SCOPE === 0 ? 'cdd-layers-city' : 'w5-layers');
let layersFor = null;
function loadLayers() {
  const k = layerKey();
  if (layersFor === k) return;
  layersFor = k;
  LAYERS.forEach(([key, , on]) => { layerOn[key] = SCOPE === 0 ? false : on; });
  try { Object.assign(layerOn, JSON.parse(localStorage.getItem(k) || '{}')); } catch { /* storage off */ }
}
loadLayers();
function dotIcon(cls, html = '') { return L.divIcon({ className: '', html: `<div class="mk ${cls}">${html}</div>`, iconSize: [16, 16], iconAnchor: [8, 8] }); }

function renderMap(fit = false) {
  if (!map) {
    map = L.map('map', { zoomControl: false, attributionControl: true, scrollWheelZoom: false, zoomSnap: .25, maxZoom: 19 });
    // the mouse wheel scrolls the page until the map is clicked, so scrolling past the map doesn't zoom it
    map.on('click focus', () => map.scrollWheelZoom.enable());
    map.on('mouseout', () => map.scrollWheelZoom.disable());
    L.control.zoom({ position: 'topright' }).addTo(map);
    const home = L.control({ position: 'topright' });
    home.onAdd = () => {
      const b = L.DomUtil.create('button', 'map-home');
      b.type = 'button'; b.title = 'Zoom to ' + W() + ''; b.setAttribute('aria-label', 'Zoom to ' + W() + '');
      b.innerHTML = icon('home');
      L.DomEvent.on(b, 'click', e => { L.DomEvent.stop(e); zoomToWard(); });
      return b;
    };
    home.addTo(map);
    map.on('zoomend', () => {
      $('#map').classList.toggle('zoomed-in', map.getZoom() >= 14);
      if (areaLayer && styleArea) areaLayer.eachLayer(l => { if (l.feature && l.feature.properties && l.feature.properties.code) l.setStyle(styleArea(l.feature)); });
    });
    new ResizeObserver(() => { if (map && $('#map').offsetWidth) map.invalidateSize(); }).observe($('#map'));
    setBase();
    fit = true;
  } else if (mapStyle === 'grey') setBase();
  if (fit) zoomToWard();
  [areaLayer, labelLayer, trafficLayer, cameraLayer, ...Object.values(overlay)].forEach(l => l && l.remove());
  Object.keys(overlay).forEach(k => delete overlay[k]);
  const sc = scale();
  const line = cssv('--fg'), edge = cssv('--card');
  // outlines: the City boundary and every ward, under Ward 5
  if (D.geo.city) overlay.city = L.geoJSON(D.geo.city, { style: { color: '#334155', weight: 2.5, fill: false, dashArray: '6 4', interactive: false } }).addTo(map);
  if (D.geo.wards) {
    overlay.wards = L.layerGroup().addTo(map);
    const w5 = D.geo.ward ? L.geoJSON(D.geo.ward).getBounds().pad(0.02) : null;
    Object.entries(D.geo.wards).forEach(([n, g]) => {
      if (!isCity() && n === String(SCOPE)) return;     // the ward on screen has its own outline
      const lay = L.geoJSON(g, { style: { color: '#64748B', weight: 1, fill: false, opacity: .7, interactive: false } }).addTo(overlay.wards);
      if (w5 && !isCity() && !w5.intersects(lay.getBounds())) return;      // name only the wards next to the one on screen
      L.tooltip({ permanent: true, direction: 'center', className: 'ward-label', interactive: false })
        .setLatLng(lay.getBounds().getCenter()).setContent('Ward ' + n).addTo(overlay.wards);
    });
  }
  const features = D.communities.filter(c => D.geo.communities[c.code])
    .map(c => ({ type: 'Feature', properties: c, geometry: D.geo.communities[c.code] }));
  styleArea = f => {
    const c = f.properties, fill = metricColor(c, sc);
    // shading fades as you zoom in, so streets and roofs show through; outlines stay
    const z = map.getZoom ? map.getZoom() : 12;
    const fade = z >= 16 ? .12 : z >= 15 ? .25 : z >= 14 ? .4 : 1;
    const strong = mapStyle === 'grey' ? .85 : mapStyle === 'satellite' ? .55 : .7;
    const base = fill
      ? { color: z >= 14 ? fill : edge, weight: z >= 14 ? 2.5 : 1.5, fillColor: fill, fillOpacity: strong * fade, dashArray: null }
      : { color: cssv('--border-strong'), weight: 1, fillColor: cssv('--muted-2'), fillOpacity: .45 * fade, dashArray: '4 3' };
    return c.code === selected ? { ...base, color: line, weight: 3.5, dashArray: null } : base;
  };
  areaLayer = L.geoJSON({ type: 'FeatureCollection', features }, {
    style: styleArea,
    onEachFeature: (f, layer) => {
      const c = f.properties;
      layer.bindTooltip(`<strong>${esc(c.name)}</strong><br>${esc(METRICS[metric].label)}: <b>${fmtMetric(c)}</b>` +
        (c.residential ? `<br>${fmt(c.residents)} residents${popMethod() === 'census2021' ? ` (${CY()} Census count)` : ` today, ${fmt(c.census2021)} at the ${CY()} Census`}` : '<br>Business or industrial area'),
        { sticky: true, className: 'area-tip' });
      layer.on('click', () => select(c.code, true));
      layer.on('mouseover', () => layer.setStyle({ weight: 3, color: line }));
      layer.on('mouseout', () => areaLayer.resetStyle(layer));
    }
  }).addTo(map);
  L.geoJSON(D.geo.ward, { style: { color: '#0369A1', weight: 4, fill: false, interactive: false } }).addTo(areaLayer);

  if (isCity() && D.geo.wards)                 // the whole city: ward lines for orientation, community names when zoomed in
    Object.values(D.geo.wards).forEach(g => L.geoJSON(g, { style: { color: '#0369A1', weight: 1.6, fill: false, interactive: false } }).addTo(areaLayer));
  labelLayer = L.layerGroup();
  if (!isCity() || map.getZoom() >= 13) labelLayer.addTo(map);
  if (!map._labelsByZoom) {
    map._labelsByZoom = true;
    map.on('zoomend', () => { if (!labelLayer) return; const want = !isCity() || map.getZoom() >= 13;
      if (want && !map.hasLayer(labelLayer)) labelLayer.addTo(map); else if (!want && map.hasLayer(labelLayer)) labelLayer.remove(); });
  }
  areaLayer.eachLayer(l => {
    const c = l.feature && l.feature.properties;
    if (!c || !c.residential || !l.getBounds) return;
    L.tooltip({ permanent: true, direction: 'center', className: 'map-label', interactive: false })
      .setLatLng(l.getCenter()).setContent(esc(c.name)).addTo(labelLayer);
  });

  if (layerOn.traffic) {
    const dot = cssv('--danger');
    trafficLayer = L.layerGroup(D.traffic_points.map(p => L.circleMarker([p.lat, p.lon], {
      radius: 4, color: '#fff', weight: 1, fillColor: dot, fillOpacity: .95
    }).bindTooltip(`<strong>${esc(p.where)}</strong><br>${esc(longDate(p.date))}${p.time ? ', ' + esc(p.time) : ''}. Click for details and news.`, { className: 'wrap-tip' })
      .bindPopup(() => trafficPopup(p), { maxWidth: 300 }))).addTo(map);
  }
  if (layerOn.cameras) {
    cameraLayer = L.layerGroup(D.cameras.filter(c => c.near_ward).map(c => L.marker([c.lat, c.lon], { icon: camIcon(), title: c.name })
      .bindPopup(() => `<div class="cam-pop"><strong>${esc(c.name)}</strong><img src="${esc(latestSrc(c.url))}" alt="Traffic camera at ${esc(c.name)}"></div>`, { maxWidth: 300 })))
      .addTo(map);
  }
  if (window.extraMapLayers) extraMapLayers(overlay, layerOn);
  $('#map-sub').textContent = 'Shaded by ' + METRICS[metric].short + (METRICS[metric].perRes ? '. Grey areas have no residents.' : '.');
  renderLegend(sc);
}
function renderLegend(sc) {
  const M = METRICS[metric];
  const f = v => M.pct ? signed(v, 0) : fmt(v, M.d);
  $('#legend').innerHTML = `<div class="legend-title">${esc(M.label)}</div>
    <div class="legend-scale">${sc.ramp.map((col, i) => `<span class="sw" style="background:${col}" title="${f(sc.breaks[i])} to ${f(sc.breaks[i + 1])}"></span>`).join('')}</div>
    <div class="legend-ends fig"><span>${f(sc.breaks[0])}</span><span>${f(sc.breaks[5])}</span></div>`;
}
function renderLayerMenu() {
  const avail = k => ({
    childcare: !!(D.families && D.families.child_care), schools: !!(D.families && D.families.schools),
    devpermits: !!D.development, roadwork: !!((D.roadwork && D.roadwork.length) || (D.projects && D.projects.length) || (D.big_permits && D.big_permits.length)), amenities: !!D.amenities,
    playgrounds: !!(D.amenities && D.amenities.playgrounds), stops: !!(D.amenities && D.amenities.stops),
  }[k] ?? true);
  $('#layer-list').innerHTML = LAYERS.filter(([k]) => avail(k)).map(([k, label]) => `<label class="lyr"><input type="checkbox" data-layer="${k}" ${layerOn[k] ? 'checked' : ''}>
    <span class="lyr-sw lyr-${k}" aria-hidden="true"></span>${esc(label)}</label>`).join('') +
    `<div class="lyr-sep"></div><div class="lyr-note"><span class="sw hatch"></span>Business and industrial areas</div>
     <div class="lyr-note"><span class="ward-line"></span>${W()} &nbsp;<span class="ward-line other"></span>Other wards &nbsp;<span class="ward-line city"></span>City</div>`;
  $$('#layer-list input').forEach(i => i.addEventListener('change', () => {
    layerOn[i.dataset.layer] = i.checked;
    try { localStorage.setItem(layerKey(), JSON.stringify(layerOn)); } catch { /* storage off */ }
    renderMap();
  }));
  const n = LAYERS.filter(([k]) => avail(k) && layerOn[k]).length;
  $('#layers-btn-n').textContent = n ? String(n) : '';
}
$('#layers-btn').addEventListener('click', e => {
  const m = $('#layer-menu');
  m.hidden = !m.hidden;
  e.currentTarget.setAttribute('aria-expanded', String(!m.hidden));
});
document.addEventListener('click', e => { if (!e.target.closest('#layer-menu, #layers-btn')) { $('#layer-menu').hidden = true; $('#layers-btn').setAttribute('aria-expanded', 'false'); } });
$$('#base-seg button').forEach(b => b.addEventListener('click', async () => {
  mapStyle = b.dataset.base;
  setBase();
  renderMap();
  const a = await api();
  if (a.set_map_style) a.set_map_style(mapStyle);
}));
wireSeg($('#metric-seg'), v => { metric = v; renderMap(); renderPanel(selected); });

// ---------- selection shared by map, panel and table
function select(code, zoom = false) {
  renderPanel(code);
  if (code && zoom) zoomToCommunity(code);
  if (!code && zoom) zoomToWard();
  $$('#comm-table tbody tr').forEach(tr => tr.classList.toggle('is-sel', tr.dataset.code === code));
}

// ---------- side panel: ranked list, or one community
function renderPanel(code) {
  const p = $('#panel');
  selected = code;
  if (areaLayer && styleArea) areaLayer.eachLayer(l => { if (l.feature && l.feature.properties.code) l.setStyle(styleArea(l.feature)); });
  if (!code) {
    const M = METRICS[metric], sc = scale();
    const val = c => isNum(c[metric]) ? c[metric] : (metric === 'growth_pct' ? Infinity : null);
    const list = residential().filter(c => val(c) !== null).sort((a, b) => val(b) - val(a));
    const top = Math.max(...list.map(c => isFinite(val(c)) ? Math.abs(val(c)) : 0)) || 1;
    p.innerHTML = `<div class="card-head"><div><h2>Ranked by ${esc(M.short)}</h2><p class="card-sub">Residential communities. Select one for its details.</p></div></div>
      <ol class="rank">${list.map((c, i) => `<li><button data-code="${c.code}" aria-label="${esc(c.name)}, ${fmtMetric(c)}">
        <span class="pos">${i + 1}</span><span class="nm">${esc(c.name)}${c.growing ? '<span class="tag">Growing</span>' : ''}</span><span class="vl">${fmtMetric(c)}</span>
        <span class="bar"><span style="width:${(isFinite(val(c)) ? Math.abs(val(c)) / top * 100 : 100).toFixed(1)}%;background:${metricColor(c, sc)}"></span></span></button></li>`).join('')}</ol>
      <p class="panel-foot">Growing: more than 30% more residents than at the ${CY()} Census, counted with ${popWords()}.</p>`;
    $$('.rank button', p).forEach(b => b.addEventListener('click', () => select(b.dataset.code, true)));
    return;
  }
  const c = D.communities.find(x => x.code === code);
  if (!c) return renderPanel(null);
  const stat = (label, value, extra = '') => `<div class="stat"><dt>${label}</dt><dd>${value}${extra}</dd></div>`;
  const how = { 'people per home': 'homes standing today x 2021 people per home', 'household size': 'new homes x 2021 household size',
    'city average': 'homes standing today x the city-wide people per home (no 2021 count)' }[c.pop_method] || '';
  p.innerHTML = `<button class="back" id="panel-back">${icon('back')}All communities</button>
    <div class="detail">
      <h2>${esc(c.name)}</h2>
      ${c.residential ? `<p class="card-sub">${fmt(c.residents)} residents${popMethod() === 'census2021' ? ` (${CY()} Census count)` : ' today'}. ${CY()} Census: ${c.census2021 ? fmt(c.census2021) : 'not yet built'}.</p>`
        : '<p class="card-sub">Business or industrial area</p>'}
      ${c.growing ? `<span class="flag">${icon('home')}${isNum(c.growth_pct) ? signed(c.growth_pct, 0) + ' since the ' + CY() + ' Census' : 'Built since the ' + CY() + ' Census'}</span>` : ''}
      <dl class="stats">
        ${c.residential ? stat(popMethod() === 'census2021' ? 'Residents (' + CY() + ' Census)' : 'Residents today (' + popChip() + ')', fmt(c.residents), popMethod() === 'census2021' ? '' : chg(c.growth_pct, null, '%', 0, 'the ' + CY() + ' Census')) : ''}
        ${stat('311 requests, ' + esc(D.period), fmt(c.requests12), chg(c.requests_change_pct, null, '%', 1, cmpWords()))}
        ${c.residential ? stat('311 requests per 1,000 a year', fmt(c.requests_per_1000, 0), `<small>${fmt(c.requests_per_1000_prev, 0)} in the comparison period</small>`) : ''}
        ${c.residential ? stat('Infrastructure reports per 1,000 a year', fmt(c.infra_per_1000, 1), `<small>${fmt(c.infra_per_1000_prev, 1)} in the comparison period</small>`) : ''}
        ${stat('Still open as of today', fmt(c.open), `<small>${fmt(c.open_over_90_days)} open more than 90 days</small>`)}
        ${c.residential ? stat('Open requests per 1,000', fmt(c.open_per_1000, 1)) : ''}
        ${stat('Homes in permits issued', fmt(c.issued_homes12), `<small>${fmt(c.new_homes12)} applied for</small>`)}
        ${D.development ? stat('Development permit applications', fmt(c.dev_permits12)) : ''}
        ${communityExtras(c)}
      </dl>
      ${c.residential ? `<p class="drawer-note">${popMethod() === 'model' || (popMethod() === 'city_pace' && !c.census2021) ? `Population (growth model): ${esc(how)}. ` : `Residents counted with ${esc(popWords())}. `}${fmt(c.homes_now)} homes lived in today, ${fmt(c.homes_census)} at the ${CY()} Census.</p>` : ''}
      <h3 class="sub-h">Most common open requests</h3>
      <ul class="open-list">${c.open_top.map(o => `<li><span>${esc(niceType(o.type))}</span><span class="n">${fmt(o.n)}</span><small>Oldest still open: ${esc(o.oldest)}</small></li>`).join('') || '<li><span>None open</span></li>'}</ul>
      ${c.open ? `<button class="btn" id="panel-issues" style="margin-top:12px">${icon('list')}<span>See all ${fmt(c.open)} open issues in ${esc(c.name)}</span></button>` : ''}
    </div>`;
  $('#panel-back').addEventListener('click', () => select(null, true));
  $('#panel-issues')?.addEventListener('click', () => { issueFilter.comm = c.code; $('#f-comm').value = c.code; show('issues'); });
}

function communityExtras(c) {
  if (!c.residential) return '';
  const stat = (label, value, extra = '') => `<div class="stat"><dt>${label}</dt><dd>${value}${extra}</dd></div>`;
  const cc = D.families && D.families.child_care, sc = D.families && D.families.schools, am = D.amenities;
  let out = '';
  const b = cc && cc.by_comm[c.code];
  if (b) out += stat('Licensed child care spaces', fmt(b.spaces), `<small>${isNum(b.per_100_0_14) ? fmt(b.per_100_0_14, 1) + ' per 100 children aged 0 to 14' : ''}</small>`);
  if (sc) {
    const list = sc.schools.filter(x => x.comm === c.code && x.latest);
    out += stat('Students in its schools, ' + esc(sc.latest_year), fmt(list.reduce((t, x) => t + x.latest, 0)), `<small>${list.length} school${list.length === 1 ? '' : 's'}</small>`);
  }
  const a = am && am.by_comm[c.code];
  if (a) out += stat('Playgrounds, transit stops', `${fmt(a.playgrounds)}, ${fmt(a.stops)}`, `<small>${fmt(a.facilities)} recreation facilities, libraries or community centres</small>`);
  return out;
}

// ---------- charts
function chartTheme() {
  Chart.defaults.font.family = "'Fira Sans', 'Segoe UI', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = cssv('--chart-text');
  Chart.defaults.borderColor = cssv('--chart-grid');
}
const tooltipStyle = () => ({
  backgroundColor: cssv('--card-solid') || cssv('--card'), titleColor: cssv('--fg'), bodyColor: cssv('--fg-2'), borderColor: cssv('--border-strong'),
  borderWidth: 1, padding: 10, cornerRadius: 6, boxPadding: 4, animation: { duration: 0 }, caretSize: 6, titleFont: { weight: '600' }, bodyFont: { family: "'Fira Code', monospace" },
});
function renderCharts() {
  chartTheme();
  Object.values(charts).forEach(c => c.destroy());
  const m = D.trend.months, all = D.trend.all, pm = D.trend.prev_months || [], prev = D.trend.prev || [];
  const labels = m.map(x => monthLabel(x, m.length > 12 ? { month: 'short', year: '2-digit' } : { month: 'short' }));
  const c1 = cssv('--chart-1'), c2 = cssv('--chart-2');
  const my = x => x ? monthLabel(x, { month: 'short', year: 'numeric' }) : '';
  const range = (a) => a.length ? `${my(a[0])} to ${my(a[a.length - 1])}` : '';
  $('#trend-sub').textContent = `${W()}, ${range(m)} against ${range(pm)}`;
  charts.trend = new Chart($('#trend'), {
    type: 'line',
    data: { labels, datasets: [
      { label: range(m), data: all, borderColor: c2, backgroundColor: c2, tension: .3, pointRadius: 3, pointHoverRadius: 5, borderWidth: 2.5 },
      { label: 'Comparison: ' + range(pm), data: prev, borderColor: c1, backgroundColor: c1, borderDash: [6, 4], tension: .3, pointRadius: 0, pointHoverRadius: 4, borderWidth: 2 }] },
    options: {
      maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      layout: { padding: { bottom: 4 } },
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'line', boxWidth: 28, padding: 14 } },
        tooltip: { ...tooltipStyle(), callbacks: {
          title: () => '',
          label: ctx => ` ${my(ctx.datasetIndex ? pm[ctx.dataIndex] : m[ctx.dataIndex])}: ${fmt(ctx.parsed.y)}`,
          afterBody: items => {
            const i = items[0].dataIndex, a = all[i], b = prev[i];
            return isNum(a) && b ? ` Change: ${signed(pct(a, b), 1)}` : '';
          } } },
      },
      scales: { y: { beginAtZero: true, grid: { color: cssv('--chart-grid') }, border: { display: false }, ticks: { callback: v => fmt(v) } },
                x: { grid: { display: false } } }
    }
  });
  const top = D.open_by_type.slice(0, 8);
  const short = t => { const s = niceType(t); return s.length > 30 ? s.slice(0, 29) + '…' : s; };
  charts.open = new Chart($('#open-types'), {
    type: 'bar',
    data: { labels: top.map(t => short(t.type)), datasets: [{ label: 'Open requests', data: top.map(t => t.n), backgroundColor: cssv('--chart-bar'), borderRadius: 3, barPercentage: .75 }] },
    options: {
      indexAxis: 'y', maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { ...tooltipStyle(), callbacks: {
        title: items => niceType(top[items[0].dataIndex].type),
        label: ctx => ` ${fmt(ctx.parsed.x)} open`, afterLabel: ctx => ' Oldest still open: ' + top[ctx.dataIndex].oldest } } },
      scales: { x: { grid: { color: cssv('--chart-grid') }, border: { display: false }, ticks: { callback: v => fmt(v) } },
                y: { grid: { display: false }, ticks: { font: { size: 11 }, color: cssv('--fg-2') } } }
    }
  });
}

// ---------- newest reports
function feedItems(n) {
  return D.newest.slice(0, n).map(r => ({ ...r, name: commName(r.comm) }));
}
function renderFeed() {
  $('#feed').innerHTML = feedItems(14).map(r => `<li><span class="t">${esc(niceType(r.type))}</span>
    <span class="status-tag ${r.status === 'Open' ? 'open' : 'closed'}">${esc(r.status)}</span>
    <span class="m">${esc(r.name)}, ${longDate(r.date)}. Request ${esc(r.id)}</span></li>`).join('');
}

// ---------- population today against the 2021 Census
function renderPopulation() {
  const list = residential().slice().sort((a, b) => b.residents - a.residents);
  const top = Math.max(...list.map(c => Math.max(c.residents || 0, c.census2021 || 0)), 1);
  $('#pop-sub').textContent = `${W()}: ${fmt(D.ward.residents)} today, ${fmt(D.ward.census2021)} at the ${CY()} Census (${signed(D.ward.growth_pct, 1)}). Recalculated at every refresh.`;
  $('#popcmp').innerHTML = `<div class="popcmp">${list.map(c => `<div class="prow">
      <span class="lbl" title="${esc(c.name)}">${esc(c.name)}</span>
      <span class="ptrack" title="${fmt(c.residents)} today, ${fmt(c.census2021)} in 2021"><span class="m" style="width:${(c.residents / top * 100).toFixed(1)}%"></span>
        ${c.census2021 ? `<i class="c" style="left:calc(${(c.census2021 / top * 100).toFixed(1)}% - 1px)"></i>` : ''}</span>
      <span class="v">${fmt(c.residents)}<small>${c.census2021 ? `2021: ${fmt(c.census2021)} (${signed(c.growth_pct, 0)})` : 'Built since ' + CY() + ''}</small></span></div>`).join('')}</div>
    <div class="pop-legend"><span><i></i>Today, ${esc(popWords())}</span><span><i class="c"></i>${CY()} Census</span></div>`;
}

// ---------- requests by City service area
function renderAreas() {
  const list = D.service_areas.slice(0, 9);
  const top = Math.max(...list.map(a => Math.max(a.n12, a.prev)), 1);
  $('#areas-sub').textContent = `${D.period}, with the change from ${cmpWords()}`;
  $('#areas').innerHTML = `<ul class="hbars">${list.map(a => `<li><span class="lbl" title="${esc(a.area)}">${esc(a.area)}</span>
    <span class="track"><span style="width:${a.n12 / top * 100}%"></span></span>
    <span class="v">${fmt(a.n12)}<small>${signed(a.change_pct, 0)}</small></span></li>`).join('')}</ul>`;
}

// ---------- cameras
// Each camera: the City publishes one still image, replaced about once a minute. The app keeps the images of the
// last 30 minutes (camfeed.py) and plays them on a loop, oldest to newest, holding on the newest.
const REPLAY = {};                         // url -> [{t, src}]
const FRAME_MS = 450, HOLD_FRAMES = 6;     // speed of the loop; pause on the newest image
let replayTick = 0;
const clockTime = t => new Date(t * 1000).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
function latestSrc(url) { const f = REPLAY[url]; return f && f.length ? f[f.length - 1].src : camSrc(url); }
function camCard(c) {
  const f = REPLAY[c.url] || [];
  // labels sit above and below the picture, never on it, so the camera's own date and time stay readable
  return `<button class="cam" data-cam="${esc(c.url)}" aria-label="Traffic camera at ${esc(c.name)}, replay of the last 30 minutes">
    <span class="cam-top">${c.in_ward ? '<span class="badge-in">' + W() + '</span>' : c.near_ward ? '<span class="badge-in near">Nearby</span>' : '<span></span>'}
    <span class="live" data-stamp>${f.length ? clockTime(f[f.length - 1].t) : 'Latest'}</span></span>
    <span class="cam-pic"><img src="${esc(latestSrc(c.url))}" alt="" loading="lazy" onerror="this.style.visibility='hidden';this.nextElementSibling.hidden=false">
    <span class="off" hidden>Camera offline</span>
    <span class="progress" aria-hidden="true"><i></i></span></span>
    <span class="cap">${esc(c.name)}</span></button>`;
}
function wardCams() { return D.cameras.filter(c => c.near_ward).sort((a, b) => (b.in_ward - a.in_ward) || a.name.localeCompare(b.name)); }
function renderCamStrip() { $('#camstrip').innerHTML = wardCams().filter(c => c.in_ward).slice(0, 4).map(camCard).join(''); }
let camScope = 'ward';
function renderCameraWall() {
  if (!D) return;
  const list = camScope === 'ward' ? wardCams() : D.cameras.slice().sort((a, b) => a.name.localeCompare(b.name));
  $('#cam-sub').textContent = `${list.length} cameras ${camScope === 'ward' && !isCity() ? `in and near ${W()} (${D.cameras.filter(c => c.in_ward).length} inside the ward)` : 'across Calgary'}. Each plays its images from the last 30 minutes on a loop; the City adds a new image about once a minute.`;
  $('#camgrid').innerHTML = list.map(camCard).join('');
  watchCams();
}
wireSeg($('#cam-seg'), v => { camScope = v; renderCameraWall(); });

// which cameras the app collects: Ward 5 and nearby always, plus whatever is on screen
async function watchCams() {
  if (!D) return;
  const urls = wardCams().map(c => c.url).concat($$('.cam[data-cam]').map(b => b.dataset.cam));
  const a = await api();
  if (a.cam_watch) a.cam_watch([...new Set(urls)]);
}
function b64ToUrl(b64) {
  const bin = atob(b64), buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([buf], { type: 'image/jpeg' }));
}
let pulling = false;
async function pullFrames() {
  if (pulling) return;
  pulling = true;
  try {
    const a = await api();
    if (!a.cam_frames) return;
    for (let round = 0; round < 40; round++) {          // the first pull after a restart comes in parts
      const seen = {};
      Object.entries(REPLAY).forEach(([u, f]) => { if (f.length) seen[u] = f[f.length - 1].t; });
      const res = await a.cam_frames(seen);
      if (!res || !res.ok) return;
      const cutoff = res.now - res.keep_minutes * 60;
      Object.entries(res.frames).forEach(([u, list]) => {
        const f = REPLAY[u] || (REPLAY[u] = []);
        list.forEach(x => f.push({ t: x.t, src: b64ToUrl(x.jpg) }));
      });
      Object.values(REPLAY).forEach(f => { while (f.length && f[0].t < cutoff) URL.revokeObjectURL(f.shift().src); });
      if (!res.more) break;
    }
  } finally { pulling = false; }
}
// one clock drives every camera on screen
function stepReplay() {
  if (document.hidden) return;
  replayTick++;
  const tiles = $$('.cam[data-cam]').filter(b => b.offsetParent !== null);
  tiles.forEach(b => {
    const url = b.dataset.cam, f = REPLAY[url];
    const img = $('img', b), stamp = $('[data-stamp]', b), bar = $('.progress i', b);
    if (!img) return;
    if (!f || f.length < 2) {
      if (stamp) stamp.textContent = f && f.length ? `${clockTime(f[0].t)}, replay starting` : 'Latest';
      if (bar) bar.style.width = '0';
      return;
    }
    const span = f.length + HOLD_FRAMES;
    let i = replayTick % span;
    if (i >= f.length) i = f.length - 1;
    b.dataset.i = i;
    if (img.getAttribute('src') !== f[i].src) img.src = f[i].src;
    img.style.visibility = '';
    if (stamp) stamp.textContent = i === f.length - 1 ? `Now ${clockTime(f[i].t)}` : clockTime(f[i].t);
    if (stamp) stamp.classList.toggle('past', i !== f.length - 1);
    if (bar) bar.style.width = (f.length > 1 ? i / (f.length - 1) * 100 : 100) + '%';
  });
}
setInterval(stepReplay, FRAME_MS);
setInterval(pullFrames, 10000);
setInterval(watchCams, 60000);

// ---------- the camera viewer: play, pause, step, drag through the last 30 minutes, speed
const VW = { url: null, i: 0, playing: true, speed: 1, hold: 0, timer: null };
function viewerFrames() { return REPLAY[VW.url] || []; }
function drawViewer() {
  const f = viewerFrames(), box = $('#viewer-box');
  const img = $('#viewer-img'), stamp = $('[data-stamp]', box), bar = $('.progress i', box), range = $('#viewer-range');
  if (!f.length) {
    img.src = camSrc(VW.url);
    stamp.textContent = 'Latest'; bar.style.width = '0';
    range.max = 0; range.value = 0; range.disabled = true;
    $('#viewer-count').textContent = 'Collecting images: the replay starts once the City posts its next image (about a minute).';
    return;
  }
  VW.i = Math.max(0, Math.min(VW.i, f.length - 1));
  const fr = f[VW.i], last = VW.i === f.length - 1;
  if (img.getAttribute('src') !== fr.src) img.src = fr.src;
  stamp.textContent = (last ? 'Now ' : '') + clockTime(fr.t);
  stamp.classList.toggle('past', !last);
  bar.style.width = (f.length > 1 ? VW.i / (f.length - 1) * 100 : 100) + '%';
  range.disabled = f.length < 2; range.max = f.length - 1; range.value = VW.i;
  $('#viewer-count').textContent = `Image ${VW.i + 1} of ${f.length}: ${clockTime(f[0].t)} to ${clockTime(f[f.length - 1].t)}`;
}
function viewerTick() {
  if ($('#viewer').hidden || !VW.playing) return;
  const f = viewerFrames();
  if (f.length < 2) { drawViewer(); return; }
  if (VW.i >= f.length - 1) { if (++VW.hold < HOLD_FRAMES) return; VW.hold = 0; VW.i = 0; } else VW.i++;
  drawViewer();
}
function setViewerSpeed(n) {
  VW.speed = n;
  clearInterval(VW.timer);
  VW.timer = setInterval(viewerTick, FRAME_MS / n);
  $$('#viewer-speed button').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.speed === n)));
}
function setViewerPlaying(on) {
  VW.playing = on;
  const b = $('#viewer-play');
  b.innerHTML = `${icon(on ? 'pause' : 'play')}<span>${on ? 'Pause' : 'Play'}</span>`;
}
function stepViewer(d) { setViewerPlaying(false); VW.i += d; drawViewer(); }
document.addEventListener('click', e => {
  const b = e.target.closest('.cam');
  if (!b || !D) return;
  const c = D.cameras.find(x => x.url === b.dataset.cam);
  if (!c) return;
  VW.url = c.url; VW.i = Math.max(0, viewerFrames().length - 1); VW.hold = 0;
  $('#viewer-box').dataset.cam = c.url;
  $('#viewer-name').textContent = c.name;
  $('#viewer-img').alt = 'Traffic camera at ' + c.name;
  $('#viewer-note').textContent = `${c.in_ward ? 'Inside ' + W() + '' : c.near_ward ? 'Near ' + W() + '' : c.quadrant + ' Calgary'}. City of Calgary traffic camera. The City posts a still image about once a minute and keeps no recording; this replay is the images this app collected in the last 30 minutes. Keys: space plays or pauses, the arrows step.`;
  $('#viewer').hidden = false;
  setViewerPlaying(true);
  setViewerSpeed(VW.speed);
  VW.i = 0;
  drawViewer();
  $('#viewer-close').focus();
});
$('#viewer-close').addEventListener('click', () => { $('#viewer').hidden = true; });
$('#viewer').addEventListener('click', e => { if (e.target.id === 'viewer') $('#viewer').hidden = true; });
$('#viewer-play').addEventListener('click', () => setViewerPlaying(!VW.playing));
$('#viewer-prev').addEventListener('click', () => stepViewer(-1));
$('#viewer-next').addEventListener('click', () => stepViewer(1));
$('#viewer-range').addEventListener('input', e => { setViewerPlaying(false); VW.i = +e.target.value; drawViewer(); });
$$('#viewer-speed button').forEach(b => b.addEventListener('click', () => setViewerSpeed(+b.dataset.speed)));
$('#viewer-latest').addEventListener('click', () => { setViewerPlaying(false); VW.i = viewerFrames().length - 1; drawViewer(); });
document.addEventListener('keydown', e => {
  if ($('#viewer').hidden || e.target.matches('input[type=text], textarea')) return;
  if (e.key === ' ') { e.preventDefault(); setViewerPlaying(!VW.playing); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); stepViewer(-1); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); stepViewer(1); }
});
setInterval(() => $$('img').forEach(img => {        // cameras with no replay yet: fetch the newest image each minute
  if (img.src.includes('trafficcam.calgary.ca')) img.src = img.src.replace(/t=\d+/, 't=' + Math.floor(Date.now() / 60000));
}), 60000);

// ---------- Ward 5 against Calgary
function renderBench() {
  const s = D.summary;
  $('#bench-sub').textContent = D.period;
  const pair = (title, ward, city, higherIsGood) => {
    const top = Math.max(ward, city, 1);
    return `<div class="pair">
      <div class="pair-head"><span>${title}</span>${chg(ward - city, higherIsGood === null ? null : !higherIsGood, ' pts', 1, 'Calgary as a whole')}</div>
      <div class="pair-row"><span>${W()}</span><span class="track"><span style="width:${ward / top * 100}%"></span></span><span class="v">${fmt(ward, 1)}%</span></div>
      <div class="pair-row city"><span>Calgary</span><span class="track"><span style="width:${city / top * 100}%"></span></span><span class="v">${fmt(city, 1)}%</span></div>
    </div>`;
  };
  $('#bench').innerHTML = pair('Closed requests that were closed within 7 days', s.closed_7_days_pct, s.closed_7_days_pct_city, true) +
    pair('Requests made through the 311 app', s.app_share_pct, s.app_share_pct_city, null) +
    `<p class="card-note">The chips show the gap in percentage points between ${W()} and the city as a whole.</p>`;
}

// ---------- social disorder
function renderDisorder() {
  const pd = D.crime && D.crime.disorder;
  if (pd) {
    $('#dis-title').textContent = 'Disorder calls to police';
    $('#dis-sub').textContent = `${D.crime.period}, Calgary Police Service`;
    const top = Math.max(...pd.by_type.map(c => c.n), 1);
    $('#disorder').innerHTML = `<div class="big"><span class="kpi-value">${fmt(pd.n)}</span>${chg(pd.change_pct, true, '%', 1, 'the same months a year before')}
        <span class="kpi-foot">${fmt(pd.prev)} a year before</span></div>
      <ul class="hbars">${pd.by_type.map(c => `<li><span class="lbl" title="${esc(c.type)}">${esc(c.type)}</span>
        <span class="track"><span style="width:${c.n / top * 100}%"></span></span><span class="v">${fmt(c.n)}</span></li>`).join('')}</ul>
      <p class="card-note">Calls from the public about disorder, by event. The police changed what counts as disorder in 2025, so the change from a year before may partly reflect the new definition, and earlier years are not directly comparable.</p>`;
    return;
  }
  const d = D.disorder;
  if (!d) { $('#dis-sub').textContent = ''; $('#disorder').innerHTML = '<p class="card-sub">No public data is available.</p>'; return; }
  $('#dis-sub').textContent = d.period + ', latest public data';
  const top = Math.max(...d.by_category.map(c => c.n), 1);
  $('#disorder').innerHTML = `<div class="big"><span class="kpi-value">${fmt(d.last12)}</span>${chg(d.change_pct, true)}
      <span class="kpi-foot">${fmt(d.prev12)} the year before</span></div>
    <ul class="hbars">${d.by_category.map(c => `<li><span class="lbl" title="${esc(titleCase(c.category))}">${esc(titleCase(c.category))}</span>
      <span class="track"><span style="width:${c.n / top * 100}%"></span></span><span class="v">${fmt(c.n)}</span></li>`).join('')}</ul>
    <p class="card-note">This data ends ${esc(d.data_ends)}. Community crime statistics are no longer published as open data.</p>`;
}

// ---------- communities table
const COLS = [
  { key: 'name', label: 'Community', text: true },
  { key: 'residents', label: 'Residents', d: 0, perRes: true },
  { key: 'census2021', label: '' + CY() + ' Census', d: 0, perRes: true },
  { key: 'growth_pct', label: 'Growth', d: 0, perRes: true, pctv: true },
  { key: 'requests12', label: '311 requests', d: 0 },
  { key: 'requests_change_pct', label: 'Change', change: true },
  { key: 'requests_per_1000', label: 'Per 1,000 a year', d: 0, perRes: true, bar: true },
  { key: 'infra_per_1000', label: 'Infrastructure per 1,000', d: 1, perRes: true },
  { key: 'open', label: 'Still open', d: 0 },
  { key: 'open_over_90_days', label: 'Open 90+ days', d: 0 },
  { key: 'issued_homes12', label: 'Homes in permits issued', d: 0 },
  { key: 'dev_permits12', label: 'Development permits', d: 0 },
];
function renderTable() {
  $('#comm-head').innerHTML = COLS.map(c => {
    const on = c.key === sortKey;
    const aria = on ? (sortDir > 0 ? 'ascending' : 'descending') : 'none';
    return `<th scope="col" class="has-sort ${c.text ? '' : 'num'}" aria-sort="${aria}"><button class="sort" data-key="${c.key}">${c.label}<span class="arr" aria-hidden="true">${on ? (sortDir > 0 ? '↑' : '↓') : ''}</span></button></th>`;
  }).join('');
  $$('#comm-head .sort').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.key;
    if (k === sortKey) sortDir = -sortDir; else { sortKey = k; sortDir = k === 'name' ? 1 : -1; }
    renderTable();
    $(`#comm-head .sort[data-key="${k}"]`).focus();
  }));
  const rows = D.communities.filter(c => areas === 'all' || c.residential);
  rows.sort((a, b) => {
    const x = a[sortKey], y = b[sortKey];
    if (sortKey === 'name') return sortDir * String(x).localeCompare(String(y));
    if (!isNum(x) && !isNum(y)) return 0;
    if (!isNum(x)) return 1;
    if (!isNum(y)) return -1;
    return sortDir * (x - y);
  });
  const barTop = Math.max(...residential().map(c => c.requests_per_1000).filter(isNum), 1);
  const cell = (c, col) => {
    const v = c[col.key];
    if (col.text) return `<td class="name-cell">${esc(v)}${c.growing ? '<span class="tag">Growing</span>' : ''}</td>`;
    if (col.perRes && !c.residential) return '<td class="num dash">–</td>';
    if (col.key === 'census2021' && !v) return '<td class="num dash">not built</td>';
    if (col.change) return `<td class="num">${isNum(v) ? chg(v, null) : '<span class="dash">–</span>'}</td>`;
    if (col.pctv) return `<td class="num">${isNum(v) ? signed(v, 0) : '<span class="dash">new</span>'}</td>`;
    if (col.bar && isNum(v)) return `<td class="num"><span class="cell-bar"><i style="width:${Math.round(v / barTop * 56)}px"></i>${fmt(v, col.d)}</span></td>`;
    return `<td class="num">${fmt(v, col.d)}</td>`;
  };
  $('#comm-table tbody').innerHTML = rows.map(c => `<tr data-code="${c.code}" class="pick ${c.residential ? '' : 'nonres'} ${c.code === selected ? 'is-sel' : ''}" tabindex="0" aria-label="${esc(c.name)}, show on the map">
    ${COLS.map(col => cell(c, col)).join('')}</tr>`).join('');
  $$('#comm-table tbody tr').forEach(tr => {
    const pick = () => { select(tr.dataset.code, true); $('#view-dashboard').scrollTo({ top: 0, behavior: 'smooth' }); };
    tr.addEventListener('click', pick);
    tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });
}
wireSeg($('#area-seg'), v => { areas = v; renderTable(); });

function renderNotes() {
  $('#notes').innerHTML = '<ul>' +
    '<li>Growing: more than 30% more residents than at the ' + CY() + ' Census, or built since then.</li>' +
    D.notes.map(n => `<li>${esc(n)}</li>`).join('') +
    `<li>Sources: City of Calgary Open Data. ${Object.entries(D.sources).map(([k, v]) => `${esc(k)} (${esc(v)})`).join(', ')}.</li></ul>`;
}

// ================================================================ OPEN ISSUES
const issueFilter = { text: '', comm: '', area: '', age: 0, sort: 'old', year: '', nocontact: false };
let issueShown = 150, issueRows = [], issueSel = null;
const STUDY = ['2024-10-01', '2026-10-01'];
function fillIssueFilters() {
  const comms = [...new Set(D.open_list.map(r => r.comm))].map(c => [c, commName(c)]).sort((a, b) => a[1].localeCompare(b[1]));
  $('#f-comm').innerHTML = '<option value="">All of ' + W() + '</option>' + comms.map(([c, n]) => `<option value="${esc(c)}">${esc(n)}</option>`).join('');
  $('#f-comm').value = issueFilter.comm;
  const counts = {};
  D.open_list.forEach(r => { counts[r.area] = (counts[r.area] || 0) + 1; });
  $('#f-area').innerHTML = '<option value="">All services</option>' + Object.entries(counts).sort((a, b) => b[1] - a[1])
    .map(([a, n]) => `<option value="${esc(a)}">${esc(a)} (${fmt(n)})</option>`).join('');
  $('#f-area').value = issueFilter.area;
  const years = {};
  D.open_list.forEach(r => { const y = r.date.slice(0, 4); years[y] = (years[y] || 0) + 1; });
  const inStudy = D.open_list.filter(r => r.date >= STUDY[0] && r.date < STUDY[1]).length;
  $('#f-year').innerHTML = '<option value="">Any year</option>' +
    `<option value="study">Study period, Oct 2024 to Sep 2026 (${fmt(inStudy)})</option>` +
    Object.keys(years).sort().reverse().map(y => `<option value="${y}">${y} (${fmt(years[y])})</option>`).join('');
  $('#f-year').value = issueFilter.year;
}
function filteredIssues() {
  const q = issueFilter.text.trim().toLowerCase();
  let rows = D.open_list.filter(r => (!issueFilter.comm || r.comm === issueFilter.comm) && (!issueFilter.area || r.area === issueFilter.area)
    && (!issueFilter.age || daysSince(r.date) > issueFilter.age)
    && (!issueFilter.year || (issueFilter.year === 'study' ? r.date >= STUDY[0] && r.date < STUDY[1] : r.date.startsWith(issueFilter.year)))
    && (!issueFilter.nocontact || r.type !== '311 Contact Us')
    && (!q || [r.id, r.type, r.address, r.agency, commName(r.comm)].join(' ').toLowerCase().includes(q)));
  if (issueFilter.sort === 'new') rows = rows.slice().reverse();
  if (issueFilter.sort === 'type') rows = rows.slice().sort((a, b) => a.type.localeCompare(b.type) || a.date.localeCompare(b.date));
  return rows;
}
function renderIssues(reset = true) {
  if (!D) return;
  if (window.syncTrack311) syncTrack311();
  if (reset) issueShown = 150;
  issueRows = filteredIssues();
  if (isCity()) { renderCityIssues(); return; }
  $('#issues-city').hidden = true;
  $('#issues-export').hidden = false;
  $$('#view-issues .filters, #view-issues .issues-card').forEach(e => { e.hidden = false; });
  const all = D.open_list, over90 = all.filter(r => daysSince(r.date) > 90).length, over365 = all.filter(r => daysSince(r.date) > 365).length;
  const contact = all.filter(r => r.type === '311 Contact Us').length;
  const newest = all.reduce((m, r) => (r.date && r.date > m ? r.date : m), '');
  $('#issues-sub').textContent = `Every 311 request still open in ${W()} as of the last refresh (${longDate(D.built_at)}), whenever it was made.`
    + (newest ? ` The City publishes its 311 file once a day, a day behind: the newest requests in it are from ${longDate(newest)}.` : '');
  $('#issue-stats').innerHTML = [
    [fmt(all.length), 'still open as of today'], [fmt(over90), 'open more than 90 days', 'bad'], [fmt(over365), 'open more than a year', 'bad'],
    [fmt(contact), '"311 Contact Us" messages'],
    [all.length ? longDate(all[0].date) : '–', 'oldest still open', 'bad']].map(([b, s, cls]) => `<div class="istat ${cls || ''}"><b>${b}</b><span>${s}</span></div>`).join('');
  $('#issues-table tbody').innerHTML = issueRows.slice(0, issueShown).map((r, i) => {
    const age = daysSince(r.date);
    return `<tr class="pick ${r.id === issueSel ? 'is-sel' : ''}" data-i="${i}" tabindex="0" aria-label="Request ${esc(r.id)}, ${esc(niceType(r.type))}, show details">
      <td class="mono">${esc(r.id)}</td><td>${esc(r.date)}</td><td class="num"><span class="age ${age > 365 ? 'old' : ''}">${fmt(age)}</span></td>
      <td>${esc(niceType(r.type))}</td><td>${esc(commName(r.comm))}</td><td>${esc(r.agency)}</td><td>${esc(r.updated)}</td></tr>`;
  }).join('') || '<tr><td colspan="7" class="empty">No open issues match these filters.</td></tr>';
  $('#issues-count').textContent = `Showing ${fmt(Math.min(issueShown, issueRows.length))} of ${fmt(issueRows.length)} matching open issues`;
  $('#issues-more').hidden = issueShown >= issueRows.length;
  $$('#issues-table tbody tr.pick').forEach(tr => {
    const open = () => {
      $$('#issues-table tbody tr.is-sel').forEach(x => x.classList.remove('is-sel'));
      tr.classList.add('is-sel');
      openIssue(issueRows[+tr.dataset.i]);
    };
    tr.addEventListener('click', open);
    tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
}
// the whole city has too many open requests to list here: show the count for each ward, and pick a ward to list its own
function renderCityIssues() {
  const s = D.summary || {}, ws = D.wards_summary;
  $('#issues-sub').textContent = `311 requests still open in Calgary as of the last refresh (${longDate(D.built_at)}). Choose a ward to list them.`;
  $('#issue-stats').innerHTML = [[fmt(s.open_now), 'still open as of today'], [fmt(s.open_over_90_days), 'open more than 90 days', 'bad'],
    [fmt(s.open_per_1000, 1), 'open per 1,000 residents']].map(([b, t, cls]) => `<div class="istat ${cls || ''}"><b>${b}</b><span>${t}</span></div>`).join('');
  $$('#view-issues .filters, #view-issues .issues-card').forEach(e => { e.hidden = true; });
  $('#issues-export').hidden = true;
  const box = $('#issues-city');
  box.hidden = false;
  const rows = ws ? [...ws.wards].sort((a, b) => (b.open_per_1000 || 0) - (a.open_per_1000 || 0)) : [];
  box.innerHTML = `<div class="card-head"><div><h2>Open requests in each ward</h2><p class="card-sub">Most open per 1,000 residents first. Choose a ward to list its requests one by one.</p></div></div>
    <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Ward</th><th scope="col">Councillor</th><th scope="col" class="num">Still open</th><th scope="col" class="num">Open more than 90 days</th><th scope="col" class="num">Open per 1,000 residents</th><th scope="col"></th></tr></thead><tbody>
    ${rows.map(r => `<tr><td>Ward ${r.ward}</td><td>${esc(r.councillor || '')}</td><td class="num">${fmt(r.open)}</td><td class="num">${fmt(r.open_over_90_days)}</td><td class="num">${fmt(r.open_per_1000, 1)}</td>
      <td><button type="button" class="link-btn" data-scope-ward="${r.ward}">List Ward ${r.ward}'s requests</button></td></tr>`).join('')}</tbody></table></div>`;
  $('#issues-count').textContent = '';
  $('#issues-more').hidden = true;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-scope-ward]');
  if (!b) return;
  const sel = $('#scope-sel');
  if (sel) sel.value = b.dataset.scopeWard;
  setScope(b.dataset.scopeWard);
});
$('#issues-more').addEventListener('click', () => { issueShown += 300; renderIssues(false); });
let typing;
$('#f-text').addEventListener('input', e => { clearTimeout(typing); typing = setTimeout(() => { issueFilter.text = e.target.value; renderIssues(); }, 200); });
$('#f-comm').addEventListener('change', e => { issueFilter.comm = e.target.value; renderIssues(); });
$('#f-area').addEventListener('change', e => { issueFilter.area = e.target.value; renderIssues(); });
$('#f-age').addEventListener('change', e => { issueFilter.age = +e.target.value; renderIssues(); });
$('#f-sort').addEventListener('change', e => { issueFilter.sort = e.target.value; renderIssues(); });
$('#f-year').addEventListener('change', e => { issueFilter.year = e.target.value; renderIssues(); });
$('#f-nocontact').addEventListener('change', e => { issueFilter.nocontact = e.target.checked; renderIssues(); });

const recordUrl = id => 'https://data.calgary.ca/resource/iahh-g8bj.json?service_request_id=' + encodeURIComponent(id);
const mapsUrl = (lat, lon) => `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
const atCentre = r => /centre/i.test(r.where || '') || !r.address;
let drawerMap = null;
function issueFacts(r) {
  const how = { App: 'The 311 Calgary app', Web: 'The 311 website', Other: 'Phone or other' }[r.source] || r.source || '–';
  return [['Opened', longDate(r.date)], ['Last update', longDate(r.updated)], ['Open for', dayWord(daysSince(r.date))],
    ['Community', commName(r.comm)], ...(r.address ? [['Address', r.address]] : []), ['Department', r.agency || '–'],
    ['Service', r.area], ['Reported through', how],
    ['Location', atCentre(r) ? 'The City publishes the community for this request, not its location' : (r.where || '–')]];
}
function openIssue(r) {
  const dr = $('#drawer');
  issueSel = r.id;
  dr.innerHTML = `<div class="drawer-head"><div><p class="card-sub">Request</p><p class="req-num mono">${esc(r.id)}</p><h2>${esc(niceType(r.type))}</h2></div>
      <button class="brief-close" id="drawer-close" aria-label="Close details" style="color:var(--fg);border-color:var(--border-strong)">${icon('x')}</button></div>
    <span class="flag" style="align-self:flex-start">${icon('clock')}Still open after ${dayWord(daysSince(r.date))}</span>
    <dl>${issueFacts(r).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    <div class="mini-map" id="drawer-map" aria-label="Map of ${esc(commName(r.comm))}"></div>
    <div class="drawer-actions">
      <button class="btn primary" id="dr-page">${icon('print')}<span>Request page: print or save as PDF</span></button>
      <button class="btn" id="dr-city">${icon('open')}<span>City's 311 data page</span></button>
      ${!atCentre(r) && isNum(r.lat) ? `<button class="btn" id="dr-maps">${icon('pin')}<span>Location in Google Maps</span></button>` : ''}
      <button class="btn" id="dr-copy">${icon('file')}<span>Copy request number</span></button>
      <button class="btn" id="dr-dash">${icon('dashboard')}<span>Show ${esc(commName(r.comm))} on the dashboard</span></button>
    </div>
    <p class="drawer-note">The City's 311 status page only shows a request to the person who filed it. On the City's data page, search for the request number. Residents can check theirs with the link in their confirmation email or by calling 311.</p>
    <p class="drawer-note"><button class="link-btn small" id="dr-record">Developer record (raw data)</button></p>`;
  dr.hidden = false;
  $('#drawer-close').focus();
  $('#drawer-close').addEventListener('click', () => { dr.hidden = true; issueSel = null; $$('#issues-table tr.is-sel').forEach(x => x.classList.remove('is-sel')); });
  $('#dr-record').addEventListener('click', () => openUrl(recordUrl(r.id)));
  $('#dr-city').addEventListener('click', () => openUrl(D.dataset_page || 'https://data.calgary.ca/d/iahh-g8bj'));
  $('#dr-maps')?.addEventListener('click', () => openUrl(mapsUrl(r.lat, r.lon)));
  $('#dr-page').addEventListener('click', () => openRecordPage(r));
  $('#dr-copy').addEventListener('click', async e => {
    try { await navigator.clipboard.writeText(r.id); e.currentTarget.lastElementChild.textContent = 'Copied'; } catch { /* clipboard blocked */ }
  });
  $('#dr-dash').addEventListener('click', () => { dr.hidden = true; show('dashboard'); select(r.comm, true); $('#view-dashboard').scrollTo({ top: 0, behavior: 'smooth' }); });
  if (drawerMap) { drawerMap.remove(); drawerMap = null; }
  drawerMap = L.map('drawer-map', { zoomControl: false, attributionControl: false });
  baseLayer(mapStyle === 'grey' ? 'grey' : 'street').addTo(drawerMap);
  const g = D.geo.communities[r.comm];
  if (g && atCentre(r)) {
    const lay = L.geoJSON(g, { style: { color: '#0369A1', weight: 3, fillColor: '#38BDF8', fillOpacity: .2 } }).addTo(drawerMap);
    drawerMap.fitBounds(lay.getBounds(), { padding: [10, 10] });
  } else if (isNum(r.lat)) {
    drawerMap.setView([r.lat, r.lon], 15);
    L.circleMarker([r.lat, r.lon], { radius: 8, color: '#fff', weight: 2, fillColor: cssv('--danger'), fillOpacity: 1 }).addTo(drawerMap);
  } else drawerMap.fitBounds(wardBounds());
  setTimeout(() => drawerMap && drawerMap.invalidateSize(), 60);
}
// a clean page for one request, for casework files: print it or save it as a PDF from the print window
function openRecordPage(r) {
  const pg = $('#record');
  pg.innerHTML = `<div class="record-sheet">
    <div class="record-tools no-print"><button class="btn primary" id="rec-print">${icon('print')}<span>Print or save as PDF</span></button>
      <button class="btn" id="rec-close">${icon('x')}<span>Close</span></button></div>
    <header class="record-head"><img src="logo.svg" alt="" width="40" height="40"><div><strong>Calgary Data Desk</strong><span>Office of Councillor ${esc(D.ward.councillor || '')}</span></div></header>
    <p class="card-sub">311 service request</p>
    <h1 class="mono">${esc(r.id)}</h1>
    <h2>${esc(niceType(r.type))}</h2>
    <p class="record-status">Status: <b>Open</b>, ${dayWord(daysSince(r.date))} since it was made</p>
    <table class="record-table">${issueFacts(r).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>
    <div class="mini-map record-map" id="record-map"></div>
    <footer class="record-foot">Source: City of Calgary, 311 Service Requests open data (data.calgary.ca, dataset iahh-g8bj), as of ${esc(stampText(D.built_at))} Calgary time.
      The City publishes the community for each request, not its address. Printed ${esc(stampText(localYmd() + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ })))}</footer></div>`;
  pg.hidden = false;
  $('#rec-close').addEventListener('click', () => { pg.hidden = true; });
  $('#rec-print').addEventListener('click', () => window.print());
  const rm = L.map('record-map', { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false });
  BASES.grey().addTo(rm);
  const g = D.geo.communities[r.comm];
  if (g) rm.fitBounds(L.geoJSON(g, { style: { color: '#0369A1', weight: 3, fillColor: '#38BDF8', fillOpacity: .25 } }).addTo(rm).getBounds(), { padding: [10, 10] });
  setTimeout(() => rm.invalidateSize(), 60);
}
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('#record').hidden) $('#record').hidden = true;
  else if (!$('#viewer').hidden) $('#viewer').hidden = true;
  else if (!$('#drawer').hidden) $('#drawer').hidden = true;
  else if (!$('#brief').hidden) closeBrief();
});
$('#issues-export').addEventListener('click', e => {
  if (!D) return;
  const cols = ['Request', 'Opened', 'Days open', 'Type', 'Service', 'Community', 'Department', 'Last update', 'Address', 'Community centre (latitude)', 'Community centre (longitude)', 'Developer record'];
  const rows = filteredIssues().map(r => [r.id, r.date, daysSince(r.date), niceType(r.type), r.area, commName(r.comm), r.agency, r.updated, r.address || '', r.lat ?? '', r.lon ?? '', recordUrl(r.id)]);
  const name = '' + W() + ' open issues ' + localYmd() + (issueFilter.comm ? ' ' + commName(issueFilter.comm) : '');
  saveList(e.currentTarget, name, cols, rows);
});

// ---------- "Save this list": saves a CSV to the Files folder and says so on the button
async function saveList(btn, name, cols, rows) {
  const label = btn.querySelector('span') || btn;
  const reset = () => setTimeout(() => { label.textContent = 'Save this list'; btn.disabled = false; }, 4000);
  btn.disabled = true;
  label.textContent = 'Saving…';
  try {
    const a = await api();
    const res = await a.save_csv(name, cols, rows.map(r => r.map(v => v === null || v === undefined ? '' : v)));
    if (res && res.ok) {
      label.textContent = `Saved ${fmt(rows.length)} rows to Files`;
      if (res.path) btn.title = res.path;
    } else label.textContent = 'Could not save: ' + ((res && res.error) || 'unknown problem');
  } catch (err) {
    label.textContent = 'Could not save: ' + (err && err.message ? err.message : err);
  }
  reset();
}

// ================================================================ BRIEFING SCREEN
let briefTimer = null, briefCamIndex = 0, briefRefresh = null;
function renderBrief() {
  const s = D.summary, w = D.ward;
  $('#brief-who').textContent = isCity() || !w.councillor ? 'City of Calgary · Mayor and Council' : `Office of Councillor ${w.councillor}`;
  const k = [
    [popMethod() === 'census2021' ? `Residents (${CY()} Census)` : 'Residents today', fmt(w.residents), popMethod() === 'census2021' ? popShort() : `${CY()} Census ${fmt(w.census2021)} (${signed(w.growth_pct, 1)})`, true],
    ['311 requests still open as of today', fmt(s.open_now), `${fmt(s.open_over_90_days)} open more than 90 days`],
    [`311 requests, ${esc(D.period)}`, fmt(s.requests12), `${signed(s.requests_change_pct, 1)} against ${esc(cmpWords())}`],
    ['Infrastructure reports per 1,000 a year', fmt(s.infra_per_1000, 1), `${fmt(s.infra_per_1000_prev, 1)} in ${esc(cmpWords())}`],
    ['Closed within 7 days', fmt(s.closed_7_days_pct, 1) + '%', `of requests closed so far. Calgary: ${fmt(s.closed_7_days_pct_city, 1)}%`],
  ];
  $('#brief-kpis').innerHTML = k.map(([l, v, sub, acc]) => `<div class="bk"><span>${l}</span><b class="${acc ? 'accent' : ''}">${v}</b><small>${sub}</small></div>`).join('');
  $('#brief-feed').innerHTML = feedItems(40).map(r => `<li><span>${esc(niceType(r.type))}</span><small>${esc(r.name)} · ${esc(longDate(r.date))} · ${esc(r.status)}</small></li>`).join('');
  $('#brief-types').innerHTML = D.open_by_type.slice(0, 6).map(t => `<li><span>${esc(niceType(t.type))}</span><b>${fmt(t.n)}</b></li>`).join('');
  $('#brief-foot').innerHTML = `<span>City of Calgary and Calgary Police open data. Updated ${esc(stampText(D.built_at))} (Calgary time) · Residents: ${esc(popWords())}</span><span>Press Esc to close</span>`;
  showBriefCams();
  if (window.renderBriefSources) renderBriefSources();
}
function showBriefCams() {
  const cams = wardCams().filter(c => c.in_ward);
  if (!cams.length) { $('#brief-cams').innerHTML = ''; return; }
  const pick = [0, 1, 2, 3].map(i => cams[(briefCamIndex + i) % cams.length]);
  $('#brief-cams').innerHTML = pick.map(camCard).join('');
}
async function openBrief() {
  if (!D) return;
  $('#brief').hidden = false;
  renderBrief();
  $('#brief-close').focus();
  const a = await api();
  if (a.set_fullscreen) a.set_fullscreen(true);
  briefTimer = setInterval(() => { briefCamIndex += 4; showBriefCams(); }, 45000);
  briefRefresh = setInterval(() => loadDashboard(true, true), 30 * 60000);
}
async function closeBrief() {
  $('#brief').hidden = true;
  clearInterval(briefTimer); clearInterval(briefRefresh);
  const a = await api();
  if (a.set_fullscreen) a.set_fullscreen(false);
}
$('#brief-btn').addEventListener('click', openBrief);
$('#brief-close').addEventListener('click', closeBrief);

// ================================================================ ASK
let current = null, busy = false, mode = 'fast';
wireSeg($('#mode-seg'), v => { mode = v; });

function addUser(text) {
  $('#welcome')?.remove();
  const m = document.createElement('div');
  m.className = 'msg user';
  m.innerHTML = `<div class="bubble">${esc(text)}</div>`;
  $('#thread').appendChild(m);
}
function stepItem(text) {
  const li = document.createElement('li');
  li.className = 'live';
  li.innerHTML = `<span class="spin" aria-hidden="true"></span><span>${esc(text)}</span>`;
  return li;
}
function finishSteps(el) {
  $$('.steps li.live', el).forEach(li => { li.classList.remove('live'); $('.spin', li)?.replaceWith(document.createRange().createContextualFragment(icon('check'))); });
}
function addBot() {
  const m = document.createElement('div');
  m.className = 'msg bot';
  m.innerHTML = '<ul class="steps" aria-label="Progress"></ul><div class="cards"></div><div class="answer"></div><div class="msg-meta"></div>';
  const t = stepItem('Thinking'); t.dataset.thinking = '1';
  $('.steps', m).appendChild(t);
  $('#thread').appendChild(m);
  scrollDown();
  return m;
}
function scrollDown() { const t = $('#thread'); t.scrollTop = t.scrollHeight; }
function chartPalette() { return [cssv('--chart-2'), cssv('--chart-1'), '#D97706', '#DC2626', '#0D9488', '#64748B']; }

window.onAgentEvent = ev => {
  if (!current) return;
  const steps = $('.steps', current), cards = $('.cards', current);
  if (ev.type === 'step') {
    $('[data-thinking]', steps)?.remove();
    finishSteps(current);
    steps.appendChild(stepItem(ev.text));
  } else if (ev.type === 'chart') {
    chartTheme();
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `<h4>${esc(ev.title)}</h4><div class="chart-holder"><canvas role="img" aria-label="${esc(ev.title)}"></canvas></div>`;
    cards.appendChild(card);
    const pal = chartPalette();
    new Chart($('canvas', card), {
      type: ev.kind === 'line' ? 'line' : 'bar',
      data: { labels: ev.labels, datasets: ev.series.map((s, i) => ({ label: s.name, data: s.values,
        backgroundColor: pal[i % pal.length], borderColor: pal[i % pal.length], borderRadius: 3, tension: .3, pointRadius: 2,
        borderDash: ev.kind === 'line' && i ? [6, 4] : [] })) },
      options: { indexAxis: ev.kind === 'horizontal_bar' ? 'y' : 'x', maintainAspectRatio: false,
        plugins: { legend: { display: ev.series.length > 1, position: 'bottom', labels: { usePointStyle: true } }, tooltip: tooltipStyle() },
        scales: { y: { beginAtZero: true, grid: { color: cssv('--chart-grid') }, title: { display: !!ev.unit && ev.kind !== 'horizontal_bar', text: ev.unit } },
                  x: { grid: { display: ev.kind === 'horizontal_bar', color: cssv('--chart-grid') } } } }
    });
  } else if (ev.type === 'table') {
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `<h4>${esc(ev.title)}</h4><div class="table-scroll"><table class="data"><thead><tr>${ev.columns.map((c, i) => `<th scope="col" class="${ev.rows.length && typeof ev.rows[0][i] === 'number' ? 'num' : ''}">${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${ev.rows.map(r => `<tr>${r.map(v => `<td class="${typeof v === 'number' ? 'num' : ''}">${typeof v === 'number' ? fmt(v, Number.isInteger(v) ? 0 : 1) : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    cards.appendChild(card);
  } else if (ev.type === 'map') {
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `<h4>${esc(ev.title)}</h4><div class="mini-map"></div>`;
    cards.appendChild(card);
    const mm = L.map($('.mini-map', card));
    L.tileLayer(TILES[isDark() ? 'dark' : 'light'], { maxZoom: 17, attribution: 'Tiles &copy; Esri' }).addTo(mm);
    const pts = ev.points.filter(p => p.lat && p.lon), dot = cssv('--danger');
    const g = L.featureGroup(pts.map(p => L.circleMarker([p.lat, p.lon], { radius: 5, color: '#fff', weight: 1.2, fillColor: dot, fillOpacity: .95 })
      .bindTooltip(esc(p.label || '')))).addTo(mm);
    if (pts.length) mm.fitBounds(g.getBounds(), { padding: [20, 20], maxZoom: 15 }); else mm.setView([51.05, -114.07], 10);
  } else if (ev.type === 'download') {
    const card = document.createElement('div'); card.className = 'card file';
    const name = ev.path.split(/[\\/]/).pop();
    card.innerHTML = `${icon('file')}<div><div class="file-name">${esc(name)}</div><div class="file-sub">${fmt(ev.rows)} rows saved to the Downloads folder, Calgary Data Desk</div></div>
      <button class="btn">${icon('open')}<span>Open file</span></button>`;
    $('button', card).addEventListener('click', async () => (await api()).open_path(ev.path));
    cards.appendChild(card);
  } else if (ev.type === 'report') {
    const card = reportCard(ev);
    cards.appendChild(card);
  }
  scrollDown();
};

async function ask(text) {
  if (busy || !text.trim()) return;
  busy = true; $('#send').disabled = true;
  addUser(text);
  current = addBot();
  try {
    const res = await (await api()).ask(text, mode);
    $('[data-thinking]', current)?.remove();
    finishSteps(current);
    if (!$('.steps li', current)) $('.steps', current).remove();
    if (!res.ok) {
      $('.answer', current).innerHTML = `<div class="err">${esc(res.error)}</div>`;
    } else {
      $('.answer', current).innerHTML = DOMPurify.sanitize(marked.parse(res.text));
      const tok = res.tokens || {};
      // no model name and no price on answers (the owner's choice)
      $('.msg-meta', current).textContent = `${res.tier === 'smart' ? 'Thorough' : 'Fast'} answer${(res.skipped || []).length ? ' · answered by the backup AI service' : ''}`;
    }
  } catch (e) {
    $('[data-thinking]', current)?.remove();
    $('.answer', current).innerHTML = `<div class="err">${esc(e.message || e)}</div>`;
  } finally {
    busy = false; $('#send').disabled = false; current = null; scrollDown();
  }
}
$('#composer').addEventListener('submit', e => { e.preventDefault(); const q = $('#question'); const t = q.value; q.value = ''; q.style.height = ''; ask(t); });
$('#question').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#composer').requestSubmit(); } });
$('#question').addEventListener('input', e => { e.target.style.height = 'auto'; e.target.style.height = Math.max(84, Math.min(e.target.scrollHeight, 340)) + 'px'; });
$$('.suggest button').forEach(b => b.addEventListener('click', () => ask(b.textContent.trim())));
$('#go-settings').addEventListener('click', () => show('settings'));
const welcomeBlock = $('#welcome');   // kept, so New chat can show it again
$('#new-chat').addEventListener('click', async () => {
  if (busy) return;
  await (await api()).new_chat();
  const w = welcomeBlock;
  $('#thread').innerHTML = '';
  if (w) { w.hidden = false; w.style.display = ''; $('#thread').appendChild(w); }
  $('#question').focus();
});

// ================================================================ FILES
async function loadFiles() {
  const a = await api();
  const s = await a.get_settings();
  $('#files-where').textContent = 'Saved to ' + s.downloads;
  const files = await a.list_downloads();
  $('#files').innerHTML = files.length ? files.map((f, i) => `<tr>
      <td><span class="fname">${icon('file')}${esc(f.name)}</span></td><td>${esc(f.modified)}</td>
      <td class="num">${fmt(f.bytes / 1024, 0)} KB</td>
      <td><button class="btn" data-i="${i}">${icon('open')}<span>Open</span></button></td></tr>`).join('')
    : '<tr><td colspan="4" class="empty">No files yet. Ask the assistant to download data, for example: Download all open 311 requests in ' + W() + '.</td></tr>';
  $$('#files button').forEach(b => b.addEventListener('click', () => a.open_path(files[b.dataset.i].path)));
}
$('#open-folder').addEventListener('click', async () => (await api()).open_downloads());

// ================================================================ SETTINGS
async function loadSettings() {
  const s = await (await api()).get_settings();
  window._models = s.models;
  const nk = (s.engines || []).filter(e => e.has_key).length;
  $('#key-badge').textContent = nk ? `${nk} ready` : 'No key yet';
  $('#key-badge').classList.toggle('ok', !!nk);
  $('#no-key') && ($('#no-key').hidden = s.has_key);
  renderEngines(s);
  $('#gkey-status').textContent = s.has_google_key ? `A Google Maps key ending ${s.google_key_hint.slice(3)} is saved. The maps use Google. Remove it before giving the app to someone else.` : 'No key saved. The maps use OpenStreetMap, which is free.';
  $('#gkey-badge').textContent = s.has_google_key ? 'Saved' : 'Not saved';
  $('#gkey-badge').classList.toggle('ok', !!s.has_google_key);
  $('#remove-gkey').disabled = !s.has_google_key;
  if ((s.google_key || '') !== googleKey) {
    googleKey = s.google_key || ''; googleReady = null; googleFailed = false;
    if (googleKey) loadGoogle().then(ok => { if (!ok) googleFailed = true; setBase(); }); else setBase();
  }
  if (s.map_style && s.map_style !== mapStyle) { mapStyle = s.map_style; setBase(); }
  renderPopChoices(s);
  return s;
}
// how residents are counted: four choices, each with the area's total today under it; the default is marked
function renderPopChoices(s) {
  const box = $('#pop-choices');
  if (!box || !s.pop_methods) return;
  const totals = (D && D.population && D.population.by_method) || {};
  const cur = s.pop_method || 'city_actual';
  $('#pop-badge').textContent = (s.pop_methods.find(m => m.key === cur) || {}).short || '';
  box.innerHTML = s.pop_methods.map(m => `<button type="button" role="radio" class="pop-choice${m.key === cur ? ' on' : ''}" aria-checked="${m.key === cur}" data-pop="${m.key}">
      <span class="pc-head"><b>${esc(m.label)}${m.key === 'city_actual' ? ' <small class="pc-default">default</small>' : ''}</b>${isNum(totals[m.key]) ? `<span class="pc-n">${fmt(totals[m.key])}<small>${m.key === 'census2021' ? W() + ', May ' + CY() : '' + W() + ' today'}</small></span>` : ''}</span>
      <span class="pc-about">${esc(m.about)}</span></button>`).join('');
  $$('.pop-choice', box).forEach(b => b.addEventListener('click', async () => {
    if (b.dataset.pop === cur) return;
    $('#pop-hint').textContent = 'Working out the dashboard with the new count…';
    const a = await api();
    const s2 = await a.set_pop_method(b.dataset.pop);
    renderPopChoices(s2);
    await loadDashboard(false, true);
    renderPopChoices(s2);
    $('#pop-hint').textContent = `Saved. Every figure now counts residents with ${popWords()}.`;
  }));
}
wireSeg($('#theme-seg'), v => setTheme(v));
// ----- AI services in priority order
let ENG = [], PROV = [], ENG_MAX = 4;
const provOf = k => PROV.find(p => p.key === k) || PROV[0] || {};
function engFromForm() {
  $$('#eng-list .eng').forEach((li, i) => {
    const e = ENG[i]; if (!e) return;
    e.provider = $('.eng-prov', li).value; e.newKey = $('.eng-key', li).value.trim();
    e.fast = $('.eng-fast', li).value.trim(); e.smart = $('.eng-smart', li).value.trim();
    e.url = $('.eng-url input', li).value.trim(); e.free = $('.eng-free', li).checked;
  });
}
function renderEngines(s) {
  if (s) { ENG = (s.engines || []).map(e => ({ ...e, newKey: '' })); PROV = s.providers || PROV; ENG_MAX = s.max_engines || 4; }
  const box = $('#eng-list');
  if (!box) return;
  if (!ENG.length) box.innerHTML = '<li class="eng-empty">No service yet. Add one and paste its key.</li>';
  else box.innerHTML = ENG.map((e, i) => { const p = provOf(e.provider);
    const state = e.resting ? `<span class="badge warn" title="${esc(e.resting)}">Resting: ${esc(e.resting.replace(/ \(.*$/, ''))}</span>`
      : e.has_key && !e.newKey ? `<span class="badge ok">Key saved ${esc(e.key_hint)}</span>` : e.newKey ? '<span class="badge">New key, not saved yet</span>' : '<span class="badge">No key</span>';
    return `<li class="eng" data-i="${i}">
      <div class="eng-top">
        <span class="eng-n" title="Priority ${i + 1}">${i + 1}</span>
        <select class="eng-prov" aria-label="Service ${i + 1}">${PROV.map(o => `<option value="${o.key}"${o.key === e.provider ? ' selected' : ''}>${esc(o.label)}${o.company && o.company !== o.label ? ' (' + esc(o.company) + ')' : ''}</option>`).join('')}</select>
        ${state}
        <span class="eng-role">${i === 0 ? 'Used first' : 'Backup ' + i}</span>
        <span class="eng-move">
          <button type="button" class="icon-btn" data-up ${i === 0 ? 'disabled' : ''} aria-label="Move up">${icon('arr-up')}</button>
          <button type="button" class="icon-btn" data-down ${i === ENG.length - 1 ? 'disabled' : ''} aria-label="Move down">${icon('arr-down')}</button>
          <button type="button" class="icon-btn" data-del aria-label="Remove">${icon('x')}</button>
        </span>
      </div>
      <p class="field-hint eng-about">${esc(p.about || '')}</p>
      <div class="eng-fields">
        <label class="eng-f eng-kf"><span class="field-label">API key</span><input type="password" class="eng-key" autocomplete="off" value="${esc(e.newKey || '')}" placeholder="${e.has_key ? 'Saved ' + esc(e.key_hint) + ' (paste to replace)' : 'Paste ' + esc(p.key_hint || 'key')}"></label>
        <label class="eng-f"><span class="field-label">Quick answers</span><input class="eng-fast" value="${esc(e.fast || '')}" placeholder="${esc(p.fast || 'model name')}"></label>
        <label class="eng-f"><span class="field-label">Reports and thorough answers</span><input class="eng-smart" value="${esc(e.smart || '')}" placeholder="${esc(p.smart || 'model name')}"></label>
        <label class="eng-f eng-url"${e.provider === 'other' ? '' : ' hidden'}><span class="field-label">Chat address</span><input value="${esc(e.provider === 'other' ? e.url || '' : '')}" placeholder="https://…/v1/chat/completions"></label>
      </div>
      <div class="eng-foot">
        <label class="check"><input type="checkbox" class="eng-free" ${e.free ? 'checked' : ''}> Free-tier key</label>
        ${p.key_page ? `<button type="button" class="link-btn" data-page="${esc(p.key_page)}">Get a key ${icon('open')}</button>` : ''}
        <span class="eng-spacer"></span>
        <span class="eng-test-out" role="status"></span>
        <button type="button" class="btn" data-test>${icon('check')}<span>Test</span></button>
      </div></li>`; }).join('');
  $('#eng-add').disabled = ENG.length >= ENG_MAX;
  $('#eng-count').textContent = `${ENG.length} of ${ENG_MAX}. Use the arrows to change the order.`;
  $$('.eng', box).forEach(li => {
    const i = +li.dataset.i;
    const move = d => { engFromForm(); const t = ENG[i]; ENG.splice(i, 1); ENG.splice(i + d, 0, t); renderEngines(); };
    $('[data-up]', li).addEventListener('click', () => move(-1));
    $('[data-down]', li).addEventListener('click', () => move(1));
    $('[data-del]', li).addEventListener('click', () => { engFromForm(); ENG.splice(i, 1); renderEngines(); });
    $('.eng-prov', li).addEventListener('change', () => { engFromForm(); const p = provOf(ENG[i].provider);
      Object.assign(ENG[i], { fast: p.fast, smart: p.smart, free: !!p.free, url: '', has_key: false, key_hint: '', resting: '' }); renderEngines(); });
    $('[data-page]', li)?.addEventListener('click', async b => (await api()).open_url(li.querySelector('[data-page]').dataset.page));
    $('[data-test]', li).addEventListener('click', async () => {
      engFromForm(); const e = ENG[i]; const out = $('.eng-test-out', li); const btn = $('[data-test]', li);
      out.className = 'eng-test-out'; out.textContent = 'Testing…'; btn.disabled = true;
      try {
        const r = await (await api()).test_engine({ id: e.id, provider: e.provider, key: e.newKey, fast: e.fast, smart: e.smart, url: e.url, free: e.free });
        out.classList.add(r.ok ? 'ok' : 'bad');
        out.textContent = r.results.map(x => (x.model ? x.model + ': ' : '') + x.text).join(' · ');
      } catch (err) { out.classList.add('bad'); out.textContent = String(err.message || err); }
      btn.disabled = false;
    });
  });
}
$('#eng-add').addEventListener('click', () => {
  engFromForm();
  if (ENG.length >= ENG_MAX) return;
  const used = new Set(ENG.map(e => e.provider));
  const p = PROV.find(o => !used.has(o.key)) || PROV[0];
  ENG.push({ id: Math.random().toString(36).slice(2, 10), provider: p.key, fast: p.fast, smart: p.smart, free: !!p.free, url: '', has_key: false, key_hint: '', newKey: '' });
  renderEngines();
  $('#eng-list .eng:last-child .eng-key')?.focus();
});
$('#settings-form').addEventListener('submit', async e => {
  e.preventDefault();
  engFromForm();
  const a = await api();
  await a.save_engines(ENG.map(x => ({ id: x.id, provider: x.provider, key: x.newKey, fast: x.fast, smart: x.smart, url: x.url, free: x.free })));
  const s = await a.save_settings(null, null, null, $('#google-key').value);
  $('#google-key').value = '';
  window._models = s.models;
  $('#saved-msg').textContent = 'Settings saved.';
  setTimeout(() => { $('#saved-msg').textContent = ''; }, 2500);
  loadSettings();
});
$('#remove-gkey').addEventListener('click', async () => { const a = await api(); if (a.remove_google_key) await a.remove_google_key(); loadSettings(); });

// ================================================================ start
applyTheme();
(async () => {
  await api();
  const s = await loadSettings();
  if (s.theme && s.theme !== themePref) { themePref = s.theme; applyTheme(); }
  loadDashboard(false);
  setInterval(() => loadDashboard(false, true), 15 * 60000);   // keeps an office screen current (rebuilds hourly)
})();
