import json, os, sys, urllib.request, urllib.parse, collections
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True); res = {}
H = {'User-Agent': 'CalgaryGameMap/1.0'}
if os.environ.get('SOCRATA_TOKEN'): H['X-App-Token'] = os.environ['SOCRATA_TOKEN']
def get(u): return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=300).read())
res['status'] = get('https://data.calgary.ca/resource/u6ce-yibw.json?$select=sta_cd,sgn_sta_cd,count(*)&$group=sta_cd,sgn_sta_cd&$limit=50')
rows = []; off = 0
where = urllib.parse.quote("blade_type in('Stop','Yield','Playground','School','Speed','Pedestrian')")
while True:
    r = get(f'https://data.calgary.ca/resource/u6ce-yibw.json?$select=point,facing_cd,blade_type,book_cd,sign_txt,sta_cd,sgn_sta_cd&$where={where}&$limit=50000&$offset={off}&$order=:id')
    rows += r; off += len(r)
    if len(r) < 50000: break
json.dump(rows, open(os.path.join(OUT, 'signs.json'), 'w'), separators=(',', ':'))
res['n'] = len(rows); res['blade'] = collections.Counter(r.get('blade_type') for r in rows).most_common()
res['sta'] = collections.Counter((r.get('sta_cd'), r.get('sgn_sta_cd')) for r in rows).most_common()
json.dump(res, open(os.path.join(OUT, 'report.json'), 'w'), indent=1, default=str)
