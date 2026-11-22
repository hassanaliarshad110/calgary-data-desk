
// ===== LONG (16:9) scenes
const DRAW = {};
const CITE7 = '— The Prince, Ch. 7 (tr. Marriott)', CITE20 = '— The Prince, Ch. 20 (tr. Marriott)', CITEW = '— Masnavi, Book I, Story XVI · prose summary (tr. E. H. Whinfield)';
// cold open: a toppled king under a raised gold knight
DRAW.L01 = (t, d) => { const k = onW('h1', 'power', 0.6);
  chessScene(t, d, { cam: camL(t, d, 1.12, 1.0, 0, 0, H * 0.55), pieces: [
    { k: 'queen', x: W * 0.56, y: H * 0.80, s: 1.3, fill: '#0A0708', rim: '#7A8494', rimA: 0.6, tilt: lerp(0, 1.45, easeOut(seg(t, 0.2, 1.0))) },
    { k: 'knight', x: W * 0.42, y: H * 0.78, s: 1.55, fill: '#0A0708', rim: M.gold2, rimA: 0.95, glow: 0.25 * k } ] });
  stampWord('YOU HAVE POWER', W / 2, H * 0.17, 88, '#FFFFFF', onW('h1', 'power', 0.4));
  stampWord('OVER AN ENEMY.', W / 2, H * 0.30, 88, M.gold2, onW('h1', 'enemy', 0.4));
  flash(since('h1', kw('h1', 'what')), '255,220,160', 0.3, 0.25); };
// two men, centuries apart — split red | blue panels
DRAW.L02 = (t, d) => { const a2 = act('n2', 0.3), a3 = act('n3', 0.3); const sx = lerp(0.5, a2 ? 0.62 : a3 ? 0.38 : 0.5, easeOut(seg(t, 4, 5.5)));
  splitMV(t, d, { sx,
    left: (mx, my) => { board(mx, my - 40, PT ? 700 : 760, 4, t, null, 180); knightPiece(mx - 40, my + 40, 1.1, '#0A0708', M.gold2, 0.9); robed(mx + 180, my + 60, 0.7, { rim: '#C0392B', rimA: 0.6 }); },
    right: (bx, by) => { P(dunePath(by - 40, 20, 5), grad(by - 60, H, '#3E4E76', '#18223E'), null); sandShadow(bx - 40, by + 40, 0.62, 'raise', 1, { sy: 0.3 }); sandShadow(bx + 170, by + 50, 0.55, 'fallen', 1, { sy: 0.3 }); sword(bx + 220, by - 20, 0.42, Math.PI - 0.2); } });
  chipAt('RENAISSANCE ITALY · 1503', W * 0.25, H * 0.12, onW('n2', 'duke', 0.4), '#FF8A6A', 30);
  chipAt("RUMI'S MASNAVI · 13TH CENTURY", W * 0.75, H * 0.12, onW('n3', 'warrior', 0.4), '#8FE0E0', 30); };
// title card
DRAW.L03 = (t, d) => { splitMV(t, d, {}); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, W, H);
  const k = easeOut(seg(t, 0.2, 0.9)); alpha(k, () => { txt('MACHIAVELLI', W * 0.25, H * 0.2, 54, '#FFB09A', 'Oswald', 700); txt('RUMI', W * 0.75, H * 0.2, 54, '#9FEAEA', 'Oswald', 700); });
  serifLabel('What Do You Do', W / 2, H * 0.40, 120, '#FFFFFF', onW('n4', 'what', 0.5)); serifLabel('With an Enemy?', W / 2, H * 0.56, 120, M.gold2, onW('n4', 'enemy', 0.5)); };
// ch1 open: Florence 1513
DRAW.L04 = (t, d) => { florenceNight(t, d); chipAt('FLORENCE · 1513', W / 2, H * 0.80, on('c1a', 0, 0.5), M.gold, 40); };
// the exile writes The Prince
DRAW.L05 = (t, d) => { const k = clamp(t / d);
  studyL(t, d, { desk: (dy) => { parchment(W * 0.43, dy + 70, 0.9, -0.05, k, { rows: 7 }); inkpot(W * 0.36, dy + 40, 0.8); book(W * 0.62, dy + 120, 0.7, t); } });
  chipAt('LOST HIS JOB · JAILED · TORTURED', W * 0.28, H * 0.12, onW('c1b', 'jailed', 0.4), '#FF8A6A', 28);
  chipAt('SAN CASCIANO, NEAR FLORENCE', W * 0.72, H * 0.12, onW('c1b', 'farm', 0.4), M.gold, 28); };
// The Prince + Cesare Borgia rises as a knight
DRAW.L06 = (t, d) => { const k = onW('c1c', 'cesare', 0.8);
  chessScene(t, d, { cam: camL(t, d, 1.0, 1.1, 20), back: () => { withT(W * 0.2, H * 0.3, 1.4, -0.1, () => { P(rr(-150, -200, 300, 400, 8), '#5A1A12', null); P(rr(-130, -180, 260, 360, 6), '#4A140E', '#C9962E', 3); txt('THE', 0, -60, 34, M.gold2, 'CrimsonText', 700); txt('PRINCE', 0, 0, 60, M.gold2, 'CrimsonText', 700); txt('1513', 0, 70, 30, M.gold, 'Oswald', 700); }); },
    pieces: [{ k: 'knight', x: W * 0.55, y: H * 0.80 + (1 - k) * 60, s: 1.2 + 0.2 * k, fill: '#120808', rim: '#FF6A4A', rimA: 0.95, glow: 0.3 * k, glowCol: '#C0392B', label: 'CESARE BORGIA', lk: k, lcol: '#FF8A6A' },
      { k: 'pawn', x: W * 0.72, y: H * 0.70, s: 0.9 }, { k: 'pawn', x: W * 0.40, y: H * 0.68, s: 0.85 }] }); };
// father's power behind him; castles of a state rise around the knight
DRAW.L07 = (t, d) => { const k1 = onW('c1d', 'father', 0.6), k2 = onW('c1d', 'built', 0.8);
  chessScene(t, d, { cam: camL(t, d, 1.04, 1.0, 20), pieces: [
    { k: 'queen', x: W * 0.68, y: H * 0.66, s: 1.6, fill: '#0A0708', rim: M.gold2, rimA: 0.8, glow: 0.35 * k1, label: 'POPE ALEXANDER VI', lk: k1 },
    { k: 'knight', x: W * 0.46, y: H * 0.82, s: 1.25, fill: '#120808', rim: '#FF6A4A', rimA: 0.95, label: 'BORGIA', lk: 1, lcol: '#FF8A6A' },
    ...[0, 1, 2, 3].map(i => ({ k: 'pawn', x: W * (0.2 + i * 0.09), y: H * 0.74 + (i % 2) * 40 + (1 - clamp(k2 * 4 - i)) * 400, s: 0.8, fill: '#1A0A0A', rim: '#FF6A4A', rimA: 0.6, a: clamp(k2 * 4 - i) })) ] });
  chipAt('HIS OWN STATE', W * 0.29, H * 0.55, k2, '#FF8A6A', 30); };
// 1503: the father's candle goes out; Borgia falls sick
DRAW.L08 = (t, d) => { const out = onW('c1e', 'died', 0.4), sick = onW('c1e', 'sick', 1.0);
  fullFill(grad(0, H, '#0E0708', '#020102')); const cx = W * 0.32, cy = H * 0.72;
  layers([{ z: 0.5, draw: () => { P(rr(-300, cy, W + 600, H, 0), '#140A06', null);
    if (out < 1) candleM(cx, cy + 10, t, 1.6 * (1 - out * 0.2), 160); else { candleM(cx, cy + 10, 0, 0.0001, 1); P(rr(cx - 26, cy - 230, 52, 240, 6), '#B8A888', null); }
    if (out > 0) { for (let i = 0; i < 8; i++) { const u = since('c1e', kw('c1e', 'died')) - i * 0.2; if (u < 0) continue; alpha(clamp(1 - u / 3) * 0.5, () => P(circ(cx + Math.sin(u * 2 + i) * 30 * u, cy - 260 - u * 90, 18 + u * 14), '#8A8A90', null)); } }
    withT(W * 0.64, cy + 30, 1, Math.sin(t * 1.3) * 0.06 * sick, () => knightPiece(0, 0, 1.4, '#120808', `rgba(255,${Math.round(lerp(106, 40, sick))},74,1)`, 0.95));
    glow(W * 0.64, cy - 160, 300, '#5A0E0E', 0.5 * sick); } }], camL(t, d, 1.0, 1.08, 10));
  ctx.fillStyle = `rgba(80,0,0,${0.18 * sick})`; ctx.fillRect(0, 0, W, H);
  chipAt('AUGUST 1503', W * 0.32, H * 0.14, out, M.gold, 40); chipAt('BORGIA · GRAVELY ILL', W * 0.64, H * 0.14, sick, '#FF8A6A', 32); };
// the plan for everything — except one line
DRAW.L09 = (t, d) => { const k = onW('c1f', 'planned', 1.2), ex = onW('c1f', 'except', 0.3);
  studyL(t, d, { figure: false, candleX: W * 0.82, cam: camL(t, d, 1.1, 1.18, 10, 0, H * 0.55), desk: (dy) => {
    parchment(W * 0.45, dy - 90, 1.75, -0.03, 1, { rows: 0, title: 'IF MY FATHER DIES…', checks: [clamp(k * 5), clamp(k * 5 - 1), clamp(k * 5 - 2), clamp(k * 5 - 3), ex > 0 ? 2 : 0] });
    if (ex > 0) { alpha(ex, () => { glow(W * 0.45 - 240, dy + 60, 120, '#C0392B', 0.5); }); } } });
  serifLabel('…except being close to death himself.', W / 2, H * 0.14, 60, '#FFB09A', ex, true); };
// Rome chooses: Borgia could block — he lets one man through
DRAW.L10 = (t, d) => { const blk = onW('c1g', 'block', 0.5), thr = onW('c1h', 'through', 1.0), inj = onW('c1h', 'injured', 0.6), jul = onW('c1h', 'julius', 0.8);
  hallSet(t, d, { cam: camL(t, d, 1.0, 1.08, 30), row: (fy) => { const n = 6; for (let i = 0; i < n; i++) { const x = W * (0.12 + i * 0.152); const isJ = i === 3; const fwd = isJ ? thr : 0;
      robed(x, fy + fwd * 120, 0.9 + fwd * 0.25, { rim: isJ && inj > 0 ? M.gold2 : 'rgba(200,180,255,0.6)', rimA: 0.7, glow: isJ ? 0.3 * jul : 0 }); }
    knightPiece(W * 0.9, fy + 120, 0.8, '#120808', '#FF6A4A', 0.95); chipAt('BORGIA', W * 0.9, fy + 160, 1, '#FF8A6A', 24);
    if (blk > 0 && thr < 1) alpha(blk * (1 - thr), () => { line(W * 0.08, fy - 10, W * 0.92, fy - 10, 'rgba(255,106,74,0.7)', 6); });
    if (inj > 0) alpha(inj, () => { ctx.save(); ctx.strokeStyle = '#C0392B'; ctx.lineWidth = 8; ctx.beginPath(); const x = W * (0.12 + 3 * 0.152); ctx.moveTo(x - 30, fy - 330 + thr * 80); ctx.lineTo(x + 26, fy - 260 + thr * 80); ctx.stroke(); ctx.restore(); }); } });
  chipAt('THE VOTE FOR A NEW POPE · 1503', W / 2, H * 0.10, on('c1g', 0, 0.5), M.gold, 30);
  chipAt('A CARDINAL HE HAD INJURED', W * 0.58, H * 0.20, inj * (1 - jul), '#FF8A6A', 30);
  chipAt('→ POPE JULIUS II', W * 0.58, H * 0.20, jul, M.gold, 34); };
// favours vs wounds on a scale
DRAW.L11 = (t, d) => { const k = onW('c1i', 'favours', 0.6), w2 = onW('c1i', 'wounds', 0.8);
  fullFill(grad(0, H, '#140A0C', '#030203')); glow(W / 2, H * 0.4, 700, '#FFB45A', 0.12);
  const tilt = lerp(0.18, -0.22, w2); // left = favours rises, right = wound sinks
  layers([{ z: 0.5, draw: () => scale(W / 2, H * 0.22, 0.95, -tilt, t, (x, y) => { for (let i = 0; i < 5; i++) alpha(clamp(k * 5 - i), () => P(ell(x - 50 + i * 24, y - i * 8, 30, 10), '#E2B04A', '#6A4A14', 2)); }, (x, y) => { alpha(w2, () => { P(circ(x, y - 30, 46), '#5A0E0E', null); line(x - 26, y - 56, x + 24, y - 4, '#FF6A4A', 7); glow(x, y - 30, 90, '#C0392B', 0.5); }); }) }], camL(t, d, 1.0, 1.06, 10));
  chipAt('FRESH FAVOURS', W / 2 - 330, H * 0.72, k, M.gold, 34); chipAt('OLD WOUNDS', W / 2 + 330, H * 0.72, w2, '#FF8A6A', 34); };
// quote cards q1, q1b over the study
DRAW.L12 = (t, d) => { studyL(t, d, { cam: camL(t, d, 1.05, 1.12, 14) }); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, W, H);
  qCard('q1', 'He who believes that new benefits will cause great personages to forget old injuries is deceived.', CITE7, ['benefits', 'forget', 'injuries', 'deceived'], { out: at('q1b', 0) - 0.4 });
  qCard('q1b', 'The duke erred in his choice, and it was the cause of his ultimate ruin.', CITE7, ['erred', 'ruin']); };
// not cruelty, not weakness: wishful thinking — then 'fear or hatred'
DRAW.L13 = (t, d) => { fullFill(grad(0, H, '#0E0708', '#020102')); bokeh(t, 14, '#FFB45A', 3, [0, 0, W, H], 40, 120, 0.08);
  const o1 = onW('c1k', 'cruelty', 0.3), o2 = onW('c1k', 'weakness', 0.3), o3 = onW('c1k', 'wishful', 0.4), fade = 1 - seg(GT, at('q2', 0) - 0.3, at('q2', 0) + 0.2);
  alpha(fade, () => { stampWord('NOT CRUELTY.', W / 2, H * 0.24, 80, 'rgba(255,255,255,0.75)', o1); stampWord('NOT WEAKNESS.', W / 2, H * 0.40, 80, 'rgba(255,255,255,0.75)', o2); stampWord('WISHFUL THINKING.', W / 2, H * 0.60, 110, M.gold2, o3, -0.03); });
  qCard('q2', 'For men injure either from fear or hatred.', CITE7, ['fear', 'hatred']); };
// a small figure throws a huge shadow (resentment handed power)
DRAW.L14 = (t, d) => { const k = onW('c1m', 'power', 1.2);
  fullFill(grad(0, H, '#1A1012', '#050304')); const fy = H * 0.80; P(rr(-100, fy, W + 200, H, 0), '#0A0606', null);
  layers([{ z: 0.3, draw: () => { alpha(0.9, () => withT(W * 0.62, fy, 1, 0, () => { ctx.scale(1 + k * 0.8, 1 + k * 0.8); person(0, 0, 1.0, { col: 'rgba(0,0,0,0.85)' }); })); } },
    { z: 0.6, draw: () => { glow(W * 0.2, fy - 100, 260, '#FFB45A', 0.5); candleM(W * 0.2, fy, t, 1.2, 100); person(W * 0.42, fy, 0.75, { rim: '#FF8A6A', rimA: 0.8, f: -1 }); } }], camL(t, d, 1.0, 1.05, 10));
  chipAt('RESENTMENT + POWER', W * 0.62, H * 0.12, k, '#FF8A6A', 34); };
// office: Maya takes credit; coffee + card; the panel
DRAW.L15 = (t, d) => { const A1 = act('c1n', 0.4), A2 = act('c1o', 0.4), A3 = GT >= at('c1p', 0) - 0.3;
  officeN(t, d, { cam: camL(t, d, 1.0, 1.06, 30), mid: (ty) => {
    if (A3) { table(W * 0.5, ty + 60, 900); const pk = onW('c1p', 'teammate', 0.6); [0.36, 0.5, 0.64].forEach((x, i) => person(W * x, ty + 30, 0.72, { sit: true, rim: i === 1 ? M.gold2 : 'rgba(150,180,230,0.6)', rimA: i === 1 ? 0.6 + 0.4 * pk : 0.6 })); if (pk > 0) glow(W * 0.5, ty - 140, 220, M.gold, 0.3 * pk);
      chipAt('HIRING PANEL', W / 2, H * 0.14, onW('c1p', 'promotion', 0.5), M.gold, 34); person(W * 0.14, ty + 40, 0.8, { hair: true, rim: '#FF8A6A', rimA: 0.8, f: 1 }); chipAt('MAYA', W * 0.14, ty + 80, 1, '#FF8A6A', 26);
      if (act('c1q', 0.3)) stampWord('ERASED?', W * 0.78, H * 0.30, 90, M.gold2, onW('c1q', 'erase', 0.4)); }
    else if (A2 || GT >= at('c1o', 0) - 0.3) { const k = on('c1o', 0, 0.5); table(W * 0.5, ty + 60, 1100); person(W * 0.36, ty + 120, 0.85, { hair: true, rim: '#FF8A6A', rimA: 0.8, f: 1 }); person(W * 0.66, ty + 120, 0.85, { rim: 'rgba(150,180,230,0.7)', rimA: 0.7, f: -1 });
      alpha(onW('c1o', 'coffee', 0.4), () => cup(W * 0.47, ty + 22, 0.9)); alpha(onW('c1o', 'compliments', 0.4), () => { P(rr(W * 0.40, H * 0.22, 220, 80, 30), 'rgba(240,240,255,0.9)', null); txt('Great job!', W * 0.40 + 110, H * 0.22 + 40, 32, '#1A2A4A', 'Montserrat', 800); });
      if (onW('c1o', 'birthday', 0.4) > 0) card(W * 0.56, ty - 70, 0.7, 0.08 - 0.08 * onW('c1o', 'birthday', 0.4)); chipAt('THIS YEAR', W / 2, H * 0.10, k, M.gold, 30); }
    else { const k = onW('c1n', 'credit', 0.6); table(W * 0.5, ty + 60, 1300); [0.22, 0.34, 0.66, 0.78].forEach((x, i) => person(W * x, ty + 40, 0.7, { sit: true, rim: 'rgba(150,180,230,0.5)', rimA: 0.5, f: x < 0.5 ? 1 : -1 }));
      person(W * 0.5, ty + 120, 0.95, { hair: true, rim: '#FF8A6A', rimA: 0.9 }); bulb(lerp(W * 0.80, W * 0.53, k), lerp(ty - 260, ty - 520, k), 0.9, 1); if (k > 0) chipAt('MAYA', W * 0.5, ty + 170, k, '#FF8A6A', 26);
      person(W * 0.88, ty + 140, 0.85, { rim: 'rgba(150,180,230,0.7)', rimA: 0.7, f: -1 }); chipAt('TEAMMATE', W * 0.88, ty + 190, k, M.gold, 26); chipAt('LAST YEAR', W / 2, H * 0.10, on('c1n', 0, 0.4), '#FF8A6A', 30); }
  } }); };
// the lesson: clear sight
DRAW.L16 = (t, d) => { studyL(t, d, { cam: camL(t, d, 1.08, 1.0, 20) }); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, W, H);
  stampWord('NOT REVENGE', W / 2, H * 0.18, 64, 'rgba(255,255,255,0.65)', onW('c1r', 'revenge', 0.3));
  const items = [['KNOW', 'know'], ['REPAIR', 'repair'], ['PREPARE', 'prepare']]; items.forEach(([s, w], i) => { const k = onW('c1r', w, 0.4); const x = W * (0.25 + i * 0.25); if (k > 0) withT(x, H * 0.44, back(k), 0, () => { P(rr(-170, -70, 340, 140, 18), 'rgba(10,6,8,0.8)', M.gold, 3); txt(s, 0, 4, 64, M.gold2, 'Oswald', 700); }); });
  stampWord('NEVER JUST HOPE', W / 2, H * 0.66, 90, '#FF8A6A', onW('c1r', 'never', 0.4), -0.04); };
// ch2: obstacles and a ladder of enemies
DRAW.L17 = (t, d) => { const k = onW('c2b', 'enemies', 1.5), rise = onW('c2b', 'rise', 1.0);
  cliffSet(t, d, { sun: rise, mid: (ex, top, gy) => { for (let i = 0; i < 3; i++) { const kk = clamp(k * 3 - i); if (kk > 0) person(ex + 160 + i * 150, gy, 0.7, { col: '#0A0508', rim: '#FF6A4A', rimA: 0.6 * kk, f: -1 }); }
    person(ex + 620, gy, 0.8, { rim: M.gold2, rimA: 0.9, f: -1 }); } });
  chipAt('THE PRINCE · CHAPTER 20', W / 2, H * 0.10, on('c2b', 0, 0.5), M.gold, 30); };
DRAW.L18 = (t, d) => { const lk = seg(GT, at('q3', 0), at('c2c', 0) + 4);
  cliffSet(t, d, { sun: 0.6 + 0.4 * lk, cam: camL(t, d, 1.0, 1.08, 0, 40), mid: (ex, top, gy) => { const cl = onW('c2c', 'rung', 1.2);
    ladder(ex + 90, top + 40, gy, lk, 6, act('c2c', 0.3) || GT > at('c2c', 0) ? ['DOUBTED YOU', 'SHUT THE DOOR', 'LAUGHED', 'SAID NO', 'BLOCKED YOU', 'WROTE YOU OFF'] : [], i => onW('c2c', ['doubted', 'doubted', 'door', 'door', 'rung', 'rung'][i], 0.5));
    person(ex + 90, lerp(gy, top + 300, cl), 0.55, { rim: M.gold2, rimA: 0.9 }); } });
  if (GT < at('c2c', 0) - 0.2) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, W, H); }
  qCard('q3', '…by them to mount higher, as by a ladder which his enemies have raised.', CITE20, ['higher', 'ladder', 'enemies'], { out: at('c2c', 0) - 0.3 }); };
// the girl cut from the team
DRAW.L19 = (t, d) => { const cut = onW('c2d', 'cut', 0.4), al = GT >= at('c2e', 0) - 0.2 && GT < at('c2f', 0) - 0.2, made = onW('c2f', 'makes', 0.5);
  gymSet(t, d, { lights: al ? 0.3 : 1, clock: () => { if (al) alarmClock(W * 0.5, H * 0.32, 1.1, t, onW('c2e', 'alarm', 0.2) * (1 - onW('c2e', 'every', 0.5)) + 0.2); }, mid: (fy) => {
    if (!al) { const gx = made > 0 ? lerp(W * 0.4, W * 0.62, made) : W * 0.40; person(gx, fy + 60, 0.95, { hair: true, rim: made > 0 ? M.gold2 : '#8FB8FF', rimA: 0.9 }); ball(gx + 110, fy - 90 - Math.abs(Math.sin(t * 5)) * 120 * made, 34, t * 4);
      person(W * 0.16, fy + 80, 1.0, { rim: '#FF6A4A', rimA: 0.7, f: 1 }); if (cut > 0 && made <= 0) { chipAt('CUT · "TOO SLOW"', W * 0.30, H * 0.16, cut, '#FF8A6A', 34); } if (made > 0) { chipAt('NEXT SEASON: ON THE TEAM', W / 2, H * 0.16, made, M.gold, 34); } }
    else { const run = since('c2e', 0); for (let i = 0; i < 5; i++) { const x = ((run * 260 + i * 420) % (W + 400)) - 200; alpha(0.25 + 0.15 * i, () => person(x, fy + 60, 0.7, { hair: true, rim: '#8FB8FF', rimA: 0.6 })); } chipAt('EVERY DAY · FOR A YEAR', W / 2, H * 0.62, onW('c2e', 'every', 0.4), M.gold, 32); } } }); };
// former rival crosses to your side
DRAW.L20 = (t, d) => { const cr = onW('c2h', 'joins', 2.5), door = onW('c2i', 'door', 0.8);
  officeN(t, d, { dawn: true, cam: camL(t, d, 1.0, 1.06, 30), mid: (ty) => { const dx = W * 0.5;
    P(rr(dx - 110, ty - 380, 220, 420, 6), `rgba(255,210,140,${0.15 + 0.7 * Math.max(door, cr * 0.6)})`, '#2A2E3A', 10); glow(dx, ty - 170, 320, '#FFD27A', 0.35 * Math.max(door, cr));
    person(W * 0.74, ty + 30, 0.95, { rim: M.gold2, rimA: 0.9, f: -1 }); chipAt('YOU', W * 0.74, ty + 70, 1, M.gold, 26);
    const rx = lerp(W * 0.22, W * 0.60, cr); person(rx, ty + 30, 0.95, { rim: cr > 0.5 ? M.gold2 : '#FF6A4A', rimA: 0.85, f: 1 }); chipAt(cr > 0.6 ? 'ALLY' : 'FORMER RIVAL', rx, ty + 70, on('c2g', 0, 0.5), cr > 0.6 ? M.gold : '#FF8A6A', 26); } });
  chipAt('MORE LOYALTY FROM THOSE FIRST DISTRUSTED · Ch. 20', W / 2, H * 0.10, onW('c2g', 'loyalty', 0.5) * (1 - onW('c2i', 'today', 0.5)), M.gold, 28);
  if (act('c2h', 0.2)) serifLabel('in essence', W / 2, H * 0.17, 40, M.parch, onW('c2h', 'show', 0.4), true); };
// ch3: travel east — moonlit desert, the Masnavi opens
DRAW.L21 = (t, d) => { const k = onW('c3b', 'masnavi', 0.8);
  desertL(t, d, { cam: camL(t, d, 1.0, 1.08, 40), mid: (y3) => { for (let i = 0; i < 5; i++) lantern(W * (0.1 + i * 0.2), y3 - 260 + Math.sin(i) * 30, 0.6, t + i, 200); } ,
    near: () => { if (k > 0) withT(W / 2, H * 0.68, 0.9 + 0.1 * k, 0, () => alpha(k, () => { book(0, 0, 1.4, t); glow(0, -40, 300, '#FFE2A0', 0.35 * k); })); } });
  ney(W * 0.18, H * 0.88, 520, -0.15, 1, onW('c3a', 'rumi', 0.8), 1);
  chipAt('THE MASNAVI · 13TH CENTURY', W / 2, H * 0.10, k, '#8FE0E0', 32); };
// the Lion of God — a lion traced in the stars (no portrait)
DRAW.L22 = (t, d) => { const k = clamp(seg(t, 0.3, d * 0.85)); const kl = onW('c3c', 'lion', 0.6);
  desertL(t, d, { moon: false, cam: camL(t, d, 1.0, 1.05, 10), sky: (hy) => { const pts = [[0.30, 0.42], [0.36, 0.28], [0.44, 0.22], [0.52, 0.26], [0.56, 0.36], [0.66, 0.38], [0.74, 0.34], [0.78, 0.44], [0.70, 0.50], [0.56, 0.50], [0.42, 0.52], [0.30, 0.42]];
    const n = Math.floor(k * (pts.length - 1) * 10) / 10; ctx.save(); ctx.strokeStyle = 'rgba(246,210,122,0.7)'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= Math.floor(k * (pts.length - 1)); i++) { const [x, y] = pts[i]; i ? ctx.lineTo(x * W, y * hy * 1.6) : ctx.moveTo(x * W, y * hy * 1.6); } ctx.stroke(); ctx.restore();
    pts.forEach(([x, y], i) => { if (i / (pts.length - 1) <= k + 0.01) { glow(x * W, y * hy * 1.6, 30, '#FFF6DE', 0.7); P(circ(x * W, y * hy * 1.6, 4), '#FFF6DE', null); } }); } });
  serifLabel('"the Lion of God"', W / 2, H * 0.74, 70, M.gold2, kl, true); chipAt('ALI · A GREAT WARRIOR OF EARLY ISLAM', W / 2, H * 0.10, onW('c3c', 'ali', 0.5), '#8FE0E0', 30); };
// the fight — told only through shadows on the sand
DRAW.L23 = (t, d) => { const sp = onW('c3e', 'spits', 0.25), fr = onW('c3f', 'stop', 0.3), win = onW('c3d', 'winning', 0.8);
  moonSand(t, d, { cam: camL(t, d, 1.0, 1.1, 20, 0, H * 0.65), mid: (hy) => { const gy = H * 1.02;
    sandShadow(W * 0.30, gy, 1.25, 'raise', 1, { sy: 0.78, skew: -0.3, sword: 0.35 + 0.25 * win });
    sandShadow(W * 0.74, gy, 1.2, 'stand', 1, { sy: lerp(0.78, 0.42, win), skew: lerp(0.3, 0.55, win) });
    if (sp > 0 && sp < 1) flash(since('c3e', kw('c3e', 'spits')), '192,57,43', 0.35, 0.45); } });
  if (fr > 0) { ctx.fillStyle = `rgba(40,0,0,${0.35 * fr})`; ctx.fillRect(0, 0, W, H); stampWord('STRIKE?', W / 2, H * 0.24, 140, '#FF6A4A', onW('c3f', 'strike', 0.3)); }
  chipAt('A FIGHT WITH AN ENEMY CHIEF · TOLD IN SHADOWS', W / 2, H * 0.08, on('c3d', 0, 0.5) * (1 - fr), '#8FE0E0', 28); };
// the sword drops into the sand; Whinfield's sentence
DRAW.L24 = (t, d) => { const dk = seg(GT, at('q4', kw('q4', 'dropped')) - 0.2, at('q4', kw('q4', 'dropped')) + 0.6);
  moonSand(t, d, { cam: camL(t, d, 1.08, 1.0, 10, 0, H * 0.6), near: () => { const sy = lerp(-300, H * 0.80, easeIn(dk)); sword(W * 0.82, sy, 1.0, lerp(0.6, Math.PI - 0.12, dk), { glint: (t * 0.4) % 1 }); if (dk >= 1) sandBurst(W * 0.82, H * 0.80, since('q4', kw('q4', 'dropped')) - 0.6); } });
  qCard('q4', "'Ali, instead of taking vengeance on him, at once dropped his sword, to the Magian's great astonishment.", CITEW, ['vengeance', 'dropped', 'sword', 'astonishment'], { cx: W * 0.40, pw: 1080, size: 54, goldCol: '#0D4C5C', mark: '#1E6F78' }); };
// why spare me? — the anger leaves the fight
DRAW.L25 = (t, d) => { const why = on('c3g', 0, 0.5), hi = onW('c3h', 'higher', 1.0), ang = onW('c3i', 'anger', 0.6), drop = onW('c3i', 'willing', 1.0);
  moonSand(t, d, { cam: camL(t, d, 1.0, 1.06, 20), mid: (y3) => { sandShadow(W * 0.62, H * 1.02, 1.2, 'stand', 1, { sy: 0.45, skew: 0.6 }); sandShadow(W * 0.36, H * 1.02, 1.2, 'stand', 1, { sy: 0.78, skew: -0.35 }); sword(W * 0.47, H * 0.74, 0.8, Math.PI - 0.12); if (hi > 0) { glow(W * 0.40, H * 0.36, 260, '#FFE2A0', 0.35 * hi); beam(W * 0.40, -50, 60, W * 0.40, H * 0.86, 320, '255,230,170', 0.22 * hi); } } });
  if (act('c3g', 0.2)) { serifLabel('"Why spare me?"', W / 2, H * 0.22, 80, '#FFFFFF', why, true); }
  if (GT > at('c3i', 0) - 0.2) { flameKing(W * 0.70, H * 0.55, 0.9, t, 1 - drop * 0.9, drop * 0.6); chipAt('ANGER ENTERS THE FIGHT', W * 0.70, H * 0.12, ang * (1 - drop), '#FF8A6A', 30); }
  if (act('c3h', 0.2)) chipAt('IN ESSENCE · A CAUSE HIGHER THAN PRIDE', W / 2, H * 0.10, on('c3h', 0, 0.5), M.gold, 30); };
// dawn: the enemy's whole family comes over
DRAW.L26 = (t, d) => { const k = onW('c3j', 'family', 2.0);
  desertL(t, d, { dawn: 0.4 + 0.6 * clamp(t / d), moon: false, cam: camL(t, d, 1.0, 1.06, 30), mid: (y3) => { for (let i = 0; i < 9; i++) { const kk = clamp(k * 9 - i); if (kk <= 0) continue; const x = W * 0.15 + i * 70 + kk * 300; alpha(kk, () => { person(x, y3 + 40 + (i % 2) * 10, 0.42 + (i % 3 === 0 ? 0.12 : 0), { rim: '#FFB45A', rimA: 0.7, f: 1 }); }); } lantern(W * 0.78, y3 - 120, 0.6, t, 120); } });
  chipAt('WHAT THE SWORD NEVER COULD', W / 2, H * 0.10, onW('c3j', 'sword', 0.5), M.gold, 30); };
// the spit was a weapon: strings from the enemy to the sword arm
DRAW.L27 = (t, d) => { const w = onW('c3k', 'weapon', 0.5), tmp = onW('c3l', 'temper', 0.5), ctl = onW('c3m', 'control', 0.6), cut = onW('c3m', 'second', 0.8);
  chessScene(t, d, { bg1: '#06101C', bg2: '#020408', spotCol: '#7FB8D8', cam: camL(t, d, 1.0, 1.08, 20), pieces: [
    { k: 'pawn', x: W * 0.70, y: H * 0.70, s: 1.3, fill: '#0A0A10', rim: '#FF6A4A', rimA: 0.8, label: w > 0 ? 'LAST PIECE: AN INSULT' : '', lk: w, lcol: '#FF8A6A' },
    { k: 'knight', x: W * 0.36, y: H * 0.72, s: 1.4, fill: '#06121A', rim: R.teal2, rimA: 0.9, label: 'YOUR TEMPER', lk: tmp, lcol: '#8FE0E0' } ],
    near: () => strings(W * 0.70, H * 0.36, [[W * 0.33, H * 0.42], [W * 0.38, H * 0.50], [W * 0.31, H * 0.56]], Math.max(tmp, ctl), cut) }); };
// the anger keeps fighting
DRAW.L28 = (t, d) => { const fade = onW('c3n', 'beaten', 0.8), inn = onW('c3n', 'anger', 0.6);
  moonSand(t, d, { cam: camL(t, d, 1.1, 1.0, 10), mid: (y3) => { alpha(1 - fade, () => sandShadow(W * 0.28, H * 1.02, 1.1, 'stand', 1, { sy: 0.7, skew: -0.3 })); } });
  withT(W * 0.62, H * 0.86, 1, 0, () => { person(0, 0, 1.25, { rim: R.teal2, rimA: 0.8 }); });
  if (inn > 0) { ctx.save(); withT(W * 0.62, H * 0.86 - 330, 1, 0, () => flameKing(0, 60, 0.42, t, inn, 0)); ctx.restore(); chipAt('THE FIGHT INSIDE', W * 0.62, H * 0.12, inn, '#FF8A6A', 30); } };
// ch4: mind vs heart labels
DRAW.L29 = (t, d) => { splitMV(t, d, {}); const k = onW('c4b', 'opposites', 0.5);
  alpha(easeOut(seg(t, 1.2, 1.9)), () => { txt('MIND', W * 0.25, H * 0.16, 90, '#FFB09A', 'Oswald', 700); txt('HEART', W * 0.75, H * 0.16, 90, '#9FEAEA', 'Oswald', 700); });
  serifLabel('"Never assume an old injury is forgotten."', W * 0.25, H * 0.32, 40, '#FFFFFF', onW('c4b', 'forgotten', 0.5), true);
  serifLabel('"Drop the sword."', W * 0.75, H * 0.32, 52, '#FFFFFF', onW('c4b', 'drop', 0.5), true);
  if (act('c4b', 0.2)) chipAt('OPPOSITES?', W / 2, H * 0.50, k * (1 - onW('c4b', 'forgotten', 0.4)), M.gold, 40); };
// a feeling at the wheel
function wheel(x, y, r, rot, col = '#C9962E') { withT(x, y, 1, rot, () => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = r * 0.14; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.stroke(); ctx.lineWidth = r * 0.1; for (let i = 0; i < 3; i++) { const a = i * 2.094; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke(); } ctx.restore(); P(circ(0, 0, r * 0.2), col, null); }); }
DRAW.L30 = (t, d) => { const hp = onW('c4c', 'hope', 0.5), an = onW('c4c', 'anger', 0.5), wl = onW('c4d', 'wheel', 0.6);
  splitMV(t, d, { left: (mx, my) => { knightPiece(mx, my + 40, 1.0, '#120808', '#FF6A4A', 0.95); if (hp > 0) { glow(mx, my - 300, 160, '#FFE2A0', 0.5 * hp); txt('HOPE', mx, my - 300, 56, '#FFE2A0', 'Oswald', 700); line(mx, my - 260, mx, my - 200, 'rgba(255,226,160,0.6)', 3); } },
    right: (bx, by) => { sword(bx + 160, by - 60, 0.5, Math.PI - 0.12); if (an > 0) { alpha(1 - 0.7 * an, () => flameKing(bx - 120, by - 40, 0.45, t, 1, 0)); txt('ANGER', bx - 120, by - 300, 56, '#FF8A6A', 'Oswald', 700); strike(bx - 210, by - 300, 180, onW('c4c', 'refused', 0.5)); } } });
  if (wl > 0) { ctx.fillStyle = `rgba(0,0,0,${0.55 * wl})`; ctx.fillRect(0, 0, W, H); withT(W / 2, H * 0.45, back(wl), 0, () => { wheel(0, 0, 200, Math.sin(t * 2) * 0.3); }); stampWord("DON'T LET A FEELING DRIVE", W / 2, H * 0.80, 64, M.gold2, wl); } };
// mind sees the enemy; heart sees itself
DRAW.L31 = (t, d) => { const m = onW('c4e', 'exactly', 0.6), h = onW('c4f', 'yourself', 0.6), pr = onW('c4f', 'pride', 0.5);
  splitMV(t, d, { sx: lerp(0.6, 0.4, seg(GT, at('c4f', 0) - 0.5, at('c4f', 0) + 0.5)),
    left: (mx, my) => { person(mx + 120, my + 30, 0.9, { col: '#0A0508', rim: '#FF6A4A', rimA: 0.8, f: -1 }); if (m > 0) withT(mx - 60, my - 220, 1, 0, () => { glow(0, 0, 160, '#FFE2A0', 0.3 * m); alpha(m, () => magnifier(0, 0, 1.1)); }); chipAt('NOT BETTER · NOT WORSE', mx, H * 0.28, onW('c4e', 'better', 0.4), M.gold, 28); },
    right: (bx, by) => { const mw = 260, mh = 420; withT(bx + 80, by - 220, 1, 0, () => { P(rr(-mw / 2, -mh / 2, mw, mh, mw / 2), 'rgba(150,200,230,0.18)', '#C9962E', 8); alpha(0.55, () => person(0, mh / 2 - 20, 0.75, { col: '#06121A', rim: R.teal2, rimA: 0.8, f: -1 })); if (pr > 0) withT(0, -40, 1, 0, () => flameKing(0, 60, 0.22, t, pr, 0)); }); person(bx - 160, by + 30, 0.9, { col: '#06121A', rim: R.teal2, rimA: 0.85, f: 1 }); chipAt('SEE YOURSELF', bx, H * 0.28, h, '#8FE0E0', 28); } });
  { const sxx = lerp(0.6, 0.4, seg(GT, at('c4f', 0) - 0.5, at('c4f', 0) + 0.5)) * W; alpha(0.9, () => { txt('MIND', sxx / 2, H * 0.16, 50, '#FFB09A', 'Oswald', 700); txt('HEART', sxx + (W - sxx) / 2, H * 0.16, 50, '#9FEAEA', 'Oswald', 700); }); } };
// midnight message
DRAW.L32 = (t, d) => { const b = onW('c4g', 'message', 0.5), mq = onW('c4h', 'mind', 0.5), hq = onW('c4h', 'heart', 0.5), pl = onW('c4h', 'plan', 0.6), mv = onW('c4i', 'move', 0.6);
  phoneSet(t, d, { px: W / 2, py: H * 0.47, ps: 1.05, glow: 0.6 + 0.4 * b, screen: () => { thornBubble(0, -120, 230, 110, b, '…really?'); if (mv > 0) { alpha(mv, () => { P(rr(-110, 60, 220, 90, 18), 'rgba(80,90,110,0.9)', null); txt('typing…', 0, 105, 26, '#FFFFFF', 'Montserrat', 700); }); } },
    near: (px, py, ps) => { strings(px, py - 340, [[px - 40, py + 200], [px + 60, py + 230]], pl, 0, '255,106,74'); } });
  serifLabel('What can they really do to me?', W * 0.22, H * 0.34, 44, '#FFB09A', mq, true); serifLabel('What does my anger want?', W * 0.78, H * 0.34, 44, '#9FEAEA', hq, true);
  serifLabel('Whose plan is that?', W * 0.78, H * 0.46, 50, M.gold2, pl, true);
  if (mv > 0) stampWord('THEIR MOVE', W / 2, H * 0.12, 70, '#FF6A4A', mv); };
// ch5: the paper exercise
DRAW.L33 = (t, d) => { const l = onW('c5c', 'left', 0.5), lw = onW('c5c', 'really', 1.5), r = onW('c5d', 'right', 0.5), rw = onW('c5d', 'anger', 1.5), no = onW('c5d', "don't", 0.5), mv = onW('c5e', 'move', 0.8), rung = onW('c5e', 'rung', 0.6), rival = onW('c5b', 'rival', 0.6);
  paperDesk(t, d, { paper: (pw, ph) => { const x1 = -pw / 2 + 50, x2 = 30;
    if (rival > 0) handwriteL('My rival: ________', 0, -ph / 2 + 80, 40, rival, '#3A2410', 'center', 'CrimsonText', 700);
    handwriteL('WHAT THEY COULD', x1, -ph / 2 + 160, 32, l, '#7A1414'); handwriteL('REALLY DO', x1, -ph / 2 + 200, 32, l, '#7A1414');
    ['• talk to my boss', '• take the client', '• that\'s… about it'].forEach((s, i) => handwriteL(s, x1, -ph / 2 + 280 + i * 60, 34, clamp(lw * 3 - i), '#1A2A4A', 'left', 'CrimsonText', 600));
    handwriteL('WHAT MY ANGER', x2, -ph / 2 + 160, 32, r, '#0D4C5C'); handwriteL('WANTS', x2, -ph / 2 + 200, 32, r, '#0D4C5C');
    ['• send the reply', '• tell everyone', '• get even'].forEach((s, i) => { handwriteL(s, x2, -ph / 2 + 280 + i * 60, 34, clamp(rw * 3 - i), '#1A2A4A', 'left', 'CrimsonText', 600); strike(x2, -ph / 2 + 282 + i * 60, 300, clamp(no * 3 - i)); });
    if (mv > 0) { handwriteL('ONE MOVE THAT MAKES ME STRONGER:', 0, ph / 2 - 200, 34, mv, '#7A4A10', 'center'); handwriteL('finish the certificate', 0, ph / 2 - 130, 44, mv, '#1A2A4A', 'center', 'CrimsonText', 700); }
  }, near: () => { if (rung > 0) { glow(W * 0.86, H * 0.5, 200, M.gold, 0.3 * rung); ladder(W * 0.9, H * 0.12, H * 0.92, rung, 6, []); } } });
  chipAt('MACHIAVELLI · BE HONEST, NOT HOPEFUL', W * 0.28, H * 0.06, onW('c5c', 'machiavelli', 0.4) * (1 - r), '#FF8A6A', 26);
  chipAt("RUMI'S BATTLEFIELD · THEN DON'T DO IT", W * 0.72, H * 0.06, onW('c5d', 'rumi', 0.4) * (1 - mv), '#8FE0E0', 26); };
// question
DRAW.L34 = (t, d) => { splitMV(t, d, {}); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, W, H);
  serifLabel('Seeing an enemy clearly?', W * 0.25, H * 0.36, 52, '#FFB09A', onW('c5f', 'seeing', 0.5), true); serifLabel('Putting down the sword?', W * 0.75, H * 0.36, 52, '#9FEAEA', onW('c5f', 'putting', 0.5), true);
  stampWord('MIND', W * 0.25, H * 0.56, 120, '#FF8A6A', onW('c5f', 'mind', 0.3)); stampWord('HEART', W * 0.75, H * 0.56, 120, '#8FE0E0', onW('c5f', 'heart', 0.3));
  chipAt('TELL ME IN THE COMMENTS', W / 2, H * 0.12, onW('c5f', 'comments', 0.4), M.gold, 34); };
DRAW.L35 = (t, d) => { endCard(t, d); };

function drawFrame(T) {
  GT = T; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, W, H);
  const i = SCENES.findIndex(s => T >= s.start && T < s.start + s.dur); const s = SCENES[i < 0 ? SCENES.length - 1 : i];
  const u = T - s.start; ctx.save(); DRAW[s.id](u, s.dur); ctx.restore(); ctx.filter = 'none'; ctx.globalAlpha = 1;
  if (u < 0.22 && s.start > 0) { ctx.fillStyle = `rgba(0,0,0,${1 - u / 0.22})`; ctx.fillRect(0, 0, W, H); }
  const nxt = SCENES[SCENES.indexOf(s) + 1]; if (nxt && s.start + s.dur - T < 0.12) { ctx.fillStyle = `rgba(0,0,0,${1 - (s.start + s.dur - T) / 0.12})`; ctx.fillRect(0, 0, W, H); }
  vign(0.55); grain(T); chapterCard(s, u);
  if (s.id !== 'L35') { watermark(T); captions(); }
}
// 1280x720 thumbnail drawn on the 1920x1080 canvas (downscaled by ffmpeg)
function drawThumb() {
  GT = at('q4', kw('q4', 'dropped')) + 2.2; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  splitMV(3, 6, { sx: 0.5, left: (mx, my) => { knightPiece(mx - 120, my + 40, 1.5, '#120808', '#FF6A4A', 0.95); chessPiece('queen', mx + 200, my + 30, 1.0, '#0A0708', '#7A8494', 0.6); },
    right: (bx, by) => { sword(bx + 40, by + 20, 0.95, Math.PI - 0.15, { glint: 0.5 }); sandBurst(bx + 40, by + 10, 0.25, 50); sandShadow(bx + 160, by + 20, 0.8, 'fallen', 1); } });
  vign(0.45);
  withT(W * 0.25, 120, 1, 0, () => { P(rr(-190, -42, 380, 84, 42), 'rgba(110,14,14,0.92)', M.gold2, 4); txt('MACHIAVELLI', 0, 3, 52, '#FFF3D6', 'Oswald', 700); });
  withT(W * 0.75, 120, 1, 0, () => { P(rr(-110, -42, 220, 84, 42), 'rgba(14,70,80,0.92)', M.gold2, 4); txt('RUMI', 0, 3, 52, '#FFF3D6', 'Oswald', 700); });
  bigText('YOUR', W / 2, 420, 150, '#FFFFFF', 1); bigText('ENEMY?', W / 2, 590, 190, M.gold2, 1);
  P(circ(W / 2, 830, 70), '#0A0608', M.gold, 5); txt('VS', W / 2, 834, 62, M.gold2, 'Oswald', 700);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(W - 110, H - 110, 70, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, W - 180, H - 180, 140, 140); ctx.restore();
}
function grabThumb() { drawThumb(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
