function rays(cx, cy, n, c1, c2, R = 2600) { let g = ''; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + .5) / n * Math.PI * 2; g += `<path d="M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} L${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}Z" fill="${i % 2 ? c1 : c2}"/>`; } return g; }
function logo(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-330" y="20" width="660" height="34" rx="17" fill="${C.red}" transform="skewX(-20)"/>${T(0, 30, 120, 'SUSUMAN', { shadow: C.red, sw: 12, ls: 4 })}${crown(-250, -70, .6)}</g>`; }
function badge(x, y, txt, s = 1) { return `<g transform="translate(${x},${y}) scale(${s}) rotate(-6)"><rect x="-110" y="-46" width="220" height="92" rx="20" fill="${C.gold}" stroke="#000" stroke-width="7"/>${T(0, 22, 64, txt, { fill: '#000', sw: 0, ls: 2 })}</g>`; }
// Episode 3 thumbnails (based on ep2) — 2.5D: blurred far rooftops + haze, neem + trapped pigeon (mid), Susuman sharp (hero plane), blurred foreground kite/leaves
function far2(w, h, y) { let g = ''; for (let i = 0; i < 20; i++) { const x = i * w / 14 - 60, hh = 120 + hs(i) * 160; g += `<rect x="${x}" y="${y - hh}" width="${w / 15}" height="${hh + 400}" fill="${['#e9a76a', '#f0b878', '#e39a5e'][i % 3]}"/>${i % 3 === 0 ? `<rect x="${x + 16}" y="${y - hh - 34}" width="40" height="34" rx="6" fill="#8a5a3a"/>` : ''}`; } return `<g filter="url(#dof6)">${g}</g>`; }
function water3(w, y, h) { let g = `<rect x="0" y="${y}" width="${w}" height="${h}" fill="#4f7fa8"/>`; for (let r = 0; r < 10; r++) { const yy = y + 20 + r * r * 6; g += `<path d="${[...Array(Math.ceil(w / 200) + 1)].map((_, k) => `M${k * 200 + r * 37 % 200 - 100},${yy} q40,-${6 + r} 80,0`).join(' ')}" stroke="#d8e7f2" stroke-width="${3 + r * .4}" fill="none" opacity="${.7 - r * .04}"/>`; } return g; }
function rain3(w, h, n, op, len, sw, seed) { let g = `<g stroke="#ffffff" stroke-width="${sw}" stroke-linecap="round" opacity="${op}">`; for (let i = 0; i < n; i++) { const x = hs(i * 3.1 + seed) * (w + 200) - 100, y = hs(i * 7.7 + seed) * h; g += `<path d="M${x},${y} l${len * .18},${len}"/>`; } return g + '</g>'; }
const TH3 = {
  ep3_v: [1080, 1920, () => {
    let g = `<rect width="1080" height="1920" fill="#ffcf3a"/>` + rays(540, 820, 24, '#ffb02e', '#ffd75e');
    g += far2(1080, 1920, 1250) + `<rect x="0" y="0" width="1080" height="1920" fill="#3e5a80" opacity=".18"/>`;
    g += water3(1080, 1230, 700) + `<g filter="url(#dof4)">${rain3(1080, 1920, 50, .5, 70, 4, 3)}</g>`;
    g += `<g transform="rotate(-8 760 1320)">${pilla({ x: 780, y: 1250, s: 1.25, t: .3, shiver: 0, bark: .7 })}${crate(770, 1340, 1.6, 0)}</g><ellipse cx="770" cy="1370" rx="240" ry="30" fill="none" stroke="#e8f1fa" stroke-width="7"/>`;
    g += lightPool(330, 1500, 380, 120, .8) + susu({ x: 300, y: 1640, s: 1.15, rot: 24, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 178, armR: 150, legL: -20, legR: 12, mouth: 'shout', brow: .3 });
    g += `<g filter="url(#dofNear)">${rain3(1080, 1920, 14, .7, 220, 12, 9)}</g>`;
    g += `<g transform="translate(540,250) rotate(-4)">${T(0, 0, 160, 'PILLA', { shadow: '#000', sw: 16 })}${T(0, 160, 170, 'BACHAO!', { fill: C.red, stroke: '#fff', sw: 18, shadow: '#000' })}</g>`;
    g += logo(540, 1780, 1.05) + badge(900, 1600, 'EP 2');
    return g; }],
  ep3_h: [1280, 720, () => {
    let g = `<rect width="1280" height="720" fill="#ffcf3a"/>` + rays(840, 330, 24, '#ffb02e', '#ffd75e');
    g += far2(1280, 720, 560) + `<rect width="1280" height="720" fill="#3e5a80" opacity=".18"/>` + water3(1280, 540, 200) + `<g filter="url(#dof4)">${rain3(1280, 720, 40, .5, 50, 3, 3)}</g>`;
    g += `<g transform="rotate(-8 1060 560)">${pilla({ x: 1070, y: 520, s: .8, t: .3, bark: .7 })}${crate(1060, 580, 1.05, 0)}</g>`;
    g += lightPool(760, 640, 300, 90, .8) + susu({ x: 740, y: 790, s: .72, rot: 20, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 178, armR: 150, legL: -20, legR: 12, mouth: 'shout', brow: .3 });
    g += `<g transform="translate(320,170) rotate(-4)">${T(0, 0, 130, 'PILLA', { shadow: '#000', sw: 14 })}${T(0, 130, 130, 'BACHAO!', { fill: C.red, stroke: '#fff', sw: 16, shadow: '#000' })}</g>`;
    g += logo(320, 560, .78) + badge(140, 660, 'EP 2', .8);
    return g; }],
  wide_bg: [1920, 1080, () => {
    let g = `<rect width="1920" height="1080" fill="#ffcf3a"/>` + rays(960, 540, 32, '#ffb02e', '#ffd75e', 3000);
    g += far2(1920, 1080, 1050);
    g += `<rect x="640" y="0" width="640" height="1080" fill="#000"/>`;
    g += logo(330, 170, .9) + `<g transform="translate(320,330)">${T(0, 0, 58, 'EPISODE 2', { fill: '#000', sw: 0, ls: 4 })}${T(0, 80, 76, 'BARISH MEIN', { fill: C.red, stroke: '#fff', sw: 10 })}${T(0, 160, 76, 'PILLA!', { fill: C.red, stroke: '#fff', sw: 10 })}</g>`;
    g += `<g transform="rotate(-6 330 860)">${pilla({ x: 340, y: 800, s: .95, t: .3 })}${crate(330, 900, 1.25, 0)}</g>`;
    g += susu({ x: 1600, y: 1000, s: .95, t: .3, power: 1, cape: 1, crown: 1, shades: 1, armR: 160, fistR: 1, mouth: 'grin' });
    g += `<g transform="translate(1600,150)"><rect x="-230" y="-60" width="460" height="120" rx="60" fill="#ff0000" stroke="#fff" stroke-width="6"/>${T(0, 26, 66, 'SUBSCRIBE', { sw: 0, ls: 4 })}</g>`;
    return g; }],
};
window.drawThumb = id => { const [w, h, f] = TH3[id]; const s = document.getElementById('s'); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.innerHTML = defs() + skyDefs + skyDefs2 + stormDefs + depthDefs() + f(); return [w, h]; };
