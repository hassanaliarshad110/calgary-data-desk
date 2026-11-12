function rays(cx, cy, n, c1, c2, R = 2600) { let g = ''; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + .5) / n * Math.PI * 2; g += `<path d="M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} L${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}Z" fill="${i % 2 ? c1 : c2}"/>`; } return g; }
function logo(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-330" y="20" width="660" height="34" rx="17" fill="${C.red}" transform="skewX(-20)"/>${T(0, 30, 120, 'SUSUMAN', { shadow: C.red, sw: 12, ls: 4 })}${crown(-250, -70, .6)}</g>`; }
function badge(x, y, txt, s = 1) { return `<g transform="translate(${x},${y}) scale(${s}) rotate(-6)"><rect x="-110" y="-46" width="220" height="92" rx="20" fill="${C.gold}" stroke="#000" stroke-width="7"/>${T(0, 22, 64, txt, { fill: '#000', sw: 0, ls: 2 })}</g>`; }
const TH = {
  ep1_v: [1080, 1920, () => {
    let g = `<rect width="1080" height="1920" fill="#ffcf3a"/>` + rays(540, 900, 24, '#ffb02e', '#ffd75e');
    g += `<circle cx="540" cy="900" r="520" fill="#fff6c8" opacity=".55"/>`;
    g += `<g transform="translate(250,560) rotate(-12)"><path d="M0,0 L560,40" stroke="${C.ink}" stroke-width="40" stroke-linecap="round"/><path d="M0,0 L560,40" stroke="#7a5233" stroke-width="26" stroke-linecap="round"/><path d="M300,14 l20,26 l-18,14 l22,22" stroke="#fff" stroke-width="9" fill="none"/></g>`;
    g += cat({ x: 700, y: 760, s: 1.6, pose: 'fall', rot: 18, t: 1, meow: 1, wide: 1.4 });
    g += susu({ x: 330, y: 1480, s: 1.15, rot: 28, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 178, armR: 165, legL: -20, legR: 12, mouth: 'shout', brow: .3 });
    g += `<g transform="translate(540,250) rotate(-4)">${T(0, 0, 150, 'BILLI', { shadow: '#000', sw: 16 })}${T(0, 150, 170, 'BACHEGI?!', { fill: C.red, stroke: '#fff', sw: 18, shadow: '#000' })}</g>`;
    g += burst(860, 1060, 150, '#fff', 'KRAKK!', 70, 12);
    g += logo(540, 1720, 1.05) + badge(910, 1560, 'EP 1');
    return g; }],
  ep1_h: [1280, 720, () => {
    let g = `<rect width="1280" height="720" fill="#ffcf3a"/>` + rays(820, 360, 24, '#ffb02e', '#ffd75e');
    g += `<g transform="translate(700,170) rotate(-6)"><path d="M0,0 L520,30" stroke="${C.ink}" stroke-width="34" stroke-linecap="round"/><path d="M0,0 L520,30" stroke="#7a5233" stroke-width="22" stroke-linecap="round"/></g>`;
    g += cat({ x: 1090, y: 330, s: 1.1, pose: 'fall', rot: 18, t: 1, meow: 1, wide: 1.4 });
    g += susu({ x: 830, y: 880, s: .74, rot: 22, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 178, armR: 165, legL: -20, legR: 12, mouth: 'shout', brow: .3 });
    g += `<g transform="translate(300,170) rotate(-4)">${T(0, 0, 120, 'BILLI', { shadow: '#000', sw: 14 })}${T(0, 125, 128, 'BACHEGI?!', { fill: C.red, stroke: '#fff', sw: 16, shadow: '#000' })}</g>`;
    g += logo(300, 560, .78) + badge(150, 660, 'EP 1', .8);
    return g; }],
  teaser_v: [1080, 1920, () => {
    let g = `<rect width="1080" height="1920" fill="#0b0b12"/>` + rays(540, 1000, 24, '#1a1a2a', '#26263a');
    g += `<rect x="540" y="0" width="540" height="1920" fill="${C.red}" opacity=".25"/><path d="M560,500 L520,1000 L580,1000 L500,1600" stroke="${C.gold}" stroke-width="22" fill="none" stroke-linejoin="round"/>`;
    g += susu({ x: 270, y: 1500, s: .95, t: 0, legL: 18, legR: -18, armL: 4, armR: 4, mouth: 'wobble', brow: 1, tilt: 6 });
    g += susu({ x: 810, y: 1500, s: .95, t: .3, power: 1, cape: 1, crown: 1, armR: 165, fistR: 1, mouth: 'smirk' });
    g += `<g transform="translate(540,250) rotate(-3)">${T(0, 0, 120, '4 SAAL KA BACHCHA', { shadow: '#000', sw: 12 })}${T(0, 150, 150, 'SECRET POWER!', { fill: C.gold, shadow: C.red, sw: 14 })}</g>`;
    g += badge(250, 620, '7 BAAR', 1.1) + T(810, 640, 70, 'FLUUSH!', { fill: '#fff', shadow: C.red });
    g += logo(540, 1720, 1.05);
    return g; }],
  wide_bg: [1920, 1080, () => {
    let g = `<rect width="1920" height="1080" fill="#ffcf3a"/>` + rays(960, 540, 32, '#ffb02e', '#ffd75e', 3000);
    g += `<rect x="640" y="0" width="640" height="1080" fill="#000"/>`;
    g += logo(330, 170, .9) + `<g transform="translate(320,330)">${T(0, 0, 58, 'EPISODE 1', { fill: '#000', sw: 0, ls: 4 })}${T(0, 80, 76, 'MANO BILLI', { fill: C.red, stroke: '#fff', sw: 10 })}${T(0, 160, 76, 'KO BACHAO!', { fill: C.red, stroke: '#fff', sw: 10 })}</g>`;
    g += cat({ x: 300, y: 900, s: 1.7, pose: 'sit', t: 0, wide: .4 });
    g += susu({ x: 1600, y: 1000, s: .95, t: .3, power: 1, cape: 1, crown: 1, shades: 1, armR: 160, fistR: 1, mouth: 'grin' });
    g += `<g transform="translate(1600,150)"><rect x="-230" y="-60" width="460" height="120" rx="60" fill="#ff0000" stroke="#fff" stroke-width="6"/>${T(0, 26, 66, 'SUBSCRIBE', { sw: 0, ls: 4 })}</g>`;
    return g; }],
};
window.drawThumb = id => { const [w, h, f] = TH[id]; const s = document.getElementById('s'); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.innerHTML = defs() + skyDefs + f(); return [w, h]; };
