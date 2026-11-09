"""Plus 15 video: downtown 3D data (City LiDAR buildings, Plus 15 bridges and walkways, OSM river and streets), three.js, narration."""
import json, os, sys, math, re, subprocess, urllib.request, urllib.parse, tarfile, io
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
def get(u, data=None, t=300):
    for i in range(3):
        try:
            req = urllib.request.Request(u, data=data, headers={'User-Agent': 'CalgaryInsight/1.0'})
            return json.load(urllib.request.urlopen(req, timeout=t))
        except Exception as e: err = e
    raise err
LON0, LAT0 = -114.0690, 51.0480
KX, KY = math.cos(math.radians(LAT0)) * 111320, 110540
P = lambda lon, lat: (round((lon - LON0) * KX, 1), round((lat - LAT0) * KY, 1))
W, S, E, N = -114.0960, 51.0380, -114.0420, 51.0570
D = {'origin': [LON0, LAT0]}
# buildings (LiDAR roof outlines with ground and roof elevation)
bl = []; off = 0
while True:
    q = {'$select': 'grd_elev_min_z,rooftop_elev_z,struct_id,stage,polygon', '$where': f'within_box(polygon,{N},{W},{S},{E})', '$limit': 50000, '$offset': off}
    page = get('https://data.calgary.ca/resource/cchr-krqg.json?' + urllib.parse.urlencode(q))
    bl += page; off += 50000
    if len(page) < 50000: break
B = []
for b in bl:
    try:
        h = float(b['rooftop_elev_z']) - float(b['grd_elev_min_z'])
        ring = b['polygon']['coordinates'][0]
    except Exception: continue
    if h < 2: continue
    B.append({'h': round(h, 1), 'g': round(float(b['grd_elev_min_z']), 1), 'p': [P(x, y) for x, y in ring]})
D['buildings'] = B
# Plus 15 bridges
br = get('https://data.calgary.ca/resource/fu7z-c7ar.json?$limit=500')
BR = []
for b in br:
    rings = re.findall(r'\(\(([^()]+)\)\)', b.get('polygon') or '')
    pts = [[P(float(a), float(c)) for a, c in (xy.split() for xy in r.split(','))] for r in rings]
    BR.append({'name': b.get('location'), 'year': int(b['const_dec'][:4]) if b.get('const_dec') else None, 'type': b.get('conn_type'),
               'stype': b.get('structure_type'), 'clear': b.get('posted_clearance'), 'cross': b.get('cross_loc'), 'p': pts})
D['bridges'] = BR
# Plus 15 walkways (all structures)
wk = get('https://data.calgary.ca/resource/3u3x-hrc7.json?$limit=1000')
D['walkways'] = [{'t': w.get('structure_type'), 'p': [[P(x, y) for x, y in ring] for poly in w['the_geom']['coordinates'] for ring in poly[:1]]} for w in wk if w.get('the_geom')]
# OSM: river, streets, a few landmarks
def ov(q):
    return get('https://overpass-api.de/api/interpreter', data=urllib.parse.urlencode({'data': q}).encode())
bb = f'{S - 0.01},{W - 0.02},{N + 0.01},{E + 0.02}'
r = ov(f'[out:json][timeout:180];(way["natural"="water"]({bb});relation["natural"="water"]({bb});way["waterway"="riverbank"]({bb});way["water"="river"]({bb});relation["water"="river"]({bb}););out geom;')
water = []
for e in r.get('elements', []):
    if e['type'] == 'way' and 'geometry' in e:
        water.append([P(g['lon'], g['lat']) for g in e['geometry']])
    elif e['type'] == 'relation':
        for m in e.get('members', []):
            if m.get('role') == 'outer' and 'geometry' in m:
                water.append([P(g['lon'], g['lat']) for g in m['geometry']])
D['water'] = water
r = ov(f'[out:json][timeout:180];way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|unclassified"]({S},{W},{N},{E});out geom;')
D['streets'] = [{'k': e['tags'].get('highway'), 'p': [P(g['lon'], g['lat']) for g in e['geometry']]} for e in r.get('elements', []) if 'geometry' in e]
r = ov(f'[out:json][timeout:120];(nwr["name"~"^(Calgary Tower|The Bow|Westin Calgary|Calgary Place|Brookfield Place|TELUS Sky|Bankers Hall|CORE Shopping Centre|The CORE Shopping Centre|Calgary City Hall)$"]({S},{W},{N},{E}););out center tags;')
D['landmarks'] = [{'name': e['tags']['name'], 'xy': P((e.get('center') or e)['lon'], (e.get('center') or e)['lat'])} for e in r.get('elements', []) if (e.get('center') or e.get('lon'))]
json.dump(D, open(os.path.join(out, 'p15_3d.json'), 'w'), separators=(',', ':'))
print('buildings', len(B), 'bridges', len(BR), 'walkways', len(D['walkways']), 'water', len(water), 'streets', len(D['streets']), 'landmarks', D['landmarks'])
# three.js (UMD build)
subprocess.run(['npm', 'pack', 'three@0.150.1', '--silent'], cwd=out, check=True)
with tarfile.open(os.path.join(out, 'three-0.150.1.tgz')) as t:
    open(os.path.join(out, 'three.min.js'), 'wb').write(t.extractfile('package/build/three.min.js').read())
os.remove(os.path.join(out, 'three-0.150.1.tgz'))
# narration
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'kokoro-onnx', 'soundfile'], check=True)
base = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
for f in ('kokoro-v1.0.onnx', 'voices-v1.0.bin'):
    if not os.path.exists(f): urllib.request.urlretrieve(base + f, f)
from kokoro_onnx import Kokoro
import soundfile as sf
k = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin')
L = json.load(open(os.path.join(os.path.dirname(__file__), 'p15_lines.json')))
durs = {}
for name, lines in L.items():
    durs[name] = []
    for i, t in enumerate(lines):
        a, sr = k.create(t, voice='af_heart', speed=1.0, lang='en-us')
        sf.write(os.path.join(out, f'{name}_{i}.wav'), a, sr); durs[name].append(round(len(a) / sr, 3))
json.dump(durs, open(os.path.join(out, 'durs.json'), 'w')); print(durs)
