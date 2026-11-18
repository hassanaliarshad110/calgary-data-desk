// ===== Awazzzz GTA blitz #27 — 'What if: Arjun ki teer-andaazi ek mini-game hoti' (FAN-THEORY / KALPANA). Real details only from K.M. Ganguli, Mahabharata Adi Parva, Sambhava Parva CXXXIV-CXXXV (ibiblio sripedia m01135/m01136): artificial bird on a treetop; Yudhishthira and the others saw tree/teacher/brothers/bird and were told to stand apart; Arjuna saw only the bird, then only its head; 'Shoot'; head brought down to the ground.
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters; 'GTA 6' in Oswald. No epic character or deity drawn: pupils = abstract game pawns with name labels; target = wooden toy bird (no real bird hurt, no blood). No map.
// Studio library (select_assets.py): VFX-011 impactStar (TWIST), VFX-015 stars, LOT-001 arrow idea -> own arrowV, TXT-008 highlight -> chipV. Safe zone: key content x 40..940, y 250..1200; captions own y 1250..1450.
// ---------- standalone-Short overrides of the kit overlays ----------
function partChip(n, T) { const a = T < 2.1 ? 1 : 1 - seg(T, 2.1, 2.5); if (a <= 0) return; alpha(a, () => { P(rr(140, 62, 250, 50, 25), C.red, null); txt('GTA 6 WEEK SPECIAL', 265, 89, 26, C.white, 'Oswald', 700); }); }
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

// ---------- helpers ----------
function chipV(s, x, y, k, col = C.green2, size = 38, fg = C.ink) { if (k <= 0) return; withT(x, y, k, 0, () => { ctx.font = `700 ${size}px Oswald`; const w = Math.min(880, ctx.measureText(s).width + 50); P(rr(-w / 2, -size * 0.95, w, size * 1.9, size * 0.95), col, C.ink, 4); txt(s, 0, 2, size, fg); }); }
KINDS.mahila = { body: '#7A3B5A', body2: '#612E47', skin: '#D9A77E', hair: 'bob', h: 0.93 };
KINDS.yuva = { body: '#2E8B7A', body2: '#236B5E', skin: '#C68E62', hair: 'short', h: 0.96 };
const GOLD = '#F4D06F', CYAN = '#4CC9F0', RED = '#E63946', WOOD = '#5A3A22';
function floorV(y, c1, c2) { ctx.fillStyle = grad(y, H + 300, c1, c2); ctx.fillRect(-300, y, W + 600, H + 600 - y);
  // 2.5D stage floor: perspective grid + light pool + rim, so the lower frame is never an empty block
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 3;
  for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(CX + i * 40, y); ctx.lineTo(CX + i * 260, H + 300); ctx.stroke(); }
  for (let j = 1; j < 9; j++) { const yy = y + Math.pow(j / 9, 1.8) * (H + 300 - y); ctx.beginPath(); ctx.moveTo(-300, yy); ctx.lineTo(W + 300, yy); ctx.stroke(); }
  ctx.restore(); glow(CX, y + 260, 520, '#F4D06F', 0.10); ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(-300, y, W + 600, 4); }
function moonV(x, y, r) { glow(x, y, r * 4, '#DDE8FF', 0.35); P(circ(x, y, r), '#F2F0E6', null); alpha(0.25, () => P(circ(x - r * 0.3, y - r * 0.2, r * 0.25), '#C8C4B4', null)); }
const SP = (() => {
  const OUT = '#2a1c14', TAU = 6.2832;
  const R = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  const O = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); };
  const F = (fill, stroke, lw = 0) => { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke && lw) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); } };
  const pr = (fn, x, y, s) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; fn(); ctx.restore(); };
  return {
    phone: (x, y, s = 1, t = 0, fillK = 1) => pr(() => { R(-34, -130, 68, 130, 12); F('#222', OUT, 4); ctx.save(); R(-28, -122, 56, 112, 6); ctx.clip();
      ctx.fillStyle = '#16203A'; ctx.fillRect(-28, -122, 56, 112); ctx.fillStyle = grad(-122, -10, '#4361ee', '#4cc9f0'); ctx.fillRect(-28, -10 - 112 * fillK, 56, 112 * fillK);
      for (let i = 0; i < 4; i++) { R(-20, -110 + i * 24 + ((t * 30) % 24), 40, 16, 4); F('rgba(255,255,255,0.35)'); } ctx.restore(); }, x, y, s),
    coins: (x, y, s = 1, n = 5) => pr(() => { for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.ellipse(0, -12 - i * 14, 46, 14, 0, 0, TAU); F(i % 2 ? '#f2c230' : '#e0a800', OUT, 3); } }, x, y, s),
    clock: (x, y, s = 1, t = 0) => pr(() => { O(0, 0, 70); F('#fff', OUT, 7); for (let i = 0; i < 12; i++) { ctx.save(); ctx.rotate(i * Math.PI / 6); ctx.fillStyle = OUT; ctx.fillRect(-3, -60, 6, 12); ctx.restore(); }
      ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(t * 0.9) * 32, -Math.cos(t * 0.9) * 32); ctx.stroke(); ctx.strokeStyle = '#d62828'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(t * 6) * 52, -Math.cos(t * 6) * 52); ctx.stroke(); }, x, y, s),
    speedLines: (t, cx, cy, n = 22, a = 0.35) => { ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 4; for (let i = 0; i < n; i++) { const an = i / n * TAU + i, r0 = 380 + ((t * 600 + i * 97) % 500); ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0); ctx.lineTo(cx + Math.cos(an) * (r0 + 140), cy + Math.sin(an) * (r0 + 140)); ctx.stroke(); } ctx.restore(); },
    question: (t, x, y, t0 = 0, s = 1) => { const k = back(seg(t, t0, t0 + 0.3)); if (k <= 0) return; withT(x, y + Math.sin(t * 4) * 6, k * s, 0, () => txtStroke('?', 0, 0, 120, '#ffd166', '#2a1c14', 8)); },
    counter: (t, t0, { x = CX, y = 700, from = 0, to = 10, dur = 1.2, dec = 0, pre = '', suffix = '', size = 200, col = GOLD, label = '' } = {}) => { if (t < t0) return; const k = easeOut(clamp((t - t0) / dur)), v = lerp(from, to, k);
      const s = pre + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN')) + suffix;
      const pop = 1 + 0.12 * Math.max(0, 1 - Math.abs((t - t0 - dur) / 0.25)); withT(x, y, pop, 0, () => { txtStroke(s, 0, 0, size, col, C.ink, size * 0.09); if (label) txt(label, 0, size * 0.72, size * 0.3, C.white, 'Oswald', 700); }); },
  };
})();

function crossMark(x, y, s, k) { if (k <= 0) return; withT(x, y, k * s, 0, () => { P(circ(0, 0, 70), RED, C.ink, 6); ctx.strokeStyle = C.white; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-30, -30); ctx.lineTo(30, 30); ctx.moveTo(30, -30); ctx.lineTo(-30, 30); ctx.stroke(); }); }
function tickMark(x, y, s, k) { if (k <= 0) return; withT(x, y, k * s, 0, () => { P(circ(0, 0, 60), GREEN, C.ink, 6); ctx.strokeStyle = C.ink; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-26, 2); ctx.lineTo(-6, 24); ctx.lineTo(30, -22); ctx.stroke(); }); }
function impactStarV(t, x, y, t0, word = 'TWIST!', size = 1) { const k = t - t0; if (k < 0 || k > 1.3) return; const s = back(clamp(k / 0.18)) * size * (1 + 0.05 * Math.sin(k * 40)); const a = k > 1.0 ? 1 - (k - 1.0) / 0.3 : 1;
  alpha(a, () => withT(x, y, s, -0.12, () => { ctx.beginPath(); for (let i = 0; i < 24; i++) { const ang = i / 24 * 6.2832, rad = i % 2 ? 150 : 250 + rnd(i) * 40; ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad * 0.75); } ctx.closePath(); ctx.fillStyle = '#ffd166'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#2a1c14'; ctx.stroke(); txtStroke(word, 0, 8, 120, C.red, '#fff', 12); })); }
function easeInOut(u) { u = clamp(u); return u * u * (3 - 2 * u); }
function stampV(x, y, k, word, col = RED, size = 110, rot = -0.18) { if (k <= 0) return; const s = 1 + 1.4 * (1 - easeOut(clamp(k))); alpha(clamp(k * 2), () => withT(x, y, s, rot, () => {
  ctx.font = `700 ${size}px Oswald`; const w = ctx.measureText(word).width + 70; P(rr(-w / 2, -size * 0.75, w, size * 1.5, 18), 'rgba(230,57,70,0.10)', col, 12); txt(word, 0, 6, size, col, 'Oswald', 700); })); }
const GREEN = '#2BFF88';

// ---------- persistent fan-theory label (every frame, incl. hook and end card) ----------
function watermarkV() { alpha(0.92, () => logoCircle(84, 86, 42));
  ctx.font = '700 34px Oswald'; const s = 'KALPANA / FAN THEORY', w = ctx.measureText(s).width + 44;
  P(rr(40, 262, w, 54, 27), '#B23AEE', C.ink, 3); txt(s, 40 + w / 2, 290, 34, C.white, 'Oswald', 700); }
const SRC = (s, k = 1) => { if (k <= 0) return; alpha(k, () => { ctx.font = '600 28px Oswald'; const w = ctx.measureText(s).width + 36; P(rr(60, 1160, w, 44, 22), 'rgba(10,14,24,0.75)', 'rgba(255,255,255,0.5)', 2); txt(s, 60 + w / 2, 1183, 28, '#C9D3E6', 'Oswald', 600); }); };
const LEAF1 = '#2F6B3A', LEAF2 = '#3E8A48', LEAF3 = '#5DAA55', BARK = '#5A3A22', TOYW = '#C08A50', TOYD = '#8A5A2E', DUSK1 = '#1B1440', DUSK2 = '#E07A3A';

// ---------- own generic drawings (#27) ----------
// stylised tree (trunk + 3 canopy layers); returns nothing; top of canopy ~ (x, y - 640*s)
function treeV(x, y, s, t, tint = 0) { withT(x, y, s, 0, () => { shadow(0, 0, 200, 0.35);
  P(poly([-46, 0, 46, 0, 26, -420, -26, -420]), BARK, C.ink, 5); line(-8, -60, -14, -380, 'rgba(0,0,0,0.25)', 6); line(0, -300, 120, -420, BARK, 22); line(0, -260, -130, -380, BARK, 22);
  const sw = Math.sin(t * 1.3) * 6;
  [[-150, -420, 130, LEAF1], [150, -430, 130, LEAF1], [0, -480, 170, LEAF2], [-90, -560, 120, LEAF2], [90, -560, 120, LEAF3], [0, -620, 110, LEAF3]].forEach(([cx, cy, r, c], i) =>
    P(circ(cx + sw * (i % 2 ? 1 : -1), cy, r), c, C.ink, 5));
  alpha(0.18, () => { for (let i = 0; i < 9; i++) P(circ(-120 + rnd(i + 3) * 240, -620 + rnd(i * 7) * 220, 16), '#FFFFFF', null); }); }); }
// wooden toy bird on a peg (clearly a target, not a real bird). headOff: 0..1 pops head away
function toyBird(x, y, s, headOff = 0, t = 0) { withT(x, y, s, 0, () => {
  P(rr(-8, 0, 16, 70, 4), TOYD, C.ink, 3); P(rr(-40, 64, 80, 16, 6), TOYD, C.ink, 3);
  ctx.beginPath(); ctx.ellipse(0, -10, 70, 40, 0, 0, 6.2832); ctx.fillStyle = TOYW; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.stroke();
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(-6, -10, 50 - i * 14, 22 - i * 6, 0, 0.3, 2.8); ctx.strokeStyle = 'rgba(90,58,34,0.6)'; ctx.lineWidth = 3; ctx.stroke(); }
  P(poly([-62, -20, -120, -50, -110, -6]), TOYD, C.ink, 4); P(poly([-30, -30, 20, -30, -10, -70]), TOYD, C.ink, 4);
  const hx = 70 + headOff * 90, hy = -50 + headOff * (-60 + 380 * headOff * headOff), hr = headOff * 4;
  withT(hx, hy, 1, hr, () => { P(circ(0, 0, 32), TOYW, C.ink, 5); P(poly([26, -6, 62, 4, 26, 12]), '#E9A23B', C.ink, 4); P(circ(8, -8, 7), C.ink, null); P(circ(10, -10, 2.5), '#FFF', null); }); }); }
// game pawn token (abstract player piece — no epic character drawn)
function pawn(x, y, s, col, label, k = 1, dim = 0) { if (k <= 0) return; withT(x, y, back(k) * s, 0, () => { shadow(0, 0, 70, 0.35); glow(0, -80, 110, col, 0.35 * (1 - dim));
  P(poly([-56, 0, 56, 0, 30, -70, -30, -70]), col, C.ink, 5); P(rr(-40, -96, 80, 30, 12), col, C.ink, 5); P(circ(0, -130, 40), col, C.ink, 5); alpha(0.35, () => P(circ(-12, -142, 12), '#FFF', null));
  if (dim) alpha(dim * 0.55, () => { P(poly([-56, 0, 56, 0, 30, -70, -30, -70]), '#0B0F1E', null); P(rr(-40, -96, 80, 30, 12), '#0B0F1E', null); P(circ(0, -130, 40), '#0B0F1E', null); });
  if (label) { ctx.font = '700 32px Oswald'; const w = ctx.measureText(label).width + 30; P(rr(-w / 2, 16, w, 46, 23), 'rgba(10,14,24,0.88)', col, 3); txt(label, 0, 40, 32, C.white, 'Oswald', 700); } }); }
// game HUD: level banner + focus meter
function hudBar(x, y, k, lab, col = GOLD) { if (k <= 0) return; withT(x, y, back(k), 0, () => { P(rr(-250, -48, 500, 96, 20), 'rgba(10,14,24,0.88)', col, 5); P(rr(-250, -48, 110, 96, [20, 0, 0, 20]), col, null);
  txt('★', -195, 4, 54, C.ink, 'Oswald', 700); txt(lab, 55, 4, 54, C.white, 'Oswald', 700); }); }
function focusMeter(x, y, w, k, label = 'FOCUS') { P(rr(x - w / 2, y - 34, w, 68, 34), '#0E1220', C.ink, 5); const kk = clamp(k);
  if (kk > 0) { ctx.fillStyle = grad(0, 0, '#FFB703', GREEN); const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, RED); g.addColorStop(0.5, '#FFB703'); g.addColorStop(1, GREEN); P(rr(x - w / 2 + 8, y - 26, (w - 16) * kk, 52, 26), g, null); }
  txt(label + (kk >= 0.999 ? ': FULL!' : ` ${Math.round(kk * 100)}%`), x, y + 2, 38, kk > 0.55 ? C.ink : C.white, 'Oswald', 700); }
function crosshair(x, y, r, t, col = RED, a = 1) { alpha(a, () => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, 6.2832); ctx.stroke();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.beginPath(); ctx.moveTo(x + dx * r * 0.7, y + dy * r * 0.7); ctx.lineTo(x + dx * r * 1.3, y + dy * r * 1.3); ctx.stroke(); } ctx.restore(); }); }
function arrowV(x, y, ang, len = 260) { withT(x, y, 1, ang, () => { line(-len, 0, 0, 0, '#D9C29A', 9); P(poly([0, -16, 34, 0, 0, 16]), '#AFC0DA', C.ink, 3); P(poly([-len, 0, -len - 30, -20, -len + 30, -20, -len + 50, 0]), RED, C.ink, 3); P(poly([-len, 0, -len - 30, 20, -len + 30, 20, -len + 50, 0]), RED, C.ink, 3); }); }
function bowV(x, y, s, pull = 0) { withT(x, y, s, 0, () => { ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = BARK; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-170, 40); ctx.quadraticCurveTo(0, -120, 170, 40); ctx.stroke(); ctx.strokeStyle = GOLD; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-150, 30); ctx.quadraticCurveTo(0, -95, 150, 30); ctx.stroke();
  ctx.strokeStyle = '#EDE6D6'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-170, 40); ctx.lineTo(0, 40 + pull * 90); ctx.lineTo(170, 40); ctx.stroke(); ctx.restore(); }); }
function sparkles(t, x, y, t0, n = 16, col = GOLD) { const k = t - t0; if (k < 0 || k > 1.2) return; alpha(1 - k / 1.2, () => { for (let i = 0; i < n; i++) { const a = i / n * 6.2832 + rnd(i), r = 30 + k * (180 + rnd(i * 3) * 120);
  P(starP(x + Math.cos(a) * r, y + Math.sin(a) * r, 18 * (1 - k / 1.4), 7), i % 2 ? col : '#FFFFFF', null); } }); }
function starP(x, y, r1, r2) { const p = new Path2D(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; i ? p.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : p.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } p.closePath(); return p; }
function forestBG(t, seed = 1) { sky(DUSK1, DUSK2); glow(CX, 760, 420, '#FFB86B', 0.55); P(circ(CX, 760, 120), '#FFD9A0', null);
  for (let i = 0; i < 9; i++) { const x = -60 + i * 150 + rnd(i + seed) * 40, h = 380 + rnd(i * 5 + seed) * 220; alpha(0.85, () => { P(rr(x - 16, 1000 - h * 0.45, 32, h * 0.45, 6), '#2A1E3A', null); P(circ(x, 1000 - h * 0.5, 90 + rnd(i) * 40), '#2A2550', null); }); } }
function grassV(y, t) { ctx.fillStyle = grad(y, H + 200, '#355E2E', '#16261A'); ctx.fillRect(-300, y, W + 600, H + 500 - y); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-300, y, W + 600, 4);
  for (let i = 0; i < 40; i++) { const x = rnd(i * 2) * W, yy = y + 20 + rnd(i * 5) * 260, sw = Math.sin(t * 2 + i) * 4; line(x, yy, x + sw, yy - 26, '#5DAA55', 4); } glow(CX, y + 200, 500, GOLD, 0.08);
  // foreground: path, stones, bushes (2.5D depth in the lower frame)
  ctx.fillStyle = 'rgba(214,180,120,0.35)'; ctx.beginPath(); ctx.moveTo(CX - 40, y + 10); ctx.lineTo(CX + 40, y + 10); ctx.lineTo(CX + 380, H + 100); ctx.lineTo(CX - 380, H + 100); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 7; i++) { const sx = CX + (i - 3) * 120 * (1 + i * 0.05), sy = y + 300 + i * 70; P(rr(sx - 30 - i * 4, sy, 60 + i * 8, 26 + i * 3, 14), 'rgba(170,150,120,0.55)', null); }
  for (const [bx, by, r] of [[-20, 1760, 220], [180, 1860, 170], [1100, 1740, 230], [880, 1870, 170], [60, 1560, 120], [1040, 1540, 120]]) { P(circ(bx, by, r), '#1F3F24', C.ink, 5); P(circ(bx + r * 0.3, by - r * 0.35, r * 0.6), '#2B5A30', null); }
  for (let i = 0; i < 14; i++) { const fx = 80 + rnd(i * 9) * 920, fy = y + 380 + rnd(i * 4) * 380; P(circ(fx, fy, 9), i % 2 ? '#FFD166' : '#FF8FA3', null); } }
function bubbleV(s, x, y, k, col = GOLD, size = 52) { if (k <= 0) return; withT(x, y, back(k), 0, () => { ctx.font = `700 ${size}px Oswald`; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -size * 1.05, w, size * 2.1, 30), col, C.ink, 5); P(poly([-20, size * 1.03, 14, size * 1.03, -34, size * 1.03 + 36]), col, C.ink, 5); txt(s, 0, 3, size, C.ink); }); }

// ---------- spoken opening hook: "Socho agar Arjun ki teer-andaazi ek mini-game hoti!" ----------
DRAWV.hook1 = (t, d) => {
  const hit = t > 2.4, ho = hit ? easeOut(seg(t, 2.4, 3.2)) : 0;
  depth([{ z: 0.05, haze: 1, draw: () => { forestBG(t, 2); stars(30); } },
    { z: 0.45, draw: () => { grassV(1060, t); treeV(CX + 80, 1080, 1.0, t); toyBird(CX + 80, 420, 0.95, ho, t); } },
    { z: 0.85, draw: () => { bowV(CX - 40, 1180, 1.1, hit ? 0 : 0.6 * ease(seg(t, 0.2, 1.4))); if (!hit) { arrowV(CX - 40 + 30, 1180 + 30, -1.5708, 250); } } }],
    drift(t, d, 14), 0, lerp(1.0, 1.08, ease(t / d)));
  if (t > 1.9 && t < 2.45) { const u = seg(t, 1.9, 2.45); arrowV(lerp(CX - 10, CX + 150, u), lerp(1150, 380, u), -1.38, 250); }
  crosshair(CX + 150, 375, 70, t, RED, t < 2.4 ? 0.9 : 0);
  sparkles(t, CX + 150, 370, 2.42, 18);
  hudBar(CX, 1130, seg(t, 0.4, 0.8), 'MINI-GAME: TEER', GOLD);
  vignette();
};

// ---------- n01: Level 1 from the Mahabharat — Drona had an artificial bird placed on a treetop ----------
DRAWV.lvl = (t, d) => {
  const D = LINES.n01.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { forestBG(t, 5); } },
    { z: 0.45, draw: () => { grassV(1080, t); treeV(CX, 1100, 1.15, t); toyBird(CX + 10, 360 + (1 - back(seg(t, D * 0.55, D * 0.55 + 0.5))) * -500, 1.0, 0, t); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.06, ease(t / d)));
  hudBar(CX, 1010, seg(t, 0.05, 0.4), 'LEVEL 1', GOLD);
  stampV(780, 760, seg(t, 0.3, 0.6), 'SIRF KALPANA', '#B23AEE', 60, 0.12);
  chipV('NAKLI CHIDIYA = TARGET', CX, 1130, back(seg(t, D * 0.62, D * 0.62 + 0.35)), GOLD, 46, C.ink);
  SRC('SOURCE: Mahabharata, Adi Parva CXXXIV (Ganguli)', seg(t, 0.6, 1.0) * (1 - seg(t, D * 0.6, D * 0.62)));
  vignette();
};

// ---------- n02: "what do you see?" — Yudhishthira sees everything, told to stand apart ----------
DRAWV.ask = (t, d) => {
  const D = LINES.n02.dur, items = [['PED', 0.32], ['AAP', 0.42], ['BHAI', 0.5], ['CHIDIYA', 0.58]], go = easeInOut(seg(t, D * 0.78, D * 0.95));
  depth([{ z: 0.05, haze: 1, draw: () => { forestBG(t, 8); } },
    { z: 0.4, draw: () => { grassV(1080, t); treeV(760, 1090, 0.85, t); toyBird(770, 560, 0.75, 0, t); } },
    { z: 0.7, draw: () => { pawn(lerp(260, -160, go), 1060, 1.25, CYAN, 'YUDHISHTHIR', seg(t, 0.15, 0.5), go * 0.6); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.05, ease(t / d)));
  bubbleV('KYA DIKH RAHA HAI?', CX, 400, seg(t, 0.05, 0.4), GOLD, 56);
  items.forEach(([s, f], i) => { const k = seg(t, D * f, D * f + 0.25); if (k > 0) withT(300, 600 + i * 100, back(k), 0, () => { P(rr(-170, -40, 340, 80, 40), 'rgba(10,14,24,0.9)', CYAN, 4); txt(s, -20, 3, 44, C.white, 'Oswald', 700); tickMark(125, 0, 0.45, 1); }); });
  stampV(CX, 1000, seg(t, D * 0.72, D * 0.72 + 0.3), 'ALAG HAT JAAO!', RED, 76, -0.08);
  SRC('SOURCE: Ganguli, Adi Parva CXXXIV', seg(t, 0.6, 1.0) * (1 - seg(t, D * 0.6, D * 0.65)));
  vignette();
};

// ---------- n03: Duryodhana, Bhima, all — same answer; nobody got to shoot ----------
DRAWV.rest = (t, d) => {
  const D = LINES.n03.dur, cols = ['#E76F51', '#F4A261', '#9D7BFF', '#4CC9F0', '#2A9D8F'], labs = ['DURYODHAN', 'BHIM', '', '', ''];
  depth([{ z: 0.05, haze: 1, draw: () => { forestBG(t, 11); } },
    { z: 0.4, draw: () => { grassV(1000, t); treeV(CX, 1010, 0.7, t); toyBird(CX + 6, 590, 0.6, 0, t); } },
    { z: 0.75, draw: () => { cols.forEach((c, i) => { const t0 = 0.1 + i * 0.25, off = easeInOut(seg(t, D * 0.45 + i * 0.12, D * 0.45 + i * 0.12 + 0.5)); pawn(150 + i * 195, 1110 + (i % 2) * 30 + off * 40, i < 2 ? 1.0 : 0.85, c, labs[i], seg(t, t0, t0 + 0.3), off * 0.7); }); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.04, ease(t / d)));
  chipV('SABKA WAHI JAWAAB', CX, 400, back(seg(t, 0.4, 0.75)), C.white, 50, C.ink);
  const k = back(seg(t, D * 0.55, D * 0.55 + 0.35)); if (k > 0) withT(CX, 600, k, 0.03, () => { glow(0, 0, 260, RED, 0.35); P(rr(-260, -80, 520, 160, 30), 'rgba(10,14,24,0.92)', RED, 6); txt('TEER CHALE:', -50, 4, 58, C.white, 'Oswald', 700); txtStroke('0', 190, 6, 110, RED, C.ink, 8); });
  vignette();
};

// ---------- n04 twist: Arjuna sees only the bird, then only its head; "Shoot!" — head to the ground ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n04.dur, z1 = easeInOut(seg(t, D * 0.15, D * 0.32)), z2 = easeInOut(seg(t, D * 0.36, D * 0.5)), zoom = 1 + z1 * 0.9 + z2 * 1.2;
  const fire = D * 0.68, hitT = fire + 0.45, ho = easeOut(seg(t, hitT, hitT + 0.9));
  const fx = 568, fy = 530; // toy-bird head (measured on screen at zoom 1)
  const ax = lerp(fx, CX, 0.35), ay = lerp(fy, 700, 0.35); // anchor a bit off the head so the head drifts toward centre
  ctx.save(); ctx.translate(ax, ay); ctx.scale(zoom, zoom); ctx.translate(-ax, -ay);
  depth([{ z: 0.05, haze: 1, draw: () => { forestBG(t, 14); } },
    { z: 0.45, draw: () => { grassV(1080, t); treeV(CX, 1100, 1.15, t); toyBird(CX + 10, 600, 1.0, ho, t); } }], 0, 0, 1);
  ctx.restore();
  const sx = ax + (fx - ax) * zoom, sy = ay + (fy - ay) * zoom; // head on screen
  const tun = Math.max(z1 * 0.55, z2 * 0.85); if (tun > 0) { ctx.save(); const g = ctx.createRadialGradient(sx, sy, 140, sx, sy, 700); g.addColorStop(0, 'rgba(5,6,14,0)'); g.addColorStop(1, `rgba(5,6,14,${tun})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  impactStarV(t, CX, 470, 0.05, 'TWIST!', 0.85);
  chipV('SIRF CHIDIYA', CX, 1000, back(seg(t, D * 0.18, D * 0.24)) * (1 - seg(t, D * 0.36, D * 0.4)), GOLD, 56, C.ink);
  chipV('SIRF USKA SIR!', CX, 1000, back(seg(t, D * 0.4, D * 0.46)) * (1 - seg(t, fire, fire + 0.2)), GREEN, 60, C.ink);
  if (t < hitT) crosshair(sx, sy, 90 - z2 * 20, t, RED, seg(t, D * 0.4, D * 0.45));
  bubbleV('CHALAAO!', 300, 420, seg(t, D * 0.56, D * 0.6) * (1 - seg(t, D * 0.8, D * 0.85)), C.white, 64);
  if (t > fire && t < hitT) { const u = seg(t, fire, hitT); arrowV(lerp(CX - 200, sx, u), lerp(1500, sy, u), lerp(-1.25, -1.15, u), 260); }
  sparkles(t, sx, sy, hitT, 20);
  const kh = back(seg(t, hitT + 0.3, hitT + 0.6)); if (kh > 0) withT(CX, 1050, kh, -0.03, () => { glow(0, 0, 300, GREEN, 0.4); P(rr(-280, -64, 560, 128, 64), GREEN, C.ink, 6); txt('TARGET HIT!', 0, 4, 64, C.ink); });
  SRC('SOURCE: Ganguli, Adi Parva CXXXV', seg(t, 1.2, 1.6) * (1 - seg(t, D * 0.5, D * 0.55)));
  vignette();
};

// ---------- n05: mini-game rule (kalpana): everything blurred, only the target sharp; focus full -> arrow ----------
DRAWV.rule = (t, d) => {
  const D = LINES.n05.dur, bl = seg(t, D * 0.15, D * 0.4), fm = easeInOut(seg(t, D * 0.45, D * 0.85));
  // cheap 'blur': ghosted copies + frosted haze (ctx.filter blur was ~3 s/frame)
  const bgL = () => [{ z: 0.05, haze: 1, draw: () => { forestBG(t, 17); } }, { z: 0.45, draw: () => { grassV(1060, t); treeV(CX, 1080, 1.0, t); } }];
  depth(bgL(), drift(t, d, 8), 0, lerp(1.0, 1.04, ease(t / d)));
  if (bl > 0) { [[-1, -1], [1, 1], [1, -1]].forEach(([a, b]) => alpha(0.33 * bl, () => { ctx.save(); ctx.translate(a * bl * 14, b * bl * 14); depth(bgL(), drift(t, d, 8), 0, lerp(1.0, 1.04, ease(t / d))); ctx.restore(); }));
    ctx.fillStyle = `rgba(30,24,60,${0.45 * bl})`; ctx.fillRect(0, 0, W, H); }
  // sharp target in a clean lens
  const lk = back(seg(t, D * 0.25, D * 0.45)); if (lk > 0) withT(CX, 690, lk, 0, () => { glow(0, 0, 280, GOLD, 0.35); P(circ(0, 0, 210), 'rgba(255,184,107,0.18)', GOLD, 8); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 204, 0, 6.2832); ctx.clip(); toyBird(-10, 40, 1.5, 0, t); ctx.restore(); crosshair(0, 0, 230, t, RED, 0.8); });
  hudBar(CX, 410, seg(t, 0.05, 0.4), 'MINI-GAME RULE', '#B23AEE');
  focusMeter(CX, 1000, 760, fm);
  const rk = back(seg(t, D * 0.86, D * 0.86 + 0.3)); if (rk > 0) withT(CX, 1120, rk, 0, () => { P(rr(-250, -54, 500, 108, 54), GREEN, C.ink, 6); txt('TEER READY ➜', 0, 4, 54, C.ink); });
  vignette();
};

// ---------- n06: lesson — "jahan focus, wahin jeet" ----------
DRAWV.lesson = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B0F24', '#3A1E5E'); stars(60); bokeh(t, 12, GOLD, 41); } },
    { z: 0.5, draw: () => { withT(CX, 640, 1 + 0.02 * Math.sin(t * 4), 0, () => { glow(0, 0, 380, GOLD, 0.45); [[220, RED], [170, '#FFFFFF'], [120, RED], [70, '#FFFFFF'], [30, GOLD]].forEach(([r, c]) => P(circ(0, 0, r), c, C.ink, 5)); });
      if (t > 0.35) arrowV(CX + 20, 630, -0.5, 300); sparkles(t, CX, 640, 0.35, 16); } }], drift(t, d, 10), 0, lerp(1.0, 1.05, ease(t / d)));
  const k = back(seg(t, 0.2, 0.55)); if (k > 0) withT(CX, 1040, k, -0.02, () => { P(rr(-430, -110, 860, 220, 34), 'rgba(10,14,24,0.92)', GOLD, 6); txt('JAHAN FOCUS,', 0, -36, 64, C.white, 'Oswald', 700); txt('WAHIN JEET!', 0, 44, 72, GOLD, 'Oswald', 700); });
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { forestBG(t, 21); } },
    { z: 0.5, draw: () => { grassV(1120, t); treeV(300, 1130, 0.75, t); toyBird(306, 650, 0.6, 0, t); withT(760, 700, 1, 0, () => { glow(0, 0, 220, GOLD, 0.35); [[150, RED], [110, '#FFFFFF'], [70, RED], [32, GOLD]].forEach(([r, c]) => P(circ(0, 0, r), c, C.ink, 5)); });
      shadow(CX, 1240, 110); person(CX, 1240, 'mahila', { t, s: 1.0, look: 0.2, mood: 0.7, arms: [[0.3, 0.2], [-2.1, -0.4]] }); } }], drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  bubbleV('POORA PED?', 300, 400, seg(t, 0.3, 0.6), '#9DC4FF', 54); bubbleV('SIRF TARGET?', 760, 480, seg(t, 1.1, 1.4), GOLD, 54);
  chipV('COMMENT KARO!', CX, 1100, back(seg(t, 2.0, 2.35)), GREEN, 52, C.ink);
  vignette();
};
