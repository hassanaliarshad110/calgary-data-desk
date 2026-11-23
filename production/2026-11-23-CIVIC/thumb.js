/* Thumbnail for 2026-11-23 CIVIC "Cavalry FC made league history in Calgary": same design as the opening frame.
 * Text inside the centre 1080x1350 (y 285-1635). python3 ../../motion/engine/render.py thumb.js --stills 0.5 --outdir thumb */
const W = 1080, H = 1920, CX = W / 2, GOLD = '#f2b632';
const pitch = c => {
  c.fillStyle = '#05101c'; c.fillRect(0, 0, W, H);
  const s = 13.5 * 1.15, PW = 68, PL = 105; c.save(); c.translate(W / 2, H / 2); c.rotate(-.12);
  for (let k = 0; k < 14; k++) { c.fillStyle = k % 2 ? '#1f6b3e' : '#1a5e36'; c.fillRect(-PW / 2 * s - 6 * s, (-PL / 2 + k * PL / 14) * s, (PW + 12) * s, PL / 14 * s + 1); }
  c.fillStyle = 'rgba(235,242,250,.85)'; c.fillRect(-PW / 2 * s - 6 * s, -PL / 2 * s - 6 * s, 3.2 * s, (PL + 12) * s); c.fillRect(PW / 2 * s + 2.8 * s, -PL / 2 * s - 6 * s, 3.2 * s, (PL + 12) * s);
  c.strokeStyle = 'rgba(255,255,255,.92)'; c.lineWidth = .28 * s; c.strokeRect(-PW / 2 * s, -PL / 2 * s, PW * s, PL * s);
  c.beginPath(); c.moveTo(-PW / 2 * s, 0); c.lineTo(PW / 2 * s, 0); c.stroke(); c.beginPath(); c.arc(0, 0, 9.15 * s, 0, 7); c.stroke();
  [-1, 1].forEach(e => { c.strokeRect(-20.16 * s, e > 0 ? (PL / 2 - 16.5) * s : -PL / 2 * s, 40.32 * s, 16.5 * s); c.strokeRect(-9.16 * s, e > 0 ? (PL / 2 - 5.5) * s : -PL / 2 * s, 18.32 * s, 5.5 * s); });
  const g = c.createRadialGradient(0, 0, 0, 0, 0, 22 * s); g.addColorStop(0, 'rgba(242,182,50,.5)'); g.addColorStop(1, 'rgba(242,182,50,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 22 * s, 0, 7); c.fill();
  c.restore();
  [[0, 0], [W, 0], [0, H], [W, H]].forEach(([x, y]) => { const g2 = c.createRadialGradient(x, y, 0, x, y, 1100); g2.addColorStop(0, 'rgba(255,244,214,.3)'); g2.addColorStop(1, 'rgba(255,244,214,0)'); c.fillStyle = g2; c.fillRect(0, 0, W, H); });
  M.weather(c, 'snow', 3, W, H, { wind: 60 });
};
window.BUILD = () => M.film({ W, H, identity: 'civic', scenes: [{ dur: 1, draw: (c, t) => {
  pitch(c);
  const g = c.createLinearGradient(0, 300, 0, 1150); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.12, 'rgba(7,13,24,.74)'); g.addColorStop(.88, 'rgba(7,13,24,.74)'); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, 300, W, 850);
  M.text(c, 'NO CLUB HAD', CX, 360, { size: 160, weight: 800, align: 'center' });
  M.text(c, 'EVER DONE', CX, 545, { size: 160, weight: 800, align: 'center' });
  M.text(c, 'THIS', CX, 730, { size: 170, weight: 800, align: 'center', color: GOLD });
  M.chip(c, 'Cavalry FC', CX, 975, { align: 'center', size: 72, bg: '#ffffff', color: '#0b1f3a' });
  if (window.LOGO) { c.drawImage(window.LOGO, 70, 1500, 90, 90); M.text(c, 'Calgary Insight', 180, 1545, { size: 44, weight: 700, base: 'middle' }); }
} }] });
