function rays(cx, cy, n, c1, c2, R = 2600) { let g = ''; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + .5) / n * Math.PI * 2; g += `<path d="M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} L${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}Z" fill="${i % 2 ? c1 : c2}"/>`; } return g; }
function logo(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-330" y="20" width="660" height="34" rx="17" fill="${C.red}" transform="skewX(-20)"/>${T(0, 30, 120, 'SUSUMAN', { shadow: C.red, sw: 12, ls: 4 })}${crown(-250, -70, .6)}</g>`; }
function badge(x, y, txt, s = 1) { return `<g transform="translate(${x},${y}) scale(${s}) rotate(-6)"><rect x="-110" y="-46" width="220" height="92" rx="20" fill="${C.gold}" stroke="#000" stroke-width="7"/>${T(0, 22, 64, txt, { fill: '#000', sw: 0, ls: 2 })}</g>`; }
// Episode 2 thumbnails — 2.5D: blurred far rooftops + haze, neem + trapped pigeon (mid), Susuman sharp (hero plane), blurred foreground kite/leaves
function far2(w, h, y) { let g = ''; for (let i = 0; i < 20; i++) { const x = i * w / 14 - 60, hh = 120 + hs(i) * 160; g += `<rect x="${x}" y="${y - hh}" width="${w / 15}" height="${hh + 400}" fill="${['#e9a76a', '#f0b878', '#e39a5e'][i % 3]}"/>${i % 3 === 0 ? `<rect x="${x + 16}" y="${y - hh - 34}" width="40" height="34" rx="6" fill="#8a5a3a"/>` : ''}`; } return `<g filter="url(#dof6)">${g}</g>`; }
const TH2 = {
  ep2_v: [1080, 1920, () => {
    let g = `<rect width="1080" height="1920" fill="#ffcf3a"/>` + rays(540, 820, 24, '#ffb02e', '#ffd75e');
    g += far2(1080, 1920, 1560) + `<rect x="0" y="1300" width="1080" height="620" fill="#fff1c8" opacity=".35"/>`;
    // mid plane: neem branch + trapped pigeon + glinting manjha
    g += `<g filter="url(#dof4)">${[[860, 520, 230], [1040, 640, 200], [700, 430, 150]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2e7d32" stroke="${C.ink}" stroke-width="6"/><circle cx="${x - 30}" cy="${y - 30}" r="${r * .7}" fill="#43a047"/>`).join('')}</g>`;
    g += `<path d="M1100,760 Q900,740 640,700" stroke="${C.ink}" stroke-width="44" stroke-linecap="round" fill="none"/><path d="M1100,760 Q900,740 640,700" stroke="#7a5233" stroke-width="30" stroke-linecap="round" fill="none"/>`;
    g += `<path d="M-40,300 Q500,520 690,712 Q720,900 760,1100" stroke="#d63a4a" stroke-width="6" fill="none"/>` + glints([[300, 420], [600, 640], [740, 960]], 1.1);
    g += kabootar({ x: 740, y: 1000, s: 2.0, rot: 18, t: .3, pose: 'tangled', wide: 1, flip: -1 }) + [0, 1, 2].map(i => `<ellipse cx="730" cy="${875 + i * 26}" rx="${100 - i * 10}" ry="24" fill="none" stroke="#d63a4a" stroke-width="6" transform="rotate(${-18 + i * 14} 740 890)"/>`).join('');
    g += feather(520, 1080, 1.4, 30) + feather(900, 1260, 1.1, -40);
    // hero plane: big sharp Susuman with a soft shadow glow
    g += lightPool(330, 1500, 380, 120, .8) + susu({ x: 300, y: 1640, s: 1.15, rot: 24, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 178, armR: 150, legL: -20, legR: 12, mouth: 'shout', brow: .3 });
    // foreground (blurred): kite corner + leaves
    g += `<g filter="url(#dofNear)">${patang(980, 1520, 2.4, 30, '#3b8de5', '#fff')}<circle cx="60" cy="40" r="170" fill="#1f6a27"/><circle cx="220" cy="-30" r="150" fill="#2e7d32"/></g>`;
    g += `<g transform="translate(540,250) rotate(-4)">${T(0, 0, 150, 'KABOOTAR', { shadow: '#000', sw: 16 })}${T(0, 150, 170, 'BACHAO!', { fill: C.red, stroke: '#fff', sw: 18, shadow: '#000' })}</g>`;
    g += logo(540, 1760, 1.05) + badge(900, 1600, 'EP 2');
    return g; }],
  ep2_h: [1280, 720, () => {
    let g = `<rect width="1280" height="720" fill="#ffcf3a"/>` + rays(840, 330, 24, '#ffb02e', '#ffd75e');
    g += far2(1280, 720, 690) + `<rect x="0" y="560" width="1280" height="160" fill="#fff1c8" opacity=".35"/>`;
    g += `<g filter="url(#dof4)">${[[1120, 120, 170], [1250, 230, 150], [990, 40, 120]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2e7d32" stroke="${C.ink}" stroke-width="5"/><circle cx="${x - 24}" cy="${y - 24}" r="${r * .7}" fill="#43a047"/>`).join('')}</g>`;
    g += `<path d="M1300,250 Q1150,240 990,215" stroke="${C.ink}" stroke-width="32" stroke-linecap="round" fill="none"/><path d="M1300,250 Q1150,240 990,215" stroke="#7a5233" stroke-width="20" stroke-linecap="round" fill="none"/>`;
    g += `<path d="M600,-20 Q900,120 1030,224 Q1050,330 1080,420" stroke="#d63a4a" stroke-width="5" fill="none"/>`;
    g += kabootar({ x: 1080, y: 410, s: 1.35, rot: 16, t: .3, pose: 'tangled', wide: 1, flip: -1 }) + feather(940, 470, 1, 30);
    g += lightPool(830, 640, 300, 90, .8) + susu({ x: 800, y: 790, s: .72, rot: 20, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 178, armR: 150, legL: -20, legR: 12, mouth: 'shout', brow: .3 });
    g += `<g filter="url(#dofNear)">${patang(1230, 640, 1.6, 30, '#3b8de5', '#fff')}</g>`;
    g += `<g transform="translate(330,170) rotate(-4)">${T(0, 0, 118, 'KABOOTAR', { shadow: '#000', sw: 14 })}${T(0, 125, 130, 'BACHAO!', { fill: C.red, stroke: '#fff', sw: 16, shadow: '#000' })}</g>`;
    g += logo(330, 560, .78) + badge(150, 660, 'EP 2', .8);
    return g; }],
  wide_bg: [1920, 1080, () => {
    let g = `<rect width="1920" height="1080" fill="#ffcf3a"/>` + rays(960, 540, 32, '#ffb02e', '#ffd75e', 3000);
    g += far2(1920, 1080, 1050);
    g += `<rect x="640" y="0" width="640" height="1080" fill="#000"/>`;
    g += logo(330, 170, .9) + `<g transform="translate(320,330)">${T(0, 0, 58, 'EPISODE 2', { fill: '#000', sw: 0, ls: 4 })}${T(0, 80, 76, 'PATANG AUR', { fill: C.red, stroke: '#fff', sw: 10 })}${T(0, 160, 76, 'KABOOTAR!', { fill: C.red, stroke: '#fff', sw: 10 })}</g>`;
    g += patang(170, 700, 1.3, -12, '#e5463b', '#ffd34a') + kabootar({ x: 400, y: 900, s: 1.6, t: 0, pose: 'perch' });
    g += susu({ x: 1600, y: 1000, s: .95, t: .3, power: 1, cape: 1, crown: 1, shades: 1, armR: 160, fistR: 1, mouth: 'grin' });
    g += `<g transform="translate(1600,150)"><rect x="-230" y="-60" width="460" height="120" rx="60" fill="#ff0000" stroke="#fff" stroke-width="6"/>${T(0, 26, 66, 'SUBSCRIBE', { sw: 0, ls: 4 })}</g>`;
    return g; }],
};
window.drawThumb = id => { const [w, h, f] = TH2[id]; const s = document.getElementById('s'); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.innerHTML = defs() + skyDefs + skyDefs2 + depthDefs() + f(); return [w, h]; };
