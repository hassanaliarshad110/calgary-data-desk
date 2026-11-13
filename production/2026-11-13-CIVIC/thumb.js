/* Thumbnail for 2026-11-13 CIVIC "Grey Cup Sunday": same design as the opening frame. Text inside the centre 1080x1350 (y 285-1635).
 * python3 ../../motion/engine/render.py thumb.js --geo ../../motion/geo/calgary_base.json --stills 0.5 --outdir . */
const W = 1080, H = 1920, CX = W / 2;
const NAVY = { land: '#122848', park: '#17364a', water: '#2f6fa6', building: '#3b5378', road: '#2b4670', motorway: '#3f5f8f', lrt: '#6b3a4a' };
let MCM = [-3466, 2847, 0];
window.PRELOAD = async () => { MCM = M.geo.lm('McMahon Stadium'); };
window.BUILD = () => M.film({ W, H, identity: 'civic', scenes: [{ dur: 1, draw: (c, t) => {
  const w = M.world({ sky: 'blueprint', fog: { near: 12000, far: 50000, max: .5 } });
  M.geo.addBase(w, { buildings: false, lrt: true, colors: NAVY, lineAlpha: .6 });
  M.ping(w, MCM, .35, { r: 230 }); M.ping(w, MCM, .75, { r: 230 }); M.pin(w, MCM, 'McMahon Stadium', { size: 56, scale: 2 });
  const cam = M.camera(M.moves.dive(MCM, .85, { h0: 26000, h1: 5200, back0: 1, back1: 6500, ahead: 3100 }), W, H); w.render(c, cam);
  const g = c.createLinearGradient(0, 300, 0, 1000); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.15, 'rgba(7,13,24,.7)'); g.addColorStop(.85, 'rgba(7,13,24,.7)'); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, 300, W, 700);
  M.text(c, 'GREY CUP', CX, 380, { size: 190, weight: 800, align: 'center' });
  M.text(c, 'SUNDAY', CX, 575, { size: 190, weight: 800, align: 'center', color: '#f2b632' });
  M.chip(c, 'What to know', CX, 800, { align: 'center', size: 72, bg: '#ffffff', color: '#0b1f3a' });
  if (window.LOGO) { c.drawImage(window.LOGO, 70, 1500, 90, 90); M.text(c, 'Calgary Insight', 180, 1545, { size: 44, weight: 700, base: 'middle' }); }
} }] });
