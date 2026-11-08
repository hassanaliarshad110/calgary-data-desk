import json, os, sys, urllib.request, urllib.parse, collections
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True); res = {}
H = {'User-Agent': 'CalgaryGameMap/1.0'}
if os.environ.get('SOCRATA_TOKEN'): H['X-App-Token'] = os.environ['SOCRATA_TOKEN']
def get(u): return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=300).read())
seen = {}
for q in ['traffic signals', 'traffic signal', 'pedestrian crossing', 'flashing beacon', 'traffic signs', 'ward boundaries', 'councillor']:
    try:
        r = get('https://api.us.socrata.com/api/catalog/v1?domains=data.calgary.ca&limit=8&q=' + urllib.parse.quote(q))
        res['q ' + q] = [x['resource']['id'] + ' ' + x['resource']['name'] + ' [' + x['resource']['type'] + ']' for x in r['results']]
        for x in r['results']:
            rs = x['resource']
            if rs['type'] == 'dataset': seen[rs['id']] = {'name': rs['name'], 'cols': rs.get('columns_field_name', [])[:40]}
    except Exception as e: res['q ' + q] = str(e)
for ds, v in seen.items():
    try:
        v['count'] = get(f'https://data.calgary.ca/resource/{ds}.json?$select=count(*)')
        v['sample'] = get(f'https://data.calgary.ca/resource/{ds}.json?$limit=2')
    except Exception as e: v['err'] = str(e)[:200]
res['datasets'] = seen
# traffic signs: what kinds exist
try:
    res['signs_by_type'] = get('https://data.calgary.ca/resource/u6ce-yibw.json?$select=pl_ty,count(*)&$group=pl_ty&$order=count(*)%20DESC&$limit=60')
    res['signs_text'] = get('https://data.calgary.ca/resource/u6ce-yibw.json?$select=sign_txt,count(*)&$group=sign_txt&$order=count(*)%20DESC&$limit=60')
except Exception as e: res['signs_err'] = str(e)[:300]
json.dump(res, open(os.path.join(OUT, 'report.json'), 'w'), indent=1, default=str)
