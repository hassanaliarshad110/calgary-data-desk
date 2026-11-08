"""Charts and maps for analysis reports.

Each visual is drawn twice: as a fixed SVG picture for the PDF, and as data for the interactive web page (Chart.js
charts you can hover, Leaflet maps you can zoom and click). Only numbers the report supplies are drawn.

Chart kinds: bar, stacked_bar, horizontal_bar, line, area, scatter, donut.
Maps: shaded Ward 5 communities (values by community), points (lat/lon, optionally sized by value), or both.
"""
import html
import json
import math
import re

PALETTE = ['#0B6BB5', '#F59E0B', '#64748B', '#16A34A', '#DC2626', '#7C3AED', '#0D9488', '#DB2777']
RAMP = ['#DBEAFE', '#93C5FD', '#3B82F6', '#1D4ED8', '#1E3A8A']        # light to dark: low to high
KINDS = ('bar', 'stacked_bar', 'horizontal_bar', 'line', 'area', 'scatter', 'donut')


def e(v):
    return html.escape('' if v is None else str(v))


def isnum(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool) and not (isinstance(v, float) and math.isnan(v))


def fmt(v, d=None):
    if not isnum(v):
        return e(v)
    if d is None:
        d = 0 if float(v).is_integer() or abs(v) >= 100 else (1 if abs(v) >= 10 else 2)
    return f'{v:,.{d}f}'


def nice_top(top):
    if top <= 0:
        return 1
    mag = 10 ** math.floor(math.log10(top))
    for m in (1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10):
        if m * mag >= top:
            return m * mag
    return top


def legend_html(names):
    if len(names) < 2:
        return ''
    return '<span class="legend">' + ''.join(
        f'<span><i style="background:{PALETTE[i % 8]}"></i>{e(n)}</span>' for i, n in enumerate(names)) + '</span>'


# ================================================================================================ charts (SVG)
def chart_svg(ch, w=680):
    """(svg, legend html) or None."""
    kind = ch.get('kind') if ch.get('kind') in KINDS else 'bar'
    labels = [str(x) for x in ch.get('labels') or []]
    series = [s for s in ch.get('series') or [] if isinstance(s, dict)][:8]
    if kind == 'scatter':
        return _scatter(ch, series, w)
    series = [s for s in series if s.get('values')]
    if not labels or not series:
        return None
    if kind == 'donut':
        return _donut(ch, labels, series[0], w)
    if kind == 'horizontal_bar':
        return _hbar(ch, labels, series, w)
    stacked = kind == 'stacked_bar'
    if stacked:
        tops = [sum(max(s['values'][i], 0) for s in series if i < len(s['values']) and isnum(s['values'][i])) for i in range(len(labels))]
        vals = tops + [0]
    else:
        vals = [v for s in series for v in s['values'] if isnum(v)]
    lo, top = min(vals + [0]), nice_top(max(vals + [0]))
    h, pad_l, pad_b, pad_t, pad_r = 220, 52, 30, 10, 10
    ih, iw = h - pad_b - pad_t, w - pad_l - pad_r
    base = min(lo, 0)
    span = (top - base) or 1
    yv = lambda v: pad_t + ih * (1 - (v - base) / span)
    out = [f'<svg viewBox="0 0 {w} {h}" class="chart" role="img" aria-label="{e(ch.get("title"))}">']
    for k in range(5):
        v = base + span * k / 4
        out.append(f'<line x1="{pad_l}" x2="{w - pad_r}" y1="{yv(v):.1f}" y2="{yv(v):.1f}" class="grid"/>'
                   f'<text x="{pad_l - 6}" y="{yv(v) + 3:.1f}" class="ax" text-anchor="end">{fmt(v)}</text>')
    cw = iw / len(labels)
    step = max(1, math.ceil(len(labels) / 14))
    for i, lab in enumerate(labels):
        if i % step == 0:
            out.append(f'<text x="{pad_l + cw * (i + .5):.1f}" y="{h - 10}" class="ax" text-anchor="middle">{e(lab[:14])}</text>')
    if kind in ('line', 'area'):
        for k, s in enumerate(series):
            pts = [(pad_l + cw * (i + .5), yv(v)) for i, v in enumerate(s['values'][:len(labels)]) if isnum(v)]
            col = PALETTE[k % 8]
            if kind == 'area' and len(pts) > 1:
                poly = f'{pts[0][0]:.1f},{yv(0):.1f} ' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts) + f' {pts[-1][0]:.1f},{yv(0):.1f}'
                out.append(f'<polygon points="{poly}" fill="{col}" fill-opacity=".18"/>')
            if len(pts) > 1:
                out.append(f'<polyline fill="none" stroke="{col}" stroke-width="2.2" points="' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts) + '"/>')
            for x, y in pts:
                out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="2.6" fill="{col}"/>')
    elif stacked:
        bw = min(46, cw * .7)
        for i in range(len(labels)):
            y_base = 0
            for k, s in enumerate(series):
                v = s['values'][i] if i < len(s['values']) else None
                if not isnum(v) or v <= 0:
                    continue
                x = pad_l + cw * i + (cw - bw) / 2
                out.append(f'<rect x="{x:.1f}" y="{yv(y_base + v):.1f}" width="{bw:.1f}" height="{yv(y_base) - yv(y_base + v):.1f}" fill="{PALETTE[k % 8]}"/>')
                y_base += v
    else:
        bw = min(38, cw * .7 / len(series))
        for k, s in enumerate(series):
            for i, v in enumerate(s['values'][:len(labels)]):
                if not isnum(v):
                    continue
                x = pad_l + cw * i + (cw - bw * len(series)) / 2 + k * bw
                y0, y1 = sorted((yv(v), yv(0)))
                out.append(f'<rect x="{x:.1f}" y="{y0:.1f}" width="{bw - 1:.1f}" height="{max(y1 - y0, .5):.1f}" fill="{PALETTE[k % 8]}"/>')
    out.append('</svg>')
    return ''.join(out), legend_html([s.get('name') for s in series])


def _hbar(ch, labels, series, w):
    row_h = 20 if len(series) == 1 else 12 * len(series) + 8
    pad_l, pad_r = 190, 70
    h = 10 + row_h * len(labels)
    top = nice_top(max([v for s in series for v in s['values'] if isnum(v)] + [0]))
    out = [f'<svg viewBox="0 0 {w} {h}" class="chart" role="img" aria-label="{e(ch.get("title"))}">']
    for i, lab in enumerate(labels):
        y0 = 5 + i * row_h
        out.append(f'<text x="{pad_l - 8}" y="{y0 + row_h / 2 + 3:.1f}" class="ax lbl" text-anchor="end">{e(lab[:34])}</text>')
        for k, s in enumerate(series):
            v = s['values'][i] if i < len(s['values']) else None
            if not isnum(v):
                continue
            bh = (row_h - 6) / len(series)
            y = y0 + 3 + k * bh
            bw = (w - pad_l - pad_r) * max(v, 0) / top
            out.append(f'<rect x="{pad_l}" y="{y:.1f}" width="{bw:.1f}" height="{bh - 2:.1f}" rx="2" fill="{PALETTE[k % 8]}"/>'
                       f'<text x="{pad_l + bw + 5:.1f}" y="{y + bh - 4:.1f}" class="ax val">{fmt(v)}</text>')
    out.append('</svg>')
    return ''.join(out), legend_html([s.get('name') for s in series])


def _scatter(ch, series, w):
    pts_all = [(p, k) for k, s in enumerate(series) for p in s.get('points') or []
               if isinstance(p, dict) and isnum(p.get('x')) and isnum(p.get('y'))]
    if not pts_all:
        return None
    xs, ys = [p['x'] for p, _ in pts_all], [p['y'] for p, _ in pts_all]
    x0, x1 = min(xs + [0]) if min(xs) >= 0 else min(xs), nice_top(max(xs))
    y0, y1 = min(ys + [0]) if min(ys) >= 0 else min(ys), nice_top(max(ys))
    h, pad_l, pad_b, pad_t, pad_r = 260, 56, 40, 10, 16
    X = lambda v: pad_l + (w - pad_l - pad_r) * (v - x0) / ((x1 - x0) or 1)
    Y = lambda v: pad_t + (h - pad_b - pad_t) * (1 - (v - y0) / ((y1 - y0) or 1))
    out = [f'<svg viewBox="0 0 {w} {h}" class="chart" role="img" aria-label="{e(ch.get("title"))}">']
    for k in range(5):
        vy, vx = y0 + (y1 - y0) * k / 4, x0 + (x1 - x0) * k / 4
        out.append(f'<line x1="{pad_l}" x2="{w - pad_r}" y1="{Y(vy):.1f}" y2="{Y(vy):.1f}" class="grid"/>'
                   f'<text x="{pad_l - 6}" y="{Y(vy) + 3:.1f}" class="ax" text-anchor="end">{fmt(vy)}</text>'
                   f'<text x="{X(vx):.1f}" y="{h - pad_b + 14}" class="ax" text-anchor="middle">{fmt(vx)}</text>')
    if ch.get('x_label'):
        out.append(f'<text x="{(pad_l + w - pad_r) / 2:.1f}" y="{h - 6}" class="ax" text-anchor="middle">{e(ch["x_label"])}</text>')
    if ch.get('y_label'):
        out.append(f'<text x="12" y="{(pad_t + h - pad_b) / 2:.1f}" class="ax" text-anchor="middle" transform="rotate(-90 12 {(pad_t + h - pad_b) / 2:.1f})">{e(ch["y_label"])}</text>')
    for p, k in pts_all:
        out.append(f'<circle cx="{X(p["x"]):.1f}" cy="{Y(p["y"]):.1f}" r="4" fill="{PALETTE[k % 8]}" fill-opacity=".85"/>')
        if p.get('label') and len(pts_all) <= 30:
            out.append(f'<text x="{X(p["x"]) + 6:.1f}" y="{Y(p["y"]) + 3:.1f}" class="ax lbl">{e(str(p["label"])[:22])}</text>')
    out.append('</svg>')
    return ''.join(out), legend_html([s.get('name') for s in series])


def _donut(ch, labels, s, w):
    vals = [max(v, 0) if isnum(v) else 0 for v in s['values'][:len(labels)]]
    tot = sum(vals) or 1
    h, cx, cy, r, r2 = 220, 120, 110, 92, 54
    out = [f'<svg viewBox="0 0 {w} {h}" class="chart" role="img" aria-label="{e(ch.get("title"))}">']
    a = -math.pi / 2
    for i, v in enumerate(vals):
        if v <= 0:
            continue
        b = a + 2 * math.pi * v / tot
        large = 1 if b - a > math.pi else 0
        p = lambda ang, rad: (cx + rad * math.cos(ang), cy + rad * math.sin(ang))
        (x1, y1), (x2, y2), (x3, y3), (x4, y4) = p(a, r), p(b, r), p(b, r2), p(a, r2)
        if v == tot:
            out.append(f'<circle cx="{cx}" cy="{cy}" r="{(r + r2) / 2}" fill="none" stroke="{PALETTE[i % 8]}" stroke-width="{r - r2}"/>')
        else:
            out.append(f'<path d="M{x1:.1f},{y1:.1f} A{r},{r} 0 {large} 1 {x2:.1f},{y2:.1f} L{x3:.1f},{y3:.1f} A{r2},{r2} 0 {large} 0 {x4:.1f},{y4:.1f} Z" fill="{PALETTE[i % 8]}"/>')
        a = b
    for i, (lab, v) in enumerate(zip(labels, vals)):
        y = 24 + i * 20
        out.append(f'<rect x="250" y="{y - 9}" width="10" height="10" rx="2" fill="{PALETTE[i % 8]}"/>'
                   f'<text x="266" y="{y}" class="ax lbl">{e(lab[:40])}: {fmt(v)} ({v / tot * 100:.0f}%)</text>')
    out.append('</svg>')
    return ''.join(out), ''


# ================================================================================================ maps (SVG)
def _rings(geom):
    if not geom:
        return []
    t, c = geom.get('type'), geom.get('coordinates') or []
    if t == 'Polygon':
        return c
    if t == 'MultiPolygon':
        return [ring for poly in c for ring in poly]
    return []


def map_values(mp, name_to_code):
    """{community code: value} from values given by code or by name."""
    out = {}
    for k, v in (mp.get('values') or {}).items():
        if not isnum(v):
            continue
        code = k if k in name_to_code.values() else name_to_code.get(' '.join(str(k).upper().split()))
        if code:
            out[code] = v
    return out


def classes(vals):
    """Five equal-count classes: list of upper bounds."""
    v = sorted(vals)
    if not v:
        return []
    return [v[min(len(v) - 1, math.ceil(len(v) * (i + 1) / 5) - 1)] for i in range(5)]


def colour(v, bounds):
    for i, b in enumerate(bounds):
        if v <= b:
            return RAMP[i]
    return RAMP[-1]


def map_svg(mp, geo, name_to_code, w=680, h=440):
    """Ward 5 with communities shaded by value and/or points. (svg, legend html) or None."""
    comms = (geo or {}).get('communities') or {}
    ward = (geo or {}).get('ward')
    vals = map_values(mp, name_to_code)
    pts = [p for p in mp.get('points') or [] if isinstance(p, dict) and isnum(p.get('lat')) and isnum(p.get('lon'))]
    rings = [r for g in comms.values() for r in _rings(g)] + _rings(ward)
    coords = [(x, y) for r in rings for x, y in r] + [(p['lon'], p['lat']) for p in pts]
    if not coords:
        return None
    xs, ys = [c[0] for c in coords], [c[1] for c in coords]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    k = math.cos(math.radians((y0 + y1) / 2))
    sx = (x1 - x0) * k or 1e-6
    sy = (y1 - y0) or 1e-6
    scale = min((w - 20) / sx, (h - 20) / sy)
    ox, oy = (w - sx * scale) / 2, (h - sy * scale) / 2
    P = lambda x, y: (ox + (x - x0) * k * scale, oy + (y1 - y) * scale)
    path = lambda geom: ' '.join('M' + ' L'.join(f'{P(x, y)[0]:.1f},{P(x, y)[1]:.1f}' for x, y in r) + ' Z' for r in _rings(geom))
    bounds = classes(list(vals.values()))
    dec = 0 if all(float(x).is_integer() for x in vals.values()) else 1
    code_name = {v: k.title() for k, v in name_to_code.items()}
    out = [f'<svg viewBox="0 0 {w} {h}" class="chart map" role="img" aria-label="{e(mp.get("title"))}">']
    for code, g in comms.items():
        fill = colour(vals[code], bounds) if code in vals else '#F1F5F9'
        out.append(f'<path d="{path(g)}" fill="{fill}" stroke="#fff" stroke-width="1"/>')
    if ward:
        out.append(f'<path d="{path(ward)}" fill="none" stroke="#0F172A" stroke-width="1.6"/>')
    # points first, labels on top. Labels are placed in order of importance (the largest values first) and any label that
    # would overlap one already placed is left out, so a map never turns into a pile of names: a few small communities
    # get named, a city-wide map names its leaders, and the figures for every place are in the table beside it.
    pv = [p['value'] for p in pts if isnum(p.get('value'))]
    vmax = max(pv) if pv else None
    for p in pts[:3000]:
        X, Y = P(p['lon'], p['lat'])
        rad = 3 + (7 * (p['value'] / vmax) ** .5 if vmax and isnum(p.get('value')) and vmax > 0 else 0)
        out.append(f'<circle cx="{X:.1f}" cy="{Y:.1f}" r="{rad:.1f}" fill="#DC2626" fill-opacity=".75" stroke="#fff" stroke-width=".6"/>')
    cands = []                                    # (priority, x, y, name, value or None)
    if pts and any(str(p.get('label') or '').strip() for p in pts):
        if len(pts) <= 60:                        # named points: name the biggest ones
            for p in pts:
                lab = str(p.get('label') or '').strip()
                if lab:
                    X, Y = P(p['lon'], p['lat'])
                    cands.append((p['value'] if isnum(p.get('value')) else 0, X, Y - 9, lab, None))
    elif vals:                                    # shaded communities: name the highest values
        for code, v in vals.items():
            r = max(_rings(comms.get(code)), key=len, default=None)
            if r:
                X, Y = P(sum(x for x, _ in r) / len(r), sum(y for _, y in r) / len(r))
                cands.append((v, X, Y, code_name.get(code, code), v))
    elif len(comms) <= 40:                        # a small outline map with nothing on it: name its communities
        for code, g in comms.items():
            r = max(_rings(g), key=len, default=None)
            if r and code in code_name:
                X, Y = P(sum(x for x, _ in r) / len(r), sum(y for _, y in r) / len(r))
                cands.append((0, X, Y, code_name[code], None))
    taken, limit = [], 14 if len(cands) > 40 else 40
    for pri, X, Y, lab, v in sorted(cands, key=lambda c: -c[0]):
        lab = str(lab)[:24]
        if re.fullmatch(r'[0-9]{2}[A-Z]{1,2}', lab.strip()):    # an unnamed area (02L, 13A): no name worth showing
            continue
        tw, th = max(len(lab), len(fmt(v, dec)) if v is not None else 0) * 4.6 + 4, 20 if v is not None else 11
        box = (X - tw / 2, Y - 9, X + tw / 2, Y - 9 + th)
        if box[0] < 0 or box[2] > w or box[1] < 0 or box[3] > h:
            continue
        if any(not (box[2] < t[0] or box[0] > t[2] or box[3] < t[1] or box[1] > t[3]) for t in taken):
            continue
        taken.append(box)
        out.append(f'<text x="{X:.1f}" y="{Y:.1f}" class="ax lbl maplbl" text-anchor="middle">{e(lab)}'
                   + (f'<tspan x="{X:.1f}" dy="10" class="mapval">{fmt(v, dec)}</tspan>' if v is not None else '') + '</text>')
        if len(taken) >= limit:
            break
    out.append('</svg>')
    leg = ''
    if bounds:
        lo = min(vals.values())
        edges = [lo] + bounds
        leg = '<span class="legend">' + ''.join(
            f'<span><i style="background:{RAMP[i]}"></i>{fmt(edges[i], dec)} to {fmt(edges[i + 1], dec)}</span>'
            for i in range(5) if i == 0 or edges[i + 1] != edges[i]) + '</span>'
    if pts:
        leg += f'<span class="legend"><span><i style="background:#DC2626;border-radius:50%"></i>{e(mp.get("points_label") or "Points")} ({len(pts):,})</span></span>'
    return ''.join(out), leg


# ================================================================================================ interactive page
def interactive_data(visuals, geo, name_to_code):
    """The data the interactive page needs for each visual: charts as given, maps with GeoJSON and values."""
    out = []
    code_name = {v: k.title() for k, v in name_to_code.items()}
    for v in visuals:
        if v['type'] == 'chart':
            out.append({'id': v['id'], 'type': 'chart', 'spec': v['spec']})
        elif v['type'] == 'map':
            vals = map_values(v['spec'], name_to_code)
            feats = [{'type': 'Feature', 'properties': {'code': c, 'name': code_name.get(c, c), 'value': vals.get(c)},
                      'geometry': g} for c, g in ((geo or {}).get('communities') or {}).items()]
            out.append({'id': v['id'], 'type': 'map', 'title': v['spec'].get('title'),
                        'value_label': v['spec'].get('value_label') or '', 'bounds': classes(list(vals.values())),
                        'ramp': RAMP, 'communities': {'type': 'FeatureCollection', 'features': feats},
                        'ward': (geo or {}).get('ward'), 'points': [p for p in v['spec'].get('points') or [] if isinstance(p, dict)][:5000],
                        'points_label': v['spec'].get('points_label') or 'Points'})
    return out


SCRIPT = r'''
const VIS = __DATA__;
const PAL = ['#0B6BB5','#F59E0B','#64748B','#16A34A','#DC2626','#7C3AED','#0D9488','#DB2777'];
const nf = v => (typeof v === 'number') ? v.toLocaleString('en-CA', {maximumFractionDigits: Math.abs(v) >= 100 ? 0 : 2}) : (v ?? '');
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const mk = (tag, cls, html) => { const x = document.createElement(tag); if (cls) x.className = cls; if (html != null) x.innerHTML = html; return x; };
// Esri basemaps: they work from a file on the computer (OpenStreetMap's servers refuse pages opened that way)
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
const BASES = () => ({
  'Light grey': L.tileLayer(ESRI + 'Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxNativeZoom: 16, maxZoom: 19, attribution: 'Tiles &copy; Esri' }),
  'Streets': L.tileLayer(ESRI + 'World_Street_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles &copy; Esri' }),
  'Satellite': L.tileLayer(ESRI + 'World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Imagery &copy; Esri' })
});

function chartConfig(s, kind, from, to) {
  const lab = (s.labels || []).slice(from, to + 1);
  if (kind === 'scatter') return { type: 'scatter', data: { datasets: (s.series || []).map((d, i) => ({ label: d.name, data: (d.points || []).map(p => ({x: p.x, y: p.y, label: p.label})), backgroundColor: PAL[i % 8] })) },
    options: { maintainAspectRatio: false, plugins: { tooltip: { callbacks: { label: c => `${c.raw.label ? c.raw.label + ': ' : ''}${nf(c.raw.x)}, ${nf(c.raw.y)}` } } },
      scales: { x: { title: { display: !!s.x_label, text: s.x_label } }, y: { title: { display: !!s.y_label, text: s.y_label } } } } };
  if (kind === 'donut') return { type: 'doughnut', data: { labels: lab, datasets: [{ data: s.series[0].values.slice(from, to + 1), backgroundColor: PAL }] },
    options: { maintainAspectRatio: false, plugins: { tooltip: { callbacks: { label: c => ` ${c.label}: ${nf(c.parsed)}${s.unit ? ' ' + s.unit : ''}` } } } } };
  const type = (kind === 'line' || kind === 'area') ? 'line' : 'bar';
  return { type, data: { labels: lab, datasets: (s.series || []).map((d, i) => ({ label: d.name, data: (d.values || []).slice(from, to + 1), backgroundColor: kind === 'area' ? PAL[i % 8] + '33' : PAL[i % 8], borderColor: PAL[i % 8], fill: kind === 'area', tension: .25, pointRadius: 3, pointHoverRadius: 6 })) },
    options: { maintainAspectRatio: false, indexAxis: kind === 'horizontal_bar' ? 'y' : 'x', interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: (s.series || []).length > 1, onHover: e => { e.native.target.style.cursor = 'pointer'; } },
        tooltip: { callbacks: { label: c => ` ${c.dataset.label || ''}: ${nf(c.parsed[kind === 'horizontal_bar' ? 'x' : 'y'])}${s.unit ? ' ' + s.unit : ''}` } } },
      scales: { x: { stacked: kind === 'stacked_bar' }, y: { stacked: kind === 'stacked_bar', beginAtZero: kind !== 'line' } } } };
}

function makeChart(el, v) {
  const s = v.spec, n = (s.labels || []).length;
  let kind = s.kind || 'bar', from = 0, to = Math.max(0, n - 1), chart;
  const bar = mk('div', 'vtools'), box = mk('div', 'vbox'), canvas = mk('canvas'), data = mk('div', 'vdata');
  el.innerHTML = ''; el.append(bar, box, data); box.appendChild(canvas);
  box.style.height = (kind === 'horizontal_bar' ? Math.max(240, 26 * n + 60) : 320) + 'px';
  const draw = () => { if (chart) chart.destroy(); chart = new Chart(canvas, chartConfig(s, kind, from, to)); if (!data.hidden) table(); };
  const table = () => {
    const lab = (s.labels || []).slice(from, to + 1), ser = s.series || [];
    data.innerHTML = kind === 'scatter' ? '<table><thead><tr><th>Label</th><th class="num">' + esc(s.x_label || 'x') + '</th><th class="num">' + esc(s.y_label || 'y') + '</th></tr></thead><tbody>'
        + ser.flatMap(d => (d.points || []).map(p => `<tr><td>${esc(p.label || d.name || '')}</td><td class="num">${nf(p.x)}</td><td class="num">${nf(p.y)}</td></tr>`)).join('') + '</tbody></table>'
      : '<table><thead><tr><th></th>' + ser.map(d => `<th class="num">${esc(d.name || 'Value')}</th>`).join('') + '</tr></thead><tbody>'
        + lab.map((l, i) => `<tr><td>${esc(l)}</td>${ser.map(d => `<td class="num">${nf((d.values || [])[from + i])}</td>`).join('')}</tr>`).join('') + '</tbody></table>';
  };
  // switch between bar and line for series over categories or time
  if (['bar', 'line', 'area'].includes(kind) && n > 1) {
    const seg = mk('span', 'seg');
    for (const [k, t] of [['bar', 'Bars'], ['line', 'Line']]) {
      const b = mk('button', (kind === k || (k === 'line' && kind === 'area')) ? 'on' : '', t); b.type = 'button';
      b.onclick = () => { kind = k; seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); draw(); };
      seg.appendChild(b);
    }
    bar.appendChild(seg);
  }
  // narrow the period or range shown
  if (kind !== 'scatter' && n > 6) {
    const opts = (s.labels || []).map((l, i) => `<option value="${i}">${esc(l)}</option>`).join('');
    const f = mk('select', '', opts), t2 = mk('select', '', opts);
    f.value = '0'; t2.value = String(n - 1);
    const go = () => { from = Math.min(+f.value, +t2.value); to = Math.max(+f.value, +t2.value); draw(); };
    f.onchange = go; t2.onchange = go;
    const w = mk('label', 'range'); w.append(document.createTextNode('From '), f, document.createTextNode(' to '), t2); bar.appendChild(w);
  }
  const sp = mk('span', 'grow'); bar.appendChild(sp);
  const tb = mk('button', '', 'Show the numbers'); tb.type = 'button';
  data.hidden = true;
  tb.onclick = () => { data.hidden = !data.hidden; tb.textContent = data.hidden ? 'Show the numbers' : 'Hide the numbers'; if (!data.hidden) table(); };
  const pb = mk('button', '', 'Save picture'); pb.type = 'button';
  pb.onclick = () => { const a = document.createElement('a'); a.download = (s.title || 'chart').replace(/[^\w\- ]+/g, '') + '.png'; a.href = canvas.toDataURL('image/png'); a.click(); };
  bar.append(tb, pb);
  draw();
}

function makeMap(el, v) {
  el.style.height = '520px';
  const map = L.map(el, { scrollWheelZoom: false });
  const bases = BASES(); bases['Light grey'].addTo(map);
  const col = val => { if (typeof val !== 'number') return '#F1F5F9'; for (let i = 0; i < v.bounds.length; i++) if (val <= v.bounds[i]) return v.ramp[i]; return v.ramp[v.ramp.length - 1]; };
  const shaded = v.bounds.length > 0;
  const style = f => ({ color: '#fff', weight: 1, fillColor: shaded ? col(f.properties.value) : '#CBD5E1', fillOpacity: shaded ? .7 : .2 });
  const lay = L.geoJSON(v.communities, { style,
    onEachFeature: (f, l) => {
      const txt = `<b>${esc(f.properties.name)}</b>${typeof f.properties.value === 'number' ? '<br>' + esc(v.value_label ? v.value_label + ': ' : '') + nf(f.properties.value) : ''}`;
      l.bindTooltip(txt, { sticky: true });
      l.on('mouseover', () => l.setStyle({ weight: 3, color: '#0F172A' }));
      l.on('mouseout', () => lay.resetStyle(l));
      l.on('click', () => { map.fitBounds(l.getBounds(), { padding: [30, 30] }); l.bindPopup(txt).openPopup(); });
    } }).addTo(map);
  const overlays = {};
  overlays[shaded ? (v.value_label || 'Communities, shaded by value') : 'Community outlines'] = lay;
  if (v.ward) { const w = L.geoJSON(v.ward, { style: { color: '#0F172A', weight: 2, fill: false }, interactive: false }).addTo(map); overlays['Ward 5 boundary'] = w; }
  const pts = v.points.filter(p => typeof p.lat === 'number' && typeof p.lon === 'number');
  let grp = null;
  if (pts.length) {
    const vmax = Math.max(0, ...pts.filter(p => typeof p.value === 'number').map(p => p.value));
    grp = L.featureGroup(pts.map(p => L.circleMarker([p.lat, p.lon], { radius: 4 + (vmax && typeof p.value === 'number' ? 8 * Math.sqrt(p.value / vmax) : 0), color: '#fff', weight: 1, fillColor: '#DC2626', fillOpacity: .8 })
      .bindTooltip(esc(p.label || ''), { direction: 'top' })
      .bindPopup(`<b>${esc(p.label || '')}</b>${typeof p.value === 'number' ? '<br>' + nf(p.value) : ''}`))).addTo(map);
    overlays[`${v.points_label || 'Points'} (${pts.length.toLocaleString('en-CA')})`] = grp;
  }
  L.control.layers(bases, overlays, { collapsed: false }).addTo(map);
  if (shaded) {
    const lg = L.control({ position: 'bottomright' });
    lg.onAdd = () => { const d = mk('div', 'maplegend'); let lo = null;
      d.innerHTML = (v.value_label ? `<b>${esc(v.value_label)}</b>` : '') + v.bounds.map((b, i) => { const r = `<div><i style="background:${v.ramp[i]}"></i>${lo === null ? 'up to ' + nf(b) : nf(lo) + ' to ' + nf(b)}</div>`; lo = b; return r; }).join('');
      return d; };
    lg.addTo(map);
  }
  const home = () => { const b = lay.getBounds(); map.fitBounds(b.isValid() ? b : grp.getBounds(), { padding: [10, 10] }); };
  const rc = L.control({ position: 'topleft' });
  rc.onAdd = () => { const b = mk('button', 'mapbtn', 'Whole ward'); b.type = 'button'; b.title = 'Zoom back out to all of Ward 5'; L.DomEvent.on(b, 'click', e => { L.DomEvent.stop(e); home(); }); return b; };
  rc.addTo(map);
  const wc = L.control({ position: 'topleft' });
  wc.onAdd = () => { const b = mk('button', 'mapbtn', 'Wheel zoom: off'); b.type = 'button'; L.DomEvent.on(b, 'click', e => { L.DomEvent.stop(e);
      if (map.scrollWheelZoom.enabled()) { map.scrollWheelZoom.disable(); b.textContent = 'Wheel zoom: off'; } else { map.scrollWheelZoom.enable(); b.textContent = 'Wheel zoom: on'; } }); return b; };
  wc.addTo(map);
  home();
}

// every table: click a heading to sort; long tables get a search box
function enhanceTables() {
  const num = t => { const x = String(t).replace(/[,$%\s]/g, '').replace(/[–—]/g, ''); return x !== '' && !isNaN(+x) ? +x : null; };
  document.querySelectorAll('main table, body > section table, section table').forEach(tb => {
    if (tb.dataset.done) return; tb.dataset.done = '1';
    const body = tb.tBodies[0]; if (!body) return;
    const rows = () => [...body.rows];
    [...(tb.tHead ? tb.tHead.rows[0].cells : [])].forEach((th, i) => {
      if (!th.textContent.trim()) return;
      th.classList.add('sortable'); th.title = 'Click to sort';
      th.onclick = () => {
        const dir = th.dataset.dir === 'asc' ? 'desc' : 'asc';
        tb.tHead.querySelectorAll('th').forEach(x => { delete x.dataset.dir; });
        th.dataset.dir = dir;
        const r = rows().sort((a, b) => { const A = a.cells[i]?.textContent || '', B = b.cells[i]?.textContent || ''; const na = num(A), nb = num(B);
          const c = (na !== null && nb !== null) ? na - nb : A.localeCompare(B, 'en', { numeric: true }); return dir === 'asc' ? c : -c; });
        r.forEach(x => body.appendChild(x));
      };
    });
    if (rows().length > 8) {
      const inp = mk('input', 'tfilter'); inp.type = 'search'; inp.placeholder = `Search these ${rows().length} rows…`;
      inp.oninput = () => { const q = inp.value.trim().toLowerCase(); rows().forEach(r => { r.hidden = !!q && !r.textContent.toLowerCase().includes(q); }); };
      tb.parentNode.insertBefore(inp, tb);
    }
  });
}

for (const v of VIS) {
  const el = document.getElementById(v.id); if (!el) continue;
  try { if (v.type === 'chart') makeChart(el, v); else if (v.type === 'map') makeMap(el, v); }
  catch (err) { el.innerHTML = '<p class="verr">This picture could not be drawn here (' + esc(err.message || err) + '). Its numbers are in the table and the Excel file.</p>'; }
}
enhanceTables();
const help = mk('div', 'ihelp', '<b>Interactive version.</b> Hover over charts and maps for exact values. Click a legend item to hide or show it, switch between bars and a line, narrow the period with From and To, or show the numbers. On maps: click a community to zoom in, use the boxes top-right to change the background or hide layers. Click any table heading to sort.');
const first = document.querySelector('header.band'); if (first) first.after(help);
'''
