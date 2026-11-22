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
