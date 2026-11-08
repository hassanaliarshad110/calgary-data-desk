import json, os, sys, urllib.request, urllib.parse
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True); res = {}
for q in ['contour', 'elevation', 'digital elevation model', 'lidar', 'stormwater pond', 'park sites']:
    u = 'https://api.us.socrata.com/api/catalog/v1?' + urllib.parse.urlencode({'domains': 'data.calgary.ca', 'q': q, 'limit': 12})
    d = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'CalgaryGameMap/1.0'}), timeout=60).read())
    res[q] = [(r['resource']['id'], r['resource']['name'], r['resource'].get('type'), r['resource'].get('columns_field_name', [])[:12]) for r in d.get('results', [])]
json.dump(res, open(os.path.join(OUT, 'catalog.json'), 'w'), indent=1)
