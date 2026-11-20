/* 2026-11-20 PM fun fact: "This world-famous horse venue was once a cattle feedlot." (Spruce Meadows)
 * Lead identity Data Explainer (kinetic hook, year slams, stamps, one-of-four rings), borrowing a Storyteller map dive (S0)
 * and a before/after wipe (S1). Every on-screen figure maps to the audited claims table
 * (packages/2026-11-20-PM-spruce-meadows-feedlot.md, C1-C6; audits/2026-11-20-PM.md, APPROVED round 1).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30, THUMB = !!(window.PARAMS && window.PARAMS.thumb);
const DURS = (window.PARAMS && window.PARAMS.durs) ? window.PARAMS.durs.split(',').map(Number) : [3.3, 5.6, 4.2, 4.3, 2.8, 2.8];
const S = M.script([
  { text: 'This world-famous horse venue was once a cattle feedlot.', dur: DURS[0] },
  { text: 'Marg and Ron Southern opened Spruce Meadows, just south of Calgary, in nineteen seventy-five.', dur: DURS[1] },
  { text: 'In nineteen eighty-one, its new grand prix was the richest in the world.', dur: DURS[2] },
  { text: "Today, it's one of only four venues in show jumping's Rolex Grand Slam.", dur: DURS[3] },
  { text: 'And most days, the grounds are free to visit.', dur: DURS[4] },
  { text: 'Have you been? Drop your thoughts below.', dur: DURS[5] },
], { lead: .25, gap: .25, tail: 1.0 });
const sc = S.scenes, SPLIT = 1.7;
const SRC = 'Sources: Spruce Meadows · Avenue Calgary · FEI';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const GOLD = M.house.gold, NAVY = '#0b1f3a', GREEN = '#3f8f4e', DIRT = '#7a5a3a';
const SM = [-2200, -17900, 0];   // approximate: just outside the SW city-limit line, south of Hwy 22X (C5)

// recurring prop HORSE_SIL: horse and rider clearing a jump, facing right. Origin = ground under the hind feet.
function horse(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(o.tilt ?? -.18); c.fillStyle = o.color || GOLD; c.globalAlpha *= o.alpha ?? 1;
  if (o.glow) { c.shadowColor = 'rgba(242,182,50,.55)'; c.shadowBlur = 40; }
  c.beginPath(); c.ellipse(120, -190, 150, 62, 0, 0, 7); c.fill();                                   // body
  c.beginPath(); c.moveTo(220, -230); c.quadraticCurveTo(275, -300, 300, -360); c.lineTo(345, -345); c.quadraticCurveTo(310, -260, 265, -170); c.closePath(); c.fill(); // neck
  c.beginPath(); c.moveTo(300, -365); c.lineTo(395, -330); c.quadraticCurveTo(410, -312, 392, -300); c.lineTo(325, -318); c.closePath(); c.fill();   // head
  c.beginPath(); c.moveTo(305, -362); c.lineTo(312, -395); c.lineTo(325, -360); c.fill();          // ear
  c.lineCap = 'round'; c.strokeStyle = c.fillStyle; c.lineWidth = 30;
  c.beginPath(); c.moveTo(225, -175); c.lineTo(290, -150); c.lineTo(255, -100); c.stroke();        // front legs tucked
  c.beginPath(); c.moveTo(205, -170); c.lineTo(255, -130); c.lineTo(225, -90); c.stroke();
  c.beginPath(); c.moveTo(20, -170); c.lineTo(-60, -90); c.lineTo(-120, -40); c.stroke();          // hind legs extended
  c.beginPath(); c.moveTo(45, -160); c.lineTo(-30, -70); c.lineTo(-80, -10); c.stroke();
  c.lineWidth = 22; c.beginPath(); c.moveTo(-25, -215); c.quadraticCurveTo(-90, -230, -120, -170); c.stroke(); // tail
  c.beginPath(); c.ellipse(150, -300, 34, 62, .5, 0, 7); c.fill();                                 // rider torso
  c.beginPath(); c.arc(182, -372, 30, 0, 7); c.fill();                                             // helmet
  c.lineWidth = 20; c.beginPath(); c.moveTo(135, -260); c.lineTo(185, -225); c.lineTo(165, -190); c.stroke(); // rider leg
  c.beginPath(); c.moveTo(170, -310); c.lineTo(250, -275); c.stroke();                             // arm to the reins
  c.restore();
}
function jump(c, x, y, w, h, cols = ['#e23b3b', '#ffffff', '#2f6fd6']) {   // a show-jumping fence: two standards + striped poles
  c.save(); c.fillStyle = '#ffffff'; M.rr(c, x - w / 2 - 14, y - h - 20, 14, h + 20, 4); c.fill(); M.rr(c, x + w / 2, y - h - 20, 14, h + 20, 4); c.fill();
  [0, .45, .8].forEach((f, k) => { const py = y - h + f * h * .9; const seg = 6; for (let q = 0; q < seg; q++) { c.fillStyle = cols[(q + k) % cols.length]; c.fillRect(x - w / 2 + q * w / seg, py, w / seg + 1, 14); } });
  c.restore();
}
function spruce(c, x, y, s, col = '#1f5a3a') { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(0, -220 + k * 55); c.lineTo(-70 + k * -10, -90 + k * 45); c.lineTo(70 + k * 10, -90 + k * 45); c.closePath(); c.fill(); } c.fillStyle = '#5a3d25'; c.fillRect(-10, 0, 20, 30); c.restore(); }
function trophy(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s); c.shadowColor = 'rgba(242,182,50,.6)'; c.shadowBlur = 50; c.fillStyle = GOLD;
  c.beginPath(); c.moveTo(-150, -420); c.lineTo(150, -420); c.quadraticCurveTo(150, -200, 0, -170); c.quadraticCurveTo(-150, -200, -150, -420); c.fill();
  c.lineWidth = 26; c.strokeStyle = GOLD; c.beginPath(); c.arc(-150, -340, 60, Math.PI * .5, Math.PI * 1.5); c.stroke(); c.beginPath(); c.arc(150, -340, 60, -Math.PI * .5, Math.PI * .5); c.stroke();
  c.fillRect(-22, -175, 44, 90); M.rr(c, -110, -90, 220, 50, 10); c.fill(); M.rr(c, -150, -45, 300, 45, 10); c.fill();
  c.shadowBlur = 0; c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-70, -340, 22, 60, .2, 0, 7); c.fill(); c.restore();
}
function stamp(c, txt, x, y, k, o = {}) {
  if (k <= 0) return; const s = M.lerp(1.8, 1, Math.min(1, k)); c.save(); c.translate(x, y); c.rotate(o.rot ?? -.05); c.scale(s, s); c.globalAlpha = Math.min(1, k * 1.5);
  c.font = M.font(o.size || 104, 800); const w = c.measureText(txt).width + 70, h = (o.size || 104) * 1.45;
  M.rr(c, -w / 2, -h / 2, w, h, 20); c.fillStyle = o.bg || 'rgba(7,13,24,.85)'; c.fill(); c.lineWidth = 9; c.strokeStyle = o.color || GOLD; c.stroke();
  M.text(c, txt, 0, -(o.size || 104) * .56, { size: o.size || 104, weight: 800, align: 'center', color: o.color || GOLD, shadow: false });
  c.restore();
}
function navyBg(c, top = '#0e2b52', bot = '#081428') { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function ground(c, y) { c.fillStyle = '#12304f'; c.fillRect(0, y, W, H - y); c.strokeStyle = 'rgba(242,182,50,.35)'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
function dark(c, y0, y1, a = .62) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.2, `rgba(7,13,24,${a})`); g.addColorStop(.8, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); }


window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // S0 HOOK (0-1.7 s): frame 0 already diving over real Calgary onto the SW city edge; pin drops just outside the limit (C5)
  { dur: SPLIT, trans: { kind: 'zoom', dur: .3 }, draw: (c, t) => {
      const w = M.world({ sky: 'day', fog: { near: 9000, far: 52000, max: .4 } }); M.geo.addBase(w, { buildings: false, roads: true, boundaryStroke: true });
      if (!THUMB) M.pin(w, SM, 'SPRUCE MEADOWS', { p: M.seg(t, .35, .95, 'linear'), size: 50, scale: 1.3 });
      M.ping(w, SM, t, { r: 220 });
      const cam = M.camera(M.moves.dive(SM, M.seg(t, 0, SPLIT + 1.0, 'outCubic'), { h0: 24000, h1: 4200, back0: 1, back1: 4600, ahead: 300 }), W, H); w.render(c, cam);
      if (THUMB) return;
      dark(c, 150, 640, .6);
      M.kinetic(c, 'Once a cattle feedlot.', t, CX, 250, { t0: -.45, size: 150, maxW: 920, highlight: ['feedlot.'], every: .1 });
      M.text(c, 'N ↑', 60, 1380, { size: 32, weight: 700, color: '#fff' });
      M.source(c, MAPC, 60, 1460, { size: 20 });
  } },
  // S1 BEFORE/AFTER: feedlot pens with cattle -> gold wipe -> green arena with jumps; the horse clears a fence (C1)
  { dur: sc[0].sceneDur - SPLIT, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      const D = sc[0].sceneDur - SPLIT, wx = M.lerp(-40, W + 40, M.seg(t, .25, D * .6, 'inOutCubic'));
      // BEFORE: feedlot
      c.fillStyle = '#5b4630'; c.fillRect(0, 0, W, H);
      const r = M.rng(5);
      for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 3; gx++) { const x = 70 + gx * 320, y = 560 + gy * 190; c.fillStyle = DIRT; c.fillRect(x, y, 290, 160); c.strokeStyle = '#d9c7a6'; c.lineWidth = 6; c.strokeRect(x, y, 290, 160);
        for (let k = 0; k < 5; k++) { c.fillStyle = '#2b1d12'; c.beginPath(); c.ellipse(x + 30 + r() * 230, y + 30 + r() * 100, 26, 13, r() * 3, 0, 7); c.fill(); } }
      M.chip(c, 'FEEDLOT', 90, 470, { align: 'left', size: 56, bg: '#d9c7a6', color: '#2b1d12' });
      // AFTER: arena revealed left of the wipe
      c.save(); c.beginPath(); c.rect(0, 0, wx, H); c.clip();
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0e2b52'); g.addColorStop(.3, '#173f2a'); g.addColorStop(1, '#0c2416'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = GREEN; c.fillRect(40, 520, W - 160, 1000); c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.strokeRect(40, 520, W - 160, 1000);
      for (let k = 0; k < 9; k++) spruce(c, 60 + k * 110, 520, .55);
      jump(c, 300, 1180, 180, 120); jump(c, 700, 1380, 180, 120, ['#f2b632', '#ffffff', '#0b1f3a']); jump(c, CX, 960, 240, 150);
      const hp = M.seg(t, D * .45, D, 'linear'); horse(c, M.lerp(CX - 380, CX + 60, hp), 980 - Math.sin(hp * Math.PI) * 220, .85, { glow: true, tilt: M.lerp(-.3, .25, hp) });
      c.restore();
      c.fillStyle = GOLD; c.fillRect(wx - 6, 0, 12, H);
      stamp(c, 'WORLD-FAMOUS VENUE', CX, 330, M.seg(t, D * .62, D * .62 + .35, 'outBack'), { size: 78 });
      M.source(c, SRC, 60, 1560, { size: 22 });
  } },
  // S2 1975: year slams, founders' names punch in, location chip (C2, C5)
  { dur: sc[1].sceneDur, trans: { kind: 'zoom', dur: .4 }, draw: (c, t) => {
      navyBg(c); ground(c, 1400);
      for (let k = 0; k < 9; k++) spruce(c, 50 + k * 115, 1400, .6 + (k % 3) * .12, '#1d4d33');
      const k0 = M.seg(t, 0, .35, 'outBack'); if (k0 > 0) { c.save(); c.translate(CX, 480); const s = M.lerp(1.9, 1, Math.min(1, k0)); c.scale(s, s); c.globalAlpha = Math.min(1, k0 * 1.6); M.text(c, '1975', 0, -120, { size: 230, weight: 800, align: 'center', color: GOLD }); c.restore(); }
      M.kinetic(c, 'Marg & Ron Southern', t, CX, 620, { t0: .4, size: 110, maxW: 900, highlight: ['southern'] });
      const k1 = M.seg(t, 1.5, 1.9, 'outBack'); if (k1 > 0) M.chip(c, 'OPENED SPRUCE MEADOWS', CX, 920, { align: 'center', size: 52, alpha: Math.min(1, k1) });
      const k2 = M.seg(t, 2.4, 2.8, 'outBack'); if (k2 > 0) M.chip(c, 'JUST SOUTH OF CALGARY', CX, 1030, { align: 'center', size: 48, alpha: Math.min(1, k2), bg: '#ffffff' });
      M.source(c, SRC, 60, 1560, { size: 22 });
  } },
  // S3 1981: the trophy rises; ranked stamp "WORLD'S RICHEST GRAND PRIX" + "AT THE TIME" (C3)
  { dur: sc[2].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      navyBg(c, '#0d2747', '#071226');
      c.save(); c.translate(CX, 1060); c.rotate(t * .5); c.strokeStyle = 'rgba(242,182,50,.25)'; c.lineWidth = 4; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(0, 0, 360, 360 * (.25 + k * .3), 0, 0, 7); c.stroke(); } c.restore();
      const rise = M.seg(t, .1, 1.0, 'outBack'); trophy(c, CX, M.lerp(1700, 1290, rise), 1.05);
      const r = M.rng(9); for (let k = 0; k < 24; k++) { const a = (t * 1.3 + r()) % 1; c.fillStyle = `rgba(255,228,150,${(1 - a) * .9})`; c.beginPath(); c.arc(CX + (r() - .5) * 700, 1200 - a * 500 - r() * 200, 4 + r() * 5, 0, 7); c.fill(); }
      M.kinetic(c, '1981', t, CX, 260, { t0: .05, size: 160, highlight: ['1981'] });
      stamp(c, "WORLD'S RICHEST GRAND PRIX", CX, 570, M.seg(t, 1.5, 1.85, 'outBack'), { size: 66, rot: -.03 });
      const k = M.seg(t, 2.2, 2.6, 'outBack'); if (k > 0) M.chip(c, 'AT THE TIME', CX, 690, { align: 'center', size: 50, alpha: Math.min(1, k), bg: '#ffffff' });
      M.source(c, SRC, 60, 1560, { size: 22 });
  } },
  // S4 GRAND SLAM: four rings drop in; one lights with the horse and the label (C4)
  { dur: sc[3].sceneDur, trans: { kind: 'dissolve', dur: .35 }, draw: (c, t) => {
      navyBg(c);
      const pos = [[CX - 215, 820], [CX + 215, 820], [CX - 215, 1230], [CX + 215, 1230]], LIT = 0;
      pos.forEach(([x, y], i) => { const k = M.ease.outBack(M.seg(t, .15 + i * .18, .5 + i * .18, 'linear')); if (k <= 0) return;
        c.save(); c.translate(x, y - (1 - Math.min(1, k)) * 120); c.globalAlpha = Math.min(1, k); const lit = i === LIT && t > 1.4;
        c.beginPath(); c.arc(0, 0, 170, 0, 7); c.lineWidth = 14; c.strokeStyle = lit ? GOLD : 'rgba(255,255,255,.45)'; c.stroke();
        if (lit) { c.fillStyle = 'rgba(242,182,50,.22)'; c.fill(); horse(c, -100, 95, .42, { glow: true, tilt: -.1 }); }
        c.restore(); });
      if (t > 1.4) M.text(c, 'SPRUCE MEADOWS', pos[0][0], pos[0][1] + 190, { size: 40, weight: 800, align: 'center', color: GOLD });
      stamp(c, '1 OF ONLY 4', CX, 340, M.seg(t, 1.5, 1.85, 'outBack'), { size: 120 });
      const k = M.seg(t, 2.1, 2.5, 'outBack'); if (k > 0) M.chip(c, 'ROLEX GRAND SLAM OF SHOW JUMPING', CX, 530, { align: 'center', size: 48, alpha: Math.min(1, k) });
      M.source(c, SRC, 60, 1560, { size: 22 });
  } },
  // S5 FREE: a ranch gate swings open onto green fields and spruce trees (C6)
  { dur: sc[4].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#7fb6e6'); g.addColorStop(.42, '#cfe6f5'); g.addColorStop(.43, '#5aa55e'); g.addColorStop(1, '#2d6b38'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let k = 0; k < 10; k++) spruce(c, 40 + k * 110, 830, .7 + (k % 3) * .15);
      const open = M.seg(t, .15, 1.2, 'inOutCubic');
      c.fillStyle = '#5a3d25'; c.fillRect(150, 700, 40, 760); c.fillRect(W - 230, 700, 40, 760);
      [[190, 1], [W - 230, -1]].forEach(([hx, dir]) => { const wd = 320 * Math.cos(open * 1.35); c.save(); c.translate(hx, 0); c.scale(dir, 1);
        c.strokeStyle = '#8a6440'; c.lineWidth = 22; for (let b = 0; b < 4; b++) { c.beginPath(); c.moveTo(0, 820 + b * 150); c.lineTo(wd, 820 + b * 150); c.stroke(); }
        c.beginPath(); c.moveTo(0, 1270); c.lineTo(wd, 820); c.stroke(); c.restore(); });
      stamp(c, 'FREE', CX, 360, M.seg(t, .9, 1.25, 'outBack'), { size: 180, color: '#ffffff', bg: 'rgba(11,31,58,.9)' });
      const k = M.seg(t, 1.3, 1.7, 'outBack'); if (k > 0) M.chip(c, 'MOST DAYS · NO TICKETED EVENT', CX, 560, { align: 'center', size: 48, alpha: Math.min(1, k) });
      M.source(c, SRC, 60, 1560, { size: 22, color: '#ffffff' });
  } },
  // S6 QUESTION: no end card (under 2:00)
  { dur: sc[5].sceneDur, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      horse(c, CX - 160, 1720, .62, { glow: true, tilt: -.12 });
      M.closer(c, 'Have you been?', M.seg(t, 0, sc[5].sceneDur, 'linear'), W, H, { highlight: ['been?'] });
  } },
], overlay: (c, t, info) => {
  if (THUMB) return;
  if (t > 3 && info.index < 6) M.header(c, window.LOGO, W, H);
  if (info.index < 6) M.caption(c, S.captionAt(t), W, H);
} });

window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.02, sfx: 'impact', gain: -5 }, { t: 0.45, sfx: 'pop', gain: -10 },
  { t: SPLIT - .15, sfx: 'whoosh', gain: -11 }, { t: SPLIT + .3, sfx: 'whoosh', dur: .8, gain: -12 },
  { t: SPLIT + (sc[0].sceneDur - SPLIT) * .62, sfx: 'stamp', gain: -7 },
  { t: sc[1].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[1].sceneStart + .02, sfx: 'impact', gain: -6 }, { t: sc[1].sceneStart + 1.5, sfx: 'pop', gain: -12 }, { t: sc[1].sceneStart + 2.4, sfx: 'pop', gain: -13 },
  { t: sc[2].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[2].sceneStart + 1.5, sfx: 'stamp', gain: -7 },
  { t: sc[3].sceneStart + .15, sfx: 'ticks', dur: 1.0, gain: -13 }, { t: sc[3].sceneStart + 1.5, sfx: 'stamp', gain: -7 },
  { t: sc[4].sceneStart + .15, sfx: 'whoosh', dur: 1.0, gain: -12 }, { t: sc[4].sceneStart + .9, sfx: 'stamp', gain: -7 },
  { t: sc[5].sceneStart - .15, sfx: 'whoosh', gain: -12 },
];
