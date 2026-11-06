import json, os, sys, re, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
UA = {'User-Agent': 'CalgaryDataDesk/1.0'}
def get(u, t=120):
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=t) as r:
        return json.loads(r.read().decode('utf-8'))
def raw(u, t=120):
    with urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=t) as r:
        return r.read().decode('utf-8', 'replace')
res = {}
cat = get('https://data.calgary.ca/api/catalog/v1?' + urllib.parse.urlencode({'q': 'Progress Report', 'only': 'dataset', 'limit': 40, 'domains': 'data.calgary.ca'}))
ids = {x['resource']['id']: x['resource']['name'] for x in cat['results']}
ids['ruq3-99hx'] = 'Council and Committee Votes'
for k, n in ids.items():
    try:
        meta = get(f'https://data.calgary.ca/api/views/{k}.json')
        cols = [(c['fieldName'], c['name']) for c in meta.get('columns', [])]
        cnt = get(f'https://data.calgary.ca/resource/{k}.json?$select=count(*)')[0]
        samp = get(f'https://data.calgary.ca/resource/{k}.json?$limit=3')
        res[k] = {'name': n, 'updated': meta.get('rowsUpdatedAt'), 'cols': cols, 'count': cnt, 'sample': samp, 'desc': (meta.get('description') or '')[:400]}
    except Exception as e:
        res[k] = {'name': n, 'err': str(e)[:200]}
# votes: distribution by meeting date and a list of councillor names
try:
    v = res['ruq3-99hx']
    f = [c[0] for c in v['cols']]
    datef = next((c for c in f if 'date' in c.lower()), None)
    res['votes_by_year'] = get('https://data.calgary.ca/resource/ruq3-99hx.json?' + urllib.parse.urlencode({'$select': f'date_extract_y({datef}) as y,count(*) as n', '$group': 'y', '$order': 'y'})) if datef else None
except Exception as e:
    res['votes_err'] = str(e)[:200]
# Alberta bills, current legislature
for u in ['https://www.assembly.ab.ca/assembly-business/bills/bills-by-legislature?legl=31&session=2', 'https://www.assembly.ab.ca/assembly-business/bills/bills-by-legislature?legl=31&session=1']:
    try:
        h = raw(u)
        i = h.find('Bill 1')
        res[u] = h[i - 2000:i + 6000] if i > 0 else h[-6000:]
    except Exception as e:
        res[u] = 'ERR ' + str(e)[:200]
json.dump(res, open(os.path.join(out, 'cgyacc.json'), 'w'), indent=1)
for k, v in res.items():
    if isinstance(v, dict): print(k, v.get('name'), v.get('count'), [c[0] for c in v.get('cols', [])][:25])
