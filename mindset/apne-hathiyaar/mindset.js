// ===== Awazzzz Mindset — "Borrowed Armour" (The Prince, Ch. 13) — vertical 1080x1920, dark cinematic 2.5D
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
const KEY = { n2: ['borrowed', 'prisoner'], n3: ['david', 'giant'], n4: ['armour', 'heavy', 'polished', 'royal'], n5: ['sling'], n6: ['code', 'client'], n7: ['help', 'skill', 'yours'], n8: ['yourself', 'today'], n9: ['sling'], n10: ['awazzzz', 'strength'] };
const NOCAP = { q1: 0, q2: 0 }; // from word index n onwards the quote card carries the words
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
// ===== "Borrowed Armour" — scene set for The Prince, Ch. 13 (auxiliaries; David refuses Saul's armour)
// New props: suit of armour (detachable parts, glint, gold trim), sling, giant on the ridge, robed king,
// armoury hall, war table with hired pieces + chains, dawn valley, training ground, two-panel modern set, hand-off card.

function S(id) { return SCENES.find(s => s.id === id); }
function wt(id, k) { return LINES[id].words[Math.min(k, LINES[id].words.length - 1)][0]; }
function nameTag(s, x, y, k, col = M.gold) { if (k <= 0) return; alpha(k, () => { ctx.font = '700 38px Oswald'; const w = ctx.measureText(s).width + 44; P(rr(x - w / 2, y - 29, w, 58, 29), 'rgba(10,6,8,0.75)', col, 2); txt(s, x, y + 2, 38, '#FFF3D6', 'Oswald', 700); }); }
function chipTop(s, y = 300, col = M.gold) { ctx.font = '600 42px CrimsonText'; const w = ctx.measureText(s).width + 56; P(rr(W / 2 - w / 2, y - 36, w, 72, 36), 'rgba(10,6,8,0.66)', col, 2); txt(s, W / 2, y, 42, M.parch, 'CrimsonText', 600); }

// ---- suit of armour, local origin = feet; parts can be offset [dx, dy, rot, alpha]
function armour(x, y, s, o = {}) {
  const off = o.off || {}; const gl = o.glint ?? -1, gd = o.gold ?? 0.4;
  const steel = (y1, y2) => grad(y1, y2, '#B9C3D2', '#2A3242');
  const part = (key, cx, cy, fn) => { const f = off[key] || [0, 0, 0, 1]; if ((f[3] ?? 1) <= 0) return; alpha(f[3] ?? 1, () => withT(cx + f[0], cy + f[1], 1, f[2], fn)); };
  const glint = (p) => { if (gl < 0 || gl > 1) return; ctx.save(); ctx.clip(p); const gx = lerp(-180, 180, gl); alpha(0.75, () => beam(gx, -160, 40, gx - 80, 160, 40, '255,255,255', 0.9)); ctx.restore(); };
  const trim = (p) => { ctx.save(); ctx.strokeStyle = `rgba(246,210,122,${0.35 + 0.65 * gd})`; ctx.lineWidth = 6; ctx.stroke(p); ctx.restore(); if (gd > 0.6) glow(0, 0, 160, M.gold, 0.25 * (gd - 0.6) / 0.4); };
  withT(x, y, s, o.rot || 0, () => {
    if (o.stand) { P(rr(-10, -420, 20, 420, 4), '#2A1A10', null); P(rr(-110, -20, 220, 20, 6), '#1E120A', null); P(rr(-120, -372, 240, 14, 6), '#2A1A10', null); }
    part('tas', 0, -150, () => { const p = new Path2D(); p.moveTo(-92, -24); p.lineTo(92, -24); p.lineTo(104, 70); p.lineTo(-104, 70); p.closePath(); P(p, steel(-24, 70), '#11151E', 4); for (let i = 1; i < 3; i++) line(-98, -24 + i * 30, 98, -24 + i * 30, 'rgba(10,14,22,0.8)', 4); trim(p); glint(p); });
    part('plate', 0, -270, () => { const p = new Path2D(); p.moveTo(-96, -104); p.quadraticCurveTo(0, -126, 96, -104); p.lineTo(88, 40); p.quadraticCurveTo(0, 120, -88, 40); p.closePath(); P(p, steel(-120, 110), '#11151E', 5); line(0, -112, 0, 96, 'rgba(255,255,255,0.35)', 4); trim(p); glint(p);
      alpha(0.9, () => P(circ(0, -30, 16), M.gold, '#3A2208', 3)); });
    [['pl', -104], ['pr', 104]].forEach(([k, sx]) => part(k, sx, -358, () => { const p = ell(0, 0, 58, 36, sx < 0 ? -0.25 : 0.25); P(p, steel(-36, 36), '#11151E', 4); trim(p); glint(p); }));
    part('helm', 0, -446, () => { const p = new Path2D(); p.moveTo(-54, 30); p.bezierCurveTo(-62, -60, 62, -60, 54, 30); p.lineTo(40, 62); p.lineTo(-40, 62); p.closePath(); P(p, steel(-60, 62), '#11151E', 5);
      P(rr(-40, 2, 80, 12, 4), '#0A0D14', null); line(0, 20, 0, 58, '#0A0D14', 6);
      const pl = new Path2D(); pl.moveTo(-8, -46); pl.bezierCurveTo(-30, -110, 40, -130, 70, -96); pl.bezierCurveTo(40, -96, 20, -80, 8, -46); pl.closePath(); P(pl, M.red2, null); trim(p); glint(p); });
  });
}
// ---- simple figures
function youth(x, y, s, o = {}) { withT(x, y, 1, o.rot || 0, () => { ctx.scale(1, o.sy || 1); person(0, 0, s, { rim: o.rim || M.gold2, rimA: o.rimA ?? 0.9, f: o.f || 1, hair: true }); }); }
function king(x, y, s, t, o = {}) {
  withT(x, y, s, 0, () => { const robe = new Path2D(); robe.moveTo(-70, -360); robe.lineTo(70, -360); robe.lineTo(140, 0); robe.lineTo(-140, 0); robe.closePath(); P(robe, '#3A0A0A', null);
    person(0, 0, 1, { rim: M.gold2, rimA: 0.8, f: o.f || 1 }); alpha(0.9, () => { ctx.strokeStyle = 'rgba(246,210,122,0.6)'; ctx.lineWidth = 4; ctx.stroke(robe); }); });
  crown(x + (o.f || 1) * 4 * s, y - 488 * s, 0.34 * s, t);
}
function giant(x, y, s, a = 1) { if (a <= 0) return; alpha(a, () => { withT(x, y, s, 0, () => {
  person(0, 0, 1, { col: '#0A0506', rim: M.red2, rimA: 0.8, f: -1 });
  const h = new Path2D(); h.moveTo(-48, -440); h.bezierCurveTo(-50, -500, 50, -500, 48, -440); h.closePath(); P(h, '#0A0506', null); P(poly([-6, -486, 6, -486, 4, -540, -4, -540]), '#0A0506', null);
  line(-120, 20, -120, -600, '#0A0506', 12); P(poly([-136, -600, -104, -600, -120, -660]), '#0A0506', null);
  alpha(0.7, () => line(-114, -10, -114, -600, M.red2, 3)); }); }); }
function sling(hx, hy, s, ang, ga = 0.5, len = 110) {
  const px = hx + Math.cos(ang) * len * s, py = hy + Math.sin(ang) * len * s;
  glow(px, py, 70 * s, M.gold, ga * 0.6);
  ctx.save(); ctx.strokeStyle = M.gold2; ctx.lineWidth = 4 * s; ctx.lineCap = 'round';
  const nx = -Math.sin(ang) * 14 * s, ny = Math.cos(ang) * 14 * s;
  ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(px + nx, py + ny); ctx.moveTo(hx, hy); ctx.lineTo(px - nx, py - ny); ctx.stroke(); ctx.restore();
  withT(px, py, s, ang, () => { P(ell(0, 0, 18, 13), '#8A5A2A', '#3A2208', 3); P(circ(2, 0, 8), '#C9C2B0', null); });
}
function chainLinks(x1, y1, x2, y2, k, col = M.gold, lw = 7) { if (k <= 0) return; const n = Math.max(2, Math.floor(Math.hypot(x2 - x1, y2 - y1) / 34)); const m = Math.floor(n * k);
  for (let i = 0; i < m; i++) { const u = (i + 0.5) / n; withT(lerp(x1, x2, u), lerp(y1, y2, u), 1, Math.atan2(y2 - y1, x2 - x1) + (i % 2 ? Math.PI / 2 * 0.0 : 0), () => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.ellipse(0, 0, 20, i % 2 ? 4 : 11, 0, 0, 6.283); ctx.stroke(); ctx.restore(); }); } }
function chainRing(cx, cy, rx, ry, k, col = M.gold) { if (k <= 0) return; const n = 30, m = Math.floor(n * k);
  for (let i = 0; i < m; i++) { const a = i / n * 6.283 - 1.57; const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry; withT(x, y, 1, a + 1.57, () => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, 0, 18, i % 2 ? 4 : 10, 0, 0, 6.283); ctx.stroke(); ctx.restore(); }); } glow(cx, cy, rx, col, 0.12 * k); }
function torch(x, y, t, s = 1) { P(rr(x - 8 * s, y, 16 * s, 70 * s, 4), '#2A1A10', null); candleM(x, y + 6, t, s * 1.3, 60 * s); glow(x, y - 20, 240 * s, '#FF9A40', 0.28 * flick(t)); }

// ---- sets
function hallSet(t, d, o = {}) { // armoury hall: stone arches, red banners, torches, light pool
  const cam = o.cam || camAt(t, d, 1, 1.07, 20);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#140C10', '#050306'));
      for (let a = 0; a < 3; a++) { const ax = 90 + a * 360; const p = new Path2D(); p.moveTo(ax, 1250); p.lineTo(ax, 520); p.arc(ax + 150, 520, 150, Math.PI, 0); p.lineTo(ax + 300, 1250); p.closePath(); P(p, '#0A0608', '#24161A', 10); glow(ax + 150, 700, 200, '#3A1A2A', 0.3); }
      alpha(0.22, () => { for (let i = 0; i < 50; i++) P(rr(rnd(i) * W, 100 + rnd(i + 5) * 1150, 90 + rnd(i + 2) * 70, 38, 6), null, '#2A1A1A', 2); }); } },
    { z: 0.2, draw: () => { [140, 940].forEach((bx, i) => { const sw = Math.sin(t * 0.9 + i) * 8; const b = new Path2D(); b.moveTo(bx - 70, 300); b.lineTo(bx + 70, 300); b.lineTo(bx + 70 + sw, 820); b.lineTo(bx + sw, 760); b.lineTo(bx - 70 + sw, 820); b.closePath(); P(b, M.blood, null); alpha(0.5, () => P(b, null, M.gold, 3)); P(rr(bx - 86, 288, 172, 16, 4), '#2A1A10', null);
        withT(bx + sw * 0.5, 520, 0.36, 0, () => alpha(0.55, () => chessPiece('king', 0, 80, 1, 'rgba(0,0,0,0)', M.gold, 0.9))); });
      torch(330, 660, t, 1); torch(750, 660, t + 1.3, 1); } },
    { z: 0.45, draw: () => { P(rr(-200, 1240, W + 400, 800, 0), grad(1240, 1920, '#22161A', '#060406'), null); line(-200, 1242, W + 200, 1242, 'rgba(255,200,140,0.25)', 3);
      beam(o.poolX || W / 2, -40, 200, o.poolX || W / 2, 1300, 620, '255,210,150', 0.13); P(ell(o.poolX || W / 2, 1262, 300, 46), 'rgba(255,200,140,0.12)', null); } },
    ...(o.mid || []),
    { z: 1.1, blur: 7, draw: () => { P(rr(-60, 1700, 260, 300, 20), '#030203', null); P(rr(920, 1650, 260, 400, 20), '#030203', null); } },
  ], cam);
  dust(t, 60, [0, 250, W, 1100], '255,220,170', o.seed || 4);
}
function warTable(t, d, o = {}) { // tent interior + perspective board
  const cam = o.cam || camAt(t, d, 1, 1.06, 18);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#2A0C0C', '#070305'));
      for (let i = 0; i < 7; i++) { const x = i * 180 - 20; alpha(0.5, () => line(x, 0, x + 60, 900, '#1A0606', 26)); }
      glow(W / 2, 520, 520, '#FF9A50', 0.18); P(rr(-100, 860, W + 200, 60, 0), '#120606', null); } },
    { z: 0.25, draw: () => { board(W / 2, 900, 1800, 8, t, o.spot || null, 760); } },
    ...(o.mid || []),
    { z: 1.05, blur: 6, draw: () => { candleM(90, 1760, t, 1.6, 120); candleM(1000, 1800, t + 2, 1.4, 110); } },
  ], cam);
  dust(t, 50, [0, 300, W, 1000], '255,200,150', o.seed || 6);
}
function valleySet(t, d, o = {}) { // dawn valley: sky, far ridge (giant), mid hills, foreground ground
  const cam = o.cam || camAt(t, d, 1, 1.08, 26); const dawn = o.dawn ?? 0.5;
  layers([
    { z: 0.02, draw: () => { const sk = ctx.createLinearGradient(0, 0, 0, 1100); sk.addColorStop(0, lerpC('#070814', '#1E1A3A', dawn)); sk.addColorStop(0.6, lerpC('#141024', '#8A4A3A', dawn)); sk.addColorStop(1, lerpC('#20141A', '#F2A860', dawn)); fullFill(sk);
      glow(o.sunX || 300, 1000, 420, '#FFC27A', 0.5 * dawn); P(circ(o.sunX || 300, 1010, 70), `rgba(255,214,150,${0.85 * dawn})`, null);
      alpha(0.7, () => { for (let i = 0; i < 40; i++) P(circ(rnd(i) * W, rnd(i + 9) * 600, 1.5 + rnd(i + 3) * 1.5), `rgba(255,255,255,${0.6 * (1 - dawn)})`, null); }); } },
    { z: 0.12, haze: 0.05, draw: () => { const p = new Path2D(); p.moveTo(-200, 1060); p.bezierCurveTo(200, 900, 500, 1010, 700, 930); p.bezierCurveTo(850, 880, 1000, 900, 1300, 980); p.lineTo(1300, 1300); p.lineTo(-200, 1300); p.closePath(); P(p, lerpC('#100A14', '#3A2230', dawn * 0.6), null);
      giant(o.giantX ?? 840, 935, o.giantS ?? 0.62, o.giant ?? 0); } },
    { z: 0.3, draw: () => { const p = new Path2D(); p.moveTo(-200, 1180); p.bezierCurveTo(200, 1080, 600, 1170, 1300, 1100); p.lineTo(1300, 1400); p.lineTo(-200, 1400); p.closePath(); P(p, lerpC('#0A070C', '#24141A', dawn * 0.6), null); } },
    { z: 0.55, draw: () => { P(rr(-300, 1240, W + 600, 900, 0), grad(1240, 1920, lerpC('#100A0A', '#3A2418', dawn * 0.7), '#050304'), null); line(-300, 1242, W + 300, 1242, `rgba(255,200,140,${0.2 + 0.3 * dawn})`, 3);
      for (let i = 0; i < 26; i++) { const gx = rnd(i * 3) * W, gy = 1250 + rnd(i * 5) * 40; line(gx, gy, gx + 6, gy - 26 - rnd(i) * 20, '#0A0606', 4); } } },
    ...(o.mid || []),
    { z: 1.1, blur: 8, draw: () => { P(ell(80, 1900, 260, 160), '#030203', null); P(ell(1040, 1880, 240, 180), '#030203', null); } },
  ], cam);
  dust(t, 50, [0, 300, W, 1000], '255,220,170', o.seed || 7);
}

// ================= scenes
DRAW.sc1 = (t, d) => { // HOOK: borrowed armour on a stand → a sealed bill drops out of it
  const u = lt('h1'), w = LINES.h1.words; const kb = easeOut(seg(u, w[2][0] - 0.1, w[2][0] + 0.45));
  hallSet(t, d, { poolX: 400, cam: { zoom: lerp(1.16, 1.02, easeOut(t / d)), px: 0, py: 0 },
    mid: [{ z: 0.6, draw: () => { armour(400, 1250, 1.3, { stand: true, glint: seg(u, 0.1, 1.0), gold: 0.5 + 0.5 * seg(u, 0.2, 0.9) }); } }] });
  if (kb > 0) withT(760, lerp(560, 930, kb), 1, lerp(-0.5, 0.06, kb), () => { const h = lerp(60, 380, easeOut(seg(u, w[3][0], w[6][0] + 0.2)));
    P(rr(-150, -30, 300, h, 8), grad(-30, h, '#F0E2C2', '#CDB68A'), '#3A2A1A', 3); P(rr(-165, -44, 330, 34, 14), '#B89A64', '#3A2A1A', 3);
    if (h > 150) { txt('THE BILL', 0, 40, 48, M.red, 'Oswald', 700); for (let i = 0; i < Math.min(4, Math.floor((h - 100) / 50)); i++) P(rr(-110, 80 + i * 46, 220, 10, 4), 'rgba(40,30,20,0.4)', null); }
    if (h > 330) { P(circ(80, h - 70, 40), M.red, '#3A0606', 3); P(circ(80, h - 70, 24), null, 'rgba(246,210,122,0.7)', 3); } });
  bigText('BORROWED', W / 2, 390, 150, '#FFFFFF', seg(u, w[0][0] - 0.05, w[0][0] + 0.2) * (1 - seg(u, w[2][0] - 0.15, w[2][0])));
  bigText('STRENGTH…', W / 2, 540, 120, M.gold2, seg(u, w[1][0] - 0.05, w[1][0] + 0.2) * (1 - seg(u, w[2][0] - 0.15, w[2][0])));
  bigText('ALWAYS SENDS', W / 2, 390, 112, '#FFFFFF', seg(u, w[2][0] - 0.05, w[2][0] + 0.2));
  bigText('A BILL.', W / 2, 540, 150, M.red2 === '#C0392B' ? '#FF5A4A' : M.red2, seg(u, w[5][0] - 0.05, w[5][0] + 0.15));
};
const RING = [[-250, -10], [-170, -80], [0, -110], [170, -80], [250, -10], [170, 70], [0, 100], [-170, 70]];
DRAW.sc2 = (t, d) => { // hired red pieces march in, win for the king… then close in and chain him
  const u = lt('n2'), w = LINES.n2.words; const kIn = seg(u, w[7][0] - 0.2, w[8][0] + 0.6), kClose = easeOut(seg(u, w[9][0], w[12][0] + 0.4));
  warTable(t, d, { cam: { zoom: lerp(1.0, 1.12, ease(t / d)), px: 0, py: lerp(0, 40, ease(t / d)), cy: 1100 },
    mid: [{ z: 0.4, draw: () => {
      glow(W / 2, 1050, 260, kClose > 0.3 ? M.red2 : M.gold, 0.35);
      const pcs = RING.map((r, i) => { const a = easeOut(seg(kIn, i * 0.07, i * 0.07 + 0.45)); const R = lerp(1, 0.62, kClose); return [W / 2 + r[0] * R + (1 - a) * (i < 4 ? -700 : 700), 1170 + r[1] * R, a]; });
      pcs.filter(p => p[1] < 1170).forEach(p => alpha(p[2], () => chessPiece('pawn', p[0], p[1], 0.9, '#2A0606', M.red2, 0.9)));
      chessPiece('king', W / 2, 1170, 1.25, '#0B0A0E', M.gold2, 1);
      pcs.filter(p => p[1] >= 1170).forEach(p => alpha(p[2], () => chessPiece('pawn', p[0], p[1], 0.9, '#2A0606', M.red2, 0.9)));
      chainRing(W / 2, 1060, 170, 70, seg(u, w[11][0], w[12][0] + 0.5), M.red2);
    } }] });
  alpha(seg(t, 0.2, 0.6), () => chipTop('The Prince · Ch. 13 · on auxiliaries', 330));
  bigText('PRISONER', W / 2, 560, 130, '#FF5A4A', seg(u, w[12][0] - 0.05, w[12][0] + 0.2));
};
DRAW.sc3 = (t, d) => { // quote card over the war table, crown chained below
  const u = lt('q1'), w = LINES.q1.words;
  warTable(t, d, { cam: { zoom: lerp(1.08, 1.14, ease(t / d)), px: 10, py: 0, cy: 1100 },
    mid: [{ z: 0.4, draw: () => { chessPiece('king', W / 2, 1170, 1.25, '#0B0A0E', M.gold2, 0.8); chainRing(W / 2, 1060, 106, 44, 1, M.red2); } }] });
  ctx.fillStyle = 'rgba(5,3,6,0.45)'; ctx.fillRect(0, 0, W, H);
  crown(W / 2, 1300, 0.7, t, 0); chainLinks(W / 2 - 230, 1250, W / 2 + 230, 1330, seg(u, w[7][0], w[10][0] + 0.4), M.red2);
  quoteCard('q1', 0, 'For losing, one is undone, and winning, one is their captive.', '— The Prince, Ch. 13 (tr. Marriott)', ['undone', 'captive', 'winning'], { cy: 660, size: 70 });
};
function armourFlight(u, w) { return easeOut(seg(u, w[2][0], w[6][0] + 0.2)); }
DRAW.sc4 = (t, d) => { // the old story: a young man offers to face a giant; the king hands him his armour
  const id = act('n4') || lt('n4') >= 0 ? 'n4' : 'n3';
  const u3 = lt('n3'), w3 = LINES.n3.words, u4 = lt('n4'), w4 = LINES.n4.words;
  const gA = seg(u3, w3[8][0], w3[11][0] + 0.4), step = easeOut(seg(u3, w3[6][0], w3[8][0] + 0.3));
  const fl = id === 'n4' ? armourFlight(u4, w4) : 0, on = fl >= 1;
  const sag = id === 'n4' ? seg(u4, w4[7][0] - 0.1, w4[7][0] + 0.4) : 0;
  valleySet(t, d, { dawn: lerp(0.25, 0.5, t / d), giant: gA, sunX: 260, cam: { zoom: lerp(1.0, 1.1, ease(t / d)), px: lerp(-20, 20, ease(t / d)), py: 0, cy: 1100 },
    mid: [{ z: 0.62, draw: () => {
      king(300, 1260, 0.95, t, { f: 1 });
      const yx = lerp(640, 700, step);
      withT(yx, 1260, 1, sag * 0.06, () => { ctx.scale(1, 1 - 0.05 * sag); youth(0, 0, 0.82, { f: -1 });
        if (on) armour(0, 0, 0.82, { glint: id === 'n4' ? seg(u4, w4[8][0] - 0.1, w4[8][0] + 0.7) : -1, gold: id === 'n4' ? lerp(0.4, 1, seg(u4, w4[9][0] - 0.1, w4[9][0] + 0.4)) : 0.4 }); });
      if (fl > 0 && !on) armour(lerp(360, yx, fl), 1260 - Math.sin(fl * Math.PI) * 160, lerp(0.6, 0.82, fl), { rot: (1 - fl) * -0.3, gold: 0.4 });
    } }] });
  alpha(seg(t, 0.2, 0.6), () => chipTop('An old story Machiavelli retells · Ch. 13', 330));
  nameTag('DAVID', 690, 820, seg(u3, w3[6][0] - 0.1, w3[6][0] + 0.3) * (1 - seg(u4, w4[2][0], w4[2][0] + 0.3)));
  nameTag('KING SAUL', 300, 700, seg(u4, w4[0][0] - 0.1, w4[1][0] + 0.2) * (1 - seg(u4, w4[6][0], w4[6][0] + 0.3)));
  nameTag('THE GIANT', 860, 470, seg(u3, w3[11][0] - 0.1, w3[11][0] + 0.3) * (1 - seg(u4, 0, 0.4)), M.red2);
  if (id === 'n4') { const H1 = seg(u4, w4[7][0] - 0.05, w4[7][0] + 0.15) * (1 - seg(u4, w4[8][0] - 0.15, w4[8][0])), H2 = seg(u4, w4[8][0] - 0.05, w4[8][0] + 0.15) * (1 - seg(u4, w4[9][0] - 0.15, w4[9][0])), H3 = seg(u4, w4[9][0] - 0.05, w4[9][0] + 0.15);
    bigText('HEAVY.', W / 2, 520, 140, '#FFFFFF', H1); bigText('POLISHED.', W / 2, 520, 130, '#D8E2F0', H2); bigText('ROYAL.', W / 2, 520, 140, M.gold2, H3); }
};
DRAW.sc5 = (t, d) => { // he takes it off; the pieces fall; he walks out with only his sling
  const u = lt('n5'), w = LINES.n5.words; const off = seg(u, w[1][0], w[3][0] + 0.7);
  const fall = (k, dx, rot) => { const f = easeOut(seg(off, k * 0.12, k * 0.12 + 0.55)); return [dx * f, f * [410, 330, 245, 125][k] - Math.sin(f * Math.PI) * 60, rot * f, 1]; };
  const walk = easeOut(seg(u, w[8][0] - 0.1, w[13][0] + 0.6)); const sl = seg(u, w[11][0], w[13][0] + 0.5);
  const yx = lerp(560, 760, walk);
  valleySet(t, d, { dawn: lerp(0.5, 0.95, seg(u, w[8][0], w[13][0] + 0.5)), giant: 1, giantX: 900, sunX: 260, cam: { zoom: lerp(1.12, 1.04, ease(t / d)), px: lerp(30, -10, ease(t / d)), py: 0, cy: 1150 },
    mid: [{ z: 0.62, draw: () => {
      armour(560, 1260, 0.82, { off: { helm: fall(0, -150, -1.2), pl: fall(1, -60, 0.8), pr: fall(1, 90, -0.9), plate: fall(2, 40, 0.3), tas: fall(3, -40, 0.1) }, gold: 0.3 });
      const bob = Math.sin(walk * 18) * 6 * (walk > 0 && walk < 1 ? 1 : 0);
      youth(yx, 1260 + bob, 0.82, { f: 1, rimA: lerp(0.7, 1, sl) });
      if (sl > 0) sling(yx + 70, 1260 - 190 * 0.82 * 1.0 - 40, 1.1, t * 9, sl);
    } }] });
  if (seg(u, w[3][0] - 0.1, w[3][0] + 0.3) > 0 && u < w[4][0] + 0.4) { const k = seg(u, w[3][0], w[3][0] + 0.25); flash(u - w[3][0] - 0.25, '220,230,255', 0.2, 0.25); }
  bigText('WITH HIS SLING.', W / 2, 520, 104, M.gold2, seg(u, w[13][0] - 0.05, w[13][0] + 0.2));
};
function panel(y, h, k, fn) { ctx.save(); const p = rr(40, y, W - 80, h, 26); ctx.clip(p); fn(); ctx.restore(); P(rr(40, y, W - 80, h, 26), null, `rgba(226,176,74,${0.35 + 0.6 * k})`, 4); if (k < 1) { ctx.save(); ctx.clip(p); ctx.fillStyle = `rgba(4,3,6,${0.55 * (1 - k)})`; ctx.fillRect(40, y, W - 80, h); ctx.restore(); } }
DRAW.sc6 = (t, d) => { // today's armour: a friend writes all your code / a shop that lives on one big client
  const u = lt('n6'), w = LINES.n6.words; const kA = seg(u, w[3][0], w[4][0]) * (1 - 0.6 * seg(u, w[11][0] - 0.2, w[11][0])), kB = seg(u, w[11][0] - 0.2, w[11][0] + 0.1);
  fullFill(grad(0, H, '#0C0A14', '#040305'));
  const z = lerp(1, 1.04, t / d);
  withT(W / 2, 760, z, 0, () => { ctx.translate(-W / 2, -760);
    panel(250, 520, kA, () => { fullFill(grad(250, 770, '#101830', '#06070C')); P(rr(80, 330, 300, 230, 10), '#0A1224', '#1E2A44', 6); glow(230, 440, 140, '#4A6AA0', 0.2); for (let i = 0; i < 12; i++) P(circ(100 + rnd(i) * 260, 350 + rnd(i + 4) * 180, 2), 'rgba(255,240,200,0.7)', null);
      P(rr(120, 700, 860, 30, 6), '#2A1A10', null);
      const lap = [600, 700]; P(poly([lap[0] - 150, lap[1], lap[0] + 150, lap[1], lap[0] + 120, lap[1] - 190, lap[0] - 120, lap[1] - 190]), '#0E141E', '#2A3A54', 4);
      ctx.save(); ctx.beginPath(); ctx.rect(lap[0] - 110, lap[1] - 180, 220, 165); ctx.clip(); P(rr(lap[0] - 110, lap[1] - 180, 220, 165, 4), '#0B2A3A', null);
      for (let i = 0; i < 9; i++) { const ln = Math.floor(t * 6 + i); P(rr(lap[0] - 96 + (ln % 3) * 14, lap[1] - 168 + i * 17 - ((t * 30) % 17), 60 + rnd(ln) * 110, 7, 3), i % 3 ? '#2BFF88' : '#F6D27A', null); } ctx.restore();
      glow(lap[0], lap[1] - 100, 220, '#3AD0FF', 0.25);
      person(380, 730, 0.78, { sit: true, rim: '#7FB8FF', rimA: 0.5, f: 1 });
      person(780, 740, 0.86, { rim: M.gold2, rimA: 0.8, f: -1 });
      withT(700, 560, 1, 0, () => { line(0, 0, -60, 80, '#06060A', 22); });
      nameTag('YOUR FRIEND', 780, 330, kA, M.gold); nameTag('YOU', 380, 420, kA * 0.9, '#7FB8FF'); });
    panel(800, 440, kB, () => { fullFill(grad(800, 1240, '#2A160C', '#0A0604')); P(rr(80, 840, 520, 380, 8), '#1A0E08', null);
      for (let i = 0; i < 6; i++) P(poly([80 + i * 87, 860, 167 + i * 87, 860, 160 + i * 87, 940, 87 + i * 87, 940]), i % 2 ? '#8E1B1B' : '#EADBB8', null);
      P(rr(110, 960, 220, 160, 6), '#3A2A1A', null); glow(220, 1040, 120, '#FFC27A', 0.35); txt('OPEN', 220, 1040, 44, '#FFE6A0', 'Oswald', 700);
      P(rr(80, 1150, 520, 70, 4), '#2A1A10', null); person(460, 1150, 0.5, { rim: M.gold2, rimA: 0.8, f: 1 });
      const sway = Math.sin(t * 1.6) * 0.03; withT(840, 1240, 1, sway, () => person(0, 0, 0.95, { col: '#08050A', rim: M.red2, rimA: 0.8, f: -1 }));
      const th = seg(u, w[16][0] - 0.1, w[18][0] + 0.3); if (th > 0) { ctx.save(); ctx.strokeStyle = `rgba(246,210,122,${0.9 * th})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(490, 1000); ctx.quadraticCurveTo(650, 960 + Math.sin(t * 5) * 14, 790, 900); ctx.stroke(); ctx.restore(); glow(640, 960, 80, M.gold, 0.3 * th); }
      nameTag('ONE BIG CLIENT', 840, 860, kB, M.red2); });
  });
  dust(t, 40, [0, 200, W, 1100], '255,220,170', 12);
};
DRAW.sc7 = (t, d) => { // quote card; three small fates light up: falls off · weighs down · binds
  const u = lt('q2'), w = LINES.q2.words;
  hallSet(t, d, { poolX: W / 2, cam: { zoom: lerp(1.05, 1.12, ease(t / d)), px: 0, py: 0 }, mid: [{ z: 0.6, draw: () => armour(W / 2, 1250, 1.2, { stand: true, gold: 0.4 }) }] });
  ctx.fillStyle = 'rgba(5,3,6,0.55)'; ctx.fillRect(0, 0, W, H);
  quoteCard('q2', 0, 'The arms of others either fall from your back, or they weigh you down, or they bind you fast.', '— The Prince, Ch. 13 (tr. Marriott)', ['fall', 'weigh', 'bind', 'others'], { cy: 640, size: 64 });
  const k1 = seg(u, w[5][0] - 0.1, w[5][0] + 0.3), k2 = seg(u, w[11][0] - 0.1, w[11][0] + 0.3), k3 = seg(u, w[16][0] - 0.1, w[16][0] + 0.3);
  [[200, k1, 'FALLS OFF'], [540, k2, 'WEIGHS DOWN'], [880, k3, 'BINDS YOU']].forEach(([x, k, lab], i) => { alpha(0.35 + 0.65 * k, () => {
    glow(x, 1330, 150, i === 2 ? M.red2 : M.gold, 0.3 * k);
    if (i === 0) { person(x, 1460, 0.4, { rim: M.gold2, rimA: 0.8 }); armour(x - 70 * k, 1460 + 60 * easeOut(k), 0.4, { off: { helm: [-30 * k, 40 * k, -0.8 * k, 1], pl: [0, 0, 0, 0], pr: [0, 0, 0, 0], tas: [0, 0, 0, 0] }, rot: -0.5 * k }); }
    if (i === 1) { withT(x, 1460, 1, 0, () => { ctx.scale(1, 1 - 0.18 * k); person(0, 0, 0.4, { rim: M.gold2, rimA: 0.8 }); }); P(rr(x - 70, 1460 - 200 * (1 - 0.18 * k) - 60, 140, 60, 8), grad(1200, 1300, '#B9C3D2', '#2A3242'), '#11151E', 3); }
    if (i === 2) { person(x, 1460, 0.4, { rim: M.red2, rimA: 0.8 }); [1300, 1360, 1410].forEach((cy, j) => chainLinks(x - 60, cy, x + 60, cy + 12, k, M.red2, 5)); }
    txt(lab, x, 1515, 38, i === 2 ? '#FF7A6A' : M.gold2, 'Oswald', 700); }); });
};
DRAW.sc8 = (t, d) => { // help is fine — but the skill that saves you must be yours: training at sunrise, stone hits target
  const u = lt('n7'), w = LINES.n7.words; const kBut = seg(u, w[6][0] - 0.1, w[6][0] + 0.5); const sw = seg(u, w[7][0], w[11][0] + 0.2); const hit = u - (w[13][0] - 0.1);
  layers([
    { z: 0.02, draw: () => { const sk = ctx.createLinearGradient(0, 0, 0, 1240); sk.addColorStop(0, '#1A1838'); sk.addColorStop(0.55, '#B05A3A'); sk.addColorStop(1, '#FFC27A'); fullFill(sk); glow(W / 2, 1120, 560, '#FFE0A0', 0.6); P(circ(W / 2, 1150, 190), 'rgba(255,226,170,0.95)', null); } },
    { z: 0.15, draw: () => { for (let i = 0; i < 12; i++) { const a = -Math.PI + i * Math.PI / 11; alpha(0.12, () => beam(W / 2, 1150, 10, W / 2 + Math.cos(a) * 1400, 1150 + Math.sin(a) * 1400, 260, '255,230,180', 0.8)); } } },
    { z: 0.45, draw: () => { P(rr(-300, 1240, W + 600, 900, 0), grad(1240, 1920, '#2A1A10', '#050304'), null); line(-300, 1242, W + 300, 1242, 'rgba(255,220,160,0.7)', 4);
      withT(900, 1240, 1, 0, () => { P(rr(-10, -330, 20, 330, 4), '#0A0606', null); P(circ(0, -380, 74), '#0A0606', null); P(circ(0, -380, 50), null, M.red2, 8); P(circ(0, -380, 22), M.red2, null); }); } },
    { z: 0.6, draw: () => {
      alpha(1 - kBut, () => person(300, 1250, 0.86, { col: '#07050A', rim: '#FFE0A0', rimA: 0.9, f: 1 }));
      const yx = 520; youth(yx, 1250, 0.88, { f: 1, rim: '#FFE0A0' });
      if (kBut < 1) alpha(1 - kBut, () => line(370, 1250 - 300, yx - 50, 1250 - 330, '#07050A', 18));
      if (sw > 0 && hit < 0) sling(yx + 60, 1250 - 320, 1.25, t * 12, sw);
      if (hit > -0.35 && hit < 0) { const k = (hit + 0.35) / 0.35; P(circ(lerp(yx + 80, 900, k), lerp(910, 860, k), 12), '#FFE6A0', null); glow(lerp(yx + 80, 900, k), lerp(910, 860, k), 50, M.gold, 0.6); }
      if (hit >= 0) { glow(900, 860, 200 * (1 + hit), M.gold2, Math.max(0, 0.8 - hit)); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; P(circ(900 + Math.cos(a) * hit * 260, 860 + Math.sin(a) * hit * 260, 6), `rgba(255,220,140,${Math.max(0, 1 - hit * 1.6)})`, null); } }
    } },
    { z: 1.1, blur: 8, draw: () => { P(ell(60, 1880, 260, 180), '#030203', null); P(ell(1040, 1900, 220, 160), '#030203', null); } },
  ], { zoom: lerp(1.02, 1.1, ease(t / d)), px: lerp(-20, 20, ease(t / d)), py: 0, cy: 1150 });
  dust(t, 50, [0, 300, W, 1000], '255,230,180', 15);
  bigText('MUST BE', W / 2, 400, 120, '#FFFFFF', seg(u, w[12][0] - 0.05, w[12][0] + 0.2));
  bigText('YOURS.', W / 2, 540, 160, M.gold2, seg(u, w[14][0] - 0.05, w[14][0] + 0.15));
};
DRAW.sc9 = (t, d) => { // pick one job you always hand off → it comes back to you: do it yourself, once, today
  const u = lt('n8'), w = LINES.n8.words; const hand = easeOut(seg(u, w[4][0], w[8][0] + 0.3)); const back_ = back(seg(u, w[9][0] - 0.1, w[11][0])); const c1 = seg(u, w[12][0] - 0.05, w[12][0] + 0.3), c2 = seg(u, w[13][0] - 0.05, w[13][0] + 0.3);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#141020', '#060408')); const wx = 160, wy = 260, ww = 760, wh = 620; ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
      const sk = ctx.createLinearGradient(0, wy, 0, wy + wh); sk.addColorStop(0, '#2A2A5A'); sk.addColorStop(0.6, '#E58A4E'); sk.addColorStop(1, '#F7C47A'); ctx.fillStyle = sk; ctx.fillRect(wx, wy, ww, wh); glow(560, 840, 300, '#FFE0A0', 0.6);
      for (let i = 0; i < 14; i++) { const bh = 120 + rnd(i) * 260; P(rr(wx + i * 58, wy + wh - bh, 50, bh, 2), '#1A1020', null); } ctx.restore(); P(rr(wx, wy, ww, wh, 4), null, '#2A1A14', 18); line(wx + ww / 2, wy, wx + ww / 2, wy + wh, '#2A1A14', 12); } },
    { z: 0.4, draw: () => { beam(560, 600, 500, 560, 1300, 900, '255,210,150', 0.12); P(rr(-200, 1100, W + 400, 900, 0), grad(1100, 1920, '#3E2614', '#0A0604'), null); line(-200, 1102, W + 200, 1102, 'rgba(255,200,140,0.4)', 3);
      P(poly([700, 1100, 960, 1100, 930, 960, 730, 960]), '#0E141E', '#2A3A54', 4); P(ell(250, 1090, 60, 14), '#000', null); P(rr(210, 1010, 80, 80, 10), '#EADBB8', null); alpha(0.5, () => { for (let i = 0; i < 3; i++) line(240 + i * 18, 1000 - (t * 30 + i * 20) % 60, 246 + i * 18, 960 - (t * 30 + i * 20) % 60, '#fff', 3); }); } },
    { z: 0.7, draw: () => { // hands: yours (right), theirs (left)
      P(rr(-40, 1180, 260, 90, 40), '#0A0608', null); P(rr(860, 1180, 260, 90, 40), '#0A0608', null); alpha(0.6, () => { line(1000, 1182, 860, 1182, M.gold2, 3); line(80, 1182, 220, 1182, '#7FB8FF', 3); });
      const x = lerp(lerp(820, 240, hand), 760, back_ > 0 ? back_ : 0), y = 1000 - Math.sin(hand * Math.PI) * 90;
      withT(x, y, 1, lerp(0.05, -0.08, hand) * (1 - back_), () => { P(rr(-200, -160, 400, 300, 14), grad(-160, 140, '#F0E2C2', '#D9C292'), '#3A2A1A', 3);
        txt('THE JOB YOU', 0, -110, 40, '#24170C', 'Oswald', 700); txt('ALWAYS HAND OFF', 0, -62, 40, M.red, 'Oswald', 700);
        [['ONCE', c1], ['TODAY', c2]].forEach(([s, k], i) => { const yy = 10 + i * 70; P(rr(-150, yy - 24, 48, 48, 8), null, '#3A2A1A', 4); txt(s, 10, yy, 44, '#24170C', 'Oswald', 700, 'left');
          if (k > 0) { ctx.save(); ctx.strokeStyle = '#1F8A4A'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-142, yy); ctx.lineTo(-128 , yy + 16 * Math.min(1, k * 2)); if (k > 0.5) ctx.lineTo(lerp(-128, -96, (k - 0.5) * 2), lerp(yy + 16, yy - 22, (k - 0.5) * 2)); ctx.stroke(); ctx.restore(); } }); });
    } },
  ], { zoom: lerp(1.0, 1.07, ease(t / d)), px: 0, py: 0, cy: 1000 });
  dust(t, 40, [0, 300, W, 900], '255,220,170', 18);
  bigText('ONE JOB.', W / 2, 420, 130, '#FFFFFF', seg(u, w[1][0] - 0.05, w[1][0] + 0.2) * (1 - seg(u, w[9][0] - 0.2, w[9][0])));
  bigText('DO IT YOURSELF.', W / 2, 420, 100, M.gold2, seg(u, w[9][0] - 0.05, w[9][0] + 0.2));
};
DRAW.sc10 = (t, d) => { // comment question: what's your sling?
  const u = lt('n9'), w = LINES.n9.words;
  layers([
    { z: 0.04, draw: () => { fullFill(grad(0, H, '#22121A', '#070406')); glow(W / 2, 820, 600, '#E58A4E', 0.25); } },
    { z: 0.5, draw: () => { armour(240, 1250, 0.7, { stand: true, gold: 0.2 }); alpha(0.6, () => P(rr(-200, 1250, W + 400, 700, 0), grad(1250, 1900, '#1A1012', '#050304'), null)); } },
  ], { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0 });
  ctx.fillStyle = 'rgba(5,3,6,0.3)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(u, w[2][0] - 0.2, w[2][0] + 0.4)); if (k > 0) { glow(W / 2 + 120, 860, 300, M.gold, 0.35 * k); withT(W / 2 + 120, 860, k, 0, () => { line(-140, -160, 0, 0, M.gold2, 6); sling(-140, -160, 1.8, 0.9 + Math.sin(t * 3) * 0.5, k, 120); }); }
  bigText("WHAT'S YOUR", W / 2, 390, 104, '#FFFFFF', seg(u, w[0][0] - 0.05, w[0][0] + 0.2));
  bigText('SLING?', W / 2, 530, 150, M.gold2, seg(u, w[2][0] - 0.05, w[2][0] + 0.2));
  const kc = back(seg(u, w[3][0] - 0.05, w[3][0] + 0.35)); if (kc > 0) withT(W / 2 - 200, 1080, kc, 0, () => { const b = new Path2D(); b.roundRect(-110, -70, 220, 130, 30); b.moveTo(-30, 60); b.lineTo(-60, 105); b.lineTo(10, 60); P(b, '#F6F2E8', '#111', 4); for (let i = -1; i <= 1; i++) P(circ(i * 48, -5, 13), '#222', null); });
  dust(t, 40, [0, 300, W, 1100]);
};
DRAW.sc11 = (t, d) => { // end card: Follow Awazzzz · Mindset
  study(t, d, { dawn: 0.7, cam: { zoom: 1.12, px: 0, py: 0 }, candleX: 200 });
  ctx.fillStyle = 'rgba(5,3,6,0.62)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0, 0.4)); const L = document.getElementById('logo');
  withT(W / 2, 640, lerp(0.8, 1, k), 0, () => alpha(k, () => { glow(0, 0, 320, M.gold, 0.4); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -135, -135, 270, 270); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.strokeStyle = M.gold2; ctx.lineWidth = 7; ctx.stroke(); }));
  bigText('Follow Awazzzz', W / 2, 900, 104, '#FFFFFF', seg(t, 0.1, 0.4));
  bigText('MINDSET', W / 2, 1030, 66, M.gold2, seg(t, 0.3, 0.6), 'Oswald', 700);
  alpha(seg(t, 0.5, 0.8), () => txt('Machiavelli · Rumi · daily', W / 2, 1120, 44, M.parch, 'CrimsonText', 600));
  const pulse = 1 + 0.04 * Math.sin(t * 6); withT(W / 2, 1230, back(seg(t, 0.6, 0.9)) * pulse, 0, () => { P(rr(-200, -50, 400, 100, 50), '#E62117', '#111', 4); txt('SUBSCRIBE', 0, 4, 52, '#fff', 'Oswald', 700); });
};
function drawFrame(T) {
  GT = T; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, W, H);
  const i = SCENES.findIndex(s => T >= s.start && T < s.start + s.dur); const s = SCENES[i < 0 ? SCENES.length - 1 : i];
  ctx.save(); DRAW[s.id](T - s.start, s.dur); ctx.restore(); ctx.filter = 'none';
  const u = T - s.start; if (u < 0.18 && s.start > 0) { ctx.fillStyle = `rgba(0,0,0,${1 - u / 0.18})`; ctx.fillRect(0, 0, W, H); }
  const nxt = SCENES[SCENES.indexOf(s) + 1]; if (nxt && s.start + s.dur - T < 0.1) { ctx.fillStyle = `rgba(0,0,0,${1 - (s.start + s.dur - T) / 0.1})`; ctx.fillRect(0, 0, W, H); }
  vign(0.6); grain(T);
  if (s.id !== 'sc11') { watermark(T); captions(); }
}
function drawCover() {
  GT = 30; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  valleySet(3, 5, { dawn: 0.85, giant: 1, giantX: 880, sunX: 300, cam: { zoom: 1.0, px: 0, py: 0, cy: 1150 },
    mid: [{ z: 0.62, draw: () => { armour(330, 1260, 0.9, { off: { helm: [-120, 380, -1.2, 1], pl: [-40, 270, 0.8, 1], pr: [80, 300, -0.9, 1], plate: [30, 260, 0.3, 1], tas: [-160, 125, 0.1, 1] }, gold: 0.6 }); youth(620, 1260, 1.0, { f: 1, rimA: 1 }); sling(700, 1260 - 300, 1.4, -0.6, 1); } }] });
  ctx.filter = 'none'; vign(0.5);
  withT(W / 2, 300, 1, 0, () => { ctx.font = '700 54px Oswald'; const s = 'MACHIAVELLI'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -44, w, 88, 44), 'rgba(110,14,14,0.92)', M.gold2, 4); txt(s, 0, 3, 54, '#FFF3D6', 'Oswald', 700); });
  bigText('BORROWED', W / 2, 500, 148, '#FFFFFF', 1);
  bigText('ARMOUR?', W / 2, 670, 160, M.gold2, 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
  bigText('The Prince · Ch. 13', W / 2, 1520, 64, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
