"""One-off follow-up: city boundary, reservoirs/river areas and CTrain lines for the motion engine's geometry pack."""
import json, math, os, subprocess, sys, time, urllib.parse, urllib.request
out = os.path.join(sys.argv[1], 'geo'); os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'shapely'], check=True)
from shapely.geometry import LineString, Polygon
from shapely.ops import polygonize, unary_union, linemerge
O_LAT, O_LON = 51.0447, -114.0719
KX = 111320.0 * math.cos(math.radians(O_LAT)); KY = 110574.0
BBOX = '50.84,-114.32,51.22,-113.85'
UA = {'User-Agent': 'calgaryinsight.ca studio (hello@calgaryinsight.ca)'}
EP = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter']
log = []
def xy(lon, lat): return (round((lon - O_LON) * KX, 1), round((lat - O_LAT) * KY, 1))
def overpass(q):
    for a in range(6):
        ep = EP[a % 3]
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(ep, data=urllib.parse.urlencode({'data': q}).encode(), headers=UA), timeout=240))['elements']
        except Exception as e:
            log.append(f'retry {a} {ep}: {e}'); time.sleep(10 + 10 * a)
    raise RuntimeError('overpass failed')
def poly_out(g, tol):
    g = g.simplify(tol, preserve_topology=True); ps = [g] if isinstance(g, Polygon) else list(getattr(g, 'geoms', []))
    return [[[[round(x), round(y)] for x, y in p.exterior.coords]] + [[[round(x), round(y)] for x, y in h.coords] for h in p.interiors] for p in ps if isinstance(p, Polygon) and p.area > 1]
def rel_poly(e):
    lines = [LineString([xy(p['lon'], p['lat']) for p in m['geometry']]) for m in e.get('members', []) if 'geometry' in m and len(m['geometry']) > 1]
    polys = list(polygonize(linemerge(lines) if lines else []))
    if not polys: return None
    # even-odd: outer minus inner via symmetric difference of all faces is not needed; polygonize yields faces, union them, inner rings become holes when they are separate faces of role inner
    outer = unary_union([p for p in polys])
    inners = [LineString([xy(p['lon'], p['lat']) for p in m['geometry']]) for m in e.get('members', []) if m.get('role') == 'inner' and 'geometry' in m and len(m['geometry']) > 3]
    if inners:
        ip = list(polygonize(linemerge(inners)))
        if ip: outer = outer.difference(unary_union(ip))
    return outer
res = {}
for key, q in [('boundary', '[out:json][timeout:120];(relation["boundary"="administrative"]["name"="Calgary"];relation["boundary"="administrative"]["name"="City of Calgary"];);out geom;'),
               ('glenmore', '[out:json][timeout:120];relation(10609633);out geom;')]:
    try:
        els = [e for e in overpass(q) if e['type'] == 'relation']
        log.append(f'{key}: {[(e["id"], e.get("tags",{}).get("name"), e.get("tags",{}).get("admin_level")) for e in els]}')
        if key == 'boundary': els = [e for e in els if e.get('tags', {}).get('admin_level') in ('8', None)] or els
        g = rel_poly(els[0]); res[key] = poly_out(g, 40 if key == 'boundary' else 8); log.append(f'{key} area km2 {g.area/1e6:.2f}')
    except Exception as ex: log.append(f'{key} FAILED {ex}')
json.dump(res, open(os.path.join(out, 'extra3.json'), 'w'), separators=(',', ':'))
open(os.path.join(out, 'report3.txt'), 'w').write('\n'.join(log)); print('\n'.join(log))
# then the normal narration job on probe/tts_lines.json
out = sys.argv[1]
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'kokoro-onnx', 'soundfile'], check=True)
base = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
for f in ('kokoro-v1.0.onnx', 'voices-v1.0.bin'):
    if not os.path.exists(f): urllib.request.urlretrieve(base + f, f)
from kokoro_onnx import Kokoro
import soundfile as sf
k = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin')
L = json.load(open(os.path.join(os.path.dirname(__file__), 'tts_lines.json')))
durs = {}
for name, lines in L.items():
    durs[name] = []
    for i, t in enumerate(lines):
        a, sr = k.create(t, voice='af_heart', speed=1.0, lang='en-us')
        sf.write(os.path.join(out, f'{name}_{i}.wav'), a, sr)
        durs[name].append(round(len(a) / sr, 3))
json.dump(durs, open(os.path.join(out, 'durs.json'), 'w'))
print(durs)
