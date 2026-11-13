/* 2026-11-13 FLAGSHIP: "Forced Out Twice: The Story of Calgary's Chinatown".
 * Lead identity: Storyteller (dusk/night drones over real OSM/City geometry, dissolves through time, letterbox on wide).
 * Borrowed: Data Explainer counter slam + year stamps (S3, S5, S6); Civic Analyst evidence chips + schematic map cards (S6, S9).
 * One file, three cuts:
 *   Short (1080x1920):   python3 ../../motion/engine/render.py scene.js short.mp4  --geo ../../motion/geo/calgary_base.json --param cut=short
 *   Widescreen film:     python3 ../../motion/engine/render.py scene.js wide.mp4   --geo ../../motion/geo/calgary_base.json --param cut=wide
 *   Teaser (1080x1920):  python3 ../../motion/engine/render.py scene.js teaser.mp4 --geo ../../motion/geo/calgary_base.json --param cut=teaser
 * Every year, number, name and label on screen maps to the audited claims table in
 * packages/2026-11-13-FLAGSHIP-chinatown-forced-out-twice.md (claim numbers in comments). */
const CUT = (window.PARAMS || {}).cut || 'short', THUMB = !!(window.PARAMS || {}).thumb;
const WIDE = CUT === 'wide';
const W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920;
const CX = WIDE ? W / 2 : (W - 120) / 2 + 30;
const L = WIDE ? { hookY: THUMB ? 230 : 250, hook: THUMB ? 150 : 118, kick: THUMB ? 54 : 40, stampY: 190, chipY: 330, name: 96, chip: 44, src: [48, H - 40], fov: 44 }
               : { hookY: 470, hook: 128, kick: 48, stampY: 360, chipY: 560, name: 112, chip: 50, src: [60, 1462], fov: 60 };

// measured Kokoro line durations (studio-probe run of 2026-11-13; closing lines tightened with atempo so the ending stays <= 4 s)
const DURS = {
  wide:   [2.944, 4.075, 5.867, 9.536, 4.224, 9.344, 10.197, 5.205, 8.384, 7.744, 6.059, 3.968, 3.678],
  short:  [2.944, 4.075, 5.867, 9.536, 4.224, 9.344, 10.197, 5.205, 8.384, 3.968, 3.678],
  teaser: [2.944, 11.499, 5.227, 5.076],
};
const LINES = {
  L0: "Calgary's Chinatown was forced to move. Twice.",
  L1: "Today it sits at the foot of the Centre Street Bridge. But it didn't start here.",
  L2: "The first Chinatown grew up just east of the train station, where the City's Municipal Building stands today.",
  L3: "In eighteen ninety-two, a smallpox outbreak fuelled violence. A mob of more than three hundred men smashed the doors and windows of Chinese laundries.",
  L4: "For three weeks, the North West Mounted Police had to protect Chinatown.",
  L5: "In nineteen-oh-one, anti-Chinese sentiment and development pressure prompted a second Chinatown, across the railway tracks on Tenth Avenue Southwest.",
  L6: "Then, in nineteen-ten, the Canadian Northern Railway announced its route into Calgary. Property values soared. Landlords evicted their Chinese tenants, and sold.",
  L7: "So a group of Chinese merchants bought land of their own, at Centre Street and Second Avenue.",
  L8: "Anti-Chinese protesters demanded Chinatown go somewhere else. The merchants won a permit, and built the Canton Block. It still stands.",
  L9: "In the nineteen-sixties, a proposed road would have wiped out half of Chinatown. The community organized, and the plan was defeated.",
  L10: "In nineteen ninety-two, the Chinese Cultural Centre opened, modelled on Beijing's Temple of Heaven.",
  L11: "Pushed out twice. Since nineteen-ten, Chinatown has stayed put.",
  L12: "Have you been to Calgary's Chinatown? Yes or no? Drop your thoughts below.",
  T0: "Calgary's Chinatown was forced to move. Twice.",
  T1: "Anti-Chinese sentiment and development pressure prompted a second Chinatown across the tracks. Then a railway sent property values soaring, and landlords evicted their Chinese tenants.",
  T2: "So Chinese merchants bought land of their own, and built the Canton Block. It still stands.",
  T3: "The full story is on our page. Have you been to Chinatown? Yes or no? Drop your thoughts below.",
};
const ORDER = { wide: ['L0','L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11','L12'],
                short: ['L0','L1','L2','L3','L4','L5','L6','L7','L8','L11','L12'],
                teaser: ['T0','T1','T2','T3'] }[CUT];
const S = M.script(ORDER.map((id, i) => ({ text: LINES[id], dur: DURS[CUT][i], gapAfter: id === 'L6' ? .8 : undefined })),
                   { lead: .3, gap: CUT === 'teaser' ? .35 : .4, tail: .3 });
const sc = S.scenes, IDX = id => ORDER.indexOf(id);

// ---------- places (fixed by the continuity bible) ----------
const P1 = M.geo.lm('Calgary Municipal Building') || [1062, 95, 0];   // first Chinatown (C3)
const P2 = M.geo.xy(51.0425, -114.0656);                             // 10 Avenue & 1 Street SW (C7)
const P3 = M.geo.xy(51.0510, -114.0623);                             // 2 Avenue & Centre Street S (C2, C10)
const BRIDGE = [[655, 860, 0], [648, 1075, 0]];                      // Centre Street Bridge across the Bow (drawn, labelled)
const RAIL = [[-2600, -95, 0], [-600, -110, 0], [1400, -125, 0], [3200, -160, 0]];   // railway, schematic (labelled)
const CNOR = [[-1900, -1500, 0], [-700, -900, 0], [200, -420, 0], [P2[0], P2[1], 0]];  // Canadian Northern route, schematic (labelled)
const ROAD60 = [[-200, 650, 0], [1500, 650, 0]];                      // 1966 parkway between 2nd and 3rd Avenues S, schematic (C14)
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const RED = '#d9534f', GOLD = M.house.gold;
const DUSK = { land: '#2e3138', park: '#2b3a30', water: '#2c5378', building: '#5a6270', road: '#6e675c', motorway: '#8a7a5c', community: '#ffffff' };
const NAVY = { land: '#122848', park: '#17364a', water: '#2f6fa6', building: '#3b5378', road: '#2b4670', motorway: '#3f5f8f', community: '#9fb0c8' };
const NIGHT = { land: '#121821', park: '#16221a', water: '#14304f', building: '#283140', road: '#454a54', motorway: '#6f6044', community: '#9fb0c8' };

let CHINA = null;
window.PRELOAD = async () => { const g = M.geo.get(); CHINA = g && g.communities.items.find(x => x.name === 'CHINATOWN'); };

// ---------- helpers ----------
const base = (sky, colors, o = {}) => { const w = M.world({ sky, fog: o.fog || { near: 3000, far: 26000, max: .55 } });
  M.geo.addBase(w, Object.assign({ buildings: true, colors, windows: '#ffd27a', windowAlpha: sky === 'night' ? .6 : .4 }, o.base || {})); return w; };
const china = (w, a = .35, col = GOLD, sw = 6) => { if (CHINA) CHINA.polys.forEach(poly => w.area(poly, { fill: col, alpha: a, stroke: col, strokeAlpha: 1, sw, order: 4 })); };
const rail = (w, p = 1, o = {}) => { w.line(RAIL, { wm: o.wm || 26, color: o.color || '#e8e2d0', p, order: 6, glow: o.glow || 0, noFog: true, minPx: 3 });
  if (o.label) M.label(w, [-250, -230, 0], 'railway (schematic)', { size: WIDE ? 26 : 30, alpha: o.label }); };
const ghost = (w, p3, t0, t, label) => w.at(p3, (c, sp) => { const k = M.seg(t, t0, t0 + .3, 'outBack'); if (k <= 0) return; const r = 26 * k;
  c.fillStyle = RED; c.beginPath(); c.arc(sp.x, sp.y - 40 * k, r, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 6;
  const x = M.seg(t, t0 + .35, t0 + .55); if (x > 0) { c.beginPath(); c.moveTo(sp.x - 14, sp.y - 54); c.lineTo(sp.x - 14 + 28 * x, sp.y - 54 + 28 * x); c.moveTo(sp.x + 14, sp.y - 54); c.lineTo(sp.x + 14 - 28 * x, sp.y - 54 + 28 * x); c.stroke(); }
  if (label) M.text(c, label, sp.x, sp.y + 10, { size: WIDE ? 28 : 32, weight: 700, align: 'center', stroke: 5, strokeColor: '#06101f', alpha: k }); });
const band = (c, y0, y1, a = .7) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.2, `rgba(7,13,24,${a})`); g.addColorStop(.8, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const stamp = (c, s, t, t0, x = CX, y = L.stampY, size, fade = 1) => { const k = M.seg(t, t0, t0 + .35, 'outBack'); if (k <= 0 || fade <= 0) return; size = size || (WIDE ? 100 : 118);
  c.save(); c.translate(x, y); c.rotate(-.05); const s2 = M.lerp(1.8, 1, k); c.scale(s2, s2); c.globalAlpha = Math.min(1, k * 1.5) * fade;
  c.font = M.font(size, 800); const tw = c.measureText(s).width; M.rr(c, -tw / 2 - 34, -size * .62, tw + 68, size * 1.24, 22); c.fillStyle = 'rgba(7,13,24,.85)'; c.fill(); c.lineWidth = 8; c.strokeStyle = GOLD; c.stroke();
  M.text(c, s, 0, -size * .52, { size, weight: 800, align: 'center' }); c.restore(); };
const src = (c, s) => M.source(c, s, L.src[0], L.src[1] - (WIDE ? 0 : 0), { size: 20, maxW: WIDE ? 1500 : 860 });
const srcMap = (c, s) => { M.source(c, MAPC, L.src[0], L.src[1] - 36, { size: 20 }); if (s) src(c, s); };
const cam = (o) => M.camera(Object.assign({ fov: L.fov }, o), W, H);
// the headline in the thumbnail's design (frame 0 = thumbnail), with a scale punch
function headline(c, t) {
  const k = M.seg(t, 0, .45, 'outBack'), s = M.lerp(1.12, 1, k);
  band(c, WIDE ? 90 : 300, WIDE ? 560 : 1000, .62);
  c.save(); c.translate(CX, L.hookY); c.scale(s, s);
  M.chip(c, "CALGARY'S CHINATOWN", 0, -(WIDE ? 120 : 150), { align: 'center', size: L.kick, bg: '#ffffff', color: '#0b1f3a' });
  M.text(c, 'FORCED OUT.', 0, 0, { size: L.hook, weight: 800, align: 'center' });
  M.text(c, 'TWICE.', 0, L.hook * 1.05, { size: L.hook * 1.25, weight: 800, align: 'center', color: GOLD });
  c.restore();
}
// stylised two-storey Edwardian red-brick commercial façade (schematic; Heritage Calgary: red brick façade, upper-floor bays) (C12)
function canton(c, x, y, w, p) {
  const h = w * .55, k = M.ease.outCubic(M.seg(p, 0, 1)); if (k <= 0) return; c.save(); c.beginPath(); c.rect(x - w / 2 - 20, y - h * k - 40, w + 40, h * k + 40); c.clip();
  c.fillStyle = '#8e3b2c'; c.fillRect(x - w / 2, y - h, w, h);
  c.fillStyle = 'rgba(0,0,0,.12)'; for (let r = 0; r < 26; r++) c.fillRect(x - w / 2, y - h + r * h / 26, w, 2);
  c.fillStyle = '#d8c7a6'; c.fillRect(x - w / 2 - 12, y - h - 18, w + 24, 26); c.fillRect(x - w / 2, y - h * .5, w, 14);
  const n = 6; for (let i = 0; i < n; i++) { const wx = x - w / 2 + (i + .5) * w / n; c.fillStyle = '#ffd88a'; c.fillRect(wx - w / n * .26, y - h * .9, w / n * .52, h * .3); c.fillStyle = '#d8c7a6'; c.fillRect(wx - w / n * .3, y - h * .92, w / n * .6, 8); }
  c.fillStyle = '#1d2a3a'; for (let i = 0; i < 4; i++) { const wx = x - w / 2 + (i + .5) * w / 4; c.fillRect(wx - w / 4 * .38, y - h * .4, w / 4 * .76, h * .4); c.fillStyle = 'rgba(255,214,140,.55)'; c.fillRect(wx - w / 4 * .34, y - h * .37, w / 4 * .68, h * .2); c.fillStyle = '#1d2a3a'; }
  c.restore();
}
// generic pagoda-shaped hall (schematic; CCC: "pagoda-shaped", modelled after the Temple of Heaven) (C17)
function hall(c, x, y, s, p) {
  const k = M.ease.outCubic(M.seg(p, 0, 1)); if (k <= 0) return; c.save(); c.globalAlpha = k; c.translate(x, y + (1 - k) * 60);
  c.fillStyle = '#e9e1cf'; c.fillRect(-s * .55, -s * .18, s * 1.1, s * .18);
  [[.62, .16, .42], [.46, .14, .3], [.3, .12, .18]].forEach(([rw, rh, wh], i) => { const y0 = -s * (.18 + i * .26);
    c.fillStyle = '#b8452f'; c.fillRect(-s * wh, y0 - s * .14, s * wh * 2, s * .14);
    c.fillStyle = '#2f5d8a'; c.beginPath(); c.ellipse(0, y0 - s * .14, s * rw, s * rh * .55, 0, Math.PI, 0); c.fill(); });
  c.fillStyle = GOLD; c.beginPath(); c.arc(0, -s * .97, s * .05, 0, 7); c.fill(); c.restore();
}
const placards = (c, t, t0, t1, y) => { for (let i = 0; i < 5; i++) { const enter = M.seg(t, t0 + i * .08, t0 + .5 + i * .08, 'outCubic'), out = M.seg(t, t1, t1 + .45, 'inCubic');
  const x = M.lerp(-200, 160 + i * (W - 300) / 5, enter) - out * (W + 400), yy = y + (i % 2) * 40; if (enter <= 0) continue;
  c.save(); c.globalAlpha = .9 * (1 - out * .6); c.fillStyle = '#5a4630'; c.fillRect(x - 6, yy, 12, 220); c.fillStyle = '#e9e2d2'; c.fillRect(x - 90, yy - 110, 180, 120); c.restore(); } };

// ---------- scenes by line id ----------
const D = {
  // HOOK (C1): dusk push-in from the Bow toward Chinatown; gold community outline; two earlier sites pop up red and get struck out
  L0: (c, t, d) => {
    const w = base('dusk', DUSK); china(w, .28 + .12 * Math.sin(t * 3)); rail(w, 1, { color: '#a69f8c' });
    ghost(w, P1, .15, t); ghost(w, P2, .45, t); M.pin(w, P3, '', { p: 1, scale: 1.1 }); M.ping(w, P3, t, { r: 140 });
    const p = M.seg(t, 0, d, 'outCubic');
    w.render(c, cam({ pos: [M.lerp(-1500, -700, p), M.lerp(-3600, -2300, p), M.lerp(1500, 900, p)], look: [550, 350, 0] }));
    headline(c, t);
  },
  // WHERE NOW (C2): crane down to the south end of the Centre Street Bridge
  L1: (c, t, d) => {
    const w = base('dusk', DUSK); china(w, .3); w.line(BRIDGE, { wm: 22, color: '#f4efe2', order: 7, noFog: true, minPx: 3 });
    M.label(w, [880, 960, 0], 'Centre Street Bridge', { size: WIDE ? 34 : 40, alpha: M.seg(t, .6, 1) });
    M.label(w, WIDE ? [1700, 1150, 0] : [1050, 1120, 0], 'Bow River', { size: WIDE ? 28 : 34, color: '#bfe0ff', alpha: M.seg(t, .8, 1.2) });
    M.pin(w, P3, 'Chinatown today', { p: M.seg(t, .3, .9, 'linear'), size: WIDE ? 40 : 46, scale: 1.2 }); M.ping(w, P3, t);
    const p = M.seg(t, 0, d, 'inOutCubic');
    w.render(c, cam({ pos: [P3[0] + M.lerp(-900, -500, p), P3[1] - M.lerp(1900, 1100, p), M.lerp(1500, 420, p)], look: [P3[0], P3[1] + 120, 0] }));
    srcMap(c, 'Source: Heritage Inspires YYC · CBC News');
  },
  // WHERE FIRST (C3): dolly south-east to the first Chinatown at today's Municipal Building, railway to its south
  L2: (c, t, d) => {
    const w = base('dusk', DUSK); china(w, .12); rail(w, M.seg(t, 0, 1.2), { label: M.seg(t, 1, 1.5) });
    M.pin(w, P1, 'The first Chinatown', { p: M.seg(t, .4, 1.0, 'linear'), size: WIDE ? 40 : 46, scale: 1.2 }); M.ping(w, P1, t);
    M.label(w, [P1[0] - 380, P1[1] - 200, 0], 'Calgary Municipal Building today', { size: WIDE ? 28 : 32, color: GOLD, alpha: M.seg(t, 1.2, 1.7) });
    const p = M.seg(t, 0, d, 'inOutSine');
    w.render(c, cam({ pos: [M.lerp(P3[0] - 300, P1[0] - 700, p), M.lerp(P3[1] - 1600, P1[1] - 1500, p), M.lerp(700, 560, p)], look: [M.lerp(P3[0], P1[0], p), M.lerp(P3[1], P1[1], p), 0] }));
    M.chip(c, 'THE FIRST CHINATOWN', CX, L.chipY - (WIDE ? 200 : 140), { align: 'center', size: L.chip, alpha: M.seg(t, .2, .5) });
    srcMap(c, 'Source: Lougheed House');
  },
  // 1892 (C4, C5): stamp, laundry storefront whose windows crack, counter slams to 300+
  L3: (c, t, d) => {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#070d18'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const f3 = WIDE ? 1 : 1 - M.seg(t, 2.7, 3.0);
    stamp(c, '1892', t, .05, WIDE ? 560 : CX, WIDE ? L.stampY : 400, undefined, f3);
    M.chip(c, 'SMALLPOX OUTBREAK', WIDE ? 560 : CX, (WIDE ? L.stampY : 400) + (WIDE ? 90 : 110), { align: 'center', size: L.chip, alpha: M.seg(t, .5, .9) * f3 });
    // storefront
    const sx = WIDE ? 560 : CX, sy = WIDE ? 860 : 1225, sw = WIDE ? 520 : 640, sh = sw * .62, push = M.lerp(1, 1.06, M.seg(t, 0, d));
    c.save(); c.translate(sx, sy); c.scale(push, push);
    c.fillStyle = '#5b4a39'; c.fillRect(-sw / 2, -sh, sw, sh); c.fillStyle = '#3e3227'; c.fillRect(-sw / 2 - 20, -sh - 30, sw + 40, 40);
    M.text(c, 'LAUNDRY', 0, -sh - 26, { size: WIDE ? 30 : 34, weight: 800, align: 'center', color: '#e9e2d2', shadow: false });
    const wins = [[-sw * .42, -sh * .78, sw * .32, sh * .5], [sw * .1, -sh * .78, sw * .32, sh * .5]];
    wins.forEach(([x, y, ww, hh], i) => { c.fillStyle = '#2c3d52'; c.fillRect(x, y, ww, hh); c.fillStyle = 'rgba(255,214,140,.25)'; c.fillRect(x + 6, y + 6, ww - 12, hh - 12);
      const cr = M.seg(t, 3.4 + i * .25, 3.7 + i * .25); if (cr > 0) { const r = M.rng(9 + i); c.strokeStyle = '#e8f1ff'; c.lineWidth = 3; const cx0 = x + ww * .45, cy0 = y + hh * .45;
        for (let k = 0; k < 9; k++) { const a = r() * 7, L2 = (ww * .55) * cr * (.5 + r() * .5); c.beginPath(); c.moveTo(cx0, cy0); c.lineTo(cx0 + Math.cos(a) * L2, cy0 + Math.sin(a) * L2 * .8); c.stroke(); } } });
    c.fillStyle = '#2a1f17'; c.fillRect(-sw * .08, -sh * .5, sw * .16, sh * .5);
    const dc = M.seg(t, 3.9, 4.2); if (dc > 0) { c.strokeStyle = '#e8f1ff'; c.lineWidth = 3; c.beginPath(); c.moveTo(-sw * .06, -sh * .45); c.lineTo(sw * .05, -sh * .2 * dc - sh * .2); c.stroke(); }
    c.restore();
    // counter
    const cxp = WIDE ? 1380 : CX, cyp = WIDE ? 420 : 400, cp = M.seg(t, 3.0, 4.3);
    if (cp > 0) { M.text(c, 'MORE THAN', cxp, cyp - (WIDE ? 70 : 80), { size: WIDE ? 48 : 56, weight: 800, align: 'center', color: GOLD, alpha: M.seg(t, 3.0, 3.3) });
      M.counter(c, 300, cp, cxp, cyp, { size: WIDE ? 170 : 180, suffix: cp >= 1 ? '+' : '', slam: true });
      M.text(c, 'MEN IN THE MOB', cxp, cyp + (WIDE ? 190 : 200), { size: WIDE ? 48 : 56, weight: 800, align: 'center', alpha: M.seg(t, 4.2, 4.6) }); }
    src(c, 'Source: SFU Chinese Canadian history · Lougheed House');
  },
  // 3 WEEKS (C6): orbit around the first site, a protective ring closes, a 3-week bar fills
  L4: (c, t, d) => {
    const w = base('dusk', DUSK); rail(w, 1, { color: '#a69f8c' }); M.pin(w, P1, '', { p: 1, scale: 1.1 });
    w.at(P1, (cc, sp) => { const k = M.seg(t, .2, 1.4, 'inOutCubic'); cc.strokeStyle = GOLD; cc.lineWidth = 8; cc.setLineDash([22, 14]); cc.beginPath(); cc.ellipse(sp.x, sp.y, 230 * sp.k * 4 + 60, (230 * sp.k * 4 + 60) * .5, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); cc.stroke(); cc.setLineDash([]); });
    w.render(c, cam(M.moves.orbit(P1, 1100, 520, 250, 25, M.seg(t, 0, d, 'linear'))));
    band(c, WIDE ? 120 : 300, WIDE ? 520 : 820, .7);
    const bx = WIDE ? 560 : 170, bw = WIDE ? 800 : 740, by = WIDE ? 380 : 640, p = M.seg(t, .6, 2.6, 'inOutCubic');
    c.fillStyle = 'rgba(255,255,255,.18)'; M.rr(c, bx, by, bw, 34, 17); c.fill(); c.fillStyle = GOLD; M.rr(c, bx, by, Math.max(34, bw * p), 34, 17); c.fill();
    for (let k = 0; k <= 3; k++) { c.fillStyle = '#fff'; c.fillRect(bx + bw * k / 3 - 2, by + 40, 4, 18); }
    M.text(c, '3 WEEKS', CX, WIDE ? 170 : 380, { size: L.name, weight: 800, align: 'center', alpha: M.seg(t, .2, .5) });
    M.chip(c, 'NORTH WEST MOUNTED POLICE', CX, WIDE ? 450 : 720, { align: 'center', size: WIDE ? 38 : 44, alpha: M.seg(t, 1.2, 1.6) });
    srcMap(c, 'Source: SFU Chinese Canadian history · Lougheed House');
  },
  // 1901 (C7): the railway highlights; the second Chinatown rises on its own south of the tracks (first stays lit)
  L5: (c, t, d) => {
    const w = M.world({ sky: 'blueprint', fog: { near: 9000, far: 40000, max: .4 } }); M.geo.addBase(w, { buildings: true, colors: NAVY, windows: '#ffd27a', windowAlpha: .25 });
    rail(w, 1, { color: GOLD, glow: 4, label: M.seg(t, .2, .6) });
    M.pin(w, P1, 'First', { p: 1, size: WIDE ? 32 : 36, scale: .9 });
    M.pin(w, P2, '10 Avenue SW', { p: M.seg(t, 1.0, 1.6, 'linear'), size: WIDE ? 38 : 44, scale: 1.2 }); M.ping(w, P2, t - 1);
    const p = M.seg(t, 0, d, 'outCubic');
    w.render(c, cam(M.moves.dive([(P1[0] + P2[0]) / 2, (P1[1] + P2[1]) / 2 - 150, 0], p, { h0: 9000, h1: 2300, back0: 1, back1: 1700, ahead: 120 })));
    stamp(c, '1901', t, .4, WIDE ? 420 : CX);
    const cx5 = WIDE ? 1480 : CX, cy5 = WIDE ? 200 : L.chipY;
    M.chip(c, 'ANTI-CHINESE SENTIMENT', cx5, cy5, { align: 'center', size: L.chip, bg: '#ffffff', alpha: M.seg(t, 2.2, 2.6) });
    M.chip(c, 'DEVELOPMENT PRESSURE', cx5, cy5 + L.chip * 1.9, { align: 'center', size: L.chip, bg: '#ffffff', alpha: M.seg(t, 3.0, 3.4) });
    srcMap(c, 'Source: CBC News · Calgary Journal');
  },
  // 1910 (C8, C9): the Canadian Northern route draws toward the second site; a schematic value bar shoots up; both sites go red and fade
  L6: (c, t, d) => {
    const w = M.world({ sky: 'blueprint', fog: { near: 9000, far: 40000, max: .4 } }); M.geo.addBase(w, { buildings: true, colors: NAVY, windows: '#ffd27a', windowAlpha: .25 });
    rail(w, 1, { color: '#9fb0c8' });
    w.line(CNOR, { wm: 30, color: RED, p: M.seg(t, .8, 3.0, 'inOutCubic'), glow: 5, order: 7, noFog: true, minPx: 4 });
    M.label(w, CNOR[2], 'Canadian Northern route (schematic)', { size: WIDE ? 28 : 32, color: '#ffd0cc', alpha: M.seg(t, 2.0, 2.4), dy: -40 });
    const ev = M.seg(t, 7.0, 7.8); [P1, P2].forEach(P => { if (ev < 1) M.pin(w, P, '', { p: 1, scale: 1.1, color: ev > 0 ? RED : GOLD }); else ghost(w, P, 7.8, t); });
    w.render(c, cam(M.moves.orbit([(P1[0] + P2[0]) / 2, -500, 0], 3200, 2600, 255, 12, M.seg(t, 0, d, 'linear'))));
    stamp(c, '1910', t, .1);
    M.chip(c, 'CANADIAN NORTHERN RAILWAY', CX, WIDE ? 290 : L.chipY - 60, { align: 'center', size: WIDE ? 40 : 44, bg: '#ffffff', alpha: M.seg(t, .9, 1.3) });
    // schematic value bar (no number: the sources say only that values soared)
    const bx = WIDE ? 1620 : 860, by = WIDE ? 760 : 1180, bh = (WIDE ? 360 : 420) * M.ease.outExpo(M.seg(t, 4.2, 5.4));
    const bt = WIDE ? 420 : 500; c.fillStyle = 'rgba(7,13,24,.7)'; M.rr(c, bx - 120, by - bt, 240, bt + 90, 18); c.fill();
    c.fillStyle = GOLD; c.fillRect(bx - 50, by - bh, 100, bh); c.fillStyle = '#fff'; c.fillRect(bx - 80, by, 160, 4);
    M.text(c, 'PROPERTY VALUES', bx, by + 14, { size: 26, weight: 800, align: 'center', maxW: 220, alpha: M.seg(t, 4.2, 4.6) });
    M.text(c, 'schematic', bx, by - bt + 10, { size: 20, weight: 500, align: 'center', color: '#9fb0c8' });
    M.chip(c, 'TENANTS EVICTED', CX - (WIDE ? 300 : 60), WIDE ? 760 : 1000, { align: 'center', size: L.chip, bg: RED, color: '#fff', alpha: M.seg(t, 7.0, 7.4) });
    srcMap(c, 'Source: SFU Chinese Canadian history · Calgary Chinese Cultural Centre');
  },
  // THE ANSWER (C10): an arrow travels north to Centre St & 2 Ave; the parcel outline draws on
  L7: (c, t, d) => {
    const w = base('dusk', DUSK); rail(w, 1, { color: '#a69f8c' });
    const mid = [(P2[0] + P3[0]) / 2 - 350, (P2[1] + P3[1]) / 2, 0], arc = [P2, mid, P3], ap = M.seg(t, .2, 2.0, 'inOutCubic');
    w.line(M.spline(arc) ? Array.from({ length: 30 }, (_, i) => M.spline(arc)(i / 29)) : arc, { wm: 26, color: GOLD, p: ap, glow: 5, order: 8, noFog: true, minPx: 4 });
    const s = 45, pc = M.seg(t, 2.0, 2.8); if (pc > 0) w.line([[P3[0] - s, P3[1] - s], [P3[0] + s, P3[1] - s], [P3[0] + s, P3[1] + s], [P3[0] - s, P3[1] + s], [P3[0] - s, P3[1] - s]], { wm: 10, color: '#ffffff', p: pc, order: 9, noFog: true, minPx: 3 });
    M.pin(w, P3, 'Centre St & 2 Ave', { p: M.seg(t, 2.2, 2.8, 'linear'), size: WIDE ? 38 : 44, scale: 1.2 });
    const p = M.seg(t, 0, d, 'inOutSine');
    w.render(c, cam({ pos: [M.lerp(P2[0] - 900, P3[0] - 700, p), M.lerp(P2[1] - 1500, P3[1] - 1300, p), M.lerp(1300, 800, p)], look: [M.lerp(P2[0], P3[0], p), M.lerp(P2[1], P3[1], p), 0] }));
    M.chip(c, 'BOUGHT BY CHINESE MERCHANTS', CX, L.chipY - (WIDE ? 200 : 140), { align: 'center', size: WIDE ? 42 : 46, alpha: M.seg(t, 2.6, 3.0) });
    srcMap(c, 'Source: SFU Chinese Canadian history · City of Calgary');
  },
  // PERMIT + WHAT REMAINS (C11, C12, C13): blank placards sweep in, a PERMIT GRANTED stamp knocks them away, the Canton Block rises
  L8: (c, t, d) => {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#141d3b'); g.addColorStop(.55, '#5b4a6e'); g.addColorStop(.75, '#f0a35e'); g.addColorStop(.76, '#2a2a30'); g.addColorStop(1, '#1d1f24'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const gy = WIDE ? 880 : 1180;
    placards(c, t, .1, 3.0, gy - 330);
    if (t > 3.0) { const cw = WIDE ? 620 : 700, push = M.lerp(1, 1.05, M.seg(t, 3.0, d)); c.save(); c.translate(CX, gy); c.scale(push, push); canton(c, 0, 0, cw, M.seg(t, 3.2, 4.8)); c.restore(); }
    stamp(c, 'PERMIT GRANTED', t, 2.6, CX, WIDE ? 230 : 470, WIDE ? 84 : 92, 1 - M.seg(t, 4.0, 4.4));
    const nameY = WIDE ? 880 : 1230 - 0;
    if (!WIDE) band(c, 1200, 1430, .0);
    M.text(c, 'CANTON BLOCK', CX, WIDE ? 150 : 470, { size: L.name, weight: 800, align: 'center', alpha: M.seg(t, 4.4, 4.8) });
    M.text(c, '200-216 Centre St SE · built 1910-11', CX, WIDE ? 262 : 600, { size: WIDE ? 40 : 44, weight: 600, align: 'center', color: '#ffe3a3', alpha: M.seg(t, 4.8, 5.2) });
    M.chip(c, 'STILL STANDING', CX, WIDE ? 330 : 680, { align: 'center', size: L.chip + 4, alpha: M.seg(t, 6.6, 7.0) });
    M.text(c, 'illustration', WIDE ? W - 60 : W - 150, WIDE ? 860 : 1200, { size: 20, weight: 500, align: 'right', color: '#c9d3e0' });
    src(c, 'Source: City of Calgary · Heritage Calgary');
  },
  // THREAT AVERTED (C14, C15): a red road ribbon slices along 2nd-3rd Avenue; the south half greys; struck through: DEFEATED
  L9: (c, t, d) => {
    const w = M.world({ sky: 'blueprint', fog: { near: 9000, far: 40000, max: .4 } }); M.geo.addBase(w, { buildings: true, colors: NAVY, windows: '#ffd27a', windowAlpha: .25 });
    china(w, .35); const gr = M.seg(t, 1.6, 2.4) * (1 - M.seg(t, 5.2, 6.0));
    if (CHINA && gr > 0) CHINA.polys.forEach(poly => w.area(poly.map(r => r.map(q => [q[0], Math.min(q[1], 650)])), { fill: '#6b7280', alpha: .7 * gr, order: 5 }));
    w.line(ROAD60, { wm: 60, color: RED, p: M.seg(t, .6, 1.8, 'inOutCubic'), glow: 6, order: 7, noFog: true, minPx: 5 });
    M.label(w, [1350, 760, 0], 'proposed road (schematic)', { size: WIDE ? 28 : 32, color: '#ffd0cc', alpha: M.seg(t, 1.2, 1.6) });
    w.render(c, cam(M.moves.dive([650, 650, 0], M.seg(t, 0, d, 'outCubic'), { h0: 6000, h1: 2600, back0: 1, back1: 1600, ahead: 80 })));
    stamp(c, '1960s', t, .1);
    M.text(c, 'HALF OF CHINATOWN', CX, WIDE ? 300 : 500, { size: WIDE ? 70 : 78, weight: 800, align: 'center', alpha: M.seg(t, 1.8, 2.2) * (1 - M.seg(t, 5.0, 5.3)) });
    const st = M.seg(t, 5.0, 5.4, 'outBack'); if (st > 0) stamp(c, 'DEFEATED', t, 5.0, CX, WIDE ? 330 : 520, WIDE ? 96 : 104);
    M.chip(c, 'SIEN LOK SOCIETY', CX, WIDE ? 430 : 640, { align: 'center', size: L.chip, bg: '#ffffff', alpha: M.seg(t, 5.6, 6.0) });
    srcMap(c, 'Source: SFU Chinese Canadian history · Heritage Calgary');
  },
  // 1992 (C16, C17): a generic pagoda-shaped hall rises, labelled
  L10: (c, t, d) => {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0f2347'); g.addColorStop(.62, '#e0a46a'); g.addColorStop(.63, '#2a2a30'); g.addColorStop(1, '#1b1d22'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const s = WIDE ? 560 : 680, sc2 = M.lerp(.92, 1.04, M.seg(t, 0, d, 'inOutSine'));
    c.save(); c.translate(WIDE ? 1320 : CX, (WIDE ? 690 : 1210)); c.scale(sc2, sc2); hall(c, 0, 0, s, M.seg(t, .3, 1.6)); c.restore();
    stamp(c, '1992', t, .1, WIDE ? 520 : CX, WIDE ? 220 : 360);
    M.text(c, 'Calgary Chinese Cultural Centre', WIDE ? 520 : CX, WIDE ? 360 : 470, { size: WIDE ? 56 : 62, weight: 800, align: 'center', maxW: WIDE ? 760 : 860, alpha: M.seg(t, 1.0, 1.4) });
    M.text(c, "modelled on Beijing's Temple of Heaven", WIDE ? 520 : CX, WIDE ? 520 : 630, { size: WIDE ? 40 : 46, weight: 600, align: 'center', color: '#ffe3a3', maxW: WIDE ? 760 : 860, alpha: M.seg(t, 2.6, 3.0) });
    M.text(c, 'illustration', WIDE ? W - 60 : W - 150, WIDE ? 1000 : 1240, { size: 20, weight: 500, align: 'right', color: '#c9d3e0' });
    src(c, 'Source: Alberta Views · Calgary Chinese Cultural Centre');
  },
  // MEANING (C1, C18): night drone over Chinatown; three-pin timeline, the first two struck out, the third anchored
  L11: (c, t, d) => {
    const w = base('night', NIGHT); china(w, .3); w.line(BRIDGE, { wm: 22, color: '#ffe3a3', order: 7, noFog: true, minPx: 3 }); M.ping(w, P3, t, { r: 160 });
    w.render(c, cam(M.moves.orbit(P3, 1300, 620, 230, 30, M.seg(t, 0, d, 'linear'))));
    band(c, WIDE ? 600 : 1000, WIDE ? 900 : 1250, .75);
    const y = WIDE ? 740 : 1110, xs = WIDE ? [560, 960, 1360] : [210, 480, 750], names = ['FIRST', 'SECOND', 'SINCE 1910'];
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 5; c.beginPath(); c.moveTo(xs[0], y); c.lineTo(xs[2], y); c.stroke();
    xs.forEach((x, i) => { const k = M.seg(t, .2 + i * .35, .5 + i * .35, 'outBack'); if (k <= 0) return; const gold = i === 2;
      c.fillStyle = gold ? GOLD : '#6b7280'; c.beginPath(); c.arc(x, y, (gold ? 26 : 18) * k, 0, 7); c.fill();
      if (!gold) { const x2 = M.seg(t, .6 + i * .35, .8 + i * .35); c.strokeStyle = RED; c.lineWidth = 6; c.beginPath(); c.moveTo(x - 18, y - 18); c.lineTo(x - 18 + 36 * x2, y - 18 + 36 * x2); c.stroke(); }
      M.text(c, names[i], x, y + 36, { size: gold ? (WIDE ? 50 : 54) : (WIDE ? 34 : 38), weight: 800, align: 'center', color: gold ? GOLD : '#c9d3e0', alpha: k }); });
    M.text(c, 'STAYED PUT', CX, WIDE ? 230 : 440, { size: L.name, weight: 800, align: 'center', alpha: M.seg(t, 1.6, 2.0) });
    srcMap(c, 'Source: Heritage Calgary · Alberta Views');
  },
  L12: (c, t, d) => { c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
    M.closer(c, "Have you been to Calgary's Chinatown? Yes or no?", M.seg(t, 0, d, 'linear'), W, H, { highlight: ['yes', 'no?'] }); },
  // TEASER (subset of audited claims)
  T0: (c, t, d) => D.L0(c, t, d),
  T1: (c, t, d) => {   // C7 then C8/C9: second site rises south of the tracks; then the value bar and the evictions
    const w = M.world({ sky: 'blueprint', fog: { near: 9000, far: 40000, max: .4 } }); M.geo.addBase(w, { buildings: true, colors: NAVY, windows: '#ffd27a', windowAlpha: .25 });
    rail(w, 1, { color: GOLD, glow: 3, label: M.seg(t, .2, .6) }); const ev = M.seg(t, 9.2, 9.8);
    if (ev < 1) M.pin(w, P2, ev > 0 ? '' : 'Second Chinatown', { p: M.seg(t, .6, 1.2, 'linear'), size: 44, scale: 1.2, color: ev > 0 ? RED : GOLD }); else ghost(w, P2, 9.8, t);
    w.line(CNOR, { wm: 30, color: RED, p: M.seg(t, 5.0, 6.6, 'inOutCubic'), glow: 5, order: 7, noFog: true, minPx: 4 });
    w.render(c, cam(M.moves.dive([P2[0] - 300, P2[1] - 300, 0], M.seg(t, 0, d, 'outCubic'), { h0: 9000, h1: 2600, back0: 1, back1: 1900, ahead: 100 })));
    M.chip(c, 'ANTI-CHINESE SENTIMENT', CX, 380, { align: 'center', size: 50, bg: '#ffffff', alpha: M.seg(t, 1.4, 1.8) * (1 - M.seg(t, 4.6, 4.9)) });
    M.chip(c, 'DEVELOPMENT PRESSURE', CX, 475, { align: 'center', size: 50, bg: '#ffffff', alpha: M.seg(t, 2.4, 2.8) * (1 - M.seg(t, 4.6, 4.9)) });
    const bh = 380 * M.ease.outExpo(M.seg(t, 6.8, 8.0)), bx = 860, by = 1180;
    if (t > 6.6) { c.fillStyle = 'rgba(7,13,24,.7)'; M.rr(c, bx - 120, by - 460, 240, 520, 18); c.fill(); c.fillStyle = GOLD; c.fillRect(bx - 50, by - bh, 100, bh); c.fillStyle = '#fff'; c.fillRect(bx - 80, by, 160, 4);
      M.text(c, 'PROPERTY VALUES', bx, by + 14, { size: 26, weight: 800, align: 'center', maxW: 220 }); M.text(c, 'schematic', bx, by - 450, { size: 20, weight: 500, align: 'center', color: '#9fb0c8' }); }
    M.chip(c, 'TENANTS EVICTED', CX - 80, 1000, { align: 'center', size: 50, bg: RED, color: '#fff', alpha: M.seg(t, 9.2, 9.6) });
    srcMap(c, 'Source: CBC News · Calgary Chinese Cultural Centre');
  },
  T2: (c, t, d) => {   // C10, C11, C13
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#141d3b'); g.addColorStop(.55, '#5b4a6e'); g.addColorStop(.75, '#f0a35e'); g.addColorStop(.76, '#2a2a30'); g.addColorStop(1, '#1d1f24'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const push = M.lerp(1, 1.05, M.seg(t, 0, d)); c.save(); c.translate(CX, 1180); c.scale(push, push); canton(c, 0, 0, 700, M.seg(t, .2, 1.6)); c.restore();
    M.text(c, 'CANTON BLOCK', CX, 470, { size: 112, weight: 800, align: 'center', alpha: M.seg(t, 2.0, 2.4) });
    M.chip(c, 'STILL STANDING', CX, 620, { align: 'center', size: 54, alpha: M.seg(t, 3.6, 4.0) });
    M.text(c, 'illustration', W - 150, 1200, { size: 20, weight: 500, align: 'right', color: '#c9d3e0' });
    src(c, 'Source: City of Calgary · Heritage Calgary');
  },
  T3: (c, t, d) => { c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
    const a = 1 - M.seg(t, 1.5, 1.8);
    if (a > 0) { M.text(c, '▶ FULL VIDEO', CX, 640, { size: 112, weight: 800, align: 'center', alpha: a * M.seg(t, 0, .25) });
      M.text(c, 'on our page · calgaryinsight.ca', CX, 790, { size: 54, weight: 700, align: 'center', color: GOLD, alpha: a * M.seg(t, .2, .45) }); }
    if (t > 1.6) { M.closer(c, 'Have you been to Chinatown? Yes or no?', M.seg(t, 1.6, d, 'linear'), W, H, { highlight: ['yes', 'no?'] });
      M.text(c, '▶ Full video on our page', CX, 1370, { size: 38, weight: 700, align: 'center', color: '#ffffff', alpha: M.seg(t, 2.4, 2.8) }); }
  },
};
const TRANS = { L0: { kind: 'match', dur: .5 }, L1: { kind: 'whip', dur: .35 }, L2: { kind: 'flash', dur: .3 }, L3: { kind: 'dissolve', dur: .5 }, L4: { kind: 'push', dur: .4 },
  L5: { kind: 'push', dur: .35 }, L6: { kind: 'dissolve', dur: .5 }, L7: { kind: 'wipe', dur: .45 }, L8: { kind: CUT === 'wide' ? 'push' : 'dissolve', dur: .5 }, L9: { kind: 'dissolve', dur: .6 },
  L10: { kind: 'dissolve', dur: .6 }, L11: { kind: 'dissolve', dur: .5 }, T0: { kind: 'whip', dur: .35 }, T1: { kind: 'wipe', dur: .45 }, T2: { kind: 'dissolve', dur: .5 } };
const LETTER = new Set(['L1', 'L11']);

window.BUILD = () => { window.CUES = CUESFN(); return M.film({ W, H, identity: 'storyteller', scenes: ORDER.map((id, i) => ({ dur: sc[i].sceneDur, trans: TRANS[id], draw: (c, t) => D[id](c, t, sc[i].sceneDur) })),
  letterbox: t => { if (!WIDE) return 0; const i = ORDER.findIndex((id, k) => t >= sc[k].sceneStart && t < sc[k].sceneEnd); return LETTER.has(ORDER[i]) ? Math.min(M.seg(t, sc[i].sceneStart, sc[i].sceneStart + .6), 1 - M.seg(t, sc[i].sceneEnd - .6, sc[i].sceneEnd)) : 0; },
  overlay: (c, t, info) => {
    const last = info.index === ORDER.length - 1;
    if (THUMB) { if (window.LOGO) { const s = WIDE ? 84 : 84; c.drawImage(window.LOGO, WIDE ? 40 : 60, WIDE ? H - s - 36 : 1490, s, s); M.text(c, 'Calgary Insight', (WIDE ? 40 : 60) + s + 16, (WIDE ? H - s - 36 : 1490) + s / 2, { size: 36, base: 'middle', weight: 700 }); } return; }
    if (t > 3 && !last) M.header(c, window.LOGO, W, H, { topic: WIDE ? 'Calgary stories' : undefined });
    if (!last) M.caption(c, S.captionAt(t), W, H, WIDE ? {} : { bottom: 1410 });
    if (CUT !== 'teaser') { const mid = S.total / 2; M.followPill(c, M.seg(t, mid - 1, mid + 1, 'linear'), W, H); }
  } }); };

const CUESFN = () => { const s = i => sc[i].sceneStart, cues = [{ t: 0, sfx: 'impact', gain: -5 }, { t: .15, sfx: 'pop', gain: -12 }, { t: .45, sfx: 'pop', gain: -12 }, { t: .55, sfx: 'thud', gain: -12 }, { t: 0, sfx: 'wind', dur: sc[0].sceneEnd + 3, gain: -24 }];
  ORDER.forEach((id, i) => { if (i === 0) return; const k = TRANS[ORDER[i - 1]] && TRANS[ORDER[i - 1]].kind; cues.push({ t: Math.max(0, s(i) - .2), sfx: k === 'flash' ? 'impact' : (k === 'dissolve' || k === 'match' ? 'whoosh_rev' : 'whoosh'), gain: k === 'dissolve' ? -16 : -11 });
    const at = (x, sfx, g, o = {}) => cues.push(Object.assign({ t: s(i) + x, sfx, gain: g }, o));
    if (id === 'L1') at(.5, 'pop', -11);
    if (id === 'L2') { at(.5, 'pop', -11); at(1.2, 'ping', -15); }
    if (id === 'L3') { at(.05, 'stamp', -7); at(3.0, 'ticks', -15, { dur: 1.2 }); at(3.4, 'glitch', -14); at(4.2, 'impact', -8); }
    if (id === 'L4') { at(.6, 'ticks', -17, { dur: 2.0 }); }
    if (id === 'L5') { at(.4, 'stamp', -8); at(1.0, 'pop', -10); }
    if (id === 'L6') { at(.1, 'stamp', -8); at(.8, 'riser', -14, { dur: 2.2 }); at(4.2, 'whoosh', -12); at(7.0, 'thud', -9); }
    if (id === 'L7') { at(.2, 'swell', -13, { dur: 2 }); at(2.2, 'pop', -10); }
    if (id === 'L8') { at(.1, 'crowd_murmur', -22, { dur: 2.8 }); at(2.6, 'stamp', -6); at(3.2, 'swell', -13, { dur: 2 }); at(6.6, 'ping', -12); }
    if (id === 'L9') { at(.1, 'stamp', -8); at(.6, 'riser', -15, { dur: 1.2 }); at(5.0, 'stamp', -6); }
    if (id === 'L10') { at(.1, 'stamp', -8); at(.3, 'swell', -14, { dur: 2 }); }
    if (id === 'L11') { at(0, 'city', -24, { dur: sc[i].sceneDur }); at(1.6, 'ping', -14); }
    if (id === 'T1') { at(.6, 'pop', -10); at(5.0, 'riser', -14, { dur: 1.6 }); at(9.2, 'thud', -9); }
    if (id === 'T2') { at(.2, 'swell', -13, { dur: 2 }); at(3.6, 'ping', -12); }
  });
  return cues; };
window.TOTAL = () => S.total;
