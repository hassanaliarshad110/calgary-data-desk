// Episode 4 "Ice Cream Wala Thela" — scenes. Each takes local time t; dialogue times come from TL (timeline.js).
// 2.5D: the dhalaan gali (dhalaan()) and the aangan (aangan()) are parallax layer stacks; characters are placed at a depth with at()/proj().
const LS = id => L(id).s, LE = id => L(id).s + L(id).d;
const sdur = id => TL.scenes.find(s => s.id === id).dur;
const SQ = .55 * KS, SAM = .92;
const on = (id, t, a = .1, b = .15) => t > LS(id) - a && t < LE(id) + b;
const lerpCam = (a, b, k) => ({ x: lerp(a.x || 0, b.x || 0, k), y: lerp(a.y || 0, b.y || 0, k), z: lerp(a.z ?? 1, b.z ?? 1, k), px: lerp(a.px ?? 540, b.px ?? 540, k), py: lerp(a.py ?? 960, b.py ?? 960, k) });
const susHand = (x, y, s, ang, side = 1, flip = 1) => [x + flip * s * side * (98 + 158 * Math.sin(ang * Math.PI / 180)), y + s * (-312 + 158 * Math.cos(ang * Math.PI / 180))];
const vig = op => `<rect width="1080" height="1920" fill="url(#vig)" opacity="${op}"/>`;
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
// lane helpers: a character standing on the lane at world x (depth d: 1 = mid street, >1 = back of the street)
const onLane = (d, cam, x, fn, o, sh = {}, dy = 0) => at(d, cam, x, G(x) + dy - (d - 1) * 260, fn, o, sh);
const Q = (cam, x, o, sh = { w: 110 }, d = 1, dy = 0) => onLane(d, cam, x, susu, Object.assign({ s: SQ, t: 0 }, o), sh, dy);
const walkK = (t, f = 26) => Math.sin(t * f) * 26;
function charpaiLane(x) {  // rope cot on the slope (action-plane coords)
  const y = G(x) + 10;
  return castShadow(x + 100, y + 10, 330, 90, .2) + `<g transform="translate(${x},${y}) rotate(${SLA})"><rect x="-150" y="-110" width="22" height="110" fill="#8a5a32" stroke="${C.ink}" stroke-width="5"/><rect x="128" y="-110" width="22" height="110" fill="#8a5a32" stroke="${C.ink}" stroke-width="5"/><rect x="-170" y="-130" width="340" height="34" rx="8" fill="#b07a46" stroke="${C.ink}" stroke-width="6"/>${[...Array(11)].map((_, k) => `<path d="M${-156 + k * 30},-126 l20,26" stroke="#f0e2c0" stroke-width="5"/>`).join('')}</g>`;
}
function newspaper(x, y, s, rot = 0) { return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-70" y="-50" width="140" height="100" fill="#f4f1e6" stroke="${C.ink}" stroke-width="4"/><path d="M0,-50 v100" stroke="#bbb" stroke-width="3"/>${[0, 1, 2, 3].map(k => `<path d="M-60,${-30 + k * 20} h50 M10,${-30 + k * 20} h50" stroke="#888" stroke-width="5"/>`).join('')}</g>`; }
function whistleFx(x, y, k) { if (k <= 0) return ''; return `<g opacity="${k}">${[0, 1, 2].map(i => `<path d="M${x + 20},${y - 10 - i * 22} q${30 + i * 12},-10 ${50 + i * 20},${-30 - i * 6}" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>`).join('')}</g>`; }
const tuk = (x, y, k, txt = 'TUK!') => k > 0 && k < 1 ? burst(x, y, 90, '#fff', txt, 40, 8, 1 - k) : '';
// flying kulfis (rattling off the cart)
function flyKulfi(cam, x0, t, n = 3) { let g = ''; for (let i = 0; i < n; i++) { const p = (t * .9 + i / n) % 1, wx = x0 + 80 + p * 420, wy = G(x0) - 300 - 380 * Math.sin(p * Math.PI) + p * 120; const q = proj(1, cam, wx, wy); g += kulfi(q.x, q.y, .5 * q.s, p * 540 + i * 90, ['mango', 'malai', 'pista'][i % 3]); } return g; }
// ball rolling on the lane
const ballAt = (cam, x, r = 22) => { const p = proj(1, cam, x, G(x) + 24 - r); return shadow(p.x - 8, proj(1, cam, x, G(x) + 26).y, r * 1.4 * p.s, .8, { dx: -10 }) + ball(p.x, p.y, r * p.s, x * 4); };

// ============ 1 HOOK — flash-forward: the thela races down the lane towards Basim; Susuman dives in. Then rewind. ============
function E_hook(t) {
  const nE = LE('n1') + .3, tt = t < nE ? t : Math.max(0, nE - (t - nE) * 2.4), rw = seg(t, nE, nE + .5), P = seg(tt, 0, nE);
  const xc = 1500 + 110 * tt + 8 * tt * tt;
  const cam = camG(lerp(2150, 2350, ease(P)), lerp(.72, .9, ease(P)), 1180, 540);
  const S = dhalaan(tt, cam, { dogZ: false });
  let g = S.back;
  g += onLane(1.06, cam, 2690, basim, { s: SKY, t: tt, move: 'scared', mt: tt, yaw: -.6, expr: 'scared' }, { w: 90 });
  g += ballAt(cam, 2640, 20);
  g += thelaAt(cam, xc, { t: tt, flip: -1, rattle: 1, um: 1, ring: .6 }) + flyKulfi(cam, xc, tt);
  { const p = proj(1, cam, xc, G(xc)); g += speed(p.x - 160, p.y - 260, 1, .6, 5) + dust(p.x - 140, p.y + 20, (tt * 2.4) % 1, 5, 40); }
  // Susuman streaks in from the top right
  const k = eout(seg(tt, .6, nE)), sx = lerp(1300, 780, k), sy = lerp(-200, 1000, k);
  g += speed(sx + 80, sy - 120, -1, .6, 5) + susu({ x: sx, y: sy, s: .62, rot: -32, flip: -1, t: tt, power: .9, cape: 1, crown: 1, shades: 1, armL: 175, armR: 160, legL: -20, legR: 14, mouth: 'shout', brow: .2 });
  g += S.front + vig(t < nE ? .8 : .4);
  if (t < nE) g += hookBig('THELA BHAAGA!', 'BACHCHA KHATRE MEIN!', t, .2, 1.6, 260);
  if (t > nE) g += rewindFx(t - nE, rw, 'THODI DER PEHLE...');
  const fl = seg(t, sdur('hook') - .25, sdur('hook')); if (fl > 0) g += `<rect width="1080" height="1920" fill="#fff" opacity="${fl}"/>`;
  return g + capFor('hook', t);
}

// ============ 2 INTRO — crane down from kites + sun to the lane; Kulfi Chacha pushes his thela up, ringing the bell ============
const PARK = 330;     // where the thela parks (top of the lane, outside Qasim's house)
function E_intro(t) {
  const D = sdur('intro'), cr = ease(seg(t, 0, 4.2)), push = ease(seg(t, 4.2, D));
  const cam = camG(lerp(520, 420, cr), 1 + .14 * push, 1250, 540, lerp(1700, 0, cr));
  const mv = ease(seg(t, .6, 5.6)), xc = lerp(1150, PARK, mv), moving = mv > 0 && mv < 1;
  const S = dhalaan(t, cam, { inner: charpaiLane(-160) });
  let g = S.back;
  // Dada Abu on the charpai with his newspaper, looks up at the bell
  g += onLane(1.06, cam, -150, dadaAbu, { s: SKY, t, move: 'sit', mt: 5, yaw: .5, expr: t > 4.5 ? 'happy' : 'neutral' }, { w: 0 }, -40);
  if (t < 4.6) { const p = proj(1.06, cam, -120, G(-150) - 300); g += newspaper(p.x + 40 * p.s, p.y, .9 * p.s, 8); }
  g += onLane(1.0, cam, xc + 250, kulfiWala, { s: SKY, t, move: moving ? 'walk' : (on('c1', t) ? 'talk' : 'idle'), mt: t, yaw: moving ? -Math.PI / 2 : -.4, expr: 'happy', amp: amp('KULFI CHACHA') }, { w: 120 }, 6);
  // kids burst out of the blue door when they hear the bell (behind the cart at the door, in front of it on the street)
  const out = ease(seg(t, 5.2, 7.2));
  let kidsSvg = '';
  if (out > 0) {
    const d = lerp(1.3, .95, out), bx = lerp(HOMEX, 120, out), qx = lerp(HOMEX - 40, 300, out);
    kidsSvg += at(d, cam, bx, lerp(GB - 165 + SL * HOMEX, G(120) + 13, out), basim, { s: SKY, t, move: out < 1 ? 'run' : 'celebrate', mt: t, yaw: Math.PI / 2, expr: 'happy' }, { w: 90 });
    kidsSvg += at(d, cam, qx, lerp(GB - 165 + SL * HOMEX, G(300) + 13, out), susu, { s: SQ, t, legL: out < 1 ? walkK(t, 30) : 0, legR: out < 1 ? -walkK(t, 30) : 0, armL: 30, armR: out >= 1 ? 160 : 30, mouth: 'grin', look: [12, -6], blink: blink(t) }, { w: 110 });
  }
  const thSvg = thelaAt(cam, xc, { t, flip: -1, ring: on('c1', t, .4, 0) || (t > 1 && t < 2.2) ? 1 : 0, um: 1 });
  g += out < .45 ? kidsSvg + thSvg : thSvg + kidsSvg;
  g += S.front;
  if (t < 4.3) g += hookBig('GARMI KI', 'DOPAHAR!', t, .3, .8, 260);
  if (on('c1', t, .3, .2)) { const p = proj(1, cam, xc + 120, G(xc) - 560); g += bubble(p.x + 40, p.y - 40, 330, 110, 'TRING TRING!', 48, clamp((t - LS('c1') + .3) * 4), 'down'); }
  return g + capFor('intro', t);
}

// ============ 3 KULFI — Dada Abu treats everyone; Qasim wants mango; Officer Gill warns: park it carefully. Brick under the wheel. ============
function E_kulfi(t) {
  const D = sdur('kulfi'), oS = LS('o1'), brickT = LE('o1') - .4;
  let cam = camG(PARK + 40, 1.12, 1260, 540);
  cam = lerpCam(cam, camG(PARK + 260, 1.0, 1260, 540), ease(seg(t, oS - 1.2, oS + .6)));
  cam = lerpCam(cam, camG(PARK + 180, 1.5, 1300, 540), ease(seg(t, brickT - .3, brickT + .5)));
  const S = dhalaan(t, cam, { inner: charpaiLane(-160) + (t > brickT ? brick(PARK + 150, G(PARK + 150) + 34, .7, SLA) : '') });
  let g = S.back;
  const d1 = on('d1', t), q1 = on('q1', t), o1 = on('o1', t), done = t > brickT + .1;
  // back of the street: Dada Abu (stands up from the charpai and waves), Sakina
  g += onLane(1.08, cam, -40, dadaAbu, { s: SKY, t, move: d1 ? 'talk' : (t < LE('d1') + 1.4 ? 'laugh' : 'idle'), mt: t, yaw: .6, expr: d1 ? 'happy' : 'laugh', amp: amp('DADA ABU') }, { w: 120 });
  g += onLane(1.1, cam, 70, sakina, { s: SKY, t, move: d1 ? 'clap' : 'idle', mt: t, yaw: .5, expr: 'happy' }, { w: 100 });
  // the thela, Kulfi Chacha at the handle (thumbs-up once the brick is in), Officer Gill walking up the lane
  g += thelaAt(cam, PARK, { t, flip: -1, um: 1 });
  g += onLane(1.0, cam, PARK + 270, kulfiWala, { s: SKY, t, move: done ? 'thumbsUp' : (o1 ? 'listen' : 'present'), mt: done ? t - brickT : t, yaw: o1 || done ? .4 : -.3, expr: 'happy' }, { w: 120 }, 6);
  const ow = ease(seg(t, oS - 2.2, oS + .2)), ox = lerp(1250, PARK + 540, ow);
  g += onLane(1.04, cam, ox, officer, { s: SKY, t, move: ow > 0 && ow < 1 ? 'walk' : (o1 ? 'point' : 'idle'), mt: o1 ? t - oS : t, yaw: ow < 1 ? -Math.PI / 2 : -.5, expr: o1 ? 'determined' : 'happy', amp: amp('OFFICER GILL') }, { w: 120 });
  // front of the street: Basim (gets the first kulfi) and Qasim (wants mango; starts the potty-wobble at the end)
  const hand = seg(t, LE('d1') - .2, LE('d1') + .3);
  g += onLane(.95, cam, 120, basim, { s: SKY, t, move: d1 ? 'celebrate' : 'idle', mt: t, yaw: .5, expr: 'happy' }, { w: 90 });
  if (hand > 0) { const p = proj(.95, cam, 160, G(120) + 13 - 300); g += kulfi(p.x, p.y, .42 * p.s, 10, 'malai'); }
  const qb = q1 ? Math.abs(Math.sin(t * 11)) * 26 : 0, wob = t > LE('o1') + .3;
  g += Q(cam, 300, { t, armL: q1 ? 150 + 15 * Math.sin(t * 12) : 25, armR: q1 ? 150 - 15 * Math.sin(t * 12) : 25, mouth: q1 ? 'talk' : (wob ? 'wobble' : 'grin'), amp: amp('QASIM'), brow: wob ? 1 : (q1 ? .8 : 0), look: [12, -10], blink: blink(t), legL: wob ? 16 + 6 * Math.sin(t * 16) : 0, legR: wob ? -16 + 6 * Math.sin(t * 16) : 0, tilt: wob ? 6 * Math.sin(t * 16) : 0 }, { w: 110, h: qb }, .92, 21 - qb);
  g += S.front;
  if (t > brickT && t < brickT + .5) { const p = proj(1, cam, PARK + 150, G(PARK + 150)); g += tuk(p.x + 90, p.y - 120, seg(t, brickT, brickT + .5)); }
  if (t > brickT + .2) { const p = proj(1, cam, PARK + 150, G(PARK + 150)); g += `<circle cx="${p.x}" cy="${p.y + 10}" r="${70 + 6 * Math.sin(t * 8)}" fill="none" stroke="${C.gold}" stroke-width="8" stroke-dasharray="20 14" opacity="${seg(t, brickT + .2, brickT + .5)}"/>`; }
  if (q1) g += `<g transform="translate(540,300) scale(${back(seg(t, LS('q1'), LS('q1') + .3))})">${kulfi(-170, 60, .7, -12, 'mango')}${T(60, 30, 84, 'MANGO!', { fill: '#ffb330', shadow: C.red })}</g>`;
  if (t > LE('o1') + .3) g += T(proj(.92, cam, 300, 0).x, 330, 120, '!!', { fill: C.gold, shadow: C.red, op: clamp((t - LE('o1') - .3) * 4) });
  return g + capFor('kulfi', t);
}

// ============ 4 HOME — "Ammi! Suusuu aayi hai!" → "Phir se?!" + counter; Sakina holds his kulfi; zip into the WC ============
const BLUE = { x: 1295, y: 1080 };
function E_home(t) {
  const D = sdur('home'), zip = seg(t, LE('k1') + .1, LE('k1') + .75);
  const cam = { x: lerp(560, 150, ease(seg(t, 0, 2.0))), y: 0, z: 1 + .12 * ease(seg(t, LE('a1'), D)), px: 600 };
  const S = aangan(t, cam, { open: seg(t, LE('k1') + .2, LE('k1') + .35) * (1 - seg(t, LE('k1') + .75, LE('k1') + .9)), noMano: 0, manoSleep: 1 });
  let g = S.back;
  // Qasim: blue door (depth 1.3) → floor near Ammi (1.0) → zip into the WC (1.3)
  const fl = ease(seg(t, .1, 1.0));
  let d = lerp(1.3, 1.0, fl), x = lerp(BLUE.x, 500, fl), y = lerp(BLUE.y, 1235, fl);
  if (zip > 0) { d = lerp(1.0, 1.3, eout(zip)); x = lerp(500, WC.x + WC.w / 2, eout(zip)); y = lerp(1235, 1080, eout(zip)); }
  const walking = t < 1.0, waiting = t >= 1.0 && zip === 0, dd = Math.sin(t * 16), a1 = on('a1', t), k1 = on('k1', t);
  // Sakina follows him in with two kulfis
  const sk2 = ease(seg(t, .8, 2.2)), sd = lerp(1.3, 1.15, sk2), sx = lerp(BLUE.x, 1120, sk2), sy = lerp(BLUE.y, 1215, sk2);
  g += at(sd, cam, sx, sy, sakina, { s: .95, t, move: sk2 > 0 && sk2 < 1 ? 'walk' : (k1 ? 'talk' : 'listen'), mt: t, yaw: sk2 < 1 ? -Math.PI / 2 : -.5, expr: k1 ? 'wink' : (a1 ? 'smug' : 'happy'), amp: amp('SAKINA') }, { w: 110 });
  { const p = proj(sd, cam, sx - 70, sy - 290); g += kulfi(p.x, p.y, .4 * p.s, -10, 'mango') + kulfi(p.x + 26 * p.s, p.y + 6, .4 * p.s, 8, 'malai'); }
  g += at(1, cam, 860, 1250, ammi, { s: SAM, t, phone: 1, look: a1 || t > 1.3 ? [-12, 2] : [0, 12], brow: a1 ? 1 : .3, amp: amp('AMMI'), tilt: zip > 0 ? -10 * seg(zip, 0, .6) : 0, blink: blink(t, 2.6) }, { w: 150 });
  if (zip < 1) g += `<g opacity="${1 - seg(zip, .7, 1)}">` + at(d, cam, x, y, susu, { s: SQ, t, flip: -1, legL: walking || zip > 0 ? walkK(t, 30) : waiting ? 16 + 6 * dd : 0, legR: walking || zip > 0 ? -walkK(t, 30) : waiting ? -16 + 6 * dd : 0, armL: waiting ? 4 : 35, armR: waiting ? 4 : 35, mouth: 'wobble', brow: 1, tilt: waiting ? 6 * dd : 0, look: [10, 0], amp: amp('QASIM'), blink: blink(t) }, { w: 110 }) + '</g>';
  if (walking || (zip > 0 && zip < 1)) { const p = proj(d, cam, x, y); g += speed(p.x + 30, p.y - 150 * p.s, -1, .7, 4); }
  g += S.front;
  g += tally(7, 'AAJ SUUSUU BREAK:', seg(t, LS('a1') + .2, LS('a1') + .5));
  if (zip > .8) { const p = proj(1.3, cam, WC.x + WC.w / 2, 840); g += burst(p.x, p.y - 20, 110, '#fff', 'DHAP!', 48, 6, 1 - seg(t, LE('k1') + 1.1, LE('k1') + 1.4)); }
  return g + capFor('home', t);
}

// ============ 5 DANGER — Basim's ball knocks the brick out; the thela rolls! Dharmender shouts, Chacha runs, Basim chases his ball to the main road ============
const xCart5 = t => t < 1.15 ? PARK : PARK + 17 * (t - 1.15) * (t - 1.15);
function E_danger(t) {
  const D = sdur('danger'), xc = xCart5(t), ballX = t < .5 ? PARK - 120 : t < .95 ? lerp(PARK - 120, PARK + 150, seg(t, .5, .95)) : PARK + 150 + 260 * (t - .95) + 40 * (t - .95) ** 2;
  // camera: medium on the cart → follows it down → wide crane-out showing Basim at the bottom (o2)
  let cam = camG(PARK + 80, 1.15, 1260, 540);
  cam = lerpCam(cam, camG(xc + 120, 1.0, 1250, 470), ease(seg(t, 1.6, 3.4)));
  cam = lerpCam(cam, camG(ballX - 60, 1.1, 1250, 640), ease(seg(t, LS('s1') - .5, LS('s1') + .2)));
  cam = lerpCam(cam, camG(1900, .5, 1160, 540, 120), ease(seg(t, LS('o2') - .3, LS('o2') + 1.2)));
  const bx = t < 1.6 ? PARK - 140 : lerp(PARK - 140, 2760, ease(seg(t, 1.6, LS('s1') + .6)));
  const S = dhalaan(t, cam, { inner: charpaiLane(-160) + (t < .95 ? brick(PARK + 150, G(PARK + 150) + 34, .7, SLA) : '') });
  let g = S.back;
  if (t > .95) { const k = seg(t, .95, 2.2), p = proj(1, cam, PARK + 150 + 260 * k, G(PARK + 150 + 260 * k) + 30 - 120 * Math.sin(k * Math.PI)); g += brick(p.x, p.y, .7 * p.s, k * 540); }
  g += ballAt(cam, ballX, 20);
  // Basim: drops the ball, then chases it down the lane into the main road (bends to pick it up)
  const bRun = t > 1.6 && t < LS('s1') + .6;
  g += onLane(1.04, cam, bx, basim, { s: SKY, t, move: bRun ? 'run' : (t > LS('s1') + .6 ? 'idle' : 'idle'), mt: t, yaw: bRun ? Math.PI / 2 : (t > LS('s1') + .6 ? -.4 : .4), expr: on('s1', t) ? 'surprised' : 'happy', amp: amp('BASIM') }, { w: 90 });
  // Dharmender skateboards down from the left and shouts
  const dk = seg(t, .8, 5.0), dxx = lerp(-700, 1400, dk);
  if (dk > 0 && dk < 1) { const p = proj(1.08, cam, dxx, G(dxx) - 21); g += skateboard(p.x, p.y + 4 * p.s, .8 * p.s, SLA, t * 12) + onLane(1.08, cam, dxx, dharmender, { s: SKY, t, move: on('h1', t) ? 'point' : 'idle', mt: t - LS('h1'), yaw: on('h1', t) ? .9 : Math.PI / 2 * .8, expr: on('h1', t) ? 'surprised' : 'happy', amp: amp('DHARMENDER') }, { w: 100 }, -34); }
  // the cart rolls (rattling more as it speeds up)
  const sp = clamp((xc - PARK) / 600);
  g += thelaAt(cam, xc, { t, flip: -1, rattle: sp, um: 1 + sp, ring: sp * .6 });
  if (sp > .3) { const p = proj(1, cam, xc, G(xc)); g += speed(p.x - 200 * p.s, p.y - 250 * p.s, 1, .5 * sp, 4) + dust(p.x - 120 * p.s, p.y, (t * 2.2) % 1, 5, 40 * p.s); }
  // Kulfi Chacha turns, runs after it
  const cRun = t > LS('c2') - .1;
  const chx = cRun ? PARK + 260 + 260 * (t - LS('c2') + .1) : PARK + 260;
  g += onLane(1.0, cam, Math.min(chx, xc + 200 + 0 * t), kulfiWala, { s: SKY, t, move: cRun ? 'run' : 'present', mt: t, yaw: cRun ? Math.PI / 2 : -.3, expr: cRun ? 'scared' : 'happy', amp: amp('KULFI CHACHA') }, { w: 120 }, 6);
  // Officer Gill: whistle + shout
  const o2 = on('o2', t, .3, .5);
  g += onLane(1.04, cam, PARK + 560, officer, { s: SKY, t, move: o2 ? 'shout' : 'idle', mt: t - LS('o2'), yaw: .5, expr: o2 ? 'shout' : 'surprised', amp: amp('OFFICER GILL') }, { w: 120 });
  if (o2) { const p = proj(1.04, cam, PARK + 600, G(PARK + 560) - 70 - 430); g += whistleFx(p.x, p.y, 1 - seg(t, LE('o2'), LE('o2') + .5)); }
  // traffic on the main road in the wide shot
  if (t > LS('o2') - .5) { const rx = 5200 - 700 * (t - LS('o2') + .5), p = proj(1, cam, rx, G(XR) + 340); g += shadow(p.x - 20, p.y + 4, 180 * p.s, .8, { dx: -30, skew: 35 }) + rickshaw(p.x, p.y, .8 * p.s, -1, t); }
  g += S.front;
  { const wk = Math.sin(Math.PI * seg(t, LS('s1') - .55, LS('s1') + .25)); if (wk > .02) { let w = ''; for (let i = 0; i < 26; i++) { const y = 80 + hs(i + 70) * 1760, x = hs(i + 90) * 1080; w += `<rect x="${x - 420}" y="${y}" width="${600 + 500 * hs(i + 3)}" height="${6 + 10 * hs(i + 5)}" rx="6" fill="#fff" opacity="${(.55 * wk).toFixed(2)}"/>`; } g += `<g filter="url(#dof4)">${w}</g>` + T(540, 300, 110, 'WHOOSH!', { fill: '#fff', shadow: '#000', op: wk }); } }
  if (t > .95 && t < 1.5) { const p = proj(1, cam, PARK + 150, G(PARK + 150)); g += tuk(p.x + 80, p.y - 140, seg(t, .95, 1.5)); }
  if (t > 1.3 && t < LE('c2')) g += hookBig('ARRE!', 'THELA BHAAGA!', t, 1.3, 1.6, 250);
  if (t > LS('o2') + .2) { const p = proj(1.04, cam, 2760, G(2760) - 300); g += `<circle cx="${p.x}" cy="${p.y}" r="${90 + 8 * Math.sin(t * 7)}" fill="none" stroke="${C.red}" stroke-width="10" opacity=".9"/>` + T(Math.min(p.x, 900), p.y - 130, 60, 'BASIM!', { fill: '#fff', shadow: C.red }); }
  return shake(g, Math.abs(t - .95) < .15 ? .5 : 0, t) + capFor('danger', t);
}

// ============ 6 POWER — WC door glows gold (Ammi in the blurred foreground never looks up; Sakina knows), FLUUSH, power bar, SUUU-SUUU-MAN! ============
function E_power(t) {
  const nE = LE('n3'), q = LS('q3'), open = ease(seg(t, q - .45, q - .3)), glow = Math.max(seg(t, .2, nE), open);
  const cam = { x: 270, y: -40, z: lerp(1.0, 1.42, ease(seg(t, 0, q - .4))) + .06 * open, px: 540, py: 900 };
  const S = aangan(t, cam, { open, glow, manoSleep: 1 });
  let g = S.back;
  const dp = proj(1.3, cam, WC.x + WC.w / 2, 840);
  // Sakina beside the WC door, holding the kulfis, giving a thumbs-up when it opens
  g += at(1.22, cam, WC.x - 120, 1120, sakina, { s: .95, t, move: open > 0 ? 'thumbsUp' : 'idle', mt: t - q + .4, yaw: .5, expr: open > 0 ? 'wink' : 'smug' }, { w: 100 });
  if (open > 0) g += shafts(dp.x, dp.y, -Math.PI / 2, 14, 1900, .5 * open, t * 3, '#fff6c8', .45, .05);
  if (open > 0) {
    const st = eout(seg(t, q - .3, q + .5)), hero = ease(seg(t, q, q + .3)), up = ease(seg(t, LE('q3') + .5, sdur('power')));
    const dd = lerp(1.3, .95, st);
    g += at(dd, cam, WC.x + WC.w / 2 - 40 * st, lerp(1080, 1240, st) - up * 1300, susu, { s: lerp(SQ, .78, st), t, power: open, cape: open, crown: seg(t, q, q + .3), shades: seg(t, LE('q3') + .15, LE('q3') + .45), armR: lerp(20, 165, hero), fistR: hero > .4, armL: lerp(20, 40, hero), amp: amp('QASIM'), mouth: 'smirk', blink: blink(t, 3), legL: up > 0 ? -20 : 0, legR: up > 0 ? 14 : 0 }, { w: 120, h: up * 1300, op: 1.2 });
    if (up > 0) { const p = proj(dd, cam, WC.x + WC.w / 2, 1240 - up * 1300); g += speed(p.x, p.y + 120, 0, .7, 3); }
  }
  g += `<g filter="url(#dofNear2)">${at(.78, cam, 590, 1450, ammi, { s: SAM, t, phone: 1, look: [4, 14], brow: .2, blink: blink(t, 3.4), tilt: open > 0 ? 3 * Math.sin(t * 20) * (1 - seg(t, q, q + .6)) : 0 }, { w: 0 })}</g>`;
  g += S.front;
  g = shake(g, (open > 0 && open < 1) ? 1 : (glow > .8 && open === 0 ? .3 : 0), t);
  if (t > .8 && t < 2.4) { const k = back(seg(t, .8, 1.1)); g += `<g transform="translate(540,640) scale(${k})">${burst(0, 0, 230, C.gold, 'FLUUSH!', 104, -8, 1 - seg(t, 2.1, 2.4))}</g>`; }
  const p = ease(seg(t, 1.0, nE));
  if (t > .9 && open < 1) g += `<g opacity="${seg(t, .9, 1.1) * (1 - open)}"><rect x="140" y="150" width="800" height="150" rx="30" fill="#000" opacity=".75"/>${T(540, 212, 62, 'SUUSUU POWER', { fill: C.gold, sw: 0, ls: 6 })}<rect x="190" y="235" width="700" height="44" rx="22" fill="#333" stroke="#fff" stroke-width="5"/><rect x="194" y="239" width="${692 * p}" height="36" rx="18" fill="${p > .99 ? '#ff3b30' : C.gold}"/>${T(540, 272, 40, Math.round(p * 100) + '%', { sw: 6 })}${emblem(180, 257, .7)}</g>`;
  // inset: the thela still rolling towards Basim
  if (t > 1.6 && open === 0) { const k = back(seg(t, 1.6, 1.9)), ic = camG(2300, .35, 680, 820), sub = dhalaan(t, ic, { motes: false, noPump: 1, noBoug: 1 }); const xc = 1950 + 60 * (t - 1.6); g += inset(820, 600, 190 * k, sub.back + onLane(1.04, ic, 2690, basim, { s: SKY, t, move: 'idle', mt: t, yaw: -.4, expr: 'happy' }, { w: 90 }) + thelaAt(ic, xc, { t, flip: -1, rattle: 1, um: 1 }), 'insP'); }
  if (t > q) { const k = back(seg(t, q, q + .3)); g += `<g transform="translate(540,330) scale(${lerp(2.2, 1, clamp(k))}) rotate(-4)" opacity="${clamp(k * 2)}"><rect x="-460" y="40" width="920" height="40" rx="20" fill="${C.red}" transform="skewX(-20)"/>${T(0, 40, 138, 'SUUU-SUUU-MAN!', { shadow: C.red, sw: 12, ls: 2 })}</g>`; }
  return g + capFor('power', t);
}

// ============ 7 RESCUE — Susuman dives down the lane, lands in front of the thela, slow-mo skid, stops it inches from Basim ============
const xCart7 = t => t < 1.5 ? 1500 + 380 * t + 60 * t * t : 2205 - 150 * Math.pow(1 - seg(t, 1.5, 4.0), 2.2) * 1 + 0 * t;
function E_rescue(t) {
  const D = sdur('rescue'), land = 1.5, stopT = 4.0, offT = D - 1.5;
  const xc = t < land ? 1500 + 300 * t + 40 * t * t : lerp(1500 + 300 * land + 40 * land * land, 2200, eout(seg(t, land, stopT)));
  const slow = t > land && t < stopT;
  let cam = camG(lerp(1700, 2280, ease(seg(t, 0, land))), 1.0, 1250, 500);
  cam = lerpCam(cam, camG(2440, 1.15, 1200, 540), ease(seg(t, land - .1, land + .8)));
  cam = lerpCam(cam, camG(2330, .86, 1180, 540), ease(seg(t, stopT + .4, stopT + 1.5)));
  cam = lerpCam(cam, camG(2380, .86, 1180, 540, 700), ease(seg(t, offT + .2, D)));
  const S = dhalaan(t, cam, { inner: '' });
  let g = S.back;
  // Basim at the main road edge with his ball, turns around scared, then celebrates
  const s2 = on('s2', t, .1, .6);
  g += onLane(1.06, cam, 2780, basim, { s: SKY, t, move: s2 ? 'celebrate' : (t > stopT ? 'idle' : 'scared'), mt: t, yaw: -.6, expr: s2 || t > stopT + .6 ? 'happy' : 'scared', amp: amp('BASIM') }, { w: 90 });
  if (!s2) { const p = proj(1.06, cam, 2740, G(2780) - 60 - 120); g += ball(p.x, p.y, 20 * p.s, 0); }
  // Officer Gill + Kulfi Chacha arrive running from uphill
  const arr = ease(seg(t, stopT - .2, stopT + 1.6)), ar = arr > 0 && arr < 1;
  const o3 = on('o3', t, .1, .3);
  g += onLane(1.08, cam, lerp(1500, 1980, arr), officer, { s: SKY, t, move: ar ? 'run' : (o3 ? 'point' : 'idle'), mt: o3 ? t - LS('o3') : t, yaw: ar ? Math.PI / 2 : .5, expr: o3 ? 'surprised' : 'determined', amp: amp('OFFICER GILL'), up: 1 }, { w: 120 });
  g += onLane(1.0, cam, lerp(1350, 1870, arr), kulfiWala, { s: SKY, t, move: ar ? 'run' : 'idle', mt: t, yaw: ar ? Math.PI / 2 : .4, expr: arr >= 1 ? 'happy' : 'scared' }, { w: 120 }, 6);
  // the thela
  const sp = t < land ? 1 : 1 - seg(t, land, stopT);
  g += thelaAt(cam, xc, { t, flip: -1, rattle: sp, um: 1 + sp, ring: t > stopT && t < stopT + .6 ? 1 : 0 });
  if (sp > .2) { const p = proj(1, cam, xc, G(xc)); g += speed(p.x - 200 * p.s, p.y - 250 * p.s, 1, .5 * sp, 4); }
  // Susuman: dive (screen-space from the rooftops) → lands at the cart's handle → skids back → winks → launches
  let sx, sy, sd = 1, rot = 0, arms = [175, 160], pose = 'dive';
  const hx = xc + 290;
  if (t < land) { const k = eout(seg(t, 0, land)); const a = proj(1.3, cam, 1500, 300), b = proj(1, cam, hx, G(hx)); sx = lerp(a.x, b.x, k); sy = lerp(a.y - 400, b.y, k); rot = lerp(-40, 0, k); }
  else { const p = proj(1, cam, hx, G(hx)); sx = p.x; sy = p.y; arms = slow ? [95 + 4 * Math.sin(t * 30), 60] : (t < offT ? [40, t > LS('o3') - .3 ? 160 : 40] : [175, 175]); pose = 'stand'; }
  if (t > offT) { const k = seg(t, offT, offT + .7); sy -= 1800 * k * k; }
  const sc = t < land ? .62 * lerp(.8, 1, seg(t, 0, land)) : .62 * proj(1, cam, hx, G(hx)).s;
  if (t >= land) g += shadow(sx - 20, sy + 6, 120 * sc / .62 * (t > offT ? clamp(1 - seg(t, offT, offT + .5)) : 1), .9, { dx: -40, skew: 35 });
  g += susu({ x: sx, y: sy, s: sc, t, rot, power: .85, cape: 1, crown: 1, shades: 1, armL: arms[0], armR: arms[1], fistL: slow, legL: slow ? -18 : (t < land ? -25 : 0), legR: slow ? 22 : (t < land ? 10 : 0), mouth: slow ? 'frown' : (t > stopT ? 'grin' : 'shout'), wink: t > offT - .8 && t < offT - .2 ? 1 : 0, blink: blink(t, 3), flip: 1, tilt: slow ? -8 : 0 });
  if (t < land) g += speed(sx - 60, sy - 300 * sc, 1, .8, 6);
  // skid: dust + sparks at his sneakers during the slow-mo
  if (slow) { for (let i = 0; i < 6; i++) { const a = t * 25 + i * 1.3; g += `<path d="M${sx + 40},${sy} l${50 + 30 * Math.cos(a)},${-20 - 30 * Math.abs(Math.sin(a))}" stroke="#ffd34a" stroke-width="5" stroke-linecap="round"/>`; } g += dust(sx + 60, sy + 10, (t * 1.4) % 1, 6, 60) + dust(sx + 120, sy + 14, (t * 1.4 + .5) % 1, 5, 50); }
  if (t > offT) g += `<path d="M${sx},${proj(1, cam, hx, G(hx)).y} L${sx},${sy - 200}" stroke="${C.gold}" stroke-width="44" opacity="${.5 * (1 - seg(t, offT + .4, D))}" stroke-linecap="round"/>`;
  g += S.front;
  if (slow) g += vig(.75) + T(540, 300, 92, 'DHEERE... DHEERE...', { fill: C.gold, shadow: '#000', op: clamp((t - land - .2) * 3) * (1 - seg(t, stopT - .3, stopT)) });
  if (t > stopT && t < stopT + 1.3) g += `<g transform="translate(540,420) scale(${back(seg(t, stopT, stopT + .3))})">${burst(0, 0, 240, C.gold, 'RUK GAYA!', 96, -6, 1 - seg(t, stopT + 1.0, stopT + 1.3))}</g>`;
  g = shake(g, Math.abs(t - land) < .25 ? .8 : (Math.abs(t - stopT) < .2 ? .6 : 0), t);
  return g + capFor('rescue', t);
}

// ============ 8 LESSON — at the chowk: Chacha thanks, kulfis for all; Officer Gill's lesson; Qasim gets his mango kulfi from Baaji ============
const CART8 = 2205;
function E_lesson(t) {
  const D = sdur('lesson'), o4 = on('o4', t), c3 = on('c3', t), q5 = on('q5', t, .1, .4);
  let cam = camG(2330, 1.12, 1270, 540);
  cam = lerpCam(cam, camG(2620, 1.2, 1290, 560), ease(seg(t, LS('o4') - .4, LS('o4') + .8)));
  cam = lerpCam(cam, camG(2280, 1.05, 1270, 540), ease(seg(t, LS('q5') - 1.4, LS('q5') - .2)));
  cam = lerpCam(cam, camG(2400, .9, 1250, 540), ease(seg(t, LE('q5'), D)));
  const S = dhalaan(t, cam, { inner: brick(CART8 + 150, G(CART8 + 150) + 34, .7, SLA) });
  let g = S.back;
  // Dharmender with his skateboard, licking a pista kulfi (back of the street, uphill of the cart)
  g += onLane(1.12, cam, 1880, dharmender, { s: SKY, t, move: t > LE('c3') ? 'laugh' : 'idle', mt: t, yaw: .4, expr: 'happy' }, { w: 100 });
  { const p = proj(1.12, cam, 1860, G(1880) - 31 - 330); g += kulfi(p.x, p.y, .42 * p.s, 10, 'pista'); }
  g += thelaAt(cam, CART8, { t, flip: -1, um: 1, ring: c3 && t < LS('c3') + .6 ? 1 : 0 });
  g += onLane(1.0, cam, CART8 + 260, kulfiWala, { s: SKY, t, move: c3 ? 'talk' : (t < LE('c3') + 1.5 ? 'present' : 'laugh'), mt: t, yaw: .3, expr: 'happy', amp: amp('KULFI CHACHA') }, { w: 120 }, 6);
  // Officer kneels beside Basim for the lesson
  g += onLane(1.06, cam, 2560, officer, { s: SKY, t, move: o4 ? 'talk' : 'idle', mt: t, yaw: .5, expr: o4 ? 'happy' : 'happy', amp: amp('OFFICER GILL') }, { w: 120 });
  g += onLane(1.04, cam, 2760, basim, { s: SKY, t, move: o4 ? 'listen' : (t > LE('o4') ? 'celebrate' : 'idle'), mt: t, yaw: -.5, expr: 'happy' }, { w: 90 });
  { const p = proj(1.04, cam, 2730, G(2760) - 60 - 290); g += kulfi(p.x, p.y, .42 * p.s, -14, 'malai', seg(t, 2, 4) * .5); }
  // Qasim (normal hoodie again) + Sakina come down the lane
  const arr = ease(seg(t, LS('q5') - 2.2, LS('q5') - .3)), aw = arr > 0 && arr < 1;
  const qx = lerp(1700, 2060, arr), skx = lerp(1560, 1900, arr);
  if (arr > 0) {
    const give = seg(t, LS('q5') - .3, LS('q5') + .3);
    g += onLane(1.1, cam, skx, sakina, { s: SKY, t, move: aw ? 'walk' : (t > LE('q5') - .3 ? 'thumbsUp' : 'idle'), mt: t > LE('q5') - .3 ? t - LE('q5') + .3 : t, yaw: aw ? Math.PI / 2 : .5, expr: t > LE('q5') - .3 ? 'wink' : 'happy' }, { w: 100 });
    const qb = q5 ? Math.abs(Math.sin(t * 9)) * 22 : 0;
    g += Q(cam, qx, { t, legL: aw ? walkK(t, 26) : 0, legR: aw ? -walkK(t, 26) : 0, armL: 25, armR: give > .5 ? 150 : 30, mouth: q5 ? 'talk' : 'grin', amp: amp('QASIM'), look: [10, -8], blink: blink(t, 2.6) }, { w: 110, h: qb }, 1, -qb);
    const qh = susHand(qx, G(qx) - qb, SQ, 150), sp0 = proj(1.1, cam, skx + 50, G(skx) - 26 - 290), qp = proj(1, cam, qh[0], qh[1] - 60);
    g += kulfi(lerp(sp0.x, qp.x, ease(give)), lerp(sp0.y, qp.y, ease(give)) - 60 * Math.sin(give * Math.PI), .45 * qp.s, -8, 'mango', seg(t, LE('q5') + .2, D) * .4);
  }
  g += S.front;
  if (c3) g += hookBig('DO DO', 'KULFIYAAN!', t, LS('c3') + .2, LS('c3') + .6, 250);
  if (o4) g += hookBig('SADAK PAR', 'DHYAN SE!', t, LS('o4') + .2, LS('o4') + .6, 250);
  if (t > LE('q5') - .2) for (let i = 0; i < 4; i++) { const p = ((t - LE('q5')) * .7 + i / 4) % 1; g += heart(320 + i * 140, 980 - p * 300, .6, 1 - p); }
  if (c3) g += confetti(t - LS('c3'), 40);
  return g + capFor('lesson', t);
}

// ============ 9 TV — evening; the family TV: Daniel + Amara report the "mystery hero"; Dada Abu is impressed; Qasim and Sakina share a wink ============
const TVP = { x: 330, y: 1250, w: 330, h: 230 };   // TV on a stool, action-plane coords (aangan floor)
function tvNews(t, w, h) {   // TV picture in a w x h box (origin top-left)
  let g = `<rect width="${w}" height="${h}" fill="#123a6b"/><rect y="${h * .55}" width="${w}" height="${h * .45}" fill="#0b2a52"/>`;
  for (let i = 0; i < 6; i++) g += `<circle cx="${w * (.1 + i * .17)}" cy="${h * .25}" r="${h * .05}" fill="#fff" opacity=".12"/>`;
  // inset footage: golden streak stopping a tiny blue cart
  g += `<rect x="${w * .58}" y="${h * .1}" width="${w * .36}" height="${h * .36}" fill="#ffe3b3" stroke="#fff" stroke-width="3"/><path d="M${w * .6},${h * .42} L${w * .92},${h * .3}" stroke="#c6ad84" stroke-width="5"/><rect x="${w * .64}" y="${h * .27}" width="${w * .1}" height="${h * .08}" fill="#2f7fd6"/><circle cx="${w * .8 + 4 * Math.sin(t * 9)}" cy="${h * .28}" r="${h * .05}" fill="${C.gold}" filter="url(#glow)"/>`;
  g += daniel({ x: w * .2, y: h * .99, s: .24, t, move: on('v1', t) ? 'present' : 'idle', mt: t, yaw: .2, expr: 'happy', amp: amp('DANIEL') }) + amara({ x: w * .43, y: h * .99, s: .24, t, move: on('v2', t) ? 'talk' : 'listen', mt: t, yaw: -.2, expr: on('v2', t) ? 'thinking' : 'happy', amp: amp('AMARA') });
  g += `<rect y="${h * .78}" width="${w}" height="${h * .12}" fill="#c8102e"/>${T(w * .03, h * .87, h * .085, 'BREAKING NEWS', { anchor: 'start', sw: 0, ls: 1 })}`;
  const msg = 'MYSTERY HERO NE BHAAGTA THELA ROKA!  ·  KAUN HAI YE HERO?  ·  ';
  g += `<rect y="${h * .9}" width="${w}" height="${h * .1}" fill="#fff"/><clipPath id="tk"><rect y="${h * .9}" width="${w}" height="${h * .1}"/></clipPath><g clip-path="url(#tk)">${T(w - ((t * 60) % (w * 2.6)), h * .975, h * .07, msg + msg, { anchor: 'start', fill: '#111', sw: 0, ls: 1, font: 'Baloo2', weight: 800 })}</g>`;
  return g;
}
function tvSet(t) {   // in aangan floor coords
  const { x, y, w, h } = TVP;
  return castShadow(x, y + 8, 220, 110, .25) + `<rect x="${x - 100}" y="${y - 120}" width="200" height="120" fill="#8a5a32" stroke="${C.ink}" stroke-width="5"/><rect x="${x - w / 2 - 14}" y="${y - 134 - h - 14}" width="${w + 28}" height="${h + 28}" rx="16" fill="#222" stroke="${C.ink}" stroke-width="6"/>
    <g transform="translate(${x - w / 2},${y - 134 - h})">${tvNews(t, w, h)}</g><rect x="${x - w / 2}" y="${y - 134 - h}" width="${w}" height="${h}" fill="url(#poolW)" opacity=".18"/>`;
}
function E_tv(t) {
  const D = sdur('tv'), pull = ease(seg(t, LE('v1') - .6, LS('d2') - .2));
  const sc = { x: TVP.x, y: TVP.y - 134 - TVP.h / 2 };
  const z0 = 3.0;
  let cam = { x: sc.x - 540, y: sc.y - 760, z: z0, px: 540, py: 760 };
  cam = lerpCam(cam, { x: 200, y: 0, z: 1.0, px: 600, py: 960 }, pull);
  cam = lerpCam(cam, { x: 250, y: 30, z: 1.12, px: 700, py: 1000 }, ease(seg(t, LS('d2'), D)));
  const S = aangan(t, cam, { eve: 1, noMano: 0, manoSleep: 1 });
  let g = S.back;
  g += layer(1, cam, tvSet(t) + lightPool(TVP.x, TVP.y + 20, 360, 90, .55, 'poolW'), { f: '' });
  const d2 = on('d2', t);
  // family: Dada Abu on the charpai, Sakina + Qasim (with his kulfi) in front of it
  g += at(1.02, cam, 1150, 1150, dadaAbu, { s: .95, t, move: 'sit', mt: 5, k: 1, yaw: -.5, expr: d2 ? 'happy' : 'surprised', amp: amp('DADA ABU') }, { w: 0 });
  const wk = t > LE('d2') - .3;
  g += at(1.06, cam, 820, 1225, sakina, { s: .95, t, move: wk ? 'thumbsUp' : 'idle', mt: t - LE('d2') + .3, yaw: wk ? -.5 : -.6, expr: wk ? 'wink' : 'smug' }, { w: 100 });
  g += at(1, cam, 640, 1250, susu, { s: SQ, t, flip: -1, armL: 25, armR: 150, mouth: wk ? 'smirk' : 'frown', wink: t > LE('d2') && t < LE('d2') + .5 ? 1 : 0, look: wk ? [14, -4] : [-14, -6], blink: blink(t, 2.8) }, { w: 110 });
  { const h = susHand(640, 1250, SQ, 150, 1, -1), p = proj(1, cam, h[0], h[1] - 60); g += kulfi(p.x, p.y, .45 * p.s, 8, 'mango', .6); }
  g += S.front;
  if (t < LE('v2') + .2 && pull < .5) g += hookBig('MYSTERY', 'HERO KAUN?', t, LS('v1') + 1.0, LS('v1') + 1.4, 250);
  if (wk) g += T(540, 330, 90, 'SHHH... RAAZ!', { fill: C.gold, shadow: '#000', op: clamp((t - LE('d2') + .3) * 3) });
  return g + capFor('tv', t);
}

// ============ 10 ENDING — "Ammiii! Suusuu aayi hai!" → "Itni kulfi kyun khaayi?!" → Sakina covers → "Kuch nahi Ammi!" + wink, zip ============
function E_ending(t) {
  const D = sdur('ending'), zip = seg(t, LE('q6') + .25, LE('q6') + .9), cz = ease(seg(t, LS('a2') + .4, LS('a2') + 1.2)) * (1 - ease(seg(t, LE('q6') + .1, LE('q6') + .6)));
  let x = 640, y = 1250, d = 1;
  const jump = ease(seg(t, .2, .8)); x = lerp(640, 560, jump);
  if (zip > 0) { d = lerp(1.0, 1.3, eout(zip)); x = lerp(560, WC.x + WC.w / 2, eout(zip)); y = lerp(1250, 1080, eout(zip)); }
  let cam = { x: 200, y: 0, z: 1, px: 600 };
  cam = lerpCam(cam, { x: 660 - 540, y: 1250 - 600 * SQ - 760, z: 1.45, px: 540, py: 760 }, cz);
  const S = aangan(t, cam, { eve: 1, open: seg(t, LE('q6') + .3, LE('q6') + .45) * (1 - seg(t, LE('q6') + .85, LE('q6') + 1.0)), manoWide: on('a2', t, 0, .5) ? 1 : 0, manoMeow: on('q6', t) ? .6 : 0 });
  let g = S.back + layer(1, cam, tvSet(t + 20) + lightPool(TVP.x, TVP.y + 20, 360, 90, .5, 'poolW'), { f: '' });
  const q4 = on('q4', t, .1, .3), a2 = on('a2', t), k2 = on('k2', t), q6 = on('q6', t, .1, .3), dd = Math.sin(t * 16);
  g += at(1.02, cam, 1250, 1150, dadaAbu, { s: .95, t, move: 'sit', mt: 5, k: 1, yaw: -.5, expr: q4 ? 'laugh' : 'happy' }, { w: 0 });
  g += at(1.06, cam, 760, 1225, sakina, { s: .95, t, move: k2 ? 'talk' : 'idle', mt: t, yaw: .3, expr: t > LE('k2') - .3 ? 'wink' : (a2 ? 'surprised' : 'smug'), amp: amp('SAKINA') }, { w: 100 });
  g += at(1.0, cam, 960, 1255, ammi, { s: SAM, t, phone: a2 ? 0 : 1, look: a2 ? [-14, -6] : [-12, 2], brow: a2 ? 1 : .4, amp: amp('AMMI'), blink: blink(t, 2.6), tilt: a2 ? -6 : 0 }, { w: 140 });
  const waiting = zip === 0;
  if (zip < 1) g += `<g opacity="${1 - seg(zip, .7, 1)}">` + at(d, cam, x, y, susu, { s: SQ, t, flip: -1, legL: zip > 0 ? walkK(t, 30) : (q4 || a2 ? 16 + 6 * dd : 0), legR: zip > 0 ? -walkK(t, 30) : (q4 || a2 ? -16 + 6 * dd : 0), armL: q6 ? 20 : 4, armR: q6 ? 150 : 4, mouth: q6 ? 'grin' : (q4 ? 'wobble' : 'o'), amp: amp('QASIM'), brow: q4 ? 1 : (a2 ? .7 : 0), wink: t > LE('q6') - .4 && t < LE('q6') + .2 ? 1 : 0, tilt: q4 ? 6 * dd : 0, look: a2 ? [6, -14] : [-10, 0], blink: blink(t) }, { w: 110 }) + '</g>';
  if (zip > 0 && zip < 1) { const p = proj(d, cam, x, y); g += speed(p.x + 30, p.y - 150 * p.s, -1, .7, 4); }
  if (cz > .6 && a2) g += `<g transform="translate(250,560) scale(${back(seg(t, LS('a2') + .6, LS('a2') + .9))})">${kulfi(-50, 60, .6, -20, 'mango', 1)}${kulfi(30, 70, .6, 14, 'malai', 1)}${T(0, -150, 76, '2 KULFI?!', { fill: '#fff', shadow: C.red })}</g>`;
  g += S.front;
  g += tally(8, 'AAJ SUUSUU BREAK:', seg(t, LE('q6') + .6, LE('q6') + .9));
  return g + capFor('ending', t);
}

// ============ 11 END CARD — layered: brush sky (far) / kites (mid) / Susuman with a kulfi + the thela (hero plane) / sparkles (near) ============
function E_endcard(t) {
  const cam = { x: 30 * Math.sin(t * .4), y: 0, z: 1 + .06 * t / sdur('endcard') };
  let g = layer(4, cam, brushBg(t + 90), { f: '' });
  g += kiteField(t, cam, 2.2, 6, 180, 900, .6, 41, -100, 1150);
  g += layer(1.3, cam, castShadow(830, 1230, 260, 120, .3) + thela({ x: 830, y: 1230, s: .5, t, flip: -1, um: 1, ring: Math.max(0, Math.sin(t * 2)) }), { f: '' });
  g += layer(1, cam, shadow(470, 1255, 200, .8) + lightPool(470, 1250, 380, 70, .8) + susu({ x: 470, y: 1250, s: .85, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 40, armR: 150, mouth: 'grin', blink: blink(t, 2.6) })
    + (() => { const h = susHand(470, 1250, .85, 150); return kulfi(h[0], h[1] - 40, .7, 6, 'mango'); })(), { f: '' });
  let sp = ''; for (let i = 0; i < 9; i++) { const x = ((i * 157 + t * 60) % 1300) - 110, y = 200 + (i * 211) % 1500; sp += `<path d="M${x},${y - 40} L${x + 10},${y} L${x},${y + 40} L${x - 10},${y}Z M${x - 40},${y} L${x},${y - 10} L${x + 40},${y} L${x},${y + 10}Z" fill="${C.gold}" opacity=".8"/>`; }
  g += layer(.6, cam, sp);
  const n = L('n4'), half = LS('n4') + n.d * .58;
  if (t < half + .2) { g += `<g transform="translate(540,290) scale(${back(seg(t, .2, .5))})">${T(0, 0, 100, 'SADAK PAR', { shadow: '#000' })}</g><g transform="translate(540,410) scale(${back(seg(t, .5, .8))}) rotate(-3)">${T(0, 0, 112, 'DHYAN SE!', { fill: C.gold, shadow: C.red })}</g>`; }
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

const EP = { hook: E_hook, intro: E_intro, kulfi: E_kulfi, home: E_home, danger: E_danger, power: E_power, rescue: E_rescue, lesson: E_lesson, tv: E_tv, ending: E_ending, endcard: E_endcard };
const HAZE = id => (id === 'tv' || id === 'ending') ? '#ffd9b0' : '#d6e9f6';
window.drawFrame = (id, t) => {
  const s = TL.scenes.find(x => x.id === id); ABS = s.start + t;
  document.getElementById('s').innerHTML = defs() + skyDefs + skyDefs2 + depthDefs(HAZE(id)) + EP[id](t);
};
window.drawCast = () => {
  let g = `<rect width="1080" height="1920" fill="#f3ead9"/>` + T(540, 100, 76, 'SUSUMAN EP 4 — NEW CAST + PROPS', { fill: C.ink, sw: 0 });
  g += T(280, 190, 44, 'KULFI CHACHA', { fill: '#2f7fd6', sw: 0 }) + sk({ key: 'kulfiWala', x: 280, y: 880, s: 1.05, t: 0, move: 'present', mt: 1, yaw: .3, expr: 'happy' });
  g += T(770, 190, 44, 'KULFI THELA', { fill: '#2f7fd6', sw: 0 }) + thela({ x: 790, y: 900, s: .72, t: 0, flip: 1, um: 0 });
  g += T(540, 990, 40, 'KULFI: MANGO · MALAI · PISTA', { fill: C.ink, sw: 0 }) + kulfi(380, 1260, 1.1, -8, 'mango') + kulfi(540, 1260, 1.1, 0, 'malai') + kulfi(700, 1260, 1.1, 8, 'pista');
  g += T(300, 1390, 40, 'BRICK + BALL', { fill: C.ink, sw: 0 }) + brick(240, 1520, 1.2) + ball(380, 1490, 34) + T(780, 1390, 40, "DHARMENDER'S BOARD", { fill: C.ink, sw: 0 }) + skateboard(780, 1520, 1.3);
  g += T(540, 1640, 36, 'Ensemble this episode: Sakina, Dada Abu, Basim, Officer Gill, Dharmender, Daniel + Amara', { fill: '#555', sw: 0, font: 'Baloo2', weight: 800 });
  document.getElementById('s').innerHTML = defs() + skyDefs + skyDefs2 + depthDefs() + g;
};

// =================== 16:9 version (same scenes framed for 1920x1080; captions redrawn) ===================
let WIDE = false, CAPW = null;
const _cap2 = caption2;
caption2 = (txt, who, op) => { if (WIDE) { CAPW = [txt, who, op]; return ''; } return _cap2(txt, who, op); };
const VIEWW = { home: [.85, 200], power: [.8, 120], tv: [.85, 200], ending: [.85, 200], endcard: [.7, 200] };
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
  svg.innerHTML = defs() + skyDefs + skyDefs2 + depthDefs(HAZE(id)) + `<g transform="translate(960,0) scale(${S}) translate(-540,${-Y0})">${bg}${body}</g>` + (CAPW ? captionW(...CAPW) : '');
  WIDE = false;
};
