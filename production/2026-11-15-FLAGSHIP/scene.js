/* 2026-11-15 FLAGSHIP: "Almost Fort Brisebois: Why It's Called Calgary".
 * Lead identity: Storyteller (dusk/night drones over real OSM/City geometry, 1875 scenes drawn without modern roads or towers,
 * dissolves through time, letterbox on wide drone scenes). Borrowed: Data Explainer kinetic hook, stamps and counter (S0, S3, S5, S13);
 * Civic Analyst document card and evidence cards (S6, S10).
 * One file, three cuts (+ thumbnails with --param thumb=1):
 *   Short (1080x1920):  python3 ../../motion/engine/render.py scene.js short.mp4  --geo ../../motion/geo/calgary_base.json --param cut=short
 *   Widescreen film:    python3 ../../motion/engine/render.py scene.js wide.mp4   --geo ../../motion/geo/calgary_base.json --param cut=wide
 *   Teaser (1080x1920): python3 ../../motion/engine/render.py scene.js teaser.mp4 --geo ../../motion/geo/calgary_base.json --param cut=teaser
 * ne_world.json (Natural Earth 1:50m countries, public domain, simplified) must sit beside this file (--assets defaults to its folder).
 * Every year, name and label on screen maps to the audited claims table in packages/2026-11-15-FLAGSHIP-why-its-called-calgary.md (C#). */
const PR = window.PARAMS || {}, CUT = PR.cut || 'short', THUMB = !!PR.thumb;
const WIDE = CUT === 'wide';
const W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920;
const CX = WIDE ? W / 2 : (W - 120) / 2 + 30;
const L = WIDE ? { hookY: THUMB ? 250 : 270, hook: THUMB ? 150 : 120, kick: THUMB ? 50 : 40, stampY: 190, chipY: 330, name: 96, chip: 44, src: [48, H - 40], fov: 44, q: 58 }
               : { hookY: 470, hook: 128, kick: 48, stampY: 380, chipY: 560, name: 112, chip: 50, src: [60, 1462], fov: 60, q: 72 };

// measured Kokoro line durations (studio-probe run of 2026-11-15, af_heart)
const VD = [2.347, 6.272, 2.176, 7.36, 2.923, 7.616, 6.229, 6.4, 5.099, 7.872, 6.805, 5.845, 4.544, 2.731, 3.340];   // L14 tightened with atempo 1.2 (3.989 s → 3.340 s) so the ending stays ≤ 4 s
const TD = [8.192, 7.573, 5.419];
const LINES = {
  L0: "Calgary was almost called Fort Brisebois.",
  L1: "In eighteen seventy-five, the North-West Mounted Police built a fort where the Elbow River meets the Bow.",
  L2: "At first, it was simply called The Elbow.",
  L3: "By January eighteen seventy-six, the officer in charge, Inspector Éphrem Brisebois, had named it after himself.",
  L4: "His men and the local settlers disliked the name.",
  L5: "Assistant Commissioner Acheson Irvine cancelled the order. On February twenty-ninth, eighteen seventy-six, he wrote to Ottawa.",
  L6: "Colonel Macleod, he wrote, had supported the name of Calgary, which Irvine believed meant clear running water.",
  L7: "James Macleod took the name from one of his favourite places: Calgary, on the Isle of Mull, in Scotland.",
  L8: "It's a broad, sandy bay on the island's west coast, with a castle on the hillside above it.",
  L9: "And the meaning? Guides to Mull translate the Gaelic name as beach of the meadow, or the meadow beside the bay. Not clear running water.",
  L10: "A popular story says crofters cleared from Mull carried the name to Canada. The record points to Macleod instead.",
  L11: "Ottawa approved the name, and it was confirmed that April. That August, Brisebois quit the force.",
  L12: "There's no Fort Brisebois today. But northwest Calgary has a Brisebois Drive.",
  L13: "A hundred and fifty years later, the name has stuck.",
  L14: "Calgary, or Fort Brisebois: which would you pick? Drop your thoughts below.",
  T0: "Calgary was almost called Fort Brisebois.",
  T1: "By early eighteen seventy-six, the officer in charge had named the new fort after himself. The Mounted Police cancelled the order.",
  T2: "Instead, Colonel James Macleod put forward a name from one of his favourite places: a sandy bay on Scotland's Isle of Mull.",
  T3: "Full video on our page. Calgary, or Brisebois: which would you pick? Drop your thoughts below.",
};
const DUR = id => id[0] === 'L' ? VD[+id.slice(1)] : (id === 'T0' ? VD[0] : TD[+id.slice(1) - 1]);
const ORDER = { wide: ['L0','L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11','L12','L13','L14'],
                short: ['L0','L1','L2','L3','L5','L6','L7','L8','L9','L11','L13','L14'],
                teaser: ['T0','T1','T2','T3'] }[CUT];
const S = M.script(ORDER.map(id => ({ text: LINES[id], dur: DUR(id), gapAfter: id === 'L8' ? .8 : undefined })),
                   { lead: .3, gap: CUT === 'teaser' ? .35 : .4, tail: CUT === 'teaser' ? 1.0 : .65 });
const sc = S.scenes;

// ---------- places (continuity bible) ----------
const FORT = M.geo.lm('Fort Calgary') || [1838, 62, 0];            // CONFLUENCE-1875 (C2, C18)
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const NEC = 'Natural Earth · simplified coastline';
const RED = '#e2483d', GOLD = M.house.gold, CREAM = '#f7f4ec', RIVER = '#5aa9e6';
const OLD = { land: '#4a5a3c', park: '#4a5a3c', water: '#4a86b8', building: '#5a6270', road: '#4a5a3c', motorway: '#4a5a3c', community: '#ffffff' };   // 1875: no roads, no towers
const NIGHT = { land: '#121821', park: '#16221a', water: '#14304f', building: '#283140', road: '#454a54', motorway: '#6f6044', community: '#9fb0c8' };
const DUSK = { land: '#2e3138', park: '#2b3a30', water: '#2c5378', building: '#5a6270', road: '#6e675c', motorway: '#8a7a5c', community: '#ffffff' };
const LL = { calgary: [51.045, -114.06], ottawa: [45.42, -75.70], bay: [56.5692, -6.301] };

let NE = null, ELBOW = [], BOW = [];
window.PRELOAD = async () => {
  try { const x = new XMLHttpRequest(); x.open('GET', 'ne_world.json', false); x.send(); NE = JSON.parse(x.responseText); } catch (e) { NE = null; }
  ELBOW = M.geo.riverPath('Elbow River', FORT, 2600); BOW = M.geo.riverPath('Bow River', FORT, 3200);
};

// ---------- helpers ----------
const base = (sky, colors, o = {}) => { const w = M.world({ sky, fog: o.fog || { near: 3000, far: 26000, max: .55 } });
  M.geo.addBase(w, Object.assign({ buildings: false, roads: false, colors, riverW: 70 }, o.base || {})); return w; };
const modern = (sky, colors) => { const w = M.world({ sky, fog: { near: 3000, far: 26000, max: .55 } });
  M.geo.addBase(w, { buildings: true, colors, windows: '#ffd27a', windowAlpha: sky === 'night' ? .6 : .4 }); return w; };
// schematic log palisade (square, ~60 m) at the fort site; labelled "illustration" where it is the subject (C2)
const fort = (w, k = 1, big = 1) => w.at(FORT, (c, sp) => { const z = Math.max(46, Math.min(240, sp.k * 160)) * big; fortIcon(c, sp.x, sp.y, z, k); });
// schematic log palisade seen from above at an angle: a square of pointed logs with two buildings and a flag (illustration)
function fortIcon(c, x, y, z, a = 1) {
  c.save(); c.globalAlpha *= a; c.translate(x, y); const hw = z * .5, hh = z * .26, ht = z * .16;
  c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(z * .06, z * .05, hw * 1.1, hh * 1.15, 0, 0, 7); c.fill();
  c.fillStyle = '#6f8a55'; c.beginPath(); c.moveTo(-hw, 0); c.lineTo(0, -hh); c.lineTo(hw, 0); c.lineTo(0, hh); c.closePath(); c.fill();
  c.fillStyle = '#7a5236'; c.fillRect(-hw * .35, -hh * .35 - ht * .8, hw * .5, ht * .8); c.fillStyle = '#5a3e2b'; c.fillRect(hw * .05, -hh * .1 - ht * .7, hw * .45, ht * .7);
  const wall = (x0, y0, x1, y1, col) => { const n = 9; for (let i = 0; i < n; i++) { const u = i / n, v = (i + 1) / n, ax = M.lerp(x0, x1, u), ay = M.lerp(y0, y1, u), bx = M.lerp(x0, x1, v), by = M.lerp(y0, y1, v);
    c.fillStyle = i % 2 ? col : M.shade ? M.shade(col, -.08) : col; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.lineTo(bx, by - ht); c.lineTo((ax + bx) / 2, (ay + by) / 2 - ht * 1.35); c.lineTo(ax, ay - ht); c.closePath(); c.fill(); } };
  wall(-hw, 0, 0, -hh, '#8d6346'); wall(0, -hh, hw, 0, '#7a5236'); wall(-hw, 0, 0, hh, '#b07e55'); wall(0, hh, hw, 0, '#9b6f48');
  c.strokeStyle = '#3a2a1c'; c.lineWidth = Math.max(2, z * .012); c.beginPath(); c.moveTo(hw * .55, -hh * .2); c.lineTo(hw * .55, -hh * .2 - z * .42); c.stroke();
  c.fillStyle = '#c1121f'; c.fillRect(hw * .55, -hh * .2 - z * .42, z * .16, z * .09); c.restore(); }
const band = (c, y0, y1, a = .7) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.2, `rgba(7,13,24,${a})`); g.addColorStop(.8, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const stamp = (c, s, t, t0, x = CX, y = L.stampY, size, fade = 1, col = GOLD) => { const k = M.seg(t, t0, t0 + .35, 'outBack'); if (k <= 0 || fade <= 0) return; size = size || (WIDE ? 100 : 118);
  c.save(); c.translate(x, y); c.rotate(-.05); const s2 = M.lerp(1.8, 1, k); c.scale(s2, s2); c.globalAlpha = Math.min(1, k * 1.5) * fade;
  c.font = M.font(size, 800); const tw = c.measureText(s).width; M.rr(c, -tw / 2 - 34, -size * .62, tw + 68, size * 1.24, 22); c.fillStyle = 'rgba(7,13,24,.85)'; c.fill(); c.lineWidth = 8; c.strokeStyle = col; c.stroke();
  M.text(c, s, 0, -size * .52, { size, weight: 800, align: 'center', color: col === RED ? '#ffd9d5' : '#fff' }); c.restore(); };
const src = (c, s) => M.source(c, s, L.src[0], L.src[1], { size: 20, maxW: WIDE ? 1500 : 860 });
const srcMap = (c, s, credit = MAPC) => { M.source(c, credit, L.src[0], L.src[1] - 36, { size: 20 }); if (s) src(c, s); };
const cam = o => M.camera(Object.assign({ fov: L.fov }, o), W, H);
const illus = (c, y) => M.text(c, 'illustration', WIDE ? W - 60 : W - 150, y || (WIDE ? H - 120 : 1400), { size: 22, weight: 500, align: 'right', color: '#c9d3e0' });
const strike = (c, x0, x1, y, p, col = RED, lw = 12) => { if (p <= 0) return; c.save(); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y); c.lineTo(M.lerp(x0, x1, p), y + (M.lerp(x0, x1, p) - x0) * -.04); c.stroke(); c.restore(); };
const navyBg = (c, a = '#0b1f3a', b = '#070d18') => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, H); };

// the headline in the thumbnail's design (frame 0 = thumbnail): kicker, ALMOST FORT / BRISEBOIS, red strike after the line
function headline(c, t, struck) {
  const k = M.seg(t, 0, .45, 'outBack'), s = M.lerp(1.1, 1, k);
  band(c, WIDE ? 70 : 290, WIDE ? 600 : 1010, .66);
  c.save(); c.translate(CX, L.hookY); c.scale(s, s);
  M.chip(c, "WHY IT'S CALLED CALGARY", 0, -(WIDE ? 120 : 160), { align: 'center', size: L.kick, bg: '#ffffff', color: '#0b1f3a' });
  M.text(c, 'ALMOST FORT', 0, 0, { size: L.hook, weight: 800, align: 'center' });
  const by = L.hook * 1.08, bs = L.hook * 1.22; M.text(c, 'BRISEBOIS', 0, by, { size: bs, weight: 800, align: 'center', color: GOLD });
  c.font = M.font(bs, 800); const bw = c.measureText('BRISEBOIS').width;
  strike(c, -bw / 2 - 20, bw / 2 + 20, by + bs * .55, struck, RED, WIDE ? 14 : 16);
  c.restore();
}
// flat Natural Earth map: view = {lat, lon, k (px per degree of latitude)}
function flatMap(c, v, o = {}) {
  c.fillStyle = '#0a1a33'; c.fillRect(0, 0, W, H);
  const cl = Math.cos(55 * Math.PI / 180), P = (lat, lon) => [W / 2 + (lon - v.lon) * cl * v.k, H / 2 - (lat - v.lat) * v.k];
  // graticule
  c.strokeStyle = 'rgba(159,176,200,.12)'; c.lineWidth = 1.5;
  for (let lo = -180; lo <= 180; lo += 10) { const [x] = P(0, lo); if (x > -10 && x < W + 10) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } }
  for (let la = 0; la <= 90; la += 10) { const [, y] = P(la, 0); if (y > -10 && y < H + 10) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } }
  if (NE) for (const [name, rings] of Object.entries(NE)) {
    const hi = o.hi && o.hi.includes(name);
    rings.forEach(r => { c.beginPath(); r.forEach(([lon, lat], i) => { const [x, y] = P(lat, lon); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath();
      c.fillStyle = hi ? '#28466e' : '#1d3557'; c.fill(); c.strokeStyle = hi ? 'rgba(242,182,50,.7)' : 'rgba(159,176,200,.45)'; c.lineWidth = hi ? 2.5 : 1.5; c.stroke(); });
  }
  // north arrow
  const nx = WIDE ? W - 80 : W - 190, ny = WIDE ? 150 : 330; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(nx, ny - 26); c.lineTo(nx + 12, ny + 8); c.lineTo(nx - 12, ny + 8); c.closePath(); c.fill();
  M.text(c, 'N', nx, ny + 14, { size: 24, weight: 700, align: 'center' });
  return P;
}
const dot = (c, x, y, r, col, lab, o = {}) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.stroke();
  if (lab) M.text(c, lab, x + (o.dx ?? 0), y + (o.dy ?? 22), { size: o.size || (WIDE ? 34 : 40), weight: 700, align: o.align || 'center', stroke: 6, strokeColor: '#06101f', alpha: o.alpha ?? 1 }); };
const arc = (c, a, b, p, col = GOLD, lift = .25, lw = 7) => { if (p <= 0) return; const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - Math.hypot(b[0] - a[0], b[1] - a[1]) * lift;
  c.save(); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.setLineDash([18, 12]); c.beginPath(); const n = 40;
  for (let i = 0; i <= n * p; i++) { const u = i / n, x = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], y = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * my + u * u * b[1]; i ? c.lineTo(x, y) : c.moveTo(x, y); }
  c.stroke(); c.restore(); const u = Math.min(1, p); return [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * my + u * u * b[1]]; };
const letter = (c, x, y, s = 1) => { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = CREAM; c.fillRect(-34, -24, 68, 48); c.strokeStyle = '#8a7a5c'; c.lineWidth = 3; c.strokeRect(-34, -24, 68, 48);
  c.beginPath(); c.moveTo(-34, -24); c.lineTo(0, 4); c.lineTo(34, -24); c.stroke(); c.restore(); };
// wooden gate sign, letters painted left to right with progress p (illustration)
function sign(c, x, y, w, p, o = {}) {
  const h = w * .2; c.save(); c.translate(x, y); c.rotate(o.tilt || -.015);
  c.fillStyle = '#4b3423'; c.fillRect(-w * .42, -h * .5 - 140, 22, 140); c.fillRect(w * .42 - 22, -h * .5 - 140, 22, 140);
  const g = c.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#9b6f48'); g.addColorStop(1, '#6f4a2e'); c.fillStyle = g; M.rr(c, -w / 2, -h / 2, w, h, 10); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(-w / 2, -h / 2 + i * h / 4); c.lineTo(w / 2, -h / 2 + i * h / 4); c.stroke(); }
  c.font = M.font(h * .52, 800); const s = 'FORT BRISEBOIS', tw = c.measureText(s).width;
  c.save(); c.beginPath(); c.rect(-tw / 2 - 10, -h / 2, (tw + 20) * M.seg(p, 0, 1), h); c.clip(); c.fillStyle = '#f1e6cf'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 0, 4); c.restore();
  if (p > 0 && p < 1) { const bx = -tw / 2 + tw * p; c.fillStyle = '#3a2a1c'; c.fillRect(bx - 6, -h * .1, 70, 14); c.fillStyle = '#f1e6cf'; c.fillRect(bx - 18, -h * .14, 18, 22); }
  c.restore(); return h;
}
const cancelStamp = (c, x, y, k) => { if (k <= 0) return; const sz = WIDE ? 100 : 96; c.save(); c.translate(x, y); c.rotate(-.08); c.scale(M.lerp(1.8, 1, k), M.lerp(1.8, 1, k)); c.globalAlpha = Math.min(1, k * 1.4);
  c.font = M.font(sz, 800); const tw = Math.min(c.measureText('ORDER CANCELLED').width, W - 200); M.rr(c, -tw / 2 - 30, -sz * .75, tw + 60, sz * 1.5, 16); c.fillStyle = 'rgba(250,240,236,.94)'; c.fill(); c.lineWidth = 10; c.strokeStyle = RED; c.stroke();
  M.text(c, 'ORDER CANCELLED', 0, -sz * .55, { size: sz, weight: 800, align: 'center', color: RED, shadow: false, maxW: W - 200 }); c.restore(); };
// palisade wall seen from the side at dusk (illustration backdrop for the sign scenes)
function palisade(c, gy, t) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#16233f'); g.addColorStop(.45, '#5b4a6e'); g.addColorStop(.62, '#e39a5c'); g.addColorStop(.63, '#2c2a26'); g.addColorStop(1, '#1b1a17'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const r = M.rng(5), lw = WIDE ? 46 : 52; for (let x = -20; x < W + 40; x += lw) { const hh = (WIDE ? 330 : 420) + r() * 40, drift = Math.sin(t * .3) * 6;
    c.fillStyle = '#5a3e2b'; c.fillRect(x + drift, gy - hh, lw - 6, hh); c.fillStyle = '#6e4d36'; c.fillRect(x + drift + 6, gy - hh, 10, hh);
    c.fillStyle = '#5a3e2b'; c.beginPath(); c.moveTo(x + drift, gy - hh); c.lineTo(x + drift + (lw - 6) / 2, gy - hh - 26); c.lineTo(x + drift + lw - 6, gy - hh); c.fill(); }
  c.fillStyle = 'rgba(10,8,6,.35)'; c.fillRect(0, gy, W, H - gy);
}
// Calgary Bay, Mull (illustration): sea, pale crescent beach, low hills, castellated house on the east (right) hillside
function bay(c, t, d) {
  const pan = M.seg(t, 0, d, 'inOutSine'), ox = M.lerp(0, WIDE ? -120 : -160, pan);
  const sky = c.createLinearGradient(0, 0, 0, H * .55); sky.addColorStop(0, '#2d4f7c'); sky.addColorStop(.7, '#e9b77c'); sky.addColorStop(1, '#f4d8a8'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
  const hz = H * (WIDE ? .46 : .5);
  // far hills
  c.fillStyle = '#5d6f6a'; c.beginPath(); c.moveTo(0, hz); for (let x = 0; x <= W; x += 40) c.lineTo(x, hz - 40 - 30 * Math.sin(x / 260 + 1)); c.lineTo(W, hz); c.fill();
  // sea
  const sea = c.createLinearGradient(0, hz, 0, H); sea.addColorStop(0, '#5f8fae'); sea.addColorStop(1, '#2b6f86'); c.fillStyle = sea; c.fillRect(0, hz, W, H - hz);
  // left and right headlands (parallax)
  c.save(); c.translate(ox * .6, 0);
  c.fillStyle = '#3f5f3a'; c.beginPath(); c.moveTo(-200, hz - 10); c.quadraticCurveTo(W * .2, hz - 180, W * .32, hz + 40); c.lineTo(-200, H); c.fill();
  c.beginPath(); c.moveTo(W + 300, hz - 30); c.quadraticCurveTo(W * .82, hz - 260, W * .66, hz + 60); c.lineTo(W + 300, H); c.fill();
  // castle on the east hillside
  const kx = W * .84, ky = hz - 150; c.fillStyle = '#9aa0a6'; c.fillRect(kx - 70, ky, 140, 70); c.fillRect(kx - 86, ky - 30, 30, 100); c.fillRect(kx + 56, ky - 30, 30, 100);
  c.fillStyle = '#7d848b'; for (let i = 0; i < 6; i++) c.fillRect(kx - 66 + i * 24, ky - 12, 14, 12); c.fillStyle = '#ffd27a'; c.fillRect(kx - 40, ky + 24, 16, 22); c.fillRect(kx + 20, ky + 24, 16, 22);
  c.restore();
  // beach crescent + waves
  c.save(); c.translate(ox, 0); const by = H * (WIDE ? .78 : .74);
  c.fillStyle = '#efe4c8'; c.beginPath(); c.moveTo(W * .12, by - 40); c.quadraticCurveTo(W * .5, by + 120, W * .9, by - 50); c.lineTo(W * 1.1, H); c.lineTo(-W * .1, H); c.fill();
  c.fillStyle = '#7ea05f'; c.beginPath(); c.moveTo(-W * .1, by + 140); c.quadraticCurveTo(W * .5, by + 260, W * 1.1, by + 130); c.lineTo(W * 1.1, H); c.lineTo(-W * .1, H); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 4; for (let i = 0; i < 3; i++) { const ph = (t * .35 + i / 3) % 1, yy = by - 60 + ph * 50; c.globalAlpha = 1 - ph; c.beginPath(); c.moveTo(W * .18, yy); c.quadraticCurveTo(W * .5, yy + 110 + ph * 20, W * .84, yy - 6); c.stroke(); }
  c.restore(); c.globalAlpha = 1;
  return { kx: W * .84 + ox * .6, ky: hz - 150, bx: W * .5 + ox, by };
}

// ---------- scenes by line id ----------
const D = {
  // HOOK (C1): dusk drone push-in over the confluence, palisade at the fort site, headline; BRISEBOIS struck after it is spoken
  L0: (c, t, d) => {
    const w = base('dusk', OLD); fort(w, 1, 1.7); M.ping(w, FORT, t, { r: 120 });
    const p = M.seg(t, 0, d, 'outCubic');
    w.render(c, cam({ pos: [FORT[0] + M.lerp(-1300, -650, p), FORT[1] + M.lerp(-2300, -1250, p), M.lerp(1100, 560, p)], look: [FORT[0], FORT[1] + (WIDE ? 650 : 380), 0] }));
    headline(c, t, THUMB ? 1 : M.seg(t, 2.35, 2.75, 'outCubic'));
  },
  // 1875, WHERE (C2): map dive onto the confluence; Bow and Elbow light up; fort pin
  L1: (c, t, d) => {
    const w = base('dusk', OLD); w.line(BOW, { wm: 110, color: RIVER, p: M.seg(t, .5, 2.0), order: 8, glow: 4, noFog: true, minPx: 4 });
    w.line(ELBOW, { wm: 90, color: '#8fd0ff', p: M.seg(t, 1.6, 3.0), order: 8, glow: 4, noFog: true, minPx: 4 }); fort(w);
    M.label(w, [FORT[0] - 1500, FORT[1] + 900, 0], 'Bow River', { size: WIDE ? 34 : 40, color: '#cfe8ff', alpha: M.seg(t, 2.0, 2.4) });
    M.label(w, [FORT[0] + 300, FORT[1] - 1700, 0], 'Elbow River', { size: WIDE ? 34 : 40, color: '#cfe8ff', alpha: M.seg(t, 3.0, 3.4) });
    M.pin(w, FORT, 'NWMP fort', { p: M.seg(t, 3.6, 4.2, 'linear'), size: WIDE ? 40 : 46, scale: 1.2 }); M.ping(w, FORT, t - 3.6);
    w.render(c, cam(M.moves.dive([FORT[0], FORT[1] - 200, 0], M.seg(t, 0, d, 'outCubic'), { h0: 9000, h1: 2600, back0: 1, back1: 1800, ahead: 100 })));
    stamp(c, '1875', t, .15, WIDE ? W - 420 : CX);
    M.chip(c, 'NORTH-WEST MOUNTED POLICE', WIDE ? W - 420 : CX, WIDE ? 290 : L.chipY - 40, { align: 'center', size: WIDE ? 40 : 46, bg: '#ffffff', alpha: M.seg(t, 1.0, 1.4) });
    srcMap(c, 'Source: Galt Museum & Archives · Legion Magazine');
  },
  // "THE ELBOW" (C3): the Elbow's last bend traces gold into the Bow; slow orbit
  L2: (c, t, d) => {
    const w = base('dusk', OLD); fort(w); w.line(BOW, { wm: 100, color: RIVER, order: 8, noFog: true, minPx: 3 });
    w.line(ELBOW, { wm: 120, color: GOLD, p: M.seg(t, .1, 1.6, 'inOutCubic'), order: 9, glow: 6, noFog: true, minPx: 5 });
    w.render(c, cam(M.moves.orbit([FORT[0], FORT[1] - 600, 0], 3600, 2600, 250, 20, M.seg(t, 0, d, 'linear'))));
    band(c, WIDE ? 110 : 330, WIDE ? 420 : 760, .6);
    M.text(c, '“THE ELBOW”', CX, WIDE ? 200 : 470, { size: WIDE ? 120 : 128, weight: 800, align: 'center', color: GOLD, alpha: M.seg(t, .3, .7) });
    M.text(c, 'its first name', CX, WIDE ? 340 : 630, { size: WIDE ? 44 : 52, weight: 600, align: 'center', alpha: M.seg(t, .7, 1.1) });
    srcMap(c, 'Source: City of Calgary Newsroom (City of Calgary Archives)');
  },
  // FORT BRISEBOIS (C4, C5): palisade at dusk, the sign is painted; stamp JANUARY 1876; who and why
  L3: (c, t, d) => {
    const gy = WIDE ? 860 : 1300; palisade(c, gy, t);
    const push = M.lerp(1, 1.06, M.seg(t, 0, d)); c.save(); c.translate(CX, gy - (WIDE ? 200 : 250)); c.scale(push, push); sign(c, 0, 0, WIDE ? 900 : 860, M.seg(t, 1.0, 3.6)); c.restore();
    band(c, WIDE ? 20 : 230, WIDE ? 420 : 880, .75);
    stamp(c, 'JANUARY 1876', t, .1, CX, WIDE ? 110 : 330, WIDE ? 80 : 92);
    const na = M.seg(t, 3.0, 3.4);
    M.text(c, 'INSPECTOR', CX, WIDE ? 180 : 420, { size: WIDE ? 44 : 54, weight: 700, align: 'center', color: '#dfe7f2', alpha: na });
    M.text(c, WIDE ? 'ÉPHREM BRISEBOIS' : 'ÉPHREM', CX, WIDE ? 230 : 480, { size: WIDE ? 96 : 110, weight: 800, align: 'center', alpha: na });
    if (!WIDE) M.text(c, 'BRISEBOIS', CX, 600, { size: 110, weight: 800, align: 'center', color: GOLD, alpha: na });
    M.chip(c, 'OFFICER IN CHARGE', CX, WIDE ? 345 : 745, { align: 'center', size: L.chip, bg: '#ffffff', alpha: M.seg(t, 3.6, 4.0) * (1 - M.seg(t, 5.4, 5.6)) });
    M.chip(c, 'NAMED IT AFTER HIMSELF', CX, WIDE ? 345 : 745, { align: 'center', size: L.chip, alpha: M.seg(t, 5.6, 5.9) });
    illus(c, WIDE ? gy + 40 : gy + 40); src(c, 'Source: City of Calgary Newsroom · Legion Magazine');
  },
  // DISLIKED (C6): orbit round the fort; two chips go red
  L4: (c, t, d) => {
    const w = base('dusk', OLD); fort(w); w.render(c, cam(M.moves.orbit(FORT, 900, 420, 200, 40, M.seg(t, 0, d, 'linear'))));
    band(c, 120, 560, .7);
    M.chip(c, 'HIS MEN', CX - 260, 200, { align: 'center', size: 50, bg: M.seg(t, 1.2, 1.4) > 0 ? RED : '#ffffff', color: M.seg(t, 1.2, 1.4) > 0 ? '#fff' : '#0b1f3a', alpha: M.seg(t, .1, .4) });
    M.chip(c, 'LOCAL SETTLERS', CX + 260, 200, { align: 'center', size: 50, bg: M.seg(t, 1.5, 1.7) > 0 ? RED : '#ffffff', color: M.seg(t, 1.5, 1.7) > 0 ? '#fff' : '#0b1f3a', alpha: M.seg(t, .4, .7) });
    M.text(c, 'DISLIKED THE NAME', CX, 340, { size: 96, weight: 800, align: 'center', alpha: M.seg(t, 1.6, 2.0) });
    srcMap(c, 'Source: Galt Museum & Archives');
  },
  // CANCELLED → OTTAWA (C7, C8): stamp on the sign, then the letter's route across Canada
  L5: (c, t, d) => {
    const sw = 3.4;
    if (t < sw + .5) { const gy = WIDE ? 860 : 1300; palisade(c, gy, t + 6); c.save(); c.translate(CX, gy - (WIDE ? 230 : 330)); sign(c, 0, 0, WIDE ? 900 : 860, 1); c.restore();
      cancelStamp(c, CX, gy - (WIDE ? 230 : 330), M.seg(t, .25, .6, 'outBack'));
      band(c, WIDE ? 40 : 250, WIDE ? 330 : 720, .7);
      M.text(c, 'ASSISTANT COMMISSIONER', CX, WIDE ? 120 : 380, { size: WIDE ? 56 : 60, weight: 800, align: 'center', alpha: M.seg(t, .8, 1.2) });
      M.text(c, 'A.G. IRVINE', CX, WIDE ? 190 : 460, { size: L.name, weight: 800, align: 'center', color: GOLD, alpha: M.seg(t, 1.0, 1.4) });
      illus(c, gy + 40); src(c, 'Source: City of Calgary Newsroom · Legion Magazine');
      if (t > sw) { c.fillStyle = `rgba(255,255,255,${M.seg(t, sw, sw + .15) * (1 - M.seg(t, sw + .15, sw + .5))})`; c.fillRect(0, 0, W, H); }
      if (t < sw + .15) return; }
    const u = M.seg(t, sw + .1, d, 'inOutSine'), v = { lat: M.lerp(52, 50, u), lon: M.lerp(-100, -95, u), k: WIDE ? M.lerp(30, 26, u) : M.lerp(30, 24, u) };
    const P = flatMap(c, v, { hi: ['Canada'] }); const a = P(...LL.calgary), b = P(...LL.ottawa);
    const tip = arc(c, a, b, M.seg(t, sw + .6, sw + 3.0, 'inOutCubic'));
    dot(c, a[0], a[1], 14, GOLD, 'Calgary', { dy: 22 }); if (tip && t > sw + .6) letter(c, tip[0], tip[1], WIDE ? 1 : 1.2);
    dot(c, b[0], b[1], 14, '#ffffff', 'Ottawa', { dy: 22, alpha: M.seg(t, sw + 2.6, sw + 3.0) });
    if (!THUMB && t > sw + .3) { if (window.LOGO) {} }
    stamp(c, 'FEB. 29, 1876', t, sw + .3, CX, WIDE ? 170 : 420, WIDE ? 90 : 100);
    M.chip(c, 'IRVINE WRITES TO OTTAWA', CX, WIDE ? 270 : 540, { align: 'center', size: L.chip, bg: '#ffffff', alpha: M.seg(t, sw + 1.0, sw + 1.4) });
    srcMap(c, 'Source: City of Calgary Newsroom (City of Calgary Archives)', NEC);
  },
  // THE LETTER (C9): document card, the exact words highlighted
  L6: (c, t, d) => {
    navyBg(c); const pw = WIDE ? 1400 : 900, ph = WIDE ? 640 : 740, x = CX - pw / 2, y0 = WIDE ? 110 : 250;
    const k = M.ease.outCubic(M.seg(t, 0, .5)), push = M.lerp(1, 1.04, M.seg(t, 0, d));
    c.save(); c.translate(CX, y0 + ph / 2); c.scale(push, push); c.translate(-CX, -(y0 + ph / 2)); c.globalAlpha = k;
    const y = y0 + (1 - k) * 60; M.rr(c, x, y, pw, ph, 18); c.fillStyle = CREAM; c.fill();
    M.text(c, 'A.G. Irvine to Ottawa · Feb. 29, 1876', x + 50, y + 44, { size: WIDE ? 40 : 40, weight: 700, color: '#1b2533', shadow: false, maxW: pw - 100 });
    c.fillStyle = '#c9c2b2'; for (let i = 0; i < 4; i++) c.fillRect(x + 50, y + 130 + i * 34, (pw - 100) * (i % 3 === 2 ? .6 : .95), 10);
    const words = '“…the name of Calgary which I believe in Scotch means clear running water”'.split(' '); const qs = L.q; c.font = M.font(qs, 700);
    let cx = x + 50, cy = y + (WIDE ? 280 : 250); const lh = qs * 1.3;
    words.forEach((wd, i) => { const ww = c.measureText(wd + ' ').width; if (cx + ww > x + pw - 50) { cx = x + 50; cy += lh; }
      const on = M.seg(t, .6 + i / words.length * 3.6, .6 + (i + 1) / words.length * 3.6, 'linear'), hl = /clear|running|water/.test(wd);
      c.fillStyle = hl ? 'rgba(242,182,50,.9)' : 'rgba(242,182,50,.35)'; c.fillRect(cx - 4, cy - 4, (ww - 8) * on + (on > 0 ? 8 : 0), qs * 1.12);
      c.fillStyle = '#111a26'; c.textBaseline = 'top'; c.fillText(wd, cx, cy); cx += ww; });
    M.text(c, 'City of Calgary Archives, via City of Calgary Newsroom', x + 50, y + ph - 70, { size: 26, weight: 500, color: '#5b6573', shadow: false, maxW: pw - 100 });
    c.restore();
    M.chip(c, 'COLONEL MACLEOD SUPPORTED “CALGARY”', CX, WIDE ? 790 : 1015, { align: 'center', size: WIDE ? 40 : 40, alpha: M.seg(t, .2, .5) });
  },
  // TO MULL (C10): map flight from Calgary across the Atlantic, diving onto Mull; pin at Calgary Bay
  L7: (c, t, d) => {
    const u = M.seg(t, .3, d - .3, 'inOutCubic'), zoom = Math.exp(M.lerp(Math.log(WIDE ? 15 : 13), Math.log(WIDE ? 650 : 820), M.ease.inCubic(M.seg(u, .45, 1))));
    const v = { lat: M.lerp(51, LL.bay[0] - .03, M.seg(u, 0, .7, 'inOutSine')), lon: M.lerp(-75, LL.bay[1] + (WIDE ? .25 : .12), M.seg(u, 0, .75, 'inOutSine')), k: zoom };
    const P = flatMap(c, v, { hi: ['United Kingdom'] }); const a = P(...LL.calgary), b = P(...LL.bay);
    if (u < .7) { arc(c, a, b, M.seg(u, .05, .6), GOLD, .18); dot(c, a[0], a[1], 12, GOLD, u < .3 ? 'Calgary, Alberta' : '', { dy: 22 }); }
    dot(c, b[0], b[1], u > .85 ? 18 : 12, GOLD, u > .82 ? 'Calgary · Isle of Mull' : (u > .4 ? 'Scotland' : ''), { dy: u > .82 ? 26 : 22, size: u > .82 ? (WIDE ? 44 : 48) : 36, align: u > .82 && !WIDE ? 'center' : 'center' });
    if (u > .82) M.text(c, 'Isle of Mull', P(56.43, -5.95)[0], P(56.43, -5.95)[1], { size: WIDE ? 34 : 38, weight: 600, align: 'center', color: '#cfe8ff', alpha: M.seg(u, .85, .95) });
    band(c, WIDE ? 150 : 280, WIDE ? 450 : 700, .7);
    M.text(c, 'COLONEL', CX, WIDE ? 180 : 350, { size: WIDE ? 44 : 54, weight: 700, align: 'center', color: '#dfe7f2', alpha: M.seg(t, .2, .6) });
    M.text(c, 'JAMES MACLEOD', CX, WIDE ? 230 : 410, { size: WIDE ? 96 : 110, weight: 800, align: 'center', maxW: W - 140, alpha: M.seg(t, .2, .6) });
    M.chip(c, 'ONE OF HIS FAVOURITE PLACES', CX, WIDE ? 350 : 560, { align: 'center', size: L.chip, alpha: M.seg(t, 2.0, 2.4) });
    srcMap(c, 'Source: Dictionary of Canadian Biography', NEC);
  },
  // CALGARY BAY (C11): illustrated bay at golden hour, parallax pan
  L8: (c, t, d) => {
    const r = bay(c, t, d);
    M.text(c, 'Calgary Castle', r.kx, r.ky - 90, { size: WIDE ? 38 : 42, weight: 700, align: 'center', stroke: 6, strokeColor: '#06101f', alpha: M.seg(t, 3.0, 3.4) });
    M.text(c, 'Calgary Bay', r.bx, (WIDE ? H * .46 : H * .5) + (WIDE ? 70 : 90), { size: WIDE ? 56 : 64, weight: 800, align: 'center', stroke: 7, strokeColor: '#06101f', alpha: M.seg(t, .6, 1.0) });
    M.chip(c, 'WEST COAST OF MULL', CX, WIDE ? 120 : 400, { align: 'center', size: L.chip, bg: '#ffffff', alpha: M.seg(t, 1.6, 2.0) });
    illus(c, WIDE ? H - 120 : 1400); src(c, 'Source: Ordnance Survey Name Books · Undiscovered Scotland');
  },
  // THE MEANING (C12, vs C9): Gaelic types on, translations slam, "clear running water" struck
  L9: (c, t, d) => {
    navyBg(c, '#0d2446', '#070d18'); const sp = DUR('L9');   // measured speech length
    const yA = WIDE ? 170 : 380; M.chip(c, 'GAELIC', CX, yA - (WIDE ? 90 : 110), { align: 'center', size: 40, bg: '#ffffff', alpha: M.seg(t, .2, .5) });
    const g = 'Cala Ghearraidh', n = Math.floor(g.length * M.seg(t, .4, 1.8, 'linear'));
    M.text(c, g.slice(0, n), CX, yA, { size: WIDE ? 96 : 104, weight: 700, align: 'center', color: GOLD });
    const t1 = sp * .45; const k1 = M.seg(t, t1, t1 + .35, 'outBack');
    if (k1 > 0) { c.save(); c.translate(CX, WIDE ? 380 : 600); const s = M.lerp(1.5, 1, k1); c.scale(s, s); c.globalAlpha = Math.min(1, k1 * 1.5);
      M.text(c, 'BEACH OF THE MEADOW', 0, 0, { size: WIDE ? 110 : 112, weight: 800, align: 'center', maxW: W - 120 }); c.restore(); }
    M.text(c, 'or: the meadow beside the bay', CX, WIDE ? 530 : 860, { size: WIDE ? 52 : 56, weight: 600, align: 'center', color: '#dfe7f2', alpha: M.seg(t, sp * .62, sp * .62 + .4) });
    const t3 = sp * .82, k3 = M.seg(t, t3, t3 + .3);
    if (k3 > 0) { const yy = WIDE ? 720 : 1010; M.text(c, 'clear running water', CX, yy, { size: WIDE ? 72 : 76, weight: 700, align: 'center', color: '#c9d3e0', alpha: k3 });
      c.font = M.font(WIDE ? 72 : 76, 700); const tw = c.measureText('clear running water').width; strike(c, CX - tw / 2 - 16, CX + tw / 2 + 16, yy + (WIDE ? 42 : 44), M.seg(t, t3 + .3, t3 + .7, 'outCubic')); }
    src(c, 'Sources: isle-of-mull.net · Undiscovered Scotland');
  },
  // POPULAR STORY vs THE RECORD (C13)
  L10: (c, t, d) => {
    const P = flatMap(c, { lat: 56.5, lon: -6.1, k: 520 }, { hi: ['United Kingdom'] }); c.fillStyle = 'rgba(7,13,24,.55)'; c.fillRect(0, 0, W, H);
    const cw = 760, ch = 420, y = 330, dim = M.seg(t, 3.6, 4.2);
    [[CX - 420, 'POPULAR STORY', 'Cleared Mull crofters brought the name', 0.2, 1 - dim * .65], [CX + 420, 'THE RECORD', "Macleod's suggestion", 3.6, 1]].forEach(([x, chip, txt, t0, a], i) => {
      const k = M.seg(t, t0, t0 + .4, 'outCubic'); if (k <= 0) return; c.save(); c.globalAlpha = k * a; c.translate(0, (1 - k) * 40);
      M.rr(c, x - cw / 2, y, cw, ch, 22); c.fillStyle = i ? 'rgba(242,182,50,.16)' : 'rgba(255,255,255,.08)'; c.fill(); c.lineWidth = 4; c.strokeStyle = i ? GOLD : 'rgba(255,255,255,.4)'; c.stroke();
      M.chip(c, chip, x, y + 40, { align: 'center', size: 44, bg: i ? GOLD : '#ffffff' });
      M.text(c, txt, x, y + 170, { size: 64, weight: 800, align: 'center', maxW: cw - 80 }); c.restore(); });
    srcMap(c, 'Source: Undiscovered Scotland', NEC);
  },
  // 1876 TIMELINE (C4, C8, C14, C15): rows light up as they are spoken (vertical: top-to-bottom; wide: left-to-right)
  L11: (c, t, d) => {
    navyBg(c); const sp = DUR('L11');
    const ev = [[0, 'JAN', 'Fort Brisebois', .1, RED], [1.93, 'FEB 29', 'Irvine writes to Ottawa', .4, '#ffffff'], [3.5, 'APRIL', 'Calgary confirmed', sp * .5, GOLD], [7.5, 'AUGUST', 'Brisebois quits', sp * .72, RED]];
    M.text(c, '1876', CX, WIDE ? 120 : 330, { size: WIDE ? 140 : 170, weight: 800, align: 'center', color: GOLD, alpha: M.seg(t, 0, .3) });
    if (!WIDE) {
      const x = 170, y0 = 560, step = 150, prog = M.seg(t, .1, sp * .78, 'inOutSine');
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + step * 3); c.stroke();
      c.strokeStyle = GOLD; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + step * 3 * prog); c.stroke();
      ev.forEach(([m, mon, lab, t0, col], i) => { const k = M.seg(t, t0, t0 + .35, 'outBack'); if (k <= 0) return; const y = y0 + i * step;
        c.fillStyle = col; c.beginPath(); c.arc(x, y, 22 * k, 0, 7); c.fill();
        M.text(c, mon, x + 60, y - 44, { size: 72, weight: 800, color: col === GOLD ? GOLD : '#fff', alpha: Math.min(1, k) });
        M.text(c, lab, x + 60, y + 32, { size: 48, weight: 600, color: '#dfe7f2', alpha: Math.min(1, k) }); });
    } else {
      const x0 = 220, x1 = W - 220, y = 600, X = m => M.lerp(x0, x1, m / 11), head = M.lerp(0, 7.5, M.seg(t, .1, sp * .78, 'inOutSine'));
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
      'JFMAMJJASOND'.split('').forEach((m, i) => M.text(c, m, X(i), y + 24, { size: 28, weight: 600, align: 'center', color: '#8a99ad' }));
      c.strokeStyle = GOLD; c.beginPath(); c.moveTo(x0, y); c.lineTo(X(head), y); c.stroke();
      ev.forEach(([m, mon, lab, t0, col], i) => { const k = M.seg(t, t0, t0 + .35, 'outBack'); if (k <= 0) return; const xx = X(m), up = i % 2 === 0, yy = up ? y - 210 : y + 90;
        c.fillStyle = col; c.beginPath(); c.arc(xx, y, 18 * k, 0, 7); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(xx, up ? y - 22 : y + 22); c.lineTo(xx, up ? y - 90 : y + 80); c.stroke();
        M.text(c, mon, xx, yy, { size: 56, weight: 800, align: 'center', color: col === GOLD ? GOLD : '#fff', alpha: Math.min(1, k) });
        M.text(c, lab, xx, yy + 64, { size: 36, weight: 600, align: 'center', color: '#dfe7f2', maxW: 400, alpha: Math.min(1, k) }); });
    }
    src(c, 'Source: City of Calgary Newsroom (City of Calgary Archives) · Legion Magazine');
  },
  // BRISEBOIS DRIVE (C16): dusk over northwest Calgary; a street sign swings in
  L12: (c, t, d) => {
    const w = modern('dusk', DUSK); w.render(c, cam({ pos: [M.lerp(-1500, -2500, M.seg(t, 0, d)), M.lerp(-2000, -500, M.seg(t, 0, d)), 2600], look: [-3800, 4800, 0] }));
    band(c, 120, 700, .55);
    const k = M.seg(t, .3, 1.0, 'outBack'), sw2 = 900; c.save(); c.translate(CX, 330); c.rotate(M.lerp(-.35, 0, k)); c.globalAlpha = Math.min(1, k * 1.5);
    c.fillStyle = '#5b6573'; c.fillRect(-10, -20, 20, 40); M.rr(c, -sw2 / 2, 20, sw2, 170, 14); c.fillStyle = '#1f4e8c'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#ffffff'; M.rr(c, -sw2 / 2 + 14, 34, sw2 - 28, 142, 10); c.stroke();
    M.text(c, 'BRISEBOIS DR NW', 0, 60, { size: 96, weight: 800, align: 'center', shadow: false }); c.restore();
    M.text(c, 'northwest Calgary', CX, 560, { size: 56, weight: 700, align: 'center', alpha: M.seg(t, 1.6, 2.0) });
    M.chip(c, 'NO FORT · ONE STREET', CX, 640, { align: 'center', size: 40, bg: '#ffffff', alpha: M.seg(t, 2.4, 2.8) });
    illus(c, 1000); srcMap(c, 'Source: Legion Magazine');
  },
  // 150 YEARS (C17): night crane up from the confluence over downtown
  L13: (c, t, d) => {
    const w = modern('night', NIGHT); fort(w, .9); M.ping(w, FORT, t, { r: 160 });
    const p = M.seg(t, 0, d, 'inOutSine');
    w.render(c, cam({ pos: [FORT[0] + M.lerp(1400, 1900, p), FORT[1] + M.lerp(-2400, -3000, p), M.lerp(500, 1400, p)], look: [M.lerp(FORT[0], 400, p), M.lerp(FORT[1], 200, p), 0] }));
    band(c, WIDE ? 100 : 300, WIDE ? 560 : 900, .7);
    M.text(c, '1876 → 2026', CX, WIDE ? 150 : 400, { size: WIDE ? 80 : 88, weight: 800, align: 'center', color: '#dfe7f2', alpha: M.seg(t, .1, .4) });
    const cp = M.seg(t, .3, 1.5); if (cp > 0) { c.save(); c.globalAlpha *= M.seg(t, .3, .45); M.counter(c, 150, cp, CX, WIDE ? 330 : 600, { size: WIDE ? 170 : 190, slam: true, decimals: 0 }); c.restore(); }
    M.text(c, 'YEARS', CX, WIDE ? 500 : 790, { size: WIDE ? 70 : 78, weight: 800, align: 'center', color: GOLD, alpha: M.seg(t, 1.2, 1.5) });
    srcMap(c, '');
  },
  L14: (c, t, d) => { c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
    M.closer(c, 'Calgary or Fort Brisebois? Which would you pick?', M.seg(t, 0, d, 'linear'), W, H, { highlight: ['calgary', 'brisebois'] }); },
  // TEASER (subset of audited claims: C1, C4, C5, C7, C10, C11)
  T0: (c, t, d) => D.L0(c, t, d),
  T1: (c, t, d) => {
    const gy = 1300; palisade(c, gy, t); c.save(); c.translate(CX, gy - 330); sign(c, 0, 0, 860, M.seg(t, .5, 3.0)); c.restore();
    cancelStamp(c, CX, gy - 330, M.seg(t, 5.4, 5.75, 'outBack'));
    band(c, 250, 720, .7); stamp(c, 'EARLY 1876', t, .1, CX, 380, 100);
    M.chip(c, 'NAMED IT AFTER HIMSELF', CX, 560, { align: 'center', size: 50, alpha: M.seg(t, 3.0, 3.4) });
    illus(c, gy + 40); src(c, 'Source: City of Calgary Newsroom · Legion Magazine');
  },
  T2: (c, t, d) => D.L7(c, t, d),
  T3: (c, t, d) => { c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
    const a = 1 - M.seg(t, 1.5, 1.8);
    if (a > 0) { M.text(c, '▶ FULL VIDEO', CX, 640, { size: 112, weight: 800, align: 'center', alpha: a * M.seg(t, 0, .25) });
      M.text(c, 'on our page · calgaryinsight.ca', CX, 790, { size: 54, weight: 700, align: 'center', color: GOLD, alpha: a * M.seg(t, .2, .45) }); }
    if (t > 1.6) { M.closer(c, 'Calgary or Brisebois? Which would you pick?', M.seg(t, 1.6, d, 'linear'), W, H, { highlight: ['calgary', 'brisebois'] });
      M.text(c, '▶ Full video on our page', CX, 1370, { size: 38, weight: 700, align: 'center', color: '#ffffff', alpha: M.seg(t, 2.4, 2.8) }); }
  },
};
const TRANS = { L0: { kind: 'match', dur: .5 }, L1: { kind: 'dissolve', dur: .5 }, L2: { kind: 'whip', dur: .35 }, L3: { kind: 'push', dur: .4 }, L4: { kind: 'push', dur: .4 },
  L5: { kind: 'flash', dur: .3 }, L6: { kind: 'zoom', dur: .45 }, L7: { kind: 'dissolve', dur: .6 }, L8: { kind: 'flash', dur: .3 }, L9: { kind: 'push', dur: .4 },
  L10: { kind: 'push', dur: .4 }, L11: { kind: 'dissolve', dur: .5 }, L12: { kind: 'dissolve', dur: .5 }, L13: { kind: 'dissolve', dur: .5 },
  T0: { kind: 'whip', dur: .35 }, T1: { kind: 'dissolve', dur: .5 }, T2: { kind: 'dissolve', dur: .5 } };
const LETTER = new Set(['L0', 'L2', 'L13']);

window.BUILD = () => { window.CUES = CUESFN(); return M.film({ W, H, identity: 'storyteller', scenes: ORDER.map((id, i) => ({ dur: sc[i].sceneDur, trans: TRANS[id], draw: (c, t) => D[id](c, t, sc[i].sceneDur) })),
  letterbox: t => { if (!WIDE || THUMB) return 0; const i = ORDER.findIndex((id, k) => t >= sc[k].sceneStart && t < sc[k].sceneEnd); if (i <= 0) return 0; return LETTER.has(ORDER[i]) ? Math.min(M.seg(t, sc[i].sceneStart, sc[i].sceneStart + .6), 1 - M.seg(t, sc[i].sceneEnd - .6, sc[i].sceneEnd)) : 0; },
  overlay: (c, t, info) => {
    const last = info.index === ORDER.length - 1;
    if (THUMB) { if (window.LOGO) { const s = 84; const x = WIDE ? 40 : 60, y = WIDE ? H - s - 36 : 1490; c.drawImage(window.LOGO, x, y, s, s); M.text(c, 'Calgary Insight', x + s + 16, y + s / 2, { size: 36, base: 'middle', weight: 700 }); } return; }
    if (t > 3 && !last) M.header(c, window.LOGO, W, H, { topic: WIDE ? 'Calgary stories' : undefined });
    if (!last) M.caption(c, S.captionAt(t), W, H, WIDE ? {} : { bottom: 1410 });
    if (CUT !== 'teaser') { const mid = S.total / 2; M.followPill(c, M.seg(t, mid - 1, mid + 1, 'linear'), W, H); }
  } }); };

const CUESFN = () => { const s = i => sc[i].sceneStart, cues = [{ t: 0, sfx: 'impact', gain: -5 }, { t: .2, sfx: 'whoosh', gain: -12 }, { t: 2.4, sfx: 'thud', gain: -10 }, { t: 0, sfx: 'wind', dur: (sc[2] || sc[1]).sceneEnd, gain: -24 }];
  ORDER.forEach((id, i) => { if (i === 0) return; const k = TRANS[ORDER[i - 1]] && TRANS[ORDER[i - 1]].kind; cues.push({ t: Math.max(0, s(i) - .2), sfx: k === 'flash' ? 'impact' : (k === 'dissolve' || k === 'match' ? 'whoosh_rev' : 'whoosh'), gain: k === 'dissolve' ? -16 : -11 });
    const at = (x, sfx, g, o = {}) => cues.push(Object.assign({ t: s(i) + x, sfx, gain: g }, o));
    if (id === 'L1') { at(.15, 'stamp', -8); at(3.6, 'pop', -11); }
    if (id === 'L2') at(.2, 'swell', -14, { dur: 1.6 });
    if (id === 'L3') { at(.1, 'stamp', -8); at(1.0, 'ticks', -18, { dur: 2.6 }); at(5.6, 'pop', -10); }
    if (id === 'L4') { at(1.2, 'thud', -11); at(1.5, 'thud', -11); }
    if (id === 'L5') { at(.25, 'stamp', -5); at(3.7, 'stamp', -8); at(4.1, 'whoosh', -13); at(6.6, 'ping', -12); }
    if (id === 'L6') { at(.6, 'ticks', -20, { dur: 3.6 }); }
    if (id === 'L7') { at(.3, 'riser', -16, { dur: 3.0 }); at(4.8, 'ping', -11); }
    if (id === 'L8') { at(0, 'wind', -22, { dur: sc[i].sceneDur }); at(3.0, 'pop', -12); }
    if (id === 'L9') { const sp = DUR('L9'); at(.4, 'ticks', -18, { dur: 1.4 }); at(sp * .45, 'impact', -7); at(sp * .82 + .3, 'glitch', -14); }
    if (id === 'L10') { at(.2, 'pop', -12); at(3.6, 'swell', -13, { dur: 1.8 }); }
    if (id === 'L11') { at(.2, 'ticks', -19, { dur: 4.2 }); at(sc[i].sceneDur * .5, 'ping', -12); }
    if (id === 'L12') { at(.3, 'whoosh', -12); at(.9, 'thud', -12); }
    if (id === 'L13') { at(0, 'city', -24, { dur: sc[i].sceneDur }); at(.3, 'ticks', -16, { dur: 1.2 }); at(1.5, 'impact', -9); }
    if (id === 'T1') { at(.1, 'stamp', -8); at(.5, 'ticks', -18, { dur: 2.5 }); at(5.4, 'stamp', -5); }
    if (id === 'T2') { at(.3, 'riser', -16, { dur: 3.0 }); at(4.8, 'ping', -11); }
  });
  return cues; };
window.TOTAL = () => S.total;
