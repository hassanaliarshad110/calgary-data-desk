// ===== Awazzzz GTA blitz #11 — "GTA khelne se log hinsak bante hain? Myth vs research" (FACT: Oxford Internet Institute 2019,
// ~1,000 British 14-15 year olds, no relationship between violent-game time and aggressive behaviour; APA 3 Mar 2020: insufficient
// evidence of a causal link to violent behaviour; small reliable association with aggressive outcomes like yelling/pushing,
// hard to extend to more violent outcomes; APA President: attributing violence to gaming not scientifically sound)
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters; "GTA" set in Oswald (our font). No maps.
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


// ---------- own generic drawings (new for #11) ----------
function gamepad(x, y, s, t, col = '#2A2F3E') { withT(x, y, s, Math.sin(t * 2) * 0.04, () => { shadow(0, 130, 200, 0.35);
  P(rr(-200, -80, 400, 160, 80), col, C.ink, 7); P(circ(-150, 40, 70), col, C.ink, 7); P(circ(150, 40, 70), col, C.ink, 7); P(rr(-170, -60, 340, 120, 60), col, null);
  P(rr(-130, -14, 90, 28, 6), '#C9D3E6', null); P(rr(-99, -45, 28, 90, 6), '#C9D3E6', null);
  [[110, -30, GOLD], [150, 0, RED], [110, 30, GREEN], [70, 0, CYAN]].forEach(([bx, by, c], i) => P(circ(bx, by, 16 + (Math.sin(t * 6 + i) > 0.7 ? 3 : 0)), c, C.ink, 3));
  glow(0, 0, 260, CYAN, 0.12); }); }
function uniHall(x, y, s, t) { withT(x, y, s, 0, () => { shadow(0, 10, 360, 0.4); // generic columned university hall (no real building)
  P(poly([-330, -330, 0, -470, 330, -330]), '#D8CDB4', C.ink, 6); P(rr(-340, -335, 680, 40, 6), '#C9BC9F', C.ink, 5);
  for (let i = 0; i < 6; i++) P(rr(-300 + i * 112, -295, 50, 270, 8), '#EDE5D2', C.ink, 4);
  P(rr(-360, -28, 720, 34, 6), '#C9BC9F', C.ink, 5); P(circ(0, -395, 34), '#F4D06F', C.ink, 4); glow(0, -150, 300, '#FFE7A8', 0.15 + 0.05 * Math.sin(t * 2)); }); }
function clipboardV(x, y, s, inner) { withT(x, y, s, 0, () => { shadow(0, 10, 160, 0.4); // studio PRP-056 clipboard, enlarged; inner draws on the paper
  P(rr(-180, -480, 360, 480, 20), '#A0522D', C.ink, 7); P(rr(-150, -430, 300, 400, 8), '#FFFFFF', null); P(rr(-80, -510, 160, 68, 16), '#ADB5BD', C.ink, 5);
  if (inner) inner(); }); }
function scaleV(x, y, s, tilt, kL, kR) { withT(x, y, s, 0, () => { shadow(0, 10, 220, 0.4); // balance scale: left pan heavy (claim), right pan light (evidence)
  P(rr(-14, -420, 28, 420, 8), '#B8860B', C.ink, 5); P(rr(-120, -20, 240, 30, 10), '#B8860B', C.ink, 5); P(circ(0, -430, 26), GOLD, C.ink, 5);
  withT(0, -420, 1, tilt, () => { P(rr(-300, -10, 600, 20, 8), GOLD, C.ink, 5);
    [[-280, kL, 'DAAVA'], [280, kR, 'SABOOT']].forEach(([px, k, lab]) => { ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px - 80, 150); ctx.moveTo(px, 0); ctx.lineTo(px + 80, 150); ctx.stroke();
      withT(px, 150, 1, -tilt, () => { P(poly([-110, 0, 110, 0, 80, 40, -80, 40]), GOLD, C.ink, 5); if (k > 0) txtStroke(lab, 0, -30, 44, C.white, C.ink, 7); }); }); }); }); }
function stamp(s, x, y, k, col = RED, size = 70, rot = -0.12) { if (k <= 0) return; const z = 1 + 1.5 * (1 - k); alpha(k, () => withT(x, y, z, rot, () => {
  ctx.font = `700 ${size}px Oswald`; const w = ctx.measureText(s).width + 60; ctx.lineWidth = 9; ctx.strokeStyle = col; ctx.beginPath(); ctx.roundRect(-w / 2, -size * 0.8, w, size * 1.6, 16); ctx.stroke(); txt(s, 0, 4, size, col); })); }
function bubbleV(s, x, y, k, col, size = 54, tail = -1) { if (k <= 0) return; withT(x, y, k, 0, () => { ctx.font = `700 ${size}px Oswald`; const w = ctx.measureText(s).width + 70;
  P(rr(-w / 2, -size, w, size * 2, size * 0.6), col, C.ink, 5); P(poly([tail * 30, size - 4, tail * 70, size + 40, tail * 70 - tail * 40 , size - 4]), col, C.ink, 5); P(rr(-w / 2 + 6, -size + 6, w - 12, size * 2 - 12, size * 0.5), col, null); txt(s, 0, 3, size, C.ink); }); }

// ---------- spoken opening hook: "Kya GTA jaise games khelkar log hinsak bante hain?" ----------
DRAWV.hook1 = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#1A0A14', '#3A1028'); bokeh(t, 14, RED, 5); SP.speedLines(t, CX, 700, 18, 0.14); } },
    { z: 0.45, draw: () => { gamepad(CX, 620, 1.25 + 0.04 * Math.sin(t * 5), t); SP.question(t, 820, 400, 0.5, 1.2); SP.question(t, 240, 430, 0.9, 0.9);
      const kg = back(seg(t, 1.9, 2.3)); if (kg > 0) withT(CX, 900, kg, -0.03, () => { P(rr(-360, -70, 720, 140, 32), RED, C.ink, 6); txt('HINSAK BANTE HAIN?', 0, 4, 64, C.white); }); } },
    { z: 0.9, draw: () => { floorV(1225, '#24101C', '#0E060A'); shadow(200, 1225, 90); person(200, 1225, 'yuva', { t, s: 1.0, look: 0.5, mood: 0.2 }); shadow(880, 1225, 90); person(880, 1225, 'mahila', { t, s: 0.95, look: -0.5, mood: 0.3 }); } },
  ], drift(t, d, 16), 0, lerp(1.0, 1.08, ease(t / d)));
  vignette();
};

// ---------- n01 Oxford 2019: ~1,000 British teenagers (14-15) ----------
DRAWV.oxford = (t, d) => {
  const D = LINES.n01.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1226', '#26345E'); bokeh(t, 10, '#9DC4FF', 9); moonV(860, 300, 40); } },
    { z: 0.3, draw: () => { uniHall(CX, 760, 1.05, t); } },
    { z: 0.6, draw: () => { const k = back(seg(t, 0.15, 0.5)); if (k > 0) withT(CX, 330, k, 0, () => { P(rr(-320, -80, 640, 160, 34), 'rgba(10,14,24,0.9)', GOLD, 6); txtStroke('OXFORD · 2019', 0, 6, 86, GOLD, C.ink, 8); });
      crowd(t, 880, 5, 11, seg(t, D * 0.35, D * 0.75), 1, 4);
      if (t > D * 0.35) SP.counter(t, D * 0.35, { x: CX, y: 1080, from: 0, to: 1000, dur: D * 0.4, pre: '~', suffix: ' TEENAGERS', size: 92, col: C.white }); } },
    { z: 0.9, draw: () => { floorV(1230, '#141A30', '#080A18'); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.06, ease(t / d)));
  chipV('14-15 SAAL · UK', CX, 1175, back(seg(t, D * 0.6, D * 0.6 + 0.35)), C.white, 36, C.ink);
  srcChip('SOURCE: University of Oxford (13 Feb 2019)', seg(t, 0.5, 1));
  vignette();
};

// ---------- n02 result: no relationship between violent-game time and aggressive behaviour ----------
DRAWV.result = (t, d) => {
  const D = LINES.n02.dur, kl = easeOut(seg(t, D * 0.3, D * 0.75));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#06201A', '#0E4A3A'); bokeh(t, 12, GREEN, 13); } },
    { z: 0.5, draw: () => { clipboardV(CX, 1090, 1.45, () => {
        ctx.strokeStyle = '#2a1c14'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-120, -380); ctx.lineTo(-120, -90); ctx.lineTo(125, -90); ctx.stroke();
        txt('GAMING TIME →', 0, -60, 26, '#2a1c14', 'Oswald', 700); withT(-140, -235, 1, -1.5708, () => txt('GUSSA', 0, 0, 24, '#2a1c14', 'Oswald', 700));
        for (let i = 0; i < 9; i++) { const px = -100 + i * 26, py = -170 - Math.sin(i * 2.3) * 22; if (kl * 9 > i) P(circ(px, py, 7), '#3D5A99', null); }
        if (kl > 0) { ctx.strokeStyle = RED; ctx.lineWidth = 6; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.moveTo(-105, -170); ctx.lineTo(-105 + 220 * kl, -170); ctx.stroke(); ctx.setLineDash([]); }
        txt('VIOLENT GAMES vs BARTAAV', 0, -405, 22, '#2a1c14', 'Oswald', 700); }); } },
    { z: 0.9, draw: () => { floorV(1180, '#0A2A20', '#04120C'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('NATIJA?', CX, 300, back(seg(t, 0.1, 0.45)), C.white, 56, C.ink);
  stamp('KOI RISHTA NAHI MILA', CX, 1095, seg(t, D * 0.72, D * 0.72 + 0.3), GREEN, 66);
  srcChip('Oxford Internet Institute · Royal Society Open Science (2019)', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- n03 APA 2020: insufficient scientific evidence of a causal link to violent behaviour ----------
DRAWV.apa = (t, d) => {
  const D = LINES.n03.dur, tilt = -0.28 * easeOut(seg(t, D * 0.55, D * 0.85));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0A0F24', '#2A1F5A'); bokeh(t, 14, '#9D7BFF', 21); } },
    { z: 0.5, draw: () => { calCard(250, 400, 0.85, 'MARCH', '2020', back(seg(t, 0.1, 0.45)), '#5B3D8A');
      const ka = back(seg(t, 0.3, 0.65)); if (ka > 0) withT(670, 400, ka, 0, () => { P(rr(-250, -110, 500, 220, 30), 'rgba(10,14,24,0.92)', C.white, 5); txtStroke('APA', 0, -20, 100, C.white, C.ink, 8); txt('AMERICAN PSYCHOLOGICAL ASSN.', 0, 62, 26, '#C9D3E6', 'Oswald', 600); });
      alpha(seg(t, D * 0.3, D * 0.45), () => scaleV(CX, 1080, 1.05, tilt, 1, 1)); } },
    { z: 0.9, draw: () => { floorV(1170, '#141A30', '#080A18'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('GAMES → HINSAK BARTAAV?', CX, 600, back(seg(t, D * 0.25, D * 0.25 + 0.35)), C.white, 44, C.ink);
  stamp('SABOOT NAAKAAFI', CX, 1110, seg(t, D * 0.8, D * 0.8 + 0.3), GOLD, 64, -0.08);
  srcChip('SOURCE: APA press release (3 Mar 2020)', seg(t, 0.5, 1));
  vignette();
};

// ---------- n04 twist: small reliable association with yelling/pushing; hard to extend to serious violence ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n04.dur, u = t - 0.25;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#140A1E', '#3A1A3E'); bokeh(t, 10, GOLD, 4); SP.speedLines(t, CX, 700, 18, 0.12); } },
    { z: 0.5, draw: () => {
      const kp = seg(u, 0.7, 1.1), sh = u > D * 0.25 && u < D * 0.62 ? Math.sin(u * 30) * 4 : 0;
      alpha(kp, () => { shadow(330, 1000, 100); person(330 + sh, 1000, 'yuva', { t, s: 1.15, look: 0.6, mood: 0, talk: 0.8 * (Math.sin(u * 14) > 0 ? 1 : 0.3), arms: [[0.4, 0.3], [-1.3, -0.2]] });
        shadow(720, 1000, 100); person(720 - Math.max(0, Math.sin(u * 5)) * 18, 1000, 'mahila', { t, s: 1.1, look: -0.6, mood: 0.2, arms: [[1.4, 0.2], [-0.3, -0.2]] });
        bubbleV('!!!', 300, 580, back(seg(u, D * 0.3, D * 0.3 + 0.3)), '#FFB4B4', 60, 1); bubbleV('DHAKKA!', 720, 600, back(seg(u, D * 0.4, D * 0.4 + 0.3)), '#FFD8A8', 48, -1); });
      const kc = back(seg(u, D * 0.33, D * 0.33 + 0.35)); if (kc > 0 && u < D * 0.66) withT(CX, 340, kc, 0, () => { P(rr(-420, -90, 840, 180, 30), 'rgba(10,14,24,0.92)', GOLD, 6); txt('CHHOTA SA RISHTA', 0, -32, 56, GOLD); txt('CHILLAANA · DHAKKA', 0, 40, 46, C.white, 'Oswald', 700); });
      const kb = back(seg(u, D * 0.66, D * 0.66 + 0.35)); if (kb > 0) withT(CX, 360, kb, -0.02, () => { glow(0, 0, 380, RED, 0.3); P(rr(-430, -100, 860, 200, 30), 'rgba(10,14,24,0.94)', RED, 7); txt('BADI HINSA SE', 0, -34, 56, C.white); txt('JODNA MUSHKIL', 0, 42, 62, '#FF8A8A'); }); } },
    { z: 0.9, draw: () => { floorV(1010, '#1E1028', '#0E0814'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  if (t < 1.6) alpha(1 - seg(t, 1.2, 1.6), () => { glow(CX, 650, 500, GOLD, 0.4); txtStroke('TWIST!', CX, 650, 200, GOLD, C.ink, 18); });
  srcChip('SOURCE: APA (3 Mar 2020): small, reliable association', seg(u, 0.3, 0.8));
  vignette();
};

// ---------- n05 payoff: no firm proof for "GTA khelo, hinsak bano"; APA President quote ----------
DRAWV.payoff = (t, d) => {
  const D = LINES.n05.dur, kq = back(seg(t, D * 0.45, D * 0.45 + 0.35));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1A2A', '#18405A'); bokeh(t, 12, CYAN, 31); } },
    { z: 0.5, draw: () => { const km = back(seg(t, 0.1, 0.45)); if (km > 0) withT(CX, 360, km * (1 - 0.1 * seg(t, D * 0.45, D * 0.6)), 0, () => { P(rr(-400, -110, 800, 220, 30), '#F2EEE2', C.ink, 6); txt('"GTA KHELO,', 0, -36, 64, C.ink); txt('HINSAK BANO"', 0, 44, 64, C.ink); });
      stamp('PAKKA SABOOT NAHI', CX, 560, seg(t, D * 0.22, D * 0.22 + 0.3), RED, 62, -0.1);
      if (kq > 0) withT(CX, 810, kq, 0, () => { P(rr(-430, -170, 860, 340, 34), 'rgba(10,14,24,0.92)', CYAN, 6); txt('APA PRESIDENT:', 0, -110, 38, CYAN, 'Oswald', 700);
        txt('"HINSA KA DOSH GAMES PAR', 0, -30, 50, C.white); txt('DAALNA SCIENTIFICALLY', 0, 36, 50, C.white); txt('SAHI NAHI"', 0, 102, 50, GOLD); }); } },
    { z: 0.9, draw: () => { floorV(1190, '#0E2232', '#060E16'); gamepad(250, 1120, 0.55, t); shadow(820, 1190, 90); person(840, 1190, 'mahila', { t, s: 0.8, look: -0.4, mood: 0.6, arms: [[0.3, 0.2], [-2.0, -0.5]] }); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  srcChip('SOURCE: APA (3 Mar 2020), Sandra L. Shullman · Hindi anuvaad', seg(t, D * 0.45, D * 0.45 + 0.5));
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1C2440'); bokeh(t, 14, GOLD, 61); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 72px Oswald'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -70, w, 140, 40), col, C.ink, 5); P(poly([-20, 68, 10, 68, -30, 106]), col, C.ink, 5); txt(s, 0, 3, 72, C.ink); }); };
      bub('SAHI?', 300, 560, 0.9, GREEN); bub('GALAT?', 560, 780, 1.4, '#FF8A8A');
      floorV(1240, '#1B2236', '#0B1020'); shadow(830, 1240, 110); person(830, 1240, 'mahila', { t, s: 1.05, look: -0.3, mood: 0.6, arms: [[0.3, 0.2], [-2.1, -0.4]] }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('AAPKI RAAY? COMMENT KARO', CX, 330, back(seg(t, 0.1, 0.45)), GOLD, 46, C.ink);
  vignette();
};
