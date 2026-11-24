// ===== "The Eye and the Hand" — scene set for The Prince, Ch. 18 ("men judge generally more by the eye than by the hand")
// New: night open-plan office (two desks, swinging spotlight, moonlit window), sound rings, bug→check icons, stair of
// light to a PROMOTED door, night study with ink eye sketch, giant scanning eye + reaching hand over a crowd, mask on a
// velvet stand, crowned prince with a mask on a stick + hollowing virtue words, falling cracked mask + card flip,
// promise bubbles vs deed blocks, spotlight swing, night laptop note with ticking list, comment lamp.

function S(id) { return SCENES.find(s => s.id === id); }
function wt(id, k) { return LINES[id].words[Math.min(k, LINES[id].words.length - 1)][0]; }
function kin(id, k, pre = 0.1, d = 0.35) { const u = lt(id); return easeOut(seg(u, wt(id, k) - pre, wt(id, k) - pre + d)); }
function chipAt(s, y, k, col = M.gold) { if (k > 0) alpha(k, () => chipTop(s, y, col)); }
const NV = { sky1: '#03060F', sky2: '#0E1C36', cool: '#9CC4FF', warm: '#FFD08A', warmRGB: '255,208,138', coolRGB: '156,196,255' };

// ---- head-and-shoulders silhouette; origin bottom centre
function bust(x, y, s, o = {}) {
  const col = o.col || '#06050A', f = o.f || 1;
  withT(x, y, s, 0, () => { ctx.scale(f, 1);
    const b = new Path2D(); b.moveTo(-125, 0); b.bezierCurveTo(-125, -92, -84, -132, -32, -142); b.lineTo(32, -142); b.bezierCurveTo(84, -132, 125, -92, 125, 0); b.closePath();
    P(b, col, null);
    withT(0, -138, 1, o.nod || 0, () => { P(rr(-19, -46, 38, 50, 8), col, null); P(ell(6, -92, 46, 56), col, null);
      if (o.rim) { ctx.save(); ctx.globalAlpha = o.rimA ?? 0.8; ctx.strokeStyle = o.rim; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(9, -92, 46, 56, 0, -1.25, 1.3); ctx.stroke(); ctx.restore(); } });
    if (o.rim) { ctx.save(); ctx.globalAlpha = o.rimA ?? 0.8; ctx.strokeStyle = o.rim; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(34, -141); ctx.bezierCurveTo(86, -131, 127, -92, 127, 0); ctx.stroke(); ctx.restore(); }
  });
}
function sayBubble(x, y, k, s, col = M.gold2, size = 44, red = false) { if (k <= 0) return; withT(x, y, back(k), 0, () => alpha(clamp(k * 1.5), () => {
  ctx.font = `900 ${size}px Montserrat`; const w = ctx.measureText(s).width + 46; const h = size * 1.7; const b = new Path2D(); b.roundRect(-w / 2, -h / 2, w, h, h / 2.4); b.moveTo(-12, h / 2 - 2); b.lineTo(-28, h / 2 + 26); b.lineTo(12, h / 2 - 2);
  P(b, red ? 'rgba(60,8,8,0.9)' : 'rgba(14,10,8,0.86)', col, 3); txt(s, 0, 2, size, col, 'Montserrat', 900); })); }
function crack(x, y, k, seed = 1, col = '#FF4A3A') { if (k <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 24;
  for (let b = 0; b < 6; b++) { const a0 = -0.2 + b * 0.68 + rnd(b + seed) * 0.3; let px = x, py = y; ctx.beginPath(); ctx.moveTo(px, py); const n = 7;
    for (let i = 1; i <= n * k; i++) { const a = a0 + (rnd(b * 9 + i + seed) - 0.5) * 0.9; px += Math.cos(a) * 60; py += Math.sin(a) * 22; ctx.lineTo(px, py); } ctx.stroke(); } ctx.restore(); }
function quoteCard2(id, from, text, cites, gold, o = {}) {
  const u = lt(id); const k0 = o.in ?? (wordT(id, from) - 0.45); const k = easeOut(seg(u, k0, k0 + 0.5)); if (k <= 0) return;
  const words = text.split(' '); const size = o.size || 66; const font = `600 ${size}px CrimsonText`;
  const lines = wrapWords(words, font, 800); const lh = size * 1.22; const ch = cites.length * 48; const hh = lines.length * lh + 170 + ch; const cy = o.cy || 700;
  withT(W / 2, cy + (1 - k) * 60, 1, (1 - k) * 0.02, () => alpha(k, () => {
    glow(0, 0, 640, '#000', 0.6); const pw = 920, ph = hh; const g = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2); g.addColorStop(0, '#F0E2C2'); g.addColorStop(1, '#D9C292');
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
    const pp = new Path2D(); pp.moveTo(-pw / 2, -ph / 2 + 10); for (let i = 0; i <= 20; i++) pp.lineTo(-pw / 2 + pw * i / 20, -ph / 2 + Math.sin(i * 2.1) * 5); pp.lineTo(pw / 2, ph / 2); for (let i = 20; i >= 0; i--) pp.lineTo(-pw / 2 + pw * i / 20, ph / 2 + Math.sin(i * 1.7) * 5); pp.closePath();
    P(pp, g, null); ctx.restore();
    alpha(0.5, () => { const r = ctx.createRadialGradient(0, 0, 200, 0, 0, 640); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(90,50,10,0.55)'); ctx.fillStyle = r; ctx.fill(pp); });
    txt('“', -pw / 2 + 70, -ph / 2 + 70, 150, M.red, 'CrimsonText', 700);
    let wi = 0; const y0 = -ph / 2 + 110 + lh / 2;
    lines.forEach((ln, li) => { ctx.font = font; const lw = ctx.measureText(ln.join(' ')).width; let x = -lw / 2;
      ln.forEach(w => { const gi = from + wi; const said = u >= wordT(id, Math.min(gi, LINES[id].words.length - 1)) - 0.03; const isG = gold.some(g => w.toLowerCase().replace(/[^a-z]/g, '') === g);
        const fw = `${isG && said ? 700 : 600} ${size}px CrimsonText`; ctx.font = fw; const ww = ctx.measureText(w + ' ').width;
        txt(w, x, y0 + li * lh, size, said ? (isG ? '#8E1B1B' : '#24170C') : 'rgba(60,40,20,0.28)', 'CrimsonText', isG && said ? 700 : 600, 'left');
        if (isG && said) { ctx.font = fw; ctx.fillStyle = 'rgba(180,120,30,0.5)'; ctx.fillRect(x, y0 + li * lh + size * 0.42, ctx.measureText(w).width, 4); }
        x += ww; wi++; }); });
    cites.forEach((c, i) => txt(c, 0, ph / 2 - 50 - (cites.length - 1 - i) * 48, 38, '#5A3A1A', 'CrimsonText', 600));
  }));
}

// ================= props
function moon(x, y, r) { glow(x, y, r * 5, '#9CC0FF', 0.22); P(circ(x, y, r), '#E6EEFF', null); alpha(0.22, () => { P(circ(x + r * 0.3, y - r * 0.25, r * 0.28), '#A8BCE0', null); P(circ(x - r * 0.35, y + r * 0.3, r * 0.18), '#A8BCE0', null); }); }
function cityNight(y, col, seed, lit = 0.5, dx = 72) { for (let i = 0; i < 20; i++) { const x = -120 + i * dx, h = 160 + rnd(i + seed) * 460; ctx.fillStyle = col; ctx.fillRect(x, y - h, dx - 8, h);
  for (let k = 0; k < 16; k++) if (rnd(i * 16 + k + seed) > 1 - lit * 0.5) { ctx.fillStyle = 'rgba(255,206,140,0.5)'; ctx.fillRect(x + 8 + (k % 3) * 18, y - h + 18 + Math.floor(k / 3) * 34, 8, 13); } } }
function monitor(x, y, s, on = 1, col = '#6AA8FF', seed = 1) { withT(x, y, s, 0, () => { if (on > 0) glow(0, -100, 190, col, 0.28 * on);
  P(rr(-115, -175, 230, 145, 8), '#0B0D13', null); P(rr(-104, -166, 208, 127, 4), on > 0 ? grad(-166, -39, '#1C3256', '#0C182C') : '#080A10', null);
  if (on > 0) alpha(0.65 * on, () => { for (let i = 0; i < 5; i++) P(rr(-86, -150 + i * 21, 90 + rnd(i + seed) * 80, 8, 4), 'rgba(150,200,255,0.7)', null); });
  P(rr(-12, -32, 24, 32, 2), '#0B0D13', null); P(rr(-56, -6, 112, 9, 4), '#0B0D13', null); }); }
function deskLamp(x, y, s, on, t) { withT(x, y, s, 0, () => {
  if (on > 0) { beam(70, -205, 70, 170, 40, 420, NV.warmRGB, 0.3 * on * flick(t, 0.2)); glow(110, 0, 240, '#FFB860', 0.3 * on); }
  P(ell(0, 0, 50, 12), '#14100C', null); line(0, -6, -40, -130, '#1C1610', 12); line(-40, -130, 40, -200, '#1C1610', 12);
  withT(48, -205, 1, 0.55, () => { P(poly([-40, -20, 40, -20, 60, 30, -60, 30]), '#2A2018', null); if (on > 0) P(ell(0, 30, 58, 10), `rgba(255,230,170,${0.9 * on})`, null); }); }); }
function desk(x, y, w, lit = 0) { const g = grad(y, y + 30, '#2A2230', '#120E16'); P(rr(x - w / 2, y, w, 28, 4), g, null); line(x - w / 2, y + 1, x + w / 2, y + 1, `rgba(255,210,150,${0.25 + 0.3 * lit})`, 3);
  P(rr(x - w / 2 + 24, y + 28, w - 48, 170, 0), '#0A080E', null); P(rr(x - w / 2 + 10, y + 28, 22, 330, 0), '#08060A', null); P(rr(x + w / 2 - 32, y + 28, 22, 330, 0), '#08060A', null); }
function rings(x, y, k, t, col = M.gold2, dir = 1) { if (k <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const ph = ((t * 1.6 + i / 4) % 1); const r = 50 + ph * 230; ctx.globalAlpha = k * (1 - ph) * 0.9; ctx.beginPath(); ctx.arc(x, y, r, dir > 0 ? -0.7 : Math.PI - 0.7, dir > 0 ? 0.7 : Math.PI + 0.7); ctx.stroke(); } ctx.restore(); }
function bugIcon(x, y, s, fix, t) { withT(x, y + Math.sin(t * 3 + x) * 6, s, 0, () => { // red bug → green check
  if (fix < 1) alpha(1 - fix, () => { glow(0, 0, 70, '#FF4A3A', 0.35); P(ell(0, 4, 22, 28), '#C0392B', '#3A0606', 3); P(circ(0, -26, 13), '#C0392B', '#3A0606', 3);
    for (let k = -1; k <= 1; k++) { line(-20, k * 12 + 4, -38, k * 16, '#3A0606', 4); line(20, k * 12 + 4, 38, k * 16, '#3A0606', 4); } });
  if (fix > 0) withT(0, 0, back(fix), 0, () => { glow(0, 0, 80, '#4ADE80', 0.35); P(circ(0, 0, 34), '#1E7A44', '#0A2A16', 3); ctx.save(); ctx.strokeStyle = '#EFFFF4'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(-4, 12); ctx.lineTo(16, -12); ctx.stroke(); ctx.restore(); });
}); }
function workCard(x, y, s, k, lit = 1, rot = 0) { if (k <= 0) return; withT(x, y, s, rot, () => alpha(clamp(k), () => { if (lit > 0.3) glow(0, 0, 120, M.gold, 0.35 * lit);
  P(rr(-80, -56, 160, 112, 10), lit > 0.3 ? '#F0E6D0' : '#3A3440', '#2A2014', 3); for (let i = 0; i < 3; i++) P(rr(-58, -32 + i * 22, 80 - i * 14, 8, 4), 'rgba(40,30,20,0.4)', null);
  P(circ(46, 28, 18), lit > 0.3 ? '#1E7A44' : '#2A2A30', null); ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(38, 28); ctx.lineTo(44, 35); ctx.lineTo(55, 21); ctx.stroke(); ctx.restore(); })); }
function nameTag(s, x, y, k, col = M.gold2) { if (k <= 0) return; withT(x, y, back(k), 0, () => alpha(clamp(k * 1.4), () => { ctx.font = '700 40px Oswald'; const w = ctx.measureText(s).width + 40; P(rr(-w / 2, -28, w, 56, 10), 'rgba(8,6,10,0.82)', col, 3); txt(s, 0, 2, 40, col, 'Oswald', 700); })); }

// ---- night open-plan office: Dan standing at the left desk, Aisha seated at the right desk
// o.spot 0 (on Dan) .. 1 (on Aisha); o.spotA strength; o.dan {arm 0..1, talk 0..1, hide}; o.aisha {lamp 0..1}
function nightOffice(t, d, o = {}) {
  const cam = o.cam || camAt(t, d, 1.0, 1.08, 22); const sp = o.spot ?? 0, sA = o.spotA ?? 1;
  const sx = lerp(300, 790, ease(sp));
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, 1200, NV.sky1, NV.sky2)); moon(900, 700, 44); cityNight(1130, '#0A1122', 5, 0.55); alpha(0.6, () => cityNight(1150, '#060A16', 9, 0.3, 96)); } },
    { z: 0.12, haze: 0.04, draw: () => { // window mullions + ceiling strip lights
      ctx.fillStyle = '#05050A'; for (let i = 0; i < 5; i++) ctx.fillRect(-30 + i * 290, 120, 22, 1060); ctx.fillRect(-120, 120, W + 240, 36); ctx.fillRect(-120, 1150, W + 240, 40);
      for (let i = 0; i < 4; i++) { P(rr(60 + i * 260, 60, 170, 14, 7), 'rgba(200,220,255,0.18)', null); }
      alpha(0.45, () => { for (let i = 0; i < 4; i++) { monitor(80 + i * 300, 1150, 0.45, 0.5, '#5A8AD0', i + 3); } });
    } },
    { z: 0.5, draw: () => {
      P(rr(-200, 1180, W + 400, 900, 0), grad(1180, H, '#0E0C16', '#030305'), null); line(-200, 1181, W + 200, 1181, 'rgba(160,190,255,0.25)', 3);
      alpha(0.5, () => { for (let i = 0; i < 9; i++) line(W / 2 + (i - 4) * 60, 1190, W / 2 + (i - 4) * 420, H + 100, 'rgba(120,140,200,0.10)', 3); });
      ctx.save(); ctx.translate(W / 2, 1300); ctx.scale(1.32, 1.32); ctx.translate(-W / 2, -1200);
      // spotlight from the ceiling
      if (sA > 0) { beam(sx, -60, 110, sx, 1330, 560, NV.warmRGB, 0.22 * sA); alpha(0.5 * sA, () => glow(sx, 1300, 280, '#FFC27A', 0.25)); }
      // Dan
      const dn = o.dan || {}; if (!dn.hide) { const dx = 300, dy = 1330, ds = 1.05; const lit = 1 - ease(sp);
        person(dx, dy, ds, { f: 1, rim: NV.warm, rimA: 0.35 + 0.6 * lit });
        const shx = dx + 66 * ds, shy = dy - 340 * ds, a = dn.arm || 0, wv = Math.sin(t * 6) * 0.12 * a;
        const ex = shx + Math.cos(-0.4 - 1.1 * a + wv) * 210, ey = shy - Math.sin(0.4 + 1.1 * a + wv) * 210 + 230 * (1 - a);
        if (a > 0.25) { ctx.save(); ctx.strokeStyle = '#06060A'; ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(shx - 10, shy + 10); ctx.lineTo(ex, ey); ctx.stroke(); ctx.restore(); P(circ(ex, ey, 20), '#06060A', null); }
        rings(dx + 70, dy - 430 * ds - 10, (dn.talk || 0) * lit + (dn.talk || 0) * 0.3, t, M.gold2); }
      desk(300, 1180, 380, 1 - ease(sp)); monitor(330, 1180, 0.9, 0.7, '#6AA8FF', 2);
      // Aisha
      const ai = o.aisha || {}; const ax = 850, ay = 1290;
      person(ax, ay, 1.2, { sit: true, f: -1, hair: true, rim: ai.lamp > 0.3 ? NV.warm : NV.cool, rimA: 0.35 + 0.55 * ease(sp) + 0.2 * (ai.lamp || 0) });
      ctx.save(); ctx.strokeStyle = '#06060A'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ax - 55, ay - 260); ctx.lineTo(ax - 135, ay - 205 + Math.sin(t * 9) * 4); ctx.stroke(); ctx.restore();
      desk(790, 1200, 400, ease(sp)); monitor(670, 1200, 0.8, 0.9, '#7AE0B0', 7); deskLamp(990, 1200, 0.7, ai.lamp ?? 0.6, t);
      ctx.restore();
      o.desks && o.desks();
    } },
    ...(o.mid || []),
    { z: 1.1, blur: 7, draw: () => { // foreground plant + chair back
      for (let k = 0; k < 7; k++) withT(40, 1980, 1, 0, () => P(ell(Math.cos(k * 0.9) * 50, -150 - k * 40, 30, 120, k * 0.5 - 1.6), '#03060A', null));
      P(rr(860, 1700, 300, 400, 60), '#030305', null); } },
  ], cam);
  dust(t, 45, [0, 200, W, 1100], o.dustCol || '200,215,255', o.seed || 7);
}

// ---- giant almond eye (gold iris), looks along x (−1..1)
function bigEye(x, y, s, t, look = 0, open = 1, col = M.gold) { withT(x, y, s, 0, () => { glow(0, 0, 420, col, 0.22);
  const o = Math.max(0.05, open); const p = new Path2D(); p.moveTo(-320, 0); p.quadraticCurveTo(0, -230 * o, 320, 0); p.quadraticCurveTo(0, 230 * o, -320, 0); p.closePath();
  P(p, grad(-170, 170, '#E6DAC0', '#B8A684'), null); ctx.save(); ctx.clip(p);
  const ix = look * 120 + Math.sin(t * 0.9) * 10; const g = ctx.createRadialGradient(ix, 0, 10, ix, 0, 120); g.addColorStop(0, '#FFE6A0'); g.addColorStop(0.55, '#D79B2E'); g.addColorStop(1, '#4A2A08');
  P(circ(ix, 0, 120), g, null); P(circ(ix, 0, 52), '#050305', null); P(circ(ix + 30, -34, 18), 'rgba(255,255,255,0.85)', null);
  alpha(0.35, () => P(rr(-340, -240, 680, 120 * o, 0), '#2A1A08', null)); ctx.restore();
  P(p, null, '#1A0E04', 10); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.globalAlpha = 0.8; ctx.stroke(p); ctx.restore();
  ctx.save(); ctx.strokeStyle = '#120A04'; ctx.lineWidth = 8; ctx.lineCap = 'round'; for (let i = -4; i <= 4; i++) { const a = i * 0.17; const bx = Math.sin(a) * 300, by = -Math.cos(a) * 150 * o - 6; ctx.beginPath(); ctx.moveTo(bx * 0.9, by); ctx.lineTo(bx * 1.08, by - 46); ctx.stroke(); } ctx.restore(); }); }
// ---- open hand silhouette reaching up (origin = wrist), rim light
function handSil(x, y, s, rot = 0, rim = M.gold2, rimA = 0.8, col = '#050407') { withT(x, y, s, rot, () => {
  const parts = [rr(-70, -150, 140, 150, 40), rr(-70, -270, 30, 140, 15), rr(-34, -300, 30, 170, 15), rr(2, -290, 30, 160, 15), rr(38, -250, 28, 120, 14), rr(-30, 0, 70, 260, 20)];
  const th = new Path2D(); th.moveTo(60, -100); th.quadraticCurveTo(120, -150, 140, -200); th.lineTo(160, -185); th.quadraticCurveTo(140, -110, 70, -40); th.closePath(); parts.push(th);
  if (rimA > 0) { ctx.save(); ctx.globalAlpha *= rimA; ctx.translate(-5, -4); parts.forEach(p => P(p, rim, null)); ctx.restore(); }
  parts.forEach(p => P(p, col, null)); }); }
// ---- crowned prince standing (silhouette), mask on a stick in his raised hand: m 0 (lowered) .. 1 (over the face)
function prince(x, y, s, t, m = 0, rim = M.gold2, o = {}) { withT(x, y, s, 0, () => {
  const cl = new Path2D(); cl.moveTo(-40, -380); cl.bezierCurveTo(-150, -340, -210, -100, -240, 0); cl.lineTo(240, 0); cl.bezierCurveTo(210, -100, 150, -340, 40, -380); cl.closePath();
  ctx.save(); ctx.globalAlpha *= 0.85; ctx.translate(5, -3); P(cl, rim, null); ctx.restore(); P(cl, '#050407', null);
  P(rr(-20, -420, 40, 50, 8), '#050407', null); P(ell(0, -470, 48, 58), '#050407', null);
  alpha(0.9, () => { ctx.strokeStyle = rim; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(4, -470, 48, 58, 0, -1.3, 1.3); ctx.stroke(); });
  crown(0, -545, 0.42, t);
  const hx = lerp(130, 70, m), hy = lerp(-250, -470, m); // hand
  line(70, -340, hx, hy + 30, '#050407', 34); P(circ(hx, hy + 30, 22), '#050407', null);
  if (!o.noMask) line(hx, hy + 30, hx - lerp(10, 70, m), hy + lerp(-60, 0, m), '#6A4A20', 7);
  if (o.noMask) return; mask(lerp(hx - 10, 0, m), lerp(hy - 110, -470, m), lerp(0.55, 0.62, m), t);
}); }
// ---- velvet stand with a smiling mask; a shadow face looks out behind it
function maskStand(x, y, s, t, peek = 0) { withT(x, y, s, 0, () => { glow(0, -260, 380, '#E2B04A', 0.18);
  P(rr(-12, -240, 24, 240, 6), '#2A1A10', null); P(ell(0, 0, 120, 22), '#140C08', null);
  if (peek > 0) alpha(peek, () => { withT(80 * peek, -300, 1, 0.12 * peek, () => { P(ell(0, 0, 92, 118), '#050407', null); ctx.save(); ctx.strokeStyle = M.red2; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(6, 0, 92, 118, 0, -1.2, 1.2); ctx.stroke(); ctx.restore();
    P(ell(42, -16, 14, 6), 'rgba(255,120,90,0.9)', null); }); });
  mask(0, -300, 1.15, t); }); }
function throneHall(t, d, o = {}) { const cam = o.cam || camAt(t, d, 1.0, 1.1, 16);
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#22070A', '#050203')); glow(W / 2, 760, 560, '#E2B04A', 0.2);
      for (let i = 0; i < 7; i++) { const x = -40 + i * 190; P(rr(x, 120, 150, 1200, 0), grad(120, 1320, '#5A0E10', '#1E0406'), null); alpha(0.4, () => line(x + 148, 120, x + 148, 1320, '#000', 6)); }
      alpha(0.22, () => { for (let r = 0; r < 9; r++) for (let c = 0; c < 6; c++) { const x = 60 + c * 190 + (r % 2) * 95, y = 200 + r * 130; P(poly([x, y - 26, x + 18, y, x, y + 26, x - 18, y]), M.gold, null); } }); } },
    { z: 0.3, haze: 0.05, draw: () => { P(rr(-200, 1320, W + 400, 700, 0), grad(1320, H, '#1A0A08', '#040202'), null); line(-200, 1321, W + 200, 1321, 'rgba(255,200,120,0.35)', 3);
      P(poly([380, 1330, 700, 1330, 820, H, 260, H]), grad(1330, H, 'rgba(142,27,27,0.8)', 'rgba(60,8,8,0.9)'), null); } },
    ...(o.mid || []),
    { z: 1.1, blur: 6, draw: () => { P(rr(-60, 300, 130, 1800, 20), '#030102', null); P(rr(W - 70, 260, 140, 1800, 20), '#030102', null); } },
  ], cam);
  dust(t, 55, [0, 300, W, 1100], '255,215,160', 11);
}
function hollowWord(s, x, y, size, k, hollow) { if (k <= 0) return; withT(x, y, lerp(0.85, 1, easeOut(k)), 0, () => alpha(clamp(k), () => { ctx.font = `700 ${size}px CrimsonText`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (hollow < 1) { ctx.globalAlpha *= (1 - hollow) * 0.95; ctx.fillStyle = M.gold2; ctx.shadowColor = M.gold; ctx.shadowBlur = 20; ctx.fillText(s, 0, 0); ctx.shadowBlur = 0; ctx.globalAlpha /= Math.max(0.05, (1 - hollow) * 0.95); }
  if (hollow > 0) { ctx.globalAlpha *= hollow; ctx.strokeStyle = 'rgba(246,210,122,0.8)'; ctx.lineWidth = 2.5; ctx.setLineDash([10, 8]); ctx.strokeText(s, 0, 0); ctx.setLineDash([]); } })); }
function promise(s, x, y, k, pop) { if (k <= 0 || pop >= 1) return; withT(x, y, back(k) * (1 + pop * 0.4), 0, () => alpha(clamp(k * 1.5) * (1 - pop), () => {
  ctx.font = '700 38px Montserrat'; const w = ctx.measureText(s).width + 40; const b = new Path2D(); b.roundRect(-w / 2, -34, w, 68, 30); b.moveTo(-8, 32); b.lineTo(-24, 56); b.lineTo(14, 32);
  ctx.save(); ctx.setLineDash([8, 6]); P(b, 'rgba(30,40,70,0.55)', '#9CC4FF', 3); ctx.restore(); txt(s, 0, 2, 38, '#DCE8FF', 'Montserrat', 700); })); }
function block(x, y, k, i) { if (k <= 0) return; const yy = lerp(y - 420, y, easeOut(k)); withT(x, yy, 1, (1 - easeOut(k)) * 0.3 * (i % 2 ? 1 : -1), () => { glow(0, 0, 90, M.gold, 0.25 * k);
  const g = ctx.createLinearGradient(-110, -40, 110, 40); g.addColorStop(0, '#FFE39A'); g.addColorStop(0.5, '#D79B2E'); g.addColorStop(1, '#7A4A10'); P(rr(-110, -40, 220, 80, 8), g, '#3A2208', 4);
  txt(['DONE', 'SHIPPED', 'FIXED', 'KEPT'][i % 4], 0, 3, 36, '#3A2208', 'Oswald', 700); }); }

// ================= SCENES =================
DRAW.sc1 = (t, d) => { // HOOK: night office — Dan in the spotlight talking big, Aisha in the dark; a gold star flies to Dan
  const u = lt('h1'); const star = easeOut(seg(u, wt('h1', 8) - 0.1, wt('h1', 10) + 0.3));
  nightOffice(t, d, { spot: 0, dan: { arm: 0.6 + 0.4 * Math.sin(t * 2), talk: 1 }, aisha: { lamp: 0.5 }, cam: { zoom: lerp(1.16, 1.04, easeOut(t / d)), px: 0, py: 0, cy: 1150 } });
  if (star > 0) { const x = lerp(860, 300, star), y = lerp(700, 700, star) - Math.sin(star * Math.PI) * 220; withT(x, y, 0.6 + 0.6 * back(star), t * 2, () => { glow(0, 0, 160, M.gold, 0.55);
    const p = new Path2D(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 30 : 70, a = i * Math.PI / 5 - Math.PI / 2; i ? p.lineTo(Math.cos(a) * r, Math.sin(a) * r) : p.moveTo(Math.cos(a) * r, Math.sin(a) * r); } p.closePath(); P(p, M.gold2, '#3A2208', 4); }); }
  const kA = 1 - seg(u, wt('h1', 8) - 0.15, wt('h1', 8));
  bigText('WHY DOES THE', W / 2, 330, 76, '#FFFFFF', seg(u, 0, 0.18) * kA);
  bigText('LOUDEST', W / 2, 460, 150, M.gold2, seg(u, wt('h1', 3) - 0.05, wt('h1', 3) + 0.15) * kA);
  bigText('GET THE', W / 2, 330, 88, '#FFFFFF', seg(u, wt('h1', 8) - 0.05, wt('h1', 8) + 0.12));
  bigText('CREDIT?', W / 2, 470, 160, M.gold2, seg(u, wt('h1', 10) - 0.05, wt('h1', 10) + 0.12));
};
DRAW.sc2 = (t, d) => { // Dan talks big: arm up, sound rings, bubbles
  const u = lt('n2'); const tag = kin('n2', 3, 0.05, 0.3);
  nightOffice(t, d, { spot: 0, dan: { arm: easeOut(seg(u, wt('n2', 4) - 0.2, wt('n2', 5))), talk: seg(u, wt('n2', 4) - 0.1, wt('n2', 4) + 0.3) }, aisha: { lamp: 0.4 }, cam: { zoom: lerp(1.12, 1.24, ease(t / d)), px: lerp(-150, -190, ease(t / d)), py: 0, cy: 1000 } });
  bigText('TWO NEW HIRES', W / 2, 330, 92, '#FFFFFF', seg(u, 0, 0.2) * (1 - seg(u, wt('n2', 3) - 0.2, wt('n2', 3))));
  nameTag('DAN', 300, 640, tag);
  [['BIG PLANS!', 300, 620, 5], ['100%!', 620, 520, 6], ["I'VE GOT THIS", 500, 760, 7]].forEach(([s, x, y, k]) => sayBubble(x, y, seg(u, wt('n2', k) - 0.1, wt('n2', k) + 0.2), s, M.gold2, 46));
};
DRAW.sc3 = (t, d) => { // Aisha fixes problems in the dark: bugs flip to checks
  const u = lt('n3');
  nightOffice(t, d, { spot: 0, spotA: 0.35, dan: { arm: 0.15, talk: 0 }, aisha: { lamp: 1 }, cam: { zoom: lerp(1.2, 1.3, ease(t / d)), px: lerp(200, 230, ease(t / d)), py: 0, cy: 1050 } });
  nameTag('AISHA', 800, 400, kin('n3', 0, 0.05, 0.3), NV.cool);
  [[620, 560], [800, 500], [970, 590], [690, 700], [960, 760]].forEach(([x, y], i) => bugIcon(x, y, 0.9, easeOut(seg(u, wt('n3', 2) + i * 0.28, wt('n3', 2) + i * 0.28 + 0.25)), t));
  bigText('NOBODY SEES', W / 2, 330, 104, '#FFFFFF', kin('n3', 5, 0.05, 0.2));
};
DRAW.sc4 = (t, d) => { // six months later: a stair of light to a PROMOTED door; Dan climbs; Aisha's lamp alone in the dark
  const u = lt('n4'); const climb = easeOut(seg(u, wt('n4', 3) - 0.2, wt('n4', 5) + 0.5)); const door = easeOut(seg(u, wt('n4', 4), wt('n4', 5) + 0.2));
  nightOffice(t, d, { spot: 0, spotA: 0.5, dan: { hide: true }, aisha: { lamp: 0.5 }, cam: { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0, cy: 1000 },
    mid: [{ z: 0.62, draw: () => {
      for (let i = 0; i < 7; i++) { const x = 330 - i * 34, y = 1320 - i * 92; alpha(0.45 + 0.55 * climb, () => { P(rr(x - 170, y - 18, 340, 26, 4), grad(y - 18, y + 8, '#FFE39A', '#9A6A1A'), null); glow(x, y, 160, M.gold, 0.12); }); }
      withT(120, 560, 1, 0, () => { glow(0, 80, 260, M.gold, 0.3 + 0.3 * door); P(rr(-110, -150, 220, 340, [110, 110, 0, 0]), `rgba(255,214,140,${0.25 + 0.6 * door})`, M.gold2, 5);
        alpha(door, () => { P(rr(-120, -220, 240, 56, 10), '#1A1208', M.gold2, 3); txt('PROMOTED', 0, -191, 38, M.gold2, 'Oswald', 700); }); });
      const k = Math.min(6, climb * 6.5); const sx = 330 - k * 34, sy = 1300 - k * 92 + Math.abs(Math.sin(k * Math.PI)) * -16; person(sx, sy, 0.95 - k * 0.04, { f: -1, rim: NV.warm, rimA: 0.95 });
    } }] });
  bigText('SIX MONTHS LATER', W / 2, 300, 80, '#FFFFFF', seg(u, 0, 0.2));
};
DRAW.sc5 = (t, d) => { // Unfair? — night study, Machiavelli writes; an ink eye appears on the page
  const u = lt('n5'); const eyeK = easeOut(seg(u, wt('n5', 2) - 0.1, wt('n5', 4) + 0.3));
  study(t, d, { dawn: 0.08, candleX: 230, cam: { zoom: lerp(1.04, 1.12, ease(t / d)), px: lerp(20, -20, ease(t / d)), py: 0 },
    pre: [{ z: 0.5, draw: () => thinker(470, 1192, 1.05, t) }],
    desk: () => { if (eyeK > 0) withT(760, 1250, 0.34, -0.06, () => alpha(eyeK, () => { P(rr(-380, -230, 760, 460, 10), '#E6D6B0', null); ctx.save(); ctx.strokeStyle = '#2A1A0C'; ctx.lineWidth = 12; const p = new Path2D(); p.moveTo(-260, 0); p.quadraticCurveTo(0, -190 * eyeK, 260, 0); p.quadraticCurveTo(0, 190 * eyeK, -260, 0); ctx.stroke(p); ctx.beginPath(); ctx.arc(0, 0, 80 * eyeK, 0, 6.283); ctx.stroke(); ctx.restore(); P(circ(0, 0, 34 * eyeK), '#2A1A0C', null); })); } });
  bigText('UNFAIR?', W / 2, 400, 160, '#FFFFFF', seg(u, 0, 0.15) * (1 - seg(u, wt('n5', 1) - 0.2, wt('n5', 1))));
  chipAt('Florence · The Prince, 1513', 300, seg(u, wt('n5', 1) - 0.1, wt('n5', 1) + 0.3));
  bigText('500+ YEARS AGO', W / 2, 460, 104, M.gold2, kin('n5', 5, 0.05, 0.2));
};
DRAW.sc6 = (t, d) => { // quote 1: eye above, hand below, card in between
  const u = lt('q1');
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#140A08', '#030203')); glow(W / 2, 400, 520, '#E2B04A', 0.12); alpha(0.18, () => { for (let i = 0; i < 30; i++) P(circ(rnd(i) * W, rnd(i + 3) * H, 2 + rnd(i + 9) * 3), M.gold2, null); }); } },
    { z: 0.4, draw: () => { bigEye(W / 2, 290, 0.95, t, Math.sin(t * 0.8) * 0.5, 0.95); } },
    { z: 0.7, draw: () => { handSil(W / 2 + 20, lerp(2050, 1880, easeOut(seg(u, wt('q1', 10), wt('q1', 12) + 0.4))), 1.15, -0.05, M.gold2, 0.7); } },
  ], { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0, cy: 900 });
  quoteCard2('q1', 2, '…men judge generally more by the eye than by the hand.', ['— The Prince, Ch. 18 (tr. Marriott)'], ['eye', 'hand'], { cy: 900, size: 72, in: 0.0 });
};
DRAW.sc7 = (t, d) => { // the eye sees how you look; the hand finds what's up close; few get that close
  const u = lt('n6'); const handK = easeOut(seg(u, wt('n6', 6) - 0.1, wt('n6', 13) + 0.2)); const few = easeOut(seg(u, wt('n6', 14), wt('n6', 16) + 0.3));
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#0C0A12', '#030204')); glow(W / 2, 1100, 600, '#6A4A20', 0.2); } },
    { z: 0.2, haze: 0.04, draw: () => { bigEye(W / 2, 400, 0.85, t, Math.sin(t * 1.4) * 0.9, 0.9); beam(W / 2, 470, 160, W / 2, 1250, 1100, '255,214,150', 0.08 * (1 - few * 0.7)); } },
    { z: 0.5, draw: () => { // crowd of identical silhouettes, gold outline = "how you look"
      for (let i = 0; i < 6; i++) { const x = 90 + i * 180, y = 1240 + (i % 2) * 30; const me = i === 3; const a = me ? 1 : 1 - 0.75 * few;
        alpha(a, () => bust(x, y, 0.95, { f: x < W / 2 ? 1 : -1, rim: M.gold, rimA: 0.7 }));
        if (me && handK > 0.6) { const k = seg(handK, 0.6, 1); glow(x, y - 160, 160, '#FFB860', 0.6 * k); withT(x, y - 120, 0.6 + 0.4 * k, 0, () => { const p = new Path2D(); p.moveTo(0, 30); p.bezierCurveTo(-70, -20, -40, -80, 0, -45); p.bezierCurveTo(40, -80, 70, -20, 0, 30); P(p, `rgba(255,190,90,${0.9 * k})`, null); }); } } } },
    { z: 0.8, draw: () => { handSil(640 + 20 * Math.sin(t * 2), lerp(2200, 1520, handK), 1.25, -0.08, M.gold2, 0.8); } },
  ], { zoom: lerp(1.0, 1.08, ease(t / d)), px: 0, py: lerp(0, 40, few), cy: 1100 });
  bigText('THE EYE', W / 2, 160 + 520, 90, M.gold2, kin('n6', 1, 0.05, 0.2) * (1 - seg(u, wt('n6', 6) - 0.2, wt('n6', 6))));
  bigText('THE HAND', W / 2, 160 + 520, 96, '#FFFFFF', kin('n6', 7, 0.05, 0.2) * (1 - seg(u, wt('n6', 14) - 0.2, wt('n6', 14))));
  bigText('FEW GET THAT CLOSE', W / 2, 680, 80, '#FF6A5A', kin('n6', 15, 0.05, 0.2));
};
DRAW.sc8 = (t, d) => { // quote 2: mask on a velvet stand; a face peeks from behind it
  const u = lt('q2'); const peek = easeOut(seg(u, wt('q2', 7) - 0.1, wt('q2', 9) + 0.4));
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, H, '#1E0608', '#040102')); for (let i = 0; i < 8; i++) { const x = -40 + i * 160; alpha(0.6, () => P(rr(x, 0, 140, H, 0), grad(0, H, '#4A0A0E', '#120204'), null)); } } },
    { z: 0.45, draw: () => { P(ell(W / 2, 1720, 360, 60), 'rgba(255,214,150,0.12)', null); beam(W / 2, -40, 120, W / 2, 1720, 600, '255,214,150', 0.14); maskStand(W / 2, 1740, 1.1, t, peek); } },
  ], { zoom: lerp(1.02, 1.1, ease(t / d)), px: 0, py: 0, cy: 1300 });
  dust(t, 40, [0, 200, W, 1500], '255,215,160', 13);
  quoteCard2('q2', 0, 'Everyone sees what you appear to be, few really know what you are.', ['— The Prince, Ch. 18 (tr. Marriott)'], ['appear', 'know'], { cy: 640, size: 70, in: 0.0 });
};
DRAW.sc9 = (t, d) => { // advice to rulers: the prince lifts a smiling mask; the virtue words around him turn hollow
  const u = lt('n7'); const m = easeOut(seg(u, wt('n7', 12) - 0.2, wt('n7', 13) + 0.3)); const hol = easeOut(seg(u, wt('n7', 13), wt('n7', 16) + 0.3));
  throneHall(t, d, { cam: { zoom: lerp(1.0, 1.1, ease(t / d)), px: 0, py: 0, cy: 1100 }, mid: [{ z: 0.6, draw: () => { prince(W / 2, 1340, 1.25, t, m); } }] });
  [['MERCIFUL', 220, 660, 7], ['FAITHFUL', 860, 620, 8], ['HUMANE', 200, 1000, 9], ['UPRIGHT', 870, 960, 10]].forEach(([s, x, y, k]) => hollowWord(s, x, y + Math.sin(t + x) * 8, 58, seg(u, wt('n7', k) - 0.2, wt('n7', k) + 0.2), hol));
  if (m > 0.9) { ctx.fillStyle = `rgba(90,8,8,${0.18 * hol})`; ctx.fillRect(0, 0, W, H); }
  flash(u - wt('n7', 13), '255,200,140', 0.25, 0.3);
  chipAt('in essence · The Prince, Ch. 18', 300, seg(u, 0.1, 0.5));
  bigText('JUST SEEM', W / 2, 1640 - 1200 + 0, 110, M.gold2, kin('n7', 12, 0.05, 0.2));
};
DRAW.sc10 = (t, d) => { // don't copy the mask (falls + cracks) → flip → promises float off, deeds stack up
  const u = lt('n8'); const fall = easeIn(seg(u, wt('n8', 1) - 0.1, wt('n8', 3) + 0.1)); const cr = easeOut(seg(u, wt('n8', 3) + 0.05, wt('n8', 3) + 0.5));
  const fl = seg(u, wt('n8', 4) - 0.1, wt('n8', 6) + 0.2); const sx = Math.cos(fl * Math.PI * 2); const part2 = fl > 0.5;
  ctx.save(); ctx.translate(W / 2, 0); ctx.scale(Math.max(0.02, Math.abs(sx)), 1); ctx.translate(-W / 2, 0);
  if (!part2) {
    throneHall(t + 4, d, { cam: { zoom: 1.1, px: 0, py: 0, cy: 1100 }, mid: [{ z: 0.6, draw: () => {
      prince(W / 2, 1340, 1.25, t, 1, M.gold2, { noMask: true }); crack(W / 2, 1330, cr, 5, '#FF6A3A');
      withT(W / 2 + 60 * fall, lerp(-470 * 1.25 + 1340, 1330, fall), 1.25, fall * 0.6, () => mask(0, 0, 0.62, t)); } }] });
    bigText("DON'T COPY THE MASK", W / 2, 320, 76, '#FFFFFF', seg(u, 0, 0.2));
  } else {
    const ju = seg(u, wt('n8', 7) - 0.1, wt('n8', 7) + 0.2);
    layers([
      { z: 0.03, draw: () => { fullFill(grad(0, H, '#0E0A10', '#030204')); glow(270, 900, 420, '#6A9AE0', 0.14); glow(810, 1100, 420, '#E2B04A', 0.2); line(W / 2, 520, W / 2, 1200, 'rgba(246,210,122,0.25)', 3); } },
      { z: 0.5, draw: () => {
        txt('PROMISES', 270, 560, 54, '#9CC4FF', 'Oswald', 700); txt('DEEDS', 810, 560, 54, M.gold2, 'Oswald', 700);
        [["I'll do it!", 270, 1120, 8], ['Trust me', 230, 960, 10], ['Next week!', 300, 800, 11], ['Easy!', 250, 660, 12]].forEach(([s, x, y, k], i) => { const rise = (u - wt('n8', k)) * 40; promise(s, x + Math.sin(t * 2 + i) * 12, y - Math.max(0, rise), seg(u, wt('n8', k) - 0.1, wt('n8', k) + 0.2), seg(u, wt('n8', 15) + i * 0.12, wt('n8', 15) + i * 0.12 + 0.3)); });
        for (let i = 0; i < 4; i++) block(810, 1120 - i * 92, seg(u, wt('n8', 12) + i * 0.22 - 0.2, wt('n8', 12) + i * 0.22 + 0.15), i);
        handSil(1000, lerp(1750, 1520, seg(u, wt('n8', 11), wt('n8', 12))), 0.8, -0.45, M.gold2, 0.7); } },
    ], { zoom: lerp(1.0, 1.05, ease(seg(u, wt('n8', 6), LINES.n8.dur))), px: 0, py: 0, cy: 1000 });
    bigText('JUDGE THE HAND', W / 2, 330, 92, M.gold2, ju);
  }
  ctx.restore();
};
DRAW.sc11 = (t, d) => { // if you're Aisha: hidden work in the dark → the spotlight swings to her, work rises into the light
  const u = lt('n9'); const sw = easeOut(seg(u, wt('n9', 10) - 0.2, wt('n9', 13) + 0.2)); const show = easeOut(seg(u, wt('n9', 12) - 0.1, wt('n9', 14) + 0.4));
  nightOffice(t + 6, d, { spot: sw, spotA: 0.25 + 0.75 * sw, dan: { arm: 0.2, talk: 0.3 * (1 - sw) }, aisha: { lamp: 1 }, cam: { zoom: lerp(1.04, 1.12, ease(t / d)), px: lerp(0, 90, sw), py: 0, cy: 1050 },
    desks: () => { [[690, 1000], [800, 930], [910, 1010]].forEach(([x, y], i) => { const yy = lerp(1250 + i * 10, y - 60 * show, show); workCard(x, yy, 0.9, 1, show, (i - 1) * 0.12 * (1 - show)); }); } });
  nameTag('AISHA', 800, 560, kin('n9', 3, 0.05, 0.3), NV.cool);
  bigText('HIDDEN WORK', W / 2, 330, 96, '#9CC4FF', kin('n9', 4, 0.05, 0.2) * (1 - seg(u, wt('n9', 10) - 0.2, wt('n9', 10))));
  bigText('LET IT BE SEEN', W / 2, 330, 96, M.gold2, kin('n9', 10, 0.05, 0.2));
};
DRAW.sc12 = (t, d) => { // tonight: laptop note to the team, three finished things tick, then Send
  const u = lt('n10'); const typed = seg(u, wt('n10', 1) - 0.1, wt('n10', 6) + 0.2); const sent = easeOut(seg(u, wt('n10', 12) + 0.2, wt('n10', 12) + 0.6));
  layers([
    { z: 0.03, draw: () => { fullFill(grad(0, 1200, NV.sky1, NV.sky2)); moon(220, 300, 40); cityNight(1000, '#0A1122', 21, 0.6); ctx.fillStyle = '#05050A'; ctx.fillRect(-100, 0, 80, H); ctx.fillRect(W - 40, 0, 160, H); ctx.fillRect(W / 2 - 10, 0, 20, 1000); ctx.fillRect(-100, 1000, W + 200, 1000); } },
    { z: 0.3, draw: () => { P(rr(-200, 1150, W + 400, 900, 0), grad(1150, H, '#2A1C14', '#0A0604'), null); line(-200, 1151, W + 200, 1151, 'rgba(255,200,140,0.45)', 3); deskLamp(940, 1150, 1.1, 1, t);
      withT(150, 1150, 1.1, 0, () => { P(rr(-46, -100, 92, 100, 14), '#E8E2D6', null); P(new Path2D('M46 -80 Q80 -74 76 -50 Q72 -28 46 -32'), null, '#E8E2D6', 9); }); } },
    { z: 0.6, draw: () => { withT(W / 2, 1160, 1, 0, () => { // laptop
      glow(0, -330, 520, '#8AB4FF', 0.18); P(rr(-400, -640, 800, 520, 24), '#0B0C10', '#2A2C34', 5); P(rr(-376, -616, 752, 472, 10), '#F3EFE6', null);
      P(rr(-376, -616, 752, 70, [10, 10, 0, 0]), '#E1DACB', null); txt('To: Team', -340, -581, 34, '#3A3A44', 'Montserrat', 700, 'left');
      const msg = 'This month I finished:'; txt(msg.slice(0, Math.floor(msg.length * typed)), -340, -490, 40, '#24170C', 'Montserrat', 700, 'left');
      ['Fixed the login bug', 'New client report', 'Trained two new hires'].forEach((s, i) => { const k = seg(u, wt('n10', 7) + i * 0.42 - 0.1, wt('n10', 7) + i * 0.42 + 0.2); if (k <= 0) return;
        alpha(k, () => { P(circ(-318, -410 + i * 74, 22), '#1E7A44', null); ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-328, -410 + i * 74); ctx.lineTo(-320, -401 + i * 74); ctx.lineTo(-306, -419 + i * 74); ctx.stroke(); ctx.restore(); txt(s, -280, -410 + i * 74, 38, '#24170C', 'Montserrat', 600, 'left'); }); });
      const pb = 1 + 0.06 * Math.sin(t * 8) * (1 - sent); withT(250, -205, pb, 0, () => { P(rr(-90, -32, 180, 64, 32), sent > 0.5 ? '#1E7A44' : '#2E6BD6', null); txt(sent > 0.5 ? 'SENT ✓' : 'SEND', 0, 2, 32, '#fff', 'Montserrat', 800); });
      P(poly([-460, -120, 460, -120, 520, -60, -520, -60]), '#15161C', '#2A2C34', 4); }); } },
  ], { zoom: lerp(1.0, 1.06, ease(t / d)), px: 0, py: 0, cy: 900 });
  dust(t, 30, [0, 200, W, 900], '200,215,255', 17);
  bigText('TONIGHT', W / 2, 260, 110, M.gold2, seg(u, 0, 0.2));
};
DRAW.sc13 = (t, d) => { // comment question: Aisha at her lamp, a big comment bubble
  const u = lt('n11');
  nightOffice(t + 9, d, { spot: 1, spotA: 0.8, dan: { hide: true }, aisha: { lamp: 1 }, cam: { zoom: lerp(1.3, 1.36, ease(t / d)), px: 230, py: 0, cy: 1150 } });
  bigText('EVER BEEN', W / 2, 330, 92, '#FFFFFF', seg(u, 0, 0.2));
  bigText('AN AISHA?', W / 2, 470, 132, M.gold2, kin('n11', 3, 0.05, 0.2));
  const kc = back(seg(u, wt('n11', 4) - 0.05, wt('n11', 4) + 0.35)); if (kc > 0) withT(W / 2 - 160, 800, kc, 0, () => { const b = new Path2D(); b.roundRect(-110, -70, 220, 130, 30); b.moveTo(-30, 60); b.lineTo(-60, 105); b.lineTo(10, 60); P(b, '#F6F2E8', '#111', 4); for (let i = -1; i <= 1; i++) P(circ(i * 48, -5, 13), '#222', null); });
};
DRAW.sc14 = (t, d) => { // end card: Follow Awazzzz · Mindset
  nightOffice(t + 12, d, { spot: 1, spotA: 1, dan: { hide: true }, aisha: { lamp: 1 }, cam: { zoom: 1.1, px: 0, py: 0, cy: 1150 } });
  ctx.fillStyle = 'rgba(3,3,8,0.64)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0, 0.4)); const L = document.getElementById('logo');
  withT(W / 2, 640, lerp(0.8, 1, k), 0, () => alpha(k, () => { glow(0, 0, 320, M.gold, 0.4); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -135, -135, 270, 270); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.strokeStyle = M.gold2; ctx.lineWidth = 7; ctx.stroke(); }));
  bigText('Follow Awazzzz', W / 2, 900, 104, '#FFFFFF', seg(t, 0.1, 0.4));
  bigText('MINDSET', W / 2, 1030, 66, M.gold2, seg(t, 0.3, 0.6), 'Oswald', 700);
  alpha(seg(t, 0.5, 0.8), () => txt('let your real work be seen', W / 2, 1120, 46, M.parch, 'CrimsonText', 600));
  const pulse = 1 + 0.04 * Math.sin(t * 6); withT(W / 2, 1230, back(seg(t, 0.6, 0.9)) * pulse, 0, () => { P(rr(-200, -50, 400, 100, 50), '#E62117', '#111', 4); txt('SUBSCRIBE', 0, 4, 52, '#fff', 'Oswald', 700); });
};
function drawFrame(T) {
  GT = T; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, W, H);
  const i = SCENES.findIndex(s => T >= s.start && T < s.start + s.dur); const s = SCENES[i < 0 ? SCENES.length - 1 : i];
  ctx.save(); DRAW[s.id](T - s.start, s.dur); ctx.restore(); ctx.filter = 'none';
  const u = T - s.start; if (u < 0.18 && s.start > 0) { ctx.fillStyle = `rgba(0,0,0,${1 - u / 0.18})`; ctx.fillRect(0, 0, W, H); }
  const nxt = SCENES[SCENES.indexOf(s) + 1]; if (nxt && s.start + s.dur - T < 0.1) { ctx.fillStyle = `rgba(0,0,0,${1 - (s.start + s.dur - T) / 0.1})`; ctx.fillRect(0, 0, W, H); }
  vign(0.6); grain(T);
  if (s.id !== 'sc14') { watermark(T); captions(); }
}
function drawCover() {
  GT = 2.0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  nightOffice(1.2, 3, { spot: 0, dan: { arm: 0.9, talk: 1 }, aisha: { lamp: 1 }, cam: { zoom: 1.06, px: 0, py: 0, cy: 1200 } });
  ctx.filter = 'none'; vign(0.5);
  withT(W / 2, 300, 1, 0, () => { ctx.font = '700 54px Oswald'; const s = 'MACHIAVELLI'; const w = ctx.measureText(s).width + 80; P(rr(-w / 2, -44, w, 88, 44), 'rgba(110,14,14,0.92)', M.gold2, 4); txt(s, 0, 3, 54, '#FFF3D6', 'Oswald', 700); });
  bigText('THE LOUDEST', W / 2, 480, 124, '#FFFFFF', 1);
  bigText('WINS?', W / 2, 650, 180, M.gold2, 1);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(980, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, 918, 48, 124, 124); ctx.restore();
  bigText('The Prince · Ch. 18', W / 2, 1560, 60, M.parch, 1, 'CrimsonText', 700);
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
