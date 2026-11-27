/* 2026-11-27 CIVIC · "Calgary's water restrictions could lift next week" · 1080x1920 vertical.
 * Lead identity: Civic Analyst (underground cutaways, project stage row, document/quote card, evidence chips);
 * borrows a Storyteller map push-in over the real city boundary (S0) and Data Explainer week strip + countdown slam (S4, S6).
 * Facts: claims 1-9 of packages/2026-11-27-CIVIC-feeder-main-connected.md (fact audit APPROVED before narration).
 * Pipes and soil layers are illustrations (labelled); no pipe route is drawn on the map.
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DUR = (window.PARAMS && window.PARAMS.dur ? String(window.PARAMS.dur).split(',').map(Number) : null) || [2.56, 5.909, 4.843, 4.608, 4.416, 4.203, 4.437, 3.067];
const TEXT = [
  'Your water restrictions could be lifted next week.',
  "On Thursday, the City said Calgary's new Bearspaw South feeder main is connected to the water system.",
  'It still has to be tested and cleaned, and the City expects it running later in December.',
  'First, the City plans to refill the old pipe from Friday, then test the water.',
  'If all goes as planned, the City expects to lift restrictions later next week.',
  "Until the new pipe is in service, the City says there's still a risk of a break.",
  'For now: no outdoor water use, and the City asks for three-minute showers.',
  'Changed your habits? Drop your thoughts below.',
];
const TAIL = (window.PARAMS && window.PARAMS.tail) ? Number(window.PARAMS.tail) : 0.9;
const S = M.script(TEXT.map((text, i) => ({ text, dur: DUR[i] })), { lead: .3, gap: .4, tail: TAIL });
const sc = S.scenes;
window.TOTAL = S.total;
const GOLD = '#f2b632', BLUE = '#4aa8ff', STEEL = '#8fb8de', GREY = '#8a96a6';
const MAPSRC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const SRC = 'Source: City of Calgary, Stage 4 water restrictions, Nov 26, 2026';
const TOWER = M.geo.lm('Calgary Tower') || [0, 0, 0];
const pop = (t, a, b = a + .35) => M.seg(t, a, b, 'outBack');
const navyCard = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#06101f'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const band = (c, y0, y1, a = .72) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.15, `rgba(7,13,24,${a})`); g.addColorStop(.85, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };

// the real Calgary map: whole city inside its boundary washed water-blue (Stage 4 is city-wide)
const cityMap = (c, t, h, back, wash) => {
  const w = M.world({ sky: 'blueprint', fog: false });
  const land = M.blend ? M.blend('#123a66', '#1f6fb8', wash) : '#1a5a96';
  M.geo.addBase(w, { buildings: false, boundaryStroke: true, colors: { land, park: '#1d4a5e', water: '#7cd0ff', road: '#5d86b3', motorway: '#9cc3ea', boundary: '#cfe8ff' }, lineAlpha: .5 });
  const cam = M.camera({ pos: [TOWER[0], TOWER[1] - back, h], look: TOWER, fov: 50 }, W, H); w.render(c, cam);
};

// underground cutaway with pipes: new (steel-blue, glowing joint) and/or old (grey, filling with water to `fill`)
const pipeScene = (c, t, o) => {
  const w = M.world({ sky: 'night', fog: false, ground: '#33413a' }); const p = M.seg(t, .1, 1.2);
  M.cutaway(w, [-30, 0, 30, 25], p, { labels: false, layers: [{ d: 1, c: '#4a3b2b' }, { d: 2.5, c: '#6b553c' }, { d: 3.5, c: '#83704f' }] });
  if (o.old) { w.tube([[-30, -.8, -3.6], [30, -.8, -3.6]], .75, { color: GREY });
    if (o.fill > 0) w.tube([[-30, -1.0, -3.6], [M.lerp(-30, 30, o.fill), -1.0, -3.6]], .62, { color: BLUE }); }
  if (o.neu) { w.tube([[-30, -.8, -3.6], [30, -.8, -3.6]], .75, { color: STEEL });
    const pulse = .5 + .5 * Math.sin(t * 6);
    w.at([4, -1.2, -3.6], (x, s) => { if (!s) return; x.save(); x.globalAlpha = M.seg(t, 1.2, 1.6) * (.55 + .45 * pulse); x.strokeStyle = GOLD; x.lineWidth = 10; x.beginPath(); x.ellipse(s.x, s.y, 26 + 10 * pulse, 70 + 18 * pulse, 0, 0, 7); x.stroke(); x.restore(); }); }
  const cam = M.camera({ pos: [-12, M.lerp(-46, -30, p), M.lerp(12, 3, p)], look: [0, 0, -3.2], fov: 50 }, W, H); w.render(c, cam);
  band(c, 230, 760, .78);
};

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

// 3-stage process row (only the reached stage is lit)
const row = (c, t, names, lit, y) => {
  const x = 90, w = W - 300, step = w / names.length, p = M.seg(t, .2, 1.2);
  c.save(); c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 6; c.beginPath(); c.moveTo(x + step / 2, y); c.lineTo(x + w - step / 2, y); c.stroke();
  c.strokeStyle = GOLD; c.beginPath(); c.moveTo(x + step / 2, y); c.lineTo(x + step / 2 + step * .45 * p, y); c.stroke(); c.restore();
  names.forEach((n, i) => { const on = i < lit, cx = x + step * (i + .5), a = M.seg(t, .2 + i * .25, .5 + i * .25);
    c.save(); c.globalAlpha = a; c.fillStyle = on ? GOLD : '#0e1726'; c.strokeStyle = on ? GOLD : 'rgba(255,255,255,.5)'; c.lineWidth = 5; c.beginPath(); c.arc(cx, y, on ? 32 : 24, 0, 7); c.fill(); c.stroke(); c.restore();
    M.text(c, n, cx, y + 56, { size: 40, weight: on ? 800 : 600, align: 'center', color: on ? '#ffffff' : '#9fb0c8', maxW: step - 6, alpha: a }); });
  return x + step * (names.length - .5);
};

window.BUILD = () => M.film({ W, H, identity: 'civic', scenes: [
  // S0 HOOK: frame 0 the real map is already pushing in; city washes water-blue; hook words on screen at frame 0
  { dur: sc[0].sceneDur, trans: { kind: 'dissolve', dur: .4 }, draw: (c, t) => {
      const u = M.seg(t, 0, sc[0].sceneDur, 'outCubic');
      cityMap(c, t, M.lerp(52000, 30000, u), M.lerp(10, 9000, u), M.seg(t, 0, 1.4, 'inOutCubic'));
      band(c, 250, 1120, .66);
      M.kinetic(c, 'WATER RULES', t, CX, 300, { t0: -.12, size: 130, every: .08, maxW: 880 });
      M.kinetic(c, 'COULD LIFT NEXT WEEK', t, CX, 520, { t0: .15, size: 104, every: .08, maxW: 900, color: GOLD });
      const k = pop(t, 1.1); if (k > 0) M.chip(c, 'Stage 4 · city-wide since Nov 4', CX, 1000, { align: 'center', size: 50, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k) });
      M.source(c, MAPSRC, 60, 1460, { size: 20 });
  } },
  // S1 CONNECTED: cutaway, new steel pipe, gold joint pulse
  { dur: sc[1].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      pipeScene(c, t, { neu: true });
      M.kinetic(c, 'NEW BEARSPAW SOUTH FEEDER MAIN', t, CX, 280, { size: 76, every: .06, maxW: 900, highlight: ['new'] });
      const k = pop(t, 1.6); if (k > 0) M.chip(c, 'CONNECTED · Thu Nov 26', CX, 560, { align: 'center', size: 58, bg: GOLD, color: '#0b1f3a', alpha: Math.min(1, k) });
      M.evidence(c, 'fact', CX, 665, { align: 'center', size: 30, alpha: M.seg(t, 2.0, 2.4) });
      M.text(c, 'illustration', 60, 1400, { size: 26, weight: 600, color: '#cfd8e3', alpha: .8 });
      M.source(c, SRC, 60, 1460, { size: 20 });
  } },
  // S2 BEFORE IT RUNS: stage row, only CONNECTED lit; projection chip on IN SERVICE
  { dur: sc[2].sceneDur, trans: { kind: 'wipe', dur: .45 }, draw: (c, t) => {
      navyCard(c);
      M.kinetic(c, 'BEFORE IT RUNS', t, CX, 300, { size: 110, every: .07, maxW: 900 });
      const xl = row(c, t, ['CONNECTED', 'TESTED & CLEANED', 'IN SERVICE'], 1, 720);
      const k = pop(t, 2.4); if (k > 0) M.chip(c, 'City expects: later in December', CX, 960, { align: 'center', size: 54, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k) });
      M.evidence(c, 'projection', CX, 1070, { align: 'center', size: 30, alpha: M.seg(t, 2.8, 3.2) });
      M.source(c, SRC, 60, 1460, { size: 20 });
  } },
  // S3 THE OLD PIPE FIRST: grey pipe fills with water left to right
  { dur: sc[3].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      pipeScene(c, t, { old: true, fill: M.seg(t, .9, sc[3].sceneDur - .4, 'inOutCubic') });
      M.kinetic(c, 'FIRST: THE OLD PIPE', t, CX, 280, { size: 100, every: .07, maxW: 900, highlight: ['old'] });
      const k = pop(t, 1.0); if (k > 0) M.chip(c, 'Refill expected from Fri Nov 27', CX, 560, { align: 'center', size: 58, bg: BLUE, color: '#06101f', alpha: Math.min(1, k) });
      M.text(c, 'then water-quality tests', CX, 660, { size: 54, weight: 700, align: 'center', color: '#ffffff', alpha: M.seg(t, 2.4, 2.8) });
      M.text(c, 'illustration', 60, 1400, { size: 26, weight: 600, color: '#cfd8e3', alpha: .8 });
      M.source(c, SRC, 60, 1460, { size: 20 });
  } },
  // S4 COULD LIFT: week strip, next week lights gold, conditional chip
  { dur: sc[4].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      navyCard(c);
      M.kinetic(c, 'IF ALL GOES AS PLANNED', t, CX, 400, { size: 96, every: .06, maxW: 900 });
      const a1 = M.seg(t, .3, .7, 'outCubic'), a2 = M.seg(t, 1.2, 1.7, 'outCubic');
      c.save(); c.globalAlpha = a1; M.rr(c, 90, 700, 390, 330, 24); c.fillStyle = '#13294a'; c.fill(); c.restore();
      M.text(c, 'STARTING FRIDAY', 285, 750, { size: 54, weight: 800, align: 'center', color: '#ffffff', alpha: a1 });
      M.text(c, 'refill, then tests', 285, 860, { size: 42, weight: 600, align: 'center', color: '#9fb0c8', maxW: 340, alpha: a1 });
      c.save(); c.globalAlpha = a2; c.translate(0, (1 - a2) * 60); M.rr(c, 520, 700, 390, 330, 24); c.fillStyle = GOLD; c.fill();
      M.text(c, 'NEXT WEEK', 715, 750, { size: 54, weight: 800, align: 'center', color: '#0b1f3a', shadow: false });
      M.text(c, 'restrictions could lift', 715, 850, { size: 46, weight: 800, align: 'center', color: '#0b1f3a', shadow: false, maxW: 340 }); c.restore();
      M.evidence(c, 'projection', CX, 1080, { align: 'center', size: 32, alpha: M.seg(t, 2.0, 2.4) });
      M.text(c, 'the City expects', CX, 1150, { size: 48, weight: 700, align: 'center', color: '#dfe7f2', alpha: M.seg(t, 2.2, 2.6) });
      M.source(c, SRC, 60, 1460, { size: 20 });
  } },
  // S5 STILL A RISK: City quote card over the old pipe with a faint pulsing crack
  { dur: sc[5].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      navyCard(c);
      c.save(); c.globalAlpha = .55; c.strokeStyle = GREY; c.lineWidth = 120; c.lineCap = 'round'; c.beginPath(); c.moveTo(-40, 1110); c.lineTo(W + 40, 1110); c.stroke(); c.restore();
      const pl = .5 + .5 * Math.sin(t * 7); c.save(); c.globalAlpha = .4 + .5 * pl; c.strokeStyle = '#ff6b5a'; c.lineWidth = 6; c.beginPath(); c.moveTo(500, 1052); c.lineTo(530, 1090); c.lineTo(505, 1122); c.lineTo(540, 1166); c.stroke(); c.restore();
      M.kinetic(c, 'UNTIL THE NEW PIPE IS IN SERVICE', t, CX, 270, { size: 74, every: .05, maxW: 900 });
      const p1 = M.seg(t, .5, 3.6, 'linear');
      c.save(); c.translate((1 - M.ease.outCubic(M.seg(t, .5, 1.0))) * -500, 0); quoteCard(c, 70, 560, 820, 430, 'City of Calgary', 'Stage 4 water restrictions page', "there's still a risk of a break", p1, 76); c.restore();
      M.source(c, SRC, 60, 1460, { size: 20 });
  } },
  // S6 FOR NOW: two rule tiles; shower timer counts down from 3:00
  { dur: sc[6].sceneDur, trans: { kind: 'dissolve', dur: .4 }, draw: (c, t) => {
      navyCard(c);
      M.text(c, 'FOR NOW', CX, 280, { size: 110, weight: 800, align: 'center', color: GOLD });
      const k1 = pop(t, .3), k2 = pop(t, 1.3);
      if (k1 > 0) { const a = Math.min(1, k1); c.save(); c.globalAlpha = a; M.rr(c, 90, 520, 820, 300, 26); c.fillStyle = '#13294a'; c.fill();
        c.strokeStyle = BLUE; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(150, 640); c.lineTo(250, 640); c.lineTo(250, 700); c.stroke();
        c.strokeStyle = '#ff6b5a'; c.lineWidth = 12; c.beginPath(); c.moveTo(140, 590); c.lineTo(290, 760); c.moveTo(290, 590); c.lineTo(140, 760); c.stroke(); c.restore();
        M.text(c, 'No outdoor water use', 330, 615, { size: 62, weight: 800, color: '#ffffff', maxW: 560, alpha: a }); }
      if (k2 > 0) { const a = Math.min(1, k2); c.save(); c.globalAlpha = a; M.rr(c, 90, 870, 820, 360, 26); c.fillStyle = '#13294a'; c.fill(); c.restore();
        const secs = Math.max(0, Math.round(180 * (1 - M.seg(t, 1.6, sc[6].sceneDur, 'linear')))); const lab = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
        M.text(c, lab, 300, 925, { size: 150, weight: 800, align: 'center', color: BLUE, alpha: a });
        M.text(c, 'City asks:', 640, 930, { size: 50, weight: 700, align: 'center', color: '#9fb0c8', maxW: 480, alpha: a });
        M.text(c, 'three-minute showers', 640, 1000, { size: 60, weight: 800, align: 'center', color: '#ffffff', maxW: 480, alpha: a });
        }
      M.source(c, SRC, 60, 1460, { size: 20 });
  } },
  // S7 CLOSER: one-word question, no end card
  { dur: sc[7].sceneDur, draw: (c, t) => { navyCard(c); M.closer(c, 'Did the restrictions change your water habits?', M.seg(t, 0, sc[7].sceneDur, 'linear'), W, H, { highlight: ['change'] }); } },
], overlay: (c, t, info) => {
  if (t > 3 && info.index < 7) M.header(c, window.LOGO, W, H);
  if (info.index < 7) M.caption(c, S.captionAt(t), W, H);
  const mid = sc[4].sceneStart + .3; M.followPill(c, (t - mid) / 2, W, H);
} });

window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.4, sfx: 'ping', gain: -12 }, { t: 1.1, sfx: 'click', gain: -14 },
  { t: sc[1].sceneStart - .2, sfx: 'whoosh', gain: -14 }, { t: sc[1].sceneStart + 1.2, sfx: 'ping', gain: -13 }, { t: sc[1].sceneStart + 1.6, sfx: 'stamp', gain: -13 },
  { t: sc[2].sceneStart - .2, sfx: 'whoosh', gain: -13 }, { t: sc[2].sceneStart + .2, sfx: 'click', gain: -13 }, { t: sc[2].sceneStart + .45, sfx: 'click', gain: -14 }, { t: sc[2].sceneStart + .7, sfx: 'click', gain: -14 }, { t: sc[2].sceneStart + 2.4, sfx: 'pop', gain: -12 },
  { t: sc[3].sceneStart + .9, sfx: 'whoosh', dur: 1.2, gain: -16 }, { t: sc[3].sceneStart + 1.0, sfx: 'pop', gain: -12 },
  { t: sc[4].sceneStart + .3, sfx: 'click', gain: -13 }, { t: sc[4].sceneStart + 1.2, sfx: 'pop', gain: -11 },
  { t: sc[5].sceneStart + .5, sfx: 'shutter', gain: -14 },
  { t: sc[6].sceneStart + .3, sfx: 'pop', gain: -12 }, { t: sc[6].sceneStart + 1.3, sfx: 'pop', gain: -12 }, { t: sc[6].sceneStart + 1.6, sfx: 'ticks', dur: 1.8, gain: -17 },
  { t: sc[7].sceneStart - .1, sfx: 'whoosh', gain: -14 },
];
