// SUSUMAN character rig + scenes. All drawing is a pure function of time,
// so the same character is reproduced identically in every episode.
const W = 1080, H = 1920;
const C = {
  skin: '#c98b5c', skinD: '#a5683f', hair: '#24140c', hair2: '#3e2415', hood: '#17171d',
  hood2: '#26262e', red: '#e0222c', redD: '#a3141c', gold: '#ffc83a', goldD: '#b97c00',
  ink: '#1a0f0a', white: '#ffffff'
};
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => { k = clamp(k); return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; };
const eout = k => { k = clamp(k); return 1 - Math.pow(1 - k, 3); };
const back = k => { k = clamp(k); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const seg = (t, a, b) => clamp((t - a) / (b - a));

function defs() {
  return `<defs>
  <radialGradient id="aura"><stop offset="0" stop-color="#fff6c8" stop-opacity=".95"/><stop offset=".35" stop-color="#ffc83a" stop-opacity=".6"/><stop offset="1" stop-color="#ff7a00" stop-opacity="0"/></radialGradient>
  <radialGradient id="redglow"><stop offset="0" stop-color="#ff3b30" stop-opacity=".85"/><stop offset="1" stop-color="#ff3b30" stop-opacity="0"/></radialGradient>
  <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14203d"/><stop offset="1" stop-color="#40598a"/></linearGradient>
  <linearGradient id="cape" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3b3b"/><stop offset="1" stop-color="#a3141c"/></linearGradient>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="soft"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>`;
}

function T(x, y, s, txt, o = {}) {
  const f = o.font || 'Bangers', fill = o.fill || '#fff', st = o.stroke || '#000', sw = o.sw ?? Math.max(6, s * .14);
  const anchor = o.anchor || 'middle', ls = o.ls ?? 2, op = o.op ?? 1, w = o.weight || 400;
  const sh = o.shadow ? `<text x="${x + 8}" y="${y + 10}" font-family="${f}" font-weight="${w}" font-size="${s}" text-anchor="${anchor}" letter-spacing="${ls}" fill="${o.shadow}" opacity="${op}">${txt}</text>` : '';
  return sh + `<text x="${x}" y="${y}" font-family="${f}" font-weight="${w}" font-size="${s}" text-anchor="${anchor}" letter-spacing="${ls}" fill="${fill}" stroke="${st}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke" opacity="${op}">${txt}</text>`;
}

// ---------- SUSU ----------
function arm(side, ang, o) {
  const rot = side < 0 ? ang : -ang;
  const kara = side > 0 ? `<ellipse cx="0" cy="140" rx="29" ry="8" fill="none" stroke="#d9dde3" stroke-width="7"/>` : '';
  const hand = o.fist ? `<circle cx="0" cy="158" r="31" fill="${C.skin}" stroke="${C.ink}" stroke-width="5"/><path d="M-18,150 h36 M-18,162 h36" stroke="${C.skinD}" stroke-width="4"/>`
    : `<circle cx="0" cy="158" r="30" fill="${C.skin}" stroke="${C.ink}" stroke-width="5"/>`;
  const bat = o.bat ? `<g transform="translate(0,150)"><rect x="-9" y="-8" width="18" height="70" rx="6" fill="#d9d2c0" stroke="${C.ink}" stroke-width="4"/><rect x="-24" y="58" width="48" height="170" rx="14" fill="#e3b77a" stroke="${C.ink}" stroke-width="5"/><path d="M-10,80 v130" stroke="#c9975a" stroke-width="5"/></g>` : '';
  return `<g transform="translate(${side * 98},-312) rotate(${rot})">${bat}
    <rect x="-29" y="-10" width="58" height="150" rx="29" fill="${C.hood}" stroke="${C.ink}" stroke-width="5"/>
    <rect x="-29" y="112" width="58" height="22" rx="8" fill="${C.red}" stroke="${C.ink}" stroke-width="4"/>
    ${hand}${kara}</g>`;
}
function leg(side, ang) {
  return `<g transform="translate(${side * 44},-150) rotate(${ang})">
    <rect x="-31" y="-6" width="62" height="140" rx="26" fill="#22222a" stroke="${C.ink}" stroke-width="5"/>
    <ellipse cx="${side * 8}" cy="142" rx="50" ry="26" fill="#f4f4f4" stroke="${C.ink}" stroke-width="5"/>
    <path d="M${side * 8 - 36},146 q36,10 72,0" stroke="${C.red}" stroke-width="7" fill="none"/></g>`;
}
function crown(x, y, s, op = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})" opacity="${op}" filter="url(#glow)">
   <path d="M-62,30 L-70,-30 L-32,4 L0,-46 L32,4 L70,-30 L62,30 Z" fill="${C.gold}" stroke="#fff" stroke-width="9" stroke-linejoin="round"/>
   <circle cx="-70" cy="-38" r="10" fill="#fff"/><circle cx="0" cy="-56" r="11" fill="#fff"/><circle cx="70" cy="-38" r="10" fill="#fff"/>
   <rect x="-60" y="26" width="120" height="14" rx="5" fill="#fff"/></g>`;
}
function emblem(x, y, s) { // gold drop with tiny crown = channel mark
  return `<g transform="translate(${x},${y}) scale(${s})">
   <path d="M0,-44 C-26,-10 -30,8 -30,18 C-30,36 -16,46 0,46 C16,46 30,36 30,18 C30,8 26,-10 0,-44Z" fill="${C.gold}" stroke="${C.ink}" stroke-width="5"/>
   <path d="M-10,8 q-6,14 6,22" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/></g>`;
}
function susu(o) {
  o = Object.assign({ x: 540, y: 1250, s: 1, flip: 1, armL: 12, armR: 12, fistL: 0, fistR: 0, mouth: 'frown', blink: 0, brow: 0,
    power: 0, cape: 0, crown: 0, legL: 0, legR: 0, tilt: 0, look: [0, 0], wink: 0, t: 0, squash: 1, amp: 0, shades: 0, rot: 0 }, o);
  if (o.amp > .04 && (o.mouth === 'frown' || o.mouth === 'smirk')) o.mouth = 'talk';
  const t = o.t;
  let g = `<g transform="translate(${o.x},${o.y}) rotate(${o.rot}) scale(${o.s * o.flip},${o.s * o.squash})">`;
  if (o.power > 0) g += `<circle cx="0" cy="-330" r="${380 + 18 * Math.sin(t * 9)}" fill="url(#aura)" opacity="${o.power}"/>`;
  if (o.cape > 0) {
    const w1 = 22 * Math.sin(t * 8), w2 = 26 * Math.sin(t * 8 + 1.6);
    g += `<g opacity="${o.cape}"><path d="M-92,-330 Q-150,-190 ${-175 + w1},-35 Q-60,${-10 + w2} 0,${-30 - w1} Q70,${-8 + w1} ${180 + w2},-40 Q150,-190 92,-330 Z" fill="url(#cape)" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/></g>`;
  }
  g += leg(-1, o.legL) + leg(1, o.legR);
  // hoodie body
  g += `<path d="M-108,-338 Q-128,-210 -108,-128 Q0,-112 108,-128 Q128,-210 108,-338 Q0,-372 -108,-338Z" fill="${C.hood}" stroke="${C.ink}" stroke-width="6"/>
   <path d="M-62,-200 Q0,-188 62,-200 L58,-140 Q0,-130 -58,-140Z" fill="${C.hood2}" stroke="#0c0c10" stroke-width="3"/>
   <path d="M-74,-352 Q0,-300 74,-352 Q30,-268 0,-262 Q-30,-268 -74,-352Z" fill="${C.red}" stroke="${C.ink}" stroke-width="5"/>
   <path d="M-24,-300 v62 M24,-300 v58" stroke="#eee" stroke-width="5" stroke-linecap="round"/>
   <circle cx="-24" cy="-236" r="6" fill="#eee"/><circle cx="24" cy="-240" r="6" fill="#eee"/>`;
  g += emblem(0, -236, .62 + .25 * o.power);
  g += arm(-1, o.armL, { fist: o.fistL, bat: o.batL }) + arm(1, o.armR, { fist: o.fistR, bat: o.batR });
  // head
  g += `<g transform="translate(0,-478) rotate(${o.tilt})">`;
  // back hair mass
  const bk = [[-98, -40, 46], [98, -40, 46], [-80, -88, 50], [80, -88, 50], [-40, -118, 52], [40, -118, 52], [0, -128, 50], [-108, 10, 32], [108, 10, 32]];
  g += bk.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.hair}" stroke="${C.ink}" stroke-width="5"/>`).join('');
  g += bk.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r - 6}" fill="${C.hair}"/>`).join('');
  g += `<ellipse cx="-104" cy="14" rx="21" ry="29" fill="${C.skin}" stroke="${C.ink}" stroke-width="5"/><ellipse cx="104" cy="14" rx="21" ry="29" fill="${C.skin}" stroke="${C.ink}" stroke-width="5"/>
   <ellipse cx="0" cy="8" rx="104" ry="112" fill="${C.skin}" stroke="${C.ink}" stroke-width="6"/>
   <ellipse cx="-62" cy="52" rx="20" ry="11" fill="#e0785e" opacity=".35"/><ellipse cx="62" cy="52" rx="20" ry="11" fill="#e0785e" opacity=".35"/>`;
  // eyes
  const eye = (cx, closed) => {
    if (closed) return `<path d="M${cx - 28},6 Q${cx},22 ${cx + 28},6" stroke="${C.ink}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    const ry = 31 * (1 - o.blink) + 2;
    return `<g><ellipse cx="${cx}" cy="6" rx="28" ry="${ry}" fill="#fff" stroke="${C.ink}" stroke-width="5"/>
      ${o.blink < .7 ? `<circle cx="${cx + o.look[0]}" cy="${10 + o.look[1]}" r="19" fill="#4a2716"/><circle cx="${cx + o.look[0]}" cy="${10 + o.look[1]}" r="9" fill="#0b0503"/><circle cx="${cx + o.look[0] - 7}" cy="${2 + o.look[1]}" r="6" fill="#fff"/>` : ''}
      <path d="M${cx - 30},${6 - ry * .55} Q${cx},${-2 - ry} ${cx + 30},${6 - ry * .55}" stroke="${C.ink}" stroke-width="9" fill="none" stroke-linecap="round"/></g>`;
  };
  g += eye(-40, 0) + eye(40, o.wink > .5);
  // brows: brow 0 = signature serious frown, 1 = surprised/raised
  const bi = lerp(-24, -58, o.brow), bo = lerp(-50, -52, o.brow);
  g += `<path d="M-14,${bi} Q-40,${bi - 18} -72,${bo}" stroke="${C.hair}" stroke-width="15" fill="none" stroke-linecap="round"/>
        <path d="M14,${bi} Q40,${bi - 18} 72,${bo}" stroke="${C.hair}" stroke-width="15" fill="none" stroke-linecap="round"/>`;
  g += `<path d="M-6,38 Q2,52 10,40" stroke="${C.skinD}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  const m = o.mouth;
  if (m === 'frown') g += `<path d="M-22,80 Q0,70 22,80" stroke="#5a2414" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  else if (m === 'smirk') g += `<path d="M-20,78 Q6,84 26,70" stroke="#5a2414" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  else if (m === 'shout') g += `<ellipse cx="0" cy="82" rx="27" ry="30" fill="#5a1414" stroke="${C.ink}" stroke-width="5"/><ellipse cx="0" cy="98" rx="15" ry="9" fill="#e5636b"/>`;
  else if (m === 'talk') g += `<ellipse cx="0" cy="80" rx="${20 + 6 * o.amp}" ry="${5 + 26 * o.amp}" fill="#5a1414" stroke="${C.ink}" stroke-width="5"/>`;
  else if (m === 'o') g += `<ellipse cx="0" cy="80" rx="13" ry="16" fill="#5a1414" stroke="${C.ink}" stroke-width="5"/>`;
  else if (m === 'grin') g += `<path d="M-38,66 Q0,116 38,66 Z" fill="#5a1414" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M-32,70 Q0,80 32,70 L30,76 Q0,86 -30,76Z" fill="#fff"/>`;
  else if (m === 'wobble') g += `<path d="M-26,82 q9,-10 17,0 q9,10 17,0 q9,-10 17,0" stroke="#5a2414" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  if (o.shades > 0) { const k = back(o.shades); g += `<g transform="translate(0,4) scale(${k})"><rect x="-78" y="-22" width="70" height="46" rx="16" fill="#111" stroke="${C.ink}" stroke-width="5"/><rect x="8" y="-22" width="70" height="46" rx="16" fill="#111" stroke="${C.ink}" stroke-width="5"/><path d="M-8,-8 h16" stroke="#111" stroke-width="7"/><path d="M-66,-12 l18,0 M20,-12 l18,0" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".8"/></g>`; }
  // front hair: curly fringe swooping over forehead (from his photo)
  const fr = [[-82, -62, 34], [-44, -86, 38], [0, -94, 38], [44, -86, 36], [82, -60, 32], [-96, -18, 24], [96, -18, 22]];
  g += fr.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.hair}" stroke="${C.ink}" stroke-width="5"/>`).join('');
  g += fr.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r - 6}" fill="${C.hair}"/>`).join('');
  g += `<path d="M-74,-56 Q-40,-108 22,-82 Q66,-62 50,-30 Q34,-56 4,-50 Q-30,-44 -46,-18 Q-62,-34 -74,-56Z" fill="${C.hair}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M-40,-70 q14,-12 30,-4 M10,-74 q16,-6 26,8 M-80,-80 q10,-14 26,-12 M50,-98 q14,2 20,16" stroke="${C.hair2}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  if (o.crown > 0) g += crown(0, -190 + 8 * Math.sin(t * 5), .9 * back(o.crown), clamp(o.crown * 2));
  g += `</g></g>`;
  return g;
}

// ---------- AMMI ----------
function ammi(o) {
  o = Object.assign({ x: 820, y: 1120, s: 1, look: [0, 10], brow: 0, mouth: 'flat', phone: 1, tilt: 0, blink: 0, amp: -1 }, o);
  if (o.amp > .04) o.mouth = 'amp';
  let g = `<g transform="translate(${o.x},${o.y}) scale(${o.s})">`;
  g += `<path d="M-70,-10 L-80,150 L-30,150 L-10,10Z M70,-10 L80,150 L30,150 L10,10Z" fill="#e9e1d4" stroke="${C.ink}" stroke-width="5"/>
        <ellipse cx="-55" cy="155" rx="34" ry="14" fill="#7a3b2a" stroke="${C.ink}" stroke-width="4"/><ellipse cx="55" cy="155" rx="34" ry="14" fill="#7a3b2a" stroke="${C.ink}" stroke-width="4"/>
        <path d="M-92,-250 Q-118,-120 -102,10 Q0,30 102,10 Q118,-120 92,-250 Q0,-282 -92,-250Z" fill="#1f7a78" stroke="${C.ink}" stroke-width="6"/>
        <path d="M-40,-250 Q0,-200 40,-250" stroke="#e8b44a" stroke-width="6" fill="none"/>
        <path d="M-96,-250 Q-150,-120 -120,-10 L-86,-14 Q-100,-140 -60,-252Z M96,-250 Q160,-150 138,-20 L104,-24 Q120,-150 60,-252Z" fill="#e4568a" stroke="${C.ink}" stroke-width="5"/>`;
  // arms holding phone
  g += `<path d="M-90,-220 Q-110,-120 -40,-120" stroke="#1f7a78" stroke-width="44" fill="none" stroke-linecap="round"/>
        <path d="M90,-220 Q110,-120 40,-120" stroke="#1f7a78" stroke-width="44" fill="none" stroke-linecap="round"/>`;
  if (o.phone) g += `<rect x="-26" y="-170" width="52" height="86" rx="10" fill="#222" stroke="${C.ink}" stroke-width="4"/><rect x="-20" y="-162" width="40" height="66" rx="5" fill="#7fd3ff"/>`;
  g += `<circle cx="-34" cy="-118" r="22" fill="#b97a50" stroke="${C.ink}" stroke-width="4"/><circle cx="34" cy="-118" r="22" fill="#b97a50" stroke="${C.ink}" stroke-width="4"/>`;
  g += `<g transform="translate(0,-345) rotate(${o.tilt})">
     <circle cx="0" cy="-70" r="46" fill="#120a07" stroke="${C.ink}" stroke-width="5"/>
     <ellipse cx="0" cy="0" rx="84" ry="92" fill="#b97a50" stroke="${C.ink}" stroke-width="6"/>
     <path d="M-86,10 Q-96,-80 0,-90 Q96,-80 86,10 Q70,-50 0,-56 Q-70,-50 -86,10Z" fill="#120a07" stroke="${C.ink}" stroke-width="5"/>
     <path d="M0,-88 L0,-56" stroke="#3a2418" stroke-width="3"/>`;
  const ey = (cx) => `<ellipse cx="${cx}" cy="0" rx="17" ry="${20 * (1 - o.blink) + 1}" fill="#fff" stroke="${C.ink}" stroke-width="4"/>${o.blink < .7 ? `<circle cx="${cx + o.look[0]}" cy="${o.look[1]}" r="10" fill="#2a160c"/>` : ''}`;
  g += ey(-32) + ey(32);
  const b = lerp(-26, -46, o.brow);
  g += `<path d="M-52,${-26} Q-32,${b} -12,${-28}" stroke="#120a07" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M12,-28 Q32,${b - 4} 52,-30" stroke="#120a07" stroke-width="7" fill="none" stroke-linecap="round"/>
     <circle cx="0" cy="28" r="4" fill="#8a5232"/><circle cx="30" cy="34" r="0"/>`;
  if (o.mouth === 'open') g += `<ellipse cx="0" cy="58" rx="17" ry="14" fill="#5a1414" stroke="${C.ink}" stroke-width="4"/>`;
  else if (o.mouth === 'amp') g += `<ellipse cx="0" cy="58" rx="17" ry="${4 + 18 * o.amp}" fill="#5a1414" stroke="${C.ink}" stroke-width="4"/>`;
  else if (o.mouth === 'talk') g += `<ellipse cx="0" cy="58" rx="16" ry="${6 + 8 * Math.abs(Math.sin(o.t * 18))}" fill="#5a1414" stroke="${C.ink}" stroke-width="4"/>`;
  else g += `<path d="M-18,58 Q0,52 18,58" stroke="#5a2414" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  g += `<circle cx="-84" cy="20" r="7" fill="${C.gold}"/><circle cx="84" cy="20" r="7" fill="${C.gold}"/></g></g>`;
  return g;
}

// ---------- SETS ----------
function room(t, o = {}) {
  let g = `<rect width="${W}" height="${H}" fill="#eadbc6"/>`;
  for (let x = 0; x < W; x += 90) g += `<rect x="${x}" y="0" width="45" height="1180" fill="#e3d2bb" opacity=".6"/>`;
  // window w/ Calgary skyline at night + snow
  g += `<rect x="150" y="300" width="460" height="560" fill="url(#night)" stroke="#fff" stroke-width="18"/>`;
  g += `<g fill="#0b1226">
    <rect x="170" y="700" width="70" height="160"/><rect x="250" y="650" width="60" height="210"/><rect x="420" y="680" width="80" height="180"/><rect x="510" y="720" width="80" height="140"/>
    <rect x="356" y="500" width="14" height="360"/><path d="M336,520 h54 l-8,-28 h-38z"/><rect x="359" y="468" width="8" height="26" fill="#ff4747"/></g>`;
  g += `<g fill="#ffd36b" opacity=".8"><rect x="262" y="672" width="8" height="10"/><rect x="284" y="700" width="8" height="10"/><rect x="436" y="702" width="8" height="10"/><rect x="470" y="740" width="8" height="10"/><rect x="530" y="760" width="8" height="10"/></g>`;
  for (let i = 0; i < 26; i++) { const sx = 170 + (i * 97) % 430, sy = 310 + ((i * 131 + t * 70) % 540); g += `<circle cx="${sx}" cy="${sy}" r="${3 + i % 3}" fill="#fff" opacity=".85"/>`; }
  g += `<rect x="150" y="300" width="460" height="560" fill="none" stroke="#fff" stroke-width="18"/><path d="M380,300 v560 M150,580 h460" stroke="#fff" stroke-width="10"/>`;
  // curtains (pinkish-brown, like home)
  const cur = (x) => { let s = `<path d="M${x},250 h150 q12,470 -10,660 h-130 q-16,-200 -10,-660z" fill="#b8876f" stroke="#6d4a3a" stroke-width="5"/>`; for (let k = 1; k < 5; k++) s += `<path d="M${x + k * 30},262 q${k % 2 ? 6 : -6},320 0,640" stroke="#93624d" stroke-width="7" fill="none"/>`; return s; };
  g += cur(60) + cur(560) + `<rect x="40" y="236" width="700" height="22" rx="10" fill="#7a5340"/>`;
  // floor
  g += `<rect x="0" y="1150" width="${W}" height="1100" fill="#a06c45"/>`;
  for (let y = 1190; y < H + 300; y += 70) g += `<path d="M0,${y} H${W}" stroke="#86562f" stroke-width="5"/>`;
  g += `<rect x="0" y="1140" width="${W}" height="18" fill="#7a5340"/>`;
  // sofa
  g += `<g><rect x="610" y="830" width="460" height="230" rx="40" fill="#25312c" stroke="${C.ink}" stroke-width="6"/>
    <rect x="600" y="1010" width="480" height="150" rx="30" fill="#2e3c36" stroke="${C.ink}" stroke-width="6"/>
    <rect x="585" y="930" width="70" height="230" rx="30" fill="#25312c" stroke="${C.ink}" stroke-width="6"/>
    <rect x="618" y="1160" width="24" height="30" fill="#111"/><rect x="1030" y="1160" width="24" height="30" fill="#111"/></g>`;
  return g;
}
function table(x, y, rot = 0) { // x,y = top-left of table top
  return `<g transform="translate(${x},${y}) rotate(${rot})">
    <rect x="0" y="0" width="360" height="34" rx="8" fill="#b07a46" stroke="${C.ink}" stroke-width="6"/>
    <rect x="22" y="30" width="26" height="130" fill="#7e5130" stroke="${C.ink}" stroke-width="5"/><rect x="312" y="30" width="26" height="130" fill="#7e5130" stroke="${C.ink}" stroke-width="5"/>
    <rect x="60" y="-30" width="54" height="34" rx="6" fill="#dfe8f0" stroke="${C.ink}" stroke-width="4" opacity=".9"/></g>`;
}
function ball(x, y, r = 34, rot = 0) {
  return `<g transform="translate(${x},${y}) rotate(${rot})"><circle r="${r}" fill="#e33b2f" stroke="${C.ink}" stroke-width="5"/><path d="M-${r},0 Q0,-${r * .5} ${r},0" stroke="#fff" stroke-width="7" fill="none"/></g>`;
}
function hallway(t, o) {
  const open = o.open || 0, glow = o.glow || 0;
  let g = `<rect width="${W}" height="${H}" fill="#d8c8b0"/><rect x="0" y="1260" width="${W}" height="1000" fill="#9b6a44"/>`;
  for (let y = 1300; y < H + 300; y += 70) g += `<path d="M0,${y} H${W}" stroke="#80532f" stroke-width="5"/>`;
  g += `<rect x="300" y="470" width="480" height="800" fill="#2b2117" stroke="${C.ink}" stroke-width="8"/>`;
  // interior light
  g += `<rect x="310" y="480" width="460" height="780" fill="#ffe08a" opacity="${clamp(glow * open * 1.2)}"/>`;
  // light leak under/around door
  if (glow > 0) g += `<rect x="300" y="1250" width="480" height="${26 + 14 * Math.sin(t * 20)}" fill="#ffd34a" opacity="${glow}" filter="url(#glow)"/>
     <ellipse cx="540" cy="1275" rx="${300 + 40 * glow}" ry="60" fill="#ffd34a" opacity="${glow * .55}" filter="url(#soft)"/>
     <rect x="770" y="480" width="${10 + 6 * glow}" height="780" fill="#ffd34a" opacity="${glow * .8}" filter="url(#glow)"/>`;
  // door panel hinged on the left
  const sx = 1 - open;
  g += `<g transform="translate(310,480) scale(${Math.max(sx, .02)},1)">
     <rect x="0" y="0" width="460" height="780" fill="#f6f2ea" stroke="${C.ink}" stroke-width="7"/>
     <rect x="50" y="50" width="360" height="300" rx="10" fill="none" stroke="#d6cdbd" stroke-width="8"/><rect x="50" y="410" width="360" height="320" rx="10" fill="none" stroke="#d6cdbd" stroke-width="8"/>
     <circle cx="400" cy="400" r="20" fill="#c9a24a" stroke="${C.ink}" stroke-width="4"/>
     <g transform="translate(230,200)"><circle r="78" fill="#3a8dde" stroke="${C.ink}" stroke-width="6"/>${T(0, 26, 74, 'WC', { font: 'Bangers', sw: 0, ls: 4 })}</g></g>`;
  return g;
}
function brushBg(t) {
  let g = `<rect width="${W}" height="${H}" fill="#0b0b12"/>`;
  const strokes = [[-200, 700, 1500, 160, -28, .9], [-100, 1100, 1500, 90, -28, .7], [200, 380, 1100, 60, -28, .6], [-300, 1450, 1600, 120, -28, .55]];
  strokes.forEach(([x, y, w, h, r, op], i) => { const dx = 30 * Math.sin(t * 1.5 + i); g += `<rect x="${x + dx}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" transform="rotate(${r} 540 960)" fill="${i % 2 ? C.redD : C.red}" opacity="${op}"/>`; });
  for (let i = 0; i < 40; i++) g += `<circle cx="${(i * 197) % W}" cy="${(i * 331) % H}" r="${2 + i % 4}" fill="${i % 3 ? '#ff3b30' : '#fff'}" opacity=".5"/>`;
  return g;
}
function caption(txt, who, op = 1) {
  if (!txt || op <= 0) return '';
  const lines = txt.split('|');
  const y0 = 1430 - lines.length * 64;
  let g = `<g opacity="${op}"><rect x="70" y="${y0 - 70}" width="940" height="${lines.length * 64 + 46}" rx="26" fill="#000" opacity=".62"/>`;
  if (who) g += `<rect x="96" y="${y0 - 104}" width="${who.length * 26 + 50}" height="56" rx="14" fill="${who === 'AMMI' ? '#1f7a78' : C.red}" stroke="#fff" stroke-width="4"/>${T(121, y0 - 62, 40, who, { anchor: 'start', sw: 0, ls: 3 })}`;
  const fs = Math.max(...lines.map(x => x.length)) > 30 ? 48 : 54; lines.forEach((l, i) => g += T(540, y0 + i * 64, fs, l, { font: 'Baloo2', weight: 800, sw: 8, ls: 0 }));
  return g + '</g>';
}
function bubble(x, y, w, h, txt, size, op = 1, tail = 'down', fill = '#fff') {
  const tl = tail === 'down' ? `<path d="M${x - 30},${y + h / 2 - 10} L${x - 60},${y + h / 2 + 70} L${x + 20},${y + h / 2 - 10}Z" fill="${fill}" stroke="${C.ink}" stroke-width="6"/>`
    : `<path d="M${x + 20},${y + h / 2 - 10} L${x + 70},${y + h / 2 + 70} L${x + 60},${y + h / 2 - 10}Z" fill="${fill}" stroke="${C.ink}" stroke-width="6"/>`;
  return `<g opacity="${op}" transform="translate(${x},${y}) scale(${eout(op)}) translate(${-x},${-y})">${tl}<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2.4}" fill="${fill}" stroke="${C.ink}" stroke-width="6"/>
    <rect x="${x - w / 2 + 6}" y="${y + h / 2 - 22}" width="${w - 12}" height="16" fill="${fill}"/>${T(x, y + size * .35, size, txt, { fill: C.ink, sw: 0, ls: 1 })}</g>`;
}
function burst(x, y, r, fill, txt, size, rot = -8, op = 1) {
  let p = ''; const n = 14;
  for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = i % 2 ? r * .72 : r; p += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr * .8).toFixed(1)}`; }
  return `<g opacity="${op}" transform="rotate(${rot} ${x} ${y})"><path d="${p}Z" fill="${fill}" stroke="${C.ink}" stroke-width="7"/>${T(x, y + size * .35, size, txt, { stroke: C.ink, sw: 10, shadow: C.red })}</g>`;
}
function cam(inner, cx, cy, z, shake = 0, t = 0) {
  const dx = shake * Math.sin(t * 90) * 14, dy = shake * Math.cos(t * 77) * 14;
  return `<g transform="translate(${cx + dx},${cy + dy}) scale(${z}) translate(${-cx},${-cy})">${inner}</g>`;
}
function hookText(l1, l2, t, a) {
  const k1 = back(seg(t, a, a + .35)), k2 = back(seg(t, a + 1.6, a + 1.95));
  let g = '';
  if (k1 > 0) g += `<g transform="translate(540,300) scale(${k1})">${T(0, 0, 92, l1, { shadow: '#000' })}</g>`;
  if (k2 > 0) g += `<g transform="translate(540,415) scale(${k2}) rotate(-3)">${T(0, 0, 118, l2, { fill: C.gold, shadow: C.red })}</g>`;
  return g;
}

// =====================================================================
// ---------- 2.5D DEPTH KIT (standing rule from Nov 12, 2026) ----------
// Characters stay the flat 2D rig above; DEPTH comes from the staging:
//   layer(d, cam, inner)  parallax layer at depth d (1 = action plane, >1 farther, <1 foreground).
//                         cam = {x, y, z, px, py}: pan (action-plane px), dolly/zoom z, screen pivot.
//                         Far layers pan 1/d as much and grow less on a push-in; near layers more.
//                         Auto depth-of-field: blur on the farthest layers (d>=5) and on the foreground (d<=.8).
//   depthDefs(hazeCol)    the filters/gradients (put once per frame, after defs()).
//   veil(op)              atmospheric haze veil drawn after each far layer (aerial perspective).
//   shadow(x,y,w,op,o)    soft contact/cast shadow (o.dx, o.skew push it away from the light).
//   lightPool(...)        additive glow pool on the floor (lamps, sun patches, the washroom-door gold light).
//   shafts(...)           god-ray light shafts from a source.   haze(y0,y1,op,col) horizon haze band.
//   motes(...)            sunlit dust drifting in the air.        distS(d) = character scale for depth d.
// =====================================================================
function depthDefs(haze = '#cfe3f2') {
  // depth-of-field blurs are clipped to the frame (rendering cost); haze is done with veils (veil()) between layers
  const R = 'filterUnits="userSpaceOnUse" x="-20" y="-20" width="1120" height="1960"';
  return `<defs><filter id="dof6" ${R}><feGaussianBlur stdDeviation="2.4"/></filter><filter id="dof4" ${R}><feGaussianBlur stdDeviation="1.3"/></filter>
  <filter id="dofNear" ${R}><feGaussianBlur stdDeviation="8"/></filter><filter id="dofNear2" ${R}><feGaussianBlur stdDeviation="3.5"/></filter>
  <linearGradient id="veilG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${haze}" stop-opacity=".15"/><stop offset=".55" stop-color="${haze}" stop-opacity=".75"/><stop offset="1" stop-color="${haze}" stop-opacity=".9"/></linearGradient>
  <radialGradient id="shad"><stop offset="0" stop-color="#1a0f0a" stop-opacity=".6"/><stop offset=".55" stop-color="#1a0f0a" stop-opacity=".3"/><stop offset="1" stop-color="#1a0f0a" stop-opacity="0"/></radialGradient>
  <radialGradient id="pool"><stop offset="0" stop-color="#fff4c0" stop-opacity=".95"/><stop offset=".4" stop-color="#ffc83a" stop-opacity=".55"/><stop offset="1" stop-color="#ff9a00" stop-opacity="0"/></radialGradient>
  <radialGradient id="poolW"><stop offset="0" stop-color="#fffbe8" stop-opacity=".7"/><stop offset="1" stop-color="#fff2c4" stop-opacity="0"/></radialGradient>
  <radialGradient id="sunG"><stop offset="0" stop-color="#fffdf0"/><stop offset=".22" stop-color="#fff3c0" stop-opacity=".85"/><stop offset="1" stop-color="#ffe7a0" stop-opacity="0"/></radialGradient>
  </defs>`;
}
// atmospheric haze veil drawn between depth layers (stronger towards the horizon). op = strength
function veil(op = .4, y0 = 0, y1 = 1920) { return `<rect x="-20" y="${y0}" width="1120" height="${y1 - y0}" fill="url(#veilG)" opacity="${clamp(op).toFixed(3)}"/>`; }
const distS = d => 1 / d;                       // how much smaller a character looks at depth d
function layer(d, cam, inner, o = {}) {
  const k = 1 / d, z = cam.z ?? 1, s = 1 + (z - 1) * k;
  const px = cam.px ?? 540, py = cam.py ?? 960, tx = (cam.x || 0) * k, ty = (cam.y || 0) * k;
  const body = typeof inner === 'function' ? inner(k, s) : inner;
  const g = `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)}) scale(${s.toFixed(4)}) translate(${(-px - tx).toFixed(1)},${(-py - ty).toFixed(1)})">${body}</g>`;
  const f = o.f !== undefined ? o.f : d >= 5 ? 'dof6' : d <= .62 ? 'dofNear' : d <= .8 ? 'dofNear2' : '';
  return f ? `<g filter="url(#${f})">${g}</g>` : g;
}
function shadow(x, y, w, op = 1, o = {}) {
  const ry = w * (o.flat ?? .2), dx = o.dx || 0, sk = o.skew || 0;
  return `<ellipse cx="${(x + dx).toFixed(1)}" cy="${y.toFixed(1)}" rx="${w.toFixed(1)}" ry="${ry.toFixed(1)}" fill="url(#shad)" opacity="${clamp(op).toFixed(3)}"${sk ? ` transform="translate(${x},${y}) skewX(${sk}) translate(${-x},${-y})"` : ''}/>`;
}
// shadow for something lifted h px above the floor: smaller and fainter the higher it is
const liftShadow = (x, floorY, w, h, o = {}) => shadow(x, floorY, w * clamp(1 - h / 1400, .25, 1), clamp(1 - h / 900, .12, 1) * (o.op ?? 1), o);
function lightPool(x, y, rx, ry, op = 1, grad = 'pool') {
  return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${grad})" opacity="${clamp(op).toFixed(3)}" style="mix-blend-mode:screen"/>`;
}
function shafts(x, y, ang, n, len, op, t, col = '#fff3c8', spread = .11, w = .045) {
  let g = '';
  for (let i = 0; i < n; i++) {
    const a = ang + (i - (n - 1) / 2) * spread + .025 * Math.sin(t * .6 + i * 1.3), ww = w * (.7 + .6 * Math.abs(Math.sin(i * 2.3)));
    const o = op * (.45 + .55 * Math.sin(i * 1.7 + t * .8) ** 2);
    g += `<path d="M${x},${y} L${(x + len * Math.cos(a - ww)).toFixed(1)},${(y + len * Math.sin(a - ww)).toFixed(1)} L${(x + len * Math.cos(a + ww)).toFixed(1)},${(y + len * Math.sin(a + ww)).toFixed(1)}Z" fill="${col}" opacity="${o.toFixed(3)}" style="mix-blend-mode:screen"/>`;
  }
  return g;
}
function haze(y0, y1, op = .5, col = '#fff1d6') {
  let g = ''; const n = 8;
  for (let i = 0; i < n; i++) { const a = y0 + (y1 - y0) * i / n; g += `<rect x="-600" y="${a.toFixed(1)}" width="2280" height="${((y1 - y0) / n + 1).toFixed(1)}" fill="${col}" opacity="${(op * Math.sin((i + .5) / n * Math.PI)).toFixed(3)}"/>`; }
  return g;
}
function motes(t, n, x0, y0, w, h, op = .7, seed = 1) {
  let g = '';
  for (let i = 0; i < n; i++) {
    const a = Math.sin((i + seed) * 91.7) * 43758.5; const r = a - Math.floor(a);
    const x = x0 + ((r * w + t * (8 + 12 * r) + 30 * Math.sin(t * .7 + i)) % w + w) % w, y = y0 + ((i * 137.3 % h) - t * (6 + 10 * r) % h + h) % h;
    g += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2 + 3 * r).toFixed(1)}" fill="#fff8d8" opacity="${(op * (.4 + .6 * Math.abs(Math.sin(t * 1.3 + i)))).toFixed(3)}"/>`;
  }
  return g;
}

// ---------- KITE DAY PROPS + KABOOTAR (Episode 2) ----------
function patang(x, y, s, rot, c1, c2 = '#fff', o = {}) {   // diamond kite with spine, bow and a little tail
  const fl = o.t !== undefined ? 6 * Math.sin(o.t * 9) : 0;
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s})">
    <path d="M0,62 q${-12 + fl},22 ${4 + fl},40 q${10 - fl},16 ${-4},30" stroke="${c2}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M0,-62 L54,0 L0,64 L-54,0Z" fill="${c1}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M0,-62 L54,0 L0,0Z" fill="${c2}" opacity=".92"/><circle cx="-20" cy="18" r="10" fill="${c2}" opacity=".9"/>
    <path d="M0,-62 V64" stroke="#6b4a2a" stroke-width="4"/><path d="M-54,0 Q0,-36 54,0" stroke="#6b4a2a" stroke-width="4" fill="none"/>
    <path d="M0,64 l-13,18 h26z" fill="${c2}" stroke="${C.ink}" stroke-width="3"/></g>`;
}
function dor(x1, y1, x2, y2, sag = 60, col = '#7a6a8a', w = 2.5, op = .9) {   // kite string with a sag
  return `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${((x1 + x2) / 2).toFixed(1)},${((y1 + y2) / 2 + sag).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" opacity="${op}"/>`;
}
function charkhi(x, y, s, rot = 0, t = 0, thread = '#e5463b', spin = 0) {   // wooden kite spool
  const a = spin * t * 720;
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">
    <rect x="-12" y="-120" width="24" height="70" rx="10" fill="#a8743f" stroke="${C.ink}" stroke-width="5"/><rect x="-12" y="50" width="24" height="70" rx="10" fill="#a8743f" stroke="${C.ink}" stroke-width="5"/>
    <rect x="-60" y="-56" width="120" height="112" rx="16" fill="${thread}" stroke="${C.ink}" stroke-width="5"/>
    ${[0, 1, 2, 3].map(k => `<path d="M-58,${-40 + ((k * 28 + a) % 112 + 112) % 112 - 0} h116" stroke="#fff" stroke-width="3" opacity=".35"/>`).join('')}
    <rect x="-74" y="-64" width="16" height="128" rx="6" fill="#c48a4c" stroke="${C.ink}" stroke-width="5"/><rect x="58" y="-64" width="16" height="128" rx="6" fill="#c48a4c" stroke="${C.ink}" stroke-width="5"/></g>`;
}
function feather(x, y, s, rot, op = 1) {
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s})" opacity="${op}"><path d="M0,-40 Q20,-10 6,34 L0,44 L-6,34 Q-20,-10 0,-40Z" fill="#eef2f7" stroke="${C.ink}" stroke-width="3.5"/><path d="M0,-34 V52" stroke="#8a97a8" stroke-width="3"/><path d="M0,-6 l10,-8 M0,8 l-10,-8 M0,20 l9,-7" stroke="#b8c2cf" stroke-width="2.5"/></g>`;
}
// KABOOTAR — grey-blue rock pigeon, green/purple shimmering neck, orange eyes, pink feet.
// pose: 'perch' | 'fly' | 'tangled' (one wing caught, flapping) | 'held' (wings folded, calm)
function kabootar(o) {
  o = Object.assign({ x: 0, y: 0, s: 1, flip: 1, rot: 0, t: 0, pose: 'perch', wide: 0, blink: 0, look: [0, 0], coo: 0, bob: 0 }, o);
  const B = '#9fb0c2', BD = '#71839a', BAR = '#3d4757', IR1 = '#2fa889', IR2 = '#8b58b8', INK = C.ink;
  let g = `<g transform="translate(${o.x.toFixed(1)},${o.y.toFixed(1)}) rotate(${o.rot.toFixed(1)}) scale(${(o.s * o.flip).toFixed(3)},${o.s.toFixed(3)})">`;
  const flying = o.pose === 'fly', tang = o.pose === 'tangled';
  const fa = flying ? 55 * Math.sin(o.t * 20) : tang ? 40 * Math.sin(o.t * 28) : 0;
  const wing = (ang, far) => `<g transform="translate(-6,-58) rotate(${ang.toFixed(1)})"><path d="M0,0 Q-20,-70 -96,-88 Q-82,-66 -88,-56 Q-70,-54 -74,-38 Q-50,-30 -50,-18 Q-24,-8 0,8Z" fill="${far ? BD : B}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M-40,-40 l-30,-12 M-44,-26 l-28,-8" stroke="${BAR}" stroke-width="6" stroke-linecap="round"/></g>`;
  if (flying || tang) g += wing(-20 + fa, 1);
  if (!flying) g += `<path d="M-6,-10 L-12,8 M-12,8 l-12,6 M-12,8 l2,12 M-12,8 l10,6 M12,-10 L16,8 M16,8 l-12,6 M16,8 l2,12 M16,8 l10,6" stroke="#e8667a" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  else g += `<path d="M-8,-14 l-20,16 M6,-14 l-14,18" stroke="#e8667a" stroke-width="5" stroke-linecap="round"/>`;
  g += `<path d="M-40,-44 L-104,-30 L-100,-10 L-36,-24Z" fill="${BD}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M-104,-30 L-100,-10 L-88,-13 L-92,-32Z" fill="#2c3340"/>`;
  g += `<ellipse cx="0" cy="-42" rx="54" ry="35" fill="${B}" stroke="${INK}" stroke-width="5"/><ellipse cx="6" cy="-30" rx="36" ry="16" fill="#c3cfdb" opacity=".7"/>`;
  g += `<path d="M18,-66 Q46,-62 50,-36 Q36,-50 16,-48Z" fill="${IR1}"/><path d="M24,-58 Q40,-54 44,-40" stroke="${IR2}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  if (!flying && !tang) g += `<path d="M-30,-58 Q0,-74 22,-58 Q10,-30 -36,-26 Q-46,-40 -30,-58Z" fill="${BD}" stroke="${INK}" stroke-width="4"/><path d="M-22,-46 l-20,4 M-18,-36 l-20,4" stroke="${BAR}" stroke-width="6" stroke-linecap="round"/>`;
  const hb = o.bob ? 6 * Math.sin(o.t * 14) : 0;
  g += `<g transform="translate(${42 + hb},-80)"><circle r="23" fill="${B}" stroke="${INK}" stroke-width="5"/>
    <circle cx="8" cy="-5" r="${9 + 3 * o.wide}" fill="#ff8a1e" stroke="${INK}" stroke-width="2.5"/>${o.blink > .5 ? `<path d="M0,-5 h16" stroke="${INK}" stroke-width="3"/>` : `<circle cx="${9 + o.look[0]}" cy="${-5 + o.look[1]}" r="${4.5 + o.wide}" fill="#111"/><circle cx="${7 + o.look[0]}" cy="${-8 + o.look[1]}" r="1.8" fill="#fff"/>`}
    <path d="M19,-2 L36,${4 + 4 * o.coo} L19,9Z" fill="#d8c3ae" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="20" cy="-3" rx="5" ry="3.5" fill="#f4f1ea"/></g>`;
  if (flying || tang) g += wing(-35 - fa * .9, 0);
  return g + '</g>';
}
// proj(d, cam, x, y): where a point at depth d lands on screen, and the scale a character there gets
// (layer scale x 1/d), so a character can walk from one depth to another smoothly.
function proj(d, cam, x, y) {
  const k = 1 / d, z = cam.z ?? 1, s = 1 + (z - 1) * k, px = cam.px ?? 540, py = cam.py ?? 960;
  return { x: (x - px - (cam.x || 0) * k) * s + px, y: (y - py - (cam.y || 0) * k) * s + py, s: s * k };
}

// ---------- 2.5D extras (Episode 4) ----------
// castShadow: long cast-shadow polygon on the floor for a prop of width w standing at (x, y); the sun is upper-right,
// so the shadow falls to the lower-left. len = shadow length, sk = how far it slides left per px of length.
function castShadow(x, y, w, len = 120, op = .22, sk = .9) {
  return `<path d="M${x - w / 2},${y} L${x + w / 2},${y} L${x + w / 2 - len * sk},${y + len * .45} L${x - w / 2 - len * sk},${y + len * .45}Z" fill="#1a0f0a" opacity="${op}"/>`;
}
// heat shimmer: thin wavy bright bands over hot ground / far layers (y0..y1)
function heatHaze(t, y0, y1, op = .18, n = 7) {
  let g = '';
  for (let i = 0; i < n; i++) { const y = y0 + (y1 - y0) * i / n + 6 * Math.sin(t * 2 + i); let p = `M-400,${y.toFixed(1)}`; for (let x = -400; x <= 1500; x += 60) p += ` Q${x + 30},${(y + 7 * Math.sin(t * 5 + x * .02 + i)).toFixed(1)} ${x + 60},${y.toFixed(1)}`; g += `<path d="${p}" stroke="#fff6dc" stroke-width="${3 + i % 3}" fill="none" opacity="${op}"/>`; }
  return g;
}

// ---------- KULFI THELA (Episode 4 "Ice Cream Wala Thela") ----------
// Blue kulfi cart: two spoked wheels, KULFI box with stars, two clay matkas, striped umbrella, brass bell on the handle.
// o: x,y = ground point between the wheels; ang = tilt in degrees (slope); roll = wheel angle (rad); ring = bell shake 0..1;
// rattle = lids/matkas jiggle 0..1; um = umbrella sway; flip = -1 to face the other way.
function thela(o) {
  o = Object.assign({ x: 0, y: 0, s: 1, ang: 0, roll: 0, ring: 0, rattle: 0, t: 0, flip: 1, um: 0 }, o);
  const I = C.ink, j = o.rattle * 8 * Math.sin(o.t * 47), j2 = o.rattle * 7 * Math.sin(o.t * 53 + 1);
  const wheel = (cx) => { let sp = ''; for (let k = 0; k < 8; k++) { const a = o.roll + k * Math.PI / 4; sp += `<path d="M${cx},-78 L${(cx + 66 * Math.cos(a)).toFixed(1)},${(-78 + 66 * Math.sin(a)).toFixed(1)}" stroke="#8a8f99" stroke-width="6"/>`; }
    return `<circle cx="${cx}" cy="-78" r="78" fill="#2a2a30" stroke="${I}" stroke-width="6"/><circle cx="${cx}" cy="-78" r="66" fill="#d9dde3" stroke="${I}" stroke-width="4"/>${sp}<circle cx="${cx}" cy="-78" r="15" fill="#e5463b" stroke="${I}" stroke-width="4"/>`; };
  let g = `<g transform="translate(${o.x.toFixed(1)},${o.y.toFixed(1)}) rotate(${o.ang.toFixed(2)}) scale(${(o.s * o.flip).toFixed(3)},${o.s.toFixed(3)})">`;
  // stand leg + handles (left)
  g += `<path d="M-215,-160 L-262,-4" stroke="#6b4a2a" stroke-width="16" stroke-linecap="round"/><path d="M-200,-250 L-345,-292 M-200,-205 L-345,-247" stroke="#8a8f99" stroke-width="13" stroke-linecap="round"/><rect x="-372" y="-306" width="40" height="72" rx="14" fill="#e5463b" stroke="${I}" stroke-width="4"/>`;
  // bell on the handle
  const br = o.ring * 22 * Math.sin(o.t * 40);
  g += `<g transform="translate(-300,-300) rotate(${br.toFixed(1)})"><path d="M0,0 v-14" stroke="${I}" stroke-width="4"/><path d="M-18,-12 Q-18,-40 0,-42 Q18,-40 18,-12Z" fill="#e8b830" stroke="${I}" stroke-width="4"/><circle cx="0" cy="-8" r="6" fill="#b8860b"/></g>`;
  if (o.ring > .2) g += `<path d="M-340,-360 l-26,-18 M-300,-370 v-30 M-262,-360 l24,-20" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="${o.ring}"/>`;
  // umbrella pole + dome
  const us = o.um * 4 * Math.sin(o.t * 6);
  g += `<g transform="rotate(${us.toFixed(1)} 40 -330)"><path d="M40,-330 V-640" stroke="#8a8f99" stroke-width="10"/>`;
  const cols = ['#e5463b', '#fff', '#ffd34a', '#fff', '#e5463b', '#fff', '#ffd34a', '#fff'];
  for (let k = 0; k < 8; k++) { const a0 = Math.PI + k * Math.PI / 8, a1 = a0 + Math.PI / 8; g += `<path d="M40,-735 L${(40 + 255 * Math.cos(a0)).toFixed(1)},${(-640 + 95 * Math.sin(a0) + 0).toFixed(1)} L${(40 + 255 * Math.cos(a1)).toFixed(1)},${(-640 + 95 * Math.sin(a1)).toFixed(1)}Z" fill="${cols[k]}" stroke="${I}" stroke-width="4" stroke-linejoin="round"/>`; }
  g += `<path d="M-215,-640 ${[...Array(10)].map((_, k) => `q${25.5},${26} 51,0`).join(' ')}" fill="#e5463b" stroke="${I}" stroke-width="4"/><circle cx="40" cy="-742" r="12" fill="#ffd34a" stroke="${I}" stroke-width="4"/></g>`;
  // box
  g += `<rect x="-210" y="-345" width="440" height="200" rx="18" fill="#2f7fd6" stroke="${I}" stroke-width="7"/><rect x="-210" y="-345" width="440" height="34" rx="12" fill="#fff" stroke="${I}" stroke-width="5"/>
    <rect x="-210" y="-178" width="440" height="30" rx="10" fill="#1f5fa8" stroke="${I}" stroke-width="5"/>`;
  g += `<g transform="scale(${o.flip},1)">${T(o.flip * 10, -213, 74, 'KULFI', { fill: '#fff', stroke: '#173f73', sw: 8, ls: 4 })}</g>`;
  [[-170, -250], [190, -250], [-150, -195], [170, -195]].forEach(([sx, sy]) => g += `<path d="M${sx},${sy - 14} l4,10 h11 l-9,7 l4,11 l-10,-7 l-10,7 l4,-11 l-9,-7 h11z" fill="#ffd34a" stroke="${I}" stroke-width="2"/>`);
  // matkas (clay pots) with red cloth lids + a steel lid between
  const matka = (mx, dy) => `<g transform="translate(${mx},${-345 + dy})"><path d="M-62,0 Q-74,-56 -40,-78 L40,-78 Q74,-56 62,0Z" fill="#b5532d" stroke="${I}" stroke-width="5"/><path d="M-60,-30 h120" stroke="#e6a35a" stroke-width="6" opacity=".8"/><path d="M-46,-78 Q0,-104 46,-78 Q50,-70 40,-66 Q0,-80 -40,-66 Q-50,-70 -46,-78Z" fill="#e5463b" stroke="${I}" stroke-width="4"/></g>`;
  g += matka(-110, j) + matka(150, j2) + `<ellipse cx="20" cy="${-350 + j * .6}" rx="52" ry="14" fill="#c9ced6" stroke="${I}" stroke-width="4"/><circle cx="20" cy="${-366 + j * .6}" r="8" fill="#8a8f99" stroke="${I}" stroke-width="3"/>`;
  // kulfi sign on the lid (stick kulfi icon)
  g += `<g transform="translate(-178,-300) rotate(-14)">${kulfi(0, 0, .32, 0, 'mango')}</g>`;
  g += wheel(-110) + wheel(150);
  return g + '</g>';
}
// stick kulfi: tapered cone with nuts, wooden stick. flavor 'mango' | 'malai' | 'pista'; bite 0..1 takes the top off
function kulfi(x, y, s, rot = 0, flavor = 'malai', bite = 0) {
  const col = { mango: '#ffb330', malai: '#fff3d6', pista: '#b9d98a' }[flavor] || '#fff3d6', top = -150 + 70 * bite;
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-9" y="-10" width="18" height="90" rx="6" fill="#e0b47a" stroke="${C.ink}" stroke-width="4"/>
    <path d="M-34,0 L-46,${top + 20} Q-46,${top - 6} -20,${top - 8} ${bite > 0 ? `Q-8,${top + 8} 4,${top - 4} Q16,${top + 10} 22,${top - 8}` : 'L20,' + (top - 8)} Q46,${top - 6} 46,${top + 20} L34,0Z" fill="${col}" stroke="${C.ink}" stroke-width="5"/>
    <circle cx="-12" cy="${top + 40}" r="5" fill="#7fb24a"/><circle cx="14" cy="${top + 70}" r="5" fill="#7fb24a"/><circle cx="-6" cy="${top + 100}" r="4" fill="#c98b5c"/><path d="M-22,${top + 30} q-6,40 4,90" stroke="#fff" stroke-width="6" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
}
function brick(x, y, s = 1, rot = 0) {
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-46" y="-40" width="92" height="40" rx="4" fill="#b5462e" stroke="${C.ink}" stroke-width="5"/><path d="M-30,-28 h20 M10,-14 h24" stroke="#8a3220" stroke-width="5"/></g>`;
}
function skateboard(x, y, s = 1, rot = 0, roll = 0) {
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M-110,-34 Q-124,-34 -120,-48 H120 Q124,-34 110,-34Z" fill="#e5463b" stroke="${C.ink}" stroke-width="5"/>${[-70, 70].map(cx => `<circle cx="${cx}" cy="-16" r="15" fill="#ffd34a" stroke="${C.ink}" stroke-width="4"/><path d="M${cx},-16 l${(10 * Math.cos(roll)).toFixed(1)},${(10 * Math.sin(roll)).toFixed(1)}" stroke="${C.ink}" stroke-width="3"/>`).join('')}</g>`;
}

// =====================================================================
// 2.5D for 16:9 renders (Episode 5): the depth-of-field filter regions in depthDefs() are clipped to the vertical frame
// (x -20..1100) for speed. A widescreen frame shows more of each layer, so use depthDefsW() there or blurred layers get cut off.
function depthDefsW(haze) { return depthDefs(haze).replace(/x="-20" y="-20" width="1120" height="1960"/g, 'x="-1600" y="-400" width="4300" height="2800"'); }

// ---------- EPISODE 5 "Bandar Ne Chashma Churaya": props + BANDAR MAMA ----------
function chashma(x, y, s = 1, rot = 0, glint = 0) {   // Dadi's round brown glasses
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s})"><path d="M-12,-2 Q0,-12 12,-2" stroke="#7a5c3c" stroke-width="6" fill="none"/>
    ${[-34, 34].map(cx => `<circle cx="${cx}" cy="0" r="24" fill="#dff1fb" fill-opacity=".55" stroke="#7a5c3c" stroke-width="7"/><path d="M${cx - 12},-8 l10,-8" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="${.6 + .4 * glint}"/>`).join('')}
    <path d="M-58,-4 l-34,-10 M58,-4 l34,-10" stroke="#7a5c3c" stroke-width="6" stroke-linecap="round"/>${glint > 0 ? `<g opacity="${glint}"><path d="M30,-30 l6,-22 l6,22 l22,6 l-22,6 l-6,22 l-6,-22 l-22,-6z" fill="#fff"/></g>` : ''}</g>`;
}
function kela(x, y, s = 1, rot = 0, peel = 0) {   // banana; peel 0..1 opens the skin
  let g = `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s})">`;
  if (peel > 0) g += `<path d="M-6,-58 Q${-40 * peel},${-30 + 10 * peel} ${-46 * peel},${10 * peel}" stroke="${C.ink}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M-6,-58 Q${-40 * peel},${-30 + 10 * peel} ${-46 * peel},${10 * peel}" stroke="#ffd23a" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M6,-58 Q${40 * peel},${-30 + 10 * peel} ${46 * peel},${10 * peel}" stroke="${C.ink}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M6,-58 Q${40 * peel},${-30 + 10 * peel} ${46 * peel},${10 * peel}" stroke="#ffd23a" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M0,-60 Q-10,-110 4,-140" stroke="${C.ink}" stroke-width="26" fill="none" stroke-linecap="round"/><path d="M0,-60 Q-10,-110 4,-140" stroke="#fff4c8" stroke-width="17" fill="none" stroke-linecap="round"/>`;
  g += `<path d="M-14,40 Q-30,-40 0,-${peel > 0 ? 62 : 110} Q${peel > 0 ? 0 : -6},-30 14,40Z" fill="#ffd23a" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>${peel > 0 ? '' : '<path d="M0,-110 l4,-16 h6 l-2,16z" fill="#6b4a2a"/>'}<path d="M-6,30 Q-16,-20 -4,-60" stroke="#e8b220" stroke-width="5" fill="none"/><path d="M-12,40 h24 v8 h-24z" fill="#6b4a2a"/></g>`;
  return g;
}
function moongPlate(x, y, s = 1) {   // steel plate of roasted peanuts (moongphali) on a little stool
  let g = `<g transform="translate(${x},${y}) scale(${s})"><rect x="-60" y="-70" width="120" height="70" fill="#8a5a32" stroke="${C.ink}" stroke-width="5"/><ellipse cx="0" cy="-74" rx="86" ry="22" fill="#c9cdd3" stroke="${C.ink}" stroke-width="5"/>`;
  for (let i = 0; i < 16; i++) { const a = hs(i + 500) * 6.28, r = hs(i + 520) * 52; g += `<ellipse cx="${(Math.cos(a) * r).toFixed(1)}" cy="${(-84 + Math.sin(a) * r * .22 - (i % 3) * 5).toFixed(1)}" rx="14" ry="8" fill="#d9a35e" stroke="${C.ink}" stroke-width="2.5" transform="rotate(${(a * 50).toFixed(0)} ${(Math.cos(a) * r).toFixed(1)} ${(-84 + Math.sin(a) * r * .22).toFixed(1)})"/>`; }
  return g + '</g>';
}
function kitaab(x, y, s = 1, rot = 0, col = '#e5463b') { return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s})"><rect x="-56" y="-38" width="112" height="76" rx="6" fill="${col}" stroke="${C.ink}" stroke-width="5"/><rect x="-48" y="-30" width="96" height="60" fill="#f6f1e2"/><path d="M0,-30 v60" stroke="${col}" stroke-width="6"/></g>`; }
function page(x, y, s, rot, op = 1) { return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s})" opacity="${op}"><rect x="-34" y="-44" width="68" height="88" fill="#fbfaf4" stroke="${C.ink}" stroke-width="3"/>${[0, 1, 2, 3, 4].map(k => `<path d="M-24,${-30 + k * 14} h48" stroke="#8aa4c8" stroke-width="3"/>`).join('')}</g>`; }
function sparks(x, y, t, k = 1, n = 9, r = 90) {   // electric sparks (crackle) at a wire
  if (k <= 0) return ''; let g = `<circle cx="${x}" cy="${y}" r="${r * .7 * k}" fill="#bfe9ff" opacity="${.45 * k}" filter="url(#glow)"/>`;
  for (let i = 0; i < n; i++) { const a = i / n * 6.28 + t * 9, l = r * (.5 + .6 * hs(i + Math.floor(t * 20))); let p = `M${x},${y}`; for (let j = 1; j <= 3; j++) p += ` L${(x + Math.cos(a + (j % 2 ? .3 : -.3)) * l * j / 3).toFixed(1)},${(y + Math.sin(a + (j % 2 ? .3 : -.3)) * l * j / 3).toFixed(1)}`; g += `<path d="${p}" stroke="${i % 2 ? '#fff' : '#7fd8ff'}" stroke-width="${4 + i % 3}" fill="none" stroke-linecap="round" opacity="${k}"/>`; }
  return g;
}

// ---------- BANDAR MAMA (rhesus-style gali monkey): brown fur, pink heart face, long tail ----------
// pose: sit | run | leap | hang (origin = the gripping hand) | angry (sit + screech). item: 'chashma' | 'kela' | 'peel' in the front hand.
function bandar(o) {
  o = Object.assign({ x: 0, y: 0, s: 1, flip: 1, rot: 0, pose: 'sit', t: 0, angry: 0, look: [0, 0], blink: 0, item: null, chew: 0, wave: 0, peel: 0 }, o);
  const F = '#9a7350', D = '#6e4f35', BL = '#e2c29a', FC = '#f0a98f', PALM = '#c98468', I = C.ink;
  const limb = (x1, y1, x2, y2, bend, w = 22) => { const mx = (x1 + x2) / 2 + bend, my = (y1 + y2) / 2 - Math.abs(bend) * .3; const d = `M${x1.toFixed(1)},${y1.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`; return `<path d="${d}" stroke="${I}" stroke-width="${w + 9}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${F}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`; };
  const hand = (x, y, r = 12) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${PALM}" stroke="${I}" stroke-width="4"/>`;
  const ph = o.t * 16, s1 = Math.sin(ph), c1 = Math.cos(ph);
  let P;
  if (o.pose === 'run') P = { body: [0, -88, 66, 40, -6], sh: [44, -98], hip: [-44, -86], head: [96, -126], hF: [64 + 40 * s1, -6 + Math.min(0, 30 * c1)], hB: [40 - 40 * s1, -4 + Math.min(0, -30 * c1)], fF: [-36 - 44 * s1, -2 + Math.min(0, -26 * c1)], fB: [-60 + 44 * s1, -2 + Math.min(0, 26 * c1)], tail: [-60, -96, -150, -150 + 20 * s1, -120, -210], dy: -10 * Math.abs(s1) };
  else if (o.pose === 'leap') P = { body: [0, -110, 70, 38, -24], sh: [44, -128], hip: [-46, -96], head: [100, -168], hF: [140, -190], hB: [124, -170], fF: [-120, -70], fB: [-110, -50], tail: [-60, -96, -170, -60, -230, -130], dy: 0 };
  else if (o.pose === 'hang') P = { body: [0, 130, 40, 58, 8], sh: [8, 84], hip: [-4, 176], head: [-30, 66], hF: [0, 0], hB: [80 + 10 * Math.sin(o.t * 3), 120 + 8 * Math.sin(o.t * 5)], fF: [16 + 10 * Math.sin(o.t * 4), 250], fB: [-26 + 10 * Math.sin(o.t * 4 + 1), 240], tail: [-30, 170, -110, 230, -70, 300], dy: 0 };
  else P = { body: [0, -88, 44, 58, -10], sh: [18, -122], hip: [-12, -58], head: [30, -170], hF: [56 + (o.item ? 0 : 0), -100 - 30 * o.wave], hB: [30, -86], fF: [26, -2], fB: [-16, -2], tail: [-40, -50, -130, -30, -120, -120], dy: o.angry ? -8 * Math.abs(Math.sin(o.t * 22)) : 0 };
  if (o.item === 'chashma' && o.pose === 'sit') P.hF = [70, -150 - 12 * Math.sin(o.t * 6)];
  if (o.chew && o.pose === 'sit') P.hF = [52, -150 + 6 * Math.sin(o.t * 14)];
  let g = `<g transform="translate(${o.x.toFixed(1)},${(o.y).toFixed(1)}) rotate(${o.rot.toFixed(1)}) scale(${(o.s * o.flip).toFixed(3)},${o.s.toFixed(3)})"><g transform="translate(0,${P.dy.toFixed(1)})">`;
  // tail
  const sw = 14 * Math.sin(o.t * 3), [a0, a1, b0, b1, c0, c1_] = P.tail, td = `M${a0},${a1} Q${b0},${b1 + sw} ${c0 + sw},${c1_}`;
  g += `<path d="${td}" stroke="${I}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="${td}" stroke="${F}" stroke-width="13" fill="none" stroke-linecap="round"/>`;
  // far limbs
  g += limb(P.hip[0] - 6, P.hip[1], P.fB[0], P.fB[1], o.pose === 'sit' ? 30 : 10, 24) + hand(P.fB[0], P.fB[1], 13);
  g += limb(P.sh[0] - 8, P.sh[1], P.hB[0], P.hB[1], o.pose === 'hang' ? -20 : 14, 18) + hand(P.hB[0], P.hB[1]);
  // body
  const [bx, by, rx, ry, br] = P.body;
  g += `<g transform="rotate(${br} ${bx} ${by})"><ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${ry}" fill="${F}" stroke="${I}" stroke-width="6"/><ellipse cx="${bx + rx * .25}" cy="${by + ry * .2}" rx="${rx * .55}" ry="${ry * .6}" fill="${BL}"/></g>`;
  // near leg (sitting: knee up)
  if (o.pose === 'sit') g += `<ellipse cx="${P.hip[0] + 18}" cy="${P.hip[1] + 10}" rx="34" ry="26" fill="${F}" stroke="${I}" stroke-width="5"/>` + limb(P.hip[0] + 34, P.hip[1] + 12, P.fF[0], P.fF[1], 8, 20) + `<ellipse cx="${P.fF[0] + 10}" cy="${P.fF[1] - 4}" rx="20" ry="10" fill="${PALM}" stroke="${I}" stroke-width="4"/>`;
  else g += limb(P.hip[0] + 6, P.hip[1], P.fF[0], P.fF[1], o.pose === 'hang' ? 14 : -12, 24) + hand(P.fF[0], P.fF[1], 13);
  // head
  const [hx, hy] = P.head, ang = o.angry, bl = o.blink > .5;
  g += `<g transform="translate(${hx},${hy}) rotate(${o.pose === 'run' ? 8 : o.pose === 'hang' ? -6 : 0})">
    <circle cx="-40" cy="-6" r="17" fill="${FC}" stroke="${I}" stroke-width="4"/><circle cx="40" cy="-6" r="15" fill="${FC}" stroke="${I}" stroke-width="4"/>
    <circle r="46" fill="${F}" stroke="${I}" stroke-width="6"/><path d="M-34,-30 Q0,-58 34,-30" stroke="${D}" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M0,-18 C-14,-38 -42,-28 -36,0 C-32,22 -14,38 0,40 C14,38 32,22 36,0 C42,-28 14,-38 0,-18Z" fill="${FC}" stroke="${I}" stroke-width="4"/>
    ${bl ? `<path d="M-24,-6 h16 M8,-6 h16" stroke="${I}" stroke-width="5" stroke-linecap="round"/>` : `<ellipse cx="-16" cy="-6" rx="9" ry="${ang ? 8 : 11}" fill="#fff" stroke="${I}" stroke-width="3"/><ellipse cx="16" cy="-6" rx="9" ry="${ang ? 8 : 11}" fill="#fff" stroke="${I}" stroke-width="3"/><circle cx="${-15 + o.look[0]}" cy="${-5 + o.look[1]}" r="5.5" fill="#2b1a0e"/><circle cx="${17 + o.look[0]}" cy="${-5 + o.look[1]}" r="5.5" fill="#2b1a0e"/><circle cx="${-17 + o.look[0]}" cy="${-8 + o.look[1]}" r="2" fill="#fff"/><circle cx="${15 + o.look[0]}" cy="${-8 + o.look[1]}" r="2" fill="#fff"/>`}
    ${ang ? `<path d="M-28,-22 L-6,-14 M28,-22 L6,-14" stroke="${I}" stroke-width="6" stroke-linecap="round"/>` : `<path d="M-26,-22 q10,-6 18,-2 M26,-22 q-10,-6 -18,-2" stroke="${D}" stroke-width="5" fill="none" stroke-linecap="round"/>`}
    <ellipse cx="0" cy="18" rx="20" ry="14" fill="#f6bca6" stroke="${I}" stroke-width="3"/><circle cx="-5" cy="12" r="2.6" fill="${I}"/><circle cx="5" cy="12" r="2.6" fill="${I}"/>
    ${ang ? `<path d="M-14,24 Q0,${44 + 6 * Math.sin(o.t * 30)} 14,24Z" fill="#7a1a2a" stroke="${I}" stroke-width="3"/><path d="M-11,25 l4,6 l4,-5 l4,5 l4,-5 l4,6" stroke="#fff" stroke-width="2.5" fill="none"/>` : o.chew ? `<ellipse cx="0" cy="28" rx="${8 + 4 * Math.abs(Math.sin(o.t * 14))}" ry="${3 + 4 * Math.abs(Math.sin(o.t * 14))}" fill="#7a1a2a"/>` : `<path d="M-9,27 q9,6 18,0" stroke="${I}" stroke-width="3" fill="none"/>`}
    ${o.item === 'wear' ? chashma(0, -6, .5, 0) : ''}</g>`;
  // near arm + item
  g += limb(P.sh[0] + 4, P.sh[1], P.hF[0], P.hF[1], o.pose === 'hang' ? 6 : -16, 19);
  const IH = o.pose === 'hang' ? P.hB : P.hF;
  if (o.item === 'chashma') g += chashma(IH[0] + 8, IH[1] - 8, .62, -14 + 8 * Math.sin(o.t * 6));
  if (o.item === 'kela') g += kela(IH[0] + 4, IH[1] - 10, .5, 20, o.peel);
  g += hand(P.hF[0], P.hF[1]) + (o.pose === 'hang' && o.item ? hand(P.hB[0], P.hB[1]) : '');
  return g + '</g></g>';
}

