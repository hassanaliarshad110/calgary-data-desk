/* Calgary Origins Ep 3 · "Boom and Bust: The Land Rush That Drew Calgary's Map" · one scene file for every format.
 *   film (1920x1080):  render.py scene.js film.mp4 --geo calgary_base.json --param format=wide
 *   reel n (1080x1920): render.py scene.js part1.mp4 --geo calgary_base.json --param part=1   (60-75 s cut, no end card)
 *   thumbnails: --param thumb=wide (1280x720) or --param thumb=1..4 (1080x1920), --stills 0
 * Every name, year and number on screen comes from the audited claims table (package, claims table).
 * EP (inlined by build_scene.py): lines with measured durations, visual specs, reel cuts, end lines.
 */
const EP = __EP__;
{ const P2 = CanvasRenderingContext2D.prototype, A = P2.arc, El = P2.ellipse; P2.arc = function (x, y, r, a0, a1, cc) { return A.call(this, x, y, Math.max(0, r || 0), a0, a1, cc); }; P2.ellipse = function (x, y, rx, ry, ...o) { return El.call(this, x, y, Math.max(0, rx), Math.max(0, ry), ...o); }; }
const P = window.PARAMS || {};
const THUMB = P.thumb || '';
const PART = +(P.part || (THUMB && THUMB !== 'wide' ? THUMB : 0)) || 0;
const WIDE = P.format === 'wide' || THUMB === 'wide';
const W = THUMB === 'wide' ? 1280 : WIDE ? 1920 : 1080, H = THUMB === 'wide' ? 720 : WIDE ? 1080 : 1920;
const SC = W / (WIDE ? 1920 : 1080);
const CX = WIDE ? W / 2 : (W - 120) / 2 + 30;
const GOLD = '#f2b632', NAVY = '#0b1f3a', CREAM = '#f3ead7', COPPER = '#c8743a', ORANGE = '#F7931E', RED = '#e0523f';
const CH_TITLES = EP.chTitles;
const OSM = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const SCHEM = 'Schematic · positions approximate';

// ---------- timeline: which lines this file uses ----------
// film: every line + the CTA/end-card line. Reel n: its cut of approved lines, the "full film" line, then the closing question (last).
let LINES, ENDLINE = null;
if (PART) {
  LINES = EP.partLines[PART].map(i => EP.lines[i]).concat([Object.assign({ ch: PART, v: { kind: 'fullfilm' }, gap: .7 }, EP.endPart[PART]), EP.lines[EP.partQ[PART]]]);
} else { LINES = EP.lines.slice(); ENDLINE = EP.endFilm; }
const scriptLines = LINES.map(l => ({ text: l.text, dur: l.dur, gapAfter: l.gap ?? undefined, caption: l.caption }))
  .concat(ENDLINE ? [{ text: ENDLINE.text, dur: ENDLINE.dur, caption: ENDLINE.caption }] : []);
const S = M.script(scriptLines, { lead: .3, gap: .85, tail: PART ? 1.6 : 4.2 });
const sc = S.scenes;
const HAS_END = !!ENDLINE;

// captions: each line split into short chunks, timed by character share of the measured line
const CHUNKS = [];
sc.forEach(s => {
  const words = s.caption.split(/\s+/), max = WIDE ? 13 : 8, parts = []; let cur = [];
  words.forEach((w, i) => { cur.push(w); const end = /[.,?!:;]$/.test(w); if (cur.length >= max || (end && cur.length >= (WIDE ? 6 : 4)) || i === words.length - 1) { parts.push(cur.join(' ')); cur = []; } });
  const tot = parts.reduce((a, p) => a + p.length, 0); let t = s.start;
  parts.forEach(p => { const d = s.speech * p.length / tot; CHUNKS.push({ a: t, b: t + d + (p === parts[parts.length - 1] ? .15 : 0), s: p }); t += d; });
});
const capAt = t => { const c = CHUNKS.find(c => t >= c.a && t < c.b); return c ? c.s : ''; };
window.CAPTIONS = () => CHUNKS.map(c => c.s);

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
  extraLand(c, t, v, dur, i, gy, hz, ink, S0, drift);
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
}

function nameScene(c, t, v, dur, i) {
  if (v.bg === 'city') city(c, t, { shot: v.shot, tod: v.tod }, dur); else if (v.bg !== 'none-drawn') landscape(c, t, { tod: v.tod || 'day' }, dur, i);
  c.fillStyle = 'rgba(6,14,28,.35)'; c.fillRect(0, 0, W, H);
  const hat = v.hat || 'bowler';
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
  townScene(c, t, { tod: 'dusk' }, dur, i); c.fillStyle = 'rgba(6,14,28,.72)'; c.fillRect(0, 0, W, H);
  const ev = v.events, from = v.from_, to = v.to, x0 = WIDE ? 160 : 90, x1 = WIDE ? W - 160 : W - 170, y = WIDE ? H * .55 : 900, p = M.seg(t, .2, dur - .6, 'inOutSine'), head = M.lerp(from, to, p);
  const X = yr => M.lerp(x0, x1, (yr - from) / (to - from));
  c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
  c.strokeStyle = GOLD; c.beginPath(); c.moveTo(x0, y); c.lineTo(X(head), y); c.stroke();
  ev.forEach((e, k) => { const on = head >= e[0], xx = X(e[0]), up = k % 2 === 0, a = on ? 1 : .35; c.globalAlpha = a; c.fillStyle = on ? GOLD : '#9fb0c8'; c.beginPath(); c.arc(xx, y, on ? 16 : 10, 0, 7); c.fill();
    const ty = up ? y - (WIDE ? 150 : 210) - (WIDE ? 0 : (k % 4 === 0 ? 0 : 0)) : y + 40; const yrS = e[2] || String(e[0]);
    if (!WIDE && ev.length > 3) { const yy = up ? y - 120 - (k % 4 === 0 ? 0 : 150) : y + 40 + (k % 4 === 1 ? 0 : 150); M.text(c, yrS, xx, yy, { size: 52, weight: 800, align: 'center', color: '#fff' }); M.text(c, e[1], xx, yy + 60, { size: 40, weight: 700, align: 'center', color: '#dfe7f2', maxW: 240 }); }
    else { M.text(c, yrS, xx, ty, { size: (WIDE ? 56 : 72) * SC, weight: 800, align: 'center', color: '#fff' }); M.text(c, e[1], xx, ty + (WIDE ? 66 : 84) * SC, { size: (WIDE ? 34 : 44) * SC, weight: 600, align: 'center', color: '#dfe7f2', maxW: (WIDE ? 300 : 420) * SC }); }
    c.globalAlpha = 1; });
  if (v.curve) { c.strokeStyle = 'rgba(242,182,50,.9)'; c.lineWidth = 6 * SC; c.beginPath(); const yb = y - (WIDE ? 40 : 60) * SC, amp = (WIDE ? 280 : 380) * SC;
    for (let yr = from; yr <= Math.min(head, to); yr += .05) { const hgt = yr <= 1912 ? Math.pow((yr - from) / (1912 - from), 2.2) : Math.max(.08, 1 - (yr - 1912) * 1.6); const xx = X(yr), yy = yb - amp * hgt; yr === from ? c.moveTo(xx, yy) : c.lineTo(xx, yy); } c.stroke();
    M.chip(c, 'SCHEMATIC CURVE · NO VALUES', WIDE ? W - 90 : W - 150, WIDE ? 120 : 1160, { align: 'right', size: (WIDE ? 30 : 36) * SC, bg: '#9fb0c8', color: NAVY }); }
  srcLine(c, v.src);
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


// ======================= Ep 3 scenes =======================
const SAND = ['#c9a66b', '#b88d55', '#a7784a', '#d2b07a', '#8a4a32', '#9b6a45'];
function person(c, x, y, s, col, hat, ph = 0) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col;
  const sw = Math.sin(ph) * 2; c.fillRect(-7 + sw * .2, -24, 6, 24); c.fillRect(2 - sw * .2, -24, 6, 24);
  c.beginPath(); c.moveTo(-13, -24); c.lineTo(-11, -62); c.quadraticCurveTo(0, -68, 11, -62); c.lineTo(13, -24); c.closePath(); c.fill();
  c.beginPath(); c.arc(0, -72, 8, 0, 7); c.fill();
  if (hat === 'fedora') { c.fillRect(-12, -80, 24, 3); c.fillRect(-7, -88, 14, 8); } else if (hat === 'bowler') { c.beginPath(); c.arc(0, -79, 7, Math.PI, 0); c.fill(); c.fillRect(-10, -80, 20, 2.5); }
  c.restore(); }
function windowGrid(c, x, y, w, h, cols, rows, lit, seed, off) { const r = M.rng(seed); const ww = w / cols, hh = h / rows;
  for (let a = 0; a < rows; a++) for (let b = 0; b < cols; b++) { const on = lit > 0 && r() < lit && !(off && r() < off(a, b)); c.fillStyle = on ? 'rgba(255,206,120,.95)' : 'rgba(30,26,24,.55)'; c.fillRect(x + b * ww + ww * .25, y + a * hh + hh * .22, ww * .5, hh * .56); } }
// a sandstone/brick block: x = left, gy = ground, w, floors, col; o: {built 0..1, lit, scaffold, sign, dark(fn), cornice}
function block(c, x, gy, w, floors, col, o = {}) {
  const fh = 62 * SC * (o.k || 1), full = floors * fh, built = o.built ?? 1, h = full * built;
  c.fillStyle = col; c.fillRect(x, gy - h, w, h);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x + w - 8 * SC, gy - h, 8 * SC, h);
  const fl = Math.floor(floors * built + 1e-6);
  if (fl > 0) windowGrid(c, x + 10 * SC, gy - fl * fh, w - 20 * SC, fl * fh - 18 * SC, Math.max(2, Math.round(w / (46 * SC))), fl, o.lit || 0, o.seed || 7, o.off);
  if (built >= 1) { c.fillStyle = 'rgba(255,240,210,.35)'; c.fillRect(x - 6 * SC, gy - h - 12 * SC, w + 12 * SC, 12 * SC); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x - 6 * SC, gy - h, w + 12 * SC, 4 * SC); }
  if (o.scaffold || built < 1) { c.strokeStyle = 'rgba(90,64,36,.95)'; c.lineWidth = 3 * SC; const top = gy - full - 20 * SC;
    for (let k = 0; k <= 4; k++) { const xx = x - 10 * SC + k * (w + 20 * SC) / 4; c.beginPath(); c.moveTo(xx, gy); c.lineTo(xx, top); c.stroke(); }
    for (let yy = gy; yy > top; yy -= fh) { c.beginPath(); c.moveTo(x - 10 * SC, yy); c.lineTo(x + w + 10 * SC, yy); c.stroke(); } }
  if (o.sign) { const sw = Math.min(w - 20 * SC, o.sign.length * 22 * SC + 30 * SC); M.rr(c, x + (w - sw) / 2, gy - 120 * SC, sw, 44 * SC, 6); c.fillStyle = o.signBg || '#1b1410'; c.fill(); M.text(c, o.sign, x + w / 2, gy - 98 * SC, { size: 26 * SC, weight: 800, align: 'center', base: 'middle', color: o.signCol || GOLD, shadow: false }); }
  return gy - h;
}
function derrick(c, x, gy, h, t, swing) { c.save(); c.strokeStyle = '#3a2c1e'; c.lineWidth = 6 * SC; c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy - h); c.stroke();
  const a = -.6 + Math.sin(t * .9 + swing) * .35, L = h * .8; c.beginPath(); c.moveTo(x, gy - h * .9); c.lineTo(x + Math.cos(a) * L, gy - h * .9 + Math.sin(a) * L); c.stroke();
  c.lineWidth = 2 * SC; const ex = x + Math.cos(a) * L, ey = gy - h * .9 + Math.sin(a) * L; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex, ey + 90 * SC); c.stroke(); c.fillStyle = '#b88d55'; c.fillRect(ex - 22 * SC, ey + 90 * SC, 44 * SC, 22 * SC); c.restore(); }
function streetcar(c, x, y, s, lit) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#7a1f1a'; M.rr(c, -110, -70, 220, 60, 10); c.fill(); c.fillStyle = '#e8dcc0'; c.fillRect(-110, -82, 220, 12);
  c.fillStyle = lit ? 'rgba(255,206,120,.95)' : '#2a2420'; for (let k = 0; k < 7; k++) c.fillRect(-98 + k * 30, -62, 20, 24); c.fillStyle = '#111'; c.beginPath(); c.arc(-70, -8, 10, 0, 7); c.arc(70, -8, 10, 0, 7); c.fill();
  c.strokeStyle = '#222'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -82); c.lineTo(40, -150); c.stroke(); c.restore(); }
// heroes: recognisable silhouettes of the real buildings (stylised, not to scale)
function hero(c, kind, x, gy, t, tod) { const k = (WIDE ? 1.25 : 1.05) * SC;
  if (kind === 'grain') { block(c, x - 150 * k, gy, 300 * k, 6, '#c9a66b', { lit: tod === 'dusk' ? .6 : 0, k, seed: 21 }); }
  if (kind === 'cityhall') { const pr = M.seg(t, .2, 2.4, 'inOutCubic'); block(c, x - 220 * k, gy, 440 * k, 3, '#c4a16a', { k, seed: 22 });
    const tw = 90 * k, th = (190 + 120 * pr) * k; c.fillStyle = '#b8945d'; c.fillRect(x - tw / 2, gy - 186 * k - th, tw, th); c.beginPath(); c.moveTo(x - tw / 2 - 8 * k, gy - 186 * k - th); c.lineTo(x, gy - 186 * k - th - 70 * k); c.lineTo(x + tw / 2 + 8 * k, gy - 186 * k - th); c.fill();
    c.fillStyle = '#f3ead7'; c.beginPath(); c.arc(x, gy - 186 * k - th + 40 * k, 26 * k, 0, 7); c.fill(); c.strokeStyle = '#222'; c.lineWidth = 3 * k; c.beginPath(); c.moveTo(x, gy - 186 * k - th + 40 * k); c.lineTo(x + 16 * k * Math.cos(t), gy - 186 * k - th + 40 * k + 16 * k * Math.sin(t)); c.stroke();
    if (pr < 1) { c.save(); c.globalAlpha = 1 - pr; block(c, x - tw / 2, gy - 186 * k, tw, 5, 'rgba(0,0,0,0)', { scaffold: true, k }); c.restore(); } }
  if (kind === 'lougheed') { const top = block(c, x - 230 * k, gy, 460 * k, 6, '#8a4a32', { lit: tod === 'dusk' ? .7 : .1, k, seed: 23 });
    const on = M.seg(t, .6, 1.4); M.rr(c, x - 170 * k, gy - 118 * k, 340 * k, 56 * k, 8); c.fillStyle = '#1b1410'; c.fill(); c.strokeStyle = `rgba(255,214,120,${on})`; c.lineWidth = 4 * k; c.stroke();
    for (let b = 0; b < 22; b++) { c.fillStyle = `rgba(255,224,150,${on * (.5 + .5 * Math.sin(t * 6 + b))})`; c.beginPath(); c.arc(x - 160 * k + b * 15.2 * k, gy - 124 * k, 3.5 * k, 0, 7); c.fill(); }
    M.text(c, 'SHERMAN GRAND', x, gy - 90 * k, { size: 34 * k, weight: 800, align: 'center', base: 'middle', color: `rgba(255,214,120,${.3 + .7 * on})`, shadow: false }); }
  if (kind === 'library') { const col = '#cdb07c'; c.fillStyle = col; c.fillRect(x - 200 * k, gy - 170 * k, 400 * k, 170 * k); c.beginPath(); c.moveTo(x - 120 * k, gy - 170 * k); c.lineTo(x, gy - 240 * k); c.lineTo(x + 120 * k, gy - 170 * k); c.fill();
    c.fillStyle = 'rgba(0,0,0,.2)'; for (let k2 = 0; k2 < 6; k2++) c.fillRect(x - 100 * k + k2 * 40 * k, gy - 160 * k, 12 * k, 150 * k); c.fillStyle = '#e8dcc0'; c.fillRect(x - 130 * k, gy - 22 * k, 260 * k, 22 * k);
    [-330, -270, 280, 340].forEach((dx, j) => { c.fillStyle = '#2f4a2a'; c.beginPath(); c.arc(x + dx * k, gy - 120 * k, (60 + j * 6) * k, 0, 7); c.fill(); c.fillStyle = '#3a2a1c'; c.fillRect(x + dx * k - 6 * k, gy - 70 * k, 12 * k, 70 * k); }); }
}
function townScene(c, t, v, dur, i) {
  const tod = v.tod || 'day', p = clamp01(t / Math.max(1, dur)), push = 1 + .05 * p, drift = (i % 2 ? -1 : 1) * p * W * .03;
  c.save(); c.translate(W / 2, H / 2); c.scale(push, push); c.translate(-W / 2 + drift, -H / 2);
  const night = v.office || tod === 'night', gy = H * (WIDE ? .8 : .66);
  skyFill(c, night ? 'night' : tod, gy);
  if (night) { const r = M.rng(5); for (let k = 0; k < 120; k++) { c.fillStyle = `rgba(255,255,255,${.2 + .5 * r()})`; c.fillRect(r() * W, r() * gy * .7, 2, 2); } }
  const mt = night ? '#121a28' : tod === 'storm' ? '#8d97a3' : tod === 'dusk' ? '#3d3550' : '#7f93ad';
  drawRidge(c, R1, gy - H * .18, H * .1, drift * .2, mt, night ? null : '#f4f7fa');
  // back row
  const rr = M.rng(40 + (v.office ? 1 : 0)); let x = -W * .1;
  while (x < W * 1.1) { const w = (120 + 90 * rr()) * SC * (WIDE ? 1.2 : 1), f = 2 + Math.floor(rr() * 4); block(c, x, gy - H * .02, w, f, M.blend ? M.blend(SAND[Math.floor(rr() * SAND.length)], '#000', .35) : '#7a5a3a', { lit: night ? .5 : tod === 'dusk' ? .3 : 0, seed: 50 + Math.floor(x), k: .8 }); x += w + 8 * SC; }
  // front row
  const r2 = M.rng(77); x = -W * .05; const fronts = [];
  while (x < W * 1.05) { const w = (190 + 130 * r2()) * SC * (WIDE ? 1.25 : 1), f = 2 + Math.floor(r2() * 4), col = SAND[Math.floor(r2() * SAND.length)]; fronts.push([x, w, f, col]); x += w + 14 * SC; }
  const heroX = WIDE ? W * .68 : CX;
  fronts.forEach(([x, w, f, col], j) => {
    if (v.hero && Math.abs(x + w / 2 - heroX) < (WIDE ? 420 : 330) * SC) return;
    const riseP = v.rise ? M.seg(t, .2 + j * .25, 1.8 + j * .25, 'inOutCubic') : 1;
    const stalled = v.stalled && j % 2 === 1;
    const offFn = v.office ? (a, b) => M.seg(t, .3 + ((a * 7 + b * 3 + j * 5) % 23) / 23 * 2.6, .5 + ((a * 7 + b * 3 + j * 5) % 23) / 23 * 2.6) * 1.0 : null;
    let o = { built: stalled ? .5 : riseP, lit: night ? .85 : tod === 'dusk' ? .45 : 0, seed: 90 + j, off: offFn, scaffold: stalled };
    if (v.office) { o.sign = 'REAL ESTATE'; }
    if (v.brokers && j === 2) { const wp = M.seg(t, .8, 2.2); o.sign = wp < .5 ? 'REAL ESTATE' : 'OIL SHARES'; o.signCol = wp < .5 ? GOLD : '#ffd27a'; }
    block(c, x, gy, w, f, col, o);
    if (v.rise && riseP < 1 && riseP > 0) derrick(c, x + w * .8, gy - f * 62 * SC * riseP, 140 * SC, t, j);
    if (v.office) { const cl = M.seg(t, 1.2 + j * .3, 1.5 + j * .3, 'outBack'); if (cl > 0) { c.save(); c.translate(x + w / 2, gy - 50 * SC); c.rotate(-.06 + j * .03); c.scale(cl, cl); M.rr(c, -70 * SC, -22 * SC, 140 * SC, 44 * SC, 6); c.fillStyle = RED; c.fill(); M.text(c, 'CLOSED', 0, 0, { size: 28 * SC, weight: 800, align: 'center', base: 'middle', color: '#fff', shadow: false }); c.restore(); } }
  });
  if (v.forsale) { for (let k = 0; k < 6; k++) { const hx = W * (.08 + k * .16), hy = gy + 20 * SC; c.fillStyle = '#7a5a3a'; c.fillRect(hx - 60 * SC, hy - 90 * SC, 120 * SC, 90 * SC); c.beginPath(); c.moveTo(hx - 72 * SC, hy - 90 * SC); c.lineTo(hx, hy - 150 * SC); c.lineTo(hx + 72 * SC, hy - 90 * SC); c.fillStyle = '#5a2b22'; c.fill();
      c.save(); c.translate(hx + 90 * SC, hy - 10 * SC); c.fillStyle = '#3a2c1e'; c.fillRect(-3 * SC, -80 * SC, 6 * SC, 80 * SC); c.translate(0, -80 * SC); c.rotate(Math.sin(t * 3 + k) * .15); M.rr(c, -50 * SC, 6 * SC, 100 * SC, 40 * SC, 4); c.fillStyle = '#f3ead7'; c.fill(); M.text(c, 'FOR SALE', 0, 26 * SC, { size: 20 * SC, weight: 800, align: 'center', base: 'middle', color: RED, shadow: false }); c.restore(); } }
  if (v.hero) hero(c, v.hero, heroX, gy, t, tod);
  // street
  c.fillStyle = night ? '#141820' : '#6b5a44'; c.fillRect(-W, gy, W * 3, H - gy); c.fillStyle = night ? '#1c222c' : '#857057'; c.fillRect(-W, gy, W * 3, 22 * SC);
  c.strokeStyle = 'rgba(30,24,18,.6)'; c.lineWidth = 4 * SC; [gy + H * .06, gy + H * .075].forEach(y => { c.beginPath(); c.moveTo(-W, y); c.lineTo(W * 2, y); c.stroke(); });
  if (!v.empty && !v.office && !v.stalled) { const sx = ((t * 120 * SC) % (W * 1.6)) - W * .3; streetcar(c, v.rise ? W * 1.2 - sx : sx, gy + H * .07, (WIDE ? 1.1 : .9) * SC, tod === 'dusk'); }
  if (!v.empty && !v.office) { const r3 = M.rng(5 + i); for (let k = 0; k < 9; k++) { const px = ((r3() * W + t * (20 + 30 * r3()) * SC * (k % 2 ? 1 : -1)) % (W * 1.1) + W * 1.1) % (W * 1.1) - W * .05; person(c, px, gy + H * .03 + r3() * 10 * SC, (WIDE ? 1.3 : 1.1) * SC, '#1a1410', k % 3 ? 'bowler' : 'fedora', t * 6 + k); } }
  if (v.empty) { c.save(); c.translate(W * .7, gy - 160 * SC); c.rotate(Math.sin(t * 4) * .05); M.rr(c, -70 * SC, -90 * SC, 140 * SC, 180 * SC, 4); c.fillStyle = '#d8cdb4'; c.fill(); M.text(c, 'ENLIST', 0, -50 * SC, { size: 30 * SC, weight: 900, align: 'center', color: '#7a1f1a', shadow: false }); c.fillStyle = '#7a1f1a'; c.fillRect(-40 * SC, -10 * SC, 80 * SC, 70 * SC); c.restore(); }
  c.restore();
  if (tod === 'storm' || v.stalled) { M.weather(c, 'rain', t, W, H, { count: 500 }); c.fillStyle = 'rgba(20,26,36,.25)'; c.fillRect(0, 0, W, H); }
}
// price tag flip: $500 (1912) -> $400 (1955)
function priceScene(c, t, v, dur, i) {
  landscape(c, t, { tod: 'dawn', stake: true }, dur, i); c.fillStyle = 'rgba(6,14,28,.5)'; c.fillRect(0, 0, W, H);
  const flip = M.seg(t, dur * .38, dur * .38 + .6, 'inOutCubic'), sy = Math.abs(Math.cos(flip * Math.PI)), second = flip > .5;
  const cy = WIDE ? H * .42 : 760, tw = (WIDE ? 760 : 760) * SC, th = (WIDE ? 360 : 380) * SC;
  c.save(); c.translate(CX, cy); c.rotate(-.03); c.scale(1, Math.max(.02, sy));
  M.rr(c, -tw / 2, -th / 2, tw, th, 24 * SC); c.fillStyle = second ? '#f3ead7' : '#f6e3b4'; c.fill(); c.strokeStyle = second ? RED : COPPER; c.lineWidth = 10 * SC; c.stroke();
  c.fillStyle = NAVY; c.beginPath(); c.arc(-tw / 2 + 50 * SC, 0, 18 * SC, 0, 7); c.fill();
  M.text(c, second ? `$${v.b}` : `$${v.a}`, 30 * SC, -th / 2 + 40 * SC, { size: 200 * SC, weight: 900, align: 'center', color: second ? RED : NAVY, shadow: false });
  M.text(c, second ? `${v.lb} · ${v.yb}` : `${v.la} · ${v.ya}`, 30 * SC, th / 2 - 100 * SC, { size: 60 * SC, weight: 800, align: 'center', color: NAVY, shadow: false });
  c.restore();
  // years ticker: lands exactly on 1955
  const yr = Math.round(M.lerp(+v.ya, +v.yb, M.seg(t, dur * .1, dur * .38, 'inOutSine')));
  M.text(c, String(t < dur * .1 ? v.ya : yr), CX, cy + th / 2 + 50 * SC, { size: 110 * SC, weight: 800, align: 'center', color: '#fff' });
  M.text(c, 'taxes paid every year in between', CX, cy + th / 2 + 175 * SC, { size: (WIDE ? 44 : 48) * SC, weight: 600, align: 'center', color: GOLD, alpha: M.seg(t, .6, 1.2), maxW: 860 * SC });
  srcLine(c, v.src);
}
// building-permit bars (values from Chastko table 2-1, millions of dollars; bars start at zero)
const PERMITS = [[1910, 5.589594, '$5.6M'], [1911, 12.907638, '$12.9M'], [1912, 20.39422, '$20.4M']];
function barsScene(c, t, v, dur, i) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0d2140'); g.addColorStop(1, '#071226'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.strokeStyle = 'rgba(120,170,230,.10)'; c.lineWidth = 1; const gs = 48 * SC, off = (t * 10) % gs; for (let x = -gs + off; x < W; x += gs) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += gs) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  if (v.taxes) { // schematic: two lines falling together (no values)
    const x0 = WIDE ? 220 : 90, x1 = WIDE ? W - 220 : W - 170, y0 = WIDE ? H * .4 : 640, y1 = WIDE ? H * .8 : 1250, p = M.seg(t, .2, dur - .5, 'inOutSine');
    [['LAND SALES', GOLD, 0], ['TAX COLLECTIONS', '#9fd0ff', 60 * SC]].forEach(([lab, col, dy]) => { c.strokeStyle = col; c.lineWidth = 10 * SC; c.lineCap = 'round'; c.beginPath();
      for (let u = 0; u <= p + 1e-6; u += .02) { const x = M.lerp(x0, x1, u), y = M.lerp(y0 + dy, y1 - 60 * SC + dy, u * u * (3 - 2 * u)) + Math.sin(u * 20 + dy) * 6 * SC; u ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      const ey = M.lerp(y0 + dy, y1 - 60 * SC + dy, p * p * (3 - 2 * p)); M.text(c, lab, M.lerp(x0, x1, p) - 10 * SC, dy ? ey + 24 * SC : ey - 84 * SC, { size: (WIDE ? 44 : 44) * SC, weight: 800, color: col, align: 'right', alpha: M.seg(t, .5, 1) }); });
    M.chip(c, 'SCHEMATIC · NO VALUES', WIDE ? W - 90 : CX, WIDE ? 120 : 560, { align: WIDE ? 'right' : 'center', size: (WIDE ? 34 : 40) * SC, bg: '#9fb0c8', color: NAVY });
    lower(c, t, v, true); srcLine(c, v.src); return; }
  M.text(c, 'VALUE OF BUILDING PERMITS · CALGARY', CX, WIDE ? 90 : 330, { size: (WIDE ? 46 : 46) * SC, weight: 800, align: 'center', color: '#fff', maxW: (WIDE ? 1600 : 880) * SC });
  const base = WIDE ? H * .72 : 1200, top = WIDE ? H * .2 : 500, max = 22, bw = (WIDE ? 220 : 190) * SC, gap = (WIDE ? 120 : 60) * SC, nb = 4, totalW = nb * bw + (nb - 1) * gap, xs = CX - totalW / 2;
  c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3 * SC; c.beginPath(); c.moveTo(xs - 30 * SC, base); c.lineTo(xs + totalW + 30 * SC, base); c.stroke();
  const shake = v.crack ? Math.sin(t * 60) * 4 * SC * M.seg(t, .4, 1) : 0;
  PERMITS.slice(0, v.show || 3).forEach(([yr, val, lab], k) => { const isNew = k === (v.show || 3) - 1 && !v.fall && !v.crack, gp = isNew ? M.seg(t, .15, 1.3, 'outCubic') : 1;
    const h = (base - top) * val / max * gp, x = xs + k * (bw + gap) + (k === 2 ? shake : 0);
    const gr = c.createLinearGradient(0, base - h, 0, base); gr.addColorStop(0, k === 2 ? GOLD : '#d9b45a'); gr.addColorStop(1, '#8a6a20'); c.fillStyle = gr; c.fillRect(x, base - h, bw, h);
    if (v.crack && k === 2) { const cp = M.seg(t, .6, 1.6); c.strokeStyle = '#0b1f3a'; c.lineWidth = 6 * SC; c.beginPath(); let yy = base - h; c.moveTo(x + bw * .5, yy); for (let s = 1; s <= 8 * cp; s++) { yy += h / 9; c.lineTo(x + bw * (.5 + (s % 2 ? .18 : -.15)), yy); } c.stroke(); }
    M.text(c, String(yr), x + bw / 2, base + 16 * SC, { size: (WIDE ? 48 : 52) * SC, weight: 800, align: 'center', color: '#fff' });
    if (gp > .9) M.text(c, lab, x + bw / 2, base - h - (WIDE ? 70 : 76) * SC, { size: (WIDE ? 56 : 60) * SC, weight: 800, align: 'center', color: '#fff', alpha: isNew ? M.seg(t, 1.1, 1.4) : 1 }); });
  if (v.record && (v.show || 3) >= 3) { const s = M.seg(t, v.crack ? 0 : 1.3, (v.crack ? 0 : 1.3) + .35, 'outBack'); if (s > 0) { c.save(); const x = xs + 2 * (bw + gap) + bw * (WIDE ? 1.55 : 1.2), y = base - (base - top) * PERMITS[2][1] / max + (WIDE ? 90 : 120) * SC; c.translate(x, y); c.rotate(-.12); c.scale(M.lerp(1.8, 1, Math.min(1, s)), M.lerp(1.8, 1, Math.min(1, s))); c.strokeStyle = RED; c.lineWidth = 7 * SC; M.rr(c, -150 * SC, -42 * SC, 300 * SC, 84 * SC, 10); c.stroke(); M.text(c, 'RECORD', 0, 0, { size: 60 * SC, weight: 900, align: 'center', base: 'middle', color: RED, shadow: false }); c.restore(); } }
  if (v.fall) { const p = M.seg(t, .4, 1.4, 'outCubic'), x = xs + 3 * (bw + gap), half = base - (base - top) * PERMITS[2][1] / 2 / max;
    c.setLineDash([14 * SC, 10 * SC]); c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 4 * SC; c.beginPath(); c.moveTo(xs + 2 * (bw + gap), half); c.lineTo(M.lerp(xs + 2 * (bw + gap), x + bw, p), half); c.stroke(); c.setLineDash([]);
    M.text(c, 'HALF OF 1912', xs + 2 * (bw + gap) + bw / 2, half - 54 * SC, { size: (WIDE ? 34 : 36) * SC, weight: 700, align: 'center', color: '#dfe7f2', alpha: p });
    M.text(c, '1913', x + bw / 2, base + 16 * SC, { size: (WIDE ? 48 : 52) * SC, weight: 800, align: 'center', color: '#fff' });
    const ap = M.seg(t, 1.2, 2.0, 'inCubic'), ay = M.lerp(half - 40 * SC, base - 60 * SC, ap); c.fillStyle = RED; c.fillRect(x + bw / 2 - 14 * SC, half - 40 * SC, 28 * SC, ay - (half - 40 * SC)); c.beginPath(); c.moveTo(x + bw / 2 - 46 * SC, ay); c.lineTo(x + bw / 2 + 46 * SC, ay); c.lineTo(x + bw / 2, ay + 60 * SC); c.fill();
    M.text(c, 'LESS THAN HALF', x + bw / 2, half - 130 * SC, { size: (WIDE ? 48 : 46) * SC, weight: 900, align: 'center', color: RED, alpha: M.seg(t, 1.6, 2), maxW: (WIDE ? 420 : 260) * SC }); }
  srcLine(c, v.src);
}
// Calgary map from the geo pack (metres; north up)
const GEO = window.GEO || {};
const COMMS = {}; ((GEO.communities || {}).items || []).forEach(it => { COMMS[it.name] = it; });
function commCentre(name) { const it = COMMS[name]; if (!it) return [0, 0]; let sx = 0, sy = 0, n = 0; it.polys.forEach(pp => pp[0].forEach(q => { sx += q[0]; sy += q[1]; n++; })); return [sx / n, sy / n]; }
const LIM = { x0: -4980, x1: 4910, y0: -4970, y1: 5600 };   // approximate 1910 limits on today's roads (37 St W, Barlow Tr, 59 Ave S, McKnight Blvd)
const titleCase = s => s.toLowerCase().replace(/(^|[\s/])\S/g, m => m.toUpperCase());
function citymap(c, t, v, dur) {
  const p = M.seg(t, 0, dur, 'inOutSine');
  const f = v.focus ? commCentre(v.focus) : [0, 300];
  const z0 = WIDE ? 1 : 1, z1 = v.focus ? (v.focus === 'BOWNESS' ? 1.35 : v.focus === 'HIGHWOOD' || v.focus === 'CAMBRIAN HEIGHTS' ? 1.8 : 2.4) : v.ring ? .78 : 1.06;
  const zoom = M.lerp(z0, z1, p), ctr = [M.lerp(0, f[0], p * .9), M.lerp(300, f[1], p * .9)];
  const span = v.ring ? 21000 : (v.limits ? 15500 : 13000), mw = WIDE ? W : W - 120, mh = WIDE ? H : 1180, top = WIDE ? 0 : 280;
  const s = Math.min(mw, mh) / span * zoom * (WIDE && !v.limits ? 1.25 : 1), ox = WIDE ? W * .56 : mw / 2 + 30, oy = top + mh * (WIDE ? .58 : .56);
  const X = q => [ox + (q[0] - ctr[0]) * s, oy - (q[1] - ctr[1]) * s];
  c.fillStyle = '#0b1626'; c.fillRect(0, 0, W, H);
  c.save(); if (!WIDE) { c.beginPath(); c.rect(0, top, W, mh); c.clip(); }
  const poly = (pts, close = true) => { c.beginPath(); pts.forEach((q, k) => { const [x, y] = X(q); k ? c.lineTo(x, y) : c.moveTo(x, y); }); if (close) c.closePath(); };
  (GEO.boundary || []).forEach(pp => { poly(pp); c.fillStyle = '#15243a'; c.fill(); c.strokeStyle = 'rgba(159,176,200,.35)'; c.lineWidth = 2; c.stroke(); });
  c.strokeStyle = 'rgba(255,255,255,.07)'; c.lineWidth = 1; ((GEO.communities || {}).items || []).forEach(it => it.polys.forEach(pp => { poly(pp[0]); c.stroke(); }));
  (GEO.water || []).forEach(wt => { const pts = wt.poly || wt.pts || wt; if (Array.isArray(pts) && pts.length > 2 && Array.isArray(pts[0]) && typeof pts[0][0] === 'number') { poly(pts); c.fillStyle = '#244a72'; c.fill(); } });
  (GEO.rivers || []).forEach(r => { c.strokeStyle = /Bow|Elbow/.test(r.name) ? '#4f86b8' : 'rgba(79,134,184,.6)'; c.lineWidth = (/Bow|Elbow/.test(r.name) ? 5 : 2) * SC; (r.lines || []).forEach(l => { poly(l, false); c.stroke(); }); });
  c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 1.6 * SC; (GEO.roads || []).forEach(r => (r.lines || []).forEach(l => { poly(l, false); c.stroke(); }));
  const dim = v.dim ? .5 + .5 * Math.sin(t * 2) : 1;
  (v.comms || []).forEach((nm, k) => { const it = COMMS[nm]; if (!it) return; const a = M.seg(t, .3 + k * .25, .9 + k * .25) * (v.dim ? .55 + .45 * dim : 1);
    it.polys.forEach(pp => { poly(pp[0]); c.fillStyle = `rgba(242,182,50,${.38 * a})`; c.fill(); c.strokeStyle = `rgba(242,182,50,${a})`; c.lineWidth = 4 * SC; c.stroke(); }); });
  if (v.limits) { const lp = v.dim ? 1 : M.seg(t, .2, 1.8, 'inOutCubic'), pts = [[LIM.x0, LIM.y0], [LIM.x1, LIM.y0], [LIM.x1, LIM.y1], [LIM.x0, LIM.y1], [LIM.x0, LIM.y0]];
    const per = 2 * ((LIM.x1 - LIM.x0) + (LIM.y1 - LIM.y0)); let left = per * lp; c.strokeStyle = GOLD; c.lineWidth = 7 * SC; c.setLineDash([22 * SC, 12 * SC]); c.beginPath(); let [x, y] = X(pts[0]); c.moveTo(x, y);
    for (let k = 1; k < pts.length && left > 0; k++) { const a = pts[k - 1], b = pts[k], L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = Math.min(1, left / L); const q = X([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); c.lineTo(q[0], q[1]); left -= L; } c.stroke(); c.setLineDash([]);
    if (v.west) { const pu = .5 + .5 * Math.sin(t * 5); const A = X([LIM.x0, LIM.y0]), B = X([LIM.x0, LIM.y1]); c.strokeStyle = `rgba(247,147,30,${.6 + .4 * pu})`; c.lineWidth = 14 * SC; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke();
      M.text(c, '37 ST W', A[0] - 18 * SC, (A[1] + B[1]) / 2, { size: (WIDE ? 40 : 44) * SC, weight: 800, align: 'right', base: 'middle', color: ORANGE, stroke: 6, strokeColor: '#06101f' }); }
    const tl = X([LIM.x0, LIM.y1]); M.text(c, '1910 LIMITS (APPROX.)', tl[0] + 10 * SC, tl[1] - (WIDE ? 50 : 56) * SC, { size: (WIDE ? 34 : 38) * SC, weight: 800, color: GOLD, alpha: M.seg(t, 1, 1.5) || (v.dim ? 1 : 0), stroke: 6, strokeColor: '#06101f' }); }
  if (v.ring) { const rp = M.seg(t, .4, 2.4, 'outCubic'), o = X([0, 0]), R = 8000 * s * rp; c.strokeStyle = GOLD; c.lineWidth = 6 * SC; c.beginPath(); c.arc(o[0], o[1], R, 0, 7); c.stroke(); c.fillStyle = 'rgba(242,182,50,.08)'; c.fill();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3 * SC; c.beginPath(); c.moveTo(o[0], o[1]); c.lineTo(o[0] + R * .707, o[1] - R * .707); c.stroke();
    M.text(c, 'ABOUT 8 KM', o[0] + R * .38 + 16 * SC, o[1] - R * .38, { size: (WIDE ? 44 : 48) * SC, weight: 800, color: '#fff', stroke: 6, strokeColor: '#06101f', alpha: rp > .8 ? 1 : 0 });
    c.fillStyle = GOLD; c.beginPath(); c.arc(o[0], o[1], 12 * SC, 0, 7); c.fill(); M.text(c, 'CENTRAL POST OFFICE (APPROX.)', o[0], o[1] + 22 * SC, { size: (WIDE ? 28 : 30) * SC, weight: 700, align: 'center', color: '#fff', stroke: 5, strokeColor: '#06101f' }); }
  (v.comms || []).forEach((nm, k) => { if (!COMMS[nm]) return; const a = M.seg(t, .5 + k * .25, 1 + k * .25); const q = X(commCentre(nm)); const lab = nm === 'KILLARNEY/GLENGARRY' ? 'Killarney' : titleCase(nm);
    M.text(c, lab, q[0], q[1], { size: (v.focus === nm ? (WIDE ? 50 : 54) : (WIDE ? 34 : 36)) * SC, weight: 800, align: 'center', base: 'middle', color: '#fff', stroke: 7, strokeColor: '#06101f', alpha: a }); });
  // downtown marker for orientation
  const d = X([0, 0]); if (!v.ring) { c.fillStyle = '#fff'; c.beginPath(); c.arc(d[0], d[1], 7 * SC, 0, 7); c.fill(); M.text(c, 'Downtown', d[0] + 14 * SC, d[1], { size: (WIDE ? 26 : 28) * SC, weight: 700, base: 'middle', color: '#dfe7f2', alpha: .85 }); }
  c.restore();
  const nx = WIDE ? W - 90 : W - 190, ny = WIDE ? 170 : 400; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(nx, ny - 30 * SC); c.lineTo(nx - 14 * SC, ny + 8 * SC); c.lineTo(nx + 14 * SC, ny + 8 * SC); c.fill(); M.text(c, 'N', nx, ny + 14 * SC, { size: 26 * SC, weight: 800, align: 'center', color: '#fff' });
  M.source(c, OSM + (v.limits ? ' · 1910 limits approximate' : '') + ' · community outlines are today\'s', WIDE ? 60 : 50, WIDE ? H - 60 : 1450, { size: (WIDE ? 20 : 22) * SC, maxW: WIDE ? 1400 : 860 });
}
// survey grid on bare prairie (top-down, slight tilt)
function platScene(c, t, v, dur, i, hook) {
  const tod = v.tod || 'day', ghost = !!v.ghost, p = M.seg(t, 0, dur, 'linear');
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, ghost ? '#2a2236' : '#8c8a4e'); g.addColorStop(1, ghost ? '#120e18' : '#5f5a30'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const r = M.rng(13); c.lineWidth = 2 * SC; for (let k = 0; k < 700; k++) { const x = r() * W, y = r() * H, h = (6 + 10 * r()) * SC; c.strokeStyle = `rgba(${ghost ? '80,70,110' : '50,45,20'},${.25 + .3 * r()})`; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(t * 2 + x) * 3, y - h); c.stroke(); }
  c.save(); c.translate(W / 2, H / 2); c.rotate(-.12); c.scale(1 + .06 * p, 1 + .06 * p); c.translate(-W / 2, -H / 2);
  const cell = (WIDE ? 120 : 110) * SC, street = 26 * SC, cols = Math.ceil(W * 1.4 / cell), rows = Math.ceil(H * 1.3 / cell), x0 = -W * .2, y0 = -H * .15;
  const drawP = hook || v.draw ? M.seg(t, 0, hook ? 1.6 : dur * .7, 'inOutCubic') : 1, fade = ghost ? .35 + .35 * Math.sin(t * 7) * Math.sin(t * 2.3) - M.seg(t, dur * .5, dur, 'linear') * .3 : 1;
  const ink = ghost ? `rgba(200,190,255,${Math.max(0, fade)})` : 'rgba(255,248,225,.9)';
  c.strokeStyle = ink; c.lineWidth = 3 * SC;
  for (let a = 0; a <= rows; a++) { const y = y0 + a * cell, L = W * 1.4 * clamp01(drawP * 1.6 - a / rows * .6); c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + L, y); c.stroke(); c.beginPath(); c.moveTo(x0, y + street); c.lineTo(x0 + L, y + street); c.stroke(); }
  for (let b = 0; b <= cols; b += 3) { const x = x0 + b * cell, L = H * 1.3 * clamp01(drawP * 1.6 - b / cols * .6); c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + L); c.stroke(); }
  if (!ghost) { const rs = M.rng(29); for (let k = 0; k < 40; k++) { const a = Math.floor(rs() * rows), b = Math.floor(rs() * cols), when = hook ? .6 + rs() * 2.2 : .8 + rs() * (dur - 1.2); const s = M.seg(t, when, when + .25, 'outBack'); if (s <= 0) continue;
    const x = x0 + b * cell + cell * .5, y = y0 + a * cell + street + (cell - street) * .5; c.save(); c.translate(x, y); c.rotate(-.2 + rs() * .4); c.scale(Math.min(1.3, s), Math.min(1.3, s)); M.rr(c, -44 * SC, -18 * SC, 88 * SC, 36 * SC, 5); c.fillStyle = RED; c.fill(); M.text(c, 'SOLD', 0, 0, { size: 24 * SC, weight: 900, align: 'center', base: 'middle', color: '#fff', shadow: false }); c.restore(); } }
  if (v.draw && !ghost) { const rs = M.rng(31); for (let k = 0; k < 30; k++) { const a = Math.floor(rs() * rows), b = Math.floor(rs() * cols), x = x0 + b * cell, y = y0 + a * cell; const s = M.seg(t, .4 + k * .08, .7 + k * .08, 'outBack'); if (s <= 0) continue; c.fillStyle = '#7a5a3a'; c.fillRect(x - 3 * SC, y - 26 * SC * s, 6 * SC, 26 * SC * s); c.fillStyle = RED; c.fillRect(x + 3 * SC, y - 26 * SC * s, 14 * SC, 8 * SC); } }
  c.restore();
  if (ghost) { M.text(c, 'LAKE VIEW HEIGHTS', CX, WIDE ? H * .5 : 900, { size: (WIDE ? 90 : 84) * SC, weight: 800, align: 'center', base: 'middle', color: `rgba(220,210,255,${.25 + .4 * Math.max(0, fade)})`, shadow: false, maxW: (WIDE ? 1500 : 860) * SC }); M.chip(c, 'ILLUSTRATION · PLAN NEVER BUILT', CX, WIDE ? H * .5 + 90 : 1000, { align: 'center', size: (WIDE ? 30 : 34) * SC, bg: '#9fb0c8', color: NAVY }); }
  c.fillStyle = 'rgba(6,14,28,.25)'; c.fillRect(0, 0, W, H);
}
// arcs converging on Western Canada (schematic)
function arrivalsScene(c, t, v, dur) {
  c.fillStyle = '#0b1626'; c.fillRect(0, 0, W, H);
  const hub = WIDE ? [W * .42, H * .55] : [CX - 60 * SC, 900], R = 120 * SC;
  const g = c.createRadialGradient(hub[0], hub[1], 10, hub[0], hub[1], R * 2.2); g.addColorStop(0, 'rgba(242,182,50,.55)'); g.addColorStop(1, 'rgba(242,182,50,0)'); c.fillStyle = g; c.beginPath(); c.arc(hub[0], hub[1], R * 2.2, 0, 7); c.fill();
  M.text(c, v.hub || 'WESTERN CANADA', hub[0], hub[1] - 20 * SC, { size: (WIDE ? 54 : 56) * SC, weight: 900, align: 'center', color: '#fff' });
  const src = WIDE ? [[W * .86, H * .62], [W * .9, H * .22], [W * .06, H * .25]] : [[W - 190, 1250], [W - 200, 520], [80, 500]];
  v.origins.forEach((lab, k) => { const a = src[k], pp = M.seg(t, .3 + k * .5, 2.3 + k * .5, 'inOutCubic'), mid = [(a[0] + hub[0]) / 2, Math.min(a[1], hub[1]) - 220 * SC];
    const pt = u => [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * mid[0] + u * u * hub[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * mid[1] + u * u * hub[1]];
    c.strokeStyle = GOLD; c.lineWidth = 6 * SC; c.setLineDash([16 * SC, 10 * SC]); c.beginPath(); for (let u = 0; u <= pp + 1e-6; u += .02) { const q = pt(Math.min(u, pp)); u ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } c.stroke(); c.setLineDash([]);
    for (let d = 0; d < 6; d++) { const u = fr(t * .35 + d / 6) * pp; const q = pt(u); c.fillStyle = CREAM; c.beginPath(); c.arc(q[0], q[1], 6 * SC, 0, 7); c.fill(); }
    c.fillStyle = CREAM; c.beginPath(); c.arc(a[0], a[1], 12 * SC, 0, 7); c.fill();
    M.text(c, lab, a[0], a[1] + 24 * SC, { size: (WIDE ? 46 : 48) * SC, weight: 800, align: k === 2 ? 'left' : 'center', color: '#fff', maxW: 420 * SC, alpha: M.seg(t, .2 + k * .5, .6 + k * .5) }); });
  M.source(c, SCHEM + ' · ' + v.src, WIDE ? 60 : 50, WIDE ? H - 60 : 1450, { size: (WIDE ? 22 : 24) * SC, maxW: WIDE ? 1400 : 860 });
}
// Lowes's offices: schematic Alberta + an arc to London
const AB = [[-110, 49], [-110, 60], [-120, 60], [-120, 53.8], [-118.5, 53.1], [-117.2, 52.2], [-116, 51.2], [-114.6, 49.9], [-114.06, 49]];
const ABC = { 'Calgary': [-114.07, 51.05], 'Edmonton': [-113.49, 53.55], 'Lethbridge': [-112.84, 49.69], 'Medicine Hat': [-110.68, 50.04] };
function officesScene(c, t, v, dur) {
  c.fillStyle = '#0b1626'; c.fillRect(0, 0, W, H);
  const k = Math.cos(52 * Math.PI / 180), mw = WIDE ? W * .5 : W - 200, mh = WIDE ? H * .8 : 900, s = Math.min(mw / (10 * k), mh / 11), ox = WIDE ? W * .32 : CX - 20, oy = WIDE ? H * .52 : 860;
  const X = ([lo, la]) => [ox + (lo + 115) * k * s, oy - (la - 54.5) * s];
  c.beginPath(); AB.forEach((q, j) => { const [x, y] = X(q); j ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.fillStyle = '#1d2b22'; c.fill(); c.strokeStyle = 'rgba(242,182,50,.45)'; c.lineWidth = 3 * SC; c.stroke();
  M.text(c, 'ALBERTA', X([-115, 57])[0], X([-115, 57])[1], { size: (WIDE ? 44 : 48) * SC, weight: 800, align: 'center', color: '#dfe7f2', alpha: .5 });
  v.cities.filter(n => ABC[n]).forEach((n, j) => { const q = X(ABC[n]), a = M.seg(t, .3 + j * .4, .7 + j * .4, 'outBack'); if (a <= 0) return; c.fillStyle = n === 'Calgary' ? GOLD : CREAM; c.beginPath(); c.arc(q[0], q[1], 13 * SC * Math.min(1, a), 0, 7); c.fill();
    M.text(c, n, q[0] + 22 * SC, q[1], { size: (WIDE ? 40 : 44) * SC, weight: 800, base: 'middle', color: '#fff', stroke: 6, strokeColor: '#06101f', alpha: Math.min(1, a) }); });
  const lp = M.seg(t, 2.2, 3.6, 'inOutCubic'), A = X(ABC.Calgary), B = WIDE ? [W - 140, H * .3] : [W - 160, 420], mid = [(A[0] + B[0]) / 2, Math.min(A[1], B[1]) - 300 * SC];
  if (lp > 0) { c.strokeStyle = ORANGE; c.lineWidth = 6 * SC; c.setLineDash([16 * SC, 10 * SC]); c.beginPath(); for (let u = 0; u <= lp + 1e-6; u += .02) { const uu = Math.min(u, lp), x = (1 - uu) ** 2 * A[0] + 2 * (1 - uu) * uu * mid[0] + uu * uu * B[0], y = (1 - uu) ** 2 * A[1] + 2 * (1 - uu) * uu * mid[1] + uu * uu * B[1]; u ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.setLineDash([]);
    if (lp > .95) { c.fillStyle = ORANGE; c.beginPath(); c.arc(B[0], B[1], 14 * SC, 0, 7); c.fill(); M.text(c, 'London, England', B[0], B[1] + 26 * SC, { size: (WIDE ? 44 : 46) * SC, weight: 800, align: 'right', color: '#fff' }); } }
  M.source(c, 'Schematic map, not to scale · ' + v.src, WIDE ? 60 : 50, WIDE ? H - 60 : 1450, { size: (WIDE ? 22 : 24) * SC, maxW: WIDE ? 1400 : 860 });
}
// money stream from Britain thinning (schematic)
function worldScene(c, t, v, dur) {
  c.fillStyle = '#0b1626'; c.fillRect(0, 0, W, H);
  const A = WIDE ? [W * .8, H * .5] : [W - 220, 760], B = WIDE ? [W * .22, H * .74] : [200, 1180], mid = [(A[0] + B[0]) / 2, Math.min(A[1], B[1]) - 280 * SC];
  const thin = M.seg(t, 1.2, dur - .4, 'inOutSine'), lw = M.lerp(34, 3, thin) * SC;
  const pt = u => [(1 - u) ** 2 * A[0] + 2 * (1 - u) * u * mid[0] + u * u * B[0], (1 - u) ** 2 * A[1] + 2 * (1 - u) * u * mid[1] + u * u * B[1]];
  c.strokeStyle = 'rgba(242,182,50,.85)'; c.lineWidth = lw; c.lineCap = 'round'; c.beginPath(); for (let u = 0; u <= 1; u += .02) { const q = pt(u); u ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } c.stroke();
  const n = Math.round(M.lerp(18, 2, thin)); for (let d = 0; d < n; d++) { const q = pt(fr(t * .3 + d / n)); M.text(c, '$', q[0], q[1], { size: 40 * SC, weight: 900, align: 'center', base: 'middle', color: '#fff', shadow: false }); }
  [[A, 'BRITAIN'], [B, 'WESTERN CANADA']].forEach(([q, lab]) => { c.fillStyle = CREAM; c.beginPath(); c.arc(q[0], q[1], 16 * SC, 0, 7); c.fill(); M.text(c, lab, q[0], q[1] + 30 * SC, { size: (WIDE ? 50 : 52) * SC, weight: 900, align: 'center', color: '#fff' }); });
  const fl = .6 + .4 * Math.sin(t * 9); M.chip(c, 'BALKAN WARS · 1912–13', A[0], A[1] - 110 * SC, { align: 'center', size: (WIDE ? 38 : 42) * SC, bg: RED, color: '#fff', alpha: M.seg(t, .4, .8) * fl });
  M.source(c, 'Schematic · ' + v.src, WIDE ? 60 : 50, WIDE ? H - 60 : 1450, { size: (WIDE ? 22 : 24) * SC, maxW: WIDE ? 1400 : 860 });
}
// oil derrick at Turner Valley (illustration)
function oilScene(c, t, v, dur, i) {
  landscape(c, t, { tod: v.tod || 'day' }, dur, i);
  const gy = H * (WIDE ? .72 + .0 : .62), x = WIDE ? W * .62 : CX + 120 * SC, h = (WIDE ? 420 : 520) * SC, bw = 90 * SC;
  c.strokeStyle = '#2a1e14'; c.lineWidth = 6 * SC; c.beginPath(); c.moveTo(x - bw, gy); c.lineTo(x - 12 * SC, gy - h); c.lineTo(x + 12 * SC, gy - h); c.lineTo(x + bw, gy); c.stroke();
  for (let k = 1; k < 8; k++) { const y = gy - h * k / 8, w2 = M.lerp(bw, 12 * SC, k / 8); c.lineWidth = 3 * SC; c.beginPath(); c.moveTo(x - w2, y); c.lineTo(x + w2, y); c.stroke(); c.beginPath(); c.moveTo(x - w2, y); c.lineTo(x + M.lerp(bw, 12 * SC, (k - 1) / 8), y + h / 8); c.stroke(); }
  c.fillStyle = '#3a2a1c'; c.fillRect(x - 200 * SC, gy - 70 * SC, 120 * SC, 70 * SC);
  const burst = v.burst === false ? 0 : M.seg(t, .8, 1.6, 'outCubic'); if (burst > 0) { const r = M.rng(8); for (let k = 0; k < 160; k++) { const u = fr(t * (.4 + r() * .4) + r()), ang = -Math.PI / 2 + (r() - .5) * .9, d = u * (WIDE ? 420 : 520) * SC * burst; c.fillStyle = `rgba(${200 + 40 * r() | 0},${210 + 30 * r() | 0},${220},${(1 - u) * .55})`; c.beginPath(); c.arc(x + Math.cos(ang) * d + Math.sin(t * 3 + k) * 10, gy - h + Math.sin(ang) * d, (8 + 26 * u) * SC, 0, 7); c.fill(); } }
  const r3 = M.rng(3); for (let k = 0; k < 10; k++) person(c, x - 420 * SC + k * 40 * SC + r3() * 20 * SC, gy + 30 * SC + r3() * 10 * SC, 1.1 * SC, '#1a1410', k % 2 ? 'fedora' : 'bowler', t * 2 + k);
  M.text(c, 'Illustration', WIDE ? W - 60 : W - 140, WIDE ? 120 : 300, { size: 22 * SC, weight: 500, align: 'right', color: '#dfe7f2', alpha: .7, shadow: false });
}
// 1950s line of buyers outside a City land office
function queueScene(c, t, v, dur, i, hook) {
  const tl = v.timelapse ? M.seg(t, 0, dur, 'linear') : 0;
  landscape(c, t, { tod: tl > .7 ? 'dusk' : 'day' }, dur, i);
  const gy = H * (WIDE ? .76 : .64), track = (hook ? M.seg(t, 0, 3.5, 'outCubic') : M.seg(t, 0, dur, 'inOutSine')) * W * .25;
  c.save(); c.translate(-track, 0);
  const ox = W * (WIDE ? .78 : .86); c.fillStyle = '#d8d1c1'; c.fillRect(ox, gy - 210 * SC, 300 * SC, 210 * SC); c.fillStyle = '#5b6573'; c.fillRect(ox - 10 * SC, gy - 226 * SC, 320 * SC, 18 * SC); c.fillStyle = '#2b3442'; c.fillRect(ox + 30 * SC, gy - 120 * SC, 60 * SC, 120 * SC);
  c.fillStyle = 'rgba(140,190,230,.8)'; c.fillRect(ox + 130 * SC, gy - 160 * SC, 120 * SC, 70 * SC);
  M.rr(c, ox + 20 * SC, gy - 300 * SC, 260 * SC, 64 * SC, 8); c.fillStyle = NAVY; c.fill(); M.text(c, 'CITY LOTS', ox + 150 * SC, gy - 268 * SC, { size: 38 * SC, weight: 900, align: 'center', base: 'middle', color: GOLD, shadow: false });
  const r = M.rng(17); for (let k = 0; k < 34; k++) { const x = ox - 40 * SC - k * 58 * SC, y = gy + 8 * SC + (k % 3) * 4 * SC; const col = ['#2b2a33', '#4a3a2a', '#1f2a36', '#3c2a2a'][k % 4];
    person(c, x, y, (1.5 + .1 * r()) * SC, col, k % 2 ? 'fedora' : 'none', Math.sin(t * 1.5 + k) * .3); if (k % 5 === 2) { c.fillStyle = '#7a5a3a'; c.fillRect(x + 16 * SC, y - 30 * SC, 24 * SC, 30 * SC); } }
  c.restore();
  M.text(c, 'Illustration', WIDE ? W - 60 : W - 140, WIDE ? 120 : 300, { size: 22 * SC, weight: 500, align: 'right', color: '#dfe7f2', alpha: .7, shadow: false });
}
// City ledger: unpaid taxes written as assets; 1919 arrears list
function ledgerScene(c, t, v, dur) {
  c.fillStyle = '#1a140e'; c.fillRect(0, 0, W, H);
  const w = WIDE ? 1150 : 900, h = WIDE ? 640 : 1000, x = (W - w) / 2 - (WIDE ? 0 : 30), y = WIDE ? 300 : 420, rot = -.02 + .01 * Math.sin(t * .5);
  c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot); c.translate(-(x + w / 2), -(y + h / 2));
  c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 40; c.fillStyle = '#f1e6c8'; c.fillRect(x, y, w, h); c.shadowBlur = 0;
  c.strokeStyle = 'rgba(80,120,170,.35)'; c.lineWidth = 2; for (let yy = y + 150; yy < y + h - 30; yy += 54) { c.beginPath(); c.moveTo(x + 30, yy); c.lineTo(x + w - 30, yy); c.stroke(); }
  if (v.arrears) {
    M.text(c, 'Illustration', x + w - 20, y + h - 40, { size: 24, weight: 500, align: 'right', color: '#5b6573', shadow: false }); M.text(c, 'TAX ARREARS · 1919', x + w / 2, y + 40, { size: 62 * SC * (WIDE ? 1 : 1.1), weight: 900, align: 'center', color: '#1b1410', shadow: false });
    const r = M.rng(4), scroll = t * 40; for (let k = 0; k < 16; k++) { const yy = y + 150 + k * 54 - (scroll % 54); if (yy < y + 140 || yy > y + h - 60) continue; const hl = k === 7; if (hl) { c.fillStyle = `rgba(242,182,50,${M.seg(t, 1, 1.6)})`; c.fillRect(x + 40, yy - 6, w - 80, 46); }
      if (hl) M.text(c, 'LAKE VIEW HEIGHTS · lots · arrears', x + 60, yy, { size: 32 * SC * (WIDE ? 1 : 1.2), weight: 800, color: '#1b1410', shadow: false }); else { c.fillStyle = 'rgba(30,25,20,.55)'; c.fillRect(x + 60, yy + 10, (w - 200) * (.4 + .5 * r()), 14); } }
  } else {
    M.text(c, 'UNPAID TAXES', x + w * .27, y + 40, { size: 52 * SC * (WIDE ? 1 : 1.15), weight: 900, align: 'center', color: '#1b1410', shadow: false }); M.text(c, 'ASSETS', x + w * .75, y + 40, { size: 52 * SC * (WIDE ? 1 : 1.15), weight: 900, align: 'center', color: '#7a1f1a', shadow: false });
    c.strokeStyle = 'rgba(122,31,26,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + w * .52, y + 30); c.lineTo(x + w * .52, y + h - 30); c.stroke();
    const r = M.rng(9); for (let k = 0; k < 14; k++) { const yy = y + 160 + k * 54, a = M.seg(t, .3 + k * .22, .6 + k * .22); if (a <= 0) continue; c.fillStyle = `rgba(30,25,20,${.6 * a})`; c.fillRect(x + 60, yy + 6, (w * .4) * (.5 + .45 * r()), 14);
      const b = M.seg(t, .6 + k * .22, 1.0 + k * .22); if (b > 0) { c.strokeStyle = `rgba(160,30,26,${b})`; c.lineWidth = 3; c.beginPath(); c.moveTo(x + w * .47, yy + 13); c.lineTo(x + w * .57, yy + 13); c.stroke(); c.fillStyle = `rgba(160,30,26,${.85 * b})`; c.fillRect(x + w * .6, yy + 6, (w * .33) * (.5 + .45 * r()) * b, 14); } }
  }
  c.restore(); if (WIDE) lower(c, t, v, true); else { M.text(c, v.lower, CX, 300, { size: 72, weight: 800, align: 'center', color: '#fff', maxW: 860 }); } chipTop(c, t, v); srcLine(c, v.src);
}
// extra landscape props for Ep 3
function extraLand(c, t, v, dur, i, gy, hz, ink, S0, drift) {
  if (v.village) { for (let k = 0; k < 9; k++) { const x = W * (.12 + k * .085) - drift * .8, y = gy + H * .03 + (k % 2) * 6 * SC; cabin(c, x, y, S0 * (.5 + (k % 3) * .12), ink, false); } c.fillStyle = '#4f86b8'; c.fillRect(0, gy + H * .1, W, 10 * SC); }
  if (v.rails) { c.strokeStyle = '#3a2c1e'; c.lineWidth = 4 * SC; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(W * .5 - drift * .5, gy + 6 * SC); c.lineTo(W * .5 + k * W * .35 - drift, H); c.stroke(); } }
  if (v.hillhouses) { for (let k = 0; k < 5; k++) { const x = W * (.15 + k * .17) - drift * .8, y = gy + H * .02 - k * 10 * SC; house(c, x, y, S0 * .55, ink); } }
  if (v.golf) { c.fillStyle = 'rgba(70,140,60,.75)'; c.beginPath(); c.ellipse(W * .55 - drift, gy + H * .14, W * .5, H * .08, 0, 0, 7); c.fill(); c.fillStyle = '#88c070'; c.beginPath(); c.ellipse(W * .62 - drift, gy + H * .12, W * .09, H * .025, 0, 0, 7); c.fill();
    c.fillStyle = '#eee'; c.fillRect(W * .62 - drift, gy + H * .12 - 120 * SC, 4 * SC, 120 * SC); c.fillStyle = RED; c.beginPath(); c.moveTo(W * .62 - drift + 4 * SC, gy + H * .12 - 120 * SC); for (let k = 0; k <= 5; k++) c.lineTo(W * .62 - drift + 4 * SC + k * 10 * SC, gy + H * .12 - 112 * SC + Math.sin(t * 6 + k) * 5 * SC); c.lineTo(W * .62 - drift + 4 * SC, gy + H * .12 - 96 * SC); c.fill(); }
  if (v.idle) { for (let k = 0; k < 8; k++) { c.fillStyle = ink; c.fillRect(W * (.1 + k * .1) - drift, gy + H * .085, 30 * SC, 6 * SC); } }
  if (v.war) { c.fillStyle = '#3a2c1e'; c.fillRect(0, gy + H * .05, W, 40 * SC); for (let k = 0; k < 14; k++) { person(c, W * (.08 + k * .06) - drift, gy + H * .05, 1.6 * SC, '#0e0b08', 'none', 0); c.fillStyle = '#0e0b08'; c.fillRect(W * (.08 + k * .06) - drift + 8 * SC, gy + H * .05 - 90 * SC, 4 * SC, 40 * SC); } }
  if (v.stake) { const s = THUMB ? 1 : M.seg(t, 0, .35, 'outBack'), x = WIDE ? W * .72 : CX + 210 * SC, y = H * (WIDE ? .9 : .86), drop = (1 - Math.min(1, s)) * -H * .5;
    c.save(); c.translate(x, y + drop); c.rotate(.04); c.fillStyle = '#8a6a44'; c.fillRect(-14 * SC, -330 * SC, 28 * SC, 330 * SC); c.fillStyle = '#6b5032'; c.fillRect(-14 * SC, -330 * SC, 8 * SC, 330 * SC);
    c.translate(16 * SC, -300 * SC); c.rotate(Math.sin(t * 5) * .12); M.rr(c, 0, 0, 170 * SC, 80 * SC, 8); c.fillStyle = RED; c.fill(); M.text(c, 'SOLD', 85 * SC, 40 * SC, { size: 50 * SC, weight: 900, align: 'center', base: 'middle', color: '#fff', shadow: false }); c.restore(); }
}


// ---------- today's Calgary in 3D (geo pack) ----------
const STEPHEN = M.geo.lm('Stephen Avenue') || M.geo.lm('Olympic Plaza') || [300, -80, 0];
function city(c, t, v, dur) {
  const tod = v.tod || 'dusk', night = tod === 'night', dusk = tod === 'dusk';
  const cols = night ? { land: '#121821', park: '#16221a', water: '#14304f', building: '#283140', road: '#454a54', motorway: '#6f6044' } : dusk ? { land: '#34363c', park: '#2c3a31', water: '#2c5378', building: '#596170', road: '#7d7466', motorway: '#b8904e' } : { land: '#c9c3b2', park: '#9fb27c', water: '#5d8fbf', building: '#d8d4cb', road: '#a59f92', motorway: '#c9a35b' };
  const w = M.world({ sky: night ? 'night' : (dusk || tod === 'dawn') ? 'dusk' : 'day', fog: { near: 1500, far: 11000 } });
  M.geo.addBase(w, { buildings: true, windows: night || dusk ? '#ffd27a' : '#fff', windowAlpha: night ? .6 : dusk ? .45 : .2, colors: cols });
  const p = M.seg(t, 0, dur, 'inOutSine'), d = M.drift(t, 5); let cam;
  if (v.shot === 'drone') cam = { pos: M.mix([-5200, -5600, 1300], [-2300, -2600, 650], p), look: M.mix([-600, -300, 0], [0, 0, 60], p) };
  else cam = M.moves.orbit(STEPHEN, WIDE ? 900 : 700, 300, 220, 40, M.seg(t, 0, dur, 'linear'));
  cam.pos = cam.pos.map((x, k) => x + d[k]); cam.fov = WIDE ? 44 : 60;
  if (v.shot === 'stephen') { M.pin(w, STEPHEN, 'Stephen Avenue', { p: M.seg(t, .6, 1.4, 'linear') }); M.ping(w, STEPHEN, t); }
  w.render(c, M.camera(cam, W, H));
}
function hookScene(c, t, v, dur, i) {
  const bg = v.bg;
  if (bg === 'plat') platScene(c, t, v, dur, i, true);
  else if (bg === 'office') townScene(c, t, { office: true, tod: 'night' }, dur, i);
  else if (bg === 'queue') queueScene(c, t, v, dur, i, true);
  else landscape(c, t + 2, v, dur, i);
  c.fillStyle = 'rgba(6,14,28,.22)'; c.fillRect(0, 0, W, H);
  const hs = (THUMB === 'wide' ? 112 / SC : WIDE ? 124 : 136) * SC, y = WIDE ? H * .14 : 340;
  const wds = v.hook.split(' ').length; if (!WIDE || THUMB) { const g = c.createLinearGradient(0, y - 60 * SC, 0, y + hs * 2.6); g.addColorStop(0, 'rgba(6,14,28,.75)'); g.addColorStop(1, 'rgba(6,14,28,0)'); c.fillStyle = g; c.fillRect(0, y - 60 * SC, W, hs * 2.8); }
  M.kinetic(c, v.hook, THUMB ? 9 : t, CX, y, { t0: -.12, size: hs, maxW: (WIDE ? 1500 : 860) * SC, every: .14, highlight: v.hi || [], lh: 1.04 });
  if (v.chip && t > (THUMB ? 0 : 1.1)) M.chip(c, v.chip, CX, y - (WIDE ? 70 : 80) * SC, { align: 'center', size: (WIDE ? 40 : 48) * SC, alpha: THUMB ? 1 : M.seg(t, 1.1, 1.4) });
}
function chapterCard(c, t, v, dur, i) {
  townScene(c, t, { tod: 'day' }, dur, i); c.fillStyle = 'rgba(6,14,28,.45)'; c.fillRect(0, 0, W, H);
  const a = M.seg(t, .2, .8, 'outCubic'), y = WIDE ? H * .3 : 520; c.save(); c.globalAlpha = a;
  M.text(c, 'CALGARY ORIGINS · EPISODE 3', CX, y, { size: (WIDE ? 40 : 46) * SC, weight: 700, align: 'center', color: GOLD, tracking: .14 });
  M.text(c, 'Boom and bust', CX, y + 70 * SC, { size: (WIDE ? 140 : 130) * SC, weight: 800, align: 'center', color: '#fff', maxW: WIDE ? 1600 : 860 });
  M.chip(c, `PART 1 OF 4 · ${CH_TITLES[1].toUpperCase()}`, CX, y + (WIDE ? 250 : 380) * SC, { align: 'center', size: (WIDE ? 36 : 40) * SC }); c.restore();
}
function qBackground(c, t, v, dur, i) {
  if (v.bg === 'town') townScene(c, t, { tod: v.tod || 'dusk', empty: v.tod === 'storm' }, dur, i);
  else if (v.bg === 'map') citymap(c, t, { comms: ['PARKDALE', 'BOWNESS', 'KILLARNEY/GLENGARRY', 'HIGHWOOD', 'SPRUCE CLIFF', 'CAMBRIAN HEIGHTS', 'ELBOW PARK', 'UPPER MOUNT ROYAL'], limits: true, dim: true }, dur);
  else landscape(c, t, { tod: v.tod || 'dusk' }, dur, i);
}
function questionScene(c, t, v, dur, i, last) {
  qBackground(c, t, v, dur, i); c.fillStyle = v.bg === 'map' ? 'rgba(6,14,28,.84)' : 'rgba(6,14,28,.66)'; c.fillRect(0, 0, W, H);
  const y = WIDE ? H * .24 : 480; if (v.sub) M.text(c, v.sub, CX, y - 90 * SC, { size: (WIDE ? 44 : 50) * SC, weight: 600, align: 'center', color: '#dfe7f2', maxW: WIDE ? 1500 : 860, alpha: M.seg(t, .2, .6) });
  M.kinetic(c, v.q, t, CX, y, { t0: 0, size: (WIDE ? 104 : 110) * SC, maxW: (WIDE ? 1500 : 860) * SC, every: .08, highlight: v.hi || [] });
  M.text(c, 'Drop your thoughts below 👇', CX, WIDE ? H * .66 : 1080, { size: (WIDE ? 56 : 60) * SC, weight: 700, align: 'center', color: GOLD, alpha: M.seg(t, .6, 1) });
  M.text(c, 'calgaryinsight.ca', CX, WIDE ? H * .76 : 1180, { size: (WIDE ? 40 : 44) * SC, weight: 600, align: 'center', color: '#fff', alpha: M.seg(t, .8, 1.2) });
  if (PART) M.chip(c, '▶ Full film on YouTube', CX, WIDE ? H * .86 : 1290, { align: 'center', size: (WIDE ? 36 : 48) * SC, bg: '#e62117', color: '#fff', alpha: M.seg(t, 1, 1.4) });
}
function fullFilmScene(c, t, v, dur, i) {
  townScene(c, t, { tod: 'dusk' }, dur, i); c.fillStyle = 'rgba(6,14,28,.7)'; c.fillRect(0, 0, W, H);
  const a = M.seg(t, .1, .5, 'outCubic'); c.save(); c.globalAlpha = a; const y = WIDE ? H * .3 : 520;
  M.chip(c, `PART ${PART} OF 4 · ${CH_TITLES[PART].toUpperCase()}`, CX, y - 80 * SC, { align: 'center', size: (WIDE ? 36 : 48) * SC });
  M.text(c, '▶ The full film', CX, y + 20 * SC, { size: (WIDE ? 110 : 116) * SC, weight: 800, align: 'center', color: '#fff', maxW: WIDE ? 1500 : 860 });
  M.text(c, 'on our YouTube channel', CX, y + (WIDE ? 160 : 170) * SC, { size: (WIDE ? 56 : 60) * SC, weight: 700, align: 'center', color: GOLD, maxW: WIDE ? 1500 : 860 });
  if (PART < 4) M.text(c, `Next: Part ${PART + 1} · ${CH_TITLES[PART + 1]}`, CX, y + (WIDE ? 260 : 290) * SC, { size: (WIDE ? 44 : 50) * SC, weight: 600, align: 'center', color: '#dfe7f2', maxW: WIDE ? 1500 : 860 });
  c.restore();
}
function originsHeader(c) { if (!window.LOGO) return; c.save();
  if (!WIDE) { const s = 70; c.font = M.font(40, 700); const a = c.measureText('Calgary Insight ').width; c.font = M.font(40, 800); const b = c.measureText('ORIGINS').width; const x = CX - (s + 18 + a + b) / 2;
    c.drawImage(window.LOGO, x, 140, s, s); M.text(c, 'Calgary Insight', x + s + 18, 140 + s / 2, { size: 40, base: 'middle', weight: 700, shadow: 8 }); M.text(c, 'ORIGINS', x + s + 18 + a, 140 + s / 2, { size: 40, base: 'middle', weight: 800, color: ORANGE, shadow: 8 }); }
  else { c.drawImage(window.LOGO, 48, 40, 60, 60); c.font = M.font(30, 700); const a = c.measureText('Calgary Insight ').width; M.text(c, 'Calgary Insight', 124, 70, { size: 30, base: 'middle', weight: 700, shadow: 8 }); M.text(c, 'ORIGINS', 124 + a, 70, { size: 30, base: 'middle', weight: 800, color: ORANGE, shadow: 8 }); }
  c.restore(); }
function thumbBrand(c) { if (!window.LOGO) return; const s = WIDE ? 64 : 84, x = WIDE ? 40 : 60, y = WIDE ? H - s - 30 : 1490; c.drawImage(window.LOGO, x, y, s, s);
  c.font = M.font(WIDE ? 32 : 40, 700); const a = c.measureText('Calgary Insight ').width; M.text(c, 'Calgary Insight', x + s + 16, y + s / 2, { size: WIDE ? 32 : 40, base: 'middle', weight: 700 }); M.text(c, 'ORIGINS', x + s + 16 + a, y + s / 2, { size: WIDE ? 32 : 40, base: 'middle', weight: 800, color: ORANGE }); }

// ---------- assemble scenes ----------
const NL = sc.length;
const scenes = sc.map((s, k) => {
  const isEnd = HAS_END && k === NL - 1, l = isEnd ? null : LINES[k], v = l ? l.v : {};
  let trans = { kind: 'dissolve', dur: .6 };
  const nx = LINES[k + 1], nv = nx ? nx.v : {};
  if (nv.kind === 'hook') trans = { kind: 'dissolve', dur: .9 };
  else if (v.kind === 'hook') trans = { kind: 'whip', dur: .4 };
  else if (nv.kind === 'citymap' && v.kind !== 'citymap') trans = { kind: 'zoom', dur: .5 };
  else if (nv.kind === 'citymap' && v.kind === 'citymap') trans = { kind: 'match', dur: .5 };
  else if (nv.kind === 'bars' && v.kind === 'bars') trans = { kind: 'match', dur: .35 };
  else if (nv.kind === 'stats' || nv.kind === 'bars') trans = { kind: 'whip', dur: .4 };
  else if (nv.fall || (nv.kind === 'town' && nv.stalled)) trans = { kind: 'flash', dur: .4 };
  else if (nv.kind === 'doc' || nv.kind === 'ledger') trans = { kind: 'push', dur: .45 };
  else if (nv.kind === 'question' || nv.kind === 'fullfilm') trans = { kind: 'dissolve', dur: .5 };
  return { dur: s.sceneDur, trans: k === NL - 1 ? null : trans, draw: (c, t) => {
    if (isEnd) return endCard(c, t, s.sceneDur);
    const d = s.sceneDur;
    switch (v.kind) {
      case 'hook': hookScene(c, t, v, d, k); break;
      case 'city': city(c, t, v, d); lower(c, t, v); M.source(c, OSM, WIDE ? 60 : 50, WIDE ? H - 60 : 1450, { size: (WIDE ? 20 : 22) * SC, maxW: WIDE ? 1200 : 860 }); break;
      case 'chapter': chapterCard(c, t, v, d, k); break;
      case 'land': landscape(c, t, v, d, k); lower(c, t, v); break;
      case 'town': townScene(c, t, v, d, k); lower(c, t, v); break;
      case 'timeline': timelineScene(c, t, v, d, k); break;
      case 'doc': townScene(c, t, { tod: 'night', empty: true }, d, k); c.fillStyle = 'rgba(6,14,28,.6)'; c.fillRect(0, 0, W, H); docCard(c, t, v); break;
      case 'stats': if (v.bg === 'town') townScene(c, t, { tod: 'dusk' }, d, k); else if (v.bg === 'plat') platScene(c, t, {}, d, k); else if (v.bg === 'oil') oilScene(c, t, { burst: true }, d, k); else landscape(c, t, { tod: v.bg === 'storm' ? 'storm' : 'dusk' }, d, k);
        c.fillStyle = 'rgba(6,14,28,.5)'; c.fillRect(0, 0, W, H); stats(c, t, v, d); srcLine(c, v.src); break;
      case 'name': if (v.bg === 'town') { townScene(c, t, { tod: v.tod || 'day' }, d, k); nameScene(c, t, Object.assign({}, v, { bg: 'none-drawn' }), d, k); } else nameScene(c, t, v, d, k); break;
      case 'price': priceScene(c, t, v, d, k); break;
      case 'bars': barsScene(c, t, v, d, k); break;
      case 'citymap': citymap(c, t, v, d); lower(c, t, v, true); break;
      case 'plat': platScene(c, t, v, d, k); lower(c, t, v); break;
      case 'arrivals': arrivalsScene(c, t, v, d); break;
      case 'offices': officesScene(c, t, v, d); break;
      case 'world': worldScene(c, t, v, d); lower(c, t, v, true); break;
      case 'oil': oilScene(c, t, v, d, k); lower(c, t, v); break;
      case 'queue': queueScene(c, t, Object.assign({ timelapse: true }, v), d, k); lower(c, t, v); break;
      case 'ledger': ledgerScene(c, t, v, d); break;
      case 'question': questionScene(c, t, v, d, k); break;
      case 'fullfilm': fullFilmScene(c, t, v, d, k); break;
    }
    if (v.kind !== 'ledger') chipTop(c, t, v);
  } };
});

const startOf = idx => sc[idx].sceneStart;
const chStarts = {}; LINES.forEach((l, k) => { if (chStarts[l.ch] == null) chStarts[l.ch] = startOf(k); });
const ENDSTART = HAS_END ? sc[NL - 1].sceneStart : 1e9;
const QSTART = PART ? sc[NL - 1].sceneStart : 1e9;

if (THUMB) {
  const ch = PART || 1, hk = EP.lines[EP.partLines[ch][0]];
  const tv = THUMB === 'wide' ? Object.assign({}, hk.v, { hook: EP.thumbText.film, hi: ['empty', 'prairie'], chip: null }) : Object.assign({}, hk.v, { hook: EP.thumbText[ch], chip: null });
  window.FILM = M.film({ W, H, identity: 'storyteller', finish: true, scenes: [{ dur: 1, draw: (c, t) => { hookScene(c, 2.4, tv, 6, 0); if (THUMB === 'wide') { /* a 1912 street behind the stake */ } } }],
    overlay: (c) => { thumbBrand(c); M.chip(c, THUMB === 'wide' ? 'CALGARY ORIGINS · BOOM AND BUST' : `PART ${ch} OF 4 · CALGARY ORIGINS`, WIDE ? W - 40 : CX, WIDE ? H - 70 : 1400, { align: WIDE ? 'right' : 'center', size: WIDE ? 30 : 48 }); } });
} else {
  window.FILM = M.film({ W, H, identity: 'storyteller', scenes,
    overlay: (c, t) => {
      if (t < ENDSTART && t < QSTART) {
        const sinceCh = Math.min(...Object.values(chStarts).filter(x => x <= t + 1e-6).map(x => t - x));
        if (t > 3 && !(sinceCh < 2.6)) originsHeader(c);
        if (PART && t > 3) M.chip(c, `PART ${PART} OF 4`, WIDE ? 60 : 50, WIDE ? 40 : 222, { size: WIDE ? 34 : 48, bg: GOLD, color: NAVY });
        if (!PART) Object.entries(chStarts).forEach(([ch, st]) => { const a = M.seg(t, st + 2.8, st + 3.2) * (1 - M.seg(t, st + 7, st + 7.5)); if (a > 0 && WIDE) M.chip(c, `PART ${ch} OF 4 · ${CH_TITLES[ch].toUpperCase()}`, W - 60, 40, { align: 'right', size: 30, alpha: a }); });
        const half = (PART ? QSTART : ENDSTART) / 2; M.followPill(c, (t - half) / 2.2, W, H);
      }
      M.caption(c, capAt(t), W, H, { size: WIDE ? 40 : 46 });
    } });
}

// ---------- effects cue sheet ----------
window.CUES = [];
sc.forEach((s, k) => {
  const isEnd = HAS_END && k === NL - 1, v = isEnd ? {} : LINES[k].v, st = s.sceneStart, d = s.sceneDur;
  if (v.kind === 'hook') { window.CUES.push({ t: Math.max(0, st), sfx: 'impact', gain: -5 }); if (v.bg === 'plat') window.CUES.push({ t: st + .6, sfx: 'stamp', gain: -10 }); if (v.bg === 'office') window.CUES.push({ t: st + .4, sfx: 'click', gain: -14 }, { t: st + 1.2, sfx: 'click', gain: -14 }, { t: st + 2, sfx: 'click', gain: -14 }); }
  if (v.kind === 'land' || v.kind === 'name' || v.kind === 'chapter' || v.kind === 'question' || v.kind === 'plat') window.CUES.push({ t: st, sfx: 'wind', dur: d, gain: -25 });
  if (v.kind === 'town' || v.kind === 'queue' || v.kind === 'chapter') window.CUES.push({ t: st, sfx: 'crowd_murmur', dur: d, gain: -26 });
  if (v.kind === 'city') window.CUES.push({ t: st, sfx: 'city', dur: d, gain: -24 });
  if (v.kind === 'town' && v.tod === 'storm') window.CUES.push({ t: st, sfx: 'rain', dur: d, gain: -22 });
  if (v.kind === 'stats') v.items.forEach((_, j) => { window.CUES.push({ t: st + .3 + j * .7, sfx: 'ticks', dur: 1.0, gain: -18 }); window.CUES.push({ t: st + .3 + j * .7, sfx: 'impact', gain: -11 }); });
  if (v.kind === 'bars' && !v.taxes) { window.CUES.push({ t: st + .15, sfx: 'riser', dur: 1.1, gain: -18 }); if (v.record && !v.crack) window.CUES.push({ t: st + 1.3, sfx: 'stamp', gain: -8 }); if (v.fall) window.CUES.push({ t: st + 1.2, sfx: 'boom', gain: -10 }); if (v.crack) window.CUES.push({ t: st + .6, sfx: 'thud', gain: -12 }); }
  if (v.kind === 'price') window.CUES.push({ t: st + d * .38, sfx: 'whoosh', gain: -12 }, { t: st + d * .38 + .5, sfx: 'impact', gain: -10 });
  if (v.kind === 'doc' || v.kind === 'ledger') window.CUES.push({ t: st + .1, sfx: 'shutter', gain: -16 }, { t: st + .6, sfx: 'click', gain: -16 });
  if (v.kind === 'citymap') { window.CUES.push({ t: st + .3, sfx: 'ping', gain: -18 }); (v.comms || []).forEach((_, j) => window.CUES.push({ t: st + .3 + j * .25, sfx: 'pop', gain: -16 })); }
  if (v.kind === 'oil') window.CUES.push({ t: st + .8, sfx: 'boom', gain: -10 }, { t: st + .9, sfx: 'crowd_murmur', dur: d - 1, gain: -20 });
  if (v.kind === 'offices' || v.kind === 'arrivals') window.CUES.push({ t: st + .3, sfx: 'pop', gain: -15 }, { t: st + 2.2, sfx: 'whoosh', gain: -16 });
  if (v.chip && v.kind !== 'hook') window.CUES.push({ t: st + .35, sfx: 'click', gain: -20 });
  if (v.kind === 'question' || v.kind === 'fullfilm') window.CUES.push({ t: st, sfx: 'swell', dur: 2, gain: -14 });
  if (isEnd) window.CUES.push({ t: st + 1.6, sfx: 'click', gain: -10 }, { t: st, sfx: 'swell', dur: 2.5, gain: -12 });
  const tr = scenes[k].trans; if (tr && tr.kind === 'whip') window.CUES.push({ t: st + d - .25, sfx: 'whoosh', gain: -12 }); if (tr && tr.kind === 'flash') window.CUES.push({ t: st + d - .2, sfx: 'boom', gain: -10 });
});
window.CUES.sort((a, b) => a.t - b.t);
