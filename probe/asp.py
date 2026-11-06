import sys, os, json, re, subprocess, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out + '/asp', exist_ok=True)
subprocess.run('sudo apt-get install -y -q poppler-utils >/dev/null 2>&1', shell=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'shapely'], check=True)
UA = {'User-Agent': 'Mozilla/5.0 (CalgaryInsight research)'}
def get(url, timeout=180):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout).read()
def q(ds, **kw):
    url = f'https://data.calgary.ca/resource/{ds}.json?' + urllib.parse.urlencode({('$' + k): v for k, v in kw.items()})
    return json.loads(get(url))
plans = q('yi6d-a7q5', select='name,doc_name,plan_type,app_date,status,multipolygon', limit=2000)
WANT = ['Providence', 'Saatoohtsi', "Naato'siyinnipi", 'Belvedere', 'Cornerstone', "Northeast Community 'A'", 'Rangeview', 'Ricardo Ranch',
        'Glacier Ridge', 'Haskayne', 'West View', 'East Stoney', 'Keystone Hills', 'Nose Creek', 'South Shepard', 'Springbank Hill',
        'West Springs', 'Symons Valley', "Southwest Community 'A' And Employment Centre/Mixed Use", 'West Macleod', 'East Macleod',
        'Mahogany', 'Auburn Bay', 'Southeast Centre', 'Bearspaw East', 'Saddle Ridge', 'Rocky Ridge', 'Calgary West', 'Revised Valley Ridge']
KEY = re.compile(r'(recreation centre|recreation facility|leisure centre|aquatic|arena|library|fire station|emergency response|emergency services station|'
                 r'high school|middle school|junior high|elementary|school site|joint use|community association|community centre|'
                 r'regional park|athletic park|district park|community park|neighbourhood park|playfield|sports field|transit station|LRT|BRT|'
                 r'police|health|seniors|child care|daycare|place of worship|municipal reserve|MR\b|MSR|school reserve|cemetery|pool)', re.I)
summary = []
for p in plans:
    if p.get('name') not in WANT or not p.get('doc_name') or p.get('plan_type') != 'Area Structure Plan':
        continue
    name = re.sub(r'[^A-Za-z0-9]+', '_', p['name']).strip('_')
    pdf = f'{out}/asp/{name}.pdf'
    r = subprocess.run(['curl', '-sSL', '-c', '/tmp/cj', '-b', '/tmp/cj', '-A', 'Mozilla/5.0', '--max-time', '300', '-o', pdf, p['doc_name']])
    b = open(pdf, 'rb').read() if os.path.exists(pdf) else b''
    if r.returncode or not b.startswith(b'%PDF'):
        print('FAIL', p['name'], r.returncode, b[:80]); continue
    subprocess.run(['pdftotext', '-layout', pdf, f'{out}/asp/{name}.txt'])
    os.remove(pdf)
    try:
        txt = open(f'{out}/asp/{name}.txt', encoding='utf-8', errors='ignore').read()
    except Exception:
        txt = ''
    hits = {}
    for m in KEY.finditer(txt):
        hits[m.group(1).lower()] = hits.get(m.group(1).lower(), 0) + 1
    summary.append({'plan': p['name'], 'approved': (p.get('app_date') or '')[:10], 'bytes': len(b), 'chars': len(txt), 'hits': hits})
    print('OK', p['name'], len(b), len(txt))
json.dump(summary, open(f'{out}/asp_summary.json', 'w'), indent=1)
json.dump([{k: v for k, v in p.items() if k != 'multipolygon'} | {'geom': p.get('multipolygon')} for p in plans if p.get('plan_type') == 'Area Structure Plan'],
          open(f'{out}/asp_plans.json', 'w'))

