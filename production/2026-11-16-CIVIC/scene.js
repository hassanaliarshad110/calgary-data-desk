/* 2026-11-16 CIVIC · "Edmonton won the Grey Cup in Calgary: what happened" · 1080x1920 vertical.
 * Lead identity: Civic Analyst (document card, evidence chips, schematic map, field diagram);
 * borrows a Storyteller dusk drone (S1) and Data Explainer counter slams (S1, S2, S4).
 * Facts: claims 1-8 of packages/2026-11-16-CIVIC-elks-win-grey-cup-in-calgary.md (audit APPROVED, round 1).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DUR = (window.PARAMS && window.PARAMS.dur ? String(window.PARAMS.dur).split(',').map(Number) : null) || [3.157, 6.784, 4.821, 4.117, 4.373, 4.437, 3.179, 3.627];
const TEXT = [
  'Edmonton just won the Grey Cup, right here in Calgary.',
  'On Sunday night at McMahon Stadium, the Edmonton Elks beat the Montreal Alouettes, thirty-seven to thirty.',
  "It's the Elks' first Grey Cup since twenty fifteen, and the fifteenth in the team's history.",
  "Quarterback Cody Fajardo was named the game's most valuable player.",
  'It was the sixth Grey Cup held in Calgary, and the first here since twenty nineteen.',
  'What happens next? In twenty twenty-seven, the Grey Cup moves to Regina.',
  'And starting that season, the league plays on a shorter field.',
  'Elks or Alouettes: who were you cheering for? Drop your thoughts below.',
];
const S = M.script(TEXT.map((text, i) => ({ text, dur: DUR[i] })), { lead: .3, gap: .4, tail: .35 });
const sc = S.scenes;
window.TOTAL = S.total;
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const NAVY = { land: '#122848', park: '#17364a', water: '#2f6fa6', building: '#3b5378', road: '#2b4670', motorway: '#3f5f8f', lrt: '#6b3a4a' };
const DUSK = { land: '#2e3138', park: '#2b3a30', water: '#2c5378', building: '#5a6270', road: '#6e675c', motorway: '#8a7a5c', lrt: '#6b3a4a' };
const NIGHT = { land: '#11161f', park: '#141f18', water: '#132c48', building: '#262f3d', road: '#3a3e46', motorway: '#4d4636', lrt: '#3a2a30' };
const GOLD = '#f2b632', GREEN = '#3fa36a', RED = '#e2483d';

let MCM = [-3466, 2847, 0], CROW = [];
window.PRELOAD = async () => {
  const g = M.geo.get();
  MCM = M.geo.lm('McMahon Stadium');
  CROW = g.roads.filter(r => r.name === 'Crowchild Trail NW').flatMap(r => r.lines)
    .map(l => l.filter((p, i) => [p, l[i - 1] || p, l[i + 1] || p].some(q => Math.hypot(q[0] - MCM[0], q[1] - MCM[1]) < 1300))).filter(l => l.length > 1);
};
const band = (c, y0, y1, a = .72) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const navyCard = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#06101f'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const pop = (t, a, b = a + .35) => M.seg(t, a, b, 'outBack');
const ordinal = n => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');

// counter slam to an ordinal (lands exactly on n), with a timeline below
const ordinalCard = (c, t, n, line, from, to, chip, src) => {
  navyCard(c);
  const p = M.seg(t, .05, 1.1, 'linear'), v = p >= 1 ? n : Math.max(1, Math.round(1 + (n - 1) * M.ease.outCubic(p)));
  M.text(c, ordinal(v), CX, 430, { size: 260, weight: 800, align: 'center', color: '#fff' });
  if (p >= 1) { const k = M.seg(t, 1.1, 1.4, 'outBack'); if (k < 1) M.text(c, ordinal(n), CX, 430, { size: 260 * (1 + .25 * (1 - k)), weight: 800, align: 'center', color: GOLD, alpha: (1 - k) * .5 }); }
  M.text(c, line, CX, 730, { size: 72, weight: 700, align: 'center', color: '#dfe7f2', alpha: M.seg(t, .6, 1.0), maxW: 860 });
  M.timeline(c, { x: 170, y: 960, w: W - 120 - 280, from, to, p: M.seg(t, 1.3, 2.7, 'inOutCubic'), events: [{ year: from }, { year: to }], size: 60, headSize: 0.01, headOffset: 0 });
  const k = pop(t, 2.7); if (k > 0) M.chip(c, chip, CX, 1070, { align: 'center', size: 56, alpha: Math.min(1, k) });
  M.source(c, src, 60, 1460, { size: 20 });
};

window.BUILD = () => M.film({ W, H, identity: 'civic', scenes: [
  // S0 HOOK: frame 0 already diving over the real city map onto McMahon; hook words on screen at frame 0; pin drops at 0.5 s
  { dur: sc[0].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      const w = M.world({ sky: 'blueprint', fog: { near: 12000, far: 50000, max: .5 } });
      M.geo.addBase(w, { buildings: false, lrt: true, colors: NAVY, lineAlpha: .6 });
      M.ping(w, MCM, t, { r: 150 }); M.pin(w, MCM, 'McMahon Stadium', { p: M.seg(t, .5, 1.0, 'linear'), size: 44, scale: 1.3 });
      const cam = M.camera(M.moves.dive(MCM, M.seg(t, 0, sc[0].sceneDur, 'outCubic'), { h0: 26000, h1: 5200, back0: 1, back1: 6500, ahead: 2600 }), W, H); w.render(c, cam);
      band(c, 290, 960, .6);
      M.kinetic(c, 'EDMONTON', t, CX, 330, { t0: -.12, size: 150, every: .08 });
      M.kinetic(c, 'WON IN', t, CX, 490, { t0: -.04, size: 150, every: .08 });
      M.kinetic(c, 'CALGARY', t, CX, 650, { t0: .08, size: 150, color: GOLD, every: .08 });
      const k = pop(t, 1.3); if (k > 0) M.chip(c, 'Grey Cup 113', CX, 840, { align: 'center', size: 56, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k) });
      M.source(c, MAPC, 60, 1460, { size: 20 });
  } },
  // S1 RESULT: dusk drone orbit of McMahon; scoreboard with counters slamming to 37 and 30
  { dur: sc[1].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 2500, far: 14000 } });
      M.geo.addBase(w, { buildings: true, lrt: true, windows: '#ffd27a', windowAlpha: .5, colors: DUSK });
      CROW.forEach(l => w.line(l, { wm: 26, maxPx: 10, minPx: 2, color: GOLD, alpha: .6, order: 6, noFog: true }));
      M.traffic(w, CROW, t + 4, { spacing: 70, speed: 20, night: true });
      M.ping(w, MCM, t, { r: 110 }); M.pin(w, MCM, null, { scale: 1.2 });
      const cam = M.camera(M.moves.orbit(MCM, 1700, 650, 250, 28, M.seg(t, 0, sc[1].sceneDur, 'linear')), W, H); w.render(c, cam);
      band(c, 340, 1080, .78);
      const a = M.seg(t, .05, .45, 'outCubic'), b = M.seg(t, .35, .75, 'outCubic');
      c.save(); c.fillStyle = GREEN; c.globalAlpha = a; c.fillRect(90, 430, 14, 120); c.fillStyle = RED; c.globalAlpha = b; c.fillRect(90, 620, 14, 120); c.restore();
      M.text(c, 'ELKS', 130 - (1 - a) * 400, 430, { size: 110, weight: 800, alpha: a });
      M.text(c, 'ALOUETTES', 130 - (1 - b) * 400, 620, { size: 110, weight: 800, alpha: b });
      const p37 = M.seg(t, .9, 1.9, 'linear'), p30 = M.seg(t, 1.3, 2.3, 'linear');
      if (p37 > 0) M.counter(c, 37, p37, 900, 420, { size: 140, align: 'right', slam: true, decimals: 0, color: '#ffffff' });
      if (p30 > 0) M.counter(c, 30, p30, 900, 610, { size: 140, align: 'right', slam: true, decimals: 0, color: '#dfe7f2' });
      const k = pop(t, .9); if (k > 0) M.chip(c, 'Sun Nov 15 · McMahon Stadium', CX, 820, { align: 'center', size: 50, alpha: Math.min(1, k) });
      M.evidence(c, 'fact', CX, 930, { align: 'center', size: 34, alpha: M.seg(t, 2.4, 2.8) });
      M.source(c, 'Sources: TSN · theScore, Nov 15, 2026 · ' + MAPC, 60, 1460, { size: 20 });
  } },
  // S2 HISTORY FOR THE ELKS: counter to 15th, timeline 2015 -> 2026
  { dur: sc[2].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      ordinalCard(c, t, 15, 'Grey Cup for the Elks', 2015, 2026, 'First since 2015', 'Sources: TSN · theScore · Calgary Journal, Nov 2026');
  } },
  // S3 MVP: document card with the exact quote over a dimmed night orbit
  { dur: sc[3].sceneDur, trans: { kind: 'dissolve', dur: .45 }, draw: (c, t) => {
      const w = M.world({ sky: 'night', fog: { near: 2500, far: 14000 } });
      M.geo.addBase(w, { buildings: true, windows: '#ffcf6b', windowAlpha: .5, colors: NIGHT });
      const cam = M.camera(M.moves.orbit(MCM, 1500, 520, 210, 18, M.seg(t, 0, sc[3].sceneDur, 'linear')), W, H); w.render(c, cam);
      c.fillStyle = 'rgba(6,12,24,.6)'; c.fillRect(0, 0, W, H);
      M.kinetic(c, 'GREY CUP MVP', t, CX, 340, { size: 110, every: .07, color: GOLD });
      { const pp = M.seg(t, .25, 2.8, 'linear'), yy = 520 + (1 - M.ease.outCubic(M.seg(pp, 0, .25))) * 60, cw = 780, cx0 = CX - cw / 2;
        c.save(); c.globalAlpha = M.seg(pp, 0, .12, 'linear'); M.rr(c, cx0, yy, cw, 640, 18); c.fillStyle = '#f7f4ec'; c.fill();
        M.text(c, 'GREY CUP 113 · GAME REPORT', cx0 + 50, yy + 44, { size: 30, weight: 700, color: '#1b2533', shadow: false });
        c.fillStyle = '#c9c2b2'; for (let k = 0; k < 3; k++) c.fillRect(cx0 + 50, yy + 110 + k * 30, (cw - 100) * (k === 2 ? .6 : .95), 10);
        const L = ['Elks QB Cody Fajardo', 'was named', 'Grey Cup MVP.'];
        c.font = M.font(72, 800); L.forEach((l, i) => { const on = M.seg(pp, .3 + i * .2, .5 + i * .2, 'linear'), lw = c.measureText(l).width; c.fillStyle = 'rgba(242,182,50,.85)'; c.fillRect(cx0 + 46, yy + 222 + i * 96, (lw + 8) * on, 84); });
        L.forEach((l, i) => M.text(c, l, cx0 + 50, yy + 226 + i * 96, { size: 72, weight: 800, color: '#111a26', shadow: false }));
        M.text(c, 'Calgary Journal, Nov 16, 2026', cx0 + 50, yy + 580, { size: 26, weight: 500, color: '#5b6573', shadow: false });
        c.restore(); }
      const k = pop(t, 2.9); if (k > 0) M.evidence(c, 'fact', CX, 1185, { align: 'center', size: 48, alpha: Math.min(1, k) });
      M.source(c, 'Sources: Calgary Journal · theScore', 60, 1460, { size: 20 });
  } },
  // S4 HOW RARE FOR CALGARY: counter to 6th, timeline 2019 -> 2026
  { dur: sc[4].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      ordinalCard(c, t, 6, 'Grey Cup held in Calgary', 2019, 2026, 'First here since 2019', 'Source: Calgary Journal, Nov 16, 2026');
  } },
  // S5 WHAT HAPPENS NEXT: schematic prairie map, arc Calgary -> Regina, pin drops
  { dur: sc[5].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      navyCard(c);
      const ax = 230, ay = 880, bx = 830, by = 920, bx0 = 560;
      c.save(); c.strokeStyle = 'rgba(159,176,200,.35)'; c.lineWidth = 4; c.setLineDash([18, 14]); c.beginPath(); c.moveTo(bx0, 700); c.lineTo(bx0, 1150); c.stroke(); c.restore();
      M.text(c, 'ALBERTA', bx0 - 30, 1120, { size: 30, weight: 700, align: 'right', color: '#9fb0c8', shadow: false });
      M.text(c, 'SASKATCHEWAN', bx0 + 30, 1120, { size: 30, weight: 700, color: '#9fb0c8', shadow: false });
      const p = M.seg(t, .5, 2.2, 'inOutSine'), N = 40;
      c.save(); c.strokeStyle = GOLD; c.lineWidth = 10; c.lineCap = 'round'; c.shadowColor = GOLD; c.shadowBlur = 18; c.beginPath();
      for (let i = 0; i <= N * p; i++) { const u = i / N, x = M.lerp(ax, bx, u), y = M.lerp(ay, by, u) - Math.sin(Math.PI * u) * 170; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore();
      const dot = (x, y, col, a) => { c.save(); c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.arc(x, y, 22, 0, 7); c.fill(); c.restore(); };
      dot(ax, ay, '#ffffff', 1); M.text(c, 'Calgary', ax, ay + 40, { size: 52, weight: 800, align: 'center' });
      const k = pop(t, 2.1); if (k > 0) { dot(bx, by - (1 - Math.min(1, k)) * 80, GOLD, Math.min(1, k)); M.text(c, 'Regina', bx, by + 40, { size: 52, weight: 800, align: 'center', color: GOLD, alpha: Math.min(1, k) }); }
      M.kinetic(c, 'NEXT: REGINA', t, CX, 330, { size: 120, every: .08, highlight: ['regina'] });
      const k2 = pop(t, 1.0); if (k2 > 0) M.chip(c, '114th Grey Cup · 2027', CX, 500, { align: 'center', size: 56, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k2) });
      M.evidence(c, 'announced', CX, 600, { align: 'center', size: 40, alpha: M.seg(t, 1.5, 1.9) });
      M.source(c, 'Schematic, not to scale · Sources: TSN · Global News', 60, 1460, { size: 20 });
  } },
  // S6 WHAT CHANGES: top-down field diagram shrinks; goalposts slide to the back of the end zones
  { dur: sc[6].sceneDur, trans: { kind: 'dissolve', dur: .4 }, draw: (c, t) => {
      navyCard(c);
      const u = M.seg(t, .9, 2.4, 'inOutCubic'), s = 4.0, fy = 870;
      const half = M.lerp(55, 50, u), ez = M.lerp(20, 15, u), wid = 65 * s;
      const top = fy - (half + ez) * s, gl1 = fy - half * s, gl2 = fy + half * s, bot = fy + (half + ez) * s;
      c.save(); c.fillStyle = '#1f6b3e'; c.fillRect(CX - wid / 2, gl1, wid, gl2 - gl1);
      c.fillStyle = '#17532f'; c.fillRect(CX - wid / 2, top, wid, gl1 - top); c.fillRect(CX - wid / 2, gl2, wid, bot - gl2);
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 4; c.strokeRect(CX - wid / 2, top, wid, bot - top);
      c.beginPath(); c.moveTo(CX - wid / 2, gl1); c.lineTo(CX + wid / 2, gl1); c.moveTo(CX - wid / 2, gl2); c.lineTo(CX + wid / 2, gl2); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 2; for (let k = -4; k <= 4; k++) { const y = fy + k * (half / 5) * s; c.beginPath(); c.moveTo(CX - wid / 2, y); c.lineTo(CX + wid / 2, y); c.stroke(); }
      // goalposts: on the goal line before, at the back of the end zone after
      const gpTop = M.lerp(gl1, top, u), gpBot = M.lerp(gl2, bot, u);
      c.strokeStyle = GOLD; c.lineWidth = 10; c.lineCap = 'round'; [gpTop, gpBot].forEach(y => { c.beginPath(); c.moveTo(CX - 50, y); c.lineTo(CX + 50, y); c.stroke(); });
      c.restore();
      if (u > 0 && u < 1) { c.save(); c.strokeStyle = 'rgba(242,182,50,.5)'; c.lineWidth = 3; c.setLineDash([10, 10]); c.strokeRect(CX - wid / 2 - 16, fy - 75 * s, wid + 32, 150 * s); c.restore(); }
      M.kinetic(c, 'Shorter field', t, CX, 330, { size: 110, upper: false, every: .08, highlight: ['shorter'] });
      const k = pop(t, .6); if (k > 0) M.chip(c, 'From 2027', CX - 150, 480, { align: 'center', size: 52, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k) });
      M.evidence(c, 'announced', CX + 175, 484, { align: 'center', size: 40, alpha: M.seg(t, .9, 1.2) });
      M.source(c, 'Diagram, not to scale · Sources: CBC News · 3DownNation, Sept 2025', 60, 1460, { size: 20 });
  } },
  // S7 CLOSER: two-sided question, no end card
  { dur: sc[7].sceneDur, draw: (c, t) => { navyCard(c); M.closer(c, 'Elks or Alouettes?', M.seg(t, 0, sc[7].sceneDur, 'linear'), W, H, { highlight: ['elks', 'alouettes?', 'alouettes'] }); } },
], overlay: (c, t, info) => {
  if (t > 3 && info.index < 7) M.header(c, window.LOGO, W, H);
  if (info.index < 7) M.caption(c, S.captionAt(t), W, H);
  const mid = sc[4].sceneStart + .2; M.followPill(c, (t - mid) / 2, W, H);
} });

window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.05, sfx: 'impact', gain: -6 }, { t: .55, sfx: 'pop', gain: -11 }, { t: 1.35, sfx: 'click', gain: -14 },
  { t: sc[1].sceneStart - .18, sfx: 'whoosh', gain: -10 }, { t: sc[1].sceneStart, sfx: 'crowd_murmur', dur: sc[1].sceneDur, gain: -22 }, { t: sc[1].sceneStart + 1.9, sfx: 'impact', gain: -9 }, { t: sc[1].sceneStart + 2.3, sfx: 'impact', gain: -11 }, { t: sc[1].sceneStart + 2.45, sfx: 'stamp', gain: -14 },
  { t: sc[2].sceneStart - .15, sfx: 'whoosh', gain: -12 }, { t: sc[2].sceneStart + 1.1, sfx: 'impact', gain: -9 }, { t: sc[2].sceneStart + 2.75, sfx: 'click', gain: -13 },
  { t: sc[3].sceneStart + .3, sfx: 'whoosh', gain: -16 }, { t: sc[3].sceneStart + 2.95, sfx: 'stamp', gain: -12 },
  { t: sc[4].sceneStart - .15, sfx: 'whoosh', gain: -12 }, { t: sc[4].sceneStart + 1.1, sfx: 'impact', gain: -9 }, { t: sc[4].sceneStart + 2.75, sfx: 'click', gain: -13 },
  { t: sc[5].sceneStart - .15, sfx: 'whoosh', gain: -12 }, { t: sc[5].sceneStart + 2.15, sfx: 'pop', gain: -11 }, { t: sc[5].sceneStart + 1.55, sfx: 'stamp', gain: -14 },
  { t: sc[6].sceneStart + .9, sfx: 'whoosh', gain: -16 }, { t: sc[6].sceneStart + .95, sfx: 'stamp', gain: -14 },
  { t: sc[7].sceneStart - .1, sfx: 'whoosh', gain: -14 },
];
