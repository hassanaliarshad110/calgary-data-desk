/* 2026-11-18 CIVIC · "Would you pause giant data centres in Calgary?" · 1080x1920 vertical.
 * Lead identity: Civic Analyst (map + community boundary, vote tally, document cards, stage stepper);
 * borrows Storyteller drone orbits (S1-S3) and Data Explainer counter slams (S1).
 * Facts: claims 1-9 of packages/2026-11-18-CIVIC-data-centre-pause-vote.md (audit gate, section 3b).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DUR = (window.PARAMS && window.PARAMS.dur ? String(window.PARAMS.dur).split(',').map(Number) : null) || [2.6, 6.0, 7.0, 3.8, 5.0, 6.8, 3.2];
const TEXT = [
  'Would you pause giant data centres in Calgary?',
  'On Tuesday, city council voted thirteen to two to explore a temporary pause on new large data centres.',
  'Nothing is paused yet. The land-use rules must change first, and that needs a public hearing, expected in the spring.',
  'Mayor Jeromy Farkas pointed to limits on electricity and water.',
  'An industry group says a pause would send the wrong signal and put investment at risk.',
  'Next: proposed rule changes by March, and a report on risks and opportunities by the end of twenty twenty-seven.',
  'Pause, or go ahead? Drop your thoughts below.',
];
const S = M.script(TEXT.map((text, i) => ({ text, dur: DUR[i] })), { lead: .3, gap: .4, tail: .35 });
const sc = S.scenes;
window.TOTAL = S.total;
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const NAVY = { land: '#122848', park: '#17364a', water: '#2f6fa6', building: '#3b5378', road: '#2b4670', motorway: '#3f5f8f', lrt: '#6b3a4a', community: '#9fb0c8' };
const DUSK = { land: '#2e3138', park: '#2b3a30', water: '#2c5378', building: '#5a6270', road: '#6e675c', motorway: '#8a7a5c', lrt: '#6b3a4a', community: '#c9b48a' };
const NIGHT = { land: '#11161f', park: '#141f18', water: '#132c48', building: '#262f3d', road: '#3a3e46', motorway: '#4d4636', lrt: '#3a2a30' };
const GOLD = '#f2b632', GREY = '#5d6b80', TEAL = '#7fc8ff';

let HALL = [0, 0, 0], RED = [8000, 13900, 0];
const SITE = [8050, 14800, 0];   // pin just NORTH of the Redstone boundary (top edge y≈14480): "near Redstone", not inside it
window.PRELOAD = async () => {
  HALL = M.geo.lm('Calgary Municipal Building');
  const r = M.geo.get().communities.items.find(x => x.name === 'REDSTONE');
  if (r) { const pts = r.polys.flat(2); const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); RED = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, 0]; }
};
const band = (c, y0, y1, a = .72) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.15, `rgba(7,13,24,${a})`); g.addColorStop(.85, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const navyCard = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#06101f'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const pop = (t, a, b = a + .35) => M.seg(t, a, b, 'outBack');

// cream document card with a highlighted quote (quote type >= 72 px)
const card = (c, t, o) => {
  const pp = M.seg(t, o.t0 || .2, (o.t0 || .2) + (o.span || 2.6), 'linear'), cw = 820, ch = o.h || 700;
  const slide = 1 - M.ease.outCubic(M.seg(pp, 0, .25)), cx0 = CX - cw / 2 + (o.fromRight ? slide * 500 : 0), yy = (o.y || 520) + (o.fromRight ? 0 : slide * 70);
  c.save(); c.globalAlpha = M.seg(pp, 0, .12, 'linear'); M.rr(c, cx0, yy, cw, ch, 18); c.fillStyle = '#f7f4ec'; c.fill();
  c.fillStyle = o.accent || GOLD; c.fillRect(cx0, yy, 14, ch);
  M.text(c, o.title, cx0 + 50, yy + 40, { size: 30, weight: 800, color: '#1b2533', shadow: false, maxW: cw - 100 });
  c.fillStyle = '#c9c2b2'; for (let k = 0; k < 2; k++) c.fillRect(cx0 + 50, yy + (o.titleH || 100) + k * 28, (cw - 100) * (k ? .55 : .92), 9);
  c.font = M.font(72, 800); const words = o.quote.split(/\s+/), lh = 92, qx = cx0 + 50, maxX = cx0 + cw - 50; let x = qx, y = yy + (o.titleH || 100) + 90; const pos = [];
  words.forEach(wd => { const ww = c.measureText(wd).width, sp = c.measureText(' ').width; if (x + ww > maxX && x > qx) { x = qx; y += lh; } pos.push([wd, x, y, ww]); x += ww + sp; });
  pos.forEach(([wd, x, y, ww], i) => { const on = M.seg(pp, .3 + i / words.length * .55, .3 + (i + 1) / words.length * .55, 'linear'); if (on > 0) { c.fillStyle = o.hl || 'rgba(242,182,50,.85)'; c.fillRect(x - 4, y - 2, (ww + 8) * on, 84); } });
  pos.forEach(([wd, x, y]) => M.text(c, wd, x, y, { size: 72, weight: 800, color: '#111a26', shadow: false }));
  M.text(c, o.src, cx0 + 50, yy + ch - 60, { size: 28, weight: 600, color: '#5b6573', shadow: false, maxW: cw - 100 });
  c.restore();
};

window.BUILD = () => M.film({ W, H, identity: 'civic', scenes: [
  // S0 HOOK: frame 0 already diving over the real city map onto City Hall; hook words on screen at frame 0; pin drops at 0.5 s
  { dur: sc[0].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      const w = M.world({ sky: 'blueprint', fog: { near: 12000, far: 50000, max: .5 } });
      M.geo.addBase(w, { buildings: false, lrt: true, colors: NAVY, lineAlpha: .6 });
      M.ping(w, HALL, t, { r: 150 }); M.pin(w, HALL, 'City Hall', { p: M.seg(t, .5, 1.0, 'linear'), size: 44, scale: 1.3 });
      const cam = M.camera(M.moves.dive(HALL, M.seg(t, 0, sc[0].sceneDur, 'outCubic'), { h0: 26000, h1: 5200, back0: 1, back1: 6500, ahead: 2600 }), W, H); w.render(c, cam);
      band(c, 290, 980, .62);
      M.kinetic(c, 'PAUSE', t, CX, 330, { t0: -.12, size: 150, every: .08 });
      M.kinetic(c, 'GIANT DATA', t, CX, 490, { t0: -.02, size: 150, every: .08 });
      M.kinetic(c, 'CENTRES?', t, CX, 650, { t0: .1, size: 150, color: GOLD, every: .08 });
      const k = pop(t, 1.2); if (k > 0) M.chip(c, 'Calgary city council', CX, 850, { align: 'center', size: 56, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k) });
      M.source(c, MAPC, 60, 1460, { size: 20 });
  } },
  // S1 THE VOTE: dimmed dusk drone of downtown; 15 seat dots fill 13 gold / 2 grey; counters slam to 13 and 2
  { dur: sc[1].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 2500, far: 14000 } });
      M.geo.addBase(w, { buildings: true, lrt: true, windows: '#ffd27a', windowAlpha: .5, colors: DUSK });
      const cam = M.camera(M.moves.orbit(HALL, 1800, 700, 200, 24, M.seg(t, 0, sc[1].sceneDur, 'linear')), W, H); w.render(c, cam);
      c.fillStyle = 'rgba(6,12,24,.55)'; c.fillRect(0, 0, W, H); band(c, 300, 1220, .7);
      M.chip(c, 'Council vote · Tue Nov 17', CX, 320, { align: 'center', size: 52, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, Math.max(0, pop(t, .05))) });
      const p13 = M.seg(t, .6, 1.7, 'linear'), p2 = M.seg(t, 1.0, 2.0, 'linear');
      if (p13 > 0) M.counter(c, 13, p13, CX - 210, 450, { size: 230, slam: true, decimals: 0, color: GOLD });
      if (p2 > 0) M.counter(c, 2, p2, CX + 230, 450, { size: 230, slam: true, decimals: 0, color: '#c8d2e0' });
      M.text(c, 'FOR', CX - 210, 700, { size: 56, weight: 800, align: 'center', color: GOLD, alpha: M.seg(t, .8, 1.1) });
      M.text(c, 'AGAINST', CX + 230, 700, { size: 56, weight: 800, align: 'center', color: '#c8d2e0', alpha: M.seg(t, 1.2, 1.5) });
      for (let i = 0; i < 15; i++) { const on = M.seg(t, .6 + i * .08, .75 + i * .08, 'outBack'), x = CX - 7 * 58 + i * 58, y = 830;
        c.save(); c.globalAlpha = Math.min(1, Math.max(0, on)); c.fillStyle = i < 13 ? GOLD : GREY; c.beginPath(); c.arc(x, y, 22 * Math.max(.2, on), 0, 7); c.fill(); c.restore(); }
      M.text(c, 'Explore a temporary pause on new large data centres', CX, 920, { size: 62, weight: 700, align: 'center', color: '#fff', maxW: 860, alpha: M.seg(t, 2.0, 2.5) });
      const k = pop(t, 3.0); if (k > 0) M.evidence(c, 'fact', CX, 1110, { align: 'center', size: 48, alpha: Math.min(1, k) });
      M.source(c, 'Sources: Calgary Herald, Nov 17 · Global News, Nov 18, 2026', 60, 1460, { size: 20 });
  } },
  // S2 NOT PAUSED YET: drone orbit over the northeast; Redstone boundary lit as a reference; pin just north of it
  { dur: sc[2].sceneDur, trans: { kind: 'dissolve', dur: .45 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 6000, far: 30000 } });
      M.geo.addBase(w, { buildings: false, lrt: true, colors: DUSK, communities: true, highlightCommunity: 'REDSTONE', hiColor: GOLD, hiAlpha: .35, lineAlpha: .18 });
      M.ping(w, SITE, t, { r: 140 }); M.pin(w, SITE, null, { p: M.seg(t, .8, 1.3, 'linear'), scale: 1.4 });
      const tgt = [(RED[0] + SITE[0]) / 2, (RED[1] + SITE[1]) / 2, 0];
      const cam = M.camera(M.moves.orbit(tgt, 5200, 3600, 250, 22, M.seg(t, 0, sc[2].sceneDur, 'linear')), W, H); w.render(c, cam);
      band(c, 290, 760, .72);
      M.kinetic(c, 'NOTHING PAUSED YET', t, CX, 320, { size: 116, every: .08, maxW: 880, highlight: ['yet'] });
      const k1 = pop(t, 1.0); if (k1 > 0) M.chip(c, 'Proposed', CX, 590, { align: 'center', size: 50, bg: '#b58cff', color: '#06101f', alpha: Math.min(1, k1) });
      band(c, 900, 1210, .78);
      const k2 = pop(t, 1.6); if (k2 > 0) { M.text(c, 'Large application under review', CX, 930, { size: 58, weight: 800, align: 'center', color: GOLD, alpha: Math.min(1, k2), maxW: 880 }); M.text(c, 'Far northeast, near Redstone', CX, 1005, { size: 50, weight: 600, align: 'center', color: '#fff', alpha: Math.min(1, k2) }); }
      const k3 = pop(t, 3.3); if (k3 > 0) M.chip(c, 'Public hearing first · expected spring 2027', CX, 1090, { align: 'center', size: 48, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k3) });
      M.source(c, 'Sources: Calgary Herald · LiveWire Calgary · Global News · ' + MAPC, 60, 1460, { size: 20 });
  } },
  // S3 ONE SIDE: night downtown, mayor's quote card
  { dur: sc[3].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      const w = M.world({ sky: 'night', fog: { near: 2500, far: 14000 } });
      M.geo.addBase(w, { buildings: true, windows: '#ffcf6b', windowAlpha: .5, colors: NIGHT });
      const cam = M.camera(M.moves.orbit(HALL, 1500, 520, 210, 18, M.seg(t, 0, sc[3].sceneDur, 'linear')), W, H); w.render(c, cam);
      c.fillStyle = 'rgba(6,12,24,.62)'; c.fillRect(0, 0, W, H);
      M.kinetic(c, 'ELECTRICITY + WATER', t, CX, 300, { size: 110, every: .07, maxW: 880, color: GOLD });
      card(c, t, { y: 540, h: 690, t0: .15, span: 2.8, title: 'MAYOR JEROMY FARKAS · NOV 2026', quote: 'Given the constraints that we have around electricity and around water', src: 'Quoted by Global News and the Calgary Herald' });
  } },
  // S4 OTHER SIDE: same card language, slides in from the right
  { dur: sc[4].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 6000, far: 30000 } });
      M.geo.addBase(w, { buildings: true, lrt: true, colors: DUSK, windows: '#ffd27a', windowAlpha: .4 });
      const cam = M.camera(M.moves.orbit(HALL, 2400, 900, 120, -16, M.seg(t, 0, sc[4].sceneDur, 'linear')), W, H); w.render(c, cam);
      c.fillStyle = 'rgba(6,12,24,.62)'; c.fillRect(0, 0, W, H);
      M.kinetic(c, 'INDUSTRY GROUP VIEW', t, CX, 300, { size: 110, every: .07, maxW: 880, color: TEAL });
      card(c, t, { y: 600, h: 560, t0: .15, span: 2.4, fromRight: true, accent: TEAL, hl: 'rgba(127,200,255,.85)', titleH: 140, title: 'CANADIAN COALITION FOR DIGITAL INFRASTRUCTURE', quote: '…would send the wrong signal', src: 'In a statement, quoted by Global News · Nov 2026' });
  } },
  // S5 WHAT'S NEXT: vertical stage stepper with a moving scrub head
  { dur: sc[5].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      navyCard(c);
      M.kinetic(c, "WHAT'S NEXT", t, CX, 300, { size: 120, every: .08, highlight: ['next'] });
      const steps = [['Nov 17, 2026', 'Council vote ✓', 'fact'], ['By March 2027', 'Proposed bylaw changes', 'announced'], ['Spring 2027', 'Public hearing (expected)', 'announced'], ['End of 2027', 'Report on risks and opportunities', 'announced']];
      const x0 = 150, y0 = 600, gap = 172, reach = M.seg(t, .4, sc[5].sceneDur - 1.0, 'inOutSine') * 3;
      c.save(); c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 8; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y0 + gap * 3); c.stroke();
      c.strokeStyle = GOLD; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y0 + gap * reach); c.stroke(); c.restore();
      steps.forEach(([when, what], i) => { const on = reach >= i - .02, a = on ? 1 : .35;
        c.save(); c.fillStyle = on ? GOLD : '#0e1726'; c.strokeStyle = on ? GOLD : 'rgba(255,255,255,.4)'; c.lineWidth = 5; c.beginPath(); c.arc(x0, y0 + i * gap, on ? 26 : 18, 0, 7); c.fill(); c.stroke(); c.restore();
        M.text(c, when, x0 + 60, y0 + i * gap - 52, { size: 52, weight: 800, color: on ? GOLD : '#8a99ad', alpha: a });
        M.text(c, what, x0 + 60, y0 + i * gap + 8, { size: 48, weight: 600, color: '#fff', alpha: a, maxW: 760 }); });
      M.evidence(c, 'announced', CX, 450, { align: 'center', size: 48, alpha: M.seg(t, 1.6, 2.0) });
      M.source(c, 'Sources: Calgary Herald · Global News · LiveWire Calgary · CTV News, Nov 2026', 60, 1460, { size: 20 });
  } },
  // S6 CLOSER: two-sided question, no end card
  { dur: sc[6].sceneDur, draw: (c, t) => { navyCard(c); M.closer(c, 'Pause, or go ahead?', M.seg(t, 0, sc[6].sceneDur, 'linear'), W, H, { highlight: ['pause', 'ahead?'] }); } },
], overlay: (c, t, info) => {
  if (t > 3 && info.index < 6) M.header(c, window.LOGO, W, H);
  if (info.index < 6) M.caption(c, S.captionAt(t), W, H);
  const mid = sc[3].sceneStart + .3; M.followPill(c, (t - mid) / 2, W, H);
} });

window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.05, sfx: 'impact', gain: -6 }, { t: .55, sfx: 'pop', gain: -11 }, { t: 1.25, sfx: 'click', gain: -14 },
  { t: sc[1].sceneStart - .18, sfx: 'whoosh', gain: -10 }, { t: sc[1].sceneStart + 1.7, sfx: 'impact', gain: -9 }, { t: sc[1].sceneStart + 2.0, sfx: 'impact', gain: -11 }, { t: sc[1].sceneStart + 3.05, sfx: 'stamp', gain: -14 },
  { t: sc[2].sceneStart + .1, sfx: 'whoosh', gain: -14 }, { t: sc[2].sceneStart + .85, sfx: 'pop', gain: -11 }, { t: sc[2].sceneStart + 1.05, sfx: 'stamp', gain: -14 }, { t: sc[2].sceneStart + 3.35, sfx: 'click', gain: -13 },
  { t: sc[3].sceneStart - .15, sfx: 'whoosh', gain: -12 }, { t: sc[3].sceneStart + .2, sfx: 'whoosh', gain: -18 },
  { t: sc[4].sceneStart - .15, sfx: 'whoosh', gain: -12 }, { t: sc[4].sceneStart + .2, sfx: 'whoosh', gain: -18 },
  { t: sc[5].sceneStart - .15, sfx: 'whoosh', gain: -12 }, { t: sc[5].sceneStart + 1.65, sfx: 'stamp', gain: -14 },
  ...[1, 2, 3].map(i => ({ t: sc[5].sceneStart + .4 + (sc[5].sceneDur - 1.4) * (i / 3), sfx: 'click', gain: -13 })),
  { t: sc[6].sceneStart - .1, sfx: 'whoosh', gain: -14 },
];
