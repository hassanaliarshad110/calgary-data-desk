function thumb() {
  GT = 0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = grad(0, H, '#2A1440', '#FF8A3D'); ctx.fillRect(0, 0, W, H);
  glow(1300, 700, 520, '#FFD36B', 0.6); P(circ(1300, 560, 260), '#FFCE5C', null); glow(1300, 560, 600, '#FFB04A', 0.5);
  alpha(0.95, () => skyline(820, '#3A1A4A', 8, 300, '#FF5FA2', 60));
  ctx.fillStyle = '#1A0E22'; ctx.fillRect(0, 820, W, 300);
  palm(90, 1100, 1.7, 0, '#120818'); palm(1830, 1110, 1.5, 2, '#120818');
  glow(1330, 640, 360, C.amber, 0.45); controller(1330, 640, 1.75, 0, '#20242E');
  glow(420, 700, 420, '#3A7BD5', 0.35);
  person(430, 1290, 'gamer', { t: 0, s: 3.0, look: 0.6, mood: -0.9, brow: -1, blink: false, talk: 1, arms: [[0.5, 0.2], [-2.3, -0.4]] });
  withT(1010, 140, 1, -0.02, () => txtStroke('GTA 6 KA', 0, 0, 160, C.white, C.ink, 22));
  withT(1080, 340, 1, 0.01, () => { ctx.font = '800 165px Baloo2'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 26; ctx.strokeText('बेंगलुरु कनेक्शन', 0, 0); ctx.fillStyle = C.amber; ctx.fillText('बेंगलुरु कनेक्शन', 0, 0); });
  withT(1640, 920, 1, -0.06, () => { P(rr(-220, -50, 440, 100, 12), C.red, C.ink, 6); txt('SPECIAL #1', 0, 4, 60, C.white); });
  P(rr(30, 990, 520, 74, 37), 'rgba(8,11,18,0.85)', null); logoCircle(72, 1027, 30); brandText(115, 1029, 40, 'left');
  vignette();
}
