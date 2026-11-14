// ===== Awazzzz Originals — HONEY TRAP FILES · Ep 1 (2.5D)
let GT = 0;
function act(id) { const L = LINES[id]; return L && GT >= L.start && GT < L.start + L.dur; }
function talk(id) { const L = LINES[id]; if (!L) return 0; const k = Math.floor((GT - L.start) * 30); const a = AMP[id]; if (!a || k < 0 || k >= a.length) return 0; return a[k]; }
function lt(id) { return GT - LINES[id].start; }
function after(id, o = 0) { return LINES[id] && GT >= LINES[id].start + o; }

KINDS.eng = { body: '#3A6EA5', body2: '#2D5785', skin: '#C68E62', hair: 'short', h: 0.98 };
KINDS.sci = { body: '#E6E0D0', body2: '#CFC8B6', skin: '#C99470', hair: 'buzz', h: 1, glasses: true };
KINDS.zara = { body: '#6E2F86', body2: '#55236A', skin: '#E9BC98', hair: 'bob', h: 0.93, lips: true };
KINDS.judge = { body: '#15161B', body2: '#0C0D11', skin: '#C08A64', hair: 'short', h: 1.02, glasses: true, tie: '#F2F2F2' };
KINDS.you = { body: '#2E7D5B', body2: '#236247', skin: '#C68E62', hair: 'short', h: 0.98 };
KINDS.sailor = { body: '#F2F2F2', body2: '#DADADA', skin: '#B97E55', hair: 'cap', h: 0.97 };

// ---------- 2.5D helpers ----------
// layers: [{z, draw}] z=0 far … 1 near. Camera pan/zoom moves near layers more than far ones.
function depth(L, px = 0, py = 0, zoom = 1, haze = 'rgba(10,14,26,0.28)') {
  L.forEach((l, i) => {
    ctx.save(); const s = 1 + (zoom - 1) * (0.25 + l.z);
    ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2 - px * l.z, -H / 2 - py * l.z);
    l.draw(); ctx.restore();
    if (l.haze && haze) { ctx.fillStyle = haze; ctx.fillRect(0, 0, W, H); }
  });
}
function drift(t, d, a = 60) { const k = ease(seg(t, 0, d)); return lerp(-a, a, k); }
function shadow(x, y, w, a = 0.35) { ctx.save(); ctx.globalAlpha = a; P(ell(x, y, w, w * 0.16), '#000', null); ctx.restore(); }
function lightPool(x, y, r, col = C.amber, a = 0.3) { glow(x, y, r, col, a); }
function sky(c1, c2) { ctx.fillStyle = grad(0, H, c1, c2); ctx.fillRect(-300, -300, W + 600, H + 600); }
function bokeh(t, n, col, seed = 1) { for (let i = 0; i < n; i++) { const x = (rnd(i + seed) * W * 1.3 + t * 12 * (rnd(i) - 0.5)) - 150, y = rnd(i * 3 + seed) * H * 0.8; alpha(0.12 + rnd(i + 4) * 0.18, () => P(circ(x, y, 18 + rnd(i + 2) * 40), col, null)); } }
function tag(s, x, y, size = 24, col = C.amber, bg = 'rgba(11,15,23,0.72)') { ctx.font = `600 ${size}px Oswald`; const w = ctx.measureText(s).width + 36; P(rr(x, y - size * 0.95, w, size * 1.9, size * 0.95), bg, null); txt(s, x + w / 2, y, size, col, 'Oswald', 600); }
function sanketik() { tag('SANKETIK CHITRAN', W - 300, 1010 - 0, 22, C.grey); }
function card(x, y, w, h, col = C.paper, rot = 0, fn) { withT(x, y, 1, rot, () => { shadow(0, h / 2 + 14, w * 0.45, 0.3); P(rr(-w / 2, -h / 2, w, h, 10), col, C.ink, 5); if (fn) fn(); }); }
function pin(x, y, col = C.red) { P(circ(x, y, 13), col, C.ink, 3); alpha(0.5, () => P(circ(x - 4, y - 4, 4), '#fff', null)); }
function checkRow(s, x, y, ok, t, size = 46) { const k = back(seg(t, 0, 0.3)); if (k <= 0) return; withT(x, y, k, 0, () => { P(circ(0, 0, 32), ok ? C.green2 : C.red, C.ink, 5); if (ok) { ctx.strokeStyle = C.white; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-3, 12); ctx.lineTo(16, -12); ctx.stroke(); } else { line(-12, -12, 12, 12, C.white, 9); line(12, -12, -12, 12, C.white, 9); } txt(s, 60, 3, size, C.white, 'Oswald', 600, 'left'); }); }
function folder(x, y, s = 1, col = '#E8B04A', label = '') { withT(x, y, s, 0, () => { P(rr(-60, -48, 50, 20, 6), col, C.ink, 4); P(rr(-60, -36, 120, 84, 8), col, C.ink, 4); if (label) txt(label, 0, 8, 26, C.ink, 'Oswald', 700); }); }
function phoneUI(x, y, s, t, fn, frame = '#14171F') { withT(x, y, s, 0, () => { shadow(0, 360, 200, 0.35); P(rr(-190, -380, 380, 760, 46), frame, C.ink, 6); P(rr(-172, -350, 344, 700, 30), '#0E1420', null); ctx.save(); ctx.beginPath(); ctx.roundRect(-172, -350, 344, 700, 30); ctx.clip(); fn(); ctx.restore(); P(rr(-50, -368, 100, 14, 7), '#000', null); }); }
function msg(x, y, w, me, k, text = null, col = null) { if (k <= 0) return; withT(x + (me ? 0 : 0), y, back(k), 0, () => { const c = col || (me ? '#1F6E50' : '#2A3245'); P(rr(me ? -w : 0, -28, w, 56, 18), c, null); if (text) txt(text, me ? -w / 2 : w / 2, 0, 24, C.white, 'Baloo2', 700); else { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(me ? -w + 18 : 18, -6, w - 46, 10); } }); }
function heart(x, y, s, col = '#FF4F7A') { withT(x, y, s, 0, () => { const p = new Path2D('M0 18 C-30 -2 -26 -30 0 -16 C26 -30 30 -2 0 18 Z'); P(p, col, C.ink, 3); }); }
function missile(x, y, s, t = 0) { withT(x, y, s, 0, () => { P(rr(-260, -26, 470, 52, 26), '#D8DCE3', C.ink, 5); P(poly([210, -26, 290, 0, 210, 26]), '#C23B32', C.ink, 5); P(poly([-230, -26, -270, -70, -200, -26]), '#9AA3B2', C.ink, 4); P(poly([-230, 26, -270, 70, -200, 26]), '#9AA3B2', C.ink, 4); line(-120, -26, -120, 26, '#9AA3B2', 3); line(60, -26, 60, 26, '#9AA3B2', 3); txt('BRAHMOS', -30, 3, 30, '#4A5466', 'Oswald', 700); }); }
function truck(x, y, s, col = '#4E5B3A') { withT(x, y, s, 0, () => { P(rr(-340, -70, 520, 60, 8), col, C.ink, 5); P(rr(180, -150, 150, 140, 14), col, C.ink, 5); P(rr(220, -130, 80, 56, 6), '#9CC3E0', C.ink, 3); for (const wx of [-280, -170, -60, 240]) { P(circ(wx, 0, 36), '#1A1A1A', C.ink, 4); P(circ(wx, 0, 14), '#777', null); } }); }
function building(x, y, w, h, col, win = C.amber, seed = 1) { P(rr(x, y - h, w, h, 4), col, C.ink, 4); for (let r = 0; r < h / 60 - 1; r++) for (let c = 0; c < w / 60 - 1; c++) { const on = rnd(seed + r * 9 + c) > 0.55; P(rr(x + 24 + c * 60, y - h + 26 + r * 60, 32, 36, 3), on ? win : 'rgba(0,0,0,0.35)', null); } }
function gavel(x, y, s, a) { withT(x, y, s, a, () => { P(rr(-12, -10, 24, 200, 8), C.wood, C.ink, 4); P(rr(-70, -60, 140, 60, 14), C.wood2, C.ink, 5); }); }
function siren(x, y, t) { const on = Math.floor(t * 6) % 2; glow(x - 40, y, 260, on ? '#FF2E2E' : '#2E6BFF', 0.55); P(rr(x - 70, y - 14, 140, 28, 10), '#222', C.ink, 3); P(rr(x - 64, y - 10, 60, 20, 6), on ? '#FF4A4A' : '#5A1414', null); P(rr(x + 4, y - 10, 60, 20, 6), on ? '#1A2A6A' : '#3A7BFF', null); }
function apk(x, y, s, bad = true) { withT(x, y, s, 0, () => { P(rr(-70, -90, 140, 180, 12), '#E9EEF5', C.ink, 5); P(poly([30, -90, 70, -50, 30, -50]), '#C9D2DE', C.ink, 4); txt('.APK', 0, -10, 40, '#2E6BD8'); if (bad) { P(ell(0, 52, 30, 22), '#2BAA4A', C.ink, 4); for (let i = -1; i <= 1; i++) { line(-30, 52 + i * 12, -46, 46 + i * 16, C.ink, 4); line(30, 52 + i * 12, 46, 46 + i * 16, C.ink, 4); } P(circ(-10, 46, 5), C.red, null); P(circ(10, 46, 5), C.red, null); } }); }
function laptopB(x, y, s, label, col = '#2A2F3A', screen = '#0F1726', fn) { withT(x, y, s, 0, () => { shadow(0, 14, 230, 0.3); P(rr(-180, -230, 360, 230, 12), col, C.ink, 5); P(rr(-165, -216, 330, 200, 6), screen, null); if (fn) { ctx.save(); ctx.beginPath(); ctx.rect(-165, -216, 330, 200); ctx.clip(); fn(); ctx.restore(); } P(poly([-220, 0, 220, 0, 200, -16, -200, -16]), '#3A404C', C.ink, 5); if (label) txt(label, 0, 46, 34, C.white); }); }
function globe(x, y, r, t) { withT(x, y, 1, 0, () => { glow(0, 0, r * 1.6, C.blue, 0.35); P(circ(0, 0, r), '#173A6B', C.ink, 6); ctx.save(); ctx.clip(circ(0, 0, r)); ctx.strokeStyle = 'rgba(160,200,255,0.35)'; ctx.lineWidth = 3; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(0, 0, Math.abs(Math.cos(t * 0.4 + i * 0.45)) * r, r, 0, 0, 6.28); ctx.stroke(); line(-r, i * r / 4, r, i * r / 4, 'rgba(160,200,255,0.25)', 3); } for (let i = 0; i < 7; i++) { const a = (t * 0.25 + rnd(i) * 6.28) % 6.28, xx = Math.sin(a) * r * 0.8, yy = (rnd(i + 3) - 0.5) * r * 1.4; if (Math.cos(a) > 0) P(ell(xx, yy, 40 + rnd(i) * 60, 26 + rnd(i + 1) * 40), '#2E7D5B', null); } ctx.restore(); P(circ(0, 0, r), null, C.ink, 6); }); }

const DRAW = {};
// ===================== HOOK
DRAW.stock = (t, d) => {
  const px = drift(t, d, 50);
  depth([
    { z: 0.1, haze: 1, draw: () => { sky('#07101E', '#0F1B30'); for (let r = 0; r < 9; r++) for (let c = 0; c < 14; c++) { const v = rnd(r * 14 + c + Math.floor(t * 2)); txt((v > 0.5 ? '▲ ' : '▼ ') + (v * 4).toFixed(1) + '%', 90 + c * 140, 60 + r * 60, 22, v > 0.5 ? C.green2 : C.red2, 'Oswald', 500); } } },
    { z: 0.5, draw: () => { shadow(960, 880, 650, 0.4); P(rr(300, 150, 1320, 700, 18), '#0B1120', C.ink, 10); ctx.save(); ctx.beginPath(); ctx.rect(310, 160, 1300, 680); ctx.clip();
        for (let i = 0; i < 8; i++) line(330, 220 + i * 80, 1590, 220 + i * 80, 'rgba(255,255,255,0.06)', 2);
        const k = seg(t, 0.3, 4.0); ctx.beginPath(); let lx = 330, ly = 500; for (let i = 0; i <= 160 * k; i++) { const u = i / 160; lx = 330 + u * 1240; ly = u < 0.62 ? 520 - u * 260 + wob(u * 7, 1, 14) : 360 + (u - 0.62) * 1050 + wob(u * 9, 1, 8); i ? ctx.lineTo(lx, ly) : ctx.moveTo(lx, ly); }
        ctx.strokeStyle = k > 0.62 ? C.red : C.green; ctx.lineWidth = 8; ctx.stroke(); glow(lx, ly, 120, k > 0.62 ? C.red : C.green, 0.6); P(circ(lx, ly, 12), k > 0.62 ? C.red : C.green, C.ink, 3);
        line(330 + 0.62 * 1240, 180, 330 + 0.62 * 1240, 820, 'rgba(244,208,111,0.5)', 3); txt('MARKET OPEN', 330 + 0.62 * 1240, 200, 26, C.amber, 'Oswald', 500);
        txt('NVDA', 360, 790, 60, C.white, 'Oswald', 700, 'left'); ctx.restore(); } },
    { z: 1, draw: () => { P(rr(-100, 960, W + 200, 200, 0), '#121826', C.ink, 6); P(rr(1500, 860, 90, 110, 12), '#5A3A24', C.ink, 5); for (let i = 0; i < 3; i++) { ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1530 + i * 14, 850); ctx.quadraticCurveTo(1520 + i * 14 + wob(t, 0.7, 10, i), 800, 1530 + i * 14, 760); ctx.stroke(); } } },
  ], px, 0, lerp(1.0, 1.1, ease(t / d)));
  if (t > 3.0) withT(1350, 300, back(seg(t, 3.0, 3.4)), 0.05, () => { P(rr(-210, -70, 420, 140, 14), C.red, C.ink, 6); txt('▼ ~7%', 0, 4, 96, C.white); });
  banner('9 NOVEMBER 2026', 'NVIDIA · BAZAAR KHULTE HI', 70, 120, t - 0.3, C.amber);
  vignette();
};
DRAW.memo = (t, d) => {
  const px = drift(t, d, 40);
  depth([
    { z: 0.1, haze: 1, draw: () => { sky('#0E1424', '#161D30'); P(rr(1000, 120, 760, 420, 8), '#0A1328', C.ink, 6); ctx.save(); ctx.beginPath(); ctx.rect(1004, 124, 752, 412); ctx.clip(); stars(30); skyline(560, '#16233F', 21, 260, C.amber, 50); ctx.restore(); } },
    { z: 0.55, draw: () => { lightPool(560, 640, 420, C.amber, 0.25); shadow(560, 1050, 150); person(560, 1050, 'jensen', { t, s: 1.45, look: 0.7, mood: -0.6, brow: -1 }); } },
    { z: 1, draw: () => { P(rr(820, 800, 1200, 300, 6), C.wood, C.ink, 6); laptopB(1240, 810, 1.6, null, '#2A2F3A', '#F6F7F9', () => { ctx.fillStyle = '#E3E7EE'; ctx.fillRect(-165, -216, 330, 26); txt('To: All NVIDIA', -150, -175, 14, '#333', 'Inter', 600, 'left'); txt('Subject: A personal message', -150, -150, 14, C.ink, 'Inter', 700, 'left'); const n = Math.floor(t * 12); for (let i = 0; i < Math.min(8, n / 3); i++) { ctx.fillStyle = '#9AA3B2'; ctx.fillRect(-150, -122 + i * 14, 250 * (0.5 + rnd(i) * 0.5), 6); } }); } },
  ], px, 0, lerp(1.02, 1.12, ease(t / d)));
  banner('8 NOVEMBER', 'JENSEN HUANG KA STAFF KE NAAM KHAT', 70, 120, t - 0.3, C.amber);
  vignette();
};
DRAW.mss = (t, d) => {
  depth([
    { z: 0.15, draw: () => { ctx.fillStyle = '#6E4C30'; ctx.fillRect(-200, -200, W + 400, H + 400); paperTex(0, 0, W, H, 9); } },
    { z: 0.7, draw: () => {
      card(560, 560, 300, 360, C.white, -0.05, () => { P(rr(-130, -160, 260, 250, 4), '#24324E', null); ctx.save(); ctx.beginPath(); ctx.rect(-130, -160, 260, 250); ctx.clip(); person(0, 170, 'jensen', { t: 0, s: 0.7 }); ctx.restore(); txt('JENSEN HUANG', 0, 135, 30, C.ink, 'Kalam', 700); pin(0, -168); });
      card(1360, 560, 300, 360, C.white, 0.05, () => { P(rr(-130, -160, 260, 250, 4), '#2B1220', null); ctx.save(); ctx.beginPath(); ctx.rect(-130, -160, 260, 250); ctx.clip(); alpha(0.9, () => person(0, 170, 'alice', { t: 0, s: 0.7, shades: true, mood: 0 })); ctx.restore(); txt('?', 90, -120, 70, C.red, 'Oswald', 700); txt('"BUSINESS EXECUTIVE"', 0, 135, 24, C.ink, 'Kalam', 700); pin(0, -168); });
      card(960, 230, 300, 150, C.red2, 0.03, () => { txt('MSS', 0, -18, 64, C.amber); txt('China ki khufiya agency', 0, 40, 24, C.paper, 'Oswald', 500); pin(0, -78, C.amber); });
      const k1 = ease(seg(t, 0.6, 1.8)), k2 = ease(seg(t, 2.0, 3.2)); ctx.strokeStyle = C.red; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(1360, 392); ctx.lineTo(lerp(1360, 960, k1), lerp(392, 160, k1)); ctx.stroke();
      if (k2 > 0) { ctx.beginPath(); ctx.moveTo(1360, 392); ctx.quadraticCurveTo(960, 500 + 120 * k2, lerp(1360, 560, k2), 392); ctx.stroke(); }
    } },
  ], drift(t, d, 40), 0, lerp(1.0, 1.08, ease(t / d)));
  if (t > 3.2) stamp('REPORTS · KHUFIYA MEMO', 960, 800, 54, C.red, t - 3.2, -0.04);
  vignette();
};
DRAW.world = (t, d) => {
  depth([
    { z: 0.05, draw: () => { sky('#050912', '#0B1426'); stars(120); } },
    { z: 0.4, draw: () => globe(960, 560, 300, t) },
    { z: 0.9, draw: () => { const cards = [['BREAKING', C.red, 420, 300], ['NVIDIA', C.green2, 1500, 280], ['SPY?', C.amber, 380, 800], ['$$$', '#2E6BD8', 1540, 820]]; cards.forEach(([s, col, x, y], i) => { const k = back(seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3)); if (k > 0) withT(x + wob(t, 0.3, 14, i), y + wob(t, 0.25, 10, i + 1), k, (i % 2 ? 0.06 : -0.06), () => { shadow(0, 100, 160, 0.3); P(rr(-170, -80, 340, 160, 14), '#F2EEE3', C.ink, 5); P(rr(-170, -80, 340, 46, [14, 14, 0, 0]), col, C.ink, 5); txt(s, 0, -56, 30, C.white); for (let j = 0; j < 3; j++) { ctx.fillStyle = 'rgba(30,30,30,0.35)'; ctx.fillRect(-140, -12 + j * 26, 240 + rnd(j + i) * 40, 10); } }); }); } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.06, ease(t / d)));
  if (t > d - 2.4) withT(960, 560, back(seg(t, d - 2.4, d - 2.0)), 0, () => { glow(0, 0, 260, C.amber, 0.4); txtStroke('?', 0, 0, 300, C.amber, C.ink, 18); });
  vignette();
};
DRAW.india = (t, d) => {
  const second = after('n06'); const px = drift(t, d, 50);
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#140A06', '#2A1408'); for (let i = 0; i < 70; i++) { const x = rnd(i) * W, y = rnd(i + 5) * H; alpha(0.25, () => P(circ(x, y, 3), C.amber, null)); } } },
    { z: 0.4, draw: () => { // abstract board with city pins (no outline map)
      P(rr(260, 140, 1400, 760, 20), 'rgba(255,170,60,0.06)', 'rgba(255,170,60,0.35)', 4);
      for (let i = 0; i < 14; i++) line(260 + i * 100, 140, 260 + i * 100, 900, 'rgba(255,170,60,0.08)', 2); for (let i = 0; i < 8; i++) line(260, 140 + i * 100, 1660, 140 + i * 100, 'rgba(255,170,60,0.08)', 2);
      const cities = [['NAGPUR', 'BrahMos', 960, 460], ['PUNE', 'DRDO', 700, 640], ['VISAKHAPATNAM', 'Navy', 1280, 620]];
      cities.forEach(([n, s, x, y], i) => { const k = back(seg(t, 0.6 + i * 0.5, 1.0 + i * 0.5)); if (k <= 0) return; glow(x, y, 160, C.red, 0.4 + wob(t, 1, 0.1, i)); withT(x, y, k, 0, () => { pin(0, 0); tag(n + ' · ' + s, 24, -40, 28, C.white, 'rgba(120,20,20,0.85)'); }); });
      const mk = ease(seg(t, 1.6, 3.8)); missile(lerp(300, 1500, mk), 280 - Math.sin(mk * 3.14) * 60, 0.6);
    } },
  ], px, 0, lerp(1.0, 1.1, ease(t / d)));
  if (second) { const u = lt('n06'); alpha(seg(u, 0, 0.4), () => { ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H); }); folder(960, 560, lerp(0.6, 3.2, easeOut(seg(u, 0.2, 1.2))), '#E8B04A'); if (u > 1.4) stamp('HONEY TRAP FILES', 960, 580, 80, C.red, u - 1.4, -0.06); }
  vignette();
};
DRAW.title = (t, d) => {
  fillAll('#0A0D16'); glow(960, 420, 700, C.amber, 0.25);
  // honey drips from top
  for (let i = 0; i < 12; i++) { const x = 80 + i * 160 + rnd(i) * 40, len = 60 + rnd(i + 2) * 180 * ease(seg(t, 0, 1.5 + rnd(i))); ctx.fillStyle = '#E8A93B'; ctx.fillRect(x - 14, 0, 28, len); P(circ(x, len, 20), '#F4C35A', null); alpha(0.4, () => P(circ(x - 6, len - 6, 6), '#FFF3C4', null)); }
  ctx.fillStyle = '#E8A93B'; ctx.fillRect(0, 0, W, 40);
  const k = easeOut(seg(t, 0.2, 0.5));
  withT(960, 470, lerp(1.5, 1, k), 0, () => alpha(k, () => { txtStroke('HONEY TRAP', 0, -60, 190, C.amber, C.ink, 22); txtStroke('FILES', 0, 120, 150, C.white, C.ink, 20); }));
  if (t > 0.9) withT(1440, 300, back(seg(t, 0.9, 1.2)), 0.12, () => { P(rr(-120, -44, 240, 88, 10), C.red, C.ink, 5); txt('FILE #1', 0, 3, 54, C.white); });
  if (t > 1.1) handwrite('China ne Jensen ko phasaaya? Ab Bharat ki files', 960, 760, 54, t - 1.1, C.white, 1.2);
  alpha(seg(t, 1.6, 2.0), () => { tag('AAROP ≠ SAABOOT · SOURCES DESCRIPTION MEIN', 640, 880, 26, C.grey); });
  alpha(seg(t, 0.4, 0.8), () => { logoCircle(960 - 250, 960, 40); brandText(960 - 195, 962, 50, 'left'); });
  vignette();
};
function chapter(n, title) { return (t, d) => { fillAll('#0B0F17'); paperTex(0, 0, W, H, n * 13); glow(960, 520, 600, C.amber, 0.12); handwrite('Part ' + n, 960, 400, 60, t - 0.1, C.amber, 0.4); handwrite(title, 960, 540, 120, t - 0.5, C.white, 0.9); const k = seg(t, 1.3, 1.8); ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(960 - 380 * k, 640); ctx.lineTo(960 + 380 * k, 640); ctx.stroke(); vignette(); sceneFade(t, d, 0.2, 0.25); }; }
DRAW.ch1 = chapter(1, 'Shahad ka Jaal'); DRAW.ch2 = chapter(2, 'BrahMos ka Engineer'); DRAW.ch3 = chapter(3, "'Zara' ki Chat");
DRAW.ch4 = chapter(4, 'Ek hi Playbook'); DRAW.ch5 = chapter(5, 'Aap Kaise Bachein');

// ===================== PART 1
DRAW.honey = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#2A1606', '#120A04'); bokeh(t, 26, C.amber, 3); } },
    { z: 0.6, draw: () => { lightPool(960, 520, 520, C.amber, 0.35); shadow(960, 860, 240, 0.45);
      P(rr(800, 420, 320, 440, 60), 'rgba(255,220,150,0.25)', C.ink, 6); ctx.save(); ctx.clip(rr(806, 426, 308, 428, 56)); ctx.fillStyle = '#E8A93B'; ctx.fillRect(800, 520 + wob(t, 0.5, 6), 320, 400); alpha(0.4, () => P(ell(900, 600, 40, 120), '#FFE7A8', null)); ctx.restore();
      P(rr(820, 380, 280, 60, 12), '#B8822E', C.ink, 5); txt('SHAHAD', 960, 640, 54, '#5A3A10');
      const k = seg(t, 0.8, 3.0); // drip forms a hook
      ctx.strokeStyle = '#E8A93B'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1110, 440); ctx.quadraticCurveTo(1300, 420, 1320, 440 + 200 * k); if (k > 0.7) ctx.arc(1270, 640, 50, 0, Math.PI * ((k - 0.7) / 0.3)); ctx.stroke();
    } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.12, ease(t / d)));
  banner('HONEY TRAP', 'JASOOSI KI SABSE PURAANI CHAAL', 70, 120, t - 0.4, C.amber);
  vignette();
};
DRAW.chat = (t, d) => {
  const steps = ['DOSTI', 'BHAROSA', 'JAANKAARI', 'JAAL']; const sAt = [0.2, 1.3, 2.4, LINES.d02 ? LINES.d02.start - (GT - t) + 0.4 : 9];
  depth([
    { z: 0.1, haze: 1, draw: () => { sky('#0D1222', '#1A1F33'); P(rr(120, 140, 560, 380, 8), '#0A1328', C.ink, 6); ctx.save(); ctx.beginPath(); ctx.rect(124, 144, 552, 372); ctx.clip(); stars(20); P(circ(560, 240, 40), '#F2EBD0', null); skyline(540, '#16233F', 4, 220, C.amber, 40); ctx.restore(); } },
    { z: 0.5, draw: () => { P(rr(140, 760, 760, 120, 40), '#4A3A5A', C.ink, 6); P(rr(180, 640, 680, 160, 40), '#5A4870', C.ink, 6); glow(520, 600, 260, '#7FB4FF', 0.35); person(520, 980, 'you', { t, s: 1.25, sit: false, look: 0.4, mood: act('d02') ? 0 : 1, arms: [[0.4, 0.6], [-0.9, -1.4]], prop: (l, r) => P(rr(r[0] - 18, r[1] - 50, 34, 60, 6), '#111', C.ink, 3) }); } },
    { z: 0.95, draw: () => phoneUI(1360, 520, 1.05, t, () => {
      ctx.fillStyle = '#121A2A'; ctx.fillRect(-172, -350, 344, 80); P(circ(-120, -310, 26), '#B85A8A', C.ink, 3); heart(-120, -310, 0.6, '#FFD1E0'); txt('New friend', -80, -318, 22, C.white, 'Baloo2', 700, 'left'); txt('online', -80, -292, 16, C.green, 'Inter', 600, 'left');
      const base = GT - t; const at = s => seg(GT, base + s, base + s + 0.3);
      msg(-150, -220, 230, false, at(0.4), 'Hi! 😊'); msg(150, -150, 150, true, at(1.0), null); msg(-150, -80, 260, false, at(1.6), null);
      if (LINES.d01) msg(-150, -10, 300, false, seg(GT, LINES.d01.start, LINES.d01.start + 0.3), 'Profile impressive hai!', '#7A2B5A');
      msg(150, 60, 200, true, seg(GT, LINES.d01 ? LINES.d01.start + 2.0 : 99, (LINES.d01 ? LINES.d01.start : 99) + 2.3), null);
      if (LINES.d02) msg(-150, 140, 300, false, seg(GT, LINES.d02.start, LINES.d02.start + 0.3), 'Bas ek file bhej do na 🙏', '#9E2A22');
      if (LINES.d02 && GT > LINES.d02.start + 0.8) { const k = seg(GT, LINES.d02.start + 0.8, LINES.d02.start + 1.1); withT(0, 260, back(k), 0, () => { P(rr(-120, -36, 240, 72, 18), '#E8B04A', C.ink, 3); txt('📎 secret.pdf', 0, 2, 26, C.ink, 'Baloo2', 800); }); }
    }) },
  ], drift(t, d, 30), 0, lerp(1.0, 1.05, ease(t / d)));
  steps.forEach((s, i) => { const on = t > sAt[i]; withT(160 + i * 210, 130, 1, 0, () => { P(rr(-90, -32, 180, 64, 32), on ? (i == 3 ? C.red : C.amber) : 'rgba(20,24,36,0.8)', C.ink, 4); txt(s, 0, 2, 28, on ? C.ink : C.grey); }); if (i < 3) txt('→', 160 + i * 210 + 105, 130, 32, C.grey); });
  if (act('d01') || act('d02')) dramaTag(act('d01') ? lt('d01') : lt('d02'));
  vignette();
};
DRAW.phone = (t, d) => {
  const sp = easeOut(seg(t, 0, 0.5));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W / 2 - 6, H); ctx.clip();
  sky('#2A1E14', '#120C08'); lightPool(480, 400, 400, C.amber, 0.25);
  P(rr(260, 200, 440, 760, 6), '#5A3A24', C.ink, 6); P(rr(290, 230, 380, 700, 4), '#6E4A2E', C.ink, 4); P(rr(600, 560, 40, 90, 8), C.amber2, C.ink, 4); P(rr(330, 300, 300, 80, 6), '#2A1B14', null); txt('HOTEL · 1970s', 480, 340, 34, C.amber);
  alpha(seg(t, 2.0, 2.4), () => { line(220, 260, 740, 920, C.red, 18); });
  P(rr(40, 40, 230, 70, 6), C.ink, null); txt('PEHLE', 155, 75, 44, C.amber); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(W / 2 + 6, 0, W / 2, H); ctx.clip(); ctx.translate((1 - sp) * 960, 0);
  sky('#0A1022', '#141C33'); glow(1440, 520, 500, '#7FB4FF', 0.25);
  phoneUI(1440, 560, 0.95, t, () => { ctx.fillStyle = '#1A2338'; ctx.fillRect(-172, -350, 344, 700); for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) P(rr(-140 + i * 80, -300 + j * 90, 56, 56, 14), ['#2E6BD8', '#1E9E5A', '#E8B04A', '#B85A8A'][(i + j) % 4], null); });
  const k = ease(seg(t, 1.0, 3.5)); ctx.strokeStyle = 'rgba(244,208,111,0.85)'; ctx.lineWidth = 5;
  for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(1440 + i * 70, 560 - 460 * k); ctx.lineTo(1440 + i * 70 * (1 - k * 0.5), 560 + 460 * k); ctx.stroke(); ctx.beginPath(); ctx.moveTo(1440 - 300 * k, 560 + i * 90 * k); ctx.lineTo(1440 + 300 * k, 560 + i * 90 * k); ctx.stroke(); }
  P(rr(W / 2 + 40, 40, 200, 70, 6), C.ink, null); txt('AAJ', W / 2 + 140, 75, 44, C.green); ctx.restore();
  line(W / 2, 0, W / 2, H, C.ink, 12); vignette();
};

// ===================== PART 2 — BrahMos
DRAW.nagpur = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#F2A65A', '#6A88B8'); P(circ(1500, 300, 90), '#FFE3A8', null); glow(1500, 300, 400, '#FFE3A8', 0.5); } },
    { z: 0.25, haze: 1, draw: () => { P(ell(400, 760, 900, 220), '#7A6A8E', null); P(ell(1500, 780, 900, 240), '#6E6284', null); } },
    { z: 0.5, draw: () => { ctx.fillStyle = '#6E7E5A'; ctx.fillRect(-200, 720, W + 400, 500); building(980, 760, 700, 300, '#C9C2B2', '#2A3550', 7); P(rr(1080, 420, 500, 70, 8), '#0E2A5A', C.ink, 5); txt('BRAHMOS AEROSPACE', 1330, 457, 40, C.white); } },
    { z: 1, draw: () => { shadow(700, 960, 420, 0.4); truck(700, 950, 1.2); withT(560, 820, 1.2, -0.08 - 0.12 * ease(seg(t, 0.5, 3)), () => missile(0, 0, 1)); } },
  ], drift(t, d, 70), 0, lerp(1.0, 1.1, ease(t / d)));
  banner('FILE #1 · NAGPUR', 'BHARAT + RUSSIA · SUPERSONIC CRUISE MISSILE', 70, 120, t - 0.3, C.amber);
  vignette();
};
DRAW.engineer = (t, d) => {
  depth([
    { z: 0.1, haze: 1, draw: () => { sky('#1E2A3C', '#2A3A52'); for (let i = 0; i < 4; i++) P(rr(140 + i * 440, 140, 360, 260, 8), '#0F1A2C', C.ink, 4); for (let i = 0; i < 4; i++) { ctx.save(); ctx.beginPath(); ctx.rect(144 + i * 440, 144, 352, 252); ctx.clip(); missile(320 + i * 440, 270, 0.55); ctx.restore(); } } },
    { z: 0.55, draw: () => { lightPool(900, 640, 360, '#9CC3E0', 0.3); shadow(820, 1000, 150); person(820, 1000, 'eng', { t, s: 1.35, look: 0.8, mood: 0.6, arms: [[0.3, 0.3], [-1.0, -1.2]] }); } },
    { z: 1, draw: () => { P(rr(900, 760, 900, 40, 8), '#8C9BB0', C.ink, 5); laptopB(1250, 760, 1.3, null, '#2A2F3A', '#0F1726', () => { for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 3 ? 'rgba(43,255,136,0.6)' : 'rgba(244,208,111,0.7)'; ctx.fillRect(-150, -200 + i * 20, 120 + rnd(i + Math.floor(t * 3)) * 160, 8); } }); } },
  ], drift(t, d, 40), 0, lerp(1.02, 1.1, ease(t / d)));
  banner('NISHANT AGRAWAL', 'SENIOR SYSTEMS ENGINEER · BRAHMOS', 70, 120, t - 0.3, C.amber); sanketik();
  vignette();
};
DRAW.profiles = (t, d) => {
  depth([
    { z: 0.1, draw: () => { sky('#0E1424', '#1A2340'); bokeh(t, 20, '#3A7BD5', 7); } },
    { z: 0.8, draw: () => {
      const names = ['Sejal Kapoor', 'Neha Sharma', 'Pooja Ranjan'];
      names.forEach((n, i) => { const k = back(seg(t, 0.3 + i * 0.5, 0.7 + i * 0.5)); if (k <= 0) return; withT(480 + i * 480, 540 + (i == 1 ? -30 : 20), k, (i - 1) * 0.05, () => {
        shadow(0, 280, 190, 0.35); P(rr(-200, -260, 400, 520, 16), '#F4F6FA', C.ink, 5); P(rr(-200, -260, 400, 110, [16, 16, 0, 0]), '#3B5998', C.ink, 5);
        P(circ(0, -130, 70), '#C9D2DE', C.ink, 5); alpha(0.6, () => { P(circ(0, -150, 26), '#8A94A6', null); P(ell(0, -95, 44, 30), '#8A94A6', null); });
        txt(n, 0, -20, 38, C.ink, 'Baloo2', 800); for (let j = 0; j < 4; j++) { ctx.fillStyle = '#C9D2DE'; ctx.fillRect(-150, 30 + j * 34, 300 * (0.5 + rnd(i + j) * 0.5), 14); }
        P(rr(-130, 190, 260, 50, 25), '#3B5998', null); txt('+ Add Friend', 0, 216, 26, C.white, 'Baloo2', 700); }); });
      names.forEach((n, i) => { if (t > 2.4 + i * 0.35) stamp('FARZI?', 480 + i * 480, 690, 64, C.red, t - 2.4 - i * 0.35, -0.15); });
    } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.05, ease(t / d)));
  banner('PROSECUTION KA DAAWA', 'FACEBOOK PAR FARZI PROFILES', 70, 120, t - 0.3, C.red);
  vignette();
};
DRAW.arrest = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#050912', '#0E1628'); stars(60); skyline(700, '#141C2E', 51, 380, '#3A4A6A', 70); } },
    { z: 0.45, draw: () => { ctx.fillStyle = '#1A1F2B'; ctx.fillRect(-200, 760, W + 400, 500); building(1100, 800, 640, 420, '#2A2F3E', '#F4D06F', 13); } },
    { z: 1, draw: () => { const k = ease(seg(t, 0, 1.4)); withT(lerp(-300, 600, k), 920, 1.6, 0, () => { P(rr(-130, -70, 260, 64, 14), '#E8E8E8', C.ink, 4); P(rr(-80, -110, 160, 50, 12), '#E8E8E8', C.ink, 4); txt('ATS', 0, -36, 30, '#1A2A6A'); P(circ(-80, -4, 22), '#111', null); P(circ(80, -4, 22), '#111', null); }); siren(lerp(-300, 600, k), 920 - 1.6 * 116, t);
      if (t > 1.6) for (let i = 0; i < 2; i++) { const u = seg(t, 1.6 + i * 0.3, 3.4); shadow(lerp(780, 1060 + i * 160, ease(u)), 1060, 90); person(lerp(780, 1060 + i * 160, ease(u)), 1060, 'inspector', { t, s: 1.15, walk: u * 3, look: 1, mood: 0, brow: 1 }); } } },
  ], drift(t, d, 40), 0, 1.04);
  banner('OCTOBER 2018', 'UP + MAHARASHTRA ATS', 70, 120, t - 0.3, C.amber);
  vignette();
};
DRAW.files = (t, d) => {
  const n = Math.min(19, Math.floor(seg(t, 0.6, 3.6) * 19 + 0.0001));
  depth([
    { z: 0.1, haze: 1, draw: () => { sky('#0E1424', '#1B2438'); bokeh(t, 18, C.green, 11); } },
    { z: 0.8, draw: () => {
      laptopB(480, 760, 1.25, 'OFFICIAL', '#2E3B55', '#0F1726', () => { txt('BRAHMOS', 0, -120, 40, C.green); }); laptopB(1440, 760, 1.25, 'PERSONAL', '#5A3A5A', '#0F1726', () => { for (let i = 0; i < n; i++) folder(-130 + (i % 7) * 44, -180 + Math.floor(i / 7) * 60, 0.32, C.amber); });
      for (let i = 0; i < 19; i++) { const st = 0.6 + i * 0.16, u = seg(t, st, st + 0.6); if (u > 0 && u < 1) folder(lerp(480, 1440, ease(u)), 500 - Math.sin(u * 3.14) * 220, 0.5, C.amber); }
      withT(960, 420, 1, 0, () => { P(rr(-160, -50, 320, 100, 14), C.ink, null); txt(n + ' / 19', 0, 3, 64, C.amber); });
      if (t > 4.2) { const k = back(seg(t, 4.2, 4.6)); withT(1440, 340, k, 0, () => apk(0, 0, 0.8, true)); ctx.setLineDash([14, 12]); ctx.strokeStyle = C.red; ctx.lineWidth = 5; const u = seg(t, 4.6, 5.8); ctx.beginPath(); ctx.moveTo(1500, 300); ctx.lineTo(lerp(1500, 1780, u), lerp(300, 120, u)); ctx.stroke(); ctx.setLineDash([]); if (u > 0.9) txt('?', 1800, 110, 90, C.red); }
    } },
  ], drift(t, d, 25), 0, 1.02);
  banner('AAROP', '19 GOPNIYA FILES · PERSONAL LAPTOP', 70, 120, t - 0.3, C.red);
  vignette();
};
function courtSet(t, judge = true) {
  sky('#2A1C14', '#160E0A'); for (let i = 0; i < 9; i++) P(rr(100 + i * 210, 120, 120, 640, 6), '#4A3222', C.ink, 4);
  lightPool(960, 300, 500, C.amber, 0.3);
  P(rr(560, 480, 800, 300, 8), C.wood, C.ink, 6); P(rr(600, 520, 720, 30, 4), C.wood2, null);
  if (judge) person(960, 600, 'judge', { t, s: 1.05, mood: 0, look: 0 });
  P(rr(520, 600, 880, 340, 8), '#6A4428', C.ink, 6); P(circ(960, 700, 70), '#C9A227', C.ink, 5); txt('⚖', 960, 702, 70, C.ink);
}
DRAW.verdict = (t, d) => {
  depth([{ z: 0.2, draw: () => courtSet(t) }, { z: 1, draw: () => { const sl = seg(t, 1.0, 1.25); gavel(1340, 860, 1.4, lerp(-0.9, 0.25, easeIn(sl)) - (t > 1.25 ? 0.25 * (1 - seg(t, 1.25, 1.6)) : 0)); P(rr(1180, 960, 340, 40, 8), C.wood2, C.ink, 4); } }], drift(t, d, 30), 0, 1.05);
  if (t > 1.25) stamp('UMRQAID · 2024', 600, 300, 80, C.red, t - 1.25, -0.08);
  if (t > 2.6) { const k = easeOut(seg(t, 2.6, 3.4)); withT(1380, 420, lerp(0.1, 1, k), lerp(6.28, -0.06, k), () => { P(rr(-380, -230, 760, 460, 6), '#F2EEE3', C.ink, 6); paperTex(-380, -230, 760, 460, 5); txt('DAINIK KHABAR', 0, -180, 44, C.ink, 'Kalam', 700); line(-340, -150, 340, -150, C.ink, 4); txt('HONEY TRAP MEIN', 0, -90, 66, C.ink); txt('PHANSA "JASOOS"', 0, -10, 66, C.red); for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(30,30,30,0.35)'; ctx.fillRect(-330, 60 + i * 28, 660 * (0.6 + rnd(i) * 0.4), 11); } }); }
  banner('NAGPUR SESSIONS COURT', null, 70, 120, t - 0.3, C.amber);
  vignette();
};
DRAW.rewind = (t, d) => {
  courtSet(t); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) { const y = (rnd(i) * H + t * 900 * (0.5 + rnd(i + 3))) % H; ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(0, y, W, 3 + rnd(i) * 8); }
  const sh = wob(t, 13, 8); txtStroke('◀◀', 960 + sh, 420, 200, C.white, C.ink, 14); txtStroke('LEKIN…', 960 - sh, 640, 130, C.amber, C.ink, 14);
};
DRAW.hc = (t, d) => {
  const second = after('n18', -0.2);
  if (!second) {
    depth([
      { z: 0.05, haze: 1, draw: () => { sky('#6A88B8', '#C9D8E8'); } },
      { z: 0.5, draw: () => { ctx.fillStyle = '#7E8B6A'; ctx.fillRect(-200, 820, W + 400, 400); P(rr(460, 260, 1000, 560, 6), '#D9CDB0', C.ink, 6); for (let i = 0; i < 6; i++) { P(rr(520 + i * 160, 440, 100, 380, [50, 50, 0, 0]), '#3A3226', C.ink, 4); } P(poly([440, 260, 960, 120, 1480, 260]), '#B49A6A', C.ink, 6); P(rr(760, 300, 400, 80, 6), C.paper, C.ink, 4); txt('HIGH COURT', 960, 342, 50, C.ink); } },
      { z: 1, draw: () => { for (const x of [200, 1720]) { P(ell(x, 760, 120, 200), '#3E6B3A', C.ink, 5); P(rr(x - 14, 900, 28, 120, 6), C.wood, C.ink, 4); } } },
    ], drift(t, d, 50), 0, lerp(1.0, 1.08, ease(t / d)));
    banner('DECEMBER 2025', 'BOMBAY HIGH COURT · NAGPUR BENCH', 70, 120, t - 0.3, C.amber);
    const r0 = LINES.n17.start - (GT - t);
    alpha(seg(t, r0 + 3.0, r0 + 3.3), () => { P(rr(560, 440, 820, 300, 18), 'rgba(8,11,18,0.82)', null); });
    checkRow('JASOOSI KA AAROP', 640, 520, false, t - (r0 + 3.2)); checkRow('DATA PAKISTAN GAYA? SAABIT NAHI', 640, 640, false, t - (r0 + 6.2), 40);
  } else {
    const u = lt('n18') + 0.2; fillAll('#0E1424'); glow(960, 540, 700, C.green, 0.12);
    P(rr(360, 220, 1200, 560, 20), 'rgba(255,255,255,0.04)', C.grey, 3);
    checkRow('JASOOSI', 440, 320, false, 9); checkRow('CYBER TERRORISM', 440, 420, false, 9);
    checkRow('GOPNIYA FILES BINA IJAAZAT RAKHNA', 440, 560, true, u - 0.4, 44);
    if (u > 2.6) withT(960, 700, back(seg(u, 2.6, 3.0)), 0, () => { P(rr(-300, -54, 600, 108, 14), C.amber, C.ink, 5); txt('SAZA: 3 SAAL', 0, 3, 70, C.ink); });
    if (u > 4.2) stamp('PEHLE HI KAAT CHUKE', 960, 860, 56, C.green, u - 4.2, -0.05);
  }
  vignette();
};
DRAW.lesson = (t, d) => {
  fillAll('#0B0F17'); paperTex(0, 0, W, H, 61); glow(960, 540, 600, C.amber, 0.15);
  withT(960, 360, back(seg(t, 0, 0.35)), -0.03, () => { P(rr(-260, -70, 520, 140, 16), C.amber, C.ink, 6); txt('SABAK #1', 0, 4, 86, C.ink); });
  handwrite('Headline  ≠  Faisla', 960, 640, 120, t - 0.7, C.white, 1.0);
  vignette();
};

// ===================== PART 3 — DRDO
DRAW.pune = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#8EB6DC', '#DDE9F2'); for (let i = 0; i < 5; i++) P(ell(200 + i * 420 + t * 8, 200 + rnd(i) * 80, 140, 40), 'rgba(255,255,255,0.8)', null); } },
    { z: 0.3, haze: 1, draw: () => { skyline(760, '#9AA7B8', 81, 300, '#C9D3DF', 60); } },
    { z: 0.6, draw: () => { ctx.fillStyle = '#7E8B6A'; ctx.fillRect(-200, 760, W + 400, 500); building(560, 820, 800, 380, '#E9E4D6', '#2A3550', 3); P(rr(660, 360, 600, 70, 8), '#0E2A5A', C.ink, 5); txt('DRDO · R&DE (ENGINEERS)', 960, 397, 38, C.white); } },
    { z: 1, draw: () => { shadow(1560, 1040, 140); person(1560, 1040, 'sci', { t, s: 1.4, look: -0.8, mood: 0.4 }); } },
  ], drift(t, d, 60), 0, lerp(1.0, 1.08, ease(t / d)));
  banner('FILE #2 · PUNE', 'PRADEEP KURULKAR · PURV DIRECTOR (AAROPI)', 70, 120, t - 0.3, C.amber); sanketik();
  vignette();
};
DRAW.zchat = (t, d) => {
  const rev = after('n22', 0.6);
  depth([
    { z: 0.1, haze: 1, draw: () => { sky('#141A2A', '#1E2640'); bokeh(t, 14, '#1E9E5A', 21); } },
    { z: 0.5, draw: () => { lightPool(520, 560, 360, '#7FB4FF', 0.3); shadow(520, 1020, 150); person(520, 1020, 'sci', { t, s: 1.35, look: 0.8, mood: 0.6, arms: [[0.3, 0.3], [-0.9, -1.4]], prop: (l, r) => P(rr(r[0] - 18, r[1] - 50, 34, 60, 6), '#111', C.ink, 3) }); } },
    { z: 0.95, draw: () => phoneUI(1340, 540, 1.05, t, () => {
      ctx.fillStyle = '#075E54'; ctx.fillRect(-172, -350, 344, 84);
      if (!rev) { P(circ(-120, -308, 28), '#E9BC98', C.ink, 3); P(rr(-146, -340, 52, 22, 10), '#141217', null); } else { P(circ(-120, -308, 28), '#111', C.ink, 3); txt('?', -120, -306, 36, C.red); }
      txt("Zara Dasgupta", -80, -318, 24, C.white, 'Baloo2', 800, 'left'); txt(rev ? '???' : 'London · online', -80, -290, 16, rev ? C.red : '#B2F2D4', 'Inter', 600, 'left');
      ctx.fillStyle = '#0B141A'; ctx.fillRect(-172, -266, 344, 620);
      for (let i = 0; i < 7; i++) msg(i % 2 ? 150 : -150, -210 + i * 74, 150 + rnd(i) * 110, i % 2 == 1, seg(t, 0.3 + i * 0.45, 0.6 + i * 0.45), null, i % 2 ? '#005C4B' : '#202C33');
    }) },
  ], drift(t, d, 30), 0, lerp(1.0, 1.05, ease(t / d)));
  if (!rev) banner('ATS CHARGESHEET KE MUTABIQ', "'LONDON KI SOFTWARE ENGINEER'", 70, 120, t - 0.3, C.amber);
  else { alpha(seg(lt('n22'), 0.6, 1.0), () => { ctx.fillStyle = 'rgba(80,0,0,0.25)'; ctx.fillRect(0, 0, W, H); }); stamp("ATS KA DAAWA: PAKISTANI OPERATIVE", 900, 200, 50, C.red, lt('n22') - 0.8, -0.03); }
  vignette();
};
DRAW.quote = (t, d) => {
  depth([
    { z: 0.1, draw: () => { sky('#1A1612', '#0E0B08'); lightPool(960, 400, 700, C.amber, 0.2); } },
    { z: 0.8, draw: () => { withT(960, 540, 1, -0.02, () => { shadow(0, 440, 520, 0.4); P(rr(-560, -420, 1120, 840, 6), '#F2EEE3', C.ink, 6); paperTex(-560, -420, 1120, 840, 8);
      txt('CHARGESHEET · ATS (AAROP)', 0, -350, 44, C.ink, 'Oswald', 700); line(-500, -310, 500, -310, C.ink, 4);
      for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(30,30,30,0.3)'; ctx.fillRect(-500, -270 + i * 34, 1000 * (0.6 + rnd(i) * 0.4), 12); }
      const k = seg(t, 1.0, 2.2); P(rr(-520, -100, 1040 * k + 1, 150, 8), 'rgba(244,208,111,0.75)', null);
      txt('"I have initial design report, some 184 A4', 0, -60, 46, C.ink, 'Kalam', 700); txt('pages, on all BrahMos versions"', 0, 4, 46, C.ink, 'Kalam', 700);
      for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(30,30,30,0.3)'; ctx.fillRect(-500, 110 + i * 34, 1000 * (0.6 + rnd(i + 7) * 0.4), 12); } }); } },
  ], drift(t, d, 20), 0, lerp(1.0, 1.08, ease(t / d)));
  if (t > 2.6) withT(1600, 220, back(seg(t, 2.6, 3.0)), 0.06, () => { P(rr(-170, -50, 340, 100, 14), C.red, C.ink, 5); txt('184 PANNE', 0, 3, 58, C.white); });
  vignette();
};
DRAW.list = (t, d) => {
  fillAll('#0E1424'); glow(960, 500, 700, C.red, 0.1);
  const items = [['BRAHMOS', () => missile(0, 0, 0.45)], ['AGNI-6', () => withT(0, 0, 0.45, -1.2, () => missile(0, 0, 1))], ['RAFALE', () => { P(poly([-120, 10, 120, 0, -120, -10]), '#AEB8C2', C.ink, 4); P(poly([-20, 0, -80, 70, -40, 0]), '#8A94A6', C.ink, 4); P(poly([-20, 0, -80, -70, -40, 0]), '#8A94A6', C.ink, 4); }], ['DRONE', () => { P(rr(-40, -16, 80, 32, 10), '#555', C.ink, 4); for (const s of [-1, 1]) { line(s * 40, 0, s * 100, -30, C.ink, 5); P(ell(s * 100, -34, 50, 10), 'rgba(180,180,180,0.6)', C.ink, 2); } }]];
  items.forEach(([s, fn], i) => { const k = back(seg(t, 0.4 + i * 0.6, 0.8 + i * 0.6)); if (k <= 0) return; withT(330 + i * 420, 440, k, 0, () => { shadow(0, 170, 160); P(rr(-180, -150, 360, 300, 20), '#1C2538', C.amber, 4); withT(0, -30, 1, 0, fn); txt(s, 0, 100, 44, C.amber); }); });
  const r0 = LINES.n24.dur * 0.55;
  if (t > r0) { withT(960, 830, back(seg(t, r0, r0 + 0.4)), 0, () => { apk(-140, 0, 0.9, true); txt('APP LINK = MALWARE', 140, 0, 54, C.red, 'Oswald', 700, 'left'); }); }
  banner('AAROP', 'BAATEIN BRAHMOS SE AAGE GAYIN', 70, 120, t - 0.3, C.red);
  vignette();
};
DRAW.court2 = (t, d) => {
  const second = after('n26', -0.2);
  if (!second) {
    fillAll('#0E1424'); line(260, 560, 1660, 560, C.grey, 8);
    const ev = [['2023', 'GIRAFTAARI', 460, 0.4], ['JUNE 2026', 'AAROP TAY', 960, 2.2], ['?', 'MUQADMA JAARI', 1460, 4.0]];
    ev.forEach(([y, s, x, at], i) => { const k = back(seg(t, at, at + 0.35)); if (k <= 0) return; withT(x, 560, k, 0, () => { P(circ(0, 0, 30), i == 2 ? C.amber : C.red, C.ink, 5); txt(y, 0, -90, 64, C.white); tag(s, -140, 90, 34, C.ink, i == 2 ? C.amber : C.paper); }); });
    banner('PUNE SPECIAL COURT', null, 70, 120, t - 0.3, C.amber);
  } else {
    const u = lt('n26') + 0.2; fillAll(C.bg); const tilt = wob(u, 0.35, 0.05);
    line(960, 260, 960, 820, C.amber, 12); P(rr(860, 820, 200, 40, 8), C.amber, C.ink, 5);
    withT(960, 300, 1, tilt, () => { line(-460, 0, 460, 0, C.amber, 12); for (const s of [-1, 1]) { line(s * 440, 0, s * 440 - 120, 260, C.ink, 4); line(s * 440, 0, s * 440 + 120, 260, C.ink, 4); P(ell(s * 440, 270, 170, 30), C.amber2, C.ink, 5); } });
    withT(960 - 440, 520, 1, 0, () => { P(rr(-170, -80, 340, 120, 14), C.red, C.ink, 5); txt('PROSECUTION', 0, -40, 34, C.white); txt('"Gopniya thi"', 0, 4, 32, C.white, 'Kalam'); });
    withT(960 + 440, 520, 1, 0, () => { P(rr(-170, -80, 340, 120, 14), C.green2, C.ink, 5); txt('BACHAAV', 0, -40, 34, C.ink); txt('"Pehle se public"', 0, 4, 32, C.ink, 'Kalam'); });
    if (u > 2.5) stamp('INKAAR · MUQADMA JAARI', 960, 170, 56, C.amber, u - 2.5, -0.03);
  }
  vignette();
};
DRAW.wanted = (t, d) => {
  depth([
    { z: 0.05, draw: () => { sky('#06090F', '#0E1424'); } },
    { z: 0.5, draw: () => { P(rr(-100, 120, W + 200, 900, 0), '#2A2F3A', null); for (let i = 0; i < 30; i++) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(rnd(i) * W, 120 + rnd(i + 2) * 900, 120, 60); } lightPool(960, 300, 420, '#DDE1E7', 0.3); } },
    { z: 0.8, draw: () => { withT(960, 560, 1, -0.02, () => { shadow(0, 420, 320, 0.4); P(rr(-330, -400, 660, 800, 6), '#E9DDB8', C.ink, 6); paperTex(-330, -400, 660, 800, 4); txt('FARAAR', 0, -320, 100, C.red2); P(rr(-220, -230, 440, 360, 4), '#1A1A1A', C.ink, 4); alpha(0.9, () => { P(circ(0, -80, 80), '#0A0A0A', null); P(ell(0, 80, 150, 90), '#0A0A0A', null); }); txt('?', 0, -70, 110, C.red); txt("'ZARA DASGUPTA'", 0, 200, 56, C.ink); txt('(FARZI NAAM · ATS KE MUTABIQ)', 0, 262, 28, '#5A4A2A', 'Oswald', 500); }); } },
    { z: 1, draw: () => rain(t, 120) },
  ], drift(t, d, 30), 0, lerp(1.0, 1.1, ease(t / d)));
  vignette();
};

// ===================== PART 4
DRAW.pattern = (t, d) => {
  depth([
    { z: 0.1, draw: () => { ctx.fillStyle = '#5E4128'; ctx.fillRect(-200, -200, W + 400, H + 400); paperTex(0, 0, W, H, 33); } },
    { z: 0.7, draw: () => {
      const cards = [['NAVY', 'VISAKHAPATNAM', 380, 350], ['AIR FORCE', 'JAWAAN', 1540, 350], ['DRDO', 'PUNE', 380, 740], ['BRAHMOS', 'NAGPUR', 1540, 740]];
      cards.forEach(([a, b, x, y], i) => { const k = back(seg(t, 0.3 + i * 0.45, 0.7 + i * 0.45)); if (k <= 0) return; withT(x, y, k, (i % 2 ? 0.05 : -0.05), () => { shadow(0, 120, 170); P(rr(-200, -110, 400, 220, 8), C.white, C.ink, 5); txt(a, 0, -30, 60, C.ink); txt(b, 0, 40, 30, '#555', 'Oswald', 500); pin(0, -116); }); });
      phoneUI(960, 560, 0.62, t, () => { ctx.fillStyle = '#1A2338'; ctx.fillRect(-172, -350, 344, 700); heart(0, 0, 3, '#FF4F7A'); });
      ctx.strokeStyle = C.red; ctx.lineWidth = 6; cards.forEach(([, , x, y], i) => { const u = seg(t, 2.4 + i * 0.3, 3.0 + i * 0.3); if (u > 0) { ctx.beginPath(); ctx.moveTo(x, y - 116); ctx.lineTo(lerp(x, 960, u), lerp(y - 116, 560, u)); ctx.stroke(); } });
    } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.06, ease(t / d)));
  banner('AAROP · KAI MAAMLE', 'EK HI TAREEQA: ONLINE JAAL', 70, 120, t - 0.3, C.amber);
  vignette();
};
DRAW.compare = (t, d) => {
  const r = after('n30', -0.1);
  ctx.fillStyle = '#16203A'; ctx.fillRect(0, 0, W / 2, H); ctx.fillStyle = '#2A1A10'; ctx.fillRect(W / 2, 0, W / 2, H); line(W / 2, 0, W / 2, H, C.ink, 12);
  txt('AMERICA', 480, 90, 56, C.amber); txt('BHARAT', 1440, 90, 56, C.amber);
  if (!r) { shadow(480, 900, 150); person(480, 900, 'jensen', { t, s: 1.3, look: 0.5, mood: -0.4, brow: -1 }); for (let i = 0; i < 3; i++) folder(1300 + i * 140, 640 - i * 30, 1.6, ['#E8B04A', '#D9963A', '#C9852E'][i], 'FILE ' + (i + 1)); }
  else { const u = lt('n30') + 0.1; const rows = [['NISHAANA', 'Chaabi waala insaan', 'Missile engineers', 0.2], ['TAREEQA', 'Dosti · taareef', 'Online profiles', LINES.n30.dur * 0.35], ['MAQSAD', 'Jaankaari · asar', 'Gopniya data', LINES.n30.dur * 0.68]];
    rows.forEach(([h, a, b, at], i) => { const k = back(seg(u, at, at + 0.35)); if (k <= 0) return; const y = 300 + i * 230; withT(960, y, k, 0, () => { P(rr(-170, -46, 340, 92, 46), C.red, C.ink, 5); txt(h, 0, 3, 48, C.white); }); withT(480, y, k, 0, () => txt(a, 0, 3, 50, C.white, 'Baloo2', 800)); withT(1440, y, k, 0, () => txt(b, 0, 3, 50, C.white, 'Baloo2', 800)); }); }
  if (!r) withT(960, 560, back(seg(t, 0.8, 1.2)), 0, () => { P(circ(0, 0, 80), C.amber, C.ink, 6); txt('=', 0, 4, 110, C.ink); });
  vignette();
};
DRAW.caveat = (t, d) => {
  fillAll(C.bg); const tilt = 0.12 + wob(t, 0.4, 0.03);
  line(960, 260, 960, 820, C.amber, 12); P(rr(860, 820, 200, 40, 8), C.amber, C.ink, 5);
  withT(960, 300, 1, tilt, () => { line(-460, 0, 460, 0, C.amber, 12); for (const s of [-1, 1]) { line(s * 440, 0, s * 440 - 120, 260, C.ink, 4); line(s * 440, 0, s * 440 + 120, 260, C.ink, 4); P(ell(s * 440, 270, 170, 30), C.amber2, C.ink, 5); } });
  withT(960 - 440 * Math.cos(tilt), 300 - 440 * Math.sin(tilt) + 190, 1, 0, () => { P(rr(-150, -80, 300, 110, 12), C.paper, C.ink, 4); txt('REPORTS', 0, -24, 48, C.ink); });
  withT(960 + 440 * Math.cos(tilt), 300 + 440 * Math.sin(tilt) + 190, 1, 0, () => { P(rr(-150, -80, 300, 110, 12), C.paper, C.ink, 4); txt('CHARGES: 0', 0, -24, 48, C.ink); });
  const chips = [['KOI CHARGE NAHI', 0.4], ['BOARD KI JAANCH JAARI', LINES.n31.dur * 0.38], ['CHINA: "BEBUNIYAAD"', LINES.n31.dur * 0.75]];
  chips.forEach(([s, at], i) => { const k = back(seg(t, at, at + 0.3)); if (k > 0) withT(960, 900 + (i - 1) * 0 , 1, 0, () => {}); if (k > 0) withT(330 + i * 630, 880, k, 0, () => { ctx.font = '700 30px Oswald'; const w = ctx.measureText(s).width + 44; P(rr(-w / 2, -32, w, 64, 32), C.green, C.ink, 4); txt(s, 0, 2, 30, C.ink); }); });
  banner('JENSEN KA MAAMLA', 'ABHI TAK SIRF REPORTS', 70, 120, t - 0.3, C.amber);
  vignette();
};

// ===================== PART 5
DRAW.tips = (t, d) => {
  fillAll('#0E1424'); glow(960, 300, 700, C.green, 0.1);
  txtStroke('AAP KAISE BACHEIN?', 960, 150, 90, C.white, C.ink, 12);
  const at = id => (LINES[id] ? LINES[id].start - (GT - t) : 99);
  const tips = [['n33', 'JALDI KAREEB + KAAM MEIN DILCHASPI', 'KHATRE KI GHANTI', (x, y) => { P(circ(x, y, 60), '#C9D2DE', C.ink, 5); txt('🔔', x + 50, y - 40, 54, C.amber); }],
    ['n34', 'ANJAAN LINK SE APP / APK', 'KABHI INSTALL NAHI', (x, y) => { apk(x, y, 0.75, true); line(x - 70, y - 90, x + 70, y + 90, C.red, 12); }],
    ['n35', 'OFFICE FILE · PERSONAL DEVICE', 'BILKUL NAHI', (x, y) => { withT(x, y + 80, 0.5, 0, () => laptopB(0, 0, 1, null)); line(x - 90, y - 60, x + 90, y + 80, C.red, 12); }]];
  tips.forEach(([id, a, b, ic], i) => { const k = back(seg(t, at(id), at(id) + 0.35)); if (k <= 0) return; const x = 340 + i * 620; withT(x, 580, k, 0, () => { shadow(0, 330, 230); P(rr(-270, -300, 540, 620, 24), '#1C2538', i == 0 ? C.amber : i == 1 ? C.red : C.green, 6); P(circ(-220, -250, 40), C.amber, C.ink, 4); txt(String(i + 1), -220, -247, 50, C.ink); ic(0, -90); const words = a.split(' '); const mid = Math.ceil(words.length / 2); txt(words.slice(0, mid).join(' '), 0, 90, 36, C.white, 'Oswald', 600); txt(words.slice(mid).join(' '), 0, 136, 36, C.white, 'Oswald', 600); P(rr(-220, 200, 440, 70, 35), i == 0 ? C.amber : i == 1 ? C.red : C.green, C.ink, 4); txt(b, 0, 236, 34, C.ink); }); });
  vignette();
};
DRAW.next = (t, d) => {
  const second = after('n37', -0.2);
  if (!second) {
    depth([{ z: 0.05, draw: () => { sky('#0A1022', '#141C33'); stars(80); } }, { z: 0.5, draw: () => { ctx.fillStyle = '#0E1A33'; ctx.fillRect(-200, 760, W + 400, 500); capitol(760, 800, 1.3, '#D9D3C2'); glow(760, 520, 500, C.amber, 0.12); } }], drift(t, d, 40), 0, lerp(1.0, 1.06, ease(t / d)));
    withT(1500, 470, back(seg(t, 0.4, 0.8)), 0.06, () => { shadow(0, 230, 170); P(rr(-170, -200, 340, 380, 14), C.white, C.ink, 6); P(rr(-170, -200, 340, 90, [14, 14, 0, 0]), C.red, C.ink, 6); txt('NOV', 0, -152, 54, C.white); txt('12', 0, 30, 170, C.ink); txt('ISTIFA', 0, 140, 40, C.red, 'Oswald', 700); });
    banner('JENSEN NE ISTIFA DIYA', 'AB CONGRESS MEIN GAWAAHI', 70, 120, t - 0.3, C.amber);
  } else {
    const u = lt('n37') + 0.2; fillAll('#0B0F17'); paperTex(0, 0, W, H, 71); glow(960, 520, 600, C.amber, 0.2);
    const k = easeOut(seg(u, 0, 0.8)); folder(lerp(-300, 960, k), 520, 3.2, '#E8B04A');
    if (u > 0.8) withT(960, 540, 1, 0, () => { txt('FILE #2', 0, -40, 90, C.ink); txt('ISLAMABAD', 0, 60, 70, C.red2); });
    if (u > 1.6) stamp('JALD AA RAHA HAI', 960, 900, 64, C.red, u - 1.6, -0.04);
  }
  vignette();
};
DRAW.question = (t, d) => {
  fillAll('#0B0F17'); paperTex(0, 0, W, H, 41);
  handwrite('Kya social media...', 960, 330, 96, t - 0.3, C.white, 1.0);
  handwrite('jasooson ka sabse bada hathiyaar hai?', 960, 470, 84, t - 1.8, C.amber, 1.4);
  if (t > 4.0) { for (let i = 0; i < 3; i++) withT(560 + i * 400, 780, back(seg(t, 4.0 + i * 0.3, 4.4 + i * 0.3)), 0, () => { P(rr(-170, -70, 340, 140, 30), ['#2B4A7A', '#2E7D5B', '#7A2B3A'][i], C.ink, 5); for (let j = 0; j < 3; j++) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-130, -36 + j * 26, 200 + rnd(i + j) * 50, 12); } }); txt('COMMENT MEIN BATAAIYE', 960, 640, 60, C.green); }
  vignette();
};
DRAW.end = (t, d) => {
  fillAll('#0A1022'); glow(560, 500, 700, C.amber, 0.18); glow(1400, 520, 700, ORANGE, 0.1);
  const lk = back(seg(t, 0.1, 0.6)); withT(560, 470, lk, 0, () => { glow(0, 0, 360, C.amber, 0.35); logoCircle(0, 0, 250); });
  alpha(seg(t, 0.4, 0.9), () => brandText(560, 800, 72, 'center'));
  alpha(seg(t, 0.8, 1.2), () => txt('Duniya Mein Kya Ho Raha Hai?', 560, 880, 40, C.amber, 'Kalam', 700));
  const D = LINES.n39.dur;
  const btn = (i, label, col, icon, at, done) => { const k = back(seg(t, at, at + 0.35)); if (k <= 0) return; const y = 300 + i * 190, x = 1380;
    withT(x, y, k * (t > at + 0.4 && t < at + 0.6 ? 1.08 : 1), 0, () => { P(rr(-300, -70, 600, 140, 70), done && t > at + 0.7 ? '#3A3F4B' : col, C.ink, 6); icon(-200, 0); txt(done && t > at + 0.7 ? done : label, 50, 4, 64, C.white); }); };
  const thumbI = (x, y) => { P(rr(x - 34, y - 6, 22, 44, 4), C.white, C.ink, 4); P(new Path2D(`M${x - 10} ${y - 6} L${x + 4} ${y - 40} Q${x + 18} ${y - 44} ${x + 16} ${y - 24} L${x + 12} ${y - 8} L${x + 34} ${y - 8} Q${x + 44} ${y - 4} ${x + 40} ${y + 8} L${x + 32} ${y + 34} Q${x + 28} ${y + 40} ${x + 18} ${y + 40} L${x - 10} ${y + 40} Z`), C.white, C.ink, 4); };
  const shareI = (x, y) => { P(new Path2D(`M${x - 34} ${y + 30} Q${x - 30} ${y - 16} ${x + 6} ${y - 16} L${x + 6} ${y - 38} L${x + 40} ${y - 4} L${x + 6} ${y + 30} L${x + 6} ${y + 8} Q${x - 18} ${y + 6} ${x - 34} ${y + 30} Z`), C.white, C.ink, 4); };
  const subI = (x, y) => { P(rr(x - 40, y - 28, 80, 56, 16), C.white, C.ink, 4); P(poly([x - 10, y - 14, x - 10, y + 14, x + 16, y]), '#E62117', null); };
  btn(0, 'LIKE', '#2E6BD8', thumbI, D * 0.22, 'LIKED'); btn(1, 'SHARE', '#1E9E5A', shareI, D * 0.45, null); btn(2, 'SUBSCRIBE', '#E62117', subI, D * 0.68, 'SUBSCRIBED');
  if (t > D * 0.68 + 0.8) withT(1730, 680, back(seg(t, D * 0.68 + 0.8, D * 0.68 + 1.2)), wob(t, 3, 0.25) * seg(t, D * 0.68 + 0.8, D * 0.68 + 2.5), () => { P(new Path2D('M-40 24 Q-40 -48 0 -48 Q40 -48 40 24 L52 36 L-52 36 Z'), C.amber, C.ink, 5); P(circ(0, 46, 11), C.amber, C.ink, 4); });
  sceneFade(t, d, 0.01, 1.0);
};

// ---------- channel branding ----------
const ORANGE = '#FF8A1E';
function logoCircle(x, y, r) { const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.clip(); if (L && L.complete) ctx.drawImage(L, x - r * 1.04, y - r * 1.04, r * 2.08, r * 2.08); ctx.restore(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.strokeStyle = C.amber; ctx.lineWidth = Math.max(2, r * 0.06); ctx.stroke(); }
function brandText(x, y, size, align = 'left') {
  ctx.font = `700 ${size}px Oswald`; const w1 = ctx.measureText('Awazzzz ').width, w2 = ctx.measureText('ORIGINALS').width;
  let x0 = align === 'left' ? x : align === 'right' ? x - w1 - w2 : x - (w1 + w2) / 2;
  txt('Awazzzz ', x0, y, size, C.white, 'Oswald', 700, 'left'); txt('ORIGINALS', x0 + w1, y, size, ORANGE, 'Oswald', 700, 'left'); return w1 + w2;
}
function watermark() { alpha(0.9, () => { ctx.font = '700 28px Oswald'; const w = ctx.measureText('Awazzzz ORIGINALS').width; P(rr(W - w - 110, 18, w + 90, 56, 28), 'rgba(8,11,18,0.6)', null); logoCircle(W - w - 82, 46, 24); brandText(W - 40, 47, 28, 'right'); }); }
function dramaTag(t) { alpha(0.85 * seg(t, 0, 0.3), () => { P(rr(W - 360, 88, 330, 46, 23), 'rgba(11,15,23,0.7)', null); txt('● NAATYA RUPANTAR', W - 195, 112, 24, C.amber, 'Oswald', 500); }); }

// ---------- subtitles ----------
function chunks(roman, dur) {
  const parts = roman.replace(/…/g, '…|').replace(/([.?!:])\s+/g, '$1|').replace(/ — /g, ' —|').split('|').map(s => s.trim()).filter(Boolean);
  const merged = []; parts.forEach(p => { if (merged.length && (merged[merged.length - 1] + ' ' + p).length < 58) merged[merged.length - 1] += ' ' + p; else merged.push(p); });
  const tot = merged.reduce((a, s) => a + s.length, 0); let acc = 0; return merged.map(s => { const st = acc / tot * dur; acc += s.length; return [st, acc / tot * dur, s]; });
}
const CH = {}; for (const id in LINES) CH[id] = chunks(LINES[id].roman, LINES[id].dur);
function subtitles() {
  for (const id in LINES) { if (!act(id)) continue; const u = GT - LINES[id].start; const c = CH[id].find(c => u >= c[0] && u < c[1] + 0.05) || CH[id][CH[id].length - 1];
    const name = { S: 'PROFILE' }[LINES[id].spk];
    ctx.font = '800 44px Baloo2'; const words = c[2].split(' '); const rows = ['']; words.forEach(w => { if (ctx.measureText(rows[rows.length - 1] + ' ' + w).width > 1500) rows.push(w); else rows[rows.length - 1] = (rows[rows.length - 1] + ' ' + w).trim(); });
    const bw = Math.max(...rows.map(r => ctx.measureText(r).width)) + 60; const bh = rows.length * 56 + 22; const y0 = 1045 - bh;
    P(rr(960 - bw / 2, y0, bw, bh, 14), 'rgba(8,11,18,0.72)', null);
    rows.forEach((r, i) => txt(r, 960, y0 + 40 + i * 56, 44, name ? C.amber : C.white, 'Baloo2', 800));
    if (name) { P(rr(960 - bw / 2, y0 - 40, 200, 40, 8), C.amber, null); txt(name, 960 - bw / 2 + 100, y0 - 19, 26, C.ink, 'Oswald', 700); }
  }
}
const NOSUB = new Set(['tips', 'end']); // card scenes carry their own text; subs still shown for tips (helpful)
function drawFrame(T) {
  GT = T; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H);
  const s = SCENES.find(s => T >= s.start && T < s.start + s.dur) || SCENES[SCENES.length - 1];
  ctx.save(); DRAW[s.id](T - s.start, s.dur, T); ctx.restore();
  const u = T - s.start; if (u < 0.12 && s.start > 0 && !s.id.startsWith('ch')) alpha(1 - u / 0.12, () => fillAll('#000'));
  if (s.id !== 'end') watermark();
  if (s.id !== 'end') subtitles();
}
