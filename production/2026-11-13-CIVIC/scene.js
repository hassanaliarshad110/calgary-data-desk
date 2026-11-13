/* 2026-11-13 CIVIC · "Grey Cup Sunday in Calgary: what to know" · 1080x1920 vertical.
 * Lead identity: Civic Analyst; borrows a Storyteller dusk drone (S0-S1) and Data Explainer counter slams (S2, S4).
 * Facts: claims 1-9 of packages/2026-11-13-CIVIC-grey-cup-sunday.md (audit APPROVED, round 1).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DUR = (window.PARAMS && window.PARAMS.dur ? String(window.PARAMS.dur).split(',').map(Number) : null) || [3.563, 6.059, 4.053, 4.864, 4.629, 9.856, 3.904, 2.923];
const TEXT = [
  "The Grey Cup is in Calgary this Sunday. Here's what you need to know.",
  'The Montreal Alouettes play the Edmonton Elks at McMahon Stadium. Kickoff is at five p.m.',
  "It's the sixth time Calgary has hosted, and the first since twenty nineteen.",
  'The festival at Stampede Park runs through Saturday, with free family-friendly events.',
  'Organizers expect roughly fifty million dollars in economic activity.',
  'On Sunday, from eleven a.m. to eleven p.m., University Drive closes near the stadium, and Crowchild Trail drops to two lanes each way.',
  'The City says to take the Red Line CTrain to Banff Trail Station.',
  'Montreal or Edmonton? Drop your thoughts below.',
];
const S = M.script(TEXT.map((text, i) => ({ text, dur: DUR[i] })), { lead: .3, gap: .4, tail: 1.05 });
const sc = S.scenes;
window.TOTAL = S.total;
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const NAVY = { land: '#122848', park: '#17364a', water: '#2f6fa6', building: '#3b5378', road: '#2b4670', motorway: '#3f5f8f', lrt: '#6b3a4a' };
const DUSK = { land: '#2e3138', park: '#2b3a30', water: '#2c5378', building: '#5a6270', road: '#6e675c', motorway: '#8a7a5c', lrt: '#6b3a4a' };
const RED = '#e2483d', GOLD = '#f2b632';

let MCM = [-3466, 2847, 0], STP = [1400, -994, 0], BTS = [-3052, 2900, 0], CROW = [], REDLINE = [], ROUTE = [];
window.PRELOAD = async () => {
  const g = M.geo.get();
  MCM = M.geo.lm('McMahon Stadium'); STP = M.geo.lm('Stampede Park');
  const st = g.lrt_stations.find(s => s.name === 'Banff Trail'); BTS = [st.xy[0], st.xy[1], 0];
  // Crowchild Trail NW: the stretch beside McMahon (points within ~1.1 km), from the real road geometry
  CROW = g.roads.filter(r => r.name === 'Crowchild Trail NW').flatMap(r => r.lines)
    .map(l => l.filter((p, i) => [p, l[i - 1] || p, l[i + 1] || p].some(q => Math.hypot(q[0] - MCM[0], q[1] - MCM[1]) < 1300))).filter(l => l.length > 1);
  // the CTrain line(s) that pass Banff Trail Station (Red Line, northwest leg)
  const dseg = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy || 1, k = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)); return Math.hypot(a[0] + k * dx - p[0], a[1] + k * dy - p[1]); };
  REDLINE = g.lrt.filter(l => l.some((q, i) => i > 0 && dseg(BTS, l[i - 1], q) < 200));
  ROUTE = [[MCM[0], MCM[1]], [-2300, 1500], [-600, 300], [STP[0], STP[1]]];
};
const band = (c, y0, y1, a = .72) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const navyCard = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#06101f'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const pop = (t, a, b = a + .35) => M.seg(t, a, b, 'outBack');

window.BUILD = () => M.film({ W, H, identity: 'civic', scenes: [
  // S0 HOOK: frame 0 already diving over the real city map onto McMahon; hook on screen at frame 0; pin drops at 0.5 s
  { dur: sc[0].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      const w = M.world({ sky: 'blueprint', fog: { near: 12000, far: 50000, max: .5 } });
      M.geo.addBase(w, { buildings: false, lrt: true, colors: NAVY, lineAlpha: .6 });
      M.ping(w, MCM, t, { r: 150 }); M.pin(w, MCM, 'McMahon Stadium', { p: M.seg(t, .5, 1.0, 'linear'), size: 44, scale: 1.3 });
      const cam = M.camera(M.moves.dive(MCM, M.seg(t, 0, sc[0].sceneDur, 'outCubic'), { h0: 26000, h1: 5200, back0: 1, back1: 6500, ahead: 2600 }), W, H); w.render(c, cam);
      band(c, 310, 840, .55);
      M.kinetic(c, 'GREY CUP', t, CX, 380, { t0: -.12, size: 150, every: .08 });
      M.kinetic(c, 'SUNDAY', t, CX, 540, { t0: -.12, size: 150, color: GOLD });
      const k = pop(t, 1.3); if (k > 0) M.chip(c, 'What to know', CX, 715, { align: 'center', size: 52, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k) });
      M.source(c, MAPC, 60, 1460, { size: 20 });
  } },
  // S1 WHO + WHEN: dusk drone orbit of McMahon; MONTREAL vs EDMONTON; date chip
  { dur: sc[1].sceneDur, trans: { kind: 'dissolve', dur: .45 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 2500, far: 14000 } });
      M.geo.addBase(w, { buildings: true, lrt: true, windows: '#ffd27a', windowAlpha: .5, colors: DUSK });
      CROW.forEach(l => w.line(l, { wm: 26, maxPx: 10, minPx: 2, color: GOLD, alpha: .7, order: 6, noFog: true }));
      M.traffic(w, CROW, t + 4, { spacing: 70, speed: 20, night: true });
      M.ping(w, MCM, t, { r: 110 }); M.pin(w, MCM, null, { scale: 1.2 });
      const cam = M.camera(M.moves.orbit(MCM, 1700, 650, 250, 28, M.seg(t, 0, sc[1].sceneDur, 'linear')), W, H); w.render(c, cam);
      band(c, 360, 1060, .72);
      const a = M.seg(t, .05, .45, 'outCubic'), b = M.seg(t, .55, .95, 'outCubic');
      M.text(c, 'MONTREAL', CX - (1 - a) * 500, 420, { size: 116, weight: 800, align: 'center', alpha: a });
      M.text(c, 'vs', CX, 560, { size: 64, weight: 700, align: 'center', color: GOLD, alpha: M.seg(t, .4, .6) });
      M.text(c, 'EDMONTON', CX + (1 - b) * 500, 640, { size: 116, weight: 800, align: 'center', alpha: b });
      const k = pop(t, 1.5); if (k > 0) M.chip(c, 'Sun Nov 15 · Kickoff 5 p.m.', CX, 820, { align: 'center', size: 54, alpha: Math.min(1, k) });
      M.evidence(c, 'fact', CX, 940, { align: 'center', size: 30, alpha: M.seg(t, 2.0, 2.4) });
      M.source(c, 'Sources: City of Calgary · CP24/CTV · ' + MAPC, 60, 1460, { size: 20 });
  } },
  // S2 HOW RARE: counter slam to 6th, timeline 2019 -> 2026
  { dur: sc[2].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      navyCard(c);
      const p = M.seg(t, .05, 1.1, 'linear'), v = Math.max(1, Math.round(1 + 5 * M.ease.outCubic(p)));
      const n = p >= 1 ? 6 : v;
      M.text(c, n + 'th', CX, 470, { size: 260, weight: 800, align: 'center', color: '#fff' });
      if (p >= 1) { const k = M.seg(t, 1.1, 1.4, 'outBack'); if (k < 1) M.text(c, '6th', CX, 470, { size: 260 * (1 + .25 * (1 - k)), weight: 800, align: 'center', color: GOLD, alpha: (1 - k) * .5 }); }
      M.text(c, 'time Calgary hosts', CX, 760, { size: 72, weight: 700, align: 'center', color: '#dfe7f2', alpha: M.seg(t, .6, 1.0) });
      M.timeline(c, { x: 170, y: 1080, w: W - 120 - 280, from: 2019, to: 2026, p: M.seg(t, 1.3, 2.9, 'inOutCubic'), events: [{ year: 2019 }, { year: 2026 }], size: 60, headSize: 0.01, headOffset: 0 });
      const k = pop(t, 2.9); if (k > 0) M.chip(c, 'First since 2019', CX, 1180, { align: 'center', size: 56, alpha: Math.min(1, k) });
      M.source(c, 'Sources: Wikipedia, 113th Grey Cup · Tourism Calgary · City of Calgary (2019)', 60, 1460, { size: 20 });
  } },
  // S3 WHERE the festival is: fly from McMahon to Stampede Park along a glowing route
  { dur: sc[3].sceneDur, trans: { kind: 'dissolve', dur: .45 }, draw: (c, t) => {
      const w = M.world({ sky: 'blueprint', fog: { near: 9000, far: 40000, max: .45 } });
      M.geo.addBase(w, { buildings: true, lrt: true, colors: NAVY, lineAlpha: .6 });
      const u = M.seg(t, 0, sc[3].sceneDur, 'inOutCubic');
      w.line(ROUTE, { wm: 60, maxPx: 12, minPx: 3, color: GOLD, glow: 4, p: M.seg(t, .2, 2.2, 'inOutSine'), order: 7, noFog: true });
      M.pin(w, MCM, null, { scale: .9 });
      M.ping(w, STP, t, { r: 130 }); M.pin(w, STP, 'Stampede Park', { p: M.seg(t, 1.6, 2.2, 'linear'), size: 46, scale: 1.3 });
            const lk = [M.lerp(MCM[0], STP[0], M.lerp(.25, .6, u)) + 900, M.lerp(MCM[1], STP[1], M.lerp(.25, .6, u)) - 900, 0];
      const cam = M.camera({ pos: [lk[0], lk[1] - 2600, M.lerp(12500, 10500, u)], look: lk, fov: 55 }, W, H); w.render(c, cam);
      band(c, 400, 900, .5);
      const k1 = pop(t, 2.2), k2 = pop(t, 2.8);
      if (k1 > 0) M.chip(c, 'Festival through Sat Nov 14', CX, 480, { align: 'center', size: 56, alpha: Math.min(1, k1) });
      if (k2 > 0) M.chip(c, 'Free family-friendly events', CX, 610, { align: 'center', size: 52, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k2) });
      M.source(c, 'Source: City of Calgary · ' + MAPC, 60, 1460, { size: 20 });
  } },
  // S4 HOW MUCH (estimate): counter slam to $50M with ESTIMATE label, Stampede Park dimmed behind
  { dur: sc[4].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      const w = M.world({ sky: 'night', fog: { near: 2500, far: 14000 } });
      M.geo.addBase(w, { buildings: true, windows: '#ffcf6b', windowAlpha: .5, colors: { land: '#11161f', park: '#141f18', water: '#132c48', building: '#262f3d', road: '#3a3e46', motorway: '#4d4636', lrt: '#3a2a30' } });
      const cam = M.camera(M.moves.orbit(STP, 1500, 520, 210, 18, M.seg(t, 0, sc[4].sceneDur, 'linear')), W, H); w.render(c, cam);
      c.fillStyle = 'rgba(6,12,24,.62)'; c.fillRect(0, 0, W, H);
      M.counter(c, 50, M.seg(t, .1, 1.3, 'linear'), CX, 470, { prefix: '$', suffix: 'M', size: 250, slam: true, decimals: 0 });
      M.text(c, 'in economic activity', CX, 770, { size: 72, weight: 700, align: 'center', color: '#dfe7f2', alpha: M.seg(t, .7, 1.1) });
      const k = pop(t, 1.5); if (k > 0) M.evidence(c, 'estimate', CX, 900, { align: 'center', size: 48, alpha: Math.min(1, k) });
      M.text(c, "Organizers' estimate", CX, 1010, { size: 52, weight: 600, align: 'center', color: GOLD, alpha: M.seg(t, 1.8, 2.2) });
      M.source(c, 'Source: Grey Cup Festival organizers via CP24/CTV, Nov 12, 2026', 60, 1460, { size: 20 });
  } },
  // S5 WHAT CHANGES Sunday: oblique map at McMahon, Crowchild Trail NW in red, closure chips
  { dur: sc[5].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 3000, far: 16000 } });
      M.geo.addBase(w, { buildings: true, lrt: true, windows: '#ffd27a', windowAlpha: .4, colors: DUSK });
      const flash = .65 + .35 * Math.sin(t * 5);
      CROW.forEach(l => w.line(l, { wm: 30, maxPx: 16, minPx: 3, color: RED, glow: 4, alpha: flash, p: M.seg(t, .3, 1.3, 'inOutSine'), order: 7, noFog: true }));
      M.traffic(w, CROW, t, { spacing: 40, speed: 7, night: true });
      M.pin(w, MCM, 'McMahon', { scale: 1.1, size: 40 });
      const u = M.seg(t, 0, sc[5].sceneDur, 'inOutSine');
      const cam = M.camera({ pos: [MCM[0] + M.lerp(500, 250, u), MCM[1] - M.lerp(3600, 2900, u), M.lerp(3600, 3000, u)], look: [MCM[0], MCM[1] + 600, 0], fov: 55 }, W, H); w.render(c, cam);
      band(c, 330, 1000, .74);
      M.kinetic(c, 'SUNDAY', t, CX, 360, { size: 120, color: GOLD });
      M.text(c, '11 a.m.–11 p.m.', CX, 500, { size: 84, weight: 800, align: 'center', alpha: M.seg(t, .3, .6) });
      const k1 = pop(t, 1.8), k2 = pop(t, 4.0);
      if (k1 > 0) M.chip(c, 'University Dr NW: closed (16–24 Ave NW)', CX, 650, { align: 'center', size: 48, bg: RED, color: '#ffffff', alpha: Math.min(1, k1) });
      if (k2 > 0) M.chip(c, 'Crowchild Tr NW: 2 lanes each way', CX, 780, { align: 'center', size: 48, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k2) });
      M.source(c, 'Source: City of Calgary · ' + MAPC, 60, 1460, { size: 20 });
  } },
  // S6 HOW to get there: CTrain lines, the Red Line leg past Banff Trail glows, train lights move, station pin
  { dur: sc[6].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      const w = M.world({ sky: 'blueprint', fog: { near: 6000, far: 30000, max: .45 } });
      M.geo.addBase(w, { buildings: false, lrt: true, stations: true, colors: NAVY, lineAlpha: .6 });
      REDLINE.forEach(l => w.line(l, { wm: 60, maxPx: 16, minPx: 7, color: '#d94848', glow: 4, order: 7, noFog: true }));
      M.traffic(w, REDLINE, t * 3, { spacing: 1600, speed: 25, len: 60, wid: 5, h: 4, colors: ['#e9ecef'], night: true, laneOffset: 4 });
      M.pin(w, MCM, null, { scale: .9 });
      M.ping(w, BTS, t, { r: 110, color: '#ff6b6b' }); M.pin(w, BTS, 'Banff Trail Station', { p: M.seg(t, .6, 1.1, 'linear'), size: 44, scale: 1.2, color: '#d94848' });
      const cam = M.camera(M.moves.dive(BTS, M.seg(t, 0, sc[6].sceneDur, 'outCubic'), { h0: 14000, h1: 3600, back0: 1, back1: 4200, ahead: 200 }), W, H); w.render(c, cam);
      band(c, 330, 700, .6);
      M.kinetic(c, 'Take the Red Line', t, CX, 400, { size: 110, upper: false, highlight: ['red', 'line'], accent: '#ff6b6b' });
      M.source(c, 'Source: City of Calgary · ' + MAPC, 60, 1460, { size: 20 });
  } },
  // S7 CLOSER: two-sided question, no end card
  { dur: sc[7].sceneDur, draw: (c, t) => { navyCard(c); M.closer(c, 'Montreal or Edmonton?', M.seg(t, 0, sc[7].sceneDur, 'linear'), W, H, { highlight: ['montreal', 'edmonton'] }); } },
], overlay: (c, t, info) => {
  if (t > 3 && info.index < 7) M.header(c, window.LOGO, W, H);
  if (info.index < 7) M.caption(c, S.captionAt(t), W, H);
  const mid = sc[4].sceneStart + .2; M.followPill(c, (t - mid) / 2, W, H);
} });

window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.05, sfx: 'impact', gain: -6 }, { t: .55, sfx: 'pop', gain: -11 }, { t: 1.35, sfx: 'click', gain: -14 },
  { t: sc[1].sceneStart - .18, sfx: 'whoosh', gain: -10 }, { t: sc[1].sceneStart + .1, sfx: 'whoosh', gain: -16 }, { t: sc[1].sceneStart + 1.55, sfx: 'stamp', gain: -12 }, { t: sc[1].sceneStart, sfx: 'crowd_murmur', dur: sc[1].sceneDur, gain: -24 },
  { t: sc[2].sceneStart - .15, sfx: 'whoosh', gain: -12 }, { t: sc[2].sceneStart + 1.1, sfx: 'impact', gain: -9 }, { t: sc[2].sceneStart + 2.95, sfx: 'click', gain: -13 },
  { t: sc[3].sceneStart + 1.65, sfx: 'pop', gain: -11 }, { t: sc[3].sceneStart + 2.25, sfx: 'click', gain: -14 }, { t: sc[3].sceneStart + 2.85, sfx: 'click', gain: -14 },
  { t: sc[4].sceneStart - .15, sfx: 'whoosh', gain: -12 }, { t: sc[4].sceneStart + 1.3, sfx: 'impact', gain: -8 }, { t: sc[4].sceneStart + 1.55, sfx: 'stamp', gain: -13 },
  { t: sc[5].sceneStart - .15, sfx: 'whoosh', gain: -12 }, { t: sc[5].sceneStart + 1.85, sfx: 'click', gain: -12 }, { t: sc[5].sceneStart + 4.05, sfx: 'click', gain: -12 },
  { t: sc[6].sceneStart - .12, sfx: 'whoosh', gain: -12 }, { t: sc[6].sceneStart + .65, sfx: 'pop', gain: -11 },
  { t: sc[7].sceneStart - .1, sfx: 'whoosh', gain: -14 },
];
