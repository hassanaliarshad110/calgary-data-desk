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
function clipboardV(x, y, s, fn) { withT(x, y, s, 0, () => { shadow(0, 30, 200, 0.35); P(rr(-200, -300, 400, 520, 22), '#A0522D', C.ink, 5); P(rr(-176, -262, 352, 460, 10), '#FFFDF5', null); P(rr(-80, -322, 160, 60, 14), '#ADB5BD', C.ink, 4); if (fn) fn(); }); }
function tick(x, y, ok, k) { if (k <= 0) return; withT(x, y, back(k), 0, () => { P(circ(0, 0, 30), ok ? '#2BFF88' : C.red, C.ink, 4); ctx.lineWidth = 8; ctx.strokeStyle = ok ? C.ink : '#fff'; ctx.beginPath(); if (ok) { ctx.moveTo(-14, 0); ctx.lineTo(-4, 11); ctx.lineTo(15, -11); } else { ctx.moveTo(-11, -11); ctx.lineTo(11, 11); ctx.moveTo(11, -11); ctx.lineTo(-11, 11); } ctx.stroke(); }); }
function bgBoard(t, d, c1 = '#0B0F24', c2 = '#2A1840', b = '#B23AEE') { sky(c1, c2); stars(80); floor('table', t); bokeh(t, 12, b, 5); }
function easeInOut(u) { u = clamp(u); return u * u * (3 - 2 * u); }

function impactStarV(t, x, y, t0, word = 'TWIST!', size = 1) { const k = t - t0; if (k < 0 || k > 1.3) return; const s = back(clamp(k / 0.18)) * size * (1 + 0.05 * Math.sin(k * 40)); const a = k > 1.0 ? 1 - (k - 1.0) / 0.3 : 1;
  alpha(a, () => withT(x, y, s, -0.12, () => { ctx.beginPath(); for (let i = 0; i < 24; i++) { const ang = i / 24 * 6.2832, rad = i % 2 ? 150 : 250 + rnd(i) * 40; ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad * 0.75); } ctx.closePath(); ctx.fillStyle = '#ffd166'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#2a1c14'; ctx.stroke(); txtStroke(word, 0, 8, 120, C.red, '#fff', 12); })); }
function gameBoard(t, y0 = 330, h = 860) { const x0 = 60, w = 960; shadow(CX, y0 + h + 20, 460, 0.45); P(rr(x0, y0, w, h, 26), '#151B33', '#6A5ACD', 6); ctx.save(); ctx.clip(rr(x0, y0, w, h, 26));
  for (let i = 1; i < 12; i++) line(x0 + i * 80, y0, x0 + i * 80, y0 + h, 'rgba(120,140,255,0.10)', 2); for (let i = 1; i < 11; i++) line(x0, y0 + i * 80, x0 + w, y0 + i * 80, 'rgba(120,140,255,0.10)', 2);
  glow(CX, y0 + h / 2, 520, '#6A5ACD', 0.18); ctx.restore(); }
// wheel-formation: concentric tilted rings of shields with one gap per ring (spiral-maze feel). k = reveal 0..1, rot = rotation speed, gapsOpen = outer gap state

// ================= GTA blitz #12: Desi GTA — Agar Hastinapur ki sadkon par chase hota? (KALPANA) =================
// Studio library ports: PRP-056 clipboard (mission card), PRP-013 clock (final-level timer), VFX-004 rain, VFX-011 impactStar (TWIST), VFX-015 stars,
// GFX-009 pin / GFX-010 route (abstract board, city pins only — no map of India).
// Own generic drawings: ancient-city street set (gates, domes, walls), stylised chariot + horse, soil cross-section with flood scar, trowel/brush, rising water.
const SAND = '#C9A26B', WALL = '#B9875A', WALL2 = '#8E6440', DOME = '#E3B866', WATER = '#3E8ED0', WATER2 = '#2A6FAE';
const asli = () => tag('ASLI JAANKARI', 40, 440, 28, '#2BFF88');
function rainV(t, n = 260, a = 0.5) { ctx.save(); ctx.strokeStyle = `rgba(200,220,255,${a})`; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < n; i++) { const px = ((rnd(i + 1) * (W + 400) - t * 300) % (W + 400) + W + 400) % (W + 400) - 200, py = (rnd(i * 7 + 3) * H + t * 1500 * (0.8 + rnd(i + 9) * 0.4)) % (H + 100) - 50; ctx.moveTo(px, py); ctx.lineTo(px - 8, py + 34); } ctx.stroke(); ctx.restore(); }
function clockV(x, y, s, t) { withT(x, y, s, 0, () => { P(circ(0, 0, 70), '#fff', C.ink, 7); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; line(Math.sin(a) * 50, -Math.cos(a) * 50, Math.sin(a) * 62, -Math.cos(a) * 62, C.ink, 5); } line(0, 0, Math.sin(t * 0.3) * 32, -Math.cos(t * 0.3) * 32, C.ink, 6); line(0, 0, Math.sin(t * 4) * 52, -Math.cos(t * 4) * 52, C.red, 3); }); }
// ancient city skyline (domes, towers, gate) — generic, invented
function oldCity(y, s, col, seed, scroll = 0, lit = null) { for (let i = -2; i < 9; i++) { const x = ((i * 190 * s - scroll) % (190 * s * 10) + 190 * s * 10) % (190 * s * 10) - 300, r = rnd(i + seed * 13 + Math.floor((i * 190 * s - scroll) / (190 * s * 10)) * 7), h = (120 + r * 220) * s, w = (120 + r * 60) * s;
  P(rr(x, y - h, w, h, 4), col, null); if (r > 0.45) { P(ell(x + w / 2, y - h, w * 0.42, w * 0.42), col, null); P(rr(x + w / 2 - 3, y - h - w * 0.62, 6, 30 * s, 2), col, null); } else { for (let k = 0; k < 4; k++) P(rr(x + k * w / 4, y - h - 16 * s, w / 8, 18 * s, 2), col, null); }
  if (lit) for (let k = 0; k < 3; k++) P(rr(x + w * 0.2 + k * w * 0.25, y - h * 0.55, w * 0.1, h * 0.18, [w * 0.05, w * 0.05, 0, 0]), lit, null); } }
function streetFront(y, scroll, t) { const span = 1400; for (let i = -1; i < 3; i++) { const x = i * span - (scroll % span);
  P(rr(x, y - 420, 520, 420, 6), WALL, C.ink, 4); P(rr(x + 40, y - 300, 120, 300, [60, 60, 0, 0]), '#3A2414', C.ink, 4); for (let k = 0; k < 3; k++) P(rr(x + 220 + k * 95, y - 340, 60, 90, [30, 30, 0, 0]), '#5A3A1E', C.ink, 3);
  P(rr(x - 10, y - 440, 540, 30, 4), WALL2, C.ink, 4); flag(x + 470, y - 440, 0.8, t, C.red, i);
  P(rr(x + 600, y - 560, 300, 560, 6), '#C79A63', C.ink, 4); P(ell(x + 750, y - 560, 150, 130), DOME, C.ink, 4); P(rr(x + 690, y - 220, 120, 220, [60, 60, 0, 0]), '#3A2414', C.ink, 4);
  P(rr(x + 980, y - 360, 380, 360, 6), WALL, C.ink, 4); for (let k = 0; k < 4; k++) P(rr(x + 1000 + k * 92, y - 390, 46, 34, 3), WALL2, C.ink, 3); P(rr(x + 1110, y - 240, 120, 240, [60, 60, 0, 0]), '#3A2414', C.ink, 4); } }
function road(y, scroll) { ctx.fillStyle = grad(y, H, '#B88E5A', '#6E5032'); ctx.fillRect(-300, y, W + 600, H - y + 300); for (let i = -1; i < 8; i++) { const x = i * 220 - (scroll * 1.3 % 220); P(rr(x, y + 160, 120, 14, 7), 'rgba(255,240,200,0.35)', null); } for (let i = 0; i < 30; i++) { const x = ((rnd(i + 4) * W * 1.5 - scroll * 1.3) % (W * 1.5) + W * 1.5) % (W * 1.5) - 200; P(circ(x, y + 40 + rnd(i * 3) * 300, 4 + rnd(i) * 6), 'rgba(80,55,30,0.45)', null); } }
function horse(x, y, s, t) { const g = t * 14; withT(x, y, s, 0, () => { const leg = (lx, ph) => { const a = Math.sin(g + ph) * 0.6; withT(lx, -70, 1, a, () => { P(rr(-8, 0, 16, 78, 7), '#5B3A22', C.ink, 3); P(rr(-10, 70, 20, 12, 4), C.ink, null); }); };
  leg(-60, 0); leg(50, 2.2); P(ell(0, -110, 100, 48), '#7A4E2E', C.ink, 5); withT(80, -140, 1, -0.7 + Math.sin(g) * 0.05, () => P(rr(-20, -80, 46, 100, 20), '#7A4E2E', C.ink, 5)); P(ell(140, -200, 52, 26), '#7A4E2E', C.ink, 5); P(circ(150, -208, 5), C.ink, null);
  P(poly([95, -235, 110, -270, 120, -230]), '#7A4E2E', C.ink, 3); for (let k = 0; k < 4; k++) P(ell(78 - k * 14, -190 + k * 22, 14, 26), '#2A1A10', null);
  withT(-100, -120, 1, 0.6 + Math.sin(g * 0.5) * 0.2, () => P(ell(-30, 0, 40, 12), '#2A1A10', null)); leg(-40, 3.1); leg(70, 1.1); P(rr(-40, -150, 80, 24, 6), C.red, C.ink, 3); }); }
function chariot(x, y, s, t, glowK = 0) { withT(x, y + Math.sin(t * 20) * 3 * s, s, 0, () => { if (glowK) glow(0, -120, 260, GOLD, 0.35 * glowK); P(ell(0, 10, 330, 22), 'rgba(0,0,0,0.3)', null);
  horse(200, 0, 0.95, t); line(10, -110, 150, -120, '#5A3A1E', 10);
  P(poly([-170, -60, 40, -60, 60, -170, -130, -190]), '#B5651D', C.ink, 6); P(rr(-150, -150, 180, 24, 6), GOLD, C.ink, 3); P(rr(-150, -110, 180, 14, 6), C.red, null);
  line(-160, -190, -170, -330, C.ink, 7); const p = new Path2D(); p.moveTo(-170, -330); for (let i = 0; i <= 6; i++) p.lineTo(-170 - i * 18, -330 + Math.sin(t * 9 + i * 0.7) * 9); for (let i = 6; i >= 0; i--) p.lineTo(-170 - i * 18, -285 + Math.sin(t * 9 + i * 0.7) * 9); p.closePath(); P(p, '#FF8C1A', C.ink, 3);
  wheel(-60, -40, 70, t * 12, '#8A5A2B'); });
  for (let i = 0; i < 7; i++) { const p = ((t * 1.4 + i / 7) % 1 + 1) % 1; alpha((1 - p) * 0.5, () => P(circ(x - 200 * s - p * 260 * s, y - 10 - p * 40 + rnd(i) * 20, (20 + p * 50) * s), '#D9B98A', null)); } }
function hud(t, label, col = GOLD) { P(rr(40, 1050, 330, 150, 18), 'rgba(10,14,24,0.82)', col, 3); txt(label, 205, 1088, 30, col, 'Oswald', 700); P(rr(66, 1120, 278, 26, 13), '#2A3245', null); P(rr(66, 1120, 278 * (0.55 + 0.4 * Math.abs(Math.sin(t * 1.3))), 26, 13), col, null); txt('SPEED', 205, 1176, 26, C.white, 'Oswald', 700);
  P(circ(820, 1100, 100), 'rgba(10,14,24,0.82)', col, 4); line(760, 1100, 880, 1100, 'rgba(255,255,255,0.25)', 3); line(820, 1040, 820, 1160, 'rgba(255,255,255,0.25)', 3); P(circ(820 + Math.sin(t) * 30, 1100 - Math.cos(t * 0.7) * 30, 10), C.red, null); txt('MINI-MAP', 820, 1222, 22, col, 'Oswald', 700); }
function streetScene(t, d, speed = 420, o = {}) { const sc = t * speed;
  depth([{ z: 0.05, haze: 1, draw: () => { sky(o.c1 || '#F2B36B', o.c2 || '#7A3B5A'); glow(CX, 420, 380, '#FFE3A3', 0.5); oldCity(760, 0.9, 'rgba(110,60,70,0.55)', 3, sc * 0.15); } },
    { z: 0.3, draw: () => { oldCity(880, 1.2, '#8E5A4A', 5, sc * 0.35, 'rgba(255,210,120,0.6)'); } },
    { z: 0.6, draw: () => { streetFront(1000, sc * 0.7, t); road(1000, sc); } },
    { z: 0.9, draw: () => { if (o.near) o.near(); } }], drift(t, d, 10), 0, o.zoom || lerp(1.0, 1.05, ease(t / d))); }

// ---------- spoken opening hook ----------
DRAWV.hook1 = (t, d) => {
  streetScene(t, d, 520, { near: () => { chariot(lerp(-200, 470, easeOut(seg(t, 0, 1.4))), 1170, 1.15, t, 1); } });
  if (t > d * 0.5) chipV('MISSION: HASTINAPUR CHASE?', CX, 560, back(seg(t, d * 0.5, d * 0.5 + 0.35)), GOLD, 54, C.ink);
  vignette();
};

// ---------- n01: mission card; Kuru capital (Mahabharat); car crossed -> chariot ----------
DRAWV.mission = (t, d) => {
  const D = LINES.n01.dur, kc = seg(t, D * 0.6, D * 0.6 + 0.4);
  streetScene(t, d, 360, { near: () => { chariot(lerp(380, 520, ease(t / d)), 1180, 1.1, t, 0.6); } });
  hud(t, 'RATH CHASE');
  const ks = back(seg(t, 0.15, 0.5)); if (ks > 0 && t < D * 0.32) withT(CX, 760, ks, -0.12, () => { P(rr(-330, -80, 660, 160, 18), 'rgba(178,58,238,0.2)', '#B23AEE', 10); txt('SIRF KALPANA', 0, 6, 100, '#B23AEE'); });
  chipV('MISSION: HASTINAPUR RATH CHASE', CX, 520, back(seg(t, 0.1, 0.45)), GOLD, 50, C.ink);
  if (t > D * 0.32 && t < D * 0.62) chipV('MAHABHARAT: KURU RAJYA KI RAJDHANI', CX, 640, back(seg(t, D * 0.32, D * 0.32 + 0.35)), C.red, 42, C.white);
  if (kc > 0) withT(CX, 700, back(kc), 0, () => { P(rr(-330, -110, 660, 220, 26), 'rgba(10,14,24,0.88)', GOLD, 4);
    withT(-180, 10, 0.55, 0, () => { P(rr(-150, -60, 300, 80, 20), '#3A86FF', C.ink, 5); P(rr(-90, -110, 170, 60, 16), '#3A86FF', C.ink, 5); P(circ(-80, 30, 34), C.ink, null); P(circ(80, 30, 34), C.ink, null); });
    ctx.lineWidth = 12; ctx.strokeStyle = C.red; ctx.beginPath(); ctx.moveTo(-270, -70); ctx.lineTo(-90, 80); ctx.moveTo(-90, -70); ctx.lineTo(-270, 80); ctx.stroke();
    txt('→', -10, 6, 80, GOLD); withT(170, 70, 0.32, 0, () => chariot(0, 0, 1, t)); });
  vignette();
};

// ---------- n02: twist — a real town named Hastinapur, Meerut district, by the Ganga (city pins only) ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n02.dur;
  depth([{ z: 0.05, haze: 1, draw: () => bgBoard(t, d, '#0B1424', '#183048', '#5FA8D3') },
    { z: 0.45, draw: () => { gameBoard(t, 330, 880); ctx.save(); ctx.clip(rr(60, 330, 960, 880, 26));
      const rv = (off, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(760 + off, 300); ctx.bezierCurveTo(620 + off, 520, 860 + off, 700, 700 + off, 900); ctx.bezierCurveTo(600 + off, 1020, 760 + off, 1150, 720 + off, 1240); ctx.stroke(); };
      rv(0, 'rgba(95,168,211,0.35)', 60); rv(0, RIVER, 26); for (let i = 0; i < 5; i++) { const p = (t * 0.25 + i / 5) % 1; P(circ(lerp(760, 720, p) + Math.sin(p * 9) * 60, lerp(300, 1240, p), 6), '#DFF3FF', null); }
      ctx.restore(); txt('GANGA', 830, 1040, 40, RIVER, 'Oswald', 700); } },
    { z: 0.8, draw: () => { pinG(t, D * 0.35, 560, 760, 'HASTINAPUR (AAJ)', C.red); pinG(t, D * 0.62, 330, 1020, 'MEERUT', '#3A86FF'); routeG(t, D * 0.7, [[330, 960], [440, 860], [540, 740]], 1.0, GOLD, 6); } }], drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  impactStarV(t, CX, 620, 0.0, 'TWIST!', 0.85);
  if (t > D * 0.3) chipV('NAAM SIRF KAHAANI MEIN NAHI', CX, 540, back(seg(t, D * 0.3, D * 0.3 + 0.35)), GOLD, 46, C.ink);
  if (t > D * 0.62) chipV('ZILA MEERUT, UTTAR PRADESH', CX, 1150, back(seg(t, D * 0.62, D * 0.62 + 0.35)), '#9DC4FF', 42, C.ink);
  asli(); SRC('WIKIPEDIA: HASTINAPUR');
  vignette();
};

// ---------- n03: 1950-52 dig by B.B. Lal; flood scar in the mound (per Lal, ~800 BCE) ----------
function soil(t, y0, kScar, kGlow) { const lay = [['#A47A4E', 90], ['#8C6239', 120], ['#B88E5A', 70], ['#6E4B2E', 130], ['#94704A', 150], ['#5A3B22', 300]]; let y = y0;
  lay.forEach(([c, h], i) => { const p = new Path2D(); p.moveTo(-300, y); for (let x = -300; x <= W + 300; x += 60) p.lineTo(x, y + Math.sin(x * 0.01 + i) * 10); p.lineTo(W + 300, y + h + 20); p.lineTo(-300, y + h + 20); p.closePath(); P(p, c, null); for (let k = 0; k < 14; k++) P(circ(rnd(k + i * 20) * W, y + 20 + rnd(k * 3 + i) * (h - 30), 4 + rnd(k) * 6), 'rgba(0,0,0,0.15)', null);
    if (i === 2 && kScar > 0) { ctx.save(); ctx.strokeStyle = WATER; ctx.lineWidth = 10; ctx.setLineDash([]); ctx.beginPath(); for (let x = -300; x <= -300 + (W + 600) * kScar; x += 30) ctx.lineTo(x, y + 30 + Math.sin(x * 0.03 + t * 3) * 18); ctx.stroke(); ctx.restore(); if (kGlow > 0) glow(CX, y + 35, 420, WATER, 0.35 * kGlow); }
    y += h; }); }
function trowel(x, y, s, a) { withT(x, y, s, a, () => { P(rr(-12, -170, 24, 110, 10), '#7A4E2E', C.ink, 4); P(poly([-60, -60, 60, -60, 0, 60]), '#BFC6D0', C.ink, 5); }); }
function brush(x, y, s, a) { withT(x, y, s, a, () => { P(rr(-10, -160, 20, 110, 8), '#C0392B', C.ink, 4); P(rr(-34, -60, 68, 30, 6), '#BFC6D0', C.ink, 4); for (let i = -4; i <= 4; i++) line(i * 7, -30, i * 8, 30, '#E3C38A', 6); }); }
DRAWV.dig = (t, d) => {
  const D = LINES.n03.dur, ks = seg(t, D * 0.42, D * 0.8), kg = seg(t, D * 0.7, D * 0.85);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#F2B36B', '#C77D4A'); oldCity(520, 0.8, 'rgba(120,70,50,0.45)', 9, 0); } },
    { z: 0.4, draw: () => { soil(t, 560, ks, kg); } },
    { z: 0.85, draw: () => { trowel(250 + Math.sin(t * 3) * 20, 700, 1.0, 0.5 + Math.sin(t * 3) * 0.1); brush(800, 720 + Math.sin(t * 6) * 8, 1.0, -0.4 + Math.sin(t * 6) * 0.15); } }], drift(t, d, 12), 0, lerp(1.0, 1.06, ease(t / d)));
  chipV('1950–52: B.B. LAL KI KHUDAAI', CX, 540, back(seg(t, 0.1, 0.45)), GOLD, 50, C.ink);
  if (ks > 0) chipV('GANGA KI BAADH KE NISHAAN?', CX, 1130, back(seg(t, D * 0.45, D * 0.45 + 0.35)), WATER, 46, C.white);
  if (kg > 0) chipV('~800 ISA PURV · LAL KE MUTABIK', CX, 1030, back(kg), '#9DC4FF', 40, C.ink);
  asli(); SRC('WIKIPEDIA: HASTINAPUR · B.B. LAL');
  vignette();
};

// ---------- n04: tradition — flood under Raja Nichakshu, capital to Kaushambi; caveat: not proof ----------
function blocks(t, lvl) { for (let i = 0; i < 6; i++) { const x = 120 + i * 140, h = 120 + rnd(i + 3) * 160; P(rr(x, 1060 - h, 110, h, 4), WALL, C.ink, 4); if (i % 2) P(ell(x + 55, 1060 - h, 48, 44), DOME, C.ink, 4); }
  const y = lerp(1180, 860, lvl); ctx.fillStyle = 'rgba(62,142,208,0.82)'; ctx.beginPath(); ctx.moveTo(-300, y); for (let x = -300; x <= W + 300; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.02 + t * 4) * 14); ctx.lineTo(W + 300, H + 300); ctx.lineTo(-300, H + 300); ctx.closePath(); ctx.fill(); }
DRAWV.katha = (t, d) => {
  const D = LINES.n04.dur, lv = easeInOut(seg(t, D * 0.15, D * 0.5)), kr = seg(t, D * 0.48, D * 0.62), kc = seg(t, D * 0.7, D * 0.7 + 0.4);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#2A3A5A', '#5A6A80'); oldCity(700, 0.8, 'rgba(40,50,70,0.6)', 2, 0); } },
    { z: 0.45, draw: () => { blocks(t, lv); rainV(t, 220, 0.45); } },
    { z: 0.85, draw: () => { scroll(CX, 660, 1.6); if (kr > 0) { pinG(t, D * 0.48, 230, 880, 'HASTINAPUR', C.red); pinG(t, D * 0.55, 820, 840, 'KAUSHAMBI', '#2BFF88'); routeG(t, D * 0.55, [[260, 840], [520, 760], [800, 800]], 1.0, GOLD, 8); } } }], drift(t, d, 10), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('PURAANI KATHA', CX, 530, back(seg(t, 0.1, 0.45)), '#E8D29A', 50, C.ink);
  if (t > D * 0.2 && t < D * 0.7) chipV('RAJA NICHAKSHU: GANGA KI BAADH', CX, 1150, back(seg(t, D * 0.2, D * 0.2 + 0.35)), WATER, 42, C.white);
  if (t > D * 0.5 && t < D * 0.7) chipV('RAJDHANI → KAUSHAMBI', CX, 1040, back(seg(t, D * 0.5, D * 0.5 + 0.35)), '#2BFF88', 44, C.ink);
  if (kc > 0) withT(CX, 1080, back(kc), 0, () => { P(rr(-420, -90, 840, 180, 24), 'rgba(10,14,24,0.92)', C.red, 5); txt('PAKKA SABOOT NAHI', 0, -20, 56, C.red, 'Oswald', 700); txt('dig + katha ko jodna = sirf andaaza', 0, 42, 34, C.white, 'Oswald', 600); });
  SRC('WIKIPEDIA: HASTINAPUR · OPEN MAGAZINE');
  vignette();
};

// ---------- n05: final level (kalpana) — race the flood to Kaushambi ----------
DRAWV.final = (t, d) => {
  const D = LINES.n05.dur, kw = seg(t, D * 0.3, D);
  streetScene(t, d, 620, { c1: '#3A4A6A', c2: '#6A5A70', near: () => { chariot(560, 1170, 1.05, t, 0.8);
    const wx = lerp(-700, -180, easeOut(kw)); ctx.fillStyle = 'rgba(62,142,208,0.9)'; ctx.beginPath(); ctx.moveTo(-300, 1300); for (let y = 1300; y >= 700; y -= 30) ctx.lineTo(wx + 300 + Math.sin(y * 0.03 + t * 8) * 40, y); ctx.lineTo(-300, 700); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 8; i++) P(circ(wx + 300 + Math.sin(i * 2 + t * 8) * 40, 720 + i * 75, 16), '#DFF3FF', null); } });
  rainV(t, 160, 0.35);
  P(rr(40, 330, 640, 92, 20), 'rgba(10,14,24,0.85)', C.red, 4); txt('FINAL LEVEL', 360, 378, 54, C.red, 'Oswald', 700);
  chipV('BAADH SE ESCAPE!', CX, 520, back(seg(t, D * 0.3, D * 0.3 + 0.35)), WATER, 56, C.white);
  clockV(820, 680, 0.9, t * 8);
  if (t > D * 0.6) { flag(880, 1020, 1.3, t, '#2BFF88'); chipV('→ KAUSHAMBI', 760, 1110, back(seg(t, D * 0.6, D * 0.6 + 0.35)), '#2BFF88', 42, C.ink); }
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => bgBoard(t, d, '#0B0F24', '#2A1840', GOLD) },
    { z: 0.45, draw: () => { withT(330, 760, 0.6, 0, () => chariot(0, 0, 1, t, 0.5)); } },
    { z: 0.85, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 50px Oswald'; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -50, w, 100, 30), col, C.ink, 5); P(poly([-20, 48, 10, 48, -30, 85]), col, C.ink, 5); txt(s, 0, 3, 50, C.ink); }); };
      bub('RATH RACE?', 330, 960, 0.5, GOLD); bub('BAADH ESCAPE?', 470, 1100, 1.0, '#7FC8FF');
      shadow(820, 1240, 100); person(820, 1240, 'mahila', { t, s: 0.95, look: -0.3, mood: 0.7 }); controller(700, 1130, 0.9, wob(t, 0.6, 0.08)); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('COMMENT KARO', CX, 450, back(seg(t, 0.1, 0.45)), GOLD, 50, C.ink);
  vignette();
};
