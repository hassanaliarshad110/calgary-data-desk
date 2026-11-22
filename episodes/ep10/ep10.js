// SUSUMAN Episode 7 — "Injection Se Dar" (built on Episode 6: all earlier sets + helpers, the studio-skeleton ensemble via sk.html, and the new 2.5D BAZAAR with the Mohalla Clinic + bamboo machaan).
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

// =================== EPISODE 5: "Bandar Ne Chashma Churaya" ===================
// New: BANDAR MAMA (the gali monkey), Dadi's chashma, kela, moongphali plate, Latifa's books, the electric pole + transformer,
// and the 2.5D ROOFTOP ROW set chhatein(): sky · clouds · far city (6) · mid roofs (3) · back row of houses/balconies (1.5) ·
// the row of connected rooftops with gaps (action plane, 1) · foreground clotheslines, wires, leaves, pots (.6).
Object.assign(SPK, { LATIFA: '#e76f51', 'ZAHRA MISS': '#457b9d' });
Object.assign(SKS, { latifa: 1.02, zahra: 1.0, dadiNoG: 1.2 });
const latifa = skFn('latifa'), zahra = skFn('zahra'), dadiNoG = skFn('dadiNoG');

// props (chashma, kela, moongPlate, kitaab, page, sparks) and BANDAR MAMA (bandar) live in rig.js

// ---------- the rooftop row (action plane d = 1) ----------
const FY = 1000, RK = -.14;     // back edge of the roof floors; oblique slant of the gaps and floor joints
const ROOFS = [
  { x0: -2400, x1: 700, fl: '#d9b48a', jt: '#c29d74', par: '#e9c9a2', cap: '#f4e4cc', ph: 120, jaali: 1, name: 'ours' },
  { x0: 830, x1: 1900, fl: '#dcc3a0', jt: '#c2a682', par: '#9fd8cf', cap: '#e6f4f1', ph: 86, name: 'basim' },
  { x0: 2030, x1: 3000, fl: '#e2bca4', jt: '#c79c82', par: '#f7c6d9', cap: '#fbe6ee', ph: 140, jaali: 1, name: 'latifa' },
  { x0: 3170, x1: 4500, fl: '#d8c59c', jt: '#bba67c', par: '#ffd98a', cap: '#fff2c8', ph: 100, name: 'zahra' },
  { x0: 4630, x1: 8000, fl: '#cfb99c', jt: '#b39c7e', par: '#c9b3f0', cap: '#eee6ff', ph: 120, name: 'next' },
];
const MUM5 = { x: -760, door: -650 }, CP5 = 60, PL5 = 400;   // our roof: mumty, charpai centre, moongphali plate
const POLE = 3085, POLES = [765, 3085, 4565], ARM = 330;   // pole x positions (in the gaps); crossarm height
const camR = (wx, z = 1, sy = 1150, sx = 540, wy = 1180) => ({ x: wx - sx, y: wy - sy, z, px: sx, py: sy });
const wireY = (x, k) => { // the 2 wires along the row, sagging between poles
  const ps = [-2000, ...POLES, 8000]; let i = 0; while (i < ps.length - 2 && x > ps[i + 1]) i++;
  const a = ps[i], b = ps[i + 1], u = clamp((x - a) / (b - a)); return ARM - 4 + k * 22 + 110 * 4 * u * (1 - u) * Math.min(1, (b - a) / 2300);
};
function pole(x, o = {}) {
  let g = `<rect x="${x - 15}" y="${ARM - 70}" width="30" height="${2600 - ARM}" fill="#8b8b94" stroke="${C.ink}" stroke-width="5"/><rect x="${x + 6}" y="${ARM - 60}" width="8" height="${2600 - ARM}" fill="#000" opacity=".15"/>`;
  g += `<rect x="${x - 130}" y="${ARM - 8}" width="260" height="20" rx="4" fill="#5d5d66" stroke="${C.ink}" stroke-width="4"/>` + [-110, -40, 40, 110].map(dx => `<path d="M${x + dx - 9},${ARM - 8} h18 l-3,-20 h-12z" fill="#f2efe6" stroke="${C.ink}" stroke-width="3"/>`).join('');
  if (o.trafo) g += `<g transform="translate(${x + 18},${ARM + 120})"><rect x="0" y="0" width="150" height="190" rx="12" fill="#9aa4ad" stroke="${C.ink}" stroke-width="6"/>${[0, 1, 2, 3, 4, 5].map(k => `<rect x="${12 + k * 22}" y="20" width="12" height="150" rx="5" fill="#7d8790"/>`).join('')}<rect x="20" y="-34" width="18" height="34" fill="#f2efe6" stroke="${C.ink}" stroke-width="3"/><rect x="66" y="-34" width="18" height="34" fill="#f2efe6" stroke="${C.ink}" stroke-width="3"/><rect x="112" y="-34" width="18" height="34" fill="#f2efe6" stroke="${C.ink}" stroke-width="3"/><path d="M29,-34 Q20,-90 ${-130 + 18},${-120 + 0}" stroke="#2a2a30" stroke-width="4" fill="none"/><path d="M121,-34 Q150,-100 ${110},${-120}" stroke="#2a2a30" stroke-width="4" fill="none"/></g>
    <rect x="${x - 26}" y="${ARM + 330}" width="52" height="16" fill="#5d5d66" stroke="${C.ink}" stroke-width="3"/><g transform="translate(${x},${ARM + 430})"><path d="M0,-58 L52,34 H-52Z" fill="#ffd23a" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/><path d="M6,-30 L-12,8 H4 L-6,26 L16,-6 H0 L10,-30Z" fill="${C.ink}"/></g>`;
  return g;
}
function wires(x0, x1) { let g = ''; for (let k = 0; k < 2; k++) { let p = `M${x0},${wireY(x0, k).toFixed(1)}`; for (let x = x0 + 60; x <= x1; x += 60) p += ` L${x},${wireY(x, k).toFixed(1)}`; g += `<path d="${p}" stroke="#25252b" stroke-width="${6 - k}" fill="none"/>`; } return g; }
function charpaiR(cx, y) {   // rope cot on the roof floor (cx = centre, y = floor line of the legs)
  return castShadow(cx + 20, y + 8, 470, 110, .2) + `${[cx - 225, cx + 200].map(x => `<rect x="${x}" y="${y - 130}" width="26" height="130" fill="#8a5a32" stroke="${C.ink}" stroke-width="5"/>`).join('')}<rect x="${cx - 245}" y="${y - 150}" width="490" height="40" rx="8" fill="#b07a46" stroke="${C.ink}" stroke-width="6"/>${[...Array(16)].map((_, k) => `<path d="M${cx - 230 + k * 30},${y - 146} l20,32" stroke="#f0e2c0" stroke-width="5"/>`).join('')}`;
}
function rowRoofL(t, cam, o = {}) {
  // the gali far below, seen through the gaps between roofs
  let g = `<rect x="-3000" y="${FY - 4}" width="12000" height="2700" fill="#3a2d26"/>`;
  for (let i = 0; i < ROOFS.length - 1; i++) { const a = ROOFS[i].x1, b = ROOFS[i + 1].x0; g += `<polygon points="${a},${FY + 300} ${b},${FY + 300} ${b + RK * 2300},${FY + 2600} ${a + RK * 2300},${FY + 2600}" fill="#5a4a3e"/><polygon points="${a},${FY} ${a + 34},${FY} ${a + 34 + RK * 2600},${FY + 2600} ${a + RK * 2600},${FY + 2600}" fill="#7a5c48"/>`; }
  ROOFS.forEach((r, i) => {
    const sl = 2600, bx0 = r.x0 + RK * sl, bx1 = r.x1 + RK * sl;
    g += `<polygon points="${r.x0},${FY} ${r.x1},${FY} ${bx1},${FY + sl} ${bx0},${FY + sl}" fill="${r.fl}" stroke="${C.ink}" stroke-width="6"/>`;
    for (let k = 1; k < 13; k++) { const dy = 22 * (Math.pow(1.33, k) - 1); g += `<path d="M${(r.x0 + RK * dy).toFixed(1)},${(FY + dy).toFixed(1)} H${(r.x1 + RK * dy).toFixed(1)}" stroke="${r.jt}" stroke-width="${2 + k * .5}"/>`; }
    for (let xx = r.x0 + 150; xx < r.x1; xx += 170) g += `<path d="M${xx},${FY} L${(xx + RK * sl).toFixed(1)},${FY + sl}" stroke="${r.jt}" stroke-width="3"/>`;
    for (let xx = r.x0 + 120; xx < r.x1 - 200; xx += 520) g += `<path d="M${xx},${FY + 40} l140,0 l${(RK * 160 - 60).toFixed(0)},160 l-140,0Z" fill="#fff1c8" opacity=".2"/>`;   // sun patches
    // back parapet (+ jaali) and its contact shadow
    const top = FY - r.ph;
    g += `<rect x="${r.x0}" y="${top}" width="${r.x1 - r.x0}" height="${r.ph + 8}" fill="${r.par}" stroke="${C.ink}" stroke-width="6"/><rect x="${r.x0 - 10}" y="${top - 16}" width="${r.x1 - r.x0 + 20}" height="26" fill="${r.cap}" stroke="${C.ink}" stroke-width="5"/>`;
    if (r.jaali) for (let jx = r.x0 + 30; jx < r.x1 - 80; jx += 100) g += `<rect x="${jx}" y="${top + 28}" width="62" height="${r.ph - 54}" rx="6" fill="#b88b62" stroke="${C.ink}" stroke-width="3"/><path d="M${jx},${top + 28 + (r.ph - 54) / 2} h62 M${jx + 31},${top + 28} v${r.ph - 54}" stroke="${r.par}" stroke-width="6"/>`;
    g += `<rect x="${r.x0}" y="${FY + 4}" width="${r.x1 - r.x0}" height="14" fill="#000" opacity=".16"/>`;
    // side wall at the right edge (shaded, faces the gap)
    g += `<polygon points="${r.x1},${top - 6} ${r.x1 + 30},${top + 6} ${r.x1 + 30 + RK * 2600},${FY + sl} ${bx1},${FY + sl}" fill="#000" opacity=".22"/>`;
  });
  // props: water tanks with long cast shadows, pots, a dish, clothesline stands
  [[-1250, 1], [1500, 1], [2720, 0], [4100, 1], [5400, 1]].forEach(([x, big]) => { const w = big ? 200 : 150; g += `<path d="M${x},${FY + 12} L${x + w},${FY + 12} L${x + w - 280},${FY + 110} L${x - 300},${FY + 110}Z" fill="#1a0f0a" opacity=".2"/><rect x="${x + 10}" y="${FY - 130}" width="14" height="140" fill="#555"/><rect x="${x + w - 24}" y="${FY - 130}" width="14" height="140" fill="#555"/><rect x="${x - 10}" y="${FY - 146}" width="${w + 20}" height="20" fill="#666" stroke="${C.ink}" stroke-width="4"/><rect x="${x}" y="${FY - 146 - (big ? 220 : 170)}" width="${w}" height="${big ? 220 : 170}" rx="24" fill="url(#tankG)" stroke="${C.ink}" stroke-width="6"/><path d="M${x},${FY - 300} h${w}" stroke="#000" stroke-width="5" opacity=".45"/>`; });
  [[-1500, 0], [960, 1], [2150, 0], [3600, 1], [3950, 0], [5000, 1]].forEach(([px, f], i) => g += castShadow(px, FY + 60, 60, 60, .2) + `<g transform="translate(${px},${FY + 60})"><path d="M-30,0 L-24,-50 H24 L30,0Z" fill="#c0603a" stroke="${C.ink}" stroke-width="4"/><circle cx="-12" cy="-72" r="26" fill="#3c9a4a" stroke="${C.ink}" stroke-width="4"/><circle cx="14" cy="-78" r="28" fill="#43a047" stroke="${C.ink}" stroke-width="4"/>${f ? `<circle cx="0" cy="-104" r="11" fill="#ff5a7a" stroke="${C.ink}" stroke-width="3"/>` : ''}</g>`);
  g += `<g transform="translate(880,${FY - 86})"><path d="M0,0 v-90" stroke="#555" stroke-width="8"/><ellipse cx="-10" cy="-120" rx="56" ry="66" fill="#d9dde3" stroke="${C.ink}" stroke-width="5" transform="rotate(-30 -10 -120)"/><path d="M-10,-120 l40,-30" stroke="#555" stroke-width="5"/></g>`;
  // our roof: the mumty (stair room) with its green door, Latifa's mat, Zahra Miss's stool
  const MX = MUM5.x;
  g += `<path d="M${MX},${FY + 12} L${MX + 420},${FY + 12} L${MX + 280},${FY + 100} L${MX - 140},${FY + 100}Z" fill="#1a0f0a" opacity=".16"/><rect x="${MX}" y="${FY - 450}" width="420" height="462" fill="#f2d4b0" stroke="${C.ink}" stroke-width="6"/><rect x="${MX - 16}" y="${FY - 476}" width="452" height="34" fill="#e8dccb" stroke="${C.ink}" stroke-width="5"/><rect x="${MX + 50}" y="${FY - 440}" width="40" height="440" fill="#d9b48f" opacity=".6"/><rect x="${MUM5.door}" y="${FY - 290}" width="190" height="292" fill="#140d08" stroke="${C.ink}" stroke-width="6"/><g transform="translate(${MUM5.door},${FY - 290}) scale(${Math.max(.04, 1 - (o.doorOpen || 0))},1)"><rect width="190" height="292" fill="#3a8a5a" stroke="${C.ink}" stroke-width="6"/><rect x="20" y="22" width="150" height="110" fill="none" stroke="#2c6b45" stroke-width="6"/><rect x="20" y="160" width="150" height="110" fill="none" stroke="#2c6b45" stroke-width="6"/><circle cx="160" cy="150" r="9" fill="#e8c34a"/></g>`;
  if (o.charpai !== false) g += charpaiR(CP5, FY + 190) + moongPlate(PL5, FY + 215, .9);
  g += `<path d="M2280,${FY + 150} l330,0 l-40,120 l-330,0Z" fill="#3b8de5" stroke="${C.ink}" stroke-width="5"/><path d="M2270,${FY + 170} l310,0 M2260,${FY + 200} l310,0 M2250,${FY + 230} l310,0" stroke="#ffd34a" stroke-width="6"/>`;
  g += POLES.map(x => pole(x, { trafo: x === POLE })).join('') + wires(-2400, 8000);
  if (o.inner) g += o.inner;
  return layer(1, cam, g);
}
// back row (d = 1.5): taller houses with balconies, clotheslines, dish antennas, mumtys, a big neem
function backRowL(t, cam, o = {}) {
  let g = '', x = -3200, i = 0;
  while (x < 9000) {
    const w = 360 + hs(i + 140) * 140, h = 420 + hs(i + 150) * 300, top = 1020 - h, col = HCOL[(i + 3) % HCOL.length];
    g += `<rect x="${x}" y="${top}" width="${w}" height="${h + 600}" fill="${col}" stroke="${C.ink}" stroke-width="6"/><rect x="${x - 10}" y="${top - 24}" width="${w + 20}" height="28" fill="#efe6d8" stroke="${C.ink}" stroke-width="5"/><rect x="${x + w - 44}" y="${top + 4}" width="44" height="${h + 590}" fill="#000" opacity=".09"/>`;
    for (let f = 0; f < 3; f++) { const wy = top + 70 + f * 230; if (wy > 980) break; [x + 50, x + w - 150].forEach(wx => g += `<rect x="${wx}" y="${wy}" width="100" height="130" fill="#5a8bb0" stroke="${C.ink}" stroke-width="5"/><path d="M${wx + 50},${wy} v130 M${wx},${wy + 64} h100" stroke="#cfe3ef" stroke-width="4"/><rect x="${wx - 22}" y="${wy}" width="22" height="130" fill="#3a8a5a" stroke="${C.ink}" stroke-width="4"/>`);
      if (f === 0 && i % 2 === 0) g += `<rect x="${x + 22}" y="${wy + 130}" width="${w - 44}" height="14" fill="#7a5a3a" stroke="${C.ink}" stroke-width="4"/>${[...Array(9)].map((_, k) => `<path d="M${x + 32 + k * (w - 64) / 8},${wy + 144} v44" stroke="#7a5a3a" stroke-width="6"/>`).join('')}<path d="M${x + 22},${wy + 188} h${w - 44}" stroke="#7a5a3a" stroke-width="6"/>${['#e5463b', '#ffd34a', '#3b8de5'].map((c, k) => `<rect x="${x + 60 + k * 70}" y="${wy + 146}" width="44" height="${70 + 10 * k}" fill="${c}" stroke="${C.ink}" stroke-width="3" transform="rotate(${3 * Math.sin(t * 2 + k + i)} ${x + 82 + k * 70} ${wy + 146})"/>`).join('')}`; }
    if (i % 2 === 1) g += `<rect x="${x + w - 130}" y="${top - 112}" width="90" height="90" rx="14" fill="url(#tankG)" stroke="${C.ink}" stroke-width="5"/>`;
    if (i % 3 === 0) g += `<g transform="translate(${x + 90},${top - 20})"><path d="M0,0 v-60" stroke="#555" stroke-width="6"/><ellipse cx="0" cy="-80" rx="40" ry="46" fill="#d9dde3" stroke="${C.ink}" stroke-width="4" transform="rotate(-30 0 -80)"/></g>`;
    if (i % 4 === 2) { const kx = x + w / 2; g += kid({ x: kx, y: top - 10, s: .34, t, shirt: HCOL[(i + 5) % 8], stripe: '#fff', armR: 150 + 10 * Math.sin(t * 3 + i), armL: 20, look: [8, -14] }) + dor(kx + 40, top - 240, kx + 420, top - 760 + 24 * Math.sin(t + i), 70, '#555', 2.4, .6) + patang(kx + 420, top - 760 + 24 * Math.sin(t + i), .55, 10 * Math.sin(t * 1.2 + i), KCOL[i % 7][0], KCOL[i % 7][1]); }
    x += w + (i % 3 === 1 ? 60 : 0); i++;
  }
  // the big gali neem behind Basim's roof (monkeys love it)
  const nx = 1250, sw = 4 * Math.sin(t * 1.2);
  g += `<path d="M${nx - 50},1100 Q${nx - 20},700 ${nx - 30},400 L${nx + 30},400 Q${nx + 30},700 ${nx + 60},1100Z" fill="#7a5233" stroke="${C.ink}" stroke-width="6"/><path d="M${nx},520 Q${nx + 160},440 ${nx + 300},460" stroke="${C.ink}" stroke-width="26" fill="none" stroke-linecap="round"/><path d="M${nx},520 Q${nx + 160},440 ${nx + 300},460" stroke="#7a5233" stroke-width="16" fill="none" stroke-linecap="round"/>`;
  const LV = [[0, 260, 190], [-170, 330, 140], [170, 320, 150], [-90, 140, 150], [100, 140, 150], [0, 40, 120], [-260, 230, 100], [270, 250, 110]];
  g += `<g transform="rotate(${sw} ${nx} 500)">` + LV.map(([lx, ly, r]) => `<circle cx="${nx + lx}" cy="${ly}" r="${r}" fill="#2e7d32" stroke="${C.ink}" stroke-width="6"/>`).join('') + LV.map(([lx, ly, r]) => `<circle cx="${nx + lx - 18}" cy="${ly - 18}" r="${r * .7}" fill="#43a047"/>`).join('') + LV.map(([lx, ly, r]) => `<circle cx="${nx + lx + r * .25}" cy="${ly - r * .3}" r="${r * .3}" fill="#9be07a" opacity=".45"/>`).join('') + '</g>';
  if (o.backInner) g += o.backInner;
  return layer(1.5, cam, g + haze(700, 1100, .12, '#ffeacc'));
}
// foreground (d = .6): clothesline with dupattas, wires with crows, neem leaves, pots and a brick stack (repeat along the row)
function rowFG(t, cam, o = {}) {
  let g = '';
  for (let k = -2; k < 9; k++) {
    const x0 = k * 1700;
    g += `<path d="M${x0 - 200},${40 + (k % 2) * 40} Q${x0 + 650},${300} ${x0 + 1500},${70}" stroke="#1d1d22" stroke-width="9" fill="none"/>`;
    if (k % 2 === 0) { // clothesline with dupattas
      g += `<path d="M${x0 + 200},150 Q${x0 + 700},260 ${x0 + 1200},140" stroke="#444" stroke-width="6" fill="none"/>`;
      [['#e4568a', 0, 260], ['#ffd34a', 220, 180], ['#3b8de5', 440, 230], ['#22a35a', 660, 200]].forEach(([c, dx, h], m) => { const sw = 5 * Math.sin(t * 2.2 + m + k), xx = x0 + 280 + dx, yy = 165 + 90 * Math.sin((dx + 80) / 1000 * Math.PI); g += `<g transform="rotate(${sw} ${xx + 60} ${yy})"><path d="M${xx},${yy} h130 l10,${h} q-75,20 -150,0Z" fill="${c}" stroke="${C.ink}" stroke-width="5"/><rect x="${xx + 50}" y="${yy - 12}" width="14" height="22" fill="#a8743f"/></g>`; });
    } else { // crows on the wire + neem leaves
      for (let b = 0; b < 2; b++) { const bx = x0 + 400 + b * 170, by = 175 + b * 12; g += `<g transform="translate(${bx},${by})"><ellipse rx="26" ry="16" fill="#2a2a30"/><circle cx="20" cy="-12" r="11" fill="#2a2a30"/><path d="M30,-12 l12,4 l-12,3z" fill="#e8a33a"/><path d="M-20,0 l-22,10" stroke="#2a2a30" stroke-width="8"/></g>`; }
      g += `<g transform="rotate(${3 * Math.sin(t * 1.4 + k)} ${x0 + 1300} -100)">` + [[1150, 40, 110], [1290, 150, 120], [1040, -40, 90], [1240, -70, 120]].map(([x, y, r]) => `<circle cx="${x0 + x - 400}" cy="${y}" r="${r}" fill="#1f6a27"/><circle cx="${x0 + x - 420}" cy="${y - 18}" r="${r * .6}" fill="#2e7d32"/>`).join('') + '</g>';
    }
    // bottom: pots / brick stack
    g += `<g transform="translate(${x0 + 300},1990)"><path d="M-110,40 L-80,-150 H120 L150,40Z" fill="#a84e2c"/><ellipse cx="20" cy="-200" rx="170" ry="110" fill="#2e7d32"/><ellipse cx="-50" cy="-260" rx="90" ry="70" fill="#3c9a4a"/><circle cx="60" cy="-270" r="22" fill="#ff5a7a"/></g><g transform="translate(${x0 + 1150},1960)">${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${-150 + c * 100 + (r % 2) * 50}" y="${-60 - r * 50}" width="96" height="46" fill="#b5532f" stroke="${C.ink}" stroke-width="4"/>`).join('')).join('')}</g>`;
  }
  return layer(.6, cam, g);
}
function chhatein(t, cam, o = {}) {
  const O = Object.assign({}, o, { farKites: kiteField(t, cam, 6, 14, -900, 700, .22, 9, -1200, 4200, 1), midKites: kiteField(t, cam, 3, 7, -1300, 300, .45, 23, -1000, 5000, 1) });
  const back = skyL(t, cam, o) + cityL(t, cam, O) + veil(.34) + midRoofsL(t, cam, O) + veil(.16) + backRowL(t, cam, o) + veil(.06)
    + layer(1, cam, shafts(SUN[0] + 260, -500, 2.08, 6, 2600, .12, t), { f: '' }) + rowRoofL(t, cam, o);
  return { back, front: (o.noFG ? '' : rowFG(t, cam, o)) + (o.motes !== false ? motes(t, 26, 0, 300, 1080, 1000, .5, 8) : '') };
}
// monkey placed through the camera at depth d (shadow on the floor unless lifted)
function bandarAt(d, cam, x, y, o = {}, sh = { w: 70 }) { return at(d, cam, x, y, bandar, o, sh); }

// =================== EPISODE 6 "Mele Mein Gum": BABA + PARI + the 2.5D MELA (fairground at dusk) ===================
Object.assign(SPK, { MAMA: '#1f7a78', BABA: '#3f7fbf', PARI: '#e0479a', AMMAR: '#d08a00', 'OFFICER GILL': '#1f2d4a' });
Object.assign(SKS, { baba: 1.0, babaKurta: 1.0, pari: 1.15, pariMa: 1.0, pariPa: 1.0 });
const baba = skFn('baba'), babaK = skFn('babaKurta'), pari = skFn('pari'), pariMa = skFn('pariMa'), pariPa = skFn('pariPa');
const camM = (wx, z = 1, sy = 1150, sx = 540, wy = 1180) => ({ x: wx - sx, y: wy - sy, z, px: sx, py: sy });
const MCOL = ['#e5463b', '#3b8de5', '#22a35a', '#ffd34a', '#b04ad6', '#ff7a2f', '#ff4f7b', '#1fb5b0'];
const melaDefs = `<defs><linearGradient id="duskG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2160"/><stop offset=".38" stop-color="#5a3c9a"/><stop offset=".62" stop-color="#d9607a"/><stop offset=".8" stop-color="#ff9a5a"/><stop offset="1" stop-color="#ffc77a"/></linearGradient>
 <radialGradient id="bulbG"><stop offset="0" stop-color="#fffbe0" stop-opacity="1"/><stop offset=".35" stop-color="#ffd86a" stop-opacity=".6"/><stop offset="1" stop-color="#ff9a00" stop-opacity="0"/></radialGradient>
 <radialGradient id="moonG"><stop offset="0" stop-color="#fffbe8"/><stop offset=".3" stop-color="#fff1c0" stop-opacity=".5"/><stop offset="1" stop-color="#fff1c0" stop-opacity="0"/></radialGradient>
 <linearGradient id="groundM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98a5e"/><stop offset="1" stop-color="#8d6440"/></linearGradient></defs>`;
// a little bulb with a glow (string lights)
const bulb = (x, y, c, on = 1, r = 9) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 3.2).toFixed(1)}" fill="url(#bulbG)" opacity="${(.55 * on).toFixed(2)}" style="mix-blend-mode:screen"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${on > .5 ? c : '#555'}" stroke="${C.ink}" stroke-width="2.5"/>`;
function bulbString(x0, x1, y, sag, n, t, seed = 0) {
  let g = `<path d="M${x0},${y} Q${(x0 + x1) / 2},${y + sag * 2} ${x1},${y}" stroke="#2a2030" stroke-width="3" fill="none"/>`;
  for (let i = 1; i < n; i++) { const k = i / n, x = lerp(x0, x1, k), yy = y + 4 * sag * k * (1 - k); const on = (Math.floor(t * 3 + i + seed) % 3) ? 1 : .35; g += bulb(x, yy + 10, MCOL[(i + seed) % MCOL.length], on); }
  return g;
}
function bunting(x0, x1, y, sag, n, t, seed = 0, s = 1) {
  let g = `<path d="M${x0},${y} Q${(x0 + x1) / 2},${y + sag * 2} ${x1},${y}" stroke="#3a2a20" stroke-width="${4 * s}" fill="none"/>`;
  for (let i = 0; i < n; i++) { const k = (i + .5) / n, x = lerp(x0, x1, k), yy = y + 4 * sag * k * (1 - k), w = (x1 - x0) / n * .42, fl = 5 * Math.sin(t * 3 + i); g += `<path d="M${(x - w).toFixed(1)},${yy.toFixed(1)} L${(x + w).toFixed(1)},${yy.toFixed(1)} L${(x + fl).toFixed(1)},${(yy + w * 2.1).toFixed(1)}Z" fill="${MCOL[(i + seed) % MCOL.length]}" stroke="${C.ink}" stroke-width="${3 * s}"/>`; }
  return g;
}
// generic mela-goer (simple flat figure in the same ink style). back = seen from behind (foreground heads)
function crowdP(x, y, s, seed, t, o = {}) {
  const r = i => hs(seed * 13.7 + i), kc = ['#e5463b', '#3b8de5', '#22a35a', '#f2b631', '#8e5bd6', '#ff7a2f', '#e9e4d8', '#1fb5b0', '#c0396b', '#6d7a8a'][Math.floor(r(1) * 10)];
  const skin = ['#c98b5c', '#b07248', '#a86f48', '#d7a27a', '#8d5a3b'][Math.floor(r(2) * 5)], fem = r(3) > .5, kidS = r(4) > .78 ? .7 : 1;
  const bob = (o.walk ? Math.abs(Math.sin(t * 6 + seed)) * 8 : Math.sin(t * 1.5 + seed) * 2), sc = s * kidS, flip = r(5) > .5 ? 1 : -1;
  let g = `<g transform="translate(${x.toFixed(1)},${(y - bob * sc).toFixed(1)}) scale(${(sc * flip).toFixed(3)},${sc.toFixed(3)})">`;
  const leg = o.walk ? 14 * Math.sin(t * 6 + seed) : 0;
  g += `<path d="M-22,-150 L${-26 + leg},0 M22,-150 L${26 - leg},0" stroke="${fem ? '#f1ede2' : '#3a3f4a'}" stroke-width="26" stroke-linecap="round"/>`;
  g += `<path d="M-58,-320 Q-70,-200 -54,-120 Q0,-108 54,-120 Q70,-200 58,-320 Q0,-344 -58,-320Z" fill="${kc}" stroke="${C.ink}" stroke-width="5"/>`;
  if (fem) g += `<path d="M-60,-318 Q-96,-220 -70,-150 L-50,-152 Q-66,-230 -30,-320Z" fill="${MCOL[Math.floor(r(6) * 8)]}" stroke="${C.ink}" stroke-width="4"/>`;
  g += `<path d="M-56,-300 Q-80,-220 -64,-160 M56,-300 Q80,-220 64,-160" stroke="${kc}" stroke-width="24" stroke-linecap="round" fill="none"/>`;
  g += `<circle cx="0" cy="-385" r="52" fill="${skin}" stroke="${C.ink}" stroke-width="5"/>`;
  if (o.back) g += `<path d="M-54,-380 Q-56,-446 0,-442 Q56,-446 54,-380 Q30,-350 0,-352 Q-30,-350 -54,-380Z" fill="#1b120c"/>` + (fem ? `<circle cx="0" cy="-400" r="26" fill="#1b120c"/>` : '');
  else { g += `<path d="M-54,-392 Q-50,-446 0,-442 Q50,-446 54,-392 Q30,-420 0,-418 Q-30,-420 -54,-392Z" fill="#1b120c" stroke="${C.ink}" stroke-width="4"/>` + (fem ? `<circle cx="0" cy="-448" r="20" fill="#1b120c" stroke="${C.ink}" stroke-width="4"/>` : '');
    g += `<circle cx="-18" cy="-382" r="6" fill="${C.ink}"/><circle cx="18" cy="-382" r="6" fill="${C.ink}"/><path d="M-14,-356 Q0,-346 14,-356" stroke="${C.ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    if (!fem && r(7) > .5) g += `<path d="M-20,-366 Q0,-376 20,-366" stroke="#1b120c" stroke-width="7" fill="none" stroke-linecap="round"/>`; }
  if (o.balloon) { const bc = MCOL[Math.floor(r(8) * 8)], bx = 70 + 10 * Math.sin(t * 2 + seed); g += `<path d="M60,-240 Q${bx - 10},-420 ${bx},-560" stroke="#555" stroke-width="3" fill="none"/><ellipse cx="${bx}" cy="-610" rx="42" ry="52" fill="${bc}" stroke="${C.ink}" stroke-width="4"/><ellipse cx="${bx - 14}" cy="-628" rx="10" ry="16" fill="#fff" opacity=".5"/>`; }
  return g + '</g>';
}
// pink cotton candy (buddhi ke baal) on a stick
const buddhi = (x, y, s = 1, rot = 0, bite = 0) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot}) scale(${s})"><path d="M0,0 V120" stroke="#f3e2c0" stroke-width="9" stroke-linecap="round"/>${[[-30, -20, 46], [26, -24, 44], [0, -56, 48], [-20, 18, 36], [24, 14, 34]].map(([cx, cy, rr], i) => i < 5 - bite * 3 ? `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="#ff9ccd" stroke="${C.ink}" stroke-width="4"/>` : '').join('')}<circle cx="-14" cy="-40" r="14" fill="#fff" opacity=".45"/></g>`;
// a single helium balloon
const gubbara = (x, y, s, c, t = 0, str = 180) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s})"><path d="M0,58 q${12 * Math.sin(t * 3)},${str / 2} 0,${str}" stroke="#555" stroke-width="3" fill="none"/><ellipse cx="0" cy="0" rx="46" ry="56" fill="${c}" stroke="${C.ink}" stroke-width="5"/><path d="M-6,56 l6,10 l6,-10z" fill="${c}" stroke="${C.ink}" stroke-width="3"/><ellipse cx="-16" cy="-20" rx="11" ry="18" fill="#fff" opacity=".5"/></g>`;
function balloonBunch(x, y, s, t, n = 9, seed = 3) { let g = ''; for (let i = 0; i < n; i++) { const a = (i / n - .5) * 1.6, L = 180 + 60 * hs(i + seed); const bx = x + Math.sin(a) * L * .8 + 6 * Math.sin(t * 2 + i), by = y - Math.cos(a) * L - 80; g += `<path d="M${x},${y} L${bx.toFixed(1)},${(by + 50 * s).toFixed(1)}" stroke="#666" stroke-width="2.5"/>`; } for (let i = 0; i < n; i++) { const a = (i / n - .5) * 1.6, L = 180 + 60 * hs(i + seed); const bx = x + Math.sin(a) * L * .8 + 6 * Math.sin(t * 2 + i), by = y - Math.cos(a) * L - 80; g += gubbara(bx, by, s, MCOL[(i + seed) % 8], t, 0); } return g; }

// ---- far layers ----
function melaSky(t, cam, o = {}) {
  let g = `<rect x="-3000" y="-2500" width="8000" height="3900" fill="url(#duskG)"/>`;
  for (let i = 0; i < 40; i++) g += `<circle cx="${-1200 + hs(i + 300) * 3600}" cy="${-1800 + hs(i + 320) * 1900}" r="${2 + 3 * hs(i + 340)}" fill="#fff" opacity="${(.35 + .5 * Math.abs(Math.sin(t * 1.3 + i))) * clamp(1 - (hs(i + 320) * 1900 - 900) / 900)}"/>`;
  g += `<circle cx="820" cy="-260" r="260" fill="url(#moonG)"/><circle cx="820" cy="-260" r="70" fill="#fff7dc" stroke="#f0d9a0" stroke-width="4"/><circle cx="800" cy="-280" r="12" fill="#efe2bc"/><circle cx="845" cy="-240" r="9" fill="#efe2bc"/>`;
  g += `<ellipse cx="540" cy="900" rx="1800" ry="260" fill="#ffd28a" opacity=".55"/>`;
  return layer(40, cam, g, { f: '' });
}
function melaCity(t, cam) {
  let g = '';
  for (let i = 0; i < 26; i++) { const x = -1500 + i * 190 + hs(i) * 40, w = 150 + hs(i + 1) * 80, h = 160 + hs(i + 2) * 260, y = 860 - h; g += `<rect x="${x}" y="${y}" width="${w}" height="${h + 300}" fill="#4a3a6e"/>`; for (let k = 0; k < 6; k++) if (hs(i * 7 + k) > .45) g += `<rect x="${x + 20 + (k % 3) * 44}" y="${y + 30 + Math.floor(k / 3) * 60}" width="18" height="24" fill="#ffd77a" opacity="${.5 + .5 * hs(k + i)}"/>`; if (hs(i + 5) > .6) g += `<rect x="${x + 30}" y="${y - 50}" width="60" height="50" rx="8" fill="#3d3060"/>`; }
  for (let i = 0; i < 6; i++) { const x = -800 + i * 600 + 100 * Math.sin(t * .3 + i), y = 300 + 80 * hs(i + 60); g += `<path d="M${x},${y} q14,-12 28,0 q14,-12 28,0" stroke="#2a2040" stroke-width="5" fill="none"/>`; }
  return layer(6, cam, g);
}
// the giant wheel (bada jhoola) at d≈2.4: hub world (WHX, WHY), radius WR; bulbs chase round the rim
const WHX = 760, WHY = 400, WR = 430;
function giantWheel(t, o = {}) {
  const sp = o.stop ? 0 : t * .18; let g = '';
  g += `<path d="M${WHX - 300},1100 L${WHX},${WHY} L${WHX + 300},1100 M${WHX - 220},1100 L${WHX},${WHY} L${WHX + 220},1100" stroke="#5b4a7a" stroke-width="22" fill="none"/>`;
  g += `<circle cx="${WHX}" cy="${WHY}" r="${WR}" fill="none" stroke="#6a5a8e" stroke-width="16"/><circle cx="${WHX}" cy="${WHY}" r="${WR - 40}" fill="none" stroke="#6a5a8e" stroke-width="7"/>`;
  for (let i = 0; i < 12; i++) { const a = sp + i * Math.PI / 6; g += `<path d="M${WHX},${WHY} L${(WHX + WR * Math.cos(a)).toFixed(1)},${(WHY + WR * Math.sin(a)).toFixed(1)}" stroke="#6a5a8e" stroke-width="6"/>`; }
  for (let i = 0; i < 36; i++) { const a = sp + i * Math.PI / 18, on = (Math.floor(t * 6) + i) % 4 ? 1 : .3; g += bulb(WHX + WR * Math.cos(a), WHY + WR * Math.sin(a), MCOL[i % 8], on, 10); }
  for (let i = 0; i < 12; i++) { const a = sp + i * Math.PI / 6 + Math.PI / 12, cx = WHX + WR * Math.cos(a), cy = WHY + WR * Math.sin(a); g += `<path d="M${cx.toFixed(1)},${cy.toFixed(1)} v34" stroke="#333" stroke-width="5"/><path d="M${(cx - 46).toFixed(1)},${(cy + 34).toFixed(1)} h92 l-12,64 h-68z" fill="${MCOL[i % 8]}" stroke="${C.ink}" stroke-width="5"/><rect x="${(cx - 40).toFixed(1)}" y="${(cy + 22).toFixed(1)}" width="80" height="16" rx="6" fill="#fff" opacity=".6"/>`; }
  g += `<circle cx="${WHX}" cy="${WHY}" r="44" fill="#ffd34a" stroke="${C.ink}" stroke-width="6"/>` + bulb(WHX, WHY, '#fff', 1, 16);
  return g;
}
function melaFar(t, cam, o = {}) {   // d=2.4: giant wheel, striped tent tops, chakri (merry-go-round)
  let g = giantWheel(t, o);
  [[-900, 900, '#e5463b'], [-300, 940, '#3b8de5'], [300, 920, '#22a35a'], [2400, 930, '#b04ad6'], [3000, 900, '#ff7a2f']].forEach(([x, y, c], i) => { g += `<path d="M${x - 220},${y + 200} L${x},${y - 160} L${x + 220},${y + 200}Z" fill="${c}" stroke="${C.ink}" stroke-width="6"/>`; for (let k = 0; k < 4; k++) g += `<path d="M${x},${y - 160} L${x - 220 + k * 110 + 55},${y + 200}" stroke="#fff" stroke-width="18" opacity=".6"/>`; g += `<path d="M${x},${y - 160} v-70" stroke="#333" stroke-width="6"/><path d="M${x},${y - 230} l50,16 l-50,16z" fill="${MCOL[(i + 3) % 8]}"/>` + bulbString(x - 220, x + 220, y + 200, 10, 7, t, i); });
  // chakri: merry-go-round with horses going round
  const cx = 2050, cy = 980; g += `<rect x="${cx - 260}" y="${cy - 120}" width="520" height="240" fill="#4a3a5e"/><path d="M${cx - 300},${cy - 120} L${cx},${cy - 300} L${cx + 300},${cy - 120}Z" fill="#ff4f7b" stroke="${C.ink}" stroke-width="6"/>` + bulbString(cx - 300, cx + 300, cy - 120, 6, 9, t, 2);
  for (let i = 0; i < 6; i++) { const a = t * 1.2 + i * Math.PI / 3, x = cx + 230 * Math.sin(a), sc = .75 + .25 * Math.cos(a); g += `<path d="M${x},${cy - 120} V${cy + 60}" stroke="#ffd34a" stroke-width="5"/><g transform="translate(${x.toFixed(1)},${(cy + 20 + 14 * Math.sin(t * 4 + i)).toFixed(1)}) scale(${(sc * (Math.cos(a) > 0 ? 1 : -1)).toFixed(2)},${sc.toFixed(2)})"><path d="M-50,0 Q-40,-36 0,-30 Q30,-60 52,-40 L46,-24 Q30,-30 24,-10 Q10,14 -40,12Z" fill="${['#fff', '#ffd34a', '#7fd3ff'][i % 3]}" stroke="${C.ink}" stroke-width="4"/></g>`; }
  g += `<rect x="${cx - 280}" y="${cy + 120}" width="560" height="40" fill="#ffd34a" stroke="${C.ink}" stroke-width="5"/>`;
  return layer(2.4, cam, g);
}
function melaCrowdBack(t, cam, o = {}) {   // d=1.6: a sea of people between the far rides and the stalls
  let g = bulbString(-1600, -400, 640, 30, 12, t, 1) + bulbString(-400, 900, 620, 34, 12, t, 4) + bulbString(900, 2200, 640, 30, 12, t, 6) + bulbString(2200, 3400, 630, 30, 12, t, 2);
  for (let i = 0; i < 46; i++) { const x = -1500 + i * 105 + 40 * hs(i + 80), y = 1130 + 40 * hs(i + 81); g += crowdP(x + (o.flow ? (t * 30 * (i % 2 ? 1 : -1)) % 200 : 0), y, .55, i + 100, t, { walk: i % 3 === 0, balloon: i % 11 === 4 }); }
  return layer(1.6, cam, g);
}
// ---- stall row (d=1.3) ----
const STALLS = [
  { x: -1150, w: 420, c1: '#ff7a2f', c2: '#fff', sign: 'KHILONE', k: 'toys' },
  { x: -650, w: 420, c1: '#ff4f7b', c2: '#fff', sign: 'BUDDHI KE BAAL', k: 'candy' },
  { x: -150, w: 440, c1: '#22a35a', c2: '#ffe9a0', sign: 'CHAAT', k: 'chaat' },
  { x: 380, w: 440, c1: '#b04ad6', c2: '#fff', sign: 'CHOODIYAN', k: 'bangles' },
  { x: 920, w: 400, c1: '#3b8de5', c2: '#fff', sign: 'GUBBARE', k: 'balloons' },
  { x: 1420, w: 460, c1: '#1f2d4a', c2: '#e9c46a', sign: 'KHOYA-PAAYA', k: 'police' },
  { x: 2000, w: 420, c1: '#e5463b', c2: '#ffd34a', sign: 'JALEBI', k: 'jalebi' },
];
const MWC = { x: 2560, w: 230, top: 760, base: 1080 };   // the mela's washroom booth (d=1.3)
function stall(s, t, o = {}) {
  const { x, w, c1, c2, sign, k } = s, top = 640, base = 1080;
  let g = castShadow(x + w / 2, base, w, 140, .25);
  g += `<rect x="${x}" y="${top + 120}" width="${w}" height="${base - top - 120}" fill="#3a2a40"/>`;
  g += `<rect x="${x + 6}" y="${top}" width="16" height="${base - top}" fill="#8a5a32" stroke="${C.ink}" stroke-width="4"/><rect x="${x + w - 22}" y="${top}" width="16" height="${base - top}" fill="#8a5a32" stroke="${C.ink}" stroke-width="4"/>`;
  // goods
  if (k === 'toys') for (let i = 0; i < 6; i++) g += `<g transform="translate(${x + 60 + i * 60},${top + 200 + 10 * Math.sin(t * 3 + i)}) rotate(${t * 200 + i * 60})"><path d="M0,0 L-24,-24 L0,-30Z M0,0 L24,-24 L30,0Z M0,0 L24,24 L0,30Z M0,0 L-24,24 L-30,0Z" fill="${MCOL[i % 8]}" stroke="${C.ink}" stroke-width="3"/></g><path d="M${x + 60 + i * 60},${top + 200} v110" stroke="#c9a24a" stroke-width="5"/>`;
  if (k === 'candy') { for (let i = 0; i < 5; i++) g += buddhi(x + 70 + i * 70, top + 230, .8, -6 + i * 3); g += `<ellipse cx="${x + w / 2}" cy="${top + 330}" rx="90" ry="40" fill="#e0e0e0" stroke="${C.ink}" stroke-width="5"/><ellipse cx="${x + w / 2}" cy="${top + 315}" rx="60" ry="26" fill="#ffc6e2" opacity="${.6 + .3 * Math.sin(t * 5)}"/>`; }
  if (k === 'chaat') { g += `<ellipse cx="${x + w / 2}" cy="${top + 300}" rx="120" ry="34" fill="#c0603a" stroke="${C.ink}" stroke-width="5"/>`; for (let i = 0; i < 9; i++) g += `<circle cx="${x + w / 2 - 90 + i * 22}" cy="${top + 286 - 10 * (i % 2)}" r="16" fill="#e8b45a" stroke="${C.ink}" stroke-width="3"/>`; for (let i = 0; i < 3; i++) g += `<path d="M${x + w / 2 - 40 + i * 40},${top + 260} q${10 * Math.sin(t * 2 + i)},-40 0,-80" stroke="#fff" stroke-width="5" fill="none" opacity=".5"/>`; }
  if (k === 'bangles') for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) g += `<ellipse cx="${x + 70 + i * 50}" cy="${top + 180 + r * 60}" rx="20" ry="20" fill="none" stroke="${MCOL[(i + r * 3) % 8]}" stroke-width="7"/><ellipse cx="${x + 70 + i * 50}" cy="${top + 180 + r * 60}" rx="20" ry="20" fill="none" stroke="#ffd34a" stroke-width="2" opacity="${.5 + .5 * Math.sin(t * 4 + i + r)}"/>`;
  if (k === 'balloons') g += balloonBunch(x + w / 2, top + 330, .6, t, 9, 1);
  if (k === 'police') { g += `<rect x="${x + 40}" y="${top + 150}" width="${w - 80}" height="120" fill="#f6f1e2" stroke="${C.ink}" stroke-width="4"/>${T(x + w / 2, top + 200, 34, 'BACHCHA KHO GAYA?', { fill: '#1f2d4a', sw: 0, font: 'Baloo2', weight: 800 })}${T(x + w / 2, top + 248, 34, 'YAHAN AAIYE', { fill: '#c8102e', sw: 0, font: 'Baloo2', weight: 800 })}`; g += `<path d="M${x + w - 70},${top + 40} l60,-30 v80 l-60,-30z" fill="#e9e4da" stroke="${C.ink}" stroke-width="4"/><rect x="${x + w - 90}" y="${top + 40}" width="24" height="40" fill="#999" stroke="${C.ink}" stroke-width="3"/>`; }
  if (k === 'jalebi') { g += `<ellipse cx="${x + w / 2}" cy="${top + 300}" rx="120" ry="34" fill="#333" stroke="${C.ink}" stroke-width="5"/>`; for (let i = 0; i < 5; i++) g += `<circle cx="${x + w / 2 - 80 + i * 40}" cy="${top + 290}" r="${14 + 4 * Math.sin(i)}" fill="none" stroke="#ff9a1a" stroke-width="7"/>`; for (let i = 0; i < 3; i++) g += `<path d="M${x + w / 2 - 40 + i * 40},${top + 250} q${10 * Math.sin(t * 2 + i)},-40 0,-80" stroke="#fff" stroke-width="5" fill="none" opacity=".5"/>`; }
  // counter
  g += `<rect x="${x - 10}" y="${base - 170}" width="${w + 20}" height="170" fill="${c1}" stroke="${C.ink}" stroke-width="6"/><rect x="${x - 10}" y="${base - 170}" width="${w + 20}" height="24" fill="#fff" opacity=".35"/>`;
  for (let i = 0; i < 4; i++) g += `<circle cx="${x + 40 + i * (w - 80) / 3}" cy="${base - 80}" r="18" fill="${c2}" stroke="${C.ink}" stroke-width="4"/>`;
  // striped awning with scallops
  const n = 6, sw = (w + 60) / n;
  for (let i = 0; i < n; i++) g += `<path d="M${x - 30 + i * sw},${top} h${sw} v70 q${-sw / 2},34 ${-sw},0z" fill="${i % 2 ? c2 : c1}" stroke="${C.ink}" stroke-width="5"/>`;
  g += `<rect x="${x - 34}" y="${top - 16}" width="${w + 68}" height="22" rx="8" fill="${c1}" stroke="${C.ink}" stroke-width="5"/>`;
  // sign board + bulb
  const sl = sign.length * 25 + 60;
  g += `<rect x="${x + w / 2 - sl / 2}" y="${top - 108}" width="${sl}" height="86" rx="14" fill="#fffbe8" stroke="${C.ink}" stroke-width="6"/>${T(x + w / 2, top - 46, 52, sign, { fill: c1 === '#fff' ? C.red : c1, sw: 0, ls: 2 })}`;
  g += `<path d="M${x + w / 2},${top + 70} v40" stroke="#333" stroke-width="4"/>` + bulb(x + w / 2, top + 122, '#fff3c0', 1, 13) + lightPool(x + w / 2, base - 120, w * .7, 160, .5, 'poolW');
  if (k === 'police' && o.mic) g += `<g transform="translate(${x + w - 70},${top + 70})">${[0, 1, 2].map(i => `<path d="M${30 + i * 26},${-30 - i * 10} q20,30 0,60" stroke="#fff" stroke-width="6" fill="none" opacity="${.9 * Math.abs(Math.sin(t * 6 + i))}"/>`).join('')}</g>`;
  return g;
}
function wcBooth(t, o = {}) {
  const W0 = MWC, open = o.open || 0, glow = o.glow || 0;
  let g = castShadow(W0.x + W0.w / 2, W0.base, W0.w + 40, 140, .25);
  g += `<rect x="${W0.x - 24}" y="${W0.top - 40}" width="${W0.w + 48}" height="${W0.base - W0.top + 40}" fill="#2f7fd6" stroke="${C.ink}" stroke-width="6"/><path d="M${W0.x - 40},${W0.top - 40} h${W0.w + 80} l-20,-40 h${-W0.w - 40}z" fill="#1f5fa6" stroke="${C.ink}" stroke-width="5"/>`;
  g += `<rect x="${W0.x}" y="${W0.top}" width="${W0.w}" height="${W0.base - W0.top}" fill="#1a1410"/>`;
  if (glow > 0) g += `<rect x="${W0.x}" y="${W0.top}" width="${W0.w}" height="${W0.base - W0.top}" fill="#ffe08a" opacity="${clamp(glow * open * 1.3)}"/>`;
  const sx = Math.max(.03, 1 - open);
  g += `<g transform="translate(${W0.x},${W0.top}) scale(${sx},1)"><rect width="${W0.w}" height="${W0.base - W0.top}" fill="#e9eef4" stroke="${C.ink}" stroke-width="6"/><rect x="26" y="150" width="${W0.w - 52}" height="140" rx="8" fill="none" stroke="#c6cfdb" stroke-width="6"/><circle cx="${W0.w - 24}" cy="170" r="12" fill="#c9a24a" stroke="${C.ink}" stroke-width="3"/><g transform="translate(${W0.w / 2},80)"><circle r="46" fill="#3a8dde" stroke="${C.ink}" stroke-width="5"/>${T(0, 16, 44, 'WC', { sw: 0, ls: 3 })}</g></g>`;
  if (glow > 0) g += `<rect x="${W0.x - 4}" y="${W0.base - 14}" width="${W0.w + 8}" height="${16 + 8 * Math.sin(t * 20)}" fill="#ffd34a" opacity="${glow}" filter="url(#glow)"/><rect x="${W0.x + W0.w * sx - 4}" y="${W0.top}" width="${8 + 6 * glow}" height="${W0.base - W0.top}" fill="#ffd34a" opacity="${glow * .8}" filter="url(#glow)"/>`;
  g += bulb(W0.x + W0.w / 2, W0.top - 60, '#fff3c0', 1, 12);
  return g;
}
function stallRow(t, cam, o = {}) {
  let g = `<rect x="-1800" y="1060" width="5200" height="60" fill="#9b7350"/>`;
  STALLS.forEach(s => g += stall(s, t, o));
  g += wcBooth(t, o);
  // a few people at the counters (backs to us)
  [[-560, 3], [-60, 7], [470, 11], [2080, 15], [-1080, 19]].forEach(([x, sd]) => g += crowdP(x, 1120, .62, sd, t, { back: 1 }));
  g += bunting(-1700, 600, 400, 30, 16, t, 0, 1.1) + bunting(600, 3300, 400, 30, 22, t, 3, 1.1);
  return layer(1.3, cam, g);
}
function melaGround(t, cam, o = {}) {
  let g = `<rect x="-2000" y="1080" width="6000" height="1600" fill="url(#groundM)"/>`;
  for (let i = 0; i < 70; i++) g += `<ellipse cx="${-1800 + hs(i + 400) * 5200}" cy="${1110 + hs(i + 401) * 600}" rx="${20 + 50 * hs(i + 402)}" ry="${5 + 8 * hs(i + 403)}" fill="#7a5436" opacity=".3"/>`;
  for (let i = 0; i < 14; i++) { const x = -1400 + i * 340 + 60 * hs(i + 500), y = 1160 + 260 * hs(i + 501); g += `<path d="M${x},${y} l18,-6 l10,10z" fill="${MCOL[i % 8]}" opacity=".8"/>`; }   // dropped tickets / wrappers
  for (let i = 0; i < 9; i++) { const x = -1300 + i * 560 + 120 * hs(i + 600), y = 1520 + 200 * hs(i + 601); g += `<g transform="translate(${x},${y})"><ellipse cx="0" cy="10" rx="60" ry="12" fill="#1a0f0a" opacity=".2"/>` + (i % 3 === 0 ? `<path d="M-30,0 l10,-40 h40 l10,40z" fill="#fff" stroke="${C.ink}" stroke-width="4"/><path d="M-22,-30 h44" stroke="#e5463b" stroke-width="6"/>${[0, 1, 2, 3].map(k => `<circle cx="${-14 + k * 9}" cy="-46" r="8" fill="#fff6d8" stroke="${C.ink}" stroke-width="2"/>`).join('')}` : i % 3 === 1 ? `<path d="M-40,0 q40,-30 80,0" stroke="#c9a24a" stroke-width="6" fill="none"/><circle cx="30" cy="-6" r="10" fill="${MCOL[i % 8]}"/>` : `<rect x="-36" y="-10" width="72" height="14" rx="4" fill="${MCOL[(i + 2) % 8]}" transform="rotate(-12)"/>`) + '</g>'; }   // popcorn cones, toys, wrappers on the ground
  [[-650, 1180], [-150, 1180], [380, 1180], [920, 1180], [1420, 1180], [2000, 1180]].forEach(([x, y], i) => g += lightPool(x + 210, y + 40, 380, 120, .45, 'poolW'));
  return layer(1, cam, g, { f: '' });
}
function melaFG(t, cam, o = {}) {
  let g = bunting(-900, 2400, 40, 70, 26, t, 5, 1.6) + bulbString(-900, 2400, 230, 50, 18, t, 3);
  if (!o.noHeads) for (let i = 0; i < 9; i++) { const x = -700 + i * 400 + 60 * hs(i + 900) + (o.flowFG ? (t * 60) % 400 : 0); g += crowdP(x, (o.fgY || 2090) + 60 * hs(i + 901), 1.25, i + 200, t, { back: 1, walk: 1 }); }
  [].forEach((x, i) => { g += `<rect x="${x - 14}" y="300" width="28" height="2200" fill="#b58a4a" stroke="${C.ink}" stroke-width="5"/>` + [0, 1, 2].map(k => `<path d="M${x - 14},${700 + k * 500} h28" stroke="#7a5a2a" stroke-width="6"/>`).join('') + bulb(x, 290, '#fff3c0', 1, 22); });
  if (o.balloonFG) g += balloonBunch(o.balloonFG, (o.fgY || 2090) - 500, 1.1, t, 7, 4);
  return layer(.6, cam, g);
}
function mela(t, cam, o = {}) {
  const back = melaSky(t, cam, o) + melaCity(t, cam) + veil(.3) + melaFar(t, cam, o) + veil(.2) + melaCrowdBack(t, cam, o) + veil(.1)
    + stallRow(t, cam, o) + melaGround(t, cam, o)
    + (o.glow > 0 ? layer(1.3, cam, lightPool(MWC.x + MWC.w / 2, MWC.base + 40, 300 + 90 * o.glow + 240 * (o.open || 0), 70 + 40 * (o.open || 0), o.glow) + `<path d="M${MWC.x},${MWC.base} L${MWC.x + MWC.w},${MWC.base} L${MWC.x + MWC.w + 240},${MWC.base + 380} L${MWC.x - 240},${MWC.base + 380}Z" fill="#ffd34a" opacity="${.22 * o.glow + .3 * (o.open || 0)}" style="mix-blend-mode:screen"/>`, { f: '' }) : '');
  return { back, front: o.noFG ? '' : melaFG(t, cam, o) + motes(t, 26, 0, 300, 1080, 1100, .5, 6) };
}

// =================== EPISODE 7: "Injection Se Dar" ===================
// New: the 2.5D BAZAAR set bazaar(): sky/sun (50) · clouds (12) · far city + kites (6) · mid rooftops (3) ·
// bazaarRow (1.3: CHAI, DAWAI, the MOHALLA CLINIC with its open front + WC door, the half-built building with the bamboo MACHAAN
// (scaffolding) and the loose top plank, SABZI, KIRYANA, MITHAI) · bazaarGround (1: paving, kerb, rickshaw, cycle, sand heap, cement bags) ·
// bazaarFG (.6: wires with crows, a hanging plant, crates, bougainvillea). Props: syringe(), plaster(), stetho(), basket(), thermo().
Object.assign(SPK, { LATIFA: '#e76f51', DHARMENDER: '#e09a00' });
Object.assign(SKS, { latifa: 1.02, dharmender: 1.08 });
const camD = (d, X, Y, z = 1, sx = 540, sy = 1150) => ({ x: d * (X - sx), y: d * (Y - sy), z, px: sx, py: sy });   // put the depth-d point (X,Y) at screen (sx,sy)
const CLX = 0, CLW = 900;                                       // clinic facade (row layer d=1.3)
const CWC = { x: 690, w: 190, top: 770, base: 1080 };           // clinic washroom door (outside, on the facade)
const MCH = { x0: 1000, x1: 1880, lv: [880, 600, 320, 40] };  // machaan: bamboo scaffold, plank levels (row coords)
const PLANK = { x: 1880, y: 40, len: 300 };                    // loose top plank sticking out to the right (pivot at x)
function syringe(x, y, s = 1, rot = 0, push = 0) {
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot}) scale(${s.toFixed(3)})"><rect x="-110" y="-22" width="150" height="44" rx="10" fill="#e8f6ff" stroke="${C.ink}" stroke-width="6"/><rect x="${-100 + push * 60}" y="-16" width="${130 - push * 60}" height="32" rx="6" fill="#8fd6ff" opacity=".8"/>${[0, 1, 2, 3].map(k => `<path d="M${-80 + k * 28},-22 v14" stroke="${C.ink}" stroke-width="3"/>`).join('')}<rect x="40" y="-10" width="22" height="20" fill="#cfd8e0" stroke="${C.ink}" stroke-width="4"/><path d="M62,0 h34" stroke="#9aa3ad" stroke-width="5"/><rect x="${-150 + push * 60}" y="-8" width="44" height="16" fill="#cfd8e0" stroke="${C.ink}" stroke-width="4"/><rect x="${-162 + push * 60}" y="-26" width="14" height="52" rx="5" fill="#e5463b" stroke="${C.ink}" stroke-width="4"/></g>`;
}
const plaster = (x, y, s = 1, rot = -20) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot}) scale(${s.toFixed(3)})"><rect x="-34" y="-14" width="68" height="28" rx="12" fill="#ffd9b0" stroke="${C.ink}" stroke-width="4"/><path d="M0,-9 l3,6 7,1 -5,5 1,7 -6,-3 -6,3 1,-7 -5,-5 7,-1z" fill="${C.gold}" stroke="${C.ink}" stroke-width="1.5"/></g>`;
const stetho = (x, y, s = 1) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(3)})" fill="none"><path d="M-34,-10 Q-40,60 0,74 Q40,60 34,-10" stroke="#333" stroke-width="7"/><path d="M0,74 v40" stroke="#333" stroke-width="7"/><circle cx="0" cy="124" r="14" fill="#cfd8e0" stroke="${C.ink}" stroke-width="5"/></g>`;
const thermo = (x, y, s = 1, rot = 30) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot}) scale(${s.toFixed(3)})"><rect x="-8" y="-60" width="16" height="70" rx="8" fill="#fff" stroke="${C.ink}" stroke-width="4"/><circle cx="0" cy="12" r="11" fill="#e5463b" stroke="${C.ink}" stroke-width="4"/><rect x="-3" y="-30" width="6" height="40" fill="#e5463b"/></g>`;
function basket(x, y, s = 1, inner = '') {   // cane basket Mano rides in; inner = svg drawn inside (behind the front rim)
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(3)})"><path d="M-90,-80 Q0,-190 90,-80" stroke="#8a5a32" stroke-width="12" fill="none"/>${inner}<path d="M-100,-80 L-80,0 H80 L100,-80Z" fill="#d9a85a" stroke="${C.ink}" stroke-width="6"/>${[0, 1, 2].map(k => `<path d="M-96,${-60 + k * 22} H96" stroke="#a87a3a" stroke-width="5"/>`).join('')}${[...Array(7)].map((_, k) => `<path d="M${-75 + k * 25},-80 v80" stroke="#a87a3a" stroke-width="3"/>`).join('')}</g>`;
}
function bamboo(x, y0, y1, w = 16) { return `<rect x="${x - w / 2}" y="${y1}" width="${w}" height="${y0 - y1}" rx="6" fill="#c9a25a" stroke="${C.ink}" stroke-width="4"/>` + [...Array(Math.floor((y0 - y1) / 120))].map((_, k) => `<path d="M${x - w / 2},${y0 - 60 - k * 120} h${w}" stroke="#8a6a2a" stroke-width="4"/>`).join(''); }
function plankSvg(x, y, len, ang = 0, crack = 0) {
  return `<g transform="translate(${x},${y}) rotate(${ang})"><rect x="0" y="-8" width="${len}" height="26" fill="#b07a46" stroke="${C.ink}" stroke-width="5"/><path d="M10,4 h${len - 30}" stroke="#8a5a32" stroke-width="3"/>${crack > 0 ? `<path d="M${len * .32},-8 l12,12 -10,8 12,14" stroke="${C.ink}" stroke-width="${3 + 3 * crack}" fill="none"/>` : ''}</g>`;
}
function shopFront(x, w, c1, c2, word, t, k = 0) {
  const top = 640, base = 1080; let g = castShadow(x + w / 2, base, w, 130, .22);
  g += `<rect x="${x}" y="${top - 280}" width="${w}" height="${base - top + 300}" fill="${HCOL[k % HCOL.length]}" stroke="${C.ink}" stroke-width="6"/><rect x="${x - 10}" y="${top - 304}" width="${w + 20}" height="28" fill="#efe6d8" stroke="${C.ink}" stroke-width="5"/>`;
  g += `<rect x="${x + 40}" y="${top - 230}" width="${w / 2 - 70}" height="120" fill="#5a8bb0" stroke="${C.ink}" stroke-width="5"/><rect x="${x + w / 2 + 30}" y="${top - 230}" width="${w / 2 - 70}" height="120" fill="#5a8bb0" stroke="${C.ink}" stroke-width="5"/>`;
  if (k % 2 === 0) g += `<rect x="${x + w - 120}" y="${top - 400}" width="86" height="88" rx="14" fill="url(#tankG)" stroke="${C.ink}" stroke-width="5"/>`;
  g += `<rect x="${x + 30}" y="${top + 60}" width="${w - 60}" height="${base - top - 60}" fill="#3a3a44" stroke="${C.ink}" stroke-width="5"/><rect x="${x + 40}" y="${top + 110}" width="${w - 80}" height="${base - top - 120}" fill="#d8b47a"/>`;
  for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) g += `<rect x="${x + 55 + i * (w - 110) / 4}" y="${top + 140 + r * 80}" width="${(w - 140) / 4}" height="56" rx="6" fill="${[c1, c2, '#22a35a', '#ffd34a'][(i + r + k) % 4]}" stroke="${C.ink}" stroke-width="3"/>`;
  g += `<rect x="${x + 20}" y="${base - 150}" width="${w - 40}" height="150" fill="${c1}" stroke="${C.ink}" stroke-width="5"/>`;
  const n = 6, sw = (w + 40) / n;
  for (let i = 0; i < n; i++) g += `<path d="M${x - 20 + i * sw},${top} h${sw} v60 q${-sw / 2},30 ${-sw},0z" fill="${i % 2 ? c2 : c1}" stroke="${C.ink}" stroke-width="5"/>`;
  g += `<rect x="${x + w / 2 - word.length * 14 - 30}" y="${top - 92}" width="${word.length * 28 + 60}" height="76" rx="12" fill="#fff6d8" stroke="${C.ink}" stroke-width="5"/>${T(x + w / 2, top - 36, 50, word, { fill: '#c8102e', sw: 0, ls: 3 })}`;
  return g;
}
function clinic(t, o = {}) {
  const x = CLX, w = CLW, top = 300, base = 1080, op = 600;   // op = width of the open front (x+40 .. x+40+op)
  let g = castShadow(x + w / 2, base, w, 150, .25);
  g += `<rect x="${x}" y="${top}" width="${w}" height="${base - top + 40}" fill="#e6f5ef" stroke="${C.ink}" stroke-width="6"/><rect x="${x - 14}" y="${top - 26}" width="${w + 28}" height="30" fill="#f6fbf9" stroke="${C.ink}" stroke-width="5"/>`;
  g += `<rect x="${x + w - 44}" y="${top + 4}" width="44" height="${base - top}" fill="#000" opacity=".07"/>`;
  // upper floor windows with a teal frame
  [x + 60, x + 330, x + 600].forEach(wx => g += `<rect x="${wx}" y="${top + 40}" width="200" height="140" fill="#7fb6d6" stroke="${C.ink}" stroke-width="5"/><path d="M${wx + 100},${top + 40} v140 M${wx},${top + 110} h200" stroke="#e6f5ef" stroke-width="6"/><rect x="${wx - 8}" y="${top + 178}" width="216" height="14" fill="#1f9e8f" stroke="${C.ink}" stroke-width="3"/>`);
  // big sign: MOHALLA CLINIC with a green plus + heart (no red cross)
  g += `<rect x="${x + 40}" y="${top + 220}" width="${w - 80}" height="120" rx="16" fill="#1f9e8f" stroke="${C.ink}" stroke-width="6"/>${T(x + w / 2 + 50, top + 302, 66, 'MOHALLA CLINIC', { fill: '#fff', sw: 0, ls: 3 })}<g transform="translate(${x + 110},${top + 280})"><circle r="44" fill="#fff" stroke="${C.ink}" stroke-width="5"/><path d="M-12,-30 h24 v18 h18 v24 h-18 v18 h-24 v-18 h-18 v-24 h18z" fill="#22a35a" stroke="${C.ink}" stroke-width="3"/></g>`;
  // banner: today's camp (sways)
  const bw = 4 * Math.sin(t * 1.6);
  g += `<g transform="rotate(${bw * .3} ${x + w / 2} ${top + 360})"><path d="M${x + 60},${top + 360} h${w - 120} v80 h${-(w - 120)}z" fill="#ffd34a" stroke="${C.ink}" stroke-width="5"/>${T(x + w / 2, top + 414, 36, 'AAJ: BACHCHON KA TEEKA + JANWAR CAMP', { fill: '#7a1a2a', sw: 0, font: 'Baloo2', weight: 800 })}</g>`;
  // open front: interior (back wall, poster, eye chart, cabinet, bed, weighing scale, desk)
  const ix = x + 40, iy = top + 470;
  g += `<rect x="${ix}" y="${iy}" width="${op}" height="${base - iy}" fill="#cdeee4" stroke="${C.ink}" stroke-width="6"/><rect x="${ix}" y="${base - 70}" width="${op}" height="70" fill="#9fd1c3"/>`;
  g += `<rect x="${ix + 30}" y="${iy + 30}" width="150" height="120" rx="8" fill="#fff" stroke="${C.ink}" stroke-width="4"/><circle cx="${ix + 105}" cy="${iy + 78}" r="30" fill="${C.gold}" stroke="${C.ink}" stroke-width="3"/><path d="M${ix + 90},${iy + 86} q15,12 30,0" stroke="${C.ink}" stroke-width="4" fill="none"/><circle cx="${ix + 95}" cy="${iy + 70}" r="4"/><circle cx="${ix + 115}" cy="${iy + 70}" r="4"/>${T(ix + 105, iy + 136, 22, 'DOCTOR = DOST', { fill: '#1f9e8f', sw: 0, font: 'Baloo2', weight: 800 })}`;
  g += `<rect x="${ix + 220}" y="${iy + 24}" width="90" height="130" fill="#fff" stroke="${C.ink}" stroke-width="4"/>` + ['E', 'F P', 'T O Z', 'L P E D'].map((s, k) => T(ix + 265, iy + 60 + k * 28, 30 - k * 5, s, { fill: '#222', sw: 0, font: 'Baloo2', weight: 800 })).join('');
  g += `<rect x="${ix + 440}" y="${iy + 20}" width="140" height="${base - iy - 90}" fill="#f6fbf9" stroke="${C.ink}" stroke-width="5"/>${[0, 1, 2].map(k => `<path d="M${ix + 440},${iy + 80 + k * 70} h140" stroke="${C.ink}" stroke-width="4"/>` + [0, 1, 2].map(m => `<rect x="${ix + 456 + m * 42}" y="${iy + 48 + k * 70}" width="22" height="30" rx="4" fill="${['#8fd6ff', '#ffb330', '#22a35a'][(m + k) % 3]}" stroke="${C.ink}" stroke-width="2"/>`).join('')).join('')}`;
  g += `<rect x="${ix + 210}" y="${base - 200}" width="220" height="40" rx="8" fill="#fff" stroke="${C.ink}" stroke-width="5"/><rect x="${ix + 220}" y="${base - 214}" width="70" height="22" rx="8" fill="#bfe3f2" stroke="${C.ink}" stroke-width="3"/>${[ix + 220, ix + 410].map(lx => `<rect x="${lx}" y="${base - 160}" width="12" height="90" fill="#9aa3ad" stroke="${C.ink}" stroke-width="3"/>`).join('')}`;
  g += `<g transform="translate(${ix + 60},${base - 70})"><rect x="-30" y="-12" width="60" height="12" fill="#9aa3ad" stroke="${C.ink}" stroke-width="3"/><rect x="-6" y="-150" width="12" height="138" fill="#9aa3ad" stroke="${C.ink}" stroke-width="3"/><circle cx="0" cy="-160" r="16" fill="#fff" stroke="${C.ink}" stroke-width="4"/></g>`;
  g += lightPool(ix + op / 2, base - 60, op * .5, 60, .6, 'poolW') + `<path d="M${ix + op / 2},${iy + 4} v24" stroke="#333" stroke-width="4"/>` + bulb(ix + op / 2, iy + 38, '#fff3c0', 1, 12);
  g += `<rect x="${ix - 8}" y="${iy - 14}" width="${op + 16}" height="18" fill="#9aa3ad" stroke="${C.ink}" stroke-width="4"/>${[...Array(12)].map((_, k) => `<path d="M${ix + k * op / 12},${iy - 12} v12" stroke="#6f7780" stroke-width="3"/>`).join('')}`;   // rolled-up shutter
  // step + ramp in front
  g += `<rect x="${x - 10}" y="${base - 6}" width="${w + 20}" height="22" fill="#bdb3a3" stroke="${C.ink}" stroke-width="4"/>`;
  // clinic washroom door (outside), bulb, glow
  const W0 = CWC, open = o.open || 0, glow = o.glow || 0;
  g += `<rect x="${W0.x - 14}" y="${W0.top - 14}" width="${W0.w + 28}" height="${W0.base - W0.top + 14}" fill="#1f9e8f" stroke="${C.ink}" stroke-width="5"/><rect x="${W0.x}" y="${W0.top}" width="${W0.w}" height="${W0.base - W0.top}" fill="#1a1410"/>`;
  if (glow > 0) g += `<rect x="${W0.x}" y="${W0.top}" width="${W0.w}" height="${W0.base - W0.top}" fill="#ffe08a" opacity="${clamp(glow * open * 1.3)}"/>`;
  const sx = Math.max(.03, 1 - open);
  g += `<g transform="translate(${W0.x},${W0.top}) scale(${sx},1)"><rect width="${W0.w}" height="${W0.base - W0.top}" fill="#f6f2ea" stroke="${C.ink}" stroke-width="6"/><rect x="24" y="140" width="${W0.w - 48}" height="130" rx="8" fill="none" stroke="#d6cdbd" stroke-width="6"/><circle cx="${W0.w - 22}" cy="170" r="11" fill="#c9a24a" stroke="${C.ink}" stroke-width="3"/><g transform="translate(${W0.w / 2},74)"><circle r="42" fill="#3a8dde" stroke="${C.ink}" stroke-width="5"/>${T(0, 15, 40, 'WC', { sw: 0 })}</g></g>`;
  if (glow > 0) g += `<rect x="${W0.x - 4}" y="${W0.base - 14}" width="${W0.w + 8}" height="${16 + 8 * Math.sin(t * 20)}" fill="#ffd34a" opacity="${glow}" filter="url(#glow)"/><rect x="${W0.x + W0.w * sx - 4}" y="${W0.top}" width="${8 + 6 * glow}" height="${W0.base - W0.top}" fill="#ffd34a" opacity="${glow * .8}" filter="url(#glow)"/>`;
  g += `<path d="M${W0.x + W0.w / 2},${W0.top - 70} v22" stroke="#333" stroke-width="4"/>` + bulb(W0.x + W0.w / 2, W0.top - 40, '#fff3c0', 1, 11);
  return g;
}
function machaan(t, o = {}) {   // the half-built building + bamboo scaffold; o.plankAng/o.plankCrack/o.plankGone; o.net (green net sway)
  const { x0, x1, lv } = MCH, base = 1080;
  let g = castShadow((x0 + x1) / 2, base, x1 - x0, 200, .22);
  // grey concrete frame + brick infill (4 floors)
  g += `<rect x="${x0 + 30}" y="${lv[3] - 140}" width="${x1 - x0 - 60}" height="${base - lv[3] + 140}" fill="#c8c3bb" stroke="${C.ink}" stroke-width="6"/>`;
  for (let f = 0; f < 4; f++) { const y = lv[f] - 20; g += `<rect x="${x0 + 30}" y="${y}" width="${x1 - x0 - 60}" height="26" fill="#a9a49c" stroke="${C.ink}" stroke-width="4"/>`; }
  for (let f = 0; f < 4; f++) { const yt = (f === 3 ? lv[3] - 140 : lv[f + 1] + 6), yb = lv[f] - 20; for (let r = yt + 20; r < yb; r += 34) for (let c = x0 + 60 + ((r / 34) % 2) * 30; c < x1 - 90; c += 70) if (hs(c * .01 + r * .1 + f) > (f === 3 ? .55 : .15)) g += `<rect x="${c}" y="${r}" width="62" height="28" fill="#c0603a" stroke="#8a3f22" stroke-width="2"/>`; }
  [x0 + 30, (x0 + x1) / 2 - 15, x1 - 60].forEach(px => g += `<rect x="${px}" y="${lv[3] - 140}" width="30" height="${base - lv[3] + 140}" fill="#b5b0a8" stroke="${C.ink}" stroke-width="4"/>`);
  // rebar sticking out of the top
  for (let k = 0; k < 8; k++) g += `<path d="M${x0 + 50 + k * 110},${lv[3] - 140} v-60" stroke="#6b5040" stroke-width="5"/>`;
  // green safety net hanging on the left half (sways)
  const sw = 10 * Math.sin(t * 1.4);
  g += `<path d="M${x0 - 20},${lv[2] - 30} L${x0 + 330},${lv[2] - 30} L${x0 + 340 + sw},${base - 60} L${x0 - 10 + sw},${base - 60}Z" fill="#2e9e5a" opacity=".45" stroke="#1f6e3a" stroke-width="4"/>`;
  // bamboo verticals + diagonal braces + planks at each level + ladders
  for (let k = 0; k <= 5; k++) g += bamboo(x0 - 20 + k * (x1 - x0 + 40) / 5, base, lv[3] - 220, 16);
  for (let f = 0; f < 3; f++) g += `<path d="M${x0 - 20},${lv[f]} L${x1 + 20},${lv[f + 1]}" stroke="#c9a25a" stroke-width="10"/>`;
  lv.forEach((y, f) => { g += `<rect x="${x0 - 40}" y="${y}" width="${x1 - x0 + 80}" height="24" fill="#b07a46" stroke="${C.ink}" stroke-width="5"/><path d="M${x0 - 40},${y + 12} h${x1 - x0 + 80}" stroke="#8a5a32" stroke-width="3"/>`; });
  [[x0 + 120, base, lv[0]], [x1 - 160, lv[0], lv[1]], [x0 + 200, lv[1], lv[2]], [x1 - 260, lv[2], lv[3]]].forEach(([lx, ya, yb]) => { g += `<path d="M${lx},${ya} L${lx + 30},${yb} M${lx + 70},${ya} L${lx + 100},${yb}" stroke="#a87a3a" stroke-width="10"/>`; for (let r = 1; r < 8; r++) { const yy = ya + (yb - ya) * r / 8, xx = lx + 30 * r / 8; g += `<path d="M${xx},${yy} h70" stroke="#a87a3a" stroke-width="7"/>`; } });
  // the loose top plank (sticks out to the right)
  if (!o.plankGone) g += plankSvg(PLANK.x, PLANK.y, PLANK.len, o.plankAng || 0, o.plankCrack || 0);
  // sign + cement bags + sand heap + bricks at the foot
  g += `<rect x="${x0 + 360}" y="${lv[0] + 60}" width="230" height="90" rx="10" fill="#ffd34a" stroke="${C.ink}" stroke-width="5"/>${T(x0 + 475, lv[0] + 100, 30, 'KAAM CHALU HAI', { fill: '#222', sw: 0, font: 'Baloo2', weight: 800 })}${T(x0 + 475, lv[0] + 135, 26, 'DOOR RAHIYE', { fill: '#c8102e', sw: 0, font: 'Baloo2', weight: 800 })}`;
  g += `<path d="M${x1 - 330},${base} q120,-150 260,0z" fill="#e3c27a" stroke="${C.ink}" stroke-width="5"/>`;
  for (let k = 0; k < 5; k++) g += `<rect x="${x0 + 420 + (k % 3) * 70}" y="${base - 46 - Math.floor(k / 3) * 40}" width="66" height="44" rx="10" fill="#e9e4da" stroke="${C.ink}" stroke-width="4"/>`;
  return g;
}
function bazaarRow(t, cam, o = {}) {
  let g = `<rect x="-2600" y="1060" width="7000" height="60" fill="#9b7350"/>`;
  g += shopFront(-1900, 520, '#e5463b', '#ffd34a', 'CHAI', t, 1) + shopFront(-1320, 560, '#22a35a', '#fff', 'DAWAI', t, 2);
  g += `<rect x="-740" y="260" width="720" height="840" fill="${HCOL[3]}" stroke="${C.ink}" stroke-width="6"/><rect x="-660" y="360" width="200" height="200" fill="#5a8bb0" stroke="${C.ink}" stroke-width="5"/><rect x="-300" y="360" width="200" height="200" fill="#5a8bb0" stroke="${C.ink}" stroke-width="5"/><rect x="-520" y="760" width="170" height="320" rx="6" fill="#7a4a2a" stroke="${C.ink}" stroke-width="6"/>` + cooler(-170, 940);
  g += clinic(t, o) + machaan(t, o);
  g += shopFront(1960, 520, '#3b8de5', '#fff', 'SABZI', t, 4) + shopFront(2500, 560, '#b04ad6', '#ffd34a', 'KIRYANA', t, 5) + shopFront(3080, 560, '#ff7a2f', '#fff', 'MITHAI', t, 6);
  // electric pole + sagging wires above the row
  [-780, 1940, 3660].forEach(px => g += `<rect x="${px - 9}" y="0" width="18" height="1080" fill="#7d7d86" stroke="${C.ink}" stroke-width="3"/><rect x="${px - 60}" y="10" width="120" height="12" fill="#5d5d66"/>`);
  g += `<path d="M-780,20 Q580,160 1940,20 Q2800,150 3660,20 M-780,34 Q580,190 1940,34 Q2800,180 3660,34" stroke="#2a2a30" stroke-width="4" fill="none"/>`;
  // a crow on the wire, a kite stuck on the wire
  g += `<g transform="translate(2400,96)"><ellipse rx="24" ry="15" fill="#2a2a30"/><circle cx="18" cy="-12" r="10" fill="#2a2a30"/><path d="M27,-12 l12,4 -12,3z" fill="#e8a33a"/></g>` + patang(3000, 120, .5, 10 * Math.sin(t * 2), '#e5463b', '#ffd34a', { t });
  if (o.rowInner) g += o.rowInner;
  return layer(1.3, cam, g);
}
function bazaarGround(t, cam, o = {}) {
  let g = `<rect x="-2800" y="1080" width="7400" height="1700" fill="#d8c4a0"/>`;
  g += `<rect x="-2800" y="1080" width="7400" height="34" fill="#8d8d93"/><rect x="-2800" y="1112" width="7400" height="10" fill="#5a5a62"/>`;   // kerb + naali
  g += `<rect x="-2800" y="1380" width="7400" height="1400" fill="#6b6d74"/><path d="M-2800,1380 h7400" stroke="#cbb994" stroke-width="12"/>`;   // road
  for (let k = 0; k < 30; k++) g += `<rect x="${-2700 + k * 260}" y="1600" width="140" height="16" fill="#f4f1e6" opacity=".8"/>`;
  for (let k = 1; k < 7; k++) { const y = 1122 + 22 * (Math.pow(1.35, k) - 1); g += `<path d="M-2800,${y.toFixed(1)} H4600" stroke="#c6ad84" stroke-width="${1.5 + k * .5}"/>`; }
  for (let xx = -2800; xx < 4600; xx += 130) g += `<path d="M${xx},1122 L${xx - 120},1380" stroke="#c6ad84" stroke-width="3"/>`;
  for (let k = 0; k < 60; k++) { const px = -2600 + hs(k + 700) * 7000, py = 1140 + hs(k + 701) * 220; g += `<ellipse cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" rx="${5 + (k % 4) * 3}" ry="${3 + k % 3}" fill="#bfa478"/>`; }
  // parked rickshaw, cycle, Dharmender's skateboard (unless he's riding it), a stray dog, a cow in the far right
  g += castShadow(-1250, 1300, 300, 90, .2) + rickshaw(-1250, 1300, .9, 1, 0);
  g += `<g transform="translate(2650,1240)" fill="none" stroke="${C.ink}" stroke-width="7"><circle cx="-80" cy="-50" r="50"/><circle cx="80" cy="-50" r="50"/><path d="M-80,-50 L-20,-130 L60,-130 L80,-50 M-20,-130 L10,-50 L60,-130 M-30,-150 h30 M60,-130 L50,-170 h30" stroke="#e5463b"/></g>`;
  g += shadow(3300, 1250, 90, .8, { dx: -30, skew: 35 }) + dog({ x: 3300, y: 1248, s: .42, run: 0, t });
  for (let k = 0; k < 6; k++) g += lightPool(-1800 + k * 1100, 1180, 420, 90, .25, 'poolW');
  if (o.inner) g += o.inner;
  return layer(1, cam, g, { f: '' });
}
function bazaarFG(t, cam, o = {}) {
  let g = '';
  for (let k = -2; k < 6; k++) { const x0 = k * 1500; g += `<path d="M${x0},${60} Q${x0 + 750},${300} ${x0 + 1500},${90}" stroke="#1d1d22" stroke-width="9" fill="none"/><path d="M${x0},${150} Q${x0 + 750},${380} ${x0 + 1500},${170}" stroke="#1d1d22" stroke-width="7" fill="none"/>`;
    for (let b = 0; b < 2; b++) { const bx = x0 + 480 + b * 170, by = 60 + 4 * 240 * (bx - x0) / 1500 * (1 - (bx - x0) / 1500) - 20; g += `<g transform="translate(${bx},${by})"><ellipse rx="26" ry="16" fill="#2a2a30"/><circle cx="20" cy="-12" r="11" fill="#2a2a30"/><path d="M30,-12 l12,4 l-12,3z" fill="#e8a33a"/></g>`; } }
  if (!o.noBoug) g += `<g transform="rotate(${3 * Math.sin(t * 1.3)} -200 -100)">` + [[-120, 60, 120], [10, -40, 110], [-60, 180, 90]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2e7d32"/><circle cx="${x - 16}" cy="${y - 14}" r="${r * .6}" fill="#3c9a4a"/>${[...Array(5)].map((_, k) => `<circle cx="${x - r * .6 + hs(i * 9 + k) * r * 1.2}" cy="${y - r * .5 + hs(i * 7 + k + 3) * r}" r="${14 + 8 * hs(k + i)}" fill="#ff4f9a" stroke="#c2185b" stroke-width="3"/>`).join('')}`).join('') + '</g>';
  if (!o.noCrates) for (let k = -2; k < 6; k++) { const bx = 380 + k * 1250; g += `<g transform="translate(${bx},${o.fgY || 2000})"><rect x="-150" y="-150" width="300" height="150" fill="#b07a46" stroke="${C.ink}" stroke-width="6"/><path d="M-150,-100 h300 M-150,-50 h300" stroke="#7a5233" stroke-width="6"/>${[...Array(6)].map((_, m) => `<circle cx="${-110 + m * 44}" cy="${-160 - (m % 2) * 18}" r="26" fill="${['#e5463b', '#ffb330', '#43a047'][m % 3]}" stroke="${C.ink}" stroke-width="4"/>`).join('')}</g><g transform="translate(${bx + 640},${(o.fgY || 2000) - 20})"><path d="M-40,0 L-30,-80 H30 L40,0Z" fill="#c0603a" stroke="${C.ink}" stroke-width="5"/><circle cx="-14" cy="-110" r="44" fill="#2e7d32"/><circle cx="20" cy="-120" r="40" fill="#43a047"/></g>`; }
  return layer(.6, cam, g);
}
function bazaar(t, cam, o = {}) {
  const O = Object.assign({}, o, { farKites: kiteField(t, cam, 6, 10, -900, 400, .22, 9, -1500, 3500, 1), midKites: kiteField(t, cam, 3, 5, -1200, 200, .45, 23, -1500, 3500, 1) });
  const back = skyL(t, cam, o) + cityL(t, cam, O) + layer(6, cam, heatHaze(t, 780, 980, .1), { f: '' }) + veil(.3) + midRoofsL(t, cam, O) + veil(.15)
    + bazaarRow(t, cam, o)
    + (o.glow > 0 ? layer(1.3, cam, lightPool(CWC.x + CWC.w / 2, CWC.base + 40, 300 + 90 * o.glow + 240 * (o.open || 0), 70 + 40 * (o.open || 0), o.glow) + `<path d="M${CWC.x},${CWC.base} L${CWC.x + CWC.w},${CWC.base} L${CWC.x + CWC.w + 240},${CWC.base + 380} L${CWC.x - 240},${CWC.base + 380}Z" fill="#ffd34a" opacity="${.22 * o.glow + .3 * (o.open || 0)}" style="mix-blend-mode:screen"/>`, { f: '' }) : '')
    + layer(1, cam, shafts(SUN[0] + 300, -600, 2.1, 6, 2600, .1, t), { f: '' }) + bazaarGround(t, cam, o);
  return { back, front: (o.noFG ? '' : bazaarFG(t, cam, o)) + (o.motes !== false ? motes(t, 24, 0, 300, 1080, 1000, .5, 6) : '') };
}
const latifaS = skFn('latifa'), dharm = skFn('dharmender');
