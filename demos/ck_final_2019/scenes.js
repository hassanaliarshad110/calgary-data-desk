/* CRICKET KAHANI — 2019 World Cup final: tied, tied again, decided by boundaries (Lord's, 14 July 2019). Vertical 1080x1920. */
const ENG = '#3b9ad9', NZ = '#1a1a1f', NZA = '#3fb6a8';
const ENGB = kitOf(ENG, '#1d3f7a', { name: 'England batter', height: 430, build: 'muscular', skin: '#e2b48f', hair: { style: 'short', color: '#a5502a' }, beard: 'stubble' });
const NZB = kitOf(NZ, NZ, { name: 'New Zealand batter', height: 430, skin: '#d9a57f', hair: { style: 'short', color: '#2a1c14' } });
const WB = '#f2f2ee'; // white ball
function need(n, sub, y = 330) { card(1, 540, y, 620, 230, () => { text('ENGLAND KO CHAHIYE', 0, -66, { font: IF(800, 30), fill: TAN, ls: 3 }); text(String(n), -70, 36, { font: AF(150), fill: AMB }); text('RUN', 110, 52, { font: AF(64), fill: CR }); }, { stroke: ENG }); chip(sub, 540, y + 150, { bg: ENG, font: IF(800, 30), h: 56 }); }

const DRAW_FN = {
  s0: t => { const d = TL.shot('s0').dur; stripes(t * 120); tint('rgba(4,20,14,0.55)');
    stamp('MATCH: TIE', 540, 330, t, 0.1, { col: AMB, size: 120, r: -0.06 }); stamp('SUPER OVER: TIE', 540, 560, t, 0.9, { col: CR, size: 100, r: 0.05 }); flash(t, 0.1, 0.2); flash(t, 0.9, 0.2);
    const k = pop(t, 1.7, 0.5); if (k > 0) { FX.glow(540, 900, 300, '255,210,140', 0.35); trophy(540, 960, 1.7 * k); }
    bigNum('?', 760, 860, pop(t, 2.1), { size: 220, col: RED }); chip('PHIR CHAMPION KAUN?', 540, 1180, { bg: CR, fg: G, a: fade(t, 2.4), font: AF(52), h: 86 });
    caption(0, t - 0.5, d - 0.5); },
  s1: t => { const d = TL.shot('s1').dur; wideGround(t, { seed: 9, sky: ['#a8c8dc', '#e8e6d4'] });
    dateCard('14 JULY 2019', "LORD'S · LONDON", 'WORLD CUP FINAL', t, { y: 310 });
    card(pop(t, 2.0, 0.5), 540, 1060, 700, 150, () => { text('NEW ZEALAND', -310, 4, { font: IF(800, 38), fill: CR, align: 'left' }); text('241/8', 310, 6, { font: AF(84), fill: AMB, align: 'right' }); }, { stroke: NZA });
    header(); caption(1, t - 0.1, d - 0.1); },
  s2: t => { const S = TL.shot('s2'), d = S.dur, va = S.vo_at, vo = S.vo, t6 = va + vo * 0.34, tT = va + vo * 0.72; sideGround(t, { seed: 21, sky: ['#a8c8dc', '#e8e6d4'] }); stumps(t);
    const sw = t > t6 - 0.2 && t < t6 + 0.45 ? (t < t6 ? 1 : 1 - (t - t6) / 0.45) : 0; const dive = t > tT - 0.6 ? clamp((t - tT + 0.6) / 0.3) : 0;
    const p = battingPose(t, sw, 0); if (dive) { p.lean = 0.12 + 0.75 * dive; p.armL.sw = p.armR.sw = 1.5; p.armL.el = p.armR.el = 0.1; p.legL.sw = -0.5 * dive; }
    drawChar(ENGB, p, 690 - 40 * dive, 1180, 1.5, { t }); const [hx, hy] = jointPos(ENGB, p, 690 - 40 * dive, 1180, 1.5, 'wriR'); bat(hx, hy, dive ? 1.15 : sw > 0.2 ? -0.05 - 0.5 * (1 - sw) : 0.35, 1.25);
    if (t < t6) ballFly(t, t6 - 0.45, 0.45, [-60, 980], [hx - 40, hy + 140], { arc: 50, col: WB }); else if (t < t6 + 0.8) { ballFly(t, t6, 0.8, [hx - 40, hy + 140], [-140, 330], { arc: 120, col: WB, e: 'out' }); if (t < t6 + 0.25) FX.glow(hx - 40, hy + 140, 150, '255,255,220', 0.8 * (1 - (t - t6) / 0.25)); }
    const B = [hx - 160, hy + 60]; if (t > tT - 0.6 && t < tT) ballFly(t, tT - 0.6, 0.6, [-60, 800], B, { arc: 40, col: WB }); else if (t >= tT && t < tT + 0.9) { ballFly(t, tT, 0.9, B, [1160, 1000], { arc: 30, col: WB, e: 'out' }); if (t < tT + 0.25) FX.glow(B[0], B[1], 130, '255,255,220', 0.8 * (1 - (t - tT) / 0.25)); }
    need(t > tT + 0.5 ? 3 : t > t6 + 0.4 ? 9 : 15, t > tT + 0.5 ? '2 GEND BAAKI' : t > t6 + 0.4 ? '3 GEND BAAKI' : 'AAKHRI OVER');
    if (t < tT - 0.7) stamp('SIX!', 800, 620, t, t6 + 0.1, { col: AMB, size: 110, bg: 'rgba(5,24,17,0.85)' }); if (t > tT) stamp('BALLE SE LAGKAR +6', 540, 575, t, tT + 0.15, { col: CR, size: 74, r: -0.04, bg: 'rgba(179,32,42,0.95)' });
    header(); caption(2, t - 0.1, d - 0.1); },
  s3: t => { const S = TL.shot('s3'), d = S.dur, va = S.vo_at, vo = S.vo, tO = va + vo * 0.22, tB = va + vo * 0.42, tTie = va + vo * 0.8; sideGround(t, { seed: 21, sky: ['#a8c8dc', '#e8e6d4'] }); stumps(t, tO);
    const x = lerp(-80, 620, clamp(t / (tO + 0.25))); const p = MOVES.run(t, { speed: 1.6 }); p.lean = 0.35; drawChar(ENGB, p, x, 1180, 1.45, { t }); bat(x + 150, 1120, 1.3, 1.2);
    if (t < tO) ballFly(t, tO - 0.4, 0.4, [1100, 900], [842, 1000], { col: WB, arc: 30 }); flash(t, tO, 0.25, '179,32,42', 0.35); if (t < tB) stamp('RUN OUT!', 540, 400, t, tO + 0.05, { col: RED, size: 130, bg: 'rgba(244,236,216,0.92)' });
    card(pop(t, tB, 0.5), 540, 400, 800, 250, () => { text('NEW ZEALAND', -350, -56, { font: IF(800, 36), fill: CR, align: 'left' }); text('241', 350, -52, { font: AF(84), fill: AMB, align: 'right' }); C.fillStyle = '#22322b'; C.fillRect(-360, -4, 720, 3);
      text('ENGLAND', -350, 62, { font: IF(800, 36), fill: CR, align: 'left' }); text('241', 350, 66, { font: AF(84), fill: AMB, align: 'right' }); }, { stroke: AMB });
    stamp('TIE!', 250, 800, t, tTie, { col: AMB, size: 150, r: -0.08, bg: 'rgba(5,24,17,0.9)' });
    header(); caption(3, t - 0.1, d - 0.1); },
  s4: t => { const S = TL.shot('s4'), d = S.dur, va = S.vo_at, vo = S.vo, tN = va + vo * 0.6; stripes(t * 80, true); tint('rgba(4,20,14,0.45)');
    const k = pop(t, 0.05, 0.5); if (k > 0) withT(() => { rr(-400, -90, 800, 180, 24); fillPath(RED); text('SUPER OVER', 0, 8, { font: AF(130), fill: '#fff' }); }, { x: 540, y: 330, s: k });
    text('6 GEND · FAISLA', 540, 480, { font: IF(800, 34), fill: TAN, ls: 4, a: fade(t, 0.5) });
    card(pop(t, va + 0.5, 0.5), 540, 700, 760, 230, () => { text('ENGLAND', -330, 0, { font: AF(64), fill: CR, align: 'left' }); text(count(15, (t - va - 0.6) / 1.2), 330, 8, { font: AF(170), fill: AMB, align: 'right' }); }, { stroke: ENG });
    card(pop(t, tN, 0.5), 540, 990, 760, 230, () => { text('NEW ZEALAND', -330, -34, { font: AF(56), fill: CR, align: 'left' }); text('KO CHAHIYE', -330, 40, { font: IF(800, 30), fill: TAN, align: 'left', ls: 2 }); text('16', 330, 8, { font: AF(170), fill: '#fff', align: 'right' }); }, { stroke: NZA });
    header(); caption(4, t - 0.1, d - 0.1); },
  s5: t => { const S = TL.shot('s5'), d = S.dur, va = S.vo_at, vo = S.vo, tH = va + vo * 0.2, tR = va + vo * 0.62; stripes(0); groundTop(540, 800, 480, 500);
    const F = [150, 640], ST = [540, 932]; const u = t - tH; // one run = 0.95 s
    const leg = u < 0 ? 0 : Math.min(u / 0.95, 1), leg2 = u < 0.95 ? 0 : Math.min((u - 0.95) / 0.95, t > tR ? (tR - tH - 0.95) / 0.95 : 1);
    const ya = lerp(920, 690, leg), yb = lerp(690, 920, leg); const y1 = leg >= 1 ? lerp(690, 920, leg2) : ya, y2 = leg >= 1 ? lerp(920, 690, leg2) : yb;
    dot(F[0], F[1], ENG, { label: 'FIELDER' }); dot(540, 962, ENG, { r: 16 }); dot(506, y2, NZA, { r: 17 }); dot(574, y1, NZA, { label: t < tR + 1 ? 'GUPTILL' : '', r: 20 });
    if (u < 0) ballFly(t, tH - 0.35, 0.35, [540, 660], [560, 900], { r: 12, col: WB }); else if (u < 0.8) ballFly(t, tH, 0.8, [560, 900], F, { r: 12, col: WB, e: 'out', arc: 30 }); else if (t < tR) ballFly(t, tH + 0.9, tR - tH - 0.9, F, ST, { r: 12, col: WB, arc: 40 });
    if (t > tR) { FX.glow(ST[0], ST[1], 110, '255,80,80', 0.7 * clamp(1 - (t - tR) / 0.6)); flash(t, tR, 0.25, '179,32,42', 0.35); }
    card(1, 540, 320, 700, 150, () => { text('AAKHRI GEND', -310, 2, { font: AF(60), fill: CR, align: 'left' }); text(t > tR ? '1 RUN HI BANA' : '2 RUN CHAHIYE', 310, 4, { font: IF(800, 36), fill: AMB, align: 'right' }); }, { stroke: NZA });
    if (u > 0 && t < tR) chip(leg < 1 ? 'PEHLA RUN…' : 'DOOSRA RUN…', 800, 520, { bg: INK, fg: AMB, font: IF(800, 30), h: 58 });
    stamp('RUN OUT!', 540, 560, t, tR + 0.05, { col: RED, size: 130, bg: 'rgba(244,236,216,0.95)' });
    const k = pop(t, tR + 0.8, 0.5); if (k > 0) withT(() => { rr(-250, -80, 500, 160, 24); fillPath(INK, AMB, 6); text('15 – 15', 0, 8, { font: AF(120), fill: AMB }); }, { x: 540, y: 1150, s: k });
    header(); caption(5, t - 0.1, d - 0.1); },
  s6: t => { const S = TL.shot('s6'), d = S.dur, va = S.vo_at, vo = S.vo; stripes(t * 30);
    text('BOUNDARY COUNT', 540, 290, { font: AF(100), fill: CR }); text('Chauke + chhakke · poora match + Super Over', 540, 362, { font: IF(700, 30), fill: TAN });
    hbar('ENGLAND', 26, 26, 450, (t - va - vo * 0.45) / 1.0, { col: ENG, fg: '#fff', h: 110 }); hbar('NEW ZEALAND', 17, 26, 600, (t - va - vo * 0.7) / 1.0, { col: '#2b2b33', fg: '#fff', h: 110 });
    const k = pop(t, va + vo * 0.82, 0.5); if (k > 0) { FX.glow(300, 960, 260, '255,210,140', 0.3); trophy(300, 1010, 1.2 * k); }
    chip('ENGLAND', 640, 900, { bg: ENG, font: AF(60), h: 96, a: fade(t, va + vo * 0.82) }); chip('PEHLI BAAR WORLD CHAMPION', 700, 1010, { bg: CR, fg: G, font: IF(800, 30), h: 60, a: fade(t, va + vo * 0.9) });
    chip('TAB KA RULE', 540, 780, { bg: RED, font: IF(800, 30), h: 56, a: fade(t, 0.2) });
    header(); caption(6, t - 0.1, d - 0.1); },
  s7: t => lastShot(t, (t, S) => { stripes(t * 20); const va = S.vo_at, tq = va + S.vo * 0.4;
    paper(t, 0.1, { y: 560, rot: -0.03, mast: 'ICC · OCTOBER 2019', head: ['BOUNDARY COUNT', 'RULE'], hsize: 100, sub: 'AB: SUPER OVER DOBARA, JAB TAK FAISLA NA HO' });
    stamp('KHATAM', 700, 520, t, va + 1.2, { col: RED, size: 120, r: -0.2, bg: 'rgba(239,230,207,0.75)' });
    const k = pop(t, tq, 0.5); if (k > 0) { trophy(540, 1090, 1.15 * k); C.strokeStyle = CR; C.setLineDash([14, 12]); C.lineWidth = 6; C.beginPath(); C.moveTo(540, 930); C.lineTo(540, 1200); C.stroke(); C.setLineDash([]); chip('ENG', 360, 1060, { bg: ENG, font: AF(44), h: 72 }); chip('NZ', 720, 1060, { bg: '#2b2b33', font: AF(44), h: 72 }); } },
    { q: 'TROPHY BAANTNI CHAHIYE THI?', next: 'IRELAND KA SABSE BADA CHASE' }),
};
window.drawCover = () => { coverBase('FINAL TIE!', 'SUPER OVER BHI TIE!', "2019 WORLD CUP FINAL · LORD'S", { s1: 130, s2: 104 });
  C.fillStyle = 'rgba(59,154,217,0.35)'; C.fillRect(0, 640, 540, 1000); C.fillStyle = 'rgba(20,20,26,0.5)'; C.fillRect(540, 640, 540, 1000);
  const pa = MOVES.idle(0, { seed: 1 }); pa.yaw = 0.45; const pb = MOVES.idle(0, { seed: 4 }); pb.yaw = -0.45; drawChar(ENGB, pa, 250, 1520, 1.6, { t: 0 }); drawChar(NZB, pb, 830, 1520, 1.6, { t: 0 });
  FX.glow(540, 1080, 300, '255,210,140', 0.4); trophy(540, 1180, 1.9); text('241', 250, 760, { font: AF(130), fill: '#fff' }); text('241', 830, 760, { font: AF(130), fill: '#fff' });
  chip('15 – 15', 540, 1420, { bg: RED, font: AF(70), h: 110, padX: 40 }); chip('PHIR CHAMPION KAISE BANA?', 540, 1620, { bg: CR, fg: G, font: AF(48), h: 84 }); coverFoot(); };
ckBoot();
