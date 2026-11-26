// ======================= EPISODE 12 — "Cricket Final" (scenes) =======================
// Set: the 2.5D dhalaan gali (Ep 4/10) with OFFICER GILL'S HOUSE drawn into the house row (d = 1.3): the upstairs window that breaks,
// the concrete chhajja above it where the ball lands, and the old drain pipe Basim climbs. Action plane d = 1 is the sloped lane (the pitch).
const MX = 160, QX0 = 330, SKX = 470;            // Mama, Qasim, Sakina near the blue door (top of the lane)
const BX = 640, STX = 560, DX = 1480, DAX = 1650, STX2 = 1570;   // Basim (batting), his stumps, Dharmender (bowler), Dada Abu (umpire), far stumps
const camW = (X, Y, z = 1, sx = 540, sy = 900) => camD(1.3, X, Y, z, sx, sy);   // aim at a point of the house row
function camKW(t, K) {   // keyframes of camera objects
  let c = K[0][1];
  for (let i = 1; i < K.length; i++) { const [t0, c1, dur = .8] = K[i]; c = lerpCam(c, c1, ease(seg(t, t0, t0 + dur))); }
  return c;
}
const hookFrame0 = (l1, l2, t, out = 2.4) => { const hk = t < out + .2 ? (t < .12 ? .85 + t : back(seg(t, -.1, .2))) * (1 - seg(t, out - .1, out + .2)) : 0; return hk > 0 ? `<g transform="translate(540,${WIDE ? 280 : 260}) scale(${(hk * (WIDE ? 1.4 : 1)).toFixed(3)}) rotate(-3)">${T(0, 0, 130, l1, { shadow: '#000', sw: 13 })}${T(0, 140, 150, l2, { fill: C.gold, shadow: C.red, sw: 14 })}</g>` : ''; };
const batAt = (cam, x, rot = 40, dy = 0, d = 1) => { const p = proj(d, cam, x + 52, G(x) - 105 + dy); return bat(p.x, p.y, p.s * .85, rot); };
const stumpsAt = (cam, x, hit = 0) => { const p = proj(1, cam, x, G(x) + 4); return stumps(p.x, p.y, p.s * .95, hit); };
const HB_H = GHH * .55;   // where Basim gets stuck on the pipe (hands, height above the pipe foot)
function glassShards(cx, cy, s, k, seed = 1) {
  if (k <= 0 || k >= 1) return '';
  let g = '';
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI * (.1 + .8 * hs(i + seed)), v = (260 + 300 * hs(i + seed + 7)) * s, x = cx + Math.cos(a) * v * k * (i % 2 ? 1 : -1), y = cy + Math.sin(a) * v * k * .6 + 900 * s * k * k;
    g += `<path d="M${x.toFixed(1)},${y.toFixed(1)} l${(18 * s).toFixed(1)},${(-26 * s).toFixed(1)} l${(14 * s).toFixed(1)},${(30 * s).toFixed(1)}Z" fill="#cfeaff" stroke="#2f7fd6" stroke-width="2" opacity="${(1 - k * .7).toFixed(2)}" transform="rotate(${(k * 600 + i * 40).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return g;
}
const fireBall = (pts, r) => pts.map((p, i) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(r * (1 - i * .1)).toFixed(1)}" fill="${i < 3 ? '#ffd34a' : '#ff9a3a'}" opacity="${(.6 - i * .07).toFixed(2)}"/>`).join('');
// Basim hanging on the pipe, seen in a little circle inset (for the cut-aways)
function basimInset(t, k, cx = 830, cy = 600, r = 175, id = 'insB', ang = 0) {
  if (k <= 0) return '';
  const hp = pipePt(HB_H, ang), ic = camW(hp.x + 10, hp.y + 150, 1.05, cx, cy);
  const sub = dhalaan(t, ic, { motes: false, noPump: 1, noBoug: 1, rowInner: gillHouse(t, { broken: 1, ballOn: 1, clamp: 1, pipeAng: ang + 1.5 * Math.sin(t * 9), id: id, inner: basimPipe(t, HB_H, ang, { kick: 1 }) }) });
  return inset(cx, cy, r * back(k), sub.back, id) + T(cx, cy + r + 56, 46, 'PIPE HIL RAHA HAI!', { fill: '#fff', shadow: C.red, op: clamp(k * 1.5) });
}
// everybody on the pitch (cold + why): returns svg; o.basim = override for Basim (false = he is elsewhere)
function pitchCast(t, cam, o = {}) {
  let g = '';
  g += stumpsAt(cam, STX, o.stHit || 0) + stumpsAt(cam, STX2);
  if (!o.noFamily) {
    g += at(1, cam, MX, G(MX) + 40, ammi, Object.assign({ s: SAM, t, phone: 0, look: [10, -8], brow: .8, blink: blink(t, 2.7) }, o.mama || {}), { w: 140 });
    g += Q(cam, QX0, Object.assign({ t, look: [10, -8], mouth: 'o', brow: 1, armL: 20, armR: 20, blink: blink(t) }, o.qasim || {}));
    g += onLane(1, cam, SKX, sakina, Object.assign({ s: SKR, t, move: 'scared', mt: t, yaw: .4, expr: 'scared' }, o.sakina || {}), { w: 100 });
  }
  if (o.basim !== false) g += onLane(1, cam, o.bx ?? BX, basim, Object.assign({ s: SKR, t, move: 'idle', mt: t, yaw: .5, expr: 'scared', amp: amp('BASIM') }, o.basim || {}), { w: 90 });
  if (o.batHeld !== false && o.basim !== false) g += batAt(cam, o.bx ?? BX, o.batRot ?? 40, o.batDy || 0);
  g += onLane(1, cam, o.dx ?? DX, dharmK, Object.assign({ s: SKR, t, move: 'scared', mt: t, yaw: -.5, expr: 'surprised', amp: amp('DHARMENDER') }, o.dharm || {}), { w: 100 });
  g += onLane(1, cam, DAX, dadaAbu, Object.assign({ s: SKR, t, move: 'scared', mt: t, yaw: -.5, expr: 'surprised', amp: amp('DADA ABU') }, o.dada || {}), { w: 110 });
  return g;
}

// ============ 1 COLD OPEN (0 s) — the gali FINAL: the red ball is ALREADY flying from Basim's bat straight at Officer Gill's upstairs window (frame 0).
//   Basim: "Arre! Ball seedhi khidki ki taraf!" — CHHANNN! the glass shatters, the ball bounces up onto the chhajja;
//   Officer Gill leans into the broken window with his chai: "Arre! Meri khidki! Ye kisne kiya?!" ============
const CR = () => LE('x1') + .15;
function E_cold(t) {
  const D = sdur('cold'), cr = CR(), broken = t >= cr, g1 = on('g1', t, .1, .3);
  const cam = camKW(t, [[0, camF(BX + 170, .86, 1420, 470)], [.7, camW(WINX - 10, WINY + 170, 1.12, 560, 820), 1.6], [cr + .1, camW(WINX + 10, WINY + 90, 1.38, 540, 760), .5], [LE('g1') - .3, camW(WINX + 60, WINY + 260, 1.1, 540, 820), .8]]);
  const gk = seg(t, cr + .35, cr + .75);
  // the ball: from the bat to the window (screen space through the moving camera); then up onto the chhajja
  let ballSvg = '', ballOn = 0, bdy = 0;
  const pB = proj(1, cam, BX + 70, G(BX) - 150), pW = proj(1.3, cam, WINX + 10, WINY - 10);
  if (!broken) {
    const kk = tt => lerp(.22, 1, Math.pow(seg(tt, 0, cr), 1.15)), arc = k => -420 * Math.sin(k * Math.PI) * pB.s;
    const pts = [];
    for (let i = 0; i < 8; i++) { const k = kk(Math.max(0, t - i * .045)); pts.push({ x: lerp(pB.x, pW.x, k), y: lerp(pB.y, pW.y, k) + arc(k) }); }
    const k0 = kk(t), r = lerp(26 * pB.s, 22 * pW.s, k0) * 1.9;
    ballSvg = fireBall(pts.slice(1), r * 1.1) + speed(pts[0].x - 30, pts[0].y + 120, 1, .5, 3) + cball(pts[0].x, pts[0].y, r, t * 900);
  } else {
    const k = seg(t, cr, cr + .55);
    if (k < 1) { const pC = proj(1.3, cam, WINX + 70, CHJ.y - 20); const x = lerp(pW.x, pC.x, k), y = lerp(pW.y, pC.y, k) - 160 * Math.sin(k * Math.PI) * pW.s; ballSvg = cball(x, y, 22 * pW.s * 1.1, t * 700); }
    else { ballOn = 1; bdy = -10 * Math.abs(Math.sin((t - cr - .55) * 9)) * Math.exp(-(t - cr - .55) * 3); }
  }
  const S = dhalaan(t, cam, { rowInner: gillHouse(t, { broken: broken ? 1 : 0, gill: gk, cup: 1, gillMove: g1 ? 'shout' : 'scared', gillExpr: g1 ? 'angry' : 'surprised', gillAmp: amp('OFFICER GILL'), ballOn, ballDy: bdy, id: 'c' }) });
  let g = S.back;
  const x1 = on('x1', t, .1, .3);
  g += pitchCast(t, cam, { basim: { move: x1 ? 'point' : 'scared', yaw: .6, expr: 'scared' }, batRot: x1 ? 70 : 30, dharm: { move: 'holdHead' }, dada: { move: broken ? 'facepalm' : 'scared' }, qasim: { look: [10, -10] }, sakina: { move: broken ? 'holdHead' : 'scared' } });
  g += ballSvg;
  g += S.front;
  // impact: flash + CHHANNN! + flying shards
  if (t > cr - .02 && t < cr + 1.4) {
    const k = seg(t, cr, cr + 1.1);
    g += glassShards(pW.x, pW.y, pW.s * 1.2, k) + `<g transform="translate(${clamp(pW.x, 300, 780)},${pW.y - 170}) scale(${back(seg(t, cr, cr + .25)).toFixed(3)})">${burst(0, 0, 170, '#fff', 'CHHANNN!', 62, -8, 1 - seg(t, cr + 1.0, cr + 1.4))}</g>`;
    g += `<rect width="1080" height="1920" fill="#fff" opacity="${(.7 * (1 - seg(t, cr, cr + .18))).toFixed(2)}"/>`;
  }
  g += hookFrame0('KHIDKI', 'KHATRE MEIN!', t, 2.3);
  if (g1 && t < LE('g1') - .3) g += hookBig('GILL UNCLE', 'KI KHIDKI!', t, LS('g1') + .4, LS('g1') + .7, 270);
  if (t > LE('g1') - .2) { const p = proj(1.3, cam, WINX + 70, CHJ.y - 20); g += marker(p.x, p.y, 70 * p.s * 1.3, t, C.red, 'BALL CHHAJJE PAR!'); }
  g = shake(g, t < .25 ? .9 * (1 - t / .25) : (Math.abs(t - cr) < .45 ? 1 : .1), t);
  return g + capFor('cold', t);
}

// ============ 2 WHY — Basim hides the bat behind his back: "M… maine nahi! Hawa se toot gayi!" (JHOOTH METER → red); Dharmender: "Basim, sach bol de yaar!";
//   Gill: "Ruko! Main neeche aata hoon!"; Basim to Qasim: "Gill Uncle aa rahe hain! Main chupke se ball utaar leta hoon!" — he runs to the old pipe and climbs;
//   Dada Abu: "Basim! Pipe par mat chadho! Neeche aao!"; a clamp creaks, his feet slip — he hangs: "Bachao! Main phans gaya!"; Qasim: "Basim latak gaya… aur pipe hil raha hai!" ============
function E_why(t) {
  const D = sdur('why'), b1 = on('b1', t, .1, .3), d1 = on('d1', t, .1, .3), g2 = on('g2', t, .1, .3), b2 = on('b2', t, .1, .2), da1 = on('da1', t, .1, .3), b3 = on('b3', t, .1, .3), q1 = on('q1', t);
  const run0 = LE('b2') + .05, run1 = run0 + .9, climb1 = LS('b3') - .4;
  const cam = camKW(t, [[0, camF(BX + 150, 1.18, 1210, 520)], [LS('g2') - .35, camW(WINX, WINY + 60, 1.3, 540, 760), .6], [LE('g2') + .15, camF(BX - 120, 1.22, 1220, 540), .6],
    [run0 - .1, camW(PIPE.x + 60, PIPE.y0 - 380, 1.0, 560, 900), .9], [LS('b3') - .3, camW(PIPE.x, pipePt(HB_H).y + 140, 1.3, 540, 760), .6], [LS('q1') - .3, camF(QX0 + 60, 1.4, 1240), .6]]);
  // Basim: by the stumps → runs to the pipe (lane d=1 → house row d=1.3) → climbs → stuck, hanging
  let inner = '';
  const climbH = t < run1 ? 0 : lerp(230, HB_H, ease(seg(t, run1, climb1))), hanging = t > climb1;
  if (t > run1) inner = basimPipe(t, Math.max(climbH, 230), 0, { mode: hanging ? 'hang' : 'climb', kick: hanging ? 1 : 0, amp: amp('BASIM'), expr: hanging ? 'scared' : 'determined' });
  const S = dhalaan(t, cam, { rowInner: gillHouse(t, { broken: 1, gill: 1 - seg(t, LE('g2') + .1, LE('g2') + .5), cup: 1, gillMove: g2 ? 'shout' : 'idle', gillExpr: 'angry', gillAmp: amp('OFFICER GILL'), ballOn: 1, clamp: hanging ? 1 : 0, pipeAng: hanging ? 1.2 * Math.sin(t * 9) : 0, inner, id: 'w' }) });
  let g = S.back;
  const dxW = lerp(lerp(DX, BX + 330, ease(seg(t, LS('d1') - 1.2, LS('d1') + .2))), DX - 40, ease(seg(t, LS('b2') + .5, LS('b2') + 2.0)));   // Dharmender walks up to Basim
  let bo = { move: b1 ? 'shrug' : (b2 ? 'talk' : 'idle'), yaw: b2 ? -.5 : .4, expr: b1 ? 'smug' : (d1 ? 'sad' : 'neutral') }, batHeld = true;
  if (t > run0 - .05 && t < run1) { // running to the pipe: change depth 1 → 1.3
    const z = ease(seg(t, run0, run1)), dd = lerp(1, 1.3, z), xx = lerp(BX, PIPE.x - 10, z), yy = lerp(G(BX) + 40, PIPE.y0 + 10, z);
    g += at(dd, cam, xx, yy, basim, { s: SKR * .95, t, move: 'run', mt: t, yaw: Math.PI / 2 * .8, expr: 'determined' }, { w: 90 });
    const p = proj(dd, cam, xx, yy); g += speed(p.x - 60, p.y - 150 * p.s, 1, .7, 4);
    bo = false;
  } else if (t >= run1) bo = false;
  // the bat: behind his back while he lies, dropped on the ground when he runs
  if (bo && b1) { batHeld = false; g += batAt(cam, BX - 70, -20, 20); }
  if (t > run0) { const p = proj(1, cam, BX + 30, G(BX) + 52); g += bat(p.x, p.y, p.s * .85, 98); }
  g += pitchCast(t, cam, { basim: bo, batHeld: bo ? batHeld : false, dx: dxW, dharm: { move: d1 ? 'point' : (t < LS('d1') - .2 && t > LS('d1') - 1.2 ? 'walk' : 'idle'), yaw: -.5, expr: d1 ? 'determined' : 'neutral' },
    dada: { move: da1 ? 'shout' : (t > run1 ? 'scared' : 'idle'), yaw: -.4, expr: da1 ? 'shout' : (t > run1 ? 'scared' : 'neutral') },
    qasim: { look: q1 ? [14, -6] : [12, -4], mouth: q1 ? 'talk' : 'o', amp: amp('QASIM'), armL: q1 ? 60 : 20, armR: q1 ? 130 : 20 }, sakina: { move: hanging ? 'holdHead' : 'idle', expr: hanging ? 'scared' : 'neutral' },
    mama: { look: hanging ? [12, -10] : [12, 0], brow: hanging ? 1 : .4 } });
  g += S.front;
  // FX + text
  if (b1) g += jhoothMeter(540, 470, back(seg(t, LS('b1') + .2, LS('b1') + .5)) * (1 - seg(t, LE('b1') + .1, LE('b1') + .3)), ease(seg(t, LS('b1') + .4, LE('b1') - .3)) * .95, t) + (t > LE('b1') - .5 ? T(540, 700, 96, 'JHOOTH!', { fill: C.red, shadow: '#000', op: seg(t, LE('b1') - .5, LE('b1') - .3) }) : '');
  if (d1) g += hookBig('SACH', 'BOL DE!', t, LS('d1') + .2, LS('d1') + .5, 280);
  if (g2) g += hook2('GILL UNCLE AA RAHE HAIN!', t, LS('g2') + .5, 300, 70, '#fff');
  if (b2) g += hookBig('CHUPKE', 'SE...?', t, LS('b2') + 1.2, LS('b2') + 1.6, 280);
  if (da1) g += hookBig('PIPE PAR', 'MAT CHADHO!', t, LS('da1') + .3, LS('da1') + .6, 270);
  if (t > LS('b3') - .3 && t < LE('b3') + .4) { const hp = pipePt(HB_H), p = proj(1.3, cam, hp.x, hp.y + 170); g += marker(p.x, p.y, 200 * p.s, t, C.red, 'LATAK GAYA!'); }
  if (t > LS('b3') - .4 && t < LS('b3') + .2) { const hp = pipePt(GHH * .85), p = proj(1.3, cam, hp.x, hp.y); g += burst(clamp(p.x + 80, 160, 920), clamp(p.y, 200, 1200), 70, '#fff', 'KRRRK', 30, 8, 1); }
  if (q1) g += basimInset(t, seg(t, LS('q1') + .3, LS('q1') + .7), 820, 600, 180, 'insQ');
  return g + capFor('why', t);
}

// ============ 3 GAG — "Mama! Suusuu aayi hai!" → "Phir se?!" (5 BAAR) → "Abhi?! main saath chalti hoon" → Sakina's crying act: "Mamaaa… Ammar Chacha ko bulaooo… seedhi laooo…"
//   → Mama gives in and hurries down the gali to fetch Ammar mistri → wink, "Jaa jaldi!" → Qasim zips in at the blue door ============
function E_gag(t) {
  const D = sdur('gag'), k2s = LS('k2'), a3s = LS('a3'), jjs = LS('jj');
  const cryK = seg(t, k2s - .1, k2s + .4) * (1 - seg(t, a3s + .5, a3s + .9)), grin = t > a3s + .6;
  const zip = seg(t, LE('jj') - .05, LE('jj') + 1.0);
  let cam = camF(320, 1.15, 1180);
  cam = lerpCam(cam, camF(430, 1.4, 1200), ease(seg(t, k2s - .3, k2s + .5)) * (1 - ease(seg(t, a3s, a3s + 1))));
  cam = lerpCam(cam, camF(260, 1.22, 1185), ease(seg(t, LE('jj') - .3, LE('jj') + .4)));
  const S = dhalaan(t, cam, { rowInner: gillHouse(t, { broken: 1, ballOn: 1, clamp: 1, pipeAng: 1.2 * Math.sin(t * 9), inner: basimPipe(t, HB_H, 0, { kick: 1 }), id: 'g' }) });
  let g = S.back;
  const qs = on('qs', t), pf = on('pf', t), a2 = on('a2', t), k2 = on('k2', t, .1, .3), a3 = on('a3', t), jj = on('jj', t), danger = t > LS('a2') && t < k2s + .3;
  const mGo = seg(t, LE('a3') - .2, LE('a3') + 2.0), mx = lerp(MX + 40, MX + 1700, ease(mGo));
  const mL = pf || a2 ? [12, 2] : (cryK > .2 || a3 ? [14, 0] : [10, 4]);
  g += at(1, cam, mx, G(mx) + 40, ammi, { s: SAM, t, phone: 0, look: mGo > 0 ? [14, 2] : mL, brow: pf ? 1 : (cryK > .2 ? .8 : .3), amp: amp('MAMA'), tilt: pf ? 6 : (mGo > 0 && mGo < 1 ? 4 * Math.sin(t * 12) : 0), blink: blink(t, 2.7) }, { w: 140 });
  if (mGo > 0 && mGo < 1) { const p = proj(1, cam, mx, G(mx) + 40); g += dust(p.x - 60, p.y, (t * 2.5) % 1, 5, 40); }
  g += onLane(1, cam, SKX, sakina, { s: SKR, t, move: cryK > .1 && !grin ? 'cry' : (jj ? 'thumbsUp' : 'idle'), mt: jj ? t - jjs : t, yaw: grin ? 0 : -.5, expr: cryK > .1 && !grin ? 'cry' : (grin ? 'wink' : (danger ? 'scared' : 'neutral')), amp: amp('SAKINA') }, { w: 100 });
  if (cryK > 0) { const f = proj(1, cam, SKX + 6, G(SKX) + 40 - 395 * SKR * 1.18); g += fountain(f.x, f.y, f.s * .9, t, cryK, proj(1, cam, SKX, G(SKX) + 60).y) + puddle(f.x, proj(1, cam, SKX, G(SKX) + 70).y, f.s, clamp(cryK * 1.3)); }
  const dd = Math.sin(t * 16);
  let qd = 1, qx = QX0, qy = G(QX0) + 40;
  if (zip > 0) { const z = eout(zip); qd = lerp(1, 1.3, z); qx = lerp(QX0, HOMEX, z); qy = lerp(G(QX0) + 40, HB(HOMEX), z); }
  if (zip < .95) g += `<g opacity="${(1 - seg(zip, .8, .95)).toFixed(2)}">` + at(qd, cam, qx, qy, susu, { s: SQ, t, flip: zip > 0 ? -1 : 1, look: qs ? [-10, -6] : [-12, 0], mouth: qs ? 'wobble' : (danger ? 'o' : (jj ? 'grin' : 'wobble')), amp: amp('QASIM'), brow: .9, tilt: zip === 0 ? 6 * dd : 0, legL: zip > 0 ? walkK(t, 32) : 16 + 6 * dd, legR: zip > 0 ? -walkK(t, 32) : -16 + 6 * dd, armL: zip > 0 ? 150 : 6, armR: zip > 0 ? 150 : 6, blink: blink(t) }, { w: 110 }) + '</g>';
  if (zip > 0 && zip < .9) { const p = proj(qd, cam, qx, qy); g += speed(p.x + 40, p.y - 150 * p.s, -1, .8, 5); }
  g += S.front;
  g += tally(5, 'AAJ SUUSUU BREAK:', seg(t, LS('pf') + .2, LS('pf') + .5) * (1 - seg(t, LE('pf') + .2, LE('pf') + .4)));
  if (danger) g += hookBig('RAAZ', 'KHATRE MEIN!', t, LS('a2') + .3, LS('a2') + .6, 260) + basimInset(t, seg(t, LS('a2') + .5, LS('a2') + .9) * (1 - seg(t, k2s + .1, k2s + .4)), 830, 660, 170, 'insG');
  if (k2) g += `<g transform="translate(540,300) scale(${back(seg(t, k2s, k2s + .3))})">${burst(0, 0, 230, '#7fd0ff', 'BUAAAA!', 92, 6, 1)}</g>` + T(540, 520, 60, 'CRYING GIRL ON!', { fill: '#fff', shadow: '#2f7fd6', op: clamp((t - k2s - .4) * 4) });
  if (cryK > .2 && !grin) g += violin(150, 420, t, cryK);
  if (a3) g += hookBig('MAMA', 'PIGHAL GAYI!', t, a3s + .3, a3s + .6, 280);
  if (mGo > .2 && mGo < 1 && !jj) g += hook2('AMMAR CHACHA KO BULANE!', t, LE('a3') + .3, 560, 58, '#fff');
  if (grin && t < jjs) { const f = proj(1, cam, SKX + 60, G(SKX) - 430); g += burst(f.x, f.y, 70, '#fff', 'TING!', 34, 8, 1); }
  if (zip > .85) { const p = proj(1.3, cam, HOMEX, HB(HOMEX) - 260); g += burst(p.x, p.y, 100, '#fff', 'DHAP!', 44, 6, 1 - seg(t, LE('jj') + 1.0, D)); }
  return g + capFor('gag', t);
}

// ============ 4 POWER — the aangan WC door glows gold (Sakina outside, winking), FLUUSH, SUUSUU POWER bar, narrator line #1, SUUU-SUUU-MAN! ============
function E_power(t) {
  const nE = LE('n2'), q = LS('qp'), open = ease(seg(t, q - .45, q - .3)), glow = Math.max(seg(t, .15, nE), open);
  const cam = { x: 270, y: -40, z: lerp(1.0, 1.42, ease(seg(t, 0, q - .4))) + .06 * open, px: 540, py: 900 };
  const S = aangan(t, cam, { open, glow, manoSleep: 1 });
  let g = S.back;
  const dp = proj(1.3, cam, WC.x + WC.w / 2, 840);
  g += at(1.22, cam, WC.x - 120, 1120, sakina, { s: .95, t, move: open > 0 ? 'thumbsUp' : 'idle', mt: t - q + .4, yaw: .5, expr: open > 0 ? 'wink' : 'smug' }, { w: 100 });
  if (open > 0) g += shafts(dp.x, dp.y, -Math.PI / 2, 14, 1900, .5 * open, t * 3, '#fff6c8', .45, .05);
  if (open > 0) {
    const st = eout(seg(t, q - .3, q + .5)), hero = ease(seg(t, q, q + .3)), up = ease(seg(t, LE('qp') + .45, sdur('power')));
    const dd = lerp(1.3, .95, st);
    g += at(dd, cam, WC.x + WC.w / 2 - 40 * st, lerp(1080, 1240, st) - up * 1300, susu, { s: lerp(SQ, .78, st), t, power: open, cape: open, crown: seg(t, q, q + .3), shades: seg(t, LE('qp') + .1, LE('qp') + .4), armR: lerp(20, 165, hero), fistR: hero > .4, armL: lerp(20, 40, hero), amp: amp('QASIM'), mouth: 'smirk', blink: blink(t, 3), legL: up > 0 ? -20 : 0, legR: up > 0 ? 14 : 0 }, { w: 120, h: up * 1300, op: 1.2 });
    if (up > 0) { const p = proj(dd, cam, WC.x + WC.w / 2, 1240 - up * 1300); g += speed(p.x, p.y + 120, 0, .7, 3); }
  }
  g += S.front;
  g = shake(g, (open > 0 && open < 1) ? 1 : (glow > .8 && open === 0 ? .3 : 0), t);
  if (t > .5 && t < 2.2) { const k = back(seg(t, .5, .8)); g += `<g transform="translate(540,640) scale(${k})">${burst(0, 0, 230, C.gold, 'FLUUSH!', 104, -8, 1 - seg(t, 1.9, 2.2))}</g>`; }
  const p = ease(seg(t, .7, nE));
  if (t > .6 && open < 1) g += `<g opacity="${seg(t, .6, .8) * (1 - open)}"><rect x="140" y="150" width="800" height="150" rx="30" fill="#000" opacity=".75"/>${T(540, 212, 62, 'SUUSUU POWER', { fill: C.gold, sw: 0, ls: 6 })}<rect x="190" y="235" width="700" height="44" rx="22" fill="#333" stroke="#fff" stroke-width="5"/><rect x="194" y="239" width="${692 * p}" height="36" rx="18" fill="${p > .99 ? '#ff3b30' : C.gold}"/>${T(540, 272, 40, Math.round(p * 100) + '%', { sw: 6 })}${emblem(180, 257, .7)}</g>`;
  if (t > 1.4 && open === 0) g += basimInset(t, seg(t, 1.4, 1.7), 820, 640, 180, 'insPw');
  if (t > q) { const k = back(seg(t, q, q + .3)); g += `<g transform="translate(540,330) scale(${lerp(2.2, 1, clamp(k))}) rotate(-4)" opacity="${clamp(k * 2)}"><rect x="-460" y="40" width="920" height="40" rx="20" fill="${C.red}" transform="skewX(-20)"/>${T(0, 40, 138, 'SUUU-SUUU-MAN!', { shadow: C.red, sw: 12, ls: 2 })}</g>`; }
  return g + capFor('power', t);
}

// ============ 5 RESCUE — Susuman streaks in ("Daro mat Basim! Main aa gaya!"); just as he reaches out, KRAAK! the top clamp snaps and the old pipe swings away
//   from the wall with Basim on it (IT GETS WORSE): "Pipe toot raha hai!"; Basim's hands slip — SLOW-MO fall — Susuman dives: "Pakad liya!";
//   the heavy pipe keeps falling towards Dada Abu and Dharmender — Susuman catches it one-handed and pushes it back to the wall;
//   Ammar mistri runs in with a seedhi: "Main seedhi le aaya! Purana pipe main theek kar doonga!"; Susuman fetches the ball from the chhajja:
//   "Ye lo tumhari ball. Ab sach bolna!" — "Pakka promise!" — wink, whoosh ============
const RZ = { arrive: 3.0, snap: 4.9, slip: 7.0, slow: 7.3, grab: 9.35, pcatch: 11.2, pup: 12.6, land: 13.4, amIn: 11.4, amAt: 13.2, bUp: 17.0, bBack: 18.2, off: 21.9 };
function rPipeAng(t) {
  if (t < RZ.snap) return 1.2 * Math.sin(t * 9) * seg(t, 3.5, 4.9);
  if (t < RZ.slip) return 22 * eout(seg(t, RZ.snap, RZ.snap + .7)) + 3 * Math.sin(t * 7) * seg(t, RZ.snap + .5, RZ.snap + 1.2);
  if (t < RZ.pcatch) return 22 + 34 * Math.pow(seg(t, RZ.slip, RZ.pcatch), 1.6);
  if (t < RZ.pup) return lerp(56, 0, ease(seg(t, RZ.pcatch + .3, RZ.pup)));
  return 0;
}
// Basim's screen position during the fall: from the pipe (at slip) down to the catch point; slow-mo between slow and grab
function basimFall(t, cam) {
  const a = pipePt(HB_H, rPipeAng(RZ.slip)), pa = proj(1.3, cam, a.x, a.y), pb = proj(1.3, cam, a.x + 60, PIPE.y0 - 260);
  const k = t < RZ.slow ? .12 * seg(t, RZ.slip, RZ.slow) : .12 + .88 * seg(t, RZ.slow, RZ.grab);
  return { x: lerp(pa.x, pb.x, k), y: lerp(pa.y, pb.y, k * k), s: lerp(pa.s, pb.s, k) };
}
const SF = .85;   // Susuman's flying scale at the action plane
function E_rescue(t) {
  const D = sdur('rescue'), SLOW = t > RZ.slow && t < RZ.grab + .2;
  const ang = rPipeAng(t);
  const hp0 = pipePt(HB_H, 0);
  const cam = camKW(t, [[0, camW(PIPE.x - 120, PIPE.y0 - 380, .92, 540, 940)], [RZ.arrive - .6, camW(PIPE.x + 40, hp0.y + 150, 1.2, 540, 780), 1.0], [RZ.snap + .1, camW(PIPE.x + 160, hp0.y + 200, 1.05, 540, 800), .5],
    [RZ.slow, camW(PIPE.x + 200, PIPE.y0 - 260, 1.08, 540, 900), .8], [RZ.grab + .3, camW(PIPE.x + 180, PIPE.y0 - 200, .86, 540, 1000), 1.0],
    [RZ.land - .4, camF(1080, 1.05, 1220, 520), 1.0], [RZ.bUp - .3, camW(WINX + 160, CHJ.y + 240, 1.0, 540, 760), .7], [RZ.bBack + .1, camF(1060, 1.28, 1250, 540), .7], [RZ.off + .3, camF(1060, 1.0, 1350, 540), 1.2]]);
  let inner = '';
  if (t < RZ.slip) inner += basimPipe(t, HB_H, ang, { kick: 1, amp: amp('BASIM'), expr: 'scared' });
  if (t > RZ.amAt) { const k = ease(seg(t, RZ.amAt, RZ.amAt + .6)); inner = ladder(PIPE.x - 150 + 60 * (1 - k), PIPE.y0 + 10, lerp(PIPE.x - 400, PIPE.x - 70, k), lerp(PIPE.y0 - 120, PIPE.y0 - 620, k)) + inner; }
  const S = dhalaan(t, cam, { rowInner: gillHouse(t, { broken: 1, ballOn: t < RZ.bUp + .5, clamp: t < RZ.snap ? 1 : 2, pipeAng: ang, inner, id: 'r' }) });
  let g = S.back;
  const happy = t > RZ.pup + .3;
  g += onLane(1, cam, 1800, dharmK, { s: SKR, t, move: happy ? 'celebrate' : (t > RZ.grab ? 'scared' : 'holdHead'), mt: t, yaw: -.4, expr: happy ? 'happy' : 'scared' }, { w: 100 });
  g += onLane(1, cam, 2000, dadaAbu, { s: SKR, t, move: happy ? 'clap' : 'scared', mt: t, yaw: -.4, expr: happy ? 'happy' : 'scared' }, { w: 110 });
  if (t > RZ.amIn - .2) {
    const k = ease(seg(t, RZ.amIn, RZ.amAt)), ax = lerp(2400, 1380, k), m1 = on('m1', t, .1, .3);
    g += onLane(1, cam, ax, ammar, { s: SKR, t, move: k < 1 ? 'run' : (m1 ? 'talk' : 'thumbsUp'), mt: t, yaw: k < 1 ? -Math.PI / 2 * .8 : -.5, expr: m1 ? 'happy' : 'determined', amp: amp('AMMAR') }, { w: 110 });
    if (k < 1) { const p = proj(1, cam, ax, G(ax) - 330); g += `<g transform="translate(${p.x},${p.y}) rotate(-8) scale(${p.s})">${ladder(-260, 0, 260, -10, 60)}</g>` + dust(proj(1, cam, ax + 60, G(ax) + 40).x, proj(1, cam, ax, G(ax) + 40).y, (t * 2.4) % 1, 5, 40); }
  }
  const BL = 860, SX = BL + 230;
  let sx, sy, sc, rot = 0, arms = [150, 150], mouth = 'grin', flip = 1, carry = 0;
  if (t < RZ.arrive) {
    const k = eout(seg(t, 0, RZ.arrive)), p1 = proj(1.3, cam, PIPE.x + 330, hp0.y + 330);
    sx = lerp(-140, p1.x, k); sy = lerp(80, p1.y, k); sc = lerp(.3, SF * p1.s, k); rot = lerp(35, 0, k); mouth = on('q3', t) ? 'talk' : 'shout';
  } else if (t < RZ.slow) {
    const p1 = proj(1.3, cam, PIPE.x + 330, hp0.y + 330); sx = p1.x + 10 * Math.sin(t * 4); sy = p1.y + 14 * Math.sin(t * 3); sc = SF * p1.s;
    arms = [150, 172]; flip = -1; mouth = t > RZ.snap ? 'shout' : 'grin';
    if (t > RZ.snap) { const k = seg(t, RZ.snap, RZ.snap + .4); sx -= 40 * Math.sin(k * Math.PI); }
  } else if (t < RZ.grab) {
    const k = ease(seg(t, RZ.slow, RZ.grab)), p0 = proj(1.3, cam, PIPE.x + 330, hp0.y + 330), bp = basimFall(t, cam);
    sx = lerp(p0.x, bp.x + 60 * bp.s, k); sy = lerp(p0.y, bp.y + 120 * bp.s, k); sc = lerp(SF * p0.s, SF * bp.s, k); rot = lerp(0, 40, Math.sin(k * Math.PI)); flip = -1; arms = [175, 175]; mouth = 'shout';
  } else if (t < RZ.land) {
    const bp = basimFall(RZ.grab, cam), pp = pipePt(GHH * .62, ang), pc = proj(1.3, cam, pp.x + 40, pp.y + 210);
    const k1 = eout(seg(t, RZ.grab, RZ.pcatch - .2)), k2 = ease(seg(t, RZ.pup, RZ.land));
    const pl = proj(1, cam, SX, G(SX) - 60);
    sx = lerp(lerp(bp.x + 60 * bp.s, pc.x, k1), pl.x, k2); sy = lerp(lerp(bp.y + 120 * bp.s, pc.y, k1), pl.y, k2) + 10 * Math.sin(t * 4); sc = lerp(SF * bp.s, SF * pl.s, k2);
    flip = -1; arms = t > RZ.pcatch - .25 && t < RZ.pup + .2 ? [120, 178] : [120, 140]; carry = 1; mouth = on('q4', t) ? 'talk' : (t > RZ.pcatch - .3 && t < RZ.pup ? 'shout' : 'grin');
  } else if (t < RZ.bUp) {
    const pl = proj(1, cam, SX, G(SX) - 60); sx = pl.x + 6 * Math.sin(t * 3); sy = pl.y + 12 * Math.sin(t * 4); sc = SF * pl.s; flip = -1; arms = [40, 140]; mouth = 'grin';
  } else if (t < RZ.bBack) {
    const k = seg(t, RZ.bUp, RZ.bBack), pl = proj(1, cam, SX, G(SX) - 60), pc = proj(1.3, cam, WINX + 150, CHJ.y + 230);
    const u = k < .5 ? ease(k * 2) : 1 - ease((k - .5) * 2); sx = lerp(pl.x, pc.x, u); sy = lerp(pl.y, pc.y, u); sc = lerp(SF * pl.s, SF * pc.s, u); arms = [150, 170]; flip = -1; rot = 10 * Math.sin(k * Math.PI * 2);
  } else if (t < RZ.off) {
    const pl = proj(1, cam, SX, G(SX) - 60); sx = pl.x + 6 * Math.sin(t * 3); sy = pl.y + 12 * Math.sin(t * 4); sc = SF * pl.s; flip = -1; arms = [40, on('q5', t, .1, .5) ? 120 : 150]; mouth = on('q5', t) ? 'talk' : 'grin';
  } else { const k = seg(t, RZ.off, D), pl = proj(1, cam, SX, G(SX) - 60); sx = pl.x + 500 * k * k; sy = pl.y - 1500 * k * k; sc = SF * pl.s; rot = 25 * k; arms = [150, 150]; }
  if (t >= RZ.land) {
    const b5 = on('b5', t, .1, .3);
    g += onLane(1, cam, BL, basim, { s: SKR, t, move: b5 ? 'thumbsUp' : (on('q5', t) ? 'listen' : 'idle'), mt: t, yaw: .4, expr: t > LS('q5') + .6 ? 'happy' : 'surprised', amp: amp('BASIM') }, { w: 90 });
    if (t > RZ.bBack + .6) { const p = proj(1, cam, BL + 70, G(BL) - 120); g += cball(p.x, p.y, 20 * p.s, 0); }
  }
  if (t >= RZ.slip && t < RZ.grab) { const bp = basimFall(t, cam); g += basim({ x: bp.x, y: bp.y + HANG * .9 * bp.s, s: .9 * bp.s, t, move: 'idle', mt: t, yaw: .2, expr: 'scared', pose: p2 => { p2.armL.ab = p2.armR.ab = 2.6 + .2 * Math.sin(t * 6); p2.armL.el = p2.armR.el = .3; p2.legL.sw = .5 * Math.sin(t * 5); p2.legR.sw = -.5 * Math.sin(t * 5); p2.legL.kn = .7; } }); }
  if (t < RZ.arrive) g += `<path d="M${sx - 260 * sc},${sy + 60} L${sx},${sy}" stroke="${C.gold}" stroke-width="${30 * sc / .6}" stroke-linecap="round" opacity="${(.5 * (1 - seg(t, RZ.arrive - .5, RZ.arrive))).toFixed(2)}"/>`;
  g += susuFly(sx, sy, sc, t, { flip, rot, armL: arms[0], armR: arms[1], mouth, amp: amp('QASIM'), wink: t > RZ.off - .6 && t < RZ.off ? 1 : 0 });
  if (carry) { const bs = sc / SF; g += basim({ x: sx + 40 * bs, y: sy - 30 * bs, s: .78 * bs, t, move: 'idle', mt: t, yaw: .3, expr: t > LE('q4') ? 'happy' : 'scared', amp: amp('BASIM'), pose: p2 => { p2.armL.ab = 1.2; p2.armR.ab = 1.2; p2.legL.sw = .9; p2.legR.sw = .9; p2.legL.kn = 1.1; p2.legR.kn = 1.1; } }); }
  if (t > RZ.bUp + .5 && t < RZ.bBack + .6) { const hh = susHand(sx, sy, sc, arms[1], 1, flip); g += cball(hh[0], hh[1], 22 * sc / SF, t * 400); }
  g += S.front;
  if (t > RZ.snap - .05 && t < RZ.snap + 1.2) { const k = back(seg(t, RZ.snap, RZ.snap + .25)), pp = pipePt(GHH * .85, ang), p = proj(1.3, cam, pp.x, pp.y); g += `<g transform="translate(${clamp(p.x, 220, 860)},${clamp(p.y, 260, 1100)}) scale(${k})">${burst(0, 0, 170, '#fff', 'KRAAAK!', 66, -8, 1 - seg(t, RZ.snap + .9, RZ.snap + 1.2))}</g>`; }
  if (on('b4', t, .1, .3)) g += hookBig('PIPE', 'TOOT RAHA HAI!', t, LS('b4') + .2, LS('b4') + .5, 260);
  if (SLOW) { const k = seg(t, RZ.slow, RZ.slow + .3) * (1 - seg(t, RZ.grab, RZ.grab + .2)); g += `<rect width="1080" height="1920" fill="#0a2a4a" opacity="${(.22 * k).toFixed(2)}"/>` + vig(.8 * k) + T(540, 560, 74, 'SLOW-MO...', { fill: '#bfe8ff', shadow: '#000', op: k }); }
  if (on('q4', t, .1, .5)) g += `<g transform="translate(830,300) scale(${back(seg(t, LS('q4'), LS('q4') + .25))})">${burst(0, 0, 140, C.gold, 'PAKAD LIYA!', 48, 5, 1)}</g>`;
  if (t > LE('q4') + .1 && t < RZ.pcatch) { const pp = pipePt(GHH * .96, ang), p = proj(1.3, cam, pp.x, pp.y); g += marker(p.x, p.y, 110 * p.s * 1.3, t, C.red, '') + T(540, 600, 70, 'PIPE GIR RAHA HAI!', { fill: '#fff', shadow: C.red }); }
  if (t > RZ.pcatch - .05 && t < RZ.pcatch + 1.0) { const k = back(seg(t, RZ.pcatch, RZ.pcatch + .2)); g += `<g transform="translate(300,520) scale(${k})">${burst(0, 0, 130, C.gold, 'THAAM LIYA!', 44, -6, 1 - seg(t, RZ.pcatch + .7, RZ.pcatch + 1.0))}</g>`; }
  if (on('m1', t, .1, .3)) g += hookBig('AMMAR CHACHA', 'SEEDHI LAAYE!', t, LS('m1') + .3, LS('m1') + .6, 270);
  if (on('q5', t, .1, .3)) g += hookBig('AB', 'SACH BOLNA!', t, LS('q5') + .8, LS('q5') + 1.1, 270);
  if (on('b5', t, .1, .4)) g += `<g transform="translate(540,640) scale(${back(seg(t, LS('b5'), LS('b5') + .3))})">${burst(0, 0, 150, '#fff', 'PAKKA!', 60, 6, 1)}</g>`;
  if (t < RZ.arrive - .2 && t > .2) g += hook2('SUUSUU-MAN AAYA!', t, .3, 330, 92, '#fff');
  g = shake(g, Math.abs(t - RZ.snap) < .4 ? 1 : (Math.abs(t - RZ.pcatch) < .35 ? .8 : (Math.abs(t - RZ.grab) < .25 ? .5 : 0)), t);
  return g + capFor('rescue', t);
}

// ============ 6 SECRET — Officer Gill comes out of his door: "Ab batao, meri khidki kisne todi?"; Basim steps forward: "Maine todi, Gill Uncle. Sorry! Maine jhooth bola tha." (SACH METER → green);
//   Gill smiles: "Sach bolne wala hi asli bahadur hai! Khidki sab milke theek karenge."; Mama back with Ammar: "Qasim! Kahan the tum?" — "Kuch nahi Mama!";
//   Dada Abu: "Koi SUPERHERO aaya tha… Basim ko hawa mein pakad liya!"; "Achha? Mujhe to suusuu aayi thi!" — Sakina's wink ============
function E_secret(t) {
  const D = sdur('secret'), g3 = on('g3', t, .1, .3), b6 = on('b6', t, .1, .3), g4 = on('g4', t, .1, .3), kt = on('kt', t), kn = on('kn', t), da3 = on('da3', t, .1, .3), q6 = on('q6', t);
  const wk = t > LE('q6') - .2;
  const cam = camKW(t, [[0, camF(900, 1.15, 1200, 540)], [LS('b6') - .2, camF(930, 1.32, 1225, 540), .7], [LS('kt') - .6, camF(560, 1.12, 1200, 540), .9], [LS('da3') - .3, camF(820, .9, 1170, 540), .9], [LS('q6') - .3, camF(560, 1.38, 1235, 520), .7]]);
  const inner = ladder(PIPE.x - 150, PIPE.y0 + 10, PIPE.x - 70, PIPE.y0 - 620);
  const S = dhalaan(t, cam, { rowInner: gillHouse(t, { broken: 1, ballOn: 0, clamp: 2, pipeAng: 0, doorOpen: 1 - seg(t, .6, 1.4), inner, id: 's' }) });
  let g = S.back;
  const gOut = ease(seg(t, 0, .9)), gd = lerp(1.3, 1, gOut), gx = lerp(GDOOR, 820, gOut), gy = lerp(HBg(GDOOR) + 10, G(820) + 40, gOut);
  g += at(gd, cam, gx, gy, officer, { s: SKR * .98, t, move: g3 || g4 ? 'talk' : (t > LE('g4') ? 'thumbsUp' : 'idle'), mt: t, yaw: .5, expr: g4 || t > LE('g4') ? 'happy' : (b6 ? 'surprised' : 'neutral'), amp: amp('OFFICER GILL') }, { w: 110 });
  { const p = proj(gd, cam, gx + 70, gy - 260); g += chaiCup(p.x, p.y, .7 * p.s, -6, 1, t); }
  const step = ease(seg(t, LS('b6') - .3, LS('b6') + .4)) * 70;
  g += onLane(1, cam, 1180, dharmK, { s: SKR, t, move: t > LE('b6') ? 'clap' : 'idle', mt: t, yaw: -.4, expr: t > LE('b6') ? 'happy' : 'neutral' }, { w: 100 });
  g += onLane(1, cam, 990 - step, basim, { s: SKR, t, move: b6 ? 'talk' : (g4 ? 'listen' : (t > LE('g4') ? 'celebrate' : 'idle')), mt: t, yaw: -.4, expr: b6 ? 'sad' : (t > LS('g4') + .5 ? 'happy' : 'scared'), amp: amp('BASIM') }, { w: 90 });
  { const p = proj(1, cam, 990 - step + 46, G(990) - 100); g += cball(p.x, p.y, 18 * p.s, 0); }
  g += onLane(1, cam, DAX, dadaAbu, { s: SKR, t, move: da3 ? 'talk' : (t > LS('kt') ? 'idle' : 'clap'), mt: t, yaw: -.5, expr: 'happy', amp: amp('DADA ABU') }, { w: 110 });
  const mIn = ease(seg(t, LS('kt') - 2.4, LS('kt') - .2)), mx = lerp(1900, 590, mIn);
  if (t > LS('kt') - 2.6) g += at(1, cam, mx, G(mx) + 40, ammi, { s: SAM, t, phone: 0, look: kt ? [-12, -2] : [-10, 2], brow: kt ? .8 : .2, amp: amp('MAMA'), tilt: mIn < 1 ? 4 * Math.sin(t * 12) : 0, blink: blink(t, 2.6), flip: -1 }, { w: 140 });
  const qIn = ease(seg(t, LS('kt') + .2, LS('kn') + .1));
  if (t > LS('kt') + .1) { const z = qIn, qd = lerp(1.3, 1, z), qx = lerp(HOMEX, 420, z), qy = lerp(HB(HOMEX), G(420) + 40, z); g += at(qd, cam, qx, qy, susu, { s: SQ, t, look: kn || q6 ? [12, -4] : [10, -4], mouth: kn || q6 ? 'talk' : 'smirk', amp: amp('QASIM'), wink: t > LE('kn') - .2 && t < LE('kn') + .4 ? 1 : 0, legL: qIn < 1 ? walkK(t, 24) : 0, legR: qIn < 1 ? -walkK(t, 24) : 0, armL: 20, armR: q6 ? 120 : 20, blink: blink(t) }, { w: 110 }); }
  if (t > LS('kt') - .5) g += onLane(1, cam, 270, sakina, { s: SKR, t, move: wk ? 'thumbsUp' : 'idle', mt: t - LE('q6') + .2, yaw: wk ? 0 : .4, expr: wk ? 'wink' : 'happy' }, { w: 100 });
  g += S.front;
  if (g3) g += hook2('KISNE TODI?', t, LS('g3') + .3, 300, 110, '#fff');
  if (b6) g += jhoothMeter(760, 470, back(seg(t, LS('b6') + .3, LS('b6') + .6)), .95 * (1 - ease(seg(t, LS('b6') + .8, LE('b6') - .3))), t, 'SACH METER') + (t > LE('b6') - .6 ? T(540, 700, 100, 'SACH BOLA!', { fill: '#22a35a', shadow: '#000', op: seg(t, LE('b6') - .6, LE('b6') - .4) }) : '');
  if (g4) { g += hookBig('ASLI', 'BAHADUR!', t, LS('g4') + .4, LS('g4') + .7, 270); const p = proj(1, cam, 920, G(920) - 420); g += heart(p.x - 60, p.y - 60 * seg(t, LS('g4'), LE('g4')), .8) + heart(p.x + 60, p.y - 30 - 70 * seg(t, LS('g4'), LE('g4')), .6); }
  if (kn) g += shhh(900, 560, back(seg(t, LS('kn'), LS('kn') + .3)) * .9);
  if (da3) g += hookBig('KOI', 'SUPERHERO?!', t, LS('da3') + .4, LS('da3') + .7, 250);
  if (wk) g += T(540, 400, 96, 'SHHH... RAAZ!', { fill: C.gold, shadow: '#000', op: clamp((t - LE('q6') + .2) * 3) * (1 - seg(t, D - .3, D)) });
  return g + capFor('secret', t);
}

// ============ 7 CLIFFHANGER — "AGLE EPISODE MEIN…": Dadi's birthday in the aangan, the big cake tips off the table; Dadi: "Arre arre! Mera cake gir raha hai!" ============
function E_cliff(t) {
  const D = sdur('cliff');
  const cam = { x: 200 + 30 * t, y: -20, z: 1.12 + .06 * t, px: 540, py: 900 };
  const S = aangan(t, cam, { manoSleep: 0 });
  let g = S.back;
  const tx = 560, ty = 1180;
  { const p = proj(1, cam, tx, ty), s = p.s; g += castShadow(p.x, p.y + 6, 300 * s, 80 * s, .2) + `<g transform="translate(${p.x},${p.y}) scale(${s})"><rect x="-190" y="-170" width="380" height="24" fill="#fff" stroke="${C.ink}" stroke-width="5"/><path d="M-190,-146 q30,30 60,0 q30,30 60,0 q30,30 60,0 q30,30 60,0 q30,30 60,0 q30,30 70,0" fill="#ffd34a" stroke="${C.ink}" stroke-width="4"/><rect x="-170" y="-146" width="18" height="146" fill="#8a5a32" stroke="${C.ink}" stroke-width="4"/><rect x="152" y="-146" width="18" height="146" fill="#8a5a32" stroke="${C.ink}" stroke-width="4"/></g>`;
    const k = ease(seg(t, .1, D - .4)) * .9; g += cake(p.x + (120 + 140 * k) * s, p.y - (170 - 80 * k * k) * s, .9 * s, 50 * k, t); }
  g += at(1, cam, tx - 230, ty + 20, dadi, { s: SKR, t, move: 'scared', mt: t, yaw: .5, expr: 'scared', amp: amp('DADI') }, { w: 110 });
  g += S.front;
  g += `<rect width="1080" height="1920" fill="#000" opacity=".22"/>` + vig(.9);
  g += `<g transform="translate(540,${WIDE ? 310 : 300}) scale(${back(seg(t, 0, .3)) * (WIDE ? 1.2 : 1)}) rotate(-3)">${T(0, 0, 100, 'AGLE EPISODE', { shadow: '#000', sw: 11 })}${T(0, 130, 120, 'MEIN...', { fill: C.gold, shadow: C.red, sw: 12 })}</g>`;
  if (t > .3) g += T(540, WIDE ? 610 : 560, 60, 'DADI KA CAKE!', { fill: '#fff', shadow: '#c2185b', op: seg(t, .3, .6) });
  g = shake(g, .3, t);
  const f2 = seg(t, D - .25, D); if (f2 > 0) g += `<rect width="1080" height="1920" fill="#fff" opacity="${f2}"/>`;
  return g + capFor('cliff', t);
}

// ============ 8 END SCREEN — the narrator's lesson (big), then LIKE + SUBSCRIBE; Susuman waving with Basim (bat + ball) ============
const NV = 4.2;   // "Video achhi lagi…" starts this far into n3
function lessonCard(t, x, y, s) {
  const k = back(seg(t, .3, .6)), out = 1 - seg(t, LS('n3') + NV - .2, LS('n3') + NV + .2);
  return k > 0 && out > 0 ? `<g transform="translate(${x},${y}) scale(${(k * s).toFixed(3)}) rotate(-2)" opacity="${out.toFixed(2)}">${T(0, 0, 80, 'GALTI HO TO SACH BOLO!', { fill: C.gold, shadow: C.red, sw: 11 })}${T(0, 96, 56, 'pipe par kabhi mat chadho', { fill: '#fff', shadow: '#000', sw: 8 })}</g>` : '';
}
function E_endcard(t) {
  const cam = { x: 30 * Math.sin(t * .4), y: 0, z: 1 + .05 * t / sdur('endcard') };
  let g = layer(4, cam, brushBg(t + 90), { f: '' });
  g += layer(1, cam, shadow(330, 1255, 200, .8) + lightPool(330, 1250, 380, 70, .8) + susu({ x: 330, y: 1250, s: .85, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 30, armR: 150 + 18 * Math.sin(t * 7), mouth: 'grin', blink: blink(t, 2.6) }) + shadow(760, 1250, 110, .7) + bat(840, 1110, .9, 20) + basim({ x: 760, y: 1250, s: 1.15, t, move: 'wave', mt: t, yaw: -.3, expr: 'happy' }) + cball(600, 1225, 24, t * 200), { f: '' });
  let sp = ''; for (let i = 0; i < 9; i++) { const x = ((i * 157 + t * 60) % 1300) - 110, y = 200 + (i * 211) % 1500; sp += `<path d="M${x},${y - 40} L${x + 10},${y} L${x},${y + 40} L${x - 10},${y}Z M${x - 40},${y} L${x},${y - 10} L${x + 40},${y} L${x},${y + 10}Z" fill="${C.gold}" opacity=".8"/>`; }
  g += layer(.6, cam, sp);
  g += lessonCard(t, 540, 300, 1);
  const lk = LS('n3') + NV, k = back(seg(t, lk, lk + .3)), clicked = t > lk + 3.0;
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
  g += shadow(300, 1000, 220, .8) + lightPool(300, 995, 400, 70, .8) + susu({ x: 300, y: 995, s: .74, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 30, armR: 150 + 18 * Math.sin(t * 7), mouth: 'grin', blink: blink(t, 2.6) }) + shadow(700, 1000, 100, .7) + bat(770, 880, .8, 20) + basim({ x: 700, y: 1000, s: 1.0, t, move: 'wave', mt: t, yaw: -.3, expr: 'happy' }) + cball(560, 980, 22, t * 200);
  const lk = LS('n3') + NV;
  g += lessonCard(t, 960, 140, .95);
  if (t > lk) g += `<g transform="translate(470,140) scale(${back(seg(t, lk, lk + .3))}) rotate(-3)">${T(0, 0, 76, 'LIKE aur SUBSCRIBE', { shadow: '#000' })}${T(0, 86, 70, 'KARO!', { fill: C.gold, shadow: C.red })}</g>`;
  const bk = back(seg(t, lk - .2, lk + .3));
  g += `<g opacity="${clamp(bk).toFixed(2)}"><rect x="1010" y="230" width="800" height="450" rx="26" fill="#000" opacity=".28" stroke="#fff" stroke-width="6" stroke-dasharray="26 14"/><circle cx="1410" cy="870" r="140" fill="#000" opacity=".28" stroke="#fff" stroke-width="6" stroke-dasharray="26 14"/></g>`;
  let sp = ''; for (let i = 0; i < 7; i++) { const x = ((i * 257 + t * 60) % 2100) - 90, y = 120 + (i * 151) % 850; sp += `<path d="M${x},${y - 30} L${x + 8},${y} L${x},${y + 30} L${x - 8},${y}Z M${x - 30},${y} L${x},${y - 8} L${x + 30},${y} L${x},${y + 8}Z" fill="${C.gold}" opacity=".7"/>`; }
  return g + sp;
}
function drawCastG() {
  const lab = (x, y, s) => T(x, y, 34, s, { fill: '#555', sw: 0, font: 'Baloo2', weight: 800 });
  let g = `<rect width="1080" height="1920" fill="#f3ead9"/>` + T(540, 100, 70, 'SUSUMAN EP 12 — NEW PROPS', { fill: C.ink, sw: 0 });
  g += cball(150, 300, 40, 20) + bat(330, 330, 1.2, 30) + stumps(560, 380, 1.3) + chaiCup(760, 330, 1.6, 0, 1, .3) + lab(480, 460, 'ball · bat · stumps · chai');
  g += `<g transform="translate(-200,-150) scale(.9)">${gillHouse(.3, { broken: 1, gill: 1, cup: 1, ballOn: 1, clamp: 1, inner: basimPipe(.3, HB_H, 0, { kick: 1 }) })}</g>` + lab(540, 1120, "Officer Gill's house: window · chhajja · old pipe");
  g += jhoothMeter(300, 1400, .9, .9, 0) + cake(780, 1500, .9, 0, .2) + lab(540, 1620, 'jhooth meter · Dadi ka cake (Ep 13)');
  g += ladder(200, 1880, 520, 1700) + lab(700, 1820, 'Ammar ki seedhi');
  return g;
}
