/* CRICKET KAHANI — Ireland chase 328: Kevin O'Brien's 50-ball hundred (Bengaluru, 2 March 2011). Vertical 1080x1920. */
const IRE = '#2b9a4b', ENGC = '#1d3f7a', WB = '#f2f2ee';
const KOB = kitOf(IRE, null, { name: "Kevin O'Brien", height: 440, build: 'muscular', skin: '#e9bf9c', hair: { style: 'short', color: '#c0399f' }, beard: 'stubble', brows: 1.1 });
const CUSACK = kitOf(IRE, IRE, { name: 'Cusack', height: 430, skin: '#e2b48f', hair: { style: 'short', color: '#5a3b22' } });
const OPENER = kitOf(IRE, IRE, { name: 'Captain', height: 420, build: 'slim', skin: '#e2b48f', hair: { style: 'short', color: '#3a2a1c' } });
function climb(t, k) { for (let i = 0; i < 10; i++) { const h = (80 + i * i * 9.5) * ease('out', clamp(k * 2 - i * 0.1)); rr(70 + i * 96, 1230 - h, 76, h, 8); fillPath(i === 9 ? RED : 'rgba(216,188,133,0.35)'); } }

const DRAW_FN = {
  s0: t => { const d = TL.shot('s0').dur; stripes(t * 120); tint('rgba(4,20,14,0.5)'); climb(t, t / 1.2);
    text('TARGET', 540, 300, { font: AF(96), fill: CR, a: fade(t, 0.05) }); shake(t, 0.3, 0.4, 16, () => bigNum('328', 540, 590, pop(t, 0.25, 0.5), { size: 400 })); flash(t, 0.27, 0.2);
    const k = pop(t, 1.5, 0.5); if (k > 0) withT(() => { rr(-400, -64, 800, 128, 22); fillPath(IRE); text('CHASE: IRELAND!', 0, 6, { font: AF(88), fill: '#fff' }); }, { x: 540, y: 880, s: k });
    const p = MOVES.idle(t, { seed: 2 }); p.yaw = 0.5; p.head.pitch = -0.35; drawChar(KOB, p, 150, 1240, 0.55, { t }); caption(0, t - 0.5, d - 0.5); },
  s1: t => { const d = TL.shot('s1').dur; wideGround(t, { night: true, y0: 760, seed: 4 });
    dateCard('2 MARCH 2011', 'BENGALURU · WORLD CUP', 'ENGLAND vs IRELAND', t, { y: 320 });
    card(pop(t, 2.0, 0.5), 540, 1100, 660, 150, () => { text('ENGLAND', -290, 4, { font: IF(800, 40), fill: CR, align: 'left' }); text('327/8', 290, 6, { font: AF(84), fill: AMB, align: 'right' }); }, { stroke: '#3b6fd0' });
    header(); caption(1, t - 0.1, d - 0.1); },
  s2: t => { const S = TL.shot('s2'), d = S.dur, va = S.vo_at, vo = S.vo, tO = va + vo * 0.22, tH = va + vo * 0.55; sideGround(t, { night: true, seed: 8 }); stumps(t, tO);
    const p = battingPose(t, t > tO - 0.2 && t < tO + 0.2 ? 0.7 : 0, t > tO ? 1 : 0); if (t > tO) p.face.expr = 'sad'; drawChar(OPENER, p, 700, 1180, 1.34, { t }); const [hx, hy] = jointPos(OPENER, p, 700, 1180, 1.34, 'wriR'); bat(hx, hy, 0.3, 1.14);
    if (t < tO) ballFly(t, tO - 0.5, 0.5, [-60, 940], [842, 1040], { arc: 40, col: WB }); flash(t, tO, 0.25, '179,32,42', 0.35);
    if (t < tH) { stamp('PEHLI GEND: OUT!', 540, 340, t, tO + 0.05, { col: RED, size: 100, bg: 'rgba(244,236,216,0.95)' }); chip('IRELAND 0/1', 540, 520, { bg: INK, fg: AMB, font: AF(54), h: 88, a: fade(t, tO + 0.5) }); }
    else { card(pop(t, tH, 0.5), 540, 400, 720, 300, () => { text('IRELAND · AADHI PAARI', 0, -98, { font: IF(800, 30), fill: TAN, ls: 3 }); text('111/5', 0, 24, { font: AF(190), fill: '#ff5a5a' }); }, { stroke: RED }); chip('TARGET ABHI BHI DOOR: 328', 540, 592, { bg: RED, font: IF(800, 32), h: 62, a: fade(t, tH + 0.5) }); }
    header(); caption(2, t - 0.1, d - 0.1); },
  s3: t => { const S = TL.shot('s3'), d = S.dur, va = S.vo_at, vo = S.vo, tS = va + vo * 0.68; stripes(t * (t > tS ? 500 : 60), true); tint('rgba(43,154,75,0.22)'); if (t > tS) FX.speedLines(t, { cx: 540, cy: 900, n: 70, a: 0.3, inner: 360 });
    const p = t > tS ? MOVES.powerPose(t - tS, { yaw: 0.15 }) : MOVES.idle(t, { seed: 2 }); if (t <= tS) p.yaw = 0.3; p.face.expr = 'determined'; shake(t, tS, 0.5, 14, () => { bat(680, 1190, 0.25, 1.3); drawChar(KOB, p, 520, 1330, 1.55, { t }); });
    plate("KEVIN O'BRIEN", 'IRELAND · NO. 6', IRE, 320, pop(t, 0.3, 0.4));
    chip('BAAL RANGE: CANCER CHARITY KE LIYE', 540, 450, { bg: CR, fg: G, font: IF(800, 30), h: 60, a: fade(t, va + vo * 0.3) * (t < tS ? 1 : 0) });
    stamp('TOOFAN!', 770, 550, t, tS + 0.1, { col: AMB, size: 130, bg: 'rgba(5,24,17,0.85)' });
    header(); caption(3, t - 0.1, d - 0.1); },
  s4: t => { const S = TL.shot('s4'), d = S.dur, va = S.vo_at, vo = S.vo, t100 = va + vo * 0.6; sideGround(t, { night: true, seed: 8 });
    const per = 0.62, n = Math.floor(t / per), ph = (t % per) / per, hit = 0.45; const sw = ph > hit - 0.25 && ph < hit + 0.4 ? (ph < hit ? 1 : 1 - (ph - hit) / 0.4) : 0;
    const p = battingPose(t, sw, 0); drawChar(KOB, p, 760, 1180, 1.34, { t }); const [hx, hy] = jointPos(KOB, p, 760, 1180, 1.34, 'wriR'); bat(hx, hy, sw > 0.2 ? -0.05 - 0.5 * (1 - sw) : 0.35, 1.14);
    const six = n % 3 === 2, H = [hx - 40, hy + 140]; if (ph < hit) ballFly(ph, 0, hit, [-60, 980], H, { arc: 40, col: WB }); else { ballFly(ph, hit, 0.5, H, six ? [-100, 200] : [-140, 900], { arc: six ? 160 : 20, col: WB, e: 'out' }); if (ph < hit + 0.15) FX.glow(H[0], H[1], 150, '255,255,220', 0.8); }
    const k = clamp((t - va) / (vo * 0.5)), f4 = Math.round(13 * k), s6 = Math.round(6 * k), balls = Math.round(50 * clamp((t - 0.2) / (t100 - 0.2)));
    card(1, 300, 380, 420, 240, () => { text('4s', -120, -40, { font: AF(70), fill: CR }); text(String(f4), -120, 50, { font: AF(96), fill: AMB }); text('6s', 100, -40, { font: AF(70), fill: CR }); text(String(s6), 100, 50, { font: AF(96), fill: AMB }); }, { stroke: IRE });
    card(1, 790, 380, 440, 240, () => { text('GEND', 0, -68, { font: IF(800, 30), fill: TAN, ls: 4 }); text(String(balls), 0, 28, { font: AF(150), fill: balls >= 50 ? AMB : CR }); }, { stroke: balls >= 50 ? AMB : '#2a3a33' });
    flash(t, t100, 0.25); stamp('SHATAK!', 300, 615, t, t100, { col: AMB, size: 130, bg: 'rgba(5,24,17,0.9)' }); if (t > t100) FX.confetti(t, { t0: t100, n: 90 });
    chip('TAB WORLD CUP KA SABSE TEZ SHATAK', 300, 745, { bg: RED, font: IF(800, 25), h: 54, a: fade(t, va + vo * 0.78) });
    header(); caption(4, t - 0.1, d - 0.1); },
  s5: t => { const S = TL.shot('s5'), d = S.dur, va = S.vo_at, vo = S.vo, tR = va + vo * 0.62; stripes(t * 30); tint('rgba(43,154,75,0.18)');
    text('PARTNERSHIP', 540, 290, { font: AF(96), fill: CR }); text("O'BRIEN + CUSACK · 6th WICKET", 540, 362, { font: IF(700, 30), fill: TAN, ls: 2 });
    const k = clamp((t - 0.3) / (tR - 0.8)); rr(110, 430, 860, 110, 18); fillPath('rgba(5,24,17,0.8)'); rr(110, 430, Math.max(110, 860 * ease('out', k)), 110, 18); fillPath(IRE); text(count(162, k) + ' RUN', 540, 488, { font: AF(76), fill: '#fff' });
    const a = MOVES.talk(t, { yaw: 0.6, seed: 2 }), b = MOVES.listen(t, { yaw: -0.6 }); bat(380, 1220, 0.25, 1.05); drawChar(KOB, a, 300, 1290, 1.2, { t }); bat(700, 1220, -0.25, 1.05); drawChar(CUSACK, b, 780, 1290, 1.17, { t });
    card(pop(t, tR, 0.5), 540, 650, 800, 190, () => { text("K. O'BRIEN  113 (63)", 0, -28, { font: AF(70), fill: CR }); text('RUN OUT · 49th OVER', 0, 48, { font: IF(800, 32), fill: AMB, ls: 3 }); }, { stroke: RED });
    header(); caption(5, t - 0.1, d - 0.1); },
  s6: t => { const S = TL.shot('s6'), d = S.dur, va = S.vo_at, vo = S.vo, tH = va + vo * 0.38, tW = va + vo * 0.62; stripes(0); tint('rgba(4,20,14,0.3)'); groundTop(540, 820, 480, 480);
    dot(540, 990, ENGC, { r: 15 }); dot(560, 940, IRE, { label: 'MOONEY', r: 20 }); dot(520, 715, IRE, { r: 17 }); const B = [84, 760];
    if (t < tH) ballFly(t, tH - 0.4, 0.4, [540, 700], [556, 925], { r: 12, col: WB }); else ballFly(t, tH, 0.7, [556, 925], B, { r: 12, col: WB, e: 'out', keep: true });
    if (t > tH + 0.7) FX.glow(B[0], B[1], 120, '255,220,120', 0.7 * clamp(1 - (t - tH - 0.7) / 0.6));
    chip('AAKHRI OVER · PEHLI GEND', 540, 300, { bg: INK, fg: AMB, font: IF(800, 34), h: 64 }); stamp('FOUR!', 300, 560, t, tH + 0.7, { col: AMB, size: 120, bg: 'rgba(5,24,17,0.9)' });
    card(pop(t, tW, 0.5), 540, 1130, 820, 220, () => { text('IRELAND 329/7', 0, -40, { font: AF(96), fill: AMB }); text('3 WICKET SE JEET · 5 GEND BAAKI', 0, 56, { font: IF(800, 32), fill: CR, ls: 2 }); }, { stroke: IRE }); if (t > tW) FX.confetti(t, { t0: tW, n: 120 });
    header(); caption(6, t - 0.1, d - 0.1); },
  s7: t => lastShot(t, (t, S) => { stripes(t * 20); const va = S.vo_at;
    paper(t, 0.1, { y: 600, rot: -0.04, date: 'BENGALURU · 2 MARCH 2011', head: ['IRELAND NE', '328 CHASE KIYE!'], hsize: 104, sub: 'TAB TAK WORLD CUP KA SABSE BADA CHASE' });
    paper(t, 0.9, { x: 560, y: 1030, rot: 0.05, w: 700, mast: 'SPORTS EXTRA', head: ["O'BRIEN: 50 GEND, 100"], hsize: 70, from: -1 }); },
    { q: 'AAPKA FAVOURITE UPSET?', next: '1981 KI UNDERARM GEND' }),
};
window.drawCover = () => { coverBase('328 CHASE!', 'IRELAND vs ENGLAND', "KEVIN O'BRIEN · 50 GEND MEIN SHATAK", { s1: 130, s2: 100, band: IRE }); tint('rgba(43,154,75,0.14)');
  text('328', 540, 950, { font: AF(430), fill: 'rgba(255,183,3,0.2)' }); bat(740, 1330, 0.3, 1.6); drawChar(KOB, MOVES.powerPose(1, { yaw: 0.15 }), 520, 1600, 1.7, { t: 0 }); ball(900, 860, 60, { rot: 0.5, col: WB }); ball(170, 1000, 40, { rot: 2, col: WB });
  chip('WORLD CUP 2011', 540, 1650, { bg: RED, font: AF(48), h: 84 }); coverFoot(); };
ckBoot();
