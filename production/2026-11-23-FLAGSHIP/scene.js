/* 2026-11-23 FLAGSHIP: "Bowness Was a Town: How Annexation Grew Calgary" (Calgary Insight ORIGINS).
 * Lead identity: Storyteller (night map dives over the real City of Calgary geography, dusk drones over the real OSM downtown).
 * Borrowed: Data Explainer area squares, year counter and stamp slams (S5-S7, S9-S12); Civic Analyst vote bars and result card (S8, S11).
 * One file, three cuts (+ thumbnails with --param thumb=1):
 *   python3 ../../motion/engine/render.py scene.js short.mp4  --geo ../../motion/geo/calgary_base.json --param cut=short
 *   python3 ../../motion/engine/render.py scene.js wide.mp4   --geo ../../motion/geo/calgary_base.json --param cut=wide
 *   python3 ../../motion/engine/render.py scene.js teaser.mp4 --geo ../../motion/geo/calgary_base.json --param cut=teaser
 * Every number, date, name and label on screen maps to the audited claims table in packages/2026-11-23-FLAGSHIP-annexation-grew-calgary.md (C#).
 * Community shapes are TODAY's City of Calgary community districts (surr-xmvs), labelled as such; the historic town limits differed. */
const PR = window.PARAMS || {}, CUT = PR.cut || 'short', THUMB = !!PR.thumb;
const WIDE = CUT === 'wide';
const W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920;
const CX = WIDE ? W / 2 : (W - 120) / 2 + 30;
const L = WIDE ? { hookY: 150, hook: 120, stampY: 170, chip: 44, src: [48, H - 40], fov: 46, big: 110 }
               : { hookY: 330, hook: 150, stampY: 360, chip: 50, src: [60, 1462], fov: 62, big: 120 };

// measured Kokoro line durations (studio-probe, af_heart), index = line number in probe/tts_lines.json: 0-15 = L0-L15, 16 = T1, 17 = T2
const VD = window.VD || [3.287, 2.24, 4.48, 4.416, 6.999, 3.904, 9.708, 5.761, 9.004, 3.136, 2.624, 6.183, 6.08, 6.849, 5.271, 5.344, 10.392, 4.625, 2.6, 2.744];   // studio-probe run 2026-11-23 20:40 UTC (durs.json); 18/19 = v_15 split at its sentence pause (2.60 s)
const LINES = {
 "L0": "Bowness was once its own town. So was Forest Lawn.",
 "L1": "So how did they end up inside Calgary?",
 "L2": "Calgary became a town in eighteen eighty-four, and a city in eighteen ninety-four.",
 "L3": "And one of the main ways it grew was annexation: taking in the land around it.",
 "L4": "In nineteen-oh-seven, it took in Rouleauville, a village founded by Father Albert Lacombe. Today, we call it Mission.",
 "L5": "By the mid nineteen-fifties, Calgary covered about forty square miles.",
 "L6": "Then came the big jump. Between nineteen fifty-six and nineteen sixty-one, a series of annexations swelled it to about one hundred and fifty-one square miles.",
 "L7": "In nineteen sixty-one alone, more than seventy square miles were added. The city almost doubled.",
 "L8": "Not everyone wanted in. In Forest Lawn's nineteen fifty-six race for mayor, the candidate against annexation took eighty-one percent of the vote.",
 "L9": "Five years later, Forest Lawn became part of Calgary.",
 "L10": "Montgomery followed in nineteen sixty-three.",
 "L11": "And Bowness? The town voted to join. One thousand and three to three hundred and ninety-seven.",
 "L12": "When Bowness joined in nineteen sixty-four, Calgary covered about one hundred and fifty-four square miles.",
 "L13": "And it didn't stop there. In two thousand seven, Calgary took in about twenty-five thousand acres from Rocky View.",
 "L14": "Calgary's map was never finished. It's been redrawn again and again, one border at a time.",
 "L15": "Should Calgary keep growing out, or build up? Out or up? Drop your thoughts below.",
 "Q": "Should Calgary keep growing out, or build up?",
 "C": "Out or up? Drop your thoughts below.",
 "T1": "In the nineteen-sixties, both became part of Calgary. Bowness even voted to join. By nineteen sixty-four, the city covered about one hundred and fifty-four square miles.",
 "T2": "Full video on our page. Out or up? Drop your thoughts below."
};
const IDX = { T0: 0, T1: 16, T2: 17, Q: 18, C: 19 };   // Q + C = L15 audio split at its sentence pause (same words, same take)
const DUR = id => VD[IDX[id] ?? +id.slice(1)];
const ORDER = { wide: ['L0','L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11','L12','L13','L14','Q','C'],
                short: window.SHORT_ORDER || ['L0','L1','L2','L3','L5','L6','L8','L9','L11','L12','Q','C'],
                teaser: ['T0','T1','T2'] }[CUT];
const TXT = id => LINES[id === 'T0' ? 'L0' : id];
const TURN = 'L7';   // 0.8 s of silence before "Not everyone wanted in" (in the Short the line before L8 is L6)
const S = M.script(ORDER.map((id, i) => ({ text: TXT(id), dur: DUR(id), gapAfter: ORDER[i + 1] === 'L8' ? .8 : (id === 'Q' ? 0 : undefined) })),
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
const C = {}; ['BOWNESS', 'FOREST LAWN', 'MONTGOMERY', 'MISSION'].forEach(n => { C[n] = null; });
const P = n => { if (!C[n]) { const it = comm(n); C[n] = it ? centroid(it) : [0, 0, 0]; } return C[n]; };
const BND = () => { const b = G().boundary[0]; let best = b[0]; (Array.isArray(b[0][0]) ? b : [b]).forEach(r => { if (r.length > best.length) best = r; }); return Array.isArray(best[0]) ? best : b; };
const DOWN = [0, 0, 0];

// ---------- helpers ----------
const cam = o => M.camera(Object.assign({ fov: L.fov }, o), W, H);
const above = (p, h, back = .35, o = {}) => cam({ pos: [p[0] + (o.dx || 0), p[1] - h * back, h], look: [p[0], p[1] + (o.ahead || 0), 0], roll: o.roll });
const band = (c, y0, y1, a = .7) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const src = (c, s, dy = 0) => M.source(c, s, L.src[0], L.src[1] + dy, { size: 20, maxW: WIDE ? 1500 : 860 });
const mapCredit = (c, extra) => { M.source(c, MAPC + ' · ' + TODAY, L.src[0], L.src[1] - (extra ? (WIDE ? 36 : 58) : (WIDE ? 0 : 22)), { size: 19, maxW: WIDE ? 1500 : 860 }); if (extra) src(c, extra); };
const navyBg = (c) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, NAVY); g.addColorStop(1, INK); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const north = (c) => { const nx = WIDE ? W - 90 : W - 190, ny = WIDE ? 170 : 300; c.save(); c.globalAlpha = .9; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(nx, ny - 34); c.lineTo(nx + 15, ny + 8); c.lineTo(nx - 15, ny + 8); c.closePath(); c.fill(); M.text(c, 'N', nx, ny + 14, { size: 28, weight: 800, align: 'center' }); c.restore(); };
const stamp = (c, s, t, t0, x = CX, y = L.stampY, size, col = GOLD, fade = 1) => { const k = M.seg(t, t0, t0 + .35, 'outBack'); if (k <= 0 || fade <= 0) return; size = size || (WIDE ? 92 : 108);
  c.save(); c.translate(x, y); c.rotate(-.04); const s2 = M.lerp(1.8, 1, k); c.scale(s2, s2); c.globalAlpha = Math.min(1, k * 1.5) * fade;
  c.font = M.font(size, 800); const tw = c.measureText(s).width; M.rr(c, -tw / 2 - 34, -size * .62, tw + 68, size * 1.24, 22); c.fillStyle = 'rgba(7,13,24,.86)'; c.fill(); c.lineWidth = 8; c.strokeStyle = col; c.stroke();
  M.text(c, s, 0, -size * .52, { size, weight: 800, align: 'center', color: '#fff' }); c.restore(); };
const ease = (t, a, b, e = 'inOutCubic') => M.seg(t, a, b, e);

// the night map with highlighted communities. hi: {NAME: {col, a, label, p}}; o.buildings for downtown; o.bnd: boundary draw-on 0..1 (or pulse)
function map(c, cm, hi = {}, o = {}) {
  const w = M.world({ sky: 'night', drawSky: false, fog: { near: 9000, far: 90000, max: .55, color: '#0d1830' } });
  navyBg(c);
  M.geo.addBase(w, { buildings: !!o.buildings, colors: COLS, windows: '#ffd27a', windowAlpha: .55, riverW: 70, lrt: false, communities: false });
  if (o.bnd != null) { const r = BND(), n = Math.max(2, Math.round(r.length * Math.min(1, o.bnd))); w.line(r.slice(0, n), { wm: o.bndW || 160, color: GOLD, order: 6, alpha: o.bndA ?? 1, minPx: 2.5 }); }
  Object.entries(hi).forEach(([name, h]) => { const it = comm(name); if (!it || (h.p ?? 1) <= 0) return; const a = (h.a ?? .6) * (h.p ?? 1);
    it.polys.forEach(poly => w.area(poly, { fill: h.col || GOLD, alpha: a, stroke: h.col || GOLD, strokeAlpha: Math.min(1, (h.p ?? 1) * 1.2), sw: h.sw || 5, order: 4 }));
    if (h.label) w.at(P(name), (ctx, sp) => { const al = Math.min(1, (h.p ?? 1) * 1.5); M.text(ctx, h.label, sp.x + (h.dx || 0), sp.y - (h.ly ?? 70), { size: h.size || (WIDE ? 44 : 50), weight: 800, align: 'center', stroke: 7, strokeColor: '#06101f', alpha: al, shadow: false }); }); });
  if (o.pins) o.pins.forEach(pn => w.at(P(pn.name), (ctx, sp) => { const k = M.ease.outBack(Math.max(0, Math.min(1, pn.p))); if (k <= 0) return; const y = sp.y - 95 - (1 - k) * 120, r = (WIDE ? 34 : 40) * (1 + .08 * Math.sin(pn.t * 6));
    ctx.save(); ctx.globalAlpha = Math.min(1, pn.p * 3); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sp.x, y - r, r, 0, 7); ctx.fill(); M.text(ctx, '?', sp.x, y - r * 1.62, { size: r * 1.3, weight: 900, align: 'center', color: NAVY, shadow: false }); ctx.restore(); }));
  w.render(c, cm);
  return w;
}

// area squares: side ∝ sqrt(area); anchored bottom-left at (x0, y0)
const SQ = WIDE ? 520 : 700;  // side of the 154 sq mi square
const side = a => SQ * Math.sqrt(a / 154);
const SQX = WIDE ? 230 : (W - 120) / 2 + 30 - SQ / 2, SQY = WIDE ? 900 : 1270;
function square(c, a, p, col, o = {}) { if (p <= 0) return; const s = side(a) * p, x = o.x ?? SQX, y = o.y ?? SQY;
  c.save(); c.globalAlpha = o.alpha ?? 1; c.fillStyle = col; c.globalAlpha *= o.fillA ?? .28; c.fillRect(x, y - s, s, s); c.globalAlpha = o.alpha ?? 1; c.lineWidth = 6; c.strokeStyle = col; c.strokeRect(x, y - s, s, s); c.restore(); }
function sqLabel(c, s, sub, x, y, o = {}) { M.text(c, s, x, y, { size: o.size || L.big, weight: 800, align: o.align || 'left', color: o.color || '#fff' }); if (sub) M.chip(c, sub, x + (o.align === 'center' ? 0 : 4), y + (o.size || L.big) * 1.12, { size: L.chip, align: o.align || 'left', bg: o.chipBg || GOLD, color: NAVY }); }
const sqBg = (c, t) => { navyBg(c); c.save(); c.globalAlpha = .07; c.strokeStyle = '#9fb7d6'; c.lineWidth = 1; const g = 60, off = (t * 8) % g; for (let x = -g + off; x < W; x += g) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = -g + off; y < H; y += g) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } c.restore(); };

// the headline in the thumbnail's design (frame 0 = thumbnail)
function headline(c, t, txt, hl) {
  band(c, WIDE ? 40 : 200, WIDE ? 420 : 760, .62);
  M.kinetic(c, txt, THUMB ? 9 : t, CX, L.hookY, { size: L.hook * (THUMB ? (WIDE ? 1.45 : 1.08) : 1), maxW: WIDE ? 1500 : 860, t0: -0.12, every: .1, highlight: hl });
}

// ---------- scenes by line id (c, t local seconds, d scene length) ----------
const BOW = () => P('BOWNESS'), FL = () => P('FOREST LAWN'), MON = () => P('MONTGOMERY'), MIS = () => P('MISSION');
const D = {
  L0: (c, t, d) => { // VISUAL HOOK at frame 0: dive onto Bowness, whip east to Forest Lawn
    const pan = THUMB ? 0 : ease(t, d * .5, d * .5 + .55, 'inOutCubic'), dv = THUMB ? .8 : ease(t, 0, 1.6, 'outCubic');
    const tgt = [M.lerp(BOW()[0], FL()[0], pan), M.lerp(BOW()[1], FL()[1], pan), 0], h = M.lerp(17000, WIDE ? 9000 : 11000, dv) + Math.sin(pan * Math.PI) * 9000;
    map(c, above(tgt, h, .45, { roll: Math.sin(pan * Math.PI) * 4 }), { 'BOWNESS': { p: THUMB ? 1 : M.lerp(.55, 1, ease(t, 0, .4)), a: .75 + .15 * Math.max(0, Math.sin(t * 9)) * (1 - ease(t, .6, 1.2)), label: 'BOWNESS' }, 'FOREST LAWN': { p: ease(t, d * .5 + .3, d * .5 + .7), a: .75, label: 'FOREST LAWN' } });
    if (!THUMB && pan > .02 && pan < .98) { c.save(); c.globalAlpha = Math.sin(pan * Math.PI) * .35; c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.restore(); }
    if (THUMB || t < d * .5 + .15) headline(c, t, 'Bowness was a town.', ['was', 'a', 'town.']);
    else headline(c, t - (d * .5 + .15), 'So was Forest Lawn.', ['forest', 'lawn.']);
    if (!THUMB) { north(c); mapCredit(c); } },
  L1: (c, t, d) => { const p = ease(t, 0, d, 'inOutCubic'), mid = [(BOW()[0] + FL()[0]) / 2 + (WIDE ? 0 : 1200), (BOW()[1] + FL()[1]) / 2, 0];
    map(c, above(mid, M.lerp(36000, 48000, p), .3), { 'BOWNESS': { a: .75, label: 'BOWNESS' }, 'FOREST LAWN': { a: .75, label: 'FOREST LAWN' } }, { pins: [{ name: 'BOWNESS', p: ease(t, .2, .6), t }, { name: 'FOREST LAWN', p: ease(t, .4, .8), t }], bnd: 1, bndA: .45, bndW: 120 });
    band(c, WIDE ? 30 : 230, WIDE ? 300 : 620, .55); M.kinetic(c, 'How did they end up inside Calgary?', t, CX, WIDE ? 90 : 330, { size: WIDE ? 96 : 110, maxW: WIDE ? 1500 : 860, highlight: ['calgary?'] });
    north(c); mapCredit(c); },
  L2: (c, t, d) => { // dusk drone over the real downtown + timeline
    const p = ease(t, 0, d, 'linear'), w = M.world({ sky: 'dusk', fog: { near: 2500, far: 16000, max: .6 } });
    M.geo.addBase(w, { buildings: true, colors: { land: '#2a2a33', park: '#263a33', water: '#2f557a', building: '#5a5f73', road: '#4a4655', motorway: '#6a5f66' }, windows: '#ffd27a', windowAlpha: .7, lrt: false });
    w.render(c, cam(M.moves.orbit(DOWN, 2600, 900, 200, 40, p)));
    const y = WIDE ? 760 : 1060, x0 = WIDE ? 360 : 140, x1 = WIDE ? 1560 : 880; band(c, y - 260, y + 230, .7);
    c.save(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + (x1 - x0) * ease(t, 0, .6), y); c.stroke(); c.restore();
    [[1884, 'TOWN', .5], [1894, 'CITY', d * .55]].forEach(([yr, lab, t0], i) => { const k = ease(t, t0, t0 + .4, 'outBack'); if (k <= 0) return; const x = i ? x1 - 120 : x0 + 120;
      c.save(); c.globalAlpha = Math.min(1, k * 2); c.fillStyle = GOLD; c.beginPath(); c.arc(x, y, 20 * k, 0, 7); c.fill(); c.restore();
      M.text(c, String(yr), x, y - (WIDE ? 170 : 190), { size: WIDE ? 104 : 116, weight: 800, align: 'center', alpha: Math.min(1, k * 2) }); M.chip(c, lab, x, y + 40, { align: 'center', size: L.chip + 6, alpha: Math.min(1, k * 2) }); });
    src(c, 'Source: The Canadian Encyclopedia'); },
  L3: (c, t, d) => { const p = ease(t, 0, d, 'linear');
    map(c, above([-1500, 1500, 0], M.lerp(52000, 46000, p), .02), {}, { bnd: ease(t, .2, d * .8, 'inOutSine'), bndW: 200 });
    const k = ease(t, .4, .9, 'outBack'); M.chip(c, 'ANNEXATION', CX, WIDE ? 70 : 300, { align: 'center', size: WIDE ? 64 : 76, alpha: Math.min(1, k * 2) });
    M.text(c, 'taking in the land around it', CX, WIDE ? 190 : 450, { size: WIDE ? 50 : 56, weight: 700, align: 'center', alpha: ease(t, 1, 1.5) });
    M.text(c, "today's city limits", WIDE ? W - 60 : CX, WIDE ? H - 130 : 1340, { size: 30, weight: 600, align: WIDE ? 'right' : 'center', color: GOLD, alpha: ease(t, 1.2, 1.6) });
    north(c); src(c, 'Map data © OpenStreetMap contributors · Source: City of Calgary'); },
  L4: (c, t, d) => { const p = ease(t, 0, 2.2, 'outCubic'), dr = t * 60;
    map(c, above([MIS()[0] + dr, MIS()[1], 0], M.lerp(20000, WIDE ? 6500 : 7500, p), .5), { 'MISSION': { p: ease(t, .5, 1), a: .7, label: 'MISSION' } }, { buildings: false });
    stamp(c, '1907', t, .9); M.chip(c, 'ROULEAUVILLE → MISSION', CX, L.stampY + (WIDE ? 90 : 110), { align: 'center', size: L.chip + 4, alpha: ease(t, 1.4, 1.8) });
    M.text(c, 'a village founded by Father Albert Lacombe', CX, L.stampY + (WIDE ? 180 : 210), { size: WIDE ? 40 : 44, weight: 600, align: 'center', maxW: 860, alpha: ease(t, 2, 2.5) });
    north(c); mapCredit(c, 'Source: CREB (2014)'); },
  L5: (c, t, d) => { sqBg(c, t); const k = ease(t, .2, 1.4, 'outBack');
    square(c, 40, k, GOLD); sqLabel(c, '~40 sq mi', 'MID-1950s', WIDE ? 900 : CX, WIDE ? 420 : 330, { align: WIDE ? 'left' : 'center' });
    M.text(c, 'squares drawn to scale (area)', WIDE ? 900 : CX, WIDE ? 640 : 590, { size: 28, weight: 500, align: WIDE ? 'left' : 'center', color: '#9fb0c8', alpha: ease(t, 1, 1.5) });
    src(c, 'Source: Foran, Expansive Discourses (AU Press)'); },
  L6: (c, t, d) => { sqBg(c, t); square(c, 40, 1, GOLD); const k = ease(t, d * .25, d * .85, 'inOutCubic');
    square(c, 151, k, '#ffffff', { fillA: .1 });
    const yr = Math.round(M.lerp(1956, 1961, k)); M.text(c, String(yr), WIDE ? 900 : CX, WIDE ? 200 : 240, { size: WIDE ? 150 : 170, weight: 800, align: WIDE ? 'left' : 'center', color: k >= 1 ? GOLD : '#fff' });
    if (k > .98) M.text(c, '~151 sq mi', WIDE ? 900 : CX, WIDE ? 430 : 415, { size: WIDE ? 100 : 104, weight: 800, align: WIDE ? 'left' : 'center' });
    else M.text(c, 'a series of annexations', WIDE ? 900 : CX, WIDE ? 430 : 425, { size: WIDE ? 54 : 58, weight: 700, align: WIDE ? 'left' : 'center', alpha: ease(t, .2, .6) });
    M.text(c, '~40', SQX + side(40) / 2, SQY - side(40) / 2 - 30, { size: 48, weight: 800, align: 'center', color: GOLD });
    src(c, 'Source: Foran, Expansive Discourses (AU Press)'); },
  L7: (c, t, d) => { sqBg(c, t); square(c, 151, 1, '#ffffff', { fillA: .1 });
    const k = ease(t, .1, .9, 'outCubic'), s70 = side(70), x = M.lerp(WIDE ? 1500 : SQX + SQ, SQX + side(151) - s70, k);
    c.save(); c.fillStyle = ORANGE; c.globalAlpha = .45; c.fillRect(x, SQY - s70, s70, s70); c.globalAlpha = 1; c.lineWidth = 6; c.strokeStyle = ORANGE; c.strokeRect(x, SQY - s70, s70, s70); c.restore();
    M.text(c, '70+', x + s70 / 2, SQY - s70 / 2 - 40, { size: 64, weight: 800, align: 'center' });
    M.chip(c, '70+ SQ MI ADDED · 1961', WIDE ? 900 : CX, WIDE ? 200 : 260, { align: WIDE ? 'left' : 'center', size: L.chip + 6, bg: ORANGE, color: NAVY, alpha: ease(t, .3, .7) });
    stamp(c, 'ALMOST DOUBLED', t, d * .5, WIDE ? 1280 : CX, WIDE ? 420 : 440, WIDE ? 84 : 96, GOLD);
    src(c, 'Source: Foran, Expansive Discourses (AU Press)'); },
  L8: (c, t, d) => { const p = ease(t, 0, d, 'linear');
    map(c, above([FL()[0] - (WIDE ? 2500 : 0), FL()[1] - (WIDE ? 0 : 2600), 0], M.lerp(17000, 14000, p), .45), { 'FOREST LAWN': { col: ORANGE, a: .65, label: 'FOREST LAWN', p: ease(t, 0, .4) } });
    M.chip(c, 'NOT EVERYONE WANTED IN', CX, WIDE ? 60 : 300, { align: 'center', size: L.chip + 6, bg: '#ffffff', color: NAVY, alpha: ease(t, .1, .4) });
    // result card: Forest Lawn's 1956 race for mayor, the anti-annexation candidate's share on a 0-100 % track
    const cx = WIDE ? 1080 : 90, cy = WIDE ? 560 : 760, cw = WIDE ? 760 : 840, ch = WIDE ? 380 : 430, k = ease(t, d * .3, d * .3 + .4, 'outCubic');
    if (k > 0) { c.save(); c.globalAlpha = k; M.rr(c, cx, cy + (1 - k) * 40, cw, ch, 22); c.fillStyle = 'rgba(247,244,236,.97)'; c.fill(); c.restore();
      M.text(c, "FOREST LAWN · 1956 RACE FOR MAYOR", cx + 40, cy + 34, { size: WIDE ? 32 : 34, weight: 800, color: '#1b2533', shadow: false, alpha: k, maxW: cw - 80 });
      M.text(c, 'Candidate against annexation', cx + 40, cy + (WIDE ? 100 : 110), { size: WIDE ? 34 : 38, weight: 600, color: '#3a4656', shadow: false, alpha: k });
      const bp = ease(t, d * .45, d * .8, 'outCubic'), bx = cx + 40, by = cy + (WIDE ? 170 : 190), bw = cw - 80, bh = WIDE ? 70 : 80;
      c.save(); c.globalAlpha = k; M.rr(c, bx, by, bw, bh, 12); c.fillStyle = '#d9d3c4'; c.fill(); if (bp > 0) { M.rr(c, bx, by, bw * .81 * bp, bh, 12); c.fillStyle = ORANGE; c.fill(); } c.restore();
      M.counter(c, 81, bp, Math.max(bx + (WIDE ? 200 : 220), bx + bw * .81 * bp), by + bh + 16, { size: WIDE ? 110 : 120, suffix: '%', color: '#1b2533', shadow: false, align: 'right' });
      M.text(c, '0%', bx, by + bh + 8, { size: 24, weight: 600, color: '#5b6573', shadow: false, alpha: k }); M.text(c, '100%', bx + bw, by + bh + 8, { size: 24, weight: 600, color: '#5b6573', align: 'right', shadow: false, alpha: k }); }
    north(c); mapCredit(c, 'Source: Foran, Expansive Discourses (AU Press)'); },
  L9: (c, t, d) => { const k = ease(t, .4, 1.1);
    map(c, above([FL()[0], FL()[1], 0], M.lerp(15000, 12000, ease(t, 0, d)), .45), { 'FOREST LAWN': { col: k > .5 ? GOLD : ORANGE, a: .7, label: 'FOREST LAWN' } });
    stamp(c, '1961', t, .35); M.chip(c, 'PART OF CALGARY', CX, L.stampY + (WIDE ? 90 : 110), { align: 'center', size: L.chip + 6, alpha: ease(t, .7, 1.1) });
    north(c); mapCredit(c, 'Sources: Wikipedia (Forest Lawn) · Foran (AU Press) · CREB'); },
  L10: (c, t, d) => { const p = ease(t, 0, d, 'inOutSine'), from = [(FL()[0] + MON()[0]) / 2, (FL()[1] + MON()[1]) / 2, 0], to = MON();
    map(c, above([M.lerp(from[0], to[0], p), M.lerp(from[1], to[1], p), 0], M.lerp(22000, 12000, p), .5), { 'FOREST LAWN': { a: .45 }, 'MONTGOMERY': { p: ease(t, d * .3, d * .6), a: .7, label: 'MONTGOMERY' } });
    stamp(c, '1963', t, d * .35); north(c); mapCredit(c, 'Sources: Foran, Expansive Discourses (AU Press) · CREB'); },
  L11: (c, t, d) => { map(c, above([BOW()[0] + 1500, BOW()[1] - (WIDE ? 0 : 1600), 0], M.lerp(15000, 13000, ease(t, 0, d)), .45), { 'BOWNESS': { p: ease(t, .2, .6), a: .7, label: 'BOWNESS' }, 'MONTGOMERY': { a: .4 } });
    voteBars(c, t, d * .38, d * .85); north(c); mapCredit(c, 'Source: Foran, Expansive Discourses (AU Press)'); },
  L12: (c, t, d) => { const p = ease(t, 0, d * .8, 'inOutCubic'), all = CUT !== 'short';
    const hi = { 'BOWNESS': { a: .75, label: 'BOWNESS' }, 'FOREST LAWN': { a: .75, label: 'FOREST LAWN' } }; if (all) { hi['MONTGOMERY'] = { a: .75, label: 'MONTGOMERY', ly: -10, dx: WIDE ? 150 : 120, size: WIDE ? 34 : 40 }; hi['MISSION'] = { a: .75, label: 'MISSION', ly: -30, size: WIDE ? 36 : 42 }; }
    map(c, above([-1500, 800, 0], M.lerp(24000, WIDE ? 40000 : 50000, p), .15), hi, { bnd: 1, bndA: .35, bndW: 120 });
    inset154(c, t, d * .35);
    M.text(c, "map: today's city limits", WIDE ? W - 60 : CX, WIDE ? H - 130 : 1340, { size: 28, weight: 600, align: WIDE ? 'right' : 'center', color: '#c9d3e0', alpha: ease(t, .5, 1) });
    north(c); mapCredit(c, 'Source: Foran, Expansive Discourses (AU Press)'); },
  L13: (c, t, d) => { const pulse = .55 + .45 * Math.sin(t * 4);
    map(c, cam(M.moves.orbit([-1500, 800, 0], 30000, 34000, 260, 25, ease(t, 0, d, 'linear'))), { 'BOWNESS': { a: .5 }, 'FOREST LAWN': { a: .5 }, 'MONTGOMERY': { a: .5 }, 'MISSION': { a: .5 } }, { bnd: 1, bndA: pulse, bndW: 260 });
    stamp(c, '2007', t, d * .3); M.chip(c, '~25,000 ACRES FROM ROCKY VIEW', CX, L.stampY + (WIDE ? 90 : 110), { align: 'center', size: L.chip + 4, alpha: ease(t, d * .45, d * .45 + .4) });
    M.text(c, "today's city limits", WIDE ? W - 60 : CX, WIDE ? H - 130 : 1340, { size: 28, weight: 600, align: WIDE ? 'right' : 'center', color: GOLD });
    north(c); src(c, 'Map data © OpenStreetMap contributors · Source: City of Calgary'); },
  L14: (c, t, d) => { const p = ease(t, 0, d, 'inOutSine');
    if (p < .55) { const w = M.world({ sky: 'dusk', fog: { near: 2500, far: 20000, max: .6 } });
      M.geo.addBase(w, { buildings: true, colors: { land: '#2a2a33', park: '#263a33', water: '#2f557a', building: '#5a5f73', road: '#4a4655', motorway: '#6a5f66' }, windows: '#ffd27a', windowAlpha: .7 });
      w.render(c, cam({ pos: [-3200, -4200, M.lerp(500, 4000, p / .55)], look: [0, 0, 120] })); }
    else map(c, above([-1500, 800, 0], M.lerp(30000, 52000, (p - .55) / .45), .25), { 'BOWNESS': { a: .7 }, 'FOREST LAWN': { a: .7 }, 'MONTGOMERY': { a: .7 }, 'MISSION': { a: .7 } }, { bnd: 1, bndA: .7, bndW: 160 });
    if (p > .5 && p < .6) { c.save(); c.globalAlpha = 1 - Math.abs(p - .55) / .05; c.fillStyle = '#0b1f3a'; c.fillRect(0, 0, W, H); c.restore(); }
    band(c, WIDE ? 30 : 230, WIDE ? 330 : 700, .55); M.kinetic(c, 'Redrawn again and again', Math.max(0, t - .6), CX, WIDE ? 90 : 330, { size: WIDE ? 110 : 120, maxW: WIDE ? 1500 : 860, highlight: ['again'] });
    if (p > .55) mapCredit(c); },
  L15: (c, t, d) => { map(c, above([-1500, 800, 0], 52000, .25), { 'BOWNESS': { a: .5 }, 'FOREST LAWN': { a: .5 } }, { bnd: 1, bndA: .5, bndW: 160 });
    c.fillStyle = 'rgba(7,13,24,.82)'; c.fillRect(0, 0, W, H);
    M.closer(c, 'Out or up?', M.seg(t, 0, d, 'linear') * 1.0 + .3, W, H, { highlight: ['out', 'up?'] });
    M.text(c, 'Should Calgary keep growing out, or build up?', CX, WIDE ? H * .3 - 80 : 470, { size: WIDE ? 44 : 50, weight: 700, align: 'center', maxW: WIDE ? 1400 : 840, alpha: ease(t, 0, .4) }); },
  Q: (c, t, d) => { const p = ease(t, 0, d, 'inOutSine');
    map(c, above([-1500, 800, 0], M.lerp(50000, 56000, p), .25), { 'BOWNESS': { a: .6 }, 'FOREST LAWN': { a: .6 }, 'MONTGOMERY': { a: CUT === 'short' ? 0 : .6 }, 'MISSION': { a: CUT === 'short' ? 0 : .6 } }, { bnd: 1, bndA: .6 + .3 * Math.sin(t * 3), bndW: 200 });
    band(c, WIDE ? 30 : 230, WIDE ? 420 : 820, .6); M.kinetic(c, 'Keep growing out, or build up?', t, CX, WIDE ? 110 : 360, { size: WIDE ? 110 : 120, maxW: WIDE ? 1500 : 860, highlight: ['out,', 'up?'], every: .14 });
    mapCredit(c); },
  C: (c, t, d) => { map(c, above([-1500, 800, 0], 56000, .25), { 'BOWNESS': { a: .6 }, 'FOREST LAWN': { a: .6 } }, { bnd: 1, bndA: .6, bndW: 200 }); c.fillStyle = 'rgba(7,13,24,.93)'; c.fillRect(0, 0, W, H);
    M.closer(c, 'Out or up?', M.seg(t, 0, d, 'linear') + .3, W, H, { highlight: ['out', 'up?'] }); },
  T0: (c, t, d) => D.L0(c, t, d),
  T1: (c, t, d) => { const p = ease(t, 0, d * .5, 'inOutCubic'), mid = [(BOW()[0] + FL()[0]) / 2, (BOW()[1] + FL()[1]) / 2, 0];
    map(c, above(mid, M.lerp(30000, 46000, p), .3), { 'BOWNESS': { a: .75, label: 'BOWNESS', p: ease(t, 0, .4) }, 'FOREST LAWN': { a: .75, label: 'FOREST LAWN', p: ease(t, .3, .7) } }, { bnd: 1, bndA: .4, bndW: 120 });
    stamp(c, '1961 · 1964', t, .3, CX, L.stampY, 96); M.chip(c, 'BOTH BECAME PART OF CALGARY', CX, L.stampY + 110, { align: 'center', size: L.chip, alpha: ease(t, .7, 1.1) });
    if (t > d * .3 && t < d * .64) voteBars(c, t, d * .3, d * .58);
    if (t > d * .64) inset154(c, t, d * .64, [CX - 60, 600]);
    north(c); mapCredit(c, 'Sources: Foran (AU Press) · Wikipedia (Forest Lawn)'); },
  T2: (c, t, d) => { navyBg(c); const a = 1 - M.seg(t, 1.5, 1.8);
    if (a > 0) { M.text(c, '▶ FULL VIDEO', CX, 600, { size: 112, weight: 800, align: 'center', alpha: a * M.seg(t, 0, .25) });
      M.text(c, 'on our Facebook page and YouTube', CX, 760, { size: 54, weight: 700, align: 'center', color: GOLD, maxW: 860, alpha: a * M.seg(t, .2, .45) });
      M.text(c, 'calgaryinsight.ca', CX, 1000, { size: 40, weight: 600, align: 'center', alpha: a * M.seg(t, .3, .55) }); }
    if (t > 1.6) M.closer(c, 'Out or up?', M.seg(t, 1.6, d, 'linear') + .3, W, H, { highlight: ['out', 'up?'] }); },
};
// Bowness vote, October 1963: YES 1,003 / NO 397, bars from zero on the same scale
function voteBars(c, t, t0, t1) {
  const k = ease(t, t0, t0 + .35, 'outCubic'); if (k <= 0) return; const bp = ease(t, t0 + .2, t1, 'outCubic');
  const x = WIDE ? 1060 : 90, y = WIDE ? 520 : 740, w = WIDE ? 780 : 840, h = WIDE ? 420 : 470, bw = w - 330;
  c.save(); c.globalAlpha = k; M.rr(c, x, y, w, h, 22); c.fillStyle = 'rgba(7,13,24,.88)'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.25)'; c.stroke(); c.restore();
  M.chip(c, 'BOWNESS VOTE ON ANNEXATION · OCT 1963', x + 30, y + 26, { size: WIDE ? 28 : 30, alpha: k });
  [['FOR', 1003, GOLD], ['AGAINST', 397, '#8a99ad']].forEach(([lab, v, col], i) => { const by = y + (WIDE ? 140 : 160) + i * (WIDE ? 130 : 150), bh = WIDE ? 80 : 90;
    M.text(c, lab, x + 30, by + bh / 2, { size: WIDE ? 36 : 40, weight: 800, base: 'middle', alpha: k, color: col });
    c.save(); c.globalAlpha = k; c.fillStyle = col; c.fillRect(x + 220, by, (bw - 50) * (v / 1003) * bp, bh); c.restore();
    M.counter(c, v, bp, x + 220 + (bw - 50) * (v / 1003) * Math.max(bp, .25) + (WIDE ? 70 : 80), by + bh / 2 - (WIDE ? 34 : 38), { size: WIDE ? 64 : 72, color: '#fff', align: 'center' }); });
}
function inset154(c, t, t0, pos) { const k = ease(t, t0, t0 + .5, 'outBack'); if (k <= 0) return; const s = WIDE ? 230 : 240, x = pos ? pos[0] : (WIDE ? 1560 : 660), y = pos ? pos[1] : 300;
  c.save(); c.globalAlpha = Math.min(1, k * 1.5); M.rr(c, x - 30, y - 30, s + 60, s + 200, 18); c.fillStyle = 'rgba(7,13,24,.88)'; c.fill();
  const s40 = s * Math.sqrt(40 / 154); c.fillStyle = 'rgba(255,200,80,.25)'; c.fillRect(x, y, s * k, s * k); c.lineWidth = 5; c.strokeStyle = '#fff'; c.strokeRect(x, y, s * k, s * k);
  c.fillStyle = GOLD; c.fillRect(x, y + s - s40, s40, s40); c.restore();
  M.text(c, '~154 sq mi', x + s / 2, y + s + 20, { size: WIDE ? 52 : 58, weight: 800, align: 'center', alpha: Math.min(1, k * 1.5) });
  M.text(c, '1964 (gold: ~40 in mid-1950s)', x + s / 2, y + s + (WIDE ? 84 : 92), { size: 24, weight: 600, align: 'center', color: '#c9d3e0', alpha: Math.min(1, k * 1.5) }); }

const TRANS = { L0: { kind: 'match', dur: .45 }, L1: { kind: 'dissolve', dur: .5 }, L2: { kind: 'dissolve', dur: .5 }, L3: { kind: 'push', dur: .4 }, L4: { kind: 'zoom', dur: .45 },
  L5: { kind: 'match', dur: .4 }, L6: { kind: 'flash', dur: .3 }, L7: { kind: 'dissolve', dur: .5 }, L8: { kind: 'push', dur: .4 }, L9: { kind: 'push', dur: .4 },
  L10: { kind: 'whip', dur: .35 }, L11: { kind: 'match', dur: .45 }, L12: { kind: 'dissolve', dur: .5 }, L13: { kind: 'dissolve', dur: .5 }, L14: { kind: 'dissolve', dur: .5 }, Q: { kind: 'dissolve', dur: .4 },
  T0: { kind: 'match', dur: .45 }, T1: { kind: 'dissolve', dur: .45 } };
const TR = (id, i) => { const nx = ORDER[i + 1]; if (!nx) return undefined; if (CUT === 'short' && id === 'L3') return { kind: 'zoom', dur: .45 }; if (CUT === 'short' && id === 'L6') return { kind: 'dissolve', dur: .5 }; return TRANS[id]; };

// Calgary Insight ORIGINS header (from 3 s; never on the closing frame)
function originsHeader(c) { if (!window.LOGO) return; c.save();
  if (!WIDE) { const s = 70; c.font = M.font(40, 700); const a = c.measureText('Calgary Insight ').width; c.font = M.font(40, 800); const b = c.measureText('ORIGINS').width; const x = CX - (s + 18 + a + b) / 2;
    c.drawImage(window.LOGO, x, 140, s, s); M.text(c, 'Calgary Insight', x + s + 18, 140 + s / 2, { size: 40, base: 'middle', weight: 700, shadow: 8 }); M.text(c, 'ORIGINS', x + s + 18 + a, 140 + s / 2, { size: 40, base: 'middle', weight: 800, color: ORANGE, shadow: 8 }); }
  else { c.drawImage(window.LOGO, 48, 40, 60, 60); c.font = M.font(30, 700); const a = c.measureText('Calgary Insight ').width; M.text(c, 'Calgary Insight', 124, 70, { size: 30, base: 'middle', weight: 700, shadow: 8 }); M.text(c, 'ORIGINS', 124 + a, 70, { size: 30, base: 'middle', weight: 800, color: ORANGE, shadow: 8 }); }
  c.restore(); }
function thumbBrand(c) { if (!window.LOGO) return; const s = WIDE ? 64 : 84, x = WIDE ? 40 : 60, y = WIDE ? H - s - 30 : 1490; c.drawImage(window.LOGO, x, y, s, s);
  c.font = M.font(WIDE ? 32 : 40, 700); const a = c.measureText('Calgary Insight ').width; M.text(c, 'Calgary Insight', x + s + 16, y + s / 2, { size: WIDE ? 32 : 40, base: 'middle', weight: 700 }); M.text(c, 'ORIGINS', x + s + 16 + a, y + s / 2, { size: WIDE ? 32 : 40, base: 'middle', weight: 800, color: ORANGE }); }

// captions: the audited line, word for word, in short chunks timed by word share
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

const CUESFN = () => { const s = i => sc[i].sceneStart, cues = [{ t: 0, sfx: 'impact', gain: -5 }, { t: .1, sfx: 'whoosh', gain: -12 }, { t: .3, sfx: 'pop', gain: -12 }];
  ORDER.forEach((id, i) => { const d = sc[i].sceneDur, at = (x, sfx, g, o = {}) => cues.push(Object.assign({ t: s(i) + x, sfx, gain: g }, o));
    if (i > 0) { const k = TR(ORDER[i - 1], i - 1) && TR(ORDER[i - 1], i - 1).kind; cues.push({ t: Math.max(0, s(i) - .2), sfx: k === 'flash' ? 'impact' : (k === 'dissolve' || k === 'match' ? 'whoosh_rev' : 'whoosh'), gain: k === 'dissolve' ? -16 : -11 }); }
    if (id === 'L0' || id === 'T0') { at(d * .5, 'whoosh', -10); at(d * .5 + .35, 'pop', -11); }
    if (id === 'L1') { at(.25, 'pop', -13); at(.45, 'pop', -13); }
    if (id === 'L2') { at(.5, 'pop', -12); at(d * .55, 'stamp', -9); at(0, 'city', -24, { dur: d }); }
    if (id === 'L3') { at(.3, 'riser', -17, { dur: d * .6 }); at(.5, 'ping', -12); }
    if (id === 'L4') { at(.9, 'stamp', -7); at(1.4, 'pop', -12); }
    if (id === 'L5') { at(.3, 'pop', -12); at(1.2, 'ping', -13); }
    if (id === 'L6') { at(d * .25, 'ticks', -15, { dur: d * .6 }); at(d * .85, 'impact', -9); }
    if (id === 'L7') { at(.2, 'whoosh', -12); at(d * .5, 'stamp', -6); }
    if (id === 'L8') { at(.1, 'thud', -12); at(d * .3, 'pop', -12); at(d * .45, 'ticks', -16, { dur: d * .35 }); at(d * .8, 'ping', -12); }
    if (id === 'L9') { at(.35, 'stamp', -6); at(.8, 'pop', -12); }
    if (id === 'L10') { at(d * .35, 'stamp', -7); }
    if (id === 'L11' || id === 'T1') { at(d * .38, 'pop', -12); at(d * .42, 'ticks', -15, { dur: d * .4 }); at(d * .85, 'ping', -11); }
    if (id === 'L12') { at(0, 'riser', -16, { dur: 1.4 }); at(d * .35, 'impact', -10); }
    if (id === 'L13') { at(d * .3, 'stamp', -7); at(d * .45, 'pop', -12); }
    if (id === 'L14') { at(0, 'swell', -17, { dur: d }); }
    if (id === 'T2') { at(.1, 'ping', -12); }
  });
  return cues; };
window.TOTAL = () => S.total;
