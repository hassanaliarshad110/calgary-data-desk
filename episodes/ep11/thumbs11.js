function rays(cx, cy, n, c1, c2, R = 2600) { let g = ''; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + .5) / n * Math.PI * 2; g += `<path d="M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} L${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}Z" fill="${i % 2 ? c1 : c2}"/>`; } return g; }
function logo(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-330" y="20" width="660" height="34" rx="17" fill="${C.red}" transform="skewX(-20)"/>${T(0, 30, 120, 'SUSUMAN', { shadow: C.red, sw: 12, ls: 4 })}${crown(-250, -70, .6)}</g>`; }
function badge(x, y, txt, s = 1) { return `<g transform="translate(${x},${y}) scale(${s}) rotate(-6)"><rect x="-110" y="-46" width="220" height="92" rx="20" fill="${C.gold}" stroke="#000" stroke-width="7"/>${T(0, 22, 64, txt, { fill: '#000', sw: 0, ls: 2 })}</g>`; }

// Episode 11 thumbnails (rule 6): Susuman big on the LEFT (same pose + crown every time), GOLU the puppy on the rails big on the RIGHT with the
// goods engine's headlight coming; 2 bold Roman words; bright yellow rays; blurred station behind.
const susuT = (x, y, s) => susu({ x, y, s, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 150, armR: 150, mouth: 'grin', tilt: -3 });
const railsT = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-700,0 L700,0 L760,160 L-760,160Z" fill="#9a8f80" stroke="${C.ink}" stroke-width="6"/>${[...Array(11)].map((_, k) => `<path d="M${-640 + k * 128},30 l-24,120 h56 l20,-120z" fill="#6b5a48" stroke="${C.ink}" stroke-width="3"/>`).join('')}<rect x="-720" y="20" width="1440" height="18" fill="#c9d0d8" stroke="${C.ink}" stroke-width="4"/><rect x="-760" y="120" width="1520" height="22" fill="#c9d0d8" stroke="${C.ink}" stroke-width="4"/></g>`;
const stationT = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-900" y="-420" width="1800" height="420" fill="#f1dcb6" stroke="${C.ink}" stroke-width="6"/>${[...Array(9)].map((_, k) => `<path d="M${-860 + k * 200},0 V-220 Q${-780 + k * 200},-300 ${-700 + k * 200},-220 V0Z" fill="#c98a5a" stroke="${C.ink}" stroke-width="5"/>`).join('')}<rect x="-900" y="-460" width="1800" height="50" fill="#b5462e" stroke="${C.ink}" stroke-width="5"/></g>`;
const TH11 = {
  ep11_v: [1080, 1920, () => {
    let g = `<rect width="1080" height="1920" fill="#ffcf3a"/>` + rays(540, 900, 24, '#ffb02e', '#ffd75e');
    g += `<g filter="url(#dof6)" opacity=".85">${stationT(540, 1200, 1.0)}</g><rect width="1080" height="1920" fill="#fff1d6" opacity=".2"/>`;
    g += `<g opacity=".95">${loco(-60, 1290, .62, { beam: 1, t: .2, col: '#8a2a2a' })}</g>`;
    g += railsT(560, 1230, .9) + golu({ x: 760, y: 1300, s: 2.3, t: .2, shiver: 0, ears: 'flat', tears: 1, sit: .6, look: [-8, -4] });
    g += liftShadow(300, 1840, 220, 160, { dx: -50, skew: 35 }) + lightPool(300, 1810, 420, 100, .9) + susuT(300, 1770, 1.05);
    g += `<g transform="translate(540,300) rotate(-4)">${T(0, 0, 200, 'GOLU', { shadow: '#000', sw: 16 })}${T(0, 200, 200, 'BACHAO!', { fill: C.red, stroke: '#fff', sw: 18, shadow: '#000' })}</g>`;
    g += logo(540, 1855, .9) + badge(930, 700, 'EP 11');
    return g; }],
  ep11_h: [1280, 720, () => {
    let g = `<rect width="1280" height="720" fill="#ffcf3a"/>` + rays(640, 330, 24, '#ffb02e', '#ffd75e');
    g += `<g filter="url(#dof6)" opacity=".85">${stationT(640, 520, .62)}</g><rect width="1280" height="720" fill="#fff1d6" opacity=".2"/>`;
    g += `<g opacity=".95">${loco(380, 600, .4, { beam: 1, t: .2, col: '#8a2a2a' })}</g>`;
    g += railsT(900, 560, .62) + golu({ x: 980, y: 625, s: 1.75, t: .2, ears: 'flat', tears: 1, sit: .6, look: [-8, -4] });
    g += lightPool(270, 712, 280, 50, .9) + susuT(270, 840, .72);
    g += `<g transform="translate(880,120) rotate(-4)">${T(-230, 0, 130, 'GOLU', { shadow: '#000', sw: 13 })}${T(140, 0, 130, 'BACHAO!', { fill: C.red, stroke: '#fff', sw: 15, shadow: '#000' })}</g>`;
    g += badge(110, 70, 'EP 11', .75);
    return g; }],
};
window.drawThumb = id => { const [w, h, f] = TH11[id]; const s = document.getElementById('s'); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.innerHTML = defs() + skyDefs + skyDefs2 + melaDefs + depthDefsW() + f(); return [w, h]; };
