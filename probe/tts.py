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
try:
    els = overpass('[out:json][timeout:220];relation["boundary"="administrative"]["admin_level"="8"]["name"="Calgary"];out geom;')
    g = rel_poly(els[0]); res['boundary'] = poly_out(g, 40); log.append(f'boundary area km2 {g.area/1e6:.1f}, parts {len(res["boundary"])}')
except Exception as ex: log.append(f'boundary FAILED {ex}')
try:
    els = overpass(f'[out:json][timeout:220];(relation["natural"="water"]({BBOX});relation["landuse"="reservoir"]({BBOX});way["landuse"="reservoir"]({BBOX});way["natural"="water"]["water"~"river|reservoir"]({BBOX}););out geom tags;')
    water = []
    for e in els:
        if e['type'] == 'relation': g = rel_poly(e)
        else:
            pts = [xy(p['lon'], p['lat']) for p in e.get('geometry', [])]
            g = Polygon(pts).buffer(0) if len(pts) > 3 and pts[0] == pts[-1] else None
        if g is None or g.is_empty or g.area < 30000: continue
        water.append({'name': e.get('tags', {}).get('name', ''), 'kind': e.get('tags', {}).get('water', e.get('tags', {}).get('landuse', '')), 'area_ha': round(g.area / 1e4, 1), 'polys': poly_out(g, 8)})
    water.sort(key=lambda w: -w['area_ha']); res['water_extra'] = water
    log.append('water_extra: ' + ', '.join(f"{w['name'] or '?'}[{w['kind']}]({w['area_ha']}ha)" for w in water[:25]))
except Exception as ex: log.append(f'water FAILED {ex}')
try:
    els = overpass(f'[out:json][timeout:220];(way["railway"="light_rail"]({BBOX}););out geom tags;')
    by = {}
    for e in els:
        if 'geometry' not in e: continue
        by.setdefault(e['tags'].get('service', 'main'), []).append(LineString([xy(p['lon'], p['lat']) for p in e['geometry']]))
    lines = []
    for k, ls in by.items():
        if k != 'main': continue
        m = linemerge(ls); parts = [m] if isinstance(m, LineString) else list(m.geoms)
        lines += [[[round(x), round(y)] for x, y in p.simplify(8).coords] for p in parts if p.length > 50]
    res['lrt'] = lines
    st = overpass(f'[out:json][timeout:120];(node["railway"="station"]["station"="light_rail"]({BBOX});node["public_transport"="station"]["light_rail"="yes"]({BBOX}););out;')
    seen = {}
    for e in st:
        n = e.get('tags', {}).get('name', '')
        if n and n not in seen: seen[n] = {'name': n, 'xy': xy(e['lon'], e['lat'])}
    res['lrt_stations'] = list(seen.values()); log.append(f'lrt lines {len(lines)}, stations {len(seen)}')
except Exception as ex: log.append(f'lrt FAILED {ex}')
json.dump(res, open(os.path.join(out, 'extra.json'), 'w'), separators=(',', ':'))
open(os.path.join(out, 'report2.txt'), 'w').write('\n'.join(log)); print('\n'.join(log))
