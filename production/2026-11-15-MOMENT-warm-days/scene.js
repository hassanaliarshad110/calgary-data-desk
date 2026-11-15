/* Calgary Insight same-day moment, Nov 15, 2026: "Thirteen warm days in the first half of November".
 * Lead identity: Data Explainer. Borrowed: Storyteller drone over the real downtown (hook), Civic record stamp (scene 4).
 * Every figure maps to the claims table in packages/2026-11-15-MOMENT-warm-days.md (C1-C6).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DURS = (window.PARAMS && window.PARAMS.durs) ? JSON.parse(window.PARAMS.durs) : [2.987, 7.147, 4.587, 2.496, 4.309, 2.048];
const LINES = [
  'Thirteen warm days. In the first half of November.',
  "That's how many days this month reached ten degrees or warmer at Calgary's airport. Today too, at over fourteen so far.",
  'So we counted the same fifteen days in every November since nineteen twenty-six.',
  'Only one year matched it. Twenty sixteen.',
  'No year had more. It ties the record, going back to nineteen twenty-six.',
  'Ready for snow yet? Yes or no?',
];
const S = M.script(LINES.map((text, i) => ({ text, dur: DURS[i] })), { lead: .3, gap: .35, tail: 1.6 });
const sc = S.scenes;
const SRC = 'Environment and Climate Change Canada · Calgary (airport record) daily highs, Nov 1–15, 1926–2025';
const SRC_TODAY = 'Nov 2026: ECCC daily data; Nov 15 = station data through mid-afternoon (preliminary)';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const WARM = '#ff7a3d', COOL = '#4f6f99';

// C2: Calgary airport daily highs, Nov 1-15, 2026 (ECCC daily; Nov 7 daily max missing -> hourly peak 13.7; Nov 15 SWOB preliminary)
const DAYS = [8.1, 12.1, 14.5, 9.3, 12.4, 14.4, 13.7, 14.2, 10.4, 13.6, 13.3, 13.9, 12.1, 13.9, 14.2];
const DLAB = ['8.1°', '12.1°', '14.5°', '9.3°', '12.4°', '14.4°', '13.7°*', '14.2°', '10.4°', '13.6°', '13.3°', '13.9°', '12.1°', '13.9°', '14+°'];
// C4/C5: days of 10 °C or warmer, Nov 1-15, ranked (1926-2025 + 2026)
const TOP = [{ y: '2026', v: 13, today: true }, { y: '2016', v: 13 }, { y: '1954', v: 11 }, { y: '1962', v: 11 }, { y: '1981', v: 11 }, { y: '1999', v: 11 }, { y: '2001', v: 11 }, { y: '2004', v: 11 }];

function sunny(c) { const g = c.createRadialGradient(W * .82, 260, 10, W * .82, 260, 520); g.addColorStop(0, 'rgba(255,214,120,.55)'); g.addColorStop(1, 'rgba(255,214,120,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 900); }
function band(c, y0, y1, a = .62) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); }
// 15-day calendar strip: 5 x 3 tiles, warm tiles (>= 10 °C) turn orange one by one
function calendar(c, t, y0, o = {}) {
  const cols = 5, tw = 168, th = 150, gap = 14, x0 = CX - (cols * tw + (cols - 1) * gap) / 2;
  DAYS.forEach((v, i) => {
    const r = Math.floor(i / cols), col = i % cols, x = x0 + col * (tw + gap), y = y0 + r * (th + gap);
    const k = M.seg(t, (o.t0 || 0) + i * (o.step || .16), (o.t0 || 0) + i * (o.step || .16) + .3, 'outBack'), warm = v >= 10;
    c.save(); c.globalAlpha = .35 + .65 * Math.min(1, k);
    M.rr(c, x, y, tw, th, 16); c.fillStyle = k > .3 ? (warm ? WARM : COOL) : 'rgba(255,255,255,.12)'; c.fill();
    if (i === 14) { c.lineWidth = 6; c.strokeStyle = M.house.gold; c.stroke(); }
    M.text(c, 'Nov ' + (i + 1), x + tw / 2, y + 40, { size: 30, weight: 700, align: 'center', base: 'middle', color: '#fff' });
    if (k > .3) M.text(c, DLAB[i], x + tw / 2, y + 100, { size: 46, weight: 800, align: 'center', base: 'middle', color: '#fff' });
    c.restore();
  });
}
// ranked horizontal bars from zero; ties shown as ties
function ranks(c, t, o = {}) {
  const x0 = 250, maxW = 600, max = 15, rowH = 92, y0 = 400, p = M.seg(t, 0, 1.4);
  TOP.forEach((r, i) => {
    const k = M.seg(p, i * .05, i * .05 + .55, 'outCubic'), y = y0 + i * rowH, w = maxW * (r.v / max) * k;
    let a = 1; if (o.dim && i > 1) a = .35;
    c.save(); c.globalAlpha = a;
    if (r.today && o.pulse) { const q = .5 + .5 * Math.sin(t * 7); c.shadowColor = M.house.gold; c.shadowBlur = 30 + 30 * q; }
    M.rr(c, x0, y, Math.max(4, w), 64, 12); c.fillStyle = r.today ? M.house.gold : (i === 1 ? WARM : COOL); c.fill(); c.shadowBlur = 0;
    M.text(c, r.today ? 'THIS YEAR' : r.y, x0 - 24, y + 32, { size: r.today ? 40 : 44, weight: 800, align: 'right', base: 'middle', color: r.today ? M.house.gold : '#fff' });
    if (k > .05) M.text(c, String(Math.round(k >= 1 ? r.v : r.v * k)), x0 + w + 18, y + 32, { size: 44, weight: 800, base: 'middle', color: '#fff' });
    c.restore();
  });
  const tb = M.seg(t, 1.3, 1.7); if (tb > 0) { const yA = y0 + 6, yB = y0 + rowH + 60, bx = 1000;
    c.save(); c.globalAlpha = tb; c.strokeStyle = M.house.gold; c.lineWidth = 5; c.beginPath(); c.moveTo(bx - 18, yA); c.lineTo(bx, yA); c.lineTo(bx, yB); c.lineTo(bx - 18, yB); c.stroke(); c.restore();
    M.text(c, 'TIED', bx - 30, (yA + yB) / 2 - 20, { size: 34, weight: 900, align: 'right', color: M.house.gold, alpha: tb });
    M.text(c, '1ST', bx - 30, (yA + yB) / 2 + 18, { size: 34, weight: 900, align: 'right', color: M.house.gold, alpha: tb }); }
  M.text(c, 'DAYS AT 10°C OR WARMER, NOV 1–15', CX, 330, { size: 36, weight: 800, align: 'center', color: M.house.gold, tracking: .08 });
}

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // 0 HOOK: frame 0 already flying over the real downtown in sun; "13" slams in with "warm days"
  { dur: sc[0].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      const w = M.world({ sky: 'day', fog: { near: 4000, far: 22000, max: .45 } }); M.geo.addBase(w, { buildings: true });
      const tw = M.geo.lm('Calgary Tower'), u = M.seg(t, 0, sc[0].sceneDur, 'outCubic');
      const cam = M.camera({ pos: [tw[0] - 2600 + 1400 * u, tw[1] - 3200 + 1500 * u, M.lerp(1600, 700, u)], look: [tw[0], tw[1], 120], fov: 55 }, W, H); w.render(c, cam);
      sunny(c); band(c, 330, 1130, .55);
      M.counter(c, 13, M.seg(t, -.35, .35), CX, 420, { from: 9, size: 230, slam: true, decimals: 0 });       // C1
      M.kinetic(c, 'warm days', t, CX, 650, { t0: .2, size: 124, highlight: ['warm'] });
      M.kinetic(c, 'in November?', t, CX, 810, { t0: .5, size: 110, highlight: ['november?'] });
      M.source(c, MAPC, 60, 1460, { size: 17 });
  } },
  // 1 THE CALENDAR: Nov 1-15 tiles, 13 turn orange (>= 10 °C), today outlined in gold
  { dur: sc[1].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H); sunny(c);
      M.text(c, 'CALGARY AIRPORT · DAILY HIGHS', CX, 330, { size: 38, weight: 800, align: 'center', color: M.house.gold, tracking: .1 });
      calendar(c, t, 420, { t0: .3, step: .2 });                                                          // C1, C2
      const n = DAYS.filter((v, i) => v >= 10 && M.seg(t, .3 + i * .2, .6 + i * .2) > .3).length;
      M.text(c, n + ' of 15 at 10°C+', CX, 960, { size: 76, weight: 900, align: 'center', color: '#fff', alpha: M.seg(t, .4, .8) });
      M.chip(c, 'NOV 15: 14+ °C SO FAR · PRELIMINARY', CX, 1080, { align: 'center', size: 26, bg: '#f2b632', color: '#06101f', alpha: M.seg(t, 3.4, 3.8) });  // C3
      M.text(c, '*Nov 7: daily max missing; hourly readings reached 13.7°C', CX, 1160, { size: 26, weight: 600, align: 'center', color: '#c9d4e3', alpha: M.seg(t, 3.0, 3.4) });
      M.source(c, SRC_TODAY, 60, 1440, { size: 17 }); M.source(c, 'Environment and Climate Change Canada · stations 50430 / CYYC', 60, 1476, { size: 17 });
  } },
  // 2 THE SEARCH: one dot per November since 1926 (100 years), year counter rolls
  { dur: sc[2].sceneDur, trans: { kind: 'zoom', dur: .35 }, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
      const p = M.seg(t, .1, sc[2].sceneDur - .3, 'inOutSine'), n = Math.floor(p * 100);
      M.text(c, 'EVERY NOV 1–15 SINCE 1926', CX, 360, { size: 46, weight: 800, align: 'center', color: M.house.gold, tracking: .1 });
      M.text(c, String(p >= 1 ? 2025 : Math.round(1926 + 99 * p)), CX, 430, { size: 170, weight: 800, align: 'center' });
      const step = 66, gx = CX - 4.5 * step, gy = 680;
      for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), col = i % 10, on = i < n;
        c.beginPath(); c.arc(gx + col * step, gy + r * step, on ? 24 : 18, 0, 7); c.fillStyle = on ? COOL : 'rgba(255,255,255,.12)'; c.fill(); }
      M.source(c, SRC, 60, 1460, { size: 17 });
  } },
  // 3 ONLY ONE: 2016 lights up on the dot grid
  { dur: sc[3].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
      M.kinetic(c, 'Only 1 matched', t, CX, 330, { t0: -.05, size: 116, maxW: 900, highlight: ['1'] });          // C4
      const step = 66, gx = CX - 4.5 * step, gy = 680;
      for (let i = 0; i < 100; i++) { const yr = 1926 + i, r = Math.floor(i / 10), col = i % 10, hot = yr === 2016;
        const k = hot ? M.seg(t, .3, .7, 'outBack') : 0;
        c.beginPath(); c.arc(gx + col * step, gy + r * step, 24 + 16 * Math.min(1, k), 0, 7); c.fillStyle = hot && k > 0 ? WARM : 'rgba(79,111,153,.55)'; c.fill();
        if (hot && k > .5) M.text(c, '2016', gx + col * step, gy + r * step - 64, { size: 36, weight: 800, align: 'center', color: '#fff' }); }
      M.source(c, SRC, 60, 1460, { size: 17 });
  } },
  // 4 THE RECORD: ranked bars, this year and 2016 tied first, RECORD stamp
  { dur: sc[4].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
      ranks(c, t, { pulse: t > 2 });                                                                     // C4, C5
      const st = M.seg(t, 1.8, 2.15, 'outBack'); if (st > 0) { c.save(); c.translate(CX, 1170); c.rotate(-.05); c.scale(M.lerp(1.8, 1, st), M.lerp(1.8, 1, st)); c.globalAlpha = Math.min(1, st * 1.5);
        M.rr(c, -330, -46, 660, 92, 16); c.fillStyle = 'rgba(7,13,24,.85)'; c.fill(); c.lineWidth = 7; c.strokeStyle = M.house.gold; c.stroke(); M.text(c, 'TIED MOST SINCE 1926', 0, 0, { size: 46, weight: 900, align: 'center', base: 'middle', color: M.house.gold }); c.restore(); }
      M.source(c, SRC, 60, 1476, { size: 17 });
  } },
  // 5 CLOSER: one-word question, held ~1.6 s after the voice; no end card (video under 2:00)
  { dur: sc[5].sceneDur, draw: (c, t) => { c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H); sunny(c);
      M.closer(c, 'Ready for snow yet? Yes or no?', M.seg(t, 0, sc[5].sceneDur, 'linear'), W, H, { highlight: ['yes', 'no?'] }); } },
], overlay: (c, t, info) => {
  if (t > 3 && info.index < 5) M.header(c, window.LOGO, W, H);
  if (info.index < 5) M.caption(c, S.captionAt(t), W, H);
} });

window.CUES = [
  { t: 0.00, sfx: 'impact', gain: -4 }, { t: .02, sfx: 'ticks', dur: .6, gain: -12 },
  { t: sc[1].sceneStart - .2, sfx: 'whoosh', gain: -8 }, { t: sc[1].sceneStart + .3, sfx: 'ticks', dur: 3.0, gain: -13 },
  { t: sc[2].sceneStart - .18, sfx: 'whoosh', gain: -9 }, { t: sc[2].sceneStart + .2, sfx: 'ticks', dur: 3.0, gain: -13 },
  { t: sc[3].sceneStart - .2, sfx: 'whoosh', gain: -8 }, { t: sc[3].sceneStart + .4, sfx: 'pop', gain: -8 },
  { t: sc[4].sceneStart - .18, sfx: 'whoosh', gain: -9 }, { t: sc[4].sceneStart + 1.85, sfx: 'stamp', gain: -7 },
  { t: sc[5].sceneStart, sfx: 'impact', gain: -6 },
];
