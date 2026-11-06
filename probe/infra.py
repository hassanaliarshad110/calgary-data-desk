import json, os, sys, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
def get(u):
    with urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'CalgaryDataDesk/1.0'}), timeout=120) as r:
        return json.loads(r.read().decode('utf-8'))
found = {}
for q in ['condition', 'pavement', 'pavement quality', 'sidewalk', 'bridge', 'asset condition', 'infrastructure', 'road condition',
          'pothole', 'culvert', 'water main', 'water main break', 'sewer', 'streetlight', 'retaining wall', 'playground condition',
          'facility condition', 'traffic signal', 'curb', 'lane', 'asphalt', 'rehabilitation', 'paving', 'storm']:
    try:
        d = get('https://data.calgary.ca/api/catalog/v1?' + urllib.parse.urlencode({'q': q, 'only': 'dataset', 'limit': 50, 'domains': 'data.calgary.ca'}))
    except Exception as e:
        print('ERR', q, e); continue
    for r in d.get('results', []):
        x = r['resource']
        found.setdefault(x['id'], {'name': x['name'], 'desc': (x.get('description') or '')[:400], 'updated': x.get('data_updated_at') or x.get('updatedAt'),
                                   'cols': x.get('columns_name') or [], 'type': x.get('type'), 'q': q})
# a sample of rows and the row count for each
for k, v in found.items():
    try:
        v['count'] = get(f'https://data.calgary.ca/resource/{k}.json?$select=count(*)')[0]
        v['sample'] = get(f'https://data.calgary.ca/resource/{k}.json?$limit=2')
    except Exception as e:
        v['err'] = str(e)[:120]
json.dump(found, open(os.path.join(out, 'infra.json'), 'w'), indent=1)
for k, v in found.items():
    print(k, '|', v['name'], '|', v.get('updated'), '|', v.get('count'), '|', ', '.join(v['cols'][:20]))
