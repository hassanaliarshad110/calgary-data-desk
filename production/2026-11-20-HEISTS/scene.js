/* Calgary Insight SPECIAL, posts Nov 20, 2026: "Calgary's strangest heists" (countdown 5 → 1).
 * Lead identity: Storyteller (night palette, suspense, chapter cards, match-cut map dives pin to pin).
 * Borrowed: Data Explainer counter slams and kinetic hooks; Civic Analyst map pins, evidence chips, cutaway.
 * Every on-screen fact maps to the claims table in packages/2026-11-20-SPECIAL-calgary-strangest-heists.md (C1–C18).
 * Own motion graphics only: generic SUV, stylised mall, wall cutaway, generic bobsled, plaques, generic armoured truck.
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
// measured Kokoro af_heart line durations (studio-probe run, then atempo 1.05)
const S = M.script([
  { text: 'Thieves broke through walls, rammed a mall, and stole a bobsled. In Calgary.', dur: 4.175 },
  { text: "Here are five of Calgary's strangest heists.", dur: 2.326 },
  { text: 'Number five. In twenty twenty-two, eight brass plaques honouring Victoria Cross recipients were stolen from a memorial in Currie.', dur: 7.491 },
  { text: 'The next year, plaques were taken from the Hangar Flight Museum too. The likely lure? The metal.', dur: 4.983 },
  { text: 'Number four. October twenty eighteen, northeast Calgary. Thieves broke through the walls of two businesses to reach a jewellery store.', dur: 7.47 },
  { text: 'Number three. November twenty twelve, just before four a.m. An SUV smashed into Market Mall, aiming for a jewellery store. No one was hurt.', dur: 8.789 },
  { text: "Number two. In October twenty twenty, a bobsled shell from the movie Cool Runnings, inspired by Jamaica's team at Calgary's nineteen eighty-eight Olympics, was stolen from outside the old Ranchman's building.", dur: 12.422 },
  { text: 'Nearly two years later, police found part of it. Only part.', dur: 3.194 },
  { text: "And number one. North Hill Shopping Centre, nineteen ninety-eight. Two men in military fatigues ambushed a Brink's cash delivery with assault rifles and tear gas.", dur: 9.655 },
  { text: 'More than eighty shots were fired. No one was hurt. And they left with nothing.', dur: 4.142 },
  { text: "The men behind it? A former Brink's employee and a Canadian soldier. Both went to prison.", dur: 5.327 },
  { text: 'Which one is the wildest? Comment below.', dur: 2.32 },
], { lead: .3, gap: .3, tail: 1.4 });
const sc = S.scenes;
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data · pins approximate';
const GOLD = M.house.gold, RED = '#e2483d', TEAL = '#2bb3a3', BRONZE = '#b07a3c';

// ---------- captions: each narration line split into short chunks, timed by characters ----------
const CHUNKS = [];
sc.forEach(s => {
  const parts = s.caption.replace(/a\.m\./g, 'a§m§|').match(/[^.?!,|]+[.?!,|]?/g).map(x => x.replace('|', '').trim().replace(/§/g, '.')).filter(Boolean), out = [];
  parts.forEach(p => { const w = p.split(/\s+/); if (w.length <= 8) out.push(p); else { const h = Math.ceil(w.length / 2); out.push(w.slice(0, h).join(' ')); out.push(w.slice(h).join(' ')); } });
  const merged = []; out.forEach(p => { const last = merged[merged.length - 1]; if (last && (last + ' ' + p).split(/\s+/).length <= 6) merged[merged.length - 1] = last + ' ' + p; else merged.push(p); });
  const tot = merged.reduce((a, p) => a + p.length, 0); let t = s.start;
  merged.forEach(p => { const d = s.speech * p.length / tot; CHUNKS.push({ t0: t, t1: t + d + (p === merged[merged.length - 1] ? .15 : 0), s: p }); t += d; });
});
const captionAt = t => { const c = CHUNKS.find(c => t >= c.t0 && t < c.t1); return c ? c.s : ''; };

// ---------- places (lat/lon → engine metres; approximate pins, checked against City community boundaries) ----------
const P = {
  currie: M.geo.xy(51.0170, -114.1230),      // Victoria Cross Blvd SW (CURRIE BARRACKS)
  hangar: M.geo.xy(51.0937, -114.0108),      // The Hangar Flight Museum, NE
  ne: M.geo.xy(51.0718, -113.9335),          // 68 St NE (MONTEREY PARK)
  market: M.geo.xy(51.0852, -114.1556),      // Market Mall (VARSITY)
  ranch: M.geo.xy(50.9703, -114.0700),       // former Ranchman's building, Macleod Trail S
  north: M.geo.xy(51.0667, -114.0996),       // North Hill Shopping Centre, NW
};
const PINS = [['5', 'Currie', P.currie], ['4', 'NE Calgary', P.ne], ['3', 'Market Mall', P.market], ['2', "Old Ranchman's", P.ranch], ['1', 'North Hill', P.north]];
const MAPCOL = { land: '#1b2a40', water: '#2f6fa6', park: '#22423a', road: '#4f5f76', motorway: '#b58f3e', boundary: '#0b1f3a' };

// ---------- drawing helpers ----------
function night(c, t, o = {}) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#03060f'); g.addColorStop(.55, o.mid || '#0d1d38'); g.addColorStop(1, '#070d18');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const r = M.rng(o.seed || 3); c.fillStyle = '#fff'; for (let i = 0; i < 60; i++) { const x = r() * W, y = r() * 620, tw = .35 + .35 * Math.sin(t * 2 + i); c.globalAlpha = tw * .6; c.fillRect(x, y, 2, 2); } c.globalAlpha = 1;
}
function band(c, y0, y1, a = .62) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); }
function groundLine(c, y) { c.fillStyle = '#0a1220'; c.fillRect(0, y, W, H - y); c.fillStyle = 'rgba(242,182,50,.18)'; c.fillRect(0, y, W, 4); }
function chip(c, s, y, o = {}) { return M.chip(c, s, o.x ?? CX, y, Object.assign({ align: 'center', size: 40, bg: GOLD, color: '#06101f' }, o)); }
function stamp(c, s, x, y, p, o = {}) {
  const st = M.ease.outBack(Math.min(1, Math.max(0, p))); if (p <= 0) return; c.save(); c.translate(x, y); c.rotate(o.rot ?? -.07); const k = M.lerp(1.9, 1, st); c.scale(k, k); c.globalAlpha = Math.min(1, p * 2);
  c.font = M.font(o.size || 60, 900); const w = c.measureText(s).width + 60; M.rr(c, -w / 2, -48, w, 96, 14); c.fillStyle = 'rgba(7,13,24,.88)'; c.fill(); c.lineWidth = 8; c.strokeStyle = o.color || RED; c.stroke();
  M.text(c, s, 0, 2, { size: o.size || 60, weight: 900, align: 'center', base: 'middle', color: o.color || RED, shadow: false }); c.restore();
}
// generic SUV silhouette, facing right; (x, y) = rear bottom; s = scale
function suv(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (o.lights) { const g = c.createLinearGradient(360, -70, 760, -40); g.addColorStop(0, 'rgba(255,240,190,.55)'); g.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(355, -78); c.lineTo(780, -150); c.lineTo(780, 30); c.lineTo(355, -50); c.fill(); }
  c.fillStyle = o.col || '#0c1424'; c.strokeStyle = 'rgba(160,190,230,.55)'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(0, -24); c.lineTo(0, -92); c.lineTo(70, -100); c.lineTo(100, -168); c.lineTo(268, -168); c.lineTo(318, -104); c.lineTo(362, -94); c.lineTo(366, -24); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = 'rgba(120,160,210,.35)'; c.beginPath(); c.moveTo(110, -156); c.lineTo(180, -156); c.lineTo(180, -106); c.lineTo(88, -106); c.closePath(); c.fill(); c.beginPath(); c.moveTo(192, -156); c.lineTo(262, -156); c.lineTo(302, -106); c.lineTo(192, -106); c.closePath(); c.fill();
  [80, 290].forEach(wx => { c.fillStyle = '#05080f'; c.beginPath(); c.arc(wx, -22, 36, 0, 7); c.fill(); c.fillStyle = '#4a5568'; c.beginPath(); c.arc(wx, -22, 14, 0, 7); c.fill(); });
  c.fillStyle = '#ffe9a8'; M.rr(c, 350, -86, 16, 12, 4); c.fill(); c.fillStyle = RED; M.rr(c, 0, -86, 10, 14, 3); c.fill();
  c.restore();
}
// stylised mall entrance; shatter 0..1 breaks the glass
function mall(c, x0, x1, base, shatter, t, o = {}) {
  c.fillStyle = '#16233a'; c.fillRect(x0, base - 420, x1 - x0, 420);
  c.fillStyle = '#1f3152'; c.fillRect(x0, base - 470, x1 - x0, 60);
  M.text(c, o.sign || 'MALL', (x0 + x1) / 2, base - 440, { size: 38, weight: 800, align: 'center', base: 'middle', color: '#d9a441', tracking: .3, shadow: false });
  const dx = (x0 + x1) / 2 - 150, dw = 300, dh = 300; c.fillStyle = '#0a1426'; c.fillRect(dx - 14, base - dh - 14, dw + 28, dh + 14);
  if (o.inside) o.inside(c, dx, base - dh, dw, dh);
  if (shatter < 1) { c.save(); c.globalAlpha = 1 - shatter; c.fillStyle = 'rgba(140,190,240,.28)'; c.fillRect(dx, base - dh, dw / 2 - 4, dh); c.fillRect(dx + dw / 2 + 4, base - dh, dw / 2 - 4, dh); c.strokeStyle = 'rgba(200,225,255,.7)'; c.lineWidth = 4; c.strokeRect(dx, base - dh, dw / 2 - 4, dh); c.strokeRect(dx + dw / 2 + 4, base - dh, dw / 2 - 4, dh); c.restore(); }
  if (shatter > 0) shards(c, dx + dw / 2, base - dh / 2, shatter, 7);
  if (o.alarm) { const a = .5 + .5 * Math.sin(t * 14); c.fillStyle = `rgba(226,72,61,${.18 * a})`; c.fillRect(0, 0, W, H); }
}
function shards(c, cx, cy, p, seed) {
  const r = M.rng(seed); c.save();
  for (let i = 0; i < 46; i++) { const a = r() * Math.PI * 2, sp = 120 + r() * 520, d = sp * M.ease.outCubic(Math.min(1, p)), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .7 + 260 * p * p, sz = 8 + r() * 22;
    c.globalAlpha = Math.max(0, 1 - p * .8); c.fillStyle = r() > .5 ? 'rgba(190,225,255,.9)' : 'rgba(120,170,220,.8)'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + sz, y + sz * .3); c.lineTo(x + sz * .2, y + sz); c.closePath(); c.fill(); }
  c.restore();
}
function gem(c, x, y, s, col = '#9fe8ff') { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(-30, -10); c.lineTo(-16, -26); c.lineTo(16, -26); c.lineTo(30, -10); c.lineTo(0, 28); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-30, -10); c.lineTo(30, -10); c.stroke(); c.restore(); }
// row of four units in cross-section; prog 0..1 = path progress through the walls
function cutaway(c, t, prog, o = {}) {
  const n = 4, x0 = 70, uw = 205, y0 = o.y || 700, h = o.h || 380, wall = 18, labels = ['IN', 'BUSINESS', 'BUSINESS', 'JEWELLERY'];
  c.fillStyle = '#25324a'; c.fillRect(x0 - 10, y0 - 40, uw * n + 20, 40);   // roof slab
  for (let i = 0; i < n; i++) { const x = x0 + i * uw; c.fillStyle = i === 3 ? '#20314f' : '#162238'; c.fillRect(x, y0, uw, h);
    M.text(c, labels[i], x + uw / 2, y0 + 26, { size: i === 3 ? 30 : 28, weight: 800, align: 'center', color: i === 3 ? GOLD : '#9fb0c8', shadow: false }); }
  gem(c, x0 + 3.5 * uw - 40, y0 + h - 110, 1, '#9fe8ff'); gem(c, x0 + 3.5 * uw + 36, y0 + h - 96, .8, '#ffd27a');
  c.fillStyle = '#2b3a55'; c.fillRect(x0, y0 + h, uw * n, 16);
  const hy = y0 + h - 150;
  for (let k = 1; k < n; k++) { const wx = x0 + k * uw - wall / 2, open = M.seg(prog, (k - .5) / n, (k - .2) / n, 'outBack');
    c.fillStyle = '#8a6b4f'; c.fillRect(wx, y0, wall, h); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; for (let yy = y0 + 22; yy < y0 + h; yy += 22) { c.beginPath(); c.moveTo(wx, yy); c.lineTo(wx + wall, yy); c.stroke(); }
    if (open > 0) { c.save(); c.fillStyle = '#05080f'; c.beginPath(); const r = 62 * Math.min(1.1, open); for (let a = 0; a < 7; a++) { const ang = a / 7 * Math.PI * 2, rr = r * (.8 + .25 * Math.sin(a * 3.1)); c.lineTo(wx + wall / 2 + Math.cos(ang) * rr * .5, hy + Math.sin(ang) * rr); } c.closePath(); c.fill(); c.restore();
      if (open < 1.05) { c.save(); c.globalAlpha = .5 * (1 - Math.min(1, open)); c.fillStyle = '#c9b8a0'; for (let d = 0; d < 6; d++) { c.beginPath(); c.arc(wx + 30 + d * 9, hy - 30 + d * 11, 14 + d * 3, 0, 7); c.fill(); } c.restore(); } }
  }
  // dotted path and torch light
  const px1 = x0 + uw * .3, px2 = x0 + 3.45 * uw, px = M.lerp(px1, px2, Math.min(1, prog));
  c.save(); c.setLineDash([12, 12]); c.lineDashOffset = -t * 60; c.strokeStyle = GOLD; c.lineWidth = 6; c.beginPath(); c.moveTo(px1, hy); c.lineTo(px, hy); c.stroke(); c.restore();
  const g = c.createRadialGradient(px, hy, 4, px, hy, 70); g.addColorStop(0, 'rgba(255,240,180,.95)'); g.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = g; c.beginPath(); c.arc(px, hy, 70, 0, 7); c.fill();
}
// generic bobsled side profile (house navy/gold; not the film's design)
function sled(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha *= o.alpha ?? 1;
  const path = () => { c.beginPath(); c.moveTo(20, -70); c.lineTo(250, -74); c.quadraticCurveTo(338, -66, 346, -30); c.quadraticCurveTo(336, 0, 280, 0); c.lineTo(20, 0); c.quadraticCurveTo(-6, -35, 20, -70); c.closePath(); };
  if (o.dashed) { c.setLineDash([16, 12]); c.lineWidth = 5; c.strokeStyle = 'rgba(255,255,255,.75)'; path(); c.stroke(); c.restore(); return; }
  if (o.clipFront) { c.beginPath(); c.rect(170, -120, 300, 200); c.clip(); }
  path(); c.fillStyle = '#1d3f6e'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#cfe0f5'; c.stroke();
  c.fillStyle = GOLD; c.beginPath(); c.moveTo(40, -36); c.lineTo(300, -40); c.lineTo(300, -26); c.lineTo(36, -22); c.closePath(); c.fill();
  c.fillStyle = '#081428'; c.beginPath(); c.ellipse(140, -72, 90, 12, 0, 0, 7); c.fill();
  c.strokeStyle = '#9fb0c8'; c.lineWidth = 6; c.beginPath(); c.moveTo(20, 16); c.lineTo(300, 16); c.quadraticCurveTo(340, 14, 344, -6); c.stroke();
  c.restore();
}
function building(c, base, t, o = {}) {   // generic low western-style building at night (not a likeness)
  c.fillStyle = '#2a2230'; c.fillRect(90, base - 470, 840, 470);
  c.fillStyle = '#3a2f3e'; c.beginPath(); c.moveTo(70, base - 470); c.lineTo(950, base - 470); c.lineTo(930, base - 520); c.lineTo(90, base - 520); c.closePath(); c.fill();
  for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(255,200,120,.10)'; c.fillRect(130 + i * 160, base - 230, 100, 120); }
  c.fillStyle = '#120d16'; c.fillRect(440, base - 200, 140, 200);
}
function truck(c, x, y, s) {   // generic armoured truck, facing left, no markings
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#3c4a5e'; c.strokeStyle = 'rgba(200,215,235,.6)'; c.lineWidth = 3;
  M.rr(c, 120, -230, 330, 200, 10); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(0, -30); c.lineTo(0, -120); c.lineTo(30, -170); c.lineTo(118, -170); c.lineTo(118, -30); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = 'rgba(140,180,220,.35)'; c.beginPath(); c.moveTo(14, -122); c.lineTo(38, -158); c.lineTo(104, -158); c.lineTo(104, -122); c.closePath(); c.fill();
  [60, 200, 390].forEach(wx => { c.fillStyle = '#05080f'; c.beginPath(); c.arc(wx, -26, 34, 0, 7); c.fill(); c.fillStyle = '#4a5568'; c.beginPath(); c.arc(wx, -26, 13, 0, 7); c.fill(); });
  c.fillStyle = '#ffe9a8'; M.rr(c, -4, -80, 12, 14, 3); c.fill(); c.restore();
}
function figure(c, x, y, s, o = {}) {   // silhouette in fatigues (no weapon drawn)
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = o.col || '#2f3a24';
  c.beginPath(); c.arc(0, -250, 30, 0, 7); c.fill(); M.rr(c, -42, -214, 84, 130, 26); c.fill(); M.rr(c, -38, -96, 32, 96, 12); c.fill(); M.rr(c, 6, -96, 32, 96, 12); c.fill();
  M.rr(c, -62, -205, 24, 100, 12); c.fill(); M.rr(c, 38, -205, 24, 100, 12); c.fill();
  const r = M.rng(o.seed || 5); c.fillStyle = 'rgba(90,100,60,.85)'; for (let i = 0; i < 14; i++) { c.beginPath(); c.ellipse(-36 + r() * 72, -200 + r() * 190, 8 + r() * 8, 5 + r() * 5, r() * 3, 0, 7); c.fill(); }
  if (o.hl) { c.strokeStyle = GOLD; c.lineWidth = 5; c.beginPath(); c.arc(0, -250, 34, 0, 7); c.stroke(); }
  c.restore();
}
function gas(c, cx, cy, p, seed) { const r = M.rng(seed); c.save(); for (let i = 0; i < 16; i++) { const a = r() * 6.28, d = 40 + r() * 260 * p, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .5 - 80 * p; c.globalAlpha = .28 * Math.min(1, p * 2); c.fillStyle = '#c9d2dc'; c.beginPath(); c.arc(x, y, 40 + r() * 70 * p, 0, 7); c.fill(); } c.restore(); }
function plaque(c, x, y, w, h, o = {}) { c.save(); c.globalAlpha *= o.alpha ?? 1; c.translate(x, y); c.rotate(o.rot || 0); const g = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, '#d9a45a'); g.addColorStop(.5, BRONZE); g.addColorStop(1, '#7a4f22'); M.rr(c, -w / 2, -h / 2, w, h, 6); c.fillStyle = g; c.fill(); c.lineWidth = 3; c.strokeStyle = '#f0c27a'; c.stroke(); c.fillStyle = 'rgba(60,35,10,.55)'; for (let k = 0; k < 4; k++) c.fillRect(-w / 2 + 14, -h / 2 + 18 + k * (h - 30) / 4, (w - 28) * (k === 0 ? .7 : .9), 6); c.restore(); }
// north-up map with pins; tgt = place to dive onto, p = dive progress
function mapScene(c, t, o) {
  const w = M.world({ sky: 'night', fog: { near: 12000, far: 60000, max: .4 } });
  M.geo.addBase(w, { buildings: false, roads: true, colors: MAPCOL, communities: !!o.hi, highlightCommunity: o.hi, hiColor: GOLD, hiAlpha: .35, lineAlpha: .08 });
  (o.pins || []).forEach(([n, lab, p3], i) => M.pin(w, p3, o.labels === false ? '' : n + ' · ' + lab, { p: o.pinP ? o.pinP(i) : 1, size: 32, scale: o.pinScale || 1 }));
  if (o.tgt) { M.pin(w, o.tgt, o.tgtLabel || '', { p: M.seg(t, .25, .7), size: 40, scale: 1.2 }); M.ping(w, o.tgt, t, { r: 140 }); }
  const cam = o.cam ? o.cam : M.camera(M.moves.dive(o.tgt, o.p, { h0: 26000, h1: 5200, back0: 9000, back1: 2600, ahead: 200 }), W, H);
  w.render(c, cam);
  // north arrow (orientation cue)
  c.save(); c.translate(890, 1150); c.fillStyle = 'rgba(7,13,24,.7)'; c.beginPath(); c.arc(0, 0, 40, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(0, -28); c.lineTo(14, 10); c.lineTo(0, 2); c.lineTo(-14, 10); c.closePath(); c.fill(); M.text(c, 'N', 0, 24, { size: 22, weight: 800, align: 'center', base: 'middle', shadow: false }); c.restore();
  M.source(c, MAPC, 40, 1452, { size: 17 });
}
function chapter(c, t, num, title, o = {}) {   // countdown chapter card (mini hook every ~10–15 s)
  const a = o.hold ? 1 : 1 - M.seg(t, o.out || 2.1, (o.out || 2.1) + .3, 'linear'); if (a <= 0) return; c.save(); c.globalAlpha = a;
  band(c, 290, 700, .7);
  M.kinetic(c, '#' + num, t, CX, 320, { t0: -.12, size: 150, upper: false, color: GOLD });
  M.kinetic(c, title, t, CX, 480, { t0: .12, size: 96, maxW: 860, every: .08 });
  c.restore();
}
const src = (c, s) => M.source(c, s, 40, 1486, { size: 17 });

window.BUILD = () => M.film({ W, H, identity: 'storyteller', scenes: [
  // 0 HOOK: frame 0 an SUV is already bursting through mall doors at night; then walls, then the empty bobsled outline
  { dur: sc[0].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      night(c, t, { seed: 2 });
      if (t < 1.6) { const u = t + .45; groundLine(c, 1230); c.save(); mall(c, 200, 1080, 1230, M.seg(u, .35, 1.6, 'linear'), t, { alarm: true, inside: (x, dx, dy, dw, dh) => { gem(x, dx + dw / 2, dy + dh / 2, 1.1); } });
        suv(c, M.lerp(-160, 200, M.ease.outCubic(Math.min(1, u / .5))), 1230, 1.35, { lights: true }); c.restore();
        M.kinetic(c, "Calgary's strangest heists 🕵️", t, CX, 330, { t0: -.12, size: 122, maxW: 880, every: .09, highlight: ['heists'] }); }
      else if (t < 3.2) { const u = t - 1.6; cutaway(c, t, M.seg(u, 0, 1.5, 'linear') * .8 + .2, { y: 760, h: 360 });
        M.kinetic(c, 'Thieves cut through WALLS…', u, CX, 330, { t0: -.05, size: 120, maxW: 880, every: .08, highlight: ['walls…'] }); }
      else { const u = t - 3.2; groundLine(c, 1180); building(c, 1180, t);
        c.strokeStyle = '#9fb0c8'; c.lineWidth = 4; c.beginPath(); c.moveTo(380, 660); c.lineTo(400, 760); c.moveTo(650, 660); c.lineTo(630, 760); c.stroke();
        const blink = u < .55 ? (Math.floor(u * 14) % 2 ? .25 : 1) : 0; if (blink > 0) sled(c, 330, 840, 1.15, { alpha: blink }); if (u > .3) sled(c, 330, 840, 1.15, { dashed: true });
        M.kinetic(c, '…and stole a BOBSLED?', u, CX, 330, { t0: -.05, size: 120, maxW: 880, every: .08, highlight: ['bobsled?'] }); }
      if (t > 1.5 && t < 1.7) { c.fillStyle = `rgba(255,246,224,${.8 * Math.sin((t - 1.5) / .2 * Math.PI)})`; c.fillRect(0, 0, W, H); }
      if (t > 3.1 && t < 3.3) { c.fillStyle = `rgba(255,246,224,${.8 * Math.sin((t - 3.1) / .2 * Math.PI)})`; c.fillRect(0, 0, W, H); }
  } },
  // 1 THE MAP: five pins drop on a north-up Calgary map, 5 → 1
  { dur: sc[1].sceneDur, trans: { kind: 'zoom', dur: .35 }, draw: (c, t) => {
      const cx = 2400, cy = 100, cam = M.camera({ pos: [cx, cy - 3000, 48000 - 1500 * t], look: [cx, cy, 0], fov: 50 }, W, H);
      mapScene(c, t, { cam, pins: PINS, pinScale: .8, pinP: i => M.seg(t, .15 + i * .22, .55 + i * .22) });
      band(c, 290, 440, .65); M.kinetic(c, '5 strangest heists', t, CX, 318, { t0: -.1, size: 84, maxW: 900, highlight: ['5'] });
  } },
  // 2 #5 PLAQUES (Currie): dive onto Currie, then eight plaques leave the memorial wall
  { dur: sc[2].sceneDur, trans: { kind: 'match', dur: .4 }, draw: (c, t) => {
      if (t < 2.4) { mapScene(c, t, { tgt: P.currie, p: M.seg(t, 0, 2.4, 'outCubic'), hi: 'CURRIE BARRACKS', tgtLabel: 'Currie' }); chip(c, '2022 · CURRIE', 1130, { alpha: M.seg(t, .6, .9) }); chapter(c, t, 5, 'The plaque thefts', { out: 2.05 }); }
      else { const u = t - 2.4; night(c, t, { mid: '#151f30' });
        c.fillStyle = '#5b6170'; c.fillRect(0, 640, W, 520); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let yy = 640; yy < 1160; yy += 86) { c.beginPath(); c.moveTo(0, yy); c.lineTo(W, yy); c.stroke(); }
        const cols = 6, rows = 3, pw = 150, ph = 110, gx = -40, gy = 700; let k = 0; const gone = [[0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2]];
        for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const x = gx + q * 185 + 92, y = gy + r * 150 + 55, gi = gone.findIndex(g => g[0] + 1 === q && g[1] === r);
          if (gi < 0) { plaque(c, x, y, pw, ph); continue; }
          const p = M.seg(u, .4 + gi * .32, .75 + gi * .32, 'inCubic'); c.strokeStyle = 'rgba(255,255,255,.55)'; c.setLineDash([10, 8]); c.lineWidth = 3; c.strokeRect(x - pw / 2, y - ph / 2, pw, ph); c.setLineDash([]);
          if (p < 1) plaque(c, x + p * 40, y + p * 420, pw, ph, { alpha: 1 - p, rot: p * .6 }); if (p > 0) k++; }
        band(c, 290, 640, .75);
        M.counter(c, k, 1, CX, 300, { size: 170, from: 0 });
        M.text(c, 'BRASS PLAQUES HONOURING VICTORIA CROSS RECIPIENTS', CX, 490, { size: 50, weight: 800, align: 'center', maxW: 860, color: GOLD });
        chip(c, '2022 · CURRIE', 1180, { size: 36 });
        src(c, 'Sources: CTV News Calgary; Calgary Herald'); }
  } },
  // 3 HANGAR FLIGHT MUSEUM: dive NE, plaque lifts off its stone base, "the likely lure: the metal"
  { dur: sc[3].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      if (t < 1.9) { mapScene(c, t, { tgt: P.hangar, p: M.seg(t, 0, 1.9, 'outCubic'), tgtLabel: 'Hangar Flight Museum' }); chip(c, '2023 · HANGAR FLIGHT MUSEUM', 1130, { alpha: M.seg(t, .4, .7), size: 36 }); }
      else { const u = t - 1.9; night(c, t, { mid: '#151f30' }); groundLine(c, 1180);
        c.fillStyle = '#c8a77a'; M.rr(c, 300, 820, 420, 360, 14); c.fill(); c.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 0; k < 6; k++) c.fillRect(300, 860 + k * 55, 420, 4);
        const lift = M.seg(u, .2, 1.2, 'inOutCubic'); c.strokeStyle = 'rgba(255,255,255,.55)'; c.setLineDash([10, 8]); c.lineWidth = 3; c.strokeRect(370, 880, 280, 190); c.setLineDash([]);
        const lure = M.seg(u, 1.3, 1.8, 'outBack');
        plaque(c, 510 + lift * 0, 975 - lift * 260, 280 * M.lerp(1, .8, lure), 190 * M.lerp(1, .8, lure), { rot: -lift * .12 });
        if (lure > 0) { c.save(); c.globalAlpha = Math.min(1, lure); for (let i = 0; i < 6; i++) { const a = t * 2 + i; c.strokeStyle = 'rgba(255,215,140,.8)'; c.lineWidth = 4; c.beginPath(); c.moveTo(510 + Math.cos(a) * 190, 715 + Math.sin(a) * 140); c.lineTo(510 + Math.cos(a) * 230, 715 + Math.sin(a) * 170); c.stroke(); } c.restore(); }
        band(c, 290, 600, .7); M.text(c, '2023 · HANGAR FLIGHT MUSEUM', CX, 330, { size: 52, weight: 800, align: 'center', color: '#fff', maxW: 860 });
        if (u > 1.3) M.kinetic(c, 'The likely lure: the METAL', u, CX, 420, { t0: 1.3, size: 96, maxW: 880, every: .08, highlight: ['metal'] });
        chip(c, 'LIKELY MOTIVE · AS REPORTED', 1210, { size: 30, bg: '#9fb0c8', alpha: M.seg(u, 1.6, 1.9) });
        src(c, 'Sources: CTV News Calgary; Global News; Calgary Herald'); }
  } },
  // 4 #4 THROUGH THE WALLS: dive NE (Monterey Park), then the cutaway path through two businesses
  { dur: sc[4].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      if (t < 2.4) { mapScene(c, t, { tgt: P.ne, p: M.seg(t, 0, 2.4, 'outCubic'), hi: 'MONTEREY PARK', tgtLabel: 'NE Calgary' }); chip(c, 'OCT 12, 2018 · NE CALGARY', 1130, { alpha: M.seg(t, .6, .9), size: 36 }); chapter(c, t, 4, 'Through the walls', { out: 2.05 }); }
      else { const u = t - 2.4; night(c, t); cutaway(c, t, M.seg(u, .3, 4.4, 'inOutSine'), { y: 760, h: 380 });
        band(c, 290, 600, .7); M.text(c, 'OCT 12, 2018 · NE CALGARY', CX, 330, { size: 52, weight: 800, align: 'center', color: '#fff' });
        M.kinetic(c, 'Through the walls', u, CX, 420, { t0: -.1, size: 100, maxW: 880, highlight: ['walls'] });
        chip(c, 'THROUGH 2 BUSINESSES', 1200, { size: 40, alpha: M.seg(u, 3.4, 3.7) });
        src(c, 'Sources: Calgary Police Service (Oct 18, 2018); CTV News Calgary'); }
  } },
  // 5 #3 THE MALL CRASH: dive onto Market Mall, clock just before 4 a.m., SUV through the doors, no one hurt
  { dur: sc[5].sceneDur, trans: { kind: 'flash', dur: .3 }, draw: (c, t) => {
      if (t < 2.4) { mapScene(c, t, { tgt: P.market, p: M.seg(t, 0, 2.4, 'outCubic'), hi: 'VARSITY', tgtLabel: 'Market Mall' }); chip(c, 'NOV 5, 2012 · MARKET MALL', 1130, { alpha: M.seg(t, .6, .9), size: 36 }); chapter(c, t, 3, 'The mall crash', { out: 2.05 }); }
      else { const u = t - 2.4; night(c, t); groundLine(c, 1180);
        const crashAt = 2.1, sh = M.seg(u, crashAt, crashAt + 1.4, 'linear');
        mall(c, 330, 1060, 1180, sh, t, { sign: 'MALL', alarm: u > crashAt, inside: (x, dx, dy, dw, dh) => { x.fillStyle = '#20314f'; x.fillRect(dx + 20, dy + 40, dw - 40, dh - 40); M.text(x, 'JEWELLERY', dx + dw / 2, dy + 62, { size: 26, weight: 800, align: 'center', color: GOLD, shadow: false }); gem(x, dx + dw / 2 - 40, dy + dh - 80, .9); gem(x, dx + dw / 2 + 40, dy + dh - 70, .7, '#ffd27a'); } });
        suv(c, M.lerp(-420, 330, M.ease.inCubic(M.seg(u, .8, crashAt))), 1180, 1.05, { lights: true });
        // clock "just before 4 a.m."
        const ck = 1 - M.seg(u, 1.6, 1.9, 'linear'); if (ck > 0) { c.save(); c.globalAlpha = ck; c.translate(CX, 830); c.fillStyle = 'rgba(7,13,24,.85)'; c.beginPath(); c.arc(0, 0, 150, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 8; c.stroke();
          for (let h = 0; h < 12; h++) { const a = h / 12 * 6.283; c.fillStyle = '#fff'; c.fillRect(Math.sin(a) * 124 - 4, -Math.cos(a) * 124 - 4, 8, 8); }
          const ma = (55 + 3 * M.seg(u, 0, 1.4)) / 60 * 6.283, ha = (3 + (55 + 3 * M.seg(u, 0, 1.4)) / 60) / 12 * 6.283; c.lineCap = 'round'; c.lineWidth = 12; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(ha) * 70, -Math.cos(ha) * 70); c.stroke(); c.lineWidth = 7; c.strokeStyle = GOLD; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(ma) * 110, -Math.cos(ma) * 110); c.stroke(); c.restore(); }
        band(c, 290, 600, .7); M.text(c, 'NOV 5, 2012 · MARKET MALL', CX, 330, { size: 52, weight: 800, align: 'center', color: '#fff' });
        if (u < 1.9) M.kinetic(c, 'Just before 4 a.m.', u, CX, 420, { t0: -.1, size: 100, maxW: 880, highlight: ['4'] });
        else M.kinetic(c, 'SUV through the doors', u, CX, 420, { t0: 1.9, size: 100, maxW: 880, highlight: ['suv'] });
        chip(c, 'NO ONE HURT', 1210, { size: 44, bg: TEAL, alpha: M.seg(u, 4.9, 5.2) });
        src(c, 'Sources: Calgary Police Service; Global News; CTV News Calgary'); }
  } },
  // 6 #2 THE BOBSLED: dive south to the old Ranchman's building, the sled under the roof, 1988 → the movie, then gone
  { dur: sc[6].sceneDur, trans: { kind: 'match', dur: .4 }, draw: (c, t) => {
      if (t < 2.4) { mapScene(c, t, { tgt: P.ranch, p: M.seg(t, 0, 2.4, 'outCubic'), tgtLabel: "Old Ranchman's" }); chip(c, "OCT 2020 · OLD RANCHMAN'S BUILDING", 1130, { alpha: M.seg(t, .6, .9), size: 34 }); chapter(c, t, 2, 'The bobsled', { out: 2.05 }); return; }
      const u = t - 2.4; night(c, t, { seed: 9 });
      if (u > 2.9 && u < 6.9) {   // 1988 → the movie (when: a two-stop timeline)
        const p = M.seg(u, 3.0, 4.6, 'inOutCubic'); band(c, 290, 600, .7); M.text(c, 'WHY THIS SLED MATTERED', CX, 330, { size: 52, weight: 800, align: 'center', color: '#fff' });
        c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 8; c.beginPath(); c.moveTo(200, 860); c.lineTo(820, 860); c.stroke(); c.strokeStyle = GOLD; c.beginPath(); c.moveTo(200, 860); c.lineTo(200 + 620 * p, 860); c.stroke();
        [[200, '1988', 'CALGARY OLYMPICS', 'Jamaica’s bobsled team'], [820, 'THE MOVIE', 'INSPIRED BY THAT TEAM', '']].forEach(([x, a, b, d], i) => { const on = i === 0 ? M.seg(u, 3.0, 3.3) : M.seg(u, 4.5, 4.8); c.fillStyle = on > .5 ? GOLD : '#0e1726'; c.strokeStyle = GOLD; c.lineWidth = 5; c.beginPath(); c.arc(x, 860, 28, 0, 7); c.fill(); c.stroke();
          M.text(c, a, x, 720, { size: i === 0 ? 96 : 64, weight: 800, align: 'center', alpha: on }); M.text(c, b, x, 920, { size: 34, weight: 800, align: 'center', color: GOLD, alpha: on, maxW: 380 }); if (d) M.text(c, d, x, 1010, { size: 32, weight: 600, align: 'center', color: '#dfe7f2', alpha: on, maxW: 380 }); });
        sled(c, 380, 1150, .9, { alpha: M.seg(u, 4.6, 5.0) });
        src(c, 'Sources: Global News; The Canadian Press'); return; }
      groundLine(c, 1180); building(c, 1180, t);
      c.strokeStyle = '#9fb0c8'; c.lineWidth = 4; c.beginPath(); c.moveTo(380, 660); c.lineTo(400, 760); c.moveTo(650, 660); c.lineTo(630, 760); c.stroke();
      if (u <= 2.9) { sled(c, 330, 840, 1.15); chip(c, 'SHELL FROM THE MOVIE', 1210, { size: 40, alpha: M.seg(u, .4, .7) }); }
      else { const v = u - 6.9, blink = v < .9 ? (Math.floor(v * 10) % 2 ? .2 : 1) * (1 - v / .9) : 0; if (blink > 0) sled(c, 330, 840, 1.15, { alpha: blink }); sled(c, 330, 840, 1.15, { dashed: true });
        stamp(c, 'STOLEN', CX, 1000, M.seg(v, 2.4, 2.8), { size: 70 }); chip(c, 'OCT 21–25, 2020', 1210, { size: 40, alpha: M.seg(v, .6, .9) }); }
      band(c, 290, 600, .7); M.text(c, "OLD RANCHMAN'S BUILDING", CX, 330, { size: 52, weight: 800, align: 'center', color: '#fff' });
      M.kinetic(c, u <= 2.9 ? 'A movie bobsled' : 'Then it was gone', u <= 2.9 ? u : u - 6.9, CX, 420, { t0: -.1, size: 100, maxW: 880, highlight: ['bobsled', 'gone'] });
      src(c, 'Sources: CTV News Calgary; Global News; The Canadian Press');
  } },
  // 7 ONLY PART: the front half slides back into the dashed outline
  { dur: sc[7].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      night(c, t, { seed: 9 }); groundLine(c, 1180);
      sled(c, 330, 900, 1.15, { dashed: true });
      const p = M.seg(t, .5, 1.5, 'outCubic'); c.save(); c.translate(M.lerp(700, 0, p), 0); sled(c, 330, 900, 1.15, { clipFront: true }); c.restore();
      band(c, 290, 600, .7); M.kinetic(c, '2022: part found', t, CX, 330, { t0: -.1, size: 110, maxW: 880, highlight: ['part'] });
      stamp(c, 'ONLY PART', CX, 1130, M.seg(t, 2.05, 2.45), { size: 72, color: GOLD });
      src(c, 'Sources: CTV News Calgary (Aug 10, 2022); Daily Hive (Aug 11, 2022)');
  } },
  // 8 #1 THE NORTH HILL AMBUSH: dive onto North Hill, then the armoured truck, two figures in fatigues, tear gas
  { dur: sc[8].sceneDur, trans: { kind: 'flash', dur: .3 }, draw: (c, t) => {
      if (t < 3.6) { mapScene(c, t, { tgt: P.north, p: M.seg(t, 0, 3.6, 'outCubic'), tgtLabel: 'North Hill' }); chip(c, 'MARCH 19, 1998', 1060, { alpha: M.seg(t, 1.4, 1.7), size: 40 }); chip(c, 'NORTH HILL SHOPPING CENTRE', 1140, { alpha: M.seg(t, 1.6, 1.9), size: 36, bg: '#fff' }); chapter(c, t, 1, 'The North Hill ambush', { out: 3.2 }); return; }
      const u = t - 3.6; night(c, t, { seed: 4 }); groundLine(c, 1180);
      c.fillStyle = '#16233a'; c.fillRect(0, 720, W, 460); c.fillStyle = '#1f3152'; c.fillRect(0, 690, W, 40); for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(255,220,150,.08)'; c.fillRect(40 + i * 170, 800, 110, 160); }
      truck(c, 470, 1180, 1.05);
      const walk = M.seg(u, .4, 2.2, 'outCubic'); figure(c, M.lerp(-80, 170, walk), 1180, 1.05, { seed: 3 }); figure(c, M.lerp(-200, 300, walk), 1180, 1.0, { seed: 8 });
      gas(c, 520, 1060, M.seg(u, 3.4, 5.6, 'outCubic'), 12);
      band(c, 290, 600, .7); M.text(c, 'MARCH 19, 1998 · NORTH HILL', CX, 330, { size: 52, weight: 800, align: 'center', color: '#fff' });
      M.kinetic(c, 'Ambush at the mall', u, CX, 420, { t0: -.1, size: 100, maxW: 880, highlight: ['ambush'] });
      [['MILITARY FATIGUES', 1.0], ['ASSAULT RIFLES', 3.6], ['TEAR GAS', 4.6]].forEach(([s, at], i) => chip(c, s, [700, 700, 776][i], { x: [CX, CX, CX][i] + [-190, 210, 0][i], size: 36, bg: i === 0 ? '#b9c48a' : '#fff', alpha: M.seg(u, at, at + .3) }));
      chip(c, "BRINK'S CASH DELIVERY", 1210, { size: 36, alpha: M.seg(u, 2.2, 2.5) });
      src(c, 'Sources: Global News; Calgary Herald; Mail & Guardian (1998)');
  } },
  // 9 80+ SHOTS: one dot per shot fills a grid, then NO ONE HURT and LEFT EMPTY-HANDED
  { dur: sc[9].sceneDur, trans: { kind: 'zoom', dur: .35 }, draw: (c, t) => {
      night(c, t, { seed: 4 });
      const n = Math.floor(80 * M.seg(t, .15, 1.6, 'outCubic')), step = 84, gx = CX - 4.5 * step, gy = 640;
      for (let i = 0; i < 80; i++) { const r = Math.floor(i / 10), q = i % 10; c.beginPath(); c.arc(gx + q * step, gy + r * step * .82, i < n ? 22 : 16, 0, 7); c.fillStyle = i < n ? GOLD : 'rgba(255,255,255,.12)'; c.fill(); }
      band(c, 290, 600, .72); M.counter(c, 80, M.seg(t, .15, 1.6), CX, 300, { size: 190, suffix: '+', slam: true });
      M.text(c, 'SHOTS FIRED', CX, 500, { size: 60, weight: 800, align: 'center', color: GOLD });
      chip(c, 'NO ONE HURT', 1110, { size: 52, bg: TEAL, alpha: M.seg(t, 1.85, 2.1) });
      chip(c, 'LEFT EMPTY-HANDED', 1200, { size: 52, bg: GOLD, alpha: M.seg(t, 3.0, 3.25) });
      src(c, 'Sources: Global News; The Canadian Press; Mail & Guardian; Calgary Herald');
  } },
  // 10 WHO: two roles, then the bars come down
  { dur: sc[10].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      night(c, t, { seed: 6 }); groundLine(c, 1180);
      figure(c, 300, 1150, 1.25, { seed: 3, col: '#1b2638', hl: t > .9 && t < 2.6 }); figure(c, 720, 1150, 1.25, { seed: 8, col: '#2f3a24', hl: t > 2.4 && t < 3.9 });
      M.text(c, "FORMER BRINK'S EMPLOYEE", 290, 620, { size: 50, weight: 800, align: 'center', maxW: 400, color: GOLD, alpha: M.seg(t, .9, 1.2) });
      M.text(c, 'CANADIAN SOLDIER', 730, 620, { size: 50, weight: 800, align: 'center', maxW: 380, color: GOLD, alpha: M.seg(t, 2.4, 2.7) });
      const bars = M.seg(t, 3.7, 4.1, 'outCubic'); if (bars > 0) { const by = M.lerp(-500, 790, bars); c.fillStyle = '#7d8796'; for (let i = 0; i < 9; i++) { M.rr(c, 90 + i * 100, by, 20, 400, 8); c.fill(); } c.fillRect(70, by - 10, 880, 24); }
      band(c, 290, 600, .7); M.kinetic(c, 'Who was behind it?', t, CX, 330, { t0: -.1, size: 104, maxW: 880, highlight: ['who'] });
      stamp(c, 'BOTH WENT TO PRISON', CX, 1210, M.seg(t, 4.1, 4.5), { size: 56, color: GOLD });
      src(c, 'Sources: Calgary Herald; Mail & Guardian; Global News');
  } },
  // 11 CLOSER: the five icons and the one-word question; no end card (video under 2:00)
  { dur: sc[11].sceneDur, draw: (c, t) => {
      night(c, t, { seed: 11 }); const p = M.seg(t, 0, sc[11].sceneDur, 'linear');
      M.kinetic(c, 'Which one is the wildest?', p * 3, CX, 380, { size: 112, maxW: 880, every: .06, highlight: ['wildest?'] });
      const ic = [['5', x => plaque(c, x, 900, 120, 90)], ['4', x => { c.fillStyle = '#8a6b4f'; c.fillRect(x - 50, 850, 100, 110); c.fillStyle = '#05080f'; c.beginPath(); c.arc(x, 905, 32, 0, 7); c.fill(); }], ['3', x => suv(c, x - 75, 950, .42)], ['2', x => sled(c, x - 75, 930, .42)], ['1', x => truck(c, x - 70, 950, .3)]];
      ic.forEach(([n, f], i) => { const x = 150 + i * 180, a = M.seg(t, .2 + i * .1, .5 + i * .1); c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(255,255,255,.06)'; M.rr(c, x - 82, 800, 164, 200, 18); c.fill(); f(x); M.text(c, '#' + n, x, 1020, { size: 48, weight: 900, align: 'center', color: GOLD }); c.restore(); });
      M.text(c, 'Comment below 👇', CX, 1160, { size: 64, weight: 800, align: 'center', color: GOLD, alpha: M.seg(t, .5, .8) });
      M.text(c, 'calgaryinsight.ca', CX, 1290, { size: 40, weight: 600, align: 'center', alpha: M.seg(t, .6, .9) * .9 });
  } },
], overlay: (c, t, info) => {
  const last = info.index === sc.length - 1;
  if (t > 3 && !last) M.header(c, window.LOGO, W, H);
  if (!last) M.caption(c, captionAt(t), W, H);
  M.followPill(c, M.seg(t, sc[6].sceneStart + 2.5, sc[6].sceneStart + 4.7, 'linear'), W, H);
} });

const s_ = i => sc[i].sceneStart;
window.CUES = [
  { t: 0.00, sfx: 'impact', gain: -3 }, { t: 0.05, sfx: 'glitch', gain: -12 }, { t: 1.55, sfx: 'thud', gain: -6 }, { t: 3.15, sfx: 'whoosh_rev', gain: -8 },
  { t: s_(1) - .2, sfx: 'whoosh', gain: -8 }, ...[0, 1, 2, 3, 4].map(i => ({ t: s_(1) + .2 + i * .22, sfx: 'pop', gain: -11 })),
  { t: s_(2) - .2, sfx: 'whoosh', gain: -8 }, { t: s_(2) + .05, sfx: 'stamp', gain: -9 }, ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ t: s_(2) + 2.4 + .45 + i * .32, sfx: 'tick', gain: -10 })),
  { t: s_(3) - .18, sfx: 'whoosh', gain: -9 }, { t: s_(3) + 1.9 + 1.3, sfx: 'ping', gain: -10 },
  { t: s_(4) - .2, sfx: 'whoosh', gain: -8 }, { t: s_(4) + .05, sfx: 'stamp', gain: -9 }, { t: s_(4) + 2.4 + 1.4, sfx: 'thud', gain: -10 }, { t: s_(4) + 2.4 + 2.6, sfx: 'thud', gain: -10 }, { t: s_(4) + 2.4 + 3.6, sfx: 'thud', gain: -10 },
  { t: s_(5) - .15, sfx: 'whoosh', gain: -8 }, { t: s_(5) + .05, sfx: 'stamp', gain: -9 }, { t: s_(5) + 2.4, sfx: 'ticks', dur: 1.4, gain: -14 }, { t: s_(5) + 2.4 + 2.1, sfx: 'impact', gain: -5 }, { t: s_(5) + 2.4 + 4.9, sfx: 'pop', gain: -9 },
  { t: s_(6) - .2, sfx: 'whoosh', gain: -8 }, { t: s_(6) + .05, sfx: 'stamp', gain: -9 }, { t: s_(6) + 2.4 + 3.0, sfx: 'swell', gain: -12 }, { t: s_(6) + 2.4 + 6.9, sfx: 'glitch', gain: -10 }, { t: s_(6) + 2.4 + 9.3, sfx: 'stamp', gain: -7 },
  { t: s_(7) - .18, sfx: 'whoosh', gain: -9 }, { t: s_(7) + 1.4, sfx: 'thud', gain: -10 }, { t: s_(7) + 2.05, sfx: 'stamp', gain: -7 },
  { t: s_(8) - 1.4, sfx: 'riser', gain: -12 }, { t: s_(8), sfx: 'boom', gain: -6 }, { t: s_(8) + 3.6 + 3.4, sfx: 'whoosh_rev', gain: -11 },
  { t: s_(9) - .18, sfx: 'whoosh', gain: -9 }, { t: s_(9) + .15, sfx: 'ticks', dur: 1.45, gain: -12 }, { t: s_(9) + 1.6, sfx: 'impact', gain: -7 }, { t: s_(9) + 1.85, sfx: 'pop', gain: -9 }, { t: s_(9) + 3.0, sfx: 'pop', gain: -9 },
  { t: s_(10) - .18, sfx: 'whoosh', gain: -9 }, { t: s_(10) + 3.7, sfx: 'thud', gain: -5 }, { t: s_(10) + 4.1, sfx: 'stamp', gain: -7 },
  { t: s_(11) - .2, sfx: 'whoosh', gain: -9 }, { t: s_(11) + .2, sfx: 'pop', gain: -11 },
];

// ---------- designed cover / thumbnail (render.py --param format=thumb --stills 0): key content inside the centre 1080×1350 ----------
if ((window.PARAMS || {}).format === 'thumb') window.BUILD = () => M.film({ W, H, identity: 'storyteller', finish: false, scenes: [{ dur: 1, draw: c => {
  night(c, 1, { seed: 2 }); const g = c.createRadialGradient(540, 1050, 50, 540, 1050, 700); g.addColorStop(0, 'rgba(226,72,61,.28)'); g.addColorStop(1, 'rgba(226,72,61,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  M.text(c, "CALGARY'S", 540, 330, { size: 150, weight: 900, align: 'center', color: '#fff' });
  M.text(c, 'STRANGEST', 540, 480, { size: 150, weight: 900, align: 'center', color: '#fff' });
  M.text(c, 'HEISTS', 540, 630, { size: 190, weight: 900, align: 'center', color: GOLD });
  c.save(); c.fillStyle = 'rgba(255,255,255,.06)'; M.rr(c, 70, 880, 940, 560, 40); c.fill(); c.restore();
  sled(c, 120, 1060, 1.0); plaque(c, 820, 1010, 200, 150, { rot: .12 }); suv(c, 210, 1380, 1.0, { lights: true }); shards(c, 640, 1280, .35, 3);
  M.text(c, '🕵️', 860, 1170, { size: 120, align: 'center', shadow: false });
  c.drawImage(window.LOGO, 70, 1500, 64, 64); M.text(c, 'Calgary Insight', 150, 1532, { size: 40, weight: 600, base: 'middle' });
} }] });
