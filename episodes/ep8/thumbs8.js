function rays(cx, cy, n, c1, c2, R = 2600) { let g = ''; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + .5) / n * Math.PI * 2; g += `<path d="M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} L${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}Z" fill="${i % 2 ? c1 : c2}"/>`; } return g; }
function logo(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-330" y="20" width="660" height="34" rx="17" fill="${C.red}" transform="skewX(-20)"/>${T(0, 30, 120, 'SUSUMAN', { shadow: C.red, sw: 12, ls: 4 })}${crown(-250, -70, .6)}</g>`; }
function badge(x, y, txt, s = 1) { return `<g transform="translate(${x},${y}) scale(${s}) rotate(-6)"><rect x="-110" y="-46" width="220" height="92" rx="20" fill="${C.gold}" stroke="#000" stroke-width="7"/>${T(0, 22, 64, txt, { fill: '#000', sw: 0, ls: 2 })}</g>`; }

// Episode 8 thumbnails — 2.5D: yellow rays + blurred jam (bus, painted truck, honk bubbles, red signal) far, Lali the cow (mid, soft),
// Susuman sharp + big carrying Chhotu the calf (hero plane), blurred foreground fruit crates (near)
function jamT(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})">${truck(-700, 0, 1, {})}${bus(500, 0, 1, '#e5463b', { flip: -1, seed: 2, board: 'SHEHAR BUS' })}${honkB(-700, -560, 1.6, .1, 1)}${honkB(520, -560, 1.6, .2, 2)}${signal(-60, 40, 'red', 0)}</g>`; }
function cratesT(w, y, s) { let g = ''; for (let k = 0; k < 3; k++) { const bx = 160 + k * w / 2.4; g += `<g transform="translate(${bx},${y}) scale(${s})"><rect x="-150" y="-150" width="300" height="150" fill="#b07a46" stroke="${C.ink}" stroke-width="6"/>${[...Array(6)].map((_, m) => `<circle cx="${-110 + m * 44}" cy="${-160 - (m % 2) * 18}" r="26" fill="${['#e5463b', '#ffb330', '#43a047'][m % 3]}" stroke="${C.ink}" stroke-width="4"/>`).join('')}</g>`; } return `<g filter="url(#dofNear)">${g}</g>`; }
const TH7 = {
  ep8_v: [1080, 1920, () => {
    let g = `<rect width="1080" height="1920" fill="#ffcf3a"/>` + rays(540, 900, 24, '#ffb02e', '#ffd75e');
    g += `<g filter="url(#dof6)" opacity=".92">${jamT(540, 1230, .62)}</g><rect width="1080" height="1920" fill="#fff1d6" opacity=".22"/>`;
    g += `<g filter="url(#dofNear2)">${shadow(760, 1525, 300, .7)}${lali({ x: 640, y: 1520, s: 1.35, pose: 'stand', t: .3, mood: 'love', flip: 1 })}</g>`;
    g += liftShadow(380, 1840, 220, 160, { dx: -50, skew: 35 }) + lightPool(380, 1810, 420, 100, .9);
    g += susu({ x: 380, y: 1770, s: 1.15, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 150, armR: 150, mouth: 'grin', tilt: -3 });
    g += chhotu({ x: 400, y: 1770 - 600 * 1.15, s: 1.3, pose: 'stand', t: .2, mood: 'happy', flip: 1 });
    g += cratesT(1080, 2060, 1.5);
    g += `<g transform="translate(540,300) rotate(-4)">${T(0, 0, 160, 'TRAFFIC', { shadow: '#000', sw: 16 })}${T(0, 190, 230, 'JAM!', { fill: C.red, stroke: '#fff', sw: 18, shadow: '#000' })}</g>`;
    g += logo(540, 1840, .95) + badge(900, 660, 'EP 8');
    return g; }],
  ep8_h: [1280, 720, () => {
    let g = `<rect width="1280" height="720" fill="#ffcf3a"/>` + rays(880, 330, 24, '#ffb02e', '#ffd75e');
    g += `<g filter="url(#dof6)" opacity=".92">${jamT(900, 520, .36)}</g><rect width="1280" height="720" fill="#fff1d6" opacity=".22"/>`;
    g += `<g filter="url(#dofNear2)">${shadow(1090, 712, 170, .7)}${lali({ x: 1010, y: 710, s: .72, pose: 'stand', t: .3, mood: 'love', flip: 1 })}</g>`;
    g += lightPool(780, 712, 260, 50, .9) + susu({ x: 780, y: 745, s: .55, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 150, armR: 150, mouth: 'grin', tilt: -3 });
    g += chhotu({ x: 790, y: 745 - 600 * .55, s: .62, pose: 'stand', t: .2, mood: 'happy', flip: 1 });
    g += `<g filter="url(#dofNear)">${[[60, 760], [1240, 770]].map(([x, y]) => `<g transform="translate(${x},${y}) scale(.9)"><rect x="-150" y="-150" width="300" height="150" fill="#b07a46" stroke="${C.ink}" stroke-width="6"/>${[...Array(6)].map((_, m) => `<circle cx="${-110 + m * 44}" cy="${-160 - (m % 2) * 18}" r="26" fill="${['#e5463b', '#ffb330', '#43a047'][m % 3]}" stroke="${C.ink}" stroke-width="4"/>`).join('')}</g>`).join('')}</g>`;
    g += `<g transform="translate(330,190) rotate(-4)">${T(0, 0, 120, 'TRAFFIC', { shadow: '#000', sw: 13 })}${T(0, 160, 180, 'JAM!', { fill: C.red, stroke: '#fff', sw: 15, shadow: '#000' })}</g>`;
    g += logo(330, 530, .6) + badge(120, 650, 'EP 8', .8);
    return g; }],
};
window.drawThumb = id => { const [w, h, f] = TH7[id]; const s = document.getElementById('s'); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.innerHTML = defs() + skyDefs + skyDefs2 + melaDefs + depthDefsW() + f(); return [w, h]; };
