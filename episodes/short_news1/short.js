// ===== Awazzzz Short — "3 din, 5 jhatke" (vertical 1080x1920, 2.5D)
let GT = 0;
const ORANGE = '#FF8A1E';
function lt(id) { return GT - LINES[id].start; }
function act(id) { const L = LINES[id]; return L && GT >= L.start && GT < L.start + L.dur; }
function sky(c1, c2) { ctx.fillStyle = grad(0, H, c1, c2); ctx.fillRect(-300, -300, W + 600, H + 600); }
function shadow(x, y, w, a = 0.35) { alpha(a, () => P(ell(x, y, w, w * 0.16), '#000', null)); }
function depth(L, px = 0, zoom = 1) {
  L.forEach(l => { ctx.save(); const s = 1 + (zoom - 1) * (0.25 + l.z); ctx.translate(W / 2, 820); ctx.scale(s, s); ctx.translate(-W / 2 - px * l.z, -820); l.draw(); ctx.restore(); if (l.haze) { ctx.fillStyle = 'rgba(8,10,18,0.25)'; ctx.fillRect(0, 0, W, H); } });
}
function drift(t, d, a = 50) { return lerp(-a, a, ease(seg(t, 0, d))); }
function chip(s, x, y, size, bg, fg = C.ink) { ctx.font = `700 ${size}px Oswald`; const w = ctx.measureText(s).width + size * 1.1; P(rr(x - w / 2, y - size * 0.85, w, size * 1.7, size * 0.85), bg, C.ink, 4); txt(s, x, y + 2, size, fg, 'Oswald', 700); }
function logoCircle(x, y, r) { const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.clip(); if (L && L.complete) ctx.drawImage(L, x - r * 1.04, y - r * 1.04, r * 2.08, r * 2.08); ctx.restore(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.strokeStyle = C.amber; ctx.lineWidth = Math.max(2, r * 0.06); ctx.stroke(); }
function brandText(x, y, size, align = 'left') { ctx.font = `700 ${size}px Oswald`; const w1 = ctx.measureText('Awazzzz ').width, w2 = ctx.measureText('ORIGINALS').width; let x0 = align === 'left' ? x : align === 'right' ? x - w1 - w2 : x - (w1 + w2) / 2; txt('Awazzzz ', x0, y, size, C.white, 'Oswald', 700, 'left'); txt('ORIGINALS', x0 + w1, y, size, ORANGE, 'Oswald', 700, 'left'); }
function flash(t, col = '#fff', d = 0.18) { if (t >= 0 && t < d) alpha((1 - t / d) * 0.7, () => { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); }); }
function siren(x, y, t, s = 1) { const on = Math.floor(t * 6) % 2; glow(x, y, 200 * s, on ? '#FF2E2E' : '#2E6BFF', 0.5); withT(x, y, s, 0, () => { P(rr(-60, -12, 120, 24, 8), '#222', C.ink, 3); P(rr(-55, -9, 50, 18, 5), on ? '#FF4A4A' : '#5A1414', null); P(rr(5, -9, 50, 18, 5), on ? '#1A2A6A' : '#3A7BFF', null); }); }

// stage area: y 420..1180
const SY = 1180;
const EVENTS = { s02: ['1', 'NVIDIA · 12 NOV'], s03: ['2', 'MICROSOFT · 12–13 NOV'], s04: ['3', 'BROOKLYN · 11 NOV'], s05: ['4', 'NEW ORLEANS · 13 NOV'], s06: ['5', 'FAA · 13 NOV'] };
const DRAW = {};
DRAW.s01 = (t, d) => {
  depth([
    { z: 0.05, draw: () => { sky('#1A0508', '#05070D'); for (let i = 0; i < 40; i++) alpha(0.3, () => P(circ(rnd(i) * W, 380 + rnd(i + 4) * 900, 3), C.red, null)); } },
    { z: 0.5, draw: () => { // three calendar pages
      ['11', '12', '13'].forEach((dd, i) => { const k = back(seg(t, 0.15 + i * 0.35, 0.5 + i * 0.35)); if (k <= 0) return; withT(260 + i * 280, 640 + (i == 1 ? -30 : 0), k, (i - 1) * 0.08, () => { shadow(0, 210, 120, 0.4); P(rr(-120, -170, 240, 340, 14), C.white, C.ink, 6); P(rr(-120, -170, 240, 80, [14, 14, 0, 0]), C.red, C.ink, 6); txt('NOV', 0, -128, 46, C.white); txt(dd, 0, 40, 150, C.ink); }); });
    } },
    { z: 1, draw: () => { const k = back(seg(t, 1.3, 1.7)); if (k > 0) withT(W / 2, 1020, k, -0.05, () => { glow(0, 0, 300, C.red, 0.45); txtStroke('5 JHATKE', 0, 0, 150, C.amber, C.ink, 18); }); } },
  ], drift(t, d, 30), lerp(1, 1.08, ease(t / d)));
  flash(t - 1.3, '#FF3030');
};
DRAW.s02 = (t, d) => {
  depth([
    { z: 0.08, haze: 1, draw: () => { sky('#0D1A10', '#05080A'); for (let i = 0; i < 9; i++) for (let j = 0; j < 6; j++) alpha(0.25, () => P(rr(60 + i * 115, 420 + j * 120, 90, 90, 10), '#14B866', null)); } },
    { z: 0.5, draw: () => { // chip
      withT(W / 2, 640, 1, 0, () => { glow(0, 0, 320, C.green, 0.35); P(rr(-170, -170, 340, 340, 26), '#1C2A20', C.green, 6); for (let i = -3; i <= 3; i++) { line(i * 44, -170, i * 44, -210, C.green, 6); line(i * 44, 170, i * 44, 210, C.green, 6); line(-170, i * 44, -210, i * 44, C.green, 6); line(170, i * 44, 210, i * 44, C.green, 6); } txt('NVIDIA', 0, -10, 64, C.green); txt('AI CHIPS', 0, 54, 32, C.grey, 'Oswald', 500); });
    } },
    { z: 1, draw: () => { // empty CEO chair with leather jacket, nameplate falls
      shadow(W / 2, 1150, 260, 0.5);
      P(rr(W / 2 - 150, 820, 300, 230, 40), '#2A2A30', C.ink, 6); P(rr(W / 2 - 170, 1010, 340, 60, 20), '#33333A', C.ink, 6); line(W / 2, 1070, W / 2, 1140, C.ink, 14); line(W / 2 - 110, 1150, W / 2 + 110, 1150, C.ink, 12);
      P(new Path2D(`M${W / 2 - 140} 860 Q${W / 2} 820 ${W / 2 + 140} 860 L${W / 2 + 120} 1000 L${W / 2 - 120} 1000 Z`), '#111114', C.ink, 5); line(W / 2, 860, W / 2, 990, '#555', 4);
      const fk = easeIn(seg(t, 1.2, 1.8)); withT(W / 2, lerp(780, 1110, fk), 1, lerp(0, 0.9, fk), () => { P(rr(-150, -40, 300, 80, 10), '#C9A227', C.ink, 5); txt('CEO', 0, 3, 48, C.ink); });
    } },
  ], drift(t, d, 40), lerp(1, 1.1, ease(t / d)));
  if (t > 2.2) stamp('ISTIFA', W / 2, 520, 110, C.red, t - 2.2, -0.12);
};
DRAW.s03 = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#081426', '#04070E'); for (let i = 0; i < 60; i++) alpha(0.3 + 0.3 * Math.sin(t * 3 + i), () => P(circ(rnd(i) * W, 400 + rnd(i + 2) * 760, 4), '#7FB4FF', null)); } },
    { z: 0.35, draw: () => { // globe with red pings
      withT(W / 2, 560, 1, 0, () => { glow(0, 0, 300, '#3A7BD5', 0.3); P(circ(0, 0, 210), '#173A6B', C.ink, 6); ctx.save(); ctx.clip(circ(0, 0, 210)); for (let i = 0; i < 6; i++) P(ell(-160 + rnd(i) * 320, -150 + rnd(i + 3) * 300, 50 + rnd(i) * 60, 30 + rnd(i + 1) * 40), '#2E7D5B', null); ctx.restore();
        for (let i = 0; i < 7; i++) { const a = rnd(i + 11) * 6.28, r = rnd(i + 5) * 170, u = ((t * 1.3 + rnd(i)) % 1); P(circ(Math.cos(a) * r, Math.sin(a) * r, 10), C.red, null); alpha(1 - u, () => { ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 10 + u * 60, 0, 6.28); ctx.stroke(); }); } });
    } },
    { z: 1, draw: () => { // laptop with mail error
      withT(W / 2, 1110, 1.25, 0, () => { shadow(0, 14, 230, 0.4); P(rr(-200, -260, 400, 260, 14), '#2A2F3A', C.ink, 6); P(rr(-184, -244, 368, 228, 6), '#F2F4F8', null); P(rr(-70, -210, 140, 96, 8), '#3A7BD5', C.ink, 4); line(-70, -210, 0, -150, C.ink, 4); line(70, -210, 0, -150, C.ink, 4); const sh = wob(t, 6, 6); withT(sh, -70, 1, 0, () => { P(circ(0, 0, 34), C.red, C.ink, 4); txt('!', 0, 3, 48, C.white); }); txt('Email nahi khul raha…', 0, -38, 26, '#444', 'Baloo2', 700); P(poly([-240, 0, 240, 0, 220, -18, -220, -18]), '#3A404C', C.ink, 5); });
    } },
  ], drift(t, d, 30), lerp(1, 1.08, ease(t / d)));
  if (t > 1.6) chip('OUTLOOK · TEAMS DOWN', W / 2, 820, 46, C.red, C.white);
};
DRAW.s04 = (t, d) => {
  const k = easeIn(seg(t, 0.9, 2.4));
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#3A4458', '#141822'); for (let i = 0; i < 8; i++) P(rr(i * 140 - 20, 760 - rnd(i) * 300, 120, 600, 4), '#2A3040', null); } },
    { z: 0.45, draw: () => { // crane
      line(860, 1100, 860, 420, '#E8B04A', 14); line(600, 440, 1000, 440, '#E8B04A', 12); line(860, 420, 640, 440, '#E8B04A', 6); line(700, 440, 700, 620, '#888', 3);
    } },
    { z: 0.7, draw: () => { // brick building collapsing
      ctx.save(); ctx.translate(430, 1110); const sag = k;
      for (let r = 0; r < 3; r++) { const fall = clamp(sag * 1.6 - r * 0.25); ctx.save(); ctx.translate(fall * (r % 2 ? 40 : -30), fall * (260 - r * 40) * 0 + fall * r * 90); ctx.rotate(fall * (r - 1) * 0.12); P(rr(-200, -(r + 1) * 180, 400, 180, 4), '#9C4A2E', C.ink, 5); for (let j = 0; j < 3; j++) P(rr(-160 + j * 120, -(r + 1) * 180 + 50, 80, 90, 4), '#F4D06F', C.ink, 3); ctx.restore(); }
      ctx.restore();
      for (let i = 0; i < 26; i++) { const u = seg(t, 1.3, 3.2); if (u <= 0) break; alpha(0.55 * (1 - u * 0.6), () => P(circ(430 + (rnd(i) - 0.5) * 520 * u + (rnd(i + 3) - 0.5) * 80, 1080 - rnd(i + 7) * 380 * u, 40 + rnd(i) * 80 * u), '#B9B2A6', null)); }
    } },
    { z: 1, draw: () => { withT(860, 1150, 1.1, 0, () => { P(rr(-170, -110, 340, 100, 12), '#C62828', C.ink, 5); P(rr(80, -150, 90, 50, 8), '#C62828', C.ink, 4); P(circ(-110, -10, 30), '#111', null); P(circ(110, -10, 30), '#111', null); txt('FDNY', -20, -60, 40, C.white); }); siren(830, 975, t, 0.9); } },
  ], drift(t, d, 30), lerp(1, 1.08, ease(t / d)));
};
DRAW.s05 = (t, d) => {
  const hit = seg(t, 1.2, 2.2), tilt = easeOut(seg(t, 1.9, 3.6));
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#7FA6C9', '#D9E4EE'); skyline(820, '#6A7A8E', 31, 220, '#C9D3DF', 70); } },
    { z: 0.4, draw: () => { ctx.fillStyle = '#4A6A6E'; ctx.fillRect(-200, 840, W + 400, 600); for (let i = 0; i < 12; i++) line(rnd(i) * W, 880 + rnd(i + 2) * 280, rnd(i) * W + 80, 880 + rnd(i + 2) * 280, 'rgba(255,255,255,0.35)', 3); } },
    { z: 0.75, draw: () => { // paddlewheel riverboat tilting
      withT(380, 1000, 1, tilt * 0.9, () => { P(rr(-260, -40, 520, 90, 16), '#F2F2F2', C.ink, 5); P(rr(-220, -130, 440, 90, 10), '#FFFFFF', C.ink, 5); P(rr(-170, -200, 340, 70, 10), '#FFFFFF', C.ink, 5); for (let i = 0; i < 6; i++) P(rr(-200 + i * 70, -110, 44, 40, 6), '#9CC3E0', C.ink, 3); P(rr(-40, -260, 40, 60, 6), C.red, C.ink, 4); P(circ(-280, 0, 70), '#C62828', C.ink, 5); for (let i = 0; i < 6; i++) line(-280, 0, -280 + Math.cos(i + t) * 70, Math.sin(i + t) * 70, C.ink, 4); });
      if (tilt > 0.3) for (let i = 0; i < 8; i++) P(circ(180 + rnd(i) * 300, 1090 + rnd(i + 3) * 40 + wob(t, 0.8, 6, i), 14), '#FF8A1E', C.ink, 3);
    } },
    { z: 1, draw: () => { // tanker bow pushing in
      const x = lerp(1400, 760, easeOut(hit)); withT(x, 960, 1, 0, () => { P(poly([-60, -160, 600, -160, 600, 140, 20, 140, -120, 0]), '#2A2F3A', C.ink, 6); P(rr(-40, -160, 640, 40, 4), '#C62828', null); txt('TANKER', 260, -10, 60, C.white); }); if (hit >= 1 && t < 2.6) flash(t - 2.2, '#fff'); } },
  ], drift(t, d, 30), lerp(1, 1.08, ease(t / d)));
  if (t > 3.4) chip('SAB SURAKSHIT NIKAALE GAYE', W / 2, 520, 40, C.green);
};
DRAW.s06 = (t, d) => {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#F2A65A', '#5A6E9A'); P(circ(800, 560, 80), '#FFE3A8', null); } },
    { z: 0.45, draw: () => { ctx.fillStyle = '#3A3F4B'; ctx.fillRect(-200, 920, W + 400, 600); for (let i = 0; i < 10; i++) P(rr(i * 130 - 40, 1010, 70, 12, 4), '#F2F2F2', null); for (let i = 0; i < 3; i++) withT(200 + i * 330, 900, 0.9, 0, () => { shadow(0, 40, 140, 0.35); P(rr(-150, -24, 300, 48, 24), '#F2F2F2', C.ink, 4); P(poly([-20, 0, -90, 80, -40, 0]), '#D9D9D9', C.ink, 3); P(poly([-20, 0, -90, -60, -40, 0]), '#D9D9D9', C.ink, 3); P(poly([120, -20, 150, -70, 150, -20]), '#3A7BD5', C.ink, 3); }); } },
    { z: 0.9, draw: () => { // departures board
      withT(W / 2, 610, 0.92, 0, () => { shadow(0, 230, 380, 0.4); P(rr(-420, -200, 840, 400, 16), '#0B0F17', C.ink, 6); txt('DEPARTURES', 0, -150, 50, C.amber); const cities = ['NEW YORK', 'CHICAGO', 'DALLAS', 'LOS ANGELES']; cities.forEach((c, i) => { txt(c, -360, -70 + i * 70, 40, C.white, 'Oswald', 600, 'left'); const on = t > 0.6 + i * 0.25; txt(on ? 'GROUNDED' : 'ON TIME', 360, -70 + i * 70, 40, on ? C.red : C.green, 'Oswald', 700, 'right'); }); });
    } },
  ], drift(t, d, 30), lerp(1, 1.06, ease(t / d)));
  if (t > 1.9) withT(W / 2, 1060, back(seg(t, 1.9, 2.3)), 0, () => { P(poly([-90, -217, 90, -217, 217, -90, 217, 90, 90, 217, -90, 217, -217, 90, -217, -90]).constructor === Path2D ? (() => { const p = new Path2D(); const r = 150; for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; i ? p.lineTo(Math.cos(a) * r, Math.sin(a) * r) : p.moveTo(Math.cos(a) * r, Math.sin(a) * r); } p.closePath(); return p; })() : null, C.red, C.white, 10); txt('STOP', 0, 4, 90, C.white); });
};
DRAW.s07 = (t, d) => {
  sky('#0B0F17', '#121B2B'); glow(W / 2, 760, 600, C.amber, 0.12);
  const icons = ['NVIDIA', 'OUTLOOK', 'BROOKLYN', 'CRUISE', 'FLIGHTS'];
  const pts = icons.map((s, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [W / 2 + Math.cos(a) * 300, 760 + Math.sin(a) * 300]; });
  const cut = seg(t, LINES.s07.dur * 0.3, LINES.s07.dur * 0.42);
  ctx.setLineDash([16, 12]); ctx.lineWidth = 6;
  for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) { const k = seg(t, 0.2 + (i + j) * 0.08, 0.6 + (i + j) * 0.08); if (k <= 0) continue; alpha(k * (1 - cut), () => { ctx.strokeStyle = C.red; ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(lerp(pts[i][0], pts[j][0], k), lerp(pts[i][1], pts[j][1], k)); ctx.stroke(); }); }
  ctx.setLineDash([]);
  pts.forEach(([x, y], i) => withT(x, y, back(seg(t, i * 0.1, 0.3 + i * 0.1)), 0, () => { P(circ(0, 0, 92), '#1C2538', C.amber, 6); txt(icons[i], 0, 4, 30, C.white); }));
  if (cut < 0.5) withT(W / 2, 760, 1, 0, () => txtStroke('?', 0, 0, 220, C.amber, C.ink, 14));
  else { withT(W / 2, 760, back(seg(t, LINES.s07.dur * 0.42, LINES.s07.dur * 0.5)), 0, () => { P(rr(-190, -70, 380, 140, 70), C.green, C.ink, 6); txt('JUDA NAHI', 0, 4, 64, C.ink); }); }
  if (t > LINES.s07.dur * 0.62) stamp('HAMLE KA SANKET NAHI', W / 2, 1120, 58, C.green, t - LINES.s07.dur * 0.62, -0.04);
};
DRAW.s08 = (t, d) => {
  sky('#0A1022', '#05070D');
  const pulled = t > LINES.s08.dur * 0.32;
  // one socket, five devices
  const dev = [['💡', 260], ['✈', 430], ['✉', 600], ['🏦', 770]];
  withT(W / 2, 560, 1, 0, () => { P(rr(-90, -60, 180, 120, 20), '#E9EEF5', C.ink, 5); P(circ(-30, 0, 12), C.ink, null); P(circ(30, 0, 12), C.ink, null); });
  const px = pulled ? lerp(0, 140, easeOut(seg(t, LINES.s08.dur * 0.32, LINES.s08.dur * 0.4))) : 0;
  P(rr(W / 2 - 50 + px, 620, 100, 60, 12), '#444', C.ink, 4); ctx.strokeStyle = '#444'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(W / 2 + px, 680); ctx.bezierCurveTo(W / 2 + px, 780, 300, 760, 300, 860); ctx.lineTo(820, 860); ctx.stroke();
  dev.forEach(([e, x], i) => withT(x, 900, 1, 0, () => { glow(0, 0, 110, pulled ? '#000' : C.amber, pulled ? 0 : 0.35); P(rr(-70, -60, 140, 120, 18), pulled ? '#1A1D24' : '#2A3550', C.ink, 5); alpha(pulled ? 0.25 : 1, () => txt(e, 0, 4, 64, C.white, 'Inter', 700)); }));
  if (pulled) chip('EK GADBAD = SAB BAND', W / 2, 1060, 46, C.red, C.white);
  const sk = back(seg(t, LINES.s08.dur * 0.7, LINES.s08.dur * 0.7 + 0.35));
  if (sk > 0) withT(W / 2, 1210, sk * (Math.floor(t * 4) % 2 ? 1.04 : 1), 0, () => { P(rr(-260, -60, 520, 120, 60), '#E62117', C.ink, 6); txt('SUBSCRIBE', 0, 4, 64, C.white); });
};

// ---------- persistent layout ----------
function header(T) {
  P(rr(40, 150, 1000, 96, 48), 'rgba(8,11,18,0.78)', null); logoCircle(100, 198, 38); brandText(155, 200, 46, 'left');
  // counter dots
  let n = 0; for (const id in EVENTS) if (LINES[id] && T >= LINES[id].start) n = +EVENTS[id][0];
  for (let i = 1; i <= 5; i++) { const on = i <= n; withT(560 + i * 82, 198, 1, 0, () => { P(circ(0, 0, 30), on ? C.red : 'rgba(255,255,255,0.12)', C.ink, 3); txt(String(i), 0, 3, 34, on ? C.white : C.grey); }); }
  const top = T < LINES.s02.start ? '3 DIN · 5 JHATKE' : (T >= LINES.s07.start ? 'KYA SAB JUDA HAI?' : '3 DIN · 5 JHATKE');
  txtStroke(top, W / 2, 330, 84, C.amber, C.ink, 12);
}
function eventTag(T) { for (const id in EVENTS) if (act(id)) { const u = lt(id); withT(W / 2, 1250, back(seg(u, 0.1, 0.4)), 0, () => chip(EVENTS[id][0] + ' · ' + EVENTS[id][1], 0, 0, 42, C.amber)); } }
function chunks(roman, dur) {
  const words = roman.split(' '); const parts = []; let cur = '';
  words.forEach(w => { if ((cur + ' ' + w).trim().length > 24 && cur) { parts.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }); if (cur) parts.push(cur);
  const tot = parts.reduce((a, s) => a + s.length, 0); let acc = 0; return parts.map(s => { const st = acc / tot * dur; acc += s.length; return [st, acc / tot * dur, s]; });
}
const CH = {}; for (const id in LINES) CH[id] = chunks(LINES[id].roman, LINES[id].dur);
function subtitles() {
  for (const id in LINES) { if (!act(id)) continue; const u = GT - LINES[id].start; const c = CH[id].find(c => u >= c[0] && u < c[1] + 0.05) || CH[id][CH[id].length - 1];
    const pop = 1 + 0.08 * (1 - seg(u - c[0], 0, 0.12));
    withT(W / 2, 1400, pop, 0, () => { ctx.font = '800 76px Baloo2'; const w = ctx.measureText(c[2]).width + 70; P(rr(-w / 2, -62, w, 124, 24), 'rgba(8,11,18,0.8)', null); txt(c[2], 0, 6, 76, /\d/.test(c[2]) ? C.amber : C.white, 'Baloo2', 800); }); }
}
function drawFrame(T) {
  GT = T; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H);
  const s = SCENES.find(s => T >= s.start && T < s.start + s.dur) || SCENES[SCENES.length - 1];
  ctx.save(); DRAW[s.id](T - s.start, s.dur); ctx.restore();
  const u = T - s.start; if (u < 0.1 && s.start > 0) alpha(1 - u / 0.1, () => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); });
  vignette(); header(T); eventTag(T); subtitles();
  // bottom safe area: keep dark for YouTube UI
  ctx.fillStyle = grad(1520, H, 'rgba(0,0,0,0)', 'rgba(0,0,0,0.6)'); ctx.fillRect(0, 1520, W, H - 1520);
}
