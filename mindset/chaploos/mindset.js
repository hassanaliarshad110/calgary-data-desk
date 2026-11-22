// ===== Awazzzz Mindset — "The Yes-Man Trap" (The Prince, Ch. 23) — vertical 1080x1920, dark cinematic 2.5D
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
const KEY = { n2: ['flatterers', 'pest', 'courts'], n3: ['captain', 'great', 'weak', 'defence', 'match'], n4: ['maximilian', 'secret', 'nobody'], q1: ['close'], n5: ['pushed', 'gave', 'done', 'undone'], n6: ['wise', 'everything', 'decide'], n7: ['reward', 'bad'], n8: ['morning', 'wrong', 'listen'], n9: ['truth', 'comments'], n10: ['awazzzz', 'honest'] };
const NOCAP = { q1: 6, q2: 0 }; // from word index n onwards the quote card carries the words
const CAPCH = {};
for (const id in LINES) { const ws = LINES[id].words.map(w => w.slice()); ws.forEach(w => { if (w[2].replace(/[^A-Za-z]/g, '') === 'Awaaz') w[2] = 'Awazzzz'; w[2] = w[2].replace(/\.\.\.$/, '…'); });
  const ch = []; let cur = [];
  ws.forEach((w, k) => { cur.push([w, k]); const endP = /[.?!…:]$/.test(w[2]); if (cur.length >= 5 || endP || (/,$/.test(w[2]) && cur.length >= 3)) { ch.push(cur); cur = []; } }); if (cur.length) ch.push(cur);
  // merge 1-word tail chunks into previous when short
  const out = []; ch.forEach(c => { if (c.length === 1 && out.length && out[out.length - 1].length <= 3 && !/[.?!…]$/.test(out[out.length - 1][out[out.length - 1].length - 1][0][2])) out[out.length - 1].push(...c); else out.push(c); });
  CAPCH[id] = out; }
function captions() {
  for (const id in LINES) { if (!act(id, 0.05) || id === 'h1') continue; const u = lt(id); const chs = CAPCH[id];
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
  const k = 1 - seg(T, 3.2, 3.7); if (k > 0) alpha(k, () => { ctx.font = '700 30px Oswald'; const s = "MACHIAVELLI'S RULES"; const w = ctx.measureText(s).width + 36; P(rr(132, 98, w, 42, 21), 'rgba(10,6,8,0.7)', M.gold, 2); txt(s, 132 + w / 2, 120, 30, M.gold2, 'Oswald', 700); });
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

const DRAW = {};
// ===== "The Yes-Man Trap" — scene set for The Prince, Ch. 23 (How Flatterers Should Be Avoided; Emperor Maximilian)
// New: nodding-bust crowd + YES bubbles, mirror-dark hook stage, masked Renaissance court, dawn tactics board + floodlit
// pitch, imperial chamber with empty council chairs + sealed chest, push-back arms, day/night tower, round council table
// with question glyphs + wax seal, dawn office hand-off, phone at a sunrise window, rooftop friends.

function S(id) { return SCENES.find(s => s.id === id); }
function wt(id, k) { return LINES[id].words[Math.min(k, LINES[id].words.length - 1)][0]; }
function kin(id, k, pre = 0.1, d = 0.35) { const u = lt(id); return easeOut(seg(u, wt(id, k) - pre, wt(id, k) - pre + d)); }
function chipAt(s, y, k, col = M.gold) { if (k > 0) alpha(k, () => chipTop(s, y, col)); }

// ---- head-and-shoulders silhouette that can nod; local origin = bottom centre, head centre at (6,-230)
function bust(x, y, s, o = {}) {
  const col = o.col || '#06050A', f = o.f || 1;
  withT(x, y, s, 0, () => { ctx.scale(f, 1);
    const b = new Path2D(); b.moveTo(-125, 0); b.bezierCurveTo(-125, -92, -84, -132, -32, -142); b.lineTo(32, -142); b.bezierCurveTo(84, -132, 125, -92, 125, 0); b.closePath();
    P(b, col, null);
    withT(0, -138, 1, o.nod || 0, () => {
      P(rr(-19, -46, 38, 50, 8), col, null); P(ell(6, -92, 46, 56), col, null);
      if (o.cap) { const c = new Path2D(); c.moveTo(-50, -100); c.bezierCurveTo(-60, -170, 70, -175, 62, -104); c.bezierCurveTo(20, -126, -20, -122, -50, -100); c.closePath(); P(c, o.cap, null); }
      if (o.rim) { ctx.save(); ctx.globalAlpha = o.rimA ?? 0.8; ctx.strokeStyle = o.rim; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(9, -92, 46, 56, 0, -1.25, 1.3); ctx.stroke(); ctx.restore(); }
      o.face && o.face();
    });
    if (o.rim) { ctx.save(); ctx.globalAlpha = o.rimA ?? 0.8; ctx.strokeStyle = o.rim; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(34, -141); ctx.bezierCurveTo(86, -131, 127, -92, 127, 0); ctx.stroke(); ctx.restore(); }
  });
}
function nodA(t, ph = 0, sp = 5.5) { return 0.2 * Math.pow(Math.max(0, Math.sin(t * sp + ph)), 1.5); }
function sayBubble(x, y, k, s, col = M.gold2, size = 44, red = false) { if (k <= 0) return; withT(x, y, back(k), 0, () => alpha(clamp(k * 1.5), () => {
  ctx.font = `900 ${size}px Montserrat`; const w = ctx.measureText(s).width + 46; const h = size * 1.7; const b = new Path2D(); b.roundRect(-w / 2, -h / 2, w, h, h / 2.4); b.moveTo(-12, h / 2 - 2); b.lineTo(-28, h / 2 + 26); b.lineTo(12, h / 2 - 2);
  P(b, red ? 'rgba(60,8,8,0.9)' : 'rgba(14,10,8,0.86)', col, 3); txt(s, 0, 2, size, col, 'Montserrat', 900); })); }
function thumbUp(x, y, s, k, col = M.gold2) { if (k <= 0) return; withT(x, y, s * back(k), 0, () => { glow(0, 0, 70, col, 0.3);
  P(rr(-26, -10, 52, 58, 12), col, '#3A2208', 3); P(rr(-8, -62, 24, 60, 11), col, '#3A2208', 3); P(rr(-44, -6, 20, 54, 6), '#3A2208', null); }); }
function crack(x, y, k, seed = 1, col = '#FF4A3A') { if (k <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 24;
  for (let b = 0; b < 6; b++) { const a0 = -0.2 + b * 0.68 + rnd(b + seed) * 0.3; let px = x, py = y; ctx.beginPath(); ctx.moveTo(px, py); const n = 7;
    for (let i = 1; i <= n * k; i++) { const a = a0 + (rnd(b * 9 + i + seed) - 0.5) * 0.9; px += Math.cos(a) * 60; py += Math.sin(a) * 22; ctx.lineTo(px, py); } ctx.stroke(); } ctx.restore(); }

// ================= sets
function hookStage(t, d, o = {}) { // dark round chamber, spotlight on one figure, ring of nodding busts
  const cam = o.cam || { zoom: lerp(1.14, 1.0, easeOut(t / d)), px: 0, py: 0, cy: 1200 };
  const red = o.red || 0;
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#170B12', '#040205'));
      for (let a = 0; a < 5; a++) { const ax = -60 + a * 260; const p = new Path2D(); p.moveTo(ax, 1260); p.lineTo(ax, 560); p.arc(ax + 100, 560, 100, Math.PI, 0); p.lineTo(ax + 200, 1260); p.closePath(); P(p, '#0B0609', '#22121A', 8); }
      beam(W / 2, -40, 160, W / 2, 1460, 760, '255,214,150', 0.2); glow(W / 2, 1420, 420, red > 0 ? '#C0392B' : '#E2B04A', 0.25 + 0.2 * red); } },
    { z: 0.3, haze: 0.06, draw: () => { // back ring of nodding busts
      for (let i = 0; i < 6; i++) { const x = 80 + i * 184, y = 1260 + Math.abs(i - 2.5) * 14; bust(x, y, 0.82, { f: x < W / 2 ? 1 : -1, nod: nodA(t, i * 0.25), rim: red > 0.5 ? M.red2 : M.gold, rimA: 0.55 }); } } },
    { z: 0.6, draw: () => { P(ell(W / 2, 1440, 300, 46), 'rgba(255,214,150,0.14)', null); crack(W / 2, 1440, red, 3);
      person(W / 2, 1440, 1.22, { f: 1, rim: M.gold2, rimA: 0.95 }); } },
    { z: 1.0, blur: 4, draw: () => { bust(110, 1960, 1.7, { f: 1, nod: nodA(t, 1.2), rim: M.gold, rimA: 0.35 }); bust(980, 1980, 1.8, { f: -1, nod: nodA(t, 0.4), rim: M.gold, rimA: 0.35 }); } },
  ], cam);
  dust(t, 50, [0, 300, W, 1200], '255,220,170', 4);
}
function courtSet(t, d, o = {}) { // Renaissance court: columns, red drapes, throne, rows of masked courtiers
  const cam = o.cam || camAt(t, d, 1.0, 1.08, 18); const full = o.full ?? 0;
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#1A0A0C', '#060304'));
      glow(W / 2, 820, 520, '#E2B04A', 0.22);
      for (let i = 0; i < 2; i++) { const x = i ? W - 210 : 60; P(rr(x, 260, 150, 1100, 10), '#0C0608', null); P(rr(x - 20, 240, 190, 40, 6), '#140A0C', null); alpha(0.4, () => line(x + 120, 280, x + 120, 1340, M.gold, 3)); }
      // drapes
      [[-40, 1], [W + 40, -1]].forEach(([x, f]) => { const p = new Path2D(); p.moveTo(x, 120); p.lineTo(x + f * 330, 120); p.bezierCurveTo(x + f * 240, 400, x + f * 200, 700, x + f * 120, 1300); p.lineTo(x, 1300); p.closePath(); P(p, grad(120, 1300, '#6A1010', '#2A0606'), null);
        alpha(0.35, () => { ctx.strokeStyle = '#000'; ctx.lineWidth = 4; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x + f * k * 70, 130); ctx.bezierCurveTo(x + f * k * 60, 500, x + f * k * 50, 900, x + f * k * 30, 1300); ctx.stroke(); } }); });
      // floor tiles
      P(rr(-200, 990, W + 400, 1000, 0), grad(990, 1900, '#24120E', '#080404'), null);
      alpha(0.25, () => { ctx.strokeStyle = M.gold; ctx.lineWidth = 2; for (let k = -8; k <= 8; k++) line(W / 2 + k * 40, 990, W / 2 + k * 260, 1920, M.gold, 2); for (let r = 0; r < 8; r++) { const y = 990 + Math.pow(r / 8, 1.6) * 930; line(-200, y, W + 200, y, M.gold, 2); } });
    } },
    { z: 0.2, draw: () => withT(0, -190, 1, 0, () => { // throne + ruler
      P(rr(W / 2 - 120, 760, 240, 420, [110, 110, 10, 10]), '#2A0808', M.gold, 4); P(rr(W / 2 - 160, 1120, 320, 70, 10), '#1A0606', M.gold, 3);
      person(W / 2, 1180, 0.82, { sit: true, rim: M.gold2, rimA: 0.9 }); crown(W / 2 + 4, 1180 - 330 * 0.82, 0.3, t);
      glow(W / 2, 900, 260, M.gold, 0.2 * flick(t)); }) },
    { z: 0.4, haze: 0.05, draw: () => withT(0, -200, 1, 0, () => { // back rows of courtiers (left facing right, right facing left), bowing nods + masks
      const rows = [[1320, 0.62, 5], [1500, 0.8, 4]];
      rows.forEach(([y, s, n], ri) => { for (let i = 0; i < n; i++) { const side = i < n / 2 ? -1 : 1; const j = side < 0 ? i : n - 1 - i;
        const x = W / 2 + side * (200 + j * 170 * s + ri * 40); const extra = (ri === 0 && (i === 0 || i === n - 1)) ? full : 1; if (extra <= 0) continue;
        alpha(extra, () => { const nod = 0.1 + nodA(t, i + ri, 3.2) * 0.9; bust(x, y, s, { f: side < 0 ? 1 : -1, nod, rim: M.red2, rimA: 0.6, cap: ri ? '#3A0A0A' : '#24070A',
          face: () => { withT(side < 0 ? 46 : 46, -92, 0.4, 0, () => mask(0, 0, 1, t)); } }); }); } });
      // swarm of extra courtiers filling the back when 'full of them'
      if (full > 0) alpha(full, () => { for (let i = 0; i < 9; i++) { const x = 140 + i * 100, y = 1210 + (i % 2) * 18; bust(x, y, 0.42, { f: x < W / 2 ? 1 : -1, nod: nodA(t, i * 0.7, 3.2), rim: M.red2, rimA: 0.4 }); } });
    }) },
    { z: 1.0, blur: 5, draw: () => { bust(70, 1990, 1.6, { f: 1, nod: nodA(t, 2, 3.2), rim: M.red2, rimA: 0.35, face: () => withT(46, -92, 0.42, 0, () => mask(0, 0, 1, t)) }); bust(1010, 2000, 1.7, { f: -1, nod: nodA(t, 0.3, 3.2), rim: M.red2, rimA: 0.35 }); } },
  ], cam);
  dust(t, 60, [100, 400, 880, 900], '255,210,150', 7);
}
// ---- football: chalk tactics board + locker room at dawn; floodlit pitch
const OURS = [[-270, 205], [-120, 215], [170, 215], [290, 205], [-170, 70], [150, 70], [0, -40]];
const THEIRS = [[-200, -200], [0, -230], [210, -200], [-90, -110], [100, -110]];
function tacticsBoard(x, y, w, h, u, o = {}) {
  P(rr(x - w / 2 - 20, y - h / 2 - 20, w + 40, h + 40, 18), '#2A1A10', '#120A06', 4);
  P(rr(x - w / 2, y - h / 2, w, h, 8), grad(y - h / 2, y + h / 2, '#21402E', '#0E2117'), null);
  alpha(0.05, () => { for (let i = 0; i < 30; i++) P(ell(x - w / 2 + rnd(i) * w, y - h / 2 + rnd(i + 4) * h, 40 + rnd(i + 2) * 60, 8, rnd(i) * 3), '#E8F0E0', null); });
  alpha(0.55, () => { ctx.strokeStyle = '#E8F0E0'; ctx.lineWidth = 4; ctx.strokeRect(x - w / 2 + 30, y - h / 2 + 30, w - 60, h - 60); line(x - w / 2 + 30, y, x + w / 2 - 30, y, '#E8F0E0', 4); ctx.beginPath(); ctx.arc(x, y, 64, 0, 6.283); ctx.stroke(); ctx.strokeRect(x - 110, y + h / 2 - 30 - 90, 220, 90); ctx.strokeRect(x - 110, y - h / 2 + 30, 220, 90); });
  const ch = (s, px, py, col = '#F2F6EE', sz = 52) => txt(s, x + px, y + py, sz, col, 'Kalam', 700);
  OURS.forEach(([px, py], i) => alpha(seg(u, 0.05 * i, 0.05 * i + 0.3), () => { ctx.strokeStyle = '#F2F6EE'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x + px, y + py, 22, 0, 6.283); ctx.stroke(); }));
  THEIRS.forEach(([px, py], i) => alpha(seg(u, 0.3 + 0.05 * i, 0.6 + 0.05 * i), () => ch('×', px, py, '#F6D27A', 64)));
  // attack arrows drawn on with the plan
  const arr = (x1, y1, x2, y2, k) => { if (k <= 0) return; const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k); ctx.save(); ctx.strokeStyle = '#F2F6EE'; ctx.lineWidth = 5; ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.moveTo(x + x1, y + y1); ctx.lineTo(x + ex, y + ey); ctx.stroke(); ctx.setLineDash([]);
    if (k > 0.95) { const a = Math.atan2(y2 - y1, x2 - x1); ctx.beginPath(); ctx.moveTo(x + x2, y + y2); ctx.lineTo(x + x2 - 26 * Math.cos(a - 0.5), y + y2 - 26 * Math.sin(a - 0.5)); ctx.moveTo(x + x2, y + y2); ctx.lineTo(x + x2 - 26 * Math.cos(a + 0.5), y + y2 - 26 * Math.sin(a + 0.5)); ctx.stroke(); } ctx.restore(); };
  arr(-170, 50, -230, -160, seg(u, 0.4, 1.0)); arr(150, 50, 230, -150, seg(u, 0.6, 1.2)); arr(0, -60, 0, -250, seg(u, 0.8, 1.4));
  // the weak spot in defence (gap between the two centre-backs)
  const g = o.gap || 0; if (g > 0) { const pu = 1 + 0.08 * Math.sin(u * 8); withT(x + 25, y + 215, pu, 0, () => { glow(0, 0, 130, '#FF3A2A', 0.45 * g); alpha(g, () => { ctx.save(); ctx.strokeStyle = '#FF5A4A'; ctx.lineWidth = 7; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.ellipse(0, 0, 92, 58, 0, 0, 6.283); ctx.stroke(); ctx.restore(); }); }); }
}
function lockerSet(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1.0, 1.06, 14); const u = o.u || 0;
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#1E1418', '#07050A'));
      // high window with dawn light
      const wx = 640, wy = 150, ww = 380, wh = 170; const g = ctx.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#3A2A4A'); g.addColorStop(1, '#F2A866'); P(rr(wx, wy, ww, wh, 8), g, '#120A0A', 10);
      beam(wx + ww / 2, wy + wh, ww, wx - 80, 1500, 900, '255,196,130', 0.12);
      // lockers along the back wall
      for (let i = 0; i < 9; i++) { const lx = -40 + i * 132; P(rr(lx, 1100, 124, 520, 6), '#1A1C24', '#0A0B10', 3); for (let k = 0; k < 4; k++) P(rr(lx + 30, 1130 + k * 14, 64, 6, 3), '#0A0B10', null); }
      P(rr(-100, 1560, W + 200, 400, 0), grad(1560, 1920, '#14100E', '#050404'), null); } },
    { z: 0.25, draw: () => tacticsBoard(W / 2 + 40, 690, 820, 620, u, o) },
    ...(o.mid || []),
  ], cam);
  dust(t, 40, [300, 300, 700, 1100], '255,220,170', 2);
}
function pitchSet(t, d, o = {}) { // floodlit night pitch, goal at the top, ball through the gap
  const cam = o.cam || { zoom: lerp(1.0, 1.12, easeOut(t / d)), px: 0, py: 0, cy: 900 }; const b = o.ball || 0, net = o.net || 0;
  layers([
    { z: 0.02, draw: () => { fullFill(grad(0, 900, '#05070F', '#101830'));
      for (let i = 0; i < 70; i++) P(circ(rnd(i) * W, rnd(i + 9) * 520, 1 + rnd(i + 3) * 2), `rgba(255,255,255,${0.2 + rnd(i + 1) * 0.5})`, null);
      // stands
      P(poly([-100, 620, W + 100, 620, W + 100, 820, -100, 820]), '#0A0C14', null);
      for (let i = 0; i < 260; i++) P(circ(rnd(i) * W, 640 + rnd(i + 5) * 170, 3), `rgba(${rnd(i) > 0.5 ? '255,220,170' : '200,210,255'},${0.15 + 0.35 * rnd(i + 2) * (0.6 + 0.4 * Math.sin(t * 4 + i))})`, null);
      [[90, 1], [W - 90, -1]].forEach(([x]) => { line(x, 820, x, 200, '#0C0E16', 14); P(rr(x - 70, 160, 140, 60, 8), '#1A1E2A', null); for (let k = 0; k < 6; k++) P(circ(x - 50 + k * 20, 190, 8), '#FFF6DA', null); glow(x, 190, 240, '#EAF0FF', 0.5); beam(x, 200, 120, W / 2, 1500, 1200, '230,240,255', 0.07); }); } },
    { z: 0.2, draw: () => { // pitch in perspective
      P(poly([140, 820, 940, 820, 1500, 1920, -420, 1920]), grad(820, 1920, '#1C4A2A', '#0A2414'), null);
      for (let k = 0; k < 8; k++) { const y0 = 820 + Math.pow(k / 8, 1.5) * 1100, y1 = 820 + Math.pow((k + 0.5) / 8, 1.5) * 1100; alpha(0.12, () => P(poly([140 - (y0 - 820) * 0.51, y0, 940 + (y0 - 820) * 0.51, y0, 940 + (y1 - 820) * 0.51, y1, 140 - (y1 - 820) * 0.51, y1]), '#9AE0A0', null)); }
      alpha(0.6, () => { ctx.strokeStyle = '#E8F0E0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(330, 820); ctx.lineTo(260, 990); ctx.lineTo(820, 990); ctx.lineTo(750, 820); ctx.stroke(); });
      // goal + net (bulges when the ball hits)
      const gx = W / 2, gy = 820; P(rr(gx - 200, gy - 170, 12, 170, 3), '#F2F2F2', null); P(rr(gx + 188, gy - 170, 12, 170, 3), '#F2F2F2', null); P(rr(gx - 200, gy - 176, 400, 12, 3), '#F2F2F2', null);
      ctx.save(); ctx.strokeStyle = 'rgba(230,235,240,0.45)'; ctx.lineWidth = 2; const bl = net * 40 * Math.exp(-Math.max(0, (o.netT || 0)) * 2);
      for (let i = 0; i <= 12; i++) { const x = gx - 190 + i * 31.6; ctx.beginPath(); ctx.moveTo(x, gy - 166); ctx.quadraticCurveTo(x + (x - gx) * 0.05, gy - 80 - bl, x, gy); ctx.stroke(); }
      for (let k = 0; k < 6; k++) { const y = gy - 160 + k * 28; ctx.beginPath(); ctx.moveTo(gx - 190, y); ctx.quadraticCurveTo(gx, y - bl * Math.sin(Math.PI * k / 5), gx + 190, y); ctx.stroke(); } ctx.restore(); } },
    { z: 0.5, draw: () => { // two defenders with the gap between them
      person(W / 2 - 230, 1240, 0.9, { f: 1, rim: M.red2, rimA: 0.8 }); person(W / 2 + 250, 1240, 0.9, { f: -1, rim: M.red2, rimA: 0.8 });
      alpha(0.5 * (1 - b), () => { glow(W / 2 + 10, 1150, 160, '#FF3A2A', 0.4); });
      if (b > 0 && b < 1) { // ball flight from the bottom through the gap into the net
        const bx = lerp(W / 2 + 80, W / 2 + 40, b), by = lerp(1760, 740, easeOut(b)), r = lerp(46, 16, b);
        for (let k = 1; k < 6; k++) alpha(0.12 * (6 - k), () => P(circ(lerp(W / 2 + 80, W / 2 + 40, b - k * 0.03), lerp(1760, 740, easeOut(Math.max(0, b - k * 0.03))), r * 0.9), '#FFFFFF', null));
        P(circ(bx, by, r), '#F6F6F2', '#111', 3); P(circ(bx, by, r * 0.35), '#111', null); }
    } },
  ], cam);
}
// ---- imperial chamber: gothic window (moon), long council table with empty chairs, emperor at the head
function emperor(x, y, s, t, o = {}) {
  withT(x, y, s, 0, () => { const robe = new Path2D(); robe.moveTo(-74, -360); robe.lineTo(74, -360); robe.lineTo(150, 0); robe.lineTo(-150, 0); robe.closePath(); P(robe, '#14060A', null);
    person(0, 0, 1, { rim: o.rim || '#BFD0FF', rimA: o.rimA ?? 0.8, f: o.f || 1 }); alpha(0.85, () => { ctx.strokeStyle = 'rgba(246,210,122,0.55)'; ctx.lineWidth = 4; ctx.stroke(robe); });
    P(rr(-150, -380, 300, 26, 12), '#3A0A0A', null); alpha(0.7, () => P(rr(-150, -380, 300, 26, 12), null, M.gold, 3)); });
  crown(x + (o.f || 1) * 4 * s, y - 488 * s, 0.34 * s, t);
}
function cchair(x, y, s, lit = 0, col = '#1A0E0A') { withT(x, y, s, 0, () => { P(rr(-46, -230, 92, 230, [40, 40, 4, 4]), col, null); P(rr(-56, -70, 112, 22, 4), '#0E0806', null); line(-48, -50, -48, 30, '#0E0806', 10); line(48, -50, 48, 30, '#0E0806', 10);
  if (lit > 0) alpha(lit, () => { ctx.strokeStyle = '#9FB8FF'; ctx.lineWidth = 4; ctx.stroke(rr(-46, -230, 92, 230, [40, 40, 4, 4])); glow(0, -120, 120, '#7A9AE0', 0.25); }); }); }
function chamberSet(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1.0, 1.08, 16); const empty = o.empty || 0;
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#0C0E1A', '#040408'));
      const wx = 360, wy = 220, ww = 360, wh = 720; const win = new Path2D(); win.moveTo(wx, wy + wh); win.lineTo(wx, wy + 200); win.quadraticCurveTo(wx, wy, wx + ww / 2, wy - 40); win.quadraticCurveTo(wx + ww, wy, wx + ww, wy + 200); win.lineTo(wx + ww, wy + wh); win.closePath();
      ctx.save(); ctx.clip(win); P(rr(wx, wy - 60, ww, wh + 60, 0), grad(wy, wy + wh, '#1A2A50', '#0A1022'), null); P(circ(wx + ww * 0.66, wy + 160, 56), '#E8EEFF', null); glow(wx + ww * 0.66, wy + 160, 220, '#AFC4FF', 0.5); ctx.restore();
      P(win, null, '#1A1420', 18); line(wx + ww / 2, wy - 30, wx + ww / 2, wy + wh, '#1A1420', 10); for (let k = 1; k < 4; k++) line(wx, wy + k * 180, wx + ww, wy + k * 180, '#1A1420', 8);
      beam(wx + ww / 2, wy + wh, ww, W / 2, 1600, 800, '170,190,255', 0.1);
      // banners
      [[90, '#5A0E0E'], [W - 190, '#5A0E0E']].forEach(([bx, c]) => { P(poly([bx, 240, bx + 100, 240, bx + 100, 760, bx + 50, 700, bx, 760]), c, null); alpha(0.6, () => P(circ(bx + 50, 420, 26), null, M.gold, 4)); });
      alpha(0.2, () => { for (let i = 0; i < 40; i++) P(rr(rnd(i) * W, 100 + rnd(i + 5) * 1000, 90 + rnd(i + 2) * 80, 40, 6), null, '#2A2A3A', 2); }); } },
    { z: 0.22, draw: () => { o.back && o.back(); } },
    { z: 0.45, draw: () => { // long table in perspective, chairs on both sides
      P(poly([400, 1150, 680, 1150, 980, 1920, 100, 1920]), grad(1150, 1900, '#2A1810', '#0A0605'), null); line(400, 1152, 680, 1152, 'rgba(255,200,140,0.35)', 3);
      for (let i = 0; i < 4; i++) { const p = i / 3, y = lerp(1220, 1700, Math.pow(p, 1.1)), s = lerp(0.55, 1.15, p), off = lerp(190, 470, p);
        cchair(W / 2 - off, y, s, empty * seg(empty, i * 0.15, i * 0.15 + 0.4)); cchair(W / 2 + off, y, s, empty * seg(empty, i * 0.15 + 0.08, i * 0.15 + 0.48)); }
      candleM(W / 2 - 60, 1270, t, 0.6); candleM(W / 2 + 70, 1420, t + 2, 0.75); glow(W / 2, 1300, 300, '#FF9A40', 0.15 * flick(t));
      o.table && o.table(); } },
    ...(o.mid || []),
  ], cam);
  dust(t, 40, [200, 300, 700, 1000], '190,205,255', 6);
}
function chest(x, y, s, lid = 0, lock = 0) { withT(x, y, s, 0, () => { P(rr(-120, -110, 240, 110, 8), '#3A2414', '#120A06', 4); for (let k = -1; k <= 1; k += 2) P(rr(k * 70 - 10, -110, 20, 110, 2), '#6A4A20', null);
  withT(-120, -110, 1, -lid * 1.2, () => { P(rr(0, -50, 240, 50, [24, 24, 2, 2]), '#4A2E18', '#120A06', 4); });
  if (lock > 0) withT(0, -60, back(lock), 0, () => { glow(0, 0, 80, M.gold, 0.4 * lock); P(rr(-22, -10, 44, 38, 6), M.gold, '#3A2208', 3); ctx.save(); ctx.strokeStyle = M.gold; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, -10, 15, Math.PI, 0); ctx.stroke(); ctx.restore(); }); }); }
function planScroll(x, y, s, open = 1, o = {}) { withT(x, y, s, o.rot || 0, () => { const w = lerp(40, 420, open), h = 300;
  P(rr(-w / 2, -h / 2, w, h, 6), grad(-h / 2, h / 2, '#F0E2C2', '#CDB68A'), '#3A2A1A', 3);
  if (open > 0.6) alpha((open - 0.6) / 0.4, () => { ctx.strokeStyle = '#5A3A1A'; ctx.lineWidth = 4; ctx.strokeRect(-110, -60, 90, 160); ctx.beginPath(); ctx.moveTo(-120, -60); ctx.lineTo(-65, -110); ctx.lineTo(-10, -60); ctx.stroke(); for (let k = 0; k < 4; k++) line(20, -90 + k * 40, 170, -90 + k * 40, 'rgba(90,58,26,0.6)', 4); });
  P(rr(-w / 2 - 18, -h / 2 - 10, 26, h + 20, 12), '#B89A64', '#3A2A1A', 3); P(rr(w / 2 - 8, -h / 2 - 10, 26, h + 20, 12), '#B89A64', '#3A2A1A', 3);
  if (o.seal) withT(lerp(0, 150, open), 110, back(o.seal), 0, () => { glow(0, 0, 80, M.red2, 0.4); P(circ(0, 0, 34), M.red, '#3A0606', 3); P(circ(0, 0, 20), null, 'rgba(246,210,122,0.8)', 3); }); }); }
function arm(x1, y1, x2, y2, k, col = '#030204') { if (k <= 0) return; const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k); ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 70; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.strokeStyle = 'rgba(192,57,43,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x1, y1 - 34); ctx.lineTo(ex, ey - 34); ctx.stroke(); ctx.restore(); P(ell(ex, ey, 46, 40), col, null); }
// ---- dawn helpers
function dawnSky(k, sunX = W / 2, sunY = 1000, top = 0) { const g = ctx.createLinearGradient(0, top, 0, top + 1400); g.addColorStop(0, lerpC('#0A0C1C', '#221C40', k)); g.addColorStop(0.45, lerpC('#121428', '#7A3E56', k)); g.addColorStop(0.75, lerpC('#181224', '#E8894E', k)); g.addColorStop(1, lerpC('#100A10', '#F8CB82', k));
  ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, H + 800); glow(sunX, sunY, 560, '#FFC27A', 0.6 * k); P(circ(sunX, sunY, 86), `rgba(255,228,176,${0.95 * k})`, null); }
function roundTable(t, d, o = {}) { // round council table at dawn; o.leaderUp 0..1, o.seats [k..], o.dawn
  const cam = o.cam || camAt(t, d, 1.0, 1.07, 14); const dawn = o.dawn ?? 1;
  const SEATS = [[220, 1120, 0.62, 1], [860, 1120, 0.62, -1], [120, 1560, 1.0, 1], [960, 1560, 1.0, -1]];
  layers([
    { z: 0.03, draw: () => { fullFill('#08060A'); ctx.save(); const wp = new Path2D(); wp.roundRect(220, 180, 640, 700, [320, 320, 0, 0]); ctx.clip(wp); dawnSky(dawn, 640, 860, 100); ctx.save(); ctx.translate(-40, 0); ctx.scale(0.9, 0.9); florenceSkyline(1000, lerpC('#05040A', '#2A1424', dawn)); ctx.restore(); ctx.restore();
      P(new Path2D('M220 880 L220 500 A320 320 0 0 1 860 500 L860 880 Z'), null, '#1A1016', 20); line(540, 180, 540, 880, '#1A1016', 12); line(220, 560, 860, 560, '#1A1016', 10);
      beam(540, 880, 640, 540, 1500, 1100, '255,196,130', 0.16 * dawn);
      if (o.bars) alpha(o.bars, () => { for (let i = 0; i < 7; i++) P(rr(-40 + i * 170, 0, 70, H, 0), 'rgba(0,0,0,0.55)', null); }); } },
    { z: 0.35, draw: () => {
      // back seats (behind the table)
      SEATS.slice(0, 2).forEach(([x, y, s, f], i) => { const k = (o.seats || [])[i] || 0; if (k > 0) alpha(k, () => { person(x, y, s, { sit: true, f, rim: M.gold2, rimA: 0.9 * k }); candleM(x + f * 110, y - 150 * s + 20, t + i, 0.5 + 0.2 * ((o.lit || [])[i] || 0)); }); });
      // leader at the head of the table (back centre)
      const up = o.leaderUp || 0; person(W / 2, 1120, 0.7, { sit: up < 0.5, f: 1, rim: M.gold2, rimA: 1 });
      // table
      P(ell(W / 2, 1300, 470, 150), grad(1150, 1450, '#4A2A16', '#150A06'), null); P(ell(W / 2, 1300, 470, 150), null, 'rgba(255,200,140,0.4)', 4); P(rr(W / 2 - 470, 1300, 940, 60, 0), '#0E0805', null); P(ell(W / 2, 1360, 470, 150), '#0B0604', null); P(ell(W / 2, 1300, 470, 150), grad(1150, 1450, '#4A2A16', '#1A0C06'), null);
      alpha(0.25, () => P(ell(W / 2, 1300, 300, 80), grad(1220, 1380, 'rgba(255,190,120,0.5)', 'rgba(255,190,120,0)'), null));
      o.table && o.table();
    } },
    { z: 0.7, draw: () => { SEATS.slice(2).forEach(([x, y, s, f], i) => { const k = (o.seats || [])[i + 2] || 0; if (k > 0) alpha(k, () => { person(x, y + 300, s, { sit: true, f, rim: M.gold2, rimA: 0.85 * k }); }); }); } },
  ], cam);
  dust(t, 60, [200, 300, 700, 1000], '255,220,170', 8);
  return SEATS;
}

// ================= SCENES
DRAW.sc1 = (t, d) => { // HOOK: one figure in a spotlight, every bust around him nods YES… the floor cracks red
  const u = lt('h1'); const kr = easeOut(seg(u, wt('h1', 10), wt('h1', 11) + 0.4));
  hookStage(t, d, { red: kr });
  [[170, 990, 0], [420, 930, 1], [700, 950, 2], [930, 1010, 3]].forEach(([x, y, i]) => sayBubble(x, y, seg(u, wt('h1', 2) + i * 0.22, wt('h1', 2) + i * 0.22 + 0.3), 'YES', kr > 0.4 ? '#FF6A5A' : M.gold2, 44, kr > 0.4));
  if (kr > 0) { ctx.fillStyle = `rgba(120,10,10,${0.18 * kr})`; ctx.fillRect(0, 0, W, H); }
  const kA = 1 - seg(u, wt('h1', 7) - 0.12, wt('h1', 7));
  bigText('THE PERSON WHO', W / 2, 380, 78, '#FFFFFF', seg(u, 0, 0.18) * kA);
  bigText('ALWAYS AGREES', W / 2, 490, 98, M.gold2, seg(u, wt('h1', 3) - 0.05, wt('h1', 3) + 0.15) * kA);
  bigText('YOUR BIGGEST', W / 2, 380, 92, '#FFFFFF', seg(u, wt('h1', 7) - 0.05, wt('h1', 7) + 0.15));
  bigText('RISK', W / 2, 540, 190, '#FF5A4A', seg(u, wt('h1', 11) - 0.05, wt('h1', 11) + 0.12));
  flash(u - wt('h1', 11), '255,80,60', 0.3, 0.35);
};
DRAW.sc2 = (t, d) => { // Renaissance court full of masked, nodding flatterers
  const u = lt('n2'); const full = easeOut(seg(u, wt('n2', 7) - 0.1, wt('n2', 9) + 0.3));
  courtSet(t, d, { full, cam: { zoom: lerp(1.0, 1.1, ease(t / d)), px: 0, py: lerp(0, 30, ease(t / d)), cy: 1150 } });
  chipAt('in essence · The Prince, Ch. 23', 300, seg(t, 0.2, 0.6));
  bigText('FLATTERERS', W / 2, 470, 112, M.gold2, kin('n2', 2, 0.05, 0.2) * (1 - seg(u, wt('n2', 5), wt('n2', 5) + 0.2)));
  bigText('“A PEST”', W / 2, 470, 120, '#FF5A4A', kin('n2', 4, 0.05, 0.2) * (1 - seg(u, wt('n2', 7), wt('n2', 7) + 0.2)));
};
DRAW.sc3 = (t, d) => { // captain's plan, everyone nods… nobody mentions the gap → match day: ball through the gap
  const u = lt('n3'); const tm = wt('n3', 14) - 0.15;
  if (u < tm) {
    const gap = easeOut(seg(u, wt('n3', 12) - 0.1, wt('n3', 13) + 0.2));
    lockerSet(t, d, { u, gap, cam: { zoom: lerp(1.0, 1.08 + 0.06 * gap, ease(u / tm)), px: 0, py: 0, cy: 900 + 200 * gap },
      mid: [{ z: 0.55, draw: () => {
        // captain at the board, arm pointing at the plan
        person(150, 1230, 1.0, { f: 1, rim: M.gold2, rimA: 0.95 }); const ax = 150 + 60, ay = 1230 - 300; line(ax, ay, ax + 150, ay - 140 + Math.sin(t * 2) * 10, '#06060A', 26); P(circ(ax + 150, ay - 140 + Math.sin(t * 2) * 10, 18), '#06060A', null);
        // teammates nodding along, thumbs up
        [[330, 1880, 1.15, 1], [600, 1900, 1.2, -1], [870, 1870, 1.15, -1]].forEach(([x, y, s, f], i) => { bust(x, y, s, { f, nod: u > wt('n3', 5) - 0.2 ? nodA(t, i * 0.7, 5) : 0, rim: M.gold, rimA: 0.5 });
          thumbUp(x + f * 120, y - 380, 0.9, seg(u, wt('n3', 7) + i * 0.15, wt('n3', 7) + i * 0.15 + 0.3)); });
      } }] });
    sayBubble(780, 1150, seg(u, wt('n3', 7) - 0.1, wt('n3', 7) + 0.25), 'GREAT IDEA!', M.gold2, 46);
    if (gap > 0) { ctx.fillStyle = `rgba(0,0,0,${0.25 * gap})`; ctx.fillRect(0, 0, W, H); }
  } else {
    const v = u - tm; const b = easeIn(seg(v, 0.15, 0.85)) ; const hitT = v - 0.85;
    pitchSet(t, d, { ball: b, net: hitT > 0 ? 1 : 0, netT: hitT, cam: { zoom: lerp(1.0, 1.1, easeOut(seg(v, 0, 1.2))) + (hitT > 0 && hitT < 0.3 ? 0.02 * Math.sin(hitT * 60) : 0), px: 0, py: 0, cy: 900 } });
    flash(hitT, '255,255,255', 0.3, 0.5);
    bigText('MATCH DAY', W / 2, 420, 120, '#FFFFFF', seg(v, 0.0, 0.2));
  }
};
DRAW.sc4 = (t, d) => { // Emperor Maximilian: plans locked away, every council chair empty
  const u = lt('n4'); const lid = 1 - easeOut(seg(u, wt('n4', 6), wt('n4', 7) + 0.3)); const lock = seg(u, wt('n4', 7) + 0.2, wt('n4', 7) + 0.5); const empty = seg(u, wt('n4', 9) - 0.1, wt('n4', 12) + 0.3);
  const scr = 1 - easeOut(seg(u, wt('n4', 4), wt('n4', 6) + 0.2));
  chamberSet(t, d, { empty, cam: { zoom: lerp(1.0, 1.1, ease(t / d)), px: lerp(-10, 10, ease(t / d)), py: 0, cy: 1100 },
    back: () => { emperor(W / 2 + 10, 1150, 0.78, t, { f: 1 }); },
    table: () => { chest(W / 2 + 170, 1290, 0.55, lid, lock); if (scr > 0.02) planScroll(lerp(W / 2 + 170, W / 2 - 60, scr), lerp(1210, 1300, scr), lerp(0.2, 0.5, scr), scr); } });
  chipAt('Maximilian I · 1459–1519', 300, seg(t, 0.2, 0.6)); chipAt('Holy Roman Emperor', 384, seg(t, 0.35, 0.75));
  chipAt('in essence · Ch. 23', 468, seg(u, wt('n4', 3) - 0.1, wt('n4', 3) + 0.3));
  bigText('NOBODY', W / 2, 640, 120, '#BFD0FF', kin('n4', 10, 0.05, 0.2));
};
// quote card with a two-line citation
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
DRAW.sc5 = (t, d) => { // quote card 1 over the cold chamber; the emperor alone
  const u = lt('q1');
  chamberSet(t, d, { empty: 1, cam: { zoom: lerp(1.1, 1.16, ease(t / d)), px: 10, py: 0, cy: 1100 }, back: () => emperor(W / 2 + 10, 1150, 0.78, t, { f: 1 }), table: () => chest(W / 2 + 170, 1290, 0.55, 0, 1) });
  ctx.fillStyle = 'rgba(4,4,10,0.5)'; ctx.fillRect(0, 0, W, H);
  quoteCard2('q1', 6, 'He consulted with no one, yet never got his own way in anything.', ['— Fra Luca on Emperor Maximilian', 'The Prince, Ch. 23 (tr. Marriott)'], ['consulted', 'never'], { cy: 700, size: 68 });
};
DRAW.sc6 = (t, d) => { // plans come out → arms push them back, he gives in; then a tower built by day, undone by night
  const u = lt('n5'); const tB = wt('n5', 11) - 0.12;
  if (u < tB) {
    const open = easeOut(seg(u, wt('n5', 1) - 0.1, wt('n5', 3) + 0.2)); const push = easeOut(seg(u, wt('n5', 5), wt('n5', 7) + 0.25)); const give = easeOut(seg(u, wt('n5', 9), wt('n5', 10) + 0.3));
    chamberSet(t, d, { empty: 0, cam: { zoom: lerp(1.04, 1.12, ease(u / tB)), px: 0, py: 0, cy: 1150 },
      back: () => { withT(W / 2 + 10, 1150, 1, 0, () => { ctx.translate(0, 0); emperor(0, 0, 0.78, t, { f: 1, rim: M.gold2 }); }); },
      mid: [{ z: 0.62, draw: () => {
        const sy = lerp(1040, 990, give), sx = W / 2; planScroll(sx, sy, lerp(0.9, 0.45, give), open * (1 - 0.85 * give), { rot: lerp(0, -0.12, push) });
        arm(-120, 1500, sx - 260, sy + 60, push * (1 - 0.4 * give)); arm(W + 120, 1520, sx + 260, sy + 70, push * (1 - 0.4 * give)); arm(-160, 1150, sx - 300, sy - 30, push * 0.8 * (1 - 0.4 * give));
        if (give > 0) glow(W / 2, 900, 300, '#000', 0.4 * give);
      } }] });
    if (give > 0) { ctx.fillStyle = `rgba(0,0,0,${0.2 * give})`; ctx.fillRect(0, 0, W, H); }
  } else {
    const v = u - tB, span = (LINES.n5.dur - (wt('n5', 11) - 0.12)) + 0.3; const night = easeOut(seg(u, wt('n5', 14) - 0.2, wt('n5', 14) + 0.4));
    const build = easeOut(seg(v, 0.0, 0.9)); const undo = easeOut(seg(u, wt('n5', 14), wt('n5', 16) + 0.4));
    layers([
      { z: 0.03, draw: () => { dawnSky(1 - night, lerp(300, 200, v / span), lerp(900, 1500, night)); if (night > 0) alpha(night, () => { fullFill(grad(0, H, '#060A1C', '#0A0A14')); for (let i = 0; i < 80; i++) P(circ(rnd(i) * W, rnd(i + 3) * 1000, 1 + rnd(i + 1) * 2), 'rgba(255,255,255,0.7)', null); P(circ(820, 360, 70), '#E8EEFF', null); glow(820, 360, 260, '#AFC4FF', 0.5); }); } },
      { z: 0.3, draw: () => { ctx.save(); ctx.translate(-60, 0); ctx.scale(1.0, 1.0); florenceSkyline(1250, lerpC('#2A1424', '#06060C', night)); ctx.restore(); P(rr(-200, 1240, W + 400, 700, 0), grad(1240, 1920, lerpC('#3A2418', '#0A0A12', night), '#050404'), null); } },
      { z: 0.6, draw: () => { // tower of stone blocks: rises with the day, lifts away block by block at night
        for (let r = 0; r < 8; r++) for (let c = 0; c < 3; c++) { const idx = r * 3 + c; const kb = seg(build, idx / 24, idx / 24 + 0.15); const ku = seg(undo, (23 - idx) / 24, (23 - idx) / 24 + 0.12); if (kb <= 0 || ku >= 1) continue;
          const bx = W / 2 - 165 + c * 110 + (r % 2 ? 30 : 0) * 0, by = 1300 - (r + 1) * 92; alpha(1 - ku, () => brick(bx + (1 - kb) * 0 + ku * (c - 1) * 160, by - (1 - kb) * 200 - ku * 260, 106, 88, lerpC('#8A6A44', '#3A3A50', night), lerpC('#4A341E', '#1A1A28', night))); }
        glow(W / 2, 1100, 400, night > 0.5 ? '#7A9AE0' : '#FFB46A', 0.15); } },
    ], { zoom: lerp(1.0, 1.06, ease(v / span)), px: 0, py: 0, cy: 1100 });
    bigText('DONE', W / 2, 420, 140, M.gold2, kin('n5', 11, 0.05, 0.2) * (1 - night));
    bigText('UNDONE', W / 2, 420, 140, '#9FB8FF', night);
  }
};
DRAW.sc7 = (t, d) => { // shutting out isn't the answer → wise people at a round table at dawn, ask everything, then decide (seal)
  const u = lt('n6'); const dawn = easeOut(seg(u, wt('n6', 6) - 0.3, wt('n6', 8) + 0.3)); const up = easeOut(seg(u, wt('n6', 13) - 0.1, wt('n6', 13) + 0.3));
  const seats = [0, 1, 2, 3].map(i => easeOut(seg(u, wt('n6', 7) - 0.1 + i * 0.12, wt('n6', 7) + 0.25 + i * 0.12)));
  const qk = seg(u, wt('n6', 9) - 0.1, wt('n6', 11) + 0.5); const seal = seg(u, wt('n6', 13), wt('n6', 13) + 0.35);
  const SE = roundTable(t, d, { dawn: lerp(0.15, 1, dawn), bars: 1 - dawn, seats, lit: seats.map(s => qk), leaderUp: up, cam: { zoom: lerp(1.0, 1.08, ease(t / d)), px: 0, py: 0, cy: 1150 },
    table: () => { planScroll(W / 2, 1300, 0.42, 1, { seal }); if (seal > 0) { glow(W / 2 + 63, 1346, 200 * seal, M.gold, 0.5 * (1 - seal * 0.5)); ctx.save(); ctx.strokeStyle = `rgba(246,210,122,${1 - seal})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(W / 2 + 63, 1346, 30 + 160 * seal, 0, 6.283); ctx.stroke(); ctx.restore(); } } });
  // question marks travel from the leader to each counsellor; little gold sparks return
  if (qk > 0) SE.forEach(([x, y, s], i) => { const p = seg(qk, i * 0.12, i * 0.12 + 0.55); if (p <= 0 || p >= 1) return; const sx = W / 2, sy = 820, ex = x, ey = y - 330 * s + (i > 1 ? 0 : 0); const yy = i > 1 ? 1180 : ey;
    alpha(Math.sin(Math.PI * p), () => txt('?', lerp(sx, ex, p), lerp(sy, yy, p) - Math.sin(Math.PI * p) * 120, 96, M.gold2, 'CrimsonText', 700)); });
  if (dawn < 1) { ctx.fillStyle = `rgba(0,0,0,${0.35 * (1 - dawn)})`; ctx.fillRect(0, 0, W, H); }
  chipAt('in essence · The Prince, Ch. 23', 300, seg(u, wt('n6', 6) - 0.1, wt('n6', 6) + 0.3));
  bigText('DECIDE', W / 2, 440, 130, M.gold2, kin('n6', 13, 0.05, 0.2));
  flash(u - wt('n6', 13) - 0.1, '255,230,170', 0.25, 0.3);
};
DRAW.sc8 = (t, d) => { // quote card 2 over the warm council
  roundTable(t, d, { dawn: 1, seats: [1, 1, 1, 1], lit: [1, 1, 1, 1], cam: { zoom: lerp(1.1, 1.15, ease(t / d)), px: 0, py: 0, cy: 1150 }, table: () => planScroll(W / 2, 1300, 0.42, 1, { seal: 1 }) });
  ctx.fillStyle = 'rgba(6,4,6,0.45)'; ctx.fillRect(0, 0, W, H);
  quoteCard2('q2', 0, 'The more freely he shall speak, the more he shall be preferred.', ['— The Prince, Ch. 23 (tr. Marriott)'], ['freely', 'preferred'], { cy: 720, size: 72, in: -0.3 });
};
DRAW.sc9 = (t, d) => { // modern office at dawn: a colleague brings a red folder (bad news) → gets a gold star; hidden notes slide out
  const u = lt('n7'); const give = easeOut(seg(u, wt('n7', 2) - 0.2, wt('n7', 4) + 0.2)); const star = seg(u, wt('n7', 0), wt('n7', 0) + 0.4) * 0 + seg(u, wt('n7', 4) + 0.1, wt('n7', 4) + 0.5);
  const out = easeOut(seg(u, wt('n7', 8) - 0.2, wt('n7', 9) + 0.5));
  office(t, d, { dawn: 0.85, cam: { zoom: lerp(1.0, 1.07, ease(t / d)), px: 0, py: 0 },
    mid: [{ z: 0.5, draw: () => {
      person(330, 1300, 1.05, { f: 1, rim: '#FFD9A0', rimA: 0.9 }); person(760, 1300, 1.05, { f: -1, rim: '#FFD9A0', rimA: 0.9, hair: true });
      const fx = lerp(690, 470, give), fy = 1300 - 560; withT(fx, fy + Math.sin(t * 3) * 4, 1, -0.08, () => { P(rr(-70, -50, 140, 100, 8), '#A0201A', '#3A0606', 3); P(rr(-70, -62, 60, 20, 6), '#A0201A', '#3A0606', 3); txt('!', 0, 2, 64, '#FFE0C0', 'Montserrat', 900); });
      if (star > 0) withT(760, 680, back(star), t * 0.5, () => { glow(0, 0, 160, M.gold, 0.5); const p = new Path2D(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 28 : 64, a = i * Math.PI / 5 - Math.PI / 2; i ? p.lineTo(Math.cos(a) * r, Math.sin(a) * r) : p.moveTo(Math.cos(a) * r, Math.sin(a) * r); } p.closePath(); P(p, M.gold2, '#3A2208', 4); });
    } }],
    table: () => { // hidden notes slide out from the shadows
      [[-160, 1500, 0.3], [1240, 1520, -0.2], [-120, 1780, 0.15], [1200, 1800, -0.3]].forEach(([x0, y0, r], i) => { const k = seg(out, i * 0.15, i * 0.15 + 0.5); if (k <= 0) return; const x = lerp(x0, W / 2 + (i - 1.5) * 120, easeOut(k)), y = lerp(y0, 1600 + (i % 2) * 70, easeOut(k));
        withT(x, y, 1, r * (1 - k), () => { glow(0, 0, 90, M.gold, 0.3 * k); P(rr(-60, -40, 120, 80, 6), '#EDE4D0', '#3A2A1A', 3); P(poly([-60, -40, 0, 8, 60, -40]), null, '#8A7A60', 3); }); }); } });
  chipAt('our take', 300, seg(t, 0.2, 0.5));
};
DRAW.sc10 = (t, d) => { // sunrise window, coffee, phone: "What am I getting wrong?" → sent → just listen
  const u = lt('n8'); const sun = lerp(0.6, 1, ease(t / d)); const typed = seg(u, wt('n8', 6) - 0.1, wt('n8', 10) + 0.3); const sent = seg(u, wt('n8', 10) + 0.35, wt('n8', 10) + 0.6); const lis = seg(u, wt('n8', 11) - 0.1, wt('n8', 13) + 0.4);
  layers([
    { z: 0.03, draw: () => { dawnSky(sun, 760, lerp(1150, 980, ease(t / d)), 0); ctx.save(); ctx.translate(0, 120); ctx.fillStyle = '#120C16'; for (let i = 0; i < 16; i++) { const x = -60 + i * 76, h = 120 + rnd(i + 7) * 380; ctx.fillRect(x, 1150 - h, 66, h); } ctx.restore(); } },
    { z: 0.15, draw: () => { ctx.fillStyle = '#07060A'; ctx.fillRect(-100, 0, 120, H); ctx.fillRect(W - 20, 0, 140, H); ctx.fillRect(-100, 0, W + 200, 90); ctx.fillRect(W / 2 - 12, 0, 24, 1240); ctx.fillRect(-100, 1240, W + 200, 700); line(-100, 1240, W + 100, 1240, 'rgba(255,200,140,0.5)', 4); } },
    { z: 0.4, draw: () => { // sill: coffee mug with steam, plant
      withT(170, 1240, 1.3, 0, () => { P(rr(-50, -110, 100, 110, 14), '#E8E2D6', null); P(new Path2D('M50 -90 Q88 -84 84 -55 Q80 -30 50 -34'), null, '#E8E2D6', 10);
        alpha(0.4, () => { ctx.strokeStyle = '#FFF'; ctx.lineWidth = 5; for (let k = 0; k < 3; k++) { ctx.beginPath(); const x = -24 + k * 24; ctx.moveTo(x, -120); ctx.bezierCurveTo(x + 18 * Math.sin(t * 2 + k), -170, x - 18 * Math.sin(t * 2 + k), -210, x + 6, -250); ctx.stroke(); } }); });
      withT(930, 1240, 1.2, 0, () => { P(rr(-40, -70, 80, 70, 8), '#3A2414', null); for (let k = 0; k < 5; k++) P(ell(Math.cos(k * 1.3) * 30, -110 - k * 18, 16, 46, k * 0.7 - 1.4), '#0E1A10', null); }); } },
    { z: 0.7, draw: () => { // hand + phone
      withT(W / 2 + 10, 820, 1, -0.04, () => { glow(0, 0, 520, '#9AC0FF', 0.18);
        P(rr(-230, -440, 460, 880, 56), '#0B0C10', '#2A2C34', 6); P(rr(-206, -404, 412, 808, 36), '#F2EEE6', null);
        P(rr(-206, -404, 412, 110, [36, 36, 0, 0]), '#E2DCD0', null); P(circ(-140, -350, 34), '#C8B79A', null); txt('Sam', -86, -350, 40, '#24170C', 'Montserrat', 700, 'left');
        // typed message (right bubble)
        const msg = 'What am I getting wrong?'; const n = Math.floor(msg.length * typed); if (typed > 0) { const sh = msg.slice(0, n); ctx.font = '600 38px Montserrat'; const lines2 = sh.length > 10 ? [msg.slice(0, 9), sh.slice(10)] : [sh];
          const bw = 376, bh = 60 + lines2.length * 50; const by = lerp(240, -120, easeOut(sent)); P(rr(192 - bw, by - bh / 2, bw, bh, 26), sent > 0 ? '#2E6BD6' : '#C9D6EE', null); lines2.forEach((l, i) => txt(l, 192 - bw + 24, by - bh / 2 + 54 + i * 50, 38, sent > 0 ? '#FFFFFF' : '#1A2030', 'Montserrat', 600, 'left'));
          if (sent > 0.9) alpha(seg(u, wt('n8', 10) + 0.6, wt('n8', 10) + 0.9), () => txt('Delivered', 175, by + bh / 2 + 24, 26, '#7A7A80', 'Montserrat', 600, 'right')); }
        // reply typing dots after "listen"
        if (lis > 0) alpha(lis, () => { P(rr(-180, 90, 170, 76, 30), '#E2DCD0', null); for (let i = 0; i < 3; i++) P(circ(-140 + i * 44, 128 - Math.max(0, Math.sin(t * 8 - i)) * 10, 11), '#6A6A70', null); });
        P(rr(-180, 330, 360, 54, 27), '#FFFFFF', '#D0C8B8', 2); });
      P(new Path2D('M300 1420 Q360 1120 520 1150 L690 1170 Q770 1200 760 1290 L700 1520 Q560 1640 380 1600 Z'), '#050407', null);
      // listening: sound waves
      if (lis > 0) alpha(lis, () => { ctx.save(); ctx.strokeStyle = M.gold2; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let k = 0; k < 3; k++) { const r = 60 + k * 40 + (t * 40) % 40; ctx.globalAlpha = lis * (1 - k / 3); ctx.beginPath(); ctx.arc(W / 2 + 10, 400, r, -0.9, 0.9); ctx.stroke(); ctx.beginPath(); ctx.arc(W / 2 + 10, 400, r, Math.PI - 0.9, Math.PI + 0.9); ctx.stroke(); } ctx.restore(); });
    } },
  ], { zoom: lerp(1.0, 1.05, ease(t / d)), px: 0, py: 0, cy: 900 });
  dust(t, 40, [0, 200, W, 1000], '255,226,180', 3);
  bigText('THIS MORNING', W / 2, 300, 84, M.gold2, seg(u, wt('n8', 0) - 0.05, wt('n8', 0) + 0.2) * (1 - seg(u, wt('n8', 6) - 0.2, wt('n8', 6))));
  bigText('JUST LISTEN', W / 2, 260, 96, '#FFFFFF', kin('n8', 12, 0.05, 0.2));
};
DRAW.sc11 = (t, d) => { // rooftop at sunrise: two friends, one speaks honestly; the question
  const u = lt('n9');
  layers([
    { z: 0.03, draw: () => { dawnSky(1, 300, 1080, 0); ctx.fillStyle = '#1A1020'; for (let i = 0; i < 20; i++) { const x = -60 + i * 64, h = 80 + rnd(i + 21) * 300; ctx.fillRect(x, 1180 - h, 58, h); } } },
    { z: 0.4, draw: () => { P(rr(-200, 1180, W + 400, 800, 0), grad(1180, 1900, '#120A0E', '#040304'), null); line(-200, 1182, W + 200, 1182, 'rgba(255,200,140,0.5)', 4);
      person(380, 1190, 1.0, { f: 1, rim: '#FFD9A0', rimA: 0.95 }); person(700, 1190, 1.0, { f: -1, rim: '#FFD9A0', rimA: 0.95, hair: true });
      const sp = 0.5 + 0.5 * Math.sin(t * 7); glow(560, 700, 180, M.gold, 0.18 + 0.12 * sp * seg(u, 0, 1.2)); } },
  ], { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0, cy: 1000 });
  dust(t, 40, [0, 300, W, 900], '255,226,180', 5);
  bigText('WHO TELLS YOU', W / 2, 360, 100, '#FFFFFF', seg(u, 0, 0.2));
  bigText('THE TRUTH?', W / 2, 500, 132, M.gold2, kin('n9', 4, 0.05, 0.2));
  const kc = back(seg(u, wt('n9', 6) - 0.05, wt('n9', 6) + 0.35)); if (kc > 0) withT(W / 2, 1060, kc, 0, () => { const b = new Path2D(); b.roundRect(-110, -70, 220, 130, 30); b.moveTo(-30, 60); b.lineTo(-60, 105); b.lineTo(10, 60); P(b, '#F6F2E8', '#111', 4); for (let i = -1; i <= 1; i++) P(circ(i * 48, -5, 13), '#222', null); });
};
DRAW.sc12 = (t, d) => { // end card: Follow Awazzzz · Mindset
  roundTable(t + 40, d, { dawn: 1, seats: [1, 1, 1, 1], cam: { zoom: 1.12, px: 0, py: 0, cy: 1150 } });
  ctx.fillStyle = 'rgba(5,3,6,0.64)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0, 0.4)); const L = document.getElementById('logo');
  withT(W / 2, 640, lerp(0.8, 1, k), 0, () => alpha(k, () => { glow(0, 0, 320, M.gold, 0.4); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -135, -135, 270, 270); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.strokeStyle = M.gold2; ctx.lineWidth = 7; ctx.stroke(); }));
  bigText('Follow Awazzzz', W / 2, 900, 104, '#FFFFFF', seg(t, 0.1, 0.4));
  bigText('MINDSET', W / 2, 1030, 66, M.gold2, seg(t, 0.3, 0.6), 'Oswald', 700);
  alpha(seg(t, 0.5, 0.8), () => txt('keep honest people close', W / 2, 1120, 46, M.parch, 'CrimsonText', 600));
  const pulse = 1 + 0.04 * Math.sin(t * 6); withT(W / 2, 1230, back(seg(t, 0.6, 0.9)) * pulse, 0, () => { P(rr(-200, -50, 400, 100, 50), '#E62117', '#111', 4); txt('SUBSCRIBE', 0, 4, 52, '#fff', 'Oswald', 700); });
};
function drawFrame(T) {
  GT = T; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, W, H);
  const i = SCENES.findIndex(s => T >= s.start && T < s.start + s.dur); const s = SCENES[i < 0 ? SCENES.length - 1 : i];
  ctx.save(); DRAW[s.id](T - s.start, s.dur); ctx.restore(); ctx.filter = 'none';
  const u = T - s.start; if (u < 0.18 && s.start > 0) { ctx.fillStyle = `rgba(0,0,0,${1 - u / 0.18})`; ctx.fillRect(0, 0, W, H); }
  const nxt = SCENES[SCENES.indexOf(s) + 1]; if (nxt && s.start + s.dur - T < 0.1) { ctx.fillStyle = `rgba(0,0,0,${1 - (s.start + s.dur - T) / 0.1})`; ctx.fillRect(0, 0, W, H); }
  vign(0.6); grain(T);
  if (s.id !== 'sc12') { watermark(T); captions(); }
}
function drawCover() {
  GT = 2.6; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  hookStage(3, 4, { red: 0.0, cam: { zoom: 1.04, px: 0, py: 0, cy: 1250 } });
  [[180, 1000], [430, 940], [690, 960], [920, 1020]].forEach(([x, y]) => sayBubble(x, y, 1, 'YES', M.gold2, 46));
  ctx.filter = 'none'; vign(0.5);
  withT(W / 2, 300, 1, 0, () => { ctx.font = '700 54px Oswald'; const s = 'MACHIAVELLI'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -44, w, 88, 44), 'rgba(110,14,14,0.92)', M.gold2, 4); txt(s, 0, 3, 54, '#FFF3D6', 'Oswald', 700); });
  bigText('BEWARE', W / 2, 500, 150, '#FFFFFF', 1);
  bigText('THE YES-MEN', W / 2, 660, 120, M.gold2, 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
  bigText('The Prince · Ch. 23', W / 2, 1560, 64, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
