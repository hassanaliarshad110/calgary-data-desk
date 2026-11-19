/* 2026-11-19 PM fun fact: "Calgary's zoo had more than fifty dinosaurs. Only one survived." (Dinny)
 * Lead identity Data Explainer (kinetic hook, elimination field, stamps), borrowing a Storyteller map dive (S0)
 * and a Civic-style timeline (S3). Every on-screen figure maps to the audited claims table
 * (packages/2026-11-19-PM-dinny-last-dinosaur.md, C1-C5; audits/2026-11-19-PM.md, APPROVED round 2).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30, THUMB = !!(window.PARAMS && window.PARAMS.thumb);

// audited narration with measured Kokoro durations (sp_out/durs.json)
const DURS = (window.PARAMS && window.PARAMS.durs) ? window.PARAMS.durs.split(',').map(Number) : [4.524, 4.885, 3.669, 3.413, 3.024];
const S = M.script([
  { text: "Calgary's zoo once had more than fifty dinosaurs. Only one survived.", dur: DURS[0] },
  { text: 'His name is Dinny, a concrete brontosaurus unveiled in nineteen thirty-seven.', dur: DURS[1] },
  { text: 'When the old park was taken down in nineteen eighty-three, Dinny stayed.', dur: DURS[2] },
  { text: 'In the twenty thirteen flood, water rose right up to his neck.', dur: DURS[3] },
  { text: 'Have you ever seen Dinny? Yes or no? Drop your thoughts below.', dur: DURS[4] },
], { lead: .25, gap: .25, tail: .9 });
const sc = S.scenes, SPLIT = 1.7;
const SRC = 'Sources: CBC Calgary · CTV News Calgary · City of Calgary';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const GOLD = M.house.gold, NAVY = '#0b1f3a', CONC = '#9aa3ad';

// ---- the one recurring prop: Dinny's silhouette (generic long-necked sauropod, facing left). Origin = ground under the body. ----
const NECK_Y = -235;   // level of the base of the neck, used by the flood scene
function sauropod(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha *= o.alpha ?? 1;
  const reveal = o.reveal ?? 1; if (reveal < 1) { c.beginPath(); c.rect(-330, -520, 800 * reveal, 600); c.clip(); }
  c.fillStyle = o.color || GOLD;
  if (o.glow) { c.shadowColor = 'rgba(242,182,50,.55)'; c.shadowBlur = 40; }
  c.beginPath(); c.ellipse(40, -165, 160, 92, 0, 0, 7); c.fill();                                  // body
  [[-70, -150], [-15, -140], [120, -150], [170, -150]].forEach(([lx, ly]) => { M.rr(c, lx - 22, ly, 44, -ly, 10); c.fill(); }); // legs
  c.beginPath(); c.moveTo(-95, -235); c.quadraticCurveTo(-205, -280, -238, -440); c.lineTo(-268, -432);   // neck (outer)
  c.quadraticCurveTo(-200, -205, -70, -120); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(-262, -444, 46, 24, -.15, 0, 7); c.fill();                             // head
  c.beginPath(); c.moveTo(185, -215); c.quadraticCurveTo(330, -180, 450, -40); c.quadraticCurveTo(320, -120, 175, -110); c.closePath(); c.fill(); // tail
  c.shadowBlur = 0;
  if (o.texture) { c.globalAlpha *= .22; c.fillStyle = '#ffffff'; const r = M.rng(7); for (let k = 0; k < 70; k++) { c.beginPath(); c.arc(-60 + r() * 260, -230 + r() * 140, 3 + r() * 5, 0, 7); c.fill(); } }
  if (o.eye) { c.globalAlpha = 1; c.fillStyle = NAVY; c.beginPath(); c.arc(-278, -450, 6, 0, 7); c.fill(); }
  c.restore();
}
function theropod(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col;
  c.beginPath(); c.ellipse(0, -150, 90, 50, -.25, 0, 7); c.fill();
  c.beginPath(); c.ellipse(-95, -215, 52, 30, -.2, 0, 7); c.fill();
  c.beginPath(); c.moveTo(70, -170); c.quadraticCurveTo(170, -150, 240, -110); c.quadraticCurveTo(160, -120, 60, -120); c.fill();
  M.rr(c, -20, -120, 26, 120, 8); c.fill(); M.rr(c, 25, -120, 26, 120, 8); c.fill();
  c.restore();
}
function ceratops(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col;
  c.beginPath(); c.ellipse(20, -110, 130, 70, 0, 0, 7); c.fill();
  c.beginPath(); c.arc(-125, -140, 62, 0, 7); c.fill();
  c.beginPath(); c.moveTo(-150, -120); c.lineTo(-215, -170); c.lineTo(-160, -95); c.fill();
  [[-60], [-20], [60], [100]].forEach(([lx]) => { M.rr(c, lx - 18, -60, 36, 60, 8); c.fill(); });
  c.beginPath(); c.moveTo(140, -120); c.lineTo(230, -70); c.lineTo(140, -80); c.fill();
  c.restore();
}
function stego(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col;
  c.beginPath(); c.ellipse(0, -110, 140, 72, 0, 0, 7); c.fill();
  for (let k = 0; k < 5; k++) { const px = -90 + k * 45; c.beginPath(); c.moveTo(px - 22, -165); c.lineTo(px, -230 + Math.abs(k - 2) * 18); c.lineTo(px + 22, -165); c.fill(); }
  c.beginPath(); c.ellipse(-160, -80, 40, 24, 0, 0, 7); c.fill();
  c.beginPath(); c.moveTo(130, -120); c.lineTo(260, -70); c.lineTo(130, -80); c.fill();
  [[-80], [-30], [50], [95]].forEach(([lx]) => { M.rr(c, lx - 18, -60, 36, 60, 8); c.fill(); });
  c.restore();
}
const KINDS = [sauropod, theropod, ceratops, stego];
function mini(c, i, x, y, s, col) { const f = KINDS[i % 4]; if (f === sauropod) sauropod(c, x, y, s * .62, { color: col }); else f(c, x, y, s, col); }

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

// 56 field positions (CBC's count; illustrative, never labelled)
const FIELD = []; { const cols = 7, rows = 8; for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) FIELD.push({ x: 120 + k * 130 + (r % 2) * 40, y: 560 + r * 104, i: r * cols + k }); }
const KEEP = 31;   // the one that survives (centre of the field)
const ORDER = (() => { const r = M.rng(11), a = FIELD.map(f => f.i).filter(i => i !== KEEP); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; })();

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // S0 HOOK (0-1.7 s): frame 0 already diving over real Calgary onto the zoo on St. George's Island; pin drops at 0.4 s
  { dur: SPLIT, trans: { kind: 'zoom', dur: .3 }, draw: (c, t) => {
      const zoo = M.geo.lm('Calgary Zoo') || [3213, 292, 0];
      const w = M.world({ sky: 'day', fog: { near: 9000, far: 52000, max: .4 } }); M.geo.addBase(w, { buildings: true, roads: true });
      if (!THUMB) M.pin(w, zoo, 'CALGARY ZOO', { p: M.seg(t, .35, .95, 'linear'), size: 52, scale: 1.3 });
      M.ping(w, zoo, t, { r: 160 });
      const cam = M.camera(M.moves.dive(zoo, M.seg(t, 0, SPLIT + 1.0, 'outCubic'), { h0: 20000, h1: 3200, back0: 1, back1: 3600, ahead: 300 }), W, H); w.render(c, cam);
      if (THUMB) return;
      dark(c, 330, 760, .55);
      M.kinetic(c, '50+ dinosaurs.', t, CX, 420, { t0: -.45, size: 150, maxW: 900, highlight: ['50'], every: .1 });
      M.text(c, 'N ↑', 60, 1380, { size: 32, weight: 700, color: '#fff' });
      M.source(c, MAPC, 60, 1460, { size: 20 });
  } },
  // S1 FIELD: 56 small dinosaur silhouettes pop in, then wink out until one gold sauropod remains and grows (C1)
  { dur: sc[0].sceneDur - SPLIT, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      const D = sc[0].sceneDur - SPLIT; navyBg(c);
      M.kinetic(c, '50+ dinosaurs.', 9, CX, 300, { size: 120, maxW: 900, highlight: ['50'] });
      const outP = M.seg(t, .35, D - .55, 'inOutSine'), gone = Math.floor(outP * ORDER.length), grow = M.seg(t, D - .6, D, 'outBack');
      FIELD.forEach(f => {
        if (f.i === KEEP) return;
        const pop = M.ease.outBack(M.seg(t, f.i * .004, f.i * .004 + .25, 'linear')), idx = ORDER.indexOf(f.i);
        let a = 1, s = .26 * pop; if (idx < gone) { const k = M.seg(outP * ORDER.length - idx, 0, 1, 'linear'); a = 1 - k; s *= 1 - .4 * k; }
        if (a <= 0 || s <= 0) return; c.save(); c.globalAlpha = a; mini(c, f.i, f.x, f.y + 70, s, CONC); c.restore();
      });
      const kf = FIELD[KEEP]; sauropod(c, M.lerp(kf.x, CX - 40, grow), M.lerp(kf.y + 70, 1170, grow), M.lerp(.17, .8, grow), { glow: true });
      stamp(c, 'ONE SURVIVED', CX, 600, M.seg(t, D - .5, D - .15, 'outBack'), { size: 110 });
      M.source(c, SRC, 60, 1460, { size: 22 });
  } },
  // S2 DINNY: the silhouette builds left to right with a concrete texture; name punches in; 1937 slams (C2)
  { dur: sc[1].sceneDur, trans: { kind: 'zoom', dur: .4 }, draw: (c, t) => {
      navyBg(c); ground(c, 1150);
      const push = M.lerp(1, 1.06, M.seg(t, 0, sc[1].sceneDur, 'linear'));
      sauropod(c, CX - 40, 1150, .9 * push, { reveal: M.seg(t, 0, .9, 'outCubic'), texture: true, glow: true, eye: true });
      M.kinetic(c, 'Dinny', t, CX, 250, { t0: .15, size: 170, highlight: ['dinny'] });
      const k1 = M.seg(t, .9, 1.3, 'outBack'); if (k1 > 0) M.chip(c, 'CONCRETE BRONTOSAURUS', CX, 460, { align: 'center', size: 50, alpha: Math.min(1, k1) });
      stamp(c, 'UNVEILED 1937', CX, 640, M.seg(t, 1.9, 2.3, 'outBack'), { size: 80, rot: -.03 });
      M.source(c, SRC, 60, 1500, { size: 22 });
  } },
  // S3 1983: timeline 1937 -> 1983 scrubs; small statues around Dinny crumble at the 1983 marker; Dinny stays (C3)
  { dur: sc[2].sceneDur, trans: { kind: 'dissolve', dur: .4 }, draw: (c, t) => {
      navyBg(c, '#0d2747', '#071226'); ground(c, 1230);
      const p = M.seg(t, .1, 2.0, 'inOutCubic');
      { const x0 = 170, x1 = 910, ty = 470, hx = M.lerp(x0, x1, p);
        c.save(); c.lineCap = 'round'; c.lineWidth = 10; c.strokeStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.moveTo(x0, ty); c.lineTo(x1, ty); c.stroke();
        c.strokeStyle = GOLD; c.beginPath(); c.moveTo(x0, ty); c.lineTo(hx, ty); c.stroke();
        [[x0, '1937', 'Unveiled', 'left', true], [x1, '1983', 'Park taken down', 'right', p >= 1]].forEach(([x, yr, lb, al, on]) => {
          c.fillStyle = on ? GOLD : '#9fb0c8'; c.beginPath(); c.arc(x, ty, on ? 20 : 13, 0, 7); c.fill();
          M.text(c, yr, x + (al === 'left' ? -20 : 20), ty - 140, { size: 100, weight: 800, align: al, color: on ? '#fff' : '#9fb0c8' });
          M.text(c, lb, x + (al === 'left' ? -20 : 20), ty + 40, { size: 50, weight: 600, align: al, color: on ? '#dfe7f2' : '#7f8ea6' }); });
        c.restore(); }
      const fall = M.seg(t, 2.0, 2.8, 'inCubic');
      [[150, 1230, 0, .5], [340, 1230, 3, .42], [790, 1230, 1, .5], [930, 1230, 2, .42]].forEach(([x, y, i, s], j) => {
        c.save(); c.globalAlpha = 1 - fall; c.translate(x, y + fall * 60); c.rotate(fall * (j % 2 ? .5 : -.5)); mini(c, i, 0, 0, s * (1 - .3 * fall), CONC); c.restore();
        if (fall > 0 && fall < 1) { const r = M.rng(30 + j); c.fillStyle = `rgba(154,163,173,${(1 - fall) * .9})`; for (let q = 0; q < 10; q++) { c.beginPath(); c.arc(x + (r() - .5) * 120, y - r() * 40 * (1 - fall), 6 + r() * 8, 0, 7); c.fill(); } }
      });
      sauropod(c, CX - 30, 1230, .62, { glow: true, eye: true });
      const k = M.seg(t, 2.1, 2.5, 'outBack'); if (k > 0) M.chip(c, '1983: PARK TAKEN DOWN', CX, 610, { align: 'center', size: 56, alpha: Math.min(1, k), bg: '#ffffff' });
      stamp(c, 'DINNY STAYED', CX, 830, M.seg(t, 2.7, 3.05, 'outBack'), { size: 100 });
      M.source(c, SRC, 60, 1500, { size: 22 });
  } },
  // S4 FLOOD: water rises from the bottom and stops at the base of his neck (C4)
  { dur: sc[3].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      navyBg(c, '#1a2a3d', '#0b1626');
      const gy = 1180, s = .9, lvl = M.lerp(H + 40, gy + NECK_Y * s, M.seg(t, .2, 2.2, 'outCubic'));
      sauropod(c, CX - 40, gy, s, { color: '#c9a24a', eye: true });
      c.save(); c.globalAlpha = .82; const g = c.createLinearGradient(0, lvl, 0, H); g.addColorStop(0, '#3d7fc4'); g.addColorStop(1, '#14365e'); c.fillStyle = g;
      c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 20) c.lineTo(x, lvl + Math.sin(x / 60 + t * 4) * 10 + Math.sin(x / 23 - t * 3) * 4); c.lineTo(W, H); c.closePath(); c.fill(); c.restore();
      const k = M.seg(t, 1.9, 2.3, 'outCubic'); if (k > 0) { c.save(); c.globalAlpha = k; c.setLineDash([18, 12]); c.strokeStyle = '#ffffff'; c.lineWidth = 4; c.beginPath(); c.moveTo(80, gy + NECK_Y * s); c.lineTo(W - 140, gy + NECK_Y * s); c.stroke(); c.restore(); }
      const k0 = M.seg(t, .1, .5, 'outBack'); if (k0 > 0) M.chip(c, '2013 FLOOD', CX, 330, { align: 'center', size: 60, alpha: Math.min(1, k0), bg: '#7cc4ff' });
      M.kinetic(c, 'Up to his neck', t, CX, 480, { t0: 1.6, size: 120, maxW: 880, highlight: ['neck'] });
      M.source(c, SRC, 60, 1500, { size: 22 });
  } },
  // S5 QUESTION: no end card (under 2:00); Dinny small at the bottom
  { dur: sc[4].sceneDur, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      sauropod(c, CX + 20, 1640, .55, { glow: true, eye: true });
      M.closer(c, 'Have you seen Dinny?', M.seg(t, 0, sc[4].sceneDur, 'linear'), W, H, { highlight: ['dinny?'] });
  } },
], overlay: (c, t, info) => {
  if (THUMB) return;
  if (t > 3 && info.index < 5) M.header(c, window.LOGO, W, H);
  if (info.index < 5) M.caption(c, S.captionAt(t), W, H);
} });

window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.02, sfx: 'impact', gain: -5 }, { t: 0.45, sfx: 'pop', gain: -10 },
  { t: SPLIT - .15, sfx: 'whoosh', gain: -11 }, { t: SPLIT + .15, sfx: 'pop', gain: -13 },
  { t: SPLIT + .4, sfx: 'ticks', dur: Math.max(.5, sc[0].sceneDur - SPLIT - 1.0), gain: -13 },
  { t: sc[0].sceneDur - .45, sfx: 'stamp', gain: -7 },
  { t: sc[1].sceneStart - .15, sfx: 'whoosh', gain: -10 }, { t: sc[1].sceneStart + 1.0, sfx: 'pop', gain: -12 }, { t: sc[1].sceneStart + 1.95, sfx: 'impact', gain: -6 },
  { t: sc[2].sceneStart + .1, sfx: 'ticks', dur: 1.8, gain: -13 }, { t: sc[2].sceneStart + 2.0, sfx: 'whoosh', gain: -12 }, { t: sc[2].sceneStart + 2.75, sfx: 'stamp', gain: -7 },
  { t: sc[3].sceneStart - .15, sfx: 'whoosh', gain: -10 }, { t: sc[3].sceneStart + .3, sfx: 'whoosh_rev', dur: 1.6, gain: -14 },
  { t: sc[4].sceneStart - .15, sfx: 'whoosh', gain: -12 },
];
