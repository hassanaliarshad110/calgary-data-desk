/* 2026-11-17 FLAGSHIP: "Before the Numbers: When Calgary's Avenues Had Names".
 * Lead identity: Storyteller (dusk/night drones over the real OSM/City downtown, map dives, dissolves). Borrowed: Data Explainer
 * sign flips, stamps and kinetic hook (S0, S3-S6, S12); Civic Analyst document and address cards (S5, S9).
 * One file, three cuts (+ thumbnails with --param thumb=1):
 *   python3 ../../motion/engine/render.py scene.js short.mp4  --geo ../../motion/geo/calgary_base.json --param cut=short
 *   python3 ../../motion/engine/render.py scene.js wide.mp4   --geo ../../motion/geo/calgary_base.json --param cut=wide
 *   python3 ../../motion/engine/render.py scene.js teaser.mp4 --geo ../../motion/geo/calgary_base.json --param cut=teaser
 * Every year, name and label on screen maps to the audited claims table in packages/2026-11-17-FLAGSHIP-avenues-had-names.md (C#). */
const PR = window.PARAMS || {}, CUT = PR.cut || 'short', THUMB = !!PR.thumb;
const WIDE = CUT === 'wide';
const W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920;
const CX = WIDE ? W / 2 : (W - 120) / 2 + 30;
const L = WIDE ? { hookY: THUMB ? 250 : 260, hook: THUMB ? 150 : 124, kick: THUMB ? 50 : 40, stampY: 170, name: 96, chip: 44, src: [48, H - 40], fov: 44 }
               : { hookY: 470, hook: 132, kick: 48, stampY: 380, name: 112, chip: 50, src: [60, 1462], fov: 60 };

// measured Kokoro line durations (studio-probe, af_heart) — filled in after narration
const VD = [2.752, 9.301, 11.14, 4.629, 7.553, 5.547, 6.508, 4.076, 7.98, 7.939, 10.2, 5.591, 5.333, 3.335];   // studio-probe run of 2026-11-17; L13 tightened with atempo 1.2 (3.984 s → 3.335 s) so the ending stays ≤ 4 s
const TD = [6.7, 10.2, 5.969];   // T1, T2 (= L10 audio), T3
const LINES = {
  L0: "Calgary's avenues once had names, not numbers.",
  L1: "In early eighteen eighty-four, the Canadian Pacific Railway registered the townsite of Calgary, and named its streets and avenues after company officials.",
  L2: "Vice-presidents Angus and McIntyre. Director Smith. General manager Van Horne. They were the original namesakes of today's Sixth, Seventh, Eleventh and Twelfth Avenues.",
  L3: "The main commercial road was Stephen Avenue, named for the railway's first president.",
  L4: "And today's Ninth Avenue Southeast was once known as Atlantic Avenue, and as Whisky Row. It was Calgary's first main street.",
  L5: "Then, in nineteen oh four, bylaw number five twenty-eight changed the avenue names to numbers.",
  L6: "Stephen Avenue became Eighth Avenue. But for a few years, ads and newspapers kept using the old name too.",
  L7: "Today, avenues run east and west. Streets run north and south.",
  L8: "Roughly speaking, Centre Street splits the city east from west, and the Bow River splits it north from south. That makes four quadrants.",
  L9: "So the quadrant matters. The same address can exist in more than one quadrant. Leave it off, and you could end up on the wrong side of the city.",
  L10: "And here's the twist. Centre Street and Centre Avenue don't meet in the middle of downtown, as you might expect. In theory, they cross in the middle of the Centre Street Bridge.",
  L11: "Even the downtown avenues aren't true east and west. They run parallel to the railway tracks.",
  L12: "As for Stephen Avenue, its name came back in nineteen eighty-one, on the pedestrian mall.",
  L13: "Names or numbers: which would you pick? Drop your thoughts below.",
  T0: "Calgary's avenues once had names, not numbers.",
  T1: "Then, in nineteen oh four, a bylaw changed the avenue names to numbers. Stephen Avenue became Eighth Avenue.",
  T2: "And here's the twist. Centre Street and Centre Avenue don't meet in the middle of downtown, as you might expect. In theory, they cross in the middle of the Centre Street Bridge.",
  T3: "Full video on our page. Names or numbers: which would you pick? Drop your thoughts below.",
};
const DUR = id => id[0] === 'L' ? VD[+id.slice(1)] : (id === 'T0' ? VD[0] : TD[+id.slice(1) - 1]);
const ORDER = { wide: ['L0','L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11','L12','L13'],
                short: ['L0','L1','L3','L5','L6','L8','L9','L10','L12','L13'],
                teaser: ['T0','T1','T2','T3'] }[CUT];
const S = M.script(ORDER.map(id => ({ text: LINES[id], dur: DUR(id), gapAfter: id === 'L9' ? .8 : undefined })),
                   { lead: .3, gap: CUT === 'teaser' ? .35 : .4, tail: CUT === 'teaser' ? 1.0 : .65 });
const sc = S.scenes;

// ---------- places (continuity bible) ----------
const STEPHEN = (M.geo.lm('Stephen Avenue')) || [548, 97, 0];       // OSM node/4868829421 (C14)
const TOWER = (M.geo.lm('Calgary Tower')) || [613, -44, 0];
const CSX = 655;                                                     // Centre Street, just east of the Calgary Tower (simplified)
const BRIDGE = [CSX, 909, 0];                                        // where the Centre Street line meets the Bow in the geo pack (C11, C14)
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const RED = '#e2483d', GOLD = M.house.gold, CREAM = '#f7f4ec', RIVER = '#5aa9e6', SIGN = '#1f6b43', INK = '#22303f';
const NIGHT = { land: '#121821', park: '#16221a', water: '#14304f', building: '#283140', road: '#454a54', motorway: '#6f6044', community: '#9fb0c8' };
const DUSK = { land: '#2e3138', park: '#2b3a30', water: '#2c5378', building: '#5a6270', road: '#6e675c', motorway: '#8a7a5c', community: '#ffffff' };
const MAP = { land: '#16263f', park: '#1d3b33', water: '#2c5378', building: '#3a4a60', road: '#2a3a52', motorway: '#3b4b63', community: '#ffffff' };

let BOW = [];
window.PRELOAD = async () => { BOW = M.geo.riverPath('Bow River', BRIDGE, 30000); };

// ---------- helpers ----------
const cam = o => M.camera(Object.assign({ fov: L.fov }, o), W, H);
const band = (c, y0, y1, a = .7) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.2, `rgba(7,13,24,${a})`); g.addColorStop(.8, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const stamp = (c, s, t, t0, x = CX, y = L.stampY, size, fade = 1, col = GOLD) => { const k = M.seg(t, t0, t0 + .35, 'outBack'); if (k <= 0 || fade <= 0) return; size = size || (WIDE ? 100 : 118);
  c.save(); c.translate(x, y); c.rotate(-.05); const s2 = M.lerp(1.8, 1, k); c.scale(s2, s2); c.globalAlpha = Math.min(1, k * 1.5) * fade;
  c.font = M.font(size, 800); const tw = c.measureText(s).width; M.rr(c, -tw / 2 - 34, -size * .62, tw + 68, size * 1.24, 22); c.fillStyle = col === RED ? 'rgba(250,240,236,.95)' : 'rgba(7,13,24,.85)'; c.fill(); c.lineWidth = 8; c.strokeStyle = col; c.stroke();
  M.text(c, s, 0, -size * .52, { size, weight: 800, align: 'center', color: col === RED ? RED : '#fff', shadow: col !== RED }); c.restore(); };
const src = (c, s) => M.source(c, s, L.src[0], L.src[1], { size: 20, maxW: WIDE ? 1500 : 860 });
const srcMap = (c, s) => { M.source(c, MAPC, L.src[0], L.src[1] - 36, { size: 20 }); if (s) src(c, s); };
const tag = (c, s, y) => M.text(c, s, WIDE ? W - 60 : W - 150, y || (WIDE ? H - 120 : 1400), { size: 22, weight: 500, align: 'right', color: '#c9d3e0' });
const navyBg = (c, a = '#0b1f3a', b = '#070d18') => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const modern = (sky, colors) => { const w = M.world({ sky, fog: { near: 3000, far: 26000, max: .55 } });
  M.geo.addBase(w, { buildings: true, colors, windows: '#ffd27a', windowAlpha: sky === 'night' ? .6 : .4 }); return w; };
const flatMap = (sky = 'night') => { const w = M.world({ sky, fog: { near: 60000, far: 120000, max: .2 } });
  M.geo.addBase(w, { buildings: false, colors: MAP, riverW: 160 }); return w; };

// green street sign; flips from text a to text b with progress k (card flip about its horizontal axis)
function streetSign(c, x, y, w, a, b, k, o = {}) {
  const h = o.h || w * .26, txt = k < .5 ? a : b, sy = Math.abs(Math.cos(Math.PI * Math.min(1, Math.max(0, k))));
  c.save(); c.translate(x, y); c.rotate(o.tilt || 0);
  if (o.post !== false) { c.fillStyle = '#5b6573'; c.fillRect(-8, -h / 2 - 50, 16, 50); }
  c.scale(1, Math.max(.04, sy));
  c.fillStyle = 'rgba(0,0,0,.35)'; M.rr(c, -w / 2 + 8, -h / 2 + 10, w, h, 14); c.fill();
  c.fillStyle = SIGN; M.rr(c, -w / 2, -h / 2, w, h, 14); c.fill(); c.lineWidth = Math.max(4, w * .008); c.strokeStyle = '#ffffff'; M.rr(c, -w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 10); c.stroke();
  M.text(c, txt, 0, -h * .33, { size: h * .56, weight: 800, align: 'center', shadow: false, maxW: w - 60 });
  c.restore(); return h; }

// schematic survey grid (cream card): avenues horizontal (6..12 north→south), streets vertical. o.lab(n) → label, o.hi(n) → colour
const AVES = [6, 7, 8, 9, 10, 11, 12];
function grid(c, x, y, w, h, t, o = {}) {
  c.save(); c.translate(x + w / 2, y + h / 2); if (o.rot) c.rotate(o.rot); c.translate(-w / 2, -h / 2);
  M.rr(c, 0, 0, w, h, 18); c.fillStyle = CREAM; c.fill(); c.strokeStyle = '#c9bfa7'; c.lineWidth = 3; c.stroke();
  const lx = WIDE ? 330 : 300, top = 50, step = (h - 100) / (AVES.length - 1);
  c.strokeStyle = '#d8cfb8'; c.lineWidth = 6; for (let i = 0; i < 6; i++) { const sx = lx + 30 + i * (w - lx - 60) / 5; c.beginPath(); c.moveTo(sx, top - 20); c.lineTo(sx, h - top + 20); c.stroke(); }
  AVES.forEach((n, i) => { const yy = top + i * step, col = o.hi ? o.hi(n) : null;
    c.strokeStyle = col || '#b9ad92'; c.lineWidth = col ? 16 : 9; c.beginPath(); c.moveTo(lx, yy); c.lineTo(w - 30, yy); c.stroke();
    const lab = o.lab ? o.lab(n) : null; if (lab) { const a = lab.a ?? 1, fl = lab.flip ?? 1;
      c.save(); c.translate(lx - 24, yy); c.scale(1, Math.max(.05, fl)); c.globalAlpha *= a;
      M.text(c, lab.s, 0, -(lab.size || (WIDE ? 40 : 46)) * .55, { size: lab.size || (WIDE ? 40 : 46), weight: 800, align: 'right', color: lab.col || INK, shadow: false, maxW: lx - 50 }); c.restore(); } });
  if (o.rail) { const ry = top + 3.5 * step; c.strokeStyle = '#3a2a1c'; c.lineWidth = 6; c.beginPath(); c.moveTo(lx, ry); c.lineTo(lx + (w - lx - 30) * o.rail, ry); c.stroke();
    c.lineWidth = 3; for (let sx = lx; sx < lx + (w - lx - 30) * o.rail; sx += 22) { c.beginPath(); c.moveTo(sx, ry - 12); c.lineTo(sx, ry + 12); c.stroke(); } }
  M.text(c, 'schematic, not to scale', w - 24, h - 40, { size: 20, weight: 500, align: 'right', color: '#7a705c', shadow: false });
  c.restore(); return { lx, top, step };
}
const gridBox = () => WIDE ? { x: 140, y: 290, w: 1000, h: 570 } : { x: 60, y: 620, w: 900, h: 600 };

// the headline in the thumbnail's design (frame 0 = thumbnail)
function headline(c, t) {
  const k = M.seg(t, 0, .45, 'outBack'), s = M.lerp(1.1, 1, k);
  band(c, WIDE ? 60 : 290, WIDE ? 560 : 1000, .66);
  c.save(); c.translate(CX, L.hookY); c.scale(s, s);
  M.chip(c, 'BEFORE THE NUMBERS', 0, -(WIDE ? 120 : 160), { align: 'center', size: L.kick, bg: '#ffffff', color: '#0b1f3a' });
  M.text(c, 'AVENUES', 0, 0, { size: L.hook, weight: 800, align: 'center' });
  M.text(c, 'HAD NAMES', 0, L.hook * 1.08, { size: L.hook * 1.15, weight: 800, align: 'center', color: GOLD });
  c.restore();
}
const pinDot = (c, x, y, r, col, lab, o = {}) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.stroke();
  if (lab) M.text(c, lab, x + (o.dx ?? 0), y + (o.dy ?? 22), { size: o.size || 40, weight: 800, align: 'center', stroke: 6, strokeColor: '#06101f' }); };

// ---------- scenes by line id ----------
const D = {
  // HOOK (C1): dusk drone push toward Stephen Avenue; sign STEPHEN AVE flips to 8 AVENUE (what changed)
  L0: (c, t, d) => {
    const w = modern('dusk', DUSK); M.ping(w, STEPHEN, t, { r: 90 });
    const p = M.seg(t, 0, Math.max(d, 2.5), 'outCubic');
    w.render(c, cam({ pos: [STEPHEN[0] + M.lerp(-900, -380, p), STEPHEN[1] + M.lerp(-1900, -900, p), M.lerp(900, 420, p)], look: [STEPHEN[0], STEPHEN[1] + (WIDE ? 420 : 250), 0] }));
    headline(c, t);
    const k = THUMB ? 0 : M.seg(t, .9, 1.35, 'inOutCubic');
    streetSign(c, CX, WIDE ? 760 : 1180, WIDE ? 760 : 820, 'STEPHEN AVE', '8 AVENUE', k, { tilt: -.03 });
  },
  // 1884, WHERE (C2): map dive onto downtown; pin "Townsite of Calgary"
  L1: (c, t, d) => {
    const w = modern('dusk', DUSK); w.line(BOW, { wm: 90, color: RIVER, p: M.seg(t, .3, 1.8), order: 8, glow: 4, noFog: true, minPx: 4 });
    M.label(w, [-2600, 1900, 0], 'Bow River', { size: WIDE ? 34 : 40, color: '#cfe8ff', alpha: M.seg(t, 1.6, 2.0) });
    M.pin(w, STEPHEN, 'Townsite of Calgary', { p: M.seg(t, 2.2, 2.8, 'linear'), size: WIDE ? 40 : 44, scale: 1.2 }); M.ping(w, STEPHEN, t - 2.2);
    w.render(c, cam(M.moves.dive([STEPHEN[0], STEPHEN[1] - 150, 0], M.seg(t, 0, d, 'outCubic'), { h0: 9000, h1: 2200, back0: 1, back1: 1600, ahead: 100 })));
    band(c, WIDE ? 60 : 270, WIDE ? 420 : 760, .6);
    stamp(c, '1884', t, .15, CX, WIDE ? 150 : 380);
    M.chip(c, 'CANADIAN PACIFIC RAILWAY', CX, WIDE ? 270 : 540, { align: 'center', size: L.chip, bg: '#ffffff', alpha: M.seg(t, .9, 1.3) });
    M.chip(c, 'NAMED FOR COMPANY OFFICIALS', CX, WIDE ? 350 : 640, { align: 'center', size: L.chip, alpha: M.seg(t, d * .62, d * .62 + .4) });
    srcMap(c, 'Source: Harry Sanders, CBC Calgary');
  },
  // NAMESAKES (C3): four names settle on the set of avenues 6, 7, 11, 12 (no one-to-one mapping)
  L2: (c, t, d) => {
    navyBg(c); const g = gridBox(), k = M.seg(t, d * .55, d * .55 + .6);
    grid(c, g.x, g.y, g.w, g.h, t, { hi: n => [6, 7, 11, 12].includes(n) && k > 0 ? GOLD : null, lab: n => [6, 7, 11, 12].includes(n) ? { s: n + ' AVE', a: k } : null });
    const names = ['ANGUS', 'McINTYRE', 'SMITH', 'VAN HORNE'], sub = ['vice-president', 'vice-president', 'director', 'general manager'];
    names.forEach((nm, i) => { const t0 = .2 + i * (d * .45 / 4), a = M.seg(t, t0, t0 + .35, 'outCubic'), x = 1260, y = 290 + i * 125;
      if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate((1 - a) * 80, 0);
      M.rr(c, x, y, 520, 108, 16); c.fillStyle = 'rgba(255,255,255,.08)'; c.fill(); c.strokeStyle = GOLD; c.lineWidth = 3; c.stroke();
      M.text(c, nm, x + 30, y + 12, { size: 52, weight: 800 }); M.text(c, sub[i], x + 30, y + 68, { size: 28, weight: 600, color: '#c9d3e0' }); c.restore(); });
    M.chip(c, 'ORIGINAL NAMESAKES OF TODAY’S 6, 7, 11 AND 12 AVENUES', CX, 150, { align: 'center', size: 40, alpha: M.seg(t, d * .55, d * .55 + .4) });
    src(c, 'Source: Harry Sanders, CBC Calgary');
  },
  // STEPHEN AVENUE (C4): main road lights gold; sign swings in
  L3: (c, t, d) => {
    navyBg(c); const g = gridBox();
    grid(c, g.x, g.y, g.w, g.h, t, { hi: n => n === 8 ? GOLD : null, lab: n => n === 8 ? { s: 'STEPHEN', a: M.seg(t, .3, .7), col: '#8a5a00' } : null });
    const k = M.seg(t, .2, .8, 'outBack');
    c.save(); c.globalAlpha = Math.min(1, k * 1.4); streetSign(c, WIDE ? 1530 : CX, WIDE ? 470 : 400, WIDE ? 700 : 800, 'STEPHEN AVE', 'STEPHEN AVE', 0, { tilt: M.lerp(-.3, -.02, k) }); c.restore();
    const sw3 = M.seg(t, d * .5, d * .5 + .3);
    M.chip(c, 'MAIN COMMERCIAL ROAD', WIDE ? 1530 : CX, WIDE ? 640 : 545, { align: 'center', size: L.chip, bg: '#ffffff', alpha: M.seg(t, 1.0, 1.4) * (WIDE ? 1 : 1 - sw3) });
    M.chip(c, 'NAMED FOR THE RAILWAY’S FIRST PRESIDENT', WIDE ? 1530 : CX, WIDE ? 730 : 545, { align: 'center', size: WIDE ? 36 : 44, alpha: WIDE ? M.seg(t, d * .5, d * .5 + .4) : sw3, maxW: WIDE ? 680 : 900 });
    src(c, 'Sources: Harry Sanders, CBC Calgary · City of Calgary heritage walking tour guide');
  },
  // ATLANTIC AVENUE / WHISKY ROW (C5)
  L4: (c, t, d) => {
    navyBg(c); const g = gridBox(), am = '#e8913a';
    grid(c, g.x, g.y, g.w, g.h, t, { hi: n => n === 9 ? am : (n === 8 ? 'rgba(242,182,50,.45)' : null), lab: n => n === 9 ? { s: 'ATLANTIC', a: M.seg(t, .3, .7), col: '#9a4d00' } : (n === 8 ? { s: 'STEPHEN', col: '#8a5a00', a: .6 } : null) });
    const k = M.seg(t, .2, .8, 'outBack');
    c.save(); c.globalAlpha = Math.min(1, k * 1.4); streetSign(c, 1530, 430, 700, 'ATLANTIC AVE', 'ATLANTIC AVE', 0, { tilt: M.lerp(.3, .02, k) }); c.restore();
    M.chip(c, 'WHISKY ROW', 1530, 610, { align: 'center', size: 48, bg: am, color: '#1b1206', alpha: M.seg(t, d * .35, d * .35 + .4) });
    M.text(c, 'today’s 9 Avenue SE', 1530, 700, { size: 42, weight: 700, align: 'center', alpha: M.seg(t, .9, 1.3) });
    M.chip(c, 'CALGARY’S FIRST MAIN STREET', 1530, 790, { align: 'center', size: 38, bg: '#ffffff', alpha: M.seg(t, d * .65, d * .65 + .4) });
    src(c, 'Source: Daily Hive');
  },
  // BYLAW 528, 1904 (C6): names flip to numbers on the grid; stamp
  L5: (c, t, d) => {
    navyBg(c); const g = gridBox(), f0 = d * .55;
    grid(c, g.x, g.y, g.w, g.h, t, { lab: n => { const i = AVES.indexOf(n), fk = M.seg(t, f0 + i * .12, f0 + i * .12 + .3), named = n === 8 ? 'STEPHEN' : (n === 9 ? 'ATLANTIC' : '—');
      return fk < .5 ? { s: named, flip: 1 - fk * 2, col: '#8a5a00' } : { s: n + ' AVE', flip: fk * 2 - 1, col: INK }; } });
    const ck = M.seg(t, .2, .55, 'outCubic'), bx = WIDE ? 1290 : 140, by = WIDE ? 330 : 250, bw = WIDE ? 520 : 800, bh = WIDE ? 420 : 340;
    c.save(); c.globalAlpha = ck; c.translate(0, (1 - ck) * 40);
    M.rr(c, bx, by, bw, bh, 14); c.fillStyle = CREAM; c.fill();
    M.text(c, 'BY-LAW No. 528', bx + bw / 2, by + (WIDE ? 60 : 40), { size: WIDE ? 60 : 72, weight: 800, align: 'center', color: INK, shadow: false });
    M.text(c, 'avenue names → numbers', bx + bw / 2, by + (WIDE ? 150 : 125), { size: WIDE ? 40 : 50, weight: 700, align: 'center', color: '#3a4656', shadow: false });
    M.text(c, 'illustration', bx + bw - 20, by + bh - 34, { size: 20, weight: 500, align: 'right', color: '#7a705c', shadow: false }); c.restore();
    stamp(c, '1904', t, .7, bx + bw / 2, by + bh - (WIDE ? 120 : 95), WIDE ? 96 : 100, 1, RED);
    src(c, 'Sources: Harry Sanders, CBC Calgary · Everyday Tourist');
  },
  // STEPHEN → EIGHTH (C7): sign flips; period-style ad cards still say Stephen Avenue
  L6: (c, t, d) => {
    navyBg(c, '#13284a', '#070d18');
    const r = M.rng(11), cards = WIDE ? 6 : 3;
    for (let i = 0; i < cards; i++) { const t0 = d * .45 + i * .25, a = M.seg(t, t0, t0 + .4); if (a <= 0) continue;
      const x = (WIDE ? 180 : 80) + (i % 3) * (WIDE ? 560 : 290) + r() * (WIDE ? 60 : 20), y = (WIDE ? 540 : 950) + Math.floor(i / 3) * (WIDE ? 170 : 200) + (t - t0) * (WIDE ? -12 : 8), rot = (r() - .5) * .16;
      c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); M.rr(c, 0, 0, WIDE ? 440 : 260, WIDE ? 150 : 150, 6); c.fillStyle = '#efe6cf'; c.fill();
      M.text(c, i % 2 ? 'NOW OPEN' : 'FINE GOODS', (WIDE ? 220 : 130), 14, { size: WIDE ? 34 : 28, weight: 800, align: 'center', color: '#3a2a1c', shadow: false });
      M.text(c, 'STEPHEN AVENUE', (WIDE ? 220 : 130), WIDE ? 70 : 70, { size: WIDE ? 40 : 32, weight: 800, align: 'center', color: '#8a1c12', shadow: false }); c.restore(); }
    const k = M.seg(t, .3, .8, 'inOutCubic');
    streetSign(c, CX, WIDE ? 300 : 560, WIDE ? 900 : 860, 'STEPHEN AVE', '8 AVENUE', k);
    const a6 = M.seg(t, d * .45, d * .45 + .4);
    if (WIDE) M.chip(c, 'OLD NAME STILL IN ADS AND PAPERS FOR A FEW YEARS', CX, 470, { align: 'center', size: 40, alpha: a6, maxW: W - 140 });
    else { M.chip(c, 'OLD NAME STILL IN ADS AND PAPERS', CX, 760, { align: 'center', size: 48, alpha: a6, maxW: 880 }); M.chip(c, 'FOR A FEW YEARS', CX, 850, { align: 'center', size: 48, alpha: a6 }); }
    tag(c, 'illustration', WIDE ? undefined : 1140); src(c, 'Source: Harry Sanders, CBC Calgary');
  },
  // AVENUES E-W, STREETS N-S (C8)
  L7: (c, t, d) => {
    navyBg(c); const g = gridBox(); const gi = grid(c, g.x, g.y, g.w, g.h, t, { lab: n => ({ s: n + ' AVE' }) });
    const a1 = M.seg(t, .2, 1.4, 'inOutCubic'), a2 = M.seg(t, d * .5, d * .5 + 1.2, 'inOutCubic');
    c.strokeStyle = GOLD; c.lineWidth = 12; c.lineCap = 'round';
    const ay = g.y + gi.top + gi.step * 2; c.beginPath(); c.moveTo(g.x + gi.lx, ay); c.lineTo(g.x + gi.lx + (g.w - gi.lx - 30) * a1, ay); c.stroke();
    const sx = g.x + gi.lx + 30 + 2 * (g.w - gi.lx - 60) / 5; c.strokeStyle = '#8fd0ff'; c.beginPath(); c.moveTo(sx, g.y + 30); c.lineTo(sx, g.y + 30 + (g.h - 60) * a2); c.stroke();
    M.text(c, 'AVENUES ↔ east · west', 1520, 380, { size: 52, weight: 800, align: 'center', color: GOLD, alpha: M.seg(t, .3, .7) });
    M.text(c, 'STREETS ↕ north · south', 1520, 520, { size: 52, weight: 800, align: 'center', color: '#8fd0ff', alpha: M.seg(t, d * .5, d * .5 + .4) });
    src(c, 'Sources: University of Calgary · Everyday Tourist');
  },
  // FOUR QUADRANTS (C9): real city map, Bow glows, gold Centre Street line; quadrant letters
  L8: (c, t, d) => {
    const w = flatMap('night'); w.line(BOW, { wm: 260, color: RIVER, p: M.seg(t, d * .35, d * .6), order: 9, glow: 6, noFog: true, minPx: 5 });
    w.line([[CSX, -22000, 0], [CSX, 24000, 0]], { wm: 220, color: GOLD, p: M.seg(t, .2, d * .3, 'inOutCubic'), order: 10, glow: 6, noFog: true, minPx: 5 });
    const qa = M.seg(t, d * .7, d * .7 + .5), q = (x, y, s) => M.label(w, [x, y, 0], s, { size: WIDE ? 96 : 110, color: '#ffffff', alpha: qa });
    q(-9000, 9000, 'NW'); q(9000, 9000, 'NE'); q(-9000, WIDE ? -10000 : -7000, 'SW'); q(9000, WIDE ? -10000 : -7000, 'SE');
    M.label(w, [CSX + 2600, 11000, 0], 'Centre Street', { size: WIDE ? 36 : 42, color: GOLD, alpha: M.seg(t, .8, 1.2) });
    M.label(w, [-11000, 6200, 0], 'Bow River', { size: WIDE ? 36 : 42, color: '#cfe8ff', alpha: M.seg(t, d * .45, d * .55) });
    const z = M.lerp(WIDE ? 50000 : 58000, WIDE ? 56000 : 66000, M.seg(t, 0, d));
    const ly = WIDE ? 0 : -9000; w.render(c, cam({ pos: [CSX, ly - 400, z], look: [CSX, ly, 0] }));
    M.chip(c, 'SIMPLIFIED', WIDE ? W - 200 : CX, WIDE ? 140 : 300, { align: 'center', size: 40, bg: '#ffffff', alpha: M.seg(t, .5, .9) });
    srcMap(c, 'Source: University of Calgary · City of Calgary addressing');
  },
  // SAME ADDRESS, FOUR QUADRANTS (C10): address card, quadrant tag cycles; pins pop
  L9: (c, t, d) => {
    navyBg(c); const qs = ['NW', 'NE', 'SW', 'SE'], sp = DUR('L9'), i = Math.min(3, Math.floor(M.seg(t, sp * .25, sp * .7, 'linear') * 4)), on = t > sp * .25;
    const cy = WIDE ? 230 : 470, k = M.seg(t, .1, .5, 'outBack');
    c.save(); c.translate(CX, cy); c.scale(M.lerp(1.3, 1, k), M.lerp(1.3, 1, k)); c.globalAlpha = Math.min(1, k * 1.4);
    const bw = WIDE ? 1100 : 900, bh = WIDE ? 200 : 220; M.rr(c, -bw / 2, -bh / 2, bw, bh, 22); c.fillStyle = '#ffffff'; c.fill();
    M.text(c, '2518 5 AVE', -bw / 2 + 50, -bh * .3, { size: WIDE ? 110 : 112, weight: 800, color: '#0b1f3a', shadow: false });
    const tx = bw / 2 - (WIDE ? 220 : 190); M.rr(c, tx, -bh * .36, WIDE ? 180 : 160, bh * .72, 16); c.fillStyle = on ? GOLD : '#d7dce3'; c.fill();
    M.text(c, on ? qs[i] : '??', tx + (WIDE ? 90 : 80), -bh * .3, { size: WIDE ? 100 : 104, weight: 800, align: 'center', color: '#0b1f3a', shadow: false }); c.restore();
    // schematic quadrant cross with four pins
    const mx = CX, my = WIDE ? 650 : 920, r = WIDE ? 260 : 200;
    c.strokeStyle = GOLD; c.lineWidth = 8; c.beginPath(); c.moveTo(mx, my - r); c.lineTo(mx, my + r); c.stroke();
    c.strokeStyle = RIVER; c.beginPath(); c.moveTo(mx - r * 1.3, my - 30); c.bezierCurveTo(mx - r * .4, my - 60, mx + r * .3, my + 40, mx + r * 1.3, my + 20); c.stroke();
    const P = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    P.forEach(([sx, sy], j) => { const pk = M.seg(t, sp * .25 + j * sp * .1125, sp * .25 + j * sp * .1125 + .3, 'outBack'); if (pk <= 0) return;
      pinDot(c, mx + sx * r * .6, my + sy * r * .55, 18 * Math.min(1.2, pk), j === i ? GOLD : '#ffffff', qs[j], { dy: 26, size: WIDE ? 40 : 46 }); });
    M.text(c, 'schematic \u00b7 example', mx + r * 1.25, my + r + 10, { size: 22, weight: 500, align: 'right', color: '#c9d3e0' });
    const wq = M.seg(t, sp * .75, sp * .75 + .4);
    if (WIDE) M.chip(c, 'WRONG QUADRANT? MAYBE THE WRONG SIDE OF THE CITY', CX, 960, { align: 'center', size: 40, bg: RED, color: '#fff', alpha: wq, maxW: W - 140 });
    else { M.chip(c, 'WRONG QUADRANT?', CX, 610, { align: 'center', size: 48, bg: RED, color: '#fff', alpha: wq }); M.chip(c, 'MAYBE THE WRONG SIDE OF THE CITY', CX, 690, { align: 'center', size: 44, bg: RED, color: '#fff', alpha: wq, maxW: 880 }); }
    src(c, 'Sources: Everyday Tourist · University of Calgary');
  },
  // THE TWIST (C11): after a pause, dive to the Centre Street Bridge; two axes cross over its middle
  L10: (c, t, d) => {
    const w = modern('dusk', DUSK); w.line(BOW, { wm: 70, color: RIVER, order: 8, noFog: true, minPx: 3 });
    const a1 = M.seg(t, 1.0, 2.2, 'inOutCubic'), a2 = M.seg(t, 2.0, 3.2, 'inOutCubic');
    w.line([[CSX, BRIDGE[1] - 4000, 0], [CSX, BRIDGE[1] + 4000, 0]], { wm: 40, color: GOLD, p: a1, order: 10, glow: 5, noFog: true, minPx: 4 });
    w.line([[CSX - 4000, BRIDGE[1], 0], [CSX + 4000, BRIDGE[1], 0]], { wm: 40, color: '#ffffff', p: a2, order: 10, glow: 5, noFog: true, minPx: 4 });
    M.pin(w, BRIDGE, 'IN THEORY: HERE', { p: M.seg(t, d * .62, d * .62 + .5, 'linear'), size: WIDE ? 44 : 48, scale: 1.3 }); M.ping(w, BRIDGE, t - d * .62, { r: 110 });
    M.label(w, [CSX + 900, BRIDGE[1] + 300, 0], 'Centre Street Bridge', { size: WIDE ? 34 : 38, color: '#cfe8ff', alpha: M.seg(t, d * .7, d * .8) });
    w.render(c, cam(M.moves.dive([CSX, BRIDGE[1] - 100, 0], M.seg(t, 0, d, 'outCubic'), { h0: 7000, h1: 1500, back0: 1, back1: 1300, ahead: 80 })));
    band(c, WIDE ? 60 : 270, WIDE ? 380 : 700, .62);
    M.text(c, 'CENTRE ST', CX, WIDE ? 110 : 340, { size: WIDE ? 100 : 112, weight: 800, align: 'center', color: GOLD, alpha: M.seg(t, .1, .4) });
    M.text(c, '× CENTRE AVE', CX, WIDE ? 225 : 470, { size: WIDE ? 100 : 112, weight: 800, align: 'center', alpha: M.seg(t, .3, .6) });
    M.chip(c, 'NOT IN THE MIDDLE OF DOWNTOWN', CX, WIDE ? 345 : 615, { align: 'center', size: L.chip, bg: '#ffffff', alpha: M.seg(t, d * .25, d * .25 + .4) });
    srcMap(c, 'Source: Everyday Tourist (Richard White) · axes simplified');
  },
  // AVENUES FOLLOW THE RAILWAY (C12): grid rotates off true east-west; railway slides in parallel
  L11: (c, t, d) => {
    navyBg(c); const g = gridBox(), rot = M.lerp(0, -.1, M.seg(t, .4, 2.0, 'inOutCubic'));
    c.save(); c.strokeStyle = 'rgba(255,255,255,.55)'; c.setLineDash([16, 12]); c.lineWidth = 4; c.beginPath(); c.moveTo(g.x - 40, g.y + g.h / 2); c.lineTo(g.x + g.w + 40, g.y + g.h / 2); c.stroke(); c.restore();
    grid(c, g.x, g.y, g.w, g.h, t, { rot, rail: M.seg(t, d * .45, d * .8, 'inOutCubic'), lab: n => ({ s: n + ' AVE', size: 34 }) });
    const nx = 1480, ny = 330; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(nx, ny - 40); c.lineTo(nx + 18, ny + 10); c.lineTo(nx - 18, ny + 10); c.closePath(); c.fill(); M.text(c, 'N', nx, ny + 18, { size: 34, weight: 800, align: 'center' });
    M.text(c, 'true east–west', 1560, 520, { size: 44, weight: 700, align: 'center', color: '#dfe7f2', alpha: M.seg(t, .2, .6) });
    M.chip(c, 'PARALLEL TO THE RAILWAY', 1560, 640, { align: 'center', size: 44, alpha: M.seg(t, d * .5, d * .5 + .4) });
    src(c, 'Source: Everyday Tourist (Richard White)');
  },
  // 1981 (C13): night crane over Stephen Avenue; sign flips back
  L12: (c, t, d) => {
    const w = modern('night', NIGHT); M.ping(w, STEPHEN, t, { r: 120 });
    const p = M.seg(t, 0, d, 'inOutSine');
    w.render(c, cam({ pos: [STEPHEN[0] + M.lerp(-600, -900, p), STEPHEN[1] + M.lerp(-1200, -1700, p), M.lerp(260, 900, p)], look: [STEPHEN[0] + 200, STEPHEN[1] + 100, 0] }));
    band(c, WIDE ? 60 : 270, WIDE ? 640 : 1080, .62);
    stamp(c, '1981', t, .2, CX, WIDE ? 150 : 380);
    streetSign(c, CX, WIDE ? 380 : 700, WIDE ? 780 : 820, '8 AVENUE', 'STEPHEN AVE', M.seg(t, d * .35, d * .35 + .5, 'inOutCubic'));
    M.chip(c, 'ON THE PEDESTRIAN MALL', CX, WIDE ? 540 : 930, { align: 'center', size: L.chip, bg: '#ffffff', alpha: M.seg(t, d * .6, d * .6 + .4) });
    srcMap(c, 'Source: Harry Sanders, CBC Calgary');
  },
  L13: (c, t, d) => { c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
    M.closer(c, 'Names or numbers? Which would you pick?', M.seg(t, 0, d, 'linear'), W, H, { highlight: ['names', 'numbers'] }); },
  // TEASER (subset of audited claims: C1, C6, C7, C11)
  T0: (c, t, d) => D.L0(c, t, d),
  T1: (c, t, d) => {
    navyBg(c, '#13284a', '#070d18');
    stamp(c, '1904', t, .2, CX, 380, 118, 1, RED);
    M.chip(c, 'A BYLAW: AVENUE NAMES → NUMBERS', CX, 560, { align: 'center', size: 46, bg: '#ffffff', alpha: M.seg(t, .8, 1.2), maxW: W - 140 });
    streetSign(c, CX, 900, 860, 'STEPHEN AVE', '8 AVENUE', M.seg(t, d * .6, d * .6 + .5, 'inOutCubic'));
    src(c, 'Sources: Harry Sanders, CBC Calgary · Everyday Tourist');
  },
  T2: (c, t, d) => D.L10(c, t, d),
  T3: (c, t, d) => { c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
    const a = 1 - M.seg(t, 1.5, 1.8);
    if (a > 0) { M.text(c, '▶ FULL VIDEO', CX, 640, { size: 112, weight: 800, align: 'center', alpha: a * M.seg(t, 0, .25) });
      M.text(c, 'on our page · calgaryinsight.ca', CX, 790, { size: 54, weight: 700, align: 'center', color: GOLD, alpha: a * M.seg(t, .2, .45) }); }
    if (t > 1.6) { M.closer(c, 'Names or numbers? Which would you pick?', M.seg(t, 1.6, d, 'linear'), W, H, { highlight: ['names', 'numbers'] });
      M.text(c, '▶ Full video on our page', CX, 1370, { size: 38, weight: 700, align: 'center', color: '#ffffff', alpha: M.seg(t, 2.4, 2.8) }); }
  },
};
const TRANS = { L0: { kind: 'match', dur: .5 }, L1: { kind: 'dissolve', dur: .5 }, L2: { kind: 'push', dur: .4 }, L3: { kind: WIDE ? 'push' : 'flash', dur: .35 }, L4: { kind: 'flash', dur: .3 },
  L5: { kind: 'push', dur: .4 }, L6: { kind: 'zoom', dur: .45 }, L7: { kind: 'zoom', dur: .45 }, L8: { kind: 'push', dur: .4 }, L9: { kind: 'whip', dur: .35 },
  L10: { kind: 'dissolve', dur: .5 }, L11: { kind: 'dissolve', dur: .5 }, L12: { kind: 'dissolve', dur: .5 },
  T0: { kind: 'whip', dur: .35 }, T1: { kind: 'whip', dur: .35 }, T2: { kind: 'dissolve', dur: .5 } };
const LETTER = new Set([]);   // no letterbox: it would cover the top stamps

window.BUILD = () => { window.CUES = CUESFN(); return M.film({ W, H, identity: 'storyteller', scenes: ORDER.map((id, i) => ({ dur: sc[i].sceneDur, trans: TRANS[id], draw: (c, t) => D[id](c, t, sc[i].sceneDur) })),
  letterbox: t => { if (!WIDE || THUMB) return 0; const i = ORDER.findIndex((id, k) => t >= sc[k].sceneStart && t < sc[k].sceneEnd); if (i <= 0) return 0; return LETTER.has(ORDER[i]) ? Math.min(M.seg(t, sc[i].sceneStart, sc[i].sceneStart + .6), 1 - M.seg(t, sc[i].sceneEnd - .6, sc[i].sceneEnd)) : 0; },
  overlay: (c, t, info) => {
    const last = info.index === ORDER.length - 1;
    if (THUMB) { if (window.LOGO) { const s = 84; const x = WIDE ? 40 : 60, y = WIDE ? H - s - 36 : 1490; c.drawImage(window.LOGO, x, y, s, s); M.text(c, 'Calgary Insight', x + s + 16, y + s / 2, { size: 36, base: 'middle', weight: 700 }); } return; }
    if (t > 3 && !last) M.header(c, window.LOGO, W, H, { topic: WIDE ? 'Calgary stories' : undefined });
    if (!last) M.caption(c, S.captionAt(t), W, H, WIDE ? {} : { bottom: 1410 });
    if (CUT !== 'teaser') { const mid = S.total / 2; M.followPill(c, M.seg(t, mid - 1, mid + 1, 'linear'), W, H); }
  } }); };

const CUESFN = () => { const s = i => sc[i].sceneStart, cues = [{ t: 0, sfx: 'impact', gain: -5 }, { t: .2, sfx: 'whoosh', gain: -12 }, { t: .9, sfx: 'ticks', gain: -14, dur: .45 }, { t: 0, sfx: 'city', dur: sc[0].sceneEnd, gain: -24 }];
  ORDER.forEach((id, i) => { if (i === 0) return; const k = TRANS[ORDER[i - 1]] && TRANS[ORDER[i - 1]].kind; cues.push({ t: Math.max(0, s(i) - .2), sfx: k === 'flash' ? 'impact' : (k === 'dissolve' || k === 'match' ? 'whoosh_rev' : 'whoosh'), gain: k === 'dissolve' ? -16 : -11 });
    const d = sc[i].sceneDur, at = (x, sfx, g, o = {}) => cues.push(Object.assign({ t: s(i) + x, sfx, gain: g }, o));
    if (id === 'L1') { at(.15, 'stamp', -8); at(2.2, 'pop', -11); }
    if (id === 'L2') { for (let j = 0; j < 4; j++) at(.2 + j * (d * .45 / 4), 'pop', -13); at(d * .55, 'swell', -14, { dur: 1.4 }); }
    if (id === 'L3' || id === 'L4') { at(.3, 'thud', -11); at(1.0, 'pop', -12); }
    if (id === 'L5') { at(.2, 'whoosh', -14); at(.7, 'stamp', -5); at(d * .55, 'ticks', -16, { dur: 1.2 }); }
    if (id === 'L6') { at(.3, 'ticks', -15, { dur: .5 }); at(d * .45, 'swell', -16, { dur: 1.6 }); }
    if (id === 'L7') { at(.2, 'whoosh', -14); at(d * .5, 'whoosh', -14); }
    if (id === 'L8') { at(.2, 'riser', -17, { dur: 1.6 }); at(d * .7, 'impact', -10); }
    if (id === 'L9') { const sp = DUR('L9'); at(.1, 'thud', -10); at(sp * .25, 'ticks', -16, { dur: sp * .45 }); at(sp * .75, 'glitch', -15); }
    if (id === 'L10' || id === 'T2') { at(0, 'riser', -17, { dur: 2.2 }); at(d * .62, 'impact', -8); at(d * .62 + .1, 'ping', -11); }
    if (id === 'L11') { at(.4, 'swell', -15, { dur: 1.6 }); at(d * .45, 'whoosh', -14); }
    if (id === 'L12') { at(0, 'city', -24, { dur: d }); at(.2, 'stamp', -7); at(d * .35, 'ticks', -15, { dur: .5 }); }
    if (id === 'T1') { at(.2, 'stamp', -5); at(d * .6, 'ticks', -15, { dur: .5 }); }
  });
  return cues; };
window.TOTAL = () => S.total;
