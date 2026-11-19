// Episode 9 "Garmi Mein Parinde" — scenes (RETENTION STRUCTURE, Nov 18 2026: frame 0 = the danger, no narrator before the flush).
// 2.5D: the rooftop row (chhatein()) and the aangan (aangan()) are parallax layer stacks; characters go in at a depth with at()/proj().
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
// Sakina's crying-girl act (from Ep 6/8)
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

// ======================= EPISODE 9 — "Garmi Mein Parinde" =======================
Object.assign(SPK, { MAMA: '#1f7a78', DADI: '#6b4f8f', SAKINA: '#17917f', BASIM: '#e07a2c', 'ZAHRA MISS': '#457b9d', DANIEL: '#c8102e', AMARA: '#7a1f3d' });
// where everyone is on the rooftop row (action plane, world coords; FY = 1000 back edge of the roofs)
const DX = CP5 - 90, DY = FY + 150;          // Dadi on the charpai (our roof)
const ZHX = 620, ZHY = FY + 215;             // Zahra Miss (visiting Dadi) at the right edge of our roof
const SAX = 330, SAY = FY + 225;             // Sakina
const QX = 170, QY = FY + 250;               // Qasim
const BX = 1300, BY = FY + 170;              // Basim on his roof, near his tank
const dadiAt = (cam, t, o = {}) => at(1, cam, DX, DY, dadi, Object.assign({ s: SKR, t, move: 'sit', mt: 5, yaw: .45, expr: 'sad' }, o), { w: 0 });
const pankha = (x, y, s, t, k = 1) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(20 * Math.sin(t * 9) * k).toFixed(1)}) scale(${s.toFixed(3)})"><path d="M0,0 v-70" stroke="#8a5a32" stroke-width="10"/><path d="M0,-70 Q-70,-80 -60,-150 Q0,-190 60,-150 Q70,-80 0,-70Z" fill="#e8c26a" stroke="${C.ink}" stroke-width="5"/><path d="M0,-80 v-90 M-40,-100 l40,-60 l40,60" stroke="#b08a3a" stroke-width="4" fill="none"/></g>`;   // hand fan
const tray = (x, y, s, n = 3, jug = 1) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(3)})"><ellipse cx="0" cy="0" rx="110" ry="22" fill="#c9cfd6" stroke="${C.ink}" stroke-width="5"/>${jug ? `<path d="M-80,-4 L-74,-120 Q-60,-140 -30,-130 L-24,-4Z" fill="#e8f6ff" stroke="${C.ink}" stroke-width="4" opacity=".95"/><path d="M-76,-60 L-26,-60 L-24,-4 L-80,-4Z" fill="#f4f0a0"/><circle cx="-50" cy="-40" r="10" fill="#9ccc4a" stroke="${C.ink}" stroke-width="2"/>` : ''}${[...Array(n)].map((_, i) => `<path d="M${-6 + i * 36},-4 l-4,-60 h30 l-4,60z" fill="#f4f0a0" stroke="${C.ink}" stroke-width="3" opacity=".95"/>`).join('')}</g>`;
const glassG = (x, y, s) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(3)})"><path d="M-18,0 l-4,-64 h44 l-4,64z" fill="#f4f0a0" stroke="${C.ink}" stroke-width="4"/><circle cx="6" cy="-50" r="8" fill="#9ccc4a" stroke="${C.ink}" stroke-width="2"/><path d="M10,-60 l14,-34" stroke="#e5463b" stroke-width="5"/></g>`;
// sparrow on the ledge (world coords), panting; fainted look
const sparrowLedge = (t, o = {}) => chidiya(Object.assign({ x: SPOT[0], y: SPOT[1], s: .95, pose: 'faint', pant: 1, t, rot: 8 }, o)) + sweat(SPOT[0] + 10, SPOT[1] - 60, .9, t);
// the rooftop row with our episode props (inner = extra world-coords drawing inside the action layer)
function roofs(t, cam, o = {}) {
  const inner = ledgeSvg(t, o) + hotTank(t, o) + charpaiR(CP5, FY + 190) + (o.inner || '') + (o.wireBirds !== false ? wireBirds(t, o) : '');
  const S = chhatein(t, cam, Object.assign({}, o, { inner, charpai: false }));
  return { back: S.back + heatTint(t, o.heat ?? 1), front: S.front };
}
// a small "the sparrow is still in danger" inset (circle, top right)
function sparrowInset(t, k, cx = 830, cy = 620, r = 170, id = 'insS') {
  if (k <= 0) return '';
  const ic = camR(SPOT[0] - 10, 2.0, cy + 40, cx, SPOT[1] - 40), sub = roofs(t, ic, { motes: false, noFG: 1, wireBirds: false });
  return inset(cx, cy, r * back(k), sub.back + `<g>${layer(1, ic, sparrowLedge(t))}</g>`, id);
}

// ============ 1 COLD OPEN (0 s) — the sparrow is already tipping off the hot tank; it tumbles onto the tin ledge over the gap. Basim: "Arre! Chidiya gir gayi!" ============
const FALL0 = .45, FALL1 = 1.35;
function sparrowFall(t) {   // world position of the sparrow in the cold open
  if (t < FALL0) return { x: TK.x + 70, y: TK.top + 2, rot: 18 + 22 * seg(t, 0, FALL0) + 8 * Math.sin(t * 14), pose: 'stand', pant: 1 };
  if (t < FALL1) { const k = seg(t, FALL0, FALL1); return { x: lerp(TK.x + 70, SPOT[0], k), y: lerp(TK.top, SPOT[1], k * k) - 120 * Math.sin(k * Math.PI) * (1 - k), rot: 60 + 720 * k, pose: 'fly', pant: 0 }; }
  const b = seg(t, FALL1, FALL1 + .35); return { x: SPOT[0], y: SPOT[1] - 40 * Math.sin(b * Math.PI) * (1 - b), rot: 8, pose: 'faint', pant: 1 };
}
function E_cold(t) {
  const D = sdur('cold'), d1s = LS('d1') - .35;
  // camera: close on the tank rim → whip down-right with the fall → hold on the ledge → whip left to Dadi + family (inset keeps the sparrow on screen)
  let cam = camR(TK.x + 90, 2.1, 860, 540, TK.top - 10);
  cam = lerpCam(cam, camR(SPOT[0] - 60, 1.7, 1050, 540, SPOT[1] - 40), ease(seg(t, FALL0 - .1, FALL1 + .1)));
  cam = lerpCam(cam, camR(SPOT[0] - 300, 1.15, 1150, 540, SPOT[1] - 60), ease(seg(t, FALL1 + .3, d1s)));
  const whip = ease(seg(t, d1s, d1s + .45));
  cam = lerpCam(cam, camR(250, .95, 1150, 540, 1150), whip);
  cam = lerpCam(cam, camR(170, 1.05, 1150, 540, 1150), ease(seg(t, d1s + .45, D)));
  const P = sparrowFall(t);
  const S = roofs(t, cam, { inner: chidiya({ x: P.x, y: P.y, s: .95, pose: P.pose, pant: P.pant, t, rot: P.rot }) + (t > FALL1 ? sweat(SPOT[0] + 10, SPOT[1] - 60, .9, t) : '') + (t < FALL1 && t > FALL0 ? [0, 1, 2].map(i => feather(P.x - 40 * i, P.y - 30 - 50 * seg(t, FALL0, FALL1) * i, .5, t * 200 + i * 60)).join('') : '') });
  let g = S.back;
  // Basim on his roof (left of the tank), shouting and pointing; then running to the parapet
  const b1 = on('b1', t);
  g += at(1, cam, BX, BY, basim, { s: SKR, t, move: b1 ? 'point' : (t > LE('b1') ? 'scared' : 'idle'), mt: t, yaw: .7, expr: 'scared', amp: amp('BASIM') }, { w: 90 });
  // our roof: Dadi on the charpai (fan), Zahra, Sakina, Qasim all spring up as the camera arrives
  const up = seg(t, d1s, d1s + .5), d1 = on('d1', t);
  g += dadiAt(cam, t, { move: d1 ? 'point' : 'sit', mt: t - d1s, expr: 'scared', amp: amp('DADI') });
  { const p = proj(1, cam, DX - 80, DY - 260); g += pankha(p.x, p.y, .8 * p.s, t, d1 ? 0 : 1); }
  g += at(1, cam, ZHX, ZHY, zahra, { s: SKR, t, move: up > 0 ? 'scared' : 'idle', mt: t - d1s, yaw: .6, expr: 'surprised' }, { w: 110 });
  g += at(1, cam, SAX, SAY, sakina, { s: SKR, t, move: up > 0 ? 'holdHead' : 'idle', mt: t - d1s, yaw: .6, expr: 'scared' }, { w: 100 });
  g += at(1, cam, QX, QY - 30 * Math.abs(Math.sin(t * 9)) * up, susu, { s: SQ, t, look: [12, -6], mouth: 'o', brow: 1, armL: 150 * up, armR: 150 * up, blink: blink(t) }, { w: 110 });
  g += S.front;
  if (t > d1s + .3) g += sparrowInset(t, seg(t, d1s + .3, d1s + .6));
  if (whip > 0 && whip < 1) g += `<g opacity="${(Math.sin(whip * Math.PI) * .8).toFixed(2)}">${speed(540, 1000, -1, .9, 9)}</g>`;
  // the hook text is ON SCREEN FROM FRAME 0 (already big), 2.4 s
  const hk = t < 2.6 ? (t < .12 ? .85 + t : back(seg(t, -.1, .2))) * (1 - seg(t, 2.3, 2.6)) : 0;
  if (hk > 0) g += `<g transform="translate(540,${WIDE ? 270 : 250}) scale(${(hk * (WIDE ? 1.45 : 1)).toFixed(3)}) rotate(-3)">${T(0, 0, 126, 'CHIDIYA', { shadow: '#000', sw: 13 })}${T(0, 140, 140, 'GIR GAYI!', { fill: C.gold, shadow: C.red, sw: 14 })}</g>`;
  g += thermo9(150, 640, .8, t, seg(t, 0, .3) * (1 - seg(t, d1s, d1s + .3)));
  if (t > FALL1 && t < FALL1 + .5) { const p = proj(1, cam, SPOT[0], SPOT[1] - 30); g += burst(p.x, p.y - 80, 90, '#fff', 'DHAP!', 44, -6, 1 - seg(t, FALL1 + .3, FALL1 + .5)); }
  if (t > FALL1 + .2 && t < d1s) { const p = proj(1, cam, SPOT[0], SPOT[1] - 30); g += marker(p.x, p.y, 110, t, C.red, 'KHATRA!'); }
  g = shake(g, t < .25 ? .8 * (1 - t / .25) : (t > FALL1 && t < FALL1 + .2 ? .6 : 0), t);
  return g + capFor('cold', t);
}

// ============ 2 GARMI (why it matters) — crane up to the thirsty birds on the wires; Qasim wants to give her water; Zahra Miss: "kinaare se door raho!" ============
function E_garmi(t) {
  const D = sdur('garmi'), q1 = on('q1', t), zs = on('zs', t, .1, .4), z1 = on('z1', t);
  let cam = camR(ZHX - 40, 1.0, 1150, 540, 1120);
  cam = lerpCam(cam, camR(700, .78, 700, 540, 420), ease(seg(t, .3, 2.2)));            // crane up to the wires
  cam = lerpCam(cam, camR(QX + 120, 1.15, 1180, 540, 1120), ease(seg(t, LS('q1') - .45, LS('q1') + .1)));   // down to Qasim
  cam = lerpCam(cam, camR(1240, .56, 1180, 540, 1150), ease(seg(t, LS('zs') - .3, LS('zs') + .5)));       // wide: our roof → gap → ledge
  const walk = seg(t, LE('q1') - .2, LS('zs') + .6), qx = lerp(QX, 560, ease(walk)), stop = seg(t, LS('zs') + .2, LS('zs') + .6);
  const S = roofs(t, cam, { inner: sparrowLedge(t) });
  let g = S.back;
  g += dadiAt(cam, t, { move: 'sit', expr: 'sad' });
  { const p = proj(1, cam, DX - 80, DY - 260); g += pankha(p.x, p.y, .8 * p.s, t); }
  g += at(1, cam, ZHX, ZHY, zahra, { s: SKR, t, move: z1 ? 'point' : (zs ? 'shout' : 'idle'), mt: t, yaw: z1 ? .2 : -.5, expr: zs ? 'scared' : 'sad', amp: amp('ZAHRA MISS') }, { w: 110 });
  g += at(1, cam, SAX, SAY, sakina, { s: SKR, t, move: 'idle', mt: t, yaw: .5, expr: 'sad' }, { w: 100 });
  // Qasim with a little katori of water, walks towards the edge — Zahra Miss holds him back
  const qWalk = walk > 0 && walk < 1 && stop < 1;
  g += at(1, cam, qx, QY, susu, { s: SQ, t, look: [12, -4], mouth: q1 ? 'talk' : 'frown', amp: amp('QASIM'), brow: .6, armL: 60, armR: 60, legL: qWalk ? walkK(t, 28) : 0, legR: qWalk ? -walkK(t, 28) : 0, blink: blink(t) }, { w: 110 });
  { const h = proj(1, cam, qx + 80 * SQ, QY - 180 * SQ); g += kunda(h.x, h.y, .32 * h.s, 1, t); }
  g += at(1, cam, BX, BY, basim, { s: SKR, t, move: 'scared', mt: t, yaw: .7, expr: 'sad' }, { w: 90 });
  g += S.front;
  if (t < LS('q1') - .3) g += hook2('PYAASE PARINDE!', t, .9, 600, 100, '#ffdd55');
  if (zs) { const k = seg(t, LS('zs'), LS('zs') + .3), p = proj(1, cam, SPOT[0], SPOT[1] - 30); g += marker(p.x, p.y, 70, t, C.red, '') + hook2('KINAARE SE DOOR!', t, LS('zs') + .2, 300, 104, '#fff'); }
  g += thermo9(150, 560, .7, t, seg(t, .9, 1.2) * (1 - seg(t, LS('q1') - .5, LS('q1') - .2)));
  return g + capFor('garmi', t);
}

// ============ 3 GAG — Mama brings nimbu paani up the stairs: "Mama! Suusuu aayi hai!" → "Phir se?!" (counter) → "main saath chalti hoon" → Sakina cries for nimbu paani → Mama gives in → wink, "Jaa jaldi!" → Qasim zips down the mumty stairs ============
const MMX = MUM5.door + 260, MMY = FY + 150;
function E_gag(t) {
  const D = sdur('gag'), k2s = LS('k2'), a3s = LS('a3'), jjs = LS('jj');
  const cryK = seg(t, k2s - .1, k2s + .4) * (1 - seg(t, a3s + .5, a3s + .9)), grin = t > a3s + .6;
  const zip = seg(t, LE('jj') - .05, LE('jj') + 1.0);
  let cam = camR(-150, 1.0, 1150, 540, 1150);
  cam = lerpCam(cam, camR(-60, 1.3, 1150, 540, 1120), ease(seg(t, k2s - .3, k2s + .5)) * (1 - ease(seg(t, a3s, a3s + 1))));
  cam = lerpCam(cam, camR(-360, 1.12, 1150, 540, 1140), ease(seg(t, LE('jj') - .3, LE('jj') + .4)));
  const S = roofs(t, cam, { doorOpen: Math.max(1 - seg(t, 0, .6), seg(zip, .1, .3) * (1 - seg(zip, .8, 1))), inner: sparrowLedge(t), wireBirds: false });
  let g = S.back;
  const qs = on('qs', t), pf = on('pf', t), a2 = on('a2', t), k2 = on('k2', t, .1, .3), a3 = on('a3', t), jj = on('jj', t), danger = t > LS('a2') && t < k2s + .3;
  // Mama steps out of the mumty with a tray of nimbu paani
  const mIn = ease(seg(t, 0, .8)), mx = lerp(MUM5.door + 90, MMX, mIn);
  const mL = pf || a2 ? [-14, 2] : (cryK > .2 || a3 ? [14, 0] : [-10, 4]);
  g += at(1, cam, mx, MMY, ammi, { s: SAM, t, phone: 0, look: mL, brow: pf ? 1 : (cryK > .2 ? .8 : .3), amp: amp('MAMA'), tilt: pf ? -6 : 0, blink: blink(t, 2.7) }, { w: 140 });
  { const h = proj(1, cam, mx + 150 * SAM, MMY - 20 * SAM); g += tray(h.x, h.y, .7 * h.s, grin ? 2 : 3); }
  // Sakina (crying act) to the right of Mama
  const skx = 120, sky = FY + 220;
  g += at(1, cam, skx, sky, sakina, { s: SKR, t, move: cryK > .1 && !grin ? 'cry' : (jj ? 'thumbsUp' : 'idle'), mt: jj ? t - jjs : t, yaw: grin ? 0 : -.5, expr: cryK > .1 && !grin ? 'cry' : (grin ? 'wink' : (danger ? 'scared' : 'neutral')), amp: amp('SAKINA') }, { w: 100 });
  if (grin) { const h = proj(1, cam, skx - 70, sky - 330); g += glassG(h.x, h.y, .9 * h.s); }
  if (cryK > 0) { const f = proj(1, cam, skx + 6, sky - 395 * SKR * 1.18); g += fountain(f.x, f.y, f.s * .9, t, cryK, proj(1, cam, 0, sky + 20).y) + puddle(f.x, proj(1, cam, 0, sky + 30).y, f.s, clamp(cryK * 1.3)); }
  // Qasim: runs in from the right (dance), then zips into the mumty door
  const qIn = ease(seg(t, 0, .5)), dd = Math.sin(t * 16);
  let qx = lerp(420, -120, qIn), qy = FY + 260, qd = 1, qs2 = SQ;
  if (zip > 0) { const z = eout(zip); qx = lerp(-120, MUM5.door + 95, z); qy = lerp(FY + 260, FY + 20, z); qs2 = lerp(SQ, SQ * .85, z); }
  if (zip < .95) g += `<g opacity="${(1 - seg(zip, .8, .95)).toFixed(2)}">` + at(qd, cam, qx, qy, susu, { s: qs2, t, flip: zip > 0 ? -1 : 1, look: qs ? [-10, -6] : [-12, 0], mouth: qs ? 'wobble' : (danger ? 'o' : (jj ? 'grin' : 'wobble')), amp: amp('QASIM'), brow: .9, tilt: zip === 0 ? 6 * dd : 0, legL: zip > 0 || qIn < 1 ? walkK(t, 32) : 16 + 6 * dd, legR: zip > 0 || qIn < 1 ? -walkK(t, 32) : -16 + 6 * dd, armL: zip > 0 ? 150 : 6, armR: zip > 0 ? 150 : 6, blink: blink(t) }, { w: 110 }) + '</g>';
  if (zip > 0 && zip < .9) { const p = proj(1, cam, qx, qy); g += speed(p.x + 40, p.y - 150 * p.s, -1, .8, 5); }
  g += S.front;
  g += tally(6, 'AAJ SUUSUU BREAK:', seg(t, LS('pf') + .2, LS('pf') + .5) * (1 - seg(t, LE('pf') + .2, LE('pf') + .4)));
  if (danger) g += hookBig('RAAZ', 'KHATRE MEIN!', t, LS('a2') + .3, LS('a2') + .6, 260) + sparrowInset(t, seg(t, LS('a2') + .5, LS('a2') + .9) * (1 - seg(t, k2s + .1, k2s + .4)), 830, 640, 170, 'insG');
  if (k2) g += `<g transform="translate(540,300) scale(${back(seg(t, k2s, k2s + .3))})">${burst(0, 0, 230, '#7fd0ff', 'BUAAAA!', 92, 6, 1)}</g>` + T(540, 520, 60, 'CRYING GIRL ON!', { fill: '#fff', shadow: '#2f7fd6', op: clamp((t - k2s - .4) * 4) });
  if (cryK > .2 && !grin) g += violin(150, 420, t, cryK);
  if (a3) g += hookBig('MAMA', 'PIGHAL GAYI!', t, a3s + .3, a3s + .6, 280);
  if (grin && t < jjs) { const f = proj(1, cam, skx + 60, sky - 470); g += burst(f.x, f.y, 70, '#fff', 'TING!', 34, 8, 1); }
  if (zip > .85) { const p = proj(1, cam, MUM5.door + 95, FY - 150); g += burst(p.x, p.y, 100, '#fff', 'DHAP!', 44, 6, 1 - seg(t, LE('jj') + 1.0, D)); }
  return g + capFor('gag', t);
}

// ============ 4 POWER — the aangan WC door glows gold (Mama blurred in the foreground, busy), FLUUSH, power bar, SUUU-SUUU-MAN! (the only narrator line) ============
function E_power(t) {
  const nE = LE('n2'), q = LS('qp'), open = ease(seg(t, q - .45, q - .3)), glow = Math.max(seg(t, .15, nE), open);
  const cam = { x: 270, y: -40, z: lerp(1.0, 1.42, ease(seg(t, 0, q - .4))) + .06 * open, px: 540, py: 900 };
  const S = aangan(t, cam, { open, glow, manoSleep: 1 });
  let g = S.back + heatTint(t, .6);
  const dp = proj(1.3, cam, WC.x + WC.w / 2, 840);
  g += at(1.22, cam, WC.x - 120, 1120, sakina, { s: .95, t, move: open > 0 ? 'thumbsUp' : 'idle', mt: t - q + .4, yaw: .5, expr: open > 0 ? 'wink' : 'smug' }, { w: 100 });
  if (open > 0) g += shafts(dp.x, dp.y, -Math.PI / 2, 14, 1900, .5 * open, t * 3, '#fff6c8', .45, .05);
  if (open > 0) {
    const st = eout(seg(t, q - .3, q + .5)), hero = ease(seg(t, q, q + .3)), up = ease(seg(t, LE('qp') + .45, sdur('power')));
    const dd = lerp(1.3, .95, st);
    g += at(dd, cam, WC.x + WC.w / 2 - 40 * st, lerp(1080, 1240, st) - up * 1300, susu, { s: lerp(SQ, .78, st), t, power: open, cape: open, crown: seg(t, q, q + .3), shades: seg(t, LE('qp') + .1, LE('qp') + .4), armR: lerp(20, 165, hero), fistR: hero > .4, armL: lerp(20, 40, hero), amp: amp('QASIM'), mouth: 'smirk', blink: blink(t, 3), legL: up > 0 ? -20 : 0, legR: up > 0 ? 14 : 0 }, { w: 120, h: up * 1300, op: 1.2 });
    if (up > 0) { const p = proj(dd, cam, WC.x + WC.w / 2, 1240 - up * 1300); g += speed(p.x, p.y + 120, 0, .7, 3); }
  }
  g += `<g filter="url(#dofNear2)">${at(.78, cam, 590, 1450, ammi, { s: SAM, t, phone: 1, look: [4, 14], brow: .2, blink: blink(t, 3.4), tilt: open > 0 ? 3 * Math.sin(t * 20) * (1 - seg(t, q, q + .6)) : 0 }, { w: 0 })}</g>`;
  g += S.front;
  g = shake(g, (open > 0 && open < 1) ? 1 : (glow > .8 && open === 0 ? .3 : 0), t);
  if (t > .5 && t < 2.2) { const k = back(seg(t, .5, .8)); g += `<g transform="translate(540,640) scale(${k})">${burst(0, 0, 230, C.gold, 'FLUUSH!', 104, -8, 1 - seg(t, 1.9, 2.2))}</g>`; }
  const p = ease(seg(t, .7, nE));
  if (t > .6 && open < 1) g += `<g opacity="${seg(t, .6, .8) * (1 - open)}"><rect x="140" y="150" width="800" height="150" rx="30" fill="#000" opacity=".75"/>${T(540, 212, 62, 'SUUSUU POWER', { fill: C.gold, sw: 0, ls: 6 })}<rect x="190" y="235" width="700" height="44" rx="22" fill="#333" stroke="#fff" stroke-width="5"/><rect x="194" y="239" width="${692 * p}" height="36" rx="18" fill="${p > .99 ? '#ff3b30' : C.gold}"/>${T(540, 272, 40, Math.round(p * 100) + '%', { sw: 6 })}${emblem(180, 257, .7)}</g>`;
  if (t > 1.4 && open === 0) g += sparrowInset(t, seg(t, 1.4, 1.7), 820, 600, 190, 'insP');
  if (t > q) { const k = back(seg(t, q, q + .3)); g += `<g transform="translate(540,330) scale(${lerp(2.2, 1, clamp(k))}) rotate(-4)" opacity="${clamp(k * 2)}"><rect x="-460" y="40" width="920" height="40" rx="20" fill="${C.red}" transform="skewX(-20)"/>${T(0, 40, 138, 'SUUU-SUUU-MAN!', { shadow: C.red, sw: 12, ls: 2 })}</g>`; }
  return g + capFor('power', t);
}

// ============ 5 RESCUE — Susuman flies over the hot rooftops (thirsty birds watch), reaches for the sparrow — PHATAAK! the old pipe bursts,
//   the jet blasts the ledge, the sparrow slides off into the gap (IT GETS WORSE) → slow-mo dive → "Pakad liya!" → back up, the jet still wasting water ============
const HOVL = [SPOT[0] + 150, SPOT[1] - 120];
function E_rescue(t) {
  const D = sdur('rescue'), arrive = 3.1, q3E = LE('q3'), burstT = q3E + .25, slideT = burstT + .5, catchT = LS('q4') - .25, upT = LE('q4') + .2, homeT = upT + 1.6;
  const SLOW = t > slideT && t < catchT;
  // Susuman path
  let sx, sy, rot = 0, flip = -1, mouth = 'grin', armL = 150, armR = 150, dive = 0;
  if (t < arrive) { const k = ease(seg(t, 0, arrive)); sx = lerp(-500, HOVL[0], k); sy = lerp(500, HOVL[1], k) - 220 * Math.sin(k * Math.PI); rot = 24 * (1 - seg(t, arrive - .6, arrive)); flip = 1; }
  else if (t < slideT + .2) { sx = HOVL[0] + 6 * Math.sin(t * 2); sy = HOVL[1] + 12 * Math.sin(t * 3); armL = 120; armR = 40; mouth = on('q3', t) ? 'talk' : (t > burstT ? 'o' : 'grin'); }
  else if (t < catchT + .1) { const k = ease(seg(t, slideT + .2, catchT)); sx = lerp(HOVL[0], SPOT[0] + 30, k); sy = lerp(HOVL[1], FY + 1000, k); rot = lerp(0, 160, ease(seg(t, slideT + .2, slideT + .8))); dive = 1; armL = 170; armR = 170; mouth = 'shout'; }
  else if (t < homeT) { const k = ease(seg(t, upT, homeT)); sx = lerp(SPOT[0] + 30, PJ + 220, k); sy = lerp(FY + 1000, FY - 140, k); rot = lerp(160, 0, ease(seg(t, catchT, catchT + .6))); armL = 165; armR = 165; mouth = 'grin'; }
  else { sx = PJ + 220 + 5 * Math.sin(t * 2); sy = FY - 140 + 10 * Math.sin(t * 3); armL = 165; armR = 165; mouth = on('d3', t) ? 'o' : 'frown'; }
  // sparrow path
  let bx = SPOT[0], by = SPOT[1], brot = 8, bpose = 'faint', held = t > catchT;
  if (t > slideT && t < catchT) { const k = seg(t, slideT, catchT); bx = SPOT[0] + 40 + 30 * Math.sin(k * 6); by = lerp(SPOT[1], FY + 1000 - 230 * SQ * .9, k); brot = 8 + 260 * k; bpose = 'fly'; }
  // camera
  let cam = camR(Math.max(sx, -300) + 140, .72, 1000, 540, 900);
  cam = lerpCam(cam, camR(SPOT[0] + 40, 1.45, 1080, 540, SPOT[1] - 80), ease(seg(t, arrive - .7, arrive + .2)));
  cam = lerpCam(cam, camR(PJ + 120, 1.05, 1050, 540, FY + 120), ease(seg(t, burstT - .25, burstT + .15)));                  // whip to the pipe as it bursts
  cam = lerpCam(cam, camR(SPOT[0], 1.25, 900, 540, FY + 480), ease(seg(t, slideT, slideT + .8)));                           // tilt down the gap
  cam = lerpCam(cam, camR(SPOT[0], 1.5, 1000, 540, FY + 860), ease(seg(t, catchT - 1.2, catchT)));
  cam = lerpCam(cam, camR(PJ + 120, .82, 1150, 540, FY + 80), ease(seg(t, upT, homeT)));
  const burstK = seg(t, burstT, burstT + .15), jetK = burstK;
  const inner = (t < slideT || t > catchT ? '' : '') + runoff(t, seg(t, burstT + .3, burstT + 1.5)) + jet(t, jetK, t < homeT ? SPOT[0] + 10 : 2010, t < homeT ? SPOT[1] - 30 : FY + 200);
  const S = roofs(t, cam, { noFG: t > slideT && t < homeT - .3 ? 1 : 0, inner: (held ? '' : chidiya({ x: bx, y: by, s: .95, pose: bpose, pant: 1, t, rot: brot })) + inner, shake: seg(t, q3E - .4, burstT), burst: burstK, wireBirds: true, look: (x, i) => (sx > x ? 1 : -1) * (i % 2 ? -1 : 1) });
  let g = S.back;
  // Basim (soaked after the burst) on his roof
  const wet = t > burstT + .2;
  g += at(1, cam, BX, BY, basim, { s: SKR, t, move: t > burstT ? 'scared' : 'point', mt: t, yaw: .7, expr: t > burstT ? 'surprised' : 'happy' }, { w: 90 });
  // Susuman
  const sp = proj(1, cam, sx, sy), sc = .62 * sp.s;
  g += liftShadow(sp.x, proj(1, cam, sx, FY + 260).y, 120 * sp.s, 600, { op: .5 });
  if (t < arrive || dive) g += speed(sp.x - (dive ? 0 : 120), sp.y - 170 * sc, dive ? 0 : 1, .6, 5);
  g += susuFly(sp.x, sp.y, sc, t, { rot: (flip > 0 ? 1 : 1) * rot, flip, mouth, amp: amp('QASIM'), armL, armR, shades: 1 });
  if (held) { const h = susHand(sp.x, sp.y, sc, 165, 1, flip); g += chidiya({ x: h[0] - 30 * sc * flip, y: h[1] + 50 * sc, s: .95 * sp.s, pose: t > upT ? 'stand' : 'faint', pant: 1, t, rot: rot > 90 ? 180 : 0, flip }); }
  // water in his face at the burst (comic sputter)
  if (t > burstT && t < burstT + 1.0) { const k = seg(t, burstT, burstT + 1.0); for (let i = 0; i < 10; i++) g += `<circle cx="${sp.x + (hs(i) - .5) * 220 * sc * 2}" cy="${sp.y - 480 * sc + (hs(i + 9) - .3) * 200 * sc + 200 * k * k}" r="${10 * sp.s}" fill="#9adcff" stroke="#2f7fd6" stroke-width="2" opacity="${1 - k}"/>`; }
  g += S.front;
  // slow-mo vignette + label during the fall
  if (SLOW) { const k = seg(t, slideT, slideT + .3) * (1 - seg(t, catchT - .2, catchT)); g += `<rect width="1080" height="1920" fill="#0a2a4a" opacity="${(.22 * k).toFixed(2)}"/>` + vig(.8 * k) + T(540, 560, 74, 'SLOW-MO...', { fill: '#bfe8ff', shadow: '#000', op: k });
    // Zahra + Basim react (inset, top left)
    const ic = camR(ZHX, .8, 900, 230, FY - 190), sub = roofs(t, ic, { motes: false, noFG: 1, wireBirds: false });
    g += inset(230, 900, 160 * back(k), sub.back + at(1, ic, ZHX, ZHY, zahra, { s: SKR, t, move: 'shout', mt: t, yaw: .4, expr: 'scared', amp: amp('ZAHRA MISS') }, { w: 0 }), 'insZ'); }
  if (t > burstT - .05 && t < burstT + 1.1) { const p = proj(1, cam, PJ, PY - 40); g += `<g transform="translate(${p.x},${p.y - 200}) scale(${back(seg(t, burstT, burstT + .25))})">${burst(0, 0, 200, '#7fd0ff', 'PHATAAK!', 74, -8, 1 - seg(t, burstT + .8, burstT + 1.1))}</g>`; }
  if (t > burstT + .4 && t < slideT + .9) g += hookBig('TANKI', 'PHAT GAYI!', t, burstT + .4, burstT + .65, 250);
  if (on('q4', t, .1, .5)) { const p = proj(1, cam, sx, sy - 300); g += `<g transform="translate(${p.x},${p.y}) scale(${back(seg(t, LS('q4'), LS('q4') + .25))})">${burst(0, 0, 150, C.gold, 'PAKAD LIYA!', 52, 5, 1)}</g>` + sparkleRing(p.x, p.y + 200, t, 1); }
  if (on('d3', t)) { const k = seg(t, LS('d3') - .2, LS('d3') + .1), ic = camR(DX + 20, .85, 620, 830, DY - 330), sub = roofs(t, ic, { motes: false, noFG: 1, wireBirds: false });
    g += inset(830, 620, 170 * back(k), sub.back + dadiAt(ic, t, { move: 'holdHead', mt: t, expr: 'scared', amp: amp('DADI') }), 'insD'); g += hookBig('PAANI', 'BEH RAHA HAI!', t, LS('d3') + .3, LS('d3') + .55, 250); }
  if (t < arrive) g += hook2('SUUSUU-MAN AAYA!', t, .4, 330, 92, '#fff');
  g = shake(g, t > burstT && t < burstT + .35 ? 1 : 0, t);
  return g + capFor('rescue', t);
}
function sparkleRing(x, y, t, k) { let g = ''; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * 2, r = 120 + 20 * Math.sin(t * 6 + i); g += `<path transform="translate(${(x + Math.cos(a) * r).toFixed(1)},${(y + Math.sin(a) * r * .6).toFixed(1)}) scale(${.6 * k})" d="M0,-30 L8,-8 L30,0 L8,8 L0,30 L-8,8 L-30,0 L-8,-8Z" fill="${C.gold}" stroke="#fff" stroke-width="3"/>`; } return g; }

// ============ 6 FIX — he sets the sparrow down, bends the burst pipe into a gooseneck over a clay kunda: the jet becomes a gentle drip;
//   the sparrow drinks and revives; a flock arrives (pigeons, myna, tota, crow); Basim (soaked): "Waah!"; the sparrow perches on his finger; wink; whoosh ============
function E_fix(t) {
  const D = sdur('fix'), bendT0 = .7, bendT1 = 2.4, q5 = on('q5', t), b2 = on('b2', t), drinkT = LE('q5') - .6, flockT = LE('q5') + .1, perchT = LE('b2') + .2, offT = D - .9;
  const bend = seg(t, bendT0, bendT1), lvl = seg(t, bendT1 - .2, bendT1 + 1.6);
  let cam = camR(PJ + 80, 1.25, 1100, 540, FY + 20);
  cam = lerpCam(cam, camR(KUNDA[0] + 40, 1.7, 1180, 540, KUNDA[1] - 40), ease(seg(t, LS('q5') + .6, drinkT + .4)));
  cam = lerpCam(cam, camR(KUNDA[0] + 20, 1.3, 1200, 540, FY + 60), ease(seg(t, flockT, flockT + 1.0)));
  cam = lerpCam(cam, camR(KUNDA[0] + 120, 1.2, 1050, 540, FY - 120), ease(seg(t, perchT, perchT + .8)));
  // sparrow: on the floor next to the kunda → hops to the rim → drinks → revives (fluff, happy) → flies to Susuman's finger
  const rev = seg(t, drinkT + .6, drinkT + 1.4);
  let bx = KUNDA[0] - 140, by = KUNDA[1] + 10, bpose = rev > 0 ? 'stand' : 'faint', bflip = 1, brot = rev > 0 ? 0 : 8;
  if (t > LS('q5')) { const k = ease(seg(t, LS('q5'), drinkT)); bx = lerp(KUNDA[0] - 140, KUNDA[0] - 70, k); by = lerp(KUNDA[1] + 10, KUNDA[1] - 34, k) - 30 * Math.sin(k * Math.PI * 3) * (k < 1 ? 1 : 0); bpose = k < 1 && k > 0 ? 'hop' : (t > drinkT && t < drinkT + 1.0 ? 'drink' : bpose); brot = 0; }
  // Susuman (hovering by the pipe, then the kunda)
  const sX = lerp(PJ + 220, KUNDA[0] + 210, ease(seg(t, bendT1, bendT1 + .6))), sY = FY - 140 + 10 * Math.sin(t * 3) - 1800 * seg(t, offT, D) ** 2;
  if (t > perchT) { const h = susHand(proj(1, cam, sX, sY).x, 0, 1, 165, 1, -1); }
  let fly = '';
  if (t > perchT - .5) { const k = ease(seg(t, perchT - .5, perchT + .2)), hx = sX - 150, hy = sY - 420; bx = lerp(KUNDA[0] - 70, hx, k); by = lerp(KUNDA[1] - 34, hy, k) - 120 * Math.sin(k * Math.PI); bpose = k < 1 ? 'fly' : 'stand'; bflip = 1; }
  if (t > offT - .2) { bx = sX - 150; by = sY - 420; }
  const flock = seg(t, flockT, flockT + 1.6);
  let birdsSvg = '';
  const FL = [['kabootar', -230, -6, 1, .55], ['myna', 120, -40, -1, .75], ['tota', 210, 4, -1, .7], ['kauwa', -320, 20, 1, .7], ['chidiya', 60, 30, -1, .7], ['kabootar', 290, 40, -1, .5]];
  FL.forEach(([kind, dx, dy, f, s], i) => {
    const k = ease(seg(flock, i * .1, .5 + i * .1)); if (k <= 0) return;
    const x = lerp(KUNDA[0] + dx * 3 - 600 * f, KUNDA[0] + dx, k), y = lerp(KUNDA[1] - 900, KUNDA[1] + dy, k), dr = k >= 1 && Math.sin(t * 3 + i) > .3;
    if (kind === 'kabootar') birdsSvg += kabootar({ x, y, s: s * .9, flip: f, t: t + i, pose: k < 1 ? 'fly' : 'perch', bob: dr ? 1 : 0 });
    else birdsSvg += bird({ kind, x, y, s, flip: f, t: t + i, pose: k < 1 ? 'fly' : (dr ? 'drink' : 'stand'), happy: dr ? 0 : 1 });
  });
  const inner = kunda(KUNDA[0], KUNDA[1], 1, lvl, t, bend >= 1 ? 1 : 0) + jet(t, 1 - bend, lerp(2010, KUNDA[0] + 30, bend), lerp(FY + 200, KUNDA[1] - 60, bend)) + runoff(t, 1 - seg(t, bendT1, bendT1 + 1.5))
    + birdsSvg + (t < perchT + .2 ? chidiya({ x: bx, y: by, s: .95, pose: bpose, pant: rev > 0 ? (b2 ? .6 : 0) : 1, t, rot: brot, flip: bflip, happy: rev > .5 && bpose !== 'drink' ? 1 : 0, fluff: rev }) : '');
  const S = roofs(t, cam, { inner, bend, burst: 1, wireBirds: true, pant: 1 - flock });
  let g = S.back;
  g += at(1, cam, BX, BY, basim, { s: SKR, t, move: b2 ? 'celebrate' : (t > flockT ? 'clap' : 'scared'), mt: t, yaw: .5, expr: t > flockT ? 'happy' : 'surprised', amp: amp('BASIM') }, { w: 90 });
  { const p = proj(1, cam, BX + 10, BY - 470); g += sweat(p.x, p.y, 1.1 * p.s, t, .9); }   // drips: Basim got soaked
  const sp = proj(1, cam, sX, sY), sc = .62 * sp.s, strain = bend > 0 && bend < 1;
  g += liftShadow(sp.x, proj(1, cam, sX, FY + 200).y, 120 * sp.s, 400, { op: .5 });
  g += susuFly(sp.x + (strain ? 4 * Math.sin(t * 50) : 0), sp.y, sc, t, { flip: -1, rot: 0, mouth: q5 ? 'talk' : (strain ? 'frown' : 'grin'), amp: amp('QASIM'), armL: strain ? 120 : (t > perchT ? 40 : 60), armR: strain ? 120 : (t > perchT ? 165 : 60), brow: strain ? 1 : 0, wink: t > perchT + .6 && t < perchT + 1.1 ? 1 : 0 });
  if (t > perchT + .1 && t < D) { const h = susHand(sp.x, sp.y, sc, 165, 1, -1); g += chidiya({ x: h[0], y: h[1] - 20 * sc, s: .95 * sp.s, pose: 'stand', t, happy: 1, flip: 1, fluff: 1, pant: (t * 2) % 1 < .3 ? .7 : 0 }); }
  if (t > offT) { g += speed(sp.x, sp.y + 140, 0, .8, 4); }
  g += S.front;
  if (strain) g += `<g transform="translate(540,320) scale(${back(seg(t, bendT0, bendT0 + .3))})">${burst(0, 0, 170, '#fff', 'HMMPF!', 70, -6, 1)}</g>`;
  if (t > bendT1 && t < LS('q5') + .4) g += hookBig('PAANI', 'GHAR!', t, bendT1 + .05, bendT1 + .3, 260);
  if (t > drinkT + .7 && t < flockT + .8) { const p = proj(1, cam, bx + 30, by - 100); g += sparkleRing(p.x, p.y, t, 1) + T(p.x, p.y - 170, 56, 'CHEEK CHEEK!', { fill: '#fff', shadow: C.red, op: seg(t, drinkT + .8, drinkT + 1.0) }); }
  if (t > flockT + .6 && t < perchT) g += hookBig('SAB PARINDE', 'KHUSH!', t, flockT + .7, flockT + 1.0, 250);
  return g + capFor('fix', t);
}

// ============ 7 SECRET — Qasim strolls out of the mumty (hair still dripping): "Kuch nahi Mama!"; Dadi: "Koi hero aaya tha…"; "Mujhe to suusuu aayi thi!"; Sakina winks ============
function E_secret(t) {
  const D = sdur('secret'), kt = on('kt', t), kn = on('kn', t), d2 = on('d2', t), q6 = on('q6', t), wk = t > LE('q6') - .2;
  let cam = camR(-220, 1.05, 1150, 540, 1150);
  cam = lerpCam(cam, camR(-60, .9, 1150, 540, 1150), ease(seg(t, LS('d2') - .3, LS('d2') + .5)));
  cam = lerpCam(cam, camR(80, 1.25, 1120, 540, 1120), ease(seg(t, LE('q6') - .3, D)));
  const S = roofs(t, cam, { doorOpen: seg(t, 0, .3) * (1 - seg(t, 1.2, 1.5)), inner: kunda(KUNDA[0], KUNDA[1], 1, 1, t, 1) + [0, 1, 2].map(i => bird({ kind: ['myna', 'chidiya', 'tota'][i], x: KUNDA[0] - 90 + i * 90, y: KUNDA[1] - 20 + 10 * i, s: .7, t: t + i, pose: Math.sin(t * 3 + i) > .2 ? 'drink' : 'stand', flip: i % 2 ? -1 : 1 })).join(''), wireBirds: false });
  let g = S.back;
  g += dadiAt(cam, t, { move: d2 ? 'talk' : 'sit', mt: t, expr: d2 ? 'happy' : 'surprised', amp: amp('DADI') });
  g += at(1, cam, -420, FY + 160, ammi, { s: SAM, t, phone: 0, look: kt ? [-14, 0] : [12, 0], brow: kt ? .8 : .2, amp: amp('MAMA'), blink: blink(t, 2.6) }, { w: 140 });
  g += at(1, cam, SAX, SAY, sakina, { s: SKR, t, move: wk ? 'thumbsUp' : 'idle', mt: t - LE('q6') + .2, yaw: wk ? 0 : -.4, expr: wk ? 'wink' : 'smug' }, { w: 100 });
  const qIn = ease(seg(t, .1, .9)), qx = lerp(MUM5.door + 95, -230, qIn), qy = lerp(FY + 30, FY + 250, qIn);
  g += at(1, cam, qx, qy, susu, { s: SQ, t, look: kn || q6 ? [-12, -4] : [8, -4], mouth: kn || q6 ? 'talk' : 'smirk', amp: amp('QASIM'), wink: t > LE('kn') - .2 && t < LE('kn') + .4 ? 1 : 0, legL: qIn < 1 ? walkK(t, 24) : 0, legR: qIn < 1 ? -walkK(t, 24) : 0, armL: 20, armR: q6 ? 120 : 20, blink: blink(t) }, { w: 110 });
  { const p = proj(1, cam, qx, qy - 640 * SQ); g += sweat(p.x, p.y, 1.2 * p.s, t, .9); }   // wet hair
  g += S.front;
  if (kn) g += shhh(900, 560, back(seg(t, LS('kn'), LS('kn') + .3)) * .9);
  if (d2) g += hookBig('KOI', 'HERO AAYA THA!', t, LS('d2') + .4, LS('d2') + .7, 250);
  if (wk) g += T(540, 330, 90, 'SHHH... RAAZ!', { fill: C.gold, shadow: '#000', op: clamp((t - LE('q6') + .2) * 3) });
  return g + capFor('secret', t);
}

// ============ 8 TV — Daniel + Amara: "Mystery hero ne garmi mein chidiya ko bachaya!"; the family on the charpai; Sakina's wink ============
const TVP = { x: 330, y: 1250, w: 330, h: 230 };
function tvNews(t, w, h) {
  let g = `<rect width="${w}" height="${h}" fill="#123a6b"/><rect y="${h * .55}" width="${w}" height="${h * .45}" fill="#0b2a52"/>`;
  for (let i = 0; i < 6; i++) g += `<circle cx="${w * (.1 + i * .17)}" cy="${h * .25}" r="${h * .05}" fill="#fff" opacity=".12"/>`;
  // inset footage: a kunda on a roof with birds drinking
  g += `<rect x="${w * .58}" y="${h * .1}" width="${w * .36}" height="${h * .36}" fill="#ffe3b3" stroke="#fff" stroke-width="3"/><rect x="${w * .58}" y="${h * .33}" width="${w * .36}" height="${h * .13}" fill="#d9b48a"/><g transform="translate(${w * .76},${h * .4}) scale(.16)">${kunda(0, 0, 1, 1, t)}${chidiya({ x: -60, y: -20, s: 1, pose: Math.sin(t * 3) > 0 ? 'drink' : 'stand', t })}${bird({ kind: 'tota', x: 70, y: -16, s: 1, flip: -1, t })}</g>`;
  g += daniel({ x: w * .2, y: h * .99, s: .24, t, move: on('v1', t) ? 'present' : 'idle', mt: t, yaw: .2, expr: 'happy', amp: amp('DANIEL') }) + amara({ x: w * .43, y: h * .99, s: .24, t, move: on('v2', t) ? 'talk' : 'listen', mt: t, yaw: -.2, expr: 'happy', amp: amp('AMARA') });
  g += `<rect y="${h * .78}" width="${w}" height="${h * .12}" fill="#c8102e"/>${T(w * .03, h * .87, h * .085, 'BREAKING NEWS', { anchor: 'start', sw: 0, ls: 1 })}`;
  const msg = 'MYSTERY HERO NE CHIDIYA BACHAYI!  ·  CHHAT PAR PAANI GHAR!  ·  ';
  g += `<rect y="${h * .9}" width="${w}" height="${h * .1}" fill="#fff"/><clipPath id="tk"><rect y="${h * .9}" width="${w}" height="${h * .1}"/></clipPath><g clip-path="url(#tk)">${T(w - ((t * 60) % (w * 2.6)), h * .975, h * .07, msg + msg, { anchor: 'start', fill: '#111', sw: 0, ls: 1, font: 'Baloo2', weight: 800 })}</g>`;
  return g;
}
function tvSet(t) {
  const { x, y, w, h } = TVP;
  return castShadow(x, y + 8, 220, 110, .25) + `<rect x="${x - 100}" y="${y - 120}" width="200" height="120" fill="#8a5a32" stroke="${C.ink}" stroke-width="5"/><rect x="${x - w / 2 - 14}" y="${y - 134 - h - 14}" width="${w + 28}" height="${h + 28}" rx="16" fill="#222" stroke="${C.ink}" stroke-width="6"/>
    <g transform="translate(${x - w / 2},${y - 134 - h})">${tvNews(t, w, h)}</g><rect x="${x - w / 2}" y="${y - 134 - h}" width="${w}" height="${h}" fill="url(#poolW)" opacity=".18"/>`;
}
function E_tv(t) {
  const D = sdur('tv'), pull = ease(seg(t, 1.6, 3.2)), wk = t > LE('v2') - .4;
  const sc = { x: TVP.x, y: TVP.y - 134 - TVP.h / 2 };
  let cam = { x: sc.x - 540, y: sc.y - 760, z: 3.0, px: 540, py: 760 };
  cam = lerpCam(cam, { x: 200, y: 0, z: 1.0, px: 600, py: 960 }, pull);
  cam = lerpCam(cam, { x: 250, y: 30, z: 1.12, px: 700, py: 1000 }, ease(seg(t, LS('v2'), D)));
  const S = aangan(t, cam, { eve: 1, noMano: 0, manoSleep: 1 });
  let g = S.back;
  g += layer(1, cam, tvSet(t) + lightPool(TVP.x, TVP.y + 20, 360, 90, .55, 'poolW'), { f: '' });
  g += at(1.02, cam, 1150, 1150, dadi, { s: .95, t, move: 'sit', mt: 5, yaw: -.6, expr: wk ? 'love' : 'happy' }, { w: 0 });
  g += at(1.02, cam, 1420, 1250, ammi, { s: SAM * .9, t, phone: 0, look: [-14, 0], brow: .2, blink: blink(t, 2.8) }, { w: 0 });
  g += at(1.06, cam, 820, 1225, sakina, { s: .95, t, move: wk ? 'thumbsUp' : 'idle', mt: t - LE('v2') + .4, yaw: wk ? -.5 : -.6, expr: wk ? 'wink' : 'smug' }, { w: 100 });
  g += at(1, cam, 640, 1250, susu, { s: SQ, t, flip: -1, armL: 25, armR: 25, mouth: wk ? 'smirk' : 'frown', wink: t > LE('v2') - .2 && t < LE('v2') + .3 ? 1 : 0, look: wk ? [14, -4] : [-14, -6], blink: blink(t, 2.8) }, { w: 110 });
  g += S.front;
  if (pull < .5) g += hookBig('MYSTERY', 'HERO KAUN?', t, LS('v1') + 1.0, LS('v1') + 1.3, 250);
  if (wk) g += T(540, 330, 90, 'SHHH... RAAZ!', { fill: C.gold, shadow: '#000', op: clamp((t - LE('v2') + .4) * 3) });
  return g + capFor('tv', t);
}

// ============ 9 LESSON — along the rooftops the kids put out water bowls; birds come; Zahra Miss: "garmi mein chhat par parindon ke liye paani zaroor rakho!" ============
function E_lesson(t) {
  const D = sdur('lesson'), P = ease(seg(t, 0, D));
  const cam = camR(lerp(-100, 900, P), .72, 1150, 540, 1120);
  const BW = [[-260, 0.5], [420, 1.3], [1100, 2.1], [1600, 2.8]];
  let inner = '';
  BW.forEach(([x, at0], i) => { const k = seg(t, at0, at0 + .4); if (k <= 0) return; inner += kunda(x, FY + 120, .7, k, t + i); const bk = ease(seg(t, at0 + .4, at0 + 1.4)); if (bk > 0) inner += bird({ kind: ['chidiya', 'myna', 'kauwa', 'tota'][i], x: lerp(x - 500, x - 60, bk), y: lerp(FY - 700, FY + 108, bk), s: .65, t: t + i, pose: bk < 1 ? 'fly' : (Math.sin(t * 3 + i) > 0 ? 'drink' : 'stand'), happy: 1 }); });
  inner += kunda(KUNDA[0], KUNDA[1], 1, 1, t, 1);
  const S = roofs(t, cam, { inner, heat: .6, wireBirds: false });
  let g = S.back;
  g += at(1, cam, ZHX, ZHY, zahra, { s: SKR, t, move: on('z3', t) ? 'talk' : 'thumbsUp', mt: t, yaw: -.2, expr: 'happy', amp: amp('ZAHRA MISS') }, { w: 110 });
  g += dadiAt(cam, t, { move: 'clap', mt: t, expr: 'happy' });
  const kids = [[-200, susu, 'q'], [260, sakina, 'k'], [1160, basim, 'b']];
  kids.forEach(([x, fn, id], i) => { const bend = Math.max(0, Math.sin(seg(t, BW[i][1] - .4, BW[i][1] + .4) * Math.PI));
    if (id === 'q') g += at(1, cam, x + 40, FY + 250, susu, { s: SQ, t, look: [10, 6], mouth: 'grin', armL: 40 + 60 * bend, armR: 40 + 60 * bend, tilt: 10 * bend, blink: blink(t) }, { w: 110 });
    else g += at(1, cam, x + 60, FY + 230, fn, { s: SKR, t, move: bend > .2 ? 'present' : 'clap', mt: t, yaw: .4, expr: 'happy' }, { w: 100 }); });
  g += S.front;
  g += `<g transform="translate(540,280) scale(${back(seg(t, .5, .8))}) rotate(-3)">${T(0, 0, 92, 'PARINDON KE LIYE', { shadow: '#000', sw: 10 })}${T(0, 120, 120, 'PAANI RAKHO!', { fill: C.gold, shadow: C.red, sw: 12 })}</g>`;
  return g + capFor('lesson', t);
}

// ============ 10 CLIFFHANGER — "AGLE EPISODE MEIN…": the yellow SCHOOL VAN rolls down the dhalaan with nobody at the wheel; kids scream in the windows ============
function schoolVan(x, y, s, t, roll) {
  return `<g>${bus(x, y, s, '#ffcf1a', { flip: 1, roll, seed: 3, board: 'SCHOOL VAN' })}</g>`;
}
function E_cliff(t) {
  const D = sdur('cliff'), vx = 700 + 520 * t;
  const cam = camG(vx + 120, 1.05 + .08 * t, 1180, 540, 40);
  const S = dhalaan(t, cam, {});
  let g = S.back;
  const p = proj(1, cam, vx, G(vx) + 30), a = slopeAng(vx);
  g += castShadow(p.x, p.y, 700 * p.s * .5, 120 * p.s, .25) + `<g transform="rotate(${(a + 1.5 * Math.sin(t * 30)).toFixed(2)} ${p.x} ${p.y})">${schoolVan(p.x, p.y, .5 * p.s, t, vx / 40)}</g>`;
  // empty driver seat marker + screaming bubbles
  g += T(p.x + 230 * p.s, p.y - 330 * p.s, 46, 'KHAALI!', { fill: '#fff', shadow: C.red, op: seg(t, .3, .5) });
  for (let i = 0; i < 3; i++) g += burst(p.x - 220 * p.s + i * 170 * p.s, p.y - 600 * p.s, 54, '#fff', ['AAA!', 'BACHAO!', 'AAA!'][i], 26, i * 8 - 8, seg(t, .2 + i * .15, .4 + i * .15));
  const bxp = vx - 600 - 60 * t;
  g += onLane(1, cam, bxp, basim, { s: SKR, t, move: 'run', mt: t, yaw: Math.PI / 2, expr: 'scared', amp: amp('BASIM') });
  g += S.front + speed(p.x - 380 * p.s, p.y - 200 * p.s, 1, .7, 5);
  g += `<rect width="1080" height="1920" fill="#000" opacity=".25"/>` + vig(.9);
  g += `<g transform="translate(540,300) scale(${back(seg(t, 0, .3))}) rotate(-3)">${T(0, 0, 100, 'AGLE EPISODE', { shadow: '#000', sw: 11 })}${T(0, 130, 120, 'MEIN...', { fill: C.gold, shadow: C.red, sw: 12 })}</g>`;
  g = shake(g, .5, t);
  const f2 = seg(t, D - .25, D); if (f2 > 0) g += `<rect width="1080" height="1920" fill="#fff" opacity="${f2}"/>`;
  return g + capFor('cliff', t);
}
function onLane(d, cam, x, fn, o) { return at(d, cam, x, G(x) + 40, fn, o, { w: 90 }); }

// ============ 11 END SCREEN — Susuman waving (sparrow on his crown), "LIKE aur SUBSCRIBE karo!" (Qasim), room for YouTube's end-screen elements ============
function E_endcard(t) {
  const cam = { x: 30 * Math.sin(t * .4), y: 0, z: 1 + .05 * t / sdur('endcard') };
  let g = layer(4, cam, brushBg(t + 90), { f: '' });
  g += layer(1, cam, shadow(330, 1255, 200, .8) + lightPool(330, 1250, 380, 70, .8) + susu({ x: 330, y: 1250, s: .85, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 30, armR: 150 + 18 * Math.sin(t * 7), mouth: on('qe', t) ? 'talk' : 'grin', amp: amp('QASIM'), blink: blink(t, 2.6) }) + chidiya({ x: 330 + 10, y: 1250 - 685 * .85, s: 1.1, t, pose: 'stand', happy: 1, fluff: 1, pant: (t * 1.5) % 1 < .25 ? .8 : 0 }) + kunda(720, 1240, 1.2, 1, t) + bird({ kind: 'tota', x: 640, y: 1200, s: 1, t, flip: 1, happy: 1 }) + kabootar({ x: 820, y: 1205, s: .6, flip: -1, t, pose: 'perch' }), { f: '' });
  let sp = ''; for (let i = 0; i < 9; i++) { const x = ((i * 157 + t * 60) % 1300) - 110, y = 200 + (i * 211) % 1500; sp += `<path d="M${x},${y - 40} L${x + 10},${y} L${x},${y + 40} L${x - 10},${y}Z M${x - 40},${y} L${x},${y - 10} L${x + 40},${y} L${x},${y + 10}Z" fill="${C.gold}" opacity=".8"/>`; }
  g += layer(.6, cam, sp);
  const k = back(seg(t, .2, .5)), clicked = t > 3.4;
  g += `<g transform="translate(540,290) scale(${k})">${T(0, 0, 100, 'LIKE aur SUBSCRIBE', { shadow: '#000' })}${T(0, 110, 90, 'KARO!', { fill: C.gold, shadow: C.red })}</g>`;
  g += `<g transform="translate(540,1560) scale(${back(seg(t, .5, .8)) * (Math.abs(t - 3.3) < .1 ? .92 : 1)})"><rect x="-300" y="-70" width="600" height="140" rx="70" fill="${clicked ? '#555' : '#ff0000'}" stroke="#fff" stroke-width="6"/>${T(0, 28, 76, clicked ? 'SUBSCRIBED' : 'SUBSCRIBE', { sw: 0, ls: 4 })}</g>`;
  const cx = lerp(900, 640, ease(seg(t, 2.4, 3.2))), cy = lerp(1800, 1590, ease(seg(t, 2.4, 3.2)));
  if (t > 2.4 && t < 4.4) g += `<path d="M${cx},${cy} l0,80 l20,-18 l14,32 l14,-6 l-14,-30 l28,-2z" fill="#fff" stroke="#000" stroke-width="5"/>`;
  if (clicked) g += `<g transform="translate(540,1700) scale(${back(seg(t, 3.5, 3.8))})"><rect x="-260" y="-38" width="520" height="76" rx="38" fill="${C.gold}" stroke="#000" stroke-width="5"/>${T(0, 18, 46, 'AGLI KAHANI JALD!', { fill: '#000', sw: 0, ls: 1 })}</g>`;
  return g + capFor('endcard', t);
}
// native 16:9 end screen: Susuman waving on the left third; two EMPTY boxes on the right for YouTube's end-screen video + subscribe elements
function E_endcardW(t) {
  let g = `<g transform="translate(${-30 + 20 * Math.sin(t * .4)},0)">${brushBg(t + 90).replace(/<rect width="1080" height="1920"/g, '<rect x="-200" y="-200" width="2400" height="1500"')}</g>`;
  g += `<rect width="1920" height="1080" fill="#000" opacity=".18"/>`;
  g += shadow(390, 1000, 220, .8) + lightPool(390, 995, 400, 70, .8) + susu({ x: 390, y: 995, s: .78, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 30, armR: 150 + 18 * Math.sin(t * 7), mouth: on('qe', t) ? 'talk' : 'grin', amp: amp('QASIM'), blink: blink(t, 2.6) }) + chidiya({ x: 400, y: 995 - 685 * .78, s: 1.0, t, pose: 'stand', happy: 1, fluff: 1, pant: (t * 1.5) % 1 < .25 ? .8 : 0 });
  g += `<g transform="translate(390,150) scale(${back(seg(t, .2, .5))}) rotate(-3)">${T(0, 0, 76, 'LIKE aur SUBSCRIBE', { shadow: '#000' })}${T(0, 86, 70, 'KARO!', { fill: C.gold, shadow: C.red })}</g>`;
  // the two empty end-screen boxes (YouTube places its own elements over them)
  const bk = back(seg(t, .4, .8));
  g += `<g opacity="${clamp(bk).toFixed(2)}"><rect x="1010" y="170" width="800" height="450" rx="26" fill="#000" opacity=".28" stroke="#fff" stroke-width="6" stroke-dasharray="26 14"/><circle cx="1410" cy="830" r="150" fill="#000" opacity=".28" stroke="#fff" stroke-width="6" stroke-dasharray="26 14"/></g>`;
  let sp = ''; for (let i = 0; i < 7; i++) { const x = ((i * 257 + t * 60) % 2100) - 90, y = 120 + (i * 151) % 850; sp += `<path d="M${x},${y - 30} L${x + 8},${y} L${x},${y + 30} L${x - 8},${y}Z M${x - 30},${y} L${x},${y - 8} L${x + 30},${y} L${x},${y + 8}Z" fill="${C.gold}" opacity=".7"/>`; }
  return g + sp;
}
