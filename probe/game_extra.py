"""Calgary game: traffic control points from OpenStreetMap (signals, stop signs, yield signs, crossings).
Same projection as game_map.py; output gzip JSON lines {"g": {"t":"pt","c":[x,y]} (decimetres), "p": tags}."""
import gzip, json, math, os, subprocess, sys, urllib.request
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
LAT0, LON0 = 51.0453, -114.0581
R = math.radians(LAT0)
KY = 111132.954 - 559.822 * math.cos(2 * R) + 1.175 * math.cos(4 * R)
KX = 111412.84 * math.cos(R) - 93.5 * math.cos(3 * R)
pbf = 'alberta.osm.pbf'
req = urllib.request.Request('https://download.geofabrik.de/north-america/canada/alberta-latest.osm.pbf', headers={'User-Agent': 'CalgaryGameMap/1.0'})
with urllib.request.urlopen(req, timeout=1200) as r, open(pbf, 'wb') as f:
    f.write(r.read())
subprocess.run(['osmium', 'extract', '-b', '-114.32,50.84,-113.85,51.22', '-s', 'smart', '--overwrite', '-o', 'calgary.osm.pbf', pbf], check=True)
subprocess.run(['osmium', 'tags-filter', 'calgary.osm.pbf', 'n/highway=traffic_signals,stop,give_way,crossing,mini_roundabout,turning_circle', 'n/railway=level_crossing,crossing',
                'n/crossing=traffic_signals', '--overwrite', '-o', 'ctrl.osm.pbf'], check=True)
subprocess.run(['osmium', 'export', 'ctrl.osm.pbf', '-f', 'geojsonseq', '--overwrite', '-o', 'ctrl.geojsonseq', '--geometry-types=point'], check=True)
n = 0
with gzip.open(os.path.join(OUT, 'control.jsonl.gz'), 'wt') as o:
    for line in open('ctrl.geojsonseq'):
        f = json.loads(line.strip().lstrip('\x1e'))
        lon, lat = f['geometry']['coordinates']
        p = {k: v for k, v in f['properties'].items() if k in ('highway', 'railway', 'crossing', 'traffic_signals', 'direction', 'traffic_signals:direction', 'stop', 'button_operated')}
        o.write(json.dumps({'g': {'t': 'pt', 'c': [round((lon - LON0) * KX * 10), round((lat - LAT0) * KY * 10)]}, 'p': p}) + '\n'); n += 1
json.dump({'control': n}, open(os.path.join(OUT, 'log.json'), 'w'))
print('control points', n)
