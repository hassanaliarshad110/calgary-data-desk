/* CRICKET KAHANI — Underarm 1981: the last ball rolled along the ground (MCG, 1 Feb 1981). Vertical 1080x1920. */
const AUS = '#f2c230', AUSD = '#1f6b3a', NZC = '#cdb58a', NZD = '#5a3b22', WB = '#f2f2ee';
const GREG = kitOf(AUS, AUSD, { name: 'Greg', height: 450, skin: '#e2b48f', hair: { style: 'side', color: '#4a3220' }, beard: 'full', pants: AUS });
const TREVOR = kitOf(AUS, AUSD, { name: 'Trevor', height: 420, build: 'slim', skin: '#e6ba96', hair: { style: 'short', color: '#5a3b22' }, beard: 'mustache', pants: AUS });
const MCK = kitOf(NZC, NZD, { name: 'McKechnie', height: 440, build: 'muscular', skin: '#e2b48f', hair: { style: 'short', color: '#3a2a1c' }, pants: NZC, top: { type: 'shirt', color: NZC, sleeve: 'long' } });
function rollPose(t, k) { const p = MOVES.idle(t, { seed: 4 }); p.yaw = 1.2; p.lean = 0.8; p.legL.kn = 0.9; p.legR.kn = 0.5; p.legL.sw = 0.6; p.legR.sw = -0.4; p.armR.sw = lerp(-0.9, 0.35, ease('inOut', clamp(k))); p.armR.el = 0.05; p.armR.ab = 0.05; p.armL.sw = 0.2; return p; }
function blockPose(t) { const p = battingPose(t, 0, 0); p.lean = 0.3; p.armL.sw = p.armR.sw = 0.35; p.armL.el = p.armR.el = 0.3; return p; }
const MCGSKY = ['#9cc9e8', '#f0e6c8'];
/* the roll: ball along the pitch from x0 to x1 */
function rolling(t, t0, d, x0, x1, gy = 1180) { const k = clamp((t - t0) / d); const x = lerp(x0, x1, k); for (let i = 0; i < 6; i++) { C.fillStyle = 'rgba(244,236,216,0.5)'; C.fillRect(x - 40 - i * 34, gy + 4, 18, 4); } ball(x, gy - 18, 20, { rot: x / 20, col: WB }); return x; }
function tick(ok, x, y, s = 1) { withT(() => { circle(0, 0, 54); fillPath(ok ? '#2e9a4f' : RED, CR, 6); C.strokeStyle = '#fff'; C.lineWidth = 14; C.lineCap = 'round'; C.beginPath(); if (ok) { C.moveTo(-26, 2); C.lineTo(-6, 24); C.lineTo(28, -20); } else { C.moveTo(-22, -22); C.lineTo(22, 22); C.moveTo(22, -22); C.lineTo(-22, 22); } C.stroke(); }, { x, y, s }); }

const DRAW_FN = {
  s0: t => { const d = TL.shot('s0').dur; sideGround(t, { seed: 31, sky: MCGSKY }); stumps(t); tint('rgba(4,20,14,0.25)');
    const bp = blockPose(t); drawChar(MCK, bp, 700, 1180, 1.5, { t }); const [hx, hy] = jointPos(MCK, bp, 700, 1180, 1.5, 'wriR'); bat(hx, hy, 0.1, 1.25);
    rolling(t, 0.05, d - 0.3, -40, hx - 30);
    card(pop(t, 0.1, 0.4), 540, 330, 860, 200, () => { text('AAKHRI GEND', 0, -34, { font: AF(96), fill: '#fff' }); text('TIE KE LIYE CHAHIYE: CHHAKKA', 0, 52, { font: IF(800, 34), fill: AMB, ls: 2 }); }, { bg: RED, r: 26 });
    stamp('ZAMEEN PAR?!', 335, 560, t, 1.5, { col: AMB, size: 92, bg: 'rgba(5,24,17,0.9)' }); caption(0, t - 0.5, d - 0.5); },
  s1: t => { const d = TL.shot('s1').dur; wideGround(t, { rows: 7, y0: 660, seed: 33, sky: MCGSKY });
    dateCard('1 FEB 1981', 'MELBOURNE · MCG', 'FINAL SERIES 1–1 SE BARABAR', t, { y: 310 });
    vsChips('AUSTRALIA', AUS, 'NEW ZEALAND', NZC, 1100, pop(t, 1.9, 0.5), { fa: G, fb: NZD, mid: CR, font: AF(46) });
    header(); caption(1, t - 0.1, d - 0.1); },
  s2: t => { const S = TL.shot('s2'), d = S.dur, va = S.vo_at, vo = S.vo; stripes(0); tint('rgba(4,20,14,0.3)'); groundTop(540, 800, 490, 500);
    dot(540, 690, AUS, { r: 16 }); dot(560, 925, NZC, { r: 20 }); chip('BATSMAN: BRIAN McKECHNIE · NO. 10', 540, 1130, { bg: NZC, fg: NZD, font: IF(800, 30), h: 58, a: fade(t, 0.4) });
    const k = ease('out', clamp((t - va - vo * 0.45) / 1.0)); if (k > 0) { C.setLineDash([18, 14]); C.strokeStyle = AMB; C.lineWidth = 8; C.beginPath(); C.moveTo(560, 905); C.quadraticCurveTo(lerp(560, 300, k), lerp(905, 560, k), lerp(560, 150, k), lerp(905, 470, k)); C.stroke(); C.setLineDash([]); }
    if (k >= 1) { const kk = pop(t, va + vo * 0.45 + 1.0, 0.4); withT(() => { circle(0, 0, 70); fillPath(AMB, G, 8); text('6?', 0, 6, { font: AF(80), fill: G }); }, { x: 150, y: 450, s: kk }); }
    card(1, 540, 320, 820, 160, () => { text('1 GEND BAAKI', -370, 2, { font: AF(64), fill: CR, align: 'left' }); text('TIE = 6 RUN', 370, 4, { font: AF(64), fill: AMB, align: 'right' }); }, { stroke: NZC });
    chip('MCG: DUNIYA KE SABSE BADE MAIDANON MEIN SE EK', 540, 1200, { bg: INK, fg: CR, font: IF(700, 28), h: 56, a: fade(t, 0.8) });
    header(); caption(2, t - 0.1, d - 0.1); },
  s3: t => { const S = TL.shot('s3'), d = S.dur, va = S.vo_at, vo = S.vo, tB = va + vo * 0.62; stripes(t * 40, true); tint('rgba(242,194,48,0.14)');
    const a = MOVES.point(t - 0.6, { yaw: 0.7 }); a.face.expr = 'determined'; const b = MOVES.listen(t, { yaw: -0.6 }); if (t > tB + 0.4) b.face.expr = 'surprised';
    drawChar(GREG, a, 300, 1270, 1.5, { t }); drawChar(TREVOR, b, 790, 1270, 1.5, { t }); ball(905, 1090, 22, { col: WB });
    chip('GREG CHAPPELL · CAPTAIN', 300, 1310, { bg: AUSD, font: IF(800, 28), h: 54, a: fade(t, 0.3) }); chip('TREVOR · CHHOTA BHAI', 790, 1310, { bg: AUSD, font: IF(800, 28), h: 54, a: fade(t, 0.7) });
    bubble('', 560, 400, pop(t, tB, 0.4), { size: 100, tailX: -230, tailY: 250, lines: ['UNDERARM', 'DAALO!'] });
    header(); caption(3, t - 0.1, d - 0.1); },
  s4: t => { const S = TL.shot('s4'), d = S.dur, va = S.vo_at, vo = S.vo, t0 = va + 0.2, tHit = va + vo * 0.42, tThrow = va + vo * 0.72; sideGround(t, { seed: 31, sky: MCGSKY }); stumps(t);
    drawChar(TREVOR, rollPose(t, (t - t0 + 0.5) / 0.6), 200, 1180, 1.4, { t });
    const thrown = t > tThrow; const bp = thrown ? MOVES.shout(t - tThrow, { yaw: -0.9 }) : blockPose(t); if (thrown) bp.face.expr = 'angry'; drawChar(MCK, bp, 700, 1180, 1.5, { t });
    const [hx, hy] = jointPos(MCK, blockPose(t), 700, 1180, 1.5, 'wriR');
    if (!thrown) bat(hx, hy, 0.1, 1.25); else { const u = t - tThrow; bat(hx - 260 * u, hy - 420 * u + 520 * u * u, 0.1 - u * 9, 1.25); }
    if (t > t0) { const x = rolling(t, t0, tHit - t0, 260, hx - 34); if (t > tHit && t < tHit + 0.3) FX.dust(t, { x: x, y: 1180, t0: tHit, n: 10 }); }
    chip('UNDERARM · ZAMEEN PAR', 540, 320, { bg: AUSD, font: IF(800, 34), h: 66, a: fade(t, t0) }); if (t > tHit && !thrown) chip('ROK DIYA', 520, 560, { bg: NZC, fg: NZD, font: AF(56), h: 90 });
    stamp('BALLA PHENK DIYA!', 345, 450, t, tThrow + 0.1, { col: RED, size: 68, bg: 'rgba(244,236,216,0.95)' });
    header(); caption(4, t - 0.1, d - 0.1); },
  s5: t => { const S = TL.shot('s5'), d = S.dur, va = S.vo_at, vo = S.vo, t1 = va + vo * 0.38, t2 = va + vo * 0.68; stripes(t * 30);
    card(pop(t, 0.15, 0.5), 540, 340, 860, 190, () => { text('AUSTRALIA 6 RUN SE JEETA', 0, -22, { font: AF(78), fill: G }); text('235/4  vs  229/8', 0, 52, { font: IF(800, 32), fill: DRED, ls: 3 }); }, { bg: AUS, r: 26 });
    card(pop(t, t1, 0.45), 300, 760, 440, 420, () => { text('RULE', 0, -140, { font: AF(80), fill: CR }); text('1981 MEIN', 0, -78, { font: IF(800, 28), fill: TAN, ls: 3 }); tick(true, 0, 30, 1.3); text('ANDAR', 0, 150, { font: AF(56), fill: '#7be08f' }); }, { stroke: '#2e9a4f' });
    card(pop(t, t2, 0.45), 780, 760, 440, 420, () => { text('SPIRIT', 0, -140, { font: AF(80), fill: CR }); text('KHEL KI', 0, -78, { font: IF(800, 28), fill: TAN, ls: 3 }); tick(false, 0, 30, 1.3); text('KHILAAF', 0, 150, { font: AF(56), fill: '#ff7b7b' }); }, { stroke: RED });
    header(); caption(5, t - 0.1, d - 0.1); },
  s6: t => { const S = TL.shot('s6'), d = S.dur, va = S.vo_at, vo = S.vo, tI = va + vo * 0.55; stripes(t * 20); tint('rgba(4,20,14,0.3)');
    paper(t, 0.1, { y: 520, rot: -0.04, date: 'FEBRUARY 1981', head: ['DONO PRADHAN MANTRI', 'BOLE: YEH GHALAT THA'], hsize: 74, sub: 'NEW ZEALAND AUR AUSTRALIA, DONO KE' });
    paper(t, tI, { x: 550, y: 1010, rot: 0.04, w: 760, mast: 'ICC', head: ['UNDERARM GEND'], hsize: 92, from: -1 }); stamp('PABANDI', 770, 1135, t, tI + 0.8, { col: RED, size: 92, r: -0.16, bg: 'rgba(239,230,207,0.8)' });
    header(); caption(6, t - 0.1, d - 0.1); },
  s7: t => lastShot(t, (t, S) => { stripes(t * 20); tint('rgba(242,194,48,0.1)'); const va = S.vo_at, tq = va + S.vo * 0.36;
    const p = t < tq ? MOVES.facepalm(t - 0.3) : MOVES.shrug((t - tq) % 2.2); p.yaw = 0.2; drawChar(GREG, p, 300, 1260, 1.45, { t });
    card(pop(t, 0.3, 0.5), 660, 420, 700, 190, () => { text('GREG CHAPPELL', 0, -34, { font: AF(70), fill: CR }); text('BAAD MEIN AFSOS JATAYA', 0, 44, { font: IF(800, 32), fill: AMB, ls: 2 }); }, { stroke: AUS });
    if (t > tq) bubble('', 720, 760, pop(t, tq, 0.4), { size: 70, tailX: -240, tailY: 170, lines: ['AAP CAPTAIN', 'HOTE TO?'], fg: G }); },
    { q: 'AAP CAPTAIN HOTE TO?', next: 'INZAMAM 1992' }),
};
window.drawCover = () => { coverBase('AAKHRI GEND', 'ZAMEEN PAR!', '1981 · AUSTRALIA vs NEW ZEALAND', { s1: 130, s2: 140 });
  C.fillStyle = GRASS; C.fillRect(0, 1180, 1080, 500); C.fillStyle = PITCH; C.fillRect(0, 1480, 1080, 120);
  drawChar(TREVOR, rollPose(0, 1), 230, 1480, 1.7, { t: 0 }); const bp = blockPose(0); drawChar(MCK, bp, 840, 1480, 1.75, { t: 0 }); const [hx, hy] = jointPos(MCK, bp, 840, 1480, 1.75, 'wriR'); bat(hx, hy, 0.1, 1.5);
  for (let i = 0; i < 7; i++) { C.fillStyle = 'rgba(244,236,216,0.7)'; C.fillRect(330 + i * 40, 1486, 22, 5); } ball(640, 1452, 30, { col: WB, rot: 1 });
  chip('TIE KE LIYE CHAHIYE THA CHHAKKA', 540, 700, { bg: RED, font: AF(50), h: 86 }); chip('UNDERARM!', 540, 1632, { bg: AUS, fg: G, font: AF(50), h: 76 }); coverFoot(); };
ckBoot();
