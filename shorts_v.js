// ===== Awazzzz Shorts — full-screen vertical (1080x1920) engine: overlays + frame composer.
// Loaded after rig_v.js (W=1080,H=1920), timeline_v.js and the episode scenes.js; an episode adds its
// native portrait scenes to DRAWV in its own scenes_v.js. Scenes without DRAWV use the 2x crop fallback (shorts.py).
// Safe zones: key content inside x 40..940, y 140..1620 (right 140 px / bottom 300 px = YouTube UI); captions own y 1250..1450.
const DRAWV = {};
const CX = 490; // visual centre, shifted left of the YouTube button column (right 140 px)
const SC = id => SCENES.find(s => s.id === id);

function bannerV(s, sub, y, t, col = C.amber) { banner(s, sub, 50, y, t, col); }

// ---------- overlays ----------
function watermarkV() { alpha(0.92, () => logoCircle(84, 86, 42)); }
function partChip(n, T) { const a = T < 2.1 ? 1 : 1 - seg(T, 2.1, 2.5); if (a <= 0) return; alpha(a, () => { P(rr(140, 62, 190, 50, 25), C.red, null); txt('PART ' + n + '/4', 235, 89, 32, C.white, 'Oswald', 700); }); }
function hookLine(s, T) { if (T >= 2.0) return; const a = Math.min(seg(T, 0, 0.2), 1 - seg(T, 1.75, 2.0)); let sz = 80; ctx.font = `700 ${sz}px Oswald`; while (ctx.measureText(s).width > 860 && sz > 44) { sz -= 2; ctx.font = `700 ${sz}px Oswald`; }
  alpha(a, () => { const w = ctx.measureText(s).width + 50; P(rr(CX - w / 2, 175 - sz * 0.72, w, sz * 1.44, 16), 'rgba(8,11,18,0.6)', null); txtStroke(s, CX, 178, sz, C.amber, C.ink, 8); }); }
function capBox(s, col = C.white) {
  let sz = 52; let rows;
  const fit = () => { ctx.font = `800 ${sz}px Baloo2`; const words = s.split(' '); rows = ['']; words.forEach(w => { const tt = (rows[rows.length - 1] + ' ' + w).trim(); if (ctx.measureText(tt).width > 800 && rows[rows.length - 1]) rows.push(w); else rows[rows.length - 1] = tt; }); };
  fit(); while (rows.length > 2 && sz > 36) { sz -= 2; fit(); }
  const lh = sz * 1.22, bw = Math.max(...rows.map(r => ctx.measureText(r).width)) + 56, bh = rows.length * lh + 26, y0 = 1350 - bh / 2;
  P(rr(CX - bw / 2, y0, bw, bh, 16), 'rgba(8,11,18,0.6)', null);
  rows.forEach((r, i) => txt(r, CX, y0 + 13 + lh * (i + 0.5) + 2, sz, col, 'Baloo2', 800));
}
function captionsV() { for (const id in LINES) { if (!act(id)) continue; const u = GT - LINES[id].start; const c = CH[id].find(c => u >= c[0] && u < c[1] + 0.05) || CH[id][CH[id].length - 1]; capBox(c[2]); } }
function hookCaption(text, u, vdur) { if (u < 0 || u > vdur + 0.15) return; const ch = chunks(text, vdur); const c = ch.find(c => u >= c[0] && u < c[1] + 0.05) || ch[ch.length - 1]; capBox(c[2]); }
function endCard(u) { // compact end card, last 2 s
  const k = back(seg(u, 0, 0.35));
  alpha(seg(u, 0, 0.25), () => { ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.fillRect(0, 0, W, H); });
  withT(CX, 900, k, 0, () => {
    P(rr(-380, -230, 760, 460, 30), 'rgba(10,14,24,0.88)', C.amber, 5);
    logoCircle(0, -140, 62);
    txt('Poori kahaani', 0, -30, 56, C.white, 'Baloo2', 800); txt('Awazzzz channel par', 0, 34, 56, C.amber, 'Baloo2', 800);
    const pulse = 1 + 0.04 * Math.sin(u * 9);
    withT(0, 150, pulse, 0, () => { P(rr(-220, -50, 440, 100, 50), '#E62117', C.ink, 5); P(rr(-180, -24, 66, 48, 14), C.white, null); P(poly([-158, -12, -158, 12, -134, 0]), '#E62117', null); txt('SUBSCRIBE', 40, 4, 58, C.white); });
  });
}

// o = {kind:'hook'|'main'|'end', T (short time), total, part, scene, t, d, GT, hookLine, capText, vdur, vstart}
function frameV(o) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H);
  if (o.kind === 'main') {
    GT = o.GT; const g = GT + 1e-4; const s = SCENES.find(s => g >= s.start && g < s.start + s.dur) || SCENES[SCENES.length - 1];
    ctx.save(); DRAWV[s.id](GT - s.start, s.dur); ctx.restore();
    const u = GT - s.start; if (u < 0.12 && o.t > 0.2) alpha(1 - u / 0.12, () => fillAll('#000'));
  } else { GT = -100; ctx.save(); DRAWV[o.scene](o.t, o.d); ctx.restore(); }
  if (o.t < 0.15 && o.T > 0.2) alpha(1 - o.t / 0.15, () => fillAll('#000'));
  watermarkV();
  if (o.T < 2.5) partChip(o.part, o.T);
  if (o.hookLine) hookLine(o.hookLine, o.T);
  const endU = o.T - (o.total - 2.0);
  if (endU < 0) {
    if (o.kind === 'main') { GT = o.GT; captionsV(); }
    else if (!(o.kind === 'hook' && o.T < 2.0)) hookCaption(o.capText, o.t - o.vstart, o.vdur);
  } else endCard(endU);
}
function grabV(o) { frameV(o); return document.getElementById('c').toDataURL('image/jpeg', 0.92).split(',')[1]; }
