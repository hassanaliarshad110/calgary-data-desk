"""Analysis reports from Data Genie: a study-style PDF with findings, charts, tables, method, every data source,
limits, recommendations and an action plan, plus an appendix listing every query that produced the figures.

Data Genie gathers and checks the data with its other tools, works the numbers out with calculate(), then calls
make_report with the finished content. This module only lays it out and prints it; it adds nothing of its own except
the record of what was queried (provenance), which the agent keeps while it works.
"""
import ast
import datetime as dt
import html
import json
import math
import os
import re

import newsletter
import viz
import xlsx

HERE = os.path.dirname(os.path.abspath(__file__))
VENDOR = os.path.join(HERE, 'ui', 'vendor')

PALETTE = ['#0B6BB5', '#F59E0B', '#64748B', '#16A34A', '#DC2626', '#7C3AED']


def e(v):
    return html.escape('' if v is None else str(v))


def _n(v, d=None):
    if not isinstance(v, (int, float)) or isinstance(v, bool) or (isinstance(v, float) and math.isnan(v)):
        return e(v)
    if d is None:
        d = 0 if float(v).is_integer() or abs(v) >= 100 else (1 if abs(v) >= 10 else 2)
    return f'{v:,.{d}f}'


# ================================================================================================ calculate
class CalcError(Exception):
    pass


def _mean(xs):
    xs = list(xs)
    return sum(xs) / len(xs) if xs else float('nan')


def _slope(ys):
    """Least-squares change per step of a series (e.g. per year)."""
    ys = [float(y) for y in ys]
    n = len(ys)
    if n < 2:
        raise CalcError('slope needs at least two values')
    mx, my = (n - 1) / 2, _mean(ys)
    return sum((i - mx) * (y - my) for i, y in enumerate(ys)) / sum((i - mx) ** 2 for i in range(n))


FUNCS = {
    'round': round, 'min': min, 'max': max, 'abs': abs, 'sum': sum, 'mean': _mean, 'sqrt': math.sqrt,
    'pct_change': lambda new, old: (new - old) / old * 100,
    'cagr': lambda first, last, years: ((last / first) ** (1 / years) - 1) * 100,
    'share': lambda part, whole: part / whole * 100,
    'per_1000': lambda count, people, months=12: count / people * 1000 * 12 / months,
    'slope': _slope,
}
OPS = {ast.Add: lambda a, b: a + b, ast.Sub: lambda a, b: a - b, ast.Mult: lambda a, b: a * b,
       ast.Div: lambda a, b: a / b, ast.Pow: lambda a, b: a ** b, ast.Mod: lambda a, b: a % b,
       ast.FloorDiv: lambda a, b: a // b}


def _eval(node, names):
    if isinstance(node, ast.Expression):
        return _eval(node.body, names)
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.Name):
        if node.id in names:
            return names[node.id]
        raise CalcError(f'unknown name "{node.id}" (define it in an earlier calculation)')
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.USub, ast.UAdd)):
        v = _eval(node.operand, names)
        return -v if isinstance(node.op, ast.USub) else v
    if isinstance(node, ast.BinOp) and type(node.op) in OPS:
        a, b = _eval(node.left, names), _eval(node.right, names)
        if isinstance(a, list) or isinstance(b, list):
            raise CalcError('use sum(), mean() or slope() on lists; arithmetic works on single numbers')
        if isinstance(node.op, ast.Pow) and abs(b) > 100:
            raise CalcError('power too large')
        return OPS[type(node.op)](a, b)
    if isinstance(node, (ast.List, ast.Tuple)):
        return [_eval(x, names) for x in node.elts]
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in FUNCS and not node.keywords:
        return FUNCS[node.func.id](*[_eval(a, names) for a in node.args])
    raise CalcError('only numbers, + - * / ** ( ), lists and these functions are allowed: ' + ', '.join(sorted(FUNCS)))


def calculate(calculations):
    """[{'name': 'rate', 'expression': '2496 / 135991 * 1000'}, ...] worked out in order; later ones can use earlier
    names. Returns each result, or the error for that line."""
    names, out = {}, []
    for c in calculations or []:
        name = re.sub(r'\W', '_', str(c.get('name') or f'v{len(out) + 1}'))
        expr = str(c.get('expression') or '')
        try:
            if len(expr) > 2000:
                raise CalcError('expression too long')
            v = _eval(ast.parse(expr, mode='eval'), names)
            names[name] = v
            out.append({'name': name, 'expression': expr, 'result': round(v, 6) if isinstance(v, float) else v})
        except (CalcError, SyntaxError, ZeroDivisionError, TypeError, ValueError, OverflowError) as ex:
            out.append({'name': name, 'expression': expr, 'error': str(ex) or type(ex).__name__})
    return {'results': out}


def _table(t, limit=300):
    cols = t.get('columns') or []
    rows = t.get('rows') or []
    if not cols:
        return ''
    num = [all(isinstance(r[i], (int, float)) or r[i] in (None, '') for r in rows if i < len(r)) and any(
        i < len(r) and isinstance(r[i], (int, float)) for r in rows) for i in range(len(cols))]
    def decimals(i):                               # the same number of decimals down a column (at most 2)
        ds = [0 if float(r[i]).is_integer() else min(2, len(repr(float(r[i])).split('.')[1]))
              for r in rows if i < len(r) and isinstance(r[i], (int, float)) and not isinstance(r[i], bool)]
        return max(ds or [0])
    dec = [decimals(i) if num[i] else None for i in range(len(cols))]
    head = ''.join(f'<th class="{"num" if num[i] else ""}">{e(c)}</th>' for i, c in enumerate(cols))
    body = ''.join('<tr>' + ''.join(f'<td class="{"num" if num[i] else ""}">{_n(r[i], dec[i]) if i < len(r) else ""}</td>'
                                    for i in range(len(cols))) + '</tr>' for r in rows[:limit])
    more = f'<p class="note">Showing {limit:,} of {len(rows):,} rows; the full table is in the Excel workbook.</p>' if len(rows) > limit else ''
    cap = f'<h4>{e(t["title"])}</h4>' if t.get('title') else ''
    return f'{cap}<div class="tbl"><table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>{more}'


def _paras(text):
    parts = [p.strip() for p in re.split(r'\n\s*\n', str(text or '')) if p.strip()]
    out = []
    for p in parts:
        lines = [x.strip() for x in p.split('\n') if x.strip()]
        if all(x.startswith(('- ', '* ', '• ')) for x in lines):
            out.append('<ul>' + ''.join(f'<li>{_inline(x[2:])}</li>' for x in lines) + '</ul>')
        else:
            out.append(f'<p>{_inline(" ".join(lines))}</p>')
    return ''.join(out)


def _inline(s):
    s = e(s)
    return re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)


def _items(xs):
    return ''.join(f'<li>{_inline(x)}</li>' for x in xs or [] if str(x).strip())


# ================================================================================================ the page
def section_visuals(sec):
    """Every chart, map and table in a section, in order: 'visuals' first, then the older single keys."""
    out = []
    for v in sec.get('visuals') or []:
        if isinstance(v, dict) and v.get('type') in ('chart', 'map', 'table'):
            out.append((v['type'], v))
    for key, typ in (('chart', 'chart'), ('map', 'map'), ('table', 'table')):
        if isinstance(sec.get(key), dict):
            out.append((typ, sec[key]))
    for key, typ in (('charts', 'chart'), ('maps', 'map'), ('tables', 'table')):
        out += [(typ, x) for x in sec.get(key) or [] if isinstance(x, dict)]
    return out


def collect(spec):
    """All visuals with ids, in report order: [{'id', 'type', 'spec', 'section'}]."""
    out, n = [], 0
    for i, sec in enumerate(spec.get('sections') or [], 1):
        for typ, v in section_visuals(sec):
            n += 1
            out.append({'id': f'v{n}', 'type': typ, 'spec': v, 'section': i})
    return out


def _figure(v, meta, interactive):
    sp, typ = v['spec'], v['type']
    head = f'<h4>{e(sp["title"])}</h4>' if sp.get('title') else ''
    if typ == 'table':
        return _table(sp, 3000 if interactive else 300)
    src = sp.get('source')
    if isinstance(src, dict):                      # map points fetched from a dataset: name it, not the query
        src = ('City of Calgary open data, dataset ' + str(src.get('dataset_id'))) if src.get('dataset_id') else (
            'Traffic incidents (City of Calgary open data)' if src.get('layer') else '')
    cap_bits = [sp.get('unit') or sp.get('value_label'), src if isinstance(src, str) else '']
    if interactive:
        note = ('Tap a community to zoom in, a point for details' if typ == 'map' else
                'Tap or hover for the exact numbers; tap a legend item to hide it')
        cap = ' · '.join(e(x) for x in cap_bits if x)
        cap += f'<span class="inote">{" · " if cap else ""}{e(note)}</span>'
        legend = ''
        if typ == 'map':
            got = viz.map_svg(sp, meta.get('geo'), meta.get('name_to_code') or {})
            legend = got[1] if got else ''
        return f'<figure class="keep">{head}<div class="ivis" id="{v["id"]}"></div><figcaption>{legend}{cap}</figcaption></figure>'
    got = viz.chart_svg(sp) if typ == 'chart' else viz.map_svg(sp, meta.get('geo'), meta.get('name_to_code') or {})
    if not got:
        return ''
    svg, legend = got
    cap = ' · '.join(e(x) for x in cap_bits if x)
    return f'<figure class="keep">{head}{svg}<figcaption>{legend}{cap}</figcaption></figure>'


def render(spec, provenance=None, meta=None, interactive=False, printable=False):
    """The report page: for the PDF (fixed pictures), or interactive (live charts and zoomable maps)."""
    meta = meta or {}
    prov = provenance or []
    title = str(spec.get('title') or 'Calgary Insight analysis').strip()
    today = meta.get('date') or dt.date.today().strftime('%B %d, %Y').replace(' 0', ' ')
    visuals = collect(spec)
    facts = [x for x in (meta.get('area'), today, meta.get('built')) if x]
    parts = [f'''<header class="top"><p class="brand">Calgary Insight</p>
  <h1>{e(title)}</h1>{f'<p class="sub">{e(spec.get("subtitle"))}</p>' if spec.get('subtitle') else ''}
  <p class="facts">{' <span>·</span> '.join(e(x) for x in facts)}</p></header>''']
    if spec.get('question'):
        parts.append(f'<p class="ask"><span>Question</span>{e(spec["question"])}</p>')
    if spec.get('summary'):
        cards = ''.join(f'<li><b class="n">{i}</b><div>{_inline(x)}</div></li>'
                        for i, x in enumerate([x for x in spec['summary'] if str(x).strip()], 1))
        parts.append(f'<section class="findings"><h2>Key findings</h2><ol class="cards">{cards}</ol></section>')
    for i, sec in enumerate(spec.get('sections') or [], 1):
        body = [f'<h2><span class="sn">{i}</span>{e(sec.get("heading") or "")}</h2>', _paras(sec.get('text'))]
        body += [_figure(v, meta, interactive) for v in visuals if v['section'] == i]
        if sec.get('note'):
            body.append(f'<p class="note">{_inline(sec["note"])}</p>')
        parts.append(f'<section>{"".join(body)}</section>')
    recs = [r for r in spec.get('recommendations') or [] if isinstance(r, dict)]
    if recs:
        def rec_row(i, r):
            ev = f'<br><span class="ev">Based on: {e(r["evidence"])}</span>' if r.get('evidence') else ''
            pri = str(r.get('priority') or '')
            return (f'<tr><td class="no">{i}</td><td><b>{e(r.get("title"))}</b><br>{_inline(r.get("detail") or "")}{ev}</td>'
                    f'<td><span class="pri {e(pri.lower())}">{e(pri.capitalize())}</span></td></tr>')
        rows = ''.join(rec_row(i, r) for i, r in enumerate(recs, 1))
        parts.append(f'<section><h2>Options to consider</h2><div class="tbl"><table class="recs"><thead><tr><th></th><th>Option</th>'
                     f'<th>Priority</th></tr></thead><tbody>{rows}</tbody></table></div></section>')
    plan = [a for a in spec.get('action_plan') or [] if isinstance(a, dict)]
    if plan:
        rows = ''.join(f'<tr><td>{_inline(a.get("action") or "")}</td><td>{e(a.get("owner"))}</td>'
                       f'<td>{_inline(a.get("measure") or "")}</td></tr>' for a in plan)
        parts.append(f'<section><h2>Next steps</h2><div class="tbl"><table><thead><tr><th>Step</th><th>Who</th>'
                     f'<th>How we will know</th></tr></thead><tbody>{rows}</tbody></table></div></section>')
    if spec.get('method') or meta.get('population'):
        extra = f'<li>Residents: {e(meta["population"])}</li>' if meta.get('population') else ''
        parts.append(f'<section class="small"><h2>How this was worked out</h2><ol>{_items(spec.get("method"))}{extra}</ol></section>')
    srcs = [s for s in spec.get('data_sources') or [] if isinstance(s, dict)]
    if srcs:
        rows = []
        for s in srcs:
            url = s.get('url') or (f'https://data.calgary.ca/d/{s["dataset_id"]}' if s.get('dataset_id') else '')
            link = f'<br><a href="{e(url)}">{e(url)}</a>' if url else ''
            ds = f' ({e(s["dataset_id"])})' if s.get('dataset_id') else ''
            rows.append(f'<tr><td><b>{e(s.get("name"))}</b>{ds}{link}</td>'
                        f'<td>{e(s.get("publisher"))}</td><td>{e(s.get("period"))}</td><td>{_inline(s.get("notes") or "")}</td></tr>')
        parts.append(f'<section class="small"><h2>Data sources</h2><div class="tbl"><table class="srcs"><thead><tr><th>Source</th><th>Publisher</th>'
                     f'<th>Period used</th><th>Notes</th></tr></thead><tbody>{"".join(rows)}</tbody></table></div></section>')
    if spec.get('limitations'):
        parts.append(f'<section class="small"><h2>What this cannot tell you</h2><ul>{_items(spec["limitations"])}</ul></section>')
    if prov:
        rows = ''.join(f'<tr><td class="no">{i}</td><td>{e(p.get("what"))}</td><td class="code">{e(p.get("detail"))}</td>'
                       f'<td>{e(p.get("result"))}</td><td>{e(p.get("at"))}</td></tr>' for i, p in enumerate(prov, 1))
        table = (f'<div class="tbl"><table class="prov"><thead><tr><th></th><th>Step</th><th>Query or source</th><th>Result</th>'
                 f'<th>Time</th></tr></thead><tbody>{rows}</tbody></table></div>')
        intro = ('<p class="note">Every data request made for this report, in order. Anyone can repeat them on '
                 'data.calgary.ca, or with the files named here, to check the figures.</p>')
        parts.append(f'<section class="appendix small"><details><summary><h2>Appendix: every data request ({len(prov)})</h2></summary>{intro}{table}</details></section>'
                     if interactive else f'<section class="appendix small"><h2>Appendix: every data request</h2>{intro}{table}</section>')
    parts.append(f'''<footer>Made from public data: City of Calgary open data and the other sources listed above
  ({e(meta.get('built') or today)}). Check key figures against the sources before quoting them in public. Options are
  ideas to consider, not City policy.</footer>''')
    page = PAGE.replace('{{TITLE}}', e(title)).replace('{{BODY}}', '\n'.join(parts))
    page = page.replace('</head>', _font_css() + '</head>', 1)
    bar = ('<div class="pdfbar"><button type="button" onclick="window.print()">Save as PDF</button>'
           '<span>Opens your browser\'s print window: choose "Save as PDF".</span></div>')
    auto = ('<script>if(location.hash==="#print"){addEventListener("load",function(){setTimeout(function(){'
            'window.print()},1500)})}</script>')
    if printable and not interactive:            # the light print page (no live charts or maps), for browsers
        page = page.replace('</head>', '<style>' + PRINT_BAR_CSS + '</style></head>', 1)
        page = page.replace('<body><div class="wrap">', '<body><div class="wrap">' + bar, 1).replace('</body>', auto + '</body>')
    if interactive:
        page = page.replace('<body><div class="wrap">', '<body><div class="wrap">' + bar, 1).replace('</body>', auto + '</body>')
        page = page.replace('</head>', _vendor_head() + '</head>').replace(
            '</body>', '<script>' + viz.SCRIPT.replace('__DATA__', json.dumps(viz.interactive_data(
                visuals, meta.get('geo'), meta.get('name_to_code') or {})).replace('</', '<\\/')) + '</script></body>')
    if meta.get('theme') == 'dark':              # the website's dark look (PDF and web page alike)
        page = page.replace('</head>', '<style>' + DARK_CSS + '</style>'
                            + ('<script>if(window.Chart){Chart.defaults.color="#CBD5E1";Chart.defaults.borderColor="rgba(148,163,184,.18)"}</script>'
                               if interactive else '') + '</head>')
    return page


DARK_CSS = '''
html, body { background: #020617 !important; color: #CBD5E1; }
.wrap { background: #0B1220 !important; box-shadow: none !important; border: 1px solid #1E293B; }
@page { margin: 0; }
@media print { html, body { margin: 0; } .wrap { border: 0; max-width: none; padding: 14mm 14mm 16mm; -webkit-box-decoration-break: clone; box-decoration-break: clone; } }
.top { border-bottom-color: #1E293B; } .brand { color: #38BDF8; }
.top h1, h2, b, .cards b { color: #F8FAFC; } h4 { color: #E2E8F0; }
.sub { color: #94A3B8; } .facts { color: #64748B; } .facts span { color: #334155; }
.ask { background: #0F172A; color: #CBD5E1; border: 1px solid #1E293B; } .ask span { color: #64748B; }
.sn { background: #0C4A6E; color: #E0F2FE; }
.cards li { background: #0F172A; border-color: #1E293B; } .cards .n { background: #0284C7; }
figure { border-color: #1E293B; background: #0F172A; } figcaption, .note, .ev, footer { color: #94A3B8; }
footer { border-top-color: #1E293B; }
svg .grid { stroke: #1E293B; } svg .ax { fill: #94A3B8; } svg .lbl { fill: #CBD5E1; } svg .val { fill: #F8FAFC; }
svg .maplbl { fill: #F8FAFC; stroke: #0B1220; }
th { background: #111C30; color: #94A3B8; } td { border-bottom-color: #1E293B; }
tbody tr:nth-child(even) td { background: #0E1729; } td.no { color: #64748B; }
.pri { background: #1E293B; color: #CBD5E1; } .pri.high { background: #450A0A; color: #FCA5A5; }
.pri.medium { background: #451A03; color: #FCD34D; } .pri.low { background: #052E16; color: #86EFAC; }
.small { color: #CBD5E1; } .srcs a, a { color: #38BDF8; }
.pdfbar { color: #94A3B8; } .pdfbar button { background: #0284C7; }
.vtools button, .vtools select { background: #0F172A; color: #E2E8F0; border-color: #334155; }
.vtools .seg button.on { background: #0284C7; border-color: #0284C7; color: #fff; }
.ihelp { background: #0C1A33; border-color: #1E3A5F; color: #BFDBFE; }
.maplegend, .mapbtn { background: #0F172A; color: #E2E8F0; border-color: #334155; }
.vdata table, .vdata th, .vdata td { color: #CBD5E1; }
details summary h2::after { color: #64748B; }
'''


PRINT_BAR_CSS = ('.pdfbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:-8px 0 16px;font-size:12.5px;color:#6B7280}'
                 '.pdfbar button{font:inherit;font-size:13px;font-weight:600;padding:7px 14px;border:0;border-radius:8px;'
                 'background:#0F766E;color:#fff;cursor:pointer}@media print{.pdfbar{display:none}}')

INTERACTIVE_CSS = '''
.ivis{width:100%;min-height:240px;margin:4px 0}
.vtools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:2px 0 8px;font-size:12.5px}
.vtools .grow{flex:1}
.vtools button,.vtools select{font:inherit;font-size:12.5px;padding:4px 10px;border:1px solid #CBD5E1;border-radius:6px;background:#fff;color:#0F172A;cursor:pointer}
.vtools button:hover{border-color:#0B6BB5;color:#0B6BB5}
.vtools .seg{display:inline-flex}.vtools .seg button{border-radius:0;margin-left:-1px}.vtools .seg button:first-child{border-radius:6px 0 0 6px;margin:0}
.vtools .seg button:last-child{border-radius:0 6px 6px 0}.vtools .seg button.on{background:#0B6BB5;border-color:#0B6BB5;color:#fff}
.vtools .range{display:inline-flex;gap:6px;align-items:center;color:#475569}
.vbox{position:relative;width:100%}
.vdata{max-height:320px;overflow:auto;margin-top:8px}
.ihelp{margin:12px 0 4px;padding:10px 14px;border-radius:8px;background:#EFF6FF;border:1px solid #BFDBFE;font-size:13px;line-height:1.5;color:#1E3A8A}
.maplegend{background:#fff;padding:8px 10px;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.25);font-size:12px;line-height:1.5}
.maplegend b{display:block;margin-bottom:2px}.maplegend i{display:inline-block;width:14px;height:12px;margin-right:6px;vertical-align:-1px;border-radius:2px}
.mapbtn{display:block;background:#fff;border:2px solid rgba(0,0,0,.2);border-radius:4px;padding:4px 8px;font-size:12px;line-height:1.3;cursor:pointer;margin-bottom:4px}
.mapbtn:hover{background:#F1F5F9}
.leaflet-control-layers{font-size:12px}
th.sortable{cursor:pointer;user-select:none}th.sortable:hover{color:#0B6BB5}
th[data-dir=asc]::after{content:" \\25B2";font-size:9px}th[data-dir=desc]::after{content:" \\25BC";font-size:9px}
.tfilter{display:block;width:100%;max-width:340px;margin:6px 0;padding:6px 10px;border:1px solid #CBD5E1;border-radius:6px;font:inherit;font-size:13px}
.verr{color:#B91C1C;font-size:13px}
.pdfbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:-8px 0 16px;font-size:12.5px;color:#6B7280}
.pdfbar button{font:inherit;font-size:13px;font-weight:600;padding:7px 14px;border:0;border-radius:8px;background:#0F766E;color:#fff;cursor:pointer}
@media print{.vtools,.ihelp,.tfilter,.leaflet-control-container,.pdfbar,.inote{display:none}}
'''


FONTS = (('fira-sans-regular.woff', 400), ('fira-sans-semibold.woff', 600), ('fira-sans-bold.woff', 700))


def _font_css():
    """Fira Sans (the app's own typeface, SIL Open Font License) embedded in the page, so every report looks the same
    on any computer: Windows' Segoe UI draws a lowercase l as a plain bar that reads like a capital I or a 1."""
    import base64
    out = []
    for name, weight in FONTS:
        try:
            with open(os.path.join(VENDOR, name), 'rb') as f:
                data = base64.b64encode(f.read()).decode('ascii')
            out.append(f"@font-face{{font-family:'Fira Sans';font-weight:{weight};font-style:normal;"
                       f"src:url(data:font/woff;base64,{data}) format('woff')}}")
        except OSError:
            pass
    return '<style>' + ''.join(out) + '</style>' if out else ''


def _vendor_head():
    """Leaflet and Chart.js inlined, so the interactive page works anywhere (map tiles still need the internet)."""
    out = []
    for name, tag in (('leaflet.css', 'style'), ('leaflet.js', 'script'), ('chart.umd.min.js', 'script')):
        try:
            with open(os.path.join(VENDOR, name), encoding='utf-8') as f:
                body = f.read().replace('</script', '<\\/script')
                out.append('<' + tag + '>' + body + '</' + tag + '>')
        except OSError:
            pass
    return '\n'.join(out) + '<style>' + INTERACTIVE_CSS + '</style>'


def safe_name(name):
    s = re.sub(r'[^\w\- .,()]+', ' ', str(name or 'Analysis')).strip(' .')
    return re.sub(r'\s+', ' ', s)[:90] or 'Analysis'


def workbook_sheets(spec, provenance, meta):
    """The Excel workbook: about, every table, the data behind every chart and map, recommendations, plan, sources."""
    visuals = collect(spec)
    about = [['Report', spec.get('title') or ''], ['Question', spec.get('question') or ''],
             ['Made', meta.get('date') or ''], ['Area', meta.get('area') or ''],
             ['Residents counted with', meta.get('population') or ''], ['Data', meta.get('built') or ''], [], ['Summary']]
    about += [['', x] for x in spec.get('summary') or []]
    about += [[], ['How this was worked out']] + [['', x] for x in spec.get('method') or []]
    about += [[], ['Limits']] + [['', x] for x in spec.get('limitations') or []]
    about += [[], ['Made from public data (City of Calgary open data and the other sources listed); check key figures before quoting them.']]
    sheets = [('About', about, False)]
    for v in visuals:
        sp, t = v['spec'], (v['spec'].get('title') or v['id'])
        if v['type'] == 'table':
            sheets.append((t, [sp.get('columns') or []] + [list(r) for r in sp.get('rows') or []]))
        elif v['type'] == 'chart' and sp.get('kind') == 'scatter':
            rows = [['Series', 'Label', sp.get('x_label') or 'x', sp.get('y_label') or 'y']]
            rows += [[s_.get('name'), p.get('label'), p.get('x'), p.get('y')] for s_ in sp.get('series') or [] for p in s_.get('points') or []]
            sheets.append((f'Chart - {t}', rows))
        elif v['type'] == 'chart':
            ser = [s_ for s_ in sp.get('series') or [] if isinstance(s_, dict)]
            rows = [[''] + [s_.get('name') or 'Value' for s_ in ser]]
            for i, lab in enumerate(sp.get('labels') or []):
                rows.append([lab] + [(s_.get('values') or [None] * (i + 1))[i] if i < len(s_.get('values') or []) else None for s_ in ser])
            sheets.append((f'Chart - {t}', rows))
        elif v['type'] == 'map':
            n2c = meta.get('name_to_code') or {}
            names = {c: n.title() for n, c in n2c.items()}
            vals = viz.map_values(sp, n2c)
            if vals:
                sheets.append((f'Map - {t}', [['Community', 'Code', sp.get('value_label') or 'Value']] +
                               [[names.get(c, c), c, x] for c, x in sorted(vals.items(), key=lambda kv: -kv[1])]))
            pts = [p for p in sp.get('points') or [] if isinstance(p, dict)]
            if pts:
                sheets.append((f'Points - {t}', [['Label', 'Latitude', 'Longitude', 'Value']] +
                               [[p.get('label'), p.get('lat'), p.get('lon'), p.get('value')] for p in pts]))
    recs = [r for r in spec.get('recommendations') or [] if isinstance(r, dict)]
    if recs:
        sheets.append(('Recommendations', [['#', 'Recommendation', 'Detail', 'Based on', 'Priority']] +
                       [[i, r.get('title'), r.get('detail'), r.get('evidence'), r.get('priority')] for i, r in enumerate(recs, 1)]))
    plan = [a for a in spec.get('action_plan') or [] if isinstance(a, dict)]
    if plan:
        sheets.append(('Action plan', [['Action', 'Who', 'How we will know']] +
                       [[a.get('action'), a.get('owner'), a.get('measure')] for a in plan]))
    srcs = [x for x in spec.get('data_sources') or [] if isinstance(x, dict)]
    if srcs:
        sheets.append(('Sources', [['Source', 'Dataset', 'Publisher', 'Period used', 'Link', 'Notes']] +
                       [[x.get('name'), x.get('dataset_id'), x.get('publisher'), x.get('period'),
                         x.get('url') or (f"https://data.calgary.ca/d/{x['dataset_id']}" if x.get('dataset_id') else ''), x.get('notes')] for x in srcs]))
    if provenance:
        sheets.append(('Queries', [['#', 'Step', 'Query or source', 'Result', 'Time']] +
                       [[i, p.get('what'), p.get('detail'), p.get('result'), p.get('at')] for i, p in enumerate(provenance, 1)]))
    return sheets


def make(spec, provenance, folder, meta=None, to_pdf=None):
    """Lay out the report and save three files in folder: the PDF, an interactive web page (live charts, zoomable
    maps) and an Excel workbook with every table and the data behind every chart and map.
    Returns {'path' (PDF, or the web page if the PDF failed), 'name', 'interactive', 'xlsx', 'visuals', 'warning'}."""
    meta = meta or {}
    os.makedirs(folder, exist_ok=True)
    stem = safe_name(spec.get('file_name') or spec.get('title'))
    stem = f'{stem} ({meta.get("day") or dt.date.today().isoformat()})'
    base, n = os.path.join(folder, stem), 2
    while any(os.path.exists(base + x) for x in ('.pdf', ' (interactive).html', ' (print).html', '.xlsx')):
        base = os.path.join(folder, f'{stem} ({n})')
        n += 1
    inter = base + ' (interactive).html'
    with open(inter, 'w', encoding='utf-8') as f:
        f.write(render(spec, provenance, meta, interactive=True))
    xpath = None
    try:
        xpath = xlsx.write(base + '.xlsx', workbook_sheets(spec, provenance, meta))
    except Exception:                             # noqa: BLE001 - the PDF and web page still stand
        xpath = None
    pdf, warn, printable = None, None, None
    try:
        pdf = (to_pdf or newsletter.to_pdf)(render(spec, provenance, meta), base + '.pdf')
        if pdf and (not os.path.exists(pdf) or os.path.getsize(pdf) < 1000):
            pdf = None                            # an empty file is no PDF
    except Exception:                             # noqa: BLE001 - no browser here (the website): the print page below
        pdf = None
    if not pdf:
        # the same report as a light page (charts and maps drawn in, nothing live), which the browser prints to PDF
        # reliably; the interactive page, with its live charts and maps, is too heavy to print well
        printable = base + ' (print).html'
        with open(printable, 'w', encoding='utf-8') as f:
            f.write(render(spec, provenance, meta, printable=True))
    path = pdf or printable
    return {'path': path, 'name': os.path.basename(path), 'interactive': inter, 'xlsx': xpath, 'print': printable,
            'visuals': len(collect(spec)), 'warning': warn}


PAGE = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{TITLE}}</title>
<style>
@page { size: Letter; margin: 14mm 14mm 16mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; -webkit-text-size-adjust: 100%; }
body { margin: 0; font: 10.5pt/1.6 "Fira Sans", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #1F2937; background: #fff; }
.wrap { max-width: 820px; margin: 0 auto; }
.top { padding: 4px 0 14px; border-bottom: 1px solid #E5E7EB; margin-bottom: 16px; }
.brand { margin: 0 0 10px; font-size: 8.5pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #0F766E; }
.top h1 { margin: 0 0 6px; font-size: 22pt; line-height: 1.2; color: #111827; letter-spacing: -.01em; }
.sub { margin: 0 0 6px; font-size: 12pt; color: #4B5563; }
.facts { margin: 0; font-size: 9pt; color: #6B7280; } .facts span { margin: 0 6px; color: #D1D5DB; }
.ask { margin: 0 0 18px; padding: 10px 14px; background: #F9FAFB; border-radius: 8px; font-size: 10pt; color: #374151; }
.ask span { display: block; font-size: 8pt; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #9CA3AF; margin-bottom: 2px; }
h2 { display: flex; align-items: center; gap: 10px; font-size: 14pt; line-height: 1.3; margin: 26px 0 10px; color: #111827; break-after: avoid; }
.sn { flex: none; display: inline-grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: #CCFBF1; color: #115E59; font-size: 10pt; font-weight: 700; }
h4 { font-size: 10pt; margin: 12px 0 6px; color: #374151; break-after: avoid; }
p { margin: 0 0 9px; } ul, ol { margin: 4px 0 10px; padding-left: 20px; } li { margin: 3px 0; }
b { color: #111827; }
.findings h2 { margin-top: 6px; }
.cards { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.cards li { display: flex; gap: 10px; margin: 0; padding: 12px 14px; border: 1px solid #E5E7EB; border-radius: 10px; background: #fff; break-inside: avoid; }
.cards .n { flex: none; display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 6px; background: #0F766E; color: #fff; font-size: 9pt; }
.keep, figure, tr { break-inside: avoid; }
figure { margin: 10px 0 14px; padding: 12px 14px; border: 1px solid #E5E7EB; border-radius: 10px; }
figure h4 { margin-top: 0; }
figcaption { font-size: 8.5pt; color: #6B7280; margin-top: 4px; }
.legend span { margin-right: 12px; white-space: nowrap; } .legend i { display: inline-block; width: 9px; height: 9px; border-radius: 2px; margin-right: 4px; vertical-align: -1px; }
svg.chart { width: 100%; height: auto; } svg .maplbl { font-size: 7pt; fill: #111827; paint-order: stroke; stroke: #fff; stroke-width: 2.5px; } svg .mapval { font-weight: 700; } svg .grid { stroke: #E5E7EB; } svg .ax { font: 8pt "Fira Sans", system-ui, "Segoe UI", Arial; fill: #6B7280; }
svg .lbl { fill: #374151; } svg .val { fill: #111827; font-weight: 600; }
.tbl { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 4px 0 10px; }
table { width: 100%; border-collapse: collapse; font-size: 9pt; }
th { text-align: left; font-size: 8pt; font-weight: 700; color: #4B5563; background: #F3F4F6; padding: 6px 8px; vertical-align: bottom; }
th:first-child { border-radius: 6px 0 0 6px; } th:last-child { border-radius: 0 6px 6px 0; }
td { border-bottom: 1px solid #F3F4F6; padding: 6px 8px; vertical-align: top; }
tbody tr:nth-child(even) td { background: #FAFAFA; }
.num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; } td.no { color: #9CA3AF; width: 22px; }
.recs td:last-child { width: 80px; } .ev { color: #6B7280; font-size: 8.3pt; }
.pri { font-size: 8pt; font-weight: 700; padding: 2px 8px; border-radius: 9px; background: #F3F4F6; color: #4B5563; }
.pri.high { background: #FEE2E2; color: #991B1B; } .pri.medium { background: #FEF3C7; color: #92400E; } .pri.low { background: #DCFCE7; color: #166534; }
.small { font-size: 9.5pt; color: #374151; } .small h2 { font-size: 12pt; }
.srcs a { color: #0F766E; word-break: break-all; font-size: 8pt; }
.prov td { font-size: 7.8pt; } .prov .code { font-family: Consolas, "Courier New", monospace; word-break: break-all; }
details summary { cursor: pointer; list-style: none; } details summary h2 { display: inline-flex; margin: 0; }
details summary::-webkit-details-marker { display: none; } details summary h2::after { content: " +"; color: #9CA3AF; }
details[open] summary h2::after { content: " \\2212"; }
.note { font-size: 8.5pt; color: #6B7280; }
footer { margin-top: 22px; border-top: 1px solid #E5E7EB; padding-top: 8px; font-size: 8pt; color: #6B7280; }
@media screen { body { background: #F3F4F6; } .wrap { background: #fff; padding: 40px 48px; margin: 16px auto; border-radius: 12px; box-shadow: 0 1px 3px rgba(17,24,39,.08); } }
@media screen and (max-width: 700px) {
  body { font-size: 15px; }
  .wrap { margin: 0; padding: 20px 16px 28px; border-radius: 0; box-shadow: none; }
  .top h1 { font-size: 24px; } .sub { font-size: 16px; }
  .cards { grid-template-columns: 1fr; }
  h2 { font-size: 19px; }
  figure { padding: 10px; margin-left: -4px; margin-right: -4px; }
  table { font-size: 13px; } th { font-size: 12px; }
  .num { white-space: nowrap; }
}
@media print { details > *:not(summary) { display: block; } details summary h2::after { content: ""; } }
</style></head>
<body><div class="wrap">
{{BODY}}
</div></body></html>'''
