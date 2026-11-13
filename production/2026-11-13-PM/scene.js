/* 2026-11-13 PM fun fact: "WestJet took off on a leap day".
 * Lead identity: Data Explainer (calendar tick, counters, pins); borrows a Storyteller map dive over the real city (S2)
 * and a Civic-style schematic card with labelled approximation (S4).
 * Every on-screen figure maps to the audited claims table in packages/2026-11-13-PM-westjet-leap-day.md (claim numbers in comments).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DUR = [1.771, 3.883, 4.437, 1.728, 4.992, 2.795];      // measured Kokoro line durations (durs.json, studio-probe-out)      // measured Kokoro line durations (replaced from durs.json)
const S = M.script([
  { text: 'WestJet took off on a leap day.', dur: DUR[0] },
  { text: 'Its first flight was on February twenty-ninth, nineteen ninety-six.', dur: DUR[1] },
  { text: 'The Calgary-based airline was founded by Clive Beddoe and a team of partners.', dur: DUR[2] },
  { text: 'It started with just three planes,', dur: DUR[3] },
  { text: 'and five destinations: Vancouver, Kelowna, Edmonton, Calgary and Winnipeg.', dur: DUR[4] },
  { text: 'Did you know? Yes or no. Drop your thoughts below.', dur: DUR[5] },
], { lead: .25, gap: .22, tail: 1.3 });
const sc = S.scenes;
const SRC = 'Source: Global News (Feb 29, 2016) · CTV Calgary';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const NAVY = { land: '#122848', park: '#17364a', water: '#2f6fa6', building: '#3b5378', road: '#2b4670', motorway: '#3f5f8f' };

// one jet silhouette design (continuity): nose points +x before rotation; s = length in px
function jet(c, x, y, s, rot = 0, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot); c.globalAlpha *= o.alpha ?? 1; c.fillStyle = o.color || '#ffffff';
  c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = s * .06;
  const L = s / 2, r = s * .055;
  c.beginPath(); c.moveTo(L, 0); c.quadraticCurveTo(L * .82, -r, L * .6, -r); c.lineTo(-L * .85, -r * .8); c.lineTo(-L, -r * .3); c.lineTo(-L, r * .3); c.lineTo(-L * .85, r * .8); c.lineTo(L * .6, r); c.quadraticCurveTo(L * .82, r, L, 0); c.fill();
  // swept wings
  c.beginPath(); c.moveTo(L * .2, -r); c.lineTo(-L * .25, -s * .5); c.lineTo(-L * .42, -s * .5); c.lineTo(-L * .12, -r); c.fill();
  c.beginPath(); c.moveTo(L * .2, r); c.lineTo(-L * .25, s * .5); c.lineTo(-L * .42, s * .5); c.lineTo(-L * .12, r); c.fill();
  // tail
  c.beginPath(); c.moveTo(-L * .72, -r); c.lineTo(-L * .95, -s * .2); c.lineTo(-L * 1.02, -s * .2); c.lineTo(-L * .9, -r); c.fill();
  c.beginPath(); c.moveTo(-L * .72, r); c.lineTo(-L * .95, s * .2); c.lineTo(-L * 1.02, s * .2); c.lineTo(-L * .9, r); c.fill();
  c.restore();
}
const bg = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#081428'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const band = (c, y0, y1, a = .72) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
// a wall-calendar page: month header + big day number; flip = 0..1 turns '28' into '29'
function calPage(c, x, y, w, h, flip) {
  c.save(); M.rr(c, x, y, w, h, 26); c.fillStyle = '#f7f4ec'; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 40; c.fill(); c.shadowBlur = 0;
  c.save(); M.rr(c, x, y, w, h * .24, 26); c.clip(); c.fillStyle = '#c8323c'; c.fillRect(x, y, w, h * .24); c.restore();
  M.text(c, 'FEBRUARY', x + w / 2, y + h * .06, { size: 72, weight: 800, align: 'center', color: '#fff', shadow: false, tracking: .08 });
  // rings
  c.fillStyle = '#2a2f3a'; for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(x + w * (.3 + .4 * i), y + 8, 16, 0, 7); c.fill(); }
  const cy = y + h * .3, ny = cy + 10;
  if (flip < 1) { // old page '28' folds up
    const k = M.ease.inCubic(Math.min(1, flip)); c.save(); c.translate(x + w / 2, cy); c.scale(1, 1 - k); c.globalAlpha = 1 - k * .6;
    M.text(c, '28', 0, 10, { size: 360, weight: 800, align: 'center', color: '#1b2533', shadow: false }); c.restore(); }
  if (flip > 0) { const k = M.ease.outBack(Math.min(1, flip)); c.save(); c.translate(x + w / 2, cy + (1 - k) * 80); c.globalAlpha = Math.min(1, flip * 2);
    M.text(c, '29', 0, 10, { size: 360, weight: 900, align: 'center', color: '#e0a21c', shadow: false }); c.restore(); }
  c.restore();
}

// five destinations at their true lat/lon (equirectangular, cos 51° x-scaling), claim C5
const CITIES = [['Vancouver', 49.28, -123.12], ['Kelowna', 49.89, -119.50], ['Edmonton', 53.55, -113.49], ['Calgary', 51.05, -114.07], ['Winnipeg', 49.90, -97.14]];

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // 0 HOOK: frame 0 already moving: calendar page flips 28 -> 29 (gold) while a jet streaks up across the frame; hook punches in from frame 0 (C1)
  { dur: sc[0].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      bg(c); const D = sc[0].sceneDur, z = M.lerp(1.0, 1.1, M.seg(t, 0, D, 'outCubic'));
      c.save(); c.translate(CX, 1095); c.scale(z * .85, z * .85); calPage(c, -330, -330, 660, 640, M.seg(t, .25, .75, 'linear')); c.restore();
      // jet streak with contrail, bottom-left -> upper-right
      const u = M.seg(t, 0, D * .95, 'inOutSine'), a0 = [-120, 1560], a1 = [1120, 760], jx = M.lerp(a0[0], a1[0], u), jy = M.lerp(a0[1], a1[1], u), ang = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]);
      const cg = c.createLinearGradient(a0[0], a0[1], jx, jy); cg.addColorStop(0, 'rgba(255,255,255,0)'); cg.addColorStop(1, 'rgba(255,255,255,.7)');
      c.strokeStyle = cg; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(Math.max(a0[0], jx - 700 * Math.cos(ang)), Math.max(0, jy - 700 * Math.sin(ang))); c.lineTo(jx, jy); c.stroke();
      jet(c, jx, jy, 230, ang);
      band(c, 260, 790, .55);
      M.kinetic(c, 'WestJet took off on a leap day', t, CX, 330, { t0: -.12, size: 124, maxW: 860, every: .08, highlight: ['leap', 'day'] });
  } },
  // 1 WHEN: February 1996 grid (Feb 1 = Thursday) ticks day by day; the extra square 29 slams in gold; stamp FEB 29, 1996 (C2)
  { dur: sc[1].sceneDur, trans: { kind: 'zoom', dur: .4 }, draw: (c, t) => {
      bg(c); const D = sc[1].sceneDur, gx = 105, gy = 720, cw = 118, ch = 104;
      M.text(c, 'FEBRUARY 1996', CX, gy - 80, { size: 48, weight: 800, align: 'center', color: M.house.grey, tracking: .12 });
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((d, i) => M.text(c, d, gx + i * cw + cw / 2, gy - 8, { size: 30, weight: 700, align: 'center', color: '#9fb0c8', shadow: false, base: 'bottom' }));
      const tick = M.seg(t, .05, D * .5, 'linear') * 28;
      for (let d = 1; d <= 29; d++) {
        const idx = d - 1 + 4, col = idx % 7, row = Math.floor(idx / 7), x = gx + col * cw, y = gy + 10 + row * ch;
        if (d <= 28) { const on = tick >= d - 1; if (!on) continue; const a = Math.min(1, tick - (d - 1));
          c.save(); c.globalAlpha = .35 + .5 * a; M.rr(c, x + 6, y + 6, cw - 12, ch - 12, 12); c.fillStyle = '#1b3a66'; c.fill(); c.restore();
          M.text(c, String(d), x + cw / 2, y + 26, { size: 40, weight: 700, align: 'center', color: '#fff', alpha: .5 + .5 * a, shadow: false }); }
        else { const k = M.seg(t, D * .55, D * .55 + .35, 'outBack'); if (k <= 0) continue; c.save(); c.translate(x + cw / 2, y + ch / 2); const s = M.lerp(2.4, 1, k); c.scale(s, s); c.globalAlpha = Math.min(1, k * 1.6);
          M.rr(c, -cw / 2 + 4, -ch / 2 + 4, cw - 8, ch - 8, 14); c.fillStyle = M.house.gold; c.fill(); M.text(c, '29', 0, -26, { size: 48, weight: 900, align: 'center', color: '#0b1f3a', shadow: false }); c.restore();
          const pr = M.seg(t, D * .6, D * .6 + 1.2, 'linear'); if (pr > 0 && pr < 1) { c.strokeStyle = `rgba(242,182,50,${1 - pr})`; c.lineWidth = 6; c.beginPath(); c.arc(x + cw / 2, y + ch / 2, 60 + pr * 120, 0, 7); c.stroke(); } }
      }
      const k = M.seg(t, D * .58, D * .58 + .35, 'outBack'); if (k > 0) { c.save(); c.translate(CX, 400); c.rotate(-.04); c.scale(M.lerp(1.8, 1, k), M.lerp(1.8, 1, k)); c.globalAlpha = Math.min(1, k * 1.5);
        M.rr(c, -390, -82, 780, 164, 24); c.fillStyle = 'rgba(7,13,24,.85)'; c.fill(); c.lineWidth = 8; c.strokeStyle = M.house.gold; c.stroke();
        M.text(c, 'FEB 29, 1996', 0, -62, { size: 120, weight: 800, align: 'center', color: '#fff' }); c.restore(); }   // C2
      M.chip(c, 'FIRST FLIGHT', CX, 505, { align: 'center', size: 56, alpha: M.seg(t, D * .7, D * .7 + .3) });
      M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 2 WHO/WHERE: dive over the real city onto downtown Calgary; pin; name card (C3)
  { dur: sc[2].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      const D = sc[2].sceneDur, w = M.world({ sky: 'blueprint', fog: { near: 12000, far: 50000, max: .5 } });
      M.geo.addBase(w, { buildings: true, colors: NAVY, windows: '#ffd27a', windowAlpha: .3 });
      M.ping(w, [0, 0, 0], t, { r: 110 });
      M.pin(w, [0, 0, 0], 'Calgary', { p: M.seg(t, .5, 1.0, 'linear'), size: 52, scale: 1.4 });
      w.render(c, M.camera(M.moves.dive([0, 300, 0], M.seg(t, 0, D, 'outCubic'), { h0: 26000, h1: 3200, back0: 1, back1: 3400, ahead: 200 }), W, H));
      band(c, 330, 860, .72);
      M.chip(c, 'CALGARY-BASED', CX, 370, { align: 'center', size: 56, alpha: M.seg(t, .2, .5) });
      M.kinetic(c, 'Clive Beddoe', t, CX, 500, { t0: 1.2, size: 112, upper: false, every: .12, maxW: 880, highlight: ['beddoe'] });
      M.text(c, '+ a team of partners', CX, 650, { size: 72, weight: 700, align: 'center', alpha: M.seg(t, 2.1, 2.5) });
      M.source(c, MAPC, 60, 1430, { size: 20 }); M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 3 HOW MUCH: counter slams to 3 while three jets roll in onto a runway line (C4)
  { dur: sc[3].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      bg(c); const D = sc[3].sceneDur;
      // runway in perspective
      c.fillStyle = '#16233a'; c.beginPath(); c.moveTo(80, 1240); c.lineTo(900, 1240); c.lineTo(700, 900); c.lineTo(280, 900); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 8; c.setLineDash([46, 34]); c.lineDashOffset = -t * 260; c.beginPath(); c.moveTo(CX, 1240); c.lineTo(CX, 900); c.stroke(); c.setLineDash([]);
      [[280, 1100], [CX, 1040], [740, 1100]].forEach((p, i) => { const k = M.seg(t, .1 + i * .28, .55 + i * .28, 'outCubic'); if (k <= 0) return; jet(c, M.lerp(1300, p[0], k), p[1], 250, -Math.PI / 2, { alpha: Math.min(1, k * 2) }); });
      M.counter(c, 3, M.seg(t, .05, .9), CX, 420, { size: 300, slam: true, decimals: 0 });          // C4
      M.text(c, 'planes to start', CX, 760, { size: 84, weight: 700, align: 'center', alpha: M.seg(t, .4, .7) });
      M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 4 WHERE: schematic western Canada card; five pins pop as they are named; counter 5 (C5)
  { dur: sc[4].sceneDur, trans: { kind: 'dissolve', dur: .4 }, draw: (c, t) => {
      bg(c); const D = sc[4].sceneDur, st = sc[4].start - sc[4].sceneStart, sp = sc[4].speech;
      M.counter(c, 5, M.seg(t, .05, .8), CX - 170, 360, { size: 220, slam: true, decimals: 0 });       // C5
      M.text(c, 'destinations', CX - 40, 430, { size: 84, weight: 700, alpha: M.seg(t, .3, .6) });
      // card
      const ck = M.seg(t, .1, .5, 'outCubic'); c.save(); c.globalAlpha = ck; M.rr(c, 60, 740, 900, 470, 26); c.fillStyle = '#12305a'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.3)'; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 2; for (let lon = -120; lon <= -100; lon += 5) { const x = 110 + (lon + 124) * 30; c.beginPath(); c.moveTo(x, 760); c.lineTo(x, 1190); c.stroke(); }
      for (let lat = 48; lat <= 56; lat += 2) { const y = 1100 - (lat - 49) * 50; c.beginPath(); c.moveTo(80, y); c.lineTo(940, y); c.stroke(); }
      M.text(c, 'N ↑', 935, 760, { size: 30, weight: 700, align: 'right', color: '#9fb0c8', shadow: false });
      M.text(c, 'schematic · positions approximate', 940, 1160, { size: 24, weight: 500, align: 'right', color: '#9fb0c8', shadow: false });
      const when = [.3, .45, .6, .74, .88];
      CITIES.forEach(([n, lat, lon], i) => {
        const x = 110 + (lon + 124) * 30, y = 1100 - (lat - 49) * 50;
        const k = M.seg(t, st + sp * when[i] - .25, st + sp * when[i] + .1, 'outBack'); if (k <= 0) return;
        c.fillStyle = n === 'Calgary' ? M.house.gold : '#ffffff'; c.beginPath(); c.arc(x, y, 14 * k, 0, 7); c.fill();
        const pr = M.seg(t, st + sp * when[i] - .1, st + sp * when[i] + .9, 'linear'); if (pr > 0 && pr < 1) { c.strokeStyle = `rgba(242,182,50,${1 - pr})`; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 14 + pr * 60, 0, 7); c.stroke(); }
        const up = n === 'Edmonton' || n === 'Kelowna', al = n === 'Winnipeg' ? 'right' : 'center', dx = n === 'Winnipeg' ? -10 : n === 'Vancouver' ? 30 : 0;
        M.text(c, n, x + dx, y + (up ? -66 : 22), { size: 40, weight: 700, align: al, alpha: Math.min(1, k), stroke: 5, strokeColor: '#06101f' });
      });
      c.restore();
      M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 5 QUESTION: one-word answer, held ~1.3 s after the voice; no end card (video under 2:00)
  { dur: sc[5].sceneDur, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
      const p = M.seg(t, 0, sc[5].sceneDur, 'linear');
      jet(c, M.lerp(-200, 1250, M.seg(t, 0, sc[5].sceneDur, 'linear')), 1560, 160, -.12, { alpha: .35 });
      M.closer(c, 'Did you know? Yes or no?', p, W, H, { highlight: ['yes', 'no'] });
      M.text(c, '🔗 See Calgary travel and tourism: link in the first comment', CX, 1370, { size: 34, weight: 600, align: 'center', color: M.house.gold, maxW: 860, alpha: M.seg(p, .35, .6) });
  } },
], overlay: (c, t, info) => {
  if (t > 3 && info.index < 5) M.header(c, window.LOGO, W, H);
  if (info.index < 5) M.caption(c, S.captionAt(t), W, H, { bottom: 1410 });
} });

window.CUES = () => [
  { t: 0.0, sfx: 'impact', gain: -5 }, { t: .2, sfx: 'whoosh', gain: -11 }, { t: .55, sfx: 'pop', gain: -11 },
  { t: sc[1].sceneStart - .2, sfx: 'whoosh', gain: -9 }, { t: sc[1].sceneStart + .1, sfx: 'ticks', dur: sc[1].sceneDur * .45, gain: -16 },
  { t: sc[1].sceneStart + sc[1].sceneDur * .55, sfx: 'stamp', gain: -7 },
  { t: sc[2].sceneStart - .2, sfx: 'whoosh', gain: -10 }, { t: sc[2].sceneStart + .6, sfx: 'pop', gain: -10 },
  { t: sc[3].sceneStart - .2, sfx: 'whoosh', gain: -10 }, { t: sc[3].sceneStart + .8, sfx: 'impact', gain: -9 },
  { t: sc[3].sceneStart + .2, sfx: 'pop', gain: -14 }, { t: sc[3].sceneStart + .48, sfx: 'pop', gain: -14 }, { t: sc[3].sceneStart + .76, sfx: 'pop', gain: -14 },
  ...[.3, .45, .6, .74, .88].map(f => ({ t: sc[4].start + sc[4].speech * f - .05, sfx: 'pop', gain: -12 })),
  { t: sc[5].sceneStart - .15, sfx: 'whoosh', gain: -12 },
];
window.TOTAL = () => S.total;
