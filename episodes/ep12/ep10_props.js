// SUSUMAN Episode 10 "School Ka Pehla Din" — new props + cast: the yellow SCHOOL VAN (kids in the windows, detachable rear bumper),
// Ammar mistri's naali trench (khadda) at the bottom of the dhalaan, the school gate at the chowk, Noor (new kid) + the van driver,
// and a tiny railway-platform set for the Ep 11 cliffhanger flash.
Object.assign(SPK, { MAMA: '#1f7a78', BABA: '#3d5a80', SAKINA: '#17917f', BASIM: '#e07a2c', AMMAR: '#d08a00', 'ZAHRA MISS': '#457b9d', NOOR: '#d6337a' });
Object.assign(SKS, { noor: 1.12, driver: 1.0, baba: 1.0, babaKurta: 1.0 });
const noor = skFn('noor'), driver = skFn('driver');

// ---------- a kid's face in a van window (local coords, r = head radius) ----------
// o.m: 'scream' | 'smile' | 'cry' | 'o';  o.girl: ponytails + clip; o.hands: raised hands on the glass
function kface(cx, cy, r, t, o = {}) {
  const sk = o.skin || '#c98b5c', hair = '#1b120c', bl = o.blink ? 1 : 0, sh = (o.shake || 0) * 3 * Math.sin(t * 40 + cx);
  let g = `<g transform="translate(${(cx + sh).toFixed(1)},${cy.toFixed(1)})">`;
  if (o.girl) g += `<circle cx="${-r * .95}" cy="${-r * .25}" r="${r * .38}" fill="${hair}" stroke="${C.ink}" stroke-width="3"/><circle cx="${r * .95}" cy="${-r * .25}" r="${r * .38}" fill="${hair}" stroke="${C.ink}" stroke-width="3"/>`;
  g += `<rect x="${-r * .9}" y="${r * .7}" width="${r * 1.8}" height="${r * 1.2}" rx="${r * .4}" fill="${o.shirt || '#f4f4f0'}" stroke="${C.ink}" stroke-width="3"/>`;
  g += `<circle r="${r}" fill="${sk}" stroke="${C.ink}" stroke-width="4"/><path d="M${-r},${-r * .1} Q${-r * .9},${-r * 1.15} 0,${-r * 1.08} Q${r * .9},${-r * 1.15} ${r},${-r * .1} Q${r * .5},${-r * .7} 0,${-r * .62} Q${-r * .5},${-r * .7} ${-r},${-r * .1}Z" fill="${hair}"/>`;
  if (o.girl) g += `<circle cx="${r * .55}" cy="${-r * .78}" r="${r * .2}" fill="#ff4f9a" stroke="${C.ink}" stroke-width="2"/>`;
  const ey = -r * .12;
  if (bl) g += `<path d="M${-r * .45},${ey} h${r * .25} M${r * .2},${ey} h${r * .25}" stroke="${C.ink}" stroke-width="4"/>`;
  else g += [-1, 1].map(s => `<ellipse cx="${s * r * .34}" cy="${ey}" rx="${r * .17}" ry="${r * .22}" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/><circle cx="${s * r * .34}" cy="${ey + r * .03}" r="${r * .1}" fill="#111"/>`).join('');
  if (o.m === 'scream') g += `<ellipse cx="0" cy="${r * .45}" rx="${r * .28}" ry="${r * (.3 + .06 * Math.sin(t * 30 + cx))}" fill="#7a1f2a" stroke="${C.ink}" stroke-width="3"/>`;
  else if (o.m === 'o') g += `<ellipse cx="0" cy="${r * .45}" rx="${r * .15}" ry="${r * .18}" fill="#7a1f2a" stroke="${C.ink}" stroke-width="3"/>`;
  else if (o.m === 'cry') g += `<path d="M${-r * .3},${r * .55} Q0,${r * .3} ${r * .3},${r * .55}" stroke="${C.ink}" stroke-width="4" fill="none"/>` + [-1, 1].map(s => `<path d="M${s * r * .34},${ey + r * .2} q${s * 4},${r * .4 + 6 * Math.sin(t * 9)} 0,${r * .7}" stroke="#7fd0ff" stroke-width="${r * .12}" fill="none" stroke-linecap="round"/>`).join('');
  else g += `<path d="M${-r * .35},${r * .35} Q0,${r * .75} ${r * .35},${r * .35}" stroke="${C.ink}" stroke-width="4" fill="#7a1f2a"/>`;
  g += `<circle cx="${-r * .55}" cy="${r * .25}" r="${r * .13}" fill="#ff7a7a" opacity=".35"/><circle cx="${r * .55}" cy="${r * .25}" r="${r * .13}" fill="#ff7a7a" opacity=".35"/>`;
  if (o.hands) { const w = 8 * Math.sin(t * 22 + cx); g += [-1, 1].map(s => `<ellipse cx="${s * r * 1.1}" cy="${-r * .1 + s * w * .3}" rx="${r * .28}" ry="${r * .34}" fill="${sk}" stroke="${C.ink}" stroke-width="3"/>`).join(''); }
  return g + '</g>';
}

// ---------- the SCHOOL VAN (side view facing right; ground at y=0; x = centre between the wheels) ----------
// o: roll (wheel angle), tilt (deg, applied by caller), mood 'scream'|'smile'|'cheer', bumper 1 = rear bumper on, empty driver seat,
//    bounce (body bob), door 0..1 (sliding door open), beam (headlight flash)
const VAN = { L: 410, H: 430, WR: -250, WF: 250, R: 58 };
function schoolVan(x, y, s, t, o = {}) {
  o = Object.assign({ roll: 0, mood: 'scream', bumper: 1, bounce: 0, door: 0, f: 1, noorMood: null }, o);
  const id = 'vn' + (CARID++), f = o.f, b = o.bounce * 6 * Math.sin(t * 34);
  let g = `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(s * f).toFixed(3)},${s.toFixed(3)})"><ellipse cx="0" cy="4" rx="430" ry="30" fill="#000" opacity=".25"/><g transform="translate(0,${b.toFixed(1)})">`;
  // body shell: boxy back, short sloped bonnet at the front (right)
  const body = 'M-410,-60 L-410,-400 Q-410,-430 -380,-430 L210,-430 Q240,-430 258,-404 L330,-270 L392,-246 Q418,-238 418,-208 L418,-60 Q418,-34 392,-34 L-384,-34 Q-410,-34 -410,-60Z';
  g += `<path d="${body}" fill="#ffcf1a" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>`;
  g += `<path d="M-410,-400 Q-410,-430 -380,-430 L210,-430 Q240,-430 258,-404 L270,-384 L-410,-384Z" fill="#fff" opacity=".22"/>`;   // roof highlight
  // windows (clip the kids inside)
  const WIN = [[-380, -150], [-232, -150], [-84, -150], [64, -150]];   // [x, width]
  g += `<clipPath id="${id}">${WIN.map(([wx]) => `<rect x="${wx}" y="-392" width="132" height="150" rx="14"/>`).join('')}</clipPath>`;
  g += WIN.map(([wx]) => `<rect x="${wx}" y="-392" width="132" height="150" rx="14" fill="#bfe6f2" stroke="${C.ink}" stroke-width="5"/>`).join('');
  const kids = [{ sk: '#b07248', shirt: '#f4f4f0' }, { sk: '#c98d62', girl: 1, shirt: '#f4f4f0', noor: 1 }, { sk: '#d7a27a', shirt: '#f4f4f0' }, { sk: '#8d5a3b', shirt: '#f4f4f0' }];
  let inside = '';
  kids.forEach((k, i) => {
    const m = k.noor && o.noorMood ? o.noorMood : (o.mood === 'scream' ? (i % 2 ? 'scream' : 'o') : 'smile');
    const jump = o.mood === 'cheer' ? 14 * Math.abs(Math.sin(t * 8 + i)) : 0, slide = o.slide || 0;
    inside += kface(WIN[i][0] + 66 + slide * 40, -300 - jump, 46, t, { skin: k.sk, girl: k.girl, shirt: k.shirt, m, hands: o.mood !== 'smile' && m !== 'cry', blink: blink(t + i * .7, 3) > .5, shake: o.mood === 'scream' ? 1 : 0 });
  });
  g += `<g clip-path="url(#${id})">${inside}</g>`;
  g += WIN.map(([wx]) => `<path d="M${wx + 10},-380 l40,0 l-30,120" fill="#fff" opacity=".35"/>`).join('');
  // windscreen + empty driver seat (front)
  g += `<path d="M214,-392 L246,-392 L316,-262 L214,-262Z" fill="#bfe6f2" stroke="${C.ink}" stroke-width="5"/><path d="M228,-330 q10,-40 30,-34 l8,70 h-40Z" fill="#5a4a3a" opacity=".85"/><circle cx="292" cy="-300" r="22" fill="none" stroke="#333" stroke-width="7"/>`;
  // sliding door seam (opens to the left)
  if (o.door > 0) g += `<rect x="-90" y="-236" width="${150 * o.door}" height="190" fill="#3a3f4a"/>`;
  g += `<path d="M-92,-236 V-44 M64,-236 V-44" stroke="${C.ink}" stroke-width="4" opacity=".55"/><rect x="40" y="-150" width="30" height="10" rx="5" fill="${C.ink}" opacity=".6"/>`;
  // side band: SCHOOL VAN in black on a red stripe
  g += `<rect x="-410" y="-232" width="800" height="70" fill="#e5463b" stroke="${C.ink}" stroke-width="5"/><g transform="translate(-40,-180) scale(${f},1)">${T(0, 0, 54, 'SCHOOL VAN', { fill: '#fff', sw: 0, ls: 4 })}</g>`;
  g += `<rect x="-410" y="-150" width="830" height="12" fill="#1b1b22" opacity=".55"/>`;
  // lights: amber roof light (flashing), headlight, tail light
  g += `<rect x="-40" y="-458" width="70" height="30" rx="10" fill="${Math.sin(t * 12) > 0 ? '#ffb300' : '#a86b00'}" stroke="${C.ink}" stroke-width="4"/>`;
  g += `<ellipse cx="404" cy="-200" rx="14" ry="22" fill="#fff6c0" stroke="${C.ink}" stroke-width="4"/><rect x="-418" y="-210" width="22" height="50" rx="6" fill="#e5463b" stroke="${C.ink}" stroke-width="4"/>`;
  if (o.beam) g += `<path d="M418,-200 L760,-300 L760,-100Z" fill="#fff6c0" opacity="${.3 * o.beam}"/>`;
  // front bumper always; rear bumper detachable
  g += `<rect x="370" y="-70" width="70" height="26" rx="10" fill="#9aa3ad" stroke="${C.ink}" stroke-width="4"/>`;
  if (o.bumper) g += vanBumper(-430, -58, 1);
  g += wheel(VAN.WR, -20, VAN.R, o.roll) + wheel(VAN.WF, -20, VAN.R, o.roll);
  g += `<path d="M${VAN.WR - 80},-80 a80,80 0 0 1 160,0 M${VAN.WF - 80},-80 a80,80 0 0 1 160,0" stroke="${C.ink}" stroke-width="6" fill="none"/>`;
  return g + '</g></g>';
}
const vanBumper = (x, y, s, rot = 0) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)})"><rect x="-26" y="-14" width="96" height="30" rx="12" fill="#9aa3ad" stroke="${C.ink}" stroke-width="5"/><path d="M-16,-4 h76" stroke="#fff" stroke-width="5" opacity=".6"/></g>`;
// place the van on the lane at world x (rolling) — like thelaAt(): ground point projected through the camera
// o.tilt (deg, extra), o.piv = local x of the pivot (e.g. VAN.WF for the front wheel), o.lift = raise in world px, o.wob = rattle
function vanXf(cam, x, t, o = {}) {
  const p = proj(1, cam, x, G(x) + 30 - (o.lift || 0)), a = slopeAng(x) + (o.wob || 0) * 1.2 * Math.sin(t * 26), tl = o.tilt || 0, S = VS * p.s, piv = (o.piv || 0) * S;
  return { p, a, tl, S, piv };
}
function vanPt(cam, x, t, o, lx, ly) {   // screen position of a van-local point (same transforms as vanAt)
  const { p, a, tl, S, piv } = vanXf(cam, x, t, o), r1 = a * Math.PI / 180, r2 = tl * Math.PI / 180;
  let X = lx * S, Y = ly * S;
  X -= piv; [X, Y] = [X * Math.cos(r2) - Y * Math.sin(r2), X * Math.sin(r2) + Y * Math.cos(r2)]; X += piv;
  [X, Y] = [X * Math.cos(r1) - Y * Math.sin(r1), X * Math.sin(r1) + Y * Math.cos(r1)];
  return { x: p.x + X, y: p.y + Y, s: p.s };
}
function vanAt(cam, x, t, o = {}) {
  const { p, a, tl, S, piv } = vanXf(cam, x, t, o), gy = proj(1, cam, x, G(x) + 30).y;
  const rot = `rotate(${a.toFixed(2)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${tl.toFixed(2)} ${(p.x + piv).toFixed(1)} ${p.y.toFixed(1)})`;
  return castShadow(p.x, gy, 760 * VS * p.s, 120 * p.s, .25 * clamp(1 - (o.lift || 0) / 600, .3, 1)) + shadow(p.x - 30 * p.s, gy + 4, 420 * p.s * VS * 1.2, .9 * clamp(1 - (o.lift || 0) / 600, .3, 1), { dx: -40 * p.s, skew: 35 })
    + `<g transform="${rot}">${schoolVan(p.x, p.y, S, t, Object.assign({ roll: x / 30 }, o))}</g>`;
}
const VS = .8;   // van scale on the lane (a van is taller than the grown-ups)

// ---------- Ammar mistri's naali trench (khadda) across the lane near the bottom, with barricade, sand, pipes, bricks ----------
const KH = { x0: 2700, x1: 2860 };   // trench mouth along the lane (action-plane x at the back kerb line)
function khadda(t, o = {}) {
  const e = x => G(x) - 150, D = 260;                 // oblique depth offset like the paving cross joints
  const P = (x, k) => [x - 260 * k * .9, e(x) + 20 + (G(x) + 230 - e(x)) * k];
  const a = P(KH.x0, 0), b = P(KH.x1, 0), c = P(KH.x1, 1), d = P(KH.x0, 1);
  let g = `<polygon points="${a} ${b} ${c} ${d}" fill="#3b2617" stroke="${C.ink}" stroke-width="6"/>`;
  g += `<polygon points="${a} ${b} ${b[0] - 30},${b[1] + 70} ${a[0] - 30},${a[1] + 70}" fill="#6b4a2e"/>`;               // far inner wall in light
  g += `<polygon points="${b} ${c} ${c[0] - 20},${c[1] - 40} ${b[0] - 10},${b[1] + 60}" fill="#5a3b22" opacity=".9"/>`;
  g += `<path d="M${d[0]},${d[1]} L${c[0]},${c[1]}" stroke="#9c7a52" stroke-width="10"/>`;
  // concrete pipe lying in the trench (dim)
  g += `<g opacity=".8"><ellipse cx="${(a[0] + c[0]) / 2}" cy="${(a[1] + c[1]) / 2 + 40}" rx="36" ry="44" fill="#9aa3ad" stroke="${C.ink}" stroke-width="4"/><ellipse cx="${(a[0] + c[0]) / 2}" cy="${(a[1] + c[1]) / 2 + 40}" rx="18" ry="24" fill="#222"/></g>`;
  // sand pile + bricks on the downhill side, shovel stuck in it
  const sx = KH.x1 + 140, sy = G(sx) - 60;
  g += castShadow(sx, sy + 40, 220, 80, .2) + `<path d="M${sx - 150},${sy + 40} Q${sx - 40},${sy - 90} ${sx + 60},${sy - 70} Q${sx + 140},${sy - 30} ${sx + 170},${sy + 40}Z" fill="#e0b870" stroke="${C.ink}" stroke-width="5"/><path d="M${sx - 20},${sy - 70} l-60,-150" stroke="#7a5233" stroke-width="10"/><path d="M${sx - 100},${sy - 250} l40,-14 l26,54 l-40,14z" fill="#8d939b" stroke="${C.ink}" stroke-width="4"/>`;
  for (let i = 0; i < 6; i++) { const bx = KH.x1 + 330 + (i % 3) * 52, by = G(KH.x1 + 330) - 20 - Math.floor(i / 3) * 28; g += `<rect x="${bx}" y="${by}" width="50" height="26" fill="#b5502f" stroke="${C.ink}" stroke-width="3" transform="rotate(${SLA.toFixed(1)} ${bx} ${by})"/>`; }
  // red-white barricade on the far side of the trench (on the kerb line), blinking lamp
  if (o.barricade !== false) {
    const bx0 = KH.x0 - 20, bx1 = KH.x1 + 30, y0 = e(bx0) - 10, y1 = e(bx1) - 10;
    g += `<path d="M${bx0},${y0} v-120 M${bx1},${y1} v-120" stroke="${C.ink}" stroke-width="10"/>`;
    g += `<polygon points="${bx0 - 20},${y0 - 120} ${bx1 + 20},${y1 - 120} ${bx1 + 20},${y1 - 70} ${bx0 - 20},${y0 - 70}" fill="#fff" stroke="${C.ink}" stroke-width="5"/>`;
    for (let k = 0; k < 5; k++) { const u0 = k / 5 + .02, u1 = u0 + .1, X = u => bx0 - 20 + (bx1 - bx0 + 40) * u, Y = u => y0 - 120 + (y1 - y0) * u; g += `<polygon points="${X(u0)},${Y(u0)} ${X(u1)},${Y(u1)} ${X(u1) - 20},${Y(u1) + 50} ${X(u0) - 20},${Y(u0) + 50}" fill="#e5463b"/>`; }
    g += `<circle cx="${bx1}" cy="${y1 - 140}" r="14" fill="${Math.sin(t * 8) > 0 ? '#ff3b30' : '#7a1f1f'}" stroke="${C.ink}" stroke-width="3"/>`;
  }
  return g;
}
const KHX = (KH.x0 + KH.x1) / 2;

// ---------- school bag + tiffin props ----------
const schoolBag = (x, y, s, rot = 0) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot}) scale(${s.toFixed(3)})"><path d="M-30,-70 q30,-30 60,0" stroke="${C.ink}" stroke-width="8" fill="none"/><rect x="-52" y="-74" width="104" height="120" rx="22" fill="#2f6fd1" stroke="${C.ink}" stroke-width="5"/><rect x="-36" y="0" width="72" height="34" rx="10" fill="#ffd34a" stroke="${C.ink}" stroke-width="4"/>${emblem(0, -36, .28)}</g>`;
const tiffin = (x, y, s) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(3)})"><rect x="-40" y="-60" width="80" height="60" rx="8" fill="#c9cfd6" stroke="${C.ink}" stroke-width="4"/><path d="M-40,-30 h80" stroke="${C.ink}" stroke-width="3"/><path d="M-30,-60 q30,-40 60,0" stroke="${C.ink}" stroke-width="5" fill="none"/><circle cx="0" cy="-45" r="6" fill="#e5463b"/></g>`;

// ---------- the SCHOOL at the chowk (in the house row d=1.3, flat part after XR): yellow building, gate, sign, swings ----------
const SCH = { x: 3150, w: 900 };
function schoolRow(t) {
  const HB = x => GB - 165 + SL * Math.min(x, XR), yb = HB(SCH.x), x0 = SCH.x - SCH.w / 2, top = yb - 700;
  let g = `<rect x="${x0 - 30}" y="${top - 30}" width="${SCH.w + 60}" height="800" fill="#e9e1d4"/>`;
  g += `<rect x="${x0}" y="${top}" width="${SCH.w}" height="${700 + 400}" fill="#ffd98a" stroke="${C.ink}" stroke-width="6"/><rect x="${x0 - 14}" y="${top - 26}" width="${SCH.w + 28}" height="30" fill="#e5463b" stroke="${C.ink}" stroke-width="5"/>`;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { const wx = x0 + 60 + c * 210, wy = top + 160 + r * 190; g += `<rect x="${wx}" y="${wy}" width="130" height="120" rx="10" fill="#5a8bb0" stroke="${C.ink}" stroke-width="5"/><path d="M${wx + 65},${wy} v120 M${wx},${wy + 60} h130" stroke="#cfe3ef" stroke-width="4"/>`; }
  // sign board with a sun + pencil
  g += `<rect x="${SCH.x - 330}" y="${top + 20}" width="660" height="110" rx="20" fill="#fff6d8" stroke="${C.ink}" stroke-width="6"/>${T(SCH.x + 30, top + 98, 70, 'NANHE TAARE SCHOOL', { fill: '#2f6fd1', sw: 0, ls: 1 })}<circle cx="${SCH.x - 270}" cy="${top + 75}" r="34" fill="#ffc83a" stroke="${C.ink}" stroke-width="4"/>`;
  // gate pillars + green iron gate (open)
  const gx = SCH.x - 150;
  g += `<rect x="${gx - 60}" y="${yb - 330}" width="60" height="330" fill="#e9e1d4" stroke="${C.ink}" stroke-width="5"/><rect x="${gx + 300}" y="${yb - 330}" width="60" height="330" fill="#e9e1d4" stroke="${C.ink}" stroke-width="5"/><rect x="${gx}" y="${yb - 300}" width="300" height="300" fill="#6b4a3a"/>`;
  g += `<g stroke="#2e8a3a" stroke-width="8">${[...Array(6)].map((_, k) => `<path d="M${gx - 150 + k * 26},${yb - 280} v270"/>`).join('')}<path d="M${gx - 160},${yb - 250} h150 M${gx - 160},${yb - 60} h150"/></g>`;
  // playground glimpse through the gate: a swing + slide
  g += `<path d="M${gx + 60},${yb - 280} l40,-1 v190 M${gx + 200},${yb - 280} v190" stroke="#e5463b" stroke-width="7" fill="none"/><path d="M${gx + 95},${yb - 280} v120 M${gx + 165},${yb - 280} v120" stroke="#444" stroke-width="3"/><rect x="${gx + 85}" y="${yb - 165 + 8 * Math.sin(t * 2)}" width="90" height="14" fill="#ffd34a" stroke="${C.ink}" stroke-width="3"/>`;
  // bunting "pehla din" welcome
  g += `<path d="M${x0 + 20},${top + 150} Q${SCH.x},${top + 230} ${x0 + SCH.w - 20},${top + 150}" stroke="#444" stroke-width="3" fill="none"/>` + [...Array(12)].map((_, k) => { const u = (k + .5) / 12, bx = x0 + 20 + (SCH.w - 40) * u, by = top + 150 + 80 * 4 * u * (1 - u); return `<path d="M${bx - 20},${by} l20,40 l20,-40z" fill="${['#e5463b', '#ffd34a', '#2f6fd1', '#22a35a'][k % 4]}" stroke="${C.ink}" stroke-width="2" transform="rotate(${4 * Math.sin(t * 2 + k)} ${bx} ${by})"/>`; }).join('');
  return g;
}

// ---------- railway platform set for the cliffhanger flash (Ep 11 "Train Ka Safar") ----------
function platformSet(t, cam) {
  let g = layer(50, cam, `<rect x="-2000" y="-2000" width="6000" height="5000" fill="url(#skyK)"/>`, { f: '' });
  g += layer(6, cam, `<g opacity=".8">${[...Array(16)].map((_, i) => `<rect x="${-900 + i * 190}" y="${700 - hs(i + 3) * 260}" width="150" height="900" fill="${['#c9b3a0', '#b9c9d6', '#d6c3a0'][i % 3]}"/>`).join('')}</g>`) + veil(.3);
  // the train (d=1.4): green carriages with windows, moving off to the right
  const tx = -200 + 260 * t;
  let tr = '';
  for (let c = 0; c < 4; c++) { const cx = tx - c * 1060; tr += `<rect x="${cx - 500}" y="560" width="1000" height="420" rx="30" fill="#2e7d4f" stroke="${C.ink}" stroke-width="8"/><rect x="${cx - 500}" y="800" width="1000" height="26" fill="#ffd34a"/>${[...Array(6)].map((_, k) => `<rect x="${cx - 450 + k * 155}" y="620" width="110" height="120" rx="10" fill="#bfe6f2" stroke="${C.ink}" stroke-width="5"/>`).join('')}<circle cx="${cx - 300}" cy="990" r="50" fill="#222" stroke="${C.ink}" stroke-width="5"/><circle cx="${cx + 300}" cy="990" r="50" fill="#222" stroke="${C.ink}" stroke-width="5"/>`; }
  g += layer(1.4, cam, tr + `<rect x="-3000" y="1030" width="8000" height="40" fill="#5d5d66"/>`);
  // platform (d=1): stone edge with yellow line, a bench, a pillar
  g += layer(1, cam, `<rect x="-3000" y="1120" width="8000" height="1400" fill="#c9bfae"/><rect x="-3000" y="1120" width="8000" height="40" fill="#efe6d8" stroke="${C.ink}" stroke-width="5"/><rect x="-3000" y="1170" width="8000" height="24" fill="#ffd34a"/>${[...Array(30)].map((_, i) => `<path d="M${-2800 + i * 260},1200 l-120,700" stroke="#b3a893" stroke-width="4"/>`).join('')}<rect x="1500" y="300" width="70" height="830" fill="#8d6e4a" stroke="${C.ink}" stroke-width="5"/>`);
  return g;
}
