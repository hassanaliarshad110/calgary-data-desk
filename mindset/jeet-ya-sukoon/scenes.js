// ================= SCENES — "Win or Peace?" (Mind vs Heart) =================
const DRAW = {};
function S(id) { return SCENES.find(s => s.id === id); }
const BL = { acc: '#145566', ice: '#9AD6D6' };

// ---- small props for this episode
function trophy(x, y, s, t) {
  withT(x, y, s, 0, () => {
    glow(0, -90, 220, M.gold2, 0.4);
    const g = ctx.createLinearGradient(-90, -200, 90, 0); g.addColorStop(0, '#FFE9A8'); g.addColorStop(0.5, '#D9A033'); g.addColorStop(1, '#7A4A10');
    const cup = new Path2D(); cup.moveTo(-80, -210); cup.lineTo(80, -210); cup.bezierCurveTo(80, -120, 40, -80, 14, -70); cup.lineTo(14, -30); cup.lineTo(50, -12); cup.lineTo(50, 0); cup.lineTo(-50, 0); cup.lineTo(-50, -12); cup.lineTo(-14, -30); cup.lineTo(-14, -70); cup.bezierCurveTo(-40, -80, -80, -120, -80, -210); cup.closePath();
    P(cup, g, '#3A2208', 4);
    ctx.lineWidth = 12; ctx.strokeStyle = '#C08A2A'; ctx.beginPath(); ctx.arc(-84, -160, 34, 1.2, 4.6); ctx.stroke(); ctx.beginPath(); ctx.arc(84, -160, 34, -1.45, 1.95); ctx.stroke();
    const sw = ((t * 0.5) % 1.6) - 0.3; ctx.save(); ctx.clip(cup); alpha(0.4, () => beam(-90 + sw * 200, -220, 24, -60 + sw * 200, 0, 24, '255,255,255', 0.9)); ctx.restore();
  });
}
function wallClock(x, y, r, t, speed = 1) {
  withT(x, y, 1, 0, () => { glow(0, 0, r * 2.2, '#8AA8D8', 0.18); P(circ(0, 0, r), '#0E1420', '#3A4660', 6);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; line(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78, Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9, 'rgba(200,215,240,0.7)', 4); }
    const a1 = t * speed * 2.2 - 1.57, a2 = t * speed * 0.18 - 0.6; line(0, 0, Math.cos(a2) * r * 0.5, Math.sin(a2) * r * 0.5, '#C8D4EA', 7); line(0, 0, Math.cos(a1) * r * 0.75, Math.sin(a1) * r * 0.75, '#E2B04A', 4); P(circ(0, 0, 7), '#E2B04A', null); });
}
function confetti(t, k, n = 70) { if (k <= 0) return; for (let i = 0; i < n; i++) { const x = rnd(i * 3.1) * W, sp = 160 + rnd(i * 5.3) * 220, y = ((rnd(i * 7.7) * 1400 + t * sp) % 1500) + 100;
  const c = ['#F6D27A', '#E2B04A', '#FFF3D6', '#C0392B'][i % 4]; withT(x + Math.sin(t * 2 + i) * 30, y, 1, t * 3 + i, () => alpha(k * 0.85, () => P(rr(-7, -3, 14, 6, 2), c, null))); } }

// ---- the two worlds: RED (Machiavelli: candle, chessboard, crown) and BLUE (Rumi: moon, dunes, whirler, lantern)
function redWorld(t, cam, o = {}) {
  const cx = o.cx ?? W * 0.25, lit = o.lit ?? 1;
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#2A0909', '#060304')); glow(cx, 900, 560, '#C0392B', 0.3 * lit); ctx.save(); ctx.translate(-260, 0); ctx.scale(0.9, 0.9); florenceSkyline(1260 / 0.9, '#120607'); ctx.restore(); } },
    { z: 0.25, draw: () => { alpha(0.9, () => board(cx, 1150, 1700, 8, t, o.spot || null, 760)); } },
    { z: 0.55, draw: () => { glow(cx, 860, 320, M.gold, 0.32 * lit);
      if (o.crown !== 0) crown(cx, 820 + Math.sin(t * 1.3) * 10, o.crownS || 0.95, t);
      chessPiece('king', cx + 150, 1235, 1.25, '#0B0A0E', M.gold, 0.85 * lit); chessPiece('pawn', cx - 160, 1225, 1.0, '#0B0A0E', M.gold, 0.7 * lit);
      if (o.thinker) thinker(cx - 70, 1240, 0.75, t);
      candleM(cx - 240, 1400, t, 1.0, 80); o.mid && o.mid(); } },
    { z: 1.1, blur: 6, draw: () => chessPiece('pawn', cx - 230, 1950, 2.0, '#030203', M.gold, 0.25) },
  ], cam);
  dust(t, 40, [cx - 270, 400, 540, 1000], '255,200,150', 4);
}
function blueWorld(t, cam, o = {}) {
  const cx = o.cx ?? W * 0.75, lit = o.lit ?? 1;
  layers([
    { z: 0.02, draw: () => nightSky(t, { mx: cx + 90, my: o.my ?? 230, mr: 70, seed: 5 }) },
    { z: 0.18, haze: 0.05, draw: () => dunes(1180, 60, '#0A1A34', 1.0, 'rgba(160,200,240,0.28)') },
    { z: 0.34, draw: () => { dunes(1330, 80, '#071229', 2.3, 'rgba(190,220,255,0.32)'); } },
    { z: 0.6, draw: () => { glow(cx, 1000, 330, R.teal2, 0.28 * lit);
      if (o.flute) fluteFigure(cx - 40, 1300, 0.78, t); else whirler(cx, 1300, 0.72, t, t * 2.0);
      lantern(cx + 175, 660, 0.7, t, 320); o.mid && o.mid(); } },
    { z: 0.75, draw: () => { dunes(1560, 60, '#040A18', 4.1, 'rgba(230,200,140,0.3)'); } },
    { z: 1.1, blur: 7, draw: () => { for (let i = 0; i < 4; i++) reedStalk(cx + 150 + i * 30, 2010, 380 + rnd(i + 9) * 180, t, i + 9, '#020408', 'rgba(63,167,168,0.25)'); } },
  ], cam);
  dust(t, 40, [cx - 270, 400, 540, 1000], '190,215,255', 6);
}
// split screen: left red, right blue; split = x of the divider; dimL/dimR darken a side
function split(t, d, o = {}) {
  const sx = o.sx ?? W / 2; const cam = o.cam || camAt(t, d, 1.0, 1.07, 14);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, sx, H); ctx.clip(); redWorld(t, cam, o.red || {}); if (o.dimL) { ctx.fillStyle = `rgba(4,2,4,${o.dimL})`; ctx.fillRect(0, 0, W, H); } ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(sx, 0, W - sx, H); ctx.clip(); blueWorld(t, cam, o.blue || {}); if (o.dimR) { ctx.fillStyle = `rgba(2,3,8,${o.dimR})`; ctx.fillRect(0, 0, W, H); } ctx.restore();
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(246,210,122,0)'); g.addColorStop(0.5, 'rgba(246,210,122,0.95)'); g.addColorStop(1, 'rgba(246,210,122,0)');
  glow(sx, H / 2, 300, M.gold, 0.18); ctx.fillStyle = g; ctx.fillRect(sx - 3, 0, 6, H);
}
function chip(s, x, y, size, col, border, bg = 'rgba(8,6,10,0.72)', font = 'Oswald', wt = 700) {
  ctx.font = `${wt} ${size}px ${font}`; const w = ctx.measureText(s).width + size * 1.1; P(rr(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8), bg, border, 3); txt(s, x, y + 2, size, col, font, wt);
}
function orBadge(x, y, k) { if (k <= 0) return; withT(x, y, back(k), 0, () => { P(circ(0, 0, 66), '#0A0608', M.gold, 4); txt('OR', 0, 4, 54, M.gold2, 'Oswald', 700); }); }

// ---- sc1 HOOK: split screen, WIN… or PEACE?
DRAW.sc1 = (t, d) => {
  const u = lt('h1'), w = LINES.h1.words;
  const kW = seg(u, w[4][0] - 0.1, w[4][0] + 0.2), kP = seg(u, w[9][0] - 0.15, w[9][0] + 0.15);
  split(t, d, { cam: { zoom: lerp(1.12, 1.0, easeOut(t / d)), px: 0, py: 0 }, dimR: 0.45 * (1 - kP), dimL: 0.25 * kP * 0 });
  glow(W * 0.25, 520, 300, M.gold, 0.3 * kW); glow(W * 0.75, 720, 300, R.teal2, 0.35 * kP);
  bigText('WIN…', W * 0.29, 500, 160, M.gold2, kW);
  orBadge(W / 2, 640, seg(u, w[5][0] - 0.05, w[5][0] + 0.2));
  bigText('PEACE?', W * 0.70, 790, 110, '#FFFFFF', kP);
  flash(u - w[4][0], '255,200,120', 0.25, 0.3); flash(u - w[9][0], '150,220,230', 0.25, 0.25);
};
// ---- sc2 two great minds: Machiavelli writing (red) | Rumi with the reed flute (blue)
DRAW.sc2 = (t, d) => {
  const u = lt('n2'), w = LINES.n2.words; const kL = seg(u, -0.1, 0.4), kR = seg(u, w[1][0] - 0.1, w[1][0] + 0.4);
  split(t, d, { cam: { zoom: lerp(1.0, 1.08, ease(t / d)), px: lerp(10, -10, ease(t / d)), py: 0 }, red: { thinker: 1, crown: 0 }, blue: { flute: 1 }, dimL: 0.4 * (1 - kL), dimR: 0.4 * (1 - kR) });
  alpha(kL, () => { chip('MACHIAVELLI', W * 0.25, 470, 48, '#FFF3D6', M.red2, 'rgba(110,14,14,0.85)'); txt('The Prince · c. 1513', W * 0.25, 560, 40, M.parch, 'CrimsonText', 600); });
  alpha(kR, () => { chip('RUMI', W * 0.73, 470, 48, '#E8FFFF', R.teal2, 'rgba(10,40,60,0.85)'); txt('Masnavi · 13th century', W * 0.73, 560, 40, '#CFE6F0', 'CrimsonText', 600); });
  orBadge(W / 2, 760, seg(u, w[3][0] - 0.05, w[3][0] + 0.25));
};
// ---- sc3 Leo waits for the boss to notice him… and loses the promotion
DRAW.sc3 = (t, d) => {
  const u = lt('n3'), w = LINES.n3.words;
  const wait = seg(u, w[3][0] - 0.2, w[9][0] + 0.4), lose = easeOut(seg(u, w[11][0] - 0.1, w[13][0] + 0.4)), enter = easeOut(seg(u, w[10][0] - 0.2, w[11][0] + 0.3));
  office(t, d, { dawn: 0.2, cold: 0.5 + 0.4 * lose, cam: { zoom: lerp(1.0, 1.07, ease(t / d)), px: lerp(-18, 18, ease(t / d)), py: 0 },
    mid: [{ z: 0.4, draw: () => { wallClock(210, 480, 85, t, 1 + 6 * wait); } },
      { z: 0.62, draw: () => {
        glow(330, 1000, 260, lose > 0.5 ? '#6A8AC0' : '#FFC27A', 0.3);
        person(330, 1300, 1.12, { sit: 1, rim: lerpC('#F6D27A', '#6A8AC0', lose), rimA: 0.9 - 0.3 * lose });
        if (enter > 0) { glow(820, 950, 320, '#FFC27A', 0.35 * enter); person(lerp(1250, 830, enter), 1300, 1.02, { f: -1, rim: M.gold2, rimA: 0.9 }); }
        const cx = lerp(560, 830, lose), cy = lerp(800 + Math.sin(t * 1.6) * 12, 760, lose); crown(cx, cy, lerp(0.62, 0.5, lose), t);
      } }] });
  if (wait > 0 && lose < 0.5) bigText('WAITING…', W / 2 + 40, 300, 90, '#CFE0FF', seg(u, w[3][0] - 0.05, w[3][0] + 0.25) * (1 - seg(u, w[10][0] - 0.2, w[10][0])));
  if (lose > 0) bigText('PROMOTION LOST', W / 2 + 20, 300, 74, M.red2, seg(u, w[13][0] - 0.1, w[13][0] + 0.2));
};
// ---- sc4 quote card 1 — The Prince, Ch. 17
DRAW.sc4 = (t, d) => {
  const u = lt('q1'), w = LINES.q1.words;
  study(t, d, { dawn: 0.45, cam: { zoom: lerp(1.0, 1.1, ease(t / d)), px: lerp(25, -20, ease(t / d)), py: 0 }, candleX: 200,
    pre: [{ z: 0.5, draw: () => thinker(520, 1192, 1.05, t) }],
    desk: () => { P(poly([620, 1138, 880, 1138, 900, 1180, 600, 1180]), M.parch, null); chessPiece('king', 930, 1150, 0.7, '#0B0A0E', M.gold, 0.9); } });
  const dim = seg(u, w[2][0] - 0.5, w[2][0]); if (dim > 0) { ctx.fillStyle = `rgba(5,3,6,${0.5 * dim})`; ctx.fillRect(0, 0, W, H); }
  quoteCard('q1', 2, 'A wise prince should establish himself on that which is in his own control and not in that of others.', '— The Prince, Ch. 17 (tr. W. K. Marriott)', ['own', 'control'], { cy: 640, size: 64 });
};
// ---- sc5 Sara wins everything… and still feels homesick inside
DRAW.sc5 = (t, d) => {
  const u = lt('n4'), w = LINES.n4.words;
  const win = easeOut(seg(u, w[4][0] - 0.2, w[5][0] + 0.3)), cold = ease(seg(u, w[7][0] - 0.2, w[9][0] + 0.4));
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, lerpC('#1E0E0A', '#040A18', cold), lerpC('#060304', '#02040A', cold)));
      alpha(1 - cold, () => { beam(W / 2, -50, 120, W / 2, 1400, 900, '255,220,150', 0.22); glow(W / 2, 1100, 600, '#FFB45A', 0.25 * win); });
      alpha(cold, () => { starsT(t, 90, 900, 9); moon(820, 330, 60, t); }); } },
    { z: 0.3, draw: () => { // stage back wall with soft bokeh lights
      for (let i = 0; i < 14; i++) glow(rnd(i * 4.2) * W, 500 + rnd(i * 2.7) * 500, 50 + rnd(i) * 40, cold > 0.5 ? '#3A6A9A' : '#FFB45A', 0.25 * (0.4 + 0.6 * win) * (1 - 0.6 * cold)); } },
    { z: 0.6, draw: () => {
      P(poly([-200, 1330, W + 200, 1330, W + 400, 2000, -400, 2000]), grad(1330, 1950, lerpC('#2A1A12', '#0A1424', cold), '#050304'), null); line(-200, 1332, W + 200, 1332, cold > 0.5 ? 'rgba(150,200,240,0.4)' : 'rgba(255,200,140,0.45)', 3);
      glow(W / 2, 950, 330, cold > 0.5 ? '#3FA7A8' : '#FFC27A', 0.35);
      person(W / 2 - 30, 1340, 1.12, { hair: 1, rim: lerpC('#F6D27A', '#3FA7A8', cold), rimA: 0.95 });
      trophy(W / 2 + 120, lerp(1100, 760, win), 0.75 * (0.3 + 0.7 * win), t);
      if (cold > 0) { const hx = W / 2 - 30, hy = 1340 - 290 * 1.12; alpha(cold, () => { glow(hx, hy, 140, '#3FA7A8', 0.6); heart(hx, hy, 0.42, '#2A5A7A', 0.2); house(hx, hy + 60, 0.35, 0.6 + 0.4 * Math.sin(t * 2)); }); }
    } },
    { z: 1.1, blur: 5, draw: () => { for (let i = 0; i < 9; i++) { const x = 40 + i * 130, y = 1880 + (i % 2) * 30; P(ell(x, y - 120, 52, 62), '#020203', null); P(rr(x - 90, y - 70, 180, 260, 70), '#020203', null); } } },
  ], { zoom: lerp(1.0, 1.08, ease(t / d)), px: lerp(-12, 12, ease(t / d)), py: 0 });
  confetti(t, win * (1 - cold));
  dust(t, 40, [0, 300, W, 1000], cold > 0.5 ? '190,215,255' : '255,220,170', 8);
  if (win > 0) bigText('WINS EVERYTHING', W / 2, 330, 86, M.gold2, seg(u, w[4][0] - 0.05, w[4][0] + 0.2) * (1 - seg(u, w[8][0], w[9][0])));
  if (cold > 0) bigText('…HOMESICK', W / 2, 330, 110, BL.ice, seg(u, w[9][0] - 0.1, w[9][0] + 0.2));
};
// ---- sc6 quote card 2 — Masnavi, Book I (Whinfield): the far home on the night desert
DRAW.sc6 = (t, d) => {
  const u = lt('q2'), w = LINES.q2.words;
  desert(t, d, { cam: { zoom: lerp(1.0, 1.08, ease(t / d)), px: lerp(-20, 20, ease(t / d)), py: 0 }, mx: 800, my: 360, mr: 85,
    far: () => { house(250, 1290, 0.55, 0.9 + 0.1 * Math.sin(t * 2)); },
    mid: [{ z: 0.5, draw: () => { glow(700, 1250, 260, R.teal2, 0.25); person(700, 1470, 0.9, { f: -1, rim: R.teal2, rimA: 0.85 }); } }] });
  const dim = seg(u, w[2][0] - 0.5, w[2][0]); if (dim > 0) { ctx.fillStyle = `rgba(2,4,10,${0.45 * dim})`; ctx.fillRect(0, 0, W, H); }
  quoteCard('q2', 2, 'He who abides far away from his home is ever longing for the day he shall return.', '— Masnavi, Book I (tr. E. H. Whinfield)', ['home', 'longing', 'return'], { cy: 640, size: 66, acc: BL.acc });
};
// ---- sc7 TWIST: but here's the catch → not enemies: the game outside | the home inside
DRAW.sc7 = (t, d) => {
  const u5 = lt('n5'), u = lt('n6'), w = LINES.n6.words;
  const open = easeOut(seg(u, -0.2, 0.5)), kL = seg(u, w[3][0] - 0.2, w[3][0] + 0.4), kR = seg(u, w[8][0] - 0.2, w[8][0] + 0.4);
  const merge = ease(seg(u, w[12][0] + 0.1, w[12][0] + 1.2));
  if (u < -0.05) { // the catch beat
    redWorld(t, { zoom: 1.1 + 0.015 * Math.sin(u5 * 40) * (1 - seg(u5, 0.1, 0.5)), px: 0, py: 0 }, { cx: W / 2, crownS: 1.2 });
    ctx.fillStyle = 'rgba(30,4,4,0.55)'; ctx.fillRect(0, 0, W, H);
    flash(u5, '255,60,40', 0.35, 0.5);
    bigText("BUT HERE'S", W / 2, 420, 110, '#FFFFFF', seg(u5, 0, 0.2));
    bigText('THE CATCH', W / 2, 570, 130, M.red2, seg(u5, LINES.n5.words[3][0] - 0.1, LINES.n5.words[3][0] + 0.15));
    return;
  }
  const sx = lerp(W / 2, W / 2, open);
  split(t, d, { sx, cam: { zoom: lerp(1.05, 1.0, ease(t / d)), px: 0, py: 0 }, red: { lit: 0.4 + 0.6 * kL }, blue: { lit: 0.4 + 0.6 * kR }, dimL: 0.5 * (1 - kL), dimR: 0.5 * (1 - kR) });
  if (u < w[3][0]) bigText('NOT ENEMIES', W / 2, 330, 104, '#FFFFFF', seg(u, w[1][0] - 0.1, w[1][0] + 0.2));
  bigText('GAME', W * 0.25, 470, 110, M.gold2, kL); alpha(kL, () => txt('OUTSIDE', W * 0.25, 575, 54, '#FFE6C0', 'Oswald', 700));
  bigText('HOME', W * 0.73, 470, 110, BL.ice, kR); alpha(kR, () => txt('INSIDE', W * 0.73, 575, 54, '#D6F2F2', 'Oswald', 700));
  if (merge > 0) withT(W / 2, 760, 1, 0, () => alpha(merge, () => { glow(0, 0, 260, M.gold, 0.35); P(circ(0, 0, 92), 'rgba(10,6,8,0.85)', M.gold, 4); txt('BOTH', 0, 4, 52, M.gold2, 'Oswald', 700); }));
};
// ---- sc8 TODAY'S ACTION — dawn that is warm on one side, teal on the other
DRAW.sc8 = (t, d) => {
  const u = lt('n7'), w = LINES.n7.words;
  layers([
    { z: 0.04, draw: () => { const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#3A1410'); g.addColorStop(0.5, '#1A1530'); g.addColorStop(1, '#0A2A34'); fullFill(g);
      const sk = ctx.createLinearGradient(0, 600, 0, 1250); sk.addColorStop(0, 'rgba(0,0,0,0)'); sk.addColorStop(1, 'rgba(247,196,122,0.75)'); ctx.fillStyle = sk; ctx.fillRect(-200, 600, W + 400, 650);
      const sy = lerp(1230, 1080, ease(t / d)); glow(W / 2, sy, 520, '#FFE0A0', 0.8); P(circ(W / 2, sy, 110), '#FFE7B0', null); starsT(t, 50, 500, 12); } },
    { z: 0.25, draw: () => { ctx.save(); ctx.beginPath(); ctx.rect(-200, 0, W / 2 + 200, H); ctx.clip(); ctx.translate(-160, 0); ctx.scale(1.1, 1); florenceSkyline(1250, '#1E0E12'); ctx.restore(); ctx.save(); ctx.beginPath(); ctx.rect(W / 2, 0, W, H); ctx.clip(); dunes(1250, 40, '#061220', 2.0, 'rgba(160,200,240,0.3)'); ctx.restore(); } },
    { z: 0.6, draw: () => { P(rr(-200, 1250, W + 400, 700, 0), grad(1250, 1920, '#140A0C', '#030204'), null); alpha(0.5, () => P(poly([W / 2 - 60, 1252, W / 2 + 60, 1252, W / 2 + 420, 1920, W / 2 - 420, 1920]), grad(1252, 1920, 'rgba(255,200,120,0.55)', 'rgba(255,200,120,0)'), null));
      candleM(250, 1330, t, 1.0, 80); lantern(830, 1050, 0.7, t, 300);
      person(W / 2, 1290, 1.08, { sit: 1, rim: M.gold2, rimA: 0.9, hair: 1 }); } },
  ], { zoom: lerp(1.0, 1.07, ease(t / d)), px: lerp(-15, 15, ease(t / d)), py: 0 });
  dust(t, 50, [0, 500, W, 800], '255,230,180', 17);
  const k = back(seg(u, 0.05, 0.4)); if (k > 0) withT(W / 2, 270, k, 0, () => { P(rr(-250, -48, 500, 96, 48), 'rgba(10,6,8,0.75)', M.gold, 3); txt("TODAY'S ACTION", 0, 3, 52, M.gold2, 'Oswald', 700); });
  const k2 = easeOut(seg(u, w[3][0] - 0.1, w[3][0] + 0.35)); if (k2 > 0) withT(W / 2, 560, 1, 0, () => alpha(k2, () => { P(rr(-420, -200, 840, 400, 20), 'rgba(234,219,184,0.95)', '#5A3A1A', 3);
    txt('Finish ONE thing', 0, -120, 66, '#24170C', 'CrimsonText', 700);
    alpha(seg(u, w[6][0] - 0.1, w[6][0] + 0.3), () => txt('in your control.', 0, -45, 58, M.red, 'CrimsonText', 700));
    alpha(seg(u, w[11][0] - 0.1, w[11][0] + 0.3), () => { line(-300, 15, 300, 15, 'rgba(90,58,26,0.4)', 2); txt('Then 5 quiet minutes', 0, 80, 62, BL.acc, 'CrimsonText', 700); });
    alpha(seg(u, w[14][0] - 0.1, w[14][0] + 0.3), () => txt('— no phone.', 0, 150, 54, '#24170C', 'CrimsonText', 600)); }));
};
// ---- sc9 comment question: WIN or PEACE?
DRAW.sc9 = (t, d) => {
  const u = lt('n8'), w = LINES.n8.words; const kW = back(seg(u, w[0][0] - 0.05, w[0][0] + 0.3)), kP = back(seg(u, w[2][0] - 0.05, w[2][0] + 0.3));
  split(t, d, { cam: { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0 } });
  withT(W * 0.25, 560, kW, 0, () => bigText('WIN', 0, 0, 150, M.gold2, 1));
  withT(W * 0.72, 560, kP, 0, () => bigText('PEACE', 0, 0, 96, BL.ice, 1));
  orBadge(W / 2, 760, seg(u, w[1][0] - 0.05, w[1][0] + 0.2));
  const kc = back(seg(u, w[8][0] - 0.1, w[8][0] + 0.3)); if (kc > 0) withT(W / 2, 330, kc, 0, () => { const b = new Path2D(); b.roundRect(-120, -70, 240, 130, 30); b.moveTo(-30, 60); b.lineTo(-60, 105); b.lineTo(10, 60); P(b, '#F6F2E8', '#111', 4); for (let i = -1; i <= 1; i++) P(circ(i * 55, -5, 14), '#333', null); });
};
// ---- sc10 end card: Follow Awazzzz · Mindset
DRAW.sc10 = (t, d) => {
  split(t, d, { cam: { zoom: 1.1, px: 0, py: 0 } });
  ctx.fillStyle = 'rgba(5,3,6,0.62)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0, 0.4)); const L = document.getElementById('logo');
  withT(W / 2, 640, lerp(0.8, 1, k), 0, () => alpha(k, () => { glow(0, 0, 320, M.gold, 0.4); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -135, -135, 270, 270); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.strokeStyle = M.gold; ctx.lineWidth = 6; ctx.stroke(); }));
  bigText('Follow Awazzzz', W / 2, 900, 104, '#FFFFFF', seg(t, 0.1, 0.4));
  bigText('MINDSET', W / 2, 1030, 66, M.gold2, seg(t, 0.3, 0.6), 'Oswald', 700);
  alpha(seg(t, 0.5, 0.8), () => txt('Machiavelli · Rumi · daily', W / 2, 1120, 44, M.parch, 'CrimsonText', 600));
  const pulse = 1 + 0.04 * Math.sin(t * 6); withT(W / 2, 1240, back(seg(t, 0.6, 0.9)) * pulse, 0, () => { P(rr(-200, -50, 400, 100, 50), '#E62117', '#111', 4); txt('SUBSCRIBE', 0, 4, 52, '#fff', 'Oswald', 700); });
};
function drawFrame(T) {
  GT = T; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, W, H);
  const i = SCENES.findIndex(s => T >= s.start && T < s.start + s.dur); const s = SCENES[i < 0 ? SCENES.length - 1 : i];
  ctx.save(); DRAW[s.id](T - s.start, s.dur); ctx.restore(); ctx.filter = 'none'; ctx.globalAlpha = 1;
  const u = T - s.start; if (u < 0.18 && s.start > 0) { ctx.fillStyle = `rgba(0,0,0,${1 - u / 0.18})`; ctx.fillRect(0, 0, W, H); }
  const nxt = SCENES[SCENES.indexOf(s) + 1]; if (nxt && s.start + s.dur - T < 0.1) { ctx.fillStyle = `rgba(0,0,0,${1 - (s.start + s.dur - T) / 0.1})`; ctx.fillRect(0, 0, W, H); }
  vign(0.6); grain(T);
  if (s.id !== 'sc10') { watermark(T); captions(); }
}
function drawCover() {
  GT = 5; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  split(2, 4, { cam: { zoom: 1.0, px: 0, py: 0 }, red: { crownS: 1.05 } });
  ctx.filter = 'none'; vign(0.5);
  withT(W / 2, 250, 1, 0, () => { chip('MACHIAVELLI  vs  RUMI', 0, 0, 52, '#FFF3D6', M.gold2, 'rgba(10,6,10,0.85)'); });
  bigText('WIN', W * 0.27, 520, 230, M.gold2, 1);
  orBadge(W / 2, 690, 1);
  bigText('PEACE?', W * 0.70, 860, 124, '#FFFFFF', 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(W - 100, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, W - 162, 48, 124, 124); ctx.restore();
  bigText('Mind vs Heart', W / 2, 1520, 76, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
