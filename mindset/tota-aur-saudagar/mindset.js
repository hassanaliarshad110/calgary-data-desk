// ===== Awazzzz Mindset — "The Parrot Who Escaped" (Masnavi, Book I, Story VII) — vertical 1080x1920, dark cinematic 2.5D
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
const KEY = { n2: ['rumi'], n3: ['india', 'caged', 'wild', 'locked'], q1: ['does'], n4: ['drops', 'thrown', 'branch', 'alive'], q2: ['wild'], n5: ['rumi', 'voice', 'caged'], n6: ['praise', 'cage'], n7: ['top', 'wrong', 'joker', 'hurt'], n8: ['freedom', 'dropping', 'performance'], n9: ['today', 'nobody', 'clap', 'grow'], n10: ['praised', 'word', 'comments'], n11: ['awazzzz'] };
const NOCAP = { q1: 2, q2: 3 }; // from word index n onwards the quote card carries the words
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
  const k = 1 - seg(T, 3.2, 3.7); if (k > 0) alpha(k, () => { ctx.font = '700 30px Oswald'; const s = "RUMI'S VOICE"; const w = ctx.measureText(s).width + 36; P(rr(132, 98, w, 42, 21), 'rgba(10,6,8,0.7)', M.gold, 2); txt(s, 132 + w / 2, 120, 30, M.gold2, 'Oswald', 700); });
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
// ===== Awazzzz Mindset — "The Parrot Who Escaped" — Rumi, Masnavi Book I, Story VII (tr. Whinfield) — morning, dawn light
// New set for this episode: dawn courtyard arcade with a hanging golden cage, the parrot (colour + silhouette), the banyan of
// wild parrots at sunrise, song-waves that turn into bars, applause stage, split student/joker, the sapling at the window.
const T_ = { sky0: '#071233', sky1: '#2A2350', sky2: '#9A4A5A', sky3: '#F08A4E', sun: '#FFE3A0', gold: '#F6D27A', gold2: '#C9962E',
  green: '#2FB35E', green2: '#1D7A3E', lime: '#B8E05A', beak: '#D8452E', teal: '#3FA7A8', body: '#05060C', stone: '#140F1C' };
function essenceTag(k, s = 'in essence · Masnavi, Book I, vv. 1830–32') { if (k <= 0) return; alpha(k, () => { ctx.font = 'italic 600 40px CrimsonText'; const w = ctx.measureText(s).width + 50; P(rr(W / 2 - w / 2, 262, w, 64, 32), 'rgba(4,8,16,0.72)', 'rgba(63,167,168,0.8)', 2); txt(s, W / 2, 296, 40, '#DDE8F4', 'CrimsonText', 600); }); }
function wt(id, s) { const w = LINES[id].words; const i = w.findIndex(x => x[2].toLowerCase().replace(/[^a-z']/g, '').startsWith(s)); return i < 0 ? 0 : w[i][0]; }

// ---------- dawn sky: gradient, sun with slow rays, thin clouds, last stars
function dawnSky(t, o = {}) {
  const sx = o.sx ?? 720, sy = o.sy ?? 1050, k = o.k ?? 1;
  const g = ctx.createLinearGradient(0, 0, 0, sy + 200); g.addColorStop(0, T_.sky0); g.addColorStop(0.45, T_.sky1); g.addColorStop(0.78, T_.sky2); g.addColorStop(1, T_.sky3);
  ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, H + 800);
  alpha(0.7, () => { for (let i = 0; i < 70; i++) { const x = rnd(i * 3 + 5) * W, y = rnd(i * 7 + 2) * sy * 0.45; const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2 + i)); ctx.fillStyle = `rgba(255,240,220,${0.5 * tw * (1 - y / (sy * 0.5))})`; ctx.fillRect(x, y, 2.4, 2.4); } });
  glow(sx, sy, 900 * k, '#FF9A5A', 0.35); glow(sx, sy, 420 * k, '#FFD48A', 0.55);
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * 0.03); for (let i = 0; i < 18; i++) { ctx.rotate(Math.PI / 9); const a = 0.05 + 0.03 * Math.sin(t * 0.8 + i * 1.7); ctx.fillStyle = `rgba(255,220,150,${a * k})`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1500, -60); ctx.lineTo(1500, 60); ctx.closePath(); ctx.fill(); } ctx.restore();
  P(circ(sx, sy, 110 * (o.sr ?? 1)), T_.sun, null); glow(sx, sy, 180, '#FFF4D0', 0.6);
  alpha(0.55, () => { for (let i = 0; i < 6; i++) { const y = sy - 380 + i * 70 + rnd(i) * 30, x = ((i * 260 + t * (12 + i * 3)) % (W + 700)) - 350; P(ell(x, y, 260 + rnd(i + 4) * 160, 14 + rnd(i) * 8), i % 2 ? 'rgba(255,170,130,0.45)' : 'rgba(150,110,170,0.5)', null); } });
}

// ---------- the parrot (rose-ringed, stylised). feet at (0,0) on a perch, facing right. o.f flip, o.pose perch|fly|lie, o.flap, o.sil
function parrot(x, y, s, t, o = {}) {
  const f = o.f || 1, pose = o.pose || 'perch', sil = o.sil, rim = o.rim || 'rgba(255,214,150,0.9)';
  const cB = sil ? T_.body : T_.green, cB2 = sil ? T_.body : T_.green2, cC = sil ? T_.body : T_.lime, cK = sil ? T_.body : T_.beak;
  withT(x, y, s, o.rot || 0, () => { ctx.scale(f, 1);
    const bob = pose === 'perch' ? Math.sin(t * 2.2) * 3 : 0;
    // tail
    const tail = new Path2D(); if (pose === 'fly') { tail.moveTo(-40, -80); tail.quadraticCurveTo(-140, -70, -230, -40); tail.quadraticCurveTo(-140, -50, -40, -60); }
    else { tail.moveTo(-14, -30); tail.quadraticCurveTo(-40, 60, -70, 170); tail.quadraticCurveTo(-28, 70, 10, -26); }
    tail.closePath(); P(tail, cB2, null);
    // body
    const by = pose === 'fly' ? -70 : -78 + bob; const br = pose === 'fly' ? -1.35 : -0.35;
    const body = new Path2D(); body.ellipse(0, by, 40, 66, br, 0, 6.283); P(body, cB, null);
    if (!sil) { ctx.save(); ctx.clip(body); P(ell(16, by + 18, 24, 46, br), cC, null); ctx.restore(); }
    // head
    const hx = pose === 'fly' ? 66 : 20, hy = pose === 'fly' ? -88 : -146 + bob;
    P(circ(hx, hy, 30), cB, null);
    if (!sil) { ctx.save(); ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(hx - 4, hy + 4, 27, 0.6, 2.2); ctx.stroke(); ctx.strokeStyle = '#E86A8A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx - 4, hy + 4, 31, 0.5, 2.0); ctx.stroke(); ctx.restore();
      P(circ(hx + 10, hy - 6, 5.5), '#0A0A0A', null); P(circ(hx + 12, hy - 8, 1.8), '#FFF', null); }
    const bk = new Path2D(); bk.moveTo(hx + 22, hy - 14); bk.quadraticCurveTo(hx + 56, hy - 10, hx + 48, hy + 18); bk.quadraticCurveTo(hx + 38, hy + 4, hx + 24, hy + 6); bk.closePath(); P(bk, cK, null);
    // wing
    if (pose === 'fly') { const fl = Math.sin(o.flap ?? t * 14); withT(0, -84, 1, 0, () => { const wg = new Path2D(); wg.moveTo(-30, 0); wg.quadraticCurveTo(-10, -150 * fl, 70, -170 * fl); wg.quadraticCurveTo(30, -60 * fl, 40, 0); wg.closePath(); P(wg, cB2, null); if (!sil) alpha(0.6, () => { ctx.strokeStyle = '#0F4A26'; ctx.lineWidth = 3; ctx.stroke(wg); }); }); }
    else { const wg = new Path2D(); wg.ellipse(-8, by + 6, 28, 58, br + 0.15, 0, 6.283); P(wg, cB2, null); if (!sil) alpha(0.5, () => { for (let i = 0; i < 4; i++) line(-20 + i * 6, by + 20 + i * 10, -30 + i * 6, by + 56, '#0F4A26', 3); }); }
    // feet
    if (pose === 'perch') { P(rr(-6, -16, 9, 18, 3), sil ? T_.body : '#7A6A5A', null); P(rr(10, -16, 9, 18, 3), sil ? T_.body : '#7A6A5A', null); }
    // rim light
    if (sil || o.rimA) { ctx.save(); ctx.globalAlpha = o.rimA ?? 0.85; ctx.strokeStyle = rim; ctx.lineWidth = 4; ctx.translate(3, -2); ctx.beginPath(); ctx.ellipse(0, by, 40, 66, br, -1.9, 0.4); ctx.stroke(); ctx.beginPath(); ctx.arc(hx, hy, 30, -1.6, 0.8); ctx.stroke(); ctx.restore(); }
  });
}
// a falling feather
function feather(x, y, s, rot, col = T_.green) { withT(x, y, s, rot, () => { const p = new Path2D(); p.moveTo(0, -40); p.quadraticCurveTo(16, -10, 0, 40); p.quadraticCurveTo(-16, -10, 0, -40); P(p, col, null); line(0, -40, 0, 46, 'rgba(255,240,200,0.6)', 2); }); }

// ---------- ornate hanging cage: base centre at (0,0), top ring at y=-560*s. o.door 0..1 open, o.glow
function cage(x, y, s, t, o = {}) {
  withT(x, y, s, Math.sin(t * 0.7) * 0.012, () => {
    const R0 = 210, top = -470, door = o.door || 0;
    const gg = ctx.createLinearGradient(-R0, 0, R0, 0); gg.addColorStop(0, '#6A4A14'); gg.addColorStop(0.45, '#F2CF7A'); gg.addColorStop(0.6, '#C9962E'); gg.addColorStop(1, '#5A3A10');
    if (o.glow) glow(0, -220, 420, '#FFC861', 0.25 * o.glow);
    line(0, top - 70, 0, top - (o.chain ?? 900), '#2A1A0A', 6);
    P(circ(0, top - 50, 22), null, '#C9962E', 7);
    // back bars (dim)
    for (let i = 0; i < 14; i++) { const a = Math.PI + i * Math.PI / 13; const bx = Math.cos(a) * R0; ctx.strokeStyle = 'rgba(120,90,40,0.55)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bx, Math.sin(a) * 36); ctx.lineTo(bx * 0.98, -300); ctx.quadraticCurveTo(bx * 0.8, top + 30, 0, top); ctx.stroke(); }
    // swing ring + inside
    ctx.strokeStyle = '#C9962E'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-70, -360); ctx.lineTo(-70, -200); ctx.moveTo(70, -360); ctx.lineTo(70, -200); ctx.stroke(); P(rr(-80, -206, 160, 12, 6), '#C9962E', null);
    if (o.inside) o.inside();
    // base
    P(ell(0, 0, R0 + 14, 40), '#3A2410', null); P(ell(0, -8, R0 + 6, 34), gg, null); P(rr(-R0 - 10, -10, 2 * R0 + 20, 30, 10), gg, null);
    // front bars
    for (let i = 0; i < 14; i++) { const a = i * Math.PI / 13; const bx = Math.cos(a) * R0; const inDoor = Math.abs(bx) < 66;
      if (inDoor && door > 0) continue;
      ctx.strokeStyle = gg; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(bx, Math.sin(a) * 36); ctx.lineTo(bx * 0.98, -300); ctx.quadraticCurveTo(bx * 0.8, top + 30, 0, top); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,240,190,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 2, Math.sin(a) * 36 - 10); ctx.lineTo(bx * 0.98 - 2, -300); ctx.stroke(); }
    // rings
    [-120, -300].forEach(yy => { ctx.strokeStyle = gg; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(0, yy, R0 * 0.99, 32, 0, 0.05, Math.PI - 0.05); ctx.stroke(); });
    P(ell(0, top, 26, 12), gg, null);
    // door (swings open towards the viewer-left)
    if (door > 0) { const c = Math.cos(door * 1.9); withT(-66, 0, 1, 0, () => { ctx.scale(c, 1); ctx.strokeStyle = gg; ctx.lineWidth = 7; for (let k = 0; k < 4; k++) { const dx = k * 44; ctx.beginPath(); ctx.moveTo(dx, 30); ctx.lineTo(dx, -250); ctx.stroke(); } ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, -250); ctx.lineTo(132, -250); ctx.moveTo(0, -120); ctx.lineTo(132, -120); ctx.stroke(); }); }
    else { ctx.strokeStyle = gg; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-66, -250); ctx.lineTo(66, -250); ctx.stroke(); P(circ(40, -150, 9), '#F2CF7A', '#5A3A10', 2); }
  });
}

// ---------- dawn courtyard arcade (stone arches framing the sky), floor, plants. o.mid layers
function courtyard(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.07, 24);
  layers([
    { z: 0.02, draw: () => dawnSky(t, { sx: o.sx ?? 760, sy: o.sy ?? 1120 }) },
    { z: 0.12, haze: 0.04, draw: () => { // distant rooftops & trees
      ctx.fillStyle = '#2A1A30'; ctx.beginPath(); ctx.moveTo(-300, 1260); for (let x = -300; x <= W + 300; x += 60) ctx.lineTo(x, 1180 - (rnd(x) > 0.6 ? 60 + rnd(x + 1) * 80 : 20)); ctx.lineTo(W + 300, 1400); ctx.lineTo(-300, 1400); ctx.fill();
      for (let i = 0; i < 7; i++) { const x = -100 + i * 200; P(ell(x, 1170, 90, 70), '#22142A', null); } } },
    { z: 0.25, draw: () => { // arcade: stone wall with two big arches
      const a = new Path2D(); a.rect(-400, -400, W + 800, H + 800);
      [[-150, 380], [540, 560], [1230, 380]].forEach(([cx, hw]) => { a.moveTo(cx - hw, 1500); a.lineTo(cx - hw, 760); a.quadraticCurveTo(cx - hw, 330, cx, 300); a.quadraticCurveTo(cx + hw, 330, cx + hw, 760); a.lineTo(cx + hw, 1500); a.closePath(); });
      ctx.fillStyle = T_.stone; ctx.fill(a, 'evenodd');
      ctx.strokeStyle = 'rgba(255,190,130,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); const cx = 540, hw = 560; ctx.moveTo(cx - hw, 1500); ctx.lineTo(cx - hw, 760); ctx.quadraticCurveTo(cx - hw, 330, cx, 300); ctx.quadraticCurveTo(cx + hw, 330, cx + hw, 760); ctx.lineTo(cx + hw, 1500); ctx.stroke();
      alpha(0.2, () => { for (let r = 0; r < 6; r++) line(-400, 120 + r * 40, W + 400, 120 + r * 40, 'rgba(255,200,150,0.25)', 2); });
      P(poly([-400, 1500, W + 400, 1500, W + 700, 2300, -700, 2300]), grad(1500, 2100, '#2A1A22', '#07050A'), null); // floor
      ctx.save(); ctx.strokeStyle = 'rgba(255,180,120,0.12)'; ctx.lineWidth = 3; for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 70, 1500); ctx.lineTo(W / 2 + i * 260, 2200); ctx.stroke(); } for (let j = 0; j < 6; j++) { const y = 1500 + j * j * 22; line(-400, y, W + 400, y, 'rgba(255,180,120,0.1)', 2); } ctx.restore();
      alpha(0.5, () => P(ell(o.sx ?? 760, 1560, 500, 70), 'rgba(255,170,100,0.25)', null));
    } },
    ...(o.mid || []),
    { z: 1.12, blur: 7, draw: () => { // foreground plants
      [[60, 2000, 1], [1030, 2010, -1]].forEach(([x, y, f], j) => { for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + f * (i - 3) * 0.28 + Math.sin(t * 0.9 + i) * 0.03; const L = 360 + rnd(i + j * 9) * 200; const lf = new Path2D(); lf.moveTo(x, y); lf.quadraticCurveTo(x + Math.cos(a - 0.2) * L * 0.6, y + Math.sin(a - 0.2) * L * 0.6, x + Math.cos(a) * L, y + Math.sin(a) * L); lf.quadraticCurveTo(x + Math.cos(a + 0.2) * L * 0.6, y + Math.sin(a + 0.2) * L * 0.6, x, y); P(lf, '#06080A', null); } }); } },
  ], cam);
  dust(t, 45, [150, 500, 800, 1000], '255,214,160', o.seed || 3);
}

function leafBranch(x0, y0, x1, y1, t, w = 24, n = 14, seed = 1) {
  const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 60;
  ctx.strokeStyle = T_.body; ctx.lineCap = 'round'; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,190,130,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0 - w / 2); ctx.quadraticCurveTo(mx, my - w / 2, x1, y1 - w / 2); ctx.stroke();
  for (let i = 0; i < n; i++) { const u = 0.15 + 0.85 * rnd(i + seed * 7); const bx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1, by = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1;
    const a = (rnd(i * 3 + seed) - 0.5) * 2.4 - Math.PI / 2 + Math.sin(t * 1.2 + i) * 0.05, L = 50 + rnd(i * 5 + seed) * 40;
    withT(bx, by, 1, a, () => { const lf = new Path2D(); lf.moveTo(0, 0); lf.quadraticCurveTo(L * 0.5, -L * 0.28, L, 0); lf.quadraticCurveTo(L * 0.5, L * 0.28, 0, 0); P(lf, '#0A1410', null); alpha(0.5, () => { ctx.strokeStyle = 'rgba(255,200,140,0.6)'; ctx.lineWidth = 2; ctx.stroke(lf); }); }); }
}
// ---------- banyan of wild parrots at sunrise
const PERCH = [[250, 1000, 0.85, 1], [520, 990, 0.8, -1], [800, 1040, 0.85, -1], [380, 1180, 0.9, 1], [680, 1200, 0.9, -1], [150, 1240, 0.8, 1], [900, 1270, 0.8, -1]];
function banyan(t, fallI = -1, fallK = 0, fl = 0) {
  // trunk + aerial roots
  P(poly([470, 1900, 520, 1300, 560, 1300, 640, 1900]), T_.body, null);
  for (let i = 0; i < 5; i++) { const x = 180 + i * 180 + rnd(i) * 40; line(x, 1050 + rnd(i + 3) * 150, x + 6, 1560, 'rgba(5,6,12,0.85)', 3 + rnd(i) * 2); }
  P(rr(-300, 1540, W + 600, 900, 0), grad(1540, 2000, '#0C0810', '#030205'), null);
  ctx.strokeStyle = T_.body; ctx.lineCap = 'round';
  [[540, 1350, 200, 960, 26], [540, 1350, 880, 1040, 26], [540, 1300, 330, 780, 18], [540, 1300, 780, 820, 18], [540, 1300, 520, 700, 16], [400, 1050, 120, 1120, 14], [700, 1080, 980, 1170, 14]].forEach(([a, b, c, dd, w]) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c) / 2, Math.min(b, dd) - 80, c, dd); ctx.stroke(); });
  for (let i = 0; i < 40; i++) { const x = 40 + rnd(i * 3) * 1000, y = 540 + rnd(i * 5) * 420; const rx = 80 + rnd(i) * 70, ry = 46 + rnd(i + 1) * 30; P(ell(x, y + Math.sin(t + i) * 3, rx, ry), '#070A0C', null); alpha(0.35, () => { ctx.strokeStyle = 'rgba(255,190,130,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y + Math.sin(t + i) * 3, rx, ry, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }); }
  // perches
  PERCH.forEach(([x, y, s, f], i) => { line(x - 70, y, x + 70, y + 6, T_.body, 10);
    if (i === fallI && fallK > 0) { const k = easeIn(fallK); parrot(x + 30 * k, y + k * 500, s, t, { sil: 1, f, rot: f * k * 2.6, rimA: 0.8, pose: 'perch' }); for (let j = 0; j < 3; j++) if (k > 0.05) feather(x + j * 30, y + k * 300 + j * 40, 0.6, k * 5 + j, T_.body); }
    else parrot(x, y, s, t + i, { sil: 1, f, rimA: 0.55 }); });
}

// ---------- stage with applause
function clapHands(x, y, s, t, ph) { const c = Math.abs(Math.sin(t * 9 + ph)); withT(x, y, s, 0, () => { [-1, 1].forEach(sd => withT(sd * (18 + 26 * c), 0, 1, sd * (0.25 + 0.15 * c), () => { P(rr(-28, -110, 56, 150, 26), T_.body, null); ctx.save(); ctx.globalAlpha = 0.6; ctx.strokeStyle = 'rgba(255,214,150,0.7)'; ctx.lineWidth = 3; ctx.stroke(rr(-28, -110, 56, 150, 26)); ctx.restore(); line(0, 40, 0, 260, T_.body, 46); })); }); }
function goldBars(cx, cy, hw, h, k, t, n = 9) { if (k <= 0) return; for (let i = 0; i < n; i++) { const x = cx - hw + i * (2 * hw / (n - 1)); const kk = easeOut(clamp(k * 1.6 - i * 0.06)); if (kk <= 0) continue; const y1 = cy - h, y2 = lerp(cy - h, cy, kk); ctx.save(); ctx.shadowColor = '#FFC861'; ctx.shadowBlur = 24; ctx.strokeStyle = `rgba(246,210,122,${0.9 * kk})`; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke(); ctx.restore(); }
  alpha(k, () => { ctx.save(); ctx.strokeStyle = 'rgba(246,210,122,0.9)'; ctx.lineWidth = 12; ctx.beginPath(); ctx.ellipse(cx, cy - h, hw, 40, 0, 0, 6.283); ctx.stroke(); ctx.restore(); }); }
function stage(t, d, o = {}) {
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#0B0718', '#020104')); glow(W / 2, 1300, 700, '#5A2A4A', 0.3); } },
    { z: 0.15, draw: () => { // curtains
      for (let i = 0; i < 6; i++) { const x = i * 60 - 40; P(rr(x, -100, 70, 2000, 30), i % 2 ? '#3A0E1A' : '#4A1222', null); P(rr(W - x - 70, -100, 70, 2000, 30), i % 2 ? '#3A0E1A' : '#4A1222', null); }
      P(rr(-100, -100, W + 200, 230, 0), '#3A0E1A', null); for (let i = 0; i < 14; i++) P(ell(-40 + i * 85, 130, 50, 30), '#4A1222', null); } },
    { z: 0.3, draw: () => { beam(W / 2, -60, 60, W / 2, 1500, 420, '255,226,170', 0.22); P(ell(W / 2, 1500, 420, 70), 'rgba(255,226,170,0.28)', null); P(rr(-100, 1500, W + 200, 600, 0), grad(1500, 1900, '#1A0E10', '#050305'), null); } },
    ...(o.mid || []),
    { z: 0.95, draw: () => { for (let i = 0; i < 6; i++) clapHands(80 + i * 185, 1880 + (i % 2) * 40, 1.0, t, i * 1.3); } },
  ], o.cam || camAt(t, d, 1, 1.06, 10));
  dust(t, 40, [300, 300, 480, 1200], '255,226,170', 9);
}

// ================= SCENES =================
DRAW.sc1 = (t, d) => { // HOOK: open golden cage at dawn, parrot bursting out towards the sun
  const u = lt('h1'); const tE = wt('h1', 'escaped'), tW = wt('h1', 'without');
  const kF = seg(u, -0.2, 2.6);
  courtyard(t, d, { cam: { zoom: lerp(1.14, 1.04, ease(t / d)), px: lerp(30, -10, ease(t / d)), py: 0 }, sx: 820, sy: 1000, mid: [
    { z: 0.5, draw: () => { cage(470, 1420, 1.25, t, { door: 1, glow: 1, chain: 900 });
      for (let i = 0; i < 6; i++) { const fk = seg(u, 0.1 + i * 0.1, 3.5); if (fk <= 0) continue; feather(420 + i * 30 + fk * 120 * (i % 2 ? 1 : -0.4), 1180 + fk * 380 + i * 12, 0.8, fk * 4 + i, i % 2 ? T_.green : T_.lime); }
      const fx = lerp(470, 900, easeOut(kF)), fy = lerp(1150, 620, easeOut(kF)); parrot(fx, fy, lerp(0.9, 1.25, kF), t, { pose: 'fly', flap: t * 15, rot: -0.35, rimA: 0.7 });
    } },
  ] });
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0, 0, W, H);
  bigText('ESCAPED.', W / 2, 420, 120, '#FFFFFF', seg(u, tE - 0.15, tE + 0.15));
  bigText('NO BARS BROKEN.', W / 2, 560, 92, T_.gold, seg(u, tW - 0.1, tW + 0.2));
  flash(u - tW, '255,240,200', 0.2, 0.2);
};
DRAW.sc2 = (t, d) => { // Rumi tells how — the Masnavi open on a cushion, a ney beside it, first light
  layers([
    { z: 0.02, draw: () => { dawnSky(t, { sx: 540, sy: 900 }); } },
    { z: 0.2, draw: () => { const a = new Path2D(); a.rect(-300, -300, W + 600, H + 600); a.moveTo(200, 1250); a.lineTo(200, 600); a.quadraticCurveTo(200, 300, W / 2, 270); a.quadraticCurveTo(W - 200, 300, W - 200, 600); a.lineTo(W - 200, 1250); a.closePath(); ctx.fillStyle = '#0C0812'; ctx.fill(a, 'evenodd'); ctx.fillRect(-300, 1250, W + 600, 900); } },
    { z: 0.5, draw: () => { withT(W / 2, 1500, 1.5, 0, () => { P(rr(-280, -40, 560, 90, 40), '#3A1E2A', null); glow(0, -60, 320, '#FFC861', 0.45);
      P(poly([-230, -40, 0, -10, 0, -150, -210, -170]), '#EADBB8', null); P(poly([0, -10, 230, -40, 210, -170, 0, -150]), '#DCC79A', null);
      for (let i = 0; i < 6; i++) { line(-190, -150 + i * 17, -30, -130 + i * 17, 'rgba(60,40,20,0.45)', 3); }
      withT(110, -95, 0.32, 0, () => parrot(0, 40, 1, t, { sil: 1, rimA: 0 })); // ink sketch of the parrot on the page
      ney(40, 10, 360, -0.08, 0.9, 0.2, 1); }); candleM(860, 1470, t, 1.0, 100); } },
  ], { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0 });
  chipTop('MASNAVI · BOOK I', 330, M.gold);
};
DRAW.sc3 = (t, d) => { // A merchant heads to India; the caged parrot sends a message
  const u = lt('n3'); const tI = wt('n3', 'india'), tS = wt('n3', 'says'), tL = wt('n3', 'locked');
  const kMsg = seg(u, tS, tL + 0.6);
  courtyard(t, d, { cam: { zoom: lerp(1.02, 1.1, ease(t / d)), px: lerp(-20, 20, ease(t / d)), py: 0 }, sx: 860, sy: 1080, mid: [
    { z: 0.45, draw: () => { cage(700, 1230, 0.85, t, { chain: 900, glow: 0.6 + 0.4 * seg(u, tS - 0.2, tS + 0.3), inside: () => parrot(0, -206, 1.1, t, { f: -1, rimA: 0.35 * seg(u, tS - 0.2, tS + 0.3) }) }); } },
    { z: 0.6, draw: () => { withT(190, 1420, 1.35, 0, () => { P(ell(0, 0, 55, 75), '#0C080C', null); alpha(0.6, () => { ctx.strokeStyle = 'rgba(255,190,130,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 55, 75, 0, Math.PI, Math.PI * 1.6); ctx.stroke(); }); });
      person(270, 1800, 1.35, { col: '#07050A', rim: 'rgba(255,190,130,0.9)', rimA: 0.85 });
      if (kMsg > 0 && kMsg < 1) { const k = easeOut(kMsg); const x = lerp(640, 330, k), y = lerp(1000, 1180, k) - Math.sin(k * Math.PI) * 160; glow(x, y, 90, '#FFC861', 0.6); withT(x, y, 1, k * 0.6, () => { P(rr(-34, -14, 68, 28, 12), '#EADBB8', '#8A6A2A', 3); }); }
      if (kMsg >= 1) glow(330, 1180, 80 + 10 * Math.sin(t * 5), '#FFC861', 0.45);
    } },
  ] });
  alpha(seg(u, tI - 0.3, tI), () => chipTop('→ INDIA', 330, T_.gold));
};
DRAW.sc4 = (t, d) => { // QUOTE CARD 1 — sunrise banyan, a wild parrot falls
  const u = lt('q1'); const tF = wt('q1', 'fell');
  layers([
    { z: 0.02, draw: () => dawnSky(t, { sx: 540, sy: 1180, sr: 1.2 }) },
    { z: 0.15, haze: 0.05, draw: () => { for (let i = 0; i < 9; i++) P(ell(i * 140 - 40, 1420, 140, 110), '#1A1024', null); P(rr(-300, 1420, W + 600, 900, 0), grad(1420, 1900, '#1A1024', '#07050A'), null); } },
    { z: 0.4, draw: () => withT(0, 300, 1, 0, () => banyan(t, 3, seg(u, tF - 0.05, tF + 0.9), 0)) },
    { z: 0.7, draw: () => { person(150, 1960, 0.8, { col: '#05060C', rim: 'rgba(255,190,130,0.9)', rimA: 0.8 }); } },
  ], { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0, cy: 1300 });
  quoteCard('q1', 2, 'On hearing it one of them at once fell down dead.', '— Masnavi, Book I, Story VII (tr. E. H. Whinfield)', ['fell', 'dead'], { cy: 520, size: 64 });
};
DRAW.sc5 = (t, d) => { // Back home: the parrot drops; thrown out; flies to a branch — ALIVE
  const u = lt('n4'); const tH = wt('n4', 'hears'), tD = wt('n4', 'drops'), tT = wt('n4', 'thrown'), tFl = wt('n4', 'flies'), tA = wt('n4', 'alive');
  const kD = seg(u, tD - 0.15, tD + 0.25), kT = seg(u, tT - 0.1, tT + 0.7), kFl = seg(u, tFl - 0.1, tA - 0.1), kA = seg(u, tA - 0.15, tA + 0.2);
  courtyard(t, d, { cam: { zoom: lerp(1.18, 1.05, ease(seg(u, tT - 0.3, tA))), px: lerp(30, -20, ease(seg(u, tT - 0.3, tA))), py: 0 }, sx: 820, sy: 900, mid: [
    { z: 0.3, draw: () => { // high branch, top right
      leafBranch(1300, 600, 700, 715, t, 26, 22, 3); } },
    { z: 0.5, draw: () => {
      const inside = kT <= 0 ? () => { if (kD < 1) parrot(0, -206, 1.1, t, { f: -1, rot: -kD * 1.4 }); else parrot(-10, -40, 1.1, t, { f: -1, rot: -1.5 }); } : null;
      cage(460, 1500, 1.1, t, { door: seg(u, tT - 0.3, tT), chain: 900, glow: 0.5, inside });
      if (kT > 0 && kFl <= 0) { const k = easeOut(kT); parrot(lerp(440, 300, k), lerp(1460, 1330, k) - Math.sin(k * Math.PI) * 140, 1.1, t, { f: -1, rot: -1.5 - k * 2.5 }); }
      if (kFl > 0) { const k = easeOut(kFl); const x = lerp(300, 820, k), y = lerp(1330, 690, k) - Math.sin(k * Math.PI) * 120; if (k < 0.97) parrot(x, y, 1.1, t, { pose: 'fly', flap: t * 16, rot: -0.4 * (1 - k) }); else parrot(820, 690, 1.1, t, { rimA: kA }); }
      if (kD > 0 && kD < 1) for (let i = 0; i < 3; i++) feather(450 + i * 30, 1300 + kD * 100 + i * 20, 0.7, kD * 3 + i, T_.lime);
    } },
  ] });
  if (kA > 0) { glow(820, 690, 300, '#FFE3A0', 0.5 * kA); flash(u - tA, '255,240,200', 0.25, 0.3); }
  bigText('ALIVE.', W / 2, 430, 130, T_.gold, kA);
};
DRAW.sc6 = (t, d) => { // QUOTE CARD 2 — the free parrot on the branch against the sun, merchant below, empty cage
  layers([
    { z: 0.02, draw: () => dawnSky(t, { sx: 760, sy: 1080, sr: 1.1 }) },
    { z: 0.2, haze: 0.04, draw: () => { ctx.fillStyle = '#1C1226'; ctx.beginPath(); ctx.moveTo(-300, 1500); for (let x = -300; x <= W + 300; x += 40) ctx.lineTo(x, 1420 - 40 * Math.sin(x * 0.006) - 30 * rnd(x)); ctx.lineTo(W + 300, 2200); ctx.lineTo(-300, 2200); ctx.fill(); } },
    { z: 0.45, draw: () => { leafBranch(1300, 1020, 640, 1160, t, 30, 26, 5); leafBranch(1000, 1110, 820, 960, t, 12, 8, 9);
      parrot(720, 1150, 1.3, t, { sil: 1, f: -1, rimA: 0.95, rim: 'rgba(255,226,160,1)' }); } },
    { z: 0.65, draw: () => { P(rr(-200, 1640, W + 400, 600, 0), grad(1640, 2000, '#0E0A12', '#030205'), null); person(330, 1900, 1.0, { col: '#05060C', rim: 'rgba(255,190,130,0.9)', rimA: 0.85, f: 1 }); cage(720, 1720, 0.5, t, { door: 1, chain: 0 }); } },
  ], { zoom: lerp(1.0, 1.05, ease(t / d)), px: lerp(-10, 10, ease(t / d)), py: 0, cy: 1300 });
  quoteCard('q2', 3, '…had only feigned death to suggest this way of escaping from confinement in a cage.', '— Masnavi, Book I, Story VII (tr. E. H. Whinfield)', ['feigned', 'escaping'], { cy: 560, size: 60 });
};
DRAW.sc7 = (t, d) => { // n5: song waves turn into bars — "your sweet voice keeps you caged" (in essence)
  const u = lt('n5'); const tV = wt('n5', 'voice'), tC = wt('n5', 'caged'), tSw = wt('n5', 'sweet');
  const kBar = seg(u, tV - 0.1, tC + 0.4), kSong = seg(u, 0.2, 0.8);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#071A30', '#020409')); glow(W / 2, 980, 760, '#1E6F78', 0.35); starsT(t, 90, 900, 21); } },
    { z: 0.4, draw: () => { ctx.strokeStyle = T_.body; ctx.lineCap = 'round'; ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(-100, 1250); ctx.quadraticCurveTo(400, 1180, 900, 1230); ctx.stroke();
      parrot(470, 1215, 1.9, t, { rimA: 0.6, rim: 'rgba(120,220,220,0.8)' });
      if (kSong > 0) alpha(kSong * (1 - 0.7 * kBar), () => waves(610, 930, t, -0.3, 6, 520, 0.7));
      goldBars(470, 1250, 290, 900, kBar, t, 11);
    } },
  ], { zoom: lerp(1.05, 1.12, ease(t / d)), px: 0, py: 0, cy: 1100 });
  for (let i = 0; i < 5; i++) { const ph = (t * 0.5 + i * 0.2) % 1; alpha(kSong * (1 - kBar) * (1 - ph), () => txt('♪', 680 + ph * 300 + i * 20, 900 - ph * 400 - i * 30, 70, T_.gold, 'Montserrat', 900)); }
  essenceTag(seg(u, 0, 0.3));
  alpha(seg(u, tSw - 0.2, tSw + 0.2), () => bigText('SWEET VOICE', W / 2, 470, 96, '#FFFFFF', 1));
  bigText('= CAGE', W / 2, 590, 96, T_.gold, seg(u, tC - 0.15, tC + 0.15));
};
DRAW.sc8 = (t, d) => { // n6: praise on stage — the bars come down around the star
  const u = lt('n6'); const tP = wt('n6', 'praise'), tC = wt('n6', 'cage');
  stage(t, d, { mid: [
    { z: 0.5, draw: () => { person(W / 2, 1500, 1.5, { col: '#07050A', rim: 'rgba(255,226,170,0.95)', rimA: 0.9 });
      for (let i = 0; i < 9; i++) { const ph = (t * 0.4 + rnd(i)) % 1; alpha(seg(u, tP - 0.3, tP) * (1 - ph), () => txt('★', 300 + rnd(i * 3) * 480, 1000 - ph * 500, 40 + rnd(i) * 30, T_.gold, 'Montserrat', 900)); }
      goldBars(W / 2, 1520, 250, 980, seg(u, tC - 0.9, tC + 0.3), t, 9); } },
  ] });
};
DRAW.sc9 = (t, d) => { // n7: split — top student (A+) and the joker (smiling mask), both behind bar-shadows
  const u = lt('n7'); const tJ = wt('n7', 'joker'), tA = wt('n7', 'answer'), tHu = wt('n7', 'hurt');
  // top half: student at a desk under a barred window
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 950); ctx.clip();
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, 950, '#1C1630', '#08060E')); P(rr(620, 140, 300, 360, 14), grad(140, 500, '#F7C47A', '#E58A4E'), null); for (let i = 0; i < 5; i++) line(650 + i * 60, 140, 650 + i * 60, 500, '#120C18', 12); } },
    { z: 0.3, draw: () => { alpha(0.35, () => { for (let i = 0; i < 5; i++) P(poly([650 + i * 60, 500, 662 + i * 60, 500, 380 + i * 90, 950, 340 + i * 90, 950]), 'rgba(255,190,120,0.35)', null); });
      P(rr(120, 700, 820, 40, 8), '#2A1A10', null); person(420, 860, 1.05, { col: '#05060C', rim: 'rgba(255,190,130,0.9)', rimA: 0.85, sit: 1 });
      withT(640, 670, 1, -0.05, () => { glow(0, 0, 140, '#FFE3A0', 0.4); P(rr(-70, -45, 140, 90, 6), '#F0E2C2', null); txt('A+', 0, 2, 56, '#8E1B1B', 'Oswald', 700); });
      for (let i = 0; i < 6; i++) line(110 + i * 170, 0, 70 + i * 170, 950, 'rgba(0,0,0,0.45)', 26); } },
  ], { zoom: lerp(1.0, 1.05, ease(t / d)), px: 0, py: 0, cy: 500 });
  ctx.restore();
  // bottom half: the joker under a spotlight
  const kJ = seg(u, tJ - 0.3, tJ + 0.1);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 970, W, 950); ctx.clip();
  fullFill('#05030A');
  alpha(kJ, () => { glow(W / 2, 1400, 520, '#5A2A4A', 0.5); beam(W / 2, 970, 40, W / 2, 1900, 360, '255,226,170', 0.2);
    person(W / 2, 1760, 1.4, { col: '#07050A', rim: 'rgba(255,226,170,0.9)', rimA: 0.85 });
    mask(W / 2 - 10, 1170 + Math.sin(t * 2) * 4, 0.95, t);
    alpha(seg(u, tHu - 0.3, tHu + 0.2), () => { P(ell(W / 2 + 34, 1215, 7, 12), 'rgba(150,200,255,0.9)', null); }); // a tear under the mask
    for (let i = 0; i < 6; i++) line(110 + i * 170, 970, 150 + i * 170, 1920, 'rgba(0,0,0,0.45)', 26); });
  ctx.restore();
  P(rr(0, 948, W, 24, 0), '#020104', null); line(0, 960, W, 960, T_.gold, 3);
  alpha(seg(u, tA - 0.2, tA + 0.2), () => goldBars(W / 2, 940, 420, 760, 1, t, 7));
};
DRAW.sc10 = (t, d) => { // n8: the mask drops, the bars lift, light floods in
  const u = lt('n8'); const tDr = wt('n8', 'dropping'), tS = wt('n8', 'smashing');
  const kDrop = seg(u, tDr - 0.1, tDr + 0.7), kLift = seg(u, tDr, tDr + 1.2);
  courtyard(t, d, { cam: { zoom: lerp(1.1, 1.0, ease(t / d)), px: 0, py: 0 }, sx: 540, sy: 1000, mid: [
    { z: 0.5, draw: () => { alpha(1 - 0.6 * kLift, () => { ctx.fillStyle = 'rgba(4,3,8,0.6)'; ctx.fillRect(-300, -300, W + 600, H + 600); });
      person(W / 2, 1650, 1.5, { col: '#07050A', rim: 'rgba(255,226,170,0.95)', rimA: 0.6 + 0.4 * kLift });
      const my = lerp(1015, 1800, easeIn(kDrop)); mask(W / 2 + kDrop * 60, my, 0.95, t);
      withT(0, -kLift * 1400, 1, 0, () => goldBars(W / 2, 1700, 300, 1000, 1, t, 9));
      if (seg(u, tS - 0.1, tS + 0.3) > 0 && kLift <= 0) alpha(seg(u, tS - 0.1, tS + 0.3) * (1 - seg(u, 1.6, 2.0)), () => { txt('✕', W / 2, 600, 220, '#C0392B', 'Montserrat', 900); });
      if (kLift > 0.3) parrot(lerp(-100, 1200, seg(u, tDr + 0.3, d)), 560 - 80 * Math.sin(seg(u, tDr + 0.3, d) * 3), 0.8, t, { pose: 'fly', flap: t * 15, rimA: 0.6 }); } },
  ] });
  if (kLift > 0) alpha(kLift * 0.25, () => glow(W / 2, 900, 900, '#FFE3A0', 0.6));
};
DRAW.sc11 = (t, d) => { // n9: today — one thing nobody claps for; a sapling grows in the morning window
  const u = lt('n9'); const tN = wt('n9', 'nobody'), tG = wt('n9', 'grow');
  const kG = seg(u, 0.4, tG + 0.6);
  layers([
    { z: 0.03, draw: () => { fullFill('#120C18'); P(rr(170, 330, 740, 880, [370, 370, 10, 10]), grad(330, 1210, '#3A3060', '#F4A060'), null); glow(540, 1000, 500, '#FFD48A', 0.5); P(circ(540, 1050, 90), T_.sun, null);
      line(540, 330, 540, 1210, '#120C18', 14); line(170, 760, 910, 760, '#120C18', 14); } },
    { z: 0.35, draw: () => { P(rr(80, 1210, 920, 50, 10), '#2A1A10', null); beam(540, 1100, 200, 540, 1900, 700, '255,214,150', 0.12);
      withT(540, 1210, 1.2, 0, () => { P(poly([-70, 0, 70, 0, 54, -110, -54, -110]), '#8A4A2A', null); P(rr(-80, -130, 160, 28, 8), '#A85A34', null);
        const h = lerp(40, 260, easeOut(kG)); ctx.strokeStyle = '#2FB35E'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -130); ctx.quadraticCurveTo(10 * Math.sin(t), -130 - h / 2, 0, -130 - h); ctx.stroke();
        const nl = Math.floor(1 + kG * 5); for (let i = 0; i < nl; i++) { const y = -150 - i * (h / 5.5), sd = i % 2 ? 1 : -1; const sz = clamp(kG * 6 - i) * 1; withT(0, y, sz, sd * 0.6, () => { const lf = new Path2D(); lf.moveTo(0, 0); lf.quadraticCurveTo(sd * 40, -30, sd * 80, 0); lf.quadraticCurveTo(sd * 40, 20, 0, 0); P(lf, '#3FC46A', null); }); }
        glow(0, -130 - h, 80, '#B8F07A', 0.4 * kG); }); } },
    { z: 0.7, draw: () => { person(170, 1900, 1.2, { col: '#05060C', rim: 'rgba(255,200,140,0.9)', rimA: 0.85, f: 1, sit: 1 }); } },
  ], { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0 });
  alpha(seg(u, 0, 0.3), () => chipTop('TODAY', 300, T_.gold));
  bigText('NO APPLAUSE.', W / 2, 460, 84, '#FFFFFF', seg(u, tN - 0.1, tN + 0.2) * (1 - seg(u, d - 0.3, d)));
  bigText('JUST GROW.', W / 2, 580, 84, T_.gold, seg(u, tG - 0.15, tG + 0.15));
};
DRAW.sc12 = (t, d) => { // n10: what were you praised into? — three small cages: A+, mask, trophy
  const u = lt('n10'); const tP = wt('n10', 'praised'), tC = wt('n10', 'comments');
  courtyard(t, d, { cam: { zoom: lerp(1.04, 1.0, ease(t / d)), px: 0, py: 0 }, sx: 540, sy: 1150, mid: [
    { z: 0.5, draw: () => { ctx.fillStyle = 'rgba(4,3,8,0.35)'; ctx.fillRect(-300, -300, W + 600, H + 600);
      [[220, 'A+'], [540, 'mask'], [860, 'cup']].forEach(([x, k], i) => { const kk = seg(u, 0.2 + i * 0.25, 0.6 + i * 0.25); if (kk <= 0) return;
        cage(x, 1180 + (1 - back(kk)) * 200, 0.55, t + i, { chain: 700, glow: 0.7, inside: () => withT(0, -150, 1.6, 0, () => {
          if (k === 'A+') { P(rr(-50, -34, 100, 68, 6), '#F0E2C2', null); txt('A+', 0, 2, 44, '#8E1B1B', 'Oswald', 700); }
          else if (k === 'mask') mask(0, 0, 0.5, t);
          else { P(poly([-40, -50, 40, -50, 26, 10, -26, 10]), '#F2CF7A', null); P(rr(-10, 10, 20, 26, 4), '#C9962E', null); P(rr(-32, 34, 64, 14, 4), '#C9962E', null); } }) }); });
    } },
  ] });
  bigText('WHAT WERE YOU', W / 2, 430, 92, '#FFFFFF', seg(u, -0.1, 0.15));
  bigText('PRAISED INTO?', W / 2, 550, 100, T_.gold, seg(u, tP - 0.15, tP + 0.15));
  const kc = back(seg(u, tC - 0.3, tC + 0.1)); if (kc > 0) withT(W / 2, 720, kc, 0, () => { const b = new Path2D(); b.roundRect(-150, -70, 300, 130, 30); b.moveTo(-40, 60); b.lineTo(-70, 105); b.lineTo(0, 60); P(b, '#F6F2E8', '#111', 4); txt('1 word', 0, -4, 54, '#14100A', 'Montserrat', 900); });
};
DRAW.sc13 = (t, d) => { // end card: the parrot crosses the full sunrise — Follow Awazzzz · Mindset
  layers([
    { z: 0.02, draw: () => dawnSky(t, { sx: 540, sy: 1300, sr: 1.4, k: 1.3 }) },
    { z: 0.3, draw: () => { ctx.fillStyle = '#140C1A'; ctx.beginPath(); ctx.moveTo(-300, 1500); for (let x = -300; x <= W + 300; x += 40) ctx.lineTo(x, 1450 - 50 * Math.sin(x * 0.005 + 1) - 20 * rnd(x)); ctx.lineTo(W + 300, 2200); ctx.lineTo(-300, 2200); ctx.fill(); } },
    { z: 0.5, draw: () => parrot(lerp(-150, 1250, t / d), 1480 - 200 * Math.sin(t / d * 3), 1.0, t, { pose: 'fly', flap: t * 14, sil: 1, rimA: 0.9 }) },
  ], { zoom: 1.0, px: 0, py: 0 });
  ctx.fillStyle = 'rgba(5,3,6,0.5)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0, 0.4)); const L = document.getElementById('logo');
  withT(W / 2, 600, lerp(0.8, 1, k), 0, () => alpha(k, () => { glow(0, 0, 320, M.gold, 0.4); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -135, -135, 270, 270); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.strokeStyle = M.gold; ctx.lineWidth = 6; ctx.stroke(); }));
  bigText('Follow Awazzzz', W / 2, 860, 104, '#FFFFFF', seg(t, 0.1, 0.4));
  bigText('MINDSET', W / 2, 990, 66, M.gold2, seg(t, 0.3, 0.6), 'Oswald', 700);
  alpha(seg(t, 0.5, 0.8), () => txt('Machiavelli · Rumi · daily', W / 2, 1080, 44, M.parch, 'CrimsonText', 600));
  const pulse = 1 + 0.04 * Math.sin(t * 6); withT(W / 2, 1200, back(seg(t, 0.6, 0.9)) * pulse, 0, () => { P(rr(-200, -50, 400, 100, 50), '#E62117', '#111', 4); txt('SUBSCRIBE', 0, 4, 52, '#fff', 'Oswald', 700); });
};
function drawFrame(T) {
  GT = T; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, W, H);
  const i = SCENES.findIndex(s => T >= s.start && T < s.start + s.dur); const s = SCENES[i < 0 ? SCENES.length - 1 : i];
  ctx.save(); DRAW[s.id](T - s.start, s.dur); ctx.restore(); ctx.filter = 'none'; ctx.globalAlpha = 1;
  const u = T - s.start; if (u < 0.18 && s.start > 0) { ctx.fillStyle = `rgba(0,0,0,${1 - u / 0.18})`; ctx.fillRect(0, 0, W, H); }
  const nxt = SCENES[SCENES.indexOf(s) + 1]; if (nxt && s.start + s.dur - T < 0.1) { ctx.fillStyle = `rgba(0,0,0,${1 - (s.start + s.dur - T) / 0.1})`; ctx.fillRect(0, 0, W, H); }
  vign(0.55); grain(T);
  if (s.id !== 'sc13') { watermark(T); captions(); }
}
function drawCover() {
  GT = 0.2; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  courtyard(2, 5, { cam: { zoom: 1.04, px: 0, py: 0 }, sx: 800, sy: 1020, mid: [
    { z: 0.5, draw: () => { cage(440, 1520, 1.25, 2, { door: 1, glow: 1, chain: 1000 }); parrot(800, 960, 1.7, 2, { pose: 'fly', flap: 0.9, rimA: 0.8, rot: -0.3 }); for (let i = 0; i < 5; i++) feather(400 + i * 50, 1300 + i * 40, 0.9, i, i % 2 ? T_.green : T_.lime); } },
  ] });
  ctx.filter = 'none'; vign(0.5);
  withT(W / 2, 300, 1, 0, () => { ctx.font = '700 54px Oswald'; const s = 'RUMI'; const w = ctx.measureText(s).width + 90; P(rr(-w / 2, -44, w, 88, 44), 'rgba(14,60,70,0.92)', M.gold2, 4); txt(s, 0, 3, 54, '#FFF3D6', 'Oswald', 700); });
  bigText('NO BARS', W / 2, 500, 150, '#FFFFFF', 1);
  bigText('BROKEN.', W / 2, 670, 150, M.gold2, 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
  bigText("The Parrot's Escape", W / 2, 1640, 66, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
