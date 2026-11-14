function thumb() {
  GT = 0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = grad(0, H, '#140A06', '#2A1408'); ctx.fillRect(0, 0, W, H);
  glow(960, 620, 700, C.amber, 0.35); glow(1620, 600, 500, '#FF2E2E', 0.35); glow(300, 600, 500, '#3A7BD5', 0.3);
  // honey drips
  for (let i = 0; i < 14; i++) { const x = 40 + i * 140 + rnd(i) * 40, len = 40 + rnd(i + 2) * 120; ctx.fillStyle = '#E8A93B'; ctx.fillRect(x - 12, 0, 24, len); P(circ(x, len, 17), '#F4C35A', null); }
  ctx.fillStyle = '#E8A93B'; ctx.fillRect(0, 0, W, 26);
  // phone with heart + hook
  withT(960, 640, 1.05, -0.06, () => { phoneUI(0, 0, 0.95, 0, () => { ctx.fillStyle = '#2A0F1A'; ctx.fillRect(-172, -350, 344, 700); heart(0, -60, 4.2, '#FF4F7A'); }); ctx.strokeStyle = '#E8A93B'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -560); ctx.lineTo(0, 120); ctx.arc(-70, 120, 70, 0, Math.PI * 0.95); ctx.stroke(); });
  person(330, 1500, 'jensen', { t: 0, s: 2.9, look: 0.9, mood: -0.6, brow: -1, blink: false });
  person(1600, 1500, 'sci', { t: 0, s: 2.9, look: -0.9, mood: -0.6, brow: -1, blink: false });
  withT(960, 150, 1, -0.03, () => txtStroke('HONEY TRAP', 0, 0, 170, C.amber, C.ink, 22));
  withT(960, 900, 1, 0.02, () => { ctx.font = '800 150px Baloo2'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 24; ctx.strokeText('भारत में भी?', 0, 0); ctx.fillStyle = C.white; ctx.fillText('भारत में भी?', 0, 0); });
  withT(250, 330, 1, -0.08, () => { P(rr(-170, -50, 340, 100, 12), C.green, C.ink, 6); txt('NVIDIA BOSS', 0, 4, 58, C.ink); });
  withT(1660, 330, 1, 0.08, () => { P(rr(-160, -50, 320, 100, 12), C.red, C.ink, 6); txt('FILE #1', 0, 4, 64, C.white); });
  P(rr(30, 990, 520, 74, 37), 'rgba(8,11,18,0.85)', null); logoCircle(72, 1027, 30); brandText(115, 1029, 40, 'left');
  vignette();
}
