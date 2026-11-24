/* CRICKET KAHANI — Inzamam 1992: the young storm in the semi-final (Eden Park, Auckland, 21 March 1992). Vertical 1080x1920. */
const PAK = '#8cc63f', PAKD = '#1f7a3a', NZG = '#9aa0a6', WB = '#f2f2ee';
const INZI = kitOf(PAK, null, { name: 'Inzamam', height: 450, build: 'average', skin: '#c08a5e', hair: { style: 'short', color: '#17100b' }, brows: 1.15 });
const IMRAN = kitOf(PAK, null, { name: 'Imran', height: 450, skin: '#c89468', hair: { style: 'side', color: '#2a1c14' } });
const MIAN = kitOf(PAK, PAKD, { name: 'Miandad', height: 410, skin: '#b9825a', hair: { style: 'short', color: '#17100b' }, beard: 'mustache' });
function thermo(x, y, k, s = 1) { withT(() => { rr(-26, -260, 52, 300, 26); fillPath('#e9eef2', '#2a3a44', 6); circle(0, 70, 58); fillPath('#e9eef2', '#2a3a44', 6);
  const h = 250 * clamp(k); rr(-12, -10 - h, 24, h + 40, 12); fillPath(RED); circle(0, 70, 42); fillPath(RED); for (let i = 0; i < 6; i++) { C.fillStyle = '#2a3a44'; C.fillRect(30, -230 + i * 42, 22, 5); } }, { x, y, s }); }
const SKY = ['#9ccbe6', '#eef0d6'];

const DRAW_FN = {
  s0: t => { const d = TL.shot('s0').dur, tD = 2.1; if (t < tD) { nightSky('#0b1830'); for (let i = 0; i < 40; i++) { circle(hash(i) * 1080, hash(i + 50) * 900, 2 + hash(i + 9) * 2); fillPath(`rgba(255,255,255,${0.4 + 0.5 * Math.sin(t * 3 + i)})`); }
      circle(840, 330, 90); fillPath('#f3ecc7'); circle(800, 310, 80); fillPath('#0b1830'); thermo(330, 760, t / 1.4, 1.5); FX.sweatDrops(t, { x: 330, y: 300 });
      text('RAAT BHAR', 700, 640, { font: AF(110), fill: CR, a: fade(t, 0.1) }); text('BUKHAR', 700, 770, { font: AF(150), fill: '#ff5a5a', a: fade(t, 0.3) }); }
    else { const u = t - tD; daySky(...SKY); FX.glow(540, 500, 700, '255,230,150', 0.4); dayCrowd(900, 5, t, 2); C.fillStyle = GRASS; C.fillRect(0, 1110, 1080, 810); flash(t, tD, 0.3);
      text('AGLE DIN', 540, 420, { font: AF(110), fill: G, a: fade(u, 0) }); const k = pop(u, 0.2, 0.5); if (k > 0) withT(() => { rr(-470, -160, 940, 320, 28); fillPath(RED); text('WORLD CUP', 0, -62, { font: AF(130), fill: '#fff' }); text('SEMI-FINAL', 0, 78, { font: AF(130), fill: AMB }); }, { x: 540, y: 690, s: k }); }
    caption(0, t - 0.5, d - 0.5); },
  s1: t => { const d = TL.shot('s1').dur; wideGround(t, { seed: 14, sky: SKY });
    dateCard('21 MARCH 1992', 'EDEN PARK · AUCKLAND', 'WORLD CUP SEMI-FINAL', t, { y: 310 });
    card(pop(t, 1.9, 0.5), 540, 1040, 700, 150, () => { text('NEW ZEALAND', -310, 4, { font: IF(800, 38), fill: CR, align: 'left' }); text('262/7', 310, 6, { font: AF(84), fill: AMB, align: 'right' }); }, { stroke: NZG });
    chip('PAKISTAN KA TARGET: 263', 540, 1170, { bg: PAKD, font: AF(46), h: 78, a: fade(t, 2.6) });
    header(); caption(1, t - 0.1, d - 0.1); },
  s2: t => { const S = TL.shot('s2'), d = S.dur, va = S.vo_at, vo = S.vo, tB = va + vo * 0.5; stripes(t * 30, true); tint('rgba(11,24,48,0.35)');
    const a = MOVES.talk(t, { yaw: 0.6, intensity: 0.5, seed: 5 }); a.face.expr = 'sad'; a.lean = 0.08; a.shrug = 0.3; const b = MOVES.listen(t, { yaw: -0.6 });
    drawChar(INZI, a, 300, 1290, 1.45, { t }); drawChar(IMRAN, b, 800, 1290, 1.45, { t }); FX.sweatDrops(t, { x: 300, y: 600 });
    plate('INZAMAM-UL-HAQ', '22 SAAL · MATCH SE PEHLE', PAKD, 320, pop(t, 0.25, 0.4));
    bubble('', 400, 530, pop(t, tB, 0.4), { size: 54, tailX: -110, tailY: 160, lines: ['BUKHAR HAI…', 'SHAYAD KHEL', 'NAHI PAUNGA'], fg: G });
    chip('WASIM AKRAM KE MUTABIQ', 810, 520, { bg: INK, fg: TAN, font: IF(700, 24), h: 46, a: fade(t, 0.8) });
    header(); caption(2, t - 0.1, d - 0.1); },
  s3: t => { const S = TL.shot('s3'), d = S.dur, va = S.vo_at, vo = S.vo, tB = va + vo * 0.25; stripes(t * 30, true); tint('rgba(140,198,63,0.14)');
    const a = MOVES.listen(t, { yaw: 0.6 }); if (t > tB + 1.2) a.face.expr = 'determined'; const b = MOVES.talk(t, { yaw: -0.6, seed: 8 }); b.face.expr = 'determined';
    drawChar(INZI, a, 290, 1290, 1.45, { t }); drawChar(IMRAN, b, 800, 1290, 1.45, { t });
    plate('IMRAN KHAN', 'CAPTAIN · PAKISTAN', PAKD, 320, pop(t, 0.2, 0.4));
    bubble('', 620, 560, pop(t, tB, 0.4), { size: 62, tailX: 170, tailY: 190, lines: ['BAS YEH SOCHO:', 'KHELNA KAISE HAI'], fg: RED });
    chip('WASIM AKRAM KE MUTABIQ', 230, 432, { bg: INK, fg: TAN, font: IF(700, 24), h: 46 });
    header(); caption(3, t - 0.1, d - 0.1); },
  s4: t => { const S = TL.shot('s4'), d = S.dur, va = S.vo_at, vo = S.vo; sideGround(t, { seed: 14, sky: SKY, y0: 700 });
    board('PAKISTAN · CHASE 263', [['SCORE', '140/4', { col: '#ff6b6b' }], ['OVER BAAKI', '15', { t0: va + vo * 0.4 }], ['RUN CHAHIYE', '123', { t0: va + vo * 0.62 }]], t, 0.15, { y: 240, rowH: 84, w: 780, vsize: 58 });
    const m = MOVES.idle(t, { seed: 3 }); m.yaw = -0.5; bat(880, 1110, -0.2, 1.0); drawChar(MIAN, m, 820, 1180, 1.2, { t });
    const kx = ease('out', clamp((t - 0.6) / 2.2)), x = lerp(-140, 380, kx); const p = kx < 1 ? MOVES.walk(t, { speed: 1.1 }) : MOVES.idle(t, { seed: 2 }); if (kx >= 1) p.yaw = 0.4; bat(x + 100, 1115, 0.25, 1.05); drawChar(INZI, p, x, 1180, 1.22, { t });
    header(); caption(4, t - 0.1, d - 0.1); },
  s5: t => { const S = TL.shot('s5'), d = S.dur, va = S.vo_at, vo = S.vo, tP = va + vo * 0.66; sideGround(t, { seed: 14, sky: SKY });
    const per = 0.7, n = Math.floor(t / per), ph = (t % per) / per, hit = 0.45; const sw = ph > hit - 0.25 && ph < hit + 0.4 ? (ph < hit ? 1 : 1 - (ph - hit) / 0.4) : 0;
    const p = battingPose(t, sw, 0); drawChar(INZI, p, 700, 1180, 1.36, { t }); const [hx, hy] = jointPos(INZI, p, 700, 1180, 1.36, 'wriR'); bat(hx, hy, sw > 0.2 ? -0.05 - 0.5 * (1 - sw) : 0.35, 1.15);
    const six = n === 3, H = [hx - 40, hy + 140]; if (ph < hit) ballFly(ph, 0, hit, [-60, 980], H, { arc: 40, col: WB }); else { ballFly(ph, hit, 0.5, H, six ? [-100, 200] : [-140, 900], { arc: six ? 160 : 20, col: WB, e: 'out' }); if (ph < hit + 0.15) FX.glow(H[0], H[1], 150, '255,255,220', 0.8); }
    const k = clamp((t - va) / (vo * 0.3));
    card(1, 540, 370, 860, 240, () => { text('INZAMAM', -390, -88, { font: IF(800, 30), fill: TAN, align: 'left', ls: 3 }); text(count(60, k), -390, 36, { font: AF(150), fill: AMB, align: 'left' }); text('RUN', -190, 52, { font: AF(60), fill: CR, align: 'left' });
      text(count(37, k), 250, 36, { font: AF(150), fill: CR, align: 'right' }); text('GEND', 270, 52, { font: AF(60), fill: TAN, align: 'left' }); }, { stroke: PAK });
    chip('7 × CHAUKE', 330, 548, { bg: PAKD, font: AF(44), h: 74, a: fade(t, va + vo * 0.36) }); chip('1 × CHHAKKA', 750, 548, { bg: RED, font: AF(44), h: 74, a: fade(t, va + vo * 0.5) });
    chip('MIANDAD KE SAATH: 10 OVER, 87 RUN', 330, 640, { bg: CR, fg: G, font: IF(800, 27), h: 58, a: fade(t, tP) });
    header(); caption(5, t - 0.1, d - 0.1); },
  s6: t => { const S = TL.shot('s6'), d = S.dur, va = S.vo_at, vo = S.vo, tR = va + vo * 0.2, tW = va + vo * 0.6; stripes(0); tint('rgba(4,20,14,0.3)'); groundTop(540, 800, 480, 480);
    const F = [300, 560], ST = [540, 682]; const k = clamp((t - tR + 1.1) / 1.1); dot(F[0], F[1], NZG, { label: 'DIRECT HIT' }); dot(574, lerp(920, 720, Math.min(k, 0.92)), PAK, { label: 'INZAMAM', r: 20 }); dot(506, lerp(700, 900, k), PAK, { r: 17, label: 'MIANDAD' });
    if (t < tR) ballFly(t, tR - 0.5, 0.5, F, ST, { r: 12, col: WB }); else { FX.glow(ST[0], ST[1], 110, '255,80,80', 0.7 * clamp(1 - (t - tR) / 0.6)); flash(t, tR, 0.25, '179,32,42', 0.35); }
    if (t < tW) { stamp('RUN OUT', 540, 330, t, tR + 0.05, { col: RED, size: 120, bg: 'rgba(244,236,216,0.95)' }); chip('36 RUN ABHI BAAKI', 540, 480, { bg: INK, fg: AMB, font: AF(46), h: 78, a: fade(t, tR + 0.5) }); }
    else { card(pop(t, tW, 0.5), 540, 380, 860, 250, () => { text('PAKISTAN 4 WICKET SE JEETA', 0, -52, { font: AF(70), fill: '#fff' }); text('MIANDAD 57* · EK OVER BAAKI', 0, 44, { font: IF(800, 34), fill: AMB, ls: 2 }); }, { bg: PAKD, r: 26 }); FX.confetti(t, { t0: tW, n: 120 }); }
    header(); caption(6, t - 0.1, d - 0.1); },
  s7: t => lastShot(t, (t, S) => { stripes(t * 20); tint('rgba(140,198,63,0.14)'); const va = S.vo_at, tC = va + S.vo * 0.2;
    card(pop(t, 0.15, 0.5), 540, 330, 880, 170, () => { text('PEHLI BAAR WORLD CUP FINAL MEIN', 0, 6, { font: AF(60), fill: CR }); }, { stroke: PAK });
    const k = pop(t, tC, 0.5); if (k > 0) { FX.glow(760, 760, 320, '200,240,255', 0.35); trophy(760, 820, 1.7 * k, '#bfe9ff'); FX.confetti(t, { t0: tC, n: 100 }); }
    chip('WORLD CHAMPION 1992', 760, 1020, { bg: AMB, fg: G, font: AF(50), h: 84, a: fade(t, tC + 0.3) });
    drawChar(INZI, t > tC ? MOVES.celebrate(t - tC, { yaw: 0.2 }) : MOVES.idle(t, { seed: 2 }), 300, 1240, 1.3, { t }); },
    { q: 'INZAMAM KI YAADGAAR PAARI?', next: 'ODI KAISE PAIDA HUA' }),
};
window.drawCover = () => { coverBase('BUKHAR MEIN', '37 GEND, 60 RUN!', 'INZAMAM · 1992 WORLD CUP SEMI-FINAL', { s1: 130, s2: 120, band: PAKD }); tint('rgba(140,198,63,0.14)');
  text('60', 300, 980, { font: AF(420), fill: 'rgba(255,183,3,0.22)' }); thermo(900, 1060, 0.9, 1.1);
  const p = battingPose(0, 1, 0); drawChar(INZI, p, 600, 1600, 2.0, { t: 0 }); const [hx, hy] = jointPos(INZI, p, 600, 1600, 2.0, 'wriR'); bat(hx, hy, -0.05, 1.7); ball(180, 1180, 56, { rot: 0.5, col: WB });
  chip('22 SAAL KA NAUJAWAN', 540, 1632, { bg: RED, font: AF(44), h: 74 }); coverFoot(); };
ckBoot();
