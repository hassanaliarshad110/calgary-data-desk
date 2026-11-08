import json, os, sys, urllib.request, urllib.parse, collections
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True); res = {}
H = {'User-Agent': 'CalgaryGameMap/1.0'}
if os.environ.get('SOCRATA_TOKEN'): H['X-App-Token'] = os.environ['SOCRATA_TOKEN']
def get(u): return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=300).read())
sig = get('https://data.calgary.ca/resource/qr97-4jvx.json?$limit=50000')
json.dump(sig, open(os.path.join(OUT, 'signals.json'), 'w'))
res['sig_types'] = collections.Counter(r.get('int_type') for r in sig).most_common()
res['book'] = get('https://data.calgary.ca/resource/u6ce-yibw.json?$select=book_cd,blade_type,count(*),max(sign_txt)&$group=book_cd,blade_type&$order=count(*)%20DESC&$limit=120')
res['facing'] = get('https://data.calgary.ca/resource/u6ce-yibw.json?$select=facing_cd,count(*)&$group=facing_cd&$limit=20')
# stop and yield signs: guess by book code after seeing the list; fetch the likely ones now
for cd in ['SG_14-001', 'SG_14-002', 'SG_14-101', 'SG_14-102', 'RA-1', 'RA-2']:
    try: res['n ' + cd] = get(f"https://data.calgary.ca/resource/u6ce-yibw.json?$select=count(*)&$where=book_cd='{cd}'")
    except Exception as e: res['n ' + cd] = str(e)[:100]
json.dump(res, open(os.path.join(OUT, 'report.json'), 'w'), indent=1, default=str)
