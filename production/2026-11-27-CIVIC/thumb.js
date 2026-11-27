/* Thumbnail for 2026-11-27 CIVIC "Calgary's water restrictions could lift next week": same design as the opening frame
 * (real city map washed water-blue). Text inside the centre 1080x1350 (y 285-1635).
 * python3 ../../motion/engine/render.py thumb.js --geo ../../motion/geo/calgary_base.json --stills 0.5 --outdir thumb */
const W = 1080, H = 1920, CX = W / 2, GOLD = '#f2b632';
const TOWER = M.geo.lm('Calgary Tower') || [0, 0, 0];
window.BUILD = () => M.film({ W, H, identity: 'civic', scenes: [{ dur: 1, draw: (c, t) => {
  const w = M.world({ sky: 'blueprint', fog: false });
  M.geo.addBase(w, { buildings: false, boundaryStroke: true, colors: { land: '#1f6fb8', park: '#1d4a5e', water: '#7cd0ff', road: '#5d86b3', motorway: '#9cc3ea', boundary: '#cfe8ff' }, lineAlpha: .5 });
  const cam = M.camera({ pos: [TOWER[0], TOWER[1] - 9000, 30000], look: TOWER, fov: 50 }, W, H); w.render(c, cam);
  const g = c.createLinearGradient(0, 300, 0, 1250); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.1, 'rgba(7,13,24,.78)'); g.addColorStop(.9, 'rgba(7,13,24,.78)'); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, 300, W, 950);
  M.text(c, 'WATER RULES', CX, 380, { size: 150, weight: 900, align: 'center', maxW: 1000 });
  M.text(c, 'COULD LIFT', CX, 575, { size: 150, weight: 900, align: 'center', color: GOLD, maxW: 1000 });
  M.text(c, 'NEXT WEEK', CX, 770, { size: 150, weight: 900, align: 'center', color: GOLD, maxW: 1000 });
  M.chip(c, 'New feeder main connected', CX, 1020, { align: 'center', size: 60, bg: '#ffffff', color: '#0b1f3a' });
  if (window.LOGO) { c.drawImage(window.LOGO, 70, 1500, 90, 90); M.text(c, 'Calgary Insight', 180, 1545, { size: 44, weight: 700, base: 'middle' }); }
} }] });
