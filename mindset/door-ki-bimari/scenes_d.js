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
