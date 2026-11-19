/* 2026-11-19 FLAGSHIP: "Calgary's Forgotten Streetcars: How Rail Vanished and Came Back as the CTrain".
 * Lead identity: Storyteller (dusk drone over the real OSM/City downtown, map dives and river flights, ghosting for loss, dissolves through time).
 * Borrowed: Data Explainer counter slams, stamps and timelines (S1, S3, S4, S9, S10); Civic Analyst document and quote cards (S1, S12), evidence maps with credits.
 * One file, three cuts (+ thumbnails with --param thumb=1):
 *   python3 ../../motion/engine/render.py scene.js short.mp4  --geo ../../motion/geo/calgary_base.json --param cut=short
 *   python3 ../../motion/engine/render.py scene.js wide.mp4   --geo ../../motion/geo/calgary_base.json --param cut=wide
 *   python3 ../../motion/engine/render.py scene.js teaser.mp4 --geo ../../motion/geo/calgary_base.json --param cut=teaser
 * Every year, number, name and quote on screen maps to the audited claims table in packages/2026-11-19-FLAGSHIP-forgotten-streetcars.md (C#). */
const PR = window.PARAMS || {}, CUT = PR.cut || 'short', THUMB = !!PR.thumb;
const WIDE = CUT === 'wide';
const W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920;
const CX = WIDE ? W / 2 : (W - 120) / 2 + 30;
const L = WIDE ? { hookY: 250, hook: THUMB ? 150 : 128, kick: THUMB ? 50 : 42, stampY: 160, chip: 44, src: [48, H - 40], fov: 44 }
               : { hookY: 460, hook: 132, kick: 50, stampY: 380, chip: 50, src: [60, 1462], fov: 60 };

// measured Kokoro line durations (studio-probe, af_heart): index = line number in probe/tts_lines.json
// 0-14 = L0-L14, 15 = T1, 16 = T2, 17 = T3, 18 = L15
const VD = [4.247,  5.76,  7.275,  6.677,  3.52,  8.515,  9.581,  8.32,  4.737,  3.499,  12.183,  3.541,  6.849,  7.147,  4.539,  4.503,  6.165,  6.78,  3.305];   // studio-probe runs of 2026-11-19 (durs.json); L15 re-voiced shorter after audit round 3 and tightened with atempo 1.1 (3.621 s → 3.305 s) so the ending stays ≤ 4 s
const LINES = {
  L0: "Long before the CTrain, Calgary had streetcars. Then it got rid of them.",
  L1: "In April, nineteen oh seven, Calgary voters approved a street railway owned by the city itself.",
  L2: "On July fifth, nineteen oh nine, the first cars rolled, just in time for the fair, on a line out to the exhibition grounds.",
  L3: "Twelve streetcars, on twenty-five point seven kilometres of track, for a community of thirty thousand people.",
  L4: "The network grew fast, until the boom ended in nineteen thirteen.",
  L5: "And the tracks shaped the city. Streetcar suburbs like South Calgary grew along the lines. A streetcar loop there helped give Marda Loop its name.",
  L6: "Out west, a developer offered the city two islands for a park, if it ran streetcars over his bridge. The city agreed. Those islands became Bowness Park.",
  L7: "But in nineteen forty-six, the system was renamed the Calgary Transit System, and the city chose trolley coaches and gas buses instead.",
  L8: "Route by route, the streetcars were phased out. The last one ran in nineteen fifty.",
  L9: "For more than thirty years, Calgary's transit ran without rails.",
  L10: "Then, in nineteen seventy-eight, construction began on the CTrain. On May twenty-fifth, nineteen eighty-one, it opened: ten point nine kilometres, from Anderson Road to Seventh Avenue Southwest.",
  L11: "Four retired streetcar motor-conductors rode that first run.",
  L12: "One of them, Percy Langley, told the Calgary Herald: those streetcars were a damned nuisance. These are a lot better.",
  L13: "And in a possible nod to the old streetcars, whose routes once had colours, that first line was briefly called the Blue Line.",
  L14: "The very last streetcar? It was restored, and it sits at Heritage Park.",
  L15: "Streetcars or the CTrain? Drop your thoughts below.",
  T0: "Long before the CTrain, Calgary had streetcars. Then it got rid of them.",
  T1: "The first cars rolled in nineteen oh nine. By nineteen fifty, they were gone.",
  T2: "When the CTrain opened in nineteen eighty-one, four retired streetcar motor-conductors rode the first run.",
  T3: "Full video on our page. Streetcars or the CTrain: which would you rather ride? Drop your thoughts below.",
};
const IDX = { T0: 0, T1: 15, T2: 16, T3: 17, L15: 18 };
const DUR = id => VD[IDX[id] ?? +id.slice(1)];
const ORDER = { wide: ['L0','L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11','L12','L13','L14','L15'],
                short: ['L0','L2','L5','L7','L8','L10','L11','L12','L14','L15'],
                teaser: ['T0','T1','T2','T3'] }[CUT];
const S = M.script(ORDER.map(id => ({ text: LINES[id], dur: DUR(id), gapAfter: id === 'L9' ? .8 : undefined })),
                   { lead: .3, gap: CUT === 'teaser' ? .35 : .4, tail: CUT === 'teaser' ? 1.0 : .65 });
const sc = S.scenes;

// ---------- places (continuity bible) ----------
const TOWER = M.geo.lm('Calgary Tower') || [613, -44, 0];
const DOWNTOWN = [700, 190, 0];                                       // 7 Avenue at Centre Street (CTrain station position)
const EXPO = M.geo.lm('Stampede Park') || [1400, -995, 0];             // exhibition grounds = today's Stampede Park (C3)
const BOWNESS = M.geo.lm('Bowness Park') || [-10252, 5796, 0];          // C8
const MARDA = M.geo.xy(51.0216, -114.1010);                            // 33 Avenue SW at 20 Street SW (C7)
const HERITAGE = M.geo.xy(50.9825, -114.1038);                         // Heritage Park Historical Village (site visit data) (C16)
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const RED = '#d94848', GOLD = M.house.gold, CREAM = '#efe6cf', MAROON = '#7a1f2b', RIVER = '#5aa9e6', INK = '#22303f', BLUE = '#2f7de1';
const DUSK = { land: '#2e3138', park: '#2b3a30', water: '#2c5378', building: '#5a6270', road: '#6e675c', motorway: '#8a7a5c', community: '#ffffff' };
const MAP = { land: '#16263f', park: '#1d3b33', water: '#2c5378', building: '#3a4a60', road: '#2a3a52', motorway: '#3b4b63', community: '#ffffff' };

let BOW = [], SOUTHC = [-2588, -2112, 0], CTR = [], R_EXPO = [], R_SOUTH = [], R_BOW = [];
window.PRELOAD = async () => {
  BOW = M.geo.riverPath('Bow River', [-4000, 3000], 12000);
  const g = M.geo.get();
  const it = g && g.communities.items.find(c => c.name === 'SOUTH CALGARY');
  if (it) { const pts = it.polys[0][0]; SOUTHC = [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length, 0]; }
  const st = n => { const s = g && g.lrt_stations.find(x => x.name === n); return s ? [s.xy[0], s.xy[1]] : null; };
  // first CTrain line (C12): today's OSM station positions from Anderson to downtown, then west along 7 Avenue (line only, no station dots)
  CTR = ['Anderson', 'Southland', 'Heritage', 'Chinook', '39 Avenue', 'Erlton/Stampede', 'Victoria Park/Stampede', 'City Hall/Bow Valley College', 'Centre Street', '1 Street Southwest', '3 Street Southwest', '4 Street Southwest'].map(st).filter(Boolean);
  // schematic historic routes (dashed, tagged "schematic route"): downtown → exhibition grounds; → South Calgary loop; → west along the Bow to Bowness
  R_EXPO = [[DOWNTOWN[0], DOWNTOWN[1]], [DOWNTOWN[0] + 500, DOWNTOWN[1] - 150], [EXPO[0] - 150, EXPO[1] + 500], [EXPO[0], EXPO[1]]];
  const lp = [[SOUTHC[0] + 500, SOUTHC[1] + 350], [SOUTHC[0] - 500, SOUTHC[1] + 350], [SOUTHC[0] - 500, SOUTHC[1] - 450], [SOUTHC[0] + 500, SOUTHC[1] - 450], [SOUTHC[0] + 500, SOUTHC[1] + 350]];
  R_SOUTH = [[DOWNTOWN[0] - 300, DOWNTOWN[1] - 100], [-1400, -900], [SOUTHC[0] + 500, SOUTHC[1] + 350], ...lp.slice(1)];
  R_BOW = [[DOWNTOWN[0] - 600, DOWNTOWN[1] + 100], [-3200, 900], [-5600, 2600], [-8000, 4300], [BOWNESS[0], BOWNESS[1]]];
};

// ---------- helpers ----------
const cam = o => M.camera(Object.assign({ fov: L.fov }, o), W, H);
const band = (c, y0, y1, a = .7) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.2, `rgba(7,13,24,${a})`); g.addColorStop(.8, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const stamp = (c, s, t, t0, x = CX, y = L.stampY, size, fade = 1, col = GOLD) => { const k = M.seg(t, t0, t0 + .35, 'outBack'); if (k <= 0 || fade <= 0) return; size = size || (WIDE ? 96 : 118);
  c.save(); c.translate(x, y); c.rotate(-.05); const s2 = M.lerp(1.8, 1, k); c.scale(s2, s2); c.globalAlpha = Math.min(1, k * 1.5) * fade;
  c.font = M.font(size, 800); const tw = c.measureText(s).width; M.rr(c, -tw / 2 - 34, -size * .62, tw + 68, size * 1.24, 22); c.fillStyle = col === RED ? 'rgba(250,240,236,.95)' : 'rgba(7,13,24,.85)'; c.fill(); c.lineWidth = 8; c.strokeStyle = col; c.stroke();
  M.text(c, s, 0, -size * .52, { size, weight: 800, align: 'center', color: col === RED ? RED : '#fff', shadow: col !== RED }); c.restore(); };
const src = (c, s) => M.source(c, s, L.src[0], L.src[1], { size: 20, maxW: WIDE ? 1500 : 860 });
const srcMap = (c, s) => { M.source(c, MAPC, L.src[0], L.src[1] - 36, { size: 20 }); if (s) src(c, s); };
const tag = (c, s, y, x) => M.text(c, s, x || (WIDE ? W - 60 : W - 150), y || (WIDE ? H - 120 : 1300), { size: 22, weight: 500, align: 'right', color: '#c9d3e0' });
const navyBg = (c, a = '#0b1f3a', b = '#070d18') => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const modern = (sky, colors) => { const w = M.world({ sky, fog: { near: 3000, far: 26000, max: .55 } });
  M.geo.addBase(w, { buildings: true, colors, windows: '#ffd27a', windowAlpha: .45 }); return w; };
const flatMap = (o = {}) => { const w = M.world({ sky: 'night', fog: { near: 60000, far: 120000, max: .2 } });
  M.geo.addBase(w, Object.assign({ buildings: false, colors: MAP, riverW: 160 }, o)); return w; };
const north = (c) => { const nx = WIDE ? W - 90 : W - 190, ny = WIDE ? 200 : 300; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(nx, ny - 34); c.lineTo(nx + 15, ny + 8); c.lineTo(nx - 15, ny + 8); c.closePath(); c.fill(); M.text(c, 'N', nx, ny + 14, { size: 28, weight: 800, align: 'center' }); };

// path utilities (metres)
const plen = pts => { let l = 0; for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return l; };
const pAt = (pts, d) => { for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= l || i === pts.length - 1) { const f = l ? Math.min(1, d / l) : 0; return [M.lerp(pts[i - 1][0], pts[i][0], f), M.lerp(pts[i - 1][1], pts[i][1], f)]; } d -= l; } return pts[pts.length - 1]; };
/** dashed historic route drawn on to progress p; dash length in metres */
function dashed(w, pts, p, o = {}) {
  if (!pts.length || p <= 0) return; const tot = plen(pts) * Math.min(1, p), dl = o.dash || 260, gp = o.gap || 170;
  for (let d = 0; d < tot; d += dl + gp) { const seg = []; for (let k = 0; k <= 4; k++) seg.push(pAt(pts, Math.min(tot, d + dl * k / 4)));
    w.line(seg, { wm: o.wm || 70, color: o.color || GOLD, order: 9, glow: 3, noFog: true, minPx: o.minPx || 4, alpha: o.alpha ?? 1 }); }
}

// the recurring illustration: an early electric streetcar, side view (cream body, maroon panel, clerestory roof, trolley pole). o.ghost 0..1
function streetcar(c, x, y, w, o = {}) {
  const h = w * .34, g = o.ghost || 0; c.save(); c.translate(x, y);
  const a = 1 - g * .75; c.globalAlpha *= (o.alpha ?? 1);
  if (o.wire !== false) { c.strokeStyle = 'rgba(220,230,240,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-W, -h - w * .2); c.lineTo(W, -h - w * .2); c.stroke(); }
  c.strokeStyle = `rgba(30,30,30,${a})`; c.lineWidth = Math.max(3, w * .008); c.beginPath(); c.moveTo(w * .15, -h * 1.02); c.lineTo(w * .32, -h - w * .2); c.stroke();
  if (o.spark) { const s = o.spark; c.fillStyle = `rgba(160,220,255,${.9 * s})`; c.beginPath(); c.arc(w * .32, -h - w * .2, 12 + 10 * s, 0, 7); c.fill(); c.fillStyle = `rgba(255,255,255,${s})`; c.beginPath(); c.arc(w * .32, -h - w * .2, 6, 0, 7); c.fill(); }
  const fillOrLine = (col, path) => { if (g >= 1) { c.strokeStyle = 'rgba(239,230,207,.8)'; c.lineWidth = 3; path(); c.stroke(); } else { c.fillStyle = col; path(); c.fill(); if (g > 0) { c.globalAlpha *= 1; } } };
  c.globalAlpha *= a;
  fillOrLine(MAROON, () => { c.beginPath(); c.rect(-w / 2, -h * .45, w, h * .45); });
  fillOrLine(CREAM, () => { c.beginPath(); c.rect(-w / 2, -h, w, h * .55); });
  fillOrLine('#4a3528', () => { c.beginPath(); c.rect(-w * .42, -h * 1.12, w * .84, h * .12); });
  fillOrLine('#5b4636', () => { c.beginPath(); c.rect(-w * .52, -h * 1.04, w * 1.04, h * .06); });
  if (g < 1) { c.fillStyle = 'rgba(40,52,66,.9)'; for (let i = 0; i < 8; i++) { const wx = -w * .44 + i * w * .11; c.fillRect(wx, -h * .9, w * .08, h * .32); }
    c.fillStyle = GOLD; c.fillRect(-w / 2, -h * .47, w, h * .035); }
  c.fillStyle = `rgba(20,20,20,${g < 1 ? 1 : .4})`; [-.33, -.2, .2, .33].forEach(k => { c.beginPath(); c.arc(w * k, 2, h * .1, 0, 7); c.fill(); });
  c.restore();
}
function rails(c, y, x0 = 0, x1 = W) { c.strokeStyle = '#8b8f96'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0, y + 14); c.lineTo(x1, y + 14); c.stroke(); c.strokeStyle = '#4a3a2c'; c.lineWidth = 8; for (let x = x0; x < x1; x += 46) { c.beginPath(); c.moveTo(x, y + 8); c.lineTo(x + 26, y + 22); c.stroke(); } }
// CTrain car (red/white), side view; o.band = colour of the stripe
function ctrainCar(c, x, y, w, o = {}) { const h = w * .3; c.save(); c.translate(x, y); c.globalAlpha *= (o.alpha ?? 1);
  c.fillStyle = '#f2f2f0'; M.rr(c, -w / 2, -h, w, h, h * .18); c.fill(); c.fillStyle = o.band || RED; c.fillRect(-w / 2, -h * .38, w, h * .16);
  c.fillStyle = 'rgba(30,44,60,.92)'; for (let i = 0; i < 6; i++) c.fillRect(-w * .42 + i * w * .145, -h * .82, w * .1, h * .34);
  c.fillStyle = '#333'; c.fillRect(-w * .05, -h * .82, w * .1, h * .78);
  c.strokeStyle = '#333'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -h); c.lineTo(-w * .08, -h - w * .1); c.lineTo(w * .08, -h - w * .14); c.stroke();
  c.fillStyle = '#222'; [-.32, -.22, .22, .32].forEach(k => { c.beginPath(); c.arc(w * k, 2, h * .09, 0, 7); c.fill(); }); c.restore(); }
function figure(c, x, y, s, a = 1) { c.save(); c.globalAlpha *= a; c.fillStyle = '#dfe7f2'; c.beginPath(); c.arc(x, y - s * 1.55, s * .2, 0, 7); c.fill(); M.rr(c, x - s * .2, y - s * 1.3, s * .4, s * .75, s * .1); c.fill(); c.fillRect(x - s * .16, y - s * .6, s * .12, s * .6); c.fillRect(x + s * .04, y - s * .6, s * .12, s * .6);
  c.fillStyle = '#0b1f3a'; c.fillRect(x - s * .24, y - s * 1.78, s * .48, s * .08); c.restore(); }
function bus(c, x, y, w, col, trolley) { const h = w * .36; c.save(); c.translate(x, y); c.fillStyle = col; M.rr(c, -w / 2, -h, w, h, h * .2); c.fill(); c.fillStyle = 'rgba(30,44,60,.9)'; for (let i = 0; i < 5; i++) c.fillRect(-w * .42 + i * w * .17, -h * .82, w * .12, h * .32);
  c.fillStyle = '#1a1a1a'; [-.3, .3].forEach(k => { c.beginPath(); c.arc(w * k, 0, h * .14, 0, 7); c.fill(); });
  if (trolley) { c.strokeStyle = '#222'; c.lineWidth = 4; [-.1, .02].forEach(k => { c.beginPath(); c.moveTo(w * k, -h); c.lineTo(w * (k + .3), -h - w * .22); c.stroke(); }); } c.restore(); }

// the headline in the thumbnail's design (frame 0 = thumbnail)
function headline(c, t) {
  const k = M.seg(t, 0, .45, 'outBack'), s = M.lerp(1.1, 1, k);
  band(c, WIDE ? 40 : 250, WIDE ? 560 : 900, .66);
  c.save(); c.translate(CX, L.hookY); c.scale(s, s);
  M.chip(c, 'BEFORE THE CTRAIN', 0, -(WIDE ? 130 : 165), { align: 'center', size: L.kick, bg: '#ffffff', color: '#0b1f3a' });
  M.text(c, THUMB ? 'CALGARY’S LOST' : 'CALGARY HAD', 0, 0, { size: L.hook * (THUMB && !WIDE ? .92 : 1), weight: 800, align: 'center' });
  M.text(c, 'STREETCARS', 0, L.hook * 1.08, { size: L.hook * 1.12, weight: 800, align: 'center', color: GOLD });
  c.restore();
}

// ---------- scenes by line id ----------
const D = {
  // HOOK (C1): dusk drone push toward the Calgary Tower; an illustrated streetcar slides across, then ghosts out
  L0: (c, t, d) => {
    const w = modern('dusk', DUSK); const p = M.seg(t, 0, Math.max(d, 3), 'outCubic');
    w.render(c, cam({ pos: [TOWER[0] + M.lerp(-1300, -600, p), TOWER[1] + M.lerp(-2600, -1300, p), M.lerp(1100, 520, p)], look: [TOWER[0], TOWER[1] + (WIDE ? 500 : 300), 0] }));
    const ry = WIDE ? 850 : 1240, sw = WIDE ? 600 : 720;
    rails(c, ry);
    const x = THUMB ? CX : M.lerp(WIDE ? 520 : 300, WIDE ? 1500 : 900, M.seg(t, 0, Math.max(d, 3), 'inOutSine'));
    const ghost = THUMB ? .55 : M.seg(t, Math.min(1.6, d * .5), Math.min(2.6, d * .8), 'inOutCubic');
    streetcar(c, x, ry, sw, { ghost, spark: THUMB ? 1 : (Math.sin(t * 9) > .3 ? .9 * (1 - ghost) : 0) });
    if (!THUMB && ghost > .05) M.text(c, 'illustration', WIDE ? W - 60 : W - 150, ry + 60, { size: 22, weight: 500, align: 'right', color: '#c9d3e0' });
    headline(c, t);
  },
  // 1907 VOTE (C2): document card + stamp
  L1: (c, t, d) => {
    navyBg(c); const k = M.seg(t, .15, .6, 'outCubic'), bw = WIDE ? 1100 : 900, bh = WIDE ? 470 : 620, bx = CX - bw / 2, by = (WIDE ? 330 : 560) + (1 - k) * 60;
    c.save(); c.globalAlpha = k; M.rr(c, bx, by, bw, bh, 16); c.fillStyle = '#f7f4ec'; c.fill();
    M.text(c, 'VOTERS APPROVE', CX, by + (WIDE ? 50 : 60), { size: WIDE ? 92 : 104, weight: 800, align: 'center', color: INK, shadow: false });
    M.text(c, 'A CITY-OWNED', CX, by + (WIDE ? 170 : 200), { size: WIDE ? 70 : 80, weight: 800, align: 'center', color: MAROON, shadow: false });
    M.text(c, 'STREET RAILWAY', CX, by + (WIDE ? 255 : 300), { size: WIDE ? 70 : 80, weight: 800, align: 'center', color: MAROON, shadow: false });
    const bxx = CX - (WIDE ? 60 : 60), byy = by + bh - (WIDE ? 140 : 190); c.strokeStyle = INK; c.lineWidth = 6; c.strokeRect(bxx, byy, 90, 90);
    const tk = M.seg(t, d * .45, d * .45 + .4); if (tk > 0) { c.strokeStyle = '#1f7a3a'; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.moveTo(bxx + 14, byy + 48); c.lineTo(bxx + 14 + 24 * Math.min(1, tk * 2), byy + 48 + 26 * Math.min(1, tk * 2)); if (tk > .5) c.lineTo(bxx + 38 + 50 * (tk - .5) * 2, byy + 74 - 70 * (tk - .5) * 2); c.stroke(); }
    M.text(c, 'illustration', bx + bw - 20, by + bh - 34, { size: 20, weight: 500, align: 'right', color: '#7a705c', shadow: false }); c.restore();
    stamp(c, 'APRIL 1907', t, .6, CX, WIDE ? 170 : 400);
    src(c, 'Source: The Canadian Encyclopedia, “CTrain”');
  },
  // OPENING DAY (C3): map dive, dashed route downtown → exhibition grounds (schematic), car dot runs along it
  L2: (c, t, d) => {
    const w = flatMap(); const rp = M.seg(t, .6, d * .7, 'inOutCubic'); dashed(w, R_EXPO, rp, { wm: 60 });
    if (rp > 0) { const q = pAt(R_EXPO, plen(R_EXPO) * rp); w.at([q[0], q[1], 0], (ctx, sp) => { ctx.fillStyle = CREAM; ctx.strokeStyle = MAROON; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(sp.x, sp.y, 16, 0, 7); ctx.fill(); ctx.stroke(); }); }
    M.pin(w, EXPO, 'Exhibition grounds', { p: M.seg(t, d * .6, d * .6 + .5, 'linear'), size: WIDE ? 40 : 46, scale: 1.2 });
    M.label(w, [DOWNTOWN[0] - 900, DOWNTOWN[1] + (WIDE ? 700 : 250), 0], 'Downtown', { size: WIDE ? 36 : 42, alpha: M.seg(t, .4, .8) });
    M.label(w, [-1800, 1650, 0], 'Bow River', { size: WIDE ? 32 : 38, color: '#cfe8ff', alpha: M.seg(t, .6, 1.0) });
    const mid = [(DOWNTOWN[0] + EXPO[0]) / 2, (DOWNTOWN[1] + EXPO[1]) / 2 - (WIDE ? 0 : 500), 0];
    w.render(c, cam(M.moves.dive(mid, M.seg(t, 0, d, 'outCubic'), { h0: 16000, h1: WIDE ? 3600 : 4300, back0: 1, back1: 1000, ahead: 50 })));
    band(c, WIDE ? 40 : 250, WIDE ? 360 : 720, .6);
    stamp(c, 'JULY 5, 1909', t, .15, CX, WIDE ? 140 : 380);
    M.chip(c, 'JUST IN TIME FOR THE FAIR', CX, WIDE ? 270 : 550, { align: 'center', size: L.chip, bg: '#ffffff', alpha: M.seg(t, d * .3, d * .3 + .4) });
    tag(c, 'schematic route', WIDE ? H - 120 : 1240); north(c);
    srcMap(c, 'Sources: The Canadian Encyclopedia · Wikipedia');
  },
  // HOW BIG (C4): three counters slam; twelve streetcar icons
  L3: (c, t, d) => {
    navyBg(c); const seg = d / 3.3;
    const rows = [[12, 'STREETCARS', {}], [25.7, 'KM OF TRACK', { decimals: 1 }], [30000, 'PEOPLE', { decimals: 0 }]];
    rows.forEach(([v, lab, f], i) => { const t0 = .1 + i * seg, p = M.seg(t, t0, t0 + .9); if (p <= 0) return;
      const x = WIDE ? 380 + i * 580 : CX, y = WIDE ? 300 : 330 + i * 300;
      M.counter(c, v, p, x, y, Object.assign({ size: WIDE ? 150 : 150, slam: true, color: i === 0 ? GOLD : '#fff' }, f));
      M.text(c, lab, x, y + (WIDE ? 175 : 170), { size: WIDE ? 50 : 54, weight: 800, align: 'center', color: '#dfe7f2', alpha: M.seg(t, t0 + .3, t0 + .6) }); });
    for (let i = 0; i < 12; i++) { const a = M.seg(t, .2 + i * .08, .5 + i * .08, 'outBack'); if (a <= 0) continue;
      const cols = WIDE ? 12 : 6, x = WIDE ? 230 + (i % cols) * 133 : 150 + (i % cols) * 150, y = WIDE ? 760 : 1180 + Math.floor(i / cols) * 110;
      c.save(); c.globalAlpha = Math.min(1, a); streetcar(c, x, y, WIDE ? 110 : 120, { wire: false }); c.restore(); }
    M.chip(c, '1909', CX, WIDE ? 130 : 230, { align: 'center', size: L.chip, bg: '#ffffff', color: '#0b1f3a', alpha: M.seg(t, 0, .3) });
    src(c, 'Source: Calgary Transit, History');
  },
  // GROWTH TO 1913 (C5): timeline 1909 → 1913, stamp at the end
  L4: (c, t, d) => {
    navyBg(c); const p = M.seg(t, .2, d * .75, 'inOutCubic');
    M.timeline(c, { x: WIDE ? 260 : 120, y: WIDE ? 560 : 900, w: WIDE ? 1400 : 780, from: 1909, to: 1913, p, events: [{ year: 1909, label: 'first cars' }, { year: 1913, label: 'boom ends' }], size: WIDE ? 48 : 52, headSize: WIDE ? 120 : 140, headOffset: WIDE ? 220 : 260, labelW: 360 });
    M.chip(c, 'THE NETWORK GROWS FAST', CX, WIDE ? 200 : 420, { align: 'center', size: L.chip, bg: '#ffffff', color: '#0b1f3a', alpha: M.seg(t, .3, .7) });
    stamp(c, 'THE BOOM ENDS', t, d * .78, CX, WIDE ? 830 : 1200, WIDE ? 70 : 80, 1, RED);
    src(c, 'Source: The Canadian Encyclopedia, “CTrain”');
  },
  // STREETCAR SUBURBS (C6, C7): South Calgary glows; dashed route + loop; Marda Loop pin
  L5: (c, t, d) => {
    const w = flatMap({ communities: true, highlightCommunity: 'SOUTH CALGARY', lineAlpha: .12, hiAlpha: M.seg(t, .6, 1.4) * .5 });
    dashed(w, R_SOUTH, M.seg(t, .3, d * .55, 'inOutCubic'), { wm: 50 });
    M.label(w, [SOUTHC[0] - 200, SOUTHC[1] + 750, 0], 'South Calgary', { size: WIDE ? 40 : 46, alpha: M.seg(t, 1.0, 1.4) });
    M.pin(w, MARDA, 'Marda Loop', { p: M.seg(t, d * .66, d * .66 + .5, 'linear'), size: WIDE ? 40 : 46, scale: 1.1 }); M.ping(w, MARDA, t - d * .66);
    M.label(w, [DOWNTOWN[0] - 300, DOWNTOWN[1] - 250, 0], 'Downtown', { size: WIDE ? 34 : 40, alpha: M.seg(t, .2, .6) });
    const tgt = [(SOUTHC[0] + DOWNTOWN[0]) / 2, (SOUTHC[1] + DOWNTOWN[1]) / 2 - (WIDE ? 200 : 600), 0];
    w.render(c, cam(M.moves.dive(tgt, M.seg(t, 0, d, 'outCubic'), { h0: 14000, h1: WIDE ? 4800 : 6500, back0: 1, back1: 900, ahead: 50 })));
    band(c, WIDE ? 40 : 250, WIDE ? 260 : 560, .6);
    M.chip(c, 'STREETCAR SUBURBS', CX, WIDE ? 150 : 400, { align: 'center', size: WIDE ? 56 : 60, bg: GOLD, color: '#0b1f3a', alpha: M.seg(t, .2, .6) });
    tag(c, 'schematic route', WIDE ? H - 120 : 1240); north(c);
    srcMap(c, 'Source: Marda Loop BRZ, “Last Run of the No. 7 South Calgary Streetcar”');
  },
  // BOWNESS PARK DEAL (C8): flight west along the real Bow; two islands (schematic); dashed route over "his bridge"
  L6: (c, t, d) => {
    const w = flatMap(); w.line(BOW, { wm: 200, color: RIVER, order: 8, glow: 4, noFog: true, minPx: 4, alpha: .9 });
    dashed(w, R_BOW, M.seg(t, d * .35, d * .75, 'inOutCubic'), { wm: 90, dash: 400, gap: 260 });
    const ia = M.seg(t, .8, 1.4), pul = 1 + .08 * Math.sin(t * 5);
    [[-180, 120, 260, 120], [260, -90, 220, 100]].forEach(([dx, dy, rx, ry]) => w.at([BOWNESS[0] + dx, BOWNESS[1] + dy, 0], (ctx, sp) => { if (ia <= 0) return; const k = sp.k * pul; ctx.fillStyle = `rgba(242,182,50,${.55 * ia})`; ctx.strokeStyle = `rgba(255,255,255,${ia})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(sp.x, sp.y, Math.max(10, rx * k), Math.max(6, ry * k), -.3, 0, 7); ctx.fill(); ctx.stroke(); }));
    M.pin(w, BOWNESS, 'Bowness Park', { p: M.seg(t, d * .8, d * .8 + .5, 'linear'), size: WIDE ? 42 : 48, scale: 1.2 });
    M.label(w, [-5200, 3600, 0], 'Bow River', { size: WIDE ? 34 : 40, color: '#cfe8ff', alpha: M.seg(t, .3, .7) });
    const f = M.seg(t, 0, d, 'inOutSine'), look = [M.lerp(-4500, BOWNESS[0] + 1500, f), M.lerp(2500, BOWNESS[1] - (WIDE ? 200 : 900), f), 0];
    w.render(c, cam({ pos: [look[0] + 600, look[1] - (WIDE ? 5200 : 5600), WIDE ? 5600 : 7600], look }));
    band(c, WIDE ? 40 : 250, WIDE ? 400 : 760, .6);
    stamp(c, '1911', t, .1, CX, WIDE ? 130 : 370, WIDE ? 90 : 110);
    M.chip(c, 'TWO ISLANDS FOR A PARK…', CX, WIDE ? 250 : 540, { align: 'center', size: L.chip, bg: '#ffffff', color: '#0b1f3a', alpha: M.seg(t, .4, .8) });
    M.chip(c, '…IF STREETCARS CROSS HIS BRIDGE', CX, WIDE ? 330 : 630, { align: 'center', size: WIDE ? 44 : 46, alpha: M.seg(t, d * .3, d * .3 + .4), maxW: WIDE ? 1400 : 900 });
    tag(c, 'islands and route schematic', WIDE ? H - 120 : 1240); north(c);
    srcMap(c, 'Source: Sprawl Calgary (Jeremy Klaszus)');
  },
  // 1946 SWITCH (C9): name card flips; trolley coach and gas bus roll in
  L7: (c, t, d) => {
    navyBg(c); stamp(c, '1946', t, .1, CX, WIDE ? 150 : 360);
    const k = M.seg(t, d * .25, d * .25 + .5, 'inOutCubic'), sy = Math.abs(Math.cos(Math.PI * k)), txt = k < .5 ? ['CALGARY MUNICIPAL', 'RAILWAY'] : ['CALGARY TRANSIT', 'SYSTEM'];
    const cy = WIDE ? 400 : 680, bw = WIDE ? 1100 : 920, bh = WIDE ? 230 : 280;
    c.save(); c.translate(CX, cy); c.scale(1, Math.max(.04, sy)); M.rr(c, -bw / 2, -bh / 2, bw, bh, 18); c.fillStyle = k < .5 ? MAROON : '#0b1f3a'; c.fill(); c.lineWidth = 6; c.strokeStyle = GOLD; c.stroke();
    M.text(c, txt[0], 0, -bh * .38, { size: WIDE ? 76 : 76, weight: 800, align: 'center', maxW: bw - 60 }); M.text(c, txt[1], 0, bh * .04, { size: WIDE ? 76 : 76, weight: 800, align: 'center', color: GOLD, maxW: bw - 60 }); c.restore();
    const bk = M.seg(t, d * .55, d * .55 + 1.0, 'outCubic'), by = WIDE ? 830 : 1180;
    if (bk > 0) { c.strokeStyle = 'rgba(220,230,240,.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, by - (WIDE ? 200 : 210)); c.lineTo(W, by - (WIDE ? 200 : 210)); c.stroke();
      bus(c, M.lerp(-300, WIDE ? 640 : 300, bk), by, WIDE ? 420 : 400, '#2f6e9e', true); bus(c, M.lerp(W + 300, WIDE ? 1280 : 760, bk), by, WIDE ? 420 : 400, '#c9a227', false);
      M.text(c, 'trolley coach', M.lerp(-300, WIDE ? 640 : 300, bk), by + 40, { size: 34, weight: 700, align: 'center' }); M.text(c, 'gas bus', M.lerp(W + 300, WIDE ? 1280 : 760, bk), by + 40, { size: 34, weight: 700, align: 'center' }); }
    tag(c, 'illustration', WIDE ? H - 120 : 1300);
    src(c, 'Source: The Canadian Encyclopedia, “CTrain”');
  },
  // PHASED OUT, 1950 (C10): the three schematic routes fade one by one; streetcar ghosts out
  L8: (c, t, d) => {
    const w = flatMap(); const fades = [R_BOW, R_SOUTH, R_EXPO];
    fades.forEach((r, i) => { const a = 1 - M.seg(t, d * .3 + i * d * .17, d * .3 + i * d * .17 + .5); if (a > 0) dashed(w, r, 1, { wm: WIDE ? 110 : 150, alpha: a, dash: 420, gap: 260, minPx: 6 }); });
    M.label(w, [DOWNTOWN[0], DOWNTOWN[1] + 800, 0], 'Downtown', { size: WIDE ? 36 : 42 });
    w.render(c, cam({ pos: [-4300, 1800 - (WIDE ? 6000 : 9000), M.lerp(WIDE ? 11000 : 15500, WIDE ? 12500 : 17000, M.seg(t, 0, d))], look: [-4300, WIDE ? 1800 : 800, 0] }));
    band(c, WIDE ? 40 : 250, WIDE ? 330 : 640, .6);
    stamp(c, '1950', t, d * .55, CX, WIDE ? 140 : 380);
    M.chip(c, 'THE LAST STREETCAR RUNS', CX, WIDE ? 265 : 540, { align: 'center', size: L.chip, bg: '#ffffff', color: '#0b1f3a', alpha: M.seg(t, d * .6, d * .6 + .4) });
    const ry = WIDE ? 850 : 1200; rails(c, ry, 0, W); streetcar(c, CX, ry, WIDE ? 480 : 560, { ghost: M.seg(t, .3, d * .9), alpha: 1 - M.seg(t, d * .85, d), wire: false });
    tag(c, 'schematic routes · illustration', WIDE ? H - 120 : 1300); north(c);
    srcMap(c, 'Sources: The Canadian Encyclopedia · Calgary Transit');
  },
  // THE GAP (C11): timeline 1950 → 1981 with empty rails
  L9: (c, t, d) => {
    navyBg(c, '#101826', '#05080f'); const p = M.seg(t, .2, d, 'inOutSine');
    M.timeline(c, { x: WIDE ? 260 : 120, y: WIDE ? 560 : 900, w: WIDE ? 1400 : 780, from: 1950, to: 1981, p, accent: '#8a99ad', events: [{ year: 1950, label: 'last streetcar' }, { year: 1981, label: 'CTrain' }], size: WIDE ? 48 : 52, headSize: WIDE ? 120 : 140, headOffset: WIDE ? 220 : 260, labelW: 360 });
    M.chip(c, 'MORE THAN 30 YEARS · NO RAILS', CX, WIDE ? 200 : 420, { align: 'center', size: WIDE ? 50 : 48, bg: '#ffffff', color: '#0b1f3a', alpha: M.seg(t, .4, .8), maxW: W - 140 });
    c.save(); c.globalAlpha = .5; rails(c, WIDE ? 820 : 1180, WIDE ? 260 : 120, WIDE ? 1660 : 900); c.restore();
    src(c, 'Sources: Calgary Transit · SkyriseCities');
  },
  // RAIL COMES BACK (C12): the first CTrain line draws from Anderson to 7 Avenue SW
  L10: (c, t, d) => {
    const w = flatMap(); const rp = M.seg(t, d * .25, d * .7, 'inOutCubic');
    if (CTR.length > 1 && rp > 0) { const tot = plen(CTR) * rp, pts = [CTR[0]]; let acc = 0; for (let i = 1; i < CTR.length; i++) { const l = Math.hypot(CTR[i][0] - CTR[i - 1][0], CTR[i][1] - CTR[i - 1][1]); if (acc + l <= tot) { pts.push(CTR[i]); acc += l; } else { pts.push(pAt(CTR, tot)); break; } }
      w.line(pts, { wm: 110, color: RED, order: 10, glow: 6, noFog: true, minPx: 5 }); }
    if (CTR.length) { M.label(w, [CTR[0][0] + (WIDE ? 1800 : 0), CTR[0][1] + (WIDE ? 500 : -900), 0], 'Anderson', { size: WIDE ? 40 : 46, alpha: M.seg(t, d * .25, d * .25 + .4) });
      M.label(w, [CTR[CTR.length - 1][0] - 400, CTR[CTR.length - 1][1] + 900, 0], '7 Avenue SW', { size: WIDE ? 40 : 46, alpha: M.seg(t, d * .68, d * .68 + .4) }); }
    const f = M.seg(t, 0, d, 'outCubic'), look = [300, WIDE ? -5000 : -5800, 0];
    w.render(c, cam({ pos: [look[0], look[1] - (WIDE ? 3000 : 5000), M.lerp(WIDE ? 26000 : 34000, WIDE ? 15000 : 20000, f)], look }));
    band(c, WIDE ? 40 : 250, WIDE ? 380 : 760, .62);
    M.chip(c, 'CONSTRUCTION BEGAN 1978', CX, WIDE ? 130 : 370, { align: 'center', size: L.chip, bg: '#ffffff', color: '#0b1f3a', alpha: M.seg(t, .2, .6) * (1 - M.seg(t, d * .4, d * .4 + .3)) });
    stamp(c, 'MAY 25, 1981', t, d * .42, CX, WIDE ? 150 : 400, WIDE ? 96 : 104, 1, RED);
    M.chip(c, '10.9 KM', CX, WIDE ? 290 : 590, { align: 'center', size: WIDE ? 60 : 64, bg: GOLD, color: '#0b1f3a', alpha: M.seg(t, d * .66, d * .66 + .4) });
    north(c); srcMap(c, 'Source: Calgary Transit, History');
  },
  // FIRST RUN PASSENGERS (C13): four silhouettes board a CTrain car
  L11: (c, t, d) => {
    navyBg(c); const ty = WIDE ? 840 : 1150, cw = WIDE ? 900 : 860; rails(c, ty, 0, W);
    ctrainCar(c, CX, ty, cw);
    for (let i = 0; i < 4; i++) { const k = M.seg(t, .3 + i * .35, 1.2 + i * .35, 'outCubic'); const x = M.lerp(-120 - i * 120, CX - cw * .2 + i * (cw * .12), k);
      figure(c, x, ty - 6, WIDE ? 150 : 140, Math.min(1, k * 2) * (1 - .4 * M.seg(t, d * .8, d))); }
    M.text(c, '4 RETIRED STREETCAR', CX, WIDE ? 110 : 330, { size: WIDE ? 96 : 92, weight: 800, align: 'center', alpha: M.seg(t, .1, .4) });
    M.text(c, 'MOTOR-CONDUCTORS', CX, WIDE ? 225 : 450, { size: WIDE ? 96 : 92, weight: 800, align: 'center', color: GOLD, alpha: M.seg(t, .3, .6) });
    M.chip(c, 'ON THE FIRST RUN', CX, WIDE ? 380 : 620, { align: 'center', size: L.chip, bg: '#ffffff', color: '#0b1f3a', alpha: M.seg(t, d * .4, d * .4 + .4) });
    tag(c, 'illustration', WIDE ? H - 120 : 1300);
    src(c, 'Source: The Canadian Encyclopedia, “CTrain”');
  },
  // THE QUOTE (C14): cream quote card, words highlight as spoken
  L12: (c, t, d) => {
    navyBg(c, '#13284a', '#070d18'); const k = M.seg(t, .1, .5, 'outCubic');
    const bw = WIDE ? 1500 : 940, bh = WIDE ? 560 : 680, bx = CX - bw / 2, by = (WIDE ? 190 : 400) + (1 - k) * 50;
    c.save(); c.globalAlpha = k; M.rr(c, bx, by, bw, bh, 18); c.fillStyle = '#f7f4ec'; c.fill();
    M.text(c, 'PERCY LANGLEY', bx + 50, by + 40, { size: WIDE ? 50 : 56, weight: 800, color: MAROON, shadow: false });
    M.text(c, 'retired streetcar motor-conductor · to the Calgary Herald, 1981', bx + 50, by + (WIDE ? 105 : 115), { size: WIDE ? 28 : 28, weight: 600, color: '#5b6573', shadow: false, maxW: bw - 100 });
    const q = '“Those streetcars were a damned nuisance. These are a lot better.”', size = WIDE ? 80 : 76, words = q.split(' ');
    c.font = M.font(size, 800); let x = bx + 50, y = by + (WIDE ? 200 : 230); const lh = size * 1.25, s0 = d * .32, s1 = d * .95;
    words.forEach((wd, i) => { const ww = c.measureText(wd + ' ').width; if (x + ww > bx + bw - 50) { x = bx + 50; y += lh; }
      const on = M.seg(t, s0 + (s1 - s0) * i / words.length, s0 + (s1 - s0) * (i + 1) / words.length, 'linear');
      if (on > 0) { c.fillStyle = 'rgba(242,182,50,.75)'; c.fillRect(x - 4, y - 2, (ww - 10) * on + 8, size * 1.12); }
      c.fillStyle = '#111a26'; c.textBaseline = 'top'; c.fillText(wd, x, y); x += ww; });
    c.restore();
    src(c, 'Source: The Canadian Encyclopedia, “CTrain” (quoting the Calgary Herald)');
  },
  // THE BLUE LINE NOD (C15): colour route chips → CTrain car with a blue band
  L13: (c, t, d) => {
    navyBg(c); const a1 = M.seg(t, .2, .6), a2 = M.seg(t, d * .5, d * .5 + .5);
    M.text(c, 'streetcar routes, until the mid-1930s', CX, WIDE ? 120 : 340, { size: WIDE ? 44 : 46, weight: 700, align: 'center', color: '#dfe7f2', alpha: a1 });
    M.chip(c, 'BLUE LINE', CX - (WIDE ? 220 : 210), WIDE ? 230 : 470, { align: 'center', size: WIDE ? 56 : 54, bg: BLUE, color: '#fff', alpha: a1 });
    M.chip(c, 'WHITE LINE', CX + (WIDE ? 220 : 210), WIDE ? 230 : 470, { align: 'center', size: WIDE ? 56 : 54, bg: '#ffffff', color: '#0b1f3a', alpha: M.seg(t, .4, .8) });
    const ty = WIDE ? 820 : 1120; c.save(); c.globalAlpha = a2; rails(c, ty, 0, W); ctrainCar(c, CX, ty, WIDE ? 860 : 820, { band: BLUE }); c.restore();
    M.chip(c, '1981: BRIEFLY THE BLUE LINE', CX, WIDE ? 400 : 680, { align: 'center', size: WIDE ? 54 : 52, bg: BLUE, color: '#fff', alpha: a2, maxW: W - 140 });
    M.chip(c, 'A POSSIBLE NOD', CX, WIDE ? 500 : 790, { align: 'center', size: L.chip, bg: GOLD, color: '#0b1f3a', alpha: M.seg(t, d * .7, d * .7 + .4) });
    tag(c, 'illustration', WIDE ? H - 120 : 1300);
    src(c, 'Source: The Canadian Encyclopedia, “CTrain”');
  },
  // HERITAGE PARK (C16): map dive to Heritage Park; restored streetcar glints
  L14: (c, t, d) => {
    const w = flatMap(); M.pin(w, HERITAGE, 'Heritage Park', { p: M.seg(t, .5, 1.0, 'linear'), size: WIDE ? 44 : 50, scale: 1.3 }); M.ping(w, HERITAGE, t - .5, { r: 120 });
    M.label(w, [HERITAGE[0] - 1600, HERITAGE[1] + 1500, 0], 'Glenmore Reservoir', { size: WIDE ? 30 : 34, color: '#cfe8ff', alpha: M.seg(t, .8, 1.2) });
    w.render(c, cam(M.moves.dive([HERITAGE[0], HERITAGE[1] + (WIDE ? 300 : -200), 0], M.seg(t, 0, d, 'outCubic'), { h0: 15000, h1: WIDE ? 3600 : 4800, back0: 1, back1: 900, ahead: 40 })));
    band(c, WIDE ? 40 : 250, WIDE ? 300 : 600, .6);
    M.chip(c, 'THE LAST STREETCAR, RESTORED', CX, WIDE ? 160 : 420, { align: 'center', size: WIDE ? 54 : 50, bg: GOLD, color: '#0b1f3a', alpha: M.seg(t, .3, .7), maxW: W - 140 });
    const ry = WIDE ? 850 : 1220; const sk = M.seg(t, .6, 1.4, 'outCubic'); c.save(); c.globalAlpha = sk; rails(c, ry, 0, W); streetcar(c, CX, ry, WIDE ? 520 : 600, { wire: false });
    const gl = M.seg(t, 1.4, 2.4, 'inOutSine'); if (gl > 0 && gl < 1) { const gx = CX - 300 + 600 * gl; const g = c.createLinearGradient(gx - 60, 0, gx + 60, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(CX - 310, ry - 260, 620, 260); }
    c.restore(); tag(c, 'illustration', ry + 70); north(c);
    srcMap(c, 'Source: Calgary Transit, History');
  },
  L15: (c, t, d) => { c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
    M.closer(c, 'Streetcars or the CTrain?', M.seg(t, 0, d, 'linear'), W, H, { highlight: ['streetcars', 'ctrain'] }); },
  // TEASER (subset of audited claims: C1, C3, C10, C12, C13)
  T0: (c, t, d) => D.L0(c, t, d),
  T1: (c, t, d) => {
    navyBg(c, '#13284a', '#070d18'); const ry = 1150; rails(c, ry, 0, W);
    streetcar(c, M.lerp(240, 760, M.seg(t, 0, d, 'inOutSine')), ry, 620, { ghost: M.seg(t, d * .5, d * .9), spark: Math.sin(t * 9) > .3 ? .8 * (1 - M.seg(t, d * .5, d * .6)) : 0 });
    stamp(c, '1909', t, .2, CX - 200, 420, 118);
    stamp(c, '1950', t, d * .55, CX + 200, 600, 118, 1, RED);
    tag(c, 'illustration', 1300); src(c, 'Sources: The Canadian Encyclopedia · Calgary Transit');
  },
  T2: (c, t, d) => { D.L10(c, t * .9 + .5, d);
    const a = M.seg(t, d * .45, d * .45 + .4); if (a > 0) { M.chip(c, '4 RETIRED STREETCAR', CX, 860, { align: 'center', size: 56, bg: '#ffffff', color: '#0b1f3a', alpha: a }); M.chip(c, 'MOTOR-CONDUCTORS', CX, 960, { align: 'center', size: 56, bg: GOLD, color: '#0b1f3a', alpha: a }); M.chip(c, 'ON THE FIRST RUN', CX, 1060, { align: 'center', size: 48, alpha: a }); } },
  T3: (c, t, d) => { c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
    const a = 1 - M.seg(t, 1.5, 1.8);
    if (a > 0) { M.text(c, '▶ FULL VIDEO', CX, 640, { size: 112, weight: 800, align: 'center', alpha: a * M.seg(t, 0, .25) });
      M.text(c, 'on our page · calgaryinsight.ca', CX, 790, { size: 54, weight: 700, align: 'center', color: GOLD, alpha: a * M.seg(t, .2, .45) }); }
    if (t > 1.6) { M.closer(c, 'Streetcars or the CTrain? Which would you rather ride?', M.seg(t, 1.6, d, 'linear'), W, H, { highlight: ['streetcars', 'ctrain'] });
      M.text(c, '▶ Full video on our page', CX, 1370, { size: 38, weight: 700, align: 'center', color: '#ffffff', alpha: M.seg(t, 2.4, 2.8) }); }
  },
};
const TRANS = { L0: { kind: 'match', dur: .5 }, L1: { kind: 'push', dur: .4 }, L2: { kind: 'dissolve', dur: .5 }, L3: { kind: 'flash', dur: .3 }, L4: { kind: 'push', dur: .4 },
  L5: { kind: 'dissolve', dur: .5 }, L6: { kind: 'push', dur: .4 }, L7: { kind: 'whip', dur: .35 }, L8: { kind: 'dissolve', dur: .6 }, L9: { kind: 'zoom', dur: .45 },
  L10: { kind: 'push', dur: .4 }, L11: { kind: 'dissolve', dur: .5 }, L12: { kind: 'dissolve', dur: .5 }, L13: { kind: 'push', dur: .4 }, L14: { kind: 'dissolve', dur: .5 },
  T0: { kind: 'whip', dur: .35 }, T1: { kind: 'zoom', dur: .4 }, T2: { kind: 'dissolve', dur: .5 } };
// Short: the scene before each Short scene is different, so transitions follow the line that ends
window.BUILD = () => { window.CUES = CUESFN(); return M.film({ W, H, identity: 'storyteller', scenes: ORDER.map((id, i) => ({ dur: sc[i].sceneDur, trans: TRANS[id], draw: (c, t) => D[id](c, t, sc[i].sceneDur) })),
  letterbox: () => 0,
  overlay: (c, t, info) => {
    const last = info.index === ORDER.length - 1;
    if (THUMB) { if (window.LOGO) { const s = 84; const x = WIDE ? 40 : 60, y = WIDE ? H - s - 36 : 1490; c.drawImage(window.LOGO, x, y, s, s); M.text(c, 'Calgary Insight', x + s + 16, y + s / 2, { size: 36, base: 'middle', weight: 700 }); } return; }
    if (t > 3 && !last) M.header(c, window.LOGO, W, H, { topic: WIDE ? 'Calgary stories' : undefined });
    if (!last) M.caption(c, S.captionAt(t), W, H, WIDE ? {} : { bottom: 1410 });
    if (CUT !== 'teaser' || S.total > 25) { const mid = S.total / 2; M.followPill(c, M.seg(t, mid - 1, mid + 1, 'linear'), W, H); }
  } }); };

const CUESFN = () => { const s = i => sc[i].sceneStart, cues = [{ t: 0, sfx: 'impact', gain: -5 }, { t: .15, sfx: 'whoosh', gain: -12 }, { t: .3, sfx: 'ticks', gain: -15, dur: 1.2 }, { t: 0, sfx: 'city', dur: sc[0].sceneEnd, gain: -24 }];
  ORDER.forEach((id, i) => { if (i === 0) return; const k = TRANS[ORDER[i - 1]] && TRANS[ORDER[i - 1]].kind; cues.push({ t: Math.max(0, s(i) - .2), sfx: k === 'flash' ? 'impact' : (k === 'dissolve' || k === 'match' ? 'whoosh_rev' : 'whoosh'), gain: k === 'dissolve' ? -16 : -11 });
    const d = sc[i].sceneDur, at = (x, sfx, g, o = {}) => cues.push(Object.assign({ t: s(i) + x, sfx, gain: g }, o));
    if (id === 'L1') { at(.6, 'stamp', -7); at(d * .45, 'ticks', -15, { dur: .4 }); }
    if (id === 'L2') { at(.15, 'stamp', -7); at(.6, 'ticks', -16, { dur: 1.6 }); at(d * .6, 'pop', -11); }
    if (id === 'L3') { const sg = d / 3.3; for (let j = 0; j < 3; j++) at(.1 + j * sg + .8, 'impact', -11); for (let j = 0; j < 12; j += 3) at(.2 + j * .08, 'pop', -15); }
    if (id === 'L4') { at(.2, 'riser', -18, { dur: 1.5 }); at(d * .78, 'stamp', -6); }
    if (id === 'L5') { at(.3, 'whoosh', -15); at(d * .66, 'pop', -11); }
    if (id === 'L6') { at(.1, 'stamp', -8); at(.8, 'swell', -16, { dur: 1.6 }); at(d * .8, 'pop', -11); }
    if (id === 'L7') { at(.1, 'stamp', -7); at(d * .25, 'ticks', -15, { dur: .5 }); at(d * .55, 'whoosh', -13); }
    if (id === 'L8') { at(.4, 'swell', -17, { dur: 2 }); at(d * .55, 'stamp', -6); }
    if (id === 'L9') { at(.2, 'swell', -20, { dur: 2.5 }); }
    if (id === 'L10' || id === 'T2') { at(0, 'riser', -17, { dur: 2.2 }); at(d * .42, 'impact', -8); at(d * .66, 'ping', -11); }
    if (id === 'L11') { for (let j = 0; j < 4; j++) at(.3 + j * .35, 'pop', -15); }
    if (id === 'L12') { at(.1, 'thud', -12); }
    if (id === 'L13') { at(.2, 'pop', -13); at(d * .5, 'whoosh', -13); at(d * .7, 'ping', -12); }
    if (id === 'L14') { at(0, 'riser', -18, { dur: 1.2 }); at(.5, 'pop', -10); at(1.4, 'ping', -13); }
    if (id === 'T1') { at(.2, 'stamp', -6); at(d * .55, 'stamp', -6); at(.3, 'ticks', -15, { dur: 1.0 }); }
  });
  return cues; };
window.TOTAL = () => S.total;
