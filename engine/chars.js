/* STUDIO ENGINE · chars.js — reusable 2D character RIG system.
   A character = SPEC (look) + POSE (joint angles) + FACE (expression, viseme, blink, gaze).
   The skeleton is a 3D stick figure (X = character's left, Y = down, Z = forward) projected
   orthographically with body yaw, then drawn as flat toon shapes. That one rig gives:
   front / 3-4 / profile / back views, smooth turning, walk/run cycles, sitting, falling, gestures,
   14 facial expressions and 10 lip-sync mouth shapes. Requires core.js. */
'use strict';

// ---------------- vector helpers ----------------
const V = { add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k] };
function rotX(v, a) { const c = Math.cos(a), s = Math.sin(a); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; } // pitch: +a tips the top (−Y) toward +Z (forward)
function rotZ(v, a) { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]]; } // roll
function limbDir(sw, ab, side) { // unit direction of a limb hanging down, swung forward by sw, raised sideways by ab
  return [side * Math.sin(ab), Math.cos(ab) * Math.cos(sw), Math.cos(ab) * Math.sin(sw)];
}

// ---------------- proportions ----------------
const AGE = {
  toddler: { head: 0.20, leg: 0.30, neck: 0.015, shoulder: 0.14, eye: 1.25 },
  kid: { head: 0.165, leg: 0.36, neck: 0.02, shoulder: 0.15, eye: 1.15 },
  teen: { head: 0.125, leg: 0.44, neck: 0.03, shoulder: 0.17, eye: 1.0 },
  adult: { head: 0.11, leg: 0.465, neck: 0.035, shoulder: 0.19, eye: 0.92 },
  elder: { head: 0.11, leg: 0.44, neck: 0.03, shoulder: 0.18, eye: 0.88 },
};
const BUILD = { slim: { w: 0.85, belly: 0, limb: 0.85 }, average: { w: 1, belly: 0.02, limb: 1 }, chubby: { w: 1.28, belly: 0.16, limb: 1.15 }, muscular: { w: 1.22, belly: 0, limb: 1.25 }, petite: { w: 0.82, belly: 0, limb: 0.8 } };
const OUT = '#2a1c14';

// ---------------- default pose ----------------
function basePose() {
  return {
    yaw: 0, lean: 0, roll: 0, dx: 0, dy: 0, air: 0, rot: 0, shrug: 0, scaleY: 1,
    head: { yaw: 0, pitch: 0, roll: 0 },
    armL: { sw: 0.05, ab: 0.12, el: 0.15 }, armR: { sw: 0.05, ab: 0.12, el: 0.15 },
    legL: { sw: 0, ab: 0.04, kn: 0.02 }, legR: { sw: 0, ab: 0.04, kn: 0.02 },
    handL: 'open', handR: 'open',
    face: { expr: 'neutral', mouth: null, blink: 0, gaze: [0, 0] },
  };
}
function clonePose(p) { return JSON.parse(JSON.stringify(p)); }
function blendPose(a, b, k) { // numeric lerp of every field; strings switch at k>=.5
  if (k <= 0) return a; if (k >= 1) return b;
  const out = Array.isArray(a) ? [] : {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const va = a[key] ?? b[key], vb = b[key] ?? a[key];
    out[key] = (typeof va === 'number') ? lerp(va, vb, k) : (va && typeof va === 'object') ? blendPose(va, vb, k) : (k < .5 ? va : vb);
  }
  return out;
}
function poseWith(p, patch) { const o = clonePose(p); (function m(t, s) { for (const k in s) { if (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k]) && t[k]) m(t[k], s[k]); else t[k] = s[k]; } })(o, patch); return o; }

// ---------------- SKELETON SOLVE ----------------
function solve(spec, pose) {
  const A = AGE[spec.age || 'adult'], B = BUILD[spec.build || 'average'];
  const H = spec.height || 420;
  const hr = H * A.head * (spec.headScale || 1), L = H * A.leg * (spec.legScale || 1), neck = H * A.neck;
  const torso = H - 2 * hr - L - neck;
  const sh = H * A.shoulder * B.w * 0.5 * (spec.widthScale || 1), hipW = sh * (spec.hips || 0.72);
  const thigh = L * 0.5, shin = L * 0.5, uarm = torso * 0.78 * (spec.armScale || 1), farm = torso * 0.72 * (spec.armScale || 1);
  const J = {};
  const up = v => rotZ(rotX(v, pose.lean), pose.roll); // torso frame
  J.hip = [0, 0, 0];
  J.chest = up([0, -torso * 0.72, 0]);
  J.neck = up([0, -torso - pose.shrug * hr * 0.15, 0]);
  J.head = V.add(J.neck, up([0, -neck - hr * 0.92, hr * 0.05]));
  for (const s of [1, -1]) { // s=+1 left side
    const n = s > 0 ? 'L' : 'R'; const arm = pose['arm' + n], leg = pose['leg' + n];
    J['sho' + n] = up([s * sh, -torso * 0.93 - pose.shrug * hr * 0.35, 0]);
    const d1 = up(limbDir(arm.sw, arm.ab, s)), d2 = up(limbDir(arm.sw + arm.el, arm.elAb ?? arm.ab * (arm.el > 1.6 ? 0.55 : 0.9), s));
    J['elb' + n] = V.add(J['sho' + n], V.mul(d1, uarm)); J['wri' + n] = V.add(J['elb' + n], V.mul(d2, farm));
    J['hip' + n] = [s * hipW, 0, 0];
    const l1 = limbDir(leg.sw, leg.ab, s), l2 = limbDir(leg.sw - leg.kn, leg.ab * 0.6, s);
    J['kne' + n] = V.add(J['hip' + n], V.mul(l1, thigh)); J['ank' + n] = V.add(J['kne' + n], V.mul(l2, shin));
    J['toe' + n] = V.add(J['ank' + n], [0, hr * 0.12, hr * 0.42]);
  }
  return { J, hr, H, L, torso, sh, hipW, thigh, shin, B, A };
}
// projection: yaw a (0 = facing camera, +π/2 = facing screen-right)
function proj(v, a) { const c = Math.cos(a), s = Math.sin(a); return { x: v[0] * c + v[2] * s, y: v[1], d: v[2] * c - v[0] * s }; }

// ---------------- MAIN DRAW ----------------
// drawChar(spec, pose, x, groundY, scale, {t, flip})
function drawChar(spec, pose, x, gy, sc = 1, opt = {}) {
  const S = solve(spec, pose), a = pose.yaw, J = S.J, t = opt.t || 0;
  const P = {}; for (const k in J) P[k] = proj(J[k], a);
  // auto-ground: lowest foot on the floor (unless airborne)
  const lowest = Math.max(P.ankL.y, P.ankR.y, P.toeL.y, P.toeR.y) + S.hr * 0.12;
  const oy = -lowest - pose.air + pose.dy;
  C.save(); C.translate(x + pose.dx * sc, gy); C.scale(sc, sc * pose.scaleY);
  if (pose.rot) { const piv = P.ankL.y > P.ankR.y ? P.ankL : P.ankR; C.translate(piv.x, oy + piv.y); C.rotate(pose.rot); C.translate(-piv.x, -(oy + piv.y)); }
  C.translate(0, oy);
  if (opt.shadow !== false && !pose.rot) { C.save(); C.translate(0, -oy); C.fillStyle = 'rgba(0,0,0,0.18)'; C.beginPath(); C.ellipse(0, 0, S.sh * 1.6 * Math.max(.4, 1 - pose.air / 300), S.hr * 0.22, 0, 0, TAU); C.fill(); C.restore(); }
  const lw = Math.max(2.2, S.H * 0.011); const parts = [];
  const skin = spec.skin || '#c68a5a', top = spec.top?.color || '#3a6ea5', bot = spec.bottom?.color || '#2d3445', shoe = spec.shoes || '#222';
  const longSleeve = spec.top?.sleeve !== 'short';
  const limbW = S.H * 0.045 * S.B.limb * (spec.limbScale || 1);
  for (const n of ['L', 'R']) {
    const side = n === 'L' ? 1 : -1;
    const legCol = (spec.bottom?.type === 'shorts' || spec.bottom?.type === 'skirt') ? skin : bot;
    const shinCol = spec.bottom?.type === 'shorts' || spec.bottom?.type === 'skirt' ? skin : bot;
    const dLeg = (P['hip' + n].d + P['ank' + n].d) / 2 - 0.5;
    parts.push({ d: dLeg, f: () => { seg3(P['hip' + n], P['kne' + n], limbW * 1.25, legCol, lw); seg3(P['kne' + n], P['ank' + n], limbW * 1.05, shinCol, lw); if (spec.bottom?.type === 'shalwar') seg3(P['kne' + n], P['ank' + n], limbW * 1.45, bot, lw); foot(P['ank' + n], P['toe' + n], limbW, shoe, lw, spec.shoeStripe); } });
    const dArm = (P['sho' + n].d + P['wri' + n].d) / 2 + (P['wri' + n].d > 0 ? 2 : -2);
    parts.push({ d: dArm, f: () => { seg3(P['sho' + n], P['elb' + n], limbW * 1.1, top, lw); seg3(P['elb' + n], P['wri' + n], limbW * 0.95, longSleeve ? top : skin, lw); if (longSleeve && spec.cuff) seg3(lerpP(P['elb' + n], P['wri' + n], .82), P['wri' + n], limbW * 1.0, spec.cuff, lw); hand(P['elb' + n], P['wri' + n], limbW * 0.62, skin, lw, pose['hand' + n], side, a); if (spec.kara && n === 'R') { C.strokeStyle = '#c9ced6'; C.lineWidth = lw * 1.6; const w = lerpP(P['elb' + n], P['wri' + n], .9); circle(w.x, w.y, limbW * 0.42); C.stroke(); } } });
  }
  parts.push({ d: 0, f: () => drawTorso(spec, S, pose, P, a, lw, top, bot, skin) });
  parts.sort((p, q) => p.d - q.d);
  // power aura + cape behind everything
  if (spec.aura) { const k = spec.aura * (opt.power ?? 1); if (k > 0) { const cy = P.chest.y, R = S.H * 0.75 * (1 + 0.04 * Math.sin(t * 9)); C.save(); C.globalAlpha *= k; C.fillStyle = rgrad(P.chest.x, cy, 0, R, [[0, 'rgba(255,214,90,0.75)'], [0.5, 'rgba(255,190,60,0.35)'], [1, 'rgba(255,190,60,0)']]); circle(P.chest.x, cy, R); C.fill(); C.restore(); } }
  const capeFront = Math.cos(a) < -0.15; if (spec.cape && (opt.power ?? 1) > 0 && !capeFront) drawCape(spec, S, pose, P, a, lw, t, opt.power ?? 1);
  // back hair/hood behind everything
  drawHeadBack(spec, S, pose, P, a, lw);
  for (const p of parts) p.f();
  if (spec.cape && (opt.power ?? 1) > 0 && capeFront) drawCape(spec, S, pose, P, a, lw, t, opt.power ?? 1);
  if (pose.holding === 'phone') { const w = lerpP(P.wriL, P.wriR, 0.5), hw = S.hr * 0.32, hh = S.hr * 0.55; C.save(); C.translate(w.x, w.y - hh * 0.35); rr(-hw, -hh, hw * 2, hh * 2, hw * 0.35); fillPath('#222', OUT, lw); rr(-hw * 0.78, -hh * 0.84, hw * 1.56, hh * 1.68, hw * 0.2); fillPath(spec.phoneGlow || '#7fd3ff'); C.restore(); for (const n of ['L', 'R']) hand(P['elb' + n], P['wri' + n], S.H * 0.045 * S.B.limb * 0.62, spec.skin, lw, 'open', 1, a); }
  drawHead(spec, S, pose, P, a, lw, t);
  C.restore();
  return S;
}
function drawCape(spec, S, pose, P, a, lw, t, k) {
  const sl = P.shoL, sr = P.shoR, top = (sl.y + sr.y) / 2 + S.hr * 0.1, cx = (sl.x + sr.x) / 2, w0 = Math.max(Math.abs(sl.x - sr.x) * 0.55, S.sh * 0.5);
  const side = Math.sin(a), trail = -side * S.H * 0.18 - (pose.lean || 0) * S.H * 0.3, bot = top + S.H * 0.62 * Math.max(0.75, 1 - Math.abs(side) * 0.15);
  const w1 = Math.sin(t * 8) * S.H * 0.035, w2 = Math.sin(t * 8 + 1.6) * S.H * 0.04, wb = w0 * (2.3 - Math.abs(side) * 0.8) + Math.abs(side) * S.H * 0.05;
  C.save(); C.globalAlpha *= k; C.beginPath(); C.moveTo(cx - w0, top);
  C.quadraticCurveTo(cx - wb + trail * 0.5, (top + bot) / 2, cx - wb + trail + w1, bot); C.quadraticCurveTo(cx + trail * 0.6, bot + w2, cx + wb + trail + w2, bot - S.hr * 0.1);
  C.quadraticCurveTo(cx + wb + trail * 0.5, (top + bot) / 2, cx + w0, top); C.closePath();
  C.fillStyle = grad(0, top, 0, bot, [[0, spec.cape], [1, shade(spec.cape, -0.35)]]); C.fill(); C.strokeStyle = OUT; C.lineWidth = lw; C.stroke(); C.restore();
}
function lerpP(p, q, k) { return { x: lerp(p.x, q.x, k), y: lerp(p.y, q.y, k), d: lerp(p.d, q.d, k) }; }
function seg3(p, q, w, col, lw) {
  C.lineCap = 'round'; C.beginPath(); C.moveTo(p.x, p.y); C.lineTo(q.x, q.y); C.strokeStyle = OUT; C.lineWidth = w + lw * 2; C.stroke();
  C.beginPath(); C.moveTo(p.x, p.y); C.lineTo(q.x, q.y); C.strokeStyle = col; C.lineWidth = w; C.stroke();
}
function foot(ank, toe, w, col, lw, stripe) {
  const dx = toe.x - ank.x, dy = toe.y - ank.y, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
  C.save(); C.translate(ank.x, ank.y + w * 0.15); C.rotate(len > w * 0.6 ? ang * 0.5 : 0);
  const fl = Math.max(len, w * 0.75); C.beginPath(); C.ellipse(len > w * 0.6 ? fl * 0.38 * Math.sign(dx || 1) : 0, w * 0.15, Math.max(fl * 0.62, w * 0.62), w * 0.48, 0, 0, TAU);
  fillPath(col, OUT, lw); if (stripe) { C.strokeStyle = stripe; C.lineWidth = w * 0.18; C.beginPath(); C.ellipse(len > w * 0.6 ? fl * 0.38 * Math.sign(dx || 1) : 0, w * 0.15, Math.max(fl * 0.62, w * 0.62) * 0.7, w * 0.48 * 0.45, 0, 0.15 * Math.PI, 0.85 * Math.PI); C.stroke(); } C.restore();
}
function hand(elb, wri, r, skin, lw, kind, side, a) {
  const dx = wri.x - elb.x, dy = wri.y - elb.y, ang = Math.atan2(dy, dx);
  const cx = wri.x + Math.cos(ang) * r * 0.55, cy = wri.y + Math.sin(ang) * r * 0.55;
  C.save(); C.translate(cx, cy); C.rotate(ang - Math.PI / 2);
  if (kind === 'point') { rr(-r * 0.22, r * 0.3, r * 0.44, r * 1.35, r * 0.22); fillPath(skin, OUT, lw); }
  if (kind === 'thumb') { rr(-r * 0.2, -r * 1.45, r * 0.42, r * 1.1, r * 0.2); fillPath(skin, OUT, lw); }
  circle(0, 0, r * (kind === 'fist' ? 0.95 : 1)); fillPath(skin, OUT, lw);
  if (kind === 'open') { C.beginPath(); C.moveTo(-r * 0.3, r * 0.55); C.lineTo(-r * 0.3, r * 0.95); C.moveTo(r * 0.05, r * 0.6); C.lineTo(r * 0.05, r * 1.0); C.strokeStyle = shade(skin, -0.3); C.lineWidth = lw * 0.7; C.stroke(); }
  if (kind === 'fist') { C.beginPath(); C.arc(0, r * 0.1, r * 0.55, 0.2, Math.PI - 0.2); C.strokeStyle = shade(skin, -0.3); C.lineWidth = lw * 0.7; C.stroke(); }
  C.restore();
}

function drawTorso(spec, S, pose, P, a, lw, top, bot, skin) {
  const ca = Math.abs(Math.cos(a)), sa = Math.sin(a);
  const depth = S.sh * 0.8 * S.B.w; const belly = S.B.belly * S.H * 0.32;
  const levels = [ // [joint-ish point (3D), half width X, half depth Z, belly push]
    [S.J.hipL && [0, S.hr * 0.25, 0], S.hipW * 1.12, depth * 0.85, 0],
    [[0, 0, 0], S.hipW * 1.05, depth * 0.9, belly * 0.6],
    [[0, -S.torso * 0.38, 0], S.sh * (0.82 + S.B.belly * 1.4), depth * (1 + S.B.belly * 0.9), belly],
    [[0, -S.torso * 0.72, 0], S.sh * 1.0, depth, belly * 0.3],
    [[0, -S.torso * 0.93, 0], S.sh * 0.92, depth * 0.8, 0],
  ];
  const up = v => rotZ(rotX(v, pose.lean), pose.roll);
  const Lp = [], Rp = [];
  levels.forEach(([c, hx, hz, bp], i) => {
    const pc = proj(up(i < 2 ? c : c), a); const ext = Math.sqrt((hx * Math.cos(a)) ** 2 + (hz * Math.sin(a)) ** 2);
    const push = bp * sa; // belly sticks out toward facing direction
    Lp.push([pc.x - ext + Math.min(0, push), pc.y]); Rp.push([pc.x + ext + Math.max(0, push), pc.y]);
  });
  // bottom garment (pelvis / skirt / kurta hem)
  const type = spec.top?.type || 'shirt', bt = spec.bottom?.type || 'pants';
  const hipC = P.hip;
  if (bt === 'skirt' || bt === 'dress') { const hw = Math.abs(Lp[1][0] - Rp[1][0]) / 2; poly([[Lp[1][0], Lp[1][1]], [Rp[1][0], Rp[1][1]], [hipC.x + hw * 1.6, hipC.y + S.thigh * 1.05], [hipC.x - hw * 1.6, hipC.y + S.thigh * 1.05]]); fillPath(bot, OUT, lw); }
  else { smoothPoly([Lp[0], Lp[1], [ (Lp[1][0] + Rp[1][0]) / 2, Lp[1][1] - S.hr * 0.1], Rp[1], Rp[0], [(Lp[0][0] + Rp[0][0]) / 2, Lp[0][1] + S.hr * 0.3]]); fillPath(bot, OUT, lw); }
  // upper body
  const hem = type === 'kurta' || type === 'dress' || type === 'coat' ? S.thigh * (type === 'kurta' ? 0.95 : type === 'coat' ? 0.7 : 1.05) : S.hr * 0.18;
  const pts = [[Lp[0][0] - (hem > S.hr ? S.hr * 0.25 : 0), Lp[0][1] + hem], ...Lp.slice(1), ...Rp.slice(1).reverse(), [Rp[0][0] + (hem > S.hr ? S.hr * 0.25 : 0), Rp[0][1] + hem]];
  smoothPoly(pts.map(p => p), true); fillPath(top, OUT, lw);
  // front details: visible when facing camera
  const front = Math.cos(a); if (front > 0.15) {
    const fx = (v) => proj(up(v), a); const nk = fx([0, -S.torso * 0.93, depth * 0.9]), mid = fx([0, -S.torso * 0.35, depth * (1 + S.B.belly * 2)]);
    C.save(); C.globalAlpha = clamp((front - 0.15) * 3);
    if (type === 'suit' || type === 'coat') { // lapels + shirt + tie
      const w = S.sh * 0.42 * front; poly([[nk.x - w, nk.y], [nk.x + w, nk.y], [nk.x, mid.y - S.hr * 0.2]]); fillPath(spec.shirt || '#f4f4f4', OUT, lw * 0.8);
      if (spec.tie) { poly([[nk.x - w * 0.18, nk.y + S.hr * 0.05], [nk.x + w * 0.18, nk.y + S.hr * 0.05], [nk.x + w * 0.24, mid.y - S.hr * 0.5], [nk.x, mid.y - S.hr * 0.25], [nk.x - w * 0.24, mid.y - S.hr * 0.5]]); fillPath(spec.tie, OUT, lw * 0.6); }
      C.strokeStyle = shade(top, -0.35); C.lineWidth = lw; C.beginPath(); C.moveTo(nk.x - w * 1.25, nk.y); C.lineTo(nk.x - w * 0.15, mid.y); C.moveTo(nk.x + w * 1.25, nk.y); C.lineTo(nk.x + w * 0.15, mid.y); C.stroke();
    }
    if (type === 'hoodie') { if (!spec.collar) { C.strokeStyle = '#fff'; C.lineWidth = lw * 1.1; C.beginPath(); C.moveTo(nk.x - S.sh * 0.18, nk.y + 4); C.lineTo(nk.x - S.sh * 0.2, nk.y + S.hr * 0.75); C.moveTo(nk.x + S.sh * 0.18, nk.y + 4); C.lineTo(nk.x + S.sh * 0.2, nk.y + S.hr * 0.75); C.stroke(); } rr(mid.x - S.sh * 0.5, mid.y + S.hr * 0.1, S.sh, S.hr * 0.55, S.hr * 0.15); fillPath(shade(top, -0.12), OUT, lw * 0.6); }
    if (type === 'kurta') { C.strokeStyle = shade(top, -0.3); C.lineWidth = lw; C.beginPath(); C.moveTo(nk.x, nk.y); C.lineTo(nk.x, nk.y + S.hr * 0.9); C.stroke(); for (let i = 0; i < 3; i++) { circle(nk.x, nk.y + S.hr * (0.25 + i * 0.25), lw * 0.9); fillPath(spec.accent || '#e9c46a'); } }
    if (type === 'vest') { const g = fx([0, -S.torso * 0.45, depth]); C.fillStyle = '#d7ff3a'; for (const s of [-1, 1]) { poly([[nk.x + s * S.sh * 0.15, nk.y], [nk.x + s * S.sh * 0.85 * front, nk.y + S.hr * 0.2], [g.x + s * S.sh * 0.85 * front, Lp[1][1]], [g.x + s * S.sh * 0.12, Lp[1][1]]]); fillPath('#ff8a1f', OUT, lw * 0.7); } C.fillStyle = '#e8e8e8'; C.fillRect(Lp[2][0] + 4, mid.y + S.hr * 0.2, Rp[2][0] - Lp[2][0] - 8, S.hr * 0.16); }
    if (type === 'uniform') { const b = fx([0, -S.torso * 0.6, depth]); C.fillStyle = '#e9c46a'; poly([[b.x + S.sh * 0.35, b.y - 6], [b.x + S.sh * 0.55, b.y - 6], [b.x + S.sh * 0.45, b.y + 16]]); C.fill(); C.strokeStyle = shade(top, -0.4); C.lineWidth = lw; C.beginPath(); C.moveTo(nk.x, nk.y); C.lineTo(nk.x, Lp[1][1]); C.stroke(); }
    if (spec.emblem) { const e = fx([0, -S.torso * 0.6, depth]); C.save(); C.translate(e.x, e.y); C.scale(front, 1); spec.emblem(S.hr * 0.45); C.restore(); }
    if (type === 'shirt' && spec.buttons !== false) { C.fillStyle = shade(top, -0.35); for (let i = 0; i < 3; i++) { circle(nk.x, nk.y + S.hr * (0.35 + i * 0.4), lw * 0.75); C.fill(); } C.strokeStyle = shade(top, -0.3); C.lineWidth = lw; C.beginPath(); C.moveTo(nk.x - S.sh * 0.3, nk.y - 2); C.lineTo(nk.x, nk.y + S.hr * 0.22); C.lineTo(nk.x + S.sh * 0.3, nk.y - 2); C.stroke(); }
    if (spec.collar) { const w = S.sh * 0.62 * front; poly([[nk.x - w, nk.y - S.hr * 0.05], [nk.x + w, nk.y - S.hr * 0.05], [nk.x, nk.y + S.hr * 0.75]]); fillPath(spec.collar, OUT, lw * 0.8); if (spec.top?.type === 'hoodie') { C.strokeStyle = '#eee'; C.lineWidth = lw * 1.2; C.beginPath(); C.moveTo(nk.x - S.sh * 0.2, nk.y + S.hr * 0.3); C.lineTo(nk.x - S.sh * 0.2, nk.y + S.hr * 0.95); C.moveTo(nk.x + S.sh * 0.2, nk.y + S.hr * 0.3); C.lineTo(nk.x + S.sh * 0.2, nk.y + S.hr * 0.9); C.stroke(); circle(nk.x - S.sh * 0.2, nk.y + S.hr * 0.97, lw * 1.1); fillPath('#eee'); circle(nk.x + S.sh * 0.2, nk.y + S.hr * 0.92, lw * 1.1); fillPath('#eee'); } }
    if (spec.necklace) { C.strokeStyle = spec.necklace; C.lineWidth = lw * 1.1; C.beginPath(); C.moveTo(nk.x - S.sh * 0.42 * front, nk.y); C.quadraticCurveTo(nk.x, nk.y + S.hr * 0.55, nk.x + S.sh * 0.42 * front, nk.y); C.stroke(); }
    if (spec.dupatta && spec.dupattaStyle !== 'sides') { C.strokeStyle = spec.dupatta; C.lineCap = 'round'; C.lineWidth = S.hr * 0.32; C.beginPath(); C.moveTo(Lp[4][0], Lp[4][1]); C.quadraticCurveTo(mid.x, mid.y + S.hr * 0.2, Rp[4][0], Rp[4][1]); C.stroke(); }
    C.restore();
  }
  if (spec.dupatta && spec.dupattaStyle === 'sides') { const ext = S.H * 0.06; for (const [p0, sgn] of [[Lp[4], -1], [Rp[4], 1]]) { C.beginPath(); C.moveTo(p0[0] - sgn * S.sh * 0.25, p0[1] - S.hr * 0.05); C.quadraticCurveTo(p0[0] + sgn * ext * 1.1, p0[1] + S.H * 0.2, p0[0] + sgn * ext * 0.6, Lp[0][1] + S.hr * 0.4); C.lineTo(p0[0] + sgn * ext * 0.6 - sgn * S.hr * 0.5, Lp[0][1] + S.hr * 0.35); C.quadraticCurveTo(p0[0], p0[1] + S.H * 0.15, p0[0] + sgn * S.sh * 0.1, p0[1]); C.closePath(); fillPath(spec.dupatta, OUT, lw); } }
  if (spec.belt) { const w1 = proj(up([0, -S.hr * 0.02, 0]), a); C.fillStyle = spec.belt; C.fillRect(Lp[1][0] + lw, w1.y - S.hr * 0.09, Rp[1][0] - Lp[1][0] - lw * 2, S.hr * 0.16); }
  // neck
  seg3(P.neck, lerpP(P.neck, P.head, 0.45), S.hr * 0.55, spec.skin || '#c68a5a', lw);
}

// ---------------- HEAD & FACE ----------------
function headFrame(S, pose, P, a) { const h = a + pose.head.yaw; return { c: P.head, h, pitch: pose.head.pitch, roll: pose.head.roll + pose.roll * 0.6 }; }
function onHead(S, F, lon, lat, rr = 1) { // spherical point → screen offset from head centre, with visibility
  const r = S.hr * rr; const la = lat - F.pitch * 0.9; const v = [r * Math.sin(lon) * Math.cos(la), -r * Math.sin(la), r * Math.cos(lon) * Math.cos(la)];
  const q = proj(v, F.h); return { x: q.x, y: q.y, vis: q.d / r, fx: Math.max(0, q.d / r) };
}
function drawHeadBack(spec, S, pose, P, a, lw) {
  const F = headFrame(S, pose, P, a); const hs = spec.hair?.style, hc = spec.hair?.color || '#2b1a10', r = S.hr;
  C.save(); C.translate(F.c.x, F.c.y); C.rotate(F.roll);
  if (hs === 'long' || hs === 'ponytail' || hs === 'bun' || hs === 'curly' || hs === 'afro' || hs === 'bigcurls') {
    const back = -Math.sin(F.h) * r * 0.3;
    if (hs === 'long') { rr(-r * 1.08 + back, -r * 0.4, r * 2.16, r * 2.1, r * 0.9); fillPath(hc, OUT, lw); }
    if (hs === 'ponytail') { const px = -Math.sin(F.h) * r * 1.0; C.beginPath(); C.ellipse(px, r * 0.15 + Math.sin(F.h * 2) * 2, r * 0.32, r * 0.75, -Math.sin(F.h) * 0.6, 0, TAU); fillPath(hc, OUT, lw); }
    if (hs === 'bun') { const bx = -Math.sin(F.h) * r * 0.75; circle(bx, -r * 0.55 - Math.abs(Math.cos(F.h)) * r * 0.25, r * 0.42); fillPath(hc, OUT, lw); }
    if (hs === 'afro') { circle(back * 0.5, -r * 0.15, r * 1.42); fillPath(hc, OUT, lw); }
    if (hs === 'bigcurls') { const bk = [[-0.9, -0.36, 0.36], [0.9, -0.36, 0.36], [-0.72, -0.78, 0.4], [0.72, -0.78, 0.4], [-0.36, -1.04, 0.42], [0.36, -1.04, 0.42], [0, -1.12, 0.4], [-0.98, 0.08, 0.26], [0.98, 0.08, 0.26]]; for (const [x, y, rr2] of bk) { circle(x * r + back * 0.3, y * r, rr2 * r); fillPath(hc, OUT, lw); } for (const [x, y, rr2] of bk) { circle(x * r + back * 0.3, y * r, rr2 * r - lw); C.fillStyle = hc; C.fill(); } }
    if (hs === 'curly') { for (let i = 0; i < 9; i++) { const an = Math.PI * (0.85 + i * 0.165); circle(Math.cos(an) * r * 0.98 + back * 0.4, Math.sin(an) * r * 0.9 - r * 0.05, r * 0.36); fillPath(hc, OUT, lw); } }
  }
  if (spec.hijab) { C.beginPath(); C.ellipse(-Math.sin(F.h) * r * 0.08, r * 0.1, r * 1.22, r * 1.35, 0, 0, TAU); fillPath(spec.hijab, OUT, lw); C.beginPath(); C.moveTo(-r * 1.2, r * 0.5); C.quadraticCurveTo(0, r * 2.2, r * 1.2, r * 0.5); C.lineTo(r * 1.0, r * 1.6); C.lineTo(-r * 1.0, r * 1.6); fillPath(spec.hijab, OUT, lw); }
  if (spec.top?.type === 'hoodie' && spec.hood !== false) { C.beginPath(); C.ellipse(-Math.sin(F.h) * r * 0.25, r * 0.95, r * 0.95, r * 0.42, 0, 0, TAU); fillPath(spec.hoodLining || shade(spec.top.color, -0.2), OUT, lw); }
  C.restore();
}
function drawHead(spec, S, pose, P, a, lw, t) {
  const F = headFrame(S, pose, P, a), r = S.hr, skin = spec.skin || '#c68a5a', hc = spec.hair?.color || '#2b1a10', hs = spec.hair?.style || 'short';
  const face = pose.face || {}; const ex = EXPR[face.expr] || EXPR.neutral;
  const vis = Math.cos(F.h); // >0 face toward camera
  C.save(); C.translate(F.c.x, F.c.y); C.rotate(F.roll);
  // ears (behind head when turned away)
  for (const s of [1, -1]) { const e = onHead(S, F, s * Math.PI / 2, 0.02); if (e.vis > -0.55) { C.beginPath(); C.ellipse(e.x, e.y + r * 0.05, r * 0.17 * (0.4 + Math.abs(e.vis) * 0.6 + (1 - Math.abs(vis)) * 0.4), r * 0.24, 0, 0, TAU); fillPath(skin, OUT, lw); if (spec.earrings) { circle(e.x, e.y + r * 0.32, r * 0.07); fillPath(spec.earrings, OUT, lw * 0.5); } } }
  // head shape (slightly egg) + jaw
  C.beginPath(); C.ellipse(0, 0, r * (spec.headW || 0.98), r * (spec.headH || 1.0), 0, 0, TAU); fillPath(skin, OUT, lw);
  if (vis < -0.25 && !spec.hijab) { // back of head: hair covers
    if (hs === 'bigcurls') { for (const [x, y, rr2] of [[-0.6, -0.5, 0.5], [0.6, -0.5, 0.5], [0, -0.8, 0.55], [-0.75, 0.1, 0.42], [0.75, 0.1, 0.42], [0, -0.1, 0.6], [-0.35, 0.4, 0.4], [0.35, 0.4, 0.4]]) { circle(x * r, y * r, rr2 * r); fillPath(hc, OUT, lw); } }
    else if (hs === 'balding') { C.save(); C.beginPath(); C.ellipse(0, 0, r * 0.98, r, 0, 0, TAU); C.clip(); C.fillStyle = hc; C.fillRect(-r, -r * 0.05, r * 2, r * 0.75); C.restore(); }
    else if (hs !== 'bald') { C.beginPath(); C.ellipse(0, -r * 0.08, r * 1.0, r * 0.98, 0, 0, TAU); fillPath(hc, OUT, lw); }
    if (spec.hat) drawHat(spec, S, F, lw); C.restore(); return;
  }
  const fa = clamp(vis * 1.6 + 0.4); // face alpha
  if (spec.hijab) { C.save(); C.beginPath(); C.ellipse(Math.sin(F.h) * r * 0.3, r * 0.08, r * 0.78 * (0.55 + 0.45 * Math.abs(vis)), r * 0.86, 0, 0, TAU); C.clip(); C.fillStyle = skin; C.fillRect(-r * 2, -r * 2, r * 4, r * 4); drawFace(spec, S, F, face, ex, lw, t, fa); C.restore(); C.beginPath(); C.ellipse(Math.sin(F.h) * r * 0.3, r * 0.08, r * 0.78 * (0.55 + 0.45 * Math.abs(vis)), r * 0.86, 0, 0, TAU); C.strokeStyle = shade(spec.hijab, -0.35); C.lineWidth = lw * 1.4; C.stroke(); C.restore(); return; }
  drawFace(spec, S, F, face, ex, lw, t, fa);
  drawHairFront(spec, S, F, lw, hs, hc);
  if (spec.hat) drawHat(spec, S, F, lw);
  C.restore();
}
function drawHairFront(spec, S, F, lw, hs, hc) {
  const r = S.hr, sx = Math.sin(F.h) * r * 0.55, vis = Math.cos(F.h);
  C.save(); C.beginPath(); C.ellipse(0, 0, r * 1.04, r * 1.04, 0, 0, TAU); if (hs !== 'afro' && hs !== 'curly' && hs !== 'spiky' && hs !== 'bigcurls') C.clip();
  const cap = (yTop, depth, part) => { C.beginPath(); C.moveTo(-r * 1.1, -r * 0.05 + depth * 0.2); C.bezierCurveTo(-r * 1.1, -r * 1.35, r * 1.1, -r * 1.35, r * 1.1, -r * 0.05 + depth * 0.2); C.bezierCurveTo(r * 0.7 + sx * .3, yTop, sx + r * 0.3, yTop - r * 0.12, sx + (part || 0), yTop - r * 0.05); C.bezierCurveTo(sx - r * 0.3, yTop - r * 0.12, -r * 0.7 + sx * .3, yTop, -r * 1.1, -r * 0.05 + depth * 0.2); C.closePath(); fillPath(hc, OUT, lw); };
  if (hs === 'short') cap(-r * 0.5, 0, r * 0.2);
  if (hs === 'side') { cap(-r * 0.42, 0, -r * 0.25); C.strokeStyle = shade(hc, 0.25); C.lineWidth = lw; C.beginPath(); C.moveTo(sx - r * 0.25, -r * 0.95); C.quadraticCurveTo(sx + r * 0.2, -r * 0.6, sx + r * 0.8, -r * 0.5); C.stroke(); }
  if (hs === 'long' || hs === 'ponytail' || hs === 'bun') { C.beginPath(); C.moveTo(-r * 1.08, r * 0.15); C.bezierCurveTo(-r * 1.2, -r * 1.4, r * 1.2, -r * 1.4, r * 1.08, r * 0.15); C.quadraticCurveTo(r * 0.85, -r * 0.45, sx + r * 0.05, -r * 0.62); C.quadraticCurveTo(-r * 0.85, -r * 0.45, -r * 1.08, r * 0.15); fillPath(hc, OUT, lw); C.strokeStyle = shade(hc, 0.3); C.lineWidth = lw * .8; C.beginPath(); C.moveTo(sx, -r * 1.0); C.lineTo(sx + r * 0.05, -r * 0.62); C.stroke(); }
  if (hs === 'curly') { for (let i = 0; i < 8; i++) { const an = Math.PI * (1.08 + i * 0.12); circle(Math.cos(an) * r * 0.82 + sx * 0.4, Math.sin(an) * r * 0.8 - r * 0.05, r * 0.33); fillPath(hc, OUT, lw); } C.beginPath(); C.moveTo(sx - r * 0.5, -r * 0.62); C.quadraticCurveTo(sx + r * 0.1, -r * 0.35, sx + r * 0.55, -r * 0.6); C.quadraticCurveTo(sx + r * 0.2, -r * 0.95, sx - r * 0.5, -r * 0.62); fillPath(hc, OUT, lw); }
  if (hs === 'bigcurls') { const fr = [[-0.78, -0.68, 0.27], [-0.42, -0.9, 0.3], [0, -0.97, 0.3], [0.42, -0.9, 0.29], [0.78, -0.66, 0.26], [-0.93, -0.25, 0.19], [0.93, -0.25, 0.18]]; for (const [x, y, rr2] of fr) { circle(x * r + sx * 0.35, y * r, rr2 * r); fillPath(hc, OUT, lw); } for (const [x, y, rr2] of fr) { circle(x * r + sx * 0.35, y * r, rr2 * r - lw); C.fillStyle = hc; C.fill(); }
    C.beginPath(); C.moveTo(-0.71 * r + sx * .4, -0.62 * r); C.quadraticCurveTo(-0.38 * r + sx * .4, -1.06 * r, 0.21 * r + sx * .4, -0.84 * r); C.quadraticCurveTo(0.6 * r + sx * .4, -0.68 * r, 0.46 * r + sx * .4, -0.44 * r); C.quadraticCurveTo(0.3 * r + sx * .4, -0.62 * r, 0.04 * r + sx * .4, -0.58 * r); C.quadraticCurveTo(-0.29 * r + sx * .4, -0.54 * r, -0.44 * r + sx * .4, -0.36 * r); C.closePath(); fillPath(hc, OUT, lw);
    C.strokeStyle = spec.hair.color2 || shade(hc, 0.25); C.lineWidth = lw * 1.1; C.beginPath(); C.moveTo(-0.38 * r + sx * .4, -0.67 * r); C.quadraticCurveTo(-0.25 * r + sx * .4, -0.78 * r, -0.1 * r + sx * .4, -0.7 * r); C.moveTo(0.1 * r + sx * .4, -0.71 * r); C.quadraticCurveTo(0.25 * r + sx * .4, -0.77 * r, 0.35 * r + sx * .4, -0.63 * r); C.stroke(); }
  if (hs === 'spiky') { C.beginPath(); C.moveTo(-r * 1.0, -r * 0.2); for (let i = 0; i <= 6; i++) { const xx = lerp(-r * 1.0, r * 1.0, i / 6) + sx * 0.3; C.lineTo(xx - r * 0.12, -r * (0.95 + (i % 2) * 0.25)); C.lineTo(xx + r * 0.05, -r * 0.55); } C.lineTo(r * 1.0, -r * 0.2); C.quadraticCurveTo(0, -r * 0.9, -r * 1.0, -r * 0.2); fillPath(hc, OUT, lw); }
  if (hs === 'afro') { C.beginPath(); C.arc(sx * 0.3, -r * 0.35, r * 1.18, Math.PI * 1.02, Math.PI * 1.98); C.quadraticCurveTo(sx * .3, -r * 0.6, -r * 1.15, -r * 0.3); fillPath(hc, OUT, lw); }
  if (hs === 'balding') { C.beginPath(); C.ellipse(-r * 0.92 + sx * 0.2, -r * 0.05, r * 0.2, r * 0.42, 0.2, 0, TAU); C.ellipse(r * 0.92 + sx * 0.2, -r * 0.05, r * 0.2, r * 0.42, -0.2, 0, TAU); fillPath(hc, OUT, lw); C.fillStyle = 'rgba(255,255,255,0.25)'; C.beginPath(); C.ellipse(sx * 0.3 - r * 0.25, -r * 0.65, r * 0.22, r * 0.1, -0.4, 0, TAU); C.fill(); }
  if (hs === 'bald') { C.fillStyle = 'rgba(255,255,255,0.25)'; C.beginPath(); C.ellipse(sx * 0.3 - r * 0.25, -r * 0.65, r * 0.22, r * 0.1, -0.4, 0, TAU); C.fill(); }
  C.restore();
}
function drawHat(spec, S, F, lw) {
  const r = S.hr, sx = Math.sin(F.h) * r * 0.4, h = spec.hat;
  if (h.type === 'hardhat') { C.beginPath(); C.ellipse(sx * 0.3, -r * 0.42, r * 1.32, r * 0.2, 0, 0, TAU); fillPath(h.color || '#f5c400', OUT, lw); C.beginPath(); C.arc(sx * 0.2, -r * 0.45, r * 1.0, Math.PI, 0); fillPath(h.color || '#f5c400', OUT, lw); rr(sx * 0.2 - r * 0.12, -r * 1.42, r * 0.24, r * 0.95, r * 0.1); fillPath(shade(h.color || '#f5c400', -0.15), OUT, lw * 0.6); }
  if (h.type === 'cap') { C.beginPath(); C.arc(0, -r * 0.35, r * 0.98, Math.PI, 0); fillPath(h.color || '#c1121f', OUT, lw); C.beginPath(); C.ellipse(sx * 1.6, -r * 0.36, r * (0.4 + 0.5 * Math.abs(Math.cos(F.h))), r * 0.14, 0, 0, TAU); fillPath(shade(h.color || '#c1121f', -0.2), OUT, lw); }
  if (h.type === 'police') { rr(-r * 1.0, -r * 1.05, r * 2.0, r * 0.62, r * 0.12); fillPath(h.color || '#14213d', OUT, lw); C.beginPath(); C.ellipse(sx * 0.6, -r * 0.42, r * 1.1, r * 0.15, 0, 0, TAU); fillPath('#111', OUT, lw); circle(sx * 0.5, -r * 0.75, r * 0.15); fillPath('#e9c46a', OUT, lw * 0.5); }
  if (h.type === 'turban') { C.beginPath(); C.ellipse(0, -r * 0.5, r * 1.12, r * 0.85, 0, Math.PI * 1.0, Math.PI * 2); C.lineTo(r * 1.05, -r * 0.25); C.quadraticCurveTo(0, -r * 0.55, -r * 1.05, -r * 0.25); fillPath(h.color || '#f77f00', OUT, lw); C.strokeStyle = shade(h.color || '#f77f00', -0.25); C.lineWidth = lw; C.beginPath(); C.moveTo(-r * 0.9, -r * 0.45); C.quadraticCurveTo(sx, -r * 1.2, r * 0.9, -r * 0.75); C.stroke(); }
  if (h.type === 'crown') { C.save(); C.translate(sx * 0.4, -r * (h.float ? 1.6 : 1.25) + Math.sin((h.t || 0) * 5) * r * 0.08); if (h.glow) { C.shadowColor = 'rgba(255,240,180,0.95)'; C.shadowBlur = r * 0.35; } poly([[-r * 0.6, 0], [-r * 0.6, -r * 0.5], [-r * 0.3, -r * 0.2], [0, -r * 0.6], [r * 0.3, -r * 0.2], [r * 0.6, -r * 0.5], [r * 0.6, 0]]); fillPath('#f2c230', OUT, lw); C.restore(); }
}

// expressions: brows (inner raise, outer raise, angle), eyes (open 0..1.4, type), mouth default shape, extras
const EXPR = {
  neutral: { bi: 0, bo: 0, eye: 1, eyeT: 'n', mouth: 'flat', pupil: 1 },
  happy: { bi: 0.1, bo: 0.05, eye: 0.85, eyeT: 'n', mouth: 'smile', pupil: 1, blush: 0.3 },
  laugh: { bi: 0.2, bo: 0.1, eye: 0, eyeT: 'arc', mouth: 'laugh', pupil: 1, blush: 0.5 },
  sad: { bi: 0.35, bo: -0.2, eye: 0.75, eyeT: 'n', mouth: 'frown', pupil: 1.05, gazeY: 0.25 },
  cry: { bi: 0.45, bo: -0.25, eye: 0.35, eyeT: 'squeeze', mouth: 'wail', pupil: 1, tears: 1 },
  angry: { bi: -0.45, bo: 0.2, eye: 0.8, eyeT: 'n', mouth: 'grit', pupil: 0.8, vein: 1 },
  shout: { bi: -0.35, bo: 0.15, eye: 1.05, eyeT: 'n', mouth: 'shout', pupil: 0.75 },
  surprised: { bi: 0.55, bo: 0.5, eye: 1.35, eyeT: 'n', mouth: 'o', pupil: 0.65 },
  scared: { bi: 0.6, bo: 0.1, eye: 1.3, eyeT: 'n', mouth: 'wavy', pupil: 0.55, sweat: 1 },
  thinking: { bi: 0.3, bo: -0.1, eye: 0.85, eyeT: 'n', mouth: 'side', pupil: 1, gazeY: -0.4, gazeX: 0.4, oneBrow: 1 },
  smug: { bi: -0.1, bo: 0.15, eye: 0.6, eyeT: 'n', mouth: 'smirk', pupil: 1, oneBrow: 1 },
  wink: { bi: 0.1, bo: 0.1, eye: 1, eyeT: 'wink', mouth: 'grin', pupil: 1 },
  disgust: { bi: -0.2, bo: -0.1, eye: 0.6, eyeT: 'n', mouth: 'wavy', pupil: 1, oneBrow: 1 },
  sleepy: { bi: 0, bo: -0.15, eye: 0.3, eyeT: 'n', mouth: 'o-small', pupil: 1 },
  love: { bi: 0.2, bo: 0.1, eye: 1, eyeT: 'heart', mouth: 'smile', pupil: 1, blush: 0.7 },
  determined: { bi: -0.3, bo: 0.1, eye: 0.85, eyeT: 'n', mouth: 'flat', pupil: 0.9 },
};
const VISEMES = ['rest', 'MBP', 'AI', 'E', 'O', 'U', 'FV', 'L', 'WQ', 'etc'];
function drawFace(spec, S, F, face, ex, lw0, t, fa) {
  const lw = lw0 * 0.8; const r = S.hr, A = S.A, eyeR = r * 0.25 * A.eye * (spec.eyeScale || 1);
  C.save(); C.globalAlpha *= fa;
  const blink = face.blink || 0; const gz = face.gaze || [0, 0];
  const gaze = [clamp(gz[0] + (ex.gazeX || 0), -1, 1), clamp(gz[1] + (ex.gazeY || 0), -1, 1)];
  for (const s of [1, -1]) {
    const e = onHead(S, F, s * 0.4, 0.12, 0.84); if (e.vis < 0.05) continue; const fx = clamp(e.vis * 1.3, 0.5, 1);
    const open = ex.eyeT === 'wink' && s < 0 ? 0 : clamp(ex.eye * (1 - blink), 0, 1.4);
    C.save(); C.translate(e.x, e.y);
    if (ex.eyeT === 'arc' || (ex.eyeT === 'wink' && s < 0)) { C.beginPath(); C.arc(0, eyeR * 0.3, eyeR * 0.75 * fx, Math.PI * 1.15, Math.PI * 1.85); C.strokeStyle = OUT; C.lineWidth = lw * 1.3; C.lineCap = 'round'; C.stroke(); }
    else if (ex.eyeT === 'squeeze') { C.strokeStyle = OUT; C.lineWidth = lw * 1.3; C.lineCap = 'round'; C.beginPath(); C.moveTo(-eyeR * 0.8 * fx * s, -eyeR * 0.3); C.lineTo(eyeR * 0.4 * fx * s, 0); C.lineTo(-eyeR * 0.8 * fx * s, eyeR * 0.3); C.stroke(); }
    else if (ex.eyeT === 'heart') { C.fillStyle = '#e63946'; C.beginPath(); const k = eyeR * 0.9; C.moveTo(0, k * 0.8); C.bezierCurveTo(-k * 1.4, -k * 0.2, -k * 0.5, -k * 1.1, 0, -k * 0.35); C.bezierCurveTo(k * 0.5, -k * 1.1, k * 1.4, -k * 0.2, 0, k * 0.8); C.fill(); }
    else if (open < 0.08) { C.beginPath(); C.moveTo(-eyeR * 0.85 * fx, 0); C.quadraticCurveTo(0, eyeR * 0.35, eyeR * 0.85 * fx, 0); C.strokeStyle = OUT; C.lineWidth = lw * 1.2; C.stroke(); }
    else {
      C.beginPath(); C.ellipse(0, 0, eyeR * 0.8 * fx, eyeR * open, 0, 0, TAU); fillPath('#fff', OUT, lw * 0.9);
      C.save(); C.clip(); const pr = eyeR * 0.55 * (ex.pupil || 1);
      const px = gaze[0] * eyeR * 0.35 + Math.sin(F.h) * eyeR * 0.25, py = gaze[1] * eyeR * 0.35;
      circle(px, py, pr); C.fillStyle = spec.eyes || '#4a2c1a'; C.fill(); circle(px, py, pr * 0.55); C.fillStyle = '#111'; C.fill(); circle(px + pr * 0.35, py - pr * 0.35, pr * 0.28); C.fillStyle = '#fff'; C.fill();
      if (open < 0.95) { C.fillStyle = spec.skin || '#c68a5a'; C.fillRect(-eyeR, -eyeR * 1.6, eyeR * 2, eyeR * (1.6 - open * 0.95)); C.beginPath(); C.moveTo(-eyeR, -eyeR * open * 0.98); C.lineTo(eyeR, -eyeR * open * 0.98); C.strokeStyle = OUT; C.lineWidth = lw; C.stroke(); }
      C.restore();
    }
    if (spec.lashes) { C.strokeStyle = OUT; C.lineWidth = lw * 0.9; C.beginPath(); C.moveTo(s * eyeR * 0.65 * fx, -eyeR * 0.55 * Math.max(open, .2)); C.lineTo(s * eyeR * 1.0 * fx, -eyeR * 0.9 * Math.max(open, .2)); C.stroke(); }
    // brow
    const bt = spec.brows || 1; const one = ex.oneBrow && s < 0 ? 0.35 : 0;
    const bb = spec.browBias || 0; const by = -eyeR * (1.35 + (ex.bi + ex.bo + bb) * 0.5 + one);
    C.strokeStyle = spec.browColor || spec.hair?.color || OUT; C.lineCap = 'round'; C.lineWidth = lw * 1.5 * bt;
    C.beginPath(); C.moveTo(-s * eyeR * 0.75 * fx, by - (ex.bi + bb) * eyeR * 0.6 - one * eyeR * 0.3); C.quadraticCurveTo(0, by - eyeR * 0.25, s * eyeR * 0.9 * fx, by - ex.bo * eyeR * 0.6); C.stroke();
    if (spec.glasses) { C.strokeStyle = spec.glasses; C.lineWidth = lw * 1.1; C.beginPath(); C.ellipse(0, 0, eyeR * 1.15 * fx, eyeR * 1.0, 0, 0, TAU); C.stroke(); }
    // tears / blush
    if (ex.tears) { for (let i = 0; i < 2; i++) { const k = ((t * 0.9 + i * 0.5 + (s > 0 ? 0.25 : 0)) % 1); C.fillStyle = 'rgba(120,190,255,0.9)'; C.beginPath(); C.ellipse(s * eyeR * 0.3, eyeR * (0.8 + k * 3.2), eyeR * 0.22, eyeR * 0.32, 0, 0, TAU); C.fill(); } }
    if (ex.blush || spec.blush) { C.fillStyle = `rgba(240,90,110,${(ex.blush || 0) * 0.5 + (spec.blush || 0)})`; C.beginPath(); C.ellipse(s * eyeR * 0.5, eyeR * 1.55, eyeR * 0.7 * fx, eyeR * 0.38, 0, 0, TAU); C.fill(); }
    C.restore();
  }
  if (spec.glasses) { const L = onHead(S, F, 0.4, 0.12, 0.84), R = onHead(S, F, -0.4, 0.12, 0.84); if (L.vis > 0.05 && R.vis > 0.05) { C.strokeStyle = spec.glasses; C.lineWidth = lw * 1.1; C.beginPath(); C.moveTo(L.x - eyeR, L.y); C.lineTo(R.x + eyeR, R.y); C.stroke(); } }
  // nose
  const n = onHead(S, F, 0, -0.12, 1.02); if (n.vis > -0.1) { const side = Math.sin(F.h); C.beginPath(); if (Math.abs(side) > 0.55) { C.moveTo(n.x - side * r * 0.05, n.y - r * 0.2); C.quadraticCurveTo(n.x + side * r * (spec.nose || 0.2), n.y + r * 0.05, n.x - side * r * 0.03, n.y + r * 0.1); C.strokeStyle = OUT; C.lineWidth = lw; C.stroke(); C.fillStyle = spec.skin || '#c68a5a'; C.fill(); } else { C.arc(n.x, n.y + r * 0.02, r * 0.09 * (spec.nose ? spec.nose * 5 : 1), 0.15 * Math.PI, 0.85 * Math.PI); C.strokeStyle = shade(spec.skin || '#c68a5a', -0.35); C.lineWidth = lw * 1.1; C.stroke(); } }
  // facial hair
  const m = onHead(S, F, 0, -0.42, 0.9); const mw = r * 0.34 * clamp(m.vis * 1.2, 0.35, 1);
  if (spec.beard === 'full' && m.vis > -0.3) { C.beginPath(); C.moveTo(m.x - r * 0.75 * Math.max(.4, m.vis), m.y - r * 0.3); C.quadraticCurveTo(m.x, m.y + r * 0.95, m.x + r * 0.75 * Math.max(.4, m.vis), m.y - r * 0.3); C.quadraticCurveTo(m.x, m.y + r * 0.1, m.x - r * 0.75 * Math.max(.4, m.vis), m.y - r * 0.3); fillPath(spec.beardColor || spec.hair?.color || '#2b1a10', OUT, lw); }
  if (spec.beard === 'stubble' && m.vis > 0) { C.fillStyle = 'rgba(60,40,30,0.18)'; C.beginPath(); C.ellipse(m.x, m.y + r * 0.12, mw * 1.6, r * 0.32, 0, 0, TAU); C.fill(); }
  // mouth: viseme overrides expression shape
  if (m.vis > -0.05) drawMouth(face.mouth || ex.mouth, m.x, m.y, mw, r, lw, ex, spec);
  if ((spec.beard === 'mustache' || spec.beard === 'full') && m.vis > -0.3) { C.beginPath(); C.moveTo(m.x, m.y - r * 0.12); C.quadraticCurveTo(m.x - mw * 1.3, m.y - r * 0.28, m.x - mw * 1.5, m.y - r * 0.02); C.quadraticCurveTo(m.x - mw * 0.6, m.y - r * 0.08, m.x, m.y - r * 0.06); C.quadraticCurveTo(m.x + mw * 0.6, m.y - r * 0.08, m.x + mw * 1.5, m.y - r * 0.02); C.quadraticCurveTo(m.x + mw * 1.3, m.y - r * 0.28, m.x, m.y - r * 0.12); fillPath(spec.beardColor || spec.hair?.color || '#2b1a10', OUT, lw * 0.8); }
  if (ex.sweat) { const k = (t * 0.7) % 1; C.fillStyle = 'rgba(140,200,255,0.95)'; C.beginPath(); C.ellipse(r * 0.75, -r * 0.4 + k * r * 0.5, r * 0.08, r * 0.13, 0, 0, TAU); C.fill(); }
  if (ex.vein) { C.strokeStyle = '#d62828'; C.lineWidth = lw * 1.2; const vx = r * 0.55, vy = -r * 0.7; C.beginPath(); for (const [a1, a2] of [[0, 1], [1, 2], [2, 3], [3, 0]]) { const p1 = [Math.cos(a1 * Math.PI / 2 + .78), Math.sin(a1 * Math.PI / 2 + .78)], p2 = [Math.cos(a2 * Math.PI / 2 + .78), Math.sin(a2 * Math.PI / 2 + .78)]; C.moveTo(vx + p1[0] * r * 0.12, vy + p1[1] * r * 0.12); C.quadraticCurveTo(vx, vy, vx + p2[0] * r * 0.12, vy + p2[1] * r * 0.12); } C.stroke(); }
  C.restore();
}
function drawMouth(shape, x, y, w, r, lw, ex, spec) {
  const dark = '#5a1a1a', tongue = '#e76f6f', lip = spec.lips || null;
  C.save(); C.translate(x, y); C.lineCap = 'round'; C.lineJoin = 'round'; C.strokeStyle = OUT; C.lineWidth = lw * 1.1;
  const smileBias = ex.mouth === 'smile' || ex.mouth === 'grin' || ex.mouth === 'laugh' ? 1 : ex.mouth === 'frown' || ex.mouth === 'wail' ? -1 : 0;
  const open = (h, wd = w, cornerUp = smileBias * r * 0.06) => { C.beginPath(); C.moveTo(-wd, -cornerUp); C.quadraticCurveTo(0, -h * 0.35 - cornerUp * 0.5, wd, -cornerUp); C.quadraticCurveTo(wd * 0.8, h, 0, h); C.quadraticCurveTo(-wd * 0.8, h, -wd, -cornerUp); C.closePath(); fillPath(dark, OUT, lw); C.save(); C.clip(); C.fillStyle = tongue; C.beginPath(); C.ellipse(0, h * 0.95, wd * 0.6, h * 0.45, 0, 0, TAU); C.fill(); C.fillStyle = '#fff'; C.fillRect(-wd, -h, wd * 2, h * 0.62); C.restore(); };
  switch (shape) {
    case 'rest': case 'flat': C.beginPath(); C.moveTo(-w * 0.7, 0); C.quadraticCurveTo(0, smileBias * r * 0.06, w * 0.7, 0); C.stroke(); break;
    case 'smile': C.beginPath(); C.moveTo(-w, -r * 0.05); C.quadraticCurveTo(0, r * 0.22, w, -r * 0.05); C.stroke(); break;
    case 'grin': C.beginPath(); C.moveTo(-w, -r * 0.06); C.quadraticCurveTo(0, r * 0.35, w, -r * 0.06); C.quadraticCurveTo(0, r * 0.08, -w, -r * 0.06); fillPath('#fff', OUT, lw); break;
    case 'laugh': open(r * 0.38, w * 1.15, r * 0.08); break;
    case 'frown': C.beginPath(); C.moveTo(-w * 0.8, r * 0.08); C.quadraticCurveTo(0, -r * 0.12, w * 0.8, r * 0.08); C.stroke(); break;
    case 'wail': open(r * 0.34, w * 0.95, -r * 0.08); break;
    case 'grit': rr(-w, -r * 0.08, w * 2, r * 0.16, r * 0.05); fillPath('#fff', OUT, lw); C.beginPath(); for (let i = -2; i <= 2; i++) { C.moveTo(i * w * 0.33, -r * 0.08); C.lineTo(i * w * 0.33, r * 0.08); } C.moveTo(-w, 0); C.lineTo(w, 0); C.lineWidth = lw * 0.6; C.stroke(); break;
    case 'shout': open(r * 0.5, w * 1.05, -r * 0.02); break;
    case 'o': C.beginPath(); C.ellipse(0, r * 0.05, w * 0.42, r * 0.17, 0, 0, TAU); fillPath(dark, OUT, lw); break;
    case 'o-small': C.beginPath(); C.ellipse(0, r * 0.02, w * 0.22, r * 0.08, 0, 0, TAU); fillPath(dark, OUT, lw); break;
    case 'wavy': C.beginPath(); C.moveTo(-w * 0.8, 0); for (let i = 1; i <= 4; i++) C.quadraticCurveTo(-w * 0.8 + (i - 0.5) * w * 0.4, (i % 2 ? -1 : 1) * r * 0.06, -w * 0.8 + i * w * 0.4, 0); C.stroke(); break;
    case 'side': C.beginPath(); C.moveTo(-w * 0.2, r * 0.02); C.quadraticCurveTo(w * 0.4, r * 0.06, w * 0.8, -r * 0.05); C.stroke(); break;
    case 'smirk': C.beginPath(); C.moveTo(-w * 0.6, r * 0.02); C.quadraticCurveTo(w * 0.2, r * 0.08, w * 0.85, -r * 0.1); C.stroke(); break;
    // ---- visemes (Preston Blair) ----
    case 'MBP': C.beginPath(); C.moveTo(-w * 0.6, 0); C.lineTo(w * 0.6, 0); C.lineWidth = lw * 1.6; C.stroke(); break;
    case 'AI': open(r * 0.36, w * 0.95); break;
    case 'E': open(r * 0.18, w * 1.05); break;
    case 'O': C.beginPath(); C.ellipse(0, r * 0.06, w * 0.5, r * 0.22, 0, 0, TAU); fillPath(dark, OUT, lw); break;
    case 'U': C.beginPath(); C.ellipse(0, r * 0.03, w * 0.3, r * 0.12, 0, 0, TAU); fillPath(dark, OUT, lw); break;
    case 'FV': C.beginPath(); C.moveTo(-w * 0.75, 0); C.quadraticCurveTo(0, r * 0.14, w * 0.75, 0); C.quadraticCurveTo(0, -r * 0.05, -w * 0.75, 0); fillPath(dark, OUT, lw); C.fillStyle = '#fff'; C.fillRect(-w * 0.45, -r * 0.03, w * 0.9, r * 0.06); break;
    case 'L': open(r * 0.24, w * 0.8); C.fillStyle = tongue; C.beginPath(); C.ellipse(0, r * 0.01, w * 0.3, r * 0.06, 0, 0, TAU); C.fill(); break;
    case 'WQ': C.beginPath(); C.ellipse(0, r * 0.04, w * 0.24, r * 0.15, 0, 0, TAU); fillPath(dark, OUT, lw * 1.3); break;
    case 'etc': open(r * 0.14, w * 0.85); break;
    default: C.beginPath(); C.moveTo(-w * 0.7, 0); C.lineTo(w * 0.7, 0); C.stroke();
  }
  C.restore();
}

// ---------------- MOTION LIBRARY ----------------
// Each move returns a POSE for local time t (seconds). Combine with blendPose / MOVES.mix.
const blinkAt = (t, seed = 0) => { const p = (t + seed * 1.37) % 3.7; return p < 0.12 ? Math.sin(p / 0.12 * Math.PI) : 0; };
const MOVES = {
  idle: (t, o = {}) => { const p = basePose(); const b = Math.sin(t * 1.6 + (o.seed || 0)); p.lean = b * 0.012; p.roll = Math.sin(t * 0.5) * 0.015; p.armL.sw = 0.04 + b * 0.02; p.armR.sw = 0.04 - b * 0.02; p.head.pitch = Math.sin(t * 0.7) * 0.03; p.head.roll = Math.sin(t * 0.43) * 0.03; p.face.blink = blinkAt(t, o.seed || 0); p.dy = -b * 1.2; return p; },
  walk: (t, o = {}) => { const sp = o.speed || 1, ph = t * TAU * 0.95 * sp, s = Math.sin(ph), c = Math.cos(ph); const p = basePose(); p.yaw = o.yaw ?? Math.PI / 2; p.legL.sw = 0.42 * s; p.legR.sw = -0.42 * s; p.legL.kn = 0.08 + 0.75 * Math.max(0, c) ** 1.3; p.legR.kn = 0.08 + 0.75 * Math.max(0, -c) ** 1.3; p.armL.sw = -0.38 * s; p.armR.sw = 0.38 * s; p.armL.el = 0.35 + 0.25 * Math.max(0, -s); p.armR.el = 0.35 + 0.25 * Math.max(0, s); p.armL.ab = p.armR.ab = 0.08; p.lean = 0.05; p.head.pitch = -0.03 + Math.abs(s) * 0.02; p.face.blink = blinkAt(t, o.seed || 1); return p; },
  run: (t, o = {}) => { const sp = o.speed || 1, ph = t * TAU * 1.5 * sp, s = Math.sin(ph), c = Math.cos(ph); const p = basePose(); p.yaw = o.yaw ?? Math.PI / 2; p.legL.sw = 0.75 * s + 0.1; p.legR.sw = -0.75 * s + 0.1; p.legL.kn = 0.3 + 1.3 * Math.max(0, c); p.legR.kn = 0.3 + 1.3 * Math.max(0, -c); p.armL.sw = -0.85 * s; p.armR.sw = 0.85 * s; p.armL.el = p.armR.el = 1.45; p.lean = 0.22; p.air = Math.abs(Math.sin(ph)) * 14; p.handL = p.handR = 'fist'; p.face.expr = o.expr || 'determined'; return p; },
  jump: (t, o = {}) => { const p = basePose(); p.yaw = o.yaw ?? 0; const d = o.dur || 1.2, k = t / d; const crouch = k < 0.22 ? ease('out', k / 0.22) : k < 0.32 ? 1 - ease('in', (k - .22) / .1) : k > 0.82 && k < 0.95 ? Math.sin((k - .82) / .13 * Math.PI) * 0.8 : 0; const airK = clamp((k - 0.3) / 0.55); p.air = airK > 0 && airK < 1 ? Math.sin(airK * Math.PI) * (o.height || 160) : 0; p.legL.sw = p.legR.sw = crouch * 0.9; p.legL.kn = p.legR.kn = crouch * 1.7 + (p.air > 0 ? 0.5 : 0); p.lean = crouch * 0.35; const armUp = airK > 0 && airK < 1 ? 1 : 0; p.armL.ab = p.armR.ab = lerp(0.15 + crouch * 0.1, 2.5, armUp * Math.sin(airK * Math.PI)); p.armL.sw = p.armR.sw = -crouch * 0.6; p.face.expr = o.expr || (p.air > 20 ? 'happy' : 'determined'); return p; },
  sit: (t, o = {}) => { const k = o.k ?? clamp(t / 0.6); const p = MOVES.idle(t, o); p.yaw = o.yaw ?? 0.6; const e = ease('inOut', k); p.legL.sw = p.legR.sw = 1.5 * e; p.legL.kn = p.legR.kn = 1.5 * e; p.legL.ab = p.legR.ab = 0.12; p.lean = 0.12 * Math.sin(k * Math.PI) - 0.04 * e; p.armL.sw = p.armR.sw = 0.55 * e; p.armL.el = p.armR.el = 0.7 * e; return p; },
  stand: (t, o = {}) => MOVES.sit(t, { ...o, k: 1 - clamp(t / 0.6) }),
  turn: (t, o = {}) => { const p = MOVES.idle(t, o); p.yaw = tw(t, 0, o.dur || 0.5, o.from ?? 0, o.to ?? Math.PI / 2, 'inOut'); p.head.yaw = Math.sin(clamp(t / (o.dur || .5)) * Math.PI) * 0.25 * Math.sign((o.to ?? 1) - (o.from ?? 0)); return p; },
  talk: (t, o = {}) => { const p = MOVES.idle(t, o); const sd = o.seed || 3, i = o.intensity ?? 1; p.yaw = o.yaw ?? 0.35; p.head.pitch = wobble(t, 2.2, sd) * 0.09 * i; p.head.roll = wobble(t, 1.3, sd + 2) * 0.06 * i; p.head.yaw = wobble(t, 0.8, sd + 5) * 0.12; const g = (wobble(t, 0.9, sd + 9) + 1) / 2; const arm = o.hand === 'L' ? p.armL : p.armR; arm.sw = 0.35 + g * 0.6 * i; arm.el = 1.0 + g * 0.6; arm.ab = 0.15 + wobble(t, 1.4, sd) * 0.12; p['hand' + (o.hand || 'R')] = g > 0.6 ? 'open' : 'open'; if (o.both) { p.armL.sw = 0.3 + (1 - g) * 0.5 * i; p.armL.el = 1.1; } p.face.expr = o.expr || 'neutral'; p.face.mouth = o.mouth || null; return p; },
  listen: (t, o = {}) => { const p = MOVES.idle(t, o); p.yaw = o.yaw ?? -0.35; p.head.roll = 0.1 + wobble(t, 0.4, 4) * 0.04; const nod = (t % 2.6) < 0.5 ? Math.sin((t % 2.6) / 0.5 * Math.PI * 2) * 0.12 : 0; p.head.pitch = nod; if (o.crossed) { p.armL.sw = p.armR.sw = 0.9; p.armL.ab = p.armR.ab = -0.25; p.armL.el = p.armR.el = 1.7; } p.face.expr = o.expr || 'neutral'; return p; },
  laugh: (t, o = {}) => { const p = MOVES.idle(t, o); p.yaw = o.yaw ?? 0.3; const sh = Math.sin(t * TAU * 6); p.dy = sh * 3; p.lean = -0.12 + sh * 0.02; p.head.pitch = -0.28 + sh * 0.04; p.armL.sw = p.armR.sw = 0.55; p.armL.ab = p.armR.ab = -0.22; p.armL.el = p.armR.el = 1.35; p.face.expr = 'laugh'; return p; },
  cry: (t, o = {}) => { const p = MOVES.idle(t, o); p.yaw = o.yaw ?? 0.2; const sob = Math.max(0, Math.sin(t * TAU * 2.2)); p.shrug = 0.25 + sob * 0.25; p.head.pitch = 0.32; p.lean = 0.1; p.armL.sw = p.armR.sw = 1.0; p.armL.ab = p.armR.ab = -0.1; p.armL.el = p.armR.el = 2.05; p.face.expr = 'cry'; return p; },
  shout: (t, o = {}) => { const p = MOVES.idle(t, o); p.yaw = o.yaw ?? 0.4; const k = ease('back', t / 0.3); p.lean = 0.16 * k; p.head.pitch = -0.1 * k; p.armL.sw = p.armR.sw = 0.35 * k; p.armL.ab = p.armR.ab = 0.6 * k; p.armL.el = p.armR.el = 0.9 * k; p.handL = p.handR = 'fist'; p.dy = wobble(t, 25, 2) * 2; p.face.expr = 'shout'; return p; },
  punch: (t, o = {}) => { const p = basePose(); p.yaw = o.yaw ?? Math.PI / 2 * 0.85; const ph = (t * (o.rate || 1.6)) % 1, hit = ph < 0.35 ? ease('expoOut', ph / 0.35) : 1 - ease('inOut', (ph - .35) / .65); p.lean = 0.12 + hit * 0.12; p.legL.sw = 0.35; p.legR.sw = -0.3; p.legL.kn = 0.35; p.legR.kn = 0.2; p.armR.sw = lerp(0.9, 1.6, hit); p.armR.el = lerp(2.1, 0.05, hit); p.armL.sw = 1.0; p.armL.el = 2.1; p.armR.ab = p.armL.ab = 0.05; p.handL = p.handR = 'fist'; p.face.expr = 'angry'; return p; },
  kick: (t, o = {}) => { const p = basePose(); p.yaw = o.yaw ?? Math.PI / 2; const k = Math.sin(clamp(t / 0.6) * Math.PI); p.legR.sw = 1.5 * k; p.legR.kn = 1.6 * (1 - k) * k * 2; p.legL.kn = 0.2; p.lean = -0.25 * k; p.armL.ab = p.armR.ab = 0.9 * k; p.armL.sw = p.armR.sw = 0.3; p.handL = p.handR = 'fist'; p.face.expr = 'angry'; return p; },
  fall: (t, o = {}) => { const p = basePose(); p.yaw = o.yaw ?? Math.PI / 2; const k = ease('in', clamp(t / (o.dur || 0.7))); const dir = o.dir || -1; p.rot = dir * k * Math.PI / 2 * 0.98; p.armL.ab = p.armR.ab = 0.6 + k * 1.6 + Math.sin(t * 30) * 0.2 * (1 - k); p.armL.sw = p.armR.sw = -0.4; p.legL.sw = 0.5 * k; p.legL.kn = 0.6 * k; p.head.pitch = -0.2; p.face.expr = k < 1 ? 'scared' : 'sad'; if (k >= 1) { p.face.expr = 'sleepy'; } return p; },
  dance: (t, o = {}) => { const p = basePose(); const bpm = o.bpm || 112, b = t * bpm / 60 * Math.PI; p.yaw = Math.sin(b * 0.5) * 0.4; p.dx = Math.sin(b) * 10; p.dy = -Math.abs(Math.sin(b)) * 12; p.roll = Math.sin(b) * 0.1; p.legL.kn = 0.3 + 0.3 * Math.max(0, Math.sin(b)); p.legR.kn = 0.3 + 0.3 * Math.max(0, -Math.sin(b)); p.legL.sw = p.legR.sw = 0.2; p.armL.ab = 1.2 + Math.sin(b) * 1.0; p.armR.ab = 1.2 - Math.sin(b) * 1.0; p.armL.el = p.armR.el = 0.6; p.head.roll = Math.sin(b) * 0.15; p.face.expr = 'happy'; return p; },
  celebrate: (t, o = {}) => { const j = MOVES.jump(t % 1.1, { dur: 1.1, height: 120, yaw: o.yaw ?? 0 }); j.armL.ab = j.armR.ab = 2.65; j.armL.el = j.armR.el = 0.25; j.handL = j.handR = 'fist'; j.face.expr = 'laugh'; return j; },
  wave: (t, o = {}) => { const p = MOVES.idle(t, o); p.yaw = o.yaw ?? 0; p.armR.ab = 2.35; p.armR.sw = 0.15; p.armR.el = 0.6 + Math.sin(t * TAU * 2.2) * 0.45; p.face.expr = o.expr || 'happy'; return p; },
  point: (t, o = {}) => { const p = MOVES.idle(t, o); p.yaw = o.yaw ?? 0.6; const k = ease('back', t / 0.35); p.armR.sw = 1.45 * k; p.armR.ab = (o.up ? 0.6 : 0.2); p.armR.el = 0.05; p.handR = 'point'; p.lean = 0.05; p.face.expr = o.expr || 'surprised'; return p; },
  shrug: (t, o = {}) => { const p = MOVES.idle(t, o); const k = Math.sin(clamp(t / 0.9) * Math.PI); p.shrug = k; p.armL.el = p.armR.el = 1.4 * k + 0.2; p.armL.ab = p.armR.ab = 0.25 + 0.35 * k; p.armL.sw = p.armR.sw = 0.25; p.head.roll = 0.15 * k; p.face.expr = 'smug'; return p; },
  facepalm: (t, o = {}) => { const p = MOVES.idle(t, o); const k = ease('out', t / 0.4); p.armR.sw = 1.25 * k; p.armR.ab = -0.18 * k; p.armR.el = 2.1 * k; p.head.pitch = 0.3 * k; p.face.expr = 'sad'; return p; },
  thumbsUp: (t, o = {}) => { const p = MOVES.idle(t, o); const k = ease('back', t / 0.35); p.armR.sw = 0.9 * k; p.armR.el = 1.3 * k; p.armR.ab = 0.25; p.handR = 'thumb'; p.face.expr = 'wink'; return p; },
  clap: (t, o = {}) => { const p = MOVES.idle(t, o); const c = (Math.sin(t * TAU * 3) + 1) / 2; p.armL.sw = p.armR.sw = 1.05; p.armL.el = p.armR.el = 1.0; p.armL.ab = p.armR.ab = -0.05 + c * 0.35; p.face.expr = 'happy'; return p; },
  think: (t, o = {}) => { const p = MOVES.idle(t, o); p.armR.sw = 1.1; p.armR.ab = -0.15; p.armR.el = 2.25; p.handR = 'fist'; p.armL.sw = 0.7; p.armL.ab = -0.2; p.armL.el = 1.5; p.head.roll = 0.12; p.face.expr = 'thinking'; return p; },
  scared: (t, o = {}) => { const p = MOVES.idle(t, o); p.lean = -0.15; p.dx = wobble(t, 18, 1) * 3; p.armL.sw = p.armR.sw = 1.0; p.armL.el = p.armR.el = 1.6; p.armL.ab = p.armR.ab = 0.2; p.legL.kn = p.legR.kn = 0.25; p.face.expr = 'scared'; return p; },
  holdHead: (t, o = {}) => { const p = MOVES.idle(t, o); p.yaw = o.yaw ?? 0.2; for (const a of [p.armL, p.armR]) { a.sw = 0.3; a.ab = 1.9; a.el = 0.05; a.elAb = 4.3; } const sob = Math.sin(t * TAU * 2.5); p.dy = sob * 2; p.head.roll = sob * 0.05; p.face.expr = o.expr || 'cry'; return p; },
  holdPhone: (t, o = {}) => { const p = MOVES.idle(t, o); p.yaw = o.yaw ?? 0; for (const [arm, sd] of [[p.armL, 1], [p.armR, -1]]) { arm.sw = 0.55; arm.ab = 0.05; arm.el = 1.45; arm.elAb = -0.75; } p.head.pitch = o.lookUp ? -0.05 : 0.22; p.holding = 'phone'; p.face.gaze = o.lookUp ? [0, 0] : [0, 0.8]; p.face.expr = o.expr || 'neutral'; return p; },
  powerPose: (t, o = {}) => { const p = MOVES.idle(t, o); p.yaw = o.yaw ?? 0.15; const k = ease('back', clamp(t / 0.4)); p.armR.ab = lerp(0.12, 2.75, k); p.armR.sw = 0.2; p.armR.el = 0.35 * k; p.handR = 'fist'; p.lean = -0.04 * k; p.face.expr = o.expr || 'smug'; return p; },
  fly: (t, o = {}) => { const p = basePose(); p.yaw = o.yaw ?? Math.PI / 2; p.rot = 0; p.lean = 1.25; p.air = o.height ?? 140; p.armR.sw = 3.0; p.armR.ab = 0.15; p.armR.el = 0; p.handR = 'fist'; p.armL.sw = -0.2; p.armL.el = 0.3; p.legL.sw = -0.25; p.legR.sw = -0.45; p.legR.kn = 0.5; p.dy = Math.sin(t * 6) * 6; p.face.expr = o.expr || 'determined'; return p; },
  fightStance: (t, o = {}) => { const p = MOVES.idle(t, o); p.yaw = o.yaw ?? 1.2; const b = Math.sin(t * TAU * 1.5); p.dy = b * 4; p.legL.sw = 0.35; p.legR.sw = -0.3; p.legL.kn = p.legR.kn = 0.4; p.armL.sw = p.armR.sw = 1.1; p.armL.el = p.armR.el = 2.0; p.handL = p.handR = 'fist'; p.face.expr = 'determined'; return p; },
  present: (t, o = {}) => { const p = MOVES.talk(t, { ...o, intensity: 0.6 }); p.yaw = o.yaw ?? 0.05; p.armL.sw = 0.75; p.armL.el = 1.2; p.armL.ab = -0.05; p.armR.sw = 0.75 + wobble(t, 0.7, 5) * 0.15; p.armR.el = 1.15; p.armR.ab = -0.05; return p; },
};
const MOVE_NAMES = Object.keys(MOVES);
// distance a walk/run covers (no foot sliding): px/s at scale 1
function strideSpeed(spec, move = 'walk', speed = 1) { const S = solve(spec, basePose()); return move === 'run' ? S.L * 2.6 * speed : S.L * 1.55 * speed; }
// sequence helper: clips = [{move, t0, dur, opts}] with crossfade xf
function perform(clips, t, xf = 0.25) {
  let cur = clips[0]; for (const c of clips) if (t >= c.t0) cur = c;
  const i = clips.indexOf(cur); const pose = MOVES[cur.move](t - cur.t0, cur.opts || {});
  if (i > 0 && t - cur.t0 < xf) { const prev = clips[i - 1]; const pp = MOVES[prev.move](t - prev.t0, prev.opts || {}); return blendPose(pp, pose, ease('inOut', (t - cur.t0) / xf)); }
  return pose;
}

// ---------------- CAST (reusable characters) ----------------
const CAST = {
  daniel: { name: 'Daniel Okafor', role: 'News anchor', channel: ['news'], height: 430, age: 'adult', build: 'average', skin: '#8d5a3b', hair: { style: 'short', color: '#1b120c' }, beard: 'stubble', eyes: '#3b2416', top: { type: 'suit', color: '#1d2b44' }, shirt: '#eef2f7', tie: '#c8102e', bottom: { type: 'pants', color: '#1d2b44' }, shoes: '#111', brows: 1.1 },
  amara: { name: 'Amara Singh', role: 'News co-anchor / reporter', channel: ['news'], height: 405, age: 'adult', build: 'slim', skin: '#b67b55', hair: { style: 'long', color: '#1a0f0a' }, eyes: '#3b2416', lashes: true, top: { type: 'suit', color: '#7a1f3d' }, shirt: '#f6efe9', bottom: { type: 'skirt', color: '#2b2b38' }, shoes: '#2b1a1a', earrings: '#e9c46a', hips: 0.8, lips: '#a8455a' },
  chacha: { name: 'Chacha Bashir', role: 'Comic uncle, would-be magician', channel: ['cartoon'], height: 380, age: 'elder', build: 'chubby', skin: '#c98f62', hair: { style: 'balding', color: '#6b6b6b' }, beard: 'mustache', beardColor: '#3a3a3a', eyes: '#3b2416', top: { type: 'kurta', color: '#e9e4d8' }, accent: '#c9a227', bottom: { type: 'shalwar', color: '#d9d2c3' }, shoes: '#6b3e1e', glasses: '#333', brows: 1.4, nose: 0.28, headW: 1.02 },
  zoya: { name: 'Zoya', role: 'Clever niece, 14', channel: ['cartoon'], height: 345, age: 'teen', build: 'slim', skin: '#d7a27a', hair: { style: 'ponytail', color: '#24140c' }, eyes: '#4a2c1a', lashes: true, top: { type: 'hoodie', color: '#2a9d8f' }, hoodLining: '#f4a261', bottom: { type: 'pants', color: '#264653' }, shoes: '#f1faee', blush: 0.08, hood: false },
  rafi: { name: 'Rafi', role: 'Energetic kid, 7', channel: ['cartoon'], height: 250, age: 'kid', build: 'average', skin: '#c68a5a', hair: { style: 'spiky', color: '#1b120c' }, eyes: '#3b2416', top: { type: 'shirt', color: '#f4a261', sleeve: 'short' }, buttons: false, bottom: { type: 'shorts', color: '#3a86ff' }, shoes: '#e63946', blush: 0.12 },
  nani: { name: 'Nani', role: 'Grandmother', channel: ['cartoon'], height: 340, age: 'elder', build: 'chubby', skin: '#c48a60', hair: { style: 'bun', color: '#d9d9d9' }, glasses: '#7a5c3c', eyes: '#3b2416', top: { type: 'kurta', color: '#6d597a' }, dupatta: '#ffffff', bottom: { type: 'shalwar', color: '#b5a3c3' }, shoes: '#3a2a1a', hips: 0.9 },
  maya: { name: 'Maya Chen', role: 'Office worker / civic explainer host', channel: ['calgaryinsight', 'news'], height: 400, age: 'adult', build: 'average', skin: '#f0c9a4', hair: { style: 'bun', color: '#151515' }, eyes: '#2b1d14', lashes: true, glasses: '#1b1b1b', top: { type: 'shirt', color: '#457b9d' }, bottom: { type: 'pants', color: '#1d3557' }, shoes: '#222' },
  marcus: { name: 'Marcus', role: 'Construction foreman', channel: ['calgaryinsight', 'cartoon'], height: 440, age: 'adult', build: 'muscular', skin: '#e2b08a', hair: { style: 'short', color: '#7a4a24' }, beard: 'full', beardColor: '#7a4a24', eyes: '#3d5a80', top: { type: 'vest', color: '#5b6770', sleeve: 'short' }, bottom: { type: 'pants', color: '#3d4a5c' }, shoes: '#5a3a1a', hat: { type: 'hardhat', color: '#f5c400' } },
  officer: { name: 'Officer Gill', role: 'Police officer', channel: ['news', 'calgaryinsight'], height: 430, age: 'adult', build: 'average', skin: '#a8714c', beard: 'full', beardColor: '#1b120c', hair: { style: 'short', color: '#1b120c' }, eyes: '#3b2416', top: { type: 'uniform', color: '#1f2d4a' }, bottom: { type: 'pants', color: '#1f2d4a' }, shoes: '#111', hat: { type: 'turban', color: '#1f2d4a' }, belt: '#111' },
  layla: { name: 'Layla', role: 'University student', channel: ['cartoon', 'calgaryinsight'], height: 395, age: 'adult', build: 'petite', skin: '#c9926b', hijab: '#e76f51', eyes: '#3b2416', lashes: true, top: { type: 'coat', color: '#f1faee' }, shirt: '#e76f51', bottom: { type: 'pants', color: '#3d405b' }, shoes: '#222' },
  jamal: { name: 'Jamal', role: 'Teen skateboarder', channel: ['cartoon'], height: 360, age: 'teen', build: 'slim', skin: '#5e3b26', hair: { style: 'afro', color: '#120b07' }, eyes: '#2b1d14', top: { type: 'hoodie', color: '#ffb703' }, hoodLining: '#fb8500', bottom: { type: 'pants', color: '#023047' }, shoes: '#fff', hat: null },
  // ---- SUSUMAN series (matches CHARACTER.md and Susuman_model_sheet.jpg in the susuman-kit branch) ----
  qasim: { name: 'Qasim', role: '4-year-old hero (normal form) - Susuman series', channel: ['cartoon', 'susuman'], height: 250, age: 'toddler', build: 'average', skin: '#c98b5c', hair: { style: 'bigcurls', color: '#24140c', color2: '#3e2415' }, eyes: '#4a2716', brows: 2.1, browColor: '#24140c', browBias: -0.35, blush: 0.12,
    top: { type: 'hoodie', color: '#17171d' }, hood: false, collar: '#e0222c', cuff: '#e0222c', kara: true, bottom: { type: 'pants', color: '#26262e' }, shoes: '#f4f4f4', shoeStripe: '#e0222c', emblem: r => susuDrop(r * 0.5), headScale: 1.0, widthScale: 1.45, legScale: 0.72, limbScale: 1.3, armScale: 0.66, build: 'muscular' },
  susuman: { name: 'Susuman', role: 'Qasim in power form: gold aura, red cape, floating crown - Susuman series', channel: ['cartoon', 'susuman'], height: 250, age: 'toddler', build: 'average', skin: '#c98b5c', hair: { style: 'bigcurls', color: '#24140c', color2: '#3e2415' }, eyes: '#4a2716', brows: 2.1, browColor: '#24140c', browBias: -0.35, blush: 0.12,
    top: { type: 'hoodie', color: '#17171d' }, hood: false, collar: '#e0222c', cuff: '#e0222c', kara: true, bottom: { type: 'pants', color: '#26262e' }, shoes: '#f4f4f4', shoeStripe: '#e0222c', emblem: r => susuDrop(r * 0.6), headScale: 1.0, widthScale: 1.45, legScale: 0.72, limbScale: 1.3, armScale: 0.66, build: 'muscular',
    cape: '#e0222c', aura: 1, hat: { type: 'crown', float: true, glow: true } },
  ammi: { name: 'Ammi', role: "Qasim's mother, usually on her phone - Susuman series", channel: ['cartoon', 'susuman'], height: 400, age: 'adult', build: 'average', skin: '#b97a50', hair: { style: 'bun', color: '#120a07' }, eyes: '#2a160c', brows: 1.2, browColor: '#120a07', lashes: true,
    top: { type: 'kurta', color: '#1f7a78' }, buttons: false, accent: '#e8b44a', necklace: '#e8b44a', dupatta: '#e4568a', dupattaStyle: 'sides', bottom: { type: 'shalwar', color: '#e9e1d4' }, shoes: '#7a3b2a', earrings: '#ffc83a', hips: 0.85, widthScale: 1.25, armScale: 0.92 },
};
function susuDrop(r) { C.beginPath(); C.moveTo(0, -r * 1.1); C.bezierCurveTo(r * 0.2, -r * 0.6, r * 0.75, -r * 0.1, r * 0.75, r * 0.35); C.bezierCurveTo(r * 0.75, r * 0.85, r * 0.35, r * 1.05, 0, r * 1.05); C.bezierCurveTo(-r * 0.35, r * 1.05, -r * 0.75, r * 0.85, -r * 0.75, r * 0.35); C.bezierCurveTo(-r * 0.75, -r * 0.1, -r * 0.2, -r * 0.6, 0, -r * 1.1); C.closePath(); fillPath('#ffc83a', '#b97c00', Math.max(2, r * 0.12)); C.fillStyle = 'rgba(255,255,255,0.7)'; C.beginPath(); C.ellipse(-r * 0.25, r * 0.3, r * 0.14, r * 0.28, 0.3, 0, TAU); C.fill(); }

// ground Y that puts the head centre at screen y=hy for scale sc (for close-ups / expression sheets)
function groundForHead(spec, hy, sc) { const S = solve(spec, basePose()); return hy + (-S.J.head[1] + Math.max(S.J.ankL[1], 0) + S.hr * 0.12) * sc; }
// screen position of a joint (e.g. 'wriR', 'head') for attaching props/FX to a drawn character
function jointPos(spec, pose, x, gy, sc, joint) {
  const S = solve(spec, pose), a = pose.yaw, P = {}; for (const k in S.J) P[k] = proj(S.J[k], a);
  const lowest = Math.max(P.ankL.y, P.ankR.y, P.toeL.y, P.toeR.y) + S.hr * 0.12, oy = -lowest - pose.air + pose.dy;
  let px = P[joint].x, py = P[joint].y + oy;
  if (pose.rot) { const piv = P.ankL.y > P.ankR.y ? P.ankL : P.ankR, cx = piv.x, cy = oy + piv.y, c = Math.cos(pose.rot), s = Math.sin(pose.rot); const dx = px - cx, dy = py - cy; px = cx + dx * c - dy * s; py = cy + dx * s + dy * c; }
  return [x + (pose.dx + px) * sc, gy + py * sc * pose.scaleY];
}
