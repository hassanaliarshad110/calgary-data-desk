// ===== Awazzzz GTA blitz #21 — "Agar Ramayan ka setu ek racing level hota?" (FAN THEORY / KALPANA) — native 9:16 scenes (DRAWV).
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters. No deity or epic character drawn; vanar team = abstract paw tokens.
// No outline map of any country: two generic island blobs + place pins. REAL DUNIYA card has no vehicle. Safe zone: key content x 40..940, y 340..1200; captions y 1250..1450.
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


// ---------- own generic drawings (#21) ----------
const NEON = '#29E7FF', NMAG = '#FF3FA4', STONE = '#8C93A8', STONE2 = '#6C7388', DAWN1 = '#2B1F4E', DAWN2 = '#FF9A6B';
function dawnSky() { sky(DAWN1, DAWN2); glow(CX, 820, 560, '#FFC48A', 0.55); P(circ(CX, 860, 110), '#FFE2A8', null); }
// glowing stone block (generic)
function stoneBlk(x, y, w, h, k = 1, gl = 0.5) { if (k <= 0) return; withT(x, y, k, 0, () => { glow(0, 0, w * 0.9, NEON, gl * 0.5); P(rr(-w / 2, -h / 2, w, h, 12), STONE, C.ink, 4); P(rr(-w / 2, -h / 2, w, h * 0.32, [12, 12, 0, 0]), '#A9AFC2', null); P(rr(-w / 2, -h / 2, w, h, 12), null, C.ink, 4);
  line(-w * 0.2, -h * 0.05, w * 0.05, h * 0.25, STONE2, 3); }); }
// abstract glowing paw-print token (dignified, orderly — no character)
function pawTok(x, y, s = 1, a = 1, col = GOLD) { alpha(a, () => withT(x, y, s, 0, () => { glow(0, 0, 70, col, 0.35); P(circ(0, 0, 46), 'rgba(10,14,24,0.85)', col, 4);
  P(ell(0, 10, 18, 14), col, null); [[-18, -12], [-6, -22], [6, -22], [18, -12]].forEach(([px, py]) => P(ell(px, py, 6, 8), col, null)); })); }
function ell(x, y, rx, ry) { const p = new Path2D(); p.ellipse(x, y, rx, ry, 0, 0, 6.2832); return p; }
// neon game track over the sea (imagined), drawn as a perspective strip from bottom to horizon
function neonTrack(t, prog = 1, yTop = 900, yBot = 2000, wTop = 60, wBot = 900) {
  const y1 = lerp(yBot, yTop, prog);
  const pt = (y) => { const u = (yBot - y) / (yBot - yTop); return [CX + Math.sin(u * 3.2) * 120 * u, lerp(wBot, wTop, u)]; };
  ctx.beginPath(); for (let y = yBot; y >= y1; y -= 20) { const [cx, w] = pt(y); ctx.lineTo(cx - w / 2, y); } for (let y = y1; y <= yBot; y += 20) { const [cx, w] = pt(y); ctx.lineTo(cx + w / 2, y); } ctx.closePath();
  ctx.fillStyle = 'rgba(20,24,48,0.92)'; ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'screen'; for (const side of [-1, 1]) { ctx.strokeStyle = side < 0 ? NEON : NMAG; ctx.lineWidth = 10; ctx.beginPath(); for (let y = yBot; y >= y1; y -= 20) { const [cx, w] = pt(y); ctx.lineTo(cx + side * w / 2, y); } ctx.stroke(); } ctx.restore();
  // centre dashes moving toward viewer
  for (let i = 0; i < 14; i++) { const u = ((i / 14 + t * 0.6) % 1); const y = lerp(yTop, yBot, u * u); if (y < y1) continue; const [cx, w] = pt(y); P(rr(cx - w * 0.02, y, w * 0.04, 10 + 40 * u, 4), 'rgba(255,255,255,0.8)', null); }
  return pt;
}
function boatTok(x, y, s = 1, t = 0) { withT(x, y + Math.sin(t * 3) * 6, s, Math.sin(t * 2) * 0.04, () => { P(poly([-140, -20, 140, -20, 100, 40, -100, 40]), '#E8EEF8', C.ink, 5); P(rr(-50, -80, 100, 60, 10), NEON, C.ink, 4); P(rr(-30, -68, 60, 26, 6), '#BDE0FE', null); }); }

// ---------- spoken opening hook: "Socho agar, Ramayan ka setu ek racing level hota!" ----------
DRAWV.hook1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { dawnSky(); } },
    { z: 0.35, draw: () => { waves(t, 900, '#2C4F7A', 6, 170, 0.5); waves(t, 1000, '#1F3C62', 8, 140, 0.7); } },
    { z: 0.7, draw: () => { neonTrack(t, easeOut(seg(t, 0, 1.2))); SP.car(CX, 1640, 1.25, '#e63946', t); SP.motionStreaks(CX - 160, 1600, -1, 200, 5, 0.7); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.07, ease(t / d)));
  chipV('LEVEL: SETU SPRINT', CX, 470, back(seg(t, 0.6, 1.0)), NEON, 50, C.ink);
  vignette();
};

// ---------- n02: game part is imagination; measurements from Valmiki Ramayan; "engineer" Nal, son of Vishwakarma ----------
DRAWV.intro = (t, d) => {
  const D = LINES.n02.dur, k1 = back(seg(t, 0.1, 0.5)), k2 = back(seg(t, D * 0.32, D * 0.32 + 0.45)), k3 = back(seg(t, D * 0.62, D * 0.62 + 0.45));
  depth([{ z: 0.05, haze: 1, draw: () => { dawnSky(); } },
    { z: 0.35, draw: () => { waves(t, 900, '#2C4F7A', 6, 170, 0.5); waves(t, 1000, '#1F3C62', 8, 140, 0.7); } },
    { z: 0.6, draw: () => { neonTrack(t, 0.35); SP.car(CX + 40, 1660, 1.1, '#e63946', t); alpha(0.35, () => { ctx.fillStyle = '#0B0B16'; ctx.fillRect(-300, -300, W + 600, H + 600); }); } },
    { z: 0.5, draw: () => {
      if (k2 > 0) withT(CX, 760, k2, 0, () => { // respectful manuscript / scroll card (no figures)
        glow(0, 0, 460, '#FFD08A', 0.35); P(rr(-380, -230, 760, 460, 18), '#F3E3BF', C.ink, 6); P(rr(-410, -250, 50, 500, 22), '#B98A4A', C.ink, 5); P(rr(360, -250, 50, 500, 22), '#B98A4A', C.ink, 5);
        for (let i = 0; i < 6; i++) P(rr(-300, -150 + i * 56, 600 - (i % 3) * 70, 12, 6), 'rgba(90,60,30,0.35)', null);
        });
    } },
    { z: 0.9, draw: () => {} }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  // stamp: game part only is imagination
  if (k1 > 0) alpha(1 - seg(t, D * 0.3, D * 0.36), () => withT(CX, 760, k1, -0.08, () => { P(rr(-400, -110, 800, 220, 20), 'rgba(178,58,238,0.15)', '#B23AEE', 10); txt('GAME = SIRF KALPANA', 0, 8, 76, '#E3B5FF'); }));
  chipV('VALMIKI RAMAYAN · YUDDHA KAAND 22', CX, 420, k2, '#F3E3BF', 40, C.ink);
  chipV('NAAP-JOKH YAHIN SE', CX, 1100, k2 * (1 - k3 * 0.0), GOLD, 42, C.ink);
  if (k3 > 0) withT(CX, 760, k3, 0, () => { P(rr(-420, -140, 840, 280, 26), 'rgba(10,14,24,0.94)', NEON, 6);
    // blueprint icon
    withT(-300, 0, 1, 0, () => { P(rr(-70, -80, 140, 160, 10), '#1F5F8B', C.white, 4); for (let i = 0; i < 4; i++) line(-50, -50 + i * 34, 50, -50 + i * 34, 'rgba(255,255,255,0.6)', 3); line(-40, 60, 40, -60, GOLD, 6); });
    txt('ENGINEER', 70, -50, 56, NEON); txt('NAL', 70, 20, 78, GOLD); txt('VISHWAKARMA KE BETE', 70, 92, 40, C.white); });
  vignette();
};

// ---------- n03 twist: not in one day — 5 days, 5 stages: 14 / 20 / 21 / 22 / 23 yojan ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n03.dur, u = t - 0.3, ns = [14, 20, 21, 22, 23];
  const lit = i => seg(u, D * (0.42 + i * 0.1), D * (0.42 + i * 0.1) + 0.3), prog = clamp(ns.reduce((s, n, i) => s + n * lit(i), 0) / 100);
  depth([{ z: 0.05, haze: 1, draw: () => { dawnSky(); } },
    { z: 0.35, draw: () => { waves(t, 900, '#2C4F7A', 6, 170, 0.5); waves(t, 1000, '#1F3C62', 8, 140, 0.7); } },
    { z: 0.7, draw: () => { neonTrack(t, 0.08 + 0.92 * prog); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.05, ease(t / d)));
  SP2.burst(t, 0, CX, 640, 1.0, 'TWIST!');
  chipV('1 DIN MEIN NAHI!', CX, 420, back(seg(u, D * 0.12, D * 0.12 + 0.4)), C.white, 50, C.ink);
  // 5-stage progress bar (studio GFX-001 bars idea, horizontal)
  const kb = back(seg(u, D * 0.33, D * 0.33 + 0.4));
  if (kb > 0) withT(CX, 1110, kb, 0, () => { P(rr(-450, -110, 900, 220, 24), 'rgba(10,14,24,0.92)', NEON, 5); let x = -420;
    ns.forEach((n, i) => { const w = 840 * n / 100, a = lit(i); P(rr(x + 4, -30, w - 8, 70, 12), a > 0 ? (i % 2 ? NMAG : NEON) : '#2A3550', C.ink, 3); if (a > 0) alpha(a, () => txt(String(n), x + w / 2, 8, 44, C.ink)); alpha(0.9, () => txt('DIN ' + (i + 1), x + w / 2, -66, 28, C.white, 'Oswald', 700)); x += w; });
    alpha(lit(4), () => txt('YOJAN', 0, 82, 34, GOLD)); });
  vignette();
};

// ---------- n04: total 100 yojan; countless vanar as one team bringing rocks and trees (abstract tokens, orderly) ----------
DRAWV.team = (t, d) => {
  const D = LINES.n04.dur, k = back(seg(t, 0.05, 0.4));
  depth([{ z: 0.05, haze: 1, draw: () => { dawnSky(); } },
    { z: 0.35, draw: () => { waves(t, 980, '#2C4F7A', 6, 170, 0.5); } },
    { z: 0.65, draw: () => { // rows of glowing stones being laid in order, paw tokens gliding in lines
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { const tt = 0.3 + (r * 6 + c) * 0.18; const kk = back(seg(t, tt, tt + 0.3)); stoneBlk(150 + c * 156, 1180 - r * 92 + r * 0, 140, 80, kk, 0.4); }
      for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const x = ((i * 190 + t * 120 * (r ? -1 : 1)) % 1140 + 1140) % 1140 - 30; pawTok(x, 1560 + r * 130, 0.85, 0.95, r ? NEON : GOLD); }
      // trees being carried (generic)
      for (let i = 0; i < 3; i++) { const x = 220 + i * 320, y = 820 + Math.sin(t * 2 + i) * 6; withT(x, y, 0.55 * back(seg(t, D * 0.55 + i * 0.15, D * 0.55 + i * 0.15 + 0.3)), 0, () => { P(rr(-12, -10, 24, 120, 6), '#7A5230', C.ink, 3); P(circ(0, -40, 70), '#3BA36A', C.ink, 4); P(circ(-40, 0, 50), '#2E8B57', C.ink, 4); P(circ(40, 0, 50), '#2E8B57', C.ink, 4); }); }
    } }],
    drift(t, d, 10), 0, lerp(1.0, 1.05, ease(t / d)));
  withT(CX, 520, k, 0, () => { glow(0, 0, 260, GOLD, 0.45); P(rr(-330, -100, 660, 200, 30), 'rgba(10,14,24,0.92)', GOLD, 6); txt('KUL 100 YOJAN', 0, 8, 84, GOLD); });
  chipV('ANGINAT VAANAR · EK TEAM', CX, 680, back(seg(t, D * 0.3, D * 0.3 + 0.4)), NEON, 44, C.ink);
  vignette();
};

// ---------- n05 REAL DUNIYA (kept visibly separate; no vehicle): Pamban (Rameswaram) → Mannar, ~48 km shallow shoals, Ram Setu / Adam's Bridge, 1-3 m ----------
DRAWV.real = (t, d) => {
  const D = LINES.n05.dur, ch = seg(t, D * 0.22, D * 0.55), kd = back(seg(t, D * 0.78, D * 0.78 + 0.45));
  const A = [210, 700], B = [870, 1060];
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#9CCFE8', '#E9F5FA'); } },
    { z: 0.3, draw: () => { ctx.fillStyle = '#3E86B8'; ctx.fillRect(-300, 560, W + 600, H); alpha(0.25, () => { for (let i = 0; i < 16; i++) P(rr(60 + rnd(i + 3) * 960 + Math.sin(t + i) * 14, 600 + i * 42, 80, 4, 2), C.white, null); }); } },
    { z: 0.55, draw: () => { // two generic island blobs (not an outline map of any country)
      P(ell(A[0] - 60, A[1] + 30, 220, 70), '#D9C79A', C.ink, 4); P(ell(A[0] - 70, A[1] + 22, 190, 50), '#7FA66A', null);
      P(ell(B[0] + 60, B[1] + 30, 230, 74), '#D9C79A', C.ink, 4); P(ell(B[0] + 70, B[1] + 22, 200, 52), '#7FA66A', null);
      // chain of shallow shoals (sand + rock), revealed along the line
      const n = 16; for (let i = 0; i < n; i++) { const u = (i + 0.5) / n; if (u > ch) break; const x = lerp(A[0] + 90, B[0] - 90, u), y = lerp(A[1] + 30, B[1] + 30, u) + Math.sin(i * 1.7) * 14;
        P(ell(x, y, 30 + rnd(i) * 14, 12), 'rgba(233,214,160,0.95)', 'rgba(90,70,40,0.6)', 2); P(ell(x - 6, y - 2, 12, 5), '#A89A86', null); }
      SP.route(t, D * 0.22, [[A[0] + 90, A[1] - 10], [B[0] - 90, B[1] - 10]], D * 0.33, C.ink, 5);
      SP.pin(t, 0.3, A[0], A[1], 'RAMESWARAM (PAMBAN)'); SP.pin(t, 0.8, B[0], B[1], 'MANNAR, SRI LANKA');
      alpha(seg(t, D * 0.45, D * 0.5), () => withT(lerp(A[0], B[0], 0.5) + 40, lerp(A[1], B[1], 0.5) - 70, 1, -0.5, () => { P(rr(-90, -32, 180, 64, 16), 'rgba(10,14,24,0.88)', null); txt('~48 KM', 0, 4, 44, GOLD); })); } },
    { z: 0.9, draw: () => {} }],
    drift(t, d, 8), 0, lerp(1.0, 1.03, ease(t / d)));
  // REAL DUNIYA badge (distinct from the KALPANA chip)
  withT(CX, 430, back(seg(t, 0.05, 0.4)), 0, () => { P(rr(-250, -48, 500, 96, 48), '#1D7A46', C.white, 5); txt('REAL DUNIYA', 0, 4, 56, C.white); });
  chipV('RAM SETU · ADAM\'S BRIDGE', CX, 540, back(seg(t, D * 0.5, D * 0.5 + 0.4)), C.white, 42, C.ink);
  chipV('UTHLI CHATTAANEIN + RETI', 380, 1180, back(seg(t, D * 0.35, D * 0.35 + 0.4)) * (1 - kd), '#E9D6A0', 36, C.ink);
  if (kd > 0) withT(300, 1150, kd, 0, () => { P(rr(-220, -90, 440, 180, 20), 'rgba(10,14,24,0.92)', CYAN, 5); // depth gauge
    P(rr(-180, -60, 40, 120, 8), '#3E86B8', C.white, 3); P(rr(-180, -60, 40, 40, [8, 8, 0, 0]), '#9CCFE8', null); txt('PAANI', 50, -30, 36, C.white); txt('1-3 M', 50, 30, 60, CYAN); });
  vignette();
};

// ---------- n06 rule: this race is won as a team ----------
DRAWV.rule = (t, d) => {
  const D = LINES.n06.dur, k = back(seg(t, 0.15, 0.55));
  depth([{ z: 0.05, haze: 1, draw: () => { dawnSky(); } },
    { z: 0.35, draw: () => { waves(t, 980, '#2C4F7A', 6, 170, 0.5); } },
    { z: 0.6, draw: () => { neonTrack(t, 1, 900, 2000, 60, 900);
      withT(CX, 1060, k, 0, () => { glow(0, -40, 260, GOLD, 0.5); P(poly([-90, -200, 90, -200, 60, -60, -60, -60]), GOLD, C.ink, 6); P(rr(-20, -60, 40, 70, 4), GOLD, C.ink, 5); P(rr(-90, 10, 180, 40, 8), '#C9A34A', C.ink, 5); txt('TEAM', 0, -140, 44, C.ink); SP2.sparkles(t, 0, -120, 170, 6, GOLD); });
      for (let i = 0; i < 6; i++) { const a = i / 6 * 6.2832 + t * 0.6; pawTok(CX + Math.cos(a) * 330, 1060 + Math.sin(a) * 110, 0.7, back(seg(t, 0.4 + i * 0.1, 0.7 + i * 0.1)), i % 2 ? NEON : GOLD); }
      SP.car(CX - 300, 1560, 0.8, '#e63946', t); boatTok(CX + 300, 1540, 0.7, t); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('RULE: AKELE NAHI, TEAM SE JEET', CX, 440, back(seg(t, 0.1, 0.45)), GOLD, 44, C.ink);
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1C2440'); bokeh(t, 14, GOLD, 61); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 50px Oswald'; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -50, w, 100, 30), col, C.ink, 5); P(poly([-20, 48, 10, 48, -30, 85]), col, C.ink, 5); txt(s, 0, 3, 50, C.ink); }); };
      bub('CAR?', 300, 560, 0.3, GOLD); bub('BIKE?', 620, 720, 0.6, NEON); bub('BOAT?', 360, 900, 0.9, '#F7A8C4');
      SP.car(780, 1150, 0.8, '#e63946', t); boatTok(260, 1150, 0.65, t); floorV(1240, '#1B2236', '#0B1020'); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('AAP KYA CHALAATE? COMMENT KARO', CX, 400, back(seg(t, 0.1, 0.45)), GOLD, 42, C.ink);
  vignette();
};
