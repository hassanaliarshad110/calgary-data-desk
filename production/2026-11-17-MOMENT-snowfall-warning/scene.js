/* Calgary Insight same-day moment, Nov 17, 2026: "Fourteen degrees on Sunday. A snowfall warning today."
 * Lead identity: Data Explainer. Borrowed: Storyteller drone over the real downtown (hook), Civic evidence chip (warning).
 * Every figure maps to the claims table in packages/2026-11-17-MOMENT-snowfall-warning.md (C1-C7).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DURS = (window.PARAMS && window.PARAMS.durs) ? JSON.parse(window.PARAMS.durs) : [3.372, 8.299, 6.615, 7.383, 3.969, 2.832];
const LINES = [
  'Fourteen degrees on Sunday. A snowfall warning today.',
  'Environment Canada has put Calgary under a snowfall warning: fifteen to twenty centimetres expected, with Calgary at the lower end.',
  "Sunday's high at the airport was fourteen point two. And through Monday, the airport had measured no snow at all this month.",
  'We checked every November since nineteen twenty-six. Fifteen centimetres or more over two days happened in twenty-one of them.',
  'About one November in five. The last time was twenty twenty-four.',
  'Winter tires on yet? Yes or no?',
];
const S = M.script(LINES.map((text, i) => ({ text, dur: DURS[i] })), { lead: .3, gap: .35, tail: 1.6 });
const sc = S.scenes;
const SRC_HIST = 'Environment and Climate Change Canada · Calgary airport daily snowfall, Novembers 1926–2025 (stations 2205 / 50430)';
const SRC_NOW = 'ECCC daily data, Calgary Intl A (station 50430), Nov 2026 (provisional)';
const SRC_WARN = 'Environment and Climate Change Canada snowfall warning, City of Calgary, Nov 17, 2026 (updated 10:46 a.m. Alberta time)';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const WARM = '#ff7a3d', ICE = '#9fd3ff', YEL = '#f5d33b';
// C4: Novembers 1926-2025 with >= 15 cm over two consecutive days (ECCC daily Total Snow)
const HITS = [1926, 1927, 1929, 1930, 1937, 1938, 1945, 1947, 1959, 1965, 1966, 1976, 1980, 1992, 1994, 2001, 2013, 2014, 2018, 2019, 2024];
// C1/C3: Nov 1-16, 2026 daily highs (Nov 7 missing) and snow (all 0.0 cm)
const HIGHS = [8.1, 12.1, 14.5, 9.3, 12.4, 14.4, null, 14.2, 10.4, 13.6, 13.3, 13.9, 12.1, 13.9, 14.2, 10.2];

function band(c, y0, y1, a = .62) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); }
function sunny(c, a = 1) { const g = c.createRadialGradient(W * .82, 260, 10, W * .82, 260, 520); g.addColorStop(0, `rgba(255,214,120,${.55 * a})`); g.addColorStop(1, 'rgba(255,214,120,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 900); }
function drone(c, t, sky, u) {
  const w = M.world({ sky, fog: { near: 4000, far: 22000, max: sky === 'day' ? .45 : .6 } }); M.geo.addBase(w, { buildings: true });
  const tw = M.geo.lm('Calgary Tower');
  const cam = M.camera({ pos: [tw[0] - 2600 + 1400 * u, tw[1] - 3200 + 1500 * u, M.lerp(1600, 700, u)], look: [tw[0], tw[1], 120], fov: 55 }, W, H); w.render(c, cam);
}
function dots(c, t, o = {}) { // one dot per November, 1926-2025, 10 x 10
  const step = 54, gx = CX - 4.5 * step, gy = o.gy || 590;
  for (let i = 0; i < 100; i++) { const yr = 1926 + i, r = Math.floor(i / 10), col = i % 10, x = gx + col * step, y = gy + r * step;
    const seen = o.scan == null ? true : i < o.scan, hit = HITS.includes(yr);
    let rad = 16, fill = 'rgba(255,255,255,.12)';
    if (seen) { rad = 20; fill = 'rgba(79,111,153,.75)'; if (hit && o.lit) { rad = 23; fill = ICE; } }
    if (yr === 2024 && o.last) { const k = M.seg(t, o.last, o.last + .4, 'outBack'); rad = 23 + 12 * Math.min(1, k); fill = '#fff';
      c.save(); c.shadowColor = ICE; c.shadowBlur = 30 * Math.min(1, k); c.beginPath(); c.arc(x, y, rad, 0, 7); c.fillStyle = fill; c.fill(); c.restore();
      if (k > .4) M.chip(c, 'LAST: 2024', x - 90, y - 108, { align: 'center', size: 34, bg: '#ffffff', color: '#06101f' });
      continue; }
    c.beginPath(); c.arc(x, y, rad, 0, 7); c.fillStyle = fill; c.fill(); }
}

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // 0 HOOK: frame 0 drone over sunlit downtown, "14.2°" slams in; at 1.5 s whip to the same view under snow, "SNOWFALL WARNING TODAY"
  { dur: sc[0].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      const u = M.seg(t, 0, sc[0].sceneDur, 'outCubic'), snowNow = t >= 1.5;
      drone(c, t, snowNow ? 'winter' : 'day', u);
      if (!snowNow) { sunny(c); band(c, 300, 900, .5);
        { const k = M.seg(t, 0, .3, 'outBack'), sc0 = M.lerp(1.5, 1, Math.min(1, k)); c.save(); c.translate(CX, 500); c.scale(sc0, sc0); M.text(c, '14.2°', 0, -120, { size: 250, weight: 900, align: 'center', color: WARM }); c.restore(); }   // C1 (never rolls: no false value on screen)
        M.chip(c, 'SUNDAY · CALGARY AIRPORT', CX, 690, { align: 'center', size: 48, bg: '#ffffff', color: '#06101f' });
      } else { c.fillStyle = 'rgba(30,45,70,.25)'; c.fillRect(0, 0, W, H); M.weather(c, 'snow', t, W, H, { count: 650, wind: 40, seed: 5 }); band(c, 300, 980, .6);
        const fl = 1 - M.seg(t, 1.5, 1.62); if (fl > 0) { c.fillStyle = `rgba(255,255,255,${.7 * fl})`; c.fillRect(0, 0, W, H); }
        M.kinetic(c, 'SNOWFALL', t, CX, 420, { t0: 1.5, size: 150, highlight: ['snowfall'] });                          // C2
        M.kinetic(c, 'WARNING TODAY', t, CX, 600, { t0: 1.7, size: 112, maxW: 940 }); }
      M.source(c, SRC_NOW, 60, 1430, { size: 17 }); M.source(c, MAPC, 60, 1460, { size: 17 });
  } },
  // 1 THE WARNING (ECCC update 16:46 UTC: 15-20 cm, Calgary at the lower end): evidence chip, big "15-20 cm", gauge band 15-20 filled to 15; snow keeps falling
  { dur: sc[1].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H); M.weather(c, 'snow', t + 4, W, H, { count: 260, wind: 30, seed: 9 });
      M.chip(c, '⚠ SNOWFALL WARNING · CITY OF CALGARY', CX, 300, { align: 'center', size: 44, bg: YEL, color: '#06101f', alpha: M.seg(t, 0, .3) });
      M.chip(c, 'ISSUED NOV 17 · ENVIRONMENT CANADA', CX, 390, { align: 'center', size: 32, bg: '#ffffff', color: '#06101f', alpha: M.seg(t, .3, .6) });
      const p = M.seg(t, .6, 2.6, 'outCubic');
      M.text(c, '15–20 cm', CX - 90, 560, { size: 170, weight: 900, align: 'center', color: '#fff', alpha: Math.min(1, p * 2) });       // C2
      M.text(c, 'EXPECTED', CX - 90, 760, { size: 64, weight: 800, align: 'center', color: ICE, alpha: M.seg(t, 1.2, 1.6), tracking: .08 });
      M.chip(c, 'CALGARY: LOWER END', CX - 90, 850, { align: 'center', size: 44, bg: '#ffffff', color: '#06101f', alpha: M.seg(t, 4.4, 4.8) });
      // gauge (0-30 cm), forecast band 15-20 cm, fill to 15 (Calgary at the lower end)
      const gx = 880, gy0 = 1100, gh = 620, cm = gh / 30, gw = 90;
      M.rr(c, gx - gw / 2, gy0 - gh, gw, gh, 18); c.fillStyle = 'rgba(255,255,255,.1)'; c.fill();
      for (let k = 0; k <= 30; k += 5) { c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(gx - gw / 2 - 26, gy0 - k * cm - 2, 20, 4); M.text(c, String(k), gx - gw / 2 - 36, gy0 - k * cm, { size: 26, weight: 700, align: 'right', base: 'middle', color: '#c9d4e3' }); }
      const bandK = M.seg(t, 1.0, 2.6, 'outCubic');
      if (bandK > 0) { c.fillStyle = 'rgba(159,211,255,.25)'; c.fillRect(gx - gw / 2, gy0 - 20 * cm, gw, 5 * cm); }
      const fillTo = 15 * bandK; c.fillStyle = '#ffffff'; M.rr(c, gx - gw / 2 + 8, gy0 - fillTo * cm, gw - 16, Math.max(0, fillTo * cm - 8), 10); c.fill();
      c.strokeStyle = ICE; c.lineWidth = 4; [15, 20].forEach(k => { if (bandK > .3) { c.beginPath(); c.moveTo(gx - gw / 2 - 6, gy0 - k * cm); c.lineTo(gx + gw / 2 + 6, gy0 - k * cm); c.stroke(); } });
      M.text(c, 'cm', gx, gy0 - gh - 50, { size: 30, weight: 700, align: 'center', color: '#c9d4e3' });
      M.text(c, 'Tapering off', CX - 90, 960, { size: 60, weight: 800, align: 'center', color: '#fff', alpha: M.seg(t, 5.6, 6.0) });
      M.text(c, 'Wednesday evening', CX - 90, 1030, { size: 60, weight: 800, align: 'center', color: M.house.gold, alpha: M.seg(t, 5.8, 6.2) });
      M.text(c, 'Forecast, not a measurement', CX - 90, 1110, { size: 30, weight: 600, align: 'center', color: '#c9d4e3', alpha: M.seg(t, 6.2, 6.6) });
      M.source(c, SRC_WARN, 60, 1460, { size: 17 });
  } },
  // 2 BEFORE: Nov 1-16 tiles, highs, every one "0 cm" snow; Sunday Nov 15 outlined
  { dur: sc[2].sceneDur, trans: { kind: 'zoom', dur: .35 }, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H); sunny(c, .6);
      M.text(c, 'CALGARY AIRPORT · NOV 1–16', CX, 335, { size: 40, weight: 800, align: 'center', color: M.house.gold, tracking: .1 });
      const cols = 4, tw = 200, th = 150, gap = 14, x0 = CX - (cols * tw + (cols - 1) * gap) / 2, y0 = 400;
      HIGHS.forEach((v, i) => { const r = Math.floor(i / cols), col = i % cols, x = x0 + col * (tw + gap), y = y0 + r * (th + gap);
        const k = M.seg(t, .1 + i * .08, .4 + i * .08, 'outBack'), sun = i === 14;
        c.save(); c.globalAlpha = Math.min(1, Math.max(0, k)); M.rr(c, x, y, tw, th, 16); c.fillStyle = sun ? WARM : 'rgba(255,255,255,.12)'; c.fill();
        if (sun) { const q = M.seg(t, .3, 1.2); c.lineWidth = 7; c.strokeStyle = M.house.gold; c.globalAlpha = q; c.stroke(); c.globalAlpha = Math.min(1, k); }
        M.text(c, (sun ? 'SUN ' : 'Nov ') + (i + 1), x + tw / 2, y + 34, { size: 28, weight: 700, align: 'center', base: 'middle', color: '#fff' });
        M.text(c, v == null ? '—' : v.toFixed(1) + '°', x + tw / 2, y + 82, { size: 44, weight: 800, align: 'center', base: 'middle', color: '#fff' });
        M.text(c, '0 cm ❄', x + tw / 2, y + 126, { size: 26, weight: 700, align: 'center', base: 'middle', color: ICE, alpha: M.seg(t, 3.0, 3.4) });
        c.restore(); });
      M.chip(c, 'SNOW MEASURED NOV 1–16: 0 cm', CX, 1080, { align: 'center', size: 50, bg: ICE, color: '#06101f', alpha: M.seg(t, 3.3, 3.7) });   // C3
      M.source(c, 'Nov 7: daily high missing in ECCC daily data', 60, 1430, { size: 20 });
      M.source(c, SRC_NOW, 60, 1460, { size: 17 });
  } },
  // 3 THE SEARCH: one dot per November since 1926, year rolls, then the 21 snowy ones light up
  { dur: sc[3].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
      const p = M.seg(t, .1, 3.4, 'inOutSine'), n = Math.floor(p * 100);
      M.text(c, 'EVERY NOVEMBER SINCE 1926', CX, 282, { size: 46, weight: 800, align: 'center', color: M.house.gold, tracking: .08 });
      if (t < 3.6) M.text(c, String(p >= 1 ? 2025 : Math.round(1926 + 99 * p)), CX, 345, { size: 160, weight: 800, align: 'center' });
      else { M.counter(c, 21, M.seg(t, 3.6, 4.8), CX - 120, 345, { from: 0, size: 150, decimals: 0, color: ICE }); M.text(c, 'of 100', CX + 150, 395, { size: 80, weight: 800, align: 'center', color: '#fff' }); } // C4
      M.text(c, '15 cm+ of snow in 2 days', CX, 498, { size: 44, weight: 800, align: 'center', color: '#fff', alpha: M.seg(t, 3.6, 4.0) });
      dots(c, t, { scan: n, lit: t > 3.6, gy: 590 });
      M.source(c, SRC_HIST, 60, 1460, { size: 17 });
  } },
  // 4 ONE IN FIVE: lit dots stay; "≈ 1 in 5", 2024 dot pops "LAST: 2024"
  { dur: sc[4].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
      M.kinetic(c, '≈ 1 November in 5', t, CX, 320, { t0: -.05, size: 84, maxW: 940, highlight: ['1', '5'] });           // C6
      dots(c, t, { lit: true, last: 1.9, gy: 590 });                                                                         // C5
      M.text(c, '21 of 100 on record · 15 cm+ in 2 days', CX, 450, { size: 38, weight: 700, align: 'center', color: '#fff' });
      M.source(c, 'Some days missing in 1993, 2012, 2017, 2019, 2020', 60, 1440, { size: 20 });
      M.source(c, SRC_HIST, 60, 1476, { size: 17 });
  } },
  // 5 CLOSER: one-word question, held ~1.6 s after the voice; no end card (video under 2:00)
  { dur: sc[5].sceneDur, draw: (c, t) => { c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H); M.weather(c, 'snow', t + 9, W, H, { count: 220, wind: 20, seed: 11 });
      M.closer(c, 'Winter tires on yet? Yes or no?', M.seg(t, 0, sc[5].sceneDur, 'linear'), W, H, { highlight: ['yes', 'no?'] }); } },
], overlay: (c, t, info) => {
  if (t > 3 && info.index < 5) M.header(c, window.LOGO, W, H);
  if (info.index < 5) M.caption(c, S.captionAt(t), W, H);
  const mid = S.total / 2; M.followPill(c, M.seg(t, mid - 1, mid + 1, 'linear'), W, H);
} });

window.CUES = [
  { t: 0.00, sfx: 'impact', gain: -4 }, { t: 1.48, sfx: 'whoosh', gain: -6 },
  { t: sc[1].sceneStart - .2, sfx: 'whoosh', gain: -8 }, { t: sc[1].sceneStart + .6, sfx: 'ticks', dur: 2.0, gain: -13 },
  { t: sc[2].sceneStart - .18, sfx: 'whoosh', gain: -9 }, { t: sc[2].sceneStart + .1, sfx: 'ticks', dur: 1.4, gain: -14 },
  { t: sc[3].sceneStart - .2, sfx: 'whoosh', gain: -8 }, { t: sc[3].sceneStart + .1, sfx: 'ticks', dur: 3.3, gain: -13 }, { t: sc[3].sceneStart + 3.6, sfx: 'pop', gain: -8 },
  { t: sc[4].sceneStart - .18, sfx: 'whoosh', gain: -9 }, { t: sc[4].sceneStart + 1.9, sfx: 'pop', gain: -7 },
  { t: sc[5].sceneStart, sfx: 'impact', gain: -6 },
];
