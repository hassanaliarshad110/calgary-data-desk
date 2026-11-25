/* Thumbnail for 2026-11-25 CIVIC "Calgary's budget debate": same design as the opening frame (map push-in on City Hall).
 * Text inside the centre 1080x1350 (y 285-1635). python3 ../../motion/engine/render.py thumb.js --geo ../../motion/geo/calgary_base.json --stills 0.5 --outdir thumb */
const W = 1080, H = 1920, CX = W / 2, GOLD = '#f2b632';
const HALL = M.geo.lm('Calgary Municipal Building') || [0, 0, 0];
const WARD = M.geo.within('wards', HALL);
window.BUILD = () => M.film({ W, H, identity: 'civic', scenes: [{ dur: 1, draw: (c, t) => {
  const w = M.world({ sky: 'blueprint', fog: false });
  M.geo.addBase(w, { buildings: true, wards: true, highlightWard: WARD, hiColor: '#7cc4ff', hiAlpha: .18, colors: { land: '#123a66', park: '#1d4a5e', water: '#2a6aa8', road: '#5d86b3', motorway: '#9cc3ea' }, lineAlpha: .5 });
  M.pin(w, HALL, '', { p: 1, color: GOLD, scale: 1.6 });
  const cam = M.camera({ pos: [HALL[0], HALL[1] - 1900, 3800], look: HALL, fov: 50 }, W, H); w.render(c, cam);
  const g = c.createLinearGradient(0, 300, 0, 1250); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.1, 'rgba(7,13,24,.78)'); g.addColorStop(.9, 'rgba(7,13,24,.78)'); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, 300, W, 950);
  M.text(c, 'YOUR', CX, 360, { size: 170, weight: 900, align: 'center' });
  M.text(c, 'PROPERTY TAX', CX, 545, { size: 140, weight: 900, align: 'center', maxW: 1000 });
  M.text(c, 'CUT OR KEEP?', CX, 760, { size: 150, weight: 900, align: 'center', color: GOLD });
  M.chip(c, 'City Hall · budget week', CX, 1010, { align: 'center', size: 60, bg: '#ffffff', color: '#0b1f3a' });
  if (window.LOGO) { c.drawImage(window.LOGO, 70, 1500, 90, 90); M.text(c, 'Calgary Insight', 180, 1545, { size: 44, weight: 700, base: 'middle' }); }
} }] });
