/* 2026-11-16 PM fun fact: "A provincial park inside Calgary: Fish Creek"
 * Lead identity: Data Explainer (stamps, chips, timeline dots, fast cuts); borrows a Storyteller 3D dive/orbit/fly over
 * real south-Calgary geography (S0, S1, S4) and a parallax landscape that transforms (S2, S3).
 * Every on-screen figure maps to the audited claims table in packages/2026-11-16-PM-fish-creek-provincial-park.md (claim numbers in comments).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DUR = (typeof PARAMS !== 'undefined' && PARAMS.durs) ? PARAMS.durs.split(',').map(Number) : [2.731, 3.264, 3.819, 2.773, 3.755, 3.413];   // measured Kokoro line durations (durs.json, studio-probe-out)
const S = M.script([
  { text: 'Calgary has a provincial park inside the city.', dur: DUR[0] },
  { text: 'Fish Creek is one of the largest urban parks in Canada.', dur: DUR[1] },
  { text: 'For thousands of years, First Nations hunted bison in this valley.', dur: DUR[2] },
  { text: 'In nineteen-oh-two, Pat Burns bought the ranch here.', dur: DUR[3] },
  { text: 'The province bought it, and the park opened in nineteen seventy-five.', dur: DUR[4] },
  { text: 'Have you walked Fish Creek? Yes or no? Drop your thoughts below.', dur: DUR[5] },
], { lead: .25, gap: .22, tail: .55 });   // tail .55: closing question to last frame <= 4 s (PLAYBOOK 3)
const sc = S.scenes;
const SRC_AP = 'Source: Alberta Parks (Fish Creek Provincial Park)';
const SRC_HIST = 'Source: Alberta Parks, Fish Creek history';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const GOLD = '#f2b632', GREEN = '#5fbf6a';
const THUMB = typeof PARAMS !== 'undefined' && PARAMS.thumb;
const NAVY = { land: '#122848', park: '#17364a', water: '#2f6fa6', building: '#3b5378', road: '#2b4670', motorway: '#3f5f8f', lrt: '#5a6f90', community: '#9fb0c8' };
const PIN = M.geo.lm('Fish Creek Provincial Park') || [-885, -12196, 0];          // OSM node/1802319980 (C9)
const NEAR = ['CANYON MEADOWS', 'LAKE BONAVISTA', 'MIDNAPORE', 'SUNDANCE', 'PARKLAND', 'DEER RUN', 'DEER RIDGE', 'WOODBINE', 'WOODLANDS', 'EVERGREEN', 'SHAWNEE SLOPES', 'MILLRISE', 'MCKENZIE LAKE', 'ALPINE PARK'];   // communities touching the creek corridor (C2b)
let CREEK = null;
const creek = () => CREEK || (CREEK = M.geo.riverPath('Fish Creek', [-200, -13300], 6200));   // in-park stretch, 37 St SW to the Bow (C9)
const partial = (pts, k) => pts.slice(0, Math.max(2, Math.round(pts.length * k)));
const at = (pts, k) => { const p = pts[Math.min(pts.length - 1, Math.max(0, Math.round((pts.length - 1) * k)))]; return [p[0], p[1], 0]; };

const bg = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#081428'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const band = (c, y0, y1, a = .72) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.16, `rgba(7,13,24,${a})`); g.addColorStop(.84, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const north = c => M.text(c, 'N ↑', 940, 300, { size: 34, weight: 700, align: 'right', color: '#dfe7f2', stroke: 4, strokeColor: '#06101f' });
function map(w, o = {}) {
  M.geo.addBase(w, { buildings: false, colors: NAVY, communities: true, highlightCommunity: 'FISH CREEK PARK', hiColor: GREEN, hiAlpha: o.hiAlpha ?? .35, lineAlpha: .1, riverW: 90 });
  const pts = creek(); if (pts.length > 1) w.line(partial(pts, o.sweep ?? 1), { wm: 70, color: GOLD, order: 6, glow: true, minPx: 4 });
}
function stamp(c, s, y, k, o = {}) { if (k <= 0) return; c.save(); c.translate(o.x ?? CX, y); c.rotate(o.rot ?? -.04); const z = M.lerp(1.8, 1, k); c.scale(z, z); c.globalAlpha = Math.min(1, k * 1.5);
  const sz = o.size || 110; c.font = M.font(sz, 800); const tw = c.measureText(s).width + 90, hh = sz * 1.5; M.rr(c, -tw / 2, -hh / 2, tw, hh, 24); c.fillStyle = 'rgba(7,13,24,.88)'; c.fill(); c.lineWidth = 8; c.strokeStyle = o.color || GOLD; c.stroke();
  M.text(c, s, 0, -sz * .56, { size: sz, weight: 800, align: 'center', color: o.textColor || '#fff' }); c.restore(); }
// timeline strip (continuity: always y=840, dots in date order, not to scale)
const YEARS = [['6500 BC', ['people', 'arrive']], ['2500 BC', ['bison', 'pounds']], ['1800s', ['last bison', 'pounds']], ['1902', ['Burns', 'ranch']], ['1975', ['park', 'opens']]];   // C3, C4, C4, C5, C8
function timeline(c, shown, active, k = 1) {
  const y = 840, x0 = 140, x1 = 860; c.save(); c.globalAlpha = k;
  { const g = c.createLinearGradient(0, y - 150, 0, y + 150); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.25, 'rgba(7,13,24,.62)'); g.addColorStop(.75, 'rgba(7,13,24,.62)'); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y - 150, W, 300); }
  c.strokeStyle = 'rgba(223,231,242,.45)'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0 - 50, y); c.lineTo(x1 + 50, y); c.stroke();
  YEARS.forEach(([yr, lab], i) => { const p = shown[i]; if (!p) return; const x = x0 + i * (x1 - x0) / 4, r = 15 * M.ease.outBack(Math.min(1, p)), a = Math.min(1, p);
    c.fillStyle = i === active ? GOLD : '#dfe7f2'; c.beginPath(); c.arc(x, y, Math.max(0, r), 0, 7); c.fill();
    M.text(c, yr, x, y - (i === active ? 82 : 66), { size: i === active ? 52 : 40, weight: 800, align: 'center', color: i === active ? GOLD : '#dfe7f2', alpha: a, stroke: 5, strokeColor: '#06101f' });
    lab.forEach((l, j) => M.text(c, l, x, y + 26 + j * 36, { size: 32, weight: 700, align: 'center', color: '#9fb0c8', alpha: a, shadow: false })); });
  M.text(c, 'not to scale', x1 + 50, y + 104, { size: 22, weight: 500, align: 'right', color: '#6f84a3', alpha: k, shadow: false });
  c.restore();
}
// the valley (schematic; same horizon and creek bend in S2 and S3)
function valley(c, t, p, mood) {
  const g = c.createLinearGradient(0, 0, 0, H);
  if (mood === 'dawn') { g.addColorStop(0, '#1d3a66'); g.addColorStop(.42, '#e9a26f'); g.addColorStop(.62, '#5a4a4a'); }
  else { g.addColorStop(0, '#2a5a8c'); g.addColorStop(.42, '#f2c78a'); g.addColorStop(.62, '#4f5a4a'); }
  g.addColorStop(1, '#1b2418'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const range = (seed, base, amp, col, shift) => { const r = M.rng(seed); c.fillStyle = col; c.beginPath(); c.moveTo(-300, H);
    for (let x = -300; x <= W + 300; x += 110) c.lineTo(x + shift, base - amp * (.3 + .7 * r())); c.lineTo(W + 300, H); c.closePath(); c.fill(); };
  range(5, 860, 120, '#56688a', -40 * p);
  range(9, 940, 90, '#3f5a46', -110 * p);
  c.fillStyle = '#34503a'; c.fillRect(0, 930, W, 700);
  // trees along the creek
  const tr = M.rng(21); for (let i = 0; i < 26; i++) { const x = ((i * 53 + tr() * 40) - 200 * p) % (W + 120) - 60, y = 975 + tr() * 30, h = 50 + tr() * 50; c.fillStyle = '#244031'; c.beginPath(); c.moveTo(x, y - h); c.lineTo(x - h * .32, y); c.lineTo(x + h * .32, y); c.closePath(); c.fill(); }
  // the creek (same bend in both scenes)
  c.strokeStyle = '#4f8fc4'; c.lineWidth = 22; c.lineCap = 'round'; c.beginPath(); c.moveTo(-40, 1100); c.bezierCurveTo(260, 1020, 520, 1150, 760, 1060); c.lineTo(1120, 1040); c.stroke();
  M.text(c, 'schematic', 1000, 1500, { size: 26, weight: 500, align: 'right', color: '#dfe7f2', alpha: .7, shadow: false });
}
function bison(c, x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#2a1d16';
  c.beginPath(); c.ellipse(0, -40, 70, 34, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(-46, -58, 36, 34, 0, 0, 7); c.fill();       // body + hump
  c.beginPath(); c.ellipse(-82, -34, 22, 20, 0, 0, 7); c.fill();                                                                // head
  const k = Math.sin(t * 9) * 8; [[-40, k], [-20, -k], [30, -k], [50, k]].forEach(([lx, sw]) => { c.fillRect(lx + sw * .2, -16, 12, 40); });   // walking legs
  c.restore(); }
function ranch(c, k) { if (k <= 0) return; c.save(); c.translate(720, 1150); c.scale(.8, .8); c.globalAlpha = Math.min(1, k * 1.4);  c.fillStyle = '#e8dcc4'; c.fillRect(-150, -150, 300, 150); c.fillStyle = '#7a3b2a'; c.beginPath(); c.moveTo(-175, -150); c.lineTo(0, -250); c.lineTo(175, -150); c.closePath(); c.fill();
  c.fillStyle = '#e8dcc4'; c.fillRect(-170, -60, 340, 12); c.fillStyle = '#2b3a4a'; [-110, -40, 40, 110].forEach(x => c.fillRect(x - 16, -120, 32, 40)); c.fillRect(-18, -60, 36, 60); c.restore(); }
function fence(c, k) { if (k <= 0) return; const x1 = M.lerp(-20, W + 20, k); c.strokeStyle = '#d9c7a3'; c.lineWidth = 7;
  for (const yy of [1170, 1205]) { c.beginPath(); c.moveTo(-20, yy); c.lineTo(x1, yy); c.stroke(); }
  c.lineWidth = 10; for (let x = 0; x < x1; x += 90) { c.beginPath(); c.moveTo(x, 1150); c.lineTo(x, 1240); c.stroke(); } }

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // 0 HOOK (WHERE): frame 0 already diving over the real city map toward south Calgary; Fish Creek sweeps on; park lights green; pin at 0.6 s (C1, C9)
  { dur: sc[0].sceneDur, trans: { kind: 'zoom', dur: .4 }, draw: (c, t) => {
      const D = sc[0].sceneDur, w = M.world({ sky: 'dusk', fog: { near: 20000, far: 70000, max: .4 } });
      map(w, { sweep: THUMB ? 1 : .15 + .85 * M.seg(t, 0, 1.0, 'outCubic'), hiAlpha: THUMB ? .5 : .15 + .35 * M.seg(t, .3, 1.2) });
      M.pin(w, [PIN[0], PIN[1], 40], 'Fish Creek Provincial Park', { p: THUMB ? 1 : M.seg(t, .6, 1.1, 'linear'), size: 50, scale: 1.3 });
      w.render(c, M.camera(M.moves.dive([PIN[0], PIN[1] - 600, 0], THUMB ? .55 : .2 + .75 * M.seg(t, 0, D, 'outCubic'), { h0: 34000, h1: 7000, back0: 1, back1: 9000, ahead: 200 }), W, H));
      if (THUMB) return;
      band(c, 250, 880, .66);
      M.kinetic(c, 'A provincial park inside Calgary', t, CX, 320, { t0: -.12, size: 132, maxW: 880, every: .09, highlight: ['park', 'calgary'] });   // C1
      north(c); M.source(c, MAPC, 60, 1466, { size: 20 });
  } },
  // 1 HOW BIG (in words): low orbit over the park; neighbouring communities light up around it; stamp + chip (C2, C2b)
  { dur: sc[1].sceneDur, trans: { kind: 'dissolve', dur: .4 }, draw: (c, t) => {
      const D = sc[1].sceneDur, w = M.world({ sky: 'dusk', fog: { near: 14000, far: 45000, max: .4 } });
      map(w, { hiAlpha: .5 });
      const g = M.geo.get(); if (g && g.communities) g.communities.items.forEach(it => { const i = NEAR.indexOf(it.name); if (i < 0) return;
        const k = M.seg(t, .3 + i * .1, .6 + i * .1); if (k <= 0) return; it.polys.forEach(poly => w.area(poly, { fill: '#ffffff', alpha: .10 * k, stroke: '#ffffff', strokeAlpha: .8 * k, sw: 3, order: 3 })); });
      w.render(c, M.camera(M.moves.orbit([PIN[0] + 400, PIN[1] - 1200, 0], 11000, 8200, 250, 22, M.seg(t, 0, D, 'inOutSine')), W, H));
      band(c, 250, 1000, .74);
      M.kinetic(c, "One of Canada's largest urban parks", t, CX, 300, { t0: 0, size: 112, maxW: 860, every: .07, highlight: ['largest', 'urban'] });   // C2
      M.chip(c, 'thousands of homes around it', CX, 820, { align: 'center', size: 52, bg: GREEN, color: '#06101f', alpha: M.seg(t, 1.0, 1.4) });     // C2b
      north(c); M.source(c, MAPC, 60, 1430, { size: 20 }); M.source(c, SRC_AP, 60, 1466, { size: 20 });
  } },
  // 2 DEEP TIME (WHEN): dawn valley, bison walk across; timeline drops 6500 BC, 2500 BC, 1800s (C3, C4)
  { dur: sc[2].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      const D = sc[2].sceneDur, p = M.seg(t, 0, D, 'linear'); valley(c, t, p, 'dawn');
      [[0, 1040, .9], [210, 1080, 1.1], [420, 1030, .8], [600, 1090, 1.0]].forEach(([o, y, s]) => bison(c, M.lerp(-250 - o, 1300 - o, M.seg(t, 0, D + .4, 'linear')), y, s, t + o));
      band(c, 240, 640, .7);
      M.kinetic(c, 'Thousands of years', t, CX, 320, { t0: .05, size: 130, maxW: 880, every: .1, highlight: ['thousands'] });   // C3
      timeline(c, [M.seg(t, .6, 1.0), M.seg(t, 1.2, 1.6), M.seg(t, 1.8, 2.2), 0, 0], t < 1.2 ? 0 : t < 1.8 ? 1 : 2);   // C3, C4
      M.source(c, SRC_HIST, 60, 1466, { size: 20 });
  } },
  // 3 RANCH (WHAT CHANGED): same valley in daylight; fence draws, ranch house rises at the bend; PAT BURNS, BOW VALLEY RANCH, 1902 (C5, C6)
  { dur: sc[3].sceneDur, trans: { kind: 'flash', dur: .25 }, draw: (c, t) => {
      const D = sc[3].sceneDur, p = M.seg(t, 0, D, 'linear'); valley(c, t, .4 + p, 'day');
      ranch(c, M.seg(t, .1, .7)); fence(c, M.seg(t, .2, 1.4, 'outCubic'));
      band(c, 240, 760, .72);
      M.kinetic(c, 'Pat Burns', t, CX, 300, { t0: 0, size: 120, maxW: 880, every: .1, highlight: ['burns'] });                                    // C5
      M.chip(c, 'BOW VALLEY RANCH', CX, 452, { align: 'center', size: 56, bg: GOLD, color: '#06101f', alpha: M.seg(t, .4, .8) });               // C5, C6
      stamp(c, '1902', 668, M.seg(t, .6, .9, 'outBack'), { size: 100, rot: .05 });                                                              // C5
      timeline(c, [1, 1, 1, M.seg(t, .7, 1.1), 0], 3);
      M.source(c, SRC_HIST, 60, 1466, { size: 20 });
  } },
  // 4 PARK (WHAT CHANGED): back to the real map; fly west to east along the glowing creek, ending over its eastern end; chip + OPENED 1975 (C7, C8)
  { dur: sc[4].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      const D = sc[4].sceneDur, pts = creek(), u = M.seg(t, 0, D, 'inOutSine');
      const w = M.world({ sky: 'dusk', fog: { near: 9000, far: 30000, max: .4 } }); map(w, { hiAlpha: .55 });
      const lookP = at(pts, .25 + .73 * u), camP = at(pts, .08 + .73 * u);
      w.render(c, M.camera({ pos: [camP[0], camP[1] - 4200, 3000], look: [lookP[0], lookP[1] + 1500, 0], fov: 52 }, W, H));
      band(c, 240, 820, .74);
      stamp(c, 'OPENED 1975', 360, M.seg(t, .2, .55, 'outBack'), { size: 110 });                                                          // C8
      M.chip(c, 'RANCH BOUGHT BY THE PROVINCE', CX, 560, { align: 'center', size: 50, bg: GREEN, color: '#06101f', alpha: M.seg(t, 1.4, 1.8) });     // C7
      timeline(c, [1, 1, 1, 1, M.seg(t, .4, .8)], 4);
      north(c); M.source(c, MAPC, 60, 1430, { size: 20 }); M.source(c, SRC_HIST, 60, 1466, { size: 20 });
  } },
  // 5 QUESTION: one-word answer, held ~1.4 s after the voice; no end card (video under 2:00)
  { dur: sc[5].sceneDur, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
      const p = M.seg(t, 0, sc[5].sceneDur, 'linear');
      c.save(); c.globalAlpha = .35; c.strokeStyle = GREEN; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.moveTo(-40, 1560); c.bezierCurveTo(300, 1480, 640, 1640, 1120, 1530); c.stroke(); c.restore();
      M.closer(c, 'Have you walked Fish Creek? Yes or no?', p, W, H, { highlight: ['yes', 'no'] });
  } },
], overlay: (c, t, info) => {
  if (THUMB) return;
  if (t > 3 && info.index < 5) M.header(c, window.LOGO, W, H);
  if (info.index < 5) M.caption(c, S.captionAt(t), W, H, { bottom: 1410 });
} });

window.CUES = () => [
  { t: 0.0, sfx: 'impact', gain: -5 }, { t: .2, sfx: 'whoosh', gain: -11 }, { t: .75, sfx: 'pop', gain: -11 },
  { t: sc[1].sceneStart - .2, sfx: 'whoosh', gain: -10 }, { t: sc[1].sceneStart + .35, sfx: 'stamp', gain: -9 }, { t: sc[1].sceneStart + 1.05, sfx: 'pop', gain: -12 },
  { t: sc[2].sceneStart - .2, sfx: 'whoosh', gain: -10 }, { t: sc[2].sceneStart + .2, sfx: 'ticks', dur: Math.max(.5, sc[2].sceneDur - .6), gain: -19 },
  { t: sc[2].sceneStart + .6, sfx: 'pop', gain: -13 }, { t: sc[2].sceneStart + 1.2, sfx: 'pop', gain: -13 }, { t: sc[2].sceneStart + 1.8, sfx: 'pop', gain: -13 },
  { t: sc[3].sceneStart - .1, sfx: 'whoosh', gain: -11 }, { t: sc[3].sceneStart + .45, sfx: 'pop', gain: -12 }, { t: sc[3].sceneStart + .7, sfx: 'stamp', gain: -8 },
  { t: sc[4].sceneStart - .2, sfx: 'whoosh', gain: -9 }, { t: sc[4].sceneStart + .3, sfx: 'stamp', gain: -7 }, { t: sc[4].sceneStart + 1.45, sfx: 'pop', gain: -12 },
  { t: sc[5].sceneStart - .15, sfx: 'whoosh', gain: -12 },
];
window.TOTAL = () => S.total;
