/* STORYTELLER example: cinematic documentary, one file for both flagship formats.
 *   vertical Short:  python3 render.py scene.js short.mp4 --geo calgary_base.json
 *   widescreen film: python3 render.py scene.js youtube.mp4 --geo calgary_base.json --param format=wide
 * Change only the EDIT blocks. Every name, year and number on screen comes from the claims table.
 */
const WIDE = (window.PARAMS || {}).format === 'wide';
const W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920;
const CX = WIDE ? W / 2 : (W - 120) / 2 + 30;
const L = WIDE ? { hookY: 300, hookSize: 110, hookW: 1300, capB: 70 } : { hookY: 430, hookSize: 120, hookW: 820 };

// EDIT 1: audited narration with measured durations
const S = M.script([
  { text: 'Every Calgary story starts at the same place.', dur: 3.0 },
  { text: 'Where two rivers meet.', dur: 2.1, gapAfter: .9 },             // longer pause before the reveal
  { text: 'Today the Bow runs past a skyline its first settlers could never have pictured.', dur: 4.6 },
  { text: 'Which part of this story would you want to see next?', dur: 3.0 },
], { lead: .3, gap: .45, tail: 1.6 });
const sc = S.scenes;

// EDIT 2: places (geo pack landmark names) and timeline events from the claims table
const CONFLUENCE = M.geo.lm('Fort Calgary') || [1500, 200, 0];
const TOWER = M.geo.lm('Calgary Tower') || [0, 0, 0];
const bowPts = () => M.geo.riverPath('Bow River', CONFLUENCE, 7000);

const DUSK = { land: '#34363c', park: '#2c3a31', water: '#2c5378', building: '#596170', road: '#7d7466', motorway: '#b8904e' };

window.FILM = M.film({ W, H, identity: 'storyteller', scenes: [
  // 0 COLD OPEN: low dusk drone up the Bow, river drawing on in gold; hook words from 0.05 s
  { dur: sc[0].sceneDur, trans: { kind: 'match', dur: .6 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 1200, far: 8000 } });
      M.geo.addBase(w, { buildings: true, windows: '#ffd27a', windowAlpha: .5, colors: DUSK, roads: false });
      const pts = bowPts(); if (pts.length) w.line(pts, { wm: 18, maxPx: 14, color: M.house.gold, glow: 4, p: M.seg(t, 0, sc[0].sceneDur, 'inOutSine'), order: 6, noFog: true });
      const p = M.seg(t, 0, sc[0].sceneDur, 'inOutSine'), d = M.drift(t, 5);
      const cam = M.camera({ pos: M.mix([CONFLUENCE[0] - 5200, CONFLUENCE[1] + 900, 260], [CONFLUENCE[0] - 2600, CONFLUENCE[1] + 600, 190], p).map((v, i) => v + d[i]), look: [CONFLUENCE[0], CONFLUENCE[1], 0], fov: WIDE ? 42 : 58 }, W, H);
      w.render(c, cam); M.weather(c, 'dust', t, W, H, { count: 80 });
      M.kinetic(c, 'Where two rivers meet', t, CX, L.hookY, { t0: -.12, size: L.hookSize, maxW: L.hookW, every: .14, highlight: ['rivers'] });
  } },
  // 1 THE REVEAL: crane up over the confluence, pin drops on the meeting point
  { dur: sc[1].sceneDur, trans: { kind: 'dissolve', dur: .8 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 2500, far: 14000 } });
      M.geo.addBase(w, { buildings: true, windows: '#ffd27a', windowAlpha: .45, colors: DUSK });
      M.pin(w, CONFLUENCE, 'The confluence', { p: M.seg(t, .5, 1.3, 'linear') }); M.ping(w, CONFLUENCE, t);
      const p = M.seg(t, 0, sc[1].sceneDur, 'inOutCubic');
      const cam = M.camera({ pos: [CONFLUENCE[0] - 600, CONFLUENCE[1] - M.lerp(1400, 2600, p), M.lerp(220, 1500, p)], look: CONFLUENCE, fov: WIDE ? 45 : 60 }, W, H); w.render(c, cam);
  } },
  // 2 THE CITY NOW: night orbit of the skyline with live traffic
  { dur: sc[2].sceneDur, trans: { kind: 'dissolve', dur: .6 }, draw: (c, t) => {
      const w = M.world({ sky: 'night', fog: { near: 1500, far: 7000 } });
      M.geo.addBase(w, { buildings: true, windows: '#ffcf6b', windowAlpha: .6, colors: { land: '#121821', park: '#16221a', water: '#14304f', building: '#283140', road: '#454a54', motorway: '#6f6044' } });
      const g = M.geo.get(); const roads = (g?.roads || []).filter(r => /Memorial|Macleod|Deerfoot/.test(r.name)).flatMap(r => r.lines).filter(l => Math.hypot(l[0][0] - TOWER[0], l[0][1] - TOWER[1]) < 5000);
      M.traffic(w, roads, t, { night: true, spacing: 55 });
      const cam = M.camera(M.moves.orbit(TOWER, WIDE ? 1500 : 1100, 380, 205, 35, M.seg(t, 0, sc[2].sceneDur, 'linear')), W, H); w.render(c, cam);
  } },
  // 3 CLOSER (film under 2:00): the question, no end card
  { dur: sc[3].sceneDur, draw: (c, t) => { c.fillStyle = '#070d18'; c.fillRect(0, 0, W, H); M.closer(c, 'Which part should we tell next?', M.seg(t, 0, sc[3].sceneDur, 'linear'), W, H, { highlight: ['next?'] }); } },
], letterbox: t => WIDE ? M.seg(t, sc[1].sceneStart - .5, sc[1].sceneStart + .5) * (1 - M.seg(t, sc[2].sceneStart, sc[2].sceneStart + 1)) : 0,
   overlay: (c, t, info) => {
     if (t > 3 && info.index < 3) M.header(c, window.LOGO, W, H, { topic: 'Calgary stories' });
     if (info.index < 3) M.caption(c, S.captionAt(t), W, H);
     if (info.index === 1 || info.index === 2) M.source(c, 'Map data © OpenStreetMap contributors · City of Calgary Open Data', WIDE ? 48 : 60, WIDE ? H - 40 : 1460, { size: 20 });
   } });

// EDIT 3: effects cue sheet
window.CUES = [
  { t: 0.0, sfx: 'wind', dur: sc[1].sceneEnd, gain: -22 },
  { t: sc[1].sceneStart - 1.6, sfx: 'riser', dur: 1.6, gain: -12 },
  { t: sc[1].sceneStart + .5, sfx: 'pop', gain: -10 }, { t: sc[1].sceneStart + .6, sfx: 'ping', gain: -14 },
  { t: sc[2].sceneStart, sfx: 'swell', dur: 2.5, gain: -10 }, { t: sc[2].sceneStart, sfx: 'city', dur: sc[2].sceneDur, gain: -22 },
];
