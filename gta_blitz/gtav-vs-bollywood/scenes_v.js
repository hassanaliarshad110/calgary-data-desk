// ===== Awazzzz GTA blitz #8 — "GTA V ki kamaai vs Bollywood ki sabse badi film" (FACT: Sacnilk/The Week Dangal ₹2,070 cr; Take-Two $800M day 1, $1B in 3 days; Business Standard ₹63.38/$) — native 9:16 scenes (DRAWV).
// Own 2.5D art only: no game footage, logos, official fonts, key art, characters, film posters or actors; "GTA"/"DANGAL" set in Oswald (our font). No maps.
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
function floorV(y, c1, c2) { ctx.fillStyle = grad(y, H + 300, c1, c2); ctx.fillRect(-300, y, W + 600, H + 600 - y);
  // 2.5D stage floor: perspective grid + light pool + rim, so the lower frame is never an empty block
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 3;
  for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(CX + i * 40, y); ctx.lineTo(CX + i * 260, H + 300); ctx.stroke(); }
  for (let j = 1; j < 9; j++) { const yy = y + Math.pow(j / 9, 1.8) * (H + 300 - y); ctx.beginPath(); ctx.moveTo(-300, yy); ctx.lineTo(W + 300, yy); ctx.stroke(); }
  ctx.restore(); glow(CX, y + 260, 520, '#F4D06F', 0.10); ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(-300, y, W + 600, 4); }
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


// Studio library extras (select_assets.py on brief.json): PRP-053 moneyStack, PRP-051 bill, GFX-001 bars style — ported.
SP.moneyStack = (x, y, s = 1) => { withT(x, y, s, 0, () => { for (let i = 0; i < 6; i++) P(rr(-110, -30 - i * 22, 220, 26, 4), i % 2 ? '#52b788' : '#40916c', '#2a1c14', 3); P(rr(-20, -160, 40, 140, 2), '#e9c46a', '#2a1c14', 2); }); };
SP.bill = (x, y, s = 1, ang = 0) => { withT(x, y, s, ang, () => { P(rr(-90, -45, 180, 90, 8), '#52b788', '#2a1c14', 4); P(circ(0, 0, 22), '#7FD0A8', '#2a1c14', 2); txt('$', 0, 2, 30, '#245A40', 'Oswald', 700); }); };

// ---------- own generic drawings ----------
function cinemaScreen(x, y, w, h, t, k = 1) { // generic screen with projector light, no film imagery
  glow(x, y, w * 0.8, '#BFD7FF', 0.25 * k + 0.05 * Math.sin(t * 7));
  P(rr(x - w / 2, y - h / 2, w, h, 12), '#DCE6F5', '#1A1F2E', 8);
  alpha(0.35, () => { for (let i = 0; i < 6; i++) { const yy = y - h / 2 + ((t * 120 + i * 60) % h); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x - w / 2 + 10, yy, w - 20, 3); } });
}
function seats(y, t, n = 7, col = '#2A2440') { for (let r = 0; r < 2; r++) for (let i = 0; i < n; i++) { const x = 60 + i * (980 / (n - 1)) + (r ? 70 : 0), yy = y + r * 90 + Math.sin(t * 2 + i) * 2;
  P(circ(x, yy - 70, 34), col, null); P(rr(x - 52, yy - 40, 104, 120, 26), col, null); } }
function filmReel(x, y, s, t) { withT(x, y, s, t * 1.5, () => { P(circ(0, 0, 110), '#2A2F3A', '#0A0C12', 6); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; P(circ(Math.cos(a) * 62, Math.sin(a) * 62, 26), '#0E1018', null); } P(circ(0, 0, 18), '#8A93A6', null); }); }
function ticket(x, y, s, ang, label) { withT(x, y, s, ang, () => { P(rr(-140, -60, 280, 120, 14), GOLD, C.ink, 5); ctx.setLineDash([10, 8]); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(70, -55); ctx.lineTo(70, 55); ctx.stroke(); ctx.setLineDash([]); txt(label, -35, 4, 40, C.ink, 'Oswald', 700); txt('★', 106, 4, 40, C.ink); }); }
function trophy(x, y, s, t) { withT(x, y, s, 0, () => { glow(0, -120, 260, GOLD, 0.35 + 0.1 * Math.sin(t * 5)); P(rr(-90, -10, 180, 50, 10), WOOD, C.ink, 5); P(rr(-26, -80, 52, 72, 6), '#D9A830', C.ink, 5);
  P(poly([-120, -300, 120, -300, 90, -150, 40, -90, -40, -90, -90, -150]), GOLD, C.ink, 6);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.fillStyle = 'transparent'; ctx.beginPath(); ctx.arc(-130, -230, 45, 1.2, 4.6); ctx.stroke(); ctx.beginPath(); ctx.arc(130, -230, 45, -1.45, 1.9); ctx.stroke();
  txtStroke('1', 0, -205, 90, '#FFF6D0', C.ink, 6); }); }
function calCard(x, y, s, top, big, k, col = RED) { if (k <= 0) return; withT(x, y, k * s, 0, () => { shadow(0, 140, 150, 0.35); P(rr(-130, -140, 260, 280, 22), C.white, C.ink, 5); P(rr(-130, -140, 260, 76, [22, 22, 0, 0]), col, C.ink, 5);
  txt(top, 0, -100, 40, C.white, 'Oswald', 700); txtStroke(big, 0, 40, 110, C.ink, C.white, 2); }); }
function balance(x, y, tilt, t, L, R) { // generic weighing scale; tilt>0 = right side heavier
  withT(x, y, 1, 0, () => { P(rr(-14, -20, 28, 380, 8), '#8A6A3A', C.ink, 4); P(rr(-120, 350, 240, 40, 12), WOOD, C.ink, 4); P(circ(0, -20, 22), GOLD, C.ink, 4);
    withT(0, -20, 1, tilt, () => { P(rr(-330, -10, 660, 20, 10), '#C9A24A', C.ink, 4);
      [[-310, L], [310, R]].forEach(([px, f]) => withT(px, 0, 1, -tilt, () => { ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-90, 170); ctx.moveTo(0, 0); ctx.lineTo(90, 170); ctx.stroke();
        P(poly([-115, 170, 115, 170, 88, 205, -88, 205]), '#C9A24A', C.ink, 4); f(); })); }); }); }
function donut(x, y, r, frac, k, col, rest) { ctx.save(); ctx.lineWidth = r * 0.42; ctx.lineCap = 'butt'; ctx.strokeStyle = rest; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.stroke();
  ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(x, y, r, -1.5708, -1.5708 + 6.2832 * frac * k); ctx.stroke(); ctx.restore(); P(circ(x, y, r * 0.78), 'rgba(10,14,24,0.95)', null); }

// ---------- spoken opening hook: "Ek game ki ek din ki kamaai, ya Bollywood ki sabse badi film ki poori kamaai: kaun aage?" ----------
DRAWV.hook1 = (t, d) => {
  const tilt = 0.06 * Math.sin(t * 2.4);
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#0A1024', '#2A1A40'); bokeh(t, 14, GOLD, 5); SP.speedLines(t, CX, 760, 20, 0.15); } },
    { z: 0.45, draw: () => { balance(CX, 700, tilt, t,
        () => { filmReel(0, 90, 0.6, t); ticket(0, 120, 0.55, -0.1, 'FILM'); },
        () => { consoleBox(0, 168, 0.4, t); SP.moneyStack(70, 168, 0.45); });
      chipV('POORI ZINDAGI', 130, 460, back(seg(t, 0.4, 0.75)), C.white, 34, C.ink); chipV('SIRF 1 DIN', 850, 460, back(seg(t, 0.8, 1.15)), '#2BFF88', 34, C.ink);
      withT(CX, 330, back(seg(t, 1.3, 1.7)), 0, () => txtStroke('KAUN AAGE?', 0, 0, 96, GOLD, C.ink, 10)); } },
    { z: 0.85, draw: () => { floorV(1220, '#141A28', '#0A0E18'); SP.question(t, 870, 1060, 1.6, 0.9); shadow(220, 1220, 90); person(220, 1220, 'mahila', { t, s: 0.95, look: 0.5, mood: 0.3 }); } },
  ], drift(t, d, 18), 0, lerp(1.0, 1.08, ease(t / d)));
  vignette();
};

// ---------- n01 Dangal = India's highest-grossing film worldwide, ~₹2,070 crore ----------
DRAWV.dangal = (t, d) => {
  const D = LINES.n01.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B0F22', '#1E1636'); bokeh(t, 10, '#9D7BFF', 9); } },
    { z: 0.4, draw: () => { cinemaScreen(CX, 640, 860, 520, t); const kn = back(seg(t, 0.4, 0.8));
      if (kn > 0) withT(CX, 560, kn, 0, () => { txt('BHARAT KI NO.1 FILM', 0, -80, 52, C.ink, 'Oswald', 700); txtStroke('DANGAL', 0, 30, 150, RED, C.ink, 10); });
      if (t > D * 0.5) SP.counter(t, D * 0.5, { x: CX, y: 800, from: 0, to: 2070, dur: 1.4, pre: '₹', suffix: ' CR', size: 110, col: '#1A6B3A' }); } },
    { z: 0.85, draw: () => { floorV(1000, '#120E1E', '#06040C'); seats(1120, t); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.06, ease(t / d)));
  chipV('DUNIYA BHAR MEIN · LAGBHAG', CX, 1030, back(seg(t, D * 0.45, D * 0.45 + 0.35)), GOLD, 40, C.ink);
  srcChip('SOURCE: Sacnilk (Apr 2026) · The Week (12 Nov 2026)', seg(t, 0.5, 1));
  vignette();
};

// ---------- n02 1,300+ crore of it from China ----------
DRAWV.china = (t, d) => {
  const D = LINES.n02.dur, k = easeOut(seg(t, 0.3, D * 0.75));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1E0A0E', '#4A1820'); bokeh(t, 12, '#FF6B6B', 13); } },
    { z: 0.5, draw: () => { donut(CX, 680, 260, 1300 / 2070, k, RED, '#3A4560');
      txt('KUL ₹2,070 CR', CX, 620, 46, C.white, 'Oswald', 700); if (t > 0.3) SP.counter(t, 0.3, { x: CX, y: 730, from: 0, to: 1300, dur: D * 0.45, pre: '₹', suffix: '+ CR', size: 84, col: '#FF8A8A' });
      const kc = back(seg(t, D * 0.55, D * 0.55 + 0.35)); if (kc > 0) withT(CX, 1060, kc, 0, () => { P(rr(-300, -70, 600, 140, 30), RED, C.ink, 6); txt('SIRF CHINA SE!', 0, 4, 66, C.white); }); } },
    { z: 0.9, draw: () => { floorV(1210, '#2A0E14', '#120408'); SP.coins(120, 1200, 1.1, 4); SP.coins(880, 1200, 1.1, 6); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('AUR ISMEIN…', CX, 330, back(seg(t, 0.05, 0.4)), C.white, 48, C.ink);
  srcChip('SOURCE: Sacnilk (23 Apr 2026): China 1300+ crore', seg(t, 0.5, 1));
  vignette();
};

// ---------- n03 GTA V, Sep 2013: first-day sell-through > $800 million (Take-Two) ----------
DRAWV.gta = (t, d) => {
  const D = LINES.n03.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#081A12', '#12402A'); bokeh(t, 12, '#2BFF88', 21); SP.speedLines(t, CX, 700, 16, 0.12); } },
    { z: 0.45, draw: () => { consoleBox(230, 1100, 1.0, t); calCard(700, 470, 0.9, 'SEP', '2013', back(seg(t, D * 0.12, D * 0.12 + 0.35)), '#2BAA4A');
      const kg = back(seg(t, D * 0.25, D * 0.25 + 0.35)); if (kg > 0) withT(230, 470, kg, 0, () => { glow(0, 0, 220, '#2BFF88', 0.3); txtStroke('GTA V', 0, 0, 110, C.white, C.ink, 10); });
      if (t > D * 0.62) { alpha(seg(t, D * 0.62, D * 0.62 + 0.2), () => P(rr(400, 700, 520, 300, 34), 'rgba(10,14,24,0.92)', '#2BFF88', 6)); txt('PEHLA DIN', 660, 760, 44, C.white, 'Oswald', 700);
        SP.counter(t, D * 0.62, { x: 660, y: 880, from: 0, to: 800, dur: 1.2, pre: '$', suffix: 'M+', size: 130, col: '#2BFF88' }); } } },
    { z: 0.85, draw: () => { floorV(1180, '#0E2418', '#06120A'); for (let i = 0; i < 4; i++) SP.bill(560 + i * 110, 1150 - (i % 2) * 30, 0.8, -0.2 + i * 0.15); SP.moneyStack(880, 1190, 0.6); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('AB EK GAME', CX, 300, back(seg(t, 0.05, 0.4)), GOLD, 50, C.ink);
  chipV('TAKE-TWO KE MUTABIK', 660, 640, back(seg(t, D * 0.45, D * 0.45 + 0.35)), C.white, 36, C.ink);
  srcChip('SOURCE: Take-Two release, 18 Sep 2013 (via Engadget, Gematsu)', seg(t, 0.5, 1));
  vignette();
};

// ---------- n04 twist: $800M × ₹63.38 ≈ ₹5,070 cr > 2× Dangal ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n04.dur, u = t - 0.25, tilt = 0.16 * easeOut(seg(u, D * 0.45, D * 0.75));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#140A1E', '#3A1A3E'); bokeh(t, 10, '#FF6B8A', 4); SP.speedLines(t, CX, 700, 18, 0.15); } },
    { z: 0.5, draw: () => {
      const kd = back(seg(u, D * 0.05, D * 0.05 + 0.35)); if (kd > 0) withT(CX, 380, kd, 0, () => { P(rr(-420, -110, 840, 220, 30), 'rgba(10,14,24,0.9)', C.white, 4); txt('$800M × ₹63.38', 0, -40, 58, C.white); txtStroke('= ₹5,000 CR+', 0, 50, 76, GOLD, C.ink, 7); });
      alpha(seg(u, 0.2, 0.6), () => balance(CX, 640, -tilt, t,
        () => { withT(0, 172, 1, 0, () => { P(rr(-112, -90, 224, 90, 18), '#2BFF88', C.ink, 5); txt('GTA V · 1 DIN', 0, -62, 30, C.ink, 'Oswald', 700); txt('₹5,000 CR+', 0, -24, 38, C.ink, 'Oswald', 700); }); },
        () => { withT(0, 172, 1, 0, () => { P(rr(-112, -90, 224, 90, 18), '#F2F0E6', C.ink, 5); txt('DANGAL · POORI', 0, -62, 30, C.ink, 'Oswald', 700); txt('₹2,070 CR', 0, -24, 38, C.ink, 'Oswald', 700); }); }));
      const ks = back(seg(u, D * 0.72, D * 0.72 + 0.35)); if (ks > 0) withT(CX, 1100, ks, -0.04, () => { glow(0, 0, 380, RED, 0.45); P(rr(-380, -80, 760, 160, 24), 'rgba(230,57,70,0.18)', RED, 10); txt('2× SE BHI ZYADA!', 0, 4, 80, RED); }); } },
    { z: 0.9, draw: () => { floorV(1235, '#1E1028', '#0E0814'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  if (t < 1.4) alpha(1 - seg(t, 1.0, 1.4), () => { glow(CX, 650, 500, GOLD, 0.4); txtStroke('TWIST!', CX, 650, 200, GOLD, C.ink, 18); });
  srcChip('₹63.38/$: Business Standard, 18 Sep 2013 · retail sales vs box-office gross', seg(u, 0.3, 0.8));
  vignette();
};

// ---------- n05 3 days: $1 billion, new record ----------
DRAWV.record = (t, d) => {
  const D = LINES.n05.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1C140A', '#4A3818'); glow(CX, 520, 520, '#FFC56E', 0.3); bokeh(t, 12, GOLD, 31); } },
    { z: 0.45, draw: () => { for (let i = 0; i < 3; i++) calCard(200 + i * 290, 420, 0.75, 'DIN', String(i + 1), back(seg(t, 0.15 + i * 0.3, 0.45 + i * 0.3)), '#C47A12');
      if (t > D * 0.35) SP.counter(t, D * 0.35, { x: CX, y: 720, from: 0, to: 1, dur: 0.8, pre: '$', suffix: ' BILLION+', size: 110, col: GOLD }); } },
    { z: 0.8, draw: () => { floorV(1180, '#2A1E0C', '#120C04'); trophy(CX, 1150, 0.95 * back(seg(t, D * 0.55, D * 0.55 + 0.4)) + 0.001, t); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('NAYA RECORD!', CX, 860, back(seg(t, D * 0.6, D * 0.6 + 0.35)), RED, 54, C.white);
  srcChip('SOURCE: Take-Two via Gematsu, 20 Sep 2013', seg(t, 0.5, 1));
  vignette();
};

// ---------- n06 GTA 6 on 19 Nov: will it break its big brother's record? ----------
DRAWV.next = (t, d) => {
  const D = LINES.n06.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0A0F24', '#22205A'); bokeh(t, 14, '#9D7BFF', 41); } },
    { z: 0.45, draw: () => { calCard(250, 520, 1.0, 'NOV', '19', back(seg(t, 0.1, 0.45)), RED);
      const kg = back(seg(t, 0.4, 0.8)); if (kg > 0) withT(700, 500, kg, 0, () => { glow(0, 0, 300, '#9D7BFF', 0.4); txtStroke('GTA 6', 0, 0, 140, C.white, C.ink, 12); });
      consoleBox(700, 1120, 0.8, t); trophy(250, 1130, 0.7, t); SP.question(t, 480, 860, D * 0.45, 1.2); } },
    { z: 0.85, draw: () => { floorV(1200, '#141A30', '#080A18'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.06, ease(t / d)));
  chipV('RECORD TODEGA?', CX, 1010, back(seg(t, D * 0.5, D * 0.5 + 0.35)), GOLD, 56, C.ink);
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1C2440'); bokeh(t, 14, GOLD, 61); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 64px Oswald'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -64, w, 128, 36), col, C.ink, 5); P(poly([-20, 62, 10, 62, -30, 100]), col, C.ink, 5); txt(s, 0, 3, 64, C.ink); }); };
      bub('PEHLE DIN KITNA?', 470, 500, 0.3, '#2BFF88'); bub('$ ? ? ?', 330, 760, 0.8, GOLD); bub('AAPKA ANDAZA?', 560, 980, 1.2, '#9DC4FF');
      floorV(1240, '#1B2236', '#0B1020'); shadow(820, 1240, 110); person(820, 1240, 'mahila', { t, s: 1.05, look: -0.3, mood: 0.6, arms: [[0.3, 0.2], [-2.1, -0.4]] }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('COMMENT KARO', CX, 340, back(seg(t, 0.1, 0.45)), GOLD, 46, C.ink);
  vignette();
};
