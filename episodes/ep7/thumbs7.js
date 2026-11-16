function rays(cx, cy, n, c1, c2, R = 2600) { let g = ''; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + .5) / n * Math.PI * 2; g += `<path d="M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} L${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}Z" fill="${i % 2 ? c1 : c2}"/>`; } return g; }
function logo(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-330" y="20" width="660" height="34" rx="17" fill="${C.red}" transform="skewX(-20)"/>${T(0, 30, 120, 'SUSUMAN', { shadow: C.red, sw: 12, ls: 4 })}${crown(-250, -70, .6)}</g>`; }
function badge(x, y, txt, s = 1) { return `<g transform="translate(${x},${y}) scale(${s}) rotate(-6)"><rect x="-110" y="-46" width="220" height="92" rx="20" fill="${C.gold}" stroke="#000" stroke-width="7"/>${T(0, 22, 64, txt, { fill: '#000', sw: 0, ls: 2 })}</g>`; }

// Episode 7 thumbnails — 2.5D: yellow rays + blurred bamboo machaan with the loose plank (far), soft MOHALLA CLINIC sign (mid),
// Susuman sharp + big holding scared Mano, a giant syringe with a glint (hero plane), blurred foreground fruit crates (near)
function machT(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s}) translate(-1440,-560)">${machaan(.3, { plankAng: 12, plankCrack: 1 })}</g>`; }
function clinicSignT(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s}) translate(-450,-580)">${clinic(.3, {})}</g>`; }
function cratesT(w, y, s) { let g = ''; for (let k = 0; k < 3; k++) { const bx = 160 + k * w / 2.4; g += `<g transform="translate(${bx},${y}) scale(${s})"><rect x="-150" y="-150" width="300" height="150" fill="#b07a46" stroke="${C.ink}" stroke-width="6"/>${[...Array(6)].map((_, m) => `<circle cx="${-110 + m * 44}" cy="${-160 - (m % 2) * 18}" r="26" fill="${['#e5463b', '#ffb330', '#43a047'][m % 3]}" stroke="${C.ink}" stroke-width="4"/>`).join('')}</g>`; } return `<g filter="url(#dofNear)">${g}</g>`; }
function glintT(x, y, s) { return `<path transform="translate(${x},${y}) scale(${s})" d="M0,-60 l16,44 44,16 -44,16 -16,44 -16,-44 -44,-16 44,-16z" fill="#fff" stroke="${C.ink}" stroke-width="3"/>`; }
const TH7 = {
  ep7_v: [1080, 1920, () => {
    let g = `<rect width="1080" height="1920" fill="#ffcf3a"/>` + rays(540, 900, 24, '#ffb02e', '#ffd75e');
    g += `<g filter="url(#dof6)" opacity=".9">${machT(820, 900, .95)}</g><rect width="1080" height="1920" fill="#fff1d6" opacity=".2"/>`;
    g += `<g filter="url(#dofNear2)" opacity=".95">${clinicSignT(300, 1180, .9)}</g>`;
    g += liftShadow(560, 1830, 220, 160, { dx: -50, skew: 35 }) + lightPool(560, 1800, 420, 100, .9);
    g += syringe(260, 900, 2.3, -35, .3) + glintT(130, 760, 1.2);
    g += susu({ x: 560, y: 1760, s: 1.2, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 105, armR: 120, mouth: 'o', brow: .6, tilt: -3 });
    g += cat({ x: 560 + 150 * 1.2, y: 1760 - 290 * 1.2, s: 1.6, pose: 'sit', flip: -1, t: .2, meow: 1, wide: 1 });
    g += cratesT(1080, 2050, 1.5);
    g += `<g transform="translate(540,290) rotate(-4)">${T(0, 0, 150, 'INJECTION', { shadow: '#000', sw: 16 })}${T(0, 180, 220, 'NAHI!', { fill: C.red, stroke: '#fff', sw: 18, shadow: '#000' })}</g>`;
    g += logo(540, 1835, .95) + badge(900, 640, 'EP 7');
    return g; }],
  ep7_h: [1280, 720, () => {
    let g = `<rect width="1280" height="720" fill="#ffcf3a"/>` + rays(880, 330, 24, '#ffb02e', '#ffd75e');
    g += `<g filter="url(#dof6)" opacity=".9">${machT(1080, 330, .45)}</g><rect width="1280" height="720" fill="#fff1d6" opacity=".2"/>`;
    g += `<g filter="url(#dofNear2)" opacity=".95">${clinicSignT(700, 520, .45)}</g>`;
    g += lightPool(920, 712, 260, 50, .9) + syringe(1130, 470, 1.1, -60, .3) + glintT(1190, 300, .7);
    g += susu({ x: 900, y: 745, s: .66, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 105, armR: 120, mouth: 'o', brow: .6, tilt: -3 });
    g += cat({ x: 900 + 150 * .66, y: 745 - 290 * .66, s: .85, pose: 'sit', flip: -1, t: .2, meow: 1, wide: 1 });
    g += `<g filter="url(#dofNear)">${[[60, 760], [1240, 770]].map(([x, y]) => `<g transform="translate(${x},${y}) scale(.9)"><rect x="-150" y="-150" width="300" height="150" fill="#b07a46" stroke="${C.ink}" stroke-width="6"/>${[...Array(6)].map((_, m) => `<circle cx="${-110 + m * 44}" cy="${-160 - (m % 2) * 18}" r="26" fill="${['#e5463b', '#ffb330', '#43a047'][m % 3]}" stroke="${C.ink}" stroke-width="4"/>`).join('')}</g>`).join('')}</g>`;
    g += `<g transform="translate(340,190) rotate(-4)">${T(0, 0, 120, 'INJECTION', { shadow: '#000', sw: 13 })}${T(0, 150, 170, 'NAHI!', { fill: C.red, stroke: '#fff', sw: 15, shadow: '#000' })}</g>`;
    g += logo(340, 520, .6) + badge(120, 640, 'EP 7', .8);
    return g; }],
};
window.drawThumb = id => { const [w, h, f] = TH7[id]; const s = document.getElementById('s'); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.innerHTML = defs() + skyDefs + skyDefs2 + melaDefs + depthDefs() + f(); return [w, h]; };
