// ===== Awazzzz GTA blitz #18 — "Fan theory: Vice City aur Mumbai judwaan?" (FAN THEORY / KALPANA) — native 9:16 scenes (DRAWV).
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters; "GTA"/"VICE CITY" set in Oswald (our font).
// No outline map of India: city pins only. Safe zone: key content x 40..940, y 340..1200; captions y 1250..1450.

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

// Studio library assets (animation-studio catalogue via select_assets.py on brief.json): PRP-030 car (sets.js car2D),
// PRP-042 streetLamp, VFX-011 impactStar (as SP.burst), VFX-015 stars (as SP.sparkles), VFX-019 question, GFX-009 pin — ported onto the kit canvas (car/rain/umbrella kept from the shared port).
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

// ---------- own generic drawings ----------
const PPINK = '#F7A8C4', MINT = '#9EE6CF', LEMON = '#F6E27A', SKYB = '#8EC9F2', PEACH = '#FFC79A', NPINK = '#FF3FA4', NCYAN = '#29E7FF';
// generic streamline-style "Art Deco" building: stepped crown, eyebrow ledges, vertical fin, porthole, rounded balconies
function decoBldg(x, y, w, h, col, seed = 1, neon = null, lit = 0) {
  const sh = 'rgba(0,0,0,0.16)';
  P(rr(x, y - h, w, h, 6), col, C.ink, 4); P(rr(x + w * 0.72, y - h, w * 0.28, h, 0), sh, null);
  // stepped crown + fin
  P(rr(x + w * 0.18, y - h - 34, w * 0.64, 36, 4), col, C.ink, 4); P(rr(x + w * 0.34, y - h - 66, w * 0.32, 34, 4), col, C.ink, 4);
  P(rr(x + w * 0.45, y - h - 120, w * 0.1, h * 0.55 + 120, 4), 'rgba(255,255,255,0.55)', C.ink, 3);
  if (rnd(seed) > 0.4) { P(circ(x + w * 0.5, y - h - 40, 13), '#2A3550', C.ink, 3); }
  const rows = Math.max(2, Math.floor(h / 95));
  for (let r = 0; r < rows; r++) { const yy = y - h + 40 + r * (h - 60) / rows;
    P(rr(x - 6, yy - 8, w + 12, 10, 5), 'rgba(255,255,255,0.75)', C.ink, 2); // eyebrow ledge
    for (const wx of [x + w * 0.1, x + w * 0.6]) P(rr(wx, yy + 10, w * 0.28, (h - 60) / rows - 34, 6), lit > 0 && rnd(seed * 7 + r + wx) > 0.4 ? '#FFE9A8' : '#2A3550', C.ink, 3);
    if (r % 2 === 1) P(rr(x + w * 0.02, yy + (h - 60) / rows - 30, w * 0.4, 18, [0, 0, 9, 9]), col, C.ink, 3); }
  if (neon) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(x + w / 2, y - h * 0.5, w, neon, 0.35); ctx.restore(); ctx.strokeStyle = neon; ctx.lineWidth = 7; ctx.beginPath(); ctx.roundRect(x + 6, y - h + 6, w - 12, h - 12, 6); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = '#FFFFFF'; ctx.stroke(); }
}
function palm(x, y, s, t, seed = 1) { withT(x, y, s, 0, () => { ctx.strokeStyle = '#7A5230'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, -200, 10 + Math.sin(t + seed) * 6, -400); ctx.stroke();
  const tx = 10 + Math.sin(t + seed) * 6, ty = -400; for (let i = 0; i < 7; i++) { const a = -2.9 + i * 0.75 + Math.sin(t * 1.5 + i + seed) * 0.06; ctx.fillStyle = i % 2 ? '#2E8B57' : '#3BA36A'; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a - 0.3) * 120, ty + Math.sin(a - 0.3) * 120 - 30, tx + Math.cos(a) * 200, ty + Math.sin(a) * 200 + 40); ctx.quadraticCurveTo(tx + Math.cos(a + 0.2) * 100, ty + Math.sin(a + 0.2) * 100, tx, ty); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); }
  P(circ(tx - 8, ty + 14, 12), '#6B4A2A', C.ink, 3); P(circ(tx + 12, ty + 18, 12), '#6B4A2A', C.ink, 3); }); }
function sunsetSky() { sky('#3A1C5A', '#FF8E6E'); glow(CX, 760, 520, '#FFC08A', 0.5); }
// row of deco buildings along a quadratic curve (promenade)
function decoAlong(a, c, b, n, cols, h0, h1, s0, s1, lit = 0, from = 0) { for (let i = n - 1; i >= from; i--) { const u = i / (n - 1), p = quadPt(a, c, b, u), s = lerp(s0, s1, u); decoBldg(p[0] - 70 * s, p[1], 140 * s, lerp(h0, h1, rnd(i + 3)) * s, cols[i % cols.length], i + 2, null, lit); } }

// ---------- spoken opening hook: "Socho agar, Vice City ka judwaan Mumbai ho!" — two halves, two pastel sea fronts ----------
DRAWV.hook1 = (t, d) => {
  const k = back(seg(t, 0.05, 0.5));
  depth([{ z: 0.05, haze: 1, draw: () => { ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, 960 + 300); ctx.clip(); sky('#4A1F6A', '#FF7FA8'); glow(CX, 620, 420, '#FFB0D0', 0.5); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(-300, 960, W + 600, H); ctx.clip(); sky('#173A5E', '#7FC8E8'); ctx.restore(); } },
    { z: 0.45, draw: () => { // top: VICE CITY (kalpana) neon deco strip; bottom: Marine Drive pastel deco
      [[30, 210, 380, PPINK, NPINK], [250, 200, 470, MINT, NCYAN], [460, 220, 410, LEMON, NPINK], [690, 200, 450, SKYB, NCYAN]].forEach(([x, w, h, c, n], i) => decoBldg(x, 860, w, h, c, i + 1, n));
      P(rr(-300, 860, W + 600, 100, 0), '#E9D6B0', C.ink, 4); palm(140, 900, 0.55, t, 1); palm(930, 900, 0.6, t, 2);
      waves(t, 1360, SEA, 8, 150); [[20, 220, 300, LEMON], [250, 200, 360, PPINK], [460, 220, 320, SKYB], [690, 200, 350, PEACH]].forEach(([x, w, h, c], i) => decoBldg(x, 1320, w, h, c, i + 9));
      P(rr(-300, 1320, W + 600, 40, 0), '#B9B2A4', C.ink, 4); } },
    { z: 0.85, draw: () => { P(rr(-300, 948, W + 600, 24, 0), C.ink, null);
      withT(CX, 960, k * (1 + 0.04 * Math.sin(t * 8)), 0, () => { P(circ(0, 0, 92), GOLD, C.ink, 6); txt('=?', 0, 6, 90, C.ink); });
      chipV('VICE CITY', 270, 420, k, NPINK, 54, C.white); chipV('MUMBAI', 810, 1100, k, GOLD, 54, C.ink); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.06, ease(t / d)));
  vignette();
};

// ---------- n01 only a fan theory: nothing like this in the game, no Rockstar announcement ----------
DRAWV.intro = (t, d) => {
  const D = LINES.n01.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1A0F2E', '#3A1F5C'); bokeh(t, 14, '#C77DFF', 3); } },
    { z: 0.45, draw: () => { const k = back(seg(t, 0.1, 0.5));
      withT(CX, 700, k, wob(t, 0.4, 0.02), () => { glow(0, 0, 520, '#C77DFF', 0.35);
        [[-240, 40, 170], [-80, -90, 200], [120, -80, 190], [260, 50, 160], [0, 90, 220]].forEach(([x, y, r]) => P(circ(x, y, r), '#F3EEFF', C.ink, 6));
        [[-240, 40, 164], [-80, -90, 194], [120, -80, 184], [260, 50, 154], [0, 90, 214]].forEach(([x, y, r]) => P(circ(x, y, r), '#F3EEFF', null));
        ctx.save(); ctx.beginPath(); ctx.ellipse(0, 10, 330, 200, 0, 0, 6.283); ctx.clip(); sunsetSky();
        [[-300, 120, 200, PPINK], [-170, 110, 250, MINT], [-50, 120, 210, LEMON], [80, 110, 240, SKYB], [200, 120, 200, PEACH]].forEach(([x, w, h, c], i) => decoBldg(x, 190, w, h, c, i + 4));
        ctx.restore(); SP.question(t, 250, -170, 0.6, 0.8); });
      P(circ(CX - 260, 1010, 28), '#F3EEFF', C.ink, 5); P(circ(CX - 310, 1080, 18), '#F3EEFF', C.ink, 4); } },
    { z: 0.85, draw: () => { floorV(1240, '#24163A', '#100A1C'); shadow(220, 1240, 110); person(220, 1240, 'yuva', { t, s: 1.0, look: 0.4, mood: 0.6, arms: [[0.4, 0.2], [-1.6, -0.6]] }); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('GAME MEIN AISA KUCH NAHI', CX, 1070, back(seg(t, D * 0.35, D * 0.35 + 0.4)), C.white, 44, C.ink);
  chipV('NA ROCKSTAR KA ELAAN', CX, 1170, back(seg(t, D * 0.6, D * 0.6 + 0.4)), C.white, 44, C.ink);
  vignette();
};

// ---------- n02 GTA 6's Vice City is inspired by Miami: beach + pastel Art Deco hotels ----------
DRAWV.miami = (t, d) => {
  const D = LINES.n02.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sunsetSky(); P(circ(760, 640, 110), '#FFE0A0', null); waves(t, 720, '#3E86B8', 5, 170, 0.5); } },
    { z: 0.4, draw: () => { [[-20, 230, 520, PPINK], [220, 210, 600, MINT], [440, 240, 540, LEMON], [690, 230, 580, SKYB], [930, 220, 500, PEACH]].forEach(([x, w, h, c], i) => decoBldg(x, 1050, w, h, c, i + 11, null, 0)); } },
    { z: 0.7, draw: () => { P(rr(-300, 1040, W + 600, 220, 0), '#F2DDB0', C.ink, 4); palm(90, 1180, 0.9, t, 3); palm(990, 1200, 1.0, t, 5);
      SP.car(lerp(1300, 560, easeOut(seg(t, 0.2, 1.6))), 1190, 1.0, '#F07CC0', t); } },
    { z: 0.95, draw: () => { floorV(1250, '#C9B48A', '#8C7A58'); SP.umbrella(230, 1600, 0.7, '#FF6FA8'); SP.umbrella(850, 1640, 0.75, '#2EC4B6'); } }],
    drift(t, d, 16), 0, lerp(1.0, 1.06, ease(t / d)));
  withT(CX, 420, back(seg(t, 0.15, 0.55)), 0, () => { P(rr(-380, -80, 760, 160, 24), 'rgba(10,14,24,0.9)', NPINK, 5); txt('GTA 6 · VICE CITY', 0, -24, 50, C.white); txt('MIAMI SE INSPIRED', 0, 36, 44, NPINK); });
  chipV('PASTEL ART DECO HOTELS', CX, 1150, back(seg(t, D * 0.55, D * 0.55 + 0.4)), MINT, 44, C.ink);
  vignette();
};

// ---------- n03 Marine Drive: ~3 km sea front, yellow/pink/blue Art Deco buildings ----------
DRAWV.marine = (t, d) => {
  const D = LINES.n03.dur, a = [-160, 1060], c = [380, 560], b = [1250, 520], km = seg(t, D * 0.25, D * 0.65);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#2E6E9E', '#BFE3F2'); P(circ(220, 330, 70), '#FFF4C8', null); glow(220, 330, 200, '#FFF4C8', 0.4); } },
    { z: 0.3, draw: () => { ctx.fillStyle = '#3E86B8'; ctx.beginPath(); ctx.moveTo(-300, 470); ctx.lineTo(1400, 420); ctx.lineTo(...b); ctx.quadraticCurveTo(c[0], c[1], ...a); ctx.lineTo(-300, 1100); ctx.closePath(); ctx.fill();
      alpha(0.35, () => { for (let i = 0; i < 14; i++) P(rr(100 + rnd(i) * 900 + Math.sin(t + i) * 20, 480 + i * 30, 70, 4, 2), C.white, null); });
      ctx.fillStyle = '#6E7F62'; ctx.beginPath(); ctx.moveTo(...a); ctx.quadraticCurveTo(...c, ...b); ctx.lineTo(1400, 2200); ctx.lineTo(-300, 2200); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#D8D0BE'; ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(...a); ctx.quadraticCurveTo(...c, ...b); ctx.stroke();
      ctx.strokeStyle = GOLD; ctx.lineWidth = 12; ctx.setLineDash([]); ctx.beginPath(); const steps = 40; for (let i = 0; i <= steps * km; i++) { const p = quadPt(a, c, b, i / steps); i ? ctx.lineTo(p[0], p[1] + 18) : ctx.moveTo(p[0], p[1] + 18); } ctx.stroke(); } },
    { z: 0.55, draw: () => { decoAlong([a[0] + 40, a[1] + 140], [c[0] + 60, c[1] + 240], [b[0], b[1] + 140], 9, [LEMON, PPINK, SKYB, LEMON, PPINK, SKYB, PEACH, MINT, PPINK], 300, 420, 1.15, 0.45); } },
    { z: 0.9, draw: () => { floorV(1240, '#5A6B5A', '#2A3428'); P(rr(-300, 1470, W + 600, 170, 0), '#3A3F48', C.ink, 4); for (let i = 0; i < 9; i++) P(rr(((i * 160 - t * 300) % 1440 + 1440) % 1440 - 200, 1550, 90, 12, 6), '#E8E2D0', null);
      SP.car(((t * 300 + 200) % 1500) - 200, 1530, 0.9, '#2E6BD8', t, true); SP.car(((900 - t * 260) % 1500 + 1500) % 1500 - 200, 1625, 1.0, '#F4D06F', t); palm(980, 1300, 0.95, t, 7); SP.streetLamp(80, 1260, 1.0, false); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('MUMBAI · MARINE DRIVE', CX, 400, back(seg(t, 0.15, 0.5)), GOLD, 50, C.ink);
  chipV('~3 KM SAMANDAR KINARA', 520, 520, back(seg(t, D * 0.3, D * 0.3 + 0.4)), C.white, 40, C.ink);
  const kc = seg(t, D * 0.6, D * 0.6 + 0.4); [[LEMON, 'PEELI'], [PPINK, 'GULABI'], [SKYB, 'NEELI']].forEach(([c, s], i) => chipV(s, 230 + i * 300, 1150, back(seg(t, D * 0.6 + i * 0.25, D * 0.6 + i * 0.25 + 0.35)), c, 44, C.ink));
  vignette();
};

// ---------- n04 twist: believed 2nd-largest Art Deco collection after Miami; 2018 UNESCO World Heritage (ensemble incl. Marine Drive) ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n04.dur, u = t - 0.3, kp = back(seg(u, D * 0.12, D * 0.3)), kb = back(seg(u, D * 0.62, D * 0.62 + 0.45));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#141A33', '#3A2A5E'); bokeh(t, 16, GOLD, 21); glow(CX, 760, 520, '#FFD08A', 0.25); } },
    { z: 0.5, draw: () => { withT(CX, 1090, kp, 0, () => { // podium
      shadow(0, 30, 420, 0.5);
      P(rr(-360, -260, 300, 260, 10), '#C9CED8', C.ink, 5); txt('#1', -210, -200, 70, C.ink); txt('MIAMI', -210, -110, 50, C.ink); decoBldg(-280, -270, 140, 230, PPINK, 3, null);
      P(rr(-40, -170, 300, 170, 10), GOLD, C.ink, 5); txt('#2', 110, -112, 70, C.ink); txt('MUMBAI', 110, -40, 50, C.ink); decoBldg(40, -180, 140, 260, LEMON, 5, null);
      SP2.sparkles(t, 110, -560, 140, 5, GOLD); }); } },
    { z: 0.85, draw: () => { floorV(1240, '#1B1B2E', '#0B0B16'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  SP2.burst(t, 0, CX, 640, 1.0, 'TWIST!');
  chipV('ART DECO COLLECTION · DUNIYA MEIN', CX, 400, back(seg(u, D * 0.15, D * 0.15 + 0.4)), C.white, 40, C.ink);
  chipV('"MAANA JAATA HAI"', CX, 490, back(seg(u, D * 0.2, D * 0.2 + 0.4)), '#B23AEE', 36, C.white);
  if (kb > 0) withT(780, 700, kb, -0.08, () => { glow(0, 0, 220, GOLD, 0.45); P(circ(0, 0, 150), '#1F5F8B', GOLD, 8); P(circ(0, 0, 118), null, C.white, 3);
    txt('WORLD', 0, -52, 42, C.white); txt('HERITAGE', 0, -6, 42, C.white); txt('2018', 0, 50, 56, GOLD); });
  chipV('UNESCO · MARINE DRIVE ENSEMBLE', CX, 1170, kb, GOLD, 38, C.ink);
  vignette();
};

// ---------- n05 night: Queen's Necklace; Miami Deco = neon, Mumbai = shaant ----------
DRAWV.necklace = (t, d) => {
  const D = LINES.n05.dur, a = [-120, 1000], c = [300, 470], b = [1220, 420], lit = seg(t, 0.2, D * 0.45), ks = easeOut(seg(t, D * 0.55, D * 0.55 + 0.6));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#060A1A', '#14224A'); stars(60); moonV(840, 330, 44); } },
    { z: 0.35, draw: () => { ctx.fillStyle = SEA; ctx.beginPath(); ctx.moveTo(-300, 440); ctx.lineTo(1400, 380); ctx.lineTo(...b); ctx.quadraticCurveTo(c[0], c[1], ...a); ctx.lineTo(-300, 1300); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1B2236'; ctx.beginPath(); ctx.moveTo(...a); ctx.quadraticCurveTo(c[0], c[1], ...b); ctx.lineTo(1400, 2200); ctx.lineTo(-300, 2200); ctx.closePath(); ctx.fill();
      decoAlong([a[0] + 40, a[1] + 120], [c[0] + 60, c[1] + 220], [b[0], b[1] + 120], 9, ['#5A5470', '#6A5068', '#4E6080'], 260, 360, 0.9, 0.35, 1);
      for (let i = 0; i < 30; i++) { const uu = i / 29, p = quadPt(a, c, b, uu); if (uu <= lit * 1.02) { glow(p[0], p[1] - 6, 46, GOLD, 0.6); P(circ(p[0], p[1] - 6, 8), '#FFF1C2', null); } else P(circ(p[0], p[1] - 6, 5), '#3A4560', null); } } },
    { z: 0.85, draw: () => { floorV(1240, '#151B2C', '#090C16'); SP.streetLamp(940, 1250, 1.0, true); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV("\"QUEEN'S NECKLACE\"", CX, 400, back(seg(t, D * 0.2, D * 0.2 + 0.4)) * (1 - ks), '#FFF1C2', 50, C.ink);
  if (ks > 0) { // split comparison card: neon vs calm
    withT(CX, 760, ks, 0, () => { P(rr(-450, -330, 900, 660, 26), 'rgba(8,10,20,0.9)', C.white, 4);
      ctx.save(); ctx.beginPath(); ctx.rect(-440, -320, 440, 640); ctx.clip(); decoBldg(-370, 200, 300, 380, '#2A1F40', 3, Math.floor(t * 4) % 2 ? NPINK : NCYAN); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(0, -320, 440, 640); ctx.clip(); glow(220, 0, 260, '#FFD08A', 0.25); decoBldg(70, 200, 300, 380, LEMON, 6, null, 1); ctx.restore();
      line(0, -320, 0, 320, C.white, 4); txt('MIAMI: NEON', -220, 270, 46, NPINK); txt('MUMBAI: SHAANT', 220, 270, 46, GOLD); });
  }
  vignette();
};

// ---------- n06 payoff: Vice City's desi twin? Marine Drive! (twins + city pins, no map) ----------
DRAWV.twins = (t, d) => {
  const D = LINES.n06.dur, k = back(seg(t, 0.2, 0.6)), kh = back(seg(t, D * 0.45, D * 0.45 + 0.4));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#2A1840', '#F08A4A'); glow(CX, 700, 480, '#FFD08A', 0.45); } },
    { z: 0.4, draw: () => { waves(t, 980, '#2E5E8A', 7, 160, 0.6); } },
    { z: 0.6, draw: () => { withT(CX, 1080, k, 0, () => { decoBldg(-400, 0, 280, 560, PPINK, 8, Math.floor(t * 4) % 2 ? NPINK : NCYAN); decoBldg(120, 0, 280, 560, LEMON, 9, null, 1);
      palm(-470, 30, 0.6, t, 4); palm(470, 30, 0.6, t, 6); });
      SP.pin(t, 0.4, 260, 470, 'VICE CITY (KALPANA)'); SP.pin(t, 0.7, 790, 470, 'MARINE DRIVE');
      if (kh > 0) withT(CX, 760, kh * (1 + 0.06 * Math.sin(t * 7)), 0, () => { glow(0, 0, 120, '#FF5A8A', 0.5); ctx.beginPath(); ctx.moveTo(0, 40); ctx.bezierCurveTo(-90, -20, -60, -100, 0, -60); ctx.bezierCurveTo(60, -100, 90, -20, 0, 40); ctx.fillStyle = '#FF5A8A'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.stroke(); }); } },
    { z: 0.9, draw: () => { floorV(1240, '#2A1A22', '#120A10'); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.06, ease(t / d)));
  chipV('DESI JUDWAAN?', CX, 360, back(seg(t, 0.1, 0.45)), GOLD, 56, C.ink);
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1C2440'); bokeh(t, 14, GOLD, 61); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 46px Oswald'; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -50, w, 100, 30), col, C.ink, 5); P(poly([-20, 48, 10, 48, -30, 85]), col, C.ink, 5); txt(s, 0, 3, 46, C.ink); }); };
      bub('MUMBAI!', 330, 470, 0.3, GOLD); bub('GOA?', 560, 620, 0.6, MINT); bub('KOCHI?', 320, 770, 0.9, PPINK); bub('VIZAG?', 520, 920, 1.2, SKYB);
      floorV(1240, '#1B2236', '#0B1020'); shadow(800, 1240, 110); person(800, 1240, 'mahila', { t, s: 1.05, look: -0.3, mood: 0.6, arms: [[0.3, 0.2], [-2.1, -0.4]] }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('AAPKA JAWAB? COMMENT KARO', CX, 380, back(seg(t, 0.1, 0.45)), GOLD, 44, C.ink);
  vignette();
};
