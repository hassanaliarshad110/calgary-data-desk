function rays(cx, cy, n, c1, c2, R = 2600) { let g = ''; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + .5) / n * Math.PI * 2; g += `<path d="M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} L${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}Z" fill="${i % 2 ? c1 : c2}"/>`; } return g; }
function logo(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-330" y="20" width="660" height="34" rx="17" fill="${C.red}" transform="skewX(-20)"/>${T(0, 30, 120, 'SUSUMAN', { shadow: C.red, sw: 12, ls: 4 })}${crown(-250, -70, .6)}</g>`; }
function badge(x, y, txt, s = 1) { return `<g transform="translate(${x},${y}) scale(${s}) rotate(-6)"><rect x="-110" y="-46" width="220" height="92" rx="20" fill="${C.gold}" stroke="#000" stroke-width="7"/>${T(0, 22, 64, txt, { fill: '#000', sw: 0, ls: 2 })}</g>`; }
// Episode 3 thumbnails (based on ep2) — 2.5D: blurred far rooftops + haze, neem + trapped pigeon (mid), Susuman sharp (hero plane), blurred foreground kite/leaves
function far2(w, h, y) { let g = ''; for (let i = 0; i < 20; i++) { const x = i * w / 14 - 60, hh = 120 + hs(i) * 160; g += `<rect x="${x}" y="${y - hh}" width="${w / 15}" height="${hh + 400}" fill="${['#e9a76a', '#f0b878', '#e39a5e'][i % 3]}"/>${i % 3 === 0 ? `<rect x="${x + 16}" y="${y - hh - 34}" width="40" height="34" rx="6" fill="#8a5a3a"/>` : ''}`; } return `<g filter="url(#dof6)">${g}</g>`; }
// Episode 5 thumbnails — 2.5D: blurred far rooftops + haze (far), the pole + transformer with sparks and Bandar Mama hanging with Dadi's glasses (mid),
// Susuman sharp + big holding out a banana (hero plane), blurred foreground dupatta + neem leaves (near)
function poleT(x, y, s, t) { return `<g transform="translate(${x},${y}) scale(${s})">${pole(0, { trafo: 1 })}${wires(-1400, 1400).replace(/stroke-width="(\d)"/g, 'stroke-width="$1"')}</g>`; }
function fgDupatta(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})" filter="url(#dofNear)"><path d="M0,0 Q300,120 700,-10" stroke="#444" stroke-width="8" fill="none"/>${[['#e4568a', 40, 300], ['#ffd34a', 260, 220], ['#22a35a', 470, 260]].map(([c, dx, h]) => `<path d="M${dx},${30 + dx * .12} h170 l14,${h} q-100,26 -198,0Z" fill="${c}" stroke="${C.ink}" stroke-width="6"/>`).join('')}</g>`; }
function leavesT(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})" filter="url(#dofNear)">${[[0, 0, 150], [140, 90, 130], [-120, 110, 120], [60, 220, 110]].map(([a, b, r]) => `<circle cx="${a}" cy="${b}" r="${r}" fill="#1f6a27"/><circle cx="${a - 24}" cy="${b - 20}" r="${r * .6}" fill="#2e7d32"/>`).join('')}</g>`; }
function kelaBig(x, y, s, rot) { return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M-26,44 Q-56,-40 6,-118 Q-2,-30 26,44Z" fill="#ffd23a" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/><path d="M-12,30 Q-30,-30 0,-96" stroke="#fff3a6" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M6,-118 l4,-18 h8 l-4,18z" fill="#6b4a2a"/><path d="M-22,44 h46 v10 h-46z" fill="#6b4a2a"/></g>`; }
const TH5 = {
  ep5_v: [1080, 1920, () => {
    let g = `<rect width="1080" height="1920" fill="#ffcf3a"/>` + rays(540, 900, 24, '#ffb02e', '#ffd75e');
    g += far2(1080, 1920, 1300) + `<rect width="1080" height="1920" fill="#fff1d6" opacity=".25"/>`;
    g += `<g filter="url(#dof4)">${poleT(260, 420, 1.1, .3)}</g>` + sparks(260 + 110 * 1.1, 420 + (ARM - 24) * 1.1, .37, 1.2, 12, 130);
    g += bandar({ x: 260 + 250 * 1.1, y: 420 + (ARM + 20) * 1.1, s: 1.5, pose: 'hang', t: .4, item: 'chashma', angry: 1, look: [6, 2] });
    g += liftShadow(660, 1820, 200, 120, { dx: -50, skew: 35 }) + lightPool(640, 1790, 380, 90, .9);
    g += susu({ x: 680, y: 1800, s: 1.22, t: .4, power: 1, cape: 1, crown: 1, shades: 1, flip: -1, armL: 30, armR: 118, mouth: 'grin', brow: .2, tilt: -4 });
    { const h = susHand(680, 1800, 1.22, 118, 1, -1); g += kelaBig(h[0] - 20, h[1] - 50, 1.3, -30); }
    g += fgDupatta(-60, 1700, 1.2) + leavesT(1000, 60, 1.1);
    g += `<g transform="translate(560,230) rotate(-4)">${T(0, 0, 170, 'CHASHMA', { shadow: '#000', sw: 16 })}${T(0, 170, 190, 'CHOR!', { fill: C.red, stroke: '#fff', sw: 18, shadow: '#000' })}</g>`;
    g += logo(540, 1830, .95) + badge(910, 520, 'EP 5');
    return g; }],
  ep5_h: [1280, 720, () => {
    let g = `<rect width="1280" height="720" fill="#ffcf3a"/>` + rays(820, 330, 24, '#ffb02e', '#ffd75e');
    g += far2(1280, 720, 560) + `<rect width="1280" height="720" fill="#fff1d6" opacity=".25"/>`;
    g += `<g filter="url(#dof4)">${poleT(640, 60, .62, .3)}</g>` + sparks(640 + 110 * .62, 60 + (ARM - 24) * .62, .37, 1.1, 11, 80);
    g += bandar({ x: 640 + 250 * .62, y: 60 + (ARM + 20) * .62, s: .78, pose: 'hang', t: .4, item: 'chashma', angry: 1, look: [6, 2] });
    g += lightPool(1030, 712, 230, 50, .9) + susu({ x: 1040, y: 745, s: .66, t: .4, power: 1, cape: 1, crown: 1, shades: 1, flip: -1, armL: 30, armR: 112, mouth: 'grin', brow: .2, tilt: -4 });
    { const h = susHand(1040, 745, .66, 112, 1, -1); g += kelaBig(h[0] - 14, h[1] - 34, .8, -30); }
    g += leavesT(1250, -30, .7) + fgDupatta(-80, 600, .7);
    g += `<g transform="translate(300,170) rotate(-4)">${T(0, 0, 124, 'CHASHMA', { shadow: '#000', sw: 13 })}${T(0, 130, 140, 'CHOR!', { fill: C.red, stroke: '#fff', sw: 15, shadow: '#000' })}</g>`;
    g += logo(300, 470, .6) + badge(110, 640, 'EP 5', .8);
    return g; }],
};
window.drawThumb = id => { const [w, h, f] = TH5[id]; const s = document.getElementById('s'); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.innerHTML = defs() + skyDefs + skyDefs2 + depthDefs() + f(); return [w, h]; };
