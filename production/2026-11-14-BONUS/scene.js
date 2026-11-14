/* Calgary Insight fun fact, Nov 14, 2026 (bonus): "Fourteen degrees in mid-November".
 * Lead identity: Data Explainer. Borrowed: Storyteller drone over the real downtown (hook), Civic record stamp (scene 4).
 * Every figure maps to the claims table in packages/2026-11-14-BONUS-warm-november-14.md (C1-C5).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const S = M.script([
  { text: 'Almost fourteen degrees. In the middle of November.', dur: 2.859 },
  { text: "That's what Calgary's airport hit today. The usual high for this date is under five.", dur: 4.843 },
  { text: 'So we checked every November fourteenth for the last hundred years.', dur: 3.52 },
  { text: 'Only four were warmer than today.', dur: 1.771 },
  { text: 'Nineteen seventy-nine still holds the record, at eighteen point seven.', dur: 4.117 },
  { text: 'That puts today in the top five of the last century.', dur: 2.645 },
  { text: 'Did you get outside and enjoy it? Yes or no?', dur: 2.539 },
], { lead: .3, gap: .35, tail: 1.6 });
const sc = S.scenes;
const SRC = 'Environment and Climate Change Canada · Calgary airport daily records, Nov 14, 1926–2025';
const SRC_TODAY = 'Today: Environment Canada station data, Calgary airport, highest to 4 p.m., Nov 14, 2026 (preliminary)';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const WARM = '#ff7a3d', COOL = '#4f6f99';

// C3: the only Nov 14 highs above 14 °C, 1926-2025 (ECCC daily data), in rank order; C4 record = 1979
const TOP = [{ y: '1979', v: 18.7 }, { y: '1936', v: 16.7 }, { y: '1953', v: 16.1 }, { y: '1975', v: 15.0 }];
const NEXT = [{ y: '1940', v: 13.9 }, { y: '1949', v: 13.9 }];
const WARM_YEARS = [1979, 1936, 1953, 1975];

function sunny(c, t) { const g = c.createRadialGradient(W * .82, 260, 10, W * .82, 260, 520); g.addColorStop(0, 'rgba(255,214,120,.55)'); g.addColorStop(1, 'rgba(255,214,120,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 900); }
function band(c, y0, y1, a = .62) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); }
function thermo(c, x, y, h, frac, col) {          // simple thermometer, fill to frac of its height
  c.save(); c.lineWidth = 10; c.strokeStyle = '#fff'; M.rr(c, x - 34, y, 68, h, 34); c.stroke();
  c.beginPath(); c.arc(x, y + h + 40, 62, 0, 7); c.fillStyle = col; c.fill(); c.stroke();
  const fh = (h - 20) * frac; M.rr(c, x - 20, y + h - fh, 40, fh + 30, 18); c.fillStyle = col; c.fill(); c.restore();
}
// ranked horizontal bars, values drawn exactly (bars start at zero)
function ranks(c, t, o = {}) {
  const x0 = 250, maxW = 560, max = 20, rowH = 112, y0 = 470, p = M.seg(t, 0, 1.4);
  const rows = TOP.map(r => Object.assign({ col: WARM }, r)).concat([{ y: 'TODAY', v: 13.9, col: M.house.gold, today: true }], NEXT.map(r => Object.assign({ col: '#c9a24a', tie: true }, r)));
  // 14 °C reference line
  const lx = x0 + maxW * 13.9 / max; c.save(); c.setLineDash([14, 12]); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(lx, y0 - 50); c.lineTo(lx, y0 + rows.length * rowH - 20); c.stroke(); c.restore();
  if (!o.dim) M.text(c, 'TODAY 13.9°C', lx, y0 - 92, { size: 34, weight: 800, align: 'center', color: M.house.gold, alpha: M.seg(t, .2, .6) });
  rows.forEach((r, i) => {
    const k = M.seg(p, i * .06, i * .06 + .55, 'outCubic'), y = y0 + i * rowH, w = maxW * (r.v / max) * k;
    let a = 1; if (o.dim && !r.today && !r.tie) a = .35;
    c.save(); c.globalAlpha = a;
    if (r.today && o.pulse) { const q = .5 + .5 * Math.sin(t * 7); c.shadowColor = M.house.gold; c.shadowBlur = 30 + 30 * q; }
    M.rr(c, x0, y, Math.max(4, w), 74, 12); c.fillStyle = r.col; c.fill(); c.shadowBlur = 0;
    M.text(c, r.y, x0 - 24, y + 37, { size: r.today ? 50 : 46, weight: 800, align: 'right', base: 'middle', color: r.today ? M.house.gold : '#fff' });
    if (k > .05) M.text(c, M.fmt(k >= 1 ? r.v : r.v * k, { decimals: 1, suffix: '°' }), x0 + w + 18, y + 37, { size: 46, weight: 800, base: 'middle', color: '#fff' });
    c.restore();
  });
  const tb = M.seg(t, 1.3, 1.7); if (tb > 0) { const yA = y0 + 4 * rowH + 6, yB = y0 + 6 * rowH + 68, bx = 905;
    c.save(); c.globalAlpha = tb; c.strokeStyle = M.house.gold; c.lineWidth = 5; c.beginPath(); c.moveTo(bx - 18, yA); c.lineTo(bx, yA); c.lineTo(bx, yB); c.lineTo(bx - 18, yB); c.stroke();
    M.text(c, 'TIED', bx - 6, (yA + yB) / 2 - 36, { size: 34, weight: 900, align: 'right', color: M.house.gold }); M.text(c, '5TH', bx - 6, (yA + yB) / 2 + 2, { size: 34, weight: 900, align: 'right', color: M.house.gold }); c.restore(); }
}

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // 0 HOOK: frame 0 already flying over the real downtown in bright sun; 14°C slams in, thermometer fills
  { dur: sc[0].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      const w = M.world({ sky: 'day', fog: { near: 4000, far: 22000, max: .45 } }); M.geo.addBase(w, { buildings: true });
      const tw = M.geo.lm('Calgary Tower'), u = M.seg(t, 0, sc[0].sceneDur, 'outCubic');
      const cam = M.camera({ pos: [tw[0] - 2600 + 1400 * u, tw[1] - 3200 + 1500 * u, M.lerp(1600, 700, u)], look: [tw[0], tw[1], 120], fov: 55 }, W, H); w.render(c, cam);
      sunny(c, t); band(c, 330, 1130, .55);
      M.counter(c, 13.9, M.seg(t, -.35, .35), CX + 70, 410, { from: 13, size: 210, suffix: '°C', slam: true, decimals: 1 });       // C1
      M.kinetic(c, 'In November?', t, CX, 760, { t0: .35, size: 124, highlight: ['november?'] });
      thermo(c, 120, 380, 250, (.55 + .45 * M.seg(t, 0, .8, 'outCubic')) * .78, WARM);
      M.source(c, MAPC, 60, 1460, { size: 17 });
  } },
  // 1 TODAY vs USUAL: map dive onto the airport station, two bars from zero
  { dur: sc[1].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      const ap = M.geo.lm('Calgary International Airport');
      const w = M.world({ sky: 'day', fog: { near: 9000, far: 45000, max: .5 } }); M.geo.addBase(w, { buildings: false, roads: true });
      M.pin(w, ap, '', { p: M.seg(t, .15, .6) });
      const cam = M.camera(M.moves.dive(ap, M.seg(t, 0, sc[1].sceneDur, 'outCubic'), { h0: 22000, h1: 6000, back0: 1, back1: 6000, ahead: 300 }), W, H); w.render(c, cam);
      band(c, 380, 1300, .7);
      M.text(c, 'NOVEMBER 14 · CALGARY AIRPORT', CX, 420, { size: 38, weight: 800, align: 'center', color: M.house.gold, tracking: .12 });
      [{ l: 'Today', v: 13.9, d: 1, col: WARM }, { l: 'Usual high*', v: 4.6, d: 1, col: COOL }].forEach((b, i) => {      // C1, C2
        const k = M.seg(t, .3 + i * .25, 1.5 + i * .25, 'outCubic'), bw = 230, bx = CX - 280 + i * 330, base = 1080, h = 500 * b.v / 16 * k;
        M.rr(c, bx, base - h, bw, Math.max(4, h), 12); c.fillStyle = b.col; c.fill();
        if (k > .05) M.text(c, M.fmt(k >= 1 ? b.v : b.v * k, { decimals: b.d, suffix: '°C' }), bx + bw / 2, base - h - 80, { size: 64, weight: 800, align: 'center' });
        M.text(c, b.l, bx + bw / 2, base + 16, { size: 44, weight: 600, align: 'center', color: '#dfe7f2' });
      });
      M.text(c, '*mean of the 30 Nov 14 highs, 1991–2020', CX, 1180, { size: 28, weight: 600, align: 'center', color: '#c9d4e3', alpha: M.seg(t, 1.5, 2) });
      M.chip(c, 'TODAY: PRELIMINARY', CX, 1240, { align: 'center', size: 24, bg: '#f2b632', color: '#06101f', alpha: M.seg(t, 2.2, 2.6) });
      M.source(c, SRC_TODAY, 60, 1440, { size: 17 }); M.source(c, SRC, 60, 1476, { size: 17 });
  } },
  // 2 THE SEARCH: 100 dots, one per Nov 14 since 1926, the year counter rolls 1926 -> 2025
  { dur: sc[2].sceneDur, trans: { kind: 'zoom', dur: .35 }, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
      const p = M.seg(t, .1, sc[2].sceneDur - .3, 'inOutSine'), n = Math.floor(p * 100);
      M.text(c, 'EVERY NOVEMBER 14', CX, 360, { size: 50, weight: 800, align: 'center', color: M.house.gold, tracking: .12 });
      M.text(c, String(p >= 1 ? 2025 : Math.round(1926 + 99 * p)), CX, 430, { size: 170, weight: 800, align: 'center' });
      const step = 66, gx = CX - 4.5 * step, gy = 640;
      for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), col = i % 10, on = i < n;
        c.beginPath(); c.arc(gx + col * step, gy + r * step, on ? 24 : 18, 0, 7); c.fillStyle = on ? COOL : 'rgba(255,255,255,.12)'; c.fill(); }
  } },
  // 3 ONLY FOUR: the four warmer years light up orange on the dot grid, then the ranked bars
  { dur: sc[3].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
      M.kinetic(c, 'Only 4 were warmer', t, CX, 330, { t0: -.05, size: 104, maxW: 860, highlight: ['4'] });          // C3
      const step = 66, gx = CX - 4.5 * step, gy = 640;
      for (let i = 0; i < 100; i++) { const yr = 1926 + i, r = Math.floor(i / 10), col = i % 10, hot = WARM_YEARS.includes(yr);
        const k = hot ? M.seg(t, .3 + WARM_YEARS.indexOf(yr) * .25, .6 + WARM_YEARS.indexOf(yr) * .25, 'outBack') : 0;
        c.beginPath(); c.arc(gx + col * step, gy + r * step, 24 + 14 * Math.min(1, k), 0, 7); c.fillStyle = hot && k > 0 ? WARM : 'rgba(79,111,153,.55)'; c.fill();
        if (hot && k > .5) M.text(c, String(yr), gx + col * step, gy + r * step - 60, { size: 32, weight: 800, align: 'center', color: '#fff' }); }
            M.source(c, SRC, 60, 1460, { size: 17 });
  } },
  // 4 THE RECORD: ranked bars grow, 1979 gets the record stamp
  { dur: sc[4].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
      ranks(c, t, {});                                                                                  // C3, C4
      const st = M.seg(t, 1.5, 1.85, 'outBack'); if (st > 0) { c.save(); c.translate(800, 296); c.rotate(-.06); c.scale(M.lerp(1.8, 1, st), M.lerp(1.8, 1, st)); c.globalAlpha = Math.min(1, st * 1.5);
        M.rr(c, -150, -42, 300, 84, 16); c.fillStyle = 'rgba(7,13,24,.85)'; c.fill(); c.lineWidth = 7; c.strokeStyle = M.house.gold; c.stroke(); M.text(c, 'RECORD', 0, 0, { size: 52, weight: 900, align: 'center', base: 'middle', color: M.house.gold }); c.restore(); }
      M.source(c, SRC, 60, 1440, { size: 17 }); M.source(c, SRC_TODAY, 60, 1476, { size: 17 });
  } },
  // 5 TOP FIVE: today's bar glows in fifth place
  { dur: sc[5].sceneDur, trans: { kind: 'flash', dur: .3 }, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
      ranks(c, 9, { dim: true, pulse: true });
      M.kinetic(c, 'Top 5', t, CX, 300, { t0: -.05, size: 150, highlight: ['5'] });
      M.text(c, 'NOV 14ths SINCE 1926', CX, 1300, { size: 40, weight: 800, align: 'center', color: M.house.gold, tracking: .12, alpha: M.seg(t, .2, .5) });                                  // C5
      M.source(c, SRC, 60, 1440, { size: 17 }); M.source(c, SRC_TODAY, 60, 1476, { size: 17 });
  } },
  // 6 CLOSER: one-word question, held ~1.6 s after the voice; no end card (video under 2:00)
  { dur: sc[6].sceneDur, draw: (c, t) => { c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H); sunny(c, t);
      M.closer(c, 'Did you get outside and enjoy it? Yes or no?', M.seg(t, 0, sc[6].sceneDur, 'linear'), W, H, { highlight: ['yes', 'no?'] }); } },
], overlay: (c, t, info) => {
  if (t > 3 && info.index < 6) M.header(c, window.LOGO, W, H);
  if (info.index < 6) M.caption(c, S.captionAt(t), W, H);
} });

window.CUES = [
  { t: 0.00, sfx: 'impact', gain: -4 }, { t: .02, sfx: 'ticks', dur: .6, gain: -12 },
  { t: sc[1].sceneStart - .2, sfx: 'whoosh', gain: -8 }, { t: sc[1].sceneStart + .2, sfx: 'pop', gain: -10 },
  { t: sc[1].sceneStart + .4, sfx: 'ticks', dur: 1.6, gain: -12 },
  { t: sc[2].sceneStart - .18, sfx: 'whoosh', gain: -9 }, { t: sc[2].sceneStart + .2, sfx: 'ticks', dur: 3.0, gain: -13 },
  { t: sc[3].sceneStart - .2, sfx: 'whoosh', gain: -8 }, { t: sc[3].sceneStart + .35, sfx: 'pop', gain: -9 }, { t: sc[3].sceneStart + .6, sfx: 'pop', gain: -9 },
  { t: sc[3].sceneStart + .85, sfx: 'pop', gain: -9 }, { t: sc[3].sceneStart + 1.1, sfx: 'pop', gain: -9 },
  { t: sc[4].sceneStart - .18, sfx: 'whoosh', gain: -9 }, { t: sc[4].sceneStart + 1.55, sfx: 'stamp', gain: -7 },
  { t: sc[5].sceneStart, sfx: 'impact', gain: -6 },
];
