/* Calgary Origins Ep 2 · "Grass for a Penny: Calgary's Ranch Era" · one scene file for every format.
 *   film (1920x1080):  render.py scene.js film.mp4 --geo calgary_base.json --param format=wide
 *   reel n (1080x1920): render.py scene.js part1.mp4 --geo calgary_base.json --param part=1
 *   thumbnails: --param thumb=wide (1280x720) or --param thumb=1..4 (1080x1920), --stills 0
 * Every name, year and number on screen comes from the audited claims table (package, section F).
 * EP (inlined by build_scene.py): lines with measured durations, visual specs, end lines, regional geography.
 */
const EP = __EP__;
{ const P2 = CanvasRenderingContext2D.prototype, A = P2.arc, El = P2.ellipse; P2.arc = function (x, y, r, a0, a1, cc) { return A.call(this, x, y, Math.max(0, r || 0), a0, a1, cc); }; P2.ellipse = function (x, y, rx, ry, ...o) { return El.call(this, x, y, Math.max(0, rx), Math.max(0, ry), ...o); }; }
const P = window.PARAMS || {};
const THUMB = P.thumb || '';
const PART = +(P.part || (THUMB && THUMB !== 'wide' ? THUMB : 0)) || 0;
const WIDE = P.format === 'wide' || THUMB === 'wide';
const W = THUMB === 'wide' ? 1280 : WIDE ? 1920 : 1080, H = THUMB === 'wide' ? 720 : WIDE ? 1080 : 1920;
const SC = W / (WIDE ? 1920 : 1080);                     // scale for the 1280 thumbnail
const CX = WIDE ? W / 2 : (W - 120) / 2 + 30;           // vertical: keep clear of the right-hand 120 px
const GOLD = '#f2b632', NAVY = '#0b1f3a', CREAM = '#f3ead7', COPPER = '#c8743a';
const CH_TITLES = EP.chTitles;
const MAPCREDIT = 'Schematic map · boundaries: Natural Earth (public domain) · positions approximate';
const OSM = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';

// ---------- timeline: which lines this file uses ----------
const LINES = EP.lines.filter(l => !PART || l.ch === PART);
const END = PART ? EP.endPart[PART] : EP.endFilm;
const scriptLines = LINES.map(l => ({ text: l.text, dur: l.dur, gapAfter: l.gap ?? undefined, caption: l.caption }))
  .concat([{ text: END.text, dur: END.dur, caption: END.caption }]);
const S = M.script(scriptLines, { lead: .3, gap: .85, tail: PART ? 3.2 : 4.2 });
const sc = S.scenes;

// captions: each line split into short chunks, timed by character share of the measured line
const CHUNKS = [];
sc.forEach(s => {
  const words = s.caption.split(/\s+/), max = WIDE ? 13 : 8, parts = []; let cur = [];
  words.forEach((w, i) => { cur.push(w); const end = /[.,?!:;]$/.test(w); if (cur.length >= max || (end && cur.length >= (WIDE ? 6 : 4)) || i === words.length - 1) { parts.push(cur.join(' ')); cur = []; } });
  const tot = parts.reduce((a, p) => a + p.length, 0); let t = s.start;
  parts.forEach(p => { const d = s.speech * p.length / tot; CHUNKS.push({ a: t, b: t + d + (p === parts[parts.length - 1] ? .15 : 0), s: p }); t += d; });
});
const capAt = t => { const c = CHUNKS.find(c => t >= c.a && t < c.b); return c ? c.s : ''; };

// ---------- small helpers ----------
const rngv = (seed, i) => { const r = M.rng(seed * 977 + i * 31 + 7); r(); return r(); };
const clamp01 = x => Math.max(0, Math.min(1, x));
const fr = x => ((x % 1) + 1) % 1;
const ease = (t, a, b, e = 'inOutCubic') => M.seg(t, a, b, e);
const SKY = {
  dawn: ['#2b3a5e', '#d9895a', '#f6c98a'], day: ['#3f78b5', '#8fbbe0', '#dbe9f2'], dusk: ['#1d2340', '#7a4a63', '#e39a5c'],
  night: ['#05080f', '#0d1830', '#1c2b48'], storm: ['#3a4250', '#6c7684', '#a9b2bd'], autumn: ['#4f79a6', '#b9c9d6', '#efd9b0'],
};
const GROUND = {
  dawn: ['#7d6a3c', '#a88c4c', '#c9a65a'], day: ['#6f7d3c', '#97a24e', '#c2b45e'], dusk: ['#3d3424', '#5e4b2e', '#7f6436'],
  night: ['#0d1118', '#141b24', '#1b2430'], storm: ['#b9c2cb', '#d6dde3', '#eef3f8'], autumn: ['#7a5f30', '#a7823e', '#c8a253'],
};
function skyFill(c, tod, y1) { const s = SKY[tod] || SKY.day, g = c.createLinearGradient(0, 0, 0, y1); g.addColorStop(0, s[0]); g.addColorStop(.65, s[1]); g.addColorStop(1, s[2]); c.fillStyle = g; c.fillRect(0, 0, W, y1 + 2); }

// mountains: deterministic jagged ridge across a width larger than the frame (for parallax)
function ridge(seed, n, amp) { const r = M.rng(seed), pts = []; for (let i = 0; i <= n; i++) pts.push(r() * amp * (.45 + .55 * Math.abs(Math.sin(i * 1.7 + seed)))); return pts; }
const R1 = ridge(11, 46, 1), R2 = ridge(23, 30, 1), R3 = ridge(37, 22, 1);
function drawRidge(c, pts, baseY, amp, off, color, snow, widthK = 1.6) {
  const span = W * widthK, step = span / (pts.length - 1), x0 = -W * (widthK - 1) / 2 - off;
  c.beginPath(); c.moveTo(x0, baseY + 2);
  pts.forEach((p, i) => c.lineTo(x0 + i * step, baseY - p * amp)); c.lineTo(x0 + span, baseY + 2); c.closePath(); c.fillStyle = color; c.fill();
  if (snow) { c.save(); c.clip(); c.fillStyle = snow; pts.forEach((p, i) => { if (p > .55) { const x = x0 + i * step, y = baseY - p * amp; c.beginPath(); c.moveTo(x, y); c.lineTo(x - step * .45, y + amp * .16); c.lineTo(x + step * .45, y + amp * .16); c.closePath(); c.fill(); } }); c.restore(); }
}
function hills(c, baseY, amp, off, color, freq, seed) { c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W + 20; x += 20) { const X = x + off; c.lineTo(x, baseY - amp * (.5 + .3 * Math.sin(X * freq + seed) + .2 * Math.sin(X * freq * 2.3 + seed * 2))); } c.lineTo(W, H); c.closePath(); c.fillStyle = color; c.fill(); }

// animals (silhouettes; legs swing with gait phase)
function cow(c, x, y, s, ph, col = '#1a1410', dir = 1) {
  c.save(); c.translate(x, y); c.scale(s * dir, s); c.fillStyle = col;
  c.beginPath(); c.ellipse(0, -22, 30, 14, 0, 0, 7); c.fill();                          // body
  c.beginPath(); c.ellipse(32, -28, 10, 7, .5, 0, 7); c.fill();                         // head
  c.fillRect(24, -34, 4, 6); c.fillRect(34, -36, 3, 5);                                  // horns / ears
  const sw = Math.sin(ph) * 6; c.lineWidth = 5; c.strokeStyle = col; c.lineCap = 'round';
  [[-20, sw], [-12, -sw], [14, -sw], [22, sw]].forEach(([lx, d]) => { c.beginPath(); c.moveTo(lx, -14); c.lineTo(lx + d, 2); c.stroke(); });
  c.beginPath(); c.moveTo(-30, -24); c.quadraticCurveTo(-38, -14, -35, -4); c.lineWidth = 2; c.stroke(); c.restore();
}
function horse(c, x, y, s, ph, col = '#1b130d', dir = 1, big = false) {
  c.save(); c.translate(x, y); c.scale(s * dir * (big ? 1.2 : 1), s * (big ? 1.2 : 1)); c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round';
  c.beginPath(); c.ellipse(0, -36, 30, 12, 0, 0, 7); c.fill();
  c.beginPath(); c.moveTo(22, -42); c.lineTo(38, -64); c.lineTo(48, -60); c.lineTo(30, -36); c.closePath(); c.fill();   // neck
  c.beginPath(); c.ellipse(48, -62, 10, 5, .6, 0, 7); c.fill();
  const sw = Math.sin(ph) * 10; c.lineWidth = 5;
  [[-20, sw], [-12, -sw], [16, -sw], [24, sw]].forEach(([lx, d]) => { c.beginPath(); c.moveTo(lx, -28); c.lineTo(lx + d * .6, -12); c.lineTo(lx + d, 2); c.stroke(); });
  c.beginPath(); c.moveTo(-30, -38); c.quadraticCurveTo(-44, -30, -40, -14); c.lineWidth = 4; c.stroke(); c.restore();
}
function bison(c, x, y, s, col = '#120d09') { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(-34, -6); c.quadraticCurveTo(-36, -30, -10, -32); c.quadraticCurveTo(10, -48, 26, -30); c.quadraticCurveTo(40, -24, 38, -10); c.lineTo(30, -4); c.lineTo(-34, -6); c.fill(); c.fillRect(-26, -8, 5, 10); c.fillRect(-12, -8, 5, 10); c.fillRect(14, -8, 5, 10); c.fillRect(26, -8, 5, 10); c.restore(); }
function sheep(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#efe9dc'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-14 + i * 7, -16 - (i % 2) * 4, 9, 0, 7); c.fill(); } c.fillStyle = '#2a2420'; c.beginPath(); c.ellipse(20, -16, 6, 5, 0, 0, 7); c.fill(); c.fillRect(-10, -8, 3, 9); c.fillRect(8, -8, 3, 9); c.restore(); }
function rider(c, x, y, s, ph, col) { horse(c, x, y, s, ph, col); c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.fillRect(-4, -72, 12, 24); c.beginPath(); c.arc(2, -78, 6, 0, 7); c.fill(); c.fillRect(-8, -86, 20, 4); c.fillRect(-3, -92, 10, 7); c.restore(); }

// buildings and props (generic, period-style silhouettes; never a likeness of a specific historic building)
function cabin(c, x, y, s, col, lit) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.fillRect(-60, -50, 120, 50); c.beginPath(); c.moveTo(-70, -50); c.lineTo(0, -92); c.lineTo(70, -50); c.closePath(); c.fill(); c.fillRect(30, -100, 12, 30); if (lit) { c.fillStyle = 'rgba(255,200,110,.95)'; c.fillRect(-40, -36, 18, 16); c.fillRect(20, -36, 18, 16); } c.restore(); }
function church(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.fillRect(-40, -50, 80, 50); c.beginPath(); c.moveTo(-48, -50); c.lineTo(0, -84); c.lineTo(48, -50); c.fill(); c.fillRect(-10, -120, 20, 50); c.beginPath(); c.moveTo(-14, -120); c.lineTo(0, -146); c.lineTo(14, -120); c.fill(); c.fillRect(-2, -160, 4, 16); c.fillRect(-8, -154, 16, 4); c.restore(); }
function barn(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(-70, 0); c.lineTo(-70, -60); c.lineTo(-40, -96); c.lineTo(40, -96); c.lineTo(70, -60); c.lineTo(70, 0); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(-18, -50, 36, 50); c.restore(); }
function plant(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.fillRect(-110, -70, 220, 70); c.beginPath(); c.moveTo(-120, -70); c.lineTo(0, -110); c.lineTo(120, -70); c.fill(); c.fillRect(60, -150, 18, 60); c.restore(); }
function brewery(c, x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#7a3b2a'; c.fillRect(-120, -120, 240, 120); c.fillRect(-40, -170, 80, 60); c.fillStyle = '#5c2a1d'; c.fillRect(80, -230, 22, 120); c.fillStyle = 'rgba(255,214,140,.85)'; for (let i = 0; i < 5; i++) c.fillRect(-100 + i * 44, -90, 22, 30); c.restore();
  for (let i = 0; i < 6; i++) { const k = fr(t * .25 + i / 6); c.fillStyle = `rgba(235,235,235,${.35 * (1 - k)})`; c.beginPath(); c.arc(x + (91 + k * 60) * s, y - (240 + k * 220) * s, (20 + k * 50) * s, 0, 7); c.fill(); } }
function club(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#211a14'; c.fillRect(-150, -160, 300, 160); c.fillRect(-170, -175, 340, 18); for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(255,196,110,.9)'; c.fillRect(-130 + i * 46, -140 + r * 70, 24, 40); c.fillStyle = 'rgba(30,20,10,.85)'; if ((i + r) % 3 === 1) c.fillRect(-124 + i * 46, -126 + r * 70, 10, 26); } c.restore(); }
function house(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#5b2b22'; c.fillRect(-90, -120, 180, 120); c.beginPath(); c.moveTo(-100, -120); c.lineTo(-30, -180); c.lineTo(40, -120); c.fill(); c.fillRect(40, -160, 60, 40); c.beginPath(); c.moveTo(34, -160); c.lineTo(70, -196); c.lineTo(106, -160); c.fill(); c.fillStyle = 'rgba(255,205,120,.95)'; [[-70, -95], [-30, -95], [20, -95], [60, -95], [-50, -150], [62, -145]].forEach(([a, b]) => c.fillRect(a, b, 20, 30)); c.restore(); }
function tent(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(-50, 0); c.lineTo(0, -70); c.lineTo(50, 0); c.fill(); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.moveTo(0, -70); c.lineTo(50, 0); c.lineTo(10, 0); c.fill(); c.restore(); }
function flag(c, x, y, s, t, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#3a2c1e'; c.fillRect(-2, -110, 4, 110); c.fillStyle = col; c.beginPath(); c.moveTo(2, -110); for (let i = 0; i <= 6; i++) c.lineTo(2 + i * 8, -110 + Math.sin(t * 6 + i) * 4); for (let i = 6; i >= 0; i--) c.lineTo(2 + i * 8, -84 + Math.sin(t * 6 + i) * 4); c.fill(); c.restore(); }
function train(c, x, y, s, t, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.fillRect(0, -50, 90, 40); c.fillRect(60, -80, 30, 30); c.fillRect(10, -76, 14, 26); c.beginPath(); c.moveTo(-6, -10); c.lineTo(-22, 4); c.lineTo(0, 4); c.fill();
  for (let i = 1; i <= 5; i++) c.fillRect(100 + (i - 1) * 96, -46, 86, 36); c.fillStyle = '#000'; for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(14 + i * 40, -6, 9, 0, 7); c.fill(); } c.restore();
  for (let i = 0; i < 9; i++) { const k = fr(t * .6 + i / 9); c.fillStyle = `rgba(220,220,220,${.45 * (1 - k)})`; c.beginPath(); c.arc(x + (17 - k * 0) * s + k * 260 * s, y - (84 + k * 120) * s, (14 + k * 40) * s, 0, 7); c.fill(); } }
function silhouette(c, x, y, s, col, hat = 'top') { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(-70, 0); c.quadraticCurveTo(-66, -120, 0, -130); c.quadraticCurveTo(66, -120, 70, 0); c.fill(); c.beginPath(); c.arc(0, -168, 36, 0, 7); c.fill();
  if (hat === 'top') { c.fillRect(-48, -204, 96, 10); c.fillRect(-28, -262, 56, 60); } else if (hat === 'bowler') { c.fillRect(-46, -200, 92, 8); c.beginPath(); c.arc(0, -204, 30, Math.PI, 0); c.fill(); } else { c.beginPath(); c.ellipse(0, -200, 64, 10, 0, 0, 7); c.fill(); c.fillRect(-26, -232, 52, 32); } c.restore(); }

// ---------- the painted landscape (2.5D parallax) ----------
function landscape(c, t, v, dur, i) {
  const tod = v.tod || 'day', p = clamp01(t / Math.max(1, dur)), drift = (i % 2 ? -1 : 1) * p * W * .05;
  const hz = H * (WIDE ? .56 : .5);
  skyFill(c, tod, hz + 40);
  if (tod === 'dawn' || tod === 'dusk') { const g = c.createRadialGradient(W * .7, hz, 10, W * .7, hz, W * .5); g.addColorStop(0, tod === 'dawn' ? 'rgba(255,214,150,.75)' : 'rgba(255,150,90,.55)'); g.addColorStop(1, 'rgba(255,190,120,0)'); c.fillStyle = g; c.fillRect(0, 0, W, hz + 40); }
  if (tod === 'night') { const r = M.rng(5); for (let k = 0; k < 160; k++) { c.fillStyle = `rgba(255,255,255,${.3 + .5 * r()})`; c.fillRect(r() * W, r() * hz * .9, 2, 2); } }
  if (v.arch) M.weather(c, 'chinook', t, W, H, { y: .2 });
  // Rockies to the west (left side of frame on wide shots)
  const mt = { dawn: ['#6a6f8f', '#f6e7d2'], day: ['#7f93ad', '#f4f7fa'], dusk: ['#3d3550', '#c9a7a0'], night: ['#121a28', '#55657d'], storm: ['#8d97a3', '#eef2f5'], autumn: ['#7d8ea6', '#f3f3f0'] }[tod] || ['#7f93ad', '#fff'];
  drawRidge(c, R1, hz, H * (WIDE ? .2 : .13), drift * .15, mt[0], mt[1]);
  drawRidge(c, R2, hz + 6, H * (WIDE ? .12 : .08), drift * .3, M.blend ? M.blend(mt[0], '#000', .25) : mt[0], null);
  const G = GROUND[tod] || GROUND.day;
  hills(c, hz + H * .03, H * .05, drift * .6, G[0], .004, 1);
  hills(c, hz + H * .1, H * .05, drift * 1.0, G[1], .006, 3);
  const gy = hz + H * .16; c.fillStyle = G[2]; c.fillRect(0, gy, W, H - gy);
  const gg = c.createLinearGradient(0, gy, 0, H); gg.addColorStop(0, 'rgba(0,0,0,0)'); gg.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = gg; c.fillRect(0, gy, W, H - gy);
  // grass blades in the foreground, combed by wind
  if (tod !== 'storm') { const r = M.rng(9 + i), n = WIDE ? 220 : 160; c.lineWidth = 2.2 * SC; for (let k = 0; k < n; k++) { const x = (r() * W * 1.3 - drift * 1.6 + W * 2) % (W * 1.3) - W * .15, y = gy + (r() ** .6) * (H - gy), h = (14 + 40 * r()) * ((y - gy) / (H - gy) + .4) * SC, sway = Math.sin(t * 2 + x * .01) * h * .35; c.strokeStyle = `rgba(${tod === 'night' ? '40,50,60' : '60,50,20'},${.25 + .35 * r()})`; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sway * .5, y - h * .6, x + sway, y - h); c.stroke(); } }
  const ink = tod === 'night' ? '#05070b' : tod === 'storm' ? '#2a2c30' : tod === 'dusk' ? '#140e0a' : '#22190f';
  const S0 = (WIDE ? 1.25 : 1.15) * SC;
  // creek
  if (v.creek) { c.strokeStyle = tod === 'night' ? '#20344f' : '#5f8fb8'; c.lineWidth = 16 * SC; c.beginPath(); c.moveTo(-20, gy + H * .14); c.bezierCurveTo(W * .3, gy + H * .05, W * .55, gy + H * .25, W + 20, gy + H * .12); c.stroke(); }
  // structures
  const bx = W * (WIDE ? .68 : .62) - drift * .8, by = gy + H * .05;
  if (v.mission) church(c, bx, by, S0, ink);
  if (v.ranch) { cabin(c, bx, by, S0, ink, tod === 'dusk' || tod === 'night'); if (v.barn) barn(c, bx - 190 * S0, by + 4, S0, '#5a2018'); }
  if (v.plant) { plant(c, bx, by, S0, ink); }
  if (v.brewery) brewery(c, bx, by + 30 * S0, S0, t);
  if (v.club) club(c, bx - 60 * S0, by + 30 * S0, S0 * 1.2);
  if (v.house) house(c, bx - 40 * S0, by + 40 * S0, S0 * 1.25);
  if (v.fair) { ['#b03a2e', '#e8dcc0', '#2f5d8a', '#e8dcc0', '#b03a2e'].forEach((col, k) => tent(c, W * .18 + k * W * .14 - drift * .8, by + (k % 2) * 16 * S0, S0 * 1.3, col)); }
  if (v.flags) for (let k = 0; k < 4; k++) flag(c, W * .12 + k * W * .2 - drift * .8, by - 50 * S0, S0, t + k, [GOLD, '#b03a2e', '#2f5d8a', GOLD][k]);
  if (v.fences) { c.strokeStyle = ink; c.lineWidth = 3 * SC; const n = 16; for (let k = 0; k < n; k++) { const pk = clamp01(t * 1.2 - k * .08); if (pk <= 0) continue; const x = W * .02 + k * W / n - drift, y = gy + H * .03 + k * H * .012; c.fillStyle = ink; c.fillRect(x, y - 44 * S0, 6 * S0, 44 * S0); if (k) { c.beginPath(); c.moveTo(x - W / n, y - H * .012 - 34 * S0); c.lineTo(x, y - 34 * S0); c.moveTo(x - W / n, y - H * .012 - 18 * S0); c.lineTo(x, y - 18 * S0); c.stroke(); } } }
  if (v.farms) { for (let k = 0; k < 7; k++) { c.fillStyle = k % 2 ? 'rgba(90,60,30,.55)' : 'rgba(150,120,60,.45)'; const y0 = gy + 8 + k * 14 * SC; c.fillRect(W * .45 - drift * .5, y0, W * .55 * clamp01(t / 3), 10 * SC); } cabin(c, W * .3 - drift * .7, gy + H * .03, S0 * .6, ink, false); }
  if (v.train) { const x = W * 1.05 - (t / Math.max(1, dur)) * W * 1.5; c.fillStyle = '#3a2c1e'; c.fillRect(0, gy + H * .07, W, 5 * SC); train(c, x, gy + H * .07, S0 * .9, t, ink); }
  // animals
  const ny = gy + H * (WIDE ? .14 : .1);
  if (v.bison) { const a = 1 - clamp01((t - dur * .4) / (dur * .6)); c.save(); c.globalAlpha = a; for (let k = 0; k < 9; k++) bison(c, W * .1 + k * W * .09 - drift * .9, hz + H * .02 + (k % 3) * 4, .9 * S0 * (1 - k * .02), ink); c.restore(); }
  if (v.cattle) { const n = v.cattle, r = M.rng(41 + i); for (let k = 0; k < n; k++) { const depth = r(), y = ny + depth * H * .16, s = (.55 + depth * .9) * S0, sp = v.drive ? 70 + 30 * r() : 6 * r(), x = ((r() * W * 1.2 + t * sp * SC - drift) % (W * 1.25)) - W * .1; cow(c, x, y, s, t * (v.drive ? 9 : 2) + k, ink, 1); } if (v.drive) { for (let k = 0; k < 2; k++) rider(c, ((W * (.2 + k * .5) + t * 85 * SC) % (W * 1.2)) - W * .1, ny + (k ? H * .17 : -H * .01), S0 * .95, t * 9 + k, ink); } }
  if (v.horses) { const r = M.rng(73 + i); for (let k = 0; k < v.horses; k++) { const depth = r(), x = ((r() * W + t * (v.percheron ? 40 : 140) * SC) % (W * 1.25)) - W * .1; horse(c, x, ny + depth * H * .14, (.7 + depth * .8) * S0, t * (v.percheron ? 4 : 12) + k, ink, 1, !!v.percheron); } }
  if (v.sheep) { const r = M.rng(91 + i); for (let k = 0; k < v.sheep; k++) { const d = r(); sheep(c, r() * W * .9 + W * .05 - drift * .8 + Math.sin(t + k) * 4, ny + d * H * .14, (.7 + d * .8) * S0); } }
  // weather
  if (v.dust || v.drive) M.weather(c, 'dust', t, W, H, { count: 160 });
  if (v.snow) M.weather(c, 'snow', t, W, H, { count: v.blizzard ? 900 : 420, wind: v.blizzard ? 380 : 120, speed: v.blizzard ? 2.4 : 1.2 });
  if (v.blizzard) { c.fillStyle = 'rgba(230,236,242,.25)'; c.fillRect(0, 0, W, H); }
  if (v.embers) M.weather(c, 'embers', t, W, H, { count: 200 });
  if (tod === 'storm') M.weather(c, 'fog', t, W, H, { top: .3, amount: .45 });
}

// ---------- today's Calgary in 3D (geo pack) ----------
const FORT = M.geo.lm('Fort Calgary') || [1400, 150, 0];
const STEPHEN = M.geo.lm('Olympic Plaza') || M.geo.lm('Stephen Avenue') || [300, -80, 0];
function elbowPoint() { const pts = (M.geo.riverPath ? M.geo.riverPath('Elbow River', FORT, 2600) : []) || []; let best = null; pts.forEach(q => { const d = Math.hypot(q[0] - FORT[0], q[1] - FORT[1]); if (d > 700 && d < 1500 && (!best || q[0] > best[0])) best = q; }); return best ? [best[0] + 90, best[1], 0] : [FORT[0] + 150, FORT[1] - 900, 0]; }
let ELBOW = null;
function city(c, t, v, dur) {
  const tod = v.tod || 'dusk', night = tod === 'night', dusk = tod === 'dusk';
  const cols = night ? { land: '#121821', park: '#16221a', water: '#14304f', building: '#283140', road: '#454a54', motorway: '#6f6044' } : dusk ? { land: '#34363c', park: '#2c3a31', water: '#2c5378', building: '#596170', road: '#7d7466', motorway: '#b8904e' } : { land: '#c9c3b2', park: '#9fb27c', water: '#5d8fbf', building: '#d8d4cb', road: '#a59f92', motorway: '#c9a35b' };
  const w = M.world({ sky: night ? 'night' : (dusk || tod === 'dawn') ? 'dusk' : 'day', fog: { near: 1500, far: 9000 } });
  M.geo.addBase(w, { buildings: true, windows: night || dusk ? '#ffd27a' : '#fff', windowAlpha: night ? .6 : dusk ? .45 : .2, colors: cols });
  const p = M.seg(t, 0, dur, 'inOutSine'), d = M.drift(t, 5);
  let cam, target = FORT;
  if (v.shot === 'elbow') { if (!ELBOW) ELBOW = elbowPoint(); target = ELBOW; cam = { pos: M.mix([target[0] + 2200, target[1] - 2600, 900], [target[0] + 900, target[1] - 1300, 420], p), look: target }; }
  else if (v.shot === 'stephen') { target = STEPHEN; cam = M.moves.orbit(target, WIDE ? 900 : 700, 300, 220, 40, M.seg(t, 0, dur, 'linear')); }
  else { cam = { pos: M.mix([FORT[0] - 600, FORT[1] - 1600, 260], [FORT[0] - 900, FORT[1] - 2800, 1500], p), look: FORT }; }
  cam.pos = cam.pos.map((x, k) => x + d[k]); cam.fov = WIDE ? 44 : 60;
  if (v.pinElbow || v.shot === 'stephen') { M.pin(w, target, v.shot === 'stephen' ? 'Burns Building · 8 Ave SE' : 'East side of the Elbow', { p: M.seg(t, .6, 1.4, 'linear') }); M.ping(w, target, t); }
  w.render(c, M.camera(cam, W, H));
}

// ---------- regional schematic map (Natural Earth boundaries, approximate positions) ----------
const PLACES = EP.places;
const VIEWS = { region: [-115.9, -112.4, 49.0, 51.75], drive: [-116.2, -109.6, 47.3, 51.6], west: [-118.4, -111.8, 43.4, 51.6], west_wide: [-125.5, -95.5, 46.6, 54.6] };
function proj(view, focus, zoom) {
  const [lo0, lo1, la0, la1] = VIEWS[view], k = Math.cos(((la0 + la1) / 2) * Math.PI / 180);
  const mw = WIDE ? W : W - 120, mh = WIDE ? H * .66 : 560, top = WIDE ? H * .2 : 680;
  const sx = mw / ((lo1 - lo0) * k), sy = mh / (la1 - la0), s = Math.min(sx, sy) * zoom;
  const cx = focus ? focus[0] : (lo0 + lo1) / 2, cy = focus ? focus[1] : (la0 + la1) / 2;
  return ([lo, la]) => [(WIDE ? W / 2 : mw / 2 + 30) + (lo - cx) * k * s, top + mh / 2 - (la - cy) * s];
}
function regionMap(c, t, v, dur) {
  const fp = v.focus ? PLACES[v.focus] : null, zp = M.seg(t, 0, dur, 'inOutSine');
  const base = VIEWS[v.view]; const ctr = [(base[0] + base[1]) / 2, (base[2] + base[3]) / 2];
  const focus = fp ? [M.lerp(ctr[0], fp[0], zp * .6), M.lerp(ctr[1], fp[1], zp * .6)] : ctr;
  const pr = proj(v.view, focus, fp ? M.lerp(1, 1.35, zp) : M.lerp(1, 1.08, zp));
  c.fillStyle = '#0e1a2b'; c.fillRect(0, 0, W, H);
  c.save(); c.beginPath(); c.rect(0, WIDE ? H * .2 - 10 : 640, W, WIDE ? H : 600); c.clip();
  EP.geo.provinces.forEach(pv => pv.polys.forEach(poly => { c.beginPath(); poly.forEach((q, k) => { const [x, y] = pr(q); k ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath();
    c.fillStyle = pv.name === 'Alberta' ? '#2f3a2a' : pv.country === 'USA' ? '#1d2630' : '#232d26'; c.fill(); c.strokeStyle = 'rgba(242,182,50,.35)'; c.lineWidth = 2 * SC; c.stroke(); }));
  // Rocky Mountains band (schematic): hatch west of the front ranges
  c.save(); c.fillStyle = 'rgba(200,210,225,.18)'; EP.geo.rockies.forEach(q => { const [x, y] = pr(q); c.beginPath(); c.moveTo(x, y - 9 * SC); c.lineTo(x - 8 * SC, y + 6 * SC); c.lineTo(x + 8 * SC, y + 6 * SC); c.fill(); }); c.restore();
  // rivers
  c.strokeStyle = '#4f86b8'; c.lineCap = c.lineJoin = 'round';
  EP.geo.rivers.forEach(r => r.lines.forEach(l => { c.lineWidth = (r.main ? 4 : 2.5) * SC; c.beginPath(); l.forEach((q, k) => { const [x, y] = pr(q); k ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); }));
  // 49th parallel label
  const [bx, byy] = pr([VIEWS[v.view][0] + .3, 49.0]); if (byy > 0 && byy < H) { M.text(c, 'CANADA', bx + 8, byy - 40 * SC, { size: 26 * SC, weight: 700, color: '#dfe7f2', alpha: .6 }); M.text(c, 'UNITED STATES', bx + 8, byy + 12 * SC, { size: 26 * SC, weight: 700, color: '#dfe7f2', alpha: .5 }); c.strokeStyle = 'rgba(255,255,255,.35)'; c.setLineDash([8, 8]); c.lineWidth = 2; c.beginPath(); c.moveTo(0, byy); c.lineTo(W, byy); c.stroke(); c.setLineDash([]); }
  // route with moving herd dots
  if (v.route) { const A = pr(PLACES[v.route[0]]), B = pr(PLACES[v.route[1]]), rp = M.seg(t, .4, dur * .7, 'inOutCubic'); const mid = [(A[0] + B[0]) / 2 + (B[1] - A[1]) * .12, (A[1] + B[1]) / 2 - (B[0] - A[0]) * .12];
    const pt = u => [(1 - u) ** 2 * A[0] + 2 * (1 - u) * u * mid[0] + u * u * B[0], (1 - u) ** 2 * A[1] + 2 * (1 - u) * u * mid[1] + u * u * B[1]];
    c.strokeStyle = GOLD; c.lineWidth = 6 * SC; c.setLineDash([16 * SC, 12 * SC]); c.beginPath(); for (let u = 0; u <= rp + 1e-6; u += .02) { const q = pt(Math.min(u, rp)); u ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } c.stroke(); c.setLineDash([]);
    if (v.herd) for (let k = 0; k < 26; k++) { const u = rp - k * .018; if (u <= 0) continue; const q = pt(u); c.fillStyle = 'rgba(30,20,12,.95)'; c.strokeStyle = CREAM; c.lineWidth = 1.5; c.beginPath(); c.arc(q[0] + Math.sin(k * 3) * 6 * SC, q[1] + Math.cos(k * 2) * 6 * SC, 6 * SC, 0, 7); c.fill(); c.stroke(); } }
  if (v.rail) { const A = pr([-110.0, 50.0]), B = pr(PLACES.calgary), rp = M.seg(t, .2, dur * .7, 'inOutCubic'); c.strokeStyle = '#e8dcc0'; c.lineWidth = 6 * SC; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(M.lerp(A[0], B[0], rp), M.lerp(A[1], B[1], rp)); c.stroke(); c.lineWidth = 2 * SC; for (let u = 0; u < rp; u += .02) { const x = M.lerp(A[0], B[0], u), y = M.lerp(A[1], B[1], u); c.beginPath(); c.moveTo(x, y - 9 * SC); c.lineTo(x, y + 9 * SC); c.stroke(); } }
  if (v.spokes || v.spokesFrom) { const hub = pr(PLACES[v.spokesFrom || 'calgary']); (v.pins || []).filter(n => n !== (v.spokesFrom || 'calgary')).forEach((n, k) => { const q = pr(PLACES[n]), sp = M.seg(t, .5 + k * .35, 1.4 + k * .35, 'outCubic'); c.strokeStyle = 'rgba(242,182,50,.8)'; c.lineWidth = 4 * SC; c.beginPath(); c.moveTo(hub[0], hub[1]); c.lineTo(M.lerp(hub[0], q[0], sp), M.lerp(hub[1], q[1], sp)); c.stroke(); }); }
  // pins
  (v.pins || []).forEach((n, k) => { const q = pr(PLACES[n]), a = M.seg(t, .15 + k * .25, .5 + k * .25, 'outBack'); if (a <= 0) return; const r = (n === v.focus ? 16 : 11) * SC * a;
    c.fillStyle = n === v.focus || n === 'calgary' ? GOLD : CREAM; c.strokeStyle = NAVY; c.lineWidth = 3; c.beginPath(); c.arc(q[0], q[1], r, 0, 7); c.fill(); c.stroke();
    if (n === v.focus) { const pk = fr(t * .8); c.strokeStyle = `rgba(242,182,50,${1 - pk})`; c.lineWidth = 3; c.beginPath(); c.arc(q[0], q[1], r + pk * 50 * SC, 0, 7); c.stroke(); }
    const lab = EP.placeLabels[n] || n; const right = q[0] < W * .6;
    M.text(c, lab, q[0] + (right ? 22 : -22) * SC, q[1], { size: (WIDE ? 34 : 40) * SC, weight: 700, base: 'middle', align: right ? 'left' : 'right', color: '#fff', stroke: 6, strokeColor: '#06101f', alpha: a }); });
  c.restore();
  // north arrow + credit
  const nx = WIDE ? W - 90 : W - 190, ny = WIDE ? 150 : 700; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(nx, ny - 30 * SC); c.lineTo(nx - 14 * SC, ny + 8 * SC); c.lineTo(nx + 14 * SC, ny + 8 * SC); c.fill(); M.text(c, 'N', nx, ny + 14 * SC, { size: 26 * SC, weight: 800, align: 'center', color: '#fff' });
}

// ---------- overlays ----------
function backing(c, x, y, w, h, a = .62) { M.rr(c, x, y, w, h, 18 * SC); c.fillStyle = `rgba(6,14,28,${a})`; c.fill(); }
function lower(c, t, v, atTop) {
  if (!v.lower) return; const a = M.seg(t, .25, .7, 'outCubic'); if (a <= 0) return;
  if (WIDE) { const g = c.createLinearGradient(0, atTop ? 0 : H * .45, 0, atTop ? H * .4 : H); g.addColorStop(atTop ? 1 : 0, 'rgba(6,14,28,0)'); g.addColorStop(atTop ? 0 : 1, `rgba(6,14,28,${.75 * a})`); c.fillStyle = g; c.fillRect(0, atTop ? 0 : H * .45, W, H * .55); }
  else { const g = c.createLinearGradient(0, 250, 0, 760); g.addColorStop(0, `rgba(6,14,28,${.7 * a})`); g.addColorStop(1, 'rgba(6,14,28,0)'); c.fillStyle = g; c.fillRect(0, 250, W, 510); }
  const size = (WIDE ? 84 : 110) * SC, sub = (WIDE ? 40 : 52) * SC, x = WIDE ? 90 : 60, maxW = WIDE ? 1100 : 860;
  c.save(); c.globalAlpha = a; c.font = M.font(size, 800);
  const y = WIDE ? (atTop ? 150 : H - 360) : 330 + (1 - a) * 30;
  const m = M.text(c, v.lower, x, WIDE ? y + (1 - a) * 30 : y, { size, weight: 800, maxW, color: '#fff', shadow: 18 });
  if (v.sub) M.text(c, v.sub, x, (WIDE ? y + (1 - a) * 30 : y) + m.h + 10, { size: sub, weight: 600, maxW, color: GOLD, shadow: 12 });
  c.fillStyle = GOLD; c.fillRect(x, (WIDE ? y + (1 - a) * 30 : y) - 18 * SC, 120 * SC * a, 8 * SC);
  c.restore();
}
function chipTop(c, t, v) {
  if (!v.chip || v.kind === 'hook' || v.kind === 'stats') return; const a = M.seg(t, .35, .6, 'outBack'); if (a <= 0) return;
  const interp = v.chip === 'INTERPRETATION';
  M.chip(c, interp ? 'INTERPRETATION' : v.chip, WIDE ? W - 90 : W - 150, WIDE ? 120 : 1160, { align: 'right', size: (WIDE ? 40 : 48) * SC * (interp ? .8 : 1), bg: interp ? '#9fb0c8' : GOLD, color: NAVY, alpha: a });
}
function bigNum(c, t, v, y) {
  if (!v.big || typeof v.big !== 'string') return; const a = M.seg(t, .6, .9, 'outBack'); if (a <= 0) return;
  let size = (WIDE ? 170 : 190) * SC; c.save(); c.font = M.font(size, 800); const tw = c.measureText(v.big).width, lim = (WIDE ? 1040 : 800) * SC; if (tw > lim) size *= lim / tw; c.globalAlpha = Math.min(1, a);
  const yy = y ?? (WIDE ? H * .3 : 760); backing(c, CX - (WIDE ? 560 : 440) * SC, yy - 30 * SC, (WIDE ? 1120 : 880) * SC, size * 1.05 + 110 * SC, .5);
  c.translate(CX, yy + size / 2); const s = M.lerp(1.5, 1, Math.min(1, a)); c.scale(s, s); c.translate(-CX, -(yy + size / 2));
  M.text(c, v.big, CX, yy, { size, weight: 800, align: 'center', color: '#fff', shadow: 20 });
  M.text(c, v.bigLabel || '', CX, yy + size * 1.02, { size: (WIDE ? 44 : 52) * SC, weight: 700, align: 'center', color: GOLD, maxW: (WIDE ? 1000 : 820) * SC });
  c.restore();
}
function srcLine(c, s) { if (!s) return; M.source(c, s, WIDE ? 60 : 50, WIDE ? H - 40 * SC - 20 : 1450, { size: (WIDE ? 22 : 24) * SC, maxW: WIDE ? 1200 : 860 }); }

function docCard(c, t, v) {
  const a = M.seg(t, 0, .5, 'outCubic'), w = WIDE ? 1200 : 860, x = WIDE ? (W - w) / 2 : 50, qs = (v.size ? (WIDE ? 60 : 64) : (WIDE ? 66 : 72)) * SC;
  c.save(); c.font = M.font(qs, 700); const words = v.quote.split(/\s+/), lines = []; let cur = '';
  words.forEach(wd => { const tt = cur ? cur + ' ' + wd : wd; if (c.measureText(tt).width > w - 110 && cur) { lines.push(cur); cur = wd; } else cur = tt; }); if (cur) lines.push(cur);
  const lh = qs * 1.25, h = 170 * SC + lines.length * lh + 90 * SC, y = (WIDE ? (H - h) / 2 - 40 : 330 + Math.max(0, (900 - h) / 2)) + (1 - a) * 60;
  c.globalAlpha = a; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 40; M.rr(c, x, y, w, h, 18); c.fillStyle = '#f7f1e3'; c.fill(); c.shadowBlur = 0;
  c.fillStyle = '#c9bfa8'; for (let k = 0; k < 3; k++) c.fillRect(x + 55, y + 110 * SC + k * 18 * SC, (w - 110) * (k === 2 ? .5 : .9), 7 * SC);
  M.text(c, v.title, x + 55, y + 40 * SC, { size: (WIDE ? 32 : 34) * SC, weight: 700, color: '#1b2533', shadow: false, maxW: w - 110 });
  const total = words.length; let wi = 0;
  lines.forEach((ln, li) => { let xx = x + 55; const yy = y + 170 * SC + li * lh; ln.split(' ').forEach(wd => { const ww = c.measureText(wd + ' ').width, on = M.seg(t, .6 + wi / total * 1.4, .6 + (wi + 1) / total * 1.4, 'linear'); c.fillStyle = 'rgba(242,182,50,.85)'; if (on > 0) c.fillRect(xx - 4, yy - 4, (ww - 8) * on + 8, qs * 1.12); c.fillStyle = '#111a26'; c.textBaseline = 'top'; c.font = M.font(qs, 700); c.fillText(wd, xx, yy); xx += ww; wi++; }); });
  M.text(c, v.src, x + 55, y + h - 60 * SC, { size: 26 * SC, weight: 500, color: '#5b6573', shadow: false, maxW: w - 110 });
  c.restore();
}
function stats(c, t, v, dur) {
  const n = v.items.length, top = WIDE ? H * .2 : 380, gapY = (WIDE ? 300 : 360) * SC * (n > 2 ? .82 : 1);
  if (v.chip) M.chip(c, v.chip, CX, top - 90 * SC, { align: 'center', size: (WIDE ? 40 : 48) * SC });
  v.items.forEach(([val, lab], k) => { const a = M.seg(t, .3 + k * .7, .7 + k * .7, 'outBack'); if (a <= 0) return; const y = top + k * gapY, size = (WIDE ? (n > 2 ? 130 : 160) : (n > 2 ? 150 : 180)) * SC;
    c.save(); c.globalAlpha = Math.min(1, a); backing(c, CX - (WIDE ? 620 : 440) * SC, y - 20 * SC, (WIDE ? 1240 : 880) * SC, size + 90 * SC, .55);
    // counters roll only for plain integers; ranges, approximations and dates are shown as written
    const plain = /^\$?[\d,]+\+?$/.test(val) && !/~/.test(val), num = plain ? +val.replace(/[^\d]/g, '') : 0, pfx = val.startsWith('$') ? '$' : '', sfx = val.endsWith('+') ? '+' : '';
    const roll = M.seg(t, .3 + k * .7, 1.5 + k * .7, 'outExpo'), shown = plain ? (roll >= 1 ? val : pfx + Math.round(num * roll).toLocaleString('en-CA') + sfx) : val;
    M.text(c, shown, CX, y, { size, weight: 800, align: 'center', color: '#fff' });
    M.text(c, lab, CX, y + size * 1.0, { size: (WIDE ? 42 : 50) * SC, weight: 700, align: 'center', color: GOLD, maxW: (WIDE ? 1100 : 840) * SC }); c.restore(); });
  if (v.stamp) brandMark(c, WIDE ? W - 260 : CX, WIDE ? H * .62 : 1180, (WIDE ? 1 : .8) * SC, 'BARU', M.seg(t, 1, 1.4, 'outBack'), '#f2b632');
}
function brandMark(c, x, y, s, b, p, col) { if (p <= 0) return; c.save(); c.translate(x, y); c.scale(s * Math.min(1.2, p), s * Math.min(1.2, p)); c.strokeStyle = col; c.lineWidth = 26; c.lineCap = 'round'; c.lineJoin = 'round';
  if (b === 'BARU') { c.beginPath(); c.moveTo(-90, -130); c.lineTo(90, -130); c.stroke(); c.beginPath(); c.moveTo(-80, -80); c.lineTo(-80, 20); c.quadraticCurveTo(-80, 100, 0, 100); c.quadraticCurveTo(80, 100, 80, 20); c.lineTo(80, -80); c.stroke(); }
  else { c.font = M.font(260, 900); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 14; c.strokeText('A7', 0, 0); c.fillStyle = col; c.globalAlpha = .9; c.fillText('A7', 0, 0); }
  c.restore(); }
function brandScene(c, t, v, dur) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4a2f1b'); g.addColorStop(1, '#2a1a0e'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const r = M.rng(3); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; for (let k = 0; k < 40; k++) { const y = r() * H; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(W * .3, y + 20 * r(), W * .6, y - 20 * r(), W, y + 10); c.stroke(); }
  const cy = WIDE ? H * .45 : 760, press = M.seg(t, .6, 1.1, 'inOutCubic'), glow = Math.max(0, 1 - M.seg(t, 1.3, dur, 'linear'));
  const ix = CX + (1 - press) * W * .5, iy = cy - (1 - press) * H * .2; // the iron slides in and presses
  brandMark(c, CX, cy, (WIDE ? 1 : 1.1) * SC, v.brand, press >= 1 ? 1 : 0, `rgb(${Math.round(60 + 195 * glow)},${Math.round(25 + 120 * glow)},${Math.round(10 + 30 * glow)})`);
  if (press < 1 || t < 1.3) { c.save(); c.globalAlpha = 1 - M.seg(t, 1.1, 1.5); brandMark(c, ix, iy, (WIDE ? 1 : 1.1) * SC, v.brand, 1, '#3b3b3b'); c.fillStyle = '#3b3b3b'; c.fillRect(ix + 100 * SC, iy - 20 * SC, W, 22 * SC); c.restore(); }
  if (press >= 1) for (let k = 0; k < 14; k++) { const u = ((((t - 1.1) * .4 + k / 14) % 1) + 1) % 1; c.fillStyle = `rgba(220,220,220,${.12 * (1 - u)})`; c.beginPath(); c.arc(CX + Math.sin(k * 2 + t) * 120 * SC, cy - u * 420 * SC, (20 + u * 60) * SC, 0, 7); c.fill(); }
  const a = M.seg(t, 1.2, 1.7, 'outCubic'); c.save(); c.globalAlpha = a; const ty = WIDE ? H * .64 : 1000;
  M.text(c, v.label, CX, ty, { size: (WIDE ? 96 : 110) * SC, weight: 800, align: 'center', color: '#fff', maxW: WIDE ? 1500 : 860 }); M.text(c, v.sub, CX, ty + (WIDE ? 112 : 130) * SC, { size: (WIDE ? 40 : 46) * SC, weight: 600, align: 'center', color: GOLD, maxW: WIDE ? 1500 : 860 }); c.restore();
}
function nameScene(c, t, v, dur, i) {
  if (v.bg === 'city') city(c, t, { shot: v.shot, tod: v.tod }, dur); else landscape(c, t, { tod: v.tod || 'day' }, dur, i);
  c.fillStyle = 'rgba(6,14,28,.35)'; c.fillRect(0, 0, W, H);
  const hat = /Burns/.test(v.name) ? 'bowler' : /Cochrane/.test(v.name) ? 'top' : 'stetson';
  const sx = WIDE ? W * .72 : CX, sy = WIDE ? H * .92 : 1240, rise = M.seg(t, 0, .8, 'outCubic');
  silhouette(c, sx, sy + (1 - rise) * 60, (WIDE ? 2.2 : 2.4) * SC, 'rgba(8,10,14,.92)', hat);
  const a = M.seg(t, .3, .8, 'outCubic'); c.save(); c.globalAlpha = a; const x = WIDE ? 100 : 60, y = WIDE ? H * .38 : 330;
  const m = M.text(c, v.name, x, y, { size: (WIDE ? 104 : 110) * SC, weight: 800, maxW: WIDE ? 1000 : 860, color: '#fff', shadow: 18 });
  const rm = M.text(c, v.role, x, y + m.h + 14, { size: (WIDE ? 44 : 52) * SC, weight: 600, maxW: WIDE ? 1000 : 860, color: GOLD });
  if (v.sub2) M.text(c, v.sub2, x, y + m.h + 14 + rm.h + 12 * SC, { size: (WIDE ? 36 : 44) * SC, weight: 500, maxW: WIDE ? 1000 : 860, color: '#dfe7f2' });
  c.fillStyle = GOLD; c.fillRect(x, y - 22 * SC, 140 * SC * a, 8 * SC); c.restore();
  M.text(c, 'Silhouette for illustration', WIDE ? W - 60 : W - 140, WIDE ? 120 : 300, { size: 22 * SC, weight: 500, align: 'right', color: '#dfe7f2', alpha: .7, shadow: false });
}
function timelineScene(c, t, v, dur, i) {
  landscape(c, t, { tod: 'dusk' }, dur, i); c.fillStyle = 'rgba(6,14,28,.7)'; c.fillRect(0, 0, W, H);
  const ev = v.events, from = v.from_, to = v.to, x0 = WIDE ? 160 : 90, x1 = WIDE ? W - 160 : W - 170, y = WIDE ? H * .55 : 900, p = M.seg(t, .2, dur - .6, 'inOutSine'), head = M.lerp(from, to, p);
  const X = yr => M.lerp(x0, x1, (yr - from) / (to - from));
  c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
  c.strokeStyle = GOLD; c.beginPath(); c.moveTo(x0, y); c.lineTo(X(head), y); c.stroke();
  ev.forEach((e, k) => { const on = head >= e[0], xx = X(e[0]), up = k % 2 === 0, a = on ? 1 : .35; c.globalAlpha = a; c.fillStyle = on ? GOLD : '#9fb0c8'; c.beginPath(); c.arc(xx, y, on ? 16 : 10, 0, 7); c.fill();
    const ty = up ? y - (WIDE ? 150 : 210) - (WIDE ? 0 : (k % 4 === 0 ? 0 : 0)) : y + 40; const yrS = e[2] || String(e[0]);
    if (!WIDE && ev.length > 3) { const yy = up ? y - 120 - (k % 4 === 0 ? 0 : 150) : y + 40 + (k % 4 === 1 ? 0 : 150); M.text(c, yrS, xx, yy, { size: 52, weight: 800, align: 'center', color: '#fff' }); M.text(c, e[1], xx, yy + 60, { size: 34, weight: 600, align: 'center', color: '#dfe7f2', maxW: 240 }); }
    else { M.text(c, yrS, xx, ty, { size: (WIDE ? 56 : 72) * SC, weight: 800, align: 'center', color: '#fff' }); M.text(c, e[1], xx, ty + (WIDE ? 66 : 84) * SC, { size: (WIDE ? 34 : 44) * SC, weight: 600, align: 'center', color: '#dfe7f2', maxW: (WIDE ? 300 : 420) * SC }); }
    c.globalAlpha = 1; });
  if (v.kind === 'timeline' && ev.length <= 2) { // the buffalo beat: silhouettes fade as the head passes 1879-80
    for (let k = 0; k < 7; k++) { c.save(); c.globalAlpha = .85 * (1 - M.seg(head, 1878.5 + k * .2, 1880.2, 'linear')); bison(c, (WIDE ? W * .25 : 140) + k * (WIDE ? 170 : 115), y - (WIDE ? 300 : 420), (WIDE ? 1.6 : 1.3) * SC, '#c9a65a'); c.restore(); } }
  srcLine(c, v.src);
}
function exportScene(c, t, v, dur) {
  c.fillStyle = '#0e1a2b'; c.fillRect(0, 0, W, H);
  const L0 = WIDE ? [300, H * .45] : [180, 560], R0 = WIDE ? [1500, H * .32] : [800, 380];
  M.text(c, 'CALGARY', L0[0], L0[1] + 40 * SC, { size: (WIDE ? 44 : 46) * SC, weight: 800, align: 'center', color: GOLD });
  c.fillStyle = GOLD; c.beginPath(); c.arc(L0[0], L0[1], 14 * SC, 0, 7); c.fill();
  M.text(c, 'ATLANTIC', (L0[0] + R0[0]) / 2, (L0[1] + R0[1]) / 2 + (WIDE ? 120 : 140) * SC, { size: 30 * SC, weight: 700, align: 'center', color: '#9fb0c8', alpha: .6 });
  v.ports.forEach((pn, k) => { const tgt = [R0[0] + (k - 1) * (WIDE ? 60 : 40), R0[1] + (k - 1) * (WIDE ? 90 : 110)], pp = M.seg(t, .3 + k * .4, 2.2 + k * .4, 'inOutCubic'), mid = [(L0[0] + tgt[0]) / 2, Math.min(L0[1], tgt[1]) - 260 * SC];
    c.strokeStyle = GOLD; c.lineWidth = 5 * SC; c.setLineDash([12, 10]); c.beginPath(); for (let u = 0; u <= pp + 1e-6; u += .02) { const uu = Math.min(u, pp), x = (1 - uu) ** 2 * L0[0] + 2 * (1 - uu) * uu * mid[0] + uu * uu * tgt[0], y = (1 - uu) ** 2 * L0[1] + 2 * (1 - uu) * uu * mid[1] + uu * uu * tgt[1]; u ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.setLineDash([]);
    if (pp > .95) { c.fillStyle = CREAM; c.beginPath(); c.arc(tgt[0], tgt[1], 10 * SC, 0, 7); c.fill(); M.text(c, pn, tgt[0] + 20 * SC, tgt[1], { size: (WIDE ? 40 : 44) * SC, weight: 700, base: 'middle', color: '#fff' }); } });
  // balance scale: cattle outweighs wheat (until about 1900)
  const bx = CX, by = WIDE ? H * .6 : 960, tilt = M.seg(t, 2.2, 3.4, 'outBack') * .22, arm = (WIDE ? 380 : 330) * SC;
  c.strokeStyle = CREAM; c.lineWidth = 8 * SC; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx, by + 160 * SC); c.stroke(); c.beginPath(); c.moveTo(bx - 80 * SC, by + 160 * SC); c.lineTo(bx + 80 * SC, by + 160 * SC); c.stroke();
  const lx = bx - Math.cos(tilt) * arm, ly = by + Math.sin(tilt) * arm, rx = bx + Math.cos(tilt) * arm, ry = by - Math.sin(tilt) * arm;
  c.beginPath(); c.moveTo(lx, ly); c.lineTo(rx, ry); c.stroke();
  [[lx, ly, v.compare[0]], [rx, ry, v.compare[1]]].forEach(([x, y, lab], k) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x - 70 * SC, y + 70 * SC); c.lineTo(x + 70 * SC, y + 70 * SC); c.closePath(); c.stroke(); c.fillStyle = k ? '#d9b45a' : '#3a2a1c'; c.fillRect(x - 80 * SC, y + 70 * SC, 160 * SC, 14 * SC); if (!k) cow(c, x, y + 66 * SC, .9 * SC, 0, '#120c08'); M.text(c, lab.toUpperCase(), x, y + 100 * SC, { size: (WIDE ? 40 : 44) * SC, weight: 800, align: 'center', color: k ? '#d9b45a' : '#fff' }); });
  M.text(c, 'until the turn of the 20th century', bx, by - 120 * SC, { size: (WIDE ? 36 : 40) * SC, weight: 600, align: 'center', color: GOLD, alpha: M.seg(t, 3, 3.6) });
  srcLine(c, v.src);
}
function bigFour(c, t, v, dur, i) {
  landscape(c, t, { tod: 'dusk' }, dur, i); c.fillStyle = 'rgba(6,14,28,.45)'; c.fillRect(0, 0, W, H);
  const hats = ['bowler', 'stetson', 'stetson', 'stetson'];
  v.names.forEach((n, k) => { const a = M.seg(t, .4 + k * .6, 1 + k * .6, 'outCubic'); if (a <= 0) return; const x = WIDE ? W * (.2 + k * .2) : (k % 2 ? 690 : 250), y = WIDE ? H * .78 : (k < 2 ? 820 : 1180);
    c.save(); c.globalAlpha = a; silhouette(c, x, y + (1 - a) * 40, (WIDE ? 1.2 : 1.05) * SC, 'rgba(8,10,14,.95)', hats[k]); M.text(c, n, x, y + 20 * SC, { size: (WIDE ? 40 : 44) * SC, weight: 800, align: 'center', color: '#fff', maxW: WIDE ? 360 : 400 }); c.restore(); });
  const s = M.seg(t, 3.2, 3.6, 'outBack'); if (s > 0) { c.save(); const y = WIDE ? H * .2 : 330; c.translate(CX, y + 90 * SC); c.rotate(-.05); c.scale(M.lerp(1.8, 1, Math.min(1, s)), M.lerp(1.8, 1, Math.min(1, s))); c.globalAlpha = Math.min(1, s);
    M.rr(c, -(WIDE ? 470 : 420) * SC, -100 * SC, (WIDE ? 940 : 840) * SC, 230 * SC, 20); c.fillStyle = 'rgba(6,14,28,.75)'; c.fill(); c.strokeStyle = GOLD; c.lineWidth = 8; c.stroke();
    M.text(c, v.big, 0, -88 * SC, { size: (WIDE ? 150 : 160) * SC, weight: 800, align: 'center', color: '#fff' }); M.text(c, v.bigLabel, 0, 74 * SC, { size: (WIDE ? 40 : 44) * SC, weight: 700, align: 'center', color: GOLD }); c.restore(); }
  srcLine(c, v.src);
}
function coin(c, x, y, r, t) { const sq = Math.abs(Math.cos(t * 3.2)); c.save(); c.translate(x, y); c.scale(Math.max(.08, sq), 1); const g = c.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r); g.addColorStop(0, '#f0b27a'); g.addColorStop(.6, COPPER); g.addColorStop(1, '#7a3f1c'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.strokeStyle = '#5e2f14'; c.lineWidth = r * .07; c.beginPath(); c.arc(0, 0, r * .82, 0, 7); c.stroke(); if (sq > .35) M.text(c, '1¢', 0, -r * .42, { size: r * .8, weight: 900, align: 'center', color: '#5e2f14', shadow: false }); c.restore(); }
function hookScene(c, t, v, dur, i, n) {
  if (v.bg === 'city') city(c, t, { shot: v.shot, tod: v.tod }, dur); else landscape(c, t + 2, v, dur, i);
  // fast first seconds: push-in on the picture (frame 0 already moving)
  const hz = M.seg(t, 0, 2.2, 'outCubic');
  if (THUMB || n === 0) { /* keep */ }
  c.fillStyle = v.tod === 'storm' ? 'rgba(6,14,28,.42)' : 'rgba(6,14,28,.18)'; c.fillRect(0, 0, W, H);
  if (/penny/i.test(v.hook)) { const fall = THUMB ? 1 : M.seg(t, 0, .9, 'outBack'); coin(c, WIDE ? W * .78 : CX + 200 * SC, M.lerp(-200, WIDE ? H * .62 : 1060, fall), (WIDE ? 150 : 170) * SC, THUMB ? 0 : t); }
  const hs = (THUMB === 'wide' ? 104 / SC : WIDE ? 120 : 132) * SC;
  M.kinetic(c, v.hook, THUMB ? 9 : t, CX, WIDE ? H * .2 : 400, { t0: -.12, size: hs, maxW: (WIDE ? 1500 : 860) * SC, every: .14, highlight: v.hi || [], lh: 1.04 });
  if (v.chip && t > (THUMB ? 0 : 1.1)) M.chip(c, v.chip, CX, WIDE ? H * .2 - 100 * SC : 300, { align: 'center', size: (WIDE ? 40 : 48) * SC, alpha: THUMB ? 1 : M.seg(t, 1.1, 1.4) });
}
function chapterCard(c, t, v, dur, i) {
  landscape(c, t, v, dur, i); c.fillStyle = 'rgba(6,14,28,.35)'; c.fillRect(0, 0, W, H);
  const a = M.seg(t, .2, .8, 'outCubic'), y = WIDE ? H * .3 : 560; c.save(); c.globalAlpha = a;
  M.text(c, 'CALGARY ORIGINS · EPISODE 2', CX, y, { size: (WIDE ? 40 : 46) * SC, weight: 700, align: 'center', color: GOLD, tracking: .14 });
  M.text(c, 'The ranch era', CX, y + 70 * SC, { size: (WIDE ? 140 : 130) * SC, weight: 800, align: 'center', color: '#fff', maxW: WIDE ? 1600 : 860 });
  M.chip(c, `PART 1 OF 4 · ${CH_TITLES[1].toUpperCase()}`, CX, y + (WIDE ? 250 : 380) * SC, { align: 'center', size: (WIDE ? 36 : 40) * SC }); c.restore();
}
function questionScene(c, t, v, dur, i) {
  landscape(c, t, { tod: v.tod || 'dusk' }, dur, i); c.fillStyle = 'rgba(6,14,28,.6)'; c.fillRect(0, 0, W, H);
  const y = WIDE ? H * .26 : 520; M.kinetic(c, v.q, t, CX, y, { t0: 0, size: (WIDE ? 104 : 110) * SC, maxW: (WIDE ? 1500 : 860) * SC, every: .08, highlight: v.hi || [] });
  if (v.sub) M.text(c, v.sub, CX, y - 90 * SC, { size: (WIDE ? 40 : 44) * SC, weight: 600, align: 'center', color: '#dfe7f2', maxW: WIDE ? 1500 : 860, alpha: M.seg(t, .2, .6) });
  M.text(c, 'Drop your thoughts below 👇', CX, WIDE ? H * .66 : 1050, { size: (WIDE ? 56 : 60) * SC, weight: 700, align: 'center', color: GOLD, alpha: M.seg(t, .6, 1) });
  M.text(c, 'calgaryinsight.ca', CX, WIDE ? H * .76 : 1150, { size: (WIDE ? 40 : 44) * SC, weight: 600, align: 'center', color: '#fff', alpha: M.seg(t, .8, 1.2) });
}
function endCard(c, t, dur) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#06101f'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  drawRidge(c, R1, H, H * .18, t * 8, 'rgba(242,182,50,.10)', null);
  const top = WIDE ? H * .12 : 360, step = WIDE ? 150 : 190;
  if (PART && PART < 4) { M.chip(c, `PART ${PART + 1} OF 4 IS NEXT: ${CH_TITLES[PART + 1].toUpperCase()}`, CX, top - (WIDE ? 20 : 40), { align: 'center', size: (WIDE ? 36 : 40) * SC, alpha: M.seg(t, .1, .4) }); }
  M.text(c, '💬 Comment below', CX, top + step * .6, { size: (WIDE ? 84 : 92) * SC, weight: 800, align: 'center', color: '#fff', alpha: M.seg(t, .2, .6) });
  // subscribe button with a bell that gets tapped
  const by = top + step * 1.6, bw = (WIDE ? 520 : 560) * SC, bh = (WIDE ? 110 : 120) * SC, tap = M.seg(t, 1.6, 1.9, 'outBack'), done = t > 1.9;
  c.save(); c.globalAlpha = M.seg(t, .6, 1); M.rr(c, CX - bw / 2, by, bw, bh, bh / 2); c.fillStyle = done ? '#606060' : '#e62117'; c.fill();
  M.text(c, done ? 'SUBSCRIBED' : 'SUBSCRIBE', CX - 30 * SC, by + bh / 2, { size: (WIDE ? 52 : 56) * SC, weight: 800, base: 'middle', align: 'center', color: '#fff', shadow: false });
  M.text(c, '🔔', CX + bw / 2 - 70 * SC, by + bh / 2, { size: (WIDE ? 52 : 56) * SC, base: 'middle', align: 'center', shadow: false });
  if (t > 1.2 && t < 2.4) { const hx = M.lerp(CX + bw, CX + 40 * SC, M.seg(t, 1.2, 1.6, 'outCubic')), hy = by + bh * .8; c.fillStyle = '#fff'; c.beginPath(); c.arc(hx, hy, 26 * SC * (1 - .2 * tap), 0, 7); c.fill(); }
  c.restore();
  M.text(c, 'Follow @calgaryinsight', CX, by + bh + 40 * SC, { size: (WIDE ? 52 : 58) * SC, weight: 700, align: 'center', color: GOLD, alpha: M.seg(t, .9, 1.3) });
  M.text(c, 'More at calgaryinsight.ca', CX, by + bh + (WIDE ? 130 : 150) * SC, { size: (WIDE ? 56 : 62) * SC, weight: 700, align: 'center', color: '#fff', alpha: M.seg(t, 1.1, 1.5) });
}

// ---------- assemble scenes ----------
const TRANS = ['dissolve', 'match', 'dissolve', 'whip'];
const scenes = sc.map((s, k) => {
  const isEnd = k === sc.length - 1, l = isEnd ? null : LINES[k], v = l ? l.v : {};
  const prevCh = k > 0 && LINES[k - 1] ? LINES[k - 1].ch : null, chStart = l && l.ch !== prevCh;
  let trans = { kind: 'dissolve', dur: .7 };
  const nx = LINES[k + 1];
  if (v.blizzard || (nx && nx.v.kind === 'stats' && /LOST/.test(JSON.stringify(nx.v)))) trans = { kind: 'flash', dur: .5 };
  else if (nx && nx.v.kind === 'map' && v.kind !== 'map') trans = { kind: 'match', dur: .8 };
  else if (nx && nx.ch !== (l && l.ch)) trans = { kind: 'dissolve', dur: 1.0 };
  else if (nx && (nx.v.kind === 'brand' || nx.v.kind === 'stats')) trans = { kind: 'whip', dur: .45 };
  return { dur: s.sceneDur, trans: isEnd ? null : trans, draw: (c, t, info) => {
    if (isEnd) return endCard(c, t, s.sceneDur);
    const d = s.sceneDur;
    switch (v.kind) {
      case 'hook': hookScene(c, t, v, d, k, k); break;
      case 'city': city(c, t, v, d); lower(c, t, v); break;
      case 'chapter': chapterCard(c, t, v, d, k); break;
      case 'land': landscape(c, t, v, d, k); lower(c, t, v); if (v.big && typeof v.big === 'string') bigNum(c, t, v); break;
      case 'timeline': timelineScene(c, t, v, d, k); break;
      case 'doc': landscape(c, t, { tod: 'night' }, d, k); c.fillStyle = 'rgba(6,14,28,.55)'; c.fillRect(0, 0, W, H); docCard(c, t, v); break;
      case 'map': regionMap(c, t, v, d); if (WIDE || !v.big || t < d * .55) lower(c, t, v, true); if (v.big && t > d * .55) bigNum(c, t - d * .55 + .6, v, WIDE ? H * .5 : 300); M.source(c, MAPCREDIT, WIDE ? 60 : 50, WIDE ? H - 60 : 1450, { size: (WIDE ? 20 : 22) * SC, maxW: WIDE ? 1200 : 860 }); break;
      case 'stats': landscape(c, t, { tod: v.bg === 'autumn' ? 'autumn' : 'dusk', cattle: 8 }, d, k); c.fillStyle = 'rgba(6,14,28,.45)'; c.fillRect(0, 0, W, H); stats(c, t, v, d); srcLine(c, v.src); break;
      case 'name': nameScene(c, t, v, d, k); break;
      case 'brand': brandScene(c, t, v, d); break;
      case 'question': questionScene(c, t, v, d, k); break;
      case 'export': exportScene(c, t, v, d); break;
      case 'bigfour': bigFour(c, t, v, d, k); break;
    }
    chipTop(c, t, v);
    if (v.kind === 'city') M.source(c, OSM, WIDE ? 60 : 50, WIDE ? H - 60 : 1450, { size: (WIDE ? 20 : 22) * SC, maxW: WIDE ? 1200 : 860 });
  } };
});

const startOf = idx => sc[idx].sceneStart;
const chStarts = {}; LINES.forEach((l, k) => { if (chStarts[l.ch] == null) chStarts[l.ch] = startOf(k); });
const ENDSTART = sc[sc.length - 1].sceneStart;

if (THUMB) {
  // thumbnail = the opening hook frame, fully revealed, plus the series/part chip and the logo
  const ch = PART || 1, hk = EP.lines.find(l => l.ch === ch);
  window.FILM = M.film({ W, H, identity: 'storyteller', finish: true, scenes: [{ dur: 1, draw: (c, t) => { hookScene(c, 1.6, Object.assign({}, hk.v, { chip: null }), 6, 0, 0); } }],
    overlay: (c) => { if (window.LOGO) { const s = WIDE ? 64 : 84; c.drawImage(window.LOGO, WIDE ? 34 : 50, WIDE ? 30 : 300, s, s); }
      M.chip(c, THUMB === 'wide' ? 'CALGARY ORIGINS · THE RANCH ERA' : `PART ${ch} OF 4 · CALGARY ORIGINS`, CX, WIDE ? H - 110 : 1530, { align: 'center', size: WIDE ? 34 : 50 }); } });
} else {
  window.FILM = M.film({ W, H, identity: 'storyteller', scenes,
    overlay: (c, t, info) => {
      const isEnd = t >= ENDSTART;
      if (!isEnd) {
        const sinceCh = Math.min(...Object.values(chStarts).filter(x => x <= t + 1e-6).map(x => t - x));
        if (t > 3 && !(sinceCh < 2.6)) M.header(c, window.LOGO, W, H, { topic: 'Calgary Origins' });
        if (PART) M.chip(c, `PART ${PART} OF 4`, WIDE ? 60 : 50, WIDE ? 40 : 222, { size: WIDE ? 34 : 48, bg: GOLD, color: NAVY });
        else Object.entries(chStarts).forEach(([ch, st]) => { const a = M.seg(t, st + 2.2, st + 2.6) * (1 - M.seg(t, st + 7, st + 7.5)); if (a > 0 && WIDE) M.chip(c, `PART ${ch} OF 4 · ${CH_TITLES[ch].toUpperCase()}`, W - 60, 40, { align: 'right', size: 30, alpha: a }); });
        const half = ENDSTART / 2; M.followPill(c, (t - half) / 2.2, W, H);
      }
      M.caption(c, capAt(t), W, H, { size: WIDE ? 40 : 46 });
    } });
}

// ---------- effects cue sheet ----------
window.CUES = [];
sc.forEach((s, k) => {
  const isEnd = k === sc.length - 1, v = isEnd ? {} : LINES[k].v, st = s.sceneStart, d = s.sceneDur;
  if (v.kind === 'hook') { window.CUES.push({ t: Math.max(0, st), sfx: 'impact', gain: -5 }); if (v.snow) window.CUES.push({ t: st, sfx: 'wind', dur: d, gain: -16 }); }
  if (v.kind === 'land' || v.kind === 'name' || v.kind === 'chapter' || v.kind === 'question') window.CUES.push({ t: st, sfx: 'wind', dur: d, gain: v.snow ? -15 : -25 });
  if (v.kind === 'city') window.CUES.push({ t: st, sfx: 'city', dur: d, gain: -24 });
  if (v.fair || v.crowd) window.CUES.push({ t: st, sfx: 'crowd_murmur', dur: d, gain: -24 });
  if (v.kind === 'stats') v.items.forEach((_, j) => { window.CUES.push({ t: st + .3 + j * .7, sfx: 'ticks', dur: 1.0, gain: -18 }); window.CUES.push({ t: st + .3 + j * .7, sfx: 'impact', gain: -11 }); });
  if (v.big && v.kind !== 'stats' && v.kind !== 'bigfour') window.CUES.push({ t: st + .6, sfx: 'impact', gain: -10 });
  if (v.kind === 'doc') window.CUES.push({ t: st + .1, sfx: 'shutter', gain: -16 }, { t: st + .6, sfx: 'click', gain: -16 });
  if (v.kind === 'brand') window.CUES.push({ t: st + 1.05, sfx: 'stamp', gain: -6 }, { t: st + 1.1, sfx: 'swell', dur: 1.5, gain: -16 });
  if (v.kind === 'map') { (v.pins || []).forEach((_, j) => window.CUES.push({ t: st + .15 + j * .25, sfx: 'pop', gain: -15 })); if (v.focus) window.CUES.push({ t: st + .3, sfx: 'ping', gain: -18 }); }
  if (v.kind === 'bigfour') window.CUES.push({ t: st + 3.2, sfx: 'stamp', gain: -6 });
  if (v.chip && v.kind !== 'hook') window.CUES.push({ t: st + .35, sfx: 'click', gain: -20 });
  if (v.kind === 'question') window.CUES.push({ t: st, sfx: 'swell', dur: 2, gain: -14 });
  if (isEnd) window.CUES.push({ t: st + 1.6, sfx: 'click', gain: -10 }, { t: st, sfx: 'swell', dur: 2.5, gain: -12 });
  const tr = scenes[k].trans; if (tr && tr.kind === 'whip') window.CUES.push({ t: st + d - .25, sfx: 'whoosh', gain: -12 }); if (tr && tr.kind === 'flash') window.CUES.push({ t: st + d - .2, sfx: 'boom', gain: -10 });
});
window.CUES.sort((a, b) => a.t - b.t);
