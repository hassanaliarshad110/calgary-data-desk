// ===== Awazzzz GTA blitz #26 — "Kya GTA 6 PC par aayega?" (FACT: GTA 6 announced only for PS5 + Xbox Series X|S, 19 Nov 2026; no official PC date, no PC pre-orders (Rockstar support page via tinyfish 10 Nov 2026; thetechhacker 17 Nov 2026; gamingroute upd. 3 Nov 2026). GTA V: consoles 17 Sep 2013 -> PC 14 Apr 2015 (~19 months). RDR2: consoles 26 Oct 2018 -> PC 5 Nov 2019 (~1 year).)
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters; "GTA 6" in Oswald (our font). No maps, no police uniforms or emblems, no court emblem.
// Studio library (select_assets.py): PRP-013 clock (SP.clock), PRP-014 monitor (pcMonitor), GFX-020 timeline (rollTimeline), VFX-011 impactStar (TWIST), VFX-015 stars, VFX-019 question (SP.question).
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

// ---------- spoken opening hook: "19 November ko GTA 6 aa raha hai. Par PC gamers ke liye?" ----------
DRAWV.hook1 = (t, d) => {
  const pcx = lerp(1350, 770, back(seg(t, 1.5, 2.1)));
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#0B0F24', '#3A1E5E'); stars(60); bokeh(t, 10, PURP, 3); } },
    { z: 0.3, draw: () => { skyline(820, '#1A1E48', 7, 280, '#FFD27A', 60); } },
    { z: 0.6, draw: () => { floorV(1180, '#1B2236', '#0B1020');
      tvSet(CX - 120, 640, 0.62, t, () => { glow(0, 0, 300, PURP, 0.5); txtStroke('GTA 6', 0, 10, 150, C.white, C.ink, 12); });
      boxConsole(150, 1180, 0.85, t, '#E8ECF2', '#1B1F2A'); boxConsole(320, 1180, 0.75, t, '#1B1F2A', '#2BFF88');
      calCard(800, 470, 0.8, 'NOVEMBER', '19', back(seg(t, 0.15, 0.5)));
      pcMonitor(pcx, 1010, 0.95, t); } },
  ], drift(t, d, 14), 0, lerp(1.0, 1.08, ease(t / d)));
  SP.question(t, 770, 880, 2.0, 1.2);
  const ki = back(seg(t, 2.2, 2.6)); if (ki > 0) withT(CX, 1130, ki, -0.03, () => { glow(0, 0, 300, GOLD, 0.4); P(rr(-300, -60, 600, 120, 60), GOLD, C.ink, 6); txt('PC GAMERS?', 0, 4, 60, C.ink); });
  vignette();
};

// ---------- n01: announced only for PS5 + Xbox Series X|S ----------
DRAWV.plat = (t, d) => {
  const D = LINES.n01.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0A1530', '#1F3A66'); bokeh(t, 12, CYAN, 9); } },
    { z: 0.5, draw: () => { floorV(1080, '#141A30', '#080A18'); glow(300, 900, 300, CYAN, 0.3); glow(780, 900, 300, GREEN, 0.25);
      boxConsole(300, 1050, 1.3, t, '#E8ECF2', '#1B1F2A'); boxConsole(780, 1050, 1.3, t, '#1B1F2A', '#2BFF88');
      platCard(300, 560, seg(t, D * 0.45, D * 0.45 + 0.35), 'PS5', 'PlayStation 5', CYAN); platCard(780, 560, seg(t, D * 0.55, D * 0.55 + 0.35), 'XBOX SERIES', 'X | S', GREEN);
      tickMark(300, 420, 0.8, back(seg(t, D * 0.6, D * 0.6 + 0.3))); tickMark(780, 420, 0.8, back(seg(t, D * 0.68, D * 0.68 + 0.3))); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('ROCKSTAR NE ANNOUNCE KIYA: SIRF 2', CX, 290, back(seg(t, 0.05, 0.4)), GOLD, 46, C.ink);
  chipV('PS5 · XBOX SERIES X|S · 19 NOV 2026', CX, 1140, back(seg(t, D * 0.75, D * 0.75 + 0.3)), C.white, 36, C.ink);
  srcChip('SOURCE: thetechhacker (17 Nov 2026), gamingroute', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- n02: no official PC date, no PC pre-order ----------
DRAWV.nopc = (t, d) => {
  const D = LINES.n02.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1E0F2E', '#3A2350'); bokeh(t, 12, RED, 31); } },
    { z: 0.5, draw: () => { pcMonitor(CX, 560, 1.5, t); SP.question(t, CX, 520, 0.2, 1.1);
      statusRow(CX, 900, seg(t, D * 0.15, D * 0.15 + 0.35), 'PC: OFFICIAL DATE', false);
      statusRow(CX, 1060, seg(t, D * 0.55, D * 0.55 + 0.35), 'PC: PRE-ORDER', false); } },
    { z: 0.9, draw: () => { floorV(1200, '#1E1028', '#0E0814'); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.04, ease(t / d)));
  chipV('PC NO OFFICIAL DATE (18 NOV 2026)', CX, 280, back(seg(t, 0.05, 0.4)), C.white, 44, C.ink);
  srcChip('SOURCE: Rockstar Support via tinyfish (10 Nov 2026)', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- n03 twist: GTA V Sep 2013 -> PC Apr 2015 (~19 months) ----------
DRAWV.gtav = (t, d) => {
  const D = LINES.n03.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1A1430', '#3D2A5A'); bokeh(t, 12, GOLD, 4); } },
    { z: 0.5, draw: () => { rollTimeline(t, D * 0.3, 110, 520, 380, [['GTA V · CONSOLE', 'PS3 / Xbox 360', 'SEP 2013', GOLD], ['GTA V · PC', 'Windows', 'APR 2015', GREEN]], D * 0.45);
      gapBadge(CX, 1070, seg(t, D * 0.78, D * 0.78 + 0.35), '~19 MAHINE', 'BAAD PC PAR', GOLD);
      SP.clock(850, 1060, 0.7, t); } },
    { z: 0.9, draw: () => { floorV(1220, '#1E1028', '#0E0814'); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.05, ease(t / d)));
  impactStarV(t, CX, 330, 0.05, 'TWIST!', 1.0);
  srcChip('SOURCE: Tom\'s Hardware (Feb 2015), Wikipedia: GTA V', seg(t, 1.2, 1.7));
  vignette();
};

// ---------- n04: RDR2 Oct 2018 -> PC Nov 2019 (~1 year) ----------
DRAWV.rdr2 = (t, d) => {
  const D = LINES.n04.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#2A1A12', '#5A3220'); bokeh(t, 12, '#FFB703', 14); } },
    { z: 0.5, draw: () => { rollTimeline(t, D * 0.15, 110, 520, 380, [['RED DEAD 2 · CONSOLE', 'PS4 / Xbox One', 'OCT 2018', '#FFB703'], ['RED DEAD 2 · PC', 'Windows', 'NOV 2019', GREEN]], D * 0.5);
      gapBadge(CX, 1070, seg(t, D * 0.72, D * 0.72 + 0.35), '~1 SAAL', 'BAAD PC PAR', '#FFB703');
      calCard(850, 1060, 0.5, 'SAAL', '1', back(seg(t, D * 0.8, D * 0.8 + 0.3)), '#FFB703'); } },
    { z: 0.9, draw: () => { floorV(1220, '#2A1A12', '#120A06'); } }],
    drift(t, d, 10), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('PICHHLA GAME BHI?', CX, 300, back(seg(t, 0.05, 0.4)), GOLD, 50, C.ink);
  srcChip('SOURCE: GameSpot (Rockstar, Oct 2019), Giant Bomb', seg(t, 0.4, 0.9));
  vignette();
};

// ---------- n05 payoff: pattern = wait, but no date; trust only Rockstar ----------
DRAWV.payoff = (t, d) => {
  const D = LINES.n05.dur, sw = easeInOut(seg(t, D * 0.5, D * 0.5 + 0.5));
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B0F24', '#2A1A4E'); stars(50); bokeh(t, 10, GOLD, 51); } },
    { z: 0.5, draw: () => { floorV(1180, '#141A30', '#080A18');
      withT(0, 0, 1, 0, () => { pcMonitor(330, 640, 1.05, t); hourglassV(780, 620, 0.9, t); });
      stampV(CX, 900, seg(t, D * 0.28, D * 0.28 + 0.3), 'GTA 6 PC DATE: PAKKI NAHI', '#FFB703', 64, -0.06);
      if (sw > 0) { rumourCard(300, 1080, sw); withT(760, 1080, back(sw), -0.03, () => { P(rr(-200, -90, 400, 180, 26), 'rgba(10,14,24,0.92)', GREEN, 5); txt('ROCKSTAR', 0, -24, 46, GREEN, 'Oswald', 700); txt('OFFICIAL = ✓', 0, 36, 36, C.white, 'Oswald', 700); }); } } }],
    drift(t, d, 10), 0, lerp(1.0, 1.04, ease(t / d)));
  chipV('PATTERN: INTEZAAR', CX, 300, back(seg(t, 0.1, 0.45)), C.white, 50, C.ink);
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B0F24', '#2A1A4E'); bokeh(t, 12, GOLD, 61); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 58px Oswald'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -60, w, 120, 36), col, C.ink, 5); P(poly([-20, 58, 10, 58, -30, 96]), col, C.ink, 5); txt(s, 0, 3, 58, C.ink); }); };
      floorV(1240, '#1B2236', '#0B1020');
      boxConsole(200, 1000, 0.9, t, '#E8ECF2', '#1B1F2A'); pcMonitor(560, 860, 0.8, t);
      bub('CONSOLE ABHI?', 330, 520, 0.3, GOLD); bub('YA PC KA INTEZAAR?', 520, 700, 1.0, '#9DC4FF');
      shadow(870, 1240, 110); person(870, 1240, 'mahila', { t, s: 1.05, look: -0.3, mood: 0.6, arms: [[0.3, 0.2], [-2.1, -0.4]] }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('COMMENT KARO!', CX, 300, back(seg(t, 0.1, 0.45)), GOLD, 50, C.ink);
  vignette();
};
function starP(x, y, r1, r2) { const p = new Path2D(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; i ? p.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : p.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } p.closePath(); return p; }
