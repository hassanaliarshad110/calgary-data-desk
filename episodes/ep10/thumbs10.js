function rays(cx, cy, n, c1, c2, R = 2600) { let g = ''; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + .5) / n * Math.PI * 2; g += `<path d="M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} L${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}Z" fill="${i % 2 ? c1 : c2}"/>`; } return g; }
function logo(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-330" y="20" width="660" height="34" rx="17" fill="${C.red}" transform="skewX(-20)"/>${T(0, 30, 120, 'SUSUMAN', { shadow: C.red, sw: 12, ls: 4 })}${crown(-250, -70, .6)}</g>`; }
function badge(x, y, txt, s = 1) { return `<g transform="translate(${x},${y}) scale(${s}) rotate(-6)"><rect x="-110" y="-46" width="220" height="92" rx="20" fill="${C.gold}" stroke="#000" stroke-width="7"/>${T(0, 22, 64, txt, { fill: '#000', sw: 0, ls: 2 })}</g>`; }


// Episode 10 thumbnails (rule 6): Susuman big on the LEFT (same pose + crown every time), the runaway SCHOOL VAN with screaming kids big on the RIGHT,
// tipping over the khadda edge; 2 bold Roman words; bright yellow rays; blurred gali houses behind.
function housesT(x, y, s) { let g = `<g transform="translate(${x},${y}) scale(${s})">`; const cols = ['#9fd8cf', '#f7c6d9', '#ffd98a', '#c9b3f0']; for (let i = 0; i < 6; i++) { const bx = -900 + i * 330, h = 360 + 80 * (i % 3); g += `<rect x="${bx}" y="${-h}" width="300" height="${h}" fill="${cols[i % 4]}" stroke="${C.ink}" stroke-width="6"/><rect x="${bx + 40}" y="${-h + 60}" width="80" height="100" fill="#5a8bb0" stroke="${C.ink}" stroke-width="5"/><rect x="${bx + 180}" y="${-h + 60}" width="80" height="100" fill="#5a8bb0" stroke="${C.ink}" stroke-width="5"/>`; } return g + '</g>'; }
const pitT = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-260,0 L260,0 L200,120 L-320,120Z" fill="#3b2617" stroke="${C.ink}" stroke-width="8"/><path d="M-260,0 L260,0 L240,40 L-280,40Z" fill="#6b4a2e"/><path d="M-330,-10 Q-200,-120 -60,-20 Z" fill="#e0b870" stroke="${C.ink}" stroke-width="6"/></g>`;
const susuT = (x, y, s) => susu({ x, y, s, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 150, armR: 150, mouth: 'grin', tilt: -3 });
const vanT = (x, y, s, rot) => `<g transform="rotate(${rot} ${x} ${y})">${schoolVan(x, y, s, .21, { mood: 'scream', noorMood: 'scream', roll: .4 })}</g>`;
const TH10 = {
  ep10_v: [1080, 1920, () => {
    let g = `<rect width="1080" height="1920" fill="#ffcf3a"/>` + rays(540, 900, 24, '#ffb02e', '#ffd75e');
    g += `<g filter="url(#dof6)" opacity=".85">${housesT(540, 1300, 1.0)}</g><rect width="1080" height="1920" fill="#fff1d6" opacity=".2"/>`;
    g += pitT(700, 1110, .95) + vanT(640, 1080, .9, 12);
    g += liftShadow(300, 1840, 220, 160, { dx: -50, skew: 35 }) + lightPool(300, 1810, 420, 100, .9) + susuT(300, 1770, 1.05);
    g += `<g transform="translate(540,300) rotate(-4)">${T(0, 0, 200, 'VAN', { shadow: '#000', sw: 16 })}${T(0, 200, 200, 'BACHAO!', { fill: C.red, stroke: '#fff', sw: 18, shadow: '#000' })}</g>`;
    g += logo(540, 1855, .9) + badge(930, 700, 'EP 10');
    return g; }],
  ep10_h: [1280, 720, () => {
    let g = `<rect width="1280" height="720" fill="#ffcf3a"/>` + rays(640, 330, 24, '#ffb02e', '#ffd75e');
    g += `<g filter="url(#dof6)" opacity=".85">${housesT(640, 640, .62)}</g><rect width="1280" height="720" fill="#fff1d6" opacity=".2"/>`;
    g += pitT(960, 640, .7) + vanT(900, 600, .7, 12);
    g += lightPool(270, 712, 280, 50, .9) + susuT(270, 840, .72);
    g += `<g transform="translate(880,120) rotate(-4)">${T(-250, 0, 130, 'VAN', { shadow: '#000', sw: 13 })}${T(110, 0, 130, 'BACHAO!', { fill: C.red, stroke: '#fff', sw: 15, shadow: '#000' })}</g>`;
    g += badge(110, 70, 'EP 10', .75);
    return g; }],
};
window.drawThumb = id => { const [w, h, f] = TH10[id]; const s = document.getElementById('s'); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.innerHTML = defs() + skyDefs + skyDefs2 + melaDefs + depthDefsW() + f(); return [w, h]; };
