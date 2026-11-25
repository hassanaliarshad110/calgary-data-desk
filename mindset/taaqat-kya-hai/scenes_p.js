// ===== "What Is Real Power?" — Mind vs Heart scene set (The Prince Ch. 20 vs Masnavi Book I v. 1389)
// New: top/bottom red-vs-blue split (feared boss vs needed boss), left/right jagged split (candle study vs moon desert),
// night fortress on a hill with torches + townsfolk who turn away, gate push-in to a moonlit stone hall where a lone
// figure's shadow on the wall is a lion, floodlit football pitch (captain, referee, red card), lone bench + temper
// shadow, walls/gate verdict merge, urge chips (SNAP / QUIT / SCROLL) with a calm breath ring, comment split, end card.
const PW = { red: '#C0392B', red0: '#2A0507', blue: '#3FA7A8', blue0: '#03101F', gold: '#F6D27A', torch: '#FF9A40' };
function stampP(s, x, y, k, col, rot = -0.1, size = 110) { if (k <= 0) return; withT(x, y, lerp(1.8, 1, easeOut(k)), rot, () => alpha(clamp(k * 2), () => {
  ctx.font = `900 ${size}px Montserrat`; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -size * 0.72, w, size * 1.44, 18), 'rgba(8,4,6,0.55)', col, 9); txt(s, 0, 6, size, col, 'Montserrat', 900); })); }
function nameTagP(s, x, y, k, col = PW.gold) { if (k <= 0) return; alpha(k, () => { ctx.font = '700 42px Oswald'; const w = ctx.measureText(s).width + 44; P(rr(x - w / 2, y - 32, w, 64, 32), 'rgba(8,6,10,0.75)', col, 3); txt(s, x, y + 2, 42, col, 'Oswald', 700); }); }
function torch(x, y, s, t) { withT(x, y, s, 0, () => { P(rr(-7, 0, 14, 120, 4), '#1A0E08', null); const f = flick(t + x * 0.01);
  glow(0, -20, 170 * f, PW.torch, 0.5); const fl = new Path2D(); fl.moveTo(-16, 0); fl.quadraticCurveTo(-22, -40 * f, 0, -78 * f); fl.quadraticCurveTo(22, -40 * f, 16, 0); fl.closePath(); P(fl, '#FFC060', null); P(ell(0, -18, 7, 16 * f), '#FFF1C0', null); }); }

// ---- night fortress on a hill (red sky), torches, optional townsfolk crowd (o.crowd {k: 0 face castle .. 1 walk away})
function castle(x, y, s, lit = 1, crack = 0) { withT(x, y, s, 0, () => {
  const body = new Path2D(); const cren = (x0, x1, top) => { for (let xx = x0; xx < x1; xx += 36) { body.rect(xx, top - 26, 22, 28); } };
  body.rect(-360, -300, 720, 300); cren(-360, 360, -300);
  [[-420, -520, 130], [290, -520, 130], [-90, -700, 180]].forEach(([tx, ty, tw]) => { body.rect(tx, ty, tw, -ty); cren(tx, tx + tw, ty); });
  body.moveTo(-60, 0); P(body, '#08040A', null);
  ctx.save(); ctx.clip(body); glow(0, -500, 700, '#6A1010', 0.25); ctx.restore();
  P(new Path2D('M-70 0 L-70 -120 Q0 -200 70 -120 L70 0 Z'), '#020103', null);
  const win = [[-355, -440], [355, -440], [0, -600], [-40, -480], [40, -480], [-220, -200], [220, -200], [-120, -200], [120, -200]];
  win.forEach(([wx, wy], i) => { const on = lit * (0.7 + 0.3 * Math.sin(GT * 3 + i)) * (rnd(i + 3) > 0.15 ? 1 : 0.4); if (on <= 0.02) return; glow(wx, wy, 60, '#FFB050', 0.45 * on); P(rr(wx - 11, wy - 22, 22, 40, [11, 11, 0, 0]), `rgba(255,190,90,${0.9 * on})`, null); });
  P(body, null, 'rgba(255,120,80,0.35)', 3);
  if (crack > 0) { ctx.save(); ctx.strokeStyle = '#FF5A3A'; ctx.lineWidth = 6; ctx.shadowColor = '#FF3A1A'; ctx.shadowBlur = 18; ctx.beginPath(); const pts = [[20, -700], [-10, -600], [30, -520], [-20, -420], [15, -300], [-25, -180], [5, 0]]; const n = Math.max(1, Math.floor(crack * (pts.length - 1))); ctx.moveTo(...pts[0]); for (let i = 1; i <= n; i++) ctx.lineTo(...pts[i]); ctx.stroke(); ctx.restore(); }
}); }
function townsman(x, y, s, k, i, t) { // back-view silhouette facing the castle; k>0.5 turns and walks off
  const turn = seg(k, 0.1, 0.4); const walk = seg(k, 0.35, 1) * (i % 2 ? 1 : -1) * 260; const bob = Math.sin(t * 6 + i) * 4 * seg(k, 0.35, 1);
  person(x + walk, y + bob, s, { f: turn > 0.5 ? (i % 2 ? 1 : -1) : 1, col: '#030204', rim: turn > 0.5 ? 'rgba(255,140,90,0.55)' : 'rgba(255,150,90,0.3)', rimA: 0.8 });
}
function fortressSet(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1.0, 1.08, 20);
  layers([
    { z: 0.02, draw: () => { fullFill(grad(0, 1500, '#05020A', '#3A0A0E')); starsT(t, 90, 700, 11); glow(760, 330, 260, '#FFD0A0', 0.18); P(circ(760, 330, 70), 'rgba(255,214,170,0.85)', null); glow(W / 2, 1150, 800, '#8E1B1B', 0.35); } },
    { z: 0.12, haze: 0.08, draw: () => { const p = new Path2D(); p.moveTo(-300, 1200); for (let x = -300; x <= W + 300; x += 40) p.lineTo(x, 1080 + 60 * Math.sin(x * 0.006 + 1) + 30 * Math.sin(x * 0.017)); p.lineTo(W + 300, 2400); p.lineTo(-300, 2400); p.closePath(); P(p, '#12040A', null); } },
    { z: 0.3, draw: () => { const h = new Path2D(); h.moveTo(-300, 1400); h.quadraticCurveTo(W / 2, 980, W + 300, 1400); h.lineTo(W + 300, 2400); h.lineTo(-300, 2400); h.closePath(); P(h, '#0A0306', null);
      castle(W / 2, 1130, o.cs || 0.78, o.lit ?? 1, o.crack || 0); [[150, 1260], [930, 1260]].forEach(([x, y]) => torch(x, y, 0.9, t)); o.onCastle && o.onCastle(); } },
    ...(o.mid || []),
    { z: 0.7, draw: () => { const g = new Path2D(); g.moveTo(-300, 1700); g.quadraticCurveTo(W / 2, 1560, W + 300, 1700); g.lineTo(W + 300, 2500); g.lineTo(-300, 2500); g.closePath(); P(g, '#050204', null);
      if (o.crowd) { const xs = [120, 300, 470, 640, 810, 980]; xs.forEach((x, i) => townsman(x, 1840 + (i % 2) * 30, 0.62 + (i % 3) * 0.05, o.crowd.k, i, t)); } } },
    { z: 1.15, blur: 7, draw: () => { torch(40, 1850, 1.8, t + 1); torch(1050, 1880, 1.6, t + 2); } },
  ], cam);
  dust(t, 50, [0, 600, W, 1100], '255,170,120', 4);
}

// ---- moonlit stone hall: arched window with moon, lone figure; shadow on the wall is a lion (o.lion 0..1)
function hallSet(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1.0, 1.07, 18);
  const fx = o.fx ?? 610, lionK = o.lion ?? 1;
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#04101E', '#010307'));
      alpha(0.35, () => { for (let r = 0; r < 22; r++) for (let c = 0; c < 7; c++) { const off = r % 2 ? 80 : 0; P(rr(-60 + c * 180 + off, 80 + r * 72, 170, 64, 6), null, 'rgba(90,140,170,0.35)', 2); } });
      const wx = 160, wy = 260, ww = 300, wh = 560; const win = new Path2D(); win.moveTo(wx, wy + wh); win.lineTo(wx, wy + ww / 2); win.arc(wx + ww / 2, wy + ww / 2, ww / 2, Math.PI, 0); win.lineTo(wx + ww, wy + wh); win.closePath();
      ctx.save(); ctx.clip(win); fullFill(grad(wy, wy + wh, '#061230', '#0D2C4C')); starsT(t, 40, 900, 5); moon(wx + ww * 0.6, wy + 190, 62, t); ctx.restore(); P(win, null, '#0A1420', 20); line(wx + ww / 2, wy + 20, wx + ww / 2, wy + wh, '#0A1420', 10);
      beam(wx + ww / 2, wy + wh * 0.4, 260, fx + 120, 1750, 900, '150,200,255', 0.13); } },
    { z: 0.2, draw: () => { // lion shadow cast on the far wall
      glow(fx + 40, 1150, 650, '#6FA8C8', 0.32); glow(fx + 40, 1200, 380, '#A8D4E8', 0.18);
      if (lionK > 0) alpha(0.92 * lionK, () => { ctx.save(); ctx.filter = 'blur(2px)'; lion(fx - 60, 1430, 1.6, t * 0.5, { rim: '#7FD8D8', rimA: 0.75 * lionK, eye: 0.7 * lionK }); ctx.restore(); }); } },
    { z: 0.5, draw: () => { P(rr(-300, 1640, W + 600, 900, 0), grad(1640, 2100, '#0A1828', '#020509'), null); line(-300, 1642, W + 300, 1642, 'rgba(150,200,255,0.3)', 3);
      alpha(0.25, () => P(ell(fx + 150, 1690, 360, 40), '#000', null));
      person(fx, 1700, 1.25, { f: 1, col: '#020408', rim: '#9FD0E0', rimA: 0.85 }); o.onFloor && o.onFloor(); } },
    ...(o.extra || []),
    { z: 1.1, blur: 7, draw: () => { lantern(990, 420, 1.4, t, 500); } },
  ], cam);
  dust(t, 60, [100, 500, 800, 1200], '170,210,255', 9);
}

// ---- floodlit football pitch at night
function floodTower(x, y, s, t) { withT(x, y, s, 0, () => { P(poly([-14, 0, 14, 0, 8, -620, -8, -620]), '#06080C', null); P(rr(-90, -720, 180, 110, 8), '#0A0C12', null);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { glow(-66 + c * 44, -690 + r * 50, 60, '#F4F8FF', 0.4); P(circ(-66 + c * 44, -690 + r * 50, 15), '#FFFFFF', null); } }); }
function pitchSet(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1.0, 1.08, 22); const night = o.dim ?? 0;
  layers([
    { z: 0.02, draw: () => { fullFill(grad(0, 1100, '#02040A', '#0B1424')); starsT(t, 60, 600, 21); } },
    { z: 0.12, draw: () => { // stands with crowd specks
      P(poly([-300, 1000, W + 300, 1000, W + 300, 780, -300, 640]), '#0A0E18', null);
      for (let i = 0; i < 420; i++) { const x = -250 + rnd(i) * (W + 500), y = 700 + rnd(i + 9) * 290 + (x / W) * 60; ctx.fillStyle = `rgba(${rnd(i + 3) > 0.7 ? '200,60,60' : '170,190,220'},${0.25 + 0.3 * rnd(i + 5)})`; ctx.fillRect(x, y, 6, 6); }
      floodTower(60, 760, 1, t); floodTower(1020, 760, 1, t);
      beam(60, 70, 120, 420, 1500, 700, '235,245,255', 0.08 * (1 - night)); beam(1020, 70, 120, 660, 1500, 700, '235,245,255', 0.08 * (1 - night)); } },
    { z: 0.35, draw: () => { // pitch in perspective
      const g = ctx.createLinearGradient(0, 1000, 0, H); g.addColorStop(0, '#0E3A1E'); g.addColorStop(1, '#06200F'); P(rr(-300, 1000, W + 600, 1200, 0), g, null);
      alpha(0.25, () => { for (let i = 0; i < 9; i++) { const y0 = 1000 + Math.pow(i / 9, 1.6) * 1000; P(rr(-300, y0, W + 600, Math.pow((i + 0.5) / 9, 1.6) * 60 + 10, 0), i % 2 ? '#1A5A2E' : '#0B2E17', null); } });
      ctx.strokeStyle = 'rgba(235,245,235,0.55)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-300, 1260); ctx.lineTo(W + 300, 1260); ctx.stroke(); ctx.beginPath(); ctx.ellipse(W / 2, 1260, 330, 70, 0, 0, 6.283); ctx.stroke();
      glow(W / 2, 1500, 700, '#DDEEFF', 0.12 * (1 - night)); if (night) { ctx.fillStyle = `rgba(0,0,0,${0.5 * night})`; ctx.fillRect(-300, 600, W + 600, 1600); } } },
    ...(o.mid || []),
    { z: 1.1, blur: 6, draw: () => { o.fore && o.fore(); } },
  ], cam);
  dust(t, 40, [0, 300, W, 900], '230,240,255', 13);
}
function player(x, y, s, o = {}) { person(x, y, s, { f: o.f || 1, col: o.col || '#04060A', rim: o.rim || 'rgba(220,235,255,0.7)', rimA: o.rimA ?? 0.85 });
  if (o.band) withT(x, y, s, 0, () => { ctx.scale(o.f || 1, 1); P(rr(-98, -300, 30, 26, 4), PW.gold, null); }); }
function redCard(x, y, s, k, rot = 0.08) { if (k <= 0) return; withT(x, y, lerp(0.3, 1, back(k)) * s, rot, () => { glow(0, 0, 260, '#FF2A1A', 0.5); P(rr(-80, -115, 160, 230, 12), grad(-115, 115, '#FF3A2A', '#B8120A'), '#1A0404', 5); }); }

// ---- split helpers
function splitTB(seamY, tilt, top, bottom) { // top/bottom split with a slanted, glowing seam
  ctx.save(); const a = new Path2D(); a.moveTo(-50, -50); a.lineTo(W + 50, -50); a.lineTo(W + 50, seamY - tilt); a.lineTo(-50, seamY + tilt); a.closePath(); ctx.clip(a); top(); ctx.restore();
  ctx.save(); const b = new Path2D(); b.moveTo(-50, seamY + tilt); b.lineTo(W + 50, seamY - tilt); b.lineTo(W + 50, H + 50); b.lineTo(-50, H + 50); b.closePath(); ctx.clip(b); bottom(); ctx.restore();
  ctx.save(); ctx.shadowColor = PW.gold; ctx.shadowBlur = 30; line(-50, seamY + tilt, W + 50, seamY - tilt, PW.gold, 6); ctx.restore();
}
function splitLR(seamX, t, left, right) { // left/right jagged seam
  const pts = []; for (let y = -60; y <= H + 60; y += 120) pts.push([seamX + (Math.floor(y / 120) % 2 ? 26 : -26) + Math.sin(t * 2 + y) * 4, y]);
  ctx.save(); const a = new Path2D(); a.moveTo(-50, -60); pts.forEach(p => a.lineTo(...p)); a.lineTo(-50, H + 60); a.closePath(); ctx.clip(a); left(); ctx.restore();
  ctx.save(); const b = new Path2D(); b.moveTo(W + 50, -60); pts.forEach(p => b.lineTo(...p)); b.lineTo(W + 50, H + 60); b.closePath(); ctx.clip(b); right(); ctx.restore();
  ctx.save(); ctx.shadowColor = PW.gold; ctx.shadowBlur = 26; ctx.strokeStyle = PW.gold; ctx.lineWidth = 5; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke(); ctx.restore();
}
function redRoom(t, z = 1) { fullFill(grad(0, H, '#2A0507', '#070103')); glow(W / 2, 700, 700, '#8E1B1B', 0.45); dust(t, 30, [0, 200, W, 900], '255,150,120', 31); }
function blueRoom(t) { fullFill(grad(0, H, '#03101F', '#010407')); glow(W / 2, 1400, 800, '#1E6F78', 0.35); starsT(t, 60, 1900, 17); }

// ===================== scenes
DRAW.sc1 = (t, d) => { // hook: top = feared boss (red), bottom = boss nobody wants to lose (blue/gold)
  const u = lt('h1'); const z = lerp(1, 1.06, ease(t / d)); const kTop = seg(u, wt('h1', 6) - 0.2, wt('h1', 6) + 0.3), kBot = seg(u, wt('h1', 11) - 0.2, wt('h1', 11) + 0.3);
  splitTB(980, 50, () => { redRoom(t); withT(W / 2, 560, z, 0, () => { withT(-W / 2, -560, 1, 0, () => {
      P(rr(330, 360, 420, 560, [40, 40, 0, 0]), '#120306', 'rgba(255,90,70,0.4)', 4); person(540, 900, 1.25, { col: '#050102', rim: PW.red, rimA: 0.9 }); glow(540, 420, 160, '#FF4A3A', 0.35 * (1 + kTop));
      [[150, 1000, -1], [280, 1040, -1], [800, 1040, 1], [930, 1000, 1]].forEach(([x, y, f], i) => withT(x, y, 0.55, 0, () => { ctx.rotate(0.25 * f * -1 + Math.sin(t * 9 + i) * 0.02 * kTop); person(0, 0, 1, { f: -f, col: '#040102', rim: 'rgba(255,120,100,0.5)' }); })); }); });
    nameTagP('FEARED', W / 2, 220, kTop, '#FF7A6A'); },
  () => { blueRoom(t); withT(W / 2, 1500, z, 0, () => { withT(-W / 2, -1500, 1, 0, () => {
      glow(540, 1500, 380, '#F6D27A', 0.35 * (0.5 + kBot)); person(540, 1760, 1.05, { col: '#02060C', rim: PW.gold, rimA: 0.95 });
      [[250, 1790, 1], [380, 1820, 1], [700, 1820, -1], [830, 1790, -1]].forEach(([x, y, f]) => person(x, y, 0.78, { f, col: '#02060C', rim: 'rgba(63,167,168,0.8)' })); }); });
    nameTagP('NEEDED', W / 2, 1180, kBot, PW.gold); });
  bigText('WHO HAS', W / 2, 820, 96, '#FFFFFF', seg(u, 0, 0.25));
  bigText('MORE POWER?', W / 2, 950, 112, PW.gold, seg(u, 0.25, 0.55));
};
DRAW.sc2 = (t, d) => { // two thinkers, centuries apart: candle study (left, red) | moon desert (right, blue)
  const u = lt('n2'); const k = easeOut(seg(t, 0, 0.6));
  splitLR(540, t, () => { redRoom(t); withT(270 + lerp(-40, 0, k), 0, 1, 0, () => { withT(-270, 0, 1, 0, () => {
      glow(170, 1150, 380, '#FF9A40', 0.3 * flick(t)); P(rr(-100, 1240, 700, 700, 0), grad(1240, 1700, '#3E2614', '#0A0604'), null); candleM(150, 1240, t, 1.2); book(330, 1420, 0.9, t); thinker(330, 1250, 0.95, t); }); });
    txt('MIND', 270, 420, 110, '#FF8A7A', 'Montserrat', 900); txt('Machiavelli · 1513', 270, 520, 44, M.parch, 'CrimsonText', 700); },
  () => { blueRoom(t); moon(820, 330, 80, t); dunes(1500, 60, '#071229', 2.3, 'rgba(190,220,255,0.32)'); dunes(1700, 50, '#040A18', 4.1, 'rgba(230,200,140,0.35)');
    whirler(810 + lerp(40, 0, k), 1620, 1.0, t, t * 2.2); lantern(980, 260, 0.8, t, 300);
    txt('HEART', 810, 420, 110, '#8FE0E0', 'Montserrat', 900); txt('Rumi · 1200s', 810, 520, 44, M.parch, 'CrimsonText', 700); });
  chipAt('centuries apart', 700, kin('n2', 2, 0.05, 0.3));
};
DRAW.sc3 = (t, d) => { // feared > loved (scale tips), then "never hated": board turns, pawns rim red
  const u = lt('n3'); const tip = easeOut(seg(u, wt('n3', 5), wt('n3', 7) + 0.4)); const hate = seg(u, wt('n3', 15) - 0.15, wt('n3', 15) + 0.3);
  floorSet(t, d, { dawn: 0.15, cam: { zoom: lerp(1.02, 1.1, ease(t / d)), px: 0, py: 0, cy: 1150 }, seed: 9,
    mid: [{ z: 0.5, draw: () => {
      scale(W / 2, 1080, 1.05, lerp(0, 0.28, tip) * (1 - hate * 0.6), t, () => txt('FEARED', 0, -10, 52, '#FF8A7A', 'Montserrat', 900), () => txt('LOVED', 0, -10, 52, '#FFE0C0', 'Montserrat', 900));
      [[-380, 1640], [380, 1640], [-230, 1760], [230, 1760]].forEach(([dx, y], i) => chessPiece('pawn', W / 2 + dx, y, 1.15, '#060407', hate > 0 ? '#FF3A2A' : M.gold, 0.4 + 0.5 * hate));
      glow(W / 2, 1560, 220, hate ? '#FF2A1A' : M.gold2, 0.3 + 0.3 * hate); chessPiece('king', W / 2, 1720, 1.35, '#120407', M.gold2, 1);
    } }] });
  chipAt('in essence · The Prince, Ch. 17', 300, kin('n3', 0, 0.1, 0.3));
  stampP('NEVER HATED', W / 2, 520, hate, '#FF4A3A', -0.06, 100);
  if (hate > 0) flash(u - wt('n3', 15) + 0.15, '255,40,20', 0.3, 0.35);
};
DRAW.sc4 = (t, d) => { // quote card over the night fortress
  fortressSet(t, d, { cam: { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0, cy: 1000 } });
  ctx.fillStyle = 'rgba(4,2,4,0.35)'; ctx.fillRect(0, 0, W, H);
  quoteCard2('q1', 2, 'the best possible fortress is—not to be hated by the people.', ['— The Prince, Ch. 20 (tr. Marriott)'], ['fortress', 'hated', 'people'], { size: 68, cy: 640, in: 0.15 });
};
DRAW.sc5 = (t, d) => { // walls, titles, money... the townsfolk turn away; windows go dark; crack
  const u = lt('n4'); const away = seg(u, wt('n4', 9) - 0.2, wt('n4', 13) + 0.6); const cr = seg(u, wt('n4', 12), wt('n4', 13) + 0.5);
  fortressSet(t, d, { cam: { zoom: lerp(1.08, 1.0, ease(t / d)), px: 0, py: 0, cy: 1150 }, crowd: { k: away }, lit: 1 - 0.85 * away, crack: cr,
    onCastle: () => { [['WALLS', 280, 900, 0], ['TITLES', 540, 690, 1], ['MONEY', 800, 900, 2]].forEach(([s, x, y, i]) => nameTagP(s, x, y, kin('n4', i, 0.05, 0.25) * (1 - 0.6 * away), PW.gold)); } });
  bigText('WANT YOU GONE', W / 2, 400, 92, '#FF8A7A', kin('n4', 11, 0.05, 0.25));
};
DRAW.sc6 = (t, d) => { // Rumi looks inside the walls: push through the gate into the moonlit hall
  const u = lt('n5'); const inK = easeInOutQ(seg(t, 0.2, 1.6));
  if (inK < 1) { alpha(1 - seg(inK, 0.75, 1), () => fortressSet(t, d, { cam: { zoom: lerp(1.0, 4.2, inK), px: 0, py: 0, cy: 1100, fx: 0 }, lit: 0.6 })); }
  if (inK > 0.7) alpha(seg(inK, 0.7, 1), () => hallSet(t, d, { cam: { zoom: lerp(1.12, 1.02, ease(t / d)), px: 0, py: 0, cy: 1100 }, lion: seg(u, wt('n5', 9), wt('n5', 11) + 0.5) }));
  chipAt('in essence · Masnavi, Book I', 300, kin('n5', 0, 0.1, 0.3), PW.blue);
  bigText('THE BATTLE', W / 2, 470, 100, '#FFFFFF', kin('n5', 10, 0.05, 0.25));
  bigText('WITHIN', W / 2, 590, 110, '#8FE0E0', kin('n5', 11, 0.05, 0.25));
};
function easeInOutQ(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
DRAW.sc7 = (t, d) => { // quote card over the hall, lion shadow fully formed
  hallSet(t + 3, d, { cam: { zoom: lerp(1.04, 1.1, ease(t / d)), px: 0, py: 0, cy: 1150 }, lion: 1 });
  ctx.fillStyle = 'rgba(2,6,12,0.3)'; ctx.fillRect(0, 0, W, H);
  quoteCard2('q2', 2, 'the (true) lion is he that breaks (conquers) himself.', ['— Masnavi, Book I (tr. Nicholson)'], ['lion', 'breaks', 'himself'], { size: 70, cy: 640, in: 0.15 });
};
DRAW.sc8 = (t, d) => { // captain shoves the referee, red card
  const u = lt('n6'); const shove = easeOut(seg(u, wt('n6', 12) - 0.1, wt('n6', 13) + 0.2)); const card = seg(u, wt('n6', 15) - 0.1, wt('n6', 16) + 0.1); const fin = seg(u, wt('n6', 17) - 0.1, wt('n6', 17) + 0.4);
  pitchSet(t, d, { cam: { zoom: lerp(1.0, 1.14, ease(t / d)), px: 0, py: 0, cy: 1350 }, dim: fin * 0.7,
    mid: [{ z: 0.6, draw: () => {
      alpha(0.4, () => { P(ell(420, 1780, 120, 22), '#000', null); P(ell(700, 1790, 120, 22), '#000', null); });
      player(420 + shove * 40, 1780, 1.05, { f: 1, band: true, rim: card > 0 ? '#FF6A5A' : 'rgba(246,210,122,0.9)' });
      withT(720 + shove * 70, 1790, 1, -0.18 * shove, () => player(0, 0, 0.98, { f: -1, col: '#0A0A0A', rim: 'rgba(230,240,255,0.8)' }));
      if (card > 0) { withT(760, 1360, 1, 0, () => { ctx.strokeStyle = '#0A0A0A'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-20, 80); ctx.lineTo(0, -40 * card); ctx.stroke(); }); redCard(760, 1250, 1.1, card); }
      if (shove > 0 && shove < 1) withT(570, 1500, 1, 0, () => alpha(1 - shove, () => { for (let i = 0; i < 6; i++) line(Math.cos(i) * 40, Math.sin(i) * 40, Math.cos(i) * 110, Math.sin(i) * 110, '#FFF', 6); }));
    } }] });
  nameTagP('CAPTAIN', 300, 1150, kin('n6', 1, 0.05, 0.25) * (1 - card));
  bigText('RED CARD', W / 2, 420, 120, '#FF4A3A', card);
  bigText('THE FINAL... WITHOUT HIM', W / 2, 560, 64, '#FFFFFF', fin);
};
DRAW.sc9 = (t, d) => { // alone on the bench; his own shadow is the beast with red eyes
  const u = lt('n7'); const k2 = seg(u, wt('n7', 3) - 0.1, wt('n7', 3) + 0.4);
  pitchSet(t + 5, d, { cam: { zoom: lerp(1.1, 1.18, ease(t / d)), px: 0, py: 0, cy: 1500 }, dim: 0.8,
    mid: [{ z: 0.55, draw: () => {
      alpha(0.9 * k2, () => { ctx.save(); ctx.filter = 'blur(2px)'; withT(560, 1700, 1, 0, () => { ctx.transform(1, 0, -0.5, 0.55, 0, 0); lion(0, 0, 1.25, t, { rim: '#FF3A2A', rimA: 0.9, eye: 1 }); }); ctx.restore(); });
      P(rr(220, 1640, 640, 24, 6), '#1A1E26', null); P(rr(250, 1664, 18, 90, 4), '#10141A', null); P(rr(810, 1664, 18, 90, 4), '#10141A', null);
      player(480, 1660, 1.05, { f: 1, band: true, rim: 'rgba(255,120,100,0.75)' });
      glow(480, 1500, 300, '#DDEEFF', 0.12); } }] });
  bigText('NOBODY BEAT HIM.', W / 2, 420, 84, '#FFFFFF', kin('n7', 0, 0.05, 0.25));
  bigText('HIS TEMPER DID.', W / 2, 560, 96, '#FF5A4A', k2);
};
DRAW.sc10 = (t, d) => { // verdict: walls (top, red) + gate inside (bottom, blue) merge into one; "it starts inside"
  const u = lt('n8'); const kW = kin('n8', 3, 0.05, 0.3), kG = kin('n8', 7, 0.05, 0.3); const both = seg(u, wt('n8', 11) - 0.1, wt('n8', 12) + 0.4); const ins = kin('n8', 15, 0.05, 0.3);
  const seam = lerp(960, 960, both), tilt = lerp(60, 0, both);
  splitTB(seam, tilt, () => { fortressSet(t, d, { cam: { zoom: 1.05, px: 0, py: 0, cy: 700, fx: 0 }, lit: 1 }); },
    () => { withT(0, 0, 1, 0, () => { blueRoom(t); const gk = 0.4 + 0.6 * Math.max(kG, ins);
      withT(W / 2, 1640, 1, 0, () => { glow(0, -200, 420 * gk, '#F6D27A', 0.45 * gk); const g = new Path2D(); g.moveTo(-170, 0); g.lineTo(-170, -260); g.arc(0, -260, 170, Math.PI, 0); g.lineTo(170, 0); g.closePath();
        P(g, `rgba(246,210,122,${0.25 + 0.5 * gk})`, '#0A1420', 18); person(0, 0, 0.9, { col: '#020408', rim: PW.gold, rimA: 0.9 }); }); }); });
  nameTagP('WALLS · Machiavelli', W / 2, 250, kW, '#FF8A7A');
  nameTagP('GATE INSIDE · Rumi', W / 2, 1120, kG, '#8FE0E0');
  const pill = Math.max(both, ins); if (pill > 0) alpha(pill, () => P(rr(60, 880, W - 120, 160, 80), 'rgba(6,4,10,0.85)', PW.gold, 4));
  if (both > 0) alpha(both * (1 - ins), () => bigText('REAL POWER = BOTH', W / 2, 960, 80, PW.gold, 1));
  bigText('IT STARTS INSIDE', W / 2, 960, 86, PW.gold, ins);
};
DRAW.sc11 = (t, d) => { // today: urges pop (SNAP / QUIT / SCROLL), struck out; calm breath ring
  const u = lt('n9'); const cam = camAt(t, d, 1.02, 1.1, 14); const obey = kin('n9', 12, 0.05, 0.3); const once = kin('n9', 13, 0.05, 0.3);
  layers([
    { z: 0.02, draw: () => { blueRoom(t); moon(800, 360, 70, t); } },
    { z: 0.4, draw: () => { P(rr(-200, 1500, W + 400, 700, 0), grad(1500, 1900, '#0A1828', '#020509'), null); person(W / 2, 1660, 1.2, { sit: true, col: '#020408', rim: '#9FD0E0', rimA: 0.85 });
      const br = 0.5 + 0.5 * Math.sin(t * 1.6); withT(W / 2, 1380, 1, 0, () => { ctx.strokeStyle = `rgba(246,210,122,${0.25 + 0.35 * br})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 210 + 40 * br, 0, 6.283); ctx.stroke(); }); } },
    { z: 0.7, draw: () => { [['SNAP', 260, 820, 5, '#FF6A5A'], ['QUIT', 540, 700, 7, '#FFB060'], ['SCROLL', 820, 820, 9, '#8FB8FF']].forEach(([s, x, y, wi, col], i) => {
        const k = kin('n9', wi, 0.05, 0.3); if (k <= 0) return; withT(x, y + Math.sin(t * 2 + i) * 8, back(k), 0, () => { ctx.font = '900 64px Montserrat'; const w = ctx.measureText(s).width + 60;
          P(rr(-w / 2, -50, w, 100, 50), 'rgba(6,8,14,0.82)', col, 5); txt(s, 0, 4, 64, col, 'Montserrat', 900);
          if (obey > 0) { ctx.save(); ctx.strokeStyle = PW.gold; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w / 2 - 10, 0); ctx.lineTo(-w / 2 - 10 + (w + 20) * obey, 0); ctx.stroke(); ctx.restore(); } }); }); } },
  ], cam);
  chipAt('today', 300, kin('n9', 0, 0.1, 0.3));
  bigText('CATCH ONE URGE', W / 2, 460, 92, '#FFFFFF', kin('n9', 1, 0.05, 0.25));
  bigText("DON'T OBEY IT.", W / 2, 1060, 84, PW.gold, once);
};
DRAW.sc12 = (t, d) => { // comment question: OUTSIDE (red, fortress) vs INSIDE (blue, lion shadow)
  const u = lt('n10');
  splitTB(960, 40, () => fortressSet(t + 8, d, { cam: { zoom: 1.0, px: 0, py: 0, cy: 700 }, lit: 0.9 }),
    () => { withT(0, 0, 1, 0, () => hallSet(t + 8, d, { cam: { zoom: 1.0, px: 0, py: 0, cy: 1500 }, lion: 1, fx: 520 })); });
  bigText('OUTSIDE', W / 2, 560, 120, '#FF8A7A', kin('n10', 6, 0.05, 0.25));
  bigText('INSIDE?', W / 2, 1150, 120, '#8FE0E0', kin('n10', 8, 0.05, 0.25));
  const kc = back(seg(u, wt('n10', 9) - 0.05, wt('n10', 9) + 0.35)); if (kc > 0) withT(W / 2 + 280, 960, kc, 0, () => { const b = new Path2D(); b.roundRect(-110, -70, 220, 130, 30); b.moveTo(-30, 60); b.lineTo(-60, 105); b.lineTo(10, 60); P(b, '#F6F2E8', '#111', 4); for (let i = -1; i <= 1; i++) P(circ(i * 48, -5, 13), '#222', null); });
};
DRAW.sc13 = (t, d) => { // end card: gold lion under the moon
  layers([{ z: 0.02, draw: () => { nightSky(t, { mx: 830, my: 300, mr: 80 }); } },
    { z: 0.4, draw: () => { dunes(1600, 50, '#040A18', 4.1, 'rgba(230,200,140,0.35)'); lion(500, 1780, 0.85, t, { rim: PW.gold, rimA: 0.95, eye: 0.6 }); } }], { zoom: lerp(1, 1.05, t / d), px: 0, py: 0, cy: 1000 });
  ctx.fillStyle = 'rgba(3,3,8,0.5)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0, 0.4)); const L = document.getElementById('logo');
  withT(W / 2, 640, lerp(0.8, 1, k), 0, () => alpha(k, () => { glow(0, 0, 320, M.gold, 0.4); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -135, -135, 270, 270); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.strokeStyle = M.gold2; ctx.lineWidth = 7; ctx.stroke(); }));
  bigText('Follow Awazzzz', W / 2, 900, 104, '#FFFFFF', seg(t, 0.1, 0.4));
  bigText('MINDSET', W / 2, 1030, 66, M.gold2, seg(t, 0.3, 0.6), 'Oswald', 700);
  alpha(seg(t, 0.5, 0.8), () => txt('be the true lion', W / 2, 1120, 52, M.parch, 'CrimsonText', 600));
  const pulse = 1 + 0.04 * Math.sin(t * 6); withT(W / 2, 1240, back(seg(t, 0.6, 0.9)) * pulse, 0, () => { P(rr(-200, -50, 400, 100, 50), '#E62117', '#111', 4); txt('SUBSCRIBE', 0, 4, 52, '#fff', 'Oswald', 700); });
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
  splitTB(980, 50, () => fortressSet(2, 4, { cam: { zoom: 1.0, px: 0, py: 0, cy: 900 }, lit: 1 }), () => hallSet(2, 4, { cam: { zoom: 1.0, px: 0, py: 0, cy: 1500 }, lion: 1, fx: 520 }));
  vign(0.5);
  withT(W / 2, 250, 1, 0, () => { ctx.font = '700 50px Oswald'; const s = 'MACHIAVELLI  vs  RUMI'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -42, w, 84, 42), 'rgba(10,6,10,0.88)', M.gold2, 4); txt(s, 0, 3, 50, '#FFF3D6', 'Oswald', 700); });
  bigText('REAL', W / 2, 820, 170, '#FFFFFF', 1);
  bigText('POWER?', W / 2, 1000, 170, M.gold2, 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
  bigText('Fortress or Lion', W / 2, 1180, 66, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
