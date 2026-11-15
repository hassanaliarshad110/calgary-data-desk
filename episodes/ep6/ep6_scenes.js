// Episode 6 "Mele Mein Gum" — scenes. Each takes local time t; dialogue times come from TL (timeline.js).
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
const jalebiPlate = (x, y, s) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(3)})"><ellipse cx="0" cy="0" rx="60" ry="18" fill="#cfd6dd" stroke="${C.ink}" stroke-width="4"/>${[-30, 0, 30].map(dx => `<circle cx="${dx}" cy="-14" r="16" fill="none" stroke="#ff9a1a" stroke-width="7"/>`).join('')}</g>`;
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
const SKH = { sakina: 400, pari: 300, baba: 545, babaKurta: 545, officer: 535, pariMa: 495, pariPa: 540, ammar: 540 };
const faceOf = (key, x, y, s) => [x, y - (SKH[key] || 480) * s];

// ============ 1 HOOK — flash-forward: dusk over the mela, Susuman flies above the giant wheel carrying little Pari, who points down; then rewind ============
function E_hook(t) {
  const D = sdur('hook'), nE = LE('n1b') + .2, tt = t < nE ? t : Math.max(0, nE - (t - nE) * 2.4), rw = seg(t, nE, nE + .5), P = seg(tt, 0, nE);
  let cam = camM(lerp(1000, 1450, ease(P)), lerp(.95, 1.2, ease(P)), 1000, 540, lerp(820, 980, ease(P)));
  const S = mela(tt, cam, { fgY: 1960, balloonFG: 1500 });
  let g = S.back;
  // Susuman crosses the frame high above the crowd, Pari in his arms
  const k = eout(seg(tt, .2, 3.6)), sx = lerp(-120, 560, k), sy = lerp(1350, 1180, k) + 20 * Math.sin(tt * 3);
  const sc = .7;
  g += speed(sx - 120, sy - 160, 1, .6, 5);
  g += susu({ x: sx, y: sy, s: sc, rot: 16, t: tt, power: .9, cape: 1, crown: 1, shades: 1, armL: 120, armR: 110, legL: -24, legR: 12, mouth: on('qh', t) ? 'shout' : 'grin', amp: amp('QASIM'), brow: .2 });
  g += pari({ x: sx + 120 * sc, y: sy - 150 * sc, s: .75 * sc, t: tt, move: 'point', mt: tt, yaw: .6, expr: 'surprised' });
  g += S.front + vig(t < nE ? .7 : .4);
  if (t < nE) {
    g += hookBig('MAMA KO NAHI PATA...', 'QASIM HI HAI', t, .15, 1.3, 210).replace('font-size="96"', 'font-size="80"');
    if (t > LS('qh') - .1) g += `<g transform="translate(540,520) scale(${back(seg(t, LS('qh') - .1, LS('qh') + .25))}) rotate(-4)">${T(0, 0, 118, 'SUUU-SUUU-MAN!', { shadow: C.red, sw: 12 })}</g>`;
    if (t > 1.0) g += shhh(930, 560, back(seg(t, 1.0, 1.3)) * .9);
    if (t > LS('n1b') + .4) g += `<g transform="translate(540,1180) scale(${back(seg(t, LS('n1b') + .4, LS('n1b') + .7))})">${burst(0, 0, 170, C.red, 'MELE MEIN GUM!', 62, -5, 1)}</g>`;
  }
  if (t > nE) g += rewindFx(t - nE, rw, 'THODI DER PEHLE...');
  const f2 = seg(t, D - .25, D); if (f2 > 0) g += `<rect width="1080" height="1920" fill="#fff" opacity="${f2}"/>`;
  return g + capFor('hook', t);
}
// finger-on-lips "secret" badge (no emoji font: drawn)
function shhh(x, y, k) {
  if (k <= 0) return '';
  return `<g transform="translate(${x},${y}) scale(${k})"><circle r="78" fill="${C.gold}" stroke="${C.ink}" stroke-width="7"/><circle cx="-24" cy="-14" r="8" fill="${C.ink}"/><circle cx="24" cy="-14" r="8" fill="${C.ink}"/><path d="M-22,30 Q0,22 22,30" stroke="${C.ink}" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="-9" y="-6" width="18" height="70" rx="9" fill="#c98b5c" stroke="${C.ink}" stroke-width="5"/>${T(0, 118, 40, 'RAAZ!', { fill: '#fff', shadow: '#000' })}</g>`;
}

// ============ 2 HOME — evening aangan: Baba comes home tired; "Baba! Mele chalo na!" → "Aaj nahi beta..." → CRYING GIRL → Baba gives in; grin + wink ============
function E_home(t) {
  const D = sdur('home'), k2s = LS('k2'), k2e = LE('k2'), b2s = LS('b2'), cryK = seg(t, k2s - .1, k2s + .4) * (1 - seg(t, b2s + .9, b2s + 1.3)), grin = t > b2s + 1.0;
  let cam = { x: lerp(780, 520, ease(seg(t, 0, 3.0))), y: 0, z: 1, px: 600, py: 960 };
  cam = lerpCam(cam, { x: 560, y: 200, z: 1.32, px: 600, py: 960 }, ease(seg(t, k2s - .3, k2s + .6)) * (1 - ease(seg(t, b2s + .2, b2s + 1.2))));
  cam = lerpCam(cam, { x: 360, y: 120, z: 1.18, px: 600, py: 960 }, ease(seg(t, LS('q1') - .6, D)));
  const S = aangan(t, cam, { eve: 1, noMano: 0, manoSleep: 0 });
  let g = S.back;
  // BABA walks in from the blue door (d=1.3) to the charpai and sits; bag + tiffin
  const wk = seg(t, .2, 2.4), sitK = seg(t, LE('b1') - .6, LE('b1'));
  let bd = lerp(1.3, 1.0, ease(wk)), bx = lerp(1295, 1150, ease(wk)), by = lerp(1085, 1250, ease(wk));
  const b1 = on('b1', t), b2 = on('b2', t), standUp = seg(t, b2s, b2s + .5);
  const sitting = sitK > 0 && standUp < 1;
  if (sitting) { bd = 1.02; bx = 1150; by = 1150; }
  const bmove = wk < 1 ? 'walk' : sitting ? (standUp > 0 ? 'stand' : (b2 ? 'talk' : 'sit')) : (b2 ? 'talk' : (t > b2s ? 'celebrate' : 'idle'));
  const bexpr = cryK > .3 && t < b2s ? 'sad' : (t > b2s ? 'happy' : (b1 ? 'sleepy' : 'neutral'));
  g += at(bd, cam, bx, by, baba, { s: SBA, t, move: bmove, mt: bmove === 'sit' ? t - LE('b1') + .6 : bmove === 'stand' ? t - b2s : t, k: bmove === 'sit' ? clamp((t - LE('b1') + .6) / .6) : undefined, yaw: wk < 1 ? -Math.PI / 2 : -.35, expr: bexpr, amp: amp('BABA') }, { w: sitting ? 0 : 130 });
  { const p = proj(bd, cam, bx, by); if (!sitting && t < b2s) g += bag(p.x + 120 * p.s, p.y - 225 * p.s, .9 * p.s) ; else g += bag(proj(1, cam, 1330, 1120).x, proj(1, cam, 1330, 1120).y, .9) + tiffin(proj(1, cam, 1420, 1112).x, proj(1, cam, 1420, 1112).y, .8); }
  if (wk < 1 && t > 1) { const p = proj(bd, cam, bx, by - 600); g += T(p.x, p.y, 54, 'UFF...', { fill: '#fff', shadow: '#000', op: 1 - seg(t, 2.2, 2.6) }); }
  // MAMA on the left with her phone, SAKINA runs to Baba, QASIM bounces
  const a = cryK > .3 ? 'surprised' : 'n';
  g += at(1.1, cam, 1330, 1205, mama, { s: SMA, t, phone: cryK > .3 ? 0 : 1, look: cryK > .3 ? [-14, -4] : [0, 12], brow: cryK > .3 ? .8 : .2, blink: blink(t, 2.9) }, { w: 140 });
  const sr = ease(seg(t, .9, 1.9)), SKX = lerp(640, 900, sr), SKY = 1262, k1 = on('k1', t), k2 = on('k2', t, .1, .6);
  const smove = sr < 1 ? 'run' : (cryK > .1 && !grin ? 'cry' : (grin && t < b2s + 2.6 ? 'thumbsUp' : (k1 ? 'talk' : 'idle')));
  const sexpr = cryK > .1 && !grin ? 'cry' : (grin ? 'wink' : (k1 ? 'happy' : 'happy'));
  g += at(1, cam, SKX, SKY, sakina, { s: SSK, t, move: smove, mt: grin ? t - b2s - 1.0 : t, yaw: sr < 1 ? Math.PI / 2 : (grin ? -.1 : .5), expr: sexpr, amp: amp('SAKINA') }, { w: 110 });
  if (cryK > 0) { const p = proj(1, cam, SKX, SKY), f = faceOf('sakina', p.x, p.y, SSK * p.s); g += cryGag(f[0], f[1] + 10 * p.s, p.s, t, cryK, p.y + 4, p.x); }
  const q1 = on('q1', t, .1, .3), jump = q1 ? Math.abs(Math.sin((t - LS('q1')) * 9)) * 60 : 0;
  g += at(1, cam, 700, 1268 - jump, susu, { s: SQ, t, flip: 1, armL: q1 ? 165 : (cryK > .3 ? 40 : 20), armR: q1 ? 165 : 20, mouth: q1 ? 'grin' : (cryK > .3 && !grin ? 'o' : 'frown'), amp: amp('QASIM'), brow: cryK > .3 && !grin ? .8 : 0, look: [14, -6], blink: blink(t) }, { w: 110, h: jump });
  g += S.front;
  // labels
  if (t < 2.6) { const p = proj(bd, cam, bx, by); g += `<g transform="translate(${clamp(p.x, 260, 820)},330) scale(${back(seg(t, .5, .8))})"><rect x="-200" y="-70" width="400" height="120" rx="24" fill="${SPK.BABA}" stroke="#fff" stroke-width="7"/>${T(0, 18, 76, 'BABA', { sw: 0, ls: 6 })}${T(0, 104, 42, 'QASIM AUR SAKINA KE BABA', { fill: '#fff', shadow: '#000' })}</g>`; }
  if (k2) g += `<g transform="translate(540,300) scale(${back(seg(t, k2s, k2s + .3))})">${burst(0, 0, 230, '#7fd0ff', 'BUAAAA!', 92, -6, 1)}</g>` + T(540, 520, 64, 'CRYING GIRL ON!', { fill: '#fff', shadow: '#2f7fd6', op: clamp((t - k2s - .4) * 4) });
  if (cryK > .2 && !grin) g += violin(150, 640, t, cryK);
  if (b2) g += hookBig('BABA', 'HAAR GAYE!', t, b2s + .3, b2s + .6, 280);
  if (grin && t < b2s + 2.6) { const p = proj(1, cam, SKX, SKY), f = faceOf('sakina', p.x, p.y, SSK * p.s); g += burst(f[0] + 150, f[1] - 60, 70, '#fff', 'TING!', 34, 8, 1 - seg(t, b2s + 1.6, b2s + 2.0)); }
  if (q1) g += `<g transform="translate(540,330) scale(${back(seg(t, LS('q1'), LS('q1') + .3))})">${T(0, 0, 110, 'MELA!', { fill: C.gold, shadow: C.red })}</g>`;
  return g + capFor('home', t);
}

// ---- mela positions (stall row layer d=1.3 coordinates for anyone standing at a stall) ----
const FAM = { qx: 585, sx: 775, mx: 400, bx: 220 };          // family at the choodiyan stall (action plane d=1)
const PARIX = 2700;                                        // where Pari ends up crying (action plane), in front of the jalebi stall
const GILL = [1650, 1112], POLD = 1.22;                    // Officer Gill at the Khoya-Paaya booth (d=1.22)
const susuFly = (x, y, sc, t, o = {}) => susu(Object.assign({ x, y, s: sc, t, power: .9, cape: 1, crown: 1, shades: 1, armL: 150, armR: 150, legL: -22, legR: 12, mouth: 'grin', blink: blink(t, 3) }, o));
function carryPari(x, y, sc, t, o = {}) {   // Susuman with Pari on his arm (x,y = his feet point)
  const P = susuFly(x, y, sc, t, Object.assign({ armL: 105, armR: 120 }, o.su || {}));
  return P + pari({ x: x + (o.flip || 1) * 105 * sc, y: y - 120 * sc, s: .82 * sc, t, move: o.pmove || 'idle', mt: t, yaw: o.pyaw ?? .5, expr: o.pexpr || 'happy', amp: amp('PARI') });
}

// ============ 3 MELA — crane down from the moon + giant wheel; the family arrives; Ammar mistri calls out at the chakri; Pari chases a balloon and is lost in the crowd ============
function E_mela(t) {
  const D = sdur('mela'), m1 = on('m1', t), p1s = LS('p1'), q2s = LS('q2');
  const cr = ease(seg(t, 0, 3.4));
  let cam = camM(lerp(640, 500, cr), lerp(.8, .9, cr), 1150, 540, lerp(-900, 1180, cr));
  cam = lerpCam(cam, camM(PARIX - 120, 1.0, 1150, 540, 1180), ease(seg(t, 6.6, 9.4)));
  cam = lerpCam(cam, camM(PARIX + 40, 1.25, 1150, 540, 1150), ease(seg(t, p1s - .2, p1s + .8)));
  cam = lerpCam(cam, camM(480, 1.22, 1150, 540, 1150), ease(seg(t, q2s - .45, q2s - .05)));
  const S = mela(t, cam, { flow: 1, flowFG: 1, mic: 0 });
  let g = S.back;
  // background walkers (d=1.08) crossing between Pari and her parents
  for (let i = 0; i < 6; i++) { const x = 1700 + ((i * 260 + t * (i % 2 ? 90 : -90)) % 1600 + 1600) % 1600; g += layer(1.08, cam, crowdP(x, 1215, .9, i + 40, t, { walk: 1, balloon: i === 2 })); }
  // Ammar mistri at the chakri gate with a megaphone
  g += at(1.15, cam, 760, 1150, ammar, { s: 1, t, move: m1 ? 'shout' : 'wave', mt: m1 ? t - LS('m1') : t, yaw: .5, expr: 'happy', amp: amp('AMMAR') }, { w: 120 });
  { const p = proj(1.15, cam, 760, 1150); if (m1) g += `<g transform="translate(${p.x + 90 * p.s},${p.y - 520 * p.s}) scale(${p.s})"><path d="M0,0 l90,-40 v100 l-90,-40z" fill="#e5463b" stroke="${C.ink}" stroke-width="5"/>${[0, 1, 2].map(i => `<path d="M${110 + i * 26},-30 q22,38 0,76" stroke="#fff" stroke-width="7" fill="none" opacity="${Math.abs(Math.sin(t * 8 + i)).toFixed(2)}"/>`).join('')}</g>`; }
  // the family walks in from the left
  const fw = ease(seg(t, 1.2, 6.0)), walking = fw > 0 && fw < 1;
  g += at(1.02, cam, lerp(-600, 40, fw), 1240, babaK, { s: SBA, t, move: walking ? 'walk' : 'idle', mt: t, yaw: walking ? Math.PI / 2 : .3, expr: 'happy' }, { w: 120 });
  g += at(1.04, cam, lerp(-450, 220, fw), 1232, mama, { s: SMA, t, phone: 0, look: [10, 0], blink: blink(t, 3) }, { w: 140 });
  g += at(1, cam, lerp(-180, 610, fw), 1262, sakina, { s: SSK, t, move: walking ? 'walk' : (t > q2s ? 'listen' : 'idle'), mt: t, yaw: walking ? Math.PI / 2 : -.3, expr: t > q2s ? 'surprised' : 'happy' }, { w: 110 });
  const qb = walking ? Math.abs(Math.sin(t * 10)) * 18 : 0, q2 = on('q2', t, .1, .4);
  g += at(1, cam, lerp(-300, 430, fw), 1268 - qb, susu, { s: SQ, t, flip: 1, legL: walking ? walkK(t, 26) : 0, legR: walking ? -walkK(t, 26) : 0, armL: q2 ? 120 : 25, armR: q2 ? 30 : 25, mouth: q2 ? 'talk' : 'grin', amp: amp('QASIM'), brow: q2 ? .7 : 0, look: q2 ? [14, -8] : [12, -6], blink: blink(t) }, { w: 110, h: qb });
  // Pari + her parents at the balloon stall; the red balloon floats off, Pari runs after it, the crowd closes in
  const bal = seg(t, 6.2, 9.0), run = ease(seg(t, 6.6, 8.8)), lost = t > 8.8;
  const PX = lerp(1900, PARIX, run);
  g += at(1.08, cam, 1800, 1222, pariMa, { s: 1, t, move: lost ? 'idle' : 'talk', mt: t, yaw: lost ? .9 : -.4, expr: 'happy' }, { w: 120 });
  g += at(1.08, cam, 1660, 1222, pariPa, { s: 1, t, move: 'idle', mt: t, yaw: lost ? .9 : .4, expr: 'happy' }, { w: 120 });
  if (lost && t < q2s) { const p = proj(1.08, cam, 1720, 1222); g += jalebiPlate(p.x, p.y - 330 * p.s, .8 * p.s); }
  const pmove = t < 6.6 ? 'idle' : (run < 1 ? 'run' : (t > p1s - .3 ? 'cry' : 'scared'));
  g += at(1, cam, PX, 1262, pari, { s: 1, t, move: pmove, mt: t, yaw: run > 0 && run < 1 ? Math.PI / 2 : .2, expr: t > p1s - .3 ? 'cry' : (lost ? 'scared' : 'happy'), amp: amp('PARI') }, { w: 70 });
  if (t < 6.6) { const p = proj(1, cam, PX, 1262); g += buddhi(p.x + 50 * p.s, p.y - 260 * p.s, .55 * p.s, 10); }
  if (bal > 0 && bal < 1) { const p = proj(1.3, cam, lerp(1050, 2500, bal), lerp(800, 120, bal)); g += gubbara(p.x, p.y, .9 * p.s, C.red, t, 120); }
  // the crowd closes in front of Pari (d=.9)
  const cl = seg(t, 8.2, 9.6);
  if (cl > 0 && cl < 1) for (let i = 0; i < 4; i++) g += layer(.9, cam, crowdP(lerp(2050 + i * 180, 3250 + i * 180, cl) - (i % 2) * 300, 1300, 1.05, i + 60, t, { walk: 1, back: i % 2 }));
  if (t > p1s - .2 && t < q2s - .2) { const p = proj(1, cam, PARIX, 1262); g += marker(p.x, p.y - 160 * p.s, 170 * p.s, t, C.red, 'GUM!'); }
  g += S.front;
  if (t < 3.6) g += hookBig('CHALO', 'MELA!', t, .5, .9, 300);
  if (t > p1s - .2 && t < q2s - .3) g += hookBig('EK BACHCHI', 'GUM!', t, p1s - .2, p1s + .1, 260);
  if (t > q2s - .1) { const k = back(seg(t, q2s - .1, q2s + .25)), ic = camM(PARIX, .95, 620, 800, 1150), sub = mela(t, ic, { noFG: 1 }); g += inset(800, 560, 200 * k, sub.back + at(1, ic, PARIX, 1262, pari, { s: 1, t, move: 'cry', mt: t, yaw: .2, expr: 'cry' }, { w: 70 }), 'insM'); }
  return g + capFor('mela', t);
}

// ============ 4 CRY — "Mama! Suusuu aayi hai!" → "Phir se?!" + counter; Mama wants to go with him (secret in danger!) → Sakina's crying act → Mama gives in → "Jaa jaldi!" → Qasim zips to the WC booth ============
function E_cry(t) {
  const D = sdur('cry'), k3s = LS('k3'), a2s = LS('a2'), k4s = LS('k4'), cryK = seg(t, k3s - .1, k3s + .4) * (1 - seg(t, a2s + .6, a2s + 1.0)), grin = t > a2s + .7;
  const zip = seg(t, LE('k4') - .1, LE('k4') + 1.3);
  let cam = camM(640, 1.2, 1150, 540, 1150);
  cam = lerpCam(cam, camM(700, 1.42, 1150, 540, 1110), ease(seg(t, k3s - .3, k3s + .5)) * (1 - ease(seg(t, a2s, a2s + 1))));
  cam = lerpCam(cam, camM(620, 1.1, 1150, 540, 1170), ease(seg(t, a2s + .8, k4s)));
  cam = lerpCam(cam, camM(1.3 * (MWC.x + MWC.w / 2 - 540) + 540 - 150, 1.15, 1150, 540, 1150), ease(zip));
  const S = mela(t, cam, { open: crySceneDoor(t) });
  let g = S.back;
  const q3 = on('q3', t), a1 = on('a1', t), a2 = on('a2', t), k4 = on('k4', t), danger = t > LE('a1') && t < k3s + .3;
  // Baba at the jalebi stall (in the background, d=1.25), eating
  g += at(1.25, cam, 2210, 1118, babaK, { s: SBA, t, move: 'idle', mt: t, yaw: .4, expr: 'happy' }, { w: 120 }) + (() => { const p = proj(1.25, cam, 2210, 1118); return jalebiPlate(p.x + 70 * p.s, p.y - 300 * p.s, .7 * p.s); })();
  // Mama: annoyed, then reaches for Qasim's hand, then turns to Sakina, then walks to the choodi counter
  const mgo = ease(seg(t, a2s + .8, a2s + 2.4)), reach = ease(seg(t, LE('a1') - .2, LE('a1') + .3)) * (1 - ease(seg(t, k3s, k3s + .4)));
  const MX = lerp(FAM.mx - 40 * reach, 520, mgo), MD = lerp(1.06, 1.18, mgo);
  g += at(MD, cam, MX, lerp(1240, 1170, mgo), mama, { s: SMA, t, phone: 0, look: cryK > .2 ? [14, -6] : (a1 || reach > 0 ? [-14, 4] : [0, 6]), brow: a1 ? 1 : (cryK > .2 ? .8 : .3), amp: amp('MAMA'), tilt: a1 ? -6 : 0, blink: blink(t, 2.6) }, { w: 140 });
  // Sakina
  const SX = lerp(FAM.sx, 640, mgo), SD = lerp(1, 1.12, mgo);
  const smove = cryK > .1 && !grin ? 'cry' : (k4 ? 'thumbsUp' : (grin ? 'idle' : 'idle'));
  g += at(SD, cam, SX, lerp(1262, 1200, mgo), sakina, { s: SSK, t, move: smove, mt: k4 ? t - k4s : t, yaw: grin ? -.6 : .3, expr: cryK > .1 && !grin ? 'cry' : (grin ? 'wink' : (danger ? 'scared' : 'smug')), amp: amp('SAKINA') }, { w: 110 });
  if (cryK > 0) { const p = proj(SD, cam, SX, 1262), f = faceOf('sakina', p.x, p.y, SSK * p.s); g += cryGag(f[0], f[1] + 10 * p.s, p.s, t, cryK, p.y + 4, p.x); }
  // Qasim: wobbling, then zips off to the WC booth (d=1 → 1.3)
  const dd = Math.sin(t * 16), wob = !zip && (t < k4s);
  let qd = 1, qx = FAM.qx, qy = 1268;
  if (zip > 0) { const z = eout(zip); qd = lerp(1, 1.3, z); qx = lerp(xAt(FAM.qx, 1, qd, cam), xAt(MWC.x + MWC.w / 2, 1.3, qd, cam), z); qy = lerp(1268, 1085, z); }
  if (zip < 1) g += `<g opacity="${1 - seg(zip, .85, 1)}">` + at(qd, cam, qx, qy, susu, { s: SQ, t, flip: zip > 0 ? 1 : 1, legL: zip > 0 ? walkK(t, 34) : (wob ? 16 + 6 * dd : 0), legR: zip > 0 ? -walkK(t, 34) : (wob ? -16 + 6 * dd : 0), armL: wob ? 4 : 35, armR: wob ? 4 : 35, mouth: q3 ? 'wobble' : (danger ? 'o' : (k4 ? 'grin' : 'wobble')), amp: amp('QASIM'), brow: danger ? 1 : .8, tilt: wob ? 6 * dd : 0, look: danger ? [-10, -10] : [10, -4], blink: blink(t) }, { w: 110 }) + '</g>';
  if (zip > 0 && zip < 1) { const p = proj(qd, cam, qx, qy); g += speed(p.x - 40, p.y - 150 * p.s, 1, .8, 5); }
  g += S.front;
  if (zip > 0 && zip < .8) g += `<rect width="1080" height="1920" fill="#fff" opacity="${.12 * Math.sin(zip * Math.PI)}"/>`;
  g += tally(6, 'AAJ SUUSUU BREAK:', seg(t, LS('a1') + .2, LS('a1') + .5) * (1 - seg(t, LE('a1') + .3, LE('a1') + .5)));
  if (danger) g += hookBig('RAAZ', 'KHATRE MEIN!', t, LE('a1') + .2, LE('a1') + .5, 270);
  if (on('k3', t, .1, .3)) g += `<g transform="translate(540,300) scale(${back(seg(t, k3s, k3s + .3))})">${burst(0, 0, 230, '#7fd0ff', 'BUAAAA!', 92, 6, 1)}</g>` + T(540, 520, 60, 'CRYING GIRL PHIR SE!', { fill: '#fff', shadow: '#2f7fd6', op: clamp((t - k3s - .4) * 4) });
  if (cryK > .2 && !grin) g += violin(900, 560, t, cryK);
  if (a2) g += hookBig('MAMA BHI', 'HAAR GAYIN!', t, a2s + .3, a2s + .6, 280);
  if (zip > .85) { const p = proj(1.3, cam, MWC.x + MWC.w / 2, 900); g += burst(p.x, p.y - 20, 100, '#fff', 'DHAP!', 44, 6, 1 - seg(t, LE('k4') + 1.25, D)); }
  return g + capFor('cry', t);
}
// cry scene: the WC booth door closes as he arrives
const crySceneDoor = t => { const z = seg(t, LE('k4') - .1, LE('k4') + 1.3); return seg(z, .55, .7) * (1 - seg(z, .88, 1)); };

// ============ 5 POWER — the mela WC booth glows gold (Baba in the blurred foreground munches jalebi, never looks), FLUUSH, power bar, SUUU-SUUU-MAN! ============
function E_power(t) {
  const nE = LE('n2'), q = LS('qp'), open = ease(seg(t, q - .45, q - .3)), glow = Math.max(seg(t, .2, nE), open);
  const cam = camM(lerp(3250, 3320, ease(seg(t, 0, q))), lerp(1.0, 1.35, ease(seg(t, 0, q - .4))) + .06 * open, 1050, 540, 1020);
  const S = mela(t, cam, { open, glow, noHeads: 1 });
  let g = S.back;
  const dp = proj(1.3, cam, MWC.x + MWC.w / 2, 900);
  if (open > 0) g += shafts(dp.x, dp.y, -Math.PI / 2, 14, 1900, .5 * open, t * 3, '#fff6c8', .45, .05);
  if (open > 0) {
    const st = eout(seg(t, q - .3, q + .5)), hero = ease(seg(t, q, q + .3)), up = ease(seg(t, LE('qp') + .5, sdur('power')));
    const dd = lerp(1.3, .95, st);
    g += at(dd, cam, xAt(MWC.x + MWC.w / 2 - 40 * st, 1.3, dd, cam), lerp(1080, 1240, st) - up * 1300, susu, { s: lerp(SQ, .78, st), t, power: open, cape: open, crown: seg(t, q, q + .3), shades: seg(t, LE('qp') + .15, LE('qp') + .45), armR: lerp(20, 165, hero), fistR: hero > .4, armL: lerp(20, 40, hero), amp: amp('QASIM'), mouth: 'smirk', blink: blink(t, 3), legL: up > 0 ? -20 : 0, legR: up > 0 ? 14 : 0 }, { w: 120, h: up * 1300, op: 1.2 });
    if (up > 0) { const p = proj(dd, cam, xAt(MWC.x + MWC.w / 2, 1.3, dd, cam), 1240 - up * 1300); g += speed(p.x, p.y + 120, 0, .7, 3); }
  }
  // Baba (blurred, foreground) happily eating jalebi; never looks up
  g += `<g filter="url(#dofNear2)">${at(.78, cam, 3790, 1430, babaK, { s: SBA, t, move: 'idle', mt: t, yaw: .5, expr: 'happy' }, { w: 0 })}${(() => { const p = proj(.78, cam, 3790, 1430); return jalebiPlate(p.x + 70 * p.s, p.y - 300 * p.s, .7 * p.s); })()}</g>`;
  g += S.front;
  g = shake(g, (open > 0 && open < 1) ? 1 : (glow > .8 && open === 0 ? .3 : 0), t);
  if (t > .8 && t < 2.4) { const k = back(seg(t, .8, 1.1)); g += `<g transform="translate(540,640) scale(${k})">${burst(0, 0, 230, C.gold, 'FLUUSH!', 104, -8, 1 - seg(t, 2.1, 2.4))}</g>`; }
  const p = ease(seg(t, 1.0, nE));
  if (t > .9 && open < 1) g += `<g opacity="${seg(t, .9, 1.1) * (1 - open)}"><rect x="140" y="150" width="800" height="150" rx="30" fill="#000" opacity=".75"/>${T(540, 212, 62, 'SUUSUU POWER', { fill: C.gold, sw: 0, ls: 6 })}<rect x="190" y="235" width="700" height="44" rx="22" fill="#333" stroke="#fff" stroke-width="5"/><rect x="194" y="239" width="${692 * p}" height="36" rx="18" fill="${p > .99 ? '#ff3b30' : C.gold}"/>${T(540, 272, 40, Math.round(p * 100) + '%', { sw: 6 })}${emblem(180, 257, .7)}</g>`;
  if (t > 1.6 && open === 0) { const k = back(seg(t, 1.6, 1.9)), ic = camM(PARIX, .95, 660, 820, 1150), sub = mela(t, ic, { noFG: 1 }); g += inset(820, 600, 190 * k, sub.back + at(1, ic, PARIX, 1262, pari, { s: 1, t, move: 'cry', mt: t, yaw: .2, expr: 'cry' }, { w: 70 }), 'insP'); }
  if (t > q) { const k = back(seg(t, q, q + .3)); g += `<g transform="translate(540,330) scale(${lerp(2.2, 1, clamp(k))}) rotate(-4)" opacity="${clamp(k * 2)}"><rect x="-460" y="40" width="920" height="40" rx="20" fill="${C.red}" transform="skewX(-20)"/>${T(0, 40, 138, 'SUUU-SUUU-MAN!', { shadow: C.red, sw: 12, ls: 2 })}</g>`; }
  return g + capFor('power', t);
}

// ============ 6 RESCUE — Susuman soars above the mela and scans the crowd, lands by Pari: "Daro mat!"; she knows her name + gali; they fly up and spot her Mama Papa ============
const PPA = [1760, 1222], PMA = [1900, 1222];   // Pari's parents searching near the Khoya-Paaya booth (d=1.1)
function E_rescue(t) {
  const D = sdur('rescue'), land = 2.6, q5e = LE('q5'), lift = seg(t, q5e, q5e + 2.2), p3s = LS('p3');
  // Susuman's feet point (action plane)
  let sx, sy, fly = 1, carrying = t > q5e - .1;
  if (t < land) { const k = ease(seg(t, 0, land)); sx = lerp(1300, PARIX - 230, k); sy = lerp(420, 1268, k ** 1.6) + (t < 1.8 ? 30 * Math.sin(t * 3) : 0); }
  else if (!carrying) { sx = PARIX - 230; sy = 1268; fly = 0; }
  else { const k = ease(lift); sx = lerp(PARIX - 230, PARIX - 380, k); sy = lerp(1268, 520, k) + 14 * Math.sin(t * 3); }
  let cam = camM(lerp(1600, 2350, ease(seg(t, 0, 2.0))), .78, 980, 540, 620);
  cam = lerpCam(cam, camM(PARIX - 110, 1.3, 1150, 540, 1110), ease(seg(t, land - .8, land + .2)));
  cam = lerpCam(cam, camM(PARIX - 520, .74, 900, 540, 640), ease(seg(t, q5e + .2, q5e + 2.4)));
  const S = mela(t, cam, { noHeads: t < land ? 1 : 0 });
  let g = S.back;
  // Pari's parents searching (d=1.1)
  g += at(1.1, cam, PPA[0], PPA[1], pariPa, { s: 1, t, move: 'holdHead', mt: t, yaw: .3, expr: 'scared' }, { w: 120 });
  g += at(1.1, cam, PMA[0], PMA[1], pariMa, { s: 1, t, move: 'cry', mt: t, yaw: -.2, expr: 'cry' }, { w: 120 });
  // search beam while flying over
  if (t < land - .3) { const P = proj(1, cam, sx, sy - 300), bx = lerp(1300, PARIX, ease(seg(t, .3, 1.9))), B = proj(1, cam, bx, 1250); g += `<path d="M${P.x},${P.y} L${B.x - 140},${B.y} L${B.x + 140},${B.y}Z" fill="#fff3b0" opacity="${.28 * (1 - seg(t, land - .6, land - .3))}" style="mix-blend-mode:screen"/><ellipse cx="${B.x}" cy="${B.y}" rx="150" ry="40" fill="#fff3b0" opacity=".35" style="mix-blend-mode:screen"/>`; }
  // Pari (until she is carried)
  const calm = seg(t, LS('q4') + .6, LS('q4') + 1.2);
  if (!carrying) g += at(1, cam, PARIX, 1262, pari, { s: 1, t, move: calm < 1 ? 'cry' : (on('p2', t) ? 'talk' : 'idle'), mt: t, yaw: -.4, expr: calm < .5 ? 'cry' : (on('p2', t) ? 'happy' : (t > LE('p2') ? 'happy' : 'surprised')), amp: amp('PARI') }, { w: 70 });
  // Susuman
  const P = proj(1, cam, sx, sy), sc = .62 * P.s, h = Math.max(0, 1268 - sy);
  g += liftShadow(P.x - 20 * P.s, proj(1, cam, sx, 1272).y, 100 * P.s, h, { dx: -30 * P.s, skew: 35 });
  if (!carrying) g += susuFly(P.x, P.y, sc, t, { rot: fly ? 20 * (1 - seg(t, land - .4, land)) : 0, armL: fly ? 150 : 30, armR: fly ? 160 : (on('q4', t) ? 70 : 30), legL: fly ? -22 : 0, legR: fly ? 12 : 0, mouth: on('q4', t) || on('q5', t) ? 'talk' : 'grin', amp: amp('QASIM') });
  else g += carryPari(P.x, P.y, sc, t, { pmove: on('p3', t, .1, .6) ? 'point' : 'idle', pexpr: t > p3s - .2 ? 'happy' : 'surprised', su: { mouth: 'grin', rot: lift > 0 && lift < 1 ? -8 : 0, legL: -22, legR: 12 } });
  if (t < land) g += speed(P.x - 120, P.y - 200 * sc, 1, .6, 4);
  if (lift > 0 && lift < 1) g += `<path d="M${P.x},${P.y + 40} L${P.x},${P.y + 520}" stroke="${C.gold}" stroke-width="34" opacity="${.45 * (1 - lift)}" stroke-linecap="round"/>`;
  g += S.front;
  if (t < 1.9) g += T(540, 300, 84, 'KAHAN HAI WOH?', { fill: '#fff', shadow: '#000', op: clamp(t * 3) });
  if (t > 1.8 && t < land + .3) { const p = proj(1, cam, PARIX, 1262); g += marker(p.x, p.y - 160 * p.s, 170 * p.s, t, C.gold, 'MIL GAYI!'); }
  if (on('p2', t)) { const k1 = back(seg(t, LS('p2') + .2, LS('p2') + .5)), k2 = back(seg(t, LS('p2') + 1.6, LS('p2') + 1.9)); g += `<g transform="translate(540,250) scale(${k1})"><rect x="-300" y="-56" width="600" height="96" rx="20" fill="#fff" stroke="${C.ink}" stroke-width="6"/>${T(0, 10, 58, 'NAAM: PARI', { fill: SPK.PARI, sw: 0 })}</g>` + (k2 > 0 ? `<g transform="translate(540,370) scale(${k2})"><rect x="-360" y="-56" width="720" height="96" rx="20" fill="#fff" stroke="${C.ink}" stroke-width="6"/>${T(0, 10, 54, 'GHAR: GULMOHAR GALI', { fill: '#1f7a78', sw: 0 })}</g>` : ''); }
  if (t > LE('p2') && t < LE('p2') + 1.0) g += `<g transform="translate(540,330) scale(${back(seg(t, LE('p2'), LE('p2') + .3))})">${burst(0, 0, 200, C.gold, 'SHABASH!', 70, -6, 1 - seg(t, LE('p2') + .7, LE('p2') + 1.0))}</g>`;
  if (t > p3s - .1) { const p = proj(1.1, cam, (PPA[0] + PMA[0]) / 2, PPA[1]); g += marker(p.x, p.y - 260 * p.s, 220 * p.s, t, C.red, 'WOH RAHE!'); }
  return g + capFor('rescue', t);
}

// ============ 7 REUNITE — Officer Gill's announcement at the Khoya-Paaya booth; Susuman sets Pari down, the family hugs; he vanishes; Gill's lesson ============
function E_reunite(t) {
  const D = sdur('reunite'), o1 = on('o1', t), o2 = on('o2', t), dn = seg(t, 4.1, 5.2), put = t > 5.2, goneT = 6.1;
  let cam = camM(1980, 1.08, 1150, 540, 1160);
  cam = lerpCam(cam, camM(1860, 1.0, 1150, 540, 1150), ease(seg(t, 3.6, 5.0)));
  cam = lerpCam(cam, camM(2000, 1.2, 1150, 540, 1140), ease(seg(t, LS('o2') - .4, LS('o2') + .8)));
  const S = mela(t, cam, { mic: o1 });
  let g = S.back;
  // Ammar in the background, clapping after the reunion
  g += at(1.18, cam, 2150, 1140, ammar, { s: 1, t, move: t > 5.6 ? 'clap' : 'idle', mt: t, yaw: -.5, expr: t > 5.6 ? 'happy' : 'neutral' }, { w: 120 });
  // Officer Gill at the booth with the mic
  g += at(POLD, cam, 1823, 1112, officer, { s: 1, t, move: o1 ? 'talk' : (o2 ? 'talk' : (t > goneT && t < LS('o2') ? 'surprised' : 'idle')), mt: t, yaw: o2 ? -.4 : .2, expr: t > goneT && t < LS('o2') ? 'surprised' : 'happy', amp: amp('OFFICER GILL') }, { w: 120 });
  if (o1) { const p = proj(POLD, cam, 1823, 1112); g += `<g transform="translate(${p.x + 60 * p.s},${p.y - 470 * p.s}) scale(${p.s})"><rect x="-10" y="0" width="20" height="60" rx="8" fill="#333"/><circle cx="0" cy="-10" r="20" fill="#555" stroke="${C.ink}" stroke-width="4"/>${[0, 1, 2].map(i => `<path d="M${36 + i * 26},-40 q22,30 0,60" stroke="#fff" stroke-width="6" fill="none" opacity="${Math.abs(Math.sin(t * 8 + i)).toFixed(2)}"/>`).join('')}</g>`; }
  // Pari's parents run in from the left
  const run = ease(seg(t, 1.2, 3.8)), hug = seg(t, 5.3, 5.9);
  const pa = lerp(1080, 1520, run), ma = lerp(1180, 1660, run);
  const pm = run > 0 && run < 1 ? 'run' : (hug > 0 ? 'celebrate' : 'scared');
  g += at(1.05, cam, pa, 1230, pariPa, { s: 1, t, move: pm, mt: t, yaw: run < 1 ? Math.PI / 2 : .4, expr: hug > 0 ? 'laugh' : 'scared' }, { w: 120 });
  g += at(1.05, cam, ma, 1230, pariMa, { s: 1, t, move: hug > 0 ? 'laugh' : (pm === 'run' ? 'run' : 'cry'), mt: t, yaw: run < 1 ? Math.PI / 2 : -.3, expr: hug > 0 ? 'love' : 'cry' }, { w: 120 });
  // Susuman flies down with Pari, sets her down; she runs to her parents
  const SX = 1880, PXs = lerp(1800, 1640, ease(hug));
  if (!put) { if (t > 4.0) { const P = proj(1, cam, lerp(2300, SX, eout(dn)), lerp(300, 1268, eout(dn))); g += liftShadow(P.x, proj(1, cam, SX, 1272).y, 100 * P.s, 1268 - lerp(300, 1268, eout(dn))) + carryPari(P.x, P.y, .62 * P.s, t, { su: { rot: -10 * (1 - dn) }, pexpr: 'happy' }); } }
  else {
    g += at(1, cam, PXs, 1262, pari, { s: 1, t, move: hug < 1 ? 'run' : (o2 ? 'listen' : 'celebrate'), mt: t, yaw: hug < 1 ? -Math.PI / 2 : .2, expr: 'laugh' }, { w: 70 });
    if (t < goneT + .2) { const op = 1 - seg(t, goneT - .05, goneT + .15), P = proj(1, cam, SX, 1268); g += `<g opacity="${op}">` + shadow(P.x - 20, P.y + 4, 100 * P.s, .8, { dx: -30, skew: 35 }) + susuFly(P.x, P.y, .62 * P.s, t, { armL: 30, armR: 150, legL: 0, legR: 0, wink: t > goneT - .7 ? 1 : 0, flip: -1 }) + '</g>'; }
    if (t > goneT - .1 && t < goneT + 1) { const p = proj(1, cam, SX, 900); g += `<path d="M${p.x},${p.y + 300} L${p.x + 220},${p.y - 1600}" stroke="${C.gold}" stroke-width="44" opacity="${.6 * (1 - seg(t, goneT, goneT + .6))}" stroke-linecap="round"/>`; for (let i = 0; i < 8; i++) g += `<circle cx="${p.x + hs(i) * 160 - 40}" cy="${p.y + 200 - hs(i + 4) * 400 - (t - goneT) * 300}" r="${8 + 6 * hs(i + 2)}" fill="${C.gold}" opacity="${1 - seg(t, goneT, goneT + 1)}"/>`; }
  }
  if (hug >= 1 && t < LS('o2') + 1) for (let i = 0; i < 4; i++) { const p = ((t - 5.9) * .7 + i / 4) % 1, q = proj(1.05, cam, 1560 + i * 50, 1230 - 620 - p * 160); g += heart(q.x, q.y, .55 * q.s, 1 - p); }
  g += S.front;
  if (o1) g += T(540, 300, 74, 'KHOYA-PAAYA BOOTH', { fill: C.gold, shadow: '#000', op: clamp((t - .9) * 4) });
  if (t > goneT && t < LS('o2') - .2) g += T(540, 330, 96, 'WOH KAHAN GAYA?', { fill: C.gold, shadow: '#000', op: clamp((t - goneT) * 3) });
  if (o2) g += hookBig('NAAM-PATA', 'YAAD RAKHO!', t, LS('o2') + .3, LS('o2') + .7, 250);
  return g + capFor('reunite', t);
}

// ============ 8 ENDING — the family at the jalebi stall: "Qasim! Kahan the tum?" → "Kuch nahi Mama!" + wink; Baba: "koi SUPERHERO aaya tha!"; "Phir se suusuu..." → "Phir se?!" ============
function E_ending(t) {
  const D = sdur('ending'), a3 = on('a3', t), q6 = on('q6', t, .1, .3), b3 = on('b3', t), q7 = on('q7', t, .1, .3), a4 = on('a4', t, .05, .6), zip = seg(t, LE('a4') + .3, LE('a4') + 1.1);
  let cam = camM(2711, 1.05, 1150, 540, 1160);
  cam = lerpCam(cam, camM(2860, 1.3, 1150, 540, 1120), ease(seg(t, LS('q6') - .3, LS('q6') + .3)) * (1 - ease(seg(t, LE('q6') + .4, LS('b3') + .3))));
  cam = lerpCam(cam, camM(2780, 1.12, 1150, 540, 1150), ease(seg(t, LS('q7') - .3, D)));
  const S = mela(t, cam, {});
  let g = S.back;
  const wk = t > LE('q6') - .4 && t < LE('q6') + 1.0;
  g += at(1.05, cam, 2288, 1232, babaK, { s: SBA, t, move: b3 ? 'present' : (a4 ? 'laugh' : 'idle'), mt: t, yaw: .4, expr: b3 ? 'happy' : (a4 ? 'laugh' : 'happy'), amp: amp('BABA') }, { w: 120 });
  { const p = proj(1.05, cam, 2288, 1232); g += jalebiPlate(p.x + 80 * p.s, p.y - 290 * p.s, .7 * p.s); }
  g += at(1.05, cam, 2518, 1232, mama, { s: SMA, t, phone: 0, look: a3 || a4 ? [14, -4] : [10, 4], brow: a4 ? 1 : (a3 ? .7 : .2), amp: amp('MAMA'), tilt: a4 ? -8 : 0, blink: blink(t, 2.7) }, { w: 140 });
  g += at(1, cam, 2831, 1262, sakina, { s: SSK, t, move: wk ? 'thumbsUp' : 'idle', mt: t - LE('q6') + .4, yaw: wk ? -.1 : .4, expr: wk ? 'wink' : (a4 ? 'laugh' : 'smug') }, { w: 110 });
  { const p = proj(1, cam, 2831, 1262); for (let i = 0; i < 4; i++) g += `<ellipse cx="${p.x - 70 * p.s + i * 8}" cy="${p.y - 250 * p.s}" rx="${16 * p.s}" ry="${16 * p.s}" fill="none" stroke="${MCOL[i]}" stroke-width="${6 * p.s}"/>`; }
  // Qasim strolls in from the right (from the WC booth), later zips back
  const inK = ease(seg(t, 0, .9)), dd = Math.sin(t * 16);
  let qx = lerp(3380, 3031, inK), qd = 1, qy = 1268;
  if (zip > 0) { qx = lerp(3031, 3500, eout(zip)); }
  g += at(qd, cam, qx, qy, susu, { s: SQ, t, flip: zip > 0 ? 1 : -1, legL: inK < 1 || zip > 0 ? walkK(t, 30) : (q7 ? 16 + 6 * dd : 0), legR: inK < 1 || zip > 0 ? -walkK(t, 30) : (q7 ? -16 + 6 * dd : 0), armL: q6 ? 20 : 25, armR: q6 ? 150 : 25, mouth: q7 ? 'wobble' : (q6 ? 'grin' : (b3 ? 'smirk' : 'frown')), amp: amp('QASIM'), brow: q7 ? 1 : 0, wink: t > LE('q6') - .4 && t < LE('q6') + .2 ? 1 : 0, tilt: q7 ? 6 * dd : 0, look: b3 ? [-14, -6] : [-12, -2], blink: blink(t) }, { w: 110 });
  if (zip > 0 && zip < 1) { const p = proj(1, cam, qx, qy); g += speed(p.x - 30, p.y - 150 * p.s, 1, .7, 4); }
  g += S.front;
  if (wk) g += T(540, 330, 90, 'SHHH... RAAZ!', { fill: C.gold, shadow: '#000', op: clamp((t - LE('q6') + .4) * 3) });
  if (b3) g += hookBig('BABA KO', 'NAHI PATA!', t, LS('b3') + 1.0, LS('b3') + 1.3, 260);
  g += tally(7, 'AAJ SUUSUU BREAK:', seg(t, LS('a4') + .1, LS('a4') + .4));
  return g + capFor('ending', t);
}

// ============ 9 END CARD — layered: brush sky (far) / bulbs + bunting (mid) / Susuman + Pari with her balloon (hero plane) / sparkles (near) ============
function E_endcard(t) {
  const cam = { x: 30 * Math.sin(t * .4), y: 0, z: 1 + .06 * t / sdur('endcard') };
  let g = layer(4, cam, brushBg(t + 90), { f: '' });
  g += layer(2.2, cam, bulbString(-200, 1300, 700, 40, 14, t, 2) + bunting(-200, 1300, 160, 50, 14, t, 1, 1.2));
  g += layer(1.3, cam, shadow(780, 1235, 90, .7) + gubbara(830, 760, 1.1, C.red, t, 330) + pari({ x: 780, y: 1230, s: 1.05, t, move: 'wave', mt: t, yaw: -.2, expr: 'happy' }), { f: '' });
  g += layer(1, cam, shadow(400, 1255, 200, .8) + lightPool(400, 1250, 380, 70, .8) + susu({ x: 400, y: 1250, s: .85, t, power: .8, cape: 1, crown: 1, shades: 0, armL: 40, armR: 150, mouth: 'grin', blink: blink(t, 2.6) }), { f: '' });
  let sp = ''; for (let i = 0; i < 9; i++) { const x = ((i * 157 + t * 60) % 1300) - 110, y = 200 + (i * 211) % 1500; sp += `<path d="M${x},${y - 40} L${x + 10},${y} L${x},${y + 40} L${x - 10},${y}Z M${x - 40},${y} L${x},${y - 10} L${x + 40},${y} L${x},${y + 10}Z" fill="${C.gold}" opacity=".8"/>`; }
  g += layer(.6, cam, sp);
  const n = L('n3'), half = LS('n3') + n.d * .55;
  if (t < half + .2) { g += `<g transform="translate(540,290) scale(${back(seg(t, .2, .5))})">${T(0, 0, 96, 'MELE MEIN', { shadow: '#000' })}</g><g transform="translate(540,410) scale(${back(seg(t, .5, .8))}) rotate(-3)">${T(0, 0, 104, 'HAATH PAKDO!', { fill: C.gold, shadow: C.red })}</g>`; }
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
