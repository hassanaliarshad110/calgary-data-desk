// ======================= EPISODE 12 — "Cricket Final": props + Officer Gill's house (drawn into the dhalaan house row, d = 1.3) =======================
Object.assign(SPK, { 'OFFICER GILL': '#1f2d4a', 'DADA ABU': '#8a6d2f', DADI: '#6b4f8f' });
const dharmK = skFn('dharmender');
// ---- cricket props ----
const cball = (x, y, r = 22, rot = 0) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)})"><circle r="${r}" fill="#c8102e" stroke="${C.ink}" stroke-width="${(r * .14).toFixed(1)}"/><path d="M${-r * .75},${-r * .65} Q0,0 ${-r * .75},${r * .65} M${r * .75},${-r * .65} Q0,0 ${r * .75},${r * .65}" stroke="#fff" stroke-width="${(r * .1).toFixed(1)}" fill="none"/><circle cx="${-r * .35}" cy="${-r * .4}" r="${r * .22}" fill="#fff" opacity=".35"/></g>`;
const bat = (x, y, s = 1, rot = 0) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)})"><rect x="-7" y="-150" width="14" height="70" rx="6" fill="#2b2b2b" stroke="${C.ink}" stroke-width="3"/>${[0, 1, 2, 3].map(k => `<path d="M-7,${-140 + k * 16} l14,8" stroke="#e5463b" stroke-width="4"/>`).join('')}<path d="M-20,-82 h40 l4,180 q-24,14 -48,0Z" fill="#e8c98a" stroke="${C.ink}" stroke-width="4"/><path d="M0,-70 v160" stroke="#c9a25a" stroke-width="5"/></g>`;
function stumps(x, y, s = 1, hit = 0) {   // three wooden stumps on a brick base (gali style) + bails
  let g = `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(3)})"><rect x="-46" y="-26" width="92" height="30" rx="4" fill="#b5532f" stroke="${C.ink}" stroke-width="4"/><path d="M-46,-11 h92 M-15,-26 v15 M15,-11 v15" stroke="#7a2f18" stroke-width="3"/>`;
  [-24, 0, 24].forEach((dx, k) => g += `<rect x="${dx - 5}" y="-150" width="10" height="126" rx="4" fill="#f1dcae" stroke="${C.ink}" stroke-width="3" transform="rotate(${hit * (k - 1) * 14} ${dx} -24)"/>`);
  return g + `<rect x="-30" y="-158" width="28" height="8" rx="3" fill="#e5463b" stroke="${C.ink}" stroke-width="2"/><rect x="2" y="-158" width="28" height="8" rx="3" fill="#e5463b" stroke="${C.ink}" stroke-width="2"/></g>`;
}
const chaiCup = (x, y, s = 1, tilt = 0, steam = 1, t = 0) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${tilt}) scale(${s.toFixed(3)})"><path d="M-22,-30 h44 l-6,34 h-32Z" fill="#fff" stroke="${C.ink}" stroke-width="4"/><path d="M22,-22 q16,4 0,18" stroke="${C.ink}" stroke-width="4" fill="none"/><rect x="-20" y="-28" width="40" height="8" fill="#b7793f"/>${steam ? [0, 1].map(k => `<path d="M${-8 + k * 14},-40 q-8,-14 0,-28 q8,-14 0,-28" stroke="#fff" stroke-width="4" fill="none" opacity="${.6 * (.5 + .5 * Math.sin(t * 4 + k))}"/>`).join('') : ''}</g>`;
function ladder(x0, y0, x1, y1, w = 70) {   // wooden seedhi from (x0,y0) foot to (x1,y1) top
  const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a) * w / 2, ny = Math.cos(a) * w / 2, L = Math.hypot(x1 - x0, y1 - y0);
  let g = `<path d="M${x0 + nx},${y0 + ny} L${x1 + nx},${y1 + ny} M${x0 - nx},${y0 - ny} L${x1 - nx},${y1 - ny}" stroke="#a87a3e" stroke-width="14" stroke-linecap="round"/>`;
  for (let k = 1; k < L / 70; k++) { const u = k * 70 / L, cx = lerp(x0, x1, u), cy = lerp(y0, y1, u); g += `<path d="M${cx + nx},${cy + ny} L${cx - nx},${cy - ny}" stroke="#a87a3e" stroke-width="10"/>`; }
  return `<g stroke="${C.ink}">${g.replace(/stroke="#a87a3e"/g, 'stroke="#a87a3e"')}</g>`;
}
function jhoothMeter(x, y, s, v, t, label = 'JHOOTH METER') {   // needle: v 0 (green SACH) .. 1 (red JHOOTH)
  if (s <= 0) return '';
  const a = lerp(-70, 70, v) + 4 * Math.sin(t * 30) * (v > .7 ? 1 : 0);
  let g = `<g transform="translate(${x},${y}) scale(${s.toFixed(3)})"><rect x="-190" y="-150" width="380" height="210" rx="30" fill="#fff" stroke="${C.ink}" stroke-width="8"/>`;
  g += `<path d="M-130,20 A130,130 0 0 1 -45,-102" stroke="#22a35a" stroke-width="34" fill="none"/><path d="M-45,-102 A130,130 0 0 1 45,-102" stroke="#ffd34a" stroke-width="34" fill="none"/><path d="M45,-102 A130,130 0 0 1 130,20" stroke="#e5463b" stroke-width="34" fill="none"/>`;
  g += `<path d="M0,20 L0,-110" stroke="${C.ink}" stroke-width="10" stroke-linecap="round" transform="rotate(${a.toFixed(1)} 0 20)"/><circle cx="0" cy="20" r="16" fill="${C.ink}"/>`;
  g += T(0, -170, 44, label, { fill: '#fff', shadow: '#000', sw: 7 }) + T(-120, 52, 30, 'SACH', { fill: '#22a35a', sw: 0 }) + T(120, 52, 30, 'JHOOTH', { fill: '#e5463b', sw: 0 });
  return g + '</g>';
}
// ---- Officer Gill's house (row coords, d = 1.3). Facade x 640..1010; its upstairs window, the concrete chhajja above it, and the old drain pipe ----
const HBg = x => GB - 165 + SL * Math.min(x, XR);
const GHX0 = 640, GHX1 = 1010, GHH = 860;
const WINX = 805, WINY = HBg(805) - 500, WINW = 160, WINH = 180;          // window centre
const CHJ = { x0: WINX - 140, x1: WINX + 140, y: WINY - WINH / 2 - 34 };   // chhajja top surface (ball rests here)
const PIPE = { x: 985, y0: HBg(985), y1: HBg(985) - GHH + 20 };            // drain pipe: foot (y0) .. top (y1)
const GDOOR = 720;                                                          // Gill's front door centre
// pipe point at height h above the foot, with the pipe rotated by ang (deg, + = top swings right/away from the house) about its foot
const pipePt = (h, ang = 0) => { const r = ang * Math.PI / 180; return { x: PIPE.x + Math.sin(r) * h, y: PIPE.y0 - Math.cos(r) * h }; };
function gillHouse(t, o = {}) {
  const top = HBg(GHX1) - GHH, yl = HBg(GHX0), yr = HBg(GHX1);
  let g = `<polygon points="${GHX0},${top - 4 + SL * 0} ${GHX1 + 6},${top - 4} ${GHX1 + 6},${yr + 30} ${GHX0},${yl + 30}" fill="#bfe3d6" stroke="${C.ink}" stroke-width="6"/>`;
  g += `<rect x="${GHX0 - 12}" y="${top - 30}" width="${GHX1 - GHX0 + 30}" height="30" fill="#eef6f2" stroke="${C.ink}" stroke-width="5"/>`;
  g += `<rect x="${GHX1 - 34}" y="${top}" width="40" height="${yr - top + 30}" fill="#000" opacity=".08"/>`;
  // ground-floor band (darker), police-blue door + GILL nameplate + a small light
  g += `<polygon points="${GHX0},${yl - 150} ${GHX1 + 6},${yr - 150} ${GHX1 + 6},${yr + 30} ${GHX0},${yl + 30}" fill="#a9d6c6"/>`;
  const dy = HBg(GDOOR);
  g += `<rect x="${GDOOR - 92}" y="${dy - 282}" width="184" height="22" fill="#e9e1d4" stroke="${C.ink}" stroke-width="4"/><rect x="${GDOOR - 78}" y="${dy - 260}" width="156" height="260" rx="6" fill="#1f3f7a" stroke="${C.ink}" stroke-width="6"/><path d="M${GDOOR},${dy - 250} v240" stroke="${C.ink}" stroke-width="4" opacity=".45"/><circle cx="${GDOOR + 50}" cy="${dy - 128}" r="8" fill="#e8c34a"/>`;
  g += `<rect x="${GDOOR + 98}" y="${dy - 232}" width="92" height="44" rx="6" fill="#fff6d8" stroke="${C.ink}" stroke-width="4"/>${T(GDOOR + 144, dy - 200, 30, 'GILL', { fill: '#1f3f7a', sw: 0, ls: 2 })}`;
  if (o.doorOpen) g += `<rect x="${GDOOR - 78}" y="${dy - 260}" width="${156 * (1 - o.doorOpen * .8)}" height="260" fill="#16305e" stroke="${C.ink}" stroke-width="5"/><rect x="${GDOOR - 78 + 156 * (1 - o.doorOpen * .8)}" y="${dy - 260}" width="${156 * o.doorOpen * .8}" height="260" fill="#2a2018" opacity=".85"/>`;
  g += `<rect x="${GDOOR - 104}" y="${dy - 4}" width="208" height="18" fill="#bdb3a3" stroke="${C.ink}" stroke-width="4"/>`;
  // a second, small upstairs window on the left + potted plant on the sill
  g += `<rect x="${GHX0 + 40}" y="${WINY - 60}" width="70" height="110" fill="#5a8bb0" stroke="${C.ink}" stroke-width="5"/><path d="M${GHX0 + 75},${WINY - 60} v110" stroke="#cfe3ef" stroke-width="4"/>`;
  // ---- the big window (the one that breaks) ----
  const wx = WINX - WINW / 2, wy = WINY - WINH / 2;
  g += `<rect x="${wx - 30}" y="${wy}" width="30" height="${WINH}" fill="#3a8a5a" stroke="${C.ink}" stroke-width="4"/><rect x="${wx + WINW}" y="${wy}" width="30" height="${WINH}" fill="#3a8a5a" stroke="${C.ink}" stroke-width="4"/>`;
  g += `<rect x="${wx}" y="${wy}" width="${WINW}" height="${WINH}" fill="${o.broken ? '#2c3e52' : '#6f9fc4'}" stroke="${C.ink}" stroke-width="6"/>`;
  if (o.gill > 0) {   // Officer Gill leans into the broken window (clipped to the frame)
    const gid = 'gwin' + (o.id || '');
    g += `<clipPath id="${gid}"><rect x="${wx}" y="${wy}" width="${WINW}" height="${WINH}"/></clipPath><g clip-path="url(#${gid})">` + officer({ x: WINX - 6, y: wy + 460 + 300 * (1 - o.gill), s: .78, t, move: o.gillMove || 'shout', mt: t, yaw: o.gillYaw ?? 0, expr: o.gillExpr || 'surprised', amp: o.gillAmp || 0 }) + `</g>`;
    if (o.cup) g += chaiCup(WINX + 52, wy + WINH - 20 - 10 * o.gill, .8, -10, 1, t);
  }
  if (!o.broken) g += `<path d="M${WINX},${wy} v${WINH} M${wx},${WINY} h${WINW}" stroke="#cfe3ef" stroke-width="5"/><path d="M${wx + 20},${wy + 30} l40,-20 M${wx + 20},${wy + 70} l70,-40" stroke="#fff" stroke-width="7" opacity=".7"/>`;
  else {   // shattered: jagged glass remains round the frame + crack lines
    g += `<path d="M${wx},${wy} h${WINW} v40 l-30,-12 l-24,30 l-26,-22 l-20,26 l-30,-18 l-30,20Z" fill="#9cc6e4" stroke="${C.ink}" stroke-width="3" opacity=".9"/><path d="M${wx},${wy + WINH} h${WINW} v-36 l-34,10 l-20,-26 l-30,22 l-26,-18 l-24,24 l-26,-14Z" fill="#9cc6e4" stroke="${C.ink}" stroke-width="3" opacity=".9"/>`;
    g += `<path d="M${WINX},${wy} v${WINH} M${wx},${WINY} h${WINW}" stroke="#cfe3ef" stroke-width="5" opacity=".6"/>`;
  }
  g += `<rect x="${wx - 16}" y="${wy + WINH}" width="${WINW + 32}" height="16" fill="#e9e1d4" stroke="${C.ink}" stroke-width="4"/>`;
  // concrete chhajja over the window (+ the ball resting on it)
  g += `<path d="M${CHJ.x0},${CHJ.y} h${CHJ.x1 - CHJ.x0} l-14,26 h${-(CHJ.x1 - CHJ.x0) + 28}Z" fill="#d9d2c6" stroke="${C.ink}" stroke-width="5"/><rect x="${CHJ.x0}" y="${CHJ.y + 26}" width="${CHJ.x1 - CHJ.x0}" height="10" fill="#000" opacity=".15"/>`;
  if (o.ballOn) g += cball(o.ballX ?? WINX + 70, CHJ.y - 20 + (o.ballDy || 0), 20, o.ballRot || 0);
  // ---- the old drain pipe (+ clamps). o.pipeAng swings it about its foot; o.clamp = 0 ok / 1 creaking / 2 snapped ----
  const ang = o.pipeAng || 0, p1 = pipePt(GHH - 20, ang), tip = pipePt(GHH - 20, ang);
  g += `<path d="M${PIPE.x},${PIPE.y0 + 20} L${p1.x.toFixed(1)},${p1.y.toFixed(1)}" stroke="#7d8790" stroke-width="26" stroke-linecap="round"/><path d="M${PIPE.x},${PIPE.y0 + 20} L${p1.x.toFixed(1)},${p1.y.toFixed(1)}" stroke="${C.ink}" stroke-width="32" stroke-linecap="round" opacity=".25"/><path d="M${PIPE.x - 5},${PIPE.y0 + 10} L${(p1.x - 5).toFixed(1)},${(p1.y + 10).toFixed(1)}" stroke="#aab4bc" stroke-width="6"/>`;
  g += `<path d="M${(tip.x - 40).toFixed(1)},${(tip.y - 10).toFixed(1)} h50" stroke="#7d8790" stroke-width="24" stroke-linecap="round"/>`;
  [.25, .55, .85].forEach((u, k) => {   // clamps on the wall; the top one breaks
    const hy = (GHH - 20) * u, wp = { x: PIPE.x, y: PIPE.y0 - hy }, pp = pipePt(hy, ang);
    const broken = k === 2 && (o.clamp || 0) >= 2, creak = k === 2 && o.clamp === 1;
    g += `<rect x="${PIPE.x + 6}" y="${wp.y - 9}" width="22" height="18" fill="#5a5f66" stroke="${C.ink}" stroke-width="3"/>`;
    if (!broken) g += `<rect x="${(pp.x - 19).toFixed(1)}" y="${(pp.y - 7 + (creak ? 2 * Math.sin(t * 40) : 0)).toFixed(1)}" width="38" height="14" rx="4" fill="#5a5f66" stroke="${C.ink}" stroke-width="3"/>`;
    else g += `<path d="M${PIPE.x + 6},${wp.y - 6} l-14,-10 M${PIPE.x + 6},${wp.y + 6} l-16,8" stroke="#5a5f66" stroke-width="6"/>`;
  });
  if (o.inner) g += o.inner;   // e.g. Basim on the pipe (row coords)
  return g;
}
// Basim on the pipe (row coords): hands at the pipe point h above its foot. HANG = feet-to-hands distance at s = 1.
const HANG = 400;
function basimPipe(t, h, ang, o = {}) {
  const p = pipePt(h, ang), s = o.s || .9, sw = Math.sin(t * (o.kick ? 9 : 3));
  const mode = o.mode || 'hang';
  const pose = p2 => {
    if (mode === 'hang') { p2.armL.ab = p2.armR.ab = 2.75; p2.armL.el = p2.armR.el = .12; p2.armL.sw = p2.armR.sw = 0; p2.legL.sw = .35 * sw; p2.legR.sw = -.35 * sw; p2.legL.kn = .5; p2.legR.kn = .35; p2.lean = 0; }
    else { const c = Math.sin(t * 7); p2.armL.ab = 2.2 + .5 * c; p2.armR.ab = 2.2 - .5 * c; p2.armL.el = p2.armR.el = .4; p2.legL.sw = .6 + .4 * c; p2.legR.sw = .6 - .4 * c; p2.legL.kn = p2.legR.kn = 1.0; p2.lean = .05; }
  };
  return `<g transform="rotate(${(ang * .8 + (mode === 'hang' ? 4 * sw : 0)).toFixed(2)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})">` + basim({ x: p.x - 4 + (o.dx || 0), y: p.y + HANG * s, s, t, move: 'idle', mt: t, yaw: o.yaw ?? .25, expr: o.expr || 'scared', amp: o.amp || 0, pose }) + '</g>';
}
// Dadi's birthday cake (for the Ep 13 flash)
function cake(x, y, s = 1, rot = 0, t = 0) {
  let g = `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)})"><ellipse cx="0" cy="6" rx="150" ry="22" fill="#e9e4da" stroke="${C.ink}" stroke-width="5"/>`;
  g += `<rect x="-120" y="-110" width="240" height="112" rx="20" fill="#ff9ccd" stroke="${C.ink}" stroke-width="6"/><path d="M-120,-80 q30,30 60,0 q30,30 60,0 q30,30 60,0 q30,30 60,0" stroke="#fff" stroke-width="12" fill="none"/>`;
  g += `<rect x="-76" y="-196" width="152" height="90" rx="16" fill="#fff3d6" stroke="${C.ink}" stroke-width="6"/><path d="M-76,-170 q19,22 38,0 q19,22 38,0 q19,22 38,0 q19,22 38,0" stroke="#ff5a8a" stroke-width="10" fill="none"/>`;
  for (let k = 0; k < 5; k++) { const cx = -52 + k * 26; g += `<rect x="${cx - 5}" y="-240" width="10" height="44" fill="${['#3b8de5', '#e5463b', '#22a35a', '#ffd34a', '#c86bff'][k]}" stroke="${C.ink}" stroke-width="2"/><path d="M${cx},-244 q${-8 + 4 * Math.sin(t * 9 + k)},-12 0,-24 q${8 + 4 * Math.sin(t * 7 + k)},12 0,24" fill="#ffb330" stroke="#e5463b" stroke-width="2"/>`; }
  for (let k = 0; k < 7; k++) g += `<circle cx="${-100 + k * 33}" cy="${-30 + 10 * (k % 2)}" r="7" fill="${['#e5463b', '#ffd34a', '#22a35a'][k % 3]}"/>`;
  return g + '</g>';
}
