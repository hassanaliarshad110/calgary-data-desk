/* 2026-11-21 FLAGSHIP: "The Snow Eater: How Calgary's Chinook Works" (Calgary Insight ORIGINS).
 * Lead identity: Storyteller (winter dusk/night drones over the real OSM/City downtown with a story-driven sky: cold -> warm -> cold, the chinook arch).
 * Borrowed: Data Explainer counter slam, thermometer, day grid (S0, S5, S7); Civic Analyst study card and evidence map (S6, S10).
 * One file, three cuts (+ thumbnails with --param thumb=1):
 *   python3 ../../motion/engine/render.py scene.js short.mp4  --geo ../../motion/geo/calgary_base.json --param cut=short
 *   python3 ../../motion/engine/render.py scene.js wide.mp4   --geo ../../motion/geo/calgary_base.json --param cut=wide
 *   python3 ../../motion/engine/render.py scene.js teaser.mp4 --geo ../../motion/geo/calgary_base.json --param cut=teaser
 * Every number, date, name and label on screen maps to the audited claims table in packages/2026-11-21-FLAGSHIP-snow-eater-chinook.md (C#).
 * Regional map: Natural Earth 1:50m (public domain), extracted to region.json. */
const PR = window.PARAMS || {}, CUT = PR.cut || 'short', THUMB = !!PR.thumb;
const WIDE = CUT === 'wide';
const W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920;
const CX = WIDE ? W / 2 : (W - 120) / 2 + 30;
const L = WIDE ? { hookY: 210, kick: THUMB ? 52 : 44, stampY: 160, chip: 46, src: [48, H - 40], fov: 44 }
               : { hookY: THUMB ? 480 : 430, kick: 52, stampY: 380, chip: 50, src: [60, 1462], fov: 60 };

// measured Kokoro line durations (studio-probe, af_heart): index = line number in probe/tts_lines.json
// 0-12 = L0-L12, 13 = T1, 14 = T2, 15 = L13
const VD = [4.523, 5.463, 5.44, 7.127, 6.913, 6.677, 14.04, 8.641, 8.108, 6.807, 17.433, 2.688, 3.2, 9.921, 5.5, 3.358];   // studio-probe run of 2026-11-21 17:02 UTC (durs.json); L13 tightened (0.25 s cut from the pause after the question, atempo 1.05: 3.771 s -> 3.358 s) so the ending stays <= 4 s
const LINES = {
 "L0": "One January day, a wind warmed Calgary by thirty degrees in four hours.",
 "L1": "It's called a chinook. It usually begins with a sudden shift in the wind over the Pacific.",
 "L2": "Forced up over the Rockies, the air cools about half a degree for every hundred metres it climbs.",
 "L3": "Then it races down the other side, warming about one degree every hundred metres. Warm, dry wind pours onto the prairie.",
 "L4": "You can spot it in the sky: a band of cloud parallel to the mountains, with a sharp, straight edge. The chinook arch.",
 "L5": "On January eleventh, nineteen eighty-three, Calgary went from minus seventeen to plus thirteen in four hours.",
 "L6": "A chinook can even split the map. At seven in the morning on November twenty-second, twenty seventeen, Calgary's airport read minus eight point one. Springbank Airport, just twenty-five kilometres west, read plus eight point four.",
 "L7": "An Environment Canada meteorologist put it at about twenty-five chinook days a winter in Calgary. About one every three or four days.",
 "L8": "The name comes from the Chinook people of the lower Columbia River, near the Pacific. But it's also known by an Indigenous name: the snow eater.",
 "L9": "It melts snow and dries the soil. Trees can start growing too early, and new leaves may be killed by the next frost.",
 "L10": "Not everyone loves it. In a study published in two thousand, University of Calgary researchers looked at the diaries of seventy-five migraine patients. For some, migraines were more likely just before a chinook, or on high-wind chinook days. Most weren't affected by either.",
 "L11": "A few hours or days later, the cold comes back.",
 "L12": "For most people, it's a welcome break from the winter cold.",
 "L13": "Chinooks: love them or hate them? Drop your thoughts below.",
 "T0": "(= L0) One January day, a wind warmed Calgary by thirty degrees in four hours.",
 "T1": "It's a chinook: a warm, dry wind pouring down the Rockies. An Environment Canada meteorologist puts it at about twenty-five chinook days a Calgary winter.",
 "T2": "Full video on our page. Chinooks: love them or hate them? Drop your thoughts below."
};
const IDX = { T0: 0, T1: 13, T2: 14, L13: 15 };
const DUR = id => VD[IDX[id] ?? +id.slice(1)];
const ORDER = { wide: ['L0','L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11','L12','L13'],
                short: ['L0','L1','L3','L5','L6','L8','L10','L13'],   // L2, L4, L7, L9, L11, L12 dropped after measuring (78.6 s -> 71 s)
                teaser: ['T0','T1','T2'] }[CUT];
const TXT = id => LINES[id === 'T0' ? 'L0' : id];
const S = M.script(ORDER.map(id => ({ text: TXT(id), dur: DUR(id), gapAfter: id === (CUT === 'short' ? 'L3' : 'L4') ? .8 : undefined })),
                   { lead: .3, gap: CUT === 'teaser' ? .35 : .4, tail: CUT === 'teaser' ? 1.0 : .6 });
const sc = S.scenes;

// ---------- palette and places (continuity bible) ----------
const GOLD = M.house.gold, ORANGE = '#f7931e', ICE = '#7cc4ff', CLOUD = '#5f6b7c', INK = '#22303f', NAVY = '#0b1f3a';
const TOWER = M.geo.lm('Calgary Tower') || [613, -44, 0];
const YYC = M.geo.lm('Calgary International Airport') || M.geo.xy(51.1215, -114.0076);   // C7
const SPRINGBANK = M.geo.xy(51.1031, -114.3739);                                           // Springbank Airport (C7), outside the City boundary
const CAL = [51.0447, -114.0719];
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const NEC = 'Map: Natural Earth (public domain)';
const MAP = { land: '#16263f', park: '#1d3b33', water: '#2c5378', building: '#3a4a60', road: '#2a3a52', motorway: '#3b4b63', community: '#ffffff' };
const WINTER = { land: '#cfd6de', park: '#bfcad3', water: '#7d9cb8', building: '#6d7787', road: '#aab3bf', motorway: '#b8bfc9', community: '#ffffff' };

let REGION = null;
window.PRELOAD = async () => { try { REGION = await (await fetch('region.json')).json(); } catch (e) { REGION = null; } };

// ---------- helpers ----------
const cam = o => M.camera(Object.assign({ fov: L.fov }, o), W, H);
const band = (c, y0, y1, a = .7) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.2, `rgba(7,13,24,${a})`); g.addColorStop(.8, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const stamp = (c, s, t, t0, x = CX, y = L.stampY, size, fade = 1, col = GOLD) => { const k = M.seg(t, t0, t0 + .35, 'outBack'); if (k <= 0 || fade <= 0) return; size = size || (WIDE ? 96 : 112);
  c.save(); c.translate(x, y); c.rotate(-.04); const s2 = M.lerp(1.8, 1, k); c.scale(s2, s2); c.globalAlpha = Math.min(1, k * 1.5) * fade;
  c.font = M.font(size, 800); const tw = c.measureText(s).width; M.rr(c, -tw / 2 - 34, -size * .62, tw + 68, size * 1.24, 22); c.fillStyle = 'rgba(7,13,24,.85)'; c.fill(); c.lineWidth = 8; c.strokeStyle = col; c.stroke();
  M.text(c, s, 0, -size * .52, { size, weight: 800, align: 'center', color: '#fff' }); c.restore(); };
const src = (c, s) => M.source(c, s, L.src[0], L.src[1], { size: 20, maxW: WIDE ? 1500 : 860 });
const srcMap = (c, s, credit = MAPC) => { M.source(c, credit, L.src[0], L.src[1] - 36, { size: 20 }); if (s) src(c, s); };
const tag = (c, s, y, x) => M.text(c, s, x || (WIDE ? W - 60 : W - 150), y || (WIDE ? H - 120 : 1300), { size: 22, weight: 500, align: 'right', color: '#c9d3e0' });
const navyBg = (c, a = '#0b1f3a', b = '#070d18') => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const north = (c) => { const nx = WIDE ? W - 90 : W - 190, ny = WIDE ? 200 : 300; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(nx, ny - 34); c.lineTo(nx + 15, ny + 8); c.lineTo(nx - 15, ny + 8); c.closePath(); c.fill(); M.text(c, 'N', nx, ny + 14, { size: 28, weight: 800, align: 'center' }); };
const mixc = (a, b, k) => M.blend ? M.blend(a, b, k) : (k < .5 ? a : b);
const hex = h => h[0] === '#' ? [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)] : h.match(/[\d.]+/g).slice(0, 3).map(Number);
const mix = (a, b, k) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };

// ---------- the story sky over the real downtown: warm 0..1 (cold blue -> chinook gold), arch 0..1, snow 0..1, night ----------
const MTN = (() => { const r = M.rng(21), pts = []; let y = 0; for (let i = 0; i <= 120; i++) { y = .55 * y + .45 * r(); pts.push(.25 + .75 * y * (.6 + .4 * Math.sin(i * .37) ** 2)); } return pts; })();
function storySky(c, cm, o) {
  const hz = Math.min(H * .98, Math.max(H * .05, cm.horizon)), warm = o.warm || 0, nt = o.night || 0;
  const top = mix(mix('#3b4f6b', '#2a4f86', warm), '#04070f', nt), mid = mix(mix('#8193ab', '#6f8fc0', warm), '#0d1a33', nt), low = mix(mix('#c3ccd6', '#f6b65c', warm), '#2a2c48', nt);
  const g = c.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, top); g.addColorStop(.6, mid); g.addColorStop(1, low); c.fillStyle = g; c.fillRect(0, 0, W, hz + 2);
  // the chinook arch: a grey cloud deck with a straight lower edge, a clear (warm) strip of sky under it, parallel to the mountains
  const a = o.arch || 0; if (a > 0) { const edge = M.lerp(hz - 40, hz - (WIDE ? 300 : 520), a), gg = c.createLinearGradient(0, 0, 0, edge);
    gg.addColorStop(0, `rgba(40,46,58,${.98 * a})`); gg.addColorStop(.85, `rgba(70,78,92,${.97 * a})`); gg.addColorStop(1, `rgba(96,104,118,${.95 * a})`);
    const gl = c.createLinearGradient(0, edge, 0, hz); gl.addColorStop(0, `rgba(255,196,120,${.55 * a})`); gl.addColorStop(1, `rgba(255,196,120,0)`); c.fillStyle = gl; c.fillRect(0, edge - 20, W, hz - edge + 20);
    c.fillStyle = gg; c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(W, edge - 14); c.quadraticCurveTo(W / 2, edge - 34, 0, edge); c.closePath(); c.fill();
    c.strokeStyle = `rgba(255,236,200,${.9 * a})`; c.lineWidth = 5; c.beginPath(); c.moveTo(0, edge); c.quadraticCurveTo(W / 2, edge - 34, W, edge - 14); c.stroke(); }
  // Rockies silhouette on the western horizon (seen only when looking west)
  const mh = (WIDE ? 70 : 90) * (o.mtn ?? 1); c.fillStyle = mix(mix('#7d8a9e', '#8c6f73', warm), '#141a2c', nt); c.beginPath(); c.moveTo(0, hz + 2);
  MTN.forEach((v, i) => c.lineTo(i / (MTN.length - 1) * W, hz - v * mh)); c.lineTo(W, hz + 2); c.closePath(); c.fill();
  c.fillStyle = `rgba(255,255,255,${.75 * (1 - nt)})`; MTN.forEach((v, i) => { if (v > .72) { const x = i / (MTN.length - 1) * W; c.beginPath(); c.moveTo(x - 8, hz - v * mh + 10); c.lineTo(x, hz - v * mh); c.lineTo(x + 8, hz - v * mh + 10); c.fill(); } });
  const gr = c.createLinearGradient(0, hz, 0, H); gr.addColorStop(0, mix(mix('#c9d2dc', '#a89a84', warm * .8), '#0a0f18', nt)); gr.addColorStop(1, mix(mix('#e9eef3', '#8e8a7a', warm * .8), '#080c14', nt)); c.fillStyle = gr; c.fillRect(0, hz, W, H - hz);
}
function city(c, cm, o, t) {
  storySky(c, cm, o);
  const warm = o.warm || 0, nt = o.night || 0, w = M.world({ sky: 'winter', drawSky: false, fog: { near: 3000, far: 26000, max: .5, color: mix(mix('#c3ccd6', '#e9b77a', warm), '#1a2236', nt) } });
  const cols = { land: mix(mix('#dfe5ea', '#a59a86', warm * .8), '#151b28', nt), park: mix('#d3dbe2', '#16201c', nt), water: '#6f8fae', building: mix(mix('#7c8696', '#8a7a6c', warm * .6), '#2c3444', nt), road: mix('#b6bec8', '#2a3242', nt), motorway: mix('#c3c9d1', '#3a4252', nt) };
  M.geo.addBase(w, { buildings: true, colors: cols, windows: '#ffd27a', windowAlpha: .3 + .5 * nt });
  w.render(c, cm);
  if (o.snow > 0) M.weather(c, 'snow', t, W, H, { count: Math.round(420 * o.snow), wind: o.wind ?? 260, speed: 1.6, seed: 5 });
  if (warm > 0) { c.save(); c.globalAlpha = warm * .18; c.fillStyle = ORANGE; c.fillRect(0, 0, W, H); c.restore(); }
}
const westCam = (p, o = {}) => { const d = o.dist || 1; return cam({ pos: [TOWER[0] + M.lerp(4200, 2600, p) * d, TOWER[1] + M.lerp(1700, 900, p) * d, M.lerp(o.h0 || 700, o.h1 || 380, p)], look: [TOWER[0] - 3000, TOWER[1] - 200, o.lookZ ?? 260] }); };

// thermometer: v in °C, range -20..+15
function thermo(c, x, y, h, v, o = {}) {
  const k = M.clamp ? M.clamp((v + 20) / 35) : Math.max(0, Math.min(1, (v + 20) / 35)), w = o.w || (WIDE ? 46 : 56), col = mix('#7cc4ff', '#f7931e', Math.max(0, Math.min(1, (v + 17) / 30)));
  c.save(); M.rr(c, x - w / 2, y - h, w, h, w / 2); c.fillStyle = 'rgba(7,13,24,.75)'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#fff'; c.stroke();
  c.beginPath(); c.arc(x, y + w * .55, w * .85, 0, 7); c.fillStyle = col; c.fill(); c.stroke();
  M.rr(c, x - w * .26, y - h * k, w * .52, h * k + w * .3, w * .26); c.fillStyle = col; c.fill();
  const z = y - h * (20 / 35); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - w * .8, z); c.lineTo(x - w * .5, z); c.stroke();
  if (o.label !== false) M.text(c, '0°', x - w * .9, z, { size: WIDE ? 24 : 28, weight: 700, align: 'right', base: 'middle' });
  c.restore();
}
const fmtT = v => (v > 0.05 ? '+' : v < -0.05 ? '−' : '') + Math.abs(Math.round(v)) + '°';

// the headline in the thumbnail's design (frame 0 = thumbnail; THUMB kicker = "THE SNOW EATER")
function headline(c, t) {
  const k = M.seg(t, 0, .45, 'outBack'), s = M.lerp(1.12, 1, k), big = WIDE ? (THUMB ? 270 : 210) : 250, sub = WIDE ? (THUMB ? 150 : 96) : 124;
  band(c, WIDE ? 20 : 230, WIDE ? 560 : 980, .6);
  c.save(); c.translate(WIDE ? (THUMB ? 700 : CX) : CX, L.hookY); c.scale(s, s);
  M.chip(c, THUMB ? 'THE SNOW EATER' : 'ONE JANUARY DAY', 0, -(WIDE ? 110 : 150), { align: 'center', size: L.kick, bg: '#ffffff', color: NAVY });
  M.text(c, '+30°', 0, 0, { size: big, weight: 800, align: 'center', color: GOLD });
  M.text(c, 'IN 4 HOURS', 0, big * 1.0, { size: sub, weight: 800, align: 'center' });
  c.restore();
}

// ---------- regional map (Natural Earth): lon/lat -> screen with a 2D camera {lon, lat, s (px per degree of latitude)} ----------
function region(c, v, o = {}) {
  const kx = Math.cos(v.lat * Math.PI / 180), P = (lon, lat) => [W / 2 + (lon - v.lon) * kx * v.s, H / 2 - (lat - v.lat) * v.s];
  c.fillStyle = '#0e2c4f'; c.fillRect(0, 0, W, H);
  const gw = c.createRadialGradient(W * .2, H * .6, 50, W * .2, H * .6, W); gw.addColorStop(0, 'rgba(40,90,140,.35)'); gw.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gw; c.fillRect(0, 0, W, H);
  if (!REGION) return P;
  REGION.provinces.forEach(pv => pv.rings.forEach(r => { c.beginPath(); r.forEach((q, i) => { const p = P(q[0], q[1]); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.closePath();
    c.fillStyle = pv.name === 'Alberta' ? '#24384f' : '#1b2c40'; c.fill(); c.strokeStyle = 'rgba(200,215,235,.35)'; c.lineWidth = 2; c.stroke(); }));
  REGION.rivers.forEach(rv => rv.lines.forEach(l => { const hi = o.hiRiver === rv.name; c.beginPath(); l.forEach((q, i) => { const p = P(q[0], q[1]); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); });
    c.strokeStyle = hi ? `rgba(140,210,255,${.5 + .5 * (o.hiA ?? 1)})` : 'rgba(90,150,210,.55)'; c.lineWidth = hi ? 5 + 5 * (o.hiA ?? 1) : 2; c.stroke(); }));
  return P;
}
function pin2(c, x, y, label, p = 1, o = {}) { const d = M.ease.outBack(Math.max(0, Math.min(1, p))); if (p <= 0) return; const yy = y - (1 - d) * 160, s = o.s || 1; c.save(); c.globalAlpha = Math.min(1, p * 3);
  c.fillStyle = o.color || GOLD; c.beginPath(); c.moveTo(x, yy); c.bezierCurveTo(x - 30 * s, yy - 45 * s, x - 26 * s, yy - 82 * s, x, yy - 82 * s); c.bezierCurveTo(x + 26 * s, yy - 82 * s, x + 30 * s, yy - 45 * s, x, yy); c.fill();
  c.fillStyle = NAVY; c.beginPath(); c.arc(x, yy - 55 * s, 10 * s, 0, 7); c.fill();
  if (label) M.text(c, label, x + (o.dx || 0), yy - 135 * s, { size: o.size || (WIDE ? 38 : 44), weight: 800, align: o.align || 'center', stroke: 6, strokeColor: '#06101f' }); c.restore(); }
// wind streak along a quadratic path, travelling with phase
function streak(c, a, b, ctrl, ph, col, wpx) { c.save(); c.strokeStyle = col; c.lineWidth = wpx; c.lineCap = 'round'; c.setLineDash([60, 900]); c.lineDashOffset = -ph * 960; c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(ctrl[0], ctrl[1], b[0], b[1]); c.stroke(); c.restore(); }

// ---------- schematic west-east cross-section (S2, S3, T1) ----------
function terrainY(f) { // f 0..1 west -> east; returns 0..1 height
  const coast = f < .14 ? 0 : 0, bump = (x, c0, w, h) => h * Math.exp(-(((x - c0) / w) ** 2));
  if (f < .12) return -0.02; // ocean
  return .04 + bump(f, .22, .05, .22) + bump(f, .34, .08, .12) + bump(f, .52, .05, .56) + bump(f, .58, .035, .42) + bump(f, .47, .04, .3) + (f > .66 ? -.01 : 0);
}
function section(c, t, d, phase, o = {}) { // phase: 0 = climb (S2), 1 = descend (S3)
  const top = WIDE ? 150 : 560, bot = WIDE ? 900 : 1180, hh = bot - top - (WIDE ? 120 : 120), X = f => WIDE ? f * W : 20 + f * (W - 160), Y = f => bot - terrainY(f) * hh;
  const sky = c.createLinearGradient(0, top - 200, 0, bot); sky.addColorStop(0, '#0d1d36'); sky.addColorStop(1, '#2a4a72'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
  // ocean
  c.fillStyle = '#16456f'; c.fillRect(0, Y(.05), X(.13), bot - Y(.05) + 400);
  // ground
  c.beginPath(); c.moveTo(0, bot + 400); for (let i = 0; i <= 200; i++) { const f = i / 200; c.lineTo(X(f), Y(f)); } c.lineTo(W, bot + 400); c.closePath();
  const gg = c.createLinearGradient(0, top, 0, bot); gg.addColorStop(0, '#e9eef3'); gg.addColorStop(.35, '#6f7b6a'); gg.addColorStop(1, '#3e4a3c'); c.fillStyle = gg; c.fill();
  // snow caps
  c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(0, 0, W, bot - .32 * hh); c.restore();
  // prairie + Calgary marker (simple tower silhouettes, labelled)
  const cxp = X(.86), cy = Y(.86); c.fillStyle = '#26303d'; [[-60, 70], [-34, 120], [-8, 95], [18, 150], [44, 80], [70, 60]].forEach(([dx, h]) => c.fillRect(cxp + dx, cy - h * (WIDE ? .8 : 1), 22, h * (WIDE ? .8 : 1)));
  c.fillRect(cxp + 96, cy - 160, 8, 160); c.beginPath(); c.arc(cxp + 100, cy - 165, 12, 0, 7); c.fill();
  M.text(c, 'Calgary', cxp + 20, cy - (WIDE ? 190 : 230), { size: WIDE ? 40 : 44, weight: 800, align: 'center' });
  M.text(c, 'Pacific', X(.065), Y(.05) - 60, { size: WIDE ? 32 : 34, weight: 700, align: 'center', color: '#cfe8ff' });
  M.text(c, 'Rocky Mountains', WIDE ? X(.6) : X(.55), WIDE ? top + 120 : top - 20, { size: WIDE ? 40 : 44, weight: 800, align: 'center', alpha: o.rockyA ?? 1 });
  M.text(c, 'prairie', X(.72), Y(.72) - 60, { size: WIDE ? 30 : 34, weight: 600, align: 'center', color: '#dfe7f2' });
  // clouds and snow on the windward (west) slope
  const cl = phase === 0 ? M.seg(t, .6, 2) : 1; c.save(); c.globalAlpha = .85 * cl; c.fillStyle = '#c9d3df';
  [[.36, .5], [.42, .62], [.48, .74], [.3, .42]].forEach(([f, hgt], i) => { const x = X(f), y = bot - hgt * hh - (WIDE ? 70 : 110); for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x + (k - 1.5) * 34, y + Math.sin(k + i) * 10, 40 + 8 * k % 3, 0, 7); c.fill(); } });
  c.fillStyle = 'rgba(255,255,255,.9)'; const r = M.rng(9); for (let i = 0; i < 70; i++) { const f = .3 + r() * .2, y0 = bot - (.4 + r() * .3) * hh, fall = ((t * 60 + r() * 200) % 160); c.beginPath(); c.arc(X(f) + Math.sin(t + i) * 6, y0 - 40 + fall, 3, 0, 7); c.fill(); } c.restore();
  // the air parcel: path along the terrain, 70-120 px above it
  const path = f => [X(f), Y(f) - (WIDE ? 70 : 100) - 30 * Math.sin(f * 7)];
  const f0 = phase === 0 ? M.lerp(.1, .52, M.seg(t, .3, d * .9, 'inOutSine')) : M.lerp(.53, .84, M.seg(t, .2, d * .75, 'inOutSine'));
  const warmK = phase === 0 ? 0 : M.seg(f0, .55, .8);
  // trail
  c.save(); c.lineCap = 'round'; for (let i = 0; i < 26; i++) { const ff = f0 - i * .008; if (ff < .1) break; const p = path(ff); c.fillStyle = phase === 0 ? `rgba(200,230,255,${.6 * (1 - i / 26)})` : `rgba(247,147,30,${.7 * (1 - i / 26)})`; c.beginPath(); c.arc(p[0], p[1], 10 * (1 - i / 30), 0, 7); c.fill(); } c.restore();
  if (phase === 1) { for (let i = 0; i < 6; i++) { const ph = ((t * .7 + i / 6) % 1); const a = path(.56 + ph * .2), b = path(.6 + ph * .3); c.strokeStyle = `rgba(247,147,30,${.5 * Math.sin(ph * Math.PI)})`; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(a[0], a[1] + 30); c.lineTo(b[0], b[1] + 30); c.stroke(); } }
  const p = path(f0); c.save(); c.shadowColor = phase === 0 ? '#9fd4ff' : ORANGE; c.shadowBlur = 30; c.fillStyle = mix('#e6f3ff', '#f7931e', warmK); c.beginPath(); c.arc(p[0], p[1], WIDE ? 20 : 24, 0, 7); c.fill(); c.restore();
  // west wind arrow
  c.save(); c.globalAlpha = .8; c.fillStyle = '#fff'; const ax = X(.04), ay = top + (WIDE ? 30 : 40); c.fillRect(ax, ay - 4, 110, 8); c.beginPath(); c.moveTo(ax + 130, ay); c.lineTo(ax + 100, ay - 18); c.lineTo(ax + 100, ay + 18); c.fill(); M.text(c, 'west', ax, ay + 18, { size: 26, weight: 600 }); c.restore();
  M.text(c, 'east', W - (WIDE ? 60 : 150), top + (WIDE ? 20 : 30), { size: 26, weight: 600, align: 'right', alpha: .8 });
  tag(c, 'schematic, not to scale', WIDE ? H - 120 : 1300);
}

// ---------- scenes by line id ----------
const D = {
  // HOOK (C1): winter dusk drone push toward the Calgary Tower, snow streaking sideways, thermometer climbing -17 -> +13, grade warms
  L0: (c, t, d) => {
    const p = THUMB ? .9 : M.seg(t, 0, Math.max(d, 3.2), 'outCubic'), warm = THUMB ? .7 : M.seg(t, .2, d, 'inOutSine');
    const cm = westCam(p, { h0: 820, h1: 420 });
    city(c, cm, { warm, snow: 1 - warm * .85, wind: 420, arch: THUMB ? .8 : M.seg(t, d * .4, d, 'inOutSine') * .8 }, t);
    const v = THUMB ? 13 : M.lerp(-17, 13, M.seg(t, 0, d * .9, 'inOutSine'));
    const tx = WIDE ? (THUMB ? 1500 : 1640) : 880, ty = WIDE ? 860 : 1170, th = WIDE ? 500 : 300;
    thermo(c, tx, ty, th, v); M.text(c, fmtT(v) + 'C', WIDE ? tx : tx - 80, WIDE ? ty + 50 : ty - 20, { size: WIDE ? 54 : 72, weight: 800, align: WIDE ? 'center' : 'right', color: v > 0 ? GOLD : ICE, stroke: 6, strokeColor: '#06101f' });
    headline(c, t);
  },
  // WHERE IT STARTS (C2): regional map, winds swing to the south-west over the Pacific and speed up
  L1: (c, t, d) => {
    const f = M.seg(t, 0, d, 'inOutSine'), v = { lon: WIDE ? M.lerp(-123.5, -121, f) : M.lerp(-122.2, -120.8, f), lat: WIDE ? 49.2 : 49.4, s: WIDE ? M.lerp(70, 82, f) : M.lerp(66, 76, f) };
    const P = region(c, v);
    const sp = M.lerp(.4, 1.6, M.seg(t, .5, d * .7));
    for (let i = 0; i < 9; i++) { const lat0 = 44 + i * 1.3, a = P(-136, lat0 - 2.2), b = P(-124.5, lat0 + 1.4), ctrl = P(-129, lat0 - 1.2);
      streak(c, a, b, ctrl, (t * sp * .55 + i * .37) % 1, 'rgba(235,246,255,1)', WIDE ? 8 : 10); streak(c, a, b, ctrl, (t * sp * .55 + i * .37 + .5) % 1, 'rgba(235,246,255,.7)', WIDE ? 6 : 8); }
    const cp = P(CAL[1], CAL[0]); pin2(c, cp[0], cp[1], 'Calgary', M.seg(t, d * .45, d * .45 + .5, 'linear'));
    const po = P(WIDE ? -131.5 : -128.2, 46.6); M.text(c, 'Pacific Ocean', po[0], po[1], { maxW: WIDE ? 600 : 260, size: WIDE ? 46 : 52, weight: 800, align: 'center', color: '#cfe8ff', alpha: M.seg(t, .2, .6), stroke: 6, strokeColor: '#06101f' });
    const ab = P(-113.2, 54.6); M.text(c, 'ALBERTA', ab[0], ab[1], { size: WIDE ? 30 : 34, weight: 700, align: 'center', color: '#9fb0c8', alpha: .9 });
    const bc = P(-123.3, 53.6); M.text(c, 'BRITISH COLUMBIA', bc[0], bc[1], { size: WIDE ? 28 : 30, weight: 700, align: 'center', color: '#9fb0c8', alpha: .9 });
    band(c, WIDE ? 40 : 250, WIDE ? 260 : 560, .6);
    M.chip(c, 'IT USUALLY STARTS OVER THE PACIFIC', CX, WIDE ? 120 : 380, { align: 'center', size: WIDE ? 52 : 48, bg: '#ffffff', color: NAVY, alpha: M.seg(t, .3, .7), maxW: W - 160 });
    north(c); srcMap(c, 'Source: CBC Calgary, “Calgary’s reprieve from the grasp of winter”', NEC);
  },
  // HOW IT COOLS (C3): cross-section, the parcel climbs the west slope under cloud and snow
  L2: (c, t, d) => { section(c, t, d, 0);
    band(c, WIDE ? 20 : 250, WIDE ? 150 : 480, .55);
    M.chip(c, 'COOLS ~0.5° PER 100 M', CX, WIDE ? 40 : 360, { align: 'center', size: WIDE ? 58 : 56, bg: ICE, color: NAVY, alpha: M.seg(t, .4, .8) });
    src(c, 'Source: CBC Calgary, “Calgary’s reprieve from the grasp of winter”'); },
  // HOW IT WARMS (C4): same cross-section, the parcel races down the east side, turning orange, onto the prairie
  L3: (c, t, d) => { section(c, t, d, 1);
    band(c, WIDE ? 20 : 250, WIDE ? 150 : 480, .55);
    M.chip(c, 'WARMS ~1° PER 100 M', CX, WIDE ? 40 : 330, { align: 'center', size: WIDE ? 58 : 56, bg: ORANGE, color: NAVY, alpha: M.seg(t, .3, .7) });
    M.chip(c, 'WARM · DRY', CX, WIDE ? 150 : 430, { align: 'center', size: L.chip, bg: '#ffffff', color: NAVY, alpha: M.seg(t, d * .55, d * .55 + .4) });
    src(c, 'Sources: CBC Calgary · The Canadian Encyclopedia'); },
  // THE ARCH (C5): the real downtown from the east looking west, the cloud deck with a straight edge slides over the mountains
  L4: (c, t, d) => {
    const p = M.seg(t, 0, d, 'inOutSine'), cm = cam({ pos: [TOWER[0] + 5200, TOWER[1] + 2200, M.lerp(260, 700, p)], look: [TOWER[0] - 4000, TOWER[1] - 400, M.lerp(500, 900, p)] });
    city(c, cm, { warm: .45, snow: 0, arch: M.seg(t, .2, d * .55, 'inOutCubic'), mtn: 1.3 }, t);
    band(c, WIDE ? 640 : 1000, WIDE ? 900 : 1300, .55);
    M.chip(c, 'THE CHINOOK ARCH', CX, WIDE ? 690 : 1060, { align: 'center', size: WIDE ? 70 : 76, bg: GOLD, color: NAVY, alpha: M.seg(t, d * .6, d * .6 + .4) });
    M.text(c, 'band of cloud parallel to the mountains', CX, WIDE ? 810 : 1190, { size: WIDE ? 38 : 40, weight: 700, align: 'center', alpha: M.seg(t, d * .3, d * .3 + .4) });
    tag(c, 'skyline: OpenStreetMap buildings · sky illustrated', WIDE ? H - 120 : 1330);
    src(c, 'Sources: CBC Calgary; CBC News (Environment Canada)');
  },
  // THE RECORD DAY (C6): counter -17 -> +13, thermometer and a 4-hour clock sweep
  L5: (c, t, d) => {
    navyBg(c, '#13284a', '#070d18'); const p = M.seg(t, d * .25, d * .85, 'inOutSine'), v = M.lerp(-17, 13, p);
    stamp(c, 'JAN. 11, 1983', t, .1, CX, WIDE ? 150 : 380);
    const tx = WIDE ? 560 : 230, ty = WIDE ? 900 : 1180, th5 = WIDE ? 520 : 520; thermo(c, tx, ty, th5, v, { w: WIDE ? 60 : 70 });
    const cx = WIDE ? 1400 : 650, cy = WIDE ? 490 : 760, R = WIDE ? 140 : 150;
    c.save(); c.lineWidth = 10; c.strokeStyle = '#fff'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
    for (let h = 0; h < 12; h++) { const a = h / 12 * Math.PI * 2; c.lineWidth = 5; c.beginPath(); c.moveTo(cx + Math.sin(a) * R * .82, cy - Math.cos(a) * R * .82); c.lineTo(cx + Math.sin(a) * R * .95, cy - Math.cos(a) * R * .95); c.stroke(); }
    c.fillStyle = 'rgba(247,147,30,.45)'; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R * .8, -Math.PI / 2, -Math.PI / 2 + p * (4 / 12) * Math.PI * 2); c.closePath(); c.fill();
    const a = -Math.PI / 2 + p * (4 / 12) * Math.PI * 2; c.lineWidth = 10; c.strokeStyle = GOLD; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R * .75, cy + Math.sin(a) * R * .75); c.stroke(); c.restore();
    M.chip(c, 'IN 4 HOURS', cx, cy + R + (WIDE ? 30 : 24), { align: 'center', size: WIDE ? 54 : 56, bg: GOLD, color: NAVY, alpha: M.seg(t, d * .5, d * .5 + .4) });
    M.text(c, fmtT(v) + 'C', WIDE ? 1400 : 650, WIDE ? 760 : 1040, { size: WIDE ? 130 : 120, weight: 800, align: 'center', color: v > 0 ? GOLD : ICE });
    M.text(c, '−17°C → +13°C', CX, WIDE ? 280 : 520, { size: WIDE ? 70 : 76, weight: 800, align: 'center', alpha: M.seg(t, .5, .9) });
    src(c, 'Source: CBC Calgary, “Calgary’s reprieve from the grasp of winter”');
  },
  // THE SPLIT MORNING (C7): city map, cold airport vs warm Springbank, 25 km apart
  L6: (c, t, d) => {
    const w = M.world({ sky: 'night', fog: { near: 90000, far: 200000, max: .2 } }); M.geo.addBase(w, { buildings: false, colors: MAP, riverW: 140, roads: true, boundaryStroke: true });
    const mid = [(YYC[0] + SPRINGBANK[0]) / 2, (YYC[1] + SPRINGBANK[1]) / 2 + (WIDE ? 1500 : 0), 0];
    const cm = cam(M.moves.dive(mid, M.seg(t, 0, d * .5, 'outCubic'), { h0: WIDE ? 70000 : 110000, h1: WIDE ? 34000 : 62000, back0: 1, back1: WIDE ? 9000 : 16000, ahead: 50 }));
    w.render(c, cm);
    const a = cm.project(YYC), b = cm.project(SPRINGBANK), warmP = M.seg(t, d * .3, d * .65, 'inOutCubic');
    if (a && b) {
      // warm air entering from the west, stopping short of the airport
      const edge = M.lerp(0, (a[0] !== undefined ? a.x : a.x), 1), xw = M.lerp(-200, (a.x + b.x) / 2 + (a.x - b.x) * .12, warmP);
      const g = c.createLinearGradient(xw - 500, 0, xw, 0); g.addColorStop(0, 'rgba(247,147,30,.42)'); g.addColorStop(.85, 'rgba(247,147,30,.28)'); g.addColorStop(1, 'rgba(247,147,30,0)'); c.fillStyle = g; c.fillRect(0, WIDE ? 0 : 300, Math.max(0, xw), H);
      const cold = c.createRadialGradient(a.x, a.y, 10, a.x, a.y, WIDE ? 360 : 300); cold.addColorStop(0, 'rgba(124,196,255,.35)'); cold.addColorStop(1, 'rgba(124,196,255,0)'); c.fillStyle = cold; c.fillRect(0, 0, W, H);
      pin2(c, a.x, a.y, 'Calgary airport', M.seg(t, .6, 1.1, 'linear'), { color: ICE, size: WIDE ? 36 : 40 });
      pin2(c, b.x, b.y, 'Springbank Airport', M.seg(t, d * .35, d * .35 + .5, 'linear'), { color: ORANGE, size: WIDE ? 36 : 40 });
      M.chip(c, '−8.1°C', a.x, a.y + 26, { align: 'center', size: WIDE ? 54 : 56, bg: ICE, color: NAVY, alpha: M.seg(t, d * .3, d * .3 + .4) });
      M.chip(c, '+8.4°C', b.x, b.y + 26, { align: 'center', size: WIDE ? 54 : 56, bg: ORANGE, color: NAVY, alpha: M.seg(t, d * .62, d * .62 + .4) });
      const by = Math.max(a.y, b.y) + (WIDE ? 150 : 160), ka = M.seg(t, d * .7, d * .7 + .5);
      if (ka > 0) { c.save(); c.globalAlpha = ka; c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.moveTo(b.x, by - 16); c.lineTo(b.x, by); c.lineTo(a.x, by); c.lineTo(a.x, by - 16); c.stroke(); c.restore();
        M.chip(c, '25 KM', (a.x + b.x) / 2, by + 10, { align: 'center', size: L.chip, bg: '#ffffff', color: NAVY, alpha: ka }); }
    }
    band(c, WIDE ? 40 : 250, WIDE ? 250 : 540, .62);
    stamp(c, 'NOV. 22, 2017 · 7 A.M.', t, .15, CX, WIDE ? 140 : 380, WIDE ? 80 : 74);
    north(c); srcMap(c, 'Source: CBC News, Nov 22, 2017 (Environment Canada stations)');
  },
  // HOW OFTEN (C8): 90 winter days, 25 lit at even spacing (illustration of the average), counter to about 25
  L7: (c, t, d) => {
    navyBg(c); const cols = WIDE ? 18 : 15, rows = 90 / cols, cell = WIDE ? 74 : 58, gx = CX - cols * cell / 2, gy = WIDE ? 470 : 760;
    const lit = new Set(); for (let i = 0; i < 25; i++) lit.add(Math.round(1 + i * 89 / 25));
    let n = 0; for (let i = 0; i < 90; i++) { const x = gx + (i % cols) * cell, y = gy + Math.floor(i / cols) * cell, on = lit.has(i), a = M.seg(t, .2 + i * .012, .4 + i * .012);
      const la = on ? M.seg(t, d * .3 + [...lit].indexOf(i) * (d * .45 / 25), d * .3 + [...lit].indexOf(i) * (d * .45 / 25) + .2) : 0; if (la >= 1) n++;
      c.save(); c.globalAlpha = a; M.rr(c, x + 5, y + 5, cell - 10, cell - 10, 8); c.fillStyle = la > 0 ? mix('#1e3557', '#f7931e', la) : '#1e3557'; c.fill(); c.restore(); }
    M.text(c, '≈ ' + Math.max(0, Math.min(25, Math.round(M.seg(t, d * .3, d * .75) * 25))), CX, WIDE ? 90 : 310, { size: WIDE ? 150 : 170, weight: 800, align: 'center', color: GOLD });
    M.text(c, 'CHINOOK DAYS A WINTER', CX, WIDE ? 270 : 510, { size: WIDE ? 64 : 64, weight: 800, align: 'center', maxW: W - 160 });
    M.chip(c, 'ABOUT 1 IN EVERY 3–4 DAYS', CX, WIDE ? 380 : 620, { align: 'center', size: L.chip, bg: '#ffffff', color: NAVY, alpha: M.seg(t, d * .75, d * .75 + .4) });
    M.text(c, 'December · January · February', CX, gy + rows * cell + 20, { size: WIDE ? 32 : 34, weight: 600, align: 'center', color: '#c9d3e0' });
    tag(c, 'illustration: average spacing', WIDE ? H - 120 : 1300);
    src(c, 'Source: CBC News (Environment Canada meteorologist Kirk Torneby), Feb 2017');
  },
  // THE NAMES (C9, C10): dive to the lower Columbia River, then the word THE SNOW EATER melts a drift
  L8: (c, t, d) => {
    const cut = d * .55;
    if (t < cut + .3) { const f = M.seg(t, 0, cut, 'outCubic'), v = { lon: M.lerp(-119, -123.2, f), lat: M.lerp(49.5, 46.6, f), s: M.lerp(WIDE ? 70 : 80, WIDE ? 260 : 300, f) };
      const P = region(c, v, { hiRiver: 'Columbia', hiA: M.seg(t, .3, 1) });
      const m = P(-123.6, 46.25); pin2(c, m[0], m[1], '', M.seg(t, cut * .6, cut * .6 + .4, 'linear'));
      const lb = P(-121.8, 46.45); M.text(c, 'Columbia River', lb[0], lb[1], { size: WIDE ? 44 : 50, weight: 800, align: 'center', color: '#cfe8ff', stroke: 6, strokeColor: '#06101f', alpha: M.seg(t, .6, 1) });
      band(c, WIDE ? 40 : 250, WIDE ? 230 : 540, .6);
      M.chip(c, 'NAMED FOR THE CHINOOK PEOPLE', CX, WIDE ? 110 : 380, { align: 'center', size: WIDE ? 52 : 46, bg: '#ffffff', color: NAVY, alpha: M.seg(t, .4, .8), maxW: W - 160 });
      north(c); srcMap(c, 'Sources: Wikipedia; CBC News', NEC);
      if (t > cut) { c.save(); c.globalAlpha = M.seg(t, cut, cut + .3); c.fillStyle = NAVY; c.fillRect(0, 0, W, H); c.restore(); }
      if (t < cut) return; }
    const k = M.seg(t, cut + .1, d * .95, 'inOutSine'); navyBg(c, '#13284a', '#070d18');
    M.text(c, 'an Indigenous name', CX, WIDE ? 200 : 520, { size: WIDE ? 50 : 56, weight: 700, align: 'center', color: '#dfe7f2', alpha: M.seg(t, cut + .1, cut + .5) });
    M.kinetic(c, 'THE SNOW EATER', t - d * .78, CX, WIDE ? 320 : 640, { size: WIDE ? 170 : 132, maxW: W - 160, every: .14, highlight: ['snow'], accent: ICE });
    const gy = WIDE ? 860 : 1180, dw = WIDE ? 1300 : 860; c.save(); c.fillStyle = '#eef3f8'; c.beginPath(); c.moveTo(CX - dw / 2, gy); for (let i = 0; i <= 40; i++) { const f = i / 40; c.lineTo(CX - dw / 2 + f * dw, gy - (1 - k) * (WIDE ? 150 : 170) * Math.sin(f * Math.PI) ** .7 - 6); } c.lineTo(CX + dw / 2, gy); c.closePath(); c.fill();
    c.fillStyle = `rgba(120,150,180,${.5 * k})`; c.fillRect(CX - dw / 2 - 40, gy, dw + 80, 10 + 14 * k); c.restore();
    c.fillStyle = '#5b4a3a'; c.fillRect(CX - dw / 2 - 60, gy + 10, dw + 120, 30);
    src(c, 'Sources: CBC News (Environment Canada); Wikipedia');
  },
  // WHAT IT DOES (C11): illustrated yard over time: snow shrinks, soil dries, buds open, then frost
  L9: (c, t, d) => {
    const k1 = M.seg(t, .2, d * .4, 'inOutSine'), k2 = M.seg(t, d * .35, d * .65, 'outCubic'), k3 = M.seg(t, d * .7, d * .95, 'inOutSine');
    const sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, mix(mix('#4f6c93', '#3a6fb0', k1), '#0d1830', k3)); sky.addColorStop(1, mix(mix('#c3ccd6', '#f3c27e', k1), '#2c3e5c', k3)); c.fillStyle = sky; c.fillRect(0, 0, W, H);
    const gy = WIDE ? 860 : 1220; c.fillStyle = mix('#7a6a55', '#4f3f2e', k1); c.fillRect(0, gy, W, H - gy);
    const sh = (1 - k1) * (WIDE ? 60 : 70); c.fillStyle = '#f3f6f9'; c.fillRect(0, gy - sh, W, sh + 4);
    // tree
    const tx = WIDE ? 1250 : CX + 120, th = WIDE ? 420 : 480; c.strokeStyle = '#3b2a1e'; c.lineCap = 'round'; c.lineWidth = 34; c.beginPath(); c.moveTo(tx, gy); c.lineTo(tx, gy - th); c.stroke();
    const br = [[-.9, .55, 200], [.8, .62, 190], [-.6, .82, 150], [.55, .9, 140], [0, 1, 120]]; c.lineWidth = 14;
    br.forEach(([dx, h, l]) => { const x0 = tx, y0 = gy - th * h; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + dx * l, y0 - l * .55); c.stroke();
      for (let i = 1; i <= 4; i++) { const x = x0 + dx * l * i / 4, y = y0 - l * .55 * i / 4, s = 6 + 16 * k2; if (k2 > 0) { c.fillStyle = mix('#7bc96f', '#9aa3a8', k3); c.beginPath(); c.ellipse(x, y - 8, s, s * .6, dx, 0, 7); c.fill(); }
        if (k3 > 0) { c.fillStyle = `rgba(235,245,255,${.85 * k3})`; for (let j = 0; j < 3; j++) { c.beginPath(); c.arc(x + (j - 1) * 6, y - 12 + j * 3, 3, 0, 7); c.fill(); } } } });
    const cy = WIDE ? 120 : 360; band(c, cy - 70, cy + 260, .5);
    M.chip(c, 'MELTS SNOW · DRIES SOIL', CX, cy, { align: 'center', size: L.chip, bg: '#ffffff', color: NAVY, alpha: M.seg(t, .3, .7) });
    M.chip(c, 'TREES WAKE EARLY', CX, cy + (WIDE ? 90 : 100), { align: 'center', size: L.chip, bg: '#7bc96f', color: NAVY, alpha: M.seg(t, d * .4, d * .4 + .4) });
    M.chip(c, '…THEN FROST', CX, cy + (WIDE ? 180 : 200), { align: 'center', size: L.chip, bg: ICE, color: NAVY, alpha: M.seg(t, d * .72, d * .72 + .4) });
    tag(c, 'illustration', WIDE ? H - 120 : 1300);
    src(c, 'Sources: The Canadian Encyclopedia · CBC Calgary');
  },
  // THE COMPLICATION (C12): study card, counter 75, findings chips
  L10: (c, t, d) => {
    navyBg(c, '#0e1726', '#070d18'); const k = M.seg(t, .1, .5, 'outCubic');
    const bw = WIDE ? 1500 : 940, bh = WIDE ? 330 : 380, bx = CX - bw / 2, by = (WIDE ? 120 : 300) + (1 - k) * 50;
    c.save(); c.globalAlpha = k; M.rr(c, bx, by, bw, bh, 18); c.fillStyle = '#f7f4ec'; c.fill();
    M.text(c, 'NEUROLOGY · 2000', bx + 50, by + 36, { size: WIDE ? 34 : 34, weight: 800, color: '#7a1f2b', shadow: false });
    M.text(c, 'Chinook winds and migraine headache', bx + 50, by + (WIDE ? 90 : 96), { size: WIDE ? 74 : 72, weight: 800, color: '#111a26', shadow: false, maxW: bw - 100 });
    M.text(c, 'University of Calgary', bx + 50, by + bh - (WIDE ? 70 : 74), { size: WIDE ? 36 : 38, weight: 700, color: '#5b6573', shadow: false });
    c.restore();
    const cy = WIDE ? 500 : 720;
    M.counter(c, 75, M.seg(t, d * .12, d * .3), CX, cy, { size: WIDE ? 150 : 170, slam: true, color: GOLD, decimals: 0 });
    M.text(c, 'MIGRAINE PATIENTS’ DIARIES', CX, cy + (WIDE ? 165 : 165), { size: WIDE ? 54 : 52, weight: 800, align: 'center', alpha: M.seg(t, d * .2, d * .3), maxW: W - 160 });
    const y2 = WIDE ? 770 : 960;
    M.chip(c, 'JUST BEFORE A CHINOOK', WIDE ? CX - 380 : CX, y2, { align: 'center', size: WIDE ? 46 : 48, bg: ORANGE, color: NAVY, alpha: M.seg(t, d * .5, d * .5 + .4) });
    M.chip(c, 'HIGH-WIND CHINOOK DAYS', WIDE ? CX + 380 : CX, WIDE ? y2 : y2 + 85, { align: 'center', size: WIDE ? 46 : 48, bg: ORANGE, color: NAVY, alpha: M.seg(t, d * .62, d * .62 + .4) });
    M.chip(c, 'MOST: NOT AFFECTED', CX, WIDE ? y2 + 95 : y2 + 170, { align: 'center', size: WIDE ? 52 : 52, bg: '#ffffff', color: NAVY, alpha: M.seg(t, d * .85, d * .85 + .4) });
    src(c, 'Source: Neurology 2000;54(2):302-7 (PubMed 10668687)');
  },
  // THE COLD RETURNS (C13): grade cools back to blue, the arch closes, snow again
  L11: (c, t, d) => {
    const p = M.seg(t, 0, d, 'inOutSine'), cm = westCam(.6 + .4 * (1 - p), { h0: 700, h1: 420 });
    city(c, cm, { warm: .7 * (1 - p), snow: p, wind: 120, arch: .8 * (1 - p), night: .25 * p }, t);
    band(c, WIDE ? 40 : 250, WIDE ? 260 : 560, .55);
    M.chip(c, 'THEN THE COLD COMES BACK', CX, WIDE ? 130 : 380, { align: 'center', size: WIDE ? 58 : 52, bg: ICE, color: NAVY, alpha: M.seg(t, .2, .6), maxW: W - 160 });
    tag(c, 'skyline: OpenStreetMap buildings · sky illustrated', WIDE ? H - 120 : 1330);
    src(c, 'Source: Wikipedia, “Chinook wind”');
  },
  // MEANING (C14): night drone along the towers with a warm glow on the western horizon
  L12: (c, t, d) => {
    const p = M.seg(t, 0, d + 1, 'linear'), cm = cam(M.moves.orbit([TOWER[0] - 300, TOWER[1], 120], 2800, 650, 10 + 0 * p, 18 * p, 1));
    city(c, cm, { warm: .55, night: .7, arch: .5, snow: 0 }, t);
    band(c, WIDE ? 40 : 250, WIDE ? 380 : 700, .55);
    M.text(c, 'A WELCOME BREAK', CX, WIDE ? 110 : 360, { size: WIDE ? 110 : 112, weight: 800, align: 'center', alpha: M.seg(t, .1, .5), maxW: W - 140 });
    M.text(c, 'FROM THE COLD', CX, WIDE ? 240 : 500, { size: WIDE ? 110 : 112, weight: 800, align: 'center', color: GOLD, alpha: M.seg(t, .4, .8), maxW: W - 140 });
    src(c, 'Sources: The Canadian Encyclopedia · CBC Calgary');
  },
  L13: (c, t, d) => { c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
    M.closer(c, 'Chinooks: love them or hate them?', M.seg(t, 0, d, 'linear'), W, H, { highlight: ['love', 'hate'] }); },
  // TEASER (subset of audited claims: C1, C4, C8)
  T0: (c, t, d) => D.L0(c, t, d),
  T1: (c, t, d) => {
    const half = d * .45;
    if (t < half) { section(c, t + 1.2, half + 1.2, 1); band(c, 250, 480, .55);
      M.chip(c, 'WARM · DRY', CX, 330, { align: 'center', size: 56, bg: ORANGE, color: NAVY, alpha: M.seg(t, .2, .5) }); src(c, 'Sources: CBC Calgary · The Canadian Encyclopedia'); return; }
    D.L7(c, (t - half) * 1.6 + 1.0, (d - half) * 1.6 + 1.0); },
  T2: (c, t, d) => { c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
    const a = 1 - M.seg(t, 1.5, 1.8);
    if (a > 0) { M.text(c, '▶ FULL VIDEO', CX, 640, { size: 112, weight: 800, align: 'center', alpha: a * M.seg(t, 0, .25) });
      M.text(c, 'on our page · calgaryinsight.ca', CX, 790, { size: 54, weight: 700, align: 'center', color: GOLD, alpha: a * M.seg(t, .2, .45) }); }
    if (t > 1.6) { M.closer(c, 'Chinooks: love them or hate them?', M.seg(t, 1.6, d, 'linear'), W, H, { highlight: ['love', 'hate'] });
      M.text(c, '▶ Full video on our page', CX, 1370, { size: 38, weight: 700, align: 'center', color: '#ffffff', alpha: M.seg(t, 2.4, 2.8) }); } },
};
const TRANS = { L0: { kind: 'match', dur: .5 }, L1: { kind: 'dissolve', dur: .5 }, L2: { kind: 'match', dur: .4 }, L3: { kind: 'dissolve', dur: .5 }, L4: { kind: 'flash', dur: .3 },
  L5: { kind: 'push', dur: .4 }, L6: { kind: 'push', dur: .4 }, L7: { kind: 'zoom', dur: .45 }, L8: { kind: 'dissolve', dur: .5 }, L9: { kind: 'push', dur: .4 },
  L10: { kind: 'dissolve', dur: .5 }, L11: { kind: 'dissolve', dur: .5 }, L12: { kind: 'dissolve', dur: .5 },
  T0: { kind: 'whip', dur: .35 }, T1: { kind: 'dissolve', dur: .45 } };

// Calgary Insight ORIGINS header (from 3 s; never on the closing frame): logo + "Calgary Insight" white + "ORIGINS" orange
function originsHeader(c) {
  if (!window.LOGO) return; c.save();
  if (!WIDE) { const s = 70; c.font = M.font(40, 700); const a = c.measureText('Calgary Insight ').width; c.font = M.font(40, 800); const b = c.measureText('ORIGINS').width; const x = CX - (s + 18 + a + b) / 2;
    c.drawImage(window.LOGO, x, 140, s, s); M.text(c, 'Calgary Insight', x + s + 18, 140 + s / 2, { size: 40, base: 'middle', weight: 700, shadow: 8 }); M.text(c, 'ORIGINS', x + s + 18 + a, 140 + s / 2, { size: 40, base: 'middle', weight: 800, color: ORANGE, shadow: 8 }); }
  else { c.drawImage(window.LOGO, 48, 40, 60, 60); c.font = M.font(30, 700); const a = c.measureText('Calgary Insight ').width; M.text(c, 'Calgary Insight', 124, 70, { size: 30, base: 'middle', weight: 700, shadow: 8 }); M.text(c, 'ORIGINS', 124 + a, 70, { size: 30, base: 'middle', weight: 800, color: ORANGE, shadow: 8 }); }
  c.restore();
}
function thumbBrand(c) { if (!window.LOGO) return; const s = WIDE ? 64 : 84, x = WIDE ? 40 : 60, y = WIDE ? H - s - 30 : 1490; c.drawImage(window.LOGO, x, y, s, s);
  c.font = M.font(WIDE ? 32 : 40, 700); const a = c.measureText('Calgary Insight ').width; M.text(c, 'Calgary Insight', x + s + 16, y + s / 2, { size: WIDE ? 32 : 40, base: 'middle', weight: 700 }); M.text(c, 'ORIGINS', x + s + 16 + a, y + s / 2, { size: WIDE ? 32 : 40, base: 'middle', weight: 800, color: ORANGE }); }

// captions: the audited line, word for word, shown in short chunks (break after punctuation once a chunk has 4+ words, or at 8 words), timed by word share of the line
function chunks(txt) { const ws = txt.split(/\s+/), out = []; let cur = [];
  ws.forEach((w, i) => { cur.push(w); const n = cur.length, punct = /[,.?!:;]$/.test(w), rest = ws.length - i - 1; if ((punct && n >= 3 && (rest === 0 || rest >= 3)) || n >= 9 && rest >= 3) { out.push(cur.join(' ')); cur = []; } });
  if (cur.length) { if (out.length && cur.length < 3) out[out.length - 1] += ' ' + cur.join(' '); else out.push(cur.join(' ')); } return out; }
function capAt(t) { const s = S.lineAt(t); if (!s) return ''; const cs = chunks(s.caption), tot = cs.reduce((a, x) => a + x.split(' ').length, 0); let acc = 0;
  for (const ch of cs) { acc += ch.split(' ').length; if (t < s.start + s.speech * acc / tot) return ch; } return cs[cs.length - 1]; }
window.BUILD = () => { window.CUES = CUESFN(); return M.film({ W, H, identity: 'storyteller', scenes: ORDER.map((id, i) => ({ dur: sc[i].sceneDur, trans: TRANS[id], draw: (c, t) => D[id](c, t, sc[i].sceneDur) })),
  letterbox: () => 0,
  overlay: (c, t, info) => {
    const last = info.index === ORDER.length - 1;
    if (THUMB) { thumbBrand(c); return; }
    if (t > 3 && !last) originsHeader(c);
    if (!last) M.caption(c, capAt(t), W, H, WIDE ? {} : { bottom: 1410 });
    if (S.total > 25) { const mid = S.total / 2; M.followPill(c, M.seg(t, mid - 1, mid + 1, 'linear'), W, H); }
  } }); };

const CUESFN = () => { const s = i => sc[i].sceneStart, cues = [{ t: 0, sfx: 'impact', gain: -5 }, { t: .15, sfx: 'whoosh', gain: -12 }, { t: .3, sfx: 'ticks', gain: -15, dur: 2.5 }, { t: 0, sfx: 'wind', dur: sc[0].sceneEnd + (sc[1] ? sc[1].sceneDur : 0), gain: -20 }];
  ORDER.forEach((id, i) => { if (i === 0) return; const k = TRANS[ORDER[i - 1]] && TRANS[ORDER[i - 1]].kind; cues.push({ t: Math.max(0, s(i) - .2), sfx: k === 'flash' ? 'impact' : (k === 'dissolve' || k === 'match' ? 'whoosh_rev' : 'whoosh'), gain: k === 'dissolve' ? -16 : -11 });
    const d = sc[i].sceneDur, at = (x, sfx, g, o = {}) => cues.push(Object.assign({ t: s(i) + x, sfx, gain: g }, o));
    if (id === 'L1') { at(.4, 'wind', -19, { dur: d }); at(d * .45, 'pop', -11); }
    if (id === 'L2') { at(.3, 'wind', -20, { dur: d }); }
    if (id === 'L3' || id === 'T1') { at(.2, 'whoosh', -13); at(1.2, 'wind', -18, { dur: Math.min(d, 4) }); }
    if (id === 'L4') { at(.2, 'swell', -17, { dur: 2.4 }); at(d * .6, 'ping', -11); }
    if (id === 'L5') { at(0, 'riser', -16, { dur: 1.4 }); at(.1, 'stamp', -6); at(d * .25, 'ticks', -15, { dur: d * .6 }); at(d * .5, 'impact', -9); }
    if (id === 'L6') { at(.15, 'stamp', -7); at(.6, 'pop', -12); at(d * .35, 'pop', -11); at(d * .3, 'wind', -20, { dur: d * .4 }); at(d * .7, 'ping', -12); }
    if (id === 'L7') { for (let j = 0; j < 25; j += 4) at(d * .3 + j * (d * .45 / 25), 'pop', -16); at(d * .75, 'ping', -12); }
    if (id === 'L8') { at(.3, 'swell', -18, { dur: 1.6 }); at(d * .3, 'pop', -12); at(d * .5 + .2, 'impact', -10); at(d * .55, 'wind', -21, { dur: d * .4 }); }
    if (id === 'L9') { at(.3, 'pop', -14); at(d * .4, 'pop', -14); at(d * .72, 'ping', -14); }
    if (id === 'L10') { at(.1, 'thud', -12); at(d * .28, 'impact', -10); at(d * .5, 'pop', -13); at(d * .62, 'pop', -13); at(d * .85, 'ping', -12); }
    if (id === 'L11') { at(0, 'wind', -18, { dur: d }); }
    if (id === 'L12') { at(0, 'swell', -18, { dur: d }); at(0, 'city', -24, { dur: d }); }
  });
  return cues; };
window.TOTAL = () => S.total;
