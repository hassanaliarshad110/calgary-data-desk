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
