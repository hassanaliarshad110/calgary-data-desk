// Episode 2 "Patang Aur Kabootar" — scenes. Each takes local time t; dialogue times come from TL (timeline.js).
// 2.5D: every scene is built from parallax layers (chhat()/aangan()) + characters placed at a depth with at()/proj().
const LS = id => L(id).s, LE = id => L(id).s + L(id).d;
const sdur = id => TL.scenes.find(s => s.id === id).dur;
const SB = .62 * KS, SG = .58 * KS, SQ = .55 * KS, SAM = .92;
const on = (id, t, a = .1, b = .15) => t > LS(id) - a && t < LE(id) + b;
function unproj(d, cam, sx, sy) { const k = 1 / d, z = cam.z ?? 1, s = 1 + (z - 1) * k, px = cam.px ?? 540, py = cam.py ?? 960; return { x: (sx - px) / s + px + (cam.x || 0) * k, y: (sy - py) / s + py + (cam.y || 0) * k }; }
const lerpCam = (a, b, k) => ({ x: lerp(a.x || 0, b.x || 0, k), y: lerp(a.y || 0, b.y || 0, k), z: lerp(a.z ?? 1, b.z ?? 1, k), px: lerp(a.px ?? 540, b.px ?? 540, k), py: lerp(a.py ?? 960, b.py ?? 960, k) });
// hand positions (action-plane units) for the rigs, so props and strings attach to the hands
const kidHand = (x, y, s, ang, side = 1, flip = 1, ww = 1) => [x + flip * s * side * (86 * ww + 156 * Math.sin(ang * Math.PI / 180)), y + s * (-410 + 156 * Math.cos(ang * Math.PI / 180))];
const susHand = (x, y, s, ang, side = 1, flip = 1) => [x + flip * s * side * (98 + 158 * Math.sin(ang * Math.PI / 180)), y + s * (-312 + 158 * Math.cos(ang * Math.PI / 180))];
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
const vig = op => `<rect width="1080" height="1920" fill="url(#vig)" opacity="${op}"/>`;
function glints(pts, t, op = 1) { return pts.map(([x, y], i) => { const k = Math.max(0, Math.sin(t * 7 + i * 2.1)); return k > .55 ? `<path d="M${x},${y - 12 * k} L${x + 3},${y} L${x},${y + 12 * k} L${x - 3},${y}Z M${x - 12 * k},${y} L${x},${y - 3} L${x + 12 * k},${y} L${x},${y + 3}Z" fill="#fff" opacity="${op * k}"/>` : ''; }).join(''); }
// the cut manjha draped over the neem branch (neem-layer coords). tang: 0 free pigeon, 1 wrapped round the wing
function manjhaInNeem(t, o = {}) {
  const top = o.top || [-200, -700], end = [NB.x + 70 + 20 * Math.sin(t * 1.4), NB.y + 420];
  let g = `<path d="M${top[0]},${top[1]} Q${NB.x - 120},${NB.y - 260} ${NB.x - 6},${NB.y - 8} Q${NB.x + 30},${NB.y + 180} ${end[0]},${end[1]}" stroke="#d63a4a" stroke-width="4" fill="none"/>`;
  g += glints([[NB.x - 60, NB.y - 120], [NB.x + 22, NB.y + 120], [NB.x + 50, NB.y + 300], [(top[0] + NB.x) / 2, (top[1] + NB.y) / 2 - 80]], t);
  return g;
}
function tangledPigeon(t, u = 1, o = {}) {   // u: 1 = fully tangled, 0 = freed
  const px = NB.x + 10, py = NB.y + 120 + 8 * Math.sin(t * 3), rot = 22 * Math.sin(t * 3.2) * u;
  let g = `<path d="M${NB.x - 6},${NB.y - 4} L${px - 10},${py - 70}" stroke="#d63a4a" stroke-width="4"/>`;
  g += kabootar({ x: px, y: py, s: .8, rot, t, pose: u > .3 ? 'tangled' : 'held', wide: u, flip: -1 });
  const coils = Math.round(3 * u);
  for (let i = 0; i < coils; i++) g += `<ellipse cx="${px - 6}" cy="${py - 66 + i * 14}" rx="${52 - i * 5}" ry="14" fill="none" stroke="#d63a4a" stroke-width="4" transform="rotate(${-20 + i * 14} ${px} ${py - 50})"/>`;
  return g;
}
function fallingFeathers(t, x0, y0, n = 4, spread = 260, seed = 0) {
  let g = '';
  for (let i = 0; i < n; i++) { const p = ((t * .28 + hs(i + seed)) % 1), x = x0 + (hs(i + seed + 4) - .5) * spread + 40 * Math.sin(t * 2 + i), y = y0 + p * 700; g += feather(x, y, .7, 40 * Math.sin(t * 2.5 + i), 1 - p * p); }
  return g;
}

// 1 HOOK — flash-forward: pigeon trapped in the manjha, Susuman flying up. Then rewind.
function E_hook(t) {
  const nE = LE('n1') + .3, tt = t < nE ? t : Math.max(0, nE - (t - nE) * 2.4), rw = seg(t, nE, nE + .5), P = seg(tt, 0, nE);
  const cam = { x: 232 - 30 * P, y: -262 + 40 * P, z: 1.75 + .3 * ease(P), py: 900 };
  const S = chhat(tt, cam, { neemInner: manjhaInNeem(tt) + tangledPigeon(tt) + fallingFeathers(tt, NB.x, NB.y + 80, 5, 300), noPlant: 1, nearKites: 1 });
  let g = S.back;
  const k = eout(P), sx = lerp(-160, 300, k), sy = lerp(2300, 1640, k);
  g += speed(sx - 40, sy - 260, 1, .55) + susu({ x: sx, y: sy, s: 1.0, rot: 30, t: tt, power: .9, cape: 1, crown: 1, shades: 1, armL: 175, armR: 160, legL: -20, legR: 14, mouth: 'shout', brow: .2 });
  g += S.front + vig(t < nE ? .85 : .4);
  if (t < nE) g += hookBig('KABOOTAR', 'PHAS GAYA!', t, .2, 1.7, 270);
  if (t > nE) g += rewindFx(t - nE, rw, 'THODI DER PEHLE...');
  const fl = seg(t, sdur('hook') - .25, sdur('hook')); if (fl > 0) g += `<rect width="1080" height="1920" fill="#fff" opacity="${fl}"/>`;
  return g + capFor('hook', t);
}

// kite flyers on our roof (used by intro / fight / lesson)
const BK = { x: 560, y: 1190 }, GD = { x: 800, y: 1180 };
function buntyFlyer(t, cam, o = {}) {
  const tug = o.tug ?? 1, a = 148 + 10 * Math.sin(t * 5) * tug;
  const hand = kidHand(BK.x, BK.y, SB, a), lh = kidHand(BK.x, BK.y, SB, 70 + 8 * Math.sin(t * 5) * tug, -1);
  const body = at(1, cam, BK.x, BK.y, bunty, Object.assign({ s: SB, t, armR: a, armL: 70 + 8 * Math.sin(t * 5) * tug, look: [8, -16], blink: blink(t), mouth: 'smile', tilt: -4 }, o.b || {}), { w: 120 });
  return { body, hand: proj(1, cam, hand[0], hand[1]), lhand: proj(1, cam, lh[0], lh[1]) };
}
function redKite(t, cam, cut) {  // Bunty's kite at depth 2.2
  const kx = 760 + 60 * Math.sin(t * .9) + (cut ? 0 : 0), ky = 250 + 40 * Math.sin(t * 1.3);
  return { p: proj(2.2, cam, kx, ky), g: layer(2.2, cam, patang(kx, ky, .62, 12 * Math.sin(t * 1.6), '#e5463b', '#ffd34a', { t })) };
}

// 2 INTRO — crane down from the sky full of kites to our roof
function E_intro(t) {
  const cr = ease(seg(t, 0, 5.2)), push = ease(seg(t, 5.6, sdur('intro')));
  const cam = { x: lerp(120, 0, cr), y: lerp(-1750, 0, cr), z: 1 + .1 * push, py: 1000 };
  const S = chhat(t, cam, { nearKites: 1, neemInner: kabootar({ x: NB.x, y: NB.y - 4, s: .8, t, pose: 'perch', flip: -1, bob: 1 }), pappu: pappu(t) });
  let g = S.back;
  g += layer(2.4, cam, patang(250 + 50 * Math.sin(t * 1.1), 330 + 30 * Math.sin(t * 1.5), .6, -10 + 10 * Math.sin(t * 1.4), '#22a35a', '#ffe9a0', { t }));
  const pp = pappuHand(t, cam), gk = proj(2.4, cam, 250 + 50 * Math.sin(t * 1.1), 330 + 30 * Math.sin(t * 1.5));
  g += dor(pp.x, pp.y, gk.x, gk.y + 40, 40 * gk.s, '#7a8a6a', 2.4);
  const K = redKite(t, cam); g += K.g;
  const B = buntyFlyer(t, cam);
  // Guddu with the charkhi, string runs from the spool to Bunty's hand
  const gh = kidHand(GD.x, GD.y, SG, 35, -1, 1, 1.22), cp = proj(1, cam, gh[0] + 50, gh[1] - 10);
  g += at(1, cam, GD.x, GD.y, guddu, { s: SG, t, armL: 35, armR: 40, look: [-6, -16], mouth: 'smile', blink: blink(t, 3) }, { w: 130 });
  g += charkhi(cp.x, cp.y, .5 * cp.s, 90, t, '#e5463b', 1);
  g += B.body + dor(cp.x, cp.y, B.lhand.x, B.lhand.y, 40, '#d63a4a', 3) + dor(B.hand.x, B.hand.y, K.p.x, K.p.y + 40, 60, '#d63a4a', 2.5);
  g += S.front;
  if (t < 4.6) g += hookBig('AAJ HAI', 'PATANG KA DIN!', t, .3, .9, 250);
  return g + capFor('intro', t);
}
// rival kid "Pappu" on the neighbour roof (rival layer coords) + his hand on screen
const PP = { x: 230, y: 846 };
function pappu(t, o = {}) { return kid(Object.assign({ x: PP.x, y: PP.y, s: .46, t, shirt: '#d33a3a', stripe: '#fff', shorts: '#334', hair: 'side', skin: '#b77850', armR: 150 + 8 * Math.sin(t * 4.3), armL: 60, look: [6, -16], mouth: 'smile', blink: blink(t, 2.9) }, o)) + shadow(PP.x - 20, PP.y + 2, 60, .8, { dx: -30, skew: 35 }); }
function pappuHand(t, cam) { const h = kidHand(PP.x, PP.y, .46, 150 + 8 * Math.sin(t * 4.3)); return proj(1.7, cam, h[0], h[1]); }

// 3 ASK — Qasim pops out of the stair room, wants to fly a kite; gets the charkhi instead
function E_ask(t) {
  const run = eout(seg(t, .35, 1.6)), running = t > .35 && t < 1.6;
  const zz = ease(seg(t, LE('g1') + .05, LE('g1') + .7));
  const qx = lerp(-300, 330, run), qy = 1210;
  const faceY = qy - 478 * SQ;
  const base = { x: lerp(-400, 0, ease(seg(t, .2, 1.8))), y: 0, z: 1 };
  const cam = zz > 0 ? lerpCam(base, { x: qx - 540, y: faceY - 960 + 120 / 1.9 * 1, z: 1.9, px: 540, py: 960 }, zz) : base;
  const S = chhat(t, cam, { doorOpen: t < .35 ? seg(t, 0, .2) : 1 - seg(t, 1.4, 1.7), neemInner: kabootar({ x: NB.x, y: NB.y - 4, s: .8, t, pose: 'perch', flip: -1, bob: 1 }), pappu: pappu(t) });
  let g = S.back;
  const K = redKite(t, cam); g += K.g;
  const b1 = on('b1', t), g1 = on('g1', t, .1, .3), q1 = on('q1', t);
  const B = buntyFlyer(t, cam, { b: { armL: b1 ? 55 + 10 * Math.sin(t * 10) : 70, look: b1 ? [-12, 6] : [8, -16], brow: b1 ? .2 : 0, amp: amp('BUNTY'), mouth: 'flat', tilt: b1 ? 8 : -4 } });
  // Guddu walks the charkhi over to Qasim on "tu bas charkhi pakad!"
  const give = ease(seg(t, LS('g1') + .1, LE('g1') - .2));
  const gx = lerp(GD.x, 560 + 0, give) + (give > 0 && give < 1 ? 0 : 0);
  const gw = give > 0 && give < 1;
  g += at(1, cam, gx, GD.y, guddu, { s: SG, t, armL: 35, armR: 40, legL: gw ? walkPh(t) : 0, legR: gw ? -walkPh(t) : 0, look: g1 ? [-14, 4] : [-6, -16], mouth: g1 && amp('GUDDU') < .04 ? 'laugh' : 'smile', amp: amp('GUDDU'), blink: blink(t, 3) }, { w: 130 });
  const gh = kidHand(gx, GD.y, SG, 35, -1, 1, 1.22);
  const cpos = give < 1 ? [gh[0] + 50, gh[1] - 10] : [qx, qy - 175 * SQ];
  const cp = proj(1, cam, lerp(cpos[0], qx, seg(give, .8, 1)), lerp(cpos[1], qy - 175 * SQ, seg(give, .8, 1)));
  const bounce = q1 ? Math.abs(Math.sin(t * 11)) * 22 : 0;
  const holds = give >= 1;
  g += at(1, cam, qx, qy - bounce, susu, { s: SQ, t, legL: running ? walkPh(t, 28) : 0, legR: running ? -walkPh(t, 28) : 0, armL: q1 ? 130 + 15 * Math.sin(t * 12) : holds ? 25 : running ? 30 : 12, armR: q1 ? 130 - 15 * Math.sin(t * 12) : holds ? 25 : running ? 30 : 12,
    amp: amp('QASIM'), mouth: t > LE('g1') ? 'frown' : 'smirk', brow: q1 ? .8 : 0, look: t > LS('b1') ? [12, -8] : [12, -6], blink: blink(t, 2.4) }, { w: 110, h: bounce });
  if (running) { const p = proj(1, cam, qx, qy); g += speed(p.x - 30, p.y - 150, 1, .6, 4) + dust(p.x - 60, p.y, (t * 3) % 1, 4, 30); }
  g += charkhi(cp.x, cp.y, .5 * cp.s, 90, t, '#e5463b', holds ? 0 : 1);
  g += B.body + dor(cp.x, cp.y, B.lhand.x, B.lhand.y, 40, '#d63a4a', 3) + dor(B.hand.x, B.hand.y, K.p.x, K.p.y + 40, 60, '#d63a4a', 2.5);
  g += S.front;
  if (zz > .5) { const k = back(seg(t, LE('g1') + .5, LE('g1') + .8)); g += `<g transform="translate(540,330) scale(${k})"><g fill="#555" stroke="${C.ink}" stroke-width="6"><circle cx="-60" cy="0" r="55"/><circle cx="10" cy="-30" r="70"/><circle cx="80" cy="0" r="55"/><rect x="-60" y="0" width="140" height="55"/></g><path d="M10,50 l-24,50 h30 l-20,56" stroke="${C.gold}" stroke-width="12" fill="none" stroke-linejoin="round"/></g>`; }
  return g + capFor('ask', t);
}

// 4 FIGHT — pech in the sky; Bunty's kite is cut ("Bo kaata!"); the loose manjha drifts onto the neem; Qasim needs the loo
function E_fight(t) {
  const cutT = LS('g2'), D = sdur('fight');
  const c1 = ease(seg(t, cutT + .3, cutT + 2.4)), c2 = ease(seg(t, D - 2.5, D - 1.2));
  let cam = { x: -60, y: -650, z: 1 + .12 * ease(seg(t, 1, cutT)) };
  cam = lerpCam(cam, { x: 260, y: -330, z: 1.1 }, c1);
  cam = lerpCam(cam, { x: -60, y: 20, z: 1.25, px: 540, py: 1000 }, c2);
  // kites: Bunty red (d=2.2) and Pappu green (d=2.4) swoop into each other
  const sw = seg(t, .4, cutT);
  const rk = { x: lerp(820, 600, ease(sw)) + 40 * Math.sin(t * 2.2), y: lerp(200, 300, sw) + 50 * Math.sin(t * 2.7) };
  const gk = { x: lerp(200, 470, ease(sw)) + 40 * Math.sin(t * 2.5 + 1), y: lerp(330, 240, sw) + 45 * Math.sin(t * 2.1) };
  const neemInner = (t < cutT ? '' : (() => {   // after the cut: the red kite + its loose line drift into the neem
    const k = ease(seg(t, cutT, cutT + 2.6));
    const kx = lerp(560, 1040, k), ky = lerp(-60, 60, k) - 120 * Math.sin(k * Math.PI);
    return manjhaInNeem(t, { top: [kx, ky + 50] }) + patang(kx, ky, .7, 40 * Math.sin(t * 6) * (1 - k) + 25 * k, '#e5463b', '#ffd34a', { t });
  })()) + kabootar({ x: NB.x, y: NB.y - 4, s: .8, t, pose: 'perch', flip: -1, bob: 1, wide: t > cutT + 1.5 ? 1 : 0, look: [-4, -6] });
  const S = chhat(t, cam, { neemInner, pappu: pappu(t), nearKites: 1 });
  let g = S.back;
  const gkp = proj(2.4, cam, gk.x, gk.y), rkp = proj(2.2, cam, rk.x, rk.y), pp = pappuHand(t, cam);
  g += layer(2.4, cam, patang(gk.x, gk.y, .6, 18 * Math.sin(t * 3), '#22a35a', '#ffe9a0', { t }));
  if (t < cutT) g += layer(2.2, cam, patang(rk.x, rk.y, .62, 18 * Math.sin(t * 3.4), '#e5463b', '#ffd34a', { t }));
  const B = buntyFlyer(t, cam, { tug: t < cutT ? 2 : 0, b: t > cutT ? { armR: lerp(148, 20, seg(t, cutT, cutT + .4)), armL: lerp(70, 160, seg(t, cutT + .2, cutT + .6)), mouth: 'o', brow: 1, look: [6, -18] } : {} });
  g += dor(pp.x, pp.y, gkp.x, gkp.y + 40, 30, '#7a8a6a', 2.4);
  if (t < cutT) g += dor(B.hand.x, B.hand.y, rkp.x, rkp.y + 40, 30, '#d63a4a', 2.6);
  else { const k = seg(t, cutT, cutT + 1.2); g += dor(B.hand.x, B.hand.y, lerp(rkp.x, B.hand.x + 200, k), lerp(rkp.y, B.hand.y - 120, k), 200 * k, '#d63a4a', 2.6, 1 - k * .6); }
  // pech sparks where the two strings cross
  if (t > cutT - 2.4 && t < cutT + .1) { const cx = (rkp.x + gkp.x) / 2, cy = Math.max(rkp.y, gkp.y) + 160; for (let i = 0; i < 6; i++) { const a = t * 20 + i; g += `<path d="M${cx},${cy} l${30 * Math.cos(a)},${30 * Math.sin(a)}" stroke="#ffd34a" stroke-width="5" stroke-linecap="round"/>`; } g += T(cx + 90, cy - 30, 54, 'PECH!', { fill: '#fff', shadow: C.red, op: .5 + .5 * Math.abs(Math.sin(t * 8)) }); }
  // our roof: Guddu + Qasim (Qasim starts the potty-wobble, then runs to the stairs)
  const g2 = on('g2', t);
  g += at(1, cam, GD.x + 40, GD.y, guddu, { s: SG, t, armL: g2 ? 160 : 35, armR: g2 ? 150 : 40, look: [-6, -16], mouth: t > cutT && amp('GUDDU') < .04 ? 'laugh' : 'smile', amp: amp('GUDDU'), squash: g2 ? 1 + .03 * Math.sin(t * 28) : 1, blink: blink(t, 3) }, { w: 130 });
  const wob = seg(t, D - 2.4, D - 2.2), leave = ease(seg(t, D - 1.0, D)), d = Math.sin(t * 16);
  const qx = lerp(300, -260, leave), qy = 1210;
  g += at(1, cam, qx, qy - (wob ? 8 * Math.abs(d) : 0), susu, { s: SQ, t, legL: leave > 0 ? walkPh(t, 30) : wob ? 16 + 6 * d : 0, legR: leave > 0 ? -walkPh(t, 30) : wob ? -16 + 6 * d : 0, armL: wob ? 4 : 25, armR: wob ? 4 : 25, mouth: wob ? 'wobble' : 'o', brow: wob ? 1 : .6, tilt: wob ? 6 * d : 0, look: wob ? [-10, 6] : [10, -16], blink: blink(t, 2.3), flip: leave > 0 ? -1 : 1 }, { w: 110 });
  if (!leave) { const cp = proj(1, cam, qx, qy - 175 * SQ); g += charkhi(cp.x, cp.y, .5 * cp.s, 90, t, '#e5463b'); }
  else { const cp = proj(1, cam, 360, 1230); g += charkhi(cp.x, cp.y, .5 * cp.s, 10, t, '#e5463b'); }
  if (leave > 0) { const p = proj(1, cam, qx, qy); g += speed(p.x + 30, p.y - 150, -1, .7, 4); }
  g += B.body + S.front;
  if (t > cutT && t < cutT + 1.4) g += `<g transform="translate(540,430) scale(${back(seg(t, cutT, cutT + .3))})">${burst(0, 0, 230, '#fff', 'BO KAATA!', 92, -8, 1 - seg(t, cutT + 1.1, cutT + 1.4))}</g>`;
  if (wob && t < D - .9) g += T(proj(1, cam, qx, qy).x + 10, 330, 120, '!!', { fill: C.gold, shadow: C.red, op: clamp((t - D + 2.4) * 4) });
  return shake(g, Math.abs(t - cutT) < .2 ? .6 : 0, t) + capFor('fight', t);
}

// 5 HOME — down the stairs into the aangan: "Ammi! Suusuu aayi hai!" → "Phir se?!" + counter; zip into the WC
function E_home(t) {
  const D = sdur('home'), zip = seg(t, LE('a1') + .1, LE('a1') + .75);
  const cam = { x: lerp(-720, 140, ease(seg(t, .15, 2.0))), y: 0, z: 1 + .12 * ease(seg(t, LE('a1'), D)), px: 600 };
  const S = aangan(t, cam, { open: seg(t, LE('a1') + .2, LE('a1') + .35) * (1 - seg(t, LE('a1') + .75, LE('a1') + .9)), manoSleep: 1 });
  let g = S.back;
  // Qasim: stairs (depth 1.3) → floor towards Ammi (depth 1.0) → zip back into the WC door (depth 1.3)
  const st = seg(t, 0, 1.0), fl = ease(seg(t, 1.0, 1.75));
  let d = 1.3, x, y, walking = t < 1.75;
  if (t < 1.0) { x = lerp(STAIR.x0 + 60, STAIR.x1 + 40, st); y = stairY(x); }
  else { d = lerp(1.3, 1.0, fl); x = lerp(STAIR.x1 + 40, 640, fl); y = lerp(1080, 1235, fl); }
  if (zip > 0) { d = lerp(1.0, 1.3, eout(zip)); x = lerp(640, WC.x + WC.w / 2, eout(zip)); y = lerp(1235, 1080, eout(zip)); }
  const q2 = on('q2', t, .1, 1.2), dd = Math.sin(t * 16), waiting = t > 1.75 && zip === 0;
  // Ammi by the charpai, on her phone
  const a1 = on('a1', t);
  g += at(1, cam, 900, 1250, ammi, { s: SAM, t, phone: 1, look: a1 || t > 1.9 ? [-12, 2] : [0, 12], brow: a1 ? 1 : .3, amp: amp('AMMI'), tilt: zip > 0 ? -10 * seg(zip, 0, .6) : 0, blink: blink(t, 2.6) }, { w: 150 });
  if (zip < 1) g += `<g opacity="${1 - seg(zip, .7, 1)}">` + at(d, cam, x, y, susu, { s: SQ, t, legL: walking || zip > 0 ? walkPh(t, 30) : waiting ? 16 + 6 * dd : 0, legR: walking || zip > 0 ? -walkPh(t, 30) : waiting ? -16 + 6 * dd : 0, armL: waiting ? 4 : 35, armR: waiting ? 4 : 35, mouth: 'wobble', brow: 1, tilt: waiting ? 6 * dd : 0, look: [10, 0], amp: amp('QASIM'), blink: blink(t), flip: 1 }, { w: 110 }) + '</g>';
  if (walking || (zip > 0 && zip < 1)) { const p = proj(d, cam, x, y); g += speed(p.x - 30, p.y - 150 * p.s, 1, .7, 4); }
  g += S.front;
  g += tally(5, 'AAJ SUUSUU BREAK:', seg(t, LS('a1') + .2, LS('a1') + .5));
  if (zip > .8 && t < D) { const p = proj(1.3, cam, WC.x + WC.w / 2, 840); g += burst(p.x, p.y - 20, 110, '#fff', 'DHAP!', 48, 6, 1 - seg(t, LE('a1') + 1.1, LE('a1') + 1.4)); }
  return g + capFor('home', t);
}

// 6 DANGER — the pigeon flaps into the loose manjha and gets trapped; kids see it
function E_danger(t) {
  const D = sdur('danger'), takeoff = 1.0, caught = 1.45;
  const pull = ease(seg(t, LS('g3') - .4, LS('g3') + 1.4)), push = ease(seg(t, LE('b2') - .6, D));
  let cam = lerpCam({ x: 232, y: -262, z: 2.0, py: 900 }, { x: 120, y: -130, z: 1.0, py: 960 }, pull);
  cam = lerpCam(cam, { x: 170, y: -260, z: 1.2, py: 900 }, push * .8);
  let pig;
  if (t < takeoff) pig = kabootar({ x: NB.x, y: NB.y - 4, s: .8, t, pose: 'perch', flip: -1, bob: 1 });
  else if (t < caught) { const k = seg(t, takeoff, caught); pig = kabootar({ x: lerp(NB.x, NB.x + 10, k), y: lerp(NB.y - 4, NB.y + 120, k) - 60 * Math.sin(k * Math.PI), s: .8, t, pose: 'fly', flip: -1 }); }
  else pig = tangledPigeon(t);
  const inner = manjhaInNeem(t) + pig + (t > caught ? fallingFeathers(t - caught, NB.x, NB.y + 90, 5, 280, 3) : '');
  const S = chhat(t, cam, { neemInner: inner, pappu: pappu(t, { armR: 30, look: [10, -12] }) });
  let g = S.back;
  const g3 = on('g3', t), b2 = on('b2', t);
  g += at(1, cam, 760, 1185, guddu, { s: SG, t, armR: g3 ? 155 + 6 * Math.sin(t * 9) : 30, armL: 30, look: [8, -18], mouth: 'o', amp: amp('GUDDU'), blink: blink(t, 3) }, { w: 130 });
  g += at(1, cam, 520, 1195, bunty, { s: SB, t, armL: b2 ? 168 : 30, armR: b2 ? 168 : 30, look: [10, -18], mouth: 'o', amp: amp('BUNTY'), brow: 1, tilt: b2 ? 4 * Math.sin(t * 5) : 0, blink: blink(t, 2.5) }, { w: 120 });
  g += S.front;
  if (t > caught && t < caught + .8) { const p = proj(1.45, cam, NB.x, NB.y + 60); g += burst(p.x + 150, p.y - 120, 110, '#fff', 'GUTUR-GU!', 40, 8, 1 - seg(t, caught + .5, caught + .8)); }
  if (t < LE('b2')) g += hookBig('KABOOTAR', 'KHATRE MEIN!', t, 1.7, 2.0, 240);
  return shake(g, t > caught && t < caught + .3 ? .5 : 0, t) + capFor('danger', t);
}

// 7 POWER — WC door glows gold (Ammi in the blurred foreground never looks up), FLUUSH, power bar, SUUU-SUUU-MAN!
function E_power(t) {
  const nE = LE('n3'), q = LS('q3'), open = ease(seg(t, q - .45, q - .3)), glow = Math.max(seg(t, .2, nE), open);
  const cam = { x: 270, y: -40, z: lerp(1.0, 1.42, ease(seg(t, 0, q - .4))) + .06 * open, px: 540, py: 900 };
  const S = aangan(t, cam, { open, glow, manoSleep: 1 });
  let g = S.back;
  const dp = proj(1.3, cam, WC.x + WC.w / 2, 840);
  if (open > 0) g += shafts(dp.x, dp.y, -Math.PI / 2, 14, 1900, .5 * open, t * 3, '#fff6c8', .45, .05);
  if (open > 0) {
    const st = eout(seg(t, q - .3, q + .5)), hero = ease(seg(t, q, q + .3)), up = ease(seg(t, LE('q3') + .5, sdur('power')));
    const dd = lerp(1.3, .95, st);
    g += at(dd, cam, WC.x + WC.w / 2 - 40 * st, lerp(1080, 1240, st) - up * 1300, susu, { s: lerp(SQ, .78, st), t, power: open, cape: open, crown: seg(t, q, q + .3), shades: seg(t, LE('q3') + .15, LE('q3') + .45), armR: lerp(20, 165, hero), fistR: hero > .4, armL: lerp(20, 40, hero), amp: amp('QASIM'), mouth: 'smirk', blink: blink(t, 3), legL: up > 0 ? -20 : 0, legR: up > 0 ? 14 : 0 }, { w: 120, h: up * 1300, op: 1.2 });
    if (up > 0) { const p = proj(dd, cam, WC.x + WC.w / 2, 1240 - up * 1300); g += speed(p.x, p.y + 120, 0, .7, 3); }
  }
  // Ammi: foreground (depth .78), soft-focus, scrolling her phone — never notices
  g += `<g filter="url(#dofNear2)">${at(.78, cam, 590, 1450, ammi, { s: SAM, t, phone: 1, look: [4, 14], brow: .2, blink: blink(t, 3.4), tilt: open > 0 ? 3 * Math.sin(t * 20) * (1 - seg(t, q, q + .6)) : 0 }, { w: 0 })}</g>`;
  g += S.front;
  g = shake(g, (open > 0 && open < 1) ? 1 : (glow > .8 && open === 0 ? .3 : 0), t);
  if (t > .8 && t < 2.4) { const k = back(seg(t, .8, 1.1)); g += `<g transform="translate(540,640) scale(${k})">${burst(0, 0, 230, C.gold, 'FLUUSH!', 104, -8, 1 - seg(t, 2.1, 2.4))}</g>`; }
  const p = ease(seg(t, 1.0, nE));
  if (t > .9 && open < 1) g += `<g opacity="${seg(t, .9, 1.1) * (1 - open)}"><rect x="140" y="150" width="800" height="150" rx="30" fill="#000" opacity=".75"/>${T(540, 212, 62, 'SUUSUU POWER', { fill: C.gold, sw: 0, ls: 6 })}<rect x="190" y="235" width="700" height="44" rx="22" fill="#333" stroke="#fff" stroke-width="5"/><rect x="194" y="239" width="${692 * p}" height="36" rx="18" fill="${p > .99 ? '#ff3b30' : C.gold}"/>${T(540, 272, 40, Math.round(p * 100) + '%', { sw: 6 })}${emblem(180, 257, .7)}</g>`;
  if (t > 1.6 && open === 0) { const k = back(seg(t, 1.6, 1.9)); const ins = `<g transform="translate(860,560) scale(${k})"><rect x="-170" y="-170" width="340" height="340" fill="#8fd0f4"/><circle cx="60" cy="-120" r="110" fill="#2e7d32"/><circle cx="-80" cy="-150" r="90" fill="#43a047"/><path d="M170,-40 Q40,-30 -60,-60" stroke="${C.ink}" stroke-width="22" fill="none"/><path d="M170,-40 Q40,-30 -60,-60" stroke="#7a5233" stroke-width="13" fill="none"/><path d="M-50,-58 L-40,10" stroke="#d63a4a" stroke-width="4"/>${kabootar({ x: -30, y: 90 + 6 * Math.sin(t * 3), s: .62, t, pose: 'tangled', wide: 1, flip: -1, rot: 18 * Math.sin(t * 3) })}</g>`; g += inset(860, 560, 150 * k, ins, 'insP'); }
  if (t > q) { const k = back(seg(t, q, q + .3)); g += `<g transform="translate(540,330) scale(${lerp(2.2, 1, clamp(k))}) rotate(-4)" opacity="${clamp(k * 2)}"><rect x="-460" y="40" width="920" height="40" rx="20" fill="${C.red}" transform="skewX(-20)"/>${T(0, 40, 138, 'SUUU-SUUU-MAN!', { shadow: C.red, sw: 12, ls: 2 })}</g>`; }
  return g + capFor('power', t);
}

// 8 RESCUE — fly up to the neem, slow-mo: unwind the manjha gently, set the pigeon free; a feather lands in his hair
function E_rescue(t) {
  const D = sdur('rescue'), A = 2.2, freeT = 5.0, landT = 6.4, relT = 6.8, offT = D - 1.1;
  let cam = lerpCam({ x: 0, y: 40, z: 1 }, { x: 232, y: -262, z: 1.9, py: 900 }, ease(seg(t, .2, A + .4)));
  cam = lerpCam(cam, { x: 80, y: -60, z: 1.0, py: 960 }, ease(seg(t, freeT, landT + .2)));
  if (t > offT) cam = lerpCam(cam, { x: 80, y: -260, z: .96 }, ease(seg(t, offT, D)));
  const u = 1 - ease(seg(t, A + .5, freeT));
  const slow = t > A && t < freeT;
  // Susuman path: up from behind the parapet (depth 1.1) to beside the pigeon (depth 1.45), then down to land (depth 1.0)
  let d, x, y, rot = 0, arms = [175, 160], pose = 'fly';
  const hx = NB.x + 60, hy = NB.y + 480;   // hover spot in neem coords (feet): his raised hands reach the pigeon
  if (t < A) { const k = eout(seg(t, 0, A)); d = lerp(1.05, 1.45, k); x = lerp(80, hx, k); y = lerp(1500, hy, k) - 160 * Math.sin(k * Math.PI); rot = lerp(40, 0, k); }
  else if (t < freeT) { d = 1.45; x = hx + 6 * Math.sin(t * 2); y = hy + 10 * Math.sin(t * 2.6); arms = [lerp(150, 120, u) + 20 * Math.sin(t * 6) * u, 150 - 20 * Math.sin(t * 6) * u]; pose = 'hover'; }
  else if (t < landT) { const k = ease(seg(t, freeT, landT)); d = lerp(1.45, 1.0, k); x = lerp(hx, 470, k); y = lerp(hy, 1215, k); arms = [40, 40]; }
  else { d = 1; x = 470; y = 1215; arms = t < relT ? [40, 40] : t < relT + .5 ? [lerp(40, 170, seg(t, relT, relT + .25)), lerp(40, 170, seg(t, relT, relT + .25))] : [25, t > LS('g4') && t < offT ? 40 : 25]; }
  if (t > offT) { const k = seg(t, offT, offT + .6); y = 1215 - 1600 * k * k; arms = [175, 175]; }
  const lift = d === 1 && t < offT ? 0 : 0;
  // pigeon: tangled → held in hands → flies off; feather drifts into Susuman's hair
  let pigInNeem = '', pigScreen = '';
  if (t < freeT) pigInNeem = tangledPigeon(t, u);
  const S = chhat(t, cam, { neemInner: manjhaInNeem(t) + pigInNeem + (t < freeT ? fallingFeathers(t, NB.x, NB.y + 80, 3, 260, 9) : ''), pappu: pappu(t, { armR: 160, look: [12, -14], mouth: 'o' }) });
  let g = S.back;
  if (t < A) { const p = proj(d, cam, x, y); g += speed(p.x - 60, p.y - 100, 1, .8, 6); }
  // kids watch
  const kin = ease(seg(t, landT - .4, landT + .8)), kw = kin > 0 && kin < 1, kx = lerp(380, 0, kin);
  g += at(1, cam, 900 + kx, 1190, bunty, { s: SB, t, legL: kw ? walkPh(t) : 0, legR: kw ? -walkPh(t) : 0, flip: kw ? -1 : 1, armL: 30, armR: on('b3', t) ? 150 : 30, mouth: 'o', amp: amp('BUNTY'), look: t > offT ? [6, -22] : t > freeT ? [-12, -4] : [-6, -20], brow: 1, blink: blink(t) }, { w: 120 });
  g += at(1, cam, 1090 + kx, 1180, guddu, { s: SG, t, legL: kw ? walkPh(t) : 0, legR: kw ? -walkPh(t) : 0, flip: kw ? -1 : 1, armL: 20, armR: on('g4', t) ? 150 : 20, mouth: t > LE('g4') ? 'laugh' : 'o', amp: amp('GUDDU'), look: t > offT ? [6, -22] : t > freeT ? [-12, -4] : [-6, -20], blink: blink(t, 3) }, { w: 130 });
  const sq = Math.abs(t - landT) < .15 ? .9 : 1;
  const gotFeather = t > relT + 1.6;
  g += at(d, cam, x, y, susu, { s: .62 * KS, t, power: .85, cape: 1, crown: 1, shades: 1, armL: arms[0], armR: arms[1], legL: t < A ? -25 : 0, legR: t < A ? 10 : 0, squash: sq, rot, mouth: t > relT ? 'grin' : (slow ? 'frown' : 'smirk'), brow: slow ? .1 : 0, wink: t > offT - .8 && t < offT - .3 ? 1 : 0, blink: blink(t, 3), look: slow ? [-14, -10] : [0, 0] }, { w: 120, h: d === 1 ? 0 : 400 });
  // pigeon in his hands (after freeT) and flying off (after relT)
  const S2 = .62 * KS;
  if (t >= freeT && t < relT) { const hp = proj(d, cam, x, y - 200 * S2); g += kabootar({ x: hp.x + 10, y: hp.y, s: .62 * hp.s * 1.1, t, pose: 'held', flip: -1, blink: blink(t, 2), coo: Math.max(0, Math.sin(t * 6)) }); }
  if (t >= relT) { const k = seg(t, relT, relT + 2.2), hp = proj(1, cam, 470, 1215 - 200 * S2); g += kabootar({ x: hp.x + 10 + 700 * k + 80 * Math.sin(k * 6), y: hp.y - 1100 * eout(k), s: .62 * (1 - .5 * k), t, pose: 'fly', flip: -1, rot: -15 }); }
  // the loose feather: off the pigeon at relT → lands on his curls
  if (t > relT && t < offT) { const k = ease(seg(t, relT, relT + 1.6)), head = proj(1, cam, 470 + 20, 1215 - 600 * S2); g += feather(lerp(head.x + 200, head.x, k) + 50 * Math.sin(k * 9) * (1 - k), lerp(head.y - 360, head.y, k), .55, lerp(60, -25, k) + 30 * Math.sin(k * 8) * (1 - k)); }
  if (t > offT) g += `<path d="M${proj(1, cam, 470, y + 200).x},${proj(1, cam, 470, y + 200).y} L${proj(1, cam, 470, 1215).x},${proj(1, cam, 470, 1215).y}" stroke="${C.gold}" stroke-width="40" opacity="${.5 * (1 - seg(t, offT + .3, D))}" stroke-linecap="round"/>`;
  g += dust(proj(1, cam, 470, 1215).x, proj(1, cam, 470, 1215).y, seg(t, landT - .05, landT + .7), 8, 70);
  g += S.front;
  if (slow) g += vig(.75) + T(540, 300, 92, 'DHEERE... DHEERE...', { fill: C.gold, shadow: '#000', op: clamp((t - A - .2) * 3) * (1 - seg(t, freeT - .3, freeT)) });
  if (t > freeT && t < freeT + 1.2) { const p = proj(d, cam, x, y - 200 * S2); g += `<circle cx="${p.x}" cy="${p.y}" r="${220 * seg(t, freeT, freeT + .7)}" fill="none" stroke="${C.gold}" stroke-width="16" opacity="${1 - seg(t, freeT, freeT + .7)}"/>` + T(540, 360, 130, 'AZAAD!', { fill: C.gold, shadow: C.red, op: 1 - seg(t, freeT + .9, freeT + 1.2) }); }
  g = shake(g, Math.abs(t - landT) < .3 ? .7 : 0, t);
  return g + capFor('rescue', t);
}

// 9 LESSON — Bunty learns: manjha hurts birds; cotton thread for everyone; Qasim's kite flies highest, the pigeon flock escorts it
function E_lesson(t) {
  const D = sdur('lesson'), launch = LE('b5') + .4, q4 = LS('q4'), n4 = LS('n4');
  const walk = eout(seg(t, 0, 1.3));
  const qx = lerp(-300, 330, walk), qy = 1210;
  const kh = seg(t, launch, q4 + 1.2);
  const ky = lerp(1000, -760, eout(kh)) + 30 * Math.sin(t * 1.4), kx = lerp(520, 640, kh) + 50 * Math.sin(t * .9);
  const up = ease(seg(t, launch + .6, launch + 1.6)), down = ease(seg(t, LE('q4') - .1, LE('q4') + .9)), wide = ease(seg(t, n4 + .4, D));
  let cam = { x: lerp(-380, 0, ease(seg(t, 0, 1.4))), y: 0, z: 1 };
  cam = lerpCam(cam, { x: 80, y: Math.min(0, 2.2 * (ky - 560)), z: 1 }, up);
  cam = lerpCam(cam, { x: -40, y: -170, z: 1.1, py: 1000 }, down);
  cam = lerpCam(cam, { x: 120, y: -380, z: .84, py: 1000 }, wide);
  const S = chhat(t, cam, { doorOpen: t < .3 ? seg(t, 0, .2) : 1 - seg(t, 1.2, 1.5), nearKites: 1, pappu: pappu(t, { armR: 40 }), neemInner: '', eve: 0 });
  let g = S.back;
  const kp = proj(2.2, cam, kx, ky);
  if (t > launch) g += layer(2.2, cam, patang(kx, ky, .7, 12 * Math.sin(t * 1.7), '#ffd34a', '#e5463b', { t }));
  // pigeon flock (the rescued pigeon + 2 friends) circles the kite; then the pigeon comes down to Qasim's shoulder
  const flockOn = t > launch + 1.2 && t < n4 + .2;
  if (flockOn) for (let i = 0; i < 3; i++) { const a = t * 2.2 + i * 2.1; g += layer(2.2, cam, kabootar({ x: kx + 220 * Math.cos(a), y: ky + 90 * Math.sin(a) + 40, s: .45, t: t + i, pose: 'fly', flip: Math.sin(a) > 0 ? 1 : -1 })); }
  const b4 = on('b4', t), b5 = on('b5', t);
  // Bunty winds up his manjha, sad → hands over a white cotton spool
  const giveK = ease(seg(t, LS('b5') + 1.2, LS('b5') + 2.4));
  g += at(1, cam, 640, 1195, bunty, { s: SB, t, armL: b4 ? 30 : 40, armR: b5 ? 60 + 10 * Math.sin(t * 6) : 40, mouth: b4 || b5 ? 'flat' : 'smile', amp: amp('BUNTY'), brow: b4 ? .9 : 0, tilt: b4 ? 8 : 0, look: t > launch + .5 ? [6, -18] : [-12, 6], blink: blink(t) }, { w: 120 });
  const bh = kidHand(640, 1195, SB, 40, -1), bp = proj(1, cam, bh[0], bh[1]);
  if (t < LS('b5') + 1.2) g += charkhi(bp.x, bp.y, .45 * bp.s, 90 + (b4 ? 30 * Math.sin(t * 5) : 0), t, '#d63a4a', b4 ? 1 : 0);
  g += at(1, cam, 900, 1180, guddu, { s: SG, t, armL: 30, armR: t > launch - .6 && t < launch + .3 ? 160 : 30, look: t > launch ? [-6, -18] : [-10, 4], mouth: t > q4 ? 'laugh' : 'smile', blink: blink(t, 3) }, { w: 130 });
  // Qasim (normal hoodie, feather still in his curls)
  const pulling = t > launch && t < q4 + 2;
  const qbob = on('q4', t) ? Math.abs(Math.sin(t * 10)) * 40 : 0;
  const qa = pulling ? 150 + 10 * Math.sin(t * 7) : 25;
  g += at(1, cam, qx, qy - qbob, susu, { s: SQ, t, legL: t < 1.3 ? walkPh(t, 22) * .7 : 0, legR: t < 1.3 ? -walkPh(t, 22) * .7 : 0, armR: qa, armL: on('q4', t) ? 160 : (pulling ? 70 : 25), mouth: on('q4', t) ? 'grin' : (t > LE('b5') ? 'grin' : 'frown'), amp: amp('QASIM'), look: t > launch ? [8, -16] : [12, -4], blink: blink(t, 2.6) }, { w: 110, h: qbob });
  const head = proj(1, cam, qx + 20, qy - qbob - 600 * SQ);
  g += feather(head.x, head.y, .55 * head.s, -25);
  const qh = susHand(qx, qy - qbob, SQ, qa), qhp = proj(1, cam, qh[0], qh[1]);
  if (giveK > 0 && giveK < 1) { const p = proj(1, cam, lerp(bh[0], qx + 60, giveK), lerp(bh[1], qy - 170 * SQ, giveK) - 60 * Math.sin(giveK * Math.PI)); g += charkhi(p.x, p.y, .4 * p.s, 90, t, '#f4f1ea'); }
  if (giveK >= 1) { const sp = proj(1, cam, qx - 70, qy - 190 * SQ); g += charkhi(sp.x, sp.y, .4 * sp.s, 90, t, '#f4f1ea', pulling ? 1.5 : 0); if (t > LE('b5') - .4 && t < launch + 1) g += T(sp.x, sp.y - 70 * sp.s, 40, 'SAADA DHAAGA', { fill: '#fff', shadow: '#000' }); }
  if (t > launch) g += dor(qhp.x, qhp.y, kp.x, kp.y + 50, 40, '#f4f1ea', 2.8);
  // the pigeon returns to Qasim's shoulder for "dosti nibhaayi"
  if (t > n4 - .4) { const k = ease(seg(t, n4 - .4, n4 + .8)), sh = proj(1, cam, qx + 90, qy - 330 * SQ); g += kabootar({ x: lerp(sh.x + 500, sh.x, k), y: lerp(sh.y - 700, sh.y, k), s: .5 * sh.s, t, pose: k < 1 ? 'fly' : 'perch', flip: -1, bob: 1, coo: k >= 1 ? Math.max(0, Math.sin(t * 5)) : 0 }); if (k >= 1) for (let i = 0; i < 2; i++) { const p = ((t - n4) * .8 + i * .5) % 1; g += heart(sh.x + 30, sh.y - 80 - p * 140, .5, 1 - p); } }
  g += S.front;
  if (t > q4 - .2 && t < LE('q4') + .3) g += hookBig('SABSE UNCHI', 'PATANG!', t, q4 - .2, q4 + .1, 250);
  if (t > q4 - .3 && t < LE('q4') + .1) {   // Qasim's shout from the roof, as an inset while we stay up with the kite
    const k = back(seg(t, q4 - .3, q4)) * (1 - seg(t, LE('q4') - .15, LE('q4') + .1)), ic = { x: qx - 270, y: 880 - 1010, z: 2.0, px: 270, py: 1010 };
    g += inset(270, 1010, 190 * k, `<rect width="1080" height="1920" fill="#8fd0f4"/>` + layer(1, ic, roofL(t, ic, {})) + at(1, ic, qx, qy - qbob, susu, { s: SQ, t, armR: qa, armL: 160, mouth: 'grin', amp: amp('QASIM'), look: [8, -16], blink: blink(t, 2.6) }, { w: 0 }) + feather(proj(1, ic, qx + 20, qy - qbob - 600 * SQ).x, proj(1, ic, qx + 20, qy - qbob - 600 * SQ).y, .55 * 2, -25), 'insQ');
  }
  if (t > launch + 1.4 && t < q4 - .4) g += T(540, 330, 80, 'UPAR... AUR UPAR!', { fill: '#fff', shadow: '#000', op: clamp((t - launch - 1.4) * 3) });
  return g + capFor('lesson', t);
}

// 10 ENDING — evening: "Ammiii! Suusuu aayi hai!" → "Phir se?! Aur baalon mein ye pankh?" → "Kuch nahi Ammi!" + wink
function E_ending(t) {
  const D = sdur('ending'), zip = seg(t, LE('q6') + .25, LE('q6') + .9), cz = ease(seg(t, LS('a2') + .6, LS('a2') + 1.4)) * (1 - ease(seg(t, LE('q6') + .1, LE('q6') + .6)));
  const run = ease(seg(t, 0, 1.0));
  let x = lerp(STAIR.x1 + 40, 640, run), y = lerp(1080, 1235, run), d = lerp(1.3, 1.0, run);
  if (zip > 0) { d = lerp(1.0, 1.3, eout(zip)); x = lerp(640, WC.x + WC.w / 2, eout(zip)); y = lerp(1235, 1080, eout(zip)); }
  const headY = 1235 - 600 * SQ;
  let cam = { x: 140, y: 0, z: 1, px: 600 };
  cam = lerpCam(cam, { x: 640 - 540, y: headY - 760, z: 1.75, px: 540, py: 760 }, cz);
  const S = aangan(t, cam, { eve: 1, open: seg(t, LE('q6') + .3, LE('q6') + .45) * (1 - seg(t, LE('q6') + .85, LE('q6') + 1.0)), manoWide: on('a2', t, 0, .5) ? 1 : 0, manoMeow: on('q6', t) ? .6 : 0 });
  let g = S.back;
  const q5 = on('q5', t, .1, .3), a2 = on('a2', t), q6 = on('q6', t, .1, .3), dd = Math.sin(t * 16);
  g += at(1, cam, 900, 1250, ammi, { s: SAM, t, phone: 1, look: a2 ? [-14, -6] : [-12, 2], brow: a2 ? 1 : .4, amp: amp('AMMI'), blink: blink(t, 2.6), tilt: a2 ? -6 : 0 }, { w: 150 });
  const waiting = t > 1.0 && zip === 0;
  if (zip < 1) g += `<g opacity="${1 - seg(zip, .7, 1)}">` + at(d, cam, x, y, susu, { s: SQ, t, legL: !waiting ? walkPh(t, 30) : (q5 ? 16 + 6 * dd : 0), legR: !waiting ? -walkPh(t, 30) : (q5 ? -16 + 6 * dd : 0), armL: q6 ? 20 : 4, armR: q6 ? 150 : 4, mouth: q6 ? 'grin' : (q5 ? 'wobble' : 'o'), amp: amp('QASIM'), brow: q5 ? 1 : (a2 ? .7 : 0), wink: t > LE('q6') - .4 && t < LE('q6') + .2 ? 1 : 0, tilt: q5 ? 6 * dd : 0, look: a2 ? [-6, -14] : [10, 0], blink: blink(t) }, { w: 110 }) + (() => { const h = proj(d, cam, x + 20, y - 600 * SQ); return feather(h.x, h.y, .55 * h.s, -25 + (a2 ? 6 * Math.sin(t * 4) : 0)); })() + '</g>';
  if (!waiting && zip < 1) { const p = proj(d, cam, x, y); g += speed(p.x - 30, p.y - 150 * p.s, 1, .7, 4); }
  if (cz > .6 && a2) { const h = proj(1, cam, 660, headY); g += `<circle cx="${h.x}" cy="${h.y}" r="${120 + 10 * Math.sin(t * 6)}" fill="none" stroke="${C.gold}" stroke-width="10" opacity=".9" stroke-dasharray="26 16"/>` + T(h.x - 230, h.y - 190, 70, 'PANKH?!', { fill: '#fff', shadow: C.red }); }
  g += S.front;
  g += tally(6, 'AAJ SUUSUU BREAK:', seg(t, LE('q6') + .6, LE('q6') + .9));
  return g + capFor('ending', t);
}

// 11 END CARD — layered: brush sky (far) / kites (mid) / Susuman + pigeon / sparkles (near); lesson, then LIKE + SUBSCRIBE
function E_endcard(t) {
  const cam = { x: 30 * Math.sin(t * .4), y: 0, z: 1 + .06 * t / sdur('endcard') };
  let g = layer(4, cam, brushBg(t + 90), { f: 'dof2' });
  g += kiteField(t, cam, 2.2, 6, 180, 900, .6, 41, -100, 1150);
  g += layer(1, cam, shadow(540, 1255, 200, .8) + lightPool(540, 1250, 380, 70, .8) + susu({ x: 540, y: 1250, s: .85, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 40, armR: 150, mouth: 'grin', blink: blink(t, 2.6) })
    + (() => { const h = susHand(540, 1250, .85, 150); return kabootar({ x: h[0] + 10, y: h[1] - 10, s: .7, t, pose: 'perch', flip: -1, bob: 1, coo: Math.max(0, Math.sin(t * 4)) * .7 }); })(), { f: '' });
  let sp = ''; for (let i = 0; i < 9; i++) { const x = ((i * 157 + t * 60) % 1300) - 110, y = 200 + (i * 211) % 1500; sp += `<path d="M${x},${y - 40} L${x + 10},${y} L${x},${y + 40} L${x - 10},${y}Z M${x - 40},${y} L${x},${y - 10} L${x + 40},${y} L${x},${y + 10}Z" fill="${C.gold}" opacity=".8"/>`; }
  g += layer(.6, cam, sp);
  const n5 = L('n5'), half = LS('n5') + n5.d * .62;
  if (t < half + .2) { g += `<g transform="translate(540,290) scale(${back(seg(t, .2, .5))})">${T(0, 0, 96, 'MANJHA NAHI,', { shadow: '#000' })}</g><g transform="translate(540,410) scale(${back(seg(t, .5, .8))}) rotate(-3)">${T(0, 0, 108, 'SAADA DHAAGA!', { fill: C.gold, shadow: C.red })}</g>`; }
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

const EP = { hook: E_hook, intro: E_intro, ask: E_ask, fight: E_fight, home: E_home, danger: E_danger, power: E_power, rescue: E_rescue, lesson: E_lesson, ending: E_ending, endcard: E_endcard };
window.drawFrame = (id, t) => {
  const s = TL.scenes.find(x => x.id === id); ABS = s.start + t;
  document.getElementById('s').innerHTML = defs() + skyDefs + skyDefs2 + depthDefs(id === 'ending' ? '#ffd9b0' : '#d6e9f6') + EP[id](t);
};
window.drawCast = () => {
  let g = `<rect width="1080" height="1920" fill="#f3ead9"/>` + T(540, 100, 80, 'SUSUMAN — SIDE CAST', { fill: C.ink, sw: 0 });
  g += T(270, 180, 46, 'BUNTY (captain)', { fill: '#2f6fd1', sw: 0 }) + bunty({ x: 270, y: 700, t: 0, s: .72, mouth: 'smile' });
  g += T(810, 180, 46, 'GUDDU (bowler)', { fill: '#e0a020', sw: 0 }) + guddu({ x: 810, y: 700, t: 0, s: .68, mouth: 'smile' });
  g += T(200, 800, 42, 'MANO (kitten)', { fill: C.red, sw: 0 }) + cat({ x: 190, y: 1010, s: 1.1, pose: 'sit', t: 0 });
  g += T(540, 800, 42, 'KABOOTAR (ep2)', { fill: '#5a6b80', sw: 0 }) + kabootar({ x: 520, y: 1010, s: 1.3, t: 0, pose: 'perch' });
  g += T(880, 800, 42, 'GALI DOG', { fill: '#7a4f28', sw: 0 }) + dog({ x: 840, y: 1010, s: .95, run: 0, t: 0 });
  g += T(250, 1110, 42, 'PAPPU (rival roof)', { fill: '#d33a3a', sw: 0 }) + kid({ x: 250, y: 1560, s: .62, t: 0, shirt: '#d33a3a', stripe: '#fff', shorts: '#334', hair: 'side', skin: '#b77850', mouth: 'smile' });
  g += T(780, 1110, 42, 'PATANG + CHARKHI', { fill: C.ink, sw: 0 }) + patang(700, 1300, 1.3, 10, '#e5463b', '#ffd34a') + charkhi(900, 1330, .8, 0, 0, '#f4f1ea') + feather(700, 1500, 1.2, -20);
  g += T(540, 1590, 42, 'QASIM  +  SUSUMAN OUTDOOR LOOK', { fill: C.ink, sw: 0 }) + susu({ x: 760, y: 1910, s: .38, t: .3, power: .8, cape: 1, crown: 1, shades: 1, armR: 160, fistR: 1, mouth: 'smirk' }) + susu({ x: 320, y: 1910, s: .38, t: .3, mouth: 'frown' });
  document.getElementById('s').innerHTML = defs() + skyDefs + skyDefs2 + depthDefs() + g;
};

// =================== 16:9 version (same scenes framed for 1920x1080; captions redrawn) ===================
let WIDE = false, CAPW = null;
const _cap2 = caption2;
caption2 = (txt, who, op) => { if (WIDE) { CAPW = [txt, who, op]; return ''; } return _cap2(txt, who, op); };
const VIEWW = { home: [.85, 200], power: [.8, 120], ending: [.85, 200], endcard: [.7, 200] };
function captionW(txt, who, op) {
  const lines = txt.split('|'), fs = 50, lh = 60, y0 = 1036 - (lines.length - 1) * lh, w = Math.min(1500, Math.max(...lines.map(l => l.length)) * 25 + 120);
  let g = `<g opacity="${op}"><rect x="${960 - w / 2}" y="${y0 - 58}" width="${w}" height="${lines.length * lh + 26}" rx="24" fill="#000" opacity=".62"/>`;
  if (who) g += `<rect x="${960 - w / 2 + 20}" y="${y0 - 98}" width="${who.length * 24 + 46}" height="50" rx="12" fill="${SPK[who]}" stroke="#fff" stroke-width="4"/>${T(960 - w / 2 + 43, y0 - 61, 36, who, { anchor: 'start', sw: 0, ls: 3 })}`;
  lines.forEach((l, i) => g += T(960, y0 + i * lh, fs, l, { font: 'Baloo2', weight: 800, sw: 7, ls: 0 }));
  return g + '</g>';
}
function widen(svg) {
  return svg.replace(/<rect width="1080" height="1920"/g, '<rect x="-1500" y="-300" width="4100" height="2600"')
    .replace(/<rect x="0" y="0" width="1080" height="1920"/g, '<rect x="-1500" y="-300" width="4100" height="2600"')
    .replace(/<rect x="-20" y="([^"]+)" width="1120"/g, '<rect x="-1500" y="$1" width="4100"');
}
window.drawFrameW = (id, t) => {
  const s = TL.scenes.find(x => x.id === id); ABS = s.start + t; WIDE = true; CAPW = null;
  const [S, Y0] = VIEWW[id] || [.85, 120];
  const body = widen(EP[id](t)), bg = id === 'endcard' ? `<rect x="-1500" y="-300" width="4100" height="2600" fill="#0b0b12"/>` : '';
  const svg = document.getElementById('s');
  svg.setAttribute('width', 1920); svg.setAttribute('height', 1080); svg.setAttribute('viewBox', '0 0 1920 1080');
  svg.innerHTML = defs() + skyDefs + skyDefs2 + depthDefs(id === 'ending' ? '#ffd9b0' : '#d6e9f6') + `<g transform="translate(960,0) scale(${S}) translate(-540,${-Y0})">${bg}${body}</g>` + (CAPW ? captionW(...CAPW) : '');
  WIDE = false;
};
