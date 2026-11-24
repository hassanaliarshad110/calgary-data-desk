const EP = { cold: E_cold, why: E_why, gag: E_gag, power: E_power, rescue: E_rescue, handoff: E_handoff, secret: E_secret, cliff: E_cliff, endcard: E_endcard };
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
const VIEWW = { cold: [.85, 140], why: [.85, 150], gag: [.85, 200], power: [.8, 130], rescue: [.85, 140], handoff: [.85, 260], secret: [.85, 140], cliff: [.85, 180] };
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
  let g = `<rect width="1080" height="1920" fill="#f3ead9"/>` + T(540, 100, 70, 'SUSUMAN EP 11 — NEW CAST + PROPS', { fill: C.ink, sw: 0 });
  g += golu({ x: 170, y: 420, s: 1.1, t: .2 }) + golu({ x: 420, y: 420, s: 1.1, t: .3, sit: 1, shiver: 1, ears: 'flat', tears: 1 }) + golu({ x: 680, y: 420, s: 1.1, t: .4, bark: 1, run: 1 }) + lab(420, 480, 'GOLU (Pari ka pilla)');
  g += pariK({ x: 900, y: 520, s: 1.2, t: .2, move: 'wave', mt: .3, expr: 'happy' }) + lab(900, 570, 'PARI (Ep 6)');
  g += `<g transform="translate(0,0)">${coach(540, 1000, .9, { t: .2, win: { 2: pariWin(.2, { ma: 1 }) }, label: 'S3' })}</g>` + lab(540, 1050, "Pari's coach (green) · window clip");
  g += loco(300, 1450, .7, { beam: 1, t: .2, col: '#8a2a2a' }) + wagon(820, 1450, .5, {}) + lab(540, 1500, 'goods engine · wagon');
  g += suitcase(200, 1760, .8, '#8e44ad') + samosaPlate(420, 1720, 1.3) + `<g transform="translate(560,1900) scale(.5) translate(1060,-1250)">${wcBoothS(.2, { glow: .6 })}</g>` + lab(560, 1880, 'suitcase · samosa · station WC');
  const svg = document.getElementById('s'); svg.setAttribute('width', 1080); svg.setAttribute('height', 1920); svg.setAttribute('viewBox', '0 0 1080 1920');
  svg.innerHTML = DEFS() + depthDefs() + g;
};
