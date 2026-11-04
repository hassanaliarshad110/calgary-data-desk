"""Public amenities and City assets in every community, from City of Calgary open data.

Counts every bench, picnic table, playground, sports asset, park washroom, drinking fountain, park garbage bin,
off-leash area, park and public tree, and places each in its community (by its exact location, or the City's
community code where the dataset has one). The whole city is counted once and kept for a week: assets change
slowly, and the parks file is large. The dashboard then sets each community's amenities against its residents
and children, to show where amenities have not kept up with growth.
"""
import json
import math
import os
import time

import calgary_data as cd
import geo
import osm

KEEP_DAYS = 7
COMMUNITIES = 'surr-xmvs'
LIVE = "life_cycle_status in('ACTIVE','INSTALLED')"

# key: (label, dataset id, where, plural noun, per what: 'residents' or 'children')
KINDS = {
    'benches': ('Park benches', 'ikeb-n5bc',
                f"type_description in('PARKS BENCH','MEMORIAL BENCH','ADIRONDACK CHAIR') AND {LIVE}", 'benches', 'residents'),
    'picnic_tables': ('Picnic tables', 'ikeb-n5bc',
                      f"type_description in('PICNIC TABLE','MEMORIAL PICNIC TABLE') AND {LIVE}", 'picnic tables', 'residents'),
    'playgrounds': ('Playgrounds', 'bdu9-amk8', f"type_description='MULTI PLAY COMPLEX' AND {LIVE}", 'playgrounds', 'children'),
    'fitness': ('Outdoor fitness equipment', 'bdu9-amk8', f"type_description='FITNESS EQUIPMENT' AND {LIVE}",
                'pieces of fitness equipment', 'residents'),
    'basketball': ('Basketball hoops', 'da6k-wpxb', "type_description='BASKETBALL HOOP'", 'basketball hoops', 'residents'),
    'goal_posts': ('Sports field goal posts', 'da6k-wpxb', "type_description='GOAL POST'", 'goal posts', 'residents'),
    'disc_golf': ('Disc golf baskets', 'da6k-wpxb', "type_description='DISK GOLF BASKET'", 'disc golf baskets', 'residents'),
    'washrooms': ('Park washrooms', 'jjkg-kv4n', "asset_type='WASHROOM'", 'park washrooms', 'residents'),
    'fountains': ('Drinking fountains', 'jjkg-kv4n', "asset_type='DRINKING FOUNTAIN'", 'drinking fountains', 'residents'),
    'garbage': ('Park garbage and recycling bins', 'fwyk-8pth', LIVE, 'bins', 'residents'),
    'rec_facilities': ('Recreation facilities', 'hxfu-6d96', None, 'recreation facilities', 'residents'),
    'libraries': ('Libraries', 'x34e-bcjz', "type='Library'", 'libraries', 'residents'),
    'community_centres': ('Community centres and halls', 'x34e-bcjz', "type='Community Centre'",
                          'community centres', 'residents'),
    'transit_stops': ('Transit stops', 'muzh-c9qc', "status='ACTIVE'", 'transit stops', 'residents'),
}
POLYGONS = {
    'off_leash': ('Off-leash dog areas', 'enr4-crti', "status='OPEN'", 'multipolygon', 'off-leash areas', 'residents'),
    'parks': ('Parks', 'kami-qbfh', "planning_category not in('NON-PARK','PARKS DEPOT')", 'the_geom', 'parks', 'residents'),
}
# neighbourhood-scale parks: the ones residents walk to (regional, district and linear parks serve the whole city)
LOCAL_PARKS = ('SUBNEIGHBOURHOOD PARK', 'NEIGHBOURHOOD PARK', 'COMMUNITY PARK')
TREES = 'tfs4-3wwa'
SOURCES = {'Parks Seating': 'ikeb-n5bc', 'Playground Equipment': 'bdu9-amk8', 'Parks Sport Equipment': 'da6k-wpxb',
           'Parks Plumbing Fixtures': 'jjkg-kv4n', 'Parks Wayfinder Garbage and Recycle': 'fwyk-8pth',
           'Parks Off Leash Areas': 'enr4-crti', 'Parks Sites': 'kami-qbfh', 'Public Trees': TREES,
           'Recreation Facilities': 'hxfu-6d96', 'Community Services': 'x34e-bcjz', 'Calgary Transit Stops': 'muzh-c9qc',
           'Community District Boundaries': COMMUNITIES}


def _area_ha(multipolygon):
    """Area in hectares (outer rings minus holes), on a local flat projection."""
    total = 0.0
    for polygon in (multipolygon or {}).get('coordinates', []):
        for i, ring in enumerate(polygon):
            if len(ring) < 3:
                continue
            lat0 = math.radians(sum(p[1] for p in ring) / len(ring))
            kx, ky = 111320 * math.cos(lat0), 110540
            a = 0.0
            for j in range(len(ring)):
                x1, y1 = ring[j - 1][0] * kx, ring[j - 1][1] * ky
                x2, y2 = ring[j][0] * kx, ring[j][1] * ky
                a += x1 * y2 - x2 * y1
            total += (abs(a) / 2) * (1 if i == 0 else -1)
    return max(total, 0.0) / 10000


def build():
    """{'by_comm': {code: {kind: n, 'park_ha', 'local_park_ha', 'trees'}}, 'kinds': {...}, 'totals': {...}}"""
    comms = cd.query(COMMUNITIES, select='comm_code,multipolygon', limit=5000)
    loc = geo.Locator({c['comm_code']: c['multipolygon'] for c in comms if c.get('comm_code') and c.get('multipolygon')})
    by = {}

    def add(code, key, v=1):
        if code:
            d = by.setdefault(code, {})
            d[key] = round(d.get(key, 0) + v, 3)
    errors = []
    mine = {'playgrounds': [], 'fitness': [], 'basketball': [], 'off_leash': [], 'parks': []}   # to find OSM duplicates
    for key, (label, ds, where, _, _) in KINDS.items():
        try:
            rows = cd.query(ds, select='point', where=where, limit=50000) if where else cd.query(ds, select='point', limit=50000)
        except Exception as e:                       # noqa: BLE001 - one missing layer must not stop the rest
            errors.append(f'{label}: {e}')
            continue
        for r in rows:
            pt = (r.get('point') or {}).get('coordinates')
            if pt:
                add(loc.find(float(pt[0]), float(pt[1])), key)
                if key in mine:
                    mine[key].append((float(pt[0]), float(pt[1])))
    for key, (label, ds, where, field, _, _) in POLYGONS.items():
        try:
            sel = f'{field},planning_category' if key == 'parks' else field
            rows = cd.query(ds, select=sel, where=where, limit=10000)
        except Exception as e:                       # noqa: BLE001
            errors.append(f'{label}: {e}')
            continue
        for r in rows:
            shape = r.get(field)
            if not shape:
                continue
            lon, lat = geo.centre(shape)
            code = loc.find(lon, lat)
            add(code, key)
            mine[key].append(shape)
            if key == 'parks':
                ha = _area_ha(shape)
                add(code, 'park_ha', ha)
                if (r.get('planning_category') or '') in LOCAL_PARKS:
                    add(code, 'local_park_ha', ha)
    try:
        for r in cd.query(TREES, select='comm_code,count(*) as n', group='comm_code', limit=2000):
            add(r.get('comm_code'), 'trees', int(float(r.get('n') or 0)))
    except Exception as e:                           # noqa: BLE001
        errors.append(f'Public trees: {e}')
    totals = {}
    for d in by.values():
        for k, v in d.items():
            totals[k] = round(totals.get(k, 0) + v, 1)
    # amenities that are not the City's (developer, condo, homeowners' association and school ones), from OpenStreetMap,
    # with every one the City already lists taken out (osm.py has the matching rules)
    other = None
    try:
        other = osm.build(osm.fetch(), mine, loc)
        other['counted'] = time.strftime('%Y-%m-%d')
    except Exception as e:                           # noqa: BLE001 - the City's counts stand on their own
        errors.append(f'OpenStreetMap: {e}')
    return {'by_comm': by, 'totals': totals, 'errors': errors, 'kinds': kinds(), 'sources': SOURCES, 'other': other}


def kinds():
    """What each count is, for the screens: {key: {'label', 'noun', 'per'}}"""
    out = {k: {'label': v[0], 'noun': v[3], 'per': v[4], 'dataset': v[1]} for k, v in KINDS.items()}
    out.update({k: {'label': v[0], 'noun': v[4], 'per': v[5], 'dataset': v[1]} for k, v in POLYGONS.items()})
    out['park_ha'] = {'label': 'Park space (hectares)', 'noun': 'hectares of park', 'per': 'residents', 'dataset': 'kami-qbfh'}
    out['local_park_ha'] = {'label': 'Neighbourhood park space (hectares)', 'noun': 'hectares of neighbourhood park',
                            'per': 'residents', 'dataset': 'kami-qbfh'}
    out['trees'] = {'label': 'Public trees', 'noun': 'public trees', 'per': 'residents', 'dataset': TREES}
    return out


def load(cache_dir, force=False):
    """Every community's assets, kept for a week (force: count again now)."""
    path = os.path.join(cache_dir, 'assets_by_community.json')
    if not force and os.path.exists(path) and time.time() - os.path.getmtime(path) < KEEP_DAYS * 86400:
        try:
            with open(path, encoding='utf-8') as f:
                kept = json.load(f)
            # counted before OpenStreetMap was added, or OpenStreetMap could not be reached a day ago: count again
            # (version 2 keeps residents-only "private" ones apart; an older copy mixed them in: count again)
            if (kept.get('other') or {}).get('version') == 2 or (
                    'other' in kept and not kept['other'] and time.time() - os.path.getmtime(path) < 86400):
                return kept
        except (OSError, ValueError):
            pass
    old = None
    if os.path.exists(path):
        try:
            with open(path, encoding='utf-8') as f:
                old = json.load(f)
        except (OSError, ValueError):
            old = None
    try:
        data = build()
    except Exception:
        if old:
            return old
        raise
    if not data.get('other') and old and (old.get('other') or {}).get('version') == 2:   # OpenStreetMap busy: keep last week's count
        data['other'] = dict(old['other'], kept_from=old['other'].get('counted'))
    data['counted'] = time.strftime('%Y-%m-%d')
    data['counted_utc'] = time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime())
    os.makedirs(cache_dir, exist_ok=True)
    tmp = path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f)
    os.replace(tmp, path)
    return data
