"""Calgary game: house numbers from the City of Calgary Parcel Address dataset (Open Government Licence - City of Calgary).
Writes addr.jsonl.gz {"n": house number (with suffix letter), "s": street, "x","y" (dm, game projection), "t": address type}."""
import gzip, json, math, os, sys, time, urllib.parse, urllib.request, collections
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
LAT0, LON0 = 51.0453, -114.0581
R = math.radians(LAT0)
KY = 111132.954 - 559.822 * math.cos(2 * R) + 1.175 * math.cos(4 * R)
KX = 111412.84 * math.cos(R) - 93.5 * math.cos(3 * R)
TOKEN = os.environ.get('SOCRATA_TOKEN', '')
def get(url):
    for i in range(6):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'CalgaryGameMap/1.0', **({'X-App-Token': TOKEN} if TOKEN else {})})
            with urllib.request.urlopen(req, timeout=300) as r: return r.read()
        except Exception as e:
            print('retry', i, e, flush=True); time.sleep(5 * (i + 1))
    raise RuntimeError(url)
meta = json.loads(get('https://data.calgary.ca/api/views/9zvu-p8uz.json'))
cols = [c['fieldName'] for c in meta.get('columns', [])]
log = {'cols': cols, 'license': (meta.get('license') or {}).get('name'), 'rows': meta.get('rowsUpdatedAt')}
print(log, flush=True)
off, n, page, types = 0, 0, 50000, collections.Counter()
with gzip.open(os.path.join(OUT, 'addr.jsonl.gz'), 'wt') as o:
    while True:
        rows = json.loads(get('https://data.calgary.ca/resource/9zvu-p8uz.json?' + urllib.parse.urlencode({'$limit': page, '$offset': off, '$order': ':id'})))
        for p in rows:
            if n == 0: log['sample'] = {k: str(v)[:80] for k, v in p.items()}
            lat, lon = p.get('latitude'), p.get('longitude')
            if (lat is None or lon is None) and isinstance(p.get('point'), dict):
                lon, lat = p['point']['coordinates'][:2]
            if lat is None or lon is None: continue
            lat, lon = float(lat), float(lon)
            num = (p.get('house_number') or '') + (p.get('house_alpha') or '')
            addr = p.get('address') or ''
            if not num and addr: num = addr.split(' ')[0]
            if not num: continue
            st = ' '.join(x for x in (p.get('street_name'), p.get('street_type'), p.get('street_quad')) if x) or ' '.join(addr.split(' ')[1:])
            t = p.get('address_type') or ''; types[t] += 1
            o.write(json.dumps({'n': num, 's': st, 't': t, 'x': round((lon - LON0) * KX * 10), 'y': round((lat - LAT0) * KY * 10)}, separators=(',', ':')) + '\n'); n += 1
        print('rows', off, len(rows), n, flush=True)
        if len(rows) < page: break
        off += page
log['count'] = n; log['types'] = dict(types)
json.dump(log, open(os.path.join(OUT, 'addr_log.json'), 'w'), indent=1)
