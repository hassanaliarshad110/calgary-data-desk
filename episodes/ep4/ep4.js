// SUSUMAN Episode 4 — "Ice Cream Wala Thela". ep2/ep3 sets + helpers, the studio-skeleton ensemble (sk.html sprites) + the 2.5D dhalaan gali.
const GY = 1060;
const KS = 1.25;  // cast scale in the gali              // street line (screen y) before any up-shift
const SPK = { QASIM: C.red, AMMI: '#1f7a78', BUNTY: '#2f6fd1', GUDDU: '#e0a020', BASIM: '#e07a2c', DADI: '#6b4f8f', AMMAR: '#d08a00', SAKINA: '#17917f', 'DADA ABU': '#8a6d2f', 'OFFICER GILL': '#1f2d4a', DHARMENDER: '#e09a00', 'KULFI CHACHA': '#2f7fd6', DANIEL: '#c8102e', AMARA: '#7a1f3d' };
let ABS = 0;
const AMPS = window.AMP || {};
function amp(sp) { const a = AMPS[sp]; if (!a) return 0; const i = Math.round(ABS * 30); return a[i] || 0; }
function L(id) { return TL.lines[id]; }
const sp01 = (t, a, b) => clamp((t - a) / (b - a));
const hsh = i => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };

// ---------- caption from the timeline ----------
function capFor(sceneId, t) {
  for (const id in TL.lines) {
    const l = TL.lines[id]; if (l.scene !== sceneId) continue;
    if (t >= l.s - .05 && t <= l.s + l.d + .35) {
      let txt = l.txt;
      if (txt.includes('~')) { const parts = txt.split('~'); const tot = parts.reduce((a, p) => a + p.length, 0); let acc = 0, u = (t - l.s) / l.d; for (const p of parts) { acc += p.length / tot; txt = p; if (u < acc) break; } }
      return caption2(txt, l.sp === 'NARR' ? '' : l.sp, clamp((t - l.s + .05) / .12));
    }
  }
  return '';
}
function caption2(txt, who, op) {
  const lines = txt.split('|'); const y0 = 1430 - lines.length * 64;
  let g = `<g opacity="${op}"><rect x="70" y="${y0 - 70}" width="940" height="${lines.length * 64 + 46}" rx="26" fill="#000" opacity=".62"/>`;
  if (who) g += `<rect x="96" y="${y0 - 104}" width="${who.length * 26 + 50}" height="56" rx="14" fill="${SPK[who]}" stroke="#fff" stroke-width="4"/>${T(121, y0 - 62, 40, who, { anchor: 'start', sw: 0, ls: 3 })}`;
  const fs = Math.max(...lines.map(x => x.length)) > 30 ? 48 : 54;
  lines.forEach((l, i) => g += T(540, y0 + i * 64, fs, l, { font: 'Baloo2', weight: 800, sw: 8, ls: 0 }));
  return g + '</g>';
}

// ---------- side cast ----------
function kid(o) {
  o = Object.assign({ x: 0, y: 0, s: 1, flip: 1, skin: '#b77850', shirt: '#2f6fd1', stripe: '#fff', shorts: '#2a2a33', hair: 'spiky', glasses: 0, num: '',
    armL: 10, armR: 10, legL: 0, legR: 0, mouth: 'flat', amp: 0, brow: 0, look: [0, 0], tilt: 0, blink: 0, batR: 0, wide: 1, t: 0, squash: 1, rot: 0 }, o);
  if (o.amp > .04) o.mouth = 'talk';
  const ww = o.wide;
  let g = `<g transform="translate(${o.x},${o.y}) rotate(${o.rot}) scale(${o.s * o.flip},${o.s * o.squash})">`;
  const leg = (side, ang) => `<g transform="translate(${side * 34 * ww},-205) rotate(${ang})"><rect x="-17" y="96" width="34" height="96" rx="14" fill="${o.skin}" stroke="${C.ink}" stroke-width="5"/>
    <rect x="-25" y="-6" width="50" height="118" rx="18" fill="${o.shorts}" stroke="${C.ink}" stroke-width="5"/><ellipse cx="${side * 6}" cy="196" rx="36" ry="15" fill="#7a4a2a" stroke="${C.ink}" stroke-width="5"/></g>`;
  g += leg(-1, o.legL) + leg(1, o.legR);
  g += `<path d="M${-82 * ww},-430 Q${-96 * ww},-300 ${-80 * ww},-195 Q0,-182 ${80 * ww},-195 Q${96 * ww},-300 ${82 * ww},-430 Q0,-458 ${-82 * ww},-430Z" fill="${o.shirt}" stroke="${C.ink}" stroke-width="6"/>
   <path d="M${-84 * ww},-330 H${84 * ww}" stroke="${o.stripe}" stroke-width="14" opacity=".9"/><path d="M-26,-440 Q0,-410 26,-440" stroke="${C.ink}" stroke-width="5" fill="none"/>`;
  if (o.num) g += T(0, -230, 70, o.num, { fill: '#fff', sw: 5 });
  const arm = (side, ang, bat) => {
    const rot = side < 0 ? ang : -ang;
    const b = bat ? `<g transform="translate(0,150)"><rect x="-9" y="-8" width="18" height="70" rx="6" fill="#d9d2c0" stroke="${C.ink}" stroke-width="4"/><rect x="-25" y="58" width="50" height="190" rx="14" fill="#e3b77a" stroke="${C.ink}" stroke-width="5"/><path d="M-10,80 v150" stroke="#c9975a" stroke-width="5"/></g>` : '';
    return `<g transform="translate(${side * 86 * ww},-410) rotate(${rot})">${b}<rect x="-22" y="0" width="44" height="150" rx="20" fill="${o.skin}" stroke="${C.ink}" stroke-width="5"/>
      <rect x="-27" y="-12" width="54" height="66" rx="20" fill="${o.shirt}" stroke="${C.ink}" stroke-width="5"/><circle cx="0" cy="156" r="25" fill="${o.skin}" stroke="${C.ink}" stroke-width="5"/></g>`;
  };
  g += arm(-1, o.armL, 0) + arm(1, o.armR, o.batR);
  g += `<g transform="translate(0,-540) rotate(${o.tilt})">`;
  g += `<ellipse cx="-86" cy="10" rx="18" ry="24" fill="${o.skin}" stroke="${C.ink}" stroke-width="5"/><ellipse cx="86" cy="10" rx="18" ry="24" fill="${o.skin}" stroke="${C.ink}" stroke-width="5"/>
        <ellipse cx="0" cy="6" rx="86" ry="92" fill="${o.skin}" stroke="${C.ink}" stroke-width="6"/>`;
  const eye = cx => `<ellipse cx="${cx}" cy="4" rx="21" ry="${24 * (1 - o.blink) + 1}" fill="#fff" stroke="${C.ink}" stroke-width="4"/>${o.blink < .7 ? `<circle cx="${cx + o.look[0]}" cy="${7 + o.look[1]}" r="12" fill="#2a160c"/><circle cx="${cx + o.look[0] - 4}" cy="${2 + o.look[1]}" r="4" fill="#fff"/>` : ''}`;
  g += eye(-34) + eye(34);
  if (o.glasses) g += `<circle cx="-34" cy="4" r="31" fill="none" stroke="#222" stroke-width="7"/><circle cx="34" cy="4" r="31" fill="none" stroke="#222" stroke-width="7"/><path d="M-4,2 h8" stroke="#222" stroke-width="7"/>`;
  const bi = lerp(-34, -56, o.brow);
  g += `<path d="M-56,-38 Q-34,${bi - 6} -12,${bi + 8}" stroke="#1a0f0a" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M12,${bi + 8} Q34,${bi - 6} 56,-38" stroke="#1a0f0a" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M-5,30 Q2,42 9,32" stroke="#7a4a2e" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  const m = o.mouth;
  if (m === 'talk') g += `<ellipse cx="0" cy="62" rx="${17 + 5 * o.amp}" ry="${4 + 22 * o.amp}" fill="#5a1414" stroke="${C.ink}" stroke-width="4"/>`;
  else if (m === 'laugh') g += `<path d="M-32,50 Q0,${92 + 6 * Math.sin(o.t * 30)} 32,50 Z" fill="#5a1414" stroke="${C.ink}" stroke-width="5"/>`;
  else if (m === 'o') g += `<ellipse cx="0" cy="64" rx="15" ry="22" fill="#5a1414" stroke="${C.ink}" stroke-width="4"/>`;
  else if (m === 'smile') g += `<path d="M-26,56 Q0,76 26,56" stroke="#5a2414" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  else g += `<path d="M-18,60 Q0,56 18,60" stroke="#5a2414" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  if (o.hair === 'spiky') {
    let p = 'M-90,-20 '; for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; p += `L${(Math.cos(a) * 112).toFixed(0)},${(Math.sin(a) * 118 - 10).toFixed(0)} L${(Math.cos(a + Math.PI / 16) * 80).toFixed(0)},${(Math.sin(a + Math.PI / 16) * 86 - 10).toFixed(0)} `; }
    g += `<path d="${p} L90,-20 Q60,-50 0,-52 Q-60,-50 -90,-20Z" fill="#160c08" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>`;
  } else {
    g += `<path d="M-92,6 Q-100,-96 0,-100 Q100,-96 92,6 Q80,-46 30,-56 Q-10,-30 -60,-46 Q-84,-30 -92,6Z" fill="#160c08" stroke="${C.ink}" stroke-width="5"/>`;
  }
  return g + '</g></g>';
}
const bunty = o => kid(Object.assign({ shirt: '#2f6fd1', stripe: '#ffd34a', num: '10', hair: 'spiky', skin: '#b07248', s: .62 * KS }, o));
const guddu = o => kid(Object.assign({ shirt: '#f2b631', stripe: '#e0602a', hair: 'side', glasses: 1, wide: 1.22, skin: '#c88c5e', shorts: '#5b3d24', s: .58 * KS }, o));

function cat(o) {
  o = Object.assign({ x: 0, y: 0, s: 1, flip: 1, rot: 0, pose: 'sit', t: 0, meow: 0, wide: 0 }, o);
  const OR = '#f29a3a', WH = '#fff5e6', INK = C.ink;
  let g = `<g transform="translate(${o.x},${o.y}) rotate(${o.rot}) scale(${o.s * o.flip},${o.s})">`;
  const sw = Math.sin(o.t * 5) * 18;
  g += `<path d="M-52,-44 Q-108,${-64 + sw} -92,${-128 + sw}" stroke="${INK}" stroke-width="24" fill="none" stroke-linecap="round"/><path d="M-52,-44 Q-108,${-64 + sw} -92,${-128 + sw}" stroke="${OR}" stroke-width="15" fill="none" stroke-linecap="round"/>`;
  const legs = { sit: [[38, 0], [18, 0], [-30, 0], [-12, 0]], walk: null, cling: [[40, -84], [22, -86], [-34, -78], [-16, -80]], fall: [[60, -70], [40, 10], [-60, -70], [-40, 12]] };
  let P = legs[o.pose];
  if (o.pose === 'walk') { const a = Math.sin(o.t * 22) * 14; P = [[38 + a, 0], [18 - a, 0], [-30 - a, 0], [-12 + a, 0]]; }
  P.forEach(([lx, ly]) => g += `<path d="M${lx * .7},-34 L${lx},${ly}" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M${lx * .7},-34 L${lx},${ly}" stroke="${WH}" stroke-width="12" stroke-linecap="round"/>`);
  g += `<ellipse cx="0" cy="-42" rx="${56 + o.wide * 8}" ry="32" fill="${WH}" stroke="${INK}" stroke-width="5"/><path d="M-36,-68 Q-6,-80 20,-70 Q4,-52 -30,-50Z" fill="${OR}"/>`;
  g += `<g transform="translate(52,-82)"><path d="M-28,-18 L-24,-58 L-4,-30Z M28,-18 L24,-58 L4,-30Z" fill="${OR}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <circle r="36" fill="${WH}" stroke="${INK}" stroke-width="5"/><path d="M4,-35 Q30,-30 34,-6 Q16,-14 4,-35Z" fill="${OR}"/>
    <ellipse cx="-14" cy="-4" rx="${10 + o.wide * 3}" ry="${12 + o.wide * 4}" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="-13" cy="-3" r="${7 + o.wide * 2}" fill="#14100c"/><circle cx="-16" cy="-7" r="3" fill="#fff"/>
    <ellipse cx="14" cy="-4" rx="${10 + o.wide * 3}" ry="${12 + o.wide * 4}" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="15" cy="-3" r="${7 + o.wide * 2}" fill="#14100c"/><circle cx="12" cy="-7" r="3" fill="#fff"/>
    <path d="M-5,10 h10 l-5,6z" fill="#f07a9a"/>${o.meow > 0 ? `<ellipse cx="0" cy="22" rx="7" ry="${3 + 7 * o.meow}" fill="#7a1a2a"/>` : `<path d="M-8,20 q8,6 16,0" stroke="${INK}" stroke-width="3" fill="none"/>`}
    <path d="M-20,14 h-26 M-20,20 l-24,6 M20,14 h26 M20,20 l24,6" stroke="${INK}" stroke-width="2.5"/></g>`;
  return g + '</g>';
}
function dog(o) {
  o = Object.assign({ x: 0, y: 0, s: 1, flip: 1, t: 0, run: 1, bark: 0 }, o);
  const B = '#b07a42', D = '#7a4f28', INK = C.ink;
  let g = `<g transform="translate(${o.x},${o.y}) scale(${o.s * o.flip},${o.s})">`;
  const a = o.run ? Math.sin(o.t * 24) * 26 : 0;
  [[50, a], [30, -a], [-46, -a], [-26, a]].forEach(([lx, an]) => g += `<g transform="translate(${lx},-50) rotate(${an})"><rect x="-10" y="0" width="20" height="56" rx="9" fill="${B}" stroke="${INK}" stroke-width="5"/></g>`);
  g += `<path d="M-70,-70 Q-110,${-110 + a} -96,-128" stroke="${INK}" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M-70,-70 Q-110,${-110 + a} -96,-128" stroke="${B}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  g += `<ellipse cx="0" cy="-74" rx="80" ry="38" fill="${B}" stroke="${INK}" stroke-width="5"/>`;
  g += `<g transform="translate(78,-112)"><ellipse rx="44" ry="38" fill="${B}" stroke="${INK}" stroke-width="5"/><ellipse cx="40" cy="12" rx="26" ry="18" fill="#d9a56b" stroke="${INK}" stroke-width="4"/><circle cx="62" cy="4" r="8" fill="#111"/>
    <path d="M-30,-20 Q-50,10 -34,34 Q-20,10 -14,-24Z" fill="${D}" stroke="${INK}" stroke-width="4"/><circle cx="10" cy="-10" r="7" fill="#111"/><circle cx="8" cy="-13" r="2.5" fill="#fff"/>
    ${o.bark > 0 ? `<path d="M26,26 Q46,${34 + 26 * o.bark} 64,26Z" fill="#7a1a2a" stroke="${INK}" stroke-width="4"/>` : `<path d="M34,30 Q40,52 50,30" fill="#f07a9a" stroke="${INK}" stroke-width="3"/>`}</g>`;
  return g + '</g>';
}

// ---------- gali set (parallax; world x) ----------
const HOUSES = [[-260, 400, 560, '#f4b7a6'], [140, 420, 640, '#ffd98a'], [560, 380, 520, '#9fd8cf'], [940, 440, 600, '#c9b3f0'],
  [1380, 400, 660, '#f6e7c8', 1], [1780, 380, 560, '#f4b7a6'], [2160, 440, 620, '#bfe3a0'], [2600, 400, 540, '#ffd98a'], [3000, 420, 600, '#9fd8cf']];
const TREE_X = 2250;
function branchTip(o) { return { x: 1950, y: 560 + (o.bend || 0) }; }
function gali(camX, t, o = {}) {
  let g = `<rect x="-2200" y="-1600" width="5500" height="4200" fill="#7cc7f2"/><rect x="-2200" y="0" width="5500" height="${GY}" fill="url(#sky)"/>`;
  g += `<circle cx="${860 - camX * .05}" cy="250" r="90" fill="#fff3c4" opacity=".9"/><circle cx="${860 - camX * .05}" cy="250" r="150" fill="#fff3c4" opacity=".25"/>`;
  for (let i = 0; i < 5; i++) { const cx = ((i * 520 + t * 14 - camX * .1) % 2600 + 2600) % 2600 - 300, cy = 140 + i * 70 % 210; g += `<g fill="#fff" opacity=".9"><ellipse cx="${cx}" cy="${cy}" rx="110" ry="34"/><ellipse cx="${cx + 60}" cy="${cy - 20}" rx="70" ry="38"/><ellipse cx="${cx - 50}" cy="${cy - 12}" rx="60" ry="28"/></g>`; }
  // kites
  [[300, 300, '#e5463b'], [980, 220, '#3b8de5'], [1700, 330, '#22a35a'], [2500, 260, '#e5b23b']].forEach(([kx, ky, c], i) => {
    const x = kx - camX * .25 + 20 * Math.sin(t * .9 + i), y = ky + 14 * Math.sin(t * 1.3 + i * 2), r = 10 * Math.sin(t * 1.1 + i);
    if (x < -900 || x > 2000) return;
    g += `<path d="M${x},${y + 36} Q${x - 60},${y + 300} ${x - 160},${y + 700}" stroke="#555" stroke-width="2" fill="none" opacity=".5"/><g transform="rotate(${r} ${x} ${y})"><path d="M${x},${y - 40} L${x + 32},${y} L${x},${y + 40} L${x - 32},${y}Z" fill="${c}" stroke="${C.ink}" stroke-width="4"/><path d="M${x},${y - 40} V${y + 40} M${x - 32},${y} H${x + 32}" stroke="#fff" stroke-width="2" opacity=".7"/><path d="M${x},${y + 40} q-10,20 4,36" stroke="${c}" stroke-width="5" fill="none"/></g>`;
  });
  // birds
  for (let i = 0; i < 8; i++) { const bx = ((i * 140 + t * 90 - camX * .5) % 2400 + 2400) % 2400 - 600, by = 380 + 30 * Math.sin(i * 2 + t), f = 14 * Math.sin(t * 12 + i); g += `<path d="M${bx - 18},${by - f} Q${bx - 8},${by - 6} ${bx},${by} Q${bx + 8},${by - 6} ${bx + 18},${by - f}" stroke="#333" stroke-width="4" fill="none" stroke-linecap="round"/>`; }
  // far rooftops
  g += `<g transform="translate(${-camX * .35},0)" fill="#d8b49a" opacity=".85">`;
  for (let i = 0; i < 16; i++) { const fx = -300 + i * 240, fh = 360 + (i * 97 % 160); g += `<rect x="${fx}" y="${GY - fh - 120}" width="230" height="${fh}"/><rect x="${fx + 60 + i % 3 * 40}" y="${GY - fh - 176}" width="64" height="56" rx="10" fill="#5f5a66"/>`; }
  g += `</g>`;
  // main houses
  g += `<g transform="translate(${-camX},0)">`;
  HOUSES.forEach(([hx, hw, hh, col, home], i) => {
    const top = GY - hh;
    g += `<rect x="${hx}" y="${top}" width="${hw}" height="${hh}" fill="${col}" stroke="${C.ink}" stroke-width="6"/>
      <rect x="${hx - 10}" y="${top - 26}" width="${hw + 20}" height="30" fill="#e9e2d6" stroke="${C.ink}" stroke-width="5"/>`;
    if (i % 2 === 0) g += `<rect x="${hx + hw - 130}" y="${top - 110}" width="90" height="84" rx="14" fill="#2f2f38" stroke="${C.ink}" stroke-width="5"/><rect x="${hx + hw - 136}" y="${top - 118}" width="102" height="18" rx="8" fill="#44444f"/>`;
    for (let f = 0; f < Math.floor((hh - 220) / 190); f++) {
      const wy = top + 60 + f * 190;
      [hx + 50, hx + hw - 150].forEach(wx => g += `<rect x="${wx}" y="${wy}" width="100" height="120" fill="#5a8bb0" stroke="${C.ink}" stroke-width="5"/><rect x="${wx - 26}" y="${wy}" width="26" height="120" fill="#3a8a5a" stroke="${C.ink}" stroke-width="4"/><rect x="${wx + 100}" y="${wy}" width="26" height="120" fill="#3a8a5a" stroke="${C.ink}" stroke-width="4"/>`);
      if (f === 0) g += `<rect x="${hx + 30}" y="${wy + 120}" width="${hw - 60}" height="16" fill="#7a5a3a" stroke="${C.ink}" stroke-width="4"/>${[...Array(9)].map((_, k) => `<path d="M${hx + 40 + k * (hw - 80) / 8},${wy + 136} v40" stroke="#7a5a3a" stroke-width="6"/>`).join('')}`;
    }
    const dc = home ? '#2f6fd1' : ['#7a4a2a', '#a33', '#386'][i % 3];
    g += `<rect x="${hx + hw / 2 - 70}" y="${GY - 230}" width="140" height="230" rx="8" fill="${o.doorOpen && home ? '#1b120c' : dc}" stroke="${C.ink}" stroke-width="6"/>${!(o.doorOpen && home) ? `<circle cx="${hx + hw / 2 + 44}" cy="${GY - 112}" r="9" fill="#e8c34a"/><path d="M${hx + hw / 2},${GY - 220} v210" stroke="${C.ink}" stroke-width="4" opacity=".5"/>` : ''}
      <rect x="${hx + hw / 2 - 90}" y="${GY - 6}" width="180" height="20" fill="#bdb3a3" stroke="${C.ink}" stroke-width="4"/>`;
    // clothesline to next house
    if (i < HOUSES.length - 1) {
      const y1 = top + 40, x1 = hx + hw, x2 = HOUSES[i + 1][0], y2 = GY - HOUSES[i + 1][2] + 40, mx = (x1 + x2) / 2, my = Math.max(y1, y2) + 40;
      g += `<path d="M${x1 - 30},${y1} Q${mx},${my + 20} ${x2 + 30},${y2}" stroke="#444" stroke-width="3" fill="none"/>`;
      ['#e5463b', '#3b8de5', '#fff', '#e5b23b'].forEach((c, k) => { const cx = x1 - 10 + k * 26, sway = 6 * Math.sin(t * 3 + k + i); g += `<rect x="${cx}" y="${my - 4 + k % 2 * 6}" width="22" height="40" fill="${c}" stroke="${C.ink}" stroke-width="3" transform="rotate(${sway} ${cx + 11} ${my})"/>`; });
    }
  });
  // street + chalk
  g += `<rect x="${camX - 2400}" y="${GY}" width="6000" height="3200" fill="#e2c99b"/>`;
  for (let i = 0; i < 120; i++) { const sx = i * 37 % 3400 - 200, sy = GY + 30 + (i * 61 % 820); if (sx > camX - 1000 && sx < camX + 2100) g += `<ellipse cx="${sx}" cy="${sy}" rx="${5 + i % 4 * 3}" ry="${3 + i % 3}" fill="#bfa478"/>`; }
  g += `<path d="M${camX - 2400},${GY + 4} H${camX + 3600}" stroke="#a88f68" stroke-width="10"/>`;
  g += `<path d="M830,${GY + 30} L800,${GY + 420}" stroke="#fff" stroke-width="12" stroke-dasharray="40 18" opacity=".9"/>`;      // boundary line
  g += `<g transform="translate(470,${GY + 170})"><rect x="0" y="0" width="70" height="34" fill="#b5462e" stroke="${C.ink}" stroke-width="4"/><rect x="0" y="-34" width="70" height="34" fill="#c3533a" stroke="${C.ink}" stroke-width="4"/><rect x="0" y="-68" width="70" height="34" fill="#b5462e" stroke="${C.ink}" stroke-width="4"/></g>`; // brick stumps
  if (o.score) g += `<g transform="translate(600,${GY - 400}) rotate(-3)">${T(0, 0, 54, o.score, { font: 'Bangers', fill: '#fff', stroke: '#555', sw: 3, ls: 2 })}</g>`;

  // foreground street life (seen in wide shots)
  const rick = (x, y) => `<g transform="translate(${x},${y})"><path d="M-130,-150 Q-120,-230 0,-232 Q120,-230 140,-150 Z" fill="#f4c430" stroke="${C.ink}" stroke-width="6"/><rect x="-140" y="-152" width="290" height="120" rx="20" fill="#2e8b57" stroke="${C.ink}" stroke-width="6"/><rect x="-100" y="-140" width="90" height="70" rx="10" fill="#bfe6f2" stroke="${C.ink}" stroke-width="4"/><circle cx="-90" cy="-20" r="36" fill="#222" stroke="${C.ink}" stroke-width="5"/><circle cx="-90" cy="-20" r="14" fill="#999"/><circle cx="110" cy="-20" r="36" fill="#222" stroke="${C.ink}" stroke-width="5"/><circle cx="110" cy="-20" r="14" fill="#999"/></g>`;
  const thela = (x, y) => `<g transform="translate(${x},${y})"><path d="M-110,-260 L110,-260 L0,-330 Z" fill="#e5463b" stroke="${C.ink}" stroke-width="5"/><path d="M0,-260 v120" stroke="#555" stroke-width="7"/><rect x="-130" y="-140" width="260" height="90" rx="10" fill="#b07a46" stroke="${C.ink}" stroke-width="6"/><rect x="-70" y="-200" width="60" height="60" rx="14" fill="#c0c0c8" stroke="${C.ink}" stroke-width="4"/><path d="M-10,-185 q30,-6 26,22" stroke="${C.ink}" stroke-width="4" fill="none"/>${[0, 1, 2].map(k => `<rect x="${20 + k * 30}" y="-170" width="22" height="30" rx="4" fill="#fff" stroke="${C.ink}" stroke-width="3"/>`).join('')}<path d="M${-40 + 8 * Math.sin(t * 3)},-210 q-14,-30 6,-60 q-16,-24 4,-50" stroke="#fff" stroke-width="6" fill="none" opacity=".7"/><circle cx="-90" cy="-30" r="30" fill="#5a3b22" stroke="${C.ink}" stroke-width="5"/><circle cx="90" cy="-30" r="30" fill="#5a3b22" stroke="${C.ink}" stroke-width="5"/>${T(0, -82, 44, 'CHAI', { fill: '#fff', sw: 5 })}</g>`;
  const cycle = (x, y) => `<g transform="translate(${x},${y})" fill="none" stroke="${C.ink}" stroke-width="7"><circle cx="-80" cy="-50" r="50"/><circle cx="80" cy="-50" r="50"/><path d="M-80,-50 L-20,-130 L60,-130 L80,-50 M-20,-130 L10,-50 L60,-130 M-30,-150 h30 M60,-130 L50,-170 h30" stroke="#d33"/></g>`;
  const plant = (x, y) => `<g transform="translate(${x},${y})"><path d="M-30,0 L-24,-50 H24 L30,0Z" fill="#c0603a" stroke="${C.ink}" stroke-width="4"/><circle cx="-14" cy="-70" r="24" fill="#3c9a4a" stroke="${C.ink}" stroke-width="4"/><circle cx="14" cy="-74" r="26" fill="#43a047" stroke="${C.ink}" stroke-width="4"/></g>`;
  g += thela(120, GY + 560) + rick(1250, GY + 600) + cycle(2620, GY + 520) + thela(3150, GY + 560) + plant(1500, GY + 30) + plant(1660, GY + 30) + plant(330, GY + 30);
  // neem tree
  const bend = o.bend || 0, snap = o.snap || 0;
  g += `<path d="M${TREE_X - 70},${GY + 30} Q${TREE_X - 40},${GY - 300} ${TREE_X - 50},${GY - 560} L${TREE_X + 50},${GY - 560} Q${TREE_X + 40},${GY - 300} ${TREE_X + 80},${GY + 30}Z" fill="#7a5233" stroke="${C.ink}" stroke-width="7"/>
    <path d="M${TREE_X - 20},${GY - 100} q10,-80 -6,-160 M${TREE_X + 20},${GY - 300} q-8,-60 6,-120" stroke="#5e3d24" stroke-width="6" fill="none"/>`;
  // the thin branch (snaps at its middle)
  const bx0 = TREE_X - 40, by0 = 600, mx = 2090, my = 580 + bend * .4, tx = 1950, ty = 560 + bend;
  g += `<path d="M${bx0},${by0} Q${(bx0 + mx) / 2},${by0 - 10} ${mx},${my}" stroke="${C.ink}" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M${bx0},${by0} Q${(bx0 + mx) / 2},${by0 - 10} ${mx},${my}" stroke="#7a5233" stroke-width="20" fill="none" stroke-linecap="round"/>`;
  if (snap < 1) {
    g += `<g transform="rotate(${snap * 0} ${mx} ${my})"><path d="M${mx},${my} Q${(mx + tx) / 2},${(my + ty) / 2 - 8} ${tx},${ty}" stroke="${C.ink}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M${mx},${my} Q${(mx + tx) / 2},${(my + ty) / 2 - 8} ${tx},${ty}" stroke="#7a5233" stroke-width="13" fill="none" stroke-linecap="round"/>
       ${[0, 1, 2].map(k => `<ellipse cx="${tx + 30 + k * 40}" cy="${ty - 22 - k % 2 * 10}" rx="26" ry="12" fill="#4caf50" stroke="${C.ink}" stroke-width="3" transform="rotate(-20 ${tx + 30 + k * 40} ${ty - 22})"/>`).join('')}</g>`;
    if (o.crackFx) g += `<path d="M${mx - 10},${my - 22} l12,14 l-10,8 l14,12" stroke="#fff" stroke-width="5" fill="none"/>`;
  } else {
    const fy = o.fallY || 0;
    g += `<g transform="translate(0,${fy}) rotate(${-40 * clamp(fy / 400)} ${mx} ${my})"><path d="M${mx},${my} L${tx},${ty}" stroke="${C.ink}" stroke-width="22" stroke-linecap="round"/><path d="M${mx},${my} L${tx},${ty}" stroke="#7a5233" stroke-width="13" stroke-linecap="round"/></g>`;
    g += `<path d="M${mx - 8},${my - 12} l16,8 l-12,10" stroke="#e8d0a8" stroke-width="7" fill="none"/>`;
  }
  // canopy
  const sway = 6 * Math.sin(t * 1.5);
  const leaves = [[0, -620, 190], [-170, -560, 140], [170, -560, 150], [-90, -760, 140], [100, -760, 150], [0, -860, 120], [-230, -660, 100], [240, -680, 110], [60, -520, 120]];
  g += `<g transform="translate(${TREE_X},${GY}) rotate(${sway * .3})">` + leaves.map(([lx, ly, r]) => `<circle cx="${lx}" cy="${ly}" r="${r}" fill="#2e7d32" stroke="${C.ink}" stroke-width="6"/>`).join('') + leaves.map(([lx, ly, r]) => `<circle cx="${lx - 18}" cy="${ly - 18}" r="${r * .72}" fill="#43a047"/>`).join('') + `</g>`;
  g += `</g>`;
  return g;
}
const skyDefs = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc7f2"/><stop offset=".7" stop-color="#ffe2b0"/></linearGradient>
  <radialGradient id="vig"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient></defs>`;

// ---------- FX ----------
function dust(x, y, k, n = 6, r = 60) { if (k <= 0 || k >= 1) return ''; let g = ''; for (let i = 0; i < n; i++) { const a = i / n * Math.PI; g += `<circle cx="${x + Math.cos(a) * (40 + 120 * k) * (i % 2 ? 1 : -1)}" cy="${y - Math.sin(a) * 30 * k}" r="${r * (.4 + .6 * k)}" fill="#efe1c4" opacity="${.85 * (1 - k)}"/>`; } return g; }
function speed(x, y, dir, op = .8, n = 5) { let g = ''; for (let i = 0; i < n; i++) g += `<path d="M${x - dir * 60},${y - 140 + i * 60} h${-dir * (120 + (i % 2) * 80)}" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="${op}"/>`; return g; }
function heart(x, y, s, op = 1) { return `<path transform="translate(${x},${y}) scale(${s})" d="M0,30 C-50,-5 -30,-50 0,-25 C30,-50 50,-5 0,30Z" fill="#ff4f7b" stroke="${C.ink}" stroke-width="5" opacity="${op}"/>`; }
function confetti(t, n = 60) { let g = ''; for (let i = 0; i < n; i++) { const x = (hsh(i) * 1080 + 40 * Math.sin(t * 3 + i)), y = ((hsh(i + 9) * 600 + t * (300 + 200 * hsh(i + 3))) % 1500) - 100, c = ['#e5463b', '#3b8de5', '#22a35a', '#e5b23b', '#ff4f7b'][i % 5]; g += `<rect x="${x}" y="${y}" width="18" height="28" fill="${c}" transform="rotate(${t * 300 + i * 40} ${x + 9} ${y + 14})"/>`; } return g; }
function fallingLeaves(t, x0, y0, n = 6) { let g = ''; for (let i = 0; i < n; i++) { const p = (t * .35 + hsh(i)) % 1, x = x0 + hsh(i + 2) * 300 + 50 * Math.sin(t * 2 + i), y = y0 + p * 700; g += `<ellipse cx="${x}" cy="${y}" rx="18" ry="8" fill="#43a047" stroke="${C.ink}" stroke-width="3" transform="rotate(${t * 120 + i * 50} ${x} ${y})" opacity="${1 - p}"/>`; } return g; }
function notes(x, y, t) { let g = ''; for (let i = 0; i < 3; i++) { const p = (t * .8 + i / 3) % 1; g += `<g opacity="${1 - p}" transform="translate(${x + 30 * Math.sin(p * 6 + i)},${y - p * 160})"><ellipse cx="0" cy="0" rx="14" ry="10" fill="#222"/><path d="M12,0 v-44 l18,8" stroke="#222" stroke-width="5" fill="none"/></g>`; } return g; }
function tally(n, label, k) { if (k <= 0) return ''; let g = `<g transform="translate(540,330) scale(${back(k)})"><rect x="-330" y="-110" width="660" height="200" rx="34" fill="#fff" stroke="${C.ink}" stroke-width="8"/>${T(0, -36, 56, label, { fill: C.ink, sw: 0 })}`; for (let i = 0; i < Math.min(n, 5); i++) g += i < 4 ? `<path d="M${-190 + i * 36},0 v62" stroke="${C.red}" stroke-width="14" stroke-linecap="round"/>` : `<path d="M-215,52 L-60,0" stroke="${C.red}" stroke-width="12" stroke-linecap="round"/>`; for (let i = 5; i < n; i++) g += `<path d="M${-30 + (i - 5) * 36},0 v62" stroke="${C.red}" stroke-width="14" stroke-linecap="round"/>`; return g + T(200, 60, 90, n + ' BAAR!', { fill: C.red, sw: 0 }) + '</g>'; }
function hookBig(l1, l2, t, a, b, y = 300) { const k1 = back(seg(t, a, a + .35)), k2 = back(seg(t, b, b + .35)); let g = ''; if (k1 > 0) g += `<g transform="translate(540,${y}) scale(${k1})">${T(0, 0, 96, l1, { shadow: '#000' })}</g>`; if (k2 > 0) g += `<g transform="translate(540,${y + 128}) scale(${k2}) rotate(-3)">${T(0, 0, 124, l2, { fill: C.gold, shadow: C.red })}</g>`; return g; }
const up = (s, d = 140) => `<g transform="translate(0,${-d})">${s}</g>`;
function shake(s, k, t) { return k > 0 ? `<g transform="translate(${k * 16 * Math.sin(t * 91)},${k * 12 * Math.cos(t * 73)})">${s}</g>` : s; }
function zoom(s, cx, cy, z) { return `<g transform="translate(${cx},${cy}) scale(${z}) translate(${-cx},${-cy})">${s}</g>`; }
const blink = (t, e = 2.7, o = 0) => { const p = (t + o) % e; return p < .12 ? Math.sin(p / .12 * Math.PI) : 0; };
const walkPh = (t, f = 22) => Math.sin(t * f) * 26;

// =================== EPISODE 2 SETS (2.5D: every set is 5-7 parallax layers) ===================
const skyDefs2 = `<defs><linearGradient id="skyK" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f9fe6"/><stop offset=".45" stop-color="#8fd0f4"/><stop offset=".72" stop-color="#ffe3b3"/><stop offset="1" stop-color="#ffd09a"/></linearGradient>
  <linearGradient id="skyEve" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f86d8"/><stop offset=".5" stop-color="#f7b98a"/><stop offset=".8" stop-color="#ffcf8a"/><stop offset="1" stop-color="#ffb877"/></linearGradient>
  <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0c9a0"/><stop offset="1" stop-color="#d9a77c"/></linearGradient>
  <linearGradient id="tankG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1c1c22"/><stop offset=".6" stop-color="#3a3a46"/><stop offset="1" stop-color="#15151a"/></linearGradient></defs>`;
const SUN = [880, 230];
const KCOL = [['#e5463b', '#ffd34a'], ['#3b8de5', '#fff'], ['#22a35a', '#ffe9a0'], ['#e5b23b', '#e5463b'], ['#b04ad6', '#fff'], ['#ff7a2f', '#3b8de5'], ['#ff4f7b', '#fff']];
const hs = i => { const x = Math.sin(i * 78.233 + 1.7) * 43758.5453; return x - Math.floor(x); };

// sky + sun (d=50) and clouds (d=12)
function skyL(t, cam, o = {}) {
  const sk = o.eve ? 'skyEve' : 'skyK';
  let g = layer(50, cam, `<rect x="-1500" y="-2600" width="4100" height="5200" fill="url(#${sk})"/><circle cx="${SUN[0]}" cy="${SUN[1]}" r="300" fill="url(#sunG)"/><circle cx="${SUN[0]}" cy="${SUN[1]}" r="66" fill="#fffbe8"/>`, { f: '' });
  let c = '';
  for (let i = 0; i < 9; i++) { const cx = ((i * 640 + t * 9) % 4200) - 1500, cy = -1400 + i * 260 % 1700; c += `<g fill="#fff" opacity="${o.eve ? .55 : .85}"><ellipse cx="${cx}" cy="${cy}" rx="150" ry="44"/><ellipse cx="${cx + 70}" cy="${cy - 26}" rx="90" ry="50"/><ellipse cx="${cx - 70}" cy="${cy - 14}" rx="80" ry="36"/></g>`; }
  return g + layer(12, cam, c, { f: 'dof4' });
}
// a field of kites at depth d (sky band y0..y1), each bobbing with a string going down-left
function kiteField(t, cam, d, n, y0, y1, s, seed, x0 = -900, x1 = 2000, raw = 0) {
  let g = '';
  for (let i = 0; i < n; i++) {
    const r = hs(i * 7 + seed), x = x0 + (x1 - x0) * hs(i * 3 + seed + 1) + 30 * Math.sin(t * .7 + i), y = y0 + (y1 - y0) * r + 22 * Math.sin(t * 1.1 + i * 2);
    const [c1, c2] = KCOL[(i + seed) % KCOL.length];
    g += dor(x, y + 60 * s, x - 260 - 200 * r, y + 900, 140, '#6a5a6a', 2.4 / s * .5, .5) + patang(x, y, s * (.8 + .4 * r), 14 * Math.sin(t * 1.3 + i), c1, c2, { t: t + i });
  }
  return raw ? g : layer(d, cam, g);
}
// far city silhouette (d=6)
function cityL(t, cam, o = {}) {
  let g = '';
  for (let i = 0; i < 70; i++) {
    const x = -2600 + i * 120, h = 110 + hs(i) * 210 + (i % 9 === 4 ? 230 : 0), w = 96 + hs(i + 5) * 50, col = ['#c9b2a6', '#bfa69c', '#d4bfb1', '#b8a3a8'][i % 4];
    g += `<rect x="${x}" y="${1010 - h}" width="${w}" height="${h + 500}" fill="${col}"/>`;
    if (i % 3 === 0) g += `<rect x="${x + 20}" y="${1010 - h - 30}" width="34" height="30" rx="5" fill="#6d6672"/>`;
    if (i % 4 === 1) g += `<path d="M${x + w - 30},${1010 - h} v-46 M${x + w - 44},${1010 - h - 40} h28" stroke="#7d747c" stroke-width="4"/>`;
  }
  g += `<rect x="${280}" y="560" width="60" height="460" fill="#b6a199"/><rect x="268" y="540" width="84" height="40" fill="#a8938c"/><circle cx="310" cy="610" r="22" fill="#e9dccf"/><path d="M310,610 v-14 M310,610 l10,6" stroke="#6d6672" stroke-width="3"/>`;
  return layer(6, cam, g + haze(780, 1060, .55, o.eve ? '#ffd2a0' : '#ffeacc') + (o.farKites || ''));
}
// mid rooftops (d=3) with tanks, clotheslines and tiny kite-flyers
function midRoofsL(t, cam, o = {}) {
  let g = '';
  const cols = ['#f4b7a6', '#ffd98a', '#9fd8cf', '#c9b3f0', '#f6e7c8', '#bfe3a0'];
  for (let i = 0; i < 26; i++) {
    const x = -3000 + i * 330, w = 290 + hs(i + 20) * 40, top = 720 + hs(i + 30) * 110;
    g += `<rect x="${x}" y="${top}" width="${w}" height="${1400 - top}" fill="${cols[i % 6]}" stroke="${C.ink}" stroke-width="5"/><rect x="${x - 8}" y="${top - 30}" width="${w + 16}" height="34" fill="#efe6d8" stroke="${C.ink}" stroke-width="4"/>`;
    for (let f = 0; f < 2; f++) g += `<rect x="${x + 40}" y="${top + 60 + f * 170}" width="80" height="100" fill="#5a8bb0" stroke="${C.ink}" stroke-width="4"/><rect x="${x + w - 120}" y="${top + 60 + f * 170}" width="80" height="100" fill="#5a8bb0" stroke="${C.ink}" stroke-width="4"/>`;
    if (i % 2 === 0) g += `<rect x="${x + w - 110}" y="${top - 120}" width="80" height="90" rx="12" fill="url(#tankG)" stroke="${C.ink}" stroke-width="4"/>`;
    if (i % 3 === 1) { const kx = x + 120, ky = top - 30; g += kid({ x: kx, y: ky, s: .26, t, shirt: cols[(i + 2) % 6], stripe: '#fff', armR: 150 + 10 * Math.sin(t * 3 + i), armL: 20, look: [8, -14] }) + dor(kx + 30, ky - 180, kx + 380, ky - 620 + 20 * Math.sin(t + i), 60, '#555', 2, .6) + patang(kx + 380, ky - 620 + 20 * Math.sin(t + i), .45, 10 * Math.sin(t * 1.2 + i), KCOL[i % 7][0], KCOL[i % 7][1]); }
    if (i % 3 === 2) { const y1 = top - 10; g += `<path d="M${x + 20},${y1 - 60} Q${x + w / 2},${y1 - 10} ${x + w - 20},${y1 - 60}" stroke="#444" stroke-width="3" fill="none"/>` + ['#e5463b', '#3b8de5', '#fff', '#e5b23b'].map((c, k) => `<rect x="${x + 50 + k * 50}" y="${y1 - 46 + Math.abs(k - 1.5) * 4}" width="32" height="48" fill="${c}" stroke="${C.ink}" stroke-width="3" transform="rotate(${5 * Math.sin(t * 2 + k)} ${x + 66 + k * 50} ${y1 - 46})"/>`).join(''); }
  }
  return layer(3, cam, g + haze(650, 900, .3, o.eve ? '#ffd2a0' : '#ffeacc') + (o.midKites || ''), { f: o.blurMid ? 'dof4' : '' });
}
// neighbour (rival) roof on the left (d=1.7); o.pappu(t) draws the rival kid in layer coords
function rivalRoofL(t, cam, o = {}) {
  let g = `<rect x="-1000" y="880" width="1380" height="700" fill="#f6c9a0" stroke="${C.ink}" stroke-width="6"/><rect x="-1010" y="846" width="1400" height="40" fill="#efe1cc" stroke="${C.ink}" stroke-width="5"/>`;
  for (let k = 0; k < 10; k++) g += `<rect x="${-960 + k * 136}" y="896" width="70" height="40" rx="8" fill="#d9a77c" stroke="${C.ink}" stroke-width="3"/>`;
  g += `<rect x="-700" y="700" width="120" height="150" rx="16" fill="url(#tankG)" stroke="${C.ink}" stroke-width="5"/>`;
  if (o.pappu) g += o.pappu;
  return layer(1.7, cam, g);
}
// NEEM tree (d=1.45) right of our roof; the pigeon's branch tip is at NB
const NB = { x: 700, y: 600 };
function neemL(t, cam, o = {}) {
  const sw = 5 * Math.sin(t * 1.3);
  let g = `<path d="M860,1500 Q880,1000 870,640 Q860,520 900,420 L960,420 Q930,560 950,700 Q980,1050 1010,1500Z" fill="#7a5233" stroke="${C.ink}" stroke-width="7"/>
    <path d="M900,1200 q14,-120 -4,-240 M960,900 q-10,-80 6,-160" stroke="#5e3d24" stroke-width="6" fill="none"/>
    <path d="M880,660 Q800,620 ${NB.x},${NB.y + sw * .3}" stroke="${C.ink}" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M880,660 Q800,620 ${NB.x},${NB.y + sw * .3}" stroke="#7a5233" stroke-width="19" fill="none" stroke-linecap="round"/>
    <path d="M940,520 Q1060,470 1150,420" stroke="${C.ink}" stroke-width="26" fill="none" stroke-linecap="round"/><path d="M940,520 Q1060,470 1150,420" stroke="#7a5233" stroke-width="16" fill="none" stroke-linecap="round"/>`;
  const L = [[930, 280, 230], [720, 380, 170], [1130, 330, 190], [820, 160, 170], [1040, 130, 170], [930, 30, 150], [640, 250, 120], [1230, 220, 130], [760, 520, 110], [1100, 520, 130]];
  g += `<g transform="rotate(${sw * .25} 930 700)">` + L.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2e7d32" stroke="${C.ink}" stroke-width="6"/>`).join('') + L.map(([x, y, r]) => `<circle cx="${x - 22}" cy="${y - 22}" r="${r * .7}" fill="#43a047"/>`).join('') + L.map(([x, y, r], i) => `<circle cx="${x + r * .4}" cy="${y + r * .35}" r="${r * .32}" fill="#1f6a27" opacity=".7"/>`).join('');
  // sun-dapple on the canopy (light from the upper right)
  g += L.map(([x, y, r]) => `<circle cx="${x + r * .25}" cy="${y - r * .3}" r="${r * .3}" fill="#9be07a" opacity=".45"/>`).join('') + '</g>';
  // small leaf clusters at the branch tip
  g += [0, 1, 2].map(k => `<ellipse cx="${NB.x - 20 + k * 36}" cy="${NB.y - 24 - k % 2 * 10}" rx="26" ry="11" fill="#4caf50" stroke="${C.ink}" stroke-width="3" transform="rotate(-20 ${NB.x - 20 + k * 36} ${NB.y - 24})"/>`).join('');
  if (o.inner) g += o.inner;
  return layer(1.45, cam, g);
}
// OUR ROOF (action plane d=1): parapet with jaali, mumty (stair room) with door, water tank, tiles in perspective
const MUMTY = { x: -560, w: 420, door: -400 };
function roofL(t, cam, o = {}) {
  let g = `<rect x="-1400" y="1000" width="4000" height="1600" fill="#d9b48a"/>`;
  for (let i = 0; i < 14; i++) { const y = 1000 + 26 * (Math.pow(1.32, i) - 1); g += `<path d="M-1400,${y.toFixed(1)} H2600" stroke="#c29d74" stroke-width="${2 + i * .5}"/>`; }
  for (let i = -14; i <= 22; i++) { const xb = 540 + i * 190; g += `<path d="M${(540 + (xb - 540) * .28).toFixed(1)},1000 L${xb},1920 L${540 + (xb - 540) * 1.6},2300" stroke="#c29d74" stroke-width="3" fill="none"/>`; }
  // sun patches on the floor (light from the right, through the jaali)
  for (let k = 0; k < 5; k++) g += `<path d="M${200 + k * 210},1040 l120,0 l-60,140 l-120,0Z" fill="#fff1c8" opacity=".22"/>`;
  // parapet: back wall with jaali
  g += `<rect x="-1400" y="900" width="4000" height="110" fill="#e9c9a2" stroke="${C.ink}" stroke-width="6"/><rect x="-1400" y="886" width="4000" height="26" fill="#f4e4cc" stroke="${C.ink}" stroke-width="5"/>`;
  for (let k = -12; k < 30; k++) { const jx = k * 100; g += `<rect x="${jx + 18}" y="930" width="64" height="56" rx="6" fill="#b88b62" stroke="${C.ink}" stroke-width="3"/><path d="M${jx + 18},958 h64 M${jx + 50},930 v56" stroke="#e9c9a2" stroke-width="6"/>`; }
  g += `<rect x="-1400" y="1004" width="4000" height="14" fill="#000" opacity=".18"/>`;   // contact shadow of the parapet
  // potted plants on the parapet
  [120, 300, 1560].forEach((px, i) => g += `<g transform="translate(${px},890)"><path d="M-34,0 L-26,-56 H26 L34,0Z" fill="#c0603a" stroke="${C.ink}" stroke-width="4"/><circle cx="-14" cy="-78" r="28" fill="#3c9a4a" stroke="${C.ink}" stroke-width="4"/><circle cx="16" cy="-84" r="30" fill="#43a047" stroke="${C.ink}" stroke-width="4"/>${i === 1 ? `<circle cx="0" cy="-112" r="12" fill="#ff5a7a" stroke="${C.ink}" stroke-width="3"/>` : ''}</g>`);
  // water tank on its stand (right) + long cast shadow to the left
  g += `<path d="M1180,1012 L1380,1012 L1180,1110 L900,1110Z" fill="#1a0f0a" opacity=".22"/><rect x="1190" y="880" width="16" height="132" fill="#555"/><rect x="1354" y="880" width="16" height="132" fill="#555"/><rect x="1170" y="866" width="220" height="22" fill="#666" stroke="${C.ink}" stroke-width="4"/>
    <rect x="1180" y="650" width="200" height="220" rx="26" fill="url(#tankG)" stroke="${C.ink}" stroke-width="6"/><path d="M1180,710 h200 M1180,790 h200" stroke="#000" stroke-width="5" opacity=".5"/><rect x="1240" y="628" width="80" height="26" rx="8" fill="#2a2a32" stroke="${C.ink}" stroke-width="4"/>`;
  // mumty (stair room) with door
  const m = MUMTY, dop = o.doorOpen || 0;
  g += `<path d="M${m.x},1012 L${m.x + m.w},1012 L${m.x + m.w + 140},1090 L${m.x + 140},1090Z" fill="#1a0f0a" opacity=".16"/>
    <rect x="${m.x}" y="560" width="${m.w}" height="452" fill="#f2d4b0" stroke="${C.ink}" stroke-width="6"/><rect x="${m.x - 16}" y="536" width="${m.w + 32}" height="34" fill="#e8dccb" stroke="${C.ink}" stroke-width="5"/>
    <rect x="${m.x + m.w - 50}" y="570" width="50" height="440" fill="#d9b48f" opacity=".7"/>
    <rect x="${m.door}" y="720" width="190" height="292" fill="#140d08" stroke="${C.ink}" stroke-width="6"/>
    <g transform="translate(${m.door},720) scale(${Math.max(.04, 1 - dop)},1)"><rect width="190" height="292" fill="#3a8a5a" stroke="${C.ink}" stroke-width="6"/><rect x="20" y="22" width="150" height="110" fill="none" stroke="#2c6b45" stroke-width="6"/><rect x="20" y="160" width="150" height="110" fill="none" stroke="#2c6b45" stroke-width="6"/><circle cx="160" cy="150" r="9" fill="#e8c34a"/></g>`;
  // props on the floor: a spare kite and a charkhi
  g += patang(-60, 1150, .7, 70, '#3b8de5', '#fff') + charkhi(1500, 1160, .45, 80, 0, '#f2f2f2');
  return layer(1, cam, g);
}
// foreground (d=.55): electric wires with a torn kite stuck on them, neem leaves at the top right, a plant bottom-left
function roofFG(t, cam, o = {}) {
  let g = `<path d="M-700,70 Q400,330 1900,40" stroke="#1d1d22" stroke-width="9" fill="none"/><path d="M-700,140 Q420,420 1900,120" stroke="#1d1d22" stroke-width="7" fill="none"/>`;
  g += `<g transform="translate(150,268) rotate(${-12 + 4 * Math.sin(t * 2)})"><path d="M0,-60 L54,0 L20,40 L0,20 L-30,46 L-54,0Z" fill="#ffd34a" stroke="${C.ink}" stroke-width="5"/><path d="M0,-60 V20" stroke="#6b4a2a" stroke-width="4"/><path d="M-10,40 q-16,40 6,80" stroke="#e5463b" stroke-width="5" fill="none"/></g>`;
  if (!o.noLeaves) g += `<g transform="rotate(${3 * Math.sin(t * 1.4)} 1300 -100)">` + [[1150, 40, 110], [1290, 150, 120], [1040, -40, 90], [1240, -70, 120]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#1f6a27"/><circle cx="${x - 20}" cy="${y - 18}" r="${r * .6}" fill="#2e7d32"/>`).join('') + '</g>';
  if (!o.noPlant) g += `<g transform="translate(-60,1900)"><path d="M-110,40 L-80,-150 H120 L150,40Z" fill="#a84e2c"/><ellipse cx="20" cy="-200" rx="170" ry="110" fill="#2e7d32"/><ellipse cx="-50" cy="-260" rx="90" ry="70" fill="#3c9a4a"/><ellipse cx="90" cy="-250" rx="80" ry="60" fill="#43a047"/></g>`;
  return layer(.55, cam, g);
}
// the full roof set, split so characters can sit between the layers
function chhat(t, cam, o = {}) {
  const O = Object.assign({}, o, { farKites: kiteField(t, cam, 6, 16, -900, 700, .22, 3, -900, 2000, 1), midKites: kiteField(t, cam, 3, 9, -1400, 400, .45, 11, -900, 2000, 1) });
  const back = skyL(t, cam, o) + cityL(t, cam, O) + veil(.35) + midRoofsL(t, cam, O) + veil(.18)
    + (o.rival !== false ? rivalRoofL(t, cam, o) : '') + (o.nearKites ? kiteField(t, cam, 2.2, 4, -1600, 100, .8, 21, -300, 1400) : '') + neemL(t, cam, { inner: o.neemInner })
    + layer(1, cam, shafts(SUN[0] + 200, -300, 2.05, 6, 2200, .16, t), { f: '' }) + roofL(t, cam, o);
  return { back, front: roofFG(t, cam, o) + (o.motes !== false ? motes(t, 26, 0, 300, 1080, 900, .5) : '') };
}

// ---------- AANGAN (courtyard of Qasim's house): sky / neighbours / back wall with stairs + WC door / floor / charpai / clothesline ----------
const WC = { x: 620, w: 260, top: 600, base: 1080 };     // in the wall layer (d=1.3)
const STAIR = { x0: -820, x1: -140, y0: 1080, y1: 560 };   // bottom step at x1 (right), top landing at x0 (left)
const stairY = x => STAIR.y0 - (STAIR.y0 - STAIR.y1) * clamp((STAIR.x1 - x) / (STAIR.x1 - STAIR.x0));
function aanganWall(t, o = {}) {
  let g = `<rect x="-1300" y="520" width="3600" height="1100" fill="url(#wallG)" stroke="${C.ink}" stroke-width="6"/><rect x="-1300" y="500" width="3600" height="30" fill="#f4e4cc" stroke="${C.ink}" stroke-width="5"/>`;
  for (let i = 0; i < 40; i++) g += `<ellipse cx="${-1200 + hs(i) * 3300}" cy="${560 + hs(i + 3) * 480}" rx="${20 + hs(i + 7) * 40}" ry="${8 + hs(i + 9) * 10}" fill="#c99470" opacity=".25"/>`;  // plaster patches
  // sunlight patch across the wall (light from the upper right)
  g += `<path d="M-200,520 L560,520 L300,1080 L-560,1080Z" fill="#fff3cf" opacity="${o.eve ? .32 : .22}"/>`;
  // floor strip continues behind the action floor (keeps the seam clean during push-ins)
  g += `<rect x="-1300" y="1080" width="3600" height="500" fill="#c98e62"/><rect x="-1300" y="1076" width="3600" height="10" fill="#7a4a2e" opacity=".5"/>`;
  // stairs to the roof along the left wall + railing
  const n = 10, sw = (STAIR.x1 - STAIR.x0) / n, sh = (STAIR.y0 - STAIR.y1) / n;
  let p = `M${STAIR.x1},${STAIR.y0}`; for (let i = 0; i < n; i++) p += ` v${-sh} h${-sw}`; p += ` V${STAIR.y0} Z`;
  g += `<path d="${p}" fill="#e2d2bd" stroke="${C.ink}" stroke-width="5"/>`;
  for (let i = 0; i < n; i++) g += `<rect x="${STAIR.x1 - (i + 1) * sw}" y="${STAIR.y0 - (i + 1) * sh}" width="${sw}" height="8" fill="#b9a68e"/>`;
  g += `<path d="M${STAIR.x1 - 20},${STAIR.y0 - 150} L${STAIR.x0 - 20},${STAIR.y1 - 150}" stroke="#555" stroke-width="8"/>` + [...Array(6)].map((_, i) => { const x = STAIR.x1 - 20 - i * (STAIR.x1 - STAIR.x0) / 5, y = STAIR.y0 - (i * (STAIR.y0 - STAIR.y1) / 5); return `<path d="M${x},${y - 150} v${150 - sh * .5}" stroke="#555" stroke-width="5"/>`; }).join('');
  // window with green shutters
  g += `<rect x="190" y="660" width="200" height="210" fill="#6f9cc0" stroke="${C.ink}" stroke-width="6"/><path d="M290,660 v210 M190,765 h200" stroke="#fff" stroke-width="6"/><rect x="146" y="660" width="44" height="210" fill="#3a8a5a" stroke="${C.ink}" stroke-width="4"/><rect x="390" y="660" width="44" height="210" fill="#3a8a5a" stroke="${C.ink}" stroke-width="4"/>`;
  // WC door with light bulb above it
  const open = o.open || 0, glow = o.glow || 0, W0 = WC;
  g += `<rect x="${W0.x - 12}" y="${W0.top - 12}" width="${W0.w + 24}" height="${W0.base - W0.top + 12}" fill="#8a6a4a" stroke="${C.ink}" stroke-width="5"/><rect x="${W0.x}" y="${W0.top}" width="${W0.w}" height="${W0.base - W0.top}" fill="#2b2117"/>`;
  if (glow > 0) g += `<rect x="${W0.x}" y="${W0.top}" width="${W0.w}" height="${W0.base - W0.top}" fill="#ffe08a" opacity="${clamp(glow * open * 1.3)}"/>`;
  const sx = Math.max(.03, 1 - open);
  g += `<g transform="translate(${W0.x},${W0.top}) scale(${sx},1)"><rect width="${W0.w}" height="${W0.base - W0.top}" fill="#f6f2ea" stroke="${C.ink}" stroke-width="6"/><rect x="30" y="34" width="${W0.w - 60}" height="170" rx="8" fill="none" stroke="#d6cdbd" stroke-width="7"/><rect x="30" y="250" width="${W0.w - 60}" height="190" rx="8" fill="none" stroke="#d6cdbd" stroke-width="7"/><circle cx="${W0.w - 26}" cy="250" r="13" fill="#c9a24a" stroke="${C.ink}" stroke-width="3"/><g transform="translate(${W0.w / 2},120)"><circle r="52" fill="#3a8dde" stroke="${C.ink}" stroke-width="5"/>${T(0, 18, 50, 'WC', { sw: 0, ls: 3 })}</g></g>`;
  if (glow > 0) g += `<rect x="${W0.x - 4}" y="${W0.base - 14}" width="${W0.w + 8}" height="${16 + 8 * Math.sin(t * 20)}" fill="#ffd34a" opacity="${glow}" filter="url(#glow)"/><rect x="${W0.x + W0.w * sx - 4}" y="${W0.top}" width="${8 + 6 * glow}" height="${W0.base - W0.top}" fill="#ffd34a" opacity="${glow * .8}" filter="url(#glow)"/>`;
  g += `<path d="M${W0.x + W0.w / 2},${W0.top - 70} v26" stroke="#333" stroke-width="5"/><circle cx="${W0.x + W0.w / 2}" cy="${W0.top - 30}" r="18" fill="${o.eve ? '#ffe9a0' : '#fff8e0'}" stroke="${C.ink}" stroke-width="4"/>${o.eve ? `<circle cx="${W0.x + W0.w / 2}" cy="${W0.top - 30}" r="90" fill="url(#poolW)" style="mix-blend-mode:screen"/>` : ''}`;
  // main room door + pots
  g += `<rect x="1180" y="700" width="230" height="380" fill="#2f6fd1" stroke="${C.ink}" stroke-width="6"/><rect x="1204" y="726" width="80" height="330" fill="none" stroke="#1f4f9a" stroke-width="6"/><rect x="1306" y="726" width="80" height="330" fill="none" stroke="#1f4f9a" stroke-width="6"/><path d="M1180,690 h230" stroke="#e4568a" stroke-width="14"/>`;
  [470, 1000, 1500, 1640].forEach((px, i) => g += `<g transform="translate(${px},1086)"><path d="M-30,0 L-24,-52 H24 L30,0Z" fill="#c0603a" stroke="${C.ink}" stroke-width="4"/><circle cx="-12" cy="-74" r="26" fill="#3c9a4a" stroke="${C.ink}" stroke-width="4"/><circle cx="14" cy="-80" r="28" fill="#43a047" stroke="${C.ink}" stroke-width="4"/></g>` + shadow(px - 30, 1088, 60, .7, { dx: -20 }));
  return g;
}
function aanganFloor(t, o = {}) {
  let g = `<rect x="-1400" y="1080" width="4000" height="1500" fill="#c98e62"/>`;
  for (let i = 0; i < 12; i++) { const y = 1080 + 22 * (Math.pow(1.36, i) - 1); g += `<path d="M-1400,${y.toFixed(1)} H2600" stroke="#a9714a" stroke-width="${2 + i * .6}"/>`; }
  for (let i = -16; i <= 24; i++) { const xb = 540 + i * 170; g += `<path d="M${(540 + (xb - 540) * .3).toFixed(1)},1080 L${xb},1920 L${540 + (xb - 540) * 1.5},2400" stroke="#a9714a" stroke-width="3" fill="none"/>`; }
  g += `<path d="M-1400,1080 L400,1080 L120,1500 L-1400,1500Z" fill="#fff0c8" opacity="${o.eve ? .2 : .14}"/>`;  // sun patch
  // charpai (rope cot) on the right + its shadow; Mano sleeps on it unless o.noMano
  const cx = 1060;
  g += `<path d="M${cx - 40},1236 L${cx + 470},1236 L${cx + 380},1290 L${cx - 130},1290Z" fill="#1a0f0a" opacity=".2"/>
    ${[cx, cx + 430].map(x => `<rect x="${x}" y="1110" width="26" height="130" fill="#8a5a32" stroke="${C.ink}" stroke-width="5"/>`).join('')}
    <rect x="${cx - 10}" y="1100" width="470" height="40" rx="8" fill="#b07a46" stroke="${C.ink}" stroke-width="6"/>
    ${[...Array(15)].map((_, k) => `<path d="M${cx + 10 + k * 30},1104 l20,32" stroke="#f0e2c0" stroke-width="5"/>`).join('')}`;
  if (!o.noMano) g += cat({ x: cx + 300, y: 1100, s: .5, pose: 'sit', flip: -1, t, meow: o.manoMeow || 0, wide: o.manoWide || 0 }) + (o.manoSleep ? T(cx + 380, 960 - 10 * Math.sin(t * 2), 40, 'z z', { fill: '#fff', sw: 5 }) : '');
  // chai on a little stool
  g += `<g transform="translate(${cx - 120},1250)"><rect x="-40" y="-60" width="80" height="60" fill="#8a5a32" stroke="${C.ink}" stroke-width="4"/><rect x="-16" y="-96" width="32" height="36" rx="6" fill="#fff" stroke="${C.ink}" stroke-width="4"/><path d="M${-6 + 4 * Math.sin(t * 2)},-100 q-8,-20 4,-40" stroke="#fff" stroke-width="5" fill="none" opacity=".7"/></g>`;
  return g;
}
function aanganFG(t, cam, o = {}) {
  let g = `<path d="M-500,160 Q540,300 1600,140" stroke="#444" stroke-width="6" fill="none"/>`;
  [['#e4568a', -260, 220, 240], ['#ffd34a', 90, 230, 170], ['#3b8de5', 380, 250, 200], ['#fff', 700, 240, 150], ['#22a35a', 950, 220, 220]].forEach(([c, x, y, h], k) => {
    const sw = 5 * Math.sin(t * 2.2 + k);
    g += `<g transform="rotate(${sw} ${x + 60} ${y})"><path d="M${x},${y} h130 l10,${h} q-75,20 -150,0Z" fill="${c}" stroke="${C.ink}" stroke-width="5"/><rect x="${x + 50}" y="${y - 12}" width="14" height="22" fill="#a8743f"/></g>`;
  });
  if (!o.noPlant) g += `<g transform="translate(1180,1950)"><path d="M-130,40 L-100,-160 H120 L150,40Z" fill="#a84e2c"/><ellipse cx="0" cy="-220" rx="190" ry="120" fill="#2e7d32"/><ellipse cx="-80" cy="-280" rx="90" ry="70" fill="#3c9a4a"/></g>`;
  return layer(.6, cam, g);
}
function aangan(t, cam, o = {}) {
  const O = Object.assign({}, o, { farKites: kiteField(t, cam, 6, 10, -600, 300, .22, 5, -900, 2000, 1), midKites: kiteField(t, cam, 3, 5, -600, 250, .45, 17, -900, 2000, 1) });
  const back = skyL(t, cam, o) + cityL(t, cam, O) + veil(.35) + midRoofsL(t, cam, O) + veil(.15)
    + layer(1.3, cam, aanganWall(t, o)) + layer(1, cam, aanganFloor(t, o))
    + (o.glow > 0 ? layer(1.3, cam, lightPool(WC.x + WC.w / 2, WC.base + 40, 330 + 90 * o.glow + 260 * (o.open || 0), 70 + 40 * (o.open || 0), o.glow) + `<path d="M${WC.x},${WC.base} L${WC.x + WC.w},${WC.base} L${WC.x + WC.w + 260},${WC.base + 400} L${WC.x - 260},${WC.base + 400}Z" fill="#ffd34a" opacity="${.22 * o.glow + .3 * (o.open || 0)}" style="mix-blend-mode:screen"/>`, { f: '' }) : '')
    + layer(1, cam, shafts(1500, -200, 2.2, 5, 1900, o.eve ? .2 : .13, t), { f: '' });
  return { back, front: aanganFG(t, cam, o) + motes(t, 22, 0, 400, 1080, 900, .45, 4) };
}
// character helper: draw any character at depth d through the camera, with its sun shadow
function at(d, cam, x, y, fn, o, sh = {}) {
  const p = proj(d, cam, x, y), h = sh.h || 0;
  let g = '';
  if (sh.w !== 0) { const fy = proj(d, cam, x, y + h); g += shadow(fy.x - 20 * fy.s, fy.y + 4 * fy.s, (sh.w || 110) * fy.s * clamp(1 - h / 1400, .3, 1), (sh.op ?? .9) * clamp(1 - h / 900, .15, 1), { dx: -46 * fy.s, skew: 35 }); }
  return g + fn(Object.assign({}, o, { x: p.x, y: p.y, s: (o.s || 1) * p.s }));
}


// =================== EPISODE 3: ensemble sprites + rain ===================
// Studio-skeleton characters (engine/chars.js) are drawn by sk.html into a PNG and placed as an <image>; ground point = (x, y).
const SKW = () => document.getElementById('sk').contentWindow;
const SKS = { basim: 1.22, sakina: 1.18, dadi: 1.2, ammar: 1.08, dadaAbu: 1.12, officer: 1.0, dharmender: 1.08, kulfiWala: 1.04, daniel: 1, amara: 1 };
function sk(o) {
  const url = SKW().spr(o.key, o.move || 'idle', o.mt ?? o.t ?? 0, o);
  const s = (o.s || 1) * (SKS[o.key] || 1), w = 420 * s, h = 760 * s;
  return `<image href="${url}" x="${(o.x - 210 * s).toFixed(1)}" y="${(o.y - 720 * s).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"/>`;
}
const skFn = key => o => sk(Object.assign({ key }, o));
const basim = skFn('basim'), sakina = skFn('sakina'), dadi = skFn('dadi'), ammar = skFn('ammar'), dadaAbu = skFn('dadaAbu'), officer = skFn('officer'), dharmender = skFn('dharmender'), kulfiWala = skFn('kulfiWala'), daniel = skFn('daniel'), amara = skFn('amara');

// rain: n streaks in a band, falling fast, slanted (wind to the right)
function rain(t, n, op, len, w, seed = 1, y0 = -100, y1 = 2000, sp = 1900) {
  let g = `<g stroke="#dfeaf6" stroke-width="${w}" stroke-linecap="round" opacity="${op}">`;
  for (let i = 0; i < n; i++) { const x = hsh(i * 3.1 + seed) * 3300 - 1100, ph = hsh(i * 7.7 + seed), y = y0 + ((ph * (y1 - y0) + t * sp) % (y1 - y0)); g += `<path d="M${(x + (y - y0) * .18).toFixed(1)},${y.toFixed(1)} l${(len * .18).toFixed(1)},${len}"/>`; }
  return g + '</g>';
}
function splashes(t, n, y0, y1, op = .8, seed = 3) {
  let g = ''; for (let i = 0; i < n; i++) { const p = (t * 2.2 + hsh(i + seed)) % 1, x = hsh(i * 5.3 + seed) * 3000 - 960, y = y0 + hsh(i * 2.9 + seed) * (y1 - y0); g += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(6 + 26 * p).toFixed(1)}" ry="${(2 + 7 * p).toFixed(1)}" fill="none" stroke="#e8f1fa" stroke-width="3" opacity="${(op * (1 - p)).toFixed(2)}"/>`; }
  return g;
}
function stormClouds(t, camX) {
  let g = `<rect x="-1300" y="-400" width="3700" height="920" fill="#59677d"/><rect x="-1300" y="380" width="3700" height="260" fill="url(#stormFade)"/>`;
  for (let i = 0; i < 16; i++) { const cx = ((i * 260 + t * 22 - camX * .08) % 4000 + 4000) % 4000 - 1400, cy = 110 + (i * 97) % 230; g += `<g fill="${i % 2 ? '#4b586c' : '#6c7a90'}"><ellipse cx="${cx}" cy="${cy}" rx="230" ry="80"/><ellipse cx="${cx + 120}" cy="${cy - 40}" rx="150" ry="80"/><ellipse cx="${cx - 110}" cy="${cy - 20}" rx="130" ry="62"/></g>`; }
  return g;
}
const stormDefs = `<defs><linearGradient id="stormFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#59677d"/><stop offset="1" stop-color="#59677d" stop-opacity="0"/></linearGradient>
  <linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7f9cb3"/><stop offset="1" stop-color="#46637c"/></linearGradient></defs>`;
// flood water over the street (screen space, flows to the right); drainX = screen x of the naala grate
function flood(t, camX, o = {}) {
  const top = GY + 26;
  let g = `<rect x="-200" y="${top}" width="1480" height="1200" fill="url(#waterG)" opacity=".9"/>`;
  for (let r = 0; r < 14; r++) { const y = top + 18 + r * r * 5.2, sp = 160 + r * 30, off = ((t * sp + r * 97 - camX) % 220 + 220) % 220; g += `<path d="${[...Array(9)].map((_, k) => `M${-200 + k * 220 + off},${y.toFixed(1)} q40,-${6 + r * .6} 80,0`).join(' ')}" stroke="#d8e7f2" stroke-width="${2 + r * .35}" fill="none" opacity="${.55 - r * .02}"/>`; }
  if (o.drainX !== undefined) { const x = o.drainX; g += `<g transform="translate(${x},${top + 60})"><ellipse rx="150" ry="40" fill="#2b3e50"/><path d="M-110,-6 h220 M-120,10 h240" stroke="#1a2530" stroke-width="10"/>` + [...Array(3)].map((_, k) => `<ellipse rx="${50 + k * 40}" ry="${12 + k * 10}" fill="none" stroke="#e8f1fa" stroke-width="4" stroke-dasharray="30 20" opacity=".7" transform="rotate(${(t * 220 + k * 60) % 360} 0 0) scale(1,.35)"/>`).join('') + `</g>`; }
  return g;
}
function kashti(x, y, s, rot, col = '#fff') {   // paper boat
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M-70,-10 L70,-10 L46,22 L-46,22Z" fill="${col}" stroke="${C.ink}" stroke-width="5"/><path d="M-40,-10 L0,-70 L40,-10Z" fill="${col}" stroke="${C.ink}" stroke-width="5"/><path d="M0,-70 V-10" stroke="#999" stroke-width="3"/></g>`;
}
function crate(x, y, s, rot) {
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-110" y="-80" width="220" height="90" fill="#b07a46" stroke="${C.ink}" stroke-width="6"/><path d="M-110,-50 h220 M-110,-20 h220 M-70,-80 v90 M70,-80 v90" stroke="#7a5233" stroke-width="6"/><path d="M-110,-80 L110,10 M110,-80 L-110,10" stroke="#8a5a32" stroke-width="5" opacity=".6"/></g>`;
}
// puppy = small gali dog (dog() from ep1), shivering; towel wraps it when o.towel
function pilla(o) {
  o = Object.assign({ x: 0, y: 0, s: .5, t: 0, shiver: 0, flip: 1, towel: 0, wag: 0 }, o);
  const dx = o.shiver * 3 * Math.sin(o.t * 70);
  let g = dog({ x: o.x + dx, y: o.y, s: o.s, flip: o.flip, t: o.t, run: o.run || 0, bark: o.bark || 0 });
  if (o.drip) for (let i = 0; i < 3; i++) { const p = (o.t * 1.6 + i / 3) % 1; g += `<path d="M${o.x + (i - 1) * 30 * o.s},${o.y - 30 * o.s + p * 60} q-6,12 0,18 q6,-6 0,-18Z" fill="#bfe0ff" opacity="${1 - p}"/>`; }
  if (o.towel > 0) g += `<g opacity="${o.towel}" transform="translate(${o.x},${o.y}) scale(${o.s * o.flip},${o.s})"><path d="M-95,-40 Q-90,-130 0,-128 Q90,-130 100,-40 Q0,-10 -95,-40Z" fill="#f3d36b" stroke="${C.ink}" stroke-width="6"/><path d="M-80,-70 h160 M-84,-95 h168" stroke="#e5463b" stroke-width="7"/></g>`;
  return g;
}
function lightning(t, at, op = 1) { const k = seg(t, at, at + .08) * (1 - seg(t, at + .12, at + .4)); return k > 0 ? `<rect width="1080" height="1920" fill="#fff" opacity="${(.55 * k * op).toFixed(2)}"/><path d="M760,-20 L700,210 L760,200 L650,470 L720,460 L600,700" stroke="#fff" stroke-width="12" fill="none" opacity="${k}" filter="url(#glow)"/>` : ''; }
// rainy gali: returns {back, front} like the 2.5D sets. cam = {x (world pan), z, px, py}
function galiRain(t, cam, o = {}) {
  const z = cam.z || 1, px = cam.px ?? 540, py = cam.py ?? 960;
  const Z = s => `<g transform="translate(${px},${py}) scale(${z}) translate(${-px},${-py})">${s}</g>`;
  const Zf = (s, d) => { const zz = 1 + (z - 1) / d; return `<g transform="translate(${px},${py}) scale(${zz}) translate(${-px},${-py})">${s}</g>`; };
  let back = Z(gali(cam.x, t, o) + `<rect x="-2000" y="-400" width="5000" height="${GY + 400}" fill="#3e4a60" opacity=".38"/>` + `<g transform="translate(0,0)">${stormClouds(t, cam.x)}</g>`)
    + Zf(rain(t, 70, .35, 50, 2, 11) , 4) + veil(.18)
    + Z(flood(t, cam.x, o) + splashes(t, 18, GY + 60, GY + 700, .7));
  const front = Zf(rain(t, 34, .55, 120, 5, 23, -200, 2100, 2600), .6) + `<rect width="1080" height="1920" fill="#22324a" opacity=".12"/>`;
  return { back, front, Z };
}

// =================== EPISODE 4: DHALAAN GALI (sloped lane down to the main road) — 2.5D ===================
// Layers: sky/sun (50) · clouds (12) · far city + kites (6) · mid rooftops (3) · HOUSE ROW (1.3) · STREET (1, action plane) · foreground wires/bougainvillea/hand-pump (.62)
// The lane slopes down to the right; G(x) is the action-plane ground line, flat after XR (the chowk / main road).
const SL = .17, GB = 1240, XR = 2500, SLA = Math.atan(SL) * 180 / Math.PI;
const G = x => GB + SL * Math.min(x, XR);
const slopeAng = x => SLA * (1 - seg(x, XR - 120, XR + 120));
// camera that keeps world point wx (on the ground line, + lift) at screen (sx, sy); z = dolly
const camG = (wx, z = 1, sy = 1180, sx = 540, lift = 0) => ({ x: wx - sx, y: G(wx) - lift - sy, z, px: sx, py: sy });
const HOMEX = 300;            // Qasim's blue door in the house row
const HCOL = ['#f4b7a6', '#ffd98a', '#9fd8cf', '#c9b3f0', '#f6e7c8', '#bfe3a0', '#f7c6d9', '#a9d3f5'];
function cooler(x, y) { return `<g transform="translate(${x},${y})"><rect x="-55" y="-70" width="110" height="80" rx="8" fill="#e9e4da" stroke="${C.ink}" stroke-width="4"/>${[0, 1, 2, 3, 4].map(k => `<path d="M-42,${-56 + k * 13} h84" stroke="#b9b2a5" stroke-width="5"/>`).join('')}<rect x="-58" y="10" width="116" height="10" fill="#9a9488"/></g>`; }
function houseRowL(t, cam, o = {}) {
  const HB = x => GB - 165 + SL * Math.min(x, XR);
  let g = '';
  let x = -2100, i = 0;
  while (x < 5600) {
    const w = 330 + hs(i + 40) * 110, h = 480 + hs(i + 50) * 260 + (x > XR ? 120 : 0), xc = x + w / 2, yb = HB(xc), top = yb - h, col = HCOL[i % HCOL.length];
    const home = HOMEX > x && HOMEX < x + w, shop = x > XR || i % 5 === 3;
    g += `<rect x="${x}" y="${top}" width="${w}" height="${h + 500}" fill="${col}" stroke="${C.ink}" stroke-width="6"/><rect x="${x - 10}" y="${top - 24}" width="${w + 20}" height="28" fill="#efe6d8" stroke="${C.ink}" stroke-width="5"/>`;
    g += `<rect x="${x + w - 40}" y="${top + 4}" width="40" height="${h + 490}" fill="#000" opacity=".08"/>`;   // shaded side (light from the right)
    if (i % 2 === 0) g += `<rect x="${x + w - 125}" y="${top - 112}" width="86" height="88" rx="14" fill="url(#tankG)" stroke="${C.ink}" stroke-width="5"/><rect x="${x + w - 131}" y="${top - 120}" width="98" height="16" rx="7" fill="#44444f"/>`;
    if (i % 3 === 1) { const y1 = top - 8; g += `<path d="M${x + 20},${y1 - 70} Q${x + w / 2},${y1 - 20} ${x + w - 20},${y1 - 70}" stroke="#444" stroke-width="3" fill="none"/>` + ['#e5463b', '#3b8de5', '#fff', '#e5b23b'].map((c, k) => `<rect x="${x + 40 + k * 56}" y="${y1 - 58 + Math.abs(k - 1.5) * 5}" width="34" height="50" fill="${c}" stroke="${C.ink}" stroke-width="3" transform="rotate(${5 * Math.sin(t * 2 + k + i)} ${x + 57 + k * 56} ${y1 - 58})"/>`).join(''); }
    // upper floor windows + balcony
    const wy = top + 70;
    [x + 45, x + w - 145].forEach((wx2, k) => g += `<rect x="${wx2}" y="${wy}" width="100" height="125" fill="#5a8bb0" stroke="${C.ink}" stroke-width="5"/><path d="M${wx2 + 50},${wy} v125 M${wx2},${wy + 60} h100" stroke="#cfe3ef" stroke-width="4"/><rect x="${wx2 - 24}" y="${wy}" width="24" height="125" fill="#3a8a5a" stroke="${C.ink}" stroke-width="4"/><rect x="${wx2 + 100}" y="${wy}" width="24" height="125" fill="#3a8a5a" stroke="${C.ink}" stroke-width="4"/>`);
    if (h > 560) g += `<rect x="${x + 25}" y="${wy + 125}" width="${w - 50}" height="14" fill="#7a5a3a" stroke="${C.ink}" stroke-width="4"/>${[...Array(9)].map((_, k) => `<path d="M${x + 35 + k * (w - 70) / 8},${wy + 139} v42" stroke="#7a5a3a" stroke-width="6"/>`).join('')}<path d="M${x + 25},${wy + 181} h${w - 50}" stroke="#7a5a3a" stroke-width="6"/>` + (i % 2 ? `<g transform="translate(${x + 70},${wy + 120})"><path d="M-22,0 L-16,-36 H16 L22,0Z" fill="#c0603a" stroke="${C.ink}" stroke-width="3"/><circle cx="-6" cy="-50" r="20" fill="#3c9a4a" stroke="${C.ink}" stroke-width="3"/><circle cx="12" cy="-56" r="10" fill="#ff5a7a"/></g>` : '');
    // ground floor: door / shop shutter, cooler, steps
    if (shop) {
      const sw2 = w - 70, sx2 = x + 35, sy2 = yb - 230, word = ['KIRYANA', 'MITHAI', 'DAWAI', 'SABZI', 'CHAI', 'DARZI'][i % 6];
      g += `<rect x="${sx2}" y="${sy2}" width="${sw2}" height="230" fill="#3a3a44" stroke="${C.ink}" stroke-width="5"/><rect x="${sx2 + 10}" y="${sy2 + 50}" width="${sw2 - 20}" height="170" fill="#d8b47a"/>${[0, 1, 2].map(k => `<rect x="${sx2 + 20 + k * (sw2 - 40) / 3}" y="${sy2 + 70}" width="${(sw2 - 60) / 3}" height="40" fill="${['#e5463b', '#ffd34a', '#22a35a'][(k + i) % 3]}" stroke="${C.ink}" stroke-width="3"/>`).join('')}
        <path d="M${sx2 - 20},${sy2} L${sx2 + sw2 + 20},${sy2} L${sx2 + sw2 + 50},${sy2 + 50} L${sx2 - 50},${sy2 + 50}Z" fill="${i % 2 ? '#e5463b' : '#22a35a'}" stroke="${C.ink}" stroke-width="4"/>${[...Array(8)].map((_, k) => `<path d="M${sx2 - 40 + k * (sw2 + 80) / 8},${sy2 + 4} l8,46" stroke="#fff" stroke-width="10" opacity=".7"/>`).join('')}
        <rect x="${sx2 + 10}" y="${sy2 - 70}" width="${sw2 - 20}" height="62" rx="8" fill="#fff6d8" stroke="${C.ink}" stroke-width="4"/>${T(sx2 + sw2 / 2, sy2 - 22, 46, word, { fill: '#c8102e', sw: 0, ls: 3 })}`;
    } else {
      const dc = home ? '#2f6fd1' : ['#7a4a2a', '#a33', '#386', '#6d4a8a'][i % 4], dx = home ? HOMEX - 75 : x + w / 2 - 75;
      g += `<rect x="${dx - 14}" y="${yb - 262}" width="178" height="22" fill="#e9e1d4" stroke="${C.ink}" stroke-width="4"/><rect x="${dx}" y="${yb - 240}" width="150" height="240" rx="6" fill="${dc}" stroke="${C.ink}" stroke-width="6"/><path d="M${dx + 75},${yb - 230} v220" stroke="${C.ink}" stroke-width="4" opacity=".45"/><circle cx="${dx + 120}" cy="${yb - 118}" r="8" fill="#e8c34a"/>${home ? `<path d="M${dx - 4},${yb - 262} h158" stroke="#e4568a" stroke-width="12"/>` : ''}`;
      if (i % 3 === 0) g += cooler(home ? x + w - 80 : x + 80, yb - 140);
      g += `<rect x="${dx - 26}" y="${yb - 4}" width="202" height="18" fill="#bdb3a3" stroke="${C.ink}" stroke-width="4"/>`;
    }
    g += `<rect x="${x}" y="${yb - 10}" width="${w}" height="10" fill="#000" opacity=".12"/>`;
    // electric pole + wire bundle between houses
    if (i % 3 === 2) g += `<rect x="${x + w - 8}" y="${top - 260}" width="16" height="${h + 260}" fill="#7d7d86" stroke="${C.ink}" stroke-width="3"/><rect x="${x + w - 50}" y="${top - 250}" width="100" height="10" fill="#5d5d66"/><path d="M${x + w},${top - 240} Q${x + w + 300},${top - 160} ${x + w + 700},${top - 250} M${x + w},${top - 228} Q${x + w + 260},${top - 130} ${x + w + 700},${top - 236}" stroke="#2a2a30" stroke-width="3" fill="none"/>`;
    x += w; i++;
  }
  // neem tree in the row (between houses), dappled light
  const nx = 1350, ny = HB(nx), sw = 4 * Math.sin(t * 1.2);
  g += `<path d="M${nx - 40},${ny + 40} Q${nx - 20},${ny - 300} ${nx - 30},${ny - 560} L${nx + 30},${ny - 560} Q${nx + 30},${ny - 300} ${nx + 50},${ny + 40}Z" fill="#7a5233" stroke="${C.ink}" stroke-width="6"/>`;
  const LV = [[0, -700, 170], [-150, -620, 130], [150, -630, 140], [-80, -830, 130], [90, -830, 130], [0, -930, 110], [-230, -720, 90], [230, -720, 100]];
  g += `<g transform="rotate(${sw} ${nx} ${ny - 500})">` + LV.map(([lx, ly, r]) => `<circle cx="${nx + lx}" cy="${ny + ly}" r="${r}" fill="#2e7d32" stroke="${C.ink}" stroke-width="6"/>`).join('') + LV.map(([lx, ly, r]) => `<circle cx="${nx + lx - 18}" cy="${ny + ly - 18}" r="${r * .7}" fill="#43a047"/>`).join('') + LV.map(([lx, ly, r]) => `<circle cx="${nx + lx + r * .25}" cy="${ny + ly - r * .3}" r="${r * .3}" fill="#9be07a" opacity=".45"/>`).join('') + '</g>';
  if (o.rowInner) g += o.rowInner;
  return layer(1.3, cam, g);
}
// the street (action plane): back kerb + naali, house shade band, brick paving on the slope, chowk + asphalt main road after XR
function streetL(t, cam, o = {}) {
  const X0 = -2600, X1 = 6200;
  const edge = x => G(x) - 150;
  const pts = [X0, -600, XR, X1].map(x => `${x},${edge(x).toFixed(1)}`).join(' ');
  let g = `<polygon points="${pts} ${X1},3200 ${X0},3200" fill="#dcc7a2"/>`;
  // asphalt main road after the chowk
  g += `<polygon points="${XR + 80},${edge(XR) + 40} ${X1},${edge(XR) + 40} ${X1},3200 ${XR - 300},3200" fill="#5f6168"/><path d="M${XR + 80},${edge(XR) + 40} L${XR - 300},3200" stroke="#cbb994" stroke-width="16"/>`;
  for (let k = 0; k < 14; k++) { const yy = edge(XR) + 260; g += `<rect x="${XR + 900 + k * 160}" y="${yy}" width="90" height="16" fill="#f4f1e6" opacity=".85"/>`; }
  for (let k = 0; k < 7; k++) g += `<path d="M${XR + 520 + k * 70},${edge(XR) + 60} l-90,520" stroke="#f4f1e6" stroke-width="40" opacity=".85"/>`;   // zebra crossing
  // paving lines parallel to the slope (perspective spacing) + oblique cross joints
  for (let k = 1; k < 12; k++) { const off = 20 * (Math.pow(1.3, k) - 1); g += `<polyline points="${X0},${(edge(X0) + off).toFixed(1)} ${XR},${(edge(XR) + off).toFixed(1)} ${XR + 60},${(edge(XR) + off).toFixed(1)}" fill="none" stroke="#c6ad84" stroke-width="${1.5 + k * .45}"/>`; }
  for (let xx = X0; xx < XR; xx += 120) { const y0 = edge(xx); g += `<path d="M${xx},${y0} L${xx - 260},${y0 + 900}" stroke="#c6ad84" stroke-width="3"/>`; }
  // pebbles + chalk wicket marks
  for (let k = 0; k < 90; k++) { const px = X0 + hs(k + 300) * (XR - X0), py = edge(px) + 30 + hs(k + 330) * 700; g += `<ellipse cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" rx="${5 + (k % 4) * 3}" ry="${3 + k % 3}" fill="#bfa478"/>`; }
  g += `<g transform="translate(-900,${edge(-900) + 160}) rotate(${SLA})"><path d="M0,0 v60 M22,0 v60 M44,0 v60" stroke="#fff" stroke-width="8" opacity=".8"/></g>`;
  // kerb + naali along the back edge, then the houses' shade band on the street (sun behind the row, upper right)
  g += `<polyline points="${X0},${edge(X0)} ${XR},${edge(XR)} ${X1},${edge(XR)}" fill="none" stroke="#8d8d93" stroke-width="22"/><polyline points="${X0},${edge(X0) + 14} ${XR},${edge(XR) + 14} ${X1},${edge(XR) + 14}" fill="none" stroke="#5a5a62" stroke-width="8"/>`;
  g += `<polygon points="${X0},${edge(X0) + 18} ${XR},${edge(XR) + 18} ${X1},${edge(XR) + 18} ${X1},${edge(XR) + 80} ${XR},${edge(XR) + 80} ${X0},${edge(X0) + 80}" fill="#1a0f0a" opacity=".13"/>`;
  // plant pots + a sleeping gali dog on the kerb side
  [-1500, -500, 820, 1900, 3300].forEach((px, k) => { const py = edge(px) + 40; g += castShadow(px, py, 60, 70, .2) + `<g transform="translate(${px},${py})"><path d="M-30,0 L-24,-50 H24 L30,0Z" fill="#c0603a" stroke="${C.ink}" stroke-width="4"/><circle cx="-12" cy="-72" r="26" fill="#3c9a4a" stroke="${C.ink}" stroke-width="4"/><circle cx="14" cy="-78" r="28" fill="#43a047" stroke="${C.ink}" stroke-width="4"/>${k % 2 ? `<circle cx="0" cy="-104" r="11" fill="#ff5a7a" stroke="${C.ink}" stroke-width="3"/>` : ''}</g>`; });
  g += shadow(-1150, edge(-1150) + 64, 90, .8, { dx: -30, skew: 35 }) + dog({ x: -1150, y: edge(-1150) + 62, s: .42, run: 0, t }) + (o.dogZ !== false ? T(-1080, edge(-1150) - 40 - 8 * Math.sin(t * 2), 34, 'z z', { fill: '#fff', sw: 4 }) : '');
  // parked cycle leaning on the wall
  g += `<g transform="translate(1720,${edge(1720) + 70}) rotate(${SLA})" fill="none" stroke="${C.ink}" stroke-width="7"><circle cx="-80" cy="-50" r="50"/><circle cx="80" cy="-50" r="50"/><path d="M-80,-50 L-20,-130 L60,-130 L80,-50 M-20,-130 L10,-50 L60,-130 M-30,-150 h30 M60,-130 L50,-170 h30" stroke="#2f7fd6"/></g>`;
  if (o.inner) g += o.inner;
  return layer(1, cam, g);
}
// rickshaw on the main road (action plane)
function rickshaw(x, y, s = 1, flip = 1, t = 0) {
  const r = t * 9;
  return `<g transform="translate(${x},${y}) scale(${s * flip},${s})"><path d="M-130,-150 Q-120,-232 0,-234 Q120,-232 140,-150 Z" fill="#f4c430" stroke="${C.ink}" stroke-width="6"/><rect x="-140" y="-152" width="290" height="120" rx="20" fill="#2e8b57" stroke="${C.ink}" stroke-width="6"/><rect x="-100" y="-140" width="90" height="70" rx="10" fill="#bfe6f2" stroke="${C.ink}" stroke-width="4"/>${[-90, 110].map(cx => `<circle cx="${cx}" cy="-20" r="36" fill="#222" stroke="${C.ink}" stroke-width="5"/><path d="M${cx},-20 l${(20 * Math.cos(r)).toFixed(1)},${(20 * Math.sin(r)).toFixed(1)}" stroke="#999" stroke-width="5"/>`).join('')}</g>`;
}
// foreground (d=.62): wires with birds + caught kite, bougainvillea at the top-left, a desi hand-pump + bucket bottom-left (repeat along the lane)
function galiFG(t, cam, o = {}) {
  let g = '';
  for (let k = -2; k < 7; k++) { const x0 = k * 1500; g += `<path d="M${x0},${60 + k * 30} Q${x0 + 750},${300 + k * 30} ${x0 + 1500},${90 + k * 30}" stroke="#1d1d22" stroke-width="9" fill="none"/><path d="M${x0},${140 + k * 30} Q${x0 + 750},${380 + k * 30} ${x0 + 1500},${170 + k * 30}" stroke="#1d1d22" stroke-width="7" fill="none"/>`;
    for (let b = 0; b < 2; b++) { const bx = x0 + 500 + b * 160, by = 60 + k * 30 + 4 * 240 * (bx - x0) / 1500 * (1 - (bx - x0) / 1500) - 20; g += `<g transform="translate(${bx},${by})"><ellipse rx="26" ry="16" fill="#2a2a30"/><circle cx="20" cy="-12" r="11" fill="#2a2a30"/><path d="M30,-12 l12,4 l-12,3z" fill="#e8a33a"/><path d="M-20,0 l-22,10" stroke="#2a2a30" stroke-width="8"/></g>`; } }
  g += `<g transform="translate(900,330) rotate(${-10 + 4 * Math.sin(t * 2)})"><path d="M0,-60 L54,0 L20,40 L0,20 L-30,46 L-54,0Z" fill="#22a35a" stroke="${C.ink}" stroke-width="5"/><path d="M0,-60 V20" stroke="#6b4a2a" stroke-width="4"/><path d="M-10,40 q-16,40 6,80" stroke="#ffd34a" stroke-width="5" fill="none"/></g>`;
  if (!o.noBoug) g += `<g transform="rotate(${3 * Math.sin(t * 1.3)} -200 -100)">` + [[-120, 60, 120], [10, -40, 110], [-60, 180, 90], [120, 40, 80]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2e7d32"/><circle cx="${x - 16}" cy="${y - 14}" r="${r * .6}" fill="#3c9a4a"/>${[...Array(5)].map((_, k) => `<circle cx="${x - r * .6 + hs(i * 9 + k) * r * 1.2}" cy="${y - r * .5 + hs(i * 7 + k + 3) * r}" r="${14 + 8 * hs(k + i)}" fill="#ff4f9a" stroke="#c2185b" stroke-width="3"/>`).join('')}`).join('') + '</g>';
  // near-street props along the bottom edge (strongly blurred): mango crate, flower pots, a pair of chappals
  for (let k = -2; k < 8; k++) { const bx = 380 + k * 1150; g += `<g transform="translate(${bx},1990)"><rect x="-150" y="-150" width="300" height="150" fill="#b07a46" stroke="${C.ink}" stroke-width="6"/><path d="M-150,-100 h300 M-150,-50 h300" stroke="#7a5233" stroke-width="6"/>${[...Array(6)].map((_, m) => `<ellipse cx="${-110 + m * 44}" cy="${-160 - (m % 2) * 18}" rx="30" ry="24" fill="${m % 3 ? '#ffb330' : '#f2d03a'}" stroke="${C.ink}" stroke-width="4"/>`).join('')}</g><g transform="translate(${bx + 620},1960)"><path d="M-40,0 L-30,-80 H30 L40,0Z" fill="#c0603a" stroke="${C.ink}" stroke-width="5"/><circle cx="-14" cy="-110" r="44" fill="#2e7d32"/><circle cx="20" cy="-120" r="40" fill="#43a047"/><circle cx="0" cy="-150" r="16" fill="#ff5a7a"/></g>`; }
  if (!o.noPump) for (let k = -1; k < 4; k++) { const px = -220 + k * 2200; g += `<g transform="translate(${px},1930)"><rect x="-40" y="-330" width="44" height="330" fill="#3f6e7a" stroke="${C.ink}" stroke-width="6"/><path d="M-18,-320 L170,-420" stroke="#3f6e7a" stroke-width="22" stroke-linecap="round"/><path d="M4,-250 h70 v24" stroke="#3f6e7a" stroke-width="20" fill="none"/><path d="M90,-150 L120,0 H230 L260,-150Z" fill="#9aa3ad" stroke="${C.ink}" stroke-width="6"/></g>`; }
  // follow the slope so the foreground keeps its place on screen while the camera travels down the lane
  return layer(.62, cam, `<g transform="translate(0,-20) skewY(${SLA.toFixed(2)})">${g}</g>`);
}
// the whole lane. o.thela = svg for the cart drawn on the street; o.inner = extra action-plane svg; o.rowInner = extra in the house row
function dhalaan(t, cam, o = {}) {
  const O = Object.assign({}, o, { farKites: kiteField(t, cam, 6, 12, -900, 700, .22, 7, -900, 2400, 1), midKites: kiteField(t, cam, 3, 6, -1200, 300, .45, 19, -900, 2400, 1) });
  const back = skyL(t, cam, o) + cityL(t, cam, O) + layer(6, cam, heatHaze(t, 820, 1000, .12), { f: '' }) + veil(.32) + midRoofsL(t, cam, O) + veil(.16)
    + houseRowL(t, cam, o) + layer(1, cam, shafts(SUN[0] + 260, -500, 2.08, 6, 2600, .1, t), { f: '' }) + streetL(t, cam, o);
  return { back, front: galiFG(t, cam, o) + (o.motes !== false ? motes(t, 24, 0, 300, 1080, 1000, .5, 6) : '') };
}
// place the kulfi thela on the lane at world x (rolling): returns svg in screen space via the camera
function thelaAt(cam, x, o = {}) {
  const p = proj(1, cam, x, G(x) + 30), a = slopeAng(x);
  return castShadow(p.x, p.y, 440 * .62 * p.s, 120 * p.s, .25) + shadow(p.x - 30 * p.s, p.y + 4, 260 * p.s, .9, { dx: -40 * p.s, skew: 35 })
    + thela(Object.assign({ x: p.x, y: p.y, s: .62 * p.s, ang: a, roll: x / 48 }, o));
}
const SKY = 1.0;   // sk sprite base scale in the lane
