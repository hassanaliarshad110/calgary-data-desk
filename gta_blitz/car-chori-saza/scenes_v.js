// ===== Awazzzz GTA blitz #5 — "GTA jaisi gaadi chheeni, to Bharat mein kitni saza?" (FACT: BNS 2023 s.309) — native 9:16 scenes (DRAWV).
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters; "GTA" set in Oswald (our font).
// No map at all. No police uniforms, no weapons, no realistic step-by-step carjacking: game-HUD abstraction + law graphics.
// Safe zone: key content x 40..940, y 250..1200; captions own y 1250..1450.

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

// ---------- helpers ----------
function chipV(s, x, y, k, col = C.green2, size = 38, fg = C.ink) { if (k <= 0) return; withT(x, y, k, 0, () => { ctx.font = `700 ${size}px Oswald`; const w = Math.min(880, ctx.measureText(s).width + 50); P(rr(-w / 2, -size * 0.95, w, size * 1.9, size * 0.95), col, C.ink, 4); txt(s, 0, 2, size, fg); }); }
KINDS.mahila = { body: '#7A3B5A', body2: '#612E47', skin: '#D9A77E', hair: 'bob', h: 0.93 };
KINDS.yuva = { body: '#2E8B7A', body2: '#236B5E', skin: '#C68E62', hair: 'short', h: 0.96 };
const GOLD = '#F4D06F', CYAN = '#4CC9F0', RED = '#E63946', WOOD = '#5A3A22';
function floorV(y, c1, c2) { ctx.fillStyle = grad(y, H + 300, c1, c2); ctx.fillRect(-300, y, W + 600, H + 600 - y); }
function moonV(x, y, r) { glow(x, y, r * 4, '#DDE8FF', 0.35); P(circ(x, y, r), '#F2F0E6', null); alpha(0.25, () => P(circ(x - r * 0.3, y - r * 0.2, r * 0.25), '#C8C4B4', null)); }

// Studio library assets (animation-studio catalogue via select_assets.py on brief.json): PRP-030 car (props.js car),
// PRP-013 clock (props.js clock), GFX-005 counter (graphics.js counter), VFX-019 question — ported onto the kit canvas.
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
    clock: (x, y, s = 1, t = 0) => pr(() => { O(0, 0, 70); F('#fff', OUT, 7); for (let i = 0; i < 12; i++) { ctx.save(); ctx.rotate(i * Math.PI / 6); ctx.fillStyle = OUT; ctx.fillRect(-3, -60, 6, 12); ctx.restore(); }
      ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(t * 0.9) * 32, -Math.cos(t * 0.9) * 32); ctx.stroke(); ctx.strokeStyle = '#d62828'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(t * 6) * 52, -Math.cos(t * 6) * 52); ctx.stroke(); }, x, y, s),
    counter: (t, t0, { x = CX, y = 700, from = 0, to = 10, dur = 1.2, suffix = '', size = 200, col = GOLD, label = '' } = {}) => { if (t < t0) return; const k = easeOut(clamp((t - t0) / dur)), v = Math.round(lerp(from, to, k));
      const pop = 1 + 0.12 * Math.max(0, 1 - Math.abs((t - t0 - dur) / 0.25)); withT(x, y, pop, 0, () => { txtStroke(v + suffix, 0, 0, size, col, C.ink, size * 0.09); if (label) txt(label, 0, size * 0.72, size * 0.3, C.white, 'Oswald', 700); }); },
    motionStreaks: (x, y, dir = -1, len = 220, n = 5, a = 0.7) => { ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineCap = 'round'; for (let i = 0; i < n; i++) { ctx.lineWidth = 6 - i * 0.6; ctx.beginPath(); const yy = y - 60 + i * 30; ctx.moveTo(x, yy); ctx.lineTo(x + dir * len * (0.6 + hash(i) * 0.4), yy); ctx.stroke(); } ctx.restore(); },
    question: (t, x, y, t0 = 0, s = 1) => { const k = back(seg(t, t0, t0 + 0.3)); if (k <= 0) return; withT(x, y + Math.sin(t * 4) * 6, k * s, 0, () => txtStroke('?', 0, 0, 120, '#ffd166', '#2a1c14', 8)); },
  };
})();

// ---------- own generic drawings ----------
function hudFrame(t, label) { // game-style HUD frame (own design)
  ctx.strokeStyle = 'rgba(76,201,240,0.85)'; ctx.lineWidth = 6; const m = 60, y0 = 330, y1 = 1210;
  [[m, y0, 1, 1], [940, y0, -1, 1], [m, y1, 1, -1], [940, y1, -1, -1]].forEach(([x, y, sx, sy]) => { ctx.beginPath(); ctx.moveTo(x + sx * 90, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * 90); ctx.stroke(); });
  P(rr(m + 20, y0 + 20, 250, 54, 12), 'rgba(10,14,24,0.85)', CYAN, 3); txt(label, m + 145, y0 + 48, 32, CYAN, 'Oswald', 700);
  alpha(0.08, () => { for (let y = y0; y < y1; y += 8) P(rr(m, y + (t * 40) % 8, 880, 2, 0), CYAN, null); });
}
function padButton(x, y, r, t, label, col = '#2BAA4A') { const p = 1 + 0.08 * Math.max(0, Math.sin(t * 7)); withT(x, y, p, 0, () => { glow(0, 0, r * 2.4, col, 0.45); P(circ(0, 6, r), '#111', null); P(circ(0, 0, r), col, C.ink, 5); txt(label, 0, 2, r * 0.9, C.white, 'Oswald', 700); }); }
function lawBook(x, y, s, open, t) { withT(x, y, s, 0, () => { shadow(0, 250, 300, 0.4);
  if (open < 0.5) { const sq = 1 - open * 2; withT(0, 0, 1, 0, () => { ctx.scale(Math.max(0.05, sq), 1); P(rr(-230, -300, 460, 560, 18), '#7A1F2B', C.ink, 7); P(rr(-200, -270, 400, 500, 10), null, GOLD, 3);
      txt('BHARATIYA', 0, -150, 58, GOLD); txt('NYAYA', 0, -80, 72, GOLD); txt('SANHITA', 0, -6, 64, GOLD); P(rr(-90, 50, 180, 6, 3), GOLD, null); txt('2023', 0, 120, 72, C.white); }); }
  else { const k = (open - 0.5) * 2; withT(0, 0, 1, 0, () => { ctx.scale(Math.max(0.05, k), 1);
      P(rr(-460, -300, 920, 560, 18), '#7A1F2B', C.ink, 7); P(rr(-440, -285, 430, 530, 8), '#FBF6E8', C.ink, 3); P(rr(10, -285, 430, 530, 8), '#FBF6E8', C.ink, 3);
      for (let i = 0; i < 9; i++) { P(rr(-410, -150 + i * 42, 360 - (i % 3) * 50, 10, 5), '#C9BFA6', null); P(rr(40, -60 + i * 34, 360 - (i % 4) * 40, 10, 5), '#C9BFA6', null); }
      txt('SECTION', -225, -230, 52, C.ink); txtStroke('309', -225, -150, 110, RED, C.ink, 8); txt('ROBBERY', 225, -200, 54, C.ink); txt('(LOOT)', 225, -140, 44, RED); }); } }); }
function scalesV(x, y, s, t) { const tilt = Math.sin(t * 1.6) * 0.08; withT(x, y, s, 0, () => { P(rr(-14, -260, 28, 260, 8), GOLD, C.ink, 4); P(rr(-90, -10, 180, 30, 10), GOLD, C.ink, 4);
  withT(0, -250, 1, tilt, () => { P(rr(-200, -10, 400, 20, 10), GOLD, C.ink, 4); [-180, 180].forEach(px => { line(px, 0, px - 50, 120, GOLD, 4); line(px, 0, px + 50, 120, GOLD, 4); withT(px, 120, 1, -tilt, () => P(ell(0, 0, 70, 18), GOLD, C.ink, 4)); }); });
  P(circ(0, -260, 22), GOLD, C.ink, 4); }); }
function gavelHit(x, y, s, t, tHit) { const u = t - tHit, a = u < 0 ? -0.9 * seg(t, tHit - 0.7, tHit - 0.25) * (1 - seg(t, tHit - 0.12, tHit)) : 0;
  P(rr(x - 110, y + 40, 220, 40, 12), C.wood2 || '#7A4A28', C.ink, 4); gavel(x + 40, y - 90, s, a);
  if (u > 0 && u < 0.5) alpha(1 - u * 2, () => { for (let i = 0; i < 8; i++) { const an = i / 8 * 6.283; line(x + Math.cos(an) * 60, y + 40 + Math.sin(an) * 30, x + Math.cos(an) * (90 + u * 160), y + 40 + Math.sin(an) * (40 + u * 80), GOLD, 6); } }); }
function iconCard(x, y, k, label, kind, col) { if (k <= 0) return; withT(x, y, k, 0, () => { P(rr(-140, -130, 280, 260, 26), 'rgba(10,14,24,0.92)', col, 5);
  withT(0, -35, 1, 0, () => {
    if (kind === 'chot') { withT(0, 0, 1, -0.6, () => { P(rr(-80, -26, 160, 52, 26), '#F2C9A0', C.ink, 4); P(rr(-26, -26, 52, 52, 4), '#FBE7D2', C.ink, 3); for (let i = 0; i < 4; i++) P(circ(-12 + (i % 2) * 24, -12 + Math.floor(i / 2) * 24, 4), '#C9A27E', null); }); }
    if (kind === 'roka') { P(rr(-40, -40, 80, 100, 22), '#F2C9A0', C.ink, 4); for (let i = 0; i < 4; i++) P(rr(-40 + i * 20, -82, 18, 56, 9), '#F2C9A0', C.ink, 3); P(rr(-62, -10, 30, 50, 15), '#F2C9A0', C.ink, 3); }
    if (kind === 'darr') { P(poly([0, -70, 75, 60, -75, 60]), GOLD, C.ink, 5); txt('!', 0, 18, 90, C.ink); }
  });
  txt(label, 0, 85, label.length > 12 ? 30 : 38, C.white, 'Oswald', 700); }); }
function jailBars(k, t) { if (k <= 0) return; const y0 = lerp(-1200, 0, k); ctx.save(); ctx.translate(0, y0);
  P(rr(-300, 230, W + 600, 50, 0), '#3A3F4A', C.ink, 5); P(rr(-300, 1180, W + 600, 50, 0), '#3A3F4A', C.ink, 5);
  for (let x = 30; x < W + 60; x += 120) { ctx.fillStyle = grad(0, 0, '#9AA3B2', '#5A6272'); P(rr(x, 250, 28, 950, 14), '#7E8696', C.ink, 4); alpha(0.4, () => P(rr(x + 5, 260, 7, 930, 4), '#DDE3EE', null)); }
  ctx.restore(); }
function calendarV(x, y, s, t, t0) { withT(x, y, s, 0, () => { P(rr(-110, -120, 220, 240, 18), C.white, C.ink, 5); P(rr(-110, -120, 220, 60, [18, 18, 0, 0]), RED, C.ink, 5); [-60, 60].forEach(px => P(rr(px - 8, -140, 16, 40, 8), '#555', C.ink, 3));
  const n = Math.max(0, Math.floor((t - t0) * 6)); txt('SAAL', 0, -90, 34, C.white); txt(String(2026 + Math.min(n, 10)), 0, 30, 64, C.ink); }); }
function roadV(t, horizon, col = '#2B2B33') { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(CX - 40, horizon); ctx.lineTo(CX + 40, horizon); ctx.lineTo(W + 500, 1300); ctx.lineTo(-500, 1300); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 10; i++) { const u = ((i / 10 + t * 0.35) % 1), yy = lerp(horizon, 1300, u * u), w2 = lerp(2, 26, u * u), h2 = lerp(6, 90, u * u); P(rr(CX - w2 / 2, yy, w2, h2, 2), GOLD, null); } }

// ---------- spoken opening hook: "GTA jaisi gaadi chheeni, to Bharat mein kitni saza?" ----------
DRAWV.hook1 = (t, d) => {
  const run = (t * 520) % 1600 - 300;
  depth([
    { z: 0.05, haze: 1, draw: () => { nightCity(t, 17); bokeh(t, 12, CYAN, 5); } },
    { z: 0.45, draw: () => { hudFrame(t, 'GTA MODE'); padButton(CX, 640, 110, t, 'Y', '#E2A33D'); txt('GAADI LO?', CX, 820, 60, C.white); } },
    { z: 0.85, draw: () => { floorV(1240, '#141A28', '#0A0E18'); P(rr(-100, 1120, W + 200, 130, 0), '#1A2133', null); for (let i = 0; i < 9; i++) P(rr(((i * 160 - t * 520) % 1440 + 1440) % 1440 - 200, 1180, 90, 12, 6), GOLD, null);
      SP.motionStreaks(run - 140, 1080, -1, 260, 5, 0.6); SP.car(run, 1130, 1.4, '#E2483D', t); SP.question(t, 800, 470, 1.0, 1.1); } },
  ], drift(t, d, 18), 0, lerp(1.0, 1.08, ease(t / d)));
  vignette();
};

// ---------- n01 game: one button, driver out, car yours. Real law? ----------
DRAWV.intro = (t, d) => {
  const D = LINES.n01.dur, kOut = easeOut(seg(t, D * 0.15, D * 0.45)), real = seg(t, D * 0.62, D * 0.72);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0A1024', '#1E2A52'); bokeh(t, 12, CYAN, 9); alpha(0.8, () => skyline(760, '#141C36', 21, 260, GOLD, 60)); } },
    { z: 0.5, draw: () => { floorV(1000, '#22283A', '#121624'); P(rr(-300, 960, W + 600, 50, 0), '#2B3046', null);
      SP.car(560, 1000, 1.5, '#2E6BD8', 0);
      shadow(lerp(330, 120, kOut), 1000, 60); person(lerp(330, 120, kOut), 1000, 'yuva', { t, s: 0.7, look: -0.6, mood: 0.1, walk: kOut > 0 && kOut < 1 ? t * 8 : 0 });
      const ka = back(seg(t, D * 0.4, D * 0.55)); if (ka > 0) withT(560, 760, ka, 0, () => { P(poly([-30, -60, 30, -60, 30, 0, 60, 0, 0, 60, -60, 0, -30, 0]), GOLD, C.ink, 4); }); } },
    { z: 0.85, draw: () => { hudFrame(t, 'MISSION'); padButton(800, 470, 70, t, 'Y', '#E2A33D'); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('DRIVER BAHAR, GAADI AAPKI', CX, 1130, back(seg(t, D * 0.35, D * 0.35 + 0.35)) * (1 - real), CYAN, 44, C.ink);
  if (real > 0) { alpha(real * 0.75, () => { ctx.fillStyle = '#05070D'; ctx.fillRect(0, 0, W, H); });
    alpha(real, () => { for (let i = 0; i < 6; i++) P(rr(0, rnd(i + Math.floor(t * 12)) * 1200 + 200, W, 6 + rnd(i) * 14, 0), 'rgba(230,57,70,0.35)', null); });
    chipV('ASLI ZINDAGI MEIN?', CX, 620, back(seg(t, D * 0.68, D * 0.68 + 0.35)), C.white, 64, C.ink);
    chipV('ASLI KANOON KYA KEHTA HAI?', CX, 780, back(seg(t, D * 0.78, D * 0.78 + 0.35)), GOLD, 46, C.ink); }
  vignette();
};

// ---------- n02 Bharatiya Nyaya Sanhita, 2023 — Section 309 ----------
DRAWV.law = (t, d) => {
  const D = LINES.n02.dur, open = easeOut(seg(t, D * 0.45, D * 0.75));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1C120C', '#4A2C1A'); glow(CX, 500, 520, '#FFB46A', 0.35); for (let i = 0; i < 5; i++) P(rr(40 + i * 210, 260, 70, 900, 8), '#3A2416', '#22140C', 4); } },
    { z: 0.4, draw: () => { scalesV(830, 560, 0.75, t); } },
    { z: 0.6, draw: () => { lawBook(CX - 10, 700, 0.95, open, t); } },
    { z: 0.9, draw: () => { floorV(1150, '#3A2416', '#1A0F08'); gavelHit(240, 1080, 0.9, t, D * 0.72); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.06, ease(t / d)));
  chipV('BNS 2023 · SECTION 309', CX, 330, back(seg(t, D * 0.65, D * 0.65 + 0.35)), GOLD, 50, C.ink);
  vignette();
};

// ---------- n03 twist: theft + hurt / wrongful restraint / fear = robbery ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n03.dur, u = t - 0.35;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#140A1E', '#3A1A3E'); bokeh(t, 10, '#FF6B8A', 4); } },
    { z: 0.5, draw: () => {
      const kc = back(seg(u, 0.1, 0.45)); if (kc > 0) withT(CX, 420, kc, 0, () => { P(rr(-200, -60, 400, 120, 30), '#2A2F3A', C.white, 5); txt('CHORI', 0, 4, 70, C.white); });
      const kp = back(seg(u, D * 0.08, D * 0.08 + 0.3)); if (kp > 0) withT(CX, 545, kp, 0, () => txtStroke('+', 0, 0, 90, GOLD, C.ink, 8));
      iconCard(180, 720, back(seg(u, D * 0.11, D * 0.11 + 0.35)), 'CHOT', 'chot', '#FF6B8A');
      iconCard(490, 720, back(seg(u, D * 0.24, D * 0.24 + 0.35)), 'ZABARDASTI ROKA', 'roka', CYAN);
      iconCard(800, 720, back(seg(u, D * 0.36, D * 0.36 + 0.35)), 'JAAN/CHOT KA DARR', 'darr', GOLD);
      const ke = back(seg(u, D * 0.62, D * 0.62 + 0.3)); if (ke > 0) withT(CX, 905, ke, 0, () => txtStroke('=', 0, 0, 100, GOLD, C.ink, 8));
      const ks = back(seg(u, D * 0.7, D * 0.7 + 0.35)); if (ks > 0) withT(CX, 1060, ks * 1.0, -0.06, () => { glow(0, 0, 360, RED, 0.45); P(rr(-330, -85, 660, 170, 22), 'rgba(230,57,70,0.15)', RED, 10); txt('LOOT = ROBBERY', 0, 4, 84, RED); });
      const kx = seg(u, D * 0.62, D * 0.7); if (kx > 0) alpha(kx, () => { line(CX - 170, 420, CX + 170, 420, RED, 12); }); } },
    { z: 0.9, draw: () => { floorV(1230, '#1E1028', '#0E0814'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  if (t < 1.4) alpha(1 - seg(t, 1.0, 1.4), () => { glow(CX, 650, 500, GOLD, 0.4); txtStroke('TWIST!', CX, 650, 200, GOLD, C.ink, 18); });
  vignette();
};

// ---------- n04 punishment: rigorous imprisonment up to 10 years + fine ----------
DRAWV.ten = (t, d) => {
  const D = LINES.n04.dur, kb = easeOut(seg(t, 0.1, 0.6));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0E1420', '#26324A'); glow(CX, 640, 480, '#9DB8FF', 0.25); } },
    { z: 0.3, draw: () => { jailBars(kb, t); floorV(1235, '#1A2030', '#0A0E16'); } },
    { z: 0.8, draw: () => { calendarV(210, 960, 0.9, t, 0.6); if (t >= D * 0.3) { alpha(seg(t, D * 0.3, D * 0.3 + 0.2), () => P(rr(380, 440, 520, 440, 36), 'rgba(10,14,24,0.88)', GOLD, 6)); }
      SP.counter(t, D * 0.3, { x: 640, y: 610, from: 0, to: 10, dur: 1.2, size: 230, label: 'SAAL TAK' }); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('KATHOR QAID', CX, 380, back(seg(t, 0.2, 0.55)), C.white, 50, C.ink);
  chipV('+ JURMANA', CX, 1110, back(seg(t, D * 0.65, D * 0.65 + 0.35)), GOLD, 50, C.ink);
  vignette();
};

// ---------- n05 highway, between sunset and sunrise: up to 14 years ----------
DRAWV.highway = (t, d) => {
  const D = LINES.n05.dur, ns = seg(t, 0.3, D * 0.4), hz = 760;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#2A1840', '#F08A4A'); alpha(ns, () => sky('#060A1A', '#14224A')); if (ns > 0.5) alpha((ns - 0.5) * 2, () => { stars(60); moonV(790, 380, 50); });
      const sy = lerp(640, 900, ns); alpha(1 - ns, () => { glow(300, sy, 300, '#FFD08A', 0.55); P(circ(300, sy, 90), '#FFC56E', null); });
      alpha(0.85, () => skyline(hz, '#1A1430', 33, 160, GOLD, 50)); } },
    { z: 0.45, draw: () => { roadV(t, hz, '#26262E'); P(rr(80, 860, 260, 70, 10), '#2BAA4A', C.white, 5); txt('HIGHWAY', 210, 897, 40, C.white); line(210, 930, 210, 1060, '#888', 10); } },
    { z: 0.85, draw: () => { SP.car(CX + 140, 1190, 1.1, '#E2483D', t); floorV(1240, '#14121E', '#08070E'); const kc = back(seg(t, D * 0.25, D * 0.25 + 0.35)); if (kc > 0) withT(170, 470, kc, 0, () => SP.clock(0, 0, 1.0, t * 3)); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.06, ease(t / d)));
  chipV('SURAJ DHALNE SE UGNE TAK', CX, 350, back(seg(t, 0.4, 0.8)), GOLD, 44, C.ink);
  const kn = seg(t, D * 0.62, D * 0.62 + 0.2); if (kn > 0) { alpha(kn, () => { P(rr(160, 520, 680, 330, 30), 'rgba(10,14,24,0.85)', RED, 6); }); SP.counter(t, D * 0.62, { x: CX, y: 650, from: 10, to: 14, dur: 1.0, size: 200, col: RED, label: 'SAAL TAK QAID' }); }
  vignette();
};

// ---------- n06 attempt: up to 7 years; voluntarily causing hurt: up to life ----------
DRAWV.more = (t, d) => {
  const D = LINES.n06.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#101626', '#2A2440'); bokeh(t, 10, GOLD, 21); for (let i = 0; i < 4; i++) P(rr(60 + i * 260, 300, 90, 880, 10), '#22263A', '#161A2A', 4); } },
    { z: 0.55, draw: () => {
      const card = (y, k, top, big, col) => { if (k <= 0) return; withT(CX, y, k, 0, () => { P(rr(-400, -150, 800, 300, 30), 'rgba(10,14,24,0.93)', col, 6); txt(top, 0, -70, 50, C.white); txtStroke(big, 0, 40, 104, col, C.ink, 9); }); };
      card(540, back(seg(t, 0.1, 0.45)), 'SIRF KOSHISH?', '7 SAAL TAK', GOLD);
      card(900, back(seg(t, D * 0.45, D * 0.45 + 0.4)), 'JAAN-BOOJHKAR CHOT?', 'UMRQAID TAK', RED); } },
    { z: 0.9, draw: () => { floorV(1240, '#14182A', '#080A14'); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.04, ease(t / d)));
  chipV('AUR DHAARAAYEIN BHI LAG SAKTI HAIN', CX, 1150, back(seg(t, D * 0.75, D * 0.75 + 0.35)), C.white, 36, C.ink);
  vignette();
};

// ---------- n07 games respawn, real life doesn't ----------
DRAWV.respawn = (t, d) => {
  const D = LINES.n07.dur, kx = seg(t, D * 0.45, D * 0.6);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#05070D', '#141A2A'); bokeh(t, 8, RED, 33); } },
    { z: 0.5, draw: () => { hudFrame(t, 'GAME OVER');
      const kb = back(seg(t, 0.1, 0.4)); if (kb > 0) withT(CX, 620, kb, 0, () => { P(rr(-300, -80, 600, 160, 40), '#2BAA4A', C.ink, 6); txt('↻ RESPAWN', 0, 4, 80, C.white); });
      if (kx > 0) { line(CX - 330 * kx, 520, CX + 330 * kx, 720, RED, 18); line(CX + 330 * kx, 520, CX - 330 * kx, 720, RED, 18); }
      const kn = back(seg(t, D * 0.55, D * 0.55 + 0.35)); if (kn > 0) withT(CX, 900, kn, 0, () => { P(rr(-380, -90, 760, 180, 30), 'rgba(10,14,24,0.93)', GOLD, 5); txt('ASLI ZINDAGI:', 0, -32, 50, C.white); txt('NO RESPAWN', 0, 38, 70, GOLD); }); } },
    { z: 0.9, draw: () => { floorV(1235, '#141A2A', '#05070D'); controller(800, 1150, 0.8, t, '#2A2F3A'); } }],
    drift(t, d, 8), 0, lerp(1.0, 1.04, ease(t / d)));
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1C2440'); bokeh(t, 14, GOLD, 61); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 46px Oswald'; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -50, w, 100, 30), col, C.ink, 5); P(poly([-20, 48, 10, 48, -30, 85]), col, C.ink, 5); txt(s, 0, 3, 46, C.ink); }); };
      bub('GAADI CHHEENNA?', 380, 470, 0.3, GOLD); bub('OVERSPEEDING?', 420, 620, 0.6, '#9DC4FF'); bub('RED LIGHT JUMP?', 360, 770, 0.9, '#FF9DC4'); bub('BINA HELMET?', 400, 920, 1.2, '#9DFFB0');
      floorV(1240, '#1B2236', '#0B1020'); shadow(800, 1240, 110); person(800, 1240, 'mahila', { t, s: 1.05, look: -0.3, mood: 0.6, arms: [[0.3, 0.2], [-2.1, -0.4]] }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('COMMENT KARO', CX, 340, back(seg(t, 0.1, 0.45)), GOLD, 46, C.ink);
  vignette();
};
