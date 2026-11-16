// ===== Awazzzz GTA blitz #4 — "Bengaluru mein Rockstar: Indian engineers GTA mein kya banate hain?" — native 9:16 scenes (DRAWV).
// Own 2.5D art only: no game footage, logos, official fonts, key art or characters. "GTA" / studio names set in Oswald (our font).
// No outline map of India: city pin only. Safe zone: key content x 40..940, y 250..1200; captions own y 1250..1450.

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
KINDS.purush = { body: '#3A6EA5', body2: '#2D5785', skin: '#C68E62', hair: 'short', h: 0.98 };
KINDS.mahila = { body: '#7A3B5A', body2: '#612E47', skin: '#D9A77E', hair: 'bob', h: 0.93 };
KINDS.mocap = { body: '#1A1E26', body2: '#11141A', skin: '#C68E62', hair: 'short', h: 0.98 };
const L0 = id => (LINES[id] ? LINES[id].start - (GT - SCT) : 99);
const CYAN = '#4CC9F0';

// Studio library assets (animation-studio catalogue, chosen by select_assets.py on brief.json): PRP-003 officeChair,
// PRP-015 laptop, PRP-018 camera, PRP-030 car (sets.js car2D), VFX-013 motionStreaks, VFX-019 question, GFX-009 pin — ported onto the kit canvas.
const SP = (() => {
  const OUT = '#2a1c14', TAU = 6.2832;
  const R = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  const O = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); };
  const F = (fill, stroke, lw = 0) => { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke && lw) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); } };
  const PG = pts => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };
  const hx = h => { const n = parseInt(h.replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const shade = (h, k) => { const [r, g, b] = hx(h); const f = c => Math.round(clamp(k < 0 ? c * (1 + k) : c + (255 - c) * k, 0, 255)); return '#' + [f(r), f(g), f(b)].map(x => x.toString(16).padStart(2, '0')).join(''); };
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const pr = (fn, x, y, s) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; fn(); ctx.restore(); };
  return {
    officeChair: (x, y, s = 1) => pr(() => { R(-55, -260, 110, 140, 30); F('#2b2d42', OUT, 5); R(-70, -125, 140, 26, 10); F('#3d405b', OUT, 5); R(-8, -100, 16, 70, 4); F('#888', OUT, 3); ctx.strokeStyle = OUT; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-60, -10); ctx.lineTo(60, -10); ctx.stroke(); O(-60, -6, 8); F('#222'); O(60, -6, 8); F('#222'); }, x, y, s),
    laptop: (x, y, s = 1, t = 0) => pr(() => { ctx.save(); ctx.transform(1, 0, -0.18, 1, 0, 0); R(-110, -170, 220, 150, 8); F('#1d3557', OUT, 4); ctx.fillStyle = CYAN; for (let i = 0; i < 5; i++) ctx.fillRect(-90, -146 + i * 22, 180 * (0.4 + 0.5 * hash(i + 3 + Math.floor(t * 2))), 8); ctx.restore(); PG([[-150, -18], [150, -18], [170, 0], [-170, 0]]); F('#adb5bd', OUT, 4); }, x, y, s),
    camera: (x, y, s = 1, t = 0) => pr(() => { R(-140, -170, 250, 120, 18); F('#2b2d42', OUT, 5); O(120, -110, 46); F('#111', OUT, 5); O(120, -110, 26); F(CYAN); O(-60, -205, 40); F('#2b2d42', OUT, 4); O(30, -205, 40); F('#2b2d42', OUT, 4); ctx.strokeStyle = '#555'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-20, -50); ctx.lineTo(-90, 0); ctx.moveTo(-20, -50); ctx.lineTo(50, 0); ctx.moveTo(-20, -50); ctx.lineTo(-20, 0); ctx.stroke(); O(-110, -110, 8); F(Math.floor(t * 2) % 2 ? '#e63946' : '#5a1a20'); }, x, y, s),
    car: (x, y, s = 1, col = '#e63946', t = 0, wire = 0) => pr(() => { // wire 0..1: blueprint -> painted
      const body = () => { R(-120, -70, 240, 50, 18); }, cab = () => { ctx.beginPath(); ctx.moveTo(-70, -70); ctx.lineTo(-45, -115); ctx.lineTo(50, -115); ctx.lineTo(80, -70); ctx.closePath(); };
      const paint = clamp(1 - wire);
      body(); F(paint > 0 ? col : null, wire > 0 ? CYAN : OUT, 4); cab(); F(paint > 0 ? shade(col, -0.1) : null, wire > 0 ? CYAN : OUT, 4);
      if (wire > 0) { ctx.save(); ctx.globalAlpha = wire; ctx.strokeStyle = CYAN; ctx.lineWidth = 2; for (let i = -100; i <= 100; i += 25) { ctx.beginPath(); ctx.moveTo(i, -70); ctx.lineTo(i, -20); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-120, -45); ctx.lineTo(120, -45); ctx.stroke(); ctx.restore(); }
      if (paint > 0.5) { ctx.fillStyle = '#bde0fe'; PG([[-58, -74], [-38, -106], [-5, -106], [-5, -74]]); ctx.fill(); PG([[5, -74], [5, -106], [45, -106], [66, -74]]); ctx.fill(); ctx.fillStyle = '#ffd166'; ctx.fillRect(108, -60, 12, 12); }
      for (const wx of [-70, 70]) { O(wx, -20, 24); F(paint > 0.3 ? '#222' : null, paint > 0.3 ? OUT : CYAN, 3); O(wx, -20, 10); F('#bbb'); ctx.save(); ctx.translate(wx, -20); ctx.rotate(t * 8); ctx.strokeStyle = '#666'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.stroke(); ctx.restore(); }
    }, x, y, s),
    motionStreaks: (x, y, dir = -1, len = 220, n = 5, a = 0.7) => { ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineCap = 'round'; for (let i = 0; i < n; i++) { ctx.lineWidth = 6 - i * 0.6; ctx.beginPath(); const yy = y - 60 + i * 30; ctx.moveTo(x, yy); ctx.lineTo(x + dir * len * (0.6 + hash(i) * 0.4), yy); ctx.stroke(); } ctx.restore(); },
    question: (t, x, y, t0 = 0, s = 1) => { const k = back(seg(t, t0, t0 + 0.3)); if (k <= 0) return; withT(x, y + Math.sin(t * 4) * 6, k * s, 0, () => txtStroke('?', 0, 0, 120, '#ffd166', '#2a1c14', 8)); },
    pin: (t, t0, x, y, label = '', c = '#FF4F5E') => { if (t < t0) return; const k = clamp((t - t0) / 0.6), kb = 1 - Math.pow(1 - k, 3);
      for (let i = 0; i < 2; i++) { const p = ((t - t0) * 0.8 + i * 0.5) % 1; ctx.strokeStyle = `rgba(255,79,94,${1 - p})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y, 10 + p * 60, 4 + p * 22, 0, 0, TAU); ctx.stroke(); }
      ctx.save(); ctx.translate(x, y - (1 - kb) * 200); ctx.scale(1.4, 1.4); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-26, -34, -30, -64, 0, -70); ctx.bezierCurveTo(30, -64, 26, -34, 0, 0); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke(); O(0, -48, 10); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
      if (label) { const a = clamp((t - t0 - 0.4) * 3); alpha(a, () => { ctx.font = '700 40px Oswald'; const w = ctx.measureText(label).width + 40; P(rr(x + 40, y - 150, w, 64, 12), 'rgba(0,0,0,0.75)', null); txt(label, x + 40 + w / 2, y - 117, 40, C.white, 'Oswald', 700); }); } },
  };
})();
// motion-capture performer: dark suit + glowing markers (generic, our own drawing)
function mocapPerson(x, y, t, s = 1, o = {}) { person(x, y, 'mocap', Object.assign({ t, s, look: 0.2, mood: 0.4 }, o));
  const pts = [[0, -330], [-40, -250], [40, -250], [-62, -190], [62, -190], [0, -200], [-30, -110], [30, -110], [-32, -40], [32, -40], [0, -150]];
  pts.forEach(([a, b], i) => { const px = x + a * s, py = y + b * s + wob(t, 0.5, 2 * s); glow(px, py, 22 * s, '#9DFFB0', 0.5 + 0.3 * Math.sin(t * 6 + i)); P(circ(px, py, 7 * s), '#DFFFE6', null); }); }
// skeleton on a screen that mirrors the performer
function skeletonV(cx, cy, s, t) { const j = { h: [0, -120], n: [0, -90], l: [-40, -60 + Math.sin(t * 3) * 14], r: [40, -60 - Math.sin(t * 3) * 14], p: [0, 0], fl: [-24, 70], fr: [24, 70] };
  ctx.strokeStyle = '#9DFFB0'; ctx.lineWidth = 5 * s; ctx.lineCap = 'round'; const L = (a, b) => { ctx.beginPath(); ctx.moveTo(cx + j[a][0] * s, cy + j[a][1] * s); ctx.lineTo(cx + j[b][0] * s, cy + j[b][1] * s); ctx.stroke(); };
  L('n', 'l'); L('n', 'r'); L('n', 'p'); L('p', 'fl'); L('p', 'fr'); ctx.beginPath(); ctx.arc(cx, cy - 120 * s, 22 * s, 0, 6.283); ctx.stroke(); for (const k in j) P(circ(cx + j[k][0] * s, cy + j[k][1] * s, 6 * s), C.white, null); }
function studioSign(x, y, s, sign, sub, t, col = C.amber) { withT(x, y, s, 0, () => { shadow(0, 0, 420, 0.35); building(-340, 0, 680, 520, '#22304D', col, 11);
  P(rr(-300, -680, 600, sub ? 140 : 100, 14), '#0E1424', col, 5); txt(sign, 0, -632, 52, col, 'Oswald', 700); if (sub) txt(sub, 0, -578, 32, C.white, 'Oswald', 600); line(-200, sub ? -540 : -580, -200, -520, '#3A4560', 6); line(200, sub ? -540 : -580, 200, -520, '#3A4560', 6);
  P(rr(-70, -130, 140, 130, 6), '#0B1120', C.ink, 4); glow(0, -60, 180, col, 0.25 + wob(t, 0.5, 0.05)); }); }

function floorV(y, c1, c2) { ctx.fillStyle = grad(y, H + 300, c1, c2); ctx.fillRect(-300, y, W + 600, H + 600 - y); }

// ---------- spoken opening hook: "GTA V ki gaadiyon ke peeche Bengaluru ka haath?" ----------
DRAWV.hook1 = (t, d) => {
  const run = (t * 520) % 1700 - 300;
  depth([
    { z: 0.05, haze: 1, draw: () => { nightCity(t, 9); bokeh(t, 12, CYAN, 5); } },
    { z: 0.35, draw: () => { SP.pin(t, 0.5, 600, 560, 'BENGALURU'); } },
    { z: 0.8, draw: () => { lightPool(CX, 1120, 560, C.amber, 0.25); floorV(1240, '#141A28', '#0A0E18'); P(rr(-100, 1110, W + 200, 140, 0), '#1A2133', null); for (let i = 0; i < 9; i++) P(rr(((i * 160 - t * 520) % 1440 + 1440) % 1440 - 200, 1170, 90, 12, 6), C.amber, null);
      SP.motionStreaks(run - 140, 1060, -1, 260, 5, 0.6); SP.car(run, 1110, 1.7, '#E2483D', t); SP.car(((run + 820) % 1700) - 300, 1120, 1.3, '#2E6BD8', t, 0); SP.question(t, 300, 760, 0.8, 1.2); } },
  ], drift(t, d, 18), 0, lerp(1.0, 1.08, ease(t / d)));
  if (t > 2.0) chipV('BENGALURU KA HAATH?', CX, 980, back(seg(t, 2.0, 2.35)), C.amber, 60, C.ink);
  vignette();
};

// ---------- n01 Bengaluru team helped build GTA V's cars and props ----------
DRAWV.assets = (t, d) => {
  const D = LINES.n01.dur, k = seg(t, 0.6, D * 0.75);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1A2440'); bokeh(t, 14, CYAN, 11); } },
    { z: 0.45, draw: () => { monitor(CX, 620, 820, 500, (w, h) => { ctx.fillStyle = '#0B1A2E'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.strokeStyle = 'rgba(76,201,240,0.18)'; ctx.lineWidth = 2; for (let i = -w / 2; i < w / 2; i += 40) { ctx.beginPath(); ctx.moveTo(i, -h / 2); ctx.lineTo(i, h / 2); ctx.stroke(); } for (let j = -h / 2; j < h / 2; j += 40) { ctx.beginPath(); ctx.moveTo(-w / 2, j); ctx.lineTo(w / 2, j); ctx.stroke(); }
      withT(0, 120, 2.4, 0, () => SP.car(0, 0, 1, '#E2483D', t * 0.3, 1 - k)); }); } },
    { z: 0.85, draw: () => { floorV(1230, '#1B2236', '#0B1020'); lightPool(300, 1180, 300, C.amber, 0.25); SP.officeChair(170, 1230, 1.0); person(250, 1210, 'dev', { t, s: 0.95, look: 0.4, mood: 0.5, arms: [[0.5, 0.3], [0.5, 0.3]] });
      SP.laptop(700, 1180, 1.0, t);
      const kc = back(seg(t, D * 0.55, D * 0.55 + 0.4)); if (kc > 0) { withT(760, 1000, kc * 0.7, 0, () => { P(rr(-60, -60, 120, 120, 10), '#E8B04A', C.ink, 5); line(-60, -10, 60, -10, C.ink, 4); }); withT(860, 1060, kc * 0.6, 0, () => P(poly([0, -80, 40, 40, -40, 40]), '#FF8A1E', C.ink, 5)); } } }],
    drift(t, d, 18), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('GTA V: GAADIYAN + PROPS', CX, 300 + 80, back(seg(t, 0.4, 0.8)), C.amber, 46, C.ink);
  tag('TECHNICOLOR.COM · GTA V', 40, 290 - 0, 26, C.amber);
  vignette();
};

// ---------- n02 Technicolor Games, Bangalore: facial animation + mocap clean-up ----------
DRAWV.techni = (t, d) => {
  const D = LINES.n02.dur, t2 = D * 0.4;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#140E22', '#2A1A40'); bokeh(t, 12, '#FF5FA2', 17); } },
    { z: 0.4, draw: () => { alpha(1 - seg(t, t2, t2 + 0.4) * 0.65, () => studioSign(CX, 1010, 0.95, 'TECHNICOLOR GAMES', 'BANGALORE', t, C.amber)); } },
    { z: 0.85, draw: () => { floorV(1225, '#22183A', '#0E0A18'); const k = seg(t, t2, t2 + 0.4); if (k <= 0) return; alpha(k, () => {
      monitor(330, 560, 440, 330, (w, h) => { ctx.fillStyle = '#101A2C'; ctx.fillRect(-w / 2, -h / 2, w, h); withT(0, 10, 1, 0, () => { P(circ(0, 0, 100), '#D9A77E', C.ink, 4); const bl = Math.floor(t * 3) % 5 === 0;
        P(rr(-46, -24, 26, bl ? 4 : 22, 8), C.ink, null); P(rr(20, -24, 26, bl ? 4 : 22, 8), C.ink, null); P(rr(-34, 34, 68, 14 + 14 * Math.abs(Math.sin(t * 7)), 8), '#7A2E2E', C.ink, 3);
        ctx.strokeStyle = '#9DFFB0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 100, 0, 6.283); ctx.moveTo(-100, 0); ctx.lineTo(100, 0); ctx.moveTo(0, -100); ctx.lineTo(0, 100); ctx.stroke(); }); });
      mocapPerson(760, 1220, t, 1.05); SP.camera(300, 1200, 0.9, t); }); } }],
    drift(t, d, 16), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('FACIAL ANIMATION', 330, 860, back(seg(t, t2 + 0.3, t2 + 0.7)), CYAN, 40, C.ink);
  chipV('MOCAP CLEAN-UP', 700, 380, back(seg(t, D * 0.7, D * 0.7 + 0.4)), '#9DFFB0', 44, C.ink);
  tag('TECHNICOLOR.COM', 40, 290, 26, C.amber);
  vignette();
};

// ---------- n03 twist: ~Aug 2016 Rockstar opens its own Bengaluru studio ----------
DRAWV.twist = (t, d) => {
  const D = LINES.n03.dur, u = t - 0.45, kb = back(seg(u, D * 0.55, D * 0.55 + 0.5));
  depth([{ z: 0.05, haze: 1, draw: () => nightCity(t, 21) },
    { z: 0.5, draw: () => { lightPool(CX, 1000, 520, C.amber, 0.3); if (kb > 0) withT(CX, 1180, kb, 0, () => studioSign(0, 0, 0.95, 'ROCKSTAR INDIA', 'BENGALURU', t, C.green2)); } },
    { z: 0.85, draw: () => { floorV(1185, '#151C2E', '#080B14'); for (let i = 0; i < 7; i++) P(rr(((i * 180 - t * 160) % 1260 + 1260) % 1260 - 180, 1240, 100, 12, 6), '#3A4560', null); SP.pin(t, 0.45 + D * 0.3, 830, 640, ''); } }], drift(t, d, 16), 0, lerp(1.0, 1.06, ease(t / d)));
  if (t < 1.5) alpha(1 - seg(t, 1.1, 1.5), () => { glow(CX, 650, 500, C.amber, 0.4); txtStroke('TWIST!', CX, 650, 200, C.amber, C.ink, 18); });
  chipV('≈ AUG 2016', 330, 420, back(seg(u, D * 0.3, D * 0.3 + 0.4)), C.amber, 56, C.ink);
  tag('WIKIPEDIA: ROCKSTAR INDIA', 40, 290, 26, C.amber);
  vignette();
};

// ---------- n04 part of the Red Dead Redemption 2 development team ----------
DRAWV.rdr = (t, d) => {
  const D = LINES.n04.dur;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#3A1A1A', '#E0803A'); glow(CX, 760, 340, '#FFD08A', 0.6); P(circ(CX, 780, 150), '#FFC56E', null); } },
    { z: 0.35, draw: () => { P(new Path2D('M-200 1000 L120 820 L340 940 L560 780 L820 930 L1280 860 L1280 1300 L-200 1300 Z'), '#5A2A22', null);
      [[160, 1080, 1], [880, 1060, 0.8]].forEach(([x, y, s]) => withT(x, y, s, 0, () => { P(rr(-22, -220, 44, 230, 22), '#2A3A20', C.ink, 4); P(rr(-90, -150, 30, 90, 15), '#2A3A20', C.ink, 4); P(rr(-90, -90, 80, 26, 13), '#2A3A20', null); P(rr(60, -190, 30, 100, 15), '#2A3A20', C.ink, 4); P(rr(10, -116, 80, 26, 13), '#2A3A20', null); })); } },
    { z: 0.8, draw: () => { floorV(1120, '#3A1C16', '#1E0E0B');
      const k = back(seg(t, 0.3, 0.7)); if (k > 0) withT(CX, 620, k, -0.03, () => reportCard(0, 0, 1.45, 'DEVELOPMENT TEAM', 'RED DEAD REDEMPTION 2', 0, '#F2EEE3', '#8E2B21'));
      const k2 = back(seg(t, D * 0.55, D * 0.55 + 0.4)); if (k2 > 0) withT(CX, 920, k2, 0.03, () => { P(rr(-300, -55, 600, 110, 55), C.green2, C.ink, 5); txt('+ ROCKSTAR INDIA', 0, 4, 54, C.ink); }); } }],
    drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  tag('WIKIPEDIA · RDR 2: OCT 2018', 40, 290, 26, C.amber);
  vignette();
};

// ---------- n05 May 2019: absorbs Dhruva Interactive; team ≈800 ----------
DRAWV.dhruva = (t, d) => {
  const D = LINES.n05.dur, km = easeOut(seg(t, D * 0.15, D * 0.5)), kp = seg(t, D * 0.55, D * 0.92);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1A1C', '#163A3A'); bokeh(t, 12, C.green2, 41); } },
    { z: 0.5, draw: () => {
      if (kp <= 0.02) { withT(lerp(230, 380, km), 760, 0.62, 0, () => studioSign(0, 0, 1, 'ROCKSTAR INDIA', '', t, C.green2)); withT(lerp(770, 620, km), 760, 0.62 * (1 - km * 0.4), 0, () => studioSign(0, 0, 1, 'DHRUVA', 'INTERACTIVE', t, '#FF9DC4')); if (km > 0.9) alpha(seg(km, 0.9, 1), () => glow(CX, 600, 400, C.white, 0.5)); }
      else { const n = Math.round(80 * kp); for (let i = 0; i < 80; i++) { const c = i % 8, r = Math.floor(i / 8); alpha(i < n ? 1 : 0.15, () => peopleIcon(150 + c * 100, 420 + r * 72, 60, i < 50 ? C.green2 : '#FF9DC4')); } } } },
    { z: 0.85, draw: () => { floorV(1240, '#10282A', '#071214'); if (kp > 0) { const k = back(seg(t, D * 0.6, D * 0.6 + 0.4)); withT(CX, 1150, k, 0, () => { P(rr(-280, -70, 560, 140, 70), C.amber, C.ink, 5); txt('≈ ' + fmt(cnt(t, D * 0.6, D * 0.3, 800)) + ' LOG', 0, 4, 76, C.ink); }); } } }],
    drift(t, d, 14), 0, lerp(1.0, 1.04, ease(t / d)));
  chipV('MAY 2019: + DHRUVA INTERACTIVE', CX, 400 - 20, back(seg(t, 0.2, 0.6)) * (1 - seg(t, D * 0.5, D * 0.55)), '#FF9DC4', 42, C.ink);
  if (t < D * 0.55) chipV('BHARAT KA SABSE PURANA GAME DEVELOPER', CX, 1040, back(seg(t, D * 0.3, D * 0.3 + 0.4)), C.white, 34, C.ink);
  tag(kp > 0 ? 'WIKIPEDIA: ≈800 EMPLOYEES (2019) · 1 ICON = 10 LOG' : 'WIKIPEDIA: ROCKSTAR INDIA', 40, 290, 26, C.amber);
  vignette();
};

// ---------- n06 today: job post — mocap -> character animation for all Rockstar games ----------
DRAWV.today = (t, d) => {
  const D = LINES.n06.dur, t2 = D * 0.35;
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1C2440'); bokeh(t, 14, '#9DFFB0', 51); } },
    { z: 0.45, draw: () => { const k = back(seg(t, 0, 0.35)); if (k > 0) withT(CX, 560, k, -0.03, () => { shadow(0, 260, 300, 0.3); P(rr(-380, -230, 760, 460, 18), '#F2EEE3', C.ink, 6); P(rr(-380, -230, 760, 90, [18, 18, 0, 0]), '#2E6BD8', C.ink, 6);
        txt('JOB POST · BENGALURU', 0, -184, 46, C.white); txt('CHARACTER ANIMATOR', 0, -90, 48, C.ink, 'Oswald', 700);
        ['"We take mocap data" ...', '"... for all Rockstar video games."'].forEach((s, i) => alpha(seg(t, 0.8 + i * 0.6, 1.2 + i * 0.6), () => txt(s, 0, 0 + i * 70, 38, '#2D3A55', 'Oswald', 600)));
        line(-320, 150, 320, 150, '#C8C0AE', 3); txt('ROCKSTAR INDIA', 0, 190, 34, C.red, 'Oswald', 700); }); } },
    { z: 0.85, draw: () => { floorV(1235, '#1B2236', '#0B1020'); const k = seg(t, t2, t2 + 0.5); if (k <= 0) return; alpha(k, () => { mocapPerson(230, 1230, t, 0.95, { arms: [[-0.4 + Math.sin(t * 3) * 0.6, 0.2], [0.4 - Math.sin(t * 3) * 0.6, 0.2]] });
      monitor(690, 1000, 360, 280, (w, h) => { ctx.fillStyle = '#0B1A2E'; ctx.fillRect(-w / 2, -h / 2, w, h); skeletonV(0, 40, 0.9, t); }); line(350, 1000, 500, 1000, '#9DFFB0', 6); P(poly([500, 984, 528, 1000, 500, 1016]), '#9DFFB0', null); }); } }],
    drift(t, d, 12), 0, lerp(1.0, 1.04, ease(t / d)));
  chipV('MOCAP SE CHARACTER ANIMATION', CX, 870, back(seg(t, D * 0.55, D * 0.55 + 0.4)), '#9DFFB0', 44, C.ink);
  tag('ROCKSTAR GAMES JOB POST (GREENHOUSE)', 40, 290, 26, C.amber);
  vignette();
};

// ---------- spoken closing: comment question ----------
DRAWV.end1 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0B1222', '#1C2440'); bokeh(t, 14, '#F4D06F', 61); } },
    { z: 0.6, draw: () => {
      const bub = (s, x, y, t0, col) => { const k = back(seg(t, t0, t0 + 0.35)); if (k <= 0) return; withT(x, y, k, wob(t, 0.5, 0.03, x), () => { ctx.font = '700 46px Oswald'; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -50, w, 100, 30), col, C.ink, 5); P(poly([-20, 48, 10, 48, -30, 85]), col, C.ink, 5); txt(s, 0, 3, 46, C.ink); }); };
      bub('HAAN, ANIMATOR BANUNGI!', 400, 460, 0.3, '#9DFFB0'); bub('MAIN CARS BANAUNGA!', 420, 610, 0.6, C.amber); bub('CODING KARUNGA!', 360, 760, 0.9, '#9DC4FF'); bub('BAS KHELUNGA!', 330, 910, 1.2, '#FF9DC4');
      floorV(1240, '#1B2236', '#0B1020'); SP.laptop(220, 1230, 0.8, t); shadow(780, 1240, 110); person(780, 1240, 'mahila', { t, s: 1.05, look: -0.3, mood: 0.6, arms: [[0.3, 0.2], [-2.1, -0.4]] }); } }], drift(t, d, 14), 0, lerp(1.0, 1.05, ease(t / d)));
  chipV('COMMENT MEIN BATAO', CX, 300, back(seg(t, 0.1, 0.45)), C.amber, 46, C.ink);
  vignette();
};
