// ---------- standalone-Short overrides of the kit overlays ----------
function partChip(n, T) { const a = T < 2.1 ? 1 : 1 - seg(T, 2.1, 2.5); if (a <= 0) return; alpha(a, () => { P(rr(140, 62, 250, 50, 25), C.red, null); txt('GTA 6 × BHARAT', 265, 89, 30, C.white, 'Oswald', 700); }); }
function endCard(u) { // 2 s end card: Follow Awazzzz + SUBSCRIBE
  const k = back(seg(u, 0, 0.35));
  alpha(seg(u, 0, 0.25), () => { ctx.fillStyle = 'rgba(0,0,0,0.42)'; ctx.fillRect(0, 0, W, H); });
  withT(CX, 880, k, 0, () => {
    P(rr(-380, -230, 760, 460, 30), 'rgba(10,14,24,0.9)', C.amber, 5);
    logoCircle(0, -135, 64);
    txt('Follow', 0, -22, 60, C.white, 'Baloo2', 800); txt('Awazzzz', 0, 44, 72, C.amber, 'Baloo2', 800);
    const pulse = 1 + 0.04 * Math.sin(u * 9);
    withT(0, 155, pulse, 0, () => { P(rr(-220, -50, 440, 100, 50), '#E62117', C.ink, 5); P(rr(-180, -24, 66, 48, 14), C.white, null); P(poly([-158, -12, -158, 12, -134, 0]), '#E62117', null); txt('SUBSCRIBE', 40, 4, 58, C.white); });
  });
}

// ---------- persistent fan-theory label (every frame, incl. hook and end card) ----------
function watermarkV() { alpha(0.92, () => logoCircle(84, 86, 42));
  ctx.font = '700 34px Oswald'; const s = 'KALPANA / FAN THEORY', w = ctx.measureText(s).width + 44;
  P(rr(40, 262, w, 54, 27), '#B23AEE', C.ink, 3); txt(s, 40 + w / 2, 290, 34, C.white, 'Oswald', 700); }

// ---------- helpers ----------
function chipV(s, x, y, k, col = C.green2, size = 38, fg = C.ink) { if (k <= 0) return; withT(x, y, k, 0, () => { ctx.font = `700 ${size}px Oswald`; const w = Math.min(880, ctx.measureText(s).width + 50); P(rr(-w / 2, -size * 0.95, w, size * 1.9, size * 0.95), col, C.ink, 4); txt(s, 0, 2, size, fg); }); }
KINDS.mahila = { body: '#7A3B5A', body2: '#612E47', skin: '#D9A77E', hair: 'bob', h: 0.93 };
const SRC = (s) => tag(s, 40, 366, 26, C.amber);
const GOLD = '#F4D06F', PARCH = '#EAD9AE', PARCH2 = '#D8C08A', RIVER = '#5FA8D3', LEAF = '#5C9E5A';

// Studio library graphics (animation-studio engine/graphics.js GFX-009 pin, GFX-010 route; fx.js VFX-015 stars) ported onto the kit canvas.
function pinG(t, t0, x, y, label, col = C.red) { if (t < t0) return; const k = ease(clamp((t - t0) / 0.6));
  for (let i = 0; i < 2; i++) { const p = ((t - t0) * 0.8 + i * 0.5) % 1; ctx.strokeStyle = `rgba(230,57,70,${1 - p})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y, 10 + p * 60, 4 + p * 22, 0, 0, 6.2832); ctx.stroke(); }
  ctx.save(); ctx.translate(x, y - (1 - k) * 200); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-30, -40, -36, -76, 0, -84); ctx.bezierCurveTo(36, -76, 30, -40, 0, 0); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke(); P(circ(0, -56, 12), '#fff', null); ctx.restore();
  if (label) { const a = clamp((t - t0 - 0.4) * 3); alpha(a, () => { ctx.font = '700 34px Oswald'; const w = ctx.measureText(label).width + 30; const lx = Math.min(x - w / 2, 930 - w); P(rr(lx, y + 14, w, 50, 10), 'rgba(18,27,43,0.88)', null); txt(label, lx + w / 2, y + 40, 34, GOLD); }); } }
function routeG(t, t0, pts, dur = 1.6, col = '#8B5E34', lw = 7) { const k = easeOut(clamp((t - t0) / dur)); if (k <= 0) return; let L = 0; const sg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); sg.push(d); L += d; }
  let rem = L * k; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.setLineDash([lw * 2, lw * 1.8]); ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 1; i < pts.length && rem > 0; i++) { const f = Math.min(1, rem / sg[i - 1]); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); rem -= sg[i - 1]; } ctx.stroke(); ctx.setLineDash([]); }
function starP(x, y, r1, r2) { const p = new Path2D(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; i ? p.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : p.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } p.closePath(); return p; }
function orbitStars(t, x, y, rad = 90, n = 5, col = GOLD) { for (let i = 0; i < n; i++) { const a = t * 3 + i * 6.2832 / n; P(starP(x + Math.cos(a) * rad, y + Math.sin(a) * rad * 0.35, 20, 9), col, C.ink, 3); } }
function sparkles(t, x, y, r, n = 8, seed = 3) { for (let i = 0; i < n; i++) { const p = (t * 0.7 + rnd(i + seed)) % 1, a = rnd(i * 5 + seed) * 6.2832; alpha(1 - p, () => P(starP(x + Math.cos(a) * r * p, y + Math.sin(a) * r * p, 12, 5), GOLD, null)); } }


function flag(x, y, s, t, col = C.red, ph = 0) { withT(x, y, s, 0, () => { line(0, 0, 0, -120, C.ink, 6); const wv = i => Math.sin(t * 6 + i * 0.6 + ph) * 8;
  const p = new Path2D(); p.moveTo(0, -120); for (let i = 0; i <= 6; i++) p.lineTo(i * 12, -120 + wv(i)); for (let i = 6; i >= 0; i--) p.lineTo(i * 12, -78 + wv(i)); p.closePath(); P(p, col, C.ink, 3); }); }
function wheel(x, y, r, a, col = '#8A5A2B') { withT(x, y, 1, a, () => { P(circ(0, 0, r), null, C.ink, 0); ctx.lineWidth = r * 0.16; ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, 6.2832); ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.stroke();
  for (let i = 0; i < 12; i++) { const q = i * 6.2832 / 12; line(0, 0, Math.cos(q) * r * 0.85, Math.sin(q) * r * 0.85, col, r * 0.06); } P(circ(0, 0, r * 0.18), GOLD, C.ink, 4); }); }
function scroll(x, y, s, col = '#E8D29A') { withT(x, y, s, 0, () => { P(rr(-120, -26, 240, 52, 26), col, C.ink, 4); P(ell(-120, 0, 14, 26), '#B8955A', C.ink, 3); P(ell(120, 0, 14, 26), '#B8955A', C.ink, 3); line(-90, -6, 80, -6, 'rgba(90,60,30,0.4)', 3); line(-90, 8, 60, 8, 'rgba(90,60,30,0.4)', 3); }); }
function controller(x, y, s, a = 0) { withT(x, y, s, a, () => { P(rr(-70, -34, 140, 68, 30), '#2A2F3A', C.ink, 4); P(circ(-36, 0, 12), '#555C6B', null); P(circ(36, -10, 8), C.red, null); P(circ(52, 6, 8), '#2BFF88', null); }); }
function floor(kind, t) {
  const y0 = kind === 'table' ? 1060 : 1160;
  if (kind === 'table') { ctx.fillStyle = grad(y0, H, '#6B4426', '#3A2414'); ctx.fillRect(-300, y0, W + 600, H); for (let i = 0; i < 9; i++) line(-300, y0 + 60 + i * 90, W + 300, y0 + 70 + i * 90, 'rgba(0,0,0,0.18)', 3); }
  else if (kind === 'court') { ctx.fillStyle = grad(y0, H, '#8A6A44', '#4A3420'); ctx.fillRect(-300, y0, W + 600, H); for (let r = 0; r < 8; r++) for (let i = -2; i < 14; i++) P(rr(i * 110 + (r % 2) * 55 - 40, y0 + 30 + r * 100, 100, 90, 6), r % 2 ? 'rgba(255,230,180,0.08)' : 'rgba(0,0,0,0.08)', null); }
  else if (kind === 'grass') { ctx.fillStyle = grad(y0, H, '#2E5E3A', '#16301E'); ctx.fillRect(-300, y0, W + 600, H); for (let i = 0; i < 40; i++) { const x = rnd(i + 2) * W, y = y0 + 80 + rnd(i * 3) * 650; line(x, y, x + Math.sin(t * 2 + i) * 6, y - 26, '#4E8E5A', 4); } }
  else if (kind === 'field') { ctx.fillStyle = grad(y0, H, '#5A3020', '#24140E'); ctx.fillRect(-300, y0, W + 600, H); for (let i = 0; i < 10; i++) flag(30 + i * 110, 1720 + (i % 2) * 40, 0.8, t, i % 2 ? '#FF8C1A' : C.red, i * 2); }
}

function SP_q(t, x, y, t0 = 0, s = 1) { const k = back(seg(t, t0, t0 + 0.3)); if (k <= 0) return; withT(x, y + Math.sin(t * 4) * 6, k * s, 0, () => txtStroke('?', 0, 0, 120, '#ffd166', '#2a1c14', 8)); }


// ================= GTA blitz #9: Agar Abhimanyu ka chakravyuh ek game mission hota? (KALPANA) =================
// Studio library ports: PRP-056 clipboard (mission/player card), VFX-011 impactStar (TWIST burst), VFX-015 stars, VFX-019 question, VFX-023 glow, GFX-009 pin / GFX-010 route.
// Own generic drawings: neon game board, wheel-formation rings of shields (abstract, no real map), pawn tokens (no epic character drawn), padlock, barrier, doors.
const VC = { x: CX, y: 760, R: 400, tilt: 0.62 };
function clipboardV(x, y, s, fn) { withT(x, y, s, 0, () => { shadow(0, 30, 200, 0.35); P(rr(-200, -300, 400, 520, 22), '#A0522D', C.ink, 5); P(rr(-176, -262, 352, 460, 10), '#FFFDF5', null); P(rr(-80, -322, 160, 60, 14), '#ADB5BD', C.ink, 4); if (fn) fn(); }); }
function impactStarV(t, x, y, t0, word = 'TWIST!', size = 1) { const k = t - t0; if (k < 0 || k > 1.3) return; const s = back(clamp(k / 0.18)) * size * (1 + 0.05 * Math.sin(k * 40)); const a = k > 1.0 ? 1 - (k - 1.0) / 0.3 : 1;
  alpha(a, () => withT(x, y, s, -0.12, () => { ctx.beginPath(); for (let i = 0; i < 24; i++) { const ang = i / 24 * 6.2832, rad = i % 2 ? 150 : 250 + rnd(i) * 40; ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad * 0.75); } ctx.closePath(); ctx.fillStyle = '#ffd166'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#2a1c14'; ctx.stroke(); txtStroke(word, 0, 8, 120, C.red, '#fff', 12); })); }
function gameBoard(t, y0 = 330, h = 860) { const x0 = 60, w = 960; shadow(CX, y0 + h + 20, 460, 0.45); P(rr(x0, y0, w, h, 26), '#151B33', '#6A5ACD', 6); ctx.save(); ctx.clip(rr(x0, y0, w, h, 26));
  for (let i = 1; i < 12; i++) line(x0 + i * 80, y0, x0 + i * 80, y0 + h, 'rgba(120,140,255,0.10)', 2); for (let i = 1; i < 11; i++) line(x0, y0 + i * 80, x0 + w, y0 + i * 80, 'rgba(120,140,255,0.10)', 2);
  glow(CX, y0 + h / 2, 520, '#6A5ACD', 0.18); ctx.restore(); }
// wheel-formation: concentric tilted rings of shields with one gap per ring (spiral-maze feel). k = reveal 0..1, rot = rotation speed, gapsOpen = outer gap state
function vyuh(t, k = 1, opt = {}) { const { x, y, R, tilt } = Object.assign({}, VC, opt), n = 7, rot = opt.rot ?? 0.12, dim = opt.dim ?? 1;
  glow(x, y, R * 0.5, GOLD, 0.25 * dim);
  for (let i = n - 1; i >= 0; i--) { const kk = clamp(k * n - (n - 1 - i)); if (kk <= 0) continue; const r = R * (i + 1.2) / (n + 0.2) * (0.85 + 0.15 * easeOut(kk)), m = 8 + i * 5, g0 = (i % 2 ? 1 : -1) * t * rot + i * 1.9;
    ctx.strokeStyle = `rgba(244,208,111,${0.18 * dim})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, r, r * tilt, 0, 0, 6.2832); ctx.stroke();
    for (let j = 0; j < m; j++) { const a = g0 + j / m * 6.2832; if (j === 0) continue; // the gap
      const sx = x + Math.cos(a) * r, sy = y + Math.sin(a) * r * tilt, sz = (11 + i * 1.6) * (0.75 + 0.25 * Math.sin(a) + 0.25) * easeOut(kk);
      alpha(dim, () => { P(ell(sx, sy, sz, sz * 1.15), (i + j) % 2 ? '#C0392B' : '#E08E2B', C.ink, 2.5); P(circ(sx, sy - sz * 0.15, sz * 0.32), GOLD, null); }); } } }
function token(x, y, s, col = GOLD, label = '', t = 0, glowK = 1) { withT(x, y, s, 0, () => { if (glowK > 0) glow(0, -40, 110, col, 0.45 * glowK); P(ell(0, 0, 44, 14), 'rgba(0,0,0,0.35)', null);
  P(poly([-36, 0, 36, 0, 18, -60, -18, -60]), col, C.ink, 4); P(ell(0, -62, 26, 9), col, C.ink, 3); P(circ(0, -92, 26), col, C.ink, 4); P(circ(-8, -100, 7), 'rgba(255,255,255,0.55)', null); });
  if (label) { ctx.font = '700 30px Oswald'; const w = ctx.measureText(label).width + 26; P(rr(x - w / 2, y + 16, w, 44, 10), 'rgba(10,14,24,0.88)', null); txt(label, x, y + 39, 30, col); } }
function padlock(x, y, s, closed = 1) { withT(x, y, s, 0, () => { ctx.lineWidth = 14; ctx.strokeStyle = '#BFC6D0'; ctx.beginPath(); ctx.arc(0, -40 - (1 - closed) * 26, 34, Math.PI, 0); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink;
  P(rr(-52, -44, 104, 84, 14), C.red, C.ink, 5); P(circ(0, -8, 10), C.ink, null); P(rr(-4, -6, 8, 26, 3), C.ink, null); }); }
function barrier(x, y, w, k) { if (k <= 0) return; withT(x, y, 1, 0, () => { const hh = 120 * easeOut(k); P(rr(-w / 2, -hh, w, hh, 8), '#5A3A1E', C.ink, 5); for (let i = 0; i < 5; i++) P(rr(-w / 2 + 10 + i * (w - 20) / 5, -hh + 14, (w - 20) / 5 - 12, 22, 4), (i % 2) ? '#E08E2B' : '#C0392B', null); }); }
function door(x, y, s, label, col, open = 0, check = 0) { withT(x, y, s, 0, () => { glow(0, -130, 180, col, 0.25); P(rr(-90, -260, 180, 260, [90, 90, 0, 0]), '#2A3245', C.ink, 6); P(rr(-70, -240, 140 * (1 - 0.6 * open), 240, [70, 70, 0, 0]), col, C.ink, 4);
  P(circ(-70 + 140 * (1 - 0.6 * open) - 20, -120, 8), C.ink, null); txt(label, 0, 46, 48, col); if (check > 0) withT(70, -250, back(check), 0, () => { P(circ(0, 0, 40), '#2BFF88', C.ink, 4); ctx.lineWidth = 9; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-5, 14); ctx.lineTo(20, -14); ctx.stroke(); }); }); }
function tick(x, y, ok, k) { if (k <= 0) return; withT(x, y, back(k), 0, () => { P(circ(0, 0, 30), ok ? '#2BFF88' : C.red, C.ink, 4); ctx.lineWidth = 8; ctx.strokeStyle = ok ? C.ink : '#fff'; ctx.beginPath(); if (ok) { ctx.moveTo(-14, 0); ctx.lineTo(-4, 11); ctx.lineTo(15, -11); } else { ctx.moveTo(-11, -11); ctx.lineTo(11, 11); ctx.moveTo(11, -11); ctx.lineTo(-11, 11); } ctx.stroke(); }); }
function bgBoard(t, d, c1 = '#0B0F24', c2 = '#2A1840', b = '#B23AEE') { sky(c1, c2); stars(80); floor('table', t); bokeh(t, 12, b, 5); }

// ---------- spoken opening hook ----------
DRAWV.hook1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => bgBoard(t, d) },
    { z: 0.45, draw: () => { gameBoard(t); vyuh(t, easeOut(seg(t, 0.1, 1.6))); } },
    { z: 0.85, draw: () => { shadow(800, 1240, 110); person(800, 1240, 'mahila', { t, s: 1.0, look: -0.4, mood: 0.7 }); controller(680, 1130, 1.0, wob(t, 0.6, 0.08)); SP_q(t, 640, 600, 0.9, 1.1); } }], drift(t, d, 18), 0, lerp(1.0, 1.08, ease(t / d)));
  if (t > d * 0.55) chipV('MISSION: CHAKRAVYUH?', CX, 1180, back(seg(t, d * 0.55, d * 0.55 + 0.35)), GOLD, 54, C.ink);
  vignette();
};

// ---------- n02: mission card, day 13, wheel-formation ----------
DRAWV.mission = (t, d) => {
  const D = LINES.n02.dur;
  depth([{ z: 0.05, haze: 1, draw: () => bgBoard(t, d, '#0E1424', '#1E2A44', GOLD) },
    { z: 0.5, draw: () => { gameBoard(t); vyuh(t, easeOut(seg(t, D * 0.25, D * 0.7))); } },
    { z: 0.85, draw: () => { const kc = back(seg(t, D * 0.22, D * 0.22 + 0.4)); if (kc > 0 && t < D * 0.6) withT(790, 640, kc, 0.06, () => { P(rr(-120, -130, 240, 260, 18), '#FFFDF5', C.ink, 5); P(rr(-120, -130, 240, 70, [18, 18, 0, 0]), C.red, C.ink, 5); txt('DIN', 0, -92, 40, C.white); txt('13', 0, 40, 150, C.ink, 'Oswald', 700); }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  const ks = back(seg(t, 0.15, 0.5)); if (ks > 0 && t < D * 0.3) withT(CX, 780, ks, -0.12, () => { P(rr(-330, -80, 660, 160, 18), 'rgba(178,58,238,0.15)', '#B23AEE', 10); txt('SIRF KALPANA', 0, 6, 100, '#B23AEE'); });
  chipV('MISSION: CHAKRAVYUH', CX, 470, back(seg(t, 0.1, 0.45)), GOLD, 58, C.ink);
  if (t > D * 0.6) chipV('DRONACHARYA KI PAHIYE JAISI VYUH-RACHNA', CX, 1190, back(seg(t, D * 0.6, D * 0.6 + 0.35)), C.red, 38, C.white);
  SRC('HINDUPEDIA · VYASAONLINE (MAHABHARAT, DIN 13)');
  vignette();
};

// ---------- n03: player = son of Arjun & Subhadra; Arjun away ----------
DRAWV.player = (t, d) => {
  const D = LINES.n03.dur, ta = D * 0.5, ka = easeInOut(seg(t, ta + 0.3, D - 0.2));
  depth([{ z: 0.05, haze: 1, draw: () => bgBoard(t, d, '#0B1424', '#183048', '#5FA8D3') },
    { z: 0.35, draw: () => { gameBoard(t); vyuh(t, 1, { dim: 0.35 }); } },
    { z: 0.8, draw: () => {
      clipboardV(370, 820, 1.0, () => { txt('PLAYER', 0, -225, 46, C.red, 'Oswald', 700); token(0, -40, 1.25, GOLD, '', t, 0.8); txt('ABHIMANYU', 0, 40, 58, C.ink, 'Oswald', 700); txt('ARJUN + SUBHADRA', 0, 104, 36, '#5A3A1E', 'Oswald', 700); txt('KA BETA', 0, 148, 36, '#5A3A1E', 'Oswald', 700); });
      if (t > ta) { const x = lerp(760, 900, ka), y = lerp(760, 560, ka); routeG(t, ta, [[760, 820], [840, 700], [900, 560]], 1.4, '#9DC4FF', 6); token(x, y, 0.85, '#9DC4FF', 'ARJUN', t, 0.6); } } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  if (t > ta) chipV('ARJUN DOOR: SAMSHAPTAKON SE YUDDH', CX, 1190, back(seg(t, ta, ta + 0.35)), '#9DC4FF', 38, C.ink);
  SRC('RAJAJI MAHABHARAT (MAHABHARATAONLINE) · HINDUPEDIA');
  vignette();
};
function easeInOut(u) { u = clamp(u); return u * u * (3 - 2 * u); }

// ---------- n04: twist: (katha) learned entry, not exit ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n04.dur, u = t - 0.3;
  depth([{ z: 0.05, haze: 1, draw: () => bgBoard(t, d, '#140A10', '#3A1420', '#FF8C1A') },
    { z: 0.4, draw: () => { scroll(260, 1120, 1.2); scroll(820, 1150, 1.0, '#D8C08A');
      for (let i = 0; i < 4; i++) { const p = (t * 0.6 + i * 0.25) % 1; ctx.strokeStyle = `rgba(244,208,111,${(1 - p) * 0.6})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(CX, 760, 120 + p * 360, 0, 6.2832); ctx.stroke(); } } },
    { z: 0.8, draw: () => { clipboardV(CX, 860, 1.1, () => { txt('KATHA KE ANUSAAR', 0, -215, 36, '#5A3A1E', 'Oswald', 700);
      const k1 = seg(u, D * 0.4, D * 0.4 + 0.3), k2 = seg(u, D * 0.75, D * 0.75 + 0.3);
      if (k1 > 0) { tick(-120, -110, true, k1); txt('ENTRY', 40, -104, 60, C.ink, 'Oswald', 700); txt('VYUH MEIN GHUSNA', 20, -50, 30, '#2E7D4F', 'Oswald', 700); }
      if (k2 > 0) { tick(-120, 60, false, k2); txt('EXIT', 30, 66, 60, C.ink, 'Oswald', 700); txt('BAHAR NIKALNA: ???', 20, 120, 30, C.red, 'Oswald', 700); } }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  impactStarV(t, CX, 560, 0.0, 'TWIST!', 0.9);
  if (t > D * 0.3) chipV('MAA KE GARBH MEIN HI SUNA', CX, 1190, back(seg(t, D * 0.3, D * 0.3 + 0.35)), GOLD, 44, C.ink);
  SRC('HINDUPEDIA: ABHIMANYU · LOKPRIYA KATHA');
  vignette();
};

// ---------- n05: entry open, exit locked; Pandavas held at the gate ----------
DRAWV.lock = (t, d) => {
  const D = LINES.n05.dur, gx = CX, gy = VC.y + VC.R * VC.tilt * 1.02, kin = easeInOut(seg(t, 0.2, D * 0.4)), kl = back(seg(t, D * 0.38, D * 0.38 + 0.35)), kb = seg(t, D * 0.6, D * 0.6 + 0.4);
  depth([{ z: 0.05, haze: 1, draw: () => bgBoard(t, d, '#0E1424', '#2A1A30', '#C0392B') },
    { z: 0.5, draw: () => { gameBoard(t); vyuh(t, 1, { rot: 0.05 });
      token(lerp(gx, VC.x, kin), lerp(gy + 40, VC.y + 40, kin), lerp(0.8, 0.6, kin), GOLD, '', t, 1);
      if (kl > 0) withT(gx, gy + 10, 1, 0, () => padlock(0, 0, 0.9 * kl, clamp(seg(t, D * 0.42, D * 0.5)))); } },
    { z: 0.85, draw: () => { if (kb > 0) { barrier(gx, 1110, 520, kb); const cols = ['#FFFFFF', '#7FDBA0', '#9DC4FF', '#FF9DC4']; for (let i = 0; i < 4; i++) token(300 + i * 160, 1230 + wob(t, 3, 4, i) * (kb >= 1 ? 1 : 0) - 6 * Math.max(0, Math.sin(t * 8 + i)), 0.7, cols[i], '', t, 0.4); } } }], drift(t, d, 12), 0, lerp(1.0, 1.04, ease(t / d)));
  chipV('ENTRY: KHULI', 300, 470, back(seg(t, 0.15, 0.5)), '#2BFF88', 48, C.ink);
  if (kl > 0) chipV('EXIT: LOCK', 760, 470, kl, C.red, 48, C.white);
  if (kb > 0) chipV('PANDAVON KO JAYADRATH NE ROKA', CX, 1010, back(seg(t, D * 0.62, D * 0.62 + 0.35)), GOLD, 42, C.ink);
  SRC('RAJAJI MAHABHARAT: "PREVENTED THE PANDAVAS…"');
  vignette();
};

// ---------- n06: alone inside, courage bigger than his age (respectful, no combat) ----------
DRAWV.alone = (t, d) => {
  const D = LINES.n06.dur, km = easeOut(seg(t, D * 0.45, D * 0.9));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#07091A', '#1A1030'); stars(120); floor('table', t); } },
    { z: 0.4, draw: () => { vyuh(t, 1, { R: 520, y: 820, dim: 0.45, rot: 0.04 }); } },
    { z: 0.8, draw: () => { lightPool(CX, 900, 300, GOLD, 0.45); token(CX, 900, 1.6, GOLD, '', t, 1.4); orbitStars(t, CX, 760, 150, 5, GOLD); sparkles(t, CX, 760, 260, 10, 9); } }], drift(t, d, 10), 0, lerp(1.0, 1.07, ease(t / d)));
  chipV('ANDAR AKELA', CX, 470, back(seg(t, 0.15, 0.5)), '#9DC4FF', 56, C.ink);
  if (t > D * 0.45) withT(CX, 1130, back(seg(t, D * 0.45, D * 0.45 + 0.35)), 0, () => { P(rr(-400, -80, 800, 160, 20), 'rgba(10,14,24,0.9)', GOLD, 4);
    txt('UMAR', -370, -44, 30, '#9DC4FF', 'Oswald', 700, 'left'); P(rr(-230, -60, 360, 30, 15), '#2A3245', null); P(rr(-230, -60, 160, 30, 15), '#9DC4FF', null);
    txt('HIMMAT', -370, 22, 30, GOLD, 'Oswald', 700, 'left'); P(rr(-230, 6, 600, 30, 15), '#2A3245', null); P(rr(-230, 6, 600 * km, 30, 15), GOLD, null); if (km > 0.95) txt('KAHIN BADI!', 230, -40, 34, GOLD, 'Oswald', 700); });
  SRC('HINDUPEDIA: "COURAGE … FAR GREATER THAN … HIS AGE"');
  vignette();
};

// ---------- n07: lesson: learn the exit before going in ----------
DRAWV.lesson = (t, d) => {
  const D = LINES.n07.dur;
  depth([{ z: 0.05, haze: 1, draw: () => bgBoard(t, d, '#0B1A1A', '#123A30', '#2BFF88') },
    { z: 0.4, draw: () => { gameBoard(t, 360, 800); vyuh(t, 1, { dim: 0.25, rot: 0.05 }); } },
    { z: 0.85, draw: () => { door(320, 1000, 1.2, 'ENTRY', GOLD, seg(t, D * 0.35, D * 0.5), seg(t, D * 0.45, D * 0.6)); door(760, 1000, 1.2, 'EXIT', '#2BFF88', seg(t, D * 0.6, D * 0.75), seg(t, D * 0.7, D * 0.85));
      routeG(t, D * 0.4, [[420, 900], [540, 820], [660, 900]], 1.0, GOLD, 7); } }], drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('MISSION KA SABAK', CX, 470, back(seg(t, 0.1, 0.45)), GOLD, 58, C.ink);
  if (t > D * 0.55) chipV('PEHLE EXIT PLAN BHI SEEKHO', CX, 1190, back(seg(t, D * 0.55, D * 0.55 + 0.35)), '#2BFF88', 46, C.ink);
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => bgBoard(t, d, '#0B0F24', '#2A1840', GOLD) },
    { z: 0.45, draw: () => { gameBoard(t); vyuh(t, 1, { dim: 0.6 }); } },
    { z: 0.85, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 50px Oswald'; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -50, w, 100, 30), col, C.ink, 5); P(poly([-20, 48, 10, 48, -30, 85]), col, C.ink, 5); txt(s, 0, 3, 50, C.ink); }); };
      bub('ENTRY?', 300, 1000, 0.5, GOLD); bub('EXIT?', 540, 1120, 0.9, '#2BFF88');
      shadow(820, 1240, 100); person(820, 1240, 'mahila', { t, s: 0.95, look: -0.3, mood: 0.7 }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('COMMENT KARO', CX, 450, back(seg(t, 0.1, 0.45)), GOLD, 50, C.ink);
  vignette();
};
