// ===================== BONNIE & CLYDE — scenes (2.5D, sepia 1930s + neon 2026)
KINDS.bonnie = { body: '#A8323E', body2: '#86252F', skin: '#F3D2B3', hair: 'bob', hairCol: '#C9873E', h: 0.9, lips: true };
KINDS.bonnieY = { body: '#E9D9B5', body2: '#D3C29C', skin: '#F3D2B3', hair: 'bob', hairCol: '#C9873E', h: 0.7, lips: true };
KINDS.clyde = { body: '#3B3F4A', body2: '#2C3038', skin: '#F0C7A2', hair: 'short', tie: '#7A1E1E', h: 1 };
KINDS.clydeY = { body: '#5A6B7E', body2: '#485768', skin: '#F0C7A2', hair: 'short', h: 0.82 };
KINDS.roy = { body: '#6B5A43', body2: '#574834', skin: '#EEC49E', hair: 'short', h: 0.85 };
KINDS.emma = { body: '#2E2A36', body2: '#221F29', skin: '#EFC8A6', hair: 'bun', hairCol: '#8F8A86', h: 0.92 };
KINDS.lawman = { body: '#7A6A4E', body2: '#65573F', skin: '#E3B08A', hair: 'short', h: 1 };
KINDS.prisoner = { body: '#E8E2D2', body2: '#CFC7B3', skin: '#F0C7A2', hair: 'short', h: 1 };
const SEP1 = '#2A1D14', SEP2 = '#6E4A2C', SEPL = '#E9C891', DUSK1 = '#1B1730', DUSK2 = '#7A4A5E';
const NEON = '#FF4FA3', CYAN = '#3EE6FF';
function fedora(x, y, s = 1, col = '#2A2420') { withT(x, y, s, 0, () => { P(ell(0, 0, 78, 14), col, C.ink, 4); P(rr(-46, -48, 92, 50, [22, 22, 4, 4]), col, C.ink, 4); P(rr(-46, -14, 92, 12, 2), '#7A1E1E', null); }); }
function beret(x, y, s = 1, col = '#7A1E2A') { withT(x, y, s, -0.18, () => { P(ell(10, 0, 70, 24), col, C.ink, 4); P(circ(14, -24, 7), col, C.ink, 3); }); }
// people with hats: hat sits on the head (local coords from person's prop hook)
function bonnie(x, y, o = {}) { return person(x, y, o.young ? 'bonnieY' : 'bonnie', Object.assign({}, o, { prop: (hl, hr, top, hy) => { if (!o.young && o.hat !== false) beret(-6, hy - 44, 1); if (o.prop2) o.prop2(hl, hr, top, hy); } })); }
function clyde(x, y, o = {}) { return person(x, y, o.young ? 'clydeY' : 'clyde', Object.assign({}, o, { prop: (hl, hr, top, hy) => { if (!o.young && o.hat !== false) fedora(0, hy - 40, 0.82); if (o.prop2) o.prop2(hl, hr, top, hy); } })); }
function lawman(x, y, o = {}) { return person(x, y, 'lawman', Object.assign({}, o, { prop: (hl, hr, top, hy) => fedora(0, hy - 40, 0.84, '#C9B48A') })); }
function silhouette(x, y, s, col, hat) { withT(x, y, s, 0, () => { P(rr(-50, -230, 100, 160, 46), col, null); P(circ(0, -280, 48), col, null); line(-18, -70, -22, 0, col, 16); line(18, -70, 22, 0, col, 16); if (hat === 'fedora') { P(ell(0, -318, 76, 14), col, null); P(rr(-44, -364, 88, 48, 20), col, null); } if (hat === 'beret') { P(ell(10, -326, 64, 22), col, null); } if (hat === 'hair') { P(rr(-56, -330, 112, 140, 48), col, null); } }); }
function sepiaGrade(a = 0.35) { alpha(a, () => { ctx.fillStyle = '#5A3A1C'; ctx.globalCompositeOperation = 'multiply'; ctx.fillRect(0, 0, W, H); }); ctx.globalCompositeOperation = 'source-over'; }
function grain(t, n = 260, a = 0.07) { ctx.save(); ctx.globalAlpha = a; for (let i = 0; i < n; i++) { const k = Math.floor(t * 12); ctx.fillStyle = rnd(i + k * 31) > 0.5 ? '#fff' : '#000'; ctx.fillRect(rnd(i * 7 + k) * W, rnd(i * 13 + k * 3) * H, 2, 2); } ctx.restore(); }
function dust(t, n = 40, col = 'rgba(255,230,180,0.5)') { for (let i = 0; i < n; i++) { const x = (rnd(i) * W + t * 20 * (0.5 + rnd(i + 2))) % W, y = (rnd(i + 5) * H + Math.sin(t * 0.5 + i) * 20); alpha(0.2 + 0.3 * rnd(i + 9), () => P(circ(x, y, 1.5 + rnd(i + 1) * 2.5), col, null)); } }
function yearBadge(y, x, yy, t, col = SEPL) { const k = back(seg(t, 0.1, 0.45)); if (k <= 0) return; withT(x, yy, k, -0.04, () => { shadow(0, 60, 120, 0.3); P(rr(-130, -50, 260, 100, 14), col, C.ink, 5); txt(y, 0, 4, 64, C.ink, 'Oswald', 700); }); }
function texSky(t, warm = true) { sky(warm ? '#3A2418' : '#141A2E', warm ? '#D99A5B' : '#5A4A6A'); glow(1500, 700, 600, warm ? '#FFD38A' : '#FFB0A0', 0.35); }
function ground(y, col) { ctx.fillStyle = col; ctx.fillRect(-300, y, W + 600, H); }
function tree(x, y, s, col = '#1E140D', t = 0) { withT(x, y, s, wob(t, 0.15, 0.02), () => { line(0, 0, 0, -260, col, 26); line(0, -160, -90, -260, col, 14); line(0, -200, 80, -300, col, 12); for (let i = 0; i < 6; i++) P(circ(-100 + rnd(i) * 200, -300 - rnd(i + 3) * 120, 60 + rnd(i + 7) * 40), col, null); }); }
function house(x, y, s, col = '#8A6A4A', lit = false) { withT(x, y, s, 0, () => { P(rr(-120, -150, 240, 150, 2), col, C.ink, 4); P(poly([-140, -150, 0, -250, 140, -150]), '#5A3E28', C.ink, 4); P(rr(-30, -80, 60, 80, 2), '#3A2818', C.ink, 3); P(rr(50, -120, 44, 40, 2), lit ? '#FFD27A' : '#2A2018', C.ink, 3); P(rr(-94, -120, 44, 40, 2), lit ? '#FFD27A' : '#2A2018', C.ink, 3); if (lit) glow(70, -100, 90, '#FFC46A', 0.35); }); }
function oldCar(x, y, s, col = '#3E4A3A', t = 0) { withT(x, y, s, 0, () => { shadow(0, 6, 190, 0.35); P(rr(-200, -70, 400, 60, 18), col, C.ink, 5); P(rr(-110, -130, 200, 66, [30, 30, 4, 4]), col, C.ink, 5); P(rr(-92, -120, 76, 46, 6), '#9FB9C9', C.ink, 3); P(rr(-6, -120, 80, 46, 6), '#9FB9C9', C.ink, 3); P(ell(-200, -46, 34, 22), col, C.ink, 4); P(ell(200, -46, 34, 22), col, C.ink, 4); P(circ(196, -50, 10), '#FFE6A0', C.ink, 3); for (const wx of [-120, 120]) { P(circ(wx, -8, 38), '#151515', C.ink, 4); P(circ(wx, -8, 16), '#8A8A8A', null); line(wx, -8, wx + Math.cos(t * 9) * 16, -8 + Math.sin(t * 9) * 16, '#333', 3); } }); }
function grave(x, y, s, label, sub, col = '#9A968E') { withT(x, y, s, 0, () => { shadow(0, 6, 120, 0.4); P(new Path2D('M-90 0 L-90 -150 Q-90 -220 0 -220 Q90 -220 90 -150 L90 0 Z'), col, C.ink, 5); if (label) txt(label, 0, -150, 34, '#3A3632', 'Oswald', 700); if (sub) txt(sub, 0, -100, 22, '#4A4642', 'Oswald', 500); P(rr(-110, 0, 220, 26, 4), '#7A766E', C.ink, 4); }); }
function emptyPlot(x, y, s, t) { withT(x, y, s, 0, () => { ctx.setLineDash([16, 12]); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,230,190,' + (0.5 + 0.3 * Math.sin(t * 2)) + ')'; ctx.beginPath(); ctx.ellipse(0, 0, 130, 30, 0, 0, 6.283); ctx.stroke(); ctx.setLineDash([]); }); }
function flower(x, y, s, col = '#E8486A') { withT(x, y, s, 0, () => { line(0, 0, 0, -60, '#3E6B2E', 5); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; P(ell(Math.cos(a) * 12, -66 + Math.sin(a) * 12, 10, 7, a), col, C.ink, 2); } P(circ(0, -66, 6), '#F2C14E', null); }); }
function parchment(x, y, w, h, rot, fn) { withT(x, y, 1, rot, () => { shadow(0, h / 2 + 16, w * 0.45, 0.35); P(rr(-w / 2, -h / 2, w, h, 8), '#EAD9B0', C.ink, 5); paperTex(-w / 2, -h / 2, w, h, 9); alpha(0.25, () => P(rr(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 6), null, '#8A6A3A', 3)); if (fn) fn(); }); }
function bars(x0, x1, y0, y1, col = '#2A2A2E') { for (let x = x0; x <= x1; x += 70) { P(rr(x - 9, y0, 18, y1 - y0, 6), col, C.ink, 3); } P(rr(x0 - 20, y0 + 40, x1 - x0 + 40, 18, 4), col, C.ink, 3); P(rr(x0 - 20, y1 - 80, x1 - x0 + 40, 18, 4), col, C.ink, 3); }
function moon(x, y, r) { glow(x, y, r * 4, '#BFD3FF', 0.35); P(circ(x, y, r), '#EEF2FA', null); alpha(0.15, () => { P(circ(x - r * 0.3, y - r * 0.2, r * 0.2), '#9AA6BF', null); P(circ(x + r * 0.35, y + r * 0.3, r * 0.14), '#9AA6BF', null); }); }
function crowd(x, y, n, col, seed) { for (let i = 0; i < n; i++) silhouette(x + i * 70 + rnd(seed + i) * 20, y + rnd(i + seed) * 20, 0.38 + rnd(i * 2 + seed) * 0.08, col, i % 3 ? 'fedora' : null); }
function bigNum(s, x, y, size, t, col = C.amber) { const k = back(seg(t, 0, 0.35)); if (k <= 0) return; withT(x, y, k, 0, () => { glow(0, 0, size * 2, col, 0.25); txtStroke(s, 0, 0, size, col, C.ink, size * 0.12); }); }
function neonText(s, x, y, size, col = NEON, flick = 0) { ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 40; txt(s, x, y, size, col, 'Oswald', 700); ctx.shadowBlur = 12; txt(s, x, y, size, '#FFE8F4', 'Oswald', 700); ctx.restore(); }
function neonCity(t) { sky('#12061E', '#3A0F3E'); glow(960, 820, 900, NEON, 0.25); for (let i = 0; i < 40; i++) alpha(0.5, () => P(circ(rnd(i) * W, rnd(i + 4) * H * 0.5, 1.6), '#fff', null)); P(circ(960, 760, 240), '#FF7A3D', null); alpha(0.9, () => skyline(860, '#1A0A26', 21, 360, CYAN, 70)); }
function palmS(x, y, s, t) { palm(x, y, s, t, '#0A0410'); }
function gtaLogoText(x, y, s, t) { withT(x, y, s, 0, () => { neonText('GTA 6', 0, 0, 170, NEON); }); }
function notAff() { tag('SANKETIK CHITRAN · GAME KA NAHI · NOT AFFILIATED WITH ROCKSTAR GAMES', 40, 48, 20, C.grey); }
function sadCam(t, d, a = 30, z0 = 1.0, z1 = 1.08) { return [drift(t, d, a), 0, lerp(z0, z1, ease(t / d))]; }
function L2(fnA, fnB) { return [fnA, fnB]; }

// ===================== HOOK
DRAW.poem = (t, d) => {
  const [px, py, z] = sadCam(t, d, 26, 1.02, 1.12);
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#0E0B12', '#2A1A14'); } },
    { z: 0.4, draw: () => { P(rr(200, 160, 1520, 760, 6), '#3A281C', null); for (let i = 0; i < 14; i++) line(200 + i * 110, 160, 200 + i * 110, 920, 'rgba(0,0,0,0.25)', 6); P(rr(1260, 260, 300, 380, 8), '#14101A', C.ink, 6); glow(1410, 450, 200, '#7A8ACF', 0.18); line(1410, 260, 1410, 640, '#2A2230', 6); line(1260, 450, 1560, 450, '#2A2230', 6); } },
    { z: 0.7, draw: () => { candle(560, 700, t, 1.6); table(760, 720, 700, '#4A3020'); bonnie(980, 720, { t, s: 1.25, look: -1, mood: 0.1, arms: [[0.3, 0.2], [-1.3, -0.3]], prop2: (hl, hr) => withT(hr[0] - 10, hr[1] - 10, 1, -0.3, () => { P(rr(-30, -40, 60, 80, 4), '#EAD9B0', C.ink, 3); for (let j = 0; j < 4; j++) line(-18, -24 + j * 14, 16, -24 + j * 14, '#8A6A3A', 2); }) }); person(560 + 120, 720, 'emma', { t, s: 1.25, flip: false, look: 1, mood: 0, arms: [[0.3, 0.2], [-1.1, -0.4]] }); } },
  ], px, py, z, 'rgba(10,8,14,0.3)');
  alpha(0.18, () => fillAll('#2A1800')); grain(t); vignette();
  banner('MAY 1934', 'DALLAS, TEXAS', 70, 120, t - 0.4, SEPL);
};
DRAW.poemcard = (t, d) => {
  fillAll('#120D0A'); glow(960, 500, 700, '#FFC46A', 0.15); dust(t, 30);
  parchment(960, 500, 1100, 560, -0.02 + wob(t, 0.1, 0.005), () => {
    handwrite('ek din woh dono saath jaayenge…', 0, -110, 64, t - 0.4, '#3A2414', 1.6);
    if (t > LINES.n02.dur * 0.55) handwrite('aur unhe saath-saath', 0, 10, 72, t - LINES.n02.dur * 0.55, '#7A1E1E', 0.8);
    if (t > LINES.n02.dur * 0.72) handwrite('dafnaaya jaayega.', 0, 110, 72, t - LINES.n02.dur * 0.72, '#7A1E1E', 0.8);
  });
  alpha(seg(t, 0.8, 1.2), () => tag('KAVITA KA BHAAV · HINDI MEIN', 600, 870, 24, C.grey));
  grain(t); vignette();
};
DRAW.dawncar = (t, d) => {
  const k = t / d;
  depth([
    { z: 0.03, draw: () => { sky('#2A1E3A', '#F2A65A'); glow(1300, 760, 700, '#FFD38A', 0.6); P(circ(1300, 790, 130), '#FFDC9A', null); } },
    { z: 0.25, haze: 1, draw: () => { ground(780, '#3A2A2A'); for (let i = 0; i < 9; i++) tree(-100 + i * 260, 790, 0.55 + rnd(i) * 0.2, '#2A1C1C', t + i); } },
    { z: 0.6, draw: () => { ground(860, '#5A4030'); P(poly([700, 860, 1220, 860, 1700, 1100, 220, 1100]), '#8A6A4A', null); for (let i = 0; i < 8; i++) { const yy = 880 + i * 30; P(rr(950 - 4 - i * 3, yy, 8 + i * 6, 14, 3), '#C9A878', null); } } },
    { z: 0.9, draw: () => { oldCar(lerp(-300, 1150, ease(k)), 990, 1.2, '#4A4E3A', t); dust(t, 20, 'rgba(230,200,150,0.5)'); } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.06, k));
  alpha(seg(t, 0.4, 0.8), () => { txtStroke('EK HI SUBAH.', 520, 300, 84, SEPL, C.ink, 12); });
  alpha(seg(t, LINES.n03.dur * 0.6, LINES.n03.dur * 0.6 + 0.4), () => txtStroke('EK HI GAADI.', 1400, 300, 84, SEPL, C.ink, 12));
  sepiaGrade(0.25); grain(t); vignette();
};
DRAW.graves = (t, d) => {
  const sep = easeOut(seg(t, 0.4, 2.6));
  depth([
    { z: 0.03, draw: () => { sky('#141024', '#6A4A5E'); glow(960, 700, 800, '#E79A7A', 0.25); } },
    { z: 0.3, haze: 1, draw: () => { ground(720, '#2A2430'); for (let i = 0; i < 7; i++) tree(80 + i * 300, 730, 0.5, '#1A1520', t + i); } },
    { z: 0.7, draw: () => { ground(800, '#3A3A2E');
      grave(lerp(860, 460, sep), 880, 1.0, 'BONNIE', 'CROWN HILL');
      grave(lerp(1060, 1360, sep), 880, 1.0, 'CLYDE', 'WESTERN HEIGHTS');
      if (t > 2.4) { emptyPlot(1640, 900, 1, t); alpha(seg(t, 2.6, 3.2), () => txt('KHAALI', 1640, 960, 34, SEPL, 'Oswald', 600)); }
      if (sep > 0.6) { ctx.setLineDash([14, 12]); line(560, 940, 1260, 940, 'rgba(255,220,180,0.6)', 4); ctx.setLineDash([]); alpha(seg(t, 2.0, 2.4), () => tag('~9 MEEL KI DOORI', 800, 990, 28, SEPL)); }
    } },
  ], drift(t, d, 20), 0, lerp(1.04, 1.0, ease(t / d)));
  bigNum('92 SAAL', 960, 240, 110, t - LINES.n04.dur * 0.45, SEPL);
  grain(t); vignette();
};
DRAW.name = (t, d) => {
  const sw = after('n05', LINES.n05.dur * 0.42);
  if (!sw) {
    fillAll('#1A120C'); glow(700, 520, 600, '#FFC46A', 0.18); dust(t, 30);
    withT(700, 540, back(seg(t, 0.1, 0.5)), -0.04, () => { shadow(0, 330, 260, 0.4); P(rr(-260, -320, 520, 640, 10), '#EAD9B0', C.ink, 6); P(rr(-220, -280, 440, 460, 4), '#C9A878', C.ink, 4); ctx.save(); ctx.beginPath(); ctx.rect(-220, -280, 440, 460); ctx.clip(); sky('#B98A5A', '#E9C891'); bonnie(0, 300, { t, s: 1.35, look: 0.3, mood: 0.6 }); ctx.restore(); txt('BONNIE PARKER', 0, 250, 52, '#3A2414', 'Oswald', 700); txt('1910 – 1934', 0, 290, 30, '#6A4A2A', 'Oswald', 500); });
    sepiaGrade(0.2);
  } else {
    const u = GT - (LINES.n05.start + LINES.n05.dur * 0.42);
    depth([{ z: 0.05, draw: () => neonCity(t) }, { z: 0.8, draw: () => { palmS(150, 1100, 1.4, t); palmS(1760, 1120, 1.3, t + 2); } }], drift(t, d, 30), 0, lerp(1.08, 1.0, easeOut(u / 2)));
    withT(960, 430, back(seg(u, 0, 0.4)), 0, () => gtaLogoText(0, 0, 1.2, t));
    alpha(seg(u, 0.5, 0.9), () => txtStroke('IS WAQT DUNIYA KA SABSE BADA GAME', 960, 640, 54, C.white, C.ink, 10));
    notAff();
  }
  grain(t); vignette();
};
DRAW.promise = (t, d) => {
  const k = easeOut(seg(t, 0.2, 1.0));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W / 2, H); ctx.clip(); sky('#3A2418', '#B9844E'); ground(780, '#5A4030'); oldCar(500, 880, 0.9, '#4A4E3A', 0); silhouette(760, 860, 0.9, '#2A1A10', 'beret'); silhouette(860, 860, 0.95, '#2A1A10', 'fedora'); sepiaGrade(0.3); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(W / 2, 0, W / 2, H); ctx.clip(); neonCity(t); palmS(1500, 1120, 1.2, t); ctx.restore();
  line(W / 2, 0, W / 2, H, C.ink, 10);
  withT(480, 300, back(seg(t, 0.3, 0.7)), -0.03, () => { P(rr(-260, -70, 520, 140, 14), SEPL, C.ink, 6); txt('1934', 0, 4, 90, C.ink); });
  withT(1440, 300, back(seg(t, 0.9, 1.3)), 0.03, () => { P(rr(-260, -70, 520, 140, 14), NEON, C.ink, 6); txt('2026', 0, 4, 90, C.white); });
  if (t > LINES.n06.dur * 0.5) withT(960, 760, back(seg(t, LINES.n06.dur * 0.5, LINES.n06.dur * 0.5 + 0.4)), 0, () => { P(rr(-460, -70, 920, 140, 70), '#0B0F17', SEPL, 5); handwrite('ek adhoori khwahish…', 0, 4, 76, t - LINES.n06.dur * 0.5, SEPL, 1.0); });
  grain(t); vignette();
};
DRAW.title = (t, d) => {
  depth([
    { z: 0.03, draw: () => { sky('#140E1E', '#7A3A2A'); glow(960, 760, 700, '#FFB06A', 0.4); P(circ(960, 820, 200), '#FFC88A', null); } },
    { z: 0.4, haze: 1, draw: () => { ground(800, '#2A1A16'); for (let i = 0; i < 8; i++) tree(-60 + i * 290, 810, 0.6, '#1A100C', t + i); } },
    { z: 0.85, draw: () => { silhouette(860, 1040, 1.3, '#0E0806', 'beret'); silhouette(1060, 1040, 1.38, '#0E0806', 'fedora'); } },
  ], 0, 0, lerp(1.08, 1.0, easeOut(t / d)));
  ctx.fillStyle = 'rgba(8,6,10,0.4)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0.2, 0.6));
  withT(960, 330, lerp(1.4, 1, k), 0, () => alpha(k, () => { txtStroke('BONNIE & CLYDE', 0, -60, 150, SEPL, C.ink, 18); txtStroke('GTA 6 KI ASLI KAHAANI', 0, 80, 86, C.white, C.ink, 14); }));
  if (t > 1.0) handwrite('Ek adhoori khwahish', 960, 560, 66, t - 1.0, '#FFB0A0', 1.0);
  alpha(seg(t, 0.4, 0.8), () => { logoCircle(960 - 250, 920, 40); brandText(960 - 195, 922, 50, 'left'); });
  grain(t); vignette();
};
function chapter(n, title) { return (t, d) => { fillAll('#0E0A08'); paperTex(0, 0, W, H, n * 13); glow(960, 520, 600, '#FFC46A', 0.12); dust(t, 26); handwrite('Part ' + n, 960, 400, 60, t - 0.1, SEPL, 0.4); handwrite(title, 960, 540, 116, t - 0.5, C.white, 0.9); const k = seg(t, 1.3, 1.8); ctx.strokeStyle = '#9E2A22'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(960 - 380 * k, 640); ctx.lineTo(960 + 380 * k, 640); ctx.stroke(); grain(t); vignette(); sceneFade(t, d, 0.2, 0.25); }; }
DRAW.ch1 = chapter(1, 'Ek Ladki, Ek Ladka'); DRAW.ch2 = chapter(2, 'Jail, Bandook aur Kulhaadi'); DRAW.ch3 = chapter(3, 'Do Saal, Sadkon Par');
DRAW.ch4 = chapter(4, 'Aakhri Subah'); DRAW.ch5 = chapter(5, 'Adhoori Khwahish'); DRAW.ch6 = chapter(6, 'GTA 6 Connection');

// ===================== PART 1
DRAW.rowena = (t, d) => {
  depth([
    { z: 0.03, draw: () => texSky(t) },
    { z: 0.3, haze: 1, draw: () => { ground(720, '#7A5A3A'); withT(300, 720, 0.8, 0, () => { line(-40, 0, -40, -300, '#3A2818', 10); line(40, 0, 40, -300, '#3A2818', 10); P(rr(-80, -420, 160, 130, 30), '#8A7A6A', C.ink, 4); txt('ROWENA', 0, -355, 30, '#2A1A10'); }); house(800, 730, 0.7, '#9A7A5A'); house(1500, 730, 0.65, '#8A6A4A'); } },
    { z: 0.75, draw: () => { ground(860, '#9A7A50'); house(1180, 900, 1.0, '#A88A60', false); bonnie(620, 940, { young: true, t, s: 1.4, look: 1, mood: 0.8, arms: [[0.2, 0.1], [-1.0, -0.6]], prop2: (hl, hr) => withT(hr[0] + 10, hr[1], 1, 0.2, () => { P(rr(-34, -26, 68, 52, 4), '#EFE7D3', C.ink, 3); line(-22, -10, 22, -10, '#8A6A3A', 2); line(-22, 4, 18, 4, '#8A6A3A', 2); }) }); } },
  ], drift(t, d, 34), 0, lerp(1.0, 1.08, ease(t / d)));
  yearBadge('1910', 300, 160, t, SEPL);
  if (t > LINES.n07.dur * 0.6) withT(1500, 300, back(seg(t, LINES.n07.dur * 0.6, LINES.n07.dur * 0.6 + 0.4)), 0.05, () => { P(rr(-200, -60, 400, 120, 14), '#EAD9B0', C.ink, 5); handwrite('kavitaayein ✎', 0, 4, 54, t - LINES.n07.dur * 0.6, '#3A2414', 0.6); });
  sepiaGrade(0.22); grain(t); vignette();
};
DRAW.wedding = (t, d) => {
  const two = after('n09', 0);
  depth([
    { z: 0.03, draw: () => { sky('#3A2A1E', '#C9A070'); glow(960, 400, 700, '#FFE0A8', 0.3); } },
    { z: 0.4, haze: 1, draw: () => { P(rr(300, 200, 1320, 660, 8), '#6A4A30', null); for (let i = 0; i < 3; i++) P(rr(420 + i * 420, 280, 240, 320, 120), '#3A281C', C.ink, 4); } },
    { z: 0.75, draw: () => { ground(880, '#4A3420'); bonnie(820, 920, { t, s: 1.3, look: 1, mood: two ? -0.3 : 0.8, hat: false }); person(two ? lerp(1100, 1600, easeIn(seg(lt('n09'), 0.2, 1.8))) : 1100, 920, 'roy', { t, s: 1.3, look: -1, mood: two ? 0 : 0.8, flip: false }); if (!two) heart(960, 520, 1.6 + wob(t, 1, 0.08)); } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.06, ease(t / d)));
  if (!two) banner('ROY THORNTON', 'SHAADI · 16 SE 6 DIN PEHLE', 70, 120, t - 0.3, SEPL);
  else { const u = lt('n09'); withT(1440, 380, back(seg(u, LINES.n09.dur * 0.5, LINES.n09.dur * 0.5 + 0.4)), 0, () => { glow(0, 0, 220, '#FFD27A', 0.45 + wob(t, 1, 0.1)); P(circ(0, 0, 80), null, '#E8B04A', 22); P(circ(0, 0, 80), null, C.ink, 4); P(circ(0, 0, 91), null, C.ink, 3); P(poly([-22, -86, 0, -118, 22, -86, 0, -76]), '#DDEBFF', C.ink, 3); }); alpha(seg(u, 1.0, 1.4), () => tag('TALAAQ KABHI NAHI', 300, 200, 34, SEPL)); }
  sepiaGrade(0.22); grain(t); vignette();
};
DRAW.clyde = (t, d) => {
  depth([
    { z: 0.03, draw: () => texSky(t, false) },
    { z: 0.35, haze: 1, draw: () => { ground(740, '#4A4038'); for (let i = 0; i < 5; i++) house(200 + i * 380, 750, 0.55, '#6A5A4A'); } },
    { z: 0.75, draw: () => { ground(880, '#5A4A3A'); withT(1320, 860, 1, 0.02, () => { shadow(0, 10, 220, 0.3); P(rr(-200, -520, 400, 520, 8), '#E9E2D0', C.ink, 6); P(rr(-200, -520, 400, 110, [8, 8, 0, 0]), '#2B4A7A', C.ink, 6); txt('JOIN THE', 0, -490, 34, C.white); txt('NAVY', 0, -440, 60, C.white); P(poly([-80, -300, 0, -380, 80, -300, 40, -300, 40, -200, -40, -200, -40, -300]), '#2B4A7A', C.ink, 4); }); clyde(700, 920, { young: true, t, s: 1.4, look: 1, mood: after('n10', LINES.n10.dur * 0.6) ? -0.6 : 0.6, brow: after('n10', LINES.n10.dur * 0.6) ? -1 : 0 }); } },
  ], drift(t, d, 34), 0, lerp(1.0, 1.08, ease(t / d)));
  yearBadge('1909', 300, 160, t, SEPL);
  if (t > LINES.n10.dur * 0.62) stamp('REJECTED', 1320, 600, 72, '#B8322A', t - LINES.n10.dur * 0.62, -0.2);
  sepiaGrade(0.22); grain(t); vignette();
};
DRAW.meet = (t, d) => {
  const big = after('n12', 0);
  depth([
    { z: 0.03, draw: () => { sky('#1E1610', '#4A3020'); } },
    { z: 0.4, haze: 1, draw: () => { P(rr(150, 120, 1620, 760, 6), '#5A3E28', null); P(rr(1200, 260, 320, 260, 8), '#1E2A3A', C.ink, 6); for (let i = 0; i < 26; i++) alpha(0.7, () => P(circ(1220 + rnd(i) * 280, 280 + ((rnd(i + 2) * 220 + t * 40) % 220), 3), '#fff', null)); line(1360, 260, 1360, 520, '#3A281C', 6); line(1200, 390, 1520, 390, '#3A281C', 6); } },
    { z: 0.75, draw: () => { ground(880, '#3A2818'); candle(960, 760, t, 1.2); bonnie(lerp(700, 800, ease(seg(t, 0, 2))), 920, { t, s: 1.35, look: 1, mood: 0.9, hat: false }); clyde(lerp(1220, 1120, ease(seg(t, 0, 2))), 920, { t, s: 1.35, look: -1, mood: 0.9, hat: false }); if (t > 1.6) heart(960, 470, 1.2 * back(seg(t, 1.6, 2.0)) + wob(t, 1.2, 0.06)); } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.1, ease(t / d)));
  if (!big) banner('JANUARY 1930', 'BONNIE 19 · CLYDE 21', 70, 120, t - 0.3, SEPL);
  else { const u = lt('n12'); alpha(seg(u, 0.4, 0.8), () => txtStroke('SABSE MASHHOOR…', 960, 230, 80, SEPL, C.ink, 12)); alpha(seg(u, LINES.n12.dur * 0.55, LINES.n12.dur * 0.55 + 0.3), () => txtStroke('SABSE KHATARNAAK', 960, 340, 96, '#E2483D', C.ink, 14)); }
  sepiaGrade(0.2); grain(t); vignette();
};

// ===================== PART 2
DRAW.jail = (t, d) => {
  const run = after('n14', 0);
  depth([
    { z: 0.03, draw: () => { sky('#141418', '#2E2E36'); } },
    { z: 0.4, haze: 1, draw: () => { P(rr(200, 120, 1520, 780, 4), '#3A3A40', null); for (let r = 0; r < 12; r++) for (let c = 0; c < 16; c++) P(rr(200 + c * 96 + (r % 2) * 48, 120 + r * 66, 92, 62, 2), null, 'rgba(0,0,0,0.25)', 2); } },
    { z: 0.7, draw: () => { ground(880, '#26262A');
      if (!run) { clyde(1180, 920, { t, s: 1.3, look: -1, mood: 0, hat: false, arms: [[0.2, 0.2], [-1.2, -0.4]] }); bars(1000, 1420, 300, 900); bonnie(700, 920, { t, s: 1.3, look: 1, mood: 0.3, arms: [[0.2, 0.2], [-1.3, -0.2]], prop2: (hl, hr) => { const k = seg(lt('n13'), LINES.n13.dur * 0.55, LINES.n13.dur * 0.8); withT(hr[0] + k * 120, hr[1] - 6, 1, 0, () => { P(rr(-34, -10, 56, 18, 4), '#1A1A1A', C.ink, 3); P(rr(-34, -2, 16, 30, 4), '#1A1A1A', C.ink, 3); }); } }); }
      else { const u = lt('n14'); bars(1000, 1420, 300, 900); clyde(lerp(1000, 300, ease(seg(u, 0.2, 1.6))), 920, { t, s: 1.3, walk: u * 1.6, look: -1, mood: 0.3, hat: false }); if (u > LINES.n14.dur * 0.4) lawman(lerp(1900, 900, ease(seg(u, LINES.n14.dur * 0.4, LINES.n14.dur * 0.7))), 920, { t, s: 1.3, walk: u * 1.6, look: -1, mood: -0.5 }); }
    } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.06, ease(t / d)));
  if (!run) banner('1930', 'CHORI KE ILZAAM MEIN GIRAFTAAR', 70, 120, t - 0.3, SEPL);
  else { const u = lt('n14'); if (u > LINES.n14.dur * 0.6) stamp('14 SAAL', 1500, 260, 90, '#B8322A', u - LINES.n14.dur * 0.6); alpha(seg(u, LINES.n14.dur * 0.7, LINES.n14.dur * 0.8), () => tag('EASTHAM PRISON FARM', 80, 980 - 0, 30, SEPL)); }
  sepiaGrade(0.3); grain(t); vignette();
};
DRAW.axe = (t, d) => {
  const two = after('n16', 0);
  if (!two) {
    depth([
      { z: 0.03, draw: () => { sky('#2A2A22', '#8A7A5A'); } },
      { z: 0.35, haze: 1, draw: () => { ground(640, '#6A5A3A'); for (let i = 0; i < 30; i++) line(i * 70, 640, i * 70 - 200, 1080, 'rgba(60,40,20,0.35)', 6); withT(1550, 640, 0.9, 0, () => { line(-60, 0, -60, -380, '#3A2818', 12); line(60, 0, 60, -380, '#3A2818', 12); P(rr(-110, -480, 220, 110, 6), '#5A3E28', C.ink, 4); }); for (let i = 0; i < 6; i++) person(200 + i * 160, 700, 'prisoner', { t: t + i, s: 0.5, look: 0, mood: -0.5, arms: [[0.9, 0.6], [-0.9, -0.6]] }); } },
      { z: 0.8, draw: () => { const u = lt('n15'); withT(960, 880, 1.6, 0, () => { P(rr(-220, -40, 300, 80, 30), '#3A2A1E', C.ink, 6); P(rr(60, -40, 120, 80, [10, 40, 40, 10]), '#3A2A1E', C.ink, 6); }); const sw = seg(u, LINES.n15.dur * 0.38, LINES.n15.dur * 0.5); withT(1240, 520, 1.3, lerp(-1.4, 0.2, easeIn(sw)), () => { P(rr(-12, -10, 24, 300, 8), '#7A5A3A', C.ink, 4); P(new Path2D('M-14 -10 L-120 -40 Q-140 30 -14 50 Z'), '#9AA0AA', C.ink, 5); }); if (u > LINES.n15.dur * 0.5) alpha(1 - seg(u, LINES.n15.dur * 0.5, LINES.n15.dur * 0.5 + 0.35), () => fillAll('#8E1A1A')); } },
    ], drift(t, d, 20), 0, lerp(1.0, 1.05, ease(t / d)));
    banner('JANUARY 1932', 'EASTHAM PRISON FARM', 70, 120, t - 0.3, SEPL);
    alpha(seg(lt('n15'), LINES.n15.dur * 0.7, LINES.n15.dur * 0.8), () => tag('KISNE CHALAAYI KULHAADI? SAAF NAHI', 1100, 980, 26, C.grey));
  } else {
    const u = lt('n16');
    depth([
      { z: 0.03, draw: () => texSky(t) },
      { z: 0.6, draw: () => { ground(860, '#7A5A3A'); clyde(lerp(500, 1200, seg(u, LINES.n16.dur * 0.55, LINES.n16.dur)), 920, { t, s: 1.3, walk: u * 0.9, look: 1, mood: 0, hat: false, bob: Math.abs(Math.sin(u * 5)) * 10 }); } },
    ], drift(t, d, 20), 0, 1.04);
    if (u < LINES.n16.dur * 0.55) { calCard(1400, 460, 1.0, 'SIRF', '6 DIN', 'BAAD', '#2E7D5B', 0.05); stamp('PAROLE', 1400, 780, 70, '#2E7D5B', u - LINES.n16.dur * 0.3); }
    else alpha(seg(u, LINES.n16.dur * 0.6, LINES.n16.dur * 0.7), () => tag('ZINDAGI BHAR KI LANGDAAHAT', 1100, 200, 34, SEPL));
  }
  sepiaGrade(0.25); grain(t); vignette();
};
DRAW.free = (t, d) => {
  depth([
    { z: 0.03, draw: () => { sky('#3A2A2A', '#E9A86A'); glow(1300, 640, 600, '#FFD38A', 0.5); } },
    { z: 0.4, haze: 1, draw: () => { ground(760, '#5A4A3A'); P(rr(200, 300, 520, 460, 4), '#4A4A4E', C.ink, 5); P(rr(360, 480, 200, 280, 4), '#1A1A1E', C.ink, 4); for (let i = 0; i < 6; i++) line(370 + i * 36, 480, 370 + i * 36, 760, '#555', 5); } },
    { z: 0.75, draw: () => { ground(880, '#6A5A40'); const k = ease(seg(t, 0.3, 2.6)); clyde(lerp(460, 860, k), 920, { t, s: 1.3, walk: t * 0.8, look: 1, mood: 0.8 }); bonnie(1240, 920, { t, s: 1.3, look: -1, mood: 0.9 }); if (k > 0.9) heart(1050, 520, back(seg(t, 2.6, 3.0)) * 1.3); } },
  ], drift(t, d, 30), 0, lerp(1.0, 1.08, ease(t / d)));
  banner('FEBRUARY 1932', 'CLYDE BAAHAR', 70, 120, t - 0.3, SEPL);
  sepiaGrade(0.2); grain(t); vignette();
};

// ===================== PART 3
DRAW.road = (t, d) => {
  fillAll('#1A120C');
  parchment(960, 540, 1640, 900, 0, () => {
    ctx.strokeStyle = 'rgba(120,80,40,0.25)'; ctx.lineWidth = 2; for (let i = -8; i <= 8; i++) { line(i * 100, -440, i * 100, 440, 'rgba(120,80,40,0.15)', 2); line(-800, i * 55, 800, i * 55, 'rgba(120,80,40,0.15)', 2); }
    const pts = [[-420, 220, 'TEXAS'], [-300, -60, 'OKLAHOMA'], [-40, -260, 'MISSOURI'], [120, -380, 'IOWA'], [80, 80, 'LOUISIANA']];
    const k = seg(t, 0.5, d - 0.6) * (pts.length - 1);
    ctx.setLineDash([20, 14]); ctx.strokeStyle = '#9E2A22'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    let cx = pts[0][0], cy = pts[0][1];
    for (let i = 1; i < pts.length; i++) { const f = clamp(k - (i - 1)); if (f <= 0) break; cx = lerp(pts[i - 1][0], pts[i][0], f); cy = lerp(pts[i - 1][1], pts[i][1], f); ctx.lineTo(cx, cy); } ctx.stroke(); ctx.setLineDash([]);
    pts.forEach(([x, y, n], i) => { if (k >= i - 0.05) { pin(x, y, '#7A1E1E'); txt(n, x, y + 40, 30, '#3A2414', 'Oswald', 700); } });
    withT(cx, cy - 30, 0.32, 0, () => oldCar(0, 0, 1, '#4A4E3A', t));
  });
  banner('1932 – 1934', 'MANDI KA AMERICA · CHORI KI GAADIYAAN', 70, 120, t - 0.3, SEPL);
  tag('SANKETIK RAASTA · SIRF SAMJHAANE KE LIYE', W - 560, 1010, 22, C.grey);
  grain(t); vignette();
};
DRAW.robin = (t, d) => {
  fillAll('#140E0A'); paperTex(0, 0, W, H, 33); glow(960, 500, 700, '#FFC46A', 0.12);
  const fact = t > LINES.n19.dur * 0.3;
  withT(520, 470, back(seg(t, 0.2, 0.6)), -0.05, () => { shadow(0, 260, 220, 0.35); P(rr(-260, -260, 520, 520, 16), '#3A4A2A', C.ink, 6); P(new Path2D('M-170 60 Q0 -240 170 60 Z'), '#4E7A2E', C.ink, 6); line(60, -60, 200, -200, '#C9A15A', 6); txt('MYTH', 0, 180, 70, C.white); if (fact) { line(-230, -230, 230, 230, '#E2483D', 18); line(230, -230, -230, 230, '#E2483D', 18); } });
  if (fact) {
    const u = t - LINES.n19.dur * 0.3;
    withT(1380, 330, back(seg(u, 0.2, 0.6)), 0.03, () => { shadow(0, 170, 220); P(rr(-260, -140, 520, 280, 14), '#EAD9B0', C.ink, 5); txt('SACH', 0, -95, 46, '#9E2A22'); withT(-140, 80, 0.8, 0, () => { P(rr(-50, -140, 100, 140, 8), '#C9302C', C.ink, 4); P(rr(-34, -120, 68, 40, 4), '#F2E8C8', C.ink, 3); line(50, -100, 80, -60, C.ink, 5); }); txt('PETROL PUMP', 70, 10, 34, C.ink); txt('KIRAANA DUKAAN', 70, 60, 34, C.ink); });
    withT(1380, 720, back(seg(u, LINES.n19.dur * 0.45, LINES.n19.dur * 0.45 + 0.4)), -0.04, () => { glow(0, 0, 240, '#2E7D5B', 0.35); P(rr(-240, -80, 480, 160, 80), '#2E7D5B', C.ink, 6); txt('$5 – $10', 0, 4, 90, C.white); });
  }
  grain(t); vignette();
};
DRAW.victims = (t, d) => {
  fillAll('#0A0A0E'); glow(960, 520, 600, '#7FA8FF', 0.1);
  withT(960, 470, 1, 0, () => { shadow(0, 200, 200, 0.4); P(new Path2D('M0 -170 L140 -100 L120 80 L0 170 L-120 80 L-140 -100 Z'), '#C9A227', C.ink, 7); P(circ(0, 0, 70), '#9A7A1A', C.ink, 5); txt('★', 0, 4, 80, '#F2D06A'); });
  candle(640, 800, t, 1.6); candle(1280, 800, t + 1, 1.6);
  alpha(seg(t, 0.6, 1.0), () => bigNum('13', 960, 470, 1, t));
  if (t > LINES.n20.dur * 0.35) withT(960, 820, back(seg(t, LINES.n20.dur * 0.35, LINES.n20.dur * 0.35 + 0.4)), 0, () => { P(rr(-430, -60, 860, 120, 60), 'rgba(20,20,30,0.85)', '#7FA8FF', 4); txt('13 HATYAON KA SHAK · FBI', 0, 4, 54, C.white); });
  alpha(seg(t, LINES.n20.dur * 0.75, LINES.n20.dur * 0.85), () => tag('MARNE WAALON MEIN POLICEWALE BHI', 640, 980, 30, '#BFD3FF'));
  grain(t, 200, 0.05); vignette();
};
DRAW.crash = (t, d) => {
  const two = after('n22', 0);
  if (!two) {
    const u = lt('n21'); const fall = seg(u, LINES.n21.dur * 0.62, LINES.n21.dur * 0.85);
    depth([
      { z: 0.03, draw: () => { sky('#06070E', '#1C2236'); stars(60); moon(1600, 200, 50); } },
      { z: 0.4, haze: 1, draw: () => { ground(700, '#121418'); P(rr(-200, 700, 1100, 40, 2), '#2A2A30', null); P(rr(1200, 700, 1000, 40, 2), '#2A2A30', null); P(poly([900, 700, 1200, 700, 1150, 1100, 950, 1100]), '#08080A', null); withT(860, 700, 1, 0, () => { line(0, 0, 0, -90, '#5A4A3A', 8); P(rr(-80, -150, 160, 70, 4), '#E9C24A', C.ink, 4); txt('BRIDGE OUT', 0, -114, 26, C.ink); }); } },
      { z: 0.8, draw: () => { const x = lerp(-200, 960, ease(seg(u, 0, LINES.n21.dur * 0.62))); withT(x, 720 + 380 * easeIn(fall), 0.8, 0.9 * easeIn(fall), () => { oldCar(0, 0, 1, '#2A2E28', u); glow(220, -50, 300, '#FFE6A0', 0.4); }); if (fall >= 1) { alpha(1 - seg(u, LINES.n21.dur * 0.85, LINES.n21.dur), () => { for (let i = 0; i < 20; i++) P(circ(1050 + (rnd(i) - 0.5) * 400, 1040 - rnd(i + 2) * 200 * seg(u, LINES.n21.dur * 0.85, LINES.n21.dur), 20 + rnd(i) * 30), 'rgba(140,120,100,0.5)', null); }); } } },
    ], 0, 0, 1.0);
    banner('JUNE 1933', '70 MEEL KI RAFTAAR', 70, 120, u - 0.3, SEPL);
  } else {
    const u = lt('n22');
    depth([
      { z: 0.03, draw: () => { sky('#070A16', '#232A44'); stars(80); moon(1500, 220, 70); } },
      { z: 0.4, haze: 1, draw: () => { ground(760, '#10131C'); for (let i = 0; i < 8; i++) tree(-60 + i * 280, 770, 0.55, '#080A10', t + i); } },
      { z: 0.85, draw: () => { ground(900, '#161A24'); const x = lerp(300, 1300, ease(seg(u, LINES.n22.dur * 0.45, LINES.n22.dur))); if (u < LINES.n22.dur * 0.45) { bonnie(860, 940, { t, s: 1.3, look: 0, mood: -0.8, brow: -1, hat: false }); glow(860, 920, 120, '#FF5A3A', 0.35 * (1 - seg(u, 0, LINES.n22.dur * 0.4))); } else { withT(x, 940, 1.3, 0, () => { silhouette(0, 0, 1.0, '#05060A', 'fedora'); withT(0, -200, 1, -1.25, () => silhouette(0, 0, 0.8, '#05060A', 'hair')); }); } } },
    ], drift(t, d, 20), 0, 1.04);
    if (u < LINES.n22.dur * 0.45) alpha(seg(u, 0.6, 1.0), () => tag('THIRD-DEGREE BURNS · HADDI TAK', 80, 200, 30, '#FFB0A0'));
  }
  grain(t); vignette();
};
DRAW.know = (t, d) => {
  depth([
    { z: 0.03, draw: () => { sky('#05060C', '#1A1E30'); stars(120); } },
    { z: 0.4, haze: 1, draw: () => { ground(760, '#0C0E16'); for (let i = 0; i < 8; i++) tree(-60 + i * 280, 770, 0.55, '#06070C', t + i); } },
    { z: 0.85, draw: () => { ground(900, '#121520'); glow(960, 860, 320, '#FF8A3D', 0.5 + wob(t, 2.2, 0.06)); for (let i = 0; i < 5; i++) { const fl = wob(t, 2 + i, 8, i); P(new Path2D(`M${930 + i * 15} 900 Q${920 + i * 15} ${840 + fl} ${940 + i * 12} ${800 + fl} Q${960 + i * 10} ${850} ${960 + i * 15} 900 Z`), ['#FFB43D', '#FF7A2A', '#FFD86A'][i % 3], null); } bonnie(720, 940, { t, s: 1.2, sit: true, look: 1, mood: -0.3, hat: false }); clyde(1150, 940, { t, s: 1.2, sit: true, look: -1, mood: -0.3, hat: false, flip: true }); } },
  ], 0, 0, lerp(1.0, 1.12, ease(t / d)));
  alpha(seg(t, 1.0, 1.6), () => handwrite('ant pata tha…', 960, 240, 80, t - 1.0, '#FFB0A0', 1.0));
  grain(t); vignette();
};

// ===================== PART 4
DRAW.ambush = (t, d) => {
  depth([
    { z: 0.03, draw: () => { sky('#3A4A5A', '#E9D0A0'); glow(400, 500, 600, '#FFF0C0', 0.4); } },
    { z: 0.35, haze: 1, draw: () => { ground(700, '#4A5A3A'); for (let i = 0; i < 9; i++) tree(-80 + i * 260, 710, 0.6 + rnd(i) * 0.2, '#2A3420', t + i); } },
    { z: 0.6, draw: () => { ground(820, '#6A5A3A'); P(poly([600, 820, 1320, 820, 1900, 1100, 20, 1100]), '#9A8060', null); } },
    { z: 0.9, draw: () => { for (let i = 0; i < 6; i++) { const x = 1250 + i * 110, y = 900 + (i % 2) * 30; fedora(x, y - 60 + Math.max(0, wob(t + i, 0.3, 6)), 0.7, '#5A4A30'); } for (let i = 0; i < 9; i++) P(circ(1180 + i * 90, 930 + rnd(i) * 40, 80 + rnd(i + 2) * 30), '#2E3E22', C.ink, 4); } },
  ], drift(t, d, 24), 0, lerp(1.0, 1.08, ease(t / d)));
  banner('23 MAY 1934', 'BIENVILLE PARISH, LOUISIANA', 70, 120, t - 0.3, SEPL);
  if (t > LINES.n24.dur * 0.4) { const k = back(seg(t, LINES.n24.dur * 0.4, LINES.n24.dur * 0.4 + 0.4)); withT(1500, 300, k, 0.04, () => { P(rr(-200, -60, 400, 120, 14), '#EAD9B0', C.ink, 5); txt('6 AFSAR', 0, 4, 72, '#3A2414'); }); }
  alpha(seg(t, LINES.n24.dur * 0.75, LINES.n24.dur * 0.85), () => tag('LEADER: FRANK HAMER · PURV TEXAS RANGER', 1050, 220 + 220, 28, SEPL));
  sepiaGrade(0.15); grain(t); vignette();
};
DRAW.ford = (t, d) => {
  const k = t / d;
  depth([
    { z: 0.03, draw: () => { sky('#4A5A6A', '#F0DAB0'); } },
    { z: 0.35, haze: 1, draw: () => { ground(700, '#4A5A3A'); for (let i = 0; i < 9; i++) tree(-80 + i * 260, 710, 0.6, '#2A3420', t + i); } },
    { z: 0.7, draw: () => { ground(820, '#6A5A3A'); P(poly([600, 820, 1320, 820, 1900, 1100, 20, 1100]), '#9A8060', null); withT(lerp(1300, 900, ease(k)), lerp(830, 900, ease(k)), lerp(0.35, 0.85, ease(k)), 0, () => oldCar(0, 0, 1, '#C8B48A', t * 0.3)); } },
  ], 0, 0, lerp(1.0, 1.12, ease(k)));
  clockFace(1560, 300, 150, 9, 15);
  for (let i = 0; i < 4; i++) { const bx = (200 + i * 200 + t * 60) % W, by = 200 + rnd(i) * 80 + wob(t, 1 + i * 0.2, 10); ctx.strokeStyle = '#2A2A2A'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx - 20, by); ctx.quadraticCurveTo(bx - 10, by - 12 * Math.abs(Math.sin(t * 6 + i)), bx, by); ctx.quadraticCurveTo(bx + 10, by - 12 * Math.abs(Math.sin(t * 6 + i)), bx + 20, by); ctx.stroke(); }
  banner('SUBAH ~9:15', 'EK FORD V8', 70, 120, t - 0.3, SEPL);
  sepiaGrade(0.15); grain(t); vignette();
};
DRAW.shots = (t, d) => {
  const sh = t < 1.6 ? (rnd(Math.floor(t * 30)) - 0.5) * 30 * (1 - t / 1.6) : 0;
  ctx.save(); ctx.translate(sh, sh * 0.6);
  fillAll('#1A1612'); withT(960, 700, 1.6, 0, () => oldCar(0, 0, 1, '#8A7A5A', 0));
  const n = Math.min(60, Math.floor(seg(t, 0, 1.6) * 60)); for (let i = 0; i < n; i++) P(circ(960 + (rnd(i) - 0.5) * 560, 520 + rnd(i + 7) * 180, 6), '#0A0806', null);
  ctx.restore();
  if (t < 1.6 && Math.floor(t * 18) % 2 === 0) alpha(0.25, () => fillAll('#FFF6E0'));
  alpha(seg(t, 1.6, 2.4), () => fillAll('#0A0A0A'));
  if (t > 1.8) bigNum('130+', 960, 470, 220, t - 1.8, '#E9E2D0');
  if (t > 2.4) alpha(seg(t, 2.4, 2.8), () => txt('GOLIYAAN', 960, 640, 60, C.grey, 'Oswald', 600));
  grain(t); vignette();
};
DRAW.ages = (t, d) => {
  fillAll('#0E0A08'); glow(960, 500, 700, '#FFC46A', 0.12); dust(t, 30);
  const frame = (x, rot, label, age, who, k) => withT(x, 460, back(k), rot, () => { shadow(0, 310, 220, 0.4); P(rr(-230, -290, 460, 580, 10), '#3A2818', C.ink, 6); P(rr(-200, -260, 400, 440, 4), '#C9A878', C.ink, 4); ctx.save(); ctx.beginPath(); ctx.rect(-200, -260, 400, 440); ctx.clip(); sky('#B98A5A', '#E9C891'); if (who === 'b') bonnie(0, 280, { t, s: 1.25, look: 0.4, mood: 0.2 }); else clyde(0, 300, { t, s: 1.2, look: -0.4, mood: 0.2 }); sepiaGrade(0.4); ctx.restore(); txt(label, 0, 215, 40, SEPL, 'Oswald', 700); txt(age, 0, 262, 34, '#E9D9B5', 'Oswald', 500); });
  frame(640, -0.04, 'BONNIE', '23 SAAL', 'b', seg(t, 0.2, 0.6)); frame(1280, 0.04, 'CLYDE', '25 SAAL', 'c', seg(t, LINES.n27.dur * 0.2, LINES.n27.dur * 0.2 + 0.4));
  candle(960, 960, t, 1.4);
  if (t > LINES.n27.dur * 0.55) alpha(seg(t, LINES.n27.dur * 0.55, LINES.n27.dur * 0.55 + 0.5), () => txtStroke('DONO SAATH GAYE', 960, 100, 70, SEPL, C.ink, 10));
  grain(t); vignette();
};
DRAW.trail = (t, d) => {
  depth([
    { z: 0.03, draw: () => { sky('#1A1220', '#C97A4A'); glow(960, 640, 700, '#FFB06A', 0.5); } },
    { z: 0.6, draw: () => { ground(640, '#3A2418'); P(poly([930, 640, 990, 640, 1500, 1100, 420, 1100]), '#8A6A4A', null); for (let i = 0; i < 6; i++) tree(i < 3 ? 200 + i * 180 : 1100 + i * 150, 660, 0.5, '#1A100C', t + i); } },
  ], 0, 0, lerp(1.0, 1.15, ease(t / d)));
  parchment(960, 330, 860, 260, -0.02, () => { handwrite("The Trail's End", 0, -20, 84, t - 0.6, '#3A2414', 1.2); if (t > LINES.n28.dur * 0.6) handwrite('raaste ka aakhri mod', 0, 70, 46, t - LINES.n28.dur * 0.6, '#7A1E1E', 0.8); });
  grain(t); vignette();
};

// ===================== PART 5
DRAW.wish = (t, d) => {
  depth([
    { z: 0.03, draw: () => { sky('#141024', '#7A4A5E'); glow(960, 720, 700, '#E79A7A', 0.3); } },
    { z: 0.5, draw: () => { ground(780, '#2A2430'); tree(960, 800, 1.3, '#120E18', t); } },
    { z: 0.85, draw: () => { silhouette(860, 1000, 1.1, '#0A080E', 'beret'); silhouette(1060, 1000, 1.15, '#0A080E', 'fedora'); heart(960, 560, 1.4 + wob(t, 0.8, 0.05), '#C9485E'); } },
  ], 0, 0, lerp(1.0, 1.1, ease(t / d)));
  alpha(seg(t, LINES.n29.dur * 0.5, LINES.n29.dur * 0.6), () => txtStroke('SAATH-SAATH DAFN', 960, 200, 86, SEPL, C.ink, 12));
  grain(t); vignette();
};
DRAW.plot = (t, d) => {
  depth([
    { z: 0.03, draw: () => { sky('#2A2A38', '#B99A8A'); } },
    { z: 0.35, haze: 1, draw: () => { ground(720, '#3A3A30'); for (let i = 0; i < 10; i++) grave(100 + i * 200, 730, 0.4, '', '', '#6A6A62'); } },
    { z: 0.75, draw: () => { ground(840, '#4A4A3A'); grave(700, 920, 1.1, 'CLYDE', '1909 – 1934'); emptyPlot(1160, 950, 1.1, t); for (let i = 0; i < 3; i++) flower(1080 + i * 80, 960, 1.1, ['#E8486A', '#F2C14E', '#E8E2F0'][i]); for (let i = 0; i < 3; i++) silhouette(1500 + i * 120, 960, 0.6, '#1A1820', i == 1 ? 'fedora' : null); } },
  ], drift(t, d, 24), 0, lerp(1.0, 1.08, ease(t / d)));
  alpha(seg(t, 1.2, 1.6), () => tag('BONNIE KE LIYE CHHODI GAYI JAGAH', 960, 210, 34, SEPL));
  grain(t); vignette();
};
DRAW.mother = (t, d) => {
  const dr = act('d01') || after('d01');
  depth([
    { z: 0.03, draw: () => { sky('#0E1018', '#2A2E3E'); rain(t, 160, 'rgba(160,180,220,0.3)'); } },
    { z: 0.4, haze: 1, draw: () => { P(rr(0, 0, W, H, 0), '#2A2228', null); P(rr(1100, 180, 560, 600, 8), '#141A28', C.ink, 8); ctx.save(); ctx.beginPath(); ctx.rect(1100, 180, 560, 600); ctx.clip(); rain(t + 3, 80, 'rgba(180,200,240,0.4)'); ctx.restore(); line(1380, 180, 1380, 780, '#3A2E30', 10); line(1100, 480, 1660, 480, '#3A2E30', 10); } },
    { z: 0.8, draw: () => { ground(900, '#1A1418'); person(1100, 960, 'emma', { t, s: 1.6, look: -0.6, mood: -0.8, brow: -1, talk: talk('d01') }); candle(500, 860, t, 1.4); } },
  ], drift(t, d, 16), 0, lerp(1.04, 1.14, ease(t / d)));
  banner('EMMA PARKER', "BONNIE KI MAA", 70, 120, t - 0.3, SEPL);
  if (dr) dramaTag(GT - LINES.d01.start);
  grain(t); vignette();
};
DRAW.crownhill = (t, d) => {
  depth([
    { z: 0.03, draw: () => { sky('#2A2A3A', '#C9A88A'); } },
    { z: 0.4, haze: 1, draw: () => { ground(720, '#3A4030'); for (let i = 0; i < 12; i++) grave(80 + i * 170, 730, 0.35, '', '', '#7A7A72'); } },
    { z: 0.75, draw: () => { ground(860, '#4A5038'); withT(960, 880, 1, 0, () => { P(rr(-420, -420, 60, 420, 4), '#5A5A5E', C.ink, 5); P(rr(360, -420, 60, 420, 4), '#5A5A5E', C.ink, 5); ctx.strokeStyle = '#1A1A1E'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, -300, 380, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke(); for (let i = -6; i <= 6; i++) line(i * 52, -300 - Math.sqrt(Math.max(0, 380 * 380 - (i * 52) ** 2)) * 0.32, i * 52, 0, '#1A1A1E', 6); P(rr(-260, -480, 520, 70, 8), '#2A2A30', SEPL, 4); txt('CROWN HILL', 0, -444, 44, SEPL); }); } },
  ], drift(t, d, 24), 0, lerp(1.0, 1.1, ease(t / d)));
  yearBadge('1945', 1560, 180, t - LINES.n32.dur * 0.45, SEPL);
  alpha(seg(t, 0.6, 1.0), () => tag('PEHLE: FISHTRAP CEMETERY', 80, 200, 30, SEPL));
  grain(t); vignette();
};
DRAW.western = (t, d) => {
  const map = t > LINES.n33.dur * 0.62 ? false : t > LINES.n33.dur * 0.08;
  if (map) {
    fillAll('#141018'); parchment(960, 520, 1400, 760, 0, () => { for (let i = 0; i < 10; i++) { line(-700, -380 + i * 84, 700, -380 + i * 84, 'rgba(120,80,40,0.15)', 2); line(-700 + i * 155, -380, -700 + i * 155, 380, 'rgba(120,80,40,0.15)', 2); } P(new Path2D('M-700 120 C-300 60 -100 200 200 100 S600 -40 700 0'), null, 'rgba(60,110,160,0.5)', 14); pin(-330, 140, '#7A1E1E'); txt('CLYDE · WESTERN HEIGHTS', -330, 190, 30, '#3A2414'); pin(260, -230, '#7A1E1E'); txt('BONNIE · CROWN HILL', 260, -180, 30, '#3A2414'); const k = seg(t, 0.8, 2.2); ctx.setLineDash([16, 12]); line(-330, 140, lerp(-330, 260, k), lerp(140, -230, k), '#9E2A22', 6); ctx.setLineDash([]); if (k >= 1) withT(-40, -60, back(seg(t, 2.2, 2.6)), 0, () => { P(rr(-120, -40, 240, 80, 40), '#9E2A22', C.ink, 4); txt('~9 MEEL', 0, 3, 44, C.white); }); });
    tag('SANKETIK NAKSHA', W - 300, 1010, 22, C.grey);
  } else {
    depth([
      { z: 0.03, draw: () => { sky('#20202E', '#A98A7A'); } },
      { z: 0.4, haze: 1, draw: () => { ground(720, '#3A3A30'); for (let i = 0; i < 10; i++) grave(100 + i * 200, 730, 0.4, '', '', '#6A6A62'); } },
      { z: 0.8, draw: () => { ground(860, '#4A4A3A'); withT(960, 940, 1.5, 0, () => { shadow(0, 8, 240, 0.4); P(rr(-260, -200, 520, 200, 10), '#8E8A82', C.ink, 5); txt('CLYDE', -130, -150, 34, '#2A2622'); txt('MARVIN', 130, -150, 34, '#2A2622'); line(0, -190, 0, -110, '#5A5650', 3); if (t > LINES.n33.dur * 0.7) handwrite('"Gone but not forgotten"', 0, -60, 34, t - LINES.n33.dur * 0.7, '#2A2622', 1.0); }); } },
    ], drift(t, d, 20), 0, lerp(1.0, 1.08, ease(t / d)));
    banner('WESTERN HEIGHTS', 'CLYDE · BHAI MARVIN KE BAGAL MEIN', 70, 120, t - 0.3, SEPL);
  }
  grain(t); vignette();
};
DRAW.court = (t, d) => {
  depth([
    { z: 0.03, draw: () => { sky('#1A1418', '#4A3A3A'); } },
    { z: 0.5, draw: () => { P(rr(200, 260, 1520, 600, 6), '#4A3020', C.ink, 5); for (let i = 0; i < 6; i++) P(rr(260 + i * 250, 320, 200, 480, 6), '#5A3A26', C.ink, 3); } },
    { z: 0.85, draw: () => { desk(960, 820, 1100); parchment(760, 700, 420, 300, -0.05, () => { txt('COURT ORDER', 0, -100, 40, '#7A1E1E'); for (let j = 0; j < 5; j++) { ctx.fillStyle = 'rgba(30,30,30,0.3)'; ctx.fillRect(-160, -50 + j * 30, 280 + rnd(j) * 40, 10); } txt('?', 140, 90, 90, '#7A1E1E'); }); gavel(1260, 760, 1.0, -0.4 + 0.3 * Math.abs(Math.sin(t * 1.5))); } },
  ], drift(t, d, 20), 0, lerp(1.0, 1.06, ease(t / d)));
  alpha(seg(t, 0.4, 0.8), () => tag('BONNIE KI BHATIJI · CLYDE KA BHATIJA', 80, 200, 30, SEPL));
  if (t > LINES.n34.dur * 0.72) withT(1400, 330, back(seg(t, LINES.n34.dur * 0.72, LINES.n34.dur * 0.72 + 0.4)), 0.04, () => { P(rr(-280, -70, 560, 140, 14), '#9E2A22', C.ink, 5); txt('2025: AB BHI CROWN HILL', 0, 4, 44, C.white); });
  grain(t); vignette();
};

// ===================== PART 6 : GTA 6
DRAW.bloomberg = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => neonCity(t) }, { z: 0.85, draw: () => { palmS(140, 1100, 1.3, t); palmS(1780, 1110, 1.2, t + 2); } }], drift(t, d, 30), 0, lerp(1.0, 1.06, ease(t / d)));
  withT(720, 500, back(seg(t, 0.3, 0.7)), -0.04, () => reportCard(0, 0, 1.1, 'BLOOMBERG · JULY 2022', 'JASON SCHREIER KI REPORT', 0, '#F2EEE3', '#2A2A3A'));
  if (t > LINES.n35.dur * 0.5) { const u = t - LINES.n35.dur * 0.5; withT(1400, 560, back(seg(u, 0, 0.4)), 0, () => { silhouette(-90, 260, 0.9, '#0A0410', 'hair'); silhouette(90, 260, 0.95, '#0A0410', null); glow(0, 0, 300, NEON, 0.25); }); alpha(seg(u, 0.4, 0.8), () => tag('2 LEAD KIRDAAR · LADKA + LADKI', 1150, 860, 30, CYAN)); }
  if (t > LINES.n35.dur * 0.78) withT(960, 230, back(seg(t, LINES.n35.dur * 0.78, LINES.n35.dur * 0.78 + 0.4)), 0, () => { P(rr(-430, -60, 860, 120, 60), '#0B0F17', SEPL, 4); txt('BONNIE & CLYDE KA ASAR?', 0, 4, 56, SEPL); });
  notAff(); vignette();
};
DRAW.trailer = (t, d) => {
  fillAll('#0A0610'); glow(960, 500, 800, NEON, 0.15);
  const u = lt('n36'); const names = u > LINES.n36.dur * 0.5;
  withT(960, 470, 1, 0, () => { P(rr(-640, -360, 1280, 720, 30), '#14101C', C.ink, 10); ctx.save(); ctx.beginPath(); ctx.roundRect(-620, -340, 1240, 680, 20); ctx.clip(); ctx.translate(-960, -540 + 70); neonCity(t); palmS(300, 1150, 1.2, t); palmS(1650, 1150, 1.1, t + 1); if (names) { silhouette(840, 1000, 1.1, '#05020A', 'hair'); silhouette(1080, 1000, 1.15, '#05020A', null); } ctx.restore(); });
  if (!names) { alpha(seg(u, 0.2, 0.6), () => tag('ROCKSTAR: US WAQT KOI JAWAAB NAHI', 560, 960, 32, C.grey)); }
  else { const v = u - LINES.n36.dur * 0.5; withT(520, 860, back(seg(v, 0.1, 0.5)), -0.04, () => { P(rr(-220, -50, 440, 100, 12), NEON, C.ink, 5); txt('LUCIA CAMINOS', 0, 4, 46, C.white); }); withT(1400, 860, back(seg(v, 0.6, 1.0)), 0.04, () => { P(rr(-220, -50, 440, 100, 12), CYAN, C.ink, 5); txt('JASON DUVAL', 0, 4, 46, C.ink); }); }
  notAff(); vignette();
};
function compareRow(t, leftFn, rightFn, lText, rText) {
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W / 2, H); ctx.clip(); leftFn(); sepiaGrade(0.3); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(W / 2, 0, W / 2, H); ctx.clip(); rightFn(); ctx.restore();
  line(W / 2, 0, W / 2, H, C.ink, 10);
  withT(480, 830, back(seg(t, 0.4, 0.8)), -0.03, () => { P(rr(-330, -56, 660, 112, 14), SEPL, C.ink, 5); txt(lText, 0, 4, 44, C.ink); });
  withT(1440, 830, back(seg(t, 1.2, 1.6)), 0.03, () => { P(rr(-330, -56, 660, 112, 14), NEON, C.ink, 5); txt(rText, 0, 4, 44, C.white); });
  if (t > 2.4) withT(960, 200, back(seg(t, 2.4, 2.8)), 0, () => { P(circ(0, 0, 70), C.green2, C.ink, 6); ctx.strokeStyle = C.white; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(-6, 24); ctx.lineTo(32, -24); ctx.stroke(); });
}
DRAW.match1 = (t, d) => {
  compareRow(t, () => { sky('#2A2A2E', '#6A6A6E'); ground(800, '#3A3A3E'); bonnie(480, 760, { t, s: 1.3, look: 0.5, mood: -0.3 }); bars(260, 720, 220, 800); }, () => { neonCity(t); withT(1440, 760, 1, 0, () => { silhouette(0, 0, 1.1, '#05020A', 'hair'); }); P(rr(1180, 160, 520, 70, 35), 'rgba(10,6,16,0.8)', CYAN, 3); txt('ROCKSTAR SITE KE MUTABIQ', 1440, 196, 30, CYAN); }, 'BONNIE · 1932 JAIL', 'LUCIA · JAIL SE BAAHAR');
  notAff(); grain(t, 120, 0.04); vignette();
};
DRAW.match2 = (t, d) => {
  compareRow(t, () => { sky('#2A3A4A', '#9AA6B0'); ground(800, '#4A4A42'); clyde(480, 760, { young: true, t, s: 1.35, look: 0.5, mood: -0.5 }); withT(240, 400, 1, -0.1, () => { P(rr(-90, -60, 180, 120, 8), '#E9E2D0', C.ink, 4); txt('NAVY', 0, -14, 40, '#2B4A7A'); txt('✗', 0, 34, 44, '#B8322A'); }); }, () => { neonCity(t); withT(1440, 760, 1, 0, () => silhouette(0, 0, 1.15, '#05020A', null)); withT(1700, 400, 1, 0.1, () => { P(rr(-90, -60, 180, 120, 8), '#3A4A2E', C.ink, 4); txt('ARMY', 0, -14, 40, '#D8E0C0'); txt('✓', 0, 34, 44, C.green); }); }, 'CLYDE · NAVY KA SAPNA', 'JASON · ARMY MEIN RAHA');
  notAff(); grain(t, 120, 0.04); vignette();
};
DRAW.way = (t, d) => {
  const u = lt('n39'); const turn = seg(u, LINES.n39.dur * 0.55, LINES.n39.dur * 0.75);
  fillAll('#08060C');
  alpha(1 - turn, () => { neonCity(t); withT(960, 860, 1, 0, () => { P(rr(-140, -420, 280, 420, 10), '#FFE8F4', C.ink, 6); glow(0, -210, 380, NEON, 0.5); silhouette(-20, 0, 1.0, '#05020A', 'hair'); }); alpha(seg(u, 0.6, 1.0), () => txtStroke('"BAAHAR NIKALNE KA RAASTA"', 960, 200, 70, C.white, C.ink, 10)); });
  alpha(turn, () => { sky('#4A5A6A', '#F0DAB0'); ground(700, '#4A5A3A'); for (let i = 0; i < 9; i++) tree(-80 + i * 260, 710, 0.6, '#2A3420', t + i); ground(820, '#6A5A3A'); P(poly([900, 820, 1020, 820, 1700, 1100, 220, 1100]), '#9A8060', null); sepiaGrade(0.3); alpha(seg(u, LINES.n39.dur * 0.8, LINES.n39.dur * 0.9), () => tag('LOUISIANA · 23 MAY 1934', 760, 200, 34, SEPL)); });
  if (turn < 0.5) notAff(); grain(t); vignette();
};
DRAW.launch = (t, d) => {
  depth([{ z: 0.05, haze: 1, draw: () => neonCity(t) }, { z: 0.85, draw: () => { palmS(140, 1100, 1.3, t); palmS(1780, 1110, 1.2, t + 2); } }], drift(t, d, 30), 0, lerp(1.0, 1.06, ease(t / d)));
  calCard(520, 500, 1.0, 'NOVEMBER', '19', 'LAUNCH', NEON, -0.05);
  if (t > LINES.n40.dur * 0.35) { const v = cnt(t, LINES.n40.dur * 0.35, 1.6, 184) / 100; bigNum('$' + v.toFixed(2) + ' ARAB', 1260, 470, 120, t - LINES.n40.dur * 0.35, C.green); alpha(seg(t, LINES.n40.dur * 0.5, LINES.n40.dur * 0.6), () => tag('SENSOR TOWER KA ANUMAAN · LAUNCH DAY TAK', 900, 640, 28, C.grey)); }
  notAff(); vignette();
};
DRAW.controller = (t, d) => {
  const u = lt('n41'); const right = u > LINES.n41.dur * 0.45;
  fillAll('#0A0810');
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W / 2, H); ctx.clip(); neonCity(t); withT(480, 540, 1.6, 0, () => controller(0, 0, 1, t)); withT(480, 820, back(seg(u, 0.4, 0.8)), 0, () => { P(rr(-250, -46, 500, 92, 46), 'rgba(10,6,16,0.85)', CYAN, 4); txt('GAME: AAP CHUNTE HAIN', 0, 3, 38, CYAN); }); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(W / 2, 0, W / 2, H); ctx.clip(); fillAll('#140E0A'); dust(t, 20);
  withT(1440, 480, 1, 0.03, () => { shadow(0, 290, 220, 0.4); P(rr(-230, -280, 460, 560, 10), '#EAD9B0', C.ink, 6); P(rr(-200, -250, 400, 400, 4), '#C9A878', C.ink, 4); ctx.save(); ctx.beginPath(); ctx.rect(-200, -250, 400, 400); ctx.clip(); sky('#B98A5A', '#E9C891'); silhouette(-60, 140, 0.85, '#3A2414', 'beret'); silhouette(70, 140, 0.9, '#3A2414', 'fedora'); ctx.restore(); txt('1934', 0, 210, 50, '#3A2414'); });
  if (right) withT(1440, 860, back(seg(u, LINES.n41.dur * 0.6, LINES.n41.dur * 0.6 + 0.4)), 0, () => { P(rr(-280, -46, 560, 92, 46), 'rgba(20,12,8,0.9)', SEPL, 4); txt('ASLI ANT: BADLA NAHI JA SAKTA', 0, 3, 34, SEPL); });
  sepiaGrade(0.25); ctx.restore();
  line(W / 2, 0, W / 2, H, C.ink, 10);
  notAff(); grain(t, 120, 0.04); vignette();
};
DRAW.empty = (t, d) => {
  depth([
    { z: 0.03, draw: () => { sky('#141024', '#8A4A4E'); glow(960, 760, 800, '#E79A7A', 0.35); } },
    { z: 0.35, haze: 1, draw: () => { ground(720, '#2A2430'); for (let i = 0; i < 10; i++) grave(100 + i * 200, 730, 0.4, '', '', '#5A5A62'); } },
    { z: 0.8, draw: () => { ground(860, '#3A3430'); grave(700, 940, 1.1, 'CLYDE', 'WESTERN HEIGHTS'); emptyPlot(1160, 970, 1.15, t); withT(1160, 960, 1.1, wob(t, 0.4, 0.06), () => flower(0, 0, 1.2, '#E8486A')); for (let i = 0; i < 18; i++) { const lx = (rnd(i) * W + t * 60 * (0.5 + rnd(i + 3))) % W, ly = 300 + rnd(i + 5) * 600 + Math.sin(t + i) * 30; alpha(0.6, () => P(ell(lx, ly, 10, 5, t + i), '#C98A4A', null)); } } },
  ], 0, 0, lerp(1.0, 1.18, ease(t / d)));
  alpha(seg(t, 1.2, 2.0), () => txtStroke('92 SAAL… INTEZAAR', 960, 230, 92, SEPL, C.ink, 14));
  grain(t); vignette();
};
DRAW.question = (t, d) => {
  fillAll('#0E0A08'); paperTex(0, 0, W, H, 41); glow(960, 500, 700, '#FFC46A', 0.12);
  handwrite('Bonnie ko Clyde ke paas dafnaaya jaaye?', 960, 330, 74, t - 0.3, C.white, 1.2);
  handwrite('…ya maa ka faisla sahi tha?', 960, 460, 80, t - LINES.n43.dur * 0.5, SEPL, 1.0);
  if (t > LINES.n43.dur * 0.75) { for (let i = 0; i < 3; i++) withT(560 + i * 400, 790, back(seg(t, LINES.n43.dur * 0.75 + i * 0.3, LINES.n43.dur * 0.75 + 0.4 + i * 0.3)), 0, () => { P(rr(-170, -70, 340, 140, 30), ['#5A3A26', '#2E5A4A', '#6A2A3A'][i], C.ink, 5); for (let j = 0; j < 3; j++) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-130, -36 + j * 26, 200 + rnd(i + j) * 50, 12); } }); txt('COMMENT MEIN BATAAIYE', 960, 640, 60, C.green); }
  grain(t); vignette();
};
