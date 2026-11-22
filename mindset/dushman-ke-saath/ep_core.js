
// ===== Awazzzz Mindset — SUNDAY LONG "What Do You Do With an Enemy?" — core overlays (landscape 1920x1080 + portrait 1080x1920)
const PT = H > W;                       // portrait (Short) build?
const B = { red: '#7A1414', red2: '#C0392B', ember: '#FF6A3A', blue: '#0D2C4C', blue2: '#3FA7A8', ice: '#BFE3FF', night: '#050812' };
function S(id) { return SCENES.find(s => s.id === id); }
function wt(id, k) { const w = LINES[id].words; return w[Math.max(0, Math.min(k, w.length - 1))][0]; }
function at(id, k = 0) { return LINES[id] ? LINES[id].start + wt(id, k) : 1e9; }      // absolute time of word k
function since(id, k = 0) { return GT - at(id, k); }                                     // seconds since word k
function on(id, k = 0, d = 0.5) { return easeOut(seg(since(id, k), 0, d)); }            // 0..1 ramp from word k
function kw(id, word) { const w = LINES[id].words; const i = w.findIndex(x => x[2].toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(word)); return i < 0 ? 0 : i; }
function onW(id, word, d = 0.5) { return LINES[id] ? on(id, kw(id, word), d) : 0; }
function lineOn(id, pad = 0) { return act(id, pad); }

// ---- gold key words per line (captions)
const KEYW = { h1: ['power', 'enemy'], n1: ['centuries'], n2: ['duke', 'ruined'], n3: ['rumi', 'battle'], n4: ['enemy'],
  c1a: ['florence'], c1b: ['tortured', 'power'], c1c: ['prince', 'borgia'], c1d: ['alexander', 'state'], c1e: ['1503', 'fifteen', 'death'], c1f: ['everything', 'except'],
  c1g: ['block'], c1h: ['injured', 'fear', 'julius'], c1i: ['hoped', 'favours', 'wounds'], q1: ['ice'], q1b: ['verdict'], c1k: ['wishful', 'thinking'], q2: ['line'],
  c1m: ['resent', 'fear', 'strike'], c1n: ['credit'], c1o: ['friendly'], c1p: ['promotion', 'panel'], c1q: ['erase', 'bet'], c1r: ['sight', 'repair', 'prepare', 'hope'],
  c2a: ['hopeful'], c2b: ['great', 'enemies', 'rise'], c2c: ['doubted', 'rung'], c2d: ['cut', 'slow'], c2e: ['alarm', 'year'], c2f: ['ladder'], c2g: ['loyalty', 'distrusted'], c2h: ['prove', 'wrong'], c2i: ['loyal', 'door'],
  c3a: ['east', 'rumi'], c3b: ['masnavi'], c3c: ['ali', 'lion'], c3d: ['winning'], c3e: ['spits'], c3f: ['strike'], q4: ['whinfield'], c3g: ['spare'], c3h: ['higher', 'pride'], c3i: ['personal', 'anger'],
  c3j: ['sword', 'family', 'faith'], c3k: ['weapon'], c3l: ['temper'], c3m: ['rage', 'control'], c3n: ['moment', 'anger'],
  c4a: ['strategist', 'poet'], c4b: ['forgotten', 'sword'], c4c: ['hope', 'anger'], c4d: ['feeling', 'wheel'], c4e: ['mind', 'exactly'], c4f: ['heart', 'pride'], c4g: ['midnight', 'sting'],
  c4h: ['mind', 'heart', 'plan'], c4i: ['angry', 'move'], c5a: ['today'], c5b: ['rival'], c5c: ['really', 'honest', 'machiavelli'], c5d: ['anger', "don't"], c5e: ['stronger', 'rung'],
  c5f: ['harder', 'mind', 'heart', 'comments'], c5g: ['awazzzz', 'mindset'],
  s1: ['dropped', 'why'], sA: ['rumi', 'winning'], sE: ['spits'], sQ: ['whinfield'], sB: ['weapon', 'temper'], sC: ['rival', 'sting', 'angry'], s2: ['breath', 'move', 'theirs'], s3: ['sword'], s4: ['awazzzz', 'story'] };
// quote lines: from the first word that opens a quotation mark, the quote card carries the words (no caption)
const QFROM = {};
for (const id in LINES) if (LINES[id].kind === 'Q') { const w = LINES[id].words; let i = w.findIndex(x => /^["“…]/.test(x[2])); QFROM[id] = i < 0 ? 0 : i; }
// caption chunks (≤5 words, break on punctuation)
const CH2 = {};
for (const id in LINES) { const ws = LINES[id].words.map(w => w.slice()); ws.forEach(w => { if (/^Awaaz/i.test(w[2])) w[2] = w[2].replace(/Awaaz/i, 'Awazzzz'); w[2] = w[2].replace(/\.\.\.$/, '…').replace(/"/g, ''); });
  const ch = []; let cur = [];
  ws.forEach((w, k) => { cur.push([w, k]); const endP = /[.?!…:]$/.test(w[2]); if (cur.length >= 5 || endP || (/,$/.test(w[2]) && cur.length >= 3)) { ch.push(cur); cur = []; } }); if (cur.length) ch.push(cur);
  const out = []; ch.forEach(c => { const pv = out[out.length - 1]; if (c.length === 1 && pv && pv.length <= 3 && !/[.?!…]$/.test(pv[pv.length - 1][0][2])) pv.push(...c); else out.push(c); });
  CH2[id] = out; }
function captions() {
  const size = PT ? 72 : 56, cy = PT ? 1350 : H - 132, maxW = PT ? 900 : 1500;
  for (const id in LINES) { if (!act(id, 0.05)) continue; if (PT && id === 's1') continue; const u = lt(id); const chs = CH2[id];
    let ci = chs.findIndex((c, i) => u >= c[0][0][0] - 0.08 && (i === chs.length - 1 || u < chs[i + 1][0][0][0] - 0.08));
    if (ci < 0) continue; const c = chs[ci];
    if (id in QFROM && c[c.length - 1][1] >= QFROM[id]) continue;
    const endT = c[c.length - 1][0][0] + c[c.length - 1][0][1] + 0.5; if (u > endT && ci === chs.length - 1) continue;
    const pop = 1 + 0.06 * (1 - seg(u - c[0][0][0], -0.08, 0.1));
    const words = c.map(x => x[0][2]); ctx.font = `900 ${size}px Montserrat`;
    let rows = [words]; if (ctx.measureText(words.join(' ')).width > maxW) { const h = Math.ceil(words.length / 2); rows = [words.slice(0, h), words.slice(h)]; }
    withT(W / 2, cy, pop, 0, () => { let k = 0;
      rows.forEach((ln, li) => { const y = (li - (rows.length - 1) / 2) * (size * 1.12); ctx.font = `900 ${size}px Montserrat`; const lw = ctx.measureText(ln.join(' ')).width; let x = -lw / 2;
        ln.forEach(w => { const wi = c[k][1]; const said = u >= LINES[id].words[wi][0] - 0.04; const key = (KEYW[id] || []).some(g => w.toLowerCase().replace(/[^a-z0-9']/g, '').startsWith(g));
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
          ctx.strokeStyle = 'rgba(0,0,0,0.92)'; ctx.lineWidth = size * 0.19; ctx.strokeText(w, x, y);
          ctx.fillStyle = key ? M.gold2 : (said ? '#FFFFFF' : 'rgba(255,255,255,0.8)'); ctx.fillText(w, x, y);
          x += ctx.measureText(w + ' ').width; k++; }); }); });
  }
}
// ---- parchment quote card, word-synced; text = the quoted words exactly as printed; cite under it
function qCard(id, text, cite, gold, o = {}) {
  if (!LINES[id]) return; const from = QFROM[id]; const t0 = at(id, from) - 0.5; const k = easeOut(seg(GT, t0, t0 + 0.55)) * (1 - seg(GT, (o.out ?? 1e9), (o.out ?? 1e9) + 0.4));
  if (k <= 0) return; const u = lt(id);
  const words = text.split(' '); const size = o.size || (PT ? 64 : 58); const font = `600 ${size}px CrimsonText`; const pw = o.pw || (PT ? 940 : 1320);
  const rows = wrapWords(words, font, pw - 170); const lh = size * 1.24; const ph = rows.length * lh + 200; const cy = o.cy || (PT ? 760 : 455);
  withT(o.cx || W / 2, cy + (1 - k) * 50, 1, (1 - k) * 0.015, () => alpha(k, () => {
    glow(0, 0, pw * 0.75, '#000', 0.55);
    const g = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2); g.addColorStop(0, '#F2E4C4'); g.addColorStop(1, '#D8C090');
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
    const pp = new Path2D(); pp.moveTo(-pw / 2, -ph / 2 + 8); for (let i = 0; i <= 24; i++) pp.lineTo(-pw / 2 + pw * i / 24, -ph / 2 + Math.sin(i * 2.1) * 5); pp.lineTo(pw / 2, ph / 2); for (let i = 24; i >= 0; i--) pp.lineTo(-pw / 2 + pw * i / 24, ph / 2 + Math.sin(i * 1.7) * 5); pp.closePath();
    P(pp, g, null); ctx.restore();
    alpha(0.5, () => { const r = ctx.createRadialGradient(0, 0, 200, 0, 0, pw * 0.7); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(90,50,10,0.55)'); ctx.fillStyle = r; ctx.fill(pp); });
    txt('“', -pw / 2 + 64, -ph / 2 + 66, 140, o.mark || M.red, 'CrimsonText', 700);
    let wi = 0; const y0 = -ph / 2 + 100 + lh / 2;
    rows.forEach((ln, li) => { ctx.font = font; const lw = ctx.measureText(ln.join(' ')).width; let x = -lw / 2;
      ln.forEach(w => { const gi = Math.min(from + wi, LINES[id].words.length - 1); const said = u >= wt(id, gi) - 0.03; const isG = gold.some(gg => w.toLowerCase().replace(/[^a-z]/g, '').startsWith(gg));
        ctx.font = `${isG && said ? 700 : 600} ${size}px CrimsonText`; const ww = ctx.measureText(w + ' ').width;
        txt(w, x, y0 + li * lh, size, said ? (isG ? (o.goldCol || '#8E1B1B') : '#24170C') : 'rgba(60,40,20,0.28)', 'CrimsonText', isG && said ? 700 : 600, 'left');
        if (isG && said) { ctx.fillStyle = 'rgba(180,120,30,0.5)'; ctx.fillRect(x, y0 + li * lh + size * 0.42, ctx.measureText(w).width, 4); }
        x += ww; wi++; }); });
    txt(cite, 0, ph / 2 - 58, PT ? 38 : 36, '#5A3A1A', 'CrimsonText', 600);
  }));
}
// ---- small chips / labels
function chipAt(s, x, y, k, col = M.gold, size = 34, bg = 'rgba(8,6,10,0.72)') { if (k <= 0) return; alpha(k, () => { ctx.font = `700 ${size}px Oswald`; const w = ctx.measureText(s).width + size * 1.2; P(rr(x - w / 2, y - size * 0.85, w, size * 1.7, size * 0.85), bg, col, 2); txt(s, x, y + 1, size, col === M.gold ? M.gold2 : col, 'Oswald', 700); }); }
function serifLabel(s, x, y, size, col, k, it = false) { if (k <= 0) return; alpha(k, () => { ctx.save(); ctx.font = `${it ? 'italic ' : ''}600 ${size}px CrimsonText`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.lineWidth = size * 0.14; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); }); }
function stampWord(s, x, y, size, col, k, rot = -0.06) { if (k <= 0) return; withT(x, y, lerp(1.6, 1, easeOut(k)), rot, () => alpha(clamp(k * 1.5), () => { ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.lineWidth = size * 0.16; ctx.strokeText(s, 0, 0); ctx.fillStyle = col; ctx.fillText(s, 0, 0); })); }
// ---- chapter card overlay (long only): first ~3 s of a chapter's first scene
const NUMW = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'];
function chapterCard(sc, u) {
  if (!sc.chap) return; const [n, title] = sc.chap; const k = easeOut(seg(u, 0.05, 0.6)) * (1 - seg(u, 3.4, 4.0)); if (k <= 0) return;
  ctx.fillStyle = `rgba(3,2,6,${0.55 * k})`; ctx.fillRect(0, 0, W, H);
  alpha(k, () => { const y = H * 0.44;
    txt('CHAPTER ' + NUMW[n], W / 2, y - 92, 40, M.gold2, 'Oswald', 700);
    const lw = lerp(0, 380, easeOut(seg(u, 0.2, 1.0))); line(W / 2 - lw, y - 46, W / 2 + lw, y - 46, 'rgba(246,210,122,0.7)', 2);
    serifLabel(title, W / 2, y + 20, 104, '#FFF3DC', 1);
    line(W / 2 - lw, y + 92, W / 2 + lw, y + 92, 'rgba(246,210,122,0.7)', 2); });
}
// ---- logo watermark + series badge
function watermark(T) {
  const L = document.getElementById('logo'); const x = PT ? 74 : 70, y = PT ? 112 : 66, r = PT ? 40 : 34;
  alpha(0.92, () => { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.clip(); if (L && L.complete) ctx.drawImage(L, x - r * 1.04, y - r * 1.04, r * 2.08, r * 2.08); ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.strokeStyle = M.gold; ctx.lineWidth = 3; ctx.stroke(); });
  const bk = PT ? 1 - seg(T, 3.0, 3.5) : 0.9; if (bk <= 0) return;
  alpha(bk, () => { ctx.font = '700 26px Oswald'; const s1 = 'Awazzzz', s2 = 'MINDSET'; const w1 = ctx.measureText(s1).width, w2 = ctx.measureText(s2).width; const w = w1 + w2 + 54, bx = x + r + 14, by = y - 19;
    P(rr(bx, by, w, 38, 19), 'rgba(8,6,10,0.72)', M.gold, 2); txt(s1, bx + 18 + w1 / 2, y + 1, 26, '#FFFFFF', 'Oswald', 700); txt(s2, bx + 36 + w1 + w2 / 2, y + 1, 26, M.gold2, 'Oswald', 700); });
}
// ---- end card
function endCard(u, d, o = {}) {
  fullFill(grad(0, H, '#0A0608', '#020104'));
  // split glow: red mind left, blue heart right
  glow(W * 0.25, H * 0.45, W * 0.5, '#8E1B1B', 0.35); glow(W * 0.75, H * 0.45, W * 0.5, '#1E6F78', 0.35);
  dust(u, 50, [0, 0, W, H], '246,210,122', 9);
  const k = easeOut(seg(u, 0.1, 0.7)); const L = document.getElementById('logo'); const lr = PT ? 150 : 120, ly = PT ? 640 : 330;
  withT(W / 2, ly, lerp(0.8, 1, back(seg(u, 0.1, 0.8))), 0, () => alpha(k, () => { glow(0, 0, lr * 2.2, M.gold, 0.3); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, lr, 0, 6.283); ctx.clip(); if (L && L.complete) ctx.drawImage(L, -lr, -lr, lr * 2, lr * 2); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, lr, 0, 6.283); ctx.strokeStyle = M.gold; ctx.lineWidth = 5; ctx.stroke(); }));
  const y2 = PT ? 920 : 560;
  alpha(easeOut(seg(u, 0.4, 1.0)), () => { ctx.font = '900 96px Montserrat'; txt('Follow Awazzzz', W / 2, y2, PT ? 92 : 96, '#FFFFFF', 'Montserrat', 900); txt('MINDSET', W / 2, y2 + (PT ? 100 : 96), 60, M.gold2, 'Oswald', 700); });
  const sk = back(seg(u, 0.8, 1.3)); if (sk > 0) withT(W / 2, y2 + (PT ? 250 : 226), sk, 0, () => { P(rr(-230, -50, 460, 100, 50), '#C0392B', '#FFE2A0', 3); txt('SUBSCRIBE', 0, 2, 50, '#FFFFFF', 'Oswald', 700); });
  if (!PT) alpha(easeOut(seg(u, 1.2, 1.8)), () => serifLabel('Machiavelli · Rumi · Mind vs Heart', W / 2, y2 + 340, 40, M.parch, 1, true));
}
