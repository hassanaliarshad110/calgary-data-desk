const EP = { cold: E_cold, why: E_why, gag: E_gag, power: E_power, rescue: E_rescue, after: E_after, secret: E_secret, school: E_school, cliff: E_cliff, endcard: E_endcard };
const HAZE = id => id === 'power' ? '#ffe9c8' : '#d6e9f6';
const DEFS = () => defs() + skyDefs + skyDefs2 + melaDefs;
window.drawFrame = (id, t) => {
  const s = TL.scenes.find(x => x.id === id); ABS = s.start + t;
  const svg = document.getElementById('s'); svg.setAttribute('width', 1080); svg.setAttribute('height', 1920); svg.setAttribute('viewBox', '0 0 1080 1920');
  svg.innerHTML = DEFS() + depthDefs(HAZE(id)) + EP[id](t);
};
// =================== 16:9 version (same scenes framed for 1920x1080; captions redrawn; native end screen) ===================
let WIDE = false, CAPW = null;
const _cap2 = caption2;
caption2 = (txt, who, op) => { if (WIDE) { CAPW = [txt, who, op]; return ''; } return _cap2(txt, who, op); };
const VIEWW = { cold: [.85, 140], why: [.85, 190], gag: [.85, 200], power: [.8, 130], rescue: [.85, 170], after: [.85, 190], secret: [.85, 200], school: [.85, 190], cliff: [.85, 180] };
function captionW(txt, who, op) {
  const lines = txt.split('|'), fs = 50, lh = 60, y0 = 1036 - (lines.length - 1) * lh, w = Math.min(1500, Math.max(...lines.map(l => l.length)) * 25 + 120);
  let g = `<g opacity="${op}"><rect x="${960 - w / 2}" y="${y0 - 58}" width="${w}" height="${lines.length * lh + 26}" rx="24" fill="#000" opacity=".62"/>`;
  if (who) g += `<rect x="${960 - w / 2 + 20}" y="${y0 - 98}" width="${who.length * 24 + 46}" height="50" rx="12" fill="${SPK[who]}" stroke="#fff" stroke-width="4"/>${T(960 - w / 2 + 43, y0 - 61, 36, who, { anchor: 'start', sw: 0, ls: 3 })}`;
  lines.forEach((l, i) => g += T(960, y0 + i * lh, fs, l, { font: 'Baloo2', weight: 800, sw: 7, ls: 0 }));
  return g + '</g>';
}
function widen(svg) {
  return svg.replace(/<rect width="1080" height="1920"/g, '<rect x="-1500" y="-300" width="4100" height="2600"')
    .replace(/<rect x="0" y="0" width="1080" height="1920"/g, '<rect x="-1500" y="-300" width="4100" height="2600"')
    .replace(/<rect x="-20" y="([^"]+)" width="1120"/g, '<rect x="-1500" y="$1" width="4100"');
}
window.drawFrameW = (id, t) => {
  const s = TL.scenes.find(x => x.id === id); ABS = s.start + t; WIDE = true; CAPW = null;
  const svg = document.getElementById('s');
  svg.setAttribute('width', 1920); svg.setAttribute('height', 1080); svg.setAttribute('viewBox', '0 0 1920 1080');
  if (id === 'endcard') { E_endcard(t); svg.innerHTML = DEFS() + depthDefsW(HAZE(id)) + E_endcardW(t) + (CAPW ? captionW(...CAPW) : ''); WIDE = false; return; }
  const [S, Y0] = VIEWW[id] || [.85, 120];
  const body = widen(EP[id](t));
  svg.innerHTML = DEFS() + depthDefsW(HAZE(id)) + `<g transform="translate(960,0) scale(${S}) translate(-540,${-Y0})">${body}</g>` + (CAPW ? captionW(...CAPW) : '');
  WIDE = false;
};
window.drawCast = () => {
  const lab = (x, y, s) => T(x, y, 34, s, { fill: '#555', sw: 0, font: 'Baloo2', weight: 800 });
  let g = `<rect width="1080" height="1920" fill="#f3ead9"/>` + T(540, 100, 70, 'SUSUMAN EP 10 — NEW CAST + PROPS', { fill: C.ink, sw: 0 });
  g += noor({ x: 200, y: 640, s: 1.4, t: .2, move: 'idle', mt: .2, expr: 'sad' }) + noor({ x: 440, y: 640, s: 1.4, t: .2, move: 'wave', mt: .4, yaw: -.3, expr: 'happy' }) + lab(320, 700, 'NOOR (new friend)');
  g += driver({ x: 800, y: 700, s: 1.1, t: .2, move: 'idle', mt: .2, expr: 'happy' }) + lab(800, 760, 'DRIVER CHACHA');
  g += T(540, 860, 50, 'SCHOOL VAN (kids in the windows)', { fill: '#c8102e', sw: 0 }) + schoolVan(540, 1250, .95, .3, { mood: 'scream', noorMood: 'cry' });
  g += vanBumper(160, 1330, 1.2) + lab(190, 1390, 'rear bumper');
  g += schoolBag(560, 1420, 1.2) + tiffin(800, 1420, 1.3) + lab(680, 1480, 'school bag · tiffin');
  g += T(540, 1580, 46, "AMMAR'S NAALI KHADDA · NANHE TAARE SCHOOL", { fill: C.ink, sw: 0 }) + `<g transform="translate(-1700,40) scale(.7)">${khadda(.3)}</g>` + kface(860, 1760, 60, .2, { girl: 1, m: 'scream', hands: 1 }) + kface(990, 1760, 60, .2, { m: 'smile' });
  const svg = document.getElementById('s'); svg.setAttribute('width', 1080); svg.setAttribute('height', 1920); svg.setAttribute('viewBox', '0 0 1080 1920');
  svg.innerHTML = DEFS() + depthDefs() + g;
};
