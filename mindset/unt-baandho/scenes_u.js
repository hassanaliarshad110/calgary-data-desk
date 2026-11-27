// ===== "You Have Hands. Why Wait?" — Rumi's Voice scene set (Masnavi I, Story V "The Lion and the Beasts", tr. Whinfield)
// New this time: dawn savanna with flat-topped acacias, the animals' council (gazelles, fox, hare) facing the lion,
// "one a day" pebble tally, lion's paw close-up with claws catching the sunrise, an adobe house with a lit ladder
// to the roof and a climber, a night road with a sleeper and lurking highwaymen, the old stone well with two
// reflections, a modern dawn bedroom (dream-job thought bubble, SENT 0 counter), a before-noon clock + three cards,
// an hourglass comment beat, end card on a sunrise ladder.
const U = { gold: '#F6D27A', teal: '#3FA7A8', dawn: '#FFB56A', rose: '#E8806A', ink: '#04060C' };
function easeIO(x) { x = clamp(x); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
function tagU(s, x, y, k, col = U.gold, size = 42) { if (k <= 0) return; withT(x, y, lerp(0.85, 1, back(k)), 0, () => alpha(clamp(k * 1.6), () => { ctx.font = `700 ${size}px Oswald`; const w = ctx.measureText(s).width + 46; P(rr(-w / 2, -size * 0.76, w, size * 1.52, size * 0.76), 'rgba(8,6,10,0.8)', col, 3); txt(s, 0, 2, size, col, 'Oswald', 700); })); }

// ---- dawn sky: k 0 (pre-dawn blue) .. 1 (sunrise gold)
function dawnSky(t, k = 0.6, o = {}) {
  const hy = o.hy || 1180, sx = o.sx ?? 560;
  const g = ctx.createLinearGradient(0, 0, 0, hy); g.addColorStop(0, lerpC('#02050F', '#0A1C3E', k)); g.addColorStop(0.55, lerpC('#081C36', '#2B5876', k)); g.addColorStop(0.85, lerpC('#0E2A40', '#C77A5A', k)); g.addColorStop(1, lerpC('#14384A', '#FFB46A', k));
  ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, H + 800);
  starsT(t, Math.round(160 * (1 - k)), 800, o.seed || 5);
  const sy = lerp(hy + 140, hy - 90, k) + (o.sun ?? 0);
  glow(sx, sy, 900, '#FF9A50', 0.22 + 0.3 * k); glow(sx, sy, 260, '#FFE2A8', 0.25 + 0.45 * k);
  P(circ(sx, sy, 96), `rgba(255,228,170,${0.35 + 0.6 * k})`, null);
  alpha(0.18 + 0.2 * k, () => { for (let i = 0; i < 4; i++) P(ell(160 + i * 260 + Math.sin(t * 0.2 + i) * 30, 520 + i * 70, 220, 18), '#FFD9A0', null); });
}
function acacia(x, y, s, col = U.ink, rim = null) { withT(x, y, s, 0, () => {
  const tr = new Path2D(); tr.moveTo(-16, 0); tr.bezierCurveTo(-12, -120, -34, -220, -96, -300); tr.lineTo(-76, -308); tr.bezierCurveTo(-24, -252, -2, -204, 2, -168); tr.bezierCurveTo(18, -224, 62, -272, 126, -312); tr.lineTo(138, -298); tr.bezierCurveTo(62, -242, 24, -164, 16, 0); tr.closePath(); P(tr, col, null);
  for (let i = 0; i < 8; i++) P(ell(-230 + i * 66, -334 - Math.sin(i * 1.3) * 16, 104, 32), col, null); P(ell(0, -352, 262, 40), col, null);
  if (rim) { ctx.save(); ctx.strokeStyle = rim; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -354, 262, 40, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke(); ctx.restore(); }
}); }
function grass(y, n, t, col = U.ink, h = 70, seed = 1) { ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let i = 0; i < n; i++) { const x = rnd(i + seed) * (W + 200) - 100, hh = h * (0.5 + rnd(i * 3 + seed)), sw = Math.sin(t * 1.3 + i) * 8; ctx.beginPath(); ctx.moveTo(x, y + rnd(i * 7) * 40); ctx.quadraticCurveTo(x + sw * 0.5, y - hh * 0.5, x + sw, y - hh); ctx.stroke(); } }
// hare facing right, feet on y=0, ~230 px tall at s=1; o.hop phase 0..1
function hare(x, y, s, t, o = {}) { withT(x, y, s, 0, () => { if (o.f === -1) ctx.scale(-1, 1); const hp = o.hop || 0; ctx.translate(0, -Math.abs(Math.sin(hp * Math.PI)) * 70); ctx.rotate(-Math.sin(hp * Math.PI) * 0.15);
  const br = Math.sin(t * 3) * 2; const parts = [ell(-10, -62 + br, 72, 50, -0.15), ell(-56, -42, 42, 40), ell(58, -110 + br, 36, 31), ell(80, -102 + br, 22, 16), ell(-84, -66, 15, 15)];
  const e1 = new Path2D(); e1.ellipse(44, -176 + br, 13, 56, -0.3, 0, 6.283); const e2 = new Path2D(); e2.ellipse(64, -172 + br, 12, 52, 0.1 + Math.sin(t * 2) * 0.06, 0, 6.283);
  parts.push(e1, e2, rr(22, -34, 16, 34, 6), rr(-78, -16, 66, 16, 8));
  rimDraw(parts, o.rim || U.gold, o.rimA ?? 0.85, [5, -4]); if (o.eye) P(circ(68, -116 + br, 4.5), `rgba(255,226,150,${o.eye})`, null); }); }
// gazelle facing right, feet on y=0, ~460 px tall incl. horns
function gazelle(x, y, s, t, o = {}) { withT(x, y, s, 0, () => { if (o.f === -1) ctx.scale(-1, 1); const br = Math.sin(t * 1.4 + x * 0.01) * 2, nod = o.nod || 0;
  const parts = [ell(0, -200 + br, 112, 46)];
  [-82, -52, 60, 88].forEach(lx => parts.push(poly([lx - 10, -186, lx + 10, -186, lx + 4, 0, lx - 4, 0])));
  parts.push(ell(-114, -214, 12, 26, 0.5));
  ctx.save(); ctx.translate(80, -220); ctx.rotate(nod);
  const nk = poly([-14, 0, 22, -112, 52, -110, 26, 12]); const hd = ell(46, -122 + br, 36, 20, 0.3), mz = ell(78, -110 + br, 18, 12, 0.4);
  const h1 = new Path2D(); h1.moveTo(34, -138); h1.bezierCurveTo(28, -200, 2, -232, -20, -244); const h2 = new Path2D(); h2.moveTo(50, -138); h2.bezierCurveTo(48, -204, 24, -236, 6, -246);
  rimDraw([nk, hd, mz, { s: h1, w: 7 }, { s: h2, w: 7 }], o.rim || U.teal, o.rimA ?? 0.8, [5, -4]); ctx.restore();
  rimDraw(parts, o.rim || U.teal, o.rimA ?? 0.8, [5, -4]); }); }
function savanna(t, d, o = {}) { // dawn savanna: sky, far acacias, mid ground, near grass
  const cam = o.cam || camAt(t, d, 1, 1.08, 24); const k = o.k ?? 0.55;
  layers([
    { z: 0.02, draw: () => dawnSky(t, k, o) },
    { z: 0.14, haze: 0.05, draw: () => { dunes(1170, 26, lerpC('#0A1830', '#3A2A36', k), 1.2, 'rgba(255,200,150,0.22)'); acacia(140, 1170, 0.42, lerpC('#081426', '#2A1E2A', k)); acacia(900, 1160, 0.34, lerpC('#081426', '#2A1E2A', k)); } },
    { z: 0.35, draw: () => { dunes(1240, 34, lerpC('#060E1E', '#1E141C', k), 2.6, 'rgba(255,190,130,0.3)'); if (o.tree !== false) acacia(o.tx ?? 760, 1250, o.ts ?? 0.95, '#04060C', 'rgba(255,200,140,0.45)'); o.far && o.far(); } },
    ...(o.mid || []),
    { z: 0.62, draw: () => { dunes(1440, 40, '#03050C', 4.2, 'rgba(255,200,140,0.25)'); glow(o.sx ?? 560, 1500, 700, '#FFB46A', 0.10 + 0.08 * k); grass(1460, 40, t, '#120C14', 80, 3); ctx.save(); ctx.clip(dunePath(1440, 40, 4.2)); ripples(1500, 10, 'rgba(255,200,150,0.08)'); ctx.restore(); o.near && o.near(); } },
    { z: 1.1, blur: 6, draw: () => { grass(1960, 34, t, '#010204', 260, 9); } },
  ], cam);
  dust(t, 50, [0, 500, W, 900], '255,214,160', o.seed || 3);
}

// ---- hook: lone lion under the acacia at first light, the eye opens
DRAW.sc1 = (t, d) => { const u = lt('h1');
  savanna(t, d, { k: lerp(0.25, 0.45, t / d), cam: { zoom: lerp(1.0, 1.12, ease(t / d)), px: 0, py: 0, cy: 1150 }, tx: 700, mid: [{ z: 0.45, draw: () => lion(640, 1255, 0.78, t, { f: -1, rim: U.gold, rimA: 0.9, eye: kin('h1', 6, 0.1, 0.4) }) }] });
  bigText('WAITING FOR', W / 2, 400, 96, '#FFFFFF', seg(u, 0, 0.25));
  bigText('THE RIGHT MOMENT?', W / 2, 520, 82, U.gold, seg(u, 0.3, 0.6));
  tagU("RUMI'S LION", W / 2, 700, kin('h1', 5, 0.1, 0.35), U.teal, 44);
};
// ---- the deal: the animals' council faces the lion; one pebble a day
function council(t, o = {}) { const ar = o.ar ?? 1;
  gazelle(170, 1270, 0.62, t, { rim: U.teal, nod: Math.sin(t * 1.1) * 0.04 }); gazelle(330, 1300, 0.55, t + 1, { rim: U.teal });
  fox(470, 1300, 0.5, t, { rim: 'rgba(255,190,130,0.9)' });
  hare(620 - (1 - ar) * 80, 1310, 0.8, t, { rim: U.gold, eye: 0.8, hop: o.hop || 0 });
}
DRAW.sc2 = (t, d) => { const u = lt('n2');
  savanna(t + 3, d, { k: 0.5, cam: { zoom: lerp(1.04, 1.0, ease(t / d)), px: lerp(-30, 20, ease(t / d)), py: 0, cy: 1200 }, tx: 860, ts: 0.8,
    mid: [{ z: 0.48, draw: () => { lion(920, 1290, 0.7, t, { f: -1, rim: U.gold, rimA: 0.9, eye: 0.8 }); council(t); } }] });
  tagU('THE MASNAVI · BOOK I', W / 2, 330, seg(u, 0.1, 0.5), U.teal, 42);
  const kd = kin('n2', 9, 0.1, 0.4); if (kd > 0) withT(W / 2, 560, lerp(0.7, 1, back(kd)), 0, () => alpha(kd, () => { // the deal: pebble tally
    P(rr(-260, -110, 520, 240, 40), 'rgba(8,8,14,0.8)', U.gold, 3); txt('THE DEAL', 0, -62, 42, U.gold, 'Oswald', 700);
    const n = Math.min(5, Math.floor(seg(u, wt('n2', 10), wt('n2', 14) + 0.4) * 5 + 0.001)); for (let i = 0; i < 5; i++) { const on = i < n; P(circ(-160 + i * 80, 4, 22), on ? U.gold : 'rgba(246,210,122,0.18)', null); }
    txt('ONE OF THEM · EACH DAY', 0, 74, 36, '#F0E2C2', 'Oswald', 700); }));
  tagU('…IF HE STOPS HUNTING', W / 2, 760, kin('n2', 15, 0.1, 0.35), U.rose, 40);
};
// ---- the lion hesitates; the animals say "relax"
DRAW.sc3 = (t, d) => { const u = lt('n3');
  savanna(t + 8, d, { k: 0.55, cam: { zoom: lerp(1.18, 1.28, ease(t / d)), px: 180, py: 0, cy: 1180 }, tx: 980, ts: 0.8,
    mid: [{ z: 0.48, draw: () => { lion(920, 1290, 0.7, t, { f: -1, rim: U.gold, rimA: 0.95, eye: 1 }); council(t); } }] });
  const kE = kin('n3', 5, 0.1, 0.35); if (kE > 0) withT(760, 520, lerp(0.8, 1, back(kE)), 0, () => alpha(kE, () => { glow(0, 0, 200, U.gold, 0.35); // own effort: paw icon
    P(ell(0, 14, 62, 50), U.gold, null); [-48, -16, 18, 50].forEach((x, i) => P(ell(x, -52 - (i % 3 ? 10 : 0), 20, 24), U.gold, null)); }));
  tagU('HIS OWN EFFORT', 760, 680, kE, U.gold, 40);
  sayBubble(300, 760, kin('n3', 9, 0.05, 0.35), 'RELAX…', U.teal, 64);
};
// ---- quote card q1 over the soft-focus council (the animals' words)
function quoteCard3(id, from, text, cites, gold, o = {}) { // like quoteCard2; '—' tokens are drawn but not timed
  const u = lt(id); const k0 = o.in ?? (wordT(id, from) - 0.45); const k = easeOut(seg(u, k0, k0 + 0.5)); if (k <= 0) return;
  const words = text.split(' '); const size = o.size || 66; const font = `600 ${size}px CrimsonText`;
  const lines = wrapWords(words, font, 800); const lh = size * 1.22; const lab = o.label ? 64 : 0; const ch = cites.length * 48; const hh = lines.length * lh + 170 + ch + lab; const cy = o.cy || 700;
  withT(W / 2, cy + (1 - k) * 60, 1, (1 - k) * 0.02, () => alpha(k, () => {
    glow(0, 0, 640, '#000', 0.6); const pw = 920, ph = hh; const g = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2); g.addColorStop(0, '#F0E2C2'); g.addColorStop(1, '#D9C292');
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
    const pp = new Path2D(); pp.moveTo(-pw / 2, -ph / 2 + 10); for (let i = 0; i <= 20; i++) pp.lineTo(-pw / 2 + pw * i / 20, -ph / 2 + Math.sin(i * 2.1) * 5); pp.lineTo(pw / 2, ph / 2); for (let i = 20; i >= 0; i--) pp.lineTo(-pw / 2 + pw * i / 20, ph / 2 + Math.sin(i * 1.7) * 5); pp.closePath();
    P(pp, g, null); ctx.restore();
    alpha(0.5, () => { const r = ctx.createRadialGradient(0, 0, 200, 0, 0, 640); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(90,50,10,0.55)'); ctx.fillStyle = r; ctx.fill(pp); });
    txt('“', -pw / 2 + 70, -ph / 2 + 70 + lab, 150, '#1E5A60', 'CrimsonText', 700);
    if (o.label) txt(o.label, 0, -ph / 2 + 62, 44, '#1E5A60', 'Oswald', 700);
    let wi = 0, lastSaid = false; const y0 = -ph / 2 + 110 + lab + lh / 2;
    lines.forEach((ln, li) => { ctx.font = font; const lw = ctx.measureText(ln.join(' ')).width; let x = -lw / 2;
      ln.forEach(w => { const dash = w === '—'; let said; if (dash) said = lastSaid; else { const gi = from + wi; said = u >= wordT(id, Math.min(gi, LINES[id].words.length - 1)) - 0.03; wi++; } lastSaid = said;
        const isG = !dash && gold.some(g => w.toLowerCase().replace(/[^a-z]/g, '') === g);
        const fw = `${isG && said ? 700 : 600} ${size}px CrimsonText`; ctx.font = fw; const ww = ctx.measureText(w + ' ').width;
        txt(w, x, y0 + li * lh, size, said ? (isG ? '#1E5A60' : '#24170C') : 'rgba(60,40,20,0.28)', 'CrimsonText', isG && said ? 700 : 600, 'left');
        if (isG && said) { ctx.font = fw; ctx.fillStyle = 'rgba(180,120,30,0.55)'; ctx.fillRect(x, y0 + li * lh + size * 0.42, ctx.measureText(w).width, 4); }
        x += ww; }); });
    cites.forEach((c, i) => txt(c, 0, ph / 2 - 50 - (cites.length - 1 - i) * 48, 38, '#5A3A1A', 'CrimsonText', 600));
  }));
}
DRAW.sc4 = (t, d) => {
  savanna(t + 11, d, { k: 0.58, cam: { zoom: lerp(1.0, 1.05, ease(t / d)), px: -60, py: 0, cy: 1250 }, tx: 860, ts: 0.8, mid: [{ z: 0.48, blur: 3, draw: () => { lion(920, 1290, 0.7, t, { f: -1, rim: U.gold, rimA: 0.8 }); council(t); } }] });
  ctx.fillStyle = 'rgba(2,6,12,0.35)'; ctx.fillRect(0, 0, W, H);
  quoteCard3('q1', 0, 'Lay aside caution... trust is the better part.', ['— Masnavi, Book I (tr. Whinfield)'], ['caution', 'trust', 'better'], { size: 70, cy: 640, in: -0.1, label: 'THE ANIMALS SAID:' });
};
// ---- the lion concedes one point (TRUST ✓) ... "But" — he rises into the sunrise
DRAW.sc5 = (t, d) => { const u = lt('n4'); const rise = easeIO(seg(u, wt('n4', 11), wt('n4', 12) + 0.5));
  savanna(t + 14, d, { k: lerp(0.6, 0.8, t / d), sun: -60 * rise, sx: 420, cam: { zoom: lerp(1.1, 1.22, ease(t / d)), px: -120, py: 0, cy: 1150 }, tree: false,
    mid: [{ z: 0.5, draw: () => { glow(420, 1000, 520, '#FFB46A', 0.25 * rise); lion(300, 1300 - rise * 20, 0.95 + 0.05 * rise, t, { rim: U.gold, rimA: 0.95, eye: 1 }); } }] });
  const kT = kin('n4', 8, 0.1, 0.35); if (kT > 0) withT(W / 2, 520, lerp(0.8, 1, back(kT)), 0, () => alpha(kT, () => { P(rr(-300, -80, 600, 160, 80), 'rgba(8,8,14,0.8)', U.teal, 4); txt('TRUST', -40, 4, 90, '#FFFFFF', 'Montserrat', 900); withT(190, 0, 1, 0, () => { ctx.strokeStyle = U.teal; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-6, 26); ctx.lineTo(36, -30); ctx.stroke(); }); }));
  alpha(kT, () => txt('“the mainstay”', W / 2, 660, 50, '#F0E2C2', 'CrimsonText', 600));
  bigText('BUT…', W / 2, 840, 150, U.gold, kin('n4', 12, 0.05, 0.3));
};
// ---- quote card q2 over the lion's paw: claws catch the light
function paw(x, y, s, ext, t) { withT(x, y, s, 0, () => { const parts = [ell(0, 0, 150, 110), ell(-120, -110, 48, 56), ell(-40, -150, 50, 60), ell(50, -150, 50, 60), ell(130, -108, 46, 54), rr(-110, 60, 220, 400, 60)];
  glow(0, -60, 360, '#FFB46A', 0.35); rimDraw(parts, U.gold, 1, [10, -8], '#2A1A12');
  alpha(0.9, () => { P(ell(0, 20, 78, 56), '#5A3A26', null); [[-112, -104], [-38, -142], [48, -142], [124, -102]].forEach(([px, py]) => P(ell(px, py, 26, 30), '#5A3A26', null)); });
  alpha(0.35, () => { for (let i = 0; i < 14; i++) line(-100 + i * 15, 120, -96 + i * 15, 420, '#6A4A30', 3); });
  [[-120, -160], [-40, -205], [50, -205], [132, -158]].forEach(([cx, cy], i) => { const e = clamp(ext * 1.2 - i * 0.07); if (e <= 0) return; withT(cx, cy + 10, 1, (i - 1.5) * 0.18, () => { glow(0, -40 * e, 50, U.gold, 0.5 * e); const c = new Path2D(); c.moveTo(-12, 0); c.quadraticCurveTo(-6, -70 * e, 14, -82 * e); c.quadraticCurveTo(2, -50 * e, 12, 0); c.closePath(); P(c, '#FFF0C8', null); }); }); }); }
DRAW.sc6 = (t, d) => { const u = lt('q2'); const ext = seg(u, wt('q2', 12), wt('q2', 16) + 0.3);
  layers([{ z: 0.02, draw: () => dawnSky(t, 0.85, { sx: 540, hy: 1180 }) },
    { z: 0.3, draw: () => { dunes(1180, 30, '#1A1018', 2.1, 'rgba(255,200,140,0.4)'); } },
    { z: 0.6, draw: () => { paw(560, 1330, 1.3, ext, t); } }], { zoom: lerp(1.0, 1.07, ease(t / d)), px: 0, py: 0, cy: 1400 });
  ctx.fillStyle = 'rgba(2,6,12,0.25)'; ctx.fillRect(0, 0, W, H);
  quoteCard3('q2', 0, 'Ye have feet — why then pretend ye are lame? Ye have hands — why then conceal your claws?', ['— Masnavi, Book I (tr. Whinfield)'], ['feet', 'lame', 'hands', 'claws'], { size: 66, cy: 560, in: -0.1, label: 'THE LION:' });
};
// ---- in essence: a ladder at your feet; climb to the roof step by step
function adobe(x, y, s, warm = 0.6) { withT(x, y, s, 0, () => { P(rr(-260, -420, 520, 420, 6), grad(-420, 0, '#3A2A34', '#140E16'), null); P(rr(-280, -446, 560, 34, 6), '#1E141E', null);
  P(rr(-40, -200, 80, 200, [40, 40, 0, 0]), `rgba(255,180,100,${0.75 * warm})`, null); P(rr(-200, -320, 70, 84, [35, 35, 0, 0]), `rgba(255,190,110,${0.6 * warm})`, null); P(rr(130, -320, 70, 84, [35, 35, 0, 0]), `rgba(255,190,110,${0.5 * warm})`, null);
  for (let i = 0; i < 5; i++) P(rr(-240 + i * 115, -404, 18, 18, 4), '#0A0710', null); glow(0, -100, 300, '#FFB45A', 0.25 * warm); }); }
const LAD = { x: 790, y: 1240, h: 540, n: 6, rot: -0.2 };
function ladderPt(f) { return [LAD.x + LAD.h * f * Math.sin(LAD.rot), LAD.y - LAD.h * f * Math.cos(LAD.rot)]; }
function ladder(lit) { withT(LAD.x, LAD.y, 1, LAD.rot, () => { line(-52, 20, -52, -LAD.h - 40, '#2A1A0E', 12); line(52, 20, 52, -LAD.h - 40, '#2A1A0E', 12);
  for (let i = 1; i <= LAD.n; i++) { const yy = -LAD.h * i / (LAD.n + 1); const on = lit >= i / LAD.n - 0.001; if (on) glow(0, yy, 80, '#FFC870', 0.55); line(-52, yy, 52, yy, on ? '#FFD488' : '#3A2614', on ? 10 : 8); } }); }
DRAW.sc7 = (t, d) => { const u = lt('n5'); const lit = seg(u, wt('n5', 10), wt('n5', 16) + 0.4); const fl = Math.floor(lit * LAD.n) / (LAD.n + 1);
  layers([{ z: 0.02, draw: () => dawnSky(t, lerp(0.55, 0.8, t / d), { sx: 300, hy: 1000 }) },
    { z: 0.2, haze: 0.04, draw: () => { dunes(1000, 30, '#1A1424', 1.7, 'rgba(255,200,150,0.25)'); adobe(130, 1010, 0.45, 0.6); adobe(1000, 1000, 0.38, 0.5); } },
    { z: 0.5, draw: () => { dunes(1250, 26, '#0C0810', 3.3, 'rgba(255,190,130,0.3)'); adobe(400, 1250, 1.0, 0.8);
      ladder(lit); const kL = kin('n5', 6, 0.1, 0.4); if (kL > 0 && lit === 0) alpha(kL, () => glow(LAD.x, LAD.y - 40, 160, U.gold, 0.6 * kL));
      const [px, py] = ladderPt(fl + 0.02); person(px, py + 14, 0.5, { f: -1, col: '#06050A', rim: '#FFD488', rimA: 1 }); } },
    { z: 1.0, blur: 5, draw: () => grass(1960, 26, t, '#010204', 220, 4) }], { zoom: lerp(1.0, 1.08, ease(t / d)), px: 0, py: lerp(0, -40, ease(t / d)), cy: 1200 });
  chipAt('in essence · Masnavi I (tr. Whinfield)', 300, seg(u, 0.05, 0.4), U.teal);
  tagU('STEP BY STEP', W / 2, 470, kin('n5', 14, 0.1, 0.35), U.gold, 50);
};
// ---- and just waiting? sleeping on the road among highwaymen
function sleeper(x, y, s, t) { withT(x, y, s, 0, () => { const br = Math.sin(t * 1.5) * 3; P(ell(0, -40 - br * 0.5, 170, 44 + br), '#08070C', null); P(ell(-190, -50, 46, 40), '#08070C', null); P(rr(-40, -96, 260, 60, 30), '#2A1E30', null); alpha(0.7, () => { ctx.strokeStyle = 'rgba(160,200,240,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -44, 170, 44, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); });
  const z = (t * 0.6) % 1; alpha(1 - z, () => txt('z', -200 + z * 40, -120 - z * 90, 40 + z * 20, '#BFD8FF', 'Montserrat', 900)); }); }
function bandit(x, y, s, t, k) { if (k <= 0) return; alpha(k, () => { person(x, y, s, { col: '#020205', rim: 'rgba(192,57,43,0.55)', rimA: 0.7 }); withT(x, y, s, 0, () => { P(rr(-46, -470, 92, 30, 10), '#020205', null); const bl = (Math.sin(t * 2 + x) > 0.96) ? 0.1 : 1; P(ell(-14, -438, 8, 4 * bl), '#FF5A3A', null); P(ell(16, -438, 8, 4 * bl), '#FF5A3A', null); }); }); }
DRAW.sc8 = (t, d) => { const u = lt('n6'); const kB = seg(u, wt('n6', 10) - 0.2, wt('n6', 11) + 0.3);
  layers([{ z: 0.02, draw: () => { nightSky(t, { mx: 860, my: 720, mr: 62, seed: 11 }); } },
    { z: 0.2, haze: 0.06, draw: () => { dunes(980, 40, '#0A1630', 1.4, 'rgba(160,200,240,0.25)'); } },
    { z: 0.45, draw: () => { dunes(1080, 40, '#061022', 2.8, 'rgba(180,210,250,0.3)');
      const rd = new Path2D(); rd.moveTo(520, 1060); rd.bezierCurveTo(600, 1200, 300, 1400, 160, 1960); rd.lineTo(980, 1960); rd.bezierCurveTo(760, 1400, 640, 1200, 560, 1060); rd.closePath(); P(rd, '#161C2E', null);
      [[150, 1190, 1.3], [930, 1180, 1.5], [760, 1090, 0.8]].forEach(([x, y, s]) => rock(x, y, s, '#050810'));
      bandit(140, 1200, 0.58, t, kB); bandit(940, 1190, 0.62, t, kB); bandit(770, 1100, 0.36, t, kB * 0.9); } },
    { z: 0.7, draw: () => { sleeper(560, 1200, 1.35, t); } },
  ], { zoom: lerp(1.0, 1.1, ease(t / d)), px: 0, py: 0, cy: 1250 });
  dust(t, 40, [0, 400, W, 900], '190,215,255', 6);
  chipAt('in essence · Masnavi I (tr. Whinfield)', 300, seg(u, 0.05, 0.4), U.teal);
  tagU('JUST WAITING?', W / 2, 450, kin('n6', 1, 0.1, 0.35), '#BFD8FF', 50);
  tagU('HIGHWAYMEN', W / 2, 570, kin('n6', 11, 0.1, 0.35), '#FF6A4A', 46);
};
// ---- the twist: the lion takes the deal; the hare makes a plan; the well shows two reflections
function stoneWell(x, y, s, o = {}) { withT(x, y, s, 0, () => {
  P(rr(-170, -150, 340, 150, 10), grad(-150, 0, '#3A3446', '#141018'), null); for (let r = 0; r < 3; r++) for (let b = 0; b < 6; b++) P(rr(-170 + b * 68 - (r % 2) * 34, -150 + r * 50, 64, 46, 6), null, 'rgba(0,0,0,0.55)', 3);
  P(ell(0, -150, 172, 44), '#4A4458', null); P(ell(0, -150, 142, 32), '#04070E', null);
  if (o.water) { ctx.save(); ctx.clip(ell(0, -150, 142, 32)); o.water(); ctx.restore(); }
  P(rr(-176, -440, 24, 290, 4), '#1A120C', null); P(rr(152, -440, 24, 290, 4), '#1A120C', null); P(rr(-196, -452, 392, 24, 6), '#24180E', null); line(0, -430, 0, -260, '#3A2A1A', 4); P(rr(-22, -270, 44, 40, 6), '#2A1E14', null);
}); }
DRAW.sc9 = (t, d) => { const u = lt('n7');
  const kDeal = kin('n7', 4, 0.1, 0.4), kHare = seg(u, wt('n7', 8), wt('n7', 10) + 0.3), kPlan = kin('n7', 15, 0.05, 0.4), kOut = seg(u, wt('n7', 18), wt('n7', 20) + 0.4);
  const walk = seg(u, wt('n7', 8), wt('n7', 17)); const hop = (u * 1.6) % 1;
  layers([{ z: 0.02, draw: () => dawnSky(t, 0.35, { sx: 820, hy: 980, seed: 9 }) },
    { z: 0.2, haze: 0.05, draw: () => { dunes(990, 24, '#0C1628', 2.2, 'rgba(255,200,150,0.2)'); acacia(180, 1000, 0.4, '#081222'); } },
    { z: 0.5, draw: () => { dunes(1220, 30, '#05070E', 3.9, 'rgba(255,200,140,0.25)');
      stoneWell(830, 1240, 1.0, { water: () => { fullFill('#0A1830'); glow(0, -150, 120, '#9FC4E0', 0.25); if (kOut > 0) alpha(kOut, () => { withT(-10, -146, 0.2, 0, () => { ctx.scale(1, -0.5); lion(-280, 0, 1, t, { rim: '#9FE0E0', rimA: 1, eye: 1 }); hare(-40, -300, 1, t, { rim: U.teal }); }); }); } });
      const lx = lerp(-160, 190, easeIO(walk)); lion(lx, 1240, 0.8, t * (walk > 0 && walk < 1 ? 3 : 1), { rim: U.gold, rimA: 0.9, eye: 0.9 });
      if (kHare > 0) alpha(kHare, () => { const hx = kOut < 0.01 ? lerp(250, 590, easeIO(walk)) : lerp(590, 1180, kOut); hare(hx, 1240, 0.8, t, { rim: U.gold, eye: 1, hop: (walk > 0 && walk < 1) || kOut > 0 ? (u * 1.8) % 1 : 0 }); });
      if (kPlan > 0) withT(540, 720, lerp(0.6, 1, back(kPlan)), 0, () => alpha(kPlan, () => { glow(0, 0, 160, U.gold, 0.6); P(circ(0, 0, 54), 'rgba(255,226,150,0.95)', null); P(rr(-22, 46, 44, 34, 8), '#C9A04A', null); txt('PLAN', 0, 2, 30, '#3A2A10', 'Oswald', 700); }));
    } },
    { z: 1.0, blur: 5, draw: () => grass(1960, 26, t, '#010204', 220, 7) }], { zoom: lerp(1.0, 1.08, ease(t / d)), px: lerp(-40, 40, ease(t / d)), py: 0, cy: 1250 });
  tagU('THE LION TAKES THE DEAL', W / 2, 330, kDeal * (1 - kHare), U.gold, 44);
  tagU('THE WEAKEST… HAD A PLAN', W / 2, 330, kin('n7', 12, 0.1, 0.35), U.teal, 44);
  bigText('OUTWITTED', W / 2, 500, 110, U.gold, kOut);
};
// ---- modern: dreaming of the right job, applications sent: 0
DRAW.sc10 = (t, d) => { const u = lt('n8'); const kD = kin('n8', 11, 0.1, 0.4), kZ = kin('n8', 18, 0.05, 0.3);
  layers([{ z: 0.03, draw: () => { fullFill(grad(0, H, '#0C1220', '#05060C')); } },
    { z: 0.15, draw: () => { // dawn window
      P(rr(560, 260, 400, 560, 12), '#020308', null); ctx.save(); ctx.beginPath(); ctx.roundRect(580, 280, 360, 520, 8); ctx.clip(); dawnSky(t, 0.7, { sx: 760, hy: 760 }); for (let i = 0; i < 6; i++) P(rr(590 + i * 60, 700 - rnd(i) * 140, 48, 200, 3), '#0A0A16', null); ctx.restore(); line(760, 280, 760, 800, '#020308', 10); line(580, 540, 940, 540, '#020308', 10); glow(760, 560, 500, '#FFB46A', 0.18); } },
    { z: 0.45, draw: () => { // bed + sitting person with laptop and folded hands
      P(rr(80, 1080, 760, 120, 20), '#1A1626', null); P(rr(60, 1190, 800, 50, 10), '#0C0A12', null); P(rr(100, 1010, 260, 90, 40), '#2A2436', null);
      person(470, 1100, 1.1, { sit: true, f: 1, col: '#06060C', rim: 'rgba(255,190,130,0.75)' });
      withT(660, 1050, 1.2, 0, () => { P(poly([-90, 0, 90, 0, 110, 18, -110, 18]), '#2A2A36', null); P(poly([-80, 0, 80, 0, 64, -120, -96, -120]), '#14141E', null); glow(-10, -60, 180, '#9FD8FF', 0.35); P(poly([-70, -8, 72, -8, 58, -110, -86, -110]), 'rgba(140,200,240,0.55)', null); }); } },
  ], { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0, cy: 1100 });
  const kF = kin('n8', 7, 0.1, 0.35); tagU('FOLDED HANDS', 300, 820, kF * (1 - kD), U.rose, 40);
  if (kD > 0) withT(330, 560, lerp(0.7, 1, back(kD)), 0, () => alpha(kD, () => { [[150, 210, 18], [110, 160, 26]].forEach(([x, y, r]) => P(circ(x, y, r), 'rgba(240,232,215,0.92)', null));
    const b = new Path2D(); b.ellipse(0, 0, 250, 140, 0, 0, 6.283); P(b, 'rgba(240,232,215,0.95)', null); P(rr(-150, -70, 300, 120, 16), '#FFF8EA', '#C9A04A', 4); txt('THE RIGHT JOB', 0, -26, 40, '#3A2A10', 'Oswald', 700); for (let i = 0; i < 5; i++) P(poly(star5(-80 + i * 40, 24, 14)), U.gold, null); }));
  if (kZ > 0) withT(W / 2, 1610, lerp(1.3, 1, easeOut(kZ)), 0, () => alpha(kZ, () => { P(rr(-330, -70, 660, 140, 30), 'rgba(40,6,6,0.88)', '#FF6A4A', 5); txt('APPLICATIONS SENT:', -60, 2, 46, '#FFE6DE', 'Oswald', 700); txt('0', 250, 2, 92, '#FF6A4A', 'Montserrat', 900); }));
};
function star5(cx, cy, r) { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; p.push(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); } return p; }
// ---- action: before noon, one email / one page / one call
function clockFace(x, y, r, hr, t) { withT(x, y, 1, 0, () => { glow(0, 0, r * 2, U.gold, 0.25); P(circ(0, 0, r), '#F0E2C2', '#2A1A0A', 8); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; line(Math.sin(a) * r * 0.8, -Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.92, -Math.cos(a) * r * 0.92, '#2A1A0A', i % 3 ? 4 : 8); }
  txt('12', 0, -r * 0.62, r * 0.26, '#8E1B1B', 'Oswald', 700); const ah = hr / 12 * Math.PI * 2, am = hr * Math.PI * 2; line(0, 0, Math.sin(ah) * r * 0.5, -Math.cos(ah) * r * 0.5, '#1A1008', 12); line(0, 0, Math.sin(am) * r * 0.76, -Math.cos(am) * r * 0.76, '#1A1008', 7); P(circ(0, 0, 12), '#8E1B1B', null); }); }
function iconCard(x, y, k, kind, label, done) { if (k <= 0) return; withT(x, y, lerp(0.6, 1, back(k)), 0, () => alpha(clamp(k * 1.5), () => {
  P(rr(-150, -150, 300, 300, 36), 'rgba(10,12,20,0.88)', done ? U.gold : 'rgba(246,210,122,0.5)', 4); ctx.strokeStyle = U.gold; ctx.fillStyle = U.gold; ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (kind === 0) { ctx.strokeRect(-80, -80, 160, 110); ctx.beginPath(); ctx.moveTo(-80, -80); ctx.lineTo(0, -10); ctx.lineTo(80, -80); ctx.stroke(); }
  else if (kind === 1) { ctx.strokeRect(-60, -100, 120, 150); for (let i = 0; i < 4; i++) line(-36, -66 + i * 30, 36, -66 + i * 30, U.gold, 6); }
  else { P(rr(-44, -100, 88, 156, 16), null, U.gold, 9); P(circ(0, 34, 8), U.gold, null); }
  txt(label, 0, 100, 40, '#FFFFFF', 'Oswald', 700);
  if (done) withT(110, -110, 1, 0, () => { P(circ(0, 0, 34), U.teal, null); ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-3, 12); ctx.lineTo(16, -12); ctx.stroke(); });
})); }
DRAW.sc11 = (t, d) => { const u = lt('n9'); const hr = lerp(7.5, 11.75, easeIO(seg(u, wt('n9', 11), wt('n9', 16) + 0.4)));
  layers([{ z: 0.02, draw: () => dawnSky(t, lerp(0.75, 0.95, t / d), { sx: 540, hy: 1400, seed: 13 }) },
    { z: 0.4, draw: () => { dunes(1420, 30, '#1A1018', 3.1, 'rgba(255,200,140,0.35)'); acacia(880, 1430, 0.6, '#0A0610', 'rgba(255,200,140,0.4)'); } }], { zoom: lerp(1.0, 1.05, ease(t / d)), px: 0, py: 0, cy: 1200 });
  ctx.fillStyle = 'rgba(4,4,10,0.35)'; ctx.fillRect(0, 0, W, H);
  const kC = seg(u, 0.05, 0.4); if (kC > 0) alpha(kC, () => clockFace(W / 2, 520, 170, hr, t));
  tagU('BEFORE NOON', W / 2, 760, kin('n9', 15, 0.1, 0.35), U.gold, 50);
  [[17, 0, 'ONE EMAIL'], [19, 1, 'ONE PAGE'], [21, 2, 'ONE CALL']].forEach(([wi, kind, lab], i) => iconCard(200 + i * 340, 1040, kin('n9', wi, 0.1, 0.35), kind, lab, u > wt('n9', wi) + 0.45));
  if (seg(u, 0, 0.4) > 0 && u < wt('n9', 11)) tagU('THE THING YOU SAY "WILL WORK OUT"', W / 2, 880, seg(u, wt('n9', 2), wt('n9', 4)), U.teal, 36);
};
// ---- comment: what are you still waiting on? (hourglass)
function hourglass(x, y, s, t, f) { withT(x, y, s, Math.sin(t * 0.6) * 0.02, () => { P(rr(-170, -300, 340, 34, 10), '#3A2614', null); P(rr(-170, 266, 340, 34, 10), '#3A2614', null); line(-150, -270, -150, 270, '#2A1A0E', 14); line(150, -270, 150, 270, '#2A1A0E', 14);
  const gl = new Path2D(); gl.moveTo(-120, -266); gl.bezierCurveTo(-120, -80, -14, -40, -14, 0); gl.bezierCurveTo(-14, 40, -120, 80, -120, 266); gl.lineTo(120, 266); gl.bezierCurveTo(120, 80, 14, 40, 14, 0); gl.bezierCurveTo(14, -40, 120, -80, 120, -266); gl.closePath();
  P(gl, 'rgba(160,210,230,0.14)', 'rgba(200,230,240,0.6)', 4); ctx.save(); ctx.clip(gl); const top = lerp(-200, -30, f), bot = lerp(240, 120, f); P(rr(-130, top, 260, -30 - top + 30, 0), U.gold, null); P(poly([-130, 266, 130, 266, 130, bot, 0, bot - 50, -130, bot]), U.gold, null); line(0, 0, 0, bot - 40, U.gold, 4); ctx.restore(); glow(0, 0, 300, U.gold, 0.2); }); }
DRAW.sc12 = (t, d) => { const u = lt('n10');
  layers([{ z: 0.02, draw: () => dawnSky(t, 0.5, { sx: 540, hy: 1500, seed: 17 }) }, { z: 0.4, draw: () => { dunes(1500, 30, '#08070E', 2.4, 'rgba(255,200,140,0.3)'); } }], { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0, cy: 1100 });
  hourglass(W / 2, 820, 1.05, t, seg(t, 0, d));
  bigText('STILL WAITING?', W / 2, 330, 96, '#FFFFFF', kin('n10', 3, 0.1, 0.3));
  const kc = back(seg(u, wt('n10', 6) - 0.05, wt('n10', 6) + 0.35)); if (kc > 0) withT(W / 2 + 250, 1130, kc, 0, () => { const b = new Path2D(); b.roundRect(-170, -70, 340, 130, 30); b.moveTo(-40, 60); b.lineTo(-70, 105); b.lineTo(0, 60); P(b, '#F6F2E8', '#111', 4); txt('ONE WORD', 0, -4, 46, '#1A1A1A', 'Oswald', 700); });
};
// ---- end card: sunrise ladder, logo, Follow Awazzzz · Mindset
DRAW.sc13 = (t, d) => {
  layers([{ z: 0.02, draw: () => dawnSky(t, 0.95, { sx: 540, hy: 1500, seed: 19 }) },
    { z: 0.4, draw: () => { dunes(1560, 40, '#0A0610', 4.1, 'rgba(255,200,140,0.4)'); acacia(180, 1570, 0.55, '#0A0610'); acacia(900, 1560, 0.4, '#0A0610'); } }], { zoom: lerp(1, 1.05, t / d), px: 0, py: 0, cy: 1000 });
  ctx.fillStyle = 'rgba(3,3,8,0.5)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0, 0.4)); const L = document.getElementById('logo');
  withT(W / 2, 640, lerp(0.8, 1, k), 0, () => alpha(k, () => { glow(0, 0, 320, M.gold, 0.4); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -135, -135, 270, 270); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.strokeStyle = M.gold2; ctx.lineWidth = 7; ctx.stroke(); }));
  bigText('Follow Awazzzz', W / 2, 900, 104, '#FFFFFF', seg(t, 0.1, 0.4));
  bigText('MINDSET', W / 2, 1030, 66, M.gold2, seg(t, 0.3, 0.6), 'Oswald', 700);
  alpha(seg(t, 0.5, 0.8), () => txt('climb one step today', W / 2, 1120, 54, M.parch, 'CrimsonText', 600));
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
  savanna(2, 4, { k: 0.75, sx: 380, cam: { zoom: 1.0, px: 0, py: 0, cy: 1150 }, tx: 820, ts: 1.0, mid: [{ z: 0.45, draw: () => lion(250, 1330, 1.0, 2, { rim: U.gold, rimA: 1, eye: 1 }) }] });
  vign(0.5);
  withT(W / 2, 250, 1, 0, () => { ctx.font = '700 54px Oswald'; const s = 'RUMI'; const w = ctx.measureText(s).width + 100; P(rr(-w / 2, -44, w, 88, 44), 'rgba(10,6,10,0.88)', U.teal, 4); txt(s, 0, 3, 54, '#E6FFFF', 'Oswald', 700); });
  bigText('YOU HAVE', W / 2, 470, 140, '#FFFFFF', 1);
  bigText('HANDS.', W / 2, 630, 190, U.gold, 1);
  bigText('Why wait?', W / 2, 800, 96, '#F0E2C2', 1, 'CrimsonText', 700);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
