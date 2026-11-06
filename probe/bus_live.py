import json, os, sys, time, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import transit as t
os.makedirs(sys.argv[1], exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0'}
def get(u):
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60) as r:
        return r.read(), {k: v for k, v in r.headers.items() if k.lower() in ('cache-control', 'age', 'last-modified', 'etag', 'x-cache', 'cf-cache-status', 'date', 'expires')}
def vts(b):   # per-vehicle timestamps (VehiclePosition field 5)
    out = {}
    for n, ent in t.fields(b):
        if n != 2: continue
        vp = t._first(t.fields(ent), 4)
        if not vp: continue
        f = t.fields(vp); veh = t._first(f, 8); ts = t._first(f, 5)
        vid = t._text(t._first(t.fields(veh), 2) or t._first(t.fields(veh), 1)) if veh else ''
        out[vid] = ts
    return out
for i in range(7):
    meta = json.loads(get('https://data.calgary.ca/api/views/am7c-qe3u.json')[0])
    blob = meta.get('blobId')
    b1, h1 = get(f'https://data.calgary.ca/api/views/am7c-qe3u/files/{blob}?filename=vehiclepositions.pb')
    b2, h2 = get('https://data.calgary.ca/download/am7c-qe3u/application%2Foctet-stream')
    tu, _ = get('https://data.calgary.ca/download/gs4m-mdc2/application%2Foctet-stream')
    routes = t.trip_routes(tu)
    now = time.time()
    v1 = t.vehicles(b1); ts = vts(b1)
    r33 = [(v['vehicle'], v['lat'], v['lon'], ts.get(v['vehicle'])) for v in v1 if routes.get(v['trip']) == '33']
    ages = sorted(now - x for x in ts.values() if x)
    print(f"#{i} blob={blob} files_feed_age={now - (t.feed_time(b1) or 0):.0f}s download_feed_age={now - (t.feed_time(b2) or 0):.0f}s n={len(v1)} "
          f"veh_age_median={ages[len(ages)//2] if ages else None:.0f}s over3min={sum(a > 180 for a in ages)} over10min={sum(a > 600 for a in ages)}")
    print('   hdr_files', h1); print('   hdr_download', h2)
    print('   route33', [(a, la, lo, round(now - s) if s else None) for a, la, lo, s in r33])
    time.sleep(30)
