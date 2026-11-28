/* CRICKET KAHANI — The Netherlands knock out South Africa (T20 World Cup, Adelaide, 6 November 2022). Vertical 1080x1920. */
const ORA = '#F36C21', ORD = '#b84a0c', SAG = '#0b6b4b', SAY = '#FFC72C', INB = '#1f5fbf', PKG = '#0f6b3a', WB = '#f2f2ee';
const ACK = kitOf(ORA, ORD, { name: 'Ackermann', height: 430, skin: '#e6bd9c', hair: { style: 'short', color: '#5a3b22' } });
const VDM = kitOf(ORA, null, { name: 'van der Merwe', height: 425, build: 'muscular', skin: '#e2b08a', hair: { style: 'short', color: '#8a6a45' }, beard: 'stubble' });
const VDM_SA = kitOf(SAG, null, { name: 'van der Merwe (2009)', height: 425, build: 'muscular', skin: '#e2b08a', hair: { style: 'short', color: '#8a6a45' } });
const GLOVER = kitOf(ORA, ORA, { name: 'Glover', height: 440, build: 'slim', skin: '#e9c4a4', hair: { style: 'short', color: '#3a2a1c' } });
const MATE = kitOf(ORA, ORD, { name: 'Teammate', height: 420, skin: '#c98f62', hair: { style: 'short', color: '#17100b' } });

/* ---------- this episode's own drawing ---------- */
/* a team name on a coloured band */
function band(str, y, k, { bg = ORA, fg = '#fff', size = 104, w = 0, r = 0 } = {}) { if (k <= 0) return; withT(() => { C.font = AF(size); const ww = w || C.measureText(str).width + 110; rr(-ww / 2, -size * 0.72, ww, size * 1.44, 22); fillPath(bg); text(str, 0, 6, { font: AF(size), fill: fg }); }, { x: 540, y, s: k, r }); }
/* one line of the last-day table: team chip on the left, verdict on the right */
function fateRow(k, y, team, tbg, tfg, verdict, vcol, note = '') { card(k, 540, y, 920, 104, () => { C.font = AF(46); const w = C.measureText(team).width + 56; chip(team, -436 + w / 2, 0, { bg: tbg, fg: tfg, font: AF(46), h: 72, padX: 28 });
    text(verdict, 436, note ? -12 : 4, { font: AF(50), fill: vcol, align: 'right' }); if (note) text(note, 436, 30, { font: IF(700, 22), fill: TAN, align: 'right', ls: 1 }); }, { bg: '#0b1410', stroke: '#2a3a33', lw: 6 }); }
/* one step of Pakistan's road: small label, big line, note */
function stepCard(k, x, top, big, sub, col, on) { card(k, x, 900, 332, 190, () => { text(top, 0, -58, { font: IF(800, 22), fill: TAN, ls: 1 }); text(big, 0, 0, { font: AF(50), fill: on ? col : CR }); text(sub, 0, 56, { font: IF(700, 21), fill: CR }); }, { bg: '#0b1410', stroke: on ? col : '#2a3a33', lw: 6 }); }
/* darker top of a day sky, so the header stays readable */
function topShade() { C.fillStyle = grad(0, 0, 0, 330, [[0, 'rgba(5,24,17,0.6)'], [1, 'rgba(5,24,17,0)']]); C.fillRect(0, 0, 1080, 330); }
/* three figure tiles: overs, runs, wickets */
function figures(k, y, vals) { if (k <= 0) return; const L = ['OVER', 'RUN', 'WICKET']; withT(() => { for (let i = 0; i < 3; i++) { const x = (i - 1) * 190; rr(x - 84, -70, 168, 140, 18); fillPath(i === 2 ? AMB : '#16241d', i === 2 ? null : '#2a3a33', 4);
    text(String(vals[i]), x, -8, { font: AF(92), fill: i === 2 ? G : CR }); text(L[i], x, 48, { font: IF(800, 22), fill: i === 2 ? G : TAN, ls: 2 }); } }, { x: 540, y, s: k }); }

const DRAW_FN = {
  /* hook: South Africa out, and by whom */
  s0: t => { const S = TL.shot('s0'), d = S.dur, va = S.vo_at, vo = S.vo, tN = va + 3.62; stripes(t * 120); tint('rgba(4,20,14,0.55)'); FX.speedLines(t, { cx: 540, cy: 760, n: 50, a: 0.14, inner: 480 });
    band('SOUTH AFRICA', 318, pop(t, 0.03, 0.4), { bg: SAG, fg: SAY, size: 112 });
    stamp('WORLD CUP SE BAHAR!', 540, 500, t, 0.38, { col: '#fff', size: 84, r: -0.05, bg: RED }); flash(t, 0.4, 0.2);
    text('T20 WORLD CUP 2022 · ADELAIDE', 540, 628, { font: IF(800, 32), fill: TAN, ls: 3, a: fade(t, 0.8) });
    if (t < tN) { const kq = pop(t, va + 1.1, 0.4); if (kq > 0) withT(() => text('?', 0, 0, { font: AF(330), fill: AMB, shadow: 'rgba(0,0,0,0.35)' }), { x: 540, y: 960, s: kq * (1 + 0.05 * Math.sin(t * 8)) }); chip('BAHAR KISNE KIYA?', 540, 1180, { bg: 'rgba(5,24,17,0.88)', fg: CR, font: AF(46), h: 76, a: fade(t, va + 2.9) }); }
    else { shake(t, tN, 0.4, 16, () => band('NETHERLANDS NE!', 778, ease('elastic', (t - tN) / 0.8), { bg: ORA, size: 116 })); flash(t, tN, 0.25, '243,108,33', 0.6);
      [[250, 0.56, 0], [540, 0.62, 0.4], [830, 0.56, 0.8]].forEach(([x, s, o], i) => drawChar([MATE, ACK, GLOVER][i], MOVES.celebrate(t + o, { yaw: (1 - i) * 0.35 }), x, 1262, s, { t })); FX.confetti(t, { t0: tN, n: 110 }); }
    caption(0, t - 0.5, d - 0.5); },
  /* stadium wide: the day, the ground, what South Africa needed */
  s1: t => { const S = TL.shot('s1'), d = S.dur, va = S.vo_at, vo = S.vo, tK = va + 3.45; wideGround(t, { rows: 5, y0: 730, seed: 31, sky: ['#8fc9ea', '#f3e6c4'] }); topShade(); stumps(t, 1e9, 531, 976, 0.26);
    dateCard('6 NOV 2022', 'ADELAIDE OVAL · T20 WORLD CUP', 'SUPER 12 · GROUP 2 · AAKHRI MATCH', t, { y: 330, t0: 0.15, t1: va + 1.5 });
    vsChips('NETHERLANDS', ORA, 'SOUTH AFRICA', SAG, 640, pop(t, va + 2.2, 0.45), { fb: SAY, mid: G });
    card(pop(t, tK, 0.5), 540, 1076, 800, 184, () => { text('SOUTH AFRICA KE LIYE', 0, -50, { font: IF(800, 30), fill: TAN, ls: 3 }); text('JEET = SEMI-FINAL', 0, 26, { font: AF(92), fill: AMB }); }, { stroke: SAY }); flash(t, tK, 0.2);
    header(); caption(1, t - 0.1, d - 0.1); },
  /* scoreboard: the Netherlands innings */
  s2: t => { const S = TL.shot('s2'), d = S.dur, va = S.vo_at, vo = S.vo, tT = va + 1.0, tA = va + 3.55, tC = va + 5.1; stripes(t * 40); tint('rgba(243,108,33,0.16)');
    board('NETHERLANDS · PEHLE BATTING', [['MYBURGH', '37 (30)', { col: CR, t0: 0.5 }], ["O'DOWD", '29 (31)', { col: CR, t0: 0.75 }], ['COOPER', '35 (19)', { col: CR, t0: 1.0 }], ['ACKERMANN', '41* (26)', { t0: tA, lcol: AMB, vsize: 76 }]], t, 0.12, { y: 236, rowH: 84, tcol: ORA, vsize: 56 });
    flash(t, tA, 0.2); const kT = pop(t, tT, 0.45); shake(t, tT, 0.3, 10, () => bigNum('158/4', 540, 812, kT, { size: 168, label: '20 OVER · SOUTH AFRICA KO TARGET 159', lsize: 30 }));
    const kc = pop(t, tC, 0.4); if (kc > 0) withT(() => chip('AAKHRI 2 OVER MEIN 31 RUN', 0, 0, { bg: AMB, fg: G, font: AF(44), h: 72 }), { x: 540, y: 1000, s: kc });
    const P = 1.3, ph = ((t / P) % 1 + 1) % 1, hit = 0.4, sw = ph > hit - 0.1 ? clamp((ph - hit + 0.1) / 0.14) * clamp((1 - ph) / 0.3) : 0, bp = battingPose(t, sw, 0, -1.0);
    drawChar(ACK, bp, 230, 1270, 0.58, { t }); const [hx, hy] = jointPos(ACK, bp, 230, 1270, 0.58, 'wriR'); bat(hx, hy, 0.25 + sw * 1.7, 0.52);
    if (t > tA && ph >= hit) ballFly(ph, hit, 0.55, [290, 1160], [1120, 1040], { arc: 50, r: 13, col: WB });
    const k6 = pop(t, tC + 0.35, 0.4); if (k6 > 0) withT(() => { for (const dx of [-176, -96]) { circle(dx, 0, 36); fillPath(RED, CR, 4); text('6', dx, 3, { font: AF(48), fill: '#fff' }); } text('AAKHRI OVER', -40, -15, { font: IF(800, 24), fill: TAN, align: 'left', ls: 2 }); text('2 CHHAKKE', -40, 19, { font: AF(40), fill: CR, align: 'left' }); }, { x: 760, y: 1150, s: k6 });
    header(); caption(2, t - 0.1, d - 0.1); },
  /* pitch map: the top edge and the catch running back from short fine leg */
  s3: t => { const S = TL.shot('s3'), d = S.dur, va = S.vo_at, vo = S.vo, tB = va + 3.3, tH = va + 4.15, tC = va + 7.2, cx = 540, cy = 770, out = t >= tC;
    stripes(t * 30); tint('rgba(4,20,14,0.35)');
    shake(t, tC, 0.45, 14, () => { groundTop(cx, cy, 450, 380, { pl: 250, pw: 70 });
      const b0 = [cx + 14, cy - 118], bt = [cx - 4, cy + 84], F0 = [cx + 150, cy + 214], F1 = [cx + 338, cy + 118], kr = ease('inOut', clamp((t - tH - 0.15) / (tC - tH - 0.15))), F = [lerp(F0[0], F1[0], kr), lerp(F0[1], F1[1], kr)];
      [[-170, 150], [-300, 10], [-120, -210], [190, -190], [-250, -150], [60, 300], [300, -60], [-60, 250]].forEach(([dx, dy]) => dot(cx + dx, cy + dy, CR, { r: 11, ring: '#b9ad92' }));
      dot(cx + 2, cy + 176, ORA, { r: 13 }); dot(b0[0], b0[1] - 16, ORA, { r: 15, label: 'GLOVER' }); dot(bt[0], bt[1], SAG, { r: 17, ring: SAY, label: t < tH + 0.4 ? 'MILLER' : '' });
      if (kr > 0) { C.beginPath(); C.moveTo(F0[0], F0[1]); C.lineTo(F[0], F[1]); C.setLineDash([12, 10]); C.strokeStyle = 'rgba(255,255,255,0.75)'; C.lineWidth = 5; C.stroke(); C.setLineDash([]); circle(F0[0], F0[1], 9); fillPath(null, 'rgba(255,255,255,0.75)', 3); }
      dot(F[0], F[1], ORA, { r: 22, ring: AMB });
      C.font = IF(800, 24); const lw = C.measureText('VAN DER MERWE').width + 36; chip('VAN DER MERWE', Math.min(F[0], 1010 - lw / 2), F[1] + 52, { bg: AMB, fg: G, font: IF(800, 24), h: 44, padX: 18 });
      if (kr <= 0) text('SHORT FINE LEG', F0[0] + 6, F0[1] - 44, { font: IF(800, 22), fill: CR, shadow: 'rgba(0,0,0,0.6)', a: fade(t, 0.5) });
      if (t >= tB && t < tH) ballFly(t, tB, tH - tB, b0, [bt[0] + 8, bt[1] - 10], { r: 11, n: 4, col: WB });
      else if (t >= tH && t < tC) { const u = (t - tH) / (tC - tH), bx = lerp(bt[0], F1[0], u), by = lerp(bt[1], F1[1], u) - Math.sin(u * Math.PI) * 90, r = 11 + Math.sin(u * Math.PI) * 15;
        C.globalAlpha = 0.25; C.beginPath(); C.ellipse(lerp(bt[0], F1[0], u), lerp(bt[1], F1[1], u), 12, 7, 0, 0, TAU); C.fillStyle = '#04140e'; C.fill(); C.globalAlpha = 1; ball(bx, by, r, { rot: t * 14, col: WB, seam: '#8a8a80' }); }
      if (out) { const u = t - tC; if (u < 0.5) { circle(F1[0], F1[1], 26 + u * 240); fillPath(null, `rgba(255,183,3,${1 - u / 0.5})`, 9); } FX.sparks(t, { x: F1[0], y: F1[1], t0: tC, n: 26 }); }
      if (kr > 0.35 && !out) chip('LAGBHAG 20 YARD KI DAUD', 800, cy + 40, { bg: 'rgba(5,24,17,0.85)', fg: CR, font: IF(800, 24), h: 44, padX: 18, a: fade(t, tH + 1.0) }); });
    flash(t, tC, 0.25);
    const ks = pop(t, 0.12, 0.45); if (ks > 0) withT(() => chip(out ? 'SOUTH AFRICA 112/5' : 'SOUTH AFRICA 112/4', 0, 0, { bg: out ? RED : INK, fg: out ? '#fff' : AMB, font: AF(60), h: 92, padX: 40 }), { x: 540, y: 268, s: ks * (out ? 1 + 0.25 * clamp(1 - (t - tC) / 0.3) : 1) });
    chip(out ? 'MILLER c VAN DER MERWE b GLOVER 17' : 'CHAHIYE: 47 RUN · 29 GEND', 540, 350, { bg: out ? CR : 'rgba(5,24,17,0.88)', fg: out ? G : CR, font: IF(800, 28), h: 52, a: fade(t, 0.5) });
    stamp('KAMAAL KA CATCH!', 390, 478, t, tC + 0.1, { col: AMB, size: 80, r: -0.05, bg: 'rgba(5,24,17,0.94)' });
    header(); caption(3, t - 0.1, d - 0.1); },
  /* character close-up: van der Merwe now, and in the green shirt years earlier */
  s4: t => { const S = TL.shot('s4'), d = S.dur, va = S.vo_at, vo = S.vo, tP = va + 1.95, tR = va + 5.05, past = t >= tP && t < tR;
    stripes(t * 40, true); tint(past ? 'rgba(11,107,75,0.45)' : 'rgba(243,108,33,0.34)'); FX.glow(540, 1050, 700, past ? '255,199,44' : '255,210,140', 0.2);
    const p = MOVES.idle(t, { seed: 6 }); p.yaw = past ? -0.28 : 0.28; p.face.expr = past ? 'determined' : 'happy'; p.armL.ab = 0.18; p.armR.ab = 0.18;
    drawChar(past ? VDM_SA : VDM, p, 540, 1720, 2.0, { t }); if (past) tint('rgba(120,90,40,0.16)');
    C.fillStyle = '#0a2a20'; C.fillRect(0, 1470, 1080, 450); C.fillStyle = past ? SAY : ORA; C.fillRect(0, 1466, 1080, 6);
    flash(t, tP, 0.3); flash(t, tR, 0.25, '243,108,33', 0.5);
    plate('ROELOF VAN DER MERWE', past ? 'JOHANNESBURG MEIN JANM' : 'NETHERLANDS · 37 SAAL', past ? SAY : ORA, 316, pop(t, 0.15, 0.45));
    if (past) { const k = pop(t, tP + 0.05, 0.45); if (k > 0) withT(() => { rr(-400, -150, 800, 300, 26); fillPath(SAG, SAY, 8); text('PEHLE · SOUTH AFRICA KE LIYE', 0, -92, { font: IF(800, 30), fill: SAY, ls: 3 }); text('2009 · 2010', 0, 2, { font: AF(128), fill: '#fff' }); text('T20 WORLD CUP', 0, 98, { font: AF(52), fill: SAY }); }, { x: 540, y: 610, s: k * 0.92, r: -0.02 }); }
    else if (t < tP) { const k = pop(t, va + 0.1, 0.4); if (k > 0) withT(() => text('?', 0, 0, { font: AF(260), fill: AMB, shadow: 'rgba(0,0,0,0.35)' }), { x: 870, y: 640, s: k * (1 + 0.05 * Math.sin(t * 8)), r: 0.12 }); chip('CATCH LENE WALA KAUN?', 420, 500, { bg: 'rgba(5,24,17,0.88)', fg: CR, font: AF(46), h: 76, a: fade(t, va + 0.15) }); }
    else { const k = pop(t, tR, 0.4); if (k > 0) withT(() => chip('2022 · AB NETHERLANDS KE LIYE', 0, 0, { bg: ORA, font: AF(54), h: 92, padX: 40 }), { x: 540, y: 560, s: k }); }
    header(); caption(4, t - 0.1, d - 0.1); },
  /* side view: Glover's wickets, then the result */
  s5: t => { const S = TL.shot('s5'), d = S.dur, va = S.vo_at, vo = S.vo, tH = va + 1.6, tW = va + 3.55, P = 1.5, rel = 0.42, won = t >= tW;
    sideGround(t, { seed: 44, y0: 668, sky: ['#8fc9ea', '#f3e6c4'] }); topShade(); const hitT = Math.max(tH, P * (0.62 + Math.floor(tH / P))), ph = ((t / P) % 1 + 1) % 1; stumps(t, hitT);
    if (!won) { drawChar(GLOVER, bowlPose(t, clamp(ph / rel)), lerp(40, 250, ease('out', clamp(ph / rel))), 1180, 1.12, { t }); if (t < hitT && ph > rel && ph < 0.62) ballFly(ph, rel, 0.2, [310, 820], [820, 1010], { arc: 60, r: 16, col: WB }); flash(t, hitT, 0.2); }
    else { [[230, 0.72, MATE, 0], [540, 0.84, GLOVER, 0.3], [850, 0.72, VDM, 0.6]].forEach(([x, s, c, o], i) => drawChar(c, MOVES.celebrate(t + o, { yaw: (1 - i) * 0.3 }), x, 1190, s, { t })); FX.confetti(t, { t0: tW, n: 130 }); }
    card(pop(t, 0.12, 0.45), 540, 352, 760, 250, () => { rr(-366, -111, 732, 56, 12); fillPath('#16241d'); text('BRANDON GLOVER · GENDBAAZI', 0, -82, { font: IF(800, 28), fill: ORA, ls: 3 }); }, { bg: '#0b1410', stroke: '#2a3a33', lw: 8 });
    figures(pop(t, va + 0.25, 0.45), 392, [2, 9, 3]);
    chip('SOUTH AFRICA 145/8 · TARGET 159', 540, 528, { bg: 'rgba(5,24,17,0.92)', fg: CR, font: AF(40), h: 66, a: fade(t, hitT + 0.3) });
    if (won) { shake(t, tW, 0.4, 14, () => band('NETHERLANDS 13 RUN SE JEETA!', 640, ease('elastic', (t - tW) / 0.8), { bg: ORA, size: 78 })); flash(t, tW, 0.25, '243,108,33', 0.55); }
    header(); caption(5, t - 0.1, d - 0.1); },
  /* stats graphic: what the result did to the group, and Pakistan's road from there */
  s6: t => { const S = TL.shot('s6'), d = S.dur, va = S.vo_at, vo = S.vo, t1 = va + 0.05, t2 = va + 1.5, t3 = va + 3.8, t4 = va + 5.7, t5 = va + 6.75; stripes(t * 40); tint('rgba(4,20,14,0.4)');
    chip('GROUP 2 · AAKHRI DIN · 6 NOV 2022', 540, 268, { bg: CR, fg: G, font: AF(46), h: 78, a: fade(t, 0.1) });
    fateRow(pop(t, t1, 0.4), 392, 'SOUTH AFRICA', SAG, SAY, 'BAHAR', '#ff6b6b'); fateRow(pop(t, t2, 0.4), 510, 'INDIA', INB, '#fff', 'SEMI-FINAL MEIN', AMB);
    fateRow(pop(t, t3, 0.4), 628, 'PAKISTAN', PKG, '#fff', 'SEMI-FINAL MEIN', AMB, 'USI DIN BANGLADESH KO 5 WICKET SE HARAYA'); flash(t, t1, 0.18, '179,32,42', 0.3); flash(t, t3, 0.2);
    text('PAKISTAN KA AAGE KA SAFAR', 540, 762, { font: IF(800, 30), fill: TAN, ls: 3, a: fade(t, t3 + 0.3) });
    const kl = clamp((t - t3 - 0.3) / (t5 - t3 - 0.3)); if (kl > 0) { C.fillStyle = 'rgba(216,188,133,0.35)'; C.fillRect(190, 896, 700, 8); C.fillStyle = AMB; C.fillRect(190, 896, 700 * ease('inOut', kl), 8); }
    stepCard(pop(t, t3 + 0.3, 0.4), 186, '6 NOV · ADELAIDE', 'BANGLADESH', '5 WICKET SE JEET', AMB, t >= t3 + 0.3); stepCard(pop(t, t4, 0.4), 540, 'SEMI-FINAL · SYDNEY', 'NEW ZEALAND', '7 WICKET SE JEET', AMB, t >= t4);
    stepCard(pop(t, t5, 0.4), 894, '13 NOV · MELBOURNE', 'FINAL', 'ENGLAND JEETA · 5 WICKET', CR, t >= t5); flash(t, t5, 0.2);
    chip('YEH DARWAZA NETHERLANDS KI JEET NE KHOLA', 540, 1068, { bg: ORA, fg: '#fff', font: AF(40), h: 68, a: fade(t, t5 + 0.5) });
    header(); caption(6, t - 0.1, d - 0.1); },
  /* newspaper + the question, then the end card */
  s7: t => lastShot(t, (t, S, tEnd) => { const va = S.vo_at, tq = va + 0.2; stripes(t * 20);
    paper(t, 0.1, { y: 500, mast: 'KAHANI TIMES', date: 'ADELAIDE · 6 NOVEMBER 2022', head: ['NETHERLANDS NE', 'KAR DIKHAYA!'], sub: '158/4 · SOUTH AFRICA 145/8 · 13 RUN SE JEET', hsize: 92, rot: -0.03 });
    chip('INAAM: 2024 T20 WORLD CUP MEIN SEEDHI ENTRY', 540, 800, { bg: AMB, fg: G, font: IF(800, 30), h: 58, a: fade(t, 0.9) });
    text('MATCH KISNE PALTA?', 540, 912, { font: AF(76), fill: CR, a: fade(t, tq), shadow: 'rgba(0,0,0,0.4)' });
    const k1 = pop(t, va + 1.15, 0.4), k2 = pop(t, va + 2.5, 0.4), pu = 1 + 0.03 * Math.sin(t * 9);
    if (k1 > 0) withT(() => chip('ACKERMANN KE CHHAKKE', 0, 0, { bg: ORA, font: AF(50), h: 84, padX: 34 }), { x: 540, y: 1018, s: k1 * pu });
    text('YA', 540, 1092, { font: AF(44), fill: AMB, a: fade(t, va + 2.3) });
    if (k2 > 0) withT(() => chip('VAN DER MERWE KA CATCH', 0, 0, { bg: RED, font: AF(50), h: 84, padX: 34 }), { x: 540, y: 1166, s: k2 * (2 - pu) }); },
    { q: 'MATCH KISNE PALTA?', next: 'BRATHWAITE KE 4 CHHAKKE' }),
};
window.drawCover = () => { coverBase('SOUTH AFRICA OUT!', 'NETHERLANDS NE KIYA', 'T20 WORLD CUP 2022 · ADELAIDE', { s1: 112, s2: 104, band: SAG, c1: SAY, c2: ORA });
  text('13', 540, 1150, { font: AF(620), fill: 'rgba(243,108,33,0.2)' }); FX.glow(540, 1150, 540, '255,210,140', 0.18);
  chip('158/4  vs  145/8 · 13 RUN SE JEET', 540, 668, { bg: 'rgba(5,24,17,0.9)', fg: AMB, font: AF(46), h: 78 });
  [[230, 1535, 1.0, MATE, 0.3, 0.3], [850, 1535, 1.0, GLOVER, 0.9, -0.3]].forEach(([x, y, s, c, o, yw]) => drawChar(c, MOVES.celebrate(o, { yaw: yw }), x, y, s, { t: 0 }));
  drawChar(VDM, MOVES.powerPose(1, { yaw: 0.1, expr: 'happy' }), 540, 1578, 1.42, { t: 0 }); ball(860, 880, 58, { rot: 0.5, col: WB, seam: '#8a8a80' }); ball(200, 980, 38, { rot: 2, col: WB, seam: '#8a8a80' });
  chip('JAB UNDERDOG NE WORLD CUP PALAT DIYA', 540, 1648, { bg: RED, font: AF(42), h: 74 }); coverFoot(); };
ckBoot();
