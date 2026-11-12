// Episode 1 scenes. Each takes local time t; dialogue times come from TL (timeline.js).
const LS = id => L(id).s, LE = id => L(id).s + L(id).d;
const sdur = id => TL.scenes.find(s => s.id === id).dur;
function rewindFx(u, k) {
  let g = `<rect width="1080" height="1920" fill="#1b2a6b" opacity="${.25 * k}"/>`;
  for (let y = (u * 900) % 24; y < 1920; y += 24) g += `<rect x="0" y="${y}" width="1080" height="6" fill="#fff" opacity=".07"/>`;
  g += `<rect x="0" y="${(u * 1400) % 1920}" width="1080" height="40" fill="#fff" opacity=".12"/>`;
  g += `<g transform="translate(90,560)" opacity="${clamp(k * 3)}"><path d="M0,0 l-60,40 l60,40z M70,0 l-60,40 l60,40z" fill="#fff" stroke="#000" stroke-width="5"/></g>`;
  g += `<g transform="translate(540,720) scale(${back(seg(u, .2, .5))})">${T(0, 0, 104, '15 MINUTE PEHLE...', { shadow: '#000' })}</g>`;
  return g;
}
function inset(cx, cy, r, content, id) {
  return `<clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><g clip-path="url(#${id})">${content}</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-width="10"/><circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="none" stroke="${C.ink}" stroke-width="4"/>`;
}

// 1 HOOK — flash-forward, then rewind
function E_hook(t) {
  const nE = LE('n1') + .3;
  const tt = t < nE ? t : Math.max(0, nE - (t - nE) * 2.4);
  const rw = seg(t, nE, nE + .5);
  const camX = 1560, P = seg(tt, 0, nE);
  const tip = { x: 1950 - camX, y: 560 };
  const fall = ease(P);
  let sc = gali(camX, tt * .35, { snap: 1, fallY: fall * 520 });
  sc += fallingLeaves(tt * .4, 200, 420, 9);
  sc += cat({ x: tip.x + 40, y: lerp(tip.y + 30, 820, fall), s: .55 * KS, pose: 'fall', rot: 25 * Math.sin(tt * 2.2), t: tt, meow: .5 + .5 * Math.sin(tt * 9), wide: 1 });
  sc += speed(lerp(-60, 300, eout(P)) - 40, lerp(1500, 1060, eout(P)) - 150, 1, .5);
  sc += susu({ x: lerp(-60, 300, eout(P)), y: lerp(1500, 1060, eout(P)), s: .62, rot: 38, t: tt, power: .9, cape: 1, crown: 1, shades: 1, armL: 175, armR: 160, legL: -20, legR: 14, mouth: 'shout', brow: .2 });
  let g = zoom(sc, 400, 820, lerp(1.3, 1.12, P));
  g += `<rect width="1080" height="1920" fill="url(#vig)" opacity="${t < nE ? .9 : .4}"/>`;
  if (t < nE) g += hookBig('4 SAAL KA HERO...', 'BILLI BACHEGI?!', t, .2, 1.9);
  if (t > nE) g += rewindFx(t - nE, rw);
  const fl = seg(t, sdur('hook') - .25, sdur('hook')); if (fl > 0) g += `<rect width="1080" height="1920" fill="#fff" opacity="${fl}"/>`;
  return g + capFor('hook', t);
}
// 2 INTRO — pan across the gali, Bunty smashes Guddu's ball
function E_intro(t) {
  const camX = lerp(1720, 260, ease(seg(t, 0, 4.6))) + 8 * Math.sin(t * .7);
  let sc = gali(camX, t);
  const b0 = 4.9, rel = b0 + 1.0, hit = rel + .55;
  const gx = lerp(1180, 1010, seg(t, b0, rel)) - camX, run = t > b0 && t < rel;
  const wind = t < b0 ? 0 : t < rel ? lerp(0, 300, seg(t, rel - .45, rel)) : lerp(300, 380, seg(t, rel, rel + .3));
  const swing = t < hit - .12 ? lerp(20, -40, seg(t, rel, hit - .15)) : lerp(-40, 175, eout(seg(t, hit - .12, hit + .12)));
  sc += bunty({ x: 620 - camX, y: 1215, t, batR: 1, armR: swing, armL: lerp(15, 60, seg(t, hit - .1, hit + .2)), look: [10, t > hit ? -10 : 0], mouth: t > hit + .1 ? 'laugh' : 'flat', blink: blink(t), tilt: t > hit ? -6 : 0 });
  sc += guddu({ x: gx, y: 1190, t, armR: wind, armL: 20, legL: run ? walkPh(t) : 0, legR: run ? -walkPh(t) : 0, look: t > hit ? [6, -14] : [-10, 0], mouth: t > hit ? 'o' : 'flat', blink: blink(t, 3.1), flip: 1 });
  // ball
  if (t > rel - .05 && t < hit) { const k = seg(t, rel, hit), bx = lerp(gx + 50, 690 - camX, k), by = k < .6 ? lerp(800, 1190, k / .6) : lerp(1190, 1020, (k - .6) / .4); sc += ball(bx, by, 16, t * 900); }
  if (t >= hit) { const k = seg(t, hit, hit + 1.0); sc += ball(lerp(690 - camX, 1150, k), lerp(1020, -120, eout(k)), lerp(16, 26, k), t * 1400); if (k < 1) sc += `<path d="M${lerp(690 - camX, 1150, k) - 30},${lerp(1020, -120, eout(k)) + 40} l-120,110" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".7"/>`; }
  sc = zoom(sc, 540, 1300, lerp(.5, 1, ease(seg(t, .6, 4.8))));
  let g = shake(sc, t > hit && t < hit + .25 ? 1 - seg(t, hit, hit + .25) : 0, t);
  if (t > hit && t < hit + 1.1) g += burst(560, 820, 170, '#fff', 'THWACK!', 70, -8, 1 - seg(t, hit + .8, hit + 1.1));
  if (t < 4.2) g += hookBig('GALI CRICKET', 'BADA MATCH!', t, .3, .9, 230);
  return g + capFor('intro', t);
}
// 3 ASK — Qasim wants to bat, gets sent to fielding
function E_ask(t) {
  const camX = 260;
  let sc = gali(camX, t + 9);
  const run = eout(seg(t, 0, 1.4)), qx = lerp(-160, 560, run), running = t < 1.4;
  const q1 = t > LS('q1') && t < LE('q1');
  const b1 = t > LS('b1') - .1 && t < LE('b1') + .2, g1 = t > LS('g1') - .1;
  sc += guddu({ x: 1000 - camX + 0, y: 1190, t, armR: 25, armL: 20, mouth: g1 && amp('GUDDU') < .04 ? 'laugh' : 'flat', amp: amp('GUDDU'), squash: g1 ? 1 + .03 * Math.sin(t * 28) : 1, look: [-12, 6], blink: blink(t, 3) });
  sc += ball(1000 - camX + 62, 1190 - 410 * .58 + 150 * .58 + 10, 15);
  sc += bunty({ x: 620 - camX, y: 1215, t, batR: 1, armR: 15, armL: b1 ? 55 + 8 * Math.sin(t * 9) : 10, tilt: b1 ? -10 : 0, amp: amp('BUNTY'), look: [10, 10], brow: b1 ? 0 : .3, blink: blink(t, 2.8) });
  const bounce = q1 ? Math.abs(Math.sin(t * 11)) * 22 : 0;
  sc += susu({ x: qx, y: 1235 - bounce, s: .55 * KS, t, legL: running ? walkPh(t, 28) : 0, legR: running ? -walkPh(t, 28) : 0, armL: q1 ? 130 + 15 * Math.sin(t * 12) : running ? 30 : 12, armR: q1 ? 130 - 15 * Math.sin(t * 12) : running ? 30 : 12,
    amp: amp('QASIM'), mouth: t > LE('g1') ? 'frown' : 'smirk', brow: q1 ? .8 : 0, look: t > LS('b1') ? [-12, -8] : [-10, -6], blink: blink(t, 2.4) });
  if (running) sc += speed(qx - 30, 1080, 1, .6, 4) + dust(qx - 60, 1235, (t * 3) % 1, 4, 30);
  // frown close-up + storm cloud
  const zz = ease(seg(t, LE('g1') + .1, LE('g1') + .6));
  let g = zoom(sc, 560, 905, lerp(1, 2.0, zz));
  if (zz > .5) { const k = back(seg(t, LE('g1') + .5, LE('g1') + .8)); g += `<g transform="translate(560,330) scale(${k})"><g fill="#555" stroke="${C.ink}" stroke-width="6"><circle cx="-60" cy="0" r="55"/><circle cx="10" cy="-30" r="70"/><circle cx="80" cy="0" r="55"/><rect x="-60" y="0" width="140" height="55"/></g><path d="M10,50 l-24,50 h30 l-20,56" stroke="${C.gold}" stroke-width="12" fill="none" stroke-linejoin="round"/></g>`; }
  return g + capFor('ask', t);
}
// 4 FIELD — "Time out! Suusuu aayi hai!"
function E_field(t) {
  const camX = 500;
  let sc = gali(camX, t + 19);
  const q2 = t > LS('q2') - .2, leave = seg(t, sdur('field') - .9, sdur('field'));
  const qx = lerp(560, 1250, eout(leave));
  const d = Math.sin(t * 16);
  sc += ball(lerp(-60, 1150, seg(t, .2, 3.4)), 1210, 15, t * 500);
  const bun = eout(seg(t, LS('q2') + .3, LS('b2')));
  const b2 = t > LS('b2') - .1;
  sc += bunty({ x: lerp(-220, 250, bun), y: 1215, t, armL: b2 ? 165 : 30, armR: b2 ? 165 : 30, legL: bun < 1 && bun > 0 ? walkPh(t) : 0, legR: bun < 1 && bun > 0 ? -walkPh(t) : 0, amp: amp('BUNTY'), tilt: b2 ? 8 * Math.sin(t * 6) : 0, look: [10, 8], brow: .9, blink: blink(t) });
  sc += susu({ x: qx, y: 1230 - (q2 ? 8 * Math.abs(d) : 0), s: .55 * KS, t, legL: q2 ? 16 + 6 * d : (leave > 0 ? walkPh(t, 28) : 0), legR: q2 ? -16 + 6 * d : (leave > 0 ? -walkPh(t, 28) : 0),
    armL: q2 ? 4 : 35, armR: q2 ? 4 : 35, mouth: q2 ? 'wobble' : 'frown', amp: amp('QASIM'), brow: q2 ? 1 : 0, tilt: q2 ? 6 * d : 0, look: [-8, 6], blink: blink(t, 2.2) });
  if (leave > 0) sc += speed(qx - 30, 1080, 1, .7, 4);
  let g = sc;
  if (t > LS('q2') && t < LS('q2') + 1.2) g += burst(540, 420, 190, C.gold, 'TIME OUT!', 76, -6, 1 - seg(t, LS('q2') + .9, LS('q2') + 1.2));
  return g + capFor('field', t);
}
// 5 HOME — Ammi's catchphrase at the door
function E_home(t) {
  const run = ease(seg(t, 0, 1.7)), qx = lerp(1060, 1460, run);
  const camX = lerp(640, 1060, run);
  const zip = seg(t, LE('a1') + .15, LE('a1') + .6);
  let sc = gali(camX, t + 26, { doorOpen: zip > 0 });
  const a1 = t > LS('a1') - .1 && t < LE('a1') + .1;
  sc += ammi({ x: 1730 - camX, y: 1190, s: .74, t, phone: 0, look: [-12, 2], brow: a1 ? 1 : .3, amp: amp('AMMI'), tilt: zip > 0 ? 14 * Math.sin(zip * 20) * (1 - zip) : 0, blink: blink(t, 2.6) });
  const d = Math.sin(t * 16), waiting = t > 1.7 && zip === 0;
  if (zip < 1) sc += `<g opacity="${1 - seg(zip, .5, 1)}">` + susu({ x: lerp(qx - camX, 1580 - camX, eout(zip)), y: lerp(1230, 1080, zip), s: lerp(.55, .45, zip) * KS, t, legL: waiting ? 16 + 6 * d : walkPh(t, 30), legR: waiting ? -16 + 6 * d : -walkPh(t, 30), armL: waiting ? 4 : 35, armR: waiting ? 4 : 35,
    mouth: 'wobble', brow: 1, tilt: waiting ? 6 * d : 0, look: [10, 0], blink: blink(t) }) + '</g>';
  if (t < 1.7 || zip > 0) sc += speed((zip > 0 ? lerp(qx - camX, 1580 - camX, zip) : qx - camX) - 30, 1080, 1, .7, 4);
  let g = sc;
  g += tally(7, 'AAJ SUUSUU BREAK:', seg(t, LS('a1') + .2, LS('a1') + .5));
  return g + capFor('home', t);
}
// 6 DANGER — dog chases Mano up the neem tree, branch starts cracking
function E_danger(t) {
  const camX = lerp(1150, 1600, ease(seg(t, 0, 4.2)));
  const crackK = seg(t, LE('b3') + .1, sdur('danger'));
  const bend = 10 * seg(t, 4.6, LE('b3')) + 26 * crackK + 3 * Math.sin(t * 14) * crackK;
  let sc = gali(camX, t + 30, { bend, crackFx: crackK > 0 });
  // Mano path
  let cx, cy, rot = 0, pose = 'walk', flip = 1;
  if (t < 2.6) { cx = lerp(1180, 2190, seg(t, .1, 2.6)); cy = 1200; }
  else if (t < 3.6) { const k = seg(t, 2.6, 3.6); cx = 2200; cy = lerp(1200, 640, k); rot = -78; }
  else if (t < 4.7) { const k = seg(t, 3.6, 4.7); cx = lerp(2160, 1995, k); cy = lerp(605, 548 + bend * .9, k); flip = -1; }
  else { cx = 1995; cy = 548 + bend * .95; pose = 'cling'; flip = -1; }
  const meow = pose === 'cling' ? Math.max(0, Math.sin(t * 5)) : 0;
  sc += cat({ x: cx - camX, y: cy, s: .58, rot, pose, flip, t, meow, wide: pose === 'cling' ? 1 : 0 });
  // dog
  const dx = t < 2.7 ? lerp(950, 2010, seg(t, .3, 2.7)) : t < 5.2 ? 2010 : lerp(2010, 1300, seg(t, 5.2, 6.4));
  const dflip = t > 5.2 ? -1 : 1;
  if (t < 6.5) sc += dog({ x: dx - camX, y: 1215, s: .7 * KS, t, run: t < 2.7 || t > 5.2 ? 1 : 0, flip: dflip, bark: t > 2.7 && t < 5.2 ? Math.max(0, Math.sin(t * 9)) : 0 });
  // kids arrive, look up
  const kin = eout(seg(t, 4.3, 5.6));
  const g2 = t > LS('g2') - .1 && t < LE('g2') + .2, b3 = t > LS('b3') - .1;
  sc += guddu({ x: lerp(1500, 1760, kin) - camX, y: 1190, t, armR: g2 ? 155 : 20, armL: 20, legL: kin > 0 && kin < 1 ? walkPh(t) : 0, legR: kin > 0 && kin < 1 ? -walkPh(t) : 0, look: [10, -16], mouth: 'o', amp: amp('GUDDU'), blink: blink(t, 3) });
  sc += bunty({ x: lerp(1620, 1890, kin) - camX, y: 1215, t, armL: b3 ? 170 : 25, armR: b3 ? 170 : 25, legL: kin > 0 && kin < 1 ? walkPh(t) : 0, legR: kin > 0 && kin < 1 ? -walkPh(t) : 0, look: [8, -16], mouth: 'o', amp: amp('BUNTY'), brow: 1, blink: blink(t, 2.5) });
  if (crackK > 0) sc += fallingLeaves(t, 1900 - camX, 520, 5);
  sc = zoom(sc, 540, 1300, lerp(.6, 1, ease(seg(t, 4.4, 6.2))));
  let g = shake(sc, crackK > 0 ? .25 * Math.max(0, Math.sin(t * 8)) : 0, t);
  if (t > 2.6 && t < 5.0) { const k = Math.max(0, Math.sin(t * 9)); g += T(dx - camX + 60, 1040 - 20 * k, 54, 'BHAU! BHAU!', { fill: '#fff', shadow: '#000', op: k > .3 ? 1 : .6 }); }
  if (pose === 'cling') g += T(cx - camX + 10, cy - 120 - 10 * meow, 50, 'MEOW!', { fill: '#fff', shadow: C.red, op: meow > .2 ? 1 : 0 });
  if (crackK > 0) g += burst(2090 - camX + 120, 470, 120, '#fff', 'KRRK!', 52, 8, Math.min(1, Math.max(0, Math.sin(t * 6))));
  g += hookBig('MANO', 'KHATRE MEIN!', t, 4.8, 5.1, 200);
  return g + capFor('danger', t);
}
// 7 POWER — door glow, flush, meter; burst out as Suuu-Suuu-Man
function E_power(t) {
  const nE = LE('n3'), q = LS('q3'), open = ease(seg(t, q - .45, q - .3));
  const glow = seg(t, .2, nE);
  let sc = hallway(t, { open, glow: Math.max(glow, open) });
  if (open > 0) { let rays = ''; for (let i = 0; i < 16; i++) { const a = (i * 22.5 + t * 30) * Math.PI / 180; rays += `<path d="M540,880 L${540 + 1600 * Math.cos(a - .06)},${880 + 1600 * Math.sin(a - .06)} L${540 + 1600 * Math.cos(a + .06)},${880 + 1600 * Math.sin(a + .06)}Z" fill="#fff6c8" opacity="${.35 * open}"/>`; } sc += rays; }
  if (open > 0) { const st = eout(seg(t, q - .3, q + .4)), hero = ease(seg(t, q, q + .3)); sc += susu({ x: 540, y: lerp(1260, 1500, st), s: lerp(.55, .9, st), t, power: open, cape: open, crown: seg(t, q, q + .3), shades: seg(t, LE('q3') + .15, LE('q3') + .45), armR: lerp(20, 165, hero), fistR: hero > .4, armL: lerp(20, 40, hero), amp: amp('QASIM'), mouth: 'smirk', blink: blink(t, 3) }); }
  let g = zoom(up(sc, 120), 540, 800, 1 + .05 * glow);
  g = shake(g, (open > 0 && open < 1) ? 1 : (glow > .8 && open === 0 ? .3 : 0), t);
  if (t > .8 && t < 2.4) { const k = back(seg(t, .8, 1.1)); g += `<g transform="translate(540,640) scale(${k})">${burst(0, 0, 230, C.gold, 'FLUUSH!', 104, -8, 1 - seg(t, 2.1, 2.4))}</g>`; }
  const p = ease(seg(t, 1.0, nE));
  if (t > .9 && open < 1) g += `<g opacity="${seg(t, .9, 1.1) * (1 - open)}"><rect x="140" y="150" width="800" height="150" rx="30" fill="#000" opacity=".75"/>${T(540, 212, 62, 'SUUSUU POWER', { fill: C.gold, sw: 0, ls: 6 })}<rect x="190" y="235" width="700" height="44" rx="22" fill="#333" stroke="#fff" stroke-width="5"/><rect x="194" y="239" width="${692 * p}" height="36" rx="18" fill="${p > .99 ? '#ff3b30' : C.gold}"/>${T(540, 272, 40, Math.round(p * 100) + '%', { sw: 6 })}${emblem(180, 257, .7)}</g>`;
  // inset: Mano still hanging on
  if (t > 1.6 && open === 0) { const k = back(seg(t, 1.6, 1.9)); const ins = `<g transform="translate(870,560) scale(${k})"><rect x="-160" y="-160" width="320" height="320" fill="#7cc7f2"/><path d="M160,20 Q20,0 -110,-10" stroke="${C.ink}" stroke-width="22" fill="none"/><path d="M160,20 Q20,0 -110,${-10 + 8 * Math.sin(t * 14)}" stroke="#7a5233" stroke-width="13" fill="none"/>${cat({ x: -50, y: 20, s: .55 * KS, pose: 'cling', flip: -1, t, meow: Math.max(0, Math.sin(t * 6)), wide: 1 })}</g>`; g += inset(870, 560, 150 * k, ins, 'insP'); }
  if (t > q) { const k = back(seg(t, q, q + .3)); g += `<g transform="translate(540,330) scale(${lerp(2.2, 1, clamp(k))}) rotate(-4)" opacity="${clamp(k * 2)}"><rect x="-460" y="40" width="920" height="40" rx="20" fill="${C.red}" transform="skewX(-20)"/>${T(0, 40, 138, 'SUUU-SUUU-MAN!', { shadow: C.red, sw: 12, ls: 2 })}</g>`; }
  return g + capFor('power', t);
}
// 8 RESCUE — fly over the rooftops, catch Mano, land, lick, zoom off
function E_rescue(t) {
  const A = 2.4, snapT = 2.55, catchT = 4.4, landT = 5.1, lickT = 5.8, offT = sdur('rescue') - 1.0;
  const camX = t < A ? lerp(250, 1560, ease(seg(t, 0, A))) : 1560;
  const snap = t > snapT ? 1 : 0;
  const fall = ease(seg(t, snapT + .1, catchT));
  const slow = t > snapT + .1 && t < landT;
  let sc = gali(camX, t + 40, { snap, fallY: fall * 560, bend: t < snapT ? 30 + 6 * Math.sin(t * 20) : 0, crackFx: t < snapT });
  const tip = { x: 1995 - camX, y: 590 };
  let sx, sy, rot, arms = [175, 175], s = .62 * KS, catInArms = t >= catchT;
  if (t < A) { sx = 430; sy = 700 + 30 * Math.sin(t * 4); rot = 82; }
  else if (t < catchT) { const k = eout(seg(t, A + .1, catchT)); sx = lerp(1150, tip.x + 40, k); sy = lerp(250, 1000, k); rot = lerp(-130, -10, k); }
  else if (t < landT) { const k = ease(seg(t, catchT, landT)); sx = lerp(tip.x + 40, 520, k); sy = lerp(1000, 1235, k); rot = lerp(-10, 360, k); arms = [40, 40]; }
  else if (t < offT) { sx = 520; sy = 1235; rot = 0; arms = [40, 40]; }
  else { const k = seg(t, offT, offT + .6); sx = 520; sy = lerp(1235, -400, k * k); rot = 0; arms = [175, 175]; }
  const handsDown = t > LS('b4') + .2 && t < offT;
  if (handsDown) { arms = [20, t > LS('g3') ? 150 : 20]; catInArms = false; }
  if (t < A) sc += speed(sx - 140, sy + 120, 1, .8, 6);
  // Mano
  if (!catInArms) {
    if (t < catchT) sc += cat({ x: tip.x, y: t < snapT ? tip.y : lerp(tip.y, 1000, fall), s: .58, pose: t < snapT ? 'cling' : 'fall', flip: -1, rot: t < snapT ? 0 : 30 * Math.sin(t * 3), t, meow: Math.max(0, Math.sin(t * 7)), wide: 1 });
    else sc += cat({ x: 650, y: 1235, s: .58, pose: 'sit', flip: -1, t, meow: 0 });
  }
  const sq = Math.abs(t - landT) < .15 ? .9 : 1;
  let px = sx, py = sy;
  if (t >= catchT && t < landT) { const h = 300 * s, r = rot * Math.PI / 180; px = sx - h * Math.sin(r); py = sy - h + h * Math.cos(r); }
  const sus = susu({ x: px, y: py, s, rot, t, power: .85, cape: 1, crown: 1, shades: 1, armL: arms[0], armR: arms[1], legL: t < A ? -25 : 0, legR: t < A ? 10 : 0, squash: sq, mouth: t > lickT ? 'grin' : 'smirk', wink: t > lickT + .5 && t < lickT + 1.0 ? 1 : 0, blink: blink(t, 3) });
  sc += sus;
  if (catInArms) { const ang = rot * Math.PI / 180; sc += cat({ x: sx + Math.sin(ang) * 230 * s * 0 + 0, y: sy - 230 * s, s: .6, pose: 'sit', flip: -1, rot, t, meow: 0 }); }
  if (t > lickT && t < lickT + 1.6) { for (let i = 0; i < 3; i++) { const p = seg(t, lickT + i * .25, lickT + i * .25 + 1); if (p > 0 && p < 1) sc += heart(sx - 40 + i * 50, sy - 420 - p * 160, .6, 1 - p); } sc += T(sx + 110, sy - 450, 46, 'CHUP!', { fill: '#ff4f7b', shadow: '#000', op: 1 - seg(t, lickT + .6, lickT + 1) }); }
  sc += dust(520, 1240, seg(t, landT - .05, landT + .7), 8, 70);
  if (t > offT) sc += speed(520, sy + 260, 0, .8, 3) + `<path d="M520,${sy + 100} L520,1240" stroke="${C.gold}" stroke-width="40" opacity="${.5 * (1 - seg(t, offT + .3, offT + 1))}" stroke-linecap="round"/>`;
  // kids
  const kin = eout(seg(t, landT, landT + 1.2));
  sc += bunty({ x: 1890 - camX, y: 1215, t, armL: 30, armR: 30, mouth: 'o', amp: amp('BUNTY'), look: t > offT ? [6, -20] : [10, 0], brow: 1, blink: blink(t) });
  sc += guddu({ x: 1760 - camX, y: 1190, t, armL: 20, armR: t > LS('g3') ? 150 : 20, mouth: 'o', amp: amp('GUDDU'), look: t > offT ? [6, -20] : [12, 0], blink: blink(t, 3) });
  let g = t < A + .3 ? zoom(sc, 480, 1300, lerp(.55, 1, ease(seg(t, A - .9, A + .3)))) : zoom(sc, 480, 900, slow ? 1.15 : 1);
  if (slow) g += `<rect width="1080" height="1920" fill="url(#vig)" opacity=".7"/>`;
  g = shake(g, Math.abs(t - snapT) < .25 ? 1 : (Math.abs(t - landT) < .3 ? .8 : 0), t);
  if (t > snapT && t < snapT + .9) g += burst(560, 420, 150, '#fff', 'KRAKK!', 66, 10, 1 - seg(t, snapT + .6, snapT + .9));
  if (t > catchT && t < catchT + .7) g += `<circle cx="${tip.x + 40}" cy="900" r="${200 * seg(t, catchT, catchT + .7)}" fill="none" stroke="${C.gold}" stroke-width="16" opacity="${1 - seg(t, catchT, catchT + .7)}"/>`;
  if (t > catchT && t < catchT + 1.3) g += T(540, 360, 120, 'PAKAD LIYA!', { fill: C.gold, shadow: C.red, op: 1 - seg(t, catchT + 1.0, catchT + 1.3) });
  return g + capFor('rescue', t);
}
// 9 LAST BALL — the tiny tap and Mano's paw
function E_last(t) {
  const camX = 260;
  let sc = gali(camX, t + 55, { score: '4 RUN — 1 BALL' });
  const walk = eout(seg(t, 0, 2.4)), walking = t < 2.4;
  const t0 = LE('q4') + .3;
  const toCrease = ease(seg(t, t0, t0 + .8));
  const rel = t0 + 1.8, hitT = t0 + 2.3, pushT = t0 + 5.0, fourT = t0 + 5.4;
  let qx = walking ? lerp(1180, 640, walk) : lerp(640, 330, toCrease);
  const hasBat = t > LE('b5') - .3;
  const q4 = t > LS('q4') - .1 && t < LE('q4') + .3;
  let armR = 12, armL = 12, rot = 0, qy = 1235, mouth = 'smirk', flip = 1;
  if (q4) { qy -= Math.abs(Math.sin(t * 10)) * 50; armL = 150; armR = 150; mouth = 'grin'; }
  if (t > t0 + .8) { armR = 40; armL = 15; }
  if (t > rel && t < hitT + .4) { const w = seg(t, rel, hitT - .05); armR = lerp(40, -60, w); if (t > hitT - .05) armR = lerp(-60, 230, eout(seg(t, hitT - .05, hitT + .2))); }
  if (t > hitT + .2 && t < hitT + 1.2) { rot = 360 * eout(seg(t, hitT + .1, hitT + .6)); }
  if (t > hitT + .6 && t < fourT) { armR = 30; mouth = 'o'; }
  if (t > fourT) { qy -= Math.abs(Math.sin(t * 9)) * 40; armL = 160; armR = 160; mouth = 'grin'; }
  // kids
  const b5 = t > LS('b5') - .1 && t < LE('b5') + .2;
  const bx = walking ? 620 : lerp(620, 520, seg(t, LS('b5'), LS('b5') + .5));
  const bx2 = t > t0 ? lerp(bx, 380, seg(t, t0, t0 + .8)) : bx;
  sc += bunty({ x: bx2 - camX + 260 - 260, y: 1215, t, batR: !hasBat, armR: b5 ? 60 : 15, armL: t > fourT ? 165 : 20, amp: amp('BUNTY'), look: [10, 8], mouth: t > fourT ? 'laugh' : (t > hitT + 1.5 && t < fourT ? 'o' : 'smile'), blink: blink(t), squash: t > fourT ? 1 + .04 * Math.sin(t * 20) : 1 });
  const gx = t < t0 + .9 ? 1150 : lerp(1150, 960, seg(t, t0 + .9, rel));
  const wind = t < t0 + .9 ? 25 : lerp(0, 320, seg(t, rel - .45, rel));
  sc += guddu({ x: gx - camX, y: 1190, t, armR: wind, armL: t > fourT ? 165 : 20, legL: t > t0 + .9 && t < rel ? walkPh(t) : 0, legR: t > t0 + .9 && t < rel ? -walkPh(t) : 0, look: [-12, 6], mouth: t > fourT ? 'laugh' : 'flat', blink: blink(t, 3.2) });
  // ball
  let ballX = null, ballY = 1210;
  if (t > rel - .05 && t < hitT) { const k = seg(t, rel, hitT); ballX = lerp(gx - camX + 50, qx + 40, k); ballY = k < .6 ? lerp(820, 1200, k / .6) : lerp(1200, 1150, (k - .6) / .4); }
  else if (t >= hitT && t < pushT) ballX = lerp(qx + 60, 520, eout(seg(t, hitT, hitT + 1.7)));
  else if (t >= pushT) ballX = lerp(520, 700, eout(seg(t, pushT, pushT + .9)));
  if (ballX !== null) sc += ball(ballX, ballY, 15, (ballX) * 3);
  // Mano: follows Qasim, then trots to the ball and pushes it
  let mx, mpose = 'sit', mflip = 1;
  if (walking) { mx = qx - 120; mpose = 'walk'; }
  else if (t < hitT + 1.7) mx = 230;
  else if (t < pushT) { mx = lerp(230, 430, seg(t, hitT + 1.8, pushT - .2)); mpose = t < pushT - .2 ? 'walk' : 'sit'; }
  else { mx = 440 + 20 * Math.sin(seg(t, pushT, pushT + .3) * Math.PI); }
  sc += cat({ x: mx, y: 1235, s: .6, pose: mpose, flip: mflip, t, meow: t > LS('n4') ? Math.max(0, Math.sin(t * 5)) * .8 : 0 });
  sc += susu({ x: qx, y: qy, s: .55 * KS, rot, flip, t, batR: hasBat, armR, armL, legL: walking ? walkPh(t, 20) * .7 : 0, legR: walking ? -walkPh(t, 20) * .7 : 0, mouth, amp: amp('QASIM'), look: [10, 4], blink: blink(t, 2.6) });
  if (walking) sc += notes(qx + 70, 820, t);
  const wide = ease(seg(t, t0 + .7, t0 + 1.4)) * (1 - ease(seg(t, LS('n4') - .2, LS('n4') + .6)));
  let g = zoom(sc, 480, 1250, lerp(1, .72, wide));
  if (t > hitT && t < hitT + .8) g += T(qx + 120, 1000, 60, 'tuk!', { fill: '#fff', shadow: '#000', op: 1 - seg(t, hitT + .5, hitT + .8) });
  if (t > hitT + 1.6 && t < pushT) g += T(820, 760, 70, 'OHHH...', { fill: '#fff', shadow: '#000' });
  if (t > fourT) { g += confetti(t - fourT); if (t < fourT + 1.4) g += `<g transform="translate(540,470) scale(${back(seg(t, fourT, fourT + .3))})">${burst(0, 0, 260, C.gold, 'CHAUKA!', 120, -6, 1 - seg(t, fourT + 1.1, fourT + 1.4))}</g>`; }
  if (t > LS('n4') - .2) { for (let i = 0; i < 2; i++) { const p = ((t - LS('n4')) * .8 + i * .5) % 1; g += heart(mx + 20, 1120 - p * 140, .5, 1 - p); } }
  return g + capFor('last', t);
}
// 10 ENDING — on shoulders… then "Ammiii! Suusuu aayi hai!"
function E_ending(t) {
  const camX = 260;
  let sc = gali(camX, t + 72);
  const q5 = t > LS('q5') - .1, hop = seg(t, LE('q5') + .05, LE('q5') + .4), runOff = seg(t, LE('q5') + .4, LE('q5') + 1.2);
  const bob = Math.abs(Math.sin(t * 8)) * 16 * (1 - hop);
  sc += confetti(t + 3, 30);
  sc += bunty({ x: 430, y: 1215, t, armL: 20, armR: 150 * (1 - hop) + 20 * hop, mouth: t > LE('a2') ? 'laugh' : (q5 ? 'o' : 'laugh'), look: q5 ? [10, -10] : [6, -8], blink: blink(t) });
  sc += guddu({ x: 650, y: 1190, t, armL: 150 * (1 - hop) + 20 * hop, armR: 20, mouth: t > LE('a2') ? 'laugh' : (q5 ? 'o' : 'laugh'), look: q5 ? [-10, -10] : [-6, -8], blink: blink(t, 3) });
  const d = Math.sin(t * 16);
  const qx = lerp(540, 1250, eout(runOff)), qy = lerp(830 - bob, 1235, ease(hop));
  sc += susu({ x: qx, y: qy, s: .55 * KS, t, legL: q5 ? 16 + 6 * d : -20, legR: q5 ? -16 + 6 * d : 20, armL: q5 ? 4 : 150, armR: q5 ? 4 : 150, mouth: q5 ? 'wobble' : 'grin', amp: amp('QASIM'), brow: q5 ? 1 : 0, tilt: q5 ? 6 * d : 0, blink: blink(t) });
  sc += cat({ x: 800, y: 1235 - Math.abs(Math.sin(t * 7)) * 30 * (1 - hop), s: .6, pose: 'sit', flip: -1, t });
  if (runOff > 0) sc += speed(qx - 30, 1080, 1, .7, 4);
  let g = zoom(sc, 540, 1250, lerp(1, .58, ease(seg(t, LE('a2') + .3, sdur('ending')))));
  if (t > LS('a2') - .2) { const k = back(seg(t, LS('a2') - .2, LS('a2') + .1)); g += inset(860, 560, 150 * k, `<rect x="700" y="400" width="320" height="320" fill="#f6e7c8"/><rect x="760" y="430" width="200" height="300" fill="#2f6fd1"/>` + ammi({ x: 860, y: 1000, s: .9, phone: 0, t, look: [-8, 0], brow: 1, amp: amp('AMMI') }), 'insA'); }
  g += tally(8, 'AAJ SUUSUU BREAK:', seg(t, LE('a2') + .1, LE('a2') + .4));
  return g + capFor('ending', t);
}
// 11 END CARD — safety line, like & subscribe
function E_endcard(t) {
  let g = brushBg(t + 90);
  g += susu({ x: 540, y: 1250, s: .85, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 40, armR: 40, mouth: 'grin', blink: blink(t, 2.6) });
  g += cat({ x: 545, y: 1250 - 235 * .85 + 20, s: .55, pose: 'sit', flip: -1, t, meow: Math.max(0, Math.sin(t * 4)) * .7 });
  const half = LS('n5') + L('n5').d * 0.58;
  if (t < half + .2) { g += `<g transform="translate(540,290) scale(${back(seg(t, .2, .5))})">${T(0, 0, 92, 'PED PAR KHUD', { shadow: '#000' })}</g><g transform="translate(540,410) scale(${back(seg(t, .5, .8))}) rotate(-3)">${T(0, 0, 104, 'MAT CHADHNA!', { fill: C.gold, shadow: C.red })}</g>`; }
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
const EP = { hook: E_hook, intro: E_intro, ask: E_ask, field: E_field, home: E_home, danger: E_danger, power: E_power, rescue: E_rescue, last: E_last, ending: E_ending, endcard: E_endcard };
window.drawFrame = (id, t) => {
  const s = TL.scenes.find(x => x.id === id); ABS = s.start + t;
  document.getElementById('s').innerHTML = defs() + skyDefs + EP[id](t);
};
window.drawCast = () => {
  let g = `<rect width="1080" height="1920" fill="#f3ead9"/>` + T(540, 100, 84, 'SUSUMAN — SIDE CAST', { fill: C.ink, sw: 0 });
  g += T(270, 190, 50, 'BUNTY (captain)', { fill: '#2f6fd1', sw: 0 }) + bunty({ x: 270, y: 760, t: 0, s: .8, mouth: 'smile' });
  g += T(810, 190, 50, 'GUDDU (bowler)', { fill: '#e0a020', sw: 0 }) + guddu({ x: 810, y: 760, t: 0, s: .75, mouth: 'smile' });
  g += T(270, 900, 50, 'MANO (kitten)', { fill: C.red, sw: 0 }) + cat({ x: 250, y: 1180, s: 1.3, pose: 'sit', t: 0 });
  g += T(810, 900, 50, 'GALI DOG', { fill: '#7a4f28', sw: 0 }) + dog({ x: 760, y: 1180, s: 1.1, run: 0, t: 0 });
  g += T(540, 1330, 50, 'SUSUMAN OUTDOOR LOOK (shades)', { fill: C.ink, sw: 0 }) + susu({ x: 540, y: 1880, s: .78, t: .3, power: .8, cape: 1, crown: 1, shades: 1, armR: 160, fistR: 1, mouth: 'smirk' });
  document.getElementById('s').innerHTML = defs() + skyDefs + g;
};

// =================== 16:9 version (same scenes framed for 1920x1080; captions redrawn) ===================
let WIDE = false, CAPW = null;
const _cap2 = caption2;
caption2 = (txt, who, op) => { if (WIDE) { CAPW = [txt, who, op]; return ''; } return _cap2(txt, who, op); };
const VIEWW = { endcard: [.7, 200] };
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
  svg.innerHTML = defs() + skyDefs + `<g transform="translate(960,0) scale(${S}) translate(-540,${-Y0})">${bg}${body}</g>` + (CAPW ? captionW(...CAPW) : '');
  WIDE = false;
};
