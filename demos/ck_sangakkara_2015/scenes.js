/* CRICKET KAHANI — Four hundreds in a row: Kumar Sangakkara, 2015 World Cup. Vertical 1080x1920. */
const SLB = '#1c3f94', SLD = '#12265e', SCO = '#4a2f7a', BAN = '#0b6b4b', ENB = '#2a4fa0';
const SANGA = kitOf(SLB, SLD, { name: 'Sangakkara', height: 430, skin: '#a8714c', hair: { style: 'short', color: '#17100b' } });
const BOWLER = kitOf(SCO, SCO, { name: 'Bowler', height: 425, build: 'slim', skin: '#e6bd9c', hair: { style: 'short', color: '#6a4a2a' } });
const SC = ['105*', '117*', '104', '124'];

/* ---------- this episode's own drawing ---------- */
/* the four matches as tiles; the first `on` are lit and show the score */
function tiles4(on, y, { w = 210, h = 150, gap = 20, fs = 84, sub = true } = {}) { const W = 4 * w + 3 * gap, sx = 540 - W / 2;
  for (let i = 0; i < 4; i++) { const x = sx + i * (w + gap), is = i < on; rr(x, y - h / 2, w, h, Math.min(20, h / 4)); fillPath(is ? AMB : 'rgba(5,24,17,0.72)', is ? null : TAN, 4);
    if (is) { text(SC[i], x + w / 2, y + (sub ? -10 : 4), { font: AF(fs), fill: G }); if (sub) text('SHATAK ' + (i + 1), x + w / 2, y + h / 2 - 24, { font: IF(800, 22), fill: G, ls: 2 }); }
    else text('MATCH ' + (i + 1), x + w / 2, y + 2, { font: IF(800, sub ? 26 : 22), fill: TAN, ls: 2 }); } }
/* one match as a score card: title bar, opponent chip, a note, and the score popping in on the right */
function matchCard(k, y, title, opp, oppCol, score, note, ks) { card(k, 540, y, 920, 240, () => {
    rr(-446, -106, 892, 58, 12); fillPath('#16241d'); text(title, 0, -76, { font: IF(800, 28), fill: AMB, ls: 3 });
    text('vs', -420, 2, { font: AF(44), fill: TAN, align: 'left' }); C.font = AF(52); const w = C.measureText(opp).width + 60; chip(opp, -352 + w / 2, 0, { bg: oppCol, font: AF(52), h: 80, padX: 30 });
    text(note, -420, 78, { font: IF(700, 26), fill: CR, align: 'left' });
    if (ks > 0) withT(() => text(score, 0, 0, { font: AF(150), fill: AMB, align: 'right' }), { x: 424, y: 34, s: 0.7 + 0.3 * ks, a: clamp(ks * 2) });
  }, { bg: '#0b1410', stroke: '#2a3a33', lw: 8 }); }
/* Sangakkara with the bat: up = raised to the crowd, else resting */
function withBat(pose, x, gy, s, t, up) { drawChar(SANGA, pose, x, gy, s, { t }); const [hx, hy] = jointPos(SANGA, pose, x, gy, s, 'wriR'); bat(hx, hy, up ? Math.PI - 0.12 : 0.12, s * 0.82); }

const DRAW_FN = {
  /* hook: four matches, four hundreds lighting up one by one */
  s0: t => { const S = TL.shot('s0'), d = S.dur, va = S.vo_at, vo = S.vo, tP = Math.min(va + vo * 0.46, 1.95), tS = va + vo * 0.6; stripes(t * 120); tint('rgba(4,20,14,0.55)'); FX.speedLines(t, { cx: 540, cy: 860, n: 50, a: 0.14, inner: 470 });
    const kb = pop(t, 0.03, 0.4); if (kb > 0) withT(() => { rr(-455, -76, 910, 152, 22); fillPath(RED); text('4 MATCH, 4 SHATAK!', 0, 6, { font: AF(104), fill: '#fff' }); }, { x: 540, y: 300, s: kb });
    const n = t < 0.4 ? 0 : Math.min(4, 1 + Math.floor((t - 0.4) / 0.42)); C.globalAlpha = fade(t, 0.15); tiles4(n, 500); C.globalAlpha = 1;
    text('WORLD CUP 2015 · KUMAR SANGAKKARA', 540, 626, { font: IF(800, 32), fill: TAN, ls: 3, a: fade(t, 0.45) });
    shake(t, tP + 0.25, 0.4, 16, () => bigNum('4', 540, 850, ease('elastic', (t - tP) / 0.9), { size: 320, label: 'LAGATAAR ODI SHATAK', lsize: 40 })); flash(t, tP + 0.25, 0.25);
    stamp('PEHLI BAAR!', 540, 1150, t, Math.max(tS, tP + 0.9), { col: '#fff', size: 86, r: -0.05, bg: RED });
    caption(0, t - 0.5, d - 0.5); },
  /* character close-up: Sangakkara at his last World Cup */
  s1: t => { const S = TL.shot('s1'), d = S.dur, va = S.vo_at, vo = S.vo, tN = va + vo * 0.36, tA = va + vo * 0.74; stripes(t * 40, true); tint('rgba(28,63,148,0.42)'); FX.glow(520, 1000, 680, '255,210,140', 0.2);
    const p = MOVES.idle(t, { seed: 4 }); p.yaw = 0.3; p.armR.ab = 1.15; p.armR.sw = 0.25; p.armR.el = 1.5; p.handR = 'fist'; p.face.expr = 'happy';
    drawChar(SANGA, p, 500, 1900, 2.3, { t }); const [hx, hy] = jointPos(SANGA, p, 500, 1900, 2.3, 'wriR'); bat(hx, hy, Math.PI - 0.3, 1.9);
    C.fillStyle = '#0a2a20'; C.fillRect(0, 1470, 1080, 450); C.fillStyle = TAN; C.fillRect(0, 1466, 1080, 6);
    const k0 = pop(t, 0.15, 0.45); if (k0 > 0) withT(() => chip('WORLD CUP 2015', 0, 0, { bg: CR, fg: G, font: AF(84), h: 124, padX: 46 }), { x: 540, y: 310, s: k0 });
    plate('KUMAR SANGAKKARA', 'SRI LANKA · WICKETKEEPER-BATTER', AMB, 480, pop(t, tN));
    const ka = pop(t, tA, 0.4); if (ka > 0) withT(() => chip('37 SAAL · AAKHRI WORLD CUP', 0, 0, { bg: RED, font: AF(50), h: 84, padX: 34 }), { x: 540, y: 630, s: ka }); flash(t, tN, 0.2);
    header(); caption(1, t - 0.1, d - 0.1); },
  /* scoreboard: hundreds one and two, both not out */
  s2: t => { const S = TL.shot('s2'), d = S.dur, va = S.vo_at, vo = S.vo, tA = va + vo * 0.3, tB = va + vo * 0.53, tB2 = va + vo * 0.84; stripes(t * 40);
    tiles4(t > tB2 ? 2 : t > tA ? 1 : 0, 272, { w: 200, h: 72, fs: 46, sub: false });
    matchCard(pop(t, 0.12, 0.45), 470, 'SHATAK 1 · 26 FEB · MELBOURNE', 'BANGLADESH', BAN, '105*', 'UNKA 400th ODI · SRI LANKA 332/1', pop(t, tA, 0.4));
    matchCard(pop(t, tB - 0.25, 0.45), 750, 'SHATAK 2 · 1 MARCH · WELLINGTON', 'ENGLAND', ENB, '117*', 'ENGLAND 309/6 · SRI LANKA 312/1', pop(t, tB2, 0.4));
    flash(t, tA, 0.2); flash(t, tB2, 0.2);
    chip('100 SIRF 70 GEND MEIN · UNKA SABSE TEZ ODI SHATAK', 540, 922, { bg: AMB, fg: G, font: IF(800, 30), h: 58, a: fade(t, tB2 + 0.35) });
    const sw = 0.5 + 0.5 * Math.sin(t * 3.2), bp = battingPose(t, sw, 0, -1.0); drawChar(SANGA, bp, 330, 1200, 0.56, { t }); const [hx, hy] = jointPos(SANGA, bp, 330, 1200, 0.56, 'wriR'); bat(hx, hy, 0.25, 0.5);
    chip('DO MATCH · DONO BAAR NAABAAD', 690, 1090, { bg: 'rgba(5,24,17,0.88)', fg: CR, font: AF(40), h: 66, a: fade(t, tB2 + 0.6) });
    header(); caption(2, t - 0.1, d - 0.1); },
  /* stadium wide: the third hundred, in a losing cause */
  s3: t => { const S = TL.shot('s3'), d = S.dur, va = S.vo_at, vo = S.vo, tS = va + vo * 0.34, tL = va + vo * 0.56, tK = va + vo * 0.8;
    wideGround(t, { rows: 5, y0: 700, seed: 13, sky: ['#e9a36f', '#f6e3b8'] }); stumps(t, 1e9, 531, 946, 0.26);
    const up = t > tS && t < tL, p = up ? MOVES.powerPose(t - tS, { yaw: 0.15, expr: 'happy' }) : MOVES.idle(t, { seed: 5 }); if (!up) { p.yaw = 0.2; p.face.expr = t > tK ? 'determined' : t > tL ? 'sad' : 'neutral'; if (t > tL && t < tK) p.head.pitch = 0.22; }
    withBat(p, 540, 1205, 0.62, t, up);
    dateCard('8 MARCH', 'SYDNEY · vs AUSTRALIA', 'WORLD CUP 2015 · POOL A', t, { y: 330, t0: 0.15, t1: 0.55 });
    card(pop(t, tS), 540, 668, 600, 150, () => { text('SANGAKKARA', -120, 6, { font: AF(60), fill: CR }); text('104', 190, 8, { font: AF(116), fill: AMB }); }, { stroke: AMB }); flash(t, tS, 0.2);
    chip('AUSTRALIA 376/9 · SRI LANKA 312 · 64 RUN SE HAAR', 540, 796, { bg: 'rgba(5,24,17,0.92)', fg: CR, font: AF(38), h: 66, a: fade(t, tL) });
    const kk = pop(t, tK, 0.4); if (kk > 0) withT(() => chip('3 LAGATAAR SHATAK · WORLD CUP MEIN PEHLI BAAR', 0, 0, { bg: AMB, fg: G, font: AF(38), h: 70 }), { x: 540, y: 880, s: kk });
    header(); caption(3, t - 0.1, d - 0.1); },
  /* side view: Hobart, the fourth hundred */
  s4: t => { const S = TL.shot('s4'), d = S.dur, va = S.vo_at, vo = S.vo, tC = va + vo * 0.5, tF = tC + 1.3, P = 1.5, rel = 0.42, hit = 0.62, done = t >= tF;
    sideGround(t, { seed: 21, y0: 668, sky: ['#a9cfe0', '#efe0bd'] }); const ph = ((t / P) % 1 + 1) % 1; stumps(t, 1e9);
    const sw = ph > hit - 0.08 ? clamp((ph - hit + 0.08) / 0.12) : 0, bp = battingPose(t, sw, 0); drawChar(SANGA, bp, 690, 1180, 1.25, { t }); const [hx, hy] = jointPos(SANGA, bp, 690, 1180, 1.25, 'wriR'); bat(hx, hy, 0.15 + sw * 1.9, 1.05);
    drawChar(BOWLER, bowlPose(t, clamp(ph / rel)), lerp(40, 230, ease('out', clamp(ph / rel))), 1180, 1.15, { t });
    if (ph > rel && ph < hit) ballFly(ph, rel, hit - rel, [290, 810], [640, 1050], { arc: 110, r: 17 });
    if (ph >= hit) { ballFly(ph, hit, 1 - hit, [640, 1050], [-80, 600], { arc: 150, r: 17 }); const u = (ph - hit) * P; if (u < 0.22) { circle(640, 1050, 20 + u * 260); fillPath(null, `rgba(255,183,3,${1 - u / 0.22})`, 8); } }
    const kd = pop(t, 0.12, 0.45); if (kd > 0) withT(() => chip('11 MARCH · HOBART · vs SCOTLAND', 0, 0, { bg: CR, fg: G, font: AF(54), h: 88, padX: 36 }), { x: 540, y: 268, s: kd });
    const v = Math.round(124 * ease('out', clamp((t - tC) / 1.3)));
    card(pop(t, tC - 0.25), 540, 420, 660, 160, () => { text('SANGAKKARA', -150, 6, { font: AF(62), fill: CR }); text(String(v), 200, 8, { font: AF(122), fill: done ? AMB : CR }); }, { stroke: AMB });
    flash(t, tF, 0.25); chip('95 GEND · 13 CHAUKE · 4 CHHAKKE', 540, 552, { bg: AMB, fg: G, font: AF(42), h: 70, a: fade(t, tF) });
    header(); caption(4, t - 0.1, d - 0.1); },
  /* payoff: all four tiles lit */
  s5: t => { const S = TL.shot('s5'), d = S.dur, va = S.vo_at, vo = S.vo, t4 = va + 0.3, tH = va + vo * 0.52; stripes(t * 120); tint('rgba(4,20,14,0.5)'); FX.speedLines(t, { cx: 540, cy: 900, n: 50, a: 0.14, inner: 470 }); FX.glow(540, 960, 520, '255,210,140', 0.22);
    const kc = pop(t, 0.05, 0.4); if (kc > 0) withT(() => chip('LAGATAAR CHAUTHA SHATAK!', 0, 0, { bg: AMB, fg: G, font: AF(58), h: 92, padX: 40 }), { x: 540, y: 272, s: kc });
    tiles4(t > t4 ? 4 : 3, 430); flash(t, t4, 0.25);
    drawChar(SANGA, MOVES.celebrate(t, { yaw: 0.2 }), 540, 1200, 0.8, { t }); FX.confetti(t, { t0: t4, n: 120 });
    stamp('ODI ITIHAAS MEIN PEHLI BAAR', 540, 596, t, tH, { col: '#fff', size: 70, r: -0.03, bg: RED });
    chip('IS WORLD CUP MEIN: 541 RUN · 7 MATCH', 540, 1254, { bg: 'rgba(5,24,17,0.9)', fg: CR, font: AF(40), h: 62, a: fade(t, tH + 0.5) });
    header(); caption(5, t - 0.1, d - 0.1); },
  /* pitch map: the catch behind the stumps, and the wicketkeeping record */
  s6: t => { const S = TL.shot('s6'), d = S.dur, va = S.vo_at, vo = S.vo, tC = va + vo * 0.42, cx = 540, cy = 590, P = 1.7; stripes(t * 30); tint('rgba(4,20,14,0.35)'); groundTop(cx, cy, 420, 270, { pl: 250, pw: 70 });
    const b0 = [cx + 16, cy - 142], bt = [cx - 4, cy + 80], kp = [cx + 34, cy + 196], ph = ((t / P) % 1 + 1) % 1;
    [[-150, 150], [-260, 30], [240, 110], [-90, -190], [200, -120], [330, 10], [110, 226], [176, 204]].forEach(([dx, dy]) => dot(cx + dx, cy + dy, CR, { r: 12, ring: '#b9ad92' }));
    dot(b0[0], b0[1] - 14, SLB, { r: 16 }); dot(bt[0], bt[1], SCO, { r: 17, ring: CR }); dot(kp[0], kp[1], SLB, { r: 22, ring: AMB });
    C.font = IF(800, 24); const lw = C.measureText('SANGAKKARA (WICKETKEEPER)').width + 36; chip('SANGAKKARA (WICKETKEEPER)', kp[0] - 40 - lw / 2, kp[1] + 4, { bg: AMB, fg: G, font: IF(800, 24), h: 44, padX: 18 });
    if (ph < 0.5) ballFly(ph, 0, 0.5, b0, [bt[0] + 10, bt[1] - 8], { r: 11, n: 4 }); else if (ph < 0.64) ballFly(ph, 0.5, 0.14, [bt[0] + 10, bt[1] - 8], kp, { r: 11, n: 4 });
    else { const u = (ph - 0.64) / 0.3; if (u < 1) { circle(kp[0], kp[1], 24 + u * 70); fillPath(null, `rgba(255,183,3,${1 - u})`, 7); } }
    chip(t < tC ? 'USI DIN · EK AUR RECORD' : 'WORLD CUP · WICKETKEEPER KE SHIKAAR', 540, 262, { bg: t < tC ? RED : AMB, fg: t < tC ? '#fff' : G, font: AF(46), h: 80, a: fade(t, 0.15) });
    hbar('SANGAKKARA', 54, 54, 916, (t - tC) / 0.9, { col: AMB, lab2: '41 CATCH + 13 STUMPING' }); hbar('GILCHRIST', 52, 54, 1052, (t - tC - 0.5) / 0.9, { col: TAN, lab2: '45 CATCH + 7 STUMPING' }); flash(t, tC, 0.2);
    header(); caption(6, t - 0.1, d - 0.1); },
  /* newspaper + the record that still stands, then the end card */
  s7: t => lastShot(t, (t, S, tEnd) => { const va = S.vo_at, tq = Math.min(va + S.vo * 0.42, tEnd - 2.2); stripes(t * 20);
    paper(t, 0.1, { y: 500, mast: 'KAHANI TIMES', date: 'HOBART · 11 MARCH 2015', head: ['4 MATCH', '4 SHATAK!'], sub: 'SANGAKKARA: 105* · 117* · 104 · 124', hsize: 98, rot: -0.03 });
    stamp('11 SAAL · RECORD KAYAM', 540, 852, t, va + 0.9, { col: AMB, size: 74, r: -0.04, bg: 'rgba(5,24,17,0.94)' });
    hbar('SANGAKKARA · 2015', 4, 4, 936, (t - va - 1.3) / 1.0, { col: AMB }); hbar('KOHLI · ROHIT · BABAR', 3, 4, 1030, (t - va - 1.6) / 1.0, { col: TAN });
    const kq = pop(t, tq, 0.4); if (kq > 0) withT(() => chip('YEH RECORD KAUN TODEGA?', 0, 0, { bg: RED, font: AF(46), h: 72 }), { x: 540, y: 1152, s: kq * (1 + 0.03 * Math.sin(t * 9)) }); },
    { q: 'YEH RECORD KAUN TODEGA?', next: 'NETHERLANDS vs SOUTH AFRICA' }),
};
window.drawCover = () => { coverBase('4 MATCH', '4 SHATAK!', 'KUMAR SANGAKKARA · WORLD CUP 2015', { s1: 124, s2: 150 });
  text('4', 540, 1190, { font: AF(640), fill: 'rgba(255,183,3,0.16)' }); FX.glow(540, 1150, 520, '255,210,140', 0.18);
  tiles4(4, 694, { h: 124, fs: 74 });
  const p = MOVES.powerPose(1, { yaw: 0.15, expr: 'happy' }); withBat(p, 560, 1580, 1.36, 0, true);
  ball(880, 1060, 62, { rot: 0.5 }); ball(190, 1330, 40, { rot: 2 });
  chip('ODI ITIHAAS MEIN PEHLI BAAR · RECORD AAJ BHI KAYAM', 540, 1640, { bg: RED, font: AF(40), h: 72 }); coverFoot(); };
ckBoot();
