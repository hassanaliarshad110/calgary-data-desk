// ===== Awazzzz GTA blitz #28 — "GTA Online paisa vs asli paisa: Shark Card ki keemat rupaye mein" (FACT: GTA 5's GTA Online sells GTA$ as Shark Cards; Megalodon Shark Cash Card = GTA$10,000,000, PlayStation Store India Rs 5,799 (sale Rs 4,929, 15% off, ends 30 Nov 2026; read 18 Nov 2026); 10,000,000/5,799 = 1,724 GTA$ per rupee; GTA 6 Standard Rs 5,999 (MySmartPrice, Tech2); GTABase (Nov 2026): most expensive vehicle Buckingham Luxor Deluxe GTA$10,000,000.)
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters; "GTA 6" in Oswald (our font). No PlayStation logo (store named in text only). No maps.
// Studio library (select_assets.py): PRP-051 bill (billV), PRP-052 coins (SP.coins), PRP-053 moneyStack (moneyStackV), PRP-017 phone (SP.phone), GFX-005 counter (SP.counter), VFX-011 impactStar (TWIST), VFX-015 stars, VFX-019 question (SP.question).
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


// ---------- own generic drawings + library ports (#13) ----------
const NIGHT1 = '#070B1C', NIGHT2 = '#1A1E48', PURP = '#9D7BFF';
function midClock(x, y, s, k, g = 0) { const m = lerp(11 * 60 + 50, 12 * 60, clamp(k)); bigClock(x, y, s, Math.floor(m / 60), m % 60, g); }
function bigClock(x, y, s, hh, mm, glowK = 0) { withT(x, y, s, 0, () => { if (glowK > 0) glow(0, 0, 360, GOLD, 0.45 * glowK); shadow(0, 230, 200, 0.4);
  P(circ(0, 0, 200), '#FFFDF5', C.ink, 10); P(circ(0, 0, 182), null, '#D9D2BE', 4);
  for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, r1 = i % 5 ? 168 : 150; line(Math.sin(a) * r1, -Math.cos(a) * r1, Math.sin(a) * 176, -Math.cos(a) * 176, C.ink, i % 5 ? 3 : 8); }
  txt('12', 0, -118, 44, C.ink, 'Oswald', 700);
  const ha = ((hh % 12) + mm / 60) * Math.PI / 6, ma = mm * Math.PI / 30;
  ctx.lineCap = 'round'; line(0, 0, Math.sin(ha) * 95, -Math.cos(ha) * 95, C.ink, 16); line(0, 0, Math.sin(ma) * 145, -Math.cos(ma) * 145, C.ink, 10); P(circ(0, 0, 16), RED, C.ink, 4); }); }
// GFX-014 clockBug, enlarged for portrait: city chip + IST time
function cityClock(x, y, k, city, sub, time, col = GOLD, w = 820) { if (k <= 0) return; withT(x, y, back(k), 0, () => { shadow(0, 90, w / 2, 0.35);
  P(rr(-w / 2, -80, w, 160, 26), 'rgba(10,14,24,0.92)', col, 5); P(rr(-w / 2, -80, 22, 160, [26, 0, 0, 26]), col, null);
  SP.clock(-w / 2 + 110, 0, 0.8, 0); txt(city, -w / 2 + 210, -24, 52, C.white, 'Oswald', 700, 'left'); txt(sub, -w / 2 + 210, 36, 32, '#AFC0DA', 'Oswald', 600, 'left');
  txt(time, w / 2 - 40, 0, 54, col, 'Oswald', 700, 'right'); }); }
// GFX-020 timeline, ported vertical
function rollTimeline(t, t0, x, y0, h, ev, dur = 2.4) { const k = easeInOut(clamp((t - t0) / dur)); line(x, y0, x, y0 + h, 'rgba(175,192,218,0.35)', 8); line(x, y0, x, y0 + h * k, GOLD, 8);
  ev.forEach(([lab, sub, tm, col], i) => { const py = y0 + h * i / (ev.length - 1), on = k * (ev.length - 1) >= i - 0.01, s = on ? back(clamp((k * (ev.length - 1) - i + 0.3) / 0.3)) : 0;
    P(circ(x, py, 14 * s + 8), on ? col : '#2A3348', C.ink, 4); if (s > 0) withT(x + 50, py, s, 0, () => { P(rr(0, -70, 760, 140, 22), 'rgba(10,14,24,0.9)', col, 4);
      txt(lab, 30, -22, 48, C.white, 'Oswald', 700, 'left'); txt(sub, 30, 34, 30, '#AFC0DA', 'Oswald', 600, 'left'); txt(tm, 730, 0, 48, col, 'Oswald', 700, 'right'); }); }); }
function nightCity(t, y, seed = 3) { skyline(y, '#151A3A', seed, 420, '#FFD27A', 70); }
function tvSet(x, y, s, t, inner) { withT(x, y, s, 0, () => { shadow(0, 260, 380, 0.4); P(rr(-380, -230, 760, 440, 22), '#15181F', C.ink, 7);
  ctx.save(); ctx.beginPath(); ctx.roundRect(-356, -208, 712, 396, 10); ctx.clip(); ctx.fillStyle = grad(-208, 188, '#1B2A5A', '#3A1E5E'); ctx.fillRect(-356, -208, 712, 396); if (inner) inner(); ctx.restore();
  P(rr(-30, 210, 60, 40, 6), '#15181F', C.ink, 4); P(rr(-160, 246, 320, 18, 9), '#15181F', C.ink, 4); }); }
function progBar(x, y, w, k, label, col = GREEN) { P(rr(x - w / 2, y - 26, w, 52, 26), '#0E1220', C.ink, 4); if (k > 0) P(rr(x - w / 2 + 6, y - 20, (w - 12) * k, 40, 20), col, null); txt(label, x, y + 2, 30, k > 0.5 ? C.ink : C.white, 'Oswald', 700); }
function moonNight(t) { moonV(860, 300, 60); for (let i = 0; i < 30; i++) { const a = 0.3 + 0.7 * Math.abs(Math.sin(t * 1.5 + i)); P(circ(rnd(i + 5) * W, rnd(i * 3 + 1) * 700, 2 + rnd(i) * 2), `rgba(255,255,255,${a * 0.7})`, null); } }
function impactStarV(t, x, y, t0, word = 'TWIST!', size = 1) { const k = t - t0; if (k < 0 || k > 1.3) return; const s = back(clamp(k / 0.18)) * size * (1 + 0.05 * Math.sin(k * 40)); const a = k > 1.0 ? 1 - (k - 1.0) / 0.3 : 1;
  alpha(a, () => withT(x, y, s, -0.12, () => { ctx.beginPath(); for (let i = 0; i < 24; i++) { const ang = i / 24 * 6.2832, rad = i % 2 ? 150 : 250 + rnd(i) * 40; ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad * 0.75); } ctx.closePath(); ctx.fillStyle = '#ffd166'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#2a1c14'; ctx.stroke(); txtStroke(word, 0, 8, 120, C.red, '#fff', 12); })); }
function easeInOut(u) { u = clamp(u); return u * u * (3 - 2 * u); }
function storeTag(x, y, s, k, name, col) { if (k <= 0) return; withT(x, y, back(k) * s, 0, () => { shadow(0, 70, 150, 0.35); P(rr(-150, -60, 300, 120, 24), col, C.ink, 5); P(rr(-118, -34, 56, 68, 10), 'rgba(255,255,255,0.9)', C.ink, 3); P(rr(-110, -14, 40, 6, 3), col, null);
  txt(name, 40, -14, 40, C.white, 'Oswald', 700); txt('STORE', 40, 30, 30, C.white, 'Oswald', 700); }); }


// ---------- own generic drawings + library ports (#14) ----------
// PRP-030 car (car2D), PRP-031 bus, PRP-033 truck ported from animation-studio engine/props.js + sets.js to the kit ctx helpers (no text/branding).
const ROAD1 = '#2B2F3A', ROAD2 = '#15171E';
function carV(x, y, s, col = '#E63946', t = 0, flip = false) { withT(x, y, s, 0, () => { if (flip) ctx.scale(-1, 1); shadow(0, 0, 150, 0.4);
  P(rr(-120, -70, 240, 50, 18), col, C.ink, 4); P(poly([-70, -70, -45, -115, 50, -115, 80, -70]), col, C.ink, 4); alpha(0.25, () => P(poly([-70, -70, -45, -115, 50, -115, 80, -70]), '#000', null));
  P(poly([-58, -74, -38, -106, -5, -106, -5, -74]), '#BDE0FE', null); P(poly([5, -74, 5, -106, 45, -106, 66, -74]), '#BDE0FE', null);
  for (const wx of [-70, 70]) { P(circ(wx, -20, 24), '#222', C.ink, 3); P(circ(wx, -20, 10), '#BBB', null); withT(wx, -20, 1, t * 8, () => line(-9, 0, 9, 0, '#666', 3)); }
  P(rr(108, -60, 12, 12, 3), '#FFD166', null); }); }
function truckV(x, y, s, col = '#F4A261') { withT(x, y, s, 0, () => { shadow(0, 0, 330, 0.4); P(rr(-320, -260, 420, 230, 10), '#E9ECEF', C.ink, 5); P(rr(100, -200, 200, 170, 20), col, C.ink, 5); P(rr(170, -185, 100, 70, 10), '#BDE0FE', C.ink, 3);
  for (const wx of [-230, -120, 210]) { P(circ(wx, -26, 34), '#222', C.ink, 4); P(circ(wx, -26, 13), '#BBB', null); } }); }
function busV(x, y, s, col = '#C1121F') { withT(x, y, s, 0, () => { shadow(0, 0, 340, 0.4); P(rr(-330, -230, 660, 200, 26), col, C.ink, 5); for (let i = 0; i < 6; i++) P(rr(-300 + i * 100, -200, 82, 70, 8), '#BDE0FE', C.ink, 3);
  ctx.fillStyle = '#fff'; ctx.fillRect(-330, -120, 660, 16); P(rr(250, -200, 70, 170, 8), '#9BC5E8', C.ink, 3); for (const wx of [-220, 200]) { P(circ(wx, -28, 36), '#222', C.ink, 4); P(circ(wx, -28, 14), '#BBB', null); } }); }
// perspective road: vanishing point (CX, yH), dashes scroll toward the viewer
function roadV(t, yH, speed = 1) { ctx.fillStyle = grad(yH, H, ROAD1, ROAD2); ctx.beginPath(); ctx.moveTo(CX - 40, yH); ctx.lineTo(CX + 40, yH); ctx.lineTo(W + 500, H + 200); ctx.lineTo(-500, H + 200); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4A5163'; ctx.beginPath(); ctx.moveTo(-300, yH); ctx.lineTo(CX - 40, yH); ctx.lineTo(-500, H + 200); ctx.lineTo(-300, H + 200); ctx.fill(); ctx.beginPath(); ctx.moveTo(W + 300, yH); ctx.lineTo(CX + 40, yH); ctx.lineTo(W + 500, H + 200); ctx.lineTo(W + 300, H + 200); ctx.fill();
  for (let i = 0; i < 9; i++) { const u = ((i / 9) + t * 0.35 * speed) % 1, k = Math.pow(u, 2.2), y = yH + k * (H + 200 - yH), w = 4 + 36 * k, h = 10 + 120 * k; ctx.fillStyle = '#F4D06F'; ctx.fillRect(CX - w / 2, y, w, h); }
  line(CX - 40, yH, -500, H + 200, '#FFFFFF', 6); line(CX + 40, yH, W + 500, H + 200, '#FFFFFF', 6); }
function speedo(x, y, s, val, max = 240, glowK = 0) { withT(x, y, s, 0, () => { if (glowK > 0) glow(0, 0, 330, RED, 0.5 * glowK); shadow(0, 210, 200, 0.4);
  P(circ(0, 0, 200), '#11141C', C.ink, 10); ctx.lineCap = 'butt';
  ctx.lineWidth = 26; ctx.strokeStyle = '#2BFF88'; ctx.beginPath(); ctx.arc(0, 0, 160, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * 0.5); ctx.stroke();
  ctx.strokeStyle = GOLD; ctx.beginPath(); ctx.arc(0, 0, 160, Math.PI * 1.5, Math.PI * 1.85); ctx.stroke(); ctx.strokeStyle = RED; ctx.beginPath(); ctx.arc(0, 0, 160, Math.PI * 1.85, Math.PI * 2.25); ctx.stroke();
  for (let i = 0; i <= 12; i++) { const a = Math.PI * 0.75 + Math.PI * 1.5 * i / 12; line(Math.cos(a) * 128, Math.sin(a) * 128, Math.cos(a) * 112, Math.sin(a) * 112, '#DDE3EE', 4); if (i % 2 === 0) txt(String(i * 20), Math.cos(a) * 86, Math.sin(a) * 86, 26, '#AFC0DA', 'Oswald', 600); }
  const a = Math.PI * 0.75 + Math.PI * 1.5 * clamp(val / max); ctx.lineCap = 'round'; line(0, 0, Math.cos(a) * 150, Math.sin(a) * 150, RED, 12); P(circ(0, 0, 22), '#DDE3EE', C.ink, 4);
  txtStroke(String(Math.round(val)), 0, 110, 64, C.white, C.ink, 6); txt('KM/H', 0, 160, 26, '#AFC0DA', 'Oswald', 600); }); }
function limitSign(x, y, s, k) { if (k <= 0) return; withT(x, y, back(k) * s, 0, () => { line(0, 0, 0, 260, '#8A93A6', 14); P(circ(0, 0, 110), C.white, RED, 22); txt('SPEED', 0, -24, 40, C.ink, 'Oswald', 700); txt('LIMIT', 0, 26, 40, C.ink, 'Oswald', 700); }); }
// challan slip (generic paper receipt, no emblems)
function challan(x, y, s, k, head, amt, sub, col = RED, rot = -0.04) { if (k <= 0) return; withT(x, y, back(k) * s, rot, () => { shadow(0, 250, 300, 0.35);
  P(rr(-300, -230, 600, 460, 18), '#FFFDF5', C.ink, 6); P(rr(-300, -230, 600, 90, [18, 18, 0, 0]), col, C.ink, 6); txt('E-CHALLAN', 0, -184, 46, C.white, 'Oswald', 700);
  txt(head, 0, -100, 34, '#4A5163', 'Oswald', 700); for (let i = 0; i < 3; i++) line(-240, 150 + i * 0, 240, 150 + i * 0, '#D9D2BE', 3);
  txtStroke(amt, 0, 10, 80, C.ink, '#FFFDF5', 2); txt(sub, 0, 110, 32, '#4A5163', 'Oswald', 600);
  for (let i = 0; i < 12; i++) P(circ(-275 + i * 50, 230, 12), '#0E1220', null); }); }
function lawBook(x, y, s, k, l1, l2) { if (k <= 0) return; withT(x, y, back(k) * s, -0.03, () => { shadow(0, 190, 260, 0.4);
  P(rr(-250, -180, 500, 360, 20), '#7A2E2E', C.ink, 6); P(rr(-232, -164, 30, 328, 8), '#5A1E1E', null); P(rr(-180, -120, 400, 240, 14), null, GOLD, 4);
  txt(l1, 20, -50, 34, GOLD, 'Oswald', 700); txt(l2, 20, 30, 74, C.white, 'Oswald', 700); }); }
function licenceCard(x, y, s, k) { if (k <= 0) return; withT(x, y, back(k) * s, 0.04, () => { shadow(0, 210, 330, 0.4);
  P(rr(-340, -200, 680, 400, 30), '#E6F0FA', C.ink, 6); P(rr(-340, -200, 680, 86, [30, 30, 0, 0]), '#2F5BD8', C.ink, 6); txt('DRIVING LICENCE', 0, -156, 48, C.white, 'Oswald', 700);
  P(rr(-300, -80, 200, 240, 18), '#B8C6DA', C.ink, 4); P(circ(-200, 0, 46), '#D9A77E', null); P(rr(-262, 50, 124, 100, [50, 50, 10, 10]), '#3D5A99', null);
  for (let i = 0; i < 4; i++) P(rr(-60, -60 + i * 56, 340 - i * 50, 26, 13), '#B8C6DA', null); }); }
function stampV(x, y, k, word, col = RED, size = 110, rot = -0.18) { if (k <= 0) return; const s = 1 + 1.4 * (1 - easeOut(clamp(k))); alpha(clamp(k * 2), () => withT(x, y, s, rot, () => {
  ctx.font = `700 ${size}px Oswald`; const w = ctx.measureText(word).width + 70; P(rr(-w / 2, -size * 0.75, w, size * 1.5, 18), 'rgba(230,57,70,0.10)', col, 12); txt(word, 0, 6, size, col, 'Oswald', 700); })); }
function flagV(x, y, s, t) { withT(x, y, s, 0, () => { line(0, 0, 0, -320, '#C9D3E6', 10); const w = 220, h = 150, n = 6, m = 4;
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const wv = Math.sin(t * 6 + i * 0.8) * 10; ctx.fillStyle = (i + j) % 2 ? '#111' : '#F4F4F4';
    ctx.beginPath(); const x0 = i * w / n, y0 = -320 + j * h / m + wv * i / n; ctx.rect(x0, y0, w / n + 1, h / m + 1); ctx.fill(); } P(rr(0, -320, w, h, 2), null, C.ink, 4); }); }
function barsIcon(x, y, s, k) { if (k <= 0) return; withT(x, y, back(k) * s, 0, () => { P(rr(-70, -80, 140, 160, 14), '#2A3348', C.ink, 5); for (let i = 0; i < 4; i++) P(rr(-52 + i * 33, -80, 10, 160, 4), '#AFC0DA', null); P(rr(-70, -10, 140, 12, 4), '#AFC0DA', null); }); }
function penaltyRow(x, y, k, lead, items, col) { if (k <= 0) return; withT(x, y, back(k), 0, () => { P(rr(-450, -120, 900, 240, 28), 'rgba(10,14,24,0.92)', col, 5);
  txt(lead, -410, -70, 44, col, 'Oswald', 700, 'left'); items.forEach(([a, b], i) => { const cx = -300 + i * 300; txt(a, cx, 10, a.length > 9 ? 40 : 50, C.white, 'Oswald', 700); txt(b, cx, 70, 30, '#AFC0DA', 'Oswald', 600); if (i) txt('YA', cx - 150, 30, 34, GOLD, 'Oswald', 700); }); }); }


// ---------- own generic drawings (#25) ----------
function signalV(x, y, s, state, glowK = 1) { withT(x, y, s, 0, () => { // generic 3-lamp traffic signal on a pole; state 0 red,1 amber,2 green
  P(rr(-14, 150, 28, 520, 8), '#5A6478', C.ink, 4); shadow(0, 670, 90, 0.4);
  P(rr(-95, -230, 190, 400, 40), '#1B1F29', C.ink, 7); P(rr(-118, -248, 236, 24, 10), '#2A303E', C.ink, 4);
  const cols = [RED, '#FFB703', GREEN];
  for (let i = 0; i < 3; i++) { const on = i === state, cy = -140 + i * 118;
    P(rr(-78, cy - 66, 156, 30, [14, 14, 0, 0]), '#2A303E', null);
    if (on) glow(0, cy, 210, cols[i], 0.55 * glowK);
    P(circ(0, cy, 50), on ? cols[i] : '#323846', C.ink, 4); if (on) alpha(0.5, () => P(circ(-16, cy - 16, 14), '#FFFFFF', null)); } }); }
function coneV(x, y, s) { withT(x, y, s, 0, () => { shadow(0, 0, 60, 0.35); P(rr(-56, -14, 112, 16, 4), '#F77F00', C.ink, 3); P(poly([-34, -14, -10, -130, 10, -130, 34, -14]), '#F77F00', C.ink, 3); P(poly([-25, -50, 25, -50, 19, -76, -19, -76]), '#FFFFFF', null); }); }
function barrierV(x, y, s) { withT(x, y, s, 0, () => { shadow(0, 0, 150, 0.35); for (const bx of [-120, 120]) P(rr(bx - 10, -110, 20, 110, 4), '#AFC0DA', C.ink, 3);
  P(rr(-170, -150, 340, 56, 8), '#FFFFFF', C.ink, 4); ctx.save(); ctx.beginPath(); ctx.rect(-170, -150, 340, 56); ctx.clip(); for (let i = -4; i < 8; i++) P(poly([-170 + i * 60, -94, -140 + i * 60, -94, -110 + i * 60, -150, -140 + i * 60, -150]), RED, null); ctx.restore(); }); }
function gavelV(x, y, s, a) { withT(x, y, s, 0, () => { shadow(0, 150, 170, 0.4); P(rr(-150, 110, 300, 44, 12), WOOD, C.ink, 5); P(rr(-110, 80, 220, 36, 10), '#7A4E2E', C.ink, 4);
  withT(60, 60, 1, a, () => { P(rr(-14, -300, 28, 260, 10), '#7A4E2E', C.ink, 4); withT(0, -300, 1, 0, () => { P(rr(-90, -46, 180, 92, 22), WOOD, C.ink, 5); P(rr(-100, -40, 18, 80, 6), GOLD, null); P(rr(82, -40, 18, 80, 6), GOLD, null); }); }); }); }
function pointsCard(x, y, s, k) { if (k <= 0) return; withT(x, y, back(k) * s, -0.03, () => { licenceCard(0, 0, 1, 1);
  P(rr(-30, 90, 330, 90, 45), 'rgba(10,14,24,0.85)', GOLD, 4); txt('POINTS?', 135, 138, 54, GOLD, 'Oswald', 700); }); }
function calYears(x, y, s, k) { if (k <= 0) return; withT(x, y, back(k) * s, 0.03, () => { shadow(0, 150, 150, 0.35); P(rr(-140, -140, 280, 280, 24), '#FFFDF5', C.ink, 6); P(rr(-140, -140, 280, 80, [24, 24, 0, 0]), RED, C.ink, 6);
  txt('ANDAR', 0, -98, 40, C.white, 'Oswald', 700); txt('3', 0, 30, 130, C.ink, 'Oswald', 700); txt('SAAL', 0, 105, 36, '#4A5163', 'Oswald', 700); }); }
function ruleCard(x, y, k) { if (k <= 0) return; withT(x, y, back(k), 0, () => { glow(0, 0, 420, CYAN, 0.25); P(rr(-430, -170, 860, 340, 30), 'rgba(10,14,24,0.93)', CYAN, 6);
  txt('2026 KE NAYE NIYAM', 0, -112, 44, CYAN, 'Oswald', 700); txt('1 SAAL MEIN 5+ OFFENCES', 0, -30, 62, C.white, 'Oswald', 700);
  txt('→ LICENCE PAR ACTION', 0, 50, 56, GOLD, 'Oswald', 700); txt('HO SAKTA HAI (automatic nahi)', 0, 116, 38, '#AFC0DA', 'Oswald', 600); }); }
function junction(t, yH) { ctx.fillStyle = grad(yH, H, ROAD1, ROAD2); ctx.fillRect(-300, yH, W + 600, H + 300 - yH);
  for (let i = 0; i < 8; i++) ctx.fillStyle = '#F4F4F4', ctx.fillRect(40 + i * 130, yH + 160, 80, 150); // zebra crossing
  ctx.fillStyle = '#F4F4F4'; ctx.fillRect(-300, yH + 120, W + 600, 14); /* stop line */ }

// ---------- own generic drawings (#26) ----------
function platCard(x, y, k, name, sub, col) { if (k <= 0) return; withT(x, y, back(k), 0, () => { P(rr(-200, -62, 400, 124, 26), 'rgba(10,14,24,0.92)', col, 5);
  txt(name, 0, -14, name.length > 10 ? 40 : 52, C.white, 'Oswald', 700); txt(sub, 0, 38, 28, '#AFC0DA', 'Oswald', 600); }); }
function statusRow(x, y, k, label, ok) { if (k <= 0) return; withT(x, y, back(k), 0, () => { P(rr(-430, -62, 860, 124, 26), 'rgba(10,14,24,0.92)', ok ? GREEN : RED, 5);
  txt(label, -390, 4, 50, C.white, 'Oswald', 700, 'left'); if (ok) tickMark(340, 0, 0.75, 1); else crossMark(340, 0, 0.7, 1); }); }
function gapBadge(x, y, k, big, small, col) { if (k <= 0) return; withT(x, y, back(k), -0.04, () => { glow(0, 0, 300, col, 0.4); P(rr(-260, -90, 520, 180, 90), col, C.ink, 6);
  txt(big, 0, -12, 76, C.ink, 'Oswald', 700); txt(small, 0, 52, 30, C.ink, 'Oswald', 700); }); }
function hourglassV(x, y, s, t) { withT(x, y, s, 0, () => { shadow(0, 190, 120, 0.4); const sand = (t * 0.25) % 1;
  P(rr(-110, -200, 220, 26, 10), WOOD, C.ink, 5); P(rr(-110, 174, 220, 26, 10), WOOD, C.ink, 5);
  P(poly([-90, -174, 90, -174, 12, 0, 90, 174, -90, 174, -12, 0]), 'rgba(189,224,254,0.35)', C.ink, 5);
  P(poly([-70 * (1 - sand), -150 + 140 * sand, 70 * (1 - sand), -150 + 140 * sand, 8, -6, -8, -6]), GOLD, null);
  P(poly([-80, 170, 80, 170, 80 * sand, 170 - 120 * sand, -80 * sand, 170 - 120 * sand]), GOLD, null); line(0, -6, 0, 168, GOLD, 4); }); }
function rumourCard(x, y, k) { if (k <= 0) return; withT(x, y, back(k), 0.03, () => { P(rr(-230, -90, 460, 180, 26), 'rgba(10,14,24,0.92)', '#FFB703', 5);
  txt('RUMOUR / LEAK', 0, -24, 46, '#FFB703', 'Oswald', 700); txt('= PAKKI KHABAR NAHI', 0, 36, 34, C.white, 'Oswald', 700); }); }


// ---------- own generic drawings + library ports (#28) ----------
// PRP-051 bill, PRP-052 coins (SP.coins), PRP-053 moneyStack, PRP-017 phone (SP.phone) ported from animation-studio engine/props.js (bill shows our own ₹ / G$ glyph, no branding).
const SHARK = '#3FA7D6';
function billV(x, y, s, ang = 0, col = '#52B788', sym = '₹') { withT(x, y, s, ang, () => { P(rr(-90, -45, 180, 90, 8), col, '#2a1c14', 4); P(rr(-78, -33, 156, 66, 6), null, 'rgba(0,0,0,0.25)', 3); P(circ(0, 0, 24), 'rgba(255,255,255,0.35)', '#2a1c14', 2); txt(sym, 0, 2, 30, '#1B4332', 'Oswald', 700); }); }
function moneyStackV(x, y, s, n = 6, col1 = '#52B788', col2 = '#40916C') { withT(x, y, s, 0, () => { shadow(0, 0, 130, 0.35); for (let i = 0; i < n; i++) P(rr(-110, -30 - i * 22, 220, 26, 4), i % 2 ? col1 : col2, '#2a1c14', 3); P(rr(-20, -30 - n * 22 + 4, 40, n * 22, 2), '#E9C46A', '#2a1c14', 2); }); }
// generic "game cash card": our own fin + wave pattern, no logos
function sharkCard(x, y, s, rot, k, top, big, col = SHARK) { if (k <= 0) return; withT(x, y, back(k) * s, rot, () => { shadow(0, 230, 230, 0.4); glow(0, 0, 380, col, 0.35);
  P(rr(-260, -170, 520, 340, 34), col, C.ink, 7); ctx.save(); ctx.clip(rr(-260, -170, 520, 340, 34));
  P(rr(-260, 40, 520, 140, 0), 'rgba(0,0,0,0.22)', null); for (let i = 0; i < 6; i++) P(ell(-260 + i * 104, 52, 60, 20), 'rgba(255,255,255,0.18)', null);
  P(poly([-40, 40, 40, -110, 90, 40]), '#0D3B66', C.ink, 5); ctx.restore();
  txt(top, -230, -128, 34, C.white, 'Oswald', 700, 'left'); txtStroke(big, 0, 112, 64, GOLD, C.ink, 8); }); }
function priceTag(x, y, s, rot, k, top, price, col = GOLD, strike = null) { if (k <= 0) return; withT(x, y, back(k) * s, rot, () => { shadow(0, 150, 200, 0.35);
  P(poly([-230, -110, 170, -110, 240, 0, 170, 110, -230, 110]), col, C.ink, 6); P(circ(175, 0, 18), '#1B2236', C.ink, 4);
  txt(top, -30, -58, 36, C.ink, 'Oswald', 700); txtStroke(price, -30, 22, 104, C.white, C.ink, 10); if (strike) { txt(strike, -30, 86, 30, C.ink, 'Oswald', 700); } }); }
function gameBox(x, y, s, rot, k) { if (k <= 0) return; withT(x, y, back(k) * s, rot, () => { shadow(0, 210, 170, 0.4); P(rr(-150, -200, 300, 400, 18), '#1B1F2A', C.ink, 6);
  ctx.save(); ctx.clip(rr(-140, -190, 280, 380, 12)); ctx.fillStyle = grad(-190, 190, '#FF7EB6', '#5A2A8A'); ctx.fillRect(-140, -190, 280, 380); glow(0, 40, 200, GOLD, 0.5);
  for (let i = 0; i < 5; i++) P(rr(-120 + i * 52, 90 - rnd(i + 2) * 120, 40, 200, 4), 'rgba(20,10,40,0.7)', null); ctx.restore();
  txtStroke('GTA 6', 0, -110, 86, C.white, C.ink, 10); txt('STANDARD', 0, -40, 30, C.white, 'Oswald', 700); }); }
function jetV(x, y, s, t, flip = false) { withT(x, y, s, 0, () => { if (flip) ctx.scale(-1, 1); shadow(0, 120, 380, 0.35); // generic private jet, side view
  P(poly([-160, -10, -260, -150, -200, -150, -90, -20]), '#C9D3E6', C.ink, 5);
  P(rr(-380, -40, 700, 110, 55), '#F4F6FA', C.ink, 6); P(poly([300, -40, 420, 15, 300, 70]), '#F4F6FA', C.ink, 6);
  P(rr(-380, 20, 700, 18, 4), GOLD, null); for (let i = 0; i < 7; i++) P(rr(-240 + i * 70, -18, 38, 28, 12), '#4CC9F0', C.ink, 3); P(rr(250, -18, 60, 30, [4, 18, 4, 4]), '#4CC9F0', C.ink, 3);
  P(poly([-60, 40, 140, 40, 40, 140, -20, 140]), '#C9D3E6', C.ink, 5); P(rr(-330, -70, 120, 40, 20), '#AFC0DA', C.ink, 4);
  line(-20, 70, -20, 112, C.ink, 6); line(220, 70, 220, 112, C.ink, 6); P(circ(-20, 118, 12), '#222', C.ink, 3); P(circ(220, 118, 12), '#222', C.ink, 3); }); }
function runwayV(t, yH) { ctx.fillStyle = grad(yH, H, '#2B2F3A', '#111318'); ctx.beginPath(); ctx.moveTo(CX - 60, yH); ctx.lineTo(CX + 60, yH); ctx.lineTo(W + 600, H + 200); ctx.lineTo(-600, H + 200); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 9; i++) { const u = ((i / 9) + t * 0.15) % 1, yy = yH + Math.pow(u, 2) * (H - yH), w = 6 + u * 40; P(rr(CX - w / 2, yy, w, 10 + u * 70, 4), 'rgba(255,255,255,0.75)', null); }
  for (let i = 0; i < 8; i++) { const u = i / 8, yy = yH + Math.pow(u, 2) * (H - yH); for (const sd of [-1, 1]) { const xx = CX + sd * (60 + u * 700); P(circ(xx, yy, 4 + u * 10), i % 2 ? GOLD : '#9DC4FF', null); glow(xx, yy, 30 + u * 40, GOLD, 0.25); } } }
function walletV(x, y, s, open, k = 1) { withT(x, y, s, 0, () => { shadow(0, 120, 170, 0.4); P(rr(-170, -100, 340, 220, 30), '#7A4E2E', C.ink, 6); P(rr(-150, -80, 300, 40, 14), '#5A3A22', null);
  if (open > 0) { alpha(open, () => { txt('KHAALI!', 0, 30, 54, '#FFE7C2', 'Oswald', 700); for (let i = 0; i < 3; i++) { const fx = -60 + i * 60, fy = -130 - ((k * 3 + i) % 1) * 60; alpha(0.6, () => P(circ(fx, fy, 6), '#C9D3E6', null)); } }); }
  P(rr(110, -20, 80, 70, 18), '#5A3A22', C.ink, 5); P(circ(150, 15, 12), GOLD, C.ink, 3); }); }
function balanceV(x, y, s, tilt, leftDraw, rightDraw) { withT(x, y, s, 0, () => { shadow(0, 330, 220, 0.35); P(rr(-26, 0, 52, 320, 10), '#AFC0DA', C.ink, 5); P(rr(-140, 300, 280, 40, 14), '#8A93A6', C.ink, 5);
  withT(0, 0, 1, tilt, () => { P(rr(-340, -12, 680, 24, 12), '#C9D3E6', C.ink, 5); for (const sd of [-1, 1]) { const px = sd * 300; line(px, 0, px - 90, 170, '#C9D3E6', 4); line(px, 0, px + 90, 170, '#C9D3E6', 4);
    withT(px, 170, 1, -tilt, () => { P(ell(0, 0, 130, 26), '#DDE1E7', C.ink, 5); (sd < 0 ? leftDraw : rightDraw)(); }); } }); P(circ(0, 0, 22), GOLD, C.ink, 5); }); }
function coinStackG(x, y, s, n) { withT(x, y, s, 0, () => { for (let i = 0; i < n; i++) { P(ell(0, -12 - i * 14, 46, 14), i % 2 ? '#F2C230' : '#E0A800', '#2a1c14', 3); } txt('G$', 0, -12 - (n - 1) * 14, 20, '#7A5200', 'Oswald', 700); }); }
function crownV(x, y, s, k) { if (k <= 0) return; withT(x, y, back(k) * s, -0.1, () => { glow(0, 0, 160, GOLD, 0.5); P(poly([-90, 40, -100, -50, -45, -5, 0, -70, 45, -5, 100, -50, 90, 40]), GOLD, C.ink, 6); for (const cx of [-50, 0, 50]) P(circ(cx, 18, 10), RED, C.ink, 3); }); }
function rainBills(t, n, seed, sym) { for (let i = 0; i < n; i++) { const x = rnd(i + seed) * W, y = ((rnd(i * 7 + seed) * H * 1.2 + t * (180 + rnd(i) * 160)) % (H + 300)) - 150; billV(x, y, 0.6 + rnd(i * 3) * 0.4, Math.sin(t * 2 + i) * 0.6, i % 3 ? '#52B788' : '#74C69D', sym); } }

// ---------- spoken opening hook: "1 crore GTA dollar, asli rupayon mein kitne ke?" ----------
DRAWV.hook1 = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#06192B', '#0E4D64'); bokeh(t, 14, SHARK, 3); rainBills(t, 8, 11, 'G$'); } },
    { z: 0.5, draw: () => { floorV(1180, '#0F2A3A', '#06121C');
      moneyStackV(220, 1180, 1.1, 9); moneyStackV(770, 1180, 1.0, 7, '#74C69D', '#52B788'); SP.coins(400, 1200, 1.4, 8); SP.coins(620, 1190, 1.2, 6);
      sharkCard(CX, 720, 1.05, -0.05 + wob(t, 0.4, 0.02), seg(t, 0.1, 0.5), 'GAME CASH CARD', 'GTA$ 1 CRORE'); } },
  ], drift(t, d, 14), 0, lerp(1.0, 1.08, ease(t / d)));
  SP.question(t, 840, 470, 2.0, 1.3);
  const ki = back(seg(t, 2.1, 2.5)); if (ki > 0) withT(CX, 1100, ki, -0.03, () => { glow(0, 0, 300, GOLD, 0.4); P(rr(-300, -62, 600, 124, 62), GOLD, C.ink, 6); txt('ASLI ₹ KITNE?', 0, 4, 62, C.ink); });
  vignette();
};

// ---------- n01: GTA 5's GTA Online: real money -> game money = Shark Card ----------
DRAWV.card = (t, d) => {
  const D = LINES.n01.dur, fly = easeOut(seg(t, D * 0.55, D * 0.55 + 0.6));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#071A2E', '#13445E'); bokeh(t, 12, SHARK, 9); } },
    { z: 0.5, draw: () => { floorV(1120, '#0F2A3A', '#06121C');
      // real money on the left -> arrow -> game money on the right
      moneyStackV(230, 1050, 0.95, 6); billV(230, 760, 1.2, -0.12 + wob(t, 0.5, 0.05), '#52B788', '₹');
      withT(CX, 860, 1, 0, () => { const a = seg(t, D * 0.2, D * 0.2 + 0.5); if (a > 0) { line(-120, 0, -120 + 240 * a, 0, GOLD, 16); if (a > 0.95) P(poly([130, 0, 90, -34, 90, 34]), GOLD, C.ink, 4); } });
      coinStackG(820, 1060, 1.5, 7); SP.phone(840, 790, 1.7, t, 0.6);
      sharkCard(lerp(840, CX - 40, fly), lerp(700, 540, fly), lerp(0.35, 0.95, fly), lerp(0.2, -0.04, fly), seg(t, D * 0.5, D * 0.5 + 0.3), 'SHARK CARD', 'GTA$ +++'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('GTA ONLINE (GTA 5)', CX, 290, back(seg(t, 0.05, 0.4)), GOLD, 48, C.ink);
  chipV('ASLI ₹  →  GAME KA PAISA', CX, 1160, back(seg(t, D * 0.25, D * 0.25 + 0.3)), C.white, 38, C.ink);
  vignette();
};

// ---------- n02: Megalodon = GTA$10,000,000 = 1 crore; PS Store India Rs 5,799 (sale Rs 4,929 till 30 Nov) ----------
DRAWV.mega = (t, d) => {
  const D = LINES.n02.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#04162A', '#0B3A5E'); stars(40); bokeh(t, 12, TEAL, 21); } },
    { z: 0.5, draw: () => { floorV(1200, '#0F2A3A', '#06121C');
      sharkCard(CX, 560, 1.15, -0.04 + wob(t, 0.35, 0.015), seg(t, 0.05, 0.45), 'MEGALODON · SABSE BADA', 'GTA$ 10,000,000');
      chipV('= 1 CRORE GTA$', CX, 800, back(seg(t, D * 0.22, D * 0.22 + 0.3)), GREEN, 52, C.ink);
      priceTag(CX + 10, 950, 0.95, -0.03, seg(t, D * 0.62, D * 0.62 + 0.35), 'POORI KEEMAT', '₹5,799'); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('PLAYSTATION STORE INDIA', CX, 290, back(seg(t, D * 0.5, D * 0.5 + 0.3)), C.white, 40, C.ink);
  chipV('SALE: ₹4,929 (15% OFF, 30 NOV TAK)', CX, 1108, back(seg(t, D * 0.82, D * 0.82 + 0.3)), RED, 30, C.white);
  srcChip('SOURCE: PlayStation Store India (18 Nov 2026)', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- n03: ~GTA$1,700 per rupee ----------
DRAWV.rate = (t, d) => {
  const D = LINES.n03.dur, tilt = 0.12 * Math.sin(t * 5) * Math.exp(-t * 1.2);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0A1A2E', '#1F4A5E'); bokeh(t, 12, GOLD, 31); } },
    { z: 0.5, draw: () => { floorV(1220, '#0F2A3A', '#06121C');
      balanceV(CX, 640, 1.05, tilt, () => { P(circ(0, -50, 50), '#DDE1E7', C.ink, 5); txt('₹1', 0, -48, 46, C.ink, 'Oswald', 700); }, () => { coinStackG(-60, -6, 1.0, 8); coinStackG(50, -6, 1.0, 6); });
      SP.counter(t, 0.35, { x: CX, y: 1060, from: 0, to: 1700, dur: 1.4, pre: '~', suffix: ' GTA$', size: 140, col: GOLD, label: '1 RUPAYE MEIN' }); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.06, ease(t / d)));
  chipV('10,000,000 ÷ 5,799 = 1,724', CX, 290, back(seg(t, 0.05, 0.4)), C.white, 44, C.ink);
  vignette();
};

// ---------- n04 twist: card Rs 5,799 vs GTA 6 Standard Rs 5,999 -> farq sirf Rs 200 ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n04.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1A0F2E', '#4A1E5E'); bokeh(t, 14, '#FF7EB6', 41); } },
    { z: 0.5, draw: () => { floorV(1180, '#20122E', '#0C0614');
      sharkCard(285, 640, 0.62, -0.06, seg(t, 0.4, 0.75), 'MEGALODON', 'GTA$ 1 CR');
      gameBox(715, 640, 0.95, 0.05, seg(t, D * 0.38, D * 0.38 + 0.35));
      priceTag(285, 930, 0.62, -0.04, seg(t, 0.7, 1.05), 'CARD', '₹5,799', SHARK);
      priceTag(715, 930, 0.62, 0.03, seg(t, D * 0.55, D * 0.55 + 0.35), 'GTA 6', '₹5,999', GOLD);
      const kb = back(seg(t, D * 0.8, D * 0.8 + 0.35)); if (kb > 0) withT(CX, 1085, kb, -0.03, () => { glow(0, 0, 300, GREEN, 0.4); P(rr(-300, -58, 600, 116, 58), GREEN, C.ink, 6); txt('FARQ SIRF ₹200', 0, 4, 58, C.ink); }); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.05, ease(t / d)));
  impactStarV(t, CX, 330, 0.05, 'TWIST!', 1.0);
  srcChip('SOURCE: PS Store India; MySmartPrice, Tech2 (GTA 6)', seg(t, 1.2, 1.7));
  vignette();
};

// ---------- n05: most expensive vehicle in GTA Online = Luxor Deluxe jet, GTA$10,000,000 -> whole card gone ----------
DRAWV.jet = (t, d) => {
  const D = LINES.n05.dur, drain = easeInOut(seg(t, D * 0.62, D * 0.62 + 1.4));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1530', '#E07A5F'); glow(780, 620, 320, '#FFD27A', 0.5); P(circ(780, 620, 90), '#FFE3A3', null); } },
    { z: 0.3, draw: () => { skyline(760, '#1A1E48', 9, 200, '#FFD27A', 60); } },
    { z: 0.6, draw: () => { runwayV(t, 760); jetV(lerp(560, 470, ease(t / d)), 900, 0.95, t);
      SP.counter(t, D * 0.62, { x: CX, y: 1080, from: 10000000, to: 0, dur: 1.4, pre: 'GTA$ ', size: 92, col: drain > 0.97 ? RED : GOLD, label: '' }); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.06, ease(t / d)));
  chipV('GTA ONLINE (GTA 5): SABSE MEHNGI SAWAARI', CX, 290, back(seg(t, 0.05, 0.4)), GOLD, 38, C.ink);
  const kp = back(seg(t, D * 0.3, D * 0.3 + 0.35)); if (kp > 0) withT(CX, 470, kp, 0.03, () => { P(rr(-280, -80, 560, 160, 30), 'rgba(10,14,24,0.92)', GOLD, 5); txt('LUXOR DELUXE JET', 0, -24, 44, C.white, 'Oswald', 700); txt('GTA$ 10,000,000', 0, 34, 46, GOLD, 'Oswald', 700); });
  if (drain > 0.97) stampV(CX, 650, seg(t, D * 0.62 + 1.45, D * 0.62 + 1.75), 'CARD KHATAM!', RED, 90, -0.1);
  srcChip('SOURCE: GTABase price list (Nov 2026)', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- n06 payoff: game mein crorepati aasaan, asli jeb dheeli ----------
DRAWV.payoff = (t, d) => {
  const D = LINES.n06.dur, op = seg(t, D * 0.5, D * 0.5 + 0.4);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B0F24', '#1F3A66'); stars(50); bokeh(t, 10, GOLD, 51); } },
    { z: 0.5, draw: () => { floorV(1180, '#141A30', '#080A18');
      coinStackG(200, 1150, 1.4, 9); coinStackG(320, 1170, 1.2, 6); SP.phone(260, 900, 1.6, t, 0.9);
      crownV(260, 600, 1.0, seg(t, 0.2, 0.55));
      chipV('GAME MEIN CROREPATI', 270, 470, back(seg(t, 0.3, 0.65)), GOLD, 36, C.ink);
      shadow(820, 1180, 120); person(820, 1180, 'mahila', { t, s: 1.15, look: -0.2, mood: op > 0 ? -0.4 : 0.5, arms: [[0.4, 0.3], [-1.6, -0.6]] });
      walletV(560, 860, 0.5, op, t); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.04, ease(t / d)));
  chipV('ASLI JEB: DHEELI!', CX, 300, back(seg(t, D * 0.5, D * 0.5 + 0.35)), RED, 50, C.white);
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#06192B', '#0E4D64'); bokeh(t, 12, GOLD, 61); rainBills(t, 6, 23, 'G$'); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 58px Oswald'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -60, w, 120, 36), col, C.ink, 5); P(poly([-20, 58, 10, 58, -30, 96]), col, C.ink, 5); txt(s, 0, 3, 58, C.ink); }); };
      floorV(1240, '#0F2A3A', '#06121C');
      sharkCard(330, 960, 0.5, -0.08, 1, 'GTA$', '1 CRORE');
      bub('JET?', 300, 470, 0.3, GOLD); bub('SUPERCAR?', 560, 640, 0.8, '#9DC4FF'); bub('YA BACHAT?', 330, 800, 1.3, GREEN);
      shadow(860, 1240, 110); person(860, 1240, 'yuva', { t, s: 1.05, look: -0.3, mood: 0.7, arms: [[0.3, 0.2], [-2.1, -0.4]] }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('COMMENT KARO!', CX, 300, back(seg(t, 0.1, 0.45)), GOLD, 50, C.ink);
  vignette();
};

function starP(x, y, r1, r2) { const p = new Path2D(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; i ? p.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : p.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } p.closePath(); return p; }
