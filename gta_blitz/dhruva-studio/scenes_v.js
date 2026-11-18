// ===== Awazzzz GTA blitz #19 — "Dhruva Interactive: Bharat ka pehla game studio" (FACT: founded 1997 Bengaluru by Rajesh Rao, regarded India's first game studio (Wikipedia, Mobygeek, PC Gamer 'one of India's first'); 1995 one-person start on bank loan + father's seed money, computer + 14.4 kbps modem (Wikipedia); first game contract Infogrames 28 Nov 1998, never released (Wikipedia); art for Halo, Forza, Sea of Thieves (PC Gamer, PocketGamer.biz, 80.lv); Rockstar Games bought it for $7.9M in May 2019 (PC Gamer, PocketGamer.biz, Wikipedia); ~300 staff joined Rockstar India (Wikipedia)).
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters; game names + "GTA" in Oswald. Rajesh Rao = generic symbolic figure + SANKETIK CHITRAN tag. No maps: city pin only.
// Studio library: PRP-052 coins (SP.coins), PRP-053 moneyStack (ported), PRP-055 folder (ported), VFX-011 impactStar, VFX-015 stars, VFX-019 question, GFX-009 pin (pinV).
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

// ---------- own generic drawings + library ports (#16) ----------
const SAFF = '#F08A24', STONE1 = '#5B4A3E', STONE2 = '#3A2E27';
KINDS.raji = { body: '#E07A1F', body2: '#B85F12', skin: '#C68E62', hair: 'teen', h: 0.9 };
// VFX-001 fire (animation-studio engine/fx.js), ported to the kit ctx for torch flames
function fireV(t, x, y, w = 50, h = 110, n = 26, seed = 3) { ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const r1 = rnd(i * 7 + seed), r2 = rnd(i * 11 + seed + 1), r3 = rnd(i * 13 + seed + 2), life = 0.7 + r1 * 0.6, ph = ((t + r2 * life) % life) / life;
    const px = x + (r3 - 0.5) * w * (1 - ph * 0.7) + Math.sin(t * 6 + i) * 8 * ph, py = y - ph * h * (0.7 + r1 * 0.5), rad = (1 - ph) * (10 + r2 * 16);
    const g = ctx.createRadialGradient(px, py, 0, px, py, Math.max(1, rad)); g.addColorStop(0, `rgba(255,${200 - ph * 150 | 0},60,${0.6 * (1 - ph)})`); g.addColorStop(1, 'rgba(255,60,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, Math.max(1, rad), 0, 6.2832); ctx.fill(); }
  ctx.restore(); }
function torchV(t, x, y, s = 1, seed = 1) { withT(x, y, s, 0, () => { glow(0, -40, 160, SAFF, 0.35 + 0.08 * Math.sin(t * 9 + seed)); P(rr(-10, -20, 20, 140, 6), '#4A3424', C.ink, 3); P(rr(-24, -34, 48, 22, 8), '#2A1E16', C.ink, 3); fireV(t, 0, -36, 40, 100, 22, seed); }); }
// generic ancient stone colonnade (no idols, no shrine, no symbols)
function pillarV(x, yb, h, w = 120, col = STONE1) { P(rr(x - w / 2, yb - h, w, h, 6), col, C.ink, 5); for (let i = 1; i < 4; i++) line(x - w / 2 + i * w / 4, yb - h + 30, x - w / 2 + i * w / 4, yb - 20, 'rgba(0,0,0,0.22)', 4);
  P(rr(x - w / 2 - 22, yb - h - 34, w + 44, 40, 6), STONE2, C.ink, 5); P(rr(x - w / 2 - 22, yb - 30, w + 44, 30, 6), STONE2, C.ink, 5); }
function ruinsV(t, yb, seed = 0) { for (let i = 0; i < 5; i++) { const x = 60 + i * 240, h = 640 - (i % 2) * 120 - rnd(i + seed) * 80; pillarV(x, yb, h, 110, i % 2 ? '#4E4036' : STONE1); }
  P(rr(-60, yb - 720, W + 120, 70, 8), STONE2, C.ink, 5); for (let i = 0; i < 12; i++) P(rr(-40 + i * 100, yb - 760, 70, 40, 6), '#4E4036', C.ink, 4); }
// generic cartoon demon mask (horns, two eyes) — playful, not gory
function maskV(x, y, s, col, t, seed = 0) { withT(x, y + Math.sin(t * 2 + seed) * 10, s, Math.sin(t * 1.3 + seed) * 0.06, () => { glow(0, 0, 200, '#B5179E', 0.25);
  P(poly([-90, -60, -130, -170, -40, -90]), '#EDE6D6', C.ink, 5); P(poly([90, -60, 130, -170, 40, -90]), '#EDE6D6', C.ink, 5);
  P(rr(-110, -100, 220, 200, 90), col, C.ink, 6); P(ell(-45, -20, 30, 18), '#FFE066', C.ink, 4); P(ell(45, -20, 30, 18), '#FFE066', C.ink, 4); P(circ(-45, -20, 8), C.ink, null); P(circ(45, -20, 8), C.ink, null);
  P(rr(-60, 40, 120, 30, 12), '#2A0F1E', C.ink, 4); for (let i = 0; i < 4; i++) P(poly([-48 + i * 30, 40, -36 + i * 30, 58, -24 + i * 30, 40]), '#fff', null); }); }
function girlHero(x, y, s, t, o = {}) { // own-design acrobat girl (generic, not the game character): rig body + ponytail + sash
  withT(x, y, s, o.rot || 0, () => { if (!o.noShadow) shadow(0, 0, 110, 0.35); person(0, 0, 'raji', { t, s: 1, look: o.look || 0, mood: o.mood !== undefined ? o.mood : 0.5, arms: o.arms || [[-0.6, -0.8], [0.9, 1.2]] });
    const hy = -278 * 0.9 - 30; P(poly([10, hy - 30, 70 + Math.sin(t * 5) * 10, hy + 10, 60, hy + 70, 20, hy]), '#121212', C.ink, 4);
    P(poly([-55, -190, 55, -150, 55, -130, -55, -170]), '#2BFF88', C.ink, 3); }); }
function piggyV(x, y, s, k, t) { if (k <= 0) return; withT(x, y, back(k) * s, Math.sin(t * 2) * 0.03, () => { shadow(0, 110, 170, 0.35);
  P(ell(0, 0, 170, 120), '#F7A6C1', C.ink, 6); P(circ(130, -20, 46), '#F7A6C1', C.ink, 6); P(ell(158, -14, 22, 18), '#E989AA', C.ink, 4); P(circ(150, -18, 4), C.ink, null); P(circ(166, -18, 4), C.ink, null);
  P(circ(100, -60, 8), C.ink, null); P(poly([60, -100, 90, -150, 110, -95]), '#E989AA', C.ink, 4); for (const lx of [-90, -30, 40, 100]) P(rr(lx - 16, 90, 32, 50, 8), '#F7A6C1', C.ink, 5);
  P(rr(-40, -124, 80, 14, 7), C.ink, null); }); }
function flatBlock(x, y, s, k, t, sold) { if (k <= 0) return; withT(x, y, back(k) * s, 0, () => { shadow(0, 0, 260, 0.4);
  P(rr(-220, -560, 440, 560, 10), '#8DA3C0', C.ink, 6); P(rr(-240, -590, 480, 40, 8), '#5D6F8A', C.ink, 5);
  for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) { const lit = rnd(r * 4 + c + 9) > 0.45; P(rr(-180 + c * 95, -520 + r * 82, 66, 54, 6), lit ? '#FFD27A' : '#2F3B52', C.ink, 3); }
  P(rr(-50, -110, 100, 110, 8), '#4A3424', C.ink, 4);
  if (sold > 0) withT(150, -360, back(sold), -0.12, () => { line(0, 60, 0, 300, '#8A93A6', 10); P(rr(-150, -70, 300, 140, 16), RED, C.ink, 6); txt('SOLD', 0, 4, 92, C.white, 'Oswald', 700); }); }); }
function crowdCard(x, y, s, k, fillK, failK) { if (k <= 0) return; withT(x, y, back(k) * s, -0.03, () => { shadow(0, 170, 300, 0.35);
  P(rr(-330, -160, 660, 320, 26), '#FFFDF5', C.ink, 6); P(rr(-330, -160, 660, 80, [26, 26, 0, 0]), '#2E8B7A', C.ink, 6); txt('KICKSTARTER CAMPAIGN', 0, -118, 44, C.white, 'Oswald', 700);
  txt('FUNDING GOAL', -300, -40, 32, '#4A5163', 'Oswald', 700, 'left'); P(rr(-290, 10, 580, 56, 28), '#E3E7EE', C.ink, 4); P(rr(-284, 16, 568 * fillK, 44, 22), GREEN, null);
  txt(Math.round(fillK * 100) + '%', 260, -40, 40, C.ink, 'Oswald', 700, 'right');
  if (failK > 0) withT(0, 110, back(failK), -0.1, () => { P(rr(-190, -46, 380, 92, 18), 'rgba(230,57,70,0.12)', RED, 8); txt('FAIL', 0, 4, 76, RED, 'Oswald', 700); }); }); }
function grantCheque(x, y, s, k) { if (k <= 0) return; withT(x, y, back(k) * s, 0.04, () => { shadow(0, 140, 330, 0.35); glow(0, 0, 380, GREEN, 0.25);
  P(rr(-340, -130, 680, 260, 22), '#E9FFF2', C.ink, 6); P(rr(-340, -130, 26, 260, [22, 0, 0, 22]), GREEN, null); txt('GRANT', -260, -70, 40, '#2E8B7A', 'Oswald', 700, 'left');
  txtStroke('UNREAL DEV GRANT', 20, 10, 64, C.ink, '#E9FFF2', 2); for (let i = 0; i < 3; i++) line(-260, 80, 260, 80, '#B8D9C4', 3); txt('✔ MILA!', 220, 80, 36, '#2E8B7A', 'Oswald', 700); }); }
function globeV(x, y, r, t) { withT(x, y, 1, 0, () => { glow(0, 0, r * 1.6, CYAN, 0.25); P(circ(0, 0, r), '#1F4E7A', C.ink, 6); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r - 3, 0, 6.2832); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 3; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(((t * 30 + i * r / 3) % (r * 2.3)) - r * 1.15, 0, Math.abs(r * 0.25), r, 0, 0, 6.2832); ctx.stroke(); line(-r, i * r / 4, r, i * r / 4, 'rgba(255,255,255,0.18)', 3); }
  ctx.restore(); P(circ(0, 0, r), null, C.ink, 6); }); }
function handheldV(x, y, s, t) { withT(x, y, s, 0, () => { shadow(0, 140, 300, 0.4); P(rr(-300, -130, 600, 260, 110), '#2A2F3A', C.ink, 6);
  P(rr(-190, -110, 380, 220, 16), '#0E1220', C.ink, 4); ctx.save(); ctx.beginPath(); ctx.roundRect(-180, -100, 360, 200, 10); ctx.clip(); ctx.fillStyle = grad(-100, 100, '#3A1E5E', SAFF); ctx.fillRect(-180, -100, 360, 200);
  for (let i = 0; i < 4; i++) pillarV(-140 + i * 95, 100, 120 + (i % 2) * 30, 34, STONE2); girlHero(Math.sin(t * 2) * 60, 90, 0.32, t, { noShadow: 1 }); ctx.restore();
  P(circ(-245, -20, 34), '#C1121F', C.ink, 4); P(circ(245, 30, 34), '#3A86FF', C.ink, 4); }); }
function ribbonCard(x, y, s, k, t) { if (k <= 0) return; withT(x, y, back(k) * s, 0, () => { shadow(0, 260, 360, 0.4); glow(0, -40, 420, GOLD, 0.3 + 0.08 * Math.sin(t * 5));
  P(rr(-380, -240, 760, 480, 24), '#FFFDF5', GOLD, 12); P(rr(-350, -210, 700, 420, 14), null, '#D9C27A', 3);
  txt('THE GAME AWARDS 2020', 0, -150, 44, '#4A5163', 'Oswald', 700); txtStroke('NOMINEE', 0, -55, 120, '#C1121F', '#FFFDF5', 2); txt('BEST DEBUT INDIE GAME', 0, 40, 52, C.ink, 'Oswald', 700);
  withT(0, 150, 1, 0, () => { P(circ(0, 0, 58), GOLD, C.ink, 5); P(poly([-40, 40, -62, 120, -20, 96, 0, 130, 0, 50]), '#C1121F', C.ink, 4); P(poly([40, 40, 62, 120, 20, 96, 0, 130, 0, 50]), '#C1121F', C.ink, 4); P(circ(0, 0, 58), GOLD, C.ink, 5); P(starP(0, 0, 34, 15), '#FFFDF5', null); }); }); }
function countryChip(x, y, k, name, col) { if (k <= 0) return; withT(x, y, back(k), 0, () => { ctx.font = '700 40px Oswald'; const w = ctx.measureText(name).width + 60; P(rr(-w / 2, -36, w, 72, 36), 'rgba(10,14,24,0.9)', col, 4); P(circ(-w / 2 + 28, 0, 10), col, null); txt(name, 10, 2, 40, C.white, 'Oswald', 700); }); }
function blockStamp(x, y, s, k, word = 'BLOCKED', col = RED) { if (k <= 0) return; const sc = lerp(2.2, 1, back(k)); alpha(clamp(k * 3), () => withT(x, y, sc * s, -0.18, () => { ctx.font = '700 80px Oswald'; const w = ctx.measureText(word).width + 60; P(rr(-w / 2, -58, w, 116, 14), 'rgba(230,57,70,0.12)', col, 9); txt(word, 0, 4, 80, col, 'Oswald', 700); })); }
// GFX-009 pin (animation-studio), ported: city/country pin chip — no outline maps
function pinV(x, y, k, name, col, t = 0) { if (k <= 0) return; withT(x, y + Math.sin(t * 3 + x) * 6, back(k), 0, () => { glow(0, -70, 120, col, 0.35); shadow(0, 8, 40, 0.4);
  P(new Path2D('M0 0 C -14 -30 -54 -54 -54 -96 A 54 54 0 1 1 54 -96 C 54 -54 14 -30 0 0 Z'), col, C.ink, 5); P(circ(0, -96, 20), C.white, C.ink, 4);
  ctx.font = '700 40px Oswald'; const w = ctx.measureText(name).width + 40; P(rr(-w / 2, -210, w, 64, 32), 'rgba(10,14,24,0.92)', col, 4); txt(name, 0, -176, 40, C.white, 'Oswald', 700); }); }
function srcChipV(s, k) { if (k <= 0) return; alpha(k, () => { ctx.font = '600 28px Oswald'; const w = Math.min(900, ctx.measureText(s).width + 36); P(rr(60, 1182 - 22, w, 44, 22), 'rgba(10,14,24,0.75)', 'rgba(255,255,255,0.5)', 2); txt(s, 60 + w / 2, 1183, 28, '#C9D3E6', 'Oswald', 600); }); }

// ---------- own generic drawings + library ports (#19) ----------
const D19_BEIGE = '#E6DCC3', D19_BEIGE2 = '#C9BC9C', D19_CRT = '#0B2A1A';
function sanketikV(k = 1) { if (k <= 0) return; alpha(k, () => tag('SANKETIK CHITRAN', 60, 1112, 24, C.grey)); }
// 1990s beige desktop: CRT monitor + keyboard + tower; green-text screen
function retroPC(x, y, s, t, screen) { withT(x, y, s, 0, () => { shadow(0, 210, 330, 0.45);
  P(rr(170, -230, 150, 430, 14), D19_BEIGE, C.ink, 6); P(rr(190, -200, 110, 26, 6), D19_BEIGE2, C.ink, 3); P(rr(190, -160, 110, 26, 6), D19_BEIGE2, C.ink, 3); P(circ(245, 140, 12), (Math.sin(t * 7) > 0 ? GREEN : '#2A5A3A'), C.ink, 3);
  P(rr(-260, -300, 400, 360, 30), D19_BEIGE, C.ink, 6); P(rr(-230, -272, 340, 270, 18), '#1B1F1C', C.ink, 4);
  ctx.save(); ctx.beginPath(); ctx.roundRect(-218, -260, 316, 246, 12); ctx.clip(); ctx.fillStyle = D19_CRT; ctx.fillRect(-218, -260, 316, 246); glow(-60, -140, 220, GREEN, 0.25);
  if (screen) screen(); for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-218, -260 + i * 6.2, 316, 2); } ctx.restore();
  P(rr(-120, 60, 120, 40, 8), D19_BEIGE2, C.ink, 5); P(rr(-300, 110, 460, 80, 14), D19_BEIGE, C.ink, 6);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) P(rr(-280 + c * 43, 122 + r * 21, 36, 16, 4), D19_BEIGE2, null); }); }
// dial-up modem box with blinking LEDs + phone cable carrying data dots
function modemBox(x, y, s, t, k = 1) { if (k <= 0) return; withT(x, y, back(k) * s, 0, () => { shadow(0, 70, 220, 0.4);
  P(rr(-220, -60, 440, 120, 26), '#2B2F38', C.ink, 6); P(rr(-200, -44, 400, 30, 10), '#3A404C', null);
  for (let i = 0; i < 6; i++) { const on = Math.sin(t * 9 + i * 1.7) > 0.1; P(circ(-160 + i * 50, 22, 11), on ? [GREEN, GOLD, RED][i % 3] : '#444A55', C.ink, 2); if (on) glow(-160 + i * 50, 22, 26, [GREEN, GOLD, RED][i % 3], 0.4); }
  txt('14.4 kbps', 120, -29, 26, '#C9D3E6', 'Oswald', 700); }); }
function phoneCable(t, x0, y0, x1, y1, k) { if (k <= 0) return; ctx.save(); ctx.strokeStyle = '#1B1F2A'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.bezierCurveTo(x0, y0 + 160, x1, y1 + 160, x1, y1); ctx.stroke(); ctx.restore();
  for (let i = 0; i < 6; i++) { const u = (t * 0.6 + i / 6) % 1, mx = (x0 + x1) / 2; const bx = Math.pow(1 - u, 3) * x0 + 3 * Math.pow(1 - u, 2) * u * x0 + 3 * (1 - u) * u * u * x1 + u * u * u * x1, by = Math.pow(1 - u, 3) * y0 + 3 * Math.pow(1 - u, 2) * u * (y0 + 160) + 3 * (1 - u) * u * u * (y1 + 160) + u * u * u * y1;
    alpha(k, () => { glow(bx, by, 24, GREEN, 0.6); P(circ(bx, by, 7), GREEN, null); }); } }
// bank loan slip (own design, no bank names)
function loanSlip(x, y, s, k) { if (k <= 0) return; withT(x, y, back(k) * s, -0.05, () => { shadow(0, 120, 300, 0.35);
  P(rr(-300, -110, 600, 220, 20), '#FFF8E6', C.ink, 6); P(rr(-300, -110, 600, 64, [20, 20, 0, 0]), '#3A86FF', C.ink, 6); txt('BANK LOAN', 0, -77, 40, C.white, 'Oswald', 700);
  for (let i = 0; i < 2; i++) line(-250, 0 + i * 40, 150, 0 + i * 40, '#C9C1AA', 4); txtStroke('₹', 220, 22, 96, GOLD, C.ink, 7); }); }
// PRP-053 moneyStack (animation-studio engine/props.js), ported
function moneyStackV(x, y, s) { withT(x, y, s, 0, () => { for (let i = 0; i < 6; i++) P(rr(-110, -30 - i * 22, 220, 26, 4), i % 2 ? '#52b788' : '#40916c', '#2a1c14', 3); P(rr(-20, -160, 40, 140, 2), '#e9c46a', '#2a1c14', 2); }); }
// PRP-055 folder (animation-studio engine/props.js), ported as a contract file
function contractDoc(x, y, s, k, t, col = '#f4a261') { if (k <= 0) return; withT(x, y + Math.sin(t * 2) * 6, back(k) * s, -0.04, () => { shadow(0, 40, 260, 0.35);
  P(poly([-240, -340, -80, -340, -40, -300, 240, -300, 240, 0, -240, 0]), col, '#2a1c14', 6); P(rr(-220, -380, 440, 340, 10), '#FFFDF5', '#2a1c14', 5);
  txt('GAME CONTRACT', 0, -330, 44, C.ink, 'Oswald', 700); txt('28 · 11 · 1998', 0, -275, 34, '#4A5163', 'Oswald', 700);
  for (let i = 0; i < 4; i++) line(-180, -220 + i * 34, 180 - (i % 2) * 60, -220 + i * 34, '#C9C1AA', 5);
  ctx.save(); ctx.strokeStyle = '#1D3557'; ctx.lineWidth = 5; ctx.beginPath(); for (let i = 0; i <= 30; i++) { const u = i / 30; ctx.lineTo(40 + u * 140, -70 + Math.sin(u * 14) * 14 - u * 10); } ctx.stroke(); ctx.restore();
  P(poly([-240, -250, 240, -250, 240, 0, -240, 0]), shadeV(col), '#2a1c14', 6); }); }
function shadeV(c) { return c === '#f4a261' ? '#e08a46' : c; }
// generic boxed game: closed box with "?" — never released
function mysteryBox(x, y, s, k, t) { if (k <= 0) return; withT(x, y, back(k) * s, Math.sin(t * 3) * 0.03, () => { shadow(0, 150, 170, 0.4); P(rr(-150, -190, 300, 340, 18), '#2A2F3A', C.ink, 6); P(rr(-130, -170, 260, 300, 10), '#3D4456', null); txtStroke('?', 0, -10, 200, GOLD, C.ink, 10); txt('GAME', 0, 110, 40, C.white, 'Oswald', 700); }); }
// generic art-icon cards: race car / space helmet / sailing ship (own designs, no game art)
function artCard(x, y, s, k, t, kind, label, col) { if (k <= 0) return; withT(x, y + Math.sin(t * 2.5 + x) * 8, back(k) * s, 0, () => { shadow(0, 210, 190, 0.4); glow(0, -20, 260, col, 0.25);
  P(rr(-180, -200, 360, 400, 28), '#141A2A', col, 7); P(rr(-160, -180, 320, 280, 18), grad(-180, 100, '#22304A', '#0E1424'), null);
  if (kind === 'car') { withT(0, -30, 1, 0, () => { P(poly([-130, 30, -110, -10, -40, -30, 40, -30, 100, -5, 135, 15, 135, 40, -130, 40]), '#E63946', C.ink, 5); P(poly([-40, -28, -10, -60, 40, -60, 60, -28]), '#9DC4FF', C.ink, 4); P(circ(-75, 42, 26), '#1B1F2A', C.ink, 5); P(circ(80, 42, 26), '#1B1F2A', C.ink, 5); P(circ(-75, 42, 10), '#AAB', null); P(circ(80, 42, 10), '#AAB', null);
      for (let i = 0; i < 4; i++) line(-150 - i * 6, -10 + i * 14, -190 - ((t * 200 + i * 30) % 60), -10 + i * 14, 'rgba(255,255,255,0.5)', 4); }); }
  if (kind === 'helmet') { withT(0, -40, 1, 0, () => { P(circ(0, 0, 100), '#E8ECF2', C.ink, 6); P(rr(-70, -40, 140, 80, 36), '#1B2A44', C.ink, 5); alpha(0.5, () => P(rr(-50, -30, 40, 20, 10), '#9DC4FF', null)); P(rr(-110, 60, 220, 40, 16), '#C9D3E6', C.ink, 5); P(circ(80, -70, 10), CYAN, C.ink, 3); }); }
  if (kind === 'ship') { withT(0, -20, 1, Math.sin(t * 2) * 0.05, () => { P(poly([-130, 30, 130, 30, 100, 80, -100, 80]), WOOD, C.ink, 5); line(0, 30, 0, -150, C.ink, 8); P(poly([6, -140, 6, -10, 110, -20]), '#F2EAD8', C.ink, 4); P(poly([-6, -130, -6, -20, -100, -30]), '#F2EAD8', C.ink, 4); P(poly([0, -150, 50, -140, 0, -128]), RED, C.ink, 3);
      ctx.save(); ctx.strokeStyle = CYAN; ctx.lineWidth = 6; ctx.beginPath(); for (let i = 0; i <= 40; i++) ctx.lineTo(-160 + i * 8, 92 + Math.sin(i * 0.8 + t * 4) * 8); ctx.stroke(); ctx.restore(); }); }
  txt(label, 0, 150, label.length > 10 ? 40 : 52, C.white, 'Oswald', 700); }); }
function brushV(x, y, s, t) { withT(x, y, s, -0.7 + Math.sin(t * 4) * 0.15, () => { P(rr(-10, -10, 20, 200, 8), WOOD, C.ink, 4); P(rr(-14, -40, 28, 34, 4), '#C0C6D0', C.ink, 4); P(poly([-14, -40, 14, -40, 6, -90, -6, -90]), PURP, C.ink, 4); }); }
function briefcaseV(x, y, s, k, openK, t) { if (k <= 0) return; withT(x, y, back(k) * s, 0, () => { shadow(0, 150, 280, 0.45); glow(0, -60, 340, GREEN, 0.25 * openK);
  if (openK > 0) { withT(0, -150 - 40 * openK, 1, 0, () => { moneyStackV(-80, 40, 0.7); moneyStackV(80, 40, 0.7); }); }
  P(rr(-260, -150, 520, 300, 30), '#5A3A22', C.ink, 7); P(rr(-80, -200, 160, 60, 20), null, C.ink, 10); P(rr(-260, -40, 520, 18, 4), '#46301C', null); P(rr(-30, -60, 60, 50, 8), GOLD, C.ink, 4); }); }
function bldgV(x, yb, w, h, col, sign, signCol, t, k = 1) { if (k <= 0) return; withT(x, yb, back(k), 0, () => { shadow(0, 0, w * 0.6, 0.4);
  P(rr(-w / 2, -h, w, h, 10), col, C.ink, 6); for (let r = 0; r < Math.floor((h - 160) / 90); r++) for (let c = 0; c < Math.floor((w - 40) / 80); c++) { const lit = rnd(r * 7 + c + x) > 0.35; P(rr(-w / 2 + 30 + c * 80, -h + 120 + r * 90, 50, 56, 6), lit ? '#FFD27A' : '#2A3048', null); }
  P(rr(-60, -110, 120, 110, 8), '#1B1F2A', C.ink, 5);
  ctx.font = '700 44px Oswald'; const sw = ctx.measureText(sign).width + 50; P(rr(-sw / 2, -h - 70, sw, 76, 16), '#0E1220', signCol, 5); glow(0, -h - 32, sw * 0.6, signCol, 0.3); txt(sign, 0, -h - 30, 44, C.white, 'Oswald', 700); }); }
function walkers(t, n, x0, x1, y, k, col, seed = 0) { for (let i = 0; i < n; i++) { const u = clamp(k * 1.4 - i / n * 0.4), x = lerp(x0 + (rnd(i + seed) - 0.5) * 220, x1, easeInOut(u)), yy = y + (rnd(i * 5 + seed) - 0.5) * 60 + Math.abs(Math.sin(t * 9 + i)) * -8;
  if (u < 0.98) token(x, yy, 1.1, [col, CYAN, GOLD, PURP][i % 4], false); } }

// ---------- spoken opening hook: "Ek modem se shuru hua Bharat ka pehla game studio... pahuncha kahaan?" ----------
DRAWV.hook1 = (t, d) => {
  const D = LINES.h1o ? LINES.h1o.dur : d;
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#06140E', '#1A2A4E'); stars(50); bokeh(t, 14, GREEN, 3); } },
    { z: 0.3, draw: () => { skyline(1250, '#122030', 5, 480, '#FFD27A', 70); } },
    { z: 0.6, draw: () => { retroPC(CX + 40, 760, 1.2, t, () => { txt('C:\\> DHRUVA', -60, -200, 40, GREEN, 'Oswald', 700); if (Math.sin(t * 6) > 0) P(rr(60, -220, 22, 36, 2), GREEN, null); });
      modemBox(CX, 1060, 1.0, t, seg(t, 0.05, 0.35)); SP.question(t, 200, 470, D * 0.55, 1.1); SP.question(t, 900, 560, D * 0.65, 0.8); } },
    { z: 0.9, draw: () => { floorV(1240, '#0E1A22', '#060A10'); } },
  ], drift(t, d, 14), 0, lerp(1.0, 1.08, ease(t / d)));
  vignette();
};

// ---------- n01: 1997, Bengaluru: Rajesh Rao starts Dhruva Interactive, regarded India's first game studio ----------
DRAWV.founded = (t, d) => {
  const D = LINES.n01.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0A1530', '#3A2A5E'); moonV(860, 260, 50); stars(40); bokeh(t, 12, GOLD, 9); } },
    { z: 0.3, draw: () => { skyline(1240, '#141A38', 8, 460, '#FFD27A', 70); } },
    { z: 0.6, draw: () => { calCard(220, 480, 0.8, 'SAAL', '1997', seg(t, 0.05, 0.4)); pinV(820, 600, seg(t, D * 0.12, D * 0.12 + 0.35), 'BENGALURU', CYAN, t);
      retroPC(680, 960, 0.75, t, () => { txt('DHRUVA', -60, -170, 50, GREEN, 'Oswald', 700); txt('INTERACTIVE', -60, -110, 34, GREEN, 'Oswald', 700); });
      shadow(220, 1215, 110); person(220, 1215, 'yuva', { t, s: 1.45, look: 0.5, mood: 0.6, arms: [[0.9, 1.2], [-2.2, -0.4]] }); } },
    { z: 0.9, draw: () => { floorV(1215, '#141A30', '#080A18'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('RAJESH RAO', 220, 700, back(seg(t, D * 0.2, D * 0.2 + 0.35)), C.white, 40, C.ink);
  chipV('BHARAT KA PEHLA GAME STUDIO (MAANA JAATA HAI)', CX, 270, back(seg(t, D * 0.62, D * 0.62 + 0.35)), GOLD, 34, C.ink);
  sanketikV(seg(t, 0.4, 0.8)); srcChipV('SOURCE: Wikipedia · PocketGamer.biz · 80.lv', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- n02: real start 1995: bank loan + father's money -> computer + 14.4 kbps modem ----------
DRAWV.modem = (t, d) => {
  const D = LINES.n02.dur, k1 = seg(t, D * 0.15, D * 0.15 + 0.35), k2 = seg(t, D * 0.38, D * 0.38 + 0.35), k3 = seg(t, D * 0.55, D * 0.55 + 0.35), k4 = seg(t, D * 0.72, D * 0.72 + 0.35);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#081A2E', '#1E3A5A'); bokeh(t, 12, CYAN, 17); } },
    { z: 0.45, draw: () => { loanSlip(330, 470, 0.85, k1); withT(820, 560, back(k2), 0, () => { SP.coins(0, 0, 1.4, 6); txt('PAPA KI MADAD', 0, 60, 36, C.white, 'Oswald', 700); }); } },
    { z: 0.65, draw: () => { if (k3 > 0) withT(0, 0, 1, 0, () => alpha(clamp(k3 * 2), () => retroPC(560, 930, 0.7, t, () => { txt('LOADING...', -60, -150, 40, GREEN, 'Oswald', 700); }))); modemBox(560, 1110, 0.8, t, k4); phoneCable(t, 720, 1110, 980, 900, k4); } },
    { z: 0.9, draw: () => { floorV(1215, '#0E1A2E', '#060A14'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('ASLI SHURUAAT: 1995', CX, 250, back(seg(t, 0.05, 0.4)), GOLD, 52, C.ink);
  srcChipV('SOURCE: Wikipedia (Dhruva Interactive)', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- n03: first game contract 1998 (Infogrames); game never released ----------
DRAWV.contract = (t, d) => {
  const D = LINES.n03.dur, flip = easeInOut(seg(t, D * 0.48, D * 0.6));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1A0F24', '#4A2350'); bokeh(t, 12, GOLD, 23); } },
    { z: 0.55, draw: () => { withT(0, -60 * flip, 1, 0, () => contractDoc(CX - 160 * flip, 820, 1.05 - 0.3 * flip, seg(t, 0.05, 0.4), t));
      mysteryBox(760, 900, 0.9, flip, t); blockStamp(760, 900, 0.75, seg(t, D * 0.66, D * 0.66 + 0.3), 'RELEASE: NAHI');
      crossMark(900, 690, 0.8, seg(t, D * 0.72, D * 0.72 + 0.3)); } },
    { z: 0.9, draw: () => { floorV(1225, '#1E1028', '#0E0814'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('PEHLA GAME CONTRACT: 1998', CX, 300, back(seg(t, D * 0.05, D * 0.05 + 0.35)), C.white, 46, C.ink);
  chipV('GAME KABHI AAYA HI NAHI!', CX, 1110, back(seg(t, D * 0.62, D * 0.62 + 0.35)), RED, 44, C.white);
  srcChipV('SOURCE: Wikipedia (Infogrames contract, 28 Nov 1998)', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- n04: helped with art for Forza, Halo, Sea of Thieves ----------
DRAWV.art = (t, d) => {
  const D = LINES.n04.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B0F24', '#24305E'); stars(40); bokeh(t, 14, PURP, 31); } },
    { z: 0.3, draw: () => { globeV(CX, 520, 150, t); } },
    { z: 0.62, draw: () => { artCard(210, 900, 0.82, seg(t, D * 0.38, D * 0.38 + 0.35), t, 'car', 'FORZA', RED); artCard(CX, 840, 0.9, seg(t, D * 0.52, D * 0.52 + 0.35), t, 'helmet', 'HALO', CYAN); artCard(870, 900, 0.82, seg(t, D * 0.66, D * 0.66 + 0.35), t, 'ship', 'SEA OF THIEVES', GOLD);
      brushV(CX + 150, 640, 0.9, t); } },
    { z: 0.9, draw: () => { floorV(1225, '#121836', '#070A18'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('DUNIYA KE BADE GAMES KA ART', CX, 290, back(seg(t, 0.05, 0.4)), GOLD, 46, C.ink);
  chipV('DHRUVA NE HAATH BATAYA', CX, 1112, back(seg(t, D * 0.2, D * 0.2 + 0.35)), GREEN, 40, C.ink);
  SP2stars(t, D * 0.7);
  srcChipV('SOURCE: PC Gamer · PocketGamer.biz · 80.lv (2019)', seg(t, 0.4, 0.9));
  vignette();
};
function SP2stars(t, t0) { const k = t - t0; if (k < 0 || k > 1.6) return; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.2832, r = 120 + k * 260; alpha(1 - k / 1.6, () => P(starP(CX + Math.cos(a) * r, 860 + Math.sin(a) * r * 0.7, 22, 9), GOLD, C.ink, 2)); } }

// ---------- n05 twist: 2019 Rockstar Games bought Dhruva for $7.9 million ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n05.dur, open = easeInOut(seg(t, D * 0.62, D * 0.75));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#2A1030', '#C2603A'); glow(CX, 900, 500, SAFF, 0.3); bokeh(t, 10, SAFF, 31); } },
    { z: 0.3, draw: () => { skyline(1250, '#3A2440', 11, 420, '#FFD27A', 80); } },
    { z: 0.6, draw: () => { calCard(200, 380, 0.75, 'MAY', '2019', seg(t, D * 0.05, D * 0.05 + 0.35));
      withT(860, 400, back(seg(t, D * 0.22, D * 0.22 + 0.35)), 0, () => { P(rr(-170, -80, 340, 160, 30), '#14161C', GOLD, 6); txt('GTA', 0, -18, 64, C.white, 'Oswald', 700); txt('BANANE WALI', 0, 44, 30, GOLD, 'Oswald', 700); });
      briefcaseV(CX, 950, 1.0, seg(t, D * 0.3, D * 0.3 + 0.35), open, t); } },
    { z: 0.9, draw: () => { floorV(1230, '#3A2020', '#140A0A'); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  impactStarV(t, CX, 560, 0.0, 'TWIST!', 0.9);
  chipV('ROCKSTAR GAMES NE KHAREEDA', CX, 600, back(seg(t, D * 0.4, D * 0.4 + 0.35)), RED, 44, C.white);
  { const k = back(seg(t, D * 0.66, D * 0.66 + 0.3)); if (k > 0) withT(CX, 1110, k, 0, () => txtStroke('$7.9 MILLION', 0, 0, 100, GOLD, C.ink, 9)); }
  srcChipV('SOURCE: PC Gamer · PocketGamer.biz (May 2019)', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- n06 payoff: ~300 people joined Rockstar India; modem -> GTA company ----------
DRAWV.team = (t, d) => {
  const D = LINES.n06.dur, wk = seg(t, D * 0.1, D * 0.55);
  depth([{ z: 0.05, haze: 1, draw: () => { sky(NIGHT1, NIGHT2); moonV(880, 240, 50); stars(50); bokeh(t, 12, GOLD, 41); } },
    { z: 0.3, draw: () => { skyline(1180, '#151A3A', 21, 420, '#FFD27A', 70); } },
    { z: 0.6, draw: () => { bldgV(230, 1000, 300, 360, '#3A4560', 'DHRUVA', GREEN, t, seg(t, 0.05, 0.4)); bldgV(790, 1000, 360, 440, '#2E2440', 'ROCKSTAR INDIA', GOLD, t, seg(t, 0.15, 0.5));
      walkers(t, 16, 260, 790, 1060, wk, GREEN, 3);
      if (t > D * 0.6) { const k = seg(t, D * 0.6, D * 0.6 + 0.4); modemBox(260, 1130, 0.6, t, k); txt('→', CX - 20, 1128, 80, GOLD, 'Oswald', 700); withT(760, 1128, back(k), 0, () => { P(rr(-120, -44, 240, 88, 22), '#14161C', GOLD, 5); txt('GTA', 0, 3, 56, C.white, 'Oswald', 700); }); } } },
    { z: 0.9, draw: () => { floorV(1180, '#141A30', '#080A18'); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.04, ease(t / d)));
  { const k = back(seg(t, D * 0.08, D * 0.08 + 0.3)); if (k > 0) withT(CX, 300, k, 0, () => txtStroke('~300', 0, 0, 120, GOLD, C.ink, 11)); }
  chipV('LOG ROCKSTAR INDIA MEIN SHAAMIL', CX, 410, back(seg(t, D * 0.25, D * 0.25 + 0.35)), C.white, 40, C.ink);
  srcChipV('SOURCE: Wikipedia · PC Gamer · 80.lv', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B0F24', '#2A1A4E'); bokeh(t, 12, GOLD, 61); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 58px Oswald'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -62, w, 124, 36), col, C.ink, 5); P(poly([-20, 60, 10, 60, -30, 98]), col, C.ink, 5); txt(s, 0, 3, 58, C.ink); }); };
      retroPC(330, 900, 0.6, t, () => { txt('GTA-LEVEL?', -60, -150, 44, GREEN, 'Oswald', 700); });
      bub('BHARAT KA GTA-LEVEL GAME: KAB?', CX, 380, 0.4, GOLD); bub('COMMENT KARO!', 560, 1080, 1.6, '#9DC4FF');
      floorV(1240, '#1B2236', '#0B1020'); person(820, 1240, 'mahila', { t, s: 1.0, look: -0.3, mood: 0.7, arms: [[0.3, 0.2], [-2.1, -0.4]] }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  vignette();
};
