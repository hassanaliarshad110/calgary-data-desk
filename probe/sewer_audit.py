"""Independent recomputation of every sewer figure in the video, straight from the City's open data."""
import json, os, sys, subprocess, urllib.request, urllib.parse, statistics, collections
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'shapely'], check=True)
from shapely.geometry import shape, Point, LineString
from shapely.strtree import STRtree
B = 'https://data.calgary.ca'
R = {}
def get(url):
    for i in range(4):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'CalgaryInsight-audit/1.0'}), timeout=300))
        except Exception as e:
            err = e
    raise err
def q(ds, **p):
    return get(f'{B}/resource/{ds}.json?' + urllib.parse.urlencode(p))
SAN = 'xesp-3jc3'
meta = get(f'{B}/api/views/{SAN}.json')
R['columns'] = [(c['fieldName'], c['dataTypeName'], c.get('description', '')[:120]) for c in meta['columns']]
R['dataset_name'] = meta.get('name'); R['rows_updated'] = meta.get('rowsUpdatedAt')
R['count_all'] = q(SAN, **{'$select': 'count(*) as n'})
R['count_null_date'] = q(SAN, **{'$select': 'count(*) as n', '$where': 'installed_date IS NULL'})
R['material_codes'] = q(SAN, **{'$select': 'material_type,count(*) as n', '$group': 'material_type', '$order': 'n DESC', '$limit': 100})
R['status_codes'] = None
# all rows: date, material, length, geometry
rows = []; off = 0
while True:
    page = q(SAN, **{'$select': 'installed_date,material_type,pipe_length,multilinestring', '$order': ':id', '$limit': 50000, '$offset': off})
    rows += page; off += 50000
    if len(page) < 50000: break
R['rows_downloaded'] = len(rows)
life = json.load(open(os.path.join(os.path.dirname(__file__), 'service_life.json')))
code = {}; unk = None
for m in life['materials']:
    for c in m['codes']: code[c] = (m['material'], m['low'], m['typical'], m['high'])
    if '' in m['codes']: unk = (m['material'], m['low'], m['typical'], m['high'])
L = lambda m: code.get(m) or unk
TY = 2026
recs = []
nodate = future = 0
for r in rows:
    d = r.get('installed_date')
    if not d: nodate += 1; continue
    y = int(str(d)[:4])
    if y > TY: future += 1; continue
    m = (r.get('material_type') or '').strip().upper()
    try: ln = float(r.get('pipe_length') or 0)
    except ValueError: ln = 0
    g = r.get('multilinestring')
    recs.append((y, m, ln, g))
R['skipped_nodate'] = nodate; R['skipped_future'] = future
n = len(recs); ys = sorted(y for y, *_ in recs)
R['n'] = n; R['km'] = round(sum(r[2] for r in recs) / 1000, 1)
R['median_year_true'] = statistics.median(ys); R['median_year_upper'] = ys[n // 2]
R['over50_strict'] = round(100 * sum(1 for y in ys if TY - y > 50) / n, 2)
R['over50_ge'] = round(100 * sum(1 for y in ys if TY - y >= 50) / n, 2)
grp = collections.Counter(L(m)[0] for _, m, _, _ in recs)
R['material_pct'] = {k: round(100 * v / n, 2) for k, v in grp.most_common()}
R['material_n'] = dict(grp)
for lab, idx in (('low', 1), ('typical', 2), ('high', 3)):
    k = sum(1 for y, m, _, _ in recs if TY - y > L(m)[idx])
    R['past_' + lab] = [k, round(100 * k / n, 2)]
R['past_typical_by_group'] = dict(collections.Counter(L(m)[0] for y, m, _, _ in recs if TY - y > L(m)[2]))
R['iron_n'] = sum(1 for y, m, _, _ in recs if L(m)[0].startswith('Cast'))
R['iron_median'] = statistics.median([y for y, m, _, _ in recs if L(m)[0].startswith('Cast')])
R['by_decade'] = dict(sorted(collections.Counter(f'{y//10*10}s' for y in ys).items()))
R['clay_by_decade'] = dict(sorted(collections.Counter(f'{y//10*10}s' for y, m, _, _ in recs if L(m)[0].startswith('Clay')).items()))
R['wave'] = {fy: sum(1 for y, m, _, _ in recs if fy - y > L(m)[2]) for fy in range(2026, 2077, 5)}
R['cipp_by_year'] = dict(sorted(collections.Counter(y for y, m, _, _ in recs if m == 'CIPP').items()))
R['plastic_life'] = L('PVC')
# communities: independent spatial join using the midpoint of each line
cm = q('surr-xmvs', **{'$select': 'comm_code,name,multipolygon', '$limit': 5000})
polys = []; names = []
for c in cm:
    if c.get('multipolygon'):
        polys.append(shape(c['multipolygon'])); names.append(c['name'])
tree = STRtree(polys)
by = collections.defaultdict(list); miss = 0
for y, m, ln, g in recs:
    try:
        line = LineString(g['coordinates'][0]); p = line.interpolate(0.5, normalized=True)
    except Exception:
        miss += 1; continue
    hit = None
    for i in tree.query(p):
        if polys[i].contains(p): hit = names[i]; break
    if hit: by[hit].append((y, m))
    else: miss += 1
R['comm_unassigned'] = miss
comm = {}
for nm, xs in by.items():
    k = len(xs); yy = sorted(y for y, _ in xs)
    comm[nm] = {'n': k, 'median': statistics.median(yy), 'past_typ': round(100 * sum(1 for y, m in xs if TY - y > L(m)[2]) / k, 1)}
R['comm_named'] = {k: comm.get(k.upper()) or comm.get(k) for k in ['INGLEWOOD', 'RENFREW', 'BANFF TRAIL', 'WILDWOOD', 'FOREST LAWN', 'BRIDGELAND/RIVERSIDE', 'ALPINE PARK', 'GLACIER RIDGE']}
big = {k: v for k, v in comm.items() if v['n'] >= 1000}
R['oldest_median_1000plus'] = sorted(big.items(), key=lambda kv: kv[1]['median'])[:8]
R['oldest_median_any'] = sorted(comm.items(), key=lambda kv: kv[1]['median'])[:10]
R['top_past_typ_1000plus'] = sorted(big.items(), key=lambda kv: -kv[1]['past_typ'])[:8]
R['newest_median_1000plus'] = sorted(big.items(), key=lambda kv: -kv[1]['median'])[:6]
# 311
T = ['WATS - Sewage Back-up', 'WATS - Sewer Maintenance', 'WATS - Catch Basin Concerns']
inn = 'service_name in(' + ','.join("'" + t + "'" for t in T) + ')'
R['req_all'] = q('iahh-g8bj', **{'$select': 'date_extract_y(requested_date) as y,count(*) as n', '$where': inn + " AND requested_date>='2020-01-01'", '$group': 'y', '$order': 'y'})
R['req_nodup'] = q('iahh-g8bj', **{'$select': 'date_extract_y(requested_date) as y,count(*) as n', '$where': inn + " AND requested_date>='2020-01-01' AND status_description not like 'Duplicate%'", '$group': 'y', '$order': 'y'})
R['req_types_2025'] = q('iahh-g8bj', **{'$select': 'service_name,count(*) as n', '$where': inn + " AND requested_date>='2025-01-01' AND requested_date<'2026-01-01'", '$group': 'service_name'})
R['sewer_service_names'] = q('iahh-g8bj', **{'$select': 'service_name,count(*) as n', '$where': "(upper(service_name) like '%SEW%' OR upper(service_name) like '%CATCH%') AND requested_date>='2025-01-01' AND requested_date<'2026-01-01'", '$group': 'service_name'})
# catalogue: does the City publish sewer mains or inspections?
cat = {}
for term in ('sanitary', 'sewer', 'wastewater', 'sewer main', 'inspection', 'CCTV'):
    try:
        c = get('https://api.us.socrata.com/api/catalog/v1?' + urllib.parse.urlencode({'domains': 'data.calgary.ca', 'q': term, 'limit': 40}))
        cat[term] = [(x['resource']['name'], x['resource']['id'], x['resource'].get('updatedAt', '')[:10]) for x in c['results']]
    except Exception as e:
        cat[term] = str(e)
R['catalog'] = cat
json.dump(R, open(os.path.join(out, 'audit.json'), 'w'), indent=1, default=str)
print(json.dumps({k: R[k] for k in ('n', 'km', 'median_year_true', 'past_typical')}, default=str))
