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



EC = 'https://www.elections.ca/res/rep/off/ovrGE45/62/data_donnees/'
step('ec t12', lambda: save('elections/ec-table12.csv', get(EC + 'table_tableau12.csv')))
step('ec t11', lambda: save('elections/ec-table11.csv', get(EC + 'table_tableau11.csv')))
step('ab sov', lambda: save('elections/ab-sov-2023.xlsx', get('https://www.elections.ab.ca/uploads/2023-Provincial-General-Election-Statement-of-Vote.xlsx')))
for q in range(1, 11):
    step(f'ab ref {q}', lambda q=q: save(f'elections/ab-ref-q{q}.html', get(f'https://officialresults.elections.ab.ca/orEDResultsReferendum2026.cfm?EventId={202600 + q}&MODE=exED')))
step('ab mlas', lambda: save('elections/ab-mlas.html', get('https://www.assembly.ab.ca/members/members-of-the-legislative-assembly')))
step('hoc', lambda: save('elections/hoc.xml', get('https://www.ourcommons.ca/members/en/search/xml')))
def statcan(pid, keep=None):
    meta = json.loads(get(f'https://www150.statcan.gc.ca/t1/wds/rest/getFullTableDownloadCSV/{pid}/en'))
    z = get(meta['object'], timeout=900)
    with zipfile.ZipFile(io.BytesIO(z)) as zf:
        for n in zf.namelist():
            if n.endswith('.csv') and 'MetaData' not in n:
                data = zf.read(n)
                if keep:
                    lines = data.decode('utf-8-sig').splitlines(True)
                    data = ''.join([lines[0]] + [l for l in lines[1:] if keep(l)]).encode()
                save(f'statcan/{pid}.csv', data)
for pid in ('35100191', '35100192', '35100193'):
    step('statcan ' + pid, lambda pid=pid: statcan(pid))
step('statcan 24100055', lambda: statcan('24100055', lambda l: ('Calgary' in l or 'Toronto' in l or 'Vancouver' in l or 'Montr' in l or 'Edmonton' in l or '"Canada"' in l or 'Alberta' in l) and l[1:5] >= '2014'))
step('statcan 23100253', lambda: statcan('23100253'))
step('statcan 36100450', lambda: statcan('36100450', lambda l: l[1:5] >= '2019'))
step('statcan 17100009', lambda: statcan('17100009', lambda l: l[1:5] >= '2024'))
step('tmx issuers', lambda: save('capmkt/tmx-issuers.xlsx', get('https://www.tsx.com/resource/en/571', timeout=600)))
def climate():
    for cid, y0, y1 in (('3031093', 1991, 2012), ('3031092', 2012, 2026)):
        for y in range(y0, y1 + 1):
            url = f'https://api.weather.gc.ca/collections/climate-daily/items?CLIMATE_IDENTIFIER={cid}&LOCAL_YEAR={y}&limit=400&f=json&properties=LOCAL_DATE,MAX_TEMPERATURE,MIN_TEMPERATURE,MEAN_TEMPERATURE,TOTAL_RAIN,TOTAL_SNOW,TOTAL_PRECIPITATION,SNOW_ON_GROUND&skipGeometry=true'
            save(f'climate/daily-{cid}-{y}.json', get(url, timeout=300))
step('climate', climate)
step('licences count', lambda: save('business/licences-count.json', json.dumps(soql('vdjc-pybd', select='count(*) as n')).encode()))

json.dump(LOG, open(os.path.join(OUT, 'log.json'), 'w'), indent=1)
print('\n'.join(LOG))
