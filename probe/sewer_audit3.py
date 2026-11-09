"""Does the City publish sewer mains, or pipe condition / inspection data? Sweep the open data catalogue and the public GIS."""
import json, os, sys, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
def get(u, t=120):
    try: return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'CalgaryInsight-audit/1.0'}), timeout=t))
    except Exception as e: return {'ERR': str(e)}
R = {'catalog': {}, 'gis': {}}
terms = ['sanitary', 'sewer', 'wastewater', 'main', 'mains', 'pipe', 'pipes', 'condition', 'infrastructure', 'asset', 'storm', 'stormwater',
         'manhole', 'utility', 'utilities', 'water', 'CCTV', 'inspection', 'linear', 'drainage', 'lift station', 'collection system']
seen = {}
for t in terms:
    off = 0
    while True:
        c = get('https://api.us.socrata.com/api/catalog/v1?' + urllib.parse.urlencode({'domains': 'data.calgary.ca', 'q': t, 'limit': 100, 'offset': off}))
        res = c.get('results', []) if isinstance(c, dict) else []
        for x in res:
            r = x['resource']; seen[r['id']] = [r['name'], r.get('type'), (r.get('updatedAt') or '')[:10], (r.get('description') or '')[:160].replace('\n', ' ')]
        if len(res) < 100 or off > 400: break
        off += 100
R['catalog'] = seen
# full catalogue names (every dataset) to grep
allc = {}; off = 0
while off < 3000:
    c = get('https://api.us.socrata.com/api/catalog/v1?' + urllib.parse.urlencode({'domains': 'data.calgary.ca', 'limit': 100, 'offset': off}))
    res = c.get('results', []) if isinstance(c, dict) else []
    for x in res: allc[x['resource']['id']] = x['resource']['name']
    if len(res) < 100: break
    off += 100
R['all_count'] = len(allc)
kw = ('sewer', 'sanit', 'wastewater', 'main', 'pipe', 'condition', 'storm', 'manhole', 'drain', 'culvert', 'utility', 'asset', 'infrastructure', 'catch basin', 'lift')
R['all_matches'] = {k: v for k, v in allc.items() if any(w in v.lower() for w in kw)}
# public GIS (ArcGIS REST): list folders and services, then look for sewer/sanitary layers
base = 'https://gis.calgary.ca/arcgis/rest/services'
root = get(base + '?f=json')
R['gis']['root'] = root
found = []
folders = root.get('folders', []) if isinstance(root, dict) else []
for fo in folders:
    d = get(f'{base}/{fo}?f=json')
    for s in (d.get('services', []) if isinstance(d, dict) else []):
        name = s['name']; typ = s['type']
        if any(w in name.lower() for w in ('sewer', 'sanit', 'water', 'util', 'storm', 'drain', 'wastewater', 'pipe', 'main', 'infra', 'asset')):
            info = get(f'{base}/{name}/{typ}?f=json')
            layers = [(l.get('id'), l.get('name')) for l in (info.get('layers', []) if isinstance(info, dict) else [])]
            found.append({'service': name, 'type': typ, 'layers': layers[:60], 'err': info.get('ERR') if isinstance(info, dict) else None})
R['gis']['matches'] = found
R['gis']['all_services'] = []
for fo in folders:
    d = get(f'{base}/{fo}?f=json')
    R['gis']['all_services'] += [s['name'] for s in (d.get('services', []) if isinstance(d, dict) else [])]
R['gis']['root_services'] = [s['name'] for s in root.get('services', [])] if isinstance(root, dict) else []
# the water mains dataset: what fields does it have (condition?)
m = get('https://data.calgary.ca/api/views/w6h9-w33i.json')
R['water_mains_columns'] = [(c['fieldName'], c.get('description', '')[:100]) for c in m.get('columns', [])] if isinstance(m, dict) else m
json.dump(R, open(os.path.join(out, 'audit3.json'), 'w'), indent=1); print('ok', len(seen), R['all_count'], len(found))
