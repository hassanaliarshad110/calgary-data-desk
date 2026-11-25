/* 2026-11-25 PM fun fact: "That giant blue ring near the airport is a streetlamp."
 * Lead identity Data Explainer (kinetic hook, stamps, chips, counter slam), borrowing a Storyteller map dive over
 * real Calgary onto the 96 Avenue NE site (S0), an object morph (S1), a real-geometry road map from the geo pack (S2)
 * and a Civic quote card (S4). Every on-screen fact maps to the audited claims table
 * (packages/2026-11-25-PM-blue-ring.md, C1-C11; audits/2026-11-25-PM.md).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30, THUMB = !!(window.PARAMS && window.PARAMS.thumb);
const DURS = (window.PARAMS && window.PARAMS.durs) ? window.PARAMS.durs.split(',').map(Number) : [2.6, 6.0, 5.0, 3.6, 2.6];
const S = M.script([
  { text: 'That giant blue ring near the airport is a streetlamp.', dur: DURS[0] },
  { text: 'A Berlin art group designed it into a row of street lamps on ninety-sixth Avenue Northeast, with its lights on top.', dur: DURS[1] },
  { text: 'It cost about four hundred seventy thousand dollars. The mayor at the time called it awful.', dur: DURS[2] },
  { text: 'Finished in twenty thirteen, it has since gained a cult-like following.', dur: DURS[3] },
  { text: 'Art, or eyesore? Drop your thoughts below.', dur: DURS[4] },
], { lead: .25, gap: .2, tail: .4 });
const sc = S.scenes, SPLIT = 1.8;
const COSTSPLIT = sc[2].speech * .52;   // "The mayor..." starts about here in line 2
const SRC = 'Sources: City of Calgary · inges idee · CBC · Daily Hive';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const GOLD = M.house.gold, RED = '#C8102E', BLUE = '#1f6fd6', GLOW = '#5fb0ff', ROAD = '#2a3442';
const RING = M.geo.xy(51.142447, -114.041984);   // C10/C11: artists' GPS point

function navyBg(c, top = '#0e2b52', bot = '#081428') { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function dark(c, y0, y1, a = .62) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.2, `rgba(7,13,24,${a})`); g.addColorStop(.8, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); }
function stamp(c, txt, x, y, k, o = {}) {
  if (k <= 0) return; const sz = o.size || 104, s = M.lerp(1.8, 1, Math.min(1, k)); c.save(); c.translate(x, y); c.rotate(o.rot ?? -.05); c.scale(s, s); c.globalAlpha = Math.min(1, k * 1.5);
  c.font = M.font(sz, 800); const w = c.measureText(txt).width + 70, h = sz * 1.45;
  M.rr(c, -w / 2, -h / 2, w, h, 20); c.fillStyle = o.bg || 'rgba(7,13,24,.88)'; c.fill(); c.lineWidth = 9; c.strokeStyle = o.color || GOLD; c.stroke();
  M.text(c, txt, 0, -sz * .56, { size: sz, weight: 800, align: 'center', color: o.color || GOLD, shadow: false });
  c.restore();
}
// the blue ring: circle standing on the ground at (x, y) with radius R; two lamp arms rise from the apex (C1, C3)
function ring(c, x, y, R, on = 1, glow = 0) {
  c.save(); const cy = y - R;
  if (glow > 0) { c.shadowColor = GLOW; c.shadowBlur = 60 * glow; }
  c.strokeStyle = BLUE; c.lineWidth = Math.max(6, R * .09); c.beginPath(); c.arc(x, cy, R, 0, 7); c.stroke();
  c.strokeStyle = '#4f8fe6'; c.lineWidth = Math.max(2, R * .025); c.beginPath(); c.arc(x - R * .02, cy - R * .02, R * .97, Math.PI * 1.05, Math.PI * 1.6); c.stroke();
  c.shadowBlur = 0; c.strokeStyle = '#c9d3df'; c.lineWidth = Math.max(4, R * .035); c.lineCap = 'round';
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x, cy - R); c.quadraticCurveTo(x + s * R * .1, cy - R * 1.55, x + s * R * .55, cy - R * 1.45); c.stroke();
    c.fillStyle = '#c9d3df'; c.beginPath(); c.ellipse(x + s * R * .58, cy - R * 1.43, R * .11, R * .045, 0, 0, 7); c.fill();
    if (on > 0) { const g = c.createRadialGradient(x + s * R * .58, cy - R * 1.38, 0, x + s * R * .58, cy - R * 1.3, R * .6); g.addColorStop(0, `rgba(255,220,140,${.75 * on})`); g.addColorStop(1, 'rgba(255,220,140,0)');
      c.fillStyle = g; c.beginPath(); c.arc(x + s * R * .58, cy - R * 1.3, R * .6, 0, 7); c.fill(); } }
  c.restore();
}
// ordinary street lamp post of height h at base (x, y)
function lamp(c, x, y, h, on = 1, a = 1) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = '#c9d3df'; c.lineWidth = Math.max(3, h * .03); c.lineCap = 'round';
  c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - h); c.quadraticCurveTo(x, y - h * 1.12, x + h * .22, y - h * 1.08); c.stroke();
  c.fillStyle = '#c9d3df'; c.beginPath(); c.ellipse(x + h * .24, y - h * 1.07, h * .07, h * .03, 0, 0, 7); c.fill();
  if (on > 0) { const g = c.createRadialGradient(x + h * .24, y - h * 1.03, 0, x + h * .24, y - h * .95, h * .4); g.addColorStop(0, `rgba(255,220,140,${.7 * on})`); g.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = g; c.beginPath(); c.arc(x + h * .24, y - h * .95, h * .4, 0, 7); c.fill(); }
  c.restore();
}
function duskSky(c) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(.55, '#3a3f6b'); g.addColorStop(.72, '#c77a4a'); g.addColorStop(.73, '#141c28'); g.addColorStop(1, '#0a0f16'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function road(c) { c.fillStyle = ROAD; c.fillRect(0, 1150, W, 90);
  c.fillStyle = '#5a6577'; c.fillRect(0, 1142, W, 10); c.fillStyle = 'rgba(242,182,50,.7)'; for (let x = 0; x < W; x += 120) c.fillRect(x, 1192, 60, 8); }
function heart(c, x, y, s, a) { c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s); c.fillStyle = '#ff5c7a'; c.beginPath(); c.moveTo(0, 10); c.bezierCurveTo(-26, -8, -12, -30, 0, -14); c.bezierCurveTo(12, -30, 26, -8, 0, 10); c.fill(); c.restore(); }

// S2 map: road lines copied from motion/geo/calgary_base.json (Deerfoot Trail NE, Airport Trail NE), metres east/north of downtown
const DEER = [[3244, 11606], [3082, 11432], [2942, 11244], [1948, 9757], [1829, 9475], [1790, 9232], [1800, 8520]];
const AIRP = [[2351, 10733], [2709, 10640], [3139, 10527], [3446, 10487], [6303, 10523]];
const MC = [2600, 10650], MS = .55;
const mx = p => CX + (p[0] - MC[0]) * MS, my = p => 900 - (p[1] - MC[1]) * MS;
function polyline(c, pts, k, color, wdt) { const n = pts.length - 1, f = k * n; c.save(); c.strokeStyle = color; c.lineWidth = wdt; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
  for (let i = 0; i <= n; i++) { if (i > f + 1) break; let p = pts[i]; if (i > f) { const a = pts[i - 1], r = f - (i - 1); p = [M.lerp(a[0], p[0], r), M.lerp(a[1], p[1], r)]; } i ? c.lineTo(mx(p), my(p)) : c.moveTo(mx(p), my(p)); } c.stroke(); c.restore(); }

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // S0 HOOK (0-1.8 s): frame 0 already diving over real Calgary onto the 96 Avenue NE site; hook punches from frame 0 (C1, C2, C10)
  { dur: SPLIT, trans: { kind: 'zoom', dur: .3 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 9000, far: 52000, max: .4 } }); M.geo.addBase(w, { buildings: true, roads: true, windows: '#ffd890' });
      M.pin(w, RING, '96 AVE NE', { p: THUMB ? 1 : M.seg(t, .2, .7, 'linear'), size: 50, scale: 1.3 }); M.ping(w, RING, t, { r: 150 });
      const cam = M.camera(M.moves.dive(RING, THUMB ? .78 : M.seg(t, 0, SPLIT + .8, 'outCubic'), { h0: 12000, h1: 2600, back0: 1, back1: 3400, ahead: 200 }), W, H); w.render(c, cam);
      M.source(c, MAPC, 60, 1460, { size: 20 }); M.text(c, 'N ↑', 60, 1400, { size: 32, weight: 700, color: '#fff' });
      if (THUMB) return;
      dark(c, 150, 760, .66);
      M.kinetic(c, 'The blue ring is a streetlamp', t, CX, 250, { t0: -.45, size: 124, maxW: 900, highlight: ['streetlamp'], every: .09 });
  } },
  // S1 the twist: a row of lamp posts; the middle one grows and bends into the giant blue ring, lights on top (C1, C3)
  { dur: sc[0].sceneDur - SPLIT, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      duskSky(c); road(c);
      const m = M.seg(t, .1, .7, 'outBack');
      [[90, 150], [230, 200], [730, 200], [870, 150]].forEach(([x, h]) => lamp(c, x, 1142, h, 1));
      lamp(c, CX, 1142, M.lerp(240, 380, Math.min(1, m)), 1, 1 - Math.min(1, m * 1.6));
      if (m > 0) ring(c, CX, 1142, 250 * Math.min(1.05, m), M.seg(t, .55, .8, 'linear'), .4);
      stamp(c, 'STREETLAMP', CX, 300, M.seg(t, .55, .85, 'outBack'), { size: 104 });
      M.source(c, SRC, 60, 1250, { size: 20 });
  } },
  // S2 who and where: real road lines draw in, ring icon drops at the GPS point, chips (C2, C4, C5, C10, C11)
  { dur: sc[1].sceneDur, trans: { kind: 'whip', dur: .3 }, draw: (c, t) => {
      navyBg(c, '#0a1d38', '#06101f');
      c.fillStyle = '#13263f'; c.fillRect(0, 560, W, 720); c.save(); c.beginPath(); c.rect(0, 560, W, 720); c.clip();
      const k = M.seg(t, 0, 1.4, 'inOutCubic');
      polyline(c, DEER, k, '#e8a33d', 26); polyline(c, AIRP, M.seg(t, .4, 1.6, 'inOutCubic'), '#9fb0c8', 18);
      if (k > .7) M.text(c, 'DEERFOOT TR', mx([2245, 10200]) + 50, my([2245, 10200]), { size: 48, weight: 800, color: '#ffd28a' });
      if (M.seg(t, .4, 1.6) > .7) M.text(c, 'AIRPORT TR', mx([2980, 10560]), my([2980, 10560]) + 40, { size: 44, weight: 800, color: '#dfe7f2' });
      const d = M.seg(t, 1.4, 1.8, 'outBack'); const px = mx(RING), py = my(RING);
      if (d > 0) { ring(c, px, M.lerp(560, py + 40, Math.min(1, d)), 40, 1, .6);
        if (d >= 1) { const r = ((t - 1.8) % 1.2) / 1.2; c.strokeStyle = `rgba(242,182,50,${1 - r})`; c.lineWidth = 6; c.beginPath(); c.arc(px, py, 40 + 120 * r, 0, 7); c.stroke(); }
        M.text(c, '96 AVE NE', px, py - 150, { size: 48, weight: 800, align: 'center', color: '#fff', alpha: Math.min(1, d) }); }
      c.restore();
      const k0 = M.seg(t, .15, .5, 'outBack'); if (k0 > 0) M.chip(c, 'TRAVELLING LIGHT', CX, 300, { align: 'center', size: 64, alpha: Math.min(1, k0) });
      const k1 = M.seg(t, 2.0, 2.35, 'outBack'); if (k1 > 0) M.chip(c, 'INGES IDEE · BERLIN', CX, 420, { align: 'center', size: 54, alpha: Math.min(1, k1), bg: '#ffffff' });
      M.text(c, 'N ↑', 960, 600, { size: 32, weight: 700, color: '#fff' });
      M.source(c, MAPC, 60, 580, { size: 20 }); M.source(c, SRC, 60, 1440, { size: 20 });
  } },
  // S3 how much: counter slams to the $470,000 reported by CBC ("about"; City budget line $471K) (C6)
  { dur: sc[2].start - sc[2].sceneStart + COSTSPLIT, trans: { kind: 'zoom', dur: .3 }, draw: (c, t) => {
      navyBg(c, '#13284a', '#0a1428');
      ring(c, CX, 1240, 150, 1, .3);
      const k0 = M.seg(t, 0, .3, 'outBack'); if (k0 > 0) M.chip(c, 'COST', CX, 420, { align: 'center', size: 64, alpha: Math.min(1, k0) });
      M.text(c, 'ABOUT', CX, 560, { size: 56, weight: 800, align: 'center', color: '#dfe7f2', alpha: M.seg(t, .1, .4) });
      M.counter(c, 470000, M.seg(t, .15, 1.4, 'linear'), CX, 640, { prefix: '$', size: 150, slam: true });
      M.source(c, 'Source: CBC News, Oct 11, 2013 · City of Calgary', 60, 1420, { size: 20 });
  } },
  // S4 the reaction: quote card "awful", attributed to the mayor of the day, 2013 (C7)
  { dur: sc[2].sceneDur - (sc[2].start - sc[2].sceneStart + COSTSPLIT), trans: { kind: 'flash', dur: .25 }, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      const k = M.seg(t, 0, .3, 'outBack'); if (k > 0) M.chip(c, 'MAYOR · 2013', CX, 360, { align: 'center', size: 60, alpha: Math.min(1, k), bg: '#ffffff' });
      const p = M.seg(t, .1, .5, 'outCubic'); c.save(); c.globalAlpha = p; M.rr(c, 110, 520, 860, 560, 24); c.fillStyle = '#f7f4ec'; c.fill();
      c.fillStyle = '#c9c2b2'; for (let i = 0; i < 4; i++) c.fillRect(170, 600 + i * 40, 740 * (i % 2 ? .7 : .95), 12);
      const q = M.seg(t, .45, .75, 'outBack'); if (q > 0) { c.save(); c.translate(CX, 900); const s = M.lerp(1.6, 1, Math.min(1, q)); c.scale(s, s);
        c.fillStyle = GOLD; c.font = M.font(150, 800); const tw = c.measureText('“awful”').width; c.globalAlpha = .9 * Math.min(1, q); c.fillRect(-tw / 2 - 16, -70, tw + 32, 140); c.globalAlpha = 1;
        c.fillStyle = '#111a26'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('“awful”', 0, 4); c.restore(); }
      c.restore();
      M.source(c, 'Source: CBC News, Oct 11, 2013', 60, 1420, { size: 20 });
  } },
  // S5 when and what changed: timeline 2013 -> today, ring glows, hearts rise (C8, C9)
  { dur: sc[3].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      const g = M.seg(t, .8, 2.0, 'linear');
      ring(c, CX, 1090, 190, 1, .3 + .9 * g);
      for (let i = 0; i < 9; i++) { const u = ((t * .5 + i / 9) % 1); if (t < .8) break; heart(c, CX + Math.sin(i * 2.3) * 300, 1080 - u * 460, 1.6 + (i % 3) * .5, (1 - u) * Math.min(1, (t - .8) * 2)); }
      const k = M.seg(t, 0, .3, 'outBack'); if (k > 0) M.chip(c, 'COMPLETED DEC 2013', CX, 330, { align: 'center', size: 56, alpha: Math.min(1, k) });
      c.save(); c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(150, 1160); c.lineTo(930, 1160); c.stroke();
      c.strokeStyle = GOLD; c.beginPath(); c.moveTo(150, 1160); c.lineTo(M.lerp(150, 930, M.seg(t, .2, 1.4, 'inOutCubic')), 1160); c.stroke(); c.restore();
      M.text(c, '2013', 150, 1185, { size: 52, weight: 800, align: 'center', color: '#fff' });
      M.text(c, 'TODAY', 900, 1185, { size: 52, weight: 800, align: 'center', color: '#fff', alpha: M.seg(t, 1.2, 1.5) });
      stamp(c, 'CULT-LIKE FOLLOWING', CX, 520, M.seg(t, 1.3, 1.6, 'outBack'), { size: 80 });
      M.source(c, 'Sources: City of Calgary · Daily Hive', 60, 1260, { size: 20 });
  } },
  // S6 QUESTION: no end card (under 2:00)
  { dur: sc[4].sceneDur, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      M.closer(c, 'Art, or eyesore?', M.seg(t, 0, sc[4].sceneDur, 'linear'), W, H, { highlight: ['art,', 'art', 'eyesore?'] });
  } },
], overlay: (c, t, info) => {
  if (THUMB) return;
  if (t > 3 && info.index < 6) M.header(c, window.LOGO, W, H);
  if (info.index < 6) M.caption(c, S.captionAt(t), W, H);
} });

const S3 = sc[2].sceneStart, S4 = sc[2].start + COSTSPLIT;
window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.02, sfx: 'impact', gain: -5 },
  { t: SPLIT - .15, sfx: 'whoosh', gain: -11 }, { t: SPLIT + .1, sfx: 'ticks', dur: .5, gain: -14 }, { t: SPLIT + .6, sfx: 'pop', gain: -10 }, { t: SPLIT + .6, sfx: 'stamp', gain: -7 },
  { t: sc[1].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[1].sceneStart, sfx: 'ticks', dur: 1.5, gain: -14 }, { t: sc[1].sceneStart + .2, sfx: 'pop', gain: -11 },
  { t: sc[1].sceneStart + 1.6, sfx: 'pop', gain: -9 }, { t: sc[1].sceneStart + 2.05, sfx: 'pop', gain: -11 },
  { t: S3 - .1, sfx: 'whoosh', gain: -10 }, { t: S3 + .1, sfx: 'pop', gain: -11 }, { t: S3 + .15, sfx: 'ticks', dur: 1.2, gain: -13 }, { t: S3 + 1.35, sfx: 'impact', gain: -7 },
  { t: S4 - .1, sfx: 'whoosh', gain: -10 }, { t: S4 + .1, sfx: 'pop', gain: -11 }, { t: S4 + .5, sfx: 'stamp', gain: -8 },
  { t: sc[3].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[3].sceneStart + .1, sfx: 'pop', gain: -11 }, { t: sc[3].sceneStart + .2, sfx: 'ticks', dur: 1.2, gain: -14 }, { t: sc[3].sceneStart + 1.35, sfx: 'stamp', gain: -7 },
  { t: sc[4].sceneStart - .15, sfx: 'whoosh', gain: -12 },
];
