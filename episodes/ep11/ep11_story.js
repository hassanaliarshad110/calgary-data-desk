// ======================= EPISODE 11 — "Train Ka Safar" (scenes) =======================
const BBX = -170, MX = 30, QX0 = 230, SKX = 470;           // the family on platform 1 (Baba, Mama, Qasim, Sakina)
const GLX = 600, GLY = PL.lip + 28, GS = 1.0;                 // Golu on the lip of platform 1
const DHX = 1130, LTX = 1310;                              // Dharmender (Latifa's suitcase on his head) + Latifa
const TS1 = 1.05, TS2 = .9;                                // train scales on track 1 / track 2 (layer coords)
const GTX = 520, GTY = T1.far + 46;                        // where Golu lands between the rails of track 1 (d=1.2 coords)
function camKS(t, K) {
  let c = camS(...K[0][1]);
  for (let i = 1; i < K.length; i++) { const [t0, a0, dur = .8] = K[i]; c = lerpCam(c, camS(...a0), ease(seg(t, t0, t0 + dur))); }
  return c;
}
const QS = (cam, x, o, sh = { w: 110 }, dy = 0) => P1(cam, x, susu, Object.assign({ s: SQ, t: 0, blink: 0 }, o), sh, dy);
const pariWX = a => pariTrainX(a) - 1140 * TS2 - (PCAR - 1) * 1100 * TS2 - 550 * TS2;   // Pari's window centre x (track-2 coords)
function pariTrainX(a) { return 3990 + 30 * a + 1.6 * a * a; }
const PWY = T2.rail - 495 * TS2;                                                          // window centre y (track-2 coords)
function train2(t, a, o = {}) { return trainSvg(pariTrainX(a), T2.rail, TS2, pariCars(t, pariWin(t, o)), t); }
function goluAt(cam, x, y, o = {}, d = 1, sh = { w: 70 }) { return at(d, cam, x, y, golu, Object.assign({ s: GS, t: 0 }, o), sh); }
function goodsCars() { const c = [{ k: 'loco', col: '#8a2a2a', stripe: '#ffd34a' }]; for (let i = 0; i < 9; i++) c.push({ k: 'wagon', col: ['#8a4a2a', '#6b5a48', '#7a3b2a'][i % 3], label: ['MAAL', 'KOYLA', 'ANAAJ'][i % 3] }); return c; }
function blueCars(t) { const c = [{ k: 'loco', col: '#2f6fd1', stripe: '#ffd34a' }]; for (let i = 0; i < 7; i++) c.push({ k: 'coach', col: '#2f6fd1', stripe: '#fff', doorCol: '#1f4f9a', seed: i + 2, t, faces: true, label: i === 2 ? 'B2' : '' }); return c; }
const hookFrame0 = (l1, l2, t, out = 2.4) => { const hk = t < out + .2 ? (t < .12 ? .85 + t : back(seg(t, -.1, .2))) * (1 - seg(t, out - .1, out + .2)) : 0; return hk > 0 ? `<g transform="translate(540,${WIDE ? 280 : 260}) scale(${(hk * (WIDE ? 1.4 : 1)).toFixed(3)}) rotate(-3)">${T(0, 0, 130, l1, { shadow: '#000', sw: 13 })}${T(0, 140, 150, l2, { fill: C.gold, shadow: C.red, sw: 14 })}</g>` : ''; };
const barkFx = (x, y, s, t, a, txt = 'BHAU!') => { const k = ((t - a) % .7) / .7; return t > a ? `<g transform="translate(${x + 40 * s},${y - 60 * s * k}) scale(${(s * back(clamp(k * 4))).toFixed(3)})" opacity="${(1 - seg(k, .6, 1)).toFixed(2)}">${burst(0, 0, 62, '#fff', txt, 28, 8, 1)}</g>` : ''; };
// inset: Golu shivering at the platform edge (or on the track)
function goluInset(t, k, cx = 830, cy = 600, r = 170, id = 'insG', onTrack = 0) {
  if (k <= 0) return '';
  const ic = onTrack ? { x: 1.2 * (GTX + 40 - cx), y: 1.2 * (GTY - 60 - cy), z: 1.35, px: cx, py: cy } : camS(GLX + 60, 1.35, cy + 40, cx, GLY);
  const sub = station(t, ic, { train2: train2(t, ABS), motes: false, noFG: 1, inner1: onTrack ? goluSvgT(t, { shiver: 1, ears: 'flat', tears: 1 }) : '' });
  return inset(cx, cy, r * back(k), sub.back + (onTrack ? '' : goluAt(ic, GLX, GLY, { t, shiver: 1, ears: 'flat', tears: 1, look: [6, -4] })), id);
}
const goluSvgT = (t, o = {}) => golu(Object.assign({ x: GTX, y: GTY, s: GS * 1.0, t }, o));   // drawn inside the track-1 layer

// ============ 1 COLD OPEN (0 s) — Pari's green train is already pulling out; GOLU the puppy is alone on the platform edge, barking after it;
//   Pari cries at the window. Sakina (family on the left): "Arre! Pilla platform par akela reh gaya!"; Pari: "Golu! Mera Golu neeche reh gaya!" ============
function E_cold(t) {
  const D = sdur('cold'), p1s = LS('p1'), a = t;
  const cam = camKS(t, [[0, [GLX + 80, 1.42, 1240, 560]], [.9, [GLX - 160, .92, 1170, 540], 1.2], [p1s - .5, [GLX + 120, 1.18, 1280, 520], .9]]);
  const pw = pariWin(t, { move: 'cry', expr: 'cry', amp: amp('PARI') });
  const S = station(t, cam, { train2: trainSvg(pariTrainX(a), T2.rail, TS2, pariCars(t, pw), t) });
  let g = S.back;
  // the family on the left: Baba + Mama + Qasim watch, Sakina points
  g += P1(cam, BBX, babaK, { s: SKR, t, move: 'scared', mt: t, yaw: .5, expr: 'surprised' }, { w: 110 });
  g += P1(cam, MX, ammi, { s: SAM, t, phone: 0, look: [14, -2], brow: .8, blink: blink(t, 2.7) }, { w: 140 });
  g += QS(cam, QX0, { t, look: [14, -4], mouth: 'o', brow: 1, armL: 20, armR: 20, blink: blink(t) });
  g += P1(cam, SKX, sakina, { s: SKR, t, move: on('c1', t, .3, .3) ? 'point' : 'scared', mt: t, yaw: .5, expr: 'scared', amp: amp('SAKINA') }, { w: 100 });
  // Golu runs a few steps after the train along the lip, then stops at the very edge, barking
  const run = seg(t, 0, 1.6), gx = GLX - 60 + 90 * eout(run);
  g += goluAt(cam, gx, GLY, { t, run: run < 1 ? 1 : 0, bark: t % .7 < .3 ? 1 : 0, ears: 'up', look: [4, -6], tears: t > 2 ? 1 : 0, shiver: t > 2.2 ? .6 : 0 });
  { const p = proj(1, cam, gx + 60, GLY - 120); g += barkFx(p.x, p.y, p.s * 1.1, t, .05, 'BHAU!') + barkFx(p.x - 20, p.y - 30, p.s * 1.1, t + .35, .4, 'BHAU!'); }
  // speed lines on the moving train
  { const p = proj(T2.d, cam, pariWX(a) + 300, PWY + 200); g += speed(p.x - 200, p.y, 1, .5, 4); }
  g += S.front;
  { const p = proj(T2.d, cam, pariWX(a), PWY - 120); g += burst(p.x, p.y - 30, 70 * clamp(p.s * 1.4, .7, 1.4), '#fff', 'GOLU!', 30, -6, seg(t, .15, .35) * (1 - seg(t, 2.6, 2.9)) + (on('p1', t) ? 1 : 0) * seg(t, p1s, p1s + .2)); }
  g += hookFrame0('PILLA', 'AKELA!', t);
  if (t > 2.7 && t < p1s - .1) { const p = proj(1, cam, gx, GLY - 60); g += marker(p.x, p.y, 120 * p.s * 1.2, t, C.red, 'KINAARE PAR!'); }
  g = shake(g, t < .25 ? .9 * (1 - t / .25) : .12, t);
  return g + capFor('cold', t);
}

// ============ 2 WHY — Dharmender (Latifa's suitcase on his head): "Ye to Pari ka pilla hai! Khidki se kood gaya!"; Latifa: "Aur train chal padi!";
//   Baba pulls everyone behind the yellow line: "Sab peeli line ke peeche! Kinaare se door!"; Qasim: "Golu akela hai… aur Pari bhi ro rahi hai!" ============
function E_why(t) {
  const D = sdur('why'), d1 = on('d1', t, .1, .3), l1 = on('l1', t), b1 = on('b1', t, .1, .3), q1 = on('q1', t), a = ABS;
  const cam = camKS(t, [[0, [DHX - 80, 1.05, 1180]], [LS('l1') - .3, [LTX - 160, 1.12, 1190], .7], [LS('b1') - .4, [BBX + 260, .98, 1170], .8], [LS('q1') - .3, [QX0 + 60, 1.4, 1240], .7]]);
  const S = station(t, cam, { train2: train2(t, a) });
  let g = S.back;
  const back2 = ease(seg(t, LS('b1') + .2, LS('b1') + 1.2));   // everyone steps back from the edge
  g += P1(cam, BBX, babaK, { s: SKR, t, move: b1 ? 'shout' : 'scared', mt: t, yaw: b1 ? .3 : .5, expr: b1 ? 'determined' : 'scared', amp: amp('BABA') }, { w: 110 }, 0);
  g += P1(cam, MX, ammi, { s: SAM, t, phone: 0, look: [12, 0], brow: .6, amp: amp('MAMA'), blink: blink(t, 2.7) }, { w: 140 }, 20 * back2);
  g += P1(cam, SKX, sakina, { s: SKR, t, move: 'scared', mt: t, yaw: .5, expr: 'scared' }, { w: 100 }, 30 * back2);
  g += QS(cam, QX0, { t, look: q1 ? [14, -4] : [12, -2], mouth: q1 ? 'talk' : 'o', amp: amp('QASIM'), brow: 1, armL: q1 ? 60 : 20, armR: q1 ? 120 : 20, blink: blink(t) }, { w: 110 }, 30 * back2);
  // Golu at the edge (shivering), Dharmender + Latifa
  g += goluAt(cam, GLX + 30, GLY, { t, shiver: 1, ears: 'flat', tears: 1, look: [6, -6], bark: (t % 2.1) < .25 ? 1 : 0 });
  g += P1(cam, DHX, dharmK, { s: SKR, t, move: d1 ? 'point' : 'scared', mt: t, yaw: -.5, expr: d1 ? 'surprised' : 'scared', amp: amp('DHARMENDER') }, { w: 110 });
  { const p = proj(1, cam, DHX + 10, PL.feet - 500 * SKR - 8 * Math.sin(t * 5)); g += suitcase(p.x, p.y, .55 * p.s, '#8e44ad', 4 * Math.sin(t * 4)); }
  g += P1(cam, LTX, latifaK, { s: SKR, t, move: l1 ? 'talk' : 'holdHead', mt: t, yaw: -.5, expr: l1 ? 'sad' : 'scared', amp: amp('LATIFA') }, { w: 100 });
  g += S.front;
  if (d1) g += hookBig('KHIDKI SE', 'KOOD GAYA!', t, LS('d1') + .5, LS('d1') + .8, 270);
  if (l1) g += hook2('TRAIN CHAL PADI!', t, LS('l1') + .2, 300, 96, '#fff');
  if (b1) { const p = proj(1, cam, BBX + 420, PL.yl + 8); g += `<rect x="${p.x - 420 * p.s}" y="${p.y - 14}" width="${840 * p.s}" height="28" rx="14" fill="#ffd34a" opacity="${(.5 + .4 * Math.sin(t * 10)).toFixed(2)}" style="mix-blend-mode:screen"/>` + hookBig('PEELI LINE', 'KE PEECHE!', t, LS('b1') + .4, LS('b1') + .7, 270); }
  if (q1) g += goluInset(t, seg(t, LS('q1') + .3, LS('q1') + .7), 830, 560, 170, 'insQ');
  if (t > LS('l1') + .4 && t < LE('l1') + .3) { // inset: Pari crying at the window, the train moving off
    const k = seg(t, LS('l1') + .4, LS('l1') + .8), wx = pariWX(a), ic = { x: 1.55 * (wx - 830), y: 1.55 * (PWY + 40 - 600), z: 3.2, px: 830, py: 600 };
    const sub = station(t, ic, { train2: train2(t, a), motes: false, noFG: 1 });
    g += inset(830, 600, 175 * back(k), sub.back, 'insP');
  }
  return g + capFor('why', t);
}

// ============ 3 GAG — "Mama! Suusuu aayi hai!" → "Phir se?!" (7 BAAR) → "Station par?! main saath chalti hoon" → Sakina's crying act for a garam samosa →
//   Mama gives in and goes to the samosa stall → wink, "Jaa jaldi!" → Qasim zips to the station WC ============
function E_gag(t) {
  const D = sdur('gag'), k2s = LS('k2'), a3s = LS('a3'), jjs = LS('jj');
  const cryK = seg(t, k2s - .1, k2s + .4) * (1 - seg(t, a3s + .5, a3s + .9)), grin = t > a3s + .6;
  const zip = seg(t, LE('jj') - .05, LE('jj') + 1.0);
  let cam = camS(250, 1.18, 1200);
  cam = lerpCam(cam, camS(SKX - 20, 1.42, 1230), ease(seg(t, k2s - .3, k2s + .5)) * (1 - ease(seg(t, a3s, a3s + 1))));
  cam = lerpCam(cam, camS(60, 1.1, 1190), ease(seg(t, LE('jj') - .3, LE('jj') + .5)));
  const S = station(t, cam, { train2: train2(t, ABS) });
  let g = S.back;
  const qs = on('qs', t), pf = on('pf', t), a2 = on('a2', t), k2 = on('k2', t, .1, .3), a3 = on('a3', t), jj = on('jj', t), danger = t > LS('a2') && t < k2s + .3;
  const mGo = seg(t, LE('a3') - .2, LE('a3') + 2.2), mx = lerp(MX, MX + 1500, ease(mGo));
  g += P1(cam, BBX, babaK, { s: SKR, t, move: t > a3s ? 'facepalm' : 'idle', mt: t, yaw: .4, expr: t > a3s ? 'smug' : 'neutral' }, { w: 110 });
  const mL = pf || a2 ? [12, 2] : (cryK > .2 || a3 ? [14, 0] : [10, 4]);
  g += P1(cam, mx, ammi, { s: SAM, t, phone: 0, look: mGo > 0 ? [14, 0] : mL, brow: pf ? 1 : (cryK > .2 ? .8 : .3), amp: amp('MAMA'), tilt: pf ? 6 : (mGo > 0 && mGo < 1 ? 4 * Math.sin(t * 12) : 0), blink: blink(t, 2.7) }, { w: 140 });
  g += P1(cam, SKX, sakina, { s: SKR, t, move: cryK > .1 && !grin ? 'cry' : (jj ? 'thumbsUp' : 'idle'), mt: jj ? t - jjs : t, yaw: grin ? 0 : -.5, expr: cryK > .1 && !grin ? 'cry' : (grin ? 'wink' : (danger ? 'scared' : 'neutral')), amp: amp('SAKINA') }, { w: 100 });
  if (cryK > 0) { const f = proj(1, cam, SKX + 6, PL.feet - 395 * SKR * 1.18); g += fountain(f.x, f.y, f.s * .9, t, cryK, proj(1, cam, SKX, PL.feet + 20).y) + puddle(f.x, proj(1, cam, SKX, PL.feet + 30).y, f.s, clamp(cryK * 1.3)); }
  // Qasim: pee-dance, then zips LEFT towards the WC booth
  const dd = Math.sin(t * 16), z = eout(zip), qx = lerp(QX0, QX0 - 1500, z);
  if (zip < .98) g += QS(cam, qx, { t, flip: zip > 0 ? -1 : 1, look: qs ? [-10, -6] : [-12, 0], mouth: qs ? 'wobble' : (danger ? 'o' : (jj ? 'grin' : 'wobble')), amp: amp('QASIM'), brow: .9, tilt: zip === 0 ? 6 * dd : 0, legL: zip > 0 ? walkK(t, 32) : 16 + 6 * dd, legR: zip > 0 ? -walkK(t, 32) : -16 + 6 * dd, armL: zip > 0 ? 150 : 6, armR: zip > 0 ? 150 : 6, blink: blink(t) });
  if (zip > 0 && zip < .9) { const p = proj(1, cam, qx, PL.feet); g += speed(p.x + 40, p.y - 150 * p.s, -1, .8, 5) + dust(p.x + 60, p.y, (t * 3) % 1, 5, 40); }
  // Golu still at the edge in the background
  g += goluAt(cam, GLX + 30, GLY, { t, shiver: 1, ears: 'flat', tears: 1, look: [6, -6] });
  g += S.front;
  g += tally(7, 'AAJ SUUSUU BREAK:', seg(t, LS('pf') + .2, LS('pf') + .5) * (1 - seg(t, LE('pf') + .2, LE('pf') + .4)));
  if (danger) g += hookBig('RAAZ', 'KHATRE MEIN!', t, LS('a2') + .3, LS('a2') + .6, 260) + goluInset(t, seg(t, LS('a2') + .5, LS('a2') + .9) * (1 - seg(t, k2s + .1, k2s + .4)), 830, 660, 170, 'insGg');
  if (k2) g += `<g transform="translate(540,300) scale(${back(seg(t, k2s, k2s + .3))})">${burst(0, 0, 230, '#7fd0ff', 'BUAAAA!', 92, 6, 1)}</g>` + T(540, 520, 60, 'CRYING GIRL ON!', { fill: '#fff', shadow: '#2f7fd6', op: clamp((t - k2s - .4) * 4) });
  if (cryK > .2 && !grin) g += violin(150, 420, t, cryK);
  if (a3) g += hookBig('MAMA', 'PIGHAL GAYI!', t, a3s + .3, a3s + .6, 280);
  if (grin && t < jjs) { const f = proj(1, cam, SKX + 60, PL.feet - 470); g += burst(f.x, f.y, 70, '#fff', 'TING!', 34, 8, 1); }
  if (zip > .6) g += T(540, 330, 90, 'WC KI TARAF!', { fill: '#fff', shadow: '#2f6fd1', op: seg(zip, .6, .8) * (1 - seg(t, D - .3, D)) });
  return g + capFor('gag', t);
}

// ============ 4 POWER — the station WC booth: door glows gold, FLUUSH, SUUSUU POWER bar, narrator line #1, SUUU-SUUU-MAN! (Sakina outside, winking) ============
function E_power(t) {
  const nE = LE('n2'), q = LS('qp'), open = ease(seg(t, q - .45, q - .3)), glow = Math.max(seg(t, .15, nE), open);
  const DX = WCB.x + WCB.w / 2;
  const cam = camS(DX + 80, lerp(1.05, 1.42, ease(seg(t, 0, q - .4))) + .06 * open, 1240, 540);
  const S = station(t, cam, { open, glow, train2: train2(t, ABS) });
  let g = S.back;
  const dp = proj(1, cam, DX, 1000);
  g += P1(cam, WCB.x + WCB.w + 230, sakina, { s: .95, t, move: open > 0 ? 'thumbsUp' : 'idle', mt: t - q + .4, yaw: -.5, expr: open > 0 ? 'wink' : 'smug' }, { w: 100 });
  if (open > 0) g += shafts(dp.x, dp.y, -Math.PI / 2, 14, 1900, .5 * open, t * 3, '#fff6c8', .45, .05);
  if (open > 0) {
    const st = eout(seg(t, q - .3, q + .5)), hero = ease(seg(t, q, q + .3)), up = ease(seg(t, LE('qp') + .45, sdur('power')));
    g += at(1, cam, DX - 20 * st, lerp(WCB.base, PL.feet, st) - up * 1500, susu, { s: lerp(SQ, .8, st), t, power: open, cape: open, crown: seg(t, q, q + .3), shades: seg(t, LE('qp') + .1, LE('qp') + .4), armR: lerp(20, 165, hero), fistR: hero > .4, armL: lerp(20, 40, hero), amp: amp('QASIM'), mouth: 'smirk', blink: blink(t, 3), legL: up > 0 ? -20 : 0, legR: up > 0 ? 14 : 0 }, { w: 120, h: up * 1500, op: 1.2 });
    if (up > 0) { const p = proj(1, cam, DX, PL.feet - up * 1500); g += speed(p.x, p.y + 120, 0, .7, 3); }
  }
  g += S.front;
  g = shake(g, (open > 0 && open < 1) ? 1 : (glow > .8 && open === 0 ? .3 : 0), t);
  if (t > .5 && t < 2.2) { const k = back(seg(t, .5, .8)); g += `<g transform="translate(540,640) scale(${k})">${burst(0, 0, 230, C.gold, 'FLUUSH!', 104, -8, 1 - seg(t, 1.9, 2.2))}</g>`; }
  const p = ease(seg(t, .7, nE));
  if (t > .6 && open < 1) g += `<g opacity="${seg(t, .6, .8) * (1 - open)}"><rect x="140" y="150" width="800" height="150" rx="30" fill="#000" opacity=".75"/>${T(540, 212, 62, 'SUUSUU POWER', { fill: C.gold, sw: 0, ls: 6 })}<rect x="190" y="235" width="700" height="44" rx="22" fill="#333" stroke="#fff" stroke-width="5"/><rect x="194" y="239" width="${692 * p}" height="36" rx="18" fill="${p > .99 ? '#ff3b30' : C.gold}"/>${T(540, 272, 40, Math.round(p * 100) + '%', { sw: 6 })}${emblem(180, 257, .7)}</g>`;
  if (t > 1.4 && open === 0) g += goluInset(t, seg(t, 1.4, 1.7), 820, 640, 180, 'insPw');
  if (t > q) { const k = back(seg(t, q, q + .3)); g += `<g transform="translate(540,330) scale(${lerp(2.2, 1, clamp(k))}) rotate(-4)" opacity="${clamp(k * 2)}"><rect x="-460" y="40" width="920" height="40" rx="20" fill="${C.red}" transform="skewX(-20)"/>${T(0, 40, 138, 'SUUU-SUUU-MAN!', { shadow: C.red, sw: 12, ls: 2 })}</g>`; }
  return g + capFor('power', t);
}

// ============ 5 RESCUE — Susuman streaks in from the sky ("Daro mat Golu!"); PAAAM! a goods train's horn — Golu panics and jumps DOWN onto track 1 (it gets worse);
//   Dharmender runs to the edge: "Pilla patri par gir gaya!"; Latifa pulls him back: "Neeche mat utro! Doosri train aa rahi hai!"; the engine's headlight grows —
//   SLOW-MO dive, Susuman scoops Golu off the rails a moment before the engine; the goods train thunders past below them: "Pakad liya!" ============
const RZ = { horn: 3.3, jump: 3.6, land: 4.2, slow: 9.3, grab: 10.9, rise: 11.3, off: 14.9 };
function goodsX(t) {
  if (t < RZ.horn) return -9000;
  if (t < RZ.slow) return lerp(-5600, -60, (t - RZ.horn) / (RZ.slow - RZ.horn));
  if (t < RZ.rise) return -60 + 170 * (t - RZ.slow);
  return -60 + 170 * (RZ.rise - RZ.slow) + 1500 * (t - RZ.rise);
}
function E_rescue(t) {
  const D = sdur('rescue'), a = ABS;
  const SLOW = t > RZ.slow && t < RZ.rise + .2;
  const cam = camKS(t, [[0, [GLX + 60, .9, 1210]], [2.2, [GLX + 40, 1.08, 1190], .9], [LS('d2') - .5, [DHX - 230, .98, 1180], .8],
    [RZ.slow - .4, [GTX - 260, 1.32, 1080, 560], .7], [RZ.rise + .1, [GLX + 120, .84, 1160], 1.4], [RZ.off, [GLX + 300, .84, 1150], 1.2]]);
  const gx = goodsX(t);
  // Golu: on the lip → startle → leap down → shivering on the rails (inside the track-1 layer) → in Susuman's arms
  let inner1 = '', goluTop = '';
  if (t >= RZ.land && t < RZ.grab) inner1 = goluSvgT(t, { shiver: 1, ears: 'flat', tears: 1, look: [-8, -2], sit: .6 });
  const train1 = gx > -8000 ? trainSvg(gx, T1.near, TS1, goodsCars(), t, { locoO: { beam: t > RZ.horn ? 1 : 0, horn: (t > RZ.horn && t < RZ.horn + 1.2) || (t > RZ.slow + .5 && t < RZ.grab) ? 1 : 0 } }) : '';
  const S = station(t, cam, { train2: train2(t, a), inner1, train1 });
  let g = S.back;
  if (t < RZ.jump) g += goluAt(cam, GLX + 30, GLY, { t, shiver: t < RZ.horn ? 1 : 0, ears: t < RZ.horn ? 'flat' : 'up', tears: 1, look: [6, -6], jump: seg(t, RZ.horn, RZ.horn + .15) });
  else if (t < RZ.land) { const k = seg(t, RZ.jump, RZ.land), p0 = proj(1, cam, GLX + 30, GLY), p1 = onT1(cam, GTX, GTY); goluTop = golu({ x: lerp(p0.x, p1.x, k), y: lerp(p0.y, p1.y, k) - 160 * Math.sin(k * Math.PI) * p0.s, s: GS * lerp(p0.s, p1.s, k), t, run: 1, flip: -1, ears: 'flat', rot: -20 + 40 * k }); }
  // people on the platform
  const d2 = on('d2', t, .1, .3), l2 = on('l2', t, .1, .3), happy = t > RZ.rise + .6;
  const dLunge = ease(seg(t, LS('d2') - .2, LS('d2') + .5)) * (1 - ease(seg(t, LS('l2') + .3, LS('l2') + 1.0)) * .6);
  g += P1(cam, DHX - 220 * dLunge, dharmK, { s: SKR, t, move: happy ? 'celebrate' : (d2 ? 'shout' : (t > LS('d2') - .3 ? 'scared' : 'idle')), mt: t, yaw: happy ? 0 : -.6, expr: happy ? 'happy' : 'scared', amp: amp('DHARMENDER') }, { w: 110 });
  if (t < LS('d2') - .2) { const p = proj(1, cam, DHX + 10, PL.feet - 500 * SKR); g += suitcase(p.x, p.y, .55 * p.s, '#8e44ad', 3); }
  else { const p = proj(1, cam, DHX + 150, PL.feet); g += suitcase(p.x, p.y, .55 * p.s, '#8e44ad', 0); }
  g += P1(cam, LTX - 120 * ease(seg(t, LS('l2') - .3, LS('l2') + .3)), latifaK, { s: SKR, t, move: happy ? 'clap' : (l2 ? 'shout' : 'scared'), mt: t, yaw: happy ? 0 : -.6, expr: happy ? 'happy' : (l2 ? 'shout' : 'scared'), amp: amp('LATIFA') }, { w: 100 });
  g += P1(cam, -200, babaK, { s: SKR, t, move: happy ? 'clap' : 'scared', mt: t, yaw: .5, expr: happy ? 'happy' : 'scared' }, { w: 110 });
  g += P1(cam, -40, sakina, { s: SKR, t, move: happy ? 'celebrate' : 'holdHead', mt: t, yaw: .5, expr: happy ? 'happy' : 'scared' }, { w: 100 });
  g += goluTop;
  // Susuman
  let sx, sy, sc, rot = 0, arms = [170, 170], mouth = 'grin', carry = 0, flip = 1;
  const gp = onT1(cam, GTX, GTY);
  if (t < RZ.slow) {   // a gold streak coming in from the far sky (he's still far away when the puppy jumps)
    const k = seg(t, 0, RZ.slow), p = { x: lerp(-120, 230, k), y: lerp(140, 300, k) + 40 * Math.sin(t * 3) }; sx = p.x; sy = p.y; sc = lerp(.16, .34, k); rot = 30; mouth = on('q3', t) ? 'talk' : 'shout';
    if (t > 3.0) { sx = lerp(230, 120, seg(t, 3.0, 4.0)); sy = lerp(300, 240, seg(t, 3.0, 4.0)); }
  } else if (t < RZ.grab) {   // SLOW-MO dive from the top right onto the rails
    const k = ease(seg(t, RZ.slow, RZ.grab)); sx = lerp(1000, gp.x + 40 * gp.s, k); sy = lerp(-80, gp.y + 40 * gp.s, k); sc = lerp(.5, .72 * gp.s, k); rot = lerp(-60, -15, k); flip = -1; arms = [175, 175]; mouth = 'shout';
  } else if (t < RZ.off) {    // scoops Golu and shoots up; hovers above the thundering wagons
    const k = eout(seg(t, RZ.grab, RZ.rise + .4)); sx = lerp(gp.x + 40 * gp.s, 520, k); sy = lerp(gp.y + 40 * gp.s, 800, k) + 18 * Math.sin(t * 4) * seg(t, RZ.rise, RZ.rise + .6); sc = lerp(.72 * gp.s, .78, k); rot = lerp(-15, 0, k); arms = [120, 120]; carry = 1; mouth = on('q4', t) ? 'talk' : 'grin';
  } else {                    // zooms off to the right after Pari's train
    const k = seg(t, RZ.off, D); sx = 520 + 1300 * k * k; sy = 800 - 700 * k; sc = .78; rot = 30 * k; arms = [150, 120]; carry = 1; mouth = 'grin';
  }
  if (t < RZ.slow) g += `<path d="M${sx - 220 * sc / .34},${sy + 40} L${sx},${sy}" stroke="${C.gold}" stroke-width="${30 * sc / .34}" stroke-linecap="round" opacity=".55"/>`;
  if (t > RZ.slow && t < RZ.grab) g += speed(sx + 60, sy - 120 * sc, -1, .7, 5);
  g += susuFly(sx, sy, sc, t, { flip, rot, armL: arms[0], armR: arms[1], mouth, amp: amp('QASIM') });
  if (carry) { const h = [sx + 10 * sc, sy - 300 * sc]; g += golu({ x: h[0], y: h[1] + 40 * sc, s: GS * sc * 1.25, t, wag: 1, ears: 'up', look: [4, 0], lick: on('q4', t, .1, .8) ? 0 : (t > LE('q4') + .4 ? 1 : 0) }) + `<path d="M${h[0] - 70 * sc},${h[1] - 10 * sc} q70,${50 * sc} 140,0" stroke="${C.red}" stroke-width="${22 * sc}" fill="none" stroke-linecap="round"/>`; }
  g += S.front;
  // ---- FX + text
  if (t > RZ.horn - .05 && t < RZ.horn + 1.3) { const k = back(seg(t, RZ.horn, RZ.horn + .25)); g += `<g transform="translate(${WIDE ? 200 : 280},${WIDE ? 520 : 560}) scale(${k})">${burst(0, 0, 210, '#fff', 'PAAAAM!', 84, -8, 1 - seg(t, RZ.horn + 1.0, RZ.horn + 1.3))}</g>`; }
  if (t > RZ.land && t < LS('d2')) { const p = onT1(cam, GTX, GTY - 60); g += marker(p.x, p.y, 110 * p.s * 1.3, t, C.red, 'PATRI PAR!'); }
  if (t > LS('d2') - .2 && t < RZ.slow - .3) {   // inset: the goods engine coming down track 1, headlight blazing
    const k = seg(t, LS('d2') - .2, LS('d2') + .2), ic = { x: 1.2 * (gx - 260 - 830), y: 1.2 * (T1.near - 330 - 640), z: .42, px: 830, py: 640 };
    const sub = skyL(t, ic, {}) + farSideL(t, ic) + track2L(t, ic, {}) + track1L(t, ic, { train1 });
    g += inset(830, 640, 180 * back(k), sub, 'insT') + T(830, 870, 52, 'MAAL GAADI!', { fill: '#fff', shadow: C.red, op: k });
  }
  if (l2) g += hookBig('NEECHE', 'MAT UTRO!', t, LS('l2') + .3, LS('l2') + .6, 270);
  if (SLOW) { const k = seg(t, RZ.slow, RZ.slow + .3) * (1 - seg(t, RZ.rise, RZ.rise + .2)); g += `<rect width="1080" height="1920" fill="#0a2a4a" opacity="${(.22 * k).toFixed(2)}"/>` + vig(.8 * k) + T(540, 560, 74, 'SLOW-MO...', { fill: '#bfe8ff', shadow: '#000', op: k }); }
  if (t > RZ.rise && t < RZ.rise + 2.6) g += `<rect width="1080" height="1920" fill="#fff" opacity="${(.5 * (1 - seg(t, RZ.rise, RZ.rise + .25))).toFixed(2)}"/>` + dust(540, 1250, seg(t, RZ.rise, RZ.rise + 1.6), 8, 90) + speed(900, 1100, 1, .5 * (1 - seg(t, RZ.rise + 1.6, RZ.rise + 2.6)), 6);
  if (on('q4', t, .1, .5)) g += `<g transform="translate(830,300) scale(${back(seg(t, LS('q4'), LS('q4') + .25))})">${burst(0, 0, 140, C.gold, 'PAKAD LIYA!', 48, 5, 1)}</g>`;
  if (t > LE('q4') + .5 && t < RZ.off + .4) g += hookBig('GOLU', 'BACH GAYA!', t, LE('q4') + .5, LE('q4') + .8, 260);
  if (t > RZ.off + .2) g += hook2('AB PARI KI TRAIN!', t, RZ.off + .2, 300, 90, '#fff');
  if (t < RZ.horn - .2) g += hook2('SUUSUU-MAN AAYA!', t, .3, 330, 92, '#fff');
  g = shake(g, Math.abs(t - RZ.horn) < .4 ? .9 : (t > RZ.rise && t < RZ.rise + 2.5 ? .5 * (1 - seg(t, RZ.rise, RZ.rise + 2.5)) : (t > RZ.slow - 1.5 && t < RZ.slow ? .3 : 0)), t);
  return g + capFor('rescue', t);
}

// ============ 6 HANDOFF — out in the sarson fields: Susuman flies alongside Pari's train, hands Golu in through the window ("Pari! Ye lo, tumhara Golu!");
//   "Golu! Shukriya, superhero!"; then — AAGE SURANG! — a tunnel; he swoops up over the hill as the train goes in ============
function E_handoff(t) {
  const D = sdur('handoff'), q5 = on('q5', t), p2 = on('p2', t, .1, .4), inWin = t > LS('q5') + 1.0, TUN = 6.6;
  const cam = { x: 0, y: 0, z: 1, px: 540, py: 960 }, sp = 1700 * t;
  let g = fieldsBg(t, cam, sp);
  const RB = 1.25, by = 1330 + 6 * Math.sin(t * 13), cx = 540 - 80 * ease(seg(t, TUN, D));   // the coach bobs on the rails
  const happy = t > LS('p2') - .1;
  const pw = (wx, wy) => { const id = 'pwR'; let inner = `<rect x="${wx - 59}" y="${wy - 75}" width="118" height="150" fill="#3d5266"/>`;
    inner += pariMaK({ x: wx + 44, y: wy + 380, s: .62, t, move: happy ? 'clap' : 'idle', mt: t, yaw: -.2, expr: inWin ? 'happy' : 'sad' });
    inner += pariK({ x: wx - 6, y: wy + 210, s: .78, t, move: happy ? (p2 ? 'talk' : 'celebrate') : (q5 || inWin ? 'surprised' : 'cry'), mt: t, yaw: .25, expr: inWin ? 'happy' : 'cry', amp: amp('PARI') });
    if (inWin) inner += golu({ x: wx - 30, y: wy + 70, s: .42, t, wag: 1, lick: t > LE('p2') ? 1 : .6 * (Math.sin(t * 6) > 0), look: [-4, -6] });
    return `<clipPath id="${id}"><rect x="${wx - 59}" y="${wy - 75}" width="118" height="150" rx="12"/></clipPath><g clip-path="url(#${id})">${inner}</g>`; };
  // the train (d=1): Pari's coach centred, neighbours either side
  let tr = '';
  for (const k of [-1, 0, 1]) tr += coach(cx + k * 1100 * RB + (k ? 0 : 0), by, RB, { col: '#2e7d4f', seed: k + 5, t, roll: t * 14, win: k === 0 ? { 2: pw } : null, label: '' });
  tr += `<rect x="-1500" y="${by - 4}" width="4100" height="20" fill="#9aa3ad" stroke="${C.ink}" stroke-width="3"/><rect x="-1500" y="${by + 16}" width="4100" height="70" fill="#8d8478"/>`;
  g += tr;
  // the tunnel (hill + stone portal) arriving from the right, swallowing the train
  if (t > TUN) {
    const k = seg(t, TUN, D), px = lerp(1700, -400, ease(k) * .55 + k * .45);
    let h = `<path d="M${px - 60},${by + 30} L${px - 60},${by - 820} Q${px + 200},${by - 1180} ${px + 900},${by - 1120} Q${px + 1700},${by - 1060} ${px + 2600},${by - 1150} L${px + 2600},${by + 30}Z" fill="#5f8f4a" stroke="${C.ink}" stroke-width="6"/>`;
    h += [...Array(9)].map((_, i) => `<path d="M${px + 300 + i * 260},${by - 1000 + 40 * (i % 2)} q60,-30 120,0" stroke="#4e7a3c" stroke-width="10" fill="none" opacity=".7"/>`).join('');
    for (let i = 0; i < 5; i++) { const tx = px + 380 + i * 420, ty = by - 1110 - 20 * Math.sin(i); h += `<rect x="${tx - 10}" y="${ty - 90}" width="20" height="90" fill="#6b4a2a" stroke="${C.ink}" stroke-width="3"/><circle cx="${tx}" cy="${ty - 120}" r="${60 + 10 * (i % 2)}" fill="#3f8f4a" stroke="${C.ink}" stroke-width="4"/><circle cx="${tx - 30}" cy="${ty - 100}" r="34" fill="#4ea85a"/>`; }
    for (let i = 0; i < 7; i++) h += `<circle cx="${px + 320 + i * 300}" cy="${by - 140 - 90 * (i % 3)}" r="${40 + 12 * (i % 2)}" fill="#4e8a3a" opacity=".8"/>`;
    h += `<path d="M${px - 60},${by + 30} V${by - 640} Q${px - 60},${by - 900} ${px + 260},${by - 900} V${by + 30}Z" fill="#a89a86" stroke="${C.ink}" stroke-width="6"/>` + [...Array(6)].map((_, i) => `<path d="M${px - 60},${by - 120 - i * 120} h320" stroke="#8a7d6a" stroke-width="5"/>`).join('');
    h += `<rect x="${px + 10}" y="${by - 820}" width="180" height="70" rx="8" fill="#ffd34a" stroke="${C.ink}" stroke-width="4"/>${T(px + 100, by - 772, 36, 'SURANG', { fill: '#111', sw: 0, ls: 2 })}`;
    g += h;
  }
  // Susuman flies alongside, Golu in his arms, then passes him in through the window
  const wc = { x: cx, y: by - 495 * RB };
  let sx, sy, sc = .7, carry = !inWin, rot = 0, arms = [150, 120], mouth = 'grin';
  if (t < LS('q5')) { const k = eout(seg(t, 0, LS('q5'))); sx = lerp(-260, wc.x - 330, k); sy = lerp(1150, wc.y + 330, k) + 20 * Math.sin(t * 5); rot = lerp(35, 8, k); }
  else if (t < TUN + .8) { sx = wc.x - 330 + 120 * seg(t, LS('q5'), LS('q5') + .9) * (1 - seg(t, LE('q5') + .4, LE('q5') + 1)); sy = wc.y + 330 + 16 * Math.sin(t * 5); arms = [150, q5 ? 175 : 140]; mouth = q5 ? 'talk' : 'grin'; }
  else { const k = ease(seg(t, TUN + .8, TUN + 2.4)); sx = lerp(wc.x - 330, 700, k); sy = lerp(wc.y + 330, 300, k) + 16 * Math.sin(t * 5); rot = lerp(0, -25, k); arms = [150, 150 + 18 * Math.sin(t * 8)]; }
  g += speed(sx - 120, sy - 160 * sc, 1, .6, 5);
  g += susuFly(sx, sy, sc, t, { rot, armL: arms[0], armR: arms[1], mouth, amp: amp('QASIM'), wink: t > D - 1.4 && t < D - .8 ? 1 : 0 });
  if (carry) { const k = seg(t, LS('q5') + .3, LS('q5') + 1.0), hx = lerp(sx + 20 * sc, wc.x - 40, ease(k)), hy = lerp(sy - 300 * sc, wc.y + 20, ease(k)); g += golu({ x: hx, y: hy + 40 * sc, s: GS * sc * 1.25 * lerp(1, .8, k), t, wag: 1, ears: 'up', look: [6, -4], rot: -10 * k }); }
  g += fieldsFG(t, cam, sp);
  if (q5) g += hookBig('YE LO', 'TUMHARA GOLU!', t, LS('q5') + .2, LS('q5') + .45, 250);
  if (p2) { g += heart(wc.x - 80, wc.y - 220 - 40 * seg(t, LS('p2'), LE('p2')), .9) + heart(wc.x + 70, wc.y - 260 - 50 * seg(t, LS('p2'), LE('p2')), .7); }
  if (t > TUN && t < TUN + 2.2) g += hookBig('AAGE', 'SURANG!', t, TUN + .1, TUN + .35, 260);
  if (t > TUN + 2.4) g += hook2('PHUURR!', t, TUN + 2.4, 300, 110, C.gold);
  g = shake(g, .15, t);
  return g + capFor('handoff', t);
}

// ============ 7 SECRET — back on platform 1: Mama returns with samosas: "Qasim! Kahan the tum?"; Qasim jogs in from the WC: "Kuch nahi Mama!";
//   Latifa: "Koi SUPERHERO aaya tha… pilla train tak pahuncha diya!"; "Achha? Mujhe to suusuu aayi thi!"; Sakina winks;
//   their own blue train rolls in: Baba: "Hamari train aa gayi! Sab Mama-Baba ka haath pakdo!" ============
function E_secret(t) {
  const D = sdur('secret'), kt = on('kt', t), kn = on('kn', t), l3 = on('l3', t, .1, .3), q6 = on('q6', t), b2 = on('b2', t, .1, .3), wk = t > LE('q6') - .2 && t < LS('b2') + .4;
  const cam = camKS(t, [[0, [300, 1.0, 1180]], [LS('l3') - .3, [520, .98, 1180], .8], [LE('q6') - .4, [330, 1.24, 1210], .7], [LS('b2') - .3, [250, .86, 1150], 1.0]]);
  const arrive = seg(t, LS('b2') - 2.4, D - .4), bx = lerp(-3400, 2650, 1 - Math.pow(1 - arrive, 2.2));
  const train1 = t > LS('b2') - 2.6 ? trainSvg(bx, T1.near, TS1, blueCars(t), t, { locoO: { beam: 1, horn: on('b2', t, 1.6, -1) ? 1 : 0 } }) : '';
  const S = station(t, cam, { train1 });
  let g = S.back;
  const hold = t > LS('b2') + 1.2;   // holding hands
  g += P1(cam, BBX + 140, babaK, { s: SKR, t, move: b2 ? 'point' : (l3 ? 'listen' : 'idle'), mt: t, yaw: b2 ? -.6 : .4, expr: b2 ? 'happy' : 'happy', amp: amp('BABA') }, { w: 110 });
  const mIn = ease(seg(t, 0, 1.4)), mx = lerp(MX + 900, MX + 40, mIn);
  g += P1(cam, mx, ammi, { s: SAM, t, phone: 0, look: kt ? [14, -2] : [10, 4], brow: kt ? .8 : .2, amp: amp('MAMA'), tilt: mIn < 1 ? 4 * Math.sin(t * 12) : 0, blink: blink(t, 2.6) }, { w: 140 });
  { const p = proj(1, cam, mx + 150 * SAM, PL.feet - 250 * SAM); g += samosaPlate(p.x, p.y, .9 * p.s); }
  const qIn = ease(seg(t, .4, LS('kn') + .1)), qx = lerp(-700, QX0 + 40, qIn);
  g += QS(cam, qx, { t, look: kn || q6 ? [-12, -4] : [-8, -4], mouth: kn || q6 ? 'talk' : 'smirk', amp: amp('QASIM'), wink: t > LE('kn') - .2 && t < LE('kn') + .4 ? 1 : 0, legL: qIn < 1 ? walkK(t, 24) : 0, legR: qIn < 1 ? -walkK(t, 24) : 0, armL: 20, armR: hold ? 60 : (q6 ? 120 : 20), blink: blink(t) });
  g += P1(cam, SKX + 60, sakina, { s: SKR, t, move: wk ? 'thumbsUp' : (hold ? 'wave' : 'idle'), mt: t - LE('q6') + .2, yaw: wk ? 0 : -.4, expr: wk ? 'wink' : 'happy' }, { w: 100 });
  g += P1(cam, 820, latifaK, { s: SKR, t, move: l3 ? 'talk' : 'idle', mt: t, yaw: -.5, expr: l3 ? 'surprised' : 'happy', amp: amp('LATIFA') }, { w: 100 });
  g += P1(cam, 1000, dharmK, { s: SKR, t, move: l3 ? 'thumbsUp' : 'idle', mt: t, yaw: -.5, expr: 'happy' }, { w: 110 });
  { const p = proj(1, cam, 1150, PL.feet); g += suitcase(p.x, p.y, .55 * p.s, '#8e44ad', 0); }
  g += S.front;
  if (kn) g += shhh(900, 560, back(seg(t, LS('kn'), LS('kn') + .3)) * .9);
  if (l3) g += hookBig('KOI', 'SUPERHERO?!', t, LS('l3') + .4, LS('l3') + .7, 250);
  if (wk) g += T(540, 640, 96, 'SHHH... RAAZ!', { fill: C.gold, shadow: '#000', op: clamp((t - LE('q6') + .2) * 3) * (1 - seg(t, LS('b2') - .1, LS('b2') + .3)) });
  if (hold) g += hookBig('HAATH', 'PAKDO!', t, LS('b2') + 1.3, LS('b2') + 1.55, 260);
  return g + capFor('secret', t);
}

// ============ 8 CLIFFHANGER — "AGLE EPISODE MEIN…": gali cricket final, a big hit — the ball flies straight at a window; Basim: "Arre! Ball seedhi khidki ki taraf!" ============
const HB2 = x => GB - 165 + SL * Math.min(x, XR);
function E_cliff(t) {
  const D = sdur('cliff');
  const cam = camF2(700 + 40 * t, 1.0 + .05 * t);
  const S = dhalaan(t, cam, { inner: '' });
  let g = S.back;
  g += at(1, cam, 520, G(520) + 40, basim, { s: SKR, t, move: 'point', mt: t, yaw: .5, expr: 'scared', amp: amp('BASIM') }, { w: 90 });
  // the ball: from the batsman (left, low) to the window (right, high), with a fiery trail; freezes just before the glass
  const w = { x: 790, y: 660 }, k = ease(seg(t, .1, D - .4)) * .92, b0 = { x: 140, y: 1150 };
  const bx = lerp(b0.x, w.x, k), by = lerp(b0.y, w.y, k) - 260 * Math.sin(k * Math.PI);
  g += `<rect x="${w.x - 110}" y="${w.y - 130}" width="220" height="260" rx="12" fill="#bfe6f2" stroke="${C.ink}" stroke-width="8"/><path d="M${w.x},${w.y - 130} v260 M${w.x - 110},${w.y} h220" stroke="${C.ink}" stroke-width="6"/><path d="M${w.x - 80},${w.y - 100} l40,-20 M${w.x - 80},${w.y - 60} l70,-40" stroke="#fff" stroke-width="8" opacity=".8"/>`;
  for (let i = 1; i < 8; i++) { const kk = Math.max(0, k - i * .03), tx = lerp(b0.x, w.x, kk), ty = lerp(b0.y, w.y, kk) - 260 * Math.sin(kk * Math.PI); g += `<circle cx="${tx}" cy="${ty}" r="${34 - i * 3}" fill="${i < 3 ? '#ffd34a' : '#ff9a3a'}" opacity="${.6 - i * .07}"/>`; }
  g += `<g transform="translate(${bx},${by}) rotate(${t * 900})"><circle r="40" fill="#c8102e" stroke="${C.ink}" stroke-width="5"/><path d="M-30,-26 Q0,0 -30,26 M30,-26 Q0,0 30,26" stroke="#fff" stroke-width="4" fill="none"/></g>`;
  g += S.front;
  g += `<rect width="1080" height="1920" fill="#000" opacity=".22"/>` + vig(.9);
  g += `<g transform="translate(540,${WIDE ? 310 : 300}) scale(${back(seg(t, 0, .3)) * (WIDE ? 1.2 : 1)}) rotate(-3)">${T(0, 0, 100, 'AGLE EPISODE', { shadow: '#000', sw: 11 })}${T(0, 130, 120, 'MEIN...', { fill: C.gold, shadow: C.red, sw: 12 })}</g>`;
  if (t > .3) g += T(540, WIDE ? 520 : 560, 54, 'CRICKET FINAL', { fill: '#fff', shadow: '#2e7d4f', op: seg(t, .3, .6) });
  g = shake(g, .3, t);
  const f2 = seg(t, D - .25, D); if (f2 > 0) g += `<rect width="1080" height="1920" fill="#fff" opacity="${f2}"/>`;
  return g + capFor('cliff', t);
}
const camF2 = (wx, z = 1, feetY = 1170, sx = 540) => camG(wx, z, feetY, sx, -40);

// ============ 9 END SCREEN — the narrator's lesson (big), then LIKE + SUBSCRIBE; Susuman waving with Pari + Golu ============
function lessonCard(t, x, y, s) {
  const k = back(seg(t, .3, .6)), out = 1 - seg(t, LS('n3') + 4.4, LS('n3') + 4.8);
  return k > 0 && out > 0 ? `<g transform="translate(${x},${y}) scale(${(k * s).toFixed(3)}) rotate(-2)" opacity="${out.toFixed(2)}">${T(0, 0, 78, 'MAMA-BABA KE SAATH RAHO!', { fill: C.gold, shadow: C.red, sw: 11 })}${T(0, 96, 56, 'platform ke kinaare se door', { fill: '#fff', shadow: '#000', sw: 8 })}</g>` : '';
}
function E_endcard(t) {
  const cam = { x: 30 * Math.sin(t * .4), y: 0, z: 1 + .05 * t / sdur('endcard') };
  let g = layer(4, cam, brushBg(t + 90), { f: '' });
  g += layer(1, cam, shadow(330, 1255, 200, .8) + lightPool(330, 1250, 380, 70, .8) + susu({ x: 330, y: 1250, s: .85, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 30, armR: 150 + 18 * Math.sin(t * 7), mouth: 'grin', blink: blink(t, 2.6) }) + shadow(780, 1250, 120, .7) + pariK({ x: 780, y: 1250, s: 1.25, t, move: 'wave', mt: t, yaw: -.3, expr: 'happy' }) + shadow(590, 1250, 90, .7) + golu({ x: 590, y: 1250, s: 1.0, t, wag: 1, sit: 1, look: [2, -4] }), { f: '' });
  let sp = ''; for (let i = 0; i < 9; i++) { const x = ((i * 157 + t * 60) % 1300) - 110, y = 200 + (i * 211) % 1500; sp += `<path d="M${x},${y - 40} L${x + 10},${y} L${x},${y + 40} L${x - 10},${y}Z M${x - 40},${y} L${x},${y - 10} L${x + 40},${y} L${x},${y + 10}Z" fill="${C.gold}" opacity=".8"/>`; }
  g += layer(.6, cam, sp);
  g += lessonCard(t, 540, 300, 1);
  const lk = LS('n3') + 4.5, k = back(seg(t, lk, lk + .3)), clicked = t > lk + 3.0;
  if (k > 0) g += `<g transform="translate(540,290) scale(${k})">${T(0, 0, 100, 'LIKE aur SUBSCRIBE', { shadow: '#000' })}${T(0, 110, 90, 'KARO!', { fill: C.gold, shadow: C.red })}</g>`;
  g += `<g transform="translate(540,1560) scale(${back(seg(t, lk + .3, lk + .6)) * (Math.abs(t - lk - 2.9) < .1 ? .92 : 1)})"><rect x="-300" y="-70" width="600" height="140" rx="70" fill="${clicked ? '#555' : '#ff0000'}" stroke="#fff" stroke-width="6"/>${T(0, 28, 76, clicked ? 'SUBSCRIBED' : 'SUBSCRIBE', { sw: 0, ls: 4 })}</g>`;
  const cx = lerp(900, 640, ease(seg(t, lk + 2.0, lk + 2.8))), cy = lerp(1800, 1590, ease(seg(t, lk + 2.0, lk + 2.8)));
  if (t > lk + 2.0 && t < lk + 4.0) g += `<path d="M${cx},${cy} l0,80 l20,-18 l14,32 l14,-6 l-14,-30 l28,-2z" fill="#fff" stroke="#000" stroke-width="5"/>`;
  if (clicked) g += `<g transform="translate(540,1700) scale(${back(seg(t, lk + 3.1, lk + 3.4))})"><rect x="-260" y="-38" width="520" height="76" rx="38" fill="${C.gold}" stroke="#000" stroke-width="5"/>${T(0, 18, 46, 'AGLI KAHANI JALD!', { fill: '#000', sw: 0, ls: 1 })}</g>`;
  return g + capFor('endcard', t);
}
function E_endcardW(t) {
  let g = `<g transform="translate(${-30 + 20 * Math.sin(t * .4)},0)">${brushBg(t + 90).replace(/<rect width="1080" height="1920"/g, '<rect x="-200" y="-200" width="2400" height="1500"')}</g>`;
  g += `<rect width="1920" height="1080" fill="#000" opacity=".18"/>`;
  g += shadow(300, 1000, 220, .8) + lightPool(300, 995, 400, 70, .8) + susu({ x: 300, y: 995, s: .74, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 30, armR: 150 + 18 * Math.sin(t * 7), mouth: 'grin', blink: blink(t, 2.6) }) + shadow(720, 1000, 110, .7) + pariK({ x: 720, y: 1000, s: 1.1, t, move: 'wave', mt: t, yaw: -.3, expr: 'happy' }) + shadow(540, 1000, 80, .7) + golu({ x: 540, y: 1000, s: .9, t, wag: 1, sit: 1, look: [2, -4] });
  const lk = LS('n3') + 4.5;
  g += lessonCard(t, 960, 140, .95);
  if (t > lk) g += `<g transform="translate(470,140) scale(${back(seg(t, lk, lk + .3))}) rotate(-3)">${T(0, 0, 76, 'LIKE aur SUBSCRIBE', { shadow: '#000' })}${T(0, 86, 70, 'KARO!', { fill: C.gold, shadow: C.red })}</g>`;
  const bk = back(seg(t, lk - .2, lk + .3));
  g += `<g opacity="${clamp(bk).toFixed(2)}"><rect x="1010" y="230" width="800" height="450" rx="26" fill="#000" opacity=".28" stroke="#fff" stroke-width="6" stroke-dasharray="26 14"/><circle cx="1410" cy="870" r="140" fill="#000" opacity=".28" stroke="#fff" stroke-width="6" stroke-dasharray="26 14"/></g>`;
  let sp = ''; for (let i = 0; i < 7; i++) { const x = ((i * 257 + t * 60) % 2100) - 90, y = 120 + (i * 151) % 850; sp += `<path d="M${x},${y - 30} L${x + 8},${y} L${x},${y + 30} L${x - 8},${y}Z M${x - 30},${y} L${x},${y - 8} L${x + 30},${y} L${x},${y + 8}Z" fill="${C.gold}" opacity=".7"/>`; }
  return g + sp;
}
