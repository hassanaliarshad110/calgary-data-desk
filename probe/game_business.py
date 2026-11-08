"""Calgary game: City of Calgary business licences (Open Government Licence - City of Calgary): name, type, address
and location of each licensed business. Writes businesses.jsonl.gz {"n","t","a","s","x","y"} (x/y in dm, same projection)."""
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
cat = json.loads(get('https://api.us.socrata.com/api/catalog/v1?domains=data.calgary.ca&q=business%20licences&limit=10'))
log['catalog'] = [(r['resource']['id'], r['resource']['name'], r['resource'].get('columns_field_name')) for r in cat.get('results', [])]
ds = next((i for i, n, c in log['catalog'] if n.lower().startswith('calgary business licen') and c), 'vdjc-pybd')
log['dataset'] = ds
off, n, page, stat = 0, 0, 50000, {}
with gzip.open(os.path.join(OUT, 'businesses.jsonl.gz'), 'wt') as o:
    while True:
        rows = json.loads(get(f'https://data.calgary.ca/resource/{ds}.json?' + urllib.parse.urlencode({'$limit': page, '$offset': off, '$order': ':id'})))
        for p in rows:
            if n == 0 and 'sample' not in log: log['sample'] = {k: str(v)[:80] for k, v in p.items()}
            if str(p.get('homeoccind', '')).upper() in ('Y', 'YES', 'TRUE', '1'): continue    # home-based businesses are people's homes: leave them out
            st = p.get('jobstatusdesc') or p.get('status') or ''
            stat[st] = stat.get(st, 0) + 1
            lat, lon = p.get('latitude'), p.get('longitude')
            if (not lat or not lon) and isinstance(p.get('point'), dict): lon, lat = p['point'].get('coordinates', [None, None])[:2]
            if not lat or not lon: continue
            lat, lon = float(lat), float(lon)
            o.write(json.dumps({'n': p.get('tradename'), 't': p.get('licencetypes'), 'a': p.get('address'), 's': st, 'c': p.get('comdistnm'), 'h': p.get('homeoccind'),
                                'x': round((lon - LON0) * KX * 10), 'y': round((lat - LAT0) * KY * 10)}, separators=(',', ':')) + '\n')
            n += 1
        print('rows', off + len(rows), 'kept', n, flush=True)
        if len(rows) < page: break
        off += page
log['kept'] = n; log['status'] = stat
json.dump(log, open(os.path.join(OUT, 'log.json'), 'w'), indent=1)
