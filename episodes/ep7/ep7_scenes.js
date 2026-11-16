// Episode 7 "Injection Se Dar" — scenes. Each takes local time t; dialogue times come from TL (timeline.js).
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

// ---- Episode 7 helpers ----
const RD = 1.3;                                   // bazaar row depth
const R = (cam, X, Y) => proj(RD, cam, X, Y);      // row point → screen
const LAT = [400, 1092];                          // Latifa on the clinic step (row coords)
const STEP_SK = [560, 1100];                       // Sakina at the step with the basket (d=1.25)
const FAMX = { b: 470, m: 680, q: 860, k: 1040 };  // family on the street (d=1.05 / 1), screen-ish x when camF() is used
const camF = (z = 1, dx = 0) => camD(1, 640 + dx, 1180, z, 540, 1150);   // street framing in front of the clinic
// Mano held in arms / in the basket; cat at depth: draws cat() with the camera
const manoAt = (d, cam, x, y, o = {}) => at(d, cam, x, y, cat, Object.assign({ s: .5, t: o.t || 0 }, o), { w: o.sh ?? 60 });
function sneeze(x, y, s, k) { if (k <= 0 || k >= 1) return ''; return `<g transform="translate(${x},${y}) scale(${s * back(clamp(k * 3))})" opacity="${1 - seg(k, .7, 1)}">${T(0, 0, 52, 'AACHHOO!', { fill: '#fff', shadow: '#2f7fd6' })}${[0, 1, 2, 3, 4].map(i => `<circle cx="${-60 + i * 30 + 40 * k}" cy="${30 + 20 * Math.sin(i)}" r="${6 + 3 * (i % 2)}" fill="#bfe8ff" opacity=".8"/>`).join('')}</g>`; }
// Mano's climbing path in the machaan (row coords): [x, y, kind]
const MP = [[560, 1010, 'leap'], [640, 1090, 'run'], [1100, 1090, 'run'], [1140, 880, 'climb'], [1700, 880, 'run'], [1740, 600, 'climb'], [1230, 600, 'run'], [1270, 320, 'climb'], [1640, 320, 'run'], [1670, 40, 'climb'], [2110, 40, 'run']];
const MPL = (() => { let a = [0]; for (let i = 1; i < MP.length; i++) a.push(a[i - 1] + Math.hypot(MP[i][0] - MP[i - 1][0], MP[i][1] - MP[i - 1][1]) * (MP[i][2] === 'climb' ? 1.6 : 1)); return a; })();
function manoPath(u) {   // u 0..1 along the path → {x, y, pose, flip, rot}
  const L0 = u * MPL[MPL.length - 1]; let i = 1; while (i < MP.length - 1 && MPL[i] < L0) i++;
  const k = clamp((L0 - MPL[i - 1]) / (MPL[i] - MPL[i - 1])), a = MP[i - 1], b = MP[i];
  let x = lerp(a[0], b[0], k), y = lerp(a[1], b[1], k); if (b[2] === 'leap' || i === 1) y -= Math.sin(k * Math.PI) * 120;
  return { x, y, pose: b[2] === 'climb' ? 'cling' : 'walk', flip: b[0] >= a[0] ? 1 : -1, rot: b[2] === 'climb' ? -70 * (b[0] >= a[0] ? 1 : -1) : 0, end: u >= 1 };
}
const plankTip = (ang) => [PLANK.x + Math.cos(ang * Math.PI / 180) * (PLANK.len - 70), PLANK.y + Math.sin(ang * Math.PI / 180) * (PLANK.len - 70)];

// ============ 1 HOOK — flash-forward: top of the bamboo machaan, the loose plank snaps, Susuman catches little Mano in slow-mo; rewind ============
function E_hook(t) {
  const D = sdur('hook'), nE = LE('n1b') + .2, tt = t < nE ? t : Math.max(0, nE - (t - nE) * 2.4), rw = seg(t, nE, nE + .5), P = seg(tt, 0, nE);
  let cam = camD(RD, lerp(1930, 1990, ease(P)), lerp(240, 300, ease(P)), lerp(1.15, 1.35, ease(P)), 540, 900);
  const ang = lerp(18, 60, ease(seg(tt, 0, 2.5))), fallK = seg(tt, .3, 4.2);
  const S = bazaar(tt, cam, { plankAng: ang, plankCrack: 1, noCrates: 1 });
  let g = S.back;
  // Mano tumbling down in slow motion; Susuman swoops in diagonally and catches him (k>.55)
  const mt = plankTip(ang), mx = lerp(mt[0] + 30, 2110, fallK), my = lerp(mt[1] - 10, 460, fallK), caught = fallK > .62;
  const sk = eout(seg(tt, 0, 2.6)), sx = lerp(1500, 2060, sk), sy = lerp(1070, 720, sk) + 14 * Math.sin(tt * 3);
  const sp = R(cam, sx, sy), sc = .78 * sp.s;
  g += speed(sp.x - 120, sp.y - 160 * sc, 1, .6, 5);
  if (!caught) { const m = R(cam, mx, my); g += cat({ x: m.x, y: m.y, s: .7 * m.s, pose: 'fall', rot: tt * 120, t: tt, meow: 1, wide: 1 }); }
  g += susuFly(sp.x, sp.y, sc, tt, { rot: 10, armL: 165, armR: 160, mouth: on('qh', t) ? 'shout' : 'grin', amp: amp('QASIM') });
  if (caught) g += cat({ x: sp.x + 10 * sc, y: sp.y - 470 * sc, s: .75 * sc, pose: 'cling', flip: -1, t: tt, wide: .5 });
  g += S.front + vig(t < nE ? .7 : .4);
  if (t < nE) {
    g += hookBig('MAMA KO NAHI PATA...', 'QASIM HI HAI', t, .15, 1.3, 210).replace('font-size="96"', 'font-size="80"');
    if (t > LS('qh') - .1) g += `<g transform="translate(540,520) scale(${back(seg(t, LS('qh') - .1, LS('qh') + .25))}) rotate(-4)">${T(0, 0, 118, 'SUUU-SUUU-MAN!', { shadow: C.red, sw: 12 })}</g>`;
    if (t > 1.0) g += shhh(930, 560, back(seg(t, 1.0, 1.3)) * .9);
    if (t > LS('n1b') + .4) { const k = back(seg(t, LS('n1b') + .4, LS('n1b') + .7)); g += `<g transform="translate(540,1180) scale(${k})">${burst(0, 0, 175, C.red, 'INJECTION SE DAR!', 52, -5, 1)}</g>` + syringe(800, 1010, .9 * k, -30); }
  }
  if (t > nE) g += rewindFx(t - nE, rw, 'THODI DER PEHLE...');
  const f2 = seg(t, D - .25, D); if (f2 > 0) g += `<rect width="1080" height="1920" fill="#fff" opacity="${f2}"/>`;
  return g + capFor('hook', t);
}

// ============ 2 HOME — morning aangan: "Aaj teeka!" → Qasim runs circles around the charpai → hides behind Baba (office) → Sakina brings sick Mano ============
function E_home(t) {
  const D = sdur('home'), a1 = on('a1', t), q1 = on('q1', t, .1, .3), b1 = on('b1', t), k1 = on('k1', t), q1s = LS('q1'), b1s = LS('b1'), k1s = LS('k1');
  let cam = { x: lerp(560, 430, ease(seg(t, 0, q1s))), y: 0, z: 1.05, px: 600, py: 960 };
  cam = lerpCam(cam, { x: 600, y: 80, z: 1.12, px: 600, py: 960 }, ease(seg(t, q1s - .3, q1s + .6)));
  cam = lerpCam(cam, { x: 720, y: 160, z: 1.28, px: 600, py: 960 }, ease(seg(t, b1s - .4, b1s + .6)));
  cam = lerpCam(cam, { x: 600, y: 120, z: 1.18, px: 600, py: 960 }, ease(seg(t, k1s - .5, k1s + .5)));
  const S = aangan(t, cam, { noMano: 1 });
  let g = S.back;
  // MAMA (left), calls out, then watches the chase, then turns to Sakina
  g += at(1.08, cam, 560, 1215, mama, { s: SMA, t, phone: 0, look: q1 ? [14, 0] : (k1 ? [-14, 0] : [14, -4]), brow: a1 ? .6 : (q1 ? 1 : .3), amp: amp('MAMA'), tilt: q1 ? 6 * Math.sin(t * 6) : 0, blink: blink(t, 2.8) }, { w: 140 });
  // BABA enters from the blue door (office shirt, bag) during q1 → stands by the charpai
  const bw = ease(seg(t, q1s + .6, b1s)), bd = lerp(1.3, 1.02, bw), bx = lerp(1295, 1180, bw), by = lerp(1085, 1250, bw);
  const bmove = bw > 0 && bw < 1 ? 'walk' : (b1 ? 'talk' : (t > LE('b1') ? 'listen' : 'idle'));
  if (t > q1s + .5) g += at(bd, cam, bx, by, baba, { s: SBA, t, move: bmove, mt: t, yaw: bw < 1 ? -Math.PI / 2 : -.45, expr: b1 ? 'happy' : 'neutral', amp: amp('BABA') }, { w: 130 }) + (() => { const p = proj(bd, cam, bx, by); return bag(p.x - 120 * p.s, p.y - 225 * p.s, .9 * p.s); })();
  // QASIM: playing → running circles (q1) → hiding behind Baba (peeking) → listening
  let qx, qy = 1268, qflip = 1, run = false, hide = t > b1s - .5;
  if (t < q1s) { qx = 860; }
  else if (!hide) { const u = (t - q1s) * 1.1; qx = 1000 + 380 * Math.sin(u * 2.4); qy = 1268 + 50 * Math.cos(u * 2.4); qflip = Math.cos(u * 2.4) > 0 ? 1 : -1; run = true; }
  else { qx = lerp(1000 + 380 * Math.sin((b1s - .5 - q1s) * 2.64), 1330, ease(seg(t, b1s - .5, b1s))); run = t < b1s; qflip = -1; qy = 1262; }
  const peek = hide && !run;
  const qsvg = at(1, cam, qx, qy - (run ? Math.abs(Math.sin(t * 13)) * 26 : 0), susu, { s: SQ, t, flip: qflip, legL: run ? walkK(t, 30) : 0, legR: run ? -walkK(t, 30) : 0, armL: run ? 150 : (peek ? 60 : 20), armR: run ? 150 : 25, mouth: q1 ? 'shout' : (peek ? 'o' : 'grin'), amp: amp('QASIM'), brow: q1 || peek ? 1 : 0, look: [-14, -6], blink: blink(t), tilt: peek ? -10 : 0 }, { w: 110 });
  g += qsvg;
  if (run) { const p = proj(1, cam, qx, qy); g += speed(p.x - qflip * 40, p.y - 150 * p.s, qflip, .7, 4) + dust(p.x, p.y, (t * 3) % 1, 4, 30); }
  // SAKINA comes in from the left with Mano in the basket (thermometer, sneezing)
  const sw = ease(seg(t, k1s - 1.4, k1s)), SX = lerp(500, 930, sw);
  const sksvg = at(1, cam, SX, 1262, sakina, { s: SSK, t, move: sw > 0 && sw < 1 ? 'walk' : (k1 ? 'talk' : 'idle'), mt: t, yaw: sw < 1 ? Math.PI / 2 : .3, expr: k1 ? 'sad' : 'neutral', amp: amp('SAKINA') }, { w: 110 });
  if (t > k1s - 1.5) { g += sksvg; const p = proj(1, cam, SX, 1262), bxp = p.x + 95 * p.s, byp = p.y - 180 * p.s; const sn = seg(t, LE('k1') + .05, LE('k1') + .9);
    g += basket(bxp, byp, .55 * p.s, cat({ x: 0, y: -60, s: .55, pose: 'sit', t: t * .3, wide: 0 }) + thermo(34, -150, 1, 40 + 6 * Math.sin(t * 3))) + sneeze(bxp + 60 * p.s, byp - 200 * p.s, p.s, sn); }
  g += S.front;
  if (a1) g += hookBig('AAJ', 'TEEKA DAY!', t, LS('a1') + .3, LS('a1') + .9, 300) + syringe(860, 520, 1.1 * back(seg(t, LS('a1') + .9, LS('a1') + 1.2)), -20);
  if (q1) g += `<g transform="translate(540,320) scale(${back(seg(t, q1s, q1s + .3))})">${burst(0, 0, 210, '#7fd0ff', 'DAR LAGTA HAI!', 58, 6, 1)}</g>`;
  if (t > q1s && t < b1s - .5) { const p = proj(1, cam, qx, qy); g += T(p.x, p.y - 360 * p.s, 46, 'NAHIIII!', { fill: '#fff', shadow: C.red }); }
  if (b1 && t < b1s + 1.6) { const p = proj(bd, cam, bx, by); g += `<g transform="translate(${clamp(p.x, 280, 800)},330) scale(${back(seg(t, b1s, b1s + .3))})"><rect x="-190" y="-66" width="380" height="112" rx="24" fill="${SPK.BABA}" stroke="#fff" stroke-width="7"/>${T(0, 16, 70, 'BABA', { sw: 0, ls: 6 })}${T(0, 96, 38, 'OFFICE JAA RAHE THE', { fill: '#fff', shadow: '#000' })}</g>`; }
  if (k1) { const p = proj(1, cam, SX, 1262); g += marker(p.x + 95 * p.s, p.y - 260 * p.s, 120 * p.s, t, '#2f7fd6', 'MANO BIMAAR!'); }
  return g + capFor('home', t);
}

// ============ 3 CLINIC — crane down the bazaar: Mohalla Clinic + bamboo machaan; Latifa (white coat) at the step; the syringe glints → Mano bolts up the machaan ============
function E_clinic(t) {
  const D = sdur('clinic'), l1 = on('l1', t), d1 = on('d1', t), l1e = LE('l1'), go = l1e + .5, M = seg(t, go, go + 3.9), d1s = LS('d1');
  const mp = manoPath(M);
  let cam = camD(RD, 1100, 100, .62, 540, 900);
  cam = lerpCam(cam, camD(RD, 560, 980, 1.05, 540, 1100), ease(seg(t, 0, 2.4)));
  cam = lerpCam(cam, camD(RD, 500, 980, 1.25, 540, 1050), ease(seg(t, l1e - .6, l1e + .1)));
  if (M > 0) cam = lerpCam(cam, camD(RD, clamp(mp.x, 700, 1900), Math.min(mp.y, 1000), 1.15, 540, 1050), ease(seg(t, go, go + .8)));
  cam = lerpCam(cam, camD(RD, 1780, 440, .75, 540, 900), ease(seg(t, d1s - .3, d1s + .9)));
  const S = bazaar(t, cam, {});
  let g = S.back;
  // Dharmender skates along the road (d=1), stops and points up during d1
  const dk = ease(seg(t, .4, d1s - .2)), dx = lerp(-500, 1450, dk), ride = dk < 1;
  { const p = proj(1, cam, dx, 1330); g += skateboard(p.x, p.y + 4 * p.s, .75 * p.s, 0, dx / 40); }
  g += at(1, cam, dx, 1330 - (ride ? 42 : 0), dharm, { s: .95, t, move: d1 ? 'point' : (ride ? 'idle' : 'scared'), mt: t, yaw: ride ? Math.PI / 2 : -.3, expr: d1 ? 'surprised' : 'happy', amp: amp('DHARMENDER') }, { w: 100, h: ride ? 42 : 0 });
  // Latifa on the step (white coat + stethoscope); holds up the syringe after l1
  const lat = R(cam, ...LAT), glint = seg(t, l1e - .2, l1e + .3);
  g += at(RD, cam, LAT[0], LAT[1], latifaS, { s: 1, t, move: l1 ? 'wave' : (glint > 0 ? 'present' : 'idle'), mt: t, yaw: .4, expr: 'happy', amp: amp('LATIFA') }, { w: 100 });
  { const f = faceOf('latifa', lat.x, lat.y, lat.s * SKS.latifa); g += stetho(f[0], f[1] + 70 * lat.s, .8 * lat.s); if (glint > 0) g += syringe(lat.x + 110 * lat.s, lat.y - 330 * lat.s, .7 * lat.s, -60) + (glint < 1 ? `<path d="M${lat.x + 150 * lat.s},${lat.y - 420 * lat.s} l12,-40 12,40 40,12 -40,12 -12,40 -12,-40 -40,-12z" fill="#fff" opacity="${Math.sin(glint * Math.PI)}"/>` : ''); }
  // the family arrives (street, d=1.15): Qasim hides behind Baba, Mama on the right
  const fw = ease(seg(t, .2, 2.4)), walking = fw > 0 && fw < 1, FD = 1.15;
  const qsh = glint > 0 ? 6 * Math.sin(t * 40) : 0, peek = !walking;
  g += at(FD - .02, cam, lerp(-300, 760, fw) + qsh, 1150, susu, { s: SQ, t, flip: 1, legL: walking ? walkK(t, 26) : 0, legR: walking ? -walkK(t, 26) : 0, armL: 30, armR: glint > 0 ? 160 : 60, mouth: glint > 0 ? 'o' : 'frown', brow: 1, look: [14, -6], blink: blink(t), tilt: peek ? -8 : 0 }, { w: 100 });
  g += at(FD, cam, lerp(-180, 860, fw), 1150, baba, { s: SBA, t, move: walking ? 'walk' : (M > 0 ? 'scared' : 'idle'), mt: t, yaw: walking ? Math.PI / 2 : -.3, expr: M > 0 ? 'surprised' : 'happy' }, { w: 120 });
  g += at(FD, cam, lerp(-40, 1080, fw), 1040, mama, { s: SMA * .92, t, phone: 0, look: M > 0 ? [-10, -14] : [-12, 0], brow: M > 0 ? 1 : .2, blink: blink(t, 3) }, { w: 140 });
  // Sakina at the step with the basket; Mano inside until he bolts
  const SKP = [lerp(-200, STEP_SK[0], fw), STEP_SK[1]];
  g += at(1.25, cam, SKP[0], SKP[1], sakina, { s: SSK, t, move: walking ? 'walk' : (M > 0 ? 'scared' : 'idle'), mt: t, yaw: walking ? Math.PI / 2 : -.3, expr: M > 0 ? 'scared' : 'neutral' }, { w: 100 });
  { const p = proj(1.25, cam, SKP[0], SKP[1]), bxp = p.x - 90 * p.s, byp = p.y - 180 * p.s;
    g += basket(bxp, byp, .55 * p.s, M > 0 ? '' : cat({ x: 0, y: -60, s: .55, pose: 'sit', t: t * .3, wide: glint }) + thermo(34, -150, 1, 40)); }
  // Mano bolts: leap → run → climb the machaan → out onto the loose plank
  if (M > 0) {
    const m = R(cam, mp.x, mp.y);
    g += (mp.pose === 'walk' && mp.y > 1050 ? shadow(m.x, m.y + 4, 60 * m.s, .7) : '') + cat({ x: m.x, y: m.y, s: .72 * m.s, pose: mp.end ? 'sit' : mp.pose, flip: mp.end ? -1 : mp.flip, rot: mp.rot, t: t * (mp.end ? .3 : 1.4), meow: t < go + .6 || mp.end ? 1 : 0, wide: 1 });
    if (!mp.end) g += speed(m.x - mp.flip * 40, m.y - 40 * m.s, mp.flip, .5, 3);
    if (mp.end) g += marker(m.x, m.y - 60 * m.s, 120 * m.s + 40, t, C.red, 'MANO!') + T(m.x, m.y + 70, 40, 'KANP RAHA HAI!', { fill: '#fff', shadow: '#000' });
  }
  g += S.front;
  if (t < 2.4) g += hookBig('MOHALLA', 'CLINIC', t, .4, .8, 260);
  if (glint > .2 && t < go + 1) g += `<g transform="translate(540,330) scale(${back(seg(t, l1e, l1e + .3))})">${burst(0, 0, 200, '#fff', 'CHAMAK!', 70, 8, 1)}</g>`;
  if (t > go && t < go + 1.4) { const m = R(cam, mp.x, mp.y); g += T(clamp(m.x, 220, 860), m.y - 160, 70, 'MIAAAU!', { fill: '#fff', shadow: C.red, op: 1 - seg(t, go + 1.1, go + 1.4) }); }
  if (t > go + 1.2 && t < d1s) g += T(540, 300, 80, 'MANO BHAAGA!', { fill: C.gold, shadow: '#000', op: clamp((t - go - 1.2) * 3) });
  if (d1) g += hookBig('UPAR', 'MACHAAN PE!', t, d1s + .3, d1s + .7, 240);
  return g + capFor('clinic', t);
}

// shared street framing in front of the clinic (cry / brave / ending)
const FD = 1.15;
const camS = (X = 760, z = 1.25, Y = 980) => camD(RD, X, Y, z, 540, 1050);
function manoInset(t, k, cx = 830, cy = 560, r = 190, id = 'insM') {   // Mano trembling on the loose plank, up on the machaan
  if (k <= 0) return '';
  const ic = camD(RD, 2050, 120, 1.2, cx, cy + 40), sub = bazaar(t, ic, { noFG: 1, motes: false, plankAng: 4 * Math.sin(t * 9) });
  const m = R(ic, ...plankTip(0)), sh = 3 * Math.sin(t * 40);
  return inset(cx, cy, r * back(clamp(k)), sub.back + cat({ x: m.x + sh, y: m.y, s: .72 * m.s, pose: 'sit', flip: -1, t: t * .3, meow: (t * 2) % 1 < .3 ? 1 : 0, wide: 1 }), id);
}

// ============ 4 CRY — "Mama! Suusuu aayi hai!" → "Phir se?!" → Mama holds his hand: "Pehle teeka!" (secret in danger, Mano up high) → Sakina's crying act → Mama lets go to hug her → wink → "Jaa jaldi!" → Qasim zips to the clinic WC ============
function E_cry(t) {
  const D = sdur('cry'), k3s = LS('k3'), a6s = LS('a6'), jjs = LS('jj'), cryK = seg(t, k3s - .1, k3s + .4) * (1 - seg(t, a6s + .5, a6s + .9)), grin = t > a6s + .6;
  const zip = seg(t, LE('jj') - .1, LE('jj') + 1.2);
  let cam = camS(800, 1.3, 1000);
  cam = lerpCam(cam, camS(700, 1.45, 990), ease(seg(t, k3s - .3, k3s + .5)) * (1 - ease(seg(t, a6s, a6s + 1))));
  cam = lerpCam(cam, camS(760, 1.3, 1000), ease(seg(t, a6s + .8, jjs)));
  const S = bazaar(t, cam, { open: crySceneDoor(t), fgY: 1500 });
  let g = S.back;
  const qs = on('qs', t), pf = on('pf', t), a4 = on('a4', t), k3 = on('k3', t, .1, .3), jj = on('jj', t), danger = t > LS('a4') && t < k3s + .3;
  // Latifa on the step, syringe ready, looking up at the machaan
  g += at(RD, cam, LAT[0], LAT[1], latifaS, { s: 1, t, move: 'idle', mt: t, yaw: .5, expr: 'surprised' }, { w: 100 });
  { const p = R(cam, ...LAT), f = faceOf('latifa', p.x, p.y, p.s * SKS.latifa); g += stetho(f[0], f[1] + 70 * p.s, .8 * p.s); }
  // Baba on the right, on his phone, looking up (never sees)
  g += at(FD, cam, 1260, 1150, baba, { s: SBA, t, move: 'holdPhone', mt: t, yaw: -.4, expr: 'surprised' }, { w: 120 });
  // Mama: annoyed → grabs Qasim's hand → goes to Sakina and hugs her
  const mgo = ease(seg(t, a6s - .2, a6s + 1.0)), reach = ease(seg(t, LS('a4') - .2, LS('a4') + .2)) * (1 - ease(seg(t, a6s - .3, a6s)));
  const MX = lerp(1000 - 60 * reach, 690, mgo);
  // Sakina (step, d=1.25), crying act, then grin + wink over Mama's shoulder
  const SX = 560, smove = cryK > .1 && !grin ? 'cry' : (jj ? 'thumbsUp' : 'idle');
  g += at(1.25, cam, SX, 1100, sakina, { s: SSK, t, move: smove, mt: jj ? t - jjs : t, yaw: grin ? -.2 : .3, expr: cryK > .1 && !grin ? 'cry' : (grin ? 'wink' : (danger ? 'scared' : 'neutral')), amp: amp('SAKINA') }, { w: 100 });
  if (cryK > 0) { const p = proj(1.25, cam, SX, 1100), f = faceOf('sakina', p.x, p.y, SSK * p.s); g += cryGag(f[0], f[1] + 10 * p.s, p.s, t, cryK, p.y + 4, p.x); }
  g += at(FD, cam, MX + 60, 1040, mama, { s: SMA * .92, t, phone: 0, look: cryK > .2 || mgo > 0 ? [-14, -6] : (pf || reach > 0 ? [-14, 4] : [0, 6]), brow: pf ? 1 : (cryK > .2 ? .8 : .3), amp: amp('MAMA'), tilt: pf ? -6 : (mgo > .9 ? -8 : 0), blink: blink(t, 2.6) }, { w: 140 });
  // Qasim: wobbling; hand held by Mama; then zips to the WC door (FD → RD)
  const dd = Math.sin(t * 16), wob = zip === 0;
  let qd = FD - .02, qx = 800, qy = 1150;
  if (zip > 0) { const z = eout(zip); qd = lerp(FD - .02, RD, z); qx = lerp(800, CWC.x + CWC.w / 2, z); qy = lerp(1150, 1085, z); }
  if (zip < 1) g += `<g opacity="${1 - seg(zip, .85, 1)}">` + at(qd, cam, qx, qy, susu, { s: SQ, t, legL: zip > 0 ? walkK(t, 34) : (wob ? 16 + 6 * dd : 0), legR: zip > 0 ? -walkK(t, 34) : (wob ? -16 + 6 * dd : 0), armL: wob ? 4 : 35, armR: reach > .5 ? 80 : (wob ? 4 : 35), mouth: qs ? 'wobble' : (danger ? 'o' : (jj ? 'grin' : 'wobble')), amp: amp('QASIM'), brow: danger ? 1 : .8, tilt: wob ? 6 * dd : 0, look: danger ? [10, -10] : [-10, -4], blink: blink(t) }, { w: 100 }) + '</g>';
  if (zip > 0 && zip < 1) { const p = proj(qd, cam, qx, qy); g += speed(p.x + 40, p.y - 150 * p.s, -1, .8, 5); }
  if (reach > .5) { const p = proj(FD, cam, 870, 990); g += `<circle cx="${p.x}" cy="${p.y}" r="${26 * p.s}" fill="#c98b5c" stroke="${C.ink}" stroke-width="4"/>`; }
  g += S.front;
  g += tally(3, 'AAJ SUUSUU BREAK:', seg(t, LS('pf') + .2, LS('pf') + .5) * (1 - seg(t, LE('pf') + .2, LE('pf') + .4)));
  if (danger) g += hookBig('RAAZ', 'KHATRE MEIN!', t, LS('a4') + .3, LS('a4') + .6, 260) + manoInset(t, seg(t, LS('a4') + .5, LS('a4') + .9) * (1 - seg(t, k3s + .1, k3s + .4)), 830, 640, 170, 'insC');
  if (k3) g += `<g transform="translate(540,300) scale(${back(seg(t, k3s, k3s + .3))})">${burst(0, 0, 230, '#7fd0ff', 'BUAAAA!', 92, 6, 1)}</g>` + T(540, 520, 60, 'CRYING GIRL ON!', { fill: '#fff', shadow: '#2f7fd6', op: clamp((t - k3s - .4) * 4) });
  if (cryK > .2 && !grin) g += violin(150, 420, t, cryK);
  if (on('a6', t)) g += hookBig('MAMA NE', 'HAATH CHHODA!', t, a6s + .3, a6s + .6, 280);
  if (grin && t < jjs) { const p = proj(1.25, cam, SX, 1100), f = faceOf('sakina', p.x, p.y, SSK * p.s); g += burst(f[0] - 140, f[1] - 60, 70, '#fff', 'TING!', 34, 8, 1); }
  if (zip > .85) { const p = R(cam, CWC.x + CWC.w / 2, 900); g += burst(p.x, p.y - 20, 100, '#fff', 'DHAP!', 44, 6, 1 - seg(t, LE('jj') + 1.15, D)); }
  return g + capFor('cry', t);
}
const crySceneDoor = t => { const z = seg(t, LE('jj') - .1, LE('jj') + 1.2); return seg(z, .55, .7) * (1 - seg(z, .88, 1)); };

// ============ 5 POWER — the clinic WC door glows gold (Baba blurred in the foreground, on his phone, never looks), FLUUSH, power bar, SUUU-SUUU-MAN! ============
function E_power(t) {
  const nE = LE('n2'), q = LS('qp'), open = ease(seg(t, q - .45, q - .3)), glow = Math.max(seg(t, .2, nE), open);
  const cam = camD(RD, CWC.x + CWC.w / 2 + lerp(-40, 0, ease(seg(t, 0, q))), 900, lerp(1.2, 1.6, ease(seg(t, 0, q - .4))) + .06 * open, 540, 1000);
  const S = bazaar(t, cam, { open, glow, noCrates: 1 });
  let g = S.back;
  const dp = R(cam, CWC.x + CWC.w / 2, 900);
  if (open > 0) g += shafts(dp.x, dp.y, -Math.PI / 2, 14, 1900, .5 * open, t * 3, '#fff6c8', .45, .05);
  if (open > 0) {
    const st = eout(seg(t, q - .3, q + .5)), hero = ease(seg(t, q, q + .3)), up = ease(seg(t, LE('qp') + .5, sdur('power')));
    const dd = lerp(RD, 1.1, st);
    g += at(dd, cam, CWC.x + CWC.w / 2 - 20 * st, lerp(1085, 1150, st) - up * 1300, susu, { s: lerp(SQ, .74, st), t, power: open, cape: open, crown: seg(t, q, q + .3), shades: seg(t, LE('qp') + .15, LE('qp') + .45), armR: lerp(20, 165, hero), fistR: hero > .4, armL: lerp(20, 40, hero), amp: amp('QASIM'), mouth: 'smirk', blink: blink(t, 3), legL: up > 0 ? -20 : 0, legR: up > 0 ? 14 : 0 }, { w: 120, h: up * 1300, op: 1.2 });
    if (up > 0) { const p = proj(dd, cam, CWC.x + CWC.w / 2, 1150 - up * 1300); g += speed(p.x, p.y + 120, 0, .7, 3); }
  }
  g += `<g filter="url(#dofNear2)">${at(.72, cam, 1300, 1480, baba, { s: SBA, t, move: 'holdPhone', mt: t, yaw: .5, expr: 'surprised' }, { w: 0 })}</g>`;
  g += S.front;
  g = shake(g, (open > 0 && open < 1) ? 1 : (glow > .8 && open === 0 ? .3 : 0), t);
  if (t > .8 && t < 2.4) { const k = back(seg(t, .8, 1.1)); g += `<g transform="translate(540,640) scale(${k})">${burst(0, 0, 230, C.gold, 'FLUUSH!', 104, -8, 1 - seg(t, 2.1, 2.4))}</g>`; }
  const p = ease(seg(t, 1.0, nE));
  if (t > .9 && open < 1) g += `<g opacity="${seg(t, .9, 1.1) * (1 - open)}"><rect x="140" y="150" width="800" height="150" rx="30" fill="#000" opacity=".75"/>${T(540, 212, 62, 'SUUSUU POWER', { fill: C.gold, sw: 0, ls: 6 })}<rect x="190" y="235" width="700" height="44" rx="22" fill="#333" stroke="#fff" stroke-width="5"/><rect x="194" y="239" width="${692 * p}" height="36" rx="18" fill="${p > .99 ? '#ff3b30' : C.gold}"/>${T(540, 272, 40, Math.round(p * 100) + '%', { sw: 6 })}${emblem(180, 257, .7)}</g>`;
  if (t > 1.6 && open === 0) g += manoInset(t, seg(t, 1.6, 1.9), 820, 600, 180, 'insP');
  if (t > q) { const k = back(seg(t, q, q + .3)); g += `<g transform="translate(540,330) scale(${lerp(2.2, 1, clamp(k))}) rotate(-4)" opacity="${clamp(k * 2)}"><rect x="-460" y="40" width="920" height="40" rx="20" fill="${C.red}" transform="skewX(-20)"/>${T(0, 40, 138, 'SUUU-SUUU-MAN!', { shadow: C.red, sw: 12, ls: 2 })}</g>`; }
  return g + capFor('power', t);
}

// ============ 6 RESCUE — Susuman rises up the machaan; "Mano! Daro mat!"; the plank snaps, Mano falls (slow-mo), the catch; "Mujhe bhi dar lagta hai… dono saath mein bahadur!" ============
function E_rescue(t) {
  const D = sdur('rescue'), q3e = LE('q3'), crack = seg(t, q3e + .1, q3e + .5), tilt = ease(seg(t, q3e + .5, q3e + 1.0)), fall = seg(t, q3e + .8, q3e + 2.3), caught = fall >= 1, down = ease(seg(t, LE('q5') + .2, D));
  const ang = 48 * tilt + (crack > 0 && tilt === 0 ? 3 * Math.sin(t * 40) : 0);
  // Susuman path (row coords): rise → hover near the plank → dive → hover with Mano → fly down
  let sx, sy;
  if (t < q3e + .9) { const k = eout(seg(t, 0, 2.0)); sx = lerp(900, 1930, k); sy = lerp(1500, 340, k) + 18 * Math.sin(t * 3); }
  else if (!caught) { const k = ease(fall); sx = lerp(1930, 2110, k); sy = lerp(340, 820, k); }
  else { sx = lerp(2110, 2040, ease(seg(t, q3e + 2.3, q3e + 3))); sy = lerp(820, 640, ease(seg(t, q3e + 2.3, q3e + 3))) + 16 * Math.sin(t * 3); sx = lerp(sx, 700, down); sy = lerp(sy, 1100, down); }
  const tip = plankTip(ang), mfx = lerp(tip[0] + 20, 2120, fall), mfy = lerp(tip[1] - 6, 600, fall * fall);
  let cam = camD(RD, lerp(1500, 1980, ease(seg(t, 0, 2.0))), lerp(900, 260, ease(seg(t, 0, 2.0))), 1.2, 540, 900);
  cam = lerpCam(cam, camD(RD, 2040, 440, 1.0, 540, 900), ease(seg(t, q3e + .7, q3e + 1.6)));
  cam = lerpCam(cam, camD(RD, 2040, 420, 1.35, 540, 950), ease(seg(t, LS('q4') - .4, LS('q4') + .6)));
  cam = lerpCam(cam, camD(RD, 900, 900, .9, 540, 900), down);
  const S = bazaar(t, cam, { plankAng: ang, plankCrack: crack, noCrates: 1 });
  let g = S.back;
  const P = R(cam, sx, sy), sc = .64 * P.s;
  const slow = fall > 0 && !caught;
  if (!caught && t > .1) { const m = R(cam, fall > 0 ? mfx : tip[0], fall > 0 ? mfy : tip[1]); g += cat({ x: m.x + (fall > 0 ? 0 : 3 * Math.sin(t * 40)), y: m.y, s: .72 * m.s, pose: fall > 0 ? 'fall' : 'sit', flip: -1, rot: fall * 200, t: t * (fall > 0 ? .5 : .3), meow: fall > 0 || (t * 2) % 1 < .3 ? 1 : 0, wide: 1 }); }
  g += susuFly(P.x, P.y, sc, t, { rot: !caught && fall > 0 ? 25 : (t < 2 ? 12 : 0), armL: caught ? 105 : 160, armR: caught ? 120 : 150, mouth: on('q3', t) || on('q4', t) || on('q5', t) ? 'talk' : (slow ? 'o' : 'grin'), amp: amp('QASIM'), brow: on('q4', t) ? .6 : 0, blink: blink(t, 3) });
  if (caught) { const lick = on('q5', t, 0, 1.2) && t > LE('q5') - .4; g += cat({ x: P.x + 95 * sc, y: P.y - 230 * sc, s: .7 * sc, pose: 'sit', flip: -1, t: t * .3, wide: on('q4', t) ? .4 : 0, meow: lick ? 1 : 0 }); if (t > LE('q5') - .3) for (let i = 0; i < 3; i++) { const u = ((t - LE('q5') + .3) * .7 + i / 3) % 1; g += heart(P.x + 60 * sc + 40 * Math.sin(i * 2), P.y - 520 * sc - u * 160, .6 * P.s, 1 - u); } }
  if (t < 2) g += speed(P.x, P.y + 120, 0, .7, 3);
  if (down > 0 && down < 1) g += speed(P.x + 60, P.y - 200 * sc, -1, .6, 4);
  g += S.front;
  if (slow) g += vig(.8) + T(540, 330, 64, 'SLOW-MO...', { fill: '#fff', shadow: '#000', op: .9 });
  if (crack > 0 && crack < 1) g += `<g transform="translate(540,330) scale(${back(crack)})">${burst(0, 0, 190, '#fff', 'KRRRAK!', 66, -6, 1)}</g>`;
  if (caught && t < LS('q4') + .25) g += hookBig('PAKAD', 'LIYA!', t, q3e + 2.3, q3e + 2.5, 260);
  if (on('q4', t) && t > LS('q4') + .3) g += T(540, 300, 60, 'HERO KO BHI DAR LAGTA HAI!', { fill: C.gold, shadow: '#000', op: clamp((t - LS('q4') - .3) * 3) });
  if (on('q5', t)) g += hookBig('SAATH MEIN', 'BAHADUR!', t, LS('q5') + .3, LS('q5') + .7, 260);
  return g + capFor('rescue', t);
}

// ============ 7 BRAVE — Susuman hands Mano to Latifa and vanishes; "Qasim! Kahan the tum?" "Kuch nahi Mama!" + wink; Mano's teeka; Qasim's teeka: "Bas? Itna sa?!"; "Doctor dushman nahi, dost hote hain!" ============
function E_brave(t) {
  const D = sdur('brave'), kt = on('kt', t), kn = on('kn', t, .1, .3), l2 = on('l2', t), q7 = on('q7', t), q8 = on('q8', t, .1, .3), l3 = on('l3', t);
  const land = eout(seg(t, 0, .8)), gone = seg(t, .95, 1.35), qOut = ease(seg(t, 1.4, LS('kt') + .3));
  const q7e = LE('q7'), jab = seg(t, q7e + .3, q7e + 1.4), poke = t > q7e + 1.0, walkUp = ease(seg(t, LS('q7') - .1, q7e + .2));
  let cam = camS(640, 1.15, 990);
  cam = lerpCam(cam, camS(700, 1.3, 990), ease(seg(t, LS('kt') - .2, LS('kt') + .6)));
  cam = lerpCam(cam, camS(470, 1.55, 960), ease(seg(t, LS('l2') - .3, LS('l2') + .5)));
  cam = lerpCam(cam, camS(520, 1.7, 930), ease(seg(t, q7e, q7e + .6)));
  cam = lerpCam(cam, camS(600, 1.35, 980), ease(seg(t, LS('l3') - .2, LS('l3') + .6)));
  const S = bazaar(t, cam, { fgY: 1500 });
  let g = S.back;
  // Mano on the desk (inside the open clinic), with a plaster after his teeka
  const mano = R(cam, 380, 880), manoTeeka = t > LS('l2') + .3;
  if (t > .8) g += cat({ x: mano.x, y: mano.y, s: .62 * mano.s, pose: 'sit', flip: 1, t: t * .3, wide: 0 }) + (manoTeeka ? plaster(mano.x - 20 * mano.s, mano.y - 40 * mano.s, .8 * mano.s, -10) : '');
  if (t > LS('l2') + .1 && t < LS('l2') + 1.1) g += burst(mano.x + 80 * mano.s, mano.y - 170 * mano.s, 60, '#fff', 'TIK!', 34, 6, 1 - seg(t, LS('l2') + .8, LS('l2') + 1.1));
  if (t > LS('l2') + 1.2 && t < LE('l2') + .6) g += T(mano.x, mano.y - 190 * mano.s, 40, 'PURRR...', { fill: '#fff', shadow: '#000' });
  // Latifa on the step: catches Mano from Susuman, later gives Qasim his teeka
  const lat = R(cam, ...LAT);
  g += at(RD, cam, LAT[0] + 60, LAT[1], latifaS, { s: 1, t, move: l2 || l3 ? 'talk' : (t < 1.4 ? 'surprised' : (jab > 0 && !poke ? 'present' : 'idle')), mt: t, yaw: .5, expr: t < 1.4 ? 'surprised' : 'happy', amp: amp('LATIFA') }, { w: 100 });
  { const p = R(cam, LAT[0] + 60, LAT[1]), f = faceOf('latifa', p.x, p.y, p.s * SKS.latifa); g += stetho(f[0], f[1] + 70 * p.s, .8 * p.s); }
  // family on the street (Sakina with Mama, Baba on the right)
  g += at(FD, cam, 1250, 1150, baba, { s: SBA, t, move: t < 1.6 ? 'point' : (q8 ? 'clap' : 'idle'), mt: t, yaw: -.4, expr: t < 1.6 ? 'surprised' : 'happy' }, { w: 120 });
  g += at(FD, cam, 1110, 1040, mama, { s: SMA * .92, t, phone: 0, look: kt ? [-14, -2] : [-14, -6], brow: kt ? .8 : .2, amp: amp('MAMA'), blink: blink(t, 2.6) }, { w: 140 });
  g += at(FD, cam, 900, 1150, sakina, { s: SSK, t, move: kn ? 'thumbsUp' : (q8 ? 'clap' : 'idle'), mt: t, yaw: -.3, expr: kn ? 'wink' : 'happy' }, { w: 100 });
  // Susuman lands, hands Mano over, zips into the WC door (gold streak)
  if (gone < 1) { const sxr = lerp(lerp(350, 560, land), CWC.x + CWC.w / 2, ease(gone)), syr = lerp(lerp(400, 1085, land), 1085, gone), P = R(cam, sxr, syr), sc = .64 * P.s; g += `<g opacity="${1 - gone}">` + shadow(P.x, R(cam, sxr, 1090).y, 90 * P.s, .7) + susuFly(P.x, P.y, sc, t, { armL: t < .8 ? 105 : 40, armR: t < .8 ? 120 : 150, flip: gone > 0 ? 1 : -1, wink: t > .7 ? 1 : 0 }) + (t < .8 ? cat({ x: P.x - 95 * sc, y: P.y - 230 * sc, s: .7 * sc, pose: 'sit', flip: 1, t }) : '') + '</g>'; if (gone > 0) { const a = R(cam, 560, 900), b = R(cam, CWC.x + CWC.w / 2, 900); g += `<path d="M${a.x},${a.y} L${b.x},${b.y}" stroke="${C.gold}" stroke-width="40" stroke-linecap="round" opacity="${.6 * (1 - gone)}"/>`; } }
  // Qasim walks out from the WC door to the street, then up to Latifa for his teeka
  if (t > 1.4) {
    let qd = lerp(RD, FD - .02, qOut), qx = lerp(CWC.x + CWC.w / 2, 760, qOut), qy = lerp(1085, 1150, qOut);
    qd = lerp(qd, 1.27, walkUp); qx = lerp(qx, 560, walkUp); qy = lerp(qy, 1100, walkUp);
    const walking = (qOut > 0 && qOut < 1) || (walkUp > 0 && walkUp < 1), squeeze = jab > .2 && t < LS('q8');
    g += at(qd, cam, qx, qy, susu, { s: SQ, t, flip: walkUp > 0 ? -1 : 1, legL: walking ? walkK(t, 26) : 0, legR: walking ? -walkK(t, 26) : 0, armL: q7 ? 160 : 25, armR: kn ? 150 : (jab > 0 ? 60 : 25), fistL: q7, mouth: squeeze ? 'wobble' : (q8 ? 'o' : (kn || l3 ? 'grin' : 'frown')), amp: amp('QASIM'), brow: squeeze ? 1 : 0, blink: squeeze ? 1 : blink(t), wink: t > LE('kn') - .4 && t < LE('kn') + .2 ? 1 : 0, look: [-12, -4] }, { w: 100 });
    if (jab > 0) { const p = proj(qd, cam, qx, qy); const ax = p.x + 70 * p.s * SQ, ay = p.y - 250 * p.s * SQ; if (!poke) g += syringe(lerp(ax - 260 * p.s, ax - 100 * p.s, ease(jab)), ay - 10 * p.s, .55 * p.s, 0, seg(jab, .6, 1)); else g += plaster(ax - 20 * p.s, ay, .9 * p.s); if (t > q7e + 1.0 && t < q7e + 1.7) g += burst(ax + 40, ay - 120 * p.s, 70, '#fff', 'TIK!', 40, 6, 1); }
  }
  g += S.front;
  if (t < 1.4) g += T(540, 320, 72, 'WOH KAUN THA?!', { fill: C.gold, shadow: '#000', op: clamp((t - .4) * 3) });
  if (t > LE('kn') - .4 && t < LE('kn') + .8) g += T(540, 330, 90, 'SHHH... RAAZ!', { fill: C.gold, shadow: '#000' });
  if (q8) g += `<g transform="translate(540,330) scale(${back(seg(t, LS('q8'), LS('q8') + .3))})">${burst(0, 0, 200, C.gold, 'ITNA SA?!', 70, -6, 1)}</g>`;
  if (l3) g += hookBig('DOCTOR', 'DOST HAIN!', t, LS('l3') + .2, LS('l3') + .6, 260);
  return g + capFor('brave', t);
}

// ============ 8 ENDING — BACKFIRE: Sakina cries "mujhe injection nahi lagwana…" → "Achha yaad dilaya! tumhara teeka bhi aaj hi hai!" → tears stop mid-air; Baba: "koi SUPERHERO aaya tha!"; "Phir se suusuu…" → "Phir se?!" ============
function E_ending(t) {
  const D = sdur('ending'), k4s = LS('k4'), a8s = LS('a8'), stop = seg(t, a8s + 1.4, a8s + 1.6), cryK = seg(t, k4s - .1, k4s + .4) * (1 - stop), b2 = on('b2', t), qs2 = on('qs2', t, .1, .3), pf2 = on('pf2', t, .05, .6), zip = seg(t, LE('pf2') + .3, LE('pf2') + 1.1);
  let cam = camS(880, 1.3, 1000);
  cam = lerpCam(cam, camS(840, 1.5, 980), ease(seg(t, a8s + 1.2, a8s + 1.8)) * (1 - ease(seg(t, LS('b2') - .4, LS('b2') + .4))));
  cam = lerpCam(cam, camS(960, 1.25, 1000), ease(seg(t, LS('b2') - .4, LS('b2') + .4)));
  const S = bazaar(t, cam, { fgY: 1500 });
  let g = S.back;
  g += at(RD, cam, LAT[0] + 60, LAT[1], latifaS, { s: 1, t, move: on('a8', t) ? 'laugh' : 'idle', mt: t, yaw: .5, expr: 'happy' }, { w: 100 });
  { const p = R(cam, LAT[0] + 60, LAT[1]), f = faceOf('latifa', p.x, p.y, p.s * SKS.latifa); g += stetho(f[0], f[1] + 70 * p.s, .8 * p.s); if (t > a8s + .8 && t < LS('b2')) g += syringe(p.x + 110 * p.s, p.y - 330 * p.s, .7 * p.s, -60); }
  g += at(FD, cam, 1360, 1150, baba, { s: SBA, t, move: b2 ? 'holdPhone' : (pf2 ? 'laugh' : (t > a8s + 1.6 ? 'laugh' : 'idle')), mt: t, yaw: -.3, expr: b2 ? 'surprised' : 'happy', amp: amp('BABA') }, { w: 120 });
  if (b2) { const p = proj(FD, cam, 1360, 1150); g += `<g transform="translate(${p.x - 150 * p.s},${p.y - 470 * p.s}) scale(${p.s})"><rect x="-70" y="-120" width="140" height="230" rx="18" fill="#222" stroke="${C.ink}" stroke-width="5"/><rect x="-58" y="-104" width="116" height="190" fill="#7cc7f2"/>${susu({ x: 0, y: 70, s: .2, power: .8, cape: 1, crown: 1, shades: 1, armR: 160, t })}${T(0, -80, 18, 'MYSTERY HERO!', { fill: '#fff', shadow: C.red, sw: 3 })}</g>`; }
  g += at(FD, cam, 1180, 1040, mama, { s: SMA * .92, t, phone: 0, look: on('a8', t) ? [-14, -4] : (pf2 ? [-14, 2] : [-12, 0]), brow: pf2 ? 1 : .3, amp: amp('MAMA'), tilt: pf2 ? -8 : 0, blink: blink(t, 2.7) }, { w: 140 });
  // Sakina crying act → backfires (freeze, shocked)
  const SX = 880, shocked = stop > 0;
  g += at(FD, cam, SX, 1150, sakina, { s: SSK, t, move: cryK > .1 ? 'cry' : (shocked && t < LS('b2') ? 'scared' : 'idle'), mt: t, yaw: .3, expr: cryK > .1 ? 'cry' : (shocked && t < LS('b2') + .5 ? 'surprised' : 'smug'), amp: amp('SAKINA') }, { w: 100 });
  { const p = proj(FD, cam, SX, 1150), f = faceOf('sakina', p.x, p.y, SSK * p.s); if (cryK > 0) g += cryGag(f[0], f[1] + 10 * p.s, p.s, t, cryK, p.y + 4, p.x); else if (shocked && t < a8s + 3.2) { g += puddle(p.x, p.y + 4, p.s, 1 - seg(t, a8s + 1.6, a8s + 3.2)); for (let i = 0; i < 8; i++) g += `<circle cx="${f[0] + (i % 2 ? 1 : -1) * (40 + i * 18) * p.s}" cy="${f[1] - 20 * p.s + (i % 3) * 30 * p.s}" r="${9 * p.s}" fill="#7fd0ff" stroke="#2f7fd6" stroke-width="2" opacity="${1 - seg(t, a8s + 2.4, a8s + 3.2)}"/>`; } }
  // Qasim: giggles + wink to camera, then wobble, then zips off to the WC door
  const dd = Math.sin(t * 16), laugh = t > a8s + 1.5 && t < LS('b2');
  let qx = 700, qd = FD - .02, qy = 1150;
  if (zip > 0) { const z = eout(zip); qd = lerp(FD - .02, RD, z); qx = lerp(700, CWC.x + CWC.w / 2, z); qy = lerp(1150, 1085, z); }
  if (zip < 1) g += `<g opacity="${1 - seg(zip, .85, 1)}">` + at(qd, cam, qx, qy, susu, { s: SQ, t, flip: 1, legL: zip > 0 ? walkK(t, 30) : (qs2 ? 16 + 6 * dd : 0), legR: zip > 0 ? -walkK(t, 30) : (qs2 ? -16 + 6 * dd : 0), armL: laugh ? 150 : 25, armR: 25, mouth: qs2 ? 'wobble' : (laugh ? 'grin' : (b2 ? 'smirk' : 'frown')), amp: amp('QASIM'), brow: qs2 ? 1 : 0, wink: laugh && t > a8s + 2.2 && t < a8s + 3 ? 1 : 0, tilt: qs2 ? 6 * dd : (laugh ? 4 * Math.sin(t * 20) : 0), look: [10, -4], blink: blink(t) }, { w: 100 }) + '</g>';
  if (zip > 0 && zip < 1) { const p = proj(qd, cam, qx, qy); g += speed(p.x + 30, p.y - 150 * p.s, -1, .7, 4); }
  g += S.front;
  if (on('k4', t, .1, .2)) g += `<g transform="translate(540,300) scale(${back(seg(t, k4s, k4s + .3))})">${burst(0, 0, 230, '#7fd0ff', 'BUAAAA!', 92, 6, 1)}</g>` + T(540, 520, 60, 'CRYING GIRL... PHIR SE?', { fill: '#fff', shadow: '#2f7fd6', op: clamp((t - k4s - .4) * 4) });
  if (cryK > .2) g += violin(170, 700, t, cryK);
  if (shocked && t < LS('b2')) g += hookBig('ULTA', 'PAD GAYA!', t, a8s + 1.5, a8s + 1.8, 270);
  if (laugh && t > a8s + 2.2) g += T(250, 760, 54, 'HEE HEE!', { fill: '#fff', shadow: C.red });
  if (b2) g += hookBig('BABA KO', 'NAHI PATA!', t, LS('b2') + 1.0, LS('b2') + 1.3, 260);
  g += tally(4, 'AAJ SUUSUU BREAK:', seg(t, LS('pf2') + .1, LS('pf2') + .4));
  return g + capFor('ending', t);
}

// ============ 9 END CARD — layered: brush sky (far) / bazaar bunting (mid) / Mano with his plaster (hero plane, right) / Susuman (hero plane) / sparkles (near) ============
function E_endcard(t) {
  const cam = { x: 30 * Math.sin(t * .4), y: 0, z: 1 + .06 * t / sdur('endcard') };
  let g = layer(4, cam, brushBg(t + 90), { f: '' });
  g += layer(2.2, cam, bunting(-200, 1300, 160, 50, 14, t, 1, 1.2) + syringe(860, 560, 1.2, -30) + `<g transform="translate(860,420)">${heart(0, 0, 1.6)}</g>`);
  g += layer(1.3, cam, shadow(800, 1235, 90, .7) + cat({ x: 800, y: 1230, s: 1.7, pose: 'sit', flip: -1, t: t * .4, meow: (t % 2) < .3 ? 1 : 0 }) + plaster(770, 1150, 1.6, -10), { f: '' });
  g += layer(1, cam, shadow(400, 1255, 200, .8) + lightPool(400, 1250, 380, 70, .8) + susu({ x: 400, y: 1250, s: .85, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 40, armR: 150, mouth: 'grin', blink: blink(t, 2.6) }) + plaster(330, 1000, 1.2, -20), { f: '' });
  let sp = ''; for (let i = 0; i < 9; i++) { const x = ((i * 157 + t * 60) % 1300) - 110, y = 200 + (i * 211) % 1500; sp += `<path d="M${x},${y - 40} L${x + 10},${y} L${x},${y + 40} L${x - 10},${y}Z M${x - 40},${y} L${x},${y - 10} L${x + 40},${y} L${x},${y + 10}Z" fill="${C.gold}" opacity=".8"/>`; }
  g += layer(.6, cam, sp);
  const n = L('n3'), half = LS('n3') + n.d * .5;
  if (t < half + .2) { g += `<g transform="translate(540,290) scale(${back(seg(t, .2, .5))})">${T(0, 0, 96, 'DOCTOR SE', { shadow: '#000' })}</g><g transform="translate(540,410) scale(${back(seg(t, .5, .8))}) rotate(-3)">${T(0, 0, 104, 'MAT DARO!', { fill: C.gold, shadow: C.red })}</g>`; }
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
