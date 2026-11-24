/* CRICKET KAHANI — 800: Murali's last wicket in his last Test (Galle, 22 July 2010). Vertical 1080x1920. */
const SL = '#1b2a6b', IND = '#1d4f9a';
const MURALI = kitOf(WHITE, SL, { name: 'Murali', height: 400, skin: '#5d3c27', hair: { style: 'curly', color: '#0f0a07' }, brows: 1.2 });
const OJHA = kitOf(WHITE, IND, { name: 'Ojha', height: 410, build: 'slim', skin: '#a8714a', top: { type: 'shirt', color: WHITE, sleeve: 'long' } });
const MAHELA = kitOf(WHITE, SL, { name: 'Mahela', height: 410, skin: '#8a5a3a', hair: { style: 'short', color: '#17100b' } });

/* eight wickets needed: a row of eight ball slots that fill one by one */
function slots(filled, t, y = 860, pulse = -1) { for (let i = 0; i < 8; i++) { const x = 540 + (i - 3.5) * 116; const on = i < filled;
  if (on) ball(x, y, 46 * (i === pulse ? 1 + 0.12 * Math.sin(t * 14) : 1), { rot: i }); else { circle(x, y, 44); C.setLineDash([10, 9]); fillPath('rgba(5,24,17,0.55)', TAN, 5); C.setLineDash([]); } } }
function galle(t) { daySky('#8fc6e8', '#e9efd9'); C.fillStyle = '#3d8fb8'; C.fillRect(0, 610, 1080, 110);
  for (let i = 0; i < 9; i++) { C.fillStyle = 'rgba(255,255,255,0.35)'; C.fillRect(((i * 170 + t * 30) % 1300) - 110, 632 + (i % 3) * 26, 90, 5); }
  rr(96, 470, 76, 230, 4); fillPath('#9a8a68'); poly([[84, 470], [134, 400], [184, 470]]); fillPath('#7a3a2a'); circle(134, 536, 22); fillPath(CR, '#3a2c1c', 4);
  C.fillStyle = '#8a7a5c'; C.fillRect(0, 690, 1080, 70); for (let i = 0; i < 14; i++) C.fillRect(i * 80, 668, 46, 24);
  dayCrowd(790, 3, t, 5); C.fillStyle = GRASS; C.fillRect(0, 900, 1080, 1020); C.beginPath(); C.moveTo(480, 900); C.lineTo(600, 900); C.lineTo(690, 1380); C.lineTo(390, 1380); C.closePath(); fillPath(PITCH); }

const DRAW_FN = {
  s0: t => { const d = TL.shot('s0').dur; stripes(t * 120); tint('rgba(4,20,14,0.55)'); FX.speedLines(t, { cx: 540, cy: 660, n: 50, a: 0.16, inner: 420 });
    bigNum('799', 540, 640, pop(t, 0.05, 0.5), { size: 380, label: 'TEST WICKET', lsize: 40 });
    const kp = pop(t, 0.8, 0.4); if (kp > 0) withT(() => { circle(0, 0, 96); fillPath(RED, CR, 8); text('+1?', 0, 6, { font: AF(88), fill: '#fff' }); }, { x: 900, y: 830, s: kp * (1 + 0.06 * Math.sin(t * 9)) });
    const tk = pop(t, 1.3); if (tk > 0) withT(() => { rr(-450, -70, 900, 140, 22); fillPath(RED); text('AAKHRI TEST · AAKHRI DIN', 0, 6, { font: AF(78), fill: '#fff' }); }, { x: 540, y: 300, s: tk });
    chip('800 KE LIYE BAS 1 WICKET', 540, 1010, { bg: CR, fg: G, a: fade(t, 2.1), font: AF(52), h: 88 });
    ball(540, 1160, 58, { rot: t * 5 }); caption(0, t - 0.5, d - 0.5); },
  s1: t => { const d = TL.shot('s1').dur; galle(t);
    dateCard('JULY 2010', 'GALLE · SRI LANKA', 'MURALITHARAN KA AAKHRI TEST', t, { y: 310 });
    vsChips('SRI LANKA', SL, 'INDIA', IND, 1040, pop(t, 2.0, 0.5), { mid: CR });
    header(); caption(1, t - 0.1, d - 0.1); },
  s2: t => { const d = TL.shot('s2').dur; stripes(t * 40);
    text('IS TEST SE PEHLE', 540, 300, { font: IF(800, 40), fill: TAN, ls: 3, a: fade(t, 0.1) });
    bigNum('792', 540, 530, pop(t, 0.15), { size: 300, label: 'TEST WICKET' });
    if (t > 0.9) { C.globalAlpha = fade(t, 0.9); slots(0, t); C.globalAlpha = 1; }
    chip('800 KE LIYE CHAHIYE: 8', 540, 1000, { bg: RED, a: fade(t, 1.3), font: AF(54), h: 90, padX: 40 });
    header(); caption(2, t - 0.1, d - 0.1); },
  s3: t => { const S = TL.shot('s3'), d = S.dur, va = S.vo_at, vo = S.vo; stripes(t * 40);
    const T5 = i => va + 0.25 + i * 0.2, t6 = va + vo * 0.36, t7 = va + vo * 0.74; let n = 0; for (let i = 0; i < 5; i++) if (t > T5(i)) n++; if (t > t6) n = 6; if (t > t7) n = 7;
    text(String(792 + n), 540, 500, { font: AF(300), fill: n === 7 ? AMB : CR, shadow: 'rgba(0,0,0,0.35)' }); text('TEST WICKET', 540, 668, { font: IF(800, 34), fill: CR, ls: 3 });
    slots(n, t, 860, t > t7 ? 6 : -1);
    const lab = t > t7 ? 'AAKHRI SUBAH: HARBHAJAN LBW' : t > t6 ? 'DOOSRI PAARI: 1 WICKET' : 'INDIA KI PEHLI PAARI: 5 WICKET';
    chip(lab, 540, 1000, { bg: t > t7 ? RED : INK, fg: t > t7 ? '#fff' : AMB, font: IF(800, 36), h: 72 });
    flash(t, t7, 0.25); stamp('BAS 1 AUR!', 540, 1150, t, t7 + 0.3, { col: AMB, size: 96, r: -0.05, bg: 'rgba(5,24,17,0.9)' });
    header(); caption(3, t - 0.1, d - 0.1); },
  s4: t => { const S = TL.shot('s4'), d = S.dur; sideGround(t, { seed: 11 }); stumps(t);
    const ph = (t % 1.5) / 1.5, rel = 0.55; const bp = battingPose(t, 0, ph > rel + 0.25 && ph < rel + 0.4 ? 0.6 : 0); drawChar(OJHA, bp, 690, 1180, 1.5, { t });
    const [hx, hy] = jointPos(OJHA, bp, 690, 1180, 1.5, 'wriR'); bat(hx, hy, 0.12, 1.25);
    drawChar(MURALI, bowlPose(t, ph), lerp(60, 250, ease('out', clamp(ph / rel))), 1180, 1.35, { t });
    if (ph > rel) { const u = (ph - rel) / 0.28; if (u < 1) ballFly(u, 0, 1, [300, 780], [hx - 10, hy + 150], { arc: -120, r: 20 }); else ball(hx - 30 - 60 * (u - 1), Math.min(1190, hy + 150 + 80 * (u - 1)), 20, { rot: t * 8 }); }
    const ov = Math.min(15, 1 + Math.floor(clamp((t - 0.3) / (d - 1.6)) * 14.99));
    card(pop(t, 0.2), 540, 380, 760, 250, () => { text('AAKHRI JODI · BINA WICKET', 0, -72, { font: IF(800, 30), fill: TAN, ls: 3 }); text(ov + (ov >= 15 ? '+' : ''), -90, 32, { font: AF(150), fill: AMB }); text('OVER', 130, 50, { font: AF(70), fill: CR }); }, { stroke: AMB });
    chip('INTEZAAR…', 540, 545, { bg: RED, a: 0.8 + 0.2 * Math.sin(t * 5), font: IF(800, 30), h: 56 });
    header(); caption(4, t - 0.1, d - 0.1); },
  s5: t => { const S = TL.shot('s5'), d = S.dur, va = S.vo_at, vo = S.vo, tb = va + vo * 0.18, te = va + vo * 0.42, tc = te + 0.4; sideGround(t, { seed: 11 }); stumps(t);
    const bp = battingPose(t, t > te - 0.15 ? clamp((t - te + 0.15) / 0.15) * 0.5 : 0, 0); drawChar(OJHA, bp, 640, 1180, 1.5, { t });
    const [hx, hy] = jointPos(OJHA, bp, 640, 1180, 1.5, 'wriR'); bat(hx, hy, 0.2, 1.25); const E = [hx + 20, hy + 60], H = [960, 1050];
    const fp = crouch(t, -0.9); if (t > tc) { fp.armL.sw = fp.armR.sw = 1.2; fp.face.expr = 'happy'; } drawChar(MAHELA, fp, 985, 1190, 1.3, { t });
    if (t < te) { const p = ballFly(t, tb, te - tb, [-40, 760], E, { arc: -140, r: 20, e: 'in' }); } else if (t < tc) ballFly(t, te, tc - te, E, H, { arc: 50, r: 20 }); else ball(H[0], H[1] - 20 * clamp((t - tc) * 4), 20);
    if (t > te && t < te + 0.25) FX.glow(E[0], E[1], 130, '255,255,220', 0.8 * (1 - (t - te) / 0.25));
    chip('OFF-BREAK · MURALITHARAN', 540, 320, { bg: SL, a: fade(t, 0.2) * (t < te ? 1 : 0), font: IF(800, 34), h: 66 });
    if (t > te) chip('KINARA!', 520, 520, { bg: AMB, fg: G, font: AF(60), h: 96, a: t < tc ? 1 : 0 });
    flash(t, tc, 0.25); stamp('CATCH!', 540, 310, t, tc + 0.05, { col: RED, size: 140, bg: 'rgba(244,236,216,0.92)' });
    card(pop(t, tc + 0.7), 540, 505, 820, 170, () => { text('OJHA c JAYAWARDENE', 0, -26, { font: AF(62), fill: CR }); text('b MURALITHARAN · 1:55 PM', 0, 42, { font: IF(800, 30), fill: AMB, ls: 2 }); }, { stroke: AMB });
    header(); caption(5, t - 0.1, d - 0.1); },
  s6: t => { const S = TL.shot('s6'), d = S.dur, va = S.vo_at, vo = S.vo; stripes(t * 60); tint('rgba(27,42,107,0.28)'); FX.glow(540, 560, 620, '255,210,140', 0.25);
    shake(t, 0.15, 0.5, 20, () => bigNum('800', 540, 570, ease('elastic', (t - 0.1) / 0.9), { size: 400 })); flash(t, 0.12, 0.3); FX.confetti(t, { t0: 0.3, n: 140 });
    chip('TEST CAREER KI AAKHRI GEND PAR', 540, 300, { bg: RED, a: fade(t, va + vo * 0.2), font: AF(46), h: 80 });
    drawChar(MURALI, MOVES.celebrate(t, { yaw: 0.1 }), 540, 1290, 0.95, { t });
    chip('SRI LANKA 10 WICKET SE JEETA', 540, 815, { bg: CR, fg: G, a: fade(t, va + vo * 0.62), font: AF(46), h: 80 });
    header(); caption(6, t - 0.1, d - 0.1); },
  s7: t => lastShot(t, (t, S) => { stripes(t * 20); const va = S.vo_at;
    text('SABSE ZYADA TEST WICKET', 540, 290, { font: AF(76), fill: CR }); chip('133 TEST', 540, 380, { bg: SL, font: IF(800, 30), h: 56, a: fade(t, 0.3) });
    hbar('MURALITHARAN', 800, 800, 470, (t - 0.3) / 1.2, { col: AMB }); hbar('WARNE', 708, 800, 580, (t - 0.6) / 1.2, { col: TAN }); hbar('ANDERSON', 704, 800, 690, (t - 0.9) / 1.2, { col: TAN });
    stamp('RECORD AAJ BHI KAYAM', 540, 900, t, va + S.vo * 0.22, { col: CR, size: 70, r: -0.04 });
    bigNum('?', 540, 1100, pop(t, va + S.vo * 0.42), { size: 200 }); }, { q: 'KYA KOI YEH RECORD TODEGA?', next: '2019 KA FINAL' }),
};
window.drawCover = () => { coverBase('AAKHRI GEND PAR', '800 WICKET!', 'MURALITHARAN · AAKHRI TEST · GALLE 2010', { s1: 112, s2: 150 });
  tint('rgba(27,42,107,0.18)'); text('800', 540, 930, { font: AF(420), fill: 'rgba(255,183,3,0.22)' });
  drawChar(MURALI, MOVES.celebrate(0.42, { yaw: 0.15 }), 520, 1560, 1.9, { t: 0 }); ball(880, 900, 70, { rot: 0.5 }); ball(180, 1040, 40, { rot: 2 });
  chip('133 TEST · 800 WICKET', 540, 1628, { bg: SL, font: AF(44), h: 74 }); coverFoot(); };
ckBoot();
