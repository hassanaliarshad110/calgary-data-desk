// "Saare Episodes" compilation graphics on the Ep 9 kit (has bandar, gaay, cat, pilla, kabootar, chidiya):
// drawComp9('thumb', {n}) -> 1280x720 thumbnail (STRATEGY.md: Susuman big left, animals in danger right, 2 words, count badge)
// drawComp9('hook', {txt}) -> 1920x1080 transparent overlay with a 2-4 word Roman hook (top centre)
// drawComp9('badge') -> small corner badge "SUSUMAN - SAARE EPISODES"; drawComp9('ep', {ep}) -> small "EPISODE N" pill
function dangerRing(x, y, r) { return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".35"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.red}" stroke-width="10" opacity=".95"/>`; }
const COMP9 = {
  thumb: (o) => { const w = 1280, h = 720;
    let g = `<rect width="${w}" height="${h}" fill="#ffcf3a"/>` + rays(330, 420, 24, '#ffb02e', '#ffd75e');
    g += `<g filter="url(#dof6)" opacity=".9">${roofsT(640, 640, .62)}</g><rect width="${w}" height="${h}" fill="#fff1d6" opacity=".2"/>`;
    // four animals in danger, right half, 2x2
    const cells = [[790, 300, 128], [1100, 300, 128], [790, 590, 128], [1100, 590, 128]];
    g += dangerRing(...cells[0]) + bandar({ x: 790, y: 405, s: .95, pose: 'sit', angry: 1, flip: -1, item: 'glasses', t: .2 });
    g += dangerRing(...cells[1]) + gaay({ x: 1105, y: 380, s: .29, pose: 'sit', flip: -1, moo: 1, t: .2 });
    g += dangerRing(...cells[2]) + cat({ x: 790, y: 690, s: 1.25, pose: 'sit', flip: -1, meow: 1, wide: 1, t: .3 });
    g += dangerRing(...cells[3]) + chidiya({ x: 1100, y: 665, s: 2.0, pose: 'stand', pant: 1, t: .05, rot: -10 });
    g += lightPool(290, 712, 300, 50, .9) + susuT(290, 905, .86);
    g += `<g transform="translate(940,92) rotate(-3)">${T(0, 0, 92, 'SAARE EPISODES', { fill: C.red, stroke: '#fff', sw: 13, shadow: '#000' })}</g>`;
    g += `<g transform="translate(160,92) rotate(-6)"><rect x="-140" y="-52" width="280" height="104" rx="22" fill="${C.gold}" stroke="#000" stroke-width="8"/>${T(0, 22, 62, `${o.n} EPISODES`, { fill: '#000', sw: 0, ls: 2 })}</g>`;
    return [w, h, g]; },
  hook: (o) => { const w = 1920, h = 1080; return [w, h, `<g transform="translate(960,150) rotate(-3)">${T(0, 0, 150, o.txt, { fill: C.gold, stroke: '#000', sw: 16, shadow: C.red, ls: 3 })}</g>`]; },
  badge: () => { const w = 560, h = 120; return [w, h, `<g transform="translate(280,60)"><rect x="-268" y="-46" width="536" height="92" rx="46" fill="${C.red}" stroke="#fff" stroke-width="6" opacity=".92"/>${crown(-232, -44, .32)}${T(18, 16, 46, 'SUSUMAN • SAARE EPISODES', { fill: '#fff', stroke: '#000', sw: 6, ls: 1 })}</g>`]; },
  ep: (o) => { const w = 300, h = 100; return [w, h, `<g transform="translate(150,50) rotate(-4)"><rect x="-130" y="-38" width="260" height="76" rx="18" fill="${C.gold}" stroke="#000" stroke-width="6"/>${T(0, 16, 48, `EPISODE ${o.ep}`, { fill: '#000', sw: 0, ls: 2 })}</g>`]; },
};
window.drawComp9 = (id, o = {}) => { const [w, h, g] = COMP9[id](o); const s = document.getElementById('s'); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`);
  s.innerHTML = defs() + skyDefs + skyDefsHot + melaDefs + gapDefs + depthDefsW() + g; const bgc = id === 'thumb' ? '#000' : 'transparent'; document.body.style.background = bgc; document.documentElement.style.background = bgc; return [w, h]; };
