import json, os, sys, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True); R = {}
def get(u, data=None, t=180):
    try:
        req = urllib.request.Request(u, data=data, headers={'User-Agent': 'CalgaryInsight/1.0'})
        return json.load(urllib.request.urlopen(req, timeout=t))
    except Exception as e: return {'ERR': str(e)}
for term in ('plus 15', '+15', 'skywalk', 'building footprint', 'buildings', 'roof', '3D', 'building height', 'parcel'):
    c = get('https://api.us.socrata.com/api/catalog/v1?' + urllib.parse.urlencode({'domains': 'data.calgary.ca', 'q': term, 'limit': 20}))
    R['cat_' + term] = [(x['resource']['name'], x['resource']['id'], x['resource'].get('type')) for x in c.get('results', [])] if isinstance(c, dict) else c
# OpenStreetMap: downtown Calgary bbox (S,W,N,E)
bbox = '51.0395,-114.0880,51.0540,-114.0470'
q = f'[out:json][timeout:120];(way["building"]({bbox});relation["building"]({bbox}););out tags center;'
r = get('https://overpass-api.de/api/interpreter', data=urllib.parse.urlencode({'data': q}).encode())
els = r.get('elements', []) if isinstance(r, dict) else []
R['osm_buildings'] = len(els)
R['osm_with_height'] = sum(1 for e in els if 'height' in e.get('tags', {}) or 'building:levels' in e.get('tags', {}))
R['osm_named'] = sorted([e['tags'].get('name') for e in els if e.get('tags', {}).get('name')])[:200]
q2 = f'[out:json][timeout:120];(way["bridge"]["highway"~"footway|corridor|pedestrian"]({bbox});way["highway"="corridor"]({bbox});way["indoor"="corridor"]({bbox}););out tags geom;'
r2 = get('https://overpass-api.de/api/interpreter', data=urllib.parse.urlencode({'data': q2}).encode())
e2 = r2.get('elements', []) if isinstance(r2, dict) else []
R['osm_skyways'] = len(e2); R['osm_skyway_tags'] = [e.get('tags') for e in e2[:40]]
R['osm_err'] = [r.get('ERR') if isinstance(r, dict) else None, r2.get('ERR') if isinstance(r2, dict) else None]
json.dump(R, open(os.path.join(out, 'p15.json'), 'w'), indent=1); print('ok')
