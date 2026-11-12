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
