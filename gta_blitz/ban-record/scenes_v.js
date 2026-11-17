// ===== Awazzzz GTA blitz #17 — "GTA 6 India mein ban ho sakta hai? Record par kya hai?" (FACT: PUBG + 117 apps blocked 2 Sep 2020 under s.69A IT Act (Inc42, TechRadar); MeitY reasons sovereignty/security/data, no mention of violence; Online Gaming Act 2025 bans online money games, promotes e-sports (Mondaq, Upstox); GTA V not officially sold in Saudi/UAE ~12 years, GTA 6 pre-orders live there (Notebookcheck, GTA BOOM, Sunday Guardian); India: no ban reported, PlayStation Store India pre-orders, launch 19 Nov 2026 (Sunday Guardian)).
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters; "GTA 6" in Oswald. No maps: city pins only.
// Studio library: PRP-017 phone (SP.phone), PRP-052 coins (SP.coins), VFX-011 impactStar, VFX-015 stars, GFX-009 pin (ported as pinV), GFX-020 timeline style.
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
function starP(x, y, r1, r2) { const p = new Path2D(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; i ? p.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : p.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } p.closePath(); return p; }


// ---------- own generic drawings + library ports (#17) ----------
const SAFF = '#F08A24';
function easeInOut(u) { u = clamp(u); return u * u * (3 - 2 * u); }
function impactStarV(t, x, y, t0, word = 'TWIST!', size = 1) { const k = t - t0; if (k < 0 || k > 1.3) return; const s = back(clamp(k / 0.18)) * size * (1 + 0.05 * Math.sin(k * 40)); const a = k > 1.0 ? 1 - (k - 1.0) / 0.3 : 1;
  alpha(a, () => withT(x, y, s, -0.12, () => { ctx.beginPath(); for (let i = 0; i < 24; i++) { const ang = i / 24 * 6.2832, rad = i % 2 ? 150 : 250 + rnd(i) * 40; ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad * 0.75); } ctx.closePath(); ctx.fillStyle = '#ffd166'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#2a1c14'; ctx.stroke(); txtStroke(word, 0, 8, 120, C.red, '#fff', 12); })); }
function starP(x, y, r1, r2) { const p = new Path2D(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; i ? p.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : p.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } p.closePath(); return p; }
function blockStamp(x, y, s, k, word = 'BLOCKED', col = RED) { if (k <= 0) return; const sc = lerp(2.2, 1, back(k)); alpha(clamp(k * 3), () => withT(x, y, sc * s, -0.18, () => { ctx.font = '700 80px Oswald'; const w = ctx.measureText(word).width + 60; P(rr(-w / 2, -58, w, 116, 14), 'rgba(230,57,70,0.12)', col, 9); txt(word, 0, 4, 80, col, 'Oswald', 700); })); }
// phone with an app grid; tiles get blocked in a cascade (PRP-017 phone idea, enlarged)
function appPhone(x, y, s, t, blockK, label) { withT(x, y, s, 0, () => { shadow(0, 330, 240, 0.4);
  P(rr(-190, -340, 380, 680, 52), '#1A1D26', C.ink, 8); ctx.save(); ctx.beginPath(); ctx.roundRect(-164, -308, 328, 616, 30); ctx.clip();
  ctx.fillStyle = grad(-308, 308, '#243B6B', '#3A1E5E'); ctx.fillRect(-164, -308, 328, 616);
  const cols = ['#E63946', '#F4D06F', '#2BFF88', '#4CC9F0', '#9D7BFF', '#F08A24', '#FF6B9A', '#3A86FF'];
  for (let i = 0; i < 16; i++) { const r = Math.floor(i / 4), c = i % 4, ax = -120 + c * 80, ay = -250 + r * 110, b = clamp(blockK * 18 - i * 1.0);
    P(rr(ax - 30, ay - 30, 60, 60, 16), b > 0.5 ? '#444B5C' : cols[(i * 3) % 8], C.ink, 3);
    if (i === 5) txt(label, ax, ay + 50, 20, C.white, 'Oswald', 700);
    if (b > 0) { alpha(b, () => { P(circ(ax + 22, ay - 22, 15), RED, C.ink, 3); line(ax + 14, ay - 22, ax + 30, ay - 22, C.white, 5); }); } }
  ctx.restore(); P(rr(-50, -326, 100, 14, 7), '#333', null); }); }
function shieldLock(x, y, s, k, t) { if (k <= 0) return; withT(x, y, back(k) * s, Math.sin(t * 2) * 0.03, () => { glow(0, 0, 260, CYAN, 0.35); shadow(0, 190, 150, 0.35);
  P(poly([0, -190, 160, -130, 150, 40, 0, 180, -150, 40, -160, -130]), '#1F4E7A', C.ink, 7); P(poly([0, -160, 130, -112, 122, 34, 0, 150, -122, 34, -130, -112]), '#2E6EA8', null);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(0, -30, 46, Math.PI, 0); ctx.stroke(); ctx.strokeStyle = '#E8ECF2'; ctx.lineWidth = 9; ctx.stroke();
  P(rr(-70, -30, 140, 110, 16), GOLD, C.ink, 5); P(circ(0, 15, 14), C.ink, null); P(rr(-5, 15, 10, 36, 4), C.ink, null); }); }
function dataStream(t, x0, y0, x1, y1, k) { if (k <= 0) return; for (let i = 0; i < 14; i++) { const ph = (t * 0.7 + i / 14) % 1, x = lerp(x0, x1, ph), y = lerp(y0, y1, ph) + Math.sin(ph * 6 + i) * 30;
    alpha(k * Math.sin(ph * Math.PI), () => txt(i % 3 ? (i % 2 ? '1' : '0') : '01', x, y, 44, GREEN, 'Oswald', 700)); } }
function serverBox(x, y, s, t) { withT(x, y, s, 0, () => { shadow(0, 160, 150, 0.4); P(rr(-110, -160, 220, 320, 18), '#20242E', C.ink, 6);
  for (let i = 0; i < 4; i++) { P(rr(-90, -140 + i * 74, 180, 56, 10), '#2E3546', C.ink, 3); P(circ(60, -112 + i * 74, 8), (Math.sin(t * 8 + i * 2) > 0) ? GREEN : '#1F5A3A', null); P(rr(-70, -118 + i * 74, 90, 10, 5), 'rgba(255,255,255,0.25)', null); } }); }
function fistBoom(x, y, s, k, t) { if (k <= 0) return; withT(x, y, back(k) * s, Math.sin(t * 6) * 0.05, () => { ctx.beginPath(); for (let i = 0; i < 18; i++) { const a = i / 18 * 6.2832, r = i % 2 ? 80 : 140; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fillStyle = '#FF9F1C'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.stroke(); txtStroke('DHISHUM', 0, 6, 46, C.white, C.ink, 7); }); }
function crossMark(x, y, s, k) { if (k <= 0) return; withT(x, y, back(k) * s, 0, () => { P(circ(0, 0, 70), RED, C.ink, 6); ctx.strokeStyle = C.white; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-30, -30); ctx.lineTo(30, 30); ctx.moveTo(30, -30); ctx.lineTo(-30, 30); ctx.stroke(); }); }
function tickMark(x, y, s, k) { if (k <= 0) return; withT(x, y, back(k) * s, 0, () => { P(circ(0, 0, 60), GREEN, C.ink, 6); ctx.strokeStyle = C.ink; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-26, 2); ctx.lineTo(-6, 24); ctx.lineTo(30, -22); ctx.stroke(); }); }
function lawBook(x, y, s, k, l1, l2) { if (k <= 0) return; withT(x, y, back(k) * s, -0.04, () => { shadow(0, 200, 240, 0.4);
  P(rr(-230, -190, 460, 380, 18), '#7A1F2B', C.ink, 7); P(rr(-230, 150, 460, 40, [0, 0, 18, 18]), '#EDE6D6', C.ink, 5); for (let i = 0; i < 3; i++) line(-210, 162 + i * 9, 210, 162 + i * 9, '#BFB6A0', 2);
  P(rr(-190, -150, 380, 270, 10), null, GOLD, 4); txt(l1, 0, -70, 54, GOLD, 'Oswald', 700); txt(l2, 0, 20, 84, C.white, 'Oswald', 700); }); }
function gavel(x, y, s, ang) { withT(x, y, s, ang, () => { P(rr(-12, -10, 24, 260, 10), WOOD, C.ink, 5); withT(0, -40, 1, 0, () => { P(rr(-110, -50, 220, 100, 26), '#8A5A34', C.ink, 6); P(rr(-120, -56, 26, 112, 10), '#6E4526', C.ink, 4); P(rr(94, -56, 26, 112, 10), '#6E4526', C.ink, 4); }); }); }
function trophyPad(x, y, s, k, t) { if (k <= 0) return; withT(x, y, back(k) * s, 0, () => { glow(0, -60, 300, GOLD, 0.35 + 0.1 * Math.sin(t * 5)); shadow(0, 170, 160, 0.4);
  P(poly([-100, -200, 100, -200, 80, -60, -80, -60]), GOLD, C.ink, 6); P(rr(-120, -200, 240, 30, 10), '#FFE08A', C.ink, 5); ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(-100, -140, 40, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(100, -140, 40, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
  P(rr(-22, -60, 44, 70, 8), '#D9A93A', C.ink, 5); P(rr(-90, 10, 180, 50, 12), '#3A2E27', C.ink, 5); P(starP(0, -130, 34, 15), '#FFFDF5', null);
  withT(0, 150, 1, 0, () => { P(rr(-150, -50, 300, 100, 50), '#2A2F3A', C.ink, 5); P(circ(-90, 0, 18), '#3A86FF', C.ink, 3); P(circ(90, -12, 12), RED, C.ink, 3); P(circ(112, 10, 12), GREEN, C.ink, 3); P(rr(-110, -6, 40, 12, 4), '#8892A6', null); }); }); }
// GFX-009 pin (animation-studio), ported: city/country pin chip — no outline maps
function pinV(x, y, k, name, col, t = 0) { if (k <= 0) return; withT(x, y + Math.sin(t * 3 + x) * 6, back(k), 0, () => { glow(0, -70, 120, col, 0.35); shadow(0, 8, 40, 0.4);
  P(new Path2D('M0 0 C -14 -30 -54 -54 -54 -96 A 54 54 0 1 1 54 -96 C 54 -54 14 -30 0 0 Z'), col, C.ink, 5); P(circ(0, -96, 20), C.white, C.ink, 4);
  ctx.font = '700 40px Oswald'; const w = ctx.measureText(name).width + 40; P(rr(-w / 2, -210, w, 64, 32), 'rgba(10,14,24,0.92)', col, 4); txt(name, 0, -176, 40, C.white, 'Oswald', 700); }); }
function gameCase(x, y, s, label, col, k = 1) { if (k <= 0) return; withT(x, y, back(k) * s, 0, () => { shadow(0, 200, 150, 0.4); P(rr(-140, -200, 280, 400, 16), '#14161C', C.ink, 6); P(rr(-124, -184, 248, 368, 10), col, null);
  P(rr(-124, -184, 248, 50, [10, 10, 0, 0]), 'rgba(0,0,0,0.4)', null); txtStroke(label, 0, 20, 96, C.white, C.ink, 10); }); }
function shutter(x, y, w, h, closeK, t) { if (closeK <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2, y - h / 2, w, h * closeK); ctx.clip();
  ctx.fillStyle = '#5D6672'; ctx.fillRect(x - w / 2, y - h / 2, w, h); for (let i = 0; i < 16; i++) line(x - w / 2, y - h / 2 + i * h / 16, x + w / 2, y - h / 2 + i * h / 16, 'rgba(0,0,0,0.35)', 4); ctx.restore();
  P(rr(x - w / 2 - 10, y - h / 2 + h * closeK - 12, w + 20, 24, 8), '#3A414C', C.ink, 4); }
function shopBag(x, y, s, k, t) { if (k <= 0) return; withT(x, y + Math.sin(t * 3) * 6, back(k) * s, 0.05, () => { glow(0, 0, 260, GREEN, 0.3); shadow(0, 190, 150, 0.4);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, -150, 60, Math.PI, 0); ctx.stroke(); P(poly([-150, -150, 150, -150, 170, 180, -170, 180]), '#2E8B7A', C.ink, 7);
  txt('PRE-ORDER', 0, -40, 54, C.white, 'Oswald', 700); txtStroke('GTA 6', 0, 60, 92, GOLD, C.ink, 9); }); }
function desertCity(t, y) { skyline(y, '#3A2440', 11, 360, '#FFD27A', 80); for (let i = 0; i < 2; i++) { const x = 300 + i * 520; P(rr(x - 20, y - 760 + i * 120, 40, 760 - i * 120, 10), '#2E1C36', null); P(poly([x - 6, y - 840 + i * 120, x + 6, y - 840 + i * 120, x, y - 900 + i * 120]), '#2E1C36', null); } }
function calCard(x, y, s, top, big, k, col = RED) { if (k <= 0) return; withT(x, y, back(k) * s, 0, () => { shadow(0, 140, 150, 0.35); P(rr(-130, -140, 260, 280, 22), C.white, C.ink, 5); P(rr(-130, -140, 260, 76, [22, 22, 0, 0]), col, C.ink, 5);
  txt(top, 0, -100, 40, C.white, 'Oswald', 700); txtStroke(big, 0, 40, 100, C.ink, C.white, 2); }); }
function srcChipV(s, k) { if (k <= 0) return; alpha(k, () => { ctx.font = '600 28px Oswald'; const w = Math.min(900, ctx.measureText(s).width + 36); P(rr(60, 1182 - 22, w, 44, 22), 'rgba(10,14,24,0.75)', 'rgba(255,255,255,0.5)', 2); txt(s, 60 + w / 2, 1183, 28, '#C9D3E6', 'Oswald', 600); }); }

// ---------- spoken opening hook: "Kya GTA 6 Bharat mein BAN ho sakta hai?" ----------
DRAWV.hook1 = (t, d) => {
  const D = LINES.h1o ? LINES.h1o.dur : d;
  depth([
    { z: 0.05, haze: 1, draw: () => { sky(NIGHT1, '#3A1E5E'); stars(60); bokeh(t, 14, PURP, 3); } },
    { z: 0.3, draw: () => { skyline(1250, '#151A3A', 5, 520, '#FFD27A', 70); } },
    { z: 0.6, draw: () => { appPhone(CX, 820, 1.15, t, 0, ''); withT(CX, 600, back(seg(t, 0.05, 0.35)), 0, () => { glow(0, 0, 220, GOLD, 0.5); P(rr(-120, -120, 240, 240, 50), '#1B1F2A', GOLD, 7); txtStroke('GTA 6', 0, 6, 76, C.white, C.ink, 8); });
      blockStamp(CX, 900, 1.3, seg(t, D * 0.45, D * 0.45 + 0.3), 'BAN?'); SP.question(t, 230, 520, D * 0.3, 1); SP.question(t, 860, 640, D * 0.4, 0.8); } },
    { z: 0.9, draw: () => { floorV(1240, '#1B1430', '#0B0818'); } },
  ], drift(t, d, 14), 0, lerp(1.0, 1.08, ease(t / d)));
  vignette();
};

// ---------- n01: 2 Sep 2020, PUBG Mobile + 117 apps blocked under s.69A IT Act ----------
DRAWV.blocked = (t, d) => {
  const D = LINES.n01.dur, bk = seg(t, D * 0.25, D * 0.7);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0A1530', '#2A1A4E'); stars(40); bokeh(t, 12, RED, 9); } },
    { z: 0.3, draw: () => { skyline(1240, '#141A38', 8, 460, '#FFD27A', 70); } },
    { z: 0.65, draw: () => { calCard(200, 330, 0.75, 'SEP', '2020', seg(t, 0.05, 0.4)); appPhone(620, 850, 0.9, t, bk, 'PUBG');
      blockStamp(620, 860, 1.0, seg(t, D * 0.62, D * 0.62 + 0.3), 'BLOCKED');
      shadow(200, 1215, 80); person(200, 1215, 'mahila', { t, s: 0.95, look: 0.5, mood: -0.2, arms: [[0.9, 1.2], [-0.4, -0.9]] }); } },
    { z: 0.9, draw: () => { floorV(1215, '#141A30', '#080A18'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  SP.counter(t, D * 0.25, { x: 640, y: 300, from: 0, to: 118, dur: D * 0.4, size: 140, col: RED, label: '' });
  chipV('PUBG MOBILE + 117 APPS', 620, 1120, back(seg(t, D * 0.3, D * 0.3 + 0.35)), GOLD, 40, C.ink);
  chipV('IT ACT · DHAARA 69A', CX, 455, back(seg(t, D * 0.72, D * 0.72 + 0.35)), C.white, 46, C.ink);
  srcChipV('SOURCE: Inc42 · TechRadar (2 Sep 2020)', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- n02: stated reason: security + users' data; game violence not mentioned ----------
DRAWV.reason = (t, d) => {
  const D = LINES.n02.dur, kb = seg(t, D * 0.55, D * 0.55 + 0.35);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#081A2E', '#123A5A'); bokeh(t, 12, CYAN, 17); } },
    { z: 0.4, draw: () => { serverBox(860, 640, 1.0, t); dataStream(t, 200, 720, 760, 600, seg(t, D * 0.25, D * 0.25 + 0.3)); } },
    { z: 0.65, draw: () => { shieldLock(300, 560, 1.0, seg(t, 0.05, 0.4), t); fistBoom(CX, 960, 1.0, kb, t); crossMark(CX + 120, 1000, 0.9, seg(t, D * 0.72, D * 0.72 + 0.3)); } },
    { z: 0.9, draw: () => { floorV(1220, '#0E1A2E', '#060A14'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('SARKAARI WAJAH', CX, 250, back(seg(t, 0.05, 0.4)), C.white, 50, C.ink);
  chipV('SURAKSHA', 300, 820, back(seg(t, D * 0.1, D * 0.1 + 0.3)), CYAN, 42, C.ink);
  chipV('USERS KA DATA', 800, 860, back(seg(t, D * 0.28, D * 0.28 + 0.3)), GREEN, 42, C.ink);
  chipV('MAAR-DHAAD? BAYAAN MEIN ZIKR NAHI', CX, 1120, back(seg(t, D * 0.75, D * 0.75 + 0.35)), GOLD, 38, C.ink);
  srcChipV('SOURCE: MeitY statement via TechRadar · Inc42', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- n03: Online Gaming Act 2025: bans money games (pay to win money); e-sports promoted ----------
DRAWV.law = (t, d) => {
  const D = LINES.n03.dur, bang = Math.max(0, Math.sin(clamp(seg(t, 0.3, 0.8)) * Math.PI)), out = easeInOut(seg(t, D * 0.3, D * 0.4)), k2 = seg(t, D * 0.36, D * 0.36 + 0.4), k3 = seg(t, D * 0.7, D * 0.7 + 0.4);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1A0F24', '#4A2350'); bokeh(t, 12, GOLD, 23); } },
    { z: 0.5, draw: () => { withT(0, -1300 * out, 1, 0, () => { lawBook(CX, 640, 1.1, seg(t, 0.05, 0.4), 'ONLINE GAMING ACT', '2025'); gavel(820, 420, 0.9, -0.6 + bang * 0.5); });
      if (k2 > 0) { withT(0, -60 * easeInOut(seg(t, D * 0.66, D * 0.74)), 1, 0, () => { SP.coins(260, 660, 1.6, 5); txtStroke('₹ LAGAAO', 260, 420, 60, GOLD, C.ink, 8); txt('→', CX, 560, 90, C.white, 'Oswald', 700); SP.coins(820, 660, 1.6, 7); txtStroke('₹ JEETO', 820, 420, 60, GOLD, C.ink, 8);
        blockStamp(CX, 560, 1.15, seg(t, D * 0.48, D * 0.48 + 0.3), 'BAN'); chipV('ONLINE MONEY GAMES', CX, 780, back(k2), RED, 44, C.white); }); }
      trophyPad(CX, 930, 0.8, k3, t); tickMark(CX + 190, 800, 0.75, seg(t, D * 0.8, D * 0.8 + 0.3)); } },
    { z: 0.9, draw: () => { floorV(1225, '#1E1028', '#0E0814'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('E-SPORTS: BADHAAVA', CX, 1112, back(seg(t, D * 0.78, D * 0.78 + 0.35)), GREEN, 42, C.ink);
  srcChipV('SOURCE: Mondaq (Ikigai Law) · Upstox', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- n04 twist: GTA V not officially sold in Saudi/UAE ~12 years; GTA 6 pre-orders live there ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n04.dur, open = easeInOut(seg(t, D * 0.55, D * 0.68)), closeK = Math.min(easeOut(seg(t, 0.3, 0.9)), 1 - open);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#2A1030', '#C2603A'); glow(CX, 900, 500, SAFF, 0.3); bokeh(t, 10, SAFF, 31); } },
    { z: 0.3, draw: () => { desertCity(t, 1250); } },
    { z: 0.6, draw: () => { pinV(200, 640, seg(t, D * 0.08, D * 0.08 + 0.35), 'SAUDI ARABIA', GREEN, t); pinV(880, 640, seg(t, D * 0.16, D * 0.16 + 0.35), 'UAE', CYAN, t);
      if (open < 1) alpha(1 - open, () => { gameCase(CX, 820, 1.0, 'GTA V', '#3A4560'); shutter(CX, 820, 340, 440, closeK, t); });
      shopBag(CX, 860, 1.0, open, t); tickMark(CX + 190, 680, 0.8, seg(t, D * 0.72, D * 0.72 + 0.3)); } },
    { z: 0.9, draw: () => { floorV(1230, '#3A2020', '#140A0A'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  impactStarV(t, CX, 520, 0.0, 'TWIST!', 0.9);
  if (open < 0.5) SP.counter(t, D * 0.2, { x: CX, y: 1110, from: 0, to: 12, dur: D * 0.25, size: 110, col: GOLD, suffix: ' SAAL', label: '' });
  chipV('OFFICIALLY NAHI BIKA', CX, 300, back(seg(t, D * 0.25, D * 0.25 + 0.35)) * (1 - open), RED, 46, C.white);
  chipV('AAJ: PRE-ORDER CHAALU!', CX, 300, back(seg(t, D * 0.62, D * 0.62 + 0.35)), GREEN, 50, C.ink);
  srcChipV(open > 0.5 ? 'SOURCE: GTA BOOM · Sunday Guardian (2026)' : 'SOURCE: Notebookcheck · Push Square (Jul 2025)', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- n05 payoff: India: no ban reported; PlayStation Store India pre-orders; launch 19 Nov ----------
DRAWV.india = (t, d) => {
  const D = LINES.n05.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky(NIGHT1, NIGHT2); moonV(860, 280, 54); stars(50); bokeh(t, 12, GOLD, 41); } },
    { z: 0.3, draw: () => { skyline(1240, '#151A3A', 21, 480, '#FFD27A', 70); } },
    { z: 0.6, draw: () => { pinV(220, 560, seg(t, 0.05, 0.4), 'MUMBAI', SAFF, t); pinV(CX, 470, seg(t, 0.15, 0.5), 'DELHI', GREEN, t); pinV(860, 590, seg(t, 0.25, 0.6), 'BENGALURU', CYAN, t);
      const kb = seg(t, D * 0.15, D * 0.15 + 0.35); if (kb > 0) withT(CX, 760, back(kb), 0, () => { P(rr(-380, -70, 760, 140, 36), 'rgba(10,14,24,0.92)', GREEN, 5); txt('BAN? KOI REPORT NAHI', -30, 4, 56, C.white, 'Oswald', 700); });
      tickMark(CX + 360, 760, 0.7, seg(t, D * 0.25, D * 0.25 + 0.3));
      calCard(820, 1060, 0.8, 'NOV', '19', seg(t, D * 0.65, D * 0.65 + 0.35), RED);
      shadow(260, 1215, 80); person(260, 1215, 'mahila', { t, s: 0.95, look: 0.4, mood: 0.8, arms: [[-2.4, -0.4], [2.4, 0.4]] }); } },
    { z: 0.9, draw: () => { floorV(1215, '#141A30', '#080A18'); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.04, ease(t / d)));
  chipV('PLAYSTATION STORE INDIA: PRE-ORDER', CX, 880, back(seg(t, D * 0.42, D * 0.42 + 0.35)), GOLD, 42, C.ink);
  srcChipV('SOURCE: Sunday Guardian (Jul + Nov 2026)', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B0F24', '#2A1A4E'); bokeh(t, 12, GOLD, 61); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 62px Oswald'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -64, w, 128, 36), col, C.ink, 5); P(poly([-20, 62, 10, 62, -30, 100]), col, C.ink, 5); txt(s, 0, 3, 62, C.ink); }); };
      appPhone(330, 860, 0.7, t, 0, ''); blockStamp(330, 860, 0.7, seg(t, 0.2, 0.5), 'BAN?');
      bub('GAME BAN: SAHI YA GALAT?', CX, 380, 0.4, GOLD); bub('COMMENT KARO!', 560, 1080, 1.6, '#9DC4FF');
      floorV(1240, '#1B2236', '#0B1020'); person(820, 1240, 'mahila', { t, s: 1.0, look: -0.3, mood: 0.7, arms: [[0.3, 0.2], [-2.1, -0.4]] }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  vignette();
};
