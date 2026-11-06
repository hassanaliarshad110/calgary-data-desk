"""Calgary game: City of Calgary public tree inventory (Open Government Licence - City of Calgary).
Writes trees.jsonl.gz: {"x": dm, "y": dm, "g": genus, "d": dbh cm, "n": common name}. Same projection as game_map.py."""
import gzip, json, math, os, sys, time, urllib.parse, urllib.request
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
LAT0, LON0 = 51.0453, -114.0581
R = math.radians(LAT0)
KY = 111132.954 - 559.822 * math.cos(2 * R) + 1.175 * math.cos(4 * R)
KX = 111412.84 * math.cos(R) - 93.5 * math.cos(3 * R)
TOKEN = os.environ.get('SOCRATA_TOKEN', '')
def get(url):
    for i in range(5):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'CalgaryGameMap/1.0', **({'X-App-Token': TOKEN} if TOKEN else {})})
            with urllib.request.urlopen(req, timeout=300) as r: return r.read()
        except Exception as e:
            print('retry', i, e, flush=True); time.sleep(5 * (i + 1))
    raise RuntimeError(url)
log = {}
# find the tree dataset in the City catalogue
cat = json.loads(get('https://api.us.socrata.com/api/catalog/v1?domains=data.calgary.ca&q=public%20trees&limit=10'))
log['catalog'] = [(r['resource']['id'], r['resource']['name']) for r in cat.get('results', [])]
ds = next((i for i, n in log['catalog'] if 'tree' in n.lower() and 'public' in n.lower()), 'tfs4-3wwa')
log['dataset'] = ds
off, n, page = 0, 0, 50000
with gzip.open(os.path.join(OUT, 'trees.jsonl.gz'), 'wt') as o:
    while True:
        data = json.loads(get(f'https://data.calgary.ca/resource/{ds}.geojson?' + urllib.parse.urlencode({'$limit': page, '$offset': off, '$order': ':id'})))
        feats = data.get('features', [])
        for f in feats:
            g = f.get('geometry'); p = f.get('properties') or {}
            if not g or g.get('type') != 'Point': continue
            if n == 0: log['sample'] = {k: str(v)[:60] for k, v in p.items()}
            lon, lat = g['coordinates'][:2]
            o.write(json.dumps({'x': round((lon - LON0) * KX * 10), 'y': round((lat - LAT0) * KY * 10),
                                'g': p.get('genus'), 'd': p.get('dbh_cm'), 'n': p.get('common_name'), 'm': p.get('mature_size')}) + '\n')
            n += 1
        print('trees', n, flush=True)
        if len(feats) < page: break
        off += page
log['trees'] = n
json.dump(log, open(os.path.join(OUT, 'log.json'), 'w'), indent=1)
