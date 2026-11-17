// ===== Awazzzz GTA blitz #15 — "Agar GTA ka next map Mumbai hota?" (FAN THEORY / KALPANA) — native 9:16 scenes (DRAWV).
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters; "GTA" set in Oswald (our font).
// No outline map of India: abstract game-map board with zone pins only. Safe zone: key content x 40..940, y 340..1200; captions y 1250..1450.

// ---------- standalone-Short overrides of the kit overlays ----------
function partChip(n, T) { const a = T < 2.1 ? 1 : 1 - seg(T, 2.1, 2.5); if (a <= 0) return; alpha(a, () => { P(rr(140, 62, 250, 50, 25), C.red, null); txt('GTA × DILLI', 265, 89, 30, C.white, 'Oswald', 700); }); }
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
// PRP-042 streetLamp, VFX-002 smoke (as smog), VFX-013 motionStreaks, VFX-019 question, GFX-009 pin, GFX-010 route — ported onto the kit canvas.
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
    smoke: (t, x, y, spread = 900, rise = 300, n = 22, seed = 5, col = '170,170,165', a = 0.35) => { for (let i = 0; i < n; i++) { const life = 3 + hash(i + seed) * 2, ph = ((t + hash(i * 3 + seed) * life) % life) / life; const px = x + (hash(i * 7 + seed) - .5) * spread + ph * 60 + Math.sin(t + i) * 15, py = y - ph * rise; const rad = (60 + ph * 220) * (0.6 + hash(i * 11 + seed) * 0.6); const g = ctx.createRadialGradient(px, py, 0, px, py, rad); g.addColorStop(0, `rgba(${col},${a * (1 - ph * 0.5)})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; O(px, py, rad); ctx.fill(); } },
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

// ---------- own generic drawings ----------
const DUSK = '#E9A15A';
function gameMap(t, k, pinT) { // abstract game-map board: blocks, a river wiggle, a ring road — NOT a real outline
  withT(CX, 760, k, -0.04, () => { shadow(0, 440, 420, 0.4); P(rr(-420, -420, 840, 840, 26), '#1A2A44', C.ink, 6);
    ctx.save(); ctx.beginPath(); ctx.roundRect(-410, -410, 820, 820, 20); ctx.clip();
    ctx.fillStyle = '#3B4A36'; ctx.fillRect(-410, -410, 820, 820);
    ctx.strokeStyle = '#2E7FB0'; ctx.lineWidth = 40; ctx.beginPath(); ctx.moveTo(300, -420); for (let i = 0; i <= 16; i++) ctx.lineTo(300 + Math.sin(i * 1.1) * 40 - i * 4, -410 + i * 52); ctx.stroke();
    for (let i = 0; i < 18; i++) { const x = -380 + rnd(i + 4) * 600, y = -380 + rnd(i * 3 + 1) * 740; P(rr(x, y, 40 + rnd(i) * 50, 30 + rnd(i + 9) * 40, 4), '#4D5E48', null); }
    ctx.strokeStyle = '#E8D9A8'; ctx.lineWidth = 7; [70, 110].forEach(r => { ctx.beginPath(); ctx.arc(-40, 40, r, 0, 6.283); ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(-410, 300); ctx.quadraticCurveTo(-100, 200, 260, -380); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-40, 150); ctx.lineTo(-40, 410); ctx.stroke();
    ctx.restore();
    txt('DILLI MAP · KALPANA', 0, -455, 40, GOLD, 'Oswald', 700); });
  const PN = [[CX - 160, 520, 'CHANDNI CHOWK'], [CX - 40, 800, 'CP'], [CX + 150, 1000, 'METRO']];
  PN.forEach(([x, y, l], i) => SP.pin(t, pinT + i * 0.35, x, y, l));
}
function rickshaw(x, y, s, t, col = '#2BAA4A') { withT(x, y, s, 0, () => { // cycle-rickshaw, side view (own drawing)
  const wh = (wx, r) => { P(circ(wx, -r, r), null, C.ink, 6); ctx.save(); ctx.translate(wx, -r); ctx.rotate(t * 5); for (let i = 0; i < 6; i++) { ctx.rotate(1.047); line(0, 0, r - 4, 0, '#666', 3); } ctx.restore(); };
  wh(-120, 52); wh(40, 52); wh(150, 46);
  line(-120, -52, 40, -52, C.ink, 7); line(40, -52, 150, -46, C.ink, 7); line(150, -46, 120, -150, C.ink, 7); line(110, -150, 160, -160, C.ink, 7);
  P(rr(-180, -170, 200, 90, 14), col, C.ink, 5); P(rr(-170, -150, 180, 24, 8), '#E8D9A8', null);
  ctx.fillStyle = '#C8452A'; ctx.beginPath(); ctx.moveTo(-200, -170); ctx.quadraticCurveTo(-200, -300, -60, -300); ctx.lineTo(10, -300); ctx.lineTo(30, -170); ctx.closePath(); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.stroke();
  line(60, -110, 80, -60, C.ink, 6); P(rr(40, -120, 50, 14, 6), '#333', null);
  P(circ(80, -235, 30), '#C68E62', C.ink, 4); P(rr(55, -205, 54, 90, 18), '#3A6EA5', C.ink, 4); line(95, -180, 150, -160, '#3A6EA5', 12); line(70, -120, 80 + Math.sin(t * 10) * 14, -70, '#2A2F3A', 12); }); }
function shopFront(x, y, w, h, col, aw, label, seed) { P(rr(x, y - h, w, h, 4), col, C.ink, 4);
  for (let j = 0; j < 2; j++) P(rr(x + 14 + j * (w - 28) / 2, y - h + 20, (w - 42) / 2, h * 0.28, 4), '#FFE9A8', C.ink, 3);
  ctx.fillStyle = aw; ctx.beginPath(); ctx.moveTo(x - 6, y - h * 0.52); ctx.lineTo(x + w + 6, y - h * 0.52); ctx.lineTo(x + w + 24, y - h * 0.38); ctx.lineTo(x - 24, y - h * 0.38); ctx.closePath(); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#FFF1C2' : aw; ctx.fillRect(x - 24 + i * (w + 48) / 6, y - h * 0.38, (w + 48) / 6, 14); }
  P(rr(x + 6, y - h * 0.34, w - 12, h * 0.34, 2), '#2A2230', null); for (let i = 0; i < 5; i++) P(rr(x + 14 + i * (w - 28) / 5, y - 40 - (i % 2) * 18, (w - 40) / 5, 30 + (i % 2) * 18, 4), ['#E2483D', '#F4D06F', '#2BAA4A', '#B23AEE', '#4CC9F0'][(i + seed) % 5], null);
  if (label) { P(rr(x + 10, y - h * 0.66, w - 20, 50, 8), '#FFF1C2', C.ink, 3); txt(label, x + w / 2, y - h * 0.66 + 27, 30, '#8E2B38', 'Oswald', 700); } }
function wantedMeter(x, y, n, t) { P(rr(x - 230, y - 50, 460, 100, 22), 'rgba(10,14,24,0.9)', C.white, 4); txt('WANTED', x - 140, y + 2, 34, C.white);
  for (let i = 0; i < 5; i++) { const on = i < n; const cx = x - 40 + i * 52; P(circ(cx, y, 18), on ? (Math.floor(t * 6 + i) % 2 ? '#FF3B3B' : '#3B7BFF') : '#2A2F3A', C.ink, 3); if (on) glow(cx, y, 40, '#FF3B3B', 0.3); } }

// ---------- spoken opening hook: "Socho agar GTA ka map Dilli hota!" ----------
DRAWV.hook1 = (t, d) => {
  const run = (t * 560) % 1700 - 300;
  depth([
    { z: 0.05, haze: 1, draw: () => { nightCity(t, 17); bokeh(t, 12, GOLD, 5); } },
    { z: 0.4, draw: () => { gameMap(t, back(seg(t, 0.1, 0.6)) * 0.82, 0.6); } },
    { z: 0.85, draw: () => { floorV(1240, '#141A28', '#0A0E18'); P(rr(-100, 1120, W + 200, 130, 0), '#1A2133', null); for (let i = 0; i < 9; i++) P(rr(((i * 160 - t * 560) % 1440 + 1440) % 1440 - 200, 1180, 90, 12, 6), GOLD, null);
      SP.motionStreaks(run - 140, 1080, -1, 260, 5, 0.6); SP.car(run, 1130, 1.5, '#E2483D', t); SP.question(t, 860, 420, 1.2, 1.1); } },
  ], drift(t, d, 18), 0, lerp(1.0, 1.08, ease(t / d)));
  vignette();
};

// ---------- n01 only imagination ----------
DRAWV.intro = (t, d) => {
  const D = LINES.n01.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1A0F2E', '#3A1F5C'); bokeh(t, 14, '#C77DFF', 3); } },
    { z: 0.45, draw: () => { const k = back(seg(t, 0.1, 0.5));
      withT(CX, 700, k, wob(t, 0.4, 0.02), () => { glow(0, 0, 520, '#C77DFF', 0.35);
        [[-240, 40, 170], [-80, -90, 200], [120, -80, 190], [260, 50, 160], [0, 90, 220]].forEach(([x, y, r]) => P(circ(x, y, r), '#F3EEFF', C.ink, 6));
        [[-240, 40, 164], [-80, -90, 194], [120, -80, 184], [260, 50, 154], [0, 90, 214]].forEach(([x, y, r]) => P(circ(x, y, r), '#F3EEFF', null));
        ctx.save(); ctx.beginPath(); ctx.ellipse(0, 10, 330, 200, 0, 0, 6.283); ctx.clip(); alpha(0.9, () => skyline(150, '#5B4A8A', 9, 220, GOLD, 50)); ctx.restore();
        controller(0, 60, 1.1, t, '#2A2F3A'); });
      P(circ(CX - 260, 1010, 28), '#F3EEFF', C.ink, 5); P(circ(CX - 310, 1080, 18), '#F3EEFF', C.ink, 4); } },
    { z: 0.85, draw: () => { floorV(1240, '#24163A', '#100A1C'); shadow(220, 1240, 110); person(220, 1240, 'yuva', { t, s: 1.0, look: 0.4, mood: 0.6, arms: [[0.4, 0.2], [-1.6, -0.6]] }); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('KOI ASLI GAME YA ELAAN NAHI', CX, 1130, back(seg(t, D * 0.4, D * 0.4 + 0.4)), C.white, 44, C.ink);
  vignette();
};

// ---------- n02 Zone 1: Chandni Chowk — old bazaar lane, too narrow for cars, rickshaw mission ----------
DRAWV.chandni = (t, d) => {
  const D = LINES.n02.dur, kr = easeOut(seg(t, D * 0.55, D * 0.95));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#3A2A4A', DUSK); glow(CX, 520, 380, '#FFD08A', 0.45); } },
    { z: 0.3, draw: () => { // far end of the lane: small facades converging
      for (let i = 0; i < 4; i++) { shopFront(300 - i * 40 + 0, 760 - i * 20, 110 - i * 12, 300 - i * 40, ['#B4652A', '#7A3B5A', '#2E6B8A', '#8E6B2A'][i], ['#E2483D', '#2BAA4A', '#F4D06F', '#4CC9F0'][i], '', i); shopFront(560 + i * 40, 760 - i * 20, 110 - i * 12, 300 - i * 40, ['#6E5A4E', '#2E8B7A', '#8E2B38', '#5A6B7E'][i], ['#F4D06F', '#E2483D', '#4CC9F0', '#2BAA4A'][i], '', i + 2); }
      ctx.strokeStyle = '#222'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-50, 380 + i * 30); ctx.quadraticCurveTo(CX, 470 + i * 34, W + 50, 360 + i * 36); ctx.stroke(); } } },
    { z: 0.6, draw: () => { // near shops, left and right, crowd
      shopFront(-60, 1120, 330, 720, '#B4652A', '#E2483D', 'MITHAI', 1); shopFront(810, 1120, 330, 720, '#2E6B8A', '#F4D06F', 'KAPDA', 3);
      ctx.fillStyle = '#5A4A42'; ctx.beginPath(); ctx.moveTo(270, 1120); ctx.lineTo(420, 760); ctx.lineTo(660, 760); ctx.lineTo(810, 1120); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 12; i++) peopleIcon(330 + (i % 6) * 75 + wob(t, 0.8, 5, i), 860 + Math.floor(i / 6) * 60, 46 + Math.floor(i / 6) * 10, ['#3A6EA5', '#7A3B5A', '#2E8B7A', '#B4652A', '#B23AEE'][i % 5]);
      rickshaw(lerp(1250, 540, kr), 1100, 0.95, t); } },
    { z: 0.9, draw: () => { floorV(1180, '#4A3A34', '#1E1612');
      const kc = seg(t, D * 0.3, D * 0.5); if (kc > 0) { SP.car(160, 1230, 1.0, '#2E6BD8', 0); alpha(kc, () => { ctx.strokeStyle = '#FF3B3B'; ctx.lineWidth = 18; ctx.lineCap = 'round'; line(80, 1060, 260, 1220, '#FF3B3B', 18); line(260, 1060, 80, 1220, '#FF3B3B', 18); }); } } }],
    drift(t, d, 14), 0, lerp(1.0, 1.06, ease(t / d)));
  chipV('ZONE 1: CHANDNI CHOWK', CX, 400, back(seg(t, 0.2, 0.6)), GOLD, 50, C.ink);
  chipV('SADIYON PURANA BAZAAR', CX, 500, back(seg(t, D * 0.2, D * 0.2 + 0.4)) * (1 - seg(t, D * 0.55, D * 0.6)), C.white, 40, C.ink);
  chipV('NEW RIDE: RICKSHAW!', 600, 560, back(seg(t, D * 0.65, D * 0.65 + 0.35)), '#2BAA4A', 44, C.ink);
  vignette();
};

// ---------- n03 fast travel: Delhi Metro on an elevated track ----------
function metroCar(x, y, w, seed, t) { P(rr(x, y - 220, w, 220, 30), '#D8DCE2', C.ink, 5); P(rr(x, y - 90, w, 26, 0), '#B23AEE', null); P(rr(x, y - 60, w, 14, 0), '#E2483D', null);
  for (let i = 0; i < Math.floor(w / 110); i++) { const wx = x + 28 + i * 110; P(rr(wx, y - 190, 80, 80, 10), '#1A2A44', C.ink, 3); for (let j = 0; j < 3; j++) P(circ(wx + 18 + j * 22, y - 130 + wob(t, 1, 2, i * 3 + j + seed), 13), ['#C68E62', '#8D5B3C', '#D9A77E'][(i + j) % 3], null); }
  P(rr(x + w / 2 - 40, y - 200, 80, 150, 6), '#9AA3AE', C.ink, 3); }
DRAWV.metro = (t, d) => {
  const D = LINES.n03.dur, tx = lerp(1200, -1500, seg(t, 0, d)), deck = 860, kf = seg(t, 0.4, D * 0.8);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#2A3A6A', '#F2A65A'); glow(800, 700, 380, '#FFD08A', 0.5); alpha(0.8, () => skyline(820, '#3A3A5A', 29, 260, GOLD, 60)); } },
    { z: 0.45, draw: () => { for (let x = -200; x < W + 400; x += 340) { P(rr(x, deck + 30, 70, 400, 6), '#A8A29A', C.ink, 4); P(rr(x - 40, deck + 20, 150, 30, 6), '#8E887E', C.ink, 3); }
      P(rr(-300, deck, W + 600, 40, 0), '#B8B2A8', C.ink, 4); metroCar(tx, deck, 700, 1, t); metroCar(tx + 720, deck, 700, 7, t); metroCar(tx + 1440, deck, 700, 13, t);
      SP.motionStreaks(tx + 2180, deck - 110, 1, 240, 4, 0.6); } },
    { z: 0.85, draw: () => { floorV(1240, '#2A2A34', '#121218'); for (let i = 0; i < 10; i++) peopleIcon(500 + i * 60 + wob(t, 1, 3, i), 1200, 60, ['#3A6EA5', '#7A3B5A', '#2E8B7A', '#B4652A'][i % 4]);
      shadow(200, 1240, 90); person(200, 1240, 'mahila', { t, s: 0.95, look: 0.5, mood: 0.7, arms: [[0.4, 0.2], [-2.0, -0.4]] }); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  const km = back(seg(t, 0.2, 0.6)); if (km > 0) withT(CX, 470, km, -0.03, () => { P(rr(-330, -95, 660, 190, 20), 'rgba(10,14,24,0.92)', GOLD, 5); txt('FAST TRAVEL', 0, -46, 40, GOLD); txt('DELHI METRO', 0, 14, 56, C.white);
    P(rr(-230, 50, 460, 26, 13), '#333', null); P(rr(-230, 50, 460 * kf, 26, 13), '#2BFF88', null); });
  chipV('BHARAT KA SABSE BADA METRO NETWORK', CX, 660, back(seg(t, D * 0.45, D * 0.45 + 0.4)), GOLD, 36, C.ink);
  vignette();
};

// ---------- n04 twist: boss level = Connaught Place's concentric circles (top-down, stylised) ----------
DRAWV.cp = (t, d) => {
  const D = LINES.n04.dur, u = t - 0.35, kr = easeOut(seg(u, 0, 0.8)), spin = t * 0.9, cy = 760;
  depth([{ z: 0.05, haze: 1, draw: () => { ctx.fillStyle = '#2F4A2E'; ctx.fillRect(-300, -300, W + 600, H + 600); for (let i = 0; i < 40; i++) P(circ(rnd(i) * W, rnd(i + 50) * H, 20 + rnd(i + 9) * 30), '#3A5A38', null); } },
    { z: 0.4, draw: () => { withT(CX, cy, kr, spin * 0.05, () => {
      const R = [430, 300, 170]; // outer, middle, inner circle roads + white colonnade blocks between
      R.forEach((r, i) => { ctx.strokeStyle = '#3A3A44'; ctx.lineWidth = 70; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.stroke(); ctx.strokeStyle = '#E8D9A8'; ctx.lineWidth = 3; ctx.setLineDash([18, 16]); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.stroke(); ctx.setLineDash([]); });
      for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + 0.26; ctx.save(); ctx.rotate(a); P(rr(205, -42, 60, 84, 8), '#F2EEE4', C.ink, 3); P(rr(335, -50, 60, 100, 8), '#F2EEE4', C.ink, 3); ctx.restore(); }
      P(circ(0, 0, 120), '#4E7A3E', C.ink, 4); glow(0, 0, 120, '#9DFFB0', 0.2);
      const cols = ['#E2483D', '#2E6BD8', '#F4D06F', '#2BAA4A', '#B23AEE', '#E8E8E8'];
      R.forEach((r, i) => { for (let j = 0; j < 4; j++) { const a = -t * (0.7 + i * 0.25) * (i % 2 ? -1 : 1) + j * 1.571 + i; ctx.save(); ctx.rotate(a); ctx.translate(r, 0); ctx.rotate(i % 2 ? Math.PI : 0); P(rr(-16, -30, 32, 60, 8), cols[(i * 4 + j) % 6], C.ink, 3); P(rr(-11, -14, 22, 18, 4), '#BDE0FE', null); ctx.restore(); } });
      const ah = -t * 0.7 + 0.4; ctx.save(); ctx.rotate(ah); ctx.translate(430, 0); glow(0, 0, 60, '#FF3B3B', 0.5); P(rr(-20, -36, 40, 72, 10), '#FF3B3B', C.ink, 4); ctx.restore(); }); } },
    { z: 0.9, draw: () => { alpha(0.25, () => { ctx.strokeStyle = C.white; ctx.lineWidth = 6; ctx.beginPath(); for (let a = 0; a < 18; a += 0.2) { const r = a * 9; ctx.lineTo(820 + Math.cos(a + t * 3) * r, 1080 + Math.sin(a + t * 3) * r); } ctx.stroke(); }); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.06, ease(t / d)));
  if (t < 1.4) alpha(1 - seg(t, 1.0, 1.4), () => { glow(CX, 650, 500, GOLD, 0.4); txtStroke('TWIST!', CX, 650, 200, GOLD, C.ink, 18); });
  chipV('BOSS LEVEL: GOL CHAKKAR', CX, 390, back(seg(u, D * 0.08, D * 0.08 + 0.4)), C.red, 48, C.white);
  chipV('INNER · MIDDLE · OUTER CIRCLE', CX, 1150, back(seg(u, D * 0.4, D * 0.4 + 0.4)), GOLD, 40, C.ink);
  const kw = back(seg(u, D * 0.68, D * 0.68 + 0.35)); if (kw > 0) withT(CX, 500, kw * 0.9, 0, () => wantedMeter(0, 0, Math.min(5, Math.floor(seg(u, D * 0.68, D * 0.9) * 5) + 1), t));
  vignette();
};

// ---------- n05 smog mode: winter smog + fog lower visibility, headlights on ----------
DRAWV.smog = (t, d) => {
  const D = LINES.n05.dur, kf = easeOut(seg(t, 0.1, D * 0.5)), kh = seg(t, D * 0.6, D * 0.7), vis = lerp(100, 20, kf);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#6E6A62', '#B8B0A0'); P(circ(760, 420, 70), 'rgba(255,240,210,0.5)', null); alpha(0.6, () => skyline(820, '#7E7A72', 33, 260, '#C8C0B0', 60)); } },
    { z: 0.4, draw: () => { ctx.fillStyle = '#4A4A50'; ctx.beginPath(); ctx.moveTo(440, 760); ctx.lineTo(640, 760); ctx.lineTo(1300, 1400); ctx.lineTo(-220, 1400); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 8; i++) { const p = ((i / 8 + t * 0.25) % 1), y = lerp(780, 1300, p * p); P(rr(CX - 4 - 20 * p, y, 8 + 40 * p, 10 + 50 * p, 4), '#E8E2C8', null); }
      SP.streetLamp(170, 1080, 0.9, true, 0.6); SP.streetLamp(880, 900, 0.6, true, 0.6);
      withT(560, 1130, 1, 0, () => { if (kh > 0) alpha(kh, () => { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(255,240,180,0.35)'; ctx.beginPath(); ctx.moveTo(-150, -60); ctx.lineTo(-420, -420); ctx.lineTo(-40, -420); ctx.lineTo(-60, -60); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(150, -60); ctx.lineTo(420, -420); ctx.lineTo(40, -420); ctx.lineTo(60, -60); ctx.closePath(); ctx.fill(); ctx.restore(); });
        P(rr(-200, -150, 400, 130, 30), '#E2483D', C.ink, 5); P(rr(-150, -230, 300, 90, 24), '#C23A30', C.ink, 4); P(rr(-125, -215, 250, 60, 12), '#3A4458', null); P(rr(-190, -100, 70, 36, 10), '#FF5A4A', C.ink, 3); P(rr(120, -100, 70, 36, 10), '#FF5A4A', C.ink, 3); if (kh > 0) { glow(-155, -82, 70, '#FF5A4A', 0.4 * kh); glow(155, -82, 70, '#FF5A4A', 0.4 * kh); } P(rr(-210, -30, 70, 40, 10), '#222', null); P(rr(140, -30, 70, 40, 10), '#222', null); }); } },
    { z: 0.7, draw: () => { SP.smoke(t, CX, 1000, 1200, 500, 26, 5, '190,186,178', 0.25 + 0.3 * kf); alpha(0.55 * kf, () => { ctx.fillStyle = grad(300, 1250, 'rgba(200,196,188,0.85)', 'rgba(200,196,188,0.2)'); ctx.fillRect(-300, 300, W + 600, 950); }); } },
    { z: 0.95, draw: () => { floorV(1240, 'rgba(60,60,64,0.8)', '#1E1E22'); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.04, ease(t / d)));
  chipV('SMOG MODE: ON', CX, 400, back(seg(t, 0.2, 0.6)), '#B8B0A0', 50, C.ink);
  const kv = back(seg(t, D * 0.25, D * 0.25 + 0.4)); if (kv > 0) withT(CX, 520, kv, 0, () => { P(rr(-280, -44, 560, 88, 22), 'rgba(10,14,24,0.9)', C.white, 4); txt('VISIBILITY', -120, 2, 36, C.white); P(rr(20, -14, 220, 28, 14), '#333', null); P(rr(20, -14, 220 * vis / 100, 28, 14), vis < 40 ? '#FF3B3B' : '#2BFF88', null); });
  chipV('HEADLIGHTS: ON', CX, 640, back(seg(t, D * 0.65, D * 0.65 + 0.35)), GOLD, 42, C.ink);
  vignette();
};

// ---------- n06 last scene: a lit war-memorial arch at night (calm "photo mode", no action) ----------
function memorialArch(x, y, s, lit) { withT(x, y, s, 0, () => {
  glow(0, -330, 520 * lit + 60, '#FFD08A', 0.45 * lit);
  const stone = lit > 0.5 ? '#E8C890' : '#8E8070', st2 = lit > 0.5 ? '#C8A470' : '#6E6458';
  P(rr(-260, -60, 520, 60, 4), st2, C.ink, 4); P(rr(-230, -560, 140, 500, 4), stone, C.ink, 4); P(rr(90, -560, 140, 500, 4), stone, C.ink, 4);
  P(rr(-92, -560, 184, 500, 0), stone, null);
  ctx.beginPath(); ctx.moveTo(-78, -60); ctx.lineTo(-78, -340); ctx.arc(0, -340, 78, Math.PI, 0); ctx.lineTo(78, -60); ctx.closePath(); ctx.fillStyle = '#141C38'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
  P(rr(-230, -560, 460, 500, 4), null, C.ink, 4);
  P(rr(-250, -600, 500, 44, 4), st2, C.ink, 4); P(rr(-200, -660, 400, 60, 4), stone, C.ink, 4); P(rr(-150, -700, 300, 40, 4), st2, C.ink, 4); P(ell(0, -712, 90, 18), stone, C.ink, 3);
  for (let i = 0; i < 4; i++) { line(-220 + i * 40, -520, -220 + i * 40, -100, st2, 4); line(100 + i * 40, -520, 100 + i * 40, -100, st2, 4); } }); }
DRAWV.gate = (t, d) => {
  const D = LINES.n06.dur, lit = seg(t, 0.2, 1.4);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#050A1E', '#1A2450'); stars(70); moonV(820, 330, 40); } },
    { z: 0.35, draw: () => { alpha(0.8, () => skyline(1000, '#0E1530', 37, 140, GOLD, 50)); memorialArch(CX, 1000, 0.95, lit); } },
    { z: 0.7, draw: () => { ctx.fillStyle = '#1C3A24'; ctx.fillRect(-300, 1000, W + 600, 300); P(rr(-300, 1060, W + 600, 70, 0), '#3A3A44', null); for (let i = 0; i < 10; i++) P(rr(i * 130 - 60, 1090, 60, 8, 4), '#E8D9A8', null);
      for (let i = 0; i < 9; i++) peopleIcon(80 + i * 110 + (i % 2) * 20, 1010 + (i % 3) * 8, 40, ['#3A6EA5', '#7A3B5A', '#2E8B7A', '#B4652A'][i % 4]);
      SP.streetLamp(60, 1240, 0.9, true, 0.5); SP.streetLamp(1000, 1240, 0.9, true, 0.5); } },
    { z: 0.95, draw: () => { floorV(1240, '#101828', '#060A12'); } }],
    drift(t, d, 8), 0, lerp(1.0, 1.08, ease(t / d)));
  chipV('AAKHRI SCENE · PHOTO MODE', CX, 380, back(seg(t, 0.15, 0.5)), C.white, 42, C.ink);
  chipV('INDIA GATE · YUDH SMARAK', CX, 1160, back(seg(t, D * 0.35, D * 0.35 + 0.4)), GOLD, 44, C.ink);
  chipV('MISSION POORA ✓', 700, 500, back(seg(t, D * 0.85, D * 0.85 + 0.35)), '#2BFF88', 40, C.ink);
  vignette();
};
function moonV(x, y, r) { glow(x, y, r * 4, '#DDE8FF', 0.35); P(circ(x, y, r), '#F2F0E6', null); alpha(0.25, () => P(circ(x - r * 0.3, y - r * 0.2, r * 0.25), '#C8C4B4', null)); }

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1C2440'); bokeh(t, 14, GOLD, 61); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 46px Oswald'; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -50, w, 100, 30), col, C.ink, 5); P(poly([-20, 48, 10, 48, -30, 85]), col, C.ink, 5); txt(s, 0, 3, 46, C.ink); }); };
      bub('CHANDNI CHOWK!', 390, 520, 0.3, GOLD); bub('CP KA CHAKKAR!', 450, 670, 0.6, '#9DC4FF'); bub('METRO RIDE!', 330, 820, 0.9, '#FF9DC4'); bub('PEHLE PARATHE!', 430, 970, 1.2, '#9DFFB0');
      floorV(1240, '#1B2236', '#0B1020'); shadow(800, 1240, 110); person(800, 1240, 'mahila', { t, s: 1.05, look: -0.3, mood: 0.6, arms: [[0.3, 0.2], [-2.1, -0.4]] }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('COMMENT KARO', CX, 380, back(seg(t, 0.1, 0.45)), GOLD, 46, C.ink);
  vignette();
};
