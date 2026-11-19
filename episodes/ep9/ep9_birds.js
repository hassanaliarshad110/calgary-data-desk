// SUSUMAN Episode 9 "Garmi Mein Parinde" — new cast + props (drawn in code, same flat style as rig.js).
// CHIDIYA (house sparrow: grey crown, chestnut nape, white cheek, black bib), MYNA, TOTA (parrot), KAUWA (crow),
// the HOT water tank with its old pipe (tap, joint that bursts, gooseneck after the fix), the tin CHHAJJA ledge over the gap,
// the clay KUNDA (bird water bowl), water jet + splashes, sweat drops, thermometer sign, the heatwave look.

// ---------- generic small bird (one skeleton, per-kind palette) ----------
const BIRDK = {
  chidiya: { body: '#b0743c', belly: '#ece2cf', wing: '#7a4a24', streak: '#3f2412', head: '#efe7d8', cap: '#8e8e94', nape: '#a0522d', bib: '#1f1a17', beak: '#2b2b2b', tail: '#6b4423', eye: '#1a0f0a', legs: '#c98b6a', tl: 1 },
  myna: { body: '#6a4630', belly: '#7a5640', wing: '#4a2e1e', streak: '#fff', head: '#1e1a1a', cap: '#1e1a1a', nape: '#1e1a1a', bib: null, beak: '#ffc21a', tail: '#2a1e18', eye: '#7a3a10', legs: '#ffc21a', patch: '#ffc21a', tl: 1.1 },
  tota: { body: '#3fae49', belly: '#8fd66a', wing: '#2e8a3a', streak: '#1f6a2a', head: '#4cc256', cap: '#4cc256', nape: '#4cc256', bib: null, ring: '#e5463b', beak: '#e5463b', tail: '#2e8a3a', eye: '#1a0f0a', legs: '#9a8a8a', tl: 1.9, hook: 1 },
  kauwa: { body: '#2a2a30', belly: '#3a3a42', wing: '#1c1c22', streak: '#111', head: '#2a2a30', cap: '#1c1c22', nape: '#6b6b74', bib: null, beak: '#1c1c22', tail: '#1c1c22', eye: '#fff', legs: '#333', tl: 1.2, big: 1 },
};
// o: x,y = feet; s; flip; rot; t; pose: stand | fly | faint | drink | hop; pant 0..1 (beak open, tongue); happy; wet; kind
function bird(o) {
  o = Object.assign({ x: 0, y: 0, s: 1, flip: 1, rot: 0, t: 0, pose: 'stand', pant: 0, happy: 0, blink: 0, kind: 'chidiya', look: 0, flap: 0, drip: 0, fluff: 0, wet: 0 }, o);
  const K = BIRDK[o.kind], I = C.ink, sc = K.big ? 1.25 : 1, t = o.t;
  let g = `<g transform="translate(${o.x.toFixed(1)},${o.y.toFixed(1)}) rotate(${o.rot.toFixed(1)}) scale(${(o.s * sc * o.flip).toFixed(3)},${(o.s * sc).toFixed(3)})">`;
  const faint = o.pose === 'faint', fly = o.pose === 'fly', drink = o.pose === 'drink', hop = o.pose === 'hop';
  const by = hop ? -14 * Math.abs(Math.sin(t * 12)) : 0;
  if (faint) {
    // lying on its side, feet up, X eyes, beak open panting
    g += `<g transform="translate(0,-18) rotate(-80)">`;
  }
  // legs
  if (!fly) g += `<g stroke="${K.legs}" stroke-width="4.5" stroke-linecap="round" fill="none"><path d="M-6,${-20 + by} L-9,0 M-9,0 l-8,2 M-9,0 l6,2"/><path d="M7,${-20 + by} L9,0 M9,0 l-6,2 M9,0 l8,2"/></g>`;
  else g += `<path d="M-4,-24 l-14,10 M4,-24 l-12,12" stroke="${K.legs}" stroke-width="4" stroke-linecap="round"/>`;
  const head = drink ? 'translate(16,30) rotate(70)' : `rotate(${o.look})`;
  // tail
  g += `<path d="M-26,${-34 + by} L${-64 * K.tl},${-50 - 6 * K.tl + by} L${-58 * K.tl},${-34 + by} L${-62 * K.tl},${-26 + by}Z" fill="${K.tail}" stroke="${I}" stroke-width="4" stroke-linejoin="round"/>`;
  // far wing (flying)
  const fa = fly ? 58 * Math.sin(t * 22) : (o.flap ? 30 * Math.sin(t * 30) * o.flap : 0);
  const wingP = `M0,0 Q-14,-34 -54,-40 Q-44,-24 -50,-14 Q-34,-10 -36,0 Q-18,8 0,6Z`;
  if (fly || o.flap) g += `<g transform="translate(-2,${-48 + by}) rotate(${(-40 - fa).toFixed(1)})"><path d="${wingP}" fill="${K.wing}" stroke="${I}" stroke-width="4" opacity=".9"/></g>`;
  // body (fluffed when happy / wet = slicked)
  const rx = 34 * (1 + .12 * o.fluff), ry = 25 * (1 + .12 * o.fluff) * (1 - .08 * o.wet);
  g += `<ellipse cx="0" cy="${-36 + by}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${K.body}" stroke="${I}" stroke-width="5"/>`;
  g += `<ellipse cx="9" cy="${-27 + by}" rx="${(23 * (1 + .1 * o.fluff)).toFixed(1)}" ry="15" fill="${K.belly}"/>`;
  // near wing with streaks + white wing bar
  if (!fly) g += `<g transform="translate(-4,${-44 + by}) rotate(${(8 + fa).toFixed(1)})"><path d="M14,-8 Q-6,-16 -34,-8 Q-40,6 -28,14 Q0,16 16,6Z" fill="${K.wing}" stroke="${I}" stroke-width="4"/><path d="M-22,-4 q8,-4 16,0 M-24,4 q8,-4 18,0" stroke="${K.streak}" stroke-width="3" fill="none"/><path d="M-8,-12 q10,-2 18,2" stroke="#fff" stroke-width="4" fill="none" opacity="${o.kind === 'chidiya' || o.kind === 'myna' ? .9 : 0}"/></g>`;
  else g += `<g transform="translate(-2,${-46 + by}) rotate(${(-20 + fa).toFixed(1)})"><path d="${wingP}" fill="${K.wing}" stroke="${I}" stroke-width="4"/><path d="M-36,-26 q12,4 22,2" stroke="${K.streak}" stroke-width="3" fill="none"/></g>`;
  // head
  g += `<g transform="translate(22,${-60 + by}) ${head}">`;
  g += `<circle cx="0" cy="0" r="${K.big ? 18 : 19}" fill="${K.head}" stroke="${I}" stroke-width="5"/>`;
  if (o.kind === 'chidiya') g += `<path d="M-17,-6 Q-12,-20 2,-19 Q14,-18 17,-6 Q6,-11 -4,-9Z" fill="${K.cap}"/><path d="M-18,0 Q-14,-8 -4,-8 Q-10,-2 -16,6Z" fill="${K.nape}"/><path d="M6,10 Q14,14 18,6 Q16,16 8,19 Q2,18 2,12Z" fill="${K.bib}"/>`;
  if (K.nape && o.kind === 'kauwa') g += `<path d="M-18,4 Q-14,14 -2,16" stroke="${K.nape}" stroke-width="7" fill="none" opacity=".7"/>`;
  if (K.patch) g += `<path d="M6,-8 q10,-2 12,8 q-8,4 -12,-2z" fill="${K.patch}"/>`;
  if (K.ring) g += `<path d="M-10,14 q12,8 22,0" stroke="${K.ring}" stroke-width="4" fill="none"/><path d="M-12,18 q14,8 26,-2" stroke="#1a1a1a" stroke-width="3" fill="none"/>`;
  // eye: X when fainted, happy arc, blink
  if (faint) g += `<path d="M5,-7 l9,9 M14,-7 l-9,9" stroke="${I}" stroke-width="3.5" stroke-linecap="round"/>`;
  else if (o.happy > .5) g += `<path d="M4,-2 q6,-8 12,0" stroke="${I}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  else if (o.blink > .6) g += `<path d="M4,-3 h12" stroke="${I}" stroke-width="3.5" stroke-linecap="round"/>`;
  else g += `<circle cx="10" cy="-3" r="${K.big ? 5 : 6}" fill="${K.eye}"/><circle cx="12" cy="-5" r="2" fill="#fff"/>`;
  // beak (open when panting / chirping)
  const op = clamp(o.pant) * (.5 + .5 * Math.abs(Math.sin(t * 14)));
  if (K.hook) g += `<path d="M16,-6 Q32,-6 30,10 Q24,4 16,6Z" fill="${K.beak}" stroke="${I}" stroke-width="3.5"/>`;
  else {
    g += `<path d="M17,${-3 - 4 * op} L${K.big ? 40 : 34},${1 - 3 * op} L17,${3 - op}Z" fill="${K.beak}" stroke="${I}" stroke-width="3" stroke-linejoin="round"/>`;
    g += `<path d="M17,${4 + op} L${K.big ? 36 : 31},${5 + 6 * op} L17,${8 + 2 * op}Z" fill="${K.beak}" stroke="${I}" stroke-width="3" stroke-linejoin="round"/>`;
    if (op > .2) g += `<ellipse cx="22" cy="${4 + 2 * op}" rx="5" ry="${2 + 2 * op}" fill="#ff7a8a"/>`;
  }
  g += '</g>';
  if (faint) g += '</g>';
  // drips (wet) and happy sparkle
  if (o.drip > 0) for (let i = 0; i < 3; i++) { const p = (t * 1.5 + i / 3) % 1; g += `<path d="M${-10 + i * 14},${-12 + p * 30} q4,6 0,9 q-4,-3 0,-9z" fill="#7fd0ff" opacity="${(1 - p) * o.drip}"/>`; }
  return g + '</g>';
}
const chidiya = o => bird(Object.assign({ kind: 'chidiya' }, o));
// heat wiggles + sweat drops over something hot/tired (screen or world coords)
function heatWiggle(x, y, s, t, op = 1) { let g = ''; for (let i = 0; i < 3; i++) { const p = (t * .9 + i / 3) % 1; g += `<path d="M${x - 30 * s + i * 30 * s},${y - p * 90 * s} q${8 * s},${-10 * s} 0,${-20 * s} q${-8 * s},${-10 * s} 0,${-20 * s}" stroke="#ff8a3a" stroke-width="${4 * s}" fill="none" stroke-linecap="round" opacity="${(op * (1 - p)).toFixed(2)}"/>`; } return g; }
function sweat(x, y, s, t, op = 1) { let g = ''; for (let i = 0; i < 2; i++) { const p = (t * 1.3 + i * .5) % 1; g += `<path transform="translate(${x + (i ? 26 : -20) * s},${y + p * 40 * s}) scale(${s})" d="M0,-12 q8,12 0,18 q-8,-6 0,-18z" fill="#9adcff" stroke="#2f7fd6" stroke-width="2" opacity="${(op * (1 - p * .7)).toFixed(2)}"/>`; } return g; }

// ---------- Basim's water tank + old pipe (action plane d=1, world coords; the set already draws the tank at x 1500..1700) ----------
const TK = { x: 1500, w: 200, top: 634, bot: 854 };              // tank body (from rowRoofL)
const PX = 1690, PJ = 1780, PE = 1872, PY = FY + 50;              // pipe: vertical at PX, along the floor at PY, joint at PJ, over the edge at PE
const LEDGE = { x0: 1846, x1: 2006, y: FY + 250 };                // tin chhajja over the gap (Basim's side wall)
const SPOT = [1930, FY + 238];                                    // where the sparrow lies on the ledge
const KUNDA = [1800, FY + 92];                                    // clay bowl after the fix (on Basim's roof floor)
function hotTank(t, o = {}) {
  // heat shimmer + a shine on the black tank, then the pipe, tap and joint
  let g = `<path d="M${TK.x + 30},${TK.top + 20} v170" stroke="#fff" stroke-width="10" opacity=".14"/>`;
  g += heatWiggle(TK.x + 100, TK.top - 10, 1.1, t, .8);
  const bend = o.bend || 0, burst = o.burst || 0;
  // vertical pipe + tap
  g += `<path d="M${PX},${TK.bot - 6} V${PY}" stroke="#7a7a82" stroke-width="22" fill="none"/><path d="M${PX},${TK.bot - 6} V${PY}" stroke="#a9a9b2" stroke-width="8" fill="none"/>`;
  g += `<g transform="translate(${PX},${FY - 40})"><rect x="-6" y="-10" width="40" height="20" rx="6" fill="#c9a24a" stroke="${C.ink}" stroke-width="4"/><rect x="18" y="-26" width="10" height="20" fill="#c9a24a" stroke="${C.ink}" stroke-width="3"/><path d="M8,-28 h30" stroke="#e5463b" stroke-width="8" stroke-linecap="round" transform="rotate(${(o.tap || 0) * 90} 23 -28)"/></g>`;
  // floor pipe: two pieces with a rusty joint; after the burst the right piece lies cracked; after the fix it is bent up into a gooseneck over the kunda
  g += `<path d="M${PX},${PY} H${PJ - 14}" stroke="#7a7a82" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M${PX},${PY} H${PJ - 14}" stroke="#a9a9b2" stroke-width="8"/>`;
  g += `<path d="M${PX - 10},${PY} q10,-14 20,0" stroke="#7a7a82" stroke-width="22" fill="none"/>`;
  if (bend <= 0) {
    const sh = burst > 0 ? 0 : (o.shake || 0) * 3 * Math.sin(t * 60);
    g += `<g transform="translate(0,${sh.toFixed(1)})"><path d="M${PJ + 16},${PY} H${PE}" stroke="#7a7a82" stroke-width="22" fill="none"/><path d="M${PJ + 16},${PY} H${PE}" stroke="#a9a9b2" stroke-width="8"/><path d="M${PE},${PY} V${PY + 900}" stroke="#7a7a82" stroke-width="22"/></g>`;
    g += `<rect x="${PJ - 18}" y="${PY - 18}" width="36" height="36" rx="6" fill="${burst > 0 ? '#8a4a2a' : '#9a6a4a'}" stroke="${C.ink}" stroke-width="4"/>`;
    if (burst > 0) g += `<path d="M${PJ - 8},${PY - 18} l6,10 l-6,8 l8,8 l-4,10" stroke="${C.ink}" stroke-width="4" fill="none"/>`;
    else if (o.shake) g += `<path d="M${PJ - 22},${PY - 30} q-10,-20 4,-36 M${PJ + 4},${PY - 30} q-10,-26 6,-44" stroke="#fff" stroke-width="6" fill="none" opacity="${.5 * o.shake}"/>`;
  } else {
    // bent gooseneck: from the joint up and over, its mouth above the kunda
    const k = ease(bend), mx = lerp(PE, KUNDA[0] + 30, k), my = lerp(PY, KUNDA[1] - 120, k);
    g += `<path d="M${PJ - 14},${PY} Q${lerp(PJ + 60, PJ + 20, k)},${lerp(PY, PY - 170, k)} ${mx},${my}" stroke="#7a7a82" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M${PJ - 14},${PY} Q${lerp(PJ + 60, PJ + 20, k)},${lerp(PY, PY - 170, k)} ${mx},${my}" stroke="#a9a9b2" stroke-width="8" fill="none"/>`;
    g += `<rect x="${PJ - 18}" y="${PY - 18}" width="36" height="36" rx="6" fill="#8a4a2a" stroke="${C.ink}" stroke-width="4"/><path d="M${PE},${PY} V${PY + 900}" stroke="#7a7a82" stroke-width="22" opacity="${1 - k}"/>`;
  }
  return g;
}
// water jet from the burst joint towards the ledge (world coords); k = strength 0..1
function jet(t, k, aimX = 2000, aimY = FY + 260) {
  if (k <= 0) return '';
  const x0 = PJ + 10, y0 = PY - 6; let g = '';
  const mx = (x0 + aimX) / 2, my = Math.min(y0, aimY) - 160 * k;
  for (let i = 0; i < 3; i++) { const w = [30, 18, 8][i] * k, c = ['#5fb8ec', '#9adcff', '#e8f8ff'][i]; g += `<path d="M${x0},${y0} Q${mx + 10 * Math.sin(t * 20 + i)},${my} ${aimX},${aimY}" stroke="${c}" stroke-width="${w.toFixed(1)}" fill="none" stroke-linecap="round" opacity=".92"/>`; }
  for (let i = 0; i < 18; i++) { const p = (t * 2.2 + i / 18) % 1, u = p, x = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * mx + u * u * aimX, y = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * my + u * u * aimY; g += `<circle cx="${(x + 14 * Math.sin(i * 5.1)).toFixed(1)}" cy="${(y + 12 * Math.cos(i * 3.7)).toFixed(1)}" r="${(5 + 4 * hs(i)) * k}" fill="#bfe8ff" opacity="${(.85 * (1 - p * .5)).toFixed(2)}"/>`; }
  // splash at the target
  for (let i = 0; i < 8; i++) { const p = (t * 3 + i / 8) % 1, a = -Math.PI * (.15 + .7 * hs(i + 40)); g += `<circle cx="${(aimX + Math.cos(a) * 90 * p).toFixed(1)}" cy="${(aimY + Math.sin(a) * 90 * p + 120 * p * p).toFixed(1)}" r="${(8 * k * (1 - p)).toFixed(1)}" fill="#9adcff" stroke="#2f7fd6" stroke-width="2"/>`; }
  return g;
}
// water running over Basim's roof floor and pouring into the gap (waste) — after the burst
function runoff(t, k) { if (k <= 0) return ''; let g = `<path d="M${PJ - 20},${PY + 10} Q${PJ + 40},${PY + 120} ${LEDGE.x0 - 10},${FY + 160} L${LEDGE.x0 + 10},${FY + 210} Q${PJ},${PY + 190} ${PJ - 120},${PY + 60}Z" fill="#8fd6ff" opacity="${(.55 * k).toFixed(2)}"/>`; for (let i = 0; i < 5; i++) { const p = (t * 1.4 + i / 5) % 1; g += `<path d="M${1880 + i * 8},${FY + 160 + p * 600} v40" stroke="#9adcff" stroke-width="6" opacity="${(k * (1 - p)).toFixed(2)}" stroke-linecap="round"/>`; } return g; }
// tin chhajja ledge over the gap + a glimpse of the gali far below (the drop)
function ledgeSvg(t, o = {}) {
  const { x0, x1, y } = LEDGE; let g = '';
  // the far-below gali seen down the gap (tiny people + cycle), clipped to the gap
  g += `<clipPath id="gapClip"><polygon points="1900,${FY} 2030,${FY} ${2030 + RK * 2600},${FY + 2600} ${1900 + RK * 2600},${FY + 2600}"/></clipPath><g clip-path="url(#gapClip)"><rect x="1500" y="${FY + 900}" width="800" height="1800" fill="#6a5a4e"/><rect x="1500" y="${FY + 900}" width="800" height="14" fill="#4a3a2e"/>`;
  for (let i = 0; i < 4; i++) { const px = 1640 + ((i * 97 + t * 30 * (i % 2 ? 1 : -1)) % 300); g += `<circle cx="${px}" cy="${FY + 930}" r="9" fill="${['#e5463b', '#3b8de5', '#ffd34a', '#22a35a'][i]}"/><rect x="${px - 6}" y="${FY + 938}" width="12" height="22" fill="${['#e5463b', '#3b8de5', '#ffd34a', '#22a35a'][i]}"/>`; }
  g += `<rect x="1500" y="${FY + 300}" width="800" height="600" fill="url(#gapDark)"/></g>`;
  // brackets + corrugated tin sheet, sloping down to the right
  g += `<path d="M${x0 + 10},${y + 4} l30,46 M${x1 - 30},${y + 14} l-20,40" stroke="#555" stroke-width="7"/>`;
  g += `<path d="M${x0},${y - 14} L${x1},${y + 4} L${x1 - 4},${y + 30} L${x0},${y + 10}Z" fill="#d07a3a" stroke="${C.ink}" stroke-width="6"/><path d="M${x0},${y + 10} L${x1 - 4},${y + 30}" stroke="#8a4a20" stroke-width="5"/>`;
  for (let k = 1; k < 7; k++) { const xx = lerp(x0, x1, k / 7); g += `<path d="M${xx},${y - 9 + 16 * k / 7} v14" stroke="#6f7a84" stroke-width="3"/>`; }
  g += `<path d="M${x0 + 20},${y - 6} L${x1 - 30},${y + 6}" stroke="#fff" stroke-width="3" opacity=".5"/>`;
  if (o.hot !== false) g += heatWiggle((x0 + x1) / 2, y - 14, .8, t, .7);
  return g;
}
// clay kunda (bird water bowl) with water level 0..1 and ripples
function kunda(x, y, s = 1, lvl = 1, t = 0, drip = 0) {
  let g = `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="10" rx="86" ry="16" fill="#000" opacity=".18"/><path d="M-80,-30 Q-74,14 0,16 Q74,14 80,-30Z" fill="#b5532f" stroke="${C.ink}" stroke-width="5"/><path d="M-60,-8 q60,14 120,0" stroke="#8a3a20" stroke-width="5" fill="none"/>`;
  g += `<ellipse cx="0" cy="-30" rx="82" ry="18" fill="#c8673f" stroke="${C.ink}" stroke-width="5"/><ellipse cx="0" cy="-30" rx="68" ry="12" fill="#6a2a14"/>`;
  if (lvl > 0) { g += `<ellipse cx="0" cy="${-30 + 6 * (1 - lvl)}" rx="${66 * Math.min(1, .5 + lvl)}" ry="${11 * Math.min(1, .5 + lvl)}" fill="#7fd0ff"/>`; for (let i = 0; i < 2; i++) { const p = (t * .8 + i / 2) % 1; g += `<ellipse cx="0" cy="-30" rx="${60 * p}" ry="${10 * p}" fill="none" stroke="#fff" stroke-width="3" opacity="${(1 - p) * lvl}"/>`; } g += `<ellipse cx="-24" cy="-33" rx="16" ry="4" fill="#fff" opacity=".6"/>`; }
  if (drip > 0) for (let i = 0; i < 3; i++) { const p = (t * 2.4 + i / 3) % 1; g += `<path d="M30,${-150 + p * 110} q6,8 0,13 q-6,-5 0,-13z" fill="#9adcff" stroke="#2f7fd6" stroke-width="2" opacity="${drip}"/>`; }
  return g + '</g>';
}
// thermometer sign (screen space)
function thermo9(x, y, s, t, k) { if (k <= 0) return ''; const lv = clamp(.55 + .45 * k + .03 * Math.sin(t * 6)); return `<g transform="translate(${x},${y}) scale(${s * back(clamp(k * 1.4))}) rotate(${4 * Math.sin(t * 3)})"><rect x="-26" y="-170" width="52" height="200" rx="26" fill="#fff" stroke="${C.ink}" stroke-width="7"/><rect x="-10" y="${-150 + 150 * (1 - lv)}" width="20" height="${150 * lv}" fill="#e5463b"/><circle cx="0" cy="40" r="40" fill="#e5463b" stroke="${C.ink}" stroke-width="7"/>${T(90, -60, 70, '48°', { fill: '#ff6a2a', shadow: '#000', anchor: 'start' })}</g>`; }
// heatwave look: warm tint + shimmer bands (screen space)
const heatTint = (t, op = 1) => `<rect width="1080" height="1920" fill="#ff9a3a" opacity="${(.07 * op).toFixed(3)}" style="mix-blend-mode:multiply"/>` + heatHaze(t, 820, 1000, .16 * op);
const gapDefs = `<defs><linearGradient id="gapDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a120d" stop-opacity=".0"/><stop offset=".6" stop-color="#1a120d" stop-opacity=".35"/><stop offset="1" stop-color="#1a120d" stop-opacity=".1"/></linearGradient></defs>`;
// thirsty birds sitting on the wires (world coords): panting beaks, heads turning
function wireBirds(t, o = {}) {
  let g = '';
  const B = [[180, 'kauwa', 1], [300, 'chidiya', 0], [420, 'myna', 1], [560, 'chidiya', 1], [1010, 'tota', 0], [1160, 'chidiya', 0], [1330, 'kauwa', 1], [2300, 'myna', 0], [2460, 'chidiya', 1]];
  B.forEach(([x, kind, k], i) => { const y = wireY(x, k); g += bird({ kind, x, y: y + 2, s: .62, t: t + i, pant: o.pant ?? 1, flip: o.look ? o.look(x, i) : (i % 2 ? -1 : 1), blink: blink(t, 2.4 + i * .2, i) }); });
  return g;
}
