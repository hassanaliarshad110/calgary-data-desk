// ===== Awazzzz Mindset — "Easy to Cure, Hard to See" (The Prince, Ch. 3) — vertical 1080x1920, dark cinematic 2.5D
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
const KEY = { n2: ['rewind', 'six', 'strangers'], n3: ['two', 'shorter'], n4: ['week', 'honest', 'fixed'], q1: ['wrote'], n5: ['machiavelli', 'doctor'], n6: ['cheap', 'invisible', 'expensive'], n7: ['essence', 'early', 'once'], n8: ['skill', 'small', 'silly'], n9: ['tonight', 'fine', 'five'], n10: ['ignoring'], n11: ['awazzzz', 'early'] };
const NOCAP = { q1: 2 }; // from word index n onwards the quote card carries the words
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


// ===== "Easy to Cure, Hard to See" — scene set for The Prince, Ch. 3 (the physicians' rule about hectic fever)
// New for this episode: night stone wall with a hairline gold crack (hook + callback), rain-streaked night café with pendant
// lamps and two seated friends told in REWIND (month 6 -> month 2 -> week 1, VHS rewind glitch, chat bubbles, the unsent
// honest message as a dashed ghost bubble), apothecary bottles in the candlelit study, crossing-curves parchment chart
// (easy to cure ↓ / easy to see ↑), Roman watchtower with a lantern sentinel spotting a far-off spark, crack sealed in gold,
// tonight's three icons (phone, bill, car noise) + five-minute timer ring, reunion at the café, end card.
const DD = { amber: '#FFB35C', amberRGB: '255,179,92', blue: '#7FA8FF', red: '#D23A2A', stone1: '#2A2326', stone2: '#151114' };

// ---------- stone wall + crack ----------
function stoneWall(o = {}) {
  const lx = o.lx ?? 860, ly = o.ly ?? 520;
  fullFill('#0B0809');
  for (let r = 0; r < 18; r++) { const y = -80 + r * 118, off = (r % 2) * 95;
    for (let c = -1; c < 7; c++) { const x = -60 + c * 190 + off, w = 182, h = 110; const v = rnd(r * 13 + c * 7 + 3);
      const top = lerpC('#2E2628', '#3C3133', v), bot = lerpC('#141012', '#1C1618', v);
      P(rr(x, y, w, h, 10), grad(y, y + h, top, bot), null);
      alpha(0.35, () => line(x + 8, y + 3, x + w - 8, y + 3, 'rgba(255,200,150,0.35)', 2));
      alpha(0.25, () => { for (let k = 0; k < 4; k++) P(circ(x + rnd(r * 31 + c * 5 + k) * w, y + rnd(r * 17 + c * 3 + k) * h, 3 + rnd(k + r) * 5), '#000', null); });
    } }
  glow(lx, ly, 820, '#FF9A40', 0.28 * flick(o.t || 0));
}
function crackPts(x, y, n, step, seed) { const p = [[x, y]]; let cx = x, cy = y;
  for (let i = 0; i < n; i++) { cx += (rnd(seed + i * 3.7) - 0.5) * step * 1.1; cy += step * (0.75 + rnd(seed + i * 1.3) * 0.5); p.push([cx, cy]); } return p; }
function drawCrack(pts, k, col, lw, blur = 18, from = 0) { if (k <= from) return; const n = (pts.length - 1) * k; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = col; ctx.shadowBlur = blur;
  ctx.beginPath(); const s0 = Math.floor((pts.length - 1) * from); ctx.moveTo(pts[s0][0], pts[s0][1]); for (let i = s0 + 1; i <= Math.floor(n); i++) ctx.lineTo(pts[i][0], pts[i][1]);
  const f = n - Math.floor(n), a = pts[Math.floor(n)], b = pts[Math.min(pts.length - 1, Math.floor(n) + 1)]; ctx.lineTo(lerp(a[0], b[0], f), lerp(a[1], b[1], f)); ctx.stroke(); ctx.restore(); }
function lantern(x, y, s, t, on = 1) { withT(x, y, s, 0, () => { glow(0, 0, 300 * flick(t), '#FFB45A', 0.55 * on); line(0, -70, 0, -46, '#120C08', 5);
  P(rr(-30, -46, 60, 16, 4), '#1A120B', null); P(rr(-26, -30, 52, 70, 8), `rgba(255,${190 + 30 * on},120,${0.35 + 0.6 * on})`, '#1A120B', 6); line(0, -30, 0, 40, '#1A120B', 4); P(rr(-32, 38, 64, 12, 4), '#1A120B', null);
  glow(0, 5, 60, '#FFF1C0', 0.8 * on); }); }

// ---------- night café ----------
function cafe(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.06, 18);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#140A0C', '#060405'));
      const wx = 110, wy = 250, ww = 860, wh = 820;
      const sk = ctx.createLinearGradient(0, wy, 0, wy + wh); sk.addColorStop(0, '#070A16'); sk.addColorStop(1, '#1C1222'); ctx.fillStyle = sk; ctx.fillRect(wx, wy, ww, wh);
      ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
      ctx.fillStyle = '#0B0A14'; for (let i = 0; i < 12; i++) { const x = wx + i * 78, h = 220 + rnd(i + 7) * 420; ctx.fillRect(x, wy + wh - h, 70, h); }
      for (let i = 0; i < 26; i++) { const x = wx + rnd(i * 3.1) * ww, y = wy + 180 + rnd(i * 5.3) * (wh - 200); const c = ['255,170,90', '255,90,70', '130,170,255', '255,220,150'][i % 4];
        glow(x, y, 26 + rnd(i) * 40, `rgba(${c},1)`, 0.35 + 0.2 * Math.sin(t * 1.3 + i)); }
      alpha(0.35, () => { for (let i = 0; i < 70; i++) { const x = wx + rnd(i * 1.7) * ww, y = wy + ((rnd(i * 2.9) * wh + t * (240 + rnd(i) * 200)) % wh); line(x, y, x - 3, y + 26 + rnd(i) * 30, 'rgba(190,210,255,0.6)', 2); } });
      ctx.restore();
      P(rr(wx, wy, ww, wh, 4), null, '#1C110C', 26); line(wx + ww / 2, wy, wx + ww / 2, wy + wh, '#1C110C', 16); line(wx, wy + 300, wx + ww, wy + 300, '#1C110C', 14);
    } },
    { z: 0.2, draw: () => { [300, 780].forEach((x, i) => { line(x, -40, x, 200, '#0A0606', 4); P(poly([x - 70, 260, x + 70, 260, x + 30, 200, x - 30, 200]), '#1E120A', null); glow(x, 270, 120, '#FFD59A', 0.9 * flick(t + i * 2, 0.5));
        beam(x, 262, 120, x, 1250, 560, DD.amberRGB, 0.10); });
      P(rr(-200, 1180, W + 400, 800, 0), grad(1180, H, '#1C0F0C', '#060304'), null); } },
    ...(o.mid || []),
    { z: 1.15, blur: 8, draw: () => { // blurred cup + plant edges
      P(rr(-40, 1660, 210, 190, 30), '#120A08', null); P(ell(65, 1660, 105, 22), '#2A1A12', null);
      ctx.fillStyle = '#030303'; for (let i = 0; i < 6; i++) P(ell(1000 + i * 14, 300 + i * 120, 70, 26, 0.7 + i * 0.2), '#040404', null); } },
  ], cam);
  dust(t, 40, [120, 300, 840, 900], '255,214,160', o.seed || 21);
}
function cafeTable() { P(ell(540, 1215, 420, 54), '#3A2414', null); P(rr(120, 1215, 840, 46, 8), grad(1215, 1261, '#2A180E', '#120A06'), null); line(150, 1200, 930, 1200, 'rgba(255,200,140,0.35)', 3); P(rr(515, 1255, 50, 420, 6), '#120A06', null); }
function friendPair(sep, o = {}) { // two seated friends; o.away: face away; o.phones: lit by phone
  const fl = o.away ? -1 : 1, s = 1.55;
  [[-1, false, M.gold2], [1, true, '#E58A4E']].forEach(([sd, hair, rim]) => {
    const x = 540 + sd * sep, f = (o.away ? -sd : -sd) * (o.away ? 1 : 1) * (o.away ? 1 : -1) * -1;
    const face = o.away ? sd : -sd; // +1 = faces right
    person(x, 1215, s, { sit: true, f: face, rim, rimA: 0.75, hair });
    if (o.phones) { const px = x + face * 70, py = 1215 - 300; glow(px, py - 60, 120, '#9FC0FF', 0.45); P(rr(px - 18, py - 26, 36, 56, 6), '#BFD4FF', '#0A0A12', 3); }
  });
  cafeTable(); P(rr(380, 1160, 60, 52, 10), '#E8DCC8', null); P(rr(640, 1160, 60, 52, 10), '#E8DCC8', null);
}
function chatBubble(s, x, y, k, o = {}) { if (k <= 0) return; withT(x, y, back(k), 0, () => alpha(clamp(k * 1.6) * (o.a ?? 1), () => {
  const size = o.size || 40; ctx.font = `700 ${size}px Montserrat`; const w = ctx.measureText(s).width + 44, h = size * 1.75;
  const b = new Path2D(); b.roundRect(-w / 2, -h / 2, w, h, h / 2.2); b.moveTo((o.tail || -1) * 14, h / 2 - 2); b.lineTo((o.tail || -1) * 34, h / 2 + 22); b.lineTo((o.tail || -1) * -6, h / 2 - 2);
  if (o.dash) { ctx.save(); ctx.setLineDash([12, 9]); P(b, 'rgba(30,20,6,0.55)', M.gold2, 4); ctx.restore(); } else P(b, o.fill || 'rgba(230,232,240,0.92)', null);
  txt(s, 0, 2, size, o.col || '#1A1620', 'Montserrat', 700); })); }
function rewindChip(label, k, t) { if (k <= 0) return; alpha(k, () => { withT(W / 2, 330, lerp(1.2, 1, easeOut(k)), 0, () => {
  ctx.font = '700 70px Oswald'; const w = ctx.measureText(label).width + 170; P(rr(-w / 2, -55, w, 110, 55), 'rgba(12,6,8,0.78)', M.gold2, 3);
  const ix = -w / 2 + 62; [0, 34].forEach(dx => P(poly([ix + dx + 28, -26, ix + dx + 28, 26, ix + dx - 6, 0]), M.gold2, null));
  txt(label, 40, 4, 70, '#FFF3D6', 'Oswald', 700); }); }); }
function vhs(u, d = 0.45) { if (u < 0 || u > d) return; const k = 1 - u / d;   for (let i = 0; i < 9; i++) { const y = rnd(i * 7 + Math.floor(u * 30)) * H, h = 20 + rnd(i * 3) * 70, dx = (rnd(i * 11 + Math.floor(u * 30)) - 0.5) * 120 * k;
    ctx.drawImage(ctx.canvas, 0, y, W, h, dx, y, W, h); }
  ctx.fillStyle = `rgba(255,255,255,${0.12 * k})`; for (let y = 0; y < H; y += 8) ctx.fillRect(0, y, W, 2); }

// ---------- watchtower ----------
function towerSet(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.08, 20); const spark = o.spark ?? 1, out = o.out ?? 0;
  layers([
    { z: 0.03, draw: () => { const sk = ctx.createLinearGradient(0, 0, 0, 1300); sk.addColorStop(0, '#05060E'); sk.addColorStop(0.6, '#140C18'); sk.addColorStop(1, '#3A1A16'); fullFill(sk);
      for (let i = 0; i < 90; i++) alpha(0.4 + 0.5 * Math.abs(Math.sin(t * 0.8 + i)), () => P(circ(rnd(i * 2.1) * W, rnd(i * 4.7) * 800, 1 + rnd(i) * 2.2), '#FFF3D6', null));
      glow(860, 640, 160, '#F6E6C0', 0.35); P(circ(860, 640, 54), '#EADBB8', null); P(circ(882, 628, 50), '#0A0812', null); } },
    { z: 0.15, draw: () => { ctx.fillStyle = '#0E0A10'; ctx.beginPath(); ctx.moveTo(-200, 1060); for (let i = 0; i <= 14; i++) ctx.lineTo(-200 + i * 110, 1010 - Math.sin(i * 0.9) * 40 - rnd(i + 3) * 40); ctx.lineTo(1400, 1500); ctx.lineTo(-200, 1500); ctx.fill();
      const sx = 790, sy = 1005; if (spark > 0 && out < 1) { const a = (1 - out) * spark; glow(sx, sy - 10, 150, '#FF5A2A', 0.6 * a * flick(t * 1.4)); for (let k = 0; k < 3; k++) { const f = new Path2D(); const h = 26 + k * 8; f.moveTo(sx - 12 + k * 10, sy); f.quadraticCurveTo(sx - 16 + k * 10, sy - h, sx - 4 + k * 10 + Math.sin(t * 9 + k) * 4, sy - h - 12); f.quadraticCurveTo(sx + 6 + k * 10, sy - h, sx + 2 + k * 10, sy); alpha(a, () => P(f, k === 1 ? '#FFD27A' : '#FF6A2A', null)); } }
      if (out > 0) alpha(out * (1 - seg(out, 0.6, 1) * 0.6), () => { for (let k = 0; k < 5; k++) P(circ(sx + Math.sin(t + k) * 14, sy - 30 - k * 34 - out * 40, 14 + k * 7), 'rgba(140,130,140,0.25)', null); });
      if (o.ring) { const r = o.ring; alpha(r, () => { ctx.save(); ctx.strokeStyle = M.gold2; ctx.lineWidth = 5; ctx.shadowColor = M.gold2; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(sx, sy - 18, lerp(140, 70, easeOut(r)), 0, 6.283); ctx.stroke(); ctx.restore(); }); }
    } },
    { z: 0.45, draw: () => { ctx.fillStyle = '#07050A'; ctx.beginPath(); ctx.moveTo(-200, 1240); ctx.bezierCurveTo(200, 1120, 600, 1180, 1300, 1260); ctx.lineTo(1300, 2100); ctx.lineTo(-200, 2100); ctx.fill();
      ctx.save(); ctx.translate(0, 260);
      // tower
      const tx = 110, tw = 330; P(poly([tx, 1300, tx + tw, 1300, tx + tw - 26, 760, tx + 26, 760]), grad(760, 1300, '#241A1C', '#0C080A'), null);
      for (let r = 0; r < 9; r++) for (let c = 0; c < 4; c++) alpha(0.35, () => P(rr(tx + 30 + c * 70 + (r % 2) * 30, 780 + r * 58, 62, 50, 4), null, '#3A2C2A', 2));
      P(rr(tx - 20, 700, tw + 40, 70, 4), '#1C1416', null); for (let i = 0; i < 6; i++) P(rr(tx - 20 + i * 68, 640, 44, 64, 3), '#1C1416', null);
      line(tx - 20, 702, tx + tw + 20, 702, 'rgba(255,190,120,0.4)', 3);
      P(rr(tx + 140, 1120, 60, 120, [30, 30, 0, 0]), '#FFB45A', null); glow(tx + 170, 1180, 120, '#FFB45A', 0.4);
      // sentinel + lantern held out toward the horizon
      person(tx + 220, 700, 0.95, { f: 1, rim: '#FFD08A', rimA: 0.9 });
      line(tx + 290, 560, tx + 360, 520, '#06060A', 22); lantern(tx + 372, 560, 0.9, t, 1);
      ctx.restore();
      beam(tx + 380, 820, 60, 790, 990, 260, DD.amberRGB, 0.08 + 0.1 * (o.look ?? 0));
    } },
    { z: 1.1, blur: 7, draw: () => { ctx.fillStyle = '#020203'; for (let i = 0; i < 40; i++) { const x = -40 + i * 30; ctx.beginPath(); ctx.moveTo(x, H + 20); ctx.quadraticCurveTo(x + 10 + Math.sin(t + i) * 8, H - 150 - rnd(i) * 160, x + 24, H + 20); ctx.fill(); } } },
  ], cam);
  dust(t, 30, [0, 300, W, 900], '255,200,150', 31);
}

// ---------- props for the action scene ----------
function phoneIcon(x, y, s, k) { withT(x, y, s * back(k), 0, () => alpha(clamp(k * 1.5), () => { glow(0, 0, 160, '#9FC0FF', 0.35); P(rr(-62, -110, 124, 220, 20), '#0E1220', M.gold2, 5); P(rr(-50, -90, 100, 170, 8), '#22305A', null);
  P(rr(-40, -60, 70, 30, 12), '#E8ECF8', null); P(rr(-24, -18, 64, 30, 12), M.gold2, null); P(circ(0, 96, 7), M.gold2, null); })); }
function billIcon(x, y, s, k) { withT(x, y, s * back(k), -0.06, () => alpha(clamp(k * 1.5), () => { glow(0, 0, 160, M.gold, 0.3); P(rr(-80, -105, 160, 210, 8), grad(-105, 105, '#F0E2C2', '#CDB68A'), '#1A120B', 4);
  for (let i = 0; i < 5; i++) line(-55, -60 + i * 26, 30 - (i % 2) * 30, -60 + i * 26, 'rgba(60,40,20,0.55)', 5);
  withT(10, 70, 1, -0.2, () => { P(rr(-56, -24, 112, 48, 8), null, DD.red, 5); txt('DUE', 0, 2, 34, DD.red, 'Oswald', 700); }); })); }
function carIcon(x, y, s, k, t) { withT(x, y, s * back(k), 0, () => alpha(clamp(k * 1.5), () => { glow(0, 0, 170, '#FF8A50', 0.25);
  const c = new Path2D(); c.moveTo(-120, 30); c.lineTo(-112, -10); c.lineTo(-70, -22); c.lineTo(-40, -66); c.lineTo(46, -66); c.lineTo(84, -22); c.lineTo(118, -12); c.lineTo(124, 30); c.closePath(); P(c, '#140E10', M.gold2, 5);
  P(poly([-30, -56, 0, -56, 0, -24, -54, -24]), '#3A4A6A', null); P(poly([10, -56, 40, -56, 66, -24, 10, -24]), '#3A4A6A', null);
  [-70, 72].forEach(wx => { P(circ(wx, 32, 26), '#060506', M.gold2, 4); P(circ(wx, 32, 9), M.gold2, null); });
  ctx.save(); ctx.strokeStyle = '#FF8A50'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { ctx.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin(t * 5 - i)); ctx.beginPath(); ctx.arc(150, -10, 20 + i * 22, -0.7, 0.7); ctx.stroke(); } ctx.restore(); })); }
function timerRing(x, y, r, k, prog, t) { if (k <= 0) return; withT(x, y, back(k), 0, () => alpha(clamp(k * 1.5), () => {
  glow(0, 0, r * 1.8, M.gold, 0.35); P(circ(0, 0, r), 'rgba(10,6,8,0.85)', 'rgba(246,210,122,0.25)', 14);
  ctx.save(); ctx.strokeStyle = M.gold2; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.shadowColor = M.gold2; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + 6.283 * (1 - prog)); ctx.stroke(); ctx.restore();
  const secs = Math.max(0, Math.ceil(300 * (1 - prog))); const mm = Math.floor(secs / 60), ss = secs % 60;
  txt(`${mm}:${String(ss).padStart(2, '0')}`, 0, 4, r * 0.62, '#FFF3D6', 'Oswald', 700); txt('MINUTES', 0, r * 0.48, r * 0.17, M.gold2, 'Oswald', 700); })); }

// ================= SCENES =================
const CR = crackPts(560, 560, 22, 34, 7);              // hairline crack (hook / seal)
const CRB = crackPts(520, 300, 26, 48, 19);            // big crack (n8)
DRAW.sc1 = (t, d) => { // hook: night stone wall, a hairline gold crack, lantern glow; camera pushes in on the tiny crack
  const u = lt('h1');
  layers([{ z: 0.3, draw: () => { stoneWall({ t, lx: 880, ly: 600 }); drawCrack(CR, 0.25 + 0.15 * seg(u, 0, 3.5), 'rgba(246,210,122,0.9)', 3.5, 22); } },
          { z: 0.8, draw: () => lantern(900, 640, 1.3, t, 1) },
          { z: 1.2, blur: 8, draw: () => { ctx.fillStyle = '#030203'; ctx.fillRect(-140, 0, 120, H); } }],
    { zoom: lerp(1.0, 1.35, ease(t / d)), px: 0, py: 0, cy: 700, fx: 0 });
  dust(t, 50, [100, 300, 880, 900], '255,214,160', 3);
  bigText('MOST PROBLEMS', W / 2, 1060, 92, '#FFFFFF', seg(u, 0.05, 0.3));
  bigText('WERE ONCE SMALL', W / 2, 1180, 92, M.gold2, seg(u, wt('h1', 7) - 0.1, wt('h1', 7) + 0.15));
  alpha(seg(u, wt('h1', 12) - 0.1, wt('h1', 12) + 0.2), () => { ctx.font = '700 64px Oswald'; const s = 'FIVE-MINUTE FIX'; const w = ctx.measureText(s).width + 60; P(rr(W / 2 - w / 2, 1280, w, 90, 45), 'rgba(12,6,8,0.8)', M.gold2, 3); txt(s, W / 2, 1327, 64, M.gold2, 'Oswald', 700); });
};
DRAW.sc2 = (t, d) => { // rewind → month six: friends at opposite ends, facing away
  const u = lt('n2');
  cafe(t, d, { cam: { zoom: lerp(1.08, 1.02, ease(t / d)), px: 0, py: 0, cy: 1100 }, mid: [{ z: 0.55, draw: () => friendPair(330, { away: true }) }] });
  ctx.fillStyle = 'rgba(10,14,30,0.22)'; ctx.fillRect(0, 0, W, H);
  rewindChip('REWIND', 1 - seg(u, wt('n2', 3) - 0.2, wt('n2', 3)), t);
  rewindChip('MONTH 6', seg(u, wt('n2', 3) - 0.1, wt('n2', 3) + 0.15), t);
  bigText('STRANGERS', W / 2, 520, 110, '#FFFFFF', kin('n2', 7, 0.1, 0.25));
  vhs(t, 0.5);
};
DRAW.sc3 = (t, d) => { // month two: a little closer, both on phones, replies shrink
  const u = lt('n3');
  cafe(t + 3, d, { cam: { zoom: lerp(1.04, 1.1, ease(t / d)), px: 0, py: 0, cy: 1100 }, mid: [{ z: 0.55, draw: () => friendPair(240, { phones: true }) }] });
  rewindChip('MONTH 2', seg(u, 0, 0.2), t);
  const r = [['Sounds good!', 300, 640, 3], ['ok', 790, 760, 4], ['k', 300, 860, 5], ['.', 790, 960, 6]];
  r.forEach(([s, x, y, wi], i) => chatBubble(s, x, y, seg(u, wt('n3', Math.min(wi, 9)) - 0.3 + i * 0.05, wt('n3', Math.min(wi, 9))), { size: i ? 40 : 40, tail: x < 540 ? -1 : 1, a: 1 - 0.15 * i }));
  vhs(t, 0.35);
};
DRAW.sc4 = (t, d) => { // week one: side by side, the cancelled plan, the joke, and the honest message that was never sent
  const u = lt('n4');
  cafe(t + 6, d, { cam: { zoom: lerp(1.1, 1.18, ease(t / d)), px: 0, py: 0, cy: 1100 }, mid: [{ z: 0.55, draw: () => friendPair(150) }] });
  rewindChip('WEEK 1', seg(u, 0, 0.2), t);
  chatBubble("can't make it, sorry", 360, 600, seg(u, wt('n4', 3) - 0.3, wt('n4', 3)) * (1 - 0.5 * seg(u, wt('n4', 10) - 0.2, wt('n4', 10))), { tail: -1 });
  chatBubble('haha… jk', 800, 620, seg(u, wt('n4', 6) - 0.3, wt('n4', 6)) * (1 - 0.5 * seg(u, wt('n4', 10) - 0.2, wt('n4', 10))), { tail: 1, fill: 'rgba(255,190,170,0.92)' });
  chatBubble('hey… are we good?', 540, 900, seg(u, wt('n4', 10) - 0.2, wt('n4', 11)), { dash: true, col: M.gold2, size: 48 });
  alpha(seg(u, wt('n4', 13) - 0.1, wt('n4', 13) + 0.2), () => txt('never sent', 540, 990, 40, 'rgba(246,210,122,0.85)', 'CrimsonText', 600));
  vhs(t, 0.35);
};
DRAW.sc5 = (t, d) => { // 1513: the candlelit study, thinker writing, apothecary bottles = the doctor's rule
  const u = lt('n5');
  study(t, d, { dawn: 0.2, cam: { zoom: lerp(1.02, 1.1, ease(t / d)), px: 0, py: 0 },
    desk: () => { [[430, 0.95, '#3A7A5A'], [520, 1.15, '#7A2A2A'], [610, 0.85, '#C08A3A']].forEach(([x, s, c], i) => withT(x, 1150, s, 0, () => {
        glow(0, -60, 90, c, 0.4); P(rr(-26, -110, 52, 110, 14), `rgba(200,220,230,0.25)`, 'rgba(255,230,200,0.5)', 3); P(rr(-24, -70 + i * 8, 48, 68 - i * 8, 12), c, null); P(rr(-12, -132, 24, 24, 4), '#3A2414', null); }));
      withT(700, 1150, 1, 0, () => { P(new Path2D('M-50 -50 Q0 30 50 -50 Z'), '#2A2024', 'rgba(255,200,140,0.4)', 3); line(10, -40, 50, -110, '#4A3A30', 12); }); },
    extra: [{ z: 0.7, draw: () => thinker(850, 1200, 0.9, t) }] });
  chipAt('The Prince · 1513', 330, kin('n5', 0, 0.05, 0.3));
  bigText("A DOCTOR'S RULE", W / 2, 480, 96, M.gold2, kin('n5', 9, 0.1, 0.25));
};
DRAW.sc6 = (t, d) => { // quote card over the study
  study(t + 5, d, { dawn: 0.25, cam: { zoom: lerp(1.08, 1.12, ease(t / d)), px: 0, py: 0 }, extra: [{ z: 0.7, draw: () => thinker(850, 1200, 0.9, t) }] });
  ctx.fillStyle = 'rgba(4,3,6,0.45)'; ctx.fillRect(0, 0, W, H);
  quoteCard2('q1', 2, '…in the beginning of the malady it is easy to cure but difficult to detect… but in the course of time… it becomes easy to detect but difficult to cure.', ['— The Prince, Ch. 3 (tr. Marriott)'], ['cure', 'detect'], { size: 58, cy: 740, in: 0.15 });
};
DRAW.sc7 = (t, d) => { // crossing curves on parchment: easy to cure falls, easy to see rises
  const u = lt('n6');
  study(t + 9, d, { dawn: 0.15, cam: { zoom: 1.12, px: 0, py: 0 } });
  ctx.fillStyle = 'rgba(4,3,6,0.55)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(u, 0, 0.4)); if (k <= 0) return;
  withT(W / 2, 760 + (1 - k) * 50, 1, 0, () => alpha(k, () => {
    const pw = 900, ph = 840; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; P(rr(-pw / 2, -ph / 2, pw, ph, 14), grad(-ph / 2, ph / 2, '#F0E2C2', '#D4BC8C'), null); ctx.restore();
    const x0 = -360, x1 = 380, y0 = 250, y1 = -250;
    line(x0, y0, x1, y0, '#3A2A1A', 5); line(x0, y0, x0, y1 - 30, '#3A2A1A', 5); P(poly([x1 + 26, y0, x1, y0 - 14, x1, y0 + 14]), '#3A2A1A', null);
    txt('TIME →', x1 - 60, y0 + 48, 36, '#5A3A1A', 'Oswald', 700);
    const curve = (fn, k2, col) => { if (k2 <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); const n = 60;
      for (let i = 0; i <= n * k2; i++) { const p = i / n, x = lerp(x0 + 10, x1 - 20, p), y = fn(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); };
    const cure = p => lerp(y1 + 10, y0 - 20, 1 / (1 + Math.exp(-(p - 0.5) * 9))), see = p => lerp(y0 - 20, y1 + 10, 1 / (1 + Math.exp(-(p - 0.5) * 9)));
    const kc = seg(u, 0.0, wt('n6', 6) + 0.2), ks = seg(u, wt('n6', 7) - 0.1, wt('n6', 12));
    curve(cure, kc, '#B8862A'); curve(see, ks, M.red);
    alpha(seg(u, 0.2, 0.6), () => { txt('EASY TO CURE', x0 + 190, y1 - 10, 44, '#8A5A10', 'Oswald', 700); });
    alpha(seg(u, wt('n6', 7) - 0.1, wt('n6', 7) + 0.3), () => txt('EASY TO SEE', x1 - 170, y1 - 10, 44, M.red, 'Oswald', 700));
    alpha(seg(u, wt('n6', 4), wt('n6', 6)), () => { txt('cheap', x0 + 150, -30, 50, '#3A2A1A', 'CrimsonText', 700); txt('but invisible', x0 + 150, 20, 42, '#5A3A1A', 'CrimsonText', 600); });
    alpha(seg(u, wt('n6', 11), wt('n6', 12) + 0.2), () => { txt('obvious', x1 - 130, 60, 50, M.red, 'CrimsonText', 700); txt('but expensive', x1 - 130, 110, 42, '#5A1A12', 'CrimsonText', 600); });
    // moving "you are here" dot slides right along time
    const p = clamp(u / 4.6); if (seg(u, 0.4, 0.8) > 0) alpha(seg(u, 0.4, 0.8), () => { const x = lerp(x0 + 10, x1 - 20, p); line(x, y0, x, y1 - 10, 'rgba(60,40,20,0.35)', 3); P(circ(x, cure(p), 14), '#8A5A10', '#F0E2C2', 4); });
  }));
};
DRAW.sc8 = (t, d) => { // Romans: watchtower sentinel spots a far-off spark and acts at once
  const u = lt('n7');
  const ring = seg(u, wt('n7', 8) - 0.2, wt('n7', 9) + 0.1), out = seg(u, wt('n7', 13) - 0.1, wt('n7', 15) + 0.6);
  towerSet(t, d, { cam: { zoom: lerp(1.0, 1.1, ease(t / d)), px: lerp(-10, 30, ease(t / d)), py: 0, cy: 1000 }, ring, out, look: seg(u, wt('n7', 7), wt('n7', 9)) });
  chipAt('in essence · The Prince, Ch. 3', 250, kin('n7', 0, 0.05, 0.3));
  bigText('SEE IT FAR OFF', W / 2, 385, 92, '#FFFFFF', kin('n7', 7, 0.1, 0.25) * (1 - seg(u, wt('n7', 11) - 0.2, wt('n7', 11))));
  bigText('ACT AT ONCE', W / 2, 385, 100, M.gold2, kin('n7', 11, 0.1, 0.25));
};
DRAW.sc9 = (t, d) => { // the skill: big crack (red, too late) → tiny crack sealed in gold
  const u = lt('n8'); const sw = seg(u, wt('n8', 7) - 0.25, wt('n8', 7) + 0.1);
  if (sw < 1) alpha(1 - sw, () => { layers([{ z: 0.3, draw: () => { stoneWall({ t, lx: 300, ly: 400 }); drawCrack(CRB, 1, '#0A0405', 26, 0); drawCrack(CRB, 1, 'rgba(210,58,42,0.75)', 6, 30); } }],
      { zoom: lerp(1.0, 1.06, ease(t / 2)), px: 0, py: 0, cy: 900 }); ctx.fillStyle = 'rgba(80,10,10,0.18)'; ctx.fillRect(0, 0, W, H);
    bigText('BIG FIXES?', W / 2, 400, 104, '#FFFFFF', kin('n8', 4, 0.1, 0.25)); });
  if (sw > 0) alpha(sw, () => { const seal = seg(u, wt('n8', 9), wt('n8', 16));
    layers([{ z: 0.3, draw: () => { stoneWall({ t: t + 2, lx: 860, ly: 560 }); drawCrack(CR, 0.45, 'rgba(120,90,60,0.9)', 3.5, 6); drawCrack(CR, 0.45 * seal, M.gold2, 9, 30);
        if (seal > 0 && seal < 1) { const n = (CR.length - 1) * 0.45 * seal, a = CR[Math.floor(n)]; glow(a[0], a[1], 90, '#FFF1C0', 0.9); } } },
      { z: 0.8, draw: () => lantern(900, 640, 1.3, t, 1) }],
      { zoom: lerp(1.25, 1.4, ease(seg(u, wt('n8', 7), 6))), px: 0, py: 0, cy: 700 });
    bigText('SMALL ONES', W / 2, 1110, 104, M.gold2, kin('n8', 9, 0.1, 0.25)); });
};
DRAW.sc10 = (t, d) => { // tonight: one thing you call "fine" → friend, bill, car noise → five-minute timer
  const u = lt('n9');
  cafe(t + 9, d, { cam: { zoom: 1.12, px: 0, py: 0, cy: 1100 } }); ctx.fillStyle = 'rgba(4,3,8,0.62)'; ctx.fillRect(0, 0, W, H);
  bigText('TONIGHT', W / 2, 330, 104, M.gold2, seg(u, 0, 0.2));
  const kf = seg(u, wt('n9', 7) - 0.2, wt('n9', 7) + 0.1);
  if (kf > 0) alpha(kf * (1 - seg(u, wt('n9', 8) - 0.2, wt('n9', 8))), () => { txt('"it\'s fine"', W / 2, 520, 90, '#FFFFFF', 'CrimsonText', 700); ctx.save(); ctx.strokeStyle = DD.red; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(W / 2 - 200, 530); ctx.lineTo(W / 2 - 200 + 400 * seg(u, wt('n9', 7), wt('n9', 7) + 0.4), 516); ctx.stroke(); ctx.restore(); });
  const shrink = seg(u, wt('n9', 16) - 0.3, wt('n9', 16) + 0.2), iy = lerp(700, 560, shrink), is = lerp(1, 0.72, shrink);
  phoneIcon(230, iy, is, seg(u, wt('n9', 9) - 0.25, wt('n9', 9) + 0.1));
  billIcon(520, iy, is, seg(u, wt('n9', 11) - 0.25, wt('n9', 11) + 0.1));
  carIcon(800, iy + 20, is * 0.95, seg(u, wt('n9', 13) - 0.25, wt('n9', 13) + 0.1), t);
  timerRing(W / 2, 950, 170, seg(u, wt('n9', 18) - 0.25, wt('n9', 18) + 0.1), seg(u, wt('n9', 19), d + 0.8) * 0.02, t);
};
DRAW.sc11 = (t, d) => { // comment question: the friends together again at the café
  const u = lt('n10');
  cafe(t + 12, d, { cam: { zoom: lerp(1.14, 1.2, ease(t / d)), px: 0, py: 0, cy: 1100 }, mid: [{ z: 0.55, draw: () => { friendPair(150); glow(540, 900, 260, '#FFD08A', 0.25); } }] });
  bigText('WHAT ARE YOU', W / 2, 330, 96, '#FFFFFF', seg(u, 0, 0.2));
  bigText('IGNORING?', W / 2, 460, 110, M.gold2, kin('n10', 5, 0.1, 0.2));
  const kc = back(seg(u, wt('n10', 6) - 0.05, wt('n10', 6) + 0.35)); if (kc > 0) withT(820, 600, kc, 0, () => { const b = new Path2D(); b.roundRect(-110, -70, 220, 130, 30); b.moveTo(-30, 60); b.lineTo(-60, 105); b.lineTo(10, 60); P(b, '#F6F2E8', '#111', 4); for (let i = -1; i <= 1; i++) P(circ(i * 48, -5, 13), '#222', null); });
};
DRAW.sc12 = (t, d) => { // end card
  layers([{ z: 0.3, draw: () => { stoneWall({ t, lx: 860, ly: 560 }); drawCrack(CR, 0.45, M.gold2, 9, 30); } }], { zoom: 1.3, px: 0, py: 0, cy: 700 });
  ctx.fillStyle = 'rgba(3,3,8,0.64)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0, 0.4)); const L = document.getElementById('logo');
  withT(W / 2, 640, lerp(0.8, 1, k), 0, () => alpha(k, () => { glow(0, 0, 320, M.gold, 0.4); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -135, -135, 270, 270); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.strokeStyle = M.gold2; ctx.lineWidth = 7; ctx.stroke(); }));
  bigText('Follow Awazzzz', W / 2, 900, 104, '#FFFFFF', seg(t, 0.1, 0.4));
  bigText('MINDSET', W / 2, 1030, 66, M.gold2, seg(t, 0.3, 0.6), 'Oswald', 700);
  alpha(seg(t, 0.5, 0.8), () => txt('catch it early', W / 2, 1120, 50, M.parch, 'CrimsonText', 600));
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
  GT = LINES.n5.start + 1.0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  const _b = bigText, _c = chipAt; bigText = () => {}; chipAt = () => {}; DRAW.sc5(GT - S('sc5').start, S('sc5').dur); bigText = _b; chipAt = _c; ctx.filter = 'none';
  vign(0.5);
  withT(W / 2, 300, 1, 0, () => { ctx.font = '700 54px Oswald'; const s = 'MACHIAVELLI'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -44, w, 88, 44), 'rgba(110,14,14,0.92)', M.gold2, 4); txt(s, 0, 3, 54, '#FFF3D6', 'Oswald', 700); });
  bigText('CATCH IT', W / 2, 480, 140, '#FFFFFF', 1);
  bigText('EARLY', W / 2, 640, 150, M.gold2, 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
  bigText('The Prince · Ch. 3', W / 2, 790, 64, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
