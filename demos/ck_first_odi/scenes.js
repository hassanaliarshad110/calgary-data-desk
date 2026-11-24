/* CRICKET KAHANI — Rain washed out a Test, and ODI cricket was born (MCG, 5 January 1971). Vertical 1080x1920. */
const ENGCAP = '#1b2a5b', AUSCAP = '#1f6b3a', RAINSKY = ['#6f8494', '#b9c2c4'], SUNSKY = ['#9cc9e8', '#f0e6c8'];
const EDRICH = kitOf(WHITE, ENGCAP, { name: 'Edrich', height: 420, skin: '#e6ba96', hair: { style: 'short', color: '#3a2a1c' }, top: { type: 'shirt', color: WHITE, sleeve: 'long' } });
const CHAPPELL = kitOf(WHITE, AUSCAP, { name: 'Chappell', height: 430, skin: '#e2b48f', hair: { style: 'side', color: '#4a3220' }, beard: 'mustache' });
const MATE = kitOf(WHITE, AUSCAP, { name: 'Player', height: 425, skin: '#e9c3a2', hair: { style: 'short', color: '#6b4a2a' } });
const DON = person({ name: 'Bradman', height: 400, age: 'adult', build: 'slim', skin: '#e9c3a2', hair: { style: 'balding', color: '#c9c9c9' }, glasses: '#2a2a2a', top: { type: 'shirt', color: '#39414f', sleeve: 'long' }, bottom: { type: 'pants', color: '#2b313c' }, shoes: '#1c1c1c' });
function covers() { C.fillStyle = '#4d6b3f'; C.fillRect(0, 1000, 1080, 920); poly([[300, 1040], [780, 1040], [900, 1300], [180, 1300]]); fillPath('#7c97a8', '#4f6675', 6); for (let i = 0; i < 4; i++) { C.fillStyle = 'rgba(190,215,235,0.5)'; C.beginPath(); C.ellipse(160 + i * 260, 1380 + (i % 2) * 60, 90, 16, 0, 0, TAU); C.fill(); } }
function mic(x, y) { C.fillStyle = '#333'; C.fillRect(x - 5, y, 10, 330); circle(x, y - 14, 28); fillPath('#666', '#222', 5); }
function medal(x, y, s) { withT(() => { poly([[-34, -90], [-8, -90], [10, -30], [-14, -30]]); fillPath(RED); poly([[34, -90], [8, -90], [-10, -30], [14, -30]]); fillPath('#1d4f9a'); circle(0, 10, 46); fillPath(AMB, '#9a6a00', 6); text('1', 0, 14, { font: AF(52), fill: G }); }, { x, y, s }); }

const DRAW_FN = {
  s0: t => { const d = TL.shot('s0').dur, tD = d * 0.52; if (t < tD) { daySky(...RAINSKY); dayCrowd(830, 4, t, 3, 0.25, ['#5a6670', '#6d7a84', '#4c5a66']); covers(); FX.rain(t, { a: 0.6 });
      text('TEST MATCH', 540, 330, { font: AF(140), fill: CR, a: fade(t, 0.05), shadow: 'rgba(0,0,0,0.4)' }); stamp('BARISH MEIN DHUL GAYA', 540, 560, t, 0.6, { col: '#fff', size: 78, r: -0.05, bg: 'rgba(179,32,42,0.95)' }); }
    else { const u = t - tD; daySky(...SUNSKY); FX.glow(540, 520, 760, '255,230,150', 0.45); dayCrowd(900, 5, t, 2); C.fillStyle = GRASS; C.fillRect(0, 1110, 1080, 810); flash(t, tD, 0.3);
      text('AUR PAIDA HUA', 540, 380, { font: AF(96), fill: G, a: fade(u, 0.05) }); const k = pop(u, 0.2, 0.5); if (k > 0) withT(() => { rr(-450, -190, 900, 380, 28); fillPath(RED); text('ODI', 0, -50, { font: AF(190), fill: '#fff' }); text('CRICKET', 0, 112, { font: AF(96), fill: AMB }); }, { x: 540, y: 680, s: k }); ball(880, 420, 46, { rot: t * 4 }); }
    caption(0, t - 0.5, d - 0.5); },
  s1: t => { const S = TL.shot('s1'), d = S.dur, tA = S.vo_at + S.vo * 0.72; wideGround(t, { rows: 7, y0: 660, seed: 33, sky: RAINSKY, fill: 0.2 }); tint('rgba(60,80,100,0.25)'); FX.rain(t, { a: 0.5 });
    dateCard('JANUARY 1971', 'MELBOURNE · MCG', 'AUSTRALIA vs ENGLAND · 3rd TEST', t, { y: 310 });
    stamp('RADD', 540, 1050, t, tA, { col: RED, size: 190, r: -0.1, bg: 'rgba(244,236,216,0.92)' }); PROPS.umbrella(180, 1320, 0.9, RED); PROPS.umbrella(900, 1330, 0.8, '#1d4f9a');
    header(); caption(1, t - 0.1, d - 0.1); },
  s2: t => { const S = TL.shot('s2'), d = S.dur, va = S.vo_at, vo = S.vo, t8 = va + vo * 0.62; stripes(t * 30); tint('rgba(4,20,14,0.25)');
    paper(t, 0.1, { y: 560, rot: -0.03, mast: 'NOTICE', date: 'DARSHAKON KE LIYE', head: ['EK DIN KA MATCH'], hsize: 110, sub: '40 OVER  +  40 OVER' });
    const k = pop(t, 0.9, 0.4); if (k > 0) withT(() => { circle(0, 0, 64); fillPath(AMB, G, 8); text('!', 0, 6, { font: AF(90), fill: G }); }, { x: 940, y: 330, s: k });
    if (t > t8) { C.globalAlpha = fade(t, t8); for (let i = 0; i < 8; i++) if (t > t8 + i * 0.1) ball(540 + (i - 3.5) * 110, 1010, 42, { rot: i }); C.globalAlpha = 1; chip('TAB HAR OVER MEIN 8 GEND', 540, 1120, { bg: INK, fg: AMB, font: IF(800, 32), h: 62, a: fade(t, t8 + 0.5) }); }
    header(); caption(2, t - 0.1, d - 0.1); },
  s3: t => { const S = TL.shot('s3'), d = S.dur, va = S.vo_at, vo = S.vo, t1 = va + vo * 0.25, t2 = va + vo * 0.68; daySky(...SUNSKY);
    const kf = clamp((t - t2) / 1.2); dayCrowd(1010, 7, t, 6, 0.3 + 0.7 * kf); C.fillStyle = GRASS; C.fillRect(0, 1300, 1080, 620);
    chip('5 JANUARY 1971 · MELBOURNE', 540, 290, { bg: CR, fg: G, font: AF(50), h: 84 });
    const k1 = ease('out', clamp((t - t1) / 0.8)), k2 = ease('out', clamp((t - t2) / 1.2)), B = 940, U = 430 / 46006;
    if (t > t1) { rr(170, B - 20000 * U * k1, 260, 20000 * U * k1 + 4, 14); fillPath(TAN); text(count(20000, (t - t1) / 0.8), 300, B - 20000 * U * k1 - 50, { font: AF(84), fill: G }); text('UMMEED', 300, B - 30, { font: IF(800, 30), fill: G }); }
    if (t > t2) { rr(650, B - 46006 * U * k2, 260, 46006 * U * k2 + 4, 14); fillPath(RED); text(count(46006, (t - t2) / 1.2), 780, B - 46006 * U * k2 - 56, { font: AF(104), fill: RED }); text('AAYE!', 780, B - 30, { font: IF(800, 30), fill: '#fff' }); }
    header(); caption(3, t - 0.1, d - 0.1); },
  s4: t => { const S = TL.shot('s4'), d = S.dur, va = S.vo_at, vo = S.vo, tE = va + vo * 0.42, tM = va + vo * 0.68; sideGround(t, { seed: 6, sky: SUNSKY }); stumps(t);
    const per = 1.1, ph = (t % per) / per, hit = 0.45; const sw = ph > hit - 0.22 && ph < hit + 0.4 ? (ph < hit ? 1 : 1 - (ph - hit) / 0.4) : 0;
    const p = battingPose(t, sw, 0); drawChar(EDRICH, p, 690, 1180, 1.3, { t }); const [hx, hy] = jointPos(EDRICH, p, 690, 1180, 1.3, 'wriR'); bat(hx, hy, sw > 0.2 ? -0.05 - 0.5 * (1 - sw) : 0.35, 1.1);
    const H = [hx - 40, hy + 140]; if (ph < hit) ballFly(ph, 0, hit, [-60, 980], H, { arc: 40 }); else ballFly(ph, hit, 0.5, H, [-140, 960], { arc: 20, e: 'out' });
    card(pop(t, 0.2, 0.5), 540, 320, 820, 170, () => { text('ENGLAND', -370, -6, { font: IF(800, 40), fill: CR, align: 'left' }); text('39.4 OVER', -370, 44, { font: IF(700, 26), fill: TAN, align: 'left', ls: 2 }); text('190', 210, 6, { font: AF(110), fill: AMB, align: 'right' }); text('ALL OUT', 370, 10, { font: AF(44), fill: '#ff6b6b', align: 'right' }); }, { stroke: ENGCAP });
    plate('JOHN EDRICH · 82', 'ENGLAND · SABSE ZYADA RUN', ENGCAP, 482, pop(t, tE, 0.4));
    const km = pop(t, tM, 0.45); if (km > 0) { medal(170, 610, 1.0 * km); chip('ODI KE PEHLE MAN OF THE MATCH', 590, 600, { bg: AMB, fg: G, font: IF(800, 30), h: 60 }); }
    header(); caption(4, t - 0.1, d - 0.1); },
  s5: t => { const S = TL.shot('s5'), d = S.dur, va = S.vo_at, vo = S.vo, tC = va + vo * 0.55; stripes(t * 30); tint('rgba(31,107,58,0.2)');
    text('AUSTRALIA KA CHASE', 540, 290, { font: AF(84), fill: CR }); const X0 = 130, X1 = 950, Y0 = 880, Y1 = 470; rr(X0 - 30, Y1 - 50, X1 - X0 + 60, Y0 - Y1 + 90, 20); fillPath('rgba(5,24,17,0.8)');
    C.setLineDash([16, 12]); C.strokeStyle = RED; C.lineWidth = 5; C.beginPath(); C.moveTo(X0, Y1 + 6); C.lineTo(X1, Y1 + 6); C.stroke(); C.setLineDash([]); text('TARGET 191', X1 - 6, Y1 - 22, { font: IF(800, 26), fill: '#ff8a8a', align: 'right' });
    const k = ease('inOut', clamp((t - 0.3) / (va + vo * 0.35))); C.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40 * k, x = lerp(X0, X1, u), y = lerp(Y0, Y1 + 6, Math.pow(u, 0.85) + 0.03 * Math.sin(u * 14)); i ? C.lineTo(x, y) : C.moveTo(x, y); } C.strokeStyle = AMB; C.lineWidth = 10; C.lineJoin = 'round'; C.stroke();
    if (k >= 1) { circle(X1, Y1 + 6, 18); fillPath(AMB, '#fff', 5); }
    card(pop(t, va + vo * 0.1, 0.5), 540, 1030, 860, 170, () => { text('AUSTRALIA 191/5', -390, -18, { font: AF(72), fill: AMB, align: 'left' }); text('5 WICKET SE JEET', -390, 46, { font: IF(800, 30), fill: CR, align: 'left', ls: 2 }); }, { stroke: AUSCAP });
    chip('IAN CHAPPELL: 60', 770, 1160, { bg: AUSCAP, font: AF(46), h: 78, a: fade(t, tC) });
    header(); caption(5, t - 0.1, d - 0.1); },
  s6: t => { const S = TL.shot('s6'), d = S.dur, va = S.vo_at, vo = S.vo, tB = va + vo * 0.36, tQ = va + vo * 0.62; daySky(...SUNSKY); dayCrowd(700, 6, t, 9); C.fillStyle = GRASS; C.fillRect(0, 950, 1080, 970);
    if (t < tB) { const a = MOVES.shrug(t % 1.8, {}), b = MOVES.talk(t, { yaw: -0.5, seed: 4 }); a.yaw = 0.4; drawChar(MATE, a, 330, 1290, 1.4, { t }); drawChar(CHAPPELL, b, 760, 1290, 1.4, { t });
      bubble('', 540, 420, pop(t, 0.3, 0.4), { size: 76, tailX: -180, tailY: 230, lines: ['YEH TO BAS', 'MAZAAK HAI?'], bg: '#e9e4d6', fg: G }); }
    else { const u = t - tB; const p = MOVES.talk(t, { yaw: 0.25, seed: 7, intensity: 0.7 }); drawChar(DON, p, 420, 1290, 1.55, { t }); mic(600, 960);
      plate('DON BRADMAN', 'BHEED SE', '#39414f', 300, pop(u, 0.1, 0.4)); bubble('', 620, 560, pop(t, tQ, 0.4), { size: 72, tailX: -150, tailY: 210, lines: ['AAPNE HISTORY', 'BANTE DEKHI HAI!'] }); }
    header(); caption(6, t - 0.1, d - 0.1); },
  s7: t => lastShot(t, (t, S) => { stripes(t * 20); const va = S.vo_at, tq = va + S.vo * 0.3;
    const k = pop(t, 0.1, 0.5); if (k > 0) withT(() => { rr(-400, -150, 800, 300, 24); fillPath(CR, G, 8); C.setLineDash([12, 12]); C.strokeStyle = G; C.lineWidth = 4; C.beginPath(); C.moveTo(150, -150); C.lineTo(150, 150); C.stroke(); C.setLineDash([]);
      text('ODI', -130, -62, { font: AF(110), fill: G }); text('NUMBER 1', -130, 54, { font: AF(96), fill: RED }); withT(() => text('5 JAN 1971', 0, 0, { font: IF(800, 30), fill: G, ls: 3 }), { x: 272, y: 0, r: -Math.PI / 2 }); }, { x: 540, y: 470, s: k, r: -0.03 });
    [['TEST', WHITE, G, 250], ['ODI', RED, '#fff', 540], ['T20', AMB, G, 830]].forEach(([l, bg, fg, x], i) => { const kk = pop(t, tq + i * 0.35, 0.45); if (kk > 0) withT(() => chip(l, 0, 0, { bg, fg, font: AF(84), h: 140, padX: 44 }), { x, y: 900, s: kk }); });
    bigNum('?', 540, 1110, pop(t, tq + 1.2), { size: 170 }); }, { q: 'TEST, ODI YA T20?', next: 'EK TEST MEIN 19 WICKET' }),
};
window.drawCover = () => { coverBase('BARISH NE', 'ODI PAIDA KIYA!', '5 JAN 1971 · MELBOURNE · PEHLA ODI', { s1: 130, s2: 124 }); tint('rgba(60,80,100,0.3)');
  C.fillStyle = GRASS; C.fillRect(0, 1240, 1080, 440); C.fillStyle = PITCH; C.fillRect(0, 1500, 1080, 110); FX.rain(0.3, { a: 0.5, n: 220 });
  const p = battingPose(0, 1, 0); drawChar(EDRICH, p, 640, 1500, 1.65, { t: 0 }); const [hx, hy] = jointPos(EDRICH, p, 640, 1500, 1.65, 'wriR'); bat(hx, hy, -0.05, 1.4); ball(250, 1250, 56, { rot: 0.5 }); PROPS.umbrella(200, 1600, 1.1, RED);
  chip('TEST DHULA · ODI JANMA', 540, 700, { bg: RED, font: AF(50), h: 86 }); coverFoot(); };
ckBoot();
