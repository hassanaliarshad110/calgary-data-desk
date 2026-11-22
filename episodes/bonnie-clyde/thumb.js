function drawThumb() {
  GT = 0; ctx.setTransform(1,0,0,1,0,0);
  ctx.save(); ctx.beginPath(); ctx.rect(0,0,1100,H); ctx.clip(); sky('#2A1810','#C98A4E'); glow(560,700,700,'#FFD38A',0.4); ground(860,'#3A2418');
  bonnie(380, 1090, { t: 0, s: 2.0, blink: false, look: 0.6, mood: -0.4, brow: -1 }); clyde(760, 1090, { t: 0, s: 2.0, blink: false, look: -0.4, mood: -0.3, brow: -1 });
  sepiaGrade(0.25); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.moveTo(1100,0); ctx.lineTo(W,0); ctx.lineTo(W,H); ctx.lineTo(980,H); ctx.closePath(); ctx.clip(); neonCity(1); palmS(1800,1150,1.3,0); ctx.restore();
  line(1100,0,980,H,C.ink,14);
  withT(1480, 250, 1, 0.04, () => neonText('GTA 6', 0, 0, 200, NEON));
  ctx.save(); ctx.beginPath(); ctx.moveTo(1100,0); ctx.lineTo(W,0); ctx.lineTo(W,H); ctx.lineTo(980,H); ctx.closePath(); ctx.clip(); ground(735,'#1A0A22'); ctx.restore(); withT(1460, 560, 1, 0, () => { grave(0, 160, 1.3, 'CLYDE', ''); emptyPlot(260, 170, 1.0, 0); txtStroke('?', 260, 40, 140, SEPL, C.ink, 12); });
  withT(560, 150, 1, -0.03, () => { P(rr(-480,-80,960,160,16), '#9E2A22', C.ink, 8); txt('92 SAAL SE ADHOORI', 0, 6, 104, C.white); });
  txtStroke('BONNIE & CLYDE', 560, 330, 96, SEPL, C.ink, 14);
  withT(W - 150, 990, 1, 0, () => { logoCircle(0, 0, 60); });
  vignette();
  return document.getElementById('c').toDataURL('image/jpeg',0.92).split(',')[1];
}
