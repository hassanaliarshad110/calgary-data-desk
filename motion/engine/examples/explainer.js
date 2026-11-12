/* DATA EXPLAINER example: a 15-25 s vertical fun fact.
 * Copy this file to production/<date>-<slot>/scene.js, then change only the blocks marked EDIT.
 * Render: python3 render.py scene.js out.mp4 --geo <studio>/motion/geo/calgary_base.json
 * Every on-screen figure must be a claims-table value (cite the claim number in a comment).
 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;           // vertical centre that keeps clear of the right-hand 120 px

// EDIT 1: the audited narration lines with their measured Kokoro durations (seconds) from durs.json
const S = M.script([
  { text: 'Calgary has a hill bigger than most of its neighbourhoods.', dur: 3.2 },
  { text: 'Nose Hill Park covers about eleven square kilometres.', dur: 3.0 },
  { text: 'That is bigger than many entire communities around it.', dur: 3.1 },
  { text: 'Have you walked it? Yes or no?', dur: 2.0 },
], { lead: .3, gap: .3, tail: 1.6 });

// EDIT 2: the facts as they appear on screen (from the claims table) and the place
const PARK = 'Nose Hill Park';                                 // geo pack park name
const HOOK = 'BIGGER THAN A NEIGHBOURHOOD?';                   // 3-7 words, matches the thumbnail
const FIG = { value: 11, suffix: ' km²', label: 'Nose Hill Park', kind: 'estimate', claim: 'C2', source: 'Source: example only (replace with the audited source)' };

const park = () => (M.geo.get()?.parks || []).find(p => p.name === PARK);
const centroid = poly => { const r = poly[0]; return [r.reduce((a, p) => a + p[0], 0) / r.length, r.reduce((a, p) => a + p[1], 0) / r.length, 0]; };
const sc = S.scenes;

window.FILM = M.film({ W, H, identity: 'explainer', scenes: [
  // 0 HOOK: frame 0 already diving onto the hill; words punch in from 0.05 s; impact at 0.0
  { dur: sc[0].sceneDur, trans: { kind: 'zoom', dur: .4 }, draw: (c, t) => {
      const pk = park(), target = pk ? centroid(pk.polys[0]) : [0, 9000, 0];
      const w = M.world({ sky: 'day', fog: { near: 12000, far: 60000, max: .5 } });
      M.geo.addBase(w, { buildings: false, roads: true });
      if (pk) pk.polys.forEach(poly => w.area(poly, { fill: M.house.gold, alpha: .25 + .35 * M.seg(t, .6, 1.4), stroke: M.house.gold, sw: 6, order: 4 }));
      const cam = M.camera(M.moves.dive(target, M.seg(t, 0, sc[0].sceneDur, 'outCubic'), { h0: 26000, h1: 3600, back0: 1, back1: 4200, ahead: 400 }), W, H);
      w.render(c, cam); M.source(c, 'Map data © OpenStreetMap contributors · City of Calgary Open Data', 60, 1460, { size: 20 });
      M.kinetic(c, HOOK, t, CX, 420, { t0: -.12, size: 120, maxW: 820, highlight: ['neighbourhood?'] });
  } },
  // 1 THE FACT: counter slams in on the park, evidence chip, source line
  { dur: sc[1].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      const pk = park(), target = pk ? centroid(pk.polys[0]) : [0, 9000, 0];
      const w = M.world({ sky: 'day', fog: { near: 9000, far: 40000, max: .5 } }); M.geo.addBase(w, { buildings: false });
      if (pk) pk.polys.forEach(poly => w.area(poly, { fill: M.house.gold, alpha: .55, stroke: M.house.gold, sw: 6, order: 4 }));
      const cam = M.camera(M.moves.orbit(target, 5200, 4200, 250, 25, M.seg(t, 0, sc[1].sceneDur, 'linear')), W, H); w.render(c, cam);
      c.fillStyle = 'rgba(11,31,58,.55)'; c.fillRect(0, 520, W, 520);
      M.counter(c, FIG.value, M.seg(t, .15, 1.2), CX, 600, { size: 210, suffix: FIG.suffix, slam: true });          // claim C2
      M.text(c, FIG.label, CX, 840, { size: 54, weight: 700, align: 'center' });
      M.evidence(c, FIG.kind, CX, 930, { align: 'center' });
      M.source(c, FIG.source, 60, 1450);
  } },
  // 2 SEE IT: before/after style comparison drawn with real geometry (the park outline over the city grid)
  { dur: sc[2].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      const pk = park(), target = pk ? centroid(pk.polys[0]) : [0, 9000, 0];
      const w = M.world({ sky: 'day', fog: false }); M.geo.addBase(w, { buildings: false, communities: true, lineAlpha: .5 });
      if (pk) pk.polys.forEach(poly => w.area(poly, { fill: M.house.gold, alpha: .6, stroke: M.house.gold, sw: 6, order: 4 }));
      const cam = M.camera({ pos: [target[0], target[1] - 10, M.lerp(17000, 13000, M.seg(t, 0, sc[2].sceneDur, 'inOutSine'))], look: target, fov: 50 }, W, H); w.render(c, cam);
      M.source(c, 'Community boundaries: City of Calgary Open Data · Map data © OpenStreetMap contributors', 60, 1450, { size: 22 });
  } },
  // 3 CLOSER: one-word question, held ~1.5 s after the voice; no end card (video under 2:00)
  { dur: sc[3].sceneDur, draw: (c, t) => { c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H); M.closer(c, 'Have you walked it?', M.seg(t, 0, sc[3].sceneDur, 'linear'), W, H, { highlight: ['walked'] }); } },
], overlay: (c, t, info) => {
  if (t > 3 && info.index < 3) M.header(c, window.LOGO, W, H);
  if (info.index < 3) M.caption(c, S.captionAt(t), W, H);
} });

// EDIT 3: the effects cue sheet (also written to cues.json for sfx.py), times in seconds
window.CUES = [
  { t: 0.00, sfx: 'impact', gain: -4 }, { t: sc[1].sceneStart - .2, sfx: 'whoosh', gain: -8 },
  { t: sc[1].sceneStart + .15, sfx: 'ticks', dur: 1.0, gain: -11 }, { t: sc[1].sceneStart + 1.15, sfx: 'impact', gain: -6 },
  { t: sc[1].sceneStart + 1.3, sfx: 'stamp', gain: -9 }, { t: sc[2].sceneStart - .18, sfx: 'whoosh', gain: -9 },
];
