/* 2026-11-24 PM fun fact: "The Calgary Herald was first printed in a tent."
 * Lead identity Data Explainer (kinetic hook, stamps, chips, masthead type), borrowing a Storyteller map dive over
 * real Calgary onto the Bow-Elbow confluence (S0), a Civic-style schematic (S2) and a process build (S3).
 * Every on-screen fact maps to the audited claims table (packages/2026-11-24-PM-herald-tent.md, C1-C9; audits/2026-11-24-PM.md).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30, THUMB = !!(window.PARAMS && window.PARAMS.thumb);
const DURS = (window.PARAMS && window.PARAMS.durs) ? window.PARAMS.durs.split(',').map(Number) : [2.6, 5.2, 4.4, 4.6, 3.4];
const S = M.script([
  { text: 'The Calgary Herald was first printed in a tent.', dur: DURS[0] },
  { text: 'In eighteen eighty-three, a teacher and a printer pitched it where the Bow and Elbow rivers meet.', dur: DURS[1] },
  { text: 'Their hand press came by train. The first issue: a four-page weekly.', dur: DURS[2] },
  { text: 'Its name? The Calgary Herald, Mining and Ranche Advocate and General Advertiser.', dur: DURS[3] },
  { text: 'Did you know this? Yes or no. Drop your thoughts below.', dur: DURS[4] },
], { lead: .25, gap: .2, tail: .4 });
const sc = S.scenes, SPLIT = 1.8;
const SRC = 'Sources: Heritage Calgary · The Canadian Encyclopedia · Encyclopedia of the Great Plains';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const GOLD = M.house.gold, RED = '#C8102E', RIVER = '#3d8bd8', PAPER = '#efe6cf', INK = '#1a1a1a', CANVAS = '#d8c39a', LAND = '#1d3b2a';
const CONF = (M.geo.lm && M.geo.lm('Fort Calgary')) || [1400, 700, 0];   // C9: beside the Bow-Elbow confluence

function navyBg(c, top = '#0e2b52', bot = '#081428') { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function dark(c, y0, y1, a = .62) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.2, `rgba(7,13,24,${a})`); g.addColorStop(.8, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); }
function stamp(c, txt, x, y, k, o = {}) {
  if (k <= 0) return; const sz = o.size || 104, s = M.lerp(1.8, 1, Math.min(1, k)); c.save(); c.translate(x, y); c.rotate(o.rot ?? -.05); c.scale(s, s); c.globalAlpha = Math.min(1, k * 1.5);
  c.font = M.font(sz, 800); const w = c.measureText(txt).width + 70, h = sz * 1.45;
  M.rr(c, -w / 2, -h / 2, w, h, 20); c.fillStyle = o.bg || 'rgba(7,13,24,.88)'; c.fill(); c.lineWidth = 9; c.strokeStyle = o.color || GOLD; c.stroke();
  M.text(c, txt, 0, -sz * .56, { size: sz, weight: 800, align: 'center', color: o.color || GOLD, shadow: false });
  c.restore();
}
function serif(c, txt, x, y, size, color = INK, align = 'center') { c.save(); c.font = `700 ${size}px Georgia, 'Times New Roman', serif`; c.fillStyle = color; c.textAlign = align; c.textBaseline = 'top'; c.fillText(txt, x, y); c.restore(); }
function tent(c, x, y, s, flap = 0) {   // tan A-frame canvas tent, base centre at (x, y)
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(0, 6, 300, 26, 0, 0, 7); c.fill();
  c.fillStyle = CANVAS; c.beginPath(); c.moveTo(-290, 0); c.lineTo(0, -330); c.lineTo(290, 0); c.closePath(); c.fill();
  c.fillStyle = '#b89f72'; c.beginPath(); c.moveTo(0, -330); c.lineTo(290, 0); c.lineTo(150, 0); c.closePath(); c.fill();
  c.fillStyle = '#3a2a18'; c.beginPath(); c.moveTo(-70, 0); c.lineTo(0, -200); c.lineTo(70, 0); c.closePath(); c.fill();   // door
  c.fillStyle = '#e8d6ae'; c.beginPath(); c.moveTo(0, -200); c.lineTo(70, 0); c.lineTo(70 + 50 * flap, 0); c.lineTo(0, -200); c.closePath(); c.fill();
  c.strokeStyle = '#6b5432'; c.lineWidth = 8; c.beginPath(); c.moveTo(0, -330); c.lineTo(0, -380); c.stroke();
  c.fillStyle = RED; c.beginPath(); c.moveTo(0, -380); c.lineTo(60 + 6 * Math.sin(flap * 9), -365); c.lineTo(0, -350); c.fill();
  c.restore();
}
function paper(c, x, y, w, h, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = PAPER; c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 30; c.fillRect(-w / 2, -h / 2, w, h); c.shadowBlur = 0;
  c.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 7; i++) c.fillRect(-w / 2 + 40, -h / 2 + h * .42 + i * h * .07, w - 80, 8); c.restore(); }
function train(c, x, y) {   // stylised locomotive + flatcar with the HAND PRESS crate, facing left
  c.save(); c.translate(x, y);
  c.fillStyle = '#1b2633'; M.rr(c, 0, -150, 300, 130, 14); c.fill(); c.fillRect(220, -250, 90, 230); c.fillRect(40, -220, 50, 80);
  c.fillStyle = '#C8102E'; c.fillRect(0, -40, 320, 18); c.fillStyle = '#0a0f16'; for (const wx of [60, 160, 260]) { c.beginPath(); c.arc(wx, -8, 34, 0, 7); c.fill(); }
  c.fillStyle = '#2b3a4c'; c.fillRect(340, -40, 360, 26); for (const wx of [400, 640]) { c.fillStyle = '#0a0f16'; c.beginPath(); c.arc(wx, -8, 30, 0, 7); c.fill(); }
  c.restore();
}
function crate(c, x, y, k = 1) { c.save(); c.translate(x, y); c.fillStyle = '#9a6b3c'; c.fillRect(-150, -150, 300, 150); c.strokeStyle = '#6b4523'; c.lineWidth = 8; c.strokeRect(-150, -150, 300, 150);
  c.beginPath(); c.moveTo(-150, -150); c.lineTo(150, 0); c.moveTo(150, -150); c.lineTo(-150, 0); c.stroke(); c.restore(); }
function smoke(c, x, y, t) { for (let i = 0; i < 5; i++) { const u = ((t * .9 + i / 5) % 1); c.fillStyle = `rgba(220,225,232,${.5 * (1 - u)})`; c.beginPath(); c.arc(x + u * 120, y - u * 260, 30 + u * 60, 0, 7); c.fill(); } }
function press(c, x, y, down) {   // hand press: frame + platen moving down onto the bed
  c.save(); c.translate(x, y); c.fillStyle = '#2b3a4c'; c.fillRect(-200, -380, 40, 380); c.fillRect(160, -380, 40, 380); c.fillRect(-200, -400, 400, 50);
  c.fillStyle = '#4c5d72'; c.fillRect(-170, -330 + 170 * down, 340, 50); c.fillStyle = '#7a8aa0'; c.fillRect(-10, -350, 20, 20 + 170 * down);
  c.fillStyle = '#1b2633'; c.fillRect(-240, -20, 480, 30); c.fillStyle = PAPER; c.fillRect(-150, -60, 300, 40);
  c.restore();
}
// recurring SCHEMATIC (north up): Bow flows W->E, Elbow flows up from the south and joins it at J
const J = [620, 860];
function rivers(c, t, k) {
  c.fillStyle = LAND; c.fillRect(0, 560, W, 760);
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = RIVER; c.lineWidth = 110;
  const bow = [[-60, 760], [250, 790], [J[0], J[1]], [860, 900], [1140, 880]]; const kb = Math.min(1, k * 1.4);
  c.beginPath(); for (let i = 0; i <= 40 * kb; i++) { const f = i / 40 * (bow.length - 1), a = Math.floor(Math.min(f, bow.length - 1.0001)), r = f - a; const x = M.lerp(bow[a][0], bow[a + 1][0], r), y = M.lerp(bow[a][1], bow[a + 1][1], r); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  const elb = [[760, 1330], [700, 1150], [660, 1000], [J[0], J[1]]]; const ke = M.seg(k, .35, 1, 'linear'); c.lineWidth = 80;
  if (ke > 0) { c.beginPath(); for (let i = 0; i <= 30 * ke; i++) { const f = i / 30 * (elb.length - 1), a = Math.floor(Math.min(f, elb.length - 1.0001)), r = f - a; const x = M.lerp(elb[a][0], elb[a + 1][0], r), y = M.lerp(elb[a][1], elb[a + 1][1], r); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
  c.restore();
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 4; for (let i = 0; i < 7; i++) { const x = ((t * 140 + i * 170) % (W + 140)) - 70; const y = x < J[0] ? M.lerp(760, 860, Math.max(0, x) / J[0]) : 880; c.beginPath(); c.moveTo(x, y - 10 + (i % 2) * 20); c.lineTo(x + 50, y - 10 + (i % 2) * 20); c.stroke(); }
  if (kb > .6) M.text(c, 'BOW RIVER', 60, 655, { size: 48, weight: 800, color: '#bfe0ff' });
  if (ke > .6) M.text(c, 'ELBOW RIVER', 745, 1030, { size: 48, weight: 800, color: '#bfe0ff' });
  M.text(c, 'N ↑', 960, 600, { size: 32, weight: 700, color: '#fff' });
  M.text(c, 'SCHEMATIC · NOT TO SCALE', 60, 1270, { size: 26, weight: 700, color: 'rgba(255,255,255,.75)' });
}

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // S0 HOOK (0-1.8 s): frame 0 already diving over real Calgary onto the Bow-Elbow confluence; hook punches from frame 0 (C1, C9)
  { dur: SPLIT, trans: { kind: 'zoom', dur: .3 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 9000, far: 52000, max: .4 } }); M.geo.addBase(w, { buildings: true, roads: true, windows: '#ffd890' });
      M.pin(w, CONF, 'BOW + ELBOW', { p: THUMB ? 1 : M.seg(t, .2, .7, 'linear'), size: 50, scale: 1.3 }); M.ping(w, CONF, t, { r: 150 });
      const cam = M.camera(M.moves.dive(CONF, THUMB ? .78 : M.seg(t, 0, SPLIT + .8, 'outCubic'), { h0: 16000, h1: 2400, back0: 1, back1: 3400, ahead: 200 }), W, H); w.render(c, cam);
      M.source(c, MAPC, 60, 1460, { size: 20 }); M.text(c, 'N ↑', 60, 1400, { size: 32, weight: 700, color: '#fff' });
      if (THUMB) return;
      dark(c, 150, 720, .66);
      M.kinetic(c, 'Printed in a tent', t, CX, 250, { t0: -.45, size: 128, maxW: 920, highlight: ['tent'], every: .1 });
  } },
  // S1 the twist: masthead CALGARY HERALD slams in, the canvas tent drops over it, stamp 1883 (C1, C2)
  { dur: sc[0].sceneDur - SPLIT, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      const d = M.seg(t, 0, .35, 'outBack'); if (d > 0) tent(c, CX, M.lerp(-300, 1060, Math.min(1, d)), 1.45, Math.sin(t * 3) * .5 + .5);
      const k = M.seg(t, .3, .6, 'outBack'); if (k > 0) { c.save(); c.globalAlpha = Math.min(1, k); const z = M.lerp(1.5, 1, Math.min(1, k)); c.translate(CX, 1010); c.scale(z, z); c.translate(-CX, -1010);
        paper(c, CX, 1010, 640, 330, -.03); serif(c, 'CALGARY', CX, 870, 96); serif(c, 'HERALD', CX, 970, 96); c.restore(); }
      stamp(c, '1883', CX, 400, M.seg(t, .55, .85, 'outBack'), { size: 120 });
      M.source(c, SRC, 60, 1420, { size: 20 });
  } },
  // S2 when, who, where: rivers draw in, tent pin drops at the meeting point, date + name chips (C2, C3, C4)
  { dur: sc[1].sceneDur, trans: { kind: 'whip', dur: .3 }, draw: (c, t) => {
      navyBg(c, '#0a1d38', '#06101f');
      rivers(c, t, M.seg(t, 0, 1.4, 'inOutCubic'));
      const d = M.seg(t, 1.3, 1.7, 'outBack'); if (d > 0) { tent(c, J[0] - 40, M.lerp(560, J[1] - 40, Math.min(1, d)), .42, .5);
        if (d >= 1) { const r = ((t - 1.7) % 1.2) / 1.2; c.strokeStyle = `rgba(242,182,50,${1 - r})`; c.lineWidth = 6; c.beginPath(); c.arc(J[0] - 40, J[1] - 60, 40 + 120 * r, 0, 7); c.stroke(); } }
      const k0 = M.seg(t, .15, .5, 'outBack'); if (k0 > 0) M.chip(c, 'AUG 31, 1883', CX, 300, { align: 'center', size: 64, alpha: Math.min(1, k0) });
      const k1 = M.seg(t, 1.9, 2.25, 'outBack'); if (k1 > 0) M.chip(c, 'THOMAS BRADEN · TEACHER', CX, 420, { align: 'center', size: 50, alpha: Math.min(1, k1), bg: '#ffffff' });
      const k2 = M.seg(t, 2.4, 2.75, 'outBack'); if (k2 > 0) M.chip(c, 'ANDREW ARMOUR · PRINTER', CX, 510, { align: 'center', size: 50, alpha: Math.min(1, k2), bg: '#ffffff' });
      M.source(c, SRC, 60, 1310, { size: 20 });
  } },
  // S3 how: train delivers the HAND PRESS crate, press stamps, four pages fan out, stamp 4 PAGES · WEEKLY (C5, C6, C7)
  { dur: sc[2].sceneDur, trans: { kind: 'zoom', dur: .35 }, draw: (c, t) => {
      navyBg(c, '#13284a', '#0a1428');
      const half = sc[2].sceneDur * .42;
      if (t < half) {
        c.fillStyle = '#5a4a3a'; c.fillRect(0, 1000, W, 14); for (let x = 0; x < W; x += 60) c.fillRect(x, 1014, 30, 18);
        const tx = M.lerp(W + 50, 120, M.seg(t, 0, 1.0, 'outCubic'));
        smoke(c, tx + 260, 750, t); train(c, tx, 1000); crate(c, tx + 520, 960);
        c.save(); c.translate(tx + 520, 880); M.text(c, 'HAND PRESS', 0, -175, { size: 56, weight: 800, align: 'center', color: GOLD }); c.restore();
      } else {
        const u = t - half; const down = Math.max(0, Math.sin(Math.min(u, 1.2) / 1.2 * Math.PI * 2)) ;
        press(c, CX, 780, down);
        for (let i = 0; i < 4; i++) { const k = M.seg(u, .9 + i * .18, 1.2 + i * .18, 'outBack'); if (k <= 0) continue;
          const x = CX + (i - 1.5) * 220, y = 1060; c.save(); c.globalAlpha = Math.min(1, k); paper(c, x, y, 190, 250, (i - 1.5) * .08);
          M.text(c, String(i + 1), x, y - 60, { size: 96, weight: 800, align: 'center', color: INK, shadow: false }); c.restore(); }
        stamp(c, '4 PAGES · WEEKLY', CX, 330, M.seg(u, 1.7, 2.0, 'outBack'), { size: 88 });
      }
      M.source(c, SRC, 60, 1400, { size: 20 });
  } },
  // S4 payoff: the full original name builds line by line on a newspaper page (C8)
  { dur: sc[3].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      const k = M.seg(t, 0, .35, 'outCubic'); c.save(); c.globalAlpha = Math.min(1, k); paper(c, CX, 880, 980, 720, -.02); c.restore();
      const L = [['THE CALGARY HERALD,', 74, .5], ['MINING AND RANCHE', 74, 1.3], ['ADVOCATE', 74, 1.9], ['AND GENERAL', 74, 2.5], ['ADVERTISER', 74, 3.0]];
      L.forEach(([s, size, t0], i) => { const kk = M.seg(t, t0, t0 + .3, 'outBack'); if (kk <= 0) return; c.save(); c.globalAlpha = Math.min(1, kk);
        c.translate(CX, 580 + i * 112); const sc_ = M.lerp(1.4, 1, Math.min(1, kk)); c.scale(sc_, sc_); serif(c, s, 0, 0, size); c.restore(); });
      const k2 = M.seg(t, .2, .5, 'outBack'); if (k2 > 0) M.chip(c, 'ITS FULL NAME', CX, 400, { align: 'center', size: 64, alpha: Math.min(1, k2) });
      M.source(c, SRC, 60, 1420, { size: 20 });
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
  { t: SPLIT - .15, sfx: 'whoosh', gain: -11 }, { t: SPLIT + .1, sfx: 'pop', gain: -10 }, { t: SPLIT + .45, sfx: 'whoosh', dur: .4, gain: -12 }, { t: SPLIT + .6, sfx: 'stamp', gain: -7 },
  { t: sc[1].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[1].sceneStart + .15, sfx: 'pop', gain: -11 }, { t: sc[1].sceneStart + .1, sfx: 'ticks', dur: 1.3, gain: -14 },
  { t: sc[1].sceneStart + 1.6, sfx: 'pop', gain: -9 }, { t: sc[1].sceneStart + 1.9, sfx: 'pop', gain: -11 }, { t: sc[1].sceneStart + 2.4, sfx: 'pop', gain: -11 },
  { t: sc[2].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[2].sceneStart, sfx: 'ticks', dur: 1.0, gain: -13 }, { t: sc[2].sceneStart + .9, sfx: 'pop', gain: -11 },
  { t: sc[2].sceneStart + sc[2].sceneDur * .42 + .3, sfx: 'stamp', gain: -8 }, { t: sc[2].sceneStart + sc[2].sceneDur * .42 + .9, sfx: 'pop', gain: -11 }, { t: sc[2].sceneStart + sc[2].sceneDur * .42 + 1.7, sfx: 'stamp', gain: -7 },
  { t: sc[3].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[3].sceneStart + .5, sfx: 'pop', gain: -11 }, { t: sc[3].sceneStart + 1.3, sfx: 'pop', gain: -11 }, { t: sc[3].sceneStart + 1.9, sfx: 'pop', gain: -11 }, { t: sc[3].sceneStart + 2.5, sfx: 'pop', gain: -11 }, { t: sc[3].sceneStart + 3.0, sfx: 'pop', gain: -10 },
  { t: sc[4].sceneStart - .15, sfx: 'whoosh', gain: -12 },
];
