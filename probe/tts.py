"""One-off job on the studio-probe lane: build the Calgary base geometry pack used by the motion engine.
Sources: OpenStreetMap via Overpass (ODbL) and City of Calgary Open Data (Open Government Licence - City of Calgary).
Output: <out>/geo/calgary_base.json (local metres, x east, y north, origin below) and <out>/geo/report.txt
"""
import json, math, os, subprocess, sys, time, urllib.parse, urllib.request

out = os.path.join(sys.argv[1], 'geo'); os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'shapely'], check=True)
from shapely.geometry import shape, LineString, Polygon, MultiPolygon, mapping
from shapely.ops import linemerge, unary_union

O_LAT, O_LON = 51.0447, -114.0719          # origin: Calgary Tower, 101 9 Ave SW
KX = 111320.0 * math.cos(math.radians(O_LAT)); KY = 110574.0
BBOX = (50.84, -114.32, 51.22, -113.85)
DT = (51.030, -114.105, 51.060, -114.030)    # downtown, Beltline, East Village, Eau Claire, Stampede Park
UA = {'User-Agent': 'calgaryinsight.ca studio (hello@calgaryinsight.ca)'}
EP = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter',
      'https://overpass.private.coffee/api/interpreter']
log = []

def xy(lon, lat): return (round((lon - O_LON) * KX, 1), round((lat - O_LAT) * KY, 1))

def overpass(q):
    for attempt in range(6):
        ep = EP[attempt % len(EP)]
        try:
            req = urllib.request.Request(ep, data=urllib.parse.urlencode({'data': q}).encode(), headers=UA)
            return json.load(urllib.request.urlopen(req, timeout=240))['elements']
        except Exception as e:
            log.append(f'overpass retry {attempt} {ep}: {e}'); time.sleep(10 + attempt * 10)
    raise RuntimeError('overpass failed')

def b(bb): return ','.join(map(str, bb))

def ring(geom): return [xy(p['lon'], p['lat']) for p in geom]

def simp_line(pts, tol):
    if len(pts) < 3: return [list(p) for p in pts]
    g = LineString(pts).simplify(tol)
    return [[round(x), round(y)] for x, y in g.coords]

def simp_poly(g, tol):
    g = g.simplify(tol, preserve_topology=True)
    polys = [g] if isinstance(g, Polygon) else list(getattr(g, 'geoms', []))
    res = []
    for p in polys:
        if p.is_empty or p.area < 1: continue
        res.append([[[round(x), round(y)] for x, y in p.exterior.coords]] +
                   [[[round(x), round(y)] for x, y in h.coords] for h in p.interiors])
    return res

def els_polys(els):
    """ways/relations with geom -> shapely polygons"""
    polys = []
    for e in els:
        if e['type'] == 'way' and 'geometry' in e and len(e['geometry']) >= 4:
            r = ring(e['geometry'])
            if r[0] == r[-1]:
                try: polys.append((e, Polygon(r).buffer(0)))
                except Exception: pass
        elif e['type'] == 'relation':
            outers = [ring(m['geometry']) for m in e.get('members', []) if m.get('role') == 'outer' and 'geometry' in m]
            inners = [ring(m['geometry']) for m in e.get('members', []) if m.get('role') == 'inner' and 'geometry' in m]
            try:
                lines = linemerge([LineString(o) for o in outers if len(o) > 1])
                ls = [lines] if isinstance(lines, LineString) else list(lines.geoms)
                op = unary_union([Polygon(l.coords) for l in ls if l.is_ring or len(l.coords) > 3]).buffer(0)
                if inners:
                    il = linemerge([LineString(i) for i in inners if len(i) > 1])
                    il = [il] if isinstance(il, LineString) else list(il.geoms)
                    op = op.difference(unary_union([Polygon(l.coords) for l in il if len(l.coords) > 3]))
                polys.append((e, op))
            except Exception as ex:
                log.append(f'relation {e.get("id")} skipped: {ex}')
    return polys

pack = {'meta': {'origin': {'lat': O_LAT, 'lon': O_LON, 'note': 'Calgary Tower; x = metres east, y = metres north'},
                 'built': time.strftime('%Y-%m-%d'),
                 'sources': [{'name': 'OpenStreetMap contributors (Overpass API)', 'licence': 'ODbL 1.0',
                              'url': 'https://www.openstreetmap.org/copyright'},
                             {'name': 'City of Calgary Open Data', 'licence': 'Open Government Licence - City of Calgary',
                              'url': 'https://data.calgary.ca/'}],
                 'credit_on_screen': 'Map data © OpenStreetMap contributors · City of Calgary Open Data'}}

# 1. City boundary
try:
    els = overpass('[out:json][timeout:200];relation["boundary"="administrative"]["admin_level"="8"]["name"="Calgary"];out geom;')
    ps = els_polys(els)
    pack['boundary'] = simp_poly(unary_union([p for _, p in ps]), 60)
    log.append(f'boundary parts {len(pack["boundary"])}')
except Exception as e: log.append(f'boundary FAILED {e}')

# 2. Rivers and creeks (named lines), water bodies
try:
    els = overpass(f'[out:json][timeout:200];way["waterway"~"^(river|stream|canal)$"]["name"]({b(BBOX)});out geom tags;')
    by = {}
    for e in els:
        if 'geometry' not in e: continue
        by.setdefault((e['tags']['name'], e['tags']['waterway']), []).append(LineString(ring(e['geometry'])))
    rivers = []
    for (name, kind), ls in by.items():
        m = linemerge(ls); parts = [m] if isinstance(m, LineString) else list(m.geoms)
        total = sum(p.length for p in parts)
        if kind == 'stream' and total < 4000: continue
        rivers.append({'name': name, 'kind': kind, 'len_m': round(total),
                       'lines': [simp_line(list(p.coords), 8 if kind == 'river' else 15) for p in parts if p.length > 150]})
    rivers.sort(key=lambda r: -r['len_m']); pack['rivers'] = rivers
    log.append('rivers: ' + ', '.join(f"{r['name']}({r['kind']},{r['len_m']}m)" for r in rivers[:25]))
except Exception as e: log.append(f'rivers FAILED {e}')
try:
    els = overpass(f'[out:json][timeout:200];(way["natural"="water"]({b(BBOX)});relation["natural"="water"]({b(BBOX)});'
                   f'way["waterway"="riverbank"]({b(BBOX)}););out geom tags;')
    water = []
    for e, p in els_polys(els):
        if p.area < 40000: continue
        water.append({'name': e.get('tags', {}).get('name', ''), 'area_ha': round(p.area / 1e4, 1), 'polys': simp_poly(p, 10)})
    water.sort(key=lambda w: -w['area_ha']); pack['water'] = water
    log.append('water: ' + ', '.join(f"{w['name'] or '?'}({w['area_ha']}ha)" for w in water[:20]))
except Exception as e: log.append(f'water FAILED {e}')

# 3. Big parks
try:
    els = overpass(f'[out:json][timeout:200];(way["leisure"~"^(park|nature_reserve)$"]["name"]({b(BBOX)});'
                   f'relation["leisure"~"^(park|nature_reserve)$"]["name"]({b(BBOX)});relation["boundary"="protected_area"]["name"]({b(BBOX)}););out geom tags;')
    parks = []
    for e, p in els_polys(els):
        if p.area < 150000: continue
        parks.append({'name': e['tags']['name'], 'area_ha': round(p.area / 1e4, 1), 'polys': simp_poly(p, 15)})
    parks.sort(key=lambda w: -w['area_ha']); pack['parks'] = parks
    log.append('parks: ' + ', '.join(f"{w['name']}({w['area_ha']}ha)" for w in parks[:25]))
except Exception as e: log.append(f'parks FAILED {e}')

# 4. Major roads and LRT
try:
    els = overpass(f'[out:json][timeout:200];way["highway"~"^(motorway|trunk|primary)$"]({b(BBOX)});out geom tags;')
    by = {}
    for e in els:
        if 'geometry' not in e: continue
        t = e['tags']; key = (t.get('name') or t.get('ref') or '', t['highway'])
        by.setdefault(key, []).append(LineString(ring(e['geometry'])))
    roads = []
    for (name, cls), ls in by.items():
        m = linemerge(ls); parts = [m] if isinstance(m, LineString) else list(m.geoms)
        roads.append({'name': name, 'class': cls, 'lines': [simp_line(list(p.coords), 12) for p in parts if p.length > 80]})
    pack['roads'] = roads
    log.append(f'roads: {len(roads)} named groups; e.g. ' + ', '.join(sorted({r["name"] for r in roads if r["class"] in ("motorway", "trunk")})[:30]))
except Exception as e: log.append(f'roads FAILED {e}')
try:
    els = overpass(f'[out:json][timeout:200];way["railway"="light_rail"]({b(BBOX)});out geom tags;'
                   f'node["railway"="station"]["station"="light_rail"]({b(BBOX)});out tags;')
    ls = [LineString(ring(e['geometry'])) for e in els if e['type'] == 'way' and 'geometry' in e]
    m = linemerge(ls); parts = [m] if isinstance(m, LineString) else list(m.geoms)
    pack['lrt'] = [simp_line(list(p.coords), 8) for p in parts if p.length > 50]
    pack['lrt_stations'] = [{'name': e['tags'].get('name', ''), 'xy': xy(e['lon'], e['lat'])} for e in els if e['type'] == 'node']
    log.append(f'lrt lines {len(pack["lrt"])}, stations {len(pack["lrt_stations"])}')
except Exception as e: log.append(f'lrt FAILED {e}')

# 5. Downtown buildings with heights
try:
    els = overpass(f'[out:json][timeout:240];(way["building"]({b(DT)});relation["building"]({b(DT)}););out geom tags;')
    bl = []
    for e, p in els_polys(els):
        t = e.get('tags', {})
        h = None
        for k in ('height', 'building:height'):
            try: h = float(str(t.get(k, '')).replace('m', '').strip()); break
            except Exception: pass
        src = 'height'
        if h is None and t.get('building:levels'):
            try: h = float(t['building:levels']) * 3.6; src = 'levels'
            except Exception: pass
        if h is None: h = 9.0 if p.area < 2500 else 14.0; src = 'default'
        if p.area < 60: continue
        for poly in simp_poly(p, 1.5):
            bl.append({'h': round(h, 1), 'src': src, 'name': t.get('name', ''), 'fp': poly[0]})
    pack['buildings_downtown'] = {'bbox_latlon': DT, 'items': bl,
                                  'note': 'h = OSM height tag, else levels x 3.6 m, else a default (src says which)'}
    tall = sorted([x for x in bl if x['name']], key=lambda x: -x['h'])[:15]
    log.append(f'downtown buildings {len(bl)}; tallest named: ' + ', '.join(f"{x['name']} {x['h']}m({x['src']})" for x in tall))
except Exception as e: log.append(f'buildings FAILED {e}')

# 6. Landmarks
NAMES = ['Calgary Tower', 'Scotiabank Saddledome', 'Peace Bridge', 'The Bow', 'Brookfield Place', 'Central Library',
         'Calgary Municipal Building', 'Historic City Hall', "Prince's Island Park", 'Fort Calgary', 'Stampede Park',
         'Calgary Zoo', 'TELUS Spark Science Centre', 'Heritage Park Historical Village', 'WinSport', 'McMahon Stadium',
         'Calgary International Airport', 'Mewata Armoury', 'Glenmore Reservoir', 'Nose Hill Park', 'Fish Creek Provincial Park',
         'Studio Bell', 'CF Chinook Centre', 'BMO Centre', 'Scotia Place', 'Devonian Gardens', 'Olympic Plaza', 'Stephen Avenue',
         'Bow Tower', 'Telus Sky', 'Calgary Courts Centre', 'The Military Museums', 'Foothills Medical Centre', 'University of Calgary',
         'Mount Royal University', 'SAIT', 'Edworthy Park', 'Bowness Park', 'Inglewood Bird Sanctuary', 'Calgary Tower Centre']
try:
    rx = '^(' + '|'.join(n.replace("'", ".").replace('(', '').replace(')', '') for n in NAMES) + ')$'
    els = overpass(f'[out:json][timeout:200];nwr["name"~"{rx}"]({b(BBOX)});out center tags;')
    lm = {}
    for e in els:
        n = e['tags'].get('name'); c = e.get('center') or ({'lat': e['lat'], 'lon': e['lon']} if 'lat' in e else None)
        if not c or n in lm: continue
        lm[n] = {'xy': xy(c['lon'], c['lat']), 'lat': c['lat'], 'lon': c['lon'], 'osm': f"{e['type']}/{e['id']}"}
    pack['landmarks'] = lm
    log.append('landmarks found: ' + ', '.join(sorted(lm)) + ' | missing: ' + ', '.join(n for n in NAMES if n not in lm))
except Exception as e: log.append(f'landmarks FAILED {e}')

# 7. Wards and communities from the City
def socrata_find(q):
    u = 'https://data.calgary.ca/api/catalog/v1?' + urllib.parse.urlencode({'q': q, 'domains': 'data.calgary.ca', 'limit': 10})
    res = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))['results']
    return [(r['resource']['id'], r['resource']['name'], r['resource'].get('updatedAt', '')) for r in res]

def socrata_geo(rid):
    u = f'https://data.calgary.ca/resource/{rid}.geojson?$limit=5000'
    return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=120))

for key, q, want, namekeys in [('wards', 'ward boundaries', 'ward', ('ward_num', 'ward', 'label')),
                               ('communities', 'community district boundaries', 'communit', ('name', 'comm_name', 'community'))]:
    try:
        cands = socrata_find(q); log.append(f'{key} candidates: {cands}')
        done = False
        for rid, name, upd in cands:
            if want not in name.lower(): continue
            try: gj = socrata_geo(rid)
            except Exception as e: log.append(f'{key} {rid} fetch failed {e}'); continue
            feats = [f for f in gj.get('features', []) if f.get('geometry')]
            if not feats: continue
            items = []
            for f in feats:
                g = shape(f['geometry'])
                def tx(geom):
                    from shapely.ops import transform
                    return transform(lambda x, y, z=None: ((x - O_LON) * KX, (y - O_LAT) * KY), geom)
                props = f.get('properties', {})
                nm = next((str(props[k]) for k in namekeys if props.get(k) not in (None, '')), '')
                items.append({'name': nm, 'props': {k: v for k, v in props.items() if k in namekeys or k in ('class', 'comm_code', 'sector', 'srg')},
                              'polys': simp_poly(tx(g).buffer(0), 12 if key == 'communities' else 20)})
            pack[key] = {'dataset': name, 'id': rid, 'updated': upd, 'url': f'https://data.calgary.ca/d/{rid}', 'items': items}
            log.append(f'{key}: {len(items)} from {rid} "{name}" (updated {upd}); props sample {feats[0].get("properties", {})}')
            done = True; break
        if not done: log.append(f'{key}: no dataset used')
    except Exception as e: log.append(f'{key} FAILED {e}')

s = json.dumps(pack, separators=(',', ':'))
open(os.path.join(out, 'calgary_base.json'), 'w').write(s)
log.append(f'size {len(s)/1e6:.2f} MB')
open(os.path.join(out, 'report.txt'), 'w').write('\n'.join(log))
print('\n'.join(log))
