// ===== "Alone? Two Answers" — Mind vs Heart scene set (Letter to Vettori 1513, tr. Marriott · Masnavi I Prologue, tr. Whinfield)
// New this time: Tuscan night hills with cypresses + farmhouse with one lit window, prison-bar shadows over Florence,
// dusty dusk field, the doorway costume change (peasant cloak falls, court robe glows), ghost "men of old" rising from
// the candlelit desk, an appointment card, a lantern-lit night-market crowd around a reed-flute player (happy / bowed),
// spotlight-alone-in-a-crowd with tear glints, write-it-down | sing-it-out split, modern desk with the phone left in
// the next room + one-hour ring, book-or-flute comment split, end card with candle + flute.
const AW = { red: '#C0392B', blue: '#3FA7A8', gold: '#F6D27A', warm: '#FFB45A', dust: '214,170,110' };
function easeIO(x) { x = clamp(x); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
function tagP(s, x, y, k, col = AW.gold, size = 42) { if (k <= 0) return; alpha(k, () => { ctx.font = `700 ${size}px Oswald`; const w = ctx.measureText(s).width + 46; P(rr(x - w / 2, y - size * 0.76, w, size * 1.52, size * 0.76), 'rgba(8,6,10,0.78)', col, 3); txt(s, x, y + 2, size, col, 'Oswald', 700); }); }
function stampA(s, x, y, k, col, rot = -0.08, size = 104) { if (k <= 0) return; withT(x, y, lerp(1.7, 1, easeOut(k)), rot, () => alpha(clamp(k * 2), () => {
  ctx.font = `900 ${size}px Montserrat`; const w = ctx.measureText(s).width + 70; P(rr(-w / 2, -size * 0.72, w, size * 1.44, 18), 'rgba(8,4,6,0.6)', col, 8); txt(s, 0, 6, size, col, 'Montserrat', 900); })); }

// ---- Tuscan hills at night: cypresses, winding road, farmhouse with a lit study window
function cypress(x, y, h, col = '#05070A', rim = null) { const p = new Path2D(); p.moveTo(x, y - h); p.bezierCurveTo(x + h * 0.11, y - h * 0.7, x + h * 0.12, y - h * 0.2, x + h * 0.05, y); p.lineTo(x - h * 0.05, y); p.bezierCurveTo(x - h * 0.12, y - h * 0.2, x - h * 0.11, y - h * 0.7, x, y - h); P(p, col, null); if (rim) { ctx.save(); ctx.strokeStyle = rim; ctx.lineWidth = 3; ctx.stroke(p); ctx.restore(); } }
function hillPath(y, amp, seed) { const p = new Path2D(); p.moveTo(-400, H + 600); for (let x = -400; x <= W + 400; x += 20) p.lineTo(x, y + amp * Math.sin(x * 0.0035 + seed) + amp * 0.4 * Math.sin(x * 0.009 + seed * 1.7)); p.lineTo(W + 400, H + 600); p.closePath(); return p; }
function farmhouse(x, y, s, lit = 1, t = 0) { withT(x, y, s, 0, () => {
  P(poly([-230, 0, -230, -230, 0, -330, 230, -230, 230, 0]), '#0A0708', null); P(poly([-260, -225, 0, -345, 260, -225, 250, -205, 0, -320, -250, -205]), '#1A0E0A', null);
  P(rr(120, -300, 50, 110, 4), '#0A0708', null);
  const f = flick(t); if (lit > 0) { glow(-90, -130, 260 * f, '#FFB45A', 0.55 * lit); P(rr(-130, -190, 80, 100, [40, 40, 0, 0]), `rgba(255,196,110,${0.95 * lit})`, null); line(-90, -188, -90, -92, '#2A140A', 5); }
  P(rr(60, -110, 60, 110, [30, 30, 0, 0]), '#040304', null);
}); }
function tuscany(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1.0, 1.08, 20); const dusk = o.dusk ?? 0; // 0 night .. 1 dusk orange
  layers([
    { z: 0.02, draw: () => { fullFill(grad(0, 1400, lerpC('#03050E', '#2A1430', dusk), lerpC('#12162A', '#E58A4E', dusk))); starsT(t, Math.round(150 * (1 - dusk)), 900, 23);
      if (dusk < 0.6) moon(830, 360, 70, t); else glow(540, 1120, 600, '#FFB060', 0.4 * dusk);
      if (o.florence) { ctx.save(); ctx.translate(-120, 0); ctx.scale(0.75, 0.75); florenceSkyline(1180 / 0.75, lerpC('#0A0710', '#3A1A20', dusk)); ctx.restore(); } } },
    { z: 0.12, haze: 0.06, draw: () => { P(hillPath(1120, 55, 1.2), lerpC('#0A0E1C', '#3A1E22', dusk), null); for (let i = 0; i < 7; i++) cypress(80 + i * 160 + rnd(i) * 60, 1110 + 40 * Math.sin(i), 120 + rnd(i + 3) * 60, lerpC('#070A14', '#24120E', dusk)); } },
    { z: 0.3, draw: () => { P(hillPath(1300, 80, 3.4), lerpC('#060912', '#24120E', dusk), null);
      if (!o.noHouse) farmhouse(o.hx ?? 700, 1330, o.hs ?? 0.9, o.lit ?? 1, t); [130, 230, 980].forEach((x, i) => cypress(x, 1340 + i * 6, 300 + i * 30, '#04060C', 'rgba(150,180,230,0.18)')); o.onHill && o.onHill(); } },
    ...(o.mid || []),
    { z: 0.62, draw: () => { P(hillPath(1620, 50, 5.1), '#030407', null);
      const road = new Path2D(); road.moveTo(380, H + 300); road.bezierCurveTo(520, 1800, 300, 1700, 560, 1600); road.lineTo(600, 1600); road.bezierCurveTo(380, 1720, 640, 1810, 560, H + 300); road.closePath(); P(road, 'rgba(120,100,80,0.25)', null);
      o.near && o.near(); } },
    { z: 1.12, blur: 7, draw: () => { cypress(40, 2050, 900, '#010203'); cypress(1060, 2080, 760, '#010203'); } },
  ], cam);
  dust(t, 40, [0, 500, W, 1000], dusk > 0.3 ? AW.dust : '190,210,255', 5);
}

// ---- standing Renaissance robe (silhouette only); dusty peasant cloak variant
function robeFig(x, y, s, o = {}) {
  withT(x, y, s, 0, () => { ctx.scale(o.f || 1, 1); const body = o.body || '#06050A';
    const p = new Path2D(); p.moveTo(-30, -372); p.lineTo(30, -372); p.bezierCurveTo(70, -366, 96, -348, 100, -312); p.lineTo(130, 0); p.lineTo(-130, 0); p.lineTo(-100, -312); p.bezierCurveTo(-96, -348, -70, -366, -30, -372); p.closePath(); P(p, body, null);
    if (o.robe) { ctx.save(); ctx.clip(p); P(rr(-140, -380, 280, 400, 0), `rgba(120,16,16,${0.75 * o.robe})`, null); alpha(o.robe, () => { line(-60, -360, -40, 0, 'rgba(246,210,122,0.5)', 4); line(60, -360, 40, 0, 'rgba(246,210,122,0.5)', 4); }); ctx.restore(); }
    P(rr(-17, -400, 34, 40, 6), body, null); P(ell(0, -430, 42, 50), body, null);
    if (o.robe) P(new Path2D('M-52 -440 Q-56 -500 0 -502 Q60 -500 56 -436 Q0 -462 -52 -440 Z'), lerpC('#06050A', '#5A0E0E', o.robe), null);
    if (o.rim) { ctx.save(); ctx.globalAlpha = o.rimA ?? 0.85; ctx.strokeStyle = o.rim; ctx.lineWidth = 5; ctx.translate(3, 0); ctx.stroke(p); ctx.beginPath(); ctx.ellipse(0, -430, 42, 50, 0, -1.4, 1.4); ctx.stroke(); ctx.restore(); }
  }); }
function cloak(x, y, s, fall, t) { if (fall >= 1) return; // dusty brown cloak sliding down and off
  withT(x + fall * 160, y + fall * 260, s, fall * 0.9, () => alpha(1 - seg(fall, 0.7, 1), () => {
    const c = new Path2D(); c.moveTo(-90, -380); c.quadraticCurveTo(0, -410, 90, -380); c.lineTo(150, -40); c.quadraticCurveTo(0, 10, -150, -40); c.closePath();
    P(c, '#4A3420', null); alpha(0.5, () => { for (let i = 0; i < 40; i++) P(circ(-130 + rnd(i) * 260, -360 + rnd(i + 4) * 320, 3 + rnd(i + 8) * 4), '#7A6040', null); });
    ctx.save(); ctx.strokeStyle = 'rgba(214,170,110,0.5)'; ctx.lineWidth = 3; ctx.stroke(c); ctx.restore(); })); }

// ---- ghostly "men of old": translucent busts with rims rising from book light
function ghostBust(x, y, s, k, i, t) { if (k <= 0) return; const bob = Math.sin(t * 1.3 + i) * 8;
  alpha(0.55 * k, () => { glow(x, y - 160 * s, 180 * s, i % 2 ? '#F6D27A' : '#9FD0E0', 0.25); bust(x, y + bob + (1 - k) * 80, s, { col: 'rgba(20,24,34,0.7)', rim: i % 2 ? AW.gold : '#9FD0E0', rimA: 0.9, f: x < W / 2 ? 1 : -1 }); }); }

// ---- candlelit study at night (portrait) — writer at desk + book light
function studyN(t, d, o = {}) {
  study(t, d, { dawn: 0, cam: o.cam || { zoom: lerp(1.0, 1.08, ease(t / d)), px: 0, py: 0, cy: 1200 }, candleX: 230,
    pre: [{ z: 0.4, draw: () => { o.ghosts && o.ghosts(); } }],
    extra: [{ z: 0.7, draw: () => { if (o.writer !== false) thinker(680, 1320, 0.85, t, M.gold2, 0.9); o.desk && o.desk(); } }] });
}

// ---- night market of lanterns: crowd silhouettes around a reed-flute player
function crowdFig(x, y, s, i, t, mood, lit = 0, o = {}) { // mood 1 happy (bob, upright), -1 sad (bowed)
  const bob = mood > 0 ? Math.abs(Math.sin(t * 3.2 + i)) * -14 : 0; const bow = mood < 0 ? 0.16 : -0.03 + Math.sin(t * 3 + i) * 0.03;
  withT(x, y + bob, s, mood < 0 ? bow * 0.3 : 0, () => { person(0, 0, 1, { f: o.f || 1, col: '#02050B', rim: lit > 0 ? `rgba(246,210,122,${0.4 + 0.5 * lit})` : 'rgba(63,167,168,0.55)', rimA: 0.85, hair: i % 3 === 0 }); });
  if (o.tear > 0) { const ty = y - 430 * s + 30 * s + o.tear * 40 * s; alpha(o.tear * (1 - seg(o.tear, 0.85, 1)), () => { glow(x + 18 * s * (o.f || 1), ty, 30, '#BFF4FF', 0.7); P(ell(x + 18 * s * (o.f || 1), ty, 6, 10), '#DFFBFF', null); }); }
}
const CROWD = [[60, 1790, 0.8, 1], [190, 1730, 0.68, -1], [300, 1830, 0.86, 1], [800, 1830, 0.86, -1], [905, 1730, 0.68, 1], [1030, 1790, 0.8, -1], [190, 1600, 0.52, -1], [890, 1600, 0.52, 1], [320, 1560, 0.46, 1], [760, 1560, 0.46, -1]];
function market(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1.0, 1.07, 18); const spot = o.spot || 0;
  layers([
    { z: 0.02, draw: () => { nightSky(t, { mx: 840, my: 330, mr: 70, seed: 41 }); } },
    { z: 0.14, haze: 0.06, draw: () => { // city of domes & arches far off (generic, no religious symbols)
      ctx.fillStyle = '#071226'; ctx.beginPath(); ctx.moveTo(-300, 1250); for (let i = 0; i < 14; i++) { const x = -300 + i * 130, h = 120 + rnd(i + 51) * 140; ctx.lineTo(x, 1250 - h); ctx.lineTo(x + 100, 1250 - h); ctx.lineTo(x + 130, 1250); } ctx.lineTo(W + 300, 1250); ctx.lineTo(W + 300, 1500); ctx.lineTo(-300, 1500); ctx.fill();
      for (let i = 0; i < 18; i++) { const on = rnd(i + 70) > 0.4; if (on) P(rr(-260 + rnd(i + 60) * (W + 400), 1060 + rnd(i + 61) * 150, 12, 18, 3), 'rgba(255,190,110,0.6)', null); } } },
    { z: 0.3, draw: () => { P(rr(-300, 1400, W + 600, 900, 0), grad(1400, 1900, '#0A1626', '#02050A'), null); line(-300, 1402, W + 300, 1402, 'rgba(150,200,255,0.18)', 3);
      // string of lanterns across
      ctx.strokeStyle = '#0E0A06'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-100, 560); ctx.quadraticCurveTo(W / 2, 820, W + 100, 560); ctx.stroke();
      [160, 340, 540, 740, 920].forEach((x, i) => { const yy = 560 + (1 - Math.pow((x - W / 2) / (W / 2 + 100), 2)) * 130; lantern(x, yy + 90, 0.55, t + i, 90); }); } },
    { z: 0.5, draw: () => { CROWD.slice(6).forEach(([x, y, s, m], i) => crowdFig(x, y, s, i + 6, t, m, o.reach ? seg(o.reach, 0.2, 0.6) : 0, { f: x < W / 2 ? 1 : -1, tear: o.tears ? seg(o.tears, 0.1 + i * 0.05, 0.7 + i * 0.05) * (m < 0 ? 1 : 0) : 0 })); } },
    { z: 0.62, draw: () => { // the player in the middle + waves
      if (spot > 0) { beam(W / 2, -100, 120, W / 2, 1820, 560, '200,230,255', 0.16 * spot); glow(W / 2, 1700, 340, '#BFE4FF', 0.22 * spot); }
      const r = o.reach ?? 1; waves(640, 1270, t, -0.5, 5, 200 + 520 * r, 0.55, '246,210,122'); waves(440, 1270, t + 0.4, Math.PI + 0.5, 5, 200 + 520 * r, 0.55, '246,210,122');
      fluteFigure(500, 1740, 0.9, t, M.gold2, 0.9); } },
    { z: 0.78, draw: () => { CROWD.slice(0, 6).forEach(([x, y, s, m], i) => crowdFig(x, y, s, i, t, m, o.reach ? seg(o.reach, 0.2 + i * 0.1, 0.6 + i * 0.1) : 0, { f: x < W / 2 ? 1 : -1, tear: o.tears ? seg(o.tears, i * 0.08, 0.6 + i * 0.08) * (m < 0 ? 1 : 0.7) : 0 }));
      if (spot > 0) { ctx.fillStyle = `rgba(1,3,8,${0.5 * spot})`; ctx.fillRect(-300, 1300, 560, 900); ctx.fillRect(W - 260, 1300, 560, 900); } } },
    { z: 1.12, blur: 7, draw: () => { lantern(60, 300, 1.3, t, 400); lantern(1030, 360, 1.1, t + 2, 400); } },
  ], cam);
  dust(t, 50, [0, 500, W, 1100], '246,210,122', 12);
}

// ---- modern room at night: desk + lamp, open door to the next room with the phone glowing on a shelf
function roomNight(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1.02, 1.1, 16);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#0B0A14', '#030306')); // wall + window w/ city
      const wx = 590, wy = 300, ww = 380, wh = 520; P(rr(wx, wy, ww, wh, 8), grad(wy, wy + wh, '#061230', '#0D2C4C'), '#14121C', 16); ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip(); starsT(t, 30, 700, 9); moon(wx + 280, wy + 120, 40, t); ctx.fillStyle = '#050A16'; for (let i = 0; i < 8; i++) { const h = 90 + rnd(i + 31) * 200; ctx.fillRect(wx + i * 50, wy + wh - h, 46, h); } for (let i = 0; i < 30; i++) if (rnd(i + 90) > 0.5) { ctx.fillStyle = 'rgba(255,200,120,0.6)'; ctx.fillRect(wx + rnd(i + 3) * ww, wy + wh - rnd(i + 7) * 200, 6, 8); } ctx.restore(); line(wx + ww / 2, wy, wx + ww / 2, wy + wh, '#14121C', 8);
      // doorway left with next room
      const dx = 60, dy = 520, dw = 300, dh = 900; P(rr(dx, dy, dw, dh, 4), '#120E18', null); P(rr(dx + 20, dy + 20, dw - 40, dh - 20, 2), grad(dy, dy + dh, '#1A1622', '#07060A'), null);
      P(rr(dx + 40, dy + 520, dw - 80, 18, 3), '#2A2230', null); // shelf
      const ph = o.phone ?? 1; if (ph > 0) { glow(dx + 150, dy + 480, 170, '#7FB8FF', 0.45 * ph); P(rr(dx + 118, dy + 420, 64, 104, 10), '#0A0C14', '#2A3A5A', 3); P(rr(dx + 124, dy + 428, 52, 88, 6), `rgba(120,180,255,${0.75 * ph})`, null); } } },
    { z: 0.35, draw: () => { // desk + lamp
      const dg = grad(1360, 1700, '#2A1A10', '#0A0604'); P(rr(-200, 1360, W + 400, 600, 0), dg, null); line(-200, 1362, W + 200, 1362, 'rgba(255,200,140,0.35)', 3);
      withT(860, 1360, 1, 0, () => { P(rr(-50, -12, 100, 14, 6), '#151018', null); line(0, -12, -60, -260, '#1C1620', 12); line(-60, -260, 40, -330, '#1C1620', 12); withT(40, -330, 1, 0.5, () => { P(poly([-70, 30, 70, 30, 40, -30, -40, -30]), '#2A2230', null); }); glow(60, -200, 420, '#FFC27A', 0.42); beam(60, -300, 80, -40, 0, 600, '255,200,140', 0.12); });
      withT(520, 1440, 1, 0.04, () => { P(rr(-170, -40, 340, 90, 6), '#EADBB8', null); alpha(0.5, () => { for (let i = 0; i < 4; i++) line(-140, -20 + i * 18, -140 + 280 * clamp((o.write ?? 0) * 4 - i), -20 + i * 18, '#3A2A1A', 3); }); }); } },
    { z: 0.55, draw: () => { person(520, 1660, 1.05, { sit: true, col: '#030306', rim: 'rgba(255,200,140,0.8)', rimA: 0.9 }); o.onDesk && o.onDesk(); } },
    { z: 1.1, blur: 6, draw: () => { P(rr(-100, 1800, 520, 300, 30), '#050407', null); P(rr(760, 1780, 500, 300, 30), '#050407', null); } },
  ], cam);
  dust(t, 40, [500, 700, 560, 800], '255,210,160', 15);
}
function hourRing(x, y, r, k, t) { withT(x, y, 1, 0, () => { glow(0, 0, r * 1.6, '#F6D27A', 0.2); ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(246,210,122,0.2)'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.stroke();
  ctx.strokeStyle = AW.gold; ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + 6.283 * k); ctx.stroke(); txt('1 HOUR', 0, 4, r * 0.42, '#FFF3D6', 'Oswald', 700); }); }
function redRoomA(t) { fullFill(grad(0, H, '#2A0507', '#070103')); glow(W / 2, 800, 700, '#8E1B1B', 0.45); dust(t, 30, [0, 200, W, 1200], '255,150,120', 31); }
function blueRoomA(t) { fullFill(grad(0, H, '#03101F', '#010407')); glow(W / 2, 1300, 800, '#1E6F78', 0.35); starsT(t, 60, 1900, 17); }

// ===================== scenes
DRAW.sc1 = (t, d) => { // HOOK: one lit window in the Tuscan night, lone figure on the road
  const u = lt('h1'); const kP = kin('h1', 7, 0.05, 0.35);
  tuscany(t, d, { cam: { zoom: lerp(1.0, 1.12, ease(t / d)), px: 0, py: 0, cy: 1250 }, lit: 1, near: () => { person(540, 1700, 0.55, { f: 1, col: '#020305', rim: 'rgba(255,190,120,0.6)' }); } });
  bigText('FEELING', W / 2, 470, 120, '#FFFFFF', seg(u, 0, 0.25));
  bigText('ALONE?', W / 2, 610, 150, AW.gold, seg(u, 0.25, 0.55));
  if (kP > 0) { alpha(kP, () => { withT(W / 2, 880, lerp(0.7, 1, back(kP)), -0.04, () => { glow(0, 0, 260, '#FFC27A', 0.5); book(0, 40, 0.8, t); }); }); tagP('THE PRINCE · 1513', W / 2, 1010, kP, AW.gold, 46); }
};
DRAW.sc2 = (t, d) => { // 1512: Florence (job lost) → prison bars → pull back to a small farm
  const u = lt('n2'); const kJob = kin('n2', 0, 0.05, 0.3), kPr = seg(u, wt('n2', 6) - 0.1, wt('n2', 6) + 0.25), kFarm = seg(u, wt('n2', 8) - 0.15, wt('n2', 10) + 0.4);
  const prOut = seg(u, wt('n2', 8) - 0.2, wt('n2', 8) + 0.2);
  tuscany(t, d, { florence: true, dusk: 0.35 * (1 - kFarm), lit: kFarm, hs: lerp(0.4, 0.9, easeIO(kFarm)), hx: 720,
    cam: { zoom: lerp(1.35, 1.0, easeIO(kFarm)), px: 0, py: 0, cy: lerp(1100, 1250, kFarm) } });
  if (kPr > 0) alpha(kPr * (1 - prOut), () => { ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, W, H); for (let i = 0; i < 7; i++) { const x = 60 + i * 160; P(rr(x - 18, -50, 36, H + 100, 10), '#050406', null); line(x + 10, -50, x + 10, H + 50, 'rgba(255,150,100,0.25)', 3); } P(rr(-50, 760, W + 100, 34, 6), '#050406', null); });
  tagP('1512 · JOB LOST', W / 2, 360, kJob * (1 - kPr), '#FF8A7A', 50);
  stampA('PRISON', W / 2, 600, kPr * (1 - prOut), '#FF4A3A', -0.06, 120);
  tagP('A SMALL FARM · FAR FROM POWER', W / 2, 360, kFarm * prOut, AW.gold, 44);
  if (kPr > 0 && kPr < 1) flash(u - wt('n2', 6) + 0.1, '255,60,30', 0.25, 0.3);
};
DRAW.sc3 = (t, d) => { // by day: dusty field at dusk, neighbours → evening falls, one window lights
  const u = lt('n3'); const eve = seg(u, wt('n3', 5) - 0.2, wt('n3', 7) + 0.3);
  tuscany(t, d, { dusk: 1 - 0.85 * eve, lit: eve, hx: 760, hs: 0.8, cam: { zoom: lerp(1.08, 1.16, ease(t / d)), px: 0, py: 0, cy: 1450 },
    near: () => { robeFig(470, 1760, 0.62, { body: '#0A0604', rim: 'rgba(214,170,110,0.8)' }); person(250, 1720, 0.5, { f: 1, col: '#0A0604', rim: 'rgba(214,170,110,0.5)' }); person(330, 1730, 0.48, { f: -1, col: '#0A0604', rim: 'rgba(214,170,110,0.5)', hair: true });
      alpha(1 - eve, () => { for (let i = 0; i < 60; i++) { const x = 380 + rnd(i) * 220 + Math.sin(t + i) * 20, y = 1760 - rnd(i + 2) * 120 - ((t * 40 + i * 13) % 140); P(circ(x, y, 3 + rnd(i + 5) * 3), 'rgba(214,170,110,0.55)', null); } }); } });
  tagP('BY DAY', W / 2, 360, kin('n3', 0, 0.05, 0.3) * (1 - eve), '#FFC890', 50);
  bigText('EVERY EVENING...', W / 2, 520, 92, AW.gold, kin('n3', 6, 0.05, 0.3));
};
DRAW.sc4 = (t, d) => { // doorway costume change + quote card
  const u = lt('q1'); const fall = easeIO(seg(u, wt('q1', 4), wt('q1', 7) + 0.3)); const robe = seg(u, wt('q1', 8), wt('q1', 13) + 0.2);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#0E080A', '#040205')); } },
    { z: 0.2, draw: () => { // doorway into the warm study
      const dx = 300, dy = 1000, dw = 480, dh = 900; glow(W / 2, 1450, 600, '#FF9A40', 0.25 + 0.2 * robe); P(rr(dx - 30, dy - 30, dw + 60, dh + 60, [250, 250, 0, 0]), '#1A0E08', null);
      P(rr(dx, dy, dw, dh, [240, 240, 0, 0]), grad(dy, dy + dh, '#5A2A10', '#1A0A04'), null); ctx.save(); ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, [240, 240, 0, 0]); ctx.clip();
      for (let r = 0; r < 4; r++) for (let b = 0; b < 12; b++) { const h = 60 + rnd(r * 12 + b) * 30; P(rr(dx + 20 + b * 38, dy + 260 + r * 120 - h, 32, h, 3), ['#3A0E0E', '#2A1A0E', '#4A2A10', '#1E1A12'][(r + b) % 4], null); }
      candleM(W / 2 + 140, dy + 720, t, 1.0); ctx.restore(); } },
    { z: 0.6, draw: () => { robeFig(W / 2 - 40, 1880, 0.95, { robe, rim: robe > 0.5 ? M.gold2 : 'rgba(214,170,110,0.7)', rimA: 0.9 }); cloak(W / 2 - 40, 1880, 0.95, fall, t); } },
  ], { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0, cy: 1500 });
  dust(t, 50, [300, 1100, 480, 700], AW.dust, 4);
  quoteCard2('q1', 2, 'I pull off my peasant-clothes... and put on my noble court dress.', ['— Letter to Vettori, 1513', '(tr. Marriott, The Prince, Introduction)'], ['peasantclothes', 'noble', 'court', 'dress'], { size: 62, cy: 560, in: 0.12 });
};
DRAW.sc5 = (t, d) => { // the men of old rise from the candlelit book; four hours
  const u = lt('n4'); const kG = seg(u, wt('n4', 2) - 0.2, wt('n4', 5) + 0.6); const k4 = kin('n4', 8, 0.05, 0.3); const kT = kin('n4', 12, 0.05, 0.3);
  studyN(t, d, { cam: { zoom: lerp(1.0, 1.1, ease(t / d)), px: 0, py: 0, cy: 1150 },
    ghosts: () => { [[200, 980, 0.9], [440, 880, 0.75], [700, 900, 0.8], [920, 1000, 0.95]].forEach(([x, y, s], i) => ghostBust(x, y, s, seg(kG, i * 0.15, 0.5 + i * 0.15), i, t)); } });
  chipAt('in essence · Letter to Vettori, 1513 (tr. Marriott)', 300, kin('n4', 0, 0.1, 0.3));
  stampA('4 HOURS', W / 2, 520, k4, AW.gold, -0.05, 120);
  tagP('EVERY TROUBLE · FORGOTTEN', W / 2, 680, kT, '#FFE0B0', 44);
};
DRAW.sc6 = (t, d) => { // MIND: being alone = an appointment; dress for it
  const u = lt('n5'); const kA = kin('n5', 5, 0.05, 0.35), kD = kin('n5', 8, 0.05, 0.35);
  layers([
    { z: 0.02, draw: () => redRoomA(t) },
    { z: 0.3, draw: () => { P(rr(-200, 1560, W + 400, 600, 0), grad(1560, 1900, '#2A0A0A', '#080203'), null); candleM(220, 1560, t, 1.3); candleM(880, 1560, t + 1, 1.1); } },
    { z: 0.55, draw: () => { robeFig(W / 2, 1800, 0.9, { robe: kD, rim: M.gold2, rimA: 0.9 }); } },
  ], camAt(t, d, 1.0, 1.08, 12));
  // appointment card
  if (kA > 0) withT(W / 2, 760 + (1 - kA) * 40, 1, -0.03, () => alpha(kA, () => { P(rr(-330, -200, 660, 400, 26), '#EADBB8', '#5A1A12', 6); P(rr(-330, -200, 660, 96, [26, 26, 0, 0]), '#8E1B1B', null);
    txt('APPOINTMENT', 0, -150, 54, '#FFF3D6', 'Oswald', 700); txt('Every evening', 0, -40, 58, '#24170C', 'CrimsonText', 700); txt('with: myself', 0, 40, 58, '#24170C', 'CrimsonText', 700);
    if (kD > 0) alpha(kD, () => { txt('dress code: your best', 0, 128, 44, '#8E1B1B', 'CrimsonText', 700); }); }));
  tagP('MIND', W / 2, 330, kin('n5', 0, 0.1, 0.3), '#FF8A7A', 60);
};
DRAW.sc7 = (t, d) => { // HEART: the reed flute plays in every crowd — happy and sad
  const u = lt('n6'); const reach = seg(t, 0, d * 0.8);
  market(t, d, { reach, cam: { zoom: lerp(1.1, 1.0, easeIO(t / d)), px: 0, py: 0, cy: 1400 } });
  chipAt('in essence · Masnavi, Book I (tr. Whinfield)', 300, kin('n6', 0, 0.1, 0.3), AW.blue);
  tagP('HEART', W / 2, 430, kin('n6', 0, 0.1, 0.3), '#8FE0E0', 60);
  tagP('THE HAPPY', 300, 1150, kin('n6', 9, 0.05, 0.3), AW.gold, 40); tagP('THE SAD', 780, 1150, kin('n6', 12, 0.05, 0.3), '#8FE0E0', 40);
};
DRAW.sc8 = (t, d) => { // quote card over the crowd
  market(t + 4, d, { reach: 1, cam: { zoom: lerp(1.0, 1.05, ease(t / d)), px: 0, py: 0, cy: 1450 } });
  ctx.fillStyle = 'rgba(2,6,12,0.32)'; ctx.fillRect(0, 0, W, H);
  quoteCard2('q2', 3, 'each interprets my notes... but not one fathoms the secrets of my heart.', ['— Masnavi, Book I (tr. Whinfield)'], ['interprets', 'fathoms', 'secrets', 'heart'], { size: 64, cy: 640, in: 0.12 });
};
DRAW.sc9 = (t, d) => { // alone in a full room (spotlight) → the song reaches them: tears
  const u = lt('n7'); const spot = 1 - seg(u, wt('n7', 5) - 0.1, wt('n7', 7) + 0.3); const tears = seg(u, wt('n7', 10), wt('n7', 13) + 0.8);
  market(t + 8, d, { spot: clamp(spot), reach: 1 - spot * 0.7, tears, cam: { zoom: lerp(1.15, 1.05, ease(t / d)), px: 0, py: 0, cy: 1550 } });
  bigText('LONELY...', W / 2, 420, 110, '#FFFFFF', kin('n7', 0, 0.05, 0.3));
  bigText('IN A FULL ROOM', W / 2, 550, 92, '#8FE0E0', kin('n7', 2, 0.05, 0.3) * (1 - seg(u, wt('n7', 8), wt('n7', 9))));
  bigText('MOVES PEOPLE', W / 2, 550, 92, AW.gold, kin('n7', 10, 0.05, 0.3));
  bigText('TO TEARS', W / 2, 670, 92, AW.gold, kin('n7', 12, 0.05, 0.3));
};
DRAW.sc10 = (t, d) => { // my take: wrote it down | sang it out → raw material
  const u = lt('n8'); const kW = kin('n8', 6, 0.05, 0.3), kS = kin('n8', 10, 0.05, 0.3); const merge = seg(u, wt('n8', 13) - 0.2, wt('n8', 14) + 0.3); const raw = kin('n8', 16, 0.05, 0.35);
  splitLRA(540 + Math.sin(t) * 6, t, () => { redRoomA(t); withT(270, 0, 1, 0, () => withT(-270, 0, 1, 0, () => {
      glow(270, 1300, 420, '#FF9A40', 0.3 * flick(t)); P(rr(-100, 1360, 760, 700, 0), grad(1360, 1800, '#3E2614', '#0A0604'), null); candleM(120, 1360, t, 1.1);
      withT(300, 1500, 1.05, 0, () => { P(rr(-200, -120, 400, 240, 8), '#EADBB8', null); alpha(0.8, () => { for (let i = 0; i < 6; i++) line(-170, -80 + i * 32, -170 + 340 * clamp(seg(u, wt('n8', 4), wt('n8', 8)) * 6 - i), -80 + i * 32, '#3A2A1A', 4); });
        const qx = -170 + 340 * ((seg(u, wt('n8', 4), wt('n8', 8)) * 6) % 1), qy = -80 + 32 * Math.min(5, Math.floor(seg(u, wt('n8', 4), wt('n8', 8)) * 6)); withT(qx + 30, qy - 90, 1, 0.5, () => { const q = new Path2D(); q.moveTo(0, 90); q.bezierCurveTo(14, 40, 34, -10, 26, -60); q.bezierCurveTo(6, -10, -6, 40, 0, 90); P(q, '#E9DCC0', null); }); }); })); },
    () => { blueRoomA(t); moon(820, 330, 70, t); dunes(1560, 60, '#040A18', 4.1, 'rgba(230,200,140,0.35)'); waves(860, 1270, t, -0.3, 6, 600, 0.6); fluteFigure(720, 1660, 0.75, t, M.gold2, 0.9); });
  tagP('WROTE IT DOWN', 270, 760, kW * (1 - merge), '#FF8A7A', 40); tagP('SANG IT OUT', 810, 760, kS * (1 - merge), '#8FE0E0', 40);
  const pill = merge; if (pill > 0) alpha(pill, () => P(rr(50, 820, W - 100, 300, 60), 'rgba(6,4,10,0.86)', AW.gold, 4));
  bigText("ALONE ISN'T", W / 2, 900, 84, '#FFFFFF', merge); bigText('THE END', W / 2, 1010, 84, '#FFFFFF', merge * (1 - raw));
  bigText('IT\'S RAW MATERIAL', W / 2, 1010, 78, AW.gold, raw);
  tagP('MY TAKE', W / 2, 330, kin('n8', 0, 0.1, 0.3), AW.gold, 50);
};
function splitLRA(seamX, t, left, right) { const pts = []; for (let y = -60; y <= H + 60; y += 120) pts.push([seamX + (Math.floor(y / 120) % 2 ? 22 : -22), y]);
  ctx.save(); const a = new Path2D(); a.moveTo(-50, -60); pts.forEach(p => a.lineTo(...p)); a.lineTo(-50, H + 60); a.closePath(); ctx.clip(a); left(); ctx.restore();
  ctx.save(); const b = new Path2D(); b.moveTo(W + 50, -60); pts.forEach(p => b.lineTo(...p)); b.lineTo(W + 50, H + 60); b.closePath(); ctx.clip(b); right(); ctx.restore();
  ctx.save(); ctx.shadowColor = AW.gold; ctx.shadowBlur = 26; ctx.strokeStyle = AW.gold; ctx.lineWidth = 5; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke(); ctx.restore(); }
function splitTBA(seamY, tilt, top, bottom) { ctx.save(); const a = new Path2D(); a.moveTo(-50, -50); a.lineTo(W + 50, -50); a.lineTo(W + 50, seamY - tilt); a.lineTo(-50, seamY + tilt); a.closePath(); ctx.clip(a); top(); ctx.restore();
  ctx.save(); const b = new Path2D(); b.moveTo(-50, seamY + tilt); b.lineTo(W + 50, seamY - tilt); b.lineTo(W + 50, H + 50); b.lineTo(-50, H + 50); b.closePath(); ctx.clip(b); bottom(); ctx.restore();
  ctx.save(); ctx.shadowColor = AW.gold; ctx.shadowBlur = 30; line(-50, seamY + tilt, W + 50, seamY - tilt, AW.gold, 6); ctx.restore(); }
DRAW.sc11 = (t, d) => { // tonight: one hour, phone in the other room, make one thing
  const u = lt('n9'); const ph = 1 - 0.6 * seg(u, wt('n9', 4), wt('n9', 8)); const write = seg(u, wt('n9', 10), d);
  roomNight(t, d, { phone: ph, write });
  chipAt('tonight', 300, kin('n9', 0, 0.1, 0.3));
  hourRing(W / 2, 560, 130, seg(u, wt('n9', 1), d), t);
  tagP('PHONE → NEXT ROOM', 230, 860, kin('n9', 5, 0.05, 0.3) * (1 - kin('n9', 11, 0.05, 0.3)), '#8FB8FF', 34);
  [['A PAGE', 230, 15], ['A PLAN', 540, 16], ['A SONG', 850, 17]].forEach(([s, x, wi]) => { const k = kin('n9', wi, 0.05, 0.3); if (k > 0) withT(x, 1100, back(k), 0, () => tagP(s, 0, 0, 1, AW.gold, 48)); });
  bigText('MAKE ONE THING', W / 2, 980, 80, '#FFFFFF', kin('n9', 11, 0.05, 0.3) * (1 - kin('n9', 15, 0.05, 0.3)));
};
DRAW.sc12 = (t, d) => { // comment: book (red, top) or flute (blue, bottom)?
  const u = lt('n10');
  splitTBA(960, 40, () => { redRoomA(t); candleM(220, 760, t, 1.2); withT(W / 2, 640, 1.0, 0, () => { glow(0, -40, 360, '#FFC27A', 0.45); book(0, 0, 1.15, t); }); },
    () => { blueRoomA(t); withT(W / 2, 1420, 1, 0, () => { glow(0, 0, 360, '#9FE0E0', 0.35); ney(-260, 60, 520, -0.25, 1.2, 1, 1); waves(220, -20, t, -0.3, 5, 420, 0.5); }); });
  bigText('THE BOOK', W / 2, 330, 110, '#FF8A7A', kin('n10', 7, 0.05, 0.3));
  bigText('OR THE FLUTE?', W / 2, 1120, 100, '#8FE0E0', kin('n10', 10, 0.05, 0.3));
  const kc = back(seg(u, wt('n10', 12) - 0.05, wt('n10', 12) + 0.35)); if (kc > 0) withT(W / 2 + 280, 960, kc, 0, () => { const b = new Path2D(); b.roundRect(-110, -70, 220, 130, 30); b.moveTo(-30, 60); b.lineTo(-60, 105); b.lineTo(10, 60); P(b, '#F6F2E8', '#111', 4); for (let i = -1; i <= 1; i++) P(circ(i * 48, -5, 13), '#222', null); });
};
DRAW.sc13 = (t, d) => { // end card: candle (left) + reed flute (right) under one moon
  layers([{ z: 0.02, draw: () => { nightSky(t, { mx: 540, my: 330, mr: 80, seed: 8 }); } },
    { z: 0.4, draw: () => { dunes(1600, 50, '#040A18', 4.1, 'rgba(230,200,140,0.35)'); candleM(300, 1640, t, 1.4); ney(620, 1600, 360, -0.5, 1, 1, 1); } }], { zoom: lerp(1, 1.05, t / d), px: 0, py: 0, cy: 1000 });
  ctx.fillStyle = 'rgba(3,3,8,0.5)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0, 0.4)); const L = document.getElementById('logo');
  withT(W / 2, 640, lerp(0.8, 1, k), 0, () => alpha(k, () => { glow(0, 0, 320, M.gold, 0.4); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -135, -135, 270, 270); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.strokeStyle = M.gold2; ctx.lineWidth = 7; ctx.stroke(); }));
  bigText('Follow Awazzzz', W / 2, 900, 104, '#FFFFFF', seg(t, 0.1, 0.4));
  bigText('MINDSET', W / 2, 1030, 66, M.gold2, seg(t, 0.3, 0.6), 'Oswald', 700);
  alpha(seg(t, 0.5, 0.8), () => txt("you're less alone than you think", W / 2, 1120, 52, M.parch, 'CrimsonText', 600));
  const pulse = 1 + 0.04 * Math.sin(t * 6); withT(W / 2, 1250, back(seg(t, 0.6, 0.9)) * pulse, 0, () => { P(rr(-200, -50, 400, 100, 50), '#E62117', '#111', 4); txt('SUBSCRIBE', 0, 4, 52, '#fff', 'Oswald', 700); });
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
  splitTBA(980, 50, () => withT(0, -470, 1, 0, () => tuscany(2, 4, { cam: { zoom: 1.0, px: 0, py: 0, cy: 1150 }, lit: 1, hx: 560, hs: 1.1 })), () => market(2, 4, { reach: 1, cam: { zoom: 1.0, px: 0, py: 0, cy: 1500 } }));
  vign(0.5);
  withT(W / 2, 250, 1, 0, () => { ctx.font = '700 50px Oswald'; const s = 'MACHIAVELLI  vs  RUMI'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -42, w, 84, 42), 'rgba(10,6,10,0.88)', M.gold2, 4); txt(s, 0, 3, 50, '#FFF3D6', 'Oswald', 700); });
  bigText('FEELING', W / 2, 820, 150, '#FFFFFF', 1);
  bigText('ALONE?', W / 2, 990, 180, M.gold2, 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
  bigText('Two answers', W / 2, 1170, 66, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
