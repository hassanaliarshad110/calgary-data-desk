import json, os, sys, urllib.request, urllib.parse
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True); res = {}
H = {'User-Agent': 'CalgaryGameMap/1.0'}
if os.environ.get('SOCRATA_TOKEN'): H['X-App-Token'] = os.environ['SOCRATA_TOKEN']
def get(u): return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=120).read())
seen = {}
for q in ['bench', 'playground', 'picnic table', 'park assets', 'park amenities', 'waste receptacle', 'outdoor fitness', 'skate park', 'spray park', 'parks infrastructure', 'drinking fountain', 'off leash', 'sports field', 'bike rack', 'tennis court', 'basketball']:
    try:
        r = get('https://api.us.socrata.com/api/catalog/v1?domains=data.calgary.ca&limit=8&q=' + urllib.parse.quote(q))
        for x in r['results']:
            rs = x['resource']; seen[rs['id']] = {'name': rs['name'], 'type': rs['type'], 'cols': rs.get('columns_field_name', [])[:40], 'desc': (rs.get('description') or '')[:300]}
        res['q ' + q] = [x['resource']['id'] + ' ' + x['resource']['name'] for x in r['results']]
    except Exception as e: res['q ' + q] = str(e)
res['datasets'] = seen
for ds, v in seen.items():
    if v['type'] not in ('dataset', 'map'): continue
    try:
        v['count'] = get(f'https://data.calgary.ca/resource/{ds}.json?$select=count(*)')
        v['sample'] = get(f'https://data.calgary.ca/resource/{ds}.json?$limit=2')
    except Exception as e: v['err'] = str(e)[:200]
json.dump(res, open(os.path.join(OUT, 'assets.json'), 'w'), indent=1, default=str)
