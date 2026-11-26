function rays(cx, cy, n, c1, c2, R = 2600) { let g = ''; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + .5) / n * Math.PI * 2; g += `<path d="M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} L${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}Z" fill="${i % 2 ? c1 : c2}"/>`; } return g; }
function logo(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-330" y="20" width="660" height="34" rx="17" fill="${C.red}" transform="skewX(-20)"/>${T(0, 30, 120, 'SUSUMAN', { shadow: C.red, sw: 12, ls: 4 })}${crown(-250, -70, .6)}</g>`; }
function badge(x, y, txt, s = 1) { return `<g transform="translate(${x},${y}) scale(${s}) rotate(-6)"><rect x="-110" y="-46" width="220" height="92" rx="20" fill="${C.gold}" stroke="#000" stroke-width="7"/>${T(0, 22, 64, txt, { fill: '#000', sw: 0, ls: 2 })}</g>`; }

// Episode 12 thumbnails (rule 6): Susuman big on the LEFT (same pose + crown every time), BASIM hanging from Officer Gill's old pipe big on the RIGHT,
// the broken window + the red ball on the chhajja behind him; 2 bold Roman words; bright yellow rays.
const susuT = (x, y, s) => susu({ x, y, s, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 150, armR: 150, mouth: 'grin', tilt: -3 });
const houseT = (tx, ty, k) => `<g transform="translate(${tx},${ty}) scale(${k})">${gillHouse(.35, { broken: 1, ballOn: 1, clamp: 1, pipeAng: 3, id: 'th', inner: basimPipe(.35, HB_H, 3, { kick: 1, expr: 'scared' }) })}</g>`;
const TH12 = {
  ep12_v: [1080, 1920, () => {
    let g = `<rect width="1080" height="1920" fill="#ffcf3a"/>` + rays(540, 900, 24, '#ffb02e', '#ffd75e');
    g += houseT(-816, -572, 1.6);
    g += fireBall([{ x: 330, y: 760 }, { x: 290, y: 800 }, { x: 250, y: 840 }, { x: 210, y: 880 }], 40) + cball(380, 720, 46, 30);
    g += liftShadow(300, 1840, 220, 160, { dx: -50, skew: 35 }) + lightPool(300, 1810, 420, 100, .9) + susuT(300, 1770, 1.05);
    g += `<g transform="translate(540,300) rotate(-4)">${T(0, 0, 200, 'BASIM', { shadow: '#000', sw: 16 })}${T(0, 200, 200, 'BACHAO!', { fill: C.red, stroke: '#fff', sw: 18, shadow: '#000' })}</g>`;
    g += logo(540, 1855, .9) + badge(930, 1500, 'EP 12');
    return g; }],
  ep12_h: [1280, 720, () => {
    let g = `<rect width="1280" height="720" fill="#ffcf3a"/>` + rays(640, 330, 24, '#ffb02e', '#ffd75e');
    g += houseT(-40, -505, 1.0);
    g += fireBall([{ x: 540, y: 330 }, { x: 510, y: 360 }, { x: 480, y: 390 }], 26) + cball(570, 300, 30, 30);
    g += lightPool(270, 712, 280, 50, .9) + susuT(270, 840, .72);
    g += `<g transform="translate(430,110) rotate(-4)">${T(-120, 0, 120, 'BASIM', { shadow: '#000', sw: 13 })}${T(0, 120, 120, 'BACHAO!', { fill: C.red, stroke: '#fff', sw: 15, shadow: '#000' })}</g>`;
    g += badge(1180, 660, 'EP 12', .75);
    return g; }],
};
window.drawThumb = id => { const [w, h, f] = TH12[id]; const s = document.getElementById('s'); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.innerHTML = defs() + skyDefs + skyDefs2 + melaDefs + depthDefsW() + f(); return [w, h]; };
