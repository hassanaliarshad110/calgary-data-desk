"""Site-wide accuracy audit: download the raw sources behind the other screens, untouched, so they can be added up
independently afterwards. usage: python fetch_sources.py <out-dir>"""
import json, os, sys, re, time, urllib.request, urllib.parse, zipfile, io
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
LOG = []
UA = {'User-Agent': 'Mozilla/5.0 (calgaryinsight accuracy audit)'}


def get(url, timeout=300, binary=True):
    for i in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
                b = r.read(); return b if binary else b.decode('utf-8', 'replace')
        except Exception as e:
            LOG.append(f'retry {i} {url[:120]} {e}'); time.sleep(8 * (i + 1))
    LOG.append('FAILED ' + url); return None


def save(name, data):
    if data is None: return
    p = os.path.join(OUT, name); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'wb').write(data if isinstance(data, bytes) else data.encode('utf-8'))
    LOG.append(f'saved {name} {len(data):,} bytes')


def soql(ds, **p):
    url = f'https://data.calgary.ca/resource/{ds}.json?' + urllib.parse.urlencode({('$' + k): v for k, v in p.items()})
    b = get(url); return json.loads(b) if b else None


def soql_all(ds, page=50000, **p):
    out, off = [], 0
    while True:
        rows = soql(ds, limit=page, offset=off, order=':id', **p)
        if rows is None: return out
        out += rows; off += page
        if len(rows) < page: return out


def step(name, fn):
    try: fn(); LOG.append('ok ' + name)
    except Exception as e: LOG.append(f'FAIL {name}: {e!r}')


# ---- Calgary Police: the community safety file (link from the site's own record, checked against the police page)
def police():
    w = json.load(open(os.path.join(OUT, '..', 'live', 'city_actual', 'w0.json')))
    save('police/' + w['crime']['file'], get(w['crime']['link']))
    save('police/page.html', get(w['crime']['page']))
step('police', police)

# ---- Statistics Canada full tables (CSV in a zip), through the Web Data Service
def statcan(pid):
    meta = json.loads(get(f'https://www150.statcan.gc.ca/t1/wds/rest/getFullTableDownloadCSV/{pid}/en'))
    z = get(meta['object'], timeout=600)
    with zipfile.ZipFile(io.BytesIO(z)) as zf:
        for n in zf.namelist():
            if n.endswith('.csv') and 'MetaData' not in n:
                data = zf.read(n)
                if len(data) > 60_000_000:   # keep only the rows the audit needs
                    keep = [l for l in data.decode('utf-8-sig').splitlines(True) if l.startswith('"REF_DATE"') or 'Calgary' in l or 'Canada' in l[:80]]
                    data = ''.join(keep).encode()
                save(f'statcan/{pid}.csv', data)
for pid in ('35100026', '35100186', '35100187', '35100188', '35100189', '35100190', '35100077'):
    step('statcan ' + pid, lambda pid=pid: statcan(pid))

# ---- Elections: Calgary stations (open data), Elections Canada and Elections Alberta pages
step('gqvk-p23x', lambda: save('elections/gqvk-p23x.json', json.dumps(soql_all('gqvk-p23x')).encode()))
step('elections calgary page', lambda: save('elections/calgary-2025-results.html', get('https://elections-prd.calgary.ca/results/2025-results.html')))
step('elections canada', lambda: save('elections/ec-table1E.html', get('https://www.elections.ca/res/rep/off/ovrGE45/62/table1E.html')))
for ed in ('48004', '48005'):
    step('ec riding ' + ed, lambda ed=ed: save(f'elections/ec-{ed}.html', get(f'https://www.elections.ca/res/rep/off/ovrGE45/62/{ed}E.html')))

# ---- City budget open data (every row) and the 2027-2030 open data
step('fqax-i3nz', lambda: save('budget/fqax-i3nz.json', json.dumps(soql_all('fqax-i3nz')).encode()))
step('nnnm-9sfh', lambda: save('budget/nnnm-9sfh.json', json.dumps(soql_all('nnnm-9sfh')).encode()))

# ---- property roll, added up by community and use (sums only)
def roll():
    rows = soql('4bsw-nn7w', select='comm_code,assessment_class,property_type,substring(sub_property_use,1,1) as u,count(*) as n,sum(re_assessed_value) as re,sum(nr_assessed_value) as nr,sum(fl_assessed_value) as fl',
                group='comm_code,assessment_class,property_type,u', limit=50000)
    save('roll/aggregates.json', json.dumps(rows).encode())
    meta = soql('4bsw-nn7w', select='roll_year,count(*) as n', group='roll_year', limit=20)
    save('roll/years.json', json.dumps(meta).encode())
step('roll', roll)
step('bylaw', lambda: save('roll/bylaw-2026.pdf', get('https://municipalaffairs.gov.ab.ca/cfml/FinancialTaxRateSearch/pdf/tr_bylaws/2026_Bylaw_CALGARY_0046.pdf')))

# ---- water main breaks (every row), water mains (by community: length)
step('dpcu-jr23', lambda: save('infra/dpcu-jr23.json', json.dumps(soql_all('dpcu-jr23')).encode()))
step('w6h9 sample', lambda: save('infra/w6h9-sample.json', json.dumps(soql('w6h9-w33i', limit=3)).encode()))

# ---- Government of Alberta files (CKAN): school enrolment and child care
def ckan(pid, folder, pick):
    meta = json.loads(get(f'https://open.alberta.ca/api/3/action/package_show?id={pid}'))
    save(f'{folder}/package.json', json.dumps(meta).encode())
    res = meta['result']['resources']
    for r in pick(res):
        u = r['url']; save(f'{folder}/' + urllib.parse.unquote(u.split('/')[-1])[:120], get(u, timeout=600))
step('enrolment', lambda: ckan('student-enrolment-by-school-authority-and-grade-level', 'alberta/enrolment', lambda R: [r for r in R if r.get('format', '').lower() in ('csv', 'xlsx', 'xls')][:3]))
step('child care', lambda: ckan('childcareinformation', 'alberta/childcare', lambda R: sorted([r for r in R if r.get('format', '').lower() in ('csv', 'xlsx', 'xls')], key=lambda r: r.get('created', ''))[-2:]))

# ---- business licences: counts by status
step('vdjc-pybd', lambda: save('business/licences-by-status.json', json.dumps(soql('vdjc-pybd', select='jobstatusdesc,count(*) as n', group='jobstatusdesc', limit=100)).encode()))
step('vdjc-pybd sample', lambda: save('business/sample.json', json.dumps(soql('vdjc-pybd', limit=3)).encode()))

# ---- climate: monthly summaries for the airport stations (Environment Canada API)
def climate():
    for cid in ('3031093', '3031092'):
        url = f'https://api.weather.gc.ca/collections/climate-monthly/items?CLIMATE_IDENTIFIER={cid}&limit=10000&f=json'
        save(f'climate/monthly-{cid}.json', get(url, timeout=600))
step('climate', climate)

# ---- TMX monthly issuer file: the statistics page, to find the file
step('tmx page', lambda: save('capmkt/tmx-stats.html', get('https://www.tsx.com/en/listings/current-market-statistics')))

json.dump(LOG, open(os.path.join(OUT, 'log.json'), 'w'), indent=1)
print('\n'.join(LOG))
