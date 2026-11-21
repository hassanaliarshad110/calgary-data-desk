/* 2026-11-21 PM fun fact: "Only one visiting team ever beat the Canadiens for the Stanley Cup at the Montreal Forum."
 * Lead identity Data Explainer (kinetic hook, timeline + single-dot drop, scoreboard counters, stamps), borrowing a
 * Storyteller map dive over real Calgary onto the Saddledome (S5). Every on-screen figure maps to the audited claims table
 * (packages/2026-11-21-PM-flames-forum-cup.md, C1-C7; audits/2026-11-21-PM.md).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30, THUMB = !!(window.PARAMS && window.PARAMS.thumb);
const DURS = (window.PARAMS && window.PARAMS.durs) ? window.PARAMS.durs.split(',').map(Number) : [4.6, 2.2, 4.4, 3.0, 2.6, 3.6];
const S = M.script([
  { text: 'Only one visiting team ever beat the Canadiens for the Stanley Cup at the Montreal Forum.', dur: DURS[0] },
  { text: 'In seventy years, it was Calgary.', dur: DURS[1] },
  { text: 'May twenty-fifth, nineteen eighty-nine. Flames four, Canadiens two.', dur: DURS[2] },
  { text: 'Lanny McDonald scored in his final NHL game.', dur: DURS[3] },
  { text: "It's still the Flames' only Stanley Cup.", dur: DURS[4] },
  { text: 'Did you know this? Drop your thoughts below.', dur: DURS[5] },
], { lead: .25, gap: .25, tail: 1.0 });
const sc = S.scenes, SPLIT = 1.7;
const SRC = "Sources: The Canadian Encyclopedia · Canada's History · The Hockey News";
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const GOLD = M.house.gold, NAVY = '#0b1f3a', RED = '#C8102E', ICE = '#e9f1f7', BLUE = '#2f6fd6';

// recurring prop CUP_SIL: stylised trophy (bowl, collar, stacked barrel). Origin = base centre.
function cup(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha *= o.alpha ?? 1;
  c.shadowColor = 'rgba(242,182,50,.6)'; c.shadowBlur = o.glow === false ? 0 : 50;
  const g = c.createLinearGradient(-160, 0, 160, 0); g.addColorStop(0, '#b88a1e'); g.addColorStop(.45, '#ffe29a'); g.addColorStop(1, '#a87a12'); c.fillStyle = g;
  M.rr(c, -150, -90, 300, 90, 10); c.fill();            // bottom band
  M.rr(c, -125, -200, 250, 115, 10); c.fill();          // barrel 2
  M.rr(c, -100, -300, 200, 105, 10); c.fill();          // barrel 1
  M.rr(c, -60, -380, 120, 85, 10); c.fill();            // collar
  c.fillRect(-22, -440, 44, 70);                        // stem
  c.beginPath(); c.moveTo(-120, -560); c.lineTo(120, -560); c.quadraticCurveTo(110, -450, 0, -435); c.quadraticCurveTo(-110, -450, -120, -560); c.fill(); // bowl
  c.shadowBlur = 0; c.strokeStyle = 'rgba(80,55,10,.45)'; c.lineWidth = 4;
  [-90, -200, -300].forEach(yy => { c.beginPath(); c.moveTo(-140 + (yy < -150 ? 25 : 0) + (yy < -250 ? 25 : 0), yy + 30); c.lineTo(140 - (yy < -150 ? 25 : 0) - (yy < -250 ? 25 : 0), yy + 30); c.stroke(); });
  c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.ellipse(-55, -515, 18, 34, .3, 0, 7); c.fill();
  c.restore();
}
function rink(c, y0, h, o = {}) {   // top-down stylised ice: boards, red centre line, blue lines, centre circle
  const x0 = 60, w = W - 180;
  c.save(); c.globalAlpha *= o.alpha ?? 1;
  M.rr(c, x0, y0, w, h, 140); c.fillStyle = ICE; c.fill(); c.lineWidth = 12; c.strokeStyle = '#c9d6e2'; c.stroke();
  c.fillStyle = RED; c.fillRect(x0, y0 + h / 2 - 6, w, 12);
  c.fillStyle = BLUE; c.fillRect(x0, y0 + h * .32 - 8, w, 16); c.fillRect(x0, y0 + h * .68 - 8, w, 16);
  c.strokeStyle = BLUE; c.lineWidth = 6; c.beginPath(); c.arc(x0 + w / 2, y0 + h / 2, 120, 0, 7); c.stroke();
  c.fillStyle = RED; c.fillRect(x0 + w / 2 - 70, y0 + 34, 140, 8); c.fillRect(x0 + w / 2 - 70, y0 + h - 42, 140, 8);
  c.restore();
}
function stamp(c, txt, x, y, k, o = {}) {
  if (k <= 0) return; const s = M.lerp(1.8, 1, Math.min(1, k)); c.save(); c.translate(x, y); c.rotate(o.rot ?? -.05); c.scale(s, s); c.globalAlpha = Math.min(1, k * 1.5);
  c.font = M.font(o.size || 104, 800); const w = c.measureText(txt).width + 70, h = (o.size || 104) * 1.45;
  M.rr(c, -w / 2, -h / 2, w, h, 20); c.fillStyle = o.bg || 'rgba(7,13,24,.88)'; c.fill(); c.lineWidth = 9; c.strokeStyle = o.color || GOLD; c.stroke();
  M.text(c, txt, 0, -(o.size || 104) * .56, { size: o.size || 104, weight: 800, align: 'center', color: o.color || GOLD, shadow: false });
  c.restore();
}
function navyBg(c, top = '#0e2b52', bot = '#081428') { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function dark(c, y0, y1, a = .62) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.2, `rgba(7,13,24,${a})`); g.addColorStop(.8, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); }
// arena facade with a lit marquee; z = push-in scale
function arena(c, t, z) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#060d1c'); g.addColorStop(.6, '#0d2140'); g.addColorStop(1, '#1a2a3d'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const r = M.rng(3); for (let k = 0; k < 60; k++) { const sx = r() * W, sy = r() * 700; c.fillStyle = `rgba(255,255,255,${.25 + .5 * r()})`; c.fillRect(sx, sy, 3, 3); }
  c.save(); c.translate(CX, 1040); c.scale(z, z);
  c.fillStyle = '#2b3a4f'; c.fillRect(-520, -330, 1040, 700);           // building
  c.fillStyle = '#34465f'; c.fillRect(-560, -360, 1120, 40);
  for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(255,214,120,.55)'; c.fillRect(-470 + i * 108, -260, 70, 120); }   // upper windows
  // marquee
  M.rr(c, -400, -40, 800, 170, 14); c.fillStyle = '#0a1426'; c.fill(); c.lineWidth = 8; c.strokeStyle = GOLD; c.stroke();
  for (let i = 0; i < 26; i++) { const on = (Math.floor(t * 10) + i) % 3 !== 0; c.fillStyle = on ? '#ffe7a3' : '#6b5a2a'; c.beginPath(); c.arc(-385 + i * 30.8, -28, 6, 0, 7); c.fill(); c.beginPath(); c.arc(-385 + i * 30.8, 118, 6, 0, 7); c.fill(); }
  M.text(c, 'MONTREAL FORUM', 0, 10, { size: 74, weight: 800, align: 'center', color: '#ffffff' });
  c.fillStyle = '#0a1426'; for (let i = 0; i < 5; i++) c.fillRect(-330 + i * 140, 200, 100, 170);   // doors
  c.fillStyle = 'rgba(255,214,120,.25)'; for (let i = 0; i < 5; i++) c.fillRect(-330 + i * 140, 200, 100, 170);
  c.restore();
  const sn = M.rng(11); for (let k = 0; k < 70; k++) { const px = (sn() * W + t * 40 * (sn() - .3)) % W, py = (sn() * H + t * 260 * (.5 + sn())) % H; c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(px, py, 2 + sn() * 3, 0, 7); c.fill(); }
}

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // S0 HOOK (0-1.7 s): frame 0 already pushing in on the Forum marquee; the hook question punches in from frame 0 (C1)
  { dur: SPLIT, trans: { kind: 'zoom', dur: .3 }, draw: (c, t) => {
      arena(c, t, M.lerp(.7, 1.06, M.seg(t, 0, SPLIT + .4, 'outCubic')));
      cup(c, CX, 860, M.lerp(.35, .55, M.seg(t, 0, SPLIT, 'outCubic')), { alpha: THUMB ? 1 : .0 });
      if (THUMB) return;
      dark(c, 150, 700, .65);
      M.kinetic(c, 'Beat the Habs for the Cup here?', t, CX, 250, { t0: -.45, size: 132, maxW: 920, highlight: ['cup'], every: .09 });
  } },
  // S1 the Cup rises at centre ice; "only one visiting team ever did" (C1)
  { dur: sc[0].sceneDur - SPLIT, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      const D = sc[0].sceneDur - SPLIT; navyBg(c, '#0b1f3a', '#081428');
      rink(c, 560, 1000);
      const rise = M.seg(t, .05, 1.0, 'outBack'); cup(c, CX, M.lerp(1700, 1330, rise), 1.05);
      const r = M.rng(9); for (let k = 0; k < 22; k++) { const a = (t * 1.2 + r()) % 1; c.fillStyle = `rgba(255,228,150,${(1 - a) * .9})`; c.beginPath(); c.arc(CX + (r() - .5) * 650, 1180 - a * 520 - r() * 200, 4 + r() * 5, 0, 7); c.fill(); }
      M.chip(c, 'MONTREAL FORUM', CX, 360, { align: 'center', size: 52, bg: '#ffffff' });
      stamp(c, 'ONLY ONE VISITING TEAM EVER DID', CX, 500, M.seg(t, Math.min(1.1, D * .4), Math.min(1.1, D * .4) + .35, 'outBack'), { size: 56 });
      M.source(c, SRC, 60, 1610, { size: 22 });
  } },
  // S2 TIMELINE: seventy years of the Canadiens at the Forum; one gold dot drops: CALGARY (C1, C2)
  { dur: sc[1].sceneDur, trans: { kind: 'zoom', dur: .35 }, draw: (c, t) => {
      navyBg(c);
      const x0 = 110, x1 = W - 170, y = 1000, f = M.seg(t, 0, 1.3, 'inOutCubic');
      c.fillStyle = 'rgba(255,255,255,.18)'; M.rr(c, x0, y - 18, x1 - x0, 36, 18); c.fill();
      c.fillStyle = '#ffffff'; M.rr(c, x0, y - 18, (x1 - x0) * f, 36, 18); c.fill();
      for (let k = 0; k <= 7; k++) { const tx = x0 + (x1 - x0) * k / 7; if (k / 7 <= f + .001) { c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(tx - 3, y + 26, 6, 30); } }
      M.text(c, '1926', x0, y + 70, { size: 56, weight: 800, color: '#ffffff' });
      const kL = M.seg(t, .8, 1.2, 'outBack'); if (kL > 0) { c.save(); c.globalAlpha = Math.min(1, kL); M.text(c, '70 YEARS', CX, y - 330, { size: 120, weight: 800, align: 'center', color: '#ffffff' }); M.text(c, 'CANADIENS AT THE FORUM', CX, y - 190, { size: 48, weight: 700, align: 'center', color: 'rgba(255,255,255,.8)' }); c.restore(); }
      const dx = x0 + (x1 - x0) * .905, dk = M.seg(t, 1.3, 1.75, 'outBack');
      if (dk > 0) { const dy = M.lerp(y - 500, y, Math.min(1, dk)); c.save(); c.shadowColor = 'rgba(242,182,50,.8)'; c.shadowBlur = 40; c.fillStyle = GOLD; c.beginPath(); c.arc(dx, dy, 34, 0, 7); c.fill(); c.restore();
        if (dk >= 1) { const pr = M.seg(t, 1.75, 2.4, 'outCubic'); c.strokeStyle = `rgba(242,182,50,${1 - pr})`; c.lineWidth = 6; c.beginPath(); c.arc(dx, y, 34 + pr * 90, 0, 7); c.stroke(); }
        M.text(c, 'CALGARY', dx, y + 70, { size: 60, weight: 800, align: 'center', color: GOLD }); }
      stamp(c, 'ONLY ONE VISITOR', CX, 400, M.seg(t, 1.55, 1.9, 'outBack'), { size: 100 });
      const k2 = M.seg(t, 1.9, 2.2, 'outBack'); if (k2 > 0) M.chip(c, 'BEAT THE CANADIENS FOR THE CUP HERE', CX, 560, { align: 'center', size: 48, alpha: Math.min(1, k2) });
      M.source(c, SRC, 60, 1610, { size: 22 });
  } },
  // S3 SCOREBOARD: May 25, 1989, Game 6, CGY 4 MTL 2 (C3)
  { dur: sc[2].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      navyBg(c, '#0d2747', '#071226');
      const sk = M.seg(t, 0, .35, 'outBack'), s = M.lerp(1.5, 1, Math.min(1, sk));
      c.save(); c.translate(CX, 1000); c.scale(s, s); c.globalAlpha = Math.min(1, sk * 1.6);
      M.rr(c, -440, -360, 880, 720, 30); c.fillStyle = '#05080f'; c.fill(); c.lineWidth = 10; c.strokeStyle = GOLD; c.stroke();
      M.text(c, 'MAY 25, 1989', 0, -320, { size: 88, weight: 800, align: 'center', color: '#ffffff' });
      M.chip(c, 'GAME 6 · FINAL', 0, -175, { align: 'center', size: 50 });
      const a = Math.round(M.lerp(0, 4, M.seg(t, .9, 2.0, 'linear'))), b = Math.round(M.lerp(0, 2, M.seg(t, .9, 1.7, 'linear')));
      M.text(c, 'CGY', -210, -70, { size: 80, weight: 800, align: 'center', color: '#ffffff' }); M.text(c, 'MTL', 210, -70, { size: 80, weight: 800, align: 'center', color: '#ffffff' });
      M.text(c, String(a), -210, 20, { size: 230, weight: 800, align: 'center', color: '#ff4d5e' }); M.text(c, String(b), 210, 20, { size: 230, weight: 800, align: 'center', color: '#9fb4cc' });
      c.restore();
      const k = M.seg(t, 2.2, 2.55, 'outBack'); if (k > 0) stamp(c, 'CUP CLINCHED', CX, 470, k, { size: 96 });
      M.source(c, SRC, 60, 1610, { size: 22 });
  } },
  // S4 McDONALD: puck streaks into the net; name punch; final-game chip (C4)
  { dur: sc[3].sceneDur, trans: { kind: 'whip', dur: .3 }, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      rink(c, 720, 960);
      const nx = CX + 230, ny = 1010; c.strokeStyle = RED; c.lineWidth = 10; c.beginPath(); c.moveTo(nx - 110, ny + 60); c.lineTo(nx - 110, ny - 60); c.quadraticCurveTo(nx + 60, ny - 60, nx + 60, ny); c.quadraticCurveTo(nx + 60, ny + 60, nx - 110, ny + 60); c.stroke();
      c.strokeStyle = 'rgba(200,16,46,.35)'; c.lineWidth = 3; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(nx - 100 + k * 28, ny - 56); c.lineTo(nx - 100 + k * 28, ny + 56); c.stroke(); }
      c.fillStyle = '#1c3d73'; M.rr(c, nx - 175, ny - 20, 70, 110, 18); c.fill(); c.fillStyle = '#e8eef5'; M.rr(c, nx - 190, ny + 60, 40, 60, 10); c.fill(); M.rr(c, nx - 130, ny + 60, 40, 60, 10); c.fill(); c.fillStyle = '#1c3d73'; c.beginPath(); c.arc(nx - 140, ny - 45, 30, 0, 7); c.fill();   // goaltender (puck goes high, past the glove side)
      const p = M.seg(t, .1, .8, 'inCubic'), px = M.lerp(150, nx - 20, p), py = M.lerp(1600, ny - 30, p);
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(M.lerp(150, px, .3), M.lerp(1600, py, .3)); c.lineTo(px, py); c.stroke();
      c.fillStyle = '#111'; c.beginPath(); c.ellipse(px, py, 34, 20, 0, 0, 7); c.fill();
      const fl = M.seg(t, .8, 1.2, 'linear'); if (fl > 0 && fl < 1) { c.fillStyle = `rgba(255,236,170,${(1 - fl) * .8})`; c.fillRect(0, 0, W, H); }
      M.kinetic(c, 'LANNY McDONALD', t, CX, 330, { t0: .7, size: 112, maxW: 940, highlight: ['mcdonald'] });
      const k = M.seg(t, 1.5, 1.85, 'outBack'); if (k > 0) M.chip(c, 'SCORED IN HIS FINAL NHL GAME', CX, 640, { align: 'center', size: 50, alpha: Math.min(1, k) });
      M.source(c, SRC, 60, 1720, { size: 22, color: '#ffffff' });
  } },
  // S5 MAP DIVE over real Calgary onto the Saddledome; "still their only Cup" (C5, C6)
  { dur: sc[4].sceneDur, trans: { kind: 'zoom', dur: .35 }, draw: (c, t) => {
      const SD = M.geo.lm('Scotiabank Saddledome');
      const w = M.world({ sky: 'dusk', fog: { near: 9000, far: 52000, max: .4 } }); M.geo.addBase(w, { buildings: true, roads: true, windows: '#ffd890' });
      M.pin(w, SD, 'SADDLEDOME', { p: M.seg(t, .3, .8, 'linear'), size: 50, scale: 1.3 }); M.ping(w, SD, t, { r: 160 });
      const cam = M.camera(M.moves.dive(SD, M.seg(t, 0, sc[4].sceneDur + .6, 'outCubic'), { h0: 14000, h1: 2600, back0: 1, back1: 3600, ahead: 200 }), W, H); w.render(c, cam);
      dark(c, 170, 640, .6);
      stamp(c, 'STILL THEIR ONLY CUP', CX, 430, M.seg(t, .7, 1.05, 'outBack'), { size: 92 });
      M.text(c, 'N ↑', 60, 1450, { size: 32, weight: 700, color: '#fff' });
      M.source(c, MAPC, 60, 1610, { size: 20 });
  } },
  // S6 QUESTION: no end card (under 2:00)
  { dur: sc[5].sceneDur, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      cup(c, CX, 1760, .7, { alpha: .9 });
      M.closer(c, 'Did you know this? Yes or no?', M.seg(t, 0, sc[5].sceneDur, 'linear'), W, H, { highlight: ['yes', 'no?'] });
  } },
], overlay: (c, t, info) => {
  if (THUMB) return;
  if (t > 3 && info.index < 6) M.header(c, window.LOGO, W, H);
  if (info.index < 6) M.caption(c, S.captionAt(t), W, H);
} });

window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.02, sfx: 'impact', gain: -5 },
  { t: SPLIT - .15, sfx: 'whoosh', gain: -11 }, { t: SPLIT + .3, sfx: 'whoosh', dur: .8, gain: -12 },
  { t: SPLIT + Math.min(1.1, (sc[0].sceneDur - SPLIT) * .4), sfx: 'stamp', gain: -7 },
  { t: sc[1].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[1].sceneStart + 1.3, sfx: 'pop', gain: -9 }, { t: sc[1].sceneStart + 1.55, sfx: 'stamp', gain: -7 },
  { t: sc[2].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[2].sceneStart + .02, sfx: 'impact', gain: -6 }, { t: sc[2].sceneStart + .9, sfx: 'ticks', dur: 1.1, gain: -13 }, { t: sc[2].sceneStart + 2.2, sfx: 'stamp', gain: -7 },
  { t: sc[3].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[3].sceneStart + .8, sfx: 'impact', gain: -6 }, { t: sc[3].sceneStart + 1.5, sfx: 'pop', gain: -12 },
  { t: sc[4].sceneStart - .1, sfx: 'whoosh', dur: .8, gain: -11 }, { t: sc[4].sceneStart + .7, sfx: 'stamp', gain: -7 },
  { t: sc[5].sceneStart - .15, sfx: 'whoosh', gain: -12 },
];
