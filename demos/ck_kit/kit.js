/* CRICKET KAHANI scene kit — shared drawing helpers for the channel's vertical Shorts (1080x1920).
   An episode page loads the studio engine, this file and its own scenes.js, which defines
   CAP_R / CAP_E (captions), DRAW_FN (one function per shot), window.drawCover, then calls ckBoot().
   The helpers in the first block come from episode 1 (ck_shoaib) and episode 2 (ck_sachin_waqar).
   Every episode still writes its own scenes: the kit only holds the reusable parts (pitch, crowd, boards, end card). */
window.PAGE_READY = false; stage(1080, 1920);
let TL; const LOGO = new Image(); LOGO.src = '../../channels/cricketkahani/logo_badge.png';
const G = '#0E3B2C', G2 = '#114535', G3 = '#1B5644', TAN = '#D8BC85', CR = '#F4ECD8', RED = '#B3202A', DRED = '#7E1219', AMB = '#FFB703';
const INK = 'rgba(5,24,17,0.9)', WHITE = '#f4f1e8', GRASS = '#2f7d46', GRASS2 = '#2a7340', PITCH = '#d9c08a';
const AF = s => `400 ${s}px Anton`, IF = (w, s) => `${w} ${s}px InterV`;

/* ---------- from episodes 1 and 2 ---------- */
function stripes(off = 0, hz = false) { C.fillStyle = G; C.fillRect(0, 0, 1080, 1920); C.fillStyle = G2;
  if (hz) { for (let x = -360 + ((off % 360) + 360) % 360; x < 1080; x += 360) C.fillRect(x, 0, 180, 1920); }
  else { for (let y = -360 + ((off % 360) + 360) % 360; y < 1920; y += 360) C.fillRect(0, y, 1080, 180); } }
function seamPath(sx) { C.beginPath(); C.moveTo(sx * -8, -46); C.bezierCurveTo(sx * -17, -20, sx * -17, 20, sx * -8, 46); }
function ball(x, y, r, { rot = 0, a = 1, col = RED, seam = CR } = {}) { withT(() => { const k = 1 / 48; C.save(); C.scale(r * k, r * k);
  circle(0, 0, 48); fillPath(col); C.save(); circle(0, 0, 48); C.clip();
  for (const sx of [1, -1]) { seamPath(sx); C.strokeStyle = shade(col, -0.3); C.lineWidth = 1.6; C.stroke();
    C.save(); C.translate(sx * -2.6, 0); seamPath(sx); C.setLineDash([1.4, 2.4]); C.lineCap = 'round'; C.strokeStyle = seam; C.lineWidth = 1.8; C.stroke(); C.restore(); }
  C.restore(); C.restore(); }, { x, y, r: rot, a }); }
function logo(x, y, r) { C.drawImage(LOGO, x - r, y - r, 2 * r, 2 * r); }
function header(a = 1) { if (a <= 0) return; C.save(); C.globalAlpha = a; C.font = AF(46); const w = C.measureText('CRICKET KAHANI').width + 16 + 64; const x0 = 540 - w / 2;
  logo(x0 + 32, 168, 38); text('CRICKET KAHANI', x0 + 80, 170, { font: AF(46), fill: CR, align: 'left', ls: 2, shadow: 'rgba(0,0,0,0.45)' }); C.restore(); }
function wrap(str, font, maxW) { C.font = font; const words = str.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (C.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur); return lines; }
function captionText(r, e, t, d) { const a = clamp(t * 5) * clamp((d - t) * 5); if (a <= 0) return;
  const fr = IF(800, 44), fe = IF(500, 28); const L1 = wrap(r, fr, 900), L2 = wrap(e, fe, 900);
  const h = L1.length * 54 + 12 + L2.length * 36 + 40; const y0 = 1500 - h;
  C.save(); C.globalAlpha = a; rr(60, y0, 960, h, 22); fillPath('rgba(5,24,17,0.80)');
  L1.forEach((l, k) => text(l, 540, y0 + 20 + 27 + k * 54, { font: fr, fill: '#fff' }));
  L2.forEach((l, k) => text(l, 540, y0 + 20 + L1.length * 54 + 12 + 18 + k * 36, { font: fe, fill: TAN })); C.restore(); }
function caption(i, t, d) { captionText(CAP_R[i], CAP_E[i], t, d); }
function chip(str, x, y, { bg = RED, fg = '#fff', font = IF(800, 30), a = 1, padX = 26, h = 60 } = {}) { if (a <= 0) return 0; C.save(); C.globalAlpha = a; C.font = font; const w = C.measureText(str).width + padX * 2; rr(x - w / 2, y - h / 2, w, h, h / 2); fillPath(bg); text(str, x, y + 1, { font, fill: fg }); C.restore(); return w; }
function nightSky(col = '#071d16') { C.fillStyle = col; C.fillRect(0, 0, 1080, 1920); }
function floodlight(x, y, s, t, on = 1) { withT(() => { C.fillStyle = G3; C.fillRect(-8, 60, 16, 520); rr(-90, -10, 180, 100, 10); fillPath(G3);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { rr(-78 + c * 41, 2 + r * 42, 32, 32, 5); fillPath(on > 0.5 ? CR : '#3b5a4e'); } }, { x, y, s });
  if (on > 0.5) FX.glow(x, y + 40 * s, 260 * s, '255,240,200', 0.35 * on); }
function crowd(y0, rows, t, seed = 1) { for (let r = 0; r < rows; r++) for (let i = 0; i < 26; i++) { const x = i * 44 + (r % 2) * 22 + hash(i + r * 31 + seed) * 10; const bob = Math.sin(t * 6 + i * 1.7 + r) * 3 * (hash(i * 7 + r) > 0.6 ? 1 : 0);
  circle(x, y0 + r * 40 + bob, 15); C.fillStyle = r % 2 ? '#0b2a20' : '#0d3226'; C.fill(); rr(x - 17, y0 + r * 40 + 12 + bob, 34, 30, 10); C.fill(); } }
function bat(x, y, ang, s = 1) { withT(() => { rr(-6, -70, 12, 72, 5); fillPath('#2b2b2b'); rr(-17, 0, 34, 150, 8); fillPath('#e8d2a0', '#8a6a3a', 3); }, { x, y, r: ang, s }); }
function stamp(str, x, y, t, t0, { col = RED, size = 120, r = -0.12, bg = null } = {}) { const k = t - t0; if (k < 0) return; const s = 1 + 1.6 * (1 - ease('expoOut', k / 0.35));
  withT(() => { C.font = AF(size); const w = C.measureText(str).width + 60; rr(-w / 2, -size * 0.72, w, size * 1.4, 18); fillPath(bg, col, 10); text(str, 0, 6, { font: AF(size), fill: col }); }, { x, y, s, r, a: clamp(k / 0.15) }); }
function daySky(top = '#9fd0e6', bot = '#f1e2bf') { C.fillStyle = grad(0, 0, 0, 1000, [[0, top], [1, bot]]); C.fillRect(0, 0, 1080, 1920); }
function dayCrowd(y0, rows, t, seed = 1, fill = 1, P = ['#c9a27a', '#7a5a3a', '#e8e1d0', '#3b6b8a', '#9b3a3a', '#2e6b3f', '#d9c27a']) {
  C.fillStyle = '#5d6b63'; C.fillRect(0, y0 - 30, 1080, rows * 40 + 40);
  for (let r = 0; r < rows; r++) for (let i = 0; i < 26; i++) { if (hash(i * 13 + r * 5 + seed * 3) > fill) continue; const x = i * 44 + (r % 2) * 22 + hash(i + r * 31 + seed) * 10; const bob = Math.sin(t * 6 + i * 1.7 + r) * 3 * (hash(i * 7 + r) > 0.6 ? 1 : 0);
    circle(x, y0 + r * 40 + bob, 13); C.fillStyle = '#8a5a3a'; C.fill(); rr(x - 16, y0 + r * 40 + 11 + bob, 32, 28, 10); C.fillStyle = P[(hash(i * 3 + r * 11 + seed) * P.length) | 0]; C.fill(); } }
function field(gy = 1180, top = 850) { C.fillStyle = GRASS; C.fillRect(0, top, 1080, 1920 - top); for (let i = 0; i < 8; i++) { C.fillStyle = i % 2 ? GRASS : GRASS2; C.fillRect(0, top + i * 60, 1080, 60); }
  C.beginPath(); C.moveTo(0, gy); C.lineTo(1080, gy); C.lineTo(1080, gy + 120); C.lineTo(0, gy + 120); fillPath(PITCH); }
function stumps(t, hitT = 1e9, x0 = 808, gy = 1180, s = 1) { const u = t - hitT;
  for (let k = 0; k < 3; k++) { const tilt = u > 0 && k === 1 ? Math.min(0.28, u * 1.4) : 0; withT(() => { rr(-8 * s, -300 * s, 16 * s, 300 * s, 5); fillPath(CR); }, { x: x0 + k * 34 * s, y: gy, r: tilt }); }
  if (u < 0) { rr(x0 - 12 * s, gy - 308 * s, 54 * s, 9 * s, 4); fillPath(RED); rr(x0 + 44 * s, gy - 308 * s, 54 * s, 9 * s, 4); fillPath(RED); }
  else for (const j of [0, 1]) { const dir = j ? 1 : -1; const x = x0 + 15 * s + j * 56 * s + dir * 260 * u, y = gy - 304 * s - 700 * u + 1500 * u * u; if (y < gy + 70) withT(() => { rr(-27 * s, -4.5 * s, 54 * s, 9 * s, 4); fillPath(RED); }, { x, y, r: u * 14 * dir }); } }
function plate(title, sub, col, y, k, x = 540) { if (k <= 0) return; withT(() => { C.font = AF(64); const w = Math.max(600, C.measureText(title).width + 90); rr(-w / 2, -72, w, 144, 18); fillPath(INK, col, 6);
  text(title, 0, -16, { font: AF(64), fill: CR }); text(sub, 0, 40, { font: IF(800, 28), fill: AMB, ls: 2 }); }, { x, y, s: k }); }
function bubble(str, x, y, k, { size = 96, tailX = -200, tailY = 200, bg = CR, fg = RED, lines = null } = {}) { if (k <= 0) return;
  withT(() => { C.font = AF(size); const L = lines || [str]; const w = Math.max(...L.map(l => C.measureText(l).width)) + 110, h = size * (0.6 + 1.05 * L.length);
    C.beginPath(); C.moveTo(-60, h / 2 - 6); C.lineTo(tailX, tailY); C.lineTo(20, h / 2 - 6); C.closePath(); fillPath(bg, G, 8);
    rr(-w / 2, -h / 2, w, h, Math.min(h / 2, 70)); fillPath(bg, G, 8); C.beginPath(); C.moveTo(-58, h / 2 - 10); C.lineTo(18, h / 2 - 10); C.strokeStyle = bg; C.lineWidth = 14; C.stroke();
    L.forEach((l, i) => text(l, 0, 6 + (i - (L.length - 1) / 2) * size * 1.05, { font: AF(size), fill: fg })); }, { x, y, s: k }); }
function battingPose(t, swing = 0, beaten = 0, yaw = -1.25) { const p = MOVES.idle(t, { seed: 3 }); p.yaw = yaw; p.legL.kn = p.legR.kn = 0.35; p.handL = p.handR = 'fist';
  p.lean = 0.12 + 0.16 * swing + 0.1 * beaten; p.legR.sw = -0.45 * swing; p.armL.sw = p.armR.sw = 0.55 + 0.45 * swing; p.armL.el = p.armR.el = 0.9; return p; }
function count(v, k) { return Math.round(v * ease('out', clamp(k))).toLocaleString('en-US'); }

/* ---------- kit: general ---------- */
const pop = (t, t0, d = 0.45) => t <= t0 ? 0 : ease('back', (t - t0) / d);
const fade = (t, t0, d = 0.33) => clamp((t - t0) / d);
function tint(col) { C.fillStyle = col; C.fillRect(0, 0, 1080, 1920); }
function flash(t, t0, d = 0.25, col = '255,255,240', a = 0.7) { const u = t - t0; if (u > 0 && u < d) tint(`rgba(${col},${a * (1 - u / d)})`); }
function shake(t, t0, d, amt, fn) { const u = t - t0; const sh = u > 0 && u < d ? (1 - u / d) * amt : 0; C.save(); C.translate((hash(t * 99 | 0) - 0.5) * sh, (hash(t * 77 | 0) - 0.5) * sh); fn(); C.restore(); }
function box(x, y, w, h, { bg = INK, stroke = null, lw = 6, r = 22 } = {}) { rr(x - w / 2, y - h / 2, w, h, r); fillPath(bg, stroke, lw); }
function card(k, x, y, w, h, fn, o = {}) { if (k <= 0) return; withT(() => { box(0, 0, w, h, o); fn(); }, { x, y, s: k }); }
function bigNum(str, x, y, k, { size = 240, col = AMB, label = '', lcol = CR, lsize = 34 } = {}) { if (k <= 0) return; withT(() => { text(str, 0, 0, { font: AF(size), fill: col, shadow: 'rgba(0,0,0,0.35)' }); if (label) text(label, 0, size * 0.56, { font: IF(800, lsize), fill: lcol, ls: 3 }); }, { x, y, s: k }); }
function title2(a, b, y, t, t0, { sa = 96, sb = 120, ca = CR, cb = AMB, gap = 105 } = {}) { text(a, 540, y, { font: AF(sa), fill: ca, a: fade(t, t0) }); text(b, 540, y + gap, { font: AF(sb), fill: cb, a: fade(t, t0 + 0.25) }); }
function dateCard(big, l1, l2, t, { y = 330, t0 = 0.3, t1 = 1.1, size = 120, w = 0 } = {}) { const k1 = pop(t, t0, 0.5), k2 = pop(t, t1, 0.5);
  if (k1 > 0) withT(() => { C.font = AF(size); const ww = w || C.measureText(big).width + 110; rr(-ww / 2, -95, ww, 190, 24); fillPath(CR, G, 6); text(big, 0, 8, { font: AF(size), fill: G }); }, { x: 540, y, s: k1 });
  if (k2 > 0) withT(() => { C.font = IF(800, 38); const ww = Math.max(C.measureText(l1).width, 500) + 90; rr(-ww / 2, -60, ww, l2 ? 120 : 84, 18); fillPath('rgba(5,24,17,0.88)'); text(l1, 0, l2 ? -12 : 2, { font: IF(800, 38), fill: CR, ls: 2 }); if (l2) text(l2, 0, 36, { font: IF(700, 28), fill: TAN, ls: 3 }); }, { x: 540, y: y + 170, s: k2 }); }
function vsChips(a, ca, b, cb, y, k, { fa = '#fff', fb = '#fff', font = AF(52), mid = G } = {}) { if (k <= 0) return; withT(() => { C.font = font; const wa = C.measureText(a).width + 68, wb = C.measureText(b).width + 68;
  chip(a, -44 - wa / 2, 0, { bg: ca, fg: fa, font, h: 86, padX: 34 }); text('vs', 0, 2, { font: AF(46), fill: mid }); chip(b, 44 + wb / 2, 0, { bg: cb, fg: fb, font, h: 86, padX: 34 }); }, { x: 540, y, s: k }); }
/* scoreboard: rows = [[label, value, {col, t0}]] */
function board(title, rows, t, t0, { x = 540, y = 520, w = 860, rowH = 104, tcol = AMB, step = 0.35, vsize = 64 } = {}) { const k = pop(t, t0, 0.5); if (k <= 0) return; const h = 96 + rows.length * rowH + 20;
  withT(() => { rr(-w / 2, 0, w, h, 26); fillPath('#0b1410', '#2a3a33', 8); rr(-w / 2 + 14, 14, w - 28, 72, 14); fillPath('#16241d'); text(title, 0, 52, { font: IF(800, 34), fill: tcol, ls: 4 });
    rows.forEach(([lab, val, o = {}], i) => { const tt = o.t0 ?? t0 + 0.4 + i * step; const a = fade(t, tt, 0.25); if (a <= 0) return; const yy = 96 + i * rowH + rowH / 2;
      C.globalAlpha = a; if (i) { C.fillStyle = '#22322b'; C.fillRect(-w / 2 + 30, 96 + i * rowH, w - 60, 3); }
      text(lab, -w / 2 + 44, yy + 2, { font: IF(800, o.lsize || 36), fill: o.lcol || CR, align: 'left' }); text(String(val), w / 2 - 44, yy + 4, { font: AF(o.vsize || vsize), fill: o.col || AMB, align: 'right' }); C.globalAlpha = 1; }); }, { x, y, s: k }); }
function hbar(lab, val, max, y, k, { x = 110, w = 860, h = 78, col = AMB, fg = G, lab2 = '' } = {}) { if (k <= 0) return; const e = ease('out', clamp(k)); rr(x, y, w, h, 14); fillPath('rgba(5,24,17,0.8)');
  const bw = Math.max(h, w * (val / max) * e); rr(x, y, bw, h, 14); fillPath(col); text(lab, x + 24, y + h / 2 + 2, { font: IF(800, 32), fill: fg, align: 'left' });
  text(String(Math.round(val * e)), x + Math.max(bw, 330) - 20, y + h / 2 + 3, { font: AF(52), fill: fg, align: 'right' }); if (lab2) text(lab2, x + 4, y + h + 26, { font: IF(600, 24), fill: TAN, align: 'left' }); }
/* newspaper-style card with our own masthead */
function paper(t, t0, { x = 540, y = 700, rot = -0.05, w = 820, mast = 'KAHANI TIMES', date = '', head = [], sub = '', hsize = 84, from = 1 } = {}) { const k = ease('expoOut', (t - t0) / 0.55); if (t < t0) return;
  const h = 150 + head.length * hsize * 1.08 + (sub ? 70 : 0) + 120;
  withT(() => { C.shadowColor = 'rgba(0,0,0,0.45)'; C.shadowBlur = 30; C.shadowOffsetY = 14; rr(-w / 2, -h / 2, w, h, 6); fillPath('#efe6cf'); C.shadowColor = 'transparent';
    text(mast, 0, -h / 2 + 52, { font: AF(50), fill: '#2a241a', ls: 6 }); C.fillStyle = '#2a241a'; C.fillRect(-w / 2 + 30, -h / 2 + 88, w - 60, 5); C.fillRect(-w / 2 + 30, -h / 2 + 98, w - 60, 2);
    if (date) text(date, 0, -h / 2 + 122, { font: IF(700, 22), fill: '#5b5140', ls: 3 });
    head.forEach((l, i) => text(l, 0, -h / 2 + 150 + hsize * 0.6 + i * hsize * 1.08, { font: AF(hsize), fill: '#1c1710' }));
    let yy = -h / 2 + 150 + head.length * hsize * 1.08 + 30; if (sub) { text(sub, 0, yy + 10, { font: IF(800, 30), fill: RED }); yy += 60; }
    C.fillStyle = '#b9ad92'; for (let c = 0; c < 2; c++) for (let r = 0; r < 4; r++) C.fillRect(-w / 2 + 40 + c * (w / 2 - 20), yy + r * 22, (w / 2 - 70) * (r === 3 ? 0.6 : 1), 9); },
    { x: x + from * (1 - k) * 900, y, r: rot + (1 - k) * 0.5 * from, s: 0.9 + 0.1 * k }); }
/* top-down ground: oval outfield, pitch, creases; P(u, v) maps pitch coords (u across -1..1, v along -1 bowler end .. 1 batting end) */
function groundTop(cx = 540, cy = 760, rx = 470, ry = 520, { rope = CR, pl = 300, pw = 74 } = {}) { C.beginPath(); C.ellipse(cx, cy, rx, ry, 0, 0, TAU); fillPath(GRASS, rope, 8);
  for (let i = -3; i <= 3; i++) { C.save(); C.beginPath(); C.ellipse(cx, cy, rx - 6, ry - 6, 0, 0, TAU); C.clip(); if (i % 2) { C.fillStyle = GRASS2; C.fillRect(cx - rx, cy + i * 150 - 75, rx * 2, 150); } C.restore(); }
  C.beginPath(); C.ellipse(cx, cy, rx * 0.5, ry * 0.5, 0, 0, TAU); C.setLineDash([14, 14]); C.strokeStyle = 'rgba(244,236,216,0.5)'; C.lineWidth = 4; C.stroke(); C.setLineDash([]);
  rr(cx - pw / 2, cy - pl / 2, pw, pl, 6); fillPath(PITCH); C.fillStyle = CR; C.fillRect(cx - pw / 2 - 12, cy - pl / 2 + 34, pw + 24, 4); C.fillRect(cx - pw / 2 - 12, cy + pl / 2 - 38, pw + 24, 4);
  for (const yy of [cy - pl / 2 + 14, cy + pl / 2 - 18]) for (let k = -1; k <= 1; k++) { circle(cx + k * 9, yy, 4); fillPath('#fff'); } }
function dot(x, y, col, { r = 20, label = '', lcol = CR, ring = '#fff', la = 1 } = {}) { circle(x, y, r); fillPath(col, ring, 4); if (label) text(label, x, y - r - 22, { font: IF(800, 24), fill: lcol, shadow: 'rgba(0,0,0,0.6)', a: la }); }
function ballFly(t, t0, d, p0, p1, { arc = 0, r = 22, n = 5, e = 'linear', keep = false, col = RED } = {}) { const u = (t - t0) / d; if (u < 0 || (u > 1 && !keep)) return null; const k = ease(e, clamp(u));
  const pos = kk => [lerp(p0[0], p1[0], kk), lerp(p0[1], p1[1], kk) - Math.sin(kk * Math.PI) * arc];
  if (u <= 1) for (let j = n; j >= 1; j--) { const q = pos(Math.max(0, k - j * 0.035)); C.globalAlpha = 0.1; ball(q[0], q[1], r, { col }); } C.globalAlpha = 1; const p = pos(k); ball(p[0], p[1], r, { rot: t * 18, col }); return p; }
function trophy(x, y, s = 1, col = AMB) { withT(() => { C.beginPath(); C.moveTo(-70, -120); C.lineTo(70, -120); C.quadraticCurveTo(64, -10, 0, 6); C.quadraticCurveTo(-64, -10, -70, -120); C.closePath(); fillPath(col, shade(col, -0.35), 6);
  for (const d of [-1, 1]) { C.beginPath(); C.moveTo(d * 68, -100); C.quadraticCurveTo(d * 122, -92, d * 60, -34); C.strokeStyle = shade(col, -0.2); C.lineWidth = 12; C.stroke(); }
  rr(-12, 4, 24, 54, 4); fillPath(shade(col, -0.2)); rr(-58, 56, 116, 26, 8); fillPath(shade(col, -0.35)); C.fillStyle = 'rgba(255,255,255,0.35)'; C.beginPath(); C.ellipse(-30, -70, 10, 34, 0.2, 0, TAU); C.fill(); }, { x, y, s }); }
function person(o) { return Object.assign({ name: 'P', height: 430, age: 'adult', build: 'average', skin: '#b47b52', hair: { style: 'short', color: '#17100b' }, eyes: '#2a1a10', top: { type: 'shirt', color: WHITE, sleeve: 'short' }, bottom: { type: 'pants', color: WHITE }, shoes: '#f2f2f2', brows: 1.05 }, o); }
function kitOf(col, cap, o = {}) { return person(Object.assign({ top: { type: 'shirt', color: col, sleeve: 'short' }, bottom: { type: 'pants', color: o.pants || col }, hat: cap ? { type: 'cap', color: cap } : undefined }, o)); }
/* bowling action: k 0..1 = run-up into delivery stride and release */
function bowlPose(t, k, yaw = 1.25) { const p = MOVES.run(t, { speed: 1.4, yaw }); const e = ease('inOut', clamp((k - 0.55) / 0.45)); if (e > 0) { p.armR.ab = lerp(p.armR.ab, 2.9, e); p.armR.sw = lerp(p.armR.sw, 0.3, e); p.armR.el = lerp(p.armR.el, 0.05, e); p.lean = lerp(p.lean, 0.3, e); p.handR = 'fist'; p.legL.sw = lerp(p.legL.sw, 0.7, e); p.legR.sw = lerp(p.legR.sw, -0.5, e); p.legL.kn = lerp(p.legL.kn, 0.1, e); } return p; }
function crouch(t, yaw = 0.9, seed = 2) { const p = MOVES.idle(t, { seed }); p.yaw = yaw; p.lean = 0.32; p.legL.kn = p.legR.kn = 0.75; p.legL.sw = p.legR.sw = 0.5; p.armL.sw = p.armR.sw = 0.85; p.armL.el = p.armR.el = 0.5; return p; }
function wideGround(t, { night = false, rows = 5, y0 = 700, seed = 3, sky = null, fill = 1, lights = night } = {}) { if (night) { nightSky(); if (lights) { floodlight(170, y0 - 460, 1.0, t, 1); floodlight(910, y0 - 460, 1.0, t, 1); } crowd(y0, rows, t, seed); } else { daySky(...(sky || [])); dayCrowd(y0, rows, t, seed, fill); }
  const gy = y0 + rows * 40 + 20; C.fillStyle = night ? G : GRASS; C.fillRect(0, gy, 1080, 1920 - gy); C.beginPath(); C.moveTo(480, gy); C.lineTo(600, gy); C.lineTo(690, gy + 480); C.lineTo(390, gy + 480); C.closePath(); fillPath(night ? TAN : PITCH); return gy; }
function sideGround(t, { night = false, rows = 5, y0 = 620, seed = 7, gy = 1180, sky = null, fill = 1 } = {}) { if (night) { nightSky(); floodlight(150, 120, 0.9, t, 1); floodlight(930, 120, 0.9, t, 1); crowd(y0, rows, t, seed); C.fillStyle = G; C.fillRect(0, 850, 1080, 1070); C.fillStyle = TAN; C.fillRect(0, gy, 1080, 120); }
  else { daySky(...(sky || ['#a9cfe0', '#efe0bd'])); dayCrowd(y0, rows, t, seed, fill); field(gy); } }
/* end card: u = seconds since it started */
function endCard(t, u, { q = '', next = '', sub = 'Har gend ke peeche ek kahani' } = {}) { stripes(t * 20); FX.glow(540, 470, 480, '255,210,140', 0.18);
  const k = ease('back', u / 0.6); if (k > 0) withT(() => logo(0, 0, 200), { x: 540, y: 450, s: k, r: (1 - k) * 0.6 });
  text('CRICKET KAHANI', 540, 730, { font: AF(92), fill: CR, a: fade(u, 0.3) }); text(sub, 540, 802, { font: IF(700, 36), fill: TAN, a: fade(u, 0.5) });
  const kq = pop(u, 0.4, 0.5); if (kq > 0 && q) withT(() => chip(q, 0, 0, { bg: CR, fg: G, font: AF(50), h: 88, padX: 36 }), { x: 540, y: 905, s: kq });
  chip('COMMENT MEIN BATAIYE', 540, 990, { bg: 'rgba(5,24,17,0.85)', fg: AMB, font: IF(800, 28), h: 54, a: fade(u, 0.8) });
  const kn = pop(u, 1.0, 0.5); if (kn > 0 && next) withT(() => { C.font = AF(44); const w = C.measureText(next).width + 280; rr(-w / 2, -44, w, 88, 18); fillPath(RED); text('AGLI KAHANI', -w / 2 + 28, 2, { font: IF(800, 26), fill: AMB, align: 'left', ls: 2 }); text(next, w / 2 - 28, 4, { font: AF(44), fill: '#fff', align: 'right' }); }, { x: 540, y: 1085, s: kn });
  const f = pop(u, 1.4, 0.5); if (f > 0) withT(() => { chip('FOLLOW', -150, 0, { bg: RED, font: AF(46), h: 84, padX: 38 }); chip('SUBSCRIBE', 150, 0, { bg: CR, fg: G, font: AF(46), h: 84, padX: 38 }); }, { x: 540, y: 1195, s: f }); }
/* last shot: story part until the spoken "Agli kahani", then the end card. CAP_R[7] / CAP_E[7] are split at "Agli kahani" / "Next:" */
function lastShot(t, draw, card) { const S = TL.shot('s7'), cutK = S.cut ?? 0.66, tEnd = S.vo_at + S.vo * cutK; const [ra, rb] = splitAt(CAP_R[7], 'Agli kahani'), [ea, eb] = splitAt(CAP_E[7], 'Next:');
  if (t < tEnd) { draw(t, S, tEnd); header(); captionText(ra, ea, t - 0.1, tEnd - 0.1); } else { endCard(t, t - tEnd, card); captionText(rb, eb, t - tEnd, S.vo_at + S.vo + 0.6 - tEnd); } }
function splitAt(s, m) { const i = s.indexOf(m); return i < 0 ? [s, ''] : [s.slice(0, i).trim(), s.slice(i).trim()]; }
function coverBase(l1, l2, chipTxt, { c1 = '#fff', c2 = AMB, s1 = 118, s2 = 108, band = RED } = {}) { stripes(0); FX.glow(540, 1050, 700, '255,210,140', 0.22);
  rr(60, 210, 960, 160, 26); fillPath(band); text(l1, 540, 296, { font: AF(s1), fill: c1 }); text(l2, 540, 460, { font: AF(s2), fill: c2 });
  if (chipTxt) chip(chipTxt, 540, 570, { bg: CR, fg: G, font: IF(900, 36), h: 74 }); }
function coverFoot() { logo(370, 1740, 60); text('CRICKET KAHANI', 450, 1745, { font: AF(64), fill: CR, align: 'left', ls: 2 }); }
function ckBoot() { Promise.all([fetch('timeline.json').then(r => r.json()), LOGO.decode(), ...['400 40px Anton', '800 40px InterV', '700 40px InterV', '500 40px InterV', '900 40px InterV', '600 40px InterV'].map(f => document.fonts.load(f))]).then(([tl]) => {
  TL = tl; TL.shot = id => TL.shots.find(s => s.id === id); TL.shots.forEach(s => scene(s.id, s.dur, DRAW_FN[s.id])); window.PAGE_READY = true; }); }
