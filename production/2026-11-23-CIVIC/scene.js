/* 2026-11-23 CIVIC · "Cavalry FC made league history in Calgary: what happened" · 1080x1920 vertical.
 * Lead identity: Civic Analyst (evidence chips, match timeline, qualification card); borrows a Storyteller snowy floodlit
 * pitch push-in (S0-S1) and Data Explainer counter slams (S1, S3, S5, S6).
 * Facts: claims 1-7 of packages/2026-11-23-CIVIC-cavalry-fc-cpl-double.md (audit APPROVED, round 1).
 * No map: the venue's exact location was not verified this run, so the pitch is stylised (no geography claimed).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DUR = (window.PARAMS && window.PARAMS.dur ? String(window.PARAMS.dur).split(',').map(Number) : null) || [4.011, 7.019, 5.504, 2.816, 3.691, 4.139, 9.168, 3.28];
const TEXT = [
  "Calgary's soccer club just did something no club in its league had ever done.",
  'On Saturday at Spruce Meadows, Cavalry beat Atletico Ottawa, three to two, in the Canadian Premier League final.',
  'Tobias Warschewski scored twice, in a minus eleven wind chill, in front of a full house.',
  'Cavalry had already finished first in the regular season.',
  "Now it's the first club in the league's eight-year history to win both.",
  "It was Cavalry's fourth straight final, and its second title in three years.",
  'What happens next? Cavalry has already qualified for the twenty twenty-seven Concacaf Champions Cup, facing top clubs from across the region.',
  'Did you watch the final? Drop your thoughts below.',
];
const TAIL = (window.PARAMS && window.PARAMS.tail) ? Number(window.PARAMS.tail) : .7;
const S = M.script(TEXT.map((text, i) => ({ text, dur: DUR[i] })), { lead: .3, gap: .4, tail: TAIL });
const sc = S.scenes;
window.TOTAL = S.total;
const GOLD = '#f2b632', TEAL = '#2bb3a3';
const SRC1 = 'Sources: TSN (The Canadian Press) · Calgary Journal, Nov 21, 2026';
const SRC2 = 'Source: Concacaf, Nov 9, 2026';
const pop = (t, a, b = a + .35) => M.seg(t, a, b, 'outBack');
const navyCard = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#06101f'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const band = (c, y0, y1, a = .72) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.15, `rgba(7,13,24,${a})`); g.addColorStop(.85, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };

// stylised floodlit pitch at night, seen from above; zoom/rot/cx/cy = camera; snow on top
const pitch = (c, t, o = {}) => {
  c.fillStyle = '#05101c'; c.fillRect(0, 0, W, H);
  const zoom = o.zoom || 1, rot = o.rot || 0, s = 13.5 * zoom, PW = 68, PL = 105;
  c.save(); c.translate(W / 2 + (o.dx || 0), H / 2 + (o.dy || 0)); c.rotate(rot);
  // grass stripes
  for (let k = 0; k < 14; k++) { c.fillStyle = k % 2 ? '#1f6b3e' : '#1a5e36'; c.fillRect(-PW / 2 * s - 6 * s, (-PL / 2 + k * PL / 14) * s, (PW + 12) * s, PL / 14 * s + 1); }
  c.fillStyle = '#17532f'; c.fillRect(-PW / 2 * s - 6 * s, -PL / 2 * s - 6 * s, (PW + 12) * s, 6 * s); c.fillRect(-PW / 2 * s - 6 * s, PL / 2 * s, (PW + 12) * s, 6 * s);
  // snow along the touchlines
  c.fillStyle = 'rgba(235,242,250,.85)'; c.fillRect(-PW / 2 * s - 6 * s, -PL / 2 * s - 6 * s, 3.2 * s, (PL + 12) * s); c.fillRect(PW / 2 * s + 2.8 * s, -PL / 2 * s - 6 * s, 3.2 * s, (PL + 12) * s);
  c.strokeStyle = 'rgba(255,255,255,.92)'; c.lineWidth = Math.max(2, .28 * s);
  c.strokeRect(-PW / 2 * s, -PL / 2 * s, PW * s, PL * s);
  c.beginPath(); c.moveTo(-PW / 2 * s, 0); c.lineTo(PW / 2 * s, 0); c.stroke();
  c.beginPath(); c.arc(0, 0, 9.15 * s, 0, 7); c.stroke();
  [-1, 1].forEach(e => { c.strokeRect(-20.16 * s, e > 0 ? (PL / 2 - 16.5) * s : -PL / 2 * s, 40.32 * s, 16.5 * s); c.strokeRect(-9.16 * s, e > 0 ? (PL / 2 - 5.5) * s : -PL / 2 * s, 18.32 * s, 5.5 * s);
    c.beginPath(); c.arc(0, e * (PL / 2 - 11) * s, .5 * s, 0, 7); c.fillStyle = '#fff'; c.fill(); });
  c.beginPath(); c.arc(0, 0, .5 * s, 0, 7); c.fillStyle = '#fff'; c.fill();
  // centre-circle glow
  if (o.glow) { const g = c.createRadialGradient(0, 0, 0, 0, 0, 22 * s); g.addColorStop(0, `rgba(242,182,50,${.45 * o.glow})`); g.addColorStop(1, 'rgba(242,182,50,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 22 * s, 0, 7); c.fill(); }
  c.restore();
  // floodlight pools from the four corners
  [[0, 0], [W, 0], [0, H], [W, H]].forEach(([x, y], i) => { const g = c.createRadialGradient(x, y, 0, x, y, 1100); g.addColorStop(0, `rgba(255,244,214,${.28 + .04 * Math.sin(t * 3 + i)})`); g.addColorStop(1, 'rgba(255,244,214,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); });
  M.weather(c, 'snow', t + (o.tOff || 0), W, H, { wind: 60, speed: 1.2 });
};

window.BUILD = () => M.film({ W, H, identity: 'civic', scenes: [
  // S0 HOOK: frame 0 already pushing in (and turning) over the snowy floodlit pitch; hook words on screen at frame 0
  { dur: sc[0].sceneDur, trans: { kind: 'dissolve', dur: .4 }, draw: (c, t) => {
      const u = M.seg(t, 0, sc[0].sceneDur, 'outCubic');
      pitch(c, t, { zoom: M.lerp(.9, 1.25, u), rot: M.lerp(-.3, -.08, u), glow: M.seg(t, .5, 1.0) });
      band(c, 280, 980, .62);
      M.kinetic(c, 'NO CLUB HAD', t, CX, 320, { t0: -.12, size: 140, every: .08 });
      M.kinetic(c, 'EVER DONE', t, CX, 480, { t0: .0, size: 140, every: .08 });
      M.kinetic(c, 'THIS', t, CX, 640, { t0: .14, size: 150, every: .08, color: GOLD });
      const k = pop(t, 1.3); if (k > 0) M.chip(c, 'Cavalry FC · Canadian Premier League', CX, 860, { align: 'center', size: 50, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k) });
  } },
  // S1 RESULT: scoreboard over the same pitch (slow drift); counters slam to 3 and 2
  { dur: sc[1].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      pitch(c, t, { zoom: M.lerp(1.25, 1.4, M.seg(t, 0, sc[1].sceneDur, 'linear')), rot: M.lerp(-.08, .02, M.seg(t, 0, sc[1].sceneDur, 'linear')), tOff: 4, glow: .6 });
      band(c, 330, 1160, .8);
      const a = M.seg(t, .05, .45, 'outCubic'), b = M.seg(t, .35, .75, 'outCubic');
      c.save(); c.fillStyle = GOLD; c.globalAlpha = a; c.fillRect(90, 420, 14, 120); c.fillStyle = '#9fb0c8'; c.globalAlpha = b; c.fillRect(90, 610, 14, 120); c.restore();
      M.text(c, 'CAVALRY', 130 - (1 - a) * 400, 420, { size: 110, weight: 800, alpha: a });
      M.text(c, 'OTTAWA', 130 - (1 - b) * 400, 610, { size: 110, weight: 800, alpha: b });
      const p3 = M.seg(t, .9, 1.7, 'linear'), p2 = M.seg(t, 1.3, 2.1, 'linear');
      if (p3 > 0) M.counter(c, 3, p3, 900, 410, { size: 140, align: 'right', slam: true, decimals: 0, color: '#ffffff' });
      if (p2 > 0) M.counter(c, 2, p2, 900, 600, { size: 140, align: 'right', slam: true, decimals: 0, color: '#dfe7f2' });
      const k = pop(t, 2.3); if (k > 0) M.chip(c, 'CPL FINAL', CX, 800, { align: 'center', size: 56, alpha: Math.min(1, k) });
      const k2 = pop(t, 2.8); if (k2 > 0) M.chip(c, 'Sat Nov 21 · ATCO Field, Spruce Meadows', CX, 910, { align: 'center', size: 48, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k2) });
      M.evidence(c, 'fact', CX, 1030, { align: 'center', size: 34, alpha: M.seg(t, 3.4, 3.8) });
      M.source(c, SRC1, 60, 1460, { size: 20 });
  } },
  // S2 WHEN + CONDITIONS: match timeline 0'-90', markers drop at 5' and 74'; wind chill and crowd chips
  { dur: sc[2].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      navyCard(c); M.weather(c, 'snow', t + 9, W, H, { wind: 40, speed: .8 });
      M.kinetic(c, 'WARSCHEWSKI', t, CX, 330, { size: 112, every: .05, color: '#ffffff' });
      M.text(c, '2 GOALS', CX, 470, { size: 92, weight: 800, align: 'center', color: GOLD, alpha: M.seg(t, .4, .8) });
      const x0 = 120, x1 = W - 120 - 120 + 60, y = 700, p = M.seg(t, .5, 1.6, 'inOutCubic');
      c.save(); c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
      c.strokeStyle = '#ffffff'; c.beginPath(); c.moveTo(x0, y); c.lineTo(M.lerp(x0, x1, p), y); c.stroke(); c.restore();
      M.text(c, "0'", x0, y + 40, { size: 40, weight: 600, align: 'center', color: '#9fb0c8' });
      M.text(c, "90'", x1, y + 40, { size: 40, weight: 600, align: 'center', color: '#9fb0c8', alpha: p });
      [[5, 1.2], [74, 1.6]].forEach(([m, at]) => { const k = pop(t, at), x = M.lerp(x0, x1, m / 90); if (k <= 0) return;
        c.save(); c.globalAlpha = Math.min(1, k); c.fillStyle = GOLD; c.beginPath(); c.arc(x, y - 70 + (1 - Math.min(1, k)) * -60, 26, 0, 7); c.fill();
        c.strokeStyle = GOLD; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y - 44); c.lineTo(x, y); c.stroke(); c.restore();
        M.text(c, m + "'", x, y - 170, { size: 60, weight: 800, align: 'center', color: '#ffffff', alpha: Math.min(1, k) }); });
      const k1 = pop(t, 2.3); if (k1 > 0) M.chip(c, '-11 °C wind chill', CX, 880, { align: 'center', size: 56, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k1) });
      const pc = M.seg(t, 3.0, 4.0, 'linear');
      if (pc > 0) { M.counter(c, 9131, pc, CX, 1010, { size: 130, decimals: 0, slam: true, color: '#ffffff' }); M.text(c, 'fans · capacity', CX, 1160, { size: 56, weight: 700, align: 'center', color: '#dfe7f2', alpha: M.seg(t, 3.4, 3.8) }); }
      M.source(c, SRC1, 60, 1460, { size: 20 });
  } },
  // S3 REGULAR SEASON: "1st" slam, shield outline draws around it
  { dur: sc[3].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      navyCard(c);
      const p = M.seg(t, .1, 1.2, 'inOutCubic');
      c.save(); c.strokeStyle = GOLD; c.lineWidth = 12; c.lineJoin = 'round'; c.shadowColor = GOLD; c.shadowBlur = 20;
      const pts = [[CX - 250, 330], [CX + 250, 330], [CX + 250, 620], [CX, 860], [CX - 250, 620], [CX - 250, 330]];
      const segs = pts.length - 1, upto = p * segs; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 0; i < segs; i++) { const f = Math.min(1, Math.max(0, upto - i)); if (f <= 0) break; c.lineTo(M.lerp(pts[i][0], pts[i + 1][0], f), M.lerp(pts[i][1], pts[i + 1][1], f)); }
      c.stroke(); c.restore();
      const k = M.seg(t, .2, .7, 'outBack'); if (k > 0) M.text(c, '1st', CX, 430, { size: 230 * (1 + .2 * (1 - Math.min(1, k))), weight: 800, align: 'center', color: '#ffffff', alpha: Math.min(1, k) });
      M.text(c, 'in the regular season', CX, 940, { size: 76, weight: 700, align: 'center', color: '#dfe7f2', alpha: M.seg(t, .7, 1.1) });
      const k2 = pop(t, 1.4); if (k2 > 0) M.chip(c, 'CPL Shield', CX, 1060, { align: 'center', size: 60, alpha: Math.min(1, k2) });
      M.source(c, SRC1 + ' · Concacaf', 60, 1460, { size: 20 });
  } },
  // S4 THE DOUBLE: SHIELD and CUP badges slide together and lock; eight dots light up, only the last gold
  { dur: sc[4].sceneDur, trans: { kind: 'dissolve', dur: .45 }, draw: (c, t) => {
      navyCard(c);
      const u = M.seg(t, .2, 1.1, 'inOutCubic'), lock = M.seg(t, 1.1, 1.4, 'outBack');
      const badge = (x, label) => { c.save(); M.rr(c, x - 200, 360, 400, 170, 85); c.fillStyle = '#12305a'; c.fill(); c.lineWidth = 6; c.strokeStyle = lock > 0 ? GOLD : '#5f7fa8'; c.stroke(); c.restore(); M.text(c, label, x, 445, { size: 84, weight: 800, align: 'center', base: 'middle' }); };
      badge(M.lerp(-220, CX - 210, u), 'SHIELD'); badge(M.lerp(W + 220, CX + 210, u), 'CUP');
      if (lock > 0) M.text(c, '+', CX, 445, { size: 110, weight: 800, align: 'center', base: 'middle', color: GOLD, alpha: Math.min(1, lock) });
      M.kinetic(c, 'FIRST IN 8 YEARS', Math.max(0, t - 1.5), CX, 640, { size: 112, every: .08, highlight: ['first'] });
      const gap = 92, x0 = CX - gap * 3.5;
      for (let i = 0; i < 8; i++) { const on = M.seg(t, 1.9 + i * .14, 2.05 + i * .14, 'outBack'); if (on <= 0) continue; const last = i === 7;
        c.save(); c.globalAlpha = Math.min(1, on); c.fillStyle = last ? GOLD : 'rgba(159,176,200,.55)'; if (last) { c.shadowColor = GOLD; c.shadowBlur = 24; }
        c.beginPath(); c.arc(x0 + i * gap, 960, last ? 30 : 22, 0, 7); c.fill(); c.restore(); }
      M.evidence(c, 'fact', CX, 1080, { align: 'center', size: 44, alpha: M.seg(t, 3.2, 3.5) });
      M.source(c, SRC1, 60, 1460, { size: 20 });
  } },
  // S5 STREAK: "4th straight final"; timeline 2024 -> 2026 with two title ticks
  { dur: sc[5].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      navyCard(c);
      const p = M.seg(t, .05, .9, 'linear'), v = p >= 1 ? 4 : Math.max(1, Math.round(1 + 3 * M.ease.outCubic(p)));
      M.text(c, v + (v === 1 ? 'st' : v === 2 ? 'nd' : v === 3 ? 'rd' : 'th'), CX, 330, { size: 230, weight: 800, align: 'center', color: '#fff' });
      M.text(c, 'straight final', CX, 590, { size: 84, weight: 700, align: 'center', color: '#dfe7f2', alpha: M.seg(t, .5, .9) });
      M.timeline(c, { x: 200, y: 860, w: W - 120 - 320, from: 2024, to: 2026, p: M.seg(t, 1.6, 2.8, 'inOutCubic'), events: [{ year: 2024 }, { year: 2026 }], size: 60, headSize: 0.01, headOffset: 0 });
      [[2024, 2.0], [2026, 2.8]].forEach(([yr, at]) => { const k = pop(t, at); if (k > 0) M.text(c, 'Title', yr === 2024 ? 200 : W - 120 - 120, 975, { size: 52, weight: 800, align: 'center', color: GOLD, alpha: Math.min(1, k) }); });
      const k = pop(t, 3.2); if (k > 0) M.chip(c, '2nd title in 3 years', CX, 1080, { align: 'center', size: 56, bg: '#ffffff', color: '#0b1f3a', alpha: Math.min(1, k) });
      M.source(c, SRC1, 60, 1460, { size: 20 });
  } },
  // S6 WHAT'S NEXT: qualification card slides up, QUALIFIED stamp lands, counter to 27
  { dur: sc[6].sceneDur, trans: { kind: 'dissolve', dur: .45 }, draw: (c, t) => {
      navyCard(c);
      M.kinetic(c, 'NEXT: CONCACAF', t, CX, 300, { size: 120, every: .08, highlight: ['concacaf'] });
      const pp = M.seg(t, .5, 1.3, 'outCubic'), cw = 820, cx0 = CX - cw / 2, yy = 450 + (1 - pp) * 80;
      c.save(); c.globalAlpha = pp; M.rr(c, cx0, yy, cw, 470, 18); c.fillStyle = '#f7f4ec'; c.fill();
      M.text(c, '2027 CONCACAF', cx0 + 50, yy + 50, { size: 56, weight: 800, color: '#1b2533', shadow: false });
      M.text(c, 'CHAMPIONS CUP', cx0 + 50, yy + 120, { size: 56, weight: 800, color: '#1b2533', shadow: false });
      c.fillStyle = '#c9c2b2'; for (let k = 0; k < 2; k++) c.fillRect(cx0 + 50, yy + 215 + k * 30, (cw - 100) * (k ? .55 : .92), 10);
      const hl = M.seg(t, 1.4, 1.9, 'linear'); c.font = M.font(84, 800); const lw = c.measureText('Cavalry FC').width;
      c.fillStyle = 'rgba(242,182,50,.85)'; c.fillRect(cx0 + 46, yy + 292, (lw + 8) * hl, 96);
      M.text(c, 'Cavalry FC', cx0 + 50, yy + 298, { size: 84, weight: 800, color: '#111a26', shadow: false });
      M.text(c, 'Concacaf, Nov 9, 2026', cx0 + 50, yy + 415, { size: 26, weight: 500, color: '#5b6573', shadow: false });
      c.restore();
      const st = M.seg(t, 2.1, 2.45, 'outBack');
      if (st > 0) { c.save(); c.translate(CX + 190, yy + 400); c.rotate(-.18); const sc2 = M.lerp(1.8, 1, Math.min(1, st)); c.scale(sc2, sc2); c.globalAlpha = Math.min(1, st);
        c.strokeStyle = TEAL; c.lineWidth = 7; M.rr(c, -200, -50, 400, 100, 14); c.stroke(); M.text(c, 'QUALIFIED', 0, 0, { size: 64, weight: 800, align: 'center', base: 'middle', color: TEAL, shadow: false }); c.restore(); }
      const pc = M.seg(t, 3.4, 4.3, 'linear');
      if (pc > 0) { M.counter(c, 27, pc, CX - 260, 975, { size: 125, decimals: 0, slam: true, align: 'center' }); M.text(c, "of the region's", CX - 150, 985, { size: 54, weight: 700, color: '#dfe7f2', alpha: M.seg(t, 3.8, 4.2) }); M.text(c, 'top clubs', CX - 150, 1050, { size: 54, weight: 700, color: '#dfe7f2', alpha: M.seg(t, 3.8, 4.2) }); }
      M.evidence(c, 'fact', cx0 + cw - 30, yy + 40, { align: 'right', size: 30, alpha: M.seg(t, 1.6, 2.0) * pp });
      M.source(c, SRC2, 60, 1460, { size: 20 });
  } },
  // S7 CLOSER: one-word question, no end card
  { dur: sc[7].sceneDur, draw: (c, t) => { navyCard(c); M.closer(c, 'Did you watch the final? Yes or no?', M.seg(t, 0, sc[7].sceneDur, 'linear'), W, H, { highlight: ['yes', 'no?', 'no'] }); } },
], overlay: (c, t, info) => {
  if (t > 3 && info.index < 7) M.header(c, window.LOGO, W, H);
  if (info.index < 7) M.caption(c, S.captionAt(t), W, H);
  const mid = sc[4].sceneStart + .3; M.followPill(c, (t - mid) / 2, W, H);
} });

window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.05, sfx: 'impact', gain: -6 }, { t: 0.0, sfx: 'wind', dur: sc[1].sceneEnd, gain: -24 }, { t: .55, sfx: 'swell', gain: -14 }, { t: 1.35, sfx: 'click', gain: -14 },
  { t: sc[1].sceneStart - .2, sfx: 'whoosh', gain: -14 }, { t: sc[1].sceneStart, sfx: 'crowd_murmur', dur: sc[1].sceneDur + sc[2].sceneDur, gain: -22 }, { t: sc[1].sceneStart + 1.7, sfx: 'impact', gain: -9 }, { t: sc[1].sceneStart + 2.1, sfx: 'impact', gain: -11 }, { t: sc[1].sceneStart + 3.45, sfx: 'stamp', gain: -14 },
  { t: sc[2].sceneStart - .18, sfx: 'whoosh', gain: -10 }, { t: sc[2].sceneStart + 1.2, sfx: 'pop', gain: -11 }, { t: sc[2].sceneStart + 1.6, sfx: 'pop', gain: -11 }, { t: sc[2].sceneStart + 2.3, sfx: 'click', gain: -13 }, { t: sc[2].sceneStart + 3.0, sfx: 'ticks', dur: 1.0, gain: -16 }, { t: sc[2].sceneStart + 4.0, sfx: 'impact', gain: -11 },
  { t: sc[3].sceneStart - .15, sfx: 'whoosh', gain: -12 }, { t: sc[3].sceneStart + .45, sfx: 'impact', gain: -9 }, { t: sc[3].sceneStart + 1.45, sfx: 'click', gain: -13 },
  { t: sc[4].sceneStart + .3, sfx: 'whoosh', gain: -14 }, { t: sc[4].sceneStart + 1.15, sfx: 'stamp', gain: -10 }, { t: sc[4].sceneStart + 2.9, sfx: 'ping', gain: -12 },
  { t: sc[5].sceneStart - .15, sfx: 'whoosh', gain: -12 }, { t: sc[5].sceneStart + .9, sfx: 'impact', gain: -9 }, { t: sc[5].sceneStart + 2.0, sfx: 'pop', gain: -12 }, { t: sc[5].sceneStart + 2.8, sfx: 'pop', gain: -12 }, { t: sc[5].sceneStart + 3.25, sfx: 'click', gain: -13 },
  { t: sc[6].sceneStart + .3, sfx: 'whoosh', gain: -14 }, { t: sc[6].sceneStart + 2.15, sfx: 'stamp', gain: -9 }, { t: sc[6].sceneStart + 3.4, sfx: 'ticks', dur: .9, gain: -16 }, { t: sc[6].sceneStart + 4.3, sfx: 'impact', gain: -11 },
  { t: sc[7].sceneStart - .1, sfx: 'whoosh', gain: -14 },
];
