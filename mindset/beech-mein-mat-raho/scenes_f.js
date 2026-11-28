// ===== "Don't Sit on the Fence" — scene set for The Prince, Ch. 21 (true friend or downright enemy; the neutral path)
// New for this episode: a dusk field split by a receding wooden fence (red camp left, gold camp right) with a lone
// figure straddling the top rail; a torch-lit Greek council colonnade with two envoys and their banners, seated council
// in the foreground; giant envoy shadows over a small figure tagged "PRIZE"; modern meeting room with PLAN A / PLAN B
// boards and two leads who turn away; a storm fork with a balance weighing two clouds (lesser risk); stepping down off
// the fence with a lantern; tonight's phone chat ("either is fine" struck out); empty fence at first light; end card.
const FF = { red: '#C0392B', redRGB: '210,70,50', gold: '#F6D27A', goldRGB: '246,200,110', steel: '#7F9CC8' };

function lantern(x, y, s, t, on = 1) { withT(x, y, s, 0, () => { glow(0, 0, 300 * flick(t), '#FFB45A', 0.55 * on); line(0, -70, 0, -46, '#120C08', 5);
  P(rr(-30, -46, 60, 16, 4), '#1A120B', null); P(rr(-26, -30, 52, 70, 8), `rgba(255,${190 + 30 * on},120,${0.35 + 0.6 * on})`, '#1A120B', 6); line(0, -30, 0, 40, '#1A120B', 4); P(rr(-32, 38, 64, 12, 4), '#1A120B', null);
  glow(0, 5, 60, '#FFF1C0', 0.8 * on); }); }

// ---------- the fence field ----------
const HZF = 900;
function fy(p) { return HZF + Math.pow(p, 1.4) * (H + 160 - HZF); }
function fx(p) { return lerp(548, 250, p); }
function fpost(p) { return { x: fx(p), y: fy(p), h: 14 + 900 * p, w: 5 + 66 * p }; }
const SITP = 0.45;
function tent(x, y, s, col) { withT(x, y, s, 0, () => { P(poly([-70, 0, 0, -90, 70, 0]), col, null); P(poly([-8, 0, 0, -40, 8, 0]), 'rgba(255,190,110,0.5)', null); }); }
function fenceSet(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.08, 18), night = o.night ?? 0, dawn = o.dawn ?? 0, rain = o.rain ?? 0;
  layers([
    { z: 0.03, draw: () => {
      const sk = ctx.createLinearGradient(0, 0, 0, HZF + 30);
      sk.addColorStop(0, lerpC(lerpC('#140C22', '#05060C', night), '#1C2244', dawn)); sk.addColorStop(0.5, lerpC(lerpC('#3A1A3C', '#0C0E1C', night), '#6A4A6A', dawn)); sk.addColorStop(0.82, lerpC(lerpC('#9A4038', '#141626', night), '#D88A6A', dawn)); sk.addColorStop(1, lerpC(lerpC('#E0884A', '#1A1A2C', night), '#F6C080', dawn));
      fullFill(sk);
      alpha(0.3 + 0.7 * night, () => { for (let i = 0; i < 80; i++) P(circ(rnd(i * 2.3) * W, rnd(i * 5.1) * 700, 1 + rnd(i) * 2), `rgba(255,243,214,${0.3 + 0.5 * Math.abs(Math.sin(t * 0.7 + i))})`, null); });
      glow(880, 640, 150, '#F6E6C0', 0.25 + 0.2 * night); P(circ(880, 640, 40), lerpC('#EADBB8', '#F6E9CC', night), null);
      glow(W / 2, HZF, 560, lerpC('#FF9A50', '#3A4A7A', night), 0.45 * (1 - night * 0.5));
      ctx.fillStyle = lerpC('#140A12', '#07080E', night); ctx.beginPath(); ctx.moveTo(-200, HZF + 6); for (let i = 0; i <= 14; i++) ctx.lineTo(-200 + i * 110, HZF - 30 - 40 * Math.sin(i * 1.1) - 26 * rnd(i + 4)); ctx.lineTo(W + 200, HZF + 6); ctx.closePath(); ctx.fill();
    } },
    { z: 0.2, draw: () => { // two camps on the horizon: red left, gold right
      const camps = o.camps ?? 1;
      if (camps > 0) alpha(camps, () => {
        glow(200, HZF - 10, 300, FF.red, 0.45 * flick(t)); glow(890, HZF - 10, 300, '#E2A040', 0.45 * flick(t + 2));
        [70, 170, 280, 380].forEach((x, i) => tent(x, HZF + 4, 0.55 + 0.1 * (i % 2), '#1A0606'));
        [700, 800, 910, 1010].forEach((x, i) => tent(x, HZF + 4, 0.55 + 0.1 * ((i + 1) % 2), '#1A1206'));
        [120, 330].forEach((x, i) => { glow(x, HZF - 40, 40, '#FF7A40', 0.9 * flick(t + i)); line(x, HZF - 40, x, HZF + 2, '#120606', 3); });
        [760, 960].forEach((x, i) => { glow(x, HZF - 40, 40, '#FFC860', 0.9 * flick(t + i + 4)); line(x, HZF - 40, x, HZF + 2, '#120C06', 3); });
        // banners
        [[230, FF.red], [850, '#D8A040']].forEach(([x, c], i) => { line(x, HZF - 150, x, HZF + 2, '#0A0606', 4); const wv = Math.sin(t * 3 + i) * 6; P(poly([x, HZF - 150, x + (i ? -70 : 70), HZF - 140 + wv, x + (i ? -70 : 70), HZF - 100 + wv, x, HZF - 108]), c, null); });
      });
    } },
    { z: 0.35, draw: () => { // the two fields, split by the fence line
      const gl = ctx.createLinearGradient(0, HZF, 0, H); gl.addColorStop(0, lerpC('#3A1410', '#140A0C', night)); gl.addColorStop(1, '#070304');
      const gr = ctx.createLinearGradient(0, HZF, 0, H); gr.addColorStop(0, lerpC('#3A2A10', '#12100A', night)); gr.addColorStop(1, '#060504');
      P(poly([-300, HZF, fx(0), HZF, fx(1.3), H + 400, -300, H + 400]), gl, null);
      P(poly([fx(0), HZF, W + 300, HZF, W + 300, H + 400, fx(1.3), H + 400]), gr, null);
      alpha(0.22, () => { for (let i = -8; i <= 8; i++) { if (!i) continue; const bx = fx(1) + i * 260; line(fx(0) + i * 6, HZF, bx, H + 200, '#000', 3); } });
      alpha(0.5, () => { glow(240, 1250, 520, FF.red, 0.16 * (o.redA ?? 1)); glow(860, 1250, 520, '#E2A040', 0.16 * (o.goldA ?? 1)); });
      o.ground && o.ground();
    } },
    { z: 0.6, draw: () => { // the fence: posts + two rails receding to the horizon
      const N = 16, ps = []; for (let i = 0; i <= N; i++) ps.push(fpost(Math.pow(i / N, 1.1) * 1.05));
      for (let i = 0; i < ps.length - 1; i++) { const a = ps[i], b = ps[i + 1];
        [0.42, 0.82].forEach(r => { const q = new Path2D(); const ta = a.h * r, tb = b.h * r, th = 0.1;
          q.moveTo(a.x, a.y - ta); q.lineTo(b.x, b.y - tb); q.lineTo(b.x, b.y - tb + b.h * th); q.lineTo(a.x, a.y - ta + a.h * th); q.closePath(); P(q, grad(Math.min(a.y - ta, b.y - tb), a.y - ta + a.h * th, '#7A5232', '#3A2414'), null);
          line(a.x, a.y - ta, b.x, b.y - tb, 'rgba(255,200,140,0.7)', 1.5 + 4 * (i / N)); }); }
      ps.forEach((p, i) => { P(rr(p.x - p.w / 2, p.y - p.h, p.w, p.h, p.w * 0.2), grad(p.y - p.h, p.y, '#5A3A20', '#1A0E06'), null); alpha(0.6, () => line(p.x + p.w * 0.38, p.y - p.h + 4, p.x + p.w * 0.38, p.y, 'rgba(255,200,140,0.6)', 1 + p.w * 0.1)); P(rr(p.x - p.w / 2 - 2, p.y - p.h - 6, p.w + 4, 10 + p.w * 0.15, 3), '#2A1A0E', null); P(ell(p.x, p.y, p.w * 1.2, p.w * 0.3), 'rgba(0,0,0,0.5)', null); });
      o.fence && o.fence();
    } },
    ...(o.mid || []),
    { z: 1.1, blur: 7, draw: () => { // foreground grass tufts
      for (let i = 0; i < 22; i++) { const x = i < 11 ? -40 + i * 24 : W - 230 + (i - 11) * 24, h = 160 + rnd(i + 2) * 180, sw = Math.sin(t * 1.4 + i) * 14;
        ctx.save(); ctx.strokeStyle = '#030202'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x, H + 20); ctx.quadraticCurveTo(x + sw * 0.5, H - h * 0.5, x + sw, H - h); ctx.stroke(); ctx.restore(); }
    } },
  ], cam);
  if (rain > 0) rainFx(t, rain, 11);
  dust(t, 50, [0, 500, W, 900], night ? '200,210,240' : '255,214,160', o.seed || 31);
}
// figure straddling the top rail, facing the viewer; seat at (x,y)
function fenceSitter(x, y, s, t, o = {}) {
  withT(x, y, s, 0, () => {
    const col = '#050407', sw = Math.sin(t * 1.3) * 0.08;
    [-1, 1].forEach(sd => { withT(sd * 40, 0, 1, -sd * (0.32 + sw), () => { P(rr(-22, -6, 44, 124, 20), col, null); withT(0, 116, 1, sd * (0.3 + sw * 0.5), () => { P(rr(-18, -6, 36, 118, 15), col, null); P(rr(-24 + sd * 10, 102, 50, 22, 10), col, null); }); }); });
    person(0, 6, 1, { sit: true, f: 1, col, rim: o.rim || FF.gold, rimA: o.rimA ?? 0.7 });
    [-1, 1].forEach(sd => P(rr(sd * 70 - 14, -150, 28, 140, 12), col, null));
    if (o.rimL) { ctx.save(); ctx.globalAlpha = 0.55; ctx.strokeStyle = FF.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-78, -6); ctx.lineTo(-74, -186); ctx.bezierCurveTo(-72, -214, -52, -232, -18, -236); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, -282, 42, 50, 0, Math.PI - 1.3, Math.PI + 1.3); ctx.stroke(); ctx.restore(); }
  });
}
function sitterOnFence(t, o = {}) { const p = fpost(SITP); fenceSitter(p.x, p.y - p.h * 0.86, 1.0, t, o); }

// ---------- Greek council colonnade ----------
function banner(x, y, s, t, col, kind, ph = 0, fl = 1) { withT(x, y, s, 0, () => { ctx.scale(fl, 1);
  line(0, 0, 0, -640, '#120A06', 9); P(circ(0, -650, 12), '#C8A050', null);
  const wv = k => Math.sin(t * 2.4 + ph + k * 2) * 10; const cl = new Path2D(); cl.moveTo(8, -620); cl.lineTo(200, -620 + wv(0)); cl.lineTo(200, -330 + wv(1)); cl.lineTo(104, -290 + wv(1.5)); cl.lineTo(8, -330); cl.closePath();
  glow(104, -470, 220, col, 0.25); P(cl, col, 'rgba(0,0,0,0.6)', 3);
  alpha(0.35, () => P(poly([8, -620, 60, -620, 60, -320, 8, -330]), '#000', null));
  if (kind === 'sun') { P(circ(104, -480 + wv(0.7), 40), '#2A0606', null); for (let i = 0; i < 10; i++) { const a = i * 0.628; line(104 + Math.cos(a) * 52, -480 + wv(0.7) + Math.sin(a) * 52, 104 + Math.cos(a) * 70, -480 + wv(0.7) + Math.sin(a) * 70, '#2A0606', 7); } }
  else { ctx.save(); ctx.strokeStyle = '#3A2406'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(104, -480 + wv(0.7), 50, 0.5, Math.PI - 0.5, true); ctx.stroke(); ctx.restore(); for (let i = 0; i < 7; i++) { const a = Math.PI + 0.5 + i * 0.36; P(ell(104 + Math.cos(a) * 50, -480 + wv(0.7) + Math.sin(a) * 50, 14, 6, a + 1.2), '#3A2406', null); } }
}); }
function envoy(x, y, s, t, o = {}) { withT(x, y, s, 0, () => { const f = o.f || 1; ctx.save(); ctx.scale(f, 1);
  P(poly([-70, -350, 70, -350, 120, 0, -110, 0]), o.cloak || '#3A0A0A', null);   // cloak
  ctx.restore(); person(0, 0, 1, { f, col: '#060408', rim: o.rim, rimA: o.rimA ?? 0.85 });
  if (o.arm) withT(f * 70, -330, 1, f * (-0.9 - 0.2 * Math.sin(t * 2)), () => P(rr(-14, 0, 28, 170, 12), '#060408', null)); }); }
function column(x, y0, y1, w, t, lit = 1) {
  const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#1A1420'); g.addColorStop(0.35, lerpC('#3A3040', '#8A6A50', lit * 0.6)); g.addColorStop(1, '#0C0A10');
  P(rr(x - w / 2, y0, w, y1 - y0, 0), g, null);
  alpha(0.35, () => { for (let k = 1; k < 5; k++) line(x - w / 2 + k * w / 5, y0 + 20, x - w / 2 + k * w / 5, y1 - 20, '#000', 3); });
  P(rr(x - w * 0.72, y0 - 34, w * 1.44, 34, 4), '#2A2230', null); P(rr(x - w * 0.62, y0 - 6, w * 1.24, 14, 3), '#1A1420', null); P(rr(x - w * 0.72, y1, w * 1.44, 30, 3), '#1A1420', null);
}
function torch(x, y, s, t) { withT(x, y, s, 0, () => { glow(0, -40, 280 * flick(t), '#FF9A40', 0.5); P(poly([-14, 0, 14, 0, 8, 60, -8, 60]), '#1A0E06', null); P(rr(-22, -10, 44, 16, 6), '#2A1A0E', null);
  const fl = Math.sin(t * 11) * 4; const f = new Path2D(); f.moveTo(0, -70 + fl); f.bezierCurveTo(22, -40, 16, -10, 0, -8); f.bezierCurveTo(-16, -10, -22, -40, 0, -70 + fl); P(f, '#FFB040', null); P(ell(0, -24, 7, 13), '#FFF0C0', null); }); }
function hallSet(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.07, 16);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#060814', '#030306'));
      alpha(0.9, () => { for (let i = 0; i < 90; i++) P(circ(rnd(i * 3.3) * W, 140 + rnd(i * 7.7) * 900, 1 + rnd(i) * 2), `rgba(255,240,210,${0.25 + 0.5 * Math.abs(Math.sin(t * 0.6 + i))})`, null); });
      glow(540, 1100, 600, '#3A2A50', 0.4);
      ctx.fillStyle = '#0A0710'; ctx.beginPath(); ctx.moveTo(-200, 1150); for (let i = 0; i <= 12; i++) ctx.lineTo(-200 + i * 125, 1060 - 40 * Math.sin(i * 1.4) - 30 * rnd(i + 9)); ctx.lineTo(W + 200, 1150); ctx.closePath(); ctx.fill(); } },
    { z: 0.22, draw: () => { // colonnade + pediment
      P(poly([-60, 300, W / 2, 110, W + 60, 300]), '#1A1420', null); alpha(0.5, () => line(-60, 300, W / 2, 110, 'rgba(255,190,120,0.4)', 4));
      P(rr(-80, 300, W + 160, 90, 0), grad(300, 390, '#2A2230', '#120E18'), null); alpha(0.35, () => { for (let i = 0; i < 18; i++) P(rr(-60 + i * 70, 330, 40, 30, 2), '#0A0810', null); });
      [40, 300, 540, 780, 1040].forEach((x, i) => column(x, 424, 1150, 110, t, 0.6 + 0.4 * (i % 2)));
      [170, 910].forEach((x, i) => torch(x, 820, 1.2, t + i * 3));
    } },
    { z: 0.42, draw: () => { // floor + steps
      P(rr(-200, 1150, W + 400, 800, 0), grad(1150, H, '#2A2026', '#07050A'), null);
      for (let k = 0; k < 3; k++) { line(-200, 1180 + k * 34, W + 200, 1180 + k * 34, 'rgba(255,200,150,0.18)', 3); }
      alpha(0.4, () => { glow(170, 1250, 300, '#FF9A40', 0.3 * flick(t)); glow(910, 1250, 300, '#FF9A40', 0.3 * flick(t + 3)); });
      o.floor && o.floor();
    } },
    ...(o.mid || []),
    { z: 0.85, draw: () => { if (o.noCouncil) return; for (let i = 0; i < 6; i++) bust(-20 + i * 225, 1760, 1.25, { col: '#050407', rim: '#E2A060', rimA: 0.35, f: i < 3 ? 1 : -1, nod: Math.sin(t + i) * 0.03 }); } },
    { z: 1.12, blur: 7, draw: () => { if (o.noCouncil) return; for (let i = 0; i < 4; i++) bust(80 + i * 320, 2020, 1.8, { col: '#020203', f: i < 2 ? 1 : -1 }); } },
  ], cam);
  dust(t, 45, [0, 400, W, 900], '255,210,160', o.seed || 41);
}
function nameChip(s, x, y, k, col) { if (k <= 0) return; alpha(k, () => { ctx.font = '700 38px Oswald'; const w = ctx.measureText(s).width + 40; P(rr(x - w / 2, y - 26, w, 52, 26), 'rgba(8,5,8,0.8)', col, 2); txt(s, x, y + 1, 38, col, 'Oswald', 700); }); }
function prizeTag(x, y, k, t) { if (k <= 0) return; withT(x, y, back(k), Math.sin(t * 2) * 0.08, () => { line(0, -60, 0, 0, M.gold, 3);
  const tg = new Path2D(); tg.moveTo(-90, 0); tg.lineTo(70, 0); tg.lineTo(110, 40); tg.lineTo(70, 80); tg.lineTo(-90, 80); tg.closePath(); glow(0, 40, 180, M.gold, 0.4); P(tg, '#E8C470', '#3A2406', 4); P(circ(80, 40, 9), '#3A2406', null);
  txt('PRIZE', -6, 42, 46, '#3A1A06', 'Oswald', 700); }); }

// ---------- meeting room boards ----------
function planBoard(x, y, s, label, col, o = {}) { withT(x, y, s, 0, () => {
  const lit = o.lit ?? 1; glow(0, 0, 240, col, 0.3 * lit);
  P(rr(-170, -110, 340, 220, 14), `rgba(12,10,16,${0.85})`, col, 4); alpha(0.4 + 0.6 * lit, () => { txt(label, 0, -52, 54, col, 'Oswald', 700);
    for (let i = 0; i < 3; i++) P(rr(-120, -2 + i * 30, 240 - i * 50, 12, 6), 'rgba(255,240,220,0.35)', null); });
  if (o.check > 0) withT(120, -80, back(o.check), 0, () => { P(circ(0, 0, 44), '#2E9E5A', '#0A2A14', 4); ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-5, 16); ctx.lineTo(22, -14); ctx.stroke(); ctx.restore(); });
  if (o.dim > 0) alpha(o.dim * 0.6, () => P(rr(-170, -110, 340, 220, 14), '#000', null));
}); }

// ---------- storm fork + balance of risks ----------
function stormCloud(x, y, s, col = '#2A3046', bolt = 0) { withT(x, y, s, 0, () => { P(ell(-40, 0, 60, 40), col, null); P(ell(30, -10, 70, 50), col, null); P(ell(0, 20, 90, 32), col, null);
  if (bolt > 0) { ctx.save(); ctx.globalAlpha = bolt; ctx.strokeStyle = '#EAF2FF'; ctx.lineWidth = 6; ctx.shadowColor = '#9FC4FF'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(-14, 80); ctx.lineTo(6, 80); ctx.lineTo(-10, 124); ctx.stroke(); ctx.restore(); } }); }
function forkSet(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1, 1.07, 14), danger = o.danger || 0;
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, 1000, '#070A16', '#1A1626')); cloudBank(200, '#141A2A', 0.9, t, 3); cloudBank(380, '#1C2236', 0.8, t * 1.2, 8);
      ctx.fillStyle = '#0A0A12'; ctx.beginPath(); ctx.moveTo(-200, 1000); for (let i = 0; i <= 12; i++) ctx.lineTo(-200 + i * 125, 960 - 40 * Math.sin(i * 0.9 + 1) - 20 * rnd(i + 2)); ctx.lineTo(W + 200, 1000); ctx.closePath(); ctx.fill(); } },
    { z: 0.3, draw: () => { P(rr(-300, 990, W + 600, 1000, 0), grad(990, H, '#14121A', '#040306'), null);
      // the fork: one road splitting into two, both into fog
      const road = (x2) => { const r = new Path2D(); r.moveTo(380, H + 100); r.bezierCurveTo(470, 1500, 520, 1250, 540, 1180); r.bezierCurveTo(560 + (x2 - 540) * 0.3, 1100, x2 - 30, 1030, x2 - 8, 995); r.lineTo(x2 + 8, 995); r.bezierCurveTo(x2 + 40, 1030, 600 + (x2 - 540) * 0.3, 1110, 600, 1190); r.bezierCurveTo(620, 1260, 640, 1500, 700, H + 100); r.closePath(); return r; };
      [300, 780].forEach((x2, i) => P(road(x2), grad(995, H, lerpC('#4A4050', '#7A2A26', danger * (i ? 0.7 : 1)), '#120E14'), null));
      alpha(0.7, () => { glow(300, 990, 220, '#8A9AC0', 0.35); glow(780, 990, 220, '#8A9AC0', 0.35); });
      if (danger > 0) { lightning(t, o.flashAt ?? 99, 300, 420, 560, 5); lightning(t, (o.flashAt ?? 99) + 0.35, 790, 420, 560, 9); }
    } },
    ...(o.mid || []),
    { z: 1.1, blur: 6, draw: () => { P(ell(60, H + 10, 240, 110), '#030303', null); P(ell(W - 40, H + 20, 260, 120), '#030303', null); } },
  ], cam);
  rainFx(t, 0.5, 17);
  dust(t, 30, [0, 500, W, 900], '190,205,235', 51);
}

// ---------- phone chat ----------
function chatPhone(x, y, s, t, st) { withT(x, y, s, 0, () => {
  glow(0, 0, 640, '#6A8AE0', 0.25);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 50; P(rr(-290, -470, 580, 940, 60), '#0A0A10', null); ctx.restore();
  P(rr(-268, -448, 536, 896, 46), grad(-448, 448, '#141826', '#0C0E16'), null); P(rr(-70, -440, 140, 30, 15), '#05050A', null);
  P(rr(-268, -400, 536, 96, 0), 'rgba(255,255,255,0.05)', null); P(circ(-200, -352, 30), '#3A4460', null); txt('Sam · team lead', -150, -352, 34, '#E8ECF6', 'Montserrat', 700, 'left');
  const bub = (s_, yy, k, me, o = {}) => { if (k <= 0) return; withT(me ? 230 : -230, yy, 1, 0, () => alpha(clamp(k * 1.6), () => { const sz = 36; ctx.font = `700 ${sz}px Montserrat`; const lines = o.lines || [s_]; const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 48, h = lines.length * sz * 1.3 + 34;
      withT(me ? -w : 0, 0, 1, 0, () => { withT(w / 2, h / 2, back(k), 0, () => { P(rr(-w / 2, -h / 2, w, h, 26), me ? (o.fill || '#2E6BE6') : '#2A2E3C', null);
        lines.forEach((l, i) => txt(l, -w / 2 + 24, -h / 2 + 17 + sz * 0.65 + i * sz * 1.3, sz, '#fff', 'Montserrat', 700, 'left'));
        if (o.strike > 0) { ctx.save(); ctx.strokeStyle = '#FF5A4A'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w / 2 + 18, 2); ctx.lineTo(-w / 2 + 18 + (w - 36) * o.strike, -2); ctx.stroke(); ctx.restore(); } }); }); })); };
  bub('', -240, st.q, false, { lines: ['Plan A or Plan B?', 'What do you think?'] });
  bub('either is fine', -60, st.e * (1 - st.gone), true, { strike: st.strike, fill: '#4A5470' });
  bub('', st.gone > 0 ? -60 : 120, st.r, true, { lines: ["I'd pick B.", 'It saves us a week.'] });
  if (st.typing > 0 && st.typing < 1) withT(150, 250, 1, 0, () => { P(rr(-70, -30, 140, 60, 30), '#2E3448', null); for (let i = -1; i <= 1; i++) P(circ(i * 34, 0, 9), `rgba(255,255,255,${0.4 + 0.5 * Math.abs(Math.sin(t * 6 + i))})`, null); });
  P(rr(-240, 370, 480, 60, 30), '#1E2230', null); txt('Message', -200, 400, 30, 'rgba(255,255,255,0.4)', 'Montserrat', 600, 'left');
}); }
function swordIcon(x, y, s, k, strike) { if (k <= 0) return; withT(x, y, s * back(k), -0.7, () => alpha(clamp(k * 1.5), () => {
  P(poly([-10, -200, 10, -200, 14, 60, 0, 90, -14, 60]), '#C8CCD8', '#202430', 3); P(rr(-60, 60, 120, 18, 8), '#8A6A30', null); P(rr(-10, 78, 20, 70, 6), '#3A2A1A', null); P(circ(0, 156, 14), '#8A6A30', null); }));
  if (strike > 0) { ctx.save(); ctx.strokeStyle = '#FF4A3A'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.shadowColor = '#FF4A3A'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(x - 160, y - 160); ctx.lineTo(x - 160 + 320 * strike, y - 160 + 320 * strike); ctx.stroke(); ctx.restore(); } }

// ================= SCENES =================
DRAW.sc1 = (t, d) => { // hook: the lone figure on the fence between two camps at dusk
  const u = lt('h1'), sw = seg(u, wt('h1', 6) - 0.2, wt('h1', 6) + 0.1);
  fenceSet(t, d, { cam: { zoom: lerp(1.0, 1.08, ease(t / d)), px: 0, py: 0, cy: 1000 }, mid: [{ z: 0.62, draw: () => sitterOnFence(t, { rimL: 1 }) }] });
  alpha(1 - sw, () => { bigText('STAYING OUT', W / 2, 280, 112, '#FFFFFF', seg(u, 0.0, 0.25)); bigText('FEELS SAFE', W / 2, 400, 116, M.gold2, kin('h1', 4, 0.12, 0.25)); });
  if (sw > 0) { alpha(sw, () => { txt('500 YEARS AGO…', W / 2, 250, 72, M.parch, 'CrimsonText', 700); });
    bigText('ONE MAN', W / 2, 355, 104, '#FFFFFF', kin('h1', 10, 0.1, 0.25)); bigText('DISAGREED', W / 2, 465, 112, FF.red, kin('h1', 12, 0.1, 0.25)); }
};
DRAW.sc2 = (t, d) => { // Ancient Greece: council colonnade; the two envoys arrive with their banners
  const u = lt('n2'), kl = easeOut(seg(u, wt('n2', 2) - 0.3, wt('n2', 2) + 0.5)), kr = easeOut(seg(u, wt('n2', 8) - 0.35, wt('n2', 8) + 0.45));
  hallSet(t, d, { cam: { zoom: lerp(1.0, 1.06, ease(t / d)), px: lerp(-14, 14, ease(t / d)), py: 0, cy: 1000 }, mid: [{ z: 0.6, draw: () => {
    alpha(kl, () => { banner(lerp(-160, 40, kl), 1170, 1.0, t, FF.red, 'sun'); envoy(lerp(-60, 330, kl), 1170, 1.25, t, { f: 1, cloak: '#4A0C0C', rim: FF.red }); });
    alpha(kr, () => { banner(lerp(1240, 1040, kr), 1170, 1.0, t, '#D8A040', 'wreath', 1, -1); envoy(lerp(1140, 750, kr), 1170, 1.25, t, { f: -1, cloak: '#3A2A0C', rim: M.gold2 }); });
  } }] });
  chipAt('Ancient Greece', 300, seg(u, 0, 0.25));
  nameChip('KING ANTIOCHUS', 330, 1225 - 650, kl * seg(u, wt('n2', 3), wt('n2', 3) + 0.3), '#FF8A70');
  nameChip('ROME', 750, 1225 - 650, kr * seg(u, wt('n2', 8), wt('n2', 8) + 0.3), M.gold2);
  nameChip('THE ACHAEANS', W / 2, 1560, seg(u, wt('n2', 14) - 0.1, wt('n2', 14) + 0.2), M.parch);
};
DRAW.sc3 = (t, d) => { // the two demands
  const u = lt('n3');
  hallSet(t + 5, d, { cam: { zoom: lerp(1.08, 1.14, ease(t / d)), px: 0, py: 0, cy: 1050 }, mid: [{ z: 0.6, draw: () => {
    banner(40, 1170, 1.0, t, FF.red, 'sun'); envoy(330, 1170, 1.25, t, { f: 1, cloak: '#4A0C0C', rim: FF.red, arm: u > wt('n3', 1) && u < wt('n3', 4) });
    banner(1040, 1170, 1.0, t, '#D8A040', 'wreath', 1, -1); envoy(750, 1170, 1.25, t, { f: -1, cloak: '#3A2A0C', rim: M.gold2, arm: u > wt('n3', 5) });
  } }] });
  sayBubble(330, 480, kin('n3', 2, 0.15, 0.35), 'STAY NEUTRAL', '#FF9A80', 54, true);
  sayBubble(750, 640, kin('n3', 6, 0.15, 0.35), 'TAKE UP ARMS', M.gold2, 54);
};
DRAW.sc4 = (t, d) => { // in essence: stay out → no favour, just the winner's prize (giant shadows over a small figure)
  const u = lt('n4'), loom = easeOut(seg(u, wt('n4', 2) - 0.2, wt('n4', 2) + 1.0));
  hallSet(t + 9, d, { noCouncil: true, cam: { zoom: lerp(1.04, 1.1, ease(t / d)), px: 0, py: 0, cy: 1000 }, mid: [
    { z: 0.5, draw: () => { alpha(0.9, () => { envoy(200, 1170, lerp(1.25, 2.1, loom), t, { f: 1, cloak: '#2A0606', rim: FF.red, rimA: 0.6 }); envoy(880, 1170, lerp(1.25, 2.1, loom), t, { f: -1, cloak: '#2A1E06', rim: M.gold2, rimA: 0.6 }); }); } },
    { z: 0.7, draw: () => { glow(540, 1000, 260, '#E8D8B0', 0.25); person(540, 1180, 0.85, { col: '#050407', rim: M.parch, rimA: 0.7 });
      prizeTag(560, 840, seg(u, wt('n4', 12) - 0.2, wt('n4', 12) + 0.25), t); } }] });
  ctx.fillStyle = `rgba(20,4,4,${0.25 * loom})`; ctx.fillRect(0, 0, W, H);
  chipAt('in essence · The Prince, Ch. 21', 250, seg(u, 0, 0.3));
  bigText('NO FAVOUR', W / 2, 400, 108, '#FFFFFF', kin('n4', 7, 0.1, 0.25));
};
DRAW.sc5 = (t, d) => { // quote card over the dark colonnade; the thinker writes below
  const u = lt('q1');
  hallSet(t + 13, d, { noCouncil: true, cam: { zoom: lerp(1.12, 1.18, ease(t / d)), px: 0, py: 0, cy: 900 }, mid: [{ z: 0.7, draw: () => { banner(40, 1170, 1.0, t, FF.red, 'sun'); banner(1040, 1170, 1.0, t, '#D8A040', 'wreath', 1, -1); } }] });
  ctx.fillStyle = 'rgba(4,3,6,0.4)'; ctx.fillRect(0, 0, W, H);
  withT(0, 0, 1, 0, () => { glow(700, 1600, 360, '#FF9A40', 0.3 * flick(t)); thinker(380, 1820, 0.9, t, M.gold2, 0.9); candleM(760, 1760, t, 1.0); });
  quoteCard2('q1', 4, 'he who is not your friend will demand your neutrality, whilst he who is your friend will entreat you to declare yourself…', ['— The Prince, Ch. 21 (tr. W. K. Marriott)'], ['neutrality', 'declare'], { cy: 760, size: 62 });
};
function meeting(t, d, u, o = {}) {
  office(t, d, { cam: o.cam, cold: o.cold || 0, dawn: 0.5, mid: [
    { z: 0.4, draw: () => { planBoard(290, 440, 0.9, 'PLAN A', '#FF8A70', { lit: o.aLit ?? 1, check: o.check || 0 }); planBoard(790, 440, 0.9, 'PLAN B', M.gold2, { lit: o.bLit ?? 1, dim: o.bDim || 0 }); } },
    { z: 0.62, draw: () => {
      person(190, 1300, 1.45, { f: o.fA ?? 1, col: '#06060A', rim: o.rimA || '#FF8A70', rimA: 0.8 });
      person(890, 1300, 1.45, { f: o.fB ?? -1, col: '#06060A', rim: o.rimB || M.gold2, rimA: 0.8, hair: true });
      glow(540, 1050, 220, o.cold ? '#6A8AC0' : '#FFD08A', 0.2); person(540, 1300, 1.45, { sit: true, f: 1, col: '#050508', rim: '#E8ECF6', rimA: 0.55 });
    } }] });
}
DRAW.sc6 = (t, d) => { // team meeting: two plans, both leads look at you → "Both are good."
  const u = lt('n5'), look = seg(u, wt('n5', 4) - 0.1, wt('n5', 4) + 0.2);
  meeting(t, d, u, { cam: { zoom: lerp(1.0, 1.08, ease(t / d)), px: 0, py: 0, cy: 1100 }, fA: look > 0.5 ? 1 : -1, fB: look > 0.5 ? -1 : 1, aLit: seg(u, wt('n5', 2) - 0.2, wt('n5', 2)), bLit: seg(u, wt('n5', 3) - 0.2, wt('n5', 3)) });
  sayBubble(540, 640, kin('n5', 11, 0.15, 0.35), '"Both are good."', '#FFFFFF', 50);
};
DRAW.sc7 = (t, d) => { // Plan A wins; both leads turn away; the room goes cold
  const u = lt('n6'), win = seg(u, wt('n6', 1), wt('n6', 2) + 0.2), offA = seg(u, wt('n6', 6) - 0.1, wt('n6', 6) + 0.1), offB = seg(u, wt('n6', 11) - 0.1, wt('n6', 11) + 0.1);
  meeting(t + 4, d, u, { cam: { zoom: lerp(1.08, 1.16, ease(t / d)), px: 0, py: 0, cy: 1100 }, check: win, bDim: win, fA: offA > 0.5 ? -1 : 1, fB: offB > 0.5 ? 1 : -1, cold: 0.8 * offB, rimA: offA > 0.5 ? '#6A7A9A' : '#FF8A70', rimB: offB > 0.5 ? '#6A7A9A' : M.gold2 });
};
DRAW.sc8 = (t, d) => { // quote card over the fence at night, rain
  fenceSet(t + 3, d, { night: 1, rain: 0.6, cam: { zoom: lerp(1.12, 1.2, ease(t / d)), px: 0, py: 0, cy: 1100 }, mid: [{ z: 0.62, draw: () => sitterOnFence(t, { rimA: 0.5 }) }] });
  ctx.fillStyle = 'rgba(4,3,8,0.35)'; ctx.fillRect(0, 0, W, H);
  quoteCard2('q2', 2, 'irresolute princes, to avoid present dangers, generally follow the neutral path, and are generally ruined.', ['— The Prince, Ch. 21 (tr. W. K. Marriott)'], ['neutral', 'ruined'], { cy: 720, size: 66 });
};
DRAW.sc9 = (t, d) => { // twist: no path is perfectly safe → weigh the two storms, take the lesser risk, eyes open
  const u = lt('n7'), tilt = -0.2 * ease(seg(u, wt('n7', 12) - 0.2, wt('n7', 15) + 0.2)), pick = seg(u, wt('n7', 14), wt('n7', 15));
  forkSet(t, d, { danger: seg(u, wt('n7', 5) - 0.2, wt('n7', 5) + 0.3), flashAt: wt('n7', 7), cam: { zoom: lerp(1.0, 1.08, ease(t / d)), px: 0, py: 0, cy: 1000 }, mid: [{ z: 0.7, draw: () => {
    scale(540, 640, 1.05, tilt, t, (x, y) => { stormCloud(x, y - 50, 0.9, '#2A3046', seg(u, wt('n7', 8), wt('n7', 8) + 0.2) * (0.5 + 0.5 * Math.sin(t * 20))); },
      (x, y) => { if (pick > 0) glow(x, y - 50, 160, M.gold2, 0.5 * pick); stormCloud(x, y - 40, 0.55, lerpC('#3A4058', '#8A7A5A', pick)); });
  } }] });
  chipAt('in essence · The Prince, Ch. 21', 250, seg(u, 0, 0.3));
  bigText('NO SAFE PATH', W / 2, 400, 104, '#FFFFFF', kin('n7', 5, 0.1, 0.25) * (1 - seg(u, wt('n7', 12) - 0.2, wt('n7', 12))));
  bigText('LESSER RISK', W / 2, 400, 110, M.gold2, kin('n7', 14, 0.1, 0.25) * (1 - seg(u, wt('n7', 16) - 0.2, wt('n7', 16))));
  bigText('EYES OPEN', W / 2, 400, 116, '#FFFFFF', kin('n7', 16, 0.1, 0.25));
};
DRAW.sc10 = (t, d) => { // taking a side isn't taking a swing: step down onto one side, lantern up — where you stand, and why
  const u = lt('n8'), down = easeOut(seg(u, wt('n8', 7) - 0.3, wt('n8', 9)));
  const p = fpost(SITP);
  fenceSet(t + 6, d, { dawn: 0.7, redA: 0.5, cam: { zoom: lerp(1.06, 1.12, ease(t / d)), px: lerp(0, 40, down), py: 0, cy: 1100 }, mid: [{ z: 0.62, draw: () => {
    if (down < 0.02) sitterOnFence(t, {});
    else { const x = lerp(p.x, p.x + 260, down), y = lerp(p.y - p.h * 0.86, p.y + 80, down); person(x, y, lerp(1.0, 1.1, down), { col: '#050407', rim: M.gold2, rimA: 0.85 });
      if (down > 0.6) alpha(seg(down, 0.6, 1), () => { lantern(x + 110, y - 190, 0.9, t, 1); }); }
  } }] });
  const ks = kin('n8', 3, 0.15, 0.3) * (1 - seg(u, wt('n8', 7) - 0.2, wt('n8', 7)));
  swordIcon(W / 2, 400, 0.85, ks, seg(u, wt('n8', 5), wt('n8', 6) + 0.2) * ks);
  bigText('WHERE YOU STAND', W / 2, 360, 92, '#FFFFFF', kin('n8', 9, 0.1, 0.25));
  bigText('AND WHY', W / 2, 480, 110, M.gold2, kin('n8', 12, 0.1, 0.25));
};
DRAW.sc11 = (t, d) => { // tonight: the "either is fine" reply, struck out → a real answer, kindly, with a reason
  const u = lt('n9');
  fullFill(grad(0, H, '#0A0A14', '#030306')); glow(880, 300, 520, '#FFB45A', 0.25 * flick(t)); glow(200, 1500, 600, '#2A3A7A', 0.3);
  withT(0, 0, 1, 0, () => { alpha(0.35, () => { for (let i = 0; i < 6; i++) P(rr(60 + i * 170, 1560 + (i % 2) * 20, 130, 18, 8), '#1A1420', null); }); });
  const up = easeOut(seg(u, 0, 0.5));
  chatPhone(W / 2, lerp(1200, 720, up), 1.0 + 0.04 * ease(t / d), t, {
    q: seg(u, wt('n9', 1) - 0.2, wt('n9', 1) + 0.2), e: seg(u, wt('n9', 7) - 0.15, wt('n9', 7) + 0.15), strike: seg(u, wt('n9', 10) - 0.1, wt('n9', 10) + 0.35),
    gone: seg(u, wt('n9', 13), wt('n9', 13) + 0.3), typing: seg(u, wt('n9', 13) + 0.05, wt('n9', 14)), r: seg(u, wt('n9', 14) - 0.1, wt('n9', 14) + 0.25) });
  bigText('TONIGHT', W / 2, 190, 92, M.gold2, seg(u, 0, 0.2) * (1 - seg(u, wt('n9', 6), wt('n9', 7))));
};
DRAW.sc12 = (t, d) => { // comment question: the empty fence at first light
  const u = lt('n10');
  fenceSet(t + 9, d, { dawn: 1, cam: { zoom: lerp(1.12, 1.18, ease(t / d)), px: 0, py: 0, cy: 1100 } });
  bigText('WHEN DID NEUTRAL', W / 2, 340, 88, '#FFFFFF', seg(u, 0, 0.2));
  bigText('COST YOU?', W / 2, 470, 116, M.gold2, kin('n10', 4, 0.1, 0.2));
  const kc = back(seg(u, wt('n10', 6) - 0.05, wt('n10', 6) + 0.35)); if (kc > 0) withT(820, 640, kc, 0, () => { const b = new Path2D(); b.roundRect(-110, -70, 220, 130, 30); b.moveTo(-30, 60); b.lineTo(-60, 105); b.lineTo(10, 60); P(b, '#F6F2E8', '#111', 4); for (let i = -1; i <= 1; i++) P(circ(i * 48, -5, 13), '#222', null); });
};
DRAW.sc13 = (t, d) => { // end card
  fenceSet(t + 12, d, { dawn: 1, cam: { zoom: 1.2, px: 0, py: 0, cy: 1100 } });
  ctx.fillStyle = 'rgba(3,3,8,0.64)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0, 0.4)); const L = document.getElementById('logo');
  withT(W / 2, 640, lerp(0.8, 1, k), 0, () => alpha(k, () => { glow(0, 0, 320, M.gold, 0.4); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -135, -135, 270, 270); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.strokeStyle = M.gold2; ctx.lineWidth = 7; ctx.stroke(); }));
  bigText('Follow Awazzzz', W / 2, 900, 104, '#FFFFFF', seg(t, 0.1, 0.4));
  bigText('MINDSET', W / 2, 1030, 66, M.gold2, seg(t, 0.3, 0.6), 'Oswald', 700);
  alpha(seg(t, 0.5, 0.8), () => txt("we don't sit on the fence", W / 2, 1120, 50, M.parch, 'CrimsonText', 600));
  const pulse = 1 + 0.04 * Math.sin(t * 6); withT(W / 2, 1230, back(seg(t, 0.6, 0.9)) * pulse, 0, () => { P(rr(-200, -50, 400, 100, 50), '#E62117', '#111', 4); txt('SUBSCRIBE', 0, 4, 52, '#fff', 'Oswald', 700); });
};
function drawFrame(T) {
  GT = T; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, W, H);
  const i = SCENES.findIndex(s => T >= s.start && T < s.start + s.dur); const s = SCENES[i < 0 ? SCENES.length - 1 : i];
  ctx.save(); DRAW[s.id](T - s.start, s.dur); ctx.restore(); ctx.filter = 'none';
  const u = T - s.start; if (u < 0.18 && s.start > 0) { ctx.fillStyle = `rgba(0,0,0,${1 - u / 0.18})`; ctx.fillRect(0, 0, W, H); }
  const nxt = SCENES[SCENES.indexOf(s) + 1]; if (nxt && s.start + s.dur - T < 0.1) { ctx.fillStyle = `rgba(0,0,0,${1 - (s.start + s.dur - T) / 0.1})`; ctx.fillRect(0, 0, W, H); }
  vign(0.6); grain(T);
  if (s.id !== 'sc13') { watermark(T); captions(); }
}
function drawCover() {
  GT = LINES.h1.start + 1.0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  fenceSet(2.0, 4, { cam: { zoom: 1.12, px: 0, py: 0, cy: 1100 }, mid: [{ z: 0.62, draw: () => sitterOnFence(2.0, { rimL: 1 }) }] }); ctx.filter = 'none';
  vign(0.5); glow(W / 2, 1380, 700, '#000', 0.55);
  withT(W / 2, 1130, 1, 0, () => { ctx.font = '700 54px Oswald'; const s = 'MACHIAVELLI'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -44, w, 88, 44), 'rgba(110,14,14,0.92)', M.gold2, 4); txt(s, 0, 3, 54, '#FFF3D6', 'Oswald', 700); });
  bigText("DON'T SIT", W / 2, 1290, 150, '#FFFFFF', 1);
  bigText('ON THE FENCE', W / 2, 1440, 128, M.gold2, 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
  bigText('The Prince · Ch. 21', W / 2, 1570, 64, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
