// Episode 3 "Barish Mein Pilla" — scenes. Each takes local time t; dialogue times come from TL (timeline.js).
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

// ---------- gali helpers (world x on the depth-1 plane; GY street line; everything later shifted up by UP) ----------
const UP = 220, LEDGE = GY + 92, WTOP = GY + 120;
const sx = (cam, wx) => wx - cam.x;
const SQq = SQ;   // Qasim scale in the gali
function ledgeRow(cam) {  // raised dry platform (otla) along the houses, drawn over the street, under the water
  return `<rect x="-1300" y="${GY - 4}" width="3700" height="${WTOP - GY + 14}" fill="#c9b08a" stroke="${C.ink}" stroke-width="5"/><rect x="-1300" y="${GY - 4}" width="3700" height="16" fill="#e2cfa8"/>` + [...Array(22)].map((_, i) => { const x = ((i * 180 - cam.x) % 3960 + 3960) % 3960 - 1300; return `<path d="M${x},${GY + 12} v${WTOP - GY}" stroke="#a88f68" stroke-width="4"/>`; }).join('');
}
function floodS(t, cam, o = {}) {   // water below the ledge
  const top = WTOP;
  let g = `<rect x="-1300" y="${top}" width="3700" height="1400" fill="url(#waterG)"/>`;
  for (let r = 0; r < 14; r++) { const y = top + 14 + r * r * 5, sp = 150 + r * 28, off = ((t * sp + r * 97 + cam.x) % 220 + 220) % 220; g += `<path d="${[...Array(18)].map((_, k) => `M${-1320 + k * 220 + off},${y.toFixed(1)} q40,-${(6 + r * .6).toFixed(1)} 80,0`).join(' ')}" stroke="#d8e7f2" stroke-width="${(2 + r * .35).toFixed(1)}" fill="none" opacity="${(.55 - r * .02).toFixed(2)}"/>`; }
  g += `<path d="M-1300,${top} H2400" stroke="#e8f1fa" stroke-width="6" opacity=".8"/>`;
  if (o.drainWX !== undefined) { const x = sx(cam, o.drainWX); g += `<g transform="translate(${x},${top + 150})"><ellipse rx="170" ry="52" fill="#22313f"/><path d="M-120,-10 h240 M-130,10 h260 M-110,28 h220" stroke="#11181f" stroke-width="10"/>` + [0, 1, 2].map(k => `<g transform="scale(1,.32) rotate(${(t * 260 + k * 70) % 360})"><ellipse rx="${70 + k * 50}" ry="${70 + k * 50}" fill="none" stroke="#e8f1fa" stroke-width="7" stroke-dasharray="40 30" opacity=".7"/></g>`).join('') + T(0, -80, 40, 'NAALA', { fill: '#fff', sw: 6 }) + `</g>`; }
  return g + splashes(t, 36, top + 30, top + 700, .7);
}
// the rainy gali: back (set + ledge + water) and the near rain; Z() = camera zoom group for the depth-1 plane
function galiR(t, cam, o = {}) {
  const z = cam.z || 1, px = cam.px ?? 540, py = cam.py ?? 900;
  const Z = s => `<g transform="translate(${px},${py}) scale(${z}) translate(${-px},${-py})">${s}</g>`;
  const Zd = (s, d) => { const zz = 1 + (z - 1) / d; return `<g transform="translate(${px},${py}) scale(${zz}) translate(${-px},${-py})">${s}</g>`; };
  const rk = o.rainK ?? 1;
  const back = Z(gali(cam.x, t, o) + `<rect x="-2400" y="-1600" width="6000" height="${GY + 1600}" fill="#3e4a60" opacity="${(.36 * rk + .05).toFixed(2)}"/>` + (rk > 0 ? `<g opacity="${rk}">${stormClouds(t, cam.x)}</g>` : '') + (o.rainbow ? rainbow(o.rainbow) : '') + ledgeRow(cam) + floodS(t, cam, o))
    + Zd(rain(t, 130, .3 * rk, 50, 2, 11, -300, 2200), 3);
  const front = Zd(rain(t, 66, .5 * rk, 120, 5, 23, -300, 2300, 2600), .6) + `<rect width="1080" height="1920" fill="#22324a" opacity="${(.1 * rk).toFixed(2)}"/>`;
  return { back, front, Z };
}
function rainbow(k) { return `<g opacity="${(k * .85).toFixed(2)}">` + ['#e5463b', '#ff9f1c', '#ffd34a', '#3cb371', '#3b8de5', '#7b4fd6'].map((c, i) => `<path d="M-100,620 A640,560 0 0 1 1180,620" stroke="${c}" stroke-width="26" fill="none" transform="translate(0,${i * 26})"/>`).join('') + `</g>`; }
const upS = s => `<g transform="translate(0,${-UP})">${s}</g>`;
const qas = (x, y, o) => susu(Object.assign({ x, y, s: SQq, t: 0, blink: 0 }, o));
const crateTop = (x, y, s) => [x, y - 80 * s];
// crate + puppy floating at screen (x, y)
function floatPup(t, x, y, s = .9, o = {}) {
  const bob = 8 * Math.sin(t * 3.1), rot = 6 * Math.sin(t * 2.3) + (o.tip || 0);
  return `<g transform="translate(0,${bob}) rotate(${rot} ${x} ${y})">` + (o.noPup ? '' : pilla({ x: x + 10, y: y - 78 * s, s: .42 * s / .9, t, shiver: 1, flip: o.flip ?? 1, bark: o.bark || 0 })) + crate(x, y, s, 0) + `</g><ellipse cx="${x}" cy="${y + 14 + bob}" rx="${140 * s}" ry="${16 * s}" fill="none" stroke="#e8f1fa" stroke-width="5" opacity=".7"/>`;
}

// 1 HOOK — flash-forward: the crate spins at the naala, lightning, Susuman dives in; then rewind
function E_hook(t) {
  const nE = LE('n1') + .3, tt = t < nE ? t : Math.max(0, nE - (t - nE) * 2.4), rw = seg(t, nE, nE + .5), P = seg(tt, 0, nE);
  const cam = { x: 1650 + 60 * P, z: 1.3 + .2 * ease(P), py: 1100 };
  const S = galiR(tt, cam, { drainWX: 2250 });
  const cx = sx(cam, 2050 + 90 * P);
  let g = upS(S.back + S.Z(floatPup(tt, cx, WTOP + 110, 1.0, { tip: 10 * Math.sin(tt * 4), bark: .6 * Math.max(0, Math.sin(tt * 6)) })));
  const k = eout(P), hx = lerp(-180, 330, k), hy = lerp(1900, 1350, k);
  g += speed(hx - 40, hy - 260, 1, .55) + susu({ x: hx, y: hy, s: .95, rot: 32, t: tt, power: .9, cape: 1, crown: 1, shades: 1, armL: 175, armR: 160, legL: -20, legR: 14, mouth: 'shout', brow: .2 });
  g += S.front + lightning(tt, 1.1) + vig(t < nE ? .8 : .4);
  if (t < nE) g += hookBig('PILLA', 'KHATRE MEIN!', t, .2, 1.6, 270);
  if (t > nE) g += rewindFx(t - nE, rw, 'THODI DER PEHLE...');
  const fl = seg(t, sdur('hook') - .25, sdur('hook')); if (fl > 0) g += `<rect width="1080" height="1920" fill="#fff" opacity="${fl}"/>`;
  return g + capFor('hook', t);
}

// 2 INTRO — rainy gali, paper boats race by the ledge; Basim brags about his boat
function E_intro(t) {
  const D = sdur('intro'), P = ease(seg(t, 0, D));
  const cam = { x: lerp(300, 560, P), z: lerp(1.35, 1.5, P), py: 900 };
  const S = galiR(t, cam);
  const s1 = on('s1', t);
  let ch = '';
  // boats drift right in the water (world x)
  [[0, '#fff', 0], [1, '#ffd34a', 160], [2, '#8fd0f4', 330]].forEach(([i, c, off]) => { const wx = 300 + off + t * (95 + i * 12), x = sx(cam, wx); ch += kashti(x, WTOP + 28 + i * 34 + 6 * Math.sin(t * 3 + i), .7 + i * .1, 6 * Math.sin(t * 2.5 + i), c); });
  ch += shadow(sx(cam, 880) - 20, LEDGE + 2, 110, .6) + qas(sx(cam, 880), LEDGE, { t, look: [14, 10], armR: 50, armL: 20, mouth: s1 ? 'o' : 'grin', blink: blink(t), brow: 0 });
  ch += shadow(sx(cam, 1040) - 20, LEDGE + 2, 100, .6) + basim({ x: sx(cam, 1040), y: LEDGE, t, move: s1 ? 'point' : 'clap', mt: s1 ? t - LS('s1') : t, yaw: -.5, expr: 'happy', amp: amp('BASIM') });
  let g = upS(S.back + S.Z(ch)) + S.front;
  if (t < LE('n2') + .2) g += hookBig('BARISH MEIN', 'PILLA!', t, .3, .7, 300);
  return g + capFor('intro', t);
}

// 3 WARN — camera cranes up to Dadi on her balcony, umbrella of rain all round
function E_warn(t) {
  const D = sdur('warn'), P = ease(seg(t, 0, 1.4));
  const cam = { x: lerp(560, 210, P), z: lerp(1.2, 1.45, P), py: lerp(700, 300, P) };
  const S = galiR(t, cam);
  const d1 = on('d1', t), bx = sx(cam, 750);
  let ch = dadi({ x: bx, y: 790, s: .78, t, move: d1 ? 'talk' : 'listen', mt: t, yaw: .2, expr: d1 ? 'angry' : 'neutral', amp: amp('DADI'), pose: d1 ? (p => { p.armR.sw = 1.2; p.armR.el = .4 + .3 * Math.sin(t * 6); }) : null });
  ch += `<rect x="${sx(cam, 590)}" y="720" width="320" height="16" fill="#7a5a3a" stroke="${C.ink}" stroke-width="4"/>` + [...Array(9)].map((_, k) => `<path d="M${sx(cam, 600) + k * 37.5},736 v54" stroke="#7a5a3a" stroke-width="7"/>`).join('') + `<rect x="${sx(cam, 580)}" y="786" width="340" height="14" fill="#9a7a5a" stroke="${C.ink}" stroke-width="4"/>`;
  let g = S.Z(ch);
  g = `<g transform="translate(0,${-UP * (1 - P)})">${S.back + g}</g>` + S.front;
  return g + capFor('warn', t);
}

// 4 DANGER — Ammar mistri spots the crate with a puppy, drifting towards the naala; Basim runs along the ledge
function E_danger(t) {
  const D = sdur('danger'), m1 = on('m1', t), s2 = on('s2', t);
  const P = ease(seg(t, .6, D));
  const cam = { x: lerp(200, 1250, P), z: lerp(1.45, 1.25, ease(seg(t, 0, 2.2))), py: 900 };
  const S = galiR(t, cam, { drainWX: 2250 });
  const cw = lerp(380, 1980, seg(t, 0, D + 1.5));
  let ch = floatPup(t, sx(cam, cw), WTOP + 95, .95, { bark: .7 * Math.max(0, Math.sin(t * 5)) });
  // Ammar on the ledge (left), pointing at the water
  const ax = sx(cam, 520);
  ch += shadow(ax - 20, LEDGE + 2, 130, .6) + ammar({ x: ax, y: LEDGE, t, move: m1 ? 'point' : 'scared', mt: m1 ? t - LS('m1') : t, yaw: .7, expr: 'surprised', amp: amp('AMMAR') });
  // Basim runs along the ledge, keeping up with the crate
  const bw = lerp(700, 1900, seg(t, LS('s2') - 1.2, D + .5)), bxx = sx(cam, bw);
  ch += shadow(bxx - 20, LEDGE + 2, 90, .6) + basim({ x: bxx, y: LEDGE, t, move: t > LS('s2') - 1.2 ? 'run' : 'scared', mt: t, yaw: Math.PI / 2 * .9, expr: 'scared', amp: amp('BASIM') });
  if (t > LS('s2') - 1.2) ch += speed(bxx - 40, LEDGE - 160, 1, .6, 4);
  let g = upS(S.back + S.Z(ch)) + S.front + lightning(t, 2.0, .7);
  if (s2) g += hookBig('NAALA', 'AA RAHA HAI!', t, LS('s2'), LS('s2') + .3, 280);
  else if (t > LE('m1') - 1.6 && t < LE('m1') + .1) { const k = back(seg(t, LE('m1') - 1.6, LE('m1') - 1.3)); const p = { x: sx(cam, cw) * (cam.z) - (cam.z - 1) * 540, y: (WTOP + 20 - UP) }; g += burst(Math.min(880, Math.max(200, p.x)), 520, 120 * k, '#fff', 'BHAU BHAU!', 40, 8, 1); }
  return g + capFor('danger', t);
}

// 5 HOME — courtyard (rain on the roofs), Qasim runs in dripping; Sakina covers for him with a wink
function E_home(t) {
  const D = sdur('home'), zip = seg(t, LE('k1') + .1, LE('k1') + .75);
  const cam = { x: lerp(-200, 140, ease(seg(t, .15, 2.0))), y: 0, z: 1 + .12 * ease(seg(t, LE('a1'), D)), px: 600 };
  const S = aangan(t, cam, { open: seg(t, LE('k1') + .2, LE('k1') + .35) * (1 - seg(t, LE('k1') + .75, LE('k1') + .9)), manoSleep: 1 });
  let g = S.back + rain(t, 40, .35, 70, 3, 5, -200, 560, 1700);
  const fl = ease(seg(t, 0, 1.75));
  let d = 1.0, x = lerp(-260, 640, fl), y = 1235, walking = t < 1.75;
  if (zip > 0) { d = lerp(1.0, 1.3, eout(zip)); x = lerp(640, WC.x + WC.w / 2, eout(zip)); y = lerp(1235, 1080, eout(zip)); }
  const q1 = on('q1', t, .1, 1.2), dd = Math.sin(t * 16), waiting = t > 1.75 && zip === 0;
  const a1 = on('a1', t), k1 = on('k1', t, .1, .4);
  // Sakina by the window (depth 1.15), looking at Qasim; winks on her line
  g += at(1.15, cam, 330, 1150, sakina, { s: .95, t, move: k1 ? 'talk' : 'listen', mt: t, yaw: -.5, expr: k1 ? 'wink' : (a1 ? 'smug' : 'neutral'), amp: amp('SAKINA') }, { w: 120 });
  g += at(1, cam, 900, 1250, ammi, { s: SAM, t, phone: 1, look: a1 || t > 1.9 ? [-12, 2] : [0, 12], brow: a1 ? 1 : .3, amp: amp('AMMI'), tilt: zip > 0 ? -10 * seg(zip, 0, .6) : 0, blink: blink(t, 2.6) }, { w: 150 });
  if (zip < 1) g += `<g opacity="${1 - seg(zip, .7, 1)}">` + at(d, cam, x, y, (o) => susu(o) + (() => { let dr = ''; for (let i = 0; i < 4; i++) { const p = (t * 1.5 + i / 4) % 1; dr += `<path d="M${o.x + (i - 1.5) * 50 * o.s},${o.y - 420 * o.s + p * 300 * o.s} q-6,12 0,18 q6,-6 0,-18Z" fill="#bfe0ff" opacity="${1 - p}"/>`; } return dr; })(), { s: SQ, t, legL: walking || zip > 0 ? walkPh(t, 30) : waiting ? 16 + 6 * dd : 0, legR: walking || zip > 0 ? -walkPh(t, 30) : waiting ? -16 + 6 * dd : 0, armL: waiting ? 4 : 35, armR: waiting ? 4 : 35, mouth: 'wobble', brow: 1, tilt: waiting ? 6 * dd : 0, look: k1 ? [-12, 0] : [10, 0], amp: amp('QASIM'), blink: blink(t), flip: 1 }, { w: 110 }) + '</g>';
  if (walking || (zip > 0 && zip < 1)) { const p = proj(d, cam, x, y); g += speed(p.x - 30, p.y - 150 * p.s, 1, .7, 4); }
  g += S.front;
  g += tally(3, 'AAJ SUUSUU BREAK:', seg(t, LS('a1') + .2, LS('a1') + .5));
  if (zip > .8 && t < D) { const p = proj(1.3, cam, WC.x + WC.w / 2, 840); g += burst(p.x, p.y - 20, 110, '#fff', 'DHAP!', 48, 6, 1 - seg(t, LE('k1') + 1.1, LE('k1') + 1.4)); }
  return g + capFor('home', t);
}

// 6 POWER — WC door glows gold; only Sakina sees (thumbs up); FLUUSH, power bar, SUUU-SUUU-MAN!
function E_power(t) {
  const nE = LE('n3'), q = LS('q2'), open = ease(seg(t, q - .45, q - .3)), glow = Math.max(seg(t, .2, nE), open);
  const cam = { x: 270, y: -40, z: lerp(1.0, 1.42, ease(seg(t, 0, q - .4))) + .06 * open, px: 540, py: 900 };
  const S = aangan(t, cam, { open, glow, manoSleep: 1 });
  let g = S.back;
  const dp = proj(1.3, cam, WC.x + WC.w / 2, 840);
  if (open > 0) g += shafts(dp.x, dp.y, -Math.PI / 2, 14, 1900, .5 * open, t * 3, '#fff6c8', .45, .05);
  // Sakina (mid-ground, left of the door): the only one who knows — a wink and a thumbs up
  g += at(1.12, cam, 470, 1160, sakina, { s: 1.12, t, move: t > .9 ? 'thumbsUp' : 'idle', mt: t - .9, yaw: .5, expr: t > .9 ? 'wink' : 'smug' }, { w: 120 });
  if (open > 0) {
    const st = eout(seg(t, q - .3, q + .5)), hero = ease(seg(t, q, q + .3)), up = ease(seg(t, LE('q2') + .5, sdur('power')));
    const dd = lerp(1.3, .95, st);
    g += at(dd, cam, WC.x + WC.w / 2 - 40 * st, lerp(1080, 1240, st) - up * 1300, susu, { s: lerp(SQ, .78, st), t, power: open, cape: open, crown: seg(t, q, q + .3), shades: seg(t, LE('q2') + .15, LE('q2') + .45), armR: lerp(20, 165, hero), fistR: hero > .4, armL: lerp(20, 40, hero), amp: amp('QASIM'), mouth: 'smirk', blink: blink(t, 3), legL: up > 0 ? -20 : 0, legR: up > 0 ? 14 : 0 }, { w: 120, h: up * 1300, op: 1.2 });
    if (up > 0) { const p = proj(dd, cam, WC.x + WC.w / 2, 1240 - up * 1300); g += speed(p.x, p.y + 120, 0, .7, 3); }
  }
  g += `<g filter="url(#dofNear2)">${at(.78, cam, 640, 1450, ammi, { s: SAM, t, phone: 1, look: [4, 14], brow: .2, blink: blink(t, 3.4), tilt: open > 0 ? 3 * Math.sin(t * 20) * (1 - seg(t, q, q + .6)) : 0 }, { w: 0 })}</g>`;
  g += S.front;
  g = shake(g, (open > 0 && open < 1) ? 1 : (glow > .8 && open === 0 ? .3 : 0), t);
  if (t > .8 && t < 2.4) { const k = back(seg(t, .8, 1.1)); g += `<g transform="translate(540,640) scale(${k})">${burst(0, 0, 230, C.gold, 'FLUUSH!', 104, -8, 1 - seg(t, 2.1, 2.4))}</g>`; }
  const p = ease(seg(t, 1.0, nE));
  if (t > .9 && open < 1) g += `<g opacity="${seg(t, .9, 1.1) * (1 - open)}"><rect x="140" y="150" width="800" height="150" rx="30" fill="#000" opacity=".75"/>${T(540, 212, 62, 'SUUSUU POWER', { fill: C.gold, sw: 0, ls: 6 })}<rect x="190" y="235" width="700" height="44" rx="22" fill="#333" stroke="#fff" stroke-width="5"/><rect x="194" y="239" width="${692 * p}" height="36" rx="18" fill="${p > .99 ? '#ff3b30' : C.gold}"/>${T(540, 272, 40, Math.round(p * 100) + '%', { sw: 6 })}${emblem(180, 257, .7)}</g>`;
  if (t > 1.6 && open === 0) { const k = back(seg(t, 1.6, 1.9)); const ins = `<g transform="translate(860,560) scale(${k})"><rect x="-170" y="-170" width="340" height="340" fill="#59677d"/><rect x="-170" y="10" width="340" height="170" fill="#5f7f98"/>${[0, 1, 2, 3].map(i => `<path d="M${-150 + i * 90 + ((t * 120) % 90)},${40 + i % 2 * 50} q20,-8 40,0" stroke="#e8f1fa" stroke-width="5" fill="none"/>`).join('')}${floatPup(t, -10, 40, .8)}${rain(t, 18, .5, 40, 3, 7, -170, 170, 900).replace('<g ', '<g transform="translate(-200,0)" ')}</g>`; g += inset(860, 560, 150 * k, ins, 'insP'); }
  if (t > q) { const k = back(seg(t, q, q + .3)); g += `<g transform="translate(540,330) scale(${lerp(2.2, 1, clamp(k))}) rotate(-4)" opacity="${clamp(k * 2)}"><rect x="-460" y="40" width="920" height="40" rx="20" fill="${C.red}" transform="skewX(-20)"/>${T(0, 40, 138, 'SUUU-SUUU-MAN!', { shadow: C.red, sw: 12, ls: 2 })}</g>`; }
  return g + capFor('power', t);
}

// 7 RESCUE — Susuman skims the flood, scoops the puppy right at the naala, sets it down by Ammar and Basim, zooms off
function E_rescue(t) {
  const D = sdur('rescue'), scoop = 2.6, land = 4.6, leave = LE('s3') + .5;
  const cam = { x: lerp(1500, 1640, ease(seg(t, 0, D))), z: lerp(1.3, 1.42, ease(seg(t, 2, 4))), py: 900 };
  const S = galiR(t, cam, { drainWX: 2250 });
  let ch = '';
  // crate: drifts into the whirl; after the scoop it tips and gets sucked into the naala
  const cw = lerp(2020, 2200, seg(t, 0, scoop)), sunk = seg(t, scoop + .2, scoop + 1.4);
  if (sunk < 1) ch += `<g opacity="${1 - sunk}" transform="translate(0,${40 * sunk})">` + floatPup(t, sx(cam, cw), WTOP + 95, .95, { noPup: t > scoop, tip: 40 * sunk, bark: t < scoop ? .8 * Math.max(0, Math.sin(t * 7)) : 0 }) + `</g>`;
  // Ammar + Basim on the ledge
  const amx = sx(cam, 1870), bsx = sx(cam, 1985), m2 = on('m2', t), s3 = on('s3', t);
  ch += shadow(amx - 20, LEDGE + 2, 130, .6) + ammar({ x: amx, y: LEDGE, t, move: m2 ? 'point' : (t > land ? 'celebrate' : 'scared'), mt: m2 ? t - LS('m2') : t, yaw: m2 ? 1.2 : .5, expr: t > land ? 'happy' : 'surprised', amp: amp('AMMAR'), pose: m2 ? (p => { p.armR.ab = 0.9; }) : null });
  ch += shadow(bsx - 20, LEDGE + 2, 90, .6) + basim({ x: bsx, y: LEDGE, t, move: s3 || t > LE('s3') ? 'celebrate' : 'scared', mt: t, yaw: -.4, expr: t > land ? 'laugh' : 'scared', amp: amp('BASIM') });
  // Susuman path: dive in from the upper left, skim, scoop, rise, land on the ledge, fly off
  let hx, hy, rot = 0, sc = .62, armR = 160, armL = 175, holding = t > scoop && t < land + .3;
  if (t < scoop) { const k = eout(seg(t, .3, scoop)); hx = lerp(-300, sx(cam, cw) - 20, k); hy = lerp(300, WTOP + 40, k); rot = lerp(50, 80, k); }
  else if (t < land) { const k = ease(seg(t, scoop, land)); hx = lerp(sx(cam, cw) - 20, sx(cam, 2120), k); hy = lerp(WTOP + 40, LEDGE, k) - 260 * Math.sin(k * Math.PI); rot = lerp(70, 0, k); armR = 60; armL = 60; }
  else if (t < leave) { hx = sx(cam, 2120); hy = LEDGE; rot = 0; armR = lerp(60, 150, seg(t, land, land + .5)); armL = 20; }
  else { const k = ease(seg(t, leave, leave + 1.0)); hx = sx(cam, 2120) + 300 * k; hy = LEDGE - 1500 * k; rot = 20 * k; armR = 175; armL = 160; }
  // puppy: on the crate → in his arms → set down on the ledge (wagging)
  if (holding) ch += pilla({ x: hx + 40, y: hy - 150, s: .4, t, flip: 1, shiver: .5 });
  else if (t >= land + .3) ch += shadow(sx(cam, 2050) - 15, LEDGE + 2, 80, .6) + pilla({ x: sx(cam, 2050), y: LEDGE, s: .52, t, flip: -1, drip: 1, bark: t > LE('s3') ? .5 * Math.max(0, Math.sin(t * 5)) : 0 });
  if (t < leave + 1) ch += (hy > LEDGE - 5 ? shadow(hx - 20, LEDGE + 2, 110, .6) : '') + susu({ x: hx, y: hy, s: sc, rot, t, power: .9, cape: 1, crown: 1, shades: 1, armL, armR, fistR: t > land + .3, legL: t < land ? -20 : 0, legR: t < land ? 14 : 0, mouth: t > land ? 'grin' : 'shout', brow: .2 });
  if (t < scoop || (t > leave && t < leave + 1)) ch += speed(hx - 40, hy - 140, t < scoop ? 1 : 0, .6, 4);
  if (t > scoop - .1 && t < scoop + .9) { const k = seg(t, scoop - .1, scoop + .9); for (let i = 0; i < 10; i++) { const a = -Math.PI * (i / 9), r = 40 + 220 * k; ch += `<circle cx="${sx(cam, cw) + Math.cos(a) * r}" cy="${WTOP + 100 + Math.sin(a) * r * .8 + 300 * k * k}" r="${14 * (1 - k) + 4}" fill="#e8f1fa" opacity="${1 - k}"/>`; } }
  let g = upS(S.back + S.Z(ch)) + S.front;
  if (t > scoop && t < scoop + 1.2) g += `<g transform="translate(540,560) scale(${back(seg(t, scoop, scoop + .3))})">${burst(0, 0, 200, '#8fd0f4', 'SPLAASH!', 84, -6, 1 - seg(t, scoop + .9, scoop + 1.2))}</g>`;
  if (t > scoop - .6 && t < scoop + .25) g += `<rect width="1080" height="1920" fill="#000" opacity=".12"/>` + T(540, 300, 60, 'SLOW-MO...', { fill: '#fff', sw: 6 });
  return g + capFor('rescue', t);
}

// 8 LESSON — rain stops, rainbow; Dadi wraps the puppy in a towel, Basim names it Moti
function E_lesson(t) {
  const D = sdur('lesson'), rk = 1 - seg(t, .5, 4.5), P = ease(seg(t, 0, D));
  const cam = { x: lerp(1250, 1330, P), z: lerp(1.35, 1.5, P), py: 900 };
  const S = galiR(t, cam, { rainK: rk, rainbow: seg(t, 3, 6) });
  const d2 = on('d2', t), s4 = on('s4', t), q3 = on('q3', t, .1, .5);
  const px = sx(cam, 1880);
  let ch = '';
  ch += shadow(sx(cam, 2040) - 20, LEDGE + 2, 120, .6) + dadi({ x: sx(cam, 2040), y: LEDGE, t, move: d2 ? 'talk' : 'listen', mt: t, yaw: -.6, expr: d2 ? 'happy' : 'love', amp: amp('DADI') });
  ch += shadow(px - 15, LEDGE + 2, 90, .6) + pilla({ x: px, y: LEDGE, s: .56, t, flip: 1, towel: seg(t, .3, .9), bark: q3 ? .6 * Math.max(0, Math.sin(t * 6)) : 0 });
  ch += shadow(sx(cam, 1750) - 20, LEDGE + 2, 90, .6) + basim({ x: sx(cam, 1750), y: LEDGE, t, move: s4 ? 'present' : (t > LE('s4') ? 'clap' : 'listen'), mt: t, yaw: .5, expr: s4 || t > LE('s4') ? 'laugh' : 'happy', amp: amp('BASIM') });
  const qx = sx(cam, 1610);
  ch += shadow(qx - 20, LEDGE + 2, 110, .6) + qas(qx, LEDGE, { t, look: q3 ? [14, 8] : [12, 0], armR: q3 ? 150 : 25, armL: 20, mouth: q3 ? 'grin' : 'smirk', amp: amp('QASIM'), blink: blink(t, 2.7) });
  if (t > LE('q3')) for (let i = 0; i < 3; i++) { const p = (t * .7 + i / 3) % 1; ch += heart(px + (i - 1) * 50, LEDGE - 140 - 160 * p, .5, 1 - p); }
  let g = upS(S.back + S.Z(ch)) + S.front;
  if (s4 || (t > LE('s4') && t < LE('s4') + 1.6)) g += `<g transform="translate(540,330) scale(${back(seg(t, LS('s4') + .9, LS('s4') + 1.2))}) rotate(-3)">${T(0, 0, 150, 'MOTI!', { fill: C.gold, shadow: C.red })}</g>`;
  return g + capFor('lesson', t);
}

// 9 ENDING — evening courtyard; Ammi: so wet?! Sakina covers; Qasim + Sakina wink
function E_ending(t) {
  const D = sdur('ending'), cz = ease(seg(t, LS('k2') + .4, LE('q4')));
  const run = ease(seg(t, 0, 1.0));
  let x = lerp(-200, 640, run), y = 1235, d = 1;
  let cam = { x: 140, y: 0, z: 1, px: 600 };
  cam = lerpCam(cam, { x: 240, y: -120, z: 1.35, px: 540, py: 900 }, cz);
  const S = aangan(t, cam, { eve: 1, manoWide: on('a2', t, 0, .5) ? 1 : 0, manoMeow: on('q4', t) ? .6 : 0 });
  let g = S.back;
  const a2 = on('a2', t), k2 = on('k2', t, .1, .3), q4 = on('q4', t, .1, .4), dd = Math.sin(t * 16);
  g += at(1.12, cam, 360, 1160, sakina, { s: .95, t, move: k2 ? 'talk' : 'idle', mt: t, yaw: .3, expr: t > LE('k2') - .3 ? 'wink' : (a2 ? 'surprised' : 'neutral'), amp: amp('SAKINA') }, { w: 120 });
  g += at(1, cam, 900, 1250, ammi, { s: SAM, t, phone: 1, look: a2 ? [-14, -6] : (k2 ? [-16, 2] : [-12, 2]), brow: a2 ? 1 : .4, amp: amp('AMMI'), blink: blink(t, 2.6), tilt: a2 ? -6 : 0 }, { w: 150 });
  g += at(d, cam, x, y, (o) => susu(o) + (() => { let dr = ''; for (let i = 0; i < 4; i++) { const p = (t * 1.5 + i / 4) % 1; dr += `<path d="M${o.x + (i - 1.5) * 50 * o.s},${o.y - 420 * o.s + p * 300 * o.s} q-6,12 0,18 q6,-6 0,-18Z" fill="#bfe0ff" opacity="${1 - p}"/>`; } return dr; })(), { s: SQ, t, legL: t < 1 ? walkPh(t, 30) : 0, legR: t < 1 ? -walkPh(t, 30) : 0, armL: q4 ? 20 : 8, armR: q4 ? 150 : 8, mouth: q4 ? 'grin' : (a2 ? 'o' : 'smirk'), amp: amp('QASIM'), brow: a2 ? .7 : 0, wink: t > LE('q4') - .3 ? 1 : 0, look: a2 ? [6, -10] : (k2 ? [-12, 0] : [10, 0]), blink: blink(t) }, { w: 110 });
  if (t < 1) { const p = proj(d, cam, x, y); g += speed(p.x - 30, p.y - 150 * p.s, 1, .7, 4); }
  g += S.front;
  if (a2 && t > LS('a2') + .3) g += T(540, 330, 96, 'ITNE GEELE?!', { fill: '#fff', shadow: '#1f7a78' });
  if (t > LE('q4')) { const k = back(seg(t, LE('q4'), LE('q4') + .3)); g += `<g transform="translate(540,330) scale(${k}) rotate(-3)">${T(0, 0, 100, 'RAAZ SURAKSHIT!', { fill: C.gold, shadow: C.red })}</g>`; }
  return g + capFor('ending', t);
}

function E_endcard(t) {
  const cam = { x: 30 * Math.sin(t * .4), y: 0, z: 1 + .06 * t / sdur('endcard') };
  let g = layer(4, cam, brushBg(t + 90), { f: 'dof2' });
  g += layer(1, cam, shadow(540, 1255, 200, .8) + lightPool(540, 1250, 380, 70, .8) + susu({ x: 540, y: 1250, s: .85, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 40, armR: 150, mouth: 'grin', blink: blink(t, 2.6) })
    + pilla({ x: 790, y: 1252, s: .78, t, flip: -1, bark: Math.max(0, Math.sin(t * 3)) * .6 }) + shadow(720, 1255, 120, .7), { f: '' });
  let sp = ''; for (let i = 0; i < 9; i++) { const x = ((i * 157 + t * 60) % 1300) - 110, y = 200 + (i * 211) % 1500; sp += `<path d="M${x},${y - 40} L${x + 10},${y} L${x},${y + 40} L${x - 10},${y}Z M${x - 40},${y} L${x},${y - 10} L${x + 40},${y} L${x},${y + 10}Z" fill="${C.gold}" opacity=".8"/>`; }
  g += layer(.6, cam, sp);
  const n5 = L('n4'), half = LS('n4') + n5.d * .55;
  if (t < half + .2) { g += `<g transform="translate(540,290) scale(${back(seg(t, .2, .5))})">${T(0, 0, 96, 'BARISH MEIN', { shadow: '#000' })}</g><g transform="translate(540,410) scale(${back(seg(t, .5, .8))}) rotate(-3)">${T(0, 0, 108, 'MAT KHELO!', { fill: C.gold, shadow: C.red })}</g>`; }
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


const EP = { hook: E_hook, intro: E_intro, warn: E_warn, danger: E_danger, home: E_home, power: E_power, rescue: E_rescue, lesson: E_lesson, ending: E_ending, endcard: E_endcard };
window.drawFrame = (id, t) => {
  const s = TL.scenes.find(x => x.id === id); ABS = s.start + t;
  document.getElementById('s').innerHTML = defs() + skyDefs + skyDefs2 + stormDefs + depthDefs(id === 'ending' ? '#ffd9b0' : '#cfdbe8') + EP[id](t);
};

// =================== 16:9 version: the same scenes, framed for a 1920x1080 player ===================
// Each scene is drawn in its 1080x1920 world, then mapped with a per-scene view (scale S, top Y0); captions are redrawn for 16:9.
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
  let body = widen(EP[id](t));
  const bg = id === 'endcard' ? `<rect x="-1500" y="-300" width="4100" height="2600" fill="#0b0b12"/>` : '';
  const svg = document.getElementById('s');
  svg.setAttribute('width', 1920); svg.setAttribute('height', 1080); svg.setAttribute('viewBox', '0 0 1920 1080');
  svg.innerHTML = defs() + skyDefs + skyDefs2 + stormDefs + depthDefs(id === 'ending' ? '#ffd9b0' : '#cfdbe8') + `<g transform="translate(960,0) scale(${S}) translate(-540,${-Y0})">${bg}${body}</g>` + (CAPW ? captionW(...CAPW) : '');
  WIDE = false;
};
