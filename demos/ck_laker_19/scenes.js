/* CRICKET KAHANI — 19 wickets in one Test: Jim Laker (Old Trafford, 26–31 July 1956). Vertical 1080x1920. */
const ENG = '#1c2f5e', AUS = '#1f5e3a', CRM = '#f1ead6';
const LAKER = kitOf(CRM, ENG, { name: 'Laker', height: 420, skin: '#e0b08c', hair: { style: 'short', color: '#3a2a1c' }, top: { type: 'shirt', color: CRM, sleeve: 'long' } });
const LOCK = kitOf(CRM, null, { name: 'Lock', height: 425, build: 'slim', skin: '#e6bd9c', hair: { style: 'balding', color: '#6a4a2a' } });
const OPENER = kitOf(CRM, ENG, { name: 'Opener', height: 410, skin: '#dba983', hair: { style: 'short', color: '#2a1c12' } });
const BATTER = kitOf(CRM, AUS, { name: 'Batter', height: 410, skin: '#d9a57e', hair: { style: 'short', color: '#6a4a2a' } });
const TRAVELLER = person({ name: 'Traveller', height: 420, skin: '#e0b08c', hair: { style: 'side', color: '#3a2a1c' }, top: { type: 'coat', color: '#6f5d45' }, shirt: '#e9e2cf', bottom: { type: 'pants', color: '#3a3a44' }, shoes: '#2a1c12' });
const fan = (skin, coat, hair, hs = 'short') => person({ name: 'Fan', height: 405, skin, hair: { style: hs, color: hair }, top: { type: 'coat', color: coat }, shirt: '#d8d2c2', bottom: { type: 'pants', color: '#2f2f38' }, shoes: '#221a14' });
const FANS = [fan('#d9a57e', '#3e4a5a', '#2a1c12'), fan('#e6bd9c', '#5a3a2e', '#9a948a', 'balding'), fan('#c99672', '#3f5240', '#1a120c', 'side')];

/* a row of n wicket tiles; the first `on` are lit */
function tiles(n, on, y, { w = 84, gap = 12, lit = AMB } = {}) { const W = n * w + (n - 1) * gap, sx = 540 - W / 2;
  for (let i = 0; i < n; i++) { const x = sx + i * (w + gap), is = i < on; rr(x, y - w / 2, w, w, 14); fillPath(is ? lit : 'rgba(5,24,17,0.62)', is ? null : TAN, 4);
    if (is) text('W', x + w / 2, y + 4, { font: AF(w * 0.62), fill: G }); } }
function clouds(t, y = 520) { for (let i = 0; i < 5; i++) { const x = ((i * 290 + t * 14) % 1400) - 160, yy = y + (i % 3) * 44; C.fillStyle = 'rgba(244,244,240,0.75)';
  for (const [dx, dy, r] of [[0, 0, 46], [52, -18, 56], [110, 2, 42], [56, 16, 50]]) { circle(x + dx, yy + dy, r); C.fill(); } } }
/* spin diagram: a ball with two curved arrows showing the off-break */
function spinBall(x, y, r, t, k) { if (k <= 0) return; withT(() => { ball(0, 0, r, { rot: t * 7 });
  for (const a0 of [0.3, 0.3 + Math.PI]) { C.beginPath(); C.arc(0, 0, r + 34, a0, a0 + 1.9); C.strokeStyle = AMB; C.lineWidth = 12; C.lineCap = 'round'; C.stroke();
    const a1 = a0 + 1.9, px = Math.cos(a1) * (r + 34), py = Math.sin(a1) * (r + 34); withT(() => { poly([[-22, -8], [14, 0], [-22, 22]]); fillPath(AMB); }, { x: px, y: py, r: a1 + Math.PI / 2 - 0.25 }); } }, { x, y, s: k }); }
/* 1950s pub interior */
function pub(t) { for (let i = 0; i < 12; i++) { C.fillStyle = i % 2 ? '#553728' : '#4b3023'; C.fillRect(i * 90, 0, 90, 1000); }
  C.fillStyle = '#39241a'; C.fillRect(0, 1000, 1080, 190); C.fillStyle = '#24160f'; C.fillRect(0, 996, 1080, 12);
  for (let i = 0; i < 6; i++) { rr(30 + i * 180, 1036, 150, 124, 8); fillPath(null, '#2c1b13', 5); }
  C.fillStyle = '#2b1c13'; C.fillRect(0, 1190, 1080, 730); for (let i = 0; i < 8; i++) { C.fillStyle = 'rgba(255,255,255,0.035)'; C.fillRect(0, 1190 + i * 92, 1080, 4); }
  C.fillStyle = '#1c120c'; C.fillRect(896, 0, 8, 250); poly([[840, 250], [960, 250], [1000, 330], [800, 330]]); fillPath('#c9a45a', '#5a4320', 5); FX.glow(900, 360, 460, '255,205,130', 0.3); }
function oldTV(x, y, t, lower) { rr(x - 40, y + 330, 500, 24, 6); fillPath('#7a4e2c', '#2c1b13', 5); poly([[x + 20, y + 354], [x + 60, y + 354], [x + 20, y + 410]]); fillPath('#5c3a22'); poly([[x + 400, y + 354], [x + 360, y + 354], [x + 400, y + 410]]); fillPath('#5c3a22');
  C.strokeStyle = '#b9b9b0'; C.lineWidth = 6; C.lineCap = 'round'; C.beginPath(); C.moveTo(x + 210, y + 4); C.lineTo(x + 120, y - 96); C.moveTo(x + 210, y + 4); C.lineTo(x + 300, y - 96); C.stroke();
  rr(x, y, 420, 330, 28); fillPath('#8a5a34', '#3a2414', 7); const sx = x + 26, sy = y + 30, sw = 290, sh = 250;
  C.save(); rr(sx, sy, sw, sh, 34); C.clip(); C.fillStyle = '#cfd6d0'; C.fillRect(sx, sy, sw, sh); C.fillStyle = '#8e9892'; C.fillRect(sx, sy + 150, sw, 100); C.fillStyle = '#b4bcb6'; C.fillRect(sx + 20, sy + 176, sw - 40, 26);
  const ph = (t % 1.3) / 1.3, rel = 0.45, hit = 0.7; for (let k = 0; k < 3; k++) { withT(() => { C.fillStyle = '#f2f2ee'; C.fillRect(-2.5, -52, 5, 52); }, { x: sx + 226 + k * 11, y: sy + 190, r: ph > hit && k === 1 ? Math.min(0.5, (ph - hit) * 3) : 0 }); }
  const bx = sx + 36 + 46 * ease('out', clamp(ph / rel)), by = sy + 190; C.strokeStyle = '#3a403c'; C.lineWidth = 6; C.beginPath(); C.moveTo(bx, by - 46); C.lineTo(bx, by - 16); C.moveTo(bx, by - 16); C.lineTo(bx - 9, by); C.moveTo(bx, by - 16); C.lineTo(bx + 10, by); const aa = -1.2 + ph * 6.6; C.moveTo(bx, by - 42); C.lineTo(bx + Math.cos(aa) * 24, by - 42 + Math.sin(aa) * 24); C.stroke(); circle(bx, by - 56, 10); fillPath('#3a403c');
  if (ph > rel && ph < hit) { const u = (ph - rel) / (hit - rel); circle(lerp(bx + 16, sx + 236, u), by - 66 + 46 * u - Math.sin(u * Math.PI) * 30, 5); fillPath('#2a2e2b'); }
  if (lower > 0) { C.globalAlpha = lower; C.fillStyle = 'rgba(20,24,22,0.86)'; C.fillRect(sx, sy + 204, sw, 46); text('LAKER · 19 WICKET', sx + sw / 2, sy + 228, { font: IF(800, 24), fill: '#f2f2ee', ls: 1 }); C.globalAlpha = 1; }
  for (let i = 0; i < 42; i++) { C.fillStyle = 'rgba(0,0,0,0.07)'; C.fillRect(sx, sy + i * 6 + ((t * 30) % 6), sw, 2); } C.restore(); rr(sx, sy, sw, sh, 34); fillPath(null, '#2c1b13', 6);
  for (const ky of [78, 150]) { circle(x + 366, y + ky, 24); fillPath('#d8c9a2', '#3a2414', 5); C.fillStyle = '#3a2414'; C.fillRect(x + 363, y + ky - 20, 6, 20); } for (let i = 0; i < 5; i++) { C.fillStyle = '#3a2414'; C.fillRect(x + 340, y + 214 + i * 14, 52, 5); }
  FX.glow(sx + sw / 2, sy + sh / 2, 330, '210,225,255', 0.16); }

const DRAW_FN = {
  /* hook: the 20 wickets of a Test, 19 of them lighting up */
  s0: t => { const S = TL.shot('s0'), d = S.dur, va = S.vo_at, vo = S.vo, t19 = va + vo * 0.5; stripes(t * 120); tint('rgba(4,20,14,0.55)'); FX.speedLines(t, { cx: 540, cy: 850, n: 50, a: 0.14, inner: 470 });
    const kb = pop(t, 0.03, 0.4); if (kb > 0) withT(() => { rr(-455, -76, 910, 152, 22); fillPath(RED); text('20 MEIN SE 19 WICKET!', 0, 6, { font: AF(92), fill: '#fff' }); }, { x: 540, y: 300, s: kb });
    const n = Math.round(19 * clamp((t - t19) / 1.1)); C.globalAlpha = fade(t, 0.2); tiles(10, Math.min(10, n), 474); tiles(10, Math.max(0, n - 10), 570); C.globalAlpha = 1;
    text('EK TEAM · EK TEST · 20 WICKET', 540, 652, { font: IF(800, 32), fill: TAN, ls: 3, a: fade(t, 0.45) });
    shake(t, t19 + 1.1, 0.4, 16, () => bigNum('19', 540, 900, ease('elastic', (t - t19 - 0.15) / 0.9), { size: 300, label: 'AKELE EK BOWLER KE', lsize: 40 })); flash(t, t19 + 1.1, 0.25);
    ball(540, 1166, 54, { rot: t * 5 }); caption(0, t - 0.5, d - 0.5); },
  /* stadium wide: Old Trafford under a grey Manchester sky */
  s1: t => { const d = TL.shot('s1').dur; wideGround(t, { rows: 5, y0: 700, seed: 9, sky: ['#aebbc4', '#e7e2d0'] }); clouds(t);
    stumps(t, 1e9, 531, 946, 0.26); stumps(t, 1e9, 521, 1290, 0.55);
    dateCard('JULY 1956', 'OLD TRAFFORD · MANCHESTER', 'ASHES · CHAUTHA TEST', t, { y: 330 });
    vsChips('ENGLAND', ENG, 'AUSTRALIA', AUS, 1040, pop(t, 1.9, 0.5), { mid: CR, fb: AMB });
    header(); caption(1, t - 0.1, d - 0.1); },
  /* scoreboard, then a close-up of the bowler */
  s2: t => { const S = TL.shot('s2'), d = S.dur, va = S.vo_at, vo = S.vo, tc = va + vo * 0.43;
    if (t < tc) { stripes(t * 40);
      board('ENGLAND · PEHLI PAARI', [['RICHARDSON', '104', { t0: 0.45 }], ['SHEPPARD', '113', { t0: 0.75 }], ['TOTAL', '459', { col: CR, vsize: 96, lcol: AMB, t0: va + 0.95 }]], t, 0.1, { y: 300 });
      const bp = battingPose(t, 0.5 + 0.5 * Math.sin(t * 3.2), 0, -1.0); drawChar(OPENER, bp, 540, 1250, 1.2, { t }); const [hx, hy] = jointPos(OPENER, bp, 540, 1250, 1.2, 'wriR'); bat(hx, hy, 0.25, 1.0);
    } else { const u = t - tc; stripes(t * 40, true); tint('rgba(28,47,94,0.38)'); FX.glow(480, 900, 640, '255,210,140', 0.2);
      const p = MOVES.idle(t, { seed: 4 }); p.yaw = 0.3; p.armR.ab = 0.35; p.armR.sw = 1.0; p.armR.el = 1.5; p.handR = 'fist';
      drawChar(LAKER, p, 430, 1830, 2.4, { t }); C.fillStyle = '#0a2a20'; C.fillRect(0, 1470, 1080, 450); C.fillStyle = TAN; C.fillRect(0, 1466, 1080, 6); const [hx, hy] = jointPos(LAKER, p, 430, 1830, 2.4, 'wriR'); ball(hx + 4, hy - 56 - Math.abs(Math.sin(u * 3.2)) * 150, 46, { rot: u * 14 });
      plate('JIM LAKER', 'OFF-SPINNER · SURREY · ENGLAND', AMB, 350, pop(t, tc + 0.2));
      spinBall(850, 640, 78, t, pop(t, tc + 0.7)); chip('OFF-BREAK', 850, 800, { bg: CR, fg: G, font: IF(800, 30), h: 58, a: fade(t, tc + 0.9) }); flash(t, tc, 0.2); }
    header(); caption(2, t - 0.1, d - 0.1); },
  /* pitch map: seven wickets in 22 balls after tea */
  s3: t => { const S = TL.shot('s3'), d = S.dur, va = S.vo_at, vo = S.vo, cx = 540, cy = 690, P = 0.3, Tw = i => va + 0.45 + i * P, tAll = va + vo * 0.49, t9 = va + vo * 0.89;
    stripes(t * 30); tint('rgba(4,20,14,0.35)'); groundTop(cx, cy, 420, 380, { pl: 300, pw: 74 });
    let n = 0; for (let i = 0; i < 7; i++) if (t > Tw(i)) n++;
    [[-104, 24], [-88, 92], [-128, -52], [96, 60], [118, -20], [0, 96]].forEach(([dx, dy]) => dot(cx + dx, cy + 110 + dy, CR, { r: 13, ring: '#b9ad92' }));
    dot(cx + 26, cy - 172, ENG, { r: 20, label: 'LAKER' }); const bx = cx, by = cy + 118; dot(bx, by, AUS, { r: 18, ring: AMB });
    if (t > va + 0.15 && t < Tw(6)) { const k = (((t - va - 0.45) / P) % 1 + 1) % 1, q = kk => [cx + 14 + 44 * Math.sin(Math.min(kk, 0.7) / 0.7 * Math.PI / 2) - (kk > 0.7 ? (kk - 0.7) / 0.3 * 56 : 0), lerp(cy - 150, by - 6, kk)];
      for (let j = 0; j < 9; j++) { const kk = k - j * 0.07; if (kk < 0) break; const [x, y] = q(kk); circle(x, y, 5); fillPath(`rgba(255,255,255,${0.6 - j * 0.06})`); } const [x, y] = q(k); ball(x, y, 13, { rot: t * 20 }); }
    for (let i = 0; i < 7; i++) { const u = t - Tw(i); if (u > 0 && u < 0.28) { circle(bx, by, 22 + u * 220); fillPath(null, `rgba(179,32,42,${1 - u / 0.28})`, 8); } }
    chip(n < 7 ? 'CHAI KE BAAD' : '22 GEND · 8 RUN · 7 WICKET', 540, 252, { bg: n < 7 ? RED : AMB, fg: n < 7 ? '#fff' : G, font: AF(46), h: 80, a: fade(t, 0.15) });
    tiles(7, n, 1140); flash(t, tAll, 0.25); stamp('84 ALL OUT', 540, 610, t, tAll, { col: RED, size: 128, bg: 'rgba(244,236,216,0.95)', r: -0.06 });
    card(pop(t, t9), 540, 890, 640, 176, () => { text('LAKER', -150, 6, { font: AF(84), fill: CR }); text('9/37', 150, 8, { font: AF(116), fill: AMB }); }, { stroke: AMB });
    header(); caption(3, t - 0.1, d - 0.1); },
  /* side view: all ten in the second innings */
  s4: t => { const S = TL.shot('s4'), d = S.dur, va = S.vo_at, vo = S.vo, t0 = va + vo * 0.26, tF = va + vo * 0.77, P = 1.0, rel = 0.5, hit = 0.78, done = t >= tF;
    sideGround(t, { seed: 21, y0: 668, sky: ['#aab7c0', '#e4dfcf'] });
    const n = t < t0 ? 0 : Math.min(10, 1 + Math.floor((t - t0) / ((tF - t0) / 9.2))), ph = (((t - tF) / P + hit) % 1 + 1) % 1;
    stumps(t, done ? tF : ph > hit ? t - (ph - hit) * P : 1e9);
    const bp = battingPose(t, done ? 0.2 : ph > rel + 0.1 ? clamp((ph - rel - 0.1) / 0.15) * 0.6 : 0, done || ph > hit ? 0.7 : 0); drawChar(BATTER, bp, 690, 1180, 1.25, { t });
    const [hx, hy] = jointPos(BATTER, bp, 690, 1180, 1.25, 'wriR'); bat(hx, hy, 0.15, 1.05);
    if (done) { drawChar(LAKER, MOVES.celebrate(t - tF, { yaw: 0.5 }), 280, 1180, 1.2, { t }); FX.confetti(t, { t0: tF, n: 120 }); }
    else { drawChar(LAKER, bowlPose(t, ph), lerp(60, 250, ease('out', clamp(ph / rel))), 1180, 1.2, { t }); if (ph > rel && ph < hit) ballFly(ph, rel, hit - rel, [300, 800], [826, 1040], { arc: 150, r: 17 }); }
    chip(done ? 'TEST CRICKET MEIN PEHLI BAAR!' : 'FOLLOW-ON · DOOSRI PAARI', 540, 252, { bg: done ? AMB : RED, fg: done ? G : '#fff', font: AF(46), h: 80, a: fade(t, 0.15) });
    card(pop(t, 0.2), 540, 410, 780, 210, () => { if (done) { text('LAKER', -200, 8, { font: AF(84), fill: CR }); text('10/53', 140, 10, { font: AF(140), fill: AMB }); }
      else { text('LAKER KE WICKET', -130, 4, { font: IF(800, 38), fill: TAN, ls: 2 }); text(n + '/10', 220, 10, { font: AF(140), fill: n ? AMB : '#56655d' }); } }, { stroke: AMB });
    tiles(10, n, 580); flash(t, tF, 0.25);
    header(); caption(4, t - 0.1, d - 0.1); },
  /* match figures: 19 for Laker, 1 for Lock */
  s5: t => { const S = TL.shot('s5'), d = S.dur, va = S.vo_at, vo = S.vo, tL = va + vo * 0.54; stripes(t * 40);
    board('POORA MATCH · WICKET / RUN', [['JIM LAKER', '19/90', { vsize: 96, t0: va + 0.7 }], ['TONY LOCK', '1/106', { col: TAN, t0: tL + 0.5 }]], t, 0.1, { y: 288, rowH: 118 });
    const lit = Math.round(19 * clamp((t - va - 0.4) / 1.3)); for (let i = 0; i < 20; i++) { const x = 63 + i * 48; rr(x, 676, 42, 60, 8); const lk = i === 19 && t > tL + 0.3;
      fillPath(i < lit ? AMB : lk ? TAN : 'rgba(5,24,17,0.7)', i < lit || lk ? null : '#5d6b63', 3); }
    text('LAKER · 19', 63, 778, { font: AF(46), fill: AMB, align: 'left', a: fade(t, va + 0.5) }); text('LOCK · 1', 1017, 778, { font: AF(46), fill: TAN, align: 'right', a: fade(t, tL + 0.3) });
    chip('ENGLAND PAARI AUR 170 RUN SE JEETA', 540, 870, { bg: CR, fg: G, font: AF(44), h: 80, a: fade(t, tL + 1.3) });
    const p1 = MOVES.thumbsUp(t, { yaw: 0.35 }), p2 = MOVES.clap(t, { seed: 6 }); p2.yaw = -0.4; drawChar(LAKER, p1, 410, 1205, 0.66, { t }); if (t > tL) { C.globalAlpha = fade(t, tL); drawChar(LOCK, p2, 670, 1205, 0.66, { t }); C.globalAlpha = 1; }
    chip('LAKER', 240, 1070, { bg: ENG, font: IF(800, 26), h: 50 }); chip('LOCK', 838, 1070, { bg: 'rgba(5,24,17,0.85)', fg: TAN, font: IF(800, 26), h: 50, a: fade(t, tL) });
    header(); caption(5, t - 0.1, d - 0.1); },
  /* the pub in Lichfield: his own bowling on the television, and nobody knows him */
  s6: t => { const S = TL.shot('s6'), d = S.dur, va = S.vo_at, vo = S.vo, tTV = va + vo * 0.44, tN = va + vo * 0.79; pub(t);
    oldTV(80, 400, t, fade(t, tTV + 0.3));
    rr(640, 990, 460, 36, 8); fillPath('#8a5a34', '#2c1b13', 5); C.fillStyle = '#5c3a22'; C.fillRect(664, 1026, 420, 164); C.fillStyle = '#4a2e1b'; for (let i = 0; i < 3; i++) C.fillRect(690 + i * 136, 1050, 104, 120);
    rr(700, 912, 50, 78, 6); fillPath('#d99a2b', '#3a2414', 4); rr(700, 908, 50, 20, 8); fillPath(CR, '#3a2414', 4);
    FANS.forEach((f, i) => { const p = i === 0 ? MOVES.clap(t, { seed: 2 }) : i === 1 ? MOVES.think(t, { seed: 5 }) : MOVES.idle(t, { seed: 8 }); p.yaw = -0.85; p.head.pitch = -0.28; drawChar(f, p, 215 + i * 150, 1195 + (i % 2) * 14, 0.92, { t }); });
    const lp = MOVES.idle(t, { seed: 11 }); lp.yaw = -0.45; lp.head.pitch = 0.22; lp.armR.sw = 0.7; lp.armR.el = 1.7; lp.handR = 'fist'; drawChar(TRAVELLER, lp, 900, 1195, 1.0, { t });
    const [sx, sy] = jointPos(TRAVELLER, lp, 900, 1195, 1.0, 'wriR'); withT(() => { poly([[-26, 8], [26, 8], [0, -30]]); fillPath('#efe2b8', '#8a5a34', 5); }, { x: sx - 4, y: sy - 16, r: -0.2 });
    chip('LICHFIELD · GHAR KE RAASTE MEIN', 540, 252, { bg: RED, font: AF(44), h: 78, a: fade(t, 0.15) });
    const kl = pop(t, va + 0.5, 0.4); if (kl > 0) withT(() => { poly([[-16, 24], [16, 24], [0, 50]]); fillPath(AMB); chip('JIM LAKER', 0, 0, { bg: AMB, fg: G, font: AF(40), h: 64 }); }, { x: 900, y: 690, s: kl });
    if (t < tN) bubble('KYA BOWLING HAI!', 770, 500, pop(t, tTV + 0.5, 0.4), { size: 62, tailX: -210, tailY: 150 });
    flash(t, tN, 0.2); stamp('PEHCHANA NAHI!', 770, 500, t, tN, { col: '#fff', size: 86, r: -0.05, bg: RED });
    header(); caption(6, t - 0.1, d - 0.1); },
  /* newspaper + the record that still stands, then the end card */
  s7: t => lastShot(t, (t, S) => { const va = S.vo_at, tq = va + S.vo * 0.385; stripes(t * 20);
    paper(t, 0.1, { y: 545, mast: 'KAHANI TIMES', date: 'OLD TRAFFORD · 31 JULY 1956', head: ['19 WICKET', 'EK TEST MEIN!'], sub: 'LAKER: 9/37 + 10/53', hsize: 98, rot: -0.03 });
    stamp('70 SAAL · RECORD KAYAM', 540, 905, t, va + 0.9, { col: AMB, size: 74, r: -0.04, bg: 'rgba(5,24,17,0.94)' });
    hbar('LAKER · 1956', 19, 19, 1010, (t - va - 1.3) / 1.0, { col: AMB }); hbar('BARNES · 1913-14', 17, 19, 1104, (t - va - 1.6) / 1.0, { col: TAN });
    const kq = pop(t, tq, 0.4); if (kq > 0) withT(() => chip('KYA YEH KABHI TOOTEGA?', 0, 0, { bg: RED, font: AF(46), h: 78 }), { x: 540, y: 1240, s: kq * (1 + 0.03 * Math.sin(t * 9)) }); },
    { q: 'KYA YEH RECORD TOOTEGA?', next: 'OS AUR RAAT KE MATCH' }),
};
window.drawCover = () => { coverBase('EK TEST MEIN', '19 WICKET!', 'JIM LAKER · OLD TRAFFORD · 1956', { s1: 112, s2: 150 });
  tint('rgba(28,47,94,0.2)'); text('19', 540, 960, { font: AF(520), fill: 'rgba(255,183,3,0.2)' });
  const p = bowlPose(0.33, 1, 0.9); drawChar(LAKER, p, 500, 1560, 1.85, { t: 0 }); const [hx, hy] = jointPos(LAKER, p, 500, 1560, 1.85, 'wriR'); ball(hx + 6, hy - 44, 44, { rot: 0.6 });
  ball(900, 1010, 64, { rot: 0.5 }); ball(190, 1290, 38, { rot: 2 });
  chip('9/37 + 10/53 · RECORD AAJ BHI KAYAM', 540, 1628, { bg: ENG, font: AF(44), h: 74 }); coverFoot(); };
ckBoot();
