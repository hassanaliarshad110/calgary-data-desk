// ===== scenes for "NVIDIA ke Boss ke Peeche Chini Jasoos?"
let GT = 0; // global time
function act(id) { const L = LINES[id]; return L && GT >= L.start && GT < L.start + L.dur; }
function talk(id) { const L = LINES[id]; if (!L) return 0; const k = Math.floor((GT - L.start) * 30); const a = AMP[id]; if (k < 0 || k >= a.length) return 0; return a[k]; }
function lt(id) { return GT - LINES[id].start; } // time since line start
KINDS.j93 = { body: '#2F4A7A', body2: '#253B62', skin: C.skin, hair: 'jensen', hairCol: '#16161A', h: 1, glasses: true };

// ---------- shared sets ----------
function dinnerSet(t, o = {}) {
  // wall + window w/ Singapore skyline
  ctx.fillStyle = grad(0, H, '#1C2235', '#0E1220'); ctx.fillRect(-200, -200, W + 400, H + 400);
  P(rr(330, 90, 1260, 470, 8), '#0A1328', C.ink, 8);
  ctx.save(); ctx.beginPath(); ctx.rect(334, 94, 1252, 462); ctx.clip();
  ctx.fillStyle = grad(94, 556, '#0B1530', '#23365E'); ctx.fillRect(330, 90, 1260, 470); stars(40);
  ctx.save(); ctx.translate(0, 0); skyline(600, '#16233F', 11, 330, C.amber, 50); skyline(640, '#1B2B4C', 37, 200, '#FFE7A8', 70); ctx.restore();
  ctx.globalAlpha = 0.08; ctx.fillStyle = '#fff'; ctx.fillRect(330, 90, 1260, 470); ctx.globalAlpha = 1;
  ctx.restore();
  line(960, 90, 960, 560, C.ink, 8); line(330, 325, 1590, 325, C.ink, 6);
  // lamps
  for (const lx of [200, 1720]) { line(lx, 0, lx, 120, C.ink, 4); P(poly([lx - 60, 190, lx + 60, 190, lx + 30, 120, lx - 30, 120]), C.amber2, C.ink, 4); glow(lx, 260, 260, C.amber, 0.35); }
  // floor
  ctx.fillStyle = '#2A1B14'; ctx.fillRect(-200, 860, W + 400, 400);
  // people
  const tk = o.toast || 0;
  if (o.noAlice) { P(rr(1130, 520, 190, 300, 30), '#3A2418', C.ink, 6); P(rr(1150, 545, 150, 250, 22), '#4B2E1E', null); }
  if (!o.noJensen) person(700, 1030, 'jensen', { t, talk: o.jt || 0, look: 0.6, mood: 1, s: 1.55, arms: [[0.2, 0.15], [0.3 + tk * 2.2, 0.5 - tk * 0.4]], prop: tk > 0.05 ? (l, r) => wineGlass(r[0], r[1] + 6, 1.1) : null });
  if (!o.noAlice) person(1220, 1030, 'alice', { t, talk: o.at || 0, look: -0.6, mood: 1, s: 1.5, seed: 1.3, arms: [[0.3 + tk * 2.2, 0.5 - tk * 0.4], [-0.2, -0.15]], prop: tk > 0.05 ? (l, r) => wineGlass(l[0], l[1] + 6, 1.1) : null });
  // table
  table(960, 770, 1140, null, '#EDE3CC');
  ctx.globalAlpha = 0.25; ctx.fillStyle = '#B9A98A'; ctx.fillRect(402, 804, 1116, 150); ctx.globalAlpha = 1;
  candle(915, 780, t, 1.15); candle(1010, 780, t + 1.3, 1.0);
  if (!tk) { wineGlass(810, 780, 1.1, '#7A1426'); if (!o.noAlice) wineGlass(1110, 780, 1.1, '#7A1426'); }
  P(ell(620, 784, 80, 13), '#FFFFFF', C.ink, 3); if (!o.noAlice) P(ell(1300, 784, 80, 13), '#FFFFFF', C.ink, 3);
  if (o.waiter !== undefined) { const wx = lerp(-200, W + 200, o.waiter); person(wx, 1130, 'staff', { t, walk: o.waiter * 8, s: 1.25, look: 1, prop: (l, r) => { P(ell(r[0], r[1] - 10, 70, 12), '#ccc', C.ink, 3); } }); }
}

const DRAW = {};
// ===================== HOOK
DRAW.dinner = (t, d) => {
  const k = ease(seg(t, 3.0, d)); cam(lerp(960, 760, k), lerp(540, 600, k), lerp(1.0, 1.2, k), () => dinnerSet(t, { waiter: seg(t, 0.4, 4.6) }));
  vignette(); banner('SINGAPORE', null, 70, 120, t - 0.5, C.amber);
  if (t > 3.2) banner('JENSEN HUANG', 'CEO, NVIDIA', 70, 250, t - 3.4, C.green);
};
DRAW.alice = (t, d) => {
  const k = ease(seg(t, 0, 2.2)); cam(lerp(760, 1160, k), 600, lerp(1.2, 1.3, k), () => dinnerSet(t, {}));
  vignette(); if (t > 0.8) banner('ALICE HUANG', 'MEGASPEED · KOI RISHTEDAAR NAHI', 1240, 130, t - 1.0, C.red);
};
DRAW.agents = (t, d) => {
  fillAll('#070B14'); ctx.fillStyle = grad(0, H, '#0B1224', '#05080F'); ctx.fillRect(0, 0, W, H);
  // facade across street
  P(rr(860, 60, 1000, 700, 4), '#2A1E1A', C.ink, 6);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const lit = (i == 1 && j == 1); P(rr(910 + i * 230, 110 + j * 210, 170, 150, 4), lit ? '#F7C66B' : '#141A28', C.ink, 4); if (lit) { glow(1225, 395, 260, C.amber, 0.4); person(1190, 470, 'jensen', { t, s: 0.32 }); person(1265, 470, 'alice', { t, s: 0.32 }); } }
  rain(t, 160);
  // agents foreground
  const k = ease(seg(t, 0, 1.2));
  person(lerp(260, 330, k), 1160, 'agent2', { t, s: 1.35, look: 1, mood: 0, shades: true, arms: [[0.2, 0.1], [-0.2, -0.1]] });
  person(lerp(560, 620, k), 1140, 'agent', { t, s: 1.3, look: 1, mood: 0, arms: [[0.9, 0.9], [-1.2, -0.3]], prop: (l, r) => camera(r[0] + 10, r[1] - 60, 1, Math.max(0, 1 - Math.abs(t - 1.4) * 5, 1 - Math.abs(t - 2.6) * 5)) });
  // polaroids
  for (let i = 0; i < 2; i++) { const pt = t - (1.5 + i * 1.2); if (pt > 0) withT(1500 + i * 170, 760 + i * 30, 1, lerp(0.4, -0.12 + i * 0.2, easeOut(seg(pt, 0, 0.4))), () => { P(rr(-110, -120, 220, 250, 4), C.white, C.ink, 4); P(rr(-95, -105, 190, 180, 2), '#1E2A44', null); person(-35, 70, 'jensen', { t: 0, s: 0.42 }); person(40, 70, 'alice', { t: 0, s: 0.42 }); }); }
  vignette();
};
DRAW.cork = (t, d) => {
  ctx.fillStyle = '#7A5534'; ctx.fillRect(0, 0, W, H); paperTex(0, 0, W, H, 9);
  cam(960, 540, lerp(1.05, 1.15, t / d), () => {
    function card(x, y, r, fn, lab) { withT(x, y, 1, r, () => { P(rr(-130, -150, 260, 300, 4), C.white, C.ink, 4); P(rr(-115, -135, 230, 210, 2), '#24324E', null); ctx.save(); ctx.beginPath(); ctx.rect(-115, -135, 230, 210); ctx.clip(); fn(); ctx.restore(); txt(lab, 0, 118, 30, C.ink, 'Kalam', 700); P(circ(0, -140, 12), C.red, C.ink, 3); }); }
    card(560, 520, -0.06, () => person(0, 160, 'alice', { t: 0, s: 0.62 }), 'ALICE HUANG');
    card(1380, 520, 0.05, () => person(0, 160, 'jensen', { t: 0, s: 0.62 }), 'JENSEN HUANG');
    // MSS card
    withT(960, 240, 1, 0.04, () => { P(rr(-140, -80, 280, 160, 4), C.red2, C.ink, 4); txt('MSS', 0, -10, 70, C.amber); txt("China ki khufiya agency", 0, 50, 24, C.paper, 'Oswald', 500); P(circ(0, -80, 12), C.amber, C.ink, 3); });
    const k1 = ease(seg(t, 0.6, 1.8)), k2 = ease(seg(t, 2.2, 3.4));
    ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(560, 370); ctx.lineTo(lerp(560, 960, k1), lerp(370, 160, k1)); ctx.stroke();
    if (k2 > 0) { ctx.beginPath(); ctx.moveTo(560, 370); ctx.lineTo(lerp(560, 1380, k2), 370 + Math.sin(k2 * 3.14) * 160); ctx.stroke(); }
    if (t > 3.5) stamp('CLASSIFIED', 960, 820, 80, C.red, t - 3.5);
  });
  vignette();
};
DRAW.toast = (t, d) => {
  const tk = act('d01') || GT > LINES.d01.start ? ease(seg(GT, LINES.d01.start - 0.4, LINES.d01.start + 0.2)) : 0;
  cam(960, 620, lerp(1.25, 1.32, t / d), () => dinnerSet(t, { toast: tk, jt: talk('d01') }));
  if (tk > 0.9) { const c = seg(GT, LINES.d01.start + 0.3, LINES.d01.start + 0.9); if (c > 0 && c < 1) { for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; ctx.strokeStyle = C.amber; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(960 + Math.cos(a) * 40 * (1 + c), 420 + Math.sin(a) * 40 * (1 + c)); ctx.lineTo(960 + Math.cos(a) * 80 * (1 + c), 420 + Math.sin(a) * 80 * (1 + c)); ctx.stroke(); } } }
  vignette(); if (act('d01')) dramaTag(lt('d01'));
  if (act('n06') && lt('n06') > 0.9) bubble('?', 560, 250, lt('n06') - 0.9, 1, 60);
};
DRAW.tease = (t, d) => {
  fillAll(C.bg3);
  const panels = [[C.amber, 0, (x, y) => { toilet(x, y + 120, 1.6); withT(x + 120, y - 20, 1.4, -0.6 + wob(t, 2, 0.3), () => { line(0, 0, 0, 140, C.ink, 10); P(rr(-24, 130, 48, 40, 8), '#3A7BD5', C.ink, 4); }); }],
  [C.green2, 3.3, (x, y) => { chip(x, y - 40, 1.4, t); moneyStack(x - 120, y + 170, 6); moneyStack(x + 120, y + 170, 8); }],
  [C.red2, 6.4, (x, y) => { person(x, y + 230, 'alice', { t, s: 1.25, shades: true, mood: 0 }); }]];
  panels.forEach(([col, st, fn], i) => {
    const k = easeOut(seg(t, st, st + 0.5)); if (k <= 0) return;
    const x = 330 + i * 630; withT(x, lerp(1300, 450, k), 1, (i - 1) * 0.03, () => { P(rr(-270, -330, 540, 660, 12), col, C.ink, 8); ctx.save(); ctx.clip(rr(-270, -330, 540, 660, 12)); fn(0, -40); ctx.restore(); P(rr(-270, -330, 540, 660, 12), null, C.ink, 8); });
  });
  const lab = ['TOILET', 'TRILLION', 'JASOOS?']; lab.forEach((s, i) => { const k = seg(t, [0.8, 4.1, 7.2][i], [1.2, 4.5, 7.6][i]); if (k > 0) stamp(s, 330 + i * 630, 850, 64, C.white, k * 0.18, (i - 1) * 0.08); });
  vignette();
};
DRAW.title = (t, d) => {
  fillAll('#0A0D16'); ctx.strokeStyle = 'rgba(226,72,61,0.5)'; ctx.lineWidth = 4;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(rnd(i) * W, 0); ctx.lineTo(rnd(i + 4) * W, H); ctx.stroke(); }
  const k = easeOut(seg(t, 0, 0.25)); const sh = t < 0.5 ? wob(t, 20, 10 * (1 - t * 2)) : 0;
  withT(960 + sh, 470, lerp(1.6, 1, k), 0, () => { alpha(k, () => { txtStroke('NVIDIA KE BOSS KE PEECHE', 0, -80, 92, C.white, C.ink, 14); txtStroke('CHINI JASOOS?', 0, 50, 170, C.red, C.ink, 20); }); });
  if (t > 0.6) handwrite('ek sachchi kahaani — reports ke mutabiq', 960, 720, 54, t - 0.6, C.amber, 1.0);
  vignette();
};
function chapter(n, title) { return (t, d) => { fillAll('#0B0F17'); paperTex(0, 0, W, H, n * 13); handwrite('Part ' + n, 960, 400, 60, t - 0.1, C.amber, 0.4); handwrite(title, 960, 540, 120, t - 0.5, C.white, 0.9); const k = seg(t, 1.3, 1.8); ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(960 - 380 * k, 640); ctx.lineTo(960 + 380 * k, 640); ctx.stroke(); vignette(); sceneFade(t, d, 0.2, 0.25); }; }
DRAW.ch1 = chapter(1, 'Toilet se Trillion tak'); DRAW.ch2 = chapter(2, 'Jaadu ki Chip'); DRAW.ch3 = chapter(3, 'Band Darwaaza');
DRAW.ch4 = chapter(4, 'Megaspeed'); DRAW.ch5 = chapter(5, 'Khufiya Memo'); DRAW.ch6 = chapter(6, 'Ek Khat');

// ===================== PART 1
DRAW.flight = (t, d) => {
  fillAll('#163A5C'); ctx.globalAlpha = 0.15; for (let i = 0; i < 30; i++) { ctx.strokeStyle = '#9CC9F0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(rnd(i) * W, rnd(i + 2) * H, 20 + rnd(i + 5) * 30, 0.3, 2.6); ctx.stroke(); } ctx.globalAlpha = 1;
  cam(960, 540, lerp(1.08, 1.0, t / d), () => {
    P(poly([300, 520, 330, 470, 360, 500, 370, 600, 330, 680, 300, 640]), '#7DB36A', C.ink, 5); txt('TAIWAN', 335, 730, 40, C.white);
    const us = poly([1250, 300, 1600, 260, 1820, 340, 1840, 520, 1700, 700, 1500, 760, 1330, 640, 1220, 500]); P(us, '#C9A86B', C.ink, 6); paperTex(1220, 260, 620, 500, 3); txt('AMERICA', 1540, 500, 56, C.ink);
    const k = ease(seg(t, 0.8, d - 1.2)); ctx.setLineDash([16, 14]); ctx.strokeStyle = C.white; ctx.lineWidth = 5; ctx.beginPath();
    for (let i = 0; i <= 60 * k; i++) { const u = i / 60; const x = lerp(360, 1300, u), y = lerp(560, 480, u) - Math.sin(u * 3.14) * 300; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.setLineDash([]);
    const px = lerp(360, 1300, k), py = lerp(560, 480, k) - Math.sin(k * 3.14) * 300; const ang = Math.atan2((lerp(560, 480, k + 0.01) - Math.sin((k + 0.01) * 3.14) * 300) - py, lerp(360, 1300, k + 0.01) - px);
    withT(px, py, 1.1, ang, () => { P(rr(-50, -12, 100, 24, 12), C.white, C.ink, 4); P(poly([-10, -10, 15, -10, -5, -55]), C.white, C.ink, 4); P(poly([-10, 10, 15, 10, -5, 55]), C.white, C.ink, 4); P(poly([-50, -4, -38, -4, -52, -28]), C.white, C.ink, 3); });
  });
  // window inset w/ kids
  const ik = back(seg(t, 1.6, 2.2)); if (ik > 0) withT(880, 780, ik, 0, () => { P(rr(-200, -150, 400, 280, 120), '#BFD8F0', C.ink, 8); ctx.save(); ctx.clip(rr(-200, -150, 400, 280, 120)); ctx.fillStyle = '#BFD8F0'; ctx.fillRect(-200, -150, 400, 280); person(-70, 250, 'brother', { t, s: 0.9, arms: [[0.2, 0.1], [-2.6, -0.3 + wob(t, 1.5, 0.3)]] }); person(70, 250, 'jkid', { t, s: 0.9, look: -0.3 }); ctx.restore(); });
  banner('1973', 'NAU SAAL KA JENSEN', 70, 120, t - 0.6, C.amber);
  vignette();
};
DRAW.school = (t, d) => {
  ctx.fillStyle = grad(0, 700, '#3B5E8A', '#9CB8D4'); ctx.fillRect(0, 0, W, H);
  P(ell(400, 760, 900, 260), '#3E6B3A', null); P(ell(1600, 780, 900, 280), '#355E32', null);
  ctx.fillStyle = '#4C7A3F'; ctx.fillRect(0, 760, W, 400);
  // building
  P(rr(560, 300, 800, 420, 4), '#9E4A35', C.ink, 6); for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) P(rr(610 + i * 150, 360 + j * 150, 90, 110, 4), '#2A3550', C.ink, 4);
  P(poly([540, 300, 960, 160, 1380, 300]), '#5A2A22', C.ink, 6); P(rr(900, 560, 120, 160, 4), '#3E2716', C.ink, 4);
  P(rr(1420, 560, 380, 120, 6), C.paper, C.ink, 5); txt('ONEIDA BAPTIST', 1610, 600, 36, C.ink); txt('INSTITUTE · KENTUCKY', 1610, 645, 28, '#5A4A2A', 'Oswald', 500); line(1500, 680, 1500, 780, C.ink, 8); line(1720, 680, 1720, 780, C.ink, 8);
  // uncle car leaving
  const ck = seg(t, 0.2, 3.0); car(lerp(700, -300, ease(ck)), 900, 1.4, '#C0392B'); if (t < 2.4) bubble('Bahut achha school!', lerp(700, -300, ease(ck)) + 60, 790, t - 0.3, 1, 30);
  // kids
  person(820, 1000, 'brother', { t, s: 1.15, look: 0.5, mood: t > 3.6 ? -1 : 0.5, brow: t > 3.6 ? -1 : 0, prop: (l, r) => P(rr(r[0] - 30, r[1], 60, 50, 6), '#7A5C3E', C.ink, 4) });
  person(960, 1000, 'jkid', { t, s: 1.2, look: 0.5, mood: t > 3.6 ? -1 : 0.5, brow: t > 3.6 ? -1 : 0, prop: (l, r) => P(rr(r[0] - 26, r[1], 52, 44, 6), '#3A6EA5', C.ink, 4) });
  if (t > 3.6) { for (let i = 0; i < 3; i++) { const k = back(seg(t, 3.6 + i * 0.25, 4.0 + i * 0.25)); withT(1180 + i * 170, 1010, k, 0, () => person(0, 0, ['guest', 'roommate', 'staff'][i], { t: t + i, s: 0.95, mood: -1, brow: 1 })); } stamp('SUDHAAR-GHAR', 760, 230, 80, C.red, t - 3.9, -0.1); }
  vignette();
};
DRAW.chores = (t, d) => {
  const sp = easeOut(seg(t, 0, 0.5));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W / 2 - 6, H); ctx.clip();
  ctx.fillStyle = grad(0, 500, '#E9B66B', '#F4D9A0'); ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#6E8E3A'; ctx.fillRect(0, 520, W, 600);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) { const x = i * 120 + (r % 2) * 60 - 40, y = 560 + r * 140; P(ell(x, y, 46, 70), '#4E7A2A', C.ink, 3); P(ell(x - 20, y - 30, 30, 50, -0.5), '#5E9032', C.ink, 3); }
  person(480, 1020, 'brother', { t, s: 1.3, walk: t * 0.5, mood: -0.5, arms: [[0.4, 0.3], [-0.8 - wob(t, 1, 0.3), -1.0]], prop: (l, r) => P(rr(r[0] - 40, r[1] - 10, 80, 60, 10), '#A0723E', C.ink, 4) });
  P(rr(40, 40, 230, 70, 6), C.ink, null); txt('BHAI', 155, 75, 44, C.amber); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(W / 2 + 6, 0, W / 2, H); ctx.clip(); ctx.translate((1 - sp) * 960, 0);
  ctx.fillStyle = '#CFE0E3'; ctx.fillRect(W / 2, 0, W / 2, H); ctx.strokeStyle = '#A9C2C6'; ctx.lineWidth = 3; for (let i = 0; i < 20; i++) { line(W / 2 + i * 60, 0, W / 2 + i * 60, H, '#A9C2C6', 3); line(W / 2, i * 60, W, i * 60, '#A9C2C6', 3); }
  ctx.fillStyle = '#8FB0B5'; ctx.fillRect(W / 2, 800, W / 2, 300);
  for (let i = 0; i < 3; i++) { toilet(1160 + i * 270, 860, 1.25); P(rr(1040 + i * 270, 380, 16, 480, 2), '#7C9AA0', C.ink, 3); }
  person(1430, 1020, 'jkid', { t, s: 1.3, look: 0.6, mood: 0, arms: [[0.2, 0.1], [-1.2 + wob(t, 2.5, 0.35), -0.6]], prop: (l, r) => withT(r[0], r[1], 1, 0.4 + wob(t, 2.5, 0.35), () => { line(0, 0, 50, -60, C.ink, 8); P(rr(40, -90, 46, 34, 8), '#3A7BD5', C.ink, 4); }) });
  for (let i = 0; i < 8; i++) { const bt = (t * 0.7 + rnd(i)) % 1; P(circ(1500 + rnd(i + 3) * 200, 800 - bt * 300, 8 + rnd(i) * 10), 'rgba(255,255,255,0.7)', '#7BA6D8', 2); }
  P(rr(W / 2 + 40, 40, 300, 70, 6), C.ink, null); txt('JENSEN', W / 2 + 190, 75, 44, C.green); ctx.restore();
  line(W / 2, 0, W / 2, H, C.ink, 12); vignette();
};
DRAW.roomie = (t, d) => {
  ctx.fillStyle = '#4E5B6E'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#3A4352'; ctx.fillRect(0, 820, W, 300);
  P(rr(140, 300, 520, 560, 6), null, C.ink, 8); P(rr(160, 420, 480, 60, 8), '#8C9BB0', C.ink, 4); P(rr(160, 720, 480, 60, 8), '#8C9BB0', C.ink, 4); // bunk
  P(rr(1350, 160, 300, 220, 4), '#203045', C.ink, 6); txt('DORM', 1500, 270, 40, '#5F7590');
  cam(960, 560, lerp(1.0, 1.12, t / d), () => {
    person(1060, 1010, 'roommate', { t, s: 1.4, look: -0.3, mood: t > 4.5 ? -0.3 : 0, brow: t > 4.5 ? -1 : 1, arms: [[0.5, 0.6], [-0.6, -0.8]], prop: (l, r, top, hy) => { P(rr(-40, hy - 80, 90, 22, 6), C.white, C.ink, 3); line(-30, hy - 70, 40, hy - 70, C.red, 3); if (t > 4.5) withT((l[0] + r[0]) / 2, l[1] - 20, 1, Math.PI, () => { P(rr(-70, -40, 140, 90, 6), '#9E2A22', C.ink, 4); line(0, -40, 0, 50, C.ink, 3); txt('ABC', -35, 5, 26, C.paper); }); } });
    person(720, 1010, 'jkid', { t, s: 1.15, look: 0.8, mood: 0.6 });
  });
  const tags = [['17 SAAL', 1.0, 1500, 420], ['TATTOO', 2.1, 1560, 540], ['CHAAKU KE NISHAAN', 3.0, 1560, 660]];
  tags.forEach(([s, st, x, y]) => { if (t > st) withT(x, y, back(seg(t, st, st + 0.3)), 0, () => { ctx.font = '700 40px Oswald'; const w = ctx.measureText(s).width + 40; P(rr(-w / 2, -32, w, 64, 8), C.amber, C.ink, 4); txt(s, 0, 2, 40, C.ink); }); });
  if (t > 4.6) bubble('?', 1180, 380, t - 4.6, -1, 70);
  vignette();
};
DRAW.teach = (t, d) => {
  const half = LINES.n12.start + 2.5 - (GT - t);
  ctx.fillStyle = '#4E5B6E'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#3A4352'; ctx.fillRect(0, 820, W, 300);
  if (t < half) {
    P(rr(1100, 200, 640, 400, 8), '#25463A', '#6B4A2A', 14); const letters = 'A  B  C'; handwrite(letters, 1420, 360, 110, t - 0.3, C.white, 1.2); handwrite('padhna', 1420, 500, 70, t - 1.2, C.amber, 0.8);
    person(760, 1000, 'roommate', { t, s: 1.3, look: 0.8, talk: wob(t, 2.2, 0.5) > 0.2 ? 0.5 : 0, mood: 1 });
    person(1000, 1000, 'jkid', { t, s: 1.15, look: 0.8, arms: [[0.2, 0.1], [-2.4, 0.2]] });
  } else {
    const u = t - half; const lift = (Math.sin(u * 3.2) + 1) / 2;
    P(rr(620, 760, 560, 40, 8), '#2B2B2B', C.ink, 5); line(680, 800, 680, 900, C.ink, 10); line(1120, 800, 1120, 900, C.ink, 10);
    // kid lying (rotated)
    withT(900, 740, 1.1, -Math.PI / 2, () => person(0, 0, 'jkid', { t, s: 1, mood: -0.3, brow: 1, arms: [[-2.8 + lift * 0.4, 0.2], [2.8 - lift * 0.4, -0.2]] }));
    const by = 600 - lift * 90; line(560, by, 1240, by, '#888', 12); P(rr(560, by - 70, 40, 140, 6), '#333', C.ink, 4); P(rr(1200, by - 70, 40, 140, 6), '#333', C.ink, 4);
    person(1450, 1000, 'roommate', { t, s: 1.3, look: -0.8, talk: talk('n12') > 0.3 ? 0.4 : 0, mood: 1, arms: [[0.3, 0.2], [-1.3, -1.0]] });
    banner('BENCH PRESS', null, 80, 120, u - 0.2, C.green);
  }
  vignette();
};
DRAW.diner = (t, d) => {
  const shots = [0, 2.6, 4.4, 6.2];
  if (t < shots[1]) {
    fillAll('#0B1020'); stars(60); P(circ(1650, 160, 60), '#F2EBD0', null);
    P(rr(300, 420, 1320, 520, 10), '#2A1F2E', C.ink, 6); P(rr(350, 520, 1220, 260, 6), '#F4D06F', C.ink, 5); glow(960, 650, 600, C.amber, 0.3);
    for (let i = 0; i < 5; i++) person(470 + i * 240, 780, ['guest', 'staff', 'agent2', 'guest', 'staff'][i], { t: t + i, s: 0.5 });
    const fl = (Math.floor(t * 9) % 7 == 0) ? 0.3 : 1; alpha(fl, () => { glow(960, 330, 400, '#FF4F6A', 0.5); txtStroke('DINER', 960, 330, 150, '#FF8FA0', '#FF2E55', 10, 'Oswald', 700); });
    txtStroke('OPEN 24 HRS', 1380, 470, 40, C.green, '#0B6', 3); ctx.fillStyle = '#1A1A1A'; ctx.fillRect(0, 940, W, 200);
    banner('15 SAAL · RAAT KI SHIFT', null, 70, 120, t - 0.4, C.amber);
  } else {
    ctx.fillStyle = '#E8DCC0'; ctx.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) { ctx.fillStyle = (i % 2) ? '#C9302C' : '#F3EDE0'; ctx.fillRect(i * 60, 860, 60, 30); ctx.fillStyle = (i % 2) ? '#F3EDE0' : '#C9302C'; ctx.fillRect(i * 60, 890, 60, 30); }
    ctx.fillStyle = '#3A3A3A'; ctx.fillRect(0, 920, W, 200);
    const idx = t < shots[2] ? 0 : t < shots[3] ? 1 : 2; const u = t - shots[idx + 1];
    const labels = ['DISHWASHER', 'BUSBOY', 'WAITER'];
    if (idx == 0) { P(rr(560, 640, 800, 220, 8), '#AEB8C2', C.ink, 6); P(rr(620, 660, 680, 120, 6), '#5E8FB3', C.ink, 4); for (let i = 0; i < 6; i++) P(ell(1500, 840 - i * 22, 90, 16), C.white, C.ink, 3); person(960, 1000, 'jteen', { t, s: 1.4, mood: 0.3, arms: [[-0.6 + wob(t, 2, 0.4), -0.9], [0.6 - wob(t, 2, 0.4), 0.9]] }); for (let i = 0; i < 6; i++) { const bt = (t + rnd(i)) % 1; P(circ(900 + rnd(i) * 140, 650 - bt * 120, 8), 'rgba(255,255,255,0.8)', '#7BA6D8', 2); } }
    if (idx == 1) { table(1300, 700, 500); person(lerp(500, 900, ease(seg(u, 0, 1))), 1000, 'jteen', { t, s: 1.4, walk: u * 1.5, arms: [[-1.2, -0.4], [1.2, 0.4]], prop: (l, r) => { P(rr(l[0] - 20, l[1] - 30, r[0] - l[0] + 40, 22, 4), '#6B4A2A', C.ink, 4); for (let i = 0; i < 3; i++) P(ell(l[0] + 30 + i * 30, l[1] - 40, 22, 8), C.white, C.ink, 2); } }); }
    if (idx == 2) { table(1250, 700, 520); person(1100, 860, 'guest', { t, s: 1.1 }); person(1400, 860, 'agent2', { t, s: 1.1, seed: 2 }); person(700, 1000, 'jteen', { t, s: 1.4, mood: 1, talk: wob(t, 3, 0.5) > 0 ? 0.4 : 0, arms: [[0.3, 0.2], [-1.4, -1.2]], prop: (l, r) => P(rr(r[0] - 20, r[1] - 50, 44, 60, 4), C.white, C.ink, 3) }); }
    withT(1500, 200, back(seg(u, 0, 0.3)), -0.05, () => { P(rr(-220, -50, 440, 100, 10), C.ink, null); txt(labels[idx], 0, 2, 64, C.amber); });
    for (let i = 0; i < 3; i++) { P(circ(160 + i * 80, 200, 26), i <= idx ? C.green : '#555', C.ink, 4); }
  }
  vignette();
};
DRAW.booth = (t, d) => {
  ctx.fillStyle = '#2B1B22'; ctx.fillRect(0, 0, W, H);
  P(rr(260, 80, 1400, 420, 8), '#0D1630', C.ink, 8); ctx.save(); ctx.beginPath(); ctx.rect(264, 84, 1392, 412); ctx.clip(); stars(40); skyline(520, '#18243F', 5, 200, C.amber); ctx.restore();
  P(rr(120, 420, 300, 600, 30), '#B3262B', C.ink, 6); P(rr(1500, 420, 300, 600, 30), '#B3262B', C.ink, 6);
  cam(960, 580, lerp(1.0, 1.1, t / d), () => {
    person(520, 900, 'founder1', { t, s: 1.05, look: 0.6, talk: wob(t, 0.8, 1) > 0.6 ? 0.4 : 0 });
    person(960, 880, 'j93', { t, s: 1.1, look: 0, talk: wob(t, 0.8, 1, 2) > 0.6 ? 0.4 : 0, arms: [[0.3, 0.2], [-1.0, -1.1]] });
    person(1400, 900, 'founder2', { t, s: 1.05, look: -0.6, seed: 2 });
    P(rr(300, 790, 1320, 30, 8), '#C9A36B', C.ink, 6); P(rr(340, 818, 1240, 400, 4), '#8A6A44', C.ink, 6);
    for (const cx of [620, 1300]) { P(rr(cx - 30, 722, 60, 70, 8), C.white, C.ink, 4); for (let i = 0; i < 3; i++) { ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 10 + i * 10, 712); ctx.quadraticCurveTo(cx - 20 + i * 10 + wob(t, 1, 8, i), 672, cx - 10 + i * 10, 632); ctx.stroke(); } }
    withT(960, 800, 0.72, -0.03, () => { P(rr(-170, -60, 340, 120, 4), C.white, C.ink, 3); const k = seg(t, 1.0, 4.5); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; if (k > 0) { ctx.strokeRect(-60, -40, 80 * Math.min(1, k * 3), 80 * Math.min(1, k * 3)); } if (k > 0.4) { for (let i = 0; i < 4; i++) line(-70, -30 + i * 20, -60, -30 + i * 20, C.ink, 2); } if (t > 6.2) alpha(seg(t, 6.2, 6.8), () => { glow(80, 0, 120, C.green, 0.5); txt('NVIDIA', 90, 0, 46, C.green2); }); });
  });
  stamp('1993', 1640, 170, 90, C.amber, t - 2.0, 0.1); if (t > 0.5) banner("DENNY'S · SAN JOSE", 'KONE WAALA BOOTH', 70, 120, t - 0.5, C.amber);
  vignette();
};
DRAW.six = (t, d) => {
  ctx.fillStyle = '#C9A36B'; ctx.fillRect(0, 0, W, H); paperTex(0, 0, W, H, 21); ctx.globalAlpha = 0.15; for (let i = 0; i < 20; i++) line(0, i * 60, W, i * 60 + 20, '#6B4A2A', 4); ctx.globalAlpha = 1;
  for (let i = 0; i < 3; i++) { const k = easeOut(seg(t, 0.3 + i * 0.6, 0.8 + i * 0.6)); const x = 520 + i * 440; withT(x, lerp(-200, 470, k), 1, (i - 1) * 0.08, () => { P(rr(-160, -80, 320, 160, 8), '#7FB27A', C.ink, 5); P(rr(-140, -60, 280, 120, 6), null, '#2F5E2B', 3); txt('$200', 0, 4, 70, '#1F4D1C'); }); line(x, lerp(-600, 0, k), x + 30, lerp(-200, 400, k), C.ink, 7); P(circ(x + 30, lerp(-200, 400, k), 22), C.skin, C.ink, 4); }
  if (t > 2.4) { withT(960, 820, back(seg(t, 2.4, 2.8)), 0, () => { P(rr(-300, -90, 600, 180, 14), C.ink, null); txt('= $600', 0, 4, 120, C.amber); }); }
  vignette();
};

// ===================== PART 2
DRAW.chef = (t, d) => {
  ctx.fillStyle = '#3B2A22'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#5A4436'; for (let i = 0; i < 16; i++) for (let j = 0; j < 8; j++) ctx.fillRect(i * 124 + (j % 2) * 62, j * 70, 118, 64);
  ctx.fillStyle = '#2A1D17'; ctx.fillRect(0, 860, W, 300);
  // stove + one chef
  P(rr(260, 700, 600, 180, 8), '#6E6E6E', C.ink, 6); P(ell(420, 700, 100, 18), '#222', C.ink, 4); P(ell(700, 700, 100, 18), '#222', C.ink, 4);
  const sw = wob(t, 2.6, 1);
  person(560 + sw * 60, 1000, 'chef', { t, s: 1.35, mood: -0.5, brow: -1, arms: [[0.6 + sw * 0.5, 0.8], [-0.6 + sw * 0.5, -0.8]] });
  for (let i = 0; i < 6; i++) { const dx = Math.sin(t * 7 + i) * 4; ctx.fillStyle = 'rgba(160,200,255,0.7)'; ctx.fillRect(470 + i * 30 + dx, 560 - (t * 200 + i * 40) % 80, 4, 14); }
  const plates = Math.min(5, Math.floor(t / 1.6)); for (let i = 0; i < plates; i++) P(ell(980 + i * 70, 780, 32, 9), C.white, C.ink, 3);
  // baraat queue
  for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) person(1180 + i * 105 + r * 40, 980 - r * 90, i % 2 ? 'guest' : 'staff', { t: t + i + r, s: 0.55, mood: -1, brow: -1, seed: i });
  if (t > 3.2) bubble('Bhook!', 1500, 640, t - 3.2, 1, 40);
  withT(960, 130, 1, 0, () => { P(rr(-480, -55, 960, 110, 12), C.ink, null); txt('CPU = 1 USTAAD BAAWARCHI', 0, 3, 62, C.amber); });
  vignette();
};
DRAW.cooks = (t, d) => {
  fillAll('#101A14');
  const z = lerp(2.4, 1.0, ease(seg(t, 0, 3.5)));
  cam(960, 560, z, () => {
    P(rr(260, 160, 1400, 800, 20), '#1E2A22', C.green2, 10); glow(960, 560, 800, C.green, 0.15);
    const cols = 16, rows = 8;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x = 330 + c * 85, y = 300 + r * 90; const ph = (t * 1.4) % 1; P(ell(x, y + 18, 26, 6), '#333', null); roti(x, y - Math.sin(ph * 3.14) * 30, 14, ph); P(circ(x - 8, y + 34, 9), '#D9A77E', C.ink, 2); P(rr(x - 20, y + 20, 22, 10, 4), C.white, C.ink, 1.5); }
  });
  withT(960, 90, 1, 0, () => { P(rr(-560, -50, 1120, 100, 12), C.ink, null); txt('GPU = 10,000 CHHOTE BAAWARCHI', 0, 3, 58, C.green); });
  vignette();
};
DRAW.ai = (t, d) => {
  fillAll(C.bg);
  const k = ease(seg(t, 3.0, 4.0));
  // game screen
  withT(lerp(960, 520, k), 520, lerp(1.2, 0.9, k), 0, () => {
    P(rr(-380, -250, 760, 480, 16), '#0B0F17', C.ink, 10); ctx.save(); ctx.clip(rr(-370, -240, 740, 460, 10));
    ctx.fillStyle = '#20304F'; ctx.fillRect(-380, -250, 760, 480); ctx.fillStyle = '#3B5E3A'; ctx.fillRect(-380, 100, 760, 200);
    const ex = (t * 0.8) % 1; for (let i = 0; i < 24; i++) { const a = i / 24 * 6.28; const rr2 = ex * 260 * (0.6 + rnd(i) * 0.6); P(circ(Math.cos(a) * rr2, 40 + Math.sin(a) * rr2 * 0.7, 18 * (1 - ex) + 2), i % 2 ? C.amber : C.red, null); }
    glow(0, 40, 200, C.amber, 0.5 * (1 - ex)); ctx.restore(); txt('VIDEO GAMES', 0, -290, 46, C.amber);
  });
  if (k > 0) alpha(k, () => withT(1420, 520, 0.95, 0, () => {
    const layers = [3, 5, 5, 2]; const pos = []; layers.forEach((n, li) => { for (let i = 0; i < n; i++) pos.push([li, -300 + li * 200, (i - (n - 1) / 2) * 100]); });
    pos.forEach(a => pos.forEach(b => { if (b[0] == a[0] + 1) { const on = rnd(a[1] + a[2] * 3 + b[2] + Math.floor(t * 4)) > 0.5; line(a[1], a[2], b[1], b[2], on ? 'rgba(43,255,136,0.7)' : 'rgba(255,255,255,0.12)', on ? 3 : 2); } }));
    pos.forEach((a, i) => { const on = rnd(i + Math.floor(t * 4)) > 0.4; P(circ(a[1], a[2], 24), on ? C.green : '#2A3550', C.ink, 4); });
    txt('AI', 0, -320, 70, C.green);
  }));
  if (t > 4.8) withT(960, 870, 1, 0, () => { P(rr(-520, -46, 1040, 92, 12), C.ink, null); txt('KARODON HISAAB · EK SAATH', 0, 3, 54, C.white); });
  vignette();
};
DRAW.five = (t, d) => {
  fillAll('#0B1220'); ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 2; for (let i = 0; i < 12; i++) { line(160, 160 + i * 64, 1760, 160 + i * 64, 'rgba(255,255,255,0.07)', 2); }
  line(160, 900, 1760, 900, C.grey, 4); line(160, 160, 160, 900, C.grey, 4);
  ['2015', '2018', '2021', '2023', '2025'].forEach((y, i) => txt(y, 200 + i * 380, 940, 30, C.grey, 'Oswald', 500));
  const k = ease(seg(t, 0.4, 4.6)); ctx.beginPath(); let lx = 160, ly = 900;
  for (let i = 0; i <= 200 * k; i++) { const u = i / 200; lx = 160 + u * 1560; ly = 880 - Math.pow(u, 3.4) * 680 - wob(u * 9, 1, 12) * u; i ? ctx.lineTo(lx, ly) : ctx.moveTo(lx, ly); }
  ctx.strokeStyle = C.green; ctx.lineWidth = 8; ctx.stroke(); glow(lx, ly, 120, C.green, 0.6); P(circ(lx, ly, 12), C.green, C.ink, 3);
  if (t > 4.6) { withT(1180, 330, back(seg(t, 4.6, 5.0)), 0, () => { P(rr(-420, -110, 840, 220, 16), C.amber, C.ink, 6); txt('$5 TRILLION', 0, -14, 120, C.ink); txt('DUNIYA KI PEHLI COMPANY', 0, 72, 34, C.ink, 'Oswald', 500); });
    for (let i = 0; i < 60; i++) { const ct = t - 4.6; const x = rnd(i) * W, y = -40 + (ct * (200 + rnd(i + 2) * 300) + rnd(i + 5) * 200) % (H + 80); withT(x, y, 1, ct * 4 + i, () => { ctx.fillStyle = [C.amber, C.green, C.red, C.white][i % 4]; ctx.fillRect(-6, -10, 12, 20); }); } }
  banner('29 OCT 2025', null, 70, 120, t - 0.3, C.green);
  vignette();
};
DRAW.keyman = (t, d) => {
  fillAll('#090D16'); ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = grad(0, H, '#F4D06F', 'rgba(0,0,0,0)'); ctx.beginPath(); ctx.moveTo(860, 0); ctx.lineTo(1060, 0); ctx.lineTo(1300, H); ctx.lineTo(620, H); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#1A2030'; ctx.fillRect(0, 900, W, 200);
  for (let i = 0; i < 6; i++) { const a = t * 0.8 + i * 1.047; chip(960 + Math.cos(a) * 520, 520 + Math.sin(a) * 200, 0.45, t + i, 0.5); }
  const up = easeOut(seg(t, 0.3, 1.2));
  person(960, 960, 'jensen', { t, s: 1.4, mood: 1, look: 0, arms: [[0.3, 0.2], [-2.5 * up, -0.3 * up]], prop: (l, r) => { glow(r[0], r[1] - 40, 200, C.amber, 0.7); key(r[0] + 10, r[1] - 50, 1.2 * up, C.amber); } });
  banner('AI KI CHAABI', null, 70, 120, t - 0.6, C.amber);
  vignette();
};

// ===================== PART 3
DRAW.call = (t, d) => {
  const sp = GT >= LINES.d02.start - 0.3;
  if (!sp) {
    fillAll('#0A1022'); stars(90); ctx.fillStyle = '#0E1A33'; ctx.fillRect(0, 760, W, 400); capitol(960, 780, 1.4, '#D9D3C2'); glow(960, 520, 600, C.amber, 0.12);
    phone(1520, 980, 1.4, t); P(rr(1380, 1000, 300, 80, 4), C.wood, C.ink, 4); if (Math.floor(t * 4) % 2) txt('TRING!', 1520, 860, 54, C.red, 'Kalam', 700);
    banner('WASHINGTON · 2022', null, 70, 120, t - 0.3, C.amber);
  } else {
    const u = GT - (LINES.d02.start - 0.3);
    ctx.fillStyle = '#1C2A44'; ctx.fillRect(0, 0, W / 2, H); ctx.fillStyle = '#20302A'; ctx.fillRect(W / 2, 0, W / 2, H);
    capitol(480, 420, 0.6, '#3A4A66'); txt('WASHINGTON', 480, 120, 44, C.amber);
    for (let i = 0; i < 4; i++) rack(1100 + i * 140, 520, 340, t, i * 9); txt('CALIFORNIA', 1440, 120, 44, C.green);
    person(480, 1060, 'official', { t, s: 1.45, look: 0.6, talk: talk('d02'), mood: 0, prop: (l, r) => P(rr(r[0] - 10, r[1] - 120, 30, 90, 10), '#222', C.ink, 3), arms: [[0.2, 0.1], [-1.4, -1.6]] });
    const sad = GT > LINES.d02.start + 1.8;
    person(1440, 1060, 'jensen', { t, s: 1.45, look: -0.6, mood: sad ? -1 : 0.6, brow: sad ? -1 : 0, prop: (l, r) => P(rr(r[0] - 20, r[1] - 120, 30, 90, 10), '#222', C.ink, 3), arms: [[0.2, 0.1], [-1.4, -1.6]] });
    line(W / 2, 0, W / 2, H, C.ink, 12); if (act('d02')) dramaTag(lt('d02'));
  }
  vignette();
};
DRAW.share = (t, d) => {
  fillAll(C.bg); txt('CHINA MEIN NVIDIA KA HISSA', 960, 110, 56, C.white);
  const k = ease(seg(t, 1.5, 5.0)); const v = lerp(95, 0, k);
  line(500, 900, 1420, 900, C.grey, 5);
  const bh = 600 * v / 95; P(rr(760, 900 - bh, 400, Math.max(bh, 2), 8), v > 30 ? C.green : C.red, C.ink, 5);
  txt(Math.round(v) + '%', 960, 860 - bh, 120, v > 30 ? C.green : C.red);
  txt(k < 0.5 ? 'PEHLE' : 'AB', 960, 960, 40, C.grey, 'Oswald', 500);
  person(1560, 1000, 'jensen', { t, s: 1.25, look: -0.8, mood: k > 0.5 ? -1 : 0, brow: k > 0.5 ? -1 : 0 });
  if (t > 5.2) bubble('95% se 0%!', 1560, 560, t - 5.2, 1, 40);
  vignette();
};
DRAW.rent = (t, d) => {
  const n24 = LINES.n24.start - (GT - t);
  if (t < n24) {
    fillAll('#13182A'); P(rr(660, 220, 600, 620, 10), '#5A3A24', C.ink, 8); P(rr(700, 260, 520, 540, 6), '#6E4A2E', C.ink, 4);
    chip(960, 470, 1.1, t, 0.3); const lk = back(seg(t, 0.5, 0.9)); withT(960, 640, lk, 0, () => { P(rr(-90, -40, 180, 140, 14), '#B8B8B8', C.ink, 6); ctx.strokeStyle = C.ink; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(0, -40, 55, Math.PI, 0); ctx.stroke(); ctx.strokeStyle = '#B8B8B8'; ctx.lineWidth = 8; ctx.stroke(); P(circ(0, 30, 14), C.ink, null); });
    txt('CHINA: KHAREED NAHI SAKTA', 960, 130, 56, C.red);
    if (t > n24 - 1.6) stamp('KIRAAYA?', 960, 930, 90, C.amber, t - (n24 - 1.6), -0.08);
  } else {
    const u = t - n24;
    ctx.fillStyle = grad(0, 500, '#1B2B4C', '#34507E'); ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#3B5E3A'; ctx.fillRect(0, 560, W, 600);
    ctx.fillStyle = '#555'; ctx.fillRect(0, 680, W, 200); ctx.setLineDash([40, 30]); line(0, 780, W, 780, C.amber, 6); ctx.setLineDash([]);
    // border
    for (let i = 0; i < 12; i++) line(860, 520 + i * 50, 860, 560 + i * 50, '#999', 8); P(rr(840, 400, 40, 320, 6), '#C0392B', C.ink, 4); for (let i = 0; i < 5; i++) ctx.fillStyle = i % 2 ? '#fff' : '#C0392B'; P(rr(700, 640, 320, 26, 6), '#F2F2F2', C.ink, 4);
    txt('BORDER', 860, 380, 40, C.white); P(rr(120, 200, 360, 90, 8), C.red2, C.ink, 5); txt('CHINA', 300, 246, 54, C.amber); P(rr(1380, 200, 420, 90, 8), C.green2, C.ink, 5); txt('PADOSI MULK', 1590, 246, 50, C.ink);
    // cars on neighbour side (become chips)
    const morph = seg(u, 6.0, 7.0);
    for (let i = 0; i < 6; i++) { const x = 1080 + (i % 3) * 260, y = 700 + Math.floor(i / 3) * 140; const kk = easeOut(seg(u, 0.4 + i * 0.25, 0.9 + i * 0.25)); withT(lerp(W + 200, x, kk), y, 1, 0, () => { if (morph < 0.5) car(0, 0, 0.9, ['#E2483D', '#3A7BD5', '#F4D06F'][i % 3]); else chip(0, -30, 0.6, t + i, 0.4); }); }
    // person in China gets key, meter
    person(380, 1020, 'staff', { t, s: 1.2, look: 1, mood: 1, arms: [[0.2, 0.1], [-1.5, -0.4]], prop: u > 3.2 ? (l, r) => key(r[0] + 40, r[1] - 10, 0.6, C.amber) : null });
    if (u > 2.6 && u < 3.2) { const kx = lerp(1080, 460, (u - 2.6) / 0.6); key(kx, 820 - Math.sin((u - 2.6) / 0.6 * 3.14) * 200, 0.6); }
    if (u > 3.5) withT(620, 420, back(seg(u, 3.5, 3.9)), 0, () => { P(circ(0, 0, 90), C.white, C.ink, 6); const a = u * 3; line(0, 0, Math.cos(a) * 70, Math.sin(a) * 70, C.red, 6); line(0, 0, 0, -50, C.ink, 6); txt('PER GHANTA', 0, 130, 34, C.white); });
    if (morph > 0.5) banner('GAADI = CHIP', 'CHAABI = REMOTE ACCESS', 1080, 420, u - 6.5, C.green);
  }
  vignette();
};

// ===================== PART 4
DRAW.mega = (t, d) => {
  ctx.fillStyle = grad(0, H, '#1B2B4C', '#E59A5C'); ctx.fillRect(0, 0, W, H);
  skyline(780, '#20304F', 77, 520, C.amber, 70); skyline(820, '#2A3D60', 33, 300, '#FFE7A8', 60);
  P(rr(640, 200, 640, 700, 6), '#2E4266', C.ink, 6); for (let i = 0; i < 6; i++) for (let j = 0; j < 8; j++) P(rr(680 + i * 98, 300 + j * 70, 70, 46, 3), rnd(i * 9 + j) > 0.5 ? '#F4D06F' : '#1C2A44', C.ink, 2);
  withT(960, 250, 1, 0, () => { P(rr(-260, -50, 520, 100, 10), C.ink, null); glow(0, 0, 300, C.green, 0.3); txt('MEGASPEED', 0, 3, 72, C.green); });
  ctx.fillStyle = '#20304F'; ctx.fillRect(0, 900, W, 200);
  const k = ease(seg(t, 3.0, 4.5));
  if (k > 0) alpha(k, () => { P(rr(1100, 480, 760, 560, 12), '#F2ECDD', C.ink, 6); P(rr(1150, 830, 660, 30, 4), C.wood, C.ink, 4); laptop(1480, 830, 0.6, t, () => { ctx.fillStyle = '#123'; ctx.fillRect(-170, -220, 340, 210); for (let i = 0; i < 6; i++) { ctx.fillStyle = C.green; ctx.fillRect(-140, -190 + i * 30, 80 + rnd(i) * 160, 12); } }); person(1300, 1000, 'alice', { t, s: 1.05, look: 0.6, mood: 1 }); });
  banner('SINGAPORE · 2023', 'CHINI GAMING COMPANY SE ALAG HUI', 70, 120, t - 0.3, C.amber);
  if (t > 6.5) banner('ALICE HUANG', 'MANAGING DIRECTOR', 1120, 400, t - 6.5, C.red);
  vignette();
};
DRAW.bar = (t, d) => {
  ctx.fillStyle = '#140F1C'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 3; i++) { P(rr(200, 160 + i * 130, 1520, 14, 3), '#4A2B1A', C.ink, 3); for (let j = 0; j < 18; j++) { const x = 230 + j * 82, c = ['#2E7D5B', '#8E1E2A', C.amber2, '#4B6584'][(i + j) % 4]; P(rr(x, 100 + i * 130, 26, 60, 6), c, C.ink, 2); } }
  glow(1600, 120, 260, '#FF2E55', 0.5); txtStroke('TAIPEI', 1600, 120, 70, '#FF8FA0', '#FF2E55', 6);
  glow(330, 140, 220, C.green, 0.35);
  const zoom = act('d03') || act('d04') || act('d05') || GT > LINES.d03.start ? 1.35 : lerp(1.0, 1.08, t / 10);
  cam(zoom > 1.2 ? 1010 : 960, zoom > 1.2 ? 600 : 540, zoom, () => {
    person(380, 900, 'guest', { t, s: 1.0, talk: wob(t, 1.3, 1) > 0.7 ? 0.4 : 0, arms: [[0.2, 0.1], [-1.5, -0.6]], prop: (l, r) => whiskey(r[0], r[1], 1) });
    person(600, 900, 'staff', { t, s: 1.0, seed: 3, arms: [[0.2, 0.1], [-1.5, -0.6]], prop: (l, r) => whiskey(r[0], r[1], 1) });
    const aliceIn = ease(seg(GT, LINES.n26.start + 7.0, LINES.n26.start + 8.5));
    person(870, 900, 'jensen', { t, s: 1.08, talk: talk('d04'), look: aliceIn > 0.5 ? 0.6 : -0.4, mood: 1, arms: [[0.2, 0.1], [-1.5, -0.6]], prop: (l, r) => whiskey(r[0], r[1], 1) });
    if (aliceIn > 0) person(lerp(1500, 1130, aliceIn), 900, 'alice', { t, s: 1.0, walk: aliceIn < 1 ? t : 0, talk: talk('d03') + talk('d05'), look: -0.6, mood: 1 });
    P(rr(80, 760, 1760, 60, 8), '#5A3A24', C.ink, 6); P(rr(80, 820, 1760, 300, 4), '#3E2716', C.ink, 6);
  });
  banner('TAIPEI · JUNE 2024', null, 70, 120, t - 0.3, C.amber);
  if (GT > LINES.d03.start - 0.2) dramaTag(GT - LINES.d03.start + 0.2);
  vignette();
};
DRAW.ship = (t, d) => {
  fillAll('#0E1A2C'); ctx.fillStyle = '#163A5C'; ctx.fillRect(0, 700, W, 400);
  for (let i = 0; i < 20; i++) line((i * 120 + t * 60) % (W + 100) - 50, 760 + (i % 3) * 60, (i * 120 + t * 60) % (W + 100) + 10, 760 + (i % 3) * 60, '#2C5A86', 4);
  // ship carrying boxes
  const sx = lerp(-300, 1300, ease(seg(t, 0, 6.5)));
  withT(sx, 760, 1, wob(t, 0.6, 0.02), () => { P(poly([-320, -40, 320, -40, 260, 60, -260, 60]), '#B23A2E', C.ink, 6); for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) box(-260 + i * 130, -150 - j * 90, 120, 90, j ? '#C89B5E' : '#B88A4E', 'NVIDIA', 20); });
  P(rr(1500, 560, 420, 160, 6), '#4E5B6E', C.ink, 5); txt('MALAYSIA', 1710, 640, 54, C.white);
  // counter
  const v = Math.round(lerp(0, 2, ease(seg(t, 0.6, 6.0))) * 100) / 100;
  withT(960, 140, 1, 0, () => { P(rr(-400, -70, 800, 140, 14), C.ink, C.green, 4); txt('$' + v.toFixed(1) + ' ARAB', 0, 4, 96, C.green); });
  // aivres tree
  if (t > 6.8) { const k = back(seg(t, 6.8, 7.2)); withT(560, 450, k, 0, () => { P(rr(-200, -60, 400, 120, 10), C.paper, C.ink, 5); txt('AMERICAN COMPANY', 0, -12, 34, C.ink); txt('(Aivres)', 0, 28, 26, '#555', 'Oswald', 500); }); }
  if (t > 8.3) { const k = back(seg(t, 8.3, 8.7)); line(560, 390, 560, 300, C.paper, 5); withT(560, 230, k, 0, () => { P(rr(-220, -60, 440, 120, 10), C.paper, C.ink, 5); txt('CHINI PARENT', 0, -12, 34, C.ink); txt('(Inspur)', 0, 28, 26, '#555', 'Oswald', 500); }); }
  if (t > 9.8) stamp('BLACKLIST', 760, 220, 64, C.red, t - 9.8, 0.12);
  vignette();
};
DRAW.dc = (t, d) => {
  fillAll('#08101C'); const k = ease(seg(t, 0, d));
  cam(lerp(700, 1000, k), 540, lerp(1.15, 1.0, k), () => {
    for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) rack(120 + i * 150 + r * 60, 760 + r * 160, 420, t, i * 11 + r * 5);
    // cable to china
    ctx.strokeStyle = C.green; ctx.lineWidth = 6; ctx.setLineDash([24, 18]); ctx.lineDashOffset = -t * 120; ctx.beginPath(); ctx.moveTo(1180, 600); ctx.bezierCurveTo(1400, 300, 1550, 300, 1700, 420); ctx.stroke(); ctx.setLineDash([]);
    P(rr(1620, 420, 300, 420, 14), '#2A1418', C.red, 5); txt('CHINA', 1770, 470, 44, C.red);
    for (let i = 0; i < 3; i++) { laptop(1770, 600 + i * 110, 0.32, t, () => { ctx.fillStyle = C.green; ctx.fillRect(-160, -200, 320 * ((t * 0.5 + i * 0.3) % 1), 40); }); }
  });
  banner('MALAYSIA + INDONESIA', 'DATA CENTERS', 70, 120, t - 0.2, C.green);
  if (t > 3.0) withT(1180, 130, 1, 0, () => { P(rr(-430, -40, 860, 80, 10), C.ink, null); txt('Reports ke mutabiq: remote Chini customers', 0, 3, 40, C.white, 'Oswald', 500); });
  vignette();
};
DRAW.boxes = (t, d) => {
  fillAll('#1A2232'); ctx.fillStyle = '#2A3345'; ctx.fillRect(0, 840, W, 300);
  for (let i = 0; i < 6; i++) { line(i * 380, 0, i * 380 + 200, 120, '#333C50', 10); }
  for (let c = 0; c < 9; c++) for (let r = 0; r < 4 - (c % 2); r++) box(160 + c * 190, 760 - r * 120, 170, 120, (c + r) % 2 ? '#C89B5E' : '#B88A4E', 'NVIDIA', 22);
  const ip = ease(seg(t, 0, 3.0));
  person(lerp(-150, 520, ip), 1060, 'inspector', { t, s: 1.4, walk: ip < 1 ? t * 0.8 : 0, talk: talk('d06') + talk('d08'), look: 0.6, mood: GT > LINES.d08.start ? -1 : 0, brow: GT > LINES.d08.start ? 1 : 0, prop: (l, r) => P(rr(r[0] - 10, r[1] - 50, 60, 80, 4), C.paper, C.ink, 3) });
  person(1460, 1060, 'worker', { t, s: 1.35, talk: talk('d07'), look: -0.6, mood: 1, arms: [[0.2, 0.1], [-1.9, -0.4]] });
  banner('MALAYSIA · 2024 KA AAKHIR', null, 70, 120, t - 0.3, C.amber);
  if (GT > LINES.d06.start - 0.2) dramaTag(GT - LINES.d06.start + 0.2);
  if (GT > LINES.d08.start + 0.5) bubble('!', 620, 520, GT - LINES.d08.start - 0.5, 1, 80);
  vignette();
};
DRAW.doj = (t, d) => {
  fillAll(C.bg);
  for (const [x, lab, col] of [[480, 'COMMERCE DEPT', C.amber], [1440, 'JUSTICE DEPT', C.red]]) { P(rr(x - 300, 640, 600, 40, 6), C.wood, C.ink, 5); P(rr(x - 280, 680, 560, 260, 4), C.wood2, C.ink, 5); P(rr(x - 200, 520, 400, 80, 8), C.ink, null); txt(lab, x, 562, 44, col); glow(x, 600, 300, C.amber, 0.12); }
  const k = ease(seg(t, 2.5, 5.0)); withT(lerp(480, 1440, k), 600 - Math.sin(k * 3.14) * 220, 1, k * 0.3, () => { P(rr(-140, -90, 280, 180, 8), '#D8B56A', C.ink, 5); P(rr(-140, -110, 110, 30, 6), '#D8B56A', C.ink, 5); txt('MEGASPEED', 0, 0, 40, C.ink); });
  if (t > 0.4 && t < 2.5) stamp('JAANCH', 480, 330, 90, C.amber, t - 0.4, -0.1);
  if (t > 5.3) stamp('CRIMINAL PROBE', 1440, 330, 70, C.red, t - 5.3, 0.08);
  vignette();
};
DRAW.big = (t, d) => {
  fillAll('#0E1424'); const k = ease(seg(t, 0.5, 5.5)); const n = Math.floor(k * 40);
  for (let i = 0; i < n; i++) { const c = i % 8, r = Math.floor(i / 8); box(640 + c * 80 + (r % 2) * 40, 920 - r * 66 - 66, 76, 64, (i % 2) ? '#C89B5E' : '#B88A4E', '', 14); }
  withT(960, 170, 1, 0, () => { P(rr(-470, -80, 940, 160, 14), C.ink, C.amber, 5); txt('$' + lerp(0, 4.8, k).toFixed(1) + ' ARAB+', 0, 4, 110, C.amber); });
  withT(960, 310, 1, 0, () => { P(rr(-430, -38, 860, 76, 10), 'rgba(0,0,0,0.6)', null); txt('New York Times ke mutabiq · 2 saal mein', 0, 3, 38, C.white, 'Oswald', 500); });
  vignette();
};

// ===================== PART 5
DRAW.listen = (t, d) => {
  fillAll('#060A12'); glow(960, 400, 700, '#1E3A6A', 0.4);
  P(rr(360, 140, 1200, 520, 14), '#0B1528', '#2C4A7A', 8);
  ctx.save(); ctx.beginPath(); ctx.rect(370, 150, 1180, 500); ctx.clip();
  ctx.strokeStyle = C.green; ctx.lineWidth = 4; ctx.beginPath(); for (let x = 0; x < 1180; x += 6) { const y = 330 + Math.sin(x * 0.05 + t * 9) * (40 + 60 * Math.abs(Math.sin(x * 0.013 + t))) * (0.4 + 0.6 * Math.abs(Math.sin(t * 2.1))); x ? ctx.lineTo(370 + x, y) : ctx.moveTo(370, y); } ctx.stroke();
  txt('TARGET: ALICE HUANG', 960, 200, 44, C.amber); const rev = GT > LINES.d11.start;
  if (GT > LINES.d09.start) { P(rr(560, 480, 800, 120, 10), rev ? C.red2 : '#1C2A44', C.ink, 4); txt(rev ? 'BAAT: JENSEN HUANG' : 'BAAT: [ AMERICAN CITIZEN ]', 960, 542, 54, rev ? C.white : C.grey); if (rev) withT(1300, 400, back(seg(GT, LINES.d11.start, LINES.d11.start + 0.3)), 0.05, () => { P(rr(-90, -110, 180, 210, 4), C.white, C.ink, 4); ctx.save(); ctx.clip(rr(-80, -100, 160, 160, 2)); ctx.fillStyle = '#24324E'; ctx.fillRect(-80, -100, 160, 160); person(0, 140, 'jensen', { t: 0, s: 0.5 }); ctx.restore(); }); }
  ctx.restore();
  P(rr(0, 760, W, 400, 0), '#121A2A', null);
  person(620, 1100, 'agent', { t, s: 1.35, look: 0.4, talk: talk('d09') + talk('d11'), mood: 0, flip: false, prop: (l, r, top, hy) => headset(0, hy, 52) });
  person(1300, 1100, 'agent2', { t, s: 1.35, look: -0.4, talk: talk('d10'), mood: 0, brow: GT > LINES.d10.start ? 1 : 0, prop: (l, r, top, hy) => headset(0, hy, 52) });
  P(rr(200, 900, 1520, 40, 6), '#2A3345', C.ink, 5);
  if (GT > LINES.d09.start - 0.2) dramaTag(GT - LINES.d09.start + 0.2);
  vignette();
};
DRAW.memo = (t, d) => {
  fillAll('#141008'); glow(960, 540, 800, C.amber, 0.18);
  const open = ease(seg(t, 0.5, 1.6));
  P(rr(560, 120, 800, 860, 10), '#C9A85E', C.ink, 6);
  withT(560, 120, 1, 0, () => { ctx.scale(lerp(1, -0.02, open), 1); P(rr(0, 0, 800, 860, 10), '#D8B56A', C.ink, 6); if (open < 0.5) { txt('TOP SECRET', 400, 420, 90, C.red); } });
  if (open > 0.6) {
    P(rr(610, 150, 700, 800, 4), C.paper, C.ink, 4); paperTex(610, 150, 700, 800, 5); txt('MEMO · 2026', 960, 210, 44, C.ink); txt('(reports ke mutabiq)', 960, 255, 26, '#6A5A3A', 'Oswald', 500);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = 'rgba(30,30,30,0.3)'; ctx.fillRect(660, 300 + i * 38, 600 * (0.5 + rnd(i) * 0.5), 12); }
    const hl = [['MSS ne Alice ko bharti kiya', 1.6, 360], ['Target: Jensen Huang', LINES.n33.dur - 4.0, 520], ['Mission: export paabandiyaan dheeli', LINES.n33.dur + 0.6, 700]];
    hl.forEach(([s, st, y]) => { const k = seg(t, st, st + 0.5); if (k > 0) { ctx.globalAlpha = 0.85; ctx.fillStyle = C.amber; ctx.fillRect(640, y - 30, 640 * k, 60); ctx.globalAlpha = 1; if (k > 0.6) txt(s, 960, y, 40, C.ink, 'Kalam', 700); } });
  }
  if (t > LINES.n33.dur + 1.2) { withT(1640, 820, 1, 0, () => person(0, 200, 'jensen', { t, s: 0.9, look: -0.6, mood: 0.6, talk: wob(t, 3, 1) > 0.5 ? 0.4 : 0 })); capitol(1640, 460, 0.45, '#8A8470'); }
  vignette();
};
DRAW.nobody = (t, d) => {
  const half = 3.8;
  if (t < half) {
    fillAll('#0D1424'); P(rr(160, 160, 1600, 760, 10), '#1E2840', C.ink, 6); glow(960, 300, 500, C.amber, 0.25); line(960, 160, 960, 260, C.ink, 4);
    P(ell(960, 700, 640, 120), C.wood, C.ink, 6); P(rr(820, 640, 300, 50, 4), '#D8B56A', C.ink, 4); txt('MEMO', 970, 666, 30, C.red);
    // back-view silhouettes
    for (let i = 0; i < 5; i++) { const x = 500 + i * 230; P(rr(x - 60, 760, 120, 260, 50), '#0B0F17', null); P(circ(x, 730, 54), '#0B0F17', null); }
    banner('BRIEFING', 'REPORTS: PRESIDENT KO BATAAYA GAYA', 70, 120, t - 0.3, C.amber);
  } else {
    const u = t - half; fillAll('#1A2236'); P(rr(1100, 120, 600, 400, 8), '#0D1630', C.ink, 6); ctx.save(); ctx.beginPath(); ctx.rect(1104, 124, 592, 392); ctx.clip(); skyline(520, '#1B2B4C', 3, 250, C.amber); ctx.restore();
    P(rr(300, 700, 1300, 40, 6), C.wood, C.ink, 5); phone(1300, 680, 1.1, 0); laptop(800, 700, 0.8, t, () => { ctx.fillStyle = C.green2; ctx.fillRect(-160, -200, 320, 180); });
    person(560, 1060, 'jensen', { t, s: 1.4, look: 0.6, mood: 0.8 });
    if (u > 0.6) bubble('...', 1300, 560, u - 0.6, 1, 50); if (u > 1.6) stamp('KISI NE NAHI BATAAYA?', 1200, 900, 56, C.red, u - 1.6, -0.05);
  }
  vignette();
};
DRAW.paper = (t, d) => {
  fillAll('#0E1220'); const k = easeOut(seg(t, 0, 0.9));
  withT(760, 540, lerp(0.1, 1, k), lerp(6.28 * 2, -0.05, k), () => {
    P(rr(-480, -400, 960, 800, 6), '#F2EEE3', C.ink, 6); paperTex(-480, -400, 960, 800, 7);
    txt('The New York Times', 0, -330, 64, C.ink, 'Kalam', 700); line(-440, -280, 440, -280, C.ink, 4); txt('29 OCTOBER 2026', 0, -250, 26, '#444', 'Oswald', 500);
    txt('NVIDIA CHIEF: CHINI', 0, -160, 72, C.ink); txt('JASOOSI KA NISHAANA?', 0, -80, 72, C.ink);
    P(rr(-430, -20, 400, 300, 4), '#BBB', C.ink, 3); person(-230, 270, 'jensen', { t: 0, s: 0.7 }); for (let i = 0; i < 9; i++) { ctx.fillStyle = 'rgba(30,30,30,0.35)'; ctx.fillRect(10, -10 + i * 32, 420 * (0.6 + rnd(i) * 0.4), 12); }
  });
  if (GT > LINES.n36.start + 4.3) withT(1560, 330, 1, 0, () => { bubble('Bebuniyaad atkalein!', 0, 0, GT - LINES.n36.start - 4.3, -1, 40, '#FFD9D4'); });
  if (GT > LINES.n36.start + 4.3) txt('CHINA', 1560, 380, 34, C.red);
  if (GT > LINES.n36.start + 7.0) { withT(1500, 760, 1, 0, () => bubble('Zero national security info', 0, 0, GT - LINES.n36.start - 7.0, -1, 36, '#D6FFE6')); txt('NVIDIA', 1500, 810, 34, C.green); }
  vignette();
};

// ===================== PART 6
DRAW.letter = (t, d) => {
  fillAll('#121722');
  const q = GT > LINES.n38.start - 0.2;
  if (!q) { laptop(960, 900, 2.2, t, () => { ctx.fillStyle = '#F6F7F9'; ctx.fillRect(-165, -216, 330, 200); ctx.fillStyle = '#E3E7EE'; ctx.fillRect(-165, -216, 330, 26); txt('To: All NVIDIA', -150, -175, 13, '#333', 'Inter', 600, 'left'); txt('Subject: A message to our company', -150, -152, 13, C.ink, 'Inter', 700, 'left'); const n = Math.floor(t * 14); for (let i = 0; i < Math.min(8, n / 3); i++) { ctx.fillStyle = '#9AA3B2'; ctx.fillRect(-150, -125 + i * 14, 260 * (0.5 + rnd(i) * 0.5), 6); } }); banner('8 NOVEMBER 2026', null, 70, 120, t - 0.3, C.amber); }
  else { const u = GT - LINES.n38.start + 0.2;
    P(rr(260, 130, 1400, 780, 8), C.paper, C.ink, 6); paperTex(260, 130, 1400, 780, 3);
    const parts = ['"Maine apni patni ke saath', 'bewafaai ki. Mere kaamon se unhein', 'aur hamaare bachchon ko dukh pahuncha.', 'Iska koi bahaana nahi."'];
    parts.forEach((s, i) => handwrite(s, 960, 280 + i * 120, 62, u - 0.2 - i * 1.9, '#1B2433', 1.6));
    txt('— Jensen Huang ke khat se (tarjuma)', 1520, 860, 32, '#6A5A3A', 'Kalam', 700, 'right');
  }
  vignette();
};
DRAW.board = (t, d) => {
  const half = 4.2;
  if (t < half) {
    fillAll('#151A26'); P(rr(200, 120, 1520, 300, 8), '#0D1630', C.ink, 6); ctx.save(); ctx.beginPath(); ctx.rect(204, 124, 1512, 292); ctx.clip(); skyline(430, '#1B2B4C', 8, 220, C.amber); ctx.restore();
    for (let i = 0; i < 4; i++) { person(420 + i * 360, 860, 'official', { t: t + i, s: 0.95, mood: 0, look: (i < 2 ? 0.5 : -0.5), seed: i }); }
    P(rr(220, 700, 1480, 50, 10), C.wood, C.ink, 6); P(rr(260, 750, 1400, 300, 4), C.wood2, C.ink, 5);
    withT(960, 960, 1, 0, () => { P(rr(-380, -50, 760, 100, 12), C.ink, null); txt('BOARD: INDEPENDENT JAANCH', 0, 3, 52, C.amber); });
  } else {
    const u = t - half; fillAll('#0A1022'); stars(60); capitol(800, 860, 1.3, '#D9D3C2');
    withT(1520, 480, back(seg(u, 0.2, 0.6)), 0.06, () => { P(rr(-170, -200, 340, 380, 14), C.white, C.ink, 6); P(rr(-170, -200, 340, 90, [14, 14, 0, 0]), C.red, C.ink, 6); txt('NOV', 0, -152, 54, C.white); txt('18', 0, 30, 170, C.ink); txt('BAND KAMRA', 0, 140, 34, '#555', 'Oswald', 500); });
    banner('CONGRESS', 'BRIEFING KE LIYE BULAAYA', 70, 120, u - 0.2, C.amber);
  }
  vignette();
};
DRAW.caveat = (t, d) => {
  fillAll(C.bg);
  const tilt = wob(t, 0.4, 0.06);
  line(960, 260, 960, 820, C.amber, 12); P(rr(860, 820, 200, 40, 8), C.amber, C.ink, 5);
  withT(960, 300, 1, tilt, () => { line(-460, 0, 460, 0, C.amber, 12); for (const s of [-1, 1]) { line(s * 440, 0, s * 440 - 120, 260, C.ink, 4); line(s * 440, 0, s * 440 + 120, 260, C.ink, 4); P(ell(s * 440, 270, 170, 30), C.amber2, C.ink, 5); } });
  withT(960 - 440 * Math.cos(tilt), 300 - 440 * Math.sin(tilt) + 210, 1, 0, () => { cardStack(-110, -150, 'ILZAAM', 'reports', t, C.paper); });
  withT(960 + 440 * Math.cos(tilt), 300 + 440 * Math.sin(tilt) + 170, 1, 0, () => { txt('SABOOT?', 0, 0, 80, C.white); txt('?', 0, -140, 160, C.red); });
  if (t > LINES.n40.dur - 3.0) withT(960, 110, back(seg(t, LINES.n40.dur - 3.0, LINES.n40.dur - 2.6)), 0, () => { P(rr(-430, -55, 860, 110, 14), C.green, C.ink, 5); txt('JENSEN · AAJ BHI CEO', 0, 3, 62, C.ink); });
  vignette();
};
DRAW.empty = (t, d) => {
  const k = ease(seg(t, 0, d)); cam(lerp(960, 1000, k), lerp(560, 600, k), lerp(1.0, 1.22, k), () => { dinnerSet(t, { noAlice: true }); const g = seg(t, 2.5, 4.5); if (g > 0) glow(1225, 640, 260, C.red, 0.3 * g); });
  vignette(); alpha(seg(t, 0, 0.6), () => {});
};
DRAW.question = (t, d) => {
  fillAll('#0B0F17'); paperTex(0, 0, W, H, 41);
  handwrite('Agar America ko pata tha...', 960, 330, 90, t - 0.3, C.white, 1.2);
  handwrite('to Jensen ko kyun nahi bataaya?', 960, 470, 100, t - 2.4, C.amber, 1.4);
  if (t > 4.6) { for (let i = 0; i < 3; i++) withT(560 + i * 400, 780, back(seg(t, 4.6 + i * 0.3, 5.0 + i * 0.3)), 0, () => { P(rr(-170, -70, 340, 140, 30), ['#2B4A7A', '#2E7D5B', '#7A2B3A'][i], C.ink, 5); for (let j = 0; j < 3; j++) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-130, -36 + j * 26, 200 + rnd(i + j) * 50, 12); } }); txt('COMMENT MEIN BATAAIYE', 960, 630, 60, C.green); }
  vignette();
};
DRAW.end = (t, d) => {
  fillAll(C.bg); glow(960, 500, 700, C.green, 0.12);
  person(520, 980, 'jensen', { t, s: 1.25, mood: 1, arms: [[0.2, 0.1], [-2.6, -0.3 + wob(t, 1.5, 0.4)]] });
  withT(1180, 480, back(seg(t, 0.3, 0.7)) * (1 + (t > 1.6 && t < 1.9 ? -0.08 : 0)), 0, () => { const sub = t > 1.75; P(rr(-300, -80, 600, 160, 80), sub ? '#555' : '#E62117', C.ink, 6); txt(sub ? 'SUBSCRIBED' : 'SUBSCRIBE', 0, 4, 76, C.white); });
  withT(1580, 480, back(seg(t, 2.0, 2.4)), wob(t, 3, 0.25) * seg(t, 2.0, 3.5), () => { P(new Path2D('M-50 30 Q-50 -60 0 -60 Q50 -60 50 30 L65 45 L-65 45 Z'), C.amber, C.ink, 6); P(circ(0, 58, 14), C.amber, C.ink, 5); });
  handwrite('Aisi aur kahaaniyon ke liye', 1180, 720, 64, t - 0.4, C.white, 1.0);
  sceneFade(t, d, 0.01, 1.2);
};

// ---------- subtitles ----------
function chunks(roman, dur) { // split into timed pieces
  const parts = roman.replace(/…/g, '…|').replace(/([.?!:])\s+/g, '$1|').replace(/ — /g, ' —|').split('|').map(s => s.trim()).filter(Boolean);
  const merged = []; parts.forEach(p => { if (merged.length && (merged[merged.length - 1] + ' ' + p).length < 58) merged[merged.length - 1] += ' ' + p; else merged.push(p); });
  const tot = merged.reduce((a, s) => a + s.length, 0); let acc = 0; return merged.map(s => { const st = acc / tot * dur; acc += s.length; return [st, acc / tot * dur, s]; });
}
const CH = {}; for (const id in LINES) CH[id] = chunks(LINES[id].roman, LINES[id].dur);
function subtitles() {
  for (const id in LINES) { if (!act(id)) continue; const u = GT - LINES[id].start; const c = CH[id].find(c => u >= c[0] && u < c[1] + 0.05) || CH[id][CH[id].length - 1];
    const spk = LINES[id].spk; const name = { J: 'JENSEN', A: 'ALICE', G: id === 'd02' ? 'AFSAR' : id.match(/d0[68]/) ? 'INSPECTOR' : 'AGENT', G2: 'AGENT 2', W: 'WORKER' }[spk];
    ctx.font = '800 44px Baloo2'; const words = c[2].split(' '); const rows = ['']; words.forEach(w => { if (ctx.measureText(rows[rows.length - 1] + ' ' + w).width > 1500) rows.push(w); else rows[rows.length - 1] = (rows[rows.length - 1] + ' ' + w).trim(); });
    const bw = Math.max(...rows.map(r => ctx.measureText(r).width)) + 60; const bh = rows.length * 56 + 22; const y0 = 1045 - bh;
    P(rr(960 - bw / 2, y0, bw, bh, 14), 'rgba(8,11,18,0.72)', null);
    rows.forEach((r, i) => txt(r, 960, y0 + 40 + i * 56, 44, name ? C.amber : C.white, 'Baloo2', 800));
    if (name) { P(rr(960 - bw / 2, y0 - 40, 200, 40, 8), C.amber, null); txt(name, 960 - bw / 2 + 100, y0 - 19, 26, C.ink, 'Oswald', 700); }
  }
}
function drawFrame(T) {
  GT = T; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H);
  const s = SCENES.find(s => T >= s.start && T < s.start + s.dur) || SCENES[SCENES.length - 1];
  ctx.save(); DRAW[s.id](T - s.start, s.dur, T); ctx.restore();
  // quick cut flash between scenes
  const u = T - s.start; if (u < 0.12 && s.start > 0 && !s.id.startsWith('ch')) alpha(1 - u / 0.12, () => fillAll('#000'));
  subtitles();
}
