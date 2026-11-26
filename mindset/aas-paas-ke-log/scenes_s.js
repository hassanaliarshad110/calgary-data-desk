// ===== "Your Circle Is Your Real CV" — scene set for The Prince, Ch. 22 (Concerning the Secretaries of Princes)
// New for this episode: ring-of-five constellation (hook + flip callback), Siena at dawn (Torre del Mangia, striped
// campanile, terracotta roofs, swifts), Renaissance palazzo hall with the lord and his right-hand man (silhouettes,
// gaze lines from a foreground crowd), three hanging lanterns = three kinds of minds (self-lit / lit from another's
// flame / never catches), crowd + magnifier, dawn classroom with the quiet reader, phone message at a dawn window,
// chess corner, end card ring.
const SS = { terra: '#7A3A22', terra2: '#A2552E', brick: '#5A2A1C', teal: '#4FB3B3', dawnRGB: '255,186,120' };

// ---------- ring of five ----------
function ringNodes(cx, cy, R, rot, sq = 0.8) { const p = []; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + rot + i * 6.2832 / 5; p.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R * sq]); } return p; }
function ringScene(t, o = {}) { // o.k[5] appearance, o.lit 0..1, o.center {rim, halo}, o.you index, o.flow 0..1
  fullFill(grad(0, H, '#07060C', '#120A0E'));
  glow(540, 1200, 900, '#FF9A50', 0.12 + 0.05 * Math.sin(t * 0.7)); glow(540, 400, 700, '#3A4A8A', 0.12);
  dust(t, 50, [60, 200, 960, 1300], '255,214,170', 5);
  const cx = 540, cy = o.cy ?? 860, R = o.R ?? 360, N = ringNodes(cx, cy, R, o.rot ?? 0, 0.78);
  const ks = o.k || [1, 1, 1, 1, 1];
  N.forEach((p, i) => { const k = ks[i]; if (k <= 0) return;
    alpha(k * 0.7, () => { ctx.save(); ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * 30; line(cx, cy - 60, lerp(cx, p[0], k), lerp(cy - 60, p[1] - 60, k), 'rgba(246,210,122,0.55)', 3); ctx.restore(); }); });
  if (o.flow > 0 && o.you != null) { const p = N[o.you]; const f = clamp(o.flow); const x = lerp(p[0], cx, f), y = lerp(p[1] - 60, cy - 60, f);
    glow(x, y, 110, '#FFE2A0', 0.9 * (1 - seg(f, 0.9, 1) * 0.6)); P(circ(x, y, 12), '#FFF3D6', null); }
  const halo = o.center?.halo || 0; if (halo > 0) { glow(cx, cy - 100, 380, '#F6D27A', 0.5 * halo); alpha(halo, () => { ctx.save(); ctx.strokeStyle = M.gold2; ctx.lineWidth = 6; ctx.shadowColor = M.gold2; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(cx, cy - 95, 125 + 8 * Math.sin(t * 3), 0, 6.283); ctx.stroke(); ctx.restore(); }); }
  bust(cx, cy + 60, 1.12, { rim: o.center?.rim || M.gold2, rimA: 0.95, nod: Math.sin(t * 0.9) * 0.03 });
  N.forEach((p, i) => { const k = ks[i]; if (k <= 0) return; const you = i === o.you;
    withT(p[0], p[1] + 30, back(k), 0, () => { glow(0, -70, 170, you ? '#F6D27A' : ['#FFB45A', '#7FA8FF', '#E58A4E', '#4FB3B3', '#F6D27A'][i], (0.35 + 0.35 * (o.lit || 0)) * k);
      bust(0, 0, 0.7, { rim: you ? M.gold2 : 'rgba(255,230,200,0.8)', rimA: you ? 1 : 0.55, f: p[0] < cx ? 1 : -1 });
      if (you && (o.youK ?? 1) > 0) alpha(o.youK ?? 1, () => { ctx.font = '700 40px Oswald'; P(rr(-62, 26, 124, 56, 28), 'rgba(12,6,8,0.85)', M.gold2, 3); txt('YOU', 0, 55, 40, M.gold2, 'Oswald', 700); }); }); });
}

// ---------- Siena at dawn ----------
function mangia(x, y, s, col, lit) { withT(x, y, s, 0, () => { // tall slender tower, crenellated top + pale belfry
  P(rr(-34, -900, 68, 900, 2), col, null); P(rr(-46, -940, 92, 44, 2), col, null);
  for (let i = 0; i < 5; i++) P(rr(-46 + i * 20, -962, 12, 24, 1), col, null);
  P(rr(-22, -1060, 44, 120, 2), lerpC('#1A1418', '#E8D2B0', lit * 0.55), null); P(poly([-28, -1060, 28, -1060, 0, -1110]), col, null); line(0, -1110, 0, -1150, col, 4);
  if (lit > 0) alpha(lit * 0.6, () => line(30, -900, 30, 0, 'rgba(255,190,120,0.5)', 5)); }); }
function campanile(x, y, s, col, lit) { withT(x, y, s, 0, () => { for (let i = 0; i < 16; i++) P(rr(-36, -40 - i * 40, 72, 40, 0), i % 2 ? col : lerpC('#151014', '#D9C6A6', 0.25 + 0.4 * lit), null);
  P(poly([-40, -680, 40, -680, 0, -790]), col, null); }); }
function rooftops(y, col, seed, h = 120) { ctx.fillStyle = col; for (let i = -1; i < 14; i++) { const x = i * 90 + rnd(seed + i) * 40, hh = h * (0.6 + rnd(seed + i * 3) * 0.6), w = 100 + rnd(i + seed) * 60;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - hh); ctx.lineTo(x + w / 2, y - hh - 34); ctx.lineTo(x + w, y - hh); ctx.lineTo(x + w, y); ctx.fill(); }
  ctx.fillRect(-200, y - 2, W + 400, 900); }
function sienaSet(t, d, o = {}) {
  const dawn = o.dawn ?? 0.8, cam = o.cam || camAt(t, d, 1, 1.07, 26);
  layers([
    { z: 0.02, draw: () => { const sk = ctx.createLinearGradient(0, 0, 0, 1300); sk.addColorStop(0, '#120E26'); sk.addColorStop(0.45, lerpC('#2A1E3A', '#6A3A52', dawn)); sk.addColorStop(0.8, lerpC('#3A2030', '#E58A4E', dawn)); sk.addColorStop(1, lerpC('#3A2030', '#F7C47A', dawn)); fullFill(sk);
      glow(720, 1080, 520, '#FFC27A', 0.55 * dawn); P(circ(720, 1090, 70), 'rgba(255,226,170,0.9)', null);
      for (let i = 0; i < 40; i++) alpha(0.5 * (1 - dawn * 0.7), () => P(circ(rnd(i * 2.1) * W, rnd(i * 4.7) * 500, 1 + rnd(i) * 2), '#FFF3D6', null));
      alpha(0.35, () => { for (let i = 0; i < 4; i++) P(ell(200 + i * 260 + t * 6, 420 + i * 70, 260, 26), 'rgba(255,190,150,0.35)', null); }); } },
    { z: 0.12, haze: 0.08, draw: () => { rooftops(1150, lerpC('#1A1220', '#4A2A30', dawn * 0.6), 3, 110); mangia(380, 1120, 0.95, lerpC('#140E14', '#3A2024', dawn * 0.5), dawn); campanile(820, 1110, 0.8, lerpC('#140E14', '#3A2024', dawn * 0.5), dawn); } },
    { z: 0.3, draw: () => { rooftops(1330, lerpC('#120A0E', '#3A1A16', dawn * 0.7), 11, 150);
      // swifts
      for (let i = 0; i < 7; i++) { const bx = ((i * 170 + t * (60 + i * 9)) % 1300) - 100, by = 560 + Math.sin(t * 1.4 + i) * 40 + i * 30; ctx.save(); ctx.strokeStyle = '#0A0608'; ctx.lineWidth = 4; ctx.beginPath(); const fl = Math.sin(t * 9 + i) * 8; ctx.moveTo(bx - 18, by - fl); ctx.quadraticCurveTo(bx - 6, by - 6, bx, by); ctx.quadraticCurveTo(bx + 6, by - 6, bx + 18, by - fl); ctx.stroke(); ctx.restore(); } } },
    { z: 0.6, draw: () => { // loggia balcony: stone balustrade + arch frame
      P(rr(-200, 1240, W + 400, 700), grad(1240, H, '#1A0E0C', '#050304'), null); line(-200, 1242, W + 200, 1242, `rgba(${SS.dawnRGB},0.5)`, 4);
      for (let i = 0; i < 12; i++) { const x = 20 + i * 92; P(new Path2D(`M${x} 1250 q-18 40 0 80 q18 40 0 80 h30 q-18 -40 0 -80 q18 -40 0 -80 Z`), '#0C0708', null); }
      P(rr(-200, 1410, W + 400, 40), '#0C0708', null);
      (o.figs || (() => {}))(); } },
    { z: 1.1, blur: 7, draw: () => { ctx.fillStyle = '#030203'; ctx.fillRect(-100, 0, 120, H); ctx.fillRect(W - 40, 0, 140, H); P(new Path2D('M-100 0 H1200 V160 Q540 -40 -100 160 Z'), '#030203', null); } },
  ], cam);
  dust(t, 40, [100, 500, 880, 800], '255,214,170', 9);
}
function lordFig(x, y, s, o = {}) { // standing Renaissance lord: long robe + soft cap (silhouette only)
  withT(x, y, s, 0, () => { ctx.scale(o.f || 1, 1);
    const p = new Path2D(); p.moveTo(-30, -372); p.lineTo(30, -372); p.bezierCurveTo(70, -366, 96, -348, 100, -312); p.lineTo(130, 0); p.lineTo(-130, 0); p.lineTo(-100, -312); p.bezierCurveTo(-96, -348, -70, -366, -30, -372); p.closePath(); P(p, '#06050A', null);
    P(rr(-17, -400, 34, 40, 6), '#06050A', null); P(ell(0, -430, 42, 50), '#06050A', null);
    P(new Path2D('M-52 -440 Q-56 -500 0 -502 Q60 -500 56 -436 Q0 -462 -52 -440 Z'), o.cap || '#3A0A0A', null);
    if (o.rim) { ctx.save(); ctx.globalAlpha = o.rimA ?? 0.85; ctx.strokeStyle = o.rim; ctx.lineWidth = 5; ctx.translate(3, 0); ctx.stroke(p); ctx.beginPath(); ctx.ellipse(0, -430, 42, 50, 0, -1.4, 1.4); ctx.stroke(); ctx.restore(); }
    if (o.scroll) withT(70, -190, 1, -0.3, () => { P(rr(-14, -60, 28, 120, 10), '#EADBB8', '#5A3A1A', 3); });
  }); }

// ---------- palazzo hall ----------
function hallSet(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.06, 20), vk = o.vk ?? 1, pk = o.pk ?? 0.2;
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#140A0C', '#050304'));
      [170, 540, 910].forEach((wx, i) => { const ww = 200, wy = 300, wh = 640; const win = new Path2D(); win.moveTo(wx - ww / 2, wy + wh); win.lineTo(wx - ww / 2, wy + ww / 2); win.arc(wx, wy + ww / 2, ww / 2, Math.PI, 0); win.lineTo(wx + ww / 2, wy + wh); win.closePath();
        P(win, grad(wy, wy + wh, '#3A2A4A', '#F0A86A'), null); glow(wx, wy + wh * 0.8, 200, '#FFC27A', 0.4); P(win, null, '#1A0E0A', 16); line(wx, wy + 10, wx, wy + wh, '#1A0E0A', 8); });
      alpha(0.3, () => { for (let i = 0; i < 30; i++) P(rr(rnd(i) * W, 1000 + rnd(i + 5) * 200, 120, 46, 4), null, '#2A1A1A', 2); }); } },
    { z: 0.18, draw: () => { [355, 725].forEach(x => { P(rr(x - 40, 200, 80, 1100), grad(0, 1300, '#2A1C1A', '#0E0808'), null); P(rr(x - 56, 200, 112, 40), '#1A1010', null); P(rr(x - 56, 1260, 112, 40), '#1A1010', null); });
      [60, 1020].forEach(x => { P(rr(x - 50, 260, 100, 420), '#5A0E0E', null); alpha(0.5, () => line(x - 50, 290, x + 50, 290, M.gold, 4)); P(poly([x - 50, 680, x + 50, 680, x, 740]), '#5A0E0E', null); });
      beam(540, 500, 220, 520, 1300, 760, SS.dawnRGB, 0.12); beam(910, 520, 180, 760, 1300, 520, SS.dawnRGB, 0.08);
      P(rr(-200, 1290, W + 400, 700), grad(1290, H, '#2A1810', '#070404'), null); line(-200, 1292, W + 200, 1292, 'rgba(255,190,120,0.35)', 3);
      ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = '#E0A060'; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.moveTo(540 + (i - 5) * 60, 1292); ctx.lineTo(540 + (i - 5) * 260, H); ctx.stroke(); } ctx.restore(); } },
    { z: 0.45, draw: () => { // chair + lord seated + Venafro standing at his side
      glow(400, 1000, 300, '#F6D27A', 0.35 * vk); glow(640, 980, 300, '#F6D27A', 0.3 * pk);
      P(rr(540, 760, 200, 360, [40, 40, 6, 6]), '#1A0C0A', null); P(rr(552, 772, 176, 336, [34, 34, 4, 4]), '#3A0A0A', null);
      withT(640, 1290, 1, 0, () => { person(0, 0, 1.25, { sit: true, f: -1, rim: pk > 0.05 ? M.gold2 : null, rimA: 0.9 * pk });
        P(new Path2D('M-52 -400 Q-56 -456 0 -458 Q60 -456 56 -396 Q0 -420 -52 -400 Z'), '#3A0A0A', null); });
      lordFig(400, 1290, 0.98, { f: 1, rim: M.gold2, rimA: 0.95 * vk, scroll: true, cap: '#14100E' });
      if (o.gaze > 0) alpha(o.gaze, () => { ctx.save(); ctx.setLineDash([6, 10]); ctx.lineDashOffset = -t * 40; [[140, 1700], [330, 1760], [560, 1730], [780, 1760], [960, 1700]].forEach(([x, y]) => line(x, y - 150, 400, 900, 'rgba(246,210,122,0.5)', 3)); ctx.restore(); });
    } },
    { z: 0.9, blur: 3, draw: () => { [[140, 1800], [330, 1860], [560, 1830], [780, 1860], [960, 1800]].forEach(([x, y], i) => { bust(x, y, 1.0, { col: '#040304', rim: 'rgba(255,190,120,0.6)', rimA: 0.5, f: x < 400 ? 1 : -1 });
        if (o.gaze > 0) alpha(o.gaze, () => P(circ(x + (x < 400 ? 10 : -10), y - 230, 4), '#FFE2A0', null)); }); } },
  ], cam);
  dust(t, 60, [200, 400, 700, 900], '255,214,170', 13);
}

// ---------- lanterns: three kinds of minds ----------
const LX = [250, 540, 830];
function hangLamp(x, y, s, t, on, o = {}) { withT(x, y, s, 0, () => {
  line(0, -700, 0, -70, '#140C08', 4);
  if (on > 0) { glow(0, 0, 330 * flick(t + x), '#FFB45A', 0.6 * on); glow(0, 0, 90, '#FFF1C0', 0.8 * on); }
  P(poly([-46, -70, 46, -70, 30, -96, -30, -96]), '#1A120B', null);
  const g = on > 0 ? `rgba(255,${190 + 40 * on},${110 + 40 * on},${0.25 + 0.65 * on})` : 'rgba(60,50,46,0.55)';
  P(rr(-40, -70, 80, 130, 10), g, '#1A120B', 7); line(0, -70, 0, 60, '#1A120B', 5); line(-40, -5, 40, -5, '#1A120B', 4);
  P(poly([-50, 60, 50, 60, 36, 82, -36, 82]), '#1A120B', null);
  if (on > 0) { const fl = Math.sin(t * 9 + x) * 3; const f = new Path2D(); f.moveTo(0, -40 + fl); f.bezierCurveTo(13, -20, 9, 10, 0, 14); f.bezierCurveTo(-9, 10, -13, -20, 0, -40 + fl); alpha(on, () => { P(f, '#FFC861', null); P(ell(0, 4, 4, 8), '#FFF6D8', null); }); }
  if (o.smoke > 0) alpha(o.smoke * (1 - seg(o.smoke, 0.7, 1)), () => { for (let k = 0; k < 5; k++) P(circ(Math.sin(t * 2 + k) * 10, -110 - k * 40 - o.smoke * 60, 12 + k * 7), 'rgba(150,140,150,0.3)', null); });
}); }
function spark(x, y, k, t) { if (k <= 0 || k >= 1) return; const n = 14; for (let i = 0; i < n; i++) { const a = i / n * 6.283, r = 30 + 120 * easeOut(k); alpha(1 - k, () => line(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, x + Math.cos(a) * r, y + Math.sin(a) * r, '#FFE2A0', 4)); } glow(x, y, 200, '#FFF1C0', (1 - k) * 0.9); }
function lampHall(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.06, 16), y = o.y ?? 760, s = o.s ?? 1.5;
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#0A080E', '#050306'));
      for (let r = 0; r < 17; r++) for (let c = -1; c < 7; c++) { const yy = -60 + r * 118, x = -60 + c * 190 + (r % 2) * 95; alpha(0.55, () => P(rr(x, yy, 182, 110, 10), grad(yy, yy + 110, lerpC('#221C22', '#2E2628', rnd(r * 9 + c)), '#0E0A0E'), null)); }
      glow(540, 300, 600, '#3A4A8A', 0.15); } },
    { z: 0.2, draw: () => { P(rr(-200, y - 720, W + 400, 46), '#160E0A', null); line(-200, y - 676, W + 200, y - 676, 'rgba(255,190,120,0.25)', 3);
      P(rr(-200, 1440, W + 400, 600), grad(1440, H, '#120A08', '#050304'), null); } },
    { z: 0.5, draw: () => { const on = o.on || [0, 0, 0];
      LX.forEach((x, i) => hangLamp(x, y, s, t, on[i], { smoke: (o.smoke || [0, 0, 0])[i] }));
      (o.extra || (() => {}))();
      if (o.nums) LX.forEach((x, i) => alpha(o.nums, () => txt(['I', 'II', 'III'][i], x, y + 200, 56, M.parch, 'CrimsonText', 700))); } },
    { z: 1.15, blur: 8, draw: () => { ctx.fillStyle = '#020203'; P(new Path2D('M-100 1900 Q200 1700 420 1960 Z'), '#020203', null); P(new Path2D('M1180 1880 Q900 1720 700 1960 Z'), '#020203', null); } },
  ], cam);
  dust(t, 50, [60, 300, 960, 1000], '255,214,170', 17);
}
function flameArc(k, y, s) { if (k <= 0 || k >= 1) return null; const x0 = LX[0], x1 = LX[1]; const x = lerp(x0, x1, ease(k)), yy = y - Math.sin(k * Math.PI) * 220 - 10 * s;
  glow(x, yy, 120, '#FFD27A', 0.8); P(circ(x, yy, 12), '#FFF3D6', null); for (let i = 1; i < 6; i++) { const kk = clamp(k - i * 0.03); alpha(0.5 - i * 0.08, () => P(circ(lerp(x0, x1, ease(kk)), y - Math.sin(kk * Math.PI) * 220 - 10 * s, 9 - i), '#FFB45A', null)); } return [x, yy]; }
function label(s, x, y, k, col = M.gold2, size = 40) { if (k <= 0) return; alpha(k, () => { ctx.font = `700 ${size}px Oswald`; const w = ctx.measureText(s).width + 36; P(rr(x - w / 2, y - size * 0.72, w, size * 1.44, size * 0.72), 'rgba(10,6,8,0.78)', col, 2); txt(s, x, y + 2, size, col, 'Oswald', 700); }); }

// ---------- classroom at dawn ----------
function classSet(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.06, 20), ring = o.ring || 0;
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#141020', '#060408'));
      const wx = 90, wy = 260, ww = 900, wh = 700; const sk = ctx.createLinearGradient(0, wy, 0, wy + wh); sk.addColorStop(0, '#2A1E3A'); sk.addColorStop(0.7, '#C8724A'); sk.addColorStop(1, '#F7C47A'); ctx.fillStyle = sk; ctx.fillRect(wx, wy, ww, wh);
      glow(640, wy + wh, 420, '#FFC27A', 0.6); ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip(); rooftops(wy + wh, '#2A1620', 41, 90); ctx.restore();
      for (let i = 1; i < 4; i++) line(wx + i * ww / 4, wy, wx + i * ww / 4, wy + wh, '#120C10', 12); line(wx, wy + wh * 0.45, wx + ww, wy + wh * 0.45, '#120C10', 12); P(rr(wx, wy, ww, wh, 2), null, '#120C10', 22); } },
    { z: 0.2, draw: () => { beam(640, 700, 500, 560, 1400, 1100, SS.dawnRGB, 0.12);
      P(rr(-200, 1000, 260, 400), '#0E0806', null); for (let r = 0; r < 3; r++) for (let b = 0; b < 6; b++) { const h = 80 + rnd(r * 6 + b) * 40; P(rr(-10 + b * 10 - 60 + b * 2, 1080 + r * 110 - h, 9, h, 2), ['#3A0E0E', '#2A1A0E', '#4A2A10'][(r + b) % 3], null); } } },
    { z: 0.5, draw: () => { // table + four students; the quiet one reads at the right end
      [[190, 1, '#E58A4E'], [410, 1, '#7FA8FF'], [630, -1, '#4FB3B3']].forEach(([x, f, rim], i) => { person(x, 1200, 1.2, { sit: true, f, rim, rimA: 0.5, hair: i === 1 });
        if (i !== 1) withT(x + f * 40, 1200 - 230, 1, 0, () => sayBubble(0, -60, o.chat ? clamp(o.chat * 1.5 - i * 0.2) : 0, ['bla bla', '...', 'idea!'][i], 'rgba(255,230,210,0.85)', 30)); });
      if (ring > 0) { glow(870, 1000, 260, '#F6D27A', 0.5 * ring); alpha(ring, () => { ctx.save(); ctx.strokeStyle = M.gold2; ctx.lineWidth = 6; ctx.shadowColor = M.gold2; ctx.shadowBlur = 24; ctx.beginPath(); ctx.ellipse(860, 1040, 150 + 6 * Math.sin(t * 5), 220, 0, 0, 6.283); ctx.stroke(); ctx.restore(); }); }
      person(860, 1200, 1.2, { sit: true, f: -1, rim: M.gold2, rimA: 0.6 + 0.3 * ring });
      withT(790, 1010, 1, -0.25, () => { glow(0, 0, 90, '#FFF1C0', 0.5); P(rr(-34, -46, 68, 92, 4), '#F0E2C2', '#5A3A1A', 2); for (let i = 0; i < 5; i++) line(-22, -30 + i * 14, 22, -30 + i * 14, 'rgba(60,40,20,0.6)', 3); });
      P(rr(60, 1200, 960, 50, 8), grad(1200, 1250, '#3A2414', '#120A06'), null); line(80, 1196, 1000, 1196, 'rgba(255,200,140,0.4)', 3);
      [[200, 1232], [420, 1236], [640, 1232]].forEach(([x, y]) => P(rr(x - 40, y - 52, 80, 14, 3), '#E8DCC8', null)); } },
    { z: 1.12, blur: 8, draw: () => { P(rr(-60, 1700, 280, 260, 30), '#050304', null); P(ell(1040, 1800, 140, 220), '#030203', null); } },
  ], cam);
  dust(t, 50, [100, 300, 880, 900], '255,214,170', 23);
}
function resultCard(x, y, k, t) { if (k <= 0) return; withT(x, y + (1 - easeOut(k)) * 60, 1, -0.04, () => alpha(clamp(k * 1.4), () => {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; P(rr(-260, -170, 520, 340, 14), grad(-170, 170, '#F0E2C2', '#D4BC8C'), null); ctx.restore();
  txt('RESULTS DAY', 0, -118, 46, '#5A3A1A', 'Oswald', 700); line(-200, -84, 200, -84, 'rgba(60,40,20,0.5)', 3);
  txt('Group project', -60, -20, 40, '#3A2A1A', 'CrimsonText', 700);
  const sk = back(seg(k, 0.35, 0.8)); withT(150, 40, sk ? lerp(1.8, 1, sk) : 0, -0.18, () => alpha(sk, () => { P(circ(0, 0, 86), null, '#8E1B1B', 8); txt('A', 0, 6, 120, '#8E1B1B', 'CrimsonText', 700); }));
  for (let i = 0; i < 3; i++) line(-200, 40 + i * 32, 20 - i * 30, 40 + i * 32, 'rgba(60,40,20,0.4)', 4); })); }

// ---------- dawn window + phone ----------
function phoneSet(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.05, 14);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#120E1C', '#050306'));
      const wx = 520, wy = 220, ww = 470, wh = 900; const sk = ctx.createLinearGradient(0, wy, 0, wy + wh); sk.addColorStop(0, '#2A1E3A'); sk.addColorStop(0.6, '#D27A4E'); sk.addColorStop(1, '#F7C47A'); ctx.fillStyle = sk; ctx.fillRect(wx, wy, ww, wh);
      ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip(); glow(800, wy + wh - 60, 300, '#FFE2A0', 0.7); P(circ(800, wy + wh - 40, 60), 'rgba(255,236,190,0.95)', null); rooftops(wy + wh, '#2A1620', 53, 80); ctx.restore();
      line(wx + ww / 2, wy, wx + ww / 2, wy + wh, '#120C10', 12); line(wx, wy + wh * 0.4, wx + ww, wy + wh * 0.4, '#120C10', 12); P(rr(wx, wy, ww, wh, 2), null, '#120C10', 24); } },
    { z: 0.25, draw: () => { beam(760, 900, 400, 520, 1500, 900, SS.dawnRGB, 0.14); P(rr(-200, 1240, W + 400, 700), grad(1240, H, '#1C120E', '#050304'), null); } },
    { z: 0.5, draw: () => { person(330, 1250, 1.45, { sit: true, f: 1, rim: '#FFC27A', rimA: 0.85 });
      const px = 440, py = 880; glow(px, py, 140, '#9FC0FF', 0.5); P(rr(px - 22, py - 36, 44, 72, 7), '#BFD4FF', '#0A0A12', 3);
      withT(330, 1250, 1.45, 0, () => P(new Path2D('M60 -170 Q120 -230 76 -260 L64 -250 Q90 -220 40 -180 Z'), '#06060A', null));
      if (o.mug) { P(rr(640, 1180, 70, 62, 10), '#E8DCC8', null); for (let k = 0; k < 3; k++) alpha(0.25, () => line(660 + k * 14, 1170, 666 + k * 14 + Math.sin(t * 2 + k) * 8, 1100, '#fff', 4)); } } },
    { z: 1.1, blur: 7, draw: () => { P(ell(-20, 900, 90, 600), '#020203', null); } },
  ], cam);
  dust(t, 40, [500, 300, 520, 900], '255,214,170', 29);
}
function msgCard(k, typed, t) { if (k <= 0) return; withT(W / 2, 560 + (1 - easeOut(k)) * 40, 1, 0, () => alpha(clamp(k * 1.5), () => {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; P(rr(-400, -150, 800, 300, 40), 'rgba(16,18,30,0.92)', 'rgba(159,192,255,0.6)', 3); ctx.restore();
  P(circ(-330, -90, 30), M.gold2, null); txt('A', -330, -88, 34, '#1A120B', 'Oswald', 700); txt('to: the one who makes me sharper', -280, -90, 30, 'rgba(200,214,255,0.75)', 'Montserrat', 600, 'left');
  const full = 'You make me sharper because…'; const s = full.slice(0, Math.round(full.length * clamp(typed)));
  const b = new Path2D(); b.roundRect(-340, -30, 680, 110, 40); P(b, '#3A63D8', null);
  txt(s + ((Math.floor(t * 3) % 2 && typed < 1) ? '|' : ''), -300, 26, 40, '#FFFFFF', 'Montserrat', 700, 'left');
  if (typed >= 1) { const sk = back(seg(typed, 1, 1)); P(circ(330, 100, 30), '#2BB673', null); txt('➤', 332, 102, 30, '#fff', 'Montserrat', 700); } })); }

// ---------- chess corner ----------
function chessCorner(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.08, 18), g = o.glow || 0;
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#0E080A', '#040304')); glow(540, 900, 700, '#8E1B1B', 0.18); glow(700, 700, 400, '#FFB45A', 0.15 * flick(t)); } },
    { z: 0.3, draw: () => { board(540, 1060, 1500, 8, t, null, 600); } },
    { z: 0.55, draw: () => { [[160, 1250, 'pawn', 1.2], [880, 1210, 'pawn', 1.1]].forEach(([x, y, k, s]) => chessPiece(k, x, y, s, '#0B0A0E', M.gold, 0.3));
      chessPiece('king', 430, 1330, 2.2, '#0B0A0E', M.gold, 0.6);
      glow(680, 1100, 300, '#F6D27A', 0.5 * g); chessPiece('queen', 680, 1330, 2.0, '#0B0A0E', M.gold2, 0.5 + 0.5 * g); } },
    { z: 1.1, blur: 7, draw: () => { chessPiece('pawn', 960, 2000, 2.6, '#020203', M.gold, 0.2); } },
  ], cam);
  dust(t, 40, [100, 400, 880, 800], '255,214,170', 37);
}

// ================= SCENES =================
DRAW.sc1 = (t, d) => { // hook: you + a ring of five forming, one by one
  const u = lt('h1'); const ks = [0, 1, 2, 3, 4].map(i => easeOut(seg(u, wt('h1', 2) + i * 0.22, wt('h1', 2) + i * 0.22 + 0.35)));
  withT(540, 860, lerp(1.0, 1.12, ease(t / d)), 0, () => withT(-540, -860, 1, 0, () => ringScene(t, { k: ks, lit: seg(u, wt('h1', 8), wt('h1', 9)), rot: 0.6283 + t * 0.05, cy: 900 })));
  bigText('NAME YOUR TOP 5', W / 2, 330, 96, '#FFFFFF', seg(u, 0.0, 0.2) * (1 - seg(u, 2.0, 2.2)));
  bigText('THAT LIST', W / 2, 330, 100, '#FFFFFF', seg(u, wt('h1', 8) - 0.05, wt('h1', 8) + 0.15));
  bigText('IS YOUR REAL CV', W / 2, 1360, 100, M.gold2, kin('h1', 12, 0.1, 0.25));
};
DRAW.sc2 = (t, d) => { // Siena at dawn; the lord, then his right-hand man, on the loggia
  const u = lt('n2'); const rk = easeOut(seg(u, wt('n2', 10) - 0.2, wt('n2', 12) + 0.2));
  sienaSet(t, d, { dawn: lerp(0.55, 0.85, t / d), cam: { zoom: lerp(1.0, 1.1, ease(t / d)), px: lerp(-30, 20, ease(t / d)), py: 0, cy: 1000 },
    figs: () => { lordFig(700, 1240, 1.05, { f: -1, rim: '#FFC27A', rimA: 0.8 * easeOut(seg(u, wt('n2', 7) - 0.3, wt('n2', 8))) });
      if (rk > 0) alpha(rk, () => lordFig(lerp(330, 430, rk), 1240, 0.98, { f: 1, rim: M.gold2, rimA: 0.95, scroll: true, cap: '#14100E' })); } });
  chipAt('Siena · c. 1500', 260, kin('n2', 0, 0.05, 0.3));
  label('PANDOLFO PETRUCCI · lord of Siena', W / 2, 400, kin('n2', 8, 0.1, 0.3) * (1 - seg(u, wt('n2', 11) - 0.2, wt('n2', 11))), M.parch, 42);
  label('RIGHT-HAND MAN', W / 2, 400, kin('n2', 12, 0.1, 0.25), M.gold2, 56);
};
DRAW.sc3 = (t, d) => { // palazzo hall: the crowd looks at the right-hand man
  const u = lt('n3');
  hallSet(t, d, { cam: { zoom: lerp(1.0, 1.06, ease(t / d)), px: lerp(10, -10, t / d), py: 0, cy: 1000 }, vk: 0.5 + 0.5 * seg(u, 0, 0.8), pk: 0.15, gaze: seg(u, wt('n3', 4) - 0.3, wt('n3', 4) + 0.3) });
  label('ANTONIO DA VENAFRO', W / 2, 260, kin('n3', 0, 0.05, 0.3), M.gold2, 52);
  bigText('JUDGED BY HIM', W / 2, 400, 100, '#FFFFFF', kin('n3', 6, 0.1, 0.25));
};
DRAW.sc4 = (t, d) => { // his light makes the lord look clever
  const u = lt('n4'); const pk = 0.15 + 0.85 * seg(u, wt('n4', 5) - 0.2, wt('n4', 6) + 0.3);
  hallSet(t + 4, d, { cam: { zoom: lerp(1.08, 1.16, ease(t / d)), px: -10, py: 0, cy: 1050 }, vk: 1, pk });
  chipAt('in essence · The Prince, Ch. 22 (tr. Marriott)', 250, kin('n4', 0, 0.05, 0.3));
  bigText('LOOKED CLEVER', W / 2, 400, 100, M.gold2, kin('n4', 6, 0.1, 0.25));
  alpha(kin('n4', 7, 0.1, 0.3), () => txt('…simply for having him', W / 2, 510, 54, M.parch, 'CrimsonText', 700));
};
DRAW.sc5 = (t, d) => { // quote card over the hall
  hallSet(t + 8, d, { cam: { zoom: lerp(1.16, 1.2, ease(t / d)), px: -10, py: 0, cy: 1050 }, vk: 1, pk: 1 });
  ctx.fillStyle = 'rgba(4,3,6,0.5)'; ctx.fillRect(0, 0, W, H);
  quoteCard2('q1', 2, 'the first opinion which one forms of a prince… is by observing the men he has around him.', ['— The Prince, Ch. 22 (tr. Marriott)'], ['opinion', 'observing', 'around'], { size: 64, cy: 760, in: 0.1 });
};
DRAW.sc6 = (t, d) => { // three unlit lanterns
  const u = lt('n5');
  lampHall(t, d, { cam: { zoom: lerp(1.12, 1.0, ease(t / d)), px: 0, py: 0, cy: 800 }, nums: seg(u, wt('n5', 5) - 0.2, wt('n5', 6)) });
  bigText('3 KINDS OF MINDS', W / 2, 330, 96, M.gold2, kin('n5', 5, 0.1, 0.25));
};
DRAW.sc7 = (t, d) => { // self-lit / lit from another's flame / never catches
  const u = lt('n6');
  const on0 = seg(u, wt('n6', 1), wt('n6', 4)), arc = seg(u, wt('n6', 6) - 0.1, wt('n6', 10)), on1 = seg(u, wt('n6', 10) - 0.1, wt('n6', 10) + 0.3);
  const arc3 = seg(u, wt('n6', 11) - 0.1, wt('n6', 13)), sm = seg(u, wt('n6', 13), wt('n6', 13) + 1.0);
  lampHall(t + 3, d, { cam: { zoom: 1.0, px: 0, py: 0, cy: 800 }, on: [on0, on1, 0], smoke: [0, 0, sm], nums: 1,
    extra: () => { spark(LX[0], 760, seg(u, wt('n6', 1) - 0.05, wt('n6', 2) + 0.4), t); flameArc(arc, 760, 1);
      if (arc3 > 0 && arc3 < 1) { const x = lerp(LX[1], LX[2], ease(arc3)), y = 760 - Math.sin(arc3 * Math.PI) * 200; glow(x, y, 100, '#FFD27A', 0.7 * (1 - arc3)); P(circ(x, y, 10 * (1 - arc3 * 0.7)), '#FFF3D6', null); } } });
  chipAt('in essence · The Prince, Ch. 22 (tr. Marriott)', 250, kin('n6', 0, 0.05, 0.3));
  label('SEES IT ALONE', LX[0], 1080, seg(u, wt('n6', 3), wt('n6', 4)), M.gold2, 34);
  label('SEES IT IN OTHERS', LX[1], 1160, seg(u, wt('n6', 9), wt('n6', 10)), M.gold2, 34);
  label('SEES NEITHER', LX[2], 1080, seg(u, wt('n6', 12), wt('n6', 13)), '#B9AFA6', 34);
};
DRAW.sc8 = (t, d) => { // quote card above the three lanterns; verdict labels
  const u = lt('q2');
  lampHall(t + 8, d, { cam: { zoom: 1.0, px: 0, py: 0, cy: 800 }, on: [1, 1, 0], y: 1060, s: 1.05 });
  ctx.fillStyle = 'rgba(4,3,6,0.35)'; ctx.fillRect(0, 0, W, H);
  quoteCard2('q2', 2, 'the first is the most excellent, the second is good, the third is useless.', ['— The Prince, Ch. 22 (tr. Marriott)'], ['excellent', 'good', 'useless'], { size: 62, cy: 600, in: 0.1 });
  label('EXCELLENT', LX[0], 1260, seg(u, wt('q2', 7) - 0.1, wt('q2', 7) + 0.2), M.gold2, 40);
  label('GOOD', LX[1], 1260, seg(u, wt('q2', 11) - 0.1, wt('q2', 11) + 0.2), M.gold2, 40);
  label('USELESS', LX[2], 1260, seg(u, wt('q2', 15) - 0.1, wt('q2', 15) + 0.2), '#B9AFA6', 40);
};
DRAW.sc9 = (t, d) => { // crowd + magnifier: spotting the good mind
  const u = lt('n7'); const sw = seg(u, 0.3, wt('n7', 8) + 0.1), hit = seg(u, wt('n7', 8), wt('n7', 9) + 0.2);
  const cam = { zoom: lerp(1.0, 1.08, ease(t / d)), px: 0, py: 0, cy: 1000 };
  const rows = [[760, 0.62, 7], [960, 0.8, 6], [1190, 1.0, 5]];
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#0C0A14', '#050306')); glow(540, 700, 800, '#3A4A8A', 0.15); glow(540, 1300, 700, '#FF9A50', 0.12); } },
    ...rows.map(([y, s, n], r) => ({ z: 0.2 + r * 0.25, haze: r === 0 ? 0.08 : 0, draw: () => { for (let i = 0; i < n; i++) { const x = 90 + i * (900 / (n - 1)); const star = r === 1 && i === 3;
      if (star) glow(x, y - 140 * s, 240, '#F6D27A', 0.6 * hit);
      bust(x, y, s, { col: '#06050A', rim: star && hit > 0 ? M.gold2 : 'rgba(255,220,190,0.45)', rimA: star ? 0.4 + 0.6 * hit : 0.35, f: i % 2 ? 1 : -1, nod: Math.sin(t + i) * 0.04 }); } } })),
  ], cam);
  const sx = 90 + 3 * 150, mx = lerp(120, sx, ease(sw)) + Math.sin(t * 2) * 6 * (1 - hit), my = 960 - 0.8 * 140 + Math.cos(t * 1.7) * 8 * (1 - hit);
  magnifier(mx, my, 1.1, 120); if (hit > 0) glow(mx, my, 130, '#FFE2A0', 0.35 * hit);
  dust(t, 40, [60, 400, 960, 900], '255,214,170', 41);
  bigText("NOT THE GENIUS?", W / 2, 330, 96, '#FFFFFF', kin('n7', 2, 0.1, 0.25) * (1 - seg(u, wt('n7', 8) - 0.25, wt('n7', 8))));
  bigText('SPOTTING = POWER', W / 2, 330, 90, M.gold2, kin('n7', 8, 0.1, 0.25));
};
DRAW.sc10 = (t, d) => { // group project: pick the quiet reader → A on results day
  const u = lt('n8');
  classSet(t, d, { cam: { zoom: lerp(1.0, 1.08, ease(t / d)), px: lerp(-10, 20, ease(t / d)), py: 0, cy: 1100 }, ring: seg(u, wt('n8', 2) - 0.1, wt('n8', 2) + 0.3), chat: seg(u, 0.1, 0.8) * (1 - seg(u, wt('n8', 2) - 0.2, wt('n8', 2))) });
  chipAt('Group project', 250, kin('n8', 0, 0.05, 0.3));
  bigText('PICK THE QUIET ONE', W / 2, 380, 88, '#FFFFFF', kin('n8', 2, 0.1, 0.25) * (1 - seg(u, wt('n8', 12) - 0.3, wt('n8', 12))));
  resultCard(W / 2, 470, seg(u, wt('n8', 12) - 0.3, wt('n8', 15) + 0.3), t);
};
DRAW.sc11 = (t, d) => { // flip: you are one of THEIR five; your light makes them look wise
  const u = lt('n9'); const fl = seg(t, 0, 0.5);
  ctx.save(); ctx.translate(W / 2, 0); ctx.scale(fl < 0.5 ? lerp(-1, 0.02, ease(fl * 2)) : lerp(0.02, 1, ease((fl - 0.5) * 2)), 1); ctx.translate(-W / 2, 0);
  ringScene(t, { k: [1, 1, 1, 1, 1], lit: 0.6, rot: 0.6283 + 0.25 + t * 0.04, cy: 900, you: 3, youK: seg(u, wt('n9', 3) - 0.1, wt('n9', 3) + 0.2), flow: seg(u, wt('n9', 8) - 0.1, wt('n9', 10)),
    center: { rim: SS.teal, halo: seg(u, wt('n9', 10), wt('n9', 11) + 0.3) } });
  ctx.restore();
  bigText('NOW FLIP IT', W / 2, 330, 100, '#FFFFFF', seg(u, 0.05, 0.25) * (1 - seg(u, wt('n9', 8) - 0.25, wt('n9', 8))));
  bigText('MAKE THEM LOOK WISE', W / 2, 330, 74, M.gold2, kin('n9', 8, 0.1, 0.25));
};
DRAW.sc12 = (t, d) => { // this morning: one message at the dawn window
  const u = lt('n10');
  phoneSet(t, d, { cam: { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0, cy: 1000 }, mug: true });
  bigText('THIS MORNING', W / 2, 300, 100, M.gold2, seg(u, 0, 0.2));
  msgCard(seg(u, wt('n10', 2) - 0.3, wt('n10', 2)), seg(u, wt('n10', 2), wt('n10', 12)), t);
};
DRAW.sc13 = (t, d) => { // who's in your corner? chess: the king and the piece that lights him
  const u = lt('n11');
  chessCorner(t, d, { cam: { zoom: lerp(1.0, 1.1, ease(t / d)), px: 0, py: 0, cy: 1100 }, glow: seg(u, wt('n11', 2) - 0.2, wt('n11', 2) + 0.4) });
  bigText("WHO'S YOUR", W / 2, 320, 96, '#FFFFFF', seg(u, 0, 0.2));
  bigText('VENAFRO?', W / 2, 440, 116, M.gold2, kin('n11', 2, 0.1, 0.25));
  const kc = back(seg(u, wt('n11', 6) - 0.05, wt('n11', 6) + 0.35)); if (kc > 0) withT(800, 620, kc, 0, () => { const b = new Path2D(); b.roundRect(-110, -70, 220, 130, 30); b.moveTo(-30, 60); b.lineTo(-60, 105); b.lineTo(10, 60); P(b, '#F6F2E8', '#111', 4); for (let i = -1; i <= 1; i++) P(circ(i * 48, -5, 13), '#222', null); });
};
DRAW.sc14 = (t, d) => { // end card: a ring of five lights around the logo
  fullFill(grad(0, H, '#07060C', '#120A0E')); glow(540, 700, 700, '#FF9A50', 0.14);
  const N = ringNodes(540, 660, 300, t * 0.2); N.forEach((p, i) => { const k = seg(t, 0.1 + i * 0.08, 0.4 + i * 0.08); glow(p[0], p[1], 90, ['#FFB45A', '#7FA8FF', '#E58A4E', '#4FB3B3', '#F6D27A'][i], 0.7 * k); P(circ(p[0], p[1], 10 * k), '#FFF3D6', null); });
  dust(t, 40, [100, 300, 880, 1100], '255,214,170', 47);
  const k = easeOut(seg(t, 0, 0.4)); const L = document.getElementById('logo');
  withT(W / 2, 640, lerp(0.8, 1, k), 0, () => alpha(k, () => { glow(0, 0, 320, M.gold, 0.4); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -135, -135, 270, 270); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.strokeStyle = M.gold2; ctx.lineWidth = 7; ctx.stroke(); }));
  bigText('Follow Awazzzz', W / 2, 1040, 104, '#FFFFFF', seg(t, 0.1, 0.4));
  bigText('MINDSET', W / 2, 1165, 66, M.gold2, seg(t, 0.3, 0.6), 'Oswald', 700);
  alpha(seg(t, 0.5, 0.8), () => txt('choose your circle well', W / 2, 1255, 50, M.parch, 'CrimsonText', 600));
  const pulse = 1 + 0.04 * Math.sin(t * 6); withT(W / 2, 1380, back(seg(t, 0.6, 0.9)) * pulse, 0, () => { P(rr(-200, -50, 400, 100, 50), '#E62117', '#111', 4); txt('SUBSCRIBE', 0, 4, 52, '#fff', 'Oswald', 700); });
};
function drawFrame(T) {
  GT = T; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, W, H);
  const i = SCENES.findIndex(s => T >= s.start && T < s.start + s.dur); const s = SCENES[i < 0 ? SCENES.length - 1 : i];
  ctx.save(); DRAW[s.id](T - s.start, s.dur); ctx.restore(); ctx.filter = 'none';
  const u = T - s.start; if (u < 0.18 && s.start > 0 && s.id !== 'sc11') { ctx.fillStyle = `rgba(0,0,0,${1 - u / 0.18})`; ctx.fillRect(0, 0, W, H); }
  const nxt = SCENES[SCENES.indexOf(s) + 1]; if (nxt && nxt.id !== 'sc11' && s.start + s.dur - T < 0.1) { ctx.fillStyle = `rgba(0,0,0,${1 - (s.start + s.dur - T) / 0.1})`; ctx.fillRect(0, 0, W, H); }
  vign(0.6); grain(T);
  if (s.id !== 'sc14') { watermark(T); captions(); }
}
function drawCover() {
  GT = LINES.n4.start + 3.6; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  hallSet(3, 5, { cam: { zoom: 1.12, px: -10, py: 0, cy: 1050 }, vk: 1, pk: 1, gaze: 1 }); ctx.filter = 'none';
  vign(0.5); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, W, 760);
  withT(W / 2, 260, 1, 0, () => { ctx.font = '700 54px Oswald'; const s = 'MACHIAVELLI'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -44, w, 88, 44), 'rgba(110,14,14,0.92)', M.gold2, 4); txt(s, 0, 3, 54, '#FFF3D6', 'Oswald', 700); });
  bigText("WHO'S", W / 2, 430, 150, '#FFFFFF', 1);
  bigText('AROUND YOU?', W / 2, 590, 118, M.gold2, 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
  bigText('The Prince · Ch. 22', W / 2, 730, 64, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
