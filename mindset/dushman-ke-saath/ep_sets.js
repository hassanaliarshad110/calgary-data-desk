
// ===== sets & props for "What Do You Do With an Enemy?" (all layouts relative to W,H so portrait recompositions work)
function camL(t, d, z0 = 1, z1 = 1.07, px = 24, py = 0, cy = H * 0.5) { const e = ease(t / d); return { zoom: lerp(z0, z1, e), px: lerp(-px, px, e), py: lerp(-py, py, e), cy }; }
function bokeh(t, n, col, seed = 1, area = [0, 0, W, H], r0 = 30, r1 = 90, a = 0.12) { for (let i = 0; i < n; i++) { const x = area[0] + rnd(i * 5 + seed) * area[2] + Math.sin(t * 0.3 + i) * 12, y = area[1] + rnd(i * 9 + seed) * area[3]; glow(x, y, lerp(r0, r1, rnd(i + seed * 3)), col, a * (0.6 + 0.4 * Math.sin(t * 0.7 + i))); } }
function haze(y0, y1, col, a) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.5, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(-300, y0, W + 600, y1 - y0); }

// ---- chess knight + generic piece wrapper (labels under)
function knightPiece(x, y, s = 1, fill = '#0B0A0E', rim = M.gold, rimA = 0.85) {
  withT(x, y, s, 0, () => { const p = new Path2D();
    p.moveTo(-62, 0); p.lineTo(62, 0); p.lineTo(52, -24); p.lineTo(34, -34); p.bezierCurveTo(46, -90, 40, -150, 22, -190); p.bezierCurveTo(8, -222, -26, -236, -50, -222);
    p.lineTo(-58, -246); p.lineTo(-70, -214); p.bezierCurveTo(-96, -196, -112, -168, -110, -150); p.lineTo(-88, -138); p.bezierCurveTo(-70, -148, -52, -150, -40, -142); p.bezierCurveTo(-56, -110, -40, -64, -36, -34); p.lineTo(-52, -24); p.closePath();
    P(p, fill, null); ctx.save(); ctx.clip(p); ctx.globalAlpha = rimA; ctx.lineWidth = 7; ctx.strokeStyle = rim; ctx.translate(6, 0); ctx.stroke(p); ctx.restore();
    P(circ(-56, -196, 5), rim, null); });
}
function piece(o, t) { // o: {k:'king'|'queen'|'pawn'|'knight', x, y, s, fill, rim, rimA, cap, glow, label, lk, tilt, a}
  alpha(o.a ?? 1, () => withT(o.x, o.y, 1, o.tilt || 0, () => {
    alpha(0.55, () => P(ell(0, 4, 70 * o.s, 14 * o.s), '#000', null));
    if (o.glow) glow(0, -120 * o.s, 220 * o.s, o.glowCol || M.gold, o.glow);
    if (o.k === 'knight') knightPiece(0, 0, o.s, o.fill || '#0B0A0E', o.rim || M.gold, o.rimA ?? 0.85);
    else chessPiece(o.k || 'pawn', 0, 0, o.s, o.fill || '#0B0A0E', o.rim || M.gold, o.rimA ?? 0.85);
    if (o.cap) P(ell(0, -150 * o.s, 26 * o.s, 12 * o.s), M.red2, null);      // red cap (cardinal-pawn)
  }));
  if (o.label && (o.lk ?? 1) > 0) chipAt(o.label, o.x, o.y + 52, o.lk ?? 1, o.lcol || M.gold, PT ? 30 : 28);
}
// perspective board on a table in the dark; spotlight cone
function chessScene(t, d, o = {}) {
  const cam = o.cam || camL(t, d, 1.0, 1.08, 30);
  const by = o.by || H * 0.52, bw = o.bw || (PT ? 1500 : 1700);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, o.bg1 || '#120A0C', o.bg2 || '#030204')); if (o.back) o.back(); glow(W / 2, by - 120, W * 0.5, o.spotCol || '#FFB45A', 0.14); } },
    { z: 0.5, draw: () => { board(W / 2, by, bw, 6, t, o.spot || null, o.depth || (PT ? 520 : 420)); if (o.pieces) o.pieces.slice().sort((a, b) => a.y - b.y).forEach(p => piece(p, t)); if (o.mid) o.mid(); } },
    { z: 1.0, draw: () => { if (o.near) o.near(); } },
  ], cam);
  beam(W / 2 + (o.beamX || 0), -80, 160, W / 2 + (o.beamX || 0), by + 300, PT ? 900 : 1100, '255,200,130', 0.10);
  dust(t, 50, [0, 0, W, H], '255,220,170', o.seed || 3);
}
// ---- Florentine study (landscape: window right, desk across bottom; portrait: window top, desk lower)
function studyL(t, d, o = {}) {
  const cam = o.cam || camL(t, d, 1.0, 1.07, 26);
  const wx = PT ? W * 0.5 : W * 0.72, wy = PT ? H * 0.28 : H * 0.36, ww = PT ? 560 : 520, wh = PT ? 760 : 600, deskY = PT ? H * 0.66 : H * 0.72;
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#1C0E0C', '#070406'));
      // window: night sky + dome skyline
      ctx.save(); const wp = new Path2D(); wp.moveTo(wx - ww / 2, wy + wh / 2); wp.lineTo(wx - ww / 2, wy - wh / 2 + ww / 2); wp.arc(wx, wy - wh / 2 + ww / 2, ww / 2, Math.PI, 0); wp.lineTo(wx + ww / 2, wy + wh / 2); wp.closePath();
      ctx.clip(wp); fullFill(grad(wy - wh / 2, wy + wh / 2, '#04081A', o.dawn ? '#6A3A3A' : '#16264A')); for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,246,222,${0.3 + 0.5 * rnd(i)})`; ctx.fillRect(wx - ww / 2 + rnd(i * 3) * ww, wy - wh / 2 + rnd(i * 7) * wh * 0.6, 2, 2); }
      moon(wx + ww * 0.22, wy - wh * 0.22, 34, t);
      withT(wx - 470, wy + wh / 2 - 40, 0.62, 0, () => florenceSkyline(0, '#020308'));
      ctx.restore(); P(wp, null, '#2A1A10', 26); line(wx, wy - wh / 2 + 10, wx, wy + wh / 2, '#2A1A10', 12); line(wx - ww / 2, wy + 40, wx + ww / 2, wy + 40, '#2A1A10', 10);
      beam(wx, wy, ww * 0.8, wx - (PT ? 0 : 420), deskY + 100, ww * 1.6, '150,180,240', 0.07);
      // shelves
      if (!PT) for (let r = 0; r < 3; r++) { const sy = H * 0.22 + r * 150; P(rr(90, sy, 560, 16, 4), '#2A160C', null); for (let b = 0; b < 14; b++) { const bh = 70 + rnd(b + r * 20) * 50; P(rr(104 + b * 38, sy - bh, 30, bh, 3), ['#3A1A12', '#2A2418', '#4A2A14', '#1E1410'][b % 4], null); } }
      else for (let r = 0; r < 2; r++) { const sy = H * 0.52 + r * 130; P(rr(60, sy, 300, 14, 4), '#2A160C', null); P(rr(W - 360, sy, 300, 14, 4), '#2A160C', null); for (let b = 0; b < 7; b++) { const bh = 60 + rnd(b + r * 20) * 40; P(rr(72 + b * 38, sy - bh, 30, bh, 3), ['#3A1A12', '#2A2418', '#4A2A14'][b % 3], null); P(rr(W - 348 + b * 38, sy - bh, 30, bh, 3), ['#2A2418', '#4A2A14', '#3A1A12'][b % 3], null); } }
    }, haze: 0.12 },
    { z: 0.45, draw: () => { // desk
      P(rr(-200, deskY, W + 400, H - deskY + 300, 0), grad(deskY, H, '#3A2414', '#120A06'), null); line(-200, deskY, W + 200, deskY, 'rgba(255,190,120,0.35)', 3);
      if (o.desk) o.desk(deskY); } },
    { z: 0.62, draw: () => { if (o.figure !== false) thinker(PT ? W * 0.30 : W * 0.30, deskY + 30, PT ? 1.05 : 1.0, t, M.gold2, 0.9);
      const cx = o.candleX ?? (PT ? W * 0.80 : W * 0.52); candleM(cx, deskY + 20, t, 1.1, 110); glow(cx, deskY - 120, 420, '#FFB45A', 0.22 * flick(t));
      if (o.mid) o.mid(deskY); } },
    { z: 1.0, draw: () => { if (o.near) o.near(deskY); } },
  ], cam);
  dust(t, 55, [0, 0, W, H], '255,220,170', 4);
}
// parchment sheet with ink lines that write on (k 0..1)
function parchment(x, y, s, rot, k, o = {}) { withT(x, y, s, rot, () => {
  P(rr(-170, -120, 340, 240, 6), grad(-120, 120, '#EBDDB8', '#C9B080'), null);
  const n = o.rows || 7; for (let i = 0; i < n; i++) { const lk = clamp(k * n - i); if (lk <= 0) break; line(-140, -84 + i * 30, -140 + 280 * lk * (i === n - 1 ? 0.6 : 1), -84 + i * 30, 'rgba(40,24,10,0.75)', 3); }
  if (o.title) txt(o.title, 0, -96, 22, '#5A1A12', 'CrimsonText', 700);
  if (o.checks) o.checks.forEach((c, i) => { const yy = -70 + i * 40; P(rr(-150, yy - 12, 24, 24, 4), null, '#3A2410', 3); if (c > 0) { ctx.save(); ctx.strokeStyle = c > 1.5 ? M.red2 : '#1E5A2A'; ctx.lineWidth = 5; ctx.beginPath(); if (c > 1.5) { ctx.moveTo(-148, yy - 10); ctx.lineTo(-128, yy + 10); ctx.moveTo(-128, yy - 10); ctx.lineTo(-148, yy + 10); } else { ctx.moveTo(-148, yy); ctx.lineTo(-140, yy + 9); ctx.lineTo(-124, yy - 12); } ctx.stroke(); ctx.restore(); } line(-112, yy, 120, yy, 'rgba(40,24,10,0.7)', 3); });
}); }
// ---- Florence at night (river reflections)
function florenceNight(t, d, o = {}) {
  const cam = o.cam || camL(t, d, 1.0, 1.1, 40, 0, H * 0.55); const hy = PT ? H * 0.55 : H * 0.62;
  layers([
    { z: 0.02, draw: () => { fullFill(grad(0, hy, '#02040E', '#1A2340')); starsT(t, 120, hy * 0.8, 5); moon(W * 0.78, H * 0.2, PT ? 70 : 60, t); } },
    { z: 0.18, haze: 0.08, draw: () => { withT(W / 2 - (PT ? 760 : 900) , hy, PT ? 1.25 : 1.35, 0, () => florenceSkyline(0, '#060810')); for (let i = 0; i < 40; i++) { const x = rnd(i * 4) * W, y = hy - 20 - rnd(i * 6) * 50; ctx.fillStyle = `rgba(255,190,110,${0.5 + 0.4 * Math.sin(t * 2 + i)})`; ctx.fillRect(x, y, 5, 7); } } },
    { z: 0.4, draw: () => { P(rr(-300, hy, W + 600, H, 0), grad(hy, H, '#0A1226', '#02030A'), null);
      for (let i = 0; i < 60; i++) { const x = rnd(i * 3 + 1) * W, y = hy + 10 + Math.pow(rnd(i * 5 + 2), 1.5) * (H - hy); const w = 30 + rnd(i) * 80; ctx.fillStyle = `rgba(255,${180 + rnd(i) * 50},110,${0.12 + 0.18 * Math.sin(t * 1.5 + i * 2)})`; ctx.fillRect(x + Math.sin(t + i) * 8, y, w, 3); }
      glow(W * 0.78, hy + (H - hy) * 0.4, 200, '#F4EBCB', 0.12); } },
    { z: 0.9, draw: () => { P(poly([-300, H + 40, -300, H - 150, W * 0.25, H - 120, W * 0.5, H - 60, W + 300, H - 80, W + 300, H + 40]), '#010102', null); if (o.near) o.near(); } },
  ], cam);
  dust(t, 40, [0, 0, W, H], '200,210,255', 6);
}
// ---- hall (conclave as a hall of robed silhouettes, no religious symbols)
function robed(x, y, s, o = {}) { withT(x, y, s, 0, () => { const p = new Path2D(); p.moveTo(-40, -330); p.bezierCurveTo(-80, -220, -110, -90, -120, 0); p.lineTo(120, 0); p.bezierCurveTo(110, -90, 80, -220, 40, -330); p.quadraticCurveTo(0, -350, -40, -330); p.closePath();
  P(p, o.col || '#0A0507', null); P(ell(0, -372, 34, 40), o.col || '#0A0507', null); if (o.cap !== false) P(ell(0, -400, 30, 12), o.capCol || '#9E1E1E', null);
  if (o.rim) { ctx.save(); ctx.globalAlpha = o.rimA ?? 0.8; ctx.strokeStyle = o.rim; ctx.lineWidth = 4; ctx.translate(3, 0); ctx.stroke(p); ctx.beginPath(); ctx.ellipse(0, -372, 34, 40, 0, -1.4, 1.4); ctx.stroke(); ctx.restore(); }
  if (o.glow) glow(0, -200, 260, o.glowCol || M.gold, o.glow); }); }
function hallSet(t, d, o = {}) {
  const cam = o.cam || camL(t, d, 1.0, 1.06, 20); const fy = PT ? H * 0.70 : H * 0.80;
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#140A10', '#040205')); const n = PT ? 3 : 5, aw = W / n;
      for (let a = 0; a < n; a++) { const ax = a * aw + aw * 0.2, w2 = aw * 0.6, top = fy - (PT ? 980 : 700); const p = new Path2D(); p.moveTo(ax, fy); p.lineTo(ax, top + w2 / 2); p.arc(ax + w2 / 2, top + w2 / 2, w2 / 2, Math.PI, 0); p.lineTo(ax + w2, fy); p.closePath();
        P(p, grad(top, fy, '#2A3050', '#0C0A14'), null); alpha(0.5, () => beam(ax + w2 / 2, top + 60, w2 * 0.8, ax + w2 / 2 - 120, fy + 200, w2 * 1.8, '170,190,240', 0.12)); } }, haze: 0.1 },
    { z: 0.35, draw: () => { P(rr(-300, fy, W + 600, H, 0), grad(fy, H, '#1A1014', '#050304'), null); for (let i = -4; i < 14; i++) line(W / 2 + i * 260 - 1300, H + 50, W / 2 + (i - 6) * 40, fy, 'rgba(255,220,180,0.05)', 2); } },
    { z: 0.55, draw: () => { if (o.row) o.row(fy); } },
    { z: 1.0, draw: () => { if (o.near) o.near(fy); } },
  ], cam);
  dust(t, 45, [0, 0, W, H], '220,210,255', 8);
}
// ---- modern office at night (city window wall, long table)
function officeN(t, d, o = {}) {
  const cam = o.cam || camL(t, d, 1.0, 1.06, 24); const ty = PT ? H * 0.68 : H * 0.74;
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#0A1020', '#03050A')); const top = PT ? H * 0.12 : H * 0.06;
      ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, ty - top - 40); ctx.clip(); fullFill(grad(top, ty, '#0B1630', o.dawn ? '#5A3A44' : '#1A2A4A'));
      skyline(ty - 40, '#050A16', 7, PT ? 620 : 420, 'rgba(255,200,120,0.7)', 50); ctx.restore();
      for (let i = 0; i <= 6; i++) line(i * W / 6, top, i * W / 6, ty - 40, '#0E1424', 10); line(0, top, W, top, '#0E1424', 14); } , haze: 0.15 },
    { z: 0.45, draw: () => { P(rr(-300, ty - 40, W + 600, H, 0), grad(ty - 40, H, '#11151E', '#040508'), null); if (o.floor) o.floor(ty); } },
    { z: 0.6, draw: () => { if (o.mid) o.mid(ty); } },
    { z: 1.0, draw: () => { if (o.near) o.near(ty); } },
  ], cam);
  dust(t, 30, [0, 0, W, H], '200,220,255', 11);
}
function table(x, y, w, h = 30) { P(rr(x - w / 2, y - h, w, h, 8), grad(y - h, y, '#2A3040', '#10131A'), null); line(x - w / 2 + 10, y - h + 3, x + w / 2 - 10, y - h + 3, 'rgba(150,180,230,0.35)', 2); P(rr(x - w / 2 + 40, y, 20, 160, 4), '#0A0C12', null); P(rr(x + w / 2 - 60, y, 20, 160, 4), '#0A0C12', null); }
function bulb(x, y, s, k = 1) { withT(x, y, s, 0, () => { glow(0, 0, 160, '#FFE2A0', 0.5 * k); P(circ(0, 0, 40), `rgba(255,230,160,${0.35 + 0.6 * k})`, '#5A4A20', 3); P(rr(-18, 36, 36, 30, 4), '#8A8A90', null); line(-10, 8, 0, -12, '#8A6A20', 3); line(0, -12, 10, 8, '#8A6A20', 3); }); }
function cup(x, y, s) { withT(x, y, s, 0, () => { P(new Path2D('M-30 -60 L30 -60 L24 0 L-24 0 Z'), '#E8E0D0', null); P(rr(-34, -66, 68, 12, 4), '#2A1A10', null); for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(255,255,255,${0.25})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10 + i * 10, -76); ctx.quadraticCurveTo(-20 + i * 10, -100, -8 + i * 10, -120); ctx.stroke(); } }); }
function card(x, y, s, rot, k = 1) { withT(x, y, s, rot, () => { P(rr(-90, -120, 180, 240, 6), '#F2E6CC', null); P(rr(-70, -100, 140, 120, 4), '#C0392B', null); heart(0, -40, 0.35, '#FFE2A0', 0.1); txt('HAPPY', 0, 50, 26, '#3A2410', 'Oswald', 700); txt('BIRTHDAY', 0, 84, 26, '#3A2410', 'Oswald', 700); }); }
// ---- cliff + ladder (dawn)
function cliffSet(t, d, o = {}) {
  const cam = o.cam || camL(t, d, 1.0, 1.06, 0, 30); const gy = PT ? H * 0.86 : H * 0.88;
  layers([
    { z: 0.02, draw: () => { fullFill(grad(0, H, '#140A1E', o.sun ? '#C8643A' : '#3A1E2A')); glow(W * 0.72, gy - 60, W * 0.5, '#FF9A50', 0.25 + 0.25 * (o.sun || 0)); } },
    { z: 0.2, haze: 0.08, draw: () => { cloudBank(PT ? 520 : 260, '#2A1424', 0.6, t, 3); } },
    { z: 0.45, draw: () => { // stone cliff on the left 60%
      const cx = PT ? W * 0.18 : W * 0.28, cw = PT ? W * 0.62 : W * 0.38, top = PT ? H * 0.16 : H * 0.10;
      P(rr(cx - cw / 2, top, cw, gy - top, 0), grad(top, gy, '#2A1C24', '#0C080C'), null);
      for (let r = 0; r < 14; r++) for (let c = 0; c < 6; c++) { const bw = cw / 6, bh = (gy - top) / 14; P(rr(cx - cw / 2 + c * bw + (r % 2) * bw / 2 - bw / 4, top + r * bh, bw - 6, bh - 6, 4), null, 'rgba(255,170,120,0.10)', 2); }
      line(cx + cw / 2, top, cx + cw / 2, gy, 'rgba(255,170,110,0.45)', 4);
      P(rr(-300, gy, W + 600, H, 0), '#060408', null);
      if (o.mid) o.mid(cx + cw / 2, top, gy); } },
    { z: 1.0, draw: () => { if (o.near) o.near(gy); } },
  ], cam);
  dust(t, 40, [0, 0, W, H], '255,200,150', 12);
}
function ladder(x, top, bot, k, rungs, labels = [], lkf = null) { // k 0..1 builds bottom-up
  const n = rungs, h = bot - top, sp = 120; const vis = Math.floor(k * n + 0.001);
  const ly = bot - h * Math.min(1, k); line(x - sp / 2, bot, x - sp / 2, ly, '#C9962E', 10); line(x + sp / 2, bot, x + sp / 2, ly, '#C9962E', 10);
  for (let i = 0; i < vis; i++) { const y = bot - (i + 0.5) * h / n; line(x - sp / 2, y, x + sp / 2, y, '#F6D27A', 9); glow(x, y, 60, M.gold, 0.15);
    if (labels[i]) chipAt(labels[i], x + (i % 2 ? -1 : 1) * (sp / 2 + 150), y, lkf ? lkf(i) : 1, M.gold, PT ? 30 : 28); }
}
// ---- basketball gym
function gymSet(t, d, o = {}) {
  const cam = o.cam || camL(t, d, 1.0, 1.06, 30); const fy = PT ? H * 0.70 : H * 0.72;
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, fy, '#0C0E18', '#1A1A26')); for (let i = 0; i < 6; i++) { const x = W * (0.1 + i * 0.16); P(rr(x - 70, 60, 140, 26, 8), 'rgba(255,240,210,0.35)', null); beam(x, 86, 140, x, fy + 100, 600, '255,240,210', 0.06 * (o.lights ?? 1)); }
      if (o.clock) o.clock(); } , haze: 0.08 },
    { z: 0.4, draw: () => { P(rr(-300, fy, W + 600, H, 0), grad(fy, H, '#6A4224', '#2A180C'), null); for (let i = 0; i < 18; i++) line(-300 + i * 160, fy, -300 + i * 160 - (i - 9) * 60, H, 'rgba(0,0,0,0.25)', 2);
      ctx.save(); ctx.strokeStyle = 'rgba(255,240,220,0.5)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(W / 2, fy + 120, PT ? 360 : 520, 70, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      // hoop
      const hx = PT ? W * 0.78 : W * 0.82, hy = fy - (PT ? 520 : 420); P(rr(hx - 10, hy - 40, 20, fy - hy + 40, 4), '#2A2A34', null); P(rr(hx - 150, hy - 150, 200, 130, 6), 'rgba(220,230,255,0.18)', 'rgba(255,255,255,0.6)', 4); ctx.save(); ctx.strokeStyle = '#E2603A'; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(hx - 120, hy - 10, 50, 12, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      for (let i = 0; i < 6; i++) line(hx - 165 + i * 18, hy - 6, hx - 150 + i * 12, hy + 60, 'rgba(255,255,255,0.5)', 2); } },
    { z: 0.6, draw: () => { if (o.mid) o.mid(fy); } },
    { z: 1.0, draw: () => { if (o.near) o.near(fy); } },
  ], cam);
  dust(t, 40, [0, 0, W, H], '255,240,210', 13);
}
function ball(x, y, r, rot) { withT(x, y, 1, rot, () => { P(circ(0, 0, r), '#D86A2A', '#3A1A08', 3); ctx.save(); ctx.strokeStyle = '#3A1A08'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke(); ctx.beginPath(); ctx.arc(-r * 1.2, 0, r * 0.9, -0.8, 0.8); ctx.stroke(); ctx.beginPath(); ctx.arc(r * 1.2, 0, r * 0.9, Math.PI - 0.8, Math.PI + 0.8); ctx.stroke(); ctx.restore(); }); }
function alarmClock(x, y, s, t, ring = 0, label = '5:00') { withT(x, y, s, ring ? Math.sin(t * 40) * 0.06 * ring : 0, () => { glow(0, 0, 200, '#FF6A3A', 0.3 * ring); P(circ(-70, -100, 36), '#B0B4C0', null); P(circ(70, -100, 36), '#B0B4C0', null); P(circ(0, 0, 130), '#1A1C24', '#B0B4C0', 8); P(rr(-100, -40, 200, 80, 12), '#050608', null); txt(label, 0, 2, 70, '#FF5A3A', 'Oswald', 700); P(rr(-80, 120, 20, 40, 4), '#B0B4C0', null); P(rr(60, 120, 20, 40, 4), '#B0B4C0', null); }); }
// ---- desert at night, H-relative (Rumi)
function desertL(t, d, o = {}) {
  const cam = o.cam || camL(t, d, 1.0, 1.07, 26, 0, H * 0.55); const hy = o.hy || (PT ? H * 0.50 : H * 0.56);
  layers([
    { z: 0.02, draw: () => { fullFill(grad(0, H, R.sky0, o.sky2 || R.sky2)); glow(W / 2, hy, W * 0.6, o.dawn ? '#C8643A' : R.teal, o.dawn ? 0.35 * o.dawn : 0.22); starsT(t, 170, hy, o.seed || 3); if (o.moon !== false) moon(o.mx ?? W * 0.72, o.my ?? hy * 0.38, o.mr ?? (PT ? 90 : 70), t); if (o.sky) o.sky(hy); } },
    { z: 0.15, haze: 0.06, draw: () => dunes(hy, 34, '#0A1A34', 1.0, 'rgba(160,200,240,0.28)') },
    { z: 0.32, draw: () => { dunes(hy + (H - hy) * 0.22, 46, '#071229', 2.3, 'rgba(190,220,255,0.32)'); if (o.far) o.far(hy); } },
    { z: 0.6, draw: () => { const y3 = hy + (H - hy) * 0.48; dunes(y3, 40, o.sand === 'moon' ? grad(y3 - 40, H, '#4A5A82', '#1C2848') : (o.sand || '#040A18'), 4.1, 'rgba(230,200,140,0.45)'); ctx.save(); ctx.clip(dunePath(y3, 40, 4.1)); ripples(y3 + 30, 12); ctx.restore(); if (o.mid) o.mid(y3); } },
    { z: 1.0, draw: () => { if (o.near) o.near(); } },
  ], cam);
  dust(t, 50, [0, 0, W, H], '190,215,255', o.seed || 2); dust(t, 20, [W * 0.2, H * 0.5, W * 0.6, H * 0.4], '246,210,122', 7);
}
// straight sword (not forked), hilt at origin, blade pointing -y; s scale
function sword(x, y, s, rot, o = {}) { withT(x, y, s, rot, () => {
  const bl = new Path2D(); bl.moveTo(-16, -40); bl.lineTo(-14, -470); bl.lineTo(0, -540); bl.lineTo(14, -470); bl.lineTo(16, -40); bl.closePath();
  P(bl, grad(-540, -40, '#F2F6FF', '#7A8494'), null); line(0, -60, 0, -500, 'rgba(255,255,255,0.6)', 3);
  if (o.glint != null) { ctx.save(); ctx.clip(bl); const gy = lerp(-560, 0, o.glint); glow(0, gy, 90, '#FFFFFF', 0.8); ctx.restore(); }
  P(rr(-90, -46, 180, 18, 8), '#C9962E', '#5A3A10', 3); P(rr(-12, -30, 24, 100, 6), '#3A1E10', null); P(circ(0, 84, 18), '#C9962E', '#5A3A10', 3);
  for (let i = 0; i < 5; i++) line(-12, -20 + i * 18, 12, -12 + i * 18, '#C9962E', 3); }); }
// a figure's shadow cast on the sand (flattened, skewed); fig: 'stand'|'raise'|'fallen'|'sit'
function sandShadow(x, y, s, fig, k = 1, o = {}) { alpha(k * (o.a ?? 0.9), () => withT(x, y, 1, 0, () => { ctx.transform(1, 0, o.skew ?? -0.9, o.sy ?? 0.32, 0, 0); ctx.scale(s, s);
  const col = o.col || '#03050C'; ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round';
  if (fig === 'fallen') { ctx.setTransform(ctx.getTransform().multiply(new DOMMatrix([1, 0, -(o.skew ?? -0.9) / (o.sy ?? 0.32) * 0, 1, 0, 0]))); P(ell(0, -40, 170, 60), col, null); P(circ(-190, -60, 48), col, null); ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(40, -70); ctx.lineTo(150, -170); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-60, -80); ctx.lineTo(-120, -200); ctx.stroke(); return; }
  // standing body
  P(new Path2D('M-60 0 L-50 -240 L-70 -380 Q0 -420 70 -380 L50 -240 L60 0 Z'), col, null); P(circ(0, -450, 44), col, null);
  ctx.lineWidth = 28; ctx.beginPath(); ctx.moveTo(-55, -360); ctx.lineTo(-110, -220); ctx.stroke();
  if (fig === 'raise') { ctx.beginPath(); ctx.moveTo(55, -370); ctx.lineTo(120, -520); ctx.stroke(); ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(120, -520); ctx.lineTo(150, -980 * (o.sword ?? 1) - 0 ); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(55, -360); ctx.lineTo(110, -220); ctx.stroke(); }
})); }
// burst of sand grains
function sandBurst(x, y, u, n = 60, spread = 1) { if (u < 0 || u > 1.6) return; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (rnd(i) - 0.5) * 2.4 * spread, v = 300 + rnd(i * 3) * 700; const px = x + Math.cos(a) * v * u, py = y + Math.sin(a) * v * u + 900 * u * u; ctx.fillStyle = `rgba(230,200,140,${(1 - u / 1.6) * 0.8})`; ctx.beginPath(); ctx.arc(px, py, 2 + rnd(i * 7) * 3, 0, 6.283); ctx.fill(); } glow(x, y, 220, '#E6C88C', 0.4 * Math.max(0, 1 - u * 2)); }
// anger as a crowned flame; k = size 0..1, bow = 0..1 (bows and loses crown)
function flameKing(x, y, s, t, k = 1, bow = 0) { if (k <= 0) return; withT(x, y, s * (0.5 + 0.5 * k), 0, () => {
  glow(0, -120, 360, '#FF5A2A', 0.45 * k); const f = (sc2, col, ph) => { const p = new Path2D(); const w = 110 * sc2, h = 300 * sc2; const sw = Math.sin(t * 7 + ph) * 12 * sc2, sw2 = Math.sin(t * 11 + ph) * 8;
    p.moveTo(-w, 0); p.bezierCurveTo(-w * 1.2, -h * 0.5, -w * 0.2 + sw2, -h * 0.6, sw, -h * (1 - bow * 0.35)); p.bezierCurveTo(w * 0.3 + sw2, -h * 0.6, w * 1.2, -h * 0.5, w, 0); p.quadraticCurveTo(0, 50 * sc2, -w, 0); P(p, col, null); };
  f(1, '#C0391B', 0); f(0.75, '#FF7A2A', 1.3); f(0.45, '#FFD27A', 2.1);
  const cy = -300 * (1 - bow * 0.35) - 30; withT(Math.sin(t * 7) * 12 + bow * 140, cy + bow * 260, 0.42, bow * 1.6, () => alpha(1 - bow * 0.3, () => crown(0, 0, 1, t))); }); }
// puppet strings from a point to targets, k = visibility, cut 0..1 (cut animation)
function strings(x0, y0, pts, k, cut = 0, col = '246,210,122') { if (k <= 0) return; pts.forEach(([x1, y1], i) => { ctx.save(); ctx.strokeStyle = `rgba(${col},${0.75 * k})`; ctx.lineWidth = 3; ctx.setLineDash([]);
  if (cut <= 0) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + 30 + Math.sin(GT * 2 + i) * 10, x1, y1); ctx.stroke(); }
  else { const mx = lerp(x0, x1, 0.5), my = lerp(y0, y1, 0.5) + 30; ctx.globalAlpha = 1 - cut; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, mx, 1 - cut * 0.3), lerp(y0, my, 1 - cut * 0.3) + cut * 200); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, mx, 1 - cut * 0.3), lerp(y1, my, 1 - cut * 0.3) + cut * 260); ctx.stroke(); }
  ctx.restore(); glow(x1, y1, 26, M.gold, 0.4 * k * (1 - cut)); }); }
// ---- phone in a dark room at midnight
function phoneSet(t, d, o = {}) {
  const cam = o.cam || camL(t, d, 1.0, 1.08, 10); const px = o.px ?? W / 2, py = o.py ?? (PT ? H * 0.42 : H * 0.46), ps = o.ps ?? (PT ? 1.5 : 1.1);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#04060E', '#010103')); const wx = PT ? W * 0.75 : W * 0.85; P(rr(wx - 160, H * 0.08, 320, 420, 6), grad(H * 0.08, H * 0.5, '#0A1430', '#122040'), '#05070C', 16); moon(wx + 60, H * 0.15, 26, t); txt('00:07', PT ? W * 0.25 : W * 0.14, H * 0.14, 64, 'rgba(255,90,60,0.8)', 'Oswald', 700); } },
    { z: 0.4, draw: () => { P(rr(-300, H * 0.72, W + 600, H, 0), grad(H * 0.72, H, '#0E1220', '#040508'), null); } },
    { z: 0.65, draw: () => { withT(px, py, ps, o.tilt || 0, () => { glow(0, 0, 520, '#6AA8FF', 0.28 * (o.glow ?? 1)); P(rr(-150, -300, 300, 600, 40), '#0A0C12', '#2A2E3A', 6); P(rr(-132, -270, 264, 540, 26), grad(-270, 270, '#14203A', '#0A1222'), null);
      txt('RIVAL', -60, -230, 26, '#BFD8FF', 'Oswald', 700); P(circ(-110, -230, 16), '#C0392B', null); if (o.screen) o.screen(); }); if (o.mid) o.mid(px, py, ps); } },
    { z: 1.0, draw: () => { if (o.near) o.near(px, py, ps); } },
  ], cam);
  dust(t, 25, [0, 0, W, H], '160,200,255', 14);
}
function thornBubble(x, y, w, h, k, txtS) { if (k <= 0) return; withT(x, y, lerp(0.6, 1, back(k)), 0, () => alpha(k, () => { const p = new Path2D(); p.roundRect(-w / 2, -h / 2, w, h, 22); P(p, '#C0392B', '#FF9A7A', 3); for (let i = 0; i < 9; i++) { const xx = -w / 2 + 20 + i * (w - 40) / 8; P(poly([xx - 10, -h / 2, xx, -h / 2 - 22, xx + 10, -h / 2]), '#C0392B', null); P(poly([xx - 10, h / 2, xx, h / 2 + 22, xx + 10, h / 2]), '#C0392B', null); }
  if (txtS) txt(txtS, 0, 2, 26, '#FFF0E8', 'Montserrat', 800); })); }
// ---- split screen Mind (red, study) | Heart (blue, desert)
function splitMV(t, d, o = {}) {
  const sx = o.sx ?? 0.5; const div = PT ? H * sx : W * sx;
  ctx.save(); ctx.beginPath(); if (PT) ctx.rect(0, 0, W, div); else ctx.rect(0, 0, div, H); ctx.clip();
  fullFill(grad(0, H, '#2A0808', '#070203')); glow(PT ? W / 2 : div * 0.5, PT ? div * 0.55 : H * 0.5, 700, '#C0392B', 0.25);
  const mx = PT ? W * 0.5 : div * 0.5, my = PT ? div * 0.92 : H * 0.84; P(rr(-100, my, W + 200, H, 0), '#140606', null);
  if (o.left) o.left(mx, my); else { thinker(mx - 60, my + 20, PT ? 0.85 : 0.95, t, M.gold2, 0.9); candleM(mx + 240, my + 10, t, 0.9, 90); }
  ctx.restore();
  ctx.save(); ctx.beginPath(); if (PT) ctx.rect(0, div, W, H - div); else ctx.rect(div, 0, W - div, H); ctx.clip();
  fullFill(grad(0, H, '#02060E', '#0D2C4C')); const bx = PT ? W * 0.5 : div + (W - div) * 0.5, byy = PT ? div + (H - div) * 0.85 : H * 0.84;
  starsT(t, 90, H, 9); moon(PT ? W * 0.8 : W - 200, PT ? div + 150 : 160, 46, t); P(dunePath(byy - 10, 26, 3), '#030A18', null);
  if (o.right) o.right(bx, byy); else whirler(bx, byy + 10, PT ? 0.62 : 0.72, t, t * 2.2, R.teal2, 0.85);
  ctx.restore();
  // divider
  const g = PT ? ctx.createLinearGradient(0, div, W, div) : ctx.createLinearGradient(div, 0, div, H); g.addColorStop(0, 'rgba(246,210,122,0)'); g.addColorStop(0.5, 'rgba(246,210,122,0.9)'); g.addColorStop(1, 'rgba(246,210,122,0)'); ctx.fillStyle = g; if (PT) ctx.fillRect(0, div - 2, W, 4); else ctx.fillRect(div - 2, 0, 4, H);
  dust(t, 40, [0, 0, W, H], '246,210,122', 15);
}
// ---- top-down paper with two columns
function paperDesk(t, d, o = {}) {
  const cam = o.cam || camL(t, d, 1.0, 1.05, 10);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#2A1A10', '#0C0704')); for (let i = 0; i < 30; i++) line(-100, i * 60 + Math.sin(i) * 10, W + 100, i * 60 + 20 + Math.sin(i * 2) * 10, 'rgba(0,0,0,0.18)', 3); glow(W * 0.5, H * 0.45, W * 0.5, '#FFB45A', 0.18); } },
    { z: 0.5, draw: () => { const pw = PT ? 900 : 1100, ph = PT ? 1250 : 860, px = W / 2, py = PT ? H * 0.42 : H * 0.47; withT(px, py, 1, -0.015, () => {
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; P(rr(-pw / 2, -ph / 2, pw, ph, 6), '#F4EEDF', null); ctx.restore();
      for (let i = 0; i < 18; i++) line(-pw / 2 + 30, -ph / 2 + 150 + i * ((ph - 180) / 18), pw / 2 - 30, -ph / 2 + 150 + i * ((ph - 180) / 18), 'rgba(80,120,200,0.18)', 2);
      line(0, -ph / 2 + 40, 0, ph / 2 - 30, 'rgba(192,57,43,0.6)', 4);
      if (o.paper) o.paper(pw, ph); }); } },
    { z: 1.0, draw: () => { if (o.near) o.near(); } },
  ], cam);
  dust(t, 30, [0, 0, W, H], '255,220,170', 16);
}
function handwriteL(s, x, y, size, k, col = '#1A2A4A', align = 'left', font = 'Montserrat', wt = 800) { if (k <= 0) return; ctx.save(); ctx.font = `${wt} ${size}px ${font}`; const w = ctx.measureText(s).width; ctx.beginPath(); const x0 = align === 'center' ? x - w / 2 : x; ctx.rect(x0 - 4, y - size, (w + 8) * clamp(k), size * 2); ctx.clip(); txt(s, x, y, size, col, font, wt, align); ctx.restore(); }
function strike(x, y, w, k, col = '#C0392B') { if (k <= 0) return; line(x, y, x + w * clamp(k), y + 4 * Math.sin(k * 6), col, 7); }
// ---- moonlit sand plane seen from behind the fighters (moon behind camera → shadows stretch away from us)
function moonSand(t, d, o = {}) {
  const cam = o.cam || camL(t, d, 1.0, 1.07, 20, 0, H * 0.6); const hy = o.hy || (PT ? H * 0.40 : H * 0.36);
  layers([
    { z: 0.02, draw: () => { fullFill(grad(0, hy, '#02040C', '#14244A')); starsT(t, PT ? 220 : 140, hy, 4); glow(W / 2, hy, W * 0.6, '#3FA7A8', 0.18); for (let i = 0; i < 7; i++) { const x = W * (0.08 + i * 0.14), y = hy - 6 - Math.sin(i * 1.3) * 8; glow(x, y, 26, '#FFB45A', 0.5 * flick(t + i)); P(circ(x, y, 3), '#FFD27A', null); } } },
    { z: 0.15, haze: 0.05, draw: () => dunes(hy, 26, '#0E1C3A', 1.7, 'rgba(170,200,240,0.35)') },
    { z: 0.5, draw: () => { const p = dunePath(hy + 40, 14, 2.9); P(p, grad(hy, H, '#2E3C62', '#7684A8'), null); ctx.save(); ctx.clip(p); alpha(0.5, () => ripples(hy + 80, 16, 'rgba(255,255,255,0.10)', 2)); ctx.restore(); if (o.mid) o.mid(hy); } },
    { z: 1.0, draw: () => { if (o.near) o.near(hy); } },
  ], cam);
  dust(t, 45, [0, 0, W, H], '210,225,255', 21);
}
