"""Calgary game map: download real Calgary map data and write it as compact layers for the game builder.

Sources (all open):
  OpenStreetMap, Alberta extract from Geofabrik, cut to Calgary (c) OpenStreetMap contributors, ODbL
  City of Calgary Open Data (Open Government Licence - City of Calgary): buildings (roof outlines), communities,
  wards, city boundary, parks, recreation facilities, community services, schools, transit stops, voting stations,
  Calgary Transit GTFS timetable (routes, shapes, stops).

Coordinates are projected to metres east (x) and north (y) of City Hall and written as integers in decimetres.
Each layer is gzip JSON lines: {"g": geometry, "p": properties}.
"""
import csv
import gzip
import io
import json
import math
import os
import subprocess
import sys
import time
import urllib.parse
import urllib.request
import zipfile

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
BBOX = (50.84, -114.32, 51.22, -113.85)        # south, west, north, east
LAT0, LON0 = 51.0453, -114.0581                 # Calgary City Hall
R = math.radians(LAT0)
KY = 111132.954 - 559.822 * math.cos(2 * R) + 1.175 * math.cos(4 * R)
KX = 111412.84 * math.cos(R) - 93.5 * math.cos(3 * R)
PORTAL = 'https://data.calgary.ca'
TOKEN = os.environ.get('SOCRATA_TOKEN', '')
LOG = {'started': time.strftime('%Y-%m-%d %H:%M:%S'), 'proj': {'lat0': LAT0, 'lon0': LON0, 'kx': KX, 'ky': KY}, 'layers': {}}


def P(lon, lat):
    return [round((lon - LON0) * KX * 10), round((lat - LAT0) * KY * 10)]


def proj(g):
    t, c = g['type'], g.get('coordinates')
    if t == 'Point':
        return {'t': 'pt', 'c': P(c[0], c[1])}
    if t == 'LineString':
        return {'t': 'ln', 'c': [P(*q[:2]) for q in c]}
    if t == 'MultiLineString':
        return {'t': 'mln', 'c': [[P(*q[:2]) for q in l] for l in c]}
    if t == 'Polygon':
        out = {'t': 'pg', 'c': [[P(*q[:2]) for q in r] for r in c]}
        if c and c[0] and len(c[0][0]) > 2:
            zs = [q[2] for q in c[0]]
            out['z'] = [round(min(zs), 1), round(max(zs), 1)]
        return out
    if t == 'MultiPolygon':
        return {'t': 'mpg', 'c': [[[P(*q[:2]) for q in r] for r in poly] for poly in c]}
    return None


class Layer:
    def __init__(self, name):
        self.name, self.n = name, 0
        self.f = gzip.open(os.path.join(OUT, name + '.jsonl.gz'), 'wt', compresslevel=9)

    def add(self, g, p):
        pg = proj(g) if g else None
        if pg is None:
            return
        self.f.write(json.dumps({'g': pg, 'p': p}, separators=(',', ':')) + '\n')
        self.n += 1

    def close(self):
        self.f.close()
        LOG['layers'][self.name] = self.n
        print(self.name, self.n, flush=True)


def get(url, timeout=300, tries=5):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'CalgaryGameMap/1.0', **({'X-App-Token': TOKEN} if TOKEN else {})})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except Exception as e:
            print('retry', i, url[:120], e, flush=True)
            time.sleep(5 * (i + 1))
    raise RuntimeError('failed ' + url)


# ------------------------------------------------------------------ City of Calgary datasets
def socrata(ds, name, keep=None, where=None, page=50000):
    lay, off, fields = Layer(name), 0, None
    while True:
        q = {'$limit': page, '$offset': off, '$order': ':id'}
        if where:
            q['$where'] = where
        try:
            data = json.loads(get(f'{PORTAL}/resource/{ds}.geojson?' + urllib.parse.urlencode(q)))
        except Exception as e:
            LOG.setdefault('errors', {})[name] = str(e)
            break
        feats = data.get('features', [])
        for f in feats:
            p = f.get('properties') or {}
            if fields is None:
                fields = sorted(p.keys())
                LOG.setdefault('fields', {})[name] = fields
                LOG.setdefault('sample', {})[name] = {k: (str(v)[:80] if v is not None else None) for k, v in p.items()}
            if keep:
                p = {k: p.get(k) for k in keep if p.get(k) not in (None, '')}
            lay.add(f.get('geometry'), p)
        if len(feats) < page:
            break
        off += page
    lay.close()


def city():
    socrata('surr-xmvs', 'communities')
    socrata('tz8z-hyaz', 'wards')
    socrata('erra-cqp9', 'city_boundary')
    socrata('kami-qbfh', 'parks_city')
    socrata('hxfu-6d96', 'rec_facilities')
    socrata('x34e-bcjz', 'community_services')
    socrata('fd9t-tdn2', 'schools_city')
    socrata('muzh-c9qc', 'transit_stops')
    socrata('gqvk-p23x', 'voting_stations')
    socrata('uc4c-6kbd', 'buildings_city')


def gtfs():
    try:
        z = zipfile.ZipFile(io.BytesIO(get(PORTAL + '/download/npk7-z3bj/application%2Fzip', timeout=600)))
    except Exception as e:
        LOG.setdefault('errors', {})['gtfs'] = str(e)
        return
    names = z.namelist()
    LOG['gtfs_files'] = names
    rd = lambda n: list(csv.DictReader(io.TextIOWrapper(z.open(n), encoding='utf-8-sig')))
    routes = {r['route_id']: r for r in rd('routes.txt')}
    shape_route = {}
    for t in rd('trips.txt'):
        if t.get('shape_id'):
            shape_route.setdefault(t['shape_id'], t['route_id'])
    pts = {}
    for s in rd('shapes.txt'):
        pts.setdefault(s['shape_id'], []).append((int(s['shape_pt_sequence']), float(s['shape_pt_lon']), float(s['shape_pt_lat'])))
    lay = Layer('transit_routes')
    seen = set()
    for sid, ps in pts.items():
        rid = shape_route.get(sid)
        if rid is None:
            continue
        ps.sort()
        key = (rid, round(ps[0][1], 4), round(ps[0][2], 4), round(ps[-1][1], 4), round(ps[-1][2], 4), len(ps) // 20)
        if key in seen:
            continue
        seen.add(key)
        r = routes.get(rid, {})
        lay.add({'type': 'LineString', 'coordinates': [(a, b) for _, a, b in ps]},
                {'route': r.get('route_short_name'), 'name': r.get('route_long_name'), 'type': r.get('route_type'), 'color': r.get('route_color'), 'shape': sid})
    lay.close()
    lay = Layer('gtfs_stops')
    for s in rd('stops.txt'):
        lay.add({'type': 'Point', 'coordinates': [float(s['stop_lon']), float(s['stop_lat'])]},
                {k: s.get(k) for k in ('stop_id', 'stop_code', 'stop_name', 'location_type', 'parent_station') if s.get(k)})
    lay.close()


# ------------------------------------------------------------------ OpenStreetMap
OSM_KEEP = ['name', 'ref', 'highway', 'lanes', 'oneway', 'bridge', 'tunnel', 'layer', 'maxspeed', 'surface', 'railway', 'service',
            'building', 'height', 'building:levels', 'min_height', 'building:min_level', 'roof:shape', 'roof:height', 'building:colour',
            'roof:colour', 'building:material', 'landuse', 'leisure', 'natural', 'water', 'waterway', 'amenity', 'shop', 'tourism',
            'man_made', 'historic', 'sport', 'public_transport', 'operator', 'brand', 'addr:housenumber', 'addr:street',
            'opening_hours', 'website', 'wikidata', 'access', 'place', 'aeroway', 'barrier', 'golf', 'cuisine', 'religion',
            'parking', 'area', 'type', 'boundary', 'admin_level', 'network', 'colour', 'route', 'station', 'level']


def osm():
    pbf = 'alberta.osm.pbf'
    if not os.path.exists(pbf):
        with open(pbf, 'wb') as f:
            f.write(get('https://download.geofabrik.de/north-america/canada/alberta-latest.osm.pbf', timeout=1200))
    LOG['osm_source'] = subprocess.run(['osmium', 'fileinfo', '-g', 'header.option.osmosis_replication_timestamp', pbf], capture_output=True, text=True).stdout.strip()
    b = f'{BBOX[1]},{BBOX[0]},{BBOX[3]},{BBOX[2]}'
    subprocess.run(['osmium', 'extract', '-b', b, '-s', 'smart', '--overwrite', '-o', 'calgary.osm.pbf', pbf], check=True)
    subprocess.run(['osmium', 'export', 'calgary.osm.pbf', '-f', 'geojsonseq', '--overwrite', '-o', 'calgary.geojsonseq',
                    '-a', 'type,id', '--geometry-types=point,linestring,polygon'], check=True)
    layers = {n: Layer(n) for n in ('roads', 'paths', 'rail', 'water', 'waterways', 'areas', 'buildings_osm', 'pois', 'barriers', 'aeroways')}
    road_types = {'motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential', 'service', 'living_street',
                  'motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary_link', 'road', 'busway', 'bus_guideway', 'raceway'}
    path_types = {'pedestrian', 'footway', 'cycleway', 'path', 'track', 'steps', 'bridleway', 'corridor'}
    area_keys = ('landuse', 'leisure', 'natural', 'amenity', 'golf', 'tourism', 'place')
    poi_amen = {'school', 'college', 'university', 'kindergarten', 'hospital', 'clinic', 'doctors', 'dentist', 'pharmacy', 'library',
                'police', 'fire_station', 'place_of_worship', 'community_centre', 'social_facility', 'townhall', 'courthouse',
                'cinema', 'theatre', 'arts_centre', 'fuel', 'restaurant', 'fast_food', 'cafe', 'bank', 'atm', 'post_office',
                'bus_station', 'marketplace', 'food_bank', 'shelter', 'toilets', 'ice_cream', 'pub', 'bar', 'car_wash',
                'charging_station', 'parking', 'ferry_terminal', 'bicycle_rental', 'events_venue', 'conference_centre'}
    n = 0
    with open('calgary.geojsonseq', encoding='utf-8') as fh:
        for line in fh:
            line = line.strip().lstrip('\x1e')
            if not line:
                continue
            f = json.loads(line)
            n += 1
            t = f.get('properties') or {}
            g = f.get('geometry')
            if not g:
                continue
            p = {k: t[k] for k in OSM_KEEP if k in t}
            p['@id'] = f"{t.get('@type', '')[:1]}{t.get('@id', '')}"
            gt = g['type']
            hw = t.get('highway')
            if hw and gt in ('LineString', 'MultiLineString'):
                if hw in road_types:
                    layers['roads'].add(g, p)
                elif hw in path_types:
                    layers['paths'].add(g, p)
                continue
            if hw and gt in ('Polygon', 'MultiPolygon') and hw in ('pedestrian',):
                layers['areas'].add(g, p)
                continue
            if t.get('railway') in ('rail', 'light_rail', 'subway', 'tram', 'narrow_gauge', 'disused', 'abandoned') and gt in ('LineString', 'MultiLineString'):
                layers['rail'].add(g, p)
                continue
            if t.get('railway') in ('platform',) and gt in ('Polygon', 'MultiPolygon', 'LineString'):
                layers['areas'].add(g, p)
                continue
            if t.get('waterway') and gt in ('LineString', 'MultiLineString'):
                layers['waterways'].add(g, p)
                continue
            if t.get('aeroway') and gt != 'Point':
                layers['aeroways'].add(g, p)
                continue
            if t.get('barrier') in ('wall', 'fence', 'retaining_wall', 'hedge') and gt in ('LineString',):
                layers['barriers'].add(g, p)
                continue
            if t.get('building') or t.get('building:part'):
                if gt in ('Polygon', 'MultiPolygon'):
                    if t.get('building:part'):
                        p['part'] = t['building:part']
                    layers['buildings_osm'].add(g, p)
                    if t.get('name') or t.get('amenity') in poi_amen or t.get('shop') or t.get('tourism'):
                        layers['pois'].add(centroid(g), p)
                continue
            if gt in ('Polygon', 'MultiPolygon'):
                if t.get('natural') == 'water' or t.get('water') or t.get('waterway') == 'riverbank' or t.get('landuse') in ('reservoir', 'basin'):
                    layers['water'].add(g, p)
                elif any(k in t for k in area_keys) or t.get('man_made') or t.get('parking'):
                    layers['areas'].add(g, p)
                if t.get('name') and (t.get('amenity') in poi_amen or t.get('shop') or t.get('tourism') or t.get('leisure') in ('stadium', 'sports_centre', 'park', 'ice_rink', 'water_park')):
                    layers['pois'].add(centroid(g), p)
                continue
            if gt == 'Point':
                if (t.get('shop') or t.get('amenity') in poi_amen or t.get('tourism') or t.get('railway') in ('station', 'halt', 'tram_stop')
                        or t.get('public_transport') == 'station' or t.get('man_made') in ('tower', 'water_tower') or t.get('historic')
                        or t.get('leisure') in ('stadium', 'sports_centre', 'ice_rink', 'playground', 'park') or t.get('place')):
                    layers['pois'].add(g, p)
    for l in layers.values():
        l.close()
    LOG['osm_features_read'] = n


def centroid(g):
    ring = g['coordinates'][0] if g['type'] == 'Polygon' else g['coordinates'][0][0]
    xs = [q[0] for q in ring]
    ys = [q[1] for q in ring]
    return {'type': 'Point', 'coordinates': [sum(xs) / len(xs), sum(ys) / len(ys)]}


if __name__ == '__main__':
    for step in (osm, city, gtfs):
        try:
            step()
        except Exception as e:
            import traceback
            traceback.print_exc()
            LOG.setdefault('errors', {})[step.__name__] = repr(e)
    LOG['finished'] = time.strftime('%Y-%m-%d %H:%M:%S')
    with open(os.path.join(OUT, 'log.json'), 'w') as f:
        json.dump(LOG, f, indent=1)
    # GitHub refuses files over 100 MB: split anything big
    for fn in os.listdir(OUT):
        fp = os.path.join(OUT, fn)
        if os.path.getsize(fp) > 90_000_000:
            subprocess.run(['split', '-b', '80m', '-d', fp, fp + '.part'], check=True)
            os.remove(fp)
    print(json.dumps(LOG, indent=1)[:4000])
