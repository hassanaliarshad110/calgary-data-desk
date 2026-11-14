/* 2026-11-14 PM fun fact: "Calgary built its library over a working CTrain line".
 * Lead identity: Data Explainer (counters, stamps, tile strip, fast cuts); borrows a Storyteller 3D dive/orbit over real
 * geography (S0, S4) and a Civic-style schematic cutaway (S1).
 * Every on-screen figure maps to the audited claims table in packages/2026-11-14-PM-library-over-ctrain.md (claim numbers in comments).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DUR = [4.16, 3.648, 3.413, 3.136, 3.648, 2.731];      // measured Kokoro line durations (durs.json, studio-probe-out)
const S = M.script([
  { text: 'Calgary built its Central Library on top of a working CTrain line.', dur: DUR[0] },
  { text: 'The tracks curve across the site, then dip underground into a tunnel.', dur: DUR[1] },
  { text: 'So crews wrapped a hundred and fifty metres of track in concrete.', dur: DUR[2] },
  { text: 'It took eighteen months, with only nine weekend shutdowns.', dur: DUR[3] },
  { text: 'It was the first time Calgary built over an active CTrain line.', dur: DUR[4] },
  { text: 'Did you know? Yes or no? Drop your thoughts below.', dur: DUR[5] },
], { lead: .25, gap: .22, tail: 1.3 });
const sc = S.scenes;
const SRC = 'Source: Calgary Municipal Land Corp. (2014, 2015)';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const RED = '#d94848';
const THUMB = typeof PARAMS !== 'undefined' && PARAMS.thumb;   // clean plate for the designed thumbnail (no text furniture)
const NAVY = { land: '#122848', park: '#17364a', water: '#2f6fa6', building: '#3b5378', road: '#2b4670', motorway: '#3f5f8f', lrt: RED, community: '#9fb0c8' };
// Calgary Central Library footprint (OSM, motion/geo/calgary_base.json) and the CTrain alignment across its site (OSM lrt line 6)
const LIB = [[1156, 65], [1155, 105], [1160, 125], [1166, 141], [1175, 156], [1185, 140], [1194, 120], [1198, 97], [1200, 98], [1207, 75], [1211, 50], [1210, 16], [1177, 18], [1165, 35], [1159, 51]];
const LIBC = [1184, 85, 0];
const TRACK = [[1058, 180], [1116, 174], [1150, 164], [1174, 140], [1186, 67], [1163, 6], [1007, -234]];
const CITYHALL = [1057.5, 179.1, 0];

function along(path, s) {
  for (let i = 0; i < path.length - 1; i++) { const a = path[i], b = path[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (s <= l || i === path.length - 2) { const f = Math.max(0, Math.min(1, s / l)); return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, Math.atan2(b[1] - a[1], b[0] - a[0])]; } s -= l; }
}
// one CTrain design (continuity): two white cars with red roofs
function train(w, s) { for (let k = 0; k < 2; k++) { const [x, y, a] = along(TRACK, Math.max(0, s - k * 26)), ux = Math.cos(a), uy = Math.sin(a), L = 12, B = 1.7;
  w.box([[x - ux * L - uy * B, y - uy * L + ux * B], [x + ux * L - uy * B, y + uy * L + ux * B], [x + ux * L + uy * B, y + uy * L - ux * B], [x - ux * L + uy * B, y - uy * L - ux * B]], 4, { color: '#eef1f5', roof: RED }); } }
const bg = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#081428'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const band = (c, y0, y1, a = .72) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const north = c => M.text(c, 'N ↑', 990, 300, { size: 34, weight: 700, align: 'right', color: '#dfe7f2', stroke: 4, strokeColor: '#06101f' });
function city(w, t) {
  M.geo.addBase(w, { buildings: true, lrt: true, colors: NAVY, windows: '#ffd27a', windowAlpha: .3, communities: true, highlightCommunity: 'DOWNTOWN EAST VILLAGE', hiColor: '#f2b632', hiAlpha: .12, lineAlpha: .12, only: b => b.name !== 'Calgary Central Library' });
  w.line(TRACK, { wm: 9, color: RED, order: 6, glow: true, minPx: 3 });
  w.box(LIB, 20.4, { color: '#dfe9f5', roof: '#f5f8fc', alpha: .62 });
  train(w, 20 + t * 38);
}
// stamp card
function stamp(c, s, y, k, o = {}) { if (k <= 0) return; c.save(); c.translate(CX, y); c.rotate(o.rot ?? -.04); const z = M.lerp(1.8, 1, k); c.scale(z, z); c.globalAlpha = Math.min(1, k * 1.5);
  c.font = M.font(o.size || 110, 800); const tw = c.measureText(s).width + 90; M.rr(c, -tw / 2, -84, tw, 168, 24); c.fillStyle = 'rgba(7,13,24,.88)'; c.fill(); c.lineWidth = 8; c.strokeStyle = o.color || M.house.gold; c.stroke();
  M.text(c, s, 0, -62, { size: o.size || 110, weight: 800, align: 'center', color: o.textColor || '#fff' }); c.restore(); }

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // 0 HOOK: frame 0 already moving: steep dive over real downtown onto the library; red CTrain line glows, a train slides under the footprint (C1, C6)
  { dur: sc[0].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      const D = sc[0].sceneDur, w = M.world({ sky: 'blueprint', fog: { near: 3000, far: 9000, max: .45 } });
      city(w, t);
      M.pin(w, [LIBC[0], LIBC[1], 22], 'Central Library', { p: M.seg(t, .6, 1.1, 'linear'), size: 46, scale: 1.2 });
      w.at(CITYHALL, (ctx, sp) => { ctx.fillStyle = '#fff'; ctx.strokeStyle = RED; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(sp.x, sp.y, 13, 0, 7); ctx.fill(); ctx.stroke();
        M.text(ctx, 'City Hall', sp.x - 22, sp.y - 20, { size: 34, weight: 700, align: 'right', stroke: 5, strokeColor: '#06101f', alpha: M.seg(t, 1.4, 1.8) }); });
      w.render(c, M.camera(M.moves.dive(LIBC, M.seg(t, 0, D, 'outCubic'), { h0: 2300, h1: 420, back0: 300, back1: 760, ahead: 60 }), W, H));
      if (THUMB) return;
      band(c, 250, 820, .66);
      M.kinetic(c, 'A library built over a train', t, CX, 300, { t0: -.12, size: 124, maxW: 880, every: .09, highlight: ['train'] });   // C1
      M.chip(c, 'CTrain line', 70, 1000, { size: 48, bg: RED, color: '#fff', alpha: M.seg(t, 1.0, 1.4) });
      north(c); M.source(c, MAPC, 60, 1466, { size: 20 });
  } },
  // 1 HOW: side cutaway, schematic: track at street level dips into a tunnel under the library; a train runs down the slope (C2)
  { dur: sc[1].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      bg(c); const D = sc[1].sceneDur, gy = 1000;
      // ground mass
      c.fillStyle = '#3a2f26'; c.fillRect(0, gy, W, 380); c.fillStyle = '#4c3d30'; c.fillRect(0, gy, W, 26);
      // track profile: street level from left, slopes down to tunnel on the right
      const prof = x => x < 300 ? gy : x < 760 ? gy + (x - 300) / 460 * 230 : gy + 230;
      // concrete enclosure along the slope
      c.fillStyle = '#8d949c'; c.beginPath(); c.moveTo(250, gy - 70); for (let x = 250; x <= 1080; x += 20) c.lineTo(x, prof(x) - 74); c.lineTo(1080, prof(1080) + 14); for (let x = 1080; x >= 250; x -= 20) c.lineTo(x, prof(x) + 14); c.closePath(); c.fill();
      c.fillStyle = '#101a2a'; c.beginPath(); c.moveTo(262, gy - 60); for (let x = 262; x <= 1080; x += 20) c.lineTo(x, prof(x) - 62); c.lineTo(1080, prof(1080) + 2); for (let x = 1080; x >= 262; x -= 20) c.lineTo(x, prof(x) + 2); c.closePath(); c.fill();
      c.strokeStyle = RED; c.lineWidth = 6; c.beginPath(); for (let x = 0; x <= 1080; x += 10) { const y = prof(x); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      // library block above the enclosure
      const lk = M.seg(t, 0, .5, 'outCubic'); c.save(); c.globalAlpha = lk; c.fillStyle = '#dfe9f5';
      c.beginPath(); c.moveTo(330, gy - 80); c.lineTo(330, gy - 270); c.quadraticCurveTo(620, gy - 380, 930, gy - 290); c.lineTo(930, gy - 80); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(11,31,58,.35)'; c.lineWidth = 3; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(330 + i * 100, gy - 80); c.lineTo(330 + i * 100 + 30, gy - 320); c.stroke(); }
      M.text(c, 'LIBRARY', 630, gy - 230, { size: 64, weight: 800, align: 'center', color: '#0b1f3a', shadow: false }); c.restore();
      // train running down the slope
      const tx = M.lerp(-260, 1180, M.seg(t, .1, D, 'inOutSine'));
      for (let k = 0; k < 2; k++) { const x = tx - k * 170, y = prof(Math.max(0, x)), y2 = prof(Math.max(0, x + 150)), a = Math.atan2(y2 - y, 150);
        c.save(); c.translate(x, y - 6); c.rotate(a); M.rr(c, 0, -52, 160, 50, 10); c.fillStyle = '#eef1f5'; c.fill(); c.fillStyle = RED; c.fillRect(0, -52, 160, 10); c.fillStyle = '#1b2b44'; for (let i = 0; i < 4; i++) c.fillRect(14 + i * 36, -38, 24, 16); c.restore(); }
      M.text(c, 'street level', 40, gy - 60, { size: 40, weight: 700, alpha: M.seg(t, .4, .7), stroke: 5, strokeColor: '#06101f' });
      M.text(c, 'tunnel', 1040, gy + 120, { size: 48, weight: 800, align: 'right', color: '#ffd0d0', alpha: M.seg(t, 1.6, 2.0), stroke: 5, strokeColor: '#06101f' });
      M.kinetic(c, 'Tracks dip underground', t, CX, 330, { t0: .05, size: 120, maxW: 880, every: .1, highlight: ['underground'] });       // C2
      M.chip(c, 'SCHEMATIC · NOT TO SCALE', CX, 1340, { align: 'center', size: 30, bg: '#24364f', color: '#dfe7f2' });
      M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 2 HOW MUCH: top view of the real curved alignment; a concrete shell grows along it; counter lands on 150 m (C3)
  { dur: sc[2].sceneDur, trans: { kind: 'zoom', dur: .4 }, draw: (c, t) => {
      bg(c); const D = sc[2].sceneDur, P = p => [CX + (p[0] - 1100) * 1.7, 1080 - (p[1] + 20) * 1.7];
      c.save(); c.beginPath(); c.rect(0, 0, W, 1205); c.clip();
      // library outline (dashed) and track
      c.save(); c.setLineDash([14, 10]); c.strokeStyle = 'rgba(223,233,245,.8)'; c.lineWidth = 4; c.beginPath(); LIB.forEach((q, i) => { const s = P(q); i ? c.lineTo(...s) : c.moveTo(...s); }); c.closePath(); c.stroke(); c.restore();
      M.text(c, 'library', P([1215, 110])[0] + 16, P([1215, 110])[1], { size: 40, weight: 700, color: '#dfe9f5', base: 'middle', stroke: 4, strokeColor: '#06101f' });
      c.strokeStyle = RED; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); TRACK.forEach((q, i) => { const s = P(q); i ? c.lineTo(...s) : c.moveTo(...s); }); c.stroke();
      // shell grows along 150 m of the alignment (position schematic)
      const g = M.seg(t, .15, D * .8, 'inOutCubic'), s0 = 70, L = 150 * g; c.strokeStyle = 'rgba(176,182,190,.92)'; c.lineWidth = 46; c.lineCap = 'butt'; c.beginPath();
      for (let s = 0; s <= L; s += 3) { const q = along(TRACK, s0 + s), p = P(q); s ? c.lineTo(...p) : c.moveTo(...p); } if (L > 1) c.stroke();
      c.strokeStyle = RED; c.lineWidth = 8; c.beginPath(); for (let s = 0; s <= L; s += 3) { const p = P(along(TRACK, s0 + s)); s ? c.lineTo(...p) : c.moveTo(...p); } if (L > 1) c.stroke();
      c.restore();
      band(c, 240, 700, .6);
      M.counter(c, 150, M.seg(t, .1, D * .8), CX, 300, { size: 260, slam: true, decimals: 0, suffix: ' m' });     // C3
      M.chip(c, 'ENCASED IN CONCRETE', CX, 610, { align: 'center', size: 52, alpha: M.seg(t, .5, .8) });           // C3
      M.text(c, 'top view · shell position schematic', CX, 1222, { size: 26, weight: 500, align: 'center', color: '#9fb0c8', shadow: false });
      north(c); M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 3 WHEN: counter 18 MONTHS; nine weekend tiles stamp SHUTDOWN one by one (C4)
  { dur: sc[3].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      bg(c); const D = sc[3].sceneDur, st = sc[3].start - sc[3].sceneStart;
      M.counter(c, 18, M.seg(t, .05, .9), CX, 300, { size: 260, slam: true, decimals: 0 });                      // C4
      M.text(c, 'MONTHS', CX, 560, { size: 96, weight: 800, align: 'center', color: M.house.gold, alpha: M.seg(t, .3, .6) });
      for (let i = 0; i < 9; i++) { const col = i % 3, row = Math.floor(i / 3), x = CX - 330 + col * 230, y = 820 + row * 150;
        const k = M.seg(t, st + .6 + i * .17, st + .85 + i * .17, 'outBack');
        M.rr(c, x - 100, y, 200, 130, 16); c.fillStyle = '#1b3a66'; c.fill();
        M.text(c, 'SAT · SUN', x, y + 18, { size: 30, weight: 700, align: 'center', color: '#9fb0c8', shadow: false });
        if (k > 0) { c.save(); c.translate(x, y + 86); c.rotate(-.12); const z = M.lerp(1.8, 1, k); c.scale(z, z); c.globalAlpha = Math.min(1, k * 1.6);
          M.rr(c, -92, -26, 184, 52, 8); c.fillStyle = RED; c.fill(); M.text(c, 'SHUTDOWN', 0, -17, { size: 30, weight: 800, align: 'center', color: '#fff', shadow: false }); c.restore(); } }
      M.text(c, 'only 9 weekend shutdowns', CX, 700, { size: 60, weight: 800, align: 'center', alpha: M.seg(t, st + 2.0, st + 2.4), highlight: ['9'] });   // C4
      M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 4 FIRST: dusk orbit around the library, train passing beneath; stamp A CALGARY FIRST (C5)
  { dur: sc[4].sceneDur, trans: { kind: 'dissolve', dur: .4 }, draw: (c, t) => {
      const D = sc[4].sceneDur, w = M.world({ sky: 'dusk', fog: { near: 2500, far: 8000, max: .4 } });
      city(w, t + 1);
      w.render(c, M.camera(M.moves.orbit(LIBC, 520, 260, 215, 40, M.seg(t, 0, D, 'inOutSine')), W, H));
      band(c, 260, 820, .7);
      stamp(c, 'A CALGARY FIRST', 360, M.seg(t, .3, .65, 'outBack'), { size: 92 });                                          // C5
      M.text(c, 'built over an active', CX, 540, { size: 72, weight: 700, align: 'center', alpha: M.seg(t, .9, 1.3) });   // C5
      M.text(c, 'CTrain line', CX, 630, { size: 72, weight: 800, align: 'center', color: '#ff8a8a', alpha: M.seg(t, .9, 1.3) });
      M.source(c, MAPC, 60, 1430, { size: 20 }); M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 5 QUESTION: one-word answer, held ~1.3 s after the voice; no end card (video under 2:00)
  { dur: sc[5].sceneDur, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
      const p = M.seg(t, 0, sc[5].sceneDur, 'linear');
      c.save(); c.globalAlpha = .3; c.strokeStyle = RED; c.lineWidth = 10; c.beginPath(); c.moveTo(-50, 1560); c.quadraticCurveTo(540, 1440, 1130, 1620); c.stroke(); c.restore();
      M.closer(c, 'Did you know? Yes or no?', p, W, H, { highlight: ['yes', 'no'] });
  } },
], overlay: (c, t, info) => {
  if (THUMB) return;
  if (t > 3 && info.index < 5) M.header(c, window.LOGO, W, H);
  if (info.index < 5) M.caption(c, S.captionAt(t), W, H, { bottom: 1410 });
} });

window.CUES = () => [
  { t: 0.0, sfx: 'impact', gain: -5 }, { t: .2, sfx: 'whoosh', gain: -11 }, { t: .75, sfx: 'pop', gain: -11 },
  { t: sc[1].sceneStart - .2, sfx: 'whoosh', gain: -9 }, { t: sc[1].sceneStart + 1.4, sfx: 'whoosh', gain: -14 },
  { t: sc[2].sceneStart - .2, sfx: 'whoosh', gain: -10 }, { t: sc[2].sceneStart + .15, sfx: 'ticks', dur: sc[2].sceneDur * .6, gain: -16 },
  { t: sc[2].sceneStart + sc[2].sceneDur * .8, sfx: 'impact', gain: -9 },
  { t: sc[3].sceneStart - .2, sfx: 'whoosh', gain: -10 }, { t: sc[3].sceneStart + .8, sfx: 'impact', gain: -10 },
  ...Array.from({ length: 9 }, (_, i) => ({ t: sc[3].start + .7 + i * .17, sfx: 'stamp', gain: -17 })),
  { t: sc[4].sceneStart - .2, sfx: 'whoosh', gain: -11 }, { t: sc[4].sceneStart + .55, sfx: 'stamp', gain: -7 },
  { t: sc[5].sceneStart - .15, sfx: 'whoosh', gain: -12 },
];
window.TOTAL = () => S.total;
