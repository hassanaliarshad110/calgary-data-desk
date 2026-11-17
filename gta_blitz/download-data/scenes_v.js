// ===== Awazzzz GTA blitz #7 — "GTA 6 download vs India ka mobile data" (FACT: Rockstar 212 GB, TRAI PR 135/2026) — native 9:16 scenes (DRAWV).
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters; "GTA" set in Oswald (our font).
// No map at all, no operator logos. Generic console / phone / router / coins props.
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


// Studio library assets (animation-studio catalogue via select_assets.py on brief.json): PRP-017 phone, PRP-052 coins,
// PRP-013 clock (engine/props.js), VFX-012 speedLines, VFX-019 question — ported onto the kit canvas.
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

// ---------- own generic drawings ----------
function consoleBox(x, y, s, t) { withT(x, y, s, 0, () => { shadow(0, 20, 260, 0.45);
  P(rr(-90, -420, 180, 440, 40), '#E8ECF2', C.ink, 6); P(rr(-30, -420, 60, 440, 10), '#1B1F2A', C.ink, 4);
  glow(0, -200, 120, CYAN, 0.25 + 0.15 * Math.sin(t * 4)); P(rr(-6, -380, 12, 60, 6), CYAN, null); }); }
function progressBar(x, y, w, k, label, col = '#2BFF88') { P(rr(x - w / 2, y - 34, w, 68, 34), 'rgba(10,14,24,0.9)', C.white, 5);
  if (k > 0) P(rr(x - w / 2 + 8, y - 26, Math.max(52, (w - 16) * k), 52, 26), col, null); txt(label, x, y + 2, 36, k > 0.5 ? C.ink : C.white, 'Oswald', 700); }
function dlArrow(x, y, s, t) { const b = Math.sin(t * 6) * 10; withT(x, y + b, s, 0, () => { P(poly([-36, -90, 36, -90, 36, 0, 80, 0, 0, 80, -80, 0, -36, 0]), '#2BFF88', C.ink, 5); }); }
function wifiRouter(x, y, s, t) { withT(x, y, s, 0, () => { shadow(0, 30, 200, 0.4);
  P(rr(-150, -60, 300, 90, 24), '#2A2F3A', C.ink, 5); [-100, 100].forEach(px => P(rr(px - 8, -190, 16, 140, 8), '#2A2F3A', C.ink, 4));
  for (let i = 0; i < 4; i++) P(circ(-90 + i * 40, -15, 8), i < 3 ? '#2BFF88' : CYAN, null);
  for (let i = 0; i < 3; i++) { const a = 0.5 + 0.5 * Math.sin(t * 5 - i); ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = '#2BFF88'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, -150, 70 + i * 55, -2.4, -0.74); ctx.stroke(); ctx.restore(); } }); }
function monthPage(x, y, s, label, k, col = RED) { if (k <= 0) return; withT(x, y, k * s, 0, () => { P(rr(-80, -90, 160, 180, 14), C.white, C.ink, 4); P(rr(-80, -90, 160, 46, [14, 14, 0, 0]), col, C.ink, 4);
  txt(label, 0, -66, 26, C.white, 'Oswald', 700); for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) P(rr(-62 + c * 26, -30 + r * 26, 18, 18, 4), '#D8DCE6', null); }); }
function srcChip(s, k) { if (k <= 0) return; alpha(k, () => { ctx.font = '600 28px Oswald'; const w = ctx.measureText(s).width + 36; P(rr(60, 1182 - 22, w, 44, 22), 'rgba(10,14,24,0.75)', 'rgba(255,255,255,0.5)', 2); txt(s, 60 + w / 2, 1183, 28, '#C9D3E6', 'Oswald', 600); }); }
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'];

// ---------- spoken opening hook: "GTA 6 sirf mobile data se download kiya, to kitne mahine ka data jaayega?" ----------
DRAWV.hook1 = (t, d) => {
  const k = seg(t, 0.2, d * 0.95);
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#0A1024', '#1E2A52'); bokeh(t, 14, CYAN, 5); SP.speedLines(t, CX, 700, 20, 0.18); } },
    { z: 0.45, draw: () => { withT(CX, 520, 1, 0, () => { glow(0, 0, 380, '#2BFF88', 0.25); txtStroke('GTA 6', 0, 0, 190, C.white, C.ink, 16); });
      progressBar(CX, 760, 760, k * 0.62, Math.round(212 * k * 0.62) + ' / 212 GB'); dlArrow(CX, 900, 0.8, t); } },
    { z: 0.85, draw: () => { floorV(1220, '#141A28', '#0A0E18'); SP.phone(780, 1190, 2.2, t, 1 - k * 0.9); SP.question(t, 880, 880, 0.8, 0.9); shadow(260, 1220, 90); person(260, 1220, 'yuva', { t, s: 0.95, look: 0.5, mood: -0.2 }); } },
  ], drift(t, d, 18), 0, lerp(1.0, 1.08, ease(t / d)));
  vignette();
};

// ---------- n01 Rockstar: pre-load up to 212 GB depending on device ----------
DRAWV.intro = (t, d) => {
  const D = LINES.n01.dur, k = easeOut(seg(t, 0.3, D * 0.85));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B0F22', '#24204A'); bokeh(t, 12, '#9D7BFF', 9); } },
    { z: 0.45, draw: () => { consoleBox(250, 1120, 1.05, t); dlArrow(250, 520, 0.7, t);
      const kc = back(seg(t, D * 0.35, D * 0.35 + 0.4)); if (kc > 0) withT(640, 640, kc, 0, () => { P(rr(-280, -170, 560, 340, 34), 'rgba(10,14,24,0.92)', GOLD, 6); txt('PRE-LOAD', 0, -100, 46, C.white); txtStroke('212 GB', 0, 10, 140, GOLD, C.ink, 12); txt('TAK', 0, 115, 56, C.white); }); } },
    { z: 0.85, draw: () => { floorV(1150, '#1A1A30', '#0A0A16'); progressBar(CX, 1000, 820, k, 'PRE-LOAD ' + Math.round(k * 100) + '%'); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('ROCKSTAR KE MUTABIK', CX, 340, back(seg(t, 0.1, 0.45)), C.white, 46, C.ink);
  chipV('DEVICE KE HISAAB SE', 640, 860, back(seg(t, D * 0.55, D * 0.55 + 0.35)), CYAN, 38, C.ink);
  srcChip('SOURCE: ROCKSTAR (via GamesRadar, 3 Nov 2026)', seg(t, 0.5, 1));
  vignette();
};

// ---------- n02 TRAI: avg 28.39 GB per month per wireless data subscriber ----------
DRAWV.avg = (t, d) => {
  const D = LINES.n02.dur, fill = 1 - 0.85 * seg(t, D * 0.4, D);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#081A1E', '#13424A'); bokeh(t, 12, '#2BFF88', 13); } },
    { z: 0.5, draw: () => { SP.phone(270, 1090, 4.6, t, fill); txt('DATA', 270, 1150, 40, C.white, 'Oswald', 700);
      if (t > D * 0.35) { alpha(seg(t, D * 0.35, D * 0.35 + 0.2), () => P(rr(470, 470, 460, 380, 34), 'rgba(10,14,24,0.9)', '#2BFF88', 6));
        SP.counter(t, D * 0.38, { x: 700, y: 640, from: 0, to: 28.39, dec: 2, size: 120, col: '#2BFF88', label: '' }); txt('GB / MAHINA', 700, 760, 50, C.white, 'Oswald', 700); txt('AUSATAN', 700, 520, 38, '#C9D3E6', 'Oswald', 700); } } },
    { z: 0.9, draw: () => { floorV(1200, '#0E2428', '#061214'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('TRAI KEHTA HAI', CX, 340, back(seg(t, 0.1, 0.45)), GOLD, 50, C.ink);
  chipV('EK MOBILE DATA USER', 700, 930, back(seg(t, D * 0.2, D * 0.2 + 0.35)), C.white, 36, C.ink);
  srcChip('SOURCE: TRAI PR 135/2026 · per wireless data subscriber · Apr–Jun 2026', seg(t, 0.5, 1));
  vignette();
};

// ---------- n03 twist: 212 / 28.39 ≈ 7.5 months ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n03.dur, u = t - 0.35;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#140A1E', '#3A1A3E'); bokeh(t, 10, '#FF6B8A', 4); SP.speedLines(t, CX, 700, 18, 0.15); } },
    { z: 0.5, draw: () => {
      const kd = back(seg(u, D * 0.1, D * 0.1 + 0.35)); if (kd > 0) withT(CX, 420, kd, 0, () => { P(rr(-380, -60, 760, 120, 30), 'rgba(10,14,24,0.9)', C.white, 4); txt('212 GB ÷ 28.39 GB', 0, 4, 64, C.white); });
      for (let i = 0; i < 8; i++) { const ki = back(seg(u, D * 0.3 + i * D * 0.06, D * 0.3 + i * D * 0.06 + 0.3)); const x = 170 + (i % 4) * 225, y = 640 + Math.floor(i / 4) * 220;
        if (i < 7) monthPage(x, y, 1, 'MAHINA ' + (i + 1), ki); else if (ki > 0) withT(x - 40, y, ki, 0, () => { ctx.save(); ctx.beginPath(); ctx.rect(-80, -100, 80, 200); ctx.clip(); monthPage(40, 0, 1, 'MAHINA 8', 1); ctx.restore(); }); }
      const ks = back(seg(u, D * 0.75, D * 0.75 + 0.35)); if (ks > 0) withT(CX, 1080, ks, -0.04, () => { glow(0, 0, 380, RED, 0.45); P(rr(-380, -85, 760, 170, 24), 'rgba(230,57,70,0.18)', RED, 10); txt('≈ 7.5 MAHINE!', 0, 4, 92, RED); }); } },
    { z: 0.9, draw: () => { floorV(1230, '#1E1028', '#0E0814'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  if (t < 1.4) alpha(1 - seg(t, 1.0, 1.4), () => { glow(CX, 650, 500, GOLD, 0.4); txtStroke('TWIST!', CX, 650, 200, GOLD, C.ink, 18); });
  chipV('AUSAT MOBILE DATA USER KA', CX, 300, back(seg(u, D * 0.5, D * 0.5 + 0.35)), C.white, 36, C.ink);
  vignette();
};

// ---------- n04 2 GB/day plan: 106 days ----------
DRAWV.daily = (t, d) => {
  const D = LINES.n04.dur, day = Math.floor(lerp(0, 106, easeOut(seg(t, D * 0.3, D * 0.85)))), dayFill = 1 - ((t * 2.2) % 1);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0E1420', '#26324A'); glow(CX, 640, 480, '#9DB8FF', 0.22); } },
    { z: 0.45, draw: () => { const kp = back(seg(t, 0.1, 0.45)); if (kp > 0) withT(CX, 420, kp, 0, () => { P(rr(-300, -70, 600, 140, 30), '#2BAA4A', C.ink, 6); txt('PLAN: 2 GB / DIN', 0, 4, 62, C.white); });
      SP.phone(230, 1060, 3.2, t, t > D * 0.3 ? dayFill : 1); SP.clock(230, 560, 0.8, t * 4); } },
    { z: 0.8, draw: () => { if (t > D * 0.3) { alpha(seg(t, D * 0.3, D * 0.3 + 0.2), () => P(rr(440, 560, 480, 400, 36), 'rgba(10,14,24,0.9)', GOLD, 6));
      SP.counter(t, D * 0.3, { x: 680, y: 740, from: 0, to: 106, dur: D * 0.55, size: 200, col: GOLD, label: 'DIN' }); } floorV(1235, '#1A2030', '#0A0E16'); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('POORE 212 GB KE LIYE', CX, 1110, back(seg(t, D * 0.3, D * 0.3 + 0.35)), CYAN, 44, C.ink);
  vignette();
};

// ---------- n05 TRAI ₹7.13 per GB (companies' average revenue) × 212 ≈ ₹1,512 ----------
DRAWV.money = (t, d) => {
  const D = LINES.n05.dur, kc = seg(t, D * 0.55, D * 0.9);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1C140A', '#4A3818'); glow(CX, 520, 520, '#FFC56E', 0.3); bokeh(t, 12, GOLD, 21); } },
    { z: 0.5, draw: () => {
      const k1 = back(seg(t, D * 0.15, D * 0.15 + 0.4)); if (k1 > 0) withT(CX, 500, k1, 0, () => { P(rr(-400, -150, 800, 300, 30), 'rgba(10,14,24,0.92)', GOLD, 6); txt('COMPANIYON KI AUSAT KAMAAI', 0, -85, 40, C.white); txtStroke('₹7.13 / GB', 0, 30, 120, GOLD, C.ink, 10); });
      const k2 = back(seg(t, D * 0.55, D * 0.55 + 0.35)); if (k2 > 0) withT(CX, 760, k2, 0, () => txtStroke('× 212 GB', 0, 0, 90, C.white, C.ink, 8));
      if (t > D * 0.62) SP.counter(t, D * 0.62, { x: CX, y: 950, from: 0, to: 1512, dur: 1.0, pre: '≈ ₹', size: 170, col: '#2BFF88' }); } },
    { z: 0.88, draw: () => { floorV(1200, '#2A1E0C', '#120C04'); for (let i = 0; i < 5; i++) SP.coins(130 + i * 200, 1190, 1.1, 2 + Math.floor(kc * 6) + (i % 2)); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('PAISON MEIN?', CX, 300, back(seg(t, 0.05, 0.4)), C.white, 50, C.ink);
  srcChip('SOURCE: TRAI PR 135/2026 · revenue realization per GB', seg(t, 0.5, 1));
  vignette();
};

// ---------- n06 lesson: download on Wi-Fi, keep up to 212 GB free ----------
DRAWV.tip = (t, d) => {
  const D = LINES.n06.dur, k = easeOut(seg(t, D * 0.5, D * 0.9));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#081A12', '#164A30'); bokeh(t, 12, '#2BFF88', 33); } },
    { z: 0.5, draw: () => { wifiRouter(300, 700, 1.15, t); const kw = back(seg(t, 0.2, 0.55)); if (kw > 0) withT(700, 520, kw, 0, () => { P(rr(-210, -70, 420, 140, 30), '#2BFF88', C.ink, 6); txt('WI-FI ✓', 0, 4, 76, C.ink); });
      consoleBox(790, 1080, 0.75, t); } },
    { z: 0.85, draw: () => { floorV(1200, '#0E2418', '#06120A'); if (t > D * 0.45) { alpha(seg(t, D * 0.45, D * 0.45 + 0.2), () => { P(rr(60, 880, 600, 120, 24), 'rgba(10,14,24,0.92)', C.white, 4); txt('KHAALI JAGAH', 360, 915, 34, C.white, 'Oswald', 700); });
      progressBar(360, 970, 540, k, '212 GB TAK', CYAN); } } }],
    drift(t, d, 10), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('SABAK', CX, 330, back(seg(t, 0.05, 0.4)), GOLD, 54, C.ink);
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1C2440'); bokeh(t, 14, GOLD, 61); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 64px Oswald'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -64, w, 128, 36), col, C.ink, 5); P(poly([-20, 62, 10, 62, -30, 100]), col, C.ink, 5); txt(s, 0, 3, 64, C.ink); }); };
      bub('WI-FI?', 330, 520, 0.3, '#2BFF88'); withT(CX, 690, back(seg(t, 0.55, 0.85)), 0, () => txtStroke('YA', 0, 0, 80, C.white, C.ink, 8)); bub('MOBILE DATA?', 540, 860, 0.8, '#9DC4FF');
      floorV(1240, '#1B2236', '#0B1020'); shadow(800, 1240, 110); person(800, 1240, 'mahila', { t, s: 1.05, look: -0.3, mood: 0.6, arms: [[0.3, 0.2], [-2.1, -0.4]] }); SP.phone(230, 1200, 1.6, t, 0.7); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('COMMENT KARO', CX, 340, back(seg(t, 0.1, 0.45)), GOLD, 46, C.ink);
  vignette();
};
