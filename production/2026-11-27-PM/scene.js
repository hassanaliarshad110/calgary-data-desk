/* 2026-11-27 PM fun fact: "This Calgary mansion was once a blood donor clinic." (Lougheed House)
 * Lead identity Data Explainer (kinetic hook, stamps, chips, year slams), borrowing a Storyteller map dive over
 * real downtown/Beltline geography onto the Lougheed House pin (S0) and a Civic-style cumulative timeline that stays
 * lit (S1-S4). One stylised mansion drawing is the continuity anchor; no red cross emblem (blood-drop icon only).
 * Every on-screen fact maps to the audited claims table (packages/2026-11-27-PM-lougheed-blood-clinic.md, C1-C7;
 * audits/2026-11-27-PM.md).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30, THUMB = !!(window.PARAMS && window.PARAMS.thumb);
const DURS = (window.PARAMS && window.PARAMS.durs) ? window.PARAMS.durs.split(',').map(Number) : [2.880, 3.499, 3.733, 3.968, 2.539, 3.651];
const S = M.script([
  { text: 'This Calgary mansion was once a blood donor clinic.', dur: DURS[0] },
  { text: 'It was built in eighteen ninety-one for Senator James Lougheed.', dur: DURS[1] },
  { text: 'In nineteen thirty-four, the City took it over for unpaid taxes.', dur: DURS[2] },
  { text: 'Then it trained young women, and became army barracks for women in the war.', dur: DURS[3] },
  { text: 'Later, it was a Red Cross blood donor clinic.', dur: DURS[4] },
  { text: 'Did you know this? Yes or no. Drop your thoughts below.', dur: DURS[5] },
], { lead: .25, gap: .2, tail: .25 });
const sc = S.scenes, SPLIT = 1.6;
const SRC = 'Source: Lougheed House · Wikipedia (Lougheed House) · HistoricPlaces.ca';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const GOLD = M.house.gold, SAND = '#c99a5b', SAND2 = '#a87a42', ROOF = '#3d2f2a', RED = '#d8433b';
// C7: Wikipedia coordinates 51.040591 N, 114.07715 W -> metres from the geo pack origin (51.0447, -114.0719)
const LH = [(-114.07715 + 114.0719) * Math.cos(51.0447 * Math.PI / 180) * 111320, (51.040591 - 51.0447) * 110574, 0];

function navyBg(c, top = '#0e2b52', bot = '#081428') { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function dark(c, y0, y1, a = .62) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.2, `rgba(7,13,24,${a})`); g.addColorStop(.8, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); }
function stamp(c, txt, x, y, k, o = {}) {
  if (k <= 0) return; const sz = o.size || 96, s = M.lerp(1.8, 1, Math.min(1, k)); c.save(); c.translate(x, y); c.rotate(o.rot ?? -.05); c.scale(s, s); c.globalAlpha = Math.min(1, k * 1.5);
  c.font = M.font(sz, 800); const w = c.measureText(txt).width + 70, h = sz * 1.45;
  M.rr(c, -w / 2, -h / 2, w, h, 20); c.fillStyle = o.bg || 'rgba(7,13,24,.9)'; c.fill(); c.lineWidth = 9; c.strokeStyle = o.color || GOLD; c.stroke();
  M.text(c, txt, 0, -sz * .56, { size: sz, weight: 800, align: 'center', color: o.color || GOLD, shadow: false });
  c.restore();
}
function drop(c, x, y, r, k = 1, a = 1) {
  if (k <= 0) return; const s = Math.min(1.15, k) * r; c.save(); c.globalAlpha = a; c.translate(x, y);
  c.fillStyle = RED; c.beginPath(); c.moveTo(0, -s * 1.6); c.bezierCurveTo(s * .9, -s * .5, s, 0, s, s * .15); c.arc(0, s * .15, s, 0, Math.PI); c.bezierCurveTo(-s, 0, -s * .9, -s * .5, 0, -s * 1.6); c.fill();
  c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(-s * .38, -s * .05, s * .18, s * .32, -.4, 0, 7); c.fill(); c.restore();
}
// stylised sandstone mansion: round tower left, square tower right, central gable. (x, y) = ground centre, s = scale.
// o.win: 'lit' | 'dark' | 'bunks' | 'train'; o.k = rise 0..1
function mansion(c, x, y, s, o = {}) {
  const k = o.k == null ? 1 : o.k; if (k <= 0) return; c.save(); c.translate(x, y + (1 - Math.min(1, k)) * 500); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, 6, 360, 26, 0, 0, 7); c.fill();
  c.fillStyle = SAND; c.fillRect(-260, -300, 520, 300);                                   // main block
  c.fillStyle = SAND2; for (let r = 0; r < 10; r++) c.fillRect(-260, -300 + r * 30, 520, 3); // stone courses
  c.fillStyle = ROOF; c.beginPath(); c.moveTo(-280, -300); c.lineTo(-120, -420); c.lineTo(120, -420); c.lineTo(280, -300); c.closePath(); c.fill();
  c.fillStyle = SAND; c.beginPath(); c.moveTo(-90, -300); c.lineTo(0, -460); c.lineTo(90, -300); c.closePath(); c.fill(); // gable
  c.fillStyle = SAND; c.fillRect(-360, -380, 130, 380); c.fillStyle = ROOF; c.beginPath(); c.moveTo(-375, -380); c.lineTo(-295, -540); c.lineTo(-215, -380); c.closePath(); c.fill(); // round tower
  c.fillStyle = SAND; c.fillRect(230, -420, 120, 420); c.fillStyle = ROOF; c.beginPath(); c.moveTo(218, -420); c.lineTo(290, -520); c.lineTo(362, -420); c.closePath(); c.fill(); // square tower
  c.fillStyle = SAND2; c.fillRect(-360, -380, 130, 8); c.fillRect(230, -420, 120, 8);
  const win = o.win || 'lit', lit = win === 'dark' ? '#1b2333' : '#ffd88a';
  const wins = [[-325, -330], [-325, -200], [-325, -90], [265, -360], [265, -230], [265, -110], [-200, -240], [-110, -240], [80, -240], [170, -240], [-200, -120], [170, -120], [-28, -390]];
  wins.forEach(([wx, wy], i) => { c.fillStyle = '#2a1f1a'; c.fillRect(wx - 4, wy - 4, 64, 86); c.fillStyle = lit; c.fillRect(wx, wy, 56, 78);
    if (win === 'bunks' && i < 12) { c.fillStyle = '#5b6b3a'; c.fillRect(wx + 6, wy + 22, 44, 10); c.fillRect(wx + 6, wy + 52, 44, 10); }
    if (win === 'train' && i < 12) { c.fillStyle = '#2d4f86'; c.beginPath(); c.arc(wx + 28, wy + 30, 12, 0, 7); c.fill(); c.fillRect(wx + 14, wy + 44, 28, 30); } });
  c.fillStyle = '#4a2a1c'; c.fillRect(-45, -130, 90, 130); c.fillStyle = ROOF; c.fillRect(-70, -150, 140, 22); // door + porch
  c.restore();
}
// cumulative timeline, stays lit: stops 0..n lit, the newest pops with k
const STOPS = [['1891', 140], ['1934', 420], ['1938', 600], ['1941', 760], ['1950s', 930]];
function timeline(c, n, k = 1, y = 1105) {
  c.save(); c.lineCap = 'round'; c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 10; c.beginPath(); c.moveTo(90, y); c.lineTo(990, y); c.stroke();
  const xEnd = n < 0 ? 90 : M.lerp(n > 0 ? STOPS[n - 1][1] : 90, STOPS[n][1], Math.min(1, k * 1.4));
  c.strokeStyle = GOLD; c.lineWidth = 10; c.beginPath(); c.moveTo(90, y); c.lineTo(xEnd, y); c.stroke();
  STOPS.forEach(([lab, x], i) => { const on = i < n || (i === n && k > .5); const pop = i === n ? M.seg(k, .5, 1, 'outBack') : 1;
    c.fillStyle = on ? GOLD : '#5f7fa8'; c.beginPath(); c.arc(x, y, on ? 16 * (i === n ? Math.max(.4, pop) : 1) : 9, 0, 7); c.fill();
    M.text(c, lab, x, y + 26, { size: 40, weight: 800, align: 'center', color: on ? '#fff' : '#7f93b0' }); });
  c.restore();
}
function yearSlam(c, y0, y1, k, x, y, size = 150) { if (k <= 0) return; const v = k >= 1 ? y1 : Math.round(M.lerp(y0, y1, 1 - Math.pow(1 - k, 3)));
  M.text(c, String(v), x, y, { size, weight: 800, align: 'center', color: '#fff' });
  const s = M.seg(k, .85, 1, 'outBack'); if (s > 0 && s < 1) { c.save(); c.globalAlpha = (1 - s) * .5; M.text(c, String(y1), x, y, { size: size * (1 + .25 * (1 - s)), weight: 800, align: 'center', color: GOLD }); c.restore(); } }

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // S0 HOOK (0-1.6 s): frame 0 already diving over real downtown/Beltline buildings onto the Lougheed House pin; hook from frame 0 (C1, C7)
  { dur: SPLIT, trans: { kind: 'zoom', dur: .3 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 9000, far: 52000, max: .4 } }); M.geo.addBase(w, { buildings: true, roads: true });
      M.pin(w, LH, 'LOUGHEED HOUSE', { p: THUMB ? 1 : M.seg(t, .2, .7, 'linear'), size: 50, scale: 1.3 }); M.ping(w, LH, t, { r: 120 });
      const cam = M.camera(M.moves.dive(LH, THUMB ? .78 : M.seg(t, 0, SPLIT + .9, 'outCubic'), { h0: 12000, h1: 1500, back0: 1, back1: 2400, ahead: 150 }), W, H); w.render(c, cam);
      M.source(c, MAPC, 60, 1460, { size: 20 }); M.text(c, 'N ↑', 60, 1400, { size: 32, weight: 700, color: '#fff' });
      if (THUMB) return;
      dark(c, 150, 760, .66);
      M.kinetic(c, 'This mansion was a blood clinic', t, CX, 250, { t0: -.45, size: 124, maxW: 900, highlight: ['blood', 'clinic'], every: .09 });
  } },
  // S0b the twist picture: the mansion rises, a blood drop falls in and pulses (C1)
  { dur: sc[0].sceneDur - SPLIT, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      navyBg(c, '#1a3a66', '#0a1a30');
      c.fillStyle = '#132a45'; c.fillRect(0, 1250, W, 250);
      mansion(c, CX, 1250, 1.05, { k: M.seg(t, 0, .45, 'outCubic') });
      const dk = M.seg(t, .35, .7, 'outBounce'); drop(c, CX, M.lerp(700, 1040, dk), 46 * (1 + .08 * Math.sin(t * 9)), dk > 0 ? 1 : 0);
      dark(c, 150, 760, .5);
      M.kinetic(c, 'This mansion was a blood clinic', t + 5, CX, 250, { size: 124, maxW: 900, highlight: ['blood', 'clinic'] });
      M.source(c, SRC, 60, 1440, { size: 20 });
  } },
  // S1 1891: timeline starts; year slams; name (C2)
  { dur: sc[1].sceneDur, trans: { kind: 'whip', dur: .3 }, draw: (c, t) => {
      navyBg(c, '#0e2b52', '#081428');
      const k0 = M.seg(t, .05, .35, 'outBack'); if (k0 > 0) M.chip(c, 'BUILT', CX, 300, { align: 'center', size: 56, alpha: Math.min(1, k0) });
      yearSlam(c, 1850, 1891, M.seg(t, .1, 1.0, 'linear'), CX, 370);
      M.text(c, 'Senator', W / 2, 530, { size: 56, weight: 700, align: 'center', color: '#dfe7f2', alpha: M.seg(t, .9, 1.2) });
      const nk = M.seg(t, 1.1, 1.45, 'outBack'); if (nk > 0) { c.save(); c.translate(W / 2, 680); c.scale(M.lerp(1.4, 1, Math.min(1, nk)), M.lerp(1.4, 1, Math.min(1, nk))); M.text(c, 'JAMES', 0, -80, { size: 110, weight: 800, align: 'center', color: GOLD, alpha: Math.min(1, nk) }); M.text(c, 'LOUGHEED', 0, 35, { size: 110, weight: 800, align: 'center', color: GOLD, alpha: Math.min(1, nk) }); c.restore(); }
      mansion(c, CX, 1045, .38, { k: M.seg(t, .2, .7, 'outCubic') });
      timeline(c, 0, M.seg(t, .2, 1.0, 'inOutCubic'));
      M.source(c, SRC, 60, 1440, { size: 20 });
  } },
  // S2 1934: windows go dark; stamp "TAKEN FOR UNPAID TAXES" (C3)
  { dur: sc[2].sceneDur, trans: { kind: 'push', dur: .3 }, draw: (c, t) => {
      navyBg(c, '#13284a', '#0a1428');
      const k0 = M.seg(t, .05, .35, 'outBack'); if (k0 > 0) M.chip(c, 'CITY OF CALGARY', CX, 300, { align: 'center', size: 56, alpha: Math.min(1, k0) });
      yearSlam(c, 1891, 1934, M.seg(t, .05, .9, 'linear'), CX, 370);
      mansion(c, CX, 1045, .62, { win: t > .9 ? 'dark' : 'lit' });
      stamp(c, 'TAKEN FOR UNPAID TAXES', W / 2, 640, M.seg(t, 1.3, 1.6, 'outBack'), { size: 72, rot: -.07 });
      timeline(c, 1, M.seg(t, .1, .9, 'inOutCubic'));
      M.source(c, SRC, 60, 1440, { size: 20 });
  } },
  // S3 1938 then 1941: training program, then women's army barracks (C4, C5)
  { dur: sc[3].sceneDur, trans: { kind: 'whip', dur: .3 }, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      const half = sc[3].speech * .45, second = t > half;
      if (!second) { const k0 = M.seg(t, .05, .35, 'outBack'); if (k0 > 0) M.chip(c, 'TRAINING YOUNG WOMEN', CX, 300, { align: 'center', size: 56, alpha: Math.min(1, k0) });
        yearSlam(c, 1934, 1938, M.seg(t, .05, .6, 'linear'), CX, 370); }
      else { const k1 = M.seg(t, half, half + .3, 'outBack'); if (k1 > 0) M.chip(c, "WOMEN'S ARMY BARRACKS", CX, 300, { align: 'center', size: 56, alpha: Math.min(1, k1) });
        yearSlam(c, 1938, 1941, M.seg(t, half, half + .5, 'linear'), CX, 370); }
      mansion(c, CX, 1045, .62, { win: second ? 'bunks' : 'train' });
      if (second) M.text(c, 'Canadian Women’s Army Corps', CX, 560, { size: 52, weight: 700, align: 'center', color: '#dfe7f2', alpha: M.seg(t, half + .3, half + .6) });
      else M.text(c, 'Dominion Youth Training Program', CX, 560, { size: 52, weight: 700, align: 'center', color: '#dfe7f2', alpha: M.seg(t, .4, .7) });
      timeline(c, second ? 3 : 2, second ? M.seg(t, half, half + .6, 'inOutCubic') : M.seg(t, .05, .6, 'inOutCubic'));
      M.source(c, SRC, 60, 1440, { size: 20 });
  } },
  // S4 1950s: the payoff, blood drop over the door, stamp (C1, C6)
  { dur: sc[4].sceneDur, trans: { kind: 'push', dur: .3 }, draw: (c, t) => {
      navyBg(c, '#1a2d4f', '#0a1428');
      const k0 = M.seg(t, .05, .35, 'outBack'); if (k0 > 0) M.chip(c, 'RED CROSS', CX, 300, { align: 'center', size: 56, alpha: Math.min(1, k0) });
      M.text(c, '1950s', CX, 370, { size: 150, weight: 800, align: 'center', color: '#fff', alpha: M.seg(t, .05, .3) });
      mansion(c, CX, 1045, .62, { win: 'lit' });
      drop(c, CX, 925 + Math.sin(t * 6) * 6, 46, M.seg(t, .2, .6, 'outBack'));
      stamp(c, 'BLOOD DONOR CLINIC', W / 2, 640, M.seg(t, .7, 1.0, 'outBack'), { size: 80, color: '#ff6b5e' });
      timeline(c, 4, M.seg(t, .05, .7, 'inOutCubic'));
      M.source(c, SRC, 60, 1440, { size: 20 });
  } },
  // S5 QUESTION: no end card (under 2:00)
  { dur: sc[5].sceneDur, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      c.save(); c.globalAlpha = .35; mansion(c, CX, 1700, .55, { win: 'lit' }); c.restore();
      M.closer(c, 'Did you know this? Yes or no', M.seg(t, 0, sc[5].sceneDur, 'linear'), W, H, { highlight: ['yes', 'no'] });
  } },
], overlay: (c, t, info) => {
  if (THUMB) return;
  if (t > 3 && info.index < 6) M.header(c, window.LOGO, W, H);
  if (info.index < 6) M.caption(c, S.captionAt(t), W, H);
} });

const S1 = sc[1].sceneStart, S2 = sc[2].sceneStart, S3 = sc[3].sceneStart, S4 = sc[4].sceneStart, S5 = sc[5].sceneStart, HALF = S3 + sc[3].speech * .45;
window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.02, sfx: 'impact', gain: -5 }, { t: .45, sfx: 'pop', gain: -11 },
  { t: SPLIT - .15, sfx: 'whoosh', gain: -11 }, { t: SPLIT + .6, sfx: 'pop', gain: -9 },
  { t: S1 - .1, sfx: 'whoosh', gain: -10 }, { t: S1 + .1, sfx: 'ticks', dur: .9, gain: -14 }, { t: S1 + 1.0, sfx: 'impact', gain: -8 }, { t: S1 + 1.2, sfx: 'pop', gain: -11 },
  { t: S2 - .1, sfx: 'whoosh', gain: -10 }, { t: S2 + .05, sfx: 'ticks', dur: .8, gain: -14 }, { t: S2 + 1.4, sfx: 'stamp', gain: -7 },
  { t: S3 - .1, sfx: 'whoosh', gain: -10 }, { t: S3 + .5, sfx: 'pop', gain: -11 }, { t: HALF, sfx: 'pop', gain: -10 }, { t: HALF + .5, sfx: 'pop', gain: -11 },
  { t: S4 - .1, sfx: 'whoosh', gain: -10 }, { t: S4 + .4, sfx: 'pop', gain: -9 }, { t: S4 + .85, sfx: 'stamp', gain: -7 },
  { t: S5 - .15, sfx: 'whoosh', gain: -12 },
];
