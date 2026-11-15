// ===== Ep3 Honey Trap Files — native 9:16 recompositions (DRAWV) used by shorts.py.
// Needs ../../shorts_v.js (DRAWV, CX, SC, bannerV, overlays) loaded first.

function zchatV(t, d, rev, revT, withBanner) {
  depth([
    { z: 0.1, haze: 1, draw: () => { sky('#141A2A', '#1E2640'); bokeh(t, 22, '#1E9E5A', 21); } },
    { z: 0.5, draw: () => {
      ctx.fillStyle = '#10151F'; ctx.fillRect(-200, 1560, W + 400, 600);
      lightPool(250, 1200, 460, '#7FB4FF', 0.32); shadow(245, 1640, 250);
      person(245, 1640, 'sci', { t, s: 2.15, look: 0.8, mood: rev ? -0.2 : 0.6, arms: [[0.3, 0.3], [-0.9, -1.4]], prop: (l, r) => P(rr(r[0] - 18, r[1] - 50, 34, 60, 6), '#111', C.ink, 3) });
    } },
    { z: 0.95, draw: () => phoneUI(680, 800, 1.35, t, () => {
      ctx.fillStyle = '#075E54'; ctx.fillRect(-172, -350, 344, 84);
      if (!rev) { P(circ(-120, -308, 28), '#E9BC98', C.ink, 3); P(rr(-146, -340, 52, 22, 10), '#141217', null); } else { P(circ(-120, -308, 28), '#111', C.ink, 3); txt('?', -120, -306, 36, C.red); }
      txt('Zara Dasgupta', -80, -318, 24, C.white, 'Baloo2', 800, 'left'); txt(rev ? '???' : 'London · online', -80, -290, 16, rev ? C.red : '#B2F2D4', 'Inter', 600, 'left');
      ctx.fillStyle = '#0B141A'; ctx.fillRect(-172, -266, 344, 620);
      for (let i = 0; i < 7; i++) msg(i % 2 ? 150 : -150, -210 + i * 74, 150 + rnd(i) * 110, i % 2 == 1, seg(t, 0.3 + i * 0.45, 0.6 + i * 0.45), null, i % 2 ? '#005C4B' : '#202C33');
    }) },
  ], drift(t, d, 24), 0, lerp(1.0, 1.06, ease(t / d)));
  if (!rev) { if (withBanner) bannerV('ATS CHARGESHEET KE MUTABIQ', "'LONDON KI SOFTWARE ENGINEER'", 230, t - 0.3, C.amber); }
  else {
    const u = t - revT;
    alpha(seg(u, 0, 0.4), () => { ctx.fillStyle = 'rgba(80,0,0,0.25)'; ctx.fillRect(0, 0, W, H); });
    alpha(seg(u, 0.1, 0.4), () => tag('ATS KA DAAWA', 60, 168, 28, C.amber));
    stamp('PAKISTANI OPERATIVE', CX, 240, 62, C.red, u - 0.2, -0.03);
  }
  vignette();
}

DRAWV.zchat = (t, d) => { const rev = after('n22', 0.6); zchatV(t, d, rev, rev ? t - lt('n22') + 0.6 : 0, true); };

DRAWV.quote = (t, d) => {
  depth([
    { z: 0.1, draw: () => { sky('#1A1612', '#0E0B08'); lightPool(CX, 700, 900, C.amber, 0.22); } },
    { z: 0.8, draw: () => { withT(CX + 10, 840, 1, -0.02, () => {
      shadow(0, 600, 460, 0.4); P(rr(-470, -580, 940, 1160, 6), '#F2EEE3', C.ink, 6); paperTex(-470, -580, 940, 1160, 8);
      txt('CHARGESHEET · ATS (AAROP)', 0, -500, 50, C.ink, 'Oswald', 700); line(-410, -455, 410, -455, C.ink, 4);
      for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(30,30,30,0.3)'; ctx.fillRect(-410, -410 + i * 36, 820 * (0.6 + rnd(i) * 0.4), 12); }
      const k = seg(t, 1.0, 2.4); P(rr(-430, -200, 860 * k + 1, 330, 10), 'rgba(244,208,111,0.75)', null);
      const Q = ['"I have initial design', 'report, some 184 A4', 'pages, on all', 'BrahMos versions"'];
      Q.forEach((s, i) => txt(s, 0, -150 + i * 78, 60, C.ink, 'Kalam', 700));
      for (let i = 0; i < 8; i++) { ctx.fillStyle = 'rgba(30,30,30,0.3)'; ctx.fillRect(-410, 170 + i * 36, 820 * (0.6 + rnd(i + 7) * 0.4), 12); }
    }); } },
  ], drift(t, d, 16), 0, lerp(1.0, 1.07, ease(t / d)));
  if (t > 2.6) withT(CX + 150, 1150, back(seg(t, 2.6, 3.0)), 0.06, () => { P(rr(-200, -58, 400, 116, 16), C.red, C.ink, 5); txt('184 PANNE', 0, 3, 68, C.white); });
  vignette();
};

DRAWV.list = (t, d) => {
  fillAll('#0E1424'); glow(CX, 760, 800, C.red, 0.12); bokeh(t, 10, '#3A4A6A', 5);
  const items = [['BRAHMOS', () => missile(0, 0, 0.5)], ['AGNI-6', () => withT(0, 0, 0.5, -1.2, () => missile(0, 0, 1))], ['RAFALE', () => withT(0, 0, 1.2, 0, () => { P(poly([-120, 10, 120, 0, -120, -10]), '#AEB8C2', C.ink, 4); P(poly([-20, 0, -80, 70, -40, 0]), '#8A94A6', C.ink, 4); P(poly([-20, 0, -80, -70, -40, 0]), '#8A94A6', C.ink, 4); })], ['DRONE', () => withT(0, 0, 1.3, 0, () => { P(rr(-40, -16, 80, 32, 10), '#555', C.ink, 4); for (const s of [-1, 1]) { line(s * 40, 0, s * 100, -30, C.ink, 5); P(ell(s * 100, -34, 50, 10), 'rgba(180,180,180,0.6)', C.ink, 2); } })]];
  items.forEach(([s, fn], i) => { const k = back(seg(t, 0.4 + i * 0.6, 0.8 + i * 0.6)); if (k <= 0) return; const x = i % 2 ? 705 : 275, y = i < 2 ? 530 : 885;
    withT(x, y, k, 0, () => { shadow(0, 180, 180); P(rr(-210, -165, 420, 330, 22), '#1C2538', C.amber, 5); withT(0, -30, 1, 0, fn); txt(s, 0, 100, 50, C.amber); }); });
  const r0 = LINES.n24.dur * 0.55;
  if (t > r0) withT(CX, 1160, back(seg(t, r0, r0 + 0.4)), 0, () => { P(rr(-430, -95, 860, 190, 24), 'rgba(11,15,23,0.75)', C.red, 4); apk(-320, 0, 0.85, true); txt('APP LINK =', 60, -32, 54, C.white, 'Oswald', 700); txt('MALWARE', 60, 38, 66, C.red, 'Oswald', 700); });
  bannerV('AAROP', 'BAATEIN BRAHMOS SE AAGE GAYIN', 230, t - 0.3, C.red);
  vignette();
};

function targetV(x, y, r, t, a = 1) { alpha(a, () => { ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.stroke(); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, 6.2832); ctx.stroke(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) line(x + dx * r * 0.75, y + dy * r * 0.75, x + dx * r * 1.25, y + dy * r * 1.25, C.red, 8); glow(x, y, r * 1.6, C.red, 0.12 + 0.08 * Math.sin(t * 8)); }); }

function youScene(t, d, withPhone) {
  depth([
    { z: 0.05, haze: 1, draw: () => { sky('#0D1322', '#1B2340'); stars(70); } },
    { z: 0.35, haze: 1, draw: () => { skyline(1250, '#151C2E', 44, 520, C.amber, 70); } },
    { z: 0.7, draw: () => { ctx.fillStyle = '#0A0F1A'; ctx.fillRect(-200, 1580, W + 400, 600); lightPool(CX, 1150, 520, '#7FB4FF', 0.3); shadow(CX, 1620, 260);
      person(CX, 1620, 'you', { t, s: 2.25, look: 0.3, mood: 0.5, arms: withPhone ? [[0.3, 0.3], [-0.9, -1.4]] : undefined, prop: withPhone ? (l, r) => { P(rr(r[0] - 20, r[1] - 56, 40, 68, 7), '#111', C.ink, 3); glow(r[0], r[1] - 22, 90, '#9BD4FF', 0.35); } : undefined }); } },
  ], drift(t, d, 20), 0, lerp(1.0, 1.06, ease(t / d)));
}

DRAWV.tips = (t, d) => {
  const at = id => (LINES[id] ? LINES[id].start - (GT - t) : 99);
  const t1 = at('n33');
  // intro (n32): "agla nishaana ... aap bhi" — you + target, then cards take over
  const ko = seg(t, t1 - 0.5, t1);
  if (ko < 1) { youScene(t, d, true); const r = lerp(330, 150, easeOut(seg(t, 1.2, 3.2))); if (t > 1.2) targetV(CX, 1620 - 2.25 * 262, r, t, seg(t, 1.2, 1.6)); }
  alpha(ko, () => { fillAll('#0E1424'); glow(CX, 600, 800, C.green, 0.1); bokeh(t, 10, '#2A4A3A', 9); });
  txtStroke('AAP KAISE BACHEIN?', CX, 245, 86, C.white, C.ink, 12);
  const tips = [['n33', 'JALDI KAREEB + KAAM MEIN DILCHASPI', 'KHATRE KI GHANTI', (x, y) => { P(circ(x, y, 56), '#C9D2DE', C.ink, 5); txt('🔔', x + 46, y - 38, 50, C.amber); }],
    ['n34', 'ANJAAN LINK SE APP / APK', 'KABHI INSTALL NAHI', (x, y) => { apk(x, y, 0.7, true); line(x - 66, y - 84, x + 66, y + 84, C.red, 12); }],
    ['n35', 'OFFICE FILE · PERSONAL DEVICE', 'BILKUL NAHI', (x, y) => { withT(x, y + 70, 0.48, 0, () => laptopB(0, 0, 1, null)); line(x - 86, y - 56, x + 86, y + 76, C.red, 12); }]];
  tips.forEach(([id, a, b, ic], i) => { const k = back(seg(t, at(id), at(id) + 0.35)); if (k <= 0) return; const y = 480 + i * 300; const col = i == 0 ? C.amber : i == 1 ? C.red : C.green;
    withT(CX, y, k, 0, () => { shadow(0, 140, 380, 0.3); P(rr(-430, -125, 860, 250, 24), '#1C2538', col, 6); P(circ(-395, -95, 38), C.amber, C.ink, 4); txt(String(i + 1), -395, -92, 48, C.ink);
      ic(-270, 0); const words = a.split(' '); const mid = Math.ceil(words.length / 2);
      txt(words.slice(0, mid).join(' '), -130, -62, 40, C.white, 'Oswald', 600, 'left'); txt(words.slice(mid).join(' '), -130, -12, 40, C.white, 'Oswald', 600, 'left');
      P(rr(-130, 36, 400, 66, 33), col, C.ink, 4); txt(b, 70, 70, 34, C.ink); }); });
  vignette();
};

// ---------- hook / closing scenes ----------
DRAWV.hook3 = (t, d) => { const revT = 2.9; zchatV(t, d, t > revT, revT, false); if (t > 4.6) alpha(seg(t, 4.6, 5.0), () => tag('DRDO · SABSE BADI CHARGESHEET', 60, 1180, 34, C.amber)); };
DRAWV.hook4 = (t, d) => {
  youScene(t, d, true);
  const r = lerp(360, 140, easeOut(seg(t, 0.2, 2.0))); targetV(CX, 1620 - 2.25 * 262, r, t, seg(t, 0.1, 0.5));
  if (t > 2.4) withT(CX, 330, back(seg(t, 2.4, 2.8)), 0, () => { glow(0, 0, 260, C.amber, 0.25); P(circ(0, 0, 120), C.amber, C.ink, 7); txt('3', 0, -18, 130, C.ink); txt('NIYAM', 0, 78, 40, C.ink); });
  vignette();
};
DRAWV.end3 = (t, d) => {
  depth([
    { z: 0.05, draw: () => { sky('#06090F', '#0E1424'); } },
    { z: 0.5, draw: () => { P(rr(-100, 180, W + 200, 1500, 0), '#2A2F3A', null); for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(rnd(i) * W, 180 + rnd(i + 2) * 1500, 120, 60); } lightPool(CX, 500, 520, '#DDE1E7', 0.3); } },
    { z: 0.8, draw: () => { withT(CX, 790, 1.15, -0.02, () => { shadow(0, 420, 320, 0.4); P(rr(-330, -400, 660, 800, 6), '#E9DDB8', C.ink, 6); paperTex(-330, -400, 660, 800, 4); txt('FARAAR', 0, -320, 100, C.red2); P(rr(-220, -230, 440, 360, 4), '#1A1A1A', C.ink, 4); alpha(0.9, () => { P(circ(0, -80, 80), '#0A0A0A', null); P(ell(0, 80, 150, 90), '#0A0A0A', null); }); txt('?', 0, -70, 110, C.red); txt("'ZARA DASGUPTA'", 0, 200, 56, C.ink); txt('(FARZI NAAM · ATS KE MUTABIQ)', 0, 262, 28, '#5A4A2A', 'Oswald', 500); }); } },
    { z: 1, draw: () => rain(t, 160) },
  ], drift(t, d, 20), 0, lerp(1.0, 1.08, ease(t / d)));
  vignette();
};
DRAWV.end4 = (t, d) => { const s = SC('tips'); const g0 = LINES.n35.start + LINES.n35.dur + 0.3; GT = g0 + t; DRAWV.tips(GT - s.start, s.dur); };

