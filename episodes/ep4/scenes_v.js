// ===== GTA 6 Special #1 — native 9:16 recompositions (DRAWV) used by shorts.py.
// Needs shorts_v.js (DRAWV, CX, bannerV, overlays). Safe zone: key content x 40..940, y 250..1200 (+1480..1600), captions own y 1250..1450.
function timelineV(active) { const ys = ['1997', '2016', '2018', '2019']; line(120, 300, 860, 300, '#3A4560', 6); ys.forEach((y, i) => withT(150 + i * 230, 300, 1, 0, () => { P(rr(-85, -36, 170, 72, 36), i <= active ? C.amber : '#2A3245', C.ink, 4); txt(y, 0, 3, 42, i <= active ? C.ink : C.grey); })); }
function chipV(s, x, y, k, col = C.green2, size = 38, fg = C.ink) { if (k <= 0) return; withT(x, y, k, 0, () => { ctx.font = `700 ${size}px Oswald`; const w = Math.min(880, ctx.measureText(s).width + 50); P(rr(-w / 2, -size * 0.95, w, size * 1.9, size * 0.95), col, C.ink, 4); txt(s, 0, 2, size, fg); }); }
function magnifier(x, y, s = 1) { withT(x, y, s, 0.2, () => { ctx.strokeStyle = C.amber; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, 0, 110, 0, 6.283); ctx.stroke(); alpha(0.15, () => P(circ(0, 0, 104), '#fff', null)); line(80, 80, 200, 200, C.amber, 22); }); }

// ---------- Part 2 ----------
DRAWV.quarter = (t, d) => {
  const two = after('n16', -0.1);
  fillAll('#0E1424'); glow(CX, 800, 800, TEAL, 0.1);
  if (!two) {
    depth([{ z: 0.1, haze: 1, draw: () => { sky('#0A1020', '#16223C'); bokeh(t, 14, '#3A7BD5', 3); } },
      { z: 0.6, draw: () => { deskRow(t, 1120, 2, 300, 440, 1.0); } }], drift(t, d, 20), 0, lerp(1.0, 1.05, ease(t / d)));
    withT(CX, 520, back(seg(t, 0.8, 1.2)), 0, () => { glow(0, 0, 340, C.amber, 0.35); txtStroke('~' + fmt(cnt(t, 0.8, 1.8, 1615)), 0, 0, 210, C.amber, C.ink, 18); txt('ROCKSTAR INDIA', 0, 140, 56, C.white); txt('DEVELOPERS (DAAWA)', 0, 200, 40, C.grey, 'Oswald', 600); });
    tag('THE WEEK KE MUTABIQ', 40, 270, 30, C.amber);
  } else {
    const u = lt('n16') + 0.1;
    for (let i = 0; i < 4; i++) { const k = back(seg(u, i * 0.2, i * 0.2 + 0.35)); if (k <= 0) continue; withT(i % 2 ? 690 : 290, i < 2 ? 470 : 860, k, 0, () => { const on = i == 3; if (on) glow(0, 0, 220, C.amber, 0.5); peopleIcon(0, 40, 290, on ? C.amber : '#3A4A6A'); if (on) tag('BENGALURU', -110, 230, 34, C.ink, C.amber); }); }
    txtStroke('HAR 4 MEIN SE 1', CX, 1150, 92, C.white, C.ink, 12);
  }
  vignette();
};
DRAWV.check = (t, d) => {
  const two = after('n19', -0.1);
  fillAll('#121A2A'); paperTex(0, 0, W, H, 21); ctx.fillStyle = 'rgba(10,14,26,0.7)'; ctx.fillRect(0, 0, W, H);
  if (!two) {
    depth([{ z: 0.6, draw: () => reportCard(CX, 600, 1.4, 'REPORT: ~1,615 DEVS', 'SABSE BADI TEAM', -0.03) }], drift(t, d, 14), 0, 1.02);
    magnifier(lerp(260, 640, ease(seg(t, 0.4, 2.0))), 640, 1.0);
    const a = LINES.n18.dur * 0.32, b = LINES.n18.dur * 0.62;
    chipV('SOURCE: ?', CX, 960, back(seg(t, a, a + 0.35)), C.red, 56, C.white);
    chipV('ROCKSTAR KI PUSHTI: NAHI MILI', CX, 1110, back(seg(t, b, b + 0.35)), '#2A3245', 40, C.amber);
  } else {
    const u = lt('n19') + 0.1; const by = 1130;
    line(120, by, 900, by, C.white, 5);
    const k1 = easeOut(seg(u, 0.4, 1.4)), k2 = easeOut(seg(u, LINES.n19.dur * 0.35, LINES.n19.dur * 0.35 + 1));
    P(rr(170, by - 250 * k1, 260, 250 * k1, 8), '#3A7BD5', C.ink, 5); if (k2 > 0) P(rr(170, by - 250 - 150 * k2, 260, 150 * k2, 8), TEAL, C.ink, 5);
    if (k1 > 0.5) txt('~500', 300, by - 125, 56, C.white); if (k2 > 0.5) txt('+300 DHRUVA', 300, by - 325, 38, C.ink);
    txt('2019', 300, by + 44, 44, C.grey);
    const k3 = easeOut(seg(u, LINES.n19.dur * 0.55, LINES.n19.dur * 0.55 + 1.2)); ctx.setLineDash([16, 12]); if (k3 > 0) P(rr(560, by - 650 * k3, 260, 650 * k3, 8), 'rgba(244,208,111,0.15)', C.amber, 5); ctx.setLineDash([]);
    if (k3 > 0.6) { txt('~1,615?', 690, by - 690, 56, C.amber); txt('2025 · DAAWA', 690, by + 44, 40, C.amber); }
    tag('GAMESPOT (2019) KE MUTABIQ', 40, 270, 30, C.amber);
    if (u > LINES.n19.dur * 0.75) stamp('SABSE BADI? SIRF DAAWA', CX, 1560, 46, C.red, u - LINES.n19.dur * 0.75, 0.04);
  }
  vignette();
};
// ---------- Part 1 ----------
DRAWV.y1997 = (t, d) => {
  const two = after('n08', -0.1);
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#1A1408', '#2E2210'); paperTex(0, 0, W, H, 3); } },
    { z: 0.55, draw: () => { lightPool(CX, 900, 520, C.amber, 0.3); desk(640, 1000, 560); withT(700, 900, 1.2, 0, () => { P(rr(-150, -200, 300, 240, 22), '#D9D2BE', C.ink, 6); P(rr(-120, -175, 240, 175, 12), '#10261A', C.ink, 4); for (let j = 0; j < 5; j++) if (rnd(j) < seg(t, 0.4 + j * 0.4, 0.6 + j * 0.4) + 0.01) txt('> ' + ['RUN GAME.EXE', 'LOADING…', 'SPRITE OK', 'LEVEL 1', 'HELLO WORLD'][j], -105, -150 + j * 30, 20, '#4BFF8A', 'Inter', 600, 'left'); P(rr(-110, 40, 220, 40, 6), '#C9C2AE', C.ink, 4); });
      shadow(300, 1200, 150); person(300, 1200, 'prog', { t, s: 1.6, look: 0.8, mood: 0.6, arms: [[0.3, 0.2], [-1.0, -0.9]] }); } },
  ], drift(t, d, 20), 0, lerp(1.0, 1.06, ease(t / d)));
  timelineV(0);
  banner('1997 · BENGALURU', 'RAJESH RAO · DHRUVA INTERACTIVE', 40, 430, t - 0.3, C.amber);
  if (two) stamp("'PEHLA GAME STUDIO'", CX, 1530, 52, C.red, lt('n08'), -0.04), alpha(seg(lt('n08'), 0.3, 0.6), () => txt('MAANA JAATA HAI', CX, 1610, 36, C.amber));
  alpha(seg(t, 0.5, 0.9), () => tag('SANKETIK CHITRAN', 40, 560, 22, C.grey));
  vignette();
};
DRAWV.y2016 = (t, d) => {
  const two = after('n10', -0.1);
  depth([
    { z: 0.05, haze: 1, draw: () => nightCity(t, 5) },
    { z: 0.5, draw: () => { lightPool(CX, 1000, 520, C.amber, 0.22); studio(CX, 1200, 0.95, 'ROCKSTAR INDIA', t); } },
  ], drift(t, d, 24), 0, lerp(1.0, 1.06, ease(t / d)));
  timelineV(two ? 2 : 1);
  if (two) withT(CX, 560, back(seg(lt('n10'), 0.3, 0.7)), 0.03, () => reportCard(0, 0, 1.25, '2018 · RED DEAD REDEMPTION 2', 'TEAM MEIN: ROCKSTAR INDIA', 0, '#F2EEE3', C.red2));
  else banner('2016', 'ROCKSTAR GAMES KA BENGALURU STUDIO', 40, 430, t - 0.3, C.amber);
  vignette();
};
DRAWV.deal = (t, d) => {
  const two = after('n12', -0.1);
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#0E1424', '#1A2440'); bokeh(t, 14, C.amber, 9); } },
    { z: 0.5, draw: () => { if (two) return; lightPool(CX, 900, 520, C.amber, 0.28); desk(CX, 1000, 760); moneyStack(330, 1000, 8, 1.8); moneyStack(650, 1000, 6, 1.8);
      shadow(170, 1200, 110); person(170, 1200, 'ceo', { t, s: 1.15, look: 0.8, mood: 0.6, arms: [[0.2, 0.2], [-1.2, -0.3]] });
      shadow(810, 1200, 110); person(810, 1200, 'prog', { t: t + 1, s: 1.15, look: -0.8, mood: 0.5, flip: true, arms: [[0.2, 0.2], [-1.2, -0.3]] }); } }], drift(t, d, 20), 0, lerp(1.0, 1.05, ease(t / d)));
  timelineV(3);
  if (!two) {
    const p = LINES.n11.dur * 0.62;
    chipV('~92% HISSEDAARI', CX, 470, back(seg(t, 1.4, 1.8)), '#2A3245', 50, C.amber);
    if (t > p) priceTag(CX, 700, 0.95, '$7.9 MILLION', '79 LAKH $', C.green2, -0.06);
    alpha(seg(t, 0.5, 0.9), () => tag('SANKETIK CHITRAN', 40, 1500, 22, C.grey));
  } else {
    const u = lt('n12'); const n = Math.floor(lerp(0, 300, easeOut(seg(u, 0.2, 2.6))));
    for (let i = 0; i < n; i++) { const c = i % 20, r = Math.floor(i / 20); peopleIcon(110 + c * 40, 420 + r * 46, 30, i % 7 == 0 ? C.amber : TEAL); }
    txtStroke('~' + n + ' LOG', CX, 1150, 96, C.white, C.ink, 10);
    if (u > 3.2) stamp('AB ROCKSTAR KA HISSA', CX, 1540, 52, C.amber, u - 3.2, -0.04);
  }
  vignette();
};
// ---------- Part 3 ----------
DRAWV.review = (t, d) => {
  const two = after('n24', -0.1);
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#07090F', '#141A28'); stars(50); } },
    { z: 0.55, draw: () => { withT(CX, 800, 1.05, -0.02, () => { shadow(0, 330, 360, 0.35); P(rr(-420, -330, 840, 660, 20), '#F2EEE3', C.ink, 6);
      P(circ(-340, -250, 42), '#9AA3B2', C.ink, 4); txt('?', -340, -248, 50, C.white); txt('GUMNAAM EMPLOYEE', -280, -266, 32, C.ink, 'Oswald', 700, 'left'); txt('QA ANALYST · BENGALURU', -280, -226, 24, '#555', 'Oswald', 600, 'left');
      for (let i = 0; i < 5; i++) txt('★', -350 + i * 52, -160, 50, i < 2 ? '#F2A900' : '#C9C2AE'); txt('1 MAY 2026', 300, -160, 30, '#555', 'Oswald', 600);
      const rows = [['5-6 MAHINE → 2-3 MAHINE', 0.3], ['BINA PAISE KA OVERTIME', LINES.n24.dur * 0.42], ['SUBAH SE RAAT 3 BAJE', LINES.n24.dur * 0.66]];
      if (!two) for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(30,30,30,0.3)'; ctx.fillRect(-350, -70 + i * 50, 580 + rnd(i) * 100, 14); }
      else rows.forEach(([s, a], i) => { const k = back(seg(lt('n24'), a, a + 0.3)); if (k > 0) withT(-350, -60 + i * 110, k, 0, () => { P(circ(0, 0, 22), C.red, C.ink, 3); txt(s, 40, 2, 44, C.ink, 'Oswald', 700, 'left'); }); }); }); } },
  ], drift(t, d, 14), 0, lerp(1.0, 1.04, ease(t / d)));
  if (two) { const u = lt('n24'); const hh = lerp(9, 27, easeOut(seg(u, LINES.n24.dur * 0.66, LINES.n24.dur * 0.66 + 1.5))); clockFace(800, 340, 100, Math.floor(hh) % 12, (hh % 1) * 60); if (hh >= 26.9) chipV('3 AM', 800, 480, 1, C.red, 40, C.white); }
  tag('AAROP · GUMNAAM REVIEW', 40, 290, 30, C.amber); alpha(0.9, () => txt('EASTERN EYE (4 MAY 2026)', 40, 350, 26, C.grey, 'Oswald', 600, 'left'));
  vignette();
};
DRAWV.sides = (t, d) => {
  const two = after('n27', -0.1);
  fillAll(C.bg); bokeh(t, 8, '#2A3A5A', 3); const tilt = (two ? -0.07 : 0.1) + wob(t, 0.4, 0.02);
  line(CX, 520, CX, 900, C.amber, 12); P(rr(CX - 100, 900, 200, 40, 8), C.amber, C.ink, 5);
  withT(CX, 540, 1, tilt, () => { line(-320, 0, 320, 0, C.amber, 12); for (const s of [-1, 1]) { line(s * 300, 0, s * 300 - 100, 220, C.ink, 4); line(s * 300, 0, s * 300 + 100, 220, C.ink, 4); P(ell(s * 300, 230, 140, 26), C.amber2, C.ink, 5); } });
  withT(CX - 300 * Math.cos(tilt), 540 - 300 * Math.sin(tilt) + 160, 1, 0, () => { P(rr(-150, -70, 300, 100, 12), C.paper, C.ink, 4); txt('AAROP', 0, -20, 44, C.ink); });
  withT(CX + 300 * Math.cos(tilt), 540 + 300 * Math.sin(tilt) + 160, 1, 0, () => { P(rr(-150, -70, 300, 100, 12), C.paper, C.ink, 4); txt('DOOSRA PAKSH', 0, -20, 40, C.ink); });
  const D = LINES.n26.dur;
  const chips = two ? [['REVIEW PAR JAWAAB: NAHI', 0.4], ['CEO (MAY): "ALL-NIGHTER NAHI"', LINES.n27.dur * 0.35], ['CRUNCH TAREEKA NAHI', LINES.n27.dur * 0.78]] : [['PUSHTI NAHI', D * 0.18], ['FARZI? KUCH LOG', D * 0.38], ['DOOSRE REVIEWS: BALANCE ACHHA', D * 0.62]];
  const base = two ? lt('n27') : t;
  chips.forEach(([s, a], i) => chipV(s, CX, 1010 + i * 80, back(seg(base, a, a + 0.3)), two ? C.amber : C.green, 32));
  banner(two ? 'COMPANY KA PAKSH' : 'DOOSRA PAKSH', two ? 'EASTERN EYE · BUSINESS INSIDER' : 'EASTERN EYE · 80.LV', 40, 290, t - 0.3, C.amber);
  vignette();
};
// ---------- Part 4 ----------
DRAWV.price = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1A0E22', '#2E1A40'); bokeh(t, 16, PINK, 23); } },
    { z: 0.6, draw: () => { const k1 = back(seg(t, 0.8, 1.2)), k2 = back(seg(t, LINES.n31.dur * 0.62, LINES.n31.dur * 0.62 + 0.4)); if (k1 > 0) withT(CX - 20, 640, k1, 0, () => priceTag(0, 0, 1.2, 'STANDARD EDITION', '₹5,999', C.amber, -0.06)); if (k2 > 0) withT(CX + 10, 1020, k2, 0, () => priceTag(0, 0, 1.2, 'ULTIMATE EDITION', '₹7,499', PINK, 0.05)); } }], drift(t, d, 20), 0, lerp(1.0, 1.05, ease(t / d)));
  banner('BHARAT MEIN KEEMAT', 'PLAYSTATION INDIA (BUSINESS TODAY)', 40, 290, t - 0.3, C.amber);
  vignette();
};
DRAWV.twist = (t, d) => {
  const drama = act('d02') || after('d02');
  depth([{ z: 0.05, haze: 1, draw: () => sky('#0A0D18', '#1A1430') },
    { z: 0.5, draw: () => { lightPool(660, 760, 420, '#7FB4FF', 0.25);
      withT(640, 760, 0.95, 0, () => { shadow(0, 260, 300, 0.4); P(rr(-200, -240, 160, 480, 30), '#F2F2F2', C.ink, 6); P(rr(-40, -200, 60, 400, 20), '#1A1E26', C.ink, 5); txt('CONSOLE', -120, 0, 30, '#888', 'Oswald', 700); P(rr(100, -200, 240, 420, 16), '#1A1E26', C.ink, 6); P(rr(140, -160, 160, 40, 6), '#2BD46A', null); txt('CONSOLE', 220, 120, 30, '#888', 'Oswald', 700); });
      shadow(230, 1200, 130); person(230, 1200, 'gamer', { t, s: 1.45, look: 0.9, mood: drama ? -0.8 : 0.3, brow: drama ? -1 : 0, talk: talk('d02'), arms: drama ? [[0.4, 0.2], [-2.2, -0.3]] : [[0.3, 0.2], [-0.3, -0.2]] }); } }], drift(t, d, 16), 0, lerp(1.0, 1.06, ease(t / d)));
  if (t < 1.0) alpha(1 - seg(t, 0.5, 1.0), () => { glow(CX, 760, 500, C.amber, 0.4); txtStroke('TWIST!', CX, 760, 190, C.amber, C.ink, 18); });
  const p = LINES.n32.dur * 0.62; const u = lt('n32');
  chipV('PS5', 560, 1080, back(seg(u, LINES.n32.dur * 0.25, LINES.n32.dur * 0.25 + 0.3)), C.green2, 34);
  chipV('XBOX SERIES X|S', 760, 1160, back(seg(u, LINES.n32.dur * 0.4, LINES.n32.dur * 0.4 + 0.3)), C.green2, 34);
  chipV('PC? ANNOUNCE NAHI', CX, 360, back(seg(u, p, p + 0.4)), C.red, 56, C.white);
  if (act('d02')) { alpha(0.85 * seg(lt('d02'), 0, 0.3), () => { P(rr(560, 250, 330, 46, 23), 'rgba(11,15,23,0.7)', null); txt('● NAATYA RUPANTAR', 725, 274, 24, C.amber, 'Oswald', 500); }); bubble('PAR CONSOLE?!', 300, 640, lt('d02'), 1, 46); }
  vignette();
};
DRAWV.ticket = (t, d) => {
  fillAll('#0E1424'); glow(CX, 760, 800, C.amber, 0.12);
  withT(CX, 760, 1.0, -0.02, () => { shadow(0, 420, 380, 0.4); P(rr(-420, -380, 840, 780, 14), '#F2EEE3', C.ink, 6); paperTex(-420, -380, 840, 780, 4);
    for (let i = 0; i < 20; i++) P(poly([-420 + i * 42, 400, -399 + i * 42, 380, -378 + i * 42, 400]), '#0E1424', null);
    txt('KHELNE KA BILL', 0, -320, 60, C.ink); line(-360, -270, 360, -270, C.ink, 3);
    [['PS5 DIGITAL', '₹64,990', 0.6], ['GTA 6 STANDARD', '₹5,999', 1.6]].forEach(([a, b, s], i) => { if (t > s) { txt(a, -360, -190 + i * 90, 42, C.ink, 'Oswald', 600, 'left'); txt(b, 360, -190 + i * 90, 50, C.ink, 'Oswald', 700, 'right'); } });
    if (t > 2.6) { line(-360, 0, 360, 0, C.ink, 4); txt('TOTAL', -360, 80, 60, C.ink, 'Oswald', 700, 'left'); txt('₹' + fmt(cnt(t, 2.6, 1.2, 70989)), 360, 80, 88, C.red, 'Oswald', 700, 'right'); }
    if (t > LINES.n33.dur * 0.68) withT(0, 250, back(seg(t, LINES.n33.dur * 0.68, LINES.n33.dur * 0.68 + 0.4)), 0.04, () => { P(rr(-300, -55, 600, 110, 55), C.amber, C.ink, 5); txt('CONSOLE ≈ 11× GAME', 0, 3, 56, C.ink); }); });
  tag('BUSINESS TODAY · 4 NOV 2026', 40, 290, 30, C.amber);
  vignette();
};

// ---------- spoken hook / closing scenes ----------
DRAWV.hook1 = (t, d) => {
  fillAll('#0E1424'); glow(CX, 760, 700, C.amber, 0.12); bokeh(t, 12, '#3A4A6A', 4);
  for (let i = 0; i < 4; i++) { const k = back(seg(t, 0.3 + i * 0.2, 0.65 + i * 0.2)); if (k <= 0) continue; withT(i % 2 ? 690 : 290, i < 2 ? 520 : 900, k, 0, () => { const on = i == 3; if (on) glow(0, 0, 220, C.amber, 0.5 + wob(t, 1, 0.1)); peopleIcon(0, 40, 280, on ? C.amber : '#3A4A6A'); }); }
  if (t > d * 0.55) chipV('SOURCE: ?', CX, 1150, back(seg(t, d * 0.55, d * 0.55 + 0.35)), C.red, 64, C.white);
  vignette();
};
DRAWV.end1 = (t, d) => { fillAll('#121A2A'); paperTex(0, 0, W, H, 21); ctx.fillStyle = 'rgba(10,14,26,0.6)'; ctx.fillRect(0, 0, W, H); reportCard(CX, 640, 1.4, 'REPORT: ~1,615 DEVS', 'DAAWA', -0.03); magnifier(lerp(300, 620, ease(seg(t, 0, d))), 680, 1); vignette(); };
DRAWV.hook2 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1A1408', '#2E2210'); paperTex(0, 0, W, H, 3); } },
    { z: 0.6, draw: () => { lightPool(CX, 800, 500, C.amber, 0.3); withT(CX, 820, 1.6, 0, () => { P(rr(-150, -200, 300, 240, 22), '#D9D2BE', C.ink, 6); P(rr(-120, -175, 240, 175, 12), '#10261A', C.ink, 4); txt('1997', 0, -90, 70, '#4BFF8A', 'Oswald', 700); P(rr(-110, 40, 220, 40, 6), '#C9C2AE', C.ink, 4); }); } }], 0, 0, lerp(1.0, 1.1, ease(t / d)));
  if (t > d * 0.6) priceTag(CX, 1130, 0.85, 'ROCKSTAR NE', 'KHAREEDA!', C.green2, -0.05);
  vignette();
};
DRAWV.end2 = (t, d) => { depth([{ z: 0.05, haze: 1, draw: () => nightCity(t, 5) }, { z: 0.5, draw: () => studio(CX, 1150, 0.95, 'ROCKSTAR INDIA', t) }], 0, 0, lerp(1.0, 1.06, ease(t / d))); vignette(); };
DRAWV.hook3 = (t, d) => {
  fillAll('#07090F'); stars(50); glow(CX, 760, 500, C.red, 0.15);
  const hh = lerp(21, 27, easeOut(seg(t, 0.2, d * 0.8))); clockFace(CX, 760, 230, Math.floor(hh) % 12, (hh % 1) * 60);
  if (hh >= 26.9) chipV('3 AM', CX, 1080, 1, C.red, 60, C.white);
  tag('AAROP · GUMNAAM REVIEW', 40, 290, 30, C.amber);
  vignette();
};
DRAWV.end3 = (t, d) => { fillAll(C.bg); const tilt = wob(t, 0.4, 0.06); line(CX, 520, CX, 900, C.amber, 12); P(rr(CX - 100, 900, 200, 40, 8), C.amber, C.ink, 5); withT(CX, 540, 1, tilt, () => { line(-320, 0, 320, 0, C.amber, 12); for (const s of [-1, 1]) P(ell(s * 300, 230, 140, 26), C.amber2, C.ink, 5); }); vignette(); };
DRAWV.hook4 = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => { sky('#1A0E22', '#2E1A40'); bokeh(t, 16, PINK, 23); } },
    { z: 0.6, draw: () => { glow(CX, 1000, 360, C.amber, 0.4); controller(CX, 1000, 1.6, t, '#20242E'); priceTag(CX, 560, 1.15, 'BHARAT MEIN', '₹5,999', C.amber, -0.06); } }], 0, 0, lerp(1.0, 1.08, ease(t / d)));
  vignette();
};
DRAWV.end4 = (t, d) => { fillAll('#0E1424'); glow(CX, 760, 800, C.amber, 0.12); withT(CX, 700, 1, -0.03, () => { P(rr(-380, -150, 760, 300, 20), C.red, C.ink, 6); txt('KHELNE KA TICKET', 0, -70, 50, C.white); txt('₹70,989', 0, 40, 130, C.white); }); vignette(); };
