/* 2026-11-18 PM fun fact: "Calgary's 333 days of sun has a catch". Lead identity Data Explainer (from examples/explainer.js),
 * borrowing a Storyteller map dive and skyline orbit and a Civic definition card + stamp.
 * Every on-screen figure is a claims-table value (packages/2026-11-18-PM-333-days-of-sun.md, claims C1-C6).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30, THUMB = !!(window.PARAMS && window.PARAMS.thumb);

// audited narration with measured Kokoro durations (sp_out/durs.json)
const DURS = (window.PARAMS && window.PARAMS.durs) ? window.PARAMS.durs.split(',').map(Number) : [4.112, 3.179, 4.352, 3.243, 2.747];
const S = M.script([
  { text: "Calgary's famous three hundred thirty-three days of sun? There's a catch.", dur: DURS[0] },
  { text: "Calgary really is the sunniest of Canada's large cities.", dur: DURS[1] },
  { text: 'It averages nearly two thousand four hundred hours of bright sunshine a year.', dur: DURS[2] },
  { text: "But a day counts if there's any measurable sunshine at all.", dur: DURS[3] },
  { text: 'Did you know? Drop your thoughts below.', dur: DURS[4] },
], { lead: .25, gap: .25, tail: 1.0 });
const sc = S.scenes;
const SRC = 'Source: Environment Canada climate normals 1981–2010, via CurrentResults.com';
const SRC0 = 'Visit Calgary · Environment Canada normals 1981–2010 via CurrentResults.com';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const GOLD = M.house.gold, SKY = '#5d9ad6';

// ---- shared props: the same sun and the same cloud in every scene (continuity) ----
function sun(c, x, y, r, t, o = {}) {
  c.save(); c.translate(x, y); c.globalAlpha = o.alpha ?? 1;
  const g = c.createRadialGradient(0, 0, r * .2, 0, 0, r * 2.4); g.addColorStop(0, 'rgba(255,214,110,.55)'); g.addColorStop(1, 'rgba(255,214,110,0)');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, r * 2.4, 0, 7); c.fill();
  c.rotate(t * .5); c.fillStyle = GOLD;
  for (let k = 0; k < 12; k++) { c.save(); c.rotate(k * Math.PI / 6); c.beginPath(); c.moveTo(-r * .16, r * 1.18); c.lineTo(0, r * 1.62); c.lineTo(r * .16, r * 1.18); c.closePath(); c.fill(); c.restore(); }
  c.beginPath(); c.arc(0, 0, r, 0, 7); c.fillStyle = '#ffc93c'; c.fill(); c.lineWidth = r * .08; c.strokeStyle = '#ffe08a'; c.stroke();
  c.restore();
}
function cloud(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = o.alpha ?? 1;
  c.fillStyle = o.dark ? '#7d8896' : '#c3cbd4'; c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 4;
  c.beginPath(); c.arc(-60, 10, 48, 0, 7); c.arc(0, -20, 66, 0, 7); c.arc(66, 6, 52, 0, 7); c.rect(-108, 10, 226, 48); c.fill();
  c.fillStyle = o.dark ? '#6a7482' : '#aeb7c1'; c.fillRect(-108, 40, 226, 18);
  c.restore();
}
function stamp(c, txt, x, y, k, o = {}) {
  if (k <= 0) return; const s = M.lerp(1.8, 1, Math.min(1, k)); c.save(); c.translate(x, y); c.rotate(o.rot ?? -.05); c.scale(s, s); c.globalAlpha = Math.min(1, k * 1.5);
  c.font = M.font(o.size || 104, 800); const w = c.measureText(txt).width + 70, h = (o.size || 104) * 1.45;
  M.rr(c, -w / 2, -h / 2, w, h, 20); c.fillStyle = o.bg || 'rgba(7,13,24,.82)'; c.fill(); c.lineWidth = 9; c.strokeStyle = o.color || GOLD; c.stroke();
  M.text(c, txt, 0, -(o.size || 104) * .56, { size: o.size || 104, weight: 800, align: 'center', color: o.color || GOLD, shadow: false });
  c.restore();
}
function dark(c, y0, y1, a = .62) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.2, `rgba(7,13,24,${a})`); g.addColorStop(.8, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); }

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // S0 HOOK: frame 0 already diving over real Calgary toward downtown; the sun punches in at 0.0, rays turning; the cloud slides over it ("the catch")
  { dur: sc[0].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      const tw = M.geo.lm('Calgary Tower') || [0, 0, 0];
      const w = M.world({ sky: 'day', fog: { near: 9000, far: 52000, max: .45 } }); M.geo.addBase(w, { buildings: true, roads: true });
      const cam = M.camera(M.moves.dive(tw, M.seg(t, 0, sc[0].sceneDur, 'outCubic'), { h0: 24000, h1: 2600, back0: 1, back1: 4200, ahead: 300 }), W, H); w.render(c, cam);
      const k = M.ease.outBack(M.seg(t, 0, .4, 'linear')); sun(c, 800, 330, 120 * M.lerp(.55, 1, k), t);
      const cx = M.lerp(-260, 770, M.seg(t, 2.1, 2.9, 'outCubic')); if (t > 2.0) cloud(c, cx, 350, 1.55, { dark: false });
      if (THUMB) return;
      dark(c, 430, 1060, .5);
      M.kinetic(c, '333 days of sun?', t, CX - 40, 470, { t0: -.12, size: 140, maxW: 860, highlight: ['333'] });
      stamp(c, "THERE'S A CATCH", CX, 900, M.seg(t, 2.45, 2.85, 'outBack'), { size: 100 });
      M.text(c, 'N ↑', 60, 1380, { size: 32, weight: 700, color: '#fff' });
      M.source(c, SRC0, 60, 1450, { size: 20 }); M.source(c, MAPC, 60, 1480, { size: 20 });
  } },
  // S1 SUNNIEST: the source's own top five large cities by bright-sunshine hours, bars from zero (claims C2, C5)
  { dur: sc[1].sceneDur, trans: { kind: 'zoom', dur: .4 }, draw: (c, t) => {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0e2b52'); g.addColorStop(1, '#081428'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      sun(c, 900, 230, 70, t, { alpha: .9 });
      M.kinetic(c, 'Sunniest large city', t, CX - 20, 290, { t0: -.05, size: 110, maxW: 820, highlight: ['sunniest'] });
      M.bars(c, { horizontal: true, x: 90, y: 720, w: 640, h: 560, values: [2396, 2353, 2345, 2318, 2268], max: 2600, labels: ['Calgary', 'Winnipeg', 'Edmonton', 'Regina', 'Saskatoon'],
        highlight: 0, accent: GOLD, p: 1.1 * M.seg(t, .15, 2.0, 'linear'), labelSize: 44, valueSize: 52, gap: .5, fmt: { decimals: 0 } });
      M.text(c, 'hours of bright sunshine a year', 90, 590, { size: 40, weight: 600, color: '#cfe0f5' });
      const k = M.seg(t, .9, 1.3, 'outBack'); if (k > 0) M.chip(c, '1981–2010 AVERAGES', 90, 500, { size: 48, alpha: Math.min(1, k) });
      M.source(c, SRC, 60, 1460, { size: 22 });
  } },
  // S2 HOURS: real downtown in 3D, slow orbit; the sun arcs across the sky; counter rolls to exactly 2,396 (claim C3)
  { dur: sc[2].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      const tw = M.geo.lm('Calgary Tower') || [0, 0, 0], u = M.seg(t, 0, sc[2].sceneDur, 'linear');
      const w = M.world({ sky: 'day', fog: { near: 2500, far: 14000 } }); M.geo.addBase(w, { buildings: true, roads: true });
      const cam = M.camera(M.moves.orbit(tw, 1700, 520, 200, 28, u), W, H); w.render(c, cam);
      const a = M.lerp(Math.PI * .95, Math.PI * .05, u); sun(c, CX + Math.cos(a) * 380, 900 - Math.sin(a) * 520, 62, t);
      dark(c, 330, 860, .62);
      M.counter(c, 2396, M.seg(t, .2, 1.5), CX, 380, { size: 210, slam: true, decimals: 0 });
      M.text(c, 'HOURS OF BRIGHT SUN A YEAR', CX, 640, { size: 56, weight: 800, align: 'center', color: GOLD, alpha: M.seg(t, .3, .7) });
      const k = M.seg(t, 1.5, 1.9, 'outBack'); if (k > 0) M.chip(c, '1981–2010 AVERAGE', CX, 740, { align: 'center', size: 48, alpha: Math.min(1, k) });
      M.source(c, SRC, 60, 1460, { size: 22 }); M.source(c, MAPC, 60, 1490, { size: 18 });
  } },
  // S3 THE CATCH: a year grid fills with suns to 333, then a zoom into one cloudy square that still counts (claims C1, C4)
  { dur: sc[3].sceneDur, trans: { kind: 'dissolve', dur: .45 }, draw: (c, t) => {
      c.fillStyle = '#0b1f3a'; c.fillRect(0, 0, W, H);
      const cols = 15, rows = 25, cell = 46, gx = CX - cols * cell / 2, gy = 470;
      const fillP = M.seg(t, .05, 1.6, 'inOutSine'), n = Math.round(333 * fillP);
      const zoom = M.seg(t, 1.9, 2.6, 'inOutCubic'), pick = 7 * cols + 7, px = gx + (pick % cols) * cell + cell / 2, py = gy + Math.floor(pick / cols) * cell + cell / 2;
      c.save(); const zs = M.lerp(1, 7.5, zoom); c.translate(M.lerp(0, CX - px * zs, zoom), M.lerp(0, 760 - py * zs, zoom)); c.scale(zs, zs);
      for (let i = 0; i < 365; i++) {
        const x = gx + (i % cols) * cell, y = gy + Math.floor(i / cols) * cell;
        M.rr(c, x + 3, y + 3, cell - 6, cell - 6, 6); c.fillStyle = i < n ? '#1c3d66' : '#2a3442'; c.fill();
        if (i === pick && i < n) { c.save(); c.beginPath(); c.rect(x + 3, y + 3, cell - 6, cell - 6); c.clip(); sun(c, x + cell * .66, y + cell * .36, 6, t); cloud(c, x + cell * .42, y + cell * .55, .14, { dark: true }); c.restore(); }
        else if (i < n) { c.beginPath(); c.arc(x + cell / 2, y + cell / 2, 10, 0, 7); c.fillStyle = GOLD; c.fill(); }
      }
      c.restore();
      c.fillStyle = `rgba(11,31,58,${.92 * zoom})`; c.fillRect(0, 150, W, 230);
      M.counter(c, 333, M.seg(t, .05, 1.6, 'inOutSine'), CX, 250, { size: 130, decimals: 0, suffix: ' DAYS', ease: 'linear' });
      const k = M.seg(t, 2.3, 2.7, 'outCubic'); if (k > 0) { c.save(); c.globalAlpha = k; M.rr(c, 100, 1125, 880, 110, 20); c.fillStyle = '#f7f4ec'; c.fill();
        M.text(c, 'ANY MEASURABLE SUN = 1 DAY', CX, 1149, { size: 58, weight: 800, align: 'center', color: '#132033', shadow: false, maxW: 820 }); c.restore(); }
      stamp(c, 'STILL COUNTS ✓', CX, 1010, M.seg(t, 2.75, 3.1, 'outBack'), { size: 80, color: '#2bd3bd', rot: -.06 });
      M.source(c, SRC, 60, 1460, { size: 22 });
  } },
  // S4 QUESTION: the sun half behind the cloud; closing question; no end card (under 2:00)
  { dur: sc[4].sceneDur, draw: (c, t) => {
      c.fillStyle = '#081428'; c.fillRect(0, 0, W, H);
      sun(c, CX + 70, 1520, 110, t, { alpha: .95 }); cloud(c, CX - 40, 1580, 1.6, { dark: false });
      M.closer(c, 'Did you know?', M.seg(t, 0, sc[4].sceneDur, 'linear'), W, H, { highlight: ['know?'] });
  } },
], overlay: (c, t, info) => {
  if (THUMB) return;
  if (t > 3 && info.index < 4) M.header(c, window.LOGO, W, H);
  if (info.index < 4) M.caption(c, S.captionAt(t), W, H);
} });

window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.02, sfx: 'impact', gain: -5 }, { t: 0.3, sfx: 'pop', gain: -12 },
  { t: 2.15, sfx: 'whoosh', gain: -12 }, { t: 2.5, sfx: 'stamp', gain: -7 },
  { t: sc[1].sceneStart - .18, sfx: 'whoosh', gain: -10 },
  { t: sc[1].sceneStart + .55, sfx: 'pop', gain: -13 }, { t: sc[1].sceneStart + .8, sfx: 'pop', gain: -14 }, { t: sc[1].sceneStart + 1.05, sfx: 'pop', gain: -14 },
  { t: sc[2].sceneStart - .15, sfx: 'whoosh', gain: -10 }, { t: sc[2].sceneStart + .2, sfx: 'ticks', dur: 1.25, gain: -12 }, { t: sc[2].sceneStart + 1.5, sfx: 'impact', gain: -6 },
  { t: sc[3].sceneStart + .05, sfx: 'ticks', dur: 1.55, gain: -13 }, { t: sc[3].sceneStart + 1.9, sfx: 'whoosh', gain: -12 }, { t: sc[3].sceneStart + 2.8, sfx: 'stamp', gain: -7 },
  { t: sc[4].sceneStart - .15, sfx: 'whoosh', gain: -12 },
];
