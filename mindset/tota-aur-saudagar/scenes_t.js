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
