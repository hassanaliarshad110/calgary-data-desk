"""Growth vs amenities, revised 5 November 2026: how far homes are from everyday amenities, and how many children or
residents share the playgrounds and parks within reach.

This file is the method. methods.py explains it in words; tests/t_access.py checks it. The distance part is a port of
canada-insight (insight/indicators/access.py, docs/methodology/access.md, cities/calgary/city.json), with the same
data, filters and formulas, so both sites give the same figures.

PART 1, DISTANCE (is it near?)
  Homes: every residential record on the City's property assessment roll (4bsw-nn7w: assessment_class='RE' AND
  property_type='LI' AND starts_with(sub_property_use,'R')), placed at the mean of its parcel outline's vertices,
  each roll number once. A purpose-built rental building is one record on the roll; it counts as its units
  (data/rentals_all.json: from a matching building permit, or estimated from assessed value).
  For every home and every amenity kind:
      d = straight-line distance in metres to the nearest one, in ANY community
          (points: the amenity's location; parks: the nearest point on the park's edge, sampled every 20 m, 0 inside)
  For a community, a ward and Calgary, weighted by units:
      share within T1 = units with d <= T1 / units;   share within T2 the same at T2
      homes built since 2021 and homes built before 2021: the share within T1 of each (unknown years in neither)
      median distance of the area's records (shown only when it is within T2)
  Reading for a community and an amenity (a stated rule, not a score):
      Too few homes      under 100 units
      Measured gap       under half of units within T1
      Check inventory    a measured gap where 25% or more of units were built in the last five years
                         (developer-built amenities may not be in the City's inventory yet)
      Most homes within reach   otherwise

PART 2, CROWDING (how many people share it?), playgrounds and parks, at T1 and again at T2
  A two-step floating catchment. Children (0 to 14) and residents come from the population model, for the way of
  counting residents chosen in Settings, spread evenly over the homes of each community:
      children per unit in community c = children in c / units in c   (the same for residents)
  Playgrounds (per 1,000 children):
      step 1, each playground j:  children_near(j) = children of the homes within the distance of j;
                                  share(j) = 1 / children_near(j)  (playgrounds with no children within reach skipped)
      step 2, each home i:        reach(i) = 1,000 x the sum of share(j) over the playgrounds within the distance of i
                                  (0 when none is within reach)
      a community, a ward or Calgary: the children-weighted average of reach(i) over its homes
  Parks (hectares per 1,000 residents): the same, with each park's area in hectares in place of 1 and residents in
  place of children; a home is within reach of a park when it is within the distance of the park's edge (or inside).
  Because children per unit is the same for every home of a community, the community figure needs only how many
  units of each community sit within reach of each playground (or park):
      figure(c) = 1,000 / units(c) x sum over j of size(j) x units(c within reach of j) / people_near(j)
  and Calgary's figure is 1,000 x (the playgrounds with children within reach) / (the children in homes): the
  crowding measure moves people between communities, it adds no playgrounds. tests/t_access.py checks both.

Only the heavy first part needs numpy and scipy (the website build has them). The desktop app reads the result the
website publishes every morning (data/access_base.json) when it cannot work it out itself.
"""
import datetime as dt
import json
import math
import os
import time
import urllib.request

import calgary_data as cd

VERSION = 1
REVISED = '2026-11-05'
GROWTH_YEAR = 2021
SITE = 'https://hassanaliarshad110.github.io/calgary-data-desk/'
KEEP_DAYS = 7                   # amenities are read again every week
HOMES_KEEP_DAYS = 30            # the roll changes about once a year
RULES = {'gap_share': 0.5, 'min_units': 100, 'recent_years': 5, 'recent_share': 0.25}
CENTRE_LAT = 51.045             # canada-insight's projection centre for Calgary
EDGE_SPACING = 20.0             # park edges sampled every 20 m (a distance can read up to 10 m long)
PAGE = 50000

HOMES = {
    'dataset': '4bsw-nn7w', 'title': 'Current Year Property Assessments (Parcel)',
    'where': "assessment_class='RE' AND property_type='LI' AND starts_with(sub_property_use,'R')",
    'fields': ['roll_number', 'comm_code', 'year_of_construction', 'multipolygon'],
}
RENTALS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'rentals_all.json')

# the amenities, their filters and distances: canada-insight cities/calgary/city.json
KINDS = {
    'playground': {
        'label': 'Playground', 'plural': 'playgrounds', 'dataset': 'bdu9-amk8', 'title': 'Playground Equipment',
        'where': "type_description='MULTI PLAY COMPLEX' AND life_cycle_status in('ACTIVE','INSTALLED')",
        'geometry': 'point', 'field': 'point', 'thresholds_m': [400, 800], 'crowding': 'children',
        'basis': 'A choice, not a standard: 400 m is about a five-minute walk and 800 m about ten minutes, common '
                 'neighbourhood planning distances.',
        'limits': 'City-maintained play structures only (multi-play complexes that are active or installed); school, '
                  'developer and condominium playgrounds that are not in the City\'s inventory are not counted.'},
    'park': {
        'label': 'Public park', 'plural': 'parks', 'dataset': 'kami-qbfh', 'title': 'Parks Sites',
        'where': "planning_category not in('NON-PARK','PARKS DEPOT')",
        'geometry': 'polygon', 'field': 'the_geom', 'thresholds_m': [400, 800], 'crowding': 'residents',
        'basis': 'A choice, not a standard: distance to the park\'s edge, 400 m and 800 m.',
        'limits': 'Every City park site of any size counts, including small sub-neighbourhood parks and linear parks '
                  'along pathways. Parks in new communities may still be held by the developer and missing from the '
                  'City\'s inventory.'},
    'transit_stop': {
        'label': 'Transit stop', 'plural': 'transit stops', 'dataset': 'muzh-c9qc', 'title': 'Calgary Transit Stops',
        'where': "status='ACTIVE'", 'geometry': 'point', 'field': 'point', 'thresholds_m': [400, 800],
        'basis': '400 m: Calgary Transit Service Guidelines (May 2025) measure coverage as a 400-metre distance from a '
                 'bus stop, about a five-minute walk. 800 m is a choice, not from the guidelines.',
        'basis_url': 'https://transit-prd.calgary.ca/content/dam/transit/plans---projects/Calgary%20Transit%20Service%20Guidelines%20May%202025.pdf',
        'limits': 'A stop is not a service level: how often buses come is not measured here.'},
    'community_centre': {
        'label': 'Community centre', 'plural': 'community centres', 'dataset': 'x34e-bcjz',
        'title': 'Community Services', 'where': "type='Community Centre'", 'geometry': 'point', 'field': 'point',
        'thresholds_m': [800, 1600], 'basis': 'A choice, not a standard: 800 m and 1.6 km.',
        'limits': 'Community association halls and centres as the City lists them. Several large communities show '
                  'no centre within 800 m, which may mean association halls are missing from the City\'s list: this '
                  'figure needs checking. Opening hours and programs are not measured.'},
    'rec_centre': {
        'label': 'Indoor recreation centre', 'plural': 'indoor recreation centres', 'dataset': 'hxfu-6d96',
        'title': 'Recreation Facilities',
        'where': "facility_type in('Leisure Centre','Leisure Centre - Municipal','Aquatic & Fitness Centre','Fieldhouse')",
        'geometry': 'point', 'field': 'point', 'thresholds_m': [2000, 5000],
        'basis': 'A choice, not a standard: 2 km and 5 km for facilities that serve several communities.',
        'limits': 'Leisure centres, aquatic and fitness centres and fieldhouses, municipal and not-for-profit. Arenas, '
                  'outdoor pools, golf courses and other single-purpose sites are left out. Capacity and opening '
                  'hours are not measured.'},
    'library': {
        'label': 'Public library', 'plural': 'public libraries', 'dataset': 'x34e-bcjz', 'title': 'Community Services',
        'where': "type='Library'", 'geometry': 'point', 'field': 'point', 'thresholds_m': [2000, 5000],
        'basis': 'A choice, not a standard: 2 km and 5 km.',
        'limits': 'Library branches as the City lists them; hours and size are not measured.'},
}
CROWDING = ('playground', 'park')
NEWER_SHARE = 0.25         # "newer" communities for the crowding comparison: a quarter or more of homes built since 2021
READINGS = {'too_few_homes': 'Too few homes', 'gap': 'Measured gap', 'gap_check': 'Check inventory',
            'no_gap': 'Most homes within reach'}

LIMITATIONS = [
    'Straight-line distance, not walking distance: walking routes are longer (curved streets, rivers, rail lines, '
    'major roads), so every share is the most generous reading.',
    'The City\'s inventory only: school, developer, condominium, community association and private amenities are not '
    'counted.',
    'A transit stop is not a service level: how often buses come is not measured.',
    'The size and condition of amenities are not measured: each playground counts as one, whatever its size.',
    'Park crowding counts each park\'s whole area, natural areas and regional parks included, so homes near a very large '
    'park (Nose Hill, Fish Creek) show very high hectares per 1,000 residents.',
    'Rental units are partly estimated: purpose-built rental buildings count as their units, from building permits '
    'or, where no permit matches, estimated from assessed value.',
    'Children and residents are spread evenly over the homes of each community, from the population model\'s '
    'estimates (the 2021 Census plus modelled growth), not counted. The crowding figures will be firmed up with the '
    '2026 Census age data in 2027.',
    'New communities on the city\'s edge are naturally farther from shared facilities (recreation centres, libraries), '
    'some planned for later phases.',
    'Community centre data needs checking: several large communities show no community centre within 800 m, which may '
    'mean community association halls are missing from the City\'s list.',
]

# the 23 communities the earlier method flagged on 5 November 2026 (kept to show what changed in the findings)
OLD_FLAGGED = ['MDH', 'CSC', 'BLN', 'SGH', 'SOC', 'BLM', 'CAR', 'HSD', 'GLR', 'BNF', 'MAN', 'SKR', 'SPH', 'RVW', 'DNW',
               'LIV', 'HUX', 'SAD', 'UND', 'BVD', 'LEB', 'RSN', 'MAH']

REVISION = ('Revised 5 November 2026. This tab first counted amenities inside each community\'s boundary per resident. '
            'It now measures the distance from every home to the nearest amenity, in any community, and how many '
            'children or residents share the playgrounds and parks within reach. The earlier list of 23 communities '
            'is replaced.')


# ---------------------------------------------------------------------------------------------- geometry (pure Python)
class Projection:
    """Longitude/latitude to metres on a local equirectangular projection (canada-insight geo.Projection)."""
    M_PER_DEG = 111_132.0

    def __init__(self, lat0=CENTRE_LAT):
        self.kx = self.M_PER_DEG * math.cos(math.radians(lat0))
        self.ky = self.M_PER_DEG

    def xy(self, lon, lat):
        return lon * self.kx, lat * self.ky

    def lonlat(self, x, y):
        return x / self.kx, y / self.ky


def as_multipolygon(geom):
    if not isinstance(geom, dict):
        return None
    t, c = geom.get('type'), geom.get('coordinates')
    if not c:
        return None
    return c if t == 'MultiPolygon' else [c] if t == 'Polygon' else None


def vertex_mean(ring):
    """Mean of a ring's vertices (closing vertex not repeated): where a parcel is placed."""
    pts = ring[:-1] if len(ring) > 1 and ring[0] == ring[-1] else ring
    n = len(pts)
    return sum(p[0] for p in pts) / n, sum(p[1] for p in pts) / n


def densify(ring, spacing):
    """Points along a ring every `spacing` metres, vertices included (canada-insight access.densify)."""
    out = []
    for i in range(1, len(ring)):
        (ax, ay), (bx, by) = ring[i - 1], ring[i]
        n = max(1, int(math.ceil(math.hypot(bx - ax, by - ay) / spacing)))
        for k in range(n):
            t = k / n
            out.append((ax + (bx - ax) * t, ay + (by - ay) * t))
    if ring:
        out.append(tuple(ring[-1]))
    return out


def ring_area(ring):
    a = 0.0
    for i in range(len(ring)):
        x1, y1 = ring[i - 1]
        x2, y2 = ring[i]
        a += x1 * y2 - x2 * y1
    return abs(a) / 2


def area_m2(mp_xy):
    return max(sum(ring_area(p[0]) - sum(ring_area(h) for h in p[1:]) for p in mp_xy if p), 0.0)


def point_in_ring(x, y, ring):
    inside, j = False, len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def point_in_multipolygon(x, y, mp_xy):
    for poly in mp_xy:
        if poly and point_in_ring(x, y, poly[0]) and not any(point_in_ring(x, y, h) for h in poly[1:]):
            return True
    return False


# ------------------------------------------------------------------------------------ the heavy part (numpy, scipy)
def _np():
    import numpy as np                              # noqa: PLC0415 - only the website build needs these
    from scipy.spatial import cKDTree               # noqa: PLC0415
    return np, cKDTree


def distances_to_points(homes_xy, pts_xy, cap):
    """Distance from each home to the nearest point; inf beyond cap or when there are no points."""
    np, KD = _np()
    homes_xy = np.asarray(homes_xy, dtype=float).reshape(-1, 2)
    if len(pts_xy) == 0:
        return np.full(len(homes_xy), np.inf)
    d, _ = KD(np.asarray(pts_xy, dtype=float)).query(homes_xy, k=1, distance_upper_bound=cap)
    return d


def _inside_mask(np, homes_xy, polys, idx=None):
    """Which homes (all, or those in idx) are inside any of the polygons (bounding boxes first, then exact)."""
    n = len(homes_xy)
    idx = np.arange(n) if idx is None else np.asarray(idx)
    out = np.zeros(n, dtype=bool)
    if not len(idx):
        return out
    xs, ys = homes_xy[idx, 0], homes_xy[idx, 1]
    for mp in polys:
        pts = [p for poly in mp for p in poly[0]]
        if not pts:
            continue
        x0, y0 = min(p[0] for p in pts), min(p[1] for p in pts)
        x1, y1 = max(p[0] for p in pts), max(p[1] for p in pts)
        m = (xs >= x0) & (xs <= x1) & (ys >= y0) & (ys <= y1)
        for k in np.where(m)[0]:
            i = idx[k]
            if not out[i] and point_in_multipolygon(xs[k], ys[k], mp):
                out[i] = True
    return out


def distances_to_polygons(homes_xy, polys, cap, spacing=EDGE_SPACING):
    """Distance from each home to the nearest polygon edge (edges sampled every `spacing` m), 0 for homes inside."""
    np, _ = _np()
    homes_xy = np.asarray(homes_xy, dtype=float).reshape(-1, 2)
    pts = [p for mp in polys for poly in mp for ring in poly for p in densify(ring, spacing)]
    d = distances_to_points(homes_xy, pts, cap)
    far = np.where(d > spacing / 2)[0]
    d[_inside_mask(np, homes_xy, polys, far)] = 0.0
    return d


def homes_near_points(homes_xy, pts_xy, r):
    """For each point, the indices of the homes within r metres."""
    np, KD = _np()
    if not len(pts_xy):
        return []
    tree = KD(np.asarray(homes_xy, dtype=float))
    return [np.asarray(x, dtype=np.int64) for x in tree.query_ball_point(np.asarray(pts_xy, dtype=float), r)]


def homes_near_polygons(homes_xy, polys, r, spacing=EDGE_SPACING, coarse=200.0):
    """For each polygon, the indices of the homes within r metres of its edge (sampled every `spacing` m) or inside.
    Candidates come from a coarse sampling of the edge with r + coarse / 2 (a superset), then the fine edge decides."""
    np, KD = _np()
    homes_xy = np.asarray(homes_xy, dtype=float).reshape(-1, 2)
    tree = KD(homes_xy)
    out = []
    for mp in polys:
        rings = [ring for poly in mp for ring in poly]
        fine = [p for ring in rings for p in densify(ring, spacing)]
        if not fine:
            out.append(np.zeros(0, dtype=np.int64))
            continue
        rough = [p for ring in rings for p in densify(ring, coarse)]
        cand = set()
        for lst in tree.query_ball_point(np.asarray(rough, dtype=float), r + coarse / 2 + spacing):
            cand.update(lst)
        # homes inside the polygon (possibly far from any edge of a big park): check the bounding box
        pts = [p for poly in mp for p in poly[0]]
        x0, y0 = min(p[0] for p in pts), min(p[1] for p in pts)
        x1, y1 = max(p[0] for p in pts), max(p[1] for p in pts)
        inbox = np.where((homes_xy[:, 0] >= x0) & (homes_xy[:, 0] <= x1) & (homes_xy[:, 1] >= y0) & (homes_xy[:, 1] <= y1))[0]
        cand = np.asarray(sorted(cand), dtype=np.int64)
        keep = np.zeros(0, dtype=np.int64)
        if len(cand):
            d, _ = KD(np.asarray(fine, dtype=float)).query(homes_xy[cand], k=1, distance_upper_bound=r)
            keep = cand[d <= r]
        rest = np.setdiff1d(inbox, keep, assume_unique=False)
        if len(rest):
            ins = _inside_mask(np, homes_xy, [mp], rest)
            keep = np.union1d(keep, np.where(ins)[0])
        out.append(keep)
    return out


def _median(values):
    v = sorted(values)
    n = len(v)
    if not n:
        return None
    return v[n // 2] if n % 2 else (v[n // 2 - 1] + v[n // 2]) / 2


def summarise(np, d, w, built, th, growth_year, recent_from):
    """Sums for one group of homes and one amenity kind, kept as sums so wards and Calgary add up from communities."""
    p, s = th
    new, old = built >= growth_year, built < growth_year          # NaN (unknown year) is in neither
    recent = built >= recent_from
    w1, w2 = d <= p, d <= s
    med = float(np.median(d)) if len(d) else None
    return {
        'units': float(w.sum()), 'records': int(len(w)), 'records_1': int(w1.sum()),
        'units_1': float(w[w1].sum()), 'units_2': float(w[w2].sum()),
        'units_new': float(w[new].sum()), 'units_new_1': float(w[new & w1].sum()),
        'units_old': float(w[old].sum()), 'units_old_1': float(w[old & w1].sum()),
        'units_recent': float(w[recent].sum()),
        'median_m': None if med is None or not math.isfinite(med) else round(med),
    }


# ------------------------------------------------------------------------------------------------- reading the data
def _pages(dataset, select, where):
    offset = 0
    while True:
        page = cd.get_json(cd.soql_url(dataset, select=select, where=where, order=':id', limit=PAGE, offset=offset),
                           timeout=300)
        if not page:
            return
        yield page
        if len(page) < PAGE:
            return
        offset += len(page)


def _year(v):
    try:
        y = int(float(v))
    except (TypeError, ValueError):
        return None
    return y if y > 0 else None


def read_homes(proj):
    """Every residential record on the roll, placed at its parcel's vertex mean, with its units."""
    with open(RENTALS, encoding='utf-8') as f:
        rent = json.load(f)
    weights = {str(p['roll']): (float(p['units']), p.get('source') or 'estimated') for p in rent['properties']}
    seen, rows = set(), []
    stats = {'read': 0, 'no_outline': 0, 'repeated': 0}

    def take(page):
        for r in page:
            stats['read'] += 1
            rid = str(r.get('roll_number'))
            mp = as_multipolygon(r.get('multipolygon'))
            ring = mp[0][0] if mp and mp[0] and mp[0][0] else None
            if ring is None:
                stats['no_outline'] += 1
                continue
            if rid in seen:
                stats['repeated'] += 1
                continue
            seen.add(rid)
            lon, lat = vertex_mean(ring)
            x, y = proj.xy(lon, lat)
            u, src = weights.get(rid, (1.0, 'roll'))
            rows.append((rid, r.get('comm_code'), _year(r.get('year_of_construction')), x, y, u,
                         'estimate' if src == 'estimated' else 'official'))

    sel = ','.join(HOMES['fields'])
    for page in _pages(HOMES['dataset'], sel, HOMES['where']):
        take(page)
    extra = [rid for rid in weights if rid not in seen]            # rental buildings outside the residential filter
    for i in range(0, len(extra), 200):
        batch = extra[i:i + 200]
        where = 'roll_number in(' + ','.join("'" + b.replace("'", "''") + "'" for b in batch) + ')'
        take(cd.get_json(cd.soql_url(HOMES['dataset'], select=sel, where=where, limit=5000), timeout=300))
    stats['rental_buildings_listed'] = len(weights)
    stats['rental_buildings_found'] = sum(1 for rid in weights if rid in seen)
    stats['rental_units_used'] = round(sum(weights[rid][0] for rid in weights if rid in seen), 1)
    return rows, stats


def read_amenities(proj):
    out = {}
    for key, k in KINDS.items():
        rows = cd.get_json(cd.soql_url(k['dataset'], select=k['field'], where=k['where'], limit=50000), timeout=300)
        pts, polys, areas = [], [], []
        for r in rows:
            g = r.get(k['field'])
            if k['geometry'] == 'point':
                c = g.get('coordinates') if isinstance(g, dict) else None
                if c:
                    pts.append(proj.xy(c[0], c[1]))
            else:
                mp = as_multipolygon(g)
                if mp:
                    pxy = [[[proj.xy(p[0], p[1]) for p in ring] for ring in poly] for poly in mp]
                    polys.append(pxy)
                    areas.append(area_m2(pxy) / 10000.0)
        out[key] = {'rows': len(rows), 'pts': pts, 'polys': polys, 'area_ha': areas}
    return out


# --------------------------------------------------------------------------------------------------- the base file
# ------------------------------------------------- the optional "with private amenities" view (OpenStreetMap)
VARIANTS = {'osm': 'City + private amenities accessible to the community (OpenStreetMap)',
            'osm_private': 'City + private accessible + gated, residents-only (OpenStreetMap)'}
OSM_KIND = {'playgrounds': 'playground', 'local_park_ha': 'park'}


def other_amenities(features, proj):
    """OpenStreetMap playgrounds and parks that are not the City's (osm.py takes out every City one), split into the
    ones open to everyone and the gated, residents-only ones. A park is a circle of its own area around its middle
    (OpenStreetMap parks are kept as a point and an area), so its edge is that far from the middle."""
    out = {'open': {'playground': [], 'park': []}, 'gated': {'playground': [], 'park': []}}
    for f in features or []:
        k = OSM_KIND.get(f.get('kind'))
        if not k or f.get('lon') is None or f.get('lat') is None:
            continue
        x, y = proj.xy(f['lon'], f['lat'])
        ha = float(f.get('ha') or 0)
        item = (x, y) if k == 'playground' else (x, y, math.sqrt(ha * 10000 / math.pi), ha)
        out['gated' if f.get('private') else 'open'][k].append(item)
    return out


def _circles(np, KD, xy, circles, cap):
    """Distance from each home to the nearest circle's edge (0 inside), and for each circle the homes within cap."""
    d = np.full(len(xy), np.inf)
    near = []
    if not circles:
        return d, near
    tree = KD(xy)
    for (cx, cy, r, _) in circles:
        ii = np.asarray(tree.query_ball_point([cx, cy], cap + r), dtype=np.int64)
        if len(ii):
            dd = np.maximum(0.0, np.hypot(xy[ii, 0] - cx, xy[ii, 1] - cy) - r)
            d[ii] = np.minimum(d[ii], dd)
        near.append((ii, None if not len(ii) else np.maximum(0.0, np.hypot(xy[ii, 0] - cx, xy[ii, 1] - cy) - r)))
    return d, near


def compute(homes, ams, ward_of, today=None, other=None):
    """Everything that does not depend on how residents are counted: distance sums by community, medians by
    community, ward and Calgary, and for playgrounds and parks the units of each community within reach of each one.

    homes: list of (roll, comm, year, x, y, units, kind); ams: read_amenities(); ward_of: {comm: ward number}."""
    np, _ = _np()
    today = today or dt.date.today()
    recent_from = today.year - RULES['recent_years'] + 1
    xy = np.asarray([(h[3], h[4]) for h in homes], dtype=float).reshape(-1, 2)
    w = np.asarray([h[5] for h in homes], dtype=float)
    built = np.asarray([np.nan if h[2] is None else h[2] for h in homes], dtype=float)
    comm = np.asarray([h[1] or '' for h in homes], dtype=object)
    codes = sorted({c for c in comm if c})
    idx = {c: np.where(comm == c)[0] for c in codes}
    wards = {}
    for c in codes:
        if ward_of.get(c):
            wards.setdefault(int(ward_of[c]), []).append(idx[c])
    widx = {k: np.concatenate(v) for k, v in wards.items()}
    out = {'version': VERSION, 'built_at': dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
           'counted': today.isoformat(), 'growth_year': GROWTH_YEAR, 'recent_from_year': recent_from,
           'rules': RULES, 'kinds': {k: {f: v.get(f) for f in ('label', 'plural', 'dataset', 'title', 'where', 'geometry',
                                                             'thresholds_m', 'crowding', 'basis', 'basis_url', 'limits')}
                                     for k, v in KINDS.items()},
           'homes': {'records': int(len(w)), 'units': round(float(w.sum()), 1),
                     'units_estimated': round(float(sum(h[5] for h in homes if h[6] == 'estimate')), 1),
                     'not_in_a_community': int(sum(1 for c in comm if not c))},
           'amenities': {k: {'rows': ams[k]['rows'], 'placed': len(ams[k]['pts']) + len(ams[k]['polys'])} for k in KINDS},
           'comm': {c: {'units': float(w[idx[c]].sum()), 'records': int(len(idx[c])),
                        'units_new': float(w[idx[c]][built[idx[c]] >= GROWTH_YEAR].sum()),
                        'units_recent': float(w[idx[c]][built[idx[c]] >= recent_from].sum()), 'access': {}}
                    for c in codes},
           'ward': {str(k): {'access': {}} for k in sorted(widx)}, 'city': {'access': {}}, 'catch': {}}
    dist = {}

    def by_comm(ii):
        by = {}
        for c, u in zip(comm[ii], w[ii]):
            if c:
                by[c] = by.get(c, 0.0) + float(u)
        return {c: round(u, 1) for c, u in by.items()}
    for key, k in KINDS.items():
        th = k['thresholds_m']
        if k['geometry'] == 'point':
            d = distances_to_points(xy, ams[key]['pts'], th[1])
        else:
            d = distances_to_polygons(xy, ams[key]['polys'], th[1])
        dist[key] = d
        out['city']['access'][key] = summarise(np, d, w, built, th, GROWTH_YEAR, recent_from)
        for c in codes:
            out['comm'][c]['access'][key] = summarise(np, d[idx[c]], w[idx[c]], built[idx[c]], th, GROWTH_YEAR, recent_from)
        for wk, ii in widx.items():
            out['ward'][str(wk)]['access'][key] = summarise(np, d[ii], w[ii], built[ii], th, GROWTH_YEAR, recent_from)
        if key not in CROWDING:
            continue
        out['catch'][key] = {}
        for r in th:
            near = homes_near_points(xy, ams[key]['pts'], r) if k['geometry'] == 'point' \
                else homes_near_polygons(xy, ams[key]['polys'], r)
            rows = []
            for j, ii in enumerate(near):
                size = 1.0 if k['geometry'] == 'point' else round(ams[key]['area_ha'][j], 4)
                rows.append([size, by_comm(ii)])
            out['catch'][key][str(r)] = rows
    # the optional view with private amenities that are not the City's (OpenStreetMap): playgrounds and parks only
    if other:
        _, KD = _np()
        out['variants'] = {}
        for v, groups in (('osm', ('open',)), ('osm_private', ('open', 'gated'))):
            var = {'label': VARIANTS[v], 'comm': {c: {} for c in codes}, 'ward': {str(x): {} for x in widx}, 'city': {},
                   'catch': {}, 'added': {}}
            for key in CROWDING:
                th = KINDS[key]['thresholds_m']
                extra = [it for g in groups for it in other[g][key]]
                var['added'][key] = len(extra)
                if key == 'playground':
                    d2 = np.minimum(dist[key], distances_to_points(xy, extra, th[1]))
                else:
                    dc, _ = _circles(np, KD, xy, extra, th[1])
                    d2 = np.minimum(dist[key], dc)
                var['city'][key] = summarise(np, d2, w, built, th, GROWTH_YEAR, recent_from)
                for c in codes:
                    var['comm'][c][key] = summarise(np, d2[idx[c]], w[idx[c]], built[idx[c]], th, GROWTH_YEAR, recent_from)
                for wk, ii in widx.items():
                    var['ward'][str(wk)][key] = summarise(np, d2[ii], w[ii], built[ii], th, GROWTH_YEAR, recent_from)
                var['catch'][key] = {}
                for r in th:
                    if key == 'playground':
                        rows = [[1.0, by_comm(ii)] for ii in homes_near_points(xy, extra, r)]
                    else:
                        _, near2 = _circles(np, KD, xy, extra, r)
                        rows = [[round(it[3], 4), by_comm(ii[dd <= r]) if len(ii) else {}]
                                for it, (ii, dd) in zip(extra, near2)]
                    var['catch'][key][str(r)] = out['catch'][key][str(r)] + rows
            out['variants'][v] = var
    return out


def build(cache_dir, ward_of, today=None, features=None):
    """Read everything again and work it out (the website build). Needs numpy and scipy."""
    proj = Projection()
    t0 = time.time()
    hp = os.path.join(cache_dir, 'access', 'homes.json')
    if os.path.exists(hp) and time.time() - os.path.getmtime(hp) < HOMES_KEEP_DAYS * 86400:
        with open(hp, encoding='utf-8') as f:
            hj = json.load(f)
        homes, hstats = [tuple(h) for h in hj['homes']], hj['stats']
    else:
        homes, hstats = read_homes(proj)
        _write(hp, {'read_at': dt.date.today().isoformat(), 'stats': hstats,
                    'homes': [[h[0], h[1], h[2], round(h[3], 2), round(h[4], 2), h[5], h[6]] for h in homes]})
    ams = read_amenities(proj)
    base = compute(homes, ams, ward_of, today, other=other_amenities(features, proj) if features else None)
    base['homes'].update({k: hstats.get(k) for k in ('read', 'no_outline', 'repeated', 'rental_buildings_listed',
                                                       'rental_buildings_found', 'rental_units_used')})
    base['seconds'] = round(time.time() - t0, 1)
    return base


def _write(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path + '.tmp', 'w', encoding='utf-8') as f:
        json.dump(obj, f, separators=(',', ':'))
    os.replace(path + '.tmp', path)


def load(cache_dir, ward_of=None, force=False, features=None):
    """The base figures: this week's copy, worked out here when numpy and scipy are installed (the website build), or
    else the copy the website published this morning. None when neither can be had."""
    path = os.path.join(cache_dir or '.', 'access', 'base.json')
    fresh = os.path.exists(path) and time.time() - os.path.getmtime(path) < KEEP_DAYS * 86400
    if fresh and not force:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    try:
        _np()
        can_build = True
    except ImportError:
        can_build = False
    try:
        if can_build and ward_of is not None:
            base = build(cache_dir, ward_of, features=features)
        else:
            with urllib.request.urlopen(SITE + 'data/access_base.json', timeout=120) as r:
                base = json.loads(r.read().decode('utf-8'))
        _write(path, base)
        return base
    except Exception:                       # noqa: BLE001 - keep last week's copy rather than nothing
        if os.path.exists(path):
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        return None


# ------------------------------------------------------------------------------------- the view (pure Python, fast)
def _share(a, b):
    return round(a / b, 4) if b else None


def reading(st, rules=RULES):
    """The stated rule for one community and one amenity."""
    if st['units'] < rules['min_units'] or not st['units']:
        return 'too_few_homes'
    if st['units_1'] / st['units'] >= rules['gap_share']:
        return 'no_gap'
    if st['units_recent'] / st['units'] >= rules['recent_share']:
        return 'gap_check'
    return 'gap'


def shares(st, th):
    """Published figures from the sums of one group."""
    return {'units': round(st['units'], 1), 'records': st['records'],
            'share_1': _share(st['units_1'], st['units']), 'share_2': _share(st['units_2'], st['units']),
            'share_records_1': _share(st['records_1'], st['records']),
            'share_new_1': _share(st['units_new_1'], st['units_new']),
            'share_old_1': _share(st['units_old_1'], st['units_old']),
            'units_new': round(st['units_new'], 1), 'units_old': round(st['units_old'], 1),
            'median_m': st['median_m'] if st.get('median_m') is not None and st['median_m'] <= th[1] else None,
            'median_beyond': bool(st.get('median_m') is None or st['median_m'] > th[1])}


def crowding(rows, per_unit, units):
    """Two-step floating catchment from the base file's catchment rows.

    rows: [[size, {community: units within reach}], ...] for one kind at one distance;
    per_unit: {community: children (or residents) per unit}; units: {community: all units of the community}.
    Returns {community: figure per 1,000}, the people in homes of each community, and the totals for checking."""
    near = []
    for size, by in rows:
        people = sum(per_unit.get(c, 0.0) * u for c, u in by.items())
        near.append(people)
    acc = {}
    used = used_size = 0.0
    for (size, by), people in zip(rows, near):
        if people <= 0:
            continue                                        # no children (residents) within reach: skipped
        used += 1
        used_size += size
        for c, u in by.items():
            acc[c] = acc.get(c, 0.0) + size * u / people
    fig = {c: (1000.0 * acc.get(c, 0.0) / units[c]) if units.get(c) else None for c in units}
    people_in = {c: per_unit.get(c, 0.0) * units[c] for c in units}
    return fig, people_in, {'amenities_reached': int(used), 'size_reached': round(used_size, 2),
                            'people_near': near}


def average(fig, people, codes):
    tot = sum(people.get(c, 0.0) for c in codes if fig.get(c) is not None)
    if tot <= 0:
        return None
    return sum(fig[c] * people[c] for c in codes if fig.get(c) is not None) / tot


def view(base, pops, kids, method, scope_codes, ward_of, names, all_codes=None, methods_pops=None, _variants=True):
    """The tab's figures for one area under one way of counting residents.

    pops: {community: residents} and kids: {community: children 0 to 14} for the chosen count; methods_pops:
    {method key: (pops, kids)} for the sensitivity line; scope_codes: the communities shown (a ward, or every
    lived-in community for Calgary); ward_of: {community: ward}; names: {community: name}."""
    if not base:
        return None
    kinds = base['kinds']
    comm = base['comm']
    units = {c: v['units'] for c, v in comm.items()}

    def figs(p, k):
        per_child = {c: (k.get(c) or 0) / units[c] for c in units if units[c]}
        per_res = {c: (p.get(c) or 0) / units[c] for c in units if units[c]}
        res = {}
        for key in CROWDING:
            per = per_child if kinds[key].get('crowding') == 'children' else per_res
            res[key] = {}
            for r in kinds[key]['thresholds_m']:
                f, ppl, tot = crowding(base['catch'][key][str(r)], per, units)
                res[key][str(r)] = (f, ppl, tot)
        return res

    cur = figs(pops, kids)
    wards = sorted({int(w) for w in ward_of.values() if w})
    by_ward = {}
    for wk in wards:
        by_ward.setdefault(wk, [c for c in comm if ward_of.get(c) == wk])

    def area(codes, sums_access=None):
        """Distance figures (from the sums) and crowding (people-weighted) for a group of communities."""
        out = {}
        for key, k in kinds.items():
            th = k['thresholds_m']
            keys_ = ('units', 'records', 'records_1', 'units_1', 'units_2', 'units_new', 'units_new_1', 'units_old',
                     'units_old_1', 'units_recent')
            st = {f: sum(comm[c]['access'][key][f] for c in codes if c in comm) for f in keys_}
            st['median_m'] = (sums_access or {}).get(key, {}).get('median_m') if sums_access else None
            out[key] = shares(st, th)
            if key in CROWDING:
                for r in th:
                    f, ppl, _ = cur[key][str(r)]
                    v = average(f, ppl, [c for c in codes if c in comm])
                    out[key]['crowding_' + str(r)] = None if v is None else round(v, 2)
        return out

    city = area(list(comm), base['city']['access'])
    ward_rows = [{'ward': wk, **area(by_ward[wk], (base['ward'].get(str(wk)) or {}).get('access'))} for wk in wards]
    communities = []
    for c in scope_codes:
        if c not in comm:
            continue
        v = comm[c]
        row = {'code': c, 'name': names.get(c, c), 'ward': ward_of.get(c), 'units': round(v['units'], 1),
               'units_new': round(v['units_new'], 1),
               'recent_share': _share(v['units_recent'], v['units']), 'residents': pops.get(c), 'children': kids.get(c)}
        for key, k in kinds.items():
            st = v['access'][key]
            row[key] = {**shares(st, k['thresholds_m']), 'reading': reading(st)}
            if key in CROWDING:
                for r in k['thresholds_m']:
                    f = cur[key][str(r)][0].get(c)
                    row[key]['crowding_' + str(r)] = None if f is None else round(f, 2)
        communities.append(row)
    sens = {}
    for m, (p, k) in (methods_pops or {}).items():
        fm = figs(p, k)
        sens[m] = {key: {str(r): (lambda f_, ppl_: None if average(f_, ppl_, list(comm)) is None
                                  else round(average(f_, ppl_, list(comm)), 2))(*fm[key][str(r)][:2])
                         for r in kinds[key]['thresholds_m']} for key in CROWDING}
    # checks that travel with the figures: Calgary's crowding is (amenities reached) x 1,000 / (people in homes)
    checks = {}
    for key in CROWDING:
        for r in kinds[key]['thresholds_m']:
            f, ppl, tot = cur[key][str(r)]
            people = sum(ppl.values())
            checks[f'{key}_{r}'] = {'amenities_with_people_near': tot['amenities_reached'], 'size_reached': tot['size_reached'],
                                    'people_in_homes': round(people), 'calgary_figure': city[key]['crowding_' + str(r)],
                                    'same_as_total': None if not people else round(1000 * tot['size_reached'] / people, 2)}
    # crowding in communities where a quarter or more of homes were built since 2021, against the rest of Calgary
    newer = [c for c, v in comm.items() if v['units'] and v['units_new'] / v['units'] >= NEWER_SHARE]
    rest = [c for c in comm if c not in set(newer)]
    groups = {'newer_share': NEWER_SHARE, 'newer_count': len(newer),
              'newer_units': round(sum(comm[c]['units'] for c in newer)), 'rest_units': round(sum(comm[c]['units'] for c in rest))}
    for key in CROWDING:
        for r in kinds[key]['thresholds_m']:
            f, ppl, _ = cur[key][str(r)]
            a_, b_ = average(f, ppl, newer), average(f, ppl, rest)
            groups[f'{key}_{r}'] = {'newer': None if a_ is None else round(a_, 2), 'rest': None if b_ is None else round(b_, 2)}
    return {'version': base.get('version'), 'revised': REVISED, 'crowding_groups': groups, 'revision': REVISION, 'counted': base.get('counted'),
            'built_at': base.get('built_at'), 'growth_year': base['growth_year'],
            'recent_from_year': base['recent_from_year'], 'rules': base['rules'], 'kinds': kinds,
            'readings': READINGS, 'homes': base['homes'], 'amenities': base['amenities'], 'method': method,
            'city': city, 'wards': ward_rows, 'communities': communities, 'sensitivity': sens, 'checks': checks,
            'limitations': LIMITATIONS, 'findings': findings(city, kinds), 'old_flagged': OLD_FLAGGED,
            'old_flagged_now': old_list(comm, names),
            'with_other': other_views(base, pops, kids, method, scope_codes, ward_of, names, all_codes=all_codes,
                                      methods_pops=methods_pops) if _variants and base.get('variants') else None}


def old_list(comm, names):
    """The 23 communities the earlier method flagged, read with the new method (for the What changed page)."""
    out = []
    for c in OLD_FLAGGED:
        v = comm.get(c)
        if not v:
            continue
        row = {'code': c, 'name': names.get(c, c), 'units': round(v['units'], 1)}
        for key in KINDS:
            st = v['access'][key]
            row[key] = {'share_1': _share(st['units_1'], st['units']), 'reading': reading(st)}
        out.append(row)
    return out


def with_variant(base, v):
    """The base file with playgrounds and parks counted with the variant's amenities (the rest unchanged)."""
    var = (base.get('variants') or {}).get(v)
    if not var:
        return None
    comm = {c: {**x, 'access': {**x['access'], **var['comm'].get(c, {})}} for c, x in base['comm'].items()}
    ward = {k: {'access': {**x['access'], **var['ward'].get(k, {})}} for k, x in base['ward'].items()}
    return {**base, 'comm': comm, 'ward': ward, 'city': {'access': {**base['city']['access'], **var['city']}},
            'catch': {**base['catch'], **var['catch']}}


def other_views(base, *args, **kw):
    """The tab's playground and park figures with private amenities added (the "Count private amenities" filter)."""
    out = {}
    for v in (base.get('variants') or {}):
        b = with_variant(base, v)
        r = view(b, *args, **kw, _variants=False)
        pick = lambda x: {k: x[k] for k in CROWDING if k in x}
        out[v] = {'label': VARIANTS.get(v, v), 'added': base['variants'][v].get('added'),
                  'city': pick(r['city']), 'wards': [{'ward': w['ward'], **pick(w)} for w in r['wards']],
                  'communities': [{'code': c['code'], **pick(c)} for c in r['communities']],
                  'crowding_groups': r['crowding_groups'], 'sensitivity': r['sensitivity'],
                  'findings': [f for f in r['findings'] if f['kind'] in CROWDING]}
    return out


def findings(city, kinds):
    """Calgary-wide: homes built since 2021 against older homes, amenity by amenity, in words worked out from the
    figures (no wording is fixed in advance)."""
    out = []
    for key, k in kinds.items():
        a = city[key]
        n, o = a.get('share_new_1'), a.get('share_old_1')
        if n is None or o is None:
            continue
        gap = round((o - n) * 100)
        out.append({'kind': key, 'label': k['label'], 'distance_m': k['thresholds_m'][0],
                    'new': n, 'old': o, 'points_behind': gap})
    return out
