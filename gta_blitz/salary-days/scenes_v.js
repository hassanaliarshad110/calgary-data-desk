// ===== Awazzzz GTA blitz #1 — "GTA 6 = kitne din ki kamaai?" — native 9:16 scenes (DRAWV) for shorts.py.
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
// PRP-054 document) ported 1:1 onto the kit canvas (₹ instead of $).
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

// ---------- spoken opening hook: "GTA 6 khareedne ke liye kitne din kaam karna padega?" ----------
DRAWV.hook1 = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1C2440'); bokeh(t, 14, '#3A7BD5', 5); } },
    { z: 0.35, draw: () => { calCard(CX + 10, 560, 1.15, 'DIN', String(1 + Math.floor(t * 9) % 30), 'KAMAAI…', C.red, 0.04 + wob(t, 0.7, 0.02)); } },
    { z: 0.75, draw: () => { lightPool(CX, 1150, 480, C.amber, 0.25); desk(CX, 1080, 760); laptop(300, 1080, 0.75, t, () => { ctx.fillStyle = '#0D1626'; ctx.fillRect(-165, -216, 330, 200); for (let j = 0; j < 5; j++) { ctx.fillStyle = [C.green2, C.amber, '#7FB4FF'][j % 3]; ctx.fillRect(-140, -195 + j * 34, 120 + rnd(j + Math.floor(t * 4)) * 150, 14); } });
      shadow(700, 1230, 120); person(700, 1230, 'purush', { t, s: 1.35, look: -0.6, mood: -0.2, arms: [[0.3, 0.2], [-0.6, -0.4]] });
      SP.coins(880, 1080, 0.8, 1 + Math.floor(seg(t, 0.3, d) * 5)); } },
  ], drift(t, d, 18), 0, lerp(1.0, 1.08, ease(t / d)));
  if (t > d * 0.5) chipV('KITNE DIN?', CX, 1180, back(seg(t, d * 0.5, d * 0.5 + 0.35)), C.amber, 64, C.ink);
  vignette();
};

// ---------- n01 price ----------
DRAWV.price = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#160E22', '#2E1A40'); bokeh(t, 16, '#FF5FA2', 23); } },
    { z: 0.35, draw: () => { controller(CX, 1020, 1.25, t, '#1E222B'); } },
    { z: 0.7, draw: () => { const k1 = back(seg(t, 0.5, 0.9)); if (k1 > 0) withT(CX - 10, 640, k1, 0, () => priceTag(0, 0, 1.25, 'STANDARD EDITION', '₹5,999', C.amber, -0.06));
      if (k1 > 0) withT(CX, 420, k1, -0.03, () => txtStroke('GTA 6', 0, 0, 130, C.white, C.ink, 14));
      SP.coins(170, 1180, 1.0, 6); SP.coins(820, 1190, 0.9, 4); } }], drift(t, d, 20), 0, lerp(1.0, 1.06, ease(t / d)));
  tag('PLAYSTATION INDIA LISTING · BUSINESS TODAY, 4 NOV 2026', 40, 290, 26, C.amber);
  vignette();
};

// ---------- n02 pay (PLFS 2025) ----------
DRAWV.pay = (t, d) => {
  SCT = t; const D = LINES.n02.dur, tf = D * 0.62;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0D1A1C', '#14303A'); paperTex(0, 0, W, H, 9); } },
    { z: 0.3, draw: () => { SP.document(770, 860, 1.15, 0.05, 'PLFS 2025'); } },
    { z: 0.75, draw: () => {
      shadow(250, 1225, 90); person(250, 1225, 'purush', { t, s: 1.0, look: 0.5, mood: 0.4 });
      if (t > tf - 0.3) { shadow(700, 1225, 85); person(700, 1225, 'mahila', { t, s: 0.97, look: -0.5, mood: 0.3 }); }
    } }], drift(t, d, 16), 0, lerp(1.0, 1.04, ease(t / d)));
  const k1 = back(seg(t, D * 0.3, D * 0.3 + 0.4)); if (k1 > 0) withT(300, 570, k1, -0.04, () => { P(rr(-220, -80, 440, 160, 20), MALE, C.ink, 5); txt('PURUSH', 0, -40, 34, C.ink, 'Oswald', 600); txt('₹' + fmt(cnt(t, D * 0.3, 1.0, 24217)), 0, 22, 66, C.ink); });
  const k2 = back(seg(t, tf, tf + 0.4)); if (k2 > 0) withT(320, 770, k2, 0.03, () => { P(rr(-220, -80, 440, 160, 20), FEM, C.ink, 5); txt('MAHILA', 0, -40, 34, C.ink, 'Oswald', 600); txt('₹' + fmt(cnt(t, tf, 1.0, 18353)), 0, 22, 66, C.ink); });
  if (t > D * 0.4) chipV('AUSAT KAMAAI · PRATI MAHINA', CX, 410, back(seg(t, D * 0.4, D * 0.4 + 0.35)), '#2A3245', 40, C.white);
  tag('MoSPI · PLFS 2025 · NAUKRIPESHA (REGULAR SALARIED)', 40, 290, 26, C.amber);
  vignette();
};

// ---------- n03 days ----------
DRAWV.days = (t, d) => {
  const D = LINES.n03.dur, tf = D * 0.62;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#172036'); bokeh(t, 10, '#F4D06F', 31); } },
    { z: 0.6, draw: () => { calGrid(100, 360, 130, 7.43, 9.81, easeOut(seg(t, 0.6, D * 0.5)), easeOut(seg(t, tf, tf + 1.2))); } }], drift(t, d, 14), 0, lerp(1.0, 1.03, ease(t / d)));
  txt('30 DIN KA MAHINA', CX, 1050, 34, C.grey, 'Oswald', 600);
  const k1 = back(seg(t, D * 0.35, D * 0.35 + 0.35)); if (k1 > 0) withT(270, 1150, k1, -0.03, () => { P(rr(-210, -50, 420, 100, 50), MALE, C.ink, 5); txt('PURUSH ≈ 7.4 DIN', 0, 3, 46, C.ink); });
  const k2 = back(seg(t, tf + 0.5, tf + 0.85)); if (k2 > 0) withT(710, 1150, k2, 0.03, () => { P(rr(-210, -50, 420, 100, 50), FEM, C.ink, 5); txt('MAHILA ≈ 9.8 DIN', 0, 3, 46, C.ink); });
  tag('₹5,999 ÷ AUSAT KAMAAI', 40, 290, 30, C.amber);
  vignette();
};

// ---------- n04 twist: PS5 / Xbox only ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n04.dur; const u = t - 0.45;
  depth([{ z: 0.05, haze: 1, draw: () => sky('#0A0D18', '#1A1430') },
    { z: 0.55, draw: () => { lightPool(CX, 820, 460, '#7FB4FF', 0.25);
      const k = back(seg(u, D * 0.35, D * 0.35 + 0.45)); if (k > 0) withT(CX, 800, k, 0, () => { shadow(0, 270, 330, 0.4);
        P(rr(-330, -250, 170, 500, 34), '#F2F2F2', C.ink, 6); P(rr(-160, -210, 50, 420, 20), '#1A1E26', C.ink, 5);
        P(rr(30, -220, 290, 460, 18), '#1A1E26', C.ink, 6); P(rr(80, -180, 190, 34, 6), '#2BD46A', null);
        txt('CONSOLE', -245, 0, 28, '#888', 'Oswald', 700); txt('CONSOLE', 175, 120, 28, '#888', 'Oswald', 700); });
      withT(200, 1110, 1, 0, () => { phone(0, 0, 1.4); }); } }], drift(t, d, 16), 0, lerp(1.0, 1.06, ease(t / d)));
  if (t < 1.4) alpha(1 - seg(t, 1.0, 1.4), () => { glow(CX, 760, 500, C.amber, 0.4); txtStroke('TWIST!', CX, 760, 200, C.amber, C.ink, 18); });
  chipV('SIRF PS5 · XBOX SERIES X/S', CX, 430, back(seg(u, D * 0.45, D * 0.45 + 0.35)), C.amber, 46, C.ink);
  chipV('PC VERSION: ABHI ANNOUNCE NAHI', CX, 1170, back(seg(u, D * 0.7, D * 0.7 + 0.35)), '#2A3245', 38, C.white);
  tag('BUSINESS TODAY, 4 NOV 2026', 40, 290, 26, C.amber);
  vignette();
};

// ---------- n05 the bill ----------
DRAWV.bill = (t, d) => {
  const D = LINES.n05.dur;
  fillAll('#0E1424'); glow(CX, 760, 800, C.amber, 0.12); rainBills(t, 10, 7, 0.35);
  withT(CX, 740, 1.0, -0.02, () => { shadow(0, 420, 380, 0.4); P(rr(-420, -380, 840, 760, 14), '#F2EEE3', C.ink, 6); paperTex(-420, -380, 840, 760, 4);
    for (let i = 0; i < 20; i++) P(poly([-420 + i * 42, 380, -399 + i * 42, 360, -378 + i * 42, 380]), '#0E1424', null);
    txt('KHELNE KA BILL', 0, -310, 62, C.ink); line(-360, -260, 360, -260, C.ink, 3);
    [['PS5 SLIM DIGITAL', '₹64,990', 0.3], ['GTA 6 STANDARD', '₹5,999', D * 0.42]].forEach(([a, b, s], i) => { if (t > s) { txt(a, -360, -180 + i * 90, 42, C.ink, 'Oswald', 600, 'left'); txt(b, 360, -180 + i * 90, 50, C.ink, 'Oswald', 700, 'right'); } });
    if (t > D * 0.6) { line(-360, 10, 360, 10, C.ink, 4); txt('TOTAL', -360, 90, 60, C.ink, 'Oswald', 700, 'left'); txt('₹' + fmt(cnt(t, D * 0.6, 1.0, 70989)), 360, 90, 92, C.red, 'Oswald', 700, 'right'); }
    if (t > D * 0.75) SP.moneyStack(250, 330, 0.8);
  });
  tag('BUSINESS TODAY · AMAZON INDIA LISTING', 40, 290, 26, C.amber);
  vignette();
};

// ---------- n06 months ----------
DRAWV.months = (t, d) => {
  const D = LINES.n06.dur, tf = D * 0.45;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#140B10', '#2A1420'); bokeh(t, 12, FEM, 41); } },
    { z: 0.6, draw: () => {
      const bar = (y, n, k, col, lab) => { for (let m = 0; m < 4; m++) { const x = 110 + m * 200; P(rr(x, y, 180, 210, 14), '#1E2840', C.ink, 4); P(rr(x, y, 180, 50, [14, 14, 0, 0]), '#2A3245', C.ink, 4); txt('MAHINA ' + (m + 1), x + 90, y + 26, 26, C.grey, 'Oswald', 600); const f = clamp(n * k - m); if (f > 0) P(rr(x + 8, y + 58, 164 * f, 144, 10), col, null); }
        txt(lab, 110, y - 40, 46, col, 'Oswald', 700, 'left'); };
      bar(450, 2.93, easeOut(seg(t, 0.3, tf)), MALE, 'PURUSH ≈ 2.9 MAHINE');
      bar(870, 3.87, easeOut(seg(t, tf, tf + 1.3)), FEM, 'MAHILA ≈ 3.9 MAHINE');
      SP.coins(850, 1230, 0.7, 3); } }], drift(t, d, 12), 0, lerp(1.0, 1.04, ease(t / d)));
  tag('₹70,989 ÷ AUSAT MAHINE KI KAMAAI (PLFS 2025)', 40, 290, 26, C.amber);
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1C2440'); bokeh(t, 14, '#F4D06F', 51); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 46px Oswald'; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -50, w, 100, 30), col, C.ink, 5); P(poly([-20, 48, 10, 48, -30, 85]), col, C.ink, 5); txt(s, 0, 3, 46, C.ink); }); };
      bub('1 HAFTA?', 300, 460, 0.3, MALE); bub('10 DIN?', 690, 600, 0.6, FEM); bub('3 MAHINE?', 330, 760, 0.9, '#7FDBA0'); bub('KABHI NAHI!', 660, 920, 1.2, '#9DC4FF');
      shadow(CX, 1230, 110); person(CX, 1230, 'mahila', { t, s: 1.1, look: 0, mood: 0.6, arms: [[0.3, 0.2], [-2.1, -0.4]] }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('COMMENT MEIN BATAO', CX, 300, back(seg(t, 0.1, 0.45)), C.amber, 46, C.ink);
  vignette();
};
