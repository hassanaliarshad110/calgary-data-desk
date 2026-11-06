"""Build the Calgary Data Desk website: the desktop app's screens on top of data built once a day.

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


def page(out):
    """The app's screens, with the website bridge loaded before the app."""
    shutil.copytree(os.path.join(ROOT, 'ui'), out, dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns('_*.html', '*.bak'))
    for f in ('web.js', 'web.css', 'web-ui.js', 'web-ai.js', 'genie-worker.js'):
        shutil.copy(os.path.join(ROOT, 'web', f), os.path.join(out, f))
    idx = open(os.path.join(ROOT, 'ui', 'index.html'), encoding='utf-8').read()
    idx = idx.replace('<script src="app.js"></script>',
                      '<script src="web.js"></script><script src="web-ai.js"></script><script src="app.js"></script>', 1)
    idx = idx.replace('</body>', '<script src="web-ui.js"></script>\n</body>', 1)
    idx = idx.replace('</head>', '<link rel="stylesheet" href="web.css">\n<meta name="description" content="Calgary Data Desk: '
                      'every Calgary ward side by side, from City of Calgary open data, refreshed every morning.">\n</head>', 1)
    idx = idx.replace('<body', '<body data-web="1"', 1)
    with open(os.path.join(out, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(idx)
    open(os.path.join(out, '.nojekyll'), 'w').close()


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
    step('property tax', lambda: write(os.path.join(data, 'tax.json'), tax_payload(cache, year)))
    write(os.path.join(data, 'methods.json'), census.relabel(methods.METHODS, year))
    step('transit timetable', lambda: write(os.path.join(data, 'transit.json'), transit.lookup(cache, force=True)))
    write(os.path.join(data, 'analyst_topics.json'),
          [{'key': k, 'title': t, 'about': ab, 'area': ar, 'only': list(analyst.ONLY.get(k, ())) or None}
           for k, t, ab, ar, _ in analyst.TOPICS])
    write(os.path.join(data, 'settings.json'), {
        'pop_methods': census.relabel([{'key': k, **v} for k, v in dashboard.POP_METHODS.items()], year),
        'census_year': year, 'wards': wards, 'methods': meths, 'contact': os.environ.get('CDD_CONTACT_EMAIL', '').strip()})

    def live():
        res = []
        for s in livecheck.listing():
            res.append(livecheck.test(s['key']))
        write(os.path.join(data, 'live.json'), {'sources': livecheck.listing(), 'results': res,
                                                  'checked': dashboard.calgary_now().strftime('%Y-%m-%d %H:%M')})
    step('live connections', live)

    def appeals():
        for w, ns in names.items():
            missing._held['data'] = None
            write(os.path.join(data, 'missing', f'w{w}.json'), missing.current(ns, force=True))
    step('missing persons', appeals)
    step('Data Genie files', lambda: python_files(out, cache))
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
