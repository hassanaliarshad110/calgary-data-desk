const EP = { cold: E_cold, garmi: E_garmi, gag: E_gag, power: E_power, rescue: E_rescue, fix: E_fix, secret: E_secret, tv: E_tv, lesson: E_lesson, cliff: E_cliff, endcard: E_endcard };
const HAZE = id => id === 'tv' ? '#ffd9b0' : '#ffe9c8';
// heatwave sky for this episode (pale hot blue → white-gold horizon)
const skyDefsHot = skyDefs2.replace(/<linearGradient id="skyK"[\s\S]*?<\/linearGradient>/, '<linearGradient id="skyK" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fb8e8"/><stop offset=".45" stop-color="#bfe2f2"/><stop offset=".72" stop-color="#fff0c4"/><stop offset="1" stop-color="#ffcf8a"/></linearGradient>');
const DEFS = () => defs() + skyDefs + skyDefsHot + melaDefs + gapDefs;
window.drawFrame = (id, t) => {
  const s = TL.scenes.find(x => x.id === id); ABS = s.start + t;
  const svg = document.getElementById('s'); svg.setAttribute('width', 1080); svg.setAttribute('height', 1920); svg.setAttribute('viewBox', '0 0 1080 1920');
  svg.innerHTML = DEFS() + depthDefs(HAZE(id)) + EP[id](t);
};
// =================== 16:9 version (same scenes framed for 1920x1080; captions redrawn; native end screen) ===================
let WIDE = false, CAPW = null;
const _cap2 = caption2;
caption2 = (txt, who, op) => { if (WIDE) { CAPW = [txt, who, op]; return ''; } return _cap2(txt, who, op); };
const VIEWW = { cold: [.85, 95], garmi: [.85, 170], gag: [.85, 190], power: [.8, 130], rescue: [.85, 160], fix: [.85, 170], secret: [.85, 190], tv: [.85, 200], lesson: [.85, 170], cliff: [.85, 150] };
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
  let g = `<rect width="1080" height="1920" fill="#f3ead9"/>` + T(540, 100, 70, 'SUSUMAN EP 9 — NEW CAST + PROPS', { fill: C.ink, sw: 0 });
  g += T(540, 190, 50, 'CHIDIYA (house sparrow)', { fill: '#7a4a24', sw: 0 });
  [['stand', 0, 0, 0], ['fly', 0, 0, 0], ['faint', 1, 0, 0], ['drink', 0, 0, 0], ['stand', 0, 1, 1]].forEach(([pose, pant, happy, fluff], i) => { const x = 120 + i * 210; g += chidiya({ x, y: 470, s: 2.0, pose, pant, happy, fluff, t: .1 }) + lab(x, 540, pose + (happy ? ' (happy)' : pant ? ' (panting)' : '')); });
  g += T(540, 650, 50, 'MYNA · TOTA · KAUWA · KABOOTAR', { fill: '#2e8a3a', sw: 0 });
  g += bird({ kind: 'myna', x: 150, y: 900, s: 2, t: 0 }) + bird({ kind: 'tota', x: 420, y: 900, s: 2, t: 0 }) + bird({ kind: 'kauwa', x: 700, y: 900, s: 1.7, t: 0 }) + kabootar({ x: 940, y: 900, s: 1.1, t: 0, pose: 'perch', flip: -1 });
  g += lab(150, 960, 'myna') + lab(420, 960, 'tota') + lab(700, 960, 'kauwa') + lab(940, 960, 'kabootar');
  g += T(540, 1070, 46, 'KUNDA (bird water bowl) · TIN CHHAJJA · 48° SIGN', { fill: C.ink, sw: 0 }) + kunda(220, 1300, 1.6, 1, .2, 1) + `<g transform="translate(-1360,140)">${ledgeSvg(.2, { hot: true }).replace(/<clipPath[\s\S]*?<\/g>/, '')}</g>` + chidiya({ x: 590, y: 1386, s: 1.4, pose: 'faint', pant: 1, t: .1 }) + thermo9(900, 1400, .8, .2, 1);
  g += T(540, 1540, 46, 'BASIM\'S HOT TANK: PIPE → BURST JET → GOOSENECK', { fill: C.ink, sw: 0 });
  g += `<g transform="translate(-760,1215) scale(.6)">${`<rect x="${TK.x}" y="${TK.top}" width="${TK.w}" height="${TK.bot - TK.top}" rx="26" fill="url(#tankG)" stroke="${C.ink}" stroke-width="6"/>` + hotTank(.3, { burst: 1 }) + jet(.3, 1, 2000, FY + 220)}</g><g transform="translate(-320,1215) scale(.6)">${`<rect x="${TK.x}" y="${TK.top}" width="${TK.w}" height="${TK.bot - TK.top}" rx="26" fill="url(#tankG)" stroke="${C.ink}" stroke-width="6"/>` + hotTank(.3, { bend: 1, burst: 1 }) + kunda(KUNDA[0], KUNDA[1], 1, 1, .3, 1)}</g>`;
  const svg = document.getElementById('s'); svg.setAttribute('width', 1080); svg.setAttribute('height', 1920); svg.setAttribute('viewBox', '0 0 1080 1920');
  svg.innerHTML = DEFS() + depthDefs() + g;
};
