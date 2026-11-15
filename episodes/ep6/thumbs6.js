function rays(cx, cy, n, c1, c2, R = 2600) { let g = ''; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + .5) / n * Math.PI * 2; g += `<path d="M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} L${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}Z" fill="${i % 2 ? c1 : c2}"/>`; } return g; }
function logo(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-330" y="20" width="660" height="34" rx="17" fill="${C.red}" transform="skewX(-20)"/>${T(0, 30, 120, 'SUSUMAN', { shadow: C.red, sw: 12, ls: 4 })}${crown(-250, -70, .6)}</g>`; }
function badge(x, y, txt, s = 1) { return `<g transform="translate(${x},${y}) scale(${s}) rotate(-6)"><rect x="-110" y="-46" width="220" height="92" rx="20" fill="${C.gold}" stroke="#000" stroke-width="7"/>${T(0, 22, 64, txt, { fill: '#000', sw: 0, ls: 2 })}</g>`; }

// Episode 6 thumbnails — 2.5D: blurred dusk sky + giant wheel + bulbs (far), stall awnings (mid, soft), Susuman sharp + big carrying Pari with her red balloon (hero plane),
// blurred foreground bunting + crowd heads (near)
function wheelT(x, y, s, t) { return `<g transform="translate(${x},${y}) scale(${s}) translate(${-WHX},${-WHY})">${giantWheel(t)}</g>`; }
function awnT(w, y, s) { let g = ''; STALLS.slice(0, 5).forEach((st, i) => { const x = i * w / 4 - 80, ww = w / 4 - 20; for (let k = 0; k < 5; k++) g += `<path d="M${x + k * ww / 5},${y} h${ww / 5} v${60 * s} q${-ww / 10},${30 * s} ${-ww / 5},0z" fill="${k % 2 ? st.c2 : st.c1}" stroke="${C.ink}" stroke-width="5"/>`; g += `<rect x="${x}" y="${y + 60 * s}" width="${ww}" height="${400 * s}" fill="#3a2a40"/>` + bulb(x + ww / 2, y + 120 * s, '#fff3c0', 1, 14 * s); }); return `<g filter="url(#dof4)">${g}</g>`; }
function fgBunt(w, y, s) { return `<g filter="url(#dofNear)">${bunting(-100, w + 100, y, 60 * s, 12, .3, 2, 1.8 * s)}</g>`; }
function headsT(w, y, s) { let g = ''; for (let i = 0; i < 5; i++) g += crowdP(i * w / 4 - 40, y, s, i + 7, .3, { back: 1 }); return `<g filter="url(#dofNear)">${g}</g>`; }
const TH6 = {
  ep6_v: [1080, 1920, () => {
    let g = `<rect width="1080" height="1920" fill="#ffcf3a"/>` + rays(540, 900, 24, '#ffb02e', '#ffd75e');
    g += `<g filter="url(#dof6)" opacity=".95">${wheelT(820, 760, 1.05, .4)}</g>` + `<rect width="1080" height="1920" fill="#fff1d6" opacity=".18"/>`;
    g += awnT(1080, 1180, 1.3) + bulbString(-60, 1140, 1120, 50, 12, .2, 3);
    g += liftShadow(560, 1830, 220, 160, { dx: -50, skew: 35 }) + lightPool(560, 1800, 420, 100, .9);
    g += gubbara(860, 860, 1.6, C.red, .3, 360);
    g += susu({ x: 470, y: 1760, s: 1.2, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 110, armR: 118, mouth: 'grin', brow: .2, tilt: -3 });
    g += pari({ x: 470 + 150 * 1.2, y: 1760 - 120 * 1.2, s: 1.4, t: .4, move: 'wave', mt: .4, yaw: -.3, expr: 'happy' });
    g += headsT(1080, 2290, 1.4) + fgBunt(1080, 40, 1.2);
    g += `<g transform="translate(540,300) rotate(-4)">${T(0, 0, 170, 'BACHCHI', { shadow: '#000', sw: 16 })}${T(0, 180, 210, 'GUM!', { fill: C.red, stroke: '#fff', sw: 18, shadow: '#000' })}</g>`;
    g += logo(540, 1835, .95) + badge(900, 640, 'EP 6');
    return g; }],
  ep6_h: [1280, 720, () => {
    let g = `<rect width="1280" height="720" fill="#ffcf3a"/>` + rays(860, 330, 24, '#ffb02e', '#ffd75e');
    g += `<g filter="url(#dof6)" opacity=".95">${wheelT(1080, 230, .55, .4)}</g>` + `<rect width="1280" height="720" fill="#fff1d6" opacity=".18"/>`;
    g += awnT(1280, 470, .7) + bulbString(-60, 1340, 440, 30, 14, .2, 3);
    g += lightPool(960, 712, 260, 50, .9) + gubbara(1150, 230, .9, C.red, .3, 200);
    g += susu({ x: 920, y: 745, s: .66, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 110, armR: 118, mouth: 'grin', brow: .2, tilt: -3 });
    g += pari({ x: 920 + 150 * .66, y: 745 - 120 * .66, s: .76, t: .4, move: 'wave', mt: .4, yaw: -.3, expr: 'happy' });
    g += fgBunt(1280, -10, .7);
    g += `<g transform="translate(330,190) rotate(-4)">${T(0, 0, 130, 'BACHCHI', { shadow: '#000', sw: 13 })}${T(0, 140, 160, 'GUM!', { fill: C.red, stroke: '#fff', sw: 15, shadow: '#000' })}</g>`;
    g += logo(330, 500, .6) + badge(120, 640, 'EP 6', .8);
    return g; }],
};
window.drawThumb = id => { const [w, h, f] = TH6[id]; const s = document.getElementById('s'); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.innerHTML = defs() + skyDefs + skyDefs2 + melaDefs + depthDefs() + f(); return [w, h]; };
