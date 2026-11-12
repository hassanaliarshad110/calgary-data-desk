// Episode 0 teaser timeline. Absolute starts in seconds; every scene draws from local time t.
const SCENES = [
  { id: 'hook', start: 0.0, dur: 5.3 },
  { id: 'call', start: 5.3, dur: 2.4 },
  { id: 'ammi', start: 7.7, dur: 3.3 },
  { id: 'door', start: 11.0, dur: 4.8 },
  { id: 'reveal', start: 15.8, dur: 3.1 },
  { id: 'lift', start: 18.9, dur: 5.3 },
  { id: 'end', start: 24.2, dur: 7.2 },
];
const up120 = s => `<g transform="translate(0,-120)">${s}</g>`;
const up220 = s => `<g transform="translate(0,-220)">${s}</g>`;
const blinkAt = (t, every = 2.7, off = 0) => { const p = (t + off) % every; return p < .12 ? Math.sin(p / .12 * Math.PI) : 0; };

function S_hook(t) {
  let g = brushBg(t);
  const z = lerp(1.25, 1, eout(seg(t, 0, .6)));
  const fist = ease(seg(t, 1.4, 1.8));
  const glowP = seg(t, 3.4, 3.8) * (.6 + .4 * Math.sin(t * 12));
  let ch = susu({ x: 540, y: 1720, s: 1.5, t, armR: lerp(12, 150, fist), fistR: fist > .5, armL: 12, power: glowP * .9, crown: seg(t, 3.6, 4.0) * .9,
    blink: blinkAt(t, 2.2, .5), look: [lerp(0, 3, fist), 0], mouth: t > 4.0 ? 'smirk' : 'frown', tilt: -3 * fist });
  g += cam(ch, 540, 1000, z);
  // secret shhh: question marks
  if (t > 3.5) { const k = back(seg(t, 3.5, 3.9)); g += `<g transform="translate(870,780) scale(${k}) rotate(12)">${T(0, 0, 170, '?', { fill: C.gold, shadow: C.red })}</g><g transform="translate(200,840) scale(${k * .7}) rotate(-14)">${T(0, 0, 170, '?', { fill: '#fff', shadow: C.red })}</g>`; }
  g += hookText2('4 SAAL KA BACHCHA...', 'EK SECRET POWER!', t, .25, 3.4);
  g += caption(t < 3.4 ? 'Ye hai Qasim. Umar sirf chaar saal...' : 'Lekin iske paas ek RAAZ hai!', '', seg(t, .4, .6));
  return g;
}
function hookText2(l1, l2, t, a, b) {
  const k1 = back(seg(t, a, a + .35)), k2 = back(seg(t, b, b + .35));
  let g = '';
  if (k1 > 0) g += `<g transform="translate(540,300) scale(${k1})">${T(0, 0, 96, l1, { shadow: '#000' })}</g>`;
  if (k2 > 0) g += `<g transform="translate(540,430) scale(${k2}) rotate(-3)">${T(0, 0, 124, l2, { fill: C.gold, shadow: C.red })}</g>`;
  return g;
}
function S_call(t) {
  let g = room(t + 5.3);
  g += ammi({ x: 860, y: 1060, s: .8, t, look: [lerp(0, -10, seg(t, .8, 1)), lerp(10, 0, seg(t, .8, 1))], blink: blinkAt(t, 3) });
  g += table(120, 1210) + ball(330, 1345, 30);
  const run = eout(seg(t, 0, .6)), running = t < .6;
  const sw = running ? 28 * Math.sin(t * 30) : 0;
  const land = seg(t, .6, .8), sq = 1 - .08 * Math.sin(land * Math.PI);
  const shout = t > .7 && t < 2.1;
  const flail = shout ? 25 * Math.sin(t * 16) : 0;
  g += susu({ x: lerp(-180, 420, run), y: 1390, s: .74, t, legL: sw, legR: -sw, armL: shout ? 140 + flail : 30 - sw, armR: shout ? 140 - flail : 30 + sw, squash: sq,
    mouth: shout ? 'shout' : 'frown', brow: shout ? .8 : 0, blink: blinkAt(t, 2.5) });
  if (running) g += `<path d="M${lerp(-180, 420, run) - 170},1180 h-120 M${lerp(-180, 420, run) - 150},1240 h-160" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".7"/>`;
  g = up220(g);
  g += bubble(300, 400, 420, 150, 'AMMI!!', 92, back(seg(t, .7, 1.0)) * (t < 2.3 ? 1 : 0), 'down');
  g += caption('Ammi! Susu aayi hai!', 'QASIM', seg(t, .65, .8));
  return g;
}
function S_ammi(t) {
  const z = lerp(1, 1.12, ease(seg(t, 0, .5)));
  let sc = room(t + 7.7);
  sc += ammi({ x: 860, y: 1060, s: .8, t, look: [-10, 0], brow: 1, mouth: t > .1 && t < 3.2 ? 'talk' : 'flat', blink: blinkAt(t, 2.4) });
  sc += table(120, 1210) + ball(330, 1345, 30);
  const d = Math.sin(t * 15);
  sc += susu({ x: 420, y: 1390 + 6 * Math.abs(d), s: .74, t, legL: 12 + 10 * d, legR: -12 + 10 * d, armL: 6, armR: 6, mouth: 'wobble', brow: 1, look: [6, 0], squash: 1 - .03 * Math.abs(d), tilt: 5 * d });
  let g = cam(up220(sc), 760, 680, z);
  // tally hook
  const n = Math.min(5, Math.floor(seg(t, 1.2, 2.4) * 5) + (t > 1.2 ? 1 : 0));
  if (t > 1.1) {
    const k = back(seg(t, 1.1, 1.4));
    g += `<g transform="translate(540,360) scale(${k})"><rect x="-330" y="-120" width="660" height="210" rx="34" fill="#fff" stroke="${C.ink}" stroke-width="8"/>
      ${T(0, -40, 58, 'AAJ WASHROOM:', { fill: C.ink, sw: 0 })}`;
    for (let i = 0; i < n; i++) g += i < 4 ? `<path d="M${-150 + i * 40},-5 v70" stroke="${C.red}" stroke-width="16" stroke-linecap="round"/>` : `<path d="M-180,55 L20,-5" stroke="${C.red}" stroke-width="14" stroke-linecap="round"/>`;
    g += `${T(170, 60, 96, n + ' BAAR!', { fill: C.red, sw: 0 })}</g>`;
  }
  g += caption('Phir se?! Abhi to gaye the!|Aaj paanchvi baar!', 'AMMI', 1);
  return g;
}
function S_door(t) {
  const open = t < .3 ? ease(seg(t, .15, .3)) : 1 - ease(seg(t, .55, .7));
  const glow = seg(t, 1.0, 4.4);
  const slam = seg(t, .7, 1.0), sh = slam > 0 && slam < 1 ? 1 - slam : 0;
  const rattle = t > 3.6 ? .35 * seg(t, 3.6, 4.8) : 0;
  let sc = hallway(t, { open, glow });
  const run = eout(seg(t, 0, .4));
  if (t < .7) { const sw = 28 * Math.sin(t * 30); sc += `<g opacity="${1 - seg(t, .45, .62)}">` + susu({ x: lerp(-150, 540, run), y: lerp(1500, 1270, seg(t, .3, .6)), s: lerp(.8, .6, seg(t, .3, .6)), t, legL: sw, legR: -sw, armL: 30, armR: 30, mouth: 'wobble', brow: 1 }) + '</g>'; }
  let g = cam(up120(sc), 540, 780, 1 + .06 * glow, sh + rattle, t);
  if (t > .7 && t < 1.2) g += burst(800, 460, 150, '#fff', 'DHADAAM!', 64, 10, 1 - seg(t, 1.0, 1.2));
  if (t > 2.0) { const k = back(seg(t, 2.0, 2.3)); g += `<g transform="translate(540,660) scale(${k})">${burst(0, 0, 230, C.gold, 'FLUUSH!', 104, -8, 1 - seg(t, 3.2, 3.5))}</g>`; }
  // SUSU POWER meter
  const p = ease(seg(t, 2.2, 4.5));
  if (t > 2.0) {
    const o = seg(t, 2.0, 2.2);
    g += `<g opacity="${o}"><rect x="140" y="150" width="800" height="150" rx="30" fill="#000" opacity=".75"/>${T(540, 212, 62, 'SUSU POWER', { fill: C.gold, sw: 0, ls: 6 })}
      <rect x="190" y="235" width="700" height="44" rx="22" fill="#333" stroke="#fff" stroke-width="5"/>
      <rect x="194" y="239" width="${692 * p}" height="36" rx="18" fill="${p > .99 ? '#ff3b30' : C.gold}"/>
      ${T(540, 272, 40, Math.round(p * 100) + '%', { sw: 6 })}${emblem(180, 257, .7)}</g>`;
  }
  g += caption('Ammi ko nahi pata...|har flush ke saath Qasim ban jata hai...', '', seg(t, .6, .8));
  return g;
}
function S_reveal(t) {
  const open = ease(seg(t, .15, .3));
  const sh = t > .15 && t < .6 ? 1 - seg(t, .15, .6) : 0;
  let sc = hallway(t, { open, glow: 1 });
  // rays
  let rays = '';
  for (let i = 0; i < 16; i++) { const a = i * 22.5 + t * 30; rays += `<path d="M540,880 L${540 + 1600 * Math.cos(a * Math.PI / 180 - .06)},${880 + 1600 * Math.sin(a * Math.PI / 180 - .06)} L${540 + 1600 * Math.cos(a * Math.PI / 180 + .06)},${880 + 1600 * Math.sin(a * Math.PI / 180 + .06)}Z" fill="#fff6c8" opacity="${.35 * open}"/>`; }
  sc += rays;
  const step = eout(seg(t, .25, .9));
  const hero = ease(seg(t, .6, .85));
  sc += susu({ x: 540, y: lerp(1260, 1500, step), s: lerp(.55, .92, step), t, power: open, cape: open, crown: seg(t, .55, .8),
    armR: lerp(20, 165, hero), fistR: hero > .4, armL: lerp(20, 40, hero), mouth: t > .7 && t < 1.8 ? 'shout' : 'smirk', look: [0, 0], blink: blinkAt(t, 3, 1) });
  let g = cam(up120(sc), 540, 880, lerp(1, 1.06, seg(t, .3, 3)), sh, t);
  const k = back(seg(t, .75, 1.05));
  if (k > 0) g += `<g transform="translate(540,330) scale(${lerp(2.2, 1, clamp(k))}) rotate(-4)" opacity="${clamp(k * 2)}">
     <rect x="-430" y="40" width="860" height="40" rx="20" fill="${C.red}" transform="skewX(-20)"/>${T(0, 40, 230, 'SUSUMAN', { shadow: C.red, sw: 16, ls: 6 })}</g>`;
  return g;
}
function S_lift(t) {
  const up = ease(seg(t, .1, .6)), down = ease(seg(t, 1.45, 1.7));
  const lift = up * (1 - down);
  const thud = t > 1.7 && t < 2.1 ? 1 - seg(t, 1.7, 2.1) : 0;
  const fade = seg(t, 2.9, 3.3); // power off
  let sc = room(t + 18.9);
  const ammiUp = seg(t, 1.85, 2.05);
  sc += ammi({ x: 860, y: 1060, s: .8, t, look: [lerp(0, -10, ammiUp), lerp(10, 0, ammiUp)], brow: ammiUp, mouth: t > 2.1 && t < 3.1 ? 'talk' : 'flat', blink: blinkAt(t, 2.9) });
  const sx = 610, sy = 1400, ss = .7;
  const aL = lerp(10, 135, lift);
  const a = aL * Math.PI / 180;
  const hx = sx + (-98 - 158 * Math.sin(a)) * ss, hy = sy + (-312 + 158 * Math.cos(a)) * ss;
  const tx = lerp(120, hx - 350, lift), ty = lerp(1210, hy - 10, lift);
  // ball rolls out to Susu's feet while table is up
  const roll = ease(seg(t, .55, 1.35));
  sc += ball(lerp(330, 470, roll), 1345 + 30 * roll, 30, roll * 400);
  sc += table(tx, ty, -8 * lift);
  if (thud > 0) for (let i = 0; i < 5; i++) sc += `<circle cx="${120 + i * 90}" cy="${1365 - 30 * (1 - thud)}" r="${30 + 50 * (1 - thud)}" fill="#e8dccb" opacity="${thud * .8}"/>`;
  const end = t > 3.95;
  sc += susu({ x: sx, y: sy, s: ss, t, armL: aL, armR: lerp(10, 25, lift), power: (1 - fade) * .7, cape: 1 - fade, crown: 0,
    mouth: end ? 'grin' : (t < 1.8 ? 'smirk' : 'o'), brow: t > 1.8 && t < 3.9 ? .7 : 0, look: end ? [0, 0] : (t > 1.9 ? [12, 0] : [-12, -6]), wink: t > 4.6 ? 1 : 0, tilt: end ? 6 : 0, blink: blinkAt(t, 3.1) });
  if (fade > 0 && fade < 1) sc += `<circle cx="${sx}" cy="${sy - 220}" r="${200 * fade}" fill="#fff" opacity="${(1 - fade) * .8}"/>`;
  let g = cam(up220(sc), 540, 880, 1, thud, t);
  if (t > 1.7 && t < 2.6) g += burst(300, 600, 190, '#fff', 'DHAMM!', 84, -10, 1 - seg(t, 2.3, 2.6));
  if (t > 4.6) { const k = back(seg(t, 4.6, 4.9)); g += `<g transform="translate(860,380) scale(${k}) rotate(10)">${T(0, 0, 130, '*wink*', { fill: C.gold, shadow: C.red })}</g>`; }
  if (t > 2.1 && t < 3.9) g += caption('Ye awaaz kaisi thi?', 'AMMI', seg(t, 2.1, 2.2));
  else if (t >= 3.9) g += caption('Kuch nahi Ammi!', 'QASIM', 1);
  return g;
}
function S_end(t) {
  let g = brushBg(t + 24.2);
  const wave = t > .6 ? 25 * Math.sin(t * 9) : 0;
  g += susu({ x: 540, y: 1250, s: .9, t, power: .8, cape: 1, crown: seg(t, .2, .5), armR: 150 + wave, armL: 20, mouth: t < 1 ? 'smirk' : 'grin', blink: blinkAt(t, 2.6), look: [0, 0] });
  const k1 = back(seg(t, .1, .45)), k2 = back(seg(t, .5, .85));
  g += `<g transform="translate(540,300) scale(${k1})">${T(0, 0, 104, 'KYA AMMI KO', { shadow: '#000' })}</g>`;
  g += `<g transform="translate(540,430) scale(${k2}) rotate(-3)">${T(0, 0, 128, 'PATA CHALEGA?', { fill: C.gold, shadow: C.red })}</g>`;
  // subscribe button with click
  const kb = back(seg(t, 3.6, 3.9)), clicked = t > 4.9;
  if (kb > 0) {
    const press = t > 4.75 && t < 4.95 ? .92 : 1;
    g += `<g transform="translate(540,1560) scale(${kb * press})"><rect x="-300" y="-70" width="600" height="140" rx="70" fill="${clicked ? '#555' : '#ff0000'}" stroke="#fff" stroke-width="6"/>
      ${T(clicked ? 0 : -30, 28, 76, clicked ? 'SUBSCRIBED' : 'SUBSCRIBE', { sw: 0, ls: 4 })}
      ${clicked ? '' : `<g transform="translate(230,0) rotate(${t > 5.1 ? 0 : 0})"><path d="M-26,18 h52 q-10,-8 -10,-26 q0,-24 -16,-30 q0,-10 -10,-10 q-10,0 -10,10 q-16,6 -16,30 q0,18 -10,26z" fill="#fff"/><circle cx="0" cy="26" r="7" fill="#fff"/></g>`}</g>`;
    const cx = lerp(900, 640, ease(seg(t, 4.0, 4.7))), cy = lerp(1800, 1590, ease(seg(t, 4.0, 4.7)));
    if (t > 4.0 && t < 6.0) g += `<path d="M${cx},${cy} l0,80 l20,-18 l14,32 l14,-6 l-14,-30 l28,-2z" fill="#fff" stroke="#000" stroke-width="5"/>`;
    if (clicked) { const kb2 = back(seg(t, 5.0, 5.3)); g += `<g transform="translate(540,1700) scale(${kb2})"><rect x="-300" y="-38" width="600" height="76" rx="38" fill="${C.gold}" stroke="#000" stroke-width="5"/>${T(0, 18, 46, 'EPISODE 1 JALD AA RAHA HAI!', { fill: '#000', sw: 0, ls: 1 })}</g>`; }
  }
  const lines = [[0, 'Kya Ammi ko kabhi pata chalega?'], [1.85, 'Video LIKE karo!'], [3.2, 'Susuman ko SUBSCRIBE|karna mat bhoolna!']];
  let cur = lines[0][1]; for (const [s, l] of lines) if (t >= s + .2) cur = l;
  if (t < 5.9) g += caption(cur, '', seg(t, .2, .35));
  return g;
}
const DRAW = { hook: S_hook, call: S_call, ammi: S_ammi, door: S_door, reveal: S_reveal, lift: S_lift, end: S_end };
window.drawFrame = (id, t) => {
  document.getElementById('s').innerHTML = defs() + DRAW[id](t);
};
// Character model sheet (reference for every episode)
DRAW.sheet = (t) => {
  let g = `<rect width="1080" height="1920" fill="#f3ead9"/>` + T(540, 110, 90, 'SUSUMAN — MODEL SHEET', { fill: C.ink, sw: 0 });
  g += T(270, 200, 52, 'QASIM (normal)', { fill: C.red, sw: 0 }) + T(810, 200, 52, 'SUSUMAN (power)', { fill: C.red, sw: 0 });
  g += susu({ x: 270, y: 900, s: .78, t: 0 }) + susu({ x: 810, y: 900, s: .78, t: .3, power: .8, cape: 1, crown: 1, armR: 160, fistR: 1, mouth: 'smirk' });
  g += T(270, 1050, 52, 'AMMI', { fill: '#1f7a78', sw: 0 }) + ammi({ x: 270, y: 1640, s: .95, t: 0, look: [0, 0] });
  const faces = ['frown', 'shout', 'grin', 'wobble'];
  faces.forEach((m, i) => { g += `<g transform="translate(${700 + (i % 2) * 230},${1330 + Math.floor(i / 2) * 330}) scale(.55)">` + susu({ x: 0, y: 470, s: 1, mouth: m, brow: m === 'wobble' || m === 'shout' ? .8 : 0 }) + `</g>`; });
  g += T(810, 1090, 40, 'EXPRESSIONS', { fill: C.ink, sw: 0 });
  return g;
};
