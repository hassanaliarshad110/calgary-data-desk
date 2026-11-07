"""Full audit of the live site: data files (for number checks at home), the visible text of every screen (banned words,
broken values), axe-core accessibility on every screen at phone and desktop width, page weight and timings, response
headers, console errors and failed requests."""
import gzip, json, os, re, subprocess, sys, time, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
SITE = 'https://calgaryinsight.ca/'
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'playwright'], check=True)
subprocess.run([sys.executable, '-m', 'playwright', 'install', '--with-deps', 'chromium'], check=True)
subprocess.run('npm i -s axe-core@4.10.2 >/dev/null 2>&1', shell=True, cwd=out)
AXE = open(os.path.join(out, 'node_modules', 'axe-core', 'axe.min.js'), encoding='utf-8').read()
subprocess.run('rm -rf node_modules package.json package-lock.json', shell=True, cwd=out)
from playwright.sync_api import sync_playwright
UA = {'User-Agent': 'CalgaryInsight audit', 'Accept-Encoding': 'gzip'}
# ---- 1. data files, gzipped
os.makedirs(os.path.join(out, 'data', 'model'), exist_ok=True); os.makedirs(os.path.join(out, 'data', 'city_actual'), exist_ok=True); os.makedirs(os.path.join(out, 'data', 'missing'), exist_ok=True)
files = ['data/built.json', 'data/settings.json', 'data/methods.json', 'data/budget.json', 'data/business.json', 'data/business_people.json', 'data/infra.json',
         'data/capmkt.json', 'data/accountability.json', 'data/safety_rank.json', 'data/tax.json', 'data/transit.json', 'data/analyst_topics.json', 'data/live.json',
         'data/elections.json', 'data/srg_raw.json', 'data/majorprojects.json', 'data/planned.json'] + \
        [f'data/{m}/w{w}.json' for m in ('model', 'city_actual') for w in range(15)] + [f'data/missing/w{w}.json' for w in range(15)]
heads = {}
for f in files:
    try:
        r = urllib.request.urlopen(urllib.request.Request(SITE + f, headers=UA), timeout=300)
        raw = r.read(); enc = r.headers.get('Content-Encoding')
        body = gzip.decompress(raw) if enc == 'gzip' else raw
        heads[f] = {'status': r.status, 'encoding': enc, 'wire_bytes': len(raw), 'bytes': len(body), 'cache_control': r.headers.get('Cache-Control'), 'last_modified': r.headers.get('Last-Modified')}
        with gzip.open(os.path.join(out, f + '.gz'), 'wb') as g:
            g.write(body)
    except Exception as e:
        heads[f] = {'error': str(e)[:120]}
for f in ['', 'app.js', 'styles.css', 'extra.js', 'logo.svg', 'vendor/leaflet.js', 'about/']:
    try:
        r = urllib.request.urlopen(urllib.request.Request(SITE + f, headers=UA), timeout=120); raw = r.read()
        heads[f or 'index.html'] = {'status': r.status, 'encoding': r.headers.get('Content-Encoding'), 'wire_bytes': len(raw), 'cache_control': r.headers.get('Cache-Control'), 'content_type': r.headers.get('Content-Type')}
    except Exception as e:
        heads[f or 'index.html'] = {'error': str(e)[:120]}
json.dump(heads, open(os.path.join(out, 'headers.json'), 'w'), indent=1)
# ---- 2-6. the screens
BAD = re.compile(r"\b(free|supersonic|nobody has counted|riding|data desk|canada insight|app|claude|anthropic|openai|gpt|sonnet|opus|undefined|NaN|null)\b|\[object Object\]|Infinity|\$\{|\{\{", re.I)
report = {'text': {}, 'axe': {}, 'perf': {}, 'errors': {}}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    # performance: cold load at desktop and phone
    for w, h, name in ((1440, 1000, 'desktop'), (390, 844, 'phone')):
        ctx = b.new_context(viewport={'width': w, 'height': h})
        p = ctx.new_page()
        t0 = time.time()
        p.goto(SITE + '?v=' + str(int(t0)), wait_until='networkidle', timeout=240000)
        idle = time.time() - t0
        p.wait_for_timeout(3000)
        perf = p.evaluate("""() => {
          const nav = performance.getEntriesByType('navigation')[0] || {};
          const res = performance.getEntriesByType('resource');
          const by = {};
          for (const r of res) { const k = /\\.(js)(\\?|$)/.test(r.name) ? 'js' : /\\.(css)(\\?|$)/.test(r.name) ? 'css' : /\\.(json)(\\?|$)/.test(r.name) ? 'json' : /\\.(png|jpg|jpeg|svg|webp|gif|ico)(\\?|$)/.test(r.name) ? 'image' : /\\.(woff2?|ttf)(\\?|$)/.test(r.name) ? 'font' : /tile|openstreetmap|arcgis|basemap/.test(r.name) ? 'map tiles' : /\\.(mp4|webm)(\\?|$)/.test(r.name) ? 'video' : 'other';
            by[k] = by[k] || { n: 0, wire: 0, size: 0 }; by[k].n++; by[k].wire += r.transferSize || 0; by[k].size += r.decodedBodySize || 0; }
          const big = res.map(r => ({ name: r.name.replace(location.origin + '/', ''), wire: r.transferSize || 0, size: r.decodedBodySize || 0, ms: Math.round(r.responseEnd - r.startTime) })).sort((a, b) => b.wire - a.wire).slice(0, 12);
          let lcp = null; try { const e = performance.getEntriesByType('largest-contentful-paint'); lcp = e.length ? Math.round(e[e.length - 1].startTime) : null; } catch (e) {}
          return { domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0), load: Math.round(nav.loadEventEnd || 0), requests: res.length, by, big, lcp,
                   jsHeapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null, domNodes: document.getElementsByTagName('*').length };
        }""")
        perf['seconds_to_idle'] = round(idle, 1)
        report['perf'][name] = perf
        ctx.close()
    for w, h, name in ((1440, 1000, 'desktop'), (390, 844, 'phone')):
        ctx = b.new_context(viewport={'width': w, 'height': h})
        p = ctx.new_page()
        errs, failed = [], []
        p.on('pageerror', lambda e: errs.append(str(e)[:200]))
        p.on('console', lambda m: errs.append('console: ' + m.text[:200]) if m.type == 'error' else None)
        p.on('requestfailed', lambda r: failed.append(r.url[:160] + ' ' + str(r.failure)))
        p.goto(SITE, wait_until='networkidle', timeout=240000); p.wait_for_timeout(4000)
        p.add_script_tag(content=AXE)
        views = p.evaluate("[...document.querySelectorAll('section.view[id^=view-]')].map(s => s.id.slice(5))")
        for v in views:
            p.evaluate(f"(() => {{ const t = document.querySelector('.tab[data-view=\"{v}\"]'); if (t) t.click(); else show('{v}'); }})()"); p.wait_for_timeout(3000)
            n_sub = p.evaluate(f"[...document.querySelectorAll('#view-{v} .topbar [role=radio], #view-{v} .topbar .seg button')].length")
            texts, axe_v = [], {}
            for i in range(-1, min(n_sub, 8)):
                if i >= 0:
                    p.evaluate(f"[...document.querySelectorAll('#view-{v} .topbar [role=radio], #view-{v} .topbar .seg button')][{i}].click()"); p.wait_for_timeout(1800)
                texts.append(p.evaluate(f"(document.querySelector('#view-{v}') || {{}}).innerText || ''"))
                try:
                    res = p.evaluate(f"axe.run(document.querySelector('#view-{v}'), {{resultTypes: ['violations'], rules: {{'color-contrast': {{enabled: true}}}}}})")
                    for vio in res.get('violations', []):
                        e = axe_v.setdefault(vio['id'], {'impact': vio.get('impact'), 'help': vio.get('help'), 'nodes': 0, 'examples': []})
                        e['nodes'] += len(vio.get('nodes', []))
                        for nd in vio.get('nodes', [])[:2]:
                            if len(e['examples']) < 3:
                                e['examples'].append({'target': nd.get('target'), 'summary': (nd.get('failureSummary') or '')[:200]})
                except Exception as ex:
                    axe_v['_error'] = str(ex)[:200]
            if name == 'desktop':
                open(os.path.join(out, f'text_{v}.txt'), 'w', encoding='utf-8').write('\n\n=====SUBVIEW=====\n\n'.join(texts))
            hits = {}
            for line in '\n'.join(texts).split('\n'):
                m = BAD.search(line)
                if m:
                    hits.setdefault(m.group(0).lower(), []).append(line.strip()[:140])
            report['text'].setdefault(name, {})[v] = {'words': len('\n'.join(texts).split()), 'hits': {k: sorted(set(x))[:5] for k, x in hits.items()}}
            report['axe'].setdefault(name, {})[v] = axe_v
        # the whole page shell (sidebar, header) once
        try:
            res = p.evaluate("axe.run(document, {resultTypes: ['violations']})")
            report['axe'][name]['_page'] = {vio['id']: {'impact': vio.get('impact'), 'help': vio.get('help'), 'nodes': len(vio.get('nodes', [])), 'examples': [{'target': nd.get('target'), 'summary': (nd.get('failureSummary') or '')[:200]} for nd in vio.get('nodes', [])[:3]]} for vio in res.get('violations', [])}
        except Exception as ex:
            report['axe'][name]['_page'] = {'_error': str(ex)[:200]}
        report['errors'][name] = {'page_errors': sorted(set(errs))[:30], 'failed_requests': sorted(set(failed))[:30]}
        ctx.close()
    b.close()
json.dump(report, open(os.path.join(out, 'report.json'), 'w'), indent=1)
print('AUDIT DONE', json.dumps(report['perf']))
