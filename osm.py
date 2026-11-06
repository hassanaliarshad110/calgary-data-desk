"""Amenities that are not the City's: playgrounds, parks, courts, fitness stations and dog parks mapped in
OpenStreetMap, with every one the City already lists taken out, so nothing is counted twice.

Why: the City's open data lists only what the City owns. Parks and playgrounds a developer has built but not yet
handed to the City, condo and homeowners' association parks, and school playgrounds are missing from it, so new
communities look emptier than they are. OpenStreetMap is the open, community-edited map of the world (© OpenStreetMap
contributors, Open Database Licence); it can be stored and counted. Its coverage is uneven: a missing feature means
nobody has mapped it, not that it is not there.

HOW AN OPENSTREETMAP FEATURE IS MATCHED TO THE CITY'S (a match is the City's own and is not added):
  playground       a City playground (Playground Equipment, MULTI PLAY COMPLEX) within MATCH_M['playgrounds'] metres
                   of the feature's middle, or inside the feature's outline
  fitness station  a City fitness equipment point within MATCH_M['fitness'] metres, or inside its outline
  basketball court a City basketball hoop within MATCH_M['basketball'] metres, or inside its outline
  dog park         its middle inside a City off-leash area, or a City off-leash area's middle within MATCH_M['off_leash']
                   metres
  park             PARK_OVERLAP or more of its area inside City park sites (Parks Sites, any category)
  Anything tagged as operated or owned by the City of Calgary is the City's whatever its distance.
  The same thing mapped twice in OpenStreetMap counts once: a playground, station, court or dog park within SAME_M
  metres of one already counted, or inside the outline of one already counted, is left out; a park with PARK_OVERLAP
  or more of its area inside a park already counted is left out (outlines are counted before points, larger parks
  before smaller ones). A park's area leaves out its holes (inner rings).
WHAT IS COUNTED, for each feature that is not the City's, in the community holding its middle:
  playgrounds +1; fitness +1 (a station, which may hold several pieces); basketball + the court's hoops tag, else 1;
  off_leash +1; local_park_ha + its area in hectares (parks between PARK_MIN_HA and PARK_MAX_HA only: smaller ones are
  bits of lawn, larger ones natural areas that are not neighbourhood parks). Left out: access=no or customers, fee=yes
  and indoor ones (paid indoor play centres).
PRIVATE ONES ARE KEPT APART (by_comm_private), and count only when the screen's "include private ones" filter is on:
  access=private marks homeowners' association, condo and other residents-only parks and playgrounds. They are not
  open to everyone, so the default count (by_comm) leaves them out; turning the filter on adds them. They still take
  part in the duplicate check, so a public playground inside a private outline is not counted twice.
"""
import json
import math
import time
import urllib.parse
import urllib.request

import geo

ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']
BBOX = (50.84, -114.32, 51.22, -113.85)          # south, west, north, east: the whole City of Calgary
MATCH_M = {'playgrounds': 80, 'fitness': 40, 'basketball': 40, 'off_leash': 100}
PARK_OVERLAP = 0.30
SAME_M = 25
PARK_MIN_HA, PARK_MAX_HA = 0.05, 20.0
KINDS = ('playgrounds', 'fitness', 'basketball', 'off_leash', 'local_park_ha')
SOURCE = {'name': 'OpenStreetMap (Overpass API)', 'licence': '© OpenStreetMap contributors, Open Database Licence (ODbL)',
          'url': 'https://www.openstreetmap.org/copyright', 'page': 'https://www.openstreetmap.org/#map=12/51.045/-114.06'}


def query_text(bbox=BBOX):
    b = ','.join(str(x) for x in bbox)
    return (f'[out:json][timeout:180];('
            f'nwr["leisure"="playground"]({b});nwr["leisure"="fitness_station"]({b});'
            f'nwr["leisure"="pitch"]["sport"~"basketball"]({b});nwr["leisure"="dog_park"]({b});'
            f'way["leisure"="park"]({b});relation["leisure"="park"]({b}););out tags geom;')


def fetch(bbox=BBOX, timeout=120):
    """Every playground, fitness station, basketball court, dog park and park in the box, from OpenStreetMap."""
    body = urllib.parse.urlencode({'data': query_text(bbox)}).encode()
    last = None
    for url in ENDPOINTS:
        for attempt in range(2):
            try:
                req = urllib.request.Request(url, data=body, headers={'User-Agent': 'CalgaryInsight/2.0 (civic open data)'})
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    return json.loads(r.read().decode('utf-8'))['elements']
            except Exception as e:                       # noqa: BLE001 - busy or down: wait, then the other server
                last = e
                time.sleep(20 if attempt == 0 else 2)
    raise RuntimeError(f'OpenStreetMap could not be reached ({last})')


# ---------------------------------------------------------------- shapes
def _rings(el, role='outer'):
    """Closed rings [[lon, lat], ...] of a way or a multipolygon relation (its outer ways, or with role='inner' its
    holes, joined end to end)."""
    if el.get('type') == 'way':
        g = [[p['lon'], p['lat']] for p in el.get('geometry') or []]
        return [g] if role == 'outer' and len(g) >= 4 and g[0] == g[-1] else []
    if el.get('type') != 'relation':
        return []
    roles = ('outer', '') if role == 'outer' else ('inner',)
    parts = [[[p['lon'], p['lat']] for p in m.get('geometry') or []] for m in el.get('members') or []
             if m.get('type') == 'way' and m.get('role', 'outer') in roles and m.get('geometry')]
    rings = []
    while parts:
        ring = parts.pop(0)
        grew = True
        while ring[0] != ring[-1] and grew:
            grew = False
            for i, p in enumerate(parts):
                if p[0] == ring[-1]:
                    ring += p[1:]
                elif p[-1] == ring[-1]:
                    ring += p[::-1][1:]
                else:
                    continue
                parts.pop(i)
                grew = True
                break
        if len(ring) >= 4 and ring[0] == ring[-1]:
            rings.append(ring)
    return rings


def _shape(rings):
    return {'type': 'MultiPolygon', 'coordinates': [[r] for r in rings]} if rings else None


def _middle(el, shape):
    if el.get('type') == 'node':
        return el['lon'], el['lat']
    if shape:
        return geo.centre(shape)
    g = el.get('geometry') or []
    return (sum(p['lon'] for p in g) / len(g), sum(p['lat'] for p in g) / len(g)) if g else (None, None)


def _metres(lon1, lat1, lon2, lat2):
    kx = 111320 * math.cos(math.radians((lat1 + lat2) / 2))
    return math.hypot((lon1 - lon2) * kx, (lat1 - lat2) * 110540)


class _Points:
    """City points filed in a grid of about 100 m cells, for 'is there one within N metres'."""

    def __init__(self, pts):
        self.cells = {}
        for lon, lat in pts:
            self.add(lon, lat)

    def add(self, lon, lat):
        self.cells.setdefault((int(lon * 700), int(lat * 1000)), []).append((lon, lat))

    def near(self, lon, lat, m):
        i, j, r = int(lon * 700), int(lat * 1000), max(1, math.ceil(m / 100))
        return any(_metres(lon, lat, x, y) <= m for a in range(i - r, i + r + 1) for b in range(j - r, j + r + 1)
                   for x, y in self.cells.get((a, b), ()))

    def inside(self, shape):
        if not shape:
            return False
        s = geo.Shape(shape)
        x0, y0, x1, y1 = s.box
        return any(s.contains(x, y) for a in range(int(x0 * 700), int(x1 * 700) + 1)
                   for b in range(int(y0 * 1000), int(y1 * 1000) + 1) for x, y in self.cells.get((a, b), ()))


def _kind(tags):
    l = tags.get('leisure')
    if l == 'playground':
        return 'playgrounds'
    if l == 'fitness_station':
        return 'fitness'
    if l == 'pitch' and 'basketball' in (tags.get('sport') or ''):
        return 'basketball'
    if l == 'dog_park':
        return 'off_leash'
    if l == 'park':
        return 'local_park_ha'
    return None


def _open_to_all(tags):
    """Left out: closed ones, paid indoor play centres and anything for customers only. access=private is not left out
    here: it is kept apart (see _private) and counted only when the private filter is on."""
    return ((tags.get('access') or '') not in ('no', 'customers') and (tags.get('fee') or '') != 'yes'
            and (tags.get('indoor') or 'no') == 'no')


def _private(tags):
    """Residents only (homeowners' association, condo): counted only with the "include private ones" filter."""
    return (tags.get('access') or '').strip().lower() == 'private'


def _citys(tags):
    who = ' '.join(str(tags.get(k) or '') for k in ('operator', 'owner', 'operator:type', 'ownership')).lower()
    return 'city of calgary' in who or 'calgary parks' in who


def _share_in(shape, loc, samples=16):
    """Share of an outline's area inside any of the City's park sites (by a grid of test points)."""
    s = geo.Shape(shape)
    x0, y0, x1, y1 = s.box
    inside = hit = 0
    for i in range(samples):
        for j in range(samples):
            lon, lat = x0 + (i + 0.5) * (x1 - x0) / samples, y0 + (j + 0.5) * (y1 - y0) / samples
            if s.contains(lon, lat):
                inside += 1
                hit += loc.find(lon, lat) is not None
    return hit / inside if inside else 0.0


def build(elements, city, community_locator):
    """Count OpenStreetMap amenities that are not the City's, by community.
    city: {'playgrounds': [(lon, lat)], 'fitness': [...], 'basketball': [...], 'off_leash': [multipolygon],
           'parks': [multipolygon]} - the City's own, from its open data."""
    pts = {k: _Points(city.get(k) or []) for k in ('playgrounds', 'fitness', 'basketball')}
    leash = [geo.Shape(s) for s in city.get('off_leash') or [] if s]
    leash_loc = geo.Locator({i: s for i, s in enumerate(leash)}) if leash else None
    leash_mid = _Points([geo.centre(s) for s in leash]) if leash else _Points([])
    parks_loc = geo.Locator({i: s for i, s in enumerate(city.get('parks') or []) if s}) if city.get('parks') else None
    by, kept, mine = {}, [], {k: _Points([]) for k in KINDS}
    outlines = {k: [] for k in KINDS}                # outlines already counted, so a point or park inside one counts once
    # outlines before points, and larger parks before smaller ones, so the whole is counted and its parts are not
    def order(el):
        g = el.get('geometry') or []
        span = (max(p['lon'] for p in g) - min(p['lon'] for p in g)) * (max(p['lat'] for p in g) - min(p['lat'] for p in g)) if g else 0
        return (el.get('type') == 'node', -span)
    elements = sorted(elements, key=order)
    stats = {k: {'found': 0, 'city': 0, 'left_out': 0, 'kept': 0, 'private': 0} for k in KINDS}
    private_by = {}                                  # access=private ones, counted only with the private filter
    seen = set()
    for el in elements:
        tags = el.get('tags') or {}
        k = _kind(tags)
        if not k or (el.get('type'), el.get('id')) in seen:
            continue
        seen.add((el.get('type'), el.get('id')))
        st = stats[k]
        st['found'] += 1
        shape = _shape(_rings(el)) if el.get('type') != 'node' else None
        lon, lat = _middle(el, shape)
        if lon is None or not _open_to_all(tags):
            st['left_out'] += 1
            continue
        area = None
        if k == 'local_park_ha':
            from assets import _area_ha                 # one area formula for City and OpenStreetMap parks
            holes = _shape(_rings(el, 'inner'))
            area = max(0.0, (_area_ha(shape) if shape else 0) - (_area_ha(holes) if holes else 0))
            if not (PARK_MIN_HA <= area <= PARK_MAX_HA):
                st['left_out'] += 1
                continue
        if _citys(tags):
            is_city = True
        elif k in pts:
            is_city = pts[k].near(lon, lat, MATCH_M[k]) or pts[k].inside(shape)
        elif k == 'off_leash':
            is_city = bool(leash_loc and leash_loc.find(lon, lat) is not None) or leash_mid.near(lon, lat, MATCH_M[k])
        else:
            is_city = bool(parks_loc and _share_in(shape, parks_loc) >= PARK_OVERLAP)
        if is_city:
            st['city'] += 1
            continue
        inside_kept = any(o.contains(lon, lat) for o in outlines[k])
        if k == 'local_park_ha' and not inside_kept and outlines[k] and shape:
            sh_ = geo.Shape(shape)
            x0, y0, x1, y1 = sh_.box
            near_ = [o for o in outlines[k] if not (o.box[2] < x0 or o.box[0] > x1 or o.box[3] < y0 or o.box[1] > y1)]
            if near_:
                inside_kept = _share_in(shape, geo.Locator({i: o for i, o in enumerate(near_)})) >= PARK_OVERLAP
        if inside_kept or (k != 'local_park_ha' and mine[k].near(lon, lat, SAME_M)):
            st['twice'] = st.get('twice', 0) + 1
            continue
        code = community_locator.find(lon, lat)
        if not code:
            st['left_out'] += 1
            continue
        if k == 'local_park_ha':
            v = round(area, 2)
        elif k == 'basketball':
            try:
                v = max(1, int(tags.get('hoops') or 1))
            except ValueError:
                v = 1
        else:
            v = 1
        priv = _private(tags)
        d = (private_by if priv else by).setdefault(code, {})
        d[k] = round(d.get(k, 0) + v, 2)
        st['private' if priv else 'kept'] += 1
        mine[k].add(lon, lat)
        if shape:
            outlines[k].append(geo.Shape(shape))
        kept.append({'kind': k, 'comm': code, 'name': tags.get('name') or '', 'lon': round(lon, 6), 'lat': round(lat, 6),
                     'osm': f"{el.get('type')}/{el.get('id')}", **({'ha': round(area, 2)} if area is not None else {}),
                     **({'access': tags['access']} if tags.get('access') else {}), **({'private': True} if priv else {})})
    return {'by_comm': by, 'by_comm_private': private_by, 'version': 2, 'features': kept, 'stats': stats, 'source': SOURCE, 'kinds': list(KINDS),
            'rules': {'match_m': MATCH_M, 'same_m': SAME_M, 'park_overlap': PARK_OVERLAP, 'park_min_ha': PARK_MIN_HA,
                      'park_max_ha': PARK_MAX_HA}}
