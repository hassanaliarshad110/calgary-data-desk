/* 2026-11-15 PM fun fact: "Who was the Stephen in Stephen Avenue?"
 * Lead identity: Data Explainer (name card, stamps, chips, timeline dots, fast cuts); borrows a Storyteller 3D dive/orbit over
 * real downtown geography (S0, S3) and a parallax landscape (S4); a Civic-style document stamp for the bank (S2).
 * Every on-screen figure maps to the audited claims table in packages/2026-11-15-PM-stephen-avenue-name.md (claim numbers in comments).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DUR = (typeof PARAMS !== 'undefined' && PARAMS.durs) ? PARAMS.durs.split(',').map(Number) : [2.133, 4.011, 2.965, 2.56, 4.331, 2.731];   // measured Kokoro line durations (durs.json, studio-probe-out)
const S = M.script([
  { text: 'Who was the Stephen in Stephen Avenue?', dur: DUR[0] },
  { text: 'George Stephen, the first president of the Canadian Pacific Railway.', dur: DUR[1] },
  { text: 'Before that, he was president of the Bank of Montreal.', dur: DUR[2] },
  { text: 'The street took his name in eighteen eighty-four.', dur: DUR[3] },
  { text: 'He later became Baron Mount Stephen, after a Rockies peak beside the railway.', dur: DUR[4] },
  { text: 'Did you know? Yes or no? Drop your thoughts below.', dur: DUR[5] },
], { lead: .25, gap: .22, tail: 1.4 });
const sc = S.scenes;
const SRC_CITY = 'Source: City of Calgary heritage walking tour guides';
const SRC_DCB = 'Source: Dictionary of Canadian Biography (G. Stephen)';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const RED = '#d94848', GOLD = '#f2b632';
const THUMB = typeof PARAMS !== 'undefined' && PARAMS.thumb;
const NAVY = { land: '#122848', park: '#17364a', water: '#2f6fa6', building: '#3b5378', road: '#2b4670', motorway: '#3f5f8f', lrt: '#5a6f90', community: '#9fb0c8' };
// Stephen Avenue (OSM landmark node 4868829421 at [548, 97]); the street drawn along the same east-west line through the core (C6)
const STE = [548, 97, 0];
const STREET = [[-170, 97], [800, 97]];

const bg = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#081428'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const band = (c, y0, y1, a = .72) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const north = c => M.text(c, 'N ↑', 990, 300, { size: 34, weight: 700, align: 'right', color: '#dfe7f2', stroke: 4, strokeColor: '#06101f' });
function city(w, sweep) {
  M.geo.addBase(w, { buildings: true, colors: NAVY, windows: '#ffd27a', windowAlpha: .32, lineAlpha: .12 });
  const x1 = M.lerp(STREET[0][0], STREET[1][0], sweep);
  if (sweep > 0) w.line([STREET[0], [x1, 97]], { wm: 16, color: GOLD, order: 6, glow: true, minPx: 4 });
}
function stamp(c, s, y, k, o = {}) { if (k <= 0) return; c.save(); c.translate(o.x ?? CX, y); c.rotate(o.rot ?? -.04); const z = M.lerp(1.8, 1, k); c.scale(z, z); c.globalAlpha = Math.min(1, k * 1.5);
  c.font = M.font(o.size || 110, 800); const tw = c.measureText(s).width + 90, hh = (o.size || 110) * 1.5; M.rr(c, -tw / 2, -hh / 2, tw, hh, 24); c.fillStyle = 'rgba(7,13,24,.88)'; c.fill(); c.lineWidth = 8; c.strokeStyle = o.color || GOLD; c.stroke();
  M.text(c, s, 0, -(o.size || 110) * .56, { size: o.size || 110, weight: 800, align: 'center', color: o.textColor || '#fff' }); c.restore(); }
// timeline strip (continuity: always y=1180, dots in year order, not to scale)
const YEARS = [['1876', 'bank', 'C3'], ['1881', 'CPR', 'C2'], ['1884', 'street', 'C4'], ['1891', 'baron', 'C5']];
function timeline(c, shown, active, k = 1) {
  const y = 1180, x0 = 150, x1 = 930; c.save(); c.globalAlpha = k;
  c.strokeStyle = 'rgba(223,231,242,.45)'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0 - 40, y); c.lineTo(x1 + 40, y); c.stroke();
  YEARS.forEach(([yr, lab], i) => { const p = shown[i]; if (!p) return; const x = x0 + i * (x1 - x0) / 3, r = 16 * M.ease.outBack(Math.min(1, p));
    c.fillStyle = i === active ? GOLD : '#dfe7f2'; c.beginPath(); c.arc(x, y, Math.max(0, r), 0, 7); c.fill();
    M.text(c, yr, x, y - 92, { size: i === active ? 64 : 50, weight: 800, align: 'center', color: i === active ? GOLD : '#dfe7f2', alpha: Math.min(1, p), stroke: 5, strokeColor: '#06101f' });
    M.text(c, lab, x, y + 30, { size: 36, weight: 700, align: 'center', color: '#9fb0c8', alpha: Math.min(1, p), shadow: false }); });
  c.restore();
}
function trainSide(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s);
  // engine (dark, red stripe) + one car; schematic
  M.rr(c, 0, -90, 200, 80, 10); c.fillStyle = '#1d2733'; c.fill(); c.fillStyle = RED; c.fillRect(0, -40, 200, 10);
  c.fillStyle = '#1d2733'; c.fillRect(150, -140, 40, 52); c.fillRect(30, -120, 30, 32);
  M.rr(c, -230, -86, 210, 76, 8); c.fillStyle = '#7a4a2a'; c.fill(); c.fillStyle = '#f5d9a8'; for (let i = 0; i < 5; i++) c.fillRect(-212 + i * 40, -70, 24, 22);
  c.fillStyle = '#0e141c'; [20, 90, 160, -200, -60].forEach(q => { c.beginPath(); c.arc(q, -6, 16, 0, 7); c.fill(); }); c.restore(); }
function track(c, y, x0, x1) { c.strokeStyle = '#8b6b4a'; c.lineWidth = 8; for (let x = x0; x < x1; x += 34) { c.beginPath(); c.moveTo(x, y + 2); c.lineTo(x + 14, y + 18); c.stroke(); }
  c.strokeStyle = '#c9ced6'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // 0 HOOK (WHERE): frame 0 already diving over real downtown; Stephen Avenue sweeps on in gold; pin at 0.6 s (C1, C6)
  { dur: sc[0].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      const D = sc[0].sceneDur, w = M.world({ sky: 'dusk', fog: { near: 3000, far: 9000, max: .45 } });
      city(w, THUMB ? 1 : M.seg(t, 0, .9, 'outCubic'));
      M.pin(w, [STE[0], STE[1], 30], 'Stephen Avenue', { p: THUMB ? 1 : M.seg(t, .6, 1.1, 'linear'), size: 48, scale: 1.2 });
      w.render(c, M.camera(M.moves.dive(STE, THUMB ? 1 : .25 + .75 * M.seg(t, 0, D, 'outCubic'), { h0: 2600, h1: 520, back0: 300, back1: 900, ahead: 80 }), W, H));
      if (THUMB) return;
      band(c, 250, 760, .66);
      M.kinetic(c, 'Who was Stephen?', t, CX, 330, { t0: -.12, size: 150, maxW: 900, every: .1, highlight: ['Stephen?'] });   // hook (no claim)
      north(c); M.source(c, MAPC, 60, 1466, { size: 20 });
  } },
  // 1 WHO + WHEN: name card, a railway draws across, train runs; timeline drops 1881 (C2)
  { dur: sc[1].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      bg(c); const D = sc[1].sceneDur;
      // prairie horizon
      c.fillStyle = '#1a3352'; c.fillRect(0, 880, W, 140); c.fillStyle = '#243f2e'; c.fillRect(0, 960, W, 60);
      const tk = M.seg(t, .1, .9, 'outCubic'); track(c, 960, 0, W * tk);
      trainSide(c, M.lerp(-260, 1300, M.seg(t, .7, D + .3, 'inOutSine')), 958, 1);
      stamp(c, 'GEORGE STEPHEN', 400, M.seg(t, 0, .35, 'outBack'), { size: 110, rot: 0 });                                   // C1
      M.chip(c, '1st PRESIDENT', CX, 560, { align: 'center', size: 56, bg: RED, color: '#fff', alpha: M.seg(t, .6, 1.0) });   // C2
      M.text(c, 'Canadian Pacific Railway', CX, 660, { size: 72, weight: 800, align: 'center', alpha: M.seg(t, .8, 1.2) });   // C2
      timeline(c, [0, M.seg(t, 1.2, 1.6), 0, 0], 1);                                                                      // C2 1881
      M.source(c, SRC_CITY + ' · ' + 'DCB', 60, 1466, { size: 20 });
  } },
  // 2 BEFORE: timeline pushes back, 1876 drops left; schematic bank facade rises; BANK OF MONTREAL stamp (C3)
  { dur: sc[2].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      bg(c); const D = sc[2].sceneDur, rise = M.seg(t, 0, .7, 'outCubic');
      c.save(); c.translate(0, (1 - rise) * 300); c.globalAlpha = rise;
      const bx = 220, by = 1040; c.fillStyle = '#c9c2b2';
      c.beginPath(); c.moveTo(bx - 40, by - 360); c.lineTo(CX, by - 470); c.lineTo(1000 - bx + 40 + 60, by - 360); c.closePath(); c.fill();
      c.fillRect(bx - 40, by - 360, 700, 40); c.fillRect(bx - 60, by - 20, 740, 40);
      for (let i = 0; i < 6; i++) { c.fillStyle = '#ddd6c6'; c.fillRect(bx + i * 120, by - 320, 52, 300); }
      c.restore();
      M.text(c, 'schematic', 1000, by + 40, { size: 26, weight: 500, align: 'right', color: '#9fb0c8', shadow: false });
      stamp(c, 'BANK OF MONTREAL', 360, M.seg(t, .35, .7, 'outBack'), { size: 88 });                                         // C3
      M.text(c, 'president from 1876', CX, 500, { size: 72, weight: 800, align: 'center', alpha: M.seg(t, .8, 1.2), highlight: ['1876'] });  // C3
      timeline(c, [M.seg(t, .9, 1.3), 1, 0, 0], 0);                                                                       // C3 1876, C2 1881
      M.source(c, SRC_DCB, 60, 1466, { size: 20 });
  } },
  // 3 WHAT CHANGED: dusk orbit over the real street; sign flips to STEPHEN AVE; stamp 1884 (C4)
  { dur: sc[3].sceneDur, trans: { kind: 'zoom', dur: .4 }, draw: (c, t) => {
      const D = sc[3].sceneDur, w = M.world({ sky: 'dusk', fog: { near: 2500, far: 8000, max: .4 } });
      city(w, 1);
      w.render(c, M.camera(M.moves.orbit(STE, 620, 300, 230, 35, M.seg(t, 0, D, 'inOutSine')), W, H));
      band(c, 260, 820, .72);
      // street sign flip
      const f = M.seg(t, .15, .6, 'outBack'), sx = CX, sy = 400; c.save(); c.translate(sx, sy); c.scale(1, Math.max(.02, Math.abs(Math.cos((1 - f) * Math.PI / 2 * 2)) ));
      M.rr(c, -400, -90, 800, 180, 18); c.fillStyle = f > .5 ? '#1f6b3a' : '#28456e'; c.fill(); c.lineWidth = 8; c.strokeStyle = '#fff'; c.stroke();
      if (f > .5) M.text(c, 'STEPHEN AVE', 0, -62, { size: 110, weight: 800, align: 'center', color: '#fff', shadow: false });   // C1/C4
      c.restore();
      stamp(c, '1884', 640, M.seg(t, .7, 1.0, 'outBack'), { size: 100, rot: .05 });                                           // C4
      timeline(c, [1, 1, M.seg(t, .8, 1.2), 0], 2);
      M.source(c, MAPC, 60, 1430, { size: 20 }); M.source(c, SRC_CITY, 60, 1466, { size: 20 });
  } },
  // 4 TWIST: parallax Rockies (schematic), one peak lifts and is labelled; railway along the valley; 1891 (C5)
  { dur: sc[4].sceneDur, trans: { kind: 'dissolve', dur: .4 }, draw: (c, t) => {
      const D = sc[4].sceneDur, p = M.seg(t, 0, D, 'inOutSine');
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a4a78'); g.addColorStop(.6, '#f2b28a'); g.addColorStop(1, '#3a2f3a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const range = (seed, base, amp, col, shift, lift = 0) => { const r = M.rng(seed); c.fillStyle = col; c.beginPath(); c.moveTo(-200, H);
        for (let x = -200; x <= W + 200; x += 90) { const peak = (x > 380 && x < 560 && lift) ? lift : 0; c.lineTo(x + shift, base - amp * (.4 + .6 * r()) - peak); } c.lineTo(W + 200, H); c.closePath(); c.fill(); };
      range(7, 900, 260, '#5c6f8f', -60 * p);
      range(11, 1000, 200, '#3d4f6d', -140 * p, 380 * M.seg(t, .3, 1.3, 'outCubic'));
      range(19, 1080, 120, '#26344a', -260 * p);
      c.fillStyle = '#1b2533'; c.fillRect(0, 1060, W, 400); track(c, 1075, 0, W);
      trainSide(c, M.lerp(1350, -300, M.seg(t, .2, D, 'linear')), 1073, .8);
      // peak label
      const lk = M.seg(t, 1.0, 1.4); c.save(); c.globalAlpha = lk; c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.moveTo(470 - 140 * p, 560); c.lineTo(470 - 140 * p, 640); c.stroke(); c.restore();
      M.chip(c, 'a Rockies peak beside the CPR line', CX, 700, { align: 'center', size: 48, alpha: lk });                // C5
      band(c, 260, 600, .7);
      M.kinetic(c, 'BARON MOUNT STEPHEN', t, CX, 300, { t0: .05, size: 110, maxW: 900, every: .1, highlight: ['MOUNT', 'STEPHEN'] });  // C5
      timeline(c, [1, 1, 1, M.seg(t, 1.6, 2.0)], 3);                                                                      // C5 1891
      M.text(c, 'schematic', 1000, 860, { size: 26, weight: 500, align: 'right', color: '#9fb0c8', shadow: false });
      M.source(c, SRC_DCB, 60, 1466, { size: 20 });
  } },
  // 5 QUESTION: one-word answer, held ~1.4 s after the voice; no end card (video under 2:00)
  { dur: sc[5].sceneDur, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
      const p = M.seg(t, 0, sc[5].sceneDur, 'linear');
      c.save(); c.globalAlpha = .35; c.strokeStyle = GOLD; c.lineWidth = 12; c.beginPath(); c.moveTo(-50, 1560); c.lineTo(1130, 1560); c.stroke(); c.restore();
      M.closer(c, 'Did you know? Yes or no?', p, W, H, { highlight: ['yes', 'no'] });
  } },
], overlay: (c, t, info) => {
  if (THUMB) return;
  if (t > 3 && info.index < 5) M.header(c, window.LOGO, W, H);
  if (info.index < 5) M.caption(c, S.captionAt(t), W, H, { bottom: 1410 });
} });

window.CUES = () => [
  { t: 0.0, sfx: 'impact', gain: -5 }, { t: .2, sfx: 'whoosh', gain: -11 }, { t: .75, sfx: 'pop', gain: -11 },
  { t: sc[1].sceneStart - .2, sfx: 'whoosh', gain: -9 }, { t: sc[1].sceneStart + .1, sfx: 'stamp', gain: -8 },
  { t: sc[1].sceneStart + .8, sfx: 'ticks', dur: Math.max(.5, sc[1].sceneDur - 1), gain: -17 }, { t: sc[1].sceneStart + 1.3, sfx: 'pop', gain: -12 },
  { t: sc[2].sceneStart - .2, sfx: 'whoosh', gain: -10 }, { t: sc[2].sceneStart + .45, sfx: 'stamp', gain: -7 }, { t: sc[2].sceneStart + 1.0, sfx: 'pop', gain: -12 },
  { t: sc[3].sceneStart - .2, sfx: 'whoosh', gain: -10 }, { t: sc[3].sceneStart + .35, sfx: 'pop', gain: -10 }, { t: sc[3].sceneStart + .8, sfx: 'stamp', gain: -8 },
  { t: sc[4].sceneStart - .2, sfx: 'whoosh', gain: -11 }, { t: sc[4].sceneStart + .4, sfx: 'ticks', dur: Math.max(.5, sc[4].sceneDur - 1), gain: -18 }, { t: sc[4].sceneStart + 1.7, sfx: 'pop', gain: -12 },
  { t: sc[5].sceneStart - .15, sfx: 'whoosh', gain: -12 },
];
window.TOTAL = () => S.total;
