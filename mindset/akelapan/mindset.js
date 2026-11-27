// ===== Awazzzz Mindset — "Half Your Life Is Luck" (The Prince, Ch. 25) — vertical 1080x1920, dark cinematic 2.5D
// Series engine for Machiavelli episodes: study set, silhouettes, chess, crown, scale, parchment quote cards,
// word-synced captions, watermark, end card. Uses rig.js helpers (P, rr, circ, glow, txt, withT, alpha, ease...).
let GT = 0;
const M = { red: '#8E1B1B', red2: '#C0392B', blood: '#5A0E0E', black: '#07060A', gold: '#E2B04A', gold2: '#F6D27A',
  parch: '#EADBB8', parch2: '#CDB68A', ink: '#1A120B', wood: '#2A1A10', wood2: '#3A2414', dawn1: '#2A1E3A', dawn2: '#E58A4E', dawn3: '#F7C47A',
  steel: '#20283A', teal: '#2E8C8C' };
function lt(id) { return GT - LINES[id].start; }
function act(id, pad = 0) { const L = LINES[id]; return L && GT >= L.start - pad && GT < L.start + L.dur + pad; }
function wordT(id, k) { return LINES[id].words[k][0]; }   // local time of word k in line id
function lineT(id) { return LINES[id].start; }
function fullFill(c) { ctx.fillStyle = c; ctx.fillRect(-400, -400, W + 800, H + 800); }

// ---- 2.5D layer stack: each layer {z, blur, draw}; camera push (zoom) + drift (px,py)
function layers(L, cam) {
  L.forEach(l => {
    ctx.save();
    const s = 1 + (cam.zoom - 1) * (0.3 + l.z);
    ctx.translate(W / 2 + (cam.fx || 0), (cam.cy || 900));
    ctx.scale(s, s);
    ctx.translate(-W / 2 - (cam.px || 0) * l.z, -(cam.cy || 900) - (cam.py || 0) * l.z);
    if (l.blur) ctx.filter = `blur(${l.blur}px)`;
    l.draw(); ctx.restore();
    if (l.haze) { ctx.fillStyle = `rgba(10,6,14,${l.haze})`; ctx.fillRect(0, 0, W, H); }
  });
}
function camAt(t, d, z0 = 1, z1 = 1.08, px = 30) { return { zoom: lerp(z0, z1, ease(t / d)), px: lerp(-px, px, ease(t / d)), py: 0 }; }

// ---- atmosphere
function dust(t, n = 60, area = [0, 200, W, 1300], col = '255,220,160', seed = 1) {
  for (let i = 0; i < n; i++) {
    const r = rnd(i * 3 + seed), r2 = rnd(i * 7 + seed), r3 = rnd(i * 11 + seed);
    const x = area[0] + ((r * area[2] + t * (8 + r3 * 14) + Math.sin(t * 0.6 + i) * 20) % area[2]);
    const y = area[1] + ((r2 * area[3] - t * (10 + r * 18)) % area[3] + area[3]) % area[3];
    const a = 0.15 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.3 + i * 1.7));
    ctx.fillStyle = `rgba(${col},${a})`; ctx.beginPath(); ctx.arc(x, y, 1.5 + r3 * 2.6, 0, 6.283); ctx.fill();
  }
}
function beam(x1, y1, w1, x2, y2, w2, col = '255,190,120', a = 0.18) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x1 - w1 / 2, y1); ctx.lineTo(x1 + w1 / 2, y1); ctx.lineTo(x2 + w2 / 2, y2); ctx.lineTo(x2 - w2 / 2, y2); ctx.closePath(); ctx.fill();
}
function flick(t, s = 1) { return 1 + 0.06 * Math.sin(t * 13 * s) + 0.04 * Math.sin(t * 29 * s + 1) + 0.03 * Math.sin(t * 7.3); }
function candleM(x, y, t, s = 1, h = 90) {
  withT(x, y, s, 0, () => {
    glow(0, -h - 30, 260 * flick(t), '#FFB45A', 0.5);
    glow(0, -h - 30, 90 * flick(t + 3), '#FFE2A0', 0.6);
    const g = ctx.createLinearGradient(-16, 0, 16, 0); g.addColorStop(0, '#9C8A6A'); g.addColorStop(0.5, '#E8DCC0'); g.addColorStop(1, '#8A7656');
    P(rr(-16, -h, 32, h, 4), g, null);
    P(ell(0, -h, 16, 5), '#F2E6CC', null);
    P(rr(-34, -6, 68, 12, 5), '#3A2A1A', null);
    const fl = Math.sin(t * 9) * 3, fw = Math.sin(t * 13) * 1.5;
    const f = new Path2D(); f.moveTo(0 + fw, -h - 46 + fl); f.bezierCurveTo(13, -h - 26, 9, -h - 8, 0, -h - 6); f.bezierCurveTo(-9, -h - 8, -13, -h - 26, 0 + fw, -h - 46 + fl);
    P(f, '#FFC861', null); P(ell(0, -h - 15, 4, 8), '#FFF6D8', null);
    line(0, -h, 0, -h - 7, '#222', 2);
  });
}
function grain(t) { ctx.save(); ctx.globalAlpha = 0.05; for (let i = 0; i < 260; i++) { const x = rnd(i + Math.floor(t * 30) * 0.37) * W, y = rnd(i * 2.3 + Math.floor(t * 30)) * H; ctx.fillStyle = i % 2 ? '#fff' : '#000'; ctx.fillRect(x, y, 2, 2); } ctx.restore(); }
function vign(a = 0.65) { const g = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.5, H * 0.85); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }

// ---- props
function crown(x, y, s = 1, t = 0, crack = 0) {
  withT(x, y, s, 0, () => {
    glow(0, -40, 230, M.gold, 0.28);
    const p = new Path2D(); p.moveTo(-120, 30); p.lineTo(-135, -80); p.lineTo(-70, -20); p.lineTo(0, -110); p.lineTo(70, -20); p.lineTo(135, -80); p.lineTo(120, 30); p.closePath();
    const g = ctx.createLinearGradient(-130, -110, 130, 40); g.addColorStop(0, '#FFE39A'); g.addColorStop(0.45, '#D79B2E'); g.addColorStop(1, '#7A4A10');
    P(p, g, '#3A2208', 4);
    P(rr(-125, 20, 250, 40, 8), '#B67A1E', '#3A2208', 4);
    [-70, 0, 70].forEach((cx, i) => P(circ(cx, 40, 12), i == 1 ? M.red2 : '#2E6E8E', '#2A1404', 3));
    [-135, 0, 135].forEach((cx, i) => P(circ(cx, i == 1 ? -112 : -82, 11), '#FFE6A0', '#3A2208', 3));
    // highlight sweep
    const sw = ((t * 0.35) % 1.6) - 0.3; ctx.save(); ctx.clip(p); alpha(0.35, () => beam(-140 + sw * 300, -120, 30, -100 + sw * 300, 60, 30, '255,255,255', 0.9)); ctx.restore();
    if (crack > 0) { ctx.save(); ctx.strokeStyle = '#1A0606'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
      const pts = [[0, -105], [-12, -60], [10, -30], [-8, 5], [6, 55]]; const n = Math.max(1, Math.floor(crack * (pts.length - 1)) + 1);
      ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
      if (crack > 0.6) { ctx.beginPath(); ctx.moveTo(10, -30); ctx.lineTo(50, -50); ctx.moveTo(-8, 5); ctx.lineTo(-55, 0); ctx.stroke(); }
      ctx.restore(); glow(0, -20, 160, M.red2, 0.35 * crack); }
  });
}
function heart(x, y, s = 1, col = '#C9415A', g = 0.4) {
  withT(x, y, s, 0, () => { glow(0, 0, 180, col, g); const p = new Path2D(); p.moveTo(0, 60); p.bezierCurveTo(-110, -10, -70, -100, 0, -50); p.bezierCurveTo(70, -100, 110, -10, 0, 60); P(p, col, '#2A0A10', 4);
    alpha(0.35, () => P(ell(-35, -40, 18, 10, -0.6), '#fff', null)); });
}
function chessPiece(kind, x, y, s = 1, fill = '#0B0A0E', rim = M.gold, rimA = 0.8) {
  withT(x, y, s, 0, () => {
    const p = new Path2D();
    if (kind === 'pawn') { p.moveTo(-50, 0); p.lineTo(50, 0); p.lineTo(42, -18); p.lineTo(26, -26); p.quadraticCurveTo(14, -70, 22, -96); p.arc(0, -120, 32, 0.75, Math.PI - 0.75, true); p.quadraticCurveTo(-14, -70, -26, -26); p.lineTo(-42, -18); p.closePath(); }
    else if (kind === 'king') { p.moveTo(-62, 0); p.lineTo(62, 0); p.lineTo(52, -24); p.lineTo(32, -34); p.quadraticCurveTo(22, -110, 40, -170); p.lineTo(26, -184); p.lineTo(-26, -184); p.lineTo(-40, -170); p.quadraticCurveTo(-22, -110, -32, -34); p.lineTo(-52, -24); p.closePath();
      p.rect(-7, -235, 14, 52); p.rect(-24, -218, 48, 13); }
    else { // queen
      p.moveTo(-60, 0); p.lineTo(60, 0); p.lineTo(50, -24); p.lineTo(30, -34); p.quadraticCurveTo(20, -110, 40, -165); p.lineTo(50, -195); p.lineTo(24, -178); p.lineTo(12, -205); p.lineTo(0, -180); p.lineTo(-12, -205); p.lineTo(-24, -178); p.lineTo(-50, -195); p.lineTo(-40, -165); p.quadraticCurveTo(-20, -110, -30, -34); p.lineTo(-50, -24); p.closePath(); p.arc(0, -214, 11, 0, 6.283); }
    P(p, fill, null);
    ctx.save(); ctx.clip(p); ctx.globalAlpha = rimA; ctx.lineWidth = 7; ctx.strokeStyle = rim; ctx.translate(6, 0); ctx.stroke(p); ctx.restore();
  });
}
function board(cx, cy, w, rows, t, spot = null, depth = 380) { // perspective chessboard
  const top = cy; const wTop = w * 0.62;
  for (let r = 0; r < rows; r++) for (let c = 0; c < 8; c++) {
    const y0 = top + depth * Math.pow(r / rows, 1.15), y1 = top + depth * Math.pow((r + 1) / rows, 1.15);
    const w0 = lerp(wTop, w, r / rows), w1 = lerp(wTop, w, (r + 1) / rows);
    const xa = cx - w0 / 2 + w0 * c / 8, xb = cx - w0 / 2 + w0 * (c + 1) / 8, xc = cx - w1 / 2 + w1 * (c + 1) / 8, xd = cx - w1 / 2 + w1 * c / 8;
    const dark = (r + c) % 2; let col = dark ? '#1A0F0A' : '#5A3E26';
    if (spot && spot[0] === r && spot[1] === c) col = dark ? '#6A4A22' : '#C89A52';
    P(poly([xa, y0, xb, y0, xc, y1, xd, y1]), col, null);
  }
  P(poly([cx - w / 2, top + depth, cx + w / 2, top + depth, cx + w / 2, top + depth + 40, cx - w / 2, top + depth + 40]), '#120A06', null);
}
function scale(x, y, s, tilt, t, leftFn, rightFn) { // balance: tilt>0 = right side down
  withT(x, y, s, 0, () => {
    const g = ctx.createLinearGradient(-10, 0, 10, 0); g.addColorStop(0, '#6A4A14'); g.addColorStop(0.5, '#E2B04A'); g.addColorStop(1, '#6A4A14');
    P(rr(-12, -40, 24, 470, 8), g, null); P(rr(-110, 420, 220, 34, 10), '#8A6220', null); P(rr(-150, 450, 300, 26, 10), '#5A3E12', null);
    glow(0, -40, 60, M.gold2, 0.6); P(circ(0, -40, 20), '#F2CE70', '#4A3008', 3);
    withT(0, -40, 1, tilt, () => {
      P(rr(-330, -10, 660, 20, 10), g, null);
      [-1, 1].forEach(sd => { const ax = sd * 310; const drop = 230 + 0; // pans hang vertically regardless of tilt
        ctx.save(); ctx.translate(ax, 0); ctx.rotate(-tilt);
        line(0, 0, -95, drop, '#B8892E', 3); line(0, 0, 95, drop, '#B8892E', 3);
        P(new Path2D(`M-125 ${drop} Q0 ${drop + 70} 125 ${drop} Z`), '#C79434', '#4A3008', 3);
        if (sd < 0) leftFn && leftFn(0, drop - 10); else rightFn && rightFn(0, drop - 10);
        ctx.restore(); });
    });
  });
}
// stylised Renaissance thinker silhouette (seated, writing, facing right); hand rests at local (205,-55)
function thinker(x, y, s, t, rim = M.gold2, rimA = 0.9) {
  withT(x, y, s, 0, () => {
    const wr = Math.sin(t * 5) * 5, nod = Math.sin(t * 0.8) * 0.03;
    const body = new Path2D();
    body.moveTo(-170, 60); body.bezierCurveTo(-190, -120, -150, -250, -80, -300); body.bezierCurveTo(-40, -330, 10, -330, 40, -300);
    body.bezierCurveTo(70, -270, 80, -230, 90, -200); body.bezierCurveTo(130, -170, 170 + wr, -110, 190 + wr, -70); body.lineTo(215 + wr, -62); body.lineTo(210 + wr, -40);
    body.bezierCurveTo(150, -50, 100, -100, 80, -120); body.bezierCurveTo(90, -80, 100, -30, 110, 60); body.closePath();
    P(body, '#050407', null);
    withT(15, -372, 1, nod, () => {
      const hd = new Path2D(); hd.moveTo(-50, -40); hd.bezierCurveTo(-40, -78, 30, -84, 46, -40); hd.lineTo(52, -12); hd.lineTo(74, 14); hd.lineTo(55, 22); hd.lineTo(59, 33); hd.lineTo(53, 42); hd.lineTo(51, 60); hd.bezierCurveTo(30, 76, -10, 72, -22, 62); hd.lineTo(-40, 44); hd.bezierCurveTo(-62, 20, -62, -20, -50, -40); hd.closePath();
      P(hd, '#050407', null); P(rr(-26, 50, 52, 70, 10), '#050407', null);
      const cap = new Path2D(); cap.moveTo(-64, -14); cap.bezierCurveTo(-80, -96, 44, -112, 60, -36); cap.bezierCurveTo(20, -52, -30, -44, -64, -14); cap.closePath(); P(cap, '#3A0A0A', null);
      ctx.save(); ctx.globalAlpha = rimA; ctx.strokeStyle = rim; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(47, -34); ctx.lineTo(52, -12); ctx.lineTo(74, 14); ctx.lineTo(55, 22); ctx.lineTo(59, 33); ctx.lineTo(53, 42); ctx.lineTo(51, 60); ctx.stroke(); ctx.restore();
    });
    ctx.save(); ctx.globalAlpha = rimA; ctx.strokeStyle = rim; ctx.lineWidth = 5; ctx.translate(4, 0); ctx.beginPath();
    ctx.moveTo(40, -300); ctx.bezierCurveTo(70, -270, 80, -230, 90, -200); ctx.bezierCurveTo(130, -170, 170 + wr, -110, 190 + wr, -70); ctx.stroke(); ctx.restore();
    withT(208 + wr, -58, 1, 0.35 + Math.sin(t * 5) * 0.06, () => { const q = new Path2D(); q.moveTo(0, 0); q.bezierCurveTo(14, -50, 34, -100, 26, -150); q.bezierCurveTo(6, -100, -6, -50, 0, 0); P(q, '#E9DCC0', null); line(0, 0, 22, -140, '#8A7A60', 2); });
  });
}
// modern person silhouette (standing or seated), facing f (1 right, -1 left)
function person(x, y, s, o = {}) {
  const f = o.f || 1, col = o.col || '#06060A', rim = o.rim || null, sit = o.sit, hair = o.hair;
  withT(x, y, s, 0, () => { ctx.scale(f, 1);
    const p = new Path2D(); let hy;
    if (sit) { hy = -282; p.moveTo(-18, -236); p.lineTo(18, -236); p.bezierCurveTo(52, -232, 72, -214, 74, -186); p.lineTo(78, 0); p.lineTo(-78, 0); p.lineTo(-74, -186); p.bezierCurveTo(-72, -214, -52, -232, -18, -236); p.closePath(); }
    else { hy = -430; p.moveTo(-22, -372); p.lineTo(22, -372); p.bezierCurveTo(60, -366, 86, -350, 90, -318); p.lineTo(94, -182); p.quadraticCurveTo(92, -160, 78, -162); p.lineTo(66, -170); p.lineTo(60, 0); p.lineTo(-60, 0); p.lineTo(-66, -170); p.lineTo(-78, -162); p.quadraticCurveTo(-92, -160, -94, -182); p.lineTo(-90, -318); p.bezierCurveTo(-86, -350, -60, -366, -22, -372); p.closePath(); }
    if (hair) P(rr(-50, hy - 50, 100, 120, [48, 48, 18, 18]), col, null);
    P(rr(-17, hy + 30, 34, 50, 6), col, null);
    P(ell(0, hy, 42, 50), col, null);
    P(p, col, null);
    if (!sit) line(0, -150, 0, -8, 'rgba(255,255,255,0.05)', 3);
    if (rim) { ctx.save(); ctx.globalAlpha = o.rimA ?? 0.85; ctx.strokeStyle = rim; ctx.lineWidth = 5; ctx.translate(3, 0); ctx.stroke(p); ctx.beginPath(); ctx.ellipse(0, hy, 42, 50, 0, -1.4, 1.4); ctx.stroke(); if (hair) { ctx.beginPath(); ctx.moveTo(50, hy - 2); ctx.lineTo(50, hy + 64); ctx.stroke(); } ctx.restore(); }
  });
}
function florenceSkyline(y, col) { // dome + campanile + rooftops (stylised)
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-200, y);
  for (let i = 0; i < 26; i++) { const x = -200 + i * 60; ctx.lineTo(x, y - 40 - rnd(i + 40) * 50); ctx.lineTo(x + 60, y - 40 - rnd(i + 40) * 50); }
  ctx.lineTo(1400, y); ctx.lineTo(1400, y + 400); ctx.lineTo(-200, y + 400); ctx.closePath(); ctx.fill();
  const d = new Path2D(); d.moveTo(380, y - 80); d.lineTo(380, y - 150); d.bezierCurveTo(390, y - 260, 450, y - 300, 470, y - 300); d.bezierCurveTo(490, y - 300, 550, y - 260, 560, y - 150); d.lineTo(560, y - 80); d.closePath();
  d.rect(458, y - 340, 24, 44); d.rect(340, y - 130, 260, 60); ctx.fill(d);
  ctx.fillRect(640, y - 270, 46, 200); ctx.beginPath(); ctx.moveTo(636, y - 270); ctx.lineTo(663, y - 300); ctx.lineTo(690, y - 270); ctx.fill();
}

function book(x, y, s, t) { withT(x, y, s, 0, () => { P(poly([-200, 40, 0, 60, 0, -60, -180, -80]), '#E2D2AE', null); P(poly([0, 60, 200, 40, 180, -80, 0, -60]), '#D6C49C', null); P(poly([-210, 48, 0, 70, 210, 48, 200, 40, 0, 60, -200, 40]), '#5A1A12', null);
  ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = '#5A4A30'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-160, -50 + i * 16); ctx.lineTo(-30, -38 + i * 16); ctx.moveTo(30, -38 + i * 16); ctx.lineTo(160, -50 + i * 16); ctx.stroke(); } ctx.restore(); }); }
function inkpot(x, y, s) { withT(x, y, s, 0, () => { P(ell(0, 0, 50, 14), '#000', null); P(new Path2D('M-42 0 Q-48 -60 -20 -70 L20 -70 Q48 -60 42 0 Z'), '#141018', null); P(rr(-18, -92, 36, 24, 4), '#2A1A10', null); alpha(0.5, () => line(28, -60, 34, -10, '#E0B070', 3)); }); }
// ---- reusable sets
function study(t, d, o = {}) { // candlelit Florentine study with dawn window
  const dawn = o.dawn ?? 0.5, cam = o.cam || camAt(t, d), red = o.red || 0;
  layers([
    { z: 0.04, draw: () => {
      fullFill(grad(-200, H, '#120A10', '#050307'));
      // arched window
      const wx = 640, wy = 330, ww = 330, wh = 640;
      const win = new Path2D(); win.moveTo(wx, wy + wh); win.lineTo(wx, wy + ww / 2); win.arc(wx + ww / 2, wy + ww / 2, ww / 2, Math.PI, 0); win.lineTo(wx + ww, wy + wh); win.closePath();
      ctx.save(); ctx.clip(win);
      const sk = ctx.createLinearGradient(0, wy, 0, wy + wh); sk.addColorStop(0, lerpC('#0B1024', M.dawn1, dawn)); sk.addColorStop(0.65, lerpC('#1A1630', M.dawn2, dawn)); sk.addColorStop(1, lerpC('#2A1A20', M.dawn3, dawn));
      ctx.fillStyle = sk; ctx.fillRect(wx, wy, ww, wh);
      glow(wx + ww * 0.55, wy + wh * 0.92, 300, '#FFC27A', 0.55 * dawn);
      ctx.save(); ctx.translate(wx - 220, 0); ctx.scale(0.62, 0.62); florenceSkyline((wy + wh) / 0.62 - 40, lerpC('#06050A', '#3A2030', dawn * 0.5)); ctx.restore();
      ctx.restore();
      P(win, null, '#2A1A12', 22);
      line(wx + ww / 2, wy + 10, wx + ww / 2, wy + wh, '#2A1A12', 12); line(wx, wy + wh * 0.55, wx + ww, wy + wh * 0.55, '#2A1A12', 12);
      // wall texture stones
      alpha(0.25, () => { for (let i = 0; i < 40; i++) P(rr(rnd(i) * W, 120 + rnd(i + 5) * 1100, 90 + rnd(i + 2) * 80, 40, 6), null, '#2A1A1A', 2); });
    } },
    { z: 0.22, draw: () => { // light beam from window + shelves left
      beam(800, 420, 300, 430, 1250, 760, '255,190,120', 0.14 * (0.4 + dawn));
      P(rr(-40, 260, 300, 900, 6), '#0E0806', null);
      for (let r = 0; r < 5; r++) { P(rr(-40, 300 + r * 175, 300, 16, 3), '#1E120A', null);
        for (let b = 0; b < 9; b++) { const h = 100 + rnd(r * 9 + b) * 50; P(rr(-30 + b * 30, 300 + r * 175 - h, 26, h, 3), ['#3A0E0E', '#2A1A0E', '#1E1A12', '#4A2A10'][(r + b) % 4], null); } }
      glow(120, 700, 260, '#000', 0.4);
    } },
    ...(o.pre || []),
    { z: 0.55, draw: () => { // desk
      const dg = ctx.createLinearGradient(0, 1130, 0, 1500); dg.addColorStop(0, '#3E2614'); dg.addColorStop(1, '#120A06');
      P(rr(-200, 1130, W + 400, 520, 0), dg, null); line(-200, 1132, W + 200, 1132, 'rgba(255,200,140,0.35)', 3);
      ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = '#E0A060'; ctx.lineWidth = 2; for (let i = 0; i < 14; i++) { const yy = 1170 + i * i * 4.2; ctx.beginPath(); ctx.moveTo(-200, yy); ctx.bezierCurveTo(300, yy + 8 * Math.sin(i), 700, yy - 10 * Math.cos(i), W + 200, yy + 4); ctx.stroke(); } ctx.restore();
      glow(o.candleX ?? 250, 1230, 420, '#FF9A40', 0.18 * flick(t));
      book(250, 1640, 1.5, t); inkpot(860, 1560, 1.3);
      if (!o.noCandle) candleM(o.candleX ?? 250, 1150, t, 1.15);
      o.desk && o.desk();
    } },
    ...(o.extra || []),
    { z: 1.1, blur: 6, draw: () => { // foreground: blurred chess pieces bottom-left/right
      chessPiece('pawn', 90, 1900, 2.2, '#030203', M.gold, 0.25); chessPiece('king', 1010, 1960, 2.0, '#030203', M.gold, 0.2);
    } },
  ], cam);
  glow(o.candleX ?? 250, 1000, 520, '#FF9A40', 0.12 * flick(t));
  dust(t, 70, [380, 420, 560, 900]);
  if (red) { ctx.fillStyle = `rgba(120,10,10,${0.35 * red})`; ctx.fillRect(0, 0, W, H); }
}
function lerpC(a, b, k) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const r = Math.round(lerp(pa >> 16, pb >> 16, k)), g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, k)), bl = Math.round(lerp(pa & 255, pb & 255, k)); return `rgb(${r},${g},${bl})`; }

function office(t, d, o = {}) { // modern meeting room at dawn: window skyline, long table
  const cam = o.cam || camAt(t, d, 1, 1.07, 26), dawn = o.dawn ?? 0.6, cold = o.cold || 0;
  layers([
    { z: 0.04, draw: () => {
      const sk = ctx.createLinearGradient(0, 200, 0, 1150); sk.addColorStop(0, lerpC('#1C1A34', '#0C1424', cold)); sk.addColorStop(0.7, lerpC('#C46A3E', '#1E2A40', cold)); sk.addColorStop(1, lerpC('#F2B46A', '#2A3650', cold));
      fullFill('#05060A'); ctx.fillStyle = sk; ctx.fillRect(-100, 180, W + 200, 1000);
      glow(560, 1100, 420, lerpC('#FFC27A', '#6A8AC0', cold), 0.6 * (1 - cold * 0.6));
      ctx.fillStyle = lerpC('#140E18', '#0A0E18', cold);
      for (let i = 0; i < 16; i++) { const x = -60 + i * 80, h = 140 + rnd(i + 3) * 420; ctx.fillRect(x, 1150 - h, 70, h); for (let k = 0; k < 10; k++) if (rnd(i * 10 + k) > 0.6) { ctx.fillStyle = 'rgba(255,200,120,0.5)'; ctx.fillRect(x + 10 + (k % 3) * 18, 1150 - h + 20 + Math.floor(k / 3) * 40, 8, 14); ctx.fillStyle = lerpC('#140E18', '#0A0E18', cold); } }
    } },
    { z: 0.18, draw: () => { // window frame mullions
      ctx.fillStyle = '#07070B'; for (let i = 0; i < 5; i++) ctx.fillRect(-20 + i * 280, 150, 24, 1050); ctx.fillRect(-100, 150, W + 200, 40); ctx.fillRect(-100, 1180, W + 200, 30);
      beam(560, 1000, 500, 560, 1500, 1200, lerpC('#FFBE78', '#6A8AC0', cold).replace('rgb(', '').replace(')', ''), 0.1);
    } },
    ...(o.mid || []),
    { z: 0.7, draw: () => { // table
      P(poly([140, 1290, 940, 1290, 1500, 2000, -420, 2000]), grad(1290, 1950, '#1A120E', '#070505'), null); line(140, 1292, 940, 1292, 'rgba(255,190,130,0.4)', 3);
      alpha(0.25, () => P(poly([400, 1300, 680, 1300, 820, 1900, 260, 1900]), grad(1300, 1900, 'rgba(255,190,120,0.5)', 'rgba(255,190,120,0)'), null));
      [[250, 1640, -0.12], [830, 1640, 0.12]].forEach(([lx, ly, r]) => withT(lx, ly, 1.3, r, () => { glow(0, -60, 200, cold ? '#6A9AE0' : '#9AC0FF', 0.25); P(rr(-110, -150, 220, 140, 8), '#14161C', null); P(rr(-100, -142, 200, 124, 4), cold ? '#1A2436' : '#2A3A5A', null); P(poly([-130, 0, 130, 0, 118, -12, -118, -12]), '#22252C', null); }));
      withT(540, 1760, 1.2, 0, () => { P(rr(-34, -70, 68, 74, 10), '#E8E2D6', null); P(new Path2D('M34 -55 Q62 -50 58 -30 Q56 -14 34 -18'), null, '#E8E2D6', 8); });
      o.table && o.table();
    } },
  ], cam);
  dust(t, 40, [100, 500, 880, 800], cold ? '170,190,230' : '255,220,170', 5);
}

// ---- parchment quote card with word-synced reveal
function wrapWords(words, font, maxW) { ctx.font = font; const lines = []; let cur = [];
  words.forEach(w => { const tst = [...cur, w].join(' '); if (ctx.measureText(tst).width > maxW && cur.length) { lines.push(cur); cur = [w]; } else cur.push(w); }); if (cur.length) lines.push(cur); return lines; }
function quoteCard(id, from, text, cite, gold, o = {}) {
  const u = lt(id); const k = easeOut(seg(u, (o.in ?? (wordT(id, from) - 0.45)), (o.in ?? (wordT(id, from) - 0.45)) + 0.5));
  if (k <= 0) return;
  const words = text.split(' '); const size = o.size || 66; const font = `600 ${size}px CrimsonText`;
  const lines = wrapWords(words, font, 800); const lh = size * 1.22; const hh = lines.length * lh + 210; const cy = o.cy || 700;
  withT(W / 2, cy + (1 - k) * 60, 1, (1 - k) * 0.02, () => { alpha(k, () => {
    glow(0, 0, 640, '#000', 0.6);
    const pw = 920, ph = hh; const g = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2); g.addColorStop(0, '#F0E2C2'); g.addColorStop(1, '#D9C292');
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
    const pp = new Path2D(); pp.moveTo(-pw / 2, -ph / 2 + 10); for (let i = 0; i <= 20; i++) pp.lineTo(-pw / 2 + pw * i / 20, -ph / 2 + Math.sin(i * 2.1) * 5); pp.lineTo(pw / 2, ph / 2); for (let i = 20; i >= 0; i--) pp.lineTo(-pw / 2 + pw * i / 20, ph / 2 + Math.sin(i * 1.7) * 5); pp.closePath();
    P(pp, g, null); ctx.restore();
    alpha(0.5, () => { const r = ctx.createRadialGradient(0, 0, 200, 0, 0, 640); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(90,50,10,0.55)'); ctx.fillStyle = r; ctx.fill(pp); });
    txt('“', -pw / 2 + 70, -ph / 2 + 70, 150, M.red, 'CrimsonText', 700);
    let wi = 0; const y0 = -ph / 2 + 110 + lh / 2;
    lines.forEach((ln, li) => { ctx.font = font; const lw = ctx.measureText(ln.join(' ')).width; let x = -lw / 2;
      ln.forEach(w => { const gi = from + wi; const said = u >= wordT(id, Math.min(gi, LINES[id].words.length - 1)) - 0.03; const isG = gold.some(g => w.toLowerCase().replace(/[^a-z]/g, '').startsWith(g));
        const fw = `${isG && said ? 700 : 600} ${size}px CrimsonText`; ctx.font = fw; const ww = ctx.measureText(w + ' ').width;
        const col = said ? (isG ? '#8E1B1B' : '#24170C') : 'rgba(60,40,20,0.28)';
        txt(w, x, y0 + li * lh, size, col, 'CrimsonText', isG && said ? 700 : 600, 'left');
        if (isG && said) { ctx.font = fw; ctx.fillStyle = 'rgba(180,120,30,0.5)'; ctx.fillRect(x, y0 + li * lh + size * 0.42, ctx.measureText(w).width, 4); }
        x += ww; wi++; }); });
    txt(cite, 0, ph / 2 - 62, 40, '#5A3A1A', 'CrimsonText', 600);
  }); });
}

// ---- word-synced captions (≤5 words per chunk, gold key word), band y 1250-1450
const KEY = { n2: ['1512', 'job', 'prison', 'farm', 'power'], n3: ['dust', 'evening'], q1: ['wrote'], n4: ['great', 'four', 'trouble'], n5: ['mind', 'appointment', 'dress'], n6: ['rumi', 'reed', 'crowd', 'happy', 'sad'], q2: ['sighs'], n7: ['lonely', 'full', 'tears'], n8: ['take', 'wrote', 'sang', 'end', 'raw'], n9: ['tonight', 'hour', 'phone', 'one', 'page', 'plan', 'song'], n10: ['alone', 'book', 'flute'], n11: ['awazzzz', 'less'] };
const NOCAP = { q1: 2, q2: 3 }; // from word index n onwards the quote card carries the words
const CAPCH = {};
for (const id in LINES) { const ws = LINES[id].words.map(w => w.slice()); ws.forEach(w => { if (w[2].replace(/[^A-Za-z]/g, '') === 'Awaaz') w[2] = 'Awazzzz'; w[2] = w[2].replace(/\.\.\.$/, '…'); });
  const ch = []; let cur = [];
  ws.forEach((w, k) => { cur.push([w, k]); const endP = /[.?!…:]$/.test(w[2]); if (cur.length >= 5 || endP || (/,$/.test(w[2]) && cur.length >= 3)) { ch.push(cur); cur = []; } }); if (cur.length) ch.push(cur);
  // merge 1-word tail chunks into previous when short
  const out = []; ch.forEach(c => { if (c.length === 1 && out.length && out[out.length - 1].length <= 3 && !/[.?!…]$/.test(out[out.length - 1][out[out.length - 1].length - 1][0][2])) out[out.length - 1].push(...c); else out.push(c); });
  CAPCH[id] = out; }
function captions() {
  for (const id of Object.keys(LINES).filter(i => act(i, 0.05) && GT >= LINES[i].start - 0.08).sort((a, b) => LINES[b].start - LINES[a].start).slice(0, 1)) { if (id === 'h1') continue; const u = lt(id); const chs = CAPCH[id];
    let ci = chs.findIndex((c, i) => u >= c[0][0][0] - 0.08 && (i === chs.length - 1 || u < chs[i + 1][0][0][0] - 0.08));
    if (ci < 0) continue; const c = chs[ci];
    if (id in NOCAP && c[0][1] >= NOCAP[id]) continue;
    const endT = c[c.length - 1][0][0] + c[c.length - 1][0][1] + 0.5; if (u > endT && ci === chs.length - 1) continue;
    const pop = 1 + 0.07 * (1 - seg(u - c[0][0][0], -0.08, 0.1));
    const words = c.map(x => x[0][2]); const size = 74; ctx.font = `900 ${size}px Montserrat`;
    // up to 2 lines
    let lines = [words]; if (ctx.measureText(words.join(' ')).width > 900) { const h = Math.ceil(words.length / 2); lines = [words.slice(0, h), words.slice(h)]; }
    withT(W / 2, 1350, pop, 0, () => { let k = 0;
      lines.forEach((ln, li) => { const y = (li - (lines.length - 1) / 2) * (size * 1.12); ctx.font = `900 ${size}px Montserrat`; const lw = ctx.measureText(ln.join(' ')).width; let x = -lw / 2;
        ln.forEach(w => { const wi = c[k][1]; const said = u >= LINES[id].words[wi][0] - 0.04; const key = (KEY[id] || []).some(g => w.toLowerCase().replace(/[^a-z]/g, '').startsWith(g));
          ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
          ctx.strokeStyle = 'rgba(0,0,0,0.92)'; ctx.lineWidth = 14; ctx.strokeText(w, x, y);
          ctx.fillStyle = key ? M.gold2 : (said ? '#FFFFFF' : 'rgba(255,255,255,0.78)'); ctx.fillText(w, x, y);
          x += ctx.measureText(w + ' ').width; k++; }); }); });
  }
}
// ---- persistent overlays
function watermark(T) {
  const L = document.getElementById('logo'); const x = 78, y = 118, r = 40;
  alpha(0.92, () => { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.clip(); if (L && L.complete) ctx.drawImage(L, x - r * 1.04, y - r * 1.04, r * 2.08, r * 2.08); ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.strokeStyle = M.gold; ctx.lineWidth = 3; ctx.stroke(); });
  const k = 1 - seg(T, 3.2, 3.7); if (k > 0) alpha(k, () => { ctx.font = '700 30px Oswald'; const s = 'MIND vs HEART'; const w = ctx.measureText(s).width + 36; P(rr(132, 98, w, 42, 21), 'rgba(10,6,8,0.7)', M.gold, 2); txt(s, 132 + w / 2, 120, 30, M.gold2, 'Oswald', 700); });
}
function bigText(s, x, y, size, col, k, font = 'Montserrat', wt = 900) { if (k <= 0) return; withT(x, y, lerp(1.25, 1, easeOut(k)), 0, () => alpha(k, () => { ctx.font = `${wt} ${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.lineWidth = size * 0.16; ctx.strokeText(s, 0, 0); ctx.fillStyle = col; ctx.fillText(s, 0, 0); })); }
function flash(t, col = '255,255,255', d = 0.25, a = 0.6) { if (t >= 0 && t < d) { ctx.fillStyle = `rgba(${col},${(1 - t / d) * a})`; ctx.fillRect(0, 0, W, H); } }


// ================= LION & FOX (stylised silhouettes, back-lit rim) =================
// draws a list of parts twice: rim colour offset first, then the dark body on top → crisp rim light on one edge
function rimDraw(parts, rim, rimA, off = [6, -4], body = '#050407') {
  const draw = (col) => parts.forEach(p => { if (p.s) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = p.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(p.s); ctx.restore(); } else P(p, col, null); });
  if (rim && rimA > 0) { ctx.save(); ctx.globalAlpha *= rimA; ctx.translate(off[0], off[1]); draw(rim); ctx.restore(); }
  draw(body);
}
// lion facing right, feet on y=0, ~400 px tall, ~640 px long at s=1
function tleg(lx, top, w0, w1) { return poly([lx - w0 / 2, top, lx + w0 / 2, top, lx + w1 / 2 + 4, -14, lx + w1 / 2 + 10, 0, lx - w1 / 2, 0]); }
function lion(x, y, s, t, o = {}) {
  withT(x, y, s, 0, () => { if (o.f === -1) ctx.scale(-1, 1);
    const sw = Math.sin(t * 1.6) * 14, br = Math.sin(t * 1.2) * 3;
    const parts = [];
    parts.push(ell(-20, -200 + br, 185, 82), ell(110, -212 + br, 92, 98));
    [[-150, 56, 40], [-95, 52, 38], [80, 58, 42], [140, 56, 40]].forEach(([lx, w0, w1]) => parts.push(tleg(lx, -175, w0, w1)));
    const tail = new Path2D(); tail.moveTo(-190, -235 + br); tail.bezierCurveTo(-255, -225, -280, -160 + sw, -292, -105 + sw); parts.push({ s: tail, w: 15 }); parts.push(ell(-294, -96 + sw, 19, 28, 0.3));
    const mane = new Path2D(); const mx = 175, my = -310 + br;
    for (let i = 0; i <= 28; i++) { const a = -Math.PI * 0.95 + i * (Math.PI * 1.9 / 28); const r = (i % 2 ? 122 : 152) + Math.sin(t * 2 + i) * 4; const px = mx + Math.cos(a) * r * 0.92, py = my + Math.sin(a) * r; i ? mane.lineTo(px, py) : mane.moveTo(px, py); }
    mane.closePath(); parts.push(mane);
    parts.push(ell(238, -296 + br, 72, 64), rr(252, -302 + br, 90, 60, 26), circ(198, -370 + br, 22));
    rimDraw(parts, o.rim || M.gold2, o.rimA ?? 0.9, o.off || [7, -5]);
    if (o.eye) { glow(268, -316 + br, 26, '#FFD27A', 0.8 * o.eye); P(ell(268, -316 + br, 7, 4), `rgba(255,214,130,${o.eye})`, null); }
  });
}
// fox facing right, feet on y=0, ~340 px tall, ~540 px long at s=1 (o.wolf: heavier, lower tail, red eyes)
const FOXHEAD = [150, -250];
function fox(x, y, s, t, o = {}) {
  withT(x, y, s, 0, () => { if (o.f === -1) ctx.scale(-1, 1);
    const wf = o.wolf ? 1 : 0, sw = Math.sin(t * 2.2 + (o.ph || 0)) * 0.07, br = Math.sin(t * 1.5) * 2, hy = -250 + br + 18 * wf;
    const parts = [];
    parts.push(ell(0, -138 + br, 122 + 25 * wf, 46 + 16 * wf));
    parts.push(poly([62, -172 + br, 122, hy + 10, 165, hy + 30, 140, -140, 90, -108]));
    [[-98, 30, 16], [-68, 28, 15], [76, 28, 15], [104, 28, 15]].forEach(([lx, w0, w1]) => parts.push(tleg(lx, -130, w0 + 8 * wf, w1 + 5 * wf)));
    parts.push(ell(150, hy, 42 + 6 * wf, 36 + 4 * wf));
    parts.push(poly([164, hy - 24, 248 + 18 * wf, hy + 12, 244 + 18 * wf, hy + 22, 158, hy + 28]));
    parts.push(poly([124, hy - 18, 128, hy - 86 + 22 * wf, 154, hy - 28]), poly([150, hy - 28, 170, hy - 90 + 22 * wf, 184, hy - 22]));
    const tp = new Path2D(); const r = (o.wolf ? -0.75 : -0.37) + sw;
    tp.ellipse(-200 + 15 * wf, -118 + br + 15 * wf, 104 - 20 * wf, 34 - 4 * wf, r, 0, 6.283); parts.push(tp);
    rimDraw(parts, o.rim || '#F08A3C', o.rimA ?? 0.9, o.off || [6, -5]);
    if (o.eye) { glow(176, hy - 6, 30, o.eyeCol || '#FFB040', 0.9 * o.eye); P(ell(176, hy - 6, 8, 4, 0.3), o.eyeCol || '#FFC860', null); }
  });
}
function foxHead(X, Y, s, f = 1) { return [X + f * FOXHEAD[0] * s, Y + FOXHEAD[1] * s]; }
function snare(x, y, s, t, tight = 0, lit = 0) { // rope snare: peg + noose loop on the ground
  withT(x, y, s, 0, () => {
    if (lit) glow(0, -10, 180, '#FFD27A', 0.5 * lit);
    P(poly([-8, -150, 8, -150, 4, 0, -4, 0]), '#2A1A0E', null);
    ctx.save(); ctx.strokeStyle = lit ? lerpC('#8A6A3A', '#FFD27A', lit) : '#8A6A3A'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -140); ctx.bezierCurveTo(30, -150, 60, -60, 50, -20); ctx.stroke();
    const r = lerp(80, 26, tight); ctx.beginPath(); ctx.ellipse(50 + r * 0.2, -10, r, r * 0.32, 0, 0, 6.283); ctx.stroke(); ctx.restore();
  });
}
function jawTrap(x, y, s, col = M.red2) { // tiny toothed trap icon (in the small print)
  withT(x, y, s, 0, () => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.arc(0, 0, 40, Math.PI, 0); ctx.stroke(); ctx.beginPath(); for (let i = 0; i <= 8; i++) { const a = Math.PI + i * Math.PI / 8; const r = i % 2 ? 26 : 40; const px = Math.cos(a) * r, py = Math.sin(a) * r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
    line(-50, 0, 50, 0, col, 6); P(circ(0, 0, 8), col, null); ctx.restore(); });
}
function magnifier(x, y, s, r = 120) { withT(x, y, s, 0, () => { ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = '#1A120B'; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(r * 0.72, r * 0.72); ctx.lineTo(r * 1.6, r * 1.6); ctx.stroke(); ctx.lineWidth = 14; ctx.strokeStyle = M.gold; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.stroke(); ctx.restore(); }); }
function mask(x, y, s, t) { // theatre mask (plain, smiling)
  withT(x, y, s, 0, () => { glow(0, 0, 160, '#F6E2B0', 0.25);
    const p = new Path2D(); p.moveTo(-80, -70); p.bezierCurveTo(-40, -100, 40, -100, 80, -70); p.bezierCurveTo(90, 10, 50, 90, 0, 100); p.bezierCurveTo(-50, 90, -90, 10, -80, -70); p.closePath();
    P(p, '#EFE3C6', '#3A2A1A', 4);
    P(ell(-34, -24, 20, 11, 0.15), '#0A0608', null); P(ell(34, -24, 20, 11, -0.15), '#0A0608', null);
    ctx.save(); ctx.strokeStyle = '#0A0608'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 18, 38, 0.35, Math.PI - 0.35); ctx.stroke(); ctx.restore();
    alpha(0.4, () => P(ell(-44, 22, 14, 8), '#D88A7A', null)); alpha(0.4, () => P(ell(44, 22, 14, 8), '#D88A7A', null));
    line(-80, -60, -130, -40, '#8E1B1B', 5); line(80, -60, 130, -40, '#8E1B1B', 5); });
}
function contract(x, y, s, t, o = {}) { // agreement page; o.sig 0..1 signature, o.lens {x,y,k}
  withT(x, y, s, 0, () => {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16; P(rr(-300, -380, 600, 760, 8), grad(-380, 380, '#F2EADA', '#D8CCB0'), null); ctx.restore();
    txt('AGREEMENT', 0, -310, 50, '#24170C', 'Oswald', 700); line(-230, -270, 230, -270, '#8A6A3A', 3);
    for (let i = 0; i < 9; i++) P(rr(-230, -230 + i * 34, 460 - (i % 3) * 60, 12, 6), 'rgba(40,30,20,0.35)', null);
    for (let i = 0; i < 5; i++) P(rr(-230, 90 + i * 14, 460, 5, 2), 'rgba(40,30,20,0.3)', null);   // small print
    txt('SIGN HERE', -120, 220, 26, '#8E1B1B', 'Oswald', 700); line(-230, 290, 60, 290, '#24170C', 3);
    const sg = o.sig || 0; if (sg > 0) { ctx.save(); ctx.strokeStyle = '#13235A'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); const n = Math.floor(sg * 40);
      for (let i = 0; i <= n; i++) { const u = i / 40; const px = -210 + u * 250, py = 270 - Math.sin(u * 18) * 22 * (1 - u * 0.4) - u * 10; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.restore(); }
    if (o.lens) { const { x: lx, y: ly, k } = o.lens; if (k > 0) alpha(k, () => { ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, 120, 0, 6.283); ctx.clip(); P(rr(lx - 130, ly - 130, 260, 260, 0), '#F6F0E2', null);
      txt('…clause 14(c):', lx, ly - 66, 30, '#24170C', 'CrimsonText', 700); jawTrap(lx, ly + 20, 1.3); txt('no way out', lx, ly + 72, 30, M.red, 'CrimsonText', 700); ctx.restore(); magnifier(lx, ly, 1, 120); }); }
  });
}
function bookIcon(x, y, s) { withT(x, y, s, 0, () => { P(poly([-60, 30, 0, 40, 0, -40, -55, -50]), M.parch, null); P(poly([0, 40, 60, 30, 55, -50, 0, -40]), M.parch2, null); }); }
// ground plane / floor for animal scenes
function floorSet(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.08, 24); const dawn = o.dawn ?? 0.5;
  layers([
    { z: 0.03, draw: () => { const sk = ctx.createLinearGradient(0, 0, 0, 1250); sk.addColorStop(0, lerpC('#07060C', '#1A1530', dawn)); sk.addColorStop(0.7, lerpC('#120A10', '#7A3A2A', dawn)); sk.addColorStop(1, lerpC('#1A0E0E', '#E8A060', dawn)); fullFill(sk);
      glow(W / 2, 1150, 520, '#FFC27A', 0.35 * dawn); ctx.save(); ctx.translate(-160, 0); ctx.scale(1.1, 1); florenceSkyline(1180, lerpC('#05040A', '#2A1420', dawn)); ctx.restore(); } },
    { z: 0.25, draw: () => { alpha(0.9, () => board(W / 2, 1150, 2100, 8, t, o.spot || null, 760)); } },
    ...(o.mid || []),
    { z: 1.1, blur: 6, draw: () => { chessPiece('pawn', 80, 1920, 2.1, '#030203', M.gold, 0.25); chessPiece('king', 1020, 1980, 1.9, '#030203', M.gold, 0.2); } },
  ], cam);
  dust(t, 60, [0, 300, W, 1000], '255,220,170', o.seed || 3);
}

// ===== "Half Your Life Is Luck" — scene set for The Prince, Ch. 25 (fortune and the raging river)
// New props: fortune coin, storm (rain + lightning), perspective river with flood / barriers / canal / bend, brick wall, boat.

function rainFx(t, k, seed = 1, area = [0, 0, W, H], n = 150) {
  if (k <= 0) return; ctx.save(); ctx.globalAlpha = 0.55 * k; ctx.strokeStyle = 'rgba(175,195,235,0.7)'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  const [x0, y0, w, h] = area;
  for (let i = 0; i < n; i++) { const x = x0 + ((rnd(i + seed) * (w + 200) + t * 260) % (w + 200)) - 100, y = y0 + ((rnd(i * 3.1 + seed) * h + t * 1900) % h); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 16, y + 58); ctx.stroke(); }
  ctx.restore();
}
function bolt(x, y, len, seed, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#EAF2FF'; ctx.lineWidth = 7; ctx.shadowColor = '#9FC4FF'; ctx.shadowBlur = 30; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); let cx = x, cy = y; for (let i = 1; i <= 8; i++) { cx += (rnd(seed + i) - 0.5) * 120; cy += len / 8; ctx.lineTo(cx, cy); } ctx.stroke(); ctx.restore(); }
function lightning(u, at, x = 760, y = 160, len = 700, seed = 3) { const dt = u - at; if (dt < 0 || dt > 0.45) return; const a = dt < 0.08 ? 1 : (dt < 0.16 ? 0.3 : (dt < 0.24 ? 0.9 : 1 - (dt - 0.24) / 0.21));
  ctx.fillStyle = `rgba(200,220,255,${0.32 * a})`; ctx.fillRect(0, 0, W, H); bolt(x, y, len, seed, a); }
function cloudBank(y, col, a = 1, t = 0, seed = 1) { alpha(a, () => { for (let i = 0; i < 9; i++) { const x = -100 + i * 160 + Math.sin(t * 0.3 + i) * 20; P(ell(x, y + rnd(i + seed) * 70, 170 + rnd(i * 2 + seed) * 80, 80 + rnd(i * 5 + seed) * 40), col, null); } }); }

// ---- fortune coin: spinning disc, left half storm, right half gold
function fortuneCoin(x, y, r, spin, split = 0, t = 0) {
  const sx = Math.max(0.06, Math.abs(Math.cos(spin)));
  withT(x, y, 1, 0, () => { ctx.save(); ctx.scale(sx, 1);
    glow(0, 0, r * 1.8, '#E2B04A', 0.35);
    P(circ(0, 0, r + 14), '#5A3A10', null);
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.clip();
    P(rr(-r, -r, 2 * r, 2 * r, 0), grad(-r, r, '#F6D27A', '#B07A20'), null);
    // dark half (luck/storm) slides in with split
    const dk = split; if (dk > 0) { ctx.fillStyle = `rgba(16,24,44,${0.96 * dk})`; ctx.fillRect(-r, -r, r, 2 * r);
      alpha(dk, () => { cloudBank(-r * 0.25, '#2A3550', 1, t, 4); ctx.save(); ctx.strokeStyle = '#DDE8FF'; ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-r * 0.45, -r * 0.1); ctx.lineTo(-r * 0.62, r * 0.25); ctx.lineTo(-r * 0.42, r * 0.22); ctx.lineTo(-r * 0.58, r * 0.6); ctx.stroke(); ctx.restore(); });
      alpha(dk, () => { chessPiece('king', r * 0.45, r * 0.55, 1.1, '#3A2208', '#FFF0C0', 0.6); }); }
    else { txt('?', 0, 8, r * 1.1, '#6A4510', 'CrimsonText', 700); }
    ctx.restore();
    ctx.save(); ctx.strokeStyle = '#FFE7A0'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.stroke(); ctx.setLineDash([4, 14]); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r - 22, 0, 6.2832); ctx.stroke(); ctx.restore();
    if (split > 0) { ctx.fillStyle = '#FFE7A0'; ctx.fillRect(-3, -r, 6, 2 * r * split); }
    ctx.restore(); });
}

// ---- perspective river set: o.flood 0..1, o.wall 0..1 (barriers height), o.calm 0..1 (weather), o.canal 0..1, o.bend -1..1
const HY = 820;
function rp(p) { return HY + Math.pow(p, 1.35) * (H + 160 - HY); }           // depth p (0 horizon .. 1 bottom) -> screen y
function riverGeom(o) { const bend = o.bend || 0, fl = o.flood ?? 0, wl = o.wall ?? 0;
  return p => { const y = rp(p); const cx = W / 2 + bend * 460 * Math.pow(1 - p, 1.6) - bend * 60 * p; const hw = 30 + p * 520 * (1 + 0.35 * fl * (1 - wl)); return { y, cx, hw }; }; }
function brick(x, y, w, h, c1 = '#6A4A34', c2 = '#3A2618') { P(rr(x, y, w, h, 3), grad(y, y + h, c1, c2), 'rgba(20,10,5,0.9)', 2); }
function brickWall(x, y, w, h, k, o = {}) { // builds row by row from bottom, k 0..1
  const bw = o.bw || 90, bh = o.bh || 40, rows = Math.round(h / bh), tot = rows; const built = k * tot;
  for (let r = 0; r < rows; r++) { const rk = clamp(built - r, 0, 1); if (rk <= 0) break; const off = (r % 2) * bw / 2; const yy = y + h - (r + 1) * bh;
    for (let c = -1; c * bw < w + bw; c++) { const xx = x + c * bw + off; if (xx + bw < x || xx > x + w) continue; const ck = clamp(rk * 1.4 - (c / (w / bw)) * 0.4, 0, 1); if (ck <= 0) continue;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y - 400, w, h + 400); ctx.clip(); withT(0, (1 - easeOut(ck)) * -120, 1, 0, () => alpha(ck, () => brick(xx + 2, yy + 2, bw - 4, bh - 4, o.c1, o.c2))); ctx.restore(); } }
  if (o.gold != null) { const r = Math.floor(rows * 0.5), xx = x + Math.floor(w / bw / 2) * bw + (r % 2) * bw / 2, yy = y + h - (r + 1) * bh; glow(xx + bw / 2, yy + bh / 2, 160, '#FFD27A', 0.7 * o.gold); alpha(o.gold, () => brick(xx + 2, yy + 2, bw - 4, bh - 4, '#FFE29A', '#C88A2A')); }
}
function riverSet(t, d, o = {}) {
  const fl = o.flood ?? 1, wl = o.wall ?? 0, calm = o.calm ?? 0, can = o.canal ?? 0, cam = o.cam || camAt(t, d, 1, 1.08, 20); const G = riverGeom(o);
  const N = 40;
  layers([
    { z: 0.03, draw: () => { // sky: storm -> dawn
      const sk = ctx.createLinearGradient(0, 0, 0, HY + 40); sk.addColorStop(0, lerpC('#0A0E1C', '#1E1A36', calm)); sk.addColorStop(0.7, lerpC('#1A2234', '#B8603C', calm)); sk.addColorStop(1, lerpC('#2A3248', '#F4B870', calm)); fullFill(sk);
      glow(W / 2 + 120, HY - 20, 520, '#FFC27A', 0.55 * calm); if (calm > 0) alpha(calm, () => P(circ(W / 2 + 120, HY - 10, 90), '#FFE7B0', null));
      cloudBank(260, lerpC('#1A2030', '#4A2A3A', calm), 0.95 - 0.55 * calm, t, 2); cloudBank(420, lerpC('#222A3C', '#6A3A3A', calm), 0.85 - 0.6 * calm, t * 1.3, 7);
      // distant Tuscan hills + Florence
      ctx.fillStyle = lerpC('#0C101A', '#3A2030', calm); ctx.beginPath(); ctx.moveTo(-200, HY + 10); for (let i = 0; i <= 12; i++) ctx.lineTo(-200 + i * 125, HY - 40 - 50 * Math.sin(i * 1.3) - 30 * rnd(i)); ctx.lineTo(W + 200, HY + 10); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(W * 0.55, 0); ctx.scale(0.45, 0.45); florenceSkyline((HY + 6) / 0.45, lerpC('#06080E', '#2A1420', calm)); ctx.restore();
    } },
    { z: 0.3, draw: () => { // plains + river body
      P(rr(-300, HY, W + 600, H, 0), grad(HY, H, lerpC('#141A16', '#3A3020', calm), '#050605'), null);
      // fields stripes
      alpha(0.25, () => { for (let i = 1; i < 14; i++) { const y = rp(i / 14); line(-300, y, W + 300, y, '#000', 2); } });
      // river polygon
      const L = [], R = []; for (let i = 0; i <= N; i++) { const g = G(i / N); L.push([g.cx - g.hw, g.y]); R.push([g.cx + g.hw, g.y]); }
      const rv = new Path2D(); rv.moveTo(...L[0]); L.forEach(q => rv.lineTo(...q)); R.reverse().forEach(q => rv.lineTo(...q)); rv.closePath();
      P(rv, grad(HY, H, lerpC('#2A3A52', '#C07A4A', calm * 0.8), lerpC('#0A1220', '#1A2A3A', calm)), null);
      // canal (branch to the right) glowing gold when built
      if (can > 0) { const g = G(0.42), g2 = G(0.32); alpha(can, () => { const c = new Path2D(); c.moveTo(g.cx + g.hw - 10, g.y); c.lineTo(W + 200, g.y - 70); c.lineTo(W + 200, g2.y - 120); c.lineTo(g2.cx + g2.hw - 10, g2.y); c.closePath(); P(c, grad(g2.y - 120, g.y, '#E2A060', '#5A4A50'), null); line(g.cx + g.hw, g.y, W + 200, g.y - 70, '#8A6A4A', 6); }); }
      // flood water spreading over the plains
      const ov = fl * (1 - wl); if (ov > 0.02) { ctx.save(); ctx.globalAlpha = 0.75 * ov; ctx.fillStyle = grad(HY, H, '#2A3A52', '#101A28'); ctx.beginPath(); ctx.moveTo(-300, H + 200);
        for (let i = 0; i <= N; i++) { const g = G(i / N); ctx.lineTo(g.cx - g.hw - ov * 700 * (i / N) - 40 * Math.sin(i + t * 3), g.y); }
        for (let i = N; i >= 0; i--) { const g = G(i / N); ctx.lineTo(g.cx + g.hw + ov * 700 * (i / N) + 40 * Math.sin(i * 1.3 + t * 3), g.y); }
        ctx.lineTo(W + 300, H + 200); ctx.closePath(); ctx.fill(); ctx.restore(); }
      // waves rushing toward the viewer
      const sp = 0.12 + 0.35 * fl * (1 - 0.5 * calm);
      for (let j = 0; j < 22; j++) { const p = (j / 22 + t * sp) % 1; const g = G(p); const amp = (3 + 26 * fl * (1 - calm * 0.6)) * p;
        ctx.save(); ctx.globalAlpha = 0.25 + 0.5 * p; ctx.strokeStyle = lerpC('#BFD4F0', '#FFE0B0', calm); ctx.lineWidth = 1.5 + 4 * p; ctx.beginPath();
        for (let k = 0; k <= 16; k++) { const x = g.cx - g.hw * 0.92 + (2 * g.hw * 0.92) * k / 16; const y = g.y + Math.sin(k * 1.7 + j * 2 + t * 5) * amp; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); }
      // debris swept along by the flood (tree trunks, a roof)
      if (fl > 0.3 && calm < 0.6) for (let i = 0; i < 4; i++) { const p = (i / 4 + t * 0.16) % 1; const g = G(p); const s = 0.2 + p * 1.2; alpha(fl * (1 - calm), () => withT(g.cx + (rnd(i) - 0.5) * g.hw, g.y, s, Math.sin(t * 2 + i) * 0.4, () => {
        if (i % 2) { P(rr(-60, -10, 120, 20, 8), '#2A1A10', null); line(-20, -10, -40, -40, '#2A1A10', 6); } else { P(poly([-50, 0, 0, -36, 50, 0]), '#3A1A14', null); P(rr(-40, 0, 80, 26, 2), '#1A1210', null); } })); }
    } },
    { z: 0.6, draw: () => { // barriers along both banks (perspective brick walls)
      if (wl <= 0) return;
      [-1, 1].forEach(sd => { for (let i = 2; i < N; i++) { const p0 = i / N, p1 = (i + 1) / N; const a = G(p0), b = G(p1); const h0 = wl * (8 + 150 * p0), h1 = wl * (8 + 150 * p1);
        const x0 = a.cx + sd * (a.hw + 4), x1 = b.cx + sd * (b.hw + 4); const f = new Path2D(); f.moveTo(x0, a.y); f.lineTo(x1, b.y); f.lineTo(x1, b.y - h1); f.lineTo(x0, a.y - h0); f.closePath();
        P(f, i % 2 ? '#5A4030' : '#4A3426', 'rgba(15,8,4,0.8)', 1.5); const top = new Path2D(); top.moveTo(x0, a.y - h0); top.lineTo(x1, b.y - h1); ctx.strokeStyle = lerpC('#8A6A4A', '#F0C080', calm); ctx.lineWidth = 2 + 4 * p1; ctx.stroke(top); } });
    } },
    ...(o.mid || []),
    { z: 1.1, blur: 6, draw: () => { // foreground reeds + stones
      for (let i = 0; i < 18; i++) { const x = i < 9 ? -40 + i * 26 : W - 200 + (i - 9) * 26; const h = 220 + rnd(i) * 200; const sw = Math.sin(t * 1.5 + i) * (10 + 30 * fl * (1 - calm));
        ctx.save(); ctx.strokeStyle = '#030403'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(x, H + 20); ctx.quadraticCurveTo(x + sw * 0.5, H - h * 0.5, x + sw, H - h); ctx.stroke(); ctx.restore(); }
      P(ell(80, H + 10, 220, 90), '#030303', null); P(ell(W - 60, H + 20, 240, 100), '#030303', null);
    } },
  ], cam);
  rainFx(t, fl * (1 - calm), 5);
  dust(t, 40, [0, 300, W, 900], '255,220,170', o.seed || 9);
}
function boat(x, y, s, rot, t, o = {}) { withT(x, y + Math.sin(t * 2.2) * 4 * s, s, rot, () => {
  glow(0, -60, 160, o.glowCol || '#FFC27A', o.glow ?? 0.3);
  P(new Path2D('M-90 0 Q0 40 90 0 L70 -24 L-70 -24 Z'), '#120A06', null); line(0, -24, 0, -200, '#120A06', 7);
  P(poly([4, -196, 4, -40, 92, -50]), o.sail || '#E8D8B4', '#120A06', 3); P(poly([-4, -170, -4, -50, -62, -56]), o.sail2 || '#CDB68A', '#120A06', 3);
  if (o.rim) { ctx.save(); ctx.globalAlpha = 0.8; ctx.strokeStyle = o.rim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-90, 0); ctx.quadraticCurveTo(0, 40, 90, 0); ctx.stroke(); ctx.restore(); }
}); }
function rock(x, y, s, col = '#0C0A0A') { withT(x, y, s, 0, () => { P(poly([-70, 0, -50, -50, -10, -80, 40, -60, 70, 0]), col, null); alpha(0.5, () => line(-10, -80, 40, -60, '#C0392B', 3)); }); }
function chipTop(s, y = 300, col = M.gold) { ctx.font = '600 44px CrimsonText'; const w = ctx.measureText(s).width + 56; P(rr(W / 2 - w / 2, y - 37, w, 74, 37), 'rgba(10,6,8,0.62)', col, 2); txt(s, W / 2, y, 44, M.parch, 'CrimsonText', 600); }

// ================= SCENES =================

const R = { sky0: '#02040C', sky1: '#061230', sky2: '#0D2C4C', teal: '#1E6F78', teal2: '#3FA7A8', moon: '#F4EBCB', body: '#03050B' };
function sc(id) { return SCENES.find(s => s.id === id); }
function wT(id, k) { return LINES[id].words[k][0]; }

function starsT(t, n = 170, ymax = 1150, seed = 3) {
  for (let i = 0; i < n; i++) {
    const x = rnd(i * 3 + seed) * W, y = rnd(i * 5 + seed) * ymax, big = rnd(i * 7 + seed) < 0.08;
    const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (1 + rnd(i) * 2.5) + i));
    ctx.fillStyle = `rgba(255,246,222,${(0.25 + rnd(i * 11) * 0.6) * tw})`; ctx.beginPath(); ctx.arc(x, y, big ? 3.2 : 1.6, 0, 6.283); ctx.fill();
    if (big) glow(x, y, 16, '#FFF6DE', 0.25 * tw);
  }
  alpha(0.1, () => { for (let i = 0; i < 260; i++) { const u = rnd(i + 900); const x = u * W, y = 120 + u * 700 + (rnd(i + 77) - 0.5) * 220; ctx.fillStyle = '#CFE2FF'; ctx.fillRect(x, y, 2, 2); } });
}
function moon(x, y, r, t) {
  glow(x, y, r * 6, '#7FA8D8', 0.28); glow(x, y, r * 2.4, '#F4EBCB', 0.5);
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); g.addColorStop(0, '#FFFBEA'); g.addColorStop(1, '#E6D8A8');
  P(circ(x, y, r), g, null);
  alpha(0.12, () => { P(circ(x + r * 0.3, y - r * 0.2, r * 0.22), '#8A7A50', null); P(circ(x - r * 0.35, y + r * 0.25, r * 0.15), '#8A7A50', null); P(circ(x + r * 0.05, y + r * 0.45, r * 0.1), '#8A7A50', null); });
}
function dunePath(y, amp, seed) { const p = new Path2D(); p.moveTo(-400, H + 600); for (let x = -400; x <= W + 400; x += 20) p.lineTo(x, y + amp * Math.sin(x * 0.0042 + seed) + amp * 0.45 * Math.sin(x * 0.011 + seed * 2.1)); p.lineTo(W + 400, H + 600); p.closePath(); return p; }
function dunes(y, amp, col, seed, rim = null, rimW = 4) {
  const p = dunePath(y, amp, seed); P(p, col, null);
  if (rim) { ctx.save(); ctx.clip(p); ctx.strokeStyle = rim; ctx.lineWidth = rimW * 2; ctx.stroke(p); ctx.restore(); }
}
function ripples(y0, n, col = 'rgba(160,190,230,0.12)', seed = 1) { ctx.strokeStyle = col; ctx.lineWidth = 2; for (let i = 0; i < n; i++) { const y = y0 + i * i * 3.2; ctx.beginPath(); for (let x = -300; x <= W + 300; x += 30) { const yy = y + 10 * Math.sin(x * 0.012 + i * 1.7 + seed); x === -300 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); } }
function lantern(x, y, s, t, chain = 420) {
  withT(x, y, s, Math.sin(t * 0.9 + x) * 0.03, () => {
    line(0, -chain, 0, -92, '#0E0A06', 4);
    glow(0, 5, 260 * flick(t + x), '#FFB45A', 0.42); glow(0, 5, 90, '#FFE2A0', 0.5);
    P(poly([-34, -60, 34, -60, 20, -96, -20, -96]), '#2A1A0A', null); P(circ(0, -102, 8), '#3A2410', null);
    const b = new Path2D(); b.moveTo(-40, -60); b.lineTo(40, -60); b.lineTo(54, 0); b.lineTo(40, 70); b.lineTo(-40, 70); b.lineTo(-54, 0); b.closePath();
    const g = ctx.createLinearGradient(0, -60, 0, 70); g.addColorStop(0, '#FFE19A'); g.addColorStop(0.5, '#F2A040'); g.addColorStop(1, '#A8521A');
    P(b, g, null);
    ctx.save(); ctx.clip(b); ctx.strokeStyle = 'rgba(40,20,6,0.85)'; ctx.lineWidth = 5; for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(i * 18, -70); ctx.lineTo(i * 18 + 60, 80); ctx.moveTo(i * 18, -70); ctx.lineTo(i * 18 - 60, 80); ctx.stroke(); } ctx.restore();
    P(b, null, '#2A1A0A', 5); P(poly([-40, 70, 40, 70, 18, 96, -18, 96]), '#2A1A0A', null);
  });
}
// reed flute (ney): centred at (x,y), length len, angle rot; lit = 0..1 inner light
function ney(x, y, len, rot, s = 1, lit = 0, holes = 1) {
  withT(x, y, s, rot, () => {
    const th = 24, L = len / 2;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12;
    const g = ctx.createLinearGradient(0, -th, 0, th); g.addColorStop(0, '#E8C98A'); g.addColorStop(0.45, '#B48A4E'); g.addColorStop(1, '#5A3E1E');
    P(rr(-L, -th / 2, len, th, th / 2), g, null); ctx.restore();
    for (let k = 1; k < 7; k++) { const nx = -L + len * k / 7; P(rr(nx - 4, -th / 2 - 2, 8, th + 4, 3), '#6A4A22', null); }
    P(rr(-L - 8, -th / 2 - 4, 46, th + 8, 6), '#C9962E', '#5A3A10', 2); // mouthpiece cap
    line(-L + 20, -th / 2 + 5, L - 10, -th / 2 + 5, 'rgba(255,240,200,0.55)', 3);
    for (let h = 0; h < 6; h++) { const hx = L * 0.12 + h * L * 0.13; const hk = holes * clamp(h + 1 - (1 - holes) * 6); if (hk <= 0) continue;
      P(ell(hx, 0, 6.5, 5), '#1A0E04', null); if (lit > 0) glow(hx, 0, 34, '#FFE2A0', 0.55 * lit); }
    if (lit > 0) { glow(L, 0, 120 * lit, '#FFE2A0', 0.6 * lit); glow(-L, 0, 80 * lit, '#FFE2A0', 0.4 * lit); }
  });
}
// sound waves leaving a point, aimed at angle dir
function waves(x, y, t, dir = 0, n = 5, reach = 520, a = 0.5, col = '246,210,122') {
  for (let i = 0; i < n; i++) { const ph = (t * 0.55 + i / n) % 1; const r = 40 + ph * reach;
    ctx.strokeStyle = `rgba(${col},${(1 - ph) * a})`; ctx.lineWidth = 6 * (1 - ph) + 1.5; ctx.beginPath(); ctx.arc(x, y, r, dir - 0.45, dir + 0.45); ctx.stroke(); }
}
// stylised whirling silhouette (no face), feet at (x,y); spin = phase
function whirler(x, y, s, t, spin, rim = R.teal2, rimA = 0.8) {
  withT(x, y, s, 0, () => {
    const hw = 170 + 22 * Math.sin(spin * 2);
    const sk = new Path2D(); sk.moveTo(-46, -300); sk.bezierCurveTo(-90, -200, -hw * 0.9, -90, -hw, 0);
    for (let xx = -hw; xx <= hw; xx += 10) sk.lineTo(xx, 8 * Math.sin(xx * 0.05 + spin * 3));
    sk.bezierCurveTo(hw * 0.9, -90, 90, -200, 46, -300); sk.closePath();
    P(sk, R.body, null);
    ctx.save(); ctx.clip(sk); for (let k = 0; k < 10; k++) { const a = spin + k * 0.628; const c = Math.cos(a); if (c < 0) continue; const fx = Math.sin(a);
      ctx.strokeStyle = `rgba(63,167,168,${0.22 * c})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx * 40, -300); ctx.quadraticCurveTo(fx * hw * 0.6, -140, fx * hw, 6); ctx.stroke(); } ctx.restore();
    const tor = new Path2D(); tor.moveTo(-46, -300); tor.lineTo(-60, -445); tor.quadraticCurveTo(0, -470, 60, -445); tor.lineTo(46, -300); tor.closePath(); P(tor, R.body, null);
    ctx.strokeStyle = R.body; ctx.lineCap = 'round'; ctx.lineWidth = 30;
    ctx.beginPath(); ctx.moveTo(52, -440); ctx.quadraticCurveTo(110, -520, 150, -600); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-52, -440); ctx.quadraticCurveTo(-120, -440, -185, -410); ctx.stroke();
    P(ell(158, -612, 20, 13, -0.9), R.body, null); P(ell(-196, -406, 20, 12, 0.3), R.body, null);
    P(rr(-15, -500, 30, 40, 8), R.body, null); P(ell(0, -520, 34, 40), R.body, null);
    P(poly([-26, -548, 26, -548, 19, -668, -19, -668]), R.body, null); P(ell(0, -668, 19, 10), R.body, null);
    ctx.save(); ctx.globalAlpha = rimA; ctx.strokeStyle = rim; ctx.lineWidth = 4; ctx.translate(3, 0);
    ctx.stroke(sk); ctx.beginPath(); ctx.ellipse(0, -520, 34, 40, 0, -1.2, 1.2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(26, -548); ctx.lineTo(19, -668); ctx.stroke(); ctx.restore();
  });
}
// robed figure playing the ney (stylised, no face detail), feet at (x,y), facing right
function fluteFigure(x, y, s, t, rim = M.gold2, rimA = 0.85) {
  withT(x, y, s, 0, () => {
    const sway = Math.sin(t * 1.1) * 4;
    const robe = new Path2D(); robe.moveTo(-58, -440); robe.bezierCurveTo(-90, -300, -150, -120, -160, 0); robe.lineTo(150, 0); robe.bezierCurveTo(130, -140, 80, -300, 62, -440); robe.quadraticCurveTo(0, -470, -58, -440); robe.closePath();
    P(robe, R.body, null);
    withT(sway * 0.5, 0, 1, 0, () => {
      P(rr(-15, -505, 30, 50, 8), R.body, null); P(ell(6, -528, 36, 42), R.body, null); P(poly([36, -540, 52, -520, 38, -512]), R.body, null);
      P(poly([-24, -556, 30, -556, 22, -676, -16, -676]), R.body, null); P(ell(3, -676, 19, 10), R.body, null);
      ctx.strokeStyle = R.body; ctx.lineCap = 'round'; ctx.lineWidth = 30;
      ctx.beginPath(); ctx.moveTo(40, -430); ctx.quadraticCurveTo(110, -420, 130, -390); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(30, -400); ctx.quadraticCurveTo(150, -360, 200, -330); ctx.stroke();
      ney(160, -400, 300, 0.62, 1, 0, 1);
      ctx.save(); ctx.globalAlpha = rimA; ctx.strokeStyle = rim; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(6, -528, 36, 42, 0, -1.3, 0.9); ctx.stroke(); ctx.restore();
    });
    ctx.save(); ctx.globalAlpha = rimA * 0.8; ctx.strokeStyle = rim; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(62, -440); ctx.bezierCurveTo(80, -300, 130, -140, 150, 0); ctx.stroke(); ctx.restore();
  });
}
function reedStalk(x, y, h, t, i, col = '#06121A', rim = 'rgba(63,167,168,0.5)', plume = 1) {
  const sw = Math.sin(t * 1.1 + i * 0.7) * 0.05 * h / 600; const tx = x + Math.sin(sw) * h, ty = y - h;
  ctx.strokeStyle = col; ctx.lineWidth = 8 + rnd(i) * 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sw * h * 0.3, y - h * 0.5, tx, ty); ctx.stroke();
  ctx.strokeStyle = rim; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x + 4, y); ctx.quadraticCurveTo(x + 4 + sw * h * 0.3, y - h * 0.5, tx + 3, ty); ctx.stroke();
  const lf = new Path2D(); const ly = y - h * (0.35 + rnd(i + 3) * 0.3), d = rnd(i + 5) > 0.5 ? 1 : -1; lf.moveTo(x + sw * h * 0.2, ly); lf.quadraticCurveTo(x + d * 90, ly - 60, x + d * 170, ly + 30 + Math.sin(t + i) * 8); lf.quadraticCurveTo(x + d * 80, ly - 30, x + sw * h * 0.2, ly + 10); P(lf, col, null);
  if (plume) { withT(tx, ty, 1, sw * 2 + 0.1, () => { P(ell(0, -36, 12, 46), '#2A2416', null); alpha(0.6, () => P(ell(4, -36, 5, 40), 'rgba(246,210,122,0.5)', null)); }); }
}
function nightSky(t, o = {}) {
  fullFill(grad(0, 1500, R.sky0, o.sky2 || R.sky2)); glow(W / 2, 1250, 900, R.teal, 0.25); starsT(t, 170, 1150, o.seed || 3);
  moon(o.mx ?? 790, o.my ?? 400, o.mr ?? 105, t);
}
function desert(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.08, 26);
  layers([
    { z: 0.02, draw: () => nightSky(t, o) },
    { z: 0.15, haze: 0.06, draw: () => dunes(1180, 60, '#0A1A34', 1.0, 'rgba(160,200,240,0.28)') },
    { z: 0.32, draw: () => { dunes(1320, 85, '#071229', 2.3, 'rgba(190,220,255,0.32)'); o.far && o.far(); } },
    ...(o.mid || []),
    { z: 0.62, draw: () => { dunes(1560, 70, '#040A18', 4.1, 'rgba(230,200,140,0.35)'); ctx.save(); ctx.clip(dunePath(1560, 70, 4.1)); ripples(1600, 12); ctx.restore(); o.near && o.near(); } },
    ...(o.extra || []),
    { z: 1.1, blur: 7, draw: () => { for (let i = 0; i < 5; i++) reedStalk(40 + i * 34, 2000, 420 + rnd(i) * 200, t, i, '#020408', 'rgba(63,167,168,0.25)'); for (let i = 0; i < 4; i++) reedStalk(1000 + i * 30, 2010, 380 + rnd(i + 9) * 180, t, i + 9, '#020408', 'rgba(246,210,122,0.2)'); } },
  ], cam);
  dust(t, 55, [0, 300, W, 1250], '190,215,255', o.seed || 2); dust(t, 25, [200, 900, 700, 700], '246,210,122', 7);
}
function compass(x, y, r, ang, t) {
  withT(x, y, 1, 0, () => {
    glow(0, 0, r * 1.8, M.gold, 0.25);
    const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, '#FFE39A'); g.addColorStop(0.5, '#C9962E'); g.addColorStop(1, '#6A4A14');
    P(circ(0, 0, r), g, null); P(circ(0, 0, r * 0.88), '#081A2A', null);
    for (let i = 0; i < 32; i++) { const a = i * Math.PI / 16, l = i % 4 ? 0.05 : 0.12; line(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86, Math.cos(a) * r * (0.86 - l), Math.sin(a) * r * (0.86 - l), 'rgba(246,210,122,0.7)', i % 4 ? 2 : 4); }
    [['N', 0], ['E', 1], ['S', 2], ['W', 3]].forEach(([c, k]) => { const a = -Math.PI / 2 + k * Math.PI / 2; txt(c, Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, r * 0.16, M.gold2, 'Oswald', 700); });
    const st = []; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 - Math.PI / 2, rr_ = i % 2 ? r * 0.16 : r * 0.42; st.push(Math.cos(a) * rr_, Math.sin(a) * rr_); } alpha(0.35, () => P(poly(st), R.teal2, null));
    withT(0, 0, 1, ang, () => { P(poly([0, -r * 0.78, r * 0.08, 0, 0, r * 0.1, -r * 0.08, 0]), '#F6D27A', '#5A3A10', 2); P(poly([0, r * 0.78, r * 0.08, 0, 0, -r * 0.1, -r * 0.08, 0]), R.teal2, '#0A2A30', 2); glow(0, -r * 0.7, 60, '#FFE2A0', 0.5); });
    P(circ(0, 0, r * 0.06), '#FFE39A', '#5A3A10', 3);
  });
}
function house(x, y, s, warm = 1) { withT(x, y, s, 0, () => { glow(0, -40, 220, '#FFB45A', 0.35 * warm); P(poly([-90, 0, 90, 0, 90, -90, 0, -150, -90, -90]), '#04080F', null); P(rr(-20, -60, 40, 60, [20, 20, 0, 0]), `rgba(255,190,100,${0.9 * warm})`, null); P(rr(40, -75, 26, 26, 4), `rgba(255,200,120,${0.8 * warm})`, null); P(rr(-66, -75, 26, 26, 4), `rgba(255,200,120,${0.8 * warm})`, null); }); }

// ================= SCENES =================

const DRAW = {};

function S(id) { return SCENES.find(s => s.id === id); }
function wt(id, k) { return LINES[id].words[Math.min(k, LINES[id].words.length - 1)][0]; }
function kin(id, k, pre = 0.1, d = 0.35) { const u = lt(id); return easeOut(seg(u, wt(id, k) - pre, wt(id, k) - pre + d)); }
function chipAt(s, y, k, col = M.gold) { if (k > 0) alpha(k, () => chipTop(s, y, col)); }

// ---- head-and-shoulders silhouette; origin bottom centre
function bust(x, y, s, o = {}) {
  const col = o.col || '#06050A', f = o.f || 1;
  withT(x, y, s, 0, () => { ctx.scale(f, 1);
    const b = new Path2D(); b.moveTo(-125, 0); b.bezierCurveTo(-125, -92, -84, -132, -32, -142); b.lineTo(32, -142); b.bezierCurveTo(84, -132, 125, -92, 125, 0); b.closePath();
    P(b, col, null);
    withT(0, -138, 1, o.nod || 0, () => { P(rr(-19, -46, 38, 50, 8), col, null); P(ell(6, -92, 46, 56), col, null);
      if (o.rim) { ctx.save(); ctx.globalAlpha = o.rimA ?? 0.8; ctx.strokeStyle = o.rim; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(9, -92, 46, 56, 0, -1.25, 1.3); ctx.stroke(); ctx.restore(); } });
    if (o.rim) { ctx.save(); ctx.globalAlpha = o.rimA ?? 0.8; ctx.strokeStyle = o.rim; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(34, -141); ctx.bezierCurveTo(86, -131, 127, -92, 127, 0); ctx.stroke(); ctx.restore(); }
  });
}
function sayBubble(x, y, k, s, col = M.gold2, size = 44, red = false) { if (k <= 0) return; withT(x, y, back(k), 0, () => alpha(clamp(k * 1.5), () => {
  ctx.font = `900 ${size}px Montserrat`; const w = ctx.measureText(s).width + 46; const h = size * 1.7; const b = new Path2D(); b.roundRect(-w / 2, -h / 2, w, h, h / 2.4); b.moveTo(-12, h / 2 - 2); b.lineTo(-28, h / 2 + 26); b.lineTo(12, h / 2 - 2);
  P(b, red ? 'rgba(60,8,8,0.9)' : 'rgba(14,10,8,0.86)', col, 3); txt(s, 0, 2, size, col, 'Montserrat', 900); })); }
function crack(x, y, k, seed = 1, col = '#FF4A3A') { if (k <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 24;
  for (let b = 0; b < 6; b++) { const a0 = -0.2 + b * 0.68 + rnd(b + seed) * 0.3; let px = x, py = y; ctx.beginPath(); ctx.moveTo(px, py); const n = 7;
    for (let i = 1; i <= n * k; i++) { const a = a0 + (rnd(b * 9 + i + seed) - 0.5) * 0.9; px += Math.cos(a) * 60; py += Math.sin(a) * 22; ctx.lineTo(px, py); } ctx.stroke(); } ctx.restore(); }
function quoteCard2(id, from, text, cites, gold, o = {}) {
  const u = lt(id); const k0 = o.in ?? (wordT(id, from) - 0.45); const k = easeOut(seg(u, k0, k0 + 0.5)); if (k <= 0) return;
  const words = text.split(' '); const size = o.size || 66; const font = `600 ${size}px CrimsonText`;
  const lines = wrapWords(words, font, 800); const lh = size * 1.22; const ch = cites.length * 48; const hh = lines.length * lh + 170 + ch; const cy = o.cy || 700;
  withT(W / 2, cy + (1 - k) * 60, 1, (1 - k) * 0.02, () => alpha(k, () => {
    glow(0, 0, 640, '#000', 0.6); const pw = 920, ph = hh; const g = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2); g.addColorStop(0, '#F0E2C2'); g.addColorStop(1, '#D9C292');
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
    const pp = new Path2D(); pp.moveTo(-pw / 2, -ph / 2 + 10); for (let i = 0; i <= 20; i++) pp.lineTo(-pw / 2 + pw * i / 20, -ph / 2 + Math.sin(i * 2.1) * 5); pp.lineTo(pw / 2, ph / 2); for (let i = 20; i >= 0; i--) pp.lineTo(-pw / 2 + pw * i / 20, ph / 2 + Math.sin(i * 1.7) * 5); pp.closePath();
    P(pp, g, null); ctx.restore();
    alpha(0.5, () => { const r = ctx.createRadialGradient(0, 0, 200, 0, 0, 640); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(90,50,10,0.55)'); ctx.fillStyle = r; ctx.fill(pp); });
    txt('“', -pw / 2 + 70, -ph / 2 + 70, 150, M.red, 'CrimsonText', 700);
    let wi = 0; const y0 = -ph / 2 + 110 + lh / 2;
    lines.forEach((ln, li) => { ctx.font = font; const lw = ctx.measureText(ln.join(' ')).width; let x = -lw / 2;
      ln.forEach(w => { const gi = from + wi; const said = u >= wordT(id, Math.min(gi, LINES[id].words.length - 1)) - 0.03; const isG = gold.some(g => w.toLowerCase().replace(/[^a-z]/g, '') === g);
        const fw = `${isG && said ? 700 : 600} ${size}px CrimsonText`; ctx.font = fw; const ww = ctx.measureText(w + ' ').width;
        txt(w, x, y0 + li * lh, size, said ? (isG ? '#8E1B1B' : '#24170C') : 'rgba(60,40,20,0.28)', 'CrimsonText', isG && said ? 700 : 600, 'left');
        if (isG && said) { ctx.font = fw; ctx.fillStyle = 'rgba(180,120,30,0.5)'; ctx.fillRect(x, y0 + li * lh + size * 0.42, ctx.measureText(w).width, 4); }
        x += ww; wi++; }); });
    cites.forEach((c, i) => txt(c, 0, ph / 2 - 50 - (cites.length - 1 - i) * 48, 38, '#5A3A1A', 'CrimsonText', 600));
  }));
}


// ===== "Alone? Two Answers" — Mind vs Heart scene set (Letter to Vettori 1513, tr. Marriott · Masnavi I Prologue, tr. Whinfield)
// New this time: Tuscan night hills with cypresses + farmhouse with one lit window, prison-bar shadows over Florence,
// dusty dusk field, the doorway costume change (peasant cloak falls, court robe glows), ghost "men of old" rising from
// the candlelit desk, an appointment card, a lantern-lit night-market crowd around a reed-flute player (happy / bowed),
// spotlight-alone-in-a-crowd with tear glints, write-it-down | sing-it-out split, modern desk with the phone left in
// the next room + one-hour ring, book-or-flute comment split, end card with candle + flute.
const AW = { red: '#C0392B', blue: '#3FA7A8', gold: '#F6D27A', warm: '#FFB45A', dust: '214,170,110' };
function easeIO(x) { x = clamp(x); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
function tagP(s, x, y, k, col = AW.gold, size = 42) { if (k <= 0) return; alpha(k, () => { ctx.font = `700 ${size}px Oswald`; const w = ctx.measureText(s).width + 46; P(rr(x - w / 2, y - size * 0.76, w, size * 1.52, size * 0.76), 'rgba(8,6,10,0.78)', col, 3); txt(s, x, y + 2, size, col, 'Oswald', 700); }); }
function stampA(s, x, y, k, col, rot = -0.08, size = 104) { if (k <= 0) return; withT(x, y, lerp(1.7, 1, easeOut(k)), rot, () => alpha(clamp(k * 2), () => {
  ctx.font = `900 ${size}px Montserrat`; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -size * 0.72, w, size * 1.44, 18), 'rgba(8,4,6,0.6)', col, 8); txt(s, 0, 6, size, col, 'Montserrat', 900); })); }

// ---- Tuscan hills at night: cypresses, winding road, farmhouse with a lit study window
function cypress(x, y, h, col = '#05070A', rim = null) { const p = new Path2D(); p.moveTo(x, y - h); p.bezierCurveTo(x + h * 0.11, y - h * 0.7, x + h * 0.12, y - h * 0.2, x + h * 0.05, y); p.lineTo(x - h * 0.05, y); p.bezierCurveTo(x - h * 0.12, y - h * 0.2, x - h * 0.11, y - h * 0.7, x, y - h); P(p, col, null); if (rim) { ctx.save(); ctx.strokeStyle = rim; ctx.lineWidth = 3; ctx.stroke(p); ctx.restore(); } }
function hillPath(y, amp, seed) { const p = new Path2D(); p.moveTo(-400, H + 600); for (let x = -400; x <= W + 400; x += 20) p.lineTo(x, y + amp * Math.sin(x * 0.0035 + seed) + amp * 0.4 * Math.sin(x * 0.009 + seed * 1.7)); p.lineTo(W + 400, H + 600); p.closePath(); return p; }
function farmhouse(x, y, s, lit = 1, t = 0) { withT(x, y, s, 0, () => {
  P(poly([-230, 0, -230, -230, 0, -330, 230, -230, 230, 0]), '#0A0708', null); P(poly([-260, -225, 0, -345, 260, -225, 250, -205, 0, -320, -250, -205]), '#1A0E0A', null);
  P(rr(120, -300, 50, 110, 4), '#0A0708', null);
  const f = flick(t); if (lit > 0) { glow(-90, -130, 260 * f, '#FFB45A', 0.55 * lit); P(rr(-130, -190, 80, 100, [40, 40, 0, 0]), `rgba(255,196,110,${0.95 * lit})`, null); line(-90, -188, -90, -92, '#2A140A', 5); }
  P(rr(60, -110, 60, 110, [30, 30, 0, 0]), '#040304', null);
}); }
function tuscany(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1.0, 1.08, 20); const dusk = o.dusk ?? 0; // 0 night .. 1 dusk orange
  layers([
    { z: 0.02, draw: () => { fullFill(grad(0, 1400, lerpC('#03050E', '#2A1430', dusk), lerpC('#12162A', '#E58A4E', dusk))); starsT(t, Math.round(150 * (1 - dusk)), 900, 23);
      if (dusk < 0.6) moon(830, 360, 70, t); else glow(540, 1120, 600, '#FFB060', 0.4 * dusk);
      if (o.florence) { ctx.save(); ctx.translate(-120, 0); ctx.scale(0.75, 0.75); florenceSkyline(1180 / 0.75, lerpC('#0A0710', '#3A1A20', dusk)); ctx.restore(); } } },
    { z: 0.12, haze: 0.06, draw: () => { P(hillPath(1120, 55, 1.2), lerpC('#0A0E1C', '#3A1E22', dusk), null); for (let i = 0; i < 7; i++) cypress(80 + i * 160 + rnd(i) * 60, 1110 + 40 * Math.sin(i), 120 + rnd(i + 3) * 60, lerpC('#070A14', '#24120E', dusk)); } },
    { z: 0.3, draw: () => { P(hillPath(1300, 80, 3.4), lerpC('#060912', '#24120E', dusk), null);
      if (!o.noHouse) farmhouse(o.hx ?? 700, 1330, o.hs ?? 0.9, o.lit ?? 1, t); [130, 230, 980].forEach((x, i) => cypress(x, 1340 + i * 6, 300 + i * 30, '#04060C', 'rgba(150,180,230,0.18)')); o.onHill && o.onHill(); } },
    ...(o.mid || []),
    { z: 0.62, draw: () => { P(hillPath(1620, 50, 5.1), '#030407', null);
      const road = new Path2D(); road.moveTo(380, H + 300); road.bezierCurveTo(520, 1800, 300, 1700, 560, 1600); road.lineTo(600, 1600); road.bezierCurveTo(380, 1720, 640, 1810, 560, H + 300); road.closePath(); P(road, 'rgba(120,100,80,0.25)', null);
      o.near && o.near(); } },
    { z: 1.12, blur: 7, draw: () => { cypress(40, 2050, 900, '#010203'); cypress(1060, 2080, 760, '#010203'); } },
  ], cam);
  dust(t, 40, [0, 500, W, 1000], dusk > 0.3 ? AW.dust : '190,210,255', 5);
}

// ---- standing Renaissance robe (silhouette only); dusty peasant cloak variant
function robeFig(x, y, s, o = {}) {
  withT(x, y, s, 0, () => { ctx.scale(o.f || 1, 1); const body = o.body || '#06050A';
    const p = new Path2D(); p.moveTo(-30, -372); p.lineTo(30, -372); p.bezierCurveTo(70, -366, 96, -348, 100, -312); p.lineTo(130, 0); p.lineTo(-130, 0); p.lineTo(-100, -312); p.bezierCurveTo(-96, -348, -70, -366, -30, -372); p.closePath(); P(p, body, null);
    if (o.robe) { ctx.save(); ctx.clip(p); P(rr(-140, -380, 280, 400, 0), `rgba(120,16,16,${0.75 * o.robe})`, null); alpha(o.robe, () => { line(-60, -360, -40, 0, 'rgba(246,210,122,0.5)', 4); line(60, -360, 40, 0, 'rgba(246,210,122,0.5)', 4); }); ctx.restore(); }
    P(rr(-17, -400, 34, 40, 6), body, null); P(ell(0, -430, 42, 50), body, null);
    if (o.robe) P(new Path2D('M-52 -440 Q-56 -500 0 -502 Q60 -500 56 -436 Q0 -462 -52 -440 Z'), lerpC('#06050A', '#5A0E0E', o.robe), null);
    if (o.rim) { ctx.save(); ctx.globalAlpha = o.rimA ?? 0.85; ctx.strokeStyle = o.rim; ctx.lineWidth = 5; ctx.translate(3, 0); ctx.stroke(p); ctx.beginPath(); ctx.ellipse(0, -430, 42, 50, 0, -1.4, 1.4); ctx.stroke(); ctx.restore(); }
  }); }
function cloak(x, y, s, fall, t) { if (fall >= 1) return; // dusty brown cloak sliding down and off
  withT(x + fall * 160, y + fall * 260, s, fall * 0.9, () => alpha(1 - seg(fall, 0.7, 1), () => {
    const c = new Path2D(); c.moveTo(-90, -380); c.quadraticCurveTo(0, -410, 90, -380); c.lineTo(150, -40); c.quadraticCurveTo(0, 10, -150, -40); c.closePath();
    P(c, '#4A3420', null); alpha(0.5, () => { for (let i = 0; i < 40; i++) P(circ(-130 + rnd(i) * 260, -360 + rnd(i + 4) * 320, 3 + rnd(i + 8) * 4), '#7A6040', null); });
    ctx.save(); ctx.strokeStyle = 'rgba(214,170,110,0.5)'; ctx.lineWidth = 3; ctx.stroke(c); ctx.restore(); })); }

// ---- ghostly "men of old": translucent busts with rims rising from book light
function ghostBust(x, y, s, k, i, t) { if (k <= 0) return; const bob = Math.sin(t * 1.3 + i) * 8;
  alpha(0.55 * k, () => { glow(x, y - 160 * s, 180 * s, i % 2 ? '#F6D27A' : '#9FD0E0', 0.25); bust(x, y + bob + (1 - k) * 80, s, { col: 'rgba(20,24,34,0.7)', rim: i % 2 ? AW.gold : '#9FD0E0', rimA: 0.9, f: x < W / 2 ? 1 : -1 }); }); }

// ---- candlelit study at night (portrait) — writer at desk + book light
function studyN(t, d, o = {}) {
  study(t, d, { dawn: 0, cam: o.cam || { zoom: lerp(1.0, 1.08, ease(t / d)), px: 0, py: 0, cy: 1200 }, candleX: 230,
    pre: [{ z: 0.4, draw: () => { o.ghosts && o.ghosts(); } }],
    extra: [{ z: 0.7, draw: () => { if (o.writer !== false) thinker(680, 1320, 0.85, t, M.gold2, 0.9); o.desk && o.desk(); } }] });
}

// ---- night market of lanterns: crowd silhouettes around a reed-flute player
function crowdFig(x, y, s, i, t, mood, lit = 0, o = {}) { // mood 1 happy (bob, upright), -1 sad (bowed)
  const bob = mood > 0 ? Math.abs(Math.sin(t * 3.2 + i)) * -14 : 0; const bow = mood < 0 ? 0.16 : -0.03 + Math.sin(t * 3 + i) * 0.03;
  withT(x, y + bob, s, mood < 0 ? bow * 0.3 : 0, () => { person(0, 0, 1, { f: o.f || 1, col: '#02050B', rim: lit > 0 ? `rgba(246,210,122,${0.4 + 0.5 * lit})` : 'rgba(63,167,168,0.55)', rimA: 0.85, hair: i % 3 === 0 }); });
  if (o.tear > 0) { const ty = y - 430 * s + 30 * s + o.tear * 40 * s; alpha(o.tear * (1 - seg(o.tear, 0.85, 1)), () => { glow(x + 18 * s * (o.f || 1), ty, 30, '#BFF4FF', 0.7); P(ell(x + 18 * s * (o.f || 1), ty, 6, 10), '#DFFBFF', null); }); }
}
const CROWD = [[60, 1790, 0.8, 1], [190, 1730, 0.68, -1], [300, 1830, 0.86, 1], [800, 1830, 0.86, -1], [905, 1730, 0.68, 1], [1030, 1790, 0.8, -1], [190, 1600, 0.52, -1], [890, 1600, 0.52, 1], [320, 1560, 0.46, 1], [760, 1560, 0.46, -1]];
function market(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1.0, 1.07, 18); const spot = o.spot || 0;
  layers([
    { z: 0.02, draw: () => { nightSky(t, { mx: 840, my: 330, mr: 70, seed: 41 }); } },
    { z: 0.14, haze: 0.06, draw: () => { // city of domes & arches far off (generic, no religious symbols)
      ctx.fillStyle = '#071226'; ctx.beginPath(); ctx.moveTo(-300, 1250); for (let i = 0; i < 14; i++) { const x = -300 + i * 130, h = 120 + rnd(i + 51) * 140; ctx.lineTo(x, 1250 - h); ctx.lineTo(x + 100, 1250 - h); ctx.lineTo(x + 130, 1250); } ctx.lineTo(W + 300, 1250); ctx.lineTo(W + 300, 1500); ctx.lineTo(-300, 1500); ctx.fill();
      for (let i = 0; i < 18; i++) { const on = rnd(i + 70) > 0.4; if (on) P(rr(-260 + rnd(i + 60) * (W + 400), 1060 + rnd(i + 61) * 150, 12, 18, 3), 'rgba(255,190,110,0.6)', null); } } },
    { z: 0.3, draw: () => { P(rr(-300, 1400, W + 600, 900, 0), grad(1400, 1900, '#0A1626', '#02050A'), null); line(-300, 1402, W + 300, 1402, 'rgba(150,200,255,0.18)', 3);
      // string of lanterns across
      ctx.strokeStyle = '#0E0A06'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-100, 560); ctx.quadraticCurveTo(W / 2, 820, W + 100, 560); ctx.stroke();
      [160, 340, 540, 740, 920].forEach((x, i) => { const yy = 560 + (1 - Math.pow((x - W / 2) / (W / 2 + 100), 2)) * 130; lantern(x, yy + 90, 0.55, t + i, 90); }); } },
    { z: 0.5, draw: () => { CROWD.slice(6).forEach(([x, y, s, m], i) => crowdFig(x, y, s, i + 6, t, m, o.reach ? seg(o.reach, 0.2, 0.6) : 0, { f: x < W / 2 ? 1 : -1, tear: o.tears ? seg(o.tears, 0.1 + i * 0.05, 0.7 + i * 0.05) * (m < 0 ? 1 : 0) : 0 })); } },
    { z: 0.62, draw: () => { // the player in the middle + waves
      if (spot > 0) { beam(W / 2, -100, 120, W / 2, 1820, 560, '200,230,255', 0.16 * spot); glow(W / 2, 1700, 340, '#BFE4FF', 0.22 * spot); }
      const r = o.reach ?? 1; waves(640, 1270, t, -0.5, 5, 200 + 520 * r, 0.55, '246,210,122'); waves(440, 1270, t + 0.4, Math.PI + 0.5, 5, 200 + 520 * r, 0.55, '246,210,122');
      fluteFigure(500, 1740, 0.9, t, M.gold2, 0.9); } },
    { z: 0.78, draw: () => { CROWD.slice(0, 6).forEach(([x, y, s, m], i) => crowdFig(x, y, s, i, t, m, o.reach ? seg(o.reach, 0.2 + i * 0.1, 0.6 + i * 0.1) : 0, { f: x < W / 2 ? 1 : -1, tear: o.tears ? seg(o.tears, i * 0.08, 0.6 + i * 0.08) * (m < 0 ? 1 : 0.7) : 0 }));
      if (spot > 0) { ctx.fillStyle = `rgba(1,3,8,${0.5 * spot})`; ctx.fillRect(-300, 1300, 560, 900); ctx.fillRect(W - 260, 1300, 560, 900); } } },
    { z: 1.12, blur: 7, draw: () => { lantern(60, 300, 1.3, t, 400); lantern(1030, 360, 1.1, t + 2, 400); } },
  ], cam);
  dust(t, 50, [0, 500, W, 1100], '246,210,122', 12);
}

// ---- modern room at night: desk + lamp, open door to the next room with the phone glowing on a shelf
function roomNight(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1.02, 1.1, 16);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#0B0A14', '#030306')); // wall + window w/ city
      const wx = 590, wy = 300, ww = 380, wh = 520; P(rr(wx, wy, ww, wh, 8), grad(wy, wy + wh, '#061230', '#0D2C4C'), '#14121C', 16); ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip(); starsT(t, 30, 700, 9); moon(wx + 280, wy + 120, 40, t); ctx.fillStyle = '#050A16'; for (let i = 0; i < 8; i++) { const h = 90 + rnd(i + 31) * 200; ctx.fillRect(wx + i * 50, wy + wh - h, 46, h); } for (let i = 0; i < 30; i++) if (rnd(i + 90) > 0.5) { ctx.fillStyle = 'rgba(255,200,120,0.6)'; ctx.fillRect(wx + rnd(i + 3) * ww, wy + wh - rnd(i + 7) * 200, 6, 8); } ctx.restore(); line(wx + ww / 2, wy, wx + ww / 2, wy + wh, '#14121C', 8);
      // doorway left with next room
      const dx = 60, dy = 520, dw = 300, dh = 900; P(rr(dx, dy, dw, dh, 4), '#120E18', null); P(rr(dx + 20, dy + 20, dw - 40, dh - 20, 2), grad(dy, dy + dh, '#1A1622', '#07060A'), null);
      P(rr(dx + 40, dy + 520, dw - 80, 18, 3), '#2A2230', null); // shelf
      const ph = o.phone ?? 1; if (ph > 0) { glow(dx + 150, dy + 480, 170, '#7FB8FF', 0.45 * ph); P(rr(dx + 118, dy + 420, 64, 104, 10), '#0A0C14', '#2A3A5A', 3); P(rr(dx + 124, dy + 428, 52, 88, 6), `rgba(120,180,255,${0.75 * ph})`, null); } } },
    { z: 0.35, draw: () => { // desk + lamp
      const dg = grad(1360, 1700, '#2A1A10', '#0A0604'); P(rr(-200, 1360, W + 400, 600, 0), dg, null); line(-200, 1362, W + 200, 1362, 'rgba(255,200,140,0.35)', 3);
      withT(860, 1360, 1, 0, () => { P(rr(-50, -12, 100, 14, 6), '#151018', null); line(0, -12, -60, -260, '#1C1620', 12); line(-60, -260, 40, -330, '#1C1620', 12); withT(40, -330, 1, 0.5, () => { P(poly([-70, 30, 70, 30, 40, -30, -40, -30]), '#2A2230', null); }); glow(60, -200, 420, '#FFC27A', 0.42); beam(60, -300, 80, -40, 0, 600, '255,200,140', 0.12); });
      withT(520, 1440, 1, 0.04, () => { P(rr(-170, -40, 340, 90, 6), '#EADBB8', null); alpha(0.5, () => { for (let i = 0; i < 4; i++) line(-140, -20 + i * 18, -140 + 280 * clamp((o.write ?? 0) * 4 - i), -20 + i * 18, '#3A2A1A', 3); }); }); } },
    { z: 0.55, draw: () => { person(520, 1660, 1.05, { sit: true, col: '#030306', rim: 'rgba(255,200,140,0.8)', rimA: 0.9 }); o.onDesk && o.onDesk(); } },
    { z: 1.1, blur: 6, draw: () => { P(rr(-100, 1800, 520, 300, 30), '#050407', null); P(rr(760, 1780, 500, 300, 30), '#050407', null); } },
  ], cam);
  dust(t, 40, [500, 700, 560, 800], '255,210,160', 15);
}
function hourRing(x, y, r, k, t) { withT(x, y, 1, 0, () => { glow(0, 0, r * 1.6, '#F6D27A', 0.2); ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(246,210,122,0.2)'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.stroke();
  ctx.strokeStyle = AW.gold; ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + 6.283 * k); ctx.stroke(); txt('1 HOUR', 0, 4, r * 0.42, '#FFF3D6', 'Oswald', 700); }); }
function redRoomA(t) { fullFill(grad(0, H, '#2A0507', '#070103')); glow(W / 2, 800, 700, '#8E1B1B', 0.45); dust(t, 30, [0, 200, W, 1200], '255,150,120', 31); }
function blueRoomA(t) { fullFill(grad(0, H, '#03101F', '#010407')); glow(W / 2, 1300, 800, '#1E6F78', 0.35); starsT(t, 60, 1900, 17); }

// ===================== scenes
DRAW.sc1 = (t, d) => { // HOOK: one lit window in the Tuscan night, lone figure on the road
  const u = lt('h1'); const kP = kin('h1', 7, 0.05, 0.35);
  tuscany(t, d, { cam: { zoom: lerp(1.0, 1.12, ease(t / d)), px: 0, py: 0, cy: 1250 }, lit: 1, near: () => { person(540, 1700, 0.55, { f: 1, col: '#020305', rim: 'rgba(255,190,120,0.6)' }); } });
  bigText('FEELING', W / 2, 470, 120, '#FFFFFF', seg(u, 0, 0.25));
  bigText('ALONE?', W / 2, 610, 150, AW.gold, seg(u, 0.25, 0.55));
  if (kP > 0) { alpha(kP, () => { withT(W / 2, 880, lerp(0.7, 1, back(kP)), -0.04, () => { glow(0, 0, 260, '#FFC27A', 0.5); book(0, 40, 0.8, t); }); }); tagP('THE PRINCE · 1513', W / 2, 1010, kP, AW.gold, 46); }
};
DRAW.sc2 = (t, d) => { // 1512: Florence (job lost) → prison bars → pull back to a small farm
  const u = lt('n2'); const kJob = kin('n2', 0, 0.05, 0.3), kPr = seg(u, wt('n2', 6) - 0.1, wt('n2', 6) + 0.25), kFarm = seg(u, wt('n2', 8) - 0.15, wt('n2', 10) + 0.4);
  const prOut = seg(u, wt('n2', 8) - 0.2, wt('n2', 8) + 0.2);
  tuscany(t, d, { florence: true, dusk: 0.35 * (1 - kFarm), lit: kFarm, hs: lerp(0.4, 0.9, easeIO(kFarm)), hx: 720,
    cam: { zoom: lerp(1.35, 1.0, easeIO(kFarm)), px: 0, py: 0, cy: lerp(1100, 1250, kFarm) } });
  if (kPr > 0) alpha(kPr * (1 - prOut), () => { ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, W, H); for (let i = 0; i < 7; i++) { const x = 60 + i * 160; P(rr(x - 18, -50, 36, H + 100, 10), '#050406', null); line(x + 10, -50, x + 10, H + 50, 'rgba(255,150,100,0.25)', 3); } P(rr(-50, 760, W + 100, 34, 6), '#050406', null); });
  tagP('1512 · JOB LOST', W / 2, 360, kJob * (1 - kPr), '#FF8A7A', 50);
  stampA('PRISON', W / 2, 600, kPr * (1 - prOut), '#FF4A3A', -0.06, 120);
  tagP('A SMALL FARM · FAR FROM POWER', W / 2, 360, kFarm * prOut, AW.gold, 44);
  if (kPr > 0 && kPr < 1) flash(u - wt('n2', 6) + 0.1, '255,60,30', 0.25, 0.3);
};
DRAW.sc3 = (t, d) => { // by day: dusty field at dusk, neighbours → evening falls, one window lights
  const u = lt('n3'); const eve = seg(u, wt('n3', 5) - 0.2, wt('n3', 7) + 0.3);
  tuscany(t, d, { dusk: 1 - 0.85 * eve, lit: eve, hx: 760, hs: 0.8, cam: { zoom: lerp(1.08, 1.16, ease(t / d)), px: 0, py: 0, cy: 1450 },
    near: () => { robeFig(470, 1760, 0.62, { body: '#0A0604', rim: 'rgba(214,170,110,0.8)' }); person(250, 1720, 0.5, { f: 1, col: '#0A0604', rim: 'rgba(214,170,110,0.5)' }); person(330, 1730, 0.48, { f: -1, col: '#0A0604', rim: 'rgba(214,170,110,0.5)', hair: true });
      alpha(1 - eve, () => { for (let i = 0; i < 60; i++) { const x = 380 + rnd(i) * 220 + Math.sin(t + i) * 20, y = 1760 - rnd(i + 2) * 120 - ((t * 40 + i * 13) % 140); P(circ(x, y, 3 + rnd(i + 5) * 3), 'rgba(214,170,110,0.55)', null); } }); } });
  tagP('BY DAY', W / 2, 360, kin('n3', 0, 0.05, 0.3) * (1 - eve), '#FFC890', 50);
  bigText('EVERY EVENING...', W / 2, 520, 92, AW.gold, kin('n3', 6, 0.05, 0.3));
};
DRAW.sc4 = (t, d) => { // doorway costume change + quote card
  const u = lt('q1'); const fall = easeIO(seg(u, wt('q1', 4), wt('q1', 7) + 0.3)); const robe = seg(u, wt('q1', 8), wt('q1', 13) + 0.2);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#0E080A', '#040205')); } },
    { z: 0.2, draw: () => { // doorway into the warm study
      const dx = 300, dy = 1000, dw = 480, dh = 900; glow(W / 2, 1450, 600, '#FF9A40', 0.25 + 0.2 * robe); P(rr(dx - 30, dy - 30, dw + 60, dh + 60, [250, 250, 0, 0]), '#1A0E08', null);
      P(rr(dx, dy, dw, dh, [240, 240, 0, 0]), grad(dy, dy + dh, '#5A2A10', '#1A0A04'), null); ctx.save(); ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, [240, 240, 0, 0]); ctx.clip();
      for (let r = 0; r < 4; r++) for (let b = 0; b < 12; b++) { const h = 60 + rnd(r * 12 + b) * 30; P(rr(dx + 20 + b * 38, dy + 260 + r * 120 - h, 32, h, 3), ['#3A0E0E', '#2A1A0E', '#4A2A10', '#1E1A12'][(r + b) % 4], null); }
      candleM(W / 2 + 140, dy + 720, t, 1.0); ctx.restore(); } },
    { z: 0.6, draw: () => { robeFig(W / 2 - 40, 1880, 0.95, { robe, rim: robe > 0.5 ? M.gold2 : 'rgba(214,170,110,0.7)', rimA: 0.9 }); cloak(W / 2 - 40, 1880, 0.95, fall, t); } },
  ], { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0, cy: 1500 });
  dust(t, 50, [300, 1100, 480, 700], AW.dust, 4);
  quoteCard2('q1', 2, 'I pull off my peasant-clothes... and put on my noble court dress.', ['— Letter to Vettori, 1513', '(tr. Marriott, The Prince, Introduction)'], ['peasantclothes', 'noble', 'court', 'dress'], { size: 62, cy: 560, in: 0.12 });
};
DRAW.sc5 = (t, d) => { // the men of old rise from the candlelit book; four hours
  const u = lt('n4'); const kG = seg(u, wt('n4', 2) - 0.2, wt('n4', 5) + 0.6); const k4 = kin('n4', 8, 0.05, 0.3); const kT = kin('n4', 12, 0.05, 0.3);
  studyN(t, d, { cam: { zoom: lerp(1.0, 1.1, ease(t / d)), px: 0, py: 0, cy: 1150 },
    ghosts: () => { [[200, 980, 0.9], [440, 880, 0.75], [700, 900, 0.8], [920, 1000, 0.95]].forEach(([x, y, s], i) => ghostBust(x, y, s, seg(kG, i * 0.15, 0.5 + i * 0.15), i, t)); } });
  chipAt('in essence · Letter to Vettori, 1513 (tr. Marriott)', 300, kin('n4', 0, 0.1, 0.3));
  stampA('4 HOURS', W / 2, 520, k4, AW.gold, -0.05, 120);
  tagP('EVERY TROUBLE · FORGOTTEN', W / 2, 680, kT, '#FFE0B0', 44);
};
DRAW.sc6 = (t, d) => { // MIND: being alone = an appointment; dress for it
  const u = lt('n5'); const kA = kin('n5', 5, 0.05, 0.35), kD = kin('n5', 8, 0.05, 0.35);
  layers([
    { z: 0.02, draw: () => redRoomA(t) },
    { z: 0.3, draw: () => { P(rr(-200, 1560, W + 400, 600, 0), grad(1560, 1900, '#2A0A0A', '#080203'), null); candleM(220, 1560, t, 1.3); candleM(880, 1560, t + 1, 1.1); } },
    { z: 0.55, draw: () => { robeFig(W / 2, 1800, 0.9, { robe: kD, rim: M.gold2, rimA: 0.9 }); } },
  ], camAt(t, d, 1.0, 1.08, 12));
  // appointment card
  if (kA > 0) withT(W / 2, 760 + (1 - kA) * 40, 1, -0.03, () => alpha(kA, () => { P(rr(-330, -200, 660, 400, 26), '#EADBB8', '#5A1A12', 6); P(rr(-330, -200, 660, 96, [26, 26, 0, 0]), '#8E1B1B', null);
    txt('APPOINTMENT', 0, -150, 54, '#FFF3D6', 'Oswald', 700); txt('Every evening', 0, -40, 58, '#24170C', 'CrimsonText', 700); txt('with: myself', 0, 40, 58, '#24170C', 'CrimsonText', 700);
    if (kD > 0) alpha(kD, () => { txt('dress code: your best', 0, 128, 44, '#8E1B1B', 'CrimsonText', 700); }); }));
  tagP('MIND', W / 2, 330, kin('n5', 0, 0.1, 0.3), '#FF8A7A', 60);
};
DRAW.sc7 = (t, d) => { // HEART: the reed flute plays in every crowd — happy and sad
  const u = lt('n6'); const reach = seg(t, 0, d * 0.8);
  market(t, d, { reach, cam: { zoom: lerp(1.1, 1.0, easeIO(t / d)), px: 0, py: 0, cy: 1400 } });
  chipAt('in essence · Masnavi, Book I (tr. Whinfield)', 300, kin('n6', 0, 0.1, 0.3), AW.blue);
  tagP('HEART', W / 2, 430, kin('n6', 0, 0.1, 0.3), '#8FE0E0', 60);
  tagP('THE HAPPY', 300, 1150, kin('n6', 9, 0.05, 0.3), AW.gold, 40); tagP('THE SAD', 780, 1150, kin('n6', 12, 0.05, 0.3), '#8FE0E0', 40);
};
DRAW.sc8 = (t, d) => { // quote card over the crowd
  market(t + 4, d, { reach: 1, cam: { zoom: lerp(1.0, 1.05, ease(t / d)), px: 0, py: 0, cy: 1450 } });
  ctx.fillStyle = 'rgba(2,6,12,0.32)'; ctx.fillRect(0, 0, W, H);
  quoteCard2('q2', 3, 'each interprets my notes... but not one fathoms the secrets of my heart.', ['— Masnavi, Book I (tr. Whinfield)'], ['interprets', 'fathoms', 'secrets', 'heart'], { size: 64, cy: 640, in: 0.12 });
};
DRAW.sc9 = (t, d) => { // alone in a full room (spotlight) → the song reaches them: tears
  const u = lt('n7'); const spot = 1 - seg(u, wt('n7', 5) - 0.1, wt('n7', 7) + 0.3); const tears = seg(u, wt('n7', 10), wt('n7', 13) + 0.8);
  market(t + 8, d, { spot: clamp(spot), reach: 1 - spot * 0.7, tears, cam: { zoom: lerp(1.15, 1.05, ease(t / d)), px: 0, py: 0, cy: 1550 } });
  bigText('LONELY...', W / 2, 420, 110, '#FFFFFF', kin('n7', 0, 0.05, 0.3));
  bigText('IN A FULL ROOM', W / 2, 550, 92, '#8FE0E0', kin('n7', 2, 0.05, 0.3) * (1 - seg(u, wt('n7', 8), wt('n7', 9))));
  bigText('MOVES PEOPLE', W / 2, 550, 92, AW.gold, kin('n7', 10, 0.05, 0.3));
  bigText('TO TEARS', W / 2, 670, 92, AW.gold, kin('n7', 12, 0.05, 0.3));
};
DRAW.sc10 = (t, d) => { // my take: wrote it down | sang it out → raw material
  const u = lt('n8'); const kW = kin('n8', 6, 0.05, 0.3), kS = kin('n8', 10, 0.05, 0.3); const merge = seg(u, wt('n8', 13) - 0.2, wt('n8', 14) + 0.3); const raw = kin('n8', 16, 0.05, 0.35);
  splitLRA(540 + Math.sin(t) * 6, t, () => { redRoomA(t); withT(270, 0, 1, 0, () => withT(-270, 0, 1, 0, () => {
      glow(270, 1300, 420, '#FF9A40', 0.3 * flick(t)); P(rr(-100, 1360, 760, 700, 0), grad(1360, 1800, '#3E2614', '#0A0604'), null); candleM(120, 1360, t, 1.1);
      withT(300, 1500, 1.05, 0, () => { P(rr(-200, -120, 400, 240, 8), '#EADBB8', null); alpha(0.8, () => { for (let i = 0; i < 6; i++) line(-170, -80 + i * 32, -170 + 340 * clamp(seg(u, wt('n8', 4), wt('n8', 8)) * 6 - i), -80 + i * 32, '#3A2A1A', 4); });
        const qx = -170 + 340 * ((seg(u, wt('n8', 4), wt('n8', 8)) * 6) % 1), qy = -80 + 32 * Math.min(5, Math.floor(seg(u, wt('n8', 4), wt('n8', 8)) * 6)); withT(qx + 30, qy - 90, 1, 0.5, () => { const q = new Path2D(); q.moveTo(0, 90); q.bezierCurveTo(14, 40, 34, -10, 26, -60); q.bezierCurveTo(6, -10, -6, 40, 0, 90); P(q, '#E9DCC0', null); }); }); })); },
    () => { blueRoomA(t); moon(820, 330, 70, t); dunes(1560, 60, '#040A18', 4.1, 'rgba(230,200,140,0.35)'); waves(860, 1270, t, -0.3, 6, 600, 0.6); fluteFigure(720, 1660, 0.75, t, M.gold2, 0.9); });
  tagP('WROTE IT DOWN', 270, 760, kW * (1 - merge), '#FF8A7A', 40); tagP('SANG IT OUT', 810, 760, kS * (1 - merge), '#8FE0E0', 40);
  const pill = merge; if (pill > 0) alpha(pill, () => P(rr(50, 820, W - 100, 300, 60), 'rgba(6,4,10,0.86)', AW.gold, 4));
  bigText("ALONE ISN'T", W / 2, 900, 84, '#FFFFFF', merge); bigText('THE END', W / 2, 1010, 84, '#FFFFFF', merge * (1 - raw));
  bigText('IT\'S RAW MATERIAL', W / 2, 1010, 78, AW.gold, raw);
  tagP('MY TAKE', W / 2, 330, kin('n8', 0, 0.1, 0.3), AW.gold, 50);
};
function splitLRA(seamX, t, left, right) { const pts = []; for (let y = -60; y <= H + 60; y += 120) pts.push([seamX + (Math.floor(y / 120) % 2 ? 22 : -22), y]);
  ctx.save(); const a = new Path2D(); a.moveTo(-50, -60); pts.forEach(p => a.lineTo(...p)); a.lineTo(-50, H + 60); a.closePath(); ctx.clip(a); left(); ctx.restore();
  ctx.save(); const b = new Path2D(); b.moveTo(W + 50, -60); pts.forEach(p => b.lineTo(...p)); b.lineTo(W + 50, H + 60); b.closePath(); ctx.clip(b); right(); ctx.restore();
  ctx.save(); ctx.shadowColor = AW.gold; ctx.shadowBlur = 26; ctx.strokeStyle = AW.gold; ctx.lineWidth = 5; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke(); ctx.restore(); }
function splitTBA(seamY, tilt, top, bottom) { ctx.save(); const a = new Path2D(); a.moveTo(-50, -50); a.lineTo(W + 50, -50); a.lineTo(W + 50, seamY - tilt); a.lineTo(-50, seamY + tilt); a.closePath(); ctx.clip(a); top(); ctx.restore();
  ctx.save(); const b = new Path2D(); b.moveTo(-50, seamY + tilt); b.lineTo(W + 50, seamY - tilt); b.lineTo(W + 50, H + 50); b.lineTo(-50, H + 50); b.closePath(); ctx.clip(b); bottom(); ctx.restore();
  ctx.save(); ctx.shadowColor = AW.gold; ctx.shadowBlur = 30; line(-50, seamY + tilt, W + 50, seamY - tilt, AW.gold, 6); ctx.restore(); }
DRAW.sc11 = (t, d) => { // tonight: one hour, phone in the other room, make one thing
  const u = lt('n9'); const ph = 1 - 0.6 * seg(u, wt('n9', 4), wt('n9', 8)); const write = seg(u, wt('n9', 10), d);
  roomNight(t, d, { phone: ph, write });
  chipAt('tonight', 300, kin('n9', 0, 0.1, 0.3));
  hourRing(W / 2, 560, 130, seg(u, wt('n9', 1), d), t);
  tagP('PHONE → NEXT ROOM', 230, 860, kin('n9', 5, 0.05, 0.3) * (1 - kin('n9', 11, 0.05, 0.3)), '#8FB8FF', 34);
  [['A PAGE', 230, 15], ['A PLAN', 540, 16], ['A SONG', 850, 17]].forEach(([s, x, wi]) => { const k = kin('n9', wi, 0.05, 0.3); if (k > 0) withT(x, 1100, back(k), 0, () => tagP(s, 0, 0, 1, AW.gold, 48)); });
  bigText('MAKE ONE THING', W / 2, 980, 80, '#FFFFFF', kin('n9', 11, 0.05, 0.3) * (1 - kin('n9', 15, 0.05, 0.3)));
};
DRAW.sc12 = (t, d) => { // comment: book (red, top) or flute (blue, bottom)?
  const u = lt('n10');
  splitTBA(960, 40, () => { redRoomA(t); candleM(220, 760, t, 1.2); withT(W / 2, 640, 1.0, 0, () => { glow(0, -40, 360, '#FFC27A', 0.45); book(0, 0, 1.15, t); }); },
    () => { blueRoomA(t); withT(W / 2, 1420, 1, 0, () => { glow(0, 0, 360, '#9FE0E0', 0.35); ney(-260, 60, 520, -0.25, 1.2, 1, 1); waves(220, -20, t, -0.3, 5, 420, 0.5); }); });
  bigText('THE BOOK', W / 2, 330, 110, '#FF8A7A', kin('n10', 7, 0.05, 0.3));
  bigText('OR THE FLUTE?', W / 2, 1120, 100, '#8FE0E0', kin('n10', 10, 0.05, 0.3));
  const kc = back(seg(u, wt('n10', 12) - 0.05, wt('n10', 12) + 0.35)); if (kc > 0) withT(W / 2 + 280, 960, kc, 0, () => { const b = new Path2D(); b.roundRect(-110, -70, 220, 130, 30); b.moveTo(-30, 60); b.lineTo(-60, 105); b.lineTo(10, 60); P(b, '#F6F2E8', '#111', 4); for (let i = -1; i <= 1; i++) P(circ(i * 48, -5, 13), '#222', null); });
};
DRAW.sc13 = (t, d) => { // end card: candle (left) + reed flute (right) under one moon
  layers([{ z: 0.02, draw: () => { nightSky(t, { mx: 540, my: 330, mr: 80, seed: 8 }); } },
    { z: 0.4, draw: () => { dunes(1600, 50, '#040A18', 4.1, 'rgba(230,200,140,0.35)'); candleM(300, 1640, t, 1.4); ney(620, 1600, 360, -0.5, 1, 1, 1); } }], { zoom: lerp(1, 1.05, t / d), px: 0, py: 0, cy: 1000 });
  ctx.fillStyle = 'rgba(3,3,8,0.5)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0, 0.4)); const L = document.getElementById('logo');
  withT(W / 2, 640, lerp(0.8, 1, k), 0, () => alpha(k, () => { glow(0, 0, 320, M.gold, 0.4); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -135, -135, 270, 270); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.strokeStyle = M.gold2; ctx.lineWidth = 7; ctx.stroke(); }));
  bigText('Follow Awazzzz', W / 2, 900, 104, '#FFFFFF', seg(t, 0.1, 0.4));
  bigText('MINDSET', W / 2, 1030, 66, M.gold2, seg(t, 0.3, 0.6), 'Oswald', 700);
  alpha(seg(t, 0.5, 0.8), () => txt("you're less alone than you think", W / 2, 1120, 52, M.parch, 'CrimsonText', 600));
  const pulse = 1 + 0.04 * Math.sin(t * 6); withT(W / 2, 1250, back(seg(t, 0.6, 0.9)) * pulse, 0, () => { P(rr(-200, -50, 400, 100, 50), '#E62117', '#111', 4); txt('SUBSCRIBE', 0, 4, 52, '#fff', 'Oswald', 700); });
};
function drawFrame(T) {
  GT = T; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, W, H);
  const i = SCENES.findIndex(s => T >= s.start && T < s.start + s.dur); const s = SCENES[i < 0 ? SCENES.length - 1 : i];
  ctx.save(); DRAW[s.id](T - s.start, s.dur); ctx.restore(); ctx.filter = 'none';
  const u = T - s.start; if (u < 0.18 && s.start > 0) { ctx.fillStyle = `rgba(0,0,0,${1 - u / 0.18})`; ctx.fillRect(0, 0, W, H); }
  const nxt = SCENES[SCENES.indexOf(s) + 1]; if (nxt && s.start + s.dur - T < 0.1) { ctx.fillStyle = `rgba(0,0,0,${1 - (s.start + s.dur - T) / 0.1})`; ctx.fillRect(0, 0, W, H); }
  vign(0.6); grain(T);
  if (s.id !== 'sc13') { watermark(T); captions(); }
}
function drawCover() {
  GT = 2; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  splitTBA(980, 50, () => withT(0, -470, 1, 0, () => tuscany(2, 4, { cam: { zoom: 1.0, px: 0, py: 0, cy: 1150 }, lit: 1, hx: 560, hs: 1.1 })), () => market(2, 4, { reach: 1, cam: { zoom: 1.0, px: 0, py: 0, cy: 1500 } }));
  vign(0.5);
  withT(W / 2, 250, 1, 0, () => { ctx.font = '700 50px Oswald'; const s = 'MACHIAVELLI  vs  RUMI'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -42, w, 84, 42), 'rgba(10,6,10,0.88)', M.gold2, 4); txt(s, 0, 3, 50, '#FFF3D6', 'Oswald', 700); });
  bigText('FEELING', W / 2, 820, 150, '#FFFFFF', 1);
  bigText('ALONE?', W / 2, 990, 180, M.gold2, 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
  bigText('Two answers', W / 2, 1170, 66, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
