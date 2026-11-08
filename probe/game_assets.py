"""Calgary game: park furniture and playgrounds from Open Calgary (Parks Seating, Playground Equipment,
Playground Fall Surface, Parks Plumbing Fixtures, Parks Amenity Equipment, Parks Signage)."""
import json, os, sys, urllib.request, urllib.parse, collections
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
H = {'User-Agent': 'CalgaryGameMap/1.0'}
if os.environ.get('SOCRATA_TOKEN'): H['X-App-Token'] = os.environ['SOCRATA_TOKEN']
def get(u): return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=300).read())
rep = {}
for ds, name in [('ikeb-n5bc', 'seating'), ('bdu9-amk8', 'playground'), ('qcug-xuqg', 'fall'), ('jjkg-kv4n', 'plumbing'), ('7v8c-cjjm', 'amenity'), ('97dx-rvjp', 'signage')]:
    rows = []; off = 0
    while True:
        r = get(f'https://data.calgary.ca/resource/{ds}.json?$limit=20000&$offset={off}&$order=:id'); rows += r; off += len(r)
        if len(r) < 20000: break
    with open(os.path.join(OUT, name + '.json'), 'w') as f: json.dump(rows, f, separators=(',', ':'))
    keys = collections.Counter(k for r in rows for k in r)
    rep[name] = {'n': len(rows), 'keys': keys.most_common()}
    for k in ('type_description', 'minortype', 'asset_type', 'life_cycle_status', 'orientation', 'style', 'edge_material', 'asset_class', 'equipment_age_class', 'support_type'):
        if k in keys: rep[name][k] = collections.Counter(str(r.get(k)) for r in rows).most_common(40)
json.dump(rep, open(os.path.join(OUT, 'report.json'), 'w'), indent=1)
