// SUSUMAN Episode 1 — "Mano Billi Ko Bachao". New cast + gali set + 11 scenes.
const GY = 1060;
const KS = 1.25;  // cast scale in the gali              // street line (screen y) before any up-shift
const SPK = { QASIM: C.red, AMMI: '#1f7a78', BUNTY: '#2f6fd1', GUDDU: '#e0a020' };
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
  let g = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  g += `<circle cx="${860 - camX * .05}" cy="250" r="90" fill="#fff3c4" opacity=".9"/><circle cx="${860 - camX * .05}" cy="250" r="150" fill="#fff3c4" opacity=".25"/>`;
  for (let i = 0; i < 5; i++) { const cx = ((i * 520 + t * 14 - camX * .1) % 2600 + 2600) % 2600 - 300, cy = 140 + i * 70 % 210; g += `<g fill="#fff" opacity=".9"><ellipse cx="${cx}" cy="${cy}" rx="110" ry="34"/><ellipse cx="${cx + 60}" cy="${cy - 20}" rx="70" ry="38"/><ellipse cx="${cx - 50}" cy="${cy - 12}" rx="60" ry="28"/></g>`; }
  // kites
  [[300, 300, '#e5463b'], [980, 220, '#3b8de5'], [1700, 330, '#22a35a'], [2500, 260, '#e5b23b']].forEach(([kx, ky, c], i) => {
    const x = kx - camX * .25 + 20 * Math.sin(t * .9 + i), y = ky + 14 * Math.sin(t * 1.3 + i * 2), r = 10 * Math.sin(t * 1.1 + i);
    if (x < -100 || x > 1180) return;
    g += `<path d="M${x},${y + 36} Q${x - 60},${y + 300} ${x - 160},${y + 700}" stroke="#555" stroke-width="2" fill="none" opacity=".5"/><g transform="rotate(${r} ${x} ${y})"><path d="M${x},${y - 40} L${x + 32},${y} L${x},${y + 40} L${x - 32},${y}Z" fill="${c}" stroke="${C.ink}" stroke-width="4"/><path d="M${x},${y - 40} V${y + 40} M${x - 32},${y} H${x + 32}" stroke="#fff" stroke-width="2" opacity=".7"/><path d="M${x},${y + 40} q-10,20 4,36" stroke="${c}" stroke-width="5" fill="none"/></g>`;
  });
  // birds
  for (let i = 0; i < 6; i++) { const bx = ((i * 140 + t * 90 - camX * .5) % 1600 + 1600) % 1600 - 200, by = 380 + 30 * Math.sin(i * 2 + t), f = 14 * Math.sin(t * 12 + i); g += `<path d="M${bx - 18},${by - f} Q${bx - 8},${by - 6} ${bx},${by} Q${bx + 8},${by - 6} ${bx + 18},${by - f}" stroke="#333" stroke-width="4" fill="none" stroke-linecap="round"/>`; }
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
  g += `<rect x="${camX - 400}" y="${GY}" width="1900" height="1100" fill="#e2c99b"/>`;
  for (let i = 0; i < 120; i++) { const sx = i * 37 % 3400 - 200, sy = GY + 30 + (i * 61 % 820); if (sx > camX - 60 && sx < camX + 1140) g += `<ellipse cx="${sx}" cy="${sy}" rx="${5 + i % 4 * 3}" ry="${3 + i % 3}" fill="#bfa478"/>`; }
  g += `<path d="M${camX - 400},${GY + 4} H${camX + 1500}" stroke="#a88f68" stroke-width="10"/>`;
  g += `<path d="M830,${GY + 30} L800,${GY + 420}" stroke="#fff" stroke-width="12" stroke-dasharray="40 18" opacity=".9"/>`;      // boundary line
  g += `<g transform="translate(470,${GY + 170})"><rect x="0" y="0" width="70" height="34" fill="#b5462e" stroke="${C.ink}" stroke-width="4"/><rect x="0" y="-34" width="70" height="34" fill="#c3533a" stroke="${C.ink}" stroke-width="4"/><rect x="0" y="-68" width="70" height="34" fill="#b5462e" stroke="${C.ink}" stroke-width="4"/></g>`; // brick stumps
  if (o.score) g += `<g transform="translate(600,${GY - 400}) rotate(-3)">${T(0, 0, 54, o.score, { font: 'Bangers', fill: '#fff', stroke: '#555', sw: 3, ls: 2 })}</g>`;
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
