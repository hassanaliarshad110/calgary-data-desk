
// ================= RUMI SET =================
const KEY = { h1: [], n2: ['rumi', 'masnavi'], n3: ['cut', 'home'], n4: ['calling'], n6: ['catch', 'sings'], n7: ['compass'], n8: ['one', 'step'], n9: ['heart'], n10: ['awazzzz'] };
const NOCAP = { q1: 0, q2: 0 };
const R = { sky0: '#02040C', sky1: '#061230', sky2: '#0D2C4C', teal: '#1E6F78', teal2: '#3FA7A8', moon: '#F4EBCB', body: '#03050B' };
function sc(id) { return SCENES.find(s => s.id === id); }
function wT(id, k) { return LINES[id].words[k][0]; }

function starsT(t, n = 170, ymax = 1150, seed = 3) {
  for (let i = 0; i < n; i++) {
    const x = rnd(i * 3 + seed) * W, y = rnd(i * 5 + seed) * ymax, big = rnd(i * 7 + seed) < 0.08;
    const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (1 + rnd(i) * 2.5) + i));
    ctx.fillStyle = `rgba(255,246,222,${(0.25 + rnd(i * 11) * 0.6) * tw})`; ctx.beginPath(); ctx.arc(x, y, big ? 3.2 : 1.6, 0, 6.283); ctx.fill();
    if (big) glow(x, y, 16, '#FFF6DE', 0.25 * tw);
  }
  alpha(0.1, () => { for (let i = 0; i < 260; i++) { const u = rnd(i + 900); const x = u * W, y = 120 + u * 700 + (rnd(i + 77) - 0.5) * 220; ctx.fillStyle = '#CFE2FF'; ctx.fillRect(x, y, 2, 2); } });
}
function moon(x, y, r, t) {
  glow(x, y, r * 6, '#7FA8D8', 0.28); glow(x, y, r * 2.4, '#F4EBCB', 0.5);
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); g.addColorStop(0, '#FFFBEA'); g.addColorStop(1, '#E6D8A8');
  P(circ(x, y, r), g, null);
  alpha(0.12, () => { P(circ(x + r * 0.3, y - r * 0.2, r * 0.22), '#8A7A50', null); P(circ(x - r * 0.35, y + r * 0.25, r * 0.15), '#8A7A50', null); P(circ(x + r * 0.05, y + r * 0.45, r * 0.1), '#8A7A50', null); });
}
function dunePath(y, amp, seed) { const p = new Path2D(); p.moveTo(-400, H + 600); for (let x = -400; x <= W + 400; x += 20) p.lineTo(x, y + amp * Math.sin(x * 0.0042 + seed) + amp * 0.45 * Math.sin(x * 0.011 + seed * 2.1)); p.lineTo(W + 400, H + 600); p.closePath(); return p; }
function dunes(y, amp, col, seed, rim = null, rimW = 4) {
  const p = dunePath(y, amp, seed); P(p, col, null);
  if (rim) { ctx.save(); ctx.clip(p); ctx.strokeStyle = rim; ctx.lineWidth = rimW * 2; ctx.stroke(p); ctx.restore(); }
}
function ripples(y0, n, col = 'rgba(160,190,230,0.12)', seed = 1) { ctx.strokeStyle = col; ctx.lineWidth = 2; for (let i = 0; i < n; i++) { const y = y0 + i * i * 3.2; ctx.beginPath(); for (let x = -300; x <= W + 300; x += 30) { const yy = y + 10 * Math.sin(x * 0.012 + i * 1.7 + seed); x === -300 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); } }
function lantern(x, y, s, t, chain = 420) {
  withT(x, y, s, Math.sin(t * 0.9 + x) * 0.03, () => {
    line(0, -chain, 0, -92, '#0E0A06', 4);
    glow(0, 5, 260 * flick(t + x), '#FFB45A', 0.42); glow(0, 5, 90, '#FFE2A0', 0.5);
    P(poly([-34, -60, 34, -60, 20, -96, -20, -96]), '#2A1A0A', null); P(circ(0, -102, 8), '#3A2410', null);
    const b = new Path2D(); b.moveTo(-40, -60); b.lineTo(40, -60); b.lineTo(54, 0); b.lineTo(40, 70); b.lineTo(-40, 70); b.lineTo(-54, 0); b.closePath();
    const g = ctx.createLinearGradient(0, -60, 0, 70); g.addColorStop(0, '#FFE19A'); g.addColorStop(0.5, '#F2A040'); g.addColorStop(1, '#A8521A');
    P(b, g, null);
    ctx.save(); ctx.clip(b); ctx.strokeStyle = 'rgba(40,20,6,0.85)'; ctx.lineWidth = 5; for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(i * 18, -70); ctx.lineTo(i * 18 + 60, 80); ctx.moveTo(i * 18, -70); ctx.lineTo(i * 18 - 60, 80); ctx.stroke(); } ctx.restore();
    P(b, null, '#2A1A0A', 5); P(poly([-40, 70, 40, 70, 18, 96, -18, 96]), '#2A1A0A', null);
  });
}
// reed flute (ney): centred at (x,y), length len, angle rot; lit = 0..1 inner light
function ney(x, y, len, rot, s = 1, lit = 0, holes = 1) {
  withT(x, y, s, rot, () => {
    const th = 24, L = len / 2;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12;
    const g = ctx.createLinearGradient(0, -th, 0, th); g.addColorStop(0, '#E8C98A'); g.addColorStop(0.45, '#B48A4E'); g.addColorStop(1, '#5A3E1E');
    P(rr(-L, -th / 2, len, th, th / 2), g, null); ctx.restore();
    for (let k = 1; k < 7; k++) { const nx = -L + len * k / 7; P(rr(nx - 4, -th / 2 - 2, 8, th + 4, 3), '#6A4A22', null); }
    P(rr(-L - 8, -th / 2 - 4, 46, th + 8, 6), '#C9962E', '#5A3A10', 2); // mouthpiece cap
    line(-L + 20, -th / 2 + 5, L - 10, -th / 2 + 5, 'rgba(255,240,200,0.55)', 3);
    for (let h = 0; h < 6; h++) { const hx = L * 0.12 + h * L * 0.13; const hk = holes * clamp(h + 1 - (1 - holes) * 6); if (hk <= 0) continue;
      P(ell(hx, 0, 6.5, 5), '#1A0E04', null); if (lit > 0) glow(hx, 0, 34, '#FFE2A0', 0.55 * lit); }
    if (lit > 0) { glow(L, 0, 120 * lit, '#FFE2A0', 0.6 * lit); glow(-L, 0, 80 * lit, '#FFE2A0', 0.4 * lit); }
  });
}
// sound waves leaving a point, aimed at angle dir
function waves(x, y, t, dir = 0, n = 5, reach = 520, a = 0.5, col = '246,210,122') {
  for (let i = 0; i < n; i++) { const ph = (t * 0.55 + i / n) % 1; const r = 40 + ph * reach;
    ctx.strokeStyle = `rgba(${col},${(1 - ph) * a})`; ctx.lineWidth = 6 * (1 - ph) + 1.5; ctx.beginPath(); ctx.arc(x, y, r, dir - 0.45, dir + 0.45); ctx.stroke(); }
}
// stylised whirling silhouette (no face), feet at (x,y); spin = phase
function whirler(x, y, s, t, spin, rim = R.teal2, rimA = 0.8) {
  withT(x, y, s, 0, () => {
    const hw = 170 + 22 * Math.sin(spin * 2);
    const sk = new Path2D(); sk.moveTo(-46, -300); sk.bezierCurveTo(-90, -200, -hw * 0.9, -90, -hw, 0);
    for (let xx = -hw; xx <= hw; xx += 10) sk.lineTo(xx, 8 * Math.sin(xx * 0.05 + spin * 3));
    sk.bezierCurveTo(hw * 0.9, -90, 90, -200, 46, -300); sk.closePath();
    P(sk, R.body, null);
    ctx.save(); ctx.clip(sk); for (let k = 0; k < 10; k++) { const a = spin + k * 0.628; const c = Math.cos(a); if (c < 0) continue; const fx = Math.sin(a);
      ctx.strokeStyle = `rgba(63,167,168,${0.22 * c})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx * 40, -300); ctx.quadraticCurveTo(fx * hw * 0.6, -140, fx * hw, 6); ctx.stroke(); } ctx.restore();
    const tor = new Path2D(); tor.moveTo(-46, -300); tor.lineTo(-60, -445); tor.quadraticCurveTo(0, -470, 60, -445); tor.lineTo(46, -300); tor.closePath(); P(tor, R.body, null);
    ctx.strokeStyle = R.body; ctx.lineCap = 'round'; ctx.lineWidth = 30;
    ctx.beginPath(); ctx.moveTo(52, -440); ctx.quadraticCurveTo(110, -520, 150, -600); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-52, -440); ctx.quadraticCurveTo(-120, -440, -185, -410); ctx.stroke();
    P(ell(158, -612, 20, 13, -0.9), R.body, null); P(ell(-196, -406, 20, 12, 0.3), R.body, null);
    P(rr(-15, -500, 30, 40, 8), R.body, null); P(ell(0, -520, 34, 40), R.body, null);
    P(poly([-26, -548, 26, -548, 19, -668, -19, -668]), R.body, null); P(ell(0, -668, 19, 10), R.body, null);
    ctx.save(); ctx.globalAlpha = rimA; ctx.strokeStyle = rim; ctx.lineWidth = 4; ctx.translate(3, 0);
    ctx.stroke(sk); ctx.beginPath(); ctx.ellipse(0, -520, 34, 40, 0, -1.2, 1.2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(26, -548); ctx.lineTo(19, -668); ctx.stroke(); ctx.restore();
  });
}
// robed figure playing the ney (stylised, no face detail), feet at (x,y), facing right
function fluteFigure(x, y, s, t, rim = M.gold2, rimA = 0.85) {
  withT(x, y, s, 0, () => {
    const sway = Math.sin(t * 1.1) * 4;
    const robe = new Path2D(); robe.moveTo(-58, -440); robe.bezierCurveTo(-90, -300, -150, -120, -160, 0); robe.lineTo(150, 0); robe.bezierCurveTo(130, -140, 80, -300, 62, -440); robe.quadraticCurveTo(0, -470, -58, -440); robe.closePath();
    P(robe, R.body, null);
    withT(sway * 0.5, 0, 1, 0, () => {
      P(rr(-15, -505, 30, 50, 8), R.body, null); P(ell(6, -528, 36, 42), R.body, null); P(poly([36, -540, 52, -520, 38, -512]), R.body, null);
      P(poly([-24, -556, 30, -556, 22, -676, -16, -676]), R.body, null); P(ell(3, -676, 19, 10), R.body, null);
      ctx.strokeStyle = R.body; ctx.lineCap = 'round'; ctx.lineWidth = 30;
      ctx.beginPath(); ctx.moveTo(40, -430); ctx.quadraticCurveTo(110, -420, 130, -390); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(30, -400); ctx.quadraticCurveTo(150, -360, 200, -330); ctx.stroke();
      ney(160, -400, 300, 0.62, 1, 0, 1);
      ctx.save(); ctx.globalAlpha = rimA; ctx.strokeStyle = rim; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(6, -528, 36, 42, 0, -1.3, 0.9); ctx.stroke(); ctx.restore();
    });
    ctx.save(); ctx.globalAlpha = rimA * 0.8; ctx.strokeStyle = rim; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(62, -440); ctx.bezierCurveTo(80, -300, 130, -140, 150, 0); ctx.stroke(); ctx.restore();
  });
}
function reedStalk(x, y, h, t, i, col = '#06121A', rim = 'rgba(63,167,168,0.5)', plume = 1) {
  const sw = Math.sin(t * 1.1 + i * 0.7) * 0.05 * h / 600; const tx = x + Math.sin(sw) * h, ty = y - h;
  ctx.strokeStyle = col; ctx.lineWidth = 8 + rnd(i) * 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sw * h * 0.3, y - h * 0.5, tx, ty); ctx.stroke();
  ctx.strokeStyle = rim; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x + 4, y); ctx.quadraticCurveTo(x + 4 + sw * h * 0.3, y - h * 0.5, tx + 3, ty); ctx.stroke();
  const lf = new Path2D(); const ly = y - h * (0.35 + rnd(i + 3) * 0.3), d = rnd(i + 5) > 0.5 ? 1 : -1; lf.moveTo(x + sw * h * 0.2, ly); lf.quadraticCurveTo(x + d * 90, ly - 60, x + d * 170, ly + 30 + Math.sin(t + i) * 8); lf.quadraticCurveTo(x + d * 80, ly - 30, x + sw * h * 0.2, ly + 10); P(lf, col, null);
  if (plume) { withT(tx, ty, 1, sw * 2 + 0.1, () => { P(ell(0, -36, 12, 46), '#2A2416', null); alpha(0.6, () => P(ell(4, -36, 5, 40), 'rgba(246,210,122,0.5)', null)); }); }
}
function nightSky(t, o = {}) {
  fullFill(grad(0, 1500, R.sky0, o.sky2 || R.sky2)); glow(W / 2, 1250, 900, R.teal, 0.25); starsT(t, 170, 1150, o.seed || 3);
  moon(o.mx ?? 790, o.my ?? 400, o.mr ?? 105, t);
}
function desert(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.08, 26);
  layers([
    { z: 0.02, draw: () => nightSky(t, o) },
    { z: 0.15, haze: 0.06, draw: () => dunes(1180, 60, '#0A1A34', 1.0, 'rgba(160,200,240,0.28)') },
    { z: 0.32, draw: () => { dunes(1320, 85, '#071229', 2.3, 'rgba(190,220,255,0.32)'); o.far && o.far(); } },
    ...(o.mid || []),
    { z: 0.62, draw: () => { dunes(1560, 70, '#040A18', 4.1, 'rgba(230,200,140,0.35)'); ctx.save(); ctx.clip(dunePath(1560, 70, 4.1)); ripples(1600, 12); ctx.restore(); o.near && o.near(); } },
    ...(o.extra || []),
    { z: 1.1, blur: 7, draw: () => { for (let i = 0; i < 5; i++) reedStalk(40 + i * 34, 2000, 420 + rnd(i) * 200, t, i, '#020408', 'rgba(63,167,168,0.25)'); for (let i = 0; i < 4; i++) reedStalk(1000 + i * 30, 2010, 380 + rnd(i + 9) * 180, t, i + 9, '#020408', 'rgba(246,210,122,0.2)'); } },
  ], cam);
  dust(t, 55, [0, 300, W, 1250], '190,215,255', o.seed || 2); dust(t, 25, [200, 900, 700, 700], '246,210,122', 7);
}
function compass(x, y, r, ang, t) {
  withT(x, y, 1, 0, () => {
    glow(0, 0, r * 1.8, M.gold, 0.25);
    const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, '#FFE39A'); g.addColorStop(0.5, '#C9962E'); g.addColorStop(1, '#6A4A14');
    P(circ(0, 0, r), g, null); P(circ(0, 0, r * 0.88), '#081A2A', null);
    for (let i = 0; i < 32; i++) { const a = i * Math.PI / 16, l = i % 4 ? 0.05 : 0.12; line(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86, Math.cos(a) * r * (0.86 - l), Math.sin(a) * r * (0.86 - l), 'rgba(246,210,122,0.7)', i % 4 ? 2 : 4); }
    [['N', 0], ['E', 1], ['S', 2], ['W', 3]].forEach(([c, k]) => { const a = -Math.PI / 2 + k * Math.PI / 2; txt(c, Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, r * 0.16, M.gold2, 'Oswald', 700); });
    const st = []; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 - Math.PI / 2, rr_ = i % 2 ? r * 0.16 : r * 0.42; st.push(Math.cos(a) * rr_, Math.sin(a) * rr_); } alpha(0.35, () => P(poly(st), R.teal2, null));
    withT(0, 0, 1, ang, () => { P(poly([0, -r * 0.78, r * 0.08, 0, 0, r * 0.1, -r * 0.08, 0]), '#F6D27A', '#5A3A10', 2); P(poly([0, r * 0.78, r * 0.08, 0, 0, -r * 0.1, -r * 0.08, 0]), R.teal2, '#0A2A30', 2); glow(0, -r * 0.7, 60, '#FFE2A0', 0.5); });
    P(circ(0, 0, r * 0.06), '#FFE39A', '#5A3A10', 3);
  });
}
function house(x, y, s, warm = 1) { withT(x, y, s, 0, () => { glow(0, -40, 220, '#FFB45A', 0.35 * warm); P(poly([-90, 0, 90, 0, 90, -90, 0, -150, -90, -90]), '#04080F', null); P(rr(-20, -60, 40, 60, [20, 20, 0, 0]), `rgba(255,190,100,${0.9 * warm})`, null); P(rr(40, -75, 26, 26, 4), `rgba(255,200,120,${0.8 * warm})`, null); P(rr(-66, -75, 26, 26, 4), `rgba(255,200,120,${0.8 * warm})`, null); }); }

// ================= SCENES =================
const DRAW = {};
DRAW.sc1 = (t, d) => { // HOOK: glowing reed flute under the moon, big question
  const u = lt('h1'), w = LINES.h1.words;
  desert(t, d, { cam: { zoom: lerp(1.14, 1.0, easeOut(t / d)), px: 0, py: 0 }, mx: 790, my: 300,
    extra: [{ z: 0.8, draw: () => { const k = easeOut(seg(u, 0, 1.0)); ney(W / 2, 1060 + Math.sin(t * 1.4) * 10, 760, -0.12, 1, 0.4 + 0.5 * k); waves(W / 2 + 370, 1015, t, -0.35, 5, 420, 0.5 * k); } }] });
  bigText('Why does a flute…', W / 2, 520, 92, '#FFFFFF', seg(u, w[0][0] - 0.05, w[0][0] + 0.2));
  bigText('sound so SAD?', W / 2, 680, 112, M.gold2, seg(u, w[4][0] - 0.05, w[4][0] + 0.2));
  flash(u - w[6][0], '246,210,122', 0.3, 0.3);
};
DRAW.sc2 = (t, d) => { // Rumi (stylised) playing the ney on a moonlit dune
  const u = lt('n2'), w = LINES.n2.words; const cry = seg(u, w[9][0] - 0.2, w[9][0] + 0.6);
  desert(t, d, { cam: { zoom: lerp(1.0, 1.1, ease(t / d)), px: lerp(25, -20, ease(t / d)), py: 0 }, mx: 800, my: 420,
    mid: [{ z: 0.48, draw: () => { fluteFigure(400, 1400, 1.25, t); waves(400 + 1.25 * 270, 1400 - 1.25 * 260, t, -0.4, 6, 480 + 200 * cry, 0.4 + 0.3 * cry); } }],
    extra: [{ z: 0.9, draw: () => { lantern(150, 420, 1.0, t, 600); lantern(960, 300, 0.85, t + 1, 500); } }] });
  const k = seg(t, 0.4, 0.9); alpha(k, () => { ctx.font = '600 44px CrimsonText'; const s = 'Rumi · Konya · 13th century'; const ww = ctx.measureText(s).width + 56; P(rr(W / 2 - ww / 2, 290, ww, 72, 36), 'rgba(4,14,24,0.65)', M.gold, 2); txt(s, W / 2, 327, 44, M.parch, 'CrimsonText', 600); });
};
DRAW.sc3 = (t, d) => { // quote card 1 over the glowing flute
  const u = lt('q1');
  desert(t, d, { cam: { zoom: lerp(1.04, 1.12, ease(t / d)), px: 0, py: 0 }, mx: 820, my: 300,
    extra: [{ z: 0.8, draw: () => { ney(W / 2, 1180, 700, -0.1, 1, 0.7); waves(W / 2 + 345, 1145, t, -0.3, 5, 380, 0.45); } }] });
  ctx.fillStyle = `rgba(2,4,10,${0.45 * seg(u, -0.3, 0.2)})`; ctx.fillRect(0, 0, W, H);
  quoteCard('q1', 0, 'Hearken to the reed-flute, how it complains, lamenting its banishment from its home.', '— Masnavi, Book I, Prologue (tr. Whinfield)', ['reed', 'complains', 'home'], { cy: 640, size: 70, in: -0.25 });
};
DRAW.sc4 = (t, d) => { // reed bed by a moonlit river: one reed is cut, becomes a flute, sings of home
  const u = lt('n3'), w = LINES.n3.words; const tc = w[3][0], ts = w[8][0], tsong = w[9][0], th = w[14][0];
  const cut = seg(u, tc - 0.05, tc + 0.15), lift = ease(seg(u, tc + 0.3, ts)), home = easeOut(seg(u, th - 0.2, th + 0.8));
  layers([
    { z: 0.02, draw: () => { nightSky(t, { mx: 760, my: 360, mr: 95 }); } },
    { z: 0.18, draw: () => { dunes(1150, 40, '#08152C', 1.7, 'rgba(160,200,240,0.2)');
      P(rr(-300, 1180, W + 600, 300, 0), grad(1180, 1480, '#0B2440', '#04101E'), null);
      for (let i = 0; i < 18; i++) { const yy = 1195 + i * 14, ww = 40 + i * 14 + Math.sin(t * 2 + i) * 14; alpha(0.5 - i * 0.02, () => P(rr(760 - ww / 2 + Math.sin(t * 1.5 + i) * 8, yy, ww, 4, 2), '#F4EBCB', null)); } } },
    { z: 0.42, draw: () => { glow(W / 2, 1280, 520, '#FFB45A', 0.32 * home); for (let i = 0; i < 26; i++) { const x = -40 + i * 46 + rnd(i) * 20; if (Math.abs(x - 560) < 30) continue; reedStalk(x, 1520, 520 + rnd(i + 2) * 380, t, i, '#050E16', `rgba(${home > 0.2 ? '246,210,122' : '63,167,168'},${0.35 + 0.3 * home})`); }
      // hero reed: stump stays, top part lifts away
      ctx.strokeStyle = '#050E16'; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(560, 1520); ctx.lineTo(560, 1180); ctx.stroke(); line(564, 1520, 564, 1180, 'rgba(246,210,122,0.5)', 3);
      if (lift < 0.98) withT(lerp(560, 600, lift), lerp(780, 650, lift), 1, lerp(0, -1.45, lift), () => { alpha(1 - seg(lift, 0.8, 1), () => { ctx.strokeStyle = '#050E16'; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(0, 400); ctx.lineTo(0, -320); ctx.stroke(); line(4, 400, 4, -320, 'rgba(246,210,122,0.6)', 3); P(ell(0, -360, 12, 46), '#2A2416', null); }); });
      if (cut > 0 && cut < 1) { withT(560, 1180, 1, -0.5, () => alpha(1 - cut, () => { glow(0, 0, 160, '#FFE2A0', 0.8); line(-150, 0, 150, 0, '#FFF3D0', 6); })); }
    } },
    { z: 0.72, draw: () => { P(rr(-300, 1500, W + 600, 600, 0), grad(1500, 1920, '#03080E', '#010205'), null); ripples(1540, 9, 'rgba(160,190,230,0.1)', 3); } },
    { z: 0.95, draw: () => { const k = seg(lift, 0.75, 1); if (k > 0) { alpha(k, () => { ney(600, 650, 760, -0.06, 1, 0.3 + 0.6 * seg(u, tsong - 0.2, tsong + 0.6), 1); waves(600 - 380, 672, t, Math.PI + 0.25, 5, 520, 0.5 * seg(u, tsong - 0.2, tsong + 0.5) + 0.3 * home); }); } } },
    { z: 1.15, blur: 7, draw: () => { for (let i = 0; i < 4; i++) reedStalk(30 + i * 40, 2000, 500 + rnd(i) * 200, t, i + 30, '#010306', 'rgba(63,167,168,0.2)'); for (let i = 0; i < 3; i++) reedStalk(1020 + i * 30, 2000, 460, t, i + 40, '#010306', 'rgba(63,167,168,0.2)'); } },
  ], { zoom: lerp(1.0, 1.1, ease(t / d)), px: lerp(-20, 20, ease(t / d)), py: 0 });
  dust(t, 50, [0, 400, W, 1100], '190,215,255', 4);
};
DRAW.sc5 = (t, d) => { // a student alone in a new city at night; the same moon; something keeps calling
  const u = lt('n4'), w = LINES.n4.words; const fam = seg(u, w[6][0] - 0.1, w[6][0] + 0.6), call = seg(u, w[14][0] - 0.2, w[14][0] + 0.8);
  layers([
    { z: 0.02, draw: () => { nightSky(t, { mx: 780, my: 400, mr: 80, seed: 9 }); alpha(fam, () => { withT(250, 560, 0.9, 0, () => { glow(0, -40, 260, '#FFB45A', 0.3); house(0, 0, 1, 1); }); }); } },
    { z: 0.2, haze: 0.05, draw: () => { ctx.fillStyle = '#0A1428'; for (let i = 0; i < 18; i++) { const x = -60 + i * 70, h = 160 + rnd(i + 1) * 340; ctx.fillRect(x, 1240 - h, 62, h); for (let k = 0; k < 12; k++) if (rnd(i * 12 + k) > 0.62) { ctx.fillStyle = 'rgba(255,200,120,0.45)'; ctx.fillRect(x + 8 + (k % 3) * 18, 1240 - h + 18 + Math.floor(k / 3) * 36, 8, 14); ctx.fillStyle = '#0A1428'; } } } },
    { z: 0.38, draw: () => { ctx.fillStyle = '#060C1A'; for (let i = 0; i < 9; i++) { const x = -100 + i * 150, h = 120 + rnd(i + 31) * 260; ctx.fillRect(x, 1300 - h, 130, h); for (let k = 0; k < 16; k++) if (rnd(i * 16 + k + 5) > 0.7) { ctx.fillStyle = 'rgba(150,200,255,0.35)'; ctx.fillRect(x + 12 + (k % 4) * 28, 1300 - h + 20 + Math.floor(k / 4) * 40, 12, 18); ctx.fillStyle = '#060C1A'; } } } },
    { z: 0.6, draw: () => { // window frame + room
      ctx.fillStyle = '#03050A'; ctx.fillRect(-300, -300, 380, 2600); ctx.fillRect(1000, -300, 400, 2600); ctx.fillRect(-300, -300, 1800, 470); ctx.fillRect(-300, 1300, 1800, 900);
      line(540, 170, 540, 1300, '#03050A', 18); line(80, 735, 1000, 735, '#03050A', 14);
      line(80, 1300, 1000, 1300, 'rgba(160,200,240,0.25)', 3);
      P(rr(-300, 1360, 1800, 40, 0), '#0B0F18', null); line(-300, 1360, 1500, 1360, 'rgba(120,160,220,0.35)', 3);
      // laptop glow on the desk + person
      glow(330, 1330, 260, '#6AA0FF', 0.3); withT(330, 1360, 0.9, 0, () => { P(poly([-120, 0, 120, 0, 100, -12, -100, -12]), '#1A1E28', null); P(rr(-110, -150, 220, 140, 8), '#151A26', null); P(rr(-100, -142, 200, 124, 4), '#2A4A7A', null); });
      const turn = seg(call, 0.2, 0.8);
      person(640, 1380, 1.25, { sit: 1, f: turn > 0.5 ? 1 : -1, rim: turn > 0.5 ? M.gold2 : '#8AB4FF', rimA: 0.75, hair: 1 });
    } },
  ], { zoom: lerp(1.0, 1.08, ease(t / d)), px: lerp(15, -15, ease(t / d)), py: 0 });
  if (call > 0) { waves(780, 400, t, Math.PI * 0.62, 6, 760, 0.5 * call, '246,210,122'); glow(640, 1080, 200, '#FFE2A0', 0.2 * call); }
  dust(t, 30, [100, 200, 880, 1000], '190,215,255', 11);
};
DRAW.sc6 = (t, d) => { // traveller walking home across the dunes + quote card 2
  const u = lt('q2'); const step = t * 3.2;
  desert(t, d, { cam: { zoom: lerp(1.0, 1.08, ease(t / d)), px: lerp(-15, 15, ease(t / d)), py: 0 }, mx: 860, my: 200, mr: 85,
    far: () => { house(800, 1265, 0.75, 1); lantern(800, 1170, 0.35, t, 0); },
    mid: [{ z: 0.5, draw: () => { withT(lerp(250, 330, t / d), 1500 + Math.abs(Math.sin(step)) * -6, 1, 0, () => { person(0, 0, 0.75, { rim: R.teal2, rimA: 0.7, f: 1 }); }); } }] });
  ctx.fillStyle = `rgba(2,4,10,${0.4 * seg(u, -0.3, 0.2)})`; ctx.fillRect(0, 0, W, H);
  quoteCard('q2', 0, 'He who abides far away from his home is ever longing for the day he shall return.', '— Masnavi, Book I, Prologue (tr. Whinfield)', ['longing', 'return', 'home'], { cy: 640, size: 70, in: -0.25 });
};
DRAW.sc7 = (t, d) => { // TWIST: the reed only sings because it was cut and hollowed
  const u = lt('n6'), w = LINES.n6.words; const tcut = w[11][0], thol = w[13][0];
  const cut = seg(u, tcut - 0.05, tcut + 0.2), hol = easeOut(seg(u, thol - 0.1, thol + 1.0));
  const shake = 6 * (1 - seg(u, 0, 0.5)) * Math.sin(u * 50) + 5 * (1 - seg(u, tcut, tcut + 0.35)) * Math.sin(u * 60) * (u > tcut ? 1 : 0);
  layers([
    { z: 0.02, draw: () => { fullFill(grad(0, H, '#02060E', '#061A2A')); starsT(t, 90, 1900, 21); glow(W / 2, 960, 700, R.teal, 0.25 + 0.2 * hol); } },
    { z: 0.6, draw: () => { withT(W / 2, 960, 1, 0, () => { ney(0, 0, 780, -0.08, 1, 0.15 + 0.85 * hol, 0.3 + 0.7 * hol); });
      if (hol > 0) { alpha(hol, () => { withT(W / 2, 960, 1, -0.08, () => { const g = ctx.createLinearGradient(-390, 0, -390 + 780 * hol, 0); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(1, 'rgba(255,240,200,0.9)'); P(rr(-390, -5, 780 * hol, 10, 5), g, null); }); waves(W / 2 + 388, 930, t, -0.08, 6, 520, 0.6); waves(W / 2 - 388, 990, t, Math.PI - 0.08, 4, 300, 0.25); }); }
      if (cut > 0 && cut < 1) alpha(1 - cut, () => { withT(W / 2 + 400, 928, 1, -0.9, () => { glow(0, 0, 220, '#FFE2A0', 0.9); line(-220, 0, 220, 0, '#FFF6DE', 8); }); });
    } },
  ], { zoom: lerp(1.0, 1.12, ease(t / d)), px: shake, py: 0 });
  flash(u, '63,167,168', 0.35, 0.45); flash(u - tcut, '255,240,200', 0.25, 0.5);
  dust(t, 70, [0, 500, W, 900], '246,210,122', 13);
};
DRAW.sc8 = (t, d) => { // longing = a compass pointing home (the moon)
  const u = lt('n7'), w = LINES.n7.words; const tc = w[8][0];
  const settle = easeOut(seg(u, tc - 0.4, tc + 0.6)); const target = -0.62;
  const ang = lerp(Math.sin(u * 3.1) * 1.6 + Math.sin(u * 7.3) * 0.5, target + Math.sin(u * 4) * 0.03 * (1 - settle), settle);
  desert(t, d, { cam: { zoom: lerp(1.0, 1.08, ease(t / d)), px: 0, py: 0 }, mx: 860, my: 330, mr: 90,
    extra: [{ z: 0.75, draw: () => { withT(0, 0, 1, 0, () => { ctx.save(); ctx.translate(W / 2, 960); ctx.scale(1, 0.92); compass(0, 0, 300, ang, t); ctx.restore(); }); } }] });
  if (settle > 0.2) { ctx.save(); ctx.setLineDash([14, 18]); ctx.lineDashOffset = -t * 40; line(W / 2 + Math.sin(target) * 280, 960 - Math.cos(target) * 260, 860, 330, `rgba(246,210,122,${0.6 * settle})`, 4); ctx.restore(); glow(860, 330, 260, '#FFE2A0', 0.35 * settle); }
};
DRAW.sc9 = (t, d) => { // TODAY'S ACTION at dawn
  const u = lt('n8'), w = LINES.n8.words;
  layers([
    { z: 0.03, draw: () => { const sk = ctx.createLinearGradient(0, 0, 0, 1350); sk.addColorStop(0, '#0B1E3A'); sk.addColorStop(0.55, '#2E6F7A'); sk.addColorStop(0.85, '#E59A5A'); sk.addColorStop(1, '#F7C47A'); fullFill(sk); starsT(t, 50, 500, 31);
      const sy = lerp(1300, 1200, ease(t / d)); glow(W / 2, sy, 560, '#FFE0A0', 0.85); P(circ(W / 2, sy, 110), '#FFE7B0', null); } },
    { z: 0.2, draw: () => dunes(1260, 55, '#3A2A3A', 1.2, 'rgba(255,210,150,0.5)') },
    { z: 0.45, draw: () => dunes(1400, 80, '#1E1626', 2.6, 'rgba(255,200,130,0.5)') },
    { z: 0.7, draw: () => { dunes(1560, 60, '#0C0A12', 3.7, 'rgba(255,200,130,0.4)'); person(760, 1540, 1.05, { rim: M.gold2, rimA: 0.9, hair: 1, f: -1 }); glow(700, 1360, 60, '#9AC0FF', 0.3); } },
  ], { zoom: lerp(1.0, 1.08, ease(t / d)), px: lerp(-20, 20, ease(t / d)), py: 0 });
  dust(t, 40, [0, 500, W, 900], '255,230,180', 17);
  const k = back(seg(u, 0.05, 0.4)); if (k > 0) withT(W / 2, 300, k, 0, () => { P(rr(-250, -48, 500, 96, 48), 'rgba(4,14,24,0.72)', M.gold, 3); txt("TODAY'S ACTION", 0, 3, 52, M.gold2, 'Oswald', 700); });
  const k2 = easeOut(seg(u, w[3][0], w[3][0] + 0.4)); if (k2 > 0) withT(W / 2, 520, 1, 0, () => alpha(k2, () => { P(rr(-420, -120, 840, 240, 20), 'rgba(234,219,184,0.95)', '#2A3A40', 3);
    txt('Name ONE thing you miss.', 0, -36, 60, '#24170C', 'CrimsonText', 700); const k3 = seg(u, w[9][0], w[9][0] + 0.3); alpha(k3, () => txt('Take one small step toward it.', 0, 44, 56, QA, 'CrimsonText', 700)); }));
};
DRAW.sc10 = (t, d) => { // comment question: whirling silhouette under lanterns
  const u = lt('n9'), w = LINES.n9.words;
  desert(t, d, { cam: { zoom: lerp(1.0, 1.08, ease(t / d)), px: 0, py: 0 }, mx: 780, my: 330, mr: 90, seed: 5,
    mid: [{ z: 0.5, draw: () => { glow(W / 2, 1150, 400, R.teal, 0.3); whirler(W / 2, 1450, 1.2, t, t * 2.4); } }],
    extra: [{ z: 0.9, draw: () => { lantern(140, 380, 0.95, t, 600); lantern(950, 520, 0.85, t + 2, 700); } }] });
  const kh = easeOut(seg(u, w[3][0] - 0.1, w[3][0] + 0.4)); if (kh > 0) heart(280, 760, 0.75 * kh, '#C9415A', 0.35);
  const kc = back(seg(u, w[6][0], w[6][0] + 0.35)); if (kc > 0) withT(W / 2 + 230, 520, kc, 0, () => { const b = new Path2D(); b.roundRect(-110, -70, 220, 130, 30); b.moveTo(-30, 60); b.lineTo(-60, 105); b.lineTo(10, 60); P(b, '#F6F2E8', '#111', 4); for (let i = -1; i <= 1; i++) P(circ(i * 48, -5, 13), '#222', null); });
};
function heart(x, y, s = 1, col = '#C9415A', g = 0.4) {
  withT(x, y, s, 0, () => { glow(0, 0, 180, col, g); const p = new Path2D(); p.moveTo(0, 60); p.bezierCurveTo(-110, -10, -70, -100, 0, -50); p.bezierCurveTo(70, -100, 110, -10, 0, 60); P(p, col, '#2A0A10', 4); alpha(0.35, () => P(ell(-35, -40, 18, 10, -0.6), '#fff', null)); });
}
DRAW.sc11 = (t, d) => { // end card: Follow Awazzzz · Mindset
  desert(t, d, { cam: { zoom: 1.1, px: 0, py: 0 }, mx: 800, my: 300, mr: 90 });
  ctx.fillStyle = 'rgba(2,4,10,0.6)'; ctx.fillRect(0, 0, W, H);
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
  GT = 5; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  desert(2, 4, { cam: { zoom: 1.04, px: 0, py: 0 }, mx: 800, my: 1000, mr: 150,
    mid: [{ z: 0.5, draw: () => { glow(W / 2, 1150, 400, R.teal, 0.3); whirler(W / 2, 1700, 1.15, 1, 1.2, M.gold2, 0.9); } }],
    extra: [{ z: 0.9, draw: () => { lantern(130, 1000, 0.9, 1, 600); lantern(960, 1150, 0.8, 2, 700); } }] });
  ctx.filter = 'none'; vign(0.55);
  withT(W / 2, 250, 1, 0, () => { ctx.font = '700 58px Oswald'; const s = 'RUMI'; const w = ctx.measureText(s).width + 110; P(rr(-w / 2, -46, w, 92, 46), 'rgba(16,70,82,0.95)', M.gold2, 4); txt(s, 0, 3, 58, '#FFF3D6', 'Oswald', 700); });
  bigText('WHY SO', W / 2, 460, 170, '#FFFFFF', 1);
  bigText('SAD?', W / 2, 640, 210, M.gold2, 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
  bigText('The Song of the Reed', W / 2, 1800, 66, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
