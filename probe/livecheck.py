"""The corrected UI (probe/newui: the preview's index.html, styles, script bundle, search and visit data) served over the
live site's data, then axe-core on every screen at phone and desktop width, the banned-word scan on every screen's text,
and page errors; in the top-bar layout. Writes axe_live.json."""
import json, os, re, subprocess, sys
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
NEW = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'newui')
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'playwright'], check=True)
subprocess.run([sys.executable, '-m', 'playwright', 'install', '--with-deps', 'chromium'], check=True)
subprocess.run('npm i -s axe-core@4.10.2 >/dev/null 2>&1', shell=True, cwd=out)
AXE = open(os.path.join(out, 'node_modules', 'axe-core', 'axe.min.js'), encoding='utf-8').read()
subprocess.run('rm -rf node_modules package.json package-lock.json', shell=True, cwd=out)
from playwright.sync_api import sync_playwright
def serve(url):
    path = re.sub(r'^https://calgaryinsight\.ca/', '', url).split('?')[0] or 'index.html'
    if path.endswith('/'): path += 'index.html'
    f = os.path.join(NEW, path)
    return f if os.path.isfile(f) else None
BAD = re.compile(r"\b(free|supersonic|nobody has counted|riding|data desk|canada insight|app|claude|anthropic|openai|gpt|sonnet|opus|undefined|NaN|null)\b|\[object Object\]|Infinity|\$\{|\{\{", re.I)
report = {'axe': {}, 'text': {}, 'errors': {}, 'search': {}}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    for w, h, name in ((1440, 1000, 'desktop'), (390, 844, 'phone')):
        ctx = b.new_context(viewport={'width': w, 'height': h})
        p = ctx.new_page(); errs = []
        p.on('pageerror', lambda e: errs.append(str(e)[:200]))
        p.on('console', lambda m: errs.append('console: ' + m.text[:200]) if m.type == 'error' else None)
        p.goto('https://calgaryinsight.ca/', wait_until='networkidle', timeout=240000); p.wait_for_timeout(4000)
        p.add_script_tag(content=AXE)
        views = p.evaluate("[...document.querySelectorAll('section.view[id^=view-]')].map(s => s.id.slice(5))")
        for v in views:
            p.evaluate(f"show('{v}')"); p.wait_for_timeout(3500)
            n_sub = p.evaluate(f"[...document.querySelectorAll('#view-{v} .topbar [role=radio], #view-{v} .topbar .seg button, #view-{v} .el-subtab')].length")
            texts, axe_v = [], {}
            for i in range(max(1, min(n_sub, 8))):
                if n_sub:
                    p.evaluate(f"[...document.querySelectorAll('#view-{v} .topbar [role=radio], #view-{v} .topbar .seg button, #view-{v} .el-subtab')][{i}].click()"); p.wait_for_timeout(2000)
                texts.append(p.evaluate(f"(document.querySelector('#view-{v}') || {{}}).innerText || ''"))
                try:
                    res = p.evaluate(f"axe.run(document.querySelector('#view-{v}'), {{resultTypes: ['violations']}})")
                    for vio in res.get('violations', []):
                        e = axe_v.setdefault(vio['id'], {'impact': vio.get('impact'), 'help': vio.get('help'), 'nodes': 0, 'examples': []})
                        e['nodes'] += len(vio.get('nodes', []))
                        for n in vio.get('nodes', [])[:2]:
                            if len(e['examples']) < 4: e['examples'].append((n.get('target') or [''])[0][:120])
                except Exception as ex:
                    axe_v['_error'] = str(ex)[:200]
            hits = {}
            for t in texts:
                for m in BAD.finditer(t):
                    k = m.group(0).lower(); hits[k] = hits.get(k, 0) + 1
                    if k == 'app' or k == 'free': hits.setdefault('_ctx_' + k, []).append(t[max(0, m.start() - 60):m.end() + 40].replace('\n', ' '))
            report['axe'].setdefault(name, {})[v] = axe_v
            report['text'].setdefault(name, {})[v] = hits
        # the site search and the navigation menus
        try:
            p.evaluate("show('dashboard')"); p.wait_for_timeout(500)
            res = p.evaluate("axe.run(document.querySelector('.side'), {resultTypes: ['violations']})")
            report['axe'][name]['_nav'] = {vio['id']: {'impact': vio.get('impact'), 'help': vio.get('help'), 'nodes': len(vio.get('nodes', []))} for vio in res.get('violations', [])}
            p.keyboard.press('Control+k'); p.wait_for_timeout(300); p.keyboard.type('sadd'); p.wait_for_timeout(1500)
            report['search'][name] = p.evaluate("[...document.querySelectorAll('#ss-results .ss-row b')].map(b => b.textContent).slice(0, 5)")
            res = p.evaluate("axe.run(document.querySelector('#site-search'), {resultTypes: ['violations']})")
            report['axe'][name]['_search'] = {vio['id']: {'impact': vio.get('impact'), 'help': vio.get('help'), 'nodes': len(vio.get('nodes', []))} for vio in res.get('violations', [])}
        except Exception as ex:
            report['search'][name] = str(ex)[:200]
        report['errors'][name] = errs[:40]
        ctx.close()
    b.close()
json.dump(report, open(os.path.join(out, 'axe_live.json'), 'w'), indent=1)
tot = sum(len([k for k in v if not k.startswith('_')]) for d in report['axe'].values() for v in d.values())
print('axe violation kinds over all screens:', tot)
for name, d in report['axe'].items():
    for v, vio in d.items():
        if vio: print(name, v, json.dumps(vio)[:300])
for name, d in report['text'].items():
    for v, hits in d.items():
        if hits: print('TEXT', name, v, json.dumps(hits)[:400])
print('search', report['search']); print('errors', json.dumps(report['errors'])[:800])
import urllib.request
for u in ('', 'about/', 'sitemap.xml', 'robots.txt', 'data/visit.json', 'data/search.json'):
    try:
        r = urllib.request.urlopen('https://calgaryinsight.ca/' + u, timeout=60); print('URL', u or '/', r.getcode(), len(r.read()))
    except Exception as e: print('URL', u, 'ERR', e)
with sync_playwright() as pw:
    b = pw.chromium.launch(); p = b.new_page(viewport={'width': 1440, 'height': 1000})
    p.goto('https://calgaryinsight.ca/', wait_until='networkidle', timeout=240000); p.wait_for_timeout(3000)
    print('LIVE topnav', p.evaluate("document.documentElement.classList.contains('topnav')"), 'tabs', p.evaluate("document.querySelectorAll('.tab[data-view]').length"))
    p.evaluate("show('visit')"); p.wait_for_timeout(6000)
    print('LIVE visit', p.evaluate("({canvas: document.querySelectorAll('#view-visit canvas').length, tiles: document.querySelectorAll('#view-visit .leaflet-tile').length, text: document.querySelector('#view-visit').innerText.slice(0,200)})"))
    b.close()
