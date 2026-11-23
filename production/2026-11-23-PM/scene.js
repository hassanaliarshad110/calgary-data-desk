/* 2026-11-23 PM fun fact: "Prince's Island was never named after a prince."
 * Lead identity Data Explainer (kinetic hook, icon strike + stamp, name card, chips), borrowing a Storyteller map dive
 * over real Calgary onto Prince's Island (S0) and a Civic-style schematic "how it works" diagram (S3-S4).
 * Every on-screen fact maps to the audited claims table (packages/2026-11-23-PM-princes-island.md, C1-C9;
 * audits/2026-11-23-PM.md, APPROVED round 1).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30, THUMB = !!(window.PARAMS && window.PARAMS.thumb);
const DURS = (window.PARAMS && window.PARAMS.durs) ? window.PARAMS.durs.split(',').map(Number) : [2.8, 3.6, 5.6, 5.5, 3.4];
const S = M.script([
  { text: "Prince's Island was never named after a prince.", dur: DURS[0] },
  { text: "It's named after a lumberman from Quebec, Peter Anthony Prince.", dur: DURS[1] },
  { text: 'His company dug a channel to float logs in from Kananaskis, and that channel cut off an island.', dur: DURS[2] },
  { text: "Today the channel is the lagoon. And near it, he built Calgary's first hydro-electric plant.", dur: DURS[3] },
  { text: 'Did you know this? Yes or no. Drop your thoughts below.', dur: DURS[4] },
], { lead: .25, gap: .2, tail: .4 });
const sc = S.scenes, SPLIT = 1.8;
const SRC = 'Sources: City of Calgary · CBC News · Daily Hive';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const GOLD = M.house.gold, RED = '#C8102E', RIVER = '#3d8bd8', ICE = '#cfe8ff', LAND = '#1d3b2a';
const ISLE = (M.geo.lm && M.geo.lm("Prince's Island Park")) || [58.6, 1155.2, 0];   // C7

function navyBg(c, top = '#0e2b52', bot = '#081428') { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function dark(c, y0, y1, a = .62) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.2, `rgba(7,13,24,${a})`); g.addColorStop(.8, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); }
function stamp(c, txt, x, y, k, o = {}) {
  if (k <= 0) return; const s = M.lerp(1.8, 1, Math.min(1, k)); c.save(); c.translate(x, y); c.rotate(o.rot ?? -.05); c.scale(s, s); c.globalAlpha = Math.min(1, k * 1.5);
  c.font = M.font(o.size || 104, 800); const w = c.measureText(txt).width + 70, h = (o.size || 104) * 1.45;
  M.rr(c, -w / 2, -h / 2, w, h, 20); c.fillStyle = o.bg || 'rgba(7,13,24,.88)'; c.fill(); c.lineWidth = 9; c.strokeStyle = o.color || GOLD; c.stroke();
  M.text(c, txt, 0, -(o.size || 104) * .56, { size: o.size || 104, weight: 800, align: 'center', color: o.color || GOLD, shadow: false });
  c.restore();
}
function crown(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s); c.shadowColor = 'rgba(242,182,50,.6)'; c.shadowBlur = 40;
  c.fillStyle = GOLD; c.beginPath(); c.moveTo(-220, 120); c.lineTo(-240, -110); c.lineTo(-120, 0); c.lineTo(0, -170); c.lineTo(120, 0); c.lineTo(240, -110); c.lineTo(220, 120); c.closePath(); c.fill();
  c.shadowBlur = 0; c.fillStyle = '#b8860b'; c.fillRect(-222, 80, 444, 50);
  for (const [px, py] of [[-240, -110], [0, -170], [240, -110]]) { c.fillStyle = RED; c.beginPath(); c.arc(px, py, 26, 0, 7); c.fill(); }
  c.restore();
}
function saw(c, x, y, r, ang) {
  c.save(); c.translate(x, y); c.rotate(ang); c.fillStyle = '#c9d3dd'; c.beginPath();
  const n = 24; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + .5) / n * Math.PI * 2; c.lineTo(Math.cos(a0) * r, Math.sin(a0) * r); c.lineTo(Math.cos(a1) * r * 1.13, Math.sin(a1) * r * 1.13); }
  c.closePath(); c.fill(); c.fillStyle = '#8796a6'; c.beginPath(); c.arc(0, 0, r * .62, 0, 7); c.fill(); c.fillStyle = '#0b1f3a'; c.beginPath(); c.arc(0, 0, r * .16, 0, 7); c.fill();
  c.restore();
}
function log_(c, x, y, ang = 0) { c.save(); c.translate(x, y); c.rotate(ang); c.fillStyle = '#8b5a2b'; M.rr(c, -46, -13, 92, 26, 13); c.fill(); c.fillStyle = '#c48a4e'; c.beginPath(); c.ellipse(46, 0, 8, 13, 0, 0, 7); c.fill(); c.restore(); }
function bulb(c, x, y, k, t) {
  if (k <= 0) return; c.save(); const on = Math.min(1, k);
  const g = c.createRadialGradient(x, y, 10, x, y, 240); g.addColorStop(0, `rgba(255,220,120,${.75 * on * (.85 + .15 * Math.sin(t * 6))})`); g.addColorStop(1, 'rgba(255,220,120,0)'); c.fillStyle = g; c.fillRect(x - 250, y - 250, 500, 500);
  c.fillStyle = on > .5 ? '#ffe9a8' : '#8a97a8'; c.beginPath(); c.arc(x, y, 62, 0, 7); c.fill(); c.fillStyle = '#6d7a8a'; c.fillRect(x - 32, y + 52, 64, 50); c.fillStyle = '#4c5866'; c.fillRect(x - 26, y + 102, 52, 14);
  c.strokeStyle = '#c4862a'; c.lineWidth = 6; c.beginPath(); c.moveTo(x - 20, y + 30); c.lineTo(x - 10, y - 12); c.lineTo(x, y + 10); c.lineTo(x + 10, y - 12); c.lineTo(x + 20, y + 30); c.stroke();
  c.restore();
}
// recurring SCHEMATIC (top view, north up, river W->E): river band, channel loop to the south, island between, mill on the south bank
const RY0 = 700, RY1 = 820;
const CH = [[150, 820], [220, 940], [300, 980], [760, 980], [850, 940], [900, 820]];
function chPoint(u) { u = Math.max(0, Math.min(1, u)); const seg = CH.length - 1, f = Math.min(seg - 1e-6, u * seg), i = Math.floor(f), r = f - i; return [M.lerp(CH[i][0], CH[i + 1][0], r), M.lerp(CH[i][1], CH[i + 1][1], r)]; }
function schematic(c, t, o) {
  navyBg(c, '#0a1d38', '#06101f');
  c.fillStyle = LAND; c.fillRect(0, 630, W, 660);                                          // land
  c.fillStyle = RIVER; c.fillRect(0, RY0, W, RY1 - RY0);                                     // Bow River
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 4; for (let i = 0; i < 9; i++) { const x = ((t * 140 + i * 140) % (W + 140)) - 70; c.beginPath(); c.moveTo(x, 735 + (i % 3) * 30); c.lineTo(x + 50, 735 + (i % 3) * 30); c.stroke(); }
  const p = o.ch ?? 1;
  if (o.isle > 0) { c.save(); c.globalAlpha = Math.min(1, o.isle); c.fillStyle = '#2f6b3f'; c.beginPath(); c.moveTo(CH[0][0], RY1); for (const q of CH) c.lineTo(q[0], q[1] - 30); c.lineTo(CH[5][0], RY1); c.closePath(); c.fill();
    c.strokeStyle = GOLD; c.lineWidth = 8; c.stroke(); c.restore(); }
  if (p > 0) { c.save(); c.strokeStyle = o.ice ? `rgba(207,232,255,${.6 + .4 * o.ice})` : RIVER; c.lineWidth = 64 + 16 * (o.ice || 0); c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
    for (let i = 0; i <= 60 * p; i++) { const [x, y] = chPoint(i / 60); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore(); }
  if (!o.ice) for (let i = 0; i < 5; i++) { const x = ((t * 110 + i * 230) % (W + 200)) - 100; log_(c, x, 745 + (i % 2) * 30, .05); }
  if (p >= 1 && !o.ice) for (let i = 0; i < 3; i++) { const u = ((t * .18 + i / 3) % 1); const [x, y] = chPoint(u); log_(c, x, y, 0); }
  if (o.ice) for (let i = 0; i < 2; i++) { const u = .25 + .5 * ((Math.sin(t * .9 + i * 2) + 1) / 2); const [x, y] = chPoint(u); c.fillStyle = i ? RED : '#0e2b52'; c.beginPath(); c.arc(x, y, 14, 0, 7); c.fill(); }
  c.fillStyle = '#6b4a2b'; c.fillRect(300, 1050, 170, 100); c.fillStyle = '#4a3220'; c.beginPath(); c.moveTo(290, 1050); c.lineTo(385, 1000); c.lineTo(480, 1050); c.fill();   // mill (C9)
  M.text(c, 'MILL', 385, 1155, { size: 48, weight: 800, align: 'center', color: '#fff' });
  if (!o.ice) M.text(c, 'BOW RIVER', 60, 642, { size: 48, weight: 800, color: '#bfe0ff' });
  if (p > .5 && !o.ice) M.text(c, 'CHANNEL', 760, 1020, { size: 48, weight: 800, align: 'center', color: '#bfe0ff' });
  if (o.isle > .3) M.text(c, 'ISLAND', 525, 845, { size: 84, weight: 800, align: 'center', color: GOLD });
  M.text(c, 'N ↑', 960, 650, { size: 32, weight: 700, color: '#fff' });
  M.text(c, 'SCHEMATIC · NOT TO SCALE', 560, 1160, { size: 26, weight: 700, color: 'rgba(255,255,255,.75)' });
  M.source(c, SRC, 60, 265, { size: 20 });
}

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // S0 HOOK (0-1.8 s): frame 0 already diving over real Calgary onto Prince's Island; hook punches from frame 0 (C1, C7)
  { dur: SPLIT, trans: { kind: 'zoom', dur: .3 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 9000, far: 52000, max: .4 } }); M.geo.addBase(w, { buildings: true, roads: true, windows: '#ffd890' });
      M.pin(w, ISLE, "PRINCE'S ISLAND", { p: THUMB ? 1 : M.seg(t, .2, .7, 'linear'), size: 50, scale: 1.3 }); M.ping(w, ISLE, t, { r: 150 });
      const cam = M.camera(M.moves.dive(ISLE, THUMB ? .78 : M.seg(t, 0, SPLIT + .8, 'outCubic'), { h0: 16000, h1: 2400, back0: 1, back1: 3400, ahead: 200 }), W, H); w.render(c, cam);
      M.source(c, MAPC, 60, 1460, { size: 20 }); M.text(c, 'N ↑', 60, 1400, { size: 32, weight: 700, color: '#fff' });
      if (THUMB) return;
      dark(c, 150, 720, .66);
      M.kinetic(c, 'Not named after a prince', t, CX, 250, { t0: -.45, size: 128, maxW: 920, highlight: ['prince'], every: .09 });
  } },
  // S1 the myth breaks: crown drops, red strike, stamp NOT ROYALTY (C1)
  { dur: sc[0].sceneDur - SPLIT, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      const k = M.seg(t, 0, .45, 'outBack'); crown(c, CX, M.lerp(420, 760, Math.min(1, k)), .95);
      const s = M.seg(t, .5, .8, 'outCubic'); if (s > 0) { c.save(); c.strokeStyle = RED; c.lineWidth = 34; c.lineCap = 'round'; c.beginPath(); c.moveTo(CX - 300, 520); c.lineTo(CX - 300 + 600 * s, 520 + 460 * s); c.stroke(); c.restore(); }
      stamp(c, 'NOT ROYALTY', CX, 1180, M.seg(t, .7, 1.0, 'outBack'), { size: 104 });
  } },
  // S2 who: saw blade spins, name card PETER ANTHONY PRINCE, chip LUMBERMAN FROM QUEBEC (C2)
  { dur: sc[1].sceneDur, trans: { kind: 'whip', dur: .3 }, draw: (c, t) => {
      navyBg(c, '#13284a', '#0a1428');
      saw(c, CX, 640, 200 * Math.min(1, M.seg(t, 0, .4, 'outBack')), t * 4);
      const k = M.seg(t, .35, .8, 'outCubic'); if (k > 0) { c.save(); c.globalAlpha = Math.min(1, k); const y = M.lerp(1000, 900, k);
        c.fillStyle = 'rgba(7,13,24,.9)'; M.rr(c, 40, y - 30, 900, 290, 26); c.fill(); c.strokeStyle = GOLD; c.lineWidth = 6; c.stroke();
        M.text(c, 'PETER ANTHONY', CX, y, { size: 110, weight: 800, align: 'center', color: '#fff' }); M.text(c, 'PRINCE', CX, y + 120, { size: 110, weight: 800, align: 'center', color: GOLD }); c.restore(); }
      const k2 = M.seg(t, 1.2, 1.55, 'outBack'); if (k2 > 0) M.chip(c, 'LUMBERMAN FROM QUEBEC', CX, 380, { align: 'center', size: 56, alpha: Math.min(1, k2) });
      M.source(c, SRC, 60, 1230, { size: 20 });
  } },
  // S3 how: logs float on the Bow, the channel is dug, the land between becomes ISLAND (C3, C4, C9)
  { dur: sc[2].sceneDur, trans: { kind: 'zoom', dur: .35 }, draw: (c, t) => {
      schematic(c, t, { ch: M.seg(t, .9, 2.6, 'inOutCubic'), isle: M.seg(t, 3.0, 3.6, 'outCubic') });
      const k = M.seg(t, .2, .55, 'outBack'); if (k > 0) M.chip(c, 'LOGS FROM KANANASKIS', CX, 320, { align: 'center', size: 56, alpha: Math.min(1, k) });
      const k2 = M.seg(t, 3.1, 3.45, 'outBack'); if (k2 > 0) stamp(c, 'AN ISLAND', CX, 545, k2, { size: 96 });
  } },
  // S4 now: channel turns to the skating lagoon; bulb lights near its east end; stamp CALGARY'S FIRST + HYDRO-ELECTRIC PLANT (C5, C6)
  { dur: sc[3].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      schematic(c, t, { ch: 1, isle: 1, ice: M.seg(t, .2, 1.0, 'inOutCubic') });
      const k = M.seg(t, .5, .85, 'outBack'); if (k > 0) M.chip(c, 'TODAY: THE LAGOON', CX, 320, { align: 'center', size: 56, alpha: Math.min(1, k) });
      bulb(c, 900, 1040, M.seg(t, 2.0, 2.4, 'outCubic'), t);
      const k2 = M.seg(t, 2.3, 2.65, 'outBack'); if (k2 > 0) { stamp(c, "CALGARY'S FIRST", CX, 515, k2, { size: 92 }); M.chip(c, 'HYDRO-ELECTRIC PLANT', CX, 615, { align: 'center', size: 56, alpha: Math.min(1, k2), bg: '#ffffff' }); }
  } },
  // S5 QUESTION: no end card (under 2:00)
  { dur: sc[4].sceneDur, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      M.closer(c, 'Did you know this? Yes or no?', M.seg(t, 0, sc[4].sceneDur, 'linear'), W, H, { highlight: ['yes', 'no?'] });
  } },
], overlay: (c, t, info) => {
  if (THUMB) return;
  if (t > 3 && info.index < 5) M.header(c, window.LOGO, W, H);
  if (info.index < 5) M.caption(c, S.captionAt(t), W, H);
} });

window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.02, sfx: 'impact', gain: -5 },
  { t: SPLIT - .15, sfx: 'whoosh', gain: -11 }, { t: SPLIT + .3, sfx: 'pop', gain: -10 }, { t: SPLIT + .5, sfx: 'whoosh', dur: .4, gain: -12 }, { t: SPLIT + .7, sfx: 'stamp', gain: -7 },
  { t: sc[1].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[1].sceneStart + .4, sfx: 'pop', gain: -11 }, { t: sc[1].sceneStart + 1.2, sfx: 'pop', gain: -10 },
  { t: sc[2].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[2].sceneStart + .2, sfx: 'pop', gain: -11 }, { t: sc[2].sceneStart + .9, sfx: 'ticks', dur: 1.6, gain: -13 }, { t: sc[2].sceneStart + 3.1, sfx: 'stamp', gain: -7 },
  { t: sc[3].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[3].sceneStart + .5, sfx: 'pop', gain: -11 }, { t: sc[3].sceneStart + 2.0, sfx: 'pop', gain: -10 }, { t: sc[3].sceneStart + 2.3, sfx: 'stamp', gain: -7 },
  { t: sc[4].sceneStart - .15, sfx: 'whoosh', gain: -12 },
];
