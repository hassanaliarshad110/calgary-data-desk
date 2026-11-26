/* CRICKET KAHANI — Cricket Science: why dew (os) changes night matches. Vertical 1080x1920. */
const DEW = '#9bd8ff', DEW2 = '#3f9fd8', NIGHT = '#06202b', TURF = '#0f4a2e', TURF2 = '#0c3f27', SAF = '#14523a', GOLD = '#e9b949', BLK = '#15232b', TEAL = '#12a4a0';
const PACER = kitOf(SAF, SAF, { name: 'Pacer', height: 430, build: 'muscular', skin: '#e6b995', hair: { style: 'short', color: '#c9a25a' }, top: { type: 'shirt', color: SAF, sleeve: 'short' }, pants: SAF });
const SKIPPER = kitOf(GOLD, '#1d5a3a', { name: 'Skipper', height: 425, skin: '#e2b08a', hair: { style: 'short', color: '#5a3b22' }, pants: GOLD });

/* ---------- this episode's own drawing ---------- */
function bead(x, y, r, a = 1) { if (r <= 0.3 || a <= 0) return; C.save(); C.globalAlpha *= a; circle(x, y, r); fillPath(DEW, DEW2, Math.max(1.5, r * 0.14)); circle(x - r * 0.3, y - r * 0.32, r * 0.28); C.fillStyle = 'rgba(255,255,255,0.85)'; C.fill(); C.restore(); }
function drop(x, y, r, a = 1, rot = 0) { if (r <= 0 || a <= 0) return; withT(() => { C.beginPath(); C.moveTo(0, -1.75); C.bezierCurveTo(0.25, -1.0, 1, -0.35, 1, 0.25); C.arc(0, 0.25, 1, 0, Math.PI); C.bezierCurveTo(-1, -0.35, -0.25, -1.0, 0, -1.75); C.closePath(); fillPath(DEW, DEW2, 0.1);
  C.beginPath(); C.ellipse(-0.4, 0.2, 0.17, 0.38, 0.4, 0, TAU); C.fillStyle = 'rgba(255,255,255,0.8)'; C.fill(); }, { x, y, s: r, a, r: rot }); }
function wetBall(x, y, r, { rot = 0, wet = 1, seed = 1 } = {}) { ball(x, y, r, { rot }); const n = Math.round(10 * clamp(wet));
  for (let i = 0; i < n; i++) { const a = hash(i * 7 + seed) * TAU + rot, q = Math.sqrt(hash(i * 13 + seed + 2)) * r * 0.74; bead(x + Math.cos(a) * q, y + Math.sin(a) * q, r * (0.1 + 0.07 * hash(i + seed * 3))); }
  if (wet > 0.3) { C.beginPath(); C.arc(x, y, r * 0.82, -2.3, -1.25); C.strokeStyle = 'rgba(255,255,255,0.6)'; C.lineWidth = r * 0.09; C.lineCap = 'round'; C.stroke(); } }
function moon(x, y, r) { FX.glow(x, y, r * 3.4, '200,225,255', 0.28); circle(x, y, r); fillPath('#e9f0f5'); for (const [dx, dy, k] of [[-0.3, -0.2, 0.2], [0.25, 0.3, 0.26], [0.3, -0.4, 0.13]]) { circle(x + dx * r, y + dy * r, k * r); fillPath('#cfdbe3'); } }
function stars(t, n = 46, y0 = 230, y1 = 760, seed = 2) { for (let i = 0; i < n; i++) { const x = hash(i * 3 + seed) * 1080, y = y0 + hash(i * 5 + seed) * (y1 - y0), tw = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.3); circle(x, y, 1.5 + 2 * hash(i + seed)); C.fillStyle = `rgba(240,244,255,${0.3 + 0.5 * tw})`; C.fill(); } }
/* a row of grass blades; returns a point on each blade where a dew bead sits */
function blades(y0, t, { n = 16, h = 230, seed = 4, x0 = 20, x1 = 1060, w = 26, cold = 0 } = {}) { const pts = [];
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, (i + 0.5) / n) + (hash(i + seed) - 0.5) * 30, hh = h * (0.7 + 0.5 * hash(i * 3 + seed)), lean = (hash(i * 5 + seed) - 0.5) * 120 + Math.sin(t * 1.3 + i) * 8;
    C.beginPath(); C.moveTo(x - w, y0); C.quadraticCurveTo(x - w * 0.2 + lean * 0.35, y0 - hh * 0.6, x + lean, y0 - hh); C.quadraticCurveTo(x + w * 0.7 + lean * 0.35, y0 - hh * 0.6, x + w, y0); C.closePath();
    fillPath(mix(i % 2 ? '#2f8a4c' : '#277a42', i % 2 ? '#2a7f6a' : '#226f61', cold), '#0b3a22', 3); pts.push([x + lean * 0.62, y0 - hh * 0.72]); }
  return pts; }
function coin(x, y, r, ph) { const cy = Math.cos(ph), face = cy >= 0; withT(() => { circle(0, 0, r); fillPath(face ? AMB : '#e3a400', '#7a4e00', 8); circle(0, 0, r * 0.78); fillPath(null, '#7a4e00', 4); text(face ? 'H' : 'T', 0, r * 0.06, { font: AF(r * 1.1), fill: '#7a4e00' }); }, { x, y, sx: 1, sy: Math.max(0.07, Math.abs(cy)) }); }
function soap(x, y, s, rot) { withT(() => { rr(-92, -54, 184, 108, 36); fillPath('#f6c9d8', '#b9728c', 6); rr(-62, -30, 124, 60, 22); fillPath(null, '#e3a3ba', 4); text('SABUN', 0, 3, { font: IF(900, 26), fill: '#b9728c', ls: 2 }); C.beginPath(); C.ellipse(-50, -32, 26, 8, -0.3, 0, TAU); C.fillStyle = 'rgba(255,255,255,0.75)'; C.fill(); }, { x, y, s, r: rot }); }
function bubbles(x, y, t, n = 9, seed = 5) { for (let i = 0; i < n; i++) { const u = (t * 0.45 + hash(i + seed)) % 1, bx = x + (hash(i * 3 + seed) - 0.5) * 260 + Math.sin(t * 2 + i) * 12, by = y - u * 300; circle(bx, by, 8 + 16 * hash(i * 5 + seed)); fillPath('rgba(255,255,255,0.12)', `rgba(255,255,255,${0.75 * (1 - u)})`, 3); } }
function thermo(x, y, h, k) { const col = k > 0.5 ? RED : DEW2; rr(x - 17, y - h, 34, h, 17); fillPath('#0b1410', CR, 5); const hh = (h - 44) * (0.16 + 0.78 * k); rr(x - 7, y - 16 - hh, 14, hh + 8, 7); fillPath(col); circle(x, y, 30); fillPath(col, CR, 5);
  for (let i = 0; i < 5; i++) { C.fillStyle = CR; C.fillRect(x + 24, y - 70 - i * (h - 100) / 4, 16, 4); } }
function arrow(x0, y0, x1, y1, col, lw = 10, a = 1) { if (a <= 0) return; const an = Math.atan2(y1 - y0, x1 - x0); C.save(); C.globalAlpha *= a; C.strokeStyle = col; C.lineWidth = lw; C.lineCap = 'round'; C.beginPath(); C.moveTo(x0, y0); C.lineTo(x1 - Math.cos(an) * lw, y1 - Math.sin(an) * lw); C.stroke();
  withT(() => { poly([[0, 0], [-lw * 2.6, -lw * 1.5], [-lw * 2.6, lw * 1.5]]); fillPath(col); }, { x: x1, y: y1, r: an }); C.restore(); }
function tick(x, y, s, col) { C.strokeStyle = col; C.lineWidth = s * 0.2; C.lineCap = 'round'; C.lineJoin = 'round'; C.beginPath(); C.moveTo(x - s * 0.42, y); C.lineTo(x - s * 0.1, y + s * 0.32); C.lineTo(x + s * 0.45, y - s * 0.36); C.stroke(); }
function nightTurf(top = 860) { C.fillStyle = TURF; C.fillRect(0, top, 1080, 1920 - top); for (let i = 0; i < 9; i++) { C.fillStyle = i % 2 ? TURF : TURF2; C.fillRect(0, top + i * 120, 1080, 120); } }

const DRAW_FN = {
  /* hook: the coin goes up, the captain bowls first — why? */
  s0: t => { const S = TL.shot('s0'), d = S.dur, va = S.vo_at, vo = S.vo, tO = va + vo * 0.88; nightSky(NIGHT); stars(t, 40, 560, 1250, 7); FX.speedLines(t, { cx: 540, cy: 860, n: 46, a: 0.12, inner: 430 });
    const kb = pop(t, 0.03, 0.35); if (kb > 0) withT(() => { rr(-350, -74, 700, 148, 22); fillPath(RED); text('TOSS JEETA…', 0, 6, { font: AF(96), fill: '#fff' }); }, { x: 540, y: 300, s: kb });
    const k2 = pop(t, 0.4, 0.4); if (k2 > 0) withT(() => text('PEHLE BOWLING?!', 0, 0, { font: AF(128), fill: AMB }), { x: 540, y: 470, s: k2 * (1 + 0.02 * Math.sin(t * 9)) });
    chip('RAAT KE MATCH MEIN AISA KYUN?', 540, 590, { bg: CR, fg: G, font: IF(900, 34), h: 70, a: fade(t, va + vo * 0.42) });
    if (t < tO) { const u = clamp(t / 1.3), up = Math.sin(u * Math.PI); coin(540, 900 - up * 170, 120, u < 1 ? u * 15.71 : Math.sin(t * 2.2) * 0.25); }
    else { const k = ease('elastic', (t - tO) / 0.8); shake(t, tO, 0.35, 14, () => { FX.glow(540, 900, 420, '150,215,255', 0.35 * clamp(k)); drop(540, 930, 170 * k); text('OS', 540, 950, { font: AF(150 * k), fill: G }); });
      chip('DEW', 540, 1232, { bg: DEW, fg: G, font: AF(44), h: 70, a: fade(t, tO + 0.25) }); for (let i = 0; i < 12; i++) { if (i === 3) continue; const a = i / 12 * TAU, q = 250 + 40 * hash(i); bead(540 + Math.cos(a) * q, 900 + Math.sin(a) * q * 0.9, 16 * pop(t, tO + 0.1 + i * 0.03, 0.3)); } }
    flash(t, tO, 0.22, '200,235,255', 0.6); caption(0, t - 0.5, d - 0.5); },
  /* how dew forms: cold grass, water vapour, droplets */
  s1: t => { const S = TL.shot('s1'), d = S.dur, va = S.vo_at, vo = S.vo, tV = va + vo * 0.4, tD = va + vo * 0.66, cold = ease('inOut', clamp((t - va) / (vo * 0.35)));
    nightSky(NIGHT); stars(t); moon(880, 420, 62); nightTurf(860);
    chip('OS KAISE BANTI HAI?', 540, 252, { bg: RED, font: AF(48), h: 82, a: fade(t, 0.1) });
    card(pop(t, 0.2), 250, 590, 380, 400, () => { thermo(-96, 130, 290, 1 - cold); text('GHAAS', 60, -92, { font: AF(60), fill: CR }); text(cold > 0.6 ? 'THANDI' : 'GARAM', 60, -18, { font: AF(64), fill: cold > 0.6 ? DEW : RED }); text('raat hote hi', 60, 52, { font: IF(700, 26), fill: TAN }); text('garmi nikal jaati hai', 60, 88, { font: IF(700, 22), fill: TAN }); }, { stroke: cold > 0.6 ? DEW2 : RED });
    const kv = fade(t, tV, 0.3); if (kv > 0) { chip('HAWA KI NAMI', 720, 620, { bg: INK, fg: DEW, font: AF(44), h: 74, a: kv }); text('(water vapour)', 720, 682, { font: IF(600, 24), fill: TAN, a: kv }); }
    const P = blades(1262, t, { n: 15, h: 250, cold });
    if (kv > 0) for (let i = 0; i < 44; i++) { const tgt = P[i % P.length], u = ((t - tV) * 0.55 + hash(i * 3)) % 1, sx = 500 + hash(i * 7) * 520, sy = 720 + hash(i * 11) * 60, x = lerp(sx, tgt[0], ease('in', u)) + Math.sin(t * 3 + i) * 10 * (1 - u), y = lerp(sy, tgt[1], u); circle(x, y, 5); C.fillStyle = `rgba(155,216,255,${kv * 0.75 * Math.sin(u * Math.PI)})`; C.fill(); }
    P.forEach(([x, y], i) => bead(x, y, (13 + 9 * hash(i)) * ease('out', clamp((t - tD - i * 0.05) / 0.9))));
    const ke = pop(t, tD + 0.15, 0.4); if (ke > 0) withT(() => chip('BOONDEIN = OS', 0, 0, { bg: DEW, fg: G, font: AF(52), h: 86 }), { x: 540, y: 850, s: ke });
    chip('SAAF AASMAN + HALKI HAWA = ZYADA OS', 540, 936, { bg: INK, fg: CR, font: IF(800, 26), h: 50, a: fade(t, tD + 0.6) });
    header(); caption(1, t - 0.1, d - 0.1); },
  /* the ball rolls over the wet outfield, then the fast bowler and his bar of soap */
  s2: t => { const S = TL.shot('s2'), d = S.dur, va = S.vo_at, vo = S.vo, tc = va + vo * 0.37, tS = va + vo * 0.62;
    if (t < tc) { const k = clamp(t / tc), bx = lerp(-90, 700, ease('out', k)); nightSky(NIGHT); floodlight(150, 300, 0.8, t, 1); floodlight(930, 300, 0.8, t, 1); crowd(690, 4, t, 13); nightTurf(860);
      wetBall(bx, 1030, 86, { rot: bx / 86, wet: k * 1.3 }); for (let i = 0; i < 9; i++) { const u = (t * 2.2 + hash(i)) % 1; bead(bx - 70 - u * 150 - hash(i * 3) * 40, 1080 - Math.sin(u * Math.PI) * (50 + 70 * hash(i * 5)), 9 * (1 - u), k); }
      const P = blades(1206, t, { n: 22, h: 120, w: 18, cold: 1, seed: 9 }); P.forEach(([x, y], i) => bead(x, y, 8 + 5 * hash(i)));
      chip('OUTFIELD KI GHAAS', 540, 252, { bg: INK, fg: DEW, font: AF(44), h: 76, a: fade(t, 0.1) }); stamp('GEELI!', 540, 520, t, va + vo * 0.22, { col: DEW, size: 150, r: -0.06, bg: 'rgba(5,24,17,0.9)' }); }
    else { const u = t - tc; stripes(t * 40, true); tint('rgba(18,70,110,0.42)'); FX.glow(620, 900, 640, '150,215,255', 0.2);
      const p = MOVES.idle(t, { seed: 6 }); p.yaw = -0.3; p.armL.ab = 0.4; p.armL.sw = 1.05; p.armL.el = 1.45; p.head.pitch = -0.12; p.face = Object.assign(p.face || {}, { expr: 'surprised' });
      drawChar(PACER, p, 660, 1840, 2.4, { t }); C.fillStyle = '#082531'; C.fillRect(0, 1470, 1080, 450);
      const [hx, hy] = jointPos(PACER, p, 660, 1840, 2.4, 'wriL'); if (t < tS) wetBall(hx - 6, hy - 62, 50, { rot: u * 0.8, seed: 4 }); else { const v = t - tS, fl = (v * 0.9) % 1.6, up = Math.min(1, fl / 1.1); soap(hx - 30 - up * 60 + Math.sin(v * 7) * 10, hy - 70 - Math.sin(up * Math.PI * 0.62) * 300, 1.05, v * 3.1); bubbles(hx - 40, hy - 40, v, 9); flash(t, tS, 0.15, '255,220,235', 0.5); }
      plate('DALE STEYN', 'FAST BOWLER · SOUTH AFRICA', DEW, 340, pop(t, tc + 0.15));
      bubble('', 300, 650, pop(t, tS + 0.2, 0.4), { size: 70, lines: ['GEELA', 'SABUN!'], tailX: 190, tailY: 190, fg: DEW2 }); flash(t, tc, 0.2, '200,235,255', 0.6); }
    header(); caption(2, t - 0.1, d - 0.1); },
  /* pitch map: a dry ball grips and turns, a wet ball skids straight on to the bat */
  s3: t => { const S = TL.shot('s3'), d = S.dur, va = S.vo_at, vo = S.vo, tW = va + vo * 0.3, wet = t >= tW; stripes(t * 30); tint('rgba(4,20,14,0.4)');
    rr(60, 310, 960, 890, 34); fillPath(TURF, 'rgba(244,236,216,0.25)', 5); rr(410, 340, 260, 830, 8); fillPath(PITCH); C.fillStyle = CR; C.fillRect(392, 420, 296, 5); C.fillRect(392, 1086, 296, 5);
    for (const yy of [366, 1140]) for (let k = -1; k <= 1; k++) { circle(540 + k * 16, yy, 7); fillPath('#fff', '#8a6a3a', 2); }
    chip(wet ? 'GEELI GEND' : 'SOOKHI GEND', 540, 252, { bg: wet ? DEW : AMB, fg: G, font: AF(48), h: 82, a: fade(t, 0.1) });
    const dry = kk => kk < 0.62 ? [lerp(556, 600, kk / 0.62), lerp(440, 850, kk / 0.62)] : [lerp(600, 452, (kk - 0.62) / 0.38), lerp(850, 1100, (kk - 0.62) / 0.38)], wp = kk => [lerp(524, 536, kk), lerp(440, 1066, ease('in', kk) * 0.35 + kk * 0.65)];
    const path = wet ? wp : dry, P = wet ? 1.05 : 1.4, ph = wet ? ((t - tW) / P) % 1 : clamp((t - 0.1) / P), k = clamp(ph / 0.78);
    C.setLineDash([16, 14]); C.lineWidth = 7; C.strokeStyle = wet ? DEW : AMB; C.beginPath(); for (let j = 0; j <= 40; j++) { const kk = k * j / 40, [x, y] = path(kk); j ? C.lineTo(x, y) : C.moveTo(x, y); } C.stroke(); C.setLineDash([]);
    if (!wet) { circle(600, 850, 15); fillPath('rgba(120,90,50,0.55)'); if (k > 0.62) text('TURN!', 700, 850, { font: AF(46), fill: AMB, align: 'left', a: clamp((k - 0.62) * 6) }); }
    else { circle(531, 800, 15); fillPath('rgba(63,159,216,0.6)'); if (k > 0.55) text('SKID!', 700, 850, { font: AF(46), fill: DEW, align: 'left', a: clamp((k - 0.55) * 6) }); }
    dot(540, 404, wet ? DEW2 : '#8a5a3a', { r: 20, label: '' }); text('SPINNER', 508, 404, { font: IF(800, 22), fill: G, align: 'right' }); withT(() => bat(0, 0, 0, 0.62), { x: 540, y: 1040, r: Math.PI / 2 + (wet && ph > 0.74 ? -0.9 * clamp((ph - 0.74) / 0.1) : 0) });
    const [bx, by] = path(k); if (ph <= 0.8) (wet ? wetBall(bx, by, 22, { rot: t * 14, wet: 1, seed: 3 }) : ball(bx, by, 22, { rot: t * 14 })); else if (wet) { const u = (ph - 0.8) / 0.2; wetBall(lerp(536, 880, u), lerp(1066, 700, u), 22, { rot: t * 14, seed: 3 }); circle(536, 1066, 20 + u * 90); fillPath(null, `rgba(255,183,3,${1 - u})`, 8); }
    /* grip meter */
    const g = wet ? lerp(0.92, 0.28, ease('out', clamp((t - tW) / 0.8))) : 0.92; card(pop(t, 0.25), 232, 640, 300, 330, () => { text('PAKAD', 0, -112, { font: AF(56), fill: CR }); text('(grip)', 0, -66, { font: IF(600, 24), fill: TAN }); rr(-110, -30, 220, 54, 27); fillPath('#0b1410', CR, 4); rr(-104, -24, 208 * g, 42, 21); fillPath(wet ? DEW2 : AMB);
      text(Math.round(g * 100) + '%', 0, 82, { font: AF(84), fill: wet ? DEW : AMB }); }, { stroke: wet ? DEW2 : AMB });
    card(pop(t, wet ? tW + 0.1 : 0.35), 848, 640, 300, 250, () => { text(wet ? 'PHISAL KAR' : 'PITCH PAKAD KAR', 0, -62, { font: IF(800, wet ? 34 : 28), fill: CR }); text(wet ? 'SEEDHI' : 'GHOOMTI', 0, 0, { font: AF(68), fill: wet ? DEW : AMB }); text(wet ? 'BALLE PAR' : 'HAI', 0, 66, { font: IF(800, 34), fill: CR }); }, { stroke: wet ? DEW2 : AMB });
    flash(t, tW, 0.22, '200,235,255', 0.55); header(); caption(3, t - 0.1, d - 0.1); },
  /* the night goes on, the dew builds up: first innings v second innings */
  s4: t => { const S = TL.shot('s4'), d = S.dur, va = S.vo_at, vo = S.vo, tM = va + vo * 0.42, tC = va + vo * 0.68, k = ease('inOut', clamp((t - va * 0.5) / (vo * 0.42))); stripes(t * 30);
    chip('RAAT BADHTI HAI · OS BADHTI HAI', 540, 252, { bg: RED, font: AF(44), h: 78, a: fade(t, 0.1) });
    const x0 = 100, x1 = 980, yb = 760, yt = 420, lv = u => 0.06 + 0.86 * Math.pow(u, 1.7); rr(70, 320, 940, 520, 28); fillPath('#08222c', '#23414d', 6);
    C.fillStyle = 'rgba(244,236,216,0.06)'; C.fillRect(540, 340, 450, 425); text('PEHLI PAARI', 320, 372, { font: IF(800, 30), fill: TAN, ls: 2 }); text('DOOSRI PAARI', 765, 372, { font: IF(800, 30), fill: wetCol(t, tM), ls: 2 });
    C.beginPath(); C.moveTo(x0, yb); for (let j = 0; j <= 50; j++) { const u = k * j / 50; C.lineTo(lerp(x0, x1, u), yb - (yb - yt) * lv(u)); } C.lineTo(lerp(x0, x1, k), yb); C.closePath(); fillPath('rgba(155,216,255,0.32)');
    C.beginPath(); for (let j = 0; j <= 50; j++) { const u = k * j / 50, x = lerp(x0, x1, u), y = yb - (yb - yt) * lv(u); j ? C.lineTo(x, y) : C.moveTo(x, y); } C.strokeStyle = DEW; C.lineWidth = 8; C.lineCap = 'round'; C.stroke();
    for (let i = 0; i < 26; i++) { const u = hash(i * 3 + 1), v = hash(i * 7 + 2); if (u > k || v > lv(u)) continue; bead(lerp(x0, x1, u), yb - (yb - yt) * lv(u) * v * 0.92 - 6, 7 + 9 * u); }
    C.fillStyle = CR; C.fillRect(x0, yb, x1 - x0, 5); C.setLineDash([10, 10]); C.strokeStyle = 'rgba(244,236,216,0.5)'; C.lineWidth = 4; C.beginPath(); C.moveTo(540, 400); C.lineTo(540, yb); C.stroke(); C.setLineDash([]);
    drop(lerp(x0, x1, k), yb - (yb - yt) * lv(k) - 34, 20); text('SHAAM', x0 + 10, 802, { font: IF(800, 26), fill: TAN, align: 'left' }); text('DER RAAT', x1 - 10, 802, { font: IF(800, 26), fill: DEW, align: 'right' }); text('OS', 122, 430, { font: AF(44), fill: DEW, align: 'left', a: 0.9 });
    stamp('BOWLING MUSHKIL', 760, 590, t, tM, { col: '#fff', size: 58, r: -0.05, bg: RED });
    const sp = t > tC ? MOVES.point(t - tC, { yaw: 0.45 }) : MOVES.think(t, { seed: 4 }); if (t <= tC) sp.yaw = 0.35; drawChar(SKIPPER, sp, 230, 1240, 0.8, { t }); chip('CAPTAIN', 230, 872, { bg: GOLD, fg: G, font: IF(900, 22), h: 40 });
    if (t <= tC) { const kq = pop(t, 0.5, 0.4); if (kq > 0) withT(() => { text('?', 0, 0, { font: AF(150), fill: AMB }); }, { x: 420, y: 960, s: kq * (1 + 0.05 * Math.sin(t * 6)), r: 0.12 }); coin(640, 1060, 74, t * 4.2); text('BATTING YA BOWLING?', 800, 1180, { font: IF(800, 26), fill: TAN, a: fade(t, 0.6) }); }
    else { const kb = pop(t, tC + 0.15, 0.4); if (kb > 0) { withT(() => { poly([[-250, -30], [-340, -64], [-250, 26]]); fillPath(CR, G, 8); }, { x: 700, y: 1050, s: kb }); bubble('', 700, 1050, kb, { size: 62, lines: ['HUM PEHLE', 'BOWLING KARENGE!'], tailX: -20, tailY: 0, fg: G }); } flash(t, tC, 0.18); }
    header(); caption(4, t - 0.1, d - 0.1); },
  /* scoreboard: Dubai at the 2021 T20 World Cup */
  s5: t => { const S = TL.shot('s5'), d = S.dur, va = S.vo_at, vo = S.vo, tT = va + vo * 0.42, tN = va + vo * 0.56, tF = va + vo * 0.7, tE = va + vo * 0.92; stripes(t * 40); tint('rgba(4,20,14,0.3)');
    chip('MISAAL: T20 WORLD CUP 2021', 540, 252, { bg: RED, font: AF(46), h: 80, a: fade(t, 0.1) });
    card(pop(t, 0.2), 540, 560, 960, 470, () => { text('DUBAI · 13 MATCH', 0, -186, { font: IF(800, 32), fill: TAN, ls: 4 });
      const n = Math.round(13 * clamp((t - tT) / 1.1)); for (let i = 0; i < 13; i++) { const x = -438 + i * 68, on = i < n, last = i === 12; rr(x, -150, 60, 60, 12); fillPath(on ? (last ? TAN : AMB) : 'rgba(244,236,216,0.08)', on ? null : '#56655d', 3); if (on && !last) tick(x + 30, -120, 34, G); if (on && last) { C.fillStyle = G; C.fillRect(x + 16, -124, 28, 7); } }
      const ky = fade(t, va + vo * 0.1, 0.3) * (1 - fade(t, tN - 0.3, 0.25)); if (ky > 0) { C.globalAlpha = ky; trophy(-250, 62, 0.95); text('2021', 70, 20, { font: AF(170), fill: CR }); text('T20 WORLD CUP', 70, 128, { font: IF(800, 30), fill: TAN, ls: 3 }); C.globalAlpha = 1; }
      const kn = pop(t, tN, 0.45); if (kn > 0) withT(() => { text('12', -110, 0, { font: AF(176), fill: AMB }); text('/13', 100, 14, { font: AF(116), fill: CR }); }, { x: 0, y: 42, s: kn });
      text('CHASE KARNE WALI TEAM JEETI', 0, 152, { font: IF(800, 32), fill: CR, ls: 2, a: fade(t, tN + 0.2) }); text('raat ke saare match: chase karne wali team jeeti', 0, 196, { font: IF(600, 25), fill: TAN, a: fade(t, tN + 0.5) }); }, { bg: '#0b1410', stroke: '#2a3a33', lw: 8 });
    card(pop(t, tF), 540, 1015, 900, 270, () => { text('FINAL · 14 NOV 2021 · DUBAI', -410, -96, { font: IF(800, 28), fill: TAN, ls: 3, align: 'left' }); text('NEW ZEALAND', -410, -36, { font: IF(800, 36), fill: CR, align: 'left' }); text('172/4', 410, -34, { font: AF(60), fill: CR, align: 'right' });
      text('AUSTRALIA', -410, 36, { font: IF(800, 36), fill: AMB, align: 'left' }); text('173/2 (18.5)', 410, 38, { font: AF(60), fill: AMB, align: 'right' }); chip('AUSTRALIA: TOSS JEETA · PEHLE BOWLING', 0, 100, { bg: AMB, fg: G, font: IF(900, 26), h: 48 }); }, { stroke: AMB });
    flash(t, tE, 0.2); stamp('FINAL BHI!', 812, 872, t, tE, { col: '#fff', size: 62, r: -0.07, bg: RED });
    header(); caption(5, t - 0.1, d - 0.1); },
  /* headline: the ball-change rule, and where in the innings it applies */
  s6: t => { const S = TL.shot('s6'), d = S.dur, va = S.vo_at, vo = S.vo, tB = va + vo * 0.56, tX = va + vo * 0.72; stripes(t * 20);
    chip('TAULIYA · RASSI · SPRAY… OS PHIR BHI', 540, 250, { bg: INK, fg: TAN, font: IF(800, 30), h: 60, a: fade(t, 0.1) });
    paper(t, 0.15, { y: 592, mast: 'KAHANI TIMES', date: 'MARCH 2025', head: ['GEELI GEND?', 'BADAL DO!'], sub: 'IPL 2025 · NAYA RULE', hsize: 92, rot: -0.025 });
    const a = fade(t, 0.9); if (a > 0) { C.globalAlpha = a; text('DOOSRI PAARI · 20 OVER', 540, 900, { font: IF(800, 28), fill: TAN, ls: 3 });
      for (let i = 0; i < 20; i++) { const x = 92 + i * 45, on = i >= 10 && t > tB + (i - 10) * 0.05; rr(x, 928, 39, 56, 8); fillPath(on ? AMB : 'rgba(5,24,17,0.75)', on ? null : '#5d6b63', 3); text(String(i + 1), x + 19.5, 958, { font: IF(800, 20), fill: on ? G : '#8fa097' }); }
      C.globalAlpha = 1; const km = pop(t, tB, 0.35); if (km > 0) { C.fillStyle = RED; C.fillRect(537, 916, 6, 80 * clamp(km)); withT(() => chip('OVER 10 KE BAAD', 0, 0, { bg: RED, font: IF(900, 24), h: 44 }), { x: 540, y: 1020, s: km }); } }
    const kx = fade(t, tX, 0.25); if (kx > 0) { const sw = ease('inOut', clamp((t - tX - 0.2) / 0.6)); C.globalAlpha = kx; wetBall(330, 1122, 52, { rot: t * 2, seed: 5 }); arrow(410, 1122, 410 + 250 * sw, 1122, CR, 10, 1); text('EK BAAR', 540, 1084, { font: AF(40), fill: AMB, a: sw });
      withT(() => ball(0, 0, 52, { rot: 0.5 }), { x: 750, y: 1122, s: pop(t, tX + 0.6, 0.4) }); C.globalAlpha = 1; }
    header(); caption(6, t - 0.1, d - 0.1); },
  /* the question, then the end card */
  s7: t => lastShot(t, (t, S) => { const va = S.vo_at; nightSky(NIGHT); stars(t, 40, 230, 1250, 11); FX.glow(540, 700, 520, '255,210,140', 0.14);
    title2('AAP TOSS JEET KAR', 'KYA CHUNENGE?', 320, t, 0.05, { sa: 84, sb: 118, gap: 108 });
    coin(540, 700, 104, t * 5.2); const pl = Math.sin(t * 5) > 0;
    card(pop(t, va + 0.3), 270, 1000, 400, 300, () => { withT(() => bat(0, 0, 0, 0.72), { x: 14, y: -74, r: 0.5 }); text('BATTING', 0, 96, { font: AF(68), fill: pl ? AMB : CR }); }, { stroke: pl ? AMB : '#2a3a33' });
    card(pop(t, va + 0.5), 810, 1000, 400, 300, () => { ball(0, -36, 62, { rot: t * 3 }); text('BOWLING', 0, 96, { font: AF(68), fill: pl ? CR : AMB }); }, { stroke: pl ? '#2a3a33' : AMB });
    text('ya', 540, 1000, { font: AF(56), fill: TAN, a: fade(t, va + 0.5) }); },
    { q: 'BATTING YA BOWLING?', next: 'SANGAKKARA KE 4 SHATAK' }),
};
function wetCol(t, t0) { return t > t0 ? DEW : TAN; }
window.drawCover = () => { nightSky(NIGHT); stars(0, 60, 600, 1500, 5); moon(900, 790, 70); FX.glow(540, 1120, 620, '150,215,255', 0.3);
  rr(60, 210, 960, 160, 26); fillPath(RED); text('RAAT KA MATCH', 540, 296, { font: AF(118), fill: '#fff' }); text('OS KA KHEL!', 540, 470, { font: AF(150), fill: AMB });
  chip('TOSS JEETO… PEHLE BOWLING KYUN?', 540, 600, { bg: CR, fg: G, font: IF(900, 36), h: 74 });
  wetBall(540, 1060, 250, { rot: 0.5, wet: 1.6, seed: 8 }); drop(250, 880, 46); drop(840, 1250, 36); drop(210, 1240, 28);
  C.fillStyle = TURF; C.fillRect(0, 1560, 1080, 360); const P = blades(1600, 0, { n: 20, h: 190, w: 22, cold: 1, seed: 6 }); P.forEach(([x, y], i) => bead(x, y, 12 + 8 * hash(i)));
  chip('CRICKET SCIENCE', 540, 700, { bg: DEW, fg: G, font: AF(48), h: 80 }); rr(280, 1668, 720, 150, 24); fillPath('rgba(5,24,17,0.86)'); coverFoot(); };
ckBoot();
