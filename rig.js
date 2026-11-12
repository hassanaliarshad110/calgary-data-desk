// ===== Jensen story rig — flat 2D vector style (midnight blue / amber / neon green)
const W = 1920, H = 1080;
const C = {
  bg: '#121B2B', bg2: '#1A2740', bg3: '#0C1220', ink: '#0B0F17', amber: '#F4D06F', amber2: '#E8A93B',
  green: '#2BFF88', green2: '#14B866', red: '#E2483D', red2: '#9E2A22', paper: '#EFE7D3', paper2: '#D9CDB0',
  white: '#F6F2E8', grey: '#8A94A6', skin: '#F1C9A0', skin2: '#D9A77E', blue: '#3A7BD5', navy: '#1C2A44',
  wood: '#5A3A24', wood2: '#3E2716', silver: '#DDE1E7'
};
let ctx;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
const easeIn = t => Math.pow(clamp(t), 3);
const back = t => { t = clamp(t); const s = 1.7; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const wob = (t, f = 1, a = 1, p = 0) => Math.sin(t * f * 6.283 + p) * a;
function rnd(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

function P(path, fill, stroke = C.ink, lw = 5) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(path); }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(path); }
}
function rr(x, y, w, h, r) { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; }
function circ(x, y, r) { const p = new Path2D(); p.arc(x, y, r, 0, 6.2832); return p; }
function ell(x, y, rx, ry, rot = 0) { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, 6.2832); return p; }
function line(x1, y1, x2, y2, col = C.ink, lw = 5) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke(); }
function poly(pts) { const p = new Path2D(); p.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) p.lineTo(pts[i], pts[i + 1]); p.closePath(); return p; }
function fillAll(col) { ctx.fillStyle = col; ctx.fillRect(-W, -H, W * 3, H * 3); }
function grad(y1, y2, c1, c2) { const g = ctx.createLinearGradient(0, y1, 0, y2); g.addColorStop(0, c1); g.addColorStop(1, c2); return g; }
function glow(x, y, r, col, a = 0.5) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function txt(s, x, y, size, col = C.white, font = 'Oswald', weight = 700, align = 'center', base = 'middle') {
  ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y);
}
function txtStroke(s, x, y, size, col, stroke, lw, font = 'Oswald', weight = 700, align = 'center') {
  ctx.font = `${weight} ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y);
}
function withT(x, y, s, r, fn) { ctx.save(); ctx.translate(x, y); if (r) ctx.rotate(r); if (s !== 1) ctx.scale(s, s); fn(); ctx.restore(); }
function alpha(a, fn) { ctx.save(); ctx.globalAlpha *= clamp(a); fn(); ctx.restore(); }
function paperTex(x, y, w, h, seed = 1) { // speckle texture
  ctx.save(); ctx.globalAlpha = 0.08; ctx.fillStyle = C.ink;
  for (let i = 0; i < 160; i++) { ctx.fillRect(x + rnd(i + seed) * w, y + rnd(i * 3 + seed) * h, 2, 2); }
  ctx.restore();
}

// ---------- CHARACTER ----------
// opts: kind, talk (0..1), look (-1..1), arms [[shoulderAngleL, elbowL],[R]], walk phase, blink, scale
const KINDS = {
  jensen: { body: '#17181D', body2: '#2A2C33', skin: C.skin, hair: 'jensen', jacket: true, h: 1 },
  jkid: { body: '#3A6EA5', body2: '#2D5785', skin: C.skin, hair: 'kid', h: 0.62 },
  jteen: { body: C.white, body2: '#cfc8b8', skin: C.skin, hair: 'teen', h: 0.85, apron: true },
  brother: { body: '#6B8E4E', body2: '#55733D', skin: C.skin, hair: 'kid', h: 0.7 },
  alice: { body: '#8E1E2A', body2: '#6E1520', skin: '#F3D2B3', hair: 'bob', h: 0.93, lips: true },
  agent: { body: '#1F2738', body2: '#161C29', skin: '#E5B48C', hair: 'short', tie: '#B8322A', h: 1 },
  agent2: { body: '#2B2F3A', body2: '#1E222B', skin: '#8D5B3C', hair: 'bald', tie: '#2E5FA8', h: 1.02 },
  official: { body: '#2C3E63', body2: '#22314E', skin: '#E9BE98', hair: 'grey', tie: '#C9A227', h: 1 },
  inspector: { body: '#B49A6A', body2: '#9A8257', skin: '#E3B08A', hair: 'cap', h: 0.98 },
  worker: { body: '#F08A24', body2: '#D06E12', skin: '#B97E55', hair: 'hardhat', vest: true, h: 0.95 },
  roommate: { body: '#6E6E6E', body2: '#575757', skin: '#E8B892', hair: 'buzz', h: 1.15, wide: 1.3, tattoo: true },
  uncle: { body: '#7A5C3E', body2: '#634A31', skin: C.skin, hair: 'short', h: 1 },
  founder1: { body: '#4B6584', body2: '#3B5068', skin: '#F0C7A2', hair: 'beard', h: 1 },
  founder2: { body: '#7B5E8F', body2: '#624B72', skin: '#EFC39C', hair: 'beardg', h: 1, glasses: true },
  waitress: { body: '#D9534F', body2: '#B94440', skin: '#F1C9A0', hair: 'bun', h: 0.95 },
  chef: { body: C.white, body2: '#D8D2C4', skin: '#D9A77E', hair: 'chef', h: 1 },
  guest: { body: '#C0392B', body2: '#A3301F', skin: '#C98E64', hair: 'short', h: 0.95 },
  staff: { body: '#2E7D5B', body2: '#236247', skin: '#E2B48C', hair: 'short', h: 0.95 },
  president: { body: '#1B2233', body2: '#141A27', skin: '#EBC4A0', hair: 'grey', tie: '#B8322A', h: 1.05 },
};

function person(x, y, kind, o = {}) {
  const K = KINDS[kind]; const s = (o.s || 1);
  const hh = K.h, wd = K.wide || 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  const t = o.t || 0; const walk = o.walk || 0; const bob = o.bob !== undefined ? o.bob : wob(t, 0.5, 2);
  const bodyH = 150 * hh, bodyW = 105 * wd * (hh < 0.8 ? 0.85 : 1);
  const top = -bodyH - 70 * hh + bob; // body top (above legs)
  // legs
  const legY = -70 * hh; const lp = walk ? Math.sin(walk * 6.283) : 0;
  ctx.lineCap = 'round';
  if (!o.sit) {
    line(-18 * wd, legY, -18 * wd - 22 * lp, 0, C.ink, 7);
    line(18 * wd, legY, 18 * wd + 22 * lp, 0, C.ink, 7);
    P(ell(-18 * wd - 22 * lp - 6, 2, 16, 7), C.ink, null); P(ell(18 * wd + 22 * lp + 6, 2, 16, 7), C.ink, null);
  } else {
    line(-18 * wd, legY, -18 * wd + 55, legY, C.ink, 7); line(-18 * wd + 55, legY, -18 * wd + 55, 0, C.ink, 7);
    line(18 * wd, legY, 18 * wd + 55, legY, C.ink, 7); line(18 * wd + 55, legY, 18 * wd + 55, 0, C.ink, 7);
  }
  // arms (behind body for back arm)
  const arms = o.arms || [[0.25, 0.2], [-0.25, -0.2]];
  const shY = top + bodyH * 0.28; const shX = bodyW * 0.45;
  const armL = 62 * hh, foreL = 58 * hh;
  function arm(side, a) {
    const sx = side * shX; const ang = Math.PI / 2 + side * (a[0] || 0); // 0 = hanging down
    const ex = sx + Math.cos(ang) * armL * side * 0 + Math.sin(a[0] || 0) * armL * side, ey = shY + Math.cos(a[0] || 0) * armL;
    const a2 = (a[0] || 0) + (a[1] || 0);
    const hx = ex + Math.sin(a2) * foreL * side, hy = ey + Math.cos(a2) * foreL;
    line(sx, shY, ex, ey, C.ink, 7); line(ex, ey, hx, hy, C.ink, 7);
    P(circ(hx, hy, 9), K.skin, C.ink, 4);
    return [hx, hy];
  }
  const handR = arm(1, arms[1]);
  // body
  const bp = rr(-bodyW / 2, top, bodyW, bodyH, bodyW * 0.46);
  P(bp, K.body, C.ink, 5);
  ctx.save(); ctx.clip(bp);
  ctx.fillStyle = K.body2; ctx.fillRect(bodyW * 0.12, top, bodyW, bodyH);
  if (K.jacket) { // leather jacket: inner black tee + lapels + zipper + shine
    P(poly([-bodyW * 0.18, top, bodyW * 0.18, top, bodyW * 0.08, top + bodyH * 0.55, -bodyW * 0.08, top + bodyH * 0.55]), '#0A0A0C', null);
    line(-bodyW * 0.16, top + 4, -bodyW * 0.04, top + bodyH * 0.5, '#3B3E47', 4); line(bodyW * 0.16, top + 4, bodyW * 0.04, top + bodyH * 0.5, '#3B3E47', 4);
    line(bodyW * 0.03, top + bodyH * 0.55, bodyW * 0.03, top + bodyH, '#9AA0AA', 3);
    ctx.globalAlpha = 0.35; line(-bodyW * 0.36, top + bodyH * 0.25, -bodyW * 0.3, top + bodyH * 0.75, '#FFFFFF', 5); ctx.globalAlpha = 1;
  }
  if (K.tie) { P(poly([-bodyW * 0.14, top, bodyW * 0.14, top, 0, top + bodyH * 0.42]), C.white, null); P(poly([-7, top + 6, 7, top + 6, 9, top + bodyH * 0.45, 0, top + bodyH * 0.52, -9, top + bodyH * 0.45]), K.tie, C.ink, 2.5); }
  if (K.apron) { P(rr(-bodyW * 0.3, top + bodyH * 0.35, bodyW * 0.6, bodyH * 0.65, 8), '#EDEDED', C.ink, 3); }
  if (K.vest) { ctx.fillStyle = '#C8F03C'; ctx.fillRect(-bodyW * 0.5, top + bodyH * 0.45, bodyW, 12); ctx.fillRect(-bodyW * 0.5, top + bodyH * 0.65, bodyW, 12); }
  if (K.tattoo) { ctx.strokeStyle = '#2C4A7A'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-bodyW * 0.25 + i * 12, top + 30 + i * 18, 8, 0, 4); ctx.stroke(); } }
  ctx.restore(); P(bp, null, C.ink, 5);
  const handL = arm(-1, arms[0]);
  // head
  const hr = 52 * (hh < 0.8 ? 0.95 : 1) * (K.h > 1.1 ? 0.9 : 1);
  const hx = (o.look || 0) * 4, hy = top - hr * 0.78;
  head(hx, hy, hr, K, o);
  if (o.prop) o.prop(handL, handR, top, hy);
  ctx.restore();
  return { handL, handR };
}

function head(x, y, r, K, o) {
  const look = o.look || 0; const talk = clamp(o.talk || 0);
  // back hair
  if (K.hair === 'bob') { P(rr(x - r * 1.08, y - r * 1.02, r * 2.16, r * 1.95, r * 0.9), '#141217', C.ink, 5); }
  if (K.hair === 'kid' || K.hair === 'teen') { P(rr(x - r * 1.05, y - r * 1.05, r * 2.1, r * (K.hair === 'kid' ? 1.6 : 1.4), r * 0.9), '#121212', C.ink, 5); }
  P(circ(x, y, r), K.skin, C.ink, 5);
  // ears
  P(ell(x - r * 0.98, y + 4, 9, 13), K.skin, C.ink, 4); P(ell(x + r * 0.98, y + 4, 9, 13), K.skin, C.ink, 4);
  // hair front
  const hc = K.hair;
  if (hc === 'jensen') {
    // swept-back silver hair: high hairline, big volume on top, grey sides
    const col = K.hairCol || C.silver, dk = K.hairCol ? '#000' : '#A3AAB5';
    const p = new Path2D();
    p.moveTo(x - r * 0.99, y - r * 0.05);
    p.bezierCurveTo(x - r * 1.16, y - r * 0.95, x - r * 0.7, y - r * 1.72, x + r * 0.15, y - r * 1.66);
    p.bezierCurveTo(x + r * 1.0, y - r * 1.62, x + r * 1.22, y - r * 0.85, x + r * 0.99, y - r * 0.05);
    p.bezierCurveTo(x + r * 0.9, y - r * 0.5, x + r * 0.62, y - r * 0.8, x + r * 0.15, y - r * 0.84);
    p.bezierCurveTo(x - r * 0.38, y - r * 0.88, x - r * 0.78, y - r * 0.6, x - r * 0.99, y - r * 0.05);
    p.closePath(); P(p, col, C.ink, 5);
    ctx.save(); ctx.clip(p); ctx.strokeStyle = dk; ctx.lineWidth = 3.5;
    for (let i = 0; i < 6; i++) { const sx = x - r * 0.75 + i * r * 0.3; ctx.beginPath(); ctx.moveTo(sx, y - r * 0.8); ctx.bezierCurveTo(sx + r * 0.05, y - r * 1.25, sx + r * 0.35, y - r * 1.5, sx + r * 0.8, y - r * 1.45); ctx.stroke(); }
    ctx.restore();
    // sideburns
    P(rr(x - r * 1.0, y - r * 0.2, r * 0.16, r * 0.42, 6), col, C.ink, 3); P(rr(x + r * 0.84, y - r * 0.2, r * 0.16, r * 0.42, 6), col, C.ink, 3);
  } else if (hc === 'bob') {
    const p = new Path2D(); p.moveTo(x - r * 1.02, y + r * 0.1); p.quadraticCurveTo(x - r * 1.05, y - r * 1.15, x, y - r * 1.08);
    p.quadraticCurveTo(x + r * 1.05, y - r * 1.15, x + r * 1.02, y + r * 0.1); p.lineTo(x + r * 0.75, y - r * 0.35); p.lineTo(x - r * 0.75, y - r * 0.35); p.closePath();
    P(p, '#141217', C.ink, 5);
  } else if (hc === 'kid' || hc === 'teen') {
    const p = new Path2D(); p.moveTo(x - r * 1.0, y); p.quadraticCurveTo(x - r * 1.0, y - r * 1.15, x, y - r * 1.1); p.quadraticCurveTo(x + r * 1.0, y - r * 1.15, x + r * 1.0, y);
    p.lineTo(x + r * 0.6, y - r * 0.45); p.lineTo(x + r * 0.2, y - r * 0.3); p.lineTo(x - r * 0.2, y - r * 0.45); p.lineTo(x - r * 0.65, y - r * 0.3); p.closePath();
    P(p, '#121212', C.ink, 5);
  } else if (hc === 'short' || hc === 'grey' || hc === 'buzz' || hc === 'beard' || hc === 'beardg') {
    const col = hc === 'grey' ? '#C9CDD3' : hc === 'beardg' ? '#6B5A4A' : hc === 'buzz' ? '#5A4636' : '#2A2018';
    const p = new Path2D(); p.moveTo(x - r * 0.98, y - r * 0.1); p.quadraticCurveTo(x - r, y - r * 1.12, x, y - r * 1.06); p.quadraticCurveTo(x + r, y - r * 1.12, x + r * 0.98, y - r * 0.1);
    p.quadraticCurveTo(x + r * 0.6, y - r * 0.62, x, y - r * 0.62); p.quadraticCurveTo(x - r * 0.6, y - r * 0.62, x - r * 0.98, y - r * 0.1); p.closePath();
    P(p, col, C.ink, hc === 'buzz' ? 3 : 5);
    if (hc === 'beard' || hc === 'beardg') { const b = new Path2D(); b.moveTo(x - r * 0.85, y + r * 0.1); b.quadraticCurveTo(x - r * 0.7, y + r * 1.12, x, y + r * 1.08); b.quadraticCurveTo(x + r * 0.7, y + r * 1.12, x + r * 0.85, y + r * 0.1); b.quadraticCurveTo(x, y + r * 0.62, x - r * 0.85, y + r * 0.1); P(b, col, C.ink, 4); }
  } else if (hc === 'bald') {
    ctx.globalAlpha = 0.25; P(ell(x - r * 0.35, y - r * 0.55, r * 0.25, r * 0.12, -0.5), '#fff', null); ctx.globalAlpha = 1;
  } else if (hc === 'cap') {
    P(rr(x - r * 0.95, y - r * 1.05, r * 1.9, r * 0.6, [r * 0.9, r * 0.9, 4, 4]), '#2D4B73', C.ink, 4); P(rr(x - r * 0.2, y - r * 0.55, r * 1.35, r * 0.16, 6), '#2D4B73', C.ink, 4);
  } else if (hc === 'hardhat') {
    P(rr(x - r * 1.0, y - r * 1.08, r * 2.0, r * 0.68, [r, r, 4, 4]), '#F2C230', C.ink, 4); P(rr(x - r * 1.15, y - r * 0.5, r * 2.3, r * 0.14, 6), '#F2C230', C.ink, 4);
  } else if (hc === 'bun') {
    P(circ(x, y - r * 1.15, r * 0.38), '#4A2B1A', C.ink, 4);
    const p = new Path2D(); p.moveTo(x - r * 0.98, y - r * 0.1); p.quadraticCurveTo(x - r, y - r * 1.12, x, y - r * 1.06); p.quadraticCurveTo(x + r, y - r * 1.12, x + r * 0.98, y - r * 0.1); p.quadraticCurveTo(x, y - r * 0.55, x - r * 0.98, y - r * 0.1); P(p, '#4A2B1A', C.ink, 4);
  } else if (hc === 'chef') {
    P(rr(x - r * 0.8, y - r * 1.75, r * 1.6, r * 1.0, r * 0.5), C.white, C.ink, 4); P(rr(x - r * 0.9, y - r * 0.95, r * 1.8, r * 0.4, 6), C.white, C.ink, 4);
  }
  // face
  const ex = look * r * 0.18;
  const blink = (o.blink !== undefined ? o.blink : ((o.t || 0) * 0.37 + (o.seed || 0)) % 3.3 < 0.12);
  const eyeY = y - r * 0.02;
  if (o.shades) {
    P(rr(x - r * 0.75 + ex, eyeY - 14, r * 0.65, 26, 10), '#0B0B0D', C.ink, 3); P(rr(x + r * 0.1 + ex, eyeY - 14, r * 0.65, 26, 10), '#0B0B0D', C.ink, 3); line(x - r * 0.1 + ex, eyeY - 6, x + r * 0.1 + ex, eyeY - 6, C.ink, 3);
  } else if (blink) { line(x - r * 0.38 + ex - 7, eyeY, x - r * 0.38 + ex + 7, eyeY, C.ink, 4); line(x + r * 0.38 + ex - 7, eyeY, x + r * 0.38 + ex + 7, eyeY, C.ink, 4); }
  else { P(circ(x - r * 0.36 + ex, eyeY, 6.5), C.ink, null); P(circ(x + r * 0.36 + ex, eyeY, 6.5), C.ink, null); }
  if (K.glasses || o.glasses) { ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x - r * 0.36 + ex, eyeY, 15, 0, 6.28); ctx.moveTo(x + r * 0.36 + ex + 15, eyeY); ctx.arc(x + r * 0.36 + ex, eyeY, 15, 0, 6.28); ctx.stroke(); line(x - r * 0.36 + ex + 15, eyeY, x + r * 0.36 + ex - 15, eyeY, C.ink, 3); }
  // brows
  const br = o.brow || 0; // -1 worried, 1 angry
  const bc = K.hair === 'jensen' ? '#5B6068' : '#1E1A16';
  line(x - r * 0.5 + ex, eyeY - 20 - br * 3, x - r * 0.22 + ex, eyeY - 22 + br * 4, bc, 4);
  line(x + r * 0.22 + ex, eyeY - 22 + br * 4, x + r * 0.5 + ex, eyeY - 20 - br * 3, bc, 4);
  // blush
  ctx.globalAlpha = 0.18; P(ell(x - r * 0.55 + ex, y + r * 0.3, 11, 7), '#E0606A', null); P(ell(x + r * 0.55 + ex, y + r * 0.3, 11, 7), '#E0606A', null); ctx.globalAlpha = 1;
  // mouth
  const my = y + r * 0.42; const mood = o.mood !== undefined ? o.mood : 1; // 1 smile 0 flat -1 frown
  if (talk > 0.08) {
    const mh = 4 + talk * 20, mw = 15 + talk * 5;
    P(ell(x + ex, my, mw, mh), K.lips ? '#7A1A24' : '#5A1E1E', C.ink, 3.5);
    ctx.save(); ctx.clip(ell(x + ex, my, mw, mh)); P(ell(x + ex, my + mh * 0.9, mw * 0.7, mh * 0.6), '#E06C6C', null); ctx.restore();
  } else {
    ctx.beginPath(); ctx.moveTo(x - 18 + ex, my - mood * 2); ctx.quadraticCurveTo(x + ex, my + mood * 12, x + 18 + ex, my - mood * 2);
    ctx.strokeStyle = K.lips ? '#9E1E2A' : C.ink; ctx.lineWidth = K.lips ? 5 : 4.5; ctx.stroke();
  }
}

// ---------- props ----------
function wineGlass(x, y, s = 1, fill = '#7A1426') {
  withT(x, y, s, 0, () => {
    const b = new Path2D(); b.moveTo(-16, -40); b.quadraticCurveTo(-18, -8, 0, -6); b.quadraticCurveTo(18, -8, 16, -40); b.closePath();
    ctx.save(); ctx.clip(b); ctx.fillStyle = fill; ctx.fillRect(-20, -26, 40, 30); ctx.restore();
    P(b, null, C.ink, 3); line(0, -6, 0, 14, C.ink, 3); line(-10, 15, 10, 15, C.ink, 3);
  });
}
function whiskey(x, y, s = 1) {
  withT(x, y, s, 0, () => { const g = rr(-15, -30, 30, 32, 4); ctx.save(); ctx.clip(g); ctx.fillStyle = C.amber2; ctx.fillRect(-16, -14, 32, 20); ctx.restore(); P(g, 'rgba(255,255,255,0.12)', C.ink, 3); P(rr(-8, -12, 10, 9, 2), 'rgba(255,255,255,0.6)', null); });
}
function candle(x, y, t, s = 1) {
  withT(x, y, s, 0, () => {
    glow(0, -48, 90, C.amber, 0.35 + wob(t, 2.3, 0.05));
    P(rr(-8, -36, 16, 40, 3), C.paper, C.ink, 3);
    const f = new Path2D(); const fl = wob(t, 3.1, 3); f.moveTo(0, -60 + fl); f.quadraticCurveTo(10, -45, 0, -38); f.quadraticCurveTo(-10, -45, 0, -60 + fl); P(f, C.amber, C.ink, 2.5);
  });
}
function chip(x, y, s = 1, t = 0, glowA = 0.6) {
  withT(x, y, s, 0, () => {
    glow(0, 0, 110, C.green, glowA * (0.8 + wob(t, 1.2, 0.2)));
    for (let i = -3; i <= 3; i++) { line(i * 14, -60, i * 14, -48, '#B0B8C4', 5); line(i * 14, 48, i * 14, 60, '#B0B8C4', 5); line(-60, i * 14, -48, i * 14, '#B0B8C4', 5); line(48, i * 14, 60, i * 14, '#B0B8C4', 5); }
    P(rr(-50, -50, 100, 100, 10), '#1E2A22', C.ink, 5); P(rr(-30, -30, 60, 60, 6), C.green2, C.ink, 4);
    ctx.globalAlpha = 0.6; P(rr(-22, -22, 44, 44, 4), C.green, null); ctx.globalAlpha = 1;
  });
}
function box(x, y, w, h, col = '#C89B5E', label = '', lsize = 18) {
  P(rr(x, y, w, h, 3), col, C.ink, 4); line(x + w * 0.5, y, x + w * 0.5, y + h * 0.35, '#8F6A3A', 6);
  ctx.globalAlpha = 0.2; ctx.fillStyle = C.ink; ctx.fillRect(x + w * 0.62, y + 4, w * 0.36, h - 8); ctx.globalAlpha = 1;
  if (label) txt(label, x + w / 2, y + h * 0.66, lsize, '#3B2A14', 'Oswald', 700);
}
function phone(x, y, s = 1, ring = 0) { withT(x, y, s, ring ? wob(ring, 9, 0.12) : 0, () => { P(rr(-60, -18, 120, 40, 10), '#2B2B2B', C.ink, 4); P(rr(-70, -40, 140, 26, 12), '#2B2B2B', C.ink, 4); P(circ(0, 2, 12), '#555', C.ink, 3); }); }
function moneyStack(x, y, n, s = 1) { withT(x, y, s, 0, () => { for (let i = 0; i < n; i++) { P(rr(-50, -i * 12 - 12, 100, 14, 2), i % 2 ? '#5FAE5A' : '#4E9A4A', C.ink, 3); } txt('$', 0, -n * 12 + 2, 18, '#1F4D1C'); }); }
function stamp(s, x, y, size, col, t, rot = -0.18) { // slam-in stamp
  const k = easeOut(seg(t, 0, 0.18)); const sc = lerp(2.2, 1, k);
  alpha(k, () => withT(x, y, sc, rot, () => {
    ctx.font = `700 ${size}px Oswald`; const w = ctx.measureText(s).width + size * 0.6;
    ctx.strokeStyle = col; ctx.lineWidth = size * 0.09; ctx.strokeRect(-w / 2, -size * 0.7, w, size * 1.4);
    txt(s, 0, 4, size, col);
  }));
}
function banner(s, sub, x, y, t, col = C.amber, align = 'left') { // lower-third
  const k = easeOut(seg(t, 0, 0.35));
  ctx.font = '700 46px Oswald'; const w1 = ctx.measureText(s).width + 50;
  ctx.font = '500 28px Oswald'; const w2 = sub ? ctx.measureText(sub).width + 40 : 0;
  const ww = Math.max(w1, w2) * k;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y - 40, ww, sub ? 120 : 80); ctx.clip();
  P(rr(x, y - 34, w1, 68, 4), col, C.ink, 4); txt(s, x + 25, y + 2, 46, C.ink, 'Oswald', 700, 'left');
  if (sub) { P(rr(x, y + 34, w2, 44, 4), C.ink, null); txt(sub, x + 20, y + 57, 28, C.white, 'Oswald', 500, 'left'); }
  ctx.restore();
}
function handwrite(s, x, y, size, t, col = C.white, dur = 0.8, font = 'Kalam') { // write-on reveal
  ctx.font = `700 ${size}px ${font}`; const w = ctx.measureText(s).width;
  const k = clamp(t / dur);
  ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2 - 10, y - size, (w + 20) * k, size * 2); ctx.clip();
  txt(s, x, y, size, col, font, 700); ctx.restore();
}
function dramaTag(t) { alpha(0.85 * seg(t, 0, 0.3), () => { P(rr(W - 330, 88, 300, 46, 23), 'rgba(11,15,23,0.7)', null); txt('● NAATYA RUPANTAR', W - 180, 112, 24, C.amber, 'Oswald', 500); }); }
function bubble(s, x, y, t, dir = 1, size = 40, col = C.white) {
  const k = back(seg(t, 0, 0.25)); if (k <= 0) return;
  ctx.font = `700 ${size}px Baloo2`; const w = ctx.measureText(s).width + 50, h = size * 1.7;
  withT(x, y, k, 0, () => {
    const p = rr(-w / 2, -h - 30, w, h, 26); const tl = new Path2D(); tl.moveTo(-20 * dir, -32); tl.lineTo(-6 * dir + 10, -32); tl.lineTo(-30 * dir, 6); tl.closePath();
    P(tl, col, C.ink, 4); P(p, col, C.ink, 4); P(rr(-w / 2 + 3, -h - 27, w - 6, h - 6, 24), col, null); txt(s, 0, -h / 2 - 28, size, C.ink, 'Baloo2', 800);
  });
}
function sceneFade(t, d, fin = 0.25, fout = 0.25) { // black dip
  const a = Math.max(1 - t / fin, (t - (d - fout)) / fout); if (a > 0) alpha(a, () => fillAll('#000'));
}
function vignette() { const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function cam(x, y, z, fn) { ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-x, -y); fn(); ctx.restore(); }
function rain(t, n = 140, col = 'rgba(180,200,230,0.35)') { ctx.strokeStyle = col; ctx.lineWidth = 2; for (let i = 0; i < n; i++) { const x = (rnd(i) * W * 1.2 + t * 300) % (W * 1.2) - 100; const y = (rnd(i + 9) * H + t * 1400 * (0.8 + rnd(i) * 0.4)) % H; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 26); ctx.stroke(); } }
function stars(n = 80) { for (let i = 0; i < n; i++) { ctx.fillStyle = `rgba(255,255,255,${0.2 + rnd(i) * 0.5})`; ctx.fillRect(rnd(i + 3) * W, rnd(i + 7) * H * 0.55, 2, 2); } }
function skyline(y, col, seed, h = 300, lit = C.amber, wmin = 60) {
  let x = -40; let i = 0;
  while (x < W + 60) { const w = wmin + rnd(seed + i) * 90, hh = h * (0.35 + rnd(seed + i * 2) * 0.65); P(rr(x, y - hh, w, hh + 400, 2), col, null);
    ctx.fillStyle = lit; for (let r = 0; r < hh / 28 - 1; r++) for (let c = 0; c < w / 22 - 1; c++) if (rnd(seed + i * 31 + r * 7 + c) > 0.72) { ctx.globalAlpha = 0.55; ctx.fillRect(x + 10 + c * 22, y - hh + 14 + r * 28, 9, 13); ctx.globalAlpha = 1; }
    x += w + 6; i++; }
}
function capitol(x, y, s, col = '#E9E4D6') {
  withT(x, y, s, 0, () => {
    P(rr(-330, -60, 660, 60, 2), col, C.ink, 4); P(rr(-150, -150, 300, 90, 2), col, C.ink, 4);
    for (let i = 0; i < 9; i++) line(-130 + i * 32, -140, -130 + i * 32, -64, '#BDB6A3', 6);
    P(rr(-110, -200, 220, 50, 4), col, C.ink, 4); const d = new Path2D(); d.arc(0, -200, 105, Math.PI, 0); d.closePath(); P(d, col, C.ink, 4);
    P(rr(-14, -350, 28, 50, 4), col, C.ink, 4); P(circ(0, -358, 12), col, C.ink, 4);
    for (let i = 0; i < 11; i++) line(-300 + i * 60, -54, -300 + i * 60, -6, '#BDB6A3', 6);
  });
}
function table(x, y, w, col = C.wood, cloth = null) { if (cloth) { P(rr(x - w / 2 - 10, y, w + 20, 34, 6), cloth, C.ink, 4); P(rr(x - w / 2, y + 30, w, 120, 4), cloth, C.ink, 4); } else { P(rr(x - w / 2, y, w, 26, 6), col, C.ink, 4); line(x - w / 2 + 30, y + 26, x - w / 2 + 30, y + 150, C.ink, 8); line(x + w / 2 - 30, y + 26, x + w / 2 - 30, y + 150, C.ink, 8); } }
function chair(x, y, col = C.wood2, flip = 1) { P(rr(x - 40, y - 10, 80, 18, 4), col, C.ink, 4); P(rr(x - 40 * flip - (flip > 0 ? 0 : -0), y - 120, 16 * flip, 112, 4), col, C.ink, 4); line(x - 32, y + 8, x - 32, y + 70, C.ink, 6); line(x + 32, y + 8, x + 32, y + 70, C.ink, 6); }
function laptop(x, y, s, t, screenFn) { withT(x, y, s, 0, () => { P(rr(-180, -230, 360, 230, 12), '#2A2F3A', C.ink, 5); P(rr(-165, -216, 330, 200, 6), '#0F1726', null); ctx.save(); ctx.beginPath(); ctx.rect(-165, -216, 330, 200); ctx.clip(); if (screenFn) screenFn(); ctx.restore(); P(poly([-220, 0, 220, 0, 200, -16, -200, -16]), '#3A404C', C.ink, 5); }); }
function rack(x, y, h, t, seed) { P(rr(x, y - h, 110, h, 6), '#1B2230', C.ink, 4); for (let i = 0; i < h / 26 - 1; i++) { P(rr(x + 8, y - h + 10 + i * 26, 94, 18, 3), '#252E3F', C.ink, 2); for (let j = 0; j < 5; j++) { const on = rnd(seed + i * 7 + j + Math.floor(t * 6 + rnd(i + j) * 5)) > 0.45; ctx.fillStyle = on ? C.green : '#0E3A22'; ctx.fillRect(x + 16 + j * 9, y - h + 16 + i * 26, 5, 5); } } }
function toilet(x, y, s = 1) { withT(x, y, s, 0, () => { P(rr(-40, -150, 80, 70, 8), C.white, C.ink, 4); P(rr(-55, -90, 110, 30, 14), C.white, C.ink, 4); P(poly([-40, -62, 40, -62, 28, 0, -28, 0]), C.white, C.ink, 4); }); }
function roti(x, y, r, flip) { withT(x, y, 1, 0, () => { ctx.scale(1, Math.cos(flip * Math.PI)); P(ell(0, 0, r, r * 0.85), '#E7C27A', C.ink, 2); ctx.fillStyle = '#B98A3E'; ctx.fillRect(-r * 0.3, -r * 0.2, 4, 4); ctx.fillRect(r * 0.2, r * 0.1, 4, 4); }); }
function car(x, y, s, col) { withT(x, y, s, 0, () => { P(rr(-70, -40, 140, 34, 12), col, C.ink, 4); P(rr(-40, -66, 80, 30, 12), col, C.ink, 4); P(rr(-30, -60, 26, 20, 4), '#AFD3F2', C.ink, 2); P(rr(4, -60, 26, 20, 4), '#AFD3F2', C.ink, 2); P(circ(-40, -6, 14), C.ink, null); P(circ(40, -6, 14), C.ink, null); }); }
function key(x, y, s, col = C.amber) { withT(x, y, s, 0, () => { P(circ(-40, 0, 26), col, C.ink, 5); P(circ(-40, 0, 10), C.bg, C.ink, 4); P(rr(-16, -9, 90, 18, 4), col, C.ink, 5); P(rr(48, 9, 12, 20, 2), col, C.ink, 4); P(rr(64, 9, 10, 14, 2), col, C.ink, 4); }); }
function headset(hx, hy, r) { ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(hx, hy, r * 1.08, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); P(rr(hx - r * 1.2, hy - 14, 22, 36, 8), '#333', C.ink, 3); P(rr(hx + r * 1.2 - 22, hy - 14, 22, 36, 8), '#333', C.ink, 3); }
function camera(x, y, s, flash) { withT(x, y, s, 0, () => { P(rr(-50, -32, 100, 64, 10), '#222', C.ink, 4); P(rr(40, -22, 120, 44, 6), '#333', C.ink, 4); P(circ(160, 0, 26), '#1A1A1A', C.ink, 4); P(circ(160, 0, 14), '#3A6EA5', null); if (flash > 0) glow(190, 0, 260, '#FFFFFF', flash); }); }
function cardStack(x, y, label, sub, t, col = C.paper) { P(rr(x, y, 300, 380, 6), col, C.ink, 4); paperTex(x, y, 300, 380, 4); txt(label, x + 150, y + 50, 34, C.red, 'Oswald', 700); for (let i = 0; i < 10; i++) { ctx.fillStyle = 'rgba(30,30,30,0.35)'; ctx.fillRect(x + 30, y + 100 + i * 25, 240 * (0.6 + rnd(i) * 0.4), 9); } if (sub) txt(sub, x + 150, y + 350, 22, '#555', 'Oswald', 500); }
