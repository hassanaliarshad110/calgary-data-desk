/* 2026-11-13 PM fun fact: "WestJet took off on a leap day".
 * Lead identity: Data Explainer (calendar tick, counters, pins); borrows a Storyteller map dive over the real city (S2)
 * and a Civic-style schematic card with labelled approximation (S4).
 * Every on-screen figure maps to the audited claims table in packages/2026-11-13-PM-westjet-leap-day.md (claim numbers in comments).
 * Render: python3 ../../motion/engine/render.py scene.js out.mp4 --geo ../../motion/geo/calgary_base.json --workers 3 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;
const DUR = [1.771, 3.883, 4.437, 1.728, 4.992, 2.795];      // measured Kokoro line durations (durs.json, studio-probe-out)      // measured Kokoro line durations (replaced from durs.json)
const S = M.script([
  { text: 'WestJet took off on a leap day.', dur: DUR[0] },
  { text: 'Its first flight was on February twenty-ninth, nineteen ninety-six.', dur: DUR[1] },
  { text: 'The Calgary-based airline was founded by Clive Beddoe and a team of partners.', dur: DUR[2] },
  { text: 'It started with just three planes,', dur: DUR[3] },
  { text: 'and five destinations: Vancouver, Kelowna, Edmonton, Calgary and Winnipeg.', dur: DUR[4] },
  { text: 'Did you know? Yes or no. Drop your thoughts below.', dur: DUR[5] },
], { lead: .25, gap: .22, tail: 1.3 });
const sc = S.scenes;
const SRC = 'Source: Global News (Feb 29, 2016) · CTV Calgary';
const MAPC = 'Map data © OpenStreetMap contributors · City of Calgary Open Data';
const NAVY = { land: '#122848', park: '#17364a', water: '#2f6fa6', building: '#3b5378', road: '#2b4670', motorway: '#3f5f8f' };

// one jet silhouette design (continuity): nose points +x before rotation; s = length in px
function jet(c, x, y, s, rot = 0, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot); c.globalAlpha *= o.alpha ?? 1; c.fillStyle = o.color || '#ffffff';
  c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = s * .06;
  const L = s / 2, r = s * .055;
  c.beginPath(); c.moveTo(L, 0); c.quadraticCurveTo(L * .82, -r, L * .6, -r); c.lineTo(-L * .85, -r * .8); c.lineTo(-L, -r * .3); c.lineTo(-L, r * .3); c.lineTo(-L * .85, r * .8); c.lineTo(L * .6, r); c.quadraticCurveTo(L * .82, r, L, 0); c.fill();
  // swept wings
  c.beginPath(); c.moveTo(L * .2, -r); c.lineTo(-L * .25, -s * .5); c.lineTo(-L * .42, -s * .5); c.lineTo(-L * .12, -r); c.fill();
  c.beginPath(); c.moveTo(L * .2, r); c.lineTo(-L * .25, s * .5); c.lineTo(-L * .42, s * .5); c.lineTo(-L * .12, r); c.fill();
  // tail
  c.beginPath(); c.moveTo(-L * .72, -r); c.lineTo(-L * .95, -s * .2); c.lineTo(-L * 1.02, -s * .2); c.lineTo(-L * .9, -r); c.fill();
  c.beginPath(); c.moveTo(-L * .72, r); c.lineTo(-L * .95, s * .2); c.lineTo(-L * 1.02, s * .2); c.lineTo(-L * .9, r); c.fill();
  c.restore();
}
const bg = c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#081428'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const band = (c, y0, y1, a = .72) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(7,13,24,0)'); g.addColorStop(.18, `rgba(7,13,24,${a})`); g.addColorStop(.82, `rgba(7,13,24,${a})`); g.addColorStop(1, 'rgba(7,13,24,0)'); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); };
// a wall-calendar page: month header + big day number; flip = 0..1 turns '28' into '29'
function calPage(c, x, y, w, h, flip) {
  c.save(); M.rr(c, x, y, w, h, 26); c.fillStyle = '#f7f4ec'; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 40; c.fill(); c.shadowBlur = 0;
  c.save(); M.rr(c, x, y, w, h * .24, 26); c.clip(); c.fillStyle = '#c8323c'; c.fillRect(x, y, w, h * .24); c.restore();
  M.text(c, 'FEBRUARY', x + w / 2, y + h * .06, { size: 72, weight: 800, align: 'center', color: '#fff', shadow: false, tracking: .08 });
  // rings
  c.fillStyle = '#2a2f3a'; for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(x + w * (.3 + .4 * i), y + 8, 16, 0, 7); c.fill(); }
  const cy = y + h * .3, ny = cy + 10;
  if (flip < 1) { // old page '28' folds up
    const k = M.ease.inCubic(Math.min(1, flip)); c.save(); c.translate(x + w / 2, cy); c.scale(1, 1 - k); c.globalAlpha = 1 - k * .6;
    M.text(c, '28', 0, 10, { size: 360, weight: 800, align: 'center', color: '#1b2533', shadow: false }); c.restore(); }
  if (flip > 0) { const k = M.ease.outBack(Math.min(1, flip)); c.save(); c.translate(x + w / 2, cy + (1 - k) * 80); c.globalAlpha = Math.min(1, flip * 2);
    M.text(c, '29', 0, 10, { size: 360, weight: 900, align: 'center', color: '#e0a21c', shadow: false }); c.restore(); }
  c.restore();
}

// five destinations at their true lat/lon (equirectangular, cos 51° x-scaling), claim C5
const CITIES = [['Vancouver', 49.28, -123.12], ['Kelowna', 49.89, -119.50], ['Edmonton', 53.55, -113.49], ['Calgary', 51.05, -114.07], ['Winnipeg', 49.90, -97.14]];


window.BUILD = () => M.film({ W, H, identity: 'explainer', scenes: [
  { dur: 1, draw: (c, t) => {
      bg(c);
      // gold glow behind the calendar
      const g = c.createRadialGradient(CX, 1150, 40, CX, 1150, 600); g.addColorStop(0, 'rgba(242,182,50,.28)'); g.addColorStop(1, 'rgba(242,182,50,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.save(); c.translate(CX, 1150); c.scale(.8, .8); calPage(c, -330, -330, 660, 640, 1); c.restore();
      const a0 = [-60, 1560], a1 = [880, 900], ang = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]);
      const cg = c.createLinearGradient(a0[0], a0[1], a1[0], a1[1]); cg.addColorStop(0, 'rgba(255,255,255,0)'); cg.addColorStop(1, 'rgba(255,255,255,.8)');
      c.strokeStyle = cg; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(a1[0], a1[1]); c.stroke();
      jet(c, a1[0], a1[1], 260, ang);
      M.text(c, 'WESTJET TOOK', CX, 320, { size: 130, weight: 900, align: 'center' });
      M.text(c, 'OFF ON A', CX, 455, { size: 130, weight: 900, align: 'center' });
      M.text(c, 'LEAP DAY', CX, 590, { size: 150, weight: 900, align: 'center', color: M.house.gold });
      const s = 64; c.drawImage(window.LOGO, CX - 170, 1500, s, s); M.text(c, 'Calgary Insight', CX - 90, 1500 + s / 2, { size: 40, base: 'middle', weight: 600 });
  } } ], overlay: null });
window.CUES = () => []; window.TOTAL = () => 1;
