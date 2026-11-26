/* 2026-11-26 PM fun fact: "This Calgary forest belongs in the mountains." (Edworthy Park's Douglas-firs)
 * Lead identity Data Explainer (kinetic hook, stamps, chips, counter slam), borrowing a Storyteller map dive over
 * real Calgary onto the Edworthy Park landmark (S0), a schematic range strip (S1), a flat map from the geo pack (S2)
 * and Civic-style cutaways (S3 trunk slice, S4 slope cross-section). Every on-screen fact maps to the audited
 * claims table (packages/2026-11-26-PM-edworthy-firs.md, C1-C7; audits/2026-11-26-PM.md).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30, THUMB = !!(window.PARAMS && window.PARAMS.thumb);
const DURS = (window.PARAMS && window.PARAMS.durs) ? window.PARAMS.durs.split(',').map(Number) : [2.5, 3.6, 4.0, 2.4, 4.8, 3.6];
const S = M.script([
  { text: 'This Calgary forest belongs in the mountains.', dur: DURS[0] },
  { text: 'Douglas firs usually grow in the Rocky Mountains and on the coast.', dur: DURS[1] },
  { text: 'These ones, in Edworthy Park, are among the most easterly in Canada.', dur: DURS[2] },
  { text: 'Some are about five hundred years old.', dur: DURS[3] },
  { text: 'The slope keeps creeping, so the trees lean. Their nickname? The drunken forest.', dur: DURS[4] },
  { text: 'Did you know? Yes or no. Drop your thoughts below.', dur: DURS[5] },
], { lead: .25, gap: .2, tail: .25 });
const sc = S.scenes, SPLIT = 1.6;
const NICK = sc[4].start + sc[4].speech * .62;            // "Their nickname?" lands about here in line 4
const SRC = 'Source: City of Calgary (Douglas-fir Trail, Edworthy Park pages)';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const GOLD = M.house.gold, FIR = '#2f7d4f', FIR2 = '#3f9a63', WATER = '#2f6fb5';
const EDW = M.geo.lm('Edworthy Park');                     // C6/C7 geo pack landmark (51.0592, -114.1596)

function navyBg(c, top = '#0e2b52', bot = '#081428') { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function dark(c, y0, y1, a = .62) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.2, `rgba(7,13,24,${a})`); g.addColorStop(.8, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); }
function stamp(c, txt, x, y, k, o = {}) {
  if (k <= 0) return; const sz = o.size || 96, s = M.lerp(1.8, 1, Math.min(1, k)); c.save(); c.translate(x, y); c.rotate(o.rot ?? -.05); c.scale(s, s); c.globalAlpha = Math.min(1, k * 1.5);
  c.font = M.font(sz, 800); const w = c.measureText(txt).width + 70, h = sz * 1.45;
  M.rr(c, -w / 2, -h / 2, w, h, 20); c.fillStyle = o.bg || 'rgba(7,13,24,.88)'; c.fill(); c.lineWidth = 9; c.strokeStyle = o.color || GOLD; c.stroke();
  M.text(c, txt, 0, -sz * .56, { size: sz, weight: 800, align: 'center', color: o.color || GOLD, shadow: false });
  c.restore();
}
// stylised Douglas-fir: trunk plus tiered crown; (x, y) = base, h = height, tilt in radians, k = grow 0..1
function fir(c, x, y, h, tilt = 0, k = 1, col = FIR) {
  if (k <= 0) return; c.save(); c.translate(x, y); c.rotate(tilt); const s = Math.min(1, k); c.scale(s, s);
  c.fillStyle = '#5a3b22'; c.fillRect(-h * .035, -h * .18, h * .07, h * .18);
  for (let i = 0; i < 4; i++) { const yb = -h * (.12 + i * .2), wd = h * (.34 - i * .07), ht = h * .34;
    c.fillStyle = i % 2 ? col : FIR2; c.beginPath(); c.moveTo(-wd, yb); c.lineTo(0, yb - ht); c.lineTo(wd, yb); c.closePath(); c.fill(); }
  c.restore();
}
function mountains(c, x0, x1, base, hgt, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x0, base); const n = 6;
  for (let i = 0; i <= n; i++) { const x = M.lerp(x0, x1, i / n); c.lineTo(x, base - (i % 2 ? hgt * (.7 + .3 * Math.sin(i * 1.7) ** 2) : hgt * .25)); } c.lineTo(x1, base); c.closePath(); c.fill(); }
const R = M.rng(7); const TILTS = Array.from({ length: 12 }, () => (R() - .5) * .9);

// S2 flat map: geo pack, metres east/north of downtown, centred between Edworthy and downtown
const MC = [-4200, 1700], MS = .135, MY = 920;
const mx = p => CX + (p[0] - MC[0]) * MS, my = p => MY - (p[1] - MC[1]) * MS;
function geoLines(c, lines, color, wdt, k = 1) { c.save(); c.strokeStyle = color; c.lineWidth = wdt; c.lineCap = 'round'; c.lineJoin = 'round';
  lines.forEach(l => { const n = Math.max(1, Math.floor(l.length * k)); c.beginPath(); for (let i = 0; i < n; i++) i ? c.lineTo(mx(l[i]), my(l[i])) : c.moveTo(mx(l[i]), my(l[i])); c.stroke(); }); c.restore(); }
function geoPoly(c, polys, fill, a = 1) { c.save(); c.globalAlpha = a; c.fillStyle = fill; polys.forEach(poly => poly.forEach(r => { c.beginPath(); r.forEach((p, i) => i ? c.lineTo(mx(p), my(p)) : c.moveTo(mx(p), my(p))); c.closePath(); c.fill(); })); c.restore(); }

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // S0 HOOK (0-1.6 s): frame 0 already diving over real Calgary onto Edworthy Park; hook punches from frame 0 (C1, C6, C7)
  { dur: SPLIT, trans: { kind: 'zoom', dur: .3 }, draw: (c, t) => {
      const w = M.world({ sky: 'day', fog: { near: 9000, far: 52000, max: .4 } }); M.geo.addBase(w, { buildings: true, roads: true });
      M.pin(w, EDW, 'EDWORTHY PARK', { p: THUMB ? 1 : M.seg(t, .2, .7, 'linear'), size: 50, scale: 1.3 }); M.ping(w, EDW, t, { r: 150 });
      const cam = M.camera(M.moves.dive(EDW, THUMB ? .75 : M.seg(t, 0, SPLIT + .9, 'outCubic'), { h0: 13000, h1: 2400, back0: 1, back1: 3200, ahead: 200 }), W, H); w.render(c, cam);
      M.source(c, MAPC, 60, 1460, { size: 20 }); M.text(c, 'N ↑', 60, 1400, { size: 32, weight: 700, color: '#fff' });
      if (THUMB) return;
      dark(c, 150, 760, .66);
      M.kinetic(c, 'This forest belongs in the mountains', t, CX, 250, { t0: -.45, size: 124, maxW: 900, highlight: ['mountains'], every: .09 });
  } },
  // S0b the picture of the twist: firs rise on a steep slope with the mountains behind (C1, C2)
  { dur: sc[0].sceneDur - SPLIT, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      navyBg(c, '#16406e', '#0a1a30');
      mountains(c, -40, W + 40, 1060, 420, '#2b4a6e'); c.fillStyle = 'rgba(255,255,255,.85)';
      c.fillStyle = '#16304c'; c.beginPath(); c.moveTo(0, 1060); c.lineTo(0, 860); c.lineTo(W, 1260); c.lineTo(W, 1500); c.lineTo(0, 1500); c.closePath(); c.fill();
      for (let i = 0; i < 7; i++) { const x = 80 + i * 140, y = 860 + (x / W) * 400 + 8; fir(c, x, y, 230 + (i % 3) * 40, 0, M.seg(t, .05 + i * .07, .4 + i * .07, 'outBack')); }
      dark(c, 150, 760, .5);
      M.kinetic(c, 'This forest belongs in the mountains', t + 5, CX, 250, { size: 124, maxW: 900, highlight: ['mountains'] });
      M.source(c, SRC, 60, 1440, { size: 20 });
  } },
  // S1 usual range: schematic coast -> Rocky Mountains -> Calgary strip, firs pop on coast and mountains (C2)
  { dur: sc[1].sceneDur, trans: { kind: 'whip', dur: .3 }, draw: (c, t) => {
      navyBg(c, '#0a1d38', '#06101f');
      const k0 = M.seg(t, .05, .4, 'outBack'); if (k0 > 0) M.chip(c, 'USUAL RANGE', CX, 330, { align: 'center', size: 64, alpha: Math.min(1, k0) });
      const base = 1060;
      c.fillStyle = WATER; c.fillRect(40, base - 40, 280, 80);
      c.strokeStyle = '#8fc3ff'; c.lineWidth = 6; for (let r = 0; r < 2; r++) { c.beginPath(); for (let x = 50; x <= 310; x += 10) { const y = base - 20 + r * 30 + Math.sin(x / 22 + t * 4) * 8; x === 50 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); }
      mountains(c, 330, 720, base, 330, '#3a5f8a');
      c.fillStyle = '#c9a86a'; c.fillRect(720, base - 14, 300, 28);
      [[110, 0], [190, .1], [270, .2]].forEach(([x, d], i) => fir(c, x, base - 46, 150, 0, M.seg(t, .25 + d, .6 + d, 'outBack')));
      [[400, 0], [480, .08], [560, .16], [640, .24], [700, .32]].forEach(([x, d]) => fir(c, x, base - 120 + Math.abs(x - 560) * .5, 150, 0, M.seg(t, .7 + d, 1.05 + d, 'outBack')));
      const g = M.seg(t, 1.5, 1.8, 'outBack'); if (g > 0) { c.save(); c.globalAlpha = Math.min(1, g); c.fillStyle = GOLD; c.beginPath(); c.arc(830, base - 14, 22 * Math.min(1.2, g), 0, 7); c.fill(); c.restore();
        M.text(c, 'CALGARY', 880, base - 100, { size: 48, weight: 800, align: 'center', color: GOLD, alpha: Math.min(1, g) }); }
      M.text(c, 'COAST', 180, base + 70, { size: 48, weight: 800, align: 'center', color: '#fff', alpha: M.seg(t, .25, .5) });
      M.text(c, 'ROCKY MOUNTAINS', 525, base + 70, { size: 48, weight: 800, align: 'center', color: '#fff', alpha: M.seg(t, .7, .95) });
      M.text(c, 'schematic', 60, 560, { size: 26, weight: 600, color: '#9fb0c8' });
      M.source(c, SRC, 60, 1440, { size: 20 });
  } },
  // S2 most easterly: geo pack map, Bow River draws in, Edworthy polygon fills with firs, arrow sweeps east (C3, C6, C7)
  { dur: sc[2].sceneDur, trans: { kind: 'zoom', dur: .3 }, draw: (c, t) => {
      navyBg(c, '#0a1d38', '#06101f');
      const G = M.geo.get(); c.fillStyle = '#13263f'; c.fillRect(0, 560, W, 720); c.save(); c.beginPath(); c.rect(0, 560, W, 720); c.clip();
      (G.parks || []).forEach(pk => geoPoly(c, pk.polys, '#1d3a2c', .9));
      const bow = (G.rivers || []).find(r => r.name === 'Bow River'); if (bow) geoLines(c, bow.lines, WATER, 16, M.seg(t, 0, 1.0, 'inOutCubic'));
      const ed = (G.parks || []).find(p => p.name === 'Edworthy Park'); const f = M.seg(t, .5, 1.0, 'linear');
      if (ed) { geoPoly(c, ed.polys, FIR2, .3 + .7 * f); c.save(); c.strokeStyle = GOLD; c.lineWidth = 4; c.globalAlpha = f; ed.polys.forEach(poly => poly.forEach(r => { c.beginPath(); r.forEach((p, i) => i ? c.lineTo(mx(p), my(p)) : c.moveTo(mx(p), my(p))); c.closePath(); c.stroke(); })); c.restore(); }
      const ex = mx(EDW), ey = my(EDW);
      [[-30, 40], [10, 10], [30, 60], [-10, 90], [-40, -20]].forEach(([dx, dy], i) => fir(c, ex + dx * .9, ey + dy * .9, 70, 0, M.seg(t, .8 + i * .07, 1.1 + i * .07, 'outBack')));
      const a = M.seg(t, 1.4, 2.4, 'inOutCubic'); if (a > 0) { const x1 = M.lerp(ex + 60, ex + 520, a); c.save(); c.strokeStyle = GOLD; c.fillStyle = GOLD; c.lineWidth = 14; c.lineCap = 'round';
        c.beginPath(); c.moveTo(ex + 60, ey - 90); c.lineTo(x1, ey - 90); c.stroke(); c.beginPath(); c.moveTo(x1 + 34, ey - 90); c.lineTo(x1 - 6, ey - 116); c.lineTo(x1 - 6, ey - 64); c.closePath(); c.fill();
        c.restore(); }
      M.text(c, 'EDWORTHY PARK', ex, ey + 120, { size: 48, weight: 800, align: 'center', color: '#fff', alpha: M.seg(t, .6, .9) });
      M.text(c, 'BOW RIVER', mx([-2600, 2900]), my([-2600, 2900]) - 70, { size: 40, weight: 800, align: 'center', color: '#9cc8ff', alpha: M.seg(t, .6, .9) });
      c.restore();
      dark(c, 180, 560, .5);
      M.kinetic(c, 'Among the most easterly in Canada', t, CX, 230, { t0: .15, size: 110, maxW: 900, highlight: ['easterly'], every: .08 });
      M.text(c, 'N ↑', 960, 600, { size: 32, weight: 700, color: '#fff' });
      M.source(c, MAPC, 60, 1290, { size: 20 }); M.source(c, SRC, 60, 1440, { size: 20 });
  } },
  // S3 how old: trunk slice, rings draw outward while the counter rolls to "about 500 years" (C4)
  { dur: sc[3].sceneDur, trans: { kind: 'push', dur: .3 }, draw: (c, t) => {
      navyBg(c, '#13284a', '#0a1428');
      const k0 = M.seg(t, 0, .3, 'outBack'); if (k0 > 0) M.chip(c, 'AGE', CX, 330, { align: 'center', size: 56, alpha: Math.min(1, k0) });
      const cx = CX, cy = 1080, Rr = 270, p = M.seg(t, .1, 1.5, 'outCubic');
      c.fillStyle = '#5a3b22'; c.beginPath(); c.arc(cx, cy, Rr + 22, 0, 7); c.fill();
      c.fillStyle = '#e3c18f'; c.beginPath(); c.arc(cx, cy, Rr, 0, 7); c.fill();
      const n = Math.floor(40 * p); c.strokeStyle = '#a97a45'; for (let i = 1; i <= n; i++) { c.lineWidth = i % 5 ? 2.5 : 4.5; c.beginPath(); c.ellipse(cx + Math.sin(i) * 3, cy + Math.cos(i * .7) * 3, Rr * i / 41, Rr * i / 41 * .97, 0, 0, 7); c.stroke(); }
      M.text(c, 'ABOUT', CX, 470, { size: 60, weight: 800, align: 'center', color: '#dfe7f2', alpha: M.seg(t, .05, .3) });
      M.counter(c, 500, M.seg(t, .1, 1.3, 'linear'), CX, 540, { suffix: ' YEARS', size: 140, slam: true });
      M.source(c, SRC, 60, 1440, { size: 20 });
  } },
  // S4 the drunken forest: slope cross-section, soil creeps downhill, firs tilt; stamp on the nickname (C5)
  { dur: sc[4].sceneDur, trans: { kind: 'whip', dur: .3 }, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      const k0 = M.seg(t, 0, .3, 'outBack'); if (k0 > 0) M.chip(c, 'CREEPING SLOPE', CX, 330, { align: 'center', size: 56, alpha: Math.min(1, k0) });
      const cr = M.seg(t, .3, 2.6, 'inOutCubic');
      c.fillStyle = WATER; c.fillRect(780, 1300, 300, 60);
      c.fillStyle = '#3b2c22'; c.beginPath(); c.moveTo(0, 700); c.lineTo(160, 700); c.lineTo(860, 1300); c.lineTo(W, 1300); c.lineTo(W, 1420); c.lineTo(0, 1420); c.closePath(); c.fill();
      const dx = 40 * cr, dy = dx * (600 / 700);
      c.save(); c.translate(dx, dy); c.fillStyle = '#6b4f37'; c.beginPath(); c.moveTo(160, 700); c.lineTo(860, 1300); c.lineTo(820, 1300); c.lineTo(140, 735); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 6; for (let i = 0; i < 3; i++) { const u = .2 + i * .25, x = M.lerp(160, 860, u), y = M.lerp(700, 1300, u);
        c.beginPath(); c.moveTo(x - 40, y - 60); c.lineTo(x + 20, y - 8); c.stroke(); c.beginPath(); c.moveTo(x + 20, y - 8); c.lineTo(x - 8, y - 4); c.moveTo(x + 20, y - 8); c.lineTo(x + 14, y - 36); c.stroke(); }
      for (let i = 0; i < 6; i++) { const u = .08 + i * .15, x = M.lerp(160, 860, u), y = M.lerp(700, 1300, u) + 2; fir(c, x, y, 190, TILTS[i] * cr, 1); }
      c.restore();
      stamp(c, 'THE DRUNKEN FOREST', CX, 560, M.seg(t, NICK - sc[4].sceneStart, NICK - sc[4].sceneStart + .3, 'outBack'), { size: 76 });
      M.source(c, SRC, 60, 1440, { size: 20 });
  } },
  // S5 QUESTION: no end card (under 2:00)
  { dur: sc[5].sceneDur, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      for (let i = 0; i < 6; i++) fir(c, 110 + i * 170, 1560, 150, 0, 1, '#1d3a2c');
      M.closer(c, 'Did you know? Yes or no', M.seg(t, 0, sc[5].sceneDur, 'linear'), W, H, { highlight: ['yes', 'no'] });
  } },
], overlay: (c, t, info) => {
  if (THUMB) return;
  if (t > 3 && info.index < 6) M.header(c, window.LOGO, W, H);
  if (info.index < 6) M.caption(c, S.captionAt(t), W, H);
} });

const S1 = sc[1].sceneStart, S2 = sc[2].sceneStart, S3 = sc[3].sceneStart, S4 = sc[4].sceneStart, S5 = sc[5].sceneStart;
window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.02, sfx: 'impact', gain: -5 }, { t: .45, sfx: 'pop', gain: -11 },
  { t: SPLIT - .15, sfx: 'whoosh', gain: -11 }, { t: SPLIT + .15, sfx: 'pop', gain: -12 }, { t: SPLIT + .45, sfx: 'pop', gain: -12 },
  { t: S1 - .1, sfx: 'whoosh', gain: -10 }, { t: S1 + .1, sfx: 'pop', gain: -11 }, { t: S1 + .3, sfx: 'pop', gain: -12 }, { t: S1 + .75, sfx: 'pop', gain: -12 }, { t: S1 + 1.55, sfx: 'pop', gain: -9 },
  { t: S2 - .1, sfx: 'whoosh', gain: -10 }, { t: S2 + .05, sfx: 'ticks', dur: .9, gain: -14 }, { t: S2 + .85, sfx: 'pop', gain: -11 }, { t: S2 + 1.4, sfx: 'whoosh', gain: -13 },
  { t: S3 - .1, sfx: 'whoosh', gain: -10 }, { t: S3 + .1, sfx: 'ticks', dur: 1.1, gain: -13 }, { t: S3 + 1.25, sfx: 'impact', gain: -7 },
  { t: S4 - .1, sfx: 'whoosh', gain: -10 }, { t: S4 + .1, sfx: 'pop', gain: -11 }, { t: NICK, sfx: 'stamp', gain: -7 },
  { t: S5 - .15, sfx: 'whoosh', gain: -12 },
];
