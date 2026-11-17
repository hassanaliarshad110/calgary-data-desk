/* 2026-11-17 PM fun fact: "Calgary's top predator lives in the city: the coyote"
 * Lead identity: Data Explainer (kinetic hook, stamp, chips, counter, fast cuts); borrows a Storyteller night map dive over
 * real Calgary geography (S0, S1) and Civic Analyst step cards (S4).
 * Every on-screen figure maps to the audited claims table in packages/2026-11-17-PM-coyotes-all-over.md (claim numbers in comments).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DUR = (typeof PARAMS !== 'undefined' && PARAMS.durs) ? PARAMS.durs.split(',').map(Number) : [2.6, 3.6, 2.0, 3.6, 4.6, 3.6];   // measured Kokoro line durations (durs.json)
const S = M.script([
  { text: "Calgary's top predator lives right here in the city.", dur: DUR[0] },
  { text: "It's the coyote, and the City says they're found all over Calgary.", dur: DUR[1] },
  { text: 'They help keep rodents in check.', dur: DUR[2] },
  { text: 'In short bursts, they can run up to sixty-four kilometres an hour.', dur: DUR[3] },
  { text: "If one approaches, don't run. Shout, wave your arms and back away slowly.", dur: DUR[4] },
  { text: 'Seen one? Yes or no? Drop your thoughts below.', dur: DUR[5] },
], { lead: .25, gap: .22, tail: .21 });   // tail .21: closing line (3.78 s after atempo 1.10) to last frame = 3.99 s (PLAYBOOK 3)
const sc = S.scenes;
const SRC = 'Source: City of Calgary, Urban coyotes (updated Nov 4, 2026)';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const GOLD = '#f2b632', GREEN = '#5fbf6a', FUR = '#a0643a', FUR2 = '#6e4026', BELLY = '#d1a477', EYE = '#ffd23f';
const THUMB = typeof PARAMS !== 'undefined' && PARAMS.thumb;
const NAVY = { land: '#122848', park: '#17364a', water: '#2f6fa6', building: '#3b5378', road: '#2b4670', motorway: '#3f5f8f', lrt: '#5a6f90', community: '#9fb0c8' };
const DT = M.geo.lm('Calgary Tower') || [0, 0, 0];

const bg = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#081428'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const band = (c, y0, y1, a = .72) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.16, `rgba(7,13,24,${a})`); g.addColorStop(.84, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
const north = c => M.text(c, 'N ↑', 940, 300, { size: 34, weight: 700, align: 'right', color: '#dfe7f2', stroke: 4, strokeColor: '#06101f' });
function stamp(c, s, y, k, o = {}) { if (k <= 0) return; c.save(); c.translate(o.x ?? CX, y); c.rotate(o.rot ?? -.04); const z = M.lerp(1.8, 1, k); c.scale(z, z); c.globalAlpha = Math.min(1, k * 1.5);
  const sz = o.size || 110; c.font = M.font(sz, 800); const tw = c.measureText(s).width + 90, hh = sz * 1.5; M.rr(c, -tw / 2, -hh / 2, tw, hh, 24); c.fillStyle = 'rgba(7,13,24,.88)'; c.fill(); c.lineWidth = 8; c.strokeStyle = o.color || GOLD; c.stroke();
  M.text(c, s, 0, -sz * .56, { size: sz, weight: 800, align: 'center', color: o.textColor || '#fff' }); c.restore(); }

/* The coyote (continuity: same proportions in every scene, facing right). Drawn from the City's "Coyote facts" (C6):
 * reddish-brown fur, bushy tail with a black tip, large ears, yellow eyes. Ground at y = 0, nose at about x = +225.
 * gait: 'stand' | 'trot' | 'run'; t drives the leg cycle; glow adds the low-light eye shine. */
function coyote(c, x, y, s, t, o = {}) {
  const gait = o.gait || 'trot', run = gait === 'run', f = run ? 11 : gait === 'trot' ? 7 : 0, ph = t * f;
  const bob = gait === 'stand' ? 0 : Math.abs(Math.sin(ph)) * (run ? 10 : 5);
  c.save(); c.translate(x, y); c.scale(s * (o.flip ? -1 : 1), s); c.translate(0, -bob);
  const sil = o.silhouette, col = k => sil ? (o.silColor || '#050b16') : k;
  const leg = (lx, ang, back) => { c.save(); c.translate(lx, -92); c.rotate(ang); c.fillStyle = col(back ? FUR2 : FUR); M.rr(c, -9, 0, 18, 58, 8); c.fill();
    c.translate(0, 54); c.rotate(-ang * .6); M.rr(c, -7, 0, 14, 44, 6); c.fill(); c.fillStyle = col('#3a2416'); c.fillRect(-8, 38, 20, 8); c.restore(); };
  const sw = run ? .75 : .42;
  // far legs (darker)
  leg(-92, Math.sin(ph + Math.PI) * sw * (f ? 1 : 0), true); leg(58, Math.sin(ph) * sw * (f ? 1 : 0), true);
  // tail: bushy, low, black tip (C6)
  const tw = Math.sin(t * 3) * .06 + (run ? -.25 : 0);
  c.save(); c.translate(-118, -128); c.rotate(.55 + tw); c.fillStyle = col(FUR2); c.beginPath(); c.ellipse(-70, 0, 82, 26, 0, 0, 7); c.fill();
  c.fillStyle = col('#111'); c.beginPath(); c.ellipse(-138, 0, 22, 19, 0, 0, 7); c.fill(); c.restore();
  // body
  c.fillStyle = col(FUR); c.beginPath(); c.ellipse(-20, -128, run ? 135 : 122, 44, run ? -.03 : 0, 0, 7); c.fill();
  if (!sil) { c.fillStyle = BELLY; c.beginPath(); c.ellipse(-10, -100, 95, 16, 0, 0, 7); c.fill(); c.fillStyle = FUR2; c.beginPath(); c.ellipse(-35, -160, 95, 12, 0, 0, 7); c.fill(); }
  // neck + head
  c.fillStyle = col(FUR); c.beginPath(); c.moveTo(60, -160); c.lineTo(122, run ? -200 : -222); c.lineTo(160, run ? -180 : -200); c.lineTo(110, -100); c.closePath(); c.fill();
  const hy = run ? -192 : -214;
  c.beginPath(); c.ellipse(148, hy, 40, 31, 0, 0, 7); c.fill();
  c.beginPath(); c.moveTo(168, hy - 14); c.lineTo(228, hy + 8); c.lineTo(222, hy + 16); c.lineTo(165, hy + 22); c.closePath(); c.fill();   // snout
  c.fillStyle = col('#111'); c.beginPath(); c.arc(224, hy + 10, 7, 0, 7); c.fill();                                                        // nose
  // ears (large for the body, C6)
  c.fillStyle = col(FUR2); c.beginPath(); c.moveTo(122, hy - 18); c.lineTo(128, hy - 82); c.lineTo(150, hy - 24); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(144, hy - 24); c.lineTo(160, hy - 86); c.lineTo(174, hy - 20); c.closePath(); c.fill();
  if (!sil) { c.fillStyle = BELLY; c.beginPath(); c.moveTo(120, hy + 10); c.lineTo(150, hy + 30); c.lineTo(176, hy + 18); c.closePath(); c.fill(); }
  // eye (yellow, sees well in low light, C6)
  const blink = o.blink == null ? 1 : o.blink;
  if (o.glow) { const g = c.createRadialGradient(172, hy - 6, 0, 172, hy - 6, 34); g.addColorStop(0, `rgba(255,210,63,${.75 * blink})`); g.addColorStop(1, 'rgba(255,210,63,0)'); c.fillStyle = g; c.beginPath(); c.arc(172, hy - 6, 34, 0, 7); c.fill(); }
  c.fillStyle = EYE; c.beginPath(); c.ellipse(172, hy - 6, 7.5, 7.5 * Math.max(.08, blink), 0, 0, 7); c.fill();
  if (!sil) { c.fillStyle = '#111'; c.beginPath(); c.arc(174, hy - 6, 3 * Math.max(.1, blink), 0, 7); c.fill(); }
  // near legs
  leg(-70, Math.sin(ph) * sw * (f ? 1 : 0), false); leg(80, Math.sin(ph + Math.PI) * sw * (f ? 1 : 0), false);
  c.restore();
}
function mouse(c, x, y, s, t, a) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s); c.fillStyle = '#8a8f99';
  c.beginPath(); c.ellipse(0, -18, 34, 18, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(32, -22, 15, 12, 0, 0, 7); c.fill();
  c.beginPath(); c.arc(26, -36, 8, 0, 7); c.fill(); c.strokeStyle = '#8a8f99'; c.lineWidth = 4; c.beginPath(); c.moveTo(-32, -14); c.quadraticCurveTo(-60, -30 + Math.sin(t * 12) * 6, -78, -10); c.stroke();
  c.fillStyle = '#111'; c.beginPath(); c.arc(40, -24, 2.6, 0, 7); c.fill(); c.restore(); }
function ridge(c, top = 1190, col = '#050b16') { c.fillStyle = col; c.beginPath(); c.moveTo(-20, H); c.lineTo(-20, top + 30); c.bezierCurveTo(260, top - 30, 640, top + 40, W + 20, top - 10); c.lineTo(W + 20, H); c.closePath(); c.fill(); }
const ridgeY = (x, top = 1190) => { const u = (x + 20) / (W + 40); const p0 = top + 30, p1 = top - 30, p2 = top + 40, p3 = top - 10; const v = 1 - u; return v * v * v * p0 + 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u * p3; };
function nightMap(w, o = {}) {
  M.geo.addBase(w, { buildings: o.buildings ?? false, colors: NAVY, communities: !!o.communities, lineAlpha: 0, riverW: 110 });
  const g = M.geo.get(); if (!g) return;
  if (o.parksK != null && g.parks) g.parks.forEach(pk => pk.polys.forEach(poly => { const r = poly[0] || poly, x = r[0][0]; const k = o.parksK(x); if (k > 0) w.area(poly, { fill: GREEN, alpha: .55 * k, order: -5 }); }));
  if (o.commK != null && g.communities) g.communities.items.forEach(it => it.polys.forEach(poly => { const r = poly[0], x = r[0][0]; const k = o.commK(x); if (k > 0) w.area(poly, { fill: '#ffffff', alpha: .06 * k, stroke: '#ffffff', strokeAlpha: .55 * k, sw: 2, order: 3 }); }));
}
const sweepK = (t, t0, t1) => x => M.seg(t, t0 + (x + 22000) / 44000 * (t1 - t0) * .7, t0 + (x + 22000) / 44000 * (t1 - t0) * .7 + .35);

window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  // 0 HOOK (WHO/WHERE): frame 0 already diving over the real city map at night; coyote already trotting in on the ridge, eyes shining (C1, C6, C7)
  { dur: sc[0].sceneDur, trans: { kind: 'zoom', dur: .4 }, draw: (c, t) => {
      const D = sc[0].sceneDur, w = M.world({ sky: 'night', fog: { near: 30000, far: 90000, max: .35 } });
      nightMap(w, { buildings: true });
      w.render(c, M.camera(M.moves.dive([DT[0], DT[1] - 3000, 0], THUMB ? .5 : .1 + .8 * M.seg(t, 0, D, 'outCubic'), { h0: 52000, h1: 16000, back0: 1, back1: 15000, ahead: 3000 }), W, H));
      ridge(c);
      const cx = THUMB ? 330 : M.lerp(60, 400, M.seg(t, 0, D + .3, 'linear'));
      coyote(c, cx, ridgeY(cx + 60) + 8, 1.45, t, { gait: THUMB ? 'stand' : 'trot', glow: true, blink: THUMB ? 1 : (t < .3 ? .15 : M.seg(t, .3, .45)) });
      if (THUMB) return;
      band(c, 250, 760, .66);
      M.kinetic(c, "Calgary's top predator?", t, CX, 330, { t0: -.12, size: 136, maxW: 880, every: .1, highlight: ['predator?'] });   // C1 (question, answered in S1)
      north(c); M.source(c, MAPC, 60, 1466, { size: 20 });
  } },
  // 1 REVEAL + WHERE: whole city from above; parks light green, then communities light white in a west-to-east sweep; COYOTE name card (C1, C2, C7)
  { dur: sc[1].sceneDur, trans: { kind: 'push', dur: .35 }, draw: (c, t) => {
      const D = sc[1].sceneDur, w = M.world({ sky: 'night', fog: { near: 60000, far: 140000, max: .3 } });
      nightMap(w, { parksK: sweepK(t, .2, 1.6), commK: sweepK(t, 1.0, 2.6) });
      w.render(c, M.camera(M.moves.orbit([DT[0], DT[1] - 2000, 0], 30000, 52000, 268, 10, M.seg(t, 0, D, 'inOutSine')), W, H));
      ridge(c, 1250); coyote(c, 190, ridgeY(250, 1250) + 6, 1.0, t, { gait: 'stand', glow: true });
      band(c, 230, 700, .74);
      stamp(c, 'COYOTE', 380, M.seg(t, .05, .35, 'outBack'), { size: 130, rot: -.03 });                                                      // C1
      M.chip(c, 'FOUND ALL OVER CALGARY', CX, 560, { align: 'center', size: 52, bg: GOLD, color: '#06101f', alpha: M.seg(t, 1.2, 1.6) });   // C2
      M.chip(c, 'parks', 660, 930, { size: 40, bg: GREEN, color: '#06101f', alpha: M.seg(t, .6, .9) });
      M.chip(c, 'neighbourhoods', 660, 1010, { size: 40, bg: '#ffffff', color: '#06101f', alpha: M.seg(t, 1.7, 2.0) });                     // C2 ("park environments and urban areas")
      north(c); M.source(c, MAPC, 60, 1430, { size: 20 }); M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 2 ROLE (HOW IT FITS): food chain: coyote on top, arrow down, rodents scurry and thin out (C1, C3)
  { dur: sc[2].sceneDur, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {
      bg(c);
      stamp(c, 'TOP PREDATOR', 360, M.seg(t, 0, .3, 'outBack'), { size: 104 });                                                             // C1
      c.save(); M.rr(c, 170, 470, 740, 380, 36); c.fillStyle = 'rgba(242,182,50,.12)'; c.fill(); c.lineWidth = 6; c.strokeStyle = GOLD; c.stroke(); c.restore();
      coyote(c, 430, 800, 1.05, t, { gait: 'stand', glow: true });
      const ak = M.seg(t, .3, .7, 'outCubic'); c.save(); c.strokeStyle = GOLD; c.fillStyle = GOLD; c.lineWidth = 12; c.beginPath(); c.moveTo(CX, 870); c.lineTo(CX, 870 + 120 * ak); c.stroke();
      if (ak > .9) { c.beginPath(); c.moveTo(CX - 30, 975); c.lineTo(CX + 30, 975); c.lineTo(CX, 1010); c.closePath(); c.fill(); } c.restore();
      [[200, 0], [360, .15], [520, .3], [680, .45], [840, .6]].forEach(([x, d], i) => { const fade = i % 2 ? M.seg(t, .9 + d, 1.4 + d) : 0;
        mouse(c, x + Math.sin(t * 6 + i) * 18 + (i % 2 ? fade * 120 : 0), 1110, 1.25, t + i, M.seg(t, .4 + d * .5, .6 + d * .5) * (1 - fade)); });
      M.chip(c, 'KEEPS RODENTS IN CHECK', CX, 1160, { align: 'center', size: 52, bg: GREEN, color: '#06101f', alpha: M.seg(t, .8, 1.1) });  // C3
      M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 3 SPEED (HOW MUCH): coyote at full run over a moving ground strip; counter rolls 0 -> 64 km/h and slams; SHORT DISTANCES chip (C4)
  { dur: sc[3].sceneDur, trans: { kind: 'flash', dur: .25 }, draw: (c, t) => {
      const D = sc[3].sceneDur; const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(.55, '#3b3555'); g.addColorStop(.62, '#2a2a33'); g.addColorStop(1, '#14161c'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      // ground strip and speed lines (scroll right-to-left: the coyote runs right)
      c.fillStyle = '#20232b'; c.fillRect(0, 1140, W, 300);
      const sp = 1400 * M.seg(t, 0, 1.2, 'inCubic') + 900;
      c.strokeStyle = 'rgba(223,231,242,.35)'; c.lineWidth = 5; for (let i = 0; i < 14; i++) { const x = ((i * 160 - t * sp) % (W + 200) + W + 200) % (W + 200) - 100; c.beginPath(); c.moveTo(x, 1160 + (i % 3) * 40); c.lineTo(x + 90, 1160 + (i % 3) * 40); c.stroke(); }
      const r = M.rng(3); for (let i = 0; i < 8; i++) { const y = 900 + r() * 220, x = ((r() * W - t * sp * 1.3) % W + W) % W; c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 140, y); c.stroke(); }
      coyote(c, 420, 1150, 1.4, t, { gait: 'run', glow: true });
      band(c, 250, 860, .7);
      const p = M.seg(t, .5, 1.9, 'outCubic');
      M.text(c, 'UP TO', CX, 300, { size: 52, weight: 800, align: 'center', color: '#dfe7f2', alpha: M.seg(t, .3, .6) });                    // C4
      M.counter(c, 64, p, CX - 70, 370, { size: 230, slam: true, ease: 'linear' });                                                         // C4
      M.text(c, 'km/h', CX + 165, 500, { size: 80, weight: 800, color: GOLD, alpha: M.seg(t, .5, .8) });                                    // C4
      // arc that fills with the counter (no scale marks)
      c.save(); c.lineCap = 'round'; c.lineWidth = 18; c.strokeStyle = 'rgba(223,231,242,.2)'; c.beginPath(); c.arc(CX, 560, 330, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      c.strokeStyle = GOLD; c.beginPath(); c.arc(CX, 560, 330, Math.PI * 1.1, Math.PI * (1.1 + .8 * p)); c.stroke(); c.restore();
      M.chip(c, 'SHORT DISTANCES', CX, 690, { align: 'center', size: 52, bg: GREEN, color: '#06101f', alpha: M.seg(t, 1.9, 2.3) });           // C4
      M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 4 TIP (HOW TO REACT): three step cards slam in on the words (C5)
  { dur: sc[4].sceneDur, trans: { kind: 'dissolve', dur: .4 }, draw: (c, t) => {
      bg(c);
      M.text(c, 'IF ONE APPROACHES', CX, 250, { size: 64, weight: 800, align: 'center', color: GOLD, alpha: M.seg(t, 0, .3) });                 // C5
      const L = sc[4].speech, steps = [['1', "DON'T RUN", .25 * L], ['2', 'SHOUT + WAVE YOUR ARMS', .45 * L], ['3', 'BACK AWAY SLOWLY', .72 * L]];
      steps.forEach(([n, s, t0], i) => { const k = M.seg(t, t0, t0 + .3, 'outBack'); if (k <= 0) return; const y = 340 + i * 215;
        c.save(); c.translate(CX + (1 - k) * 400, y); c.globalAlpha = Math.min(1, k * 2); M.rr(c, -420, 0, 840, 200, 28); c.fillStyle = 'rgba(16,40,72,.95)'; c.fill(); c.lineWidth = 5; c.strokeStyle = i === 0 ? '#ff6b5b' : GOLD; c.stroke();
        c.fillStyle = i === 0 ? '#ff6b5b' : GOLD; c.beginPath(); c.arc(-330, 100, 54, 0, 7); c.fill(); M.text(c, n, -330, 100, { size: 72, weight: 800, align: 'center', base: 'middle', color: '#06101f', shadow: false });
        M.text(c, s, 40, s.length > 12 ? 62 : 100, { size: 72, weight: 800, align: 'center', base: 'middle', color: '#fff', maxW: 620, lh: 1.0 }); c.restore(); });
      ridge(c, 1210, '#050b16'); coyote(c, 150, ridgeY(200, 1210) + 6, .72, t, { gait: 'stand', glow: true });
      M.source(c, SRC, 60, 1466, { size: 20 });
  } },
  // 5 QUESTION: one-word answer, held ~1.4 s after the voice; no end card (video under 2:00)
  { dur: sc[5].sceneDur, draw: (c, t) => {
      c.fillStyle = M.house.navy; c.fillRect(0, 0, W, H);
      const p = M.seg(t, 0, sc[5].sceneDur, 'linear');
      c.save(); const mg = c.createRadialGradient(820, 1470, 0, 820, 1470, 150); mg.addColorStop(0, 'rgba(255,244,214,.9)'); mg.addColorStop(.5, 'rgba(255,244,214,.5)'); mg.addColorStop(1, 'rgba(255,244,214,0)'); c.fillStyle = mg; c.beginPath(); c.arc(820, 1470, 150, 0, 7); c.fill(); c.restore();
      ridge(c, 1600, '#050b16'); coyote(c, 380, ridgeY(440, 1600) + 6, 1.0, t, { gait: 'stand', silhouette: true, glow: true });
      M.closer(c, 'Seen one? Yes or no?', p, W, H, { highlight: ['yes', 'no?'] });
  } },
], overlay: (c, t, info) => {
  if (THUMB) return;
  if (t > 3 && info.index < 5) M.header(c, window.LOGO, W, H);
  if (S.total > 25 && info.index < 5) M.followPill(c, M.seg(t, S.total / 2 - 1, S.total / 2 + 1, 'linear'), W, H);
  if (info.index < 5) M.caption(c, S.captionAt(t), W, H, { bottom: 1410 });
} });

window.CUES = () => [
  { t: 0.0, sfx: 'impact', gain: -5 }, { t: .2, sfx: 'whoosh', gain: -11 }, { t: .35, sfx: 'pop', gain: -12 },
  { t: sc[1].sceneStart - .2, sfx: 'whoosh', gain: -10 }, { t: sc[1].sceneStart + .1, sfx: 'stamp', gain: -8 }, { t: sc[1].sceneStart + .7, sfx: 'pop', gain: -13 },
  { t: sc[1].sceneStart + 1.3, sfx: 'pop', gain: -12 }, { t: sc[1].sceneStart + 1.8, sfx: 'pop', gain: -13 },
  { t: sc[2].sceneStart - .2, sfx: 'whoosh', gain: -9 }, { t: sc[2].sceneStart + .05, sfx: 'stamp', gain: -8 }, { t: sc[2].sceneStart + .5, sfx: 'pop', gain: -14 },
  { t: sc[2].sceneStart + .9, sfx: 'pop', gain: -12 },
  { t: sc[3].sceneStart - .1, sfx: 'whoosh', gain: -10 }, { t: sc[3].sceneStart + .5, sfx: 'ticks', dur: 1.4, gain: -19 }, { t: sc[3].sceneStart + 1.9, sfx: 'impact', gain: -6 },
  { t: sc[3].sceneStart + 2.0, sfx: 'pop', gain: -12 },
  { t: sc[4].sceneStart - .2, sfx: 'whoosh', gain: -12 },
  { t: sc[4].sceneStart + .25 * sc[4].speech, sfx: 'stamp', gain: -9 }, { t: sc[4].sceneStart + .45 * sc[4].speech, sfx: 'stamp', gain: -9 }, { t: sc[4].sceneStart + .72 * sc[4].speech, sfx: 'stamp', gain: -9 },
  { t: sc[5].sceneStart - .15, sfx: 'whoosh', gain: -12 },
];
window.TOTAL = () => S.total;
