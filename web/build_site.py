"""Build the Calgary Insight website: the desktop app's screens on top of data built once a day.

    python web/build_site.py OUT_DIR [--cache DIR] [--wards 0,5] [--methods model]

Writes OUT_DIR/index.html (the app's own screens with web.js in place of the desktop bridge) and OUT_DIR/data/:
  {method}/w{ward}.json   the dashboard for Calgary (0) and every ward, under every way of counting residents
  budget.json, tax.json, methods.json, settings.json, live.json, missing/w{ward}.json, built.json
Everything is read from the same public sources as the desktop app (City of Calgary open data, Calgary Police
Service, Government of Alberta, Statistics Canada, CMHC, Environment Canada), with no keys.
"""
import argparse
import datetime as dt
import json
import re
import os
import shutil
import sys
import time
import traceback

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

import calgary_data as cd       # noqa: E402
import census                   # noqa: E402
import dashboard                # noqa: E402
import budget                   # noqa: E402
import proptax                  # noqa: E402
import methods                  # noqa: E402
import livecheck                # noqa: E402
import missing                  # noqa: E402
import analyst                  # noqa: E402
import transit                  # noqa: E402
import access                   # noqa: E402

cd.KEEP_SECONDS = 6 * 3600      # one build reuses every City answer across wards and ways of counting
cd.RETRIES, cd.RETRY_WAIT = 3, 10   # the City's portal sometimes drops connections from cloud servers: keep trying
cd.MIN_GAP = 0.4                     # and is kinder to requests spaced out
cd.KEEP_BYTES = 1500 * 1024 * 1024


def write(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path + '.tmp', 'w', encoding='utf-8') as f:
        json.dump(obj, f, separators=(',', ':'), default=str)
    os.replace(path + '.tmp', path)


def tax_payload(cache, census_year):
    data = proptax.load(cache)
    table = dashboard.wardmap.load(cache)
    comms = table.get('communities') or {}
    return {**{k: v for k, v in data.items() if k != 'by_comm'},
            'by_ward': {str(k): v for k, v in proptax.by_ward(data, table).items()},
            'by_comm': {c: dict(e, name=(comms.get(c) or {}).get('name', c), ward=(comms.get(c) or {}).get('ward'))
                        for c, e in data['by_comm'].items()},
            'wards': table.get('wards')}


SITE_URL = 'https://calgaryinsight.ca/'
INDEXNOW_KEY = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'indexnow.txt'), encoding='utf-8').read().strip()
SOCIAL = ['https://www.facebook.com/share/1GwiEvuSog/', 'https://www.instagram.com/calgaryinsight/']
SEO = {'title': 'Calgary Insight: Calgary ward and community data, in plain words',
       'description': 'Every Calgary ward and community side by side: population and growth, 311 requests, safety, '
                      'parks and amenities, what is being built, budgets and elections, plus a visitor guide: the weather by month, '
                      'what to see and where to stay. From official public data, refreshed every morning. Independent and non-partisan.'}
# what search engines and visitors without JavaScript read: the site in words, and links to the screens
SCREENS = [('dashboard', 'Dashboard: every ward and community at a glance'), ('growth', 'Growth vs amenities and the forecast to 2030'),
           ('compare', 'Compare wards'), ('elections', 'Election Data Centre'), ('budget', 'City budget'),
           ('citynews', 'Calgary News'), ('livemap', 'Live map: news, traffic and crime'), ('fedbudget', 'Federal Budget 2026'), ('invest', 'Invest in Calgary'),
           ('infra', 'Infrastructure condition'), ('safety', "Canada's safest cities"), ('issues', 'Open 311 issues'),
           ('families', 'Families and schools'), ('help', 'Find help near me'), ('visit', 'Visiting Calgary: what to see, where to stay, the weather by month, getting around'),
           ('videos', 'Video explainers'),
           ('methods', "How it's counted"), ('sources', 'Data sources and refresh schedule')]
NOSCRIPT = ('<noscript><div style="max-width:760px;margin:24px auto;padding:0 16px;font-family:sans-serif;color:#e2e8f0">'
            '<h1>Calgary Insight</h1><p>' + SEO['description'] + '</p><ul>'
            + ''.join(f'<li><a href="?view={k}">{t}</a></li>' for k, t in SCREENS)
            + '<li><a href="wards/">Calgary\'s 14 wards</a></li><li><a href="communities/">Every Calgary community</a></li><li><a href="about/">About Calgary Insight</a></li></ul><p>Turn on JavaScript to use the interactive maps, '
              'tables and Data Genie.</p></div></noscript>')


def seo_head():
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebSite', '@id': SITE_URL + '#site', 'name': 'Calgary Insight', 'url': SITE_URL,
         'description': SEO['description'], 'inLanguage': 'en-CA', 'publisher': {'@id': SITE_URL + '#org'}},
        {'@type': 'Organization', '@id': SITE_URL + '#org', 'name': 'Calgary Insight', 'url': SITE_URL + 'about/', 'email': 'hello@calgaryinsight.ca',
         'logo': SITE_URL + 'logo-512.png', 'areaServed': {'@type': 'City', 'name': 'Calgary'}, 'sameAs': SOCIAL},
        {'@type': 'Dataset', 'name': 'Calgary ward and community indicators', 'url': SITE_URL,
         'description': 'Population, growth, 311 requests, amenities, safety and development for every Calgary ward and '
                        'community, compiled from City of Calgary open data and other public sources, refreshed daily.',
         'creator': {'@id': SITE_URL + '#org'}, 'spatialCoverage': {'@type': 'Place', 'name': 'Calgary, Alberta, Canada'},
         'isAccessibleForFree': True, 'license': 'https://data.calgary.ca/d/Open-Data-Terms/u45n-7awa'}]}
    tags = [
        f'<meta name="description" content="{SEO["description"]}">',
        f'<link rel="canonical" href="{SITE_URL}">',
        '<meta name="theme-color" content="#071226">',
        '<meta name="robots" content="index,follow">',
        '<link rel="apple-touch-icon" href="logo-512.png">',
        '<meta property="og:type" content="website">', '<meta property="og:site_name" content="Calgary Insight">',
        f'<meta property="og:title" content="{SEO["title"]}">', f'<meta property="og:description" content="{SEO["description"]}">',
        f'<meta property="og:url" content="{SITE_URL}">', f'<meta property="og:image" content="{SITE_URL}og-image.png">',
        '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">',
        '<meta property="og:image:alt" content="Calgary Insight: the city, ward by ward">', '<meta property="og:locale" content="en_CA">',
        '<meta name="twitter:card" content="summary_large_image">', f'<meta name="twitter:title" content="{SEO["title"]}">',
        f'<meta name="twitter:description" content="{SEO["description"]}">', f'<meta name="twitter:image" content="{SITE_URL}og-image.png">',
        '<script type="application/ld+json">' + json.dumps(ld, separators=(',', ':')) + '</script>']
    g = re.sub(r'.*content="([^"]+)".*', r'\1', os.environ.get('CDD_GOOGLE_VERIFY', '').strip())   # the tag or just its code
    if g:
        tags.append(f'<meta name="google-site-verification" content="{g}">')
    return '\n'.join(tags) + '\n'


def robots_and_sitemap(out, extra=()):
    today = dt.date.today().isoformat()
    with open(os.path.join(out, 'robots.txt'), 'w', encoding='utf-8') as f:
        f.write(f'User-agent: *\nAllow: /\nSitemap: {SITE_URL}sitemap.xml\n')
    # the app's screens (?view=...) all carry the home page's canonical address, so they are not listed separately;
    # the ward and community pages (seo_pages.py) are what search engines index
    urls = [(SITE_URL, '1.0'), (SITE_URL + 'about/', '0.8'), (SITE_URL + 'visit/', '0.8')] + [(SITE_URL + u, '0.9' if u.count('/') == 1 else '0.7') for u in extra]
    for rel in sorted(os.listdir(os.path.join(out, 'reports'))) if os.path.isdir(os.path.join(out, 'reports')) else []:
        if rel.endswith('.html'):
            urls.append((f'{SITE_URL}reports/{rel}', '0.5'))
    body = ''.join(f'<url><loc>{u.replace("&", "&amp;")}</loc><lastmod>{today}</lastmod><changefreq>daily</changefreq>'
                   f'<priority>{p}</priority></url>' for u, p in urls)
    with open(os.path.join(out, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                + body + '</urlset>\n')


def page(out):
    """The app's screens, with the website bridge loaded before the app."""
    shutil.copytree(os.path.join(ROOT, 'ui'), out, dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns('_*.html', '*.bak'))
    for f in ('web.js', 'web.css', 'web-ui.js', 'web-ai.js', 'web-account.js', 'genie-worker.js', 'report-view.html'):
        shutil.copy(os.path.join(ROOT, 'web', f), os.path.join(out, f))
    # the visitor's welcome: the door into Calgary with the Calgary song (calgaryinsight.ca/visit/)
    shutil.copytree(os.path.join(ROOT, 'web', 'visit'), os.path.join(out, 'visit'), dirs_exist_ok=True)
    # IndexNow (Bing, DuckDuckGo, Yandex and others): the site's key, at the address IndexNow checks
    shutil.copy(os.path.join(ROOT, 'web', 'indexnow.txt'), os.path.join(out, INDEXNOW_KEY + '.txt'))
    idx = open(os.path.join(ROOT, 'ui', 'index.html'), encoding='utf-8').read()
    idx = idx.replace('<script src="app.js"></script>',
                      '<script src="web.js"></script><script src="web-ai.js"></script><script src="app.js"></script>', 1)
    idx = idx.replace('</body>', '<script src="web-ui.js"></script>\n<script src="web-account.js"></script>\n</body>', 1)
    idx = idx.replace('<title>Calgary Insight</title>', '<title>' + SEO['title'] + '</title>', 1)
    idx = idx.replace('</head>', '<link rel="stylesheet" href="web.css">\n' + seo_head() + '</head>', 1)
    idx = idx.replace('<a class="skip"', NOSCRIPT + '\n<a class="skip"', 1)
    idx = idx.replace('<body', '<body data-web="1"', 1)
    idx = bundle_scripts(out, idx)
    with open(os.path.join(out, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(idx)
    open(os.path.join(out, '.nojekyll'), 'w').close()
    robots_and_sitemap(out)


def firebase_config():
    """The site's Firebase web settings (repository variable FIREBASE_CONFIG: the JSON Firebase shows for a web app), for
    the optional Google sign-in that keeps a visitor's Data Genie memory on every device. These settings are public by
    design; the Firestore rules decide who may read what. None: sign-in stays off and memory stays in the browser."""
    raw = os.environ.get('CDD_FIREBASE_CONFIG', '').strip()
    if not raw:
        return None
    try:
        cfg = json.loads(raw[raw.index('{'):raw.rindex('}') + 1])
    except ValueError:
        import re
        cfg = dict(re.findall(r'(\w+)\s*:\s*["\']([^"\']+)["\']', raw))    # pasted as the JavaScript object Firebase shows
    keep = ('apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId')
    cfg = {k: str(cfg[k]) for k in keep if cfg.get(k)}
    return cfg if cfg.get('apiKey') and cfg.get('projectId') else None


def ai_gateway():
    """The address of the site's AI gateway (gateway/worker.js): repository variable AI_GATEWAY_URL, or gateway/url.txt.
    None: the AI tools unlock with the passcode only."""
    url = os.environ.get('CDD_AI_GATEWAY', '').strip()
    if not url:
        try:
            with open(os.path.join(ROOT, 'gateway', 'url.txt'), encoding='utf-8') as f:
                url = f.read().strip()
        except OSError:
            url = ''
    return url.rstrip('/') if url.startswith('https://') else None


def bundle_scripts(out, idx):
    """The page's own scripts (not the vendor ones) joined into one file named by its content, so a visitor fetches
    one script instead of two dozen and keeps it cached until it changes. The source files stay published for anyone
    reading the code."""
    import hashlib
    import re
    tags = re.findall(r'<script src="([^"]+\.js)"></script>\n?', idx)
    own = [t for t in tags if not t.startswith('vendor/') and not t.startswith('http')]
    if len(own) < 2:
        return idx
    parts = []
    for t in own:
        with open(os.path.join(out, t), encoding='utf-8') as f:
            parts.append(f'// ---- {t}\n' + f.read().rstrip() + '\n')
    code = '\n;\n'.join(parts)
    name = f'site.{hashlib.sha256(code.encode("utf-8")).hexdigest()[:10]}.js'
    with open(os.path.join(out, name), 'w', encoding='utf-8') as f:
        f.write(code)
    first = True
    for t in own:
        tag = f'<script src="{t}"></script>\n'
        if tag not in idx:
            tag = f'<script src="{t}"></script>'
        idx = idx.replace(tag, f'<script src="{name}"></script>\n' if first else '', 1)
        first = False
    return idx


def python_files(out, cache):
    """The app's Python for Data Genie in the browser, and the saved copies of sources a web page cannot read."""
    dest = os.path.join(out, 'py')
    os.makedirs(os.path.join(dest, 'web'), exist_ok=True)
    files = []
    for f in sorted(os.listdir(ROOT)):
        if f.endswith('.py') and f not in ('app.py', 'live_check.py'):
            shutil.copy(os.path.join(ROOT, f), os.path.join(dest, f))
            files.append(f)
    shutil.copy(os.path.join(ROOT, 'web', 'webapp.py'), os.path.join(dest, 'web', 'webapp.py'))
    files.append('web/webapp.py')
    for d in ('data',):                 # files the modules read next to themselves
        for f in sorted(os.listdir(os.path.join(ROOT, d))):
            if f.endswith('.json'):
                os.makedirs(os.path.join(dest, d), exist_ok=True)
                shutil.copy(os.path.join(ROOT, d, f), os.path.join(dest, d, f))
                files.append(f'{d}/{f}')
    fb = os.path.join(ROOT, 'ui', 'budget', 'budget2026.json')   # Federal Budget 2026 for Data Genie (fedbudget.py)
    if os.path.exists(fb):
        os.makedirs(os.path.join(dest, 'ui', 'budget'), exist_ok=True)
        shutil.copy(fb, os.path.join(dest, 'ui', 'budget', 'budget2026.json'))
        files.append('ui/budget/budget2026.json')
    bz = os.path.join(out, 'data', 'business.json')            # Invest in Calgary for the Business Economist (business.py)
    if os.path.exists(bz):
        with open(bz, encoding='utf-8') as f:
            d = json.load(f)
        d['businesses'] = [r[:6] + [None, None, None, r[9]] for r in d.get('businesses') or []]
        os.makedirs(os.path.join(dest, 'data'), exist_ok=True)
        write(os.path.join(dest, 'data', 'business.json'), d)
        files.append('data/business.json')
    sr = os.path.join(out, 'data', 'safety_rank.json')          # Canada's safest cities for Data Genie (safety_rank.py)
    if os.path.exists(sr):
        os.makedirs(os.path.join(dest, 'data'), exist_ok=True)
        shutil.copy(sr, os.path.join(dest, 'data', 'safety_rank.json'))
        files.append('data/safety_rank.json')
    import registry
    shipped = ['registry.json']
    for p in registry.PAGES:                                     # the data file behind every registered page (registry.py)
        for name, src in p.get('files') or []:
            for base in (out,):
                f = os.path.join(base, src)
                if os.path.exists(f) and name not in shipped:
                    os.makedirs(os.path.join(dest, 'data'), exist_ok=True)
                    shutil.copy(f, os.path.join(dest, 'data', name))
                    files.append(f'data/{name}')
                    shipped.append(name)
    for e in registry.auto_files(out):                            # hand-picked and API data files no page claims (registry.auto_files)
        name, src = e['files'][0]
        if name in shipped or e['bytes'] > registry.MAX_SHIP:
            continue
        for base in (out, os.path.dirname(os.path.abspath(registry.__file__)), os.path.join(os.path.dirname(os.path.abspath(registry.__file__)), 'ui')):
            f = os.path.join(base, src)
            if os.path.exists(f):
                os.makedirs(os.path.join(dest, 'data'), exist_ok=True)
                shutil.copy(f, os.path.join(dest, 'data', name))
                files.append(f'data/{name}')
                shipped.append(name)
                break
    rg = os.path.join(out, 'data', 'registry.json')
    if os.path.exists(rg):
        os.makedirs(os.path.join(dest, 'data'), exist_ok=True)
        shutil.copy(rg, os.path.join(dest, 'data', 'registry.json'))
        files.append('data/registry.json')
    kept = []
    for rel in ('police/community_safety.json', 'csi_35100026.json'):
        src = os.path.join(cache, rel)
        if os.path.exists(src):
            os.makedirs(os.path.dirname(os.path.join(out, 'data', 'cache', rel)), exist_ok=True)
            shutil.copy(src, os.path.join(out, 'data', 'cache', rel))
            kept.append(rel)
    write(os.path.join(dest, 'manifest.json'), {'files': files, 'cache': kept})


def lock_key(out):
    """The owner's Claude key, locked with the access code (both from the build's secret settings), so the page
    can use it only after the code is typed. Without both, Data Genie stays switched off."""
    key, code = os.environ.get('CDD_ANTHROPIC_KEY', '').strip(), os.environ.get('CDD_ACCESS_CODE', '').strip()
    path = os.path.join(out, 'data', 'genie.json')
    if not (key and code):
        print('Data Genie: no key or access code set, so it stays switched off on the website')
        return
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    import base64
    salt, iv, iters = os.urandom(16), os.urandom(12), 600000
    k = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=iters).derive(code.encode('utf-8'))
    ct = AESGCM(k).encrypt(iv, key.encode('utf-8'), None)
    b = lambda x: base64.b64encode(x).decode('ascii')
    write(path, {'v': 1, 'iter': iters, 'salt': b(salt), 'iv': b(iv), 'ct': b(ct)})
    print('Data Genie: key locked with the access code')
    biz = os.environ.get('CDD_BIZ_CODE', '').strip()   # the Business Economist (Invest in Calgary): its own passcode
    if biz:
        salt, iv = os.urandom(16), os.urandom(12)
        k = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=iters).derive(biz.encode('utf-8'))
        write(os.path.join(out, 'data', 'genie_biz.json'),
              {'v': 1, 'iter': iters, 'salt': b(salt), 'iv': b(iv), 'ct': b(AESGCM(k).encrypt(iv, key.encode('utf-8'), None))})
        print('Business Economist: key locked with its own passcode')
    ea = os.environ.get('CDD_EA_CODE', '').strip()     # Election Analytics: its own passcode
    if ea:
        salt, iv = os.urandom(16), os.urandom(12)
        k = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=iters).derive(ea.encode('utf-8'))
        write(os.path.join(out, 'data', 'genie_ea.json'),
              {'v': 1, 'iter': iters, 'salt': b(salt), 'iv': b(iv), 'ct': b(AESGCM(k).encrypt(iv, key.encode('utf-8'), None))})
        print('Election Analytics: key locked with its own passcode')
    else:
        print('Election Analytics: no passcode set (ELECTION_ACCESS_CODE), so its analyst stays locked on the website')


def keep_previous(site, rel, path):
    """Yesterday's copy of one file from the published website, marked as not refreshed today."""
    import urllib.request
    with urllib.request.urlopen(site.rstrip('/') + '/data/' + rel, timeout=120) as r:
        d = json.loads(r.read().decode('utf-8'))
    d['stale'] = True
    write(path, d)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--cache', default=os.path.join(ROOT, '.site-cache'))
    ap.add_argument('--wards', default=','.join(str(w) for w in range(15)))
    ap.add_argument('--methods', default=','.join(dashboard.POP_METHODS))
    ap.add_argument('--pyodide', default='', help='folder with the Pyodide core files, copied to OUT/pyodide')
    ap.add_argument('--previous', default=os.environ.get('CDD_SITE_URL', ''), help='the published website, for yesterday\'s copy of a view that fails')
    a = ap.parse_args()
    out, cache = os.path.abspath(a.out), os.path.abspath(a.cache)
    data = os.path.join(out, 'data')
    os.makedirs(cache, exist_ok=True)
    page(out)
    t0, log, ok = time.time(), [], True

    def step(name, fn):
        nonlocal ok
        s = time.time()
        try:
            fn()
            log.append({'step': name, 'ok': True, 'seconds': round(time.time() - s, 1)})
            print(f'ok   {name} ({time.time() - s:.0f} s)', flush=True)
        except Exception as e:      # noqa: BLE001 - one source down must not stop the site
            ok = False
            traceback.print_exc()
            log.append({'step': name, 'ok': False, 'error': str(e)[:300]})
            print(f'FAIL {name}: {e}', flush=True)

    info = census.load(cache)
    year = int(info.get('year') or 2021)
    wards = [int(w) for w in a.wards.split(',') if w.strip()]
    meths = [m for m in a.methods.split(',') if m in dashboard.POP_METHODS]
    def access_base():              # Growth vs amenities: distance from every home (numpy and scipy), once for every view
        table = dashboard.wardmap.load(cache)
        try:                        # private amenities that are not the City's (OpenStreetMap), for the optional filter
            feats = ((dashboard.assetmap.load(cache) or {}).get('other') or {}).get('features')
        except Exception:           # noqa: BLE001 - the filter is optional; the main figures do not need it
            feats = None
        base = access.load(cache, ward_of={c: v.get('ward') for c, v in (table.get('communities') or {}).items()},
                           features=feats)
        if not base:
            raise RuntimeError('the access figures could not be worked out')
        write(os.path.join(data, 'access_base.json'), base)    # the desktop app reads this copy
    step('growth vs amenities (distance from every home)', access_base)

    def srg_base():                 # the City's Suburban Residential Growth forecast (srg.py), once for every view
        import srg
        raw = srg.load(cache, force=True)
        if not raw:
            raise RuntimeError('the SRG forecast could not be read')
        write(os.path.join(data, 'srg_raw.json'), raw)          # the desktop app and Data Genie read this copy
    step('suburban residential growth forecast', srg_base)

    def projects_and_planned():     # every ward's major projects (majorprojects.py) and the planned amenities (planned.py)
        import majorprojects
        import planned
        import srg
        mp = majorprojects.load(cache, force=True)
        if mp:
            write(os.path.join(data, 'majorprojects.json'), mp)
        table = dashboard.wardmap.load(cache)
        cw = {c: v.get('ward') for c, v in (table.get('communities') or {}).items()}
        raw = srg.load(cache)
        pl = planned.load(cache, dashboard.city_projects(0, cache, cw), srg.sectors(raw)['last_year'] if raw else 2030, force=True)
        if not pl:
            raise RuntimeError('the planned amenities could not be worked out')
        write(os.path.join(data, 'planned.json'), {k: v for k, v in pl.items() if k != 'catch'})
    step('major projects in every ward and the planned amenities', projects_and_planned)

    def elections_base():
        import elections
        base = elections.load(cache, can_build=True)
        if not base:
            raise RuntimeError('the election results could not be read')
        write(os.path.join(data, 'elections.json'), base)       # the Elections tab and the desktop app read this copy
        if base.get('errors'):
            print('elections: parts not read:', base['errors'])
    step('elections (municipal, provincial, federal)', elections_base)
    names = {}
    for m in meths:                 # the default first, so a partial build still shows the usual view
        for w in wards:
            def one(m=m, w=w):
                d = dashboard.build(cache_dir=cache, ward=w, pop_method=m)
                write(os.path.join(data, m, f'w{w}.json'), d)
                if (d.get('population') or {}).get('recon'):      # the build-up workbook for the Population build-up tab
                    import buildup
                    sc = d.get('scope') or {}
                    buildup.write(os.path.join(data, m, f'buildup_w{w}.xlsx'), d['population']['recon'],
                                  {c['code']: c.get('ward') for c in d.get('communities') or []},
                                  'Calgary' if sc.get('kind') == 'city' else (sc.get('name') or ''),
                                  (d.get('population') or {}).get('method_label', ''), str(d.get('built_at', ''))[:16])
                names[w] = [c.get('name') for c in d.get('communities') or []]
            step(f'dashboard {m} ward {w}', one)
    # a ward that failed (the City's portal timing out) gets a second try, then yesterday's published copy
    for m in meths:
        for w in wards:
            path = os.path.join(data, m, f'w{w}.json')
            if os.path.exists(path):
                continue
            time.sleep(30)
            step(f'dashboard {m} ward {w} (second try)', lambda m=m, w=w: write(path, dashboard.build(cache_dir=cache, ward=w, pop_method=m)))
            if not os.path.exists(path) and a.previous:
                step(f'dashboard {m} ward {w} (yesterday\'s copy)', lambda m=m, w=w, path=path: keep_previous(a.previous, f'{m}/w{w}.json', path))
    step('budget', lambda: write(os.path.join(data, 'budget.json'), budget.load(cache)))

    def business_list():            # Invest in Calgary: every business (City licences and OpenStreetMap), by community
        import business
        bz = business.build()
        hp = os.path.join(cache, 'access', 'homes.json')        # every home, read for Growth vs amenities above
        try:
            if os.path.exists(hp):
                with open(hp, encoding='utf-8') as f:
                    bz['home_access'] = business.home_access(bz, json.load(f)['homes'])
            else:
                print('Invest in Calgary: no home list, so walking distance from homes is left out')
        except Exception as e:      # noqa: BLE001 - the 1 to 3 km figures still stand
            print('Invest in Calgary: walking distance from homes not worked out:', e)
        write(os.path.join(data, 'business.json'), bz)
        people = {}
        for m in meths:             # residents of every community under every way of counting, for the underserved index
            p = os.path.join(data, m, 'w0.json')
            if os.path.exists(p):
                with open(p, encoding='utf-8') as f:
                    people[m] = {c['code']: [c.get('residents'), c.get('census2021')] for c in json.load(f).get('communities') or [] if c.get('code')}
        write(os.path.join(data, 'business_people.json'), people)
    step('Invest in Calgary: businesses', business_list)
    if not os.path.exists(os.path.join(data, 'business.json')) and a.previous:
        step('Invest in Calgary (yesterday\'s copy)', lambda: keep_previous(a.previous, 'business.json', os.path.join(data, 'business.json')))

    def infrastructure():           # Infrastructure condition: water main breaks, mains, the paving plan, 311 (infra.py)
        import infra
        write(os.path.join(data, 'infra.json'), infra.build())
    step('Infrastructure condition', infrastructure)
    if not os.path.exists(os.path.join(data, 'infra.json')) and a.previous:
        step('Infrastructure condition (yesterday\'s copy)', lambda: keep_previous(a.previous, 'infra.json', os.path.join(data, 'infra.json')))

    def city_catalog():             # the City's whole open data catalogue and map layers, for the assistants (catalog.py)
        import catalog
        write(os.path.join(data, 'catalog.json'), catalog.build())
    step('City open data catalogue', city_catalog)
    if not os.path.exists(os.path.join(data, 'catalog.json')) and a.previous:
        step('City open data catalogue (yesterday\'s copy)', lambda: keep_previous(a.previous, 'catalog.json', os.path.join(data, 'catalog.json')))

    def capital_markets():          # Calgary Capital Markets: TMX totals, ticker checks, SEC results (capmkt.py)
        import capmkt
        prev = None
        if a.previous:
            try:
                import urllib.request
                with urllib.request.urlopen(a.previous.rstrip('/') + '/data/capmkt.json', timeout=60) as r:
                    prev = json.loads(r.read().decode('utf-8'))
            except Exception:       # noqa: BLE001 - first build, or the site is down
                prev = None
        write(os.path.join(data, 'capmkt.json'), capmkt.build(prev))
    step('Calgary Capital Markets', capital_markets)

    def civic():                    # Civic Accountability: council and Commons votes, bills, City measures (accountability.py)
        import accountability
        write(os.path.join(data, 'accountability.json'), accountability.build())
    step('Civic Accountability records', civic)
    if not os.path.exists(os.path.join(data, 'accountability.json')) and a.previous:
        step('Civic Accountability records (yesterday\'s copy)', lambda: keep_previous(a.previous, 'accountability.json', os.path.join(data, 'accountability.json')))

    def safety():                   # Canada's safest cities (Statistics Canada), downloaded again only after a new release
        import safety_rank
        prev = None
        if a.previous:
            try:
                import urllib.request
                with urllib.request.urlopen(a.previous.rstrip('/') + '/data/safety_rank.json', timeout=60) as r:
                    prev = json.loads(r.read().decode('utf-8'))
            except Exception:       # noqa: BLE001 - first build, or the site is down
                prev = None
        write(os.path.join(data, 'safety_rank.json'), safety_rank.build(prev))
    step('safest cities in Canada (crime severity index)', safety)
    def visiting():                 # Visiting Calgary: the weather since 1885, OpenStreetMap sights and hotels, what is on (visit.py)
        import visit
        write(os.path.join(data, 'visit.json'), visit.build(cache))
    step('Visiting Calgary (weather, places, what is on)', visiting)
    if not os.path.exists(os.path.join(data, 'visit.json')) and a.previous:
        step('Visiting Calgary (yesterday\'s copy)', lambda: keep_previous(a.previous, 'visit.json', os.path.join(data, 'visit.json')))
    step('property tax', lambda: write(os.path.join(data, 'tax.json'), tax_payload(cache, year)))
    write(os.path.join(data, 'methods.json'), census.relabel(methods.METHODS, year))
    step('transit timetable', lambda: write(os.path.join(data, 'transit.json'), transit.lookup(cache, force=True)))
    write(os.path.join(data, 'analyst_topics.json'),
          [{'key': k, 'title': t, 'about': ab, 'area': ar, 'only': list(analyst.ONLY.get(k, ())) or None}
           for k, t, ab, ar, _ in analyst.TOPICS])
    write(os.path.join(data, 'settings.json'), {
        'pop_methods': census.relabel([{'key': k, **v} for k, v in dashboard.POP_METHODS.items()], year),
        'census_year': year, 'wards': wards, 'methods': meths, 'contact': os.environ.get('CDD_CONTACT_EMAIL', '').strip(),
        'firebase': firebase_config(), 'ai_gateway': ai_gateway()})

    def live():
        res = []
        for s in livecheck.listing():
            res.append(livecheck.test(s['key']))
        write(os.path.join(data, 'live.json'), {'sources': livecheck.listing(), 'results': res,
                                                  'checked': dashboard.calgary_now().strftime('%Y-%m-%d %H:%M')})
    step('live connections', live)

    def registry_file():            # the master registry of sources the assistants read (registry.py)
        import registry
        reg = registry.write(out, open(os.path.join(out, 'index.html'), encoding='utf-8').read()
                             if os.path.exists(os.path.join(out, 'index.html')) else None)
        loose = [p['key'] for p in reg if not p.get('registered')]
        if loose:
            print('screens with no registry entry yet (add them to registry.PAGES):', ', '.join(loose))
    step('master registry of sources', registry_file)

    def search():                   # the site search index (search_index.py): screens, communities, wards, methods, datasets...
        import search_index
        write(os.path.join(data, 'search.json'), search_index.build(out, data, methods.METHODS, meths[0]))
    step('site search index', search)

    def appeals():
        for w, ns in names.items():
            missing._held['data'] = None
            write(os.path.join(data, 'missing', f'w{w}.json'), missing.current(ns, force=True))
    step('missing persons', appeals)
    step('Data Genie files', lambda: python_files(out, cache))

    def search_pages():             # a plain page for every ward and community, for search engines (seo_pages.py)
        import seo_pages
        urls = seo_pages.build(out, data, meths[0])
        robots_and_sitemap(out, urls)
        with open(os.path.join(out, 'indexnow-urls.txt'), 'w', encoding='utf-8') as f:     # sent to IndexNow after the deploy
            f.write('\n'.join([SITE_URL, SITE_URL + 'about/', SITE_URL + 'visit/'] + [SITE_URL + u for u in urls]))
        print(f'pages for search engines: {len(urls)}')
    step('ward and community pages for search engines', search_pages)
    lock_key(out)
    if a.pyodide:
        shutil.copytree(a.pyodide, os.path.join(out, 'pyodide'), dirs_exist_ok=True)
    write(os.path.join(data, 'built.json'), {'built_at': dashboard.calgary_now().strftime('%Y-%m-%d %H:%M'),
                                             'minutes': round((time.time() - t0) / 60, 1), 'steps': log,
                                             'census_year': year})
    print(f'done in {(time.time() - t0) / 60:.1f} min, {"all ok" if ok else "with failures"}')
    # a build where the main view failed must not replace yesterday's site
    if not os.path.exists(os.path.join(data, meths[0], 'w0.json')):
        sys.exit(1)


if __name__ == '__main__':
    main()
