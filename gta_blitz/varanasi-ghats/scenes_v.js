// ===== Awazzzz GTA blitz #24 — "Agar GTA Varanasi mein hota - ghats par mission?" (FAN THEORY / KALPANA) — native 9:16 scenes (DRAWV).
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters. No temple, religious symbol, aarti, cremation, bathers or crowds.
// Ghats = generic empty steps + plain buildings. Race rings only on mid-river open water; boats slow near the steps (SHAANT ZONE). One city pin, no map outline.
// ---------- standalone-Short overrides of the kit overlays ----------
function partChip(n, T) { const a = T < 2.1 ? 1 : 1 - seg(T, 2.1, 2.5); if (a <= 0) return; alpha(a, () => { P(rr(140, 62, 250, 50, 25), C.red, null); txt('FAN THEORY', 265, 89, 30, C.white, 'Oswald', 700); }); }
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
// persistent fan-theory label (every frame, incl. hook and end card)
function watermarkV() { alpha(0.92, () => logoCircle(84, 86, 42));
  ctx.font = '700 34px Oswald'; const s = 'KALPANA / FAN THEORY', w = ctx.measureText(s).width + 44;
  P(rr(40, 262, w, 54, 27), '#B23AEE', C.ink, 3); txt(s, 40 + w / 2, 290, 34, C.white, 'Oswald', 700); }

// ---------- helpers ----------
function chipV(s, x, y, k, col = C.green2, size = 38, fg = C.ink) { if (k <= 0) return; withT(x, y, k, 0, () => { ctx.font = `700 ${size}px Oswald`; const w = Math.min(880, ctx.measureText(s).width + 50); P(rr(-w / 2, -size * 0.95, w, size * 1.9, size * 0.95), col, C.ink, 4); txt(s, 0, 2, size, fg); }); }
KINDS.mahila = { body: '#7A3B5A', body2: '#612E47', skin: '#D9A77E', hair: 'bob', h: 0.93 };
KINDS.yuva = { body: '#2E8B7A', body2: '#236B5E', skin: '#C68E62', hair: 'short', h: 0.96 };
const SEA = '#123A5A', SEA2 = '#0A2238', CYAN = '#4CC9F0', GOLD = '#F4D06F';
function floorV(y, c1, c2) { ctx.fillStyle = grad(y, H + 300, c1, c2); ctx.fillRect(-300, y, W + 600, H + 600 - y); }

// Studio library assets (animation-studio catalogue via select_assets.py on brief.json): PRP-030 car (sets.js car2D), PRP-037 cone + PRP-038 barrier (redrawn below),
// GFX-001 bars (stage bar), GFX-010 route, PRP-042 streetLamp, VFX-011 impactStar (as SP.burst), VFX-015 stars (as SP.sparkles), VFX-019 question, GFX-009 pin — ported onto the kit canvas (car/rain/umbrella kept from the shared port).
const SP = (() => {
  const OUT = '#2a1c14', TAU = 6.2832;
  const R = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  const O = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); };
  const F = (fill, stroke, lw = 0) => { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke && lw) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); } };
  const PG = pts => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const pr = (fn, x, y, s) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; fn(); ctx.restore(); };
  return {
    car: (x, y, s = 1, col = '#e63946', t = 0, flip = false) => pr(() => { if (flip) ctx.scale(-1, 1);
      R(-120, -70, 240, 50, 18); F(col, OUT, 4); ctx.beginPath(); ctx.moveTo(-70, -70); ctx.lineTo(-45, -115); ctx.lineTo(50, -115); ctx.lineTo(80, -70); ctx.closePath(); F(col, OUT, 4);
      ctx.fillStyle = '#bde0fe'; PG([[-58, -74], [-38, -106], [-5, -106], [-5, -74]]); ctx.fill(); PG([[5, -74], [5, -106], [45, -106], [66, -74]]); ctx.fill(); ctx.fillStyle = '#ffd166'; ctx.fillRect(108, -60, 12, 12);
      for (const wx of [-70, 70]) { O(wx, -20, 24); F('#222', OUT, 3); O(wx, -20, 10); F('#bbb'); ctx.save(); ctx.translate(wx, -20); ctx.rotate(t * 8); ctx.strokeStyle = '#666'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.stroke(); ctx.restore(); } }, x, y, s),
    streetLamp: (x, y, s = 1, on = true, a = 1) => pr(() => { R(-8, -420, 16, 420, 4); F('#3d405b', OUT, 3); ctx.strokeStyle = '#3d405b'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(0, -410); ctx.quadraticCurveTo(0, -450, 60, -450); ctx.stroke(); R(40, -460, 70, 24, 8); F(on ? '#FFE9A8' : '#3d405b', OUT, 3);
      if (on) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,220,140,${0.3 * a})`; PG([[45, -440], [105, -440], [220, 0], [-70, 0]]); ctx.fill(); ctx.restore(); } }, x, y, s),
    umbrella: (x, y, s = 1, col = '#e63946') => pr(() => { ctx.beginPath(); ctx.arc(0, -260, 160, Math.PI, 0); for (let i = 4; i >= 0; i--) ctx.quadraticCurveTo(-160 + i * 80 + 40, -240, -160 + i * 80, -260); F(col, OUT, 5); ctx.strokeStyle = OUT; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, -260); ctx.lineTo(0, -20); ctx.arc(-18, -20, 18, 0, Math.PI); ctx.stroke(); }, x, y, s),
    rain: (t, n = 260, wind = -0.2, a = 0.5, len = 40) => { ctx.save(); ctx.strokeStyle = `rgba(200,220,255,${a})`; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i < n; i++) { const px = ((hash(i) * (W + 400) + t * 1500 * wind) % (W + 400) + W + 400) % (W + 400) - 200, py = (hash(i + 77) * H + t * 1500 * (0.8 + hash(i + 5) * 0.4)) % (H + 100) - 50; ctx.moveTo(px, py); ctx.lineTo(px + wind * len, py + len); } ctx.stroke(); ctx.restore(); },
    motionStreaks: (x, y, dir = -1, len = 220, n = 5, a = 0.7) => { ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineCap = 'round'; for (let i = 0; i < n; i++) { ctx.lineWidth = 6 - i * 0.6; ctx.beginPath(); const yy = y - 60 + i * 30; ctx.moveTo(x, yy); ctx.lineTo(x + dir * len * (0.6 + hash(i) * 0.4), yy); ctx.stroke(); } ctx.restore(); },
    question: (t, x, y, t0 = 0, s = 1) => { const k = back(seg(t, t0, t0 + 0.3)); if (k <= 0) return; withT(x, y + Math.sin(t * 4) * 6, k * s, 0, () => txtStroke('?', 0, 0, 120, '#ffd166', '#2a1c14', 8)); },
    pin: (t, t0, x, y, label = '', c = '#FF4F5E') => { if (t < t0) return; const k = clamp((t - t0) / 0.6), kb = 1 - Math.pow(1 - k, 3);
      for (let i = 0; i < 2; i++) { const p = ((t - t0) * 0.8 + i * 0.5) % 1; ctx.strokeStyle = `rgba(255,79,94,${1 - p})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y, 10 + p * 60, 4 + p * 22, 0, 0, TAU); ctx.stroke(); }
      ctx.save(); ctx.translate(x, y - (1 - kb) * 200); ctx.scale(1.2, 1.2); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-26, -34, -30, -64, 0, -70); ctx.bezierCurveTo(30, -64, 26, -34, 0, 0); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke(); O(0, -48, 10); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
      if (label) { const a = clamp((t - t0 - 0.4) * 3); alpha(a, () => { ctx.font = '700 34px Oswald'; const w = ctx.measureText(label).width + 30; const lx = Math.max(40, Math.min(x - w / 2, 930 - w)); P(rr(lx, y + 12, w, 50, 10), 'rgba(10,14,24,0.85)', null); txt(label, lx + w / 2, y + 38, 34, GOLD, 'Oswald', 700); }); } },
    route: (t, t0, pts, dur = 1.6, col = GOLD, lw = 8) => { const k = easeOut(clamp((t - t0) / dur)); if (k <= 0) return; let L = 0; const sg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); sg.push(d); L += d; }
      let rem = L * k; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.setLineDash([lw * 2, lw * 1.6]); ctx.beginPath(); ctx.moveTo(...pts[0]);
      for (let i = 1; i < pts.length && rem > 0; i++) { const f = Math.min(1, rem / sg[i - 1]); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); rem -= sg[i - 1]; } ctx.stroke(); ctx.setLineDash([]); },
  };
})();

// own generic drawings
function waves(t, y, col, amp = 10, len = 120, sp = 1) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-300, H + 300); ctx.lineTo(-300, y); for (let x = -300; x <= W + 300; x += 20) ctx.lineTo(x, y + Math.sin(x / len * 6.283 + t * 2 * sp) * amp); ctx.lineTo(W + 300, H + 300); ctx.closePath(); ctx.fill(); }
function moonV(x, y, r) { glow(x, y, r * 4, '#DDE8FF', 0.35); P(circ(x, y, r), '#F2F0E6', null); alpha(0.25, () => P(circ(x - r * 0.3, y - r * 0.2, r * 0.25), '#C8C4B4', null)); }
function quadPt(a, c, b, u) { return [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]]; }
// ports of studio VFX-011 impactStar + VFX-015 stars onto the kit canvas
const SP2 = {
  burst: (t, t0, x, y, s = 1, word = 'TWIST!', col = GOLD, ink = C.red) => { const k = t - t0; if (k < 0 || k > 1.1) return; const sc = back(clamp(k / 0.18)) * s * (1 + 0.05 * Math.sin(k * 40)); const a = k > 0.85 ? 1 - (k - 0.85) / 0.25 : 1;
    alpha(a, () => withT(x, y, sc, -0.1, () => { ctx.beginPath(); for (let i = 0; i < 24; i++) { const ang = i / 24 * 6.2832, rad = i % 2 ? 150 : 250 + rnd(i) * 40; ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad * 0.75); } ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = C.ink; ctx.stroke(); txtStroke(word, 0, 6, 120, ink, C.white, 12); })); },
  sparkles: (t, x, y, rad = 110, n = 5, col = GOLD) => { for (let i = 0; i < n; i++) { const a = t * 3 + i * 6.2832 / n, px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad * 0.35; ctx.beginPath(); for (let j = 0; j < 10; j++) { const r = j % 2 ? 9 : 20, q = j / 10 * 6.2832 - 1.5708; ctx.lineTo(px + Math.cos(q) * r, py + Math.sin(q) * r); } ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); } },
};



// ---------- own generic drawings (#24) ----------
const NEON = '#29E7FF', NMAG = '#FF3FA4', DAWN1 = '#3A2458', DAWN2 = '#FFA36B', RIVER = '#2E6F8E', RIVER2 = '#1B4A66', SAND = '#E2C89A', STEP = '#D9B98A', STEP2 = '#B8956A';
function ell(x, y, rx, ry) { const p = new Path2D(); p.ellipse(x, y, rx, ry, 0, 0, 6.2832); return p; }
function dawnSky() { sky(DAWN1, DAWN2); glow(700, 360, 460, '#FFC48A', 0.6); P(circ(700, 370, 85), '#FFE2A8', null); }
function birds(t, n = 5) { ctx.strokeStyle = 'rgba(40,30,50,0.7)'; ctx.lineWidth = 4; for (let i = 0; i < n; i++) { const x = ((i * 210 + t * 50) % 1300) - 100, y = 300 + rnd(i + 9) * 220 + Math.sin(t * 2 + i) * 10, f = Math.sin(t * 8 + i) * 10; ctx.beginPath(); ctx.moveTo(x - 22, y - f); ctx.quadraticCurveTo(x - 10, y - 8, x, y); ctx.quadraticCurveTo(x + 10, y - 8, x + 22, y - f); ctx.stroke(); } }
// generic riverfront: plain flat-roof buildings with windows/balconies + broad empty steps (no temples, no symbols, no people)
function ghatBank(t, yW = 1000, sc = 1, seed = 3) {
  const cols = ['#E8C9A0', '#D7A97C', '#F0DDB8', '#C99572', '#E4B98E', '#D9C2A0'];
  for (let i = -1; i < 9; i++) { const w = 130 + rnd(i + seed) * 70, h = (220 + rnd(i * 2 + seed) * 220) * sc, x = i * 140 - 40 + rnd(i + 7) * 20, y = yW - 190 * sc - h;
    P(rr(x, y, w, h + 10, 4), cols[(i + 12) % 6], 'rgba(40,25,20,0.7)', 3);
    P(rr(x - 6, y - 8, w + 12, 14, 3), 'rgba(90,60,40,0.8)', null); // flat roof ledge
    for (let r = 0; r < Math.floor(h / 70); r++) for (let c = 0; c < Math.floor(w / 46); c++) { const wx = x + 14 + c * 46, wy = y + 24 + r * 70; P(rr(wx, wy, 24, 36, [12, 12, 2, 2]), (rnd(i * 31 + r * 7 + c) > 0.6) ? 'rgba(255,214,140,0.85)' : 'rgba(60,40,40,0.75)', null); }
    if (rnd(i + 21) > 0.5) P(rr(x + 8, y + 70, w - 16, 10, 3), 'rgba(90,60,40,0.85)', null); }
  // broad steps down to the water (empty)
  for (let s = 0; s < 7; s++) { const yy = yW - 190 * sc + s * 27 * sc; P(rr(-300, yy, W + 600, 28 * sc, 0), s % 2 ? STEP : STEP2, null); line(-300, yy, W + 300, yy, 'rgba(80,55,35,0.5)', 2); }
}
function river(t, y0 = 1000) { ctx.fillStyle = grad(y0, H, RIVER, RIVER2); ctx.fillRect(-300, y0, W + 600, H + 300 - y0);
  glow(760, y0 + 160, 300, '#FFC48A', 0.3); alpha(0.35, () => { for (let i = 0; i < 18; i++) { const yy = y0 + 30 + i * 50 + i * i * 2, xx = 760 + Math.sin(t * 1.5 + i) * 30; P(rr(xx - 80 + rnd(i) * 40, yy, 120 - i * 3, 5, 3), '#FFD9A0', null); } });
  alpha(0.18, () => { for (let i = 0; i < 20; i++) P(rr(rnd(i + 3) * 1000 + Math.sin(t + i) * 20, y0 + 60 + i * 44, 90, 4, 2), C.white, null); }); }
// generic wooden rowing boat with animated oars and a number flag (no people)
function rowBoat(x, y, s = 1, t = 0, col = '#C0392B', num = '1', speed = 1) { withT(x, y + Math.sin(t * 3 + x) * 5, s, Math.sin(t * 2 + x) * 0.03, () => {
  P(poly([-160, -10, 160, -10, 120, 40, -120, 40]), '#8B5A2B', C.ink, 5); P(rr(-150, -22, 300, 18, 6), col, C.ink, 4);
  const a = Math.sin(t * 6 * speed) * 0.5; for (const side of [-1, 1]) withT(side * 40, -12, 1, side * 0.2 + a * side, () => { line(0, 0, side * 120, 60, '#5B3A1E', 8); P(ell(side * 125, 64, 22, 9), '#5B3A1E', null); });
  line(-90, -20, -90, -120, C.ink, 5); P(poly([-90, -120, -20, -100, -90, -80]), NEON, C.ink, 3); txt(num, -62, -99, 24, C.ink, 'Oswald', 700);
  alpha(0.5, () => { P(ell(-180, 32, 40, 6), 'rgba(255,255,255,0.7)', null); P(ell(-240, 34, 26, 4), 'rgba(255,255,255,0.5)', null); }); }); }
// glowing checkpoint ring floating on open water (imagined)
function ringCP(x, y, r, t, hit = 0, col = NEON) { const pulse = 1 + 0.05 * Math.sin(t * 6 + x);
  ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(x, y, r * 1.8, col, 0.35 + hit * 0.4); ctx.restore();
  ctx.lineWidth = 14; ctx.strokeStyle = hit > 0 ? '#2BFF88' : col; ctx.beginPath(); ctx.ellipse(x, y, r * pulse, r * 0.36 * pulse, 0, 0, 6.2832); ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = C.white; ctx.beginPath(); ctx.ellipse(x, y, r * pulse * 0.82, r * 0.29 * pulse, 0, 0, 6.2832); ctx.stroke(); }
// PRP-037 cone / PRP-038 barrier (redrawn on kit canvas)
function cone(x, y, s = 1) { withT(x, y, s, 0, () => { P(poly([-30, 0, 30, 0, 8, -90, -8, -90]), '#FF7A1A', C.ink, 4); P(rr(-22, -55, 44, 14, 3), C.white, null); P(rr(-44, -6, 88, 14, 4), '#333', C.ink, 3); }); }
function barrier(x, y, s = 1) { withT(x, y, s, 0, () => { P(rr(-150, -100, 300, 50, 8), C.white, C.ink, 4); for (let i = 0; i < 5; i++) P(poly([-140 + i * 60, -100, -110 + i * 60, -100, -140 + i * 60 + 10, -50, -170 + i * 60 + 10, -50].map((v, j) => j % 2 ? v : Math.max(-150, Math.min(150, v)))), C.red, null); P(rr(-150, -100, 300, 50, 8), null, C.ink, 4); P(rr(-120, -50, 16, 50, 4), '#555', C.ink, 3); P(rr(104, -50, 16, 50, 4), '#555', C.ink, 3); }); }
// narrow lane: two tall walls with a sliver of sky, small toy car wedged in
function lane(t, squeeze = 0) { const g = lerp(380, 250, squeeze);
  sky('#FFB98A', '#F4D7A8');
  for (const side of [-1, 1]) { const x0 = side < 0 ? -300 : CX + g / 2; const w = side < 0 ? CX - g / 2 + 300 : W + 300 - (CX + g / 2);
    P(rr(x0, -300, w, H + 600, 0), side < 0 ? '#C98F6A' : '#B97E5C', null);
    for (let r = 0; r < 9; r++) { const yy = 150 + r * 190; const wx = side < 0 ? CX - g / 2 - 170 : CX + g / 2 + 50; P(rr(wx, yy, 110, 130, [55, 55, 4, 4]), r % 3 ? 'rgba(70,40,30,0.75)' : 'rgba(255,214,140,0.85)', C.ink, 3); P(rr(wx - 10, yy + 128, 130, 14, 4), 'rgba(90,55,40,0.9)', null); }
    // hanging wires / cloth line
  }
  ctx.strokeStyle = 'rgba(30,20,20,0.7)'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(CX - g / 2, 300 + i * 160); ctx.quadraticCurveTo(CX, 340 + i * 160, CX + g / 2, 300 + i * 160); ctx.stroke(); }
  ctx.fillStyle = grad(1150, H, '#8E7A66', '#5E5040'); ctx.fillRect(CX - g / 2, 1150, g, H); // lane floor
  for (let i = 0; i < 8; i++) P(rr(CX - g / 2, 1170 + i * 90, g, 6, 2), 'rgba(40,30,20,0.4)', null);
}
const BANK = 860;
function riverScene(t, d, extra, zoom = 1.05) {
  depth([{ z: 0.05, haze: 1, draw: () => { dawnSky(); birds(t); } },
    { z: 0.3, draw: () => { ghatBank(t, BANK, 1); } },
    { z: 0.55, draw: () => { river(t, BANK); } },
    { z: 0.8, draw: () => { if (extra) extra(); } }],
    drift(t, d, 10), 0, lerp(1.0, zoom, ease(t / d)));
}
function crossChip(s, x, y, k) { if (k <= 0) return; withT(x, y, k, 0, () => { ctx.font = '700 48px Oswald'; const w = ctx.measureText(s).width + 120; P(rr(-w / 2, -50, w, 100, 50), 'rgba(10,14,24,0.92)', C.white, 4); txt(s, -30, 3, 48, C.white); withT(w / 2 - 50, 0, 1, 0, () => { P(circ(0, 0, 30), C.red, C.ink, 3); line(-12, -12, 12, 12, C.white, 7); line(12, -12, -12, 12, C.white, 7); }); }); }

// ---------- spoken opening hook: "Socho agar, GTA ka agla mission Varanasi ke ghaaton par hota!" ----------
DRAWV.hook1 = (t, d) => {
  riverScene(t, d, () => { ringCP(CX, 1080, 170, t, seg(t, 2.2, 2.4)); rowBoat(lerp(-200, 700, easeOut(seg(t, 0, d))), 1150, 1.0, t, '#C0392B', '1', 1.6); rowBoat(lerp(-420, 420, easeOut(seg(t, 0.2, d))), 1290, 0.85, t, '#2E86DE', '2', 1.6); }, 1.08);
  chipV('LEVEL: VARANASI GHAAT', CX, 470, back(seg(t, 0.6, 1.0)), NEON, 50, C.ink);
  vignette();
};

// ---------- n02: game part only imagination; mission = morning boat race; no gun, no theft ----------
DRAWV.intro = (t, d) => {
  const D = LINES.n02.dur, k1 = back(seg(t, 0.1, 0.5)), k2 = back(seg(t, D * 0.36, D * 0.36 + 0.4)), k3 = back(seg(t, D * 0.62, D * 0.62 + 0.35)), k4 = back(seg(t, D * 0.78, D * 0.78 + 0.35));
  riverScene(t, d, () => { rowBoat(CX - 40, 1150, 1.3, t, '#C0392B', '1', 0.8); alpha(0.35 * k1 * (1 - seg(t, D * 0.3, D * 0.36)), () => { ctx.fillStyle = '#0B0B16'; ctx.fillRect(-300, -300, W + 600, H + 600); }); });
  if (k1 > 0) alpha(1 - seg(t, D * 0.3, D * 0.36), () => withT(CX, 700, k1, -0.08, () => { P(rr(-400, -110, 800, 220, 20), 'rgba(178,58,238,0.18)', '#B23AEE', 10); txt('GAME = SIRF KALPANA', 0, 8, 76, '#E3B5FF'); }));
  chipV('MISSION: SUBAH KI NAAV RACE', CX, 450, k2, GOLD, 48, C.ink);
  crossChip('GUN', 300, 640, k3); crossChip('CHORI', 640, 760, k4);
  vignette();
};

// ---------- n03 twist: car useless here; narrow lanes of Kashi -> on foot or by boat ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n03.dur, sq = easeOut(seg(t, 0.3, D * 0.45)), kc = back(seg(t, D * 0.15, D * 0.15 + 0.4)), kp = back(seg(t, D * 0.6, D * 0.6 + 0.4));
  depth([{ z: 0.1, draw: () => { lane(t, sq); } },
    { z: 0.6, draw: () => { const shake = sq > 0.95 ? Math.sin(t * 40) * 4 : 0; withT(CX + shake, 1150, 1, 0, () => { SP.car(0, 0, 0.95, '#e63946', sq > 0.95 ? 0 : t); });
      barrier(CX, 1000, 0.75); cone(CX - 150, 1200, 0.9); cone(CX + 150, 1200, 0.9);
      if (sq > 0.95) SP.question(t, CX + 170, 820, D * 0.45, 0.9);
      // footprints + boat icon = the way through
      if (kp > 0) { for (let i = 0; i < 5; i++) alpha(seg(t, D * 0.62 + i * 0.12, D * 0.62 + i * 0.12 + 0.2), () => { P(ell(CX - 30 + (i % 2) * 60, 1100 - i * 70, 16, 26), 'rgba(255,255,255,0.85)', null); }); } } }],
    drift(t, d, 8), 0, lerp(1.0, 1.06, ease(t / d)));
  SP2.burst(t, 0, CX, 600, 0.95, 'TWIST!');
  chipV('CAR KA KYA KAAM?', CX, 430, kc, C.white, 52, C.ink);
  chipV('KASHI KI PATLI GALIYAN', CX, 540, back(seg(t, D * 0.35, D * 0.35 + 0.4)), GOLD, 44, C.ink);
  if (kp > 0) withT(CX, 700, kp, 0, () => { P(rr(-330, -70, 660, 140, 30), 'rgba(10,14,24,0.92)', NEON, 5); txt('PAIDAL YA NAAV!', 0, 4, 66, NEON); });
  vignette();
};

// ---------- n04 route: Assi Ghat -> Adi Keshav Ghat, checkpoints only glowing rings on the water ----------
DRAWV.route = (t, d) => {
  const D = LINES.n04.dur, kr = seg(t, D * 0.45, D * 0.9);
  riverScene(t, d, () => {
    const R = [[180, 1180, 120], [420, 1060, 95], [640, 965, 72], [820, 905, 52]];
    R.forEach(([x, y, r], i) => { if (kr > i * 0.22) ringCP(x, y, r, t, 0); });
    const bx = lerp(60, 700, easeOut(seg(t, 0.2, D)));
    rowBoat(bx, lerp(1220, 1000, easeOut(seg(t, 0.2, D))), lerp(0.95, 0.6, easeOut(seg(t, 0.2, D))), t, '#C0392B', '1', 1.4);
    SP.route(t, 0.3, [[90, 1240], [420, 1070], [820, 905]], D * 0.5, GOLD, 7); }, 1.04);
  chipV('START: ASSI GHAT', 300, 450, back(seg(t, 0.2, 0.6)), GOLD, 42, C.ink);
  chipV('FINISH: ADI KESHAV GHAT', 560, 560, back(seg(t, D * 0.3, D * 0.3 + 0.4)), C.white, 42, C.ink);
  chipV('CHECKPOINT = SIRF PAANI PAR RINGS', CX, 680, back(seg(t, D * 0.55, D * 0.55 + 0.4)), NEON, 40, C.ink);
  vignette();
};

// ---------- n05 REAL DUNIYA (no race, no rings): Wikipedia: 84 ghats; most rebuilt 18th c. under Maratha patronage; morning boat ride popular with visitors ----------
DRAWV.real = (t, d) => {
  const D = LINES.n05.dur, k84 = back(seg(t, D * 0.2, D * 0.2 + 0.45)), km = back(seg(t, D * 0.42, D * 0.42 + 0.4)), kb = back(seg(t, D * 0.7, D * 0.7 + 0.4));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#9CCFE8', '#F3EAD8'); } },
    { z: 0.3, draw: () => { ghatBank(t, 1000, 0.9, 11); river(t, 1000); } },
    { z: 0.6, draw: () => { if (kb > 0) withT(700, 1130, kb, 0, () => { rowBoat(0, 0, 0.75, t, '#8B5A2B', ' ', 0.4); }); SP.pin(t, 0.4, 230, 1000, 'VARANASI'); } }],
    drift(t, d, 8), 0, lerp(1.0, 1.03, ease(t / d)));
  withT(CX, 410, back(seg(t, 0.05, 0.4)), 0, () => { P(rr(-250, -48, 500, 96, 48), '#1D7A46', C.white, 5); txt('REAL DUNIYA', 0, 4, 56, C.white); });
  if (k84 > 0) withT(CX, 590, k84, 0, () => { glow(0, 0, 260, GOLD, 0.4); P(rr(-300, -90, 600, 180, 30), 'rgba(10,14,24,0.92)', GOLD, 6); txt('84 GHAAT', 0, 8, 96, GOLD); });
  chipV('18VI SADI · MARATHA SANRAKSHAN MEIN DOBARA BANE', CX, 740, km, '#F3E3BF', 34, C.ink);
  chipV('SUBAH KI NAAV KI SAIR = YATRIYON MEIN POPULAR', CX, 850, kb, C.white, 32, C.ink);
  alpha(seg(t, 0.4, 0.8), () => txt('SOURCE: WIKIPEDIA (GHATS IN VARANASI)', CX, 1210, 26, C.ink, 'Oswald', 700));
  vignette();
};

// ---------- n06 rule: race only in mid-river open water; near the ghats the race stops: shaant zone, respect first ----------
DRAWV.rule = (t, d) => {
  const D = LINES.n06.dur, ks = back(seg(t, D * 0.45, D * 0.45 + 0.4));
  riverScene(t, d, () => {
    // mid-river lane of rings (far from the steps)
    [[260, 1180], [540, 1180], [820, 1180]].forEach(([x, y], i) => ringCP(x, y, 95, t, 0));
    rowBoat(lerp(-150, 600, easeOut(seg(t, 0, D * 0.5))), 1240, 0.8, t, '#C0392B', '1', 1.5);
    // near the steps: calm zone band, boat drifting slowly
    alpha(0.55 * ks, () => { P(rr(-300, BANK + 6, W + 600, 120, 0), 'rgba(43,255,136,0.18)', null); ctx.setLineDash([22, 14]); line(-300, BANK + 126, W + 300, BANK + 126, '#2BFF88', 5); ctx.setLineDash([]); });
    rowBoat(lerp(300, 380, seg(t, 0, D)), BANK + 70, 0.55, t * 0.3, '#2E86DE', '2', 0.25);
    if (ks > 0) withT(760, BANK + 40, ks, 0, () => { line(0, 0, 0, -150, '#5B3A1E', 8); P(rr(-110, -250, 220, 110, 14), '#2BFF88', C.ink, 5); txt('SHAANT', 0, -212, 40, C.ink); txt('ZONE', 0, -170, 40, C.ink); });
  }, 1.04);
  chipV('RULE: RACE SIRF BEECH DHAAR MEIN', CX, 440, back(seg(t, 0.1, 0.45)), GOLD, 44, C.ink);
  chipV('GHAAT KE PAAS: SPEED DHEEMI · SAMMAN PEHLE', CX, 545, back(seg(t, D * 0.62, D * 0.62 + 0.4)), C.white, 34, C.ink);
  vignette();
};

// ---------- spoken closing: comment question ----------
function kulhad(x, y, s = 1) { withT(x, y, s, 0, () => { P(poly([-60, -90, 60, -90, 44, 60, -44, 60]), '#B5582E', C.ink, 5); P(ell(0, -90, 60, 14), '#FFF6E6', C.ink, 4); alpha(0.5, () => P(rr(-40, -60, 12, 90, 6), '#D9774A', null)); }); }
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { dawnSky(); birds(t, 3); } },
    { z: 0.3, draw: () => { ghatBank(t, BANK, 1); river(t, BANK); alpha(0.45, () => { ctx.fillStyle = '#0B1222'; ctx.fillRect(-300, -300, W + 600, H + 600); }); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 50px Oswald'; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -50, w, 100, 30), col, C.ink, 5); P(poly([-20, 48, 10, 48, -30, 85]), col, C.ink, 5); txt(s, 0, 3, 50, C.ink); }); };
      bub('NAAV RACE?', 330, 560, 0.3, GOLD); bub('PAIDAL MISSION?', 560, 730, 0.8, NEON); bub('LASSI DELIVERY?', 420, 900, 1.3, '#F7A8C4');
      rowBoat(300, 1150, 1.0, t, '#C0392B', '1', 1); kulhad(740, 1160, 1.0 * back(seg(t, 1.3, 1.7))); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('AAP KAUNSA MISSION? COMMENT KARO', CX, 400, back(seg(t, 0.1, 0.45)), GOLD, 42, C.ink);
  vignette();
};
