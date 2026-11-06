import sys, os, json, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
UA = {'User-Agent': 'CalgaryInsight research'}
def get(url):
    try:
        return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()
    except Exception as e:
        print('FAIL', url, e); return b''
seen = {}
Q = ['land use designation', 'land use district', 'municipal reserve', 'school reserve', 'reserve parcel', 'school site',
     'future school', 'future park', 'park development', 'parks projects', 'capital projects', 'capital budget',
     'area structure plan', 'outline plan', 'local area plan', 'policy plan boundaries', 'new community', 'subdivision',
     'tentative plan', 'recreation facility', 'library', 'fire station', 'playground', 'parks sites', 'open space',
     'pathway', 'transit network', 'BRT', 'green line', 'emergency response station', 'growth', 'land supply',
     'developer funded', 'off-site levy', 'parcel', 'reserve', 'joint use', 'construction projects']
for q in Q:
    d = get('https://data.calgary.ca/api/catalog/v1?domains=data.calgary.ca&limit=40&only=dataset,map,file,href&q=' + urllib.parse.quote(q))
    try:
        res = json.loads(d)['results']
    except Exception:
        continue
    for r in res:
        x = r['resource']
        if x['id'] not in seen:
            seen[x['id']] = {'id': x['id'], 'name': x['name'], 'type': x.get('type'), 'updated': (x.get('updatedAt') or '')[:10],
                             'desc': (x.get('description') or '')[:300], 'cols': x.get('columns_field_name', [])[:40], 'q': q}
json.dump(list(seen.values()), open(os.path.join(out, 'catalog.json'), 'w'), indent=1)
print('datasets', len(seen))
# Land use districts: what fields, which special purpose districts
for ds in ['qe6k-p9nh', 'mw9j-jik5']:
    m = get(f'https://data.calgary.ca/api/views/{ds}.json')
    if m:
        open(os.path.join(out, f'{ds}_meta.json'), 'wb').write(m)
# parks sites planning categories
b = get('https://data.calgary.ca/resource/kami-qbfh.json?$select=planning_category,asset_class,maintenance_info,count(*)%20as%20n&$group=planning_category,asset_class,maintenance_info&$limit=500')
open(os.path.join(out, 'parks_cats.json'), 'wb').write(b)
m = get('https://data.calgary.ca/api/views/kami-qbfh.json'); open(os.path.join(out, 'kami_meta.json'), 'wb').write(m)
