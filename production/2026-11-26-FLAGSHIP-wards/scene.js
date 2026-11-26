/* 2026-11-26 FLAGSHIP (extra): "Calgary Once Had No Wards at All" (Calgary Insight ORIGINS).
 * Lead identity Storyteller (same night map look as the Nov 24 boundary film). Borrowed: Data Explainer stamps, counter, bars to scale.
 * One file, two cuts (+ thumbnails with --param thumb=1): --param cut=short|wide
 * Every number, date and label on screen maps to the audited claims table in packages/2026-11-26-FLAGSHIP-calgary-wards.md.
 * Geometry: GEO.eras (ward polygons per election, City of Calgary open data) and GEO.limits (Historic City Limits). Pre-1998: city limits only, no ward lines. */
const PR = window.PARAMS || {}, CUT = PR.cut || 'short', THUMB = !!PR.thumb;
const WIDE = CUT === 'wide';
const W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920;
const CX = WIDE ? W / 2 : (W - 120) / 2 + 30;
const L = WIDE ? { hookY: 150, hook: 120, stampY: 170, chip: 44, src: [48, H - 40], fov: 46, big: 110 }
               : { hookY: 330, hook: 140, stampY: 360, chip: 50, src: [60, 1462], fov: 62, big: 120 };
const VD = PR.vd ? PR.vd.split(',').map(Number) : [2.4, 5.6, 2.2, 7.2, 5.6, 5.0, 6.6, 7.4, 9.6, 3.6, 4.6, 2.6, 2.8];
const LINES = [
 'Calgary once had no wards at all.',
 'When it became a city in eighteen ninety-four, it had three wards, with three aldermen each.',
 'By nineteen-oh-six, there were four.',
 'Then, from nineteen fourteen, wards were dropped. For almost fifty years, every alderman was elected by the whole city.',
 'In nineteen sixty, voters chose to bring them back: six wards, with two aldermen each.',
 'The nineteen seventy-seven election was the first with fourteen wards, one alderman each.',
 'And the lines keep moving. As the city grows, wards are redrawn to keep about the same number of voters in each.',
 "The City's open data maps start in nineteen ninety-eight. Watch the lines move, election after election, up to twenty twenty-one.",
 'By twenty sixteen, the biggest ward had more than a hundred and nine thousand people, the smallest just over seventy-six thousand. The next election used new lines.',
 "Since twenty thirteen, they're called councillors, not aldermen.",
 "Today, it's still fourteen wards. The next election is in twenty twenty-nine.",
 'Should Calgary have more wards, or fewer?',
 'More or fewer? Drop your thoughts below.'];
const IDS = ['L0','L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','Q','C'];
const ORDER = IDS;
const MAPRUN = [1998, 2001, 2004, 2007, 2010, 2013, 2017, 2021], SLOT = 1.35;
const S = M.script(ORDER.map((id, i) => ({ text: LINES[i], dur: VD[i], gapAfter: id === 'L7' ? Math.max(.4, MAPRUN.length * SLOT + 1.6 - VD[i]) : (id === 'Q' ? .25 : undefined) })),
                   { lead: .3, gap: .4, tail: 1.2 });
const sc = S.scenes;

// ---------- palette (continuity bible: same as the Nov 24 film) ----------
const GOLD = M.house.gold, ORANGE = '#f7931e', NAVY = '#0b1f3a', INK = '#070d18';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const COLS = { land: '#16263f', park: '#1b3531', water: '#2c5378', building: '#3a4a60', road: '#2a3a52', motorway: '#46566e', community: '#ffffff' };
// fixed colour per ward NUMBER, so a number keeps its colour on every map
const WC = { 1: '#e6194b', 2: '#3cb44b', 3: '#ffe119', 4: '#4363d8', 5: '#f58231', 6: '#911eb4', 7: '#42d4f4', 8: '#f032e6', 9: '#bfef45', 10: '#fabed4', 11: '#469990', 12: '#dcbeff', 13: '#9a6324', 14: '#fffac8' };
const G = () => window.GEO;
const era = y => G().eras[String(y)];
const today = () => ({ wards: Object.fromEntries((G().wards.items || []).map(it => [it.name, { polys: it.polys, c: centroid(it.polys) }])) });
const centroid = polys => { let best = polys[0][0]; polys.forEach(p => { if (p[0].length > best.length) best = p[0]; }); let sx = 0, sy = 0; best.forEach(q => { sx += q[0]; sy += q[1]; }); return [sx / best.length, sy / best.length]; };
const limit = y => { const ls = G().limits; let best = ls[0]; ls.forEach(l => { if (l.start <= y) best = l; }); return best; };
const BND = () => { const b = G().boundary[0]; let best = b[0]; (Array.isArray(b[0][0]) ? b : [b]).forEach(r => { if (r.length > best.length) best = r; }); return Array.isArray(best[0]) ? best : b; };
const CITY = [-2600, -600, 0];

// ---------- helpers ----------
const cam = o => M.camera(Object.assign({ fov: L.fov }, o), W, H);
const above = (p, h, back = .2) => cam({ pos: [p[0], p[1] - h * back, h], look: [p[0], p[1], 0] });
const band = (c, y0, y1, a = .7) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const src = (c, s, dy = 0) => M.source(c, s, L.src[0], L.src[1] - dy, { size: 20, maxW: WIDE ? 1500 : 860 });
const navyBg = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, NAVY); g.addColorStop(1, INK); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const north = c => { const nx = WIDE ? W - 90 : W - 190, ny = WIDE ? 170 : 300; c.save(); c.globalAlpha = .9; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(nx, ny - 34); c.lineTo(nx + 15, ny + 8); c.lineTo(nx - 15, ny + 8); c.closePath(); c.fill(); M.text(c, 'N', nx, ny + 14, { size: 28, weight: 800, align: 'center' }); c.restore(); };
const ease = (t, a, b, e = 'inOutCubic') => M.seg(t, a, b, e);
const chip = (c, s, y, k, o = {}) => { if (k > 0) M.chip(c, s, o.x ?? CX, y, Object.assign({ align: 'center', size: L.chip + 4, alpha: Math.min(1, k) }, o)); };
const stamp = (c, s, t, t0, x = CX, y = L.stampY, size, col = GOLD) => { const k = M.seg(t, t0, t0 + .35, 'outBack'); if (k <= 0) return; size = size || (WIDE ? 92 : 108);
  c.save(); c.translate(x, y); c.rotate(-.04); const s2 = M.lerp(1.8, 1, k); c.scale(s2, s2); c.globalAlpha = Math.min(1, k * 1.5);
  c.font = M.font(size, 800); const tw = c.measureText(s).width; M.rr(c, -tw / 2 - 34, -size * .62, tw + 68, size * 1.24, 22); c.fillStyle = 'rgba(7,13,24,.86)'; c.fill(); c.lineWidth = 8; c.strokeStyle = col; c.stroke();
  M.text(c, s, 0, -size * .52, { size, weight: 800, align: 'center', color: '#fff' }); c.restore(); };

// map: base + optional city-limits fill (pre-1998) + optional ward layers [{wards, a}] + today's limits as a thin line
function map(c, cm, o = {}) {
  const w = M.world({ sky: 'night', drawSky: false, fog: { near: 9000, far: 140000, max: .5, color: '#0d1830' } });
  navyBg(c);
  M.geo.addBase(w, { buildings: false, colors: COLS, riverW: 70, lrt: false, communities: false, roads: o.roads !== false });
  if (o.lim) { const l = o.lim; l.polys.forEach(poly => w.area(poly, { fill: o.limCol || GOLD, alpha: (o.limA ?? .6), stroke: o.limCol || GOLD, strokeAlpha: 1, sw: 5, order: 4 })); }
  (o.layers || []).forEach(L2 => { if (L2.a <= 0) return; Object.entries(L2.wards).forEach(([n, wd]) => {
    wd.polys.forEach(poly => w.area(poly, { fill: WC[n], alpha: .62 * L2.a, stroke: '#06101f', strokeAlpha: Math.min(1, L2.a * 1.2), sw: 4, order: 4 + (L2.z || 0) })); });
    if (L2.labels) Object.entries(L2.wards).forEach(([n, wd]) => w.at([wd.c[0], wd.c[1], 0], (ctx, sp) => M.text(ctx, n, sp.x, sp.y - 26, { size: L2.lsize || (WIDE ? 40 : 46), weight: 800, align: 'center', stroke: 7, strokeColor: '#06101f', alpha: Math.min(1, L2.a * 1.4), shadow: false }))); });
  if (o.bnd !== false) w.line(BND(), { wm: o.bndW || 140, color: GOLD, order: 6, alpha: o.bndA ?? .45, minPx: 2 });
  w.render(c, cm); return w; }
function headline(c, t, txt, hl) { band(c, WIDE ? 40 : 200, WIDE ? 420 : 760, .62);
  M.kinetic(c, txt, THUMB ? 9 : t, CX, L.hookY, { size: L.hook * (THUMB ? (WIDE ? 1.4 : 1.1) : 1), maxW: WIDE ? 1500 : 860, t0: -0.12, every: .1, highlight: hl }); }
const CREDIT = 'City of Calgary Open Data · Historic City Limits';
const H0 = WIDE ? 46000 : 66000;   // whole-city camera height

// ---------- scenes ----------
const D = {
  L0: (c, t, d) => { const dv = THUMB ? 1 : ease(t, 0, d + .4, 'outCubic');
    map(c, above([-1500, 500, 0], M.lerp(32000, WIDE ? 20000 : 24000, dv)), { lim: limit(1930), limA: .75 });
    if (!THUMB) chip(c, '1914–1960', WIDE ? 800 : 1150, ease(t, .8, 1.2, 'outBack'), { bg: '#ffffff', color: NAVY });
    headline(c, t, 'Calgary had NO wards', ['no']);
    if (!THUMB) { north(c); src(c, MAPC + ' · city limits 1923–1950'); } },
  L1: (c, t, d) => { const p = ease(t, 0, d, 'linear');
    map(c, above([600, 300, 0], M.lerp(12000, 9500, p)), { lim: limit(1894), limA: .7, bndA: .25 });
    stamp(c, '1894', t, .3); chip(c, '3 WARDS', L.stampY + (WIDE ? 100 : 125), ease(t, d * .45, d * .45 + .35, 'outBack'));
    chip(c, '3 ALDERMEN EACH', L.stampY + (WIDE ? 185 : 220), ease(t, d * .7, d * .7 + .35, 'outBack'), { bg: '#ffffff', color: NAVY });
    M.text(c, 'city limits of the day · ward lines not in open data', CX, WIDE ? H - 110 : 1230, { size: 28, weight: 600, align: 'center', color: '#c9d3e0', maxW: 900 });
    north(c); src(c, 'Sources: City of Calgary, City Council history · ' + CREDIT); },
  L2: (c, t, d) => { map(c, above([600, 300, 0], M.lerp(9500, 10500, ease(t, 0, d))), { lim: limit(1906), limA: .7, bndA: .25 });
    stamp(c, '1906', t, .1); chip(c, '4 WARDS', L.stampY + (WIDE ? 100 : 125), ease(t, .45, .8, 'outBack'));
    M.text(c, 'city limits of the day · ward lines not in open data', CX, WIDE ? H - 110 : 1230, { size: 28, weight: 600, align: 'center', color: '#c9d3e0', maxW: 900 });
    north(c); src(c, 'Sources: City of Calgary · Wikipedia, Calgary municipal elections · ' + CREDIT); },
  L3: (c, t, d) => { const k = ease(t, .3, d - .4, 'inOutSine'), yr = Math.round(M.lerp(1914, 1960, k));
    map(c, above([-1000, 0, 0], M.lerp(24000, WIDE ? 30000 : 36000, k)), { lim: limit(yr), limA: .72 });
    band(c, WIDE ? 30 : 200, WIDE ? 330 : 640, .6);
    M.text(c, String(yr), CX, WIDE ? 60 : 250, { size: WIDE ? 150 : 170, weight: 800, align: 'center', color: k >= 1 ? GOLD : '#fff' });
    chip(c, 'ELECTED CITY-WIDE', WIDE ? 270 : 480, ease(t, d * .45, d * .45 + .35, 'outBack'), { bg: '#ffffff', color: NAVY });
    north(c); src(c, 'Sources: City of Calgary · Wikipedia · ' + CREDIT); },
  L4: (c, t, d) => { map(c, above([-500, -1500, 0], M.lerp(30000, WIDE ? 32000 : 38000, ease(t, 0, d))), { lim: limit(1961), limA: .7 });
    stamp(c, '1960', t, .2); chip(c, 'PLEBISCITE', L.stampY + (WIDE ? 100 : 125), ease(t, .6, .95, 'outBack'));
    chip(c, '6 WARDS · 2 ALDERMEN EACH', L.stampY + (WIDE ? 185 : 220), ease(t, d * .6, d * .6 + .35, 'outBack'), { bg: '#ffffff', color: NAVY });
    M.text(c, 'city limits 1961 · ward lines not in open data', CX, WIDE ? H - 110 : 1230, { size: 28, weight: 600, align: 'center', color: '#c9d3e0', maxW: 900 });
    north(c); src(c, 'Sources: City of Calgary Bylaw 19M91 · City Council history · ' + CREDIT); },
  L5: (c, t, d) => { map(c, above([-500, -1500, 0], M.lerp(38000, WIDE ? 36000 : 44000, ease(t, 0, d))), { lim: limit(1977), limA: .7 });
    stamp(c, '1977', t, .2); chip(c, '14 WARDS', L.stampY + (WIDE ? 100 : 125), ease(t, d * .45, d * .45 + .35, 'outBack'));
    chip(c, '1 ALDERMAN EACH', L.stampY + (WIDE ? 185 : 220), ease(t, d * .65, d * .65 + .35, 'outBack'), { bg: '#ffffff', color: NAVY });
    M.text(c, 'city limits 1977 · ward lines not in open data', CX, WIDE ? H - 110 : 1230, { size: 28, weight: 600, align: 'center', color: '#c9d3e0', maxW: 900 });
    north(c); src(c, 'Sources: City of Calgary Bylaw 19M91 · Ward Boundary Commission (2024) · ' + CREDIT); },
  L6: (c, t, d) => { const k = ease(t, d * .35, d * .6);
    map(c, above(CITY, H0), { layers: [{ wards: era(1998).wards, a: k * .8 }], bndA: .5 });
    c.fillStyle = 'rgba(7,13,24,.35)'; c.fillRect(0, 0, W, H);
    band(c, WIDE ? 30 : 200, WIDE ? 380 : 700, .65);
    M.kinetic(c, 'The lines keep moving', t, CX, WIDE ? 70 : 260, { size: WIDE ? 110 : 120, maxW: WIDE ? 1500 : 860, highlight: ['moving'] });
    const kb = ease(t, d * .6, d * .6 + .4, 'outBack'); chip(c, 'ABOUT THE SAME NUMBER', WIDE ? 290 : 520, kb, { bg: '#ffffff', color: NAVY }); chip(c, 'OF VOTERS IN EACH', WIDE ? 365 : 610, kb, { bg: '#ffffff', color: NAVY });
    north(c); src(c, 'Source: City of Calgary Bylaw 19M91 · ' + MAPC); },
  L7: (c, t, d) => { const t0 = Math.max(0, d - MAPRUN.length * SLOT - 1.4); const u = Math.max(0, t - t0), i = Math.min(MAPRUN.length - 1, Math.floor(u / SLOT)), f = u - i * SLOT;
    const cur = era(MAPRUN[i]), prv = i > 0 ? era(MAPRUN[i - 1]) : null, mix = prv ? ease(f, 0, .55) : (t < t0 ? ease(t, 0, .6) : 1);
    const layers = []; if (prv && mix < 1) layers.push({ wards: prv.wards, a: 1 - mix, z: 0 }); layers.push({ wards: cur.wards, a: mix, z: 1, labels: true });
    map(c, above(CITY, H0), { layers, bndA: .35, roads: false });
    if (u > 0 || t >= t0) { stamp(c, String(MAPRUN[i]), f, 0, CX, L.stampY, WIDE ? 96 : 112); }
    if (i === 0 && f < .2) {}
    const hold = u > MAPRUN.length * SLOT - .1; if (hold) { const kh = ease(u, MAPRUN.length * SLOT, MAPRUN.length * SLOT + .35, 'outBack'); chip(c, 'SAME WARDS IN 2025', L.stampY + (WIDE ? 105 : 130), kh, { bg: '#ffffff', color: NAVY }); chip(c, 'TECHNICAL TWEAKS ONLY', L.stampY + (WIDE ? 185 : 215), kh, { size: L.chip - 4 }); }
    if (t < t0) { band(c, WIDE ? 30 : 200, WIDE ? 330 : 620, .6); M.kinetic(c, 'Every ward map since 1998', t, CX, WIDE ? 70 : 260, { size: WIDE ? 104 : 112, maxW: WIDE ? 1500 : 860, highlight: ['1998'] }); }
    north(c); src(c, 'City of Calgary Open Data · ward boundaries in force at each election (Census by Ward 1999–2011 · Ward Boundaries 2013–2021)'); },
  L8: (c, t, d) => { navyBg(c); const big = 109384, small = 76533, maxW = WIDE ? 1100 : 820, x0 = WIDE ? 420 : 100;
    M.text(c, '2016 CIVIC CENSUS', CX, WIDE ? 110 : 300, { size: WIDE ? 64 : 70, weight: 800, align: 'center', color: GOLD, alpha: ease(t, 0, .3) });
    [[`WARD 12`, big, WC[12], .3], [`WARD 9`, small, WC[9], .9]].forEach(([lab, v, col, t0], j) => { const k = ease(t, t0, t0 + 1.2, 'outCubic'); const y = (WIDE ? 330 : 560) + j * (WIDE ? 230 : 300);
      M.text(c, lab, x0, y - (WIDE ? 70 : 80), { size: WIDE ? 50 : 56, weight: 800, alpha: Math.min(1, k * 3) });
      c.save(); c.fillStyle = col; c.globalAlpha = .9; c.fillRect(x0, y, maxW * (v / big) * k, WIDE ? 90 : 110); c.restore();
      M.text(c, Math.round(v * k).toLocaleString('en-US'), x0, y + (WIDE ? 105 : 125), { size: WIDE ? 56 : 64, weight: 800, color: '#fff', alpha: Math.min(1, k * 3) }); });
    M.text(c, 'residents · bars to scale from zero', CX, WIDE ? 860 : 1080, { size: 28, weight: 600, align: 'center', color: '#9fb0c8' });
    stamp(c, '2017 · NEW LINES', t, d * .72, CX, WIDE ? 960 : 1210, WIDE ? 70 : 80);
    src(c, 'Source: City of Calgary Open Data, Census By Ward 2016 · Ward Boundaries 2017–2021'); },
  L9: (c, t, d) => { map(c, above(CITY, H0), { layers: [{ wards: today().wards, a: .75, labels: true }], bndA: .35, roads: false });
    band(c, WIDE ? 30 : 230, WIDE ? 330 : 640, .6);
    chip(c, 'ALDERMEN → COUNCILLORS', WIDE ? 120 : 330, ease(t, .2, .55, 'outBack'), { size: L.chip + 8 }); chip(c, 'SINCE 2013', WIDE ? 220 : 450, ease(t, d * .4, d * .4 + .35, 'outBack'), { bg: '#ffffff', color: NAVY });
    north(c); src(c, 'Sources: City of Calgary · Wikipedia · ward map: City of Calgary Open Data (today)'); },
  L10: (c, t, d) => { map(c, above(CITY, M.lerp(H0, H0 * 1.05, ease(t, 0, d))), { layers: [{ wards: today().wards, a: .75, labels: true }], bndA: .45, roads: false });
    band(c, WIDE ? 30 : 230, WIDE ? 330 : 640, .6);
    chip(c, '14 WARDS TODAY', WIDE ? 120 : 330, ease(t, .2, .55, 'outBack'), { size: L.chip + 8 }); chip(c, 'NEXT ELECTION · 2029', WIDE ? 220 : 450, ease(t, d * .5, d * .5 + .35, 'outBack'), { bg: '#ffffff', color: NAVY });
    north(c); src(c, 'Sources: City of Calgary Open Data · Wikipedia, Calgary City Council'); },
  Q: (c, t, d) => { map(c, above(CITY, H0 * 1.05), { layers: [{ wards: today().wards, a: .6, labels: true }], bndA: .45, roads: false });
    band(c, WIDE ? 30 : 230, WIDE ? 420 : 860, .65); M.kinetic(c, 'Should Calgary have more wards, or fewer?', t, CX, WIDE ? 90 : 330, { size: WIDE ? 100 : 112, maxW: WIDE ? 1500 : 860, highlight: ['more', 'fewer?'], every: .1 }); },
  C: (c, t, d) => { map(c, above(CITY, H0 * 1.05), { layers: [{ wards: today().wards, a: .5 }], bndA: .4, roads: false }); c.fillStyle = 'rgba(7,13,24,.92)'; c.fillRect(0, 0, W, H);
    M.closer(c, 'More wards, or fewer?', M.seg(t, 0, d, 'linear') + .3, W, H, { highlight: ['more', 'fewer?'] }); },
};
const TRANS = { L0: { kind: 'match', dur: .45 }, L1: { kind: 'dissolve', dur: .4 }, L2: { kind: 'zoom', dur: .4 }, L3: { kind: 'dissolve', dur: .45 }, L4: { kind: 'match', dur: .45 },
  L5: { kind: 'whip', dur: .35 }, L6: { kind: 'dissolve', dur: .45 }, L7: { kind: 'flash', dur: .3 }, L8: { kind: 'push', dur: .4 }, L9: { kind: 'match', dur: .45 }, L10: { kind: 'dissolve', dur: .4 }, Q: { kind: 'dissolve', dur: .35 } };
const TR = (id, i) => ORDER[i + 1] ? TRANS[id] : undefined;

function originsHeader(c) { if (!window.LOGO) return; c.save();
  if (!WIDE) { const s = 70; c.font = M.font(40, 700); const a = c.measureText('Calgary Insight ').width; c.font = M.font(40, 800); const b = c.measureText('ORIGINS').width; const x = CX - (s + 18 + a + b) / 2;
    c.drawImage(window.LOGO, x, 140, s, s); M.text(c, 'Calgary Insight', x + s + 18, 140 + s / 2, { size: 40, base: 'middle', weight: 700, shadow: 8 }); M.text(c, 'ORIGINS', x + s + 18 + a, 140 + s / 2, { size: 40, base: 'middle', weight: 800, color: ORANGE, shadow: 8 }); }
  else { c.drawImage(window.LOGO, 48, 40, 60, 60); c.font = M.font(30, 700); const a = c.measureText('Calgary Insight ').width; M.text(c, 'Calgary Insight', 124, 70, { size: 30, base: 'middle', weight: 700, shadow: 8 }); M.text(c, 'ORIGINS', 124 + a, 70, { size: 30, base: 'middle', weight: 800, color: ORANGE, shadow: 8 }); }
  c.restore(); }
function thumbBrand(c) { if (!window.LOGO) return; const s = WIDE ? 64 : 84, x = WIDE ? 40 : 60, y = WIDE ? H - s - 30 : 1490; c.drawImage(window.LOGO, x, y, s, s);
  c.font = M.font(WIDE ? 32 : 40, 700); const a = c.measureText('Calgary Insight ').width; M.text(c, 'Calgary Insight', x + s + 16, y + s / 2, { size: WIDE ? 32 : 40, base: 'middle', weight: 700 }); M.text(c, 'ORIGINS', x + s + 16 + a, y + s / 2, { size: WIDE ? 32 : 40, base: 'middle', weight: 800, color: ORANGE }); }

function chunks(txt) { const ws = txt.split(/\s+/), out = []; let cur = [];
  ws.forEach((w, i) => { cur.push(w); const n = cur.length, punct = /[,.?!:;]$/.test(w), rest = ws.length - i - 1; if ((punct && n >= 3 && (rest === 0 || rest >= 3)) || n >= 9 && rest >= 3) { out.push(cur.join(' ')); cur = []; } });
  if (cur.length) { if (out.length && cur.length < 3) out[out.length - 1] += ' ' + cur.join(' '); else out.push(cur.join(' ')); } return out; }
function capAt(t) { const s = S.lineAt(t); if (!s) return ''; const cs = chunks(s.caption), tot = cs.reduce((a, x) => a + x.split(' ').length, 0); let acc = 0;
  for (const ch of cs) { acc += ch.split(' ').length; if (t < s.start + s.speech * acc / tot) return ch; } return cs[cs.length - 1]; }
window.CAPTIONS = () => S.scenes.map(s => ({ start: s.start, chunks: chunks(s.caption) }));

window.BUILD = () => { window.CUES = CUESFN(); return M.film({ W, H, identity: 'storyteller', scenes: ORDER.map((id, i) => ({ dur: sc[i].sceneDur, trans: TR(id, i), draw: (c, t) => D[id](c, t, sc[i].sceneDur) })),
  letterbox: () => 0,
  overlay: (c, t, info) => {
    const last = info.index === ORDER.length - 1;
    if (THUMB) { thumbBrand(c); return; }
    if (t > 3 && !last) originsHeader(c);
    if (!last) M.caption(c, capAt(t), W, H, WIDE ? {} : { bottom: 1410 });
    if (S.total > 25) { const mid = S.total / 2; M.followPill(c, M.seg(t, mid - 1, mid + 1, 'linear'), W, H); }
  } }); };

const CUESFN = () => { const s = i => sc[i].sceneStart, cues = [{ t: 0, sfx: 'impact', gain: -5 }, { t: .1, sfx: 'whoosh', gain: -12 }, { t: .9, sfx: 'pop', gain: -12 }];
  ORDER.forEach((id, i) => { const d = sc[i].sceneDur, at = (x, sfx, g, o = {}) => cues.push(Object.assign({ t: s(i) + x, sfx, gain: g }, o));
    if (i > 0) { const k = TR(ORDER[i - 1], i - 1) && TR(ORDER[i - 1], i - 1).kind; cues.push({ t: Math.max(0, s(i) - .2), sfx: k === 'flash' ? 'impact' : (k === 'dissolve' || k === 'match' ? 'whoosh_rev' : 'whoosh'), gain: k === 'dissolve' ? -16 : -11 }); }
    if (id === 'L1') { at(.3, 'stamp', -8); at(d * .45, 'pop', -12); at(d * .7, 'pop', -12); }
    if (id === 'L2') { at(.1, 'stamp', -8); at(.45, 'pop', -12); }
    if (id === 'L3') { at(.3, 'ticks', -15, { dur: d - .7 }); at(d * .45, 'pop', -12); }
    if (id === 'L4') { at(.2, 'stamp', -7); at(.6, 'pop', -12); at(d * .6, 'pop', -12); }
    if (id === 'L5') { at(.2, 'stamp', -7); at(d * .45, 'pop', -12); at(d * .65, 'pop', -12); }
    if (id === 'L6') { at(0, 'swell', -18, { dur: d }); at(d * .6, 'ping', -12); }
    if (id === 'L7') { const t0 = Math.max(0, d - MAPRUN.length * SLOT - 1.4); MAPRUN.forEach((y, j) => { at(t0 + j * SLOT, 'stamp', -9); if (j) at(t0 + j * SLOT - .15, 'whoosh', -16); }); at(t0 + MAPRUN.length * SLOT, 'ping', -11); }
    if (id === 'L8') { at(.3, 'ticks', -15, { dur: 1.6 }); at(d * .72, 'stamp', -7); }
    if (id === 'L9') { at(.2, 'pop', -12); at(d * .4, 'pop', -12); }
    if (id === 'L10') { at(.2, 'pop', -12); at(d * .5, 'ping', -12); }
  });
  return cues; };
window.TOTAL = () => S.total;
