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
const PINS = { KURUKSHETRA: [300, 470], HASTINAPUR: [700, 560], INDRAPRASTHA: [450, 840] };

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

// own generic drawings: parchment game-map board (abstract terrain, no real outline), palace, flag, chariot wheel, bow, fish target, scrolls
function mapBoard(t, k = 1, pinsAt = 99, labels = true) { // k = unroll 0..1
  const x0 = 70, y0 = 330, w = 860, h = 840 * k; if (k <= 0) return;
  shadow(CX, y0 + h + 20, 420, 0.4); P(rr(x0, y0, w, h, 18), PARCH, C.ink, 6); ctx.save(); ctx.clip(rr(x0, y0, w, h, 18));
  paperTex(x0, y0, w, h, 5);
  ctx.strokeStyle = RIVER; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(820, 340); ctx.bezierCurveTo(700, 620, 860, 780, 600, 1180); ctx.stroke(); // abstract river
  for (let i = 0; i < 9; i++) { const mx = 120 + i * 40, my = 380 + (i % 2) * 18; P(poly([mx - 34, my + 30, mx, my - 26, mx + 34, my + 30]), '#B79B64', C.ink, 3); }
  for (let i = 0; i < 14; i++) { const tx = 110 + rnd(i + 9) * 760, ty = 640 + rnd(i * 3 + 2) * 480; if (Math.hypot(tx - 450, ty - 840) < 110) continue; P(circ(tx, ty, 16), LEAF, C.ink, 2); }
  ctx.strokeStyle = PARCH2; ctx.lineWidth = 3; for (let i = 1; i < 6; i++) { line(x0, y0 + i * 140, x0 + w, y0 + i * 140, 'rgba(120,90,40,0.12)', 2); line(x0 + i * 145, y0, x0 + i * 145, y0 + 840, 'rgba(120,90,40,0.12)', 2); }
  ctx.restore();
  // compass
  withT(840, 1080, 1, t * 0.2, () => { P(circ(0, 0, 44), 'rgba(255,255,255,0.35)', C.ink, 3); P(poly([0, -40, 9, 0, 0, 40, -9, 0]), C.red, C.ink, 2); });
  if (k > 0.9) { routeG(t, pinsAt + 0.2, [PINS.KURUKSHETRA, [380, 560], PINS.HASTINAPUR]); routeG(t, pinsAt + 0.5, [PINS.HASTINAPUR, [620, 760], PINS.INDRAPRASTHA]);
    let i = 0; for (const n in PINS) { pinG(t, pinsAt + i * 0.25, ...PINS[n], labels ? n : ''); i++; } } }
function flag(x, y, s, t, col = C.red, ph = 0) { withT(x, y, s, 0, () => { line(0, 0, 0, -120, C.ink, 6); const wv = i => Math.sin(t * 6 + i * 0.6 + ph) * 8;
  const p = new Path2D(); p.moveTo(0, -120); for (let i = 0; i <= 6; i++) p.lineTo(i * 12, -120 + wv(i)); for (let i = 6; i >= 0; i--) p.lineTo(i * 12, -78 + wv(i)); p.closePath(); P(p, col, C.ink, 3); }); }
function palace(x, y, s, t, col = '#F2E3C0', col2 = '#D9B97A', grow = 1) { withT(x, y, s, 0, () => { const g = clamp(grow);
  shadow(0, 8, 300, 0.35); ctx.save(); ctx.beginPath(); ctx.rect(-400, -600 * g, 800, 620 * g); ctx.clip();
  P(rr(-280, -180, 560, 190, 6), col, C.ink, 5); for (let i = 0; i < 7; i++) P(rr(-250 + i * 80, -130, 40, 120, [20, 20, 0, 0]), '#8A5A2B', C.ink, 3);
  P(rr(-170, -330, 340, 160, 6), col, C.ink, 5); P(rr(-40, -110, 80, 120, [40, 40, 0, 0]), '#5A3A1E', C.ink, 4);
  for (const tx of [-260, 260]) { P(rr(tx - 36, -360, 72, 360, 6), col2, C.ink, 5); P(ell(tx, -360, 44, 40), GOLD, C.ink, 4); }
  P(ell(0, -330, 120, 110), GOLD, C.ink, 5); P(rr(-6, -470, 12, 40, 4), C.ink, null); ctx.restore();
  if (g > 0.95) { flag(-260, -398, 0.8, t, C.red); flag(260, -398, 0.8, t, C.amber, 1); flag(0, -470, 0.9, t, '#FF8C1A', 2); } }); }
function wheel(x, y, r, a, col = '#8A5A2B') { withT(x, y, 1, a, () => { P(circ(0, 0, r), null, C.ink, 0); ctx.lineWidth = r * 0.16; ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, 6.2832); ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.stroke();
  for (let i = 0; i < 12; i++) { const q = i * 6.2832 / 12; line(0, 0, Math.cos(q) * r * 0.85, Math.sin(q) * r * 0.85, col, r * 0.06); } P(circ(0, 0, r * 0.18), GOLD, C.ink, 4); }); }
function fish(x, y, s, a, eyeHit = 0) { withT(x, y, s, a, () => { P(ell(0, 0, 70, 30), '#F28C38', C.ink, 4); P(poly([60, 0, 105, -32, 105, 32]), '#F28C38', C.ink, 4); P(circ(-40, -6, 9), '#fff', C.ink, 2); P(circ(-40, -6, 4), C.ink, null); if (eyeHit > 0) glow(-40, -6, 60 * eyeHit, GOLD, 0.8); }); }
function bowArrow(x, y, s, draw = 0, flyK = -1) { withT(x, y, s, -0.15, () => { ctx.lineWidth = 12; ctx.strokeStyle = '#8A5A2B'; ctx.beginPath(); ctx.arc(-40, 0, 170, -1.1, 1.1); ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(-40, 0, 170, -1.1, 1.1); ctx.stroke();
  const ex = Math.cos(1.1) * 170 - 40, ey = Math.sin(1.1) * 170, px = ex - 90 * draw; line(ex, -ey, px, 0, '#eee', 3); line(px, 0, ex, ey, '#eee', 3);
  if (flyK < 0) { line(px, 0, px + 260, 0, '#6B4A2A', 7); P(poly([px + 260, -14, px + 292, 0, px + 260, 14]), '#BFC6D0', C.ink, 2); P(poly([px, 0, px + 24, -16, px + 40, -16, px + 16, 0, px + 40, 16, px + 24, 16]), C.red, null); } }); }
function scroll(x, y, s, col = '#E8D29A') { withT(x, y, s, 0, () => { P(rr(-120, -26, 240, 52, 26), col, C.ink, 4); P(ell(-120, 0, 14, 26), '#B8955A', C.ink, 3); P(ell(120, 0, 14, 26), '#B8955A', C.ink, 3); line(-90, -6, 80, -6, 'rgba(90,60,30,0.4)', 3); line(-90, 8, 60, 8, 'rgba(90,60,30,0.4)', 3); }); }
function controller(x, y, s, a = 0) { withT(x, y, s, a, () => { P(rr(-70, -34, 140, 68, 30), '#2A2F3A', C.ink, 4); P(circ(-36, 0, 12), '#555C6B', null); P(circ(36, -10, 8), C.red, null); P(circ(52, 6, 8), '#2BFF88', null); }); }
// foreground floors so the lower part of the 9:16 frame is part of the picture (captions sit on top of it)
function floor(kind, t) {
  const y0 = kind === 'table' ? 1060 : 1160;
  if (kind === 'table') { ctx.fillStyle = grad(y0, H, '#6B4426', '#3A2414'); ctx.fillRect(-300, y0, W + 600, H); for (let i = 0; i < 9; i++) line(-300, y0 + 60 + i * 90, W + 300, y0 + 70 + i * 90, 'rgba(0,0,0,0.18)', 3); }
  else if (kind === 'court') { ctx.fillStyle = grad(y0, H, '#8A6A44', '#4A3420'); ctx.fillRect(-300, y0, W + 600, H); for (let r = 0; r < 8; r++) for (let i = -2; i < 14; i++) P(rr(i * 110 + (r % 2) * 55 - 40, y0 + 30 + r * 100, 100, 90, 6), r % 2 ? 'rgba(255,230,180,0.08)' : 'rgba(0,0,0,0.08)', null); }
  else if (kind === 'grass') { ctx.fillStyle = grad(y0, H, '#2E5E3A', '#16301E'); ctx.fillRect(-300, y0, W + 600, H); for (let i = 0; i < 40; i++) { const x = rnd(i + 2) * W, y = y0 + 80 + rnd(i * 3) * 650; line(x, y, x + Math.sin(t * 2 + i) * 6, y - 26, '#4E8E5A', 4); } }
  else if (kind === 'field') { ctx.fillStyle = grad(y0, H, '#5A3020', '#24140E'); ctx.fillRect(-300, y0, W + 600, H); for (let i = 0; i < 10; i++) flag(30 + i * 110, 1720 + (i % 2) * 40, 0.8, t, i % 2 ? '#FF8C1A' : C.red, i * 2); }
}

// ---------- spoken opening hook: "Socho agar Mahabharat ek open-world game hota!" ----------
DRAWV.hook1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B0F24', '#2A1840'); stars(90); floor('table', t); bokeh(t, 12, '#B23AEE', 5); } },
    { z: 0.45, draw: () => { mapBoard(t, easeOut(seg(t, 0.1, 1.2)), 1.0, false); } },
    { z: 0.85, draw: () => { shadow(760, 1240, 110); person(760, 1240, 'mahila', { t, s: 1.0, look: -0.4, mood: 0.7 }); controller(640, 1130, 1.0, wob(t, 0.6, 0.08));
      SP_q(t, 560, 560, 0.9, 1.2); } }], drift(t, d, 18), 0, lerp(1.0, 1.08, ease(t / d)));
  if (t > d * 0.55) chipV('OPEN-WORLD MAHABHARAT?', CX, 1180, back(seg(t, d * 0.55, d * 0.55 + 0.35)), GOLD, 54, C.ink);
  vignette();
};
function SP_q(t, x, y, t0 = 0, s = 1) { const k = back(seg(t, t0, t0 + 0.3)); if (k <= 0) return; withT(x, y + Math.sin(t * 4) * 6, k * s, 0, () => txtStroke('?', 0, 0, 120, '#ffd166', '#2a1c14', 8)); }

// ---------- n01: only imagination, map from the real epic ----------
DRAWV.intro = (t, d) => {
  const D = LINES.n01.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0E1424', '#1E2A44'); floor('table', t); bokeh(t, 12, GOLD, 9); } },
    { z: 0.6, draw: () => { mapBoard(t, 1, 0.3, true); } }], drift(t, d, 14), 0, lerp(1.0, 1.04, ease(t / d)));
  const k = back(seg(t, 0.2, 0.55)); if (k > 0 && t < D * 0.55) withT(CX, 760, k, -0.12, () => { ctx.globalAlpha = 0.92; P(rr(-330, -80, 660, 160, 18), 'rgba(178,58,238,0.15)', '#B23AEE', 10); txt('SIRF KALPANA', 0, 6, 100, '#B23AEE'); ctx.globalAlpha = 1; });
  if (t > D * 0.55) chipV('MAP: ASLI MAHAKAVYA SE', CX, 1200, back(seg(t, D * 0.55, D * 0.55 + 0.35)), GOLD, 46, C.ink);
  vignette();
};

// ---------- n02: Hastinapur ----------
DRAWV.hast = (t, d) => {
  const D = LINES.n02.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1A0F22', '#4A2A2A'); floor('court', t); glow(CX, 700, 600, '#FF8C1A', 0.25); } },
    { z: 0.3, draw: () => { for (let i = 0; i < 6; i++) flag(80 + i * 170, 1150, 0.9, t, i % 2 ? C.red : GOLD, i); } },
    { z: 0.65, draw: () => { lightPool(CX, 1080, 520, GOLD, 0.3); palace(CX, 1080, 1.25, t); sparkles(t, CX, 640, 260, 10, 7); } }], drift(t, d, 18), 0, lerp(1.0, 1.06, ease(t / d)));
  chipV('REGION 1: HASTINAPUR', CX, 470, back(seg(t, 0.2, 0.55)), GOLD, 58, C.ink);
  if (t > D * 0.4) chipV('KURUKSHETRA YUDDH: ISI SINGHASAN KE LIYE', CX, 1200, back(seg(t, D * 0.4, D * 0.4 + 0.35)), C.red, 38, C.white);
  SRC('WORLDHISTORY.ORG · MAHABHARATA');
  vignette();
};

// ---------- n03: Indraprastha, barren land -> kingdom; Purana Qila? ----------
DRAWV.indra = (t, d) => {
  const D = LINES.n03.dur, g = easeOut(seg(t, 0.4, D * 0.45));
  depth([{ z: 0.05, haze: 1, draw: () => { sky(lerp(0, 1, g) > 0.5 ? '#0F2030' : '#2A1E14', g > 0.5 ? '#1E4A3A' : '#5A4024'); } },
    { z: 0.35, draw: () => { ctx.fillStyle = grad(1080, H, g > 0.5 ? '#3E7A46' : '#9C7A48', g > 0.5 ? '#1A3A22' : '#4A3420'); ctx.fillRect(-300, 1080, W + 600, H); for (let i = 0; i < 10; i++) { const tx = 40 + i * 110, s = clamp(g * 1.4 - rnd(i) * 0.4); if (s > 0) withT(tx, 1110, s, 0, () => { P(rr(-8, -60, 16, 60, 4), '#6B4A2A', null); P(circ(0, -80, 40), LEAF, C.ink, 3); }); } } },
    { z: 0.7, draw: () => { lightPool(CX, 1080, 480, '#7FDBA0', 0.25 * g); palace(CX, 1080, 1.15, t, '#EAF2E3', '#BFD6A8', g); if (g < 1) alpha(1 - g, () => txt('BANJAR ZAMEEN', CX, 900, 56, '#F2E3C0')); } }], drift(t, d, 16), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('REGION 2: INDRAPRASTHA', CX, 470, back(seg(t, 0.2, 0.55)), '#7FDBA0', 58, C.ink);
  if (t > D * 0.5) { withT(CX, 600, back(seg(t, D * 0.5, D * 0.5 + 0.35)), -0.03, () => { P(rr(-330, -52, 660, 104, 52), '#2A3245', C.ink, 4); txt('PURANA QILA, DILLI?', 0, 4, 52, C.white); }); }
  if (t > D * 0.78) chipV('PAKKA PATA NAHI', 640, 710, back(seg(t, D * 0.78, D * 0.78 + 0.35)), C.red, 44, C.white);
  SRC(t < D * 0.5 ? 'WORLDHISTORY.ORG · MAHABHARATA' : 'WIKIPEDIA: INDRAPRASTHA · "LOCATION UNCERTAIN"');
  vignette();
};

// ---------- n04: side mission: the swayamvar target (spinning fish, eye) ----------
DRAWV.side = (t, d) => {
  const D = LINES.n04.dur, tf = D * 0.62, fk = clamp((t - tf) / 0.45);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0A1424', '#183048'); floor('grass', t); bokeh(t, 10, RIVER, 21); } },
    { z: 0.5, draw: () => { // pole + spinning wheel with fish, water bowl below
      line(700, 1180, 700, 560, '#6B4A2A', 14); withT(700, 540, 1, 0, () => { ctx.save(); ctx.scale(1, 0.35); wheel(0, 0, 150, t * 2.2, '#8A5A2B'); ctx.restore(); });
      fish(700 + Math.cos(t * 2.2) * 120, 520 + Math.sin(t * 2.2) * 30, 1.0, 0, fk >= 1 ? 1 - seg(t, tf + 0.45, tf + 1.4) : 0);
      P(ell(700, 1150, 200, 50), '#3A6E9A', C.ink, 5); alpha(0.5, () => fish(700 + Math.cos(t * 2.2) * 80, 1150, 0.4, Math.PI, 0)); } },
    { z: 0.85, draw: () => { bowArrow(230, 900, 1.1, clamp(t / (tf - 0.1)), fk > 0 ? fk : -1);
      if (fk > 0 && fk < 1) { const ax = lerp(400, 700 + Math.cos(tf * 2.2) * 120 - 30, fk), ay = lerp(860, 515, fk); withT(ax, ay, 1, Math.atan2(515 - 860, 300), () => { line(-240, 0, 0, 0, '#6B4A2A', 7); P(poly([0, -14, 32, 0, 0, 14]), '#BFC6D0', C.ink, 2); }); }
      if (fk >= 1) { sparkles(t, 670, 515, 160, 10, 4); chipV('NISHAANA: MACHHLI KI AANKH', CX, 1200, back(seg(t, tf + 0.5, tf + 0.85)), GOLD, 44, C.ink); } } }], drift(t, d, 12), 0, lerp(1.0, 1.04, ease(t / d)));
  chipV('SIDE MISSION', CX, 470, back(seg(t, 0.1, 0.45)), '#9DC4FF', 58, C.ink);
  if (t > D * 0.25 && fk < 1) chipV('DRAUPADI SWAYAMVAR', CX, 1200, back(seg(t, D * 0.25, D * 0.25 + 0.35)), '#FF9DC4', 44, C.ink);
  SRC('WORLDHISTORY.ORG · MAHABHARATA');
  vignette();
};

// ---------- n05: twist: number 18 everywhere ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n05.dur, u = t - 0.3;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#140A10', '#3A1420'); floor('field', t); glow(CX, 700, 700, '#FF8C1A', 0.2); } },
    { z: 0.3, draw: () => { for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) flag(40 + i * 115 + r * 55, 1120 + r * 60, 0.7, t, (i + r) % 2 ? C.red : '#FF8C1A', i + r); } },
    { z: 0.6, draw: () => { wheel(200, 1060, 130, t * 1.5); wheel(800, 1060, 110, -t * 1.5);
      const k = back(seg(u, D * 0.3, D * 0.3 + 0.45)); if (k > 0) withT(CX, 720, k * (1 + 0.03 * Math.sin(t * 6)), 0, () => { glow(0, 0, 360, GOLD, 0.35); txtStroke('18', 0, 10, 380, GOLD, C.ink, 22); }); } }], drift(t, d, 14), 0, lerp(1.0, 1.06, ease(t / d)));
  if (t < 1.4) alpha(1 - seg(t, 1.0, 1.4), () => { glow(CX, 600, 500, C.amber, 0.4); txtStroke('TWIST!', CX, 600, 200, C.amber, C.ink, 18); });
  chipV('18 DIN KA YUDDH', 290, 1000, back(seg(u, D * 0.55, D * 0.55 + 0.35)), C.red, 44, C.white);
  chipV('18 AKSHAUHINI SENA', 640, 1190, back(seg(u, D * 0.8, D * 0.8 + 0.35)), GOLD, 44, C.ink);
  SRC('WORLDHISTORY.ORG · "THE BATTLE RAGED FOR 18 DAYS"');
  vignette();
};

// ---------- n06: payoff: ~1,00,000 verses, longest epic ----------
DRAWV.size = (t, d) => {
  const D = LINES.n06.dur, k = easeOut(seg(t, 0.3, D * 0.4));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0E1424', '#2A2040'); floor('table', t); bokeh(t, 14, GOLD, 41); } },
    { z: 0.55, draw: () => { const n = Math.floor(k * 14); for (let i = 0; i < n; i++) scroll(CX + (i % 2 ? 40 : -40) + wob(t, 0.3, 6, i), 1160 - i * 44, 1.4 - i * 0.02); lightPool(CX, 1100, 420, GOLD, 0.25); } }], drift(t, d, 12), 0, lerp(1.0, 1.04, ease(t / d)));
  withT(CX, 470, 1, 0, () => { P(rr(-380, -80, 760, 160, 30), 'rgba(10,14,24,0.88)', GOLD, 5); txt('~' + fmt(cnt(t, 0.3, D * 0.4, 100000)) + ' SHLOK', 0, 6, 96, GOLD); });
  if (t > D * 0.4) chipV('SABSE LAMBA MAHAKAVYA', CX, 620, back(seg(t, D * 0.4, D * 0.4 + 0.35)), C.red, 50, C.white);
  if (t > D * 0.68) { const kk = back(seg(t, D * 0.68, D * 0.68 + 0.35)); withT(CX, 1200, kk, 0, () => { P(rr(-360, -60, 720, 120, 20), 'rgba(10,14,24,0.9)', '#7FDBA0', 4); txt('GAME PROGRESS', -330, -28, 30, '#7FDBA0', 'Oswald', 700, 'left'); P(rr(-330, 0, 660, 34, 17), '#2A3245', null); P(rr(-330, 0, 660 * 0.012, 34, 17), '#7FDBA0', null); txt('0.01%', 330, -28, 30, C.white, 'Oswald', 700, 'right'); }); }
  SRC('WORLDHISTORY.ORG · "AT 100,000 VERSES…"');
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B0F24', '#2A1840'); floor('table', t); bokeh(t, 14, GOLD, 51); } },
    { z: 0.45, draw: () => { mapBoard(t, 1, -5, true); } },
    { z: 0.85, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 46px Oswald'; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -50, w, 100, 30), col, C.ink, 5); P(poly([-20, 48, 10, 48, -30, 85]), col, C.ink, 5); txt(s, 0, 3, 46, C.ink); }); };
      bub('HASTINAPUR!', 330, 1000, 0.5, GOLD); bub('INDRAPRASTHA!', 560, 1130, 0.9, '#7FDBA0');
      shadow(820, 1240, 100); person(820, 1240, 'mahila', { t, s: 0.95, look: -0.3, mood: 0.7 }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('COMMENT KARO', CX, 450, back(seg(t, 0.1, 0.45)), GOLD, 50, C.ink);
  vignette();
};
