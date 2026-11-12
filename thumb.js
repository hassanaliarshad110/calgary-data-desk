function thumb() {
  GT = 0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0A0E18'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.beginPath(); ctx.moveTo(1150, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(900, H); ctx.closePath(); ctx.clip();
  ctx.fillStyle = grad(0, H, '#5A0E14', '#1A0508'); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 0.5; skyline(1080, '#2A060A', 19, 520, '#7A1A20', 60); ctx.globalAlpha = 1; ctx.restore();
  glow(470, 600, 650, C.amber, 0.45); glow(1560, 560, 520, '#FF2E2E', 0.45);
  // spy (right, behind)
  person(1600, 1600, 'alice', { t: 0, s: 3.3, look: -0.9, mood: 0, shades: true, blink: false });
  alpha(0.25, () => { ctx.fillStyle = '#FF2E2E'; ctx.beginPath(); ctx.moveTo(1150, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(900, H); ctx.fill(); });
  // red string
  ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(640, 760); ctx.quadraticCurveTo(1000, 900, 1380, 720); ctx.stroke(); P(circ(640, 760, 20), C.red, C.ink, 5); P(circ(1380, 720, 20), C.red, C.ink, 5);
  // Jensen
  person(430, 1640, 'jensen', { t: 0, s: 3.6, look: 0.9, mood: -0.4, brow: -1, blink: false });
  // text
  withT(1060, 175, 1, -0.04, () => txtStroke('CHINI', 0, 0, 230, C.amber, C.ink, 26));
  withT(1060, 385, 1, -0.04, () => txtStroke('JASOOS?', 0, 0, 230, C.white, C.ink, 26));
  withT(250, 90, 1, -0.06, () => { P(rr(-210, -56, 420, 112, 12), C.green, C.ink, 6); txt('NVIDIA BOSS', 0, 4, 68, C.ink); });
  stamp('TOP SECRET', 1500, 560, 70, '#FF4A3A', 1, 0.14);
  // channel badge
  P(rr(1360, 950, 530, 110, 55), 'rgba(8,11,18,0.85)', null); logoCircle(1420, 1005, 48); brandText(1485, 1007, 46, 'left');
  vignette();
}
