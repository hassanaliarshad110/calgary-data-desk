// ===== Awazzzz Mindset — "The Wall With No Paint" — Rumi, Masnavi Book I, Story XIV "The Chinese and the Greek Artists" (tr. Whinfield) — morning, dawn light
// New set for this episode: a dawn palace hall with two facing houses; the painted mural (generic flowers, waves, hills, birds,
// clouds — revealed by brush), the burnished wall (grime -> mirror, sheen sweeps, reflections in shifting hues), artist and polisher
// silhouettes, the Sultan silhouette with a simple crown, paint-pot rows, modern clutter (app tiles, course cards, noise) that clears.
const C_ = { sky0: '#06112E', sky1: '#1B2A57', sky2: '#5A5A86', sky3: '#E79A62', sun: '#FFE7B0', gold: '#F6D27A', gold2: '#C9962E',
  teal: '#3FA7A8', teal2: '#1E6F78', body: '#04060C', stone: '#101626', stone2: '#1A2236', silver: '#C9D6E8' };
const PAINTS = ['#D8452E', '#2FB37A', '#F2C14E', '#3D7DD8', '#E46AA0', '#7A4FD0', '#F08A3C', '#1FA3A8'];
function essenceTag(k, s = 'in essence · Masnavi, Book I, Story XIV') { if (k <= 0) return; alpha(k, () => { ctx.font = 'italic 600 40px CrimsonText'; const w = ctx.measureText(s).width + 50; P(rr(W / 2 - w / 2, 262, w, 64, 32), 'rgba(4,8,16,0.72)', 'rgba(63,167,168,0.8)', 2); txt(s, W / 2, 296, 40, '#DDE8F4', 'CrimsonText', 600); }); }
function wt(id, s) { const w = LINES[id].words; const i = w.findIndex(x => x[2].toLowerCase().replace(/[^a-z']/g, '').startsWith(s)); return i < 0 ? 0 : w[i][0]; }

// ---------- dawn sky
function dawnSky(t, o = {}) {
  const sx = o.sx ?? 540, sy = o.sy ?? 1050, k = o.k ?? 1;
  const g = ctx.createLinearGradient(0, 0, 0, sy + 200); g.addColorStop(0, C_.sky0); g.addColorStop(0.45, C_.sky1); g.addColorStop(0.78, C_.sky2); g.addColorStop(1, C_.sky3);
  ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, H + 800);
  alpha(0.7, () => { for (let i = 0; i < 80; i++) { const x = rnd(i * 3 + 5) * W, y = rnd(i * 7 + 2) * sy * 0.5; const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2 + i)); ctx.fillStyle = `rgba(230,240,255,${0.6 * tw * (1 - y / (sy * 0.55))})`; ctx.fillRect(x, y, 2.4, 2.4); } });
  glow(sx, sy, 900 * k, '#FF9A5A', 0.3); glow(sx, sy, 420 * k, '#FFD48A', 0.5);
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * 0.03); for (let i = 0; i < 18; i++) { ctx.rotate(Math.PI / 9); const a = 0.045 + 0.03 * Math.sin(t * 0.8 + i * 1.7); ctx.fillStyle = `rgba(255,220,150,${a * k})`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1500, -60); ctx.lineTo(1500, 60); ctx.closePath(); ctx.fill(); } ctx.restore();
  P(circ(sx, sy, 100 * (o.sr ?? 1)), C_.sun, null); glow(sx, sy, 170, '#FFF4D0', 0.55);
}

// ---------- painted mural: generic hills, waves, flowers, birds, clouds; k = brush reveal 0..1 (left to right, row by row); hue = degrees shift
function mural(x, y, w, h, k, t, o = {}) {
  if (k <= 0) return; const hue = o.hue || 0;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  // reveal mask: diagonal brush sweep
  const rv = new Path2D(); const kk = clamp(k) * 1.25; rv.moveTo(x - 200, y - 200); rv.lineTo(x - 200 + (w + 600) * kk, y - 200); rv.lineTo(x - 200 + (w + 600) * kk - 300, y + h + 200); rv.lineTo(x - 200, y + h + 200); rv.closePath(); ctx.clip(rv);
  if (hue) ctx.filter = `hue-rotate(${hue}deg) saturate(1.2)`;
  const sky = ctx.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, '#F6E2B8'); sky.addColorStop(0.55, '#F4C58A'); sky.addColorStop(1, '#E58A6A'); ctx.fillStyle = sky; ctx.fillRect(x, y, w, h);
  P(circ(x + w * 0.72, y + h * 0.22, h * 0.09), '#D8452E', null);
  for (let i = 0; i < 4; i++) { const cy = y + h * (0.12 + i * 0.08), cx = x + ((i * 0.31 + t * 0.01) % 1) * w; alpha(0.85, () => { P(ell(cx, cy, 70, 18), '#FFFFFF', null); P(ell(cx + 40, cy - 12, 46, 16), '#FFFFFF', null); }); }
  // hills (layered, jade and blue)
  [[0.55, '#3D7DD8', 1.3], [0.62, '#2FB37A', 2.1], [0.7, '#1E6F78', 3.4]].forEach(([yy, c, sd]) => { const p = new Path2D(); p.moveTo(x, y + h); for (let xx = 0; xx <= w; xx += 12) p.lineTo(x + xx, y + h * yy - Math.abs(Math.sin(xx * 0.012 + sd)) * h * 0.13); p.lineTo(x + w, y + h); p.closePath(); P(p, c, null); });
  // waves band
  ctx.save(); ctx.strokeStyle = '#F6F2E8'; ctx.lineWidth = 4; for (let r = 0; r < 3; r++) { const yy = y + h * (0.8 + r * 0.06); for (let xx = 0; xx < w + 60; xx += 60) { ctx.beginPath(); ctx.arc(x + xx + (r % 2) * 30, yy, 26, Math.PI, 0); ctx.stroke(); } } ctx.restore();
  ctx.fillStyle = 'rgba(40,90,170,0.55)'; ctx.fillRect(x, y + h * 0.78, w, h * 0.22);
  // flowers
  for (let i = 0; i < 9; i++) { const fx = x + w * (0.06 + i * 0.11), fy = y + h * (0.66 + 0.06 * Math.sin(i * 2.3)); line(fx, fy, fx, fy + 70, '#1D5A3A', 5); for (let p = 0; p < 5; p++) { const a = p * 1.2566 + t * 0.2; P(ell(fx + Math.cos(a) * 18, fy + Math.sin(a) * 18, 16, 10, a), PAINTS[(i + p) % PAINTS.length], null); } P(circ(fx, fy, 9), '#F2C14E', null); }
  // birds
  for (let i = 0; i < 5; i++) { const bx = x + w * (0.15 + i * 0.16) + Math.sin(t + i) * 10, by = y + h * (0.32 + 0.05 * Math.sin(i * 1.7)); ctx.strokeStyle = '#2A1A20'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bx - 26, by); ctx.quadraticCurveTo(bx - 12, by - 16 - 6 * Math.sin(t * 6 + i), bx, by); ctx.quadraticCurveTo(bx + 12, by - 16 - 6 * Math.sin(t * 6 + i), bx + 26, by); ctx.stroke(); }
  ctx.filter = 'none';
  // wet brush edge glow
  if (k < 1) { const ex = x - 200 + (w + 600) * kk - 150; glow(ex, y + h / 2, 160, '#FFE2A0', 0.35); }
  ctx.restore();
  ctx.strokeStyle = 'rgba(246,210,122,0.85)'; ctx.lineWidth = 8; ctx.strokeRect(x, y, w, h);
}
// ---------- burnished wall: grime (shine 0) -> mirror (shine 1). o.reflect: fn drawing what it reflects; o.sky: reflects the heavens
function mirrorWall(x, y, w, h, shine, t, o = {}) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  P(rr(x, y, w, h, 0), grad(y, y + h, C_.stone2, C_.stone), null);
  // stone courses
  alpha(0.35 * (1 - shine), () => { for (let r = 0; r < 14; r++) { const yy = y + r * h / 14; line(x, yy, x + w, yy, '#0A0E18', 3); for (let c = 0; c < 6; c++) { const xx = x + (c + (r % 2) * 0.5) * w / 5.5; line(xx, yy, xx, yy + h / 14, '#0A0E18', 3); } } });
  // grime blotches
  alpha(0.75 * (1 - shine), () => { for (let i = 0; i < 26; i++) P(ell(x + rnd(i * 3.1) * w, y + rnd(i * 5.7) * h, 40 + rnd(i) * 90, 25 + rnd(i * 2) * 60, rnd(i * 9) * 3), i % 2 ? '#2A2418' : '#1A1610', null); });
  // mirror base
  if (shine > 0) {
    alpha(shine, () => { const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#9FB4D6'); g.addColorStop(0.5, '#E6EEF8'); g.addColorStop(1, '#8EA3C8'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); });
    if (o.sky) alpha(shine * 0.9, () => { ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(w / W, h / H * 1.2); ctx.translate(-W / 2, -H / 2); dawnSky(t, { sx: W / 2, sy: H * 0.55, k: 1.2 }); ctx.restore(); });
    if (o.reflect) alpha(shine * (o.refA ?? 0.9), () => { o.reflect(); });
    // sheen sweep
    const sw = ((t * 0.45) % 1.8) - 0.4; alpha(0.5 * shine, () => beam(x + sw * w, y - 50, 60, x + sw * w - 260, y + h + 50, 60, '255,255,255', 0.85));
    alpha(0.3 * shine, () => beam(x + sw * w + 120, y - 50, 18, x + sw * w - 140, y + h + 50, 18, '255,255,255', 0.85));
  }
  ctx.restore();
  ctx.strokeStyle = shine > 0.5 ? 'rgba(220,235,255,0.9)' : 'rgba(120,130,150,0.6)'; ctx.lineWidth = 8; ctx.strokeRect(x, y, w, h);
  if (shine > 0.6) glow(x + w / 2, y + h / 2, Math.max(w, h) * 0.6, '#CFE4FF', 0.18 * shine);
}
// ---------- silhouettes
function sultan(x, y, s, t, rimA = 0.85) { // robed figure with a simple crown, facing f
  withT(x, y, s, 0, () => {
    const p = new Path2D(); p.moveTo(-30, -380); p.bezierCurveTo(60, -380, 100, -340, 110, -290); p.lineTo(150, 0); p.lineTo(-150, 0); p.lineTo(-110, -290); p.bezierCurveTo(-100, -340, -70, -380, -30, -380); p.closePath();
    P(p, C_.body, null); P(ell(0, -430, 46, 54), C_.body, null); P(rr(-18, -392, 36, 30, 6), C_.body, null);
    P(poly([-44, -470, -50, -520, -24, -494, 0, -532, 24, -494, 50, -520, 44, -470]), '#D9A43A', '#3A2208', 3);
    ctx.save(); ctx.globalAlpha = rimA; ctx.strokeStyle = 'rgba(255,200,140,0.95)'; ctx.lineWidth = 5; ctx.translate(4, 0); ctx.stroke(p); ctx.beginPath(); ctx.ellipse(0, -430, 46, 54, 0, -1.3, 1.3); ctx.stroke(); ctx.restore();
  });
}
function artist(x, y, s, t, o = {}) { // painter on the floor, arm raised with a brush; o.f facing, o.col brush colour
  const f = o.f || 1, ph = o.ph || 0;
  withT(x, y, s, 0, () => { ctx.scale(f, 1); person(0, 0, 1, { col: C_.body, rim: o.rim || 'rgba(255,200,140,0.9)', rimA: 0.8 });
    const a = -1.0 + Math.sin(t * 3 + ph) * 0.35; const sx = 70, sy = -320, ex = sx + Math.cos(a) * 170, ey = sy + Math.sin(a) * 170;
    line(sx, sy, ex, ey, C_.body, 34); line(ex, ey, ex + Math.cos(a) * 90, ey + Math.sin(a) * 90, '#5A3A1A', 8); P(circ(ex + Math.cos(a) * 96, ey + Math.sin(a) * 96, 12), o.col || PAINTS[0], null); });
}
function polisher(x, y, s, t, o = {}) { // worker rubbing the wall with a cloth in circles
  const f = o.f || 1, ph = o.ph || 0;
  withT(x, y, s, 0, () => { ctx.scale(f, 1); person(0, 0, 1, { col: C_.body, rim: o.rim || 'rgba(190,220,255,0.9)', rimA: 0.85 });
    const cx = 230 + Math.cos(t * 4 + ph) * 40, cy = -330 + Math.sin(t * 4 + ph) * 40; line(70, -320, cx, cy, C_.body, 34); P(ell(cx + 14, cy, 34, 26, t), '#DCE6F2', '#1A2236', 3); });
}
function paintPots(cx, y, n, s, t, k = 1) { for (let i = 0; i < n; i++) { const kk = back(seg(k * n, i * 0.6, i * 0.6 + 1)); if (kk <= 0) continue; const x = cx + (i - (n - 1) / 2) * 120 * s; withT(x, y + (1 - kk) * 80, s * kk, 0, () => { P(rr(-46, -70, 92, 76, 10), '#2A2030', '#0A0810', 3); P(ell(0, -70, 46, 14), PAINTS[i % PAINTS.length], null); glow(0, -70, 60, PAINTS[i % PAINTS.length], 0.35); P(rr(-46, -40, 92, 14, 0), 'rgba(246,210,122,0.4)', null); }); } }
// ---------- the palace hall: two facing houses seen in 3/4 view (left painted, right polished), dais, lanterns, dawn sky through the arch
function hall(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.06, 20);
  layers([
    { z: 0.02, draw: () => dawnSky(t, { sx: 540, sy: o.sy ?? 900, k: 0.9 }) },
    { z: 0.14, haze: 0.05, draw: () => { // distant palace roofline + arch frame
      ctx.fillStyle = '#121630'; ctx.beginPath(); ctx.moveTo(-300, 1180); for (let x = -300; x <= W + 300; x += 90) ctx.lineTo(x, 1110 - (rnd(x) > 0.55 ? 70 + rnd(x + 2) * 60 : 10)); ctx.lineTo(W + 300, 1300); ctx.lineTo(-300, 1300); ctx.fill();
      const a = new Path2D(); a.rect(-400, -400, W + 800, H + 800); a.moveTo(140, 1250); a.lineTo(140, 640); a.quadraticCurveTo(140, 330, 540, 300); a.quadraticCurveTo(940, 330, 940, 640); a.lineTo(940, 1250); a.closePath(); ctx.fillStyle = '#0A0D1C'; ctx.fill(a, 'evenodd');
      ctx.strokeStyle = 'rgba(246,210,122,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(140, 1250); ctx.lineTo(140, 640); ctx.quadraticCurveTo(140, 330, 540, 300); ctx.quadraticCurveTo(940, 330, 940, 640); ctx.lineTo(940, 1250); ctx.stroke(); } },
    { z: 0.3, draw: () => { // floor in perspective
      P(poly([-400, 1250, W + 400, 1250, W + 800, 2300, -800, 2300]), grad(1250, 2100, '#1A1C30', '#05060C'), null);
      ctx.save(); ctx.strokeStyle = 'rgba(246,210,122,0.12)'; ctx.lineWidth = 3; for (let i = -9; i <= 9; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 60, 1250); ctx.lineTo(W / 2 + i * 300, 2300); ctx.stroke(); } for (let j = 0; j < 8; j++) { const yy = 1250 + j * j * 18; line(-400, yy, W + 400, yy, 'rgba(246,210,122,0.08)', 2); } ctx.restore();
      alpha(0.6, () => P(ell(540, 1330, 380, 50), 'rgba(255,180,110,0.25)', null)); } },
    { z: 0.45, draw: () => { // the two houses as facing walls (left = Chinese, right = Greek)
      const kp = o.paint ?? 1, sh = o.shine ?? 0;
      ctx.save(); ctx.transform(1, 0.22, 0, 1, 0, 0); P(rr(-60, 380, 420, 1060, 0), '#0B0E1A', null); P(rr(-30, 440, 360, 900, 0), grad(440, 1340, '#3A3246', '#1E1A28'), 'rgba(246,210,122,0.5)', 4); mural(-30, 440, 360, 900, kp, t, { hue: o.hueL || 0 }); ctx.restore();
      ctx.save(); ctx.transform(1, -0.22, 0, 1, 0, 0); P(rr(720, 616, 420, 1060, 0), '#0B0E1A', null);
      mirrorWall(750, 676, 360, 900, sh, t, { reflect: sh > 0 && o.reflectL ? () => { ctx.save(); ctx.translate(1860, 0); ctx.scale(-1, 1); mural(750, 676, 360, 900, kp, t, { hue: (t * 25) % 360 }); ctx.restore(); } : null, refA: 0.8 }); ctx.restore();
      if (o.labels) { alpha(o.labels, () => { chipAt('CHINESE', 170, 330, '#D8452E'); chipAt('GREEK', 910, 330, C_.teal); }); }
    } },
    ...(o.mid || []),
    { z: 0.9, draw: () => { lantern(120, 260, 0.9, t, 420); lantern(960, 230, 0.9, t + 2, 400); } },
  ], cam);
  dust(t, 50, [150, 500, 800, 1100], '255,220,170', o.seed || 4);
}
function chipAt(s, x, y, col) { ctx.font = '700 40px Oswald'; const w = ctx.measureText(s).width + 48; P(rr(x - w / 2, y - 32, w, 64, 32), 'rgba(6,8,16,0.75)', col, 3); txt(s, x, y + 2, 40, '#FFF3D6', 'Oswald', 700); }

// ================= SCENES =================
DRAW.sc1 = (t, d) => { // HOOK: split frame — top: an explosion of colour; bottom: a bare wall being wiped to a mirror. "Pick your winner."
  const u = lt('h1'); const tE = wt('h1', 'every'), tN = wt('h1', 'none'), tP = wt('h1', 'pick');
  const z = lerp(1.06, 1.0, ease(t / d));
  // top half: colour
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 958); ctx.clip(); withT(W / 2, 480, z, 0, () => { ctx.translate(-W / 2, -480);
    fullFill('#120A18'); mural(-40, 40, W + 80, 900, seg(u, -0.3, tE + 0.6), t, { hue: Math.sin(t) * 20 });
    for (let i = 0; i < 26; i++) { const a = i * 0.9 + t * 0.4, r = 120 + (i * 37 % 300) * easeOut(seg(u, 0, 1.2)); P(circ(540 + Math.cos(a) * r * 1.4, 520 + Math.sin(a) * r, 10 + (i % 4) * 6), PAINTS[i % PAINTS.length], null); }
    artist(250, 960, 1.0, t, { col: PAINTS[2] }); artist(860, 980, 0.95, t, { f: -1, ph: 1.3, col: PAINTS[3] }); }); ctx.restore();
  // bottom half: bare wall -> mirror
  ctx.save(); ctx.beginPath(); ctx.rect(0, 962, W, 958); ctx.clip(); withT(W / 2, 1440, z, 0, () => { ctx.translate(-W / 2, -1440);
    mirrorWall(-40, 962, W + 80, 1000, ease(seg(u, tN - 0.2, tP + 0.4)), t, { sky: 1 });
    polisher(200, 1900, 1.05, t); polisher(880, 1920, 1.0, t, { f: -1, ph: 2 }); }); ctx.restore();
  P(rr(0, 954, W, 12, 0), C_.gold, null); glow(540, 960, 300, '#FFE2A0', 0.3);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(0, 0, W, H);
  bigText('EVERY COLOUR', W / 2, 330, 108, '#FFFFFF', seg(u, tE - 0.15, tE + 0.15));
  bigText('NO COLOUR', W / 2, 1180, 108, C_.silver, seg(u, tN - 0.3, tN));
  const kp = seg(u, tP - 0.15, tP + 0.15); if (kp > 0) { bigText('PICK YOUR WINNER', W / 2, 960, 86, C_.gold, kp); }
};
DRAW.sc2 = (t, d) => { // Rumi tells of a contest — the palace hall, the Sultan on the dais, two houses waiting
  const u = lt('n2'); const tC = wt('n2', 'chinese'), tG = wt('n2', 'greek'), tS = wt('n2', 'sultan');
  hall(t, d, { paint: 0, shine: 0, labels: 0, cam: { zoom: lerp(1.1, 1.0, ease(t / d)), px: 0, py: lerp(-40, 0, ease(t / d)) }, mid: [
    { z: 0.6, draw: () => { const k = seg(u, tS - 0.4, tS + 0.3); P(rr(390, 1500, 300, 60, 10), '#2A1E14', 'rgba(246,210,122,0.5)', 3); alpha(0.4 + 0.6 * k, () => sultan(540, 1505, 0.95, t)); glow(540, 1100, 240, '#FFD48A', 0.25 * k);
      alpha(seg(u, tC - 0.2, tC + 0.2), () => { glow(200, 900, 260, '#D8452E', 0.35); chipAt('CHINESE', 210, 820, '#D8452E'); });
      alpha(seg(u, tG - 0.2, tG + 0.2), () => { glow(880, 900, 260, C_.teal, 0.35); chipAt('GREEK', 870, 820, C_.teal); }); } },
  ] });
  chipTop('MASNAVI · BOOK I', 300, C_.gold);
};
DRAW.sc3 = (t, d) => { // The Chinese gather every kind of paint... and cover their walls with wonders
  const u = lt('n3'); const tP = wt('n3', 'paint'), tW = wt('n3', 'wonders');
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#140A16', '#05030A')); glow(540, 800, 700, '#D8452E', 0.18); } },
    { z: 0.25, draw: () => { P(rr(40, 260, 1000, 1080, 0), '#120E18', null); P(rr(60, 280, 960, 1040, 0), grad(280, 1320, '#3A3246', '#1E1A28'), null); mural(60, 280, 960, 1040, seg(u, 0, tW + 0.2), t); } },
    { z: 0.45, draw: () => { P(poly([-300, 1340, W + 300, 1340, W + 600, 2200, -600, 2200]), grad(1340, 2000, '#22162A', '#06040A'), null); paintPots(540, 1540, 8, 1.0, t, seg(u, 0.2, tP + 0.3)); } },
    { z: 0.7, draw: () => { artist(230, 1960, 1.25, t, { col: PAINTS[0] }); artist(820, 1990, 1.2, t, { f: -1, ph: 1.7, col: PAINTS[1] }); } },
  ], { zoom: lerp(1.0, 1.08, ease(t / d)), px: lerp(-20, 20, ease(t / d)), py: 0 });
  dust(t, 40, [100, 300, 880, 1000], '255,200,150', 6);
};
DRAW.sc4 = (t, d) => { // The Greeks used no colours at all. They just cleaned... and polished.
  const u = lt('n4'); const tN = wt('n4', 'colours'), tC = wt('n4', 'cleaned'), tPo = wt('n4', 'polished');
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#0A1020', '#03050A')); glow(540, 800, 700, C_.teal, 0.15); } },
    { z: 0.25, draw: () => { P(rr(40, 260, 1000, 1080, 0), '#0B0E1A', null); mirrorWall(60, 280, 960, 1040, 0.15 * seg(u, tC, tC + 1) + 0.35 * seg(u, tPo - 0.2, tPo + 1.2), t, { sky: 1 }); } },
    { z: 0.45, draw: () => { P(poly([-300, 1340, W + 300, 1340, W + 600, 2200, -600, 2200]), grad(1340, 2000, '#141A2C', '#04050A'), null);
      // empty paint pots (none used): one row of dark, empty pots with a gold "0"
      alpha(1 - seg(u, tC - 0.3, tC), () => { for (let i = 0; i < 5; i++) withT(300 + i * 120, 1560, 0.9, 0, () => { P(rr(-46, -70, 92, 76, 10), '#1A1C26', '#0A0810', 3); P(ell(0, -70, 46, 14), '#0A0C14', null); }); });
       } },
    { z: 0.7, draw: () => { polisher(180, 1960, 1.25, t, {}); polisher(900, 1990, 1.2, t, { f: -1, ph: 2.2 }); } },
  ], { zoom: lerp(1.0, 1.08, ease(t / d)), px: lerp(20, -20, ease(t / d)), py: 0 });
  dust(t, 40, [100, 300, 880, 1000], '200,220,255', 7);
};
DRAW.sc5 = (t, d) => { // QUOTE CARD 1 — the wall becomes as clear and bright as the heavens
  const u = lt('q1'); const tH = wt('q1', 'heavens');
  layers([
    { z: 0.02, draw: () => { fullFill('#050812'); } },
    { z: 0.2, draw: () => { mirrorWall(0, 0, W, H, lerp(0.5, 1, ease(seg(u, 0, tH + 0.4))), t, { sky: 1 }); } },
    { z: 0.6, draw: () => { polisher(200, 2000, 1.3, t, {}); polisher(880, 2020, 1.25, t, { f: -1, ph: 1 }); } },
  ], { zoom: lerp(1.0, 1.05, ease(t / d)), px: 0, py: 0, cy: 1100 });
  quoteCard('q1', 0, '...burnishing them till they were as clear and bright as the heavens.', '— Masnavi, Book I, Story XIV (tr. E. H. Whinfield)', ['clear', 'bright', 'heavens'], { cy: 640, size: 64 });
};
DRAW.sc6 = (t, d) => { // The Sultan inspects both. The painted house is much admired. But in the end...
  const u = lt('n5'); const tI = wt('n5', 'inspects'), tA = wt('n5', 'admired'), tB = wt('n5', 'but');
  const turn = seg(u, tB - 0.1, tB + 0.8);
  hall(t, d, { paint: 1, shine: 0.9, labels: 0, reflectL: 0, cam: { zoom: lerp(1.0, 1.12, ease(t / d)), px: lerp(-60, 60, turn), py: 0 }, mid: [
    { z: 0.6, draw: () => { const x = lerp(lerp(540, 330, seg(u, tI - 0.3, tA)), 760, turn); sultan(x, 1640, 1.0, t); glow(240, 900, 300, '#F2C14E', 0.35 * seg(u, tA - 0.4, tA) * (1 - turn)); } },
  ] });
  ctx.fillStyle = `rgba(0,0,0,${0.35 * turn})`; ctx.fillRect(0, 0, W, H);
  alpha(seg(u, tA - 0.3, tA) * (1 - turn), () => chipTop('MUCH ADMIRED', 300, '#F2C14E'));
};
DRAW.sc7 = (t, d) => { // QUOTE CARD 2 — the Greek house wins: burst of light from the mirror wall
  const u = lt('q2'); const tP = wt('q2', 'palm');
  layers([
    { z: 0.02, draw: () => { fullFill('#04060C'); } },
    { z: 0.2, draw: () => { ctx.save(); ctx.translate(540, 1000); ctx.scale(1.25, 1.25); ctx.translate(-540, -1000); mirrorWall(150, 380, 780, 1240, 1, t, { reflect: () => { ctx.save(); ctx.translate(1080, 0); ctx.scale(-1, 1); mural(150, 380, 780, 1240, 1, t, { hue: (t * 30) % 360 }); ctx.restore(); }, refA: 0.75 }); ctx.restore(); glow(540, 1000, 700, '#CFE4FF', 0.25 + 0.2 * seg(u, tP - 0.2, tP + 0.3)); } },
    { z: 0.6, draw: () => { sultan(540, 2060, 1.15, t, 0.95); } },
  ], { zoom: lerp(1.08, 1.0, easeOut(seg(u, -0.2, 1.4))), px: 0, py: 0 });
  flash(u - tP + 0.1, '230,240,255', 0.3, 0.35);
  quoteCard('q2', 0, '...the Greek house carried off the palm.', '— Masnavi, Book I, Story XIV (tr. E. H. Whinfield)', ['greek', 'palm'], { cy: 640, size: 70 });
};
DRAW.sc8 = (t, d) => { // Their shining walls caught every colour... in endless shades — the mirror reflecting the mural, hues cycling
  const u = lt('n6'); const tE = wt('n6', 'endless');
  hall(t, d, { paint: 1, shine: 1, reflectL: 1, labels: 0, cam: { zoom: lerp(1.05, 1.22, ease(t / d)), px: lerp(0, 160, ease(t / d)), py: -20, cy: 1000 }, mid: [
    { z: 0.55, draw: () => { // light threads from the painted wall into the mirror
      for (let i = 0; i < 7; i++) { const y1 = 600 + i * 120, k = seg(u, 0.2 + i * 0.12, 1.2 + i * 0.12); if (k <= 0) continue; ctx.save(); ctx.globalAlpha = 0.35 * k; ctx.strokeStyle = PAINTS[i]; ctx.lineWidth = 6; ctx.shadowColor = PAINTS[i]; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(320, y1 + 60); ctx.lineTo(lerp(320, 760, k), lerp(y1 + 60, y1 + 140, k)); ctx.stroke(); ctx.restore(); } } },
  ] });
  alpha(seg(u, tE - 0.3, tE), () => { for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + t; glow(540 + Math.cos(a) * 380, 1000 + Math.sin(a) * 520, 90, PAINTS[i % PAINTS.length], 0.25); } });
};
DRAW.sc9 = (t, d) => { // In essence... what your heart truly knows beats what you only learned from books
  const u = lt('n7'); const tH = wt('n7', 'heart'), tB = wt('n7', 'books');
  layers([
    { z: 0.02, draw: () => dawnSky(t, { sx: 540, sy: 1200, k: 0.8 }) },
    { z: 0.2, haze: 0.1, draw: () => { fullFill('rgba(4,6,14,0.55)'); } },
    { z: 0.4, draw: () => { // left: tall stack of books, dimming; right: a polished heart-mirror catching the dawn
      const kb = seg(u, tB - 0.3, tB + 0.6);
      for (let i = 0; i < 9; i++) withT(270 + (i % 2) * 10, 1500 - i * 70, 1, (i % 3 - 1) * 0.03, () => { P(rr(-150, -32, 300, 64, 6), ['#5A1A12', '#2A3A5A', '#3A4A2A', '#5A4A1A'][i % 4], '#0A0608', 3); line(-140, -10, 140, -10, 'rgba(246,210,122,0.4)', 3); });
      ctx.fillStyle = `rgba(3,4,10,${0.5 * kb})`; ctx.fillRect(80, 820, 400, 760);
      const kh = seg(u, tH - 0.3, tH + 0.4); withT(780, 1150, lerp(1.6, 2.2, easeOut(kh)), 0, () => { const p = new Path2D(); p.moveTo(0, 60); p.bezierCurveTo(-110, -10, -70, -100, 0, -50); p.bezierCurveTo(70, -100, 110, -10, 0, 60); glow(0, 0, 200, '#CFE4FF', 0.3 + 0.4 * kh);
        const g = ctx.createLinearGradient(-90, -90, 90, 60); g.addColorStop(0, '#9FB4D6'); g.addColorStop(0.5, '#F4F8FF'); g.addColorStop(1, '#8EA3C8'); P(p, g, '#F6D27A', 4);
        ctx.save(); ctx.clip(p); const sw = ((t * 0.5) % 1.6) - 0.3; alpha(0.6, () => beam(-120 + sw * 240, -110, 14, -60 + sw * 240, 80, 14, '255,255,255', 0.9)); P(circ(20, -10, 22), 'rgba(255,215,150,0.8)', null); ctx.restore(); }); } },
    { z: 0.75, draw: () => { candleM(120, 1640, t, 1.0, 100); } },
  ], { zoom: lerp(1.0, 1.07, ease(t / d)), px: lerp(-20, 30, ease(t / d)), py: 0 });
  essenceTag(seg(u, -0.1, 0.3));
};
DRAW.sc10 = (t, d) => { // We try to grow by adding... apps, courses, noise. Sometimes, we grow by clearing.
  const u = lt('n8'); const tA = wt('n8', 'apps'), tC = wt('n8', 'courses'), tN = wt('n8', 'noise'), tCl = wt('n8', 'clearing');
  const clr = ease(seg(u, tCl - 0.3, tCl + 0.9));
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#0E1430', '#05060E')); } },
    { z: 0.15, draw: () => { // dawn window behind the desk
      P(rr(240, 300, 600, 760, 20), '#0A0C18', null); ctx.save(); ctx.beginPath(); ctx.rect(260, 320, 560, 720); ctx.clip(); dawnSky(t, { sx: 540, sy: 1000, k: 0.6 + 0.8 * clr }); ctx.restore(); line(540, 320, 540, 1040, '#0A0C18', 14); line(260, 680, 820, 680, '#0A0C18', 14); } },
    { z: 0.35, draw: () => { // desk surface: cluttered -> polished, reflecting the window
      P(poly([-200, 1240, W + 200, 1240, W + 400, 2100, -400, 2100]), grad(1240, 2000, '#2A1E1A', '#0A0606'), null);
      alpha(clr, () => { ctx.save(); ctx.beginPath(); ctx.moveTo(-200, 1240); ctx.lineTo(W + 200, 1240); ctx.lineTo(W + 400, 2100); ctx.lineTo(-400, 2100); ctx.closePath(); ctx.clip(); ctx.translate(0, 2480); ctx.scale(1, -1); P(rr(260, 320, 560, 720, 0), grad(320, 1040, '#E79A62', '#1B2A57'), null); ctx.restore(); }); } },
    { z: 0.5, draw: () => { // clutter piles in, then slides away
      const items = []; for (let i = 0; i < 10; i++) items.push(['app', i, tA]); for (let i = 0; i < 6; i++) items.push(['course', i, tC]); for (let i = 0; i < 8; i++) items.push(['noise', i, tN]);
      items.forEach(([k, i, t0], j) => { const kin = back(seg(u, t0 - 0.2 + i * 0.05, t0 + 0.2 + i * 0.05)); if (kin <= 0) return; const dir = j % 2 ? 1 : -1; const out = clr * (1.1 + rnd(j) * 0.6);
        const x = 160 + rnd(j * 3.3) * 760 + dir * out * 900, y = 900 + rnd(j * 7.1) * 720 + out * 120; withT(x, y, kin, (rnd(j) - 0.5) * 0.5 + dir * out, () => {
          if (k === 'app') { P(rr(-55, -55, 110, 110, 26), PAINTS[i % PAINTS.length], 'rgba(0,0,0,0.6)', 3); P(circ(0, 0, 22), 'rgba(255,255,255,0.75)', null); P(circ(48, -48, 18), '#E62117', null); }
          else if (k === 'course') { P(rr(-110, -70, 220, 140, 12), '#F0E6D2', '#1A1410', 3); P(rr(-110, -70, 220, 36, [12, 12, 0, 0]), '#3D7DD8', null); for (let r = 0; r < 3; r++) line(-90, -10 + r * 26, 60 - r * 30, -10 + r * 26, '#5A4A3A', 6); }
          else { ctx.strokeStyle = 'rgba(255,120,90,0.85)'; ctx.lineWidth = 7; ctx.beginPath(); for (let xx = -90; xx <= 90; xx += 10) ctx.lineTo(xx, Math.sin(xx * 0.2 + t * 12 + i) * (22 + 14 * Math.sin(t * 5 + i))); ctx.stroke(); } }); }); } },
  ], { zoom: lerp(1.04, 1.0, ease(t / d)), px: 0, py: 0 });
  alpha(clr, () => glow(540, 1400, 500, '#FFD9A0', 0.3));
};
DRAW.sc11 = (t, d) => { // Painting looks like progress. Polishing looks like nothing... until the light hits.
  const u = lt('n9'); const tPa = wt('n9', 'painting'), tPo = wt('n9', 'polishing'), tL = wt('n9', 'light'), tHi = wt('n9', 'hits');
  const hit = seg(u, tHi - 0.1, tHi + 0.5);
  layers([
    { z: 0.03, draw: () => { fullFill('#04060C'); } },
    { z: 0.25, draw: () => { // left half: bright painted progress; right half: a dark wall being polished
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 538, H); ctx.clip(); mural(-20, 220, 560, 1180, seg(u, tPa - 0.4, tPo), t); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(542, 0, 538, H); ctx.clip(); mirrorWall(542, 220, 560, 1180, lerp(0.08, 1, hit), t, { sky: 1 }); ctx.restore();
      P(rr(536, 0, 8, H, 0), C_.gold, null);
      // the light beam
      if (u > tL - 0.4) { const kb = seg(u, tL - 0.4, tHi); beam(1180, -100, 40, lerp(1180, 820, kb), lerp(-100, 800, kb), 160, '255,226,170', 0.4 * kb); }
      glow(820, 800, 600 * hit, '#FFE8B8', 0.32 * hit); } },
    { z: 0.45, draw: () => { P(rr(-300, 1400, W + 600, 700, 0), grad(1400, 1900, '#141A2C', '#04050A'), null); } },
    { z: 0.7, draw: () => { artist(260, 1950, 1.15, t, { col: PAINTS[4] }); polisher(780, 1960, 1.15, t, { ph: 0.6 }); } },
  ], { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0 });
  alpha(seg(u, tPa - 0.2, tPa + 0.1) * (1 - hit), () => { chipAt('PROGRESS?', 270, 300, '#F2C14E'); });
  alpha(seg(u, tPo - 0.2, tPo + 0.1) * (1 - hit), () => { chipAt('NOTHING?', 810, 300, C_.silver); });
  flash(u - tHi, '255,245,220', 0.3, 0.3);
};
DRAW.sc12 = (t, d) => { // This morning, remove one thing before adding anything... a tab, an app, a grudge.
  const u = lt('n10'); const tR = wt('n10', 'remove'), tT = wt('n10', 'tab'), tAp = wt('n10', 'app'), tG = wt('n10', 'grudge');
  layers([
    { z: 0.02, draw: () => dawnSky(t, { sx: 540, sy: 1250, k: 1.1 }) },
    { z: 0.2, haze: 0.05, draw: () => { ctx.fillStyle = '#0C1022'; ctx.beginPath(); ctx.moveTo(-300, 1500); for (let x = -300; x <= W + 300; x += 60) ctx.lineTo(x, 1420 - 30 * Math.sin(x * 0.006) - (rnd(x) > 0.7 ? 80 : 0)); ctx.lineTo(W + 300, 2200); ctx.lineTo(-300, 2200); ctx.fill(); } },
    { z: 0.45, draw: () => { // three things, each wiped away at its word
      const items = [['tab', 260, tT], ['app', 540, tAp], ['grudge', 820, tG]];
      items.forEach(([k, x, t0], i) => { const kin = back(seg(u, tR + i * 0.15 - 0.3, tR + i * 0.15)); const gone = seg(u, t0 - 0.05, t0 + 0.45); if (kin <= 0 || gone >= 1) return;
        withT(x, 900 - gone * 260, kin * (1 - 0.3 * gone), gone * 0.6 * (i - 1), () => alpha(1 - gone, () => {
          if (k === 'tab') { P(rr(-120, -80, 240, 160, 14), '#E8EEF6', '#0A0C14', 4); P(rr(-120, -80, 120, 40, [14, 14, 0, 0]), '#3D7DD8', null); txt('×', 92, -58, 40, '#E62117', 'Montserrat', 900); for (let r = 0; r < 3; r++) line(-90, -10 + r * 28, 70, -10 + r * 28, '#8A96A8', 8); }
          else if (k === 'app') { P(rr(-80, -80, 160, 160, 38), PAINTS[5], '#0A0C14', 4); P(circ(0, 0, 34), 'rgba(255,255,255,0.8)', null); P(circ(70, -70, 26), '#E62117', null); txt('99', 70, -70, 26, '#fff', 'Montserrat', 900); }
          else { ctx.strokeStyle = '#B85A3A'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-120, 40); ctx.bezierCurveTo(-60, -80, 20, 80, 0, 0); ctx.bezierCurveTo(-30, -60, 60, -70, 50, 10); ctx.bezierCurveTo(40, 70, 100, 40, 120, -40); ctx.stroke(); glow(0, 0, 120, '#C0392B', 0.3); }
          if (gone > 0) { ctx.globalAlpha = gone; P(ell(0, 0, 160, 120), 'rgba(230,240,255,0.5)', null); } })); });
      // what remains: the clean, shining surface
      const kc = seg(u, tG + 0.2, tG + 1.0); if (kc > 0) glow(540, 900, 420 * kc, '#FFE8B8', 0.5 * kc); } },
  ], { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0 });
  alpha(seg(u, -0.1, 0.25), () => chipTop('THIS MORNING', 300, C_.gold));
  bigText('REMOVE ONE THING', W / 2, 470, 88, '#FFFFFF', seg(u, tR - 0.1, tR + 0.2));
};
DRAW.sc13 = (t, d) => { // What would you clear first? One word, below. — a fogged mirror, a clear stripe wiped across it
  const u = lt('n11'); const tC = wt('n11', 'clear'), tW = wt('n11', 'word');
  layers([
    { z: 0.02, draw: () => { fullFill('#05070E'); } },
    { z: 0.2, draw: () => { mirrorWall(90, 600, 900, 1080, 1, t, { sky: 1 }); // fog over the mirror with a wiped stripe
      ctx.save(); ctx.beginPath(); ctx.rect(90, 600, 900, 1080); ctx.clip(); const k = ease(seg(u, tC - 0.3, tC + 0.9)); const sx = lerp(90, 990, k);
      const fog = new Path2D(); fog.rect(90, 600, 900, 1080); fog.moveTo(90, 1020); fog.lineTo(sx, 1020); fog.lineTo(sx, 1260); fog.lineTo(90, 1260); fog.closePath();
      ctx.fillStyle = 'rgba(170,180,200,0.82)'; ctx.fill(fog, 'evenodd'); for (let i = 0; i < 40; i++) P(circ(90 + rnd(i * 2.7) * 900, 600 + rnd(i * 4.1) * 1080, 4 + rnd(i) * 6), 'rgba(255,255,255,0.35)', null); ctx.restore();
      P(rr(70, 580, 940, 1120, 18), null, '#C9962E', 14); } },
    { z: 0.6, draw: () => { const k = ease(seg(u, tC - 0.3, tC + 0.9)); withT(lerp(90, 990, k), 1140, 1.1, 0, () => { P(ell(0, 0, 70, 52, 0.3), '#DCE6F2', '#1A2236', 4); line(0, 40, -40, 320, C_.body, 60); }); } },
  ], { zoom: lerp(1.03, 1.0, ease(t / d)), px: 0, py: 0 });
  bigText('WHAT WOULD YOU', W / 2, 360, 88, '#FFFFFF', seg(u, -0.1, 0.15));
  bigText('CLEAR FIRST?', W / 2, 480, 100, C_.gold, seg(u, tC - 0.15, tC + 0.15));
  const kc = back(seg(u, tW - 0.3, tW + 0.1)); if (kc > 0) withT(W / 2, 1560, kc, 0, () => { const b = new Path2D(); b.roundRect(-150, -70, 300, 130, 30); b.moveTo(-40, -70); b.lineTo(-70, -115); b.lineTo(0, -70); P(b, '#F6F2E8', '#111', 4); txt('1 word', 0, -4, 54, '#14100A', 'Montserrat', 900); });
};
DRAW.sc14 = (t, d) => { // end card: the polished wall holds the sunrise — Follow Awazzzz · Mindset
  layers([
    { z: 0.02, draw: () => { mirrorWall(-40, -40, W + 80, H + 80, 1, t, { sky: 1 }); } },
  ], { zoom: lerp(1.0, 1.04, t / d), px: 0, py: 0 });
  ctx.fillStyle = 'rgba(5,4,10,0.5)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0, 0.4)); const L = document.getElementById('logo');
  withT(W / 2, 600, lerp(0.8, 1, k), 0, () => alpha(k, () => { glow(0, 0, 320, M.gold, 0.4); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -135, -135, 270, 270); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.strokeStyle = M.gold; ctx.lineWidth = 6; ctx.stroke(); }));
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
  vign(0.55); grain(T);
  if (s.id !== 'sc14') { watermark(T); captions(); }
}
function drawCover() {
  GT = 0.2; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  // split: painted wall left, mirror wall right; sultan silhouette in the middle
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 538, H); ctx.clip(); fullFill('#120A18'); mural(-20, 0, 580, H, 1, 2); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(542, 0, 538, H); ctx.clip(); mirrorWall(542, 0, 560, H, 1, 2, { sky: 1 }); ctx.restore();
  P(rr(536, 0, 8, H, 0), C_.gold, null); glow(800, 900, 500, '#FFE8B8', 0.35);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, W, H);
  sultan(540, 1960, 1.6, 2, 0.95);
  vign(0.5);
  withT(W / 2, 300, 1, 0, () => { ctx.font = '700 54px Oswald'; const s = 'RUMI'; const w = ctx.measureText(s).width + 90; P(rr(-w / 2, -44, w, 88, 44), 'rgba(14,60,70,0.92)', M.gold2, 4); txt(s, 0, 3, 54, '#FFF3D6', 'Oswald', 700); });
  bigText('NO PAINT.', W / 2, 500, 150, '#FFFFFF', 1);
  bigText('STILL WON.', W / 2, 670, 150, M.gold2, 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
  bigText('The Painters & the Polishers', W / 2, 820, 60, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
