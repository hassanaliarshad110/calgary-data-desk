/* 2026-11-27 FLAGSHIP: "Built to Stay Empty: Calgary's Flood Defences Since 2013" (Calgary Insight ORIGINS).
 * Lead identity Storyteller (night map dive onto the dry basin, rain over the real city, swollen rivers, 3D downtown with the real Saddledome).
 * Borrowed: Data Explainer bars (L3), counters (L4, L6, L12, L13), pool grid (L12); Civic Analyst cutaways (L8 dam gates, L11 how the dry reservoir works) and evidence chips.
 * One file, three cuts (+ thumbnails with --param thumb=1): --param cut=short|wide|teaser
 * Every number, date, name and label on screen maps to the audited claims table in packages/2026-11-27-FLAGSHIP-built-to-stay-empty.md.
 * SR1 basin, barriers and Ghost Reservoir positions are approximate/schematic and labelled; the dam, seats and reservoir cutaways are illustrations. */
const PR = window.PARAMS || {}, CUT = PR.cut || 'short', THUMB = !!PR.thumb;
const WIDE = CUT === 'wide';
const W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920;
const CX = WIDE ? W / 2 : (W - 120) / 2 + 30;
const L = WIDE ? { hookY: 110, hook: 120, stampY: 170, chip: 44, src: [48, H - 40], fov: 46 }
               : { hookY: 330, hook: 132, stampY: 380, chip: 50, src: [60, 1462], fov: 62 };

// measured Kokoro line durations, index = line order in probe/tts_lines.json: 0-15 = L0-L15, 16 = Q, 17 = C, 18 = T1, 19 = T2
const VD = PR.vd ? PR.vd.split(',').map(Number) : [3.4, 3.0, 5.6, 5.4, 4.6, 6.2, 6.6, 2.6, 6.0, 7.6, 5.6, 8.4, 6.6, 9.0, 7.6, 3.4, 2.6, 2.7, 11.0, 6.0];
const LINES = {
 L0: "West of Calgary, there's a reservoir that's meant to stay empty.",
 L1: 'To understand why, go back to June twenty thirteen.',
 L2: "Heavy rain fell on melting snow in the Rocky Mountains, and both of Calgary's rivers rose.",
 L3: 'The Bow River peaked at eight times its regular flow. The Elbow, at twelve times.',
 L4: 'About eighty thousand people were evacuated, from twenty-six communities.',
 L5: 'Downtown was inaccessible for days. At the Saddledome, at least the first ten rows were underwater.',
 L6: "One Calgarian lost their life. Across Alberta, the flood's impact was assessed at about five billion dollars.",
 L7: 'So Calgary and the province started building.',
 L8: "At the Glenmore Dam, new steel gates, two and a half metres high, doubled the reservoir's storage.",
 L9: 'Along the Bow, a permanent flood barrier was finished downtown. In September twenty twenty-six, another was completed for Sunnyside and Hillhurst.',
 L10: 'And about fifteen kilometres west of the city, Alberta built the Springbank Off-stream Reservoir.',
 L11: "Most of the time, it's dry land. In a big flood, a channel diverts water from the Elbow River, stores it, and releases it back when it's safe.",
 L12: "It can store seventy point two million cubic metres. That's about twenty-eight thousand Olympic swimming pools.",
 L13: "The City says Elbow River communities are now protected from a flood the size of twenty thirteen, and that Calgary's flood risk is down by about seventy per cent.",
 L14: 'The Bow is a different story. Its upstream reservoir option, a relocated Ghost Dam, is still in engineering and regulatory approvals.',
 L15: 'Twenty thirteen changed how Calgary lives with its rivers.',
 Q: 'Do you feel safer from the next big flood?',
 C: 'Yes or no? Drop your thoughts below.',
 T1: "In June twenty thirteen, about eighty thousand people in Calgary were evacuated. Since then, Alberta built this dry reservoir. Together with the Glenmore Reservoir, it's designed to hold back a flood that size on the Elbow.",
 T2: 'Full video on our page. Do you feel safer from the next big flood? Drop your thoughts below.',
};
const IDX = { T0: 0, Q: 16, C: 17, T1: 18, T2: 19 };
const DUR = id => VD[IDX[id] ?? +id.slice(1)];
const ORDER = { wide: ['L0','L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11','L12','L13','L14','L15','Q','C'],
                short: ['L0','L1','L2','L3','L4','L5','L10','L11','L12','L13','L14','Q','C'],
                teaser: ['T0','T1','T2'] }[CUT];
const TXT = id => LINES[id === 'T0' ? 'L0' : id];
// a 0.8 s breath before L6 (the cost) and L10 (the reveal)
const S = M.script(ORDER.map((id, i) => ({ text: TXT(id), dur: DUR(id), gapAfter: id === 'Q' ? .25 : (CUT === 'teaser' ? ({ T0: .8, T1: .7 })[id] : (['L6', 'L10'].includes(ORDER[i + 1]) ? .8 : undefined)) })),
                   { lead: .3, gap: CUT === 'teaser' ? .35 : .4, tail: CUT === 'teaser' ? 1.4 : 1.3 });
const sc = S.scenes;

// ---------- palette and places (continuity bible) ----------
const GOLD = M.house.gold, ORANGE = '#f7931e', NAVY = '#0b1f3a', INK = '#070d18', RIVER = '#5fb3ff', FLOOD = '#3f8fd6';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const COLS = { land: '#16263f', park: '#1b3531', water: '#2c5378', building: '#3a4a60', road: '#2a3a52', motorway: '#46566e', community: '#ffffff' };
const SR0 = M.geo.xy(51.03, -114.39);           // SR1 off-stream storage area (approximate location; kept north of the Elbow below)
const GH = M.geo.xy(51.215, -114.77);           // Ghost Reservoir on the Bow (approximate location)
const GLEN = () => M.geo.lm('Glenmore Reservoir') || [-3500, -7500, 0];
const SAD = () => M.geo.lm('Scotiabank Saddledome') || [1100, -1200, 0];
const BND = () => { const b = window.GEO.boundary[0]; let best = b[0]; (Array.isArray(b[0][0]) ? b : [b]).forEach(r => { if (r.length > best.length) best = r; }); return Array.isArray(best[0]) ? best : b; };
const RV = name => (M.geo.river(name) || { lines: [] }).lines;
// nearest Elbow River point to the SR1 basin (start of the schematic diversion channel)
let _elb = null; const ELB = () => { if (_elb) return _elb; let best = null, bd = 1e12; RV('Elbow River').forEach(l => l.forEach(p => { const d = (p[0] - SR[0]) ** 2 + (p[1] - SR[1]) ** 2; if (d < bd) { bd = d; best = p; } })); _elb = best ? [best[0], best[1], 0] : [SR[0] + 1500, SR[1] - 3500, 0]; return _elb; };
// a point on a river near a given x (for labels and schematic barriers)
const onRiver = (name, x, side = 0) => { let best = null, bd = 1e12; RV(name).forEach(l => l.forEach(p => { const d = Math.abs(p[0] - x); if (d < bd) { bd = d; best = p; } })); return best ? [best[0], best[1] + side, 0] : [x, side, 0]; };
const riverSpan = (name, x0, x1, side) => { const pts = []; RV(name).forEach(l => l.forEach(p => { if (p[0] >= x0 && p[0] <= x1) pts.push([p[0], p[1] + side]); })); pts.sort((a, b) => a[0] - b[0]); return pts; };
const SR = (() => { let best = null, bd = 1e12; RV('Elbow River').forEach(l => l.forEach(p => { const d = Math.abs(p[0] - SR0[0]); if (d < bd) { bd = d; best = p; } })); return best ? [SR0[0], Math.max(SR0[1], best[1] + 3200), 0] : SR0; })();

// ---------- helpers ----------
const cam = o => M.camera(Object.assign({ fov: L.fov }, o), W, H);
const above = (p, h, back = .35, o = {}) => cam({ pos: [p[0] + (o.dx || 0), p[1] - h * back, h], look: [p[0], p[1] + (o.ahead || 0), 0] });
const ease = (t, a, b, e = 'inOutCubic') => M.seg(t, a, b, e);
const band = (c, y0, y1, a = .7) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const src = (c, s, dy = 0) => M.source(c, s, L.src[0], L.src[1] - dy, { size: 20, maxW: WIDE ? 1500 : 860 });
const navyBg = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, NAVY); g.addColorStop(1, INK); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const gridBg = (c, t) => { navyBg(c); c.save(); c.globalAlpha = .07; c.strokeStyle = '#9fb7d6'; c.lineWidth = 1; const g = 60, off = (t * 8) % g; for (let x = -g + off; x < W; x += g) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = -g + off; y < H; y += g) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } c.restore(); };
const north = c => { const nx = WIDE ? W - 90 : W - 190, ny = WIDE ? 170 : 1190; c.save(); c.globalAlpha = .9; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(nx, ny - 34); c.lineTo(nx + 15, ny + 8); c.lineTo(nx - 15, ny + 8); c.closePath(); c.fill(); M.text(c, 'N', nx, ny + 14, { size: 28, weight: 800, align: 'center' }); c.restore(); };
const chip = (c, s, y, k, o = {}) => { if (k > 0) M.chip(c, s, o.x ?? CX, y, Object.assign({ align: 'center', size: L.chip + 4, alpha: Math.min(1, k) }, o)); };
const stamp = (c, s, t, t0, x = CX, y = L.stampY, size, col = GOLD) => { const k = M.seg(t, t0, t0 + .35, 'outBack'); if (k <= 0) return; size = size || (WIDE ? 96 : 110);
  c.save(); c.translate(x, y); c.rotate(-.04); const s2 = M.lerp(1.8, 1, Math.min(1, k)); c.scale(s2, s2); c.globalAlpha = Math.min(1, k * 1.5);
  c.font = M.font(size, 800); const tw = c.measureText(s).width; M.rr(c, -tw / 2 - 34, -size * .62, tw + 68, size * 1.24, 22); c.fillStyle = 'rgba(7,13,24,.86)'; c.fill(); c.lineWidth = 8; c.strokeStyle = col; c.stroke();
  M.text(c, s, 0, -size * .52, { size, weight: 800, align: 'center', color: '#fff' }); c.restore(); };
const note = (c, s) => M.text(c, s, WIDE ? W - 60 : CX, WIDE ? H - 110 : 1380, { size: 26, weight: 600, align: WIDE ? 'right' : 'center', color: '#c9d3e0', alpha: .9 });
function headline(c, t, txt, hl, o = {}) { band(c, WIDE ? 10 : 200, WIDE ? 380 : 760, .62);
  M.kinetic(c, txt, THUMB ? 9 : t, CX, o.y ?? L.hookY, { size: (o.size || L.hook), maxW: WIDE ? 1600 : 860, t0: -0.12, every: .09, highlight: hl }); }
function card(c, t, t0, title, lines, o = {}) { const k = ease(t, t0, t0 + .45, 'outCubic'); if (k <= 0) return;
  const cw = o.w || (WIDE ? 900 : 880), lh = WIDE ? 62 : 70, ts = o.ts || (WIDE ? 60 : 64), ch = ts + (WIDE ? 90 : 106) + lines.length * lh, x = o.x ?? (CX - cw / 2), y = (o.y ?? (WIDE ? 300 : 560)) + (1 - k) * 40;
  c.save(); c.globalAlpha = k; M.rr(c, x, y, cw, ch, 24); c.fillStyle = 'rgba(247,244,236,.97)'; c.fill(); c.fillStyle = o.col || ORANGE; M.rr(c, x, y, 18, ch, 9); c.fill(); c.restore();
  M.text(c, title, x + 50, y + 34, { size: ts, weight: 800, color: '#1b2533', shadow: false, alpha: k, maxW: cw - 90 });
  lines.forEach((ln, i) => M.text(c, ln, x + 50, y + ts + (WIDE ? 65 : 76) + i * lh, { size: WIDE ? 44 : 48, weight: 600, color: '#3a4656', shadow: false, alpha: ease(t, t0 + .3 + i * .25, t0 + .6 + i * .25), maxW: cw - 90 })); }
const pin = (w, p, k, label, sub, col = ORANGE) => { if (k <= 0) return; w.at(p, (ctx, sp) => { const kk = M.ease.outBack(Math.min(1, k)), r = (WIDE ? 24 : 30) * kk; ctx.save();
    const gl = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, r * 4); gl.addColorStop(0, 'rgba(247,147,30,.55)'); gl.addColorStop(1, 'rgba(247,147,30,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(sp.x, sp.y, r * 4, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sp.x, sp.y, r, 0, 7); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = col; ctx.stroke(); ctx.restore();
    if (label) label.split('\n').forEach((ln, i) => M.text(ctx, ln, sp.x, sp.y + (WIDE ? 44 : 50) + i * (WIDE ? 54 : 60), { size: WIDE ? 46 : 52, weight: 800, align: 'center', stroke: 7, strokeColor: '#06101f', alpha: Math.min(1, k * 2), shadow: false }));
    if (sub) M.text(ctx, sub, sp.x, sp.y + (WIDE ? 44 : 50) + (label ? label.split('\n').length : 0) * (WIDE ? 54 : 60) + 6, { size: WIDE ? 26 : 30, weight: 600, align: 'center', color: '#c9d3e0', alpha: Math.min(1, k * 2), shadow: false }); }); };
const ell = (p, rx, ry, n = 48, f = 1) => { const pts = []; for (let i = 0; i <= n * f; i++) { const a = i / n * Math.PI * 2; pts.push([p[0] + Math.cos(a) * rx * (1 + .12 * Math.sin(a * 3)), p[1] + Math.sin(a) * ry]); } return pts; };

// ---------- the night map (MAP-A in the continuity bible: north up, gold city limit, Bow + Elbow) ----------
function map(c, cm, o = {}) {
  const w = M.world({ sky: 'night', drawSky: false, fog: { near: 20000, far: 240000, max: .45, color: '#0d1830' } });
  navyBg(c);
  M.geo.addBase(w, { buildings: !!o.buildings, colors: COLS, windows: '#ffd27a', windowAlpha: .55, riverW: 120, lrt: false, communities: false });
  w.line(BND(), { wm: o.bndW || 220, color: GOLD, order: 6, alpha: o.bndA ?? .85, minPx: 2.2 });
  const rv = o.rivers || 0;
  if (rv > 0) ['Bow River', 'Elbow River'].forEach(n => RV(n).forEach(l => w.line(l, { wm: M.lerp(140, o.riverMax || 520, rv), color: RIVER, order: 4, alpha: .55 + .4 * rv, glow: 6 * rv, minPx: 2 })));
  if (o.elbow) RV('Elbow River').forEach(l => w.line(l, { wm: 420, color: '#7fe0a8', order: 5, alpha: .9 * o.elbow, glow: 5, minPx: 2 }));
  if (o.bow) RV('Bow River').forEach(l => w.line(l, { wm: 420, color: RIVER, order: 5, alpha: .9 * o.bow, glow: 5, minPx: 2 }));
  if (o.glen) { const g = GLEN(); w.at(g, (ctx, sp) => { ctx.save(); ctx.globalAlpha = o.glen; ctx.strokeStyle = GOLD; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(sp.x, sp.y, WIDE ? 60 : 70, 0, 7); ctx.stroke(); ctx.restore();
      M.text(ctx, 'GLENMORE RESERVOIR', sp.x, sp.y + (WIDE ? 70 : 82), { size: WIDE ? 40 : 46, weight: 800, align: 'center', stroke: 6, strokeColor: '#06101f', alpha: o.glen, shadow: false }); }); }
  if (o.basin != null) { const k = Math.max(.001, o.basin), outline = ell(SR, 2600, 1700, 48, k);
    if (o.fill) w.area(ell(SR, 2600, 1700), { fill: FLOOD, alpha: .65 * o.fill, order: 3 });
    else w.area(ell(SR, 2600, 1700), { fill: '#6b6a45', alpha: .35 * Math.min(1, o.basin * 1.5), order: 3 });
    if (outline.length > 1) w.line(outline, { wm: 160, color: '#ffffff', order: 7, alpha: .9, minPx: 2.5, dash: [16, 12] });
    if (o.channel) { const e = ELB(), a = [e[0], e[1]], b = [SR[0] + 400, SR[1] - 1650], n = 20, pts = []; for (let i = 0; i <= n * o.channel; i++) pts.push([M.lerp(a[0], b[0], i / n), M.lerp(a[1], b[1], i / n)]); if (pts.length > 1) w.line(pts, { wm: 260, color: o.fill ? RIVER : '#d8d2b0', order: 8, alpha: .95, minPx: 3 }); } }
  if (o.pin) pin(w, SR, o.pin, o.pinLabel ?? 'SPRINGBANK\nOFF-STREAM RESERVOIR', o.pinLabel === '' ? null : 'approximate location');
  if (o.ghost) pin(w, GH, o.ghost, 'GHOST RESERVOIR', 'approximate location', RIVER);
  if (o.barrier) { const k = o.barrier, dt = riverSpan('Bow River', -700, 1500, -140), ss = riverSpan('Bow River', -2700, -250, 150);
    if (dt.length > 1) w.line(dt, { wm: 120, color: GOLD, order: 9, glow: 4, p: k, minPx: 4 });
    if (ss.length > 1 && o.barrier2) w.line(ss, { wm: 90, color: ORANGE, order: 9, glow: 4, p: o.barrier2, minPx: 4 }); }
  if (o.labels) { const bp = onRiver('Bow River', WIDE ? -9000 : -7000), ep = onRiver('Elbow River', -6500);
    w.at(bp, (ctx, sp) => M.text(ctx, 'BOW RIVER', sp.x, sp.y - 70, { size: WIDE ? 46 : 52, weight: 800, align: 'center', color: '#bfe1ff', stroke: 6, strokeColor: '#06101f', alpha: o.labels, shadow: false }));
    w.at(ep, (ctx, sp) => M.text(ctx, 'ELBOW RIVER', sp.x, sp.y + 30, { size: WIDE ? 46 : 52, weight: 800, align: 'center', color: '#bfe1ff', stroke: 6, strokeColor: '#06101f', alpha: o.labels, shadow: false })); }
  if (o.cityLabel) w.at([1500, 7000, 0], (ctx, sp) => M.text(ctx, 'CALGARY', sp.x, sp.y - 20, { size: WIDE ? 54 : 62, weight: 800, align: 'center', color: GOLD, stroke: 7, strokeColor: '#06101f', alpha: o.cityLabel, shadow: false }));
  w.render(c, cm);
  if (o.rain) M.weather(c, 'rain', o.t || 0, W, H, { count: Math.round(260 * o.rain), seed: 3 });
}
const MID = [(SR[0] + 0) / 2, -1500, 0];
const WESTCAM = (h) => WIDE ? above([-12500, -1500, 0], h * .62, .12) : above([-18000, 2500, 0], h, .10);
const CITYCAM = (h, p = [-1500, -1000, 0]) => WIDE ? above(p, h * .7, .14) : above(p, h, .12);
const downtown = (c, t, d, o = {}) => { const p = ease(t, 0, d, 'linear'), w = M.world({ sky: o.sky || 'dusk', fog: { near: 2500, far: 16000, max: .6 } });
  M.geo.addBase(w, { buildings: true, colors: { land: '#2a2a33', park: '#263a33', water: '#2f557a', building: '#5a5f73', road: '#4a4655', motorway: '#6a5f66' }, windows: '#ffd27a', windowAlpha: .75, lrt: false, riverW: o.riverW || 60 });
  if (o.swell) ['Bow River', 'Elbow River'].forEach(n => RV(n).forEach(l => w.line(l, { wm: M.lerp(60, 170, o.swell), color: FLOOD, order: 4, alpha: .85 })));
  if (o.pool) { const s = SAD(); w.area([[s[0] - 520, s[1] - 420], [s[0] + 560, s[1] - 420], [s[0] + 560, s[1] + 480], [s[0] - 520, s[1] + 480]], { fill: FLOOD, alpha: .55 * o.pool, order: 9, z: 2 * o.pool }); }
  if (o.sadLabel) { const s = SAD(); w.at([s[0], s[1], 40], (ctx, sp) => M.text(ctx, 'SADDLEDOME', sp.x, sp.y - 80, { size: WIDE ? 46 : 52, weight: 800, align: 'center', stroke: 6, strokeColor: '#06101f', alpha: o.sadLabel, shadow: false })); }
  w.render(c, cam(M.moves.orbit(o.target || [0, 0, 0], o.r || 2600, o.h || 900, o.a0 ?? 200, o.turn ?? 40, p))); };

// ---------- illustrations ----------
function seats(c, t, d) { gridBg(c, t); const rows = 22, x0 = WIDE ? 380 : 90, x1 = WIDE ? 1540 : 900, yb = WIDE ? 900 : 1300, rh = WIDE ? 26 : 34, step = (x1 - x0) / rows * .55;
  for (let r = 0; r < rows; r++) { const y = yb - r * rh, xs = x0 + r * step * .2; c.fillStyle = r < 10 ? '#5a6b82' : '#3b4a60'; c.fillRect(xs, y - rh + 4, x1 - xs - r * step * .2, rh - 6);
    c.fillStyle = 'rgba(255,255,255,.18)'; for (let s = xs + 10; s < x1 - r * step * .2 - 10; s += WIDE ? 34 : 30) c.fillRect(s, y - rh + 6, WIDE ? 20 : 18, rh * .35); }
  const lvl = ease(t, .2, d * .55, 'outCubic'), wy = yb - 10 * rh * lvl;
  c.save(); c.globalAlpha = .78; c.fillStyle = FLOOD; c.fillRect(0, wy, W, yb - wy + 6); c.restore();
  c.save(); c.strokeStyle = '#bfe1ff'; c.lineWidth = 4; c.beginPath(); for (let x = 0; x <= W; x += 20) c.lineTo(x, wy + Math.sin(x * .03 + t * 3) * 5); c.stroke(); c.restore();
  const k = ease(t, d * .5, d * .5 + .4, 'outBack');
  M.text(c, 'ROW 10', WIDE ? x1 + 30 : x1 - 10, yb - 10 * rh - 10, { size: WIDE ? 44 : 40, weight: 800, align: WIDE ? 'left' : 'right', color: GOLD, alpha: ease(t, d * .45, d * .6) });
  M.text(c, 'ROW 1', WIDE ? x1 + 30 : x1 - 10, yb - rh - 4, { size: WIDE ? 36 : 34, weight: 700, align: WIDE ? 'left' : 'right', color: '#fff', alpha: ease(t, .2, .5) });
  chip(c, 'SADDLEDOME · AT LEAST 10 ROWS UNDERWATER', WIDE ? 220 : 560, k, { bg: '#ffffff', color: NAVY, size: WIDE ? 48 : 40 });
  note(c, 'illustration'); }
function dam(c, t, d) { gridBg(c, t); const gy = WIDE ? 860 : 1220, dx = WIDE ? 1180 : 700, top = WIDE ? 470 : 820, hw = WIDE ? 70 : 60;
  // ground and reservoir bed
  c.fillStyle = '#3b3a2c'; c.beginPath(); c.moveTo(0, gy); c.lineTo(dx - 40, gy); c.lineTo(dx - 40, H); c.lineTo(0, H); c.fill(); c.fillRect(dx, gy + 120, W, H);
  const old = top + (WIDE ? 120 : 110), nw = top - (WIDE ? 70 : 70), k = ease(t, d * .35, d * .75, 'inOutSine'), lv = M.lerp(old, nw, k);
  c.save(); c.globalAlpha = .82; c.fillStyle = FLOOD; c.fillRect(0, lv, dx - hw, gy - lv); c.restore();
  // dam body (trapezoid)
  c.fillStyle = '#9aa3ad'; c.beginPath(); c.moveTo(dx - hw, top); c.lineTo(dx + hw, top); c.lineTo(dx + hw * 3.2, gy + 120); c.lineTo(dx - hw * 1.2, gy + 120); c.closePath(); c.fill();
  // new steel gates on the crest
  const gk = ease(t, .3, d * .35, 'outBack'); if (gk > 0) { c.fillStyle = ORANGE; c.fillRect(dx - hw, top - (WIDE ? 90 : 90) * Math.min(1, gk), hw * 2 * .55, (WIDE ? 90 : 90) * Math.min(1, gk)); }
  c.save(); c.setLineDash([14, 10]); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(40, old); c.lineTo(dx - hw - 10, old); c.stroke(); c.restore();
  M.text(c, 'old level', 50, old + 12, { size: WIDE ? 32 : 34, weight: 600, color: '#dfe7f2' });
  M.text(c, 'GLENMORE DAM', dx + hw * .4, gy + 160, { size: WIDE ? 50 : 52, weight: 800, align: 'center' });
  const lx = WIDE ? 120 : CX, la = WIDE ? 'left' : 'center';
  M.text(c, 'NEW STEEL GATES', lx, WIDE ? 120 : 330, { size: WIDE ? 104 : 104, weight: 800, align: la, color: '#fff', alpha: ease(t, .3, .6), maxW: WIDE ? 1500 : 880 });
  chip(c, '2.5 m HIGH', WIDE ? 250 : 470, ease(t, .6, .9, 'outBack'), Object.assign({ bg: ORANGE, color: NAVY }, WIDE ? { x: lx, align: 'left' } : {}));
  chip(c, 'STORAGE DOUBLED', WIDE ? 340 : 570, ease(t, d * .7, d * .7 + .35, 'outBack'), Object.assign({ bg: GOLD, color: NAVY }, WIDE ? { x: lx, align: 'left' } : {}));
  note(c, 'illustration, not to scale'); src(c, 'Source: City of Calgary, Flood resilience plan'); }
function sr1Works(c, t, d) { gridBg(c, t);
  const ph = t < d * .28 ? 0 : t < d * .5 ? 1 : t < d * .74 ? 2 : 3;   // 0 dry, 1 divert, 2 store, 3 release
  const ry = WIDE ? 830 : 1180, bx = WIDE ? 960 : CX, by = WIDE ? 520 : 820, brx = WIDE ? 420 : 380, bry = WIDE ? 190 : 210;
  // river (bottom), flow animation
  const high = ph === 1 || ph === 2; c.save(); c.lineCap = 'round'; c.strokeStyle = high ? FLOOD : RIVER; c.lineWidth = high ? 70 : 34; c.beginPath(); for (let x = -40; x <= W + 40; x += 20) c.lineTo(x, ry + Math.sin(x * .006) * 30); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 4; c.setLineDash([30, 40]); c.lineDashOffset = -t * 140; c.beginPath(); for (let x = -40; x <= W + 40; x += 20) c.lineTo(x, ry + Math.sin(x * .006) * 30); c.stroke(); c.restore();
  M.text(c, 'ELBOW RIVER', WIDE ? 120 : 80, WIDE ? ry + 60 : ry - 110, { size: WIDE ? 44 : 44, weight: 800, color: '#bfe1ff' });
  // channel
  const cx0 = bx - brx * .9, cy0 = ry + Math.sin((bx - brx * .9) * .006) * 30;
  c.save(); c.strokeStyle = '#8b8462'; c.lineWidth = 40; c.beginPath(); c.moveTo(cx0, cy0 - 20); c.lineTo(bx - brx * .55, by + bry * .7); c.stroke();
  if (ph === 1 || ph === 2) { c.strokeStyle = FLOOD; c.lineWidth = 26; c.beginPath(); c.moveTo(cx0, cy0 - 20); c.lineTo(bx - brx * .55, by + bry * .7); c.stroke(); }
  if (ph === 3) { c.strokeStyle = FLOOD; c.lineWidth = 20; c.beginPath(); c.moveTo(bx + brx * .6, by + bry * .7); c.lineTo(bx + brx * .9, ry - 10); c.stroke(); }
  c.restore();
  // basin
  const fill = ph === 0 ? 0 : ph === 1 ? ease(t, d * .28, d * .5) * .55 : ph === 2 ? M.lerp(.55, 1, ease(t, d * .5, d * .74)) : 1 - ease(t, d * .74, d * .98) * .8;
  c.save(); c.beginPath(); c.ellipse(bx, by, brx, bry, 0, 0, 7); c.fillStyle = '#5c6a3e'; c.fill(); c.clip(); c.fillStyle = FLOOD; c.globalAlpha = .9; c.fillRect(bx - brx, by + bry - 2 * bry * fill, brx * 2, 2 * bry * fill); c.restore();
  c.save(); c.setLineDash([16, 12]); c.lineWidth = 5; c.strokeStyle = '#fff'; c.beginPath(); c.ellipse(bx, by, brx + 10, bry + 10, 0, 0, 7); c.stroke(); c.restore();
  if (ph === 0) { const rnd = M.rng(8); c.strokeStyle = '#b8c27a'; c.lineWidth = 3; for (let i = 0; i < 60; i++) { const a = rnd() * 7, rr = Math.sqrt(rnd()), x = bx + Math.cos(a) * brx * .85 * rr, y = by + Math.sin(a) * bry * .8 * rr; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 3, y - 14 - 4 * Math.sin(t * 2 + i)); c.stroke(); } }
  const steps = ['DRY MOST OF THE TIME', 'DIVERT', 'STORE', 'RELEASE WHEN SAFE'], cols = ['#ffffff', ORANGE, GOLD, RIVER];
  steps.forEach((s, i) => { const on = i === ph, done = i < ph, k = i === 0 ? ease(t, .1, .4, 'outBack') : ease(t, [0, d * .28, d * .5, d * .74][i], [0, d * .28, d * .5, d * .74][i] + .35, 'outBack'); if (k <= 0) return;
    const y = WIDE ? 120 + i * 0 : 300 + i * 0; const x = WIDE ? 340 + i * 420 : CX; if (!WIDE && !on) return;
    M.chip(c, (i ? i + '. ' : '') + s, x, WIDE ? 170 : 330, { align: 'center', size: WIDE ? (on ? 48 : 38) : 58, bg: on ? cols[i] : 'rgba(255,255,255,.25)', color: on ? NAVY : '#fff', alpha: Math.min(1, k) * (on || done ? 1 : .6) }); });
  M.text(c, 'SPRINGBANK OFF-STREAM RESERVOIR', bx, by - bry - (WIDE ? 70 : 80), { size: WIDE ? 48 : 46, weight: 800, align: 'center', color: '#fff', maxW: WIDE ? 1400 : 880 });
  note(c, 'illustration, not to scale'); src(c, 'Sources: Government of Alberta · RenewCanada · CBC News'); }

// ---------- scenes ----------
const D = {
  L0: (c, t, d) => { const p = THUMB ? .85 : ease(t, 0, Math.min(d, 3.2), 'outCubic');
    map(c, THUMB && WIDE ? above([SR[0] - 7000, SR[1] + 1500, 0], 26000, .12) : WESTCAM(M.lerp(WIDE ? 70000 : 62000, WIDE ? 44000 : 40000, p)), { basin: THUMB ? 1 : ease(t, 0, 1.4, 'outCubic'), pin: THUMB ? 1 : ease(t, .5, 1.1), pinLabel: THUMB ? '' : undefined, cityLabel: THUMB ? 0 : 1, t });
    if (THUMB) return;
    headline(c, t, 'A reservoir meant to stay empty', ['empty']);
    north(c); src(c, MAPC); },
  L1: (c, t, d) => { const p = ease(t, 0, d, 'inOutSine');
    map(c, CITYCAM(M.lerp(52000, 44000, p)), { rain: ease(t, 0, .6), t, rivers: .15, cityLabel: 1 });
    stamp(c, 'JUNE 2013', t, .3); chip(c, 'THE FLOOD', L.stampY + (WIDE ? 100 : 125), ease(t, .9, 1.3, 'outBack'), { bg: RIVER, color: NAVY });
    north(c); src(c, MAPC + ' · Source: City of Calgary, Flood of 2013'); },
  L2: (c, t, d) => { const p = ease(t, 0, d, 'inOutSine'), rv = ease(t, d * .35, d * .9, 'inOutCubic');
    map(c, CITYCAM(M.lerp(44000, 38000, p), [-4000, -1500, 0]), { rain: 1 - .4 * rv, t, rivers: rv, labels: ease(t, d * .5, d * .7) });
    chip(c, 'HEAVY RAIN ON MELTING SNOW', WIDE ? 140 : 330, ease(t, .2, .6, 'outBack'), { bg: '#ffffff', color: NAVY });
    chip(c, '← ROCKY MOUNTAINS', WIDE ? 230 : 430, ease(t, .6, 1.0, 'outBack'), { bg: RIVER, color: NAVY });
    chip(c, 'BOTH RIVERS RISE', WIDE ? 320 : 530, ease(t, d * .45, d * .45 + .35, 'outBack'), { bg: GOLD, color: NAVY });
    north(c); src(c, MAPC + ' · Source: City of Calgary, Flood of 2013'); },
  L3: (c, t, d) => { gridBg(c, t); const bars = [['BOW RIVER', 8, .2, RIVER], ['ELBOW RIVER', 12, d * .5, '#7fe0a8']];
    M.text(c, 'PEAK FLOW vs REGULAR FLOW', CX, WIDE ? 90 : 330, { size: WIDE ? 70 : 62, weight: 800, align: 'center', maxW: WIDE ? 1600 : 880 });
    M.text(c, 'June 2013', CX, WIDE ? 180 : 420, { size: WIDE ? 44 : 46, weight: 600, align: 'center', color: GOLD });
    const bx = WIDE ? 420 : 110, bw = WIDE ? 1200 : 760, bh = WIDE ? 120 : 130;
    bars.forEach(([lab, v, t0, col], i) => { const y = WIDE ? 380 + i * 270 : 640 + i * 330, p = ease(t, t0, t0 + 1.2, 'outCubic');
      M.text(c, lab, bx, y - (WIDE ? 70 : 78), { size: WIDE ? 54 : 56, weight: 800 });
      M.rr(c, bx, y, bw, bh, 16); c.fillStyle = 'rgba(255,255,255,.1)'; c.fill();
      if (p > 0) { M.rr(c, bx, y, Math.max(6, bw * v / 12 * p), bh, 16); c.fillStyle = col; c.fill();
        M.counter(c, v, p, bx + Math.max(6, bw * v / 12 * p) - (WIDE ? 90 : 80), y + (WIDE ? 16 : 18), { size: WIDE ? 84 : 88, color: NAVY, suffix: '×', shadow: false }); }
      const reg = bw / 12; c.fillStyle = '#ffffff'; c.fillRect(bx + reg - 3, y - 10, 6, bh + 20); });
    M.text(c, '| = regular flow', bx, WIDE ? 900 : 1300, { size: WIDE ? 34 : 36, weight: 600, color: '#dfe7f2' });
    src(c, 'Source: City of Calgary, Flood of 2013 (Bow peak; Elbow inflow peak)'); },
  L4: (c, t, d) => { map(c, CITYCAM(M.lerp(40000, 36000, ease(t, 0, d))), { rivers: 1, rain: .5, t }); c.fillStyle = 'rgba(7,13,24,.55)'; c.fillRect(0, 0, W, H);
    const p = ease(t, .2, d * .55, 'linear');
    M.text(c, 'ABOUT', CX, WIDE ? 150 : 400, { size: WIDE ? 56 : 60, weight: 700, align: 'center', color: '#dfe7f2', alpha: ease(t, 0, .3) });
    M.counter(c, 80000, p, CX, WIDE ? 230 : 480, { size: WIDE ? 220 : 200, color: GOLD, slam: true });
    chip(c, 'PEOPLE EVACUATED', WIDE ? 500 : 760, ease(t, .5, .9), { size: L.chip + 4 });
    chip(c, '26 COMMUNITIES', WIDE ? 610 : 880, ease(t, d * .62, d * .62 + .35, 'outBack'), { bg: ORANGE, color: NAVY });
    src(c, MAPC + ' · Source: City of Calgary, Flood of 2013'); },
  L5: (c, t, d) => { const cut = d * .42;
    if (t < cut) { downtown(c, t, cut, { sky: 'night', a0: 230, turn: 22, r: 2700, h: 950, target: SAD(), swell: ease(t, 0, cut * .8), pool: ease(t, cut * .2, cut), sadLabel: 1 });
      M.weather(c, 'rain', t, W, H, { count: 160, seed: 5 }); band(c, WIDE ? 40 : 250, WIDE ? 300 : 560, .6);
      chip(c, 'DOWNTOWN INACCESSIBLE FOR DAYS', WIDE ? 150 : 400, ease(t, .2, .6, 'outBack'), { bg: '#ffffff', color: NAVY, size: WIDE ? 52 : 42 });
      note(c, 'illustration'); src(c, 'Map data © OpenStreetMap contributors · Source: City of Calgary, Flood of 2013'); }
    else { seats(c, t - cut, d - cut); src(c, 'Source: City of Calgary, Flood of 2013'); } },
  L6: (c, t, d) => { navyBg(c); M.weather(c, 'rain', t, W, H, { count: 90, seed: 7 });
    M.text(c, 'One Calgarian’s life was lost', CX, WIDE ? 170 : 400, { size: WIDE ? 80 : 76, weight: 800, align: 'center', color: '#e8eef6', alpha: ease(t, .1, .6), maxW: WIDE ? 1600 : 860 });
    const p = ease(t, d * .42, d * .8, 'outCubic');
    if (p > 0) { M.counter(c, 5, p, CX, WIDE ? 470 : 760, { size: WIDE ? 200 : 190, color: GOLD, prefix: '~$', suffix: ' BILLION', slam: true }); }
    chip(c, 'FLOOD IMPACT ACROSS ALBERTA (ASSESSED)', WIDE ? 720 : 1000, ease(t, d * .55, d * .55 + .35, 'outBack'), { size: WIDE ? 44 : 38 });
    src(c, 'Source: City of Calgary, Flood of 2013'); },
  L7: (c, t, d) => { downtown(c, t, d, { sky: 'dusk', a0: 200, turn: 30 }); band(c, WIDE ? 40 : 260, WIDE ? 420 : 700, .6);
    M.kinetic(c, 'SINCE 2013', t, CX, WIDE ? 90 : 320, { size: WIDE ? 130 : 130, maxW: 860, highlight: ['2013'] });
    chip(c, 'CITY + PROVINCE', WIDE ? 290 : 540, ease(t, .5, .9, 'outBack'), { bg: GOLD, color: NAVY });
    src(c, 'Map data © OpenStreetMap contributors · Source: City of Calgary, Flood resilience plan'); },
  L8: (c, t, d) => { const cut = d * .3; if (t < cut) { const p = ease(t, 0, cut, 'inOutCubic'); const g = GLEN();
      map(c, WIDE ? above(g, M.lerp(30000, 12000, p) * .7, .2) : above(g, M.lerp(30000, 11000, p), .18), { glen: ease(t, .1, .5), rivers: .2 }); north(c); src(c, MAPC); }
    else dam(c, t - cut, d - cut); },
  L9: (c, t, d) => { const p = ease(t, 0, d, 'inOutSine');
    map(c, WIDE ? above([-600, 200, 0], M.lerp(9000, 7500, p), .3) : above([-600, 0, 0], M.lerp(10000, 8500, p), .28), { buildings: true, rivers: .25, riverMax: 240, barrier: ease(t, .2, d * .4), barrier2: ease(t, d * .5, d * .85) });
    band(c, WIDE ? 20 : 220, WIDE ? 330 : 640, .6);
    chip(c, 'DOWNTOWN BARRIER · COMPLETED', WIDE ? 110 : 330, ease(t, .3, .7, 'outBack'), { bg: GOLD, color: NAVY, size: WIDE ? 48 : 42 });
    chip(c, 'SUNNYSIDE + HILLHURST · COMPLETED SEPT. 2026', WIDE ? 210 : 430, ease(t, d * .5, d * .5 + .35, 'outBack'), { bg: ORANGE, color: NAVY, size: WIDE ? 48 : 36 });
    note(c, 'barrier lines schematic'); north(c); src(c, MAPC + ' · Sources: City of Calgary · CTV News (Sept. 26, 2026)'); },
  L10: (c, t, d) => { const p = ease(t, 0, d * .85, 'inOutCubic');
    map(c, WESTCAM(M.lerp(WIDE ? 26000 : 24000, WIDE ? 50000 : 46000, p)), { basin: 1, pin: ease(t, d * .35, d * .35 + .5), pinLabel: 'SPRINGBANK OFF-STREAM\nRESERVOIR (SR1)', cityLabel: 1, rivers: .2 });
    band(c, WIDE ? 20 : 220, WIDE ? 260 : 560, .55);
    chip(c, 'ABOUT 15 KM WEST OF CALGARY', WIDE ? 120 : 380, ease(t, d * .4, d * .4 + .35, 'outBack'), { bg: '#ffffff', color: NAVY });
    north(c); src(c, MAPC + ' · Sources: CBC News / RenewCanada · City of Calgary'); },
  L11: (c, t, d) => sr1Works(c, t, d),
  L12: (c, t, d) => { gridBg(c, t); const p = ease(t, .2, d * .4, 'outCubic');
    M.counter(c, 70.2, p, CX, WIDE ? 80 : 300, { size: WIDE ? 200 : 190, color: RIVER, decimals: 1, slam: true });
    M.text(c, 'MILLION m³', CX, WIDE ? 300 : 510, { size: WIDE ? 80 : 84, weight: 800, align: 'center', alpha: ease(t, .4, .8) });
    const cols = WIDE ? 40 : 20, rows = WIDE ? 7 : 12, gw = WIDE ? 34 : 38, gx = CX - cols * gw / 2, gy = WIDE ? 470 : 680, k = ease(t, d * .45, d * .85, 'linear');
    for (let i = 0; i < cols * rows; i++) { const q = i % cols, r = Math.floor(i / cols), on = i / (cols * rows) < k; if (!on) continue; c.fillStyle = RIVER; M.rr(c, gx + q * gw + 4, gy + r * gw * .8, gw - 8, gw * .8 - 8, 4); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(gx + q * gw + 8, gy + r * gw * .8 + (gw * .8 - 8) / 2, gw - 16, 2); }
    chip(c, '≈ 28,000 OLYMPIC POOLS', WIDE ? 860 : 1180, ease(t, d * .55, d * .55 + .35, 'outBack'), { bg: GOLD, color: NAVY });
    M.text(c, 'illustrative: pools not to count', CX, WIDE ? 950 : 1290, { size: 26, weight: 600, align: 'center', color: '#c9d3e0', alpha: ease(t, d * .6, d * .7) });
    src(c, 'Source: CBC News / RenewCanada'); },
  L13: (c, t, d) => { const p = ease(t, 0, d, 'inOutSine');
    map(c, WESTCAM(M.lerp(WIDE ? 50000 : 46000, WIDE ? 46000 : 42000, p)), { basin: 1, pin: 1, pinLabel: 'SR1', elbow: ease(t, .2, .9), glen: ease(t, .4, 1), cityLabel: 1 }); c.fillStyle = `rgba(7,13,24,${.55 * ease(t, d * .45, d * .6)})`; c.fillRect(0, 0, W, H);
    band(c, WIDE ? 20 : 220, WIDE ? 300 : 620, .62);
    chip(c, 'THE CITY SAYS', WIDE ? 90 : 320, ease(t, .1, .4), { bg: '#ffffff', color: NAVY, size: WIDE ? 40 : 44 });
    chip(c, 'ELBOW RIVER: PROTECTED', WIDE ? 180 : 420, ease(t, .4, .8, 'outBack'), { bg: '#7fe0a8', color: NAVY });
    chip(c, 'FROM A 2013-SIZED FLOOD', WIDE ? 260 : 510, ease(t, .6, 1.0, 'outBack'), { bg: '#7fe0a8', color: NAVY });
    const k = ease(t, d * .5, d * .85, 'outCubic'); if (k > 0) { M.counter(c, 70, k, CX, WIDE ? 420 : 780, { size: WIDE ? 210 : 210, color: GOLD, prefix: '~', suffix: '%', slam: true });
      chip(c, 'LOWER FLOOD RISK, CITY-WIDE', WIDE ? 680 : 1040, ease(t, d * .65, d * .65 + .35, 'outBack'), { bg: GOLD, color: NAVY }); }
    src(c, MAPC + ' · Source: City of Calgary (May 15, 2025; Flood resilience plan)'); },
  L14: (c, t, d) => { const p = ease(t, 0, d * .8, 'inOutCubic'), tg = [M.lerp(-6000, GH[0] * (WIDE ? .62 : .82), p), M.lerp(1000, GH[1] * (WIDE ? .62 : .82), p), 0];
    map(c, WIDE ? above(tg, 52000 * .62, .12) : above(tg, 52000, .1), { bow: ease(t, .2, .8), ghost: ease(t, d * .4, d * .4 + .5), cityLabel: 1 });
    band(c, WIDE ? 20 : 220, WIDE ? 330 : 660, .62);
    M.kinetic(c, 'The Bow is a different story', t, CX, WIDE ? 120 : 280, { size: WIDE ? 96 : 104, maxW: WIDE ? 1600 : 860, highlight: ['Bow'] });
    chip(c, 'GHOST DAM RELOCATION', WIDE ? 260 : 500, ease(t, d * .45, d * .45 + .35, 'outBack'), { bg: RIVER, color: NAVY });
    chip(c, 'IN ENGINEERING + APPROVALS', WIDE ? 340 : 590, ease(t, d * .6, d * .6 + .35, 'outBack'), { bg: '#ffffff', color: NAVY });
    north(c); src(c, MAPC + ' · Source: City of Calgary, Flood resilience plan'); },
  L15: (c, t, d) => { downtown(c, t, d, { sky: 'dusk', a0: 250, turn: 35, r: 2300, h: 700 }); band(c, WIDE ? 20 : 220, WIDE ? 420 : 820, .6);
    M.kinetic(c, '2013 changed how Calgary lives with its rivers', t, CX, WIDE ? 130 : 300, { size: WIDE ? 104 : 110, maxW: WIDE ? 1500 : 860, highlight: ['rivers'], every: .08 });
    src(c, 'Map data © OpenStreetMap contributors'); },
  Q: (c, t, d) => { downtown(c, t + 6, d, { sky: 'night', a0: 290, turn: 10, r: 2300, h: 700 }); band(c, WIDE ? 20 : 220, WIDE ? 420 : 860, .66);
    M.kinetic(c, 'Do you feel safer from the next big flood?', t, CX, WIDE ? 150 : 320, { size: WIDE ? 104 : 110, maxW: WIDE ? 1500 : 860, highlight: ['safer'], every: .08 }); },
  C: (c, t, d) => { downtown(c, t + 9, d, { sky: 'night', a0: 300, turn: 6, r: 2300, h: 700 }); c.fillStyle = 'rgba(7,13,24,.9)'; c.fillRect(0, 0, W, H);
    M.closer(c, 'Do you feel safer from the next big flood? Yes or no?', M.seg(t, 0, d, 'linear') + .3, W, H, { highlight: ['yes', 'no?'] }); },
  T0: (c, t, d) => D.L0(c, t, d),
  T1: (c, t, d) => { const cut = d * .42;
    if (t < cut) { map(c, CITYCAM(M.lerp(46000, 38000, ease(t, 0, cut))), { rain: 1, t, rivers: ease(t, 0, cut), cityLabel: 1 }); c.fillStyle = 'rgba(7,13,24,.35)'; c.fillRect(0, 0, W, H);
      stamp(c, 'JUNE 2013', t, .2); const p = ease(t, .7, cut * .8, 'linear'); M.counter(c, 80000, p, CX, 700, { size: 190, color: GOLD, slam: true, prefix: '~' }); chip(c, 'EVACUATED', 950, ease(t, 1, 1.3)); src(c, MAPC + ' · Source: City of Calgary'); }
    else { const tt = t - cut, dd = d - cut; map(c, WESTCAM(M.lerp(30000, 46000, ease(tt, 0, dd))), { basin: 1, pin: 1, pinLabel: 'SPRINGBANK\nOFF-STREAM RESERVOIR', glen: ease(tt, dd * .45, dd * .6), elbow: ease(tt, dd * .45, dd * .8), cityLabel: 1 });
      band(c, 220, 620, .6); chip(c, 'WITH GLENMORE:', 330, ease(tt, dd * .45, dd * .5 + .3, 'outBack'), { bg: '#ffffff', color: NAVY }); chip(c, 'BUILT FOR A 2013-SIZED', 420, ease(tt, dd * .5, dd * .55 + .3, 'outBack'), { bg: '#7fe0a8', color: NAVY }); chip(c, 'ELBOW FLOOD', 510, ease(tt, dd * .55, dd * .6 + .3, 'outBack'), { bg: '#7fe0a8', color: NAVY });
      north(c); src(c, MAPC + ' · Source: Government of Alberta'); } },
  T2: (c, t, d) => { if (t >= 2.2) { D.C(c, t - 2.2, d - 2.2); return; } navyBg(c); const a = 1 - M.seg(t, 1.6, 2.0);
    M.text(c, '▶ FULL VIDEO', CX, 600, { size: 112, weight: 800, align: 'center', alpha: a * M.seg(t, 0, .25) });
    M.text(c, 'on our page', CX, 760, { size: 64, weight: 700, align: 'center', color: GOLD, maxW: 860, alpha: a * M.seg(t, .2, .45) });
    M.text(c, 'calgaryinsight.ca', CX, 1000, { size: 44, weight: 600, align: 'center', alpha: a * M.seg(t, .3, .55) }); },
};
const TRANS = { L0: { kind: 'dissolve', dur: .45 }, L1: { kind: 'match', dur: .45 }, L2: { kind: 'push', dur: .4 }, L3: { kind: 'whip', dur: .35 }, L4: { kind: 'zoom', dur: .4 },
  L5: { kind: 'dissolve', dur: .6 }, L6: { kind: 'dissolve', dur: .6 }, L7: { kind: 'push', dur: .4 }, L8: { kind: 'zoom', dur: .4 }, L9: { kind: 'match', dur: .45 },
  L10: { kind: 'wipe', dur: .45 }, L11: { kind: 'push', dur: .4 }, L12: { kind: 'zoom', dur: .4 }, L13: { kind: 'dissolve', dur: .5 }, L14: { kind: 'dissolve', dur: .5 }, L15: { kind: 'dissolve', dur: .45 }, Q: { kind: 'dissolve', dur: .35 },
  T0: { kind: 'dissolve', dur: .4 }, T1: { kind: 'dissolve', dur: .45 } };
const TR = (id, i) => { if (!ORDER[i + 1]) return undefined; if (CUT === 'short' && id === 'L5') return { kind: 'dissolve', dur: .6 }; return TRANS[id]; };

function originsHeader(c) { if (!window.LOGO) return; c.save();
  if (!WIDE) { const s = 70; c.font = M.font(40, 700); const a = c.measureText('Calgary Insight ').width; c.font = M.font(40, 800); const b = c.measureText('ORIGINS').width; const x = CX - (s + 18 + a + b) / 2;
    c.drawImage(window.LOGO, x, 140, s, s); M.text(c, 'Calgary Insight', x + s + 18, 140 + s / 2, { size: 40, base: 'middle', weight: 700, shadow: 8 }); M.text(c, 'ORIGINS', x + s + 18 + a, 140 + s / 2, { size: 40, base: 'middle', weight: 800, color: ORANGE, shadow: 8 }); }
  else { c.drawImage(window.LOGO, 48, 40, 60, 60); c.font = M.font(30, 700); const a = c.measureText('Calgary Insight ').width; M.text(c, 'Calgary Insight', 124, 70, { size: 30, base: 'middle', weight: 700, shadow: 8 }); M.text(c, 'ORIGINS', 124 + a, 70, { size: 30, base: 'middle', weight: 800, color: ORANGE, shadow: 8 }); }
  c.restore(); }
function thumbBrand(c) { if (!window.LOGO) return; const s = WIDE ? 64 : 84, x = WIDE ? 40 : 60, y = WIDE ? H - s - 30 : 1490; c.drawImage(window.LOGO, x, y, s, s);
  c.font = M.font(WIDE ? 32 : 40, 700); const a = c.measureText('Calgary Insight ').width; M.text(c, 'Calgary Insight', x + s + 16, y + s / 2, { size: WIDE ? 32 : 40, base: 'middle', weight: 700 }); M.text(c, 'ORIGINS', x + s + 16 + a, y + s / 2, { size: WIDE ? 32 : 40, base: 'middle', weight: 800, color: ORANGE }); }
function thumbText(c) { if (WIDE) { const g = c.createLinearGradient(0, 0, W * .8, 0); g.addColorStop(0, 'rgba(7,13,24,.9)'); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    M.text(c, 'BUILT TO', 70, 130, { size: 150, weight: 900, color: '#fff' }); M.text(c, 'STAY EMPTY', 70, 300, { size: 150, weight: 900, color: GOLD }); }
  else { band(c, 300, 960, .72); M.text(c, 'BUILT TO', CX, 380, { size: 150, weight: 900, align: 'center', color: '#fff' }); M.text(c, 'STAY EMPTY', CX, 560, { size: 150, weight: 900, align: 'center', color: GOLD, maxW: 900 }); } }

function chunks(txt) { const ws = txt.split(/\s+/), out = []; let cur = [];
  ws.forEach((w, i) => { cur.push(w); const n = cur.length, punct = /[,.?!:;]$/.test(w), rest = ws.length - i - 1; if ((punct && n >= 3 && (rest === 0 || rest >= 3)) || n >= 9 && rest >= 3) { out.push(cur.join(' ')); cur = []; } });
  if (cur.length) { if (out.length && cur.length < 3) out[out.length - 1] += ' ' + cur.join(' '); else out.push(cur.join(' ')); } return out; }
function capAt(t) { const s = S.lineAt(t); if (!s) return ''; const cs = chunks(s.caption), tot = cs.reduce((a, x) => a + x.split(' ').length, 0); let acc = 0;
  for (const ch of cs) { acc += ch.split(' ').length; if (t < s.start + s.speech * acc / tot) return ch; } return cs[cs.length - 1]; }
window.CAPTIONS = () => S.scenes.map(s => ({ start: s.start, chunks: chunks(s.caption) }));

window.BUILD = () => { window.CUES = CUESFN(); return M.film({ W, H, identity: 'storyteller', scenes: ORDER.map((id, i) => ({ dur: sc[i].sceneDur, trans: TR(id, i), draw: (c, t) => D[id](c, t, sc[i].sceneDur) })),
  letterbox: () => 0,
  overlay: (c, t, info) => {
    const last = info.index === ORDER.length - 1 || (CUT === 'teaser' && ORDER[info.index] === 'T2' && t - sc[info.index].sceneStart >= 2.2);
    if (THUMB) { thumbText(c); thumbBrand(c); return; }
    if (t > 3 && !last && !(CUT === 'teaser' && ORDER[info.index] === 'T2')) originsHeader(c);
    if (!last) M.caption(c, capAt(t), W, H, WIDE ? {} : { bottom: 1410 });
    if (S.total > 25) { const mid = S.total / 2; M.followPill(c, M.seg(t, mid - 1, mid + 1, 'linear'), W, H); }
  } }); };

const CUESFN = () => { const s = i => sc[i].sceneStart, cues = [{ t: 0, sfx: 'impact', gain: -6 }, { t: .05, sfx: 'whoosh', gain: -12 }, { t: 0, sfx: 'wind', gain: -18, dur: Math.min(3, sc[0].sceneDur) }];
  ORDER.forEach((id, i) => { const d = sc[i].sceneDur, at = (x, sfx, g, o = {}) => cues.push(Object.assign({ t: s(i) + x, sfx, gain: g }, o));
    if (i > 0) { const k = TR(ORDER[i - 1], i - 1) && TR(ORDER[i - 1], i - 1).kind; cues.push({ t: Math.max(0, s(i) - .2), sfx: k === 'flash' ? 'impact' : (k === 'dissolve' || k === 'match' ? 'whoosh_rev' : 'whoosh'), gain: k === 'dissolve' ? -16 : -11 }); }
    if (id === 'L0' || id === 'T0') { at(.6, 'ping', -12); }
    if (id === 'L1') { at(0, 'rain', -16, { dur: d }); at(.3, 'stamp', -8); at(.9, 'pop', -12); }
    if (id === 'L2') { at(0, 'rain', -17, { dur: d }); at(.2, 'pop', -12); at(.6, 'pop', -12); at(d * .35, 'riser', -18, { dur: d * .5 }); }
    if (id === 'L3') { at(.2, 'ticks', -15, { dur: 1.2 }); at(d * .5, 'ticks', -15, { dur: 1.2 }); at(d * .5 + 1.2, 'thud', -10); }
    if (id === 'L4') { at(.2, 'ticks', -15, { dur: d * .35 }); at(d * .55, 'impact', -9); at(d * .62, 'pop', -12); }
    if (id === 'L5') { at(0, 'rain', -17, { dur: d * .42 }); at(.2, 'pop', -12); at(d * .42, 'whoosh_rev', -15); at(d * .5 + .4, 'thud', -11); }
    if (id === 'L6') { at(d * .42, 'swell', -20, { dur: d * .4 }); at(d * .8, 'thud', -12); }
    if (id === 'L7') { at(.1, 'impact', -11); at(.5, 'pop', -12); }
    if (id === 'L8') { at(.1, 'ping', -13); at(d * .3 + .3, 'stamp', -8); at(d * .3 + .6, 'pop', -12); at(d * .78, 'pop', -11); }
    if (id === 'L9') { at(.3, 'pop', -12); at(d * .5, 'pop', -12); }
    if (id === 'L10') { at(d * .35, 'ping', -11); at(d * .4, 'pop', -12); }
    if (id === 'L11') { at(.1, 'pop', -12); at(d * .28, 'whoosh', -13); at(d * .5, 'pop', -12); at(d * .74, 'whoosh_rev', -14); }
    if (id === 'L12') { at(.2, 'ticks', -15, { dur: d * .25 }); at(d * .4, 'impact', -9); at(d * .55, 'pop', -12); }
    if (id === 'L13') { at(.1, 'pop', -12); at(.4, 'pop', -12); at(d * .5, 'ticks', -15, { dur: d * .3 }); at(d * .85, 'impact', -10); }
    if (id === 'L14') { at(.1, 'riser', -20, { dur: d * .4 }); at(d * .4, 'ping', -12); at(d * .6, 'pop', -12); }
    if (id === 'L15') { at(0, 'swell', -18, { dur: d }); }
    if (id === 'T1') { at(0, 'rain', -16, { dur: d * .42 }); at(.2, 'stamp', -7); at(d * .35, 'impact', -9); at(d * .45, 'ping', -12); }
    if (id === 'T2') { at(.1, 'ping', -12); }
  });
  return cues; };
window.TOTAL = () => S.total;
