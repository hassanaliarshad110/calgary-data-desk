/* STUDIO ENGINE · core.js
   Time-driven canvas animation core shared by all three channels.
   Every drawing function is a pure function of time t (seconds), so any frame can be rendered
   in any order (deterministic, scrubbable, parallel-safe). */
'use strict';
const STUDIO = { version: '1.0.0', W: 1920, H: 1080, fps: 30 };

// ---------- maths & easing ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, v) => clamp((v - a) / (b - a));           // 0..1 progress of v between a and b
const TAU = Math.PI * 2;
const EASE = {
  linear: k => k,
  in: k => k * k, out: k => 1 - (1 - k) * (1 - k), inOut: k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2,
  cubicIn: k => k * k * k, cubicOut: k => 1 - Math.pow(1 - k, 3), cubicInOut: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
  expoOut: k => k >= 1 ? 1 : 1 - Math.pow(2, -10 * k), expoInOut: k => k <= 0 ? 0 : k >= 1 ? 1 : k < .5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2,
  back: k => { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
  backIn: k => { const c = 1.70158; return (c + 1) * k * k * k - c * k * k; },
  elastic: k => k <= 0 ? 0 : k >= 1 ? 1 : Math.pow(2, -10 * k) * Math.sin((k * 10 - .75) * TAU / 3) + 1,
  bounce: k => { const n = 7.5625, d = 2.75; if (k < 1 / d) return n * k * k; if (k < 2 / d) return n * (k -= 1.5 / d) * k + .75; if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + .9375; return n * (k -= 2.625 / d) * k + .984375; },
  smooth: k => k * k * (3 - 2 * k),
};
const ease = (name, k) => (EASE[name] || EASE.inOut)(clamp(k));
// tween(t, t0, dur, from, to, easing)
const tw = (t, t0, d, a, b, e = 'inOut') => lerp(a, b, ease(e, (t - t0) / d));
// keyframes: [[time, value, easing?], ...] → value at t (numbers or arrays)
function keys(t, kf) {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) {
    const [t1, v1, e] = kf[i], [t0, v0] = kf[i - 1];
    if (t <= t1) {
      const k = ease(e || 'inOut', (t - t0) / (t1 - t0));
      return Array.isArray(v0) ? v0.map((x, j) => lerp(x, v1[j], k)) : lerp(v0, v1, k);
    }
  }
  return kf[kf.length - 1][1];
}
// seeded random (mulberry32) and smooth noise — deterministic per seed
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
const wobble = (t, speed = 1, seed = 0) => noise1(t * speed + seed * 17.3);

// ---------- colour helpers ----------
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
const rgba = (h, a = 1) => { const [r, g, b] = hexToRgb(h); return `rgba(${r},${g},${b},${a})`; };
function shade(h, k) { const [r, g, b] = hexToRgb(h); const f = c => Math.round(clamp(k < 0 ? c * (1 + k) : c + (255 - c) * k, 0, 255)); return '#' + [f(r), f(g), f(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
const mix = (h1, h2, k) => { const a = hexToRgb(h1), b = hexToRgb(h2); return '#' + a.map((c, i) => Math.round(lerp(c, b[i], k)).toString(16).padStart(2, '0')).join(''); };

// ---------- canvas setup ----------
let C = null;
function stage(w = 1920, h = 1080) {
  STUDIO.W = w; STUDIO.H = h;
  let cv = document.getElementById('stage');
  if (!cv) { cv = document.createElement('canvas'); cv.id = 'stage'; document.body.appendChild(cv); }
  cv.width = w; cv.height = h; C = cv.getContext('2d');
  document.body.style.margin = 0; document.body.style.background = '#000';
  return C;
}
// offscreen layer for compositing (blur, masks, glows)
function layer(w = STUDIO.W, h = STUDIO.H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// ---------- primitives ----------
function rr(x, y, w, h, r) { C.beginPath(); C.roundRect ? C.roundRect(x, y, w, h, r) : C.rect(x, y, w, h); }
function circle(x, y, r) { C.beginPath(); C.arc(x, y, Math.max(0, r), 0, TAU); }
function fillPath(fill, stroke, lw = 0) { if (fill) { C.fillStyle = fill; C.fill(); } if (stroke && lw) { C.lineWidth = lw; C.strokeStyle = stroke; C.stroke(); } }
function poly(pts, close = true) { C.beginPath(); pts.forEach(([x, y], i) => i ? C.lineTo(x, y) : C.moveTo(x, y)); if (close) C.closePath(); }
function smoothPoly(pts, close = true) { // Catmull-Rom through points
  const n = pts.length; C.beginPath(); C.moveTo(...pts[0]);
  for (let i = 0; i < (close ? n : n - 1); i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    C.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  if (close) C.closePath();
}
function grad(x0, y0, x1, y1, stops) { const g = C.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function rgrad(x, y, r0, r1, stops) { const g = C.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function withT(fn, { x = 0, y = 0, s = 1, sx, sy, r = 0, a = 1, comp } = {}) {
  C.save(); C.translate(x, y); if (r) C.rotate(r); C.scale(sx ?? s, sy ?? s); C.globalAlpha *= a; if (comp) C.globalCompositeOperation = comp; fn(); C.restore();
}
function text(str, x, y, { font = '700 64px Fira Sans', fill = '#fff', align = 'center', base = 'middle', stroke, lw = 0, shadow, ls = 0, a = 1, maxW } = {}) {
  C.save(); C.globalAlpha *= a; C.font = font; C.textAlign = align; C.textBaseline = base;
  if (ls) C.letterSpacing = ls + 'px';
  if (shadow) { C.shadowColor = shadow[0]; C.shadowBlur = shadow[1]; C.shadowOffsetX = shadow[2] || 0; C.shadowOffsetY = shadow[3] || 0; }
  if (stroke && lw) { C.lineJoin = 'round'; C.lineWidth = lw; C.strokeStyle = stroke; C.strokeText(str, x, y, maxW); }
  C.fillStyle = fill; C.fillText(str, x, y, maxW); C.restore();
}
function wrapLines(str, font, maxW) { C.save(); C.font = font; const out = []; let line = ''; for (const w of str.split(' ')) { const tst = line ? line + ' ' + w : w; if (C.measureText(tst).width > maxW && line) { out.push(line); line = w; } else line = tst; } if (line) out.push(line); C.restore(); return out; }

// ---------- CAMERA PRESETS ----------
// A camera is {x, y, zoom, rot}; world point (wx,wy) maps to screen via cam.apply().
// Presets return a camera for time t, so scenes stay scrubbable.
const CAM = {
  still: (o = {}) => ({ x: STUDIO.W / 2, y: STUDIO.H / 2, zoom: 1, rot: 0, ...o }),
  pan: (t, t0, d, from, to, e = 'inOut', zoom = 1) => ({ x: tw(t, t0, d, from[0], to[0], e), y: tw(t, t0, d, from[1], to[1], e), zoom, rot: 0 }),
  zoom: (t, t0, d, z0, z1, at = [STUDIO.W / 2, STUDIO.H / 2], e = 'inOut') => ({ x: at[0], y: at[1], zoom: tw(t, t0, d, z0, z1, e), rot: 0 }),
  push: (t, t0, d, at, z1 = 1.35) => CAM.zoom(t, t0, d, 1, z1, at, 'cubicInOut'),
  pull: (t, t0, d, at, z0 = 1.35) => CAM.zoom(t, t0, d, z0, 1, at, 'cubicInOut'),
  kenBurns: (t, d, a = [960, 540, 1.0], b = [1040, 500, 1.12]) => ({ x: tw(t, 0, d, a[0], b[0], 'linear'), y: tw(t, 0, d, a[1], b[1], 'linear'), zoom: tw(t, 0, d, a[2], b[2], 'linear'), rot: 0 }),
  track: (t, subjectX, subjectY, lead = 120, zoom = 1, lag = 0) => ({ x: subjectX + lead, y: subjectY, zoom, rot: 0 }),
  dutch: (base, ang = 0.06) => ({ ...base, rot: ang }),
  handheld: (base, t, amt = 6, seed = 1) => ({ ...base, x: base.x + wobble(t, 0.9, seed) * amt, y: base.y + wobble(t, 1.1, seed + 3) * amt * 0.7, rot: (base.rot || 0) + wobble(t, 0.5, seed + 7) * 0.004 }),
  shake: (base, t, t0, d = 0.5, amt = 22, seed = 2) => { const k = clamp(1 - (t - t0) / d); if (t < t0 || k <= 0) return base; return { ...base, x: base.x + wobble(t, 28, seed) * amt * k, y: base.y + wobble(t, 31, seed + 9) * amt * k, rot: (base.rot || 0) + wobble(t, 20, seed + 4) * 0.02 * k }; },
  whip: (t, t0, d, from, to) => CAM.pan(t, t0, d, from, to, 'expoInOut'),
  orbit2D: (t, cx, cy, rad, speed = 0.2, zoom = 1.1) => ({ x: cx + Math.cos(t * speed) * rad, y: cy + Math.sin(t * speed) * rad * 0.4, zoom, rot: Math.sin(t * speed) * 0.01 }),
  crane: (t, t0, d, x, yFrom, yTo, zFrom = 1, zTo = 1.15) => ({ x, y: tw(t, t0, d, yFrom, yTo, 'cubicInOut'), zoom: tw(t, t0, d, zFrom, zTo, 'cubicInOut'), rot: 0 }),
};
function camApply(cam, depth = 1) { // depth<1 = farther layer (moves less) → parallax
  const W = STUDIO.W, H = STUDIO.H, z = 1 + (cam.zoom - 1) * depth;
  C.translate(W / 2, H / 2); if (cam.rot) C.rotate(cam.rot * depth); C.scale(z, z);
  C.translate(-(W / 2 + (cam.x - W / 2) * depth), -(H / 2 + (cam.y - H / 2) * depth));
}
// PARALLAX: draw ordered layers [{depth, draw}] under one camera
function parallax(cam, layers) { for (const L of layers) { C.save(); camApply(cam, L.depth); L.draw(); C.restore(); } }
// motion blur by accumulating sub-frames (use sparingly; cost = n draws)
function motionBlur(drawAt, t, shutter = 1 / 60, n = 4) { const cv = layer(); const g = cv.getContext('2d'); const keep = C; for (let i = 0; i < n; i++) { C = g; C.save(); C.globalAlpha = 1 / (i + 1); drawAt(t - shutter * i / n); C.restore(); } C = keep; C.drawImage(cv, 0, 0); }

// ---------- SCENE TRANSITIONS ----------  k: 0→1 progress; drawA/drawB render the outgoing/incoming scenes
const TRANS = {
  cut: (k, A, B) => (k < .5 ? A : B)(),
  dissolve: (k, A, B) => { A(); C.save(); C.globalAlpha = ease('inOut', k); B(); C.restore(); },
  dipBlack: (k, A, B) => { (k < .5 ? A : B)(); C.fillStyle = `rgba(0,0,0,${1 - Math.abs(k * 2 - 1)})`; C.fillRect(0, 0, STUDIO.W, STUDIO.H); },
  dipWhite: (k, A, B) => { (k < .5 ? A : B)(); C.fillStyle = `rgba(255,255,255,${1 - Math.abs(k * 2 - 1)})`; C.fillRect(0, 0, STUDIO.W, STUDIO.H); },
  wipe: (k, A, B, dir = 1) => { A(); const e = ease('cubicInOut', k), W = STUDIO.W; C.save(); C.beginPath(); dir > 0 ? C.rect(0, 0, W * e, STUDIO.H) : C.rect(W * (1 - e), 0, W * e, STUDIO.H); C.clip(); B(); C.restore(); },
  push: (k, A, B) => { const e = ease('expoInOut', k), W = STUDIO.W; C.save(); C.translate(-W * e, 0); A(); C.restore(); C.save(); C.translate(W * (1 - e), 0); B(); C.restore(); },
  iris: (k, A, B, cx = STUDIO.W / 2, cy = STUDIO.H / 2) => { A(); const R = Math.hypot(STUDIO.W, STUDIO.H) * ease('cubicInOut', k); C.save(); circle(cx, cy, R); C.clip(); B(); C.restore(); },
  irisOut: (k, A, B, cx = STUDIO.W / 2, cy = STUDIO.H / 2) => { if (k < .5) { A(); const R = Math.hypot(STUDIO.W, STUDIO.H) * (1 - ease('cubicIn', k * 2)); C.save(); C.fillStyle = '#000'; C.beginPath(); C.rect(0, 0, STUDIO.W, STUDIO.H); C.arc(cx, cy, Math.max(0, R), 0, TAU, true); C.fill('evenodd'); C.restore(); } else { B(); const R = Math.hypot(STUDIO.W, STUDIO.H) * ease('cubicOut', (k - .5) * 2); C.save(); C.fillStyle = '#000'; C.beginPath(); C.rect(0, 0, STUDIO.W, STUDIO.H); C.arc(cx, cy, R, 0, TAU, true); C.fill('evenodd'); C.restore(); } },
  whipPan: (k, A, B) => { const W = STUDIO.W; const e = ease('expoInOut', k); const cv = layer(); const g = cv.getContext('2d'); const keep = C; C = g; C.save(); C.translate(-W * e, 0); A(); C.restore(); C.save(); C.translate(W * (1 - e), 0); B(); C.restore(); C = keep; const blur = Math.sin(k * Math.PI) * 38; C.save(); C.filter = `blur(${blur}px)`; C.drawImage(cv, 0, 0); C.restore(); },
  zoomThrough: (k, A, B) => { const W = STUDIO.W, H = STUDIO.H; if (k < .5) { const z = 1 + ease('cubicIn', k * 2) * 2.5; C.save(); C.translate(W / 2, H / 2); C.scale(z, z); C.translate(-W / 2, -H / 2); C.filter = `blur(${k * 24}px)`; A(); C.restore(); } else { const z = 0.4 + ease('cubicOut', (k - .5) * 2) * 0.6; C.save(); C.translate(W / 2, H / 2); C.scale(z, z); C.translate(-W / 2, -H / 2); C.filter = `blur(${(1 - k) * 24}px)`; B(); C.restore(); } },
  glitch: (k, A, B) => { (k < .5 ? A : B)(); const amt = Math.sin(k * Math.PI); const r = rng(Math.floor(k * 40) + 7); const snap = C.getImageData(0, 0, STUDIO.W, STUDIO.H); for (let i = 0; i < 14 * amt; i++) { const y = r() * STUDIO.H | 0, h = 8 + r() * 60 | 0, dx = (r() - .5) * 160 * amt | 0; C.putImageData(snap, dx, 0, 0, y, STUDIO.W, h); } C.fillStyle = `rgba(255,0,60,${0.12 * amt})`; C.fillRect(0, 0, STUDIO.W, STUDIO.H); },
  lightLeak: (k, A, B) => { (k < .5 ? A : B)(); const a = Math.sin(k * Math.PI); C.save(); C.globalCompositeOperation = 'screen'; C.fillStyle = rgrad(STUDIO.W * (0.2 + k * 0.6), STUDIO.H * 0.4, 0, STUDIO.W * 0.8, [[0, `rgba(255,190,90,${a})`], [0.5, `rgba(255,90,40,${a * 0.5})`], [1, 'rgba(0,0,0,0)']]); C.fillRect(0, 0, STUDIO.W, STUDIO.H); C.restore(); },
  newsSwoosh: (k, A, B, col = '#c8102e') => { (k < .5 ? A : B)(); const W = STUDIO.W, H = STUDIO.H; const e = ease('expoInOut', k); C.save(); C.fillStyle = col; C.beginPath(); const x = lerp(-W * 0.6, W * 1.6, e); C.moveTo(x - 300, 0); C.lineTo(x + 500, 0); C.lineTo(x + 200, H); C.lineTo(x - 600, H); C.fill(); C.fillStyle = '#0b1f3a'; C.beginPath(); C.moveTo(x - 420, 0); C.lineTo(x - 300, 0); C.lineTo(x - 600, H); C.lineTo(x - 720, H); C.fill(); C.restore(); },
};
// timeline helper: run transition between two scene renderers over [t0, t0+d]
function transition(name, t, t0, d, A, B, ...args) { if (t < t0) return A(); if (t > t0 + d) return B(); TRANS[name]((t - t0) / d, A, B, ...args); }

// ---------- ANIMATED TEXT ----------
const TXT = {
  typeOn: (str, t, t0, cps, x, y, o = {}) => { const n = clamp(Math.floor((t - t0) * cps), 0, str.length); text(str.slice(0, n) + ((t * 2 | 0) % 2 && n < str.length ? '|' : ''), x, y, o); },
  fadeUp: (str, t, t0, x, y, o = {}, d = 0.6) => { const k = ease('cubicOut', (t - t0) / d); text(str, x, y + (1 - k) * 40, { ...o, a: (o.a ?? 1) * k }); },
  pop: (str, t, t0, x, y, o = {}) => { const k = ease('back', (t - t0) / 0.45); withT(() => text(str, 0, 0, o), { x, y, s: Math.max(0.001, k), a: clamp((t - t0) / 0.15) }); },
  slam: (str, t, t0, x, y, o = {}) => { const k = clamp((t - t0) / 0.28); const s = lerp(2.6, 1, ease('cubicIn', k)); withT(() => text(str, 0, 0, o), { x, y, s, a: k }); },
  perLetter: (str, t, t0, x, y, o = {}, stagger = 0.04) => { C.save(); C.font = o.font || '700 64px Fira Sans'; const total = C.measureText(str).width; C.restore(); let cx = x - (o.align === 'left' ? 0 : total / 2); for (let i = 0; i < str.length; i++) { C.save(); C.font = o.font || '700 64px Fira Sans'; const w = C.measureText(str[i]).width; C.restore(); const k = ease('back', (t - t0 - i * stagger) / 0.4); if (k > 0) withT(() => text(str[i], 0, 0, { ...o, align: 'left' }), { x: cx, y: y + (1 - k) * 30, a: clamp(k) }); cx += w; } },
  wordByWord: (str, t, t0, x, y, o = {}, wps = 3) => { const words = str.split(' '); const n = clamp(Math.floor((t - t0) * wps) + 1, 0, words.length); text(words.slice(0, n).join(' '), x, y, o); },
  counter: (t, t0, d, from, to, x, y, o = {}, fmt = v => Math.round(v).toLocaleString('en-CA')) => text(fmt(tw(t, t0, d, from, to, 'expoOut')), x, y, o),
  highlight: (str, t, t0, x, y, o = {}, col = '#f2b705') => { C.save(); C.font = o.font || '700 64px Fira Sans'; const w = C.measureText(str).width; C.restore(); const k = ease('cubicOut', (t - t0) / 0.5); const h = parseInt((o.font || '64px').match(/(\d+)px/)[1]) * 0.9; const x0 = o.align === 'left' ? x : x - w / 2; C.fillStyle = col; C.fillRect(x0 - 10, y - h / 2, (w + 20) * k, h); text(str, x, y, o); },
};

// ---------- LIP-SYNC ----------
// amp: array of per-frame loudness 0..1 at fps (made by render/lipsync.py). Returns viseme name for time t.
function visemeAt(amp, t, t0 = 0, fps = 30, seed = 0) {
  if (!amp) return 'rest'; const i = Math.floor((t - t0) * fps); if (i < 0 || i >= amp.length) return 'rest';
  const a = amp[i]; if (a < 0.08) return (amp[i - 1] || 0) > 0.25 ? 'MBP' : 'rest';
  const pick = hash(i * 1.7 + seed);
  if (a > 0.62) return pick < .55 ? 'AI' : (pick < .8 ? 'O' : 'E');
  if (a > 0.35) return ['E', 'AI', 'O', 'etc', 'U'][Math.floor(pick * 5)];
  return ['etc', 'FV', 'L', 'WQ', 'MBP', 'E'][Math.floor(pick * 6)];
}

// ---------- 2D / 3D COMPOSITING ----------
// Draw an <img>/<canvas>/<video> (e.g. a three.js render or acquired sprite) into the scene with blend, shadow and grade.
function composite(src, x, y, w, h, { blend = 'source-over', a = 1, shadow = null, grade = null, r = 0 } = {}) {
  C.save(); C.globalAlpha *= a; C.globalCompositeOperation = blend; if (grade) C.filter = grade;
  if (shadow) { C.shadowColor = shadow[0]; C.shadowBlur = shadow[1]; C.shadowOffsetY = shadow[2] || 0; }
  C.translate(x + w / 2, y + h / 2); if (r) C.rotate(r); C.drawImage(src, -w / 2, -h / 2, w, h); C.restore();
}
function vignette(a = 0.45) { C.fillStyle = rgrad(STUDIO.W / 2, STUDIO.H / 2, STUDIO.H * 0.35, STUDIO.H * 1.0, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${a})`]]); C.fillRect(0, 0, STUDIO.W, STUDIO.H); }
function grain(t, a = 0.05) { const r = rng(Math.floor(t * 30) + 1); C.save(); C.globalAlpha = a; for (let i = 0; i < 900; i++) { C.fillStyle = r() < .5 ? '#fff' : '#000'; C.fillRect(r() * STUDIO.W, r() * STUDIO.H, 2, 2); } C.restore(); }
function letterbox(k = 1, h = 110) { C.fillStyle = '#000'; C.fillRect(0, 0, STUDIO.W, h * k); C.fillRect(0, STUDIO.H - h * k, STUDIO.W, h * k); }
function colorGrade(look) { // apply a look to everything drawn so far
  const looks = { warm: 'rgba(255,170,80,0.10)', cool: 'rgba(60,120,255,0.10)', night: 'rgba(10,20,80,0.35)', sepia: 'rgba(140,100,40,0.25)', news: 'rgba(0,40,120,0.06)' };
  C.save(); C.globalCompositeOperation = look === 'night' ? 'multiply' : 'soft-light'; C.fillStyle = looks[look] || look; C.fillRect(0, 0, STUDIO.W, STUDIO.H); C.restore();
}

// ---------- scene registry used by render/render.py ----------
const SCENES = []; const DRAW = {};
function scene(id, dur, fn) { const start = SCENES.reduce((s, x) => s + x.dur, 0); SCENES.push({ id, start, dur }); DRAW[id] = fn; }
function drawFrame(id, t) { C.setTransform(1, 0, 0, 1, 0, 0); C.clearRect(0, 0, STUDIO.W, STUDIO.H); C.globalAlpha = 1; C.filter = 'none'; DRAW[id](t); }
window.STUDIO_READY = true;
