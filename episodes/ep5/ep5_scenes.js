// Episode 5 "Bandar Ne Chashma Churaya" — scenes. Each takes local time t; dialogue times come from TL (timeline.js).
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

// ---- where everyone lives on the rooftop row (action plane, world coords) ----
const DX = CP5 - 90, DY = FY + 150;                 // Dadi sitting on the charpai
const DFACE = [DX + 30, DY - 335];                   // her face (where the glasses sit)
const BX = 1050, BY = FY + 160;                      // Basim on his roof
const MP = [1250, 902];                              // monkey's perch on Basim's parapet
const LX = 2450, LY = FY + 190;                      // Latifa on her mat
const ZX = 600, ZY = FY + 215;                       // Zahra Miss (visiting Dadi), at the right edge of our roof
const SAX = 330, SAY = FY + 225;                     // Sakina
const HANGX = POLE + 230;                            // where the monkey hangs from the wire
const snatchT = () => LE('i2') + .72;                // tease: the moment the glasses come off
const dadiAt = (cam, t, o = {}, glasses = true) => at(1, cam, DX, DY, glasses ? dadi : dadiNoG, Object.assign({ s: SKR, t, move: 'sit', mt: 5, yaw: .45, expr: 'happy' }, o), { w: 0 });
const bananaIn = (d, cam, x, y, s = .5, rot = 20, peel = 0) => { const p = proj(d, cam, x, y); return kela(p.x, p.y, s * p.s, rot, peel); };
function books(cam, t, kick = -1) {   // Latifa's books on her mat; after kick they scatter, pages fly
  let g = '';
  const B = [[2330, FY + 230, -8, '#e5463b'], [2400, FY + 250, 6, '#3b8de5'], [2560, FY + 225, 12, '#22a35a'], [2600, FY + 255, -4, '#b04ad6']];
  B.forEach(([x, y, r, c], i) => { let xx = x, yy = y, rr = r; if (kick >= 0) { const k = eout(clamp(kick * 1.6 - i * .1)); xx += (i % 2 ? 1 : -1) * 120 * k + 60 * k; yy -= 150 * Math.sin(k * Math.PI); rr += 300 * k * (i % 2 ? 1 : -1); } const p = proj(1, cam, xx, yy); g += kitaab(p.x, p.y, .7 * p.s, rr, c); });
  if (kick > 0) for (let i = 0; i < 9; i++) { const k = clamp(kick - i * .05), p = proj(1, cam, 2470 + (i - 4) * 70 + 220 * k * Math.sin(i * 2.1), FY + 200 - 520 * k + 40 * Math.sin(kick * 6 + i)); if (k > 0) g += page(p.x, p.y, .8 * p.s, i * 40 + kick * 300, 1 - seg(kick, 1.1, 1.8)); }
  return g;
}

// ============ 1 HOOK — flash-forward: the monkey hangs from the live wire with Dadi's glasses; sparks; Susuman streaks in. Then rewind. ============
function E_hook(t) {
  const nE = LE('n1') + .3, tt = t < nE ? t : Math.max(0, nE - (t - nE) * 2.4), rw = seg(t, nE, nE + .5), P = seg(tt, 0, nE);
  const cam = camR(lerp(HANGX - 260, HANGX - 120, ease(P)), lerp(1.1, 1.45, ease(P)), 900, 540, ARM + 120);
  const S = chhatein(tt, cam, {});
  let g = S.back;
  const fl = .55 + .45 * Math.abs(Math.sin(tt * 9)), sp = proj(1, cam, POLE + 110, ARM - 24);
  g += sparks(sp.x, sp.y, tt, fl, 10, 95 * sp.s);
  g += bandarAt(1, cam, HANGX, wireY(HANGX, 0), { pose: 'hang', t: tt, item: 'chashma', s: .9, angry: Math.sin(tt * 3) > 0 ? 1 : 0, look: [-5, 3] }, { w: 0 });
  // Susuman streaks in from the upper left with a banana
  const k = eout(seg(tt, .7, nE)), sx = lerp(-300, 330, k), sy = lerp(1500, 1180, k);
  g += speed(sx - 80, sy - 120, 1, .7, 5) + susu({ x: sx, y: sy, s: .62, rot: 62, t: tt, power: .9, cape: 1, crown: 1, shades: 1, armL: 175, armR: 160, legL: -20, legR: 14, mouth: 'shout', brow: .2 });
  { const h = susHand(sx, sy, .62, 160); g += kela(h[0] + 30, h[1] + 20, .45, 60); }
  g += S.front + vig(t < nE ? .8 : .4);
  if (t < nE) g += hookBig('BANDAR NE', 'CHASHMA CHURAYA!', t, .2, 1.5, 230).replace('font-size="124"', 'font-size="104"');
  if (t < nE && t > 2.6) g += T(540, 560, 64, 'TAARON PE KHATRA!', { fill: '#7fd8ff', shadow: '#000', op: clamp((t - 2.6) * 4) });
  if (t > nE) g += rewindFx(t - nE, rw, 'THODI DER PEHLE...');
  const f2 = seg(t, sdur('hook') - .25, sdur('hook')); if (f2 > 0) g += `<rect width="1080" height="1920" fill="#fff" opacity="${f2}"/>`;
  return g + capFor('hook', t);
}

// ============ 2 INTRO — crane down from the winter sky + kites to our roof: Dadi's moongphali on the charpai, Zahra Miss visiting; Qasim + Sakina run out of the mumty ============
function E_intro(t) {
  const D = sdur('intro'), cr = ease(seg(t, 0, 4.0));
  let cam = camR(lerp(260, 120, cr), lerp(.82, .9, cr), 1150, 540, lerp(-420, 1180, cr));
  cam = lerpCam(cam, camR(170, 1.0, 1150, 540, 1150), ease(seg(t, 4.0, LS('q1'))));
  cam = lerpCam(cam, camR(420, .86, 1150, 540, 1180), ease(seg(t, LE('q1') - .2, D)));
  const door = seg(t, 3.7, 4.0) * (1 - seg(t, 5.4, 5.7));
  const S = chhatein(t, cam, { doorOpen: door });
  let g = S.back;
  const i1 = on('i1', t), q1 = on('q1', t);
  g += dadiAt(cam, t, { expr: 'happy', amp: amp('DADI'), move: 'sit' });
  g += at(1, cam, ZX, ZY, zahra, { s: SKR, t, move: i1 ? 'clap' : (t > LE('i1') ? 'laugh' : 'idle'), mt: t, yaw: -.5, expr: 'happy' }, { w: 110 });
  // Sakina + Qasim burst out of the mumty door and run to the plate
  const out = ease(seg(t, 3.9, 5.6)), dX = MUM5.door + 95;
  if (out > 0) {
    const sx = lerp(dX, SAX, out), qx = lerp(dX + 20, 210, ease(seg(t, 4.0, 6.0))), qk = ease(seg(t, 4.0, 6.0));
    g += at(1, cam, sx, lerp(FY + 20, SAY, out), sakina, { s: SKR, t, move: out < 1 ? 'run' : 'idle', mt: t, yaw: out < 1 ? Math.PI / 2 : -.3, expr: 'happy' }, { w: 100 });
    const qb = q1 ? Math.abs(Math.sin(t * 11)) * 30 : 0;
    g += at(1, cam, qx, lerp(FY + 30, FY + 250, qk) - qb, susu, { s: SQ, t, legL: qk < 1 ? walkK(t, 30) : 0, legR: qk < 1 ? -walkK(t, 30) : 0, armL: q1 ? 150 + 15 * Math.sin(t * 12) : 30, armR: q1 ? 150 - 15 * Math.sin(t * 12) : 30, mouth: q1 ? 'talk' : 'grin', amp: amp('QASIM'), brow: q1 ? .6 : 0, look: [-12, -8], blink: blink(t), flip: qk < 1 ? 1 : -1 }, { w: 110, h: qb });
  }
  // a handful of peanuts arcs from Dadi to Qasim after his line
  const tossK = seg(t, LE('q1') - .3, LE('q1') + .4);
  if (tossK > 0 && tossK < 1) { const a = proj(1, cam, DX + 80, DY - 200), b = proj(1, cam, 230, FY + 30); for (let i = 0; i < 4; i++) { const k = clamp(tossK - i * .05); g += `<ellipse cx="${lerp(a.x, b.x, k) + i * 8}" cy="${lerp(a.y, b.y, k) - 160 * Math.sin(k * Math.PI)}" rx="${12 * a.s}" ry="${7 * a.s}" fill="#d9a35e" stroke="${C.ink}" stroke-width="2"/>`; } }
  // steam off the warm peanuts
  { const p = proj(1, cam, PL5, FY + 120); for (let i = 0; i < 3; i++) g += `<path d="M${p.x - 30 + i * 30},${p.y - 10} q${10 * Math.sin(t * 2 + i)},-40 0,-80" stroke="#fff" stroke-width="5" fill="none" opacity="${.5 * (1 - ((t * .6 + i / 3) % 1))}"/>`; }
  g += S.front;
  if (t < 4.2) g += hookBig('SARDI KI', 'DHOOP!', t, .3, .9, 260);
  if (q1) g += `<g transform="translate(540,330) scale(${back(seg(t, LS('q1'), LS('q1') + .3))})">${T(0, 0, 90, 'MUJHE BHI!', { fill: C.gold, shadow: C.red })}</g>`;
  return g + capFor('intro', t);
}

// ============ 3 TEASE — Bandar Mama drops from the neem onto Basim's parapet; Basim teases him with a banana; Dadi warns; the angry monkey leaps and snatches her glasses ============
function monkeyTease(t) {
  const sT = snatchT(), l0 = LE('i2') + .05;
  if (t < .7) { const k = eout(seg(t, 0, .7)); return { d: lerp(1.5, 1, k), x: lerp(MP[0] + 40, MP[0], k), y: lerp(560, MP[1], k) - 120 * Math.sin(k * Math.PI), pose: k < 1 ? 'leap' : 'sit', flip: -1, rot: lerp(-30, 0, k) }; }
  if (t < l0) { const s1 = on('s1', t, 0, 0); return { d: 1, x: MP[0], y: MP[1], pose: 'sit', flip: -1, angry: t > LE('s1') - .2 ? 1 : 0, wave: s1 ? .5 + .5 * Math.sin(t * 8) : 0 }; }
  if (t < sT) { const k = seg(t, l0, sT); return { d: 1, x: lerp(MP[0], DFACE[0] + 60, k), y: lerp(MP[1], DFACE[1] + 60, k) - 200 * Math.sin(k * Math.PI), pose: 'leap', flip: -1, angry: 1, rot: lerp(-20, 10, k) }; }
  const k2 = seg(t, sT + .08, sT + .85);
  if (k2 < 1) return { d: 1, x: lerp(DFACE[0] + 60, MP[0], k2), y: lerp(DFACE[1] + 60, MP[1], k2) - 220 * Math.sin(k2 * Math.PI), pose: 'leap', flip: 1, item: 'chashma', rot: lerp(10, -20, k2) };
  return { d: 1, x: MP[0], y: MP[1], pose: 'sit', flip: -1, item: t > sT + 2.4 ? 'wear' : 'chashma', angry: 0 };
}
function E_tease(t) {
  const D = sdur('tease'), sT = snatchT(), i3 = on('i3', t), pov = seg(t, LS('i3') + 1.55, LS('i3') + 1.75) * (1 - seg(t, LE('i3') + .1, LE('i3') + .3));
  let cam = camR(lerp(980, 1060, ease(seg(t, 0, 3.4))), .95, 1150, 540, 1150);
  cam = lerpCam(cam, camR(380, .78, 1150, 540, 1180), ease(seg(t, LS('i2') - .2, LS('i2') + .6)));
  cam = lerpCam(cam, camR(160, 1.05, 1150, 540, 1150), ease(seg(t, LE('i2') - .1, sT)));
  cam = lerpCam(cam, camR(360, .8, 1150, 540, 1180), ease(seg(t, sT + .2, sT + 1.2)));
  cam = lerpCam(cam, camR(DX + 120, 1.18, 1150, 540, 1120), ease(seg(t, LS('i3') + .2, LS('i3') + 1.2)));
  cam = lerpCam(cam, camR(MP[0] - 20, 1.2, 1100, 540, 900), pov);
  cam = lerpCam(cam, camR(300, .82, 1150, 540, 1180), ease(seg(t, LE('i3') + .1, D)));
  const S = chhatein(t, cam, {});
  let g = S.back;
  const s1 = on('s1', t), i2 = on('i2', t), snatched = t > sT, M = monkeyTease(t);
  // Basim + his banana (held out, then pulled back)
  const tease = s1 ? Math.max(0, Math.sin((t - LS('s1')) * 3.2)) : 0;
  g += at(1, cam, BX, BY, basim, { s: SKR, t, move: s1 ? (tease > .3 ? 'present' : 'laugh') : (t > LE('s1') && t < sT + 1 ? 'scared' : 'idle'), mt: t, yaw: .6, expr: s1 ? 'happy' : (snatched ? 'surprised' : 'happy'), amp: amp('BASIM') }, { w: 90 });
  g += bananaIn(1, cam, BX + 70 + 90 * tease, BY - 330 + 30 * tease, .5, 30 + 30 * tease);
  // Dadi, Zahra Miss, Sakina, Qasim on our roof
  g += dadiAt(cam, t, { move: 'sit', expr: i3 ? 'surprised' : (i2 ? 'angry' : 'happy'), amp: amp('DADI') }, !snatched);
  g += at(1, cam, ZX, ZY, zahra, { s: SKR, t, move: snatched && t < sT + 1.2 ? 'scared' : (i3 ? 'listen' : 'idle'), mt: t - sT, yaw: -.6, expr: snatched ? 'surprised' : 'happy' }, { w: 110 });
  g += at(1, cam, SAX, SAY, sakina, { s: SKR, t, move: snatched && t < sT + 1.2 ? 'scared' : 'idle', mt: t - sT, yaw: .3, expr: snatched ? 'surprised' : 'happy' }, { w: 100 });
  const wob = t > LE('i3') - .3, dd = Math.sin(t * 16);
  g += at(1, cam, -330, FY + 255, susu, { s: SQ, t, flip: 1, armL: wob ? 4 : 25, armR: wob ? 4 : 25, mouth: wob ? 'wobble' : (snatched ? 'o' : 'grin'), brow: wob ? 1 : (snatched ? .8 : 0), look: snatched ? [12, -10] : [14, -6], blink: blink(t), legL: wob ? 16 + 6 * dd : 0, legR: wob ? -16 + 6 * dd : 0, tilt: wob ? 6 * dd : 0 }, { w: 110 });
  // the monkey
  if (M.pose === 'leap' && M.d === 1 && t > 1) { const p = proj(1, cam, M.x, M.y); g += speed(p.x + (M.flip < 0 ? 120 : -120), p.y - 80, M.flip < 0 ? -1 : 1, .5, 3); }
  g += bandarAt(M.d, cam, M.x, M.y, { pose: M.pose, t, flip: M.flip, angry: M.angry || 0, item: M.item || null, rot: M.rot || 0, s: .95, wave: M.wave || 0, look: [-4, 0] }, { w: 0 });
  if (t > LE('s1') - .2 && t < LE('s1') + .9) { const p = proj(1, cam, MP[0], MP[1] - 200); g += burst(p.x, p.y - 60, 100, '#fff', 'KHIII!', 44, 8, 1 - seg(t, LE('s1') + .5, LE('s1') + .9)); }
  if (Math.abs(t - sT) < .35) { const p = proj(1, cam, DFACE[0], DFACE[1]); g += burst(p.x - 200, p.y - 220, 90, C.gold, 'JHAPAT!', 44, -8, 1 - seg(t, sT + .1, sT + .35)); }
  g += S.front;
  g = shake(g, Math.abs(t - sT) < .18 ? .7 : 0, t);
  // Dadi's POV: everything blurry (she can't see without her glasses)
  if (pov > 0) g = `<g filter="url(#dofNear)">${g}</g>` + `<rect width="1080" height="1920" fill="#fff6e0" opacity="${.18 * pov}"/>` + T(540, 560, 70, 'DADI KO SAB DHUNDLA!', { fill: '#fff', shadow: '#000', op: pov });
  if (t > sT + .9 && t < LS('i3') + 1.5) g += hookBig('CHASHMA', 'GAYA!', t, sT + .9, sT + 1.2, 250);
  if (wob) g += T(proj(1, cam, -330, 0).x, 330, 120, '!!', { fill: C.gold, shadow: C.red, op: clamp((t - LE('i3') + .3) * 4) });
  return g + capFor('tease', t);
}

// ============ 4 HOME — Qasim runs down the stairs: "Ammi! Suusuu aayi hai!" → "Phir se?!" + counter; Sakina covers; zip into the WC ============
function E_home(t) {
  const D = sdur('home'), zip = seg(t, LE('k1') + .1, LE('k1') + .75);
  const cam = { x: lerp(-760, 150, ease(seg(t, 0, 2.0))), y: 0, z: 1 + .12 * ease(seg(t, LE('a1'), D)), px: 600 };
  const S = aangan(t, cam, { open: seg(t, LE('k1') + .2, LE('k1') + .35) * (1 - seg(t, LE('k1') + .75, LE('k1') + .9)), noMano: 0, manoSleep: 1 });
  let g = S.back;
  const st = seg(t, 0, .9), fl = ease(seg(t, .9, 1.4));
  let d = 1.3, x = lerp(-560, STAIR.x1, st), y = stairY(lerp(-560, STAIR.x1, st)) + 6 * Math.abs(Math.sin(t * 22));
  if (fl > 0) { d = lerp(1.3, 1.0, fl); x = lerp(STAIR.x1, 500, fl); y = lerp(STAIR.y0, 1235, fl); }
  if (zip > 0) { d = lerp(1.0, 1.3, eout(zip)); x = lerp(500, WC.x + WC.w / 2, eout(zip)); y = lerp(1235, 1080, eout(zip)); }
  const walking = t < 1.4, waiting = t >= 1.4 && zip === 0, dd = Math.sin(t * 16), a1 = on('a1', t), k1 = on('k1', t);
  const ss = seg(t, .6, 1.6), sk2 = ease(seg(t, 1.6, 2.6));
  let sd = 1.3, sx = lerp(-700, STAIR.x1, ss), sy = stairY(sx);
  if (sk2 > 0) { sd = lerp(1.3, 1.15, sk2); sx = lerp(STAIR.x1, 1120, sk2); sy = lerp(STAIR.y0, 1215, sk2); }
  if (t > .6) g += at(sd, cam, sx, sy, sakina, { s: .95, t, move: sk2 < 1 ? 'walk' : (k1 ? 'talk' : 'listen'), mt: t, yaw: sk2 < 1 ? Math.PI / 2 : -.5, expr: k1 ? 'wink' : (a1 ? 'smug' : 'happy'), amp: amp('SAKINA') }, { w: 110 });
  g += at(1, cam, 860, 1250, ammi, { s: SAM, t, phone: 1, look: a1 || t > 1.3 ? [-12, 2] : [0, 12], brow: a1 ? 1 : .3, amp: amp('AMMI'), tilt: zip > 0 ? -10 * seg(zip, 0, .6) : 0, blink: blink(t, 2.6) }, { w: 150 });
  if (zip < 1) g += `<g opacity="${1 - seg(zip, .7, 1)}">` + at(d, cam, x, y, susu, { s: SQ, t, flip: zip > 0 ? -1 : 1, legL: walking || zip > 0 ? walkK(t, 30) : waiting ? 16 + 6 * dd : 0, legR: walking || zip > 0 ? -walkK(t, 30) : waiting ? -16 + 6 * dd : 0, armL: waiting ? 4 : 35, armR: waiting ? 4 : 35, mouth: 'wobble', brow: 1, tilt: waiting ? 6 * dd : 0, look: [10, 0], amp: amp('QASIM'), blink: blink(t) }, { w: 110 }) + '</g>';
  if (walking || (zip > 0 && zip < 1)) { const p = proj(d, cam, x, y); const dir = zip > 0 ? -1 : 1; g += speed(p.x - dir * 30, p.y - 150 * p.s, dir, .7, 4); }
  g += S.front;
  g += tally(5, 'AAJ SUUSUU BREAK:', seg(t, LS('a1') + .2, LS('a1') + .5));
  if (zip > .8) { const p = proj(1.3, cam, WC.x + WC.w / 2, 840); g += burst(p.x, p.y - 20, 110, '#fff', 'DHAP!', 48, 6, 1 - seg(t, LE('k1') + 1.1, LE('k1') + 1.4)); }
  return g + capFor('home', t);
}

// ============ 5 CHASE — the monkey (wearing Dadi's glasses!) runs over the rooftops, through Latifa's books, up the electric pole; Zahra Miss warns ============
function monkeyChase(t) {
  if (t < 1.0) return { x: lerp(MP[0], 1860, t), y: FY + 110, pose: 'run', rot: 0 };
  if (t < 1.4) { const k = seg(t, 1.0, 1.4); return { x: lerp(1860, 2120, k), y: FY + 110 - 160 * Math.sin(k * Math.PI), pose: 'leap', rot: -10 }; }
  if (t < 2.4) return { x: lerp(2120, 2900, seg(t, 1.4, 2.4)), y: FY + 120, pose: 'run', rot: 0 };
  if (t < 2.9) { const k = seg(t, 2.4, 2.9); return { x: lerp(2900, POLE - 30, k), y: lerp(FY + 120, 860, k) - 160 * Math.sin(k * Math.PI), pose: 'leap', rot: -30 }; }
  if (t < 4.6) { const k = ease(seg(t, 2.9, 4.6)); return { x: POLE - 30, y: lerp(860, ARM + 60, k), pose: 'climb', rot: -90 }; }
  if (t < 7.0) return { x: POLE + 70, y: ARM - 6, pose: 'sit', rot: 0 };
  const k = seg(t, 7.0, 7.6); return { x: lerp(POLE + 70, HANGX, k), y: lerp(ARM - 6, wireY(HANGX, 0), k), pose: k < 1 ? 'leap' : 'hang', rot: 0 };
}
function E_chase(t) {
  const D = sdur('chase'), M = monkeyChase(t), wide = ease(seg(t, 2.6, 3.6)), push = ease(seg(t, LS('z2') - .3, LS('z2') + .9));
  let cam = camR(Math.min(M.x, 2800) + 80, .82, 1150, 540, 1180);
  cam = lerpCam(cam, camR(1840, .38, 1180, 540, 1180), wide);
  cam = lerpCam(cam, camR(POLE + 150, 1.02, 960, 540, ARM + 300), push);
  const S = chhatein(t, cam, {});
  let g = S.back;
  const l1 = on('l1', t), z1 = on('z1', t), z2 = on('z2', t, .1, .5), kick = t > 1.75 ? (t - 1.75) / 1.4 : -1;
  g += books(cam, t, kick);
  g += at(1, cam, LX, LY, latifa, { s: SKR, t, move: t < 1.7 ? 'sit' : (l1 ? 'shout' : (t < 4 ? 'holdHead' : 'scared')), mt: t < 1.7 ? 5 : t - 1.7, yaw: .4, expr: t < 1.7 ? 'happy' : (l1 ? 'angry' : 'surprised'), amp: amp('LATIFA') }, { w: 110 });
  if (t < 1.75) g += (() => { const p = proj(1, cam, LX + 60, LY - 260); return kitaab(p.x, p.y, .6 * p.s, -10, '#ffd34a'); })();
  g += at(1, cam, BX + 200, BY, basim, { s: SKR, t, move: t < 2 ? 'run' : 'scared', mt: t, yaw: t < 2 ? Math.PI / 2 : .5, expr: 'surprised' }, { w: 90 });
  g += at(1, cam, ZX, ZY, zahra, { s: SKR, t, move: z1 ? 'point' : (z2 ? 'shout' : 'scared'), mt: t - LS('z1'), yaw: .6, expr: z2 ? 'scared' : 'surprised', amp: amp('ZAHRA MISS') }, { w: 110 });
  g += dadiAt(cam, t, { move: 'sit', expr: 'sad' }, false);
  const pose = M.pose === 'climb' ? 'leap' : M.pose;
  g += bandarAt(1, cam, M.x, M.y, { pose, t, item: M.pose === 'hang' ? 'chashma' : 'wear', s: .95, rot: M.rot, angry: t > 7.0 ? 1 : 0, look: [3, -2] }, { w: M.pose === 'run' ? 70 : 0 });
  if (M.pose === 'run' || M.pose === 'leap') { const p = proj(1, cam, M.x, M.y); if (t < 2.9) g += speed(p.x - 120 * p.s, p.y - 120 * p.s, 1, .5, 3) + dust(p.x - 60 * p.s, p.y, (t * 3) % 1, 4, 30 * p.s); }
  if (t > 5.2) { const fl = t > 7 ? .6 + .4 * Math.abs(Math.sin(t * 9)) : .35 * Math.abs(Math.sin(t * 5)), sp = proj(1, cam, POLE + 110, ARM - 24); g += sparks(sp.x, sp.y, t, fl, 10, 95 * sp.s); }
  if (wide > .5 && push < .5) { const p = proj(1, cam, POLE + 60, ARM - 60); g += marker(p.x, p.y, 70, t, C.red, 'BANDAR!'); const z = proj(1, cam, ZX, ZY - 380); g += marker(z.x, z.y, 60, t, '#457b9d'); }
  g += S.front;
  if (l1) g += hookBig('MERI', 'KITAABEIN!', t, LS('l1'), LS('l1') + .3, 250);
  if (z2) g += hookBig('TAARON PE', 'KHATRA!', t, LS('z2') + .2, LS('z2') + .5, 230);
  g = shake(g, t > 7 && t < 7.3 ? .7 : 0, t);
  return g + capFor('chase', t);
}

// ============ 6 POWER — WC door glows gold (Ammi in the blurred foreground never looks up; Sakina knows), FLUUSH, power bar, SUUU-SUUU-MAN! ============
function E_power(t) {
  const nE = LE('n3'), q = LS('q3'), open = ease(seg(t, q - .45, q - .3)), glow = Math.max(seg(t, .2, nE), open);
  const cam = { x: 270, y: -40, z: lerp(1.0, 1.42, ease(seg(t, 0, q - .4))) + .06 * open, px: 540, py: 900 };
  const S = aangan(t, cam, { open, glow, manoSleep: 1 });
  let g = S.back;
  const dp = proj(1.3, cam, WC.x + WC.w / 2, 840);
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
  if (t > 1.6 && open === 0) { const k = back(seg(t, 1.6, 1.9)), ic = camR(POLE + 160, .62, 640, 820, ARM + 80), sub = chhatein(t, ic, { motes: false, noFG: 1 }), sp = proj(1, ic, POLE + 110, ARM - 24); g += inset(820, 600, 190 * k, sub.back + sparks(sp.x, sp.y, t, .6 + .4 * Math.abs(Math.sin(t * 9)), 9, 60) + bandarAt(1, ic, HANGX, wireY(HANGX, 0), { pose: 'hang', t, item: 'chashma', s: .9, angry: 1 }, { w: 0 }), 'insP'); }
  if (t > q) { const k = back(seg(t, q, q + .3)); g += `<g transform="translate(540,330) scale(${lerp(2.2, 1, clamp(k))}) rotate(-4)" opacity="${clamp(k * 2)}"><rect x="-460" y="40" width="920" height="40" rx="20" fill="${C.red}" transform="skewX(-20)"/>${T(0, 40, 138, 'SUUU-SUUU-MAN!', { shadow: C.red, sw: 12, ls: 2 })}</g>`; }
  return g + capFor('power', t);
}

// ============ 7 RESCUE — Susuman flies over the rooftops (grabs Basim's banana on the way), trades the banana for the glasses,
//   the monkey's tail touches the live wire → slow-mo scoop → sets him down safe on Basim's parapet ============
const HOV = [POLE + 470, ARM + 150];
function E_rescue(t) {
  const D = sdur('rescue'), arrive = 2.2, q5E = LE('q5'), give = q5E + .3, take = q5E + .8, zap = q5E + 1.25, land = LS('l2') - .15, offT = D - 1.0;
  const slow = t > zap && t < zap + 1.0;
  let sx, sy, rot = 0, flip = -1, carry = 0;
  if (t < arrive) { const k = ease(seg(t, 0, arrive)); sx = lerp(-700, HOV[0], k); sy = lerp(330, HOV[1], k) - 120 * Math.sin(k * Math.PI) + (Math.abs(t - 1.0) < .35 ? 420 * Math.cos((t - 1.0) / .35 * Math.PI / 2) : 0); rot = 26 * (1 - seg(t, arrive - .5, arrive)); flip = 1; }
  else if (t < zap) { sx = HOV[0] + 6 * Math.sin(t * 2); sy = HOV[1] + 12 * Math.sin(t * 3); }
  else if (t < land) { const k = ease(seg(t, zap, land)); sx = lerp(HOV[0] - 200, MP[0] + 160, k); sy = lerp(wireY(HANGX, 0) + 160, MP[1] - 120, k) - 260 * Math.sin(k * Math.PI); carry = 1; rot = -14 * Math.sin(k * Math.PI); }
  else { sx = MP[0] + 300; sy = MP[1] - 160 - (t > offT ? 1600 * seg(t, offT, offT + .8) ** 2 : 0) + 10 * Math.sin(t * 3); }
  let cam = camR(Math.max(sx, -300) + 120, .72, 980, 540, 760);
  cam = lerpCam(cam, camR(POLE + 330, 1.04, 1000, 540, ARM + 200), ease(seg(t, arrive - .6, arrive + .3)));
  cam = lerpCam(cam, camR(lerp(POLE + 300, MP[0] + 200, ease(seg(t, zap, land))), lerp(1.04, .9, ease(seg(t, zap, land))), lerp(1000, 1000, 0), 540, lerp(ARM + 200, 700, ease(seg(t, zap, land)))), ease(seg(t, zap - .1, zap + .4)));
  cam = lerpCam(cam, camR(1500, .5, 1100, 540, 1050), ease(seg(t, LS('l2') - .2, LS('l2') + 1.2)));
  const S = chhatein(t, cam, {});
  let g = S.back;
  const grab = t > 1.0;
  g += at(1, cam, BX, BY, basim, { s: SKR, t, move: t > LS('l2') ? 'celebrate' : (grab && t < 2.4 ? 'surprised' : 'idle'), mt: t, yaw: .5, expr: grab ? 'surprised' : 'happy' }, { w: 90 });
  if (!grab) g += bananaIn(1, cam, BX + 70, BY - 330, .5, 30);
  if (grab && t < 2.0) { const p = proj(1, cam, BX, BY - 520); g += T(p.x, p.y, 120 * p.s, '?!', { fill: C.gold, shadow: '#000' }); }
  g += at(1, cam, LX, LY, latifa, { s: SKR, t, move: on('l2', t) ? 'point' : (t > LE('l2') ? 'clap' : 'scared'), mt: t - LS('l2'), yaw: -.5, expr: t > LS('l2') - .2 ? 'happy' : 'surprised', amp: amp('LATIFA') }, { w: 110 });
  g += at(1, cam, ZX, ZY, zahra, { s: SKR, t, move: on('z3', t) ? 'talk' : (t > land ? 'clap' : 'scared'), mt: t, yaw: .6, expr: t > land ? 'happy' : 'scared', amp: amp('ZAHRA MISS') }, { w: 110 });
  g += dadiAt(cam, t, { move: 'sit', expr: 'sad' }, false);
  const sp = proj(1, cam, POLE + 110, ARM - 24);
  if (t < zap + .05) {
    g += bandarAt(1, cam, HANGX, wireY(HANGX, 0), { pose: 'hang', t: slow ? zap : t, item: t < give ? 'chashma' : (t > take ? 'kela' : null), s: .9, angry: t < LS('q5') + .6 ? 1 : 0, look: [-6, 2] }, { w: 0 });
    g += sparks(sp.x, sp.y, t, t < arrive ? .7 : .3 + .3 * Math.abs(Math.sin(t * 7)), 9, 90 * sp.s);
  } else if (t >= land) {
    g += bandarAt(1, cam, MP[0], MP[1], { pose: 'sit', t, item: 'kela', chew: t > land + .4 ? 1 : 0, peel: 1, s: .78, flip: 1, look: [6, -2] }, { w: 0 });
  }
  if (Math.abs(t - zap) < .6) g += sparks(sp.x + 60 * sp.s, sp.y + 50 * sp.s, t, 1.4 - Math.abs(t - zap) * 2, 14, 170 * sp.s) + `<rect width="1080" height="1920" fill="#dff6ff" opacity="${.5 * (1 - seg(Math.abs(t - zap), 0, .25))}"/>`;
  // Susuman (world point = his chest area; feet are 300*sc lower)
  const P = proj(1, cam, sx, sy), sc = .62 * P.s;
  if (t >= land && t < offT + .3) g += liftShadow(P.x - 20, proj(1, cam, sx, MP[1] + 10).y, 100 * P.s, 160 * (1 - seg(t, offT, offT + .4)), { dx: -30, skew: 35 });
  const holdBan = t > 1.0 && t < take, holdG = t > give;
  const armR = t < arrive ? 160 : (holdBan || carry ? 110 : 40);
  g += susu({ x: P.x, y: P.y + 300 * sc, s: sc, t, rot, flip, power: .9, cape: 1, crown: 1, shades: 1, armL: t < arrive ? 175 : (carry ? 120 : 30), armR, mouth: on('q5', t) ? 'talk' : (slow ? 'frown' : 'grin'), amp: amp('QASIM'), wink: t > offT - .7 && t < offT - .2 ? 1 : 0, blink: blink(t, 3), legL: t < arrive || carry ? -18 : -6, legR: t < arrive || carry ? 14 : 8, tilt: slow ? -8 : 0 });
  { const h = susHand(P.x, P.y + 300 * sc, sc, armR, 1, flip); if (holdBan) g += kela(h[0] + 10 * flip, h[1] - 10, 1.1 * sc, flip * -40); if (holdG && !carry) g += chashma(h[0], h[1] - 6, .9 * sc, 0, t > land && t < land + .6 ? 1 : 0); if (carry) g += bandar({ x: h[0] - 40 * flip, y: h[1] + 110 * sc, s: 1.1 * sc, pose: 'sit', t, flip: -flip, item: 'kela', look: [6, -6] }) + chashma(h[0] + 60 * flip, h[1] - 150 * sc, .8 * sc, 10); }
  if (t < arrive) g += speed(P.x - 140, P.y + 120 * sc, 1, .8, 6);
  if (t > offT) g += `<path d="M${P.x},${P.y + 600 * sc} L${P.x},${P.y + 600 * sc + 600}" stroke="${C.gold}" stroke-width="40" opacity="${.5 * (1 - seg(t, offT + .4, D))}" stroke-linecap="round"/>`;
  g += S.front;
  if (slow) g += vig(.75) + T(540, 300, 92, 'DHEERE... DHEERE...', { fill: C.gold, shadow: '#000', op: clamp((t - zap) * 4) * (1 - seg(t, zap + .7, zap + 1.0)) });
  if (t > give - .1 && t < zap - .1) g += `<g transform="translate(540,280) scale(${back(seg(t, give - .1, give + .2))})">${T(0, 0, 86, 'KELA DO...', { fill: '#ffd23a', shadow: '#000' })}${T(0, 100, 86, 'CHASHMA LO!', { fill: '#fff', shadow: C.red })}</g>`;
  if (Math.abs(t - zap) < .5) g += `<g transform="translate(540,640) scale(${back(seg(t, zap, zap + .2))})">${burst(0, 0, 210, '#7fd8ff', 'CHHZZT!', 80, -6, 1 - seg(t, zap + .3, zap + .5))}</g>`;
  if (t > land && t < LS('z3')) g += `<g transform="translate(540,330) scale(${back(seg(t, land, land + .3))})">${burst(0, 0, 230, C.gold, 'BACH GAYA!', 84, -6, 1 - seg(t, LS('z3') - .3, LS('z3')))}</g>`;
  g = shake(g, Math.abs(t - zap) < .2 ? 1 : 0, t);
  return g + capFor('rescue', t);
}

// ============ 8 LESSON — Susuman lands in front of Dadi (her POV is blurry!), puts her glasses back on — and he's gone.
//   Basim says sorry with a whole banana; Zahra Miss's lesson; Qasim strolls out of the mumty, Sakina winks ============
function E_lesson(t) {
  const D = sdur('lesson'), put = LS('i5') + 1.5, gone = put + .35, i5 = on('i5', t), s2 = on('s2', t), z4 = on('z4', t);
  const pov = (t > .5 && t < put) ? 1 : 0;
  let cam = camR(DX + 140, 1.12, 1150, 540, 1130);
  cam = lerpCam(cam, camR(DX + 260, .95, 1150, 540, 1170), ease(seg(t, gone, gone + .8)));
  cam = lerpCam(cam, camR(900, .82, 1150, 540, 1180), ease(seg(t, LS('s2') - .5, LS('s2') + .6)));
  cam = lerpCam(cam, camR(420, .78, 1150, 540, 1180), ease(seg(t, LS('z4') - .5, LS('z4') + .8)));
  cam = lerpCam(cam, camR(380, .9, 1150, 540, 1170), ease(seg(t, LE('z4') - 1.5, D)));
  const S = chhatein(t, cam, {});
  let g = S.back;
  const hasG = t > put;
  g += dadiAt(cam, t, { move: 'sit', expr: t < put ? 'thinking' : (i5 ? 'surprised' : 'happy'), amp: amp('DADI') }, hasG);
  g += at(1, cam, SAX, SAY, sakina, { s: SKR, t, move: t > gone && t < gone + 1.6 ? 'thumbsUp' : (z4 ? 'listen' : 'idle'), mt: t - gone, yaw: -.3, expr: t > gone && t < gone + 1.6 ? 'wink' : 'smug' }, { w: 100 });
  g += at(1, cam, ZX, ZY, zahra, { s: SKR, t, move: z4 ? 'talk' : 'idle', mt: t, yaw: -.4, expr: 'happy', amp: amp('ZAHRA MISS') }, { w: 110 });
  g += at(1, cam, BX + 60, BY, basim, { s: SKR, t, move: s2 ? 'present' : (t > LE('s2') ? 'wave' : 'idle'), mt: t, yaw: .5, expr: 'happy', amp: amp('BASIM') }, { w: 90 });
  const gv = seg(t, LS('s2') + 1.2, LS('s2') + 1.9);
  if (gv < 1) g += bananaIn(1, cam, lerp(BX + 150, MP[0] - 30, gv), lerp(BY - 330, MP[1] - 120, gv) - 60 * Math.sin(gv * Math.PI), .5, 30);
  g += bandarAt(1, cam, MP[0], MP[1], { pose: 'sit', t, item: 'kela', peel: gv >= 1 ? 1 : 0, chew: gv >= 1 ? 1 : 0, s: .78, flip: -1, wave: s2 && gv < 1 ? .6 : 0, look: [-6, -2] }, { w: 0 });
  if (gv >= 1 && t < LE('s2') + 1) for (let i = 0; i < 3; i++) { const p = ((t - LS('s2')) * .7 + i / 3) % 1, q = proj(1, cam, MP[0] - 40 + i * 40, MP[1] - 260 - p * 140); g += heart(q.x, q.y, .5 * q.s, 1 - p); }
  const qo = ease(seg(t, LS('z4') + .5, LS('z4') + 2.6)), dX = MUM5.door + 95;
  if (t > LS('z4') + .3) g += at(1, cam, lerp(dX, 120, qo), lerp(FY + 30, FY + 255, qo), susu, { s: SQ, t, legL: qo < 1 ? walkK(t, 26) : 0, legR: qo < 1 ? -walkK(t, 26) : 0, armL: 25, armR: 25, mouth: t > LE('z4') - .6 ? 'smirk' : 'grin', wink: t > LE('z4') - .2 && t < LE('z4') + .4 ? 1 : 0, look: [12, -8], blink: blink(t, 2.6), flip: 1 }, { w: 110 });
  if (t < gone + .2) {
    const ld = eout(seg(t, 0, .5)), P = proj(1, cam, DX + 230, lerp(FY - 600, FY + 245, ld)), sc = .62 * P.s;
    const op = 1 - seg(t, gone - .05, gone + .15), armR = lerp(60, 120, seg(t, put - .8, put));
    const h = susHand(P.x, P.y, sc, armR, 1, -1), fp = proj(1, cam, DFACE[0], DFACE[1]), gk = seg(t, put - .6, put);
    g += `<g opacity="${op}">` + shadow(P.x - 20, proj(1, cam, DX + 230, FY + 245).y, 100 * P.s, .8 * ld, { dx: -30, skew: 35 }) + susu({ x: P.x, y: P.y, s: sc, t, power: .9, cape: 1, crown: 1, shades: 1, flip: -1, armL: 30, armR, mouth: 'grin', blink: blink(t, 3) }) + (t < put ? chashma(lerp(h[0], fp.x, gk), lerp(h[1], fp.y, gk), .5 * P.s, 0) : '') + '</g>';
    if (t > gone - .1) { const p = proj(1, cam, DX + 230, FY - 200); g += `<path d="M${p.x},${p.y + 300} L${p.x + 200},${p.y - 1600}" stroke="${C.gold}" stroke-width="44" opacity="${.6 * (1 - seg(t, gone, gone + .6))}" stroke-linecap="round"/>`; for (let i = 0; i < 8; i++) g += `<circle cx="${p.x + hs(i) * 160 - 40}" cy="${p.y + 200 - hs(i + 4) * 400 - (t - gone) * 300}" r="${8 + 6 * hs(i + 2)}" fill="${C.gold}" opacity="${1 - seg(t, gone, gone + 1)}"/>`; }
  }
  g += S.front;
  if (pov) g = `<g filter="url(#dofNear)">${g}</g><rect width="1080" height="1920" fill="#fff6e0" opacity=".16"/>` + T(540, 560, 64, 'DADI KI NAZAR SE...', { fill: '#fff', shadow: '#000' });
  if (t > put && t < put + .5) { const p = proj(1, cam, DFACE[0], DFACE[1]); g += burst(p.x, p.y, 90, '#fff', 'TING!', 40, 6, 1 - seg(t, put + .2, put + .5)); }
  if (t > gone && t < LS('s2') - .3) g += T(540, 330, 96, 'WOH KAHAN GAYA?', { fill: C.gold, shadow: '#000', op: clamp((t - gone) * 3) });
  if (z4) g += hookBig('JANWARON KO', 'TANG MAT KARO!', t, LS('z4') + .2, LS('z4') + .6, 250).replace('font-size="124"', 'font-size="108"');
  return g + capFor('lesson', t);
}

// ============ 9 TV — evening; the family TV: Daniel + Amara report the "mystery hero"; Dada Abu is proud; Dadi (glasses back) on the charpai; Qasim and Sakina share a wink ============
const TVP = { x: 330, y: 1250, w: 330, h: 230 };
function tvNews(t, w, h) {
  let g = `<rect width="${w}" height="${h}" fill="#123a6b"/><rect y="${h * .55}" width="${w}" height="${h * .45}" fill="#0b2a52"/>`;
  for (let i = 0; i < 6; i++) g += `<circle cx="${w * (.1 + i * .17)}" cy="${h * .25}" r="${h * .05}" fill="#fff" opacity=".12"/>`;
  g += `<rect x="${w * .58}" y="${h * .1}" width="${w * .36}" height="${h * .36}" fill="#bfe3f6" stroke="#fff" stroke-width="3"/><rect x="${w * .66}" y="${h * .14}" width="${w * .02}" height="${h * .32}" fill="#777"/><path d="M${w * .58},${h * .2} Q${w * .76},${h * .27} ${w * .94},${h * .19}" stroke="#222" stroke-width="2" fill="none"/><circle cx="${w * .8}" cy="${h * .28}" r="${h * .035}" fill="#9a7350"/><circle cx="${w * .86 + 4 * Math.sin(t * 9)}" cy="${h * .3}" r="${h * .045}" fill="${C.gold}" filter="url(#glow)"/>`;
  g += daniel({ x: w * .2, y: h * .99, s: .24, t, move: on('v1', t) ? 'present' : 'idle', mt: t, yaw: .2, expr: 'happy', amp: amp('DANIEL') }) + amara({ x: w * .43, y: h * .99, s: .24, t, move: on('v2', t) ? 'talk' : 'listen', mt: t, yaw: -.2, expr: 'happy', amp: amp('AMARA') });
  g += `<rect y="${h * .78}" width="${w}" height="${h * .12}" fill="#c8102e"/>${T(w * .03, h * .87, h * .085, 'BREAKING NEWS', { anchor: 'start', sw: 0, ls: 1 })}`;
  const msg = 'MYSTERY HERO NE BANDAR KO BACHAYA!  ·  DADI KA CHASHMA WAPAS!  ·  ';
  g += `<rect y="${h * .9}" width="${w}" height="${h * .1}" fill="#fff"/><clipPath id="tk"><rect y="${h * .9}" width="${w}" height="${h * .1}"/></clipPath><g clip-path="url(#tk)">${T(w - ((t * 60) % (w * 2.6)), h * .975, h * .07, msg + msg, { anchor: 'start', fill: '#111', sw: 0, ls: 1, font: 'Baloo2', weight: 800 })}</g>`;
  return g;
}
function tvSet(t) {
  const { x, y, w, h } = TVP;
  return castShadow(x, y + 8, 220, 110, .25) + `<rect x="${x - 100}" y="${y - 120}" width="200" height="120" fill="#8a5a32" stroke="${C.ink}" stroke-width="5"/><rect x="${x - w / 2 - 14}" y="${y - 134 - h - 14}" width="${w + 28}" height="${h + 28}" rx="16" fill="#222" stroke="${C.ink}" stroke-width="6"/>
    <g transform="translate(${x - w / 2},${y - 134 - h})">${tvNews(t, w, h)}</g><rect x="${x - w / 2}" y="${y - 134 - h}" width="${w}" height="${h}" fill="url(#poolW)" opacity=".18"/>`;
}
function E_tv(t) {
  const D = sdur('tv'), pull = ease(seg(t, LE('v1') - .6, LS('d1') - .2));
  const sc = { x: TVP.x, y: TVP.y - 134 - TVP.h / 2 };
  let cam = { x: sc.x - 540, y: sc.y - 760, z: 3.0, px: 540, py: 760 };
  cam = lerpCam(cam, { x: 200, y: 0, z: 1.0, px: 600, py: 960 }, pull);
  cam = lerpCam(cam, { x: 250, y: 30, z: 1.12, px: 700, py: 1000 }, ease(seg(t, LS('d1'), D)));
  const S = aangan(t, cam, { eve: 1, noMano: 0, manoSleep: 1 });
  let g = S.back;
  g += layer(1, cam, tvSet(t) + lightPool(TVP.x, TVP.y + 20, 360, 90, .55, 'poolW'), { f: '' });
  const d1 = on('d1', t), wk = t > LE('d1') - .3;
  g += at(1.02, cam, 1150, 1150, dadaAbu, { s: .95, t, move: 'sit', mt: 5, k: 1, yaw: -.5, expr: d1 ? 'happy' : 'surprised', amp: amp('DADA ABU') }, { w: 0 });
  g += at(1.02, cam, 1420, 1150, dadi, { s: .95, t, move: 'sit', mt: 5, k: 1, yaw: -.6, expr: wk ? 'love' : 'happy' }, { w: 0 });
  g += at(1.06, cam, 820, 1225, sakina, { s: .95, t, move: wk ? 'thumbsUp' : 'idle', mt: t - LE('d1') + .3, yaw: wk ? -.5 : -.6, expr: wk ? 'wink' : 'smug' }, { w: 100 });
  g += at(1, cam, 640, 1250, susu, { s: SQ, t, flip: -1, armL: 25, armR: 25, mouth: wk ? 'smirk' : 'frown', wink: t > LE('d1') && t < LE('d1') + .5 ? 1 : 0, look: wk ? [14, -4] : [-14, -6], blink: blink(t, 2.8) }, { w: 110 });
  g += S.front;
  if (t < LE('v2') + .2 && pull < .5) g += hookBig('MYSTERY', 'HERO KAUN?', t, LS('v1') + 1.0, LS('v1') + 1.4, 250);
  if (wk) g += T(540, 330, 90, 'SHHH... RAAZ!', { fill: C.gold, shadow: '#000', op: clamp((t - LE('d1') + .3) * 3) });
  return g + capFor('tv', t);
}

// ============ 10 ENDING — "Ammiii! Suusuu aayi hai!" → "Itni moongphali kyun khaayi?!" → Sakina covers → "Kuch nahi Ammi!" + wink, zip ============
function shells(x, y, s) { let g = `<g transform="translate(${x},${y}) scale(${s})">`; for (let i = 0; i < 22; i++) { const a = hs(i + 700) * 6.28, r = hs(i + 720) * 120, cx = (Math.cos(a) * r).toFixed(0), cy = (Math.sin(a) * r * .4 - (i % 4) * 10).toFixed(0); g += `<ellipse cx="${cx}" cy="${cy}" rx="18" ry="10" fill="#c98f52" stroke="${C.ink}" stroke-width="3" transform="rotate(${(a * 60).toFixed(0)} ${cx} ${cy})"/>`; } return g + '</g>'; }
function E_ending(t) {
  const D = sdur('ending'), zip = seg(t, LE('q6') + .25, LE('q6') + .9), cz = ease(seg(t, LS('a2') + .4, LS('a2') + 1.2)) * (1 - ease(seg(t, LE('q6') + .1, LE('q6') + .6)));
  let x = 640, y = 1250, d = 1;
  const jump = ease(seg(t, .2, .8)); x = lerp(640, 560, jump);
  if (zip > 0) { d = lerp(1.0, 1.3, eout(zip)); x = lerp(560, WC.x + WC.w / 2, eout(zip)); y = lerp(1250, 1080, eout(zip)); }
  let cam = { x: 200, y: 0, z: 1, px: 600 };
  cam = lerpCam(cam, { x: 660 - 540, y: 1250 - 600 * SQ - 760, z: 1.45, px: 540, py: 760 }, cz);
  const S = aangan(t, cam, { eve: 1, open: seg(t, LE('q6') + .3, LE('q6') + .45) * (1 - seg(t, LE('q6') + .85, LE('q6') + 1.0)), manoWide: on('a2', t, 0, .5) ? 1 : 0, manoMeow: on('q6', t) ? .6 : 0 });
  let g = S.back + layer(1, cam, tvSet(t + 20) + lightPool(TVP.x, TVP.y + 20, 360, 90, .5, 'poolW') + shells(480, 1310, .8), { f: '' });
  const q4 = on('q4', t, .1, .3), a2 = on('a2', t), k2 = on('k2', t), q6 = on('q6', t, .1, .3), dd = Math.sin(t * 16);
  g += at(1.02, cam, 1250, 1150, dadaAbu, { s: .95, t, move: 'sit', mt: 5, k: 1, yaw: -.5, expr: q4 ? 'laugh' : 'happy' }, { w: 0 });
  g += at(1.02, cam, 1500, 1150, dadi, { s: .95, t, move: 'sit', mt: 5, k: 1, yaw: -.6, expr: a2 ? 'laugh' : 'happy' }, { w: 0 });
  g += at(1.06, cam, 760, 1225, sakina, { s: .95, t, move: k2 ? 'talk' : 'idle', mt: t, yaw: .3, expr: t > LE('k2') - .3 ? 'wink' : (a2 ? 'surprised' : 'smug'), amp: amp('SAKINA') }, { w: 100 });
  g += at(1.0, cam, 960, 1255, ammi, { s: SAM, t, phone: a2 ? 0 : 1, look: a2 ? [-14, -6] : [-12, 2], brow: a2 ? 1 : .4, amp: amp('AMMI'), blink: blink(t, 2.6), tilt: a2 ? -6 : 0 }, { w: 140 });
  if (zip < 1) g += `<g opacity="${1 - seg(zip, .7, 1)}">` + at(d, cam, x, y, susu, { s: SQ, t, flip: -1, legL: zip > 0 ? walkK(t, 30) : (q4 || a2 ? 16 + 6 * dd : 0), legR: zip > 0 ? -walkK(t, 30) : (q4 || a2 ? -16 + 6 * dd : 0), armL: q6 ? 20 : 4, armR: q6 ? 150 : 4, mouth: q6 ? 'grin' : (q4 ? 'wobble' : 'o'), amp: amp('QASIM'), brow: q4 ? 1 : (a2 ? .7 : 0), wink: t > LE('q6') - .4 && t < LE('q6') + .2 ? 1 : 0, tilt: q4 ? 6 * dd : 0, look: a2 ? [6, -14] : [-10, 0], blink: blink(t) }, { w: 110 }) + '</g>';
  if (zip > 0 && zip < 1) { const p = proj(d, cam, x, y); g += speed(p.x + 30, p.y - 150 * p.s, -1, .7, 4); }
  if (cz > .6 && a2) g += `<g transform="translate(250,560) scale(${back(seg(t, LS('a2') + .6, LS('a2') + .9))})">${moongPlate(0, 90, .8)}${T(0, -110, 70, 'MOONGPHALI?!', { fill: '#fff', shadow: C.red })}</g>`;
  g += S.front;
  g += tally(6, 'AAJ SUUSUU BREAK:', seg(t, LE('q6') + .6, LE('q6') + .9));
  return g + capFor('ending', t);
}

// ============ 11 END CARD — layered: brush sky (far) / kites (mid) / Susuman + Bandar Mama with his banana (hero plane) / sparkles (near) ============
function E_endcard(t) {
  const cam = { x: 30 * Math.sin(t * .4), y: 0, z: 1 + .06 * t / sdur('endcard') };
  let g = layer(4, cam, brushBg(t + 90), { f: '' });
  g += kiteField(t, cam, 2.2, 6, 180, 900, .6, 41, -100, 1150);
  g += layer(1.3, cam, shadow(800, 1235, 120, .7) + bandar({ x: 800, y: 1230, s: .95, pose: 'sit', t, item: 'kela', peel: 1, chew: 1, flip: -1, look: [-6, -4] }), { f: '' });
  g += layer(1, cam, shadow(440, 1255, 200, .8) + lightPool(440, 1250, 380, 70, .8) + susu({ x: 440, y: 1250, s: .85, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 40, armR: 150, mouth: 'grin', blink: blink(t, 2.6) })
    + (() => { const h = susHand(440, 1250, .85, 150); return chashma(h[0], h[1] - 30, .7, -8, Math.max(0, Math.sin(t * 2))); })(), { f: '' });
  let sp = ''; for (let i = 0; i < 9; i++) { const x = ((i * 157 + t * 60) % 1300) - 110, y = 200 + (i * 211) % 1500; sp += `<path d="M${x},${y - 40} L${x + 10},${y} L${x},${y + 40} L${x - 10},${y}Z M${x - 40},${y} L${x},${y - 10} L${x + 40},${y} L${x},${y + 10}Z" fill="${C.gold}" opacity=".8"/>`; }
  g += layer(.6, cam, sp);
  const n = L('n4'), half = LS('n4') + n.d * .5;
  if (t < half + .2) { g += `<g transform="translate(540,290) scale(${back(seg(t, .2, .5))})">${T(0, 0, 96, 'JANWARON KO', { shadow: '#000' })}</g><g transform="translate(540,410) scale(${back(seg(t, .5, .8))}) rotate(-3)">${T(0, 0, 104, 'TANG MAT KARO!', { fill: C.gold, shadow: C.red })}</g>`; }
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

const EP = { hook: E_hook, intro: E_intro, tease: E_tease, home: E_home, chase: E_chase, power: E_power, rescue: E_rescue, lesson: E_lesson, tv: E_tv, ending: E_ending, endcard: E_endcard };
const HAZE = id => (id === 'tv' || id === 'ending') ? '#ffd9b0' : '#d6e9f6';
window.drawFrame = (id, t) => {
  const s = TL.scenes.find(x => x.id === id); ABS = s.start + t;
  document.getElementById('s').innerHTML = defs() + skyDefs + skyDefs2 + depthDefs(HAZE(id)) + EP[id](t);
};
window.drawCast = () => {
  const lab = (x, y, s) => T(x, y, 34, s, { fill: '#555', sw: 0, font: 'Baloo2', weight: 800 });
  let g = `<rect width="1080" height="1920" fill="#f3ead9"/>` + T(540, 100, 76, 'SUSUMAN EP 5 — NEW CAST + PROPS', { fill: C.ink, sw: 0 });
  g += T(540, 200, 52, 'BANDAR MAMA (the gali monkey)', { fill: '#6e4f35', sw: 0 }) + bandar({ x: 260, y: 600, s: 1.3, pose: 'sit', t: 0, look: [4, -2] }) + bandar({ x: 760, y: 600, s: 1.15, pose: 'sit', t: .3, angry: 1, flip: -1 });
  g += lab(270, 680, 'sit') + lab(760, 680, 'angry (screech)');
  g += bandar({ x: 230, y: 990, s: 1.05, pose: 'run', t: .2 }) + bandar({ x: 610, y: 990, s: 1.0, pose: 'leap', t: 0 }) + bandar({ x: 900, y: 720, s: .95, pose: 'hang', t: 0, item: 'chashma' });
  g += lab(230, 1050, 'run') + lab(600, 1050, 'leap') + lab(900, 1050, 'hang');
  g += T(540, 1150, 44, "CHASHMA · KELA · MOONGPHALI · KITAAB", { fill: C.ink, sw: 0 }) + chashma(180, 1270, 1.3, 0, 1) + kela(400, 1320, 1.0, 10) + kela(530, 1320, 1.0, -10, 1) + moongPlate(760, 1360, 1.1) + kitaab(960, 1300, .9, -8, '#3b8de5');
  g += T(300, 1420, 44, 'DADI (NO GLASSES)', { fill: '#6b4f8f', sw: 0 }) + sk({ key: 'dadiNoG', x: 300, y: 1900, s: .7, t: 0, move: 'scared', mt: .3, yaw: .3, expr: 'surprised' });
  g += T(780, 1460, 44, 'POLE + TRANSFORMER', { fill: '#555', sw: 0 }) + `<svg x="560" y="1480" width="440" height="430" viewBox="${POLE - 220} 230 440 430">${pole(POLE, { trafo: 1 })}</svg>`;
  document.getElementById('s').innerHTML = defs() + skyDefs + skyDefs2 + depthDefs() + g;
};

// =================== 16:9 version (same scenes framed for 1920x1080; captions redrawn) ===================
let WIDE = false, CAPW = null;
const _cap2 = caption2;
caption2 = (txt, who, op) => { if (WIDE) { CAPW = [txt, who, op]; return ''; } return _cap2(txt, who, op); };
const VIEWW = { home: [.85, 200], power: [.8, 120], tv: [.85, 200], ending: [.85, 200], endcard: [.7, 200], hook: [.8, 110], chase: [.85, 160], rescue: [.85, 160] };
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
  svg.innerHTML = defs() + skyDefs + skyDefs2 + depthDefsW(HAZE(id)) + `<g transform="translate(960,0) scale(${S}) translate(-540,${-Y0})">${bg}${body}</g>` + (CAPW ? captionW(...CAPW) : '');
  WIDE = false;
};
