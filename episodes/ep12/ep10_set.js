// =================== EPISODE 8 "Gaay Aur Traffic Jam": the 2.5D CHOWK (petrol pump with its WC, Hara Bhara Park, shops),
// the road as three lane flats at different depths (A = near the pavement, B = the chowk / cow lane, C = front lane),
// desi vehicles (Baba's family car with the family in the windows, bus, painted truck, motorbike, auto) and LALI GAAY + CHHOTU the calf.
const LA = 1.15, LB = 1.0, LCd = .86;          // lane depths
const YA = 1330, YB = 1520, YC = 1770;         // lane contact lines (each in its own layer coords)
const ZX = 1450;                               // the zebra crossing / chowk centre (lane coords) — Lali sits here
const PARK = { x0: 1000, x1: 1880, gate: [1360, 1540] };   // park in the row (d=1.3)

// ---------- the cow (Lali) and the calf (Chhotu) ----------
// side body, head turned to the viewer. pose: stand | walk | sit. o.calf = small brown calf without horns.
function gaay(o) {
  o = Object.assign({ x: 0, y: 0, s: 1, flip: 1, pose: 'stand', t: 0, moo: 0, chew: 0, calf: 0, mood: '', blink: 0, rot: 0, tailK: 1, bell: 1, look: [0, 0] }, o);
  const W = o.calf ? '#d39a5c' : '#f6f1e6', P = o.calf ? '#fff5e6' : '#c9935e', INK = C.ink, sit = o.pose === 'sit', walk = o.pose === 'walk';
  const by = sit ? -120 : -250, t = o.t;
  let g = `<g transform="translate(${o.x.toFixed(1)},${o.y.toFixed(1)}) rotate(${o.rot}) scale(${(o.s * o.flip).toFixed(3)},${o.s.toFixed(3)})">`;
  const legA = walk ? 22 * Math.sin(t * 9) : 0;
  const legP = (lx, a, far) => sit ? `<ellipse cx="${lx + 30}" cy="-26" rx="62" ry="26" fill="${far ? '#d9d2c4' : W}" stroke="${INK}" stroke-width="5"/>`
    : `<g transform="translate(${lx},${by + 60}) rotate(${a})"><rect x="-17" y="0" width="34" height="${-by - 70}" rx="14" fill="${far ? (o.calf ? '#b7814a' : '#ddd6c8') : W}" stroke="${INK}" stroke-width="5"/><rect x="-19" y="${-by - 84}" width="38" height="26" rx="8" fill="#3a2a22" stroke="${INK}" stroke-width="4"/></g>`;
  // tail (swishes)
  const sw = Math.sin(t * 3.1) * 18 * o.tailK;
  g += `<path d="M-222,${by - 40} Q${-268 + sw},${by + 30} ${-252 + sw * 1.4},${by + 130}" stroke="${INK}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M-222,${by - 40} Q${-268 + sw},${by + 30} ${-252 + sw * 1.4},${by + 130}" stroke="${W}" stroke-width="9" fill="none" stroke-linecap="round"/><ellipse cx="${-252 + sw * 1.4}" cy="${by + 146}" rx="16" ry="26" fill="#3a2a22" stroke="${INK}" stroke-width="4"/>`;
  g += legP(-150, -legA, 1) + legP(130, legA, 1);
  // body + hump + patches
  g += `<ellipse cx="0" cy="${by}" rx="235" ry="${sit ? 100 : 108}" fill="${W}" stroke="${INK}" stroke-width="6"/>`;
  if (!o.calf) g += `<path d="M60,${by - 92} Q100,${by - 160} 150,${by - 96}" fill="${W}" stroke="${INK}" stroke-width="6"/>`;
  g += `<path d="M-150,${by - 70} q50,-30 90,10 q10,50 -40,60 q-60,0 -50,-70z" fill="${P}" opacity=".9"/><path d="M20,${by + 10} q40,-30 80,0 q0,40 -40,46 q-40,0 -40,-46z" fill="${P}" opacity=".85"/>`;
  g += legP(-110, legA, 0) + legP(170, -legA, 0);
  // neck + dewlap, collar with bell
  g += `<path d="M150,${by - 70} Q215,${by - 120} 262,${by - 120} L276,${by - 10} Q240,${by + 60} 170,${by + 40}Z" fill="${W}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  if (o.bell) { const bs = 6 * Math.sin(t * 7); g += `<path d="M190,${by - 92} Q236,${by - 40} 262,${by - 20}" stroke="#e5463b" stroke-width="12" fill="none"/><path d="M190,${by - 92} Q236,${by - 40} 262,${by - 20}" stroke="#ffd34a" stroke-width="4" stroke-dasharray="10 10" fill="none"/><g transform="translate(236,${by - 46}) rotate(${bs})"><path d="M-14,0 h28 l8,40 h-44z" fill="${C.gold}" stroke="${INK}" stroke-width="4"/><circle cx="0" cy="44" r="6" fill="#8a6a2a"/></g>`; }
  // head (turned to the viewer)
  const hx = 300, hy = by - 120 + (o.chew ? 3 * Math.sin(t * 14) : 0), lk = o.look;
  g += `<g transform="translate(${hx},${hy})">`;
  if (!o.calf) g += `<path d="M-46,-74 Q-70,-120 -40,-132 Q-44,-110 -26,-84Z M46,-74 Q70,-120 40,-132 Q44,-110 26,-84Z" fill="#efe2c2" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
  const ew = Math.sin(t * 2.3) * 6;
  g += `<g transform="rotate(${-14 + ew} -70 -56)"><ellipse cx="-104" cy="-56" rx="48" ry="20" fill="${W}" stroke="${INK}" stroke-width="5"/><ellipse cx="-108" cy="-56" rx="30" ry="10" fill="#f2a7a7"/></g><g transform="rotate(${14 - ew} 70 -56)"><ellipse cx="104" cy="-56" rx="48" ry="20" fill="${W}" stroke="${INK}" stroke-width="5"/><ellipse cx="108" cy="-56" rx="30" ry="10" fill="#f2a7a7"/></g>`;
  g += `<path d="M-72,-60 Q-80,-118 0,-122 Q80,-118 72,-60 Q76,10 52,60 L-52,60 Q-76,10 -72,-60Z" fill="${W}" stroke="${INK}" stroke-width="6"/>`;
  if (!o.calf) g += `<path d="M-24,-118 q24,-26 48,0 q-24,14 -48,0z" fill="${P}"/>`; else g += `<path d="M-30,-110 q12,-28 24,-6 q10,-26 30,4 q-26,14 -54,2z" fill="#a8703a"/>`;
  // eyes (big, cute)
  const bl = o.blink, happy = o.mood === 'happy' || o.mood === 'love', scared = o.mood === 'scared', sad = o.mood === 'sad';
  for (const s of [-1, 1]) {
    const ex = s * 34, ey = -46;
    if (happy) g += `<path d="M${ex - 18},${ey + 4} Q${ex},${ey - 18} ${ex + 18},${ey + 4}" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    else { const r = scared ? 26 : 22; g += `<ellipse cx="${ex}" cy="${ey}" rx="${r}" ry="${r * (1 - .9 * bl)}" fill="#fff" stroke="${INK}" stroke-width="4"/>`; if (bl < .6) g += `<circle cx="${ex + 4 + lk[0]}" cy="${ey + 2 + lk[1]}" r="${scared ? 9 : 13}" fill="#2a1a12"/><circle cx="${ex + lk[0]}" cy="${ey - 4 + lk[1]}" r="4" fill="#fff"/>`; g += `<path d="M${ex - 20},${ey - 20} l-8,-8 M${ex - 8},${ey - 24} l-4,-10 M${ex + 6},${ey - 24} l2,-10" stroke="${INK}" stroke-width="3"/>`; }
    if (sad || scared) g += `<path d="M${ex - 18 * s},${ey - 46} L${ex + 18 * s},${ey - 32}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  }
  if (o.mood === 'love') g += `<path transform="translate(-34,-80) scale(.35)" d="M0,30 C-50,-5 -30,-50 0,-25 C30,-50 50,-5 0,30Z" fill="#ff4f7b"/><path transform="translate(34,-80) scale(.35)" d="M0,30 C-50,-5 -30,-50 0,-25 C30,-50 50,-5 0,30Z" fill="#ff4f7b"/>`;
  if (scared) g += `<path d="M64,-80 q10,16 0,26 q-10,-10 0,-26z" fill="#7fd0ff" stroke="#2f7fd6" stroke-width="3"/>`;
  // muzzle
  const mo = o.moo, cw = o.chew ? 6 * Math.sin(t * 14) : 0;
  g += `<ellipse cx="${cw * .3}" cy="30" rx="62" ry="44" fill="#f4b8b0" stroke="${INK}" stroke-width="5"/><ellipse cx="-22" cy="20" rx="9" ry="12" fill="#7a3b3b"/><ellipse cx="22" cy="20" rx="9" ry="12" fill="#7a3b3b"/>`;
  g += mo > .05 ? `<ellipse cx="0" cy="54" rx="${22 + 10 * mo}" ry="${6 + 18 * mo}" fill="#7a1a2a" stroke="${INK}" stroke-width="4"/>` : `<path d="M${-20 + cw},50 Q${cw},${happy ? 64 : 58} ${20 + cw},50" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  if (o.grass) g += `<g transform="translate(${30 + cw},56)">${[-1, 0, 1, 2].map(k => `<path d="M0,0 q${10 + k * 8},${-10 - k * 4} ${26 + k * 10},${-4 + k * 10}" stroke="#2e9e3a" stroke-width="6" fill="none"/>`).join('')}</g>`;
  g += '</g>';
  return g + '</g>';
}
const lali = o => gaay(o), chhotu = o => gaay(Object.assign({ calf: 1, bell: 1 }, o, { s: (o.s || 1) * .52 }));
// "MOO!" text
const mooT = (x, y, s, k, txt = 'MOOO!') => k > 0 && k < 1 ? `<g transform="translate(${x},${y - 60 * k}) scale(${s * back(clamp(k * 3))})" opacity="${1 - seg(k, .7, 1)}">${T(0, 0, 70, txt, { fill: '#fff', shadow: '#8a5a32' })}</g>` : '';

// ---------- vehicles (side views facing right; ground at y=0; flip -1 faces left) ----------
const wheel = (cx, cy, r, roll) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#222" stroke="${C.ink}" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="${r * .5}" fill="#b9c0c8" stroke="${C.ink}" stroke-width="3"/>${[0, 1, 2].map(k => `<path d="M${cx},${cy} l${(r * .45 * Math.cos(roll + k * 2.09)).toFixed(1)},${(r * .45 * Math.sin(roll + k * 2.09)).toFixed(1)}" stroke="#555" stroke-width="4"/>`).join('')}`;
let CARID = 0;
const scP = (d, L) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, a, b) => (a * L).toFixed(1) + ',' + b);
// o.inside = svg (local coords) for the people in the windows (clipped to the cabin); o.L stretches the body (family car = 1.3)
function car(x, y, s, col = '#5fb3e8', o = {}) {
  const id = 'cc' + (CARID++), f = o.flip || 1, roll = (o.roll || 0), bob = o.bob || 0, L = o.L || 1;
  let g = `<g transform="translate(${x.toFixed(1)},${(y + bob).toFixed(1)}) scale(${(s * f).toFixed(3)},${s.toFixed(3)})">`;
  g += `<ellipse cx="0" cy="4" rx="${330 * L}" ry="26" fill="#000" opacity=".25"/>`;
  const cab = scP('M-250,-150 L-226,-300 Q-220,-318 -200,-318 L130,-318 Q160,-318 176,-296 L250,-160Z', L);
  g += `<path d="${cab}" fill="#3a3f4a"/>`;
  g += [-180, -40, 90].map(sx => `<rect x="${sx * L}" y="-270" width="60" height="120" rx="20" fill="#5a4a3a"/>`).join('');
  if (o.inside) g += `<clipPath id="${id}"><path d="${cab}"/></clipPath><g clip-path="url(#${id})">${o.inside}</g>`;
  const shell = scP(`M-300,-40 Q-306,-150 -262,-160 L-240,-300 Q-236,-334 -200,-334 L136,-334 Q172,-334 194,-300 L262,-170 Q306,-162 312,-120 L316,-40 Q316,-14 290,-14 L-280,-14 Q-300,-14 -300,-40Z
    M-222,-170 L-206,-300 L-110,-300 L-110,-170Z M-92,-170 L-92,-300 L36,-300 L36,-170Z M54,-170 L54,-300 L140,-300 Q160,-300 170,-284 L232,-170Z`, L);
  g += `<path d="${shell}" fill="${col}" fill-rule="evenodd" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>`;
  g += `<path d="M${-300 * L},-96 H${314 * L}" stroke="#fff" stroke-width="10" opacity=".5"/><path d="M${-100 * L},-170 V-20 M${46 * L},-170 V-20" stroke="${C.ink}" stroke-width="4" opacity=".6"/><rect x="${-80 * L}" y="-140" width="34" height="10" rx="5" fill="${C.ink}" opacity=".6"/><rect x="${60 * L}" y="-140" width="34" height="10" rx="5" fill="${C.ink}" opacity=".6"/>`;
  g += `<rect x="${-318 * L}" y="-62" width="40" height="36" rx="8" fill="#e5463b" stroke="${C.ink}" stroke-width="4"/><ellipse cx="${300 * L}" cy="-120" rx="18" ry="22" fill="#fff6c0" stroke="${C.ink}" stroke-width="4"/><rect x="${250 * L}" y="-44" width="76" height="22" rx="8" fill="#9aa3ad" stroke="${C.ink}" stroke-width="4"/>`;
  if (o.carrier) g += `<path d="M${-200 * L},-334 v-20 M${120 * L},-334 v-20 M${-220 * L},-354 H${140 * L}" stroke="#555" stroke-width="8"/><rect x="${-170 * L}" y="-404" width="150" height="52" rx="8" fill="#b07a46" stroke="${C.ink}" stroke-width="5"/><rect x="${-10 * L}" y="-396" width="120" height="44" rx="8" fill="#3b8de5" stroke="${C.ink}" stroke-width="5"/>`;
  if (o.dent) g += `<path d="M${-250 * L},-80 q14,10 30,0 q10,12 22,4" stroke="${C.ink}" stroke-width="4" fill="none"/>`;
  g += wheel(-190 * L, -20, 50, roll) + wheel(190 * L, -20, 50, roll);
  if (o.honk) g += `<path d="M${330 * L},-110 l40,-20 M${332 * L},-90 h46 M${330 * L},-70 l40,20" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity="${o.honk}"/>`;
  return g + '</g>';
}
// city bus with heads in the windows
function bus(x, y, s, col = '#f2b631', o = {}) {
  const f = o.flip || 1, roll = o.roll || 0, seed = o.seed || 1;
  let g = `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(s * f).toFixed(3)},${s.toFixed(3)})"><ellipse cx="0" cy="4" rx="560" ry="30" fill="#000" opacity=".25"/>`;
  g += `<rect x="-540" y="-430" width="1080" height="410" rx="40" fill="${col}" stroke="${C.ink}" stroke-width="8"/><rect x="-540" y="-160" width="1080" height="34" fill="#e5463b"/><rect x="-540" y="-120" width="1080" height="20" fill="#22a35a"/>`;
  for (let i = 0; i < 7; i++) { const wx = -500 + i * 130; g += `<rect x="${wx}" y="-390" width="110" height="140" rx="12" fill="#bfe6f2" stroke="${C.ink}" stroke-width="5"/>`;
    if (hs(i + seed * 7) > .25) { const sk = ['#c98b5c', '#b07248', '#d7a27a', '#8d5a3b'][i % 4]; g += `<circle cx="${wx + 55}" cy="-290" r="34" fill="${sk}" stroke="${C.ink}" stroke-width="4"/><path d="M${wx + 22},-298 Q${wx + 55},-346 ${wx + 88},-298" fill="#1b120c"/><rect x="${wx + 18}" y="-258" width="74" height="10" fill="${MCOL[(i + seed) % 8]}"/>`; } }
  g += `<rect x="420" y="-390" width="100" height="230" rx="10" fill="#9fc7d8" stroke="${C.ink}" stroke-width="5"/><rect x="-420" y="-470" width="300" height="46" rx="10" fill="#222" stroke="${C.ink}" stroke-width="5"/><g transform="translate(-270,-436) scale(${f},1)">${T(0, 0, 34, o.board || 'CITY BUS', { fill: '#ffd34a', sw: 0 })}</g>`;
  for (let k = 0; k < 6; k++) g += `<circle cx="${-440 + k * 170}" cy="-200" r="14" fill="${MCOL[k % 8]}" stroke="${C.ink}" stroke-width="3"/><path d="M${-470 + k * 170},-200 h60" stroke="${C.ink}" stroke-width="2"/>`;
  g += `<ellipse cx="530" cy="-80" rx="14" ry="20" fill="#fff6c0" stroke="${C.ink}" stroke-width="4"/>` + wheel(-330, -20, 66, roll) + wheel(330, -20, 66, roll);
  return g + '</g>';
}
// painted desi truck (truck-art panels, "HORN OK PLEASE" on the tail)
function truck(x, y, s, o = {}) {
  const f = o.flip || 1, roll = o.roll || 0;
  let g = `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(s * f).toFixed(3)},${s.toFixed(3)})"><ellipse cx="0" cy="4" rx="540" ry="30" fill="#000" opacity=".25"/>`;
  g += `<rect x="-520" y="-470" width="700" height="400" rx="16" fill="#ffd34a" stroke="${C.ink}" stroke-width="8"/>`;
  const pc = ['#e5463b', '#22a35a', '#3b8de5', '#b04ad6', '#ff7a2f'];
  for (let i = 0; i < 5; i++) { const px = -500 + i * 135; g += `<rect x="${px}" y="-450" width="120" height="170" rx="12" fill="${pc[i]}" stroke="${C.ink}" stroke-width="5"/><circle cx="${px + 60}" cy="-365" r="40" fill="#fff6d8" stroke="${C.ink}" stroke-width="4"/><path d="M${px + 60},-395 l10,22 24,2 -18,16 6,24 -22,-12 -22,12 6,-24 -18,-16 24,-2z" fill="${pc[(i + 2) % 5]}"/>`; }
  g += `<rect x="-520" y="-270" width="700" height="80" fill="#22a35a" stroke="${C.ink}" stroke-width="5"/><g transform="translate(-170,-214) scale(${f},1)">${T(0, 0, 50, 'HORN OK PLEASE', { fill: '#fff', sw: 0, ls: 2 })}</g>`;
  g += [...Array(14)].map((_, k) => `<path d="M${-510 + k * 50},-190 l25,34 25,-34" fill="${pc[k % 5]}" stroke="${C.ink}" stroke-width="3"/>`).join('');
  // cab
  g += `<path d="M190,-70 L190,-400 Q190,-430 220,-430 L400,-430 Q440,-430 460,-380 L520,-200 L520,-70Z" fill="#e5463b" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/><path d="M230,-390 H400 L450,-250 H230Z" fill="#bfe6f2" stroke="${C.ink}" stroke-width="5"/><path d="M200,-450 q130,-50 260,0" stroke="#ffd34a" stroke-width="18" fill="none"/>`;
  g += `<circle cx="300" cy="-320" r="30" fill="#b07248" stroke="${C.ink}" stroke-width="4"/><path d="M270,-330 Q300,-372 330,-330" fill="#f4f1e6" stroke="${C.ink}" stroke-width="3"/>`;
  g += `<rect x="-540" y="-80" width="1080" height="30" fill="#555" stroke="${C.ink}" stroke-width="4"/>` + wheel(-380, -20, 64, roll) + wheel(-220, -20, 64, roll) + wheel(380, -20, 64, roll);
  return g + '</g>';
}
// motorbike with a rider (helmet colour c)
function bike(x, y, s, c = '#e5463b', o = {}) {
  const f = o.flip || 1, roll = o.roll || 0, seed = o.seed || 2, sk = ['#c98b5c', '#b07248', '#8d5a3b'][seed % 3];
  let g = `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(s * f).toFixed(3)},${s.toFixed(3)})"><ellipse cx="0" cy="4" rx="190" ry="20" fill="#000" opacity=".25"/>`;
  g += wheel(-120, -50, 50, roll) + wheel(130, -50, 50, roll);
  g += `<path d="M-120,-50 L-30,-120 L90,-120 L130,-50 M90,-120 L120,-200 h40" stroke="${C.ink}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M-60,-150 Q0,-190 80,-150 L70,-110 H-50Z" fill="${MCOL[seed % 8]}" stroke="${C.ink}" stroke-width="5"/><rect x="-100" y="-160" width="110" height="26" rx="12" fill="#222"/>`;
  g += `<path d="M-40,-150 L-10,-300 L50,-300 L60,-150Z" fill="${MCOL[(seed + 3) % 8]}" stroke="${C.ink}" stroke-width="5"/><path d="M40,-280 L130,-200" stroke="${MCOL[(seed + 3) % 8]}" stroke-width="22" stroke-linecap="round"/><path d="M-20,-150 L40,-90 L50,-40" stroke="#3a3f4a" stroke-width="24" fill="none" stroke-linecap="round"/>`;
  g += `<circle cx="20" cy="-350" r="46" fill="${sk}" stroke="${C.ink}" stroke-width="5"/><path d="M-30,-350 Q-30,-410 20,-410 Q70,-410 72,-350Z" fill="${c}" stroke="${C.ink}" stroke-width="5"/><circle cx="40" cy="-346" r="5"/>`;
  if (o.honk) g += `<path d="M180,-210 l36,-18 M182,-190 h40 M180,-170 l36,18" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`;
  return g + '</g>';
}
// honk bubbles above a vehicle
function honkB(x, y, s, t, seed, on = 1) {
  if (on <= 0) return ''; const ph = (t * 1.3 + hs(seed)) % 1; if (ph > .55) return '';
  const w = ['PEEP!', 'PAAN!', 'POM POM!', 'PEEEP!', 'BEEP!'][seed % 5], k = back(clamp(ph * 5)) * (1 - seg(ph, .45, .55));
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(s * k).toFixed(3)}) rotate(${-8 + 16 * hs(seed + 3)})">${burst(0, 0, 70, ['#fff', '#ffd34a', '#7fd0ff'][seed % 3], w, 30, 0, on)}</g>`;
}
// Officer Gill's whistle
const whistle = (x, y, s, k = 0) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(3)})"><rect x="0" y="-10" width="46" height="20" rx="8" fill="#cfd8e0" stroke="${C.ink}" stroke-width="4"/><circle cx="46" cy="4" r="14" fill="#cfd8e0" stroke="${C.ink}" stroke-width="4"/>${k > 0 ? `<path d="M70,-20 l30,-16 M74,0 h36 M70,20 l30,16" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="${k}"/>` : ''}</g>`;
// a bundle of green fodder (hara chaara) from the sabzi stall
const chaara = (x, y, s, rot = 0) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot}) scale(${s.toFixed(3)})">${[...Array(9)].map((_, k) => `<path d="M0,40 Q${-40 + k * 10},-20 ${-60 + k * 15},${-70 - 20 * hs(k)}" stroke="${['#2e9e3a', '#43a047', '#7cc242'][k % 3]}" stroke-width="10" fill="none" stroke-linecap="round"/>`).join('')}<rect x="-16" y="20" width="32" height="18" rx="6" fill="#c9a25a" stroke="${C.ink}" stroke-width="3"/></g>`;

// ---------- the row (d=1.3): petrol pump with the WC, Hara Bhara Park, shops ----------
function wcDoor(t, o, frame = '#e5463b') {
  const W0 = CWC, open = o.open || 0, glow = o.glow || 0;
  let g = `<rect x="${W0.x - 14}" y="${W0.top - 14}" width="${W0.w + 28}" height="${W0.base - W0.top + 14}" fill="${frame}" stroke="${C.ink}" stroke-width="5"/><rect x="${W0.x}" y="${W0.top}" width="${W0.w}" height="${W0.base - W0.top}" fill="#1a1410"/>`;
  if (glow > 0) g += `<rect x="${W0.x}" y="${W0.top}" width="${W0.w}" height="${W0.base - W0.top}" fill="#ffe08a" opacity="${clamp(glow * open * 1.3)}"/>`;
  const sx = Math.max(.03, 1 - open);
  g += `<g transform="translate(${W0.x},${W0.top}) scale(${sx},1)"><rect width="${W0.w}" height="${W0.base - W0.top}" fill="#f6f2ea" stroke="${C.ink}" stroke-width="6"/><rect x="24" y="140" width="${W0.w - 48}" height="130" rx="8" fill="none" stroke="#d6cdbd" stroke-width="6"/><circle cx="${W0.w - 22}" cy="170" r="11" fill="#c9a24a" stroke="${C.ink}" stroke-width="3"/><g transform="translate(${W0.w / 2},74)"><circle r="42" fill="#3a8dde" stroke="${C.ink}" stroke-width="5"/>${T(0, 15, 40, 'WC', { sw: 0 })}</g></g>`;
  if (glow > 0) g += `<rect x="${W0.x - 4}" y="${W0.base - 14}" width="${W0.w + 8}" height="${16 + 8 * Math.sin(t * 20)}" fill="#ffd34a" opacity="${glow}" filter="url(#glow)"/><rect x="${W0.x + W0.w * sx - 4}" y="${W0.top}" width="${8 + 6 * glow}" height="${W0.base - W0.top}" fill="#ffd34a" opacity="${glow * .8}" filter="url(#glow)"/>`;
  return g + `<path d="M${W0.x + W0.w / 2},${W0.top - 70} v22" stroke="#333" stroke-width="4"/>` + bulb(W0.x + W0.w / 2, W0.top - 40, '#fff3c0', 1, 11);
}
function pump(t, o = {}) {
  const base = 1080; let g = castShadow(450, base, 980, 160, .22);
  // kiosk (office + WC) on the right
  g += `<rect x="560" y="560" width="360" height="${base - 560 + 30}" fill="#fff6e0" stroke="${C.ink}" stroke-width="6"/><rect x="546" y="536" width="388" height="30" fill="#e5463b" stroke="${C.ink}" stroke-width="5"/><rect x="590" y="600" width="80" height="120" fill="#7fb6d6" stroke="${C.ink}" stroke-width="5"/>`;
  g += `<rect x="578" y="840" width="96" height="240" fill="#7fb6d6" stroke="${C.ink}" stroke-width="5"/>${T(626, 830, 22, 'OFFICE', { fill: '#7a1a2a', sw: 0, font: 'Baloo2', weight: 800 })}`;
  g += `<rect x="700" y="610" width="190" height="60" rx="8" fill="#ffd34a" stroke="${C.ink}" stroke-width="4"/>${T(795, 650, 28, 'HAWA • PAANI', { fill: '#7a1a2a', sw: 0, font: 'Baloo2', weight: 800 })}`;
  // canopy on two pillars, lights under it
  g += `<rect x="70" y="620" width="34" height="${base - 620}" fill="#d9d2c4" stroke="${C.ink}" stroke-width="5"/><rect x="430" y="620" width="34" height="${base - 620}" fill="#d9d2c4" stroke="${C.ink}" stroke-width="5"/>`;
  g += `<rect x="-60" y="530" width="640" height="96" rx="10" fill="#fff" stroke="${C.ink}" stroke-width="6"/><rect x="-60" y="580" width="640" height="24" fill="#e5463b"/><rect x="-60" y="604" width="640" height="12" fill="#ffd34a"/>${T(260, 572, 40, 'PETROL PUMP', { fill: '#1f2d4a', sw: 0, ls: 4 })}`;
  [40, 260, 480].forEach(lx => g += `<rect x="${lx - 34}" y="626" width="68" height="10" rx="5" fill="#fffbe0"/>` + lightPool(lx, base - 20, 150, 40, .35, 'poolW'));
  // dispensers
  [170, 360].forEach((dx, i) => { g += `<rect x="${dx - 26}" y="${base - 40}" width="52" height="40" fill="#bdb3a3" stroke="${C.ink}" stroke-width="4"/><rect x="${dx - 44}" y="${base - 230}" width="88" height="194" rx="14" fill="${i ? '#3b8de5' : '#e5463b'}" stroke="${C.ink}" stroke-width="5"/><rect x="${dx - 30}" y="${base - 212}" width="60" height="44" rx="6" fill="#203040" stroke="${C.ink}" stroke-width="3"/>${T(dx, base - 180, 22, '088.8', { fill: '#7cf07c', sw: 0 })}<rect x="${dx - 30}" y="${base - 150}" width="60" height="70" rx="6" fill="#fff" opacity=".85"/><path d="M${dx + 44},${base - 160} q40,30 20,110" stroke="#222" stroke-width="7" fill="none"/><rect x="${dx + 50}" y="${base - 54}" width="22" height="34" rx="5" fill="#222"/>`; });
  // the price pole sign on the left
  g += `<rect x="-200" y="200" width="26" height="${base - 200}" fill="#9aa3ad" stroke="${C.ink}" stroke-width="4"/><rect x="-290" y="120" width="210" height="220" rx="16" fill="#1f2d4a" stroke="${C.ink}" stroke-width="6"/><circle cx="-185" cy="186" r="44" fill="#e5463b" stroke="#fff" stroke-width="5"/><path d="M-185,160 q-20,30 0,48 q20,-18 0,-48z" fill="#ffd34a"/>${T(-185, 280, 30, 'PETROL', { fill: '#fff', sw: 0 })}${T(-185, 318, 30, 'DIESEL', { fill: '#ffd34a', sw: 0 })}`;
  g += `<rect x="-20" y="${base - 6}" width="960" height="22" fill="#bdb3a3" stroke="${C.ink}" stroke-width="4"/>`;
  return g + wcDoor(t, o, '#e5463b');
}
function park(t, o = {}) {
  const { x0, x1 } = PARK, base = 1080, [g0, g1] = PARK.gate;
  let g = `<rect x="${x0}" y="560" width="${x1 - x0}" height="${base - 560}" fill="#8fd3f0" opacity="0"/>`;
  // lawn rising into depth + hedge + trees behind
  g += `<path d="M${x0},${base} L${x0 + 60},820 L${x1 - 60},820 L${x1},${base}Z" fill="#7cc242" stroke="${C.ink}" stroke-width="5"/><path d="M${x0 + 60},820 L${x1 - 60},820 L${x1 - 60},780 L${x0 + 60},780Z" fill="#2e7d32" stroke="${C.ink}" stroke-width="4"/>`;
  for (let k = 0; k < 14; k++) { const gx = x0 + 80 + hs(k + 40) * (x1 - x0 - 160), gy = 840 + hs(k + 41) * 220; g += `<path d="M${gx},${gy} l-8,-22 M${gx},${gy} l0,-26 M${gx},${gy} l8,-22" stroke="#4a9a2a" stroke-width="5"/>`; }
  [[x0 + 150, 1.0], [x0 + 470, 1.2], [x1 - 170, 1.05]].forEach(([tx, sc], i) => { const sw = 6 * Math.sin(t * 1.2 + i); g += `<rect x="${tx - 22}" y="${800 - 260 * sc}" width="44" height="${260 * sc + 10}" fill="#7a5233" stroke="${C.ink}" stroke-width="5"/><g transform="rotate(${sw * .4} ${tx} ${800 - 260 * sc})"><circle cx="${tx}" cy="${800 - 330 * sc}" r="${130 * sc}" fill="#2e7d32" stroke="${C.ink}" stroke-width="5"/><circle cx="${tx - 70 * sc}" cy="${800 - 270 * sc}" r="${90 * sc}" fill="#3c9a4a" stroke="${C.ink}" stroke-width="5"/><circle cx="${tx + 80 * sc}" cy="${800 - 280 * sc}" r="${95 * sc}" fill="#43a047" stroke="${C.ink}" stroke-width="5"/></g>`; });
  // swing + bench
  g += `<path d="M${x1 - 330},720 L${x1 - 300},540 L${x1 - 140},540 L${x1 - 110},720" stroke="#e5463b" stroke-width="10" fill="none"/>` + (() => { const a = 14 * Math.sin(t * 2); return `<g transform="rotate(${a} ${x1 - 220} 545)"><path d="M${x1 - 250},545 v120 M${x1 - 190},545 v120" stroke="#555" stroke-width="4"/><rect x="${x1 - 262}" y="662" width="84" height="14" fill="#ffd34a" stroke="${C.ink}" stroke-width="3"/></g>`; })();
  g += `<rect x="${x0 + 240}" y="860" width="200" height="20" fill="#b07a46" stroke="${C.ink}" stroke-width="4"/><rect x="${x0 + 240}" y="826" width="200" height="16" fill="#b07a46" stroke="${C.ink}" stroke-width="4"/><path d="M${x0 + 255},880 v40 M${x0 + 425},880 v40" stroke="${C.ink}" stroke-width="7"/>`;
  // flowers
  for (let k = 0; k < 10; k++) { const fx = x0 + 40 + k * 86; g += `<circle cx="${fx}" cy="${base - 96 - (k % 2) * 8}" r="13" fill="${['#ff4f9a', '#ffd34a', '#fff'][k % 3]}" stroke="${C.ink}" stroke-width="3"/>`; }
  // low wall + green railing with the gate opening
  for (const [a, b] of [[x0 - 20, g0], [g1, x1 + 20]]) { g += `<rect x="${a}" y="${base - 80}" width="${b - a}" height="80" fill="#c0603a" stroke="${C.ink}" stroke-width="5"/><path d="M${a},${base - 80} h${b - a}" stroke="#efe6d8" stroke-width="10"/>`; for (let xx = a + 14; xx < b - 6; xx += 30) g += `<path d="M${xx},${base - 84} v-90" stroke="#1f7a3a" stroke-width="7"/><circle cx="${xx}" cy="${base - 178}" r="6" fill="#1f7a3a"/>`; g += `<path d="M${a},${base - 140} h${b - a}" stroke="#1f7a3a" stroke-width="6"/>`; }
  // gate arch: HARA BHARA PARK
  g += `<rect x="${g0 - 30}" y="${base - 330}" width="34" height="330" fill="#1f7a3a" stroke="${C.ink}" stroke-width="5"/><rect x="${g1 - 4}" y="${base - 330}" width="34" height="330" fill="#1f7a3a" stroke="${C.ink}" stroke-width="5"/><path d="M${g0 - 40},${base - 320} Q${(g0 + g1) / 2},${base - 420} ${g1 + 40},${base - 320}" stroke="#1f7a3a" stroke-width="22" fill="none"/><rect x="${g0 - 70}" y="${base - 450}" width="${g1 - g0 + 140}" height="76" rx="14" fill="#fff6d8" stroke="${C.ink}" stroke-width="5"/>${T((g0 + g1) / 2, base - 398, 40, 'HARA BHARA PARK', { fill: '#1f7a3a', sw: 0, ls: 2 })}`;
  if (o.parkInner) g += o.parkInner;
  return g;
}
function chowkRow(t, cam, o = {}) {
  let g = `<rect x="-4600" y="1060" width="11000" height="60" fill="#9b7350"/>` + shopFront(-3640, 560, '#22a35a', '#fff', 'KAPDE', t, 3) + shopFront(-3060, 520, '#ff7a2f', '#ffd34a', 'DHABA', t, 5) + shopFront(-2480, 540, '#3b8de5', '#fff', 'DAWAI', t, 6);
  g += shopFront(-1900, 520, '#e5463b', '#ffd34a', 'CHAI', t, 1) + shopFront(-1320, 560, '#3b8de5', '#fff', 'MOBILE', t, 2);
  g += `<rect x="-740" y="260" width="720" height="840" fill="${HCOL[3]}" stroke="${C.ink}" stroke-width="6"/><rect x="-660" y="360" width="200" height="200" fill="#5a8bb0" stroke="${C.ink}" stroke-width="5"/><rect x="-300" y="360" width="200" height="200" fill="#5a8bb0" stroke="${C.ink}" stroke-width="5"/><rect x="-520" y="760" width="170" height="320" rx="6" fill="#7a4a2a" stroke="${C.ink}" stroke-width="6"/>` + cooler(-170, 940);
  g += pump(t, o) + park(t, o);
  g += shopFront(1960, 520, '#22a35a', '#fff', 'SABZI', t, 4) + shopFront(2500, 560, '#b04ad6', '#ffd34a', 'KIRYANA', t, 5) + shopFront(3080, 560, '#ff7a2f', '#fff', 'MITHAI', t, 6) + shopFront(3660, 540, '#e5463b', '#fff', 'BAKERY', t, 7) + shopFront(4220, 560, '#1fb5b0', '#ffd34a', 'JUICE', t, 0);
  // sabzi crates on the pavement with green fodder
  g += `<g transform="translate(2050,1080)"><rect x="-80" y="-70" width="160" height="70" fill="#b07a46" stroke="${C.ink}" stroke-width="5"/>${chaara(-30, -70, .7, -10)}${chaara(30, -70, .7, 10)}</g>`;
  // poles + wires; traffic signal at the chowk
  [-780, 1940, 3660].forEach(px => g += `<rect x="${px - 9}" y="0" width="18" height="1080" fill="#7d7d86" stroke="${C.ink}" stroke-width="3"/><rect x="${px - 60}" y="10" width="120" height="12" fill="#5d5d66"/>`);
  g += `<path d="M-780,20 Q580,160 1940,20 Q2800,150 3660,20 M-780,34 Q580,190 1940,34 Q2800,180 3660,34" stroke="#2a2a30" stroke-width="4" fill="none"/>`;
  g += `<g transform="translate(2400,96)"><ellipse rx="24" ry="15" fill="#2a2a30"/><circle cx="18" cy="-12" r="10" fill="#2a2a30"/><path d="M27,-12 l12,4 -12,3z" fill="#e8a33a"/></g>` + patang(3000, 120, .5, 10 * Math.sin(t * 2), '#e5463b', '#ffd34a', { t });
  // pavement (kerb) in front of the row
  g += `<rect x="-4800" y="1080" width="11200" height="600" fill="#d8c4a0"/>`;
  for (let k = 0; k < 40; k++) { const px = -2600 + hs(k + 300) * 8000, py = 1100 + hs(k + 301) * 120; g += `<ellipse cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" rx="${5 + (k % 4) * 3}" ry="${3 + k % 3}" fill="#bfa478"/>`; }
  for (let k = 0; k < 6; k++) g += lightPool(-1800 + k * 1100, 1150, 420, 70, .22, 'poolW');
  if (o.rowInner) g += o.rowInner;
  return layer(1.3, cam, g);
}
// traffic signal (in lane A layer, at the chowk), state: 'red' | 'green'
function signal(x, y, st = 'red', t = 0) {
  return `<g transform="translate(${x},${y})"><rect x="-10" y="-520" width="20" height="520" fill="#555" stroke="${C.ink}" stroke-width="4"/><rect x="-46" y="-700" width="92" height="210" rx="20" fill="#222" stroke="${C.ink}" stroke-width="5"/>${[['#e5463b', 'red'], ['#ffb330', 'amber'], ['#22c55e', 'green']].map(([c, k], i) => `<circle cx="0" cy="${-660 + i * 66}" r="24" fill="${st === k ? c : '#3a3a3a'}" stroke="${C.ink}" stroke-width="3"/>${st === k ? `<circle cx="0" cy="${-660 + i * 66}" r="60" fill="${c}" opacity=".25"/>` : ''}`).join('')}</g>`;
}
// asphalt strip for a lane layer (y0..y1 in that layer's coords); marks = dashes at ym, zebra at ZX
function roadStrip(y0, y1, ym, o = {}) {
  let g = `<rect x="-6000" y="${y0}" width="14000" height="${y1 - y0}" fill="#6b6d74"/>`;
  if (o.edge) g += `<path d="M-3000,${y0 + 4} H6000" stroke="#55575e" stroke-width="10"/>`;
  if (ym) for (let k = 0; k < 60; k++) g += `<rect x="${-5900 + k * 240}" y="${ym}" width="130" height="14" fill="#f4f1e6" opacity=".85"/>`;
  if (o.zebra) for (let k = 0; k < 8; k++) g += `<path d="M${ZX - 200 + k * 54},${o.zebra[0]} l-26,${o.zebra[1] - o.zebra[0]} h30 l26,${o.zebra[0] - o.zebra[1]}z" fill="#f4f1e6" opacity=".9"/>`;
  for (let k = 0; k < 18; k++) { const px = -2800 + hs(k + 900 + y0) * 8400, py = y0 + 30 + hs(k + 901 + y0) * (y1 - y0 - 60); g += `<ellipse cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" rx="${18 + 10 * hs(k)}" ry="5" fill="#5a5c63"/>`; }
  return g;
}
// the chowk stack: returns { back (sky..row), A(inner) / B(inner) / C(inner) lane layers, front }
function chowk(t, cam, o = {}) {
  const O = Object.assign({}, o, { farKites: kiteField(t, cam, 6, 10, -900, 400, .22, 9, -1500, 3500, 1), midKites: kiteField(t, cam, 3, 5, -1200, 200, .45, 23, -1500, 3500, 1) });
  const back = skyL(t, cam, o) + cityL(t, cam, O) + layer(6, cam, heatHaze(t, 780, 980, .1), { f: '' }) + veil(.3) + midRoofsL(t, cam, O) + veil(.15)
    + chowkRow(t, cam, o)
    + (o.glow > 0 ? layer(1.3, cam, lightPool(CWC.x + CWC.w / 2, CWC.base + 40, 300 + 90 * o.glow + 240 * (o.open || 0), 70 + 40 * (o.open || 0), o.glow) + `<path d="M${CWC.x},${CWC.base} L${CWC.x + CWC.w},${CWC.base} L${CWC.x + CWC.w + 240},${CWC.base + 260} L${CWC.x - 240},${CWC.base + 260}Z" fill="#ffd34a" opacity="${.22 * o.glow + .3 * (o.open || 0)}" style="mix-blend-mode:screen"/>`, { f: '' }) : '')
    + layer(1, cam, shafts(SUN[0] + 300, -600, 2.1, 6, 2600, .1, t), { f: '' });
  const A = inner => layer(LA, cam, `<rect x="-6000" y="1262" width="14000" height="30" fill="#8d8d93" stroke="${C.ink}" stroke-width="3"/>` + [...Array(116)].map((_, k) => `<rect x="${-6000 + k * 120}" y="1264" width="60" height="26" fill="${k % 2 ? '#f4f1e6' : '#2a2a2a'}" opacity=".6"/>`).join('') + roadStrip(1290, 1520, 0, { edge: 1, zebra: [1300, 1520] }) + (o.signal !== false ? signal(ZX + 330, 1310, o.sig || 'red', t) : '') + (inner || ''), { f: '' });
  const B = inner => layer(LB, cam, roadStrip(1460, 1700, 1600, { zebra: [1460, 1700] }) + (inner || ''), { f: '' });
  const Cc = inner => layer(LCd, cam, roadStrip(1640, 2600, 0, { zebra: [1640, 1900] }) + `<rect x="-6000" y="1900" width="14000" height="40" fill="#8d8d93"/><rect x="-6000" y="1940" width="14000" height="700" fill="#d8c4a0"/>` + (inner || ''), { f: '' });
  const front = (o.noFG ? '' : bazaarFG(t, cam, Object.assign({ fgY: 2200 }, o))) + (o.motes !== false ? motes(t, 22, 0, 300, 1080, 1000, .45, 6) : '');
  return { back, A, B, C: Cc, front };
}
const camL = (d, X, Y, z = 1, sx = 540, sy = 1150) => camD(d, X, Y, z, sx, sy);

// ---------- Episode 8 cast sheet (render_ep8.py cast → ep8_cast.jpg) ----------
window.drawCast = () => {
  const s = document.getElementById('s'); s.setAttribute('width', 1080); s.setAttribute('height', 1920); s.setAttribute('viewBox', '0 0 1080 1920');
  let g = `<rect width="1080" height="1920" fill="#fff6e0"/>` + T(540, 90, 70, 'SUSUMAN EP 8 — NEW CAST + SETS', { fill: C.red, sw: 0 });
  g += T(270, 170, 44, 'LALI GAAY', { fill: '#1f2d4a', sw: 0 }) + T(810, 170, 44, 'CHHOTU (bachhda)', { fill: '#1f2d4a', sw: 0 });
  g += shadow(250, 560, 230, .6) + lali({ x: 200, y: 555, s: .85, pose: 'stand', t: .3, mood: 'happy' }) + shadow(800, 520, 110, .6) + chhotu({ x: 760, y: 515, s: 1.2, pose: 'stand', t: .3, mood: 'love' });
  g += lali({ x: 140, y: 860, s: .55, pose: 'sit', t: .1, chew: 1 }) + lali({ x: 470, y: 860, s: .55, pose: 'stand', t: .5, mood: 'sad' }) + lali({ x: 800, y: 860, s: .55, pose: 'walk', t: .2, moo: 1, mood: 'scared' });
  g += chhotu({ x: 160, y: 1040, s: .9, pose: 'stand', mood: 'scared', t: .2 }) + chhotu({ x: 420, y: 1040, s: .9, pose: 'walk', t: .4, grass: 1, chew: 1, mood: 'happy' }) + T(800, 990, 34, 'Mood: happy / sad / scared / love', { fill: '#555', sw: 0, font: 'Baloo2', weight: 800 }) + T(800, 1035, 34, 'Pose: sit / stand / walk · moo · chew', { fill: '#555', sw: 0, font: 'Baloo2', weight: 800 });
  g += T(540, 1120, 44, "BABA KI GAADI + THE JAM", { fill: '#1f2d4a', sw: 0 });
  g += car(300, 1420, .62, '#5fb3e8', { L: 1.3, carrier: 1, dent: 1 }) + bus(820, 1420, .38, '#f2b631', { seed: 3 }) + truck(300, 1700, .38, {}) + bike(700, 1700, .55, '#e5463b', { seed: 3 }) + rickshaw(930, 1700, .6, 1, 0) + signal(1010, 1700, 'green', 0);
  g += `<g transform="translate(40,1730) scale(.22)">${pump(0, {})}</g><g transform="translate(270,1730) scale(.22) translate(-1000,0)">${park(0, {})}</g>`;
  g += T(540, 1890, 30, 'ep8_set.js: gaay() lali() chhotu() car() bus() truck() bike() signal() pump() park() chowk()', { fill: '#555', sw: 0, font: 'Baloo2', weight: 800 });
  s.innerHTML = defs() + skyDefs + skyDefs2 + melaDefs + depthDefs() + g; return [1080, 1920];
};
