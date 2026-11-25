/* 2026-11-25 CIVIC · "Calgary's budget debate: what's on the table for your property tax" · 1080x1920 vertical.
 * Lead identity: Civic Analyst (map of City Hall from the City's boundaries, quote cards, attributed range scale, process stages);
 * borrows a Storyteller map push-in (S0-S1) and Data Explainer counter slams (S1, S2, S5).
 * Facts: claims 1-12 of packages/2026-11-25-CIVIC-council-budget-week.md (audit APPROVED, round 2).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DUR = (window.PARAMS && window.PARAMS.dur ? String(window.PARAMS.dur).split(',').map(Number) : null) || [3.2, 5.0, 7.2, 6.4, 7.6, 4.2, 3.4];
const TEXT = [
  'Your property tax is being debated at City Hall this week.',
  'Debate began Monday, and more than two hundred and sixty people signed up to speak.',
  'The plan asks for fifteen per cent more city property tax revenue next year, about thirty-seven dollars a month for a typical home.',
  "The mayor calls the police capital request unprecedented. The police commission chair says there's no room to cut.",
  'One councillor says she wants to see a zero per cent option. The mayor says about four to five per cent is needed to keep the lights on.',
  'What happens next? At least sixty-nine amendments, then final approval.',
  'Cut or keep? Drop your thoughts below.',
];
const TAIL = (window.PARAMS && window.PARAMS.tail) ? Number(window.PARAMS.tail) : 1.2;
const S = M.script(TEXT.map((text, i) => ({ text, dur: DUR[i] })), { lead: .3, gap: .4, tail: TAIL });
const sc = S.scenes;
window.TOTAL = S.total;
const GOLD = '#f2b632', TEAL = '#2bb3a3', SKY = '#7cc4ff';
const MAPSRC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const SRC_H = 'Source: Calgary Herald, Nov 23, 2026 · City of Calgary';
const SRC_C = 'Source: City of Calgary, proposed 2027-2030 Budget, Nov 10, 2026';
const SRC_CBC = 'Source: CBC News, Nov 24, 2026';
const SRC_LW = 'Sources: LiveWire Calgary, Nov 23, 2026 · City of Calgary';
const SRC_N = 'Sources: Calgary Herald, Nov 23, 2026 · City of Calgary';
const HALL = M.geo.lm('Calgary Municipal Building') || [0, 0, 0];
const WARD = M.geo.within('wards', HALL);
const pop = (t, a, b = a + .35) => M.seg(t, a, b, 'outBack');
const navyCard = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#06101f'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const band = (c, y0, y1, a = .72) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.15, `rgba(7,13,24,${a})`); g.addColorStop(.85, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };

// the real Calgary map (City boundaries, rivers, roads), camera height h, City Hall pinged
const cityMap = (c, t, h, o = {}) => {
  const w = M.world({ sky: 'blueprint', fog: false });
  M.geo.addBase(w, { buildings: !!o.buildings, wards: true, highlightWard: WARD, hiColor: SKY, hiAlpha: .18, colors: { land: '#123a66', park: '#1d4a5e', water: '#2a6aa8', road: '#5d86b3', motorway: '#9cc3ea' }, lineAlpha: .5 });
  M.ping(w, HALL, t, { color: GOLD, speed: .9 });
  if (o.pin) M.pin(w, HALL, 'City Hall', { p: o.pin, color: GOLD });
  const cam = M.camera({ pos: [HALL[0] + (o.dx || 0), HALL[1] - (o.back || 10), h], look: HALL, fov: 50 }, W, H); w.render(c, cam);
};

// stylised house outline drawn progressively (p 0..1)
const house = (c, x, y, s, p) => {
  const pts = [[-1, .2], [-1, 1], [1, 1], [1, .2], [0, -.75], [-1, .2], [1, .2]].map(([a, b]) => [x + a * s, y + b * s]);
  const segs = pts.length - 1, upto = p * segs; c.save(); c.strokeStyle = '#ffffff'; c.lineWidth = 10; c.lineJoin = 'round'; c.lineCap = 'round';
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < segs; i++) { const f = Math.min(1, Math.max(0, upto - i)); if (f <= 0) break; c.lineTo(M.lerp(pts[i][0], pts[i + 1][0], f), M.lerp(pts[i][1], pts[i + 1][1], f)); }
  c.stroke();
  const d = M.seg(p, .85, 1); if (d > 0) { c.globalAlpha = d; c.strokeRect(x - .22 * s, y + .45 * s, .44 * s, .55 * s); }
  c.restore();
};

// quote card (paper), exact words highlighted progressively
const quoteCard = (c, x, y, w, h, who, role, quote, p, size) => {
  const a = M.seg(p, 0, .2, 'outCubic'); if (a <= 0) return;
  c.save(); c.globalAlpha = a; M.rr(c, x, y, w, h, 18); c.fillStyle = '#f7f4ec'; c.fill();
  M.text(c, who, x + 40, y + 34, { size: 44, weight: 800, color: '#1b2533', shadow: false, maxW: w - 80 });
  M.text(c, role, x + 40, y + 92, { size: 30, weight: 600, color: '#5b6573', shadow: false, maxW: w - 80 });
  c.font = M.font(size, 800); const words = quote.split(/\s+/); let cx = x + 40, cy = y + 160; const lh = size * 1.25;
  words.forEach((wd, i) => { const ww = c.measureText(wd + ' ').width; if (cx + ww > x + w - 40) { cx = x + 40; cy += lh; }
    const on = M.seg(p, .25 + i / words.length * .5, .25 + (i + 1) / words.length * .5, 'linear');
    c.fillStyle = 'rgba(242,182,50,.85)'; c.fillRect(cx - 4, cy - 4, (ww - 8) * on + (on > 0 ? 8 : 0), size * 1.15);
    c.fillStyle = '#111a26'; c.textBaseline = 'top'; c.fillText(wd, cx, cy); cx += ww; });
  c.restore();
};

window.BUILD = () => M.film({ W, H, identity: 'civic', scenes: [
  // S0 HOOK: frame 0 the real map is already pushing in fast on City Hall; hook words on screen at frame 0
  { dur: sc[0].sceneDur, trans: { kind: 'dissolve', dur: .4 }, draw: (c, t) => {
      const u = M.seg(t, 0, sc[0].sceneDur, 'outCubic');
      cityMap(c, t, M.lerp(30000, 12000, u), { back: M.lerp(10, 2500, u) });
      band(c, 250, 1120, .66);
      M.kinetic(c, 'YOUR PROPERTY TAX', t, CX, 290, { t0: -.12, size: 130, every: .08, maxW: 860 });
      M.kinetic(c, 'DEBATED THIS WEEK', t, CX, 730, { t0: .2, size: 100, every: .08, maxW: 900, color: GOLD });
      const k = pop(t, 1.2); if (k > 0) M.chip(c, 'City Hall · 2027-2030 budget', CX, 990, { align: 'center', size: 50, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k) });
      M.source(c, MAPSRC, 60, 1460, { size: 20 });
  } },
  // S1 THE HEARING: map dives onto City Hall, then 264 speaker dots fill a grid and the counter slams
  { dur: sc[1].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      const u = M.seg(t, 0, 1.6, 'inOutCubic');
      cityMap(c, t + 3, M.lerp(12000, 2600, u), { back: M.lerp(2500, 1800, u), buildings: true, pin: M.seg(t, .3, .9) });
      const g = M.seg(t, 1.2, 1.6, 'linear'); c.save(); c.globalAlpha = .82 * g; c.fillStyle = '#06101f'; c.fillRect(0, 0, W, H); c.restore();
      if (g > 0) {
        const cols = 22, gap = 36, x0 = CX - (cols - 1) * gap / 2, y0 = 640, n = Math.floor(264 * M.seg(t, 1.5, 3.2, 'linear'));
        for (let i = 0; i < 264; i++) { const r = Math.floor(i / cols), col = i % cols; c.save(); c.globalAlpha = g; c.fillStyle = i < n ? GOLD : 'rgba(159,176,200,.25)'; c.beginPath(); c.arc(x0 + col * gap, y0 + r * gap, 11, 0, 7); c.fill(); c.restore(); }
        const pc = M.seg(t, 1.5, 3.2, 'linear'); M.counter(c, 264, pc, CX, 310, { size: 170, decimals: 0, slam: true, color: '#ffffff' });
        M.text(c, 'registered to speak', CX, 500, { size: 64, weight: 700, align: 'center', color: '#dfe7f2', alpha: g });
        const k = pop(t, 3.4); if (k > 0) M.chip(c, 'Public hearing began Mon Nov 23', CX, 1110, { align: 'center', size: 48, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k) });
        M.text(c, 'as of Mon Nov 23', CX, 1215, { size: 34, weight: 600, align: 'center', color: '#9fb0c8', alpha: M.seg(t, 3.6, 4.0) });
        M.evidence(c, 'fact', CX, 1270, { align: 'center', size: 30, alpha: M.seg(t, 3.8, 4.2) });
        M.source(c, SRC_H, 60, 1460, { size: 20 });
      } else M.source(c, MAPSRC, 60, 1460, { size: 20 });
  } },
  // S2 THE ASK: house outline draws, +15% slams, typical-home chip
  { dur: sc[2].sceneDur, trans: { kind: 'wipe', dur: .45 }, draw: (c, t) => {
      navyCard(c);
      house(c, CX, 420, 190, M.seg(t, .05, 1.3, 'inOutCubic'));
      const pc = M.seg(t, .9, 1.8, 'linear'); if (pc > 0) M.counter(c, 15, pc, CX, 720, { size: 190, decimals: 0, slam: true, color: GOLD, prefix: '+', suffix: '%' });
      M.text(c, 'city property tax revenue, 2027', CX, 930, { size: 52, weight: 700, align: 'center', color: '#ffffff', alpha: M.seg(t, 1.6, 2.0) });
      M.text(c, 'from existing properties', CX, 1000, { size: 40, weight: 600, align: 'center', color: '#9fb0c8', alpha: M.seg(t, 1.9, 2.3) });
      M.evidence(c, 'proposed', CX, 1065, { align: 'center', size: 28, alpha: M.seg(t, 2.2, 2.6) });
      const k = pop(t, 4.2); if (k > 0) M.chip(c, 'Typical home: about +$37 a month', CX, 1150, { align: 'center', size: 54, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k) });
      M.evidence(c, 'estimate', CX, 1260, { align: 'center', size: 28, alpha: M.seg(t, 4.6, 5.0) });
      M.source(c, SRC_C, 60, 1460, { size: 20 });
  } },
  // S3 THE POLICE REQUEST: two quote cards, mayor then commission chair, exact words highlighted
  { dur: sc[3].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      navyCard(c);
      M.kinetic(c, 'POLICE BUDGET REQUEST', t, CX, 270, { size: 76, every: .06, maxW: 880, highlight: ['police'] });
      const p1 = M.seg(t, .2, 2.6, 'linear'), p2 = M.seg(t, 2.9, 5.6, 'linear');
      c.save(); c.translate((1 - M.ease.outCubic(M.seg(t, .2, .7))) * -500, 0); quoteCard(c, 70, 440, 820, 330, 'Mayor Jeromy Farkas', 'on the police capital request', 'unprecedented', p1, 78); c.restore();
      c.save(); c.translate((1 - M.ease.outCubic(M.seg(t, 2.9, 3.4))) * 500, 0); quoteCard(c, 70, 810, 820, 410, 'Amtul Siddiqui', 'Calgary Police Commission chair', 'There is no room to cut in this police budget.', p2, 64); c.restore();
      M.source(c, SRC_CBC, 60, 1460, { size: 20 });
  } },
  // S4 WHAT'S BEING SAID: attributed scale 0% -> 15%, three markers (no prediction)
  { dur: sc[4].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      navyCard(c);
      M.kinetic(c, "WHAT'S BEING SAID", t, CX, 270, { size: 90, every: .07, maxW: 880 });
      const x0 = 130, x1 = 830, y = 800, p = M.seg(t, .3, 1.3, 'inOutCubic'), X = v => M.lerp(x0, x1, v / 15);
      c.save(); c.lineCap = 'round'; c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 16; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
      c.strokeStyle = '#ffffff'; c.beginPath(); c.moveTo(x0, y); c.lineTo(M.lerp(x0, x1, p), y); c.stroke(); c.restore();
      [0, 5, 10, 15].forEach(v => M.text(c, v + '%', X(v), y + 36, { size: 34, weight: 600, align: 'center', color: '#9fb0c8', alpha: p }));
      // marker 1: 0% (councillor)
      const k1 = pop(t, 1.0); if (k1 > 0) { c.save(); c.globalAlpha = Math.min(1, k1); c.fillStyle = SKY; c.beginPath(); c.arc(X(0), y, 26, 0, 7); c.fill(); c.restore();
        M.text(c, '0%', X(0) - 20, 400, { size: 80, weight: 800, color: SKY, alpha: Math.min(1, k1) });
        M.text(c, 'councillor wants a zero per cent option', X(0) - 20, 495, { size: 48, weight: 700, color: '#ffffff', maxW: 440, alpha: Math.min(1, k1) });
        M.text(c, 'option sought', X(0) - 20, 670, { size: 40, weight: 600, color: '#9fb0c8', alpha: Math.min(1, k1) }); }
      // marker 2: 4-5% band (mayor)
      const k2 = M.seg(t, 3.6, 4.2, 'outCubic'); if (k2 > 0) { c.save(); c.globalAlpha = k2; c.fillStyle = GOLD; M.rr(c, X(4), y - 24, (X(5) - X(4)) * k2, 48, 24); c.fill(); c.restore();
        c.save(); c.strokeStyle = GOLD; c.lineWidth = 4; c.globalAlpha = k2; c.beginPath(); c.moveTo(X(4.5), y + 30); c.lineTo(X(4.5), 990); c.stroke(); c.restore();
        M.text(c, '4-5%', X(4.5) - 30, 1000, { size: 80, weight: 800, color: GOLD, alpha: k2 });
        M.text(c, 'mayor: to keep the lights on', X(4.5) - 40, 1095, { size: 48, weight: 700, color: '#ffffff', maxW: 760, alpha: k2 }); }
      // marker 3: 15% proposed
      const k3 = pop(t, 1.6); if (k3 > 0) { c.save(); c.globalAlpha = Math.min(1, k3); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(X(15), y, 26, 0, 7); c.fill(); c.restore();
        M.text(c, '15%', X(15) + 10, 540, { size: 80, weight: 800, align: 'right', color: '#ffffff', alpha: Math.min(1, k3) });
        M.text(c, 'proposed', X(15) + 10, 635, { size: 48, weight: 700, align: 'right', color: '#dfe7f2', alpha: Math.min(1, k3) }); }
      M.source(c, SRC_LW, 60, 1460, { size: 20 });
  } },
  // S5 WHAT'S NEXT: process stages, hearing lit (now); 69+ counter
  { dur: sc[5].sceneDur, trans: { kind: 'dissolve', dur: .4 }, draw: (c, t) => {
      navyCard(c);
      M.text(c, "WHAT'S NEXT", CX, 300, { size: 96, weight: 800, align: 'center', color: GOLD });
      const names = ['PUBLIC HEARING', 'AMENDMENTS', 'FINAL APPROVAL'], x = 90, w = W - 300, y = 560, step = w / 3, p = M.seg(t, .2, 1.4);
      c.save(); c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 6; c.beginPath(); c.moveTo(x + step / 2, y); c.lineTo(x + w - step / 2, y); c.stroke();
      c.strokeStyle = GOLD; c.beginPath(); c.moveTo(x + step / 2, y); c.lineTo(x + step / 2 + step * .5 * p, y); c.stroke(); c.restore();
      names.forEach((n, i) => { const on = i === 0, cx = x + step * (i + .5), a = M.seg(t, .2 + i * .25, .5 + i * .25);
        c.save(); c.globalAlpha = a; c.fillStyle = on ? GOLD : '#0e1726'; c.strokeStyle = on ? GOLD : 'rgba(255,255,255,.5)'; c.lineWidth = 5; c.beginPath(); c.arc(cx, y, on ? 30 : 22, 0, 7); c.fill(); c.stroke(); c.restore();
        M.text(c, n, cx, y + 50, { size: 34, weight: on ? 800 : 600, align: 'center', color: on ? '#ffffff' : '#9fb0c8', maxW: step - 10, alpha: a }); });
      const kn = pop(t, .8); if (kn > 0) M.chip(c, 'NOW', x + step / 2, y - 110, { align: 'center', size: 40, alpha: Math.min(1, kn) });
      const pc = M.seg(t, 1.4, 2.3, 'linear'); if (pc > 0) M.counter(c, 69, pc, CX, 800, { size: 190, decimals: 0, slam: true, color: '#ffffff', suffix: '+' });
      M.text(c, 'amendments filed', CX, 1010, { size: 60, weight: 700, align: 'center', color: '#dfe7f2', alpha: M.seg(t, 2.0, 2.4) });
      M.text(c, 'as of Mon Nov 23', CX, 1090, { size: 36, weight: 600, align: 'center', color: '#9fb0c8', alpha: M.seg(t, 2.2, 2.6) });
      M.source(c, SRC_N, 60, 1460, { size: 20 });
  } },
  // S6 CLOSER: two-option question, no end card
  { dur: sc[6].sceneDur, draw: (c, t) => { navyCard(c); M.closer(c, 'Cut the increase, or keep the plan?', M.seg(t, 0, sc[6].sceneDur, 'linear'), W, H, { highlight: ['cut', 'keep'] }); } },
], overlay: (c, t, info) => {
  if (t > 3 && info.index < 6) M.header(c, window.LOGO, W, H);
  if (info.index < 6) M.caption(c, S.captionAt(t), W, H);
  const mid = sc[3].sceneStart + .4; M.followPill(c, (t - mid) / 2, W, H);
} });

window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.4, sfx: 'ping', gain: -12 }, { t: 1.25, sfx: 'click', gain: -14 },
  { t: sc[1].sceneStart - .2, sfx: 'whoosh', gain: -14 }, { t: sc[1].sceneStart + .5, sfx: 'pop', gain: -13 }, { t: sc[1].sceneStart + 1.5, sfx: 'ticks', dur: 1.7, gain: -17 }, { t: sc[1].sceneStart + 3.2, sfx: 'stamp', gain: -13 },
  { t: sc[2].sceneStart - .2, sfx: 'whoosh', gain: -13 }, { t: sc[2].sceneStart + 1.8, sfx: 'pop', gain: -11 }, { t: sc[2].sceneStart + 4.2, sfx: 'pop', gain: -12 },
  { t: sc[3].sceneStart + .25, sfx: 'shutter', gain: -14 }, { t: sc[3].sceneStart + 2.95, sfx: 'shutter', gain: -14 },
  { t: sc[4].sceneStart + 1.0, sfx: 'click', gain: -13 }, { t: sc[4].sceneStart + 1.6, sfx: 'click', gain: -13 }, { t: sc[4].sceneStart + 3.6, sfx: 'click', gain: -13 },
  { t: sc[5].sceneStart + .8, sfx: 'pop', gain: -13 }, { t: sc[5].sceneStart + 2.3, sfx: 'stamp', gain: -11 },
  { t: sc[6].sceneStart - .1, sfx: 'whoosh', gain: -14 },
];
