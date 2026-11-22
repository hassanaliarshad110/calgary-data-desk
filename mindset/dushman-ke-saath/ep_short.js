
// ===== SHORT (9:16) scenes — native portrait recompositions of chapter 3/4
DRAW.S1 = (t, d) => { const dk = seg(GT, at('s1', kw('s1', 'dropped')) - 0.3, at('s1', kw('s1', 'dropped')) + 0.45);
  moonSand(t, d, { cam: camL(t, d, 1.1, 1.0, 0, 0, H * 0.55), mid: () => { sandShadow(W * 0.36, H * 1.0, 1.5, dk < 0.5 ? 'raise' : 'stand', 1, { sy: 0.72, skew: -0.25, sword: 0.4 }); sandShadow(W * 0.74, H * 1.0, 1.4, 'stand', 1, { sy: 0.42, skew: 0.5 }); },
    near: () => { const sy = lerp(-200, H * 0.66, easeIn(dk)); sword(W * 0.56, sy, 1.15, lerp(0.7, Math.PI - 0.1, dk), { glint: (t * 0.5) % 1 }); if (dk >= 1) sandBurst(W * 0.56, H * 0.66, since('s1', kw('s1', 'dropped')) - 0.45, 70); } });
  const hk = 1 - seg(t, 2.0, 2.3); if (hk > 0) alpha(hk, () => { stampWord('WHY DROP THE SWORD?', W / 2, 300, 66, '#FFFFFF', easeOut(seg(t, 0.05, 0.35)), 0); }); };
DRAW.S2 = (t, d) => { const win = on('sA', kw('sA', 'winning'), 0.8), sp = onW('sE', 'spits', 0.25);
  moonSand(t, d, { cam: camL(t, d, 1.0, 1.1, 0, 0, H * 0.6), mid: () => { sandShadow(W * 0.30, H * 1.0, 1.55, 'raise', 1, { sy: 0.8, skew: -0.22, sword: 0.35 + 0.2 * win }); sandShadow(W * 0.76, H * 1.0, 1.45, 'stand', 1, { sy: lerp(0.8, 0.45, win), skew: lerp(0.2, 0.5, win) });
    if (sp > 0 && sp < 1) flash(since('sE', kw('sE', 'spits')), '192,57,43', 0.35, 0.45); } });
  chipAt('A STORY BY RUMI · TOLD IN SHADOWS', W / 2, 250, on('sA', 0, 0.5), '#8FE0E0', 32);
  if (sp > 0) stampWord('INSULT', W / 2, 520, 110, '#FF6A4A', sp); };
DRAW.S3 = (t, d) => {
  moonSand(t, d, { cam: camL(t, d, 1.05, 1.0, 0, 0, H * 0.6), near: () => { sword(W * 0.5, H * 0.62, 1.2, Math.PI - 0.1, { glint: (t * 0.4) % 1 }); sandBurst(W * 0.5, H * 0.62, t * 0.6 + 0.3, 40); } });
  qCard('sQ', "'Ali, instead of taking vengeance on him, at once dropped his sword, to the Magian's great astonishment.", '— Masnavi, Book I (tr. Whinfield, prose summary)', ['vengeance', 'dropped', 'sword', 'astonishment'], { cy: 640, size: 58, goldCol: '#0D4C5C', mark: '#1E6F78' }); };
DRAW.S4 = (t, d) => { const hi = onW('c3h', 'higher', 0.9), pr = onW('c3h', 'pride', 0.6);
  moonSand(t, d, { cam: camL(t, d, 1.0, 1.08, 0, 0, H * 0.6), mid: () => { sandShadow(W * 0.30, H * 1.0, 1.5, 'stand', 1, { sy: 0.8, skew: -0.22 }); sandShadow(W * 0.76, H * 1.0, 1.4, 'stand', 1, { sy: 0.45, skew: 0.5 }); },
    near: () => { sword(W * 0.5, H * 0.62, 1.2, Math.PI - 0.1); if (hi > 0) { glow(W * 0.5, H * 0.3, 300, '#FFE2A0', 0.35 * hi); beam(W * 0.5, -60, 80, W * 0.5, H * 0.62, 420, '255,230,170', 0.25 * hi); } } });
  flameKing(W * 0.5, 620, 0.7, t, 1 - pr * 0.95, pr * 0.6);
  chipAt('IN ESSENCE', W / 2, 250, on('c3h', 0, 0.4), M.gold, 34); };
DRAW.S5 = (t, d) => { const w = onW('sB', 'weapon', 0.5), tmp = onW('sB', 'temper', 0.5);
  chessScene(t, d, { bg1: '#06101C', bg2: '#020408', spotCol: '#7FB8D8', by: H * 0.36, depth: 1500, cam: camL(t, d, 1.0, 1.08, 0, 0, H * 0.55), pieces: [
    { k: 'pawn', x: W * 0.72, y: H * 0.54, s: 1.5, fill: '#0A0A10', rim: '#FF6A4A', rimA: 0.85, label: 'LAST WEAPON', lk: w, lcol: '#FF8A6A' },
    { k: 'knight', x: W * 0.32, y: H * 0.60, s: 1.75, fill: '#06121A', rim: R.teal2, rimA: 0.9, label: "ALI'S TEMPER", lk: tmp, lcol: '#8FE0E0' } ],
    near: () => strings(W * 0.72, H * 0.18, [[W * 0.28, H * 0.38], [W * 0.34, H * 0.46], [W * 0.26, H * 0.51]], tmp) }); };
DRAW.S6 = (t, d) => { const b = onW('sC', 'message', 0.5), an = onW('sC', 'angry', 0.6), mv = onW('sC', 'move', 0.6);
  phoneSet(t, d, { px: W / 2, py: H * 0.40, ps: 1.45, glow: 0.6 + 0.4 * b, screen: () => { thornBubble(0, -120, 230, 110, b, '…really?'); if (an > 0) alpha(an, () => { P(rr(-110, 60, 220, 90, 18), 'rgba(80,90,110,0.9)', null); txt('typing…', 0, 105, 26, '#FFFFFF', 'Montserrat', 700); }); },
    near: (px, py) => strings(px, py - 560, [[px - 50, py + 300], [px + 70, py + 320]], an, 0, '255,106,74') });
  if (mv > 0) stampWord('THEIR MOVE', W / 2, 230, 84, '#FF6A4A', mv); };
DRAW.S7 = (t, d) => { const br = onW('s2', 'breath', 1.2), q = onW('s2', 'move', 0.4), th = onW('s2', 'theirs', 0.4);
  phoneSet(t, d, { px: W / 2, py: H * 0.40, ps: 1.45, glow: 0.5, screen: () => { alpha(1 - br * 0.7, () => thornBubble(0, -120, 230, 110, 1, '…really?')); },
    near: (px, py) => { for (let i = 0; i < 3; i++) { const ph = (t * 0.35 + i / 3) % 1; ctx.strokeStyle = `rgba(63,167,168,${(1 - ph) * 0.6 * br})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(px, py, 300 + ph * 360, 0, 6.283); ctx.stroke(); } } });
  stampWord('MY MOVE…', W / 2, 200, 84, '#8FE0E0', q); stampWord('…OR THEIRS?', W / 2, 310, 84, '#FF8A6A', th); };
DRAW.S8 = (t, d) => { moonSand(t, d, { cam: camL(t, d, 1.0, 1.06, 0, 0, H * 0.6), near: () => { glow(W * 0.5, H * 0.6, 320, '#FFE2A0', 0.25); sword(W * 0.5, H * 0.62, 1.3, Math.PI - 0.1, { glint: (t * 0.5) % 1 }); } });
  stampWord('COULD YOU?', W / 2, 380, 110, M.gold2, on('s3', 0, 0.4)); };
DRAW.S9 = (t, d) => { endCard(t, d); };
function drawFrame(T) {
  GT = T; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, W, H);
  const i = SCENES.findIndex(s => T >= s.start && T < s.start + s.dur); const s = SCENES[i < 0 ? SCENES.length - 1 : i];
  const u = T - s.start; ctx.save(); DRAW[s.id](u, s.dur); ctx.restore(); ctx.filter = 'none'; ctx.globalAlpha = 1;
  if (u < 0.15 && s.start > 0) { ctx.fillStyle = `rgba(0,0,0,${1 - u / 0.15})`; ctx.fillRect(0, 0, W, H); }
  const nxt = SCENES[SCENES.indexOf(s) + 1]; if (nxt && s.start + s.dur - T < 0.08) { ctx.fillStyle = `rgba(0,0,0,${1 - (s.start + s.dur - T) / 0.08})`; ctx.fillRect(0, 0, W, H); }
  vign(0.5); grain(T);
  if (s.id !== 'S9') { watermark(T); captions(); }
}
function drawCover() {
  GT = 9; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  moonSand(4, 8, { cam: { zoom: 1, px: 0, py: 0, cy: H * 0.6 }, mid: () => { sandShadow(W * 0.30, H * 1.0, 1.5, 'stand', 1, { sy: 0.8, skew: -0.22 }); sandShadow(W * 0.76, H * 1.0, 1.4, 'stand', 1, { sy: 0.45, skew: 0.5 }); },
    near: () => { glow(W * 0.5, H * 0.62, 360, '#FFE2A0', 0.3); sword(W * 0.5, H * 0.64, 1.35, Math.PI - 0.1, { glint: 0.45 }); sandBurst(W * 0.5, H * 0.64, 0.22, 60); } });
  vign(0.45);
  withT(W / 2, 300, 1, 0, () => { P(rr(-120, -44, 240, 88, 44), 'rgba(14,70,80,0.95)', M.gold2, 4); txt('RUMI', 0, 3, 56, '#FFF3D6', 'Oswald', 700); });
  bigText('DROP THE', W / 2, 520, 140, '#FFFFFF', 1); bigText('SWORD?', W / 2, 690, 180, M.gold2, 1);
  serifLabel('Machiavelli vs Rumi · Mind vs Heart', W / 2, 1560, 48, M.parch, 1, true);
  const L = document.getElementById('logo'); ctx.save(); ctx.beginPath(); ctx.arc(W - 110, 110, 60, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, W - 170, 50, 120, 120); ctx.restore();
}
function grabCover() { drawCover(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }
