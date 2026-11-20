/* 2026-11-20 CIVIC · "Who decides Calgary's bike lanes?" (Alberta Bill 43) · 1080x1920 vertical.
 * Lead identity: Civic Analyst (street cutaway diagram, document cards, evidence chips, stage stepper);
 * borrows Storyteller blueprint dive + drone orbits (S0, S3, S4) and Data Explainer before/after wipe (S2).
 * Facts: claims C1-C12 of packages/2026-11-20-CIVIC-alberta-bike-lane-bill.md (audit gate, section 3b).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DUR = (window.PARAMS && window.PARAMS.dur ? String(window.PARAMS.dur).split(',').map(Number) : null) || [2.8, 6.4, 5.4, 5.2, 4.4, 4.8, 2.6];
const TEXT = [
  "Who decides Calgary's bike lanes? Alberta wants a say.",
  "On Thursday, the province tabled a bill. New bike lanes that take road space from vehicles would need the transportation minister's approval.",
  'The minister could also order existing lanes like that removed. Cities could ask for exemptions, case by case.',
  "The minister says it's about safety and accountability, and points to concerns that some lanes add to congestion.",
  "Calgary's mayor opposes the province stepping in, and says he expects changes to the bill.",
  "It isn't law yet. The bill still has to pass, with details to come later in regulations.",
  'Province, or city? Drop your thoughts below.',
];
const S = M.script(TEXT.map((text, i) => ({ text, dur: DUR[i] })), { lead: .3, gap: .4, tail: .35 });
const sc = S.scenes;
window.TOTAL = S.total;
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const NAVY = { land: '#122848', park: '#17364a', water: '#2f6fa6', building: '#3b5378', road: '#2b4670', motorway: '#3f5f8f', lrt: '#6b3a4a', community: '#9fb0c8' };
const DUSK = { land: '#2e3138', park: '#2b3a30', water: '#2c5378', building: '#5a6270', road: '#6e675c', motorway: '#8a7a5c', lrt: '#6b3a4a', community: '#c9b48a' };
const NIGHT = { land: '#11161f', park: '#141f18', water: '#132c48', building: '#262f3d', road: '#3a3e46', motorway: '#4d4636', lrt: '#3a2a30' };
const GOLD = '#f2b632', TEAL = '#7fc8ff', GREEN = '#2bb37a';

let HALL = [0, 0, 0];
window.PRELOAD = async () => { HALL = M.geo.lm('Calgary Municipal Building'); };
const band = (c, y0, y1, a = .72) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.15, `rgba(7,13,24,${a})`); g.addColorStop(.85, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const navyCard = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#06101f'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const pop = (t, a, b = a + .35) => M.seg(t, a, b, 'outBack');

// cream document card with highlighted statement (type >= 72 px); reported words, no quote marks
const card = (c, t, o) => {
  const pp = M.seg(t, o.t0 || .2, (o.t0 || .2) + (o.span || 2.6), 'linear'), cw = 860, ch = o.h || 700;
  const slide = 1 - M.ease.outCubic(M.seg(pp, 0, .25)), cx0 = CX - cw / 2 + (o.fromRight ? slide * 500 : 0), yy = (o.y || 520) + (o.fromRight ? 0 : slide * 70);
  c.save(); c.globalAlpha = M.seg(pp, 0, .12, 'linear'); M.rr(c, cx0, yy, cw, ch, 18); c.fillStyle = '#f7f4ec'; c.fill();
  c.fillStyle = o.accent || GOLD; c.fillRect(cx0, yy, 14, ch);
  M.text(c, o.title, cx0 + 50, yy + 40, { size: 32, weight: 800, color: '#1b2533', shadow: false, maxW: cw - 100 });
  c.font = M.font(72, 800); const words = o.quote.split(/\s+/), lh = 92, qx = cx0 + 50, maxX = cx0 + cw - 50; let x = qx, y = yy + (o.titleH || 110); const pos = [];
  words.forEach(wd => { const ww = c.measureText(wd).width, sp = c.measureText(' ').width; if (x + ww > maxX && x > qx) { x = qx; y += lh; } pos.push([wd, x, y, ww]); x += ww + sp; });
  pos.forEach(([wd, x, y, ww], i) => { const on = M.seg(pp, .3 + i / words.length * .55, .3 + (i + 1) / words.length * .55, 'linear'); if (on > 0) { c.fillStyle = o.hl || 'rgba(242,182,50,.85)'; c.fillRect(x - 4, y - 2, (ww + 8) * on, 84); } });
  pos.forEach(([wd, x, y]) => M.text(c, wd, x, y, { size: 72, weight: 800, color: '#111a26', shadow: false }));
  M.text(c, o.src, cx0 + 50, yy + ch - 56, { size: 28, weight: 600, color: '#5b6573', shadow: false, maxW: cw - 100 });
  c.restore();
};

// top-down street cutaway: lanes run left-right; lane 0 (top) is the bike-lane position
const RX0 = 40, RX1 = 1000, RY = 560, LH = 105, NL = 4;
const bike = (c, x, y, s = 1, col = '#fff') => { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.lineWidth = 5; c.beginPath(); c.arc(-26, 10, 17, 0, 7); c.stroke(); c.beginPath(); c.arc(26, 10, 17, 0, 7); c.stroke();
  c.beginPath(); c.moveTo(-26, 10); c.lineTo(-6, -14); c.lineTo(18, -14); c.lineTo(26, 10); c.moveTo(-6, -14); c.lineTo(2, 10); c.lineTo(18, -14); c.moveTo(-10, -22); c.lineTo(0, -22); c.stroke(); c.restore(); };
const car = (c, x, y, col) => { c.save(); M.rr(c, x - 44, y - 24, 88, 48, 10); c.fillStyle = col; c.fill(); c.fillStyle = 'rgba(10,20,35,.55)'; c.fillRect(x + 6, y - 18, 22, 36); c.restore(); };
const CARS = ['#e9edf3', '#f2b632', '#7fc8ff', '#c94f4f', '#9fb0c8', '#e9edf3'];
const street = (c, t, o = {}) => {
  // sidewalks + asphalt
  c.fillStyle = '#26354a'; c.fillRect(0, RY - 50, W, 50); c.fillRect(0, RY + LH * (NL + 1), W, 50);
  c.fillStyle = '#2f3540'; c.fillRect(0, RY, W, LH * (NL + 1));
  // lane 0: bike lane, vehicle lane, or partly converted (wipe = 0..1 from left)
  const wipe = o.wipe || 0, bikeOn = o.bikeLane;
  if (bikeOn) { c.fillStyle = GREEN; c.fillRect(wipe * W, RY, W - wipe * W, LH); c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(wipe * W, RY + LH - 8, W - wipe * W, 8);
    for (let k = 0; k < 4; k++) { const bx = 160 + k * 250; if (bx > wipe * W + 40) bike(c, bx, RY + LH / 2 - 4, 1, '#fff'); } }
  // dashed lane lines
  c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 6; c.setLineDash([46, 34]); c.lineDashOffset = -t * 160;
  for (let i = (bikeOn && wipe < 1 ? 2 : 1); i <= NL; i++) { if (i === 3) continue; c.beginPath(); c.moveTo(0, RY + i * LH); c.lineTo(W, RY + i * LH); c.stroke(); }
  if (bikeOn && wipe > 0) { c.beginPath(); c.moveTo(0, RY + LH); c.lineTo(wipe * W, RY + LH); c.stroke(); }
  c.setLineDash([]); c.strokeStyle = GOLD; c.lineWidth = 5; c.beginPath(); c.moveTo(0, RY + 3 * LH - 5); c.lineTo(W, RY + 3 * LH - 5); c.moveTo(0, RY + 3 * LH + 5); c.lineTo(W, RY + 3 * LH + 5); c.stroke();
  // traffic: lanes 1-2 eastbound, 3-4 westbound; lane 0 carries cars only where it has been converted
  const lanes = [1, 2, 3, 4].concat(!bikeOn || wipe > 0 ? [0] : []);
  lanes.forEach(L => { const dir = L >= 3 ? -1 : 1, sp = 150 + L * 23;
    for (let k = 0; k < 3; k++) { let x = ((k * 400 + L * 130 + dir * t * sp) % 1200 + 1200) % 1200 - 60; if (dir < 0) x = 1080 - x;
      if (L === 0 && x > wipe * W - 50) continue; car(c, x, RY + L * LH + LH / 2, CARS[(L + k) % CARS.length]); } });
};

window.BUILD = () => M.film({ W, H, identity: 'civic', scenes: [
  // S0 HOOK: frame 0 already diving over the real city map onto downtown; hook words on screen at frame 0
  { dur: sc[0].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      const w = M.world({ sky: 'blueprint', fog: { near: 12000, far: 50000, max: .5 } });
      M.geo.addBase(w, { buildings: false, lrt: true, colors: NAVY, lineAlpha: .6 });
      M.ping(w, HALL, t, { r: 150 }); M.pin(w, HALL, 'Downtown Calgary', { p: M.seg(t, .5, 1.0, 'linear'), size: 44, scale: 1.3 });
      const cam = M.camera(M.moves.dive(HALL, M.seg(t, 0, sc[0].sceneDur, 'outCubic'), { h0: 26000, h1: 5200, back0: 1, back1: 6500, ahead: 2600 }), W, H); w.render(c, cam);
      band(c, 290, 980, .62);
      M.kinetic(c, 'WHO DECIDES', t, CX, 330, { t0: -.12, size: 140, every: .08 });
      M.kinetic(c, "CALGARY'S", t, CX, 485, { t0: -.02, size: 140, every: .08 });
      M.kinetic(c, 'BIKE LANES?', t, CX, 640, { t0: .1, size: 150, color: GOLD, every: .08 });
      const k = pop(t, 1.2); if (k > 0) M.chip(c, 'Alberta bill · tabled Nov 19', CX, 850, { align: 'center', size: 56, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k) });
      M.source(c, MAPC, 60, 1460, { size: 20 });
  } },
  // S1 THE RULE: street cutaway; a new bike lane outline grows into a traffic lane; approval stamp slams
  { dur: sc[1].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      navyCard(c);
      const k0 = pop(t, .05); if (k0 > 0) M.chip(c, 'Bill 43 · tabled Thu Nov 19, 2026', CX, 320, { align: 'center', size: 52, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k0) });
      street(c, t, {});
      M.text(c, 'VEHICLE LANES', 60, RY + 2.5 * LH - 20, { size: 34, weight: 800, color: 'rgba(255,255,255,.85)', alpha: M.seg(t, .3, .7) });
      // dashed "new bike lane" outline grows across lane 1 (road space taken from vehicles)
      const g = M.seg(t, 1.3, 2.6, 'outCubic');
      if (g > 0) { c.save(); c.fillStyle = 'rgba(43,179,122,.45)'; c.fillRect(RX0, RY + LH + 6, (RX1 - RX0) * g, LH - 12); c.strokeStyle = GREEN; c.lineWidth = 6; c.setLineDash([22, 14]); c.strokeRect(RX0, RY + LH + 6, (RX1 - RX0) * g, LH - 12); c.restore();
        if (g > .5) { bike(c, 300, RY + LH * 1.5 - 4, 1, '#fff'); M.text(c, 'NEW BIKE LANE?', 420, RY + LH * 1.5 - 26, { size: 44, weight: 800, color: '#fff' }); } }
      band(c, 1120, 1420, .8);
      const st = M.seg(t, 2.9, 3.25, 'outBack');
      if (st > 0) { c.save(); c.translate(CX, 1210); c.rotate(-.06); c.scale(1.6 - .6 * Math.min(1, st), 1.6 - .6 * Math.min(1, st)); c.globalAlpha = Math.min(1, st);
        M.rr(c, -400, -78, 800, 156, 16); c.strokeStyle = GOLD; c.lineWidth = 10; c.stroke(); c.fillStyle = 'rgba(11,31,58,.9)'; c.fill();
        M.text(c, "MINISTER'S WRITTEN", 0, -66, { size: 60, weight: 900, align: 'center', color: GOLD }); M.text(c, 'APPROVAL NEEDED', 0, 2, { size: 60, weight: 900, align: 'center', color: GOLD }); c.restore(); }
      const k2 = pop(t, 4.0); if (k2 > 0) M.chip(c, 'IF PASSED', CX, 420, { align: 'center', size: 50, bg: '#b58cff', color: '#06101f', alpha: Math.min(1, k2) });
      M.source(c, 'Sources: The Canadian Press · Edmonton Journal, Nov 19, 2026', 60, 1460, { size: 20 });
  } },
  // S2 BEFORE/AFTER: same street; the existing bike lane is wiped into a vehicle lane
  { dur: sc[2].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      navyCard(c);
      M.kinetic(c, 'EXISTING LANES', t, CX, 300, { size: 110, every: .07, maxW: 900 });
      const wp = M.seg(t, .8, 2.4, 'inOutCubic');
      street(c, t, { bikeLane: true, wipe: wp });
      M.text(c, 'BIKE LANE', 60, RY - 46, { size: 34, weight: 800, color: GREEN, alpha: 1 - M.seg(t, 2.0, 2.4) });
      if (wp > 0 && wp < 1) { c.fillStyle = GOLD; c.fillRect(wp * W - 4, RY - 10, 8, LH + 20); }
      const k1 = pop(t, 2.3); if (k1 > 0) M.chip(c, 'COULD BE ORDERED REMOVED', CX, 430, { align: 'center', size: 52, bg: GOLD, color: '#06101f', alpha: Math.min(1, k1) });
      band(c, 1110, 1330, .82);
      const k2 = pop(t, 3.0); if (k2 > 0) M.chip(c, 'Exemptions: case by case', CX, 1180, { align: 'center', size: 52, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k2) });
      M.source(c, 'Source: Edmonton Journal, Nov 19, 2026', 60, 1460, { size: 20 });
  } },
  // S3 THE PROVINCE'S VIEW: dusk orbit over downtown, document card
  { dur: sc[3].sceneDur, trans: { kind: 'dissolve', dur: .45 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 2500, far: 14000 } });
      M.geo.addBase(w, { buildings: true, lrt: true, windows: '#ffd27a', windowAlpha: .5, colors: DUSK });
      const cam = M.camera(M.moves.orbit(HALL, 1800, 700, 200, 24, M.seg(t, 0, sc[3].sceneDur, 'linear')), W, H); w.render(c, cam);
      c.fillStyle = 'rgba(6,12,24,.62)'; c.fillRect(0, 0, W, H);
      M.kinetic(c, "THE PROVINCE'S VIEW", t, CX, 300, { size: 104, every: .07, maxW: 900, color: GOLD });
      card(c, t, { y: 560, h: 640, t0: .15, span: 3.0, title: 'TRANSPORTATION MINISTER DEVIN DREESHEN', quote: 'Safety and accountability. Concerns some lanes add to congestion.', src: 'As reported by The Canadian Press, Nov 19-20, 2026' });
  } },
  // S4 CALGARY'S MAYOR: night orbit, same card design from the right (balance)
  { dur: sc[4].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      const w = M.world({ sky: 'night', fog: { near: 2500, far: 14000 } });
      M.geo.addBase(w, { buildings: true, windows: '#ffcf6b', windowAlpha: .5, colors: NIGHT });
      const cam = M.camera(M.moves.orbit(HALL, 1500, 520, 210, 18, M.seg(t, 0, sc[4].sceneDur, 'linear')), W, H); w.render(c, cam);
      c.fillStyle = 'rgba(6,12,24,.62)'; c.fillRect(0, 0, W, H);
      M.kinetic(c, "CALGARY'S MAYOR", t, CX, 300, { size: 110, every: .07, maxW: 900, color: TEAL });
      card(c, t, { y: 560, h: 640, t0: .15, span: 2.8, fromRight: true, accent: TEAL, hl: 'rgba(127,200,255,.85)', title: 'MAYOR JEROMY FARKAS', quote: 'Opposes the province stepping in. Expects changes to the bill.', src: 'As reported by The Canadian Press, Nov 19-20, 2026' });
  } },
  // S5 WHAT'S NEXT: stage stepper with a moving scrub head
  { dur: sc[5].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      navyCard(c);
      M.kinetic(c, "WHAT'S NEXT", t, CX, 300, { size: 120, every: .08, highlight: ['next'] });
      const steps = [['Nov 19, 2026', 'Bill 43 tabled ✓'], ['Next', 'Must pass the legislature'], ['Later', 'Details set in regulations']];
      const x0 = 150, y0 = 640, gap = 210, reach = M.seg(t, .4, sc[5].sceneDur - 1.0, 'inOutSine') * 2;
      c.save(); c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 8; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y0 + gap * 2); c.stroke();
      c.strokeStyle = GOLD; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y0 + gap * reach); c.stroke(); c.restore();
      steps.forEach(([when, what], i) => { const on = reach >= i - .02, a = on ? 1 : .35;
        c.save(); c.fillStyle = on ? GOLD : '#0e1726'; c.strokeStyle = on ? GOLD : 'rgba(255,255,255,.4)'; c.lineWidth = 5; c.beginPath(); c.arc(x0, y0 + i * gap, on ? 26 : 18, 0, 7); c.fill(); c.stroke(); c.restore();
        M.text(c, when, x0 + 60, y0 + i * gap - 56, { size: 56, weight: 800, color: on ? GOLD : '#8a99ad', alpha: a });
        M.text(c, what, x0 + 60, y0 + i * gap + 10, { size: 52, weight: 600, color: '#fff', alpha: a, maxW: 780 }); });
      const k = pop(t, .3); if (k > 0) M.chip(c, 'PROPOSED', CX, 460, { align: 'center', size: 50, bg: '#b58cff', color: '#06101f', alpha: Math.min(1, k) });
      M.source(c, 'Sources: The Canadian Press · Global News, Nov 19-20, 2026', 60, 1460, { size: 20 });
  } },
  // S6 CLOSER: two-sided question, no end card
  { dur: sc[6].sceneDur, draw: (c, t) => { navyCard(c); M.closer(c, 'Province, or city?', M.seg(t, 0, sc[6].sceneDur, 'linear'), W, H, { highlight: ['province,', 'city?'] }); } },
], overlay: (c, t, info) => {
  if (t > 3 && info.index < 6) M.header(c, window.LOGO, W, H);
  if (info.index < 6) M.caption(c, S.captionAt(t), W, H);
  const mid = sc[3].sceneStart + .3; M.followPill(c, (t - mid) / 2, W, H);
} });

window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.05, sfx: 'impact', gain: -6 }, { t: .55, sfx: 'pop', gain: -11 }, { t: 1.25, sfx: 'click', gain: -14 },
  { t: sc[1].sceneStart - .18, sfx: 'whoosh', gain: -10 }, { t: sc[1].sceneStart + 1.35, sfx: 'whoosh', gain: -16 }, { t: sc[1].sceneStart + 2.95, sfx: 'stamp', gain: -10 }, { t: sc[1].sceneStart + 4.05, sfx: 'pop', gain: -13 },
  { t: sc[2].sceneStart - .15, sfx: 'whoosh', gain: -12 }, { t: sc[2].sceneStart + .8, sfx: 'whoosh', gain: -14 }, { t: sc[2].sceneStart + 2.35, sfx: 'stamp', gain: -13 }, { t: sc[2].sceneStart + 3.05, sfx: 'pop', gain: -12 },
  { t: sc[3].sceneStart - .1, sfx: 'whoosh', gain: -14 }, { t: sc[3].sceneStart + .2, sfx: 'whoosh', gain: -18 },
  { t: sc[4].sceneStart - .15, sfx: 'whoosh', gain: -12 }, { t: sc[4].sceneStart + .2, sfx: 'whoosh', gain: -18 },
  { t: sc[5].sceneStart - .15, sfx: 'whoosh', gain: -12 }, { t: sc[5].sceneStart + .35, sfx: 'stamp', gain: -14 },
  ...[1, 2].map(i => ({ t: sc[5].sceneStart + .4 + (sc[5].sceneDur - 1.4) * (i / 2), sfx: 'click', gain: -13 })),
  { t: sc[6].sceneStart - .1, sfx: 'whoosh', gain: -14 },
];
