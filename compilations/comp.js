// Susuman compilation graphics: title card, per-episode cards (1920x1080) and the 1280x720 thumbnail.
// Reuses the series kit (rig.js susu/crown/T, ep4.js cat/pilla/kabootar/kulfi/thela, thumbs4.js rays/logo/badge).
// Usage: drawComp('title', {n:4}) | drawComp('card', {ep:1, title:'Mano Billi Ko Bachao', animal:'cat'}) | drawComp('thumb', {n:4})
function wdefs(w, h) {
  const R = `filterUnits="userSpaceOnUse" x="-40" y="-40" width="${w + 80}" height="${h + 80}"`;
  return `<defs><filter id="blurW" ${R}><feGaussianBlur stdDeviation="3"/></filter><filter id="blurNear" ${R}><feGaussianBlur stdDeviation="7"/></filter>
  <radialGradient id="spot"><stop offset="0" stop-color="#fff8d0" stop-opacity=".95"/><stop offset=".5" stop-color="#ffe27a" stop-opacity=".45"/><stop offset="1" stop-color="#ffcf3a" stop-opacity="0"/></radialGradient></defs>`;
}
function roofsW(w, y) { let g = ''; const n = Math.ceil(w / 90) + 2; for (let i = 0; i < n; i++) { const x = i * 92 - 40, hh = 110 + hs(i + 3) * 170; g += `<rect x="${x}" y="${y - hh}" width="84" height="${hh + 600}" fill="${['#e9a76a', '#f0b878', '#e39a5e'][i % 3]}"/>${i % 3 === 0 ? `<rect x="${x + 14}" y="${y - hh - 30}" width="38" height="30" rx="6" fill="#8a5a3a"/>` : ''}`; } return `<g filter="url(#blurW)">${g}</g><rect y="0" width="${w}" height="${y + 600}" fill="#fff1d6" opacity=".22"/>`; }
function bgW(w, h, cx, cy, hz) { return `<rect width="${w}" height="${h}" fill="#ffcf3a"/>` + rays(cx, cy, 28, '#ffb02e', '#ffd75e', Math.max(w, h) * 1.6) + roofsW(w, hz) + `<rect y="${hz}" width="${w}" height="${h - hz}" fill="#dcc7a2"/><path d="M0,${hz} L${w},${hz}" stroke="#8d8d93" stroke-width="14"/>` + [...Array(16)].map((_, k) => `<path d="M${k * w / 12 - 200},${hz} l${(k - 8) * 60},${h - hz}" stroke="#c6ad84" stroke-width="5"/>`).join(''); }
// episode animals / icons, all standing on a ground point (x, y)
function animal(kind, x, y, s, o = {}) {
  if (kind === 'cat') return castShadow(x, y, 90 * s, 22 * s, .25) + cat({ x, y, s: s * 1.1, pose: 'sit', flip: o.flip || 1, t: .3, meow: o.meow || 0 });
  if (kind === 'pilla') return castShadow(x, y, 110 * s, 24 * s, .25) + pilla({ x, y, s: s * 1.0, t: .2, wag: 1, flip: o.flip || 1 });
  if (kind === 'kabootar') return castShadow(x, y, 70 * s, 18 * s, .25) + kabootar({ x, y, s: s * 1.2, pose: 'perch', flip: o.flip || 1, t: .4, coo: .3 });
  if (kind === 'kulfi') return castShadow(x, y, 90 * s, 22 * s, .25) + thela({ x, y, s: s * .55, t: 0, flip: o.flip || 1, um: 2, ring: 0 });
  return '';
}
function hero(x, y, s, o = {}) { return lightPool(x, y - 10, 300 * s, 70 * s, .9) + `<circle cx="${x}" cy="${y - 420 * s}" r="${520 * s}" fill="url(#spot)"/>` + susu(Object.assign({ x, y, s, t: .4, power: 1, cape: 1, crown: 1, shades: 1, armL: 150, armR: 40, fistL: 1, legL: -10, legR: 14, mouth: 'smile', brow: .2, tilt: -4 }, o)); }
const COMP = {
  title: (o) => { const w = 1920, h = 1080; let g = wdefs(w, h) + bgW(w, h, 960, 420, 820);
    g += animal('cat', 300, 960, 1.15) + animal('kabootar', 560, 900, 1.0) + animal('pilla', 1430, 965, 1.15, { flip: -1 }) + animal('kulfi', 1700, 975, 1.0, { flip: -1 });
    g += hero(960, 1060, .95);
    g += `<g transform="translate(960,150)">${T(0, 0, 150, 'SUSUMAN', { shadow: C.red, sw: 16, ls: 6 })}${crown(-300, -125, .6)}</g>`;
    g += `<g transform="translate(470,330) rotate(-5)">${T(0, 0, 140, 'SAARE', { shadow: '#000', sw: 15 })}${T(0, 140, 150, 'EPISODES!', { fill: C.red, stroke: '#fff', sw: 16, shadow: '#000' })}</g>`;
    g += badge(1500, 360, `${o.n} EPISODES`, 1.25).replace('width="220"', 'width="420"').replace('x="-110"', 'x="-210"');
    return [w, h, g]; },
  card: (o) => { const w = 1920, h = 1080; let g = wdefs(w, h) + bgW(w, h, 1300, 470, 830);
    const ax = 1500, as = { cat: 1.9, pilla: 1.9, kabootar: 1.45, kulfi: 1.7 }[o.animal] || 1.8; g += animal(o.animal, ax, 1000, as, { flip: -1 });
    g += hero(1020, 1045, .74, { armL: 40, armR: 150, fistR: 1, tilt: 4, mouth: 'shout' });
    g += `<g transform="translate(470,300) rotate(-4)">${badge(0, -40, `EP ${o.ep}`, 1.5)}</g>`;
    const words = o.title.toUpperCase().split(' '); const lines = []; let cur = ''; for (const wd of words) { if ((cur + ' ' + wd).trim().length > 11 && cur) { lines.push(cur); cur = wd; } else cur = (cur + ' ' + wd).trim(); } lines.push(cur);
    lines.forEach((ln, i) => { g += `<g transform="translate(470,${470 + i * 135}) rotate(-4)">${T(0, 0, 130, ln, i === lines.length - 1 ? { fill: C.red, stroke: '#fff', sw: 15, shadow: '#000' } : { shadow: '#000', sw: 14 })}</g>`; });
    g += logo(1650, 140, .55);
    return [w, h, g]; },
  thumb: (o) => { const w = 1280, h = 720; let g = wdefs(w, h) + bgW(w, h, 860, 300, 560);
    g += animal('cat', 610, 672, .95) + animal('kulfi', 1180, 690, .62, { flip: -1 }) + animal('pilla', 1110, 712, .95, { flip: -1 }) + kabootar({ x: 1172, y: 455, s: .62, pose: 'perch', flip: -1, t: .4 });
    g += hero(860, 760, .7, { armL: 150, armR: 150, fistL: 1, fistR: 1, mouth: 'shout', tilt: 0 });
    g += `<g transform="translate(270,140) rotate(-5)">${T(0, 0, 118, 'SAARE', { shadow: '#000', sw: 13 })}${T(0, 125, 124, 'EPISODES!', { fill: C.red, stroke: '#fff', sw: 15, shadow: '#000' })}</g>`;
    g += logo(255, 450, .55);
    g += `<g transform="translate(250,610) rotate(-6)"><rect x="-190" y="-58" width="380" height="116" rx="24" fill="${C.gold}" stroke="#000" stroke-width="8"/>${T(0, 26, 76, `${o.n} EPISODES`, { fill: '#000', sw: 0, ls: 2 })}</g>`;
    return [w, h, g]; },
};
window.drawComp = (id, o = {}) => { const [w, h, g] = COMP[id](o); const s = document.getElementById('s'); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.innerHTML = defs() + skyDefs + skyDefs2 + depthDefs() + g; return [w, h]; };
