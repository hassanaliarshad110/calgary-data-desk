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
