// ===== "A Great Idea Makes Enemies" — scene set for The Prince, Ch. 6 (the innovator's enemies and lukewarm defenders)
// New: dawn loft workshop (tall industrial window grid, sunrise, light shafts, polished floor), MYTH/FACT stamp,
// gold pawn on a dawn board with dark pieces closing in, whiteboard 8-step → 4-step process + half-time clock,
// crossed-arm old guard vs shrugging crowd, dawn scale (crown vs question mark), unfinished bridge nobody crosses + flipping
// calendar, proof card walk, Mon–Fri ticks + hours bars, tabletop prototype bridge assembling, comment bubble, end card.
const D = { sun: '#FFB46A', sunRGB: '255,180,106', red: '#C0392B', grey: '#8C8C96', ink: '#07060A' };
function loft(t, d, o = {}) { // dawn loft workshop
  const cam = o.cam || camAt(t, d, 1, 1.07, 24), sun = o.sun ?? 0.7;
  layers([
    { z: 0.03, draw: () => { fullFill('#060508');
      const sk = ctx.createLinearGradient(0, 160, 0, 1180); sk.addColorStop(0, '#1A1430'); sk.addColorStop(0.55, lerpC('#3A1A2A', '#B5532E', sun)); sk.addColorStop(1, lerpC('#5A2A20', '#FFC27A', sun));
      ctx.fillStyle = sk; ctx.fillRect(90, 160, 900, 1020);
      glow(560, 1150, 360, '#FFD08A', 0.75 * sun); P(circ(560, 1150, 90), `rgba(255,220,150,${0.9 * sun})`, null);
      ctx.fillStyle = '#120A12'; for (let i = 0; i < 13; i++) { const x = 70 + i * 76, h = 80 + rnd(i + 41) * 300; ctx.fillRect(x, 1180 - h, 66, h); }
      ctx.fillStyle = '#0A080C'; for (let i = 0; i <= 6; i++) ctx.fillRect(84 + i * 150, 160, 14, 1030); for (let r = 0; r <= 6; r++) ctx.fillRect(84, 160 + r * 170, 914, 12);
      ctx.fillRect(-100, 0, 190, H); ctx.fillRect(990, 0, 200, H); ctx.fillRect(-100, 0, W + 200, 165);
    } },
    { z: 0.2, draw: () => { beam(560, 1000, 700, 560, 1900, 1500, D.sunRGB, 0.12 * sun);
      P(rr(-200, 1190, W + 400, 800, 0), grad(1190, H, '#24160F', '#080506'), null); line(-200, 1192, W + 200, 1192, 'rgba(255,200,140,0.45)', 3);
      alpha(0.22 * sun, () => P(poly([430, 1200, 690, 1200, 900, H, 220, H]), grad(1200, H, 'rgba(255,190,120,0.6)', 'rgba(255,190,120,0)'), null)); } },
    ...(o.mid || []),
    { z: 1.15, blur: 7, draw: () => { ctx.fillStyle = '#020203'; ctx.fillRect(-120, 0, 70, H); ctx.fillRect(W + 40, 0, 90, H); o.fg && o.fg(); } },
  ], cam);
  dust(t, 60, [120, 400, 860, 1100], '255,214,160', o.seed || 9);
}
function crossArms(x, y, s, col = '#06060A', rim = null) { withT(x, y, s, 0, () => { P(rr(-92, -250, 184, 46, 22), col, rim, 4); }); }
function shrugHands(x, y, s, k, col = '#06060A', rim = null) { withT(x, y, s, 0, () => { [-1, 1].forEach(sd => withT(sd * 112, -300 - 22 * k, 1, sd * 0.5, () => { P(rr(-22, -10, 44, 22, 10), col, rim, 3); })); }); }
function crowdMan(x, y, s, kind, u, o = {}) { // kind 'old' (crossed arms, red rim) | 'shrug' (grey rim, bob) | 'fan' (gold)
  const rim = kind === 'old' ? D.red : kind === 'fan' ? M.gold2 : D.grey; const bob = kind === 'shrug' ? Math.max(0, Math.sin(u * 2.4 + x)) : 0;
  person(x, y - bob * 8 * s, s, { f: o.f || 1, hair: o.hair, rim, rimA: o.rimA ?? 0.8, col: o.col });
  if (kind === 'old') crossArms(x, y, s, o.col || '#06060A', rim);
  if (kind === 'shrug') shrugHands(x, y, s, bob, o.col || '#06060A', rim);
}
function stamp(s, x, y, k, col, rot = -0.12, size = 120) { if (k <= 0) return; withT(x, y, lerp(1.8, 1, easeOut(k)), rot, () => alpha(clamp(k * 2), () => {
  ctx.font = `900 ${size}px Montserrat`; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -size * 0.72, w, size * 1.44, 18), 'rgba(8,4,6,0.55)', col, 10); txt(s, 0, 6, size, col, 'Montserrat', 900); })); }
function maya(x, y, s, o = {}) { person(x, y, s, { hair: true, rim: o.rim || M.gold2, rimA: 0.95, f: o.f || 1 }); }
function scroll(x, y, s, k = 1) { withT(x, y, s, 0, () => { glow(0, 0, 260, M.gold2, 0.45 * k); P(rr(-150, -100, 300, 200, 10), grad(-100, 100, '#F0E2C2', '#CDB68A'), null);
  P(rr(-170, -118, 340, 34, 16), '#8A5A20', null); P(rr(-170, 86, 340, 34, 16), '#8A5A20', null);
  alpha(0.75, () => { for (let i = 0; i < 4; i++) line(-110, -50 + i * 34, 110 - (i % 2) * 50, -50 + i * 34, '#5A3A1A', 6); }); P(circ(90, 50, 22), M.red, null); }); }
function clockFace(x, y, r, a, col = M.gold2) { withT(x, y, 1, 0, () => { glow(0, 0, r * 1.6, col, 0.25); P(circ(0, 0, r), '#0C0A10', col, 7);
  if (a > 0) { ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r - 10, -Math.PI / 2, -Math.PI / 2 + a * 6.283); ctx.closePath(); ctx.fillStyle = 'rgba(226,176,74,0.45)'; ctx.fill(); ctx.restore(); }
  for (let i = 0; i < 12; i++) { const an = i / 12 * 6.283; line(Math.cos(an) * (r - 20), Math.sin(an) * (r - 20), Math.cos(an) * (r - 8), Math.sin(an) * (r - 8), col, 4); }
  const an = -Math.PI / 2 + a * 6.283; line(0, 0, Math.cos(an) * (r - 26), Math.sin(an) * (r - 26), '#fff', 7); P(circ(0, 0, 9), col, null); }); }
function bridgeArch(x, y, w, k, lit = 0.6) { // stone bridge across a gap, k = built fraction (left→right)
  const n = 9; for (let i = 0; i < n; i++) { const kk = clamp(k * n - i); if (kk <= 0) continue; const x0 = x - w / 2 + w * i / n, bw = w / n - 4; const yy = y - Math.sin(Math.PI * (i + 0.5) / n) * 60 - (1 - kk) * 120;
    alpha(kk, () => { P(rr(x0, yy, bw, 46, 5), grad(yy, yy + 46, lerpC('#6A4A34', '#E2B04A', lit * 0.5), '#2A1A10'), 'rgba(10,6,4,0.9)', 2); }); }
}
function cliff(x, y, f, col = '#0A0708') { withT(x, y, 1, 0, () => { ctx.scale(f, 1); P(poly([0, 0, 380, 0, 400, 40, 360, 700, 0, 700]), col, null); line(0, 2, 390, 2, 'rgba(255,200,140,0.4)', 3); }); }
function calendar(x, y, s, page, label) { withT(x, y, s, 0, () => { P(rr(-110, -120, 220, 240, 16), '#EADBB8', '#1A120B', 4); P(rr(-110, -120, 220, 64, [16, 16, 0, 0]), M.red, null);
  txt(label, 0, -88, 34, '#fff', 'Oswald', 700); txt(String(page), 0, 28, 110, '#1A120B', 'Oswald', 700); }); }

// ================= scenes
DRAW.sc1 = (t, d) => { // hook: glowing scroll (the great idea) on a pedestal, MYTH stamp
  const u = lt('h1');
  loft(t, d, { cam: { zoom: lerp(1.0, 1.1, ease(t / d)), px: 0, py: 0, cy: 1000 }, sun: 0.45,
    mid: [{ z: 0.55, draw: () => { P(rr(430, 1150, 220, 360, 8), grad(1150, 1510, '#2A1A12', '#0A0606'), null); P(rr(400, 1130, 280, 40, 8), '#3A2414', null); scroll(540, 1000 + Math.sin(t * 2) * 8, 1.25, 1); } }] });
  stamp('MYTH', W / 2, 330, seg(u, 0.0, 0.25), M.gold2, -0.08, 110);
  bigText('A GREAT IDEA', W / 2, 520, 104, '#FFFFFF', seg(u, 0.55, 0.8));
  bigText('SELLS ITSELF?', W / 2, 650, 104, M.gold2, seg(u, 1.35, 1.6));
};
DRAW.sc2 = (t, d) => { // fact: the gold pawn steps forward on a dawn board, dark pieces turn and close in
  const u = lt('n2'); const close = easeOut(seg(u, wt('n2', 4), wt('n2', 6) + 0.6)); const step = easeOut(seg(u, 0.1, 0.9));
  floorSet(t, d, { dawn: 0.7, cam: { zoom: lerp(1.04, 1.12, ease(t / d)), px: 0, py: 0, cy: 1150 }, seed: 12,
    mid: [{ z: 0.5, draw: () => {
      const ring = [[-330, 1440, 'king'], [330, 1440, 'queen'], [-430, 1640, 'pawn'], [430, 1640, 'pawn'], [-250, 1760, 'pawn'], [250, 1760, 'pawn']];
      ring.forEach(([dx, y, k], i) => { const x = W / 2 + dx * lerp(1.35, 0.78, close); glow(x, y - 120, 140, D.red, 0.25 * close); chessPiece(k, x, y, 1.15, '#060407', D.red, 0.35 + 0.55 * close); });
      glow(W / 2, 1520, 240, M.gold2, 0.6); chessPiece('pawn', W / 2, lerp(1720, 1650, step), 1.3, '#2A1C08', M.gold2, 1);
    } }] });
  stamp('MYTH', W / 2, 330, 1 - seg(u, 0, 0.25), M.gold2, -0.08, 110);
  stamp('FACT', W / 2, 330, seg(u, 0.05, 0.3), D.red, 0.06, 110);
  bigText('IT MAKES ENEMIES', W / 2, 500, 88, '#FFFFFF', kin('n2', 5, 0.1, 0.25));
  chipAt('Machiavelli · The Prince · 1513', 640, kin('n2', 6, 0.05, 0.3));
};
DRAW.sc3 = (t, d) => { // Maya at a whiteboard: 8-step process → 4 steps, clock halves
  const u = lt('n3'); const strike = seg(u, wt('n3', 9) - 0.1, wt('n3', 12)); const half = easeOut(seg(u, wt('n3', 13) - 0.1, wt('n3', 16) + 0.3));
  loft(t, d, { sun: 0.8, cam: { zoom: lerp(1.0, 1.06, ease(t / d)), px: lerp(-20, 20, ease(t / d)), py: 0, cy: 1100 },
    mid: [{ z: 0.5, draw: () => {
      P(rr(170, 560, 740, 560, 14), '#E9E6DE', '#1A1A20', 10); P(rr(160, 1118, 760, 20, 6), '#2A2A30', null); line(300, 1138, 260, 1420, '#1A1A20', 10); line(780, 1138, 820, 1420, '#1A1A20', 10);
      txt('WEEKLY REPORT', 540, 610, 40, '#24170C', 'Oswald', 700);
      for (let i = 0; i < 8; i++) { const x = 240 + (i % 4) * 160, y = 700 + Math.floor(i / 4) * 130; P(rr(x, y, 120, 80, 10), 'rgba(40,40,60,0.12)', '#3A3A50', 3); txt(String(i + 1), x + 60, y + 42, 40, '#3A3A50', 'Oswald', 700);
        if (i % 2 && strike > 0) { const k = clamp(strike * 4 - (i >> 1)); line(x + 10, y + 70, x + 10 + 100 * k, y + 10, M.red2, 8); } }
      const k2 = easeOut(seg(u, wt('n3', 12) - 0.3, wt('n3', 12) + 0.2)); alpha(k2, () => { txt('4 STEPS', 540, 1010, 64, '#1E7A44', 'Montserrat', 900); });
    } },
    { z: 0.75, draw: () => { maya(930, 1700, 1.25, { f: -1 }); clockFace(250, 1520, 120, lerp(0.95, 0.47, half)); } }] });
  nameTag('MAYA', 900, 1100, kin('n3', 0, 0.05, 0.3));
  bigText('HALF THE TIME', W / 2, 330, 96, M.gold2, kin('n3', 14, 0.05, 0.25));
};
function nameTag(s, x, y, k, col = M.gold2) { if (k <= 0) return; alpha(k, () => { ctx.font = '700 40px Oswald'; const w = ctx.measureText(s).width + 40; P(rr(x - w / 2, y - 28, w, 56, 28), 'rgba(10,6,8,0.75)', col, 3); txt(s, x, y + 2, 40, col, 'Oswald', 700); }); }
DRAW.sc4 = (t, d) => { // old guard (crossed arms, red) left vs shruggers (grey) right; Maya centre with her plan
  const u = lt('n4'); const pb = easeOut(seg(u, wt('n4', 7) - 0.1, wt('n4', 8) + 0.2)); const sh = easeOut(seg(u, wt('n4', 13), wt('n4', 14) + 0.3));
  const camx = lerp(-160, 160, ease(seg(u, wt('n4', 9) - 0.4, wt('n4', 10) + 0.2)));
  loft(t, d, { sun: 0.6, cam: { zoom: 1.08, px: camx, py: 0, cy: 1200 },
    mid: [{ z: 0.6, draw: () => {
      [[-180, 1560], [30, 1610], [220, 1530]].forEach(([x, y], i) => { glow(x, y - 300, 160, D.red, 0.18 * pb); crowdMan(x - 60 * pb, y, 0.95, 'old', u, { f: 1 }); });
      [[860, 1530], [1060, 1600], [1250, 1540]].forEach(([x, y], i) => crowdMan(x, y, 0.95, 'shrug', u * (0.6 + sh), { f: -1 }));
      maya(540, 1680, 1.1); scroll(540, 1180, 0.45, 1);
    } }] });
  bigText('PUSH BACK', W / 2, 330, 104, D.red, kin('n4', 7, 0.05, 0.25) * (1 - seg(u, wt('n4', 9) - 0.2, wt('n4', 9))));
  bigText('…JUST SHRUG', W / 2, 330, 104, '#C8C8D2', kin('n4', 13, 0.05, 0.25));
};
DRAW.sc5 = (t, d) => { // quote card over the candlelit study at dawn (thinker silhouette writing)
  const u = lt('q1');
  study(t, d, { dawn: 0.75, cam: { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0 }, extra: [{ z: 0.7, draw: () => thinker(820, 1220, 0.9, t) }] });
  ctx.fillStyle = 'rgba(4,3,6,0.35)'; ctx.fillRect(0, 0, W, H);
  quoteCard2('q1', 2, '…the innovator has for enemies all those who have done well under the old conditions, and lukewarm defenders in those who may do well under the new.', ['— The Prince, Ch. 6 (tr. Marriott)'], ['innovator', 'enemies', 'lukewarm', 'defenders'], { size: 60, cy: 760, in: 0.2 });
};
DRAW.sc6 = (t, d) => { // two groups on a dawn scale: crown (something to lose) vs question mark (not yet)
  const u = lt('n5'); const tilt = lerp(0, -0.12, easeOut(seg(u, wt('n5', 2), wt('n5', 6)))) + lerp(0, 0.2, easeOut(seg(u, wt('n5', 8), wt('n5', 12))));
  loft(t, d, { sun: 0.5, cam: { zoom: lerp(1.02, 1.1, ease(t / d)), px: 0, py: 0, cy: 1000 },
    mid: [{ z: 0.55, draw: () => scale(W / 2, 760, 1.15, tilt, t, (x, y) => { glow(x, y - 60, 110, D.red, 0.5); crown(x, y - 10, 0.55, t); }, (x, y) => { glow(x, y - 60, 110, '#9CA0B0', 0.4); txt('?', x, y - 70, 150, '#C8C8D2', 'Montserrat', 900); }) }] });
  bigText('SOMETHING TO LOSE', W / 2, 300, 76, D.red, kin('n5', 3, 0.05, 0.25) * (1 - seg(u, wt('n5', 6), wt('n5', 7))));
  bigText('NOT CONVINCED YET', W / 2, 300, 76, '#C8C8D2', kin('n5', 9, 0.05, 0.25));
};
DRAW.sc7 = (t, d) => { // new bridge across a gap at dawn: people wait at the edge; calendar pages flip
  const u = lt('n6'); const days = Math.floor(1 + 29 * ease(seg(u, wt('n6', 9), LINES.n6.dur)));
  layers([
    { z: 0.03, draw: () => { const sk = ctx.createLinearGradient(0, 0, 0, 1300); sk.addColorStop(0, '#120E24'); sk.addColorStop(0.6, '#8A3A2A'); sk.addColorStop(1, '#F7B46A'); fullFill(sk); glow(540, 1180, 420, '#FFD08A', 0.6); P(circ(540, 1190, 80), 'rgba(255,224,160,0.95)', null); } },
    { z: 0.15, haze: 0.08, draw: () => { cloudBank(980, 'rgba(40,16,24,0.6)', 1, t, 4); } },
    { z: 0.45, draw: () => { P(rr(-300, 1255, W + 600, 900, 0), grad(1255, 1700, '#2A1410', '#050305'), null); cliff(-60, 1250, 1); cliff(1140, 1250, -1); bridgeArch(540, 1230, 760, 1, 0.8); } },
    { z: 0.7, draw: () => { [[100, 1260], [200, 1290], [290, 1255]].forEach(([x, y], i) => crowdMan(x, y, 0.55, 'shrug', u + i, { f: 1 })); } },
  ], { zoom: lerp(1.02, 1.1, ease(t / d)), px: lerp(30, -30, ease(t / d)), py: 0, cy: 1200 });
  dust(t, 40, [0, 500, W, 900], '255,214,160', 21);
  chipAt('in essence · The Prince, Ch. 6', 300, seg(u, 0, 0.3));
  if (u > wt('n6', 9) - 0.2) withT(860, 620, 1, 0, () => { const k = easeOut(seg(u, wt('n6', 9) - 0.2, wt('n6', 9) + 0.1)); alpha(k, () => calendar(0, 0, 0.9, days, 'DAY')); });
};
DRAW.sc8 = (t, d) => { // my take: critics dim, Maya turns to the shruggers holding a glowing proof card
  const u = lt('n7'); const dim = easeOut(seg(u, wt('n7', 2), wt('n7', 8))); const turn = easeOut(seg(u, wt('n7', 9) - 0.2, wt('n7', 11)));
  loft(t, d, { sun: 0.85, cam: { zoom: lerp(1.04, 1.12, ease(t / d)), px: lerp(-120, 140, turn), py: 0, cy: 1200 },
    mid: [{ z: 0.6, draw: () => {
      alpha(1 - 0.75 * dim, () => [[-150, 1560], [60, 1610]].forEach(([x, y]) => crowdMan(x, y, 0.95, 'old', u)));
      [[900, 1540], [1110, 1600]].forEach(([x, y]) => crowdMan(x, y, 0.95, 'shrug', u, { f: -1 }));
      const mx = lerp(420, 640, turn); maya(mx, 1680, 1.1, { f: 1 });
      withT(mx + 150, 1120, 1, 0.08, () => { glow(0, 0, 200, M.gold2, 0.5 * turn + 0.15); P(rr(-80, -100, 160, 200, 12), '#F0E2C2', M.gold, 4); [0, 1, 2].forEach(i => P(rr(-50 + i * 38, 60 - (30 + i * 30), 26, 30 + i * 30, 4), '#1E7A44', null)); txt('PROOF', 0, -60, 34, '#24170C', 'Oswald', 700); });
    } }] });
  bigText('MY TAKE', W / 2, 300, 96, M.gold2, seg(u, 0, 0.25) * (1 - seg(u, wt('n7', 9) - 0.25, wt('n7', 9))));
  bigText('PROOF > SPEECHES', W / 2, 300, 92, M.gold2, kin('n7', 12, 0.05, 0.25));
};
DRAW.sc9 = (t, d) => { // one week: Mon–Fri tick off, hours bars (old 8 vs new 4), then shruggers turn gold and stand with Maya
  const u = lt('n8'); const conv = easeOut(seg(u, wt('n8', 13) - 0.2, wt('n8', 16) + 0.3));
  loft(t, d, { sun: 0.95, cam: { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0, cy: 1100 },
    mid: [{ z: 0.5, draw: () => {
      ['MON', 'TUE', 'WED', 'THU', 'FRI'].forEach((s, i) => { const k = easeOut(seg(u, wt('n8', 4) + i * 0.22 - 0.2, wt('n8', 4) + i * 0.22 + 0.1)); const x = 220 + i * 160;
        P(rr(x - 66, 500, 132, 150, 14), 'rgba(234,219,184,0.92)', '#1A120B', 3); txt(s, x, 535, 32, M.red, 'Oswald', 700);
        if (k > 0) withT(x, 600, back(k), 0, () => { P(circ(0, 0, 32), '#1E7A44', null); ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-3, 12); ctx.lineTo(16, -12); ctx.stroke(); ctx.restore(); }); });
      const hk = easeOut(seg(u, wt('n8', 9) - 0.1, wt('n8', 12) + 0.2));
      [['OLD WAY', 8, '#7A2A22'], ['MAYA', 4, M.gold]].forEach(([s, h, c], i) => { const x = 380 + i * 320, bh = 42 * h * hk; P(rr(x - 70, 1100 - bh, 140, bh, 10), c, null); txt(s, x, 1135, 36, '#fff', 'Oswald', 700); if (hk > 0.9) txt(h + ' h', x, 1070 - bh, 52, '#fff', 'Montserrat', 900); });
    } },
    { z: 0.75, draw: () => { maya(540, 1720, 1.0); [[230, 1640, 1], [850, 1640, -1]].forEach(([x, y, f]) => crowdMan(lerp(x + (f > 0 ? -260 : 260), x, conv), y, 0.95, conv > 0.5 ? 'fan' : 'shrug', u, { f })); } }] });
  bigText('HOURS SAVED', W / 2, 330, 96, M.gold2, kin('n8', 11, 0.05, 0.25) * (1 - seg(u, wt('n8', 13) - 0.2, wt('n8', 13))));
  bigText('NOW THEY DEFEND IT', W / 2, 330, 86, M.gold2, kin('n8', 15, 0.05, 0.25));
};
DRAW.sc10 = (t, d) => { // today: tabletop prototype bridge assembling between two book stacks at dawn
  const u = lt('n9'); const b = ease(seg(u, wt('n9', 1), wt('n9', 9) + 0.3)); const show = easeOut(seg(u, wt('n9', 11) - 0.1, wt('n9', 13) + 0.3));
  loft(t, d, { sun: 1, cam: { zoom: lerp(1.0, 1.1, ease(t / d)), px: 0, py: 0, cy: 1250 },
    mid: [{ z: 0.6, draw: () => {
      P(rr(-200, 1350, W + 400, 700, 0), grad(1350, H, '#4A2E18', '#140A06'), null); line(-200, 1352, W + 200, 1352, 'rgba(255,210,150,0.55)', 3);
      [[150, 1350], [930, 1350]].forEach(([x, y], i) => { for (let k = 0; k < 4; k++) P(rr(x - 110 + (k % 2) * 8, y - 60 - k * 60, 220, 56, 6), ['#5A1A12', '#2A1A0E', '#7A4A1A', '#3A0E0E'][(k + i) % 4], 'rgba(0,0,0,0.6)', 2); });
      bridgeArch(540, 1110, 660, b, 1);
      if (b >= 1) glow(540, 1080, 300, M.gold2, 0.35);
      person(200 - 40 * (1 - show), 1120, 0.28, { rim: M.gold2, hair: false }); person(880, 1120, 0.28, { rim: M.gold2, f: -1, hair: true });
    } }] });
  bigText('TODAY', W / 2, 300, 120, M.gold2, seg(u, 0, 0.2));
  bigText('SMALLEST VERSION', W / 2, 450, 84, '#FFFFFF', kin('n9', 3, 0.05, 0.25));
  bigText('THAT WORKS', W / 2, 560, 84, M.gold2, kin('n9', 8, 0.05, 0.25));
};
DRAW.sc11 = (t, d) => { // comment question: Maya at the window, comment bubble
  const u = lt('n10');
  loft(t + 4, d, { sun: 1, cam: { zoom: lerp(1.18, 1.24, ease(t / d)), px: 0, py: 0, cy: 1150 }, mid: [{ z: 0.6, draw: () => maya(540, 1700, 1.15) }] });
  bigText('WHAT CHANGE', W / 2, 330, 104, '#FFFFFF', seg(u, 0, 0.2));
  bigText('DID THEY FIGHT?', W / 2, 470, 104, M.gold2, kin('n10', 4, 0.05, 0.2));
  const kc = back(seg(u, wt('n10', 8) - 0.05, wt('n10', 8) + 0.35)); if (kc > 0) withT(W / 2 + 230, 820, kc, 0, () => { const b = new Path2D(); b.roundRect(-110, -70, 220, 130, 30); b.moveTo(-30, 60); b.lineTo(-60, 105); b.lineTo(10, 60); P(b, '#F6F2E8', '#111', 4); for (let i = -1; i <= 1; i++) P(circ(i * 48, -5, 13), '#222', null); });
};
DRAW.sc12 = (t, d) => { // end card
  loft(t + 6, d, { sun: 1, cam: { zoom: 1.1, px: 0, py: 0, cy: 1150 } });
  ctx.fillStyle = 'rgba(3,3,8,0.62)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0, 0.4)); const L = document.getElementById('logo');
  withT(W / 2, 640, lerp(0.8, 1, k), 0, () => alpha(k, () => { glow(0, 0, 320, M.gold, 0.4); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -135, -135, 270, 270); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.strokeStyle = M.gold2; ctx.lineWidth = 7; ctx.stroke(); }));
  bigText('Follow Awazzzz', W / 2, 900, 104, '#FFFFFF', seg(t, 0.1, 0.4));
  bigText('MINDSET', W / 2, 1030, 66, M.gold2, seg(t, 0.3, 0.6), 'Oswald', 700);
  alpha(seg(t, 0.5, 0.8), () => txt('keep building', W / 2, 1120, 50, M.parch, 'CrimsonText', 600));
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
  GT = 4.5; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  const _b = bigText, _s = stamp, _c = chipAt; bigText = () => {}; stamp = () => {}; chipAt = () => {}; GT = LINES.n2.start + 4.0; DRAW.sc2(GT - SCENES[1].start, SCENES[1].dur); bigText = _b; stamp = _s; chipAt = _c; ctx.filter = 'none'; vign(0.5);
  withT(W / 2, 300, 1, 0, () => { ctx.font = '700 54px Oswald'; const s = 'MACHIAVELLI'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -44, w, 88, 44), 'rgba(110,14,14,0.92)', M.gold2, 4); txt(s, 0, 3, 54, '#FFF3D6', 'Oswald', 700); });
  bigText('GOOD IDEAS', W / 2, 480, 130, '#FFFFFF', 1);
  bigText('MAKE ENEMIES', W / 2, 640, 124, M.gold2, 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
  bigText('The Prince · Ch. 6', W / 2, 790, 64, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
