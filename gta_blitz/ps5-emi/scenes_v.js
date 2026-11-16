// ===== Awazzzz GTA blitz #2 — "PS5 + GTA 6: EMI pe kitne mahine?" — native 9:16 scenes (DRAWV) for shorts.py.
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters. "GTA 6" is set in Oswald (our font).
// Safe zone: key content x 40..940, y 250..1200 (+1480..1600); captions own y 1250..1450.

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
const MALE = '#F4D06F', FEM = '#FF6FAE';
KINDS.purush = { body: '#3A6EA5', body2: '#2D5785', skin: '#C68E62', hair: 'short', h: 0.98 };
KINDS.mahila = { body: '#7A3B5A', body2: '#612E47', skin: '#D9A77E', hair: 'bob', h: 0.93 };
const L0 = id => (LINES[id] ? LINES[id].start - (GT - SCT) : 99);

// Studio library props (animation-studio engine/props.js, catalogue PRP-051 bill, PRP-052 coins, PRP-053 moneyStack,
// PRP-054 document, PRP-056 clipboard; fx.js VFX-019 question) ported 1:1 onto the kit canvas (₹ instead of $).
const SP = (() => {
  const OUT = '#2a1c14', TAU = 6.2832;
  const R = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  const O = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); };
  const F = (fill, stroke, lw = 0) => { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke && lw) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); } };
  const hx = h => { const n = parseInt(h.replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const shade = (h, k) => { const [r, g, b] = hx(h); const f = c => Math.round(clamp(k < 0 ? c * (1 + k) : c + (255 - c) * k, 0, 255)); return '#' + [f(r), f(g), f(b)].map(x => x.toString(16).padStart(2, '0')).join(''); };
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const T = (s, x, y, font, fill) => { ctx.font = font; ctx.fillStyle = fill; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); };
  const pr = (fn, x, y, s) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; fn(); ctx.restore(); };
  return {
    bill: (x, y, s = 1, ang = 0, col = '#52b788') => pr(() => { ctx.rotate(ang); R(-90, -45, 180, 90, 8); F(col, OUT, 4); R(-78, -33, 156, 66, 6); ctx.strokeStyle = shade(col, -0.3); ctx.lineWidth = 3; ctx.stroke(); O(0, 0, 22); F(shade(col, 0.25), OUT, 2); T('₹', 0, 2, '700 30px Inter', shade(col, -0.4)); }, x, y, s),
    coins: (x, y, s = 1, n = 5) => pr(() => { for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.ellipse(0, -12 - i * 14, 46, 14, 0, 0, TAU); F(i % 2 ? '#f2c230' : '#e0a800', OUT, 3); } }, x, y, s),
    moneyStack: (x, y, s = 1) => pr(() => { for (let i = 0; i < 6; i++) { R(-110, -30 - i * 22, 220, 26, 4); F(i % 2 ? '#52b788' : '#40916c', OUT, 3); } R(-20, -160, 40, 140, 2); F('#e9c46a', OUT, 2); }, x, y, s),
    clipboard: (x, y, s = 1) => pr(() => { R(-90, -240, 180, 240, 10); F('#a0522d', OUT, 4); R(-75, -215, 150, 200, 4); F('#fff'); R(-40, -255, 80, 34, 8); F('#adb5bd', OUT, 3); for (let i = 0; i < 5; i++) { ctx.strokeStyle = '#2a9d8f'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-60, -180 + i * 34); ctx.lineTo(-50, -170 + i * 34); ctx.lineTo(-35, -192 + i * 34); ctx.stroke(); ctx.fillStyle = '#adb5bd'; ctx.fillRect(-25, -184 + i * 34, 85, 7); } }, x, y, s),
    question: (t, x, y, t0 = 0, s = 1) => { const k = back(seg(t, t0, t0 + 0.3)); if (k <= 0) return; withT(x, y + Math.sin(t * 4) * 6, k * s, 0, () => txtStroke('?', 0, 0, 120, '#ffd166', '#2a1c14', 8)); },
    document: (x, y, s = 1, ang = 0, title = 'REPORT') => pr(() => { ctx.rotate(ang); R(-85, -230, 170, 230, 6); F('#fff', OUT, 4); T(title, 0, -195, '700 22px Oswald', '#1d3557'); ctx.fillStyle = '#adb5bd'; for (let i = 0; i < 7; i++) ctx.fillRect(-65, -165 + i * 20, 130 * (0.6 + hash(i) * 0.4), 7); }, x, y, s),
  };
})();
function rainBills(t, n, seed = 1, a = 0.8) { alpha(a, () => { for (let i = 0; i < n; i++) { const x = rnd(i + seed) * W, y = ((rnd(i * 7 + seed) * H * 1.2) + t * (120 + rnd(i) * 80)) % (H * 1.2) - 150; SP.bill(x, y, 0.55 + rnd(i + 3) * 0.3, wob(t, 0.3 + rnd(i) * 0.3, 0.6, i)); } }); }
function calGrid(x0, y0, cell, nM, nF, kM, kF) { // 30-day month grid, 6 x 5; amber = male days, pink outline = female days
  for (let i = 0; i < 30; i++) { const c = i % 6, r = Math.floor(i / 6), x = x0 + c * cell, y = y0 + r * cell;
    P(rr(x + 6, y + 6, cell - 12, cell - 12, 12), '#1E2840', C.ink, 4);
    const fm = clamp(nM * kM - i), ff = clamp(nF * kF - i);
    if (ff > 0) P(rr(x + 6, y + 6, (cell - 12) * ff, cell - 12, 12), FEM, null);
    if (fm > 0) P(rr(x + 6, y + 6, (cell - 12) * fm, cell - 12, 12), MALE, null);
    txt(String(i + 1), x + cell / 2, y + cell / 2 + 2, 40, (fm > 0.5 || ff > 0.5) ? C.ink : C.grey, 'Oswald', 600);
  }
}

// generic games console (our own drawing: a plain tower + stand, no brand shapes) and a generic game box with "GTA 6" in Oswald
function consoleBox(x, y, s, t = 0) { withT(x, y, s, wob(t, 0.4, 0.015), () => { shadow(0, 250, 230, 0.4);
  P(rr(-120, -250, 240, 500, 40), '#F2F2F2', C.ink, 6); P(rr(-26, -230, 52, 460, 18), '#1A1E26', C.ink, 4);
  P(rr(-150, 230, 300, 30, 12), '#2A2F3A', C.ink, 4); glow(0, -120, 60, '#7FB4FF', 0.35); P(rr(-8, -150, 16, 60, 8), '#7FB4FF', null); }); }
function gameBox(x, y, s, rot = 0) { withT(x, y, s, rot, () => { shadow(0, 190, 150, 0.35);
  P(rr(-130, -180, 260, 360, 12), '#1B2138', C.ink, 6); P(rr(-130, -180, 260, 60, [12, 12, 0, 0]), '#2E6BD8', C.ink, 6);
  ctx.fillStyle = grad(-120, 170, '#FF5FA2', '#F4A23A'); ctx.fillRect(-114, -110, 228, 270);
  txtStroke('GTA 6', 0, 20, 84, C.white, C.ink, 10); txt('STANDARD', 0, 110, 30, C.ink, 'Oswald', 700); }); }
function monthCells(x0, y0, cols, rows, cw, ch, n, k, col, label) { // n cells, k = fill progress 0..1
  for (let i = 0; i < n; i++) { const c = i % cols, r = Math.floor(i / cols), x = x0 + c * cw, y = y0 + r * ch;
    const f = clamp(n * k - i); P(rr(x + 5, y + 5, cw - 10, ch - 10, 10), '#1E2840', C.ink, 3);
    if (f > 0) { withT(x + cw / 2, y + ch / 2, 0.6 + 0.4 * back(f), 0, () => P(rr(-cw / 2 + 5, -ch / 2 + 5, cw - 10, ch - 10, 10), col, null)); }
    txt(String(i + 1), x + cw / 2, y + ch / 2 + 2, Math.min(40, ch * 0.42), f > 0.5 ? C.ink : C.grey, 'Oswald', 600); }
  if (label) txt(label, x0, y0 - 34, 44, col, 'Oswald', 700, 'left'); }
const EMI = '#7FDBA0';

// ---------- spoken opening hook: "PS5 aur GTA 6 EMI par liya, to kitne mahine bharoge?" ----------
DRAWV.hook1 = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1C2440'); bokeh(t, 14, '#3A7BD5', 5); } },
    { z: 0.35, draw: () => { calCard(780, 520, 1.0, 'EMI', String(1 + Math.floor(t * 7) % 24), 'MAHINA…', C.red, 0.06 + wob(t, 0.7, 0.02)); } },
    { z: 0.75, draw: () => { lightPool(CX, 1100, 520, C.amber, 0.28); consoleBox(330, 880, 1.05, t); gameBox(650, 1000, 0.95, -0.08 + wob(t, 0.5, 0.03));
      SP.coins(880, 1210, 0.8, 1 + Math.floor(seg(t, 0.3, d) * 6)); SP.question(t, 560, 560, 0.6, 1.3); } },
  ], drift(t, d, 18), 0, lerp(1.0, 1.08, ease(t / d)));
  if (t > d * 0.5) chipV('KITNE MAHINE?', CX, 1180, back(seg(t, d * 0.5, d * 0.5 + 0.35)), C.amber, 64, C.ink);
  vignette();
};

// ---------- n01 the two prices ----------
DRAWV.bill = (t, d) => {
  const D = LINES.n01.dur, t2 = D * 0.58;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#160E22', '#2E1A40'); bokeh(t, 16, '#FF5FA2', 23); } },
    { z: 0.45, draw: () => { lightPool(300, 900, 380, '#7FB4FF', 0.25); consoleBox(290, 880, 1.15, t);
      if (t > t2) gameBox(760, 960, back(seg(t, t2, t2 + 0.4)) * 1.0, 0.07); } },
    { z: 0.8, draw: () => {
      const k1 = back(seg(t, 0.4, 0.8)); if (k1 > 0) withT(CX, 480, k1, 0, () => priceTag(0, 0, 1.05, 'PS5 SLIM DIGITAL', '₹64,990', C.amber, -0.05));
      const k2 = back(seg(t, t2 + 0.2, t2 + 0.6)); if (k2 > 0) withT(CX + 40, 690, k2, 0, () => priceTag(0, 0, 0.95, 'GTA 6 STANDARD', '+ ₹5,999', EMI, 0.05)); } }],
    drift(t, d, 20), 0, lerp(1.0, 1.06, ease(t / d)));
  tag(t < t2 ? 'AMAZON.IN, 3 NOV 2026 · GAMINGNATION' : 'ESQUIRE INDIA · SUNDAY GUARDIAN', 40, 290, 26, C.amber);
  vignette();
};

// ---------- n02 total ----------
DRAWV.total = (t, d) => {
  const D = LINES.n02.dur;
  fillAll('#0E1424'); glow(CX, 760, 800, C.amber, 0.14); rainBills(t, 12, 7, 0.4);
  withT(CX, 760, 1.0, -0.02, () => { shadow(0, 420, 380, 0.4); P(rr(-420, -380, 840, 760, 14), '#F2EEE3', C.ink, 6); paperTex(-420, -380, 840, 760, 4);
    for (let i = 0; i < 20; i++) P(poly([-420 + i * 42, 380, -399 + i * 42, 360, -378 + i * 42, 380]), '#0E1424', null);
    txt('KHELNE KA BILL', 0, -310, 62, C.ink); line(-360, -260, 360, -260, C.ink, 3);
    txt('PS5 SLIM DIGITAL', -360, -180, 42, C.ink, 'Oswald', 600, 'left'); txt('₹64,990', 360, -180, 50, C.ink, 'Oswald', 700, 'right');
    txt('GTA 6 STANDARD', -360, -90, 42, C.ink, 'Oswald', 600, 'left'); txt('₹5,999', 360, -90, 50, C.ink, 'Oswald', 700, 'right');
    line(-360, 10, 360, 10, C.ink, 4); txt('TOTAL', -360, 100, 60, C.ink, 'Oswald', 700, 'left');
    withT(360, 100, 1 + 0.08 * Math.max(0, 1 - Math.abs(t - D * 0.55) * 3), 0, () => txt('₹' + fmt(cnt(t, 0.0, D * 0.45, 70989)), 0, 0, 96, C.red, 'Oswald', 700, 'right'));
    if (t > D * 0.5) SP.moneyStack(250, 330, 0.8 * back(seg(t, D * 0.5, D * 0.5 + 0.4))); });
  tag('₹64,990 + ₹5,999', 40, 290, 30, C.amber);
  vignette();
};

// ---------- n03 12 months ----------
DRAWV.emi12 = (t, d) => {
  const D = LINES.n03.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#172036'); bokeh(t, 10, EMI, 31); } },
    { z: 0.6, draw: () => { monthCells(100, 470, 4, 3, 220, 150, 12, easeOut(seg(t, 0.4, D * 0.7)), EMI, '12 MAHINE');
      SP.coins(170, 1180, 0.8, 4); SP.bill(820, 1150, 0.9, wob(t, 0.4, 0.15)); } }], drift(t, d, 14), 0, lerp(1.0, 1.03, ease(t / d)));
  const k = back(seg(t, D * 0.45, D * 0.45 + 0.4)); if (k > 0) withT(CX, 1020, k, -0.02, () => { P(rr(-330, -62, 660, 124, 62), EMI, C.ink, 5); txt('≈ ₹5,916 / MAHINA', 0, 4, 64, C.ink); });
  tag('₹70,989 ÷ 12 · SEEDHA BHAAG', 40, 290, 30, C.amber);
  vignette();
};

// ---------- n04 24 months ----------
DRAWV.emi24 = (t, d) => {
  const D = LINES.n04.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0D1A1C', '#14303A'); bokeh(t, 10, C.amber, 37); } },
    { z: 0.6, draw: () => { monthCells(100, 430, 6, 4, 147, 120, 24, easeOut(seg(t, 0.2, D * 0.75)), C.amber, '24 MAHINE');
      SP.coins(880, 1200, 0.7, 3); } }], drift(t, d, 14), 0, lerp(1.0, 1.03, ease(t / d)));
  const k = back(seg(t, D * 0.4, D * 0.4 + 0.4)); if (k > 0) withT(CX, 1020, k, 0.02, () => { P(rr(-330, -62, 660, 124, 62), C.amber, C.ink, 5); txt('≈ ₹2,958 / MAHINA', 0, 4, 64, C.ink); });
  tag('₹70,989 ÷ 24 · SEEDHA BHAAG', 40, 290, 30, C.amber);
  vignette();
};

// ---------- n05 twist: game in Nov 2026, last instalment ~Nov 2028 ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n05.dur, u = t - 0.45, k = easeOut(seg(u, D * 0.45, D * 0.85));
  depth([{ z: 0.05, haze: 1, draw: () => sky('#0A0D18', '#1A1430') },
    { z: 0.55, draw: () => { lightPool(CX, 800, 480, '#7FB4FF', 0.22);
      const x0 = 150, x1 = 880, y = 720; line(x0, y, x1, y, '#2A3245', 16); line(x0, y, lerp(x0, x1, k), y, C.amber, 16);
      for (let i = 0; i <= 24; i++) { const x = lerp(x0, x1, i / 24); P(ell(x, y, i % 12 ? 6 : 12, i % 12 ? 6 : 12), i / 24 <= k ? C.amber : '#3A4458', null); }
      txt('2026', x0, y + 70, 40, C.white, 'Oswald', 700); txt('2027', (x0 + x1) / 2, y + 70, 40, C.grey, 'Oswald', 600); txt('2028', x1, y + 70, 40, C.white, 'Oswald', 700);
      const kg = back(seg(u, D * 0.2, D * 0.2 + 0.4)); if (kg > 0) { gameBox(x0 + 60, 480, 0.75 * kg, -0.06); chipV('GAME: 19 NOV 2026', 330, 880, kg, EMI, 36, C.ink); }
      const kl = back(seg(u, D * 0.72, D * 0.72 + 0.4)); if (kl > 0) { withT(x1 - 80, 480, kl, 0.05, () => { SP.document(0, 120, 0.85, 0, 'KIST #24'); }); chipV('AAKHRI KIST ≈ NOV 2028', 660, 990, kl, C.red, 38, C.white); }
      shadow(170, 1240, 80); person(170, 1240, 'purush', { t, s: 0.85, look: 0.4, mood: lerp(0.3, -0.4, k) }); } }], drift(t, d, 16), 0, lerp(1.0, 1.05, ease(t / d)));
  if (t < 1.4) alpha(1 - seg(t, 1.0, 1.4), () => { glow(CX, 600, 500, C.amber, 0.4); txtStroke('TWIST!', CX, 600, 200, C.amber, C.ink, 18); });
  tag('24 KISTEIN · LAUNCH 19 NOV 2026 (ESQUIRE INDIA)', 40, 290, 26, C.amber);
  vignette();
};

// ---------- n06 payoff: simple division != real EMI ----------
DRAWV.fine = (t, d) => {
  const D = LINES.n06.dur, t2 = D * 0.3;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#140B10', '#2A1420'); bokeh(t, 12, '#FF5FA2', 41); } },
    { z: 0.4, draw: () => { SP.clipboard(260, 1060, 1.3); SP.document(780, 1100, 1.2, 0.06, 'EMI SHARTEIN'); } },
    { z: 0.8, draw: () => {
      const k1 = back(seg(t, 0.3, 0.7)); if (k1 > 0) withT(CX, 470, k1, -0.03, () => { P(rr(-380, -70, 760, 140, 30), '#2A3245', C.ink, 5); txt('SEEDHA BHAAG ≠ ASLI EMI', 0, 4, 60, C.white); });
      const k2 = back(seg(t, t2 + 0.3, t2 + 0.7)); if (k2 > 0) withT(330, 660, k2, -0.05, () => { P(rr(-190, -55, 380, 110, 55), C.red, C.ink, 5); txt('+ BYAAJ?', 0, 4, 56, C.white); });
      const k3 = back(seg(t, t2 + 0.9, t2 + 1.3)); if (k3 > 0) withT(740, 700, k3, 0.05, () => { P(rr(-210, -55, 420, 110, 55), C.amber, C.ink, 5); txt('+ CHARGES?', 0, 4, 56, C.ink); });
      const k4 = back(seg(t, D * 0.72, D * 0.72 + 0.4)); if (k4 > 0) chipV('PEHLE POORA HISAAB PADHO', CX, 860, k4, EMI, 46, C.ink);
      SP.question(t, 560, 1000, D * 0.5, 0.9); } }], drift(t, d, 12), 0, lerp(1.0, 1.04, ease(t / d)));
  tag('BAJAJ FINSERV EMI PAGE: "ACTUAL EMIs MAY DIFFER"', 40, 290, 26, C.amber);
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1C2440'); bokeh(t, 14, '#F4D06F', 51); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 46px Oswald'; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -50, w, 100, 30), col, C.ink, 5); P(poly([-20, 48, 10, 48, -30, 85]), col, C.ink, 5); txt(s, 0, 3, 46, C.ink); }); };
      bub('12 MAHINE EMI!', 320, 460, 0.3, EMI); bub('24 MAHINE!', 700, 600, 0.6, C.amber); bub('CASH, BACHAT SE!', 360, 760, 0.9, '#9DC4FF'); bub('PEHLE BACHAT!', 330, 920, 1.2, '#FF9DC4');
      shadow(780, 1240, 110); person(780, 1240, 'mahila', { t, s: 1.05, look: -0.3, mood: 0.6, arms: [[0.3, 0.2], [-2.1, -0.4]] }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('COMMENT MEIN BATAO', CX, 300, back(seg(t, 0.1, 0.45)), C.amber, 46, C.ink);
  vignette();
};
