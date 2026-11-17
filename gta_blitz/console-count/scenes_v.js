// ===== Awazzzz GTA blitz #10 — "Kitne Indians ke paas PS5/Xbox? Console reality check" (FACT: Niko Partners 511M gamers 2025, ~95% mobile;
// GTA 6 19 Nov 2026 PS5 + Xbox Series X|S only (Gematsu, PCWorld, TechRadar); IGR 2025 via Outlook Respawn/DemandSage: ~20M console gamers, 3.5% of 591M, 2024)
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters; "GTA 6"/"PS5"/"XBOX" set in Oswald (our font). No maps.
// Safe zone: key content x 40..940, y 250..1200; captions own y 1250..1450.

// ---------- standalone-Short overrides of the kit overlays + shared helpers (from blitz #8) ----------
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

// ---------- own generic drawings (from blitz #8) ----------
function consoleBox(x, y, s, t) { withT(x, y, s, 0, () => { shadow(0, 20, 260, 0.45);
  P(rr(-90, -420, 180, 440, 40), '#E8ECF2', C.ink, 6); P(rr(-30, -420, 60, 440, 10), '#1B1F2A', C.ink, 4);
  glow(0, -200, 120, CYAN, 0.25 + 0.15 * Math.sin(t * 4)); P(rr(-6, -380, 12, 60, 6), CYAN, null); }); }
function srcChip(s, k) { if (k <= 0) return; alpha(k, () => { ctx.font = '600 28px Oswald'; const w = ctx.measureText(s).width + 36; P(rr(60, 1182 - 22, w, 44, 22), 'rgba(10,14,24,0.75)', 'rgba(255,255,255,0.5)', 2); txt(s, 60 + w / 2, 1183, 28, '#C9D3E6', 'Oswald', 600); }); }
function calCard(x, y, s, top, big, k, col = RED) { if (k <= 0) return; withT(x, y, k * s, 0, () => { shadow(0, 140, 150, 0.35); P(rr(-130, -140, 260, 280, 22), C.white, C.ink, 5); P(rr(-130, -140, 260, 76, [22, 22, 0, 0]), col, C.ink, 5);
  txt(top, 0, -100, 40, C.white, 'Oswald', 700); txtStroke(big, 0, 40, 110, C.ink, C.white, 2); }); }
function donut(x, y, r, frac, k, col, rest) { ctx.save(); ctx.lineWidth = r * 0.42; ctx.lineCap = 'butt'; ctx.strokeStyle = rest; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.stroke();
  ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(x, y, r, -1.5708, -1.5708 + 6.2832 * frac * k); ctx.stroke(); ctx.restore(); P(circ(x, y, r * 0.78), 'rgba(10,14,24,0.95)', null); }
const GREEN = '#2BFF88', GREY = '#3A4560';
// ---------- own generic drawings (new) ----------
function bigPhone(x, y, s, t, inner) { withT(x, y, s, 0, () => { shadow(0, 250, 200, 0.4);
  P(rr(-150, -280, 300, 560, 44), '#1A1D26', C.ink, 7); ctx.save(); ctx.beginPath(); ctx.roundRect(-128, -252, 256, 500, 26); ctx.clip();
  ctx.fillStyle = grad(-252, 248, '#243B6B', '#4CC9F0'); ctx.fillRect(-128, -252, 256, 500);
  if (inner) inner(); else for (let i = 0; i < 5; i++) { P(rr(-100, -220 + i * 92 + ((t * 40) % 92), 200, 66, 14), 'rgba(255,255,255,0.28)', null); }
  ctx.restore(); P(rr(-40, -270, 80, 12, 6), '#333', null); }); }
function pcMonitor(x, y, s, t) { withT(x, y, s, 0, () => { shadow(0, 150, 220, 0.4); P(rr(-200, -150, 400, 250, 18), '#20242E', C.ink, 6);
  P(rr(-180, -132, 360, 214, 10), '#2E4A7A', null); for (let i = 0; i < 4; i++) P(rr(-150, -110 + i * 48, 200 + 60 * Math.sin(t * 2 + i), 22, 8), 'rgba(255,255,255,0.25)', null);
  P(rr(-30, 100, 60, 50, 6), '#20242E', C.ink, 4); P(rr(-110, 146, 220, 18, 9), '#20242E', C.ink, 4); }); }
function boxConsole(x, y, s, t, col, stripe) { withT(x, y, s, 0, () => { shadow(0, 20, 170, 0.45); // generic upright console tower
  P(rr(-70, -330, 140, 350, 26), col, C.ink, 6); P(rr(-16, -330, 32, 350, 8), stripe, C.ink, 3);
  glow(0, -160, 100, CYAN, 0.2 + 0.12 * Math.sin(t * 4)); P(rr(-40, -40, 80, 12, 6), 'rgba(0,0,0,0.35)', null); }); }
function crossMark(x, y, s, k) { if (k <= 0) return; withT(x, y, k * s, 0, () => { P(circ(0, 0, 70), RED, C.ink, 6); ctx.strokeStyle = C.white; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-30, -30); ctx.lineTo(30, 30); ctx.moveTo(30, -30); ctx.lineTo(-30, 30); ctx.stroke(); }); }
function tickMark(x, y, s, k) { if (k <= 0) return; withT(x, y, k * s, 0, () => { P(circ(0, 0, 60), GREEN, C.ink, 6); ctx.strokeStyle = C.ink; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-26, 2); ctx.lineTo(-6, 24); ctx.lineTo(30, -22); ctx.stroke(); }); }
function token(x, y, s, col, phone) { withT(x, y, s, 0, () => { P(circ(0, -34, 16), '#D9A77E', null); P(rr(-20, -18, 40, 46, 16), col, null); if (phone) P(rr(8, -10, 14, 22, 3), '#4CC9F0', C.ink, 2); }); }
function crowd(t, y0, rows, cols, k, s = 1, seed = 0) { // gamers crowd, almost all holding phones
  const cs = ['#7A3B5A', '#2E8B7A', '#3D5A99', '#9A6B2E', '#5B3D8A'];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c, kk = clamp(k * 1.6 - (i / (rows * cols)) * 0.6);
    if (kk <= 0) continue; const x = 70 + c * (940 / (cols - 1)) + (r % 2 ? 22 : 0), y = y0 + r * 62 * s + Math.sin(t * 3 + i) * 2;
    alpha(kk, () => token(x, y, 0.9 * s, cs[(i * 7 + seed) % 5], true)); } }
function dotGrid(cx, cy, cell, k, lit, t) { // 10 x 10 = 100 gamers; 'lit' (e.g. 3.5) glow gold
  for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), c = i % 10, x = cx + (c - 4.5) * cell, y = cy + (r - 4.5) * cell;
    const on = 99 - i < lit, half = (99 - i) === Math.floor(lit) && lit % 1 > 0;
    P(circ(x, y, cell * 0.36), '#2A3348', null);
    if (k > 0 && (on || half)) { glow(x, y, cell * 0.9, GOLD, 0.35 * k); if (half) { ctx.save(); ctx.beginPath(); ctx.rect(x - cell, y - cell, cell, cell * 2); ctx.clip(); P(circ(x, y, cell * 0.36 * k), GOLD, C.ink, 3); ctx.restore(); P(circ(x, y, cell * 0.36), null, GOLD, 3); } else P(circ(x, y, cell * 0.36 * k), GOLD, C.ink, 3); } } }

// ---------- spoken opening hook: "Bharat mein 50 crore se zyada gamers. Lekin GTA 6 kitne khel paayenge?" ----------
DRAWV.hook1 = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#0A1024', '#1E2A50'); bokeh(t, 14, CYAN, 5); SP.speedLines(t, CX, 700, 18, 0.12); } },
    { z: 0.35, draw: () => { crowd(t, 820, 6, 11, seg(t, 0.0, 1.2), 1, 3); } },
    { z: 0.6, draw: () => { const k = back(seg(t, 0.25, 0.6)); if (k > 0) withT(CX, 470, k, 0, () => { P(rr(-420, -150, 840, 300, 40), 'rgba(10,14,24,0.88)', GOLD, 6); txt('BHARAT KE GAMERS', 0, -80, 50, C.white, 'Oswald', 700); txtStroke('50 CRORE+', 0, 40, 150, GOLD, C.ink, 12); });
      const kg = back(seg(t, 2.6, 3.0)); if (kg > 0) withT(CX, 690, kg, -0.03, () => { P(rr(-330, -62, 660, 124, 30), RED, C.ink, 6); txt('GTA 6 KITNE KHELENGE?', 0, 4, 54, C.white); }); } },
    { z: 0.9, draw: () => { floorV(1225, '#141A28', '#0A0E18'); SP.question(t, 860, 1050, 2.9, 0.9); shadow(200, 1225, 90); person(200, 1225, 'mahila', { t, s: 0.95, look: 0.5, mood: 0.3 }); } },
  ], drift(t, d, 16), 0, lerp(1.0, 1.08, ease(t / d)));
  vignette();
};

// ---------- n01 Niko Partners: 511M (51 crore+) gamers in India in 2025 ----------
DRAWV.gamers = (t, d) => {
  const D = LINES.n01.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1226', '#24305A'); bokeh(t, 10, '#9DC4FF', 9); } },
    { z: 0.35, draw: () => { crowd(t, 780, 7, 11, seg(t, 0.2, 2.5), 1, 7); } },
    { z: 0.6, draw: () => { alpha(seg(t, 0.2, 0.5), () => P(rr(100, 290, 880, 330, 40), 'rgba(10,14,24,0.9)', CYAN, 6));
      txt('2025 · BHARAT', CX, 350, 46, C.white, 'Oswald', 700);
      if (t > 0.4) SP.counter(t, 0.4, { x: CX, y: 490, from: 0, to: 51, dur: D * 0.55, suffix: ' CRORE+', size: 140, col: GOLD, label: 'GAMERS' }); } },
    { z: 0.9, draw: () => { floorV(1230, '#141A30', '#080A18'); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.06, ease(t / d)));
  chipV('NIKO PARTNERS KE MUTABIK', CX, 690, back(seg(t, 0.6, 0.95)), C.white, 38, C.ink);
  srcChip('SOURCE: Niko Partners (11 Aug 2026): 511 million players in 2025', seg(t, 0.5, 1));
  vignette();
};

// ---------- n02 ~95% of them play on phone ----------
DRAWV.mobile = (t, d) => {
  const D = LINES.n02.dur, k = easeOut(seg(t, 0.3, D * 0.8));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#06201A', '#0E4A3A'); bokeh(t, 12, GREEN, 13); } },
    { z: 0.5, draw: () => { donut(380, 640, 230, 0.95, k, GREEN, GREY);
      if (t > 0.3) SP.counter(t, 0.3, { x: 380, y: 625, from: 0, to: 95, dur: D * 0.6, suffix: '%', size: 120, col: GREEN });
      txt('LAGBHAG', 380, 545, 34, C.white, 'Oswald', 700);
      bigPhone(780, 650, 0.85 + 0.03 * Math.sin(t * 3), t); } },
    { z: 0.9, draw: () => { floorV(1180, '#0A2A20', '#04120C'); for (let i = 0; i < 5; i++) token(120 + i * 190, 1170, 1.6, ['#7A3B5A', '#2E8B7A', '#3D5A99', '#9A6B2E', '#5B3D8A'][i], true); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('PHONE PAR KHELTE HAIN', CX, 1000, back(seg(t, D * 0.45, D * 0.45 + 0.35)), GREEN, 52, C.ink);
  srcChip('SOURCE: Niko Partners (5 Nov 2025): ~95% play on mobile', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- n03 GTA 6, 19 Nov: only PS5 + Xbox Series X|S. Not phone, not PC ----------
DRAWV.platforms = (t, d) => {
  const D = LINES.n03.dur, kx = seg(t, D * 0.72, D * 0.72 + 0.35);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0A0F24', '#2A1F5A'); bokeh(t, 14, '#9D7BFF', 21); } },
    { z: 0.45, draw: () => { calCard(250, 430, 0.85, 'NOV', '19', back(seg(t, 0.15, 0.5)), RED);
      const kg = back(seg(t, 0.1, 0.45)); if (kg > 0) withT(680, 420, kg, 0, () => { glow(0, 0, 260, '#9D7BFF', 0.4); txtStroke('GTA 6', 0, 0, 130, C.white, C.ink, 11); });
      const kc = back(seg(t, D * 0.25, D * 0.25 + 0.4));
      if (kc > 0) { withT(0, 0, 1, 0, () => { boxConsole(220, 950, kc, t, '#E8ECF2', '#1B1F2A'); boxConsole(470, 950, kc, t, '#1E2228', '#2BAA4A'); });
        tickMark(220, 560 + 40, 0.8, back(seg(t, D * 0.4, D * 0.4 + 0.3))); tickMark(470, 600, 0.8, back(seg(t, D * 0.48, D * 0.48 + 0.3)));
        alpha(kc, () => { txt('PS5', 220, 1010, 46, C.white, 'Oswald', 700); txt('XBOX', 470, 1000, 40, C.white, 'Oswald', 700); txt('SERIES X|S', 470, 1042, 30, C.white, 'Oswald', 700); }); }
      const kn = back(seg(t, D * 0.62, D * 0.62 + 0.35)); if (kn > 0) { bigPhone(760, 760, 0.5 * kn, t); pcMonitor(770, 1030, 0.55 * kn, t); }
      crossMark(780, 700, 0.8, back(kx)); crossMark(800, 990, 0.8, back(seg(t, D * 0.8, D * 0.8 + 0.35))); } },
    { z: 0.9, draw: () => { floorV(1170, '#141A30', '#080A18'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('SIRF YEH DO', 345, 1130, back(seg(t, D * 0.45, D * 0.45 + 0.35)), GREEN, 40, C.ink);
  chipV('NA PHONE · NA PC', 760, 1130, back(seg(t, D * 0.78, D * 0.78 + 0.35)), RED, 40, C.white);
  srcChip('SOURCE: Gematsu (6 Nov 2025) · PCWorld (4 Feb 2026)', seg(t, 0.5, 1));
  vignette();
};

// ---------- n04 twist: IGR 2025 — console gamers ~2 crore, ~3.5% of that report's 59 crore (2024 data) ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n04.dur, u = t - 0.25, kl = seg(u, D * 0.5, D * 0.5 + 0.8);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#140A1E', '#3A1A3E'); bokeh(t, 10, GOLD, 4); SP.speedLines(t, CX, 700, 18, 0.12); } },
    { z: 0.5, draw: () => {
      const kr = back(seg(u, 1.0, 1.35)); if (kr > 0 && u < D * 0.3 + 0.2) withT(CX, 360, kr, 0, () => { P(rr(-400, -110, 800, 220, 30), 'rgba(10,14,24,0.92)', C.white, 5); txt('INDIA GAMING', 0, -40, 64, C.white, 'Oswald', 700); txt('REPORT 2025', 0, 40, 64, GOLD, 'Oswald', 700); });
      if (u > D * 0.3) { const kc = back(seg(u, D * 0.3, D * 0.3 + 0.35)); withT(CX, 360, kc, 0, () => { P(rr(-400, -110, 800, 220, 30), 'rgba(10,14,24,0.92)', GOLD, 5); txt('CONSOLE GAMERS', 0, -58, 44, C.white, 'Oswald', 700); });
        SP.counter(t, 0.25 + D * 0.3, { x: CX, y: 410, from: 0, to: 2, dur: 0.8, pre: '~', suffix: ' CRORE', size: 110, col: GOLD }); }
      chipV('SAB CONSOLES MILAAKAR', CX, 510, back(seg(u, D * 0.42, D * 0.42 + 0.35)), C.white, 34, C.ink);
      alpha(seg(u, 1.0, 1.6), () => dotGrid(CX, 770, 50, back(kl), 3.5, t)); if (u > 1.0 && u < D * 0.3) SP.question(t, CX, 770, 1.4, 1.4);
      const kp = back(seg(u, D * 0.55, D * 0.55 + 0.35)); if (kp > 0) withT(CX, 1100, kp, -0.03, () => { glow(0, 0, 360, GOLD, 0.35); P(rr(-400, -68, 800, 136, 24), 'rgba(10,14,24,0.92)', GOLD, 7); txt('59 CRORE MEIN SE ~3.5%', 0, 4, 60, GOLD); }); } },
    { z: 0.9, draw: () => { floorV(1240, '#1E1028', '#0E0814'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  if (t < 1.5) alpha(1 - seg(t, 1.1, 1.5), () => { glow(CX, 650, 500, GOLD, 0.4); txtStroke('TWIST!', CX, 650, 200, GOLD, C.ink, 18); });
  srcChip('IGR 2025 (WinZO-IEIC) via Outlook Respawn/DemandSage · 2024 data', seg(u, 0.3, 0.8));
  vignette();
};

// ---------- n05 payoff: the device most Indian gamers play on — the phone — doesn't get GTA 6 ----------
DRAWV.payoff = (t, d) => {
  const D = LINES.n05.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1E0A0E', '#4A1820'); bokeh(t, 12, '#FF6B6B', 31); } },
    { z: 0.5, draw: () => { bigPhone(CX, 700, 1.0, t, () => { ctx.fillStyle = 'rgba(10,14,24,0.55)'; ctx.fillRect(-128, -252, 256, 500); txtStroke('GTA 6', 0, -60, 70, C.white, C.ink, 7); txt('LAUNCH PAR', 0, 20, 34, C.white, 'Oswald', 700); });
      crossMark(CX + 120, 860, 1.2, back(seg(t, D * 0.6, D * 0.6 + 0.35)));
      chipV('ZYAADATAR GAMERS KA DEVICE', CX, 330, back(seg(t, 0.2, 0.55)), C.white, 44, C.ink); } },
    { z: 0.9, draw: () => { floorV(1190, '#2A0E14', '#120408'); shadow(860, 1190, 90); person(860, 1190, 'mahila', { t, s: 0.9, look: -0.4, mood: 0.1, arms: [[-0.6, -0.9], [0.6, 0.9]] }); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('PHONE PAR GTA 6 NAHI!', CX, 1110, back(seg(t, D * 0.62, D * 0.62 + 0.35)), RED, 56, C.white);
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1C2440'); bokeh(t, 14, GOLD, 61); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 64px Oswald'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -64, w, 128, 36), col, C.ink, 5); P(poly([-20, 62, 10, 62, -30, 100]), col, C.ink, 5); txt(s, 0, 3, 64, C.ink); }); };
      bub('PS5?', 300, 520, 1.6, '#9DC4FF'); bub('XBOX?', 600, 720, 2.3, GREEN); bub('PC KA INTEZAAR?', 450, 940, 3.0, GOLD);
      floorV(1240, '#1B2236', '#0B1020'); shadow(830, 1240, 110); person(830, 1240, 'mahila', { t, s: 1.05, look: -0.3, mood: 0.6, arms: [[0.3, 0.2], [-2.1, -0.4]] }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('AAP KIS PAR KHELOGE? COMMENT KARO', CX, 330, back(seg(t, 0.1, 0.45)), GOLD, 42, C.ink);
  vignette();
};
