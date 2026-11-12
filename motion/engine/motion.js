/* Calgary Insight motion engine (calgary-motion-director)
 * Canvas 2D, deterministic: every frame is a pure function of time, so any frame can be rendered alone.
 * World units are metres: x east, y north, z up (the same frame as geo/calgary_base.json, origin Calgary Tower).
 * Load order in a scene page: fonts.css, motion.js, then the scene script that sets window.FILM = M.film({...}).
 */
(function (root) {
  'use strict';
  const M = {};
  root.M = M;

  // ---------- maths ----------
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (a, b, t) => Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], t)) : lerp(a, b, t);
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  Object.assign(M, { clamp, lerp, mix, smooth });

  M.ease = {
    linear: t => t,
    inQuad: t => t * t, outQuad: t => 1 - (1 - t) * (1 - t),
    inOutQuad: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    inCubic: t => t * t * t, outCubic: t => 1 - Math.pow(1 - t, 3),
    inOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    outQuart: t => 1 - Math.pow(1 - t, 4),
    inOutQuart: t => t < .5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2,
    outExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    inExpo: t => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
    inOutExpo: t => t === 0 ? 0 : t === 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
    inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
    outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 3)) + 1,
  };
  const E = n => typeof n === 'function' ? n : (M.ease[n] || M.ease.inOutCubic);

  /** progress of t through [t0,t1], eased */
  M.seg = (t, t0, t1, ease = 'inOutCubic') => E(ease)(clamp((t - t0) / Math.max(1e-6, t1 - t0)));

  /** keyframe track: [[t, value, easeIntoThisKey], ...] -> f(t). values: numbers or arrays */
  M.track = keys => t => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i], [t0, v0] = keys[i - 1];
      if (t <= t1) return mix(v0, v1, E(e || 'inOutCubic')((t - t0) / (t1 - t0)));
    }
    return keys[keys.length - 1][1];
  };

  /** Catmull-Rom spline through points (arrays), u in 0..1 */
  M.spline = pts => u => {
    const n = pts.length - 1, f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)), t = f - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
    return p1.map((_, k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t));
  };

  /** deterministic random */
  M.rng = seed => { let s = (seed >>> 0) || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
  const hash = n => { n = Math.sin(n * 127.1) * 43758.5453; return n - Math.floor(n); };
  M.noise = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };
  /** handheld / drone drift: small smooth offsets, amplitude in metres */
  M.drift = (t, amp = 1, speed = .35, seed = 0) => [M.noise(t * speed + seed) * amp, M.noise(t * speed + seed + 31.7) * amp, M.noise(t * speed + seed + 77.3) * amp * .5];

  // ---------- colour ----------
  const rgb = c => {
    if (Array.isArray(c)) return c;
    c = c.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join('');
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
  };
  const css = (c, a = 1) => { c = rgb(c); return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`; };
  M.rgb = rgb; M.css = css;
  M.shade = (c, k) => rgb(c).map(v => clamp(v * k, 0, 255));
  M.blend = (a, b, t) => mix(rgb(a), rgb(b), clamp(t));

  // ---------- house palettes and the three identities ----------
  M.house = { navy: '#0b1f3a', navy2: '#12305a', ink: '#081428', gold: '#f2b632', white: '#ffffff', grey: '#9fb0c8',
    red: '#e2483d', teal: '#2bb3a3', water: '#2f6fa6', park: '#2f5d3a', road: '#c9d2df' };
  M.identities = {
    storyteller: { name: 'Calgary Storyteller: cinematic documentary', bg: '#070d18', accent: '#f2b632', accent2: '#e2483d', text: '#f4efe6',
      sky: 'dusk', grain: .055, vignette: .55, letterbox: 2.2, cutMin: 2.5, cutMax: 6, camera: 'slow drone, dolly and crane; long eased moves',
      transitions: ['match', 'dissolve', 'whip', 'flash'], type: { hook: 800, body: 500, tracking: .02 } },
    explainer: { name: 'Calgary Data Explainer: fast motion graphics', bg: '#0b1f3a', accent: '#f2b632', accent2: '#2bb3a3', text: '#ffffff',
      sky: 'day', grain: .025, vignette: .3, letterbox: 0, cutMin: 1.2, cutMax: 2.5, camera: 'snap zooms, punch-ins, fast map dives',
      transitions: ['push', 'zoom', 'whip', 'wipe'], type: { hook: 800, body: 600, tracking: 0 } },
    civic: { name: 'Calgary Civic Analyst: evidence-led investigative', bg: '#0e1726', accent: '#7cc4ff', accent2: '#f2b632', text: '#eef3f9',
      sky: 'overcast', grain: .03, vignette: .4, letterbox: 0, cutMin: 2, cutMax: 4.5, camera: 'steady locked-off and slow pushes; top-down plans; blueprint cutaways',
      transitions: ['wipe', 'dissolve', 'push'], type: { hook: 700, body: 500, tracking: .01 } },
  };
  M.skies = {
    day: { top: '#5d9ad6', mid: '#a9cdee', horizon: '#e7eef3', ground: '#cfd6cf', fog: '#dfe8ef', sun: [-.4, -.6, .55], ambient: .62 },
    dusk: { top: '#141d3b', mid: '#5b4a6e', horizon: '#f0a35e', ground: '#2a2a30', fog: '#7a5c63', sun: [-.85, .1, .18], ambient: .45 },
    night: { top: '#03060f', mid: '#0b1730', horizon: '#1f3355', ground: '#0a0f18', fog: '#16233a', sun: [.2, .5, .7], ambient: .3 },
    overcast: { top: '#6f7d8c', mid: '#9aa6b2', horizon: '#c6ced6', ground: '#a3aaa6', fog: '#b9c1c8', sun: [-.3, -.4, .8], ambient: .7 },
    winter: { top: '#7fa6cf', mid: '#c5d8ea', horizon: '#eef3f7', ground: '#eef1f4', fog: '#e8eef4', sun: [-.5, -.7, .35], ambient: .7 },
    blueprint: { top: '#0b2342', mid: '#0e2b52', horizon: '#123566', ground: '#0d2a4f', fog: '#0f2d55', sun: [-.4, -.6, .7], ambient: .7 },
  };

  // ---------- text ----------
  M.font = (size, weight = 600, fam = 'Fira Sans') => `${weight} ${size}px "${fam}", "DejaVu Sans", sans-serif`;
  /** wrapped text; returns {w,h,lines}. opts: size, weight, color, align, base, maxW, lh, alpha, shadow, upper, tracking */
  M.text = (ctx, s, x, y, o = {}) => {
    const size = o.size || 48; ctx.save();
    ctx.font = M.font(size, o.weight || 600, o.family); ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'top';
    if ('letterSpacing' in ctx && o.tracking) ctx.letterSpacing = (o.tracking * size) + 'px';
    ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    if (o.upper) s = String(s).toUpperCase();
    const words = String(s).split(/\s+/), lines = []; let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (o.maxW && ctx.measureText(t).width > o.maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur);
    const lh = (o.lh || 1.12) * size; let mw = 0;
    if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = o.shadow || size * .18; ctx.shadowOffsetY = size * .04; }
    lines.forEach((l, i) => {
      if (o.stroke) { ctx.lineWidth = o.stroke; ctx.strokeStyle = css(o.strokeColor || '#000', .9); ctx.strokeText(l, x, y + i * lh); }
      ctx.fillStyle = css(o.color || '#fff'); ctx.fillText(l, x, y + i * lh); mw = Math.max(mw, ctx.measureText(l).width);
    });
    ctx.restore(); return { w: mw, h: lines.length * lh, lines };
  };
  /** kinetic hook: words punch in one after another from t0, `every` s apart, with overshoot */
  M.kinetic = (ctx, s, t, x, y, o = {}) => {
    const words = String(o.upper === false ? s : String(s).toUpperCase()).split(/\s+/), size = o.size || 120, every = o.every || .12, t0 = o.t0 || 0;
    ctx.save(); ctx.font = M.font(size, o.weight || 800); const sp = ctx.measureText(' ').width;
    const lines = []; let cur = [], cw = 0;
    for (const w of words) { const ww = ctx.measureText(w).width; if (o.maxW && cw + ww > o.maxW && cur.length) { lines.push([cur, cw - sp]); cur = []; cw = 0; } cur.push([w, ww]); cw += ww + sp; }
    if (cur.length) lines.push([cur, cw - sp]);
    let k = 0; const lh = size * (o.lh || 1.02);
    lines.forEach(([ws, lw], li) => {
      let cx = o.align === 'left' ? x : x - lw / 2;
      ws.forEach(([w, ww]) => {
        const p = M.seg(t, t0 + k * every, t0 + k * every + .28, 'outBack'), a = M.seg(t, t0 + k * every, t0 + k * every + .12, 'linear');
        if (a > 0) {
          ctx.save(); ctx.translate(cx + ww / 2, y + li * lh + size / 2); const sc = lerp(1.6, 1, p); ctx.scale(sc, sc);
          ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = M.font(size, o.weight || 800);
          ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = size * .2;
          const hl = o.highlight && o.highlight.includes(w.replace(/[^\w$%.]/g, '').toLowerCase());
          ctx.fillStyle = css(hl ? (o.accent || M.house.gold) : (o.color || '#fff')); ctx.fillText(w, 0, 0); ctx.restore();
        }
        cx += ww + sp; k++;
      });
    });
    ctx.restore(); return lines.length * lh;
  };
  /** rounded rectangle path */
  M.rr = (ctx, x, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  /** label chip, e.g. FACT / ESTIMATE / PROJECTION or a year */
  M.chip = (ctx, s, x, y, o = {}) => {
    const size = o.size || 30; ctx.save(); ctx.font = M.font(size, o.weight || 700); const w = ctx.measureText(s).width + size * 1.1, h = size * 1.6;
    const X = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha; M.rr(ctx, X, y, w, h, h / 2); ctx.fillStyle = css(o.bg || M.house.gold, o.bgAlpha || 1); ctx.fill();
    if (o.outline) { ctx.lineWidth = 2; ctx.strokeStyle = css(o.outline); ctx.stroke(); }
    ctx.fillStyle = css(o.color || M.house.navy); ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText(s, X + w / 2, y + h / 2 + 1); ctx.restore();
    return { w, h };
  };
  const STATUS = { fact: ['VERIFIED', '#2bb3a3'], historical: ['HISTORICAL RECORD', '#2bb3a3'], estimate: ['ESTIMATE', '#f2b632'], projection: ['PROJECTION', '#b58cff'], interpretation: ['ANALYSIS', '#9fb0c8'], announced: ['ANNOUNCED', '#9fb0c8'], funded: ['FUNDING APPROVED', '#f2b632'], building: ['UNDER CONSTRUCTION', '#ff9f43'], delivered: ['COMPLETED', '#2bb3a3'] };
  /** evidence label for a figure: kind = fact | historical | estimate | projection | interpretation | announced | funded | building | delivered */
  M.evidence = (ctx, kind, x, y, o = {}) => { const [s, c] = STATUS[kind] || [String(kind).toUpperCase(), '#9fb0c8']; return M.chip(ctx, s, x, y, Object.assign({ bg: c, color: '#06101f', size: 24 }, o)); };
  /** small source line, always on data scenes */
  M.source = (ctx, s, x, y, o = {}) => {
    const size = o.size || 24; ctx.save(); ctx.font = M.font(size, 500); const w = Math.min(ctx.measureText(s).width, o.maxW || 900);
    if (o.backdrop !== false) { M.rr(ctx, x - 10, y - 6, w + 20, size * 1.5 + (ctx.measureText(s).width > (o.maxW || 900) ? size * 1.2 : 0), 8); ctx.fillStyle = 'rgba(6,14,28,.55)'; ctx.fill(); }
    ctx.restore(); return M.text(ctx, s, x, y, Object.assign({ size, weight: 500, color: '#dfe7f2', alpha: .92, shadow: false, maxW: o.maxW || 900 }, o));
  };

  M.fmt = (v, o = {}) => {
    const d = o.decimals == null ? (Math.abs(v) < 10 && v % 1 ? 1 : 0) : o.decimals;
    let s = Number(v).toLocaleString('en-CA', { minimumFractionDigits: d, maximumFractionDigits: d });
    return (o.prefix || '') + s + (o.suffix || '');
  };
  /** counter that rolls to an exact audited value (never shows a value past the target) */
  M.counter = (ctx, value, p, x, y, o = {}) => {
    const v = (o.from || 0) + (value - (o.from || 0)) * E(o.ease || 'outExpo')(clamp(p));
    const final = p >= 1 ? value : v;
    const s = M.fmt(final, o); const r = M.text(ctx, s, x, y, Object.assign({ size: 160, weight: 800, align: 'center', color: o.color || '#fff' }, o, { prefix: undefined }));
    if (o.slam && p > 0) { const k = M.seg(p, .85, 1, 'outBack'); if (k > 0 && k < 1) { ctx.save(); ctx.globalAlpha = (1 - k) * .5; M.text(ctx, s, x, y, Object.assign({}, o, { size: (o.size || 160) * (1 + .25 * (1 - k)), align: 'center', color: o.accent || M.house.gold, prefix: undefined })); ctx.restore(); } }
    return r;
  };

  // ---------- charts (screen space, exact values only) ----------
  /** bars: {x,y,w,h, labels, values, unit, p, max, colors, highlight, fmt, horizontal} */
  M.bars = (ctx, o) => {
    const n = o.values.length, max = o.max || Math.max(...o.values) * 1.08, gap = o.gap == null ? .28 : o.gap;
    ctx.save();
    if (o.horizontal) {
      const bh = o.h / n * (1 - gap);
      o.values.forEach((v, i) => {
        const p = M.seg(o.p, i * .12, i * .12 + .6, 'outCubic'), y = o.y + i * o.h / n, w = o.w * (v / max) * p;
        ctx.fillStyle = css(o.highlight === i ? (o.accent || M.house.gold) : (o.colors?.[i] || '#5f7fa8')); M.rr(ctx, o.x, y, Math.max(2, w), bh, 8); ctx.fill();
        M.text(ctx, o.labels[i], o.x, y - (o.labelSize || 30) * 1.25, { size: o.labelSize || 30, weight: 600, color: '#dfe7f2' });
        if (p > .05) M.text(ctx, M.fmt(p >= 1 ? v : v * p, o.fmt || {}), o.x + w + 16, y + bh / 2, { size: o.valueSize || 40, weight: 800, base: 'middle', color: '#fff', alpha: p });
      });
    } else {
      const bw = o.w / n * (1 - gap);
      o.values.forEach((v, i) => {
        const p = M.seg(o.p, i * .12, i * .12 + .6, 'outCubic'), x = o.x + i * o.w / n + (o.w / n - bw) / 2, h = o.h * (v / max) * p;
        ctx.fillStyle = css(o.highlight === i ? (o.accent || M.house.gold) : (o.colors?.[i] || '#5f7fa8')); M.rr(ctx, x, o.y + o.h - h, bw, Math.max(2, h), 8); ctx.fill();
        M.text(ctx, o.labels[i], x + bw / 2, o.y + o.h + 14, { size: o.labelSize || 30, weight: 600, align: 'center', color: '#dfe7f2', maxW: bw + 30 });
        if (p > .05) M.text(ctx, M.fmt(p >= 1 ? v : v * p, o.fmt || {}), x + bw / 2, o.y + o.h - h - (o.valueSize || 40) * 1.25, { size: o.valueSize || 40, weight: 800, align: 'center', color: '#fff', alpha: p });
      });
    }
    if (o.unit) M.text(ctx, o.unit, o.x, o.y - 70, { size: 26, weight: 500, color: '#9fb0c8' });
    ctx.restore();
  };
  /** line chart drawn on with a leading dot: {x,y,w,h, xs(labels), series:[{values,color,name}], p, min, max, fmt} */
  M.lineChart = (ctx, o) => {
    const all = o.series.flatMap(s => s.values), min = o.min ?? Math.min(0, ...all), max = o.max ?? Math.max(...all) * 1.1, n = o.xs.length;
    const X = i => o.x + (n === 1 ? 0 : i / (n - 1)) * o.w, Y = v => o.y + o.h - (v - min) / (max - min) * o.h;
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 2;
    for (let k = 0; k <= 4; k++) { const yy = o.y + o.h * k / 4; ctx.beginPath(); ctx.moveTo(o.x, yy); ctx.lineTo(o.x + o.w, yy); ctx.stroke(); }
    o.xs.forEach((l, i) => { if (o.every && i % o.every) return; M.text(ctx, l, X(i), o.y + o.h + 14, { size: o.labelSize || 26, align: 'center', color: '#9fb0c8', weight: 500 }); });
    o.series.forEach((s, si) => {
      const p = clamp(o.p) * (n - 1); ctx.strokeStyle = css(s.color || M.house.gold); ctx.lineWidth = s.width || 7; ctx.lineJoin = ctx.lineCap = 'round';
      ctx.beginPath(); let lx = X(0), ly = Y(s.values[0]); ctx.moveTo(lx, ly);
      for (let i = 1; i <= Math.ceil(p) && i < n; i++) { const f = Math.min(1, p - (i - 1)); lx = lerp(X(i - 1), X(i), f); ly = lerp(Y(s.values[i - 1]), Y(s.values[i]), f); ctx.lineTo(lx, ly); }
      ctx.stroke(); ctx.fillStyle = css(s.color || M.house.gold); ctx.beginPath(); ctx.arc(lx, ly, (s.width || 7) * 1.6, 0, 7); ctx.fill();
      if (o.p >= 1 && s.endLabel !== false) M.text(ctx, M.fmt(s.values[n - 1], o.fmt || {}), X(n - 1) - 10, Y(s.values[n - 1]) - 70, { size: 44, weight: 800, align: 'right', color: s.color || M.house.gold });
    });
    ctx.restore();
  };
  /** timeline with moving scrub head: {x,y,w, from, to, events:[{year,label}], p} */
  M.timeline = (ctx, o) => {
    const X = yr => o.x + (yr - o.from) / (o.to - o.from) * o.w, head = lerp(o.from, o.to, clamp(o.p));
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(o.x + o.w, o.y); ctx.stroke();
    ctx.strokeStyle = css(o.accent || M.house.gold); ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(X(head), o.y); ctx.stroke();
    const rowEnd = [[], []]; // per side, the right edge of each label row
    const evs = (o.events || []).map((ev, i) => { const xx = X(ev.year), half = (o.labelW || 300) / 2, up = i % 2 === 0, side = up ? 0 : 1;
      let r = 0; while ((rowEnd[side][r] ?? -1e9) > xx - half) r++; rowEnd[side][r] = xx + half; return { ev, xx, up, r }; });
    evs.forEach(({ ev, xx, up, r }) => {
      const on = head >= ev.year, a = on ? 1 : .3, lift = r * (o.size || 34) * 2.3;
      ctx.globalAlpha = a; ctx.fillStyle = css(on ? (o.accent || M.house.gold) : '#9fb0c8'); ctx.beginPath(); ctx.arc(xx, o.y, on ? 14 : 9, 0, 7); ctx.fill();
      if (r) { ctx.strokeStyle = css('#9fb0c8', .5 * a); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xx, o.y + (up ? -16 : 16)); ctx.lineTo(xx, up ? o.y - 40 - lift : o.y + 26 + lift); ctx.stroke(); }
      M.text(ctx, String(ev.year), xx, up ? o.y - 86 - lift : o.y + 30 + lift, { size: o.size || 34, weight: 800, align: 'center', color: on ? '#fff' : '#9fb0c8' });
      if (ev.label) M.text(ctx, ev.label, xx, up ? o.y - 48 - lift : o.y + 70 + lift, { size: (o.size || 34) * .7, weight: 500, align: 'center', color: '#dfe7f2', maxW: o.labelW || 300 });
      ctx.globalAlpha = 1;
    });
    M.text(ctx, String(Math.floor(head)), X(head), o.y - (o.headOffset || 160), { size: o.headSize || 90, weight: 800, align: 'center', color: '#fff' });
    ctx.restore();
  };

  // ---------- camera and 3D world ----------
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  M.v3 = { sub, dot, cross, norm };

  /** perspective camera. pos and look in metres; fov in degrees (vertical); roll in degrees */
  M.camera = (o, W, H) => {
    const pos = P3(o.pos), look = P3(o.look), f = norm(sub(look, pos));
    let r = cross(f, [0, 0, 1]); if (Math.hypot(...r) < 1e-6) r = [1, 0, 0]; r = norm(r);
    let u = cross(r, f);
    if (o.roll) { const a = o.roll * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); const r2 = r.map((v, i) => v * c + u[i] * s), u2 = u.map((v, i) => u[i] * c - r[i] * s); r = r2; u = u2; }
    const focal = (H / 2) / Math.tan((o.fov || 50) * Math.PI / 360), near = o.near || 1;
    const cam = { pos, look, f, r, u, focal, near, W, H, fov: o.fov || 50 };
    cam.toCam = p => { const d = sub(p, pos); return [dot(d, r), dot(d, u), dot(d, f)]; };
    cam.proj = c => [W / 2 + c[0] / c[2] * focal, H / 2 - c[1] / c[2] * focal];
    cam.project = p => { const c = cam.toCam(p.length === 2 ? [p[0], p[1], 0] : p); if (c[2] < near) return null; const s = cam.proj(c); return { x: s[0], y: s[1], z: c[2], k: focal / c[2] }; };
    /** screen y of the horizon (for sky/ground split) */
    const fl = norm([f[0], f[1], 0]); const hz = cam.project([pos[0] + fl[0] * 1e7, pos[1] + fl[1] * 1e7, 0]); cam.horizon = hz ? hz.y : (f[2] < 0 ? -1e4 : 1e4);
    return cam;
  };
  /** camera moves (return {pos, look}) */
  const P3 = p => [p[0], p[1], p[2] || 0];
  M.moves = {
    /** orbit around a target: radius, height, start angle deg, degrees turned over p */
    orbit: (target, radius, height, a0, turn, p) => { target = P3(target); const a = (a0 + turn * p) * Math.PI / 180; return { pos: [target[0] + Math.cos(a) * radius, target[1] + Math.sin(a) * radius, height], look: target }; },
    /** dolly between two camera states */
    dolly: (A, B, p) => ({ pos: mix(A.pos, B.pos, p), look: mix(A.look, B.look, p) }),
    /** drone flight along a spline of positions, looking along a spline of targets */
    fly: (posPts, lookPts, p) => ({ pos: M.spline(posPts)(p), look: M.spline(lookPts)(p) }),
    /** top-down map dive: from high plan view to an oblique close view over a point */
    dive: (target, p, o = {}) => { target = P3(target); const h = lerp(o.h0 || 30000, o.h1 || 900, p), back = lerp(o.back0 || 1, o.back1 || 1400, p); return { pos: [target[0], target[1] - back, h], look: [target[0], target[1] + lerp(0, o.ahead || 200, p), 0] }; },
  };

  /** near-plane clip of a camera-space polygon */
  const clipNear = (pts, near) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], ia = a[2] >= near, ib = b[2] >= near;
      if (ia) out.push(a);
      if (ia !== ib) { const t = (near - a[2]) / (b[2] - a[2]); out.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t), near]); }
    }
    return out;
  };

  /** A 3D scene for one frame. Add primitives, then render(ctx, cam). */
  M.world = (o = {}) => {
    const sky = M.skies[o.sky || 'day'], items = [], ground = [], overlays = [];
    const L = norm(sky.sun.map(v => -v)), amb = o.ambient ?? sky.ambient;
    const fog = o.fog === false ? null : Object.assign({ color: sky.fog, near: 2500, far: 22000 }, o.fog || {});
    const w = { sky, items, ground, overlays, opts: o };
    const fogK = d => fog ? smooth(fog.near, fog.far, d) * (fog.max ?? .85) : 0;
    const lit = (c, n) => M.shade(c, amb + (1 - amb) * Math.max(0, dot(n, L)));
    const paintPoly = (ctx, cam, pts3, fill, alpha = 1, stroke, sw = 1) => {
      const c = clipNear(pts3.map(cam.toCam), cam.near); if (c.length < 3) return null;
      ctx.beginPath(); c.forEach((p, i) => { const s = cam.proj(p); i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.closePath();
      if (fill) { ctx.fillStyle = css(fill, alpha); ctx.fill(); }
      if (stroke) { ctx.strokeStyle = css(stroke, alpha); ctx.lineWidth = sw; ctx.stroke(); }
      return c;
    };
    /** ground polygon (rings in metres, z=0 unless o.z). Holes supported with rings[1..] */
    w.area = (rings, s = {}) => { if (typeof rings[0][0] === 'number') rings = [rings]; ground.push({ rings, s, order: s.order || 0 }); return w; };
    /** polyline on the ground or in 3D; width in metres (wm) or pixels (wpx); p draws it on; glow adds a halo */
    w.line = (pts, s = {}) => { ground.push({ line: pts, s, order: s.order ?? 5 }); return w; };
    /** extruded prism from a footprint ring; h metres; grow 0..1 raises it; z0 base */
    w.box = (fp, h, s = {}) => { items.push({ box: fp, h, s }); return w; };
    /** axis-aligned box from centre and size */
    w.cube = (c, size, s = {}) => { const [x, y, z] = c, [a, b, h] = size; return w.box([[x - a / 2, y - b / 2], [x + a / 2, y - b / 2], [x + a / 2, y + b / 2], [x - a / 2, y + b / 2]], h, Object.assign({ z0: z }, s)); };
    /** anything drawn at a projected world point (labels, pins, glows). fn(ctx, screenPoint, cam) */
    w.at = (p3, fn, s = {}) => { overlays.push({ p3, fn, s }); return w; };
    /** tube: a 3D polyline with a radius in metres (pipes, cables), shaded across its width */
    w.tube = (pts3, radius, s = {}) => { items.push({ tube: pts3, radius, s }); return w; };

    w.render = (ctx, cam) => {
      const { W, H } = cam;
      // sky and ground plane
      const hz = cam.horizon;
      if (o.drawSky !== false) {
        const g = ctx.createLinearGradient(0, Math.min(hz, H) - H * .9, 0, Math.min(hz, H));
        g.addColorStop(0, sky.top); g.addColorStop(.6, sky.mid); g.addColorStop(1, sky.horizon);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        if (hz < H) { const gg = ctx.createLinearGradient(0, hz, 0, H); gg.addColorStop(0, css(o.groundFar || sky.fog)); gg.addColorStop(.25, css(o.ground || sky.ground)); gg.addColorStop(1, css(M.shade(o.ground || sky.ground, .85))); ctx.fillStyle = gg; ctx.fillRect(0, Math.max(0, hz), W, H); }
      }
      // ground layers (areas then lines), each fogged by distance of its first vertex
      ground.sort((a, b) => a.order - b.order);
      for (const gI of ground) {
        const s = gI.s;
        if (gI.rings) {
          ctx.save();
          const z = s.z || 0, cs = [];
          for (const ring of gI.rings) { const c = clipNear(ring.map(p => cam.toCam([p[0], p[1], p[2] ?? z])), cam.near); if (c.length >= 3) cs.push(c); }
          if (!cs.length) { ctx.restore(); continue; }
          ctx.beginPath(); for (const c of cs) c.forEach((p, i) => { const q = cam.proj(p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
          const d = cs[0].reduce((m, p) => Math.min(m, p[2]), 1e9);
          const col = M.blend(s.fill || '#888', fog ? fog.color : '#000', fogK(d));
          if (s.fill) { ctx.fillStyle = css(col, s.alpha ?? 1); ctx.fill('evenodd'); }
          if (s.stroke) { ctx.strokeStyle = css(s.stroke, s.strokeAlpha ?? 1); ctx.lineWidth = s.sw || 2; ctx.stroke(); }
          ctx.restore();
        } else {
          const pts = gI.line; if (pts.length < 2) continue;
          const n = pts.length - 1, upto = (s.p == null ? 1 : clamp(s.p)) * n; if (upto <= 0) continue;
          const P = i => { const p = pts[i]; return [p[0], p[1], p[2] ?? (s.z || 0)]; };
          ctx.save(); ctx.lineCap = ctx.lineJoin = 'round';
          const segs = [];
          for (let i = 0; i < Math.ceil(upto) && i < n; i++) {
            let a = P(i), b = P(i + 1); const f = Math.min(1, upto - i); if (f < 1) b = mix(a, b, f);
            let ca = cam.toCam(a), cb = cam.toCam(b);
            if (ca[2] < cam.near && cb[2] < cam.near) continue;
            if (ca[2] < cam.near) ca = mix(ca, cb, (cam.near - ca[2]) / (cb[2] - ca[2]));
            if (cb[2] < cam.near) cb = mix(cb, ca, (cam.near - cb[2]) / (ca[2] - cb[2]));
            segs.push([cam.proj(ca), cam.proj(cb), (ca[2] + cb[2]) / 2]);
          }
          const passes = s.glow ? [[s.glow * 3, .18], [s.glow * 1.6, .35], [0, 1]] : [[0, 1]];
          for (const [extra, al] of passes) for (const [sa, sb, d] of segs) {
            const wpx = s.wm ? Math.min(s.maxPx ?? 1e9, Math.max(s.minPx ?? .6, s.wm * cam.focal / d)) : (s.wpx || 3);
            ctx.strokeStyle = css(M.blend(s.color || '#fff', fog ? fog.color : '#000', s.noFog ? 0 : fogK(d)), (s.alpha ?? 1) * al);
            ctx.lineWidth = wpx + extra; ctx.beginPath(); ctx.moveTo(sa[0], sa[1]); ctx.lineTo(sb[0], sb[1]); ctx.stroke();
          }
          ctx.restore();
        }
      }
      // solids: build faces, sort far to near
      const faces = [];
      for (const it of items) {
        const s = it.s;
        if (it.box) {
          const z0 = s.z0 || 0, h = it.h * (s.grow == null ? 1 : clamp(s.grow)); if (h <= .01 && !s.flat) continue;
          let fp = it.box; if (fp.length > 2 && fp[0][0] === fp[fp.length - 1][0] && fp[0][1] === fp[fp.length - 1][1]) fp = fp.slice(0, -1);
          // winding: make counter-clockwise so outward normals are consistent
          let area = 0; fp.forEach((p, i) => { const q = fp[(i + 1) % fp.length]; area += p[0] * q[1] - q[0] * p[1]; }); if (area < 0) fp = fp.slice().reverse();
          const base = s.color || '#9aa7b8';
          for (let i = 0; i < fp.length; i++) {
            const a = fp[i], b = fp[(i + 1) % fp.length], n = norm([b[1] - a[1], -(b[0] - a[0]), 0]);
            const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z0 + h / 2];
            if (dot(n, sub(cam.pos, mid)) <= 0) continue; // back face
            const q = [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z0 + h], [a[0], a[1], z0 + h]];
            const d = Math.hypot(...sub(mid, cam.pos));
            faces.push({ d, pts: q, col: lit(base, n), s, wall: true, h });
          }
          const top = fp.map(p => [p[0], p[1], z0 + h]), c = top.reduce((m, p) => [m[0] + p[0] / top.length, m[1] + p[1] / top.length, z0 + h], [0, 0, 0]);
          if (cam.pos[2] > z0 + h) faces.push({ d: Math.hypot(...sub(c, cam.pos)) - .01, pts: top, col: lit(s.roof || M.shade(base, 1.08), [0, 0, 1]), s, roof: true });
        } else if (it.tube) {
          const pts = it.tube;
          for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], mid = mix(a, b, .5); faces.push({ d: Math.hypot(...sub(mid, cam.pos)), tube: [a, b], r: it.radius, s }); }
        }
      }
      faces.sort((a, b) => b.d - a.d);
      for (const fc of faces) {
        const s = fc.s, fk = s.noFog ? 0 : fogK(fc.d);
        if (fc.tube) {
          let ca = cam.toCam(fc.tube[0]), cb = cam.toCam(fc.tube[1]); if (ca[2] < cam.near && cb[2] < cam.near) continue;
          if (ca[2] < cam.near) ca = mix(ca, cb, (cam.near - ca[2]) / (cb[2] - ca[2])); if (cb[2] < cam.near) cb = mix(cb, ca, (cam.near - cb[2]) / (ca[2] - cb[2]));
          const A = cam.proj(ca), B = cam.proj(cb), wpx = fc.r * 2 * cam.focal / ((ca[2] + cb[2]) / 2);
          ctx.save(); ctx.lineCap = 'round'; const base = M.blend(s.color || '#b0b8c4', fog ? fog.color : '#000', fk);
          ctx.strokeStyle = css(M.shade(base, .55), s.alpha ?? 1); ctx.lineWidth = wpx; ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(...B); ctx.stroke();
          ctx.strokeStyle = css(base, s.alpha ?? 1); ctx.lineWidth = wpx * .62; ctx.beginPath(); ctx.moveTo(A[0], A[1] - wpx * .12); ctx.lineTo(B[0], B[1] - wpx * .12); ctx.stroke();
          ctx.strokeStyle = css(M.shade(base, 1.5), (s.alpha ?? 1) * .7); ctx.lineWidth = wpx * .16; ctx.beginPath(); ctx.moveTo(A[0], A[1] - wpx * .26); ctx.lineTo(B[0], B[1] - wpx * .26); ctx.stroke();
          ctx.restore(); continue;
        }
        const col = M.blend(fc.col, fog ? fog.color : '#000', fk);
        ctx.save();
        const c = paintPoly(ctx, cam, fc.pts, col, s.alpha ?? 1, s.edge ? M.blend(s.edge, fog ? fog.color : '#000', fk) : (o.edges ? M.shade(col, .82) : null), s.edgeW || 1);
        if (c && fc.wall && s.windows && fc.h > 12) { // window bands: lit at night, glassy by day
          ctx.clip(); const lvls = Math.floor(fc.h / 3.8);
          ctx.strokeStyle = css(s.windows, s.windowAlpha ?? .35); ctx.lineWidth = Math.max(.5, cam.focal / fc.d * 1.1);
          for (let k = 1; k < lvls; k++) { const zz = (s.z0 || 0) + k * 3.8, a = cam.project([fc.pts[0][0], fc.pts[0][1], zz]), b = cam.project([fc.pts[1][0], fc.pts[1][1], zz]); if (a && b) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
        }
        ctx.restore();
      }
      // overlays (labels, pins), far to near
      overlays.map(ov => ({ ov, sp: cam.project(ov.p3) })).filter(x => x.sp && x.sp.x > -300 && x.sp.x < W + 300 && x.sp.y > -300 && x.sp.y < H + 300)
        .sort((a, b) => b.sp.z - a.sp.z).forEach(({ ov, sp }) => { ctx.save(); ov.fn(ctx, sp, cam); ctx.restore(); });
      return w;
    };
    return w;
  };

  // ---------- geography helpers (geo/calgary_base.json is loaded as window.GEO by the harness) ----------
  M.geo = {
    get: () => root.GEO || null,
    lm: name => { const g = root.GEO; const l = g && g.landmarks && g.landmarks[name]; return l ? [l.xy[0], l.xy[1], 0] : null; },
    /** convert lat/lon to engine metres with the pack's origin */
    xy: (lat, lon) => { const o = root.GEO ? root.GEO.meta.origin : { lat: 51.0447, lon: -114.0719 }; const kx = 111320 * Math.cos(o.lat * Math.PI / 180); return [(lon - o.lon) * kx, (lat - o.lat) * 110574, 0]; },
    river: name => { const g = root.GEO; return g && (g.rivers || []).find(r => r.name === name); },
    /** the longest continuous stretch of a named river within `radius` metres of `centre` (for drawing it on or flying along it) */
    riverPath: (name, centre = [0, 0], radius = 8000) => {
      const r = M.geo.river(name); if (!r) return [];
      let best = [];
      for (const line of r.lines) { let cur = []; for (const p of line) { if (Math.hypot(p[0] - centre[0], p[1] - centre[1]) <= radius) cur.push(p); else { if (cur.length > best.length) best = cur; cur = []; } } if (cur.length > best.length) best = cur; }
      return best;
    },
    /** which ward or community contains a point: M.geo.within('wards', p) -> item name (e.g. '7') or null */
    within: (layer, p) => {
      const g = root.GEO; if (!g || !g[layer]) return null;
      const inside = (r, x, y) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
      for (const it of g[layer].items) for (const poly of it.polys) if (inside(poly[0], p[0], p[1]) && !poly.slice(1).some(h => inside(h, p[0], p[1]))) return it.name;
      return null;
    },
    /** add the Calgary base layers to a world. opts: {boundary, water, parks, rivers, roads, lrt, buildings, buildingsGrow, colors, communities, wards, highlightCommunity, highlightWard} */
    addBase: (w, o = {}) => {
      const g = root.GEO; if (!g) return w;
      const C = Object.assign({ land: '#cfd5cc', water: '#3d78ad', park: '#7fa77a', road: '#f4f1ea', motorway: '#f6c35b', lrt: '#d94848', boundary: '#0b1f3a', building: '#b8c2cf', ward: '#ffffff', community: '#ffffff' }, o.colors || {});
      if (o.boundary !== false && g.boundary && g.boundary.length) g.boundary.forEach(poly => w.area(poly, { fill: C.land, order: -10, stroke: o.boundaryStroke ? C.boundary : null, sw: 3 }));
      else if (o.boundary !== false && g.wards) g.wards.items.forEach(it => it.polys.forEach(poly => w.area(poly, { fill: C.land, order: -10, stroke: C.land, sw: 1.5 }))); // city land = the 14 wards
      if (o.parks !== false && g.parks) g.parks.forEach(pk => pk.polys.forEach(poly => w.area(poly, { fill: C.park, order: -6, alpha: .9 })));
      if (o.water !== false && g.water) g.water.forEach(wa => wa.polys.forEach(poly => w.area(poly, { fill: C.water, order: -4 })));
      if (o.rivers !== false && g.rivers) g.rivers.forEach(r => r.lines.forEach(l => w.line(l, { wm: r.kind === 'river' ? (o.riverW || 60) : 12, color: C.water, order: -3, minPx: r.kind === 'river' ? 1.6 : .6 })));
      if (o.roads !== false && g.roads) g.roads.forEach(r => r.lines.forEach(l => w.line(l, { wm: r.class === 'motorway' ? 22 : r.class === 'trunk' ? 16 : 10, color: r.class === 'primary' ? C.road : C.motorway, order: 0, alpha: r.class === 'primary' ? .8 : 1, minPx: .5 })));
      if (o.lrt && g.lrt) g.lrt.forEach(l => w.line(l, { wm: 8, color: C.lrt, order: 1, minPx: 1.2 }));
      if (o.stations && g.lrt_stations) g.lrt_stations.forEach(st => w.at([st.xy[0], st.xy[1], 0], (ctx, sp) => { const r = Math.max(3, Math.min(12, sp.k * 25)); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.lrt; ctx.lineWidth = r * .45; ctx.beginPath(); ctx.arc(sp.x, sp.y, r, 0, 7); ctx.fill(); ctx.stroke(); if (o.stationLabels) M.text(ctx, st.name, sp.x + r + 6, sp.y, { size: 22, base: 'middle', stroke: 4, strokeColor: '#06101f' }); }));
      for (const key of ['wards', 'communities']) {
        if (!o[key] || !g[key]) continue; const hi = key === 'wards' ? o.highlightWard : o.highlightCommunity;
        g[key].items.forEach(it => it.polys.forEach(poly => {
          const want = hi == null ? null : String(hi).toUpperCase().replace(/^WARD\s*/, ''), names = [it.name, ...Object.values(it.props || {})].map(v => String(v).toUpperCase().replace(/^WARD\s*/, ''));
          const isHi = want != null && names.includes(want);
          w.area(poly, { fill: isHi ? (o.hiColor || M.house.gold) : null, alpha: isHi ? (o.hiAlpha ?? .55) : 0, stroke: isHi ? (o.hiColor || M.house.gold) : C[key === 'wards' ? 'ward' : 'community'], strokeAlpha: isHi ? 1 : (o.lineAlpha ?? .35), sw: isHi ? 5 : 1.5, order: isHi ? 3 : 2 });
        }));
      }
      if (o.buildings !== false && g.buildings_downtown) {
        const grow = o.buildingsGrow == null ? 1 : o.buildingsGrow;
        const vary = M.rng(11);
        g.buildings_downtown.items.forEach((b, i) => { const k = vary(); if (o.only && !o.only(b, i)) return;
          w.box(b.fp, b.h, { color: o.buildingColor || C.building, roof: o.roofColor, grow: typeof grow === 'function' ? grow(b, i) : grow, windows: o.windows, windowAlpha: (o.windowAlpha ?? .35) * (.35 + k * .9), edge: o.buildingEdge }); });
      }
      return w;
    },
  };
  /** map pin with label at a world point */
  M.pin = (w, p3, label, o = {}) => w.at(p3, (ctx, sp) => {
    const drop = o.p == null ? 1 : M.ease.outBack(clamp(o.p)); if (drop <= 0) return;
    const y = sp.y - (1 - drop) * 220, s = o.scale || 1;
    ctx.globalAlpha = clamp(o.p == null ? 1 : o.p * 3);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(sp.x, sp.y, 18 * s, 7 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = css(o.color || M.house.gold); ctx.beginPath(); ctx.moveTo(sp.x, y); ctx.bezierCurveTo(sp.x - 34 * s, y - 50 * s, sp.x - 30 * s, y - 92 * s, sp.x, y - 92 * s); ctx.bezierCurveTo(sp.x + 30 * s, y - 92 * s, sp.x + 34 * s, y - 50 * s, sp.x, y); ctx.fill();
    ctx.fillStyle = css(M.house.navy); ctx.beginPath(); ctx.arc(sp.x, y - 62 * s, 11 * s, 0, 7); ctx.fill();
    if (label) { const r = M.text(ctx, label, sp.x, y - 150 * s, { size: o.size || 38, weight: 700, align: 'center', color: '#fff', stroke: 6, strokeColor: '#06101f', shadow: 10 }); }
  });
  /** label anchored to a world point (no pin) */
  M.label = (w, p3, s, o = {}) => w.at(p3, (ctx, sp) => { if ((o.alpha ?? 1) <= 0) return; M.text(ctx, s, sp.x, sp.y + (o.dy || 0), Object.assign({ size: 32, weight: 700, align: 'center', color: '#fff', stroke: 5, strokeColor: '#06101f' }, o)); });
  /** pulse ring on the ground (screen space at projected point) */
  M.ping = (w, p3, t, o = {}) => w.at(p3, (ctx, sp) => { for (let k = 0; k < 3; k++) { const ph = ((((t * (o.speed || .8)) + k / 3) % 1) + 1) % 1; ctx.strokeStyle = css(o.color || M.house.gold, (1 - ph) * .9); ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(sp.x, sp.y, ph * (o.r || 120), ph * (o.r || 120) * .45, 0, 0, 7); ctx.stroke(); } });

  /** traffic: vehicles moving along polylines (metres). Each path [[x,y],...]; deterministic */
  M.traffic = (w, paths, t, o = {}) => {
    const rnd = M.rng(o.seed || 7), night = o.night;
    for (const path of paths) {
      const segL = []; let L = 0; for (let i = 0; i < path.length - 1; i++) { const l = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]); segL.push(l); L += l; }
      if (L < 30) continue;
      const count = Math.max(1, Math.round(L / (o.spacing || 90)));
      for (let dir = 0; dir < (o.twoWay === false ? 1 : 2); dir++) for (let k = 0; k < count; k++) {
        const v = (o.speed || 16) * (0.8 + rnd() * .4), off = rnd() * L; let s = (off + t * v) % L; if (dir) s = L - s;
        let i = 0; while (i < segL.length - 1 && s > segL[i]) { s -= segL[i]; i++; }
        const a = path[i], b = path[i + 1], f = segL[i] ? s / segL[i] : 0, dx = (b[0] - a[0]) / (segL[i] || 1), dy = (b[1] - a[1]) / (segL[i] || 1);
        const lane = (dir ? -1 : 1) * (o.laneOffset || 3.2), cx = lerp(a[0], b[0], f) + dy * lane, cy = lerp(a[1], b[1], f) - dx * lane;
        const len = o.len || 4.6, wid = o.wid || 2, ux = dir ? -dx : dx, uy = dir ? -dy : dy;
        const fp = [[cx - ux * len / 2 - uy * wid / 2, cy - uy * len / 2 + ux * wid / 2], [cx + ux * len / 2 - uy * wid / 2, cy + uy * len / 2 + ux * wid / 2], [cx + ux * len / 2 + uy * wid / 2, cy + uy * len / 2 - ux * wid / 2], [cx - ux * len / 2 + uy * wid / 2, cy - uy * len / 2 - ux * wid / 2]];
        const cols = o.colors || ['#d8dde4', '#2d3440', '#9b2b2b', '#36506e', '#c9c9c9', '#f0f0f0'];
        w.box(fp, o.h || 1.5, { color: cols[Math.floor(rnd() * cols.length)] });
        if (night) w.at([cx + ux * len / 2, cy + uy * len / 2, .8], (ctx, sp) => { const r = Math.max(2, sp.k * 2.2); const g = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, r * 3); g.addColorStop(0, dir ? 'rgba(255,90,70,.9)' : 'rgba(255,245,210,.95)'); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(sp.x - r * 3, sp.y - r * 3, r * 6, r * 6); });
      }
    }
  };

  // ---------- weather and atmosphere (screen space, depth-parallax) ----------
  M.weather = (ctx, kind, t, W, H, o = {}) => {
    const rnd = M.rng(o.seed || 3), n = o.count || (kind === 'rain' ? 900 : 500); ctx.save();
    if (kind === 'snow') { for (let i = 0; i < n; i++) { const d = .25 + rnd() * .75, x0 = rnd() * W, sp = (40 + 90 * d) * (o.speed || 1), y = (rnd() * H + t * sp) % (H + 40) - 20, x = (x0 + Math.sin(t * .8 + i) * 25 * d + (o.wind || 0) * t * d) % W; ctx.fillStyle = `rgba(255,255,255,${.35 + .55 * d})`; ctx.beginPath(); ctx.arc((x + W) % W, y, 1.2 + 3.8 * d, 0, 7); ctx.fill(); } }
    if (kind === 'rain') { ctx.lineCap = 'round'; for (let i = 0; i < n; i++) { const d = .3 + rnd() * .7, x = rnd() * W, sp = (900 + 900 * d), y = (rnd() * H + t * sp) % (H + 80) - 40, l = 18 + 36 * d; ctx.strokeStyle = `rgba(200,215,235,${.15 + .35 * d})`; ctx.lineWidth = .8 + 1.4 * d; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - l * .18, y + l); ctx.stroke(); } }
    if (kind === 'fog') { const g = ctx.createLinearGradient(0, H * (o.top ?? .35), 0, H); g.addColorStop(0, 'rgba(220,228,236,0)'); g.addColorStop(1, `rgba(220,228,236,${o.amount ?? .55})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    if (kind === 'chinook') { // the chinook arch: a clear band of sky under a straight cloud edge
      const y = H * (o.y ?? .22), g = ctx.createLinearGradient(0, 0, 0, y + 60); g.addColorStop(0, 'rgba(70,80,96,.95)'); g.addColorStop(.85, 'rgba(110,118,132,.9)'); g.addColorStop(1, 'rgba(110,118,132,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, y + Math.sin(t * .2) * 6); ctx.quadraticCurveTo(W / 2, y - 40, 0, y + 10); ctx.closePath(); ctx.fill();
    }
    if (kind === 'dust' || kind === 'embers') { for (let i = 0; i < (o.count || 120); i++) { const d = rnd(), x = (rnd() * W + t * 12 * (d + .2)) % W, y = (rnd() * H - t * (kind === 'embers' ? 60 : 8) * (d + .3) + H * 4) % H; ctx.fillStyle = kind === 'embers' ? `rgba(255,${140 + 80 * d | 0},60,${.3 + .6 * d})` : `rgba(255,240,210,${.08 + .18 * d})`; ctx.beginPath(); ctx.arc(x, y, .8 + 2.2 * d, 0, 7); ctx.fill(); } }
    ctx.restore();
  };

  // ---------- 2.5D parallax from flat layers (archival photos, illustrations) ----------
  /** layers: [{img|draw, depth (1 = background ... 0.2 = near foreground), x, y, w, h}] ; cam {x, y, zoom} in px */
  M.parallax = (ctx, layers, cam, W, H) => {
    for (const L of layers.slice().sort((a, b) => b.depth - a.depth)) {
      ctx.save(); const k = 1 / L.depth, z = 1 + ((cam.zoom || 1) - 1) * k;
      ctx.translate(W / 2 - cam.x * k * .02 * W / 100, H / 2 - (cam.y || 0) * k * .02 * H / 100); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
      if (L.img) ctx.drawImage(L.img, L.x || 0, L.y || 0, L.w || W, L.h || H); else L.draw(ctx);
      ctx.restore();
    }
  };
  /** Ken-Burns is banned on its own; use M.photo for archival images with a slow push AND a parallax foreground or overlay */
  M.photo = (ctx, img, p, W, H, o = {}) => {
    if (!img || !img.width) return; const s0 = o.s0 || 1.05, s1 = o.s1 || 1.18, s = lerp(s0, s1, p), iw = img.width, ih = img.height;
    const k = Math.max(W / iw, H / ih) * s, x = lerp(o.x0 || 0, o.x1 || 0, p), y = lerp(o.y0 || 0, o.y1 || 0, p);
    ctx.save(); if (o.sepia) ctx.filter = `sepia(${o.sepia}) contrast(1.05)`; ctx.drawImage(img, W / 2 - iw * k / 2 + x, H / 2 - ih * k / 2 + y, iw * k, ih * k); ctx.restore();
  };

  // ---------- compositing: before/after, cutaway, exploded view ----------
  const bufs = {};
  M.buffer = (key, W, H) => { let c = bufs[key]; if (!c || c.width !== W || c.height !== H) { c = document.createElement('canvas'); c.width = W; c.height = H; bufs[key] = c; } const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); x.globalAlpha = 1; x.filter = 'none'; return [c, x]; };
  /** wipe between two renders with a labelled divider. p 0..1 position of divider from left */
  M.beforeAfter = (ctx, p, drawBefore, drawAfter, W, H, o = {}) => {
    const [ca, xa] = M.buffer('ba_a', W, H), [cb, xb] = M.buffer('ba_b', W, H); drawBefore(xa); drawAfter(xb);
    ctx.drawImage(ca, 0, 0); const X = W * clamp(p); ctx.save(); ctx.beginPath(); ctx.rect(X, 0, W - X, H); ctx.clip(); ctx.drawImage(cb, 0, 0); ctx.restore();
    ctx.fillStyle = css(o.accent || M.house.gold); ctx.fillRect(X - 3, 0, 6, H);
    if (o.labels) { if (X > 160) M.chip(ctx, o.labels[0], Math.max(24, X - 24), o.labelY || 120, { align: 'right', bg: '#0b1f3a', color: '#fff', outline: o.accent || M.house.gold }); if (X < W - 160) M.chip(ctx, o.labels[1], Math.min(W - 24, X + 24), o.labelY || 120, { align: 'left' }); }
  };
  /** underground cutaway: a section cut along y = y0 through a block of ground x0..x1 (metres), seen from the -y side.
   *  The front strip (y between y0 - trench and y0) is dug out; its lid lifts away with p, revealing the strata on the cut face.
   *  Put pipes in front of the face with w.tube([[x0, y0 - .7, -depth], [x1, y0 - .7, -depth]], radius). Returns the bottom depth. */
  M.cutaway = (w, rect, p, o = {}) => {
    const [x0, y0, x1, back = 25] = rect, trench = o.trench || 6, k = M.ease.inOutCubic(clamp(p));
    const layers = o.layers || [{ d: 1.2, c: '#5b4632', name: 'Topsoil' }, { d: 3, c: '#806648', name: 'Clay' }, { d: 4, c: '#9a8566', name: 'Gravel' }];
    const total = layers.reduce((a, L) => a + L.d, 0);
    w.box([[x0, y0 - trench], [x1, y0 - trench], [x1, y0], [x0, y0]], .01, { z0: -total, color: '#1c1a17', flat: true });     // trench floor
    let z = 0; layers.forEach(L => { w.box([[x0, y0], [x1, y0], [x1, y0 + back], [x0, y0 + back]], L.d, { z0: z - L.d, color: L.c, roof: z === 0 ? (o.surface || '#7f8c7a') : L.c }); if (L.name && o.labels !== false) M.label(w, [x1 - 2, y0 - .2, z - L.d / 2], L.name, { size: o.labelSize || 26, align: 'right', alpha: M.seg(p, .6, 1), base: 'middle' }); z -= L.d; });
    if (o.lid !== false) w.box([[x0, y0 - trench], [x1, y0 - trench], [x1, y0], [x0, y0]], total, { z0: -total + (o.lift || total * 3) * k, color: o.lidColor || '#7a6650', roof: o.surface || '#7f8c7a', alpha: 1 - k * .9 });
    return -total;
  };
  /** exploded view: parts [{fp, h, z0, color, label, dir:[x,y,z], dist}] moved apart by p, with leader labels */
  M.explode = (w, parts, p, o = {}) => {
    const k = M.ease.inOutCubic(clamp(p));
    parts.forEach(pt => {
      const d = (pt.dir || [0, 0, 1]).map(v => v * (pt.dist || 10) * k), fp = pt.fp.map(q => [q[0] + d[0], q[1] + d[1]]);
      w.box(fp, pt.h, { z0: (pt.z0 || 0) + d[2], color: pt.color, edge: o.edge || '#0b1f3a', edgeW: 1.5 });
      if (pt.label) { const c = fp.reduce((m, q) => [m[0] + q[0] / fp.length, m[1] + q[1] / fp.length], [0, 0]); M.label(w, [c[0], c[1], (pt.z0 || 0) + d[2] + pt.h + (o.labelLift || 2)], pt.label, { size: o.size || 30, alpha: k, dy: -40 }); }
    });
  };

  // ---------- transitions ----------
  /** draw a transition between two scene draws. kind: cut, dissolve, push, whip, zoom, flash, wipe, iris, match */
  M.transition = (ctx, kind, p, drawA, drawB, W, H, o = {}) => {
    p = clamp(p); if (kind === 'cut') return (p < .5 ? drawA : drawB)(ctx);
    const [ca, xa] = M.buffer('tr_a', W, H), [cb, xb] = M.buffer('tr_b', W, H); drawA(xa); drawB(xb);
    const e = M.ease.inOutCubic(p), dir = o.dir || 1;
    ctx.save();
    switch (kind) {
      case 'dissolve': case 'match': ctx.drawImage(ca, 0, 0); ctx.globalAlpha = kind === 'match' ? M.ease.inOutSine(p) : e; if (kind === 'match') { const s = lerp(1.06, 1, e); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2); } ctx.drawImage(cb, 0, 0); break;
      case 'push': ctx.drawImage(ca, -W * e * dir, 0); ctx.drawImage(cb, W * (1 - e) * dir, 0); break;
      case 'whip': { // fast pan with a short motion trail: both frames slide, trail only while moving fast
        const off = M.ease.inOutExpo(p), v = Math.sin(Math.PI * p), xa = -W * off * dir, xb = W * (1 - off) * dir;
        ctx.drawImage(ca, xa, 0); ctx.drawImage(cb, xb, 0);
        for (let k = 1; k <= 4; k++) { ctx.globalAlpha = .16 * v; ctx.drawImage(ca, xa + k * 55 * v * dir, 0); ctx.drawImage(cb, xb + k * 55 * v * dir, 0); }
        break; }
      case 'zoom': { const a = M.ease.inExpo(Math.min(1, p * 2)), b = M.ease.outExpo(Math.max(0, p * 2 - 1)); if (p < .5) { const s = 1 + a * 2.5; ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2); ctx.globalAlpha = 1 - a * .7; ctx.drawImage(ca, 0, 0); } else { const s = lerp(.55, 1, b); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2); ctx.globalAlpha = .3 + b * .7; ctx.drawImage(cb, 0, 0); } break; }
      case 'flash': ctx.drawImage(p < .5 ? ca : cb, 0, 0); ctx.globalAlpha = Math.sin(Math.PI * p) * .95; ctx.fillStyle = o.color || '#fff6e0'; ctx.fillRect(0, 0, W, H); break;
      case 'wipe': { ctx.drawImage(ca, 0, 0); const X = lerp(-W * .3, W * 1.3, e); ctx.save(); ctx.beginPath(); ctx.moveTo(X - H * .3, 0); ctx.lineTo(X + H * .3, H); ctx.lineTo(-10, H); ctx.lineTo(-10, 0); ctx.closePath(); ctx.clip(); ctx.drawImage(cb, 0, 0); ctx.restore(); ctx.strokeStyle = css(o.accent || M.house.gold); ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(X - H * .3, 0); ctx.lineTo(X + H * .3, H); ctx.stroke(); break; }
      case 'iris': { ctx.drawImage(ca, 0, 0); ctx.save(); ctx.beginPath(); ctx.arc(o.x ?? W / 2, o.y ?? H / 2, Math.hypot(W, H) * e, 0, 7); ctx.clip(); ctx.drawImage(cb, 0, 0); ctx.restore(); break; }
      default: ctx.drawImage(p < .5 ? ca : cb, 0, 0);
    }
    ctx.restore();
  };

  // ---------- film finish ----------
  M.finish = (ctx, W, H, frame, id = {}) => {
    if (id.vignette) { const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.hypot(W, H) * .62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${id.vignette})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    if (id.grain) { const [c, x] = M.buffer('grain', 256, 256); const im = x.createImageData(256, 256), r = M.rng(frame * 7919 + 1); for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); ctx.save(); ctx.globalAlpha = id.grain; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = ctx.createPattern(c, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore(); }
    if (id.letterboxP) { const target = W / id.letterbox, bar = Math.max(0, (H - target) / 2) * clamp(id.letterboxP); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar); }
  };

  // ---------- house furniture ----------
  M.loadImage = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  /** caption band from narration (burned-in subtitles); vertical keeps it inside y 1240-1420 and clear of the right 120 px */
  M.caption = (ctx, s, W, H, o = {}) => {
    if (!s) return; const vertical = H > W, size = o.size || (vertical ? 46 : 40), maxW = vertical ? W - 120 - 80 : W * .7;
    ctx.save(); ctx.font = M.font(size, 600); const words = s.split(/\s+/), lines = []; let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur);
    const lh = size * 1.22, bh = lines.length * lh + size * .8, cx = vertical ? (W - 120) / 2 + 30 : W / 2, by = vertical ? (o.bottom || 1420) - bh : H - (o.bottom || 70) - bh;
    let mw = Math.max(...lines.map(l => ctx.measureText(l).width)); M.rr(ctx, cx - mw / 2 - size * .5, by, mw + size, bh, 14); ctx.fillStyle = 'rgba(6,14,28,.72)'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; lines.forEach((l, i) => ctx.fillText(l, cx, by + size * .4 + i * lh)); ctx.restore();
  };
  /** logo header (not in the first 3 s, not on the closing frame) */
  M.header = (ctx, logo, W, H, o = {}) => {
    const a = o.alpha ?? 1; if (a <= 0 || !logo) return; ctx.save(); ctx.globalAlpha = a; const vertical = H > W;
    if (vertical) { const s = 70; ctx.font = M.font(40, 600); const tw = ctx.measureText('Calgary Insight').width, x = (W - (s + 18 + tw)) / 2; ctx.drawImage(logo, x, 140, s, s); M.text(ctx, 'Calgary Insight', x + s + 18, 140 + s / 2, { size: 40, base: 'middle', color: '#fff', shadow: 8 }); }
    else { ctx.drawImage(logo, 48, 40, 60, 60); M.text(ctx, 'CALGARY INSIGHT' + (o.topic ? '  ·  ' + o.topic.toUpperCase() : ''), 124, 70, { size: 26, base: 'middle', weight: 600, color: '#fff', tracking: .08, shadow: 8 }); }
    ctx.restore();
  };
  /** mid-video follow pill (videos over 25 s, about 2 s at the halfway point) */
  M.followPill = (ctx, p, W, H) => { if (p <= 0 || p >= 1) return; const a = Math.min(1, p * 6, (1 - p) * 6), vertical = H > W; ctx.save(); ctx.globalAlpha = a; const y = vertical ? 260 : 120; M.chip(ctx, '🔔 Follow @calgaryinsight for more Calgary stories', vertical ? (W - 120) / 2 + 30 : W / 2, y + (1 - a) * -20, { align: 'center', size: vertical ? 30 : 26, bg: '#ffffff', color: '#0b1f3a' }); ctx.restore(); };
  /** closing question frame for videos of 2:00 or less */
  M.closer = (ctx, q, p, W, H, o = {}) => {
    const vertical = H > W; ctx.save(); ctx.globalAlpha = clamp(p * 4);
    const y = vertical ? 620 : H * .3; M.kinetic(ctx, q, p * 3, vertical ? (W - 120) / 2 + 30 : W / 2, y, { size: vertical ? 92 : 84, maxW: vertical ? W - 240 : W * .75, every: .06, highlight: o.highlight, accent: o.accent });
    M.text(ctx, 'Drop your thoughts below 👇', vertical ? (W - 120) / 2 + 30 : W / 2, vertical ? 1180 : H * .72, { size: vertical ? 52 : 46, weight: 700, align: 'center', color: o.accent || M.house.gold, alpha: M.seg(p, .2, .45) });
    M.text(ctx, 'calgaryinsight.ca', vertical ? (W - 120) / 2 + 30 : W / 2, vertical ? 1290 : H * .82, { size: vertical ? 36 : 32, weight: 600, align: 'center', color: '#fff', alpha: M.seg(p, .3, .55) * .9 });
    ctx.restore();
  };


  // ---------- narration timing, documents, project status ----------
  /** lines: [{text, dur (measured Kokoro seconds), gapAfter?}] -> {scenes:[{start,dur,text}], total, captionAt(t), lineAt(t)}
   *  Scene i runs from its line's start to the next line's start (lead silence goes to scene 0, tail to the last). */
  M.script = (lines, o = {}) => {
    const lead = o.lead ?? .3, gap = o.gap ?? .4, tail = o.tail ?? 1.5; let t = lead; const sc = [];
    lines.forEach((l, i) => { const g = l.gapAfter ?? (i === lines.length - 1 ? tail : gap); sc.push({ start: t, speech: l.dur, text: l.text, caption: l.caption ?? String(l.text).replace(/calgary insight dot c a/ig, 'calgaryinsight.ca') }); t += l.dur + g; });
    sc.forEach((s, i) => { s.sceneStart = i === 0 ? 0 : s.start; s.sceneEnd = i === sc.length - 1 ? t : sc[i + 1].start; s.sceneDur = s.sceneEnd - s.sceneStart; });
    const lineAt = x => sc.find(s => x >= s.start && x < s.start + s.speech + .15);
    return { scenes: sc, total: t, lineAt, captionAt: x => (lineAt(x) || {}).caption || '' };
  };
  /** document card with an exact short quote highlighted word by word (quotes under 15 words) */
  M.doc = (ctx, o) => {
    const { x, y, w } = o, p = clamp(o.p ?? 1); ctx.save(); ctx.globalAlpha *= M.seg(p, 0, .15, 'linear');
    const yy = y + (1 - M.ease.outCubic(M.seg(p, 0, .25))) * 60; M.rr(ctx, x, yy, w, o.h || 520, 18); ctx.fillStyle = '#f7f4ec'; ctx.fill();
    ctx.fillStyle = '#c9c2b2'; for (let k = 0; k < 9; k++) ctx.fillRect(x + 50, yy + 150 + k * 34, (w - 100) * (k % 3 === 2 ? .6 : .95), 10);
    M.text(ctx, o.title || '', x + 50, yy + 46, { size: 30, weight: 700, color: '#1b2533', shadow: false, maxW: w - 100 });
    const qy = yy + (o.h || 520) - 210; ctx.font = M.font(o.size || 40, 700); const words = String(o.quote).split(/\s+/); let cx = x + 50, cy = qy; const lh = (o.size || 40) * 1.3;
    words.forEach((wd, i) => { const ww = ctx.measureText(wd + ' ').width; if (cx + ww > x + w - 50) { cx = x + 50; cy += lh; }
      const on = M.seg(p, .3 + i / words.length * .55, .3 + (i + 1) / words.length * .55, 'linear'); ctx.fillStyle = css(o.accent || M.house.gold, .85); ctx.fillRect(cx - 4, cy - 4, (ww - 6) * on + (on > 0 ? 8 : 0), (o.size || 40) * 1.15);
      ctx.fillStyle = '#111a26'; ctx.textBaseline = 'top'; ctx.fillText(wd, cx, cy); cx += ww; });
    M.text(ctx, o.source || '', x + 50, yy + (o.h || 520) - 56, { size: 24, weight: 500, color: '#5b6573', shadow: false, maxW: w - 100 });
    ctx.restore();
  };
  /** project stage row: ANNOUNCED -> FUNDING APPROVED -> UNDER CONSTRUCTION -> COMPLETED, lit up to `stage` (0-3); never light a stage the evidence hasn't reached */
  M.stages = (ctx, stage, p, x, y, w, o = {}) => {
    const names = ['ANNOUNCED', 'FUNDING APPROVED', 'UNDER CONSTRUCTION', 'COMPLETED'], step = w / 4, lit = stage + 1;
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + step / 2, y); ctx.lineTo(x + w - step / 2, y); ctx.stroke();
    const reach = M.seg(p, 0, .8) * stage; ctx.strokeStyle = css(o.accent || M.house.gold); ctx.beginPath(); ctx.moveTo(x + step / 2, y); ctx.lineTo(x + step / 2 + step * reach, y); ctx.stroke();
    names.forEach((n, i) => { const on = i < lit && reach >= i - .01, cx = x + step * (i + .5);
      ctx.fillStyle = on ? css(o.accent || M.house.gold) : '#0e1726'; ctx.strokeStyle = on ? css(o.accent || M.house.gold) : 'rgba(255,255,255,.4)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, y, on ? 22 : 16, 0, 7); ctx.fill(); ctx.stroke();
      M.text(ctx, n, cx, y + 40, { size: o.size || 24, weight: on ? 800 : 500, align: 'center', color: on ? '#fff' : '#8a99ad', maxW: step - 10 }); });
    ctx.restore();
  };

  // ---------- film: scenes on a timeline, rendered frame by frame ----------
  /** M.film({W, H, fps, identity, scenes:[{dur, draw(ctx, lt, info), trans:{kind, dur}}], finish:true, overlay(ctx, t, info)})
   *  Scene draw gets local time lt (0..dur) and info {W,H,t,p,frame,index}. A scene's trans blends INTO the next scene over trans.dur
   *  seconds, centred on the cut, so both scenes keep moving during it. */
  M.film = cfg => {
    const W = cfg.W || 1080, H = cfg.H || 1920, fps = cfg.fps || 30, id = Object.assign({}, M.identities[cfg.identity || 'explainer'], cfg.look || {});
    const starts = []; let acc = 0; cfg.scenes.forEach(s => { starts.push(acc); acc += s.dur; });
    const total = acc, canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const drawScene = (i, t) => x => { const s = cfg.scenes[i], lt = t - starts[i]; x.save(); x.fillStyle = id.bg; x.fillRect(0, 0, W, H); s.draw(x, lt, { W, H, t, p: clamp(lt / s.dur), frame: Math.round(t * fps), index: i, id }); x.restore(); };
    const film = { W, H, fps, total, frames: Math.round(total * fps), canvas, ctx, id, starts, scenes: cfg.scenes };
    film.sceneAt = t => { let i = 0; while (i < starts.length - 1 && t >= starts[i + 1]) i++; return i; };
    film.draw = t => {
      const i = film.sceneAt(t + 1e-9); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
      ctx.fillStyle = id.bg; ctx.fillRect(0, 0, W, H); // never let a previous frame show through
      const prev = i > 0 ? cfg.scenes[i - 1].trans : null, cur = cfg.scenes[i].trans, te = starts[i] + cfg.scenes[i].dur;
      if (cur && cur.kind !== 'cut' && i < cfg.scenes.length - 1 && t > te - cur.dur / 2) M.transition(ctx, cur.kind, (t - (te - cur.dur / 2)) / cur.dur, drawScene(i, t), drawScene(i + 1, t), W, H, cur);
      else if (prev && prev.kind !== 'cut' && t < starts[i] + prev.dur / 2) M.transition(ctx, prev.kind, (t - (starts[i] - prev.dur / 2)) / prev.dur, drawScene(i - 1, t), drawScene(i, t), W, H, prev);
      else drawScene(i, t)(ctx);
      if (cfg.finish !== false) M.finish(ctx, W, H, Math.round(t * fps), Object.assign({}, id, { letterboxP: cfg.letterbox ? cfg.letterbox(t) : 0 }));
      if (cfg.overlay) { ctx.save(); cfg.overlay(ctx, t, { W, H, index: i, id, total }); ctx.restore(); } // captions, header: crisp, above grain and letterbox
    };
    film.frame = (n, q = .92) => { film.draw(n / fps); return canvas.toDataURL('image/jpeg', q); };
    film.png = t => { film.draw(t); return canvas.toDataURL('image/png'); };
    return film;
  };
})(window);
