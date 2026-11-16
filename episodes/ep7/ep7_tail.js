const EP = { hook: E_hook, home: E_home, clinic: E_clinic, cry: E_cry, power: E_power, rescue: E_rescue, brave: E_brave, ending: E_ending, endcard: E_endcard };
const HAZE = id => id === 'home' ? '#ffe2c0' : '#cfe3f2';
window.drawFrame = (id, t) => {
  const s = TL.scenes.find(x => x.id === id); ABS = s.start + t;
  document.getElementById('s').innerHTML = defs() + skyDefs + skyDefs2 + melaDefs + depthDefs(HAZE(id)) + EP[id](t);
};

// =================== 16:9 version (same scenes framed for 1920x1080; captions redrawn) ===================
let WIDE = false, CAPW = null;
const _cap2 = caption2;
caption2 = (txt, who, op) => { if (WIDE) { CAPW = [txt, who, op]; return ''; } return _cap2(txt, who, op); };
const VIEWW = { hook: [.8, 120], home: [.85, 200], clinic: [.85, 190], cry: [.85, 190], power: [.8, 130], rescue: [.85, 160], brave: [.85, 180], ending: [.85, 180], endcard: [.7, 120] };
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
  const [S, Y0] = VIEWW[id] || [.85, 120];
  const body = widen(EP[id](t)), bg = id === 'endcard' ? `<rect x="-1500" y="-300" width="4100" height="2600" fill="#0b0b12"/>` : '';
  const svg = document.getElementById('s');
  svg.setAttribute('width', 1920); svg.setAttribute('height', 1080); svg.setAttribute('viewBox', '0 0 1920 1080');
  svg.innerHTML = defs() + skyDefs + skyDefs2 + melaDefs + depthDefsW(HAZE(id)) + `<g transform="translate(960,0) scale(${S}) translate(-540,${-Y0})">${bg}${body}</g>` + (CAPW ? captionW(...CAPW) : '');
  WIDE = false;
};
