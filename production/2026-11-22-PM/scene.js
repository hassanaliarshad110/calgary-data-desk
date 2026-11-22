/* 2026-11-22 PM fun fact: "This Calgary street is named after an oil city in China."
 * Lead identity Data Explainer (kinetic hook, sign-flip reveal, timeline stamp, schematic route arc + pumpjack, stamps),
 * borrowing a Storyteller map dive over real Calgary onto Chinatown (S0). Every on-screen figure maps to the audited
 * claims table (packages/2026-11-22-PM-daqing-street.md, C1-C7; audits/2026-11-22-PM.md, APPROVED round 2).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30, THUMB = !!(window.PARAMS && window.PARAMS.thumb);
const DURS = (window.PARAMS && window.PARAMS.durs) ? window.PARAMS.durs.split(',').map(Number) : [3.4, 3.8, 4.0, 3.3, 4.2, 2.8];
const S = M.script([
  { text: 'This Calgary street is named after an oil city in China.', dur: DURS[0] },
  { text: 'In Chinatown, Second Avenue Southwest has a second name: Daqing.', dur: DURS[1] },
  { text: "It was named in nineteen eighty-five, for Calgary's twin city in China.", dur: DURS[2] },
  { text: "Daqing is one of China's most important sources of oil.", dur: DURS[3] },
  { text: "There's even a Daqing Plaza, at the Chinese Cultural Centre's west entrance.", dur: DURS[4] },
  { text: 'Did you know this? Drop your thoughts below.', dur: DURS[5] },
], { lead: .25, gap: .2, tail: 1.0 });
const sc = S.scenes, SPLIT = 1.8;
const SRC = 'Sources: City of Calgary (Chinatown Historical Context Paper) · SFU · Daily Hive · Britannica';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const GOLD = M.house.gold, RED = '#C8102E', GREEN = '#0f6b3a';
// C6: pin on 2 Avenue SW between 1 and 2 Streets SW (Daqing Plaza location), metres from the geo-pack origin (51.0447, -114.0719)
const PLAZA = [413, 667, 0];

function navyBg(c, top = '#0e2b52', bot = '#081428') { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function dark(c, y0, y1, a = .62) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.2, `rgba(7,13,24,${a})`); g.addColorStop(.8, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); }
function stamp(c, txt, x, y, k, o = {}) {
  if (k <= 0) return; const s = M.lerp(1.8, 1, Math.min(1, k)); c.save(); c.translate(x, y); c.rotate(o.rot ?? -.05); c.scale(s, s); c.globalAlpha = Math.min(1, k * 1.5);
  c.font = M.font(o.size || 104, 800); const w = c.measureText(txt).width + 70, h = (o.size || 104) * 1.45;
  M.rr(c, -w / 2, -h / 2, w, h, 20); c.fillStyle = o.bg || 'rgba(7,13,24,.88)'; c.fill(); c.lineWidth = 9; c.strokeStyle = o.color || GOLD; c.stroke();
  M.text(c, txt, 0, -(o.size || 104) * .56, { size: o.size || 104, weight: 800, align: 'center', color: o.color || GOLD, shadow: false });
  c.restore();
}
// recurring prop SIGN: street-name blade on a pole. flip 0 = green "2 AVENUE SW" face, 1 = red/gold "DAQING" face
function sign(c, x, y, flip, swing = 1, o = {}) {
  c.save(); c.translate(x, y);
  c.fillStyle = '#5d6b7c'; c.fillRect(-14, -40, 28, 1100);                      // pole
  c.fillStyle = '#7d8a99'; c.fillRect(-20, -60, 40, 30);
  c.rotate((1 - swing) * -.5);
  const sx = Math.cos(flip * Math.PI), face = flip < .5 ? 0 : 1, w = 820, h = 230;
  c.scale(Math.max(.02, Math.abs(sx)), 1);
  c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 30; c.shadowOffsetY = 12;
  M.rr(c, -w / 2, 0, w, h, 22); c.fillStyle = face ? RED : GREEN; c.fill(); c.shadowBlur = 0; c.shadowOffsetY = 0;
  c.lineWidth = 10; c.strokeStyle = face ? GOLD : '#ffffff'; M.rr(c, -w / 2 + 16, 16, w - 32, h - 32, 14); c.stroke();
  if (face) M.text(c, 'DAQING', 0, 32, { size: 150, weight: 800, align: 'center', color: GOLD, shadow: false });
  else M.text(c, '2 AVENUE SW', 0, 52, { size: 116, weight: 800, align: 'center', color: '#ffffff', shadow: false });
  c.restore();
}
// recurring prop PUMPJACK: stylised nodding oil pump; ang in radians
function pumpjack(c, x, y, s, ang) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round';
  c.fillStyle = '#1b2f4d'; c.fillRect(-170, 0, 340, 22);                          // skid
  c.strokeStyle = '#3a5680'; c.lineWidth = 16; c.beginPath(); c.moveTo(-60, 0); c.lineTo(0, -180); c.lineTo(60, 0); c.stroke();   // A-frame
  c.save(); c.translate(0, -185); c.rotate(ang);
  c.fillStyle = GOLD; M.rr(c, -190, -16, 330, 32, 12); c.fill();                // walking beam
  c.beginPath(); c.moveTo(-190, -40); c.quadraticCurveTo(-250, 0, -190, 60); c.lineTo(-170, 40); c.quadraticCurveTo(-205, 0, -170, -22); c.closePath(); c.fill();   // horse head
  c.restore();
  const hx = -205 + 0, hy = -185 + Math.sin(ang) * -205;                          // polished rod follows the head
  c.strokeStyle = '#c9d6e2'; c.lineWidth = 6; c.beginPath(); c.moveTo(-210, hy + 50); c.lineTo(-210, 0); c.stroke();
  c.fillStyle = '#2b4466'; c.beginPath(); c.arc(110, -60, 46, 0, 7); c.fill();  // crank
  c.restore();
}
// recurring prop LANTERN lamppost
function lantern(c, x, y, k, t, i) {
  if (k <= 0) return; const hgt = 520 * Math.min(1, k);
  c.save(); c.fillStyle = '#2a2f38'; c.fillRect(x - 9, y - hgt, 18, hgt);
  if (k >= 1) { const gl = .55 + .2 * Math.sin(t * 3 + i); const g = c.createRadialGradient(x, y - hgt - 40, 10, x, y - hgt - 40, 170); g.addColorStop(0, `rgba(255,120,80,${gl})`); g.addColorStop(1, 'rgba(255,120,80,0)'); c.fillStyle = g; c.fillRect(x - 180, y - hgt - 220, 360, 360);
    c.fillStyle = RED; c.beginPath(); c.ellipse(x, y - hgt - 40, 46, 62, 0, 0, 7); c.fill(); c.fillStyle = GOLD; c.fillRect(x - 30, y - hgt - 106, 60, 12); c.fillRect(x - 30, y - hgt + 18, 60, 12);
    c.strokeStyle = 'rgba(255,214,120,.7)'; c.lineWidth = 3; for (const dx of [-22, 0, 22]) { c.beginPath(); c.moveTo(x + dx, y - hgt - 95); c.lineTo(x + dx, y - hgt + 15); c.stroke(); } }
  c.restore();
}
function dome(c, x, y, s, a = 1) {   // stylised round blue-tiled dome (C7)
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha *= a;
  c.fillStyle = '#c9b99a'; c.fillRect(-330, 0, 660, 260);
  for (let k = 0; k < 3; k++) { const r = 300 - k * 70, yy = -k * 95; c.fillStyle = k % 2 ? '#2f5fa8' : '#2552a0'; c.beginPath(); c.ellipse(0, yy, r, 120 - k * 18, 0, Math.PI, 0); c.fill(); c.fillStyle = RED; c.fillRect(-r, yy, r * 2, 18); }
  c.strokeStyle = 'rgba(160,200,255,.35)'; c.lineWidth = 4; for (let i = -5; i <= 5; i++) { c.beginPath(); c.moveTo(i * 50, 0); c.lineTo(i * 18, -270); c.stroke(); }
  c.fillStyle = GOLD; c.beginPath(); c.moveTo(0, -400); c.lineTo(22, -300); c.lineTo(-22, -300); c.closePath(); c.fill();   // finial
  c.restore();
}

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // S0 HOOK (0-1.8 s): frame 0 already diving over real Calgary onto the Chinatown pin; hook punches in from frame 0 (C1, C6)
  { dur: SPLIT, trans: { kind: 'zoom', dur: .3 }, draw: (c, t) => {
      const w = M.world({ sky: 'dusk', fog: { near: 9000, far: 52000, max: .4 } }); M.geo.addBase(w, { buildings: true, roads: true, windows: '#ffd890' });
      M.pin(w, PLAZA, 'CHINATOWN', { p: THUMB ? 1 : M.seg(t, .2, .7, 'linear'), size: 50, scale: 1.3 }); M.ping(w, PLAZA, t, { r: 150 });
      const cam = M.camera(M.moves.dive(PLAZA, THUMB ? .78 : M.seg(t, 0, SPLIT + .8, 'outCubic'), { h0: 16000, h1: 2400, back0: 1, back1: 3400, ahead: 200 }), W, H); w.render(c, cam);
      M.source(c, MAPC, 60, 1460, { size: 20 }); M.text(c, 'N ↑', 60, 1400, { size: 32, weight: 700, color: '#fff' });
      if (THUMB) return;
      dark(c, 150, 720, .66);
      M.kinetic(c, 'Named after a Chinese oil city?', t, CX, 250, { t0: -.45, size: 128, maxW: 920, highlight: ['oil'], every: .09 });
  } },
  // S1 the street: sign swings in, "2 AVENUE SW", chip CHINATOWN (C2)
  { dur: sc[0].sceneDur - SPLIT, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      dome(c, CX, 1420, .9, .25);
      sign(c, CX, 720, 0, M.seg(t, 0, .6, 'outBack'));
      const k = M.seg(t, .45, .8, 'outBack'); if (k > 0) M.chip(c, 'CHINATOWN', CX, 440, { align: 'center', size: 56, alpha: Math.min(1, k) });
  } },
  // S2 the second name: the blade flips to DAQING; stamp SECOND NAME (C2)
  { dur: sc[1].sceneDur, trans: { kind: 'whip', dur: .3 }, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      dome(c, CX, 1420, .9, .25);
      const fl = M.seg(t, 1.2, 1.9, 'inOutCubic'); sign(c, CX, 720, fl, 1);
      M.chip(c, 'CHINATOWN', CX, 440, { align: 'center', size: 56 });
      stamp(c, 'SECOND NAME', CX, 1070, M.seg(t, 2.0, 2.35, 'outBack'), { size: 100 });
      M.source(c, SRC, 60, 1610, { size: 20 });
  } },
  // S3 when and why: timeline dot 1985; stamp; chip twin city (C3)
  { dur: sc[2].sceneDur, trans: { kind: 'zoom', dur: .35 }, draw: (c, t) => {
      navyBg(c);
      const x0 = 110, x1 = W - 170, y = 880, f = M.seg(t, 0, 1.2, 'inOutCubic');
      c.fillStyle = 'rgba(255,255,255,.18)'; M.rr(c, x0, y - 18, x1 - x0, 36, 18); c.fill();
      c.fillStyle = '#ffffff'; M.rr(c, x0, y - 18, (x1 - x0) * f, 36, 18); c.fill();
      const dx = x0 + (x1 - x0) * .62, dk = M.seg(t, 1.0, 1.45, 'outBack');
      if (dk > 0) { const dy = M.lerp(y - 500, y, Math.min(1, dk)); c.save(); c.shadowColor = 'rgba(242,182,50,.8)'; c.shadowBlur = 40; c.fillStyle = GOLD; c.beginPath(); c.arc(dx, dy, 34, 0, 7); c.fill(); c.restore();
        if (dk >= 1) { const pr = M.seg(t, 1.45, 2.1, 'outCubic'); c.strokeStyle = `rgba(242,182,50,${1 - pr})`; c.lineWidth = 6; c.beginPath(); c.arc(dx, y, 34 + pr * 90, 0, 7); c.stroke(); }
        M.text(c, 'STREET NAMED', dx, y + 70, { size: 48, weight: 800, align: 'center', color: GOLD }); }
      stamp(c, '1985', CX, 520, M.seg(t, 1.35, 1.7, 'outBack'), { size: 190 });
      const k2 = M.seg(t, 1.9, 2.25, 'outBack'); if (k2 > 0) { M.chip(c, "NAMED FOR CALGARY'S TWIN CITY", CX, 1070, { align: 'center', size: 50, alpha: Math.min(1, k2) }); M.chip(c, 'IN CHINA', CX, 1165, { align: 'center', size: 50, alpha: Math.min(1, k2) }); }
      M.source(c, SRC, 60, 1610, { size: 20 });
  } },
  // S4 the oil city: schematic arc Calgary -> Daqing, pumpjack nods (C4)
  { dur: sc[3].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      navyBg(c, '#0a1d38', '#06101f');
      c.strokeStyle = 'rgba(255,255,255,.06)'; c.lineWidth = 2; for (let gx = 0; gx < W; gx += 90) { c.beginPath(); c.moveTo(gx, 300); c.lineTo(gx, 1500); c.stroke(); } for (let gy = 300; gy < 1500; gy += 90) { c.beginPath(); c.moveTo(0, gy); c.lineTo(W, gy); c.stroke(); }
      const A = [170, 1120], B = [740, 1080], p = M.seg(t, .1, 1.2, 'inOutCubic');
      c.save(); c.setLineDash([18, 16]); c.strokeStyle = GOLD; c.lineWidth = 8; c.beginPath();
      for (let i = 0; i <= 40 * p; i++) { const u = i / 40, x = M.lerp(A[0], B[0], u), yy = M.lerp(A[1], B[1], u) - Math.sin(u * Math.PI) * 360; i ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke(); c.restore();
      for (const [P, lab, k0] of [[A, 'CALGARY', 0], [B, 'DAQING, CHINA', 1.1]]) { const k = M.seg(t, k0, k0 + .3, 'outBack'); if (k <= 0) continue; c.save(); c.fillStyle = GOLD; c.beginPath(); c.arc(P[0], P[1], 22 * Math.min(1, k), 0, 7); c.fill(); c.restore(); M.text(c, lab, P[0] + (lab === 'CALGARY' ? 0 : -40), P[1] + 40, { size: 50, weight: 800, align: 'center', color: '#ffffff' }); }
      const pk = M.seg(t, 1.2, 1.6, 'outBack'); if (pk > 0) pumpjack(c, B[0] + 70, B[1] - 90, .62 * Math.min(1, pk), Math.sin(t * 3.2) * .22);
      const k = M.seg(t, 1.5, 1.85, 'outBack'); if (k > 0) { M.chip(c, "ONE OF CHINA'S MOST IMPORTANT", CX, 420, { align: 'center', size: 52, alpha: Math.min(1, k) }); M.chip(c, 'SOURCES OF OIL', CX, 515, { align: 'center', size: 52, alpha: Math.min(1, k) }); }
      M.text(c, 'SCHEMATIC · NOT TO SCALE', 60, 1440, { size: 24, weight: 700, color: 'rgba(255,255,255,.7)' });
      M.source(c, 'Source: Britannica', 60, 1610, { size: 20 });
  } },
  // S5 the plaza: lantern lampposts rise, blue dome behind, name punch (C5, C7)
  { dur: sc[4].sceneDur, trans: { kind: 'zoom', dur: .35 }, draw: (c, t) => {
      navyBg(c, '#13284a', '#0a1428');
      const z = M.lerp(1, 1.08, M.seg(t, 0, sc[4].sceneDur, 'linear'));
      c.save(); c.translate(CX, 1150); c.scale(z, z); c.translate(-CX, -1150);
      dome(c, CX, 1000, 1.0);
      c.fillStyle = '#9aa3ad'; c.beginPath(); c.moveTo(0, 1260); c.lineTo(W, 1260); c.lineTo(W, 1700); c.lineTo(0, 1700); c.fill();   // concrete plaza
      c.strokeStyle = 'rgba(60,70,80,.4)'; c.lineWidth = 3; for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(CX + i * 60, 1260); c.lineTo(CX + i * 160, 1700); c.stroke(); } for (const yy of [1330, 1430, 1560]) { c.beginPath(); c.moveTo(0, yy); c.lineTo(W, yy); c.stroke(); }
      [130, 330, 640, 840].forEach((x, i) => lantern(c, x, 1300 + (i % 2 ? 0 : 20), M.seg(t, .1 + i * .18, .5 + i * .18, 'outBack'), t, i));
      c.restore();
      dark(c, 160, 700, .6);
      M.kinetic(c, 'DAQING PLAZA', t, CX, 280, { t0: .2, size: 116, maxW: 940, highlight: ['plaza'] });
      const k = M.seg(t, 1.6, 1.95, 'outBack'); if (k > 0) { M.chip(c, 'CHINESE CULTURAL CENTRE', CX, 480, { align: 'center', size: 50, alpha: Math.min(1, k) }); M.chip(c, 'WEST ENTRANCE', CX, 575, { align: 'center', size: 50, alpha: Math.min(1, k), bg: '#ffffff' }); }
      M.source(c, SRC, 60, 1730, { size: 20, color: '#ffffff' });
  } },
  // S6 QUESTION: no end card (under 2:00)
  { dur: sc[5].sceneDur, draw: (c, t) => {
      navyBg(c, '#0b1f3a', '#081428');
      dome(c, CX, 1900, .8, .3);
      M.closer(c, 'Did you know this? Yes or no?', M.seg(t, 0, sc[5].sceneDur, 'linear'), W, H, { highlight: ['yes', 'no?'] });
  } },
], overlay: (c, t, info) => {
  if (THUMB) return;
  if (t > 3 && info.index < 6) M.header(c, window.LOGO, W, H);
  if (info.index < 6) M.caption(c, S.captionAt(t), W, H);
} });

window.CUES = [
  { t: 0.0, sfx: 'whoosh_rev', dur: .5, gain: -10 }, { t: 0.02, sfx: 'impact', gain: -5 },
  { t: SPLIT - .15, sfx: 'whoosh', gain: -11 }, { t: SPLIT + .5, sfx: 'pop', gain: -10 },
  { t: sc[1].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[1].sceneStart + 1.2, sfx: 'whoosh', dur: .6, gain: -12 }, { t: sc[1].sceneStart + 2.0, sfx: 'stamp', gain: -7 },
  { t: sc[2].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[2].sceneStart + .05, sfx: 'ticks', dur: 1.1, gain: -13 }, { t: sc[2].sceneStart + 1.35, sfx: 'stamp', gain: -6 }, { t: sc[2].sceneStart + 1.9, sfx: 'pop', gain: -10 },
  { t: sc[3].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[3].sceneStart + 1.1, sfx: 'pop', gain: -10 }, { t: sc[3].sceneStart + 1.5, sfx: 'pop', gain: -11 },
  { t: sc[4].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[4].sceneStart + .45, sfx: 'pop', gain: -12 }, { t: sc[4].sceneStart + .8, sfx: 'pop', gain: -12 }, { t: sc[4].sceneStart + 1.6, sfx: 'stamp', gain: -8 },
  { t: sc[5].sceneStart - .15, sfx: 'whoosh', gain: -12 },
];
