/* 2026-11-24 FLAGSHIP (extra): "When Calgary Became a City, This Was All of It" (Calgary Insight ORIGINS).
 * Lead identity Storyteller (night map of the real City of Calgary that lights up annexation by annexation; dusk drone over downtown).
 * Borrowed: Data Explainer counters, stamps and to-scale area squares (L2, L5, L8); Civic Analyst evidence cards and process steps (L10, L11, L13).
 * One file, three cuts (+ thumbnails with --param thumb=1): --param cut=short|wide|teaser
 * Every number, date, name and label on screen maps to the audited claims table in packages/2026-11-24-FLAGSHIP-calgary-original-boundary.md.
 * Community shapes are TODAY's City of Calgary community districts (surr-xmvs), labelled as such; historic limits differed. */
const PR = window.PARAMS || {}, CUT = PR.cut || 'short', THUMB = !!PR.thumb;
const WIDE = CUT === 'wide';
const W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920;
const CX = WIDE ? W / 2 : (W - 120) / 2 + 30;
const L = WIDE ? { hookY: 150, hook: 120, stampY: 170, chip: 44, src: [48, H - 40], fov: 46, big: 110 }
               : { hookY: 330, hook: 140, stampY: 360, chip: 50, src: [60, 1462], fov: 62, big: 120 };

// measured Kokoro line durations, index = line number in probe/tts_lines.json: 0-13 = L0-L13, 14 = Q, 15 = C, 16 = T1, 17 = T2
const VD = PR.vd ? PR.vd.split(',').map(Number) : [3.0, 5.5, 6.8, 6.5, 3.0, 6.5, 8.5, 4.5, 5.0, 5.0, 6.0, 5.5, 7.0, 6.5, 3.0, 2.6, 5.5, 6.0];
const LINES = {
 L0: 'When Calgary became a city, this was all of it.',
 L1: "It became a town in eighteen eighty-four, and a city on New Year's Day, eighteen ninety-four.",
 L2: 'About thirty-nine hundred people lived here. Even in the early nineteen-hundreds, its southern edge was Seventeenth Avenue.',
 L3: "One by one, it took in its neighbours. In nineteen-oh-seven, the village of Rouleauville. Today, that's Mission.",
 L4: 'In nineteen-ten, the village of Crescent Heights.',
 L5: 'By nineteen twenty-five, Calgary covered about a hundred square kilometres, and it barely changed until the mid-fifties.',
 L6: 'Then it grew fast. In nineteen sixty-one alone, it took in the town of Forest Lawn, the community of Midnapore, and more than one hundred and eighty square kilometres.',
 L7: 'Montgomery joined in nineteen sixty-three, and Bowness in nineteen sixty-four.',
 L8: 'By nineteen seventy-eight, Calgary covered about four hundred and ninety square kilometres.',
 L9: 'In two thousand seven, it added about one hundred and three square kilometres from Rocky View County.',
 L10: "So, what's next? The City has started the process to annex a small piece of Foothills County, near Sirocco.",
 L11: 'A bigger plan for Rocky View land in the southeast was put on hold, for a partnership instead.',
 L12: 'You might wonder: what about Airdrie or Chestermere? Chestermere already shares a border with Calgary. Airdrie sits about ten kilometres north.',
 L13: 'In Alberta, merging municipalities that share a border is up to the province, after the councils negotiate and consult the public.',
 Q: 'Should Airdrie or Chestermere ever join Calgary?',
 C: 'Yes or no? Drop your thoughts below.',
 T1: 'Then it took in its neighbours, one by one. Mission, Forest Lawn, Bowness, and more.',
 T2: 'Full video on our YouTube channel. Should Airdrie or Chestermere ever join Calgary? Drop your thoughts below.',
};
const IDX = { T0: 0, Q: 14, C: 15, T1: 16, T2: 17 };
const DUR = id => VD[IDX[id] ?? +id.slice(1)];
const ORDER = { wide: ['L0','L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11','L12','L13','Q','C'],
                short: ['L0','L1','L2','L3','L5','L6','L7','L9','L10','L12','L13','Q','C'],
                teaser: ['T0','T1','T2'] }[CUT];
const TXT = id => LINES[id === 'T0' ? 'L0' : id];
const S = M.script(ORDER.map((id, i) => ({ text: TXT(id), dur: DUR(id), gapAfter: id === 'Q' ? .25 : (ORDER[i + 1] === 'L10' ? .7 : undefined) })),
                   { lead: .3, gap: CUT === 'teaser' ? .35 : .4, tail: CUT === 'teaser' ? 1.0 : 1.2 });
const sc = S.scenes;

// ---------- palette and places (continuity bible) ----------
const GOLD = M.house.gold, ORANGE = '#f7931e', NAVY = '#0b1f3a', INK = '#070d18';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const TODAY = "today's community boundaries";
const COLS = { land: '#16263f', park: '#1b3531', water: '#2c5378', building: '#3a4a60', road: '#2a3a52', motorway: '#46566e', community: '#ffffff' };
const G = () => window.GEO;
const comm = name => (G().communities.items || []).find(it => it.name === name);
const centroid = it => { let sx = 0, sy = 0, n = 0; it.polys.forEach(p => p[0].forEach(q => { sx += q[0]; sy += q[1]; n++; })); return [sx / n, sy / n, 0]; };
const C_ = {}; const P = n => { if (!C_[n]) { const it = comm(n); C_[n] = it ? centroid(it) : [0, 0, 0]; } return C_[n]; };
const BND = () => { const b = G().boundary[0]; let best = b[0]; (Array.isArray(b[0][0]) ? b : [b]).forEach(r => { if (r.length > best.length) best = r; }); return Array.isArray(best[0]) ? best : b; };
const FIRST = ['DOWNTOWN COMMERCIAL CORE', 'EAU CLAIRE', 'DOWNTOWN WEST END', 'CHINATOWN', 'BELTLINE', 'DOWNTOWN EAST VILLAGE', 'INGLEWOOD'];   // C5 (approximate)
const STAGES = [FIRST, ['MISSION'], ['CRESCENT HEIGHTS'], ['FOREST LAWN', 'MIDNAPORE'], ['MONTGOMERY', 'BOWNESS']];
const CITY = [-1500, 800, 0];
const LOFF = { 'BOWNESS': { dx: -150, ly: 90 }, 'MONTGOMERY': { dx: 170, ly: -20 }, 'MIDNAPORE': { ly: 330 } };
const CHM = [17600, -1800, 0], AIR = [-500, 29000, 0];   // schematic markers only (C17, C18), labelled "schematic · not to scale"
const beltS = () => { const it = comm('BELTLINE'); const pts = []; it.polys.forEach(p => p[0].forEach(q => pts.push(q))); const x0 = Math.min(...pts.map(q => q[0])); const west = pts.filter(q => q[0] < x0 + 400); const y = Math.min(...west.map(q => q[1])); return { y, x0 }; };

// ---------- helpers ----------
const cam = o => M.camera(Object.assign({ fov: L.fov }, o), W, H);
const above = (p, h, back = .35, o = {}) => cam({ pos: [p[0] + (o.dx || 0), p[1] - h * back, h], look: [p[0], p[1] + (o.ahead || 0), 0], roll: o.roll });
const band = (c, y0, y1, a = .7) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const src = (c, s) => M.source(c, s, L.src[0], L.src[1], { size: 20, maxW: WIDE ? 1500 : 860 });
const mapCredit = (c, extra) => { M.source(c, MAPC + ' · ' + TODAY, L.src[0], L.src[1] - (extra ? (WIDE ? 36 : 58) : (WIDE ? 0 : 22)), { size: 19, maxW: WIDE ? 1500 : 860 }); if (extra) src(c, extra); };
const navyBg = (c) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, NAVY); g.addColorStop(1, INK); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const north = (c) => { const nx = WIDE ? W - 90 : W - 190, ny = WIDE ? 170 : 300; c.save(); c.globalAlpha = .9; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(nx, ny - 34); c.lineTo(nx + 15, ny + 8); c.lineTo(nx - 15, ny + 8); c.closePath(); c.fill(); M.text(c, 'N', nx, ny + 14, { size: 28, weight: 800, align: 'center' }); c.restore(); };
const stamp = (c, s, t, t0, x = CX, y = L.stampY, size, col = GOLD) => { const k = M.seg(t, t0, t0 + .35, 'outBack'); if (k <= 0) return; size = size || (WIDE ? 92 : 108);
  c.save(); c.translate(x, y); c.rotate(-.04); const s2 = M.lerp(1.8, 1, k); c.scale(s2, s2); c.globalAlpha = Math.min(1, k * 1.5);
  c.font = M.font(size, 800); const tw = c.measureText(s).width; M.rr(c, -tw / 2 - 34, -size * .62, tw + 68, size * 1.24, 22); c.fillStyle = 'rgba(7,13,24,.86)'; c.fill(); c.lineWidth = 8; c.strokeStyle = col; c.stroke();
  M.text(c, s, 0, -size * .52, { size, weight: 800, align: 'center', color: '#fff' }); c.restore(); };
const ease = (t, a, b, e = 'inOutCubic') => M.seg(t, a, b, e);
const chip = (c, s, y, k, o = {}) => { if (k > 0) M.chip(c, s, o.x ?? CX, y, Object.assign({ align: 'center', size: L.chip + 4, alpha: Math.min(1, k) }, o)); };

// lit communities up to stage n (fraction for the newest stage); o.newCol for the newest stage while it lights
function lit(n, p = 1, o = {}) { const hi = {}; for (let i = 0; i <= Math.min(n, STAGES.length - 1); i++) { const isNew = i === n; STAGES[i].forEach(name => { const off = LOFF[name] || {}; hi[name] = { a: o.a ?? .7, p: isNew ? p : 1, col: isNew && o.newCol ? o.newCol : GOLD, label: o.labels && o.labels[name], size: o.lsize, ly: off.ly ?? o.ly, dx: off.dx }; }); } return hi; }
function map(c, cm, hi = {}, o = {}) {
  const w = M.world({ sky: 'night', drawSky: false, fog: { near: 9000, far: 120000, max: .55, color: '#0d1830' } });
  navyBg(c);
  M.geo.addBase(w, { buildings: !!o.buildings, colors: COLS, windows: '#ffd27a', windowAlpha: .55, riverW: 70, lrt: false, communities: false });
  if (o.bnd != null) { const r = BND(), n = Math.max(2, Math.round(r.length * Math.min(1, o.bnd))); w.line(r.slice(0, n), { wm: o.bndW || 160, color: GOLD, order: 6, alpha: o.bndA ?? 1, minPx: 2.5 }); }
  Object.entries(hi).forEach(([name, h]) => { const it = comm(name); if (!it || (h.p ?? 1) <= 0) return; const a = (h.a ?? .6) * (h.p ?? 1);
    it.polys.forEach(poly => w.area(poly, { fill: h.col || GOLD, alpha: a, stroke: h.col || GOLD, strokeAlpha: Math.min(1, (h.p ?? 1) * 1.2), sw: h.sw || 5, order: 4 }));
    if (h.label) w.at(P(name), (ctx, sp) => { M.text(ctx, h.label, sp.x + (h.dx || 0), sp.y - (h.ly ?? 70), { size: h.size || (WIDE ? 44 : 50), weight: 800, align: 'center', stroke: 7, strokeColor: '#06101f', alpha: Math.min(1, (h.p ?? 1) * 1.5), shadow: false }); }); });
  if (o.edge) { const e = beltS(), x1 = M.lerp(e.x0, 300, o.edge); w.line([[e.x0, e.y], [x1, e.y]], { wm: 70, color: '#ffffff', order: 7, alpha: 1, minPx: 4 }); }
  if (o.marks) o.marks.forEach(m => w.at(m.p, (ctx, sp) => { const k = M.ease.outBack(Math.max(0, Math.min(1, m.k))); if (k <= 0) return; const r = (WIDE ? 26 : 30) * k;
    ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(sp.x, sp.y, r, 0, 7); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = ORANGE; ctx.stroke(); ctx.restore();
    M.text(ctx, m.name, sp.x + (m.dx || 0), sp.y - (WIDE ? 110 : 125), { size: WIDE ? 48 : 54, weight: 800, align: 'center', stroke: 7, strokeColor: '#06101f', alpha: Math.min(1, m.k * 2), shadow: false });
    if (m.sub) M.chip(ctx, m.sub, sp.x + (m.dx || 0), sp.y - (WIDE ? 52 : 60), { align: 'center', size: WIDE ? 30 : 34, alpha: Math.min(1, m.k * 2), bg: ORANGE, color: NAVY }); }));
  w.render(c, cm);
  return w;
}
// area squares: side ∝ sqrt(area); anchored bottom-left
const SQ = WIDE ? 560 : 760, AMAX = 189;
const side = a => SQ * Math.sqrt(a / AMAX);
const SQX = WIDE ? 230 : CX - SQ / 2, SQY = WIDE ? 920 : 1300;
function square(c, a, p, col, o = {}) { if (p <= 0) return; const s = side(a) * p, x = o.x ?? SQX, y = o.y ?? SQY;
  c.save(); c.fillStyle = col; c.globalAlpha = o.fillA ?? .28; c.fillRect(x, y - s, s, s); c.globalAlpha = 1; c.lineWidth = 6; c.strokeStyle = col; c.strokeRect(x, y - s, s, s); c.restore(); }
const sqBg = (c, t) => { navyBg(c); c.save(); c.globalAlpha = .07; c.strokeStyle = '#9fb7d6'; c.lineWidth = 1; const g = 60, off = (t * 8) % g; for (let x = -g + off; x < W; x += g) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = -g + off; y < H; y += g) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } c.restore(); };
function headline(c, t, txt, hl) { band(c, WIDE ? 40 : 200, WIDE ? 420 : 760, .62);
  M.kinetic(c, txt, THUMB ? 9 : t, CX, L.hookY, { size: L.hook * (THUMB ? (WIDE ? 1.4 : 1.1) : 1), maxW: WIDE ? 1500 : 860, t0: -0.12, every: .1, highlight: hl }); }
// evidence card (Civic): title, lines, status chip
function card(c, t, t0, title, lines, status, o = {}) { const k = ease(t, t0, t0 + .45, 'outCubic'); if (k <= 0) return;
  const cw = WIDE ? 820 : 860, ch = (WIDE ? 150 : 170) + lines.length * (WIDE ? 62 : 70) + (WIDE ? 80 : 90), x = o.x ?? (WIDE ? W - cw - 80 : CX - cw / 2), y = (o.y ?? (WIDE ? 300 : 560)) + (1 - k) * 40;
  c.save(); c.globalAlpha = k; M.rr(c, x, y, cw, ch, 24); c.fillStyle = 'rgba(247,244,236,.97)'; c.fill(); c.fillStyle = o.col || ORANGE; M.rr(c, x, y, 18, ch, 9); c.fill(); c.restore();
  M.text(c, title, x + 50, y + 34, { size: WIDE ? 54 : 60, weight: 800, color: '#1b2533', shadow: false, alpha: k, maxW: cw - 90 });
  lines.forEach((ln, i) => M.text(c, ln, x + 50, y + (WIDE ? 120 : 135) + i * (WIDE ? 62 : 70), { size: WIDE ? 42 : 46, weight: 600, color: '#3a4656', shadow: false, alpha: ease(t, t0 + .3 + i * .25, t0 + .6 + i * .25), maxW: cw - 90 }));
  if (status) { const ks = ease(t, t0 + .6 + lines.length * .25, t0 + .9 + lines.length * .25, 'outBack'); if (ks > 0) M.chip(c, status, x + 50, y + ch - (WIDE ? 82 : 92), { size: WIDE ? 40 : 44, bg: o.col || ORANGE, color: NAVY, alpha: Math.min(1, ks) }); } }

// ---------- scenes ----------
const D = {
  L0: (c, t, d) => { const dv = THUMB ? .85 : ease(t, 0, d + .6, 'outCubic');
    map(c, above([WIDE ? 300 : 900, 0, 0], M.lerp(30000, WIDE ? 9000 : 10500, dv), .3), lit(0, 1, { a: .8 + .15 * Math.max(0, Math.sin(t * 8)) * (1 - ease(t, .6, 1.4)) }), { bnd: 1, bndA: .5, bndW: 110 });
    if (!THUMB) { const k = ease(t, .9, 1.3); if (k > 0) M.chip(c, 'THE FIRST CITY (APPROX.)', CX, WIDE ? 790 : 1120, { align: 'center', size: L.chip, alpha: k }); }
    headline(c, t, 'This was all of Calgary', ['all', 'calgary']);
    if (!THUMB) { north(c); mapCredit(c); } },
  L1: (c, t, d) => { const p = ease(t, 0, d, 'linear'), w = M.world({ sky: 'dusk', fog: { near: 2500, far: 16000, max: .6 } });
    M.geo.addBase(w, { buildings: true, colors: { land: '#2a2a33', park: '#263a33', water: '#2f557a', building: '#5a5f73', road: '#4a4655', motorway: '#6a5f66' }, windows: '#ffd27a', windowAlpha: .7, lrt: false });
    w.render(c, cam(M.moves.orbit([0, 0, 0], 2600, 900, 200, 40, p)));
    const y = WIDE ? 760 : 1060, x0 = WIDE ? 360 : 140, x1 = WIDE ? 1560 : 880; band(c, y - 260, y + 260, .7);
    c.save(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + (x1 - x0) * ease(t, 0, .6), y); c.stroke(); c.restore();
    [[1884, 'TOWN', .4], [1894, 'CITY', d * .45]].forEach(([yr, lab, t0], i) => { const k = ease(t, t0, t0 + .4, 'outBack'); if (k <= 0) return; const x = i ? x1 - 120 : x0 + 120;
      c.save(); c.globalAlpha = Math.min(1, k * 2); c.fillStyle = GOLD; c.beginPath(); c.arc(x, y, 20 * k, 0, 7); c.fill(); c.restore();
      M.text(c, String(yr), x, y - (WIDE ? 170 : 190), { size: WIDE ? 104 : 116, weight: 800, align: 'center', alpha: Math.min(1, k * 2) }); M.chip(c, lab, x, y + 40, { align: 'center', size: L.chip + 6, alpha: Math.min(1, k * 2) }); });
    chip(c, 'JAN 1, 1894', WIDE ? y - 290 : y + 140, ease(t, d * .6, d * .6 + .35, 'outBack'), { x: x1 - 120, bg: '#ffffff', color: NAVY });
    src(c, 'Sources: City of Calgary Archives · The Canadian Encyclopedia'); },
  L2: (c, t, d) => { const p = ease(t, 0, d, 'linear'), e = ease(t, d * .45, d * .75, 'inOutCubic');
    map(c, above([400, -500, 0], M.lerp(9000, 7600, p), .35), lit(0, 1, { a: .6 }), { edge: e });
    const k = ease(t, .1, 1.4, 'outCubic'); band(c, WIDE ? 30 : 230, WIDE ? 330 : 640, .6);
    M.text(c, '~' + Math.round(3900 * k).toLocaleString('en-US'), CX, WIDE ? 70 : 300, { size: WIDE ? 120 : 140, weight: 800, align: 'center', color: GOLD });
    chip(c, 'PEOPLE · 1894', WIDE ? 230 : 480, ease(t, .4, .8));
    if (e > .6) { chip(c, '17 AVENUE: SOUTHERN EDGE', WIDE ? 860 : 640, ease(t, d * .7, d * .7 + .35, 'outBack'), { bg: '#ffffff', color: NAVY }); chip(c, 'EARLY 1900s', WIDE ? 940 : 730, ease(t, d * .78, d * .78 + .35, 'outBack')); }
    north(c); mapCredit(c, 'Sources: City of Calgary Archives · City of Calgary, Calgary’s Mount Royal (1994)'); },
  L3: (c, t, d) => { const p = ease(t, 0, d, 'inOutSine');
    map(c, above([M.lerp(0, P('MISSION')[0], p), M.lerp(0, P('MISSION')[1], p), 0], M.lerp(14000, WIDE ? 8000 : 9000, p), .45), lit(1, ease(t, d * .45, d * .65), { labels: { 'MISSION': 'MISSION' } }));
    stamp(c, '1907', t, d * .42); chip(c, 'ROULEAUVILLE → MISSION', L.stampY + (WIDE ? 90 : 115), ease(t, d * .55, d * .55 + .35));
    north(c); mapCredit(c, 'Sources: Heritage Calgary · City of Calgary History of Annexation map'); },
  L4: (c, t, d) => { const p = ease(t, 0, d, 'inOutSine'), a = P('MISSION'), b = P('CRESCENT HEIGHTS');
    map(c, above([M.lerp(a[0], b[0], p), M.lerp(a[1], b[1], p), 0], M.lerp(11000, 10000, p), .45), lit(2, ease(t, .5, 1.1), { labels: { 'CRESCENT HEIGHTS': 'CRESCENT HEIGHTS' } }));
    stamp(c, '1910', t, .5); chip(c, 'VILLAGE OF CRESCENT HEIGHTS', L.stampY + (WIDE ? 90 : 115), ease(t, .9, 1.3));
    north(c); mapCredit(c, 'Source: Heritage Calgary, Crescent Heights Context Paper'); },
  L5: (c, t, d) => { sqBg(c, t); const k = ease(t, .2, 1.4, 'outBack');
    square(c, 39.6, k, GOLD, { x: WIDE ? 260 : CX - side(39.6) / 2 });
    M.text(c, '~100 km²', WIDE ? 1000 : CX, WIDE ? 380 : 300, { size: L.big, weight: 800, align: WIDE ? 'left' : 'center' });
    chip(c, '1925', WIDE ? 520 : 450, ease(t, .5, .9), WIDE ? { x: 1004, align: 'left' } : {});
    chip(c, 'BARELY CHANGED UNTIL THE MID-1950s', WIDE ? 620 : 560, ease(t, d * .55, d * .55 + .4, 'outBack'), Object.assign({ bg: '#ffffff', color: NAVY }, WIDE ? { x: 1004, align: 'left' } : {}));
    M.text(c, 'to scale · converted from 39.6 sq mi', WIDE ? 1000 : CX, WIDE ? 720 : 680, { size: 28, weight: 500, align: WIDE ? 'left' : 'center', color: '#9fb0c8', alpha: ease(t, 1, 1.5) });
    src(c, 'Source: Foran, Expansive Discourses (AU Press), Table 2'); },
  L6: (c, t, d) => { const p = ease(t, 0, d * .6, 'inOutCubic'), lk = ease(t, d * .35, d * .6);
    map(c, above(CITY, M.lerp(16000, WIDE ? 44000 : 52000, p), .2), lit(3, lk, { newCol: lk < 1 ? ORANGE : GOLD, labels: { 'FOREST LAWN': 'FOREST LAWN', 'MIDNAPORE': 'MIDNAPORE' }, lsize: WIDE ? 40 : 46 }), { bnd: 1, bndA: .35, bndW: 140 });
    band(c, WIDE ? 30 : 200, WIDE ? 330 : 640, .5);
    M.kinetic(c, 'Then it grew fast', t, CX, WIDE ? 60 : 250, { size: WIDE ? 110 : 120, maxW: WIDE ? 1500 : 860, highlight: ['fast'] });
    stamp(c, '1961', t, d * .4, CX, WIDE ? 230 : 450); chip(c, '180+ KM² ADDED', WIDE ? 320 : 560, ease(t, d * .6, d * .6 + .35, 'outBack'), { bg: ORANGE, color: NAVY });
    north(c); mapCredit(c, 'Sources: Foran (AU Press) · City of Calgary History of Annexation map'); },
  L7: (c, t, d) => { const p = ease(t, 0, d, 'inOutSine'), m = P('MONTGOMERY');
    map(c, above([m[0] + 1500, m[1] - 1500, 0], M.lerp(30000, 22000, p), .35), lit(4, ease(t, .2, 1.2), { labels: { 'MONTGOMERY': 'MONTGOMERY', 'BOWNESS': 'BOWNESS' }, lsize: WIDE ? 40 : 46 }));
    // (labels offset below via LOFF)
    stamp(c, '1963', t, .3, CX - (WIDE ? 200 : 190), L.stampY, WIDE ? 84 : 96); stamp(c, '1964', t, d * .5, CX + (WIDE ? 200 : 190), L.stampY + (WIDE ? 0 : 0), WIDE ? 84 : 96);
    north(c); mapCredit(c, 'Source: Foran, Expansive Discourses (AU Press)'); },
  L8: (c, t, d) => { sqBg(c, t); square(c, 39.6, 1, GOLD); const k = ease(t, .4, d * .7, 'inOutCubic'); square(c, 189, k, '#ffffff', { fillA: .08 });
    const yr = Math.round(M.lerp(1925, 1978, k)); M.text(c, String(yr), WIDE ? 1000 : CX, WIDE ? 200 : 230, { size: WIDE ? 150 : 170, weight: 800, align: WIDE ? 'left' : 'center', color: k >= 1 ? GOLD : '#fff' });
    if (k > .98) M.text(c, '~490 km²', WIDE ? 1000 : CX, WIDE ? 430 : 420, { size: L.big, weight: 800, align: WIDE ? 'left' : 'center' });
    M.text(c, '~100', SQX + side(39.6) / 2, SQY - side(39.6) / 2 - 30, { size: 48, weight: 800, align: 'center', color: GOLD });
    M.text(c, 'to scale · converted from 189 sq mi', WIDE ? 1000 : CX, WIDE ? 600 : 1340, { size: 28, weight: 500, align: WIDE ? 'left' : 'center', color: '#9fb0c8' });
    src(c, 'Source: Foran, Expansive Discourses (AU Press), Table 2'); },
  L9: (c, t, d) => { const pulse = .55 + .45 * Math.sin(t * 4);
    map(c, cam(M.moves.orbit(CITY, 34000, 38000, 260, 25, ease(t, 0, d, 'linear'))), lit(4, 1, { a: .55 }), { bnd: 1, bndA: pulse, bndW: 260 });
    stamp(c, '2007', t, d * .25); chip(c, '~103 KM² FROM ROCKY VIEW COUNTY', L.stampY + (WIDE ? 90 : 115), ease(t, d * .45, d * .45 + .4), { size: L.chip });
    M.text(c, "today's city limits", WIDE ? W - 60 : CX, WIDE ? H - 130 : 1340, { size: 28, weight: 600, align: WIDE ? 'right' : 'center', color: GOLD });
    north(c); src(c, 'Map data © OpenStreetMap contributors · Source: City of Calgary'); },
  L10: (c, t, d) => { map(c, above(CITY, M.lerp(52000, 56000, ease(t, 0, d)), .2), lit(4, 1, { a: .4 }), { bnd: 1, bndA: .5, bndW: 160 });
    c.fillStyle = 'rgba(7,13,24,.45)'; c.fillRect(0, 0, W, H);
    M.kinetic(c, "What's next?", t, CX, WIDE ? 80 : 290, { size: WIDE ? 120 : 130, maxW: 860, highlight: ['next?'] });
    card(c, t, d * .3, 'FOOTHILLS COUNTY', ['~173 hectares near Sirocco', 'Annexation started in 2025'], 'EARLY STAGES');
    src(c, 'Source: City of Calgary, Foothills County annexation'); },
  L11: (c, t, d) => { map(c, above(CITY, 56000, .2), lit(4, 1, { a: .4 }), { bnd: 1, bndA: .5, bndW: 160 }); c.fillStyle = 'rgba(7,13,24,.45)'; c.fillRect(0, 0, W, H);
    card(c, t, .2, 'ROCKY VIEW · SOUTHEAST', ['A bigger annexation plan', 'Put on hold'], 'PARTNERSHIP INSTEAD', { col: '#ffffff' });
    src(c, 'Sources: City of Calgary · Rocky View County'); },
  L12: (c, t, d) => { const p = ease(t, 0, d * .5, 'inOutCubic');
    map(c, above([2500, 6000, 0], M.lerp(56000, WIDE ? 78000 : 96000, p), .18), lit(4, 1, { a: .45 }), { bnd: 1, bndA: .8, bndW: 220,
      marks: [{ p: CHM, k: ease(t, d * .3, d * .45), name: 'CHESTERMERE', sub: 'SHARES A BORDER' }, { p: AIR, k: ease(t, d * .65, d * .8), name: 'AIRDRIE', sub: '~10 KM NORTH' }] });
    M.text(c, 'schematic · not to scale', WIDE ? W - 60 : CX, WIDE ? H - 200 : 1240, { size: 28, weight: 600, align: WIDE ? 'right' : 'center', color: '#c9d3e0' });
    north(c); src(c, 'Sources: City of Calgary · The Canadian Encyclopedia · map: OpenStreetMap contributors'); },
  L13: (c, t, d) => { sqBg(c, t);
    M.text(c, 'IN ALBERTA', CX, WIDE ? 120 : 300, { size: WIDE ? 70 : 76, weight: 800, align: 'center', color: GOLD, alpha: ease(t, 0, .3) });
    [['1', 'NEGOTIATE'], ['2', 'CONSULT THE PUBLIC'], ['3', 'PROVINCE DECIDES']].forEach(([n, s], i) => { const k = ease(t, .4 + i * d * .22, .75 + i * d * .22, 'outBack'); if (k <= 0) return;
      const y = (WIDE ? 300 : 520) + i * (WIDE ? 200 : 260), x = WIDE ? 560 : 110; c.save(); c.globalAlpha = Math.min(1, k * 1.5);
      c.fillStyle = i === 2 ? GOLD : '#ffffff'; c.beginPath(); c.arc(x + 60, y + 60, 60 * Math.min(1.2, k), 0, 7); c.fill(); c.restore();
      M.text(c, n, x + 60, y + 18, { size: 72, weight: 800, align: 'center', color: NAVY, shadow: false, alpha: Math.min(1, k * 1.5) });
      M.text(c, s, x + 160, y + 22, { size: WIDE ? 72 : 66, weight: 800, color: i === 2 ? GOLD : '#fff', alpha: Math.min(1, k * 1.5), maxW: WIDE ? 1000 : 780 }); });
    if (WIDE) M.text(c, "merging cities (amalgamation), Alberta's Municipal Government Act", CX, WIDE ? 830 : 1230, { size: 30, weight: 600, align: 'center', color: '#c9d3e0', maxW: 860, alpha: ease(t, 1, 1.5) });
    src(c, 'Sources: Government of Alberta · Municipal Government Act'); },
  Q: (c, t, d) => { map(c, above([2500, 6000, 0], WIDE ? 78000 : 96000, .18), lit(4, 1, { a: .45 }), { bnd: 1, bndA: .7, bndW: 220, marks: [{ p: CHM, k: 1, name: 'CHESTERMERE' }] });
    band(c, WIDE ? 30 : 230, WIDE ? 420 : 860, .65); M.kinetic(c, 'Should Airdrie or Chestermere ever join Calgary?', t, CX, WIDE ? 90 : 330, { size: WIDE ? 100 : 112, maxW: WIDE ? 1500 : 860, highlight: ['airdrie', 'chestermere'], every: .1 });
    src(c, 'schematic · not to scale'); },
  C: (c, t, d) => { map(c, above([2500, 6000, 0], WIDE ? 78000 : 96000, .18), lit(4, 1, { a: .45 }), { bnd: 1, bndA: .6, bndW: 220 }); c.fillStyle = 'rgba(7,13,24,.92)'; c.fillRect(0, 0, W, H);
    M.closer(c, 'Should Airdrie or Chestermere ever join Calgary? Yes or no?', M.seg(t, 0, d, 'linear') + .3, W, H, { highlight: ['yes', 'no?'] }); },
  T0: (c, t, d) => D.L0(c, t, d),
  T1: (c, t, d) => { const p = ease(t, 0, d * .5, 'inOutCubic');
    const hi = lit(0, 1, { a: .6 }); [['MISSION', .2, -170], ['FOREST LAWN', .45, 170], ['BOWNESS', .7, 0]].forEach(([n, f, dx]) => { hi[n] = { a: .75, p: ease(t, d * f, d * f + .4), label: n, size: WIDE ? 42 : 48, dx, ly: n === 'MISSION' ? -40 : 70 }; });
    map(c, above(CITY, M.lerp(20000, WIDE ? 44000 : 52000, p), .2), hi, { bnd: 1, bndA: .4, bndW: 140 });
    chip(c, 'ONE BY ONE', L.stampY, ease(t, .2, .6, 'outBack'), { size: L.chip + 10 });
    north(c); mapCredit(c, 'Sources: Heritage Calgary · Foran (AU Press)'); },
  T2: (c, t, d) => { if (t >= 2.1 && t < 4.8) { D.Q(c, t - 2.1, 2.7); return; } navyBg(c); const a = 1 - M.seg(t, 1.6, 1.95);
    if (a > 0) { M.text(c, '▶ FULL VIDEO', CX, 600, { size: 112, weight: 800, align: 'center', alpha: a * M.seg(t, 0, .25) });
      M.text(c, 'on our YouTube channel', CX, 760, { size: 54, weight: 700, align: 'center', color: GOLD, maxW: 860, alpha: a * M.seg(t, .2, .45) });
      M.text(c, 'calgaryinsight.ca', CX, 1000, { size: 40, weight: 600, align: 'center', alpha: a * M.seg(t, .3, .55) }); }
    if (t >= 4.8) M.closer(c, 'Should Airdrie or Chestermere ever join Calgary? Yes or no?', M.seg(t, 4.8, d, 'linear') + .3, W, H, { highlight: ['yes', 'no?'] }); },
};
const TRANS = { L0: { kind: 'dissolve', dur: .5 }, L1: { kind: 'dissolve', dur: .5 }, L2: { kind: 'match', dur: .45 }, L3: { kind: 'match', dur: .45 }, L4: { kind: 'zoom', dur: .4 },
  L5: { kind: 'flash', dur: .3 }, L6: { kind: 'match', dur: .45 }, L7: { kind: 'zoom', dur: .4 }, L8: { kind: 'dissolve', dur: .5 }, L9: { kind: 'push', dur: .4 },
  L10: { kind: 'push', dur: .4 }, L11: { kind: 'dissolve', dur: .5 }, L12: { kind: 'whip', dur: .35 }, L13: { kind: 'dissolve', dur: .45 }, Q: { kind: 'dissolve', dur: .35 },
  T0: { kind: 'match', dur: .45 }, T1: { kind: 'dissolve', dur: .45 } };
const TR = (id, i) => { if (!ORDER[i + 1]) return undefined; if (CUT === 'short' && id === 'L3') return { kind: 'zoom', dur: .4 }; if (CUT === 'short' && id === 'L7') return { kind: 'match', dur: .45 }; if (CUT === 'short' && id === 'L10') return { kind: 'whip', dur: .35 }; if (CUT === 'short' && id === 'L12') return { kind: 'dissolve', dur: .45 }; return TRANS[id]; };

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
    if (id === 'L1') { at(.4, 'pop', -12); at(d * .45, 'stamp', -9); at(d * .6, 'pop', -12); at(0, 'city', -24, { dur: d }); }
    if (id === 'L2') { at(.1, 'ticks', -15, { dur: 1.3 }); at(d * .45, 'riser', -18, { dur: d * .3 }); at(d * .7, 'pop', -11); }
    if (id === 'L3') { at(d * .42, 'stamp', -7); at(d * .55, 'pop', -12); }
    if (id === 'L4') { at(.5, 'stamp', -7); at(.9, 'pop', -12); }
    if (id === 'L5') { at(.3, 'pop', -12); at(d * .55, 'ping', -13); }
    if (id === 'L6') { at(0, 'riser', -16, { dur: d * .4 }); at(d * .4, 'stamp', -6); at(d * .6, 'impact', -10); }
    if (id === 'L7') { at(.3, 'stamp', -7); at(d * .5, 'stamp', -7); }
    if (id === 'L8') { at(.4, 'ticks', -15, { dur: d * .65 }); at(d * .7, 'impact', -9); }
    if (id === 'L9') { at(d * .25, 'stamp', -7); at(d * .45, 'pop', -12); }
    if (id === 'L10') { at(.1, 'ping', -12); at(d * .3, 'thud', -12); at(d * .7, 'pop', -12); }
    if (id === 'L11') { at(.2, 'thud', -12); at(1.2, 'pop', -12); }
    if (id === 'L12') { at(0, 'swell', -18, { dur: d }); at(d * .3, 'ping', -11); at(d * .65, 'ping', -11); }
    if (id === 'L13') { [0, 1, 2].forEach(j => at(.4 + j * d * .22, 'pop', -11)); }
    if (id === 'T1') { at(.2, 'pop', -12); [.2, .45, .7].forEach(f => at(d * f, 'ping', -13)); }
    if (id === 'T2') { at(.1, 'ping', -12); }
  });
  return cues; };
window.TOTAL = () => S.total;
