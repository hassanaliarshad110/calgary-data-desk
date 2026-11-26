// Episode 12 "Cricket Final" — shared helpers (from Ep 10/11).
// Helpers below are shared with Ep 10.
const LS = id => L(id).s, LE = id => L(id).s + L(id).d;
const sdur = id => TL.scenes.find(s => s.id === id).dur;
const SQ = .55 * KS, SAM = .92, SKR = 1.0;
const on = (id, t, a = .1, b = .15) => t > LS(id) - a && t < LE(id) + b;
const lerpCam = (a, b, k) => ({ x: lerp(a.x || 0, b.x || 0, k), y: lerp(a.y || 0, b.y || 0, k), z: lerp(a.z ?? 1, b.z ?? 1, k), px: lerp(a.px ?? 540, b.px ?? 540, k), py: lerp(a.py ?? 960, b.py ?? 960, k) });
const susHand = (x, y, s, ang, side = 1, flip = 1) => [x + flip * s * side * (98 + 158 * Math.sin(ang * Math.PI / 180)), y + s * (-312 + 158 * Math.cos(ang * Math.PI / 180))];
const vig = op => `<rect width="1080" height="1920" fill="url(#vig)" opacity="${op}"/>`;
const walkK = (t, f = 26) => Math.sin(t * f) * 26;
function inset(cx, cy, r, content, id) {
  return `<clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><g clip-path="url(#${id})">${content}</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-width="10"/><circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="none" stroke="${C.ink}" stroke-width="4"/>`;
}
const marker = (x, y, r, t, col = C.red, label = '') => `<circle cx="${x}" cy="${y}" r="${r + 6 * Math.sin(t * 7)}" fill="none" stroke="${col}" stroke-width="9" opacity=".9"/>` + (label ? T(clamp(x, 160, 920), y - r - 30, 54, label, { fill: '#fff', shadow: col }) : '');
function fountain(fx, fy, s, t, k, puddleY, op = 1) {
  if (k <= 0) return '';
  let g = '';
  for (const side of [-1, 1]) for (let i = 0; i < 9; i++) {
    const p = ((t * 1.6 + i / 9) % 1), vx = side * (260 + 60 * hs(i + side * 7)) * s * k, vy = -240 * s * k;
    const x = fx + side * 26 * s + vx * p, y = fy + vy * p + 900 * s * p * p;
    if (y > puddleY) continue;
    g += `<path d="M${x.toFixed(1)},${(y - 16 * s).toFixed(1)} q${(10 * s).toFixed(1)},${(16 * s).toFixed(1)} 0,${(26 * s).toFixed(1)} q${(-10 * s).toFixed(1)},${(-10 * s).toFixed(1)} 0,${(-26 * s).toFixed(1)}Z" fill="#7fd0ff" stroke="#2f7fd6" stroke-width="${(2.5 * s).toFixed(1)}" opacity="${(op * (1 - p * .3)).toFixed(2)}"/>`;
  }
  for (const side of [-1, 1]) g += `<path d="M${fx + side * 26 * s},${fy} q${side * 140 * s * k},${-120 * s * k} ${side * 280 * s * k},${200 * s}" stroke="#9adcff" stroke-width="${(14 * s).toFixed(1)}" fill="none" stroke-linecap="round" opacity="${(.75 * op).toFixed(2)}"/>`;
  return g;
}
const puddle = (x, y, s, k) => k > 0 ? `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(260 * s * k).toFixed(1)}" ry="${(40 * s * k).toFixed(1)}" fill="#8fd6ff" stroke="#2f7fd6" stroke-width="4" opacity=".8"/><ellipse cx="${(x - 60 * s * k).toFixed(1)}" cy="${(y - 8 * s * k).toFixed(1)}" rx="${(60 * s * k).toFixed(1)}" ry="${(10 * s * k).toFixed(1)}" fill="#fff" opacity=".6"/>` : '';
function violin(x, y, t, op) { if (op <= 0) return ''; let g = `<g opacity="${op.toFixed(2)}" transform="translate(${x},${y}) rotate(-25)"><path d="M0,-70 q34,0 30,34 q-12,14 0,30 q8,44 -30,46 q-38,-2 -30,-46 q12,-16 0,-30 q-4,-34 30,-34Z" fill="#a0522d" stroke="${C.ink}" stroke-width="5"/><path d="M0,-70 v-80" stroke="#3a2416" stroke-width="10"/><path d="M-60,${-20 + 14 * Math.sin(t * 6)} L80,${-60 + 14 * Math.sin(t * 6)}" stroke="#e9d9b0" stroke-width="5"/></g>`; return g + notes(x + 80, y - 80, t); }
function shhh(x, y, k) {
  if (k <= 0) return '';
  return `<g transform="translate(${x},${y}) scale(${k})"><circle r="78" fill="${C.gold}" stroke="${C.ink}" stroke-width="7"/><circle cx="-24" cy="-14" r="8" fill="${C.ink}"/><circle cx="24" cy="-14" r="8" fill="${C.ink}"/><path d="M-22,30 Q0,22 22,30" stroke="${C.ink}" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="-9" y="-6" width="18" height="70" rx="9" fill="#c98b5c" stroke="${C.ink}" stroke-width="5"/>${T(0, 118, 40, 'RAAZ!', { fill: '#fff', shadow: '#000' })}</g>`;
}
const susuFly = (x, y, sc, t, o = {}) => susu(Object.assign({ x, y, s: sc, t, power: .9, cape: 1, crown: 1, shades: 1, armL: 150, armR: 150, legL: -22, legR: 12, mouth: 'grin', blink: blink(t, 3) }, o));
const hook2 = (txt, t, a, y = 300, size = 120, col = C.gold) => { const k = back(seg(t, a, a + .3)); return k > 0 ? `<g transform="translate(540,${y}) scale(${k.toFixed(3)}) rotate(-3)">${T(0, 0, size, txt, { fill: col, shadow: C.red, sw: 12 })}</g>` : ''; };
const onLane = (d, cam, x, fn, o, sh = { w: 90 }, dy = 0) => at(d, cam, x, G(x) + 40 + dy, fn, o, sh);
const Q = (cam, x, o, sh = { w: 110 }, dy = 0) => onLane(1, cam, x, susu, Object.assign({ s: SQ, t: 0, blink: 0 }, o), sh, dy);
// camera keyframes: [[t, camG args...]] eased between
const camF = (wx, z = 1, feetY = 1170, sx = 540) => camG(wx, z, feetY, sx, -40);   // puts the feet line (G+40) of world x at screen y feetY
function camK(t, K) {
  let c = camF(...K[0][1]);
  for (let i = 1; i < K.length; i++) { const [t0, a0, dur = .8] = K[i]; c = lerpCam(c, camF(...a0), ease(seg(t, t0, t0 + dur))); }
  return c;
}
const HB = x => GB - 165 + SL * Math.min(x, XR);       // house-row ground (d=1.3 coords)
