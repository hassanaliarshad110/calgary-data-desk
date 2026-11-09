# Find the City of Calgary open data on sports fields (cricket pitches, soccer and football fields) and download it.
import json, os, sys, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'yyc-city-stories'}), timeout=120).read()
found = {}
for q in ('sport surface', 'sports field', 'playfield', 'athletic park', 'cricket', 'park asset'):
    u = 'https://api.us.socrata.com/api/catalog/v1?' + urllib.parse.urlencode({'domains': 'data.calgary.ca', 'q': q, 'limit': 20})
    for r in json.loads(get(u))['results']:
        res = r['resource']; found[res['id']] = [res['name'], res.get('type'), (res.get('description') or '')[:200], res.get('columns_name', [])[:40]]
json.dump(found, open(os.path.join(out, 'catalog.json'), 'w'), indent=1)
for k, v in found.items():
    nm = v[0].lower()
    if any(w in nm for w in ('sport', 'playfield', 'athletic', 'cricket')) and v[1] in ('dataset', 'map'):
        try:
            d = get(f'https://data.calgary.ca/resource/{k}.geojson?$limit=60000')
            open(os.path.join(out, f'{k}.geojson'), 'wb').write(d); print(k, v[0], len(d))
        except Exception as e: print(k, v[0], 'ERR', e)
print(json.dumps({k: v[:2] for k, v in found.items()}, indent=1))
