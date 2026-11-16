// ===== Awazzzz Originals — GTA 6 SPECIAL #1 (2.5D)
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

// ===== GTA 6 SPECIAL #1 — Rockstar India (2.5D). No game footage, logos or characters: own art, generic props only.
KINDS.dev = { body: '#3B4A6B', body2: '#2E3A55', skin: '#C68E62', hair: 'short', h: 0.98, glasses: true };
KINDS.dev2 = { body: '#7A3B5A', body2: '#612E47', skin: '#D9A77E', hair: 'bob', h: 0.93 };
KINDS.prog = { body: '#E6E0D0', body2: '#CFC8B6', skin: '#C99470', hair: 'short', h: 1, glasses: true };
KINDS.tester = { body: '#2E7D5B', body2: '#236247', skin: '#C68E62', hair: 'bun', h: 0.94 };
KINDS.gamer = { body: '#D9534F', body2: '#B94440', skin: '#C68E62', hair: 'kid', h: 0.9 };
KINDS.ceo = { body: '#1B2233', body2: '#141A27', skin: '#EBC4A0', hair: 'short', tie: '#2E5FA8', h: 1.03, glasses: true };
const PINK = '#FF5FA2', TEAL = '#2EC4B6', SUN = '#FF8A3D';
function sanketikL(a = 1) { alpha(a, () => tag('SANKETIK CHITRAN', 40, 48, 22, C.grey)); }
const cnt = (t, t0, dur, to) => Math.round(to * easeOut(seg(t, t0, t0 + dur)));
const fmt = n => n.toLocaleString('en-IN');
const at = id => (LINES[id] ? LINES[id].start - (GT - SCT) : 99); // line start in scene time
let SCT = 0;
function controller(x, y, s, t = 0, col = '#2A2F3A') { withT(x, y, s, wob(t, 0.4, 0.04), () => {
  shadow(0, 120, 200, 0.3);
  P(new Path2D('M-190 -40 Q-200 -90 -120 -90 L120 -90 Q200 -90 190 -40 L230 80 Q245 140 180 140 Q140 140 110 90 L-110 90 Q-140 140 -180 140 Q-245 140 -230 80 Z'), col, C.ink, 6);
  P(circ(-120, -20, 34), '#1A1E26', C.ink, 4); P(circ(70, 30, 30), '#1A1E26', C.ink, 4); P(rr(-150, -28, 60, 16, 4), '#9AA3B2', null); P(rr(-128, -50, 16, 60, 4), '#9AA3B2', null);
  [[130, -40, '#2BD46A'], [170, -10, '#E2483D'], [90, -10, '#3A7BD5'], [130, 20, '#F4D06F']].forEach(([a, b, c]) => P(circ(a, b, 15), c, C.ink, 3));
  alpha(0.25, () => P(ell(-60, -70, 90, 12), '#fff', null)); }); }
function monitor(x, y, w, h, fn, col = '#20252F') { P(rr(x - 14, y + h / 2 + 6, 28, 50, 4), '#3A404C', C.ink, 4); P(rr(x - 70, y + h / 2 + 50, 140, 14, 6), '#3A404C', C.ink, 4); P(rr(x - w / 2, y - h / 2, w, h, 10), col, C.ink, 5); ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2 + 10, y - h / 2 + 10, w - 20, h - 20); ctx.clip(); ctx.translate(x, y); fn && fn(w - 20, h - 20); ctx.restore(); }
function desk(x, y, w) { P(rr(x - w / 2, y, w, 24, 6), C.wood, C.ink, 4); line(x - w / 2 + 30, y + 24, x - w / 2 + 30, y + 140, C.ink, 7); line(x + w / 2 - 30, y + 24, x + w / 2 - 30, y + 140, C.ink, 7); }
function clockFace(x, y, r, hr, mn, col = C.paper) { withT(x, y, 1, 0, () => { shadow(0, r + 16, r * 0.8, 0.3); P(circ(0, 0, r), col, C.ink, 6); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line(Math.sin(a) * r * 0.78, -Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.9, -Math.cos(a) * r * 0.9, C.ink, i % 3 ? 3 : 6); }
  const ah = (hr % 12 + mn / 60) / 12 * 6.283, am = mn / 60 * 6.283; line(0, 0, Math.sin(ah) * r * 0.5, -Math.cos(ah) * r * 0.5, C.ink, 9); line(0, 0, Math.sin(am) * r * 0.75, -Math.cos(am) * r * 0.75, C.red, 6); P(circ(0, 0, 8), C.ink, null); }); }
function calCard(x, y, s, top, big, sub, col = C.red, rot = 0.05) { withT(x, y, s, rot, () => { shadow(0, 210, 160); P(rr(-160, -190, 320, 360, 14), C.white, C.ink, 6); P(rr(-160, -190, 320, 86, [14, 14, 0, 0]), col, C.ink, 6); txt(top, 0, -146, 50, C.white); txt(big, 0, 30, 150, C.ink); if (sub) txt(sub, 0, 130, 36, col, 'Oswald', 700); }); }
function priceTag(x, y, s, a, b, col = C.amber, rot = -0.08) { withT(x, y, s, rot, () => { shadow(0, 110, 200, 0.3); P(new Path2D('M-230 -90 L170 -90 L250 0 L170 90 L-230 90 Z'), col, C.ink, 6); P(circ(185, 0, 16), C.ink, null); txt(a, -30, -36, 40, C.ink, 'Oswald', 600); txt(b, -30, 30, 80, C.ink); }); }
function coin(x, y, r, s = '₹') { P(circ(x, y + 6, r), '#B8862B', C.ink, 4); P(circ(x, y, r), '#F2C14E', C.ink, 4); txt(s, x, y + 2, r * 1.1, '#8A5A12'); }
function peopleIcon(x, y, sz, col) { P(circ(x, y - sz * 0.32, sz * 0.2), col, null); P(rr(x - sz * 0.26, y - sz * 0.08, sz * 0.52, sz * 0.52, sz * 0.2), col, null); }
function donut(x, y, r, frac, k, col, rest = 'rgba(255,255,255,0.12)') { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.arc(x, y, r * 0.58, 6.283, 0, true); ctx.fillStyle = rest; ctx.fill(); const a1 = -Math.PI / 2 + 6.283 * frac * k; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, a1); ctx.arc(x, y, r * 0.58, a1, -Math.PI / 2, true); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke(); }
function palm(x, y, s, t = 0, col = '#0E1A12') { withT(x, y, s, wob(t, 0.2, 0.03), () => { ctx.strokeStyle = col; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, -200, 10, -400); ctx.stroke(); for (let i = 0; i < 7; i++) { const a = -2.8 + i * 0.75 + wob(t, 0.3, 0.05, i); ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(10, -400); ctx.quadraticCurveTo(10 + Math.cos(a) * 110, -400 + Math.sin(a) * 110 - 40, 10 + Math.cos(a) * 200, -400 + Math.sin(a) * 200 + 40); ctx.stroke(); } }); }
function studio(x, y, s, sign, t = 0) { withT(x, y, s, 0, () => { shadow(0, 0, 420, 0.35); building(-380, 0, 760, 420, '#22304D', C.amber, 7); P(rr(-260, -470, 520, 70, 10), '#0E1424', C.amber, 4); txt(sign, 0, -434, 44, C.amber, 'Oswald', 700); P(rr(-70, -120, 140, 120, 6), '#0B1120', C.ink, 4); glow(0, -60, 160, C.amber, 0.25 + wob(t, 0.5, 0.05)); }); }
function reportCard(x, y, s, head, sub, rot, col = '#F2EEE3', hcol = C.red) { withT(x, y, s, rot, () => { shadow(0, 160, 220, 0.3); P(rr(-230, -150, 460, 300, 12), col, C.ink, 5); P(rr(-230, -150, 460, 70, [12, 12, 0, 0]), hcol, C.ink, 5); txt(head, 0, -114, 36, C.white, 'Oswald', 700); txt(sub, 0, -40, 30, C.ink, 'Oswald', 600); for (let j = 0; j < 4; j++) { ctx.fillStyle = 'rgba(30,30,30,0.3)'; ctx.fillRect(-190, 0 + j * 30, 300 + rnd(j + s * 7) * 70, 12); } }); }
function nightCity(t, seed = 3) { sky('#070B18', '#18203A'); stars(70); alpha(0.9, () => skyline(820, '#121A30', seed, 380, C.amber, 70)); }
function deskRow(t, y, n, x0, gap, s = 0.9) { for (let i = 0; i < n; i++) { const x = x0 + i * gap; monitor(x, y - 150, 190, 120, (w, h) => { ctx.fillStyle = '#0D1626'; ctx.fillRect(-w / 2, -h / 2, w, h); for (let j = 0; j < 5; j++) { ctx.fillStyle = [C.green2, C.amber, TEAL, PINK, '#7FB4FF'][(i + j) % 5]; ctx.fillRect(-w / 2 + 12, -h / 2 + 14 + j * 18, (w - 30) * (0.3 + rnd(i * 5 + j + Math.floor(t * 2)) * 0.6), 7); } }); glow(x, y - 150, 140, '#7FB4FF', 0.12); desk(x, y - 60, 230); person(x, y + 70, i % 2 ? 'dev2' : 'dev', { t: t + i, s, look: 0, sit: true, mood: 0.2 }); } }

const DRAW = {};
// ===================== HOOK
DRAW.blr = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => nightCity(t, 11) },
    { z: 0.45, draw: () => { lightPool(960, 640, 520, C.amber, 0.2); studio(960, 880, 1.0, 'BENGALURU STUDIO', t); } },
    { z: 0.95, draw: () => { ctx.fillStyle = '#0A0E18'; ctx.fillRect(-200, 900, W + 400, 300); palm(120, 960, 1.1, t); palm(1820, 980, 0.95, t + 1); } },
  ], drift(t, d, 40), 0, lerp(1.0, 1.12, ease(t / d)));
  withT(1450, 300, back(seg(t, 0.4, 0.8)), 0.04, () => { glow(0, 0, 260, C.red, 0.35); P(rr(-260, -80, 520, 160, 16), C.red, C.ink, 6); txt('SABSE BADI TEAM?', 0, 4, 64, C.white); });
  withT(470, 330, back(seg(t, 1.6, 2.0)), -0.05, () => { pin(-150, 0); tag('BENGALURU', -120, 4, 40, C.white, 'rgba(120,20,20,0.85)'); });
  banner('REPORTS KE MUTABIQ', 'GTA 6 · ROCKSTAR INDIA', 70, 120, t - 0.2, C.amber);
  vignette();
};
DRAW.midnight = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#0B0F22', '#2A1440'); bokeh(t, 22, PINK, 4); } },
    { z: 0.5, draw: () => { const k = easeOut(seg(t, 0.2, 2.6)); clockFace(620, 470, 230, 11, 60 * k); } },
    { z: 0.9, draw: () => { calCard(1340, 470, 1.15, 'NOVEMBER', '19', 'AADHI RAAT', C.red, 0.06); } },
  ], drift(t, d, 30), 0, lerp(1.02, 1.1, ease(t / d)));
  if (t > 2.6) withT(620, 470, 1, 0, () => alpha(seg(t, 2.6, 2.9), () => { glow(0, 0, 360, C.amber, 0.5); }));
  banner('19 NOVEMBER 2026', 'PS5 · XBOX SERIES X|S', 70, 120, t - 0.3, C.amber);
  vignette();
};
DRAW.preorder = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#081224', '#10203A'); for (let i = 0; i < 12; i++) line(0, 120 + i * 80, W, 120 + i * 80, 'rgba(255,255,255,0.04)', 2); } },
    { z: 0.6, draw: () => {
      const bx = 520, by = 840; line(bx - 60, by, bx + 900, by, C.white, 5); line(bx - 60, by, bx - 60, 220, C.white, 5);
      const vals = [0.25, 0.4, 0.55, 0.95]; vals.forEach((v, i) => { const k = easeOut(seg(t, 0.3 + i * 0.35, 1.0 + i * 0.35)); const h = 560 * v * k; P(rr(bx + i * 220, by - h, 150, h, 8), i == 3 ? C.green2 : '#3A7BD5', C.ink, 5); });
      const ly = by - 560 * 0.6; ctx.setLineDash([18, 12]); line(bx - 60, ly, bx + 900, ly, C.amber, 5); ctx.setLineDash([]); txt('UMMEED', bx + 960, ly, 34, C.amber, 'Oswald', 700, 'left');
      if (t > 1.9) withT(bx + 735, by - 560 * 0.95 - 60, back(seg(t, 1.9, 2.3)), 0, () => { P(rr(-160, -40, 320, 80, 40), C.green2, C.ink, 5); txt('PRE-ORDERS', 0, 3, 40, C.ink); });
    } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.06, ease(t / d)));
  const q = LINES.n03.dur * 0.55; [['KAISA HOGA?', 380], ['KITNE KA?', 640]].forEach(([s, y], i) => { const k = back(seg(t, q + i * 0.8, q + 0.3 + i * 0.8)); if (k > 0) withT(270, y, k, -0.05, () => { P(rr(-200, -50, 400, 100, 50), C.white, C.ink, 5); txt(s, 0, 3, 48, C.ink); }); });
  banner('TAKE-TWO', 'PRE-ORDERS UMMEED SE KAHIN ZYAADA', 70, 120, t - 0.3, C.amber);
  vignette();
};
DRAW.who = (t, d) => {
  const two = after('n05', -0.1);
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#140A06', '#2A1408'); for (let i = 0; i < 60; i++) alpha(0.22, () => P(circ(rnd(i) * W, rnd(i + 5) * H, 3), C.amber, null)); } },
    { z: 0.4, draw: () => {
      P(rr(260, 140, 1400, 700, 20), 'rgba(255,170,60,0.06)', 'rgba(255,170,60,0.35)', 4);
      for (let i = 0; i < 14; i++) line(260 + i * 100, 140, 260 + i * 100, 840, 'rgba(255,170,60,0.08)', 2); for (let i = 0; i < 7; i++) line(260, 140 + i * 100, 1660, 140 + i * 100, 'rgba(255,170,60,0.08)', 2);
      const pins = [[460, 300], [620, 260], [540, 420], [820, 330], [700, 520], [1480, 380]]; pins.forEach(([x, y], i) => { const k = back(seg(t, 0.3 + i * 0.15, 0.6 + i * 0.15)); if (k > 0) withT(x, y, k, 0, () => pin(0, 0, '#5A6A88')); });
      if (two) { const u = lt('n05'); const k = back(seg(u, 0.2, 0.6)); glow(1300, 600, 260, C.red, 0.5); withT(1300, 600, k, 0, () => { pin(0, 0); tag('BENGALURU · ROCKSTAR INDIA', 26, -46, 34, C.white, 'rgba(120,20,20,0.85)'); }); }
    } },
  ], drift(t, d, 40), 0, lerp(1.0, 1.08, ease(t / d)));
  if (!two) withT(960, 520, back(seg(t, 1.0, 1.4)), 0, () => { glow(0, 0, 300, C.amber, 0.4); txtStroke('BANAAYA KISNE?', 0, 0, 130, C.amber, C.ink, 16); });
  else { const u = lt('n05'); if (u > LINES.n05.dur * 0.45) withT(560, 700, back(seg(u, LINES.n05.dur * 0.45, LINES.n05.dur * 0.45 + 0.4)), -0.04, () => reportCard(0, 0, 0.9, 'RED DEAD REDEMPTION 2', 'ROCKSTAR INDIA BHI TEAM MEIN', 0, '#F2EEE3', C.red2)); }
  vignette();
};
DRAW.promise = (t, d) => {
  fillAll('#0B0F17'); paperTex(0, 0, W, H, 5); glow(960, 520, 700, C.amber, 0.15);
  const chips = [['PAISA', C.green2, 0.3], ['MEHNAT', C.amber, LINES.n06.dur * 0.42], ['TWIST!', C.red, LINES.n06.dur * 0.58]];
  chips.forEach(([s, col, a], i) => { const k = back(seg(t, a, a + 0.35)); if (k > 0) withT(420 + i * 540, 470, k, (i - 1) * 0.06, () => { shadow(0, 150, 200); P(rr(-220, -110, 440, 220, 26), col, C.ink, 6); txt(s, 0, 4, 90, i == 2 ? C.white : C.ink); }); });
  if (t > LINES.n06.dur * 0.75) handwrite('Aakhir tak rahiye…', 960, 770, 70, t - LINES.n06.dur * 0.75, C.white, 0.8);
  vignette();
};
DRAW.title = (t, d) => {
  depth([
    { z: 0.05, draw: () => { sky('#2A1440', '#FF8A3D'); glow(960, 760, 600, '#FFD36B', 0.6); P(circ(960, 800, 220), '#FFCE5C', null); } },
    { z: 0.4, draw: () => { ctx.fillStyle = '#5A2A5A'; ctx.fillRect(-200, 760, W + 400, 400); for (let i = 0; i < 6; i++) alpha(0.35, () => line(-100, 800 + i * 40 + wob(t, 0.3, 6, i), W + 100, 800 + i * 40 + wob(t, 0.3, 6, i + 2), '#FFB86B', 4)); } },
    { z: 0.9, draw: () => { palm(160, 1100, 1.4, t, '#1A0E22'); palm(1780, 1120, 1.3, t + 2, '#1A0E22'); } },
  ], 0, 0, lerp(1.08, 1.0, easeOut(t / d)));
  ctx.fillStyle = 'rgba(8,6,16,0.45)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0.2, 0.5));
  withT(960, 380, lerp(1.5, 1, k), 0, () => alpha(k, () => { txtStroke('GTA 6 KA', 0, -80, 130, C.white, C.ink, 18); txtStroke('BENGALURU CONNECTION', 0, 70, 120, C.amber, C.ink, 18); }));
  if (t > 0.9) withT(1560, 170, back(seg(t, 0.9, 1.2)), 0.1, () => { P(rr(-170, -44, 340, 88, 10), C.red, C.ink, 5); txt('GTA 6 SPECIAL #1', 0, 3, 46, C.white); });
  if (t > 1.1) handwrite('Daave, sach aur paisa', 960, 640, 64, t - 1.1, C.white, 1.0);
  alpha(seg(t, 1.6, 2.0), () => tag('DAAVE ATTRIBUTED · SOURCES DESCRIPTION MEIN', 600, 760, 26, C.grey));
  alpha(seg(t, 0.4, 0.8), () => { logoCircle(960 - 250, 900, 40); brandText(960 - 195, 902, 50, 'left'); });
  vignette();
};
function chapter(n, title) { return (t, d) => { fillAll('#0B0F17'); paperTex(0, 0, W, H, n * 13); glow(960, 520, 600, C.amber, 0.12); handwrite('Part ' + n, 960, 400, 60, t - 0.1, C.amber, 0.4); handwrite(title, 960, 540, 120, t - 0.5, C.white, 0.9); const k = seg(t, 1.3, 1.8); ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(960 - 380 * k, 640); ctx.lineTo(960 + 380 * k, 640); ctx.stroke(); vignette(); sceneFade(t, d, 0.2, 0.25); }; }
DRAW.ch1 = chapter(1, 'Bengaluru ka Rockstar'); DRAW.ch2 = chapter(2, '1,615 ka Sach'); DRAW.ch3 = chapter(3, 'Raat 3 Baje Tak?'); DRAW.ch4 = chapter(4, 'Paisa Kiski Jeb Mein?');

// ===================== PART 1
function yearChip(y, x, k, on) { withT(x, 150, k, 0, () => { P(rr(-90, -38, 180, 76, 38), on ? C.amber : '#2A3245', C.ink, 4); txt(y, 0, 3, 44, on ? C.ink : C.grey); }); }
function timelineBar(t, active) { const ys = ['1997', '2016', '2018', '2019']; line(260, 150, 1660, 150, '#3A4560', 6); ys.forEach((y, i) => yearChip(y, 360 + i * 400, 1, i <= active)); }
DRAW.y1997 = (t, d) => {
  const two = after('n08', -0.1);
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#1A1408', '#2E2210'); paperTex(0, 0, W, H, 3); } },
    { z: 0.5, draw: () => { lightPool(980, 560, 460, C.amber, 0.3); desk(980, 690, 620); withT(1060, 600, 1, 0, () => { P(rr(-150, -200, 300, 240, 22), '#D9D2BE', C.ink, 6); P(rr(-120, -175, 240, 175, 12), '#10261A', C.ink, 4); for (let j = 0; j < 5; j++) if (rnd(j) < seg(t, 0.4 + j * 0.4, 0.6 + j * 0.4) + 0.01) txt('> ' + ['RUN GAME.EXE', 'LOADING…', 'SPRITE OK', 'LEVEL 1', 'HELLO WORLD'][j], -105, -150 + j * 30, 20, '#4BFF8A', 'Inter', 600, 'left'); P(rr(-110, 40, 220, 40, 6), '#C9C2AE', C.ink, 4); }); shadow(720, 860, 140); person(720, 860, 'prog', { t, s: 1.35, look: 0.8, mood: 0.6, arms: [[0.3, 0.2], [-1.0, -0.9]] }); } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.08, ease(t / d)));
  timelineBar(t, 0);
  banner('1997 · BENGALURU', 'RAJESH RAO · DHRUVA INTERACTIVE', 70, 270, t - 0.3, C.amber);
  if (two) stamp("'PEHLA GAME STUDIO' · MAANA JAATA HAI", 1200, 330, 42, C.red, lt('n08'), -0.05);
  sanketikL(seg(t, 0.5, 0.9));
  vignette();
};
DRAW.y2016 = (t, d) => {
  const two = after('n10', -0.1);
  depth([
    { z: 0.05, haze: 1, draw: () => nightCity(t, 5) },
    { z: 0.5, draw: () => { lightPool(800, 700, 520, C.amber, 0.22); studio(800, 900, 0.95, 'ROCKSTAR INDIA', t); } },
    { z: 0.95, draw: () => { ctx.fillStyle = '#0A0E18'; ctx.fillRect(-200, 920, W + 400, 300); palm(1800, 980, 0.9, t); } },
  ], drift(t, d, 36), 0, lerp(1.0, 1.08, ease(t / d)));
  timelineBar(t, two ? 2 : 1);
  if (two) withT(1440, 560, back(seg(lt('n10'), 0.3, 0.7)), 0.04, () => { reportCard(0, 0, 1.0, '2018 · RED DEAD REDEMPTION 2', 'TEAM MEIN: ROCKSTAR INDIA', 0, '#F2EEE3', C.red2); });
  else banner('2016', 'ROCKSTAR GAMES KA BENGALURU STUDIO', 70, 270, t - 0.3, C.amber);
  vignette();
};
DRAW.deal = (t, d) => {
  const two = after('n12', -0.1);
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#0E1424', '#1A2440'); bokeh(t, 16, C.amber, 9); } },
    { z: 0.5, draw: () => { if (two) return; lightPool(960, 560, 520, C.amber, 0.28); desk(960, 680, 900);
      withT(960, 640, 1, 0, () => { P(rr(-160, -40, 320, 40, 4), C.paper, C.ink, 4); txt('DEAL', 0, -18, 26, C.ink); });
      moneyStack(700, 680, 9, 2.0); moneyStack(1220, 680, 7, 2.0);
      shadow(470, 900, 130); person(470, 900, 'ceo', { t, s: 1.3, look: 0.8, mood: 0.6, arms: [[0.2, 0.2], [-1.2, -0.3]] });
      shadow(1450, 900, 130); person(1450, 900, 'prog', { t: t + 1, s: 1.3, look: -0.8, mood: 0.5, flip: true, arms: [[0.2, 0.2], [-1.2, -0.3]] }); } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.06, ease(t / d)));
  timelineBar(t, 3);
  if (!two) {
    const u = t; const p = LINES.n11.dur * 0.62;
    if (u > 1.4) withT(960, 330, back(seg(u, 1.4, 1.8)), 0, () => { P(rr(-230, -55, 460, 110, 55), '#2A3245', C.amber, 5); txt('~92% HISSEDAARI', 0, 3, 52, C.amber); });
    if (u > p) priceTag(960, 520, 1.0, '$7.9 MILLION', '79 LAKH $', C.green2, -0.06);
    sanketikL(seg(t, 0.5, 0.9));
  } else {
    const u = lt('n12'); fillAll('rgba(10,14,24,0.0)');
    studio(1480, 900, 0.7, 'ROCKSTAR INDIA', t);
    const n = Math.floor(lerp(0, 300, easeOut(seg(u, 0.2, 2.6))));
    for (let i = 0; i < 300; i++) { if (i >= n) break; const c = i % 30, r = Math.floor(i / 30); peopleIcon(260 + c * 30, 330 + r * 46, 34, i % 7 == 0 ? C.amber : TEAL); }
    txt('~' + n + ' LOG', 700, 840, 80, C.white);
    if (u > 3.2) stamp('AB ROCKSTAR KA HISSA', 1440, 360, 50, C.amber, u - 3.2, -0.05);
  }
  vignette();
};
DRAW.tease1 = (t, d) => {
  fillAll('#05070C'); glow(960, 540, 500, C.red, 0.18 + wob(t, 2, 0.05)); controller(960, 520, 1.6, t, '#1E222B');
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + t; alpha(0.5 * seg(t, 0.3, 1), () => line(960 + Math.cos(a) * 420, 520 + Math.sin(a) * 260, 960 + Math.cos(a) * 520, 520 + Math.sin(a) * 320, C.amber, 6)); }
  if (t > 0.8) handwrite('Asli khel ab shuru…', 960, 850, 76, t - 0.8, C.amber, 0.8);
  vignette();
};

// ===================== PART 2
DRAW.reports = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { ctx.fillStyle = '#4E3A28'; ctx.fillRect(-200, -200, W + 400, H + 400); paperTex(0, 0, W, H, 12); } },
    { z: 0.6, draw: () => { reportCard(560, 430, 1.1, 'THE BRIDGE CHRONICLE', 'JULY 2025 · REPORT', -0.06); reportCard(1360, 470, 1.0, 'THE WEEK', 'JUNE 2025 · REPORT', 0.05, '#F2EEE3', '#2E5FA8'); } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.06, ease(t / d)));
  const k = seg(t, 1.6, 3.2); if (t > 1.6) withT(960, 760, back(seg(t, 1.6, 2.0)), 0, () => { P(rr(-430, -90, 860, 180, 24), 'rgba(11,15,23,0.85)', C.amber, 5); txt('~' + fmt(cnt(t, 1.6, 1.6, 6000)), -120, 0, 110, C.amber); txt('DEVELOPERS', 230, -20, 40, C.white, 'Oswald', 600); txt('(DAAWA)', 230, 30, 34, C.grey, 'Oswald', 600); });
  banner('REPORTS KA DAAWA', "ROCKSTAR KE DUNIYA BHAR KE STUDIOS", 70, 120, t - 0.3, C.amber);
  vignette();
};
DRAW.quarter = (t, d) => {
  const two = after('n16', -0.1);
  fillAll('#0E1424'); glow(960, 500, 800, TEAL, 0.1);
  if (!two) {
    depth([{ z: 0.4, draw: () => deskRow(t, 820, 4, 360, 400, 0.85) }], drift(t, d, 30), 0, lerp(1.0, 1.05, ease(t / d)));
    ctx.fillStyle = 'rgba(8,11,18,0.45)'; ctx.fillRect(0, 0, W, H);
    withT(960, 380, back(seg(t, 1.2, 1.6)), 0, () => { glow(0, 0, 360, C.amber, 0.35); txtStroke('~' + fmt(cnt(t, 1.2, 1.8, 1615)), 0, 0, 220, C.amber, C.ink, 18); txt('ROCKSTAR INDIA · DEVELOPERS', 0, 150, 48, C.white); });
    tag('THE WEEK KE MUTABIQ · DAAWA', 60, 160, 28, C.amber);
  } else {
    const u = lt('n16') + 0.1;
    for (let i = 0; i < 4; i++) { const k = back(seg(u, i * 0.2, i * 0.2 + 0.35)); if (k <= 0) continue; withT(420 + i * 360, 470, k, 0, () => { const on = i == 3; if (on) glow(0, 0, 220, C.amber, 0.5); peopleIcon(0, 40, 280, on ? C.amber : '#3A4A6A'); if (on) tag('BENGALURU', -110, 230, 34, C.ink, C.amber); }); }
    txt('HAR 4 MEIN SE 1', 960, 820, 96, C.white);
  }
  vignette();
};
DRAW.vicebeach = (t, d) => {
  depth([
    { z: 0.05, draw: () => { sky('#3A1A5A', '#FF8A3D'); glow(1300, 620, 500, '#FFD36B', 0.6); P(circ(1300, 640, 160), '#FFCE5C', null); } },
    { z: 0.3, haze: 1, draw: () => { alpha(0.9, () => skyline(640, '#4A2050', 8, 200, PINK, 50)); } },
    { z: 0.55, draw: () => { ctx.fillStyle = '#2A6A9A'; ctx.fillRect(-200, 640, W + 400, 200); for (let i = 0; i < 5; i++) alpha(0.4, () => line(-100, 670 + i * 30 + wob(t, 0.4, 5, i), W + 100, 670 + i * 30 + wob(t, 0.4, 5, i + 1), '#9AD7FF', 4)); ctx.fillStyle = '#E8C98A'; ctx.beginPath(); ctx.moveTo(-200, 860); ctx.quadraticCurveTo(960, 780, W + 200, 850); ctx.lineTo(W + 200, H + 200); ctx.lineTo(-200, H + 200); ctx.fill(); } },
    { z: 0.95, draw: () => { palm(220, 1080, 1.5, t, '#1A0E22'); palm(1700, 1100, 1.3, t + 2, '#1A0E22'); } },
  ], drift(t, d, 50), 0, lerp(1.0, 1.1, ease(t / d)));
  withT(760, 470, back(seg(t, 0.8, 1.2)), 0, () => { pin(0, 0, PINK); tag('VICE BEACH', 26, -46, 44, C.white, 'rgba(120,20,80,0.85)'); });
  banner('REPORTS KA DAAWA', 'VICE BEACH KI ZIMMEDAARI ROCKSTAR INDIA KO', 70, 120, t - 0.3, C.amber);
  alpha(seg(t, 1.5, 2), () => tag('SAANKETIK DRISHYA · GAME KA NAHI', 70, 250, 22, C.grey));
  vignette();
};
DRAW.check = (t, d) => {
  const two = after('n19', -0.1);
  fillAll('#121A2A'); paperTex(0, 0, W, H, 21); ctx.fillStyle = 'rgba(10,14,26,0.7)'; ctx.fillRect(0, 0, W, H);
  if (!two) {
    depth([{ z: 0.6, draw: () => { reportCard(760, 470, 1.25, 'REPORT: ~1,615 DEVELOPERS', 'SABSE BADI TEAM', -0.03); } }], drift(t, d, 20), 0, 1.02);
    const mx = lerp(500, 920, ease(seg(t, 0.4, 2.0))); withT(mx, 520, 1, 0.2, () => { ctx.strokeStyle = C.amber; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, 0, 110, 0, 6.283); ctx.stroke(); alpha(0.15, () => P(circ(0, 0, 104), '#fff', null)); line(80, 80, 200, 200, C.amber, 22); });
    const a = LINES.n18.dur * 0.32, b = LINES.n18.dur * 0.62;
    if (t > a) withT(1450, 380, back(seg(t, a, a + 0.35)), 0.03, () => { P(rr(-250, -60, 500, 120, 16), C.red, C.ink, 5); txt('SOURCE: ?', 0, 3, 60, C.white); });
    if (t > b) withT(1450, 580, back(seg(t, b, b + 0.35)), -0.03, () => { P(rr(-300, -60, 600, 120, 16), '#2A3245', C.amber, 5); txt('ROCKSTAR KI PUSHTI: NAHI MILI', 0, 3, 40, C.amber); });
  } else {
    const u = lt('n19') + 0.1; const bx = 520, by = 800;
    line(bx - 40, by, bx + 860, by, C.white, 5);
    const k1 = easeOut(seg(u, 0.4, 1.4)), k2 = easeOut(seg(u, LINES.n19.dur * 0.35, LINES.n19.dur * 0.35 + 1));
    P(rr(bx + 60, by - 500 * 0.5 * k1, 240, 500 * 0.5 * k1, 8), '#3A7BD5', C.ink, 5); if (k2 > 0) P(rr(bx + 60, by - 500 * 0.5 - 300 * 0.5 * k2, 240, 300 * 0.5 * k2, 8), TEAL, C.ink, 5);
    if (k1 > 0.5) txt('~500', bx + 180, by - 125, 48, C.white); if (k2 > 0.5) txt('+300 DHRUVA', bx + 180, by - 325, 36, C.ink);
    txt('2019', bx + 180, by + 40, 40, C.grey);
    const k3 = easeOut(seg(u, LINES.n19.dur * 0.55, LINES.n19.dur * 0.55 + 1.2)); ctx.setLineDash([16, 12]); if (k3 > 0) P(rr(bx + 520, by - 650 * k3, 240, 650 * k3, 8), 'rgba(244,208,111,0.15)', C.amber, 5); ctx.setLineDash([]);
    if (k3 > 0.6) { txt('~1,615?', bx + 640, by - 680, 52, C.amber); txt('2025 · DAAWA', bx + 640, by + 40, 40, C.amber); }
    tag('GAMESPOT (2019) KE MUTABIQ', 60, 160, 28, C.amber);
    if (u > LINES.n19.dur * 0.75) stamp('SABSE BADI? SIRF DAAWA', 1480, 520, 46, C.red, u - LINES.n19.dur * 0.75, 0.05);
  }
  vignette();
};

// ===================== PART 3
DRAW.hiring = (t, d) => {
  const two = after('n21', -0.1);
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#0F1A2E', '#1A2B4A'); bokeh(t, 18, '#3A7BD5', 13); } },
    { z: 0.6, draw: () => phoneUI(640, 520, 1.15, t, () => { ctx.fillStyle = '#F3F2EF'; ctx.fillRect(-172, -350, 344, 700); ctx.fillStyle = '#1E3A5F'; ctx.fillRect(-172, -350, 344, 70); txt('JOB POST', -150, -315, 26, C.white, 'Oswald', 700, 'left');
      P(rr(-150, -250, 300, 220, 12), '#1C2538', null); controller(0, -150, 0.5, t); txt('HIRING!', 0, 0, 48, '#1E3A5F'); txt('GAME TESTERS', 0, 50, 36, C.ink); txt('BENGALURU', 0, 95, 30, '#666', 'Oswald', 600);
      const k = seg(t, 1.0, 1.4); if (k > 0) P(rr(-120, 160, 240, 60, 30), '#2E6BD8', null), txt('APPLY', 0, 190, 30, C.white); }) },
    { z: 0.9, draw: () => { if (two) calCard(1340, 480, 1.1, 'APRIL 2026', '18', 'BHARTI DRIVE', '#2E6BD8', 0.05); } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.06, ease(t / d)));
  if (two) { const u = lt('n21'); [['FULL-TIME', 0.8], ['OFFICE SE KAAM', 1.6]].forEach(([s, a], i) => { const k = back(seg(u, a, a + 0.3)); if (k > 0) withT(1340, 790 + i * 0, k, 0, () => {}); if (k > 0) withT(1150 + i * 380, 830, k, 0, () => { P(rr(-170, -40, 340, 80, 40), C.green2, C.ink, 4); txt(s, 0, 3, 36, C.ink); }); }); }
  banner('MARCH 2026', 'LINKEDIN POST · ROCKSTAR INDIA', 70, 120, t - 0.3, C.amber);
  vignette();
};
DRAW.tester = (t, d) => {
  const drama = act('d01');
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#0C1220', '#16213A'); } },
    { z: 0.5, draw: () => { lightPool(1000, 520, 500, '#7FB4FF', 0.25); desk(1000, 700, 900);
      monitor(1060, 470, 620, 380, (w, h) => { ctx.fillStyle = '#5BA3D9'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.fillStyle = '#6E8A4A'; ctx.fillRect(-w / 2, 40, w, h); P(rr(60, -80, 160, 130, 4), '#B98A5A', C.ink, 4); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) line(60 + j * 54, -80 + i * 44, 60 + j * 54, -36 + i * 44, '#8A6040', 2);
        const gx = lerp(-260, 90, easeOut(seg(t, 0.2, 1.2))); car(gx, 60, 1.3, C.red); if (t > 1.2) { alpha(0.6 + wob(t, 4, 0.3), () => { P(rr(-250, -h / 2 + 14, 210, 44, 8), C.red, null); txt('BUG!', -145, -h / 2 + 36, 30, C.white); }); } });
      shadow(560, 880, 140); person(560, 880, 'tester', { t, s: 1.3, look: 0.9, mood: drama ? 1 : 0.4, talk: talk('d01'), arms: [[0.3, 0.2], [-1.1, -0.6]] }); } },
  ], drift(t, d, 24), 0, lerp(1.0, 1.06, ease(t / d)));
  if (drama) { dramaTag(lt('d01')); bubble('BUG MILA!', 640, 380, lt('d01'), 1, 44); }
  if (after('n22', 0.3)) withT(1500, 210, back(seg(lt('n22'), 0.3, 0.7)), 0.04, () => { P(rr(-230, -50, 460, 100, 50), C.amber, C.ink, 5); txt('KHELO · TODO · REPORT KARO', 0, 3, 30, C.ink); });
  vignette();
};
DRAW.review = (t, d) => {
  const two = after('n24', -0.1);
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#07090F', '#141A28'); stars(40); } },
    { z: 0.55, draw: () => { withT(760, 520, 1, -0.02, () => { shadow(0, 330, 360, 0.35); P(rr(-400, -320, 800, 640, 20), '#F2EEE3', C.ink, 6);
      P(circ(-320, -240, 42), '#9AA3B2', C.ink, 4); txt('?', -320, -238, 50, C.white); txt('GUMNAAM EMPLOYEE', -260, -256, 30, C.ink, 'Oswald', 700, 'left'); txt('QA ANALYST · BENGALURU (EASTERN EYE)', -260, -218, 22, '#555', 'Oswald', 600, 'left');
      for (let i = 0; i < 5; i++) txt('★', -330 + i * 52, -150, 50, i < 2 ? '#F2A900' : '#C9C2AE'); txt('1 MAY 2026', 300, -150, 28, '#555', 'Oswald', 600);
      const rows = [['5-6 MAHINE KA KAAM → 2-3 MAHINE', 0.3], ['BINA PAISE KA OVERTIME', LINES.n24.dur * 0.42], ['SUBAH SE RAAT 3 BAJE TAK', LINES.n24.dur * 0.66]];
      if (!two) for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(30,30,30,0.3)'; ctx.fillRect(-330, -60 + i * 50, 560 + rnd(i) * 90, 14); }
      else rows.forEach(([s, a], i) => { const k = back(seg(lt('n24'), a, a + 0.3)); if (k > 0) withT(-330, -60 + i * 110, k, 0, () => { P(circ(0, 0, 22), C.red, C.ink, 3); txt(s, 40, 2, 40, C.ink, 'Oswald', 700, 'left'); }); }); }); } },
    { z: 0.9, draw: () => { if (two) { const u = lt('n24'); const hh = lerp(9, 27, easeOut(seg(u, LINES.n24.dur * 0.66, LINES.n24.dur * 0.66 + 1.5))); clockFace(1550, 520, 170, Math.floor(hh) % 12, (hh % 1) * 60); if (hh >= 26.9) withT(1550, 760, 1, 0, () => { P(rr(-110, -36, 220, 72, 36), C.red, C.ink, 4); txt('3 AM', 0, 3, 46, C.white); }); } } },
  ], drift(t, d, 24), 0, lerp(1.0, 1.05, ease(t / d)));
  tag('AAROP · GUMNAAM GLASSDOOR REVIEW', 60, 160, 28, C.amber);
  vignette();
};
DRAW.syllabus = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#141026', '#22183E'); } },
    { z: 0.55, draw: () => { desk(960, 700, 760); for (let i = 0; i < 9; i++) { const k = back(seg(t, 0.1 + i * 0.12, 0.35 + i * 0.12)); if (k > 0) withT(1200, 690 - i * 34, k, wob(i, 0.3, 0.05), () => P(rr(-130, -16, 260, 32, 4), ['#E2483D', '#3A7BD5', '#2BD46A', '#F4D06F'][i % 4], C.ink, 4)); } shadow(700, 880, 130); person(700, 880, 'gamer', { t, s: 1.25, look: 0.8, mood: -0.7, brow: -1 }); clockFace(1500, 300, 110, 9 + Math.floor(t * 6), (t * 360) % 60); } },
  ], drift(t, d, 20), 0, lerp(1.0, 1.06, ease(t / d)));
  withT(960, 170, back(seg(t, 0.4, 0.8)), 0, () => { P(rr(-380, -55, 760, 110, 55), C.amber, C.ink, 5); txt('POORA SYLLABUS · AADHA TIME', 0, 3, 48, C.ink); });
  sanketikL();
  vignette();
};
DRAW.sides = (t, d) => {
  const two = after('n27', -0.1);
  fillAll(C.bg); const tilt = (two ? -0.06 : 0.1) + wob(t, 0.4, 0.02);
  line(960, 300, 960, 700, C.amber, 12); P(rr(860, 700, 200, 40, 8), C.amber, C.ink, 5);
  withT(960, 330, 1, tilt, () => { line(-460, 0, 460, 0, C.amber, 12); for (const s of [-1, 1]) { line(s * 440, 0, s * 440 - 120, 260, C.ink, 4); line(s * 440, 0, s * 440 + 120, 260, C.ink, 4); P(ell(s * 440, 270, 170, 30), C.amber2, C.ink, 5); } });
  withT(960 - 440 * Math.cos(tilt), 330 - 440 * Math.sin(tilt) + 190, 1, 0, () => { P(rr(-170, -80, 340, 110, 12), C.paper, C.ink, 4); txt('REVIEW KE AAROP', 0, -24, 40, C.ink); });
  withT(960 + 440 * Math.cos(tilt), 330 + 440 * Math.sin(tilt) + 190, 1, 0, () => { P(rr(-170, -80, 340, 110, 12), C.paper, C.ink, 4); txt('DOOSRA PAKSH', 0, -24, 44, C.ink); });
  const D = LINES.n26.dur; const s0 = (id) => at(id);
  const chips = two ? [['REVIEW PAR JAWAAB: NAHI', 0.4], ['CEO (MAY): "ALL-NIGHTER NAHI"', LINES.n27.dur * 0.35], ['CRUNCH TAREEKA NAHI', LINES.n27.dur * 0.78]] : [['PUSHTI NAHI', D * 0.18], ['FARZI? KUCH LOG', D * 0.38], ['DOOSRE REVIEWS: BALANCE ACHHA', D * 0.62]];
  const base = two ? lt('n27') : t;
  chips.forEach(([s, a], i) => { const k = back(seg(base, a, a + 0.3)); if (k > 0) withT(330 + i * 630, 800, k, 0, () => { ctx.font = '700 30px Oswald'; const w = ctx.measureText(s).width + 44; P(rr(-w / 2, -32, w, 64, 32), two ? C.amber : C.green, C.ink, 4); txt(s, 0, 2, 30, C.ink); }); });
  banner(two ? 'COMPANY KA PAKSH' : 'DOOSRA PAKSH', two ? 'EASTERN EYE · BUSINESS INSIDER (VIA FORTUNE)' : 'EASTERN EYE · 80.LV', 70, 120, t - 0.3, C.amber);
  vignette();
};

// ===================== PART 4
DRAW.done = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#0E1424', '#1E2A48'); bokeh(t, 18, C.amber, 17); } },
    { z: 0.5, draw: () => { lightPool(760, 560, 480, C.amber, 0.3); P(rr(600, 640, 320, 220, 10), '#3A2A1E', C.ink, 5); P(rr(560, 620, 400, 36, 8), C.wood, C.ink, 5); txt('EARNINGS CALL', 760, 760, 32, C.amber); shadow(760, 640, 120); person(760, 640, 'ceo', { t, s: 1.25, look: 0.4, mood: 0.6, arms: [[0.2, 0.3], [-1.0, -0.6]] }); } },
    { z: 0.9, draw: () => { calCard(1430, 450, 1.0, 'NOVEMBER', '9', 'TAKE-TWO', '#2E6BD8', 0.05); } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.06, ease(t / d)));
  if (t > LINES.n28.dur * 0.55) stamp('DEVELOPMENT POORA', 960, 170, 64, C.green2, t - LINES.n28.dur * 0.55, -0.05);
  sanketikL();
  vignette();
};
DRAW.bookings = (t, d) => {
  const two = after('n30', -0.1);
  fillAll('#0B1220'); glow(960, 460, 800, C.green2, 0.12);
  if (!two) {
    for (let i = 0; i < 26; i++) { const y = ((t * 220 + rnd(i) * 1300) % 1300) - 150; alpha(0.5, () => withT(rnd(i + 3) * W, y, 0.9, rnd(i) * 3, () => P(rr(-60, -28, 120, 56, 6), '#4E9A4A', C.ink, 3))); }
    withT(960, 460, back(seg(t, 0.3, 0.7)), 0, () => { P(rr(-560, -170, 1120, 340, 30), 'rgba(11,15,23,0.88)', C.green2, 6); txtStroke('$8.0–8.2 ARAB', 0, -30, 140, C.green2, C.ink, 14); txt('NET BOOKINGS · FY2027 ANUMAAN (TAKE-TWO)', 0, 100, 38, C.white, 'Oswald', 600); });
  } else {
    const u = lt('n30');
    line(960, 300, 960, 760, C.amber, 10); P(rr(860, 760, 200, 36, 8), C.amber, C.ink, 5);
    withT(960, 330, 1, 0.22, () => { line(-460, 0, 460, 0, C.amber, 10); for (const s of [-1, 1]) { line(s * 440, 0, s * 440, 160, C.ink, 4); P(ell(s * 440, 170, 170, 28), C.amber2, C.ink, 5); } });
    const L = [960 - 440 * Math.cos(0.22), 330 - 440 * Math.sin(0.22) + 150], R = [960 + 440 * Math.cos(0.22), 330 + 440 * Math.sin(0.22) + 150];
    if (u > 0.6) { for (let i = 0; i < 10; i++) coin(L[0] - 100 + (i % 5) * 50, L[1] - 30 - Math.floor(i / 5) * 40, 26); txt('₹1,000', L[0], L[1] - 160, 60, C.white); txt('TAKE-TWO KI UMMEED', L[0], L[1] + 110, 32, C.grey, 'Oswald', 600); }
    if (u > LINES.n30.dur * 0.5) { const k = back(seg(u, LINES.n30.dur * 0.5, LINES.n30.dur * 0.5 + 0.4)); withT(R[0], R[1] - 40, k, 0, () => coin(0, 0, 16)); txt('< ₹1', R[0], R[1] - 230, 64, C.amber); txt('DHRUVA KA SAUDA', R[0], R[1] + 110, 32, C.grey, 'Oswald', 600); }
    tag('HISAAB: $7.9M ÷ $8,000M', 60, 160, 28, C.amber);
  }
  vignette();
};
DRAW.price = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#1A0E22', '#2E1A40'); bokeh(t, 20, PINK, 23); } },
    { z: 0.6, draw: () => { const k1 = back(seg(t, 0.8, 1.2)), k2 = back(seg(t, LINES.n31.dur * 0.62, LINES.n31.dur * 0.62 + 0.4)); if (k1 > 0) withT(620, 460, k1, 0, () => priceTag(0, 0, 1.15, 'STANDARD EDITION', '₹5,999', C.amber, -0.06)); if (k2 > 0) withT(1320, 520, k2, 0, () => priceTag(0, 0, 1.15, 'ULTIMATE EDITION', '₹7,499', PINK, 0.05)); } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.06, ease(t / d)));
  banner('BHARAT MEIN KEEMAT', 'PLAYSTATION INDIA (BUSINESS TODAY)', 70, 120, t - 0.3, C.amber);
  vignette();
};
DRAW.twist = (t, d) => {
  const drama = act('d02') || after('d02');
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#0A0D18', '#1A1430'); } },
    { z: 0.5, draw: () => { lightPool(1250, 520, 480, '#7FB4FF', 0.25);
      withT(1250, 520, 1, 0, () => { shadow(0, 260, 300, 0.4); P(rr(-200, -240, 160, 480, 30), '#F2F2F2', C.ink, 6); P(rr(-40, -200, 60, 400, 20), '#1A1E26', C.ink, 5); txt('CONSOLE', -120, 0, 30, '#888', 'Oswald', 700); P(rr(100, -200, 240, 420, 16), '#1A1E26', C.ink, 6); P(rr(140, -160, 160, 40, 6), '#2BD46A', null); txt('CONSOLE', 220, 120, 30, '#888', 'Oswald', 700); });
      shadow(520, 900, 140); person(520, 900, 'gamer', { t, s: 1.4, look: 0.9, mood: drama ? -0.8 : 0.3, brow: drama ? -1 : 0, talk: talk('d02'), arms: drama ? [[0.4, 0.2], [-2.2, -0.3]] : [[0.3, 0.2], [-0.3, -0.2]] }); } },
  ], drift(t, d, 26), 0, lerp(1.0, 1.08, ease(t / d)));
  if (t < 1.0) alpha(1 - seg(t, 0.5, 1.0), () => { glow(960, 540, 600, C.amber, 0.4); txtStroke('TWIST!', 960, 540, 200, C.amber, C.ink, 18); });
  const p = LINES.n32.dur * 0.62; const u = lt('n32');
  [['PS5', 0.25], ['XBOX SERIES X|S', 0.4]].forEach(([s, a], i) => { const k = back(seg(u, LINES.n32.dur * a, LINES.n32.dur * a + 0.3)); if (k > 0) withT(1250 + (i ? 120 : -120), 860, k, 0, () => { P(rr(-150, -36, 300, 72, 36), C.green2, C.ink, 4); txt(s, 0, 3, 32, C.ink); }); });
  if (u > p) withT(1250, 230, back(seg(u, p, p + 0.4)), 0.04, () => { P(rr(-300, -60, 600, 120, 18), C.red, C.ink, 5); txt('PC? ANNOUNCE NAHI', 0, 3, 56, C.white); });
  if (act('d02')) { dramaTag(lt('d02')); bubble('PAR CONSOLE?!', 600, 400, lt('d02'), 1, 46); }
  vignette();
};
DRAW.ticket = (t, d) => {
  fillAll('#0E1424'); glow(960, 480, 800, C.amber, 0.12);
  withT(960, 470, 1, -0.02, () => { shadow(0, 420, 380, 0.4); P(rr(-420, -380, 840, 780, 14), '#F2EEE3', C.ink, 6); paperTex(-420, -380, 840, 780, 4);
    for (let i = 0; i < 20; i++) P(poly([-420 + i * 42, 400, -399 + i * 42, 380, -378 + i * 42, 400]), '#0E1424', null);
    txt('KHELNE KA BILL', 0, -320, 56, C.ink); line(-360, -270, 360, -270, C.ink, 3);
    const rows = [['PS5 DIGITAL (AMAZON INDIA)', '₹64,990', 0.6], ['GTA 6 STANDARD', '₹5,999', 1.6]];
    rows.forEach(([a, b, s], i) => { if (t > s) { txt(a, -360, -190 + i * 90, 38, C.ink, 'Oswald', 600, 'left'); txt(b, 360, -190 + i * 90, 46, C.ink, 'Oswald', 700, 'right'); } });
    if (t > 2.6) { line(-360, 0, 360, 0, C.ink, 4); txt('TOTAL', -360, 80, 56, C.ink, 'Oswald', 700, 'left'); txt('₹' + fmt(cnt(t, 2.6, 1.2, 70989)), 360, 80, 84, C.red, 'Oswald', 700, 'right'); }
    if (t > LINES.n33.dur * 0.68) withT(0, 250, back(seg(t, LINES.n33.dur * 0.68, LINES.n33.dur * 0.68 + 0.4)), 0.04, () => { P(rr(-300, -55, 600, 110, 55), C.amber, C.ink, 5); txt('CONSOLE ≈ 11× GAME', 0, 3, 56, C.ink); });
  });
  tag('BUSINESS TODAY · 4 NOV 2026', 60, 160, 28, C.amber);
  vignette();
};
DRAW.mobile = (t, d) => {
  const two = after('n35', -0.1);
  fillAll('#0B1220'); glow(560, 520, 600, TEAL, 0.12); glow(1400, 520, 600, C.red, 0.1);
  const D = LINES.n34.dur; const u = two ? lt('n35') + D + 0.32 : t;
  withT(960, 150, 1, 0, () => { txt('~' + cnt(t, 0.3, 1.4, 52) + ' CRORE GAMERS', 0, 0, 72, C.white); txt('FICCI-EY (2025)', 0, 56, 30, C.grey, 'Oswald', 600); });
  const k1 = back(seg(t, D * 0.3, D * 0.3 + 0.4)); if (k1 > 0) withT(560, 560, k1, 0, () => { phoneUI(0, 0, 0.62, t, () => { ctx.fillStyle = '#1B2A3E'; ctx.fillRect(-172, -350, 344, 700); controller(0, 0, 0.6, t, '#2A3A55'); }); P(rr(-200, 270, 400, 80, 40), TEAL, C.ink, 4); txt('MOBILE KA RAAJ', 0, 312, 40, C.ink); });
  const k2 = seg(t, D * 0.6, D * 0.6 + 1.4); if (k2 > 0) { withT(1400, 520, 1, 0, () => { donut(0, 0, 220, 0.22, easeOut(k2), C.red); txt(Math.round(22 * easeOut(k2)) + '%', 0, 0, 96, C.white); }); txt('CONSOLE USE (LUMIKAI SURVEY)', 1400, 800, 34, C.white, 'Oswald', 600); }
  if (two) { const v = lt('n35'); alpha(0.6 * seg(v, LINES.n35.dur * 0.35, LINES.n35.dur * 0.45), () => { ctx.fillStyle = '#05070C'; ctx.fillRect(0, 0, W, H); }); stamp('ZYAADATAR: CONSOLE NAHI', 960, 520, 72, C.amber, v - LINES.n35.dur * 0.4, -0.03); }
  vignette();
};
DRAW.jeb = (t, d) => {
  fillAll('#0E1424'); paperTex(0, 0, W, H, 33); ctx.fillStyle = 'rgba(10,14,26,0.75)'; ctx.fillRect(0, 0, W, H);
  txtStroke('PAISA KISKI JEB MEIN?', 960, 150, 90, C.amber, C.ink, 12);
  const D = LINES.n36.dur; const items = [['TAKE-TWO', 'BOOKINGS', C.green2, D * 0.18], ['DEVELOPERS', 'NAAM + TAJURBA', TEAL, D * 0.45], ['AAP', 'KHARCHA', C.red, D * 0.75]];
  items.forEach(([a, b, col, s], i) => { const k = back(seg(t, s, s + 0.35)); if (k <= 0) return; const x = 380 + i * 580; withT(x, 560, k, 0, () => { shadow(0, 300, 220); P(new Path2D('M-200 -200 L200 -200 L200 80 Q200 260 0 260 Q-200 260 -200 80 Z'), '#2A3A5A', col, 8); ctx.setLineDash([14, 10]); P(new Path2D('M-170 -170 L170 -170 L170 80 Q170 230 0 230 Q-170 230 -170 80 Z'), null, 'rgba(255,255,255,0.3)', 3); ctx.setLineDash([]); txt(a, 0, -110, 52, C.white); txt(b, 0, 30, 44, col);
    if (i == 0) moneyStack(0, 190, 5, 1.2); if (i == 1) controller(0, 160, 0.35, t); if (i == 2) { coin(-40, 170, 26); coin(30, 180, 26); } }); });
  vignette();
};
DRAW.question = (t, d) => {
  fillAll('#0B0F17'); paperTex(0, 0, W, H, 41);
  handwrite('Doosron ke games banaate rahenge…', 960, 330, 80, t - 0.3, C.white, 1.2);
  handwrite('ya ek din apna GTA?', 960, 470, 96, t - 2.4, C.amber, 1.0);
  if (t > 4.6) { for (let i = 0; i < 3; i++) withT(560 + i * 400, 780, back(seg(t, 4.6 + i * 0.3, 5.0 + i * 0.3)), 0, () => { P(rr(-170, -70, 340, 140, 30), ['#2B4A7A', '#2E7D5B', '#7A2B3A'][i], C.ink, 5); for (let j = 0; j < 3; j++) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-130, -36 + j * 26, 200 + rnd(i + j) * 50, 12); } }); txt('COMMENT MEIN BATAAIYE', 960, 640, 60, C.green); }
  vignette();
};
DRAW.next = (t, d) => {
  fillAll('#0B0F17'); paperTex(0, 0, W, H, 71); glow(960, 520, 600, C.amber, 0.2);
  const k = easeOut(seg(t, 0, 0.8));
  withT(lerp(-400, 620, k), 500, 1, -0.05, () => priceTag(0, 0, 1.1, 'GAME', '₹5,999', C.amber, 0));
  if (t > 1.4) withT(1320, 500, back(seg(t, 1.4, 1.8)), 0.05, () => { shadow(0, 200, 260); P(rr(-300, -150, 600, 300, 20), C.red, C.ink, 6); for (let i = 0; i < 7; i++) P(circ(-300, -120 + i * 40, 12), '#0B0F17', null); txt('KHELNE KA TICKET', 0, -70, 44, C.white); txt('₹70,000+', 0, 30, 110, C.white); });
  if (t > 3.0) withT(960, 820, back(seg(t, 3.0, 3.4)), 0, () => { P(rr(-420, -50, 840, 100, 50), '#2A3245', C.amber, 4); txt('AGLA VIDEO · 18 NOV · GTA 6 SPECIAL #2', 0, 3, 40, C.amber); });
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
    const name = { S: 'TESTER · NAATYA', G: 'GAMER · NAATYA' }[LINES[id].spk];
    ctx.font = '800 44px Baloo2'; const words = c[2].split(' '); const rows = ['']; words.forEach(w => { if (ctx.measureText(rows[rows.length - 1] + ' ' + w).width > 1500) rows.push(w); else rows[rows.length - 1] = (rows[rows.length - 1] + ' ' + w).trim(); });
    const bw = Math.max(...rows.map(r => ctx.measureText(r).width)) + 60; const bh = rows.length * 56 + 22; const y0 = 1045 - bh;
    P(rr(960 - bw / 2, y0, bw, bh, 14), 'rgba(8,11,18,0.72)', null);
    rows.forEach((r, i) => txt(r, 960, y0 + 40 + i * 56, 44, name ? C.amber : C.white, 'Baloo2', 800));
    if (name) { P(rr(960 - bw / 2, y0 - 40, 260, 40, 8), C.amber, null); txt(name, 960 - bw / 2 + 130, y0 - 19, 26, C.ink, 'Oswald', 700); }
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
