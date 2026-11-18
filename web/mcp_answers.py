"""Answers for the Calgary Insight connector (connector/, an MCP server for Claude, ChatGPT and other AI apps).

    python web/mcp_answers.py SITE_DIR [--method city_actual] [--wards 0,1,...,14]

SITE_DIR is a built website (web/build_site.py OUT_DIR, or a copy of the published one): it needs py/ (the Python that
Data Genie runs in the browser, with py/manifest.json), data/{method}/w{ward}.json, data/tax.json and data/cache/.
Runs Data Genie's own get_dashboard tool (agent.Agent.run_tool) for every section, every part and every ward, exactly
as the website's Data Genie would answer, and writes SITE_DIR/data/mcp/:

    w{ward}/{section}.json, w{ward}/{section}__{part}.json   sections that depend on the area chosen
    city/{section}.json, city/{section}__{part}.json         sections that are the same for every area
    catalog.json                                             the City's open data catalogue, compact, for searching
    index.json                                               what was written, with sizes and anything that failed

The connector (a Cloudflare Worker) only reads these files, so it needs no Python and does no heavy work itself.
Nothing here changes the website's own data.
"""
import argparse
import json
import os
import sys
import tempfile
import time

WARD_SECTIONS = ['overview', 'communities', 'child_care', 'schools', 'development', 'amenities', 'access', 'other_amenities',
                 'population_recon', 'crime', 'traffic', 'rents', 'profile', 'property_tax', 'elections', 'election_analytics',
                 'growth_forecast']
CITY_SECTIONS = ['wards', 'ward_amenities', 'federal_budget', 'city_news', 'safest_cities', 'school_tax', 'tourism', 'police_study',
                 'pay_study', 'city_budget_2027', 'budget_intelligence', 'business', 'visiting']
PARTS = {
    'federal_budget': ['revenue_by_province', 'tables', 'tax'],
    'tourism': ['arrivals', 'countries', 'airports', 'research'],
    'school_tax': ['municipalities', 'residents', 'boards', 'spending', 'grants', 'approvals', 'projects', 'factors'],
    'pay_study': ['sections', 'sources', 'limitations'],
    'police_study': ['sections', 'sources', 'limitations'],
    'budget_intelligence': ['cases', 'departments', 'priorities', 'service_areas', 'wards', 'checks', 'sources', 'actual'],
    'growth_forecast': ['sectors', 'communities', 'infrastructure', 'planned', 'fields'],
    'visiting': ['weather_months', 'weather_years', 'records', 'today', 'whats_on', 'sights', 'stay', 'getting_around', 'facts', 'stats'],
}
EXTRA = {   # other fixed questions worth having ready: (file name, arguments)
    'city': [('elections__full', {'section': 'elections', 'full': True})]
            + [(f'federal_budget__chapter_{c}', {'section': 'federal_budget', 'part': 'chapter', 'chapter': c}) for c in range(1, 7)]
            + [('federal_budget__province_AB', {'section': 'federal_budget', 'part': 'province', 'province': 'AB'})],
}


def write(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    text = json.dumps(obj, separators=(',', ':'), default=str, ensure_ascii=False)
    with open(path + '.tmp', 'w', encoding='utf-8') as f:
        f.write(text)
    os.replace(path + '.tmp', path)
    return len(text.encode('utf-8'))


def catalog_index(site_data):
    p = os.path.join(site_data, 'catalog.json')
    if not os.path.exists(p):
        return None
    cat = json.load(open(p, encoding='utf-8'))
    col = lambda c: (c if isinstance(c, list) else (str(c).split(':') + ['', ''])[:3])
    return {'datasets': [{'id': d.get('id'), 'name': d.get('name'), 'category': d.get('category'), 'about': d.get('about'),
                          'description': (d.get('description') or '')[:300], 'tags': d.get('tags') or [],
                          'columns': [col(c)[0] for c in d.get('columns') or []][:60], 'on_site': d.get('on_site') or None}
                         for d in cat.get('datasets') or []],
            'map_layers': [{k: l.get(k) for k in ('service', 'layer', 'name', 'features', 'geometry', 'fields')} for l in cat.get('map_layers') or []],
            'by_category': (cat.get('counts') or {}).get('by_category')}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('site')
    ap.add_argument('--method', default='city_actual')
    ap.add_argument('--wards', default=','.join(str(w) for w in range(15)))
    a = ap.parse_args()
    site = os.path.abspath(a.site)
    py, data = os.path.join(site, 'py'), os.path.join(site, 'data')
    out = os.path.join(data, 'mcp')
    # the same Python and files Data Genie has in the browser
    sys.path.insert(0, py)
    os.chdir(py)
    appdata = tempfile.mkdtemp(prefix='appdata-')            # the browser's appdata: the saved police and CSI copies
    man = json.load(open(os.path.join(py, 'manifest.json'), encoding='utf-8'))
    for rel in man.get('cache') or []:
        src = os.path.join(data, 'cache', rel)
        if os.path.exists(src):
            dst = os.path.join(appdata, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            with open(src, 'rb') as f, open(dst, 'wb') as g:
                g.write(f.read())
    import agent                                               # noqa: E402  (from py/)

    tax = None
    tp = os.path.join(data, 'tax.json')
    if os.path.exists(tp):
        t = json.load(open(tp, encoding='utf-8'))
        tax = {k: t.get(k) for k in ('year', 'roll_year', 'city', 'by_ward', 'factors', 'rates', 'levy', 'bylaw', 'source')}
    city = json.load(open(os.path.join(data, a.method, 'w0.json'), encoding='utf-8'))
    wards_summary = city.get('wards_summary')
    state = {'dash': None}
    ag = agent.Agent(lambda: {'api_key': '', 'models': {}}, lambda ev: None, tempfile.mkdtemp(prefix='down-'),
                     lambda: state['dash'], appdata, lambda: wards_summary)
    ag.tax_provider = lambda: tax
    index = {'built_at': city.get('built_at'), 'method': a.method, 'period': city.get('period'), 'prev_period': city.get('prev_period'),
             'files': {}, 'failed': {}}
    t0 = time.time()

    def one(scope, name, args):
        try:
            r = ag.run_tool('get_dashboard', args)
            if isinstance(r, dict) and r.get('error') and len(r) <= 3:
                index['failed'][f'{scope}/{name}'] = str(r['error'])[:200]
                return
            index['files'][f'{scope}/{name}'] = write(os.path.join(out, scope, name + '.json'), r)
        except Exception as e:                               # noqa: BLE001 - one section failing must not stop the rest
            index['failed'][f'{scope}/{name}'] = f'{type(e).__name__}: {e}'[:200]

    state['dash'] = city
    for s in CITY_SECTIONS:
        one('city', s, {'section': s})
        for p in PARTS.get(s, []):
            one('city', f'{s}__{p}', {'section': s, 'part': p})
    for name, args in EXTRA['city']:
        one('city', name, args)
    # every budget request on its own, so one can be read without the whole list
    try:
        n = len((ag.run_tool('get_dashboard', {'section': 'budget_intelligence', 'part': 'cases'}) or {}).get('cases') or [])
    except Exception:                                        # noqa: BLE001
        n = 0
    for i in range(1, max(n, 0) + 1):
        one('city', f'budget_intelligence__case__{i}', {'section': 'budget_intelligence', 'part': 'case', 'find': str(i)})

    for w in [int(x) for x in a.wards.split(',') if x.strip()]:
        p = os.path.join(data, a.method, f'w{w}.json')
        if not os.path.exists(p):
            index['failed'][f'w{w}'] = 'no dashboard file'
            continue
        state['dash'] = json.load(open(p, encoding='utf-8'))
        for s in WARD_SECTIONS:
            args = {'section': s}
            if s == 'profile' and w:
                args['ward'] = w
            one(f'w{w}', s, args)
            for part in PARTS.get(s, []):
                one(f'w{w}', f'{s}__{part}', {**args, 'part': part})

    cat = catalog_index(data)
    if cat:
        index['files']['catalog'] = write(os.path.join(out, 'catalog.json'), cat)
    index['seconds'] = round(time.time() - t0, 1)
    index['total_bytes'] = sum(index['files'].values())
    write(os.path.join(out, 'index.json'), index)
    print(f"connector answers: {len(index['files'])} files, {index['total_bytes'] / 1e6:.1f} MB, {len(index['failed'])} failed, "
          f"{index['seconds']} s")
    for k, v in list(index['failed'].items())[:40]:
        print('  not written:', k, '-', v)


if __name__ == '__main__':
    main()
