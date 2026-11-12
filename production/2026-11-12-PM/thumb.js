/* 2026-11-12 PM fun fact: "Calgary cloned a war memorial" (Memorial Drive poplars).
 * Lead identity: Data Explainer; borrows a Storyteller low riverbank drone (S0, S2) and a Civic cutaway/schematic card (S3).
 * Every on-screen figure maps to the audited claims table in packages/2026-11-12-PM-memorial-drive-clones.md (claim numbers in comments).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DUR = [1.728, 5.077, 3.435, 5.867, 3.328, 2.795];      // measured Kokoro line durations (replaced from durs.json)
const S = M.script([
  { text: 'Calgary cloned a war memorial.', dur: DUR[0] },
  { text: 'In nineteen twenty-two, the mayor planted the first tree on what is now Memorial Drive.', dur: DUR[1] },
  { text: 'The plan: a tree for each fallen soldier of the Great War.', dur: DUR[2] },
  { text: 'In two thousand one, the City took cuttings from the trees still standing, and grew clones in B.C.', dur: DUR[3] },
  { text: 'So the memorial poplars can be replaced by their own clones.', dur: DUR[4] },
  { text: 'Did you know? Yes or no. Drop your thoughts below.', dur: DUR[5] },
], { lead: .25, gap: .22, tail: 1.2 });
const sc = S.scenes;
const SRC = 'Source: City of Calgary, Memorial Drive trees · Veterans Affairs Canada';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const GREEN = ['#3f6b31', '#4f7a3a', '#5f8c45', '#6d9a48'];
const DUSK = { land: '#2e3138', park: '#2b3a30', water: '#2c5378', building: '#5a6270', road: '#6e675c', motorway: '#8a7a5c' };
const NAVY = { land: '#122848', park: '#17364a', water: '#2f6fa6', building: '#3b5378', road: '#2b4670', motorway: '#3f5f8f' };

let ROW = [], SUNNY = null, PIN = [-820, 700, 0];
window.PRELOAD = async () => {
  const g = M.geo.get();
  SUNNY = g.communities.items.find(x => x.name === 'SUNNYSIDE');
  // the poplar row: along the Bow's north bank past Sunnyside (river centre line offset north), one tree every ~22 m
  const bow = g.rivers.find(r => r.name === 'Bow River');
  const pts = bow.lines.flat().filter(p => p[0] > -1700 && p[0] < 900).sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 22));
    for (let k = 0; k < n; k++) { const u = k / n; ROW.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + 95, 0]); }
  }
};

// a stylised columnar poplar in screen space: base (x, y), height hp in px; o.gold = clone outline, o.old = aged tree
function poplar(c, x, y, hp, o = {}) {
  if (hp < 2) return; const r = M.rng(o.seed || 1), a = o.alpha ?? 1; c.save(); c.globalAlpha *= a;
  c.fillStyle = o.old ? '#4a3a2c' : '#3a2c20'; c.fillRect(x - hp * .025, y - hp * .32, hp * .05, hp * .32);
  const cy = y - hp * .6, rx = hp * (o.old ? .15 : .13), ry = hp * .42;
  if (o.gold) { c.lineWidth = Math.max(2, hp * .02); c.strokeStyle = M.house.gold; c.fillStyle = 'rgba(242,182,50,.5)'; c.beginPath(); c.ellipse(x, cy, rx, ry, 0, 0, 7); c.fill(); c.stroke(); }
  else {
    const cols = o.old ? ['#6b6a3a', '#7d6f3c', '#5d5b34', '#8a7a46'] : GREEN;
    c.fillStyle = cols[0]; c.beginPath(); c.ellipse(x, cy, rx, ry, 0, 0, 7); c.fill();
    for (let i = 0; i < 9; i++) { c.fillStyle = cols[1 + (i % 3)]; c.beginPath(); c.ellipse(x + (r() - .5) * rx * 1.1, cy + (r() - .5) * ry * 1.4, rx * (.35 + r() * .3), ry * (.18 + r() * .14), 0, 0, 7); c.fill(); }
    if (o.old) { c.fillStyle = '#20262e'; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(x + (r() - .5) * rx, cy + (r() - .5) * ry, rx * .22, ry * .1, 0, 0, 7); c.fill(); } }
  }
  c.restore();
}
// trees in the 3D world: grow 0..1 per tree, clone offset in metres
function addRow(w, t, o = {}) {
  ROW.forEach((p, i) => w.at(p, (ctx, sp) => {
    const g = o.grow ? o.grow(i) : 1; if (g <= 0) return;
    poplar(ctx, sp.x, sp.y, 26 * sp.k * M.ease.outBack(Math.min(1, g)), { seed: i + 3 });
    const cl = o.clone ? o.clone(i) : 0;
    if (cl > 0) { const q = M.ease.outCubic(Math.min(1, cl)); poplar(ctx, sp.x + q * 9 * sp.k, sp.y, 26 * sp.k, { gold: true, alpha: Math.min(1, cl * 2) }); }
  }));
}
const band = (c, y0, y1, a = .72) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const rowCam = (u, o = {}) => { const a = ROW[o.from || 4], b = ROW[Math.min(ROW.length - 1, (o.from || 4) + 40)];
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, s = M.lerp(o.s0 ?? -60, o.s1 ?? -15, u);
  return { pos: [a[0] + ux * s - uy * (o.side ?? 34), a[1] + uy * s + ux * (o.side ?? 34), o.h ?? 9], look: [a[0] + ux * 260, a[1] + uy * 260 - 10, o.lookZ ?? 14], fov: 58 }; };

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // 0 HOOK: frame 0 already pushing low along the riverbank poplars at dusk; gold clones slide out of the trees; hook words punch in from frame 0 (claim 1)
  { dur: sc[0].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 300, far: 4000, max: .6 } });
      M.geo.addBase(w, { buildings: true, windows: '#ffd27a', windowAlpha: .5, colors: DUSK });
      addRow(w, t, { clone: i => i >= 6 ? M.seg(t, .2 + (i - 6) * .035, .6 + (i - 6) * .035, 'linear') : 0 });
      w.render(c, M.camera(rowCam(M.seg(t, 0, sc[0].sceneDur, 'outCubic'), { side: 22, h: 6, lookZ: 30, s0: -40, s1: 0 }), W, H));
      // hero pair in the foreground: one poplar, and its gold clone sliding out of it (the twist, seen)
      const zx = M.lerp(1.0, 1.08, M.seg(t, 0, sc[0].sceneDur, 'outCubic')), sl = M.seg(t, .15, .7, 'outBack');
      c.save(); c.translate(250, 1600); c.scale(zx, zx); poplar(c, 0, 0, 860, { seed: 21 });
      if (sl > 0) poplar(c, 360 * sl, 0, 860, { gold: true, alpha: Math.min(1, sl * 2) }); c.restore();
      band(c, 300, 820, .55);
      M.kinetic(c, 'Calgary cloned a war memorial', t, CX, 380, { t0: -.12, size: 124, maxW: 860, every: .09, highlight: ['cloned'] });
  } },
  // 1 WHEN/WHERE: dive over the real city onto Sunnyside on the Bow's north bank; pin; "1922" stamps (claim 2)
  { dur: sc[1].sceneDur, trans: { kind: 'zoom', dur: .4 }, draw: (c, t) => {
      const w = M.world({ sky: 'blueprint', fog: { near: 12000, far: 50000, max: .5 } });
      M.geo.addBase(w, { buildings: true, colors: NAVY, windows: '#ffd27a', windowAlpha: .3 });
      if (SUNNY) SUNNY.polys.forEach(poly => w.area(poly, { fill: M.house.gold, alpha: .2 + .3 * M.seg(t, .3, 1.1), stroke: M.house.gold, sw: 6, order: 4 }));
      M.ping(w, PIN, t, { r: 110 });
      M.pin(w, PIN, 'Sunnyside Blvd · now Memorial Drive', { p: M.seg(t, .35, .9, 'linear'), size: 44, scale: 1.3 });
      const cam = M.camera(M.moves.dive([-200, 900, 0], M.seg(t, 0, sc[1].sceneDur, 'outCubic'), { h0: 26000, h1: 2600, back0: 1, back1: 3000, ahead: 200 }), W, H); w.render(c, cam);
      const k = M.seg(t, 1.1, 1.45, 'outBack'); if (k > 0) { c.save(); c.translate(CX, 470); c.rotate(-.05); c.scale(M.lerp(1.8, 1, k), M.lerp(1.8, 1, k)); c.globalAlpha = Math.min(1, k * 1.5);
        M.rr(c, -170, -78, 340, 156, 22); c.fillStyle = 'rgba(7,13,24,.82)'; c.fill(); c.lineWidth = 8; c.strokeStyle = M.house.gold; c.stroke();
        M.text(c, '1922', 0, -60, { size: 120, weight: 800, align: 'center', color: '#fff' }); c.restore(); }
      M.chip(c, 'FIRST TREE', CX, 580, { align: 'center', size: 56, alpha: M.seg(t, 1.7, 2.1) });
      M.source(c, MAPC, 60, 1430, { size: 20 }); M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 2 WHY: the poplars grow up one after another along the bank (claim 3, claim 4)
  { dur: sc[2].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 400, far: 5000, max: .6 } });
      M.geo.addBase(w, { buildings: true, windows: '#ffd27a', windowAlpha: .5, colors: DUSK });
      addRow(w, t, { grow: i => M.seg(t, .05 + i * .035, .45 + i * .035, 'linear') });
      w.render(c, M.camera(rowCam(M.seg(t, 0, sc[2].sceneDur, 'inOutSine'), { h: M.lerp(40, 70, M.seg(t, 0, sc[2].sceneDur)), side: 120, s0: -120, s1: -80, lookZ: 0 }), W, H));
      band(c, 360, 920, .74);
      M.text(c, 'A TREE FOR EACH', CX, 420, { size: 54, weight: 800, align: 'center', color: M.house.gold, tracking: .14, alpha: M.seg(t, 0, .3) });
      M.kinetic(c, 'fallen soldier of the Great War', t, CX, 500, { t0: .15, size: 110, upper: false, every: .12, maxW: 880 });
      M.chip(c, 'LIVING MEMORIAL', CX, 820, { align: 'center', size: 50, alpha: M.seg(t, 1.5, 1.9) });
      M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 3 HOW: Civic-style cutaway: a cutting is snipped, flies onto a schematic card Calgary -> Grand Forks, B.C., and multiplies into clones (claim 5)
  { dur: sc[3].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#081428'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const k2 = M.seg(t, .05, .4, 'outBack'); if (k2 > 0) { c.save(); c.translate(CX, 380); c.scale(M.lerp(1.6, 1, k2), M.lerp(1.6, 1, k2)); c.globalAlpha = Math.min(1, k2 * 1.5);
        M.rr(c, -170, -70, 340, 140, 22); c.fillStyle = 'rgba(7,13,24,.85)'; c.fill(); c.lineWidth = 8; c.strokeStyle = M.house.gold; c.stroke(); M.text(c, '2001', 0, -56, { size: 112, weight: 800, align: 'center' }); c.restore(); }
      M.text(c, 'CUTTINGS → CLONES', CX, 480, { size: 64, weight: 800, align: 'center', color: M.house.gold, alpha: M.seg(t, .5, .9) });
      // the old tree and the snip
      poplar(c, 230, 990, 420, { seed: 7 });
      const snip = M.seg(t, .7, 1.0); if (snip > 0 && snip < 1) { c.strokeStyle = '#fff'; c.lineWidth = 6; c.beginPath(); c.moveTo(270, 740 - 40 * snip); c.lineTo(330, 780 + 40 * snip); c.stroke(); }
      // the schematic card (Grand Forks lies south-west of Calgary; not to scale)
      const ck = M.seg(t, 1.1, 1.5, 'outCubic'); c.save(); c.globalAlpha = ck; M.rr(c, 440, 580, 520, 330, 24); c.fillStyle = '#12305a'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.35)'; c.stroke();
      const A = [880, 660], B = [540, 820], ap = M.seg(t, 1.6, 2.6, 'inOutCubic');
      c.strokeStyle = M.house.gold; c.lineWidth = 6; c.setLineDash([16, 12]); c.beginPath(); for (let i = 0; i <= 30 * ap; i++) { const u = i / 30, x = M.lerp(A[0], B[0], u), y = M.lerp(A[1], B[1], u) - Math.sin(u * Math.PI) * 90; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.setLineDash([]);
      c.fillStyle = '#fff'; [A, B].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 12, 0, 7); c.fill(); });
      M.text(c, 'Calgary', A[0], A[1] + 22, { size: 36, weight: 700, align: 'center' });
      M.text(c, 'Grand Forks, B.C.', B[0] + 120, B[1] + 22, { size: 36, weight: 700, align: 'center', alpha: M.seg(t, 2.4, 2.8) });
      M.text(c, 'schematic', 940, 592, { size: 22, weight: 500, align: 'right', color: '#9fb0c8' }); c.restore();
      // the cutting flies from the tree to Calgary on the card
      const fl = M.seg(t, 1.0, 1.7, 'inOutCubic'); if (fl > 0 && fl < 1) { const x = M.lerp(310, A[0], fl), y = M.lerp(780, A[1], fl) - Math.sin(fl * Math.PI) * 160; poplar(c, x, y, 90, { gold: true }); }
      // clones multiply in the nursery rows
      const n = Math.min(24, Math.floor(Math.pow(2, M.seg(t, 2.8, sc[3].sceneDur - .2, 'linear') * 4.6)));
      for (let i = 0; i < n; i++) { const col = i % 8, rowi = Math.floor(i / 8); poplar(c, 150 + col * 110, 1090 + rowi * 55, 100 - rowi * 8, { seed: 30 + i, alpha: .95 }); }
      M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 4 WHAT CHANGES: before/after wipe on the same spot: an old poplar -> its young clone (claim 6)
  { dur: sc[4].sceneDur, trans: { kind: 'dissolve', dur: .4 }, draw: (c, t) => {
      const scene = (x, old) => { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#141d3b'); g.addColorStop(.45, '#5b4a6e'); g.addColorStop(.62, '#f0a35e'); g.addColorStop(.63, '#2a2a30'); g.addColorStop(1, '#1d1f24'); x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.fillStyle = '#2c5378'; x.fillRect(0, 1300, W, 140);
        if (old) poplar(x, CX, 1290, 760, { seed: 11, old: true });
        else { poplar(x, CX, 1290, 700, { seed: 11 }); M.chip(x, 'CLONE', CX + 80, 960, { size: 48 }); } };
      M.beforeAfter(c, M.seg(t, .35, 1.6, 'inOutCubic'), x => scene(x, true), x => scene(x, false), W, H);
      band(c, 330, 660, .7);
      M.kinetic(c, 'Replaced by their own clones', t, CX, 380, { t0: .05, size: 110, upper: false, every: .1, maxW: 880, highlight: ['clones'] });
      M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 5 QUESTION: one-word answer, held ~1.6 s after the voice; no end card (video under 2:00)
  { dur: sc[5].sceneDur, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
      const p = M.seg(t, 0, sc[5].sceneDur, 'linear'); for (let i = 0; i < 9; i++) poplar(c, 80 + i * 110, 1640, 260, { seed: 50 + i, alpha: .35 });
      M.closer(c, 'Did you know? Yes or no?', p, W, H, { highlight: ['yes', 'no'] });
      M.text(c, '🔗 Explore your community: link in the first comment', CX, 1370, { size: 34, weight: 600, align: 'center', color: M.house.gold, maxW: 860, alpha: M.seg(p, .35, .6) });
  } },
], overlay: (c, t, info) => {
  if (t > 3 && info.index < 5) M.header(c, window.LOGO, W, H);
  if (info.index < 5) M.caption(c, S.captionAt(t), W, H, { bottom: 1410 });
} });

window.CUES = () => [
  { t: 0.0, sfx: 'impact', gain: -5 }, { t: .3, sfx: 'pop', gain: -12 }, { t: .6, sfx: 'pop', gain: -13 }, { t: .9, sfx: 'pop', gain: -14 },
  { t: sc[1].sceneStart - .2, sfx: 'whoosh', gain: -9 }, { t: sc[1].sceneStart + .45, sfx: 'pop', gain: -10 }, { t: sc[1].sceneStart + 1.15, sfx: 'stamp', gain: -7 },
  { t: sc[2].sceneStart - .2, sfx: 'whoosh', gain: -10 }, { t: sc[2].sceneStart + .1, sfx: 'ticks', dur: 1.4, gain: -16 },
  { t: sc[3].sceneStart - .2, sfx: 'whoosh', gain: -10 }, { t: sc[3].sceneStart + .1, sfx: 'stamp', gain: -9 }, { t: sc[3].sceneStart + .72, sfx: 'click', gain: -10 },
  { t: sc[3].sceneStart + 1.0, sfx: 'whoosh', gain: -14 }, { t: sc[3].sceneStart + 3.0, sfx: 'ticks', dur: 2.2, gain: -16 },
  { t: sc[4].sceneStart + .35, sfx: 'whoosh', gain: -11 }, { t: sc[4].sceneStart + 1.5, sfx: 'ping', gain: -13 },
  { t: sc[5].sceneStart - .15, sfx: 'whoosh', gain: -12 },
];
window.TOTAL = () => S.total;

// THUMBNAIL (1080x1920, key content inside the centre 1080x1350: y 285-1635), same design as the opening frame
window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [{ dur: 1, draw: (c, t) => {
  const w = M.world({ sky: 'dusk', fog: { near: 300, far: 4000, max: .6 } });
  M.geo.addBase(w, { buildings: true, windows: '#ffd27a', windowAlpha: .5, colors: DUSK });
  addRow(w, 1.5, { clone: i => i >= 6 ? 1 : 0 });
  w.render(c, M.camera(rowCam(1, { side: 22, h: 6, lookZ: 30, s0: -40, s1: 0 }), W, H));
  c.save(); c.translate(250, 1600); c.scale(1.05, 1.05); poplar(c, 0, 0, 860, { seed: 21 }); poplar(c, 360, 0, 860, { gold: true }); c.restore();
  band(c, 300, 1000, .7);
  M.text(c, 'CALGARY', CX, 340, { size: 150, weight: 800, align: 'center' });
  M.text(c, 'CLONED', CX, 500, { size: 170, weight: 800, align: 'center', color: M.house.gold });
  M.text(c, 'A WAR MEMORIAL', CX, 690, { size: 116, weight: 800, align: 'center', maxW: 960 });
  if (window.LOGO) { c.drawImage(window.LOGO, 70, 300, 84, 84); }
} }], overlay: () => {} });
