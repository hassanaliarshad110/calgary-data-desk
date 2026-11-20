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
const DRAW = {};
function S(id) { return SCENES.find(s => s.id === id); }
DRAW.sc1 = (t, d) => { // HOOK: the fortune coin spins, splits — half luck, half you
  const u = lt('h1'), w = LINES.h1.words;
  const split = easeOut(seg(u, w[2][0] - 0.1, w[2][0] + 0.5)), settle = easeOut(seg(u, 0, w[2][0]));
  floorSet(t, d, { dawn: lerp(0.15, 0.55, seg(u, w[5][0], w[9][0])), cam: { zoom: lerp(1.14, 1.0, easeOut(t / d)), px: 0, py: 0 },
    mid: [{ z: 0.6, draw: () => { glow(W / 2, 1000, 420, '#E2B04A', 0.25 + 0.25 * seg(u, w[8][0], w[9][0] + 0.3)); } }] });
  const spin = lerp(14, 0, settle) + (split > 0 ? 0 : 0);
  fortuneCoin(W / 2, 900, 230, spin, split, t);
  if (split > 0) { const kL = seg(u, w[2][0], w[4][0] + 0.2), kR = seg(u, w[7][0] - 0.1, w[9][0] + 0.2);
    alpha(kL, () => txt('LUCK', W / 2 - 330, 900, 70, '#B8C8E8', 'Oswald', 700)); alpha(kR, () => txt('YOU', W / 2 + 330, 900, 78, M.gold2, 'Oswald', 700)); }
  lightning(u, w[2][0] + 0.05, 260, 120, 520, 11);
  bigText('LUCK = HALF', W / 2, 440, 128, '#FFFFFF', seg(u, w[0][0] - 0.05, w[0][0] + 0.2) * (1 - seg(u, w[5][0] - 0.2, w[5][0])));
  bigText('THE OTHER HALF…', W / 2, 400, 96, '#FFFFFF', seg(u, w[5][0] - 0.05, w[5][0] + 0.2));
  bigText('IS YOURS.', W / 2, 530, 132, M.gold2, seg(u, w[8][0] - 0.05, w[8][0] + 0.15));
  flash(u - w[8][0], '255,210,140', 0.3, 0.35);
};
DRAW.sc2 = (t, d) => { // Start your day with this: Machiavelli writing at dawn
  study(t, d, { dawn: 0.9, cam: { zoom: lerp(1.0, 1.1, ease(t / d)), px: lerp(30, -20, ease(t / d)), py: 0 }, candleX: 200,
    pre: [{ z: 0.5, draw: () => thinker(500, 1192, 1.05, t) }],
    desk: () => { P(poly([600, 1138, 880, 1138, 900, 1180, 590, 1180]), M.parch, null); candleM(900, 1135, t + 2, 0.9, 70); } });
  alpha(seg(t, 0.2, 0.6), () => chipTop('The Prince · written c. 1513', 337));
};
function testPaper(x, y, s, k, o = {}) { if (k <= 0) return; withT(x, y - (1 - easeOut(k)) * 500, s, (1 - k) * 0.6 + (o.rot || 0), () => { P(rr(-120, -150, 240, 300, 6), '#F2EBDC', '#3A2A1A', 3); txt('SURPRISE', 0, -112, 30, M.red, 'Oswald', 700); txt('TEST', 0, -78, 34, '#24170C', 'Oswald', 700); for (let i = 0; i < 6; i++) P(rr(-90, -40 + i * 30, 180, 8, 3), 'rgba(40,30,20,0.35)', null); if (o.mark) txt(o.mark, 60, 110, 70, o.markCol || M.red, 'CrimsonText', 700); }); }
function nameTag(s, x, y, k, col = M.gold) { if (k <= 0) return; alpha(k, () => { ctx.font = '700 40px Oswald'; const w = ctx.measureText(s).width + 44; P(rr(x - w / 2, y - 30, w, 60, 30), 'rgba(10,6,8,0.75)', col, 2); txt(s, x, y + 2, 40, '#FFF3D6', 'Oswald', 700); }); }
DRAW.sc3 = (t, d) => { // two students, same surprise test, same bad luck (storm) → Nia shrugs: "it's fate"
  const u3 = lt('n3'), w3 = LINES.n3.words, u4 = lt('n4'), w4 = LINES.n4.words;
  const paper = seg(u3, w3[3][0] - 0.1, w3[4][0] + 0.2), luck = seg(u3, w3[6][0] - 0.1, w3[7][0] + 0.3), nia = seg(u4, -0.2, 0.4), shrug = Math.max(0, Math.sin(clamp(u4 - w4[1][0] + 0.1, 0, 0.9) * Math.PI / 0.9));
  office(t, d, { dawn: 0.25, cold: lerp(0.3, 1, luck), cam: { zoom: lerp(1.0, 1.07, ease(t / d)), px: lerp(-18, 18, ease(t / d)), py: 0 },
    mid: [{ z: 0.45, draw: () => { ctx.save(); ctx.beginPath(); ctx.rect(-100, 180, W + 200, 1000); ctx.clip(); cloudBank(300, '#141A2A', 0.6 + 0.4 * luck, t, 5); rainFx(t, 0.4 + 0.6 * luck, 21, [-100, 180, W + 200, 1000], 120); ctx.restore(); } },
      { z: 0.6, draw: () => {
        glow(300, 1000, 260, '#9AB0D0', 0.25); glow(780, 1000, 260, '#FFC27A', 0.25 * (1 - 0.6 * nia));
        withT(300, 1300, 1, 0, () => { ctx.translate(0, -shrug * 16); person(0, 0, 1.25, { sit: 1, hair: 1, rim: '#9AB0D0', rimA: 0.9, f: 1 }); });
        alpha(1 - 0.55 * nia, () => person(780, 1300, 1.25, { sit: 1, rim: M.gold2, rimA: 0.9, f: -1 }));
        if (shrug > 0.05) { [-1, 1].forEach(sd => withT(300 + sd * 112, 1300 - 250 - shrug * 30, 1, 0, () => alpha(shrug, () => { ctx.strokeStyle = '#9AB0D0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 24, sd < 0 ? Math.PI : -0.3, sd < 0 ? Math.PI + 1.3 : 1); ctx.stroke(); }))); }
      } }] });
  testPaper(300, 1560, 0.95, paper, { rot: -0.08 }); testPaper(780, 1560, 0.95, seg(u3, w3[3][0], w3[4][0] + 0.3), { rot: 0.07 });
  nameTag('NIA', 300, 860, seg(u3, w3[0][0], w3[1][0] + 0.2)); nameTag('OMAR', 780, 860, seg(u3, w3[1][0], w3[1][0] + 0.4));
  lightning(u3, w3[6][0] + 0.05, 620, 190, 620, 17);
  if (u4 < 0) bigText('SAME BAD LUCK', W / 2, 470, 104, '#B8C8E8', seg(u3, w3[5][0] - 0.05, w3[5][0] + 0.2));
  if (u4 >= -0.1) { const k = seg(u4, w4[2][0] - 0.1, w4[2][0] + 0.2); bigText('“It’s fate.”', W / 2, 470, 120, '#9AB0D0', k, 'CrimsonText', 700); if (k > 0) { ctx.fillStyle = `rgba(8,12,22,${0.3 * k})`; ctx.fillRect(0, 0, W, H); } }
};
DRAW.sc4 = (t, d) => { // Omar: twenty minutes a night → the storm hits → his walls were already built
  const u = lt('n5'), w = LINES.n5.words;
  const nights = seg(u, w[2][0] - 0.2, w[5][0] + 0.4), stormK = seg(u, w[8][0] - 0.2, w[9][0]), wave = easeIn(seg(u, w[8][0], w[10][0] + 0.2)), built = seg(u, w[10][0] - 0.6, w[13][0] + 0.2), hold = seg(u, w[11][0], w[13][0] + 0.4);
  office(t, d, { dawn: 0.1, cold: lerp(0.7, 1, stormK), cam: { zoom: lerp(1.04, 1.12, ease(t / d)) + 0.01 * Math.sin(u * 45) * seg(u, w[9][0], w[9][0] + 0.1) * (1 - seg(u, w[9][0] + 0.1, w[9][0] + 0.6)), px: 0, py: 0 },
    mid: [{ z: 0.45, draw: () => { ctx.save(); ctx.beginPath(); ctx.rect(-100, 180, W + 200, 1000); ctx.clip(); P(rr(-100, 180, W + 200, 1000, 0), `rgba(6,8,18,${0.5})`, null); rainFx(t, stormK, 31, [-100, 180, W + 200, 1000], 140); ctx.restore(); } },
      { z: 0.6, draw: () => { glow(W / 2 + 170, 1080, 260, '#FFD08A', 0.55); // desk lamp
        withT(W / 2 + 170, 1290, 1, 0, () => { line(0, 0, -30, -170, '#111', 8); P(poly([-90, -150, 10, -210, 40, -160, -50, -110]), '#1A1A1A', null); });
        person(W / 2 - 60, 1300, 1.3, { sit: 1, rim: M.gold2, rimA: 0.95, f: 1 }); } }] });
  // nights strip: seven moons get a check, "20 MIN"
  if (nights > 0 && wave < 0.9) alpha(nights * (1 - seg(u, w[6][0], w[8][0])), () => { for (let i = 0; i < 7; i++) { const k = back(seg(nights, i / 9, i / 9 + 0.25)); if (k <= 0) continue; withT(180 + i * 120, 470, k, 0, () => { P(circ(0, 0, 40), '#1A2238', M.gold, 3); P(circ(-8, -6, 26), '#F6E6B4', null); P(circ(4, -12, 22), '#1A2238', null); txt('✓', 22, 26, 36, '#2BCF7A', 'Inter', 900); }); }
    bigText('20 MIN · EVERY NIGHT', W / 2, 620, 84, M.gold2, seg(nights, 0.25, 0.5)); });
  lightning(u, w[8][0] + 0.02, 760, 200, 600, 41);
  // the wave rushes in from the bottom-left; the brick wall rises in front of Omar
  const wallY = 1180, wallH = 520;
  if (wave > 0) { const wx = lerp(-900, 60, wave); ctx.save(); ctx.globalAlpha = 0.92; const g = ctx.createLinearGradient(0, 900, 0, H); g.addColorStop(0, '#2A4A6A'); g.addColorStop(1, '#0A1424'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-300, H + 50); ctx.lineTo(-300, 1000); ctx.quadraticCurveTo(wx - 100, 880, wx + 80, 1060 + 30 * Math.sin(t * 8)); ctx.quadraticCurveTo(wx + 140, 1300, wx + 100, H + 50); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(230,240,255,0.8)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-300, 1000); ctx.quadraticCurveTo(wx - 100, 880, wx + 80, 1060 + 30 * Math.sin(t * 8)); ctx.stroke(); ctx.restore(); }
  brickWall(120, wallY, 840, wallH, built, { bw: 105, bh: 52 });
  if (hold > 0) { for (let i = 0; i < 26; i++) { const a = rnd(i) * Math.PI - Math.PI, r = hold * (80 + rnd(i + 3) * 260); alpha(1 - hold, () => P(circ(150 + Math.cos(a) * r * 0.5, 1180 + Math.sin(a) * r, 6 + rnd(i) * 10), 'rgba(220,235,255,0.9)', null)); } }
  bigText('WALLS: BUILT', W / 2, 600, 120, M.gold2, seg(u, w[11][0], w[11][0] + 0.25));
};
DRAW.sc5 = (t, d) => { // quote card at dawn in the study
  const u = lt('q1'), w = LINES.q1.words;
  study(t, d, { dawn: 0.8, cam: { zoom: lerp(1.0, 1.09, ease(t / d)), px: lerp(-15, 15, ease(t / d)), py: 0 }, candleX: 200,
    pre: [{ z: 0.5, draw: () => thinker(500, 1192, 1.05, t) }],
    desk: () => { P(poly([600, 1138, 880, 1138, 900, 1180, 590, 1180]), M.parch, null); } });
  const dim = seg(u, w[2][0] - 0.5, w[2][0]); if (dim > 0) { ctx.fillStyle = `rgba(5,3,6,${0.5 * dim})`; ctx.fillRect(0, 0, W, H); }
  fortuneCoin(W / 2, 1560, 120, 0, 1, t);
  quoteCard('q1', 2, 'Fortune is the arbiter of one-half of our actions, but… she still leaves us to direct the other half, or perhaps a little less.', '— The Prince, Ch. 25 (tr. Marriott)', ['fortune', 'arbiter', 'direct', 'half'], { cy: 660, size: 64 });
};
DRAW.sc6 = (t, d) => { // fortune = a raging river; in calm weather, build your barriers (+ canal)
  const u = lt('n6'), w = LINES.n6.words;
  const calm = ease(seg(u, w[7][0] - 0.3, w[9][0] + 0.2)), wall = easeOut(seg(u, w[10][0] - 0.1, w[12][0] + 0.6)), canal = seg(u, w[12][0], w[12][0] + 0.6);
  riverSet(t, d, { flood: lerp(1, 0.45, calm), calm, wall, canal, cam: { zoom: lerp(1.12, 1.0, ease(t / d)), px: 0, py: lerp(40, 0, ease(t / d)) } });
  lightning(u, w[5][0], 300, 140, 560, 7);
  alpha(seg(u, 0, 0.4), () => chipTop('in essence · The Prince, Ch. 25', 300));
  bigText('A RAGING RIVER', W / 2, 470, 108, '#B8C8E8', seg(u, w[5][0] - 0.05, w[5][0] + 0.2) * (1 - seg(u, w[7][0] - 0.3, w[7][0])));
  bigText('BUILD YOUR', W / 2, 450, 104, '#FFFFFF', seg(u, w[10][0] - 0.05, w[10][0] + 0.2));
  bigText('BARRIERS', W / 2, 580, 140, M.gold2, seg(u, w[12][0] - 0.05, w[12][0] + 0.2));
};
DRAW.sc7 = (t, d) => { // twist: the cautious man who won't turn adventurous; the river shifts around his wall
  const u7 = lt('n7'), uq = lt('q2'), wq = LINES.q2.words;
  const shift = ease(seg(uq, wq[3][0], wq[9][0] + 0.5)), freeze = seg(uq, wq[10][0], wq[12][0]);
  riverSet(t, d, { flood: lerp(0.5, 0.9, shift), wall: 1, calm: lerp(0.5, 0.15, shift), bend: lerp(0, -0.9, shift), cam: { zoom: lerp(1.04, 1.12, ease(t / d)) + 0.012 * Math.sin(u7 * 40) * seg(u7, 0.4, 0.45) * (1 - seg(u7, 0.45, 0.9)), px: 0, py: 0 },
    mid: [{ z: 0.62, draw: () => { glow(W / 2 + 260, 1060, 240, '#C0392B', 0.35); person(W / 2 + 260, 1150, 0.62, { rim: lerpC('#F6D27A', '#C0392B', freeze), rimA: 0.9 }); brickWall(W / 2 + 120, 1080, 280, 100, 1, { bw: 56, bh: 25 }); } }] });
  ctx.fillStyle = `rgba(90,10,10,${0.25 + 0.15 * freeze})`; ctx.fillRect(0, 0, W, H);
  flash(u7 - LINES.n7.words[3][0], '255,60,40', 0.35, 0.5);
  if (uq < -0.05) bigText("HERE'S THE CATCH", W / 2, 470, 92, M.red2, seg(u7, LINES.n7.words[3][0] - 0.05, LINES.n7.words[3][0] + 0.2));
  quoteCard('q2', 0, 'The cautious man, when it is time to turn adventurous, does not know how to do it.', '— The Prince, Ch. 25 (tr. Marriott)', ['cautious', 'adventurous'], { cy: 520, size: 66, in: -0.1 });
};
DRAW.sc8 = (t, d) => { // the habit that won yesterday can sink you tomorrow → change with the river
  const u = lt('n8'), w = LINES.n8.words;
  const bend = ease(seg(u, w[5][0] - 0.4, w[6][0] + 0.3)), sink = seg(u, w[6][0], w[8][0] + 0.4), turn = easeOut(seg(u, w[10][0] - 0.2, w[13][0] + 0.3));
  const G = riverGeom({ bend: -0.9 * bend, flood: 0.4, wall: 0 });
  riverSet(t, d, { flood: 0.35, calm: lerp(0.75, 0.35, sink * (1 - turn)) + 0.4 * turn * 0.5, bend: -0.9 * bend, cam: { zoom: lerp(1.0, 1.07, ease(t / d)), px: 0, py: 0 },
    mid: [{ z: 0.62, draw: () => { const g = G(0.34);
      // rock straight ahead where the old line runs into the bank
      if (bend > 0.2) alpha(bend, () => rock(W / 2 + 40, rp(0.22), 0.9));
      const straightX = W / 2, followX = g.cx; const bx = lerp(straightX, lerp(straightX, followX, 0.6), turn), by = g.y - lerp(0, 60, turn);
      const rot = lerp(sink * 0.35, -0.35, turn);
      boat(bx, by + sink * (1 - turn) * 30, 1.05, rot, t, { glow: 0.25 + 0.45 * turn, glowCol: turn > 0.5 ? '#FFD27A' : (sink > 0.3 ? '#C0392B' : '#FFC27A'), rim: turn > 0.4 ? M.gold2 : null });
    } }] });
  if (sink > 0 && turn < 0.5) { ctx.fillStyle = `rgba(90,10,10,${0.25 * sink * (1 - 2 * turn)})`; ctx.fillRect(0, 0, W, H); }
  bigText('YESTERDAY ✓', W / 2, 420, 96, M.gold2, seg(u, w[3][0], w[4][0] + 0.2) * (1 - seg(u, w[9][0] - 0.3, w[9][0])));
  bigText('TOMORROW ✗', W / 2, 560, 96, M.red2, seg(u, w[8][0] - 0.05, w[8][0] + 0.2) * (1 - seg(u, w[9][0] - 0.3, w[9][0])));
  bigText('CHANGE', W / 2, 430, 140, M.gold2, seg(u, w[10][0] - 0.05, w[10][0] + 0.2));
  bigText('WITH THE RIVER', W / 2, 570, 90, '#FFFFFF', seg(u, w[11][0] - 0.05, w[11][0] + 0.2));
};
DRAW.sc9 = (t, d) => { // action for today: one storm → one small wall before lunch
  const u = lt('n9'), w = LINES.n9.words;
  layers([
    { z: 0.04, draw: () => { const sk = ctx.createLinearGradient(0, 0, 0, 1300); sk.addColorStop(0, '#1A1530'); sk.addColorStop(0.55, '#B8583A'); sk.addColorStop(1, '#F7C47A'); fullFill(sk);
      const sy = lerp(1180, 1040, ease(t / d)); glow(W / 2, sy, 520, '#FFE0A0', 0.85); P(circ(W / 2, sy, 120), '#FFE7B0', null);
      alpha(seg(u, w[5][0] - 0.2, w[5][0] + 0.3) * 0.8, () => cloudBank(860, '#2A2236', 1, t, 9)); } },
    { z: 0.25, draw: () => { ctx.save(); ctx.translate(-160, 0); ctx.scale(1.1, 1); florenceSkyline(1230, '#2A1420'); ctx.restore(); } },
    { z: 0.6, draw: () => { P(rr(-200, 1230, W + 400, 700, 0), grad(1230, 1920, '#1A0C0A', '#050304'), null); line(-200, 1232, W + 200, 1232, 'rgba(255,210,150,0.6)', 3);
      brickWall(560, 1060, 300, 172, seg(u, w[10][0] - 0.1, w[13][0] + 0.6), { bw: 75, bh: 43 });
      person(380, 1240, 0.88, { rim: M.gold2, rimA: 0.9, hair: 1, f: 1 }); } },
  ], { zoom: lerp(1.0, 1.08, ease(t / d)), px: lerp(-20, 20, ease(t / d)), py: 0 });
  dust(t, 50, [0, 500, W, 900], '255,230,180', 17);
  const k = back(seg(u, 0.05, 0.4)); if (k > 0) withT(W / 2, 250, k, 0, () => { P(rr(-250, -48, 500, 96, 48), 'rgba(10,6,8,0.72)', M.gold, 3); txt("TODAY'S ACTION", 0, 3, 52, M.gold2, 'Oswald', 700); });
  const k2 = easeOut(seg(u, w[3][0] - 0.1, w[3][0] + 0.3)); if (k2 > 0) withT(W / 2, 525, 1, 0, () => alpha(k2, () => { P(rr(-430, -200, 860, 400, 20), 'rgba(234,219,184,0.95)', '#5A3A1A', 3);
    txt('1 storm you can see coming', 0, -115, 54, '#24170C', 'CrimsonText', 700);
    alpha(seg(u, w[10][0] - 0.1, w[10][0] + 0.3), () => txt('→ 1 small wall against it', 0, -10, 62, '#B4561E', 'CrimsonText', 700));
    alpha(seg(u, w[16][0] - 0.1, w[16][0] + 0.3), () => txt('before lunch.', 0, 100, 60, M.red, 'CrimsonText', 700)); }));
};
DRAW.sc10 = (t, d) => { // comment question: what's your wall today?
  const u = lt('n10'), w = LINES.n10.words;
  layers([
    { z: 0.04, draw: () => { fullFill(grad(0, H, '#2A1830', '#0A0608')); glow(W / 2, 600, 600, '#E58A4E', 0.35); } },
    { z: 0.5, draw: () => { brickWall(-60, 780, W + 120, 900, 1, { bw: 130, bh: 62, gold: seg(u, w[2][0] - 0.1, w[2][0] + 0.4) }); } },
  ], { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0 });
  ctx.fillStyle = 'rgba(5,3,6,0.35)'; ctx.fillRect(0, 0, W, H);
  bigText("WHAT'S YOUR", W / 2, 380, 104, '#FFFFFF', seg(u, w[0][0] - 0.05, w[0][0] + 0.2));
  bigText('WALL TODAY?', W / 2, 510, 124, M.gold2, seg(u, w[2][0] - 0.05, w[2][0] + 0.2));
  const kc = back(seg(u, w[4][0] - 0.05, w[4][0] + 0.35)); if (kc > 0) withT(W / 2, 700, kc, 0, () => { const b = new Path2D(); b.roundRect(-110, -70, 220, 130, 30); b.moveTo(-30, 60); b.lineTo(-60, 105); b.lineTo(10, 60); P(b, '#F6F2E8', '#111', 4); for (let i = -1; i <= 1; i++) P(circ(i * 48, -5, 13), '#222', null); });
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
  riverSet(3, 5, { flood: 0.55, calm: 0.7, wall: 1, canal: 1, cam: { zoom: 1.0, px: 0, py: 0 },
    mid: [{ z: 0.62, draw: () => { glow(W / 2, 1150, 300, '#FFC27A', 0.45); person(W / 2 + 250, 1400, 0.95, { rim: M.gold2, rimA: 0.95, f: -1 }); } }] });
  ctx.filter = 'none'; vign(0.55);
  withT(W / 2, 300, 1, 0, () => { ctx.font = '700 54px Oswald'; const s = 'MACHIAVELLI'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -44, w, 88, 44), 'rgba(110,14,14,0.92)', M.gold2, 4); txt(s, 0, 3, 54, '#FFF3D6', 'Oswald', 700); });
  bigText('HALF', W / 2, 500, 210, '#FFFFFF', 1);
  bigText('IS YOURS', W / 2, 690, 150, M.gold2, 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
  bigText('The Prince · Ch. 25', W / 2, 1520, 64, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
