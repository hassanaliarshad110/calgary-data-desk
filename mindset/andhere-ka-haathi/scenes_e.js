// ===== Awazzzz Mindset — "Everyone Was Right, Everyone Was Wrong" — Rumi, Masnavi Book III, Story V (tr. Whinfield)
// New set for this episode: the dark room with the elephant, hands of light, puzzle pieces, the palm, the lantern reveal.
const E = { wall0: '#03050B', wall1: '#08142A', blue: '#2A5C8C', teal: '#3FA7A8', gold: '#F6D27A', amber: '#FFB45A', body: '#04060C', ele: '#101B33' };

// ---------- elephant (facing left), feet at y=0, local units ~ 980 wide x 660 tall
function eleParts() {
  const body = new Path2D(); body.ellipse(70, -400, 330, 225, 0, 0, 6.283);
  const head = new Path2D(); head.ellipse(-290, -440, 160, 165, -0.15, 0, 6.283);
  const ear = new Path2D(); ear.moveTo(-250, -560); ear.bezierCurveTo(-110, -600, -40, -470, -70, -330); ear.bezierCurveTo(-95, -230, -190, -230, -225, -300); ear.bezierCurveTo(-250, -360, -270, -470, -250, -560); ear.closePath();
  const trunk = new Path2D(); // centre-line polygon with taper
  const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; const x = -410 - 70 * Math.sin(u * 2.2) + 60 * u * u, y = -430 + 420 * u - 40 * u * u * u; pts.push([x, y, lerp(70, 22, u)]); }
  pts.forEach((p, i) => { const q = pts[Math.min(i + 1, 24)], r0 = pts[Math.max(i - 1, 0)]; const dx = q[0] - r0[0], dy = q[1] - r0[1], l = Math.hypot(dx, dy) || 1; p.push(-dy / l, dx / l); });
  trunk.moveTo(pts[0][0] + pts[0][3] * pts[0][2], pts[0][1] + pts[0][4] * pts[0][2]); pts.forEach(p => trunk.lineTo(p[0] + p[3] * p[2], p[1] + p[4] * p[2]));
  trunk.quadraticCurveTo(pts[24][0] + 50, pts[24][1] + 10, pts[24][0] - pts[24][3] * 22, pts[24][1] - pts[24][4] * 22);
  for (let i = 24; i >= 0; i--) { const p = pts[i]; trunk.lineTo(p[0] - p[3] * p[2], p[1] - p[4] * p[2]); } trunk.closePath();
  const legs = [[-200, 1], [-70, 0.92], [170, 0.92], [300, 1]].map(([x, k]) => { const p = new Path2D(); p.roundRect(x - 52, -330, 104, 330, [20, 20, 14, 14]); p.roundRect(x - 60, -34, 120, 34, 12); return p; });
  const tail = new Path2D(); tail.moveTo(392, -470); tail.quadraticCurveTo(440, -380, 418, -250); tail.lineTo(430, -240); tail.quadraticCurveTo(452, -380, 400, -486); tail.closePath();
  return { body, head, ear, trunk, legs, tail };
}
let _EP = null; function EP() { return _EP || (_EP = eleParts()); }
// o.hl = {trunk, ear, leg, back} 0..1 gold highlight; o.lit 0..1 lantern reveal; o.rim rim-light strength
function elephant(x, y, s, t, o = {}) {
  const p = EP(), hl = o.hl || {}, lit = o.lit || 0, rimA = o.rim ?? 0.5;
  withT(x, y + Math.sin(t * 0.8) * 2, s, 0, () => {
    const col = lit > 0 ? lerpC(E.ele, '#4A3626', lit * 0.85) : E.ele;
    ctx.save(); ctx.globalAlpha = 0.45 * (o.rim ?? 0.5) + 0.1; ctx.strokeStyle = 'rgba(140,180,230,0.8)'; ctx.lineWidth = 6; [p.body, p.head, p.ear, p.trunk, p.tail, ...p.legs].forEach(q => ctx.stroke(q)); ctx.restore();
    [p.tail, ...p.legs.slice(2), p.body, ...p.legs.slice(0, 2), p.head, p.trunk, p.ear].forEach(q => P(q, col, null));
    alpha(0.25, () => { ctx.strokeStyle = 'rgba(140,180,230,0.6)'; ctx.lineWidth = 2; ctx.stroke(p.ear); });
    // tusk
    P(new Path2D('M-360 -330 Q-410 -250 -470 -262 Q-420 -270 -385 -340 Z'), lit > 0 ? `rgba(240,226,196,${0.35 + 0.6 * lit})` : 'rgba(200,210,230,0.18)', null);
    // rim light (cold moonlight from the high window, upper right)
    ctx.save(); ctx.globalAlpha = rimA; ctx.strokeStyle = 'rgba(120,170,220,0.9)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(70, -400, 330, 225, 0, -2.4, -0.2); ctx.stroke(); ctx.beginPath(); ctx.ellipse(-290, -440, 160, 165, -0.15, -2.6, -1.3); ctx.stroke(); ctx.restore();
    if (lit > 0) alpha(lit * 0.5, () => { const g = ctx.createRadialGradient(-120, -420, 60, -120, -420, 640); g.addColorStop(0, 'rgba(255,190,110,0.55)'); g.addColorStop(1, 'rgba(255,190,110,0)'); ctx.fillStyle = g; [p.body, p.head, p.ear, p.trunk, ...p.legs].forEach(q => ctx.fill(q)); });
    const H1 = (q, k) => { if (k <= 0) return; ctx.save(); ctx.clip(q); alpha(k, () => { const g = ctx.createLinearGradient(0, -700, 0, 0); g.addColorStop(0, 'rgba(255,226,150,0.95)'); g.addColorStop(1, 'rgba(210,140,50,0.75)'); ctx.fillStyle = g; ctx.fillRect(-700, -800, 1400, 820); }); ctx.restore(); ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = E.gold; ctx.lineWidth = 6; ctx.shadowColor = '#FFB45A'; ctx.shadowBlur = 30; ctx.stroke(q); ctx.restore(); };
    H1(p.trunk, hl.trunk || 0); H1(p.ear, hl.ear || 0); H1(p.legs[0], hl.leg || 0);
    if (hl.back) { const bk = new Path2D(); bk.ellipse(70, -400, 330, 225, 0, 0, 6.283); ctx.save(); ctx.clip(bk); const sel = new Path2D(); sel.ellipse(60, -600, 250, 110, 0, 0, 6.283); ctx.clip(sel); alpha(hl.back, () => { const g = ctx.createRadialGradient(60, -640, 20, 60, -600, 260); g.addColorStop(0, 'rgba(255,226,150,0.95)'); g.addColorStop(1, 'rgba(210,140,50,0.0)'); ctx.fillStyle = g; ctx.fillRect(-300, -760, 700, 360); }); ctx.restore(); alpha(hl.back, () => { ctx.save(); ctx.strokeStyle = E.gold; ctx.lineWidth = 6; ctx.shadowColor = '#FFB45A'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.ellipse(70, -400, 330, 225, 0, -2.0, -1.0); ctx.stroke(); ctx.restore(); }); }
  });
}
// world point of a part, for hands / icons
function elePt(x, y, s, part) { const L = { trunk: [-440, -150], ear: [-150, -430], leg: [-200, -170], back: [60, -610], tail: [425, -300] }[part]; return [x + L[0] * s, y + L[1] * s]; }

// a silhouette reaching out: person() + arm to (hx,hy) + glowing palm
function reacher(x, y, s, hx, hy, k, o = {}) {
  person(x, y, s, { col: o.col || E.body, rim: o.rim || 'rgba(120,170,220,0.9)', rimA: o.rimA ?? 0.55, f: o.f || 1, hair: o.hair });
  const side = hx < x ? -1 : 1; const sx = x + side * 72 * s, sy = y - 318 * s;
  const ex = lerp(sx, hx, easeOut(k)), ey = lerp(sy + 90 * s, hy, easeOut(k));
  ctx.save(); ctx.strokeStyle = o.col || E.body; ctx.lineCap = 'round'; ctx.lineWidth = 30 * s; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx + side * 30 * s, Math.min(sy, ey) + 30 * s, ex, ey); ctx.stroke(); ctx.restore();
  P(circ(ex, ey, 20 * s), o.col || E.body, null);
  if (k > 0.85) { const g = (k - 0.85) / 0.15; glow(ex, ey, 120 * s, E.amber, 0.55 * g); glow(ex, ey, 40 * s, '#FFF0C8', 0.7 * g); }
}

// the dark room: stone wall, a high slit window with moonlight, floor; o.lantern 0..1 warm reveal
function darkRoom(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.07, 24), ln = o.lantern || 0;
  layers([
    { z: 0.03, draw: () => {
      fullFill(grad(0, H, E.wall1, E.wall0));
      // stone blocks
      ctx.strokeStyle = 'rgba(120,150,200,0.07)'; ctx.lineWidth = 3;
      for (let r = 0; r < 16; r++) { const y = 140 + r * 80; ctx.beginPath(); ctx.moveTo(-200, y); ctx.lineTo(W + 200, y); ctx.stroke(); for (let c = 0; c < 9; c++) { const x = -200 + c * 180 + (r % 2) * 90; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 80); ctx.stroke(); } }
      // high arched slit window
      const wx = 860, wy = 640; glow(wx, wy + 60, 260, '#7FA8D8', 0.35); P(rr(wx - 46, wy - 40, 92, 200, [46, 46, 0, 0]), '#9CC0E8', null); P(rr(wx - 36, wy - 30, 72, 184, [36, 36, 0, 0]), '#CFE2FF', null);
      ctx.fillStyle = '#0A1220'; ctx.fillRect(wx - 4, wy - 34, 8, 196); ctx.fillRect(wx - 40, wy + 60, 80, 8);
      if (ln > 0) alpha(ln, () => { glow(W / 2, 1000, 900, '#FFB45A', 0.32); });
    } },
    { z: 0.12, draw: () => { beam(860, 720, 90, 560, 1500, 520, '150,190,240', 0.16 * (1 - ln * 0.6)); fullFill('rgba(0,0,0,0)'); } },
    { z: 0.22, draw: () => { // floor
      P(poly([-300, 1420, W + 300, 1420, W + 600, 2200, -600, 2200]), grad(1420, 2100, '#0A1222', '#020306'), null);
      alpha(0.3, () => P(ell(560, 1460, 480, 60), 'rgba(140,180,230,0.25)', null));
      if (ln > 0) alpha(ln, () => P(ell(W / 2, 1480, 640, 110), 'rgba(255,170,90,0.22)', null));
    } },
    ...(o.mid || []),
    { z: 1.15, blur: 8, draw: () => { // near pillars / curtain edges
      P(rr(-120, -100, 170, H + 300, 10), '#010204', null); P(rr(W - 60, -100, 190, H + 300, 10), '#010204', null);
      alpha(0.5, () => line(48, -100, 48, H + 200, 'rgba(120,170,220,0.4)', 4));
    } },
    ...(o.near || []),
  ], cam);
  dust(t, 50, [300, 300, 600, 1200], '170,200,240', o.seed || 4);
  if (ln > 0) dust(t, 30, [200, 600, 700, 900], '255,210,150', 8);
}
function essenceTag(k, s = 'in essence · Masnavi, Book III') { if (k <= 0) return; alpha(k, () => { ctx.font = 'italic 600 40px CrimsonText'; const w = ctx.measureText(s).width + 50; P(rr(W / 2 - w / 2, 262, w, 64, 32), 'rgba(4,8,16,0.72)', 'rgba(63,167,168,0.8)', 2); txt(s, W / 2, 296, 40, '#DDE8F4', 'CrimsonText', 600); }); }
function icon(kind, x, y, s, k, col = E.gold) { // ghost outlines of what each person "sees"
  if (k <= 0) return; withT(x, y, lerp(0.7, 1, easeOut(k)) * s, 0, () => alpha(k, () => {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.shadowColor = '#FFB45A'; ctx.shadowBlur = 24;
    ctx.beginPath();
    if (kind === 'pipe') { ctx.moveTo(-120, -40); ctx.lineTo(40, -40); ctx.quadraticCurveTo(90, -40, 90, 10); ctx.lineTo(90, 90); ctx.moveTo(-120, 0); ctx.lineTo(30, 0); ctx.quadraticCurveTo(50, 0, 50, 20); ctx.lineTo(50, 90); ctx.moveTo(-120, -60); ctx.lineTo(-120, 20); ctx.moveTo(40, 90); ctx.lineTo(100, 90); }
    if (kind === 'fan') { for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.36; ctx.moveTo(0, 80); ctx.lineTo(Math.cos(a) * 150, 80 + Math.sin(a) * 150); } ctx.moveTo(150 * Math.cos(-2.6), 80 + 150 * Math.sin(-2.6)); ctx.arc(0, 80, 150, -2.6, -2.6 + 6 * 0.36); }
    if (kind === 'pillar') { ctx.rect(-50, -110, 100, 220); ctx.moveTo(-80, -110); ctx.lineTo(80, -110); ctx.moveTo(-80, 110); ctx.lineTo(80, 110); ctx.moveTo(-20, -90); ctx.lineTo(-20, 90); ctx.moveTo(20, -90); ctx.lineTo(20, 90); }
    if (kind === 'throne') { ctx.moveTo(-80, 100); ctx.lineTo(-80, -110); ctx.quadraticCurveTo(0, -160, 80, -110); ctx.lineTo(80, 100); ctx.moveTo(-110, 10); ctx.lineTo(110, 10); ctx.moveTo(-110, 10); ctx.lineTo(-110, -40); ctx.moveTo(110, 10); ctx.lineTo(110, -40); ctx.moveTo(-70, 100); ctx.lineTo(-70, 10); ctx.moveTo(70, 100); ctx.lineTo(70, 10); }
    if (kind === 'tag') { ctx.rect(-90, -60, 180, 120); }
    ctx.stroke(); ctx.restore(); }));
}
function blameChip(s, x, y, k, col = '#C0392B') { if (k <= 0) return; withT(x, y - (1 - easeOut(k)) * 40, back(k), 0, () => { ctx.font = '900 46px Montserrat'; const w = ctx.measureText(s).width + 50; P(rr(-w / 2, -36, w, 72, 36), 'rgba(12,8,10,0.85)', col, 4); txt(s, 0, 2, 46, '#FFFFFF', 'Montserrat', 900); P(poly([-14, 34, 14, 34, 0, 56]), 'rgba(12,8,10,0.85)', null); }); }
function puzzlePiece(x, y, s, rot, fill, k = 1) { withT(x, y, s, rot, () => alpha(k, () => { const p = new Path2D(); p.moveTo(-60, -60); p.lineTo(-15, -60); p.arc(0, -66, 18, Math.PI * 0.8, Math.PI * 0.2, false); p.lineTo(60, -60); p.lineTo(60, -15); p.arc(66, 0, 18, -Math.PI * 0.7, Math.PI * 0.7); p.lineTo(60, 60); p.lineTo(-60, 60); p.lineTo(-60, 15); p.arc(-54, 0, 18, Math.PI * 0.3, -Math.PI * 0.3, true); p.closePath(); glow(0, 0, 140, '#FFB45A', 0.35); P(p, fill, '#2A1A08', 4); })); }

// ================= SCENES =================
const ex0 = 600, ey0 = 1440, es0 = 0.95; // elephant placement in the room
DRAW.sc1 = (t, d) => { // HOOK: dark room, four glowing hands on one huge shape; EVERYONE WAS RIGHT → WRONG
  const u = lt('h1'), w = LINES.h1.words; const kW = seg(u, w[7][0] - 0.15, w[7][0] + 0.2);
  darkRoom(t, d, { cam: { zoom: lerp(1.12, 1.04, ease(t / d)), px: lerp(20, -10, ease(t / d)), py: 0 }, mid: [
    { z: 0.45, draw: () => { elephant(ex0, ey0, es0, t, { rim: 0.35, hl: { trunk: 0.25 * (1 - kW), ear: 0.25 * (1 - kW), leg: 0.25 * (1 - kW), back: 0.25 * (1 - kW) } }); const parts = [['trunk', 120, 1700, 1], ['ear', 420, 1760, -1], ['leg', 250, 1830, 1], ['back', 860, 1740, -1]];
      parts.forEach(([pt, px, py, f], i) => { const [hx, hy] = elePt(ex0, ey0, es0, pt); reacher(px, py, 0.85, hx, hy, 1, { f }); }); } },
  ] });
  ctx.fillStyle = `rgba(0,0,0,${0.25})`; ctx.fillRect(0, 0, W, H);
  bigText('EVERYONE WAS RIGHT.', W / 2, 560, 80, E.gold, seg(u, -0.1, 0.15) * (1 - kW));
  bigText('EVERYONE WAS WRONG.', W / 2, 560, 80, '#FFFFFF', kW);
  flash(u - w[7][0], '255,255,255', 0.2, 0.25);
};
DRAW.sc2 = (t, d) => { // Rumi (stylised, seated, reading) under an arched window — the Masnavi
  const u = lt('n2'), w = LINES.n2.words;
  layers([
    { z: 0.03, draw: () => { nightSky(t, { mx: 760, my: 520, mr: 90, seed: 11 }); } },
    { z: 0.2, draw: () => { // arched window frame (cut-out)
      const a = new Path2D(); a.rect(-300, -300, W + 600, H + 600); a.moveTo(180, 1250); a.lineTo(180, 520); a.quadraticCurveTo(180, 240, W / 2, 200); a.quadraticCurveTo(W - 180, 240, W - 180, 520); a.lineTo(W - 180, 1250); a.closePath();
      ctx.fillStyle = '#04070F'; ctx.fill(a, 'evenodd'); ctx.strokeStyle = 'rgba(63,167,168,0.45)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(180, 1250); ctx.lineTo(180, 520); ctx.quadraticCurveTo(180, 240, W / 2, 200); ctx.quadraticCurveTo(W - 180, 240, W - 180, 520); ctx.lineTo(W - 180, 1250); ctx.stroke();
      ctx.fillStyle = '#04070F'; ctx.fillRect(-300, 1250, W + 600, 900);
    } },
    { z: 0.45, draw: () => { lantern(300, 640, 1, t, 600);
      // seated robed figure reading, facing right
      withT(470, 1420, 1.15, 0, () => { const r = new Path2D(); r.moveTo(-40, -330); r.bezierCurveTo(-120, -260, -190, -90, -200, 0); r.lineTo(170, 0); r.bezierCurveTo(150, -80, 90, -150, 60, -200); r.lineTo(40, -330); r.quadraticCurveTo(0, -350, -40, -330); r.closePath(); P(r, R.body, null);
        P(ell(4, -380, 36, 42), R.body, null); P(poly([-26, -404, 30, -404, 22, -500, -16, -500]), R.body, null); P(ell(3, -500, 19, 10), R.body, null);
        ctx.save(); ctx.globalAlpha = 0.8; ctx.strokeStyle = M.gold2; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(4, -380, 36, 42, 0, -1.2, 1.0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(40, -330); ctx.lineTo(60, -200); ctx.stroke(); ctx.restore();
        withT(170, -150, 1, 0.08, () => { glow(0, -10, 220, '#FFC861', 0.5); P(poly([-90, 0, 0, 14, 0, -40, -80, -50]), '#E8D6AE', null); P(poly([0, 14, 90, 0, 80, -50, 0, -40]), '#D6C092', null); for (let i = 0; i < 4; i++) { line(-70, -36 + i * 9, -12, -30 + i * 9, 'rgba(60,40,20,0.5)', 2); line(12, -30 + i * 9, 70, -36 + i * 9, 'rgba(60,40,20,0.5)', 2); } });
        ctx.strokeStyle = R.body; ctx.lineCap = 'round'; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(30, -290); ctx.quadraticCurveTo(110, -230, 140, -170); ctx.stroke(); });
      candleM(820, 1420, t, 1.1, 110); } },
    { z: 1.1, blur: 6, draw: () => { P(rr(-60, 1650, W + 120, 400, 20), '#020306', null); } },
  ], { zoom: lerp(1.0, 1.07, ease(t / d)), px: lerp(-20, 20, ease(t / d)), py: 0 });
  dust(t, 40, [200, 700, 700, 800], '246,210,122', 3);
  chipTop('MASNAVI · BOOK III', 300, M.gold); // stays inside the frame, above the caption band
  ctx.globalAlpha = 1;
};
DRAW.sc3 = (t, d) => { // An elephant in a dark room. Nobody can see it... so they touch it.
  const u = lt('n3'), w = LINES.n3.words; const kT = seg(u, w[11][0] - 0.1, w[13][0] + 0.3);
  darkRoom(t, d, { cam: { zoom: lerp(1.0, 1.1, ease(t / d)), px: lerp(-30, 10, ease(t / d)), py: 0 }, mid: [
    { z: 0.45, draw: () => { elephant(ex0, ey0, es0, t, { rim: lerp(0.08, 0.45, seg(u, w[0][0], w[5][0])) }); [['trunk', 140, 1760, 1, 0], ['ear', 440, 1800, -1, 0.15], ['leg', 280, 1880, 1, 0.3], ['back', 880, 1790, -1, 0.45]].forEach(([pt, px, py, f, dl]) => { const [hx, hy] = elePt(ex0, ey0, es0, pt); reacher(px, py, 0.85, hx, hy, seg(kT, dl, dl + 0.5), { f }); }); } },
  ] });
  // "Nobody can see it": closed eyes / question marks over heads
  const kq = seg(u, w[6][0], w[8][0]) * (1 - seg(u, w[11][0], w[12][0])); if (kq > 0) [[140, 1320], [440, 1360], [280, 1440], [880, 1350]].forEach(([x, y], i) => alpha(kq, () => txt('?', x, y - 40 * Math.sin(t * 2 + i) * 0.2 - 60, 70, '#9CC0E8', 'Montserrat', 900)));
  essenceTag(seg(u, 0, 0.3));
};
DRAW.sc4 = (t, d) => { // QUOTE CARD 1: the trunk → water-pipe
  const u = lt('q1');
  darkRoom(t, d, { cam: { zoom: lerp(1.35, 1.42, ease(t / d)), px: 60, py: 120, cy: 1300 }, mid: [
    { z: 0.45, draw: () => { elephant(ex0, ey0, es0, t, { rim: 0.4, hl: { trunk: seg(u, LINES.q1.words[3][0], LINES.q1.words[3][0] + 0.4) } }); const [hx, hy] = elePt(ex0, ey0, es0, 'trunk'); reacher(130, 1760, 0.85, hx, hy, 1, { f: 1 }); } },
  ] });
  icon('pipe', 300, 1180, 1, seg(u, LINES.q1.words[10][0] - 0.1, LINES.q1.words[10][0] + 0.3));
  quoteCard('q1', 0, 'One felt its trunk, and declared that the beast resembled a water-pipe.', '— Rumi, Masnavi, Book III (tr. E. H. Whinfield)', ['trunk', 'water'], { cy: 640, size: 64, in: 0 });
};
DRAW.sc5 = (t, d) => { // ear → fan, leg → pillar, back → great throne (camera travels along the elephant)
  const u = lt('n4'), w = LINES.n4.words; const tE = w[3][0], tL = w[8][0], tB = w[12][0];
  const ph = u < tL - 0.3 ? 0 : (u < tB - 0.3 ? 1 : 2);
  const camX = [ -60, -120, 140 ][ph], camZ = [1.3, 1.25, 1.22][ph];
  const pk = ph === 0 ? seg(u, 0, 0.6) : ph === 1 ? seg(u, tL - 0.3, tL + 0.3) : seg(u, tB - 0.3, tB + 0.3);
  const prevX = [-60, -60, -120][ph], prevZ = [1.3, 1.3, 1.25][ph];
  darkRoom(t, d, { cam: { zoom: lerp(prevZ, camZ, ease(pk)) + 0.02 * Math.sin(t), px: lerp(prevX, camX, ease(pk)), py: 60, cy: 1250 }, mid: [
    { z: 0.45, draw: () => { elephant(ex0, ey0, es0, t, { rim: 0.4, hl: { ear: seg(u, tE - 0.1, tE + 0.3), leg: seg(u, tL - 0.1, tL + 0.3), back: seg(u, tB - 0.1, tB + 0.3) } }); [['ear', 460, 1800, -1, tE], ['leg', 270, 1880, 1, tL], ['back', 880, 1790, -1, tB]].forEach(([pt, px, py, f, tt]) => { const [hx, hy] = elePt(ex0, ey0, es0, pt); reacher(px, py, 0.85, hx, hy, seg(u, tt - 0.6, tt), { f }); }); } },
  ] });
  // ghost icons, each in its own moment, upper-middle of the frame
  icon('fan', W / 2, 760, 1.2, seg(u, w[6][0] - 0.2, w[6][0] + 0.2) * (1 - seg(u, tL - 0.4, tL - 0.1)));
  icon('pillar', W / 2, 760, 1.2, seg(u, w[10][0] - 0.2, w[10][0] + 0.2) * (1 - seg(u, tB - 0.4, tB - 0.1)));
  icon('throne', W / 2, 760, 1.2, seg(u, w[15][0] - 0.2, w[15][0] + 0.2));
  essenceTag(seg(u, 0, 0.3));
};
DRAW.sc6 = (t, d) => { // At work, a launch flops. Sales blames the price. Support... the bugs. Design... the look.
  const u = lt('n5'), w = LINES.n5.words; const tw = s => { const i = w.findIndex(x => x[2].toLowerCase().startsWith(s)); return i < 0 ? 0 : w[i][0]; };
  const tF = tw('flops'), tP = tw('price'), tBg = tw('bugs'), tLk = tw('look');
  office(t, d, { dawn: 0.0, cold: 1, cam: { zoom: lerp(1.0, 1.08, ease(t / d)), px: lerp(-16, 16, ease(t / d)), py: 0 }, mid: [
    { z: 0.3, draw: () => { // wall screen with a falling launch chart
      withT(W / 2, 640, 1, 0, () => { glow(0, 0, 520, '#6A8AC0', 0.35); P(rr(-380, -230, 760, 430, 14), '#0C1220', '#1E2A40', 6); P(rr(-360, -210, 720, 390, 8), '#101A2E', null);
        txt('LAUNCH', -250, -160, 44, '#CFE2FF', 'Oswald', 700, 'left');
        const k = seg(u, tF - 0.4, tF + 0.6); ctx.save(); ctx.strokeStyle = '#E04A3A'; ctx.lineWidth = 12; ctx.lineJoin = 'round'; ctx.shadowColor = '#E04A3A'; ctx.shadowBlur = 20; ctx.beginPath();
        const pts = [[-320, 60], [-220, -20], [-120, -70], [-40, -100], [40, -30], [140, 40], [240, 100], [320, 150]]; const n = 3 + Math.floor(k * 5) ; pts.slice(0, Math.min(8, n)).forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.restore();
        if (k > 0.9) txt('▼ 62%', 230, -160, 48, '#FF6A5A', 'Oswald', 700); });
    } },
    { z: 0.5, draw: () => { [[230, 1300, tP, 1], [540, 1290, tBg, 1], [850, 1300, tLk, -1]].forEach(([x, y, tt, f], i) => person(x, y, 1.05, { col: '#05070C', rim: i === 1 ? 'rgba(120,170,220,0.9)' : 'rgba(255,190,120,0.8)', rimA: 0.75 + 0.2 * seg(u, tt - 0.2, tt + 0.2), f, hair: i === 1 })); } },
  ] });
  blameChip('PRICE', 230, 760 + 20, seg(u, tP - 0.25, tP + 0.15), '#E2B04A');
  blameChip('BUGS', 540, 880, seg(u, tBg - 0.25, tBg + 0.15), '#3FA7A8');
  blameChip('LOOK', 850, 780 + 20, seg(u, tLk - 0.25, tLk + 0.15), '#C9415A');
};
DRAW.sc7 = (t, d) => { // Each one holds a piece... and calls it the whole elephant.
  const u = lt('n6'), w = LINES.n6.words; const kW = seg(u, w[8][0] - 0.2, w[10][0] + 0.2);
  darkRoom(t, d, { cam: { zoom: lerp(1.04, 1.12, ease(t / d)), px: 0, py: 0 }, lantern: 0.15, mid: [
    { z: 0.35, draw: () => { alpha(0.25 + 0.5 * kW, () => elephant(ex0, ey0 - 60, es0 * 0.95, t, { rim: 0.7 })); } },
    { z: 0.6, draw: () => { [[200, 1820, '#E2B04A', 1], [540, 1860, '#3FA7A8', 1], [880, 1820, '#C9415A', -1]].forEach(([x, y, c, f], i) => { person(x, y, 0.95, { col: '#05070C', rim: 'rgba(255,200,140,0.8)', rimA: 0.7, f }); puzzlePiece(x, y - 700 - 10 * Math.sin(t * 2 + i), 0.9 + 0.08 * kW, 0.2 * Math.sin(t + i), c, seg(u, 0.1 + i * 0.25, 0.5 + i * 0.25)); }); } },
  ] });
  if (kW > 0) { // each piece casts a big false "whole" outline
    alpha(kW * 0.8, () => { ctx.save(); ctx.setLineDash([18, 14]); ctx.strokeStyle = E.gold; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(W / 2, 900, 380, 230, 0, 0, 6.283); ctx.stroke(); ctx.restore(); txt('THE WHOLE?', W / 2, 900, 70, E.gold, 'Montserrat', 900); });
  }
};
DRAW.sc8 = (t, d) => { // our senses = the palm of a hand; QUOTE CARD 2: the whole is not grasped in the palm
  const u7 = lt('n7'), uq = lt('q2'); const k = seg(GT, lineT('n7') + 0.2, lineT('n7') + 1.4);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#06102A', '#010205')); glow(W / 2, 700, 800, '#1E6F78', 0.25); starsT(t, 80, 900, 17); } },
    { z: 0.25, draw: () => { alpha(0.55, () => elephant(560, 1250, 1.25, t, { rim: 0.8, lit: 0.15 })); } },
    { z: 0.7, draw: () => { // big open palm rising from below, holding a single glowing piece
      withT(W / 2, lerp(2300, 1880, easeOut(k)), 1.3, 0, () => { const h = new Path2D(); h.moveTo(-230, 300); h.lineTo(-230, -40); h.bezierCurveTo(-300, -120, -330, -190, -290, -220); h.bezierCurveTo(-250, -240, -200, -170, -170, -120); h.lineTo(-170, -330); h.quadraticCurveTo(-140, -370, -110, -330); h.lineTo(-100, -150);
        h.lineTo(-90, -400); h.quadraticCurveTo(-55, -440, -25, -400); h.lineTo(-20, -160); h.lineTo(-5, -410); h.quadraticCurveTo(30, -445, 60, -405); h.lineTo(60, -150); h.lineTo(85, -350); h.quadraticCurveTo(115, -385, 140, -345); h.lineTo(150, -60); h.quadraticCurveTo(160, 120, 120, 300); h.closePath();
        P(h, '#05070C', null); ctx.save(); ctx.globalAlpha = 0.8; ctx.strokeStyle = 'rgba(120,190,200,0.9)'; ctx.lineWidth = 6; ctx.stroke(h); ctx.restore();
        glow(-30, -60, 220, '#FFB45A', 0.5); puzzlePiece(-30, -70, 0.7, 0.15, '#E2B04A', 1); });
    } },
  ], { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0 });
  essenceTag(act('n7', 0.1) ? seg(u7, 0, 0.3) : 1 - seg(uq, 0, 0.3));
  quoteCard('q2', 0, 'The whole of the object is not grasped in the palm.', '— Rumi, Masnavi, Book III (tr. E. H. Whinfield)', ['whole', 'palm'], { cy: 640, size: 70, in: -0.15 });
};
DRAW.sc9 = (t, d) => { // TWIST: you're in that room too — camera pulls back over YOUR shoulder, your hand on the tail
  const u = lt('n8'), w = LINES.n8.words; const kY = seg(u, w[2][0] - 0.2, w[3][0] + 0.3), kP = seg(u, w[8][0] - 0.2, w[13][0]);
  darkRoom(t, d, { cam: { zoom: lerp(1.25, 1.0, ease(seg(t, 0, 2.2))), px: 0, py: 0 }, mid: [
    { z: 0.45, draw: () => { elephant(ex0 - 40, ey0 - 40, es0 * 0.9, t, { rim: 0.4, hl: { trunk: 0.5, ear: 0.5, leg: 0.5, back: 0.5 } }); [['trunk', 120, 1700, 1], ['ear', 410, 1740, -1], ['back', 860, 1720, -1]].forEach(([pt, px, py, f]) => { const [hx, hy] = elePt(ex0 - 40, ey0 - 40, es0 * 0.9, pt); reacher(px, py, 0.75, hx, hy, 1, { f, rimA: 0.35 }); }); } },
    { z: 0.45, draw: () => { // YOU: big back-view silhouette bottom-centre, reaching for the tail
      const [hx, hy] = elePt(ex0 - 40, ey0 - 40, es0 * 0.9, 'tail'); withT(0, 0, 1, 0, () => { reacher(700, 2150, 1.5, hx, hy, kY, { f: -1, rim: 'rgba(255,210,140,0.95)', rimA: 0.9 }); });
      if (kP > 0) { glow(hx, hy, 260, '#FFB45A', 0.6 * kP); } } },
  ] });
  bigText("YOU'RE IN", W / 2, 470, 96, '#FFFFFF', kY);
  bigText('THE ROOM TOO', W / 2, 590, 96, E.gold, seg(u, w[5][0] - 0.1, w[5][0] + 0.25));
  if (kP > 0) alpha(kP, () => txt('your piece ≠ the whole', W / 2, 720, 54, '#DDE8F4', 'CrimsonText', 700));
};
DRAW.sc10 = (t, d) => { // ONE ACTION: before tonight, ask "what are you seeing that I'm not?" — a lantern lights the room
  const u = lt('n9'), w = LINES.n9.words; const kA = seg(u, w[5][0] - 0.1, w[5][0] + 0.4), kL = seg(u, w[6][0], w[12][0] + 0.4);
  darkRoom(t, d, { lantern: kL, cam: { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0 }, mid: [
    { z: 0.4, draw: () => elephant(ex0, ey0 - 30, es0, t, { rim: 0.4, lit: kL * 0.8 }) },
    { z: 0.6, draw: () => { person(240, 1880, 1.0, { col: '#05070C', rim: 'rgba(255,200,140,0.9)', rimA: 0.8, f: 1 }); person(840, 1880, 1.0, { col: '#05070C', rim: 'rgba(120,170,220,0.9)', rimA: 0.8, f: -1, hair: true }); lantern(540, 1250, 1.1, t, 140 + 20 * Math.sin(t)); glow(540, 1260, 300 * kL, '#FFB45A', 0.4 * kL); } },
  ] });
  // chip + question bubble
  alpha(seg(u, 0, 0.3), () => { ctx.font = '700 40px Oswald'; const s = 'BEFORE TONIGHT'; const ww = ctx.measureText(s).width + 50; P(rr(W / 2 - ww / 2, 262, ww, 66, 33), 'rgba(10,6,8,0.75)', E.gold, 3); txt(s, W / 2, 297, 40, E.gold, 'Oswald', 700); });
  const kb = back(kA); if (kb > 0) withT(W / 2, 560, kb, 0, () => { P(rr(-430, -130, 860, 230, 40), 'rgba(246,242,232,0.96)', '#111', 4); P(poly([-200, 98, -260, 170, -130, 98]), 'rgba(246,242,232,0.96)', null);
    txt('"What are you seeing', 0, -45, 64, '#14100A', 'CrimsonText', 700); txt('that I\'m not?"', 0, 35, 64, '#8E1B1B', 'CrimsonText', 700); });
};
DRAW.sc11 = (t, d) => { // comment question: which piece are you holding?
  const u = lt('n10'), w = LINES.n10.words;
  darkRoom(t, d, { lantern: 0.5, cam: { zoom: lerp(1.04, 1.0, ease(t / d)), px: 0, py: 0 }, mid: [
    { z: 0.4, draw: () => { alpha(0.6, () => elephant(ex0, ey0 - 30, es0, t, { rim: 0.4, lit: 0.4, hl: { trunk: 0.6 + 0.4 * Math.sin(t * 3), ear: 0.6 + 0.4 * Math.sin(t * 3 + 1.5), leg: 0.6 + 0.4 * Math.sin(t * 3 + 3), back: 0.6 + 0.4 * Math.sin(t * 3 + 4.5) } })); } },
  ] });
  ctx.fillStyle = 'rgba(3,4,8,0.3)'; ctx.fillRect(0, 0, W, H);
  bigText('WHICH PIECE', W / 2, 440, 104, '#FFFFFF', seg(u, w[0][0] - 0.05, w[0][0] + 0.2));
  bigText('ARE YOU HOLDING?', W / 2, 570, 84, E.gold, seg(u, w[2][0] - 0.05, w[2][0] + 0.2));
  [['pipe', 230], ['fan', 430], ['pillar', 650], ['throne', 850]].forEach(([k, x], i) => icon(k, x, 800, 0.55, seg(u, 0.3 + i * 0.15, 0.6 + i * 0.15)));
  const kc = back(seg(u, w[6][0] - 0.05, w[6][0] + 0.35)); if (kc > 0) withT(W / 2, 1040, kc, 0, () => { const b = new Path2D(); b.roundRect(-110, -70, 220, 130, 30); b.moveTo(-30, 60); b.lineTo(-60, 105); b.lineTo(10, 60); P(b, '#F6F2E8', '#111', 4); for (let i = -1; i <= 1; i++) P(circ(i * 48, -5, 13), '#222', null); });
};
DRAW.sc12 = (t, d) => { // end card: the whole elephant, finally lit — Follow Awazzzz · Mindset
  darkRoom(t, d, { lantern: 1, cam: { zoom: 1.0, px: 0, py: 0 }, mid: [
    { z: 0.4, draw: () => { elephant(ex0, ey0 + 40, es0, t, { rim: 0.6, lit: 1 }); lantern(160, 900, 0.9, t, 700); lantern(940, 860, 0.9, t + 2, 660); } },
  ] });
  ctx.fillStyle = 'rgba(5,3,6,0.55)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0, 0.4)); const L = document.getElementById('logo');
  withT(W / 2, 600, lerp(0.8, 1, k), 0, () => alpha(k, () => { glow(0, 0, 320, M.gold, 0.4); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -135, -135, 270, 270); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.strokeStyle = M.gold2; ctx.lineWidth = 7; ctx.stroke(); }));
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
  vign(0.6); grain(T);
  if (s.id !== 'sc12') { watermark(T); captions(); }
}
function drawCover() {
  GT = 0.2; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  darkRoom(2, 5, { lantern: 0.25, cam: { zoom: 1.02, px: 0, py: 0 }, mid: [
    { z: 0.45, draw: () => { elephant(ex0, ey0 + 60, es0, 2, { rim: 0.6, hl: { trunk: 1, ear: 1, leg: 1, back: 1 } }); [['trunk', 120, 1800, 1], ['ear', 420, 1860, -1], ['leg', 250, 1930, 1], ['back', 860, 1840, -1]].forEach(([pt, px, py, f]) => { const [hx, hy] = elePt(ex0, ey0 + 60, es0, pt); reacher(px, py, 0.85, hx, hy, 1, { f }); }); } },
  ] });
  ctx.filter = 'none'; vign(0.5);
  withT(W / 2, 300, 1, 0, () => { ctx.font = '700 54px Oswald'; const s = 'RUMI'; const w = ctx.measureText(s).width + 90; P(rr(-w / 2, -44, w, 88, 44), 'rgba(14,60,70,0.92)', M.gold2, 4); txt(s, 0, 3, 54, '#FFF3D6', 'Oswald', 700); });
  bigText('ALL RIGHT.', W / 2, 510, 140, '#FFFFFF', 1);
  bigText('ALL WRONG.', W / 2, 670, 140, M.gold2, 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
  bigText('The Elephant in the Dark', W / 2, 1560, 64, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
