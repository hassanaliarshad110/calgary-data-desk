function rays(cx, cy, n, c1, c2, R = 2600) { let g = ''; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + .5) / n * Math.PI * 2; g += `<path d="M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} L${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}Z" fill="${i % 2 ? c1 : c2}"/>`; } return g; }
function logo(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-330" y="20" width="660" height="34" rx="17" fill="${C.red}" transform="skewX(-20)"/>${T(0, 30, 120, 'SUSUMAN', { shadow: C.red, sw: 12, ls: 4 })}${crown(-250, -70, .6)}</g>`; }
function badge(x, y, txt, s = 1) { return `<g transform="translate(${x},${y}) scale(${s}) rotate(-6)"><rect x="-110" y="-46" width="220" height="92" rx="20" fill="${C.gold}" stroke="#000" stroke-width="7"/>${T(0, 22, 64, txt, { fill: '#000', sw: 0, ls: 2 })}</g>`; }
// Episode 3 thumbnails (based on ep2) — 2.5D: blurred far rooftops + haze, neem + trapped pigeon (mid), Susuman sharp (hero plane), blurred foreground kite/leaves
function far2(w, h, y) { let g = ''; for (let i = 0; i < 20; i++) { const x = i * w / 14 - 60, hh = 120 + hs(i) * 160; g += `<rect x="${x}" y="${y - hh}" width="${w / 15}" height="${hh + 400}" fill="${['#e9a76a', '#f0b878', '#e39a5e'][i % 3]}"/>${i % 3 === 0 ? `<rect x="${x + 16}" y="${y - hh - 34}" width="40" height="34" rx="6" fill="#8a5a3a"/>` : ''}`; } return `<g filter="url(#dof6)">${g}</g>`; }
// Episode 4 thumbnails — 2.5D: blurred far rooftops + haze, the sloped lane, the runaway thela (mid), Susuman sharp + big (hero plane), Basim, blurred foreground bougainvillea + kulfi
function lane4(w, y0, y1) { return `<polygon points="0,${y0} ${w},${y1} ${w},${y1 + 2000} 0,${y0 + 2000}" fill="#dcc7a2"/><path d="M0,${y0} L${w},${y1}" stroke="#8d8d93" stroke-width="20"/><path d="M0,${y0 + 70} L${w},${y1 + 70}" stroke="#c6ad84" stroke-width="5"/><path d="M0,${y0 + 170} L${w},${y1 + 170}" stroke="#c6ad84" stroke-width="7"/>` + [...Array(12)].map((_, k) => `<path d="M${k * w / 10},${y0 + (y1 - y0) * k / 10} l-260,900" stroke="#c6ad84" stroke-width="4"/>`).join(''); }
function boug(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})" filter="url(#dofNear)">` + [[-120, 60, 120], [10, -40, 110], [-60, 180, 90], [120, 40, 80]].map(([a, b, r], i) => `<circle cx="${a}" cy="${b}" r="${r}" fill="#2e7d32"/>${[...Array(5)].map((_, k) => `<circle cx="${a - r * .6 + hs(i * 9 + k) * r * 1.2}" cy="${b - r * .5 + hs(i * 7 + k + 3) * r}" r="${16 + 8 * hs(k + i)}" fill="#ff4f9a"/>`).join('')}`).join('') + '</g>'; }
const TH4 = {
  ep4_v: [1080, 1920, () => {
    let g = `<rect width="1080" height="1920" fill="#ffcf3a"/>` + rays(540, 860, 24, '#ffb02e', '#ffd75e');
    g += far2(1080, 1920, 1220) + `<rect width="1080" height="1920" fill="#fff1d6" opacity=".22"/>`;
    g += lane4(1080, 1230, 1420);
    g += castShadow(330, 1380, 300, 160, .3) + thela({ x: 320, y: 1370, s: .95, ang: 10, t: .4, flip: -1, rattle: 1, um: 2, ring: 1, roll: 1 });
    g += speed(110, 1120, 1, .8, 5) + kulfi(170, 820, .8, -40, 'mango') + kulfi(520, 760, .7, 30, 'pista');
    g += sk({ key: 'basim', x: 960, y: 1570, s: 1.4, t: .3, move: 'scared', mt: .3, yaw: -.6, expr: 'scared' }) + ball(880, 1560, 30, 20);
    g += lightPool(590, 1530, 330, 80, .9) + shadow(580, 1560, 170, .9, { dx: -50, skew: 35 }) + susu({ x: 590, y: 1560, s: 1.02, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 96, armR: 60, fistL: 1, legL: -18, legR: 22, mouth: 'shout', brow: .3, tilt: -6 });
    g += dust(820, 1570, .45, 6, 70) + boug(-40, 120, 1.2) + `<g filter="url(#dofNear)">${kulfi(1000, 1950, 2.2, 20, 'malai')}</g>`;
    g += `<g transform="translate(540,260) rotate(-4)">${T(0, 0, 170, 'THELA', { shadow: '#000', sw: 16 })}${T(0, 170, 180, 'ROKO!', { fill: C.red, stroke: '#fff', sw: 18, shadow: '#000' })}</g>`;
    g += logo(540, 1790, 1.05) + badge(910, 1620, 'EP 4');
    return g; }],
  ep4_h: [1280, 720, () => {
    let g = `<rect width="1280" height="720" fill="#ffcf3a"/>` + rays(760, 330, 24, '#ffb02e', '#ffd75e');
    g += far2(1280, 720, 540) + `<rect width="1280" height="720" fill="#fff1d6" opacity=".22"/>` + lane4(1280, 520, 640);
    g += castShadow(610, 625, 200, 100, .3) + thela({ x: 600, y: 620, s: .5, ang: 7, t: .4, flip: -1, rattle: 1, um: 2, ring: 1, roll: 1 }) + speed(470, 480, 1, .8, 4);
    g += sk({ key: 'basim', x: 1175, y: 725, s: .85, t: .3, move: 'scared', mt: .3, yaw: -.6, expr: 'scared' });
    g += lightPool(920, 700, 260, 60, .9) + susu({ x: 920, y: 735, s: .66, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 96, armR: 60, fistL: 1, legL: -18, legR: 22, mouth: 'shout', brow: .3, tilt: -6 });
    g += boug(-60, 760, .8);
    g += `<g transform="translate(240,150) rotate(-4)">${T(0, 0, 120, 'THELA', { shadow: '#000', sw: 13 })}${T(0, 120, 130, 'ROKO!', { fill: C.red, stroke: '#fff', sw: 15, shadow: '#000' })}</g>`;
    g += logo(240, 440, .6) + badge(1180, 90, 'EP 4', .8);
    return g; }],
};
window.drawThumb = id => { const [w, h, f] = TH4[id]; const s = document.getElementById('s'); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.innerHTML = defs() + skyDefs + skyDefs2 + depthDefs() + f(); return [w, h]; };
