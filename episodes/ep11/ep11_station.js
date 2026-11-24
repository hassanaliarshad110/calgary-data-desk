// SUSUMAN Episode 11 "Train Ka Safar" — the 2.5D RAILWAY STATION (Khushpur Jn.), the trains, GOLU the puppy, the sarson-field run-by.
// Layers (back → front): sky/sun 50 · clouds 12 · far city 6 · mid roofs 3 · far side 2.4 (station building, footbridge, platform 2) ·
// track 2 + Pari's green train 1.55 · track 1 (ballast, rails; the goods train / our blue train) 1.2 · PLATFORM 1 (action plane 1: lip, yellow line,
// tiles, WC booth, samosa stall, bench) · foreground .62 (canopy pillars, PLATFORM 1 board, clock, potted plants, trolley; blurred).
Object.assign(SPK, { MAMA: '#1f7a78', BABA: '#3d5a80', SAKINA: '#17917f', BASIM: '#e07a2c', LATIFA: '#8e44ad', DHARMENDER: '#e09a00', PARI: '#e0457b' });
Object.assign(SKS, { pari: 1.12, pariMa: 1.0, latifa: 1.06, dharmender: 1.08 });
const pariK = skFn('pari'), pariMaK = skFn('pariMa'), latifaK = skFn('latifa'), dharmK = skFn('dharmender');

// ---------- geometry (layer coords) ----------
const PL = { lip: 1115, yl: 1188, feet: 1330 };       // platform 1 (d=1): back lip, yellow safety line, where people stand
const T1 = { d: 1.2, far: 1012, near: 1084, bed0: 950 };  // track 1 rails (d=1.2)
const T2 = { d: 1.55, rail: 952 };                       // track 2 (d=1.55): wheels sit on y=rail
const WCB = { x: -1060, w: 210, top: 790, base: 1250 };  // station WC booth door (d=1)
const STALLX = 1640;                                     // samosa-chai stall (d=1)

// ---------- GOLU: white puppy with brown patches, red collar + bell (side view facing right; ground y=0) ----------
// o: run (leg cycle), bark 0..1, shiver, wag, sit, ears ('up'|'flat'), lick, look [dx,dy], tears, s, flip, rot
function golu(o) {
  o = Object.assign({ x: 0, y: 0, s: 1, flip: 1, t: 0, run: 0, bark: 0, shiver: 0, wag: 1, sit: 0, ears: 'up', lick: 0, look: [0, 0], tears: 0, rot: 0, jump: 0 }, o);
  const I = C.ink, W = '#fbf6ec', B = '#a5622e', t = o.t;
  const dx = o.shiver * 3.5 * Math.sin(t * 70);
  let g = `<g transform="translate(${(o.x + dx).toFixed(1)},${o.y.toFixed(1)}) rotate(${o.rot.toFixed(1)}) scale(${(o.s * o.flip).toFixed(3)},${o.s.toFixed(3)})">`;
  const a = o.run ? Math.sin(t * 26) * 30 : 0, sit = o.sit;
  // tail (wagging)
  const wg = o.wag * 22 * Math.sin(t * (o.shiver ? 30 : 16));
  g += `<g transform="translate(-58,${-62 + 20 * sit}) rotate(${-40 + wg})"><path d="M0,0 Q-14,-34 4,-56" stroke="${I}" stroke-width="17" fill="none" stroke-linecap="round"/><path d="M0,0 Q-14,-34 4,-56" stroke="${W}" stroke-width="9" fill="none" stroke-linecap="round"/></g>`;
  // legs (back legs fold when sitting)
  const leg = (lx, an, back) => `<g transform="translate(${lx},${-44 + (back ? 18 * sit : 0)}) rotate(${an + (back ? -50 * sit : 0)})"><rect x="-10" y="0" width="20" height="${46 - (back ? 16 * sit : 0)}" rx="9" fill="${W}" stroke="${I}" stroke-width="4.5"/><ellipse cx="3" cy="${46 - (back ? 16 * sit : 0)}" rx="13" ry="7" fill="${W}" stroke="${I}" stroke-width="4"/></g>`;
  g += leg(38, a + o.jump * 40, 0) + leg(-38, -a - o.jump * 40, 1);
  // body (tilts up when sitting)
  g += `<g transform="rotate(${-22 * sit} 30 -60)"><ellipse cx="0" cy="-66" rx="66" ry="34" fill="${W}" stroke="${I}" stroke-width="5"/><ellipse cx="-20" cy="-78" rx="26" ry="16" fill="${B}" opacity=".9"/></g>`;
  g += leg(20, -a + o.jump * 40, 0) + leg(-24, a - o.jump * 40, 1);
  // head
  const ear = o.ears === 'flat' ? 70 : 10 + 8 * Math.sin(t * 9);
  g += `<g transform="translate(${62},${-104 - 16 * sit})">`;
  g += `<ellipse cx="-4" cy="0" rx="44" ry="40" fill="${W}" stroke="${I}" stroke-width="5"/><ellipse cx="-14" cy="-12" rx="20" ry="18" fill="${B}"/>`;
  g += `<ellipse cx="32" cy="14" rx="24" ry="17" fill="${W}" stroke="${I}" stroke-width="4"/><ellipse cx="52" cy="6" rx="9" ry="7" fill="#1a1410"/>`;
  // eyes: big shiny puppy eyes (+ tears)
  const ex = o.look[0], ey = o.look[1];
  g += `<ellipse cx="8" cy="-8" rx="13" ry="15" fill="#fff" stroke="${I}" stroke-width="3"/><circle cx="${11 + ex}" cy="${-6 + ey}" r="9" fill="#1a1410"/><circle cx="${8 + ex}" cy="${-10 + ey}" r="3.4" fill="#fff"/>`;
  if (o.tears > 0) g += `<path d="M10,8 q-4,${14 + 4 * Math.sin(t * 9)} 2,${24}" stroke="#7fd0ff" stroke-width="5" fill="none" stroke-linecap="round" opacity="${o.tears}"/>`;
  // ear
  g += `<g transform="translate(-30,-26) rotate(${ear})"><path d="M0,0 Q-30,6 -26,46 Q-10,40 6,10Z" fill="${B}" stroke="${I}" stroke-width="4"/></g>`;
  // mouth
  if (o.bark > 0) g += `<path d="M22,30 Q40,${36 + 24 * o.bark} 58,26Z" fill="#7a1a2a" stroke="${I}" stroke-width="4"/>`;
  else if (o.lick > 0) g += `<path d="M30,28 Q40,34 50,28" stroke="${I}" stroke-width="3" fill="none"/><path d="M38,30 q8,${22 * o.lick} 18,${4 * o.lick}" fill="#ff7a9a" stroke="${I}" stroke-width="3"/>`;
  else g += `<path d="M28,28 Q38,${o.shiver ? 26 : 36} 48,28" stroke="${I}" stroke-width="3" fill="none"/>`;
  // collar + bell
  g += `<path d="M-38,22 Q-6,40 22,28" stroke="#e5463b" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="-6" cy="${40 + 2 * Math.sin(t * 20)}" r="8" fill="#ffd34a" stroke="${I}" stroke-width="3"/>`;
  g += '</g>';
  return g + '</g>';
}

// ---------- trains (side view; ground = rail top y; x = coach centre) ----------
const COACH = { L: 1080, H: 560 };
function coach(x, y, s, o = {}) {
  const I = C.ink, col = o.col || '#2e7d4f', st = o.stripe || '#ffd34a', L = COACH.L, H = COACH.H;
  let g = `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(4)})">`;
  // bogies + wheels
  for (const bx of [-L / 2 + 170, L / 2 - 170]) {
    g += `<rect x="${bx - 120}" y="-86" width="240" height="34" rx="8" fill="#2b2b30" stroke="${I}" stroke-width="5"/>`;
    for (const wx of [-70, 70]) { const r = o.roll || 0; g += `<circle cx="${bx + wx}" cy="-30" r="30" fill="#3a3a40" stroke="${I}" stroke-width="5"/><path d="M${bx + wx},-30 l${(22 * Math.cos(r)).toFixed(1)},${(22 * Math.sin(r)).toFixed(1)} M${bx + wx},-30 l${(-22 * Math.cos(r)).toFixed(1)},${(-22 * Math.sin(r)).toFixed(1)}" stroke="#8a8f99" stroke-width="6"/>`; }
  }
  // body
  g += `<rect x="${-L / 2}" y="${-H - 70}" width="${L}" height="${H}" rx="26" fill="${col}" stroke="${I}" stroke-width="8"/>`;
  g += `<path d="M${-L / 2 + 20},${-H - 70} Q0,${-H - 120} ${L / 2 - 20},${-H - 70}Z" fill="#c9ced6" stroke="${I}" stroke-width="6"/>`;
  g += `<rect x="${-L / 2}" y="-200" width="${L}" height="30" fill="${st}"/><rect x="${-L / 2}" y="${-H + 70}" width="${L}" height="14" fill="${st}" opacity=".9"/>`;
  // door at each end
  for (const dx of [-L / 2 + 30, L / 2 - 140]) g += `<rect x="${dx}" y="${-H - 40}" width="110" height="${H - 60}" rx="10" fill="${o.doorCol || '#1f5a39'}" stroke="${I}" stroke-width="5"/><rect x="${dx + 25}" y="${-H - 10}" width="60" height="100" rx="8" fill="#bfe6f2" stroke="${I}" stroke-width="4"/>`;
  // windows with bars; passengers (simple faces) unless o.win[k] is a function (custom content)
  const WN = 5;
  for (let k = 0; k < WN; k++) {
    const wx = -L / 2 + 180 + k * 150, wy = -H - 10;
    g += `<rect x="${wx}" y="${wy}" width="118" height="150" rx="12" fill="#2a3b4a" stroke="${I}" stroke-width="5"/>`;
    if (o.win && o.win[k]) g += o.win[k](wx + 59, wy + 75);
    else if (o.faces !== false && (k + (o.seed || 0)) % 2 === 0) g += kface(wx + 59, wy + 92, 30, o.t || 0, { skin: ['#b07248', '#d7a27a', '#8d5a3b', '#c98b5c'][(k + (o.seed || 0)) % 4], girl: (k + (o.seed || 0)) % 3 === 1, m: o.mood || 'smile', shirt: ['#e5463b', '#3b8de5', '#ffd34a'][k % 3] });
    g += `<rect x="${wx}" y="${wy}" width="118" height="150" rx="12" fill="#cfefff" opacity=".18"/>` + [1, 2, 3].map(b => `<path d="M${wx + b * 29.5},${wy} v150" stroke="#9aa3ad" stroke-width="4" opacity=".85"/>`).join('');
  }
  if (o.label) g += T(0, -122, 44, o.label, { fill: '#fff', sw: 6, ls: 3 });
  return g + '</g>';
}
function loco(x, y, s, o = {}) {   // diesel engine facing right (o.flip=-1 faces left); o.beam 0..1 headlight flare
  const I = C.ink, col = o.col || '#2f6fd1', st = o.stripe || '#ffd34a', f = o.flip || 1;
  let g = `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(s * f).toFixed(4)},${s.toFixed(4)})">`;
  for (const bx of [-300, 300]) { g += `<rect x="${bx - 150}" y="-90" width="300" height="40" rx="10" fill="#2b2b30" stroke="${I}" stroke-width="5"/>`; for (const wx of [-90, 0, 90]) g += `<circle cx="${bx + wx}" cy="-32" r="32" fill="#3a3a40" stroke="${I}" stroke-width="5"/>`; }
  g += `<path d="M-560,-90 V-560 Q-560,-600 -520,-600 H330 Q440,-600 480,-520 L560,-300 V-90Z" fill="${col}" stroke="${I}" stroke-width="8"/>`;
  g += `<path d="M330,-560 L430,-560 Q460,-520 480,-470 L330,-470Z" fill="#bfe6f2" stroke="${I}" stroke-width="5"/>`;
  g += `<rect x="-560" y="-250" width="1120" height="40" fill="${st}"/><rect x="-560" y="-210" width="1120" height="16" fill="#e5463b"/>`;
  for (let k = 0; k < 6; k++) g += `<rect x="${-500 + k * 120}" y="-520" width="90" height="70" rx="6" fill="#20324a" stroke="${I}" stroke-width="4" opacity=".85"/>${[1, 2, 3].map(b => `<path d="M${-500 + k * 120 + b * 22},-520 v70" stroke="#6a7a8a" stroke-width="3"/>`).join('')}`;
  g += `<rect x="520" y="-150" width="70" height="56" rx="10" fill="#9aa3ad" stroke="${I}" stroke-width="5"/>`;
  // headlight + horn
  g += `<circle cx="540" cy="-380" r="34" fill="#fffbe0" stroke="${I}" stroke-width="5"/><rect x="250" y="-640" width="70" height="40" rx="8" fill="#9aa3ad" stroke="${I}" stroke-width="4"/>`;
  if (o.beam > 0) g += `<circle cx="540" cy="-380" r="${(170 + 60 * Math.sin((o.t || 0) * 18)) * o.beam}" fill="url(#poolW)" opacity="${(.9 * o.beam).toFixed(2)}" style="mix-blend-mode:screen"/><path d="M570,-380 L1500,-700 L1500,-60Z" fill="#fff8d0" opacity="${(.28 * o.beam).toFixed(2)}" style="mix-blend-mode:screen"/>`;
  if (o.horn > 0) g += `<g opacity="${o.horn.toFixed(2)}">${[0, 1, 2].map(k => `<path d="M${330 + 40 * k},${-700 - 30 * k} q30,-30 60,0" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
  return g + '</g>';
}
function wagon(x, y, s, o = {}) {   // brown goods wagon
  const I = C.ink, L = 1000;
  let g = `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(4)})">`;
  for (const bx of [-L / 2 + 160, L / 2 - 160]) { g += `<rect x="${bx - 110}" y="-84" width="220" height="32" rx="8" fill="#2b2b30" stroke="${I}" stroke-width="5"/>`; for (const wx of [-60, 60]) g += `<circle cx="${bx + wx}" cy="-30" r="30" fill="#3a3a40" stroke="${I}" stroke-width="5"/>`; }
  g += `<rect x="${-L / 2}" y="-560" width="${L}" height="480" rx="12" fill="${o.col || '#8a4a2a'}" stroke="${I}" stroke-width="8"/>`;
  for (let k = 1; k < 8; k++) g += `<path d="M${-L / 2 + k * L / 8},-560 v480" stroke="#6e3a20" stroke-width="6"/>`;
  g += `<rect x="-120" y="-500" width="240" height="380" fill="#7a4024" stroke="${I}" stroke-width="5"/><path d="M-120,-500 L120,-120 M120,-500 L-120,-120" stroke="#6e3a20" stroke-width="6"/>`;
  g += T(-300, -430, 40, o.label || 'MAAL', { fill: '#ffe9c0', sw: 0, ls: 3 });
  return g + '</g>';
}
// a whole train on a track layer: list of cars from the front (engine) backwards; x = front of the engine (moving right). Returns layer svg (layer coords).
function trainSvg(xFront, y, s, cars, t, o = {}) {
  let g = '', x = xFront;
  for (const c of cars) {
    const L = (c.k === 'loco' ? 1140 : c.k === 'wagon' ? 1010 : COACH.L + 20) * s;
    const cx = x - L / 2;
    if (cx + L > (o.minX ?? -4000) && cx - L < (o.maxX ?? 5000)) {
      if (c.k === 'loco') g += loco(cx, y, s, Object.assign({ t }, c, o.locoO || {}));
      else if (c.k === 'wagon') g += wagon(cx, y, s, c);
      else g += coach(cx, y, s, Object.assign({ t, roll: x / 30 }, c));
    }
    x -= L;
  }
  return g;
}

// ---------- the WC booth on platform 1 (door glow + flush), the samosa stall, bench, luggage ----------
function wcBoothS(t, o = {}) {
  const W0 = WCB, open = o.open || 0, glow = o.glow || 0, I = C.ink;
  let g = castShadow(W0.x + W0.w / 2, W0.base, 420, 140, .22);
  g += `<rect x="${W0.x - 110}" y="${W0.top - 170}" width="${W0.w + 220}" height="${W0.base - W0.top + 170}" fill="#e9dcc4" stroke="${I}" stroke-width="6"/>`;
  g += `<path d="M${W0.x - 140},${W0.top - 170} H${W0.x + W0.w + 140} L${W0.x + W0.w + 110},${W0.top - 220} H${W0.x - 110}Z" fill="#b5462e" stroke="${I}" stroke-width="5"/>`;
  for (let k = 0; k < 5; k++) g += `<path d="M${W0.x - 110},${W0.top - 120 + k * 90} h${W0.w + 220}" stroke="#d6c7aa" stroke-width="4"/>`;
  g += `<rect x="${W0.x - 14}" y="${W0.top - 14}" width="${W0.w + 28}" height="${W0.base - W0.top + 14}" fill="#2f6fd1" stroke="${I}" stroke-width="5"/><rect x="${W0.x}" y="${W0.top}" width="${W0.w}" height="${W0.base - W0.top}" fill="#1a1410"/>`;
  if (glow > 0) g += `<rect x="${W0.x}" y="${W0.top}" width="${W0.w}" height="${W0.base - W0.top}" fill="#ffe08a" opacity="${clamp(glow * open * 1.3)}"/>`;
  const sx = Math.max(.03, 1 - open);
  g += `<g transform="translate(${W0.x},${W0.top}) scale(${sx},1)"><rect width="${W0.w}" height="${W0.base - W0.top}" fill="#f6f2ea" stroke="${I}" stroke-width="6"/><rect x="24" y="170" width="${W0.w - 48}" height="150" rx="8" fill="none" stroke="#d6cdbd" stroke-width="6"/><circle cx="${W0.w - 22}" cy="230" r="11" fill="#c9a24a" stroke="${I}" stroke-width="3"/><g transform="translate(${W0.w / 2},84)"><circle r="44" fill="#3a8dde" stroke="${I}" stroke-width="5"/>${T(0, 15, 42, 'WC', { sw: 0 })}</g></g>`;
  // little man/woman icons beside the door
  const icon = (x, y, girl) => `<g transform="translate(${x},${y})"><circle cx="0" cy="-48" r="13" fill="#2f6fd1"/>${girl ? '<path d="M-18,-30 h36 l10,46 h-56z" fill="#e5463b"/>' : '<rect x="-15" y="-32" width="30" height="46" rx="6" fill="#2f6fd1"/>'}<rect x="-12" y="14" width="9" height="30" fill="${girl ? '#e5463b' : '#2f6fd1'}"/><rect x="3" y="14" width="9" height="30" fill="${girl ? '#e5463b' : '#2f6fd1'}"/></g>`;
  g += `<rect x="${W0.x - 96}" y="${W0.top + 10}" width="70" height="130" rx="10" fill="#fff" stroke="${I}" stroke-width="4"/>${icon(W0.x - 61, W0.top + 115, 0)}<rect x="${W0.x + W0.w + 26}" y="${W0.top + 10}" width="70" height="130" rx="10" fill="#fff" stroke="${I}" stroke-width="4"/>${icon(W0.x + W0.w + 61, W0.top + 115, 1)}`;
  if (glow > 0) g += `<rect x="${W0.x - 4}" y="${W0.base - 14}" width="${W0.w + 8}" height="${16 + 8 * Math.sin(t * 20)}" fill="#ffd34a" opacity="${glow}" filter="url(#glow)"/><rect x="${W0.x + W0.w * sx - 4}" y="${W0.top}" width="${8 + 6 * glow}" height="${W0.base - W0.top}" fill="#ffd34a" opacity="${glow * .8}" filter="url(#glow)"/>` + lightPool(W0.x + W0.w / 2, W0.base + 20, 260 + 60 * open, 50, glow);
  return g + `<path d="M${W0.x + W0.w / 2},${W0.top - 70} v22" stroke="#333" stroke-width="4"/>` + bulb(W0.x + W0.w / 2, W0.top - 40, '#fff3c0', 1, 11);
}
function samosaStall(t, x) {
  const I = C.ink, base = 1250;
  let g = castShadow(x, base, 380, 120, .22);
  g += `<rect x="${x - 190}" y="${base - 300}" width="380" height="300" rx="12" fill="#d8572a" stroke="${I}" stroke-width="6"/><rect x="${x - 200}" y="${base - 320}" width="400" height="34" rx="8" fill="#ffd34a" stroke="${I}" stroke-width="5"/>`;
  g += `<rect x="${x - 170}" y="${base - 680}" width="18" height="380" fill="#8a5a32" stroke="${I}" stroke-width="4"/><rect x="${x + 152}" y="${base - 680}" width="18" height="380" fill="#8a5a32" stroke="${I}" stroke-width="4"/>`;
  g += `<path d="M${x - 240},${base - 640} H${x + 240} L${x + 200},${base - 720} H${x - 200}Z" fill="#fff" stroke="${I}" stroke-width="5"/>` + [...Array(6)].map((_, k) => `<path d="M${x - 240 + k * 80},${base - 640} l40,0 l-30,-80 h-40z" fill="#e5463b" opacity=".9"/>`).join('');
  g += `<rect x="${x - 150}" y="${base - 600}" width="300" height="70" rx="10" fill="#1f5a39" stroke="${I}" stroke-width="5"/>${T(x, base - 552, 40, 'CHAI • SAMOSA', { fill: '#ffd34a', sw: 0, ls: 2 })}`;
  // kadhai with samosas + steam, kettle
  g += `<ellipse cx="${x - 60}" cy="${base - 330}" rx="110" ry="30" fill="#333" stroke="${I}" stroke-width="5"/>` + [...Array(6)].map((_, k) => `<path d="M${x - 140 + k * 32},${base - 336} l16,-34 l16,34z" fill="#e8b45a" stroke="${I}" stroke-width="3"/>`).join('');
  for (let k = 0; k < 3; k++) { const p = (t * .6 + k / 3) % 1; g += `<path d="M${x - 90 + k * 30},${base - 380 - p * 140} q-14,-20 0,-40" stroke="#fff" stroke-width="8" fill="none" opacity="${.5 * (1 - p)}" stroke-linecap="round"/>`; }
  g += `<path d="M${x + 60},${base - 330} q0,-70 50,-70 q50,0 50,70z" fill="#c9cfd6" stroke="${I}" stroke-width="5"/><path d="M${x + 160},${base - 380} l40,-30" stroke="${I}" stroke-width="8"/>`;
  return g;
}
const samosaPlate = (x, y, s) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(3)})"><ellipse cx="0" cy="0" rx="64" ry="16" fill="#e9dcc4" stroke="${C.ink}" stroke-width="4"/>${[-30, 0, 30].map(k => `<path d="M${k - 22},-4 l22,-40 l22,40z" fill="#e8b45a" stroke="${C.ink}" stroke-width="3"/>`).join('')}</g>`;
function suitcase(x, y, s, col = '#c0392b', rot = 0) {
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot}) scale(${s.toFixed(3)})"><rect x="-90" y="-150" width="180" height="150" rx="16" fill="${col}" stroke="${C.ink}" stroke-width="5"/><path d="M-40,-150 v-24 h80 v24" stroke="${C.ink}" stroke-width="8" fill="none"/><path d="M-90,-110 h180 M-90,-40 h180" stroke="#00000033" stroke-width="6"/><circle cx="-60" cy="4" r="9" fill="#333"/><circle cx="60" cy="4" r="9" fill="#333"/></g>`;
}
function bench(x, y) { const I = C.ink; return castShadow(x, y, 360, 90, .2) + `<rect x="${x - 180}" y="${y - 150}" width="360" height="26" rx="8" fill="#2e7d4f" stroke="${I}" stroke-width="5"/><rect x="${x - 180}" y="${y - 230}" width="360" height="22" rx="8" fill="#2e7d4f" stroke="${I}" stroke-width="5"/><rect x="${x - 160}" y="${y - 210}" width="14" height="210" fill="#555" stroke="${I}" stroke-width="3"/><rect x="${x + 146}" y="${y - 210}" width="14" height="210" fill="#555" stroke="${I}" stroke-width="3"/>`; }

// ---------- layers ----------
function farSideL(t, cam, o = {}) {   // d=2.4: station building, the big name board, footbridge, platform 2 people
  const I = C.ink;
  let g = `<rect x="-3200" y="560" width="8400" height="380" fill="#f1dcb6" stroke="${I}" stroke-width="5"/>`;
  for (let k = 0; k < 40; k++) { const ax = -3100 + k * 210; g += `<path d="M${ax},900 V700 Q${ax + 80},620 ${ax + 160},700 V900Z" fill="#c98a5a" stroke="${I}" stroke-width="4"/>`; }
  g += `<rect x="-3200" y="520" width="8400" height="50" fill="#b5462e" stroke="${I}" stroke-width="5"/>`;
  // name board (yellow, black letters — the desi railway look)
  g += `<rect x="120" y="360" width="760" height="150" rx="10" fill="#ffd34a" stroke="${I}" stroke-width="7"/><rect x="160" y="510" width="16" height="60" fill="#333"/><rect x="824" y="510" width="16" height="60" fill="#333"/>${T(500, 465, 96, 'KHUSHPUR JN.', { fill: '#111', sw: 0, ls: 6 })}`;
  // station clock tower
  g += `<rect x="1500" y="210" width="220" height="360" fill="#f1dcb6" stroke="${I}" stroke-width="5"/><path d="M1480,210 L1610,110 L1740,210Z" fill="#b5462e" stroke="${I}" stroke-width="5"/><circle cx="1610" cy="320" r="70" fill="#fff" stroke="${I}" stroke-width="6"/><path d="M1610,320 l0,-48 M1610,320 l${(34 * Math.cos(t * .3)).toFixed(1)},${(34 * Math.sin(t * .3)).toFixed(1)}" stroke="${I}" stroke-width="7" stroke-linecap="round"/>`;
  // platform 2 edge + a few waiting people (flat style)
  g += `<rect x="-3200" y="900" width="8400" height="40" fill="#cfc4b0" stroke="${I}" stroke-width="4"/><rect x="-3200" y="912" width="8400" height="8" fill="#ffd34a"/>`;
  for (let k = 0; k < 14; k++) { const px = -2400 + k * 410 + 40 * hs(k); g += crowdP(px, 905, .55, k + 3, t); }
  // footbridge: iron truss across the tracks high up
  g += `<rect x="-3200" y="70" width="8400" height="70" fill="#5a6b7a" stroke="${I}" stroke-width="5"/>` + [...Array(60)].map((_, k) => `<path d="M${-3200 + k * 140},140 l70,-70 l70,70" stroke="#3f4d5a" stroke-width="7" fill="none"/>`).join('') + `<rect x="-3200" y="138" width="8400" height="14" fill="#3f4d5a"/>`;
  for (const sx of [-2200, -500, 2600]) g += `<rect x="${sx}" y="140" width="60" height="420" fill="#5a6b7a" stroke="${I}" stroke-width="4"/>`;
  return layer(2.4, cam, g);
}
function track2L(t, cam, o = {}) {   // d=1.55
  const I = C.ink, y = T2.rail;
  let g = `<rect x="-3600" y="${y - 30}" width="9000" height="140" fill="#8d8478"/>` + [...Array(110)].map((_, k) => `<rect x="${-3600 + k * 84}" y="${y - 4}" width="44" height="22" fill="#6b5a48"/>`).join('');
  g += `<rect x="-3600" y="${y - 10}" width="9000" height="10" fill="#b9c0c8" stroke="${I}" stroke-width="2"/><rect x="-3600" y="${y + 26}" width="9000" height="10" fill="#b9c0c8" stroke="${I}" stroke-width="2"/>`;
  // overhead wire masts
  for (let k = 0; k < 12; k++) { const mx = -3200 + k * 780; g += `<rect x="${mx}" y="${y - 760}" width="20" height="760" fill="#6b7680" stroke="${I}" stroke-width="3"/><path d="M${mx},${y - 730} h160" stroke="#6b7680" stroke-width="8"/>`; }
  g += `<path d="M-3600,${y - 700} H5400" stroke="#333" stroke-width="3"/><path d="M-3600,${y - 680} H5400" stroke="#333" stroke-width="2" opacity=".7"/>`;
  if (o.train2) g += o.train2;
  return layer(T2.d, cam, g);
}
function track1L(t, cam, o = {}) {   // d=1.2: the pit (ballast + rails) right behind platform 1's lip
  const I = C.ink;
  let g = `<rect x="-3600" y="${T1.bed0}" width="9000" height="260" fill="#9a8f80"/>`;
  for (let k = 0; k < 140; k++) { const sx = -3600 + k * 66; g += `<path d="M${sx},${T1.far + 6} L${sx - 14},${T1.near + 18} h34 L${sx + 30},${T1.far + 6}Z" fill="#6b5a48" stroke="${I}" stroke-width="2"/>`; }
  for (let k = 0; k < 90; k++) g += `<circle cx="${-3600 + k * 101 + 37 * hs(k)}" cy="${T1.far + 30 + 40 * hs(k + 7)}" r="${4 + 4 * hs(k + 3)}" fill="#7d7266"/>`;
  g += `<rect x="-3600" y="${T1.far - 8}" width="9000" height="12" fill="#c9d0d8" stroke="${I}" stroke-width="3"/><rect x="-3600" y="${T1.near - 10}" width="9000" height="16" fill="#c9d0d8" stroke="${I}" stroke-width="3"/>`;
  if (o.inner1) g += o.inner1;
  if (o.train1) g += o.train1;
  return layer(T1.d, cam, g);
}
function platform1L(t, cam, o = {}) {   // d=1
  const I = C.ink;
  let g = `<rect x="-3600" y="${PL.lip}" width="9000" height="1600" fill="#d4c8b2"/>`;
  for (let k = 0; k < 9; k++) g += `<path d="M-3600,${PL.lip + 120 + k * k * 22} H5400" stroke="#c2b59c" stroke-width="${3 + k}"/>`;
  for (let k = 0; k < 70; k++) g += `<path d="M${-3600 + k * 140},${PL.lip + 40} l${-60 - k % 3 * 10},900" stroke="#c2b59c" stroke-width="4"/>`;
  g += `<rect x="-3600" y="${PL.lip}" width="9000" height="34" fill="#efe6d8" stroke="${I}" stroke-width="5"/><path d="M-3600,${PL.lip + 34} H5400" stroke="#8d8270" stroke-width="6"/>`;
  g += [...Array(110)].map((_, k) => `<rect x="${-3600 + k * 84}" y="${PL.yl}" width="56" height="16" fill="#ffd34a" stroke="#c9a24a" stroke-width="2"/>`).join('');
  g += wcBoothS(t, o) + samosaStall(t, STALLX) + bench(260, 1270) + (o.luggage !== false ? suitcase(150, 1262, .8, '#c0392b') + suitcase(330, 1262, .62, '#2f6fd1', 4) : '');
  if (o.inner) g += o.inner;
  return layer(1, cam, g);
}
function stationFG(t, cam, o = {}) {   // d=.62: canopy pillars at the frame edges + the roof fringe along the top (blurred, frames the shot)
  const I = C.ink;
  let g = '';
  g += `<rect x="-3600" y="-600" width="9000" height="900" fill="#4a5966" stroke="${I}" stroke-width="5"/>` + [...Array(120)].map((_, k) => `<path d="M${-3600 + k * 76},300 q38,46 76,0" fill="#6b7a88" stroke="${I}" stroke-width="3"/>`).join('');
  if (o.fgInner) g += o.fgInner;
  return layer(.62, cam, g);
}
function station(t, cam, o = {}) {
  const back = skyL(t, cam, o) + cityL(t, cam, {}) + veil(.3) + midRoofsL(t, cam, {}) + veil(.22) + farSideL(t, cam, o) + veil(.14)
    + track2L(t, cam, o) + veil(.06) + track1L(t, cam, o) + platform1L(t, cam, o);
  return { back, front: (o.noFG ? '' : stationFG(t, cam, o)) + (o.motes !== false ? motes(t, 18, 0, 300, 1080, 1000, .45, 9) : '') };
}
// camera: put the platform-1 point (X, PL.feet) at screen (sx, sy)
const camS = (X, z = 1, sy = 1150, sx = 540, Y = PL.feet) => ({ x: X - sx, y: Y - sy, z, px: sx, py: sy });
const P1 = (cam, x, fn, o, sh = { w: 100 }, dy = 0, d = 1) => at(d, cam, x, PL.feet + dy, fn, o, sh);
// a point on a track layer to screen
const onT1 = (cam, x, y) => proj(T1.d, cam, x, y);

// ---------- Pari's train (track 2): moving right; her coach's window index 2. Global position by absolute time ----------
const PCAR = 3;   // Pari's coach = 4th car behind the engine

function pariCars(t, pMood) {
  const cars = [{ k: 'loco', col: '#2e7d4f', stripe: '#ffd34a' }];
  for (let i = 0; i < 9; i++) cars.push({ k: 'coach', col: '#2e7d4f', seed: i, t, mood: i === PCAR - 1 ? 'smile' : 'smile', win: i === PCAR - 1 ? { 2: pMood } : null, label: '' });
  cars.push({ k: 'coach', col: '#7a1f2a', faces: false, label: 'GUARD' });
  return cars;
}
// Pari (+ her Mama) inside a window: the studio sprites clipped to the window rect; cx,cy = window centre (local coach coords, scale 1)
let _clipN = 0;
function pariWin(t, o = {}) {
  return (cx, cy) => {
    const id = 'pw' + (_clipN++);
    let inner = `<rect x="${cx - 59}" y="${cy - 75}" width="118" height="150" fill="#3d5266"/>`;
    if (o.ma) inner += pariMaK({ x: cx + 40, y: cy + 380, s: .62, t, move: o.maMove || 'idle', mt: t, yaw: -.2, expr: o.maExpr || 'surprised' });
    inner += pariK({ x: cx - 6, y: cy + 210, s: .78, t, move: o.move || 'cry', mt: t, yaw: .25, expr: o.expr || 'cry', amp: o.amp || 0 });
    return `<clipPath id="${id}"><rect x="${cx - 59}" y="${cy - 75}" width="118" height="150" rx="12"/></clipPath><g clip-path="url(#${id})">${inner}</g>`;
  };
}

// ---------- the run-by: sarson fields outside town (Pari's train at d=1, Susuman flies alongside) ----------
function fieldsBg(t, cam, speedX) {   // speedX = how far the land has scrolled (world px at d=1)
  const I = C.ink, sc = (d, w) => ((-speedX / d) % w + w) % w;
  let g = layer(50, { ...cam, x: 0 }, `<rect x="-1500" y="-2600" width="4100" height="5200" fill="url(#skyK)"/><circle cx="${SUN[0]}" cy="${SUN[1]}" r="300" fill="url(#sunG)"/><circle cx="${SUN[0]}" cy="${SUN[1]}" r="66" fill="#fffbe8"/>`, { f: '' });
  // far hills (d=8)
  let h = ''; const o8 = sc(8, 1600);
  for (let k = -2; k < 5; k++) { const x = -1600 + k * 1600 + o8; h += `<path d="M${x},900 Q${x + 400},640 ${x + 800},880 Q${x + 1200},700 ${x + 1600},900 V1400 H${x}Z" fill="#9fc3a8"/>`; }
  g += layer(8, { ...cam, x: 0 }, h, { f: 'dof6' }) + veil(.3);
  // trees + village huts (d=3)
  let tr = ''; const o3 = sc(3, 700);
  for (let k = -3; k < 6; k++) { const x = -700 + k * 700 + o3; tr += `<rect x="${x + 90}" y="830" width="24" height="140" fill="#6b4a2a"/><circle cx="${x + 102}" cy="800" r="90" fill="#3f8f4a" stroke="${I}" stroke-width="4"/><circle cx="${x + 60}" cy="830" r="60" fill="#4ea85a"/>`; if (k % 2 === 0) tr += `<rect x="${x + 330}" y="880" width="140" height="100" fill="#e6c79a" stroke="${I}" stroke-width="4"/><path d="M${x + 310},890 L${x + 400},820 L${x + 490},890Z" fill="#b5822e" stroke="${I}" stroke-width="4"/>`; }
  g += layer(3, { ...cam, x: 0 }, `<rect x="-1500" y="960" width="4100" height="1200" fill="#cfe08a"/>` + tr) + veil(.12);
  // mustard field (yellow, d=1.6) with telegraph poles whipping past
  let f = `<rect x="-1500" y="1000" width="4100" height="1200" fill="#f2cf2a"/>`; const o16 = sc(1.6, 120);
  for (let r = 0; r < 4; r++) for (let k = -2; k < 34; k++) f += `<circle cx="${-1500 + k * 120 + o16 + r * 60}" cy="${1010 + r * 40}" r="${26 + r * 6}" fill="${r % 2 ? '#ffe04a' : '#e8b91a'}"/>`;
  const op = sc(1.6, 900);
  for (let k = -2; k < 5; k++) { const x = -900 + k * 900 + op; f += `<rect x="${x}" y="620" width="16" height="420" fill="#6b4a2a" stroke="${I}" stroke-width="3"/><path d="M${x - 40},650 h96" stroke="#6b4a2a" stroke-width="8"/>`; }
  f += `<path d="M-1500,660 Q-600,700 300,660 Q1200,700 2600,660" stroke="#333" stroke-width="3" fill="none"/>`;
  g += layer(1.6, { ...cam, x: 0 }, f);
  return g;
}
function fieldsFG(t, cam, speedX) {   // blurred grass + track-side stones rushing past (d=.6)
  const sc = ((-speedX / .6) % 300 + 300) % 300; let g = '';
  for (let k = -3; k < 14; k++) { const x = -1000 + k * 300 + sc; g += `<path d="M${x},2000 q20,-260 50,-330 q10,120 20,330z M${x + 90},2000 q-10,-200 30,-280 q0,100 10,280z" fill="#3f8f4a"/>`; }
  return layer(.6, { ...cam, x: 0 }, g);
}
