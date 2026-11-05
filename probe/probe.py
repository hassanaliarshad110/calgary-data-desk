"""Look at the election data sources and keep small samples (side branch, not the website)."""
import io, json, os, sys, urllib.request, zipfile, csv, re, traceback
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'calgary-data-desk-probe'}
rep = {}
def get(url, n=None, timeout=120):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        b = r.read() if n is None else r.read(n)
        return b, r.headers.get('Content-Type'), r.geturl()
def note(key, url, f):
    try:
        rep[key] = f(url)
    except Exception as e:
        rep[key] = {'url': url, 'error': repr(e)[:300]}
def save(name, b): open(os.path.join(OUT, name), 'wb').write(b)

# City of Calgary: catalogue and datasets
def cat(url):
    d = json.loads(get(url)[0])
    return [[x['resource']['id'], x['resource']['name'], x['resource'].get('data_updated_at', '')[:10], x['resource'].get('columns_field_name', [])[:25]] for x in d['results']]
for q in ('election', 'voting', 'ward boundaries', 'voting subdivision'):
    note('city_catalog_' + q, f'https://data.calgary.ca/api/catalog/v1?q={urllib.parse.quote(q)}&only=datasets&limit=60', cat)
for ds in ('kfwi-frmp', 'gqvk-p23x', 'tty8-276j', 'yfq8-sn8e', 'fydv-pihp', 'vkin-p7cs', 'qsgw-smtc'):
    def f(url, ds=ds):
        rows = json.loads(get(f'https://data.calgary.ca/resource/{ds}.json?$limit=6')[0])
        cnt = json.loads(get(f'https://data.calgary.ca/resource/{ds}.json?$select=count(*)')[0])
        return {'count': cnt, 'sample': rows}
    note('city_' + ds, ds, f)

# Elections Canada 2025
def ec_page(url):
    b = get(url)[0].decode('utf-8', 'replace'); return re.findall(r'href="([^"]+)"', b)[:200]
note('ec_csv_page', 'https://www.elections.ca/res/rep/off/ovr_2025/csv_e.html', ec_page)
def ec_t12(url):
    b, ct, u = get(url); save('ec_table12.csv', b); t = b.decode('latin-1')
    lines = t.splitlines(); return {'ct': ct, 'lines': len(lines), 'head': lines[:3], 'calgary': [l for l in lines if 'Calgary' in l][:60]}
note('ec_table12', 'https://www.elections.ca/res/rep/off/ovr_2025/63/data_donnees/table_tableau12.csv', ec_t12)
def ec_poll(url):
    b, ct, u = get(url); save('ec_poll_sample.csv', b[:20000]); t = b.decode('latin-1').splitlines(); return {'lines': len(t), 'head': t[:4]}
note('ec_poll_48004', 'https://www.elections.ca/res/rep/off/ovr_2025/63/data_donnees/pollbypoll_bureauparbureau48004.csv', ec_poll)
note('ec_poll_48004_fmt2', 'https://www.elections.ca/res/rep/off/ovr_2025/63/data_donnees/pollresults_resultatsbureau48004.csv', ec_poll)
def ckan(url):
    d = json.loads(get(url)[0])['result']; return {'title': d.get('title'), 'resources': [[r.get('name'), r.get('format'), r.get('url')] for r in d.get('resources', [])][:40]}
note('ec_boundaries', 'https://open.canada.ca/data/api/action/package_show?id=97a2a33c-54cc-4f2e-82c1-047ad8212f05', ckan)

# Elections Alberta
def xl(url):
    b, ct, u = get(url); save('ab_2023_sov.xlsx', b); return {'bytes': len(b), 'ct': ct}
note('ab_2023_sov', 'https://www.elections.ab.ca/uploads/2023-Provincial-General-Election-Statement-of-Vote.xlsx', xl)
def page(url):
    b, ct, u = get(url); t = b.decode('utf-8', 'replace'); save(re.sub(r'\W+', '_', url)[-60:] + '.html', b)
    return {'ct': ct, 'final': u, 'len': len(t), 'title': re.findall(r'<title>(.*?)</title>', t, re.S)[:1], 'links': re.findall(r'(?:href|src)="([^"]+)"', t)[:120],
            'api': re.findall(r'["\'](/?api/[^"\']+|[^"\']+\.json[^"\']*)["\']', t)[:40]}
note('ab_officialresults', 'https://officialresults.elections.ab.ca/', page)
note('ab_byelection', 'https://www.elections.ab.ca/?p=17554', page)
note('ab_ped_2019', 'https://open.alberta.ca/api/3/action/package_show?id=d2eff235-4c11-416f-b4e2-791c305594b1', ckan)
note('ab_next', 'https://www.elections.ab.ca/elections/albertas-next-election/', page)
json.dump(rep, open(os.path.join(OUT, 'probe.json'), 'w'), indent=1, default=str)
print(json.dumps({k: (v.get('error') if isinstance(v, dict) and 'error' in v else 'ok') for k, v in rep.items()}, indent=1))
