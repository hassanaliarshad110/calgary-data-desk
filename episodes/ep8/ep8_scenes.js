// Episode 8 "Gaay Aur Traffic Jam" — scenes. Each takes local time t; dialogue times come from TL (timeline.js).
// 2.5D: the rooftop row (chhatein()) and the aangan (aangan()) are parallax layer stacks; characters are placed at a depth with at()/proj().
const LS = id => L(id).s, LE = id => L(id).s + L(id).d;
const sdur = id => TL.scenes.find(s => s.id === id).dur;
const SQ = .55 * KS, SAM = .92, SKR = 1.0;
const on = (id, t, a = .1, b = .15) => t > LS(id) - a && t < LE(id) + b;
const lerpCam = (a, b, k) => ({ x: lerp(a.x || 0, b.x || 0, k), y: lerp(a.y || 0, b.y || 0, k), z: lerp(a.z ?? 1, b.z ?? 1, k), px: lerp(a.px ?? 540, b.px ?? 540, k), py: lerp(a.py ?? 960, b.py ?? 960, k) });
const susHand = (x, y, s, ang, side = 1, flip = 1) => [x + flip * s * side * (98 + 158 * Math.sin(ang * Math.PI / 180)), y + s * (-312 + 158 * Math.cos(ang * Math.PI / 180))];
const vig = op => `<rect width="1080" height="1920" fill="url(#vig)" opacity="${op}"/>`;
const walkK = (t, f = 26) => Math.sin(t * f) * 26;
function rewindFx(u, k, txt) {
  let g = `<rect width="1080" height="1920" fill="#1b2a6b" opacity="${.25 * k}"/>`;
  for (let y = (u * 900) % 24; y < 1920; y += 24) g += `<rect x="0" y="${y}" width="1080" height="6" fill="#fff" opacity=".07"/>`;
  g += `<rect x="0" y="${(u * 1400) % 1920}" width="1080" height="40" fill="#fff" opacity=".12"/>`;
  g += `<g transform="translate(90,560)" opacity="${clamp(k * 3)}"><path d="M0,0 l-60,40 l60,40z M70,0 l-60,40 l60,40z" fill="#fff" stroke="#000" stroke-width="5"/></g>`;
  g += `<g transform="translate(540,720) scale(${back(seg(u, .2, .5))})">${T(0, 0, 100, txt, { shadow: '#000' })}</g>`;
  return g;
}
function inset(cx, cy, r, content, id) {
  return `<clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><g clip-path="url(#${id})">${content}</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-width="10"/><circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="none" stroke="${C.ink}" stroke-width="4"/>`;
}
const marker = (x, y, r, t, col = C.red, label = '') => `<circle cx="${x}" cy="${y}" r="${r + 6 * Math.sin(t * 7)}" fill="none" stroke="${col}" stroke-width="9" opacity=".9"/>` + (label ? T(clamp(x, 160, 920), y - r - 30, 54, label, { fill: '#fff', shadow: col }) : '');

// Episode 6: the aangan (home, evening) and the MELA (mela()) are parallax layer stacks; characters are placed at a depth with at()/proj().
const SMA = 1.18, SBA = 1.0, SSK = .9;           // Mama (rig.js ammi), Baba, Sakina sprite scales
const mama = o => ammi(Object.assign({}, o, { phone: 1, amp: o.amp ?? -1 }));
// same screen x for a point that moves between depths: layer-dFrom coordinate X → layer-dTo coordinate
const xAt = (X, dFrom, dTo, cam) => X - (cam.x || 0) / dFrom + (cam.x || 0) / dTo;
// --- props ---
const bag = (x, y, s) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(3)})"><path d="M-30,-60 q30,-34 60,0" stroke="#3a2416" stroke-width="9" fill="none"/><rect x="-62" y="-60" width="124" height="90" rx="12" fill="#5a3a22" stroke="${C.ink}" stroke-width="6"/><rect x="-12" y="-46" width="24" height="16" rx="3" fill="#c9a24a"/></g>`;
const tiffin = (x, y, s) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(3)})"><path d="M-18,-92 q18,-24 36,0" stroke="#9aa3ad" stroke-width="7" fill="none"/>${[0, 1, 2].map(i => `<rect x="-34" y="${-86 + i * 30}" width="68" height="28" rx="8" fill="#d6dde4" stroke="${C.ink}" stroke-width="4"/>`).join('')}</g>`;
// --- Sakina's crying-girl act: fountain tears from both eyes, a growing puddle, sad violin notes ---
function fountain(fx, fy, s, t, k, puddleY, op = 1) {
  if (k <= 0) return '';
  let g = '';
  for (const side of [-1, 1]) for (let i = 0; i < 9; i++) {
    const p = ((t * 1.6 + i / 9) % 1), vx = side * (260 + 60 * hs(i + side * 7)) * s * k, vy = -240 * s * k;
    const x = fx + side * 26 * s + vx * p, y = fy + vy * p + 900 * s * p * p;
    if (y > puddleY) continue;
    g += `<path d="M${x.toFixed(1)},${(y - 16 * s).toFixed(1)} q${(10 * s).toFixed(1)},${(16 * s).toFixed(1)} 0,${(26 * s).toFixed(1)} q${(-10 * s).toFixed(1)},${(-10 * s).toFixed(1)} 0,${(-26 * s).toFixed(1)}Z" fill="#7fd0ff" stroke="#2f7fd6" stroke-width="${(2.5 * s).toFixed(1)}" opacity="${(op * (1 - p * .3)).toFixed(2)}"/>`;
  }
  // tear streams (arcs) from each eye
  for (const side of [-1, 1]) g += `<path d="M${fx + side * 26 * s},${fy} q${side * 140 * s * k},${-120 * s * k} ${side * 280 * s * k},${200 * s}" stroke="#9adcff" stroke-width="${(14 * s).toFixed(1)}" fill="none" stroke-linecap="round" opacity="${(.75 * op).toFixed(2)}"/>`;
  return g;
}
const puddle = (x, y, s, k) => k > 0 ? `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(260 * s * k).toFixed(1)}" ry="${(40 * s * k).toFixed(1)}" fill="#8fd6ff" stroke="#2f7fd6" stroke-width="4" opacity=".8"/><ellipse cx="${(x - 60 * s * k).toFixed(1)}" cy="${(y - 8 * s * k).toFixed(1)}" rx="${(60 * s * k).toFixed(1)}" ry="${(10 * s * k).toFixed(1)}" fill="#fff" opacity=".6"/>` : '';
function violin(x, y, t, op) { if (op <= 0) return ''; let g = `<g opacity="${op.toFixed(2)}" transform="translate(${x},${y}) rotate(-25)"><path d="M0,-70 q34,0 30,34 q-12,14 0,30 q8,44 -30,46 q-38,-2 -30,-46 q12,-16 0,-30 q-4,-34 30,-34Z" fill="#a0522d" stroke="${C.ink}" stroke-width="5"/><path d="M0,-70 v-80" stroke="#3a2416" stroke-width="10"/><path d="M-60,${-20 + 14 * Math.sin(t * 6)} L80,${-60 + 14 * Math.sin(t * 6)}" stroke="#e9d9b0" stroke-width="5"/></g>`; return g + notes(x + 80, y - 80, t); }
function cryGag(fx, fy, s, t, k, puddleY, px, label = 'CRYING GIRL ON!') {
  return puddle(px, puddleY, s, clamp(k * 1.3)) + fountain(fx, fy, s, t, k, puddleY);
}
// face of a skeleton sprite (ground point x,y; key; scale s): for tears and markers
const SKH = { latifa: 470, dharmender: 455,  sakina: 400, pari: 300, baba: 545, babaKurta: 545, officer: 535, pariMa: 495, pariPa: 540, ammar: 540 };
const faceOf = (key, x, y, s) => [x, y - (SKH[key] || 480) * s];

function shhh(x, y, k) {
  if (k <= 0) return '';
  return `<g transform="translate(${x},${y}) scale(${k})"><circle r="78" fill="${C.gold}" stroke="${C.ink}" stroke-width="7"/><circle cx="-24" cy="-14" r="8" fill="${C.ink}"/><circle cx="24" cy="-14" r="8" fill="${C.ink}"/><path d="M-22,30 Q0,22 22,30" stroke="${C.ink}" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="-9" y="-6" width="18" height="70" rx="9" fill="#c98b5c" stroke="${C.ink}" stroke-width="5"/>${T(0, 118, 40, 'RAAZ!', { fill: '#fff', shadow: '#000' })}</g>`;
}

const susuFly = (x, y, sc, t, o = {}) => susu(Object.assign({ x, y, s: sc, t, power: .9, cape: 1, crown: 1, shades: 1, armL: 150, armR: 150, legL: -22, legR: 12, mouth: 'grin', blink: blink(t, 3) }, o));

// ======================= EPISODE 8 — "Gaay Aur Traffic Jam" =======================
Object.assign(SPK, { MAMA: '#1f7a78', BABA: '#2f5f9e', 'DADA ABU': '#8a6d2f', SAKINA: '#17917f', BASIM: '#e07a2c', 'OFFICER GILL': '#1f2d4a' });
const RD = 1.3;
const R = (cam, X, Y) => proj(RD, cam, X, Y);
const VS = 1.25;                     // vehicle scale (cars are taller than 4-year-old Qasim)
const FAM = 150;                     // Baba's car in lane A (in front of the petrol pump canopy; the WC door stays clear)
const COWS = 1.25;                   // Lali's scale
const CALF = [3700, YC];             // Chhotu stuck between the bus and the truck in lane C
const offY = d => 0;
// --- the jam (layer coords per lane). k: type, x, f: facing, c: colour
const JAM = {
  A: [{ k: 'bike', x: -560, f: 1, c: '#3b8de5', s: 3 }, { k: 'car', x: -1180, f: 1, c: '#e5463b' }, { k: 'rick', x: -1780, f: 1 }, { k: 'bus', x: -2700, f: 1, c: '#22a35a', s: 4 },
      { k: 'rick', x: 2150, f: -1 }, { k: 'car', x: 2800, f: -1, c: '#f4f1e6' }, { k: 'bike', x: 3420, f: -1, c: '#ffd34a', s: 5 }],
  B: [{ k: 'car', x: -950, f: 1, c: '#ffd34a' }, { k: 'bike', x: -1550, f: 1, c: '#e5463b', s: 6 }, { k: 'truck', x: -2300, f: 1 }, { k: 'car', x: -3300, f: 1, c: '#22a35a' },
      { k: 'bike', x: 2700, f: -1, c: '#22a35a', s: 7 }, { k: 'car', x: 3300, f: -1, c: '#b04ad6' }, { k: 'bus', x: 4500, f: -1, c: '#e5463b', s: 2, board: 'SHEHAR BUS' }],
  C: [{ k: 'bike', x: -850, f: 1, c: '#ff7a2f', s: 1 }, { k: 'car', x: -1450, f: 1, c: '#3b8de5' }, { k: 'rick', x: -2150, f: 1 }, { k: 'bus', x: -3000, f: 1, c: '#f2b631', s: 5 },
      { k: 'bus', x: 3000, f: -1, c: '#f2b631', s: 3 }, { k: 'truck', x: 4400, f: -1 }, { k: 'car', x: 5400, f: -1, c: '#e5463b' }],
};
const LANEY = { A: YA, B: YB, C: YC };
// vehicles of one lane; o.go = how far traffic has moved (px), o.honk 0..1, o.t, o.skip = index list to leave out
function jam(lane, t, o = {}) {
  const y = LANEY[lane], go = o.go || 0; let g = '', hb = '';
  JAM[lane].forEach((v, i) => {
    if (o.skip && o.skip.includes(i)) return;
    const x = v.x + v.f * go * (1 + .15 * hs(i + lane.charCodeAt(0))), roll = (x / 60), seed = i * 3 + lane.charCodeAt(0);
    if (v.k === 'car') g += car(x, y, VS * .95, v.c, { flip: v.f, roll });
    else if (v.k === 'bus') g += bus(x, y, VS * .8, v.c, { flip: v.f, roll, seed: v.s, board: v.board });
    else if (v.k === 'truck') g += truck(x, y, VS * .8, { flip: v.f, roll });
    else if (v.k === 'bike') g += bike(x, y, VS * .9, v.c, { flip: v.f, roll, seed: v.s });
    else g += rickshaw(x, y, VS * 1.15, v.f, roll / 9 * 9);
    const top = { car: 360, bus: 420, truck: 430, bike: 470, rick: 300 }[v.k] * VS;
    if ((o.honk || 0) > 0) hb += honkB(x + v.f * 80, y - top - 60, 1.1, t, seed, o.honk);
  });
  return g + hb;
}
// --- Baba's family car (lane A) with the family in the windows. o: talk flags, poses; drawn in lane-A coords
const FC = '#5fb3e8';
const SEAT = { basim: [-250, -238], qasim: [-172, -228], sakina: [-90, -252], dada: [-5, -250], mama: [130, -240], baba: [238, -256] };   // car-local face centres (L = 1.3 car)
const SKF = { baba: 548, babaKurta: 548, dadaAbu: 470, sakina: 418, basim: 305 };   // sprite ground → face centre (px at s=1, before SKS)
function seat(key, fx, fy, hsz, o = {}) { const s = hsz, y = fy + (SKF[key] || 480) * s * (SKS[key] || 1); return sk(Object.assign({ key, x: fx, y, s, move: 'idle' }, o)); }
function famCar(x, y, s, t, o = {}) {
  const P = SEAT, ins = [];
  const sq = o.qOut ? '' : susu({ x: P.qasim[0] + (o.qx || 0), y: P.qasim[1] + 227, s: .4, t, look: o.qLook || [8, -4], mouth: o.qMouth || 'grin', amp: o.qAmp || 0, brow: o.qBrow || 0, tilt: o.qTilt || 0, wink: o.qWink || 0, blink: blink(t), armL: o.qArmL ?? 20, armR: o.qArmR ?? 20 });
  ins.push(seat('basim', P.basim[0], P.basim[1], .62, { t, move: o.bMove || 'idle', mt: t, yaw: .5, expr: o.bExpr || 'happy', amp: o.bAmp }));
  ins.push(sq);
  ins.push(seat('sakina', P.sakina[0], P.sakina[1], .6, { t, move: o.kMove || 'idle', mt: o.kMt ?? t, yaw: o.kYaw ?? .5, expr: o.kExpr || 'happy', amp: o.kAmp }));
  ins.push(seat('dadaAbu', P.dada[0], P.dada[1], .6, { t, move: o.dMove || 'idle', mt: t, yaw: o.dYaw ?? .5, expr: o.dExpr || 'neutral', amp: o.dAmp }));
  ins.push(ammi({ x: P.mama[0], y: P.mama[1] + 102, s: .42, phone: 0, look: o.mLook || [12, 0], brow: o.mBrow || .2, amp: o.mAmp ?? -1, tilt: o.mTilt || 0, blink: blink(t, 2.7) }));
  ins.push(seat('baba', P.baba[0], P.baba[1], .6, { t, move: o.baMove || 'idle', mt: t, yaw: o.baYaw ?? .6, expr: o.baExpr || 'happy', amp: o.baAmp }));
  ins.push(`<circle cx="275" cy="-180" r="34" fill="none" stroke="#222" stroke-width="10"/>`);   // steering wheel
  return car(x, y, s, FC, { L: 1.3, inside: ins.join('') + (o.extra || ''), roll: o.roll || 0, carrier: 1, dent: 1, bob: o.bob || 0, honk: o.honk || 0, door: o.door || 0, plate: 'BABA' });
}
// screen point of a car-local point of the family car drawn at lane A (x, y, s) with camera cam
const carPt = (cam, x, y, s, lx, ly) => proj(LA, cam, x + lx * s, y + ly * s);

// ============ 1 HOOK — flash-forward: the whole chowk jammed, honk bubbles everywhere; Susuman flies over the traffic carrying Chhotu to Lali; rewind ============
function E_hook(t) {
  const D = sdur('hook'), nE = LE('n1b') + .2, tt = t < nE ? t : Math.max(0, nE - (t - nE) * 2.4), rw = seg(t, nE, nE + .5), P = ease(seg(tt, 0, nE));
  const cam = camL(LB, lerp(1300, 1650, P), 1250, lerp(.95, 1.1, P), 540, 1050);
  const S = chowk(tt, cam, { noFG: 0, fgY: 2300 });
  let g = S.back + S.A(jam('A', tt, { honk: 1 }) + famCar(FAM, YA, VS, tt, {})) + S.B(jam('B', tt, { honk: 1 }) + shadow(ZX, YB + 4, 260, .8) + lali({ x: ZX, y: YB, s: COWS, pose: 'sit', t: tt, chew: 1, mood: tt > 4.5 ? 'love' : '', flip: 1 }));
  g += S.C(jam('C', tt, { honk: 1 }));
  // Susuman flies in from upper left, carrying Chhotu, towards Lali
  const k = eout(seg(tt, .3, nE - .4)), X = lerp(700, ZX + 520, k), Y = lerp(700, 1150, k) + 20 * Math.sin(tt * 3);
  const sp = proj(LB, cam, X, Y), sc = .7 * sp.s;
  g += speed(sp.x - 130, sp.y - 170 * sc, 1, .6, 5) + susuFly(sp.x, sp.y, sc, tt, { rot: 12 - 12 * k, armL: 120, armR: 120, mouth: on('qh', t) ? 'shout' : 'grin', amp: amp('QASIM') });
  g += chhotu({ x: sp.x + 30 * sc, y: sp.y - 220 * sc, s: .8 * sc, pose: 'stand', t: tt, mood: k > .8 ? 'happy' : 'scared', flip: 1 });
  g += S.front + vig(t < nE ? .65 : .4);
  if (t < nE) {
    g += hookBig('MAMA KO NAHI PATA...', 'QASIM HI HAI', t, .15, 1.3, 210).replace('font-size="96"', 'font-size="80"');
    if (t > LS('qh') - .1) g += `<g transform="translate(540,520) scale(${back(seg(t, LS('qh') - .1, LS('qh') + .25))}) rotate(-4)">${T(0, 0, 118, 'SUUU-SUUU-MAN!', { shadow: C.red, sw: 12 })}</g>`;
    if (t > 1.0) g += shhh(930, 560, back(seg(t, 1.0, 1.3)) * .9);
    if (t > LS('n1b') + .3) { const kk = back(seg(t, LS('n1b') + .3, LS('n1b') + .6)); g += `<g transform="translate(540,1190) scale(${kk})">${burst(0, 0, 190, C.red, 'TRAFFIC JAM!', 56, -5, 1)}</g>`; }
  }
  if (t > nE) g += rewindFx(t - nE, rw, 'THODI DER PEHLE...');
  const f2 = seg(t, D - .25, D); if (f2 > 0) g += `<rect width="1080" height="1920" fill="#fff" opacity="${f2}"/>`;
  return g + capFor('hook', t);
}

// ============ 2 CAR — Sunday drive: the camera tracks Baba's packed car down the road (parallax), "Chidiya ghar!", Basim dreams of sher + haathi; CHEEEEN! brakes → the jam ahead ============
function E_car(t) {
  const D = sdur('car'), b1 = on('b1', t), bs = on('bs', t), stopT = LE('bs') + .25, brake = seg(t, stopT, stopT + .7);
  // car x: drives at speed, decelerates to FAM at stopT+.7
  const v = 300;
  const cxx = t < stopT ? FAM - v * (stopT + .35 - t) : FAM - v * .35 * (1 - eout(brake));
  const tilt = brake > 0 && brake < 1 ? 4 * Math.sin(brake * Math.PI) : 0;
  const reveal = ease(seg(t, stopT + .6, D - .2));
  let cam = camL(LA, cxx + 60, 1150, 1.42, 540, 1180);
  cam = lerpCam(cam, camL(LB, 1350, 1250, .62, 540, 1050), reveal);
  const S = chowk(t, cam, { sig: 'red' });
  const roll = cxx / 60, bob = brake === 0 ? 3 * Math.sin(t * 14) : 0;
  const fc = `<g transform="rotate(${tilt} ${cxx + 300} ${YA})">` + famCar(cxx, YA, VS, t, { roll, bob, baAmp: amp('BABA'), baMove: b1 ? 'talk' : (brake > 0 ? 'scared' : 'idle'), baExpr: b1 ? 'happy' : (brake > 0 ? 'surprised' : 'happy'), bMove: bs ? 'celebrate' : 'idle', bAmp: amp('BASIM'), bExpr: brake > 0 ? 'surprised' : 'happy', kExpr: brake > 0 ? 'surprised' : 'happy', dExpr: brake > 0 ? 'surprised' : 'happy', qMouth: brake > 0 ? 'o' : 'grin', mLook: brake > 0 ? [14, -6] : [10, 0], mBrow: brake > 0 ? 1 : .2 }) + '</g>';
  let g = S.back + S.A(jam('A', t, { honk: reveal, skip: t < stopT ? [0, 1, 2, 3] : [] }) + fc + (t < stopT ? '' : dust(cxx + 420 * VS, YA - 10, brake, 6, 50)));
  g += S.B(jam('B', t, { honk: reveal, skip: [0, 1, 2, 3] }) + shadow(ZX, YB + 4, 260, .8) + lali({ x: ZX, y: YB, s: COWS, pose: 'sit', t, chew: 1 })) + S.C(jam('C', t, { honk: reveal, skip: [0, 1, 2, 3] }));
  if (t < stopT) { const p = proj(LA, cam, cxx - 380, YA - 120); g += speed(p.x, p.y, 1, .45, 4); }
  g += S.front;
  if (b1) g += hookBig('CHALO', 'CHIDIYA GHAR!', t, LS('b1') + .4, LS('b1') + .9, 260);
  if (bs) { const k = back(seg(t, LS('bs') + .2, LS('bs') + .5)); g += `<g transform="translate(300,420) scale(${k})">${burst(0, 0, 120, '#ffd34a', 'SHER!', 54, -8, 1)}</g><g transform="translate(780,430) scale(${back(seg(t, LS('bs') + 1, LS('bs') + 1.3))})">${burst(0, 0, 120, '#7fd0ff', 'HAATHI!', 50, 8, 1)}</g>`; }
  if (brake > 0 && brake < 1) g += `<g transform="translate(540,360) scale(${back(clamp(brake * 2))})">${burst(0, 0, 210, '#fff', 'CHEEEEN!', 74, -6, 1)}</g>`;
  if (reveal > .3) g += hookBig('ARRE!', 'TRAFFIC JAM!', t, stopT + 1.0, stopT + 1.3, 250);
  return g + capFor('car', t);
}

// ============ 3 JAM — wide crane over the jam; Officer Gill whistles + pleads with Lali, MOOO!; Dada Abu: "Sabr karo!"; Sakina spots Chhotu stuck behind the bus; Lali waits for her calf ============
const OG = [1180, YB];   // Officer Gill in lane B, left of the cow
function E_jam(t) {
  const D = sdur('jam'), o1 = on('o1', t), dd = on('dd', t), k1 = on('k1', t), dm = on('dm', t), mooT0 = LE('o1') + .25, moo = seg(t, mooT0, mooT0 + 1.0);
  const k1s = LS('k1'), dms = LS('dm');
  let cam = camL(LB, 1100, 1200, .7, 540, 1050);
  cam = lerpCam(cam, camL(LB, 1330, 1300, 1.05, 540, 1150), ease(seg(t, .2, LS('o1') + .4)));
  cam = lerpCam(cam, camL(LA, FAM - 40, 1150, 1.45, 540, 1180), ease(seg(t, LS('dd') - .4, LS('dd') + .3)));
  cam = lerpCam(cam, camL(LCd, CALF[0] - 60, CALF[1] - 60, 1.25, 540, 1150), ease(seg(t, k1s + .9, k1s + 1.7)));
  cam = lerpCam(cam, camL(LB, ZX + 140, 1220, 1.6, 540, 1100), ease(seg(t, dms - .5, dms + .3)));
  const S = chowk(t, cam, { sig: 'red' });
  const honk = 1 - .6 * (dd ? 1 : 0) - .6 * (dm ? 1 : 0);
  const sakPoint = k1;
  let g = S.back + S.A(jam('A', t, { honk: honk * .8 }) + famCar(FAM, YA, VS, t, { dAmp: amp('DADA ABU'), dMove: dd ? 'talk' : 'idle', dExpr: dd ? 'determined' : 'neutral', dYaw: dd ? 1.2 : .5, kMove: sakPoint ? 'point' : 'idle', kAmp: amp('SAKINA'), kExpr: k1 ? 'surprised' : 'neutral', kYaw: k1 ? .9 : .5, baMove: 'holdHead', baExpr: 'sad', qLook: k1 ? [14, 6] : [8, -4], qMouth: k1 ? 'o' : 'frown' }));
  // Lali sits, chewing; MOOO startles the officer; sad eyes when she looks for her calf
  const cowMood = dm ? 'sad' : (moo > 0 && moo < 1 ? '' : '');
  let bInner = jam('B', t, { honk: honk }) + shadow(ZX, YB + 4, 260, .8) + lali({ x: ZX, y: YB, s: COWS, pose: 'sit', t, chew: moo > 0 && moo < 1 ? 0 : 1, moo: moo > 0 && moo < 1 ? Math.sin(moo * Math.PI) : 0, mood: cowMood, look: dm || k1 ? [8, 6] : [0, 0], blink: blink(t, 3.2) });
  // Officer Gill: whistle + pleading (o1) → jumps back at MOOO
  const jumpB = eout(seg(t, mooT0, mooT0 + .4)), ox = OG[0] - 160 * jumpB;
  bInner += shadow(ox, OG[1] + 4, 90, .8) + officer({ x: ox, y: OG[1] - 40 * Math.sin(Math.PI * seg(t, mooT0, mooT0 + .5)), s: 1.05, t, move: o1 ? 'talk' : (moo > 0 && moo < 1 ? 'scared' : 'point'), mt: t, yaw: .5, expr: o1 ? 'neutral' : (moo > 0 ? 'scared' : 'determined'), amp: amp('OFFICER GILL') });
  if (!o1 && t < LS('o1')) bInner += whistle(ox + 34, OG[1] - 520, 1, .8 + .2 * Math.sin(t * 30));
  g += S.B(bInner);
  // Chhotu stuck between bus + truck in lane C, trembling and calling
  const cs = 2 * Math.sin(t * 40);
  g += S.C(jam('C', t, { honk }) + shadow(CALF[0], CALF[1] + 4, 120, .8) + chhotu({ x: CALF[0] + cs, y: CALF[1], s: COWS, pose: 'stand', t, mood: 'scared', flip: -1, moo: (t * 1.3) % 1 < .25 ? .7 : 0, blink: blink(t, 2.4) }));
  g += S.front;
  // overlays
  if (t < LS('o1')) g += hookBig('BEECH SADAK', 'PE GAAY!', t, .3, .7, 250);
  if (t < LS('o1') + .4) { const p = proj(LB, cam, ox + 60, OG[1] - 560); g += T(clamp(p.x + 120, 200, 880), p.y - 40, 60, 'TWEEET!', { fill: '#fff', shadow: '#1f2d4a', op: clamp((t - .5) * 3) * (1 - seg(t, LS('o1'), LS('o1') + .3)) }); }
  if (moo > 0 && moo < 1) { const p = proj(LB, cam, ZX + 320 * COWS, YB - 420 * COWS); g += mooT(p.x, p.y, 1.3, moo); }
  if (dd) g += hookBig('SABR', 'KARO, SABR!', t, LS('dd') + .6, LS('dd') + 1.0, 250);
  if (t > k1s + 1.6 && t < LE('k1') + .3) { const p = proj(LCd, cam, CALF[0], CALF[1] - 160); g += marker(p.x, p.y, 150 * p.s, t, C.red, 'CHHOTU!') + T(p.x, p.y + 200 * p.s, 46, 'MAAA... MAAA!', { fill: '#fff', shadow: '#8a5a32' }); }
  if (k1 && t < k1s + 1.5) g += `<g transform="translate(540,330) scale(${back(seg(t, k1s, k1s + .3))})">${burst(0, 0, 200, '#ffd34a', 'DEKHO!', 72, -6, 1)}</g>`;
  if (dm) g += hookBig('MAA KA', 'INTEZAAR...', t, dms + .4, dms + .8, 250) + calfInset(t, seg(t, dms + .2, dms + .6), 820, 640, 170, 'insJ');
  return g + capFor('jam', t);
}
function calfInset(t, k, cx = 830, cy = 600, r = 180, id = 'insC') {   // Chhotu trembling between the bus and the truck
  if (k <= 0) return '';
  const ic = camL(LCd, CALF[0] - 90, CALF[1] - 150, .9, cx, cy), sub = chowk(t, ic, { noFG: 1, motes: false });
  const inner = sub.back + sub.A(jam('A', t)) + sub.B(jam('B', t)) + sub.C(jam('C', t) + chhotu({ x: CALF[0] + 2 * Math.sin(t * 40), y: CALF[1], s: COWS, pose: 'stand', t, mood: 'scared', flip: -1, moo: (t * 1.3) % 1 < .25 ? .7 : 0 }));
  return inset(cx, cy, r * back(clamp(k)), inner, id);
}

// ============ 4 CRY — in the car: "Mama! Suusuu aayi hai!" → "Phir se?!" → "Main saath chalti hoon!" (secret in danger) → Sakina's crying act → Mama stays → wink → "Jaa jaldi!" → Qasim zips to the petrol-pump WC ============
function E_cry(t) {
  const D = sdur('cry'), k2s = LS('k2'), a3s = LS('a3'), jjs = LS('jj'), cryK = seg(t, k2s - .1, k2s + .4) * (1 - seg(t, a3s + .5, a3s + .9)), grin = t > a3s + .6;
  const zip = seg(t, LE('jj') - .05, LE('jj') + 1.15);
  let cam = camL(LA, FAM - 20, 1150, 1.6, 540, 1180);
  cam = lerpCam(cam, camL(LA, FAM - 70, 1130, 1.85, 540, 1180), ease(seg(t, k2s - .3, k2s + .5)) * (1 - ease(seg(t, a3s, a3s + 1))));
  cam = lerpCam(cam, camL(LA, FAM + 260, 1120, 1.3, 540, 1180), ease(seg(t, LE('jj') - .3, LE('jj') + .5)));
  const S = chowk(t, cam, { open: crySceneDoor(t) });
  const qs = on('qs', t), pf = on('pf', t), a2 = on('a2', t), k2 = on('k2', t, .1, .3), a3 = on('a3', t), jj = on('jj', t), danger = t > LS('a2') && t < k2s + .3;
  const dd = Math.sin(t * 16), wob = zip === 0;
  const fo = { qOut: zip > 0, qMouth: qs ? 'wobble' : (danger ? 'o' : (jj ? 'grin' : 'wobble')), qAmp: amp('QASIM'), qBrow: danger ? 1 : .8, qTilt: wob ? 6 * dd : 0, qLook: [12, -2],
    mLook: pf || a2 ? [-14, 2] : (cryK > .2 || a3 ? [-14, 0] : [10, 0]), mBrow: pf ? 1 : (cryK > .2 ? .8 : .3), mAmp: amp('MAMA'), mTilt: pf ? -6 : 0,
    kMove: cryK > .1 && !grin ? 'cry' : (jj ? 'thumbsUp' : 'idle'), kMt: jj ? t - jjs : t, kExpr: cryK > .1 && !grin ? 'cry' : (grin ? 'wink' : (danger ? 'scared' : 'neutral')), kAmp: amp('SAKINA'), kYaw: grin ? 0 : .5,
    dExpr: 'neutral', baMove: 'holdHead', baExpr: 'sad', bExpr: 'neutral' };
  // Mama's door opens during a2 (she starts to get out), closes again when she stays
  fo.extra = '';
  let g = S.back;
  // Qasim zipping from the car to the WC door: drawn between the row and lane A (moving into depth)
  let qz = '';
  if (zip > 0 && zip < 1) {
    const a = carPt(cam, FAM, YA, VS, SEAT.qasim[0], SEAT.qasim[1] + 227), b = R(cam, CWC.x + CWC.w / 2, 1085), z = eout(zip);
    const x = lerp(a.x, b.x, z), y = lerp(a.y, b.y, z) - Math.sin(z * Math.PI) * 120, s = lerp(SQ / LA * cam.z * .85, SQ / RD * cam.z, z);
    qz = `<g opacity="${1 - seg(zip, .85, 1)}">` + susu({ x, y, s, t, legL: walkK(t, 34), legR: -walkK(t, 34), armL: 150, armR: 150, mouth: 'grin', flip: 1 }) + speed(x - 40, y - 150 * s, 1, .8, 5) + '</g>';
  }
  g += qz + S.A(jam('A', t, { honk: .5 }) + famCar(FAM, YA, VS, t, fo));
  g += S.B(jam('B', t, { honk: .5 }) + shadow(ZX, YB + 4, 260, .8) + lali({ x: ZX, y: YB, s: COWS, pose: 'sit', t, mood: 'sad' })) + S.C(jam('C', t, { honk: .5 }));
  if (cryK > 0) { const f = carPt(cam, FAM, YA, VS, SEAT.sakina[0], SEAT.sakina[1]); g += fountain(f.x - 22 * f.s, f.y + 10, f.s * .9, t, cryK, carPt(cam, FAM, YA, VS, 0, 0).y + 30); }
  g += S.front;
  g += tally(3, 'AAJ SUUSUU BREAK:', seg(t, LS('pf') + .2, LS('pf') + .5) * (1 - seg(t, LE('pf') + .2, LE('pf') + .4)));
  if (danger) g += hookBig('RAAZ', 'KHATRE MEIN!', t, LS('a2') + .3, LS('a2') + .6, 260) + calfInset(t, seg(t, LS('a2') + .5, LS('a2') + .9) * (1 - seg(t, k2s + .1, k2s + .4)), 830, 640, 170, 'insK');
  if (k2) g += `<g transform="translate(540,300) scale(${back(seg(t, k2s, k2s + .3))})">${burst(0, 0, 230, '#7fd0ff', 'BUAAAA!', 92, 6, 1)}</g>` + T(540, 520, 60, 'CRYING GIRL ON!', { fill: '#fff', shadow: '#2f7fd6', op: clamp((t - k2s - .4) * 4) });
  if (cryK > .2 && !grin) g += violin(150, 420, t, cryK);
  if (a3) g += hookBig('MAMA', 'RUK GAYI!', t, a3s + .3, a3s + .6, 280);
  if (grin && t < jjs) { const f = carPt(cam, FAM, YA, VS, SEAT.sakina[0], SEAT.sakina[1]); g += burst(f.x - 120, f.y - 90, 70, '#fff', 'TING!', 34, 8, 1); }
  if (zip > .85) { const p = R(cam, CWC.x + CWC.w / 2, 900); g += burst(p.x, p.y - 20, 100, '#fff', 'DHAP!', 44, 6, 1 - seg(t, LE('jj') + 1.1, D)); }
  return g + capFor('cry', t);
}
const crySceneDoor = t => { const z = seg(t, LE('jj') - .05, LE('jj') + 1.15); return seg(z, .55, .7) * (1 - seg(z, .88, 1)); };

// ============ 5 POWER — the petrol-pump WC door glows gold (Officer Gill blurred in the foreground, whistling at the traffic, never looks), FLUUSH, power bar, SUUU-SUUU-MAN! ============
function E_power(t) {
  const nE = LE('n2'), q = LS('qp'), open = ease(seg(t, q - .45, q - .3)), glow = Math.max(seg(t, .2, nE), open);
  const cam = camD(RD, CWC.x + CWC.w / 2 + lerp(-40, 0, ease(seg(t, 0, q))), 900, lerp(1.2, 1.6, ease(seg(t, 0, q - .4))) + .06 * open, 540, 1000);
  const S = chowk(t, cam, { open, glow, signal: false });
  let g = S.back;
  const dp = R(cam, CWC.x + CWC.w / 2, 900);
  if (open > 0) g += shafts(dp.x, dp.y, -Math.PI / 2, 14, 1900, .5 * open, t * 3, '#fff6c8', .45, .05);
  let hero = '';
  if (open > 0) {
    const st = eout(seg(t, q - .3, q + .5)), hk = ease(seg(t, q, q + .3)), up = ease(seg(t, LE('qp') + .5, sdur('power')));
    const dd = lerp(RD, 1.2, st);
    hero = at(dd, cam, CWC.x + CWC.w / 2 - 20 * st, lerp(1085, 1150, st) - up * 1300, susu, { s: lerp(SQ, .74, st), t, power: open, cape: open, crown: seg(t, q, q + .3), shades: seg(t, LE('qp') + .15, LE('qp') + .45), armR: lerp(20, 165, hk), fistR: hk > .4, armL: lerp(20, 40, hk), amp: amp('QASIM'), mouth: 'smirk', blink: blink(t, 3), legL: up > 0 ? -20 : 0, legR: up > 0 ? 14 : 0 }, { w: 120, h: up * 1300, op: 1.2 });
    if (up > 0) { const p = proj(dd, cam, CWC.x + CWC.w / 2, 1150 - up * 1300); hero += speed(p.x, p.y + 120, 0, .7, 3); }
  }
  g += hero + S.A(famCar(FAM, YA, VS, t, { baMove: 'holdHead', baExpr: 'sad', kExpr: 'smug' }));
  g += `<g filter="url(#dofNear2)">${at(.72, cam, 1250, 1480, officer, { s: 1.0, t, move: 'point', mt: t, yaw: .9, expr: 'determined' }, { w: 0 })}${(() => { const p = proj(.72, cam, 1285, 1480 - 520); return whistle(p.x, p.y, 1.3, .8); })()}</g>`;
  g += S.front;
  g = shake(g, (open > 0 && open < 1) ? 1 : (glow > .8 && open === 0 ? .3 : 0), t);
  if (t > .8 && t < 2.4) { const k = back(seg(t, .8, 1.1)); g += `<g transform="translate(540,640) scale(${k})">${burst(0, 0, 230, C.gold, 'FLUUSH!', 104, -8, 1 - seg(t, 2.1, 2.4))}</g>`; }
  const p = ease(seg(t, 1.0, nE));
  if (t > .9 && open < 1) g += `<g opacity="${seg(t, .9, 1.1) * (1 - open)}"><rect x="140" y="150" width="800" height="150" rx="30" fill="#000" opacity=".75"/>${T(540, 212, 62, 'SUUSUU POWER', { fill: C.gold, sw: 0, ls: 6 })}<rect x="190" y="235" width="700" height="44" rx="22" fill="#333" stroke="#fff" stroke-width="5"/><rect x="194" y="239" width="${692 * p}" height="36" rx="18" fill="${p > .99 ? '#ff3b30' : C.gold}"/>${T(540, 272, 40, Math.round(p * 100) + '%', { sw: 6 })}${emblem(180, 257, .7)}</g>`;
  if (t > 1.6 && open === 0) g += calfInset(t, seg(t, 1.6, 1.9), 820, 600, 180, 'insP');
  if (t > q) { const k = back(seg(t, q, q + .3)); g += `<g transform="translate(540,330) scale(${lerp(2.2, 1, clamp(k))}) rotate(-4)" opacity="${clamp(k * 2)}"><rect x="-460" y="40" width="920" height="40" rx="20" fill="${C.red}" transform="skewX(-20)"/>${T(0, 40, 138, 'SUUU-SUUU-MAN!', { shadow: C.red, sw: 12, ls: 2 })}</g>`; }
  return g + capFor('power', t);
}

// ============ 6 RESCUE — Susuman soars over the jam to Chhotu; "Daro mat!"; carries him to Lali (reunion, hearts); PEEEP! Lali flinches → "Horn band karo!" → silence; leads them to Hara Bhara Park with chaara; signal green, traffic flows; Officer Gill: "Shabash! Lekin ye tha kaun?!" ============
function E_rescue(t) {
  const D = sdur('rescue'), q3 = on('q3', t), q4 = on('q4', t), q5 = on('q5', t), o2 = on('o2', t);
  const q3e = LE('q3'), lift = seg(t, q3e + .2, q3e + 2.2), reunite = t > q3e + 2.2, peep = seg(t, q3e + 2.55, q3e + 3.2), q4s = LS('q4'), q5s = LS('q5');
  const hush = seg(t, q4s + .6, q4s + 1.2), walkK2 = seg(t, q5s - .2, q5s + 3.0), green = t > LE('q5') + .4, go = green ? 900 * ease(seg(t, LE('q5') + .6, D + 1)) * (t - LE('q5')) / 3 : 0;
  const zipOut = seg(t, LS('o2') - .6, LS('o2') + .2);
  // Susuman path (lane-B coords, depth LB): fly up over the jam → hover by the calf (lane C, converted) → carry to Lali → stand beside the cow → lead to the park
  let sx, sy, sd = LCd;
  const calfB = [CALF[0] + 100, CALF[1] - 430], fk = eout(seg(t, 0, LS('q3')));
  if (t < LS('q3')) { sx = lerp(1700, calfB[0], fk); sy = lerp(800, calfB[1], fk) + 16 * Math.sin(t * 3); }
  else if (lift === 0) { sx = calfB[0]; sy = calfB[1] + 12 * Math.sin(t * 3); }
  else if (!reunite) { const k = ease(lift); sd = lerp(LCd, LB, k); sx = lerp(calfB[0], ZX + 700, k); sy = lerp(calfB[1], YB - 80, k) - Math.sin(k * Math.PI) * 300; }
  else { sd = LB; sx = ZX + 700; sy = YB - 20; }
  const lead = ease(walkK2);
  // cow + calf walk from the zebra (lane B, d=1) to the park gate (row, d=1.3); Susuman walks backwards in front with the chaara
  const cd = lerp(LB, 1.3, lead), cX = lerp(ZX, (PARK.gate[0] + PARK.gate[1]) / 2 - 60, lead), cY = lerp(YB, 1078, lead);
  let cam = camL(LCd, lerp(1550, calfB[0] - 20, fk), lerp(1000, CALF[1] - 250, fk), lerp(.78, 1.05, fk), 540, lerp(950, 1150, fk));
  cam = lerpCam(cam, camL(LB, ZX + 420, 1300, 1.0, 540, 1150), ease(seg(t, q3e + .3, q3e + 2.0)));
  cam = lerpCam(cam, camL(LB, ZX + 420, 1300, .92, 540, 1150), ease(seg(t, q4s - .2, q4s + .6)));
  cam = lerpCam(cam, camL(LB, ZX + 330, 1200, .82, 540, 1100), ease(seg(t, q5s, q5s + 2.5)));
  cam = lerpCam(cam, camL(LB, 1100, 1250, 1.15, 540, 1150), ease(seg(t, LS('o2') - .5, LS('o2') + .3)));
  const S = chowk(t, cam, { sig: green ? 'green' : 'red' });
  const honk = (1 - hush) * (t < LS('q3') ? 1 : .7) + (peep > 0 && peep < 1 ? 1 : 0);
  const cowP = { pose: reunite && lead === 0 ? (peep > 0 ? 'stand' : 'stand') : (lead > 0 && lead < 1 ? 'walk' : (reunite ? 'stand' : 'sit')), t, mood: peep > 0 && peep < 1 ? 'scared' : (reunite ? 'love' : 'sad'), chew: lead >= 1 ? 1 : 0, grass: lead >= 1 };
  if (!reunite) cowP.pose = 'sit';
  const cowSvg = (d) => { const p = proj(d, cam, cX, cY); return shadow(p.x, p.y + 4, 260 * p.s, .8) + lali(Object.assign({ x: p.x, y: p.y, s: COWS * p.s }, cowP)) + (reunite ? shadow(p.x + 450 * p.s, p.y + 24 * p.s, 120 * p.s, .7) + chhotu({ x: p.x + 450 * p.s, y: p.y + 20 * p.s, s: COWS * p.s, pose: lead > 0 && lead < 1 ? 'walk' : 'stand', t: t + .3, mood: peep > 0 && peep < 1 ? 'scared' : 'happy', flip: -1, grass: lead >= 1, chew: lead >= 1 ? 1 : 0 }) : ''); };
  const deep = cd >= 1.27;
  let g = S.back + (deep ? cowSvg(cd) : '');
  g += S.A(jam('A', t, { honk, go }) + famCar(FAM + go, YA, VS, t, { baMove: 'holdHead', baExpr: 'sad', roll: go / 60, qOut: 1 }));
  g += S.B(jam('B', t, { honk, go }) + (t < q4s + 1.4 ? shadow(OG[0] - 160, OG[1] + 4, 90, .8) + officer({ x: OG[0] - 160, y: OG[1], s: 1.05, t, move: 'scared', mt: t, yaw: .5, expr: 'surprised' }) : ''));
  g += S.C(jam('C', t, { honk, go }) + (lift === 0 ? shadow(CALF[0], CALF[1] + 4, 120, .8) + chhotu({ x: CALF[0] + (q3 ? 0 : 2 * Math.sin(t * 40)), y: CALF[1], s: COWS, pose: 'stand', t, mood: q3 ? '' : 'scared', flip: -1, moo: !q3 && (t * 1.3) % 1 < .25 ? .7 : 0 }) : ''));
  if (!deep) g += cowSvg(cd);
  // Officer Gill comes back after the hush; looks around for the hero (o2)
  if (t > q4s + 1.4) { const oin = ease(seg(t, q4s + 1.4, LS('o2') - .2)), p = proj(LB, cam, lerp(600, 1050, oin), YB + 40); g += shadow(p.x, p.y + 4, 90 * p.s, .8) + officer({ x: p.x, y: p.y, s: 1.05 * p.s, t, move: oin < 1 ? 'walk' : (o2 ? 'shrug' : 'think'), mt: t, yaw: oin < 1 ? Math.PI / 2 : -.2, expr: o2 ? 'surprised' : 'happy', amp: amp('OFFICER GILL') }); }
  // Susuman
  if (zipOut < 1) {
    let px, py, ps;
    if (lead > 0) { const p = proj(cd, cam, cX + 600, cY + 10); px = p.x; py = p.y; ps = p.s; }
    else { const p = proj(sd, cam, sx, sy); px = p.x; py = p.y; ps = p.s; }
    if (zipOut > 0) { const b = R(cam, CWC.x + CWC.w / 2, 1000), z = ease(zipOut); px = lerp(px, b.x, z); py = lerp(py, b.y, z); }
    const flying = lead === 0 && !(reunite && t > q3e + 2.4), sc = .64 * ps;
    if (!flying && lead === 0) g += shadow(px, py + 4, 90 * ps, .7);
    const carry = lift > 0 && !reunite;
    g += `<g opacity="${1 - seg(zipOut, .8, 1)}">` + (flying ? susuFly(px, py, sc, t, { rot: t < LS('q3') ? 12 : 0, armL: carry ? 105 : 150, armR: carry ? 120 : 150, mouth: q3 || q4 || q5 ? 'talk' : 'grin', amp: amp('QASIM') })
      : susu({ x: px, y: py, s: SQ * ps * (lead > 0 ? 1 : 1), t, power: .8, cape: 1, crown: 1, shades: 1, flip: -1, armL: q4 ? 160 : (lead > 0 ? 120 : 40), armR: q4 ? 160 : 40, mouth: q4 || q5 ? 'talk' : 'grin', amp: amp('QASIM'), legL: lead > 0 && lead < 1 ? walkK(t, 20) : 0, legR: lead > 0 && lead < 1 ? -walkK(t, 20) : 0, blink: blink(t, 3) }));
    if (carry) g += chhotu({ x: px + 20 * sc, y: py - 200 * sc, s: .8 * sc, pose: 'stand', t, mood: 'happy', flip: 1 });
    if (lead > 0) g += chaara(px - 130 * ps, py - 330 * ps, .9 * ps, -20 + 8 * Math.sin(t * 4));
    if (zipOut > 0) { const a = { x: px, y: py }; g += `<path d="M${a.x - 200},${a.y - 120} L${a.x},${a.y - 120}" stroke="${C.gold}" stroke-width="40" stroke-linecap="round" opacity="${.5 * (1 - zipOut)}"/>`; }
    g += `</g>`;
  }
  if (t > q3e + 2.3 && t < q3e + 3.6) { const p = proj(LB, cam, ZX + 120, YB - 520); for (let i = 0; i < 4; i++) { const u = ((t - q3e - 2.3) * .8 + i / 4) % 1; g += heart(p.x + 60 * Math.sin(i * 2), p.y - u * 200, .7 * p.s, 1 - u); } }
  g += S.front;
  if (t < 1.6) g += T(540, 300, 76, 'UDAAN!', { fill: C.gold, shadow: '#000', op: clamp((t - .3) * 3) });
  if (q3 && t > LS('q3') + .3) g += hookBig('DARO MAT,', 'CHHOTU!', t, LS('q3') + .3, LS('q3') + .7, 260);
  if (reunite && t < q3e + 2.55) g += hookBig('MAA SE', 'MILA DIYA!', t, q3e + 2.2, q3e + 2.35, 250);
  if (peep > 0 && peep < 1) g += `<g transform="translate(540,360) scale(${back(clamp(peep * 2))})">${burst(0, 0, 230, '#fff', 'PEEEEP!', 90, -6, 1)}</g>`;
  if (q4) g += `<g transform="translate(540,320) scale(${back(seg(t, q4s + .5, q4s + .8))})">${burst(0, 0, 220, '#ffd34a', 'HORN BAND!', 64, 6, 1)}</g>`;
  if (hush > 0 && t < q5s) g += T(540, 520, 56, '...SHHH...', { fill: '#fff', shadow: '#000', op: hush });
  if (q5) g += hookBig('HARI-HARI', 'GHAAS!', t, q5s + .4, q5s + .8, 250);
  if (green && t < LS('o2')) g += `<g transform="translate(540,330) scale(${back(seg(t, LE('q5') + .4, LE('q5') + .7))})">${burst(0, 0, 210, '#22c55e', 'TRAFFIC CHALU!', 56, -6, 1)}</g>`;
  if (o2) g += T(540, 320, 72, 'WOH KAUN THA?!', { fill: C.gold, shadow: '#000', op: clamp((t - LS('o2') - .3) * 3) });
  return g + capFor('rescue', t);
}

// ============ 7 SECRET — the car rolls again past Hara Bhara Park (Lali + Chhotu munching grass); "Qasim! Kahan the tum?" "Kuch nahi Mama!" + wink; Basim: "Superhero ne gaay ko hata diya!" — "Mujhe to suusuu aayi thi!"; Dada Abu: "Sabr se kaam lo…" ============
function driveCam(t, cxx, z = 1.55, dx = 0) { return camL(LA, cxx + dx, 1135, z, 540, 1180); }
function E_secret(t) {
  const D = sdur('secret'), kt = on('kt', t), kn = on('kn', t, .1, .3), bs2 = on('bs2', t), q6 = on('q6', t, .1, .3), dd2 = on('dd2', t);
  const cxx = 300 + 260 * t;   // the car rolls slowly (traffic is moving)
  let cam = driveCam(t, cxx, 1.5, 120);
  cam = lerpCam(cam, driveCam(t, cxx, 1.8, -60), ease(seg(t, LS('kt') - .2, LS('kt') + .4)) * (1 - ease(seg(t, LS('bs2') - .3, LS('bs2') + .3))));
  cam = lerpCam(cam, driveCam(t, cxx, 1.7, 160), ease(seg(t, LS('dd2') - .3, LS('dd2') + .4)));
  const S = chowk(t, cam, { sig: 'green' });
  // Lali + Chhotu in the park, munching (row layer)
  const pk = (PARK.gate[0] + PARK.gate[1]) / 2;
  const rowCow = `` ;
  let g = S.back;
  { const p = R(cam, pk - 60, 1078), q = R(cam, pk + 270, 1078); g += shadow(p.x, p.y + 4, 260 * p.s, .7) + lali({ x: p.x, y: p.y, s: COWS * p.s, pose: 'stand', t, chew: 1, grass: 1, mood: 'happy' }) + shadow(q.x, q.y + 4, 120 * q.s, .7) + chhotu({ x: q.x, y: q.y, s: COWS * q.s, pose: 'stand', t: t + .4, chew: 1, grass: 1, mood: 'happy', flip: -1 }); }
  const go = 260 * t;
  const fo = { roll: cxx / 60, bob: 2 * Math.sin(t * 12), mLook: kt ? [-14, 2] : [10, 0], mBrow: kt ? .8 : .2, mAmp: amp('MAMA'), qMouth: kn || q6 ? 'grin' : 'smirk', qAmp: amp('QASIM'), qWink: t > LE('kn') - .4 && t < LE('kn') + .25 ? 1 : 0, qArmL: q6 ? 120 : 20, qArmR: q6 ? 120 : 20,
    bMove: bs2 ? 'talk' : 'idle', bAmp: amp('BASIM'), bExpr: bs2 ? 'surprised' : 'happy', kExpr: kn ? 'wink' : (q6 ? 'laugh' : 'smug'), kMove: q6 ? 'laugh' : 'idle', dMove: dd2 ? 'talk' : 'idle', dAmp: amp('DADA ABU'), dExpr: dd2 ? 'happy' : 'happy', dYaw: dd2 ? 1.2 : .5, baExpr: 'happy' };
  g += S.A(famCar(cxx, YA, VS, t, fo));
  g += S.B('') + S.C('');
  g += S.front;
  if (t > LE('kn') - .4 && t < LE('kn') + .8) g += T(540, 330, 90, 'SHHH... RAAZ!', { fill: C.gold, shadow: '#000' });
  if (bs2) { const k = back(seg(t, LS('bs2') + .3, LS('bs2') + .6)); g += `<g transform="translate(540,330) scale(${k})">${burst(0, 0, 200, '#fff', 'SUPERHERO!', 60, -6, 1)}</g>`; }
  if (q6) g += T(540, 330, 80, 'HEE HEE!', { fill: '#fff', shadow: C.red });
  if (dd2) g += hookBig('SABR =', 'JAM KHULA!', t, LS('dd2') + .4, LS('dd2') + .8, 250);
  return g + capFor('secret', t);
}

// ============ 8 ENDING — Sakina's tears for ice cream, Baba melts at once ("Sab ko ice cream milegi!"), grin + wink to camera; "Mamaaa! Phir se suusuu…" → "Phir se?!" ============
function E_ending(t) {
  const D = sdur('ending'), k3s = LS('k3'), b3s = LS('b3'), cryK = seg(t, k3s - .1, k3s + .4) * (1 - seg(t, b3s + .6, b3s + 1.0)), grin = t > b3s + .8, b3 = on('b3', t), qs2 = on('qs2', t, .1, .3), pf2 = on('pf2', t, .05, .6);
  const cxx = 3000 + 230 * t, cheer = t > LE('b3') - .3 && t < LS('qs2');
  let cam = driveCam(t, cxx, 1.65, -20);
  cam = lerpCam(cam, driveCam(t, cxx, 1.95, -120), ease(seg(t, k3s, k3s + .6)) * (1 - ease(seg(t, b3s, b3s + .8))));
  cam = lerpCam(cam, driveCam(t, cxx, 1.5, 60), ease(seg(t, LS('qs2') - .4, LS('qs2') + .3)));
  const S = chowk(t, cam, { sig: 'green' });
  const fo = { roll: cxx / 60, bob: 2 * Math.sin(t * 12), kMove: cryK > .1 && !grin ? 'cry' : (cheer ? 'celebrate' : 'idle'), kMt: t, kExpr: cryK > .1 && !grin ? 'cry' : (grin ? 'wink' : 'smug'), kAmp: amp('SAKINA'), kYaw: grin ? 0 : .5,
    baMove: b3 ? 'talk' : (cryK > .3 ? 'holdHead' : (cheer ? 'laugh' : 'idle')), baAmp: amp('BABA'), baExpr: b3 ? 'happy' : (cryK > .3 ? 'sad' : 'happy'), baYaw: b3 ? -.3 : .6,
    mLook: qs2 || pf2 ? [-14, 2] : [8, -2], mBrow: pf2 ? 1 : .2, mAmp: amp('MAMA'), mTilt: pf2 ? -8 : 0,
    qMouth: qs2 ? 'wobble' : (cheer ? 'grin' : 'smirk'), qAmp: amp('QASIM'), qBrow: qs2 ? 1 : 0, qTilt: qs2 ? 6 * Math.sin(t * 16) : 0, qArmL: cheer ? 150 : 20, qArmR: cheer ? 150 : 20,
    bMove: cheer ? 'celebrate' : 'idle', dMove: cheer || pf2 ? 'laugh' : 'idle', dExpr: 'happy' };
  let g = S.back + S.A(jam('A', t, { go: 230 * t + 3000 }) + famCar(cxx, YA, VS, t, fo)) + S.B('') + S.C('');
  if (cryK > 0) { const f = carPt(cam, cxx, YA, VS, SEAT.sakina[0], SEAT.sakina[1]); g += fountain(f.x - 22 * f.s, f.y + 10, f.s * .9, t, cryK, carPt(cam, cxx, YA, VS, 0, 0).y + 30); }
  g += S.front;
  if (on('k3', t, .1, .2)) g += `<g transform="translate(540,300) scale(${back(seg(t, k3s, k3s + .3))})">${burst(0, 0, 230, '#7fd0ff', 'BUAAAA!', 92, 6, 1)}</g>` + T(540, 520, 60, 'CRYING GIRL ON!', { fill: '#fff', shadow: '#2f7fd6', op: clamp((t - k3s - .4) * 4) });
  if (cryK > .2) g += violin(150, 700, t, cryK);
  if (b3) g += hookBig('BABA', 'PIGHAL GAYE!', t, b3s + .6, b3s + .9, 260);
  if (grin && t < LS('qs2') - .2) { const f = carPt(cam, cxx, YA, VS, SEAT.sakina[0], SEAT.sakina[1]); g += burst(f.x - 120, f.y - 100, 70, '#fff', 'TING!', 34, 8, 1); if (t > LE('b3') - .2) g += kulfi(820, 760, 1.4, -15, 'mango') + kulfi(930, 790, 1.4, 12, 'pista'); }
  g += tally(4, 'AAJ SUUSUU BREAK:', seg(t, LS('pf2') + .1, LS('pf2') + .4));
  return g + capFor('ending', t);
}

// ============ 9 END CARD — layered: brush sky (far) / park trees (mid) / Lali + Chhotu (hero plane, right) / Susuman (hero plane) / sparkles (near) ============
function E_endcard(t) {
  const cam = { x: 30 * Math.sin(t * .4), y: 0, z: 1 + .06 * t / sdur('endcard') };
  let g = layer(4, cam, brushBg(t + 90), { f: '' });
  g += layer(2.2, cam, [[120, 900], [960, 880]].map(([x, y]) => `<rect x="${x - 24}" y="${y - 240}" width="48" height="260" fill="#7a5233" stroke="${C.ink}" stroke-width="5"/><circle cx="${x}" cy="${y - 330}" r="150" fill="#2e7d32" stroke="${C.ink}" stroke-width="5"/><circle cx="${x - 90}" cy="${y - 260}" r="100" fill="#43a047" stroke="${C.ink}" stroke-width="5"/>`).join('') + signal(540, 900, 'green', t));
  g += layer(1.3, cam, shadow(780, 1235, 200, .7) + lali({ x: 830, y: 1230, s: 1.0, pose: 'stand', t, mood: 'happy', chew: 1, grass: 1, flip: -1 }) + shadow(930, 1240, 90, .7) + chhotu({ x: 980, y: 1236, s: 1.05, pose: 'stand', t: t + .4, mood: 'love', flip: -1 }), { f: '' });
  g += layer(1, cam, shadow(330, 1255, 200, .8) + lightPool(330, 1250, 380, 70, .8) + susu({ x: 330, y: 1250, s: .85, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 40, armR: 150, mouth: 'grin', blink: blink(t, 2.6) }) + chaara(440, 980, 1.0, 10), { f: '' });
  let sp = ''; for (let i = 0; i < 9; i++) { const x = ((i * 157 + t * 60) % 1300) - 110, y = 200 + (i * 211) % 1500; sp += `<path d="M${x},${y - 40} L${x + 10},${y} L${x},${y + 40} L${x - 10},${y}Z M${x - 40},${y} L${x},${y - 10} L${x + 40},${y} L${x},${y + 10}Z" fill="${C.gold}" opacity=".8"/>`; }
  g += layer(.6, cam, sp);
  const n = L('n3'), half = LS('n3') + n.d * .6;
  if (t < half + .2) { g += `<g transform="translate(540,290) scale(${back(seg(t, .2, .5))})">${T(0, 0, 96, 'SABR KARO!', { shadow: '#000' })}</g><g transform="translate(540,410) scale(${back(seg(t, .5, .8))}) rotate(-3)">${T(0, 0, 100, 'HORN NAHI, PYAAR!', { fill: C.gold, shadow: C.red })}</g>`; }
  else {
    const k = back(seg(t, half + .2, half + .5)), clicked = t > half + 2.2;
    g += `<g transform="translate(540,300) scale(${k})">${T(0, 0, 100, 'LIKE + SUBSCRIBE', { shadow: '#000' })}</g>`;
    g += `<g transform="translate(540,1560) scale(${back(seg(t, half + .3, half + .6)) * (Math.abs(t - half - 2.1) < .1 ? .92 : 1)})"><rect x="-300" y="-70" width="600" height="140" rx="70" fill="${clicked ? '#555' : '#ff0000'}" stroke="#fff" stroke-width="6"/>${T(0, 28, 76, clicked ? 'SUBSCRIBED' : 'SUBSCRIBE', { sw: 0, ls: 4 })}</g>`;
    const cx = lerp(900, 640, ease(seg(t, half + 1.2, half + 2.0))), cy = lerp(1800, 1590, ease(seg(t, half + 1.2, half + 2.0)));
    if (t > half + 1.2 && t < half + 3.2) g += `<path d="M${cx},${cy} l0,80 l20,-18 l14,32 l14,-6 l-14,-30 l28,-2z" fill="#fff" stroke="#000" stroke-width="5"/>`;
    if (clicked) g += `<g transform="translate(540,1700) scale(${back(seg(t, half + 2.3, half + 2.6))})"><rect x="-260" y="-38" width="520" height="76" rx="38" fill="${C.gold}" stroke="#000" stroke-width="5"/>${T(0, 18, 46, 'AGLI KAHANI JALD!', { fill: '#000', sw: 0, ls: 1 })}</g>`;
  }
  return g + capFor('endcard', t);
}
