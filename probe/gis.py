import json, os, sys, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
B = 'https://gis.calgary.ca/arcgis/rest/services'
def get(u):
    with urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'CalgaryDataDesk/1.0'}), timeout=120) as r:
        return json.loads(r.read().decode('utf-8'))
res = {'folders': {}, 'layers': {}}
root = get(B + '?f=json')
res['root'] = root
for f in root.get('folders', []):
    try:
        d = get(f'{B}/{f}?f=json'); res['folders'][f] = [s['name'] + ':' + s['type'] for s in d.get('services', [])]
    except Exception as e:
        res['folders'][f] = 'ERR ' + str(e)[:80]
KEY = ('pave', 'pqi', 'condition', 'rehab', 'road', 'sidewalk', 'bridge', 'asset', 'pothole', 'street', 'lifecycle', 'water', 'sewer')
for f, svcs in res['folders'].items():
    if not isinstance(svcs, list):
        continue
    for s in svcs:
        name, typ = s.rsplit(':', 1)
        if not any(k in name.lower() for k in KEY):
            continue
        try:
            d = get(f'{B}/{name}/{typ}?f=json')
            for L in d.get('layers', []):
                lid = L['id']
                try:
                    info = get(f'{B}/{name}/{typ}/{lid}?f=json')
                    cnt = get(f'{B}/{name}/{typ}/{lid}/query?where=1%3D1&returnCountOnly=true&f=json').get('count')
                    samp = get(f'{B}/{name}/{typ}/{lid}/query?where=1%3D1&outFields=*&returnGeometry=false&resultRecordCount=2&f=json').get('features')
                except Exception as e:
                    info, cnt, samp = {}, 'ERR ' + str(e)[:60], None
                res['layers'][f'{name}/{typ}/{lid}'] = {'name': L.get('name'), 'count': cnt, 'fields': [x['name'] + ':' + (x.get('alias') or '') for x in (info.get('fields') or [])],
                                                     'desc': (info.get('description') or '')[:300], 'sample': samp}
        except Exception as e:
            res['layers'][name] = 'ERR ' + str(e)[:80]
json.dump(res, open(os.path.join(out, 'gis.json'), 'w'), indent=1)
for k, v in res['layers'].items():
    print(k, '|', v if isinstance(v, str) else (v['name'], v['count']))
