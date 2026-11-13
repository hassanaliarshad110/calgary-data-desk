/* TRAILER: "Calgarians vs Corrupt Mafia" — Calgary Insight Origins, original series teaser (test, fictional story).
 *   python3 ../../motion/engine/render.py scene.js trailer.mp4 --geo ../../motion/geo/calgary_base.json --workers 2
 * 1920x1080, 30 fps, scope letterbox. Real downtown geometry (OSM + City of Calgary), everything else procedural.
 */
const W = 1920, H = 1080;
const P = window.PARAMS || {};
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = M.seg;

// ---------- VO timing (measured Kokoro durations are injected by build step; defaults are estimates) ----------
const VO = window.VO_TIMES || [
  { t: 0.30, d: 2.411, text: 'They built this city with their own hands.' },
  { t: 3.95, d: 2.304, text: 'Then someone decided to own it.' },
  { t: 6.95, d: 1.24, text: 'Every contract.' },
  { t: 8.25, d: 0.85, text: 'Every permit.' },
  { t: 9.25, d: 1.08, text: 'Every street.' },
  { t: 11.00, d: 1.856, text: 'But they forgot one thing.' },
  { t: 13.45, d: 1.792, text: "Calgarians don't sell." },
  { t: 18.65, d: 2.304, text: 'This winter, the city fights back.' },
  { t: 21.55, d: 2.709, text: 'Calgarians versus the Corrupt Mafia.' },
  { t: 26.15, d: 4.48, text: 'An original series. Coming soon, on calgaryinsight.ca' },
];
const captionAt = t => { const v = VO.find(v => t >= v.t && t < v.t + v.d + .25); if (!v) return ''; return /^Every/.test(v.text) ? 'Every contract. Every permit. Every street.' : v.text; };

// ---------- world constants ----------
M.skies.stormRed = { top: '#04060a', mid: '#140d14', horizon: '#5a1f22', ground: '#07090d', fog: '#2a1a20', sun: [.35, .55, .75], ambient: .3 };
M.skies.storm = { top: '#04060a', mid: '#0b121c', horizon: '#223042', ground: '#07090d', fog: '#1a2431', sun: [.35, .55, .75], ambient: .3 };
const NIGHT = { land: '#0b0e13', park: '#0b120e', water: '#0b1828', building: '#1c232d', road: '#20252c', motorway: '#2e2b26', lrt: '#2a1416' };
const GEO = M.geo.get();
const BP = M.geo.lm('Brookfield Place') || [411, 274, 0];
const CT = M.geo.lm('Calgary Tower') || [613, -44, 0];
const PB = M.geo.lm('Peace Bridge') || [-490, 1018, 0];
const DT = [380, 250, 0]; // downtown centre
const BLD = GEO.buildings_downtown.items;
const CEN = BLD.map(b => { let x = 0, y = 0; b.fp.forEach(p => { x += p[0]; y += p[1]; }); return [x / b.fp.length, y / b.fp.length]; });
const BPI = BLD.findIndex(b => b.name === 'Brookfield Place');
const CTI = BLD.findIndex(b => b.name === 'Calgary Tower');
const BPB = BLD[BPI];
const STREET_X = 26; // clear north-south street through the core
const RED = '#ff2a1f', GOLD = '#ffb43a';

/** dark city around a centre; skip lets a scene draw its own hero buildings */
function city(w, centre, R, o = {}) {
  M.geo.addBase(w, { buildings: true, colors: NIGHT, windows: o.win || '#ffc46a', windowAlpha: o.wa ?? .6, riverW: 70, roads: o.roads ?? true, parks: o.parks ?? true,
    only: (b, i) => i !== BPI && (o.keepCT || i !== CTI) && Math.hypot(CEN[i][0] - centre[0], CEN[i][1] - centre[1]) < R && b.h > (o.minH || 0) });
  return w;
}
/** Brookfield Place drawn in floor bands: lit(z) -> colour of windows for that band (null = dark) */
function heroTower(w, lit, o = {}) {
  const fp = BPB.fp, h = BPB.h, band = 13;
  for (let z = 0; z < h - .1; z += band) {
    const hh = Math.min(band, h - z), col = lit(z / h);
    w.box(fp, hh, { z0: z, color: o.color || '#1e2530', roof: '#141a22', windows: col || '#2a323e', windowAlpha: col ? .95 : .25 });
  }
}
const towerTop = () => [CEN[BPI][0], CEN[BPI][1], BPB.h + 2];

// ---------- post and atmosphere ----------
function bloom(c, k = .6, thr = 2.4, blur = 3) {
  const [b, x] = M.buffer('bl1', W / 4, H / 4); x.filter = `brightness(.72) contrast(${thr})`; x.drawImage(c.canvas, 0, 0, W / 4, H / 4);
  const [b2, x2] = M.buffer('bl2', W / 4, H / 4); x2.filter = `blur(${blur}px)`; x2.drawImage(b, 0, 0);
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = k; c.drawImage(b2, 0, 0, W, H); c.globalAlpha = k * .5; x2.filter = `blur(${blur * 3}px)`; x2.drawImage(b, 0, 0); c.drawImage(b2, 0, 0, W, H); c.restore();
}
function grade(c, tint = 'rgba(20,60,80,.18)') { c.save(); c.globalCompositeOperation = 'soft-light'; c.fillStyle = tint; c.fillRect(0, 0, W, H); c.restore(); }
function glow(c, x, y, r, col, a = 1) { if (r < .3 || a <= 0) return; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, M.css(col, a)); g.addColorStop(.25, M.css(col, a * .45)); g.addColorStop(1, M.css(col, 0)); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
function flare(c, x, y, len, col = '#8fb6ff', a = .6) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(x - len, 0, x + len, 0); g.addColorStop(0, M.css(col, 0)); g.addColorStop(.5, M.css(col, a)); g.addColorStop(1, M.css(col, 0)); c.fillStyle = g; c.fillRect(x - len, y - 1.5, len * 2, 3); c.fillStyle = M.css(col, a * .25); c.fillRect(x - len * .6, y - 5, len * 1.2, 10); c.restore(); }
function lightningAt(c, t, times, o = {}) {
  let I = 0;
  for (const t0 of times) {
    const d = t - t0; if (d < 0 || d > .6) continue;
    const fl = d < .05 ? 1 : d < .1 ? .25 : d < .16 ? .85 : Math.exp(-(d - .16) * 9) * .55; I = Math.max(I, fl);
    if (d < .32) { // the bolt
      const r = M.rng(Math.round(t0 * 1000) + 3); let x = W * (o.x ?? (.2 + r() * .6)), y = 0; c.save(); c.globalCompositeOperation = 'lighter'; c.lineJoin = 'round';
      const pts = [[x, y]]; while (y < H * (o.bottom ?? .5)) { x += (r() - .5) * 70; y += 18 + r() * 34; pts.push([x, y]); }
      for (const [lw, al] of [[14, .12], [6, .3], [2.2, 1]]) { c.strokeStyle = `rgba(210,225,255,${al * fl})`; c.lineWidth = lw; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.stroke(); }
      c.restore();
    }
  }
  if (I > 0) { c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(150,175,225,${I * (o.amount ?? .45)})`; c.fillRect(0, 0, W, H); c.restore(); }
  return I;
}
function clouds(c, t, amount, zoom, lit = 0) {
  if (amount <= 0) return; const r = M.rng(91); c.save();
  for (let i = 0; i < 46; i++) {
    const bx = r() * 1.6 - .3, by = r() * 1.2 - .1, rad = 160 + r() * 380, sh = r();
    const x = W / 2 + (bx * W - W / 2) * zoom + Math.sin(t * .3 + i) * 20, y = H / 2 + (by * H - H / 2) * zoom, R = rad * zoom;
    const g = c.createRadialGradient(x, y, 0, x, y, R); const base = M.blend('#1d2633', '#7d8fb0', lit * (.4 + sh * .6));
    g.addColorStop(0, M.css(base, .9 * amount)); g.addColorStop(.6, M.css(base, .55 * amount)); g.addColorStop(1, M.css(base, 0));
    c.fillStyle = g; c.fillRect(x - R, y - R, 2 * R, 2 * R);
  }
  c.restore();
}
function smoke(c, t, a = .35, col = '#3a4250') { const r = M.rng(5); c.save(); for (let i = 0; i < 18; i++) { const x = ((r() * W * 1.4 + t * (20 + r() * 30)) % (W * 1.4)) - W * .2, y = H * (.45 + r() * .6), R = 220 + r() * 300; const g = c.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, M.css(col, a * (.3 + r() * .5))); g.addColorStop(1, M.css(col, 0)); c.fillStyle = g; c.fillRect(x - R, y - R, 2 * R, 2 * R); } c.restore(); }
/** volumetric searchlight from a world point along a direction */
function beam(c, cam, base, dir, len, wid, col, a) {
  const A = cam.project(base), tip = [base[0] + dir[0] * len, base[1] + dir[1] * len, base[2] + dir[2] * len]; let B = cam.project(tip);
  if (!A) return; if (!B) { // tip behind camera: shorten
    for (let k = .8; k > .05 && !B; k *= .7) B = cam.project([base[0] + dir[0] * len * k, base[1] + dir[1] * len * k, base[2] + dir[2] * len * k]); if (!B) return; }
  const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, wb = Math.min(900, wid * B.k + 8), wa = Math.max(2, 1.2 * A.k);
  c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(A.x, A.y, B.x, B.y); g.addColorStop(0, M.css(col, a)); g.addColorStop(.5, M.css(col, a * .35)); g.addColorStop(1, M.css(col, 0));
  c.fillStyle = g; c.beginPath(); c.moveTo(A.x + nx * wa, A.y + ny * wa); c.lineTo(B.x + nx * wb, B.y + ny * wb); c.lineTo(B.x - nx * wb, B.y - ny * wb); c.lineTo(A.x - nx * wa, A.y - ny * wa); c.closePath(); c.fill();
  glow(c, A.x, A.y, 30 + A.k * 10, col, a * 1.4); c.restore();
}

// ---------- props ----------
/** capsule human from tubes. heading radians (0 = +x). o: {z0, walk phase, coat, hat, light, color} */
function person(w, x, y, heading, o = {}) {
  const fx = Math.cos(heading), fy = Math.sin(heading), rx = fy, ry = -fx, z0 = o.z0 || 0, s = o.scale || 1;
  const Pt = (f, r, z) => [x + (fx * f + rx * r) * s, y + (fy * f + ry * r) * s, z0 + z * s];
  const sw = o.phase == null ? 0 : Math.sin(o.phase), col = o.color || '#06080b', st = { color: col, noFog: o.noFog };
  for (const side of [-1, 1]) {
    const k = sw * side; w.tube([Pt(0, .1 * side, .95), Pt(k * .18, .11 * side, .5), Pt(k * .38, .12 * side, .06)], .085, st);
    w.tube([Pt(0, .23 * side, 1.42), Pt(-k * .2, .27 * side, 1.12), Pt(-k * .3 + (o.light && side > 0 ? .25 : 0), .27 * side, .86 + (o.light && side > 0 ? .25 : 0))], .065, st);
  }
  w.tube([Pt(0, 0, o.coat ? .72 : .95), Pt(0, 0, 1.45)], o.coat ? .25 : .19, st);
  w.tube([Pt(0, -.2, 1.43), Pt(0, .2, 1.43)], .09, st);
  w.tube([Pt(0, 0, 1.56), Pt(0, 0, 1.7)], .11, st);
  if (o.hat) { w.cube(Pt(0, 0, 1.74), [.52 * s, .52 * s, .025 * s], { color: col }); w.cube(Pt(0, 0, 1.765), [.28 * s, .28 * s, .13 * s], { color: col }); }
  if (o.light) w.at(Pt(.3, .27, 1.13), (c, sp) => { const r = clamp(sp.k * 1.4, 2, 16); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sp.x, sp.y, r * 3, '#ffcf7a', .9); glow(c, sp.x, sp.y, r, '#fff3d6', 1); c.restore(); });
}
/** sedan: o {lights, tail, color} heading radians (0=+x) */
function car(w, x, y, heading, o = {}) {
  const fx = Math.cos(heading), fy = Math.sin(heading), rx = fy, ry = -fx;
  const rect = (f0, f1, r) => [[x + fx * f0 + rx * r, y + fy * f0 + ry * r], [x + fx * f1 + rx * r, y + fy * f1 + ry * r], [x + fx * f1 - rx * r, y + fy * f1 - ry * r], [x + fx * f0 - rx * r, y + fy * f0 - ry * r]];
  const col = o.color || '#0b0d12';
  w.box(rect(-2.45, 2.45, .95), .62, { z0: .28, color: col, edge: '#4a5566', edgeW: 1 });
  w.box(rect(-1.5, .75, .82), .5, { z0: .9, color: '#05070a', edge: '#55606f', edgeW: 1 });
  w.box(rect(-2.2, 2.2, .97), .25, { z0: .05, color: '#020304' });
  if (o.lights) for (const side of [-1, 1]) {
    const lp = [x + fx * 2.47 + rx * .72 * side, y + fy * 2.47 + ry * .72 * side, .7];
    w.at(lp, (c, sp) => { const r = clamp(sp.k * .5, 1.5, 260), a = o.lights; c.save(); c.globalCompositeOperation = 'lighter';
      glow(c, sp.x, sp.y, r * 6, '#bcd4ff', .35 * a); glow(c, sp.x, sp.y, r * 1.3, '#ffffff', a); c.restore(); flare(c, sp.x, sp.y, Math.min(700, r * 45), '#7fa8ff', .45 * a);
      // wet-road reflection streak
      const g = c.createLinearGradient(0, sp.y, 0, sp.y + r * 40); g.addColorStop(0, `rgba(220,230,255,${.16 * a})`); g.addColorStop(1, 'rgba(220,230,255,0)');
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(sp.x - r * .5, sp.y + r * .5, r, Math.min(260, r * 30)); c.restore(); });
  }
  if (o.tail) for (const side of [-1, 1]) w.at([x - fx * 2.47 + rx * .75 * side, y - fy * 2.47 + ry * .75 * side, .75], (c, sp) => { const r = clamp(sp.k * .5, 1.5, 120); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sp.x, sp.y, r * 6, '#ff2a1f', .7); glow(c, sp.x, sp.y, r * 1.5, '#ff8a7a', 1); c.restore(); });
}
function lamps(w, x, y0, y1, step = 32, side = 9.5) {
  for (let y = y0; y <= y1; y += step) for (const s of [-1, 1]) {
    const bx = x + s * side; w.tube([[bx, y, 0], [bx, y, 7]], .12, { color: '#11151b' }); w.tube([[bx, y, 7], [bx - s * 1.6, y, 7.2]], .08, { color: '#11151b' });
    w.at([bx - s * 1.6, y, 7], (c, sp) => { const r = clamp(sp.k * .6, 1.5, 80); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sp.x, sp.y, r * 16, '#ff9a3a', .35); glow(c, sp.x, sp.y, r * 2, '#ffe2b0', 1);
      if (r > 12) { c.restore(); return; } const g = c.createLinearGradient(0, sp.y, 0, sp.y + r * 70); g.addColorStop(0, 'rgba(255,170,90,.08)'); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(sp.x - r, sp.y); c.lineTo(sp.x + r, sp.y); c.lineTo(sp.x + r * 9, sp.y + r * 70); c.lineTo(sp.x - r * 9, sp.y + r * 70); c.fill(); c.restore(); });
  }
}
/** the Peace Bridge: a red helix tube over a deck crossing the Bow (schematic) */
function peaceBridge(w, t, o = {}) {
  const L = 130, deck = 4;
  w.box([[PB[0] - 3.2, PB[1] - L / 2], [PB[0] + 3.2, PB[1] - L / 2], [PB[0] + 3.2, PB[1] + L / 2], [PB[0] - 3.2, PB[1] + L / 2]], .5, { z0: deck - .5, color: '#151a20' });
  for (let j = 0; j < 10; j++) {
    const pts = []; for (let k = 0; k <= 60; k++) { const y = PB[1] - L / 2 + L * k / 60; if (o.maxY != null && y > o.maxY) continue; const a = j * Math.PI * 2 / 10 + (y - PB[1]) * .09 * (j % 2 ? 1 : -1); const z = deck + 2.4 + Math.sin(a) * 3.2; if (z < deck - .2) { if (pts.length > 1) w.tube(pts.splice(0), o.r || .09, { color: '#8e1d1a' }); else pts.length = 0; continue; } pts.push([PB[0] + Math.cos(a) * 4.4, y, z]); }
    if (pts.length > 1) w.tube(pts, o.r || .09, { color: '#8e1d1a' });
  }
  if (o.noLights) return;
  for (let k = 0; k <= 12; k++) w.at([PB[0], PB[1] - L / 2 + L * k / 12, deck + .1], (c, sp) => { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sp.x, sp.y, clamp(sp.k * 3, 3, 160), '#ffd9a0', .55); c.restore(); });
}
/** red control strings from the hero tower to rooftops */
const STR = (() => { const r = M.rng(77), out = []; BLD.forEach((b, i) => { if (i === BPI || b.h < 40) return; const d = Math.hypot(CEN[i][0] - BP[0], CEN[i][1] - BP[1]); if (d < 120 || d > 1500 || r() > .5) return; out.push({ to: [CEN[i][0], CEN[i][1], b.h], d, delay: r() * .9 }); }); return out.slice(0, 70); })();
function strings(w, tt, o = {}) {
  const top = towerTop();
  for (const s of STR) {
    const p = seg(tt, s.delay * (o.spread ?? 1), s.delay * (o.spread ?? 1) + .55, 'outCubic'), cut = o.fade ?? 1; if (p <= 0 || cut <= 0) continue;
    const pts = []; const mid = [(top[0] + s.to[0]) / 2, (top[1] + s.to[1]) / 2, Math.max(top[2], s.to[2]) + 20 + s.d * .04];
    for (let k = 0; k <= 16; k++) { const u = k / 16, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), cc = u * u; pts.push([a * top[0] + b * mid[0] + cc * s.to[0], a * top[1] + b * mid[1] + cc * s.to[1], a * top[2] + b * mid[2] + cc * s.to[2]]); }
    w.line(pts, { wpx: o.wpx || 1.6, color: RED, glow: 3, p, alpha: cut, noFog: true, order: 9 });
    if (p >= 1) w.at(s.to, (c, sp) => { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sp.x, sp.y, 26, RED, .8 * cut); c.restore(); });
  }
}
const ROADS = GEO.roads.flatMap(r => r.lines).filter(l => l.some(p => Math.hypot(p[0] - DT[0], p[1] - DT[1]) < 3500));
const LRT = (GEO.lrt || []).filter(l => l.some(p => Math.hypot(p[0] - DT[0], p[1] - DT[1]) < 3000));
/** moving crowd lights converging on downtown along roads and the river */
const FLOW = (() => { const out = []; const r = M.rng(19); const add = (line, n) => { const ok = line.filter(p => Math.hypot(p[0] - DT[0], p[1] - DT[1]) < 4200); if (ok.length < 2) return; const d0 = Math.hypot(ok[0][0] - DT[0], ok[0][1] - DT[1]), d1 = Math.hypot(ok[ok.length - 1][0] - DT[0], ok[ok.length - 1][1] - DT[1]); const path = d0 > d1 ? ok : ok.slice().reverse(); const segL = []; let L = 0; for (let i = 0; i < path.length - 1; i++) { const l = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]); segL.push(l); L += l; } for (let k = 0; k < n; k++) out.push({ path, segL, L, off: r() * L, v: 12 + r() * 10, lane: (r() - .5) * 14 }); };
  ROADS.forEach(l => add(l, 40)); const bow = M.geo.riverPath('Bow River', DT, 4500); if (bow.length) { add(bow, 260); } return out; })();
function crowdLights(w, t, a = 1, o = {}) {
  for (const f of FLOW) { let s = (f.off + t * f.v * (o.speed || 1)) % f.L, i = 0; while (i < f.segL.length - 1 && s > f.segL[i]) { s -= f.segL[i]; i++; }
    const A = f.path[i], B = f.path[i + 1], u = f.segL[i] ? s / f.segL[i] : 0, dx = (B[0] - A[0]) / (f.segL[i] || 1), dy = (B[1] - A[1]) / (f.segL[i] || 1);
    w.at([lerp(A[0], B[0], u) + dy * f.lane, lerp(A[1], B[1], u) - dx * f.lane, 1.2], (c, sp) => { const r = clamp(sp.k * 3, 1.6, 16); c.globalCompositeOperation = 'lighter'; glow(c, sp.x, sp.y, r * 3.5, '#ffb24a', .85 * a); glow(c, sp.x, sp.y, r * .8, '#fff0c8', a); }); }
}

// ---------- type ----------
function ttext(c, s, x, y, size, a, o = {}) {
  if (a <= 0) return; c.save(); c.font = M.font(size, o.weight || 600); c.letterSpacing = `${(o.track ?? .3) * size}px`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.globalAlpha = clamp(a); c.shadowColor = o.glow || 'rgba(160,190,255,.55)'; c.shadowBlur = o.blur ?? 24; c.fillStyle = o.color || '#eef2f7'; c.fillText(s, x, y); c.shadowBlur = 0; c.fillText(s, x, y); c.restore();
}
/** extruded metal title. o: {depth, dx, dy, top, mid, low, side, sweep (0..1), scale, alpha} */
function title3D(c, key, s, x, y, size, o = {}) {
  const [b, x2] = M.buffer('t3d' + key, W, H); x2.save(); x2.translate(x, y); x2.scale(o.scale || 1, o.scale || 1);
  x2.font = M.font(size, 900); x2.letterSpacing = `${(o.track ?? .04) * size}px`; x2.textAlign = 'center'; x2.textBaseline = 'middle';
  const D = o.depth || 18; for (let k = D; k >= 1; k--) { x2.fillStyle = M.css(M.blend(o.side || '#2a1a08', '#000', k / D * .7)); x2.fillText(s, (o.dx ?? .8) * k, (o.dy ?? 1.3) * k); }
  const g = x2.createLinearGradient(0, -size * .55, 0, size * .55); g.addColorStop(0, o.top || '#fff4cc'); g.addColorStop(.45, o.mid || '#f2b632'); g.addColorStop(.55, o.low || '#9a6a12'); g.addColorStop(1, o.top2 || '#f6d27a');
  x2.fillStyle = g; x2.fillText(s, 0, 0); x2.lineWidth = 1.5; x2.strokeStyle = 'rgba(255,255,255,.35)'; x2.strokeText(s, 0, 0);
  if (o.sweep != null) { x2.globalCompositeOperation = 'source-atop'; const sx = lerp(-W * .6, W * .6, o.sweep), sg = x2.createLinearGradient(sx - 160, 0, sx + 160, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.75)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); x2.fillStyle = sg; x2.fillRect(-W, -H, W * 2, H * 2); }
  x2.restore(); c.save(); c.globalAlpha = o.alpha ?? 1; c.shadowColor = o.glowCol || 'rgba(255,170,60,.45)'; c.shadowBlur = 40; c.drawImage(b, 0, 0); c.restore();
}

// ---------- shots ----------
const shake = (t, amp, seed = 0) => [M.noise(t * 9 + seed) * amp, M.noise(t * 9 + seed + 40) * amp, M.noise(t * 9 + seed + 80) * amp * .4];
const camAt = (pos, look, fov = 40, roll = 0) => M.camera({ pos, look, fov, roll }, W, H);

const shots = {
  storm: (c, t, d) => { // descent through storm clouds onto the real skyline
    const p = seg(t, 0, d + .6, 'outCubic');
    const w = M.world({ sky: 'storm', fog: { near: 900, far: 9000, max: .75 } }); city(w, DT, 2300, { minH: 6, wa: .8 }); heroTower(w, () => '#ffc46a');
    const cam = camAt(M.mix([-2500, -3300, 1500], [-950, -1550, 360], p), M.mix([300, 150, 0], [450, 250, 150], p), 38, lerp(-4, 0, p)); w.render(c, cam);
    const I = lightningAt(c, t, [.08, 2.35], { x: .62 });
    clouds(c, t, .75 * (1 - seg(t, 0, 1.9, 'outQuad')), 1 + p * 2.8, I);
    M.weather(c, 'rain', t, W, H, { count: 700, seed: 4 }); bloom(c, .7); grade(c);
    ttext(c, 'THEY BUILT THIS CITY', W / 2, H * .5, 64, Math.min(.85 + t * .6, 1) * (1 - seg(t, 2.9, 3.4)), { track: lerp(.32, .42, t / d) });
  },
  convoy: (c, t, d) => { // street level: black sedans in the rain
    const w = M.world({ sky: 'storm', fog: { near: 60, far: 900, max: .85 } }); city(w, [STREET_X, 300], 650, { wa: .5 }); heroTower(w, () => '#ffc46a');
    lamps(w, STREET_X, 160, 520);
    for (let k = 0; k < 4; k++) car(w, STREET_X - 2.3, 345 - 19 * t + k * 14, -Math.PI / 2, { lights: 1 });
    const sh = shake(t, .03), cam = camAt([STREET_X + 2.2 + sh[0], 186 + t * 2.5, .85 + sh[2]], [STREET_X - .5, 420, 7], 44, 1.5); w.render(c, cam);
    lightningAt(c, t, [1.9], { x: .3, amount: .3 }); M.weather(c, 'rain', t, W, H, { count: 1100, seed: 9 }); bloom(c, .85); grade(c);
  },
  towerLow: (c, t, d, tt) => { // looking up the mafia tower; strings shoot out
    const w = M.world({ sky: 'storm', fog: { near: 300, far: 4000, max: .85 } }); city(w, BP, 900, { wa: .45 }); heroTower(w, z => z > .05 ? RED : null);
    strings(w, tt, { wpx: 2.2 });
    const cam = camAt([BP[0] - 170 - t * 6, BP[1] - 250, 4], [BP[0], BP[1], 175 + t * 8], 52, -3); w.render(c, cam);
    const tp = towerTop(); for (let k = 0; k < 3; k++) { const a = t * 1.3 + k * 2.1; beam(c, cam, tp, M.v3.norm([Math.cos(a), Math.sin(a), .55]), 1600, 70, RED, .22); }
    lightningAt(c, t, [.1], { x: .78, amount: .25 }); M.weather(c, 'rain', t, W, H, { count: 600, seed: 11 }); bloom(c, .8); grade(c, 'rgba(90,10,10,.2)');
  },
  towerWide: (c, t, d, tt) => { // orbit: strings land across the city
    const w = M.world({ sky: 'storm', fog: { near: 800, far: 6000, max: .8 } }); city(w, BP, 1800, { wa: .5 }); heroTower(w, z => z > .05 ? RED : null);
    strings(w, tt);
    const cam = camAt(M.moves.orbit(BP, 1150, 520, 222, 10, t / d).pos, [BP[0] + 40, BP[1] + 30, 70], 40); w.render(c, cam);
    const tp = towerTop(); for (let k = 0; k < 3; k++) { const a = tt * 1.3 + k * 2.1; beam(c, cam, tp, M.v3.norm([Math.cos(a), Math.sin(a), .5]), 2200, 90, RED, .2); }
    M.weather(c, 'rain', t, W, H, { count: 500, seed: 13 }); bloom(c, .8); grade(c, 'rgba(90,10,10,.2)');
  },
  streets: (c, t, d, tt) => { // high view: every street turns red
    const w = M.world({ sky: 'storm', fog: { near: 900, far: 7000, max: .8 } }); city(w, DT, 2000, { wa: .4 }); heroTower(w, z => z > .05 ? RED : null);
    const p = seg(t, 0, d * .9, 'outCubic'); ROADS.forEach((l, i) => w.line(l, { wm: 14, minPx: 1.5, color: RED, glow: 4, p: clamp(p * 1.3 - (i % 5) * .06), noFog: true, order: 8 }));
    LRT.forEach(l => w.line(l, { wm: 10, minPx: 1.4, color: '#ff5a3a', glow: 3, p, noFog: true, order: 8 })); strings(w, tt);
    const cam = camAt([BP[0] - 600 + t * 40, BP[1] - 1700, 1150 - t * 60], [BP[0] + 50, BP[1] + 100, 0], 42, 2); w.render(c, cam);
    M.weather(c, 'rain', t, W, H, { count: 400, seed: 15 }); bloom(c, .9); grade(c, 'rgba(90,10,10,.22)');
  },
  lone: (c, t, d) => { // a lone Calgarian on the Peace Bridge facing the red skyline
    if (t < .35) { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); return; }
    const w = M.world({ sky: 'stormRed', fog: { near: 300, far: 3000, max: .7 } }); city(w, [150, 450], 1700, { wa: .5 }); heroTower(w, z => z > .05 ? RED : null);
    peaceBridge(w, t, { noLights: true, maxY: PB[1] + 1.5 }); person(w, PB[0] + 2.1, PB[1] - .2, -1.134, { z0: 4, coat: true, scale: 1.05 });
    const q = seg(t, .35, d, 'linear'), cam = camAt([PB[0] - .6, PB[1] + 6.5 - q * 1.6, 4 + 1.05], [PB[0] + 330, PB[1] - 700, 60], 38); w.render(c, cam);
    const tp = towerTop(); beam(c, cam, tp, M.v3.norm([Math.cos(t * .9), Math.sin(t * .9), .45]), 2400, 90, RED, .16);
    M.weather(c, 'rain', t, W, H, { count: 900, seed: 21 }); bloom(c, .75); grade(c);
    c.fillStyle = `rgba(0,0,0,${1 - seg(t, .35, .9)})`; c.fillRect(0, 0, W, H);
  },
  rise: (c, t, d) => { // crane up: the city answers, thousands of lights converge
    const p = seg(t, 0, d, 'inOutCubic');
    const w = M.world({ sky: 'storm', fog: { near: 500, far: 6000, max: .8 } }); city(w, [150, 400], 2200, { wa: .5 }); heroTower(w, z => z > .05 ? RED : null);
    peaceBridge(w, t, { noLights: p < .15, maxY: PB[1] + 1.5 + p * 300 }); person(w, PB[0] + 2.1, PB[1] - .2, -1.134, { z0: 4, coat: true, scale: 1.05 });
    const r = M.rng(3); for (let k = 0; k < 46; k++) { const yy = PB[1] + 60 - ((r() * 140 + t * 1.4) % 130), xx = PB[0] + (r() - .5) * 4.2; if (yy > PB[1] - 5 + p * 70 || Math.abs(yy - PB[1]) < 2.5) continue; person(w, xx, yy, -Math.PI / 2, { z0: 4, phase: t * 6 + k, light: true, scale: .95 + r() * .1 }); }
    crowdLights(w, t, seg(t, .2, 1.4));
    const cam = camAt(M.mix([PB[0] - .6, PB[1] + 4.9, 5.05], [PB[0] - 240, PB[1] + 430, 260], p), M.mix([PB[0] + 330, PB[1] - 700, 60], [PB[0] + 560, PB[1] - 720, 0], p), 38); w.render(c, cam);
    M.weather(c, 'rain', t, W, H, { count: 700, seed: 23 }); bloom(c, .85); grade(c);
  },
  lineup: (c, t, d) => { // the mafia: silhouettes backlit by their cars
    const w = M.world({ sky: 'storm', fog: { near: 40, far: 700, max: .85 } }); city(w, [STREET_X, 300], 600, { wa: .45 }); lamps(w, STREET_X, 200, 420);
    car(w, STREET_X - 3, 312, -Math.PI / 2 - .25, { lights: 1 }); car(w, STREET_X + 3.2, 314, -Math.PI / 2 + .2, { lights: 1 });
    [-4, -2, 0, 2, 4].forEach((o, k) => person(w, STREET_X + o * .95, 304 - Math.abs(o) * .3, -Math.PI / 2, { coat: true, hat: true, scale: 1.04 }));
    const cam = camAt([STREET_X + .3, 286 + t * 1.5, 1.0], [STREET_X, 305, 1.7], 38); w.render(c, cam);
    M.weather(c, 'rain', t, W, H, { count: 1300, seed: 31 }); bloom(c, .9); grade(c);
  },
  blackout: (c, t, d) => { // the tower goes dark floor by floor
    const w = M.world({ sky: 'storm', fog: { near: 300, far: 4000, max: .85 } }); city(w, BP, 900, { wa: .45 }); const off = seg(t, .1, d * .85, 'inQuad');
    heroTower(w, z => z > 1 - off ? null : RED);
    const cam = camAt([BP[0] - 240, BP[1] - 330, 30], [BP[0], BP[1], 150 - t * 15], 48, 4); w.render(c, cam);
    const tp = [CEN[BPI][0], CEN[BPI][1], BPB.h * (1 - off)]; const sp = cam.project(tp); if (sp && off < 1) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sp.x, sp.y, 120, '#ffd0a0', .8); c.restore(); }
    M.weather(c, 'rain', t, W, H, { count: 600, seed: 33 }); M.weather(c, 'embers', t, W, H, { count: 90 }); bloom(c, .8); grade(c);
  },
  beacon: (c, t, d) => { // the Calgary Tower lights gold; searchlights swing up
    const w = M.world({ sky: 'storm', fog: { near: 300, far: 5000, max: .8 } }); city(w, CT, 1000, { wa: .55 }); heroTower(w, () => null);
    const ct = BLD[CTI]; w.box(ct.fp, ct.h - 12, { color: '#59606b', edge: '#8a7a5a', windows: null }); w.box(ct.fp.map(p => [CEN[CTI][0] + (p[0] - CEN[CTI][0]) * 1.8, CEN[CTI][1] + (p[1] - CEN[CTI][1]) * 1.8]), 12, { z0: ct.h - 12, color: '#3a3226', windows: GOLD, windowAlpha: .9 });
    crowdLights(w, t + 3, 1);
    const cam = M.camera({ pos: M.moves.orbit(CT, 340, 60, 230, 16, t / d).pos, look: [CT[0], CT[1], 112], fov: 52 }, W, H); w.render(c, cam);
    const top = [CEN[CTI][0], CEN[CTI][1], ct.h + 4], ign = seg(t, .05, .4); const sp = cam.project(top);
    if (sp) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sp.x, sp.y, 200 * ign, GOLD, .8); glow(c, sp.x, sp.y - 20, 60 * ign, '#fff1c0', 1); c.restore(); flare(c, sp.x, sp.y, 700 * ign, '#ffb860', .6); }
    for (let k = 0; k < 4; k++) { const a = k * 1.57 + t * .9; beam(c, cam, top, M.v3.norm([Math.cos(a) * .9, Math.sin(a) * .9, 1]), 3000, 120, GOLD, .28 * ign); }
    M.weather(c, 'rain', t, W, H, { count: 500, seed: 35 }); bloom(c, .9); grade(c, 'rgba(120,70,10,.15)');
  },
  flood: (c, t, d) => { // gold overtakes red across the whole downtown
    const p = seg(t, 0, d, 'inCubic'), w = M.world({ sky: 'storm', fog: { near: 900, far: 8000, max: .75 } }); city(w, DT, 2400, { wa: .55, win: '#ffd27a' }); heroTower(w, () => null);
    ROADS.forEach((l, i) => w.line(l, { wm: 16, minPx: 1.6, color: GOLD, glow: 5, p: clamp(.25 + t / d * 1.2 - (i % 4) * .05), noFog: true, order: 8 }));
    strings(w, 9, { fade: 1 - seg(t, 0, .7) }); crowdLights(w, t + 4, 1, { speed: 1.5 });
    const cam = camAt(M.mix([DT[0] - 1500, DT[1] - 2600, 900], [DT[0] - 300, DT[1] - 700, 260], p), [DT[0] + 150, DT[1] + 150, 60], 42, M.lerp(0, -6, p)); w.render(c, cam);
    M.weather(c, 'rain', t, W, H, { count: 400, seed: 37 }); bloom(c, 1); grade(c, 'rgba(120,70,10,.15)');
    c.fillStyle = `rgba(255,246,225,${seg(t, d - .35, d, 'inQuad')})`; c.fillRect(0, 0, W, H);
  },
  title: (c, t, d) => { // title: extruded metal type over the distant skyline
    const w = M.world({ sky: 'storm', fog: { near: 800, far: 7000, max: .9 } }); city(w, DT, 2200, { wa: .35, minH: 10 }); heroTower(w, z => z > .6 ? RED : null);
    const cam = camAt([DT[0] - 2600 + t * 25, DT[1] - 2100, 90], [DT[0], DT[1], 120], 32); w.render(c, cam);
    c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(0, 0, W, H); lightningAt(c, t, [.04, 2.9], { x: .2, amount: .35 }); smoke(c, t, .3);
    M.weather(c, 'rain', t, W, H, { count: 500, seed: 41 }); M.weather(c, 'embers', t, W, H, { count: 140 }); bloom(c, .6);
    const s1 = seg(t, .08, .45, 'outExpo'), s2 = seg(t, 1.12, 1.32, 'outExpo'), s3 = seg(t, 1.8, 2.15, 'outExpo'), dr = t * .04, sweep = seg(t, 2.2, 3.4, 'inOutSine');
    if (s1 > 0) title3D(c, 'a', 'CALGARIANS', W / 2, H * .36, 150, { scale: lerp(1.35, 1, s1) + dr * .2, alpha: s1, dx: .6 + Math.sin(t * .4) * .3, dy: 1.2, sweep });
    if (s2 > 0) ttext(c, 'VS', W / 2, H * .52, lerp(120, 70, s2), s2, { weight: 800, track: .2, glow: 'rgba(255,255,255,.6)' });
    if (s3 > 0) title3D(c, 'b', 'CORRUPT MAFIA', W / 2, H * .66, 130, { scale: lerp(1.35, 1, s3) + dr * .2, alpha: s3, dx: -.6 - Math.sin(t * .4) * .3, dy: 1.2, top: '#ffd2c8', mid: '#e2483d', low: '#6e0f0a', top2: '#ff8a7a', side: '#2a0806', glowCol: 'rgba(255,40,30,.5)', sweep: sweep > 0 ? clamp(sweep - .15) : null });
    ttext(c, 'A CALGARY INSIGHT ORIGINAL SERIES', W / 2, H * .79, 26, seg(t, 2.5, 3.2), { track: .45, weight: 500, blur: 10 });
    c.fillStyle = `rgba(255,246,225,${1 - seg(t, 0, .25)})`; c.fillRect(0, 0, W, H);
  },
  slate: (c, t, d) => { // coming soon
    c.fillStyle = '#03050a'; c.fillRect(0, 0, W, H); smoke(c, t + 8, .45, '#2a3240');
    const w = M.world({ sky: 'storm', drawSky: false, fog: { near: 800, far: 7000, max: .95 } }); city(w, DT, 1600, { wa: .25, minH: 25 }); heroTower(w, () => null);
    c.globalAlpha = .55; w.render(c, camAt([DT[0] - 2200, DT[1] - 2400, 40], [DT[0], DT[1], 140], 30)); c.globalAlpha = 1; M.weather(c, 'rain', t, W, H, { count: 300, seed: 43 });
    ttext(c, 'AN ORIGINAL SERIES', W / 2, H * .34, 30, seg(t, .1, .7), { track: .5, weight: 500 });
    title3D(c, 'c', 'COMING SOON', W / 2, H * .48, 110, { alpha: seg(t, .5, 1.1), scale: 1 + t * .01, sweep: seg(t, 1.2, 2.4), dx: .4, dy: 1 });
    const la = seg(t, 1.3, 2.0); if (la > 0 && window.LOGO) { c.save(); c.globalAlpha = la; c.drawImage(window.LOGO, W / 2 - 230, H * .62 - 34, 68, 68); c.restore(); ttext(c, 'calgaryinsight.ca', W / 2 + 40, H * .62, 44, la, { track: .08, weight: 700, glow: 'rgba(242,182,50,.5)' }); }
    bloom(c, .5);
  },
};

// ---------- edit ----------
// hard cuts inside a scene: list of [start, shot] (local time); tt = time since scene start (keeps strings continuous)
const multi = parts => (c, t, info) => { let k = 0; while (k < parts.length - 1 && t >= parts[k + 1][0]) k++; const [t0, name] = parts[k], t1 = k < parts.length - 1 ? parts[k + 1][0] : info.dur; shots[name](c, t - t0, t1 - t0, t);
  const since = t - t0; if (k > 0 && since < .07) { c.fillStyle = `rgba(255,250,240,${1 - since / .07})`; c.fillRect(0, 0, W, H); } };
const v2a = VO[2].t - 6.8, v2b = VO[3].t - 6.8 - .05, v2c = VO[4].t - 6.8 - .05;
const SC = [
  { name: 'storm', dur: 3.6, trans: { kind: 'flash', dur: .3, color: '#dfe8ff' } },
  { name: 'convoy', dur: 3.2, trans: { kind: 'whip', dur: .35 } },
  { dur: 3.8, draw: multi([[0, 'towerLow'], [v2b, 'towerWide'], [v2c, 'streets']]) },
  { name: 'lone', dur: 2.2, trans: { kind: 'match', dur: .2 } },
  { name: 'rise', dur: 3.4 },
  { dur: 5.2, draw: multi([[0, 'lineup'], [1.25, 'blackout'], [2.5, 'beacon'], [3.75, 'flood']]) },
  { name: 'title', dur: 4.6, trans: { kind: 'dissolve', dur: .6 } },
  { name: 'slate', dur: 5.1 },
];
const EVERY = [['EVERY CONTRACT.', 0], ['EVERY PERMIT.', 1], ['EVERY STREET.', 2]];
const S2T = [v2a, v2b, v2c];
let acc = 0; SC.forEach(s => { s.start = acc; acc += s.dur; });

window.FILM = M.film({ W, H, fps: 30, identity: 'storyteller', look: { letterbox: 2.39, grain: .07, vignette: .6 }, letterbox: () => 1,
  scenes: SC.map(s => ({ dur: s.dur, trans: s.trans, draw: (c, t, info) => {
    if (s.draw) s.draw(c, t, { dur: s.dur }); else shots[s.name](c, t, s.dur, t);
    if (s === SC[2]) EVERY.forEach(([txt, k]) => { const a0 = S2T[k] + .05, a1 = k < 2 ? S2T[k + 1] : s.dur; const a = seg(t, a0, a0 + .12) * (1 - seg(t, a1 - .1, a1)); if (a > 0) ttext(c, txt, W / 2, H * .5, lerp(84, 76, seg(t, a0, a1, 'linear')), a, { track: .28, weight: 700, glow: 'rgba(255,60,40,.7)' }); });
    if (s === SC[4]) ttext(c, "CALGARIANS DON'T SELL.", W / 2, H * .5, 78, seg(t, VO[6].t - 12.8 + .1, VO[6].t - 12.8 + .4) * (1 - seg(t, s.dur - .25, s.dur)), { track: .28, weight: 700, glow: 'rgba(255,190,90,.7)' });
    if (s === SC[5]) ttext(c, 'THIS WINTER', W / 2, H * .5, 80, seg(t, 2.55, 2.75) * (1 - seg(t, 3.6, 3.75)), { track: .35, weight: 700, glow: 'rgba(255,190,90,.7)' });
  } })),
  overlay: (c, t, info) => {
    const bar = (H - W / 2.39) / 2;
    if (t > 3.6 && info.index < 6 && window.LOGO) { c.globalAlpha = .85; c.drawImage(window.LOGO, 40, bar / 2 - 22, 44, 44); M.text(c, 'CALGARY INSIGHT  ·  ORIGINS', 98, bar / 2, { size: 20, base: 'middle', weight: 600, color: '#cfd6df', tracking: .12, shadow: false }); c.globalAlpha = 1; }
    const cap = captionAt(t); if (cap) { c.save(); c.font = M.font(32, 600); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#e8edf3'; c.fillText(cap, W / 2, H - bar / 2); c.restore(); }
    if (info.index === 0 || info.index === 2 || (info.index === 5 && t > SC[5].start + 3.75)) M.source(c, 'Map data © OpenStreetMap contributors · City of Calgary Open Data', W - 40 - 560, H - bar - 16, { size: 16 });
  } });
window.SC = SC;
