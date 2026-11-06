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
    try:
        b = get(p['doc_name'], 300)
    except Exception as e:
        print('FAIL', p['name'], e); continue
    pdf = f'{out}/asp/{name}.pdf'
    open(pdf, 'wb').write(b)
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

# ---- reserve land in the Land Use Bylaw that is not (yet) a City park
from shapely.geometry import shape
from shapely.ops import unary_union
from shapely.strtree import STRtree
lu = q('qe6k-p9nh', select='lu_code,label,description,multipolygon', where="lu_code in('S-SPR','S-UN','S-R','S-CS','S-CI')", limit=50000)
parks = q('kami-qbfh', select='site_name,planning_category,the_geom', limit=50000)
comms = q('surr-xmvs', select='comm_code,name,sector,srg,multipolygon', limit=1000)
pg = [shape(r['the_geom']) for r in parks if r.get('the_geom')]
pg = [g.buffer(0) for g in pg]
tree = STRtree(pg)
cg = [(c['comm_code'], c.get('srg'), shape(c['multipolygon']).buffer(0)) for c in comms if c.get('multipolygon')]
ctree = STRtree([x[2] for x in cg])
rows = []
import math
for r in lu:
    if not r.get('multipolygon'):
        continue
    g = shape(r['multipolygon']).buffer(0)
    near = [pg[i] for i in tree.query(g)]
    cov = g.intersection(unary_union(near)).area / g.area if near and g.area else 0.0
    ce = g.representative_point()
    comm = None
    for i in ctree.query(ce):
        if cg[i][2].contains(ce):
            comm = cg[i][0]; break
    lat = ce.y
    m2 = g.area * (111320 ** 2) * math.cos(math.radians(lat))
    rows.append({'code': r['lu_code'], 'comm': comm, 'ha': round(m2 / 1e4, 3), 'in_parks': round(cov, 3), 'lat': round(ce.y, 6), 'lon': round(ce.x, 6)})
json.dump(rows, open(f'{out}/reserve.json', 'w'))
print('reserve polygons', len(rows))
