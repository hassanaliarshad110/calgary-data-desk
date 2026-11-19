// ---------- ep13 helpers (a camel and a mule) ----------
// a camel seen side-on, a dark silhouette facing right; walk 0..1 swings the legs; o.howdah: covered litter, o.armor: plated cover
function camel(x, gy, s, t, walk = 0, o = {}) {
  X.save(); X.globalAlpha = o.a ?? 1; X.translate(x, gy); X.scale(s * (o.dir || 1), s);
  const col = o.col || '#0a0810', bob = walk ? Math.sin(t * 6) * 4 : 0;
  // legs
  X.strokeStyle = col; X.lineCap = 'round';
  [[-82, 0], [-58, Math.PI], [62, Math.PI], [88, 0]].forEach(([lx, ph]) => {
    const sw = Math.sin(t * 6 + ph) * .28 * walk; X.lineWidth = 15;
    X.beginPath(); X.moveTo(lx, -175 + bob); X.lineTo(lx + Math.sin(sw) * 70, -88 + bob * .5); X.lineTo(lx + Math.sin(sw * 1.4) * 95, 0); X.stroke();
  });
  X.translate(0, bob); X.fillStyle = col;
  // body + hump
  X.beginPath(); X.ellipse(0, -205, 125, 52, 0, 0, 6.28); X.fill();
  X.beginPath(); X.ellipse(-12, -248, 72, 50, 0, 0, 6.28); X.fill();
  // neck and head
  X.beginPath(); X.moveTo(95, -235); X.quadraticCurveTo(150, -215, 158, -300); X.quadraticCurveTo(162, -345, 182, -352); X.lineTo(205, -345);
  X.quadraticCurveTo(178, -320, 175, -290); X.quadraticCurveTo(170, -190, 110, -175); X.closePath(); X.fill();
  X.beginPath(); X.ellipse(205, -340, 38, 17, .15, 0, 6.28); X.fill();
  X.beginPath(); X.moveTo(-122, -215); X.quadraticCurveTo(-150, -190, -140, -150); X.lineWidth = 7; X.strokeStyle = col; X.stroke();
  if (o.armor) { // plated cover over the body: rows of dull metal scales
    X.save(); X.beginPath(); X.ellipse(0, -205, 122, 50, 0, 0, 6.28); X.clip();
    for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) { const sx = -125 + c * 19 + (r % 2) * 9, sy = -250 + r * 21;
      X.fillStyle = `rgba(150,140,120,${.22 + .1 * ((r + c) % 2)})`; X.beginPath(); X.arc(sx, sy, 10, 0, Math.PI); X.fill(); }
    X.restore();
    X.strokeStyle = 'rgba(201,154,77,.55)'; X.lineWidth = 3; X.beginPath(); X.ellipse(0, -205, 124, 52, 0, .2, 2.9); X.stroke();
  }
  if (o.howdah) { // the covered litter on the hump: nobody is seen inside
    const hx = -14, hy = -290;
    X.fillStyle = o.armor ? '#2a2620' : '#3a2416'; X.beginPath(); X.roundRect(hx - 66, hy - 56, 132, 70, 8); X.fill();
    X.beginPath(); X.moveTo(hx - 70, hy - 54); X.quadraticCurveTo(hx, hy - 150, hx + 70, hy - 54); X.closePath(); X.fill();
    X.strokeStyle = 'rgba(201,154,77,.75)'; X.lineWidth = 3; X.beginPath(); X.moveTo(hx - 62, hy - 50); X.quadraticCurveTo(hx, hy - 138, hx + 62, hy - 50); X.stroke();
    X.strokeRect(hx - 62, hy - 50, 124, 60);
    if (o.armor) { X.fillStyle = 'rgba(201,154,77,.6)'; for (let i = 0; i < 7; i++) for (let j = 0; j < 3; j++) { X.beginPath(); X.arc(hx - 50 + i * 17, hy - 38 + j * 18, 3, 0, 6.28); X.fill(); } }
    X.fillStyle = 'rgba(120,30,24,.85)'; X.fillRect(hx - 66, hy + 10, 132, 14);
  }
  X.restore();
}
// a mule, smaller and long-eared; o.rider draws a featureless covered rider
function mule(x, gy, s, t, walk = 0, o = {}) {
  X.save(); X.globalAlpha = o.a ?? 1; X.translate(x, gy); X.scale(s * (o.dir || 1), s);
  const col = o.col || '#0a0810', bob = walk ? Math.sin(t * 7) * 3 : 0;
  X.strokeStyle = col; X.lineCap = 'round';
  [[-70, 0], [-50, Math.PI], [55, Math.PI], [75, 0]].forEach(([lx, ph]) => {
    const sw = Math.sin(t * 7 + ph) * .3 * walk; X.lineWidth = 13;
    X.beginPath(); X.moveTo(lx, -118 + bob); X.lineTo(lx + Math.sin(sw) * 50, -58); X.lineTo(lx + Math.sin(sw * 1.3) * 64, 0); X.stroke();
  });
  X.translate(0, bob); X.fillStyle = col;
  X.beginPath(); X.ellipse(0, -138, 98, 40, 0, 0, 6.28); X.fill();
  X.beginPath(); X.moveTo(70, -160); X.quadraticCurveTo(100, -200, 120, -232); X.lineTo(150, -220); X.quadraticCurveTo(125, -175, 95, -118); X.closePath(); X.fill();
  X.beginPath(); X.ellipse(148, -210, 42, 17, .7, 0, 6.28); X.fill();
  X.beginPath(); X.moveTo(118, -236); X.lineTo(104, -292); X.lineTo(128, -244); X.fill();
  X.beginPath(); X.moveTo(128, -240); X.lineTo(128, -296); X.lineTo(140, -240); X.fill();
  X.beginPath(); X.moveTo(-96, -150); X.quadraticCurveTo(-122, -110, -112, -70); X.lineWidth = 8; X.stroke();
  if (o.rider) { X.fillStyle = '#2a1a10'; X.fillRect(-46, -184, 92, 16); woman(0, -168, 150, t, 2, 1, 1); }
  X.restore();
}
// a dog, dark silhouette, facing left (dir 1) ; bark 0..1 opens the jaw
function dog(x, gy, s, t, bark = 0, dir = 1) {
  X.save(); X.translate(x, gy); X.scale(s * dir, s); X.fillStyle = '#07060a'; X.strokeStyle = '#07060a'; X.lineCap = 'round'; X.lineWidth = 9;
  for (const lx of [-30, -18, 26, 38]) { X.beginPath(); X.moveTo(lx, -40); X.lineTo(lx, 0); X.stroke(); }
  X.beginPath(); X.ellipse(4, -48, 46, 18, 0, 0, 6.28); X.fill();
  X.beginPath(); X.moveTo(-36, -52); X.lineTo(-58, -78); X.lineTo(-46, -52); X.fill();
  const jaw = bark * .35;
  X.save(); X.translate(-58, -82); X.beginPath(); X.ellipse(-8, 0, 20, 13, 0, 0, 6.28); X.fill();
  X.beginPath(); X.moveTo(-14, -8); X.lineTo(-38, -6 - jaw * 30); X.lineTo(-22, 2); X.fill();
  X.beginPath(); X.moveTo(-14, 4); X.lineTo(-36, 8 + jaw * 30); X.lineTo(-18, 10); X.fill();
  X.beginPath(); X.moveTo(0, -10); X.lineTo(6, -30); X.lineTo(10, -8); X.fill(); X.restore();
  X.beginPath(); X.moveTo(48, -54); X.quadraticCurveTo(70, -70, 66, -90); X.lineWidth = 6; X.stroke();
  X.restore();
}
// an arrow in flight (from -> to, k 0..1) or stuck (k = 1, at the target, angle kept)
function arrow(x0, y0, x1, y1, k, a = 1) {
  if (a <= 0 || k <= 0) return; const x = lerp(x0, x1, k), y = lerp(y0, y1, k) - Math.sin(Math.PI * k) * 90, ang = Math.atan2(y1 - y0 - Math.cos(Math.PI * k) * 180 * Math.PI / 2 * .0, x1 - x0);
  X.save(); X.globalAlpha = a; X.translate(x, y); X.rotate(ang); X.strokeStyle = '#1a120a'; X.lineWidth = 4; X.beginPath(); X.moveTo(-70, 0); X.lineTo(0, 0); X.stroke();
  X.fillStyle = '#3a3430'; X.beginPath(); X.moveTo(8, 0); X.lineTo(-6, -6); X.lineTo(-6, 6); X.fill();
  X.fillStyle = 'rgba(200,190,170,.8)'; X.beginPath(); X.moveTo(-70, 0); X.lineTo(-84, -8); X.lineTo(-62, 0); X.lineTo(-84, 8); X.fill(); X.restore();
}
// a line of featureless soldiers with spears
function line(gy, x0, x1, h, t, a = 1, seed = 5, dir = 1) {
  if (a <= 0) return; const r = rng(seed); X.save(); X.globalAlpha = a;
  for (let x = x0; x < x1; x += 34 + r() * 20) { const hh = h * (.85 + r() * .3); figure(x, gy + r() * 10, hh, t * .3, x, false);
    X.strokeStyle = '#120e0a'; X.lineWidth = 4; X.beginPath(); X.moveTo(x + dir * hh * .15, gy); X.lineTo(x + dir * hh * .3, gy - hh * 1.35); X.stroke(); }
  X.restore();
}
function dunes(gy, c1 = '#6a4a2c', c2 = '#1a120a') { desert(gy, c1, c2); X.fillStyle = 'rgba(0,0,0,.2)'; X.beginPath(); X.moveTo(0, gy); X.quadraticCurveTo(250, gy - 60, 520, gy - 10); X.quadraticCurveTo(800, gy + 30, W, gy - 40); X.lineTo(W, gy + 6); X.lineTo(0, gy + 6); X.fill(); }

const SCENES = [
  // 0 hook: dusk desert; the armoured camel with its closed litter, then fourteen years later a mule; title
  (t, d) => {
    const sw = seg(t, d * .52, d * .64);
    duskSky(t); dunes(1060, '#5a3e26', '#120c08');
    X.save(); cam(1 + .05 * seg(t, 0, d), 540, 1000);
    if (sw < 1) { line(1062, 40, 360, 120, t, .7 * (1 - sw), 3); camel(lerp(380, 520, seg(t, 0, d * .6)), 1080, 1.05, t, 1, { howdah: 1, armor: 1, a: 1 - sw }); }
    if (sw > 0) { mule(lerp(480, 560, seg(t, d * .5, d)), 1080, 1.25, t, 1, { rider: 1, a: sw }); }
    X.restore();
    const a = seg(t, .3, 1.5);
    X.save(); X.globalAlpha = .55 * a; X.fillStyle = '#05040a'; X.fillRect(0, 230, W, 400); X.restore();
    X.save(); X.globalAlpha = a; rtlText(T().title1, 540, 340, AR() ? 100 : 86, '#f6dc9c', 960, 130); X.restore();
    const y1 = seg(t, d * .2, d * .3) * (1 - sw); if (y1 > 0) { bigNum(digits('36'), 540, 520, 96, '#f6dc9c', y1); }
    const y2 = seg(t, d * .66, d * .74); if (y2 > 0) { bigNum(digits('50'), 540, 520, 96, '#f6dc9c', y2); }
    const q = seg(t, d * .02, d * .12); if (q > 0) chip(T().who, 540, 680, 34, q);
  },
  // 1 Talha and Zubayr leave for Makkah, she joins; ~3000 march to Basra (a map)
  (t, d) => {
    duskSky(t); dunes(1080, '#4a3422', '#0e0906');
    const m = seg(t, .2, 1.2); X.save(); X.globalAlpha = m; X.fillStyle = 'rgba(30,22,14,.88)'; X.beginPath(); X.roundRect(110, 340, 860, 820, 30); X.fill(); X.strokeStyle = 'rgba(232,195,116,.6)'; X.lineWidth = 3; X.stroke(); X.restore();
    const P = { med: [430, 790], mak: [360, 1040], bas: [820, 470] };
    const l1 = seg(t, d * .06, d * .26); if (l1 > 0) link(P.med[0], P.med[1], lerp(P.med[0], P.mak[0], l1), lerp(P.med[1], P.mak[1], l1), m);
    const k = ease(seg(t, d * .62, d * .92));
    if (k > 0) { X.save(); X.globalAlpha = m; X.strokeStyle = 'rgba(220,90,60,.9)'; X.lineWidth = 8; X.setLineDash([22, 14]); X.beginPath(); X.moveTo(...P.mak);
      const cx = 760, cy = 900; for (let i = 1; i <= 30; i++) { const u = i / 30 * k; const x = (1 - u) * (1 - u) * P.mak[0] + 2 * u * (1 - u) * cx + u * u * P.bas[0], y = (1 - u) * (1 - u) * P.mak[1] + 2 * u * (1 - u) * cy + u * u * P.bas[1]; X.lineTo(x, y); } X.stroke(); X.restore(); }
    mapDot(...P.med, T().med, m); mapDot(...P.mak, T().mak, m, true); mapDot(...P.bas, T().bas, m, k > .95);
    kicker(T().k1, 270, seg(t, .2, 1.1), AR() ? 54 : 50);
    const c0 = seg(t, d * .04, d * .12) * (1 - seg(t, d * .5, d * .54)); if (c0 > 0) chip(T().umra, 540, 400, 32, c0);
    const c1 = seg(t, d * .3, d * .38) * (1 - seg(t, d * .5, d * .54)); if (c1 > 0) chip(T().joined, 540, 1100, 32, c1);
    const c2 = seg(t, d * .54, d * .6); if (c2 > 0) chip(T().blood, 540, 400, 32, c2);
    const c3 = seg(t, d * .7, d * .78); if (c3 > 0) chip(T().army, 540, 1100, 34, c3);
  },
  // 2 the waters of al-Haw'ab at night: dogs bark at the caravan; Musnad Ahmad
  (t, d) => {
    madinahNight(t, { sa: .8, moon: true, mx: 820, my: 360 });
    X.fillStyle = '#0c0a10'; X.fillRect(0, 990, W, 40);
    const g = X.createRadialGradient(560, 1110, 10, 560, 1110, 260); g.addColorStop(0, 'rgba(120,150,190,.45)'); g.addColorStop(1, 'rgba(120,150,190,0)'); X.fillStyle = g; X.beginPath(); X.ellipse(560, 1110, 260, 46, 0, 0, 6.28); X.fill();
    camel(lerp(-60, 260, ease(seg(t, 0, d * .3))), 1100, .8, t, 1 - seg(t, d * .25, d * .32), { howdah: 1 });
    camel(lerp(-300, 40, ease(seg(t, 0, d * .3))), 1110, .7, t, 1 - seg(t, d * .25, d * .32));
    const bk = t > d * .08 ? Math.abs(Math.sin(t * 9)) * (1 - seg(t, d * .7, d * .8)) : 0;
    dog(860, 1110, 1.1, t, bk, 1); dog(980, 1120, .9, t, bk * .8, 1);
    if (bk > 0) rings(790, 1020, t * 1.4, .4 * (1 - seg(t, d * .7, d * .8)), 1e9, '230,230,255');
    kicker(T().k2, 270, seg(t, .2, 1.1), AR() ? 54 : 50);
    const b = seg(t, d * .1, d * .18) * (1 - seg(t, d * .5, d * .54)); bookChip(T().ahmad, T().ahmadTx, 480, b);
    const q = seg(t, d * .54, d * .62); quoteCard(T().hawab, T().hawabRef, 520, q, 290, AR() ? 52 : 40);
    const c = seg(t, d * .84, d * .9); if (c > 0) chip(T().onward, 540, 760, 32, c);
  },
  // 3 the battle near Basra: two lines, dust, the armoured camel at the centre
  (t, d) => {
    daySky(.9, t); sun(.9); topShade(.6, 700); dunes(1060, '#7a5a38', '#1c130c');
    farTown(1050, 'rgba(60,46,32,.9)');
    line(1090, -20, 380, 150, t, 1, 7, 1); line(1090, 700, 1100, 150, t, 1, 9, -1);
    camel(560, 1120, 1.15, t, .15, { howdah: 1, armor: 1 });
    dust(540, 1040, 520, .5 + .4 * seg(t, d * .4, d), t);
    kicker(T().k3, 270, seg(t, .2, 1.1), AR() ? 54 : 50);
    const c0 = seg(t, d * .04, d * .12); if (c0 > 0) chip(T().when, 540, 400, 32, c0);
    const c1 = seg(t, d * .42, d * .5); if (c1 > 0) chip(T().armored, 540, 520, 32, c1);
    const c2 = seg(t, d * .64, d * .72); if (c2 > 0) chip(T().askar, 540, 640, 36, c2);
  },
  // 4 thousands dead; afterwards she is sent back to Madinah with honour, women of Basra beside her
  (t, d) => {
    const p = seg(t, d * .28, d * .38);
    if (p < 1) { X.save(); X.globalAlpha = 1 - p; duskSky(t); dunes(1060, '#4a3422', '#0e0906'); dust(540, 1000, 600, .7, t);
      for (let i = 0; i < 9; i++) { const r = rng(i + 50); X.save(); X.translate(80 + i * 115, 1050 + r() * 30); X.rotate(-.3 + r() * .6); X.strokeStyle = '#120e0a'; X.lineWidth = 5; X.beginPath(); X.moveTo(-50, 0); X.lineTo(50, -10); X.stroke(); X.restore(); }
      X.restore(); }
    if (p > 0) { X.save(); X.globalAlpha = p; daySky(1.7, t); sun(1.7); topShade(.6, 600); dunes(1080, '#7a5a38', '#1c130c');
      const w = seg(t, d * .35, d);
      camel(lerp(260, 760, w), 1110, .9, t, 1, { howdah: 1 });
      for (let i = 0; i < 4; i++) woman(lerp(120, 620, w) - i * 70, 1120 + (i % 2) * 8, 150, t, i, 1, 1, 1);
      figure(lerp(400, 900, w), 1115, 190, t, 3, false);
      X.restore(); }
    kicker(T().k4, 270, seg(t, .2, 1.1) * (1 - p), AR() ? 54 : 50);
    const c0 = seg(t, d * .04, d * .12) * (1 - p); if (c0 > 0) chip(T().thousands, 540, 420, 38, c0);
    const c1 = seg(t, d * .1, d * .18) * (1 - p); if (c1 > 0) chip(T().wiki, 540, 540, 28, c1);
    kicker(T().k4b, 270, p, AR() ? 54 : 50);
    const c2 = seg(t, d * .4, d * .48); if (c2 > 0) chip(T().brother, 540, 400, 32, c2);
    const c3 = seg(t, d * .58, d * .66); if (c3 > 0) chip(T().honour, 540, 520, 32, c3);
    const c4 = seg(t, d * .78, d * .86); if (c4 > 0) chip(T().women, 540, 640, 30, c4);
  },
  // 5 fourteen years later, 50 AH: Imam Hasan (a.s.) only as a dim light; his will
  (t, d) => {
    interior(t, { slits: .25, lamps: false }); lamp(300, 1020, t, .7);
    holyLight(700, 940, 34, 90, .55 + .1 * Math.sin(t), t, false);
    kicker(T().k5, 270, seg(t, .2, 1.1), AR() ? 54 : 50);
    const n = seg(t, d * .02, d * .1) * (1 - seg(t, d * .3, d * .34)); if (n > 0) { bigNum(digits('50'), 540, 450, 140, '#f6dc9c', n); chip(T().poison, 540, 580, 32, n); }
    const q = seg(t, d * .34, d * .42); quoteCard(T().will, T().yaqubi, 520, q, AR() ? 300 : 330, AR() ? 48 : 38);
    const c = seg(t, d * .8, d * .88); if (c > 0) chip(T().drop, 540, 790, 32, c);
  },
  // 6 the funeral is stopped: carriers with the covered bier, a rider on a mule, then arrows at the bier
  (t, d) => {
    daySky(1.1, t); sun(1.1); topShade(.6, 650);
    farTown(1040); mosque(t, 760, 1060, 520, 170); palm(1010, 1050, .55);
    const g = X.createLinearGradient(0, 1040, 0, H); g.addColorStop(0, '#5a452e'); g.addColorStop(1, '#100b07'); X.fillStyle = g; X.fillRect(0, 1040, W, H);
    const c = ease(seg(t, 0, d * .25));
    const bx = lerp(-120, 360, c);
    carrier(bx - 140, 1180, 170, t * (1 - seg(t, d * .25, d * .3)), 1, 1, 1); carrier(bx + 140, 1180, 170, t * (1 - seg(t, d * .25, d * .3)), 2, 1, 1);
    bier(bx, 1040, 260, 1, t);
    const ar = seg(t, d * .66, d * .95);
    for (let i = 0; i < 14; i++) { const r = rng(i + 90); const st = .02 + r() * .7, k = seg(ar, st, st + .25);
      if (k > 0) arrow(1150 + r() * 200, 600 + r() * 200, bx - 100 + r() * 200, 960 + r() * 70, k, 1); }
    line(1190, 640, 1100, 170, t, seg(t, d * .05, d * .2), 21, -1);
    const m = ease(seg(t, d * .3, d * .5)); mule(lerp(1200, 820, m), 1200, .9, t, 1 - seg(t, d * .48, d * .52), { rider: 1, dir: -1 });
    kicker(T().k6, 270, seg(t, .2, 1.1), AR() ? 54 : 50);
    const c0 = seg(t, d * .04, d * .12) * (1 - seg(t, d * .3, d * .34)); if (c0 > 0) chip(T().marwan, 540, 400, 30, c0);
    const q = seg(t, d * .34, d * .42) * (1 - seg(t, d * .64, d * .68)); quoteCard(T().myhouse, T().yaqubi, 520, q, 260, AR() ? 52 : 40);
    const n = seg(t, d * .74, d * .82); if (n > 0) { bigNum(digits('70'), 540, 450, 130, '#ff9a6a', n); chip(T().arrows, 540, 570, 30, n); }
  },
  // 7 "one day on a mule, one day on a camel"; Imam Husayn keeps the will; buried in al-Baqi' by Fatima bint Asad; Sunni books
  (t, d) => {
    const p = seg(t, d * .28, d * .36);
    if (p < 1) { X.save(); X.globalAlpha = 1 - p; duskSky(t); dunes(1080, '#4a3422', '#0e0906');
      camel(300, 1110, .7, t, 0, { howdah: 1, col: '#120e14' }); mule(780, 1110, .85, t, 0, { rider: 1, dir: -1, col: '#120e14' }); X.restore(); }
    if (p > 0) { X.save(); X.globalAlpha = p; madinahNight(t, { sa: .7, mx: 820, my: 360 }); baqi(1010, t, { n: 20 });
      mound(560, 1120, 170, seg(t, d * .45, d * .6)); holyLight(400, 1050, 30, 95, .85 * seg(t, d * .36, d * .44), t, false);
      lamp(700, 1110, t, .7); X.restore(); }
    kicker(T().k7, 270, seg(t, .2, 1.1) * (1 - p), AR() ? 54 : 50);
    const q = seg(t, d * .02, d * .08) * (1 - p); quoteCard(T().daySaying, T().hanafiyya, 520, q, 260, AR() ? 54 : 40);
    kicker(T().k7b, 270, p, AR() ? 54 : 50);
    const c0 = seg(t, d * .38, d * .46) * (1 - seg(t, d * .6, d * .64)); if (c0 > 0) chip(T().kept, 540, 400, 32, c0);
    const c1 = seg(t, d * .46, d * .54) * (1 - seg(t, d * .6, d * .64)); if (c1 > 0) chip(T().buried, 540, 520, 30, c1);
    bookChip(T().athir, T().prevented, 480, seg(t, d * .64, d * .7) * (1 - seg(t, d * .82, d * .86)));
    bookChip(T().dhahabi, T().prevented, 480, seg(t, d * .84, d * .9), '#3a2c1c');
  },
  // 8 end card
  (t, d) => {
    madinahNight(t, { c1: '#05040c', c2: '#0d0b1f', c3: '#1d1530', sa: .7, moon: true, mx: 860, my: 1000 });
    camel(250, 1150, .6, t, 0, { howdah: 1, col: '#050409' }); mule(830, 1150, .7, t, 0, { rider: 1, dir: -1, col: '#050409' });
    const a = easeOut(seg(t, .2, 1.4));
    X.save(); X.globalAlpha = a; X.textAlign = 'center'; X.textBaseline = 'middle';
    X.font = '700 92px Cinzel'; X.fillStyle = '#f6dc9c'; X.shadowColor = 'rgba(0,0,0,.8)'; X.shadowBlur = 16; X.letterSpacing = '6px';
    X.fillText('SHIA VOICE', 540, 330 + (1 - a) * 30); X.letterSpacing = '0px'; X.fillStyle = 'rgba(232,195,116,.7)'; X.fillRect(400, 395, 280, 2);
    X.restore();
    X.save(); X.globalAlpha = a; rtlText(T().brand, 540, 470, AR() ? 54 : 46, '#ffffff', 900, 80); X.restore();
    const c = seg(t, 1.6, 2.6); chip('FOLLOW', 400, 568, 34, c, true); chip('COMMENT', 680, 568, 34, c, true);
    const b = seg(t, 2.4, 3.4); X.save(); X.globalAlpha = b; rtlText(T().ask, 540, 720, AR() ? 50 : 44, '#f3d58c', 860, AR() ? 84 : 100); X.restore();
    const n = seg(t, d * .6, d * .72); if (n > 0) chip(T().next, 540, 900, 30, n);
  },
];

