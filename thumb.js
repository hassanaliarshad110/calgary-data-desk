function thumb() {
  GT = 0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = grad(0, H, '#141C30', '#07090F'); ctx.fillRect(0, 0, W, H);
  glow(560, 560, 700, C.amber, 0.35); glow(1500, 500, 600, C.red, 0.35);
  const drawStr = () => { ctx.strokeStyle = C.red; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(620, 640); ctx.quadraticCurveTo(980, 820, 1360, 640); ctx.stroke();
  P(circ(620, 640, 18), C.red, C.ink, 4); P(circ(1360, 640, 18), C.red, C.ink, 4); };
  person(400, 1560, 'jensen', { t: 0, s: 3.3, look: 0.7, mood: 0.2, brow: -1, blink: false });
  person(1560, 1560, 'alice', { t: 0, s: 3.0, look: -0.7, mood: 0, shades: true });
  drawStr();
  withT(980, 190, 1, -0.04, () => { txtStroke('CHINI', 0, 0, 210, C.red, C.ink, 22); });
  withT(980, 380, 1, -0.04, () => { txtStroke('JASOOS?', 0, 0, 210, C.white, C.ink, 22); });
  withT(250, 110, 1, -0.06, () => { P(rr(-200, -55, 400, 110, 10), C.green, C.ink, 6); txt('NVIDIA BOSS', 0, 4, 66, C.ink); });
  vignette();
}
