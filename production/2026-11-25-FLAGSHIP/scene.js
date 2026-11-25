/* 2026-11-25 FLAGSHIP: "The Oil Boom That Started With a Gas Well: Turner Valley, 1914" (Calgary Insight ORIGINS).
 * Lead identity Storyteller (dusk foothills derrick illustration with a venting gas plume and push-ins; night flare; dusk drone over the real downtown).
 * Borrowed: Data Explainer counter slam (L5) and 500-dot grid (L9), bar (L12); Civic Analyst evidence/newspaper cards (L2, L6, L10) and a cutaway (L7).
 * One file, three cuts (+ thumbnails with --param thumb=1): --param cut=short|wide|teaser
 * Every number, date, name and label on screen maps to the audited claims table in packages/2026-11-25-FLAGSHIP-turner-valley-1914.md.
 * Derrick, plume, flare and gusher are illustrations (labelled), not reconstructions of the real rigs. */
const PR = window.PARAMS || {}, CUT = PR.cut || 'short', THUMB = !!PR.thumb;
const WIDE = CUT === 'wide';
const W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920;
const CX = WIDE ? W / 2 : (W - 120) / 2 + 30;
const L = WIDE ? { hookY: 120, hook: 120, stampY: 170, chip: 44, src: [48, H - 40], fov: 46, big: 120 }
               : { hookY: 330, hook: 140, stampY: 380, chip: 50, src: [60, 1462], fov: 62, big: 130 };

// measured Kokoro line durations, index = line order in probe/tts_lines.json: 0-14 = L0-L14, 15 = Q, 16 = C, 17 = T1, 18 = T2
const VD = PR.vd ? PR.vd.split(',').map(Number) : [3.0, 6.0, 10.5, 5.5, 6.0, 7.0, 6.5, 7.5, 4.0, 6.5, 9.5, 7.5, 4.0, 6.0, 7.0, 3.5, 2.6, 9.5, 5.0];
const LINES = {
 L0: "Calgary's first oil boom started with a gas well.",
 L1: 'In nineteen-eleven, a rancher named William Herron noticed gas seeping out along the Sheep River.',
 L2: "He teamed up with a driller, Archibald Dingman, and some of Calgary's most influential businessmen. In nineteen-thirteen, they started drilling in Turner Valley, southwest of the city.",
 L3: 'On May fourteenth, nineteen-fourteen, a well in Turner Valley, Dingman Number One, blew in.',
 L4: 'Calgary went wild. People drove out to see it, and filled their cars straight from the well.',
 L5: 'More than five hundred oil companies were started. Some brokers were so swamped with orders, they locked their doors.',
 L6: 'The Calgary Herald reported more than four hundred thousand dollars pulled from savings accounts at Calgary banks.',
 L7: "But it wasn't the oil investors had hoped for. The well had struck wet natural gas, rich in a light liquid called naphtha.",
 L8: 'That August, the First World War began, and the boom was over.',
 L9: 'By the end of the war, all but twenty-one of those companies had failed. Most never even drilled a well.',
 L10: "In nineteen twenty-one, Imperial Oil took over Dingman's company. Alberta's energy history archive says that confirmed Calgary as the centre of Canada's oil and gas industry.",
 L11: "Turner Valley kept going. In nineteen twenty-four, Royalite Number Four erupted in fire, at a place called Hell's Half Acre.",
 L12: 'Turner Valley flared away about ninety percent of its gas supply.',
 L13: 'Then in nineteen thirty-six, a well called Royalties Number One struck oil, and set off another oil boom.',
 L14: 'According to Calgary Economic Development, Calgary today is home to head offices of almost every major company in the energy business.',
 Q: "So, did you know Calgary's first oil boom started with gas?",
 C: 'Yes or no? Drop your thoughts below.',
 T1: "On May fourteenth, nineteen-fourteen, a well in Turner Valley blew in. More than five hundred oil companies were started. But it wasn't the oil investors had hoped for.",
 T2: 'Full video on our page. Did you know this? Drop your thoughts below.',
};
const IDX = { T0: 0, Q: 15, C: 16, T1: 17, T2: 18 };
const DUR = id => VD[IDX[id] ?? +id.slice(1)];
const DROP = (PR.drop || '').split(',').filter(Boolean);
const ORDER = ({ wide: ['L0','L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11','L12','L13','L14','Q','C'],
                short: ['L0','L3','L4','L5','L7','L8','L9','L13','L14','Q','C'],
                teaser: ['T0','T1','T2'] }[CUT]).filter(id => !DROP.includes(id));
const TXT = id => LINES[id === 'T0' ? 'L0' : id];
const S = M.script(ORDER.map((id, i) => ({ text: TXT(id), dur: DUR(id), gapAfter: id === 'Q' ? .25 : (CUT === 'teaser' ? ({ T0: .8, T1: .7 })[id] : (ORDER[i + 1] === 'L7' ? .8 : undefined)) })),
                   { lead: .3, gap: CUT === 'teaser' ? .35 : .4, tail: CUT === 'teaser' ? 1.4 : 1.3 });
const sc = S.scenes;

// ---------- palette and places (continuity bible) ----------
const GOLD = M.house.gold, ORANGE = '#f7931e', NAVY = '#0b1f3a', INK = '#070d18';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const COLS = { land: '#16263f', park: '#1b3531', water: '#2c5378', building: '#3a4a60', road: '#2a3a52', motorway: '#46566e', community: '#ffffff' };
const TV = [-14200, -41900, 0];          // Turner Valley gas plant / Dingman No. 1 site, from 50.668 N 114.275 W (approximate location)
const DT = [0, 0, 0];
const MID = [-7100, -20950, 0];
const BND = () => { const b = window.GEO.boundary[0]; let best = b[0]; (Array.isArray(b[0][0]) ? b : [b]).forEach(r => { if (r.length > best.length) best = r; }); return Array.isArray(best[0]) ? best : b; };

// ---------- helpers ----------
const cam = o => M.camera(Object.assign({ fov: L.fov }, o), W, H);
const above = (p, h, back = .35, o = {}) => cam({ pos: [p[0] + (o.dx || 0), p[1] - h * back, h], look: [p[0], p[1] + (o.ahead || 0), 0] });
const ease = (t, a, b, e = 'inOutCubic') => M.seg(t, a, b, e);
const band = (c, y0, y1, a = .7) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const src = (c, s, dy = 0) => M.source(c, s, L.src[0], L.src[1] - dy, { size: 20, maxW: WIDE ? 1500 : 860 });
const navyBg = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, NAVY); g.addColorStop(1, INK); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const gridBg = (c, t) => { navyBg(c); c.save(); c.globalAlpha = .07; c.strokeStyle = '#9fb7d6'; c.lineWidth = 1; const g = 60, off = (t * 8) % g; for (let x = -g + off; x < W; x += g) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = -g + off; y < H; y += g) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } c.restore(); };
const north = c => { const nx = WIDE ? W - 90 : W - 190, ny = WIDE ? 170 : 300; c.save(); c.globalAlpha = .9; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(nx, ny - 34); c.lineTo(nx + 15, ny + 8); c.lineTo(nx - 15, ny + 8); c.closePath(); c.fill(); M.text(c, 'N', nx, ny + 14, { size: 28, weight: 800, align: 'center' }); c.restore(); };
const chip = (c, s, y, k, o = {}) => { if (k > 0) M.chip(c, s, o.x ?? CX, y, Object.assign({ align: 'center', size: L.chip + 4, alpha: Math.min(1, k) }, o)); };
const stamp = (c, s, t, t0, x = CX, y = L.stampY, size, col = GOLD) => { const k = M.seg(t, t0, t0 + .35, 'outBack'); if (k <= 0) return; size = size || (WIDE ? 96 : 110);
  c.save(); c.translate(x, y); c.rotate(-.04); const s2 = M.lerp(1.8, 1, Math.min(1, k)); c.scale(s2, s2); c.globalAlpha = Math.min(1, k * 1.5);
  c.font = M.font(size, 800); const tw = c.measureText(s).width; M.rr(c, -tw / 2 - 34, -size * .62, tw + 68, size * 1.24, 22); c.fillStyle = 'rgba(7,13,24,.86)'; c.fill(); c.lineWidth = 8; c.strokeStyle = col; c.stroke();
  M.text(c, s, 0, -size * .52, { size, weight: 800, align: 'center', color: '#fff' }); c.restore(); };
const illus = c => M.text(c, 'illustration', WIDE ? W - 60 : W - 150, WIDE ? H - 120 : 1380, { size: 24, weight: 600, align: 'right', color: '#c9d3e0', alpha: .85 });
function headline(c, t, txt, hl, o = {}) { band(c, WIDE ? 20 : 200, WIDE ? 400 : 780, .62);
  M.kinetic(c, txt, THUMB ? 9 : t, CX, o.y ?? L.hookY, { size: (o.size || L.hook) * (THUMB ? (WIDE ? 1.25 : 1.0) : 1), maxW: WIDE ? 1600 : 860, t0: -0.12, every: .09, highlight: hl }); }
function card(c, t, t0, title, lines, status, o = {}) { const k = ease(t, t0, t0 + .45, 'outCubic'); if (k <= 0) return;
  const cw = o.w || (WIDE ? 860 : 880), lh = WIDE ? 62 : 70, ch = ((o.ts || (WIDE ? 60 : 64)) + (WIDE ? 90 : 106)) + lines.length * lh + (status ? (WIDE ? 80 : 90) : 0), x = o.x ?? (WIDE ? W - cw - 90 : CX - cw / 2), y = (o.y ?? (WIDE ? 300 : 560)) + (1 - k) * 40;
  c.save(); c.globalAlpha = k; M.rr(c, x, y, cw, ch, 24); c.fillStyle = 'rgba(247,244,236,.97)'; c.fill(); c.fillStyle = o.col || ORANGE; M.rr(c, x, y, 18, ch, 9); c.fill(); c.restore();
  M.text(c, title, x + 50, y + 34, { size: o.ts || (WIDE ? 60 : 64), weight: 800, color: '#1b2533', shadow: false, alpha: k, maxW: cw - 90 });
  const ly0 = (o.ts || (WIDE ? 60 : 64)) + (WIDE ? 65 : 76);
  lines.forEach((ln, i) => M.text(c, ln, x + 50, y + ly0 + i * lh, { size: WIDE ? 44 : 48, weight: 600, color: '#3a4656', shadow: false, alpha: ease(t, t0 + .3 + i * .25, t0 + .6 + i * .25), maxW: cw - 90 }));
  if (status) { const ks = ease(t, t0 + .6 + lines.length * .25, t0 + .9 + lines.length * .25, 'outBack'); if (ks > 0) M.chip(c, status, x + 50, y + ch - (WIDE ? 82 : 92), { size: WIDE ? 40 : 46, bg: o.col || ORANGE, color: NAVY, alpha: Math.min(1, ks) }); } }

// ---------- the foothills derrick (illustration; DERRICK-A in the continuity bible) ----------
// o: {sky:'dusk'|'night', zoom, plume:'gas'|'oil'|null, flare:0..1, shake, ax (anchor x frac), cars}
function foothills(c, t, o = {}) {
  const night = o.sky === 'night', hz = H * (WIDE ? .60 : .58), z = o.zoom || 1;
  const dx = WIDE ? W * .5 : CX, base = H * (WIDE ? .86 : .74), hgt = H * (WIDE ? .56 : .36), top = base - hgt;
  const ax = dx, ay = top + hgt * .25;
  let sx = 0, sy = 0; if (o.shake) { sx = Math.sin(t * 61) * o.shake; sy = Math.cos(t * 47) * o.shake; }
  const zoomL = (f, fn) => { c.save(); const zz = 1 + (z - 1) * f; c.translate(ax + sx * f, ay + sy * f); c.scale(zz, zz); c.translate(-ax, -ay); fn(); c.restore(); };
  // sky
  const g = c.createLinearGradient(0, 0, 0, hz + 60);
  if (night) { g.addColorStop(0, '#050a14'); g.addColorStop(.7, '#121c33'); g.addColorStop(1, '#2a2235'); }
  else { g.addColorStop(0, '#0e1a33'); g.addColorStop(.45, '#3a3550'); g.addColorStop(.8, '#b4643a'); g.addColorStop(1, '#e39a55'); }
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (o.flare) { const fx = WIDE ? W * .78 : W * .74, fy = base - 10, r = (WIDE ? 900 : 1100) * (.85 + .15 * Math.sin(t * 9)); const gg = c.createRadialGradient(fx, fy, 0, fx, fy, r); gg.addColorStop(0, `rgba(255,140,50,${.55 * o.flare})`); gg.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = gg; c.fillRect(0, 0, W, H); }
  // mountains (far, blue), low on the west horizon
  zoomL(.25, () => { c.fillStyle = night ? '#141d30' : '#4a5677'; c.beginPath(); c.moveTo(-200, hz + 20);
    for (let x = -200; x <= W + 200; x += 20) { const y = hz - 60 - 90 * Math.abs(Math.sin(x * .006)) - 50 * Math.abs(Math.sin(x * .017 + 1.3)) - 20 * Math.sin(x * .05); c.lineTo(x, y); }
    c.lineTo(W + 200, hz + 20); c.closePath(); c.fill(); });
  // foothills (two rolling layers)
  zoomL(.55, () => { c.fillStyle = night ? '#0f1714' : '#3b3a2c'; c.beginPath(); c.moveTo(-300, H); for (let x = -300; x <= W + 300; x += 20) c.lineTo(x, hz + 10 - 40 * Math.sin(x * .004 + .7) - 18 * Math.sin(x * .013)); c.lineTo(W + 300, H); c.closePath(); c.fill(); });
  zoomL(.85, () => { c.fillStyle = night ? '#0a0f0d' : '#262619'; c.beginPath(); c.moveTo(-300, H); for (let x = -300; x <= W + 300; x += 20) c.lineTo(x, base - 30 - 30 * Math.sin(x * .003 + 2.1) - 12 * Math.sin(x * .011)); c.lineTo(W + 300, H); c.closePath(); c.fill(); });
  zoomL(1, () => {
    // shed
    c.fillStyle = night ? '#1b1410' : '#4a3424'; c.fillRect(dx + hgt * .16, base - hgt * .12, hgt * .22, hgt * .12); c.beginPath(); c.moveTo(dx + hgt * .14, base - hgt * .12); c.lineTo(dx + hgt * .27, base - hgt * .19); c.lineTo(dx + hgt * .40, base - hgt * .12); c.closePath(); c.fill();
    // derrick: tapering four-legged tower with braces
    const bw = hgt * .16, tw = hgt * .035; c.strokeStyle = night ? '#2a2018' : '#20160e'; c.lineCap = 'round';
    c.lineWidth = Math.max(3, hgt * .012); c.beginPath(); c.moveTo(dx - bw, base); c.lineTo(dx - tw, top); c.moveTo(dx + bw, base); c.lineTo(dx + tw, top); c.moveTo(dx - bw * .45, base); c.lineTo(dx - tw * .4, top); c.moveTo(dx + bw * .45, base); c.lineTo(dx + tw * .4, top); c.stroke();
    c.lineWidth = Math.max(2, hgt * .006); c.beginPath();
    for (let k = 1; k <= 7; k++) { const f = k / 8, y = base - hgt * f, hw = M.lerp(bw, tw, f); c.moveTo(dx - hw, y); c.lineTo(dx + hw, y); const f2 = (k - 1) / 8, y2 = base - hgt * f2, hw2 = M.lerp(bw, tw, f2); c.moveTo(dx - hw2, y2); c.lineTo(dx + hw, y); c.moveTo(dx + hw2, y2); c.lineTo(dx - hw, y); }
    c.stroke(); c.fillStyle = night ? '#2a2018' : '#20160e'; c.fillRect(dx - tw * 1.8, top - hgt * .03, tw * 3.6, hgt * .03);
    // plume
    if (o.plume) { const rnd = M.rng(o.plume === 'oil' ? 11 : 7), N = 70, ph = hgt * (WIDE ? .95 : 1.25);
      for (let i = 0; i < N; i++) { const off = rnd(), sp = .45 + rnd() * .35, a = ((t * sp + off) % 1), drift = (rnd() - .3) * hgt * .5, wob = Math.sin(t * 3 + i) * hgt * .02;
        const x = dx + drift * a * a + wob, y = top - hgt * .02 - a * ph, r = hgt * (.02 + .13 * a) * (o.plume === 'oil' ? .7 : 1);
        if (o.plume === 'gas') { c.fillStyle = `rgba(238,234,222,${.30 * (1 - a)})`; } else { c.fillStyle = `rgba(14,12,10,${.75 * (1 - a * .7)})`; }
        c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
      if (o.plume === 'gas') { const jg = c.createLinearGradient(dx, top, dx, top - hgt * .5); jg.addColorStop(0, 'rgba(250,248,240,.75)'); jg.addColorStop(1, 'rgba(250,248,240,0)'); c.fillStyle = jg; c.beginPath(); c.moveTo(dx - tw, top); c.lineTo(dx - hgt * .09, top - hgt * .5); c.lineTo(dx + hgt * .09, top - hgt * .5); c.lineTo(dx + tw, top); c.closePath(); c.fill(); }
      if (o.plume === 'oil') { const jg = c.createLinearGradient(dx, top, dx, top - hgt * .6); jg.addColorStop(0, 'rgba(10,8,6,.95)'); jg.addColorStop(1, 'rgba(10,8,6,0)'); c.fillStyle = jg; c.beginPath(); c.moveTo(dx - tw, top); c.lineTo(dx - hgt * .06, top - hgt * .6); c.lineTo(dx + hgt * .06, top - hgt * .6); c.lineTo(dx + tw, top); c.closePath(); c.fill();
        for (let i = 0; i < 40; i++) { const off = rnd(), a = (t * .9 + off) % 1, side = rnd() < .5 ? -1 : 1, x = dx + side * (hgt * .05 + a * hgt * .35 * rnd()), y = top - hgt * .5 + a * a * hgt * 1.4; c.fillStyle = 'rgba(14,12,10,.8)'; c.beginPath(); c.arc(x, y, hgt * .008, 0, 7); c.fill(); } } }
    // ground flare (1924 scene)
    if (o.flare) { const fx = WIDE ? W * .78 : W * .74, fy = base - 6, fh = hgt * .55 * o.flare; const rnd = M.rng(5);
      for (let i = 0; i < 26; i++) { const off = rnd(), a = (t * 1.6 + off) % 1, x = fx + (rnd() - .5) * hgt * .3 * (1 - a * .6) + Math.sin(t * 7 + i) * 8, y = fy - a * fh, r = hgt * (.07 * (1 - a) + .015);
        const fg = c.createRadialGradient(x, y, 0, x, y, r); fg.addColorStop(0, `rgba(255,230,140,${.9 * (1 - a)})`); fg.addColorStop(.5, `rgba(255,130,40,${.6 * (1 - a)})`); fg.addColorStop(1, 'rgba(200,60,20,0)'); c.fillStyle = fg; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } }
  });
  if (o.flare) M.weather(c, 'embers', t, W, H, { count: 70, seed: 9 });
  // grade + vignette
  const vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
}

// ---------- map of Calgary and Turner Valley ----------
function map(c, cm, o = {}) {
  const w = M.world({ sky: 'night', drawSky: false, fog: { near: 20000, far: 220000, max: .5, color: '#0d1830' } });
  navyBg(c);
  M.geo.addBase(w, { buildings: !!o.buildings, colors: COLS, windows: '#ffd27a', windowAlpha: .55, riverW: 120, lrt: false, communities: false });
  w.line(BND(), { wm: o.bndW || 260, color: GOLD, order: 6, alpha: o.bndA ?? .9, minPx: 2.5 });
  if (o.route != null) { const n = 40, k = Math.max(.001, o.route), pts = []; for (let i = 0; i <= n * k; i++) { const f = i / n; pts.push([M.lerp(DT[0], TV[0], f), M.lerp(DT[1], TV[1], f)]); }
    if (pts.length > 1) w.line(pts, { wm: 220, color: '#ffffff', order: 7, alpha: .75, minPx: 3, dash: [18, 14] }); }
  if (o.cars) { for (let i = 0; i < 14; i++) { const f = ((o.cars * .35 + i / 14) % 1); const p = [M.lerp(DT[0], TV[0], f), M.lerp(DT[1], TV[1], f), 0];
      w.at(p, (ctx, sp) => { ctx.save(); ctx.fillStyle = '#ffd27a'; ctx.shadowColor = '#ffd27a'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(sp.x, sp.y, WIDE ? 9 : 11, 0, 7); ctx.fill(); ctx.restore(); }); } }
  const pinK = o.pin ?? 1;
  if (pinK > 0) w.at(TV, (ctx, sp) => { const k = M.ease.outBack(Math.min(1, pinK)), r = (WIDE ? 26 : 32) * k; ctx.save();
    const gl = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, r * 4); gl.addColorStop(0, 'rgba(247,147,30,.6)'); gl.addColorStop(1, 'rgba(247,147,30,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(sp.x, sp.y, r * 4, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sp.x, sp.y, r, 0, 7); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = ORANGE; ctx.stroke(); ctx.restore();
    M.text(ctx, o.pinLabel || 'TURNER VALLEY', sp.x, sp.y + (WIDE ? 46 : 54), { size: WIDE ? 50 : 58, weight: 800, align: 'center', stroke: 7, strokeColor: '#06101f', alpha: Math.min(1, pinK * 2), shadow: false });
    M.text(ctx, 'approximate location', sp.x, sp.y + (WIDE ? 112 : 130), { size: WIDE ? 26 : 30, weight: 600, align: 'center', color: '#c9d3e0', alpha: Math.min(1, pinK * 2), shadow: false }); });
  if (o.cityLabel !== false) w.at([1500, 6000, 0], (ctx, sp) => M.text(ctx, 'CALGARY', sp.x, sp.y - 20, { size: WIDE ? 54 : 62, weight: 800, align: 'center', color: GOLD, stroke: 7, strokeColor: '#06101f', shadow: false }));
  w.render(c, cm);
}
const MAPCAM = (h) => WIDE ? above([-9500, -26500, 0], h * 1.4, .12) : above([-10500, -31000, 0], h * 1.15, .10);
const downtown = (c, t, d, o = {}) => { const p = ease(t, 0, d, 'linear'), w = M.world({ sky: o.sky || 'dusk', fog: { near: 2500, far: 16000, max: .6 } });
  M.geo.addBase(w, { buildings: true, colors: { land: '#2a2a33', park: '#263a33', water: '#2f557a', building: '#5a5f73', road: '#4a4655', motorway: '#6a5f66' }, windows: '#ffd27a', windowAlpha: .75, lrt: false });
  w.render(c, cam(M.moves.orbit([0, 0, 0], o.r || 2600, o.h || 900, o.a0 ?? 200, o.turn ?? 40, p))); };

// ---------- scenes ----------
const D = {
  L0: (c, t, d) => { const z = THUMB ? 1.25 : M.lerp(1, 1.55, ease(t, 0, Math.min(d, 2.6), 'outCubic'));
    foothills(c, t + 2, { sky: 'dusk', zoom: z, plume: 'gas', shake: THUMB ? 0 : 3 * (1 - ease(t, 0, 1.2)) });
    if (THUMB) return;
    headline(c, t, "Calgary's first oil boom started with gas", ['gas'], { size: WIDE ? 120 : L.hook });
    illus(c); },
  L1: (c, t, d) => { const p = ease(t, 0, d * .8, 'inOutCubic');
    map(c, MAPCAM(M.lerp(24000, WIDE ? 62000 : 78000, p)), { pin: ease(t, d * .3, d * .3 + .5), pinLabel: 'SHEEP RIVER · TURNER VALLEY' });
    stamp(c, '1911', t, .35); chip(c, 'GAS SEEPS ALONG THE SHEEP RIVER', L.stampY + (WIDE ? 95 : 120), ease(t, .8, 1.2), { size: L.chip });
    north(c); src(c, MAPC + ' · Source: Alberta Culture, Energy Heritage'); },
  L2: (c, t, d) => { map(c, MAPCAM(WIDE ? 62000 : 78000), { pin: 1 }); c.fillStyle = 'rgba(7,13,24,.55)'; c.fillRect(0, 0, W, H);
    const nameS = WIDE ? 104 : 110, x0 = WIDE ? 160 : CX, al = WIDE ? 'left' : 'center';
    const k1 = ease(t, .1, .5, 'outCubic'), k2 = ease(t, d * .2, d * .2 + .4, 'outCubic');
    M.text(c, 'WILLIAM HERRON', x0, (WIDE ? 120 : 330) + (1 - k1) * 30, { size: nameS, weight: 800, align: al, alpha: k1, maxW: WIDE ? 1500 : 860 });
    chip(c, 'RANCHER', WIDE ? 250 : 470, k1, WIDE ? { x: 164, align: 'left' } : {});
    M.text(c, 'ARCHIBALD DINGMAN', x0, (WIDE ? 340 : 600) + (1 - k2) * 30, { size: nameS, weight: 800, align: al, alpha: k2, color: GOLD, maxW: WIDE ? 1500 : 860 });
    chip(c, 'DRILLER', WIDE ? 470 : 740, k2, WIDE ? { x: 164, align: 'left' } : {});
    chip(c, '+ CALGARY BUSINESSMEN', WIDE ? 560 : 840, ease(t, d * .35, d * .35 + .4, 'outBack'), Object.assign({ bg: '#ffffff', color: NAVY }, WIDE ? { x: 164, align: 'left' } : {}));
    stamp(c, '1913', t, d * .58, WIDE ? 1500 : CX, WIDE ? 700 : 1020); chip(c, 'DRILLING STARTS', WIDE ? 810 : 1150, ease(t, d * .65, d * .65 + .35, 'outBack'), Object.assign({ bg: ORANGE, color: NAVY }, WIDE ? { x: 1500 } : {}));
    chip(c, 'SOUTHWEST OF CALGARY', WIDE ? 890 : 1240, ease(t, d * .8, d * .8 + .35, 'outBack'), WIDE ? { x: 1500 } : {});
    src(c, 'Sources: Alberta Culture, Energy Heritage · The Canadian Encyclopedia'); },
  L3: (c, t, d) => { const z = M.lerp(1.0, 1.35, ease(t, 0, d, 'outCubic'));
    foothills(c, t, { sky: 'dusk', zoom: z, plume: 'gas', shake: 5 * (1 - ease(t, d * .3, d * .3 + 1.2)) * (t > d * .3 ? 1 : 0) });
    stamp(c, 'MAY 14, 1914', t, .3); chip(c, 'DINGMAN NO. 1 BLOWS IN', L.stampY + (WIDE ? 100 : 125), ease(t, d * .3, d * .3 + .4, 'outBack'), { bg: ORANGE, color: NAVY });
    illus(c); src(c, 'Source: Alberta Culture, Energy Heritage'); },
  L4: (c, t, d) => { const p = ease(t, 0, d, 'inOutSine');
    map(c, MAPCAM(M.lerp(WIDE ? 62000 : 78000, WIDE ? 56000 : 70000, p)), { pin: 1, route: ease(t, 0, d * .4), cars: t });
    band(c, WIDE ? 60 : 220, WIDE ? 460 : 640, .55);
    M.kinetic(c, 'Calgary went wild', t, CX, WIDE ? 130 : 300, { size: WIDE ? 110 : 120, maxW: WIDE ? 1600 : 860, highlight: ['wild'] });
    chip(c, 'DROVE OUT TO SEE IT', WIDE ? 290 : 470, ease(t, d * .35, d * .35 + .35, 'outBack'), { bg: '#ffffff', color: NAVY });
    chip(c, 'FILLED THEIR CARS AT THE WELL', WIDE ? 370 : 560, ease(t, d * .6, d * .6 + .35, 'outBack'), { bg: ORANGE, color: NAVY });
    M.text(c, 'route schematic', WIDE ? W - 60 : CX, WIDE ? H - 120 : 1360, { size: 26, weight: 600, align: WIDE ? 'right' : 'center', color: '#c9d3e0' });
    north(c); src(c, MAPC + ' · Source: Alberta Culture, Energy Heritage'); },
  L5: (c, t, d) => { gridBg(c, t); const rnd = M.rng(21);
    for (let i = 0; i < 14; i++) { const t0 = .15 + i * .12, k = ease(t, t0, t0 + .3, 'outBack'); if (k <= 0) continue; const cx = WIDE ? 200 + rnd() * 1520 : 140 + rnd() * 760, cy = WIDE ? 600 + rnd() * 280 : 860 + rnd() * 340, rot = (rnd() - .5) * .5;
      c.save(); c.translate(cx, cy); c.rotate(rot); c.scale(M.lerp(1.6, 1, Math.min(1, k)), M.lerp(1.6, 1, Math.min(1, k))); c.globalAlpha = Math.min(1, k) * .92; M.rr(c, -120, -75, 240, 150, 10); c.fillStyle = '#efe6cf'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#8a6d3b'; c.stroke();
      M.text(c, 'SHARES', 0, -52, { size: 30, weight: 800, align: 'center', color: '#5a4320', shadow: false }); M.text(c, 'OIL CO.', 0, -10, { size: 26, weight: 700, align: 'center', color: '#5a4320', shadow: false }); c.restore(); }
    const p = ease(t, .2, d * .45, 'linear'); M.counter(c, 500, p, CX, WIDE ? 90 : 300, { size: WIDE ? 200 : 220, color: GOLD, slam: true, suffix: p >= 1 ? '+' : '' });
    chip(c, 'NEW OIL COMPANIES · 1914', WIDE ? 330 : 560, ease(t, .5, .9), { size: L.chip + 4 });
    chip(c, 'BROKERS LOCK THEIR DOORS', WIDE ? 430 : 680, ease(t, d * .62, d * .62 + .35, 'outBack'), { bg: ORANGE, color: NAVY });
    src(c, 'Sources: Alberta Culture, Energy Heritage · P. Chastko, The Boom (University of Calgary Press)', WIDE ? 0 : -10); },
  L6: (c, t, d) => { downtown(c, t, d, { sky: 'night', a0: 120, turn: 25, r: 3000, h: 1100 }); c.fillStyle = 'rgba(7,13,24,.5)'; c.fillRect(0, 0, W, H);
    const k = ease(t, .1, .55, 'outCubic'); const cw = WIDE ? 1100 : 900, x = CX - cw / 2, y = (WIDE ? 160 : 420) + (1 - k) * 50, ch = WIDE ? 680 : 760;
    c.save(); c.globalAlpha = k; c.translate(CX, y + ch / 2); c.rotate(-.02); c.translate(-CX, -(y + ch / 2)); M.rr(c, x, y, cw, ch, 10); c.fillStyle = '#f1ead8'; c.fill();
    M.text(c, 'CALGARY HERALD', CX, y + 40, { size: WIDE ? 92 : 84, weight: 800, align: 'center', color: '#1b1610', shadow: false, maxW: cw - 60 });
    c.fillStyle = '#1b1610'; c.fillRect(x + 40, y + (WIDE ? 150 : 140), cw - 80, 5);
    c.fillStyle = '#c9c0aa'; for (let i = 0; i < 6; i++) c.fillRect(x + 50, y + ch - 230 + i * 30, (cw - 100) * (i % 3 === 2 ? .55 : .95), 10); c.restore();
    const kv = ease(t, .7, 1.1, 'outBack'); if (kv > 0) M.text(c, '$400,000+', CX, y + (WIDE ? 200 : 190), { size: WIDE ? 150 : 150, weight: 800, align: 'center', color: '#b5401c', shadow: false, alpha: Math.min(1, kv) });
    M.text(c, 'withdrawn from savings', CX, y + (WIDE ? 380 : 380), { size: WIDE ? 60 : 62, weight: 800, align: 'center', color: '#1b1610', shadow: false, alpha: ease(t, 1.1, 1.4), maxW: cw - 80 });
    M.text(c, 'at Calgary banks', CX, y + (WIDE ? 455 : 460), { size: WIDE ? 60 : 62, weight: 800, align: 'center', color: '#1b1610', shadow: false, alpha: ease(t, 1.3, 1.6), maxW: cw - 80 });
    chip(c, 'AS REPORTED', y + ch + (WIDE ? 10 : 40), ease(t, d * .55, d * .55 + .35, 'outBack'), { bg: ORANGE, color: NAVY });
    src(c, 'Source: Calgary Herald, as quoted by Alberta Culture, Energy Heritage'); },
  L7: (c, t, d) => { gridBg(c, t); const gy = WIDE ? 300 : 620, gx0 = WIDE ? 120 : 40, gx1 = WIDE ? 1100 : W - 160, wx = WIDE ? 610 : CX;
    // strata
    const layers = [['#4b5a3a', 30], ['#7a6146', 120], ['#8f7a5a', 140], ['#6c5a48', 160], ['#5a6170', 200]]; let yy = gy;
    layers.forEach(([col, h], i) => { c.fillStyle = col; c.fillRect(gx0, yy, gx1 - gx0, h * (WIDE ? 1.0 : 1.4)); yy += h * (WIDE ? 1.0 : 1.4); });
    const bot = yy, pipeK = ease(t, .1, 1.2, 'outCubic');
    c.fillStyle = '#20160e'; c.fillRect(wx - 70, gy - (WIDE ? 160 : 220), 140, 16); c.strokeStyle = '#20160e'; c.lineWidth = 10; c.beginPath(); c.moveTo(wx - 60, gy); c.lineTo(wx - 12, gy - (WIDE ? 160 : 220)); c.moveTo(wx + 60, gy); c.lineTo(wx + 12, gy - (WIDE ? 160 : 220)); c.stroke();
    c.fillStyle = '#c9ced6'; c.fillRect(wx - 14, gy, 28, (bot - 40 - gy) * pipeK); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(wx + 6, gy, 8, (bot - 40 - gy) * pipeK);
    // reservoir: porous rock with gas + droplets rising up the pipe
    const rnd = M.rng(4), ry = bot - (WIDE ? 160 : 220);
    for (let i = 0; i < 60; i++) { const x = gx0 + 30 + rnd() * (gx1 - gx0 - 60), y = ry + 20 + rnd() * (bot - ry - 40); c.fillStyle = 'rgba(30,36,48,.5)'; c.beginPath(); c.arc(x, y, 6 + rnd() * 8, 0, 7); c.fill(); }
    if (pipeK >= 1) for (let i = 0; i < 26; i++) { const off = rnd(), a = (t * .5 + off) % 1, x = wx + (rnd() - .5) * 10, y = M.lerp(bot - 40, gy - (WIDE ? 120 : 160), a), liq = i % 3 === 0;
      c.fillStyle = liq ? 'rgba(247,180,60,.95)' : 'rgba(235,240,248,.85)'; c.beginPath(); c.arc(x, y, liq ? 7 : 11, 0, 7); c.fill(); }
    // labels
    const lx = WIDE ? 1180 : CX, la = WIDE ? 'left' : 'center';
    const k0 = ease(t, .2, .5); if (k0 > 0) { const yq = WIDE ? 230 : 300; M.text(c, 'CRUDE OIL?', lx, yq, { size: WIDE ? 104 : 112, weight: 800, align: la, alpha: k0, color: '#fff' });
      const ks = ease(t, d * .25, d * .25 + .4); if (ks > 0) { c.save(); c.font = M.font(WIDE ? 104 : 112, 800); const tw = c.measureText('CRUDE OIL?').width, x0 = WIDE ? lx : lx - tw / 2; c.strokeStyle = '#e8453c'; c.lineWidth = 14; c.beginPath(); c.moveTo(x0 - 10, yq + (WIDE ? 55 : 60)); c.lineTo(x0 - 10 + (tw + 20) * ks, yq + (WIDE ? 55 : 60)); c.stroke(); c.restore(); } }
    if (WIDE) { chip(c, 'WET NATURAL GAS', 470, ease(t, d * .45, d * .45 + .35, 'outBack'), { x: lx, align: 'left', size: 50 }); chip(c, 'NAPHTHA (A LIGHT LIQUID)', 570, ease(t, d * .65, d * .65 + .35, 'outBack'), { x: lx, align: 'left', bg: GOLD, color: NAVY, size: 50 }); }
    else { chip(c, 'WET NATURAL GAS', 450, ease(t, d * .45, d * .45 + .35, 'outBack')); chip(c, 'NAPHTHA (A LIGHT LIQUID)', 540, ease(t, d * .65, d * .65 + .35, 'outBack'), { bg: GOLD, color: NAVY }); }
    M.text(c, 'illustration, not to scale', WIDE ? 1180 : CX, WIDE ? 680 : bot + 30, { size: 26, weight: 600, align: WIDE ? 'left' : 'center', color: '#c9d3e0' });
    src(c, 'Sources: Alberta Culture, Energy Heritage · P. Chastko, The Boom (University of Calgary Press)'); },
  L8: (c, t, d) => { foothills(c, t + 5, { sky: 'dusk', zoom: 1.1, plume: 'gas' }); const dim = ease(t, d * .4, d * .75); c.fillStyle = `rgba(7,13,24,${.35 + .5 * dim})`; c.fillRect(0, 0, W, H);
    const y = WIDE ? 380 : 640, x0 = WIDE ? 360 : 150, x1 = WIDE ? 1560 : 870, hp = ease(t, .2, d * .5);
    c.save(); c.lineCap = 'round'; c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 8; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); c.strokeStyle = GOLD; c.beginPath(); c.moveTo(x0, y); c.lineTo(M.lerp(x0, x1, hp), y); c.stroke(); c.restore();
    [[x0, 'MAY 1914', 'THE WELL', .1, GOLD], [x1, 'AUGUST 1914', 'WAR', d * .45, '#e8453c']].forEach(([x, a, b, t0, col]) => { const k = ease(t, t0, t0 + .35, 'outBack'); if (k <= 0) return;
      c.save(); c.globalAlpha = Math.min(1, k); c.fillStyle = col; c.beginPath(); c.arc(x, y, 22, 0, 7); c.fill(); c.restore();
      M.text(c, a, x, y - (WIDE ? 120 : 130), { size: WIDE ? 64 : 62, weight: 800, align: 'center', alpha: Math.min(1, k) }); M.chip(c, b, x, y + 44, { align: 'center', size: L.chip + 4, alpha: Math.min(1, k), bg: col, color: NAVY }); });
    stamp(c, 'BOOM OVER', t, d * .6, CX, WIDE ? 720 : 1020, WIDE ? 120 : 120, '#e8453c'); illus(c);
    src(c, 'Source: Legion Magazine, "Alberta\'s first real oil boom"'); },
  L9: (c, t, d) => { gridBg(c, t); const cols = 25, rows = 20, gs = WIDE ? 30 : 29, gw = cols * gs, gx = WIDE ? 160 : CX - gw / 2, gyy = WIDE ? 300 : 410; const rnd = M.rng(31), keep = new Set();
    while (keep.size < 21) keep.add(Math.floor(rnd() * 500)); const fade = ease(t, d * .2, d * .6);
    for (let i = 0; i < 500; i++) { const r = Math.floor(i / cols), q = i % cols, kept = keep.has(i); const a = kept ? 1 : 1 - .85 * fade; const k = ease(t, i / 500 * .6, i / 500 * .6 + .2);
      if (k <= 0) continue; c.fillStyle = kept && fade > .2 ? GOLD : `rgba(200,212,230,${a})`; c.beginPath(); c.arc(gx + q * gs + gs / 2, gyy + r * gs + gs / 2, (gs * .36) * (kept && fade > .2 ? 1.2 : 1) * k, 0, 7); c.fill(); }
    chip(c, '500+ COMPANIES', WIDE ? 200 : 310, ease(t, .1, .4), WIDE ? { x: gx + gw / 2 } : {});
    const kc = ease(t, d * .45, d * .7, 'linear');
    if (WIDE) { if (kc > 0) { M.counter(c, 21, kc, 1380, 330, { size: 240, color: GOLD, from: 500, ease: 'outCubic' }); M.text(c, 'LEFT', 1380, 600, { size: 110, weight: 800, align: 'center', alpha: kc }); }
      chip(c, 'BY THE END OF THE WAR', 780, ease(t, d * .7, d * .7 + .35, 'outBack'), { x: 1380, bg: ORANGE, color: NAVY }); }
    else { if (kc > 0) M.counter(c, 21, kc, CX, 1010, { size: 150, color: GOLD, from: 500, ease: 'outCubic', suffix: ' LEFT' });
      chip(c, 'BY THE END OF THE WAR', 1225, ease(t, d * .7, d * .7 + .35, 'outBack'), { bg: ORANGE, color: NAVY }); }
    src(c, 'Illustrative: 1 dot = 1 company · Source: Alberta Culture, Energy Heritage'); },
  L10: (c, t, d) => { downtown(c, t, d, { sky: 'dusk', a0: 200, turn: 40 });
    card(c, t, .3, '1921', ['Imperial Oil takes over', "Dingman's company,", 'Calgary Petroleum Products'], null, { ts: WIDE ? 110 : 110, y: WIDE ? 160 : 330 });
    const k = ease(t, d * .45, d * .45 + .4, 'outBack'); if (k > 0) { if (WIDE) { chip(c, 'CALGARY: CENTRE OF THE INDUSTRY', 760, k, { x: W - 90 - 430, size: 46, bg: GOLD, color: NAVY }); chip(c, 'Alberta energy-heritage archive', 840, k, { x: W - 90 - 430, size: 32, bg: '#ffffff', color: NAVY }); }
      else { chip(c, 'CALGARY: CENTRE', 1000, k, { bg: GOLD, color: NAVY }); chip(c, 'OF THE INDUSTRY', 1085, k, { bg: GOLD, color: NAVY }); chip(c, 'Alberta energy-heritage archive', 1170, k, { size: 34, bg: '#ffffff', color: NAVY }); } }
    src(c, 'Map data © OpenStreetMap contributors · Source: Alberta Culture, Energy Heritage'); },
  L11: (c, t, d) => { foothills(c, t, { sky: 'night', zoom: M.lerp(1.05, 1.25, ease(t, 0, d)), flare: ease(t, 0, .8) });
    stamp(c, '1924', t, .3); chip(c, 'ROYALITE NO. 4 ERUPTS IN FIRE', L.stampY + (WIDE ? 100 : 125), ease(t, d * .35, d * .35 + .35, 'outBack'), { bg: ORANGE, color: NAVY, size: L.chip });
    chip(c, "HELL'S HALF ACRE", L.stampY + (WIDE ? 185 : 215), ease(t, d * .65, d * .65 + .35, 'outBack'), { bg: '#ffffff', color: NAVY });
    illus(c); src(c, 'Source: Alberta Culture, Energy Heritage'); },
  L12: (c, t, d) => { foothills(c, t + 3, { sky: 'night', zoom: 1.15, flare: 1 }); c.fillStyle = 'rgba(7,13,24,.62)'; c.fillRect(0, 0, W, H);
    const bx = WIDE ? 260 : 110, bw = WIDE ? 1400 : 820, by = WIDE ? 520 : 820, bh = WIDE ? 120 : 130, p = ease(t, .3, d * .6, 'outCubic');
    M.rr(c, bx, by, bw, bh, 18); c.fillStyle = 'rgba(255,255,255,.14)'; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,.5)'; c.stroke();
    M.rr(c, bx, by, Math.max(4, bw * .9 * p), bh, 18); c.fillStyle = ORANGE; c.fill();
    M.text(c, 'GAS SUPPLY', bx, by - (WIDE ? 80 : 90), { size: WIDE ? 56 : 58, weight: 800 });
    M.counter(c, 90, p, CX, WIDE ? 170 : 360, { size: WIDE ? 210 : 220, color: ORANGE, suffix: '%', prefix: '~' });
    chip(c, 'FLARED AWAY', WIDE ? 410 : 650, ease(t, d * .4, d * .4 + .35, 'outBack'), { bg: ORANGE, color: NAVY });
    M.text(c, "of Turner Valley's gas supply (approx.)", CX, by + bh + 30, { size: WIDE ? 40 : 42, weight: 600, align: 'center', color: '#dfe7f2', maxW: WIDE ? 1400 : 860, alpha: ease(t, d * .5, d * .7) });
    illus(c); src(c, 'Source: Alberta Culture, Energy Heritage (Flaring)'); },
  L13: (c, t, d) => { foothills(c, t, { sky: 'dusk', zoom: M.lerp(1, 1.3, ease(t, 0, d)), plume: 'oil', shake: 2 });
    stamp(c, '1936', t, .3); chip(c, 'ROYALTIES NO. 1 STRIKES OIL', L.stampY + (WIDE ? 100 : 125), ease(t, d * .3, d * .3 + .35, 'outBack'), { bg: GOLD, color: NAVY, size: L.chip });
    chip(c, 'ANOTHER BOOM', L.stampY + (WIDE ? 185 : 215), ease(t, d * .65, d * .65 + .35, 'outBack'), { bg: '#ffffff', color: NAVY });
    illus(c); src(c, 'Source: Alberta Culture, Energy Heritage'); },
  L14: (c, t, d) => { downtown(c, t, d, { sky: 'dusk', a0: 250, turn: 45, r: 2300, h: 700 }); band(c, WIDE ? 20 : 220, WIDE ? 600 : 880, .6);
    M.kinetic(c, 'TODAY', t, CX, WIDE ? 40 : 270, { size: WIDE ? 120 : 130, maxW: 860, highlight: ['today'] });
    const k = ease(t, d * .3, d * .3 + .5, 'outBack');
    if (k > 0) { c.save(); c.translate(CX, WIDE ? 250 : 520); const z = M.lerp(1.5, 1, Math.min(1, k)); c.scale(z, z); M.text(c, 'HEAD OFFICES', 0, -60, { size: WIDE ? 130 : 116, weight: 800, align: 'center', color: GOLD, alpha: Math.min(1, k) }); c.restore(); }
    M.text(c, 'of almost every major', CX, WIDE ? 330 : 600, { size: WIDE ? 60 : 60, weight: 700, align: 'center', alpha: ease(t, d * .42, d * .42 + .4) });
    M.text(c, 'energy company', CX, WIDE ? 400 : 675, { size: WIDE ? 60 : 60, weight: 700, align: 'center', alpha: ease(t, d * .5, d * .5 + .4) });
    chip(c, 'ACCORDING TO CALGARY ECONOMIC DEVELOPMENT', WIDE ? 500 : 770, ease(t, .2, .6), { size: WIDE ? 34 : 36, bg: '#ffffff', color: NAVY });
    src(c, 'Map data © OpenStreetMap contributors · Source: Calgary Economic Development'); },
  Q: (c, t, d) => { downtown(c, t + 6, d, { sky: 'night', a0: 290, turn: 10, r: 2300, h: 700 }); band(c, WIDE ? 20 : 220, WIDE ? 460 : 900, .66);
    M.kinetic(c, "So, did you know Calgary's first oil boom started with gas?", t, CX, WIDE ? 150 : 300, { size: WIDE ? 100 : 104, maxW: WIDE ? 1500 : 860, highlight: ['gas?'], every: .08 }); },
  C: (c, t, d) => { downtown(c, t + 9, d, { sky: 'night', a0: 300, turn: 6, r: 2300, h: 700 }); c.fillStyle = 'rgba(7,13,24,.9)'; c.fillRect(0, 0, W, H);
    M.closer(c, "Did you know Calgary's first oil boom started with gas? Yes or no?", M.seg(t, 0, d, 'linear') + .3, W, H, { highlight: ['yes', 'no?'] }); },
  T0: (c, t, d) => D.L0(c, t, d),
  T1: (c, t, d) => { const z = M.lerp(1.1, 1.4, ease(t, 0, d));
    foothills(c, t, { sky: 'dusk', zoom: z, plume: 'gas', shake: 4 * (1 - ease(t, .3, 1.5)) }); c.fillStyle = `rgba(7,13,24,${.25 + .35 * ease(t, d * .3, d * .45)})`; c.fillRect(0, 0, W, H);
    stamp(c, 'MAY 14, 1914', t, .3); chip(c, 'TURNER VALLEY', L.stampY + 125, ease(t, .8, 1.2, 'outBack'), { bg: ORANGE, color: NAVY });
    const p = ease(t, d * .33, d * .6, 'linear'); if (p > 0) { M.counter(c, 500, p, CX, 700, { size: 220, color: GOLD, slam: true, suffix: p >= 1 ? '+' : '' }); chip(c, 'NEW OIL COMPANIES', 950, ease(t, d * .4, d * .5)); }
    const k0 = ease(t, d * .7, d * .78); if (k0 > 0) { M.text(c, 'CRUDE OIL?', CX, 1080, { size: 112, weight: 800, align: 'center', alpha: k0 }); const ks = ease(t, d * .82, d * .92); if (ks > 0) { c.save(); c.font = M.font(112, 800); const tw = c.measureText('CRUDE OIL?').width; c.strokeStyle = '#e8453c'; c.lineWidth = 14; c.beginPath(); c.moveTo(CX - tw / 2 - 10, 1140); c.lineTo(CX - tw / 2 - 10 + (tw + 20) * ks, 1140); c.stroke(); c.restore(); } }
    illus(c); src(c, 'Source: Alberta Culture, Energy Heritage'); },
  T2: (c, t, d) => { if (t >= 2.2) { D.C(c, t - 2.2, d - 2.2); return; } navyBg(c); const a = 1 - M.seg(t, 1.6, 2.0);
    M.text(c, '▶ FULL VIDEO', CX, 600, { size: 112, weight: 800, align: 'center', alpha: a * M.seg(t, 0, .25) });
    M.text(c, 'on our page', CX, 760, { size: 64, weight: 700, align: 'center', color: GOLD, maxW: 860, alpha: a * M.seg(t, .2, .45) });
    M.text(c, 'calgaryinsight.ca', CX, 1000, { size: 44, weight: 600, align: 'center', alpha: a * M.seg(t, .3, .55) }); },
};
const TRANS = { L0: { kind: 'match', dur: .45 }, L1: { kind: 'push', dur: .4 }, L2: { kind: 'dissolve', dur: .5 }, L3: { kind: 'whip', dur: .35 }, L4: { kind: 'flash', dur: .3 },
  L5: { kind: 'push', dur: .4 }, L6: { kind: 'dissolve', dur: .5 }, L7: { kind: 'zoom', dur: .4 }, L8: { kind: 'dissolve', dur: .5 }, L9: { kind: 'match', dur: .45 },
  L10: { kind: 'dissolve', dur: .5 }, L11: { kind: 'push', dur: .4 }, L12: { kind: 'whip', dur: .35 }, L13: { kind: 'dissolve', dur: .5 }, L14: { kind: 'dissolve', dur: .45 }, Q: { kind: 'dissolve', dur: .35 },
  T0: { kind: 'whip', dur: .35 }, T1: { kind: 'dissolve', dur: .45 } };
const TR = (id, i) => { if (!ORDER[i + 1]) return undefined; if (CUT === 'short' && id === 'L0') return { kind: 'whip', dur: .35 }; if (CUT === 'short' && id === 'L5') return { kind: 'zoom', dur: .4 }; if (CUT === 'short' && id === 'L9') return { kind: 'dissolve', dur: .5 }; return TRANS[id]; };

function originsHeader(c) { if (!window.LOGO) return; c.save();
  if (!WIDE) { const s = 70; c.font = M.font(40, 700); const a = c.measureText('Calgary Insight ').width; c.font = M.font(40, 800); const b = c.measureText('ORIGINS').width; const x = CX - (s + 18 + a + b) / 2;
    c.drawImage(window.LOGO, x, 140, s, s); M.text(c, 'Calgary Insight', x + s + 18, 140 + s / 2, { size: 40, base: 'middle', weight: 700, shadow: 8 }); M.text(c, 'ORIGINS', x + s + 18 + a, 140 + s / 2, { size: 40, base: 'middle', weight: 800, color: ORANGE, shadow: 8 }); }
  else { c.drawImage(window.LOGO, 48, 40, 60, 60); c.font = M.font(30, 700); const a = c.measureText('Calgary Insight ').width; M.text(c, 'Calgary Insight', 124, 70, { size: 30, base: 'middle', weight: 700, shadow: 8 }); M.text(c, 'ORIGINS', 124 + a, 70, { size: 30, base: 'middle', weight: 800, color: ORANGE, shadow: 8 }); }
  c.restore(); }
function thumbBrand(c) { if (!window.LOGO) return; const s = WIDE ? 64 : 84, x = WIDE ? 40 : 60, y = WIDE ? H - s - 30 : 1490; c.drawImage(window.LOGO, x, y, s, s);
  c.font = M.font(WIDE ? 32 : 40, 700); const a = c.measureText('Calgary Insight ').width; M.text(c, 'Calgary Insight', x + s + 16, y + s / 2, { size: WIDE ? 32 : 40, base: 'middle', weight: 700 }); M.text(c, 'ORIGINS', x + s + 16 + a, y + s / 2, { size: WIDE ? 32 : 40, base: 'middle', weight: 800, color: ORANGE }); }
function thumbText(c) { if (WIDE) { band(c, 0, H, .0); const g = c.createLinearGradient(0, 0, W * .75, 0); g.addColorStop(0, 'rgba(7,13,24,.88)'); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    M.text(c, 'OIL BOOM?', 70, 150, { size: 150, weight: 900, color: GOLD }); M.text(c, 'IT WAS GAS', 70, 330, { size: 150, weight: 900, color: '#fff' }); }
  else { band(c, 300, 1000, .7); M.text(c, 'OIL BOOM?', CX, 380, { size: 150, weight: 900, align: 'center', color: GOLD }); M.text(c, 'IT WAS GAS', CX, 560, { size: 150, weight: 900, align: 'center', color: '#fff', maxW: 900 }); } }

function chunks(txt) { const ws = txt.split(/\s+/), out = []; let cur = [];
  ws.forEach((w, i) => { cur.push(w); const n = cur.length, punct = /[,.?!:;]$/.test(w), rest = ws.length - i - 1; if ((punct && n >= 3 && (rest === 0 || rest >= 3)) || n >= 9 && rest >= 3) { out.push(cur.join(' ')); cur = []; } });
  if (cur.length) { if (out.length && cur.length < 3) out[out.length - 1] += ' ' + cur.join(' '); else out.push(cur.join(' ')); } return out; }
function capAt(t) { const s = S.lineAt(t); if (!s) return ''; const cs = chunks(s.caption), tot = cs.reduce((a, x) => a + x.split(' ').length, 0); let acc = 0;
  for (const ch of cs) { acc += ch.split(' ').length; if (t < s.start + s.speech * acc / tot) return ch; } return cs[cs.length - 1]; }
window.CAPTIONS = () => S.scenes.map(s => ({ start: s.start, chunks: chunks(s.caption) }));

window.BUILD = () => { window.CUES = CUESFN(); return M.film({ W, H, identity: 'storyteller', scenes: ORDER.map((id, i) => ({ dur: sc[i].sceneDur, trans: TR(id, i), draw: (c, t) => D[id](c, t, sc[i].sceneDur) })),
  letterbox: () => 0,
  overlay: (c, t, info) => {
    const last = info.index === ORDER.length - 1 || (CUT === 'teaser' && ORDER[info.index] === 'T2' && t - sc[info.index].sceneStart >= 2.2);
    if (THUMB) { thumbText(c); thumbBrand(c); return; }
    if (t > 3 && !last && !(CUT === 'teaser' && ORDER[info.index] === 'T2')) originsHeader(c);
    if (!last) M.caption(c, capAt(t), W, H, WIDE ? {} : { bottom: 1410 });
    if (S.total > 25) { const mid = S.total / 2; M.followPill(c, M.seg(t, mid - 1, mid + 1, 'linear'), W, H); }
  } }); };

const CUESFN = () => { const s = i => sc[i].sceneStart, cues = [{ t: 0, sfx: 'impact', gain: -5 }, { t: .05, sfx: 'whoosh', gain: -12 }, { t: 0, sfx: 'wind', gain: -16, dur: Math.min(3, sc[0].sceneDur) }];
  ORDER.forEach((id, i) => { const d = sc[i].sceneDur, at = (x, sfx, g, o = {}) => cues.push(Object.assign({ t: s(i) + x, sfx, gain: g }, o));
    if (i > 0) { const k = TR(ORDER[i - 1], i - 1) && TR(ORDER[i - 1], i - 1).kind; cues.push({ t: Math.max(0, s(i) - .2), sfx: k === 'flash' ? 'impact' : (k === 'dissolve' || k === 'match' ? 'whoosh_rev' : 'whoosh'), gain: k === 'dissolve' ? -16 : -11 }); }
    if (id === 'L1') { at(.35, 'stamp', -8); at(d * .3, 'ping', -12); }
    if (id === 'L2') { at(.1, 'pop', -12); at(d * .2, 'pop', -12); at(d * .58, 'stamp', -7); at(d * .8, 'pop', -12); }
    if (id === 'L3' || id === 'T1') { at(.3, 'stamp', -7); at(d * .3, 'wind', -12, { dur: 1.6 }); at(d * .3, 'impact', -9); }
    if (id === 'L4') { at(0, 'city', -24, { dur: d }); at(d * .35, 'pop', -12); at(d * .6, 'pop', -12); }
    if (id === 'L5') { at(.2, 'ticks', -15, { dur: d * .4 }); at(d * .45, 'impact', -9); at(d * .62, 'thud', -10); }
    if (id === 'L6') { at(.1, 'thud', -12); at(.7, 'stamp', -9); at(d * .55, 'pop', -12); }
    if (id === 'L7') { at(-.8, 'riser', -18, { dur: .8 }); at(d * .25, 'thud', -10); at(d * .45, 'pop', -12); at(d * .65, 'pop', -12); }
    if (id === 'L8') { at(.1, 'ping', -13); at(d * .45, 'impact', -8); at(d * .6, 'stamp', -6); }
    if (id === 'L9') { at(d * .2, 'riser', -20, { dur: d * .4 }); at(d * .7, 'stamp', -8); }
    if (id === 'L10') { at(.3, 'thud', -12); at(d * .45, 'pop', -12); }
    if (id === 'L11') { at(0, 'wind', -12, { dur: d }); at(.3, 'stamp', -7); at(d * .35, 'impact', -10); at(d * .65, 'pop', -12); }
    if (id === 'L12') { at(.3, 'ticks', -15, { dur: d * .5 }); at(d * .4, 'pop', -12); }
    if (id === 'L13') { at(0, 'wind', -14, { dur: 2 }); at(.3, 'stamp', -7); at(d * .3, 'pop', -12); at(d * .65, 'pop', -12); }
    if (id === 'L14') { at(0, 'swell', -18, { dur: d }); at(.2, 'pop', -12); }
    if (id === 'T2') { at(.1, 'ping', -12); }
  });
  return cues; };
window.TOTAL = () => S.total;
