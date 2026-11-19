function rays(cx, cy, n, c1, c2, R = 2600) { let g = ''; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + .5) / n * Math.PI * 2; g += `<path d="M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} L${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}Z" fill="${i % 2 ? c1 : c2}"/>`; } return g; }
function logo(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-330" y="20" width="660" height="34" rx="17" fill="${C.red}" transform="skewX(-20)"/>${T(0, 30, 120, 'SUSUMAN', { shadow: C.red, sw: 12, ls: 4 })}${crown(-250, -70, .6)}</g>`; }
function badge(x, y, txt, s = 1) { return `<g transform="translate(${x},${y}) scale(${s}) rotate(-6)"><rect x="-110" y="-46" width="220" height="92" rx="20" fill="${C.gold}" stroke="#000" stroke-width="7"/>${T(0, 22, 64, txt, { fill: '#000', sw: 0, ls: 2 })}</g>`; }


// Episode 9 thumbnails (rule 6, Nov 18 2026): Susuman big on the LEFT (same pose + crown every time), the sparrow in danger big on the RIGHT,
// 2 bold Roman words, bright yellow rays; blurred hot rooftops + black tank far, orange tin ledge mid, the sparrow sharp.
function roofsT(x, y, s) { let g = `<g transform="translate(${x},${y}) scale(${s})">`; const cols = ['#9fd8cf', '#f7c6d9', '#ffd98a', '#c9b3f0']; for (let i = 0; i < 6; i++) { const bx = -900 + i * 330, h = 300 + 80 * (i % 3); g += `<rect x="${bx}" y="${-h}" width="300" height="${h}" fill="${cols[i % 4]}" stroke="${C.ink}" stroke-width="6"/><rect x="${bx + 40}" y="${-h + 60}" width="80" height="100" fill="#5a8bb0" stroke="${C.ink}" stroke-width="5"/><rect x="${bx + 180}" y="${-h + 60}" width="80" height="100" fill="#5a8bb0" stroke="${C.ink}" stroke-width="5"/>`; if (i % 2) g += `<rect x="${bx + 170}" y="${-h - 150}" width="120" height="150" rx="16" fill="url(#tankG)" stroke="${C.ink}" stroke-width="5"/>`; } return g + '</g>'; }
function ledgeT(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-170,-16 L170,8 L166,40 L-170,14Z" fill="#d07a3a" stroke="${C.ink}" stroke-width="7"/><path d="M-170,14 L166,40" stroke="#8a4a20" stroke-width="6"/><path d="M-120,10 l40,70 M110,30 l-30,60" stroke="#555" stroke-width="9"/></g>`; }
const susuT = (x, y, s) => susu({ x, y, s, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 150, armR: 150, mouth: 'grin', tilt: -3 });
const TH9 = {
  ep9_v: [1080, 1920, () => {
    let g = `<rect width="1080" height="1920" fill="#ffcf3a"/>` + rays(540, 900, 24, '#ffb02e', '#ffd75e');
    g += `<g filter="url(#dof6)" opacity=".9">${roofsT(540, 1250, 1.0)}</g><rect width="1080" height="1920" fill="#fff1d6" opacity=".2"/>`;
    g += liftShadow(330, 1840, 220, 160, { dx: -50, skew: 35 }) + lightPool(330, 1810, 420, 100, .9) + susuT(330, 1770, 1.1);
    g += ledgeT(800, 1330, 1.15) + chidiya({ x: 790, y: 1322, s: 3.2, pose: 'stand', pant: 1, t: .05, rot: -14 }) + sweat(830, 1110, 2.6, .2) + heatWiggle(800, 1080, 2.2, .3, 1);
    g += `<circle cx="805" cy="1220" r="230" fill="none" stroke="${C.red}" stroke-width="16" opacity=".9"/>`;
    g += `<g transform="translate(540,300) rotate(-4)">${T(0, 0, 170, 'CHIDIYA', { shadow: '#000', sw: 16 })}${T(0, 190, 200, 'BACHAO!', { fill: C.red, stroke: '#fff', sw: 18, shadow: '#000' })}</g>`;
    g += logo(540, 1855, .9) + badge(930, 680, 'EP 9');
    return g; }],
  ep9_h: [1280, 720, () => {
    let g = `<rect width="1280" height="720" fill="#ffcf3a"/>` + rays(640, 330, 24, '#ffb02e', '#ffd75e');
    g += `<g filter="url(#dof6)" opacity=".9">${roofsT(640, 600, .62)}</g><rect width="1280" height="720" fill="#fff1d6" opacity=".2"/>`;
    g += lightPool(300, 712, 280, 50, .9) + susuT(300, 840, .72);
    g += ledgeT(950, 660, .95) + chidiya({ x: 945, y: 652, s: 2.6, pose: 'stand', pant: 1, t: .05, rot: -14 }) + sweat(985, 430, 2.0, .2) + heatWiggle(950, 400, 1.6, .3, 1);
    g += `<circle cx="950" cy="545" r="175" fill="none" stroke="${C.red}" stroke-width="14" opacity=".9"/>`;
    g += `<g transform="translate(870,120) rotate(-4)">${T(0, 0, 112, 'CHIDIYA', { shadow: '#000', sw: 13 })}${T(40, 132, 130, 'BACHAO!', { fill: C.red, stroke: '#fff', sw: 15, shadow: '#000' })}</g>`;
    g += badge(110, 70, 'EP 9', .75);
    return g; }],
};
window.drawThumb = id => { const [w, h, f] = TH9[id]; const s = document.getElementById('s'); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.innerHTML = defs() + skyDefs + skyDefsHot + melaDefs + gapDefs + depthDefsW() + f(); return [w, h]; };
