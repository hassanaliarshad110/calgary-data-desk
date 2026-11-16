// ===== Awazzzz GTA blitz #6 — "Agar GTA ka next map Mumbai hota?" (FAN THEORY / KALPANA) — native 9:16 scenes (DRAWV).
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters; "GTA" set in Oswald (our font).
// No outline map of India: abstract game-map board with zone pins only. Safe zone: key content x 40..940, y 340..1200; captions y 1250..1450.

// ---------- standalone-Short overrides of the kit overlays ----------
function partChip(n, T) { const a = T < 2.1 ? 1 : 1 - seg(T, 2.1, 2.5); if (a <= 0) return; alpha(a, () => { P(rr(140, 62, 250, 50, 25), C.red, null); txt('GTA × MUMBAI', 265, 89, 30, C.white, 'Oswald', 700); }); }
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
// PRP-042 streetLamp, PRP-023 umbrella, VFX-004 rain, VFX-013 motionStreaks, VFX-019 question, GFX-009 pin, GFX-010 route — ported onto the kit canvas.
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
function gameMap(t, k, pinT) { // abstract game-map board: blocks, a coastline wiggle, roads — NOT a real outline
  withT(CX, 760, k, -0.04, () => { shadow(0, 440, 420, 0.4); P(rr(-420, -420, 840, 840, 26), '#1A2A44', C.ink, 6);
    ctx.save(); ctx.beginPath(); ctx.roundRect(-410, -410, 820, 820, 20); ctx.clip();
    ctx.fillStyle = '#1F5F8B'; ctx.fillRect(-410, -410, 820, 820);
    ctx.fillStyle = '#2B3B2F'; ctx.beginPath(); ctx.moveTo(-60, -410); for (let i = 0; i <= 16; i++) { const y = -410 + i * 52; ctx.lineTo(-60 + Math.sin(i * 1.3) * 70 + i * 6, y); } ctx.lineTo(410, 410); ctx.lineTo(410, -410); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 14; i++) { const x = 40 + rnd(i + 4) * 330, y = -380 + rnd(i * 3 + 1) * 740; P(rr(x, y, 40 + rnd(i) * 50, 30 + rnd(i + 9) * 40, 4), '#3A4D3E', null); }
    ctx.strokeStyle = '#E8D9A8'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-10, 400); ctx.quadraticCurveTo(80, 0, 20, -400); ctx.stroke(); ctx.beginPath(); ctx.moveTo(20, 100); ctx.lineTo(410, 60); ctx.stroke();
    ctx.restore();
    txt('MUMBAI MAP · KALPANA', 0, -455, 40, GOLD, 'Oswald', 700); });
  const PN = [[CX - 90, 900, 'MARINE DRIVE'], [CX + 190, 600, 'LOCAL TRAIN'], [CX - 120, 520, 'SEA LINK']];
  PN.forEach(([x, y, l], i) => SP.pin(t, pinT + i * 0.35, x, y, l));
}

// ---------- spoken opening hook: "Socho agar GTA ka agla map Mumbai hota!" ----------
DRAWV.hook1 = (t, d) => {
  const run = (t * 560) % 1700 - 300;
  depth([
    { z: 0.05, haze: 1, draw: () => { nightCity(t, 13); bokeh(t, 12, CYAN, 5); } },
    { z: 0.4, draw: () => { gameMap(t, back(seg(t, 0.1, 0.6)) * 0.82, 0.6); } },
    { z: 0.85, draw: () => { floorV(1240, '#141A28', '#0A0E18'); P(rr(-100, 1120, W + 200, 130, 0), '#1A2133', null); for (let i = 0; i < 9; i++) P(rr(((i * 160 - t * 560) % 1440 + 1440) % 1440 - 200, 1180, 90, 12, 6), GOLD, null);
      SP.motionStreaks(run - 140, 1080, -1, 260, 5, 0.6); SP.car(run, 1130, 1.5, '#E2483D', t); SP.question(t, 860, 420, 1.2, 1.1); } },
  ], drift(t, d, 18), 0, lerp(1.0, 1.08, ease(t / d)));
  vignette();
};

// ---------- n01 only imagination, no real game or announcement ----------
DRAWV.intro = (t, d) => {
  const D = LINES.n01.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1A0F2E', '#3A1F5C'); bokeh(t, 14, '#C77DFF', 3); } },
    { z: 0.45, draw: () => { const k = back(seg(t, 0.1, 0.5)); // thought cloud with a game controller + city inside
      withT(CX, 700, k, wob(t, 0.4, 0.02), () => { glow(0, 0, 520, '#C77DFF', 0.35);
        [[-240, 40, 170], [-80, -90, 200], [120, -80, 190], [260, 50, 160], [0, 90, 220]].forEach(([x, y, r]) => P(circ(x, y, r), '#F3EEFF', C.ink, 6));
        [[-240, 40, 164], [-80, -90, 194], [120, -80, 184], [260, 50, 154], [0, 90, 214]].forEach(([x, y, r]) => P(circ(x, y, r), '#F3EEFF', null));
        ctx.save(); ctx.beginPath(); ctx.ellipse(0, 10, 330, 200, 0, 0, 6.283); ctx.clip(); alpha(0.9, () => skyline(150, '#5B4A8A', 7, 220, GOLD, 50)); ctx.restore();
        controller(0, 60, 1.1, t, '#2A2F3A'); });
      P(circ(CX - 260, 1010, 28), '#F3EEFF', C.ink, 5); P(circ(CX - 310, 1080, 18), '#F3EEFF', C.ink, 4); } },
    { z: 0.85, draw: () => { floorV(1240, '#24163A', '#100A1C'); shadow(220, 1240, 110); person(220, 1240, 'yuva', { t, s: 1.0, look: 0.4, mood: 0.6, arms: [[0.4, 0.2], [-1.6, -0.6]] }); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('KOI ASLI GAME YA ELAAN NAHI', CX, 1130, back(seg(t, D * 0.55, D * 0.55 + 0.4)), C.white, 44, C.ink);
  vignette();
};

// ---------- n02 Zone 1: Marine Drive — night street lights = "Queen's Necklace" ----------
DRAWV.marine = (t, d) => {
  const D = LINES.n02.dur, a = [-120, 1180], c = [260, 560], b = [1200, 470];
  const lit = seg(t, D * 0.25, D * 0.7);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#060A1A', '#14224A'); stars(60); moonV(820, 360, 48); alpha(0.85, () => skyline(560, '#10182E', 31, 160, GOLD, 50)); } },
    { z: 0.35, draw: () => { // sea above the curve, land below
      ctx.fillStyle = SEA; ctx.beginPath(); ctx.moveTo(-300, 560); ctx.lineTo(1400, 470); ctx.lineTo(1400, 1300); ctx.lineTo(...b); ctx.quadraticCurveTo(c[0], c[1], a[0], a[1]); ctx.lineTo(-300, 1300); ctx.closePath(); ctx.fill();
      alpha(0.3, () => { for (let i = 0; i < 18; i++) P(rr(780 + Math.sin(i * 2 + t) * 30, 440 + i * 22, 60 - i * 2, 4, 2), '#DDE8FF', null); });
      ctx.fillStyle = '#1B2236'; ctx.beginPath(); ctx.moveTo(...a); ctx.quadraticCurveTo(c[0], c[1], ...b); ctx.lineTo(1400, 2200); ctx.lineTo(-300, 2200); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2C3550'; ctx.lineWidth = 46; ctx.beginPath(); ctx.moveTo(a[0] + 40, a[1] + 40); ctx.quadraticCurveTo(c[0] + 30, c[1] + 50, b[0], b[1] + 30); ctx.stroke();
      for (let i = 0; i < 26; i++) { const u = i / 25, p = quadPt(a, c, b, u); const on = u <= lit * 1.02; if (on) { glow(p[0], p[1] - 6, 46, GOLD, 0.6); P(circ(p[0], p[1] - 6, 7), '#FFF1C2', null); } else P(circ(p[0], p[1] - 6, 5), '#3A4560', null); }
      const u = ((t * 0.16) % 1), p = quadPt([a[0] + 40, a[1] + 40], [c[0] + 30, c[1] + 50], [b[0], b[1] + 30], u); SP.car(p[0], p[1] + 8, lerp(0.55, 0.25, u), '#E2483D', t); } },
    { z: 0.85, draw: () => { floorV(1230, '#151B2C', '#090C16'); SP.streetLamp(120, 1240, 1.15, true); SP.streetLamp(880, 1240, 1.0, true); glow(CX, 1230, 300, GOLD, 0.15); } }],
    drift(t, d, 16), 0, lerp(1.0, 1.06, ease(t / d)));
  chipV('ZONE 1: MARINE DRIVE', CX, 400, back(seg(t, 0.2, 0.6)), GOLD, 50, C.ink);
  chipV("\"QUEEN'S NECKLACE\"", CX, 1060, back(seg(t, D * 0.5, D * 0.5 + 0.4)), '#FFF1C2', 46, C.ink);
  vignette();
};

// ---------- n03 side mission: catch the local train at peak time (packed coach, nobody hanging out) ----------
function coach(x, y, w, t, seed) { P(rr(x, y - 330, w, 330, 18), '#8E2B38', C.ink, 5); P(rr(x, y - 140, w, 30, 0), GOLD, null); P(rr(x, y - 330, w, 40, [18, 18, 0, 0]), '#6E1E2A', C.ink, 4);
  for (let i = 0; i < Math.floor(w / 130); i++) { const wx = x + 30 + i * 130; if (i === 2) { P(rr(wx, y - 280, 100, 270, 6), '#1A1E28', C.ink, 4); for (let j = 0; j < 8; j++) P(circ(wx + 20 + (j % 3) * 30, y - 250 + Math.floor(j / 3) * 46 + wob(t, 1, 3, j + seed), 18), ['#C68E62', '#8D5B3C', '#D9A77E'][j % 3], C.ink, 2); continue; }
    P(rr(wx, y - 270, 100, 100, 8), '#1A1E28', C.ink, 4); for (let j = 0; j < 5; j++) P(circ(wx + 18 + j * 17, y - 205 + wob(t, 1, 3, i * 5 + j + seed), 15), ['#C68E62', '#8D5B3C', '#D9A77E'][(i + j) % 3], null);
    ctx.strokeStyle = '#555'; ctx.lineWidth = 3; for (let g = 1; g < 5; g++) { ctx.beginPath(); ctx.moveTo(wx + g * 20, y - 270); ctx.lineTo(wx + g * 20, y - 170); ctx.stroke(); } }
  P(circ(x + 60, y, 26), '#222', C.ink, 4); P(circ(x + w - 60, y, 26), '#222', C.ink, 4); }
DRAWV.train = (t, d) => {
  const D = LINES.n03.dur, kx = easeOut(seg(t, 0, 1.4)), tx = lerp(1300, -260, kx);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#2A3550', '#E9A15A'); glow(CX, 700, 400, '#FFD08A', 0.4); alpha(0.8, () => skyline(820, '#3A3550', 23, 260, GOLD, 60)); } },
    { z: 0.45, draw: () => { P(rr(-300, 990, W + 600, 30, 0), '#4A4A55', null); line(-300, 1000, W + 300, 1000, '#9A9AA6', 5); for (let x = -300; x < W + 300; x += 150) line(x, 300, x, 1000, '#3A3F4D', 10); line(-300, 330, W + 300, 330, '#3A3F4D', 8);
      coach(tx, 990, 760, t, 1); coach(tx + 780, 990, 760, t, 9); } },
    { z: 0.85, draw: () => { floorV(1050, '#6B6B72', '#3A3A40'); P(rr(-300, 1040, W + 600, 20, 0), GOLD, null);
      for (let i = 0; i < 14; i++) peopleIcon(60 + i * 70 + wob(t, 1, 4, i), 1180 + (i % 2) * 30, 70, ['#3A6EA5', '#7A3B5A', '#2E8B7A', '#B4652A'][i % 4]);
      shadow(170, 1240, 90); person(170, 1240, 'mahila', { t, s: 0.95, look: 0.5, mood: 0.2 }); SP.question(t, 300, 900, D * 0.6, 0.8); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  const km = back(seg(t, 0.3, 0.7)); if (km > 0) withT(CX, 470, km, -0.03, () => { P(rr(-330, -95, 660, 190, 20), 'rgba(10,14,24,0.92)', GOLD, 5); txt('SIDE MISSION', 0, -46, 40, GOLD); txt('PEAK TIME: LOCAL PAKDO!', 0, 14, 48, C.white);
    const f = seg(t, D * 0.5, D * 0.85); P(rr(-230, 50, 460, 26, 13), '#333', null); P(rr(-230, 50, 460 * f, 26, 13), C.red, null); });
  chipV('MUSHKIL: MAX', 760, 640, back(seg(t, D * 0.85, D * 0.85 + 0.35)), C.red, 40, C.white);
  vignette();
};

// ---------- n04 twist: the biggest enemy is the traffic jam, not the police ----------
function wantedMeter(x, y, n, t) { P(rr(x - 230, y - 50, 460, 100, 22), 'rgba(10,14,24,0.9)', C.white, 4); txt('WANTED', x - 140, y + 2, 34, C.white);
  for (let i = 0; i < 5; i++) { const on = i < n; const cx = x - 40 + i * 52; P(circ(cx, y, 18), on ? (Math.floor(t * 6 + i) % 2 ? '#FF3B3B' : '#3B7BFF') : '#2A2F3A', C.ink, 3); if (on) glow(cx, y, 40, '#FF3B3B', 0.3); } }
DRAWV.twist = (t, d) => {
  const D = LINES.n04.dur, u = t - 0.35, kj = easeOut(seg(u, D * 0.15, D * 0.45));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#2A1A12', '#C8652A'); alpha(0.8, () => skyline(620, '#3A2418', 41, 220, GOLD, 60)); glow(CX, 560, 420, '#FFB070', 0.35); } },
    { z: 0.5, draw: () => { ctx.fillStyle = '#2B2B33'; ctx.beginPath(); ctx.moveTo(380, 600); ctx.lineTo(600, 600); ctx.lineTo(1300, 1300); ctx.lineTo(-300, 1300); ctx.closePath(); ctx.fill();
      const cols = ['#E2483D', '#2E6BD8', '#F4D06F', '#2BAA4A', '#E8E8E8', '#B23AEE'];
      for (let r = 0; r < 6; r++) { const y = 640 + r * 105, s = 0.3 + r * 0.15, n = 2 + Math.floor(r / 2); const shown = r < 6 * kj + 0.5;
        if (!shown) continue; for (let i = 0; i < n; i++) { const x = lerp(490 - 120 * (1 + r * 0.6), 490 + 120 * (1 + r * 0.6), n === 1 ? 0.5 : i / (n - 1)) + Math.sin(t * 9 + r + i) * 1.5; SP.car(x, y + 40 * s, s, cols[(r * 3 + i) % 6], 0); } }
      [[260, 800, 0], [760, 880, 1], [420, 1010, 2]].forEach(([x, y, i]) => { const on = Math.floor(t * 3 + i) % 2 === 0; if (kj > 0.5 && on) withT(x, y, 1, 0, () => { P(rr(-90, -36, 180, 72, 30), C.white, C.ink, 4); txt('PEE-PEE!', 0, 3, 34, C.red); }); }); } },
    { z: 0.85, draw: () => { floorV(1220, '#1E1E24', '#0E0E12'); P(rr(80, 1110, 420, 100, 18), 'rgba(10,14,24,0.9)', GOLD, 4); txt('SPEED: 0 KM/H', 290, 1162, 44, GOLD); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  if (t < 1.5) alpha(1 - seg(t, 1.1, 1.5), () => { glow(CX, 650, 500, GOLD, 0.4); txtStroke('TWIST!', CX, 650, 200, GOLD, C.ink, 18); });
  const kw = back(seg(u, D * 0.5, D * 0.5 + 0.35)); if (kw > 0) withT(CX, 420, kw, 0, () => wantedMeter(0, 0, Math.min(5, Math.floor(seg(u, D * 0.5, D * 0.75) * 5) + 1), t));
  chipV('DUSHMAN: TRAFFIC JAM', CX, 540, back(seg(u, D * 0.3, D * 0.3 + 0.4)) * (1 - seg(u, D * 0.5, D * 0.55)), C.red, 48, C.white);
  vignette();
};

// ---------- n05 monsoon mode: water on the roads, boat mission instead of car (cartoon, nobody in danger) ----------
function boat(x, y, s, t) { withT(x, y + Math.sin(t * 3) * 6, s, Math.sin(t * 2) * 0.04, () => { P(poly([-170, -40, 170, -40, 120, 30, -120, 30]), '#FF8A1E', C.ink, 5); P(rr(-150, -56, 300, 20, 8), '#FFD08A', C.ink, 4); line(0, -56, 0, -230, C.ink, 7); P(poly([4, -226, 110, -150, 4, -120]), C.white, C.ink, 4); P(poly([0, -230, -60, -205, 0, -185]), C.red, C.ink, 3); }); }
DRAWV.monsoon = (t, d) => {
  const D = LINES.n05.dur, wl = lerp(1240, 1010, easeOut(seg(t, 0.2, D * 0.45))), kb = easeOut(seg(t, D * 0.55, D * 0.85));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1E2836', '#4A5A6E'); for (let i = 0; i < 5; i++) alpha(0.5, () => P(ell(150 + i * 220, 360 + (i % 2) * 60, 220, 70), '#2A3444', null)); } },
    { z: 0.4, draw: () => { [[-40, 260, '#5A6B7E'], [250, 200, '#6E5A4E'], [480, 240, '#4E6A5E'], [740, 220, '#6A5A72']].forEach(([x, w, c], i) => building(x, 1080, w, 560 + i * 40, c, '#FFE9A8', i + 3));
      P(rr(-300, 1030, 520, 50, 0), '#8A8A92', C.ink, 4); shadow(130, 1030, 70); person(130, 1030, 'mahila', { t, s: 0.8, look: 0.5, mood: 0.6 }); SP.umbrella(138, 775, 0.58, '#2E6BD8'); } },
    { z: 0.7, draw: () => { SP.car(560, wl + 70, 1.2, '#E2483D', 0); waves(t, wl, 'rgba(70,110,150,0.85)', 9, 140); alpha(0.5, () => { for (let i = 0; i < 8; i++) P(ell(((i * 170 + t * 40) % 1300) - 100, wl + 30 + (i % 3) * 40, 50, 6), '#BFD8EE', null); });
      if (kb > 0) boat(lerp(1350, 700, kb), wl - 10, 0.9, t); } },
    { z: 0.95, draw: () => { SP.rain(t, 240, -0.2, 0.45, 44); floorV(1240, 'rgba(30,50,80,0.6)', '#0A1420'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.04, ease(t / d)));
  chipV('MONSOON MODE: ON', CX, 400, back(seg(t, 0.2, 0.6)), CYAN, 50, C.ink);
  chipV('NEW MISSION: NAAV!', 640, 640, back(seg(t, D * 0.7, D * 0.7 + 0.35)), '#FF8A1E', 44, C.ink);
  vignette();
};

// ---------- n06 final mission: chase over the sea on a cable-stayed sea bridge (stylised) ----------
DRAWV.sealink = (t, d) => {
  const D = LINES.n06.dur, deck = 880, run = lerp(-260, 1250, seg(t, 0.3, d - 0.2));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#2A1840', '#F08A4A'); glow(780, 760, 420, '#FFD08A', 0.55); P(circ(780, 800, 120), '#FFC56E', null); alpha(0.7, () => skyline(800, '#3A2440', 51, 180, GOLD, 50)); } },
    { z: 0.35, draw: () => { waves(t, 840, SEA, 6, 160, 0.6); alpha(0.4, () => { for (let i = 0; i < 12; i++) P(rr(700 + Math.sin(i * 3 + t) * 40, 860 + i * 26, 160 - i * 8, 5, 2), '#FFD08A', null); }); } },
    { z: 0.55, draw: () => { // pylon + fan of cables + deck
      const px = 380; P(poly([px - 60, deck, px - 16, 330, px + 16, 330, px + 60, deck]), '#D8D2C4', C.ink, 5); P(rr(px - 50, 520, 100, 26, 6), '#BDB6A6', C.ink, 3);
      ctx.strokeStyle = '#EDE6D6'; ctx.lineWidth = 3; for (let i = 1; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(px, 350 + i * 12); ctx.lineTo(px - i * 75, deck - 10); ctx.stroke(); ctx.beginPath(); ctx.moveTo(px, 350 + i * 12); ctx.lineTo(px + i * 75, deck - 10); ctx.stroke(); }
      P(rr(-300, deck - 14, W + 600, 44, 0), '#8A8478', C.ink, 4); for (let x = -260; x < W + 300; x += 300) P(rr(x, deck + 30, 40, 400, 0), '#6E685E', C.ink, 3);
      for (let i = 0; i < 18; i++) P(rr(i * 70 - 40, deck - 30, 6, 16, 0), '#BDB6A6', null);
      SP.motionStreaks(run - 160, deck - 30, -1, 260, 4, 0.6); SP.car(run, deck - 12, 0.8, '#2BAA4A', t); SP.car(run - 330, deck - 12, 0.8, '#2E6BD8', t); } },
    { z: 0.9, draw: () => { waves(t, 1160, SEA2, 12, 120, 1.2); floorV(1250, '#081626', '#04090F'); } }],
    drift(t, d, 18), 0, lerp(1.0, 1.07, ease(t / d)));
  chipV('FINAL MISSION', CX, 400, back(seg(t, 0.15, 0.5)), C.red, 50, C.white);
  chipV('BANDRA–WORLI SEA LINK', CX, 1110, back(seg(t, D * 0.35, D * 0.35 + 0.4)), GOLD, 46, C.ink);
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1C2440'); bokeh(t, 14, GOLD, 61); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 46px Oswald'; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -50, w, 100, 30), col, C.ink, 5); P(poly([-20, 48, 10, 48, -30, 85]), col, C.ink, 5); txt(s, 0, 3, 46, C.ink); }); };
      bub('MARINE DRIVE!', 380, 460, 0.3, GOLD); bub('SEA LINK CHASE!', 470, 610, 0.6, '#9DC4FF'); bub('LOCAL TRAIN!', 340, 760, 0.9, '#FF9DC4'); bub('PEHLE VADA PAV!', 430, 910, 1.2, '#9DFFB0');
      floorV(1240, '#1B2236', '#0B1020'); shadow(800, 1240, 110); person(800, 1240, 'mahila', { t, s: 1.05, look: -0.3, mood: 0.6, arms: [[0.3, 0.2], [-2.1, -0.4]] }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('COMMENT KARO', CX, 380, back(seg(t, 0.1, 0.45)), GOLD, 46, C.ink);
  vignette();
};
