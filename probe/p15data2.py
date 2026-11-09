import json, os, sys, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True); R = {}
def get(u, t=180):
    try: return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'CalgaryInsight/1.0'}), timeout=t))
    except Exception as e: return {'ERR': str(e)}
for ds in ('fu7z-c7ar', '3u3x-hrc7', 'cchr-krqg', 'uc4c-6kbd'):
    m = get(f'https://data.calgary.ca/api/views/{ds}.json')
    R[ds] = {'name': m.get('name'), 'desc': (m.get('description') or '')[:600], 'updated': m.get('rowsUpdatedAt'),
             'cols': [(c['fieldName'], c['dataTypeName']) for c in m.get('columns', [])] if isinstance(m, dict) else m}
    R[ds]['count'] = get(f'https://data.calgary.ca/resource/{ds}.json?$select=count(*)')
    s = get(f'https://data.calgary.ca/resource/{ds}.json?$limit=2')
    R[ds]['sample'] = json.dumps(s)[:1500]
b = get('https://data.calgary.ca/resource/fu7z-c7ar.json?$limit=500')
R['bridges_all'] = b if isinstance(b, list) else b
json.dump(R, open(os.path.join(out, 'p15b.json'), 'w'), indent=1); print('ok')
