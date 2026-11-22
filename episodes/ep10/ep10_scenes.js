// Episode 10 "School Ka Pehla Din" — scenes (RETENTION STRUCTURE, Nov 18 2026: frame 0 = the runaway school van, no narrator before the flush).
// 2.5D: the dhalaan gali (dhalaan(): sky · clouds · far city + kites · mid roofs · house row 1.3 · street 1 · foreground .62) and the aangan;
// characters go in at a depth with at()/proj(); the van is drawn on the lane through the same camera (vanAt).
const LS = id => L(id).s, LE = id => L(id).s + L(id).d;
const sdur = id => TL.scenes.find(s => s.id === id).dur;
const SQ = .55 * KS, SAM = .92, SKR = 1.0;
const on = (id, t, a = .1, b = .15) => t > LS(id) - a && t < LE(id) + b;
const lerpCam = (a, b, k) => ({ x: lerp(a.x || 0, b.x || 0, k), y: lerp(a.y || 0, b.y || 0, k), z: lerp(a.z ?? 1, b.z ?? 1, k), px: lerp(a.px ?? 540, b.px ?? 540, k), py: lerp(a.py ?? 960, b.py ?? 960, k) });
const susHand = (x, y, s, ang, side = 1, flip = 1) => [x + flip * s * side * (98 + 158 * Math.sin(ang * Math.PI / 180)), y + s * (-312 + 158 * Math.cos(ang * Math.PI / 180))];
const vig = op => `<rect width="1080" height="1920" fill="url(#vig)" opacity="${op}"/>`;
const walkK = (t, f = 26) => Math.sin(t * f) * 26;
function inset(cx, cy, r, content, id) {
  return `<clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><g clip-path="url(#${id})">${content}</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-width="10"/><circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="none" stroke="${C.ink}" stroke-width="4"/>`;
}
const marker = (x, y, r, t, col = C.red, label = '') => `<circle cx="${x}" cy="${y}" r="${r + 6 * Math.sin(t * 7)}" fill="none" stroke="${col}" stroke-width="9" opacity=".9"/>` + (label ? T(clamp(x, 160, 920), y - r - 30, 54, label, { fill: '#fff', shadow: col }) : '');
function fountain(fx, fy, s, t, k, puddleY, op = 1) {
  if (k <= 0) return '';
  let g = '';
  for (const side of [-1, 1]) for (let i = 0; i < 9; i++) {
    const p = ((t * 1.6 + i / 9) % 1), vx = side * (260 + 60 * hs(i + side * 7)) * s * k, vy = -240 * s * k;
    const x = fx + side * 26 * s + vx * p, y = fy + vy * p + 900 * s * p * p;
    if (y > puddleY) continue;
    g += `<path d="M${x.toFixed(1)},${(y - 16 * s).toFixed(1)} q${(10 * s).toFixed(1)},${(16 * s).toFixed(1)} 0,${(26 * s).toFixed(1)} q${(-10 * s).toFixed(1)},${(-10 * s).toFixed(1)} 0,${(-26 * s).toFixed(1)}Z" fill="#7fd0ff" stroke="#2f7fd6" stroke-width="${(2.5 * s).toFixed(1)}" opacity="${(op * (1 - p * .3)).toFixed(2)}"/>`;
  }
  for (const side of [-1, 1]) g += `<path d="M${fx + side * 26 * s},${fy} q${side * 140 * s * k},${-120 * s * k} ${side * 280 * s * k},${200 * s}" stroke="#9adcff" stroke-width="${(14 * s).toFixed(1)}" fill="none" stroke-linecap="round" opacity="${(.75 * op).toFixed(2)}"/>`;
  return g;
}
const puddle = (x, y, s, k) => k > 0 ? `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(260 * s * k).toFixed(1)}" ry="${(40 * s * k).toFixed(1)}" fill="#8fd6ff" stroke="#2f7fd6" stroke-width="4" opacity=".8"/><ellipse cx="${(x - 60 * s * k).toFixed(1)}" cy="${(y - 8 * s * k).toFixed(1)}" rx="${(60 * s * k).toFixed(1)}" ry="${(10 * s * k).toFixed(1)}" fill="#fff" opacity=".6"/>` : '';
function violin(x, y, t, op) { if (op <= 0) return ''; let g = `<g opacity="${op.toFixed(2)}" transform="translate(${x},${y}) rotate(-25)"><path d="M0,-70 q34,0 30,34 q-12,14 0,30 q8,44 -30,46 q-38,-2 -30,-46 q12,-16 0,-30 q-4,-34 30,-34Z" fill="#a0522d" stroke="${C.ink}" stroke-width="5"/><path d="M0,-70 v-80" stroke="#3a2416" stroke-width="10"/><path d="M-60,${-20 + 14 * Math.sin(t * 6)} L80,${-60 + 14 * Math.sin(t * 6)}" stroke="#e9d9b0" stroke-width="5"/></g>`; return g + notes(x + 80, y - 80, t); }
function shhh(x, y, k) {
  if (k <= 0) return '';
  return `<g transform="translate(${x},${y}) scale(${k})"><circle r="78" fill="${C.gold}" stroke="${C.ink}" stroke-width="7"/><circle cx="-24" cy="-14" r="8" fill="${C.ink}"/><circle cx="24" cy="-14" r="8" fill="${C.ink}"/><path d="M-22,30 Q0,22 22,30" stroke="${C.ink}" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="-9" y="-6" width="18" height="70" rx="9" fill="#c98b5c" stroke="${C.ink}" stroke-width="5"/>${T(0, 118, 40, 'RAAZ!', { fill: '#fff', shadow: '#000' })}</g>`;
}
const susuFly = (x, y, sc, t, o = {}) => susu(Object.assign({ x, y, s: sc, t, power: .9, cape: 1, crown: 1, shades: 1, armL: 150, armR: 150, legL: -22, legR: 12, mouth: 'grin', blink: blink(t, 3) }, o));
const hook2 = (txt, t, a, y = 300, size = 120, col = C.gold) => { const k = back(seg(t, a, a + .3)); return k > 0 ? `<g transform="translate(540,${y}) scale(${k.toFixed(3)}) rotate(-3)">${T(0, 0, size, txt, { fill: col, shadow: C.red, sw: 12 })}</g>` : ''; };
const onLane = (d, cam, x, fn, o, sh = { w: 90 }, dy = 0) => at(d, cam, x, G(x) + 40 + dy, fn, o, sh);
const Q = (cam, x, o, sh = { w: 110 }, dy = 0) => onLane(1, cam, x, susu, Object.assign({ s: SQ, t: 0, blink: 0 }, o), sh, dy);
// camera keyframes: [[t, camG args...]] eased between
const camF = (wx, z = 1, feetY = 1170, sx = 540) => camG(wx, z, feetY, sx, -40);   // puts the feet line (G+40) of world x at screen y feetY
function camK(t, K) {
  let c = camF(...K[0][1]);
  for (let i = 1; i < K.length; i++) { const [t0, a0, dur = .8] = K[i]; c = lerpCam(c, camF(...a0), ease(seg(t, t0, t0 + dur))); }
  return c;
}
const HB = x => GB - 165 + SL * Math.min(x, XR);       // house-row ground (d=1.3 coords)

// ======================= EPISODE 10 — "School Ka Pehla Din" =======================
// where everyone is at the top of the lane (action plane x)
const MX = 160, SKX = 470, QX0 = 330, PARKV = 640;
// the van's world x across the opening scenes (absolute time) — it keeps rolling while we cut away
function vanX(a) {
  const c = TL.scenes.find(s => s.id === 'cold'), w = TL.scenes.find(s => s.id === 'why');
  if (a < c.dur) return 760 + 120 * a + 5 * a * a;
  return 760 + 120 * c.dur + 5 * c.dur * c.dur + 22 * (a - c.dur);
}
// little circle inset: the van still rolling down the lane (with Ammar's khadda ahead)
function vanInset(t, k, cx = 830, cy = 600, r = 175, id = 'insV', zoomOnNoor = 0) {
  if (k <= 0) return '';
  const vx = vanX(ABS);
  const ic = zoomOnNoor ? camG(vx - 40, 1.6, cy + 250, cx, 300) : camG(vx + 380, .42, cy + 60, cx, 120);
  const sub = dhalaan(t, ic, { motes: false, noPump: 1, noBoug: 1, inner: khadda(t) });
  return inset(cx, cy, r * back(k), sub.back + vanAt(ic, vx, t, { wob: 1, noorMood: 'cry' }) + (zoomOnNoor ? '' : onLane(1, ic, 2990, ammar, { s: SKR, t, move: 'shout', mt: t, yaw: -.4, expr: 'scared' }, { w: 0 })), id);
}

// ============ 1 COLD OPEN (0 s) — the yellow school van is already rolling down the dhalaan, nobody at the wheel, kids screaming in the windows.
//   Basim on the kerb: "Arre! School van apne aap chal padi!"; Baba sprints in from uphill (the driver puffing behind): "Andar bachche hain! Koi roko!" ============
function E_cold(t) {
  const D = sdur('cold'), vx = vanX(t), b1s = LS('b1');
  // camera: tight on the van's windows (screaming kids) → pull out and track down the lane → whip back uphill to Baba
  let cam = camG(vx + 30, 1.45, 800, 560, 330);
  cam = lerpCam(cam, camF(vx + 240, 1.0, 1150, 520), ease(seg(t, .9, 2.2)));
  cam = lerpCam(cam, camF(vx - 150, 1.0, 1170, 560), ease(seg(t, b1s - .5, b1s + .3)));
  const S = dhalaan(t, cam, { inner: khadda(t) });
  let g = S.back;
  // Basim on the kerb near the neem (downhill), jumping + pointing
  const BXc = 1420, bvOn = on('bv', t);
  g += onLane(1.08, cam, BXc, basim, { s: SKR, t, move: bvOn ? 'point' : 'scared', mt: t, yaw: -.5, expr: 'scared', amp: amp('BASIM') }, { w: 90 }, -10 - 24 * Math.abs(Math.sin(t * 8)) * (bvOn ? 1 : .3));
  // Baba + the driver run after the van (adults chase; the kids stay on the kerb)
  const bb = ease(seg(t, b1s - 1.0, D)), bxx = lerp(vx - 900, vx - 520, bb);
  g += onLane(1.0, cam, bxx - 230, driver, { s: SKR, t, move: 'run', mt: t * 1.1, yaw: Math.PI / 2, expr: 'scared' }, { w: 110 });
  g += onLane(1.04, cam, bxx, baba, { s: SKR, t, move: on('b1', t, .1, .3) ? 'shout' : 'run', mt: t, yaw: on('b1', t, .1, .3) ? .6 : Math.PI / 2, expr: 'scared', amp: amp('BABA') }, { w: 110 });
  // the van: rattling, roof light flashing, kids screaming
  g += vanAt(cam, vx, t, { wob: 1, mood: 'scream', noorMood: 'cry' });
  { const p = vanPt(cam, vx, t, { wob: 1 }, -380, -60); g += speed(p.x - 40, p.y - 120 * p.s, 1, .7, 5) + dust(p.x - 30, p.y + 20, (t * 2.3) % 1, 6, 50 * p.s); }
  { const p = vanPt(cam, vx, t, { wob: 1 }, 270, -330); if (t > .25) g += T(p.x, p.y - 210 * p.s, 46 * clamp(p.s * 1.6, .7, 1.4), 'KHAALI SEAT!', { fill: '#fff', shadow: C.red, op: seg(t, .25, .45) * (1 - seg(t, 2.6, 2.9)) }); }
  for (let i = 0; i < 3; i++) { const p = vanPt(cam, vx, t, { wob: 1 }, -310 + i * 300, -470); g += burst(p.x, p.y - 30, 58 * clamp(p.s * 1.8, .6, 1.3), '#fff', ['AAA!', 'BACHAO!', 'AAA!'][i], 26, i * 8 - 8, seg(t, .1 + i * .12, .3 + i * .12) * (1 - seg(t, 3.2, 3.6))); }
  g += S.front;
  // hook text ON SCREEN FROM FRAME 0 (already big), ~2.4 s
  const hk = t < 2.6 ? (t < .12 ? .85 + t : back(seg(t, -.1, .2))) * (1 - seg(t, 2.3, 2.6)) : 0;
  if (hk > 0) g += `<g transform="translate(540,${WIDE ? 280 : 260}) scale(${(hk * (WIDE ? 1.4 : 1)).toFixed(3)}) rotate(-3)">${T(0, 0, 130, 'VAN', { shadow: '#000', sw: 13 })}${T(0, 140, 150, 'BHAAGI!', { fill: C.gold, shadow: C.red, sw: 14 })}</g>`;
  if (t > 2.9) g += marker(...(() => { const p = vanPt(cam, vx, t, { wob: 1 }, -10, -250); return [p.x, p.y, 230 * p.s * 1.4, t, C.red, 'BACHCHE ANDAR!']; })());
  g = shake(g, t < .25 ? .9 * (1 - t / .25) : .25, t);
  return g + capFor('cold', t);
}

// ============ 2 WHY — at the top of the lane: Mama, Sakina, Qasim (new school bag) at the blue door: "Driver bhai ghanti bajane utre…";
//   crane down the whole lane to the bottom: Ammar mistri at his open naali khadda: "Ruko! Neeche khadda khula hai!"; back to Qasim: "…van mein ek bachchi ro rahi hai!" ============
function E_why(t) {
  const D = sdur('why'), a1 = on('a1', t), m1 = on('m1', t, .2, .4), q1 = on('q1', t), vx = vanX(ABS);
  const cam = camK(t, [[0, [QX0 + 40, 1.12, 1180]],
    [LS('m1') - .55, [2050, .5, 1040], .75],
    [LE('m1') + .1, [QX0 + 30, 1.32, 1190], .7]]);
  const S = dhalaan(t, cam, { inner: khadda(t) });
  let g = S.back;
  // the family at the top
  g += at(1, cam, MX, G(MX) + 40, ammi, { s: SAM, t, phone: 0, look: a1 ? [12, 0] : [14, 4], brow: a1 ? 1 : .6, amp: amp('MAMA'), tilt: a1 ? 3 * Math.sin(t * 6) : 0, blink: blink(t, 2.7) }, { w: 140 });
  g += onLane(1, cam, SKX, sakina, { s: SKR, t, move: 'holdHead', mt: t, yaw: .5, expr: 'scared' }, { w: 100 });
  const qL = q1 ? [10, -4] : [14, 2];
  g += Q(cam, QX0, { t, look: qL, mouth: q1 ? 'talk' : 'o', amp: amp('QASIM'), brow: 1, armL: q1 ? 60 : 20, armR: q1 ? 120 : 20, blink: blink(t) });
  { const p = proj(1, cam, QX0 - 85 * SQ, G(QX0) + 40 - 200 * SQ); g += schoolBag(p.x, p.y, .55 * p.s, -8); }
  // the van down the lane, Baba + driver behind it
  g += onLane(1.0, cam, vx - 520, baba, { s: SKR, t, move: 'run', mt: t, yaw: Math.PI / 2, expr: 'scared' }, { w: 110 }) + onLane(1.0, cam, vx - 760, driver, { s: SKR, t, move: 'run', mt: t * 1.1, yaw: Math.PI / 2, expr: 'scared' }, { w: 110 });
  g += vanAt(cam, vx, t, { wob: 1, mood: 'scream', noorMood: 'cry' });
  // Ammar mistri at the khadda (downhill), shovel, waving both arms
  g += onLane(1, cam, 2990, ammar, { s: SKR, t, move: m1 ? 'shout' : 'scared', mt: t, yaw: -.5, expr: m1 ? 'shout' : 'scared', amp: amp('AMMAR') }, { w: 110 });
  g += S.front;
  if (m1) { const p = proj(1, cam, KHX - 120, G(KHX) + 20); g += marker(p.x, p.y, 120, t, C.red, 'KHADDA!'); }
  if (t < LS('m1') - .6) g += vanInset(t, seg(t, LS('a1') + .4, LS('a1') + .8), 830, 600, 175, 'insW');
  if (q1) g += vanInset(t, seg(t, LS('q1') + .3, LS('q1') + .7), 820, 620, 190, 'insN', 1) + T(820, 860, 52, 'NANHI BACHCHI!', { fill: '#fff', shadow: C.red, op: seg(t, LS('q1') + .6, LS('q1') + .9) });
  if (t > LS('a1') + .5 && t < LS('m1') - .5) g += hook2('HANDBRAKE CHHOOT GAYA!', t, LS('a1') + .5, 300, 74, '#fff');
  if (t > LS('m1') + .3 && t < LE('m1') + .2) g += hookBig('AAGE', 'KHADDA HAI!', t, LS('m1') + .3, LS('m1') + .6, 280);
  return g + capFor('why', t);
}

// ============ 3 GAG — "Mama! Suusuu aayi hai!" → "Phir se?!" (counter) → "main saath chalti hoon" → Sakina cries: her tiffin is in the van → Mama gives in → wink, "Jaa jaldi!" → Qasim zips in at the blue door ============
function E_gag(t) {
  const D = sdur('gag'), k2s = LS('k2'), a3s = LS('a3'), jjs = LS('jj');
  const cryK = seg(t, k2s - .1, k2s + .4) * (1 - seg(t, a3s + .5, a3s + .9)), grin = t > a3s + .6;
  const zip = seg(t, LE('jj') - .05, LE('jj') + 1.0);
  let cam = camF(320, 1.15, 1180);
  cam = lerpCam(cam, camF(430, 1.4, 1200), ease(seg(t, k2s - .3, k2s + .5)) * (1 - ease(seg(t, a3s, a3s + 1))));
  cam = lerpCam(cam, camF(240, 1.22, 1185), ease(seg(t, LE('jj') - .3, LE('jj') + .4)));
  const S = dhalaan(t, cam, { inner: khadda(t) });
  let g = S.back;
  const qs = on('qs', t), pf = on('pf', t), a2 = on('a2', t), k2 = on('k2', t, .1, .3), a3 = on('a3', t), jj = on('jj', t), danger = t > LS('a2') && t < k2s + .3;
  const mGo = seg(t, LE('a3') - .2, LE('a3') + .8), mx = lerp(MX + 40, MX - 300, ease(mGo));
  const mL = pf || a2 ? [12, 2] : (cryK > .2 || a3 ? [14, 0] : [10, 4]);
  g += at(1, cam, mx, G(MX) + 40, ammi, { s: SAM, t, phone: 0, look: mL, brow: pf ? 1 : (cryK > .2 ? .8 : .3), amp: amp('MAMA'), tilt: pf ? 6 : 0, blink: blink(t, 2.7) }, { w: 140 });
  // Sakina (crying act)
  g += onLane(1, cam, SKX, sakina, { s: SKR, t, move: cryK > .1 && !grin ? 'cry' : (jj ? 'thumbsUp' : 'idle'), mt: jj ? t - jjs : t, yaw: grin ? 0 : -.5, expr: cryK > .1 && !grin ? 'cry' : (grin ? 'wink' : (danger ? 'scared' : 'neutral')), amp: amp('SAKINA') }, { w: 100 });
  if (cryK > 0) { const f = proj(1, cam, SKX + 6, G(SKX) + 40 - 395 * SKR * 1.18); g += fountain(f.x, f.y, f.s * .9, t, cryK, proj(1, cam, SKX, G(SKX) + 60).y) + puddle(f.x, proj(1, cam, SKX, G(SKX) + 70).y, f.s, clamp(cryK * 1.3)); }
  // Qasim: pee-dance next to Mama, then zips to the blue door (lane d=1 → house row d=1.3)
  const dd = Math.sin(t * 16);
  let qd = 1, qx = QX0, qy = G(QX0) + 40, qs2 = SQ;
  if (zip > 0) { const z = eout(zip); qd = lerp(1, 1.3, z); qx = lerp(QX0, HOMEX, z); qy = lerp(G(QX0) + 40, HB(HOMEX), z); }
  if (zip < .95) g += `<g opacity="${(1 - seg(zip, .8, .95)).toFixed(2)}">` + at(qd, cam, qx, qy, susu, { s: qs2, t, flip: zip > 0 ? -1 : 1, look: qs ? [-10, -6] : [-12, 0], mouth: qs ? 'wobble' : (danger ? 'o' : (jj ? 'grin' : 'wobble')), amp: amp('QASIM'), brow: .9, tilt: zip === 0 ? 6 * dd : 0, legL: zip > 0 ? walkK(t, 32) : 16 + 6 * dd, legR: zip > 0 ? -walkK(t, 32) : -16 + 6 * dd, armL: zip > 0 ? 150 : 6, armR: zip > 0 ? 150 : 6, blink: blink(t) }, { w: 110 }) + '</g>';
  if (zip > 0 && zip < .9) { const p = proj(qd, cam, qx, qy); g += speed(p.x + 40, p.y - 150 * p.s, -1, .8, 5); }
  g += S.front;
  g += tally(4, 'AAJ SUUSUU BREAK:', seg(t, LS('pf') + .2, LS('pf') + .5) * (1 - seg(t, LE('pf') + .2, LE('pf') + .4)));
  if (danger) g += hookBig('RAAZ', 'KHATRE MEIN!', t, LS('a2') + .3, LS('a2') + .6, 260) + vanInset(t, seg(t, LS('a2') + .5, LS('a2') + .9) * (1 - seg(t, k2s + .1, k2s + .4)), 830, 660, 170, 'insG');
  if (k2) g += `<g transform="translate(540,300) scale(${back(seg(t, k2s, k2s + .3))})">${burst(0, 0, 230, '#7fd0ff', 'BUAAAA!', 92, 6, 1)}</g>` + T(540, 520, 60, 'CRYING GIRL ON!', { fill: '#fff', shadow: '#2f7fd6', op: clamp((t - k2s - .4) * 4) });
  if (cryK > .2 && !grin) g += violin(150, 420, t, cryK);
  if (a3) g += hookBig('MAMA', 'PIGHAL GAYI!', t, a3s + .3, a3s + .6, 280);
  if (grin && t < jjs) { const f = proj(1, cam, SKX + 60, G(SKX) - 430); g += burst(f.x, f.y, 70, '#fff', 'TING!', 34, 8, 1); }
  if (zip > .85) { const p = proj(1.3, cam, HOMEX, HB(HOMEX) - 260); g += burst(p.x, p.y, 100, '#fff', 'DHAP!', 44, 6, 1 - seg(t, LE('jj') + 1.0, D)); }
  return g + capFor('gag', t);
}

// ============ 4 POWER — the aangan WC door glows gold (Mama blurred in the foreground packing a new tiffin), FLUUSH, power bar, SUUU-SUUU-MAN! (narrator line #1) ============
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
  { const m = at(.78, cam, 590, 1450, ammi, { s: SAM, t, phone: 0, look: [4, 14], brow: .2, blink: blink(t, 3.4), tilt: open > 0 ? 3 * Math.sin(t * 20) * (1 - seg(t, q, q + .6)) : 0 }, { w: 0 }), p = proj(.78, cam, 590 + 150 * SAM, 1450 - 260 * SAM); g += `<g filter="url(#dofNear2)">${m}${tiffin(p.x, p.y, .9 * p.s)}</g>`; }
  g += S.front;
  g = shake(g, (open > 0 && open < 1) ? 1 : (glow > .8 && open === 0 ? .3 : 0), t);
  if (t > .5 && t < 2.2) { const k = back(seg(t, .5, .8)); g += `<g transform="translate(540,640) scale(${k})">${burst(0, 0, 230, C.gold, 'FLUUSH!', 104, -8, 1 - seg(t, 1.9, 2.2))}</g>`; }
  const p = ease(seg(t, .7, nE));
  if (t > .6 && open < 1) g += `<g opacity="${seg(t, .6, .8) * (1 - open)}"><rect x="140" y="150" width="800" height="150" rx="30" fill="#000" opacity=".75"/>${T(540, 212, 62, 'SUUSUU POWER', { fill: C.gold, sw: 0, ls: 6 })}<rect x="190" y="235" width="700" height="44" rx="22" fill="#333" stroke="#fff" stroke-width="5"/><rect x="194" y="239" width="${692 * p}" height="36" rx="18" fill="${p > .99 ? '#ff3b30' : C.gold}"/>${T(540, 272, 40, Math.round(p * 100) + '%', { sw: 6 })}${emblem(180, 257, .7)}</g>`;
  if (t > 1.4 && open === 0) g += vanInset(t, seg(t, 1.4, 1.7), 820, 620, 190, 'insP');
  if (t > q) { const k = back(seg(t, q, q + .3)); g += `<g transform="translate(540,330) scale(${lerp(2.2, 1, clamp(k))}) rotate(-4)" opacity="${clamp(k * 2)}"><rect x="-460" y="40" width="920" height="40" rx="20" fill="${C.red}" transform="skewX(-20)"/>${T(0, 40, 138, 'SUUU-SUUU-MAN!', { shadow: C.red, sw: 12, ls: 2 })}</g>`; }
  return g + capFor('power', t);
}

// ============ 5 RESCUE — Susuman dives down the lane, grabs the rear bumper and digs his heels in (sparks) — the van slows… KRAAK! the bumper snaps
//   (IT GETS WORSE): the van speeds at the khadda; Ammar: "Bumper toot gaya!"; the front wheels drop over the edge, the van tips — SLOW-MO — Susuman
//   gets under the bonnet: "Pakad liya!"; he lifts the van back onto the road; Noor: "Shukriya, superhero!"; wink, whoosh ============
const RS = { grab: 2.6, snap: 6.0, tip: 9.3, catchT: 12.6, lift0: 13.9, lift1: 15.9 };
function rVan(t) {   // van x, extra tilt, lift, pivot for the rescue
  let x, tilt = 0, lift = 0, piv = 0, wob = 1;
  if (t < RS.grab) x = 1900 + 70 * t;
  else if (t < RS.snap) { const k = seg(t, RS.grab, RS.snap); x = 1900 + 70 * RS.grab + 120 * (1 - (1 - k) * (1 - k)) * .5 + 20 * k; wob = 1; }
  else if (t < RS.tip) { x = 2122 + 36 * (t - RS.snap) * (t - RS.snap); }
  else x = 2122 + 36 * (RS.tip - RS.snap) ** 2;
  if (t > RS.tip) { piv = VAN.WF - 60; tilt = 9 * eout(seg(t, RS.tip, RS.tip + 1.2)) + 1.5 * Math.sin(t * 5) * seg(t, RS.tip, RS.tip + 1) * (1 - seg(t, RS.catchT, RS.catchT + .3)); }
  if (t > RS.catchT) tilt = lerp(tilt, 9 - 2 * seg(t, RS.catchT, RS.catchT + .4), 1) * (1 - ease(seg(t, RS.lift0, RS.lift0 + .9)));
  if (t > RS.lift0) { const k = ease(seg(t, RS.lift0, RS.lift1)); lift = 160 * Math.sin(k * Math.PI); x = lerp(x, 2330, k); }
  if (t > RS.lift1) wob = 0;
  return { x, tilt, lift, piv, wob };
}
function E_rescue(t) {
  const D = sdur('rescue'), V = rVan(t), vo = { tilt: V.tilt, lift: V.lift, piv: V.piv, wob: V.wob };
  const SLOW = t > RS.tip + .3 && t < RS.catchT;
  const snapK = seg(t, RS.snap, RS.snap + .2);
  // ---- Susuman path (screen space via the camera, computed after the camera)
  const cam = camK(t, [[0, [1850, .62, 1080]],
    [RS.grab - .9, [V.x - 120, 1.12, 1170, 560], .8],
    [RS.snap - .2, [V.x + 160, .82, 1120, 520], .5],
    [RS.tip - .4, [KHX - 220, 1.08, 1150], .8],
    [RS.catchT - 1.6, [KHX - 180, 1.3, 1130], 1.2],
    [RS.lift0, [2420, .9, 1130], 1.6],
    [LS('o1') - .5, [V.x + 40, 1.35, 1250], .7],
    [LE('o1') + .5, [2380, .9, 1130], .9]]);
  const S = dhalaan(t, cam, { inner: khadda(t) + (t > RS.snap + .9 && t < D ? (() => { const bx = 2080; return vanBumper(bx, G(bx) + 36, VS, 8 + SLA); })() : '') });
  let g = S.back;
  // Ammar at the khadda (shouting at the snap), kids' screams
  const m2 = on('m2', t, .2, .3);
  g += onLane(1, cam, 2990, ammar, { s: SKR, t, move: m2 ? 'shout' : (t > LS('o1') - 1 ? 'clap' : 'scared'), mt: t, yaw: -.5, expr: m2 ? 'shout' : (t > RS.lift1 ? 'happy' : 'scared'), amp: amp('AMMAR') }, { w: 110 });
  const mood = t > RS.lift1 + .2 ? 'cheer' : 'scream';
  g += vanAt(cam, V.x, t, Object.assign({}, vo, { bumper: t < RS.snap ? 1 : 0, mood, slide: clamp(V.tilt / 9), noorMood: t > RS.lift1 + .2 ? (on('o1', t, .2, 1) ? 'smile' : 'smile') : (t > RS.tip ? 'scream' : 'cry') }));
  // Susuman
  let sx, sy, sc, flip = 1, rot = 0, arms = [150, 150], mouth = 'grin', legs = [-22, 12], fly = 1, wink = 0;
  const bump = vanPt(cam, V.x, t, vo, -395, -58);
  if (t < RS.grab) { const k = eout(seg(t, 0, RS.grab)); const a = { x: -200, y: 300 }, b = bump; sx = lerp(a.x, b.x - 160 * bump.s, k); sy = lerp(a.y, b.y + 140 * bump.s, k) - 260 * Math.sin(k * Math.PI) * (1 - k); sc = .62 * lerp(.7, bump.s, k); rot = lerp(30, 0, k); arms = [170, 170]; mouth = on('q3', t) ? 'talk' : 'grin'; }
  else if (t < RS.snap) {   // holding the bumper: leaning back, heels skidding (screen right of him is the van)
    sc = .62 * bump.s; flip = -1; const ang = 92; const hk = susHand(0, 0, sc, ang, -1, -1);
    sx = bump.x - hk[0] - 6 * Math.sin(t * 40); sy = bump.y - hk[1]; arms = [ang, 40 + 10 * Math.sin(t * 9)]; mouth = 'frown'; legs = [-28, 18]; fly = 0; rot = -10;
  } else if (t < RS.snap + 1.1) {   // tumbles back with the bumper
    const k = seg(t, RS.snap, RS.snap + 1.1), p0 = vanPt(cam, rVan(RS.snap).x, RS.snap, vo, -395, -58);
    sc = .62 * p0.s; flip = -1; sx = p0.x - 300 * eout(k) * sc / .62; sy = p0.y + 120 * sc - 160 * Math.sin(k * Math.PI) * sc / .62; rot = -200 * eout(k); arms = [150, 150]; mouth = 'o';
  } else if (t < RS.catchT) {   // flies after the van and dives into the khadda in front of the bonnet
    const k = ease(seg(t, RS.snap + 1.1, RS.catchT)), p0 = vanPt(cam, 2080, t, {}, 0, 0), front = proj(1, cam, KHX - 40, G(KHX) + 120);
    sc = .62 * lerp(p0.s, front.s, k); sx = lerp(p0.x - 220, front.x + 60, k); sy = lerp(p0.y - 300, front.y, k) - 300 * Math.sin(k * Math.PI); rot = lerp(60, 0, ease(seg(t, RS.catchT - .8, RS.catchT))); arms = [175, 175]; mouth = 'shout';
  } else {   // under the bonnet, arms up holding the van (catch → lift → set down → wave)
    const nose = vanPt(cam, V.x, t, vo, 350, -40);
    sc = .62 * nose.s; const hk = susHand(0, 0, sc, 168, 1, 1);
    sx = nose.x - hk[0] + 30 * sc; sy = nose.y - hk[1]; arms = [168, 168]; mouth = t < RS.lift1 ? 'frown' : 'grin'; legs = [-16, 16]; fly = t > RS.lift0 && t < RS.lift1 ? 1 : 0;
    if (t > RS.lift1 + .1) { const k = ease(seg(t, RS.lift1 + .1, RS.lift1 + .7)); const st = proj(1, cam, 2330 + 330, G(2600) + 40); sx = lerp(sx, st.x, k); sy = lerp(sy, st.y, k); arms = [lerp(168, 30, k), on('o1', t, .1, .8) || t > LE('o1') ? 150 + 18 * Math.sin(t * 8) : lerp(168, 30, k)]; }
    if (t > LE('o1') + .1 && t < LE('o1') + .7) wink = 1;
    if (t > D - 1.0) { const k = seg(t, D - 1.0, D - .3); sy -= 1900 * k * k; fly = 1; }
  }
  const floorY = proj(1, cam, 0, G(Math.min(V.x + 200, XR)) + 40).y;
  if (fly) g += liftShadow(sx, floorY, 120 * sc / .62, Math.max(0, floorY - sy), { op: .5 });
  else g += shadow(sx - 20, sy + 6, 120 * sc / .62, .9, { dx: -40, skew: 35 });
  if (t < RS.grab || (t > RS.snap + 1.1 && t < RS.catchT)) g += speed(sx - 120, sy - 200 * sc, 1, .6, 5);
  g += susuFly(sx, sy, sc, t, { flip, rot, armL: arms[0], armR: arms[1], legL: legs[0], legR: legs[1], mouth, amp: amp('QASIM'), wink, fistL: 0 });
  if (t > RS.snap && t < RS.snap + 1.1) { const h = susHand(sx, sy, sc, 150, -1, -1); g += vanBumper(h[0], h[1], VS * bump.s, -rot); }
  // skid sparks + dust at his heels while he holds the bumper
  if (t > RS.grab && t < RS.snap) { for (let i = 0; i < 7; i++) { const a = t * 25 + i * 1.3; g += `<path d="M${sx - 30},${sy} l${-50 - 30 * Math.cos(a)},${-20 - 30 * Math.abs(Math.sin(a))}" stroke="#ffd34a" stroke-width="5" stroke-linecap="round"/>`; } g += dust(sx - 60, sy + 10, (t * 1.4) % 1, 6, 60) + dust(sx - 120, sy + 14, (t * 1.4 + .5) % 1, 5, 50); }
  g += S.front;
  // ---- FX + text
  if (t > RS.grab && t < RS.snap) g += `<g transform="translate(540,330) scale(${back(seg(t, RS.grab, RS.grab + .3))})">${burst(0, 0, 170, '#fff', 'HMMPF!', 70, -6, 1 - seg(t, RS.snap - .6, RS.snap - .3))}</g>` + T(540, 560, 64, 'DHEERE... DHEERE...', { fill: C.gold, shadow: '#000', op: seg(t, RS.grab + .8, RS.grab + 1.1) * (1 - seg(t, RS.snap - .4, RS.snap)) });
  if (t > RS.snap - .05 && t < RS.snap + 1.0) { g += `<g transform="translate(${bump.x},${bump.y - 160}) scale(${back(seg(t, RS.snap, RS.snap + .25))})">${burst(0, 0, 190, '#fff', 'KRAAK!', 78, -8, 1 - seg(t, RS.snap + .7, RS.snap + 1.0))}</g>`; }
  if (t > RS.snap + .4 && t < RS.tip + .2) g += hookBig('BUMPER', 'TOOT GAYA!', t, RS.snap + .4, RS.snap + .65, 250);
  if (m2) { const k = seg(t, LS('m2') - .2, LS('m2') + .1), ic = camG(2990, 1.2, 760, 830, 300), sub = dhalaan(t, ic, { motes: false, noPump: 1, noBoug: 1, inner: khadda(t) }); g += inset(830, 640, 170 * back(k), sub.back + onLane(1, ic, 2990, ammar, { s: SKR, t, move: 'shout', mt: t, yaw: -.3, expr: 'shout', amp: amp('AMMAR') }, { w: 0 }), 'insA'); }
  if (SLOW) { const k = seg(t, RS.tip + .3, RS.tip + .6) * (1 - seg(t, RS.catchT - .2, RS.catchT)); g += `<rect width="1080" height="1920" fill="#0a2a4a" opacity="${(.22 * k).toFixed(2)}"/>` + vig(.8 * k) + T(540, 560, 74, 'SLOW-MO...', { fill: '#bfe8ff', shadow: '#000', op: k }); }
  if (on('q4', t, .1, .5)) g += `<g transform="translate(540,330) scale(${back(seg(t, LS('q4'), LS('q4') + .25))})">${burst(0, 0, 160, C.gold, 'PAKAD LIYA!', 56, 5, 1)}</g>`;
  if (t > RS.lift1 && t < RS.lift1 + .6) { const p = proj(1, cam, 2330, G(2330) + 40); g += burst(p.x, p.y - 60, 110, '#fff', 'THAP!', 46, -6, 1 - seg(t, RS.lift1 + .3, RS.lift1 + .6)); }
  if (t > RS.lift1 + .3 && t < LS('o1') - .3) g += hookBig('VAN', 'BACH GAYI!', t, RS.lift1 + .3, RS.lift1 + .55, 250);
  if (t < RS.grab) g += hook2('SUUSUU-MAN AAYA!', t, .3, 330, 92, '#fff');
  if (t > D - 1.0) { const p = { x: sx }; g += `<path d="M${p.x},${floorY} L${p.x},${sy - 200}" stroke="${C.gold}" stroke-width="44" opacity="${.5 * (1 - seg(t, D - .5, D))}" stroke-linecap="round"/>`; }
  g = shake(g, Math.abs(t - RS.snap) < .25 ? 1 : (Math.abs(t - RS.tip) < .25 ? .8 : (t > RS.grab && t < RS.snap ? .2 : (Math.abs(t - RS.lift1) < .2 ? .7 : 0))), t);
  return g + capFor('rescue', t);
}

// ============ 6 AFTER — Ammar wedges bricks behind the wheels; the door slides open, the kids hop out; the driver hugs them; Baba arrives panting ============
function E_after(t) {
  const D = sdur('after'), m3 = on('m3', t), vx = 2330, door = ease(seg(t, .3, 1.0));
  const cam = camK(t, [[0, [2420, 1.0, 1170]], [D - 1.6, [2380, .86, 1140], 1.6]]);
  const brick = (x, k) => { const bx = x, p = proj(1, cam, bx, G(bx) + 30); return k > 0 ? `<rect x="${(p.x - 28 * p.s).toFixed(1)}" y="${(p.y - 30 * p.s - 200 * (1 - k)).toFixed(1)}" width="${56 * p.s}" height="${30 * p.s}" fill="#b5502f" stroke="${C.ink}" stroke-width="3"/>` : ''; };
  const S = dhalaan(t, cam, { inner: khadda(t) });
  let g = S.back;
  g += vanAt(cam, vx, t, { mood: 'cheer', door, bumper: 0, noorMood: 'smile' });
  g += brick(vx + VAN.WR * VS - 70, ease(seg(t, LS('m3') + .8, LS('m3') + 1.2))) + brick(vx + VAN.WF * VS - 70, ease(seg(t, LS('m3') + 1.6, LS('m3') + 2.0)));
  // kids hopping out of the door (simple jumping faces + bodies), the driver hugging them
  for (let i = 0; i < 3; i++) { const k = ease(seg(t, 1.0 + i * .4, 1.8 + i * .4)); if (k <= 0) continue; const x = vx - 60 - 260 * k - i * 110, p = proj(1, cam, x, G(x) + 40 - 120 * Math.sin(k * Math.PI)); g += shadow(p.x, proj(1, cam, x, G(x) + 44).y, 50 * p.s, .7) + kface(p.x, p.y - 120 * p.s, 46 * p.s, t, { skin: ['#b07248', '#d7a27a', '#8d5a3b'][i], m: 'smile' }) + `<rect x="${p.x - 34 * p.s}" y="${p.y - 80 * p.s}" width="${68 * p.s}" height="${80 * p.s}" rx="${14 * p.s}" fill="#2b3a67" stroke="${C.ink}" stroke-width="3"/>`; }
  g += onLane(1.04, cam, vx - 560, driver, { s: SKR, t, move: t > 2 ? 'celebrate' : 'run', mt: t, yaw: t > 2 ? .3 : Math.PI / 2, expr: 'happy' }, { w: 110 });
  g += onLane(1, cam, vx + 330, ammar, { s: SKR, t, move: m3 ? 'talk' : 'thumbsUp', mt: t, yaw: -.5, expr: 'happy', amp: amp('AMMAR') }, { w: 110 });
  const bIn = ease(seg(t, 0, 2.4)); g += onLane(1.06, cam, lerp(vx - 1300, vx - 800, bIn), baba, { s: SKR, t, move: bIn < 1 ? 'run' : 'holdHead', mt: t, yaw: bIn < 1 ? Math.PI / 2 : .4, expr: 'happy' }, { w: 110 });
  g += S.front;
  if (t > LS('m3') + 1.0) g += hookBig('PAHIYE KE PEECHE', 'EENT!', t, LS('m3') + 1.0, LS('m3') + 1.3, 270);
  return g + capFor('after', t);
}

// ============ 7 SECRET — Qasim jogs down the lane with his school bag: "Kuch nahi Mama!"; Baba: "Koi SUPERHERO aaya tha…"; "Mujhe to suusuu aayi thi!"; Sakina winks ============
function E_secret(t) {
  const D = sdur('secret'), kt = on('kt', t), kn = on('kn', t), b2 = on('b2', t), q6 = on('q6', t), wk = t > LE('q6') - .2, vx = 2330;
  const cam = camK(t, [[0, [1700, 1.0, 1180]], [LS('b2') - .3, [1850, .92, 1170], .8], [LE('q6') - .3, [1640, 1.25, 1190], .8]]);
  const S = dhalaan(t, cam, { inner: khadda(t) });
  let g = S.back;
  g += vanAt(cam, vx, t, { mood: 'smile', door: 1, bumper: 0, noorMood: 'smile' });
  g += onLane(1, cam, 1980, baba, { s: SKR, t, move: b2 ? 'talk' : 'idle', mt: t, yaw: -.4, expr: b2 ? 'surprised' : 'happy', amp: amp('BABA') }, { w: 110 });
  g += at(1, cam, 1830, G(1830) + 40, ammi, { s: SAM, t, phone: 0, look: kt ? [-14, 0] : [-10, 4], brow: kt ? .8 : .2, amp: amp('MAMA'), blink: blink(t, 2.6) }, { w: 140 });
  { const p = proj(1, cam, 1830 + 150 * SAM, G(1830) + 40 - 260 * SAM); g += tiffin(p.x, p.y, .8 * p.s); }
  g += onLane(1, cam, 1500, sakina, { s: SKR, t, move: wk ? 'thumbsUp' : 'idle', mt: t - LE('q6') + .2, yaw: wk ? 0 : .4, expr: wk ? 'wink' : 'smug' }, { w: 100 });
  const qIn = ease(seg(t, 0, 1.1)), qx = lerp(1050, 1660, qIn);
  g += Q(cam, qx, { t, look: kn || q6 ? [12, -4] : [8, -4], mouth: kn || q6 ? 'talk' : 'smirk', amp: amp('QASIM'), wink: t > LE('kn') - .2 && t < LE('kn') + .4 ? 1 : 0, legL: qIn < 1 ? walkK(t, 24) : 0, legR: qIn < 1 ? -walkK(t, 24) : 0, armL: 20, armR: q6 ? 120 : 20, blink: blink(t) });
  { const p = proj(1, cam, qx - 85 * SQ, G(qx) + 40 - 200 * SQ); g += schoolBag(p.x, p.y, .55 * p.s, -8 + 6 * Math.sin(t * 12) * (qIn < 1 ? 1 : 0)); }
  g += S.front;
  if (kn) g += shhh(900, 560, back(seg(t, LS('kn'), LS('kn') + .3)) * .9);
  if (b2) g += hookBig('KOI', 'SUPERHERO?!', t, LS('b2') + .4, LS('b2') + .7, 250);
  if (wk) g += T(540, 330, 90, 'SHHH... RAAZ!', { fill: C.gold, shadow: '#000', op: clamp((t - LE('q6') + .2) * 3) });
  return g + capFor('secret', t);
}

// ============ 8 SCHOOL — at the Nanhe Taare school gate: Zahra Miss welcomes the class; Noor sits alone on the steps; Qasim: "Mere saath baithogi?";
//   "Haan! Main Noor. Ab hum dost!"; she shares her aloo paratha: "aadha aadha?" — "Dost sab kuch aadha aadha karte hain!"; Basim joins; Sakina winks ============
function E_school(t) {
  const D = sdur('school'), z1 = on('z1', t), q7 = on('q7', t), o2 = on('o2', t), o3 = on('o3', t), q8 = on('q8', t);
  const cam = camK(t, [[0, [3150, .72, 1150]], [LS('q7') - .5, [3330, 1.3, 1200], .9], [LS('o3') - .3, [3300, 1.45, 1210], .8], [LE('q8') - .2, [3200, .9, 1170], 1.2]]);
  const S = dhalaan(t, cam, { rowInner: schoolRow(t), inner: '' });
  let g = S.back;
  // Zahra Miss at the gate + a line of kids walking in (simple faces), Basim waving
  g += onLane(1.08, cam, 3020, zahra, { s: SKR, t, move: z1 ? 'wave' : 'idle', mt: t, yaw: .4, expr: 'happy', amp: amp('ZAHRA MISS') }, { w: 110 });
  for (let i = 0; i < 3; i++) { const k = seg(t, .2 + i * .5, 2.6 + i * .5); if (k <= 0 || k >= 1) continue; const x = lerp(2780, 3080, k) - i * 30, p = proj(1.12, cam, x, G(x) + 20 - 14 * Math.abs(Math.sin(t * 9 + i))); g += shadow(p.x, p.y + 10, 46 * p.s, .7) + kface(p.x, p.y - 110 * p.s, 42 * p.s, t, { skin: ['#b07248', '#d7a27a', '#8d5a3b'][i], girl: i === 1, m: 'smile' }) + `<rect x="${p.x - 32 * p.s}" y="${p.y - 72 * p.s}" width="${64 * p.s}" height="${74 * p.s}" rx="${14 * p.s}" fill="#2b3a67" stroke="${C.ink}" stroke-width="3"/>`; }
  g += onLane(1.06, cam, 3620, basim, { s: SKR, t, move: t > LE('q8') - .4 ? 'celebrate' : 'wave', mt: t, yaw: -.5, expr: 'happy' }, { w: 90 });
  // Noor on the steps (sad → shy smile → happy), Qasim walks up to her
  const nx = 3420, happy = t > LS('o2') - .1, share = t > LS('o3') - .2;
  g += onLane(1, cam, nx, noor, { s: SKR, t, move: share ? (q8 || t > LE('q8') ? 'celebrate' : 'talk') : (happy ? 'wave' : (t > LS('q7') ? 'listen' : 'sit')), mt: t, yaw: -.5, expr: happy ? 'happy' : 'sad', amp: amp('NOOR') }, { w: 90 });
  if (!happy) { const p = proj(1, cam, nx + 30, G(nx) - 270); g += T(p.x, p.y, 40, '...', { fill: '#fff', sw: 5, op: .8 }); }
  const qIn = ease(seg(t, .5, LS('q7') + .2)), qx = lerp(2860, nx - 190, qIn);
  g += Q(cam, qx, { t, look: q7 || q8 ? [12, -2] : [10, 0], mouth: q7 || q8 ? 'talk' : 'grin', amp: amp('QASIM'), legL: qIn > 0 && qIn < 1 ? walkK(t, 24) : 0, legR: qIn > 0 && qIn < 1 ? -walkK(t, 24) : 0, armL: 20, armR: q7 ? 110 : (share ? 70 : 20), blink: blink(t) });
  { const p = proj(1, cam, qx - 85 * SQ, G(qx) + 40 - 200 * SQ); g += schoolBag(p.x, p.y, .55 * p.s, -8); }
  // the tiffin between them: a paratha torn in two halves
  if (share) { const k = ease(seg(t, LS('o3') + .4, LS('o3') + 1.0)), sp = seg(t, LS('q8'), LS('q8') + .6), p = proj(1, cam, nx - 95, G(nx) - 120);
    g += tiffin(p.x, p.y + 40 * p.s, .7 * p.s) + `<g transform="translate(${p.x - 40 * sp * p.s},${p.y - 40 * k * p.s}) rotate(${-14 * sp})"><path d="M0,-40 A40,40 0 0 0 0,40Z" fill="#e8b45a" stroke="${C.ink}" stroke-width="4"/></g><g transform="translate(${p.x + 40 * sp * p.s},${p.y - 40 * k * p.s}) rotate(${14 * sp})"><path d="M0,-40 A40,40 0 0 1 0,40Z" fill="#e8b45a" stroke="${C.ink}" stroke-width="4"/></g>`; }
  g += S.front;
  if (t > .3 && t < LS('q7') - .3) g += hook2('PEHLA DIN!', t, .3, 300, 120, C.gold);
  if (o2) { const p = proj(1, cam, nx - 90, G(nx) - 330); g += heart(p.x, p.y - 40, .8, t) + hookBig('NAYI', 'DOST!', t, LS('o2') + .3, LS('o2') + .55, 260); }
  if (q8) g += hookBig('AADHA', 'AADHA!', t, LS('q8') + .3, LS('q8') + .55, 260);
  return g + capFor('school', t);
}

// ============ 9 CLIFFHANGER — "AGLE EPISODE MEIN…": a railway platform, the train pulling out, a little puppy alone at the edge; Sakina: "Arre! Pilla platform par akela reh gaya!" ============
function E_cliff(t) {
  const D = sdur('cliff');
  const cam = { x: 120 + 30 * t, y: 170, z: 1.05 + .08 * t, px: 540, py: 1100 };
  let g = platformSet(t, cam);
  const p = proj(1, cam, 860, 1250);
  g += shadow(p.x, p.y + 6, 130 * p.s, .8) + pilla({ x: p.x, y: p.y, s: .85 * p.s, t, shiver: 1, flip: -1 });
  g += at(1, cam, 560, 1330, sakina, { s: SKR, t, move: 'point', mt: t, yaw: .5, expr: 'scared', amp: amp('SAKINA') }, { w: 100 });
  g += `<g transform="translate(${p.x + 60 * p.s},${p.y - 260 * p.s}) scale(${back(seg(t, .5, .8))})">${burst(0, 0, 60, '#fff', 'KUU KUU!', 26, 6, 1)}</g>`;
  g += `<rect width="1080" height="1920" fill="#000" opacity=".22"/>` + vig(.9);
  g += `<g transform="translate(540,${WIDE ? 310 : 300}) scale(${back(seg(t, 0, .3)) * (WIDE ? 1.2 : 1)}) rotate(-3)">${T(0, 0, 100, 'AGLE EPISODE', { shadow: '#000', sw: 11 })}${T(0, 130, 120, 'MEIN...', { fill: C.gold, shadow: C.red, sw: 12 })}</g>`;
  if (t > .3) g += T(540, WIDE ? 520 : 560, 54, 'TRAIN KA SAFAR', { fill: '#fff', shadow: '#2e7d4f', op: seg(t, .3, .6) });
  g = shake(g, .3, t);
  const f2 = seg(t, D - .25, D); if (f2 > 0) g += `<rect width="1080" height="1920" fill="#fff" opacity="${f2}"/>`;
  return g + capFor('cliff', t);
}

// ============ 10 END SCREEN — the narrator's lesson (big on screen), then LIKE + SUBSCRIBE; Susuman waving with Noor; room for YouTube's end-screen elements ============
function lessonCard(t, x, y, s) {
  const k = back(seg(t, .3, .6)), out = 1 - seg(t, LS('n3') + 3.4, LS('n3') + 3.8);
  return k > 0 && out > 0 ? `<g transform="translate(${x},${y}) scale(${(k * s).toFixed(3)}) rotate(-2)" opacity="${out.toFixed(2)}">${T(0, 0, 84, 'SAB SE DOSTI KARO!', { fill: C.gold, shadow: C.red, sw: 11 })}${T(0, 96, 58, 'chalti gaadi se door raho', { fill: '#fff', shadow: '#000', sw: 8 })}</g>` : '';
}
function E_endcard(t) {
  const cam = { x: 30 * Math.sin(t * .4), y: 0, z: 1 + .05 * t / sdur('endcard') };
  let g = layer(4, cam, brushBg(t + 90), { f: '' });
  g += layer(1, cam, shadow(330, 1255, 200, .8) + lightPool(330, 1250, 380, 70, .8) + susu({ x: 330, y: 1250, s: .85, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 30, armR: 150 + 18 * Math.sin(t * 7), mouth: 'grin', blink: blink(t, 2.6) }) + shadow(760, 1250, 120, .7) + noor({ x: 760, y: 1250, s: 1.25, t, move: 'wave', mt: t, yaw: -.3, expr: 'happy' }) + schoolBag(560, 1230, .9, 6), { f: '' });
  let sp = ''; for (let i = 0; i < 9; i++) { const x = ((i * 157 + t * 60) % 1300) - 110, y = 200 + (i * 211) % 1500; sp += `<path d="M${x},${y - 40} L${x + 10},${y} L${x},${y + 40} L${x - 10},${y}Z M${x - 40},${y} L${x},${y - 10} L${x + 40},${y} L${x},${y + 10}Z" fill="${C.gold}" opacity=".8"/>`; }
  g += layer(.6, cam, sp);
  g += lessonCard(t, 540, 300, 1);
  const lk = LS('n3') + 3.5, k = back(seg(t, lk, lk + .3)), clicked = t > lk + 3.0;
  if (k > 0) g += `<g transform="translate(540,290) scale(${k})">${T(0, 0, 100, 'LIKE aur SUBSCRIBE', { shadow: '#000' })}${T(0, 110, 90, 'KARO!', { fill: C.gold, shadow: C.red })}</g>`;
  g += `<g transform="translate(540,1560) scale(${back(seg(t, lk + .3, lk + .6)) * (Math.abs(t - lk - 2.9) < .1 ? .92 : 1)})"><rect x="-300" y="-70" width="600" height="140" rx="70" fill="${clicked ? '#555' : '#ff0000'}" stroke="#fff" stroke-width="6"/>${T(0, 28, 76, clicked ? 'SUBSCRIBED' : 'SUBSCRIBE', { sw: 0, ls: 4 })}</g>`;
  const cx = lerp(900, 640, ease(seg(t, lk + 2.0, lk + 2.8))), cy = lerp(1800, 1590, ease(seg(t, lk + 2.0, lk + 2.8)));
  if (t > lk + 2.0 && t < lk + 4.0) g += `<path d="M${cx},${cy} l0,80 l20,-18 l14,32 l14,-6 l-14,-30 l28,-2z" fill="#fff" stroke="#000" stroke-width="5"/>`;
  if (clicked) g += `<g transform="translate(540,1700) scale(${back(seg(t, lk + 3.1, lk + 3.4))})"><rect x="-260" y="-38" width="520" height="76" rx="38" fill="${C.gold}" stroke="#000" stroke-width="5"/>${T(0, 18, 46, 'AGLI KAHANI JALD!', { fill: '#000', sw: 0, ls: 1 })}</g>`;
  return g + capFor('endcard', t);
}
// native 16:9 end screen: Susuman + Noor on the left third; two EMPTY boxes on the right for YouTube's end-screen video + subscribe elements
function E_endcardW(t) {
  let g = `<g transform="translate(${-30 + 20 * Math.sin(t * .4)},0)">${brushBg(t + 90).replace(/<rect width="1080" height="1920"/g, '<rect x="-200" y="-200" width="2400" height="1500"')}</g>`;
  g += `<rect width="1920" height="1080" fill="#000" opacity=".18"/>`;
  g += shadow(330, 1000, 220, .8) + lightPool(330, 995, 400, 70, .8) + susu({ x: 330, y: 995, s: .74, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 30, armR: 150 + 18 * Math.sin(t * 7), mouth: 'grin', blink: blink(t, 2.6) }) + shadow(700, 1000, 110, .7) + noor({ x: 700, y: 1000, s: 1.1, t, move: 'wave', mt: t, yaw: -.3, expr: 'happy' });
  const lk = LS('n3') + 3.5;
  g += lessonCard(t, 960, 140, .95);
  if (t > lk) g += `<g transform="translate(470,140) scale(${back(seg(t, lk, lk + .3))}) rotate(-3)">${T(0, 0, 76, 'LIKE aur SUBSCRIBE', { shadow: '#000' })}${T(0, 86, 70, 'KARO!', { fill: C.gold, shadow: C.red })}</g>`;
  const bk = back(seg(t, lk - .2, lk + .3));
  g += `<g opacity="${clamp(bk).toFixed(2)}"><rect x="1010" y="230" width="800" height="450" rx="26" fill="#000" opacity=".28" stroke="#fff" stroke-width="6" stroke-dasharray="26 14"/><circle cx="1410" cy="870" r="140" fill="#000" opacity=".28" stroke="#fff" stroke-width="6" stroke-dasharray="26 14"/></g>`;
  let sp = ''; for (let i = 0; i < 7; i++) { const x = ((i * 257 + t * 60) % 2100) - 90, y = 120 + (i * 151) % 850; sp += `<path d="M${x},${y - 30} L${x + 8},${y} L${x},${y + 30} L${x - 8},${y}Z M${x - 30},${y} L${x},${y - 8} L${x + 30},${y} L${x},${y + 8}Z" fill="${C.gold}" opacity=".7"/>`; }
  return g + sp;
}
