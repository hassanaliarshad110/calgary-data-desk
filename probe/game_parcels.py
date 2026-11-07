"""Calgary game: City of Calgary Current Year Property Assessments (Parcel) - address, property use, year built and the
parcel outline, so every building in the game can be matched to its real property. Open Government Licence - City of Calgary.
Writes parcels.jsonl.gz: {"a": address, "u": property use, "t": property type, "c": assessment class, "y": year built,
"l": land use designation, "m": community, "s": land m2, "r": [[x,y],...] outer ring in dm (same projection as game_map.py)}."""
import gzip, json, math, os, sys, time, urllib.parse, urllib.request
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
LAT0, LON0 = 51.0453, -114.0581
R = math.radians(LAT0)
KY = 111132.954 - 559.822 * math.cos(2 * R) + 1.175 * math.cos(4 * R)
KX = 111412.84 * math.cos(R) - 93.5 * math.cos(3 * R)
TOKEN = os.environ.get('SOCRATA_TOKEN', '')
def get(url):
    for i in range(6):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'CalgaryGameMap/1.0', **({'X-App-Token': TOKEN} if TOKEN else {})})
            with urllib.request.urlopen(req, timeout=600) as r: return r.read()
        except Exception as e:
            print('retry', i, e, flush=True); time.sleep(5 * (i + 1))
    raise RuntimeError(url)
log = {}
cat = json.loads(get('https://api.us.socrata.com/api/catalog/v1?domains=data.calgary.ca&q=property%20assessments&limit=20'))
log['catalog'] = [(r['resource']['id'], r['resource']['name'], r['resource'].get('columns_field_name')) for r in cat.get('results', [])]
ds = next((i for i, n, c in log['catalog'] if 'current year property assessments' in n.lower() and 'parcel' in n.lower()), '4bsw-nn7w')
log['dataset'] = ds
json.dump(log, open(os.path.join(OUT, 'log.json'), 'w'), indent=1)
def simp(pts, tol):        # Douglas-Peucker on a closed ring
    if len(pts) < 5: return pts
    def rdp(a):
        if len(a) < 3: return a
        x0, y0 = a[0]; x1, y1 = a[-1]; dx, dy = x1 - x0, y1 - y0; L = math.hypot(dx, dy) or 1e-9
        best, bi = -1, 0
        for i in range(1, len(a) - 1):
            d = abs(dy * a[i][0] - dx * a[i][1] + x1 * y0 - y1 * x0) / L
            if d > best: best, bi = d, i
        return rdp(a[:bi + 1])[:-1] + rdp(a[bi:]) if best > tol else [a[0], a[-1]]
    far = max(range(len(pts)), key=lambda i: (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2)
    return rdp(pts[:far + 1])[:-1] + rdp(pts[far:] + [pts[0]])[:-1]
off, n, page = 0, 0, 50000
keys = None
with gzip.open(os.path.join(OUT, 'parcels.jsonl.gz'), 'wt') as o:
    while True:
        data = json.loads(get(f'https://data.calgary.ca/resource/{ds}.geojson?' + urllib.parse.urlencode({'$limit': page, '$offset': off, '$order': ':id'})))
        feats = data.get('features', [])
        for f in feats:
            g = f.get('geometry'); p = f.get('properties') or {}
            if keys is None: keys = sorted(p.keys()); log['columns'] = keys; log['sample'] = {k: str(v)[:80] for k, v in p.items()}
            if not g: continue
            polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']] if g['type'] == 'Polygon' else []
            if not polys: continue
            ring = max((pl[0] for pl in polys), key=len)
            r = simp([[round((lon - LON0) * KX * 10), round((lat - LAT0) * KY * 10)] for lon, lat in ring[:-1] if True], 3)
            pick = lambda *ks: next((p[k] for k in ks if p.get(k) not in (None, '')), None)
            o.write(json.dumps({'a': pick('address'), 'u': pick('sub_property_use', 'property_use'), 't': pick('property_type'), 'c': pick('assessment_class_description', 'assessment_class'),
                                'y': pick('year_of_construction'), 'l': pick('land_use_designation'), 'm': pick('comm_name'), 's': pick('land_size_sm'), 'v': pick('assessed_value'), 'r': r}, separators=(',', ':')) + '\n')
            n += 1
        print('parcels', n, flush=True)
        if len(feats) < page: break
        off += page
log['parcels'] = n
json.dump(log, open(os.path.join(OUT, 'log.json'), 'w'), indent=1)
