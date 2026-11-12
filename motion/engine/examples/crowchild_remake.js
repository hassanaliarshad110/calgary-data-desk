/* WORKED EXAMPLE (approved before/after, Nov 12, 2026): the posted Nov 11 fun fact "Who was Crowchild?" re-directed with
 * calgary-motion-director. Same audited script, Kokoro narration and facts (claims 1-4 of packages/2026-11-11-PM-crowchild-trail-chief.md).
 * Lead identity: Data Explainer, borrowing a Storyteller dusk drone and night quote and a Civic document card and stamp.
 * Render: python3 ../render.py crowchild_remake.js out.mp4 --geo ../../geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const S = M.script([
  { text: 'Crowchild Trail is named after a real chief. Who was he?', dur: 3.627 },
  { text: "David Crowchild, chief of the Tsuut'ina Nation from nineteen forty-six to nineteen fifty-three.", dur: 5.781 },
  { text: 'When city officials asked to use his name, he gave his blessing.', dur: 3.413 },
  { text: 'He said: may this be a symbol of cutting all barriers between all peoples, for all times to come.', dur: 5.461 },
  { text: 'Did you know the story behind the name? Drop your thoughts below.', dur: 3.243 },
  { text: 'Follow Calgary Insight for more, and tell us what you think in the comments.', dur: 4.053 },
  { text: 'For more Calgary stories, studies and analysis, visit calgary insight dot c a.', dur: 5.056 },
], { lead: .5, gap: .3, tail: 1.6 });
const sc = S.scenes;
const SRC = 'Sources: Calgary Guardian · Avenue Calgary · The Sprawl · Alberta Champions';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';

let ROUTE = [], MID = [-3000, 2000, 0], ALONG = [];
window.PRELOAD = async () => {
  const g = M.geo.get(); ROUTE = g.roads.filter(r => /Crowchild/.test(r.name) && r.class !== 'primary').flatMap(r => r.lines);
  const pts = ROUTE.flat(); MID = [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length, 0];
  ALONG = ROUTE.slice().sort((a, b) => b.length - a.length)[0];      // the longest continuous stretch, for the drone to follow
};
const NAVY = { land: '#122848', park: '#17364a', water: '#2f6fa6', building: '#3b5378', road: '#2b4670', motorway: '#3f5f8f' };
const nearDowntown = () => { const tw = M.geo.lm('Calgary Tower'); let best = null, bd = 1e12; ROUTE.forEach(l => l.forEach((p, i) => { const d = Math.hypot(p[0] - tw[0], p[1] - tw[1]); if (d < bd) { bd = d; best = [l, i]; } })); return best; };
const DUSK = { land: '#2e3138', park: '#2b3a30', water: '#2c5378', building: '#5a6270', road: '#6e675c', motorway: '#8a7a5c' };

// green highway sign (matches the old thumbnail motif, now living in the 3D scene)
function sign(c, t, y) {
  const k = M.ease.outBack(M.seg(t, .0, .45, 'linear')), s = M.lerp(1.5, 1, k), a = M.seg(t, 0, .12, 'linear');
  c.save(); c.globalAlpha = a; c.translate(CX, y); c.scale(s, s);
  M.rr(c, -330, -95, 660, 190, 22); c.fillStyle = '#0f6b3a'; c.fill(); c.lineWidth = 8; c.strokeStyle = '#fff'; c.stroke();
  M.text(c, 'CROWCHILD', 0, -62, { size: 92, weight: 800, align: 'center', shadow: false }); M.text(c, 'TRAIL', 0, 34, { size: 40, weight: 700, align: 'center', tracking: .3, shadow: false });
  c.restore();
}
function cityRoute(w, p, o = {}) {
  M.geo.addBase(w, Object.assign({ buildings: true, windows: '#ffd27a', windowAlpha: .45, colors: DUSK }, o));
  ROUTE.forEach(l => w.line(l, { wm: 30, maxPx: 18, minPx: 2.5, color: M.house.gold, glow: 5, p, order: 6, noFog: true }));
}

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // 0 HOOK: frame 0 already diving over the real city at dusk onto the real Crowchild Trail, glowing gold; the sign slams in
  { dur: sc[0].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      const w = M.world({ sky: 'blueprint', fog: { near: 12000, far: 50000, max: .5 } }); cityRoute(w, .35 + .65 * M.seg(t, 0, 1.8, 'outCubic'), { buildings: false, colors: NAVY });
      const cam = M.camera(M.moves.dive(MID, M.seg(t, 0, sc[0].sceneDur, 'outCubic'), { h0: 30000, h1: 7000, back0: 1, back1: 9000, ahead: 600 }), W, H); w.render(c, cam);
      sign(c, t + .45, 360); M.kinetic(c, 'Who was he?', t, CX, 560, { t0: -.12, size: 130, highlight: ['he?'] });
      M.source(c, MAPC, 60, 1460, { size: 20 });
  } },
  // 1 WHO: oblique drone over the trail where it passes the downtown skyline; big name, the years as a chip
  { dur: sc[1].sceneDur, trans: { kind: 'dissolve', dur: .5 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 2500, far: 12000 } }); M.geo.addBase(w, { buildings: true, windows: '#ffd27a', windowAlpha: .5, colors: DUSK });
      ROUTE.forEach(l => w.line(l, { wm: 26, maxPx: 9, minPx: 2, color: M.house.gold, glow: 3, order: 6, noFog: true }));
      M.traffic(w, ROUTE, t + 3, { spacing: 60, speed: 22 });
      const [l, i] = nearDowntown(), p = l[i], tw = M.geo.lm('Calgary Tower'), d = M.drift(t, 5), u = M.seg(t, 0, sc[1].sceneDur, 'inOutSine');
      const away = M.v3.norm([p[0] - tw[0], p[1] - tw[1], 0]);
      const cam = M.camera({ pos: [p[0] + away[0] * M.lerp(1500, 1100, u) - away[1] * M.lerp(-400, 400, u) + d[0], p[1] + away[1] * M.lerp(1500, 1100, u) + away[0] * M.lerp(-400, 400, u) + d[1], 520 + d[2]], look: [tw[0], tw[1], 60], fov: 55 }, W, H); w.render(c, cam);
      const g = c.createLinearGradient(0, 380, 0, 1000); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.25, 'rgba(7,13,24,.7)'); g.addColorStop(.8, 'rgba(7,13,24,.7)'); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, 380, W, 620);
      M.text(c, "TSUUT'INA NATION", CX, 480, { size: 38, weight: 700, align: 'center', color: M.house.gold, tracking: .18, alpha: M.seg(t, .1, .5) });
      M.kinetic(c, 'David Crowchild', t, CX, 545, { t0: .1, size: 124, upper: false, every: .18, maxW: 860 });
      const k = M.seg(t, 1.6, 2.1, 'outBack'); if (k > 0) M.chip(c, 'Chief, 1946–1953', CX, 830, { align: 'center', size: 60, alpha: Math.min(1, k) });
      M.evidence(c, 'fact', CX, 930, { align: 'center', alpha: M.seg(t, 2.4, 2.8) });
      M.source(c, SRC, 60, 1460, { size: 20 });
  } },
  // 2 THE ASK: crane up off the road; the request card, then the blessing stamps down
  { dur: sc[2].sceneDur, trans: { kind: 'dissolve', dur: .5 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 3000, far: 20000 } }); M.geo.addBase(w, { buildings: true, windows: '#ffd27a', windowAlpha: .5, colors: DUSK });
      const [l, i] = nearDowntown(), a = l[i], tw = M.geo.lm('Calgary Tower'), p = M.seg(t, 0, sc[2].sceneDur, 'inOutCubic');
      ROUTE.forEach(r => w.line(r, { wm: 26, maxPx: 9, minPx: 2, color: M.house.gold, glow: 3, order: 6, noFog: true }));
      M.traffic(w, ROUTE, t + 9, { spacing: 60, speed: 22 });
      const away = M.v3.norm([a[0] - tw[0], a[1] - tw[1], 0]);
      const cam = M.camera({ pos: [a[0] + away[0] * M.lerp(1100, 1800, p) - away[1] * 400, a[1] + away[1] * M.lerp(1100, 1800, p) + away[0] * 400, M.lerp(520, 1500, p)], look: [M.lerp(tw[0], a[0], .4), M.lerp(tw[1], a[1], .4), 0], fov: 55 }, W, H); w.render(c, cam);
      c.fillStyle = 'rgba(7,13,24,.35)'; c.fillRect(0, 420, W, 480);
      const k = M.seg(t, .1, .5, 'outCubic'); c.save(); c.globalAlpha = k; M.rr(c, 110, 450 - 40 * (1 - k), 860, 180, 22); c.fillStyle = '#f7f4ec'; c.fill();
      M.text(c, 'City officials asked', CX, 494 - 40 * (1 - k), { size: 80, weight: 700, align: 'center', color: '#132033', shadow: false }); c.restore();
      const st = M.seg(t, 1.3, 1.6, 'outBack'); if (st > 0) { c.save(); c.translate(CX, 760); c.rotate(-.06); c.scale(M.lerp(1.8, 1, st), M.lerp(1.8, 1, st)); c.globalAlpha = Math.min(1, st * 1.5);
        M.rr(c, -420, -85, 840, 170, 20); c.fillStyle = 'rgba(7,13,24,.75)'; c.fill(); c.lineWidth = 9; c.strokeStyle = M.house.gold; c.stroke(); M.text(c, 'He gave his blessing ✓', 0, -42, { size: 70, weight: 800, align: 'center', color: M.house.gold }); c.restore(); }
      M.source(c, SRC, 60, 1460, { size: 20 });
  } },
  // 3 THE QUOTE: night; the trail becomes a river of light; his words reveal phrase by phrase
  { dur: sc[3].sceneDur, trans: { kind: 'dissolve', dur: .5 }, draw: (c, t) => {
      const w = M.world({ sky: 'night', fog: { near: 2500, far: 16000 } });
      M.geo.addBase(w, { buildings: true, windows: '#ffcf6b', windowAlpha: .55, colors: { land: '#11161f', park: '#141f18', water: '#132c48', building: '#262f3d', road: '#3a3e46', motorway: '#4d4636' } });
      M.traffic(w, ROUTE, t, { night: true, spacing: 45, speed: 24 });
      ROUTE.forEach(l => w.line(l, { wm: 30, maxPx: 10, minPx: 1.5, color: M.house.gold, alpha: .35, order: 6, noFog: true }));
      const [l, i] = nearDowntown(), a = l[i];
      const cam = M.camera(M.moves.orbit(a, 1500, 420, 160, 25, M.seg(t, 0, sc[3].sceneDur, 'linear')), W, H); w.render(c, cam);
      c.fillStyle = 'rgba(4,8,16,.5)'; c.fillRect(0, 380, W, 780);
      M.text(c, '“', 110, 340, { size: 220, weight: 800, color: M.house.gold, alpha: M.seg(t, 0, .3) });
      const words = 'May this be a symbol of cutting all barriers between all peoples for all times to come.'.split(' ');
      const shown = Math.ceil(words.length * M.seg(t, .25, sc[3].speech, 'linear'));
      M.text(c, words.slice(0, shown).join(' '), 110, 530, { size: 76, weight: 800, maxW: 800, lh: 1.16 });
      M.text(c, '— Chief David Crowchild', 110, 1060, { size: 46, weight: 600, color: M.house.gold, alpha: M.seg(t, sc[3].speech - .4, sc[3].speech) });
      M.source(c, SRC, 60, 1460, { size: 20 });
  } },
  // 4 QUESTION
  { dur: sc[4].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => { c.fillStyle = '#081428'; c.fillRect(0, 0, W, H); M.closer(c, 'Did you know the story behind the name?', M.seg(t, 0, sc[4].sceneDur, 'linear'), W, H, { highlight: ['name?'] }); } },
  // 5-6 FOLLOW + SITE (the posted script has these lines; the new 2:00 rule would cut them on new videos)
  { dur: sc[5].sceneDur + sc[6].sceneDur, draw: (c, t) => {
      const w = M.world({ sky: 'night', fog: { near: 2500, far: 14000 } }); M.geo.addBase(w, { buildings: true, windows: '#ffcf6b', windowAlpha: .5, colors: { land: '#11161f', park: '#141f18', water: '#132c48', building: '#262f3d', road: '#3a3e46', motorway: '#4d4636' } });
      const tw = M.geo.lm('Calgary Tower'); const cam = M.camera(M.moves.orbit(tw, 1600, 600, 230, 20, M.seg(t, 0, 9, 'linear')), W, H); w.render(c, cam);
      c.fillStyle = 'rgba(6,12,24,.6)'; c.fillRect(0, 0, W, H);
      const k = M.ease.outBack(M.seg(t, .1, .6, 'linear')); if (window.LOGO) { const s = 300 * k; c.drawImage(window.LOGO, CX - s / 2, 330, s, s); }
      M.text(c, '💬 Comment below', CX, 700, { size: 64, weight: 800, align: 'center', alpha: M.seg(t, .4, .8) });
      const b = M.seg(t, 1, 1.4, 'outBack'); c.save(); c.globalAlpha = Math.min(1, b); M.rr(c, CX - 230, 820, 460, 110, 16); c.fillStyle = '#e62117'; c.fill(); M.text(c, '🔔 SUBSCRIBE', CX, 848, { size: 50, weight: 800, align: 'center', shadow: false }); c.restore();
      M.text(c, 'Follow @calgaryinsight', CX, 970, { size: 50, weight: 700, align: 'center', color: '#fff', alpha: M.seg(t, 1.4, 1.8) });
      M.text(c, 'More at calgaryinsight.ca', CX, 1070, { size: 52, weight: 700, align: 'center', color: M.house.gold, alpha: M.seg(t, sc[6].start - sc[5].start, sc[6].start - sc[5].start + .5) });
  } },
], overlay: (c, t, info) => {
  if (t > 3 && info.index < 4) M.header(c, window.LOGO, W, H);
  M.caption(c, S.captionAt(t), W, H);
  M.followPill(c, (t - 17.3) / 2, W, H);
} });

window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.05, sfx: 'impact', gain: -6 }, { t: .6, sfx: 'pop', gain: -12 },
  { t: sc[1].sceneStart - .18, sfx: 'whoosh', gain: -10 }, { t: sc[1].sceneStart + .2, sfx: 'stamp', gain: -14 },
  { t: sc[2].sceneStart + .1, sfx: 'click', gain: -14 }, { t: sc[2].sceneStart + 1.35, sfx: 'stamp', gain: -7 },
  { t: sc[3].sceneStart - 1.2, sfx: 'swell', dur: 2.2, gain: -14 }, { t: sc[3].sceneStart, sfx: 'city', dur: sc[3].sceneDur, gain: -26 },
  { t: sc[4].sceneStart - .15, sfx: 'whoosh', gain: -11 }, { t: sc[5].sceneStart + .1, sfx: 'pop', gain: -10 }, { t: sc[5].sceneStart + 1.05, sfx: 'ping', gain: -14 },
];
