"""Amenities already planned for the growing communities, for the Forecast to 2030 (srg.py), worked out at each website
build (numpy and scipy, like access.py).

Two kinds, the same way for every community:
  1. Park land already set aside. In new communities (SRG class developing, future or complete), land the City's
     Land Use Bylaw zones as reserve - S-SPR (school, park and community reserve), S-R (recreation) and S-UN (urban
     nature: natural areas) - that is not yet in the City's Parks Sites inventory. That is park and school land the
     developer has dedicated but not yet handed to the City as a finished park (or a school site not yet built).
     A reserve polygon counts when most of it (the share of sample points inside it) is not already a City park.
  2. Facilities being built: a new library or indoor recreation centre from the major projects lists
     (majorprojects.py: the Alberta Major Projects inventory and the City facilities checked by hand) that is under
     construction or funded and due to open by the end of the forecast.
For each, the homes within reach at the same distances as Growth vs amenities (access.py) are found, so the 2030
crowding can be worked out with them.
"""
import json
import os
import re
import time

KEEP_DAYS = 7
VERSION = 1
RESERVE = 'qe6k-p9nh'
RESERVE_CODES = {'S-SPR': 'School, park and community reserve', 'S-R': 'Recreation', 'S-UN': 'Urban nature (natural area)'}
COMMUNITIES = 'surr-xmvs'
NEW_CLASSES = ('DEVELOPING', 'FUTURE', 'COMPLETE')
MIN_HA = 0.05
PARK_SHARE = 0.5
OLD_PLACE = re.compile(r'repair|upgrade|renovat|expansion|moderni[sz]|redevelop|replacement|addition|lifecycle', re.I)            # a reserve polygon is "not yet a park" when less than half of it is a City park


def _samples(mp_xy, n=4):
    """Points inside a polygon: its vertex mean and an n x n grid over its bounding box, kept when inside."""
    import access                                       # noqa: PLC0415
    ring = mp_xy[0][0]
    xs = [p[0] for p in ring]
    ys = [p[1] for p in ring]
    out = []
    vm = access.vertex_mean(ring)
    if access.point_in_multipolygon(vm[0], vm[1], mp_xy):
        out.append(vm)
    for i in range(n):
        for j in range(n):
            x = min(xs) + (i + .5) * (max(xs) - min(xs)) / n
            y = min(ys) + (j + .5) * (max(ys) - min(ys)) / n
            if access.point_in_multipolygon(x, y, mp_xy):
                out.append((x, y))
    return out or [vm]


def build(cache_dir, projects, last_year):
    """projects: every project in Calgary with 'measured', 'lat', 'lon', 'status', 'opens'/'expected_by', 'funded'."""
    import access                                       # noqa: PLC0415
    import calgary_data as cd                           # noqa: PLC0415
    np, _ = access._np()
    hp = os.path.join(cache_dir, 'access', 'homes.json')
    if not os.path.exists(hp):
        return None
    with open(hp, encoding='utf-8') as f:
        homes = json.load(f)['homes']
    xy = np.asarray([(h[3], h[4]) for h in homes], dtype=float).reshape(-1, 2)
    w = [h[5] for h in homes]
    comm = [h[1] or '' for h in homes]
    proj = access.Projection()

    def by_comm(ii):
        by = {}
        for i in ii:
            c = comm[i]
            if c:
                by[c] = by.get(c, 0.0) + float(w[i])
        return {c: round(u, 1) for c, u in by.items()}

    # communities and their SRG class
    crows = cd.query(COMMUNITIES, select='comm_code,srg,multipolygon', limit=1000)
    cpolys = []
    for r in crows:
        mp = access.as_multipolygon(r.get('multipolygon'))
        if mp and r.get('comm_code'):
            pxy = [[[proj.xy(p[0], p[1]) for p in ring] for ring in poly] for poly in mp]
            ring = [p for poly in pxy for p in poly[0]]
            cpolys.append((r['comm_code'], (r.get('srg') or '').upper(), pxy,
                           (min(p[0] for p in ring), min(p[1] for p in ring), max(p[0] for p in ring), max(p[1] for p in ring))))

    def community_of(x, y):
        for code, srg_, pxy, (x0, y0, x1, y1) in cpolys:
            if x0 <= x <= x1 and y0 <= y <= y1 and access.point_in_multipolygon(x, y, pxy):
                return code, srg_
        return None, None

    # City parks as they are today
    pk = access.KINDS['park']
    prow = cd.get_json(cd.soql_url(pk['dataset'], select=pk['field'], where=pk['where'], limit=50000), timeout=300)
    parks, pbox = [], []
    for r in prow:
        mp = access.as_multipolygon(r.get(pk['field']))
        if mp:
            pxy = [[[proj.xy(p[0], p[1]) for p in ring] for ring in poly] for poly in mp]
            ring = [p for poly in pxy for p in poly[0]]
            parks.append(pxy)
            pbox.append((min(p[0] for p in ring), min(p[1] for p in ring), max(p[0] for p in ring), max(p[1] for p in ring)))
    pbox = np.asarray(pbox, dtype=float).reshape(-1, 4)

    def in_park(x, y):
        m = np.where((pbox[:, 0] <= x) & (pbox[:, 2] >= x) & (pbox[:, 1] <= y) & (pbox[:, 3] >= y))[0]
        return any(access.point_in_multipolygon(x, y, parks[i]) for i in m)

    # reserve land not yet a City park, in new communities
    rrows = cd.query(RESERVE, select='lu_code,multipolygon', where="lu_code in('S-SPR','S-R','S-UN')", limit=50000)
    plan_parks, plan_polys = [], []
    for r in rrows:
        mp = access.as_multipolygon(r.get('multipolygon'))
        if not mp:
            continue
        pxy = [[[proj.xy(p[0], p[1]) for p in ring] for ring in poly] for poly in mp]
        ha = access.area_m2(pxy) / 10000.0
        if ha < MIN_HA:
            continue
        s = _samples(pxy)
        code, cls = community_of(*s[0])
        if cls not in NEW_CLASSES:
            continue
        share = sum(1 for x, y in s if in_park(x, y)) / len(s)
        if share >= PARK_SHARE:
            continue
        lon, lat = proj.lonlat(*s[0])
        plan_parks.append({'zone': r.get('lu_code'), 'comm': code, 'ha': round(ha, 2), 'park_share': round(share, 2),
                           'lat': round(lat, 6), 'lon': round(lon, 6)})
        plan_polys.append(pxy)
    catch = {'park': {}}
    for rr in access.KINDS['park']['thresholds_m']:
        near = access.homes_near_polygons(xy, plan_polys, rr) if plan_polys else []
        catch['park'][str(rr)] = [[p['ha'], by_comm(ii)] for p, ii in zip(plan_parks, near)]

    # facilities being built and due by the end of the forecast
    import majorprojects                                # noqa: PLC0415
    facs = []
    for p in projects or []:
        ks = p.get('measured')
        ks = [ks] if isinstance(ks, str) else (ks or majorprojects.measured(p.get('title'), p.get('kind')))
        if p.get('lat') is None or p.get('lon') is None:
            continue
        if p.get('amenity') is False or OLD_PLACE.search(p.get('title') or ''):
            continue                                    # housing named after a library; work on a facility already counted
        for k in ks:
            if k in ('library', 'rec_centre'):
                facs.append((k, p))
    out_f = []
    for k, p in facs:
        opens = p.get('opens')
        if opens is None and p.get('expected_by'):
            opens = int(str(p['expected_by'])[:4])
        if 'funded' in p:
            building = bool(p['funded'])
        else:
            st = p.get('status') or ''
            building = bool(re.search(r'under construction|construction (started|underway|began|is underway)', st, re.I)) \
                and not re.search(r'not (yet )?funded|pending funding', st, re.I)
        if not building or (opens is not None and opens > last_year) or p.get('state') == 'completed':
            continue
        out_f.append({'title': p['title'], 'kind': k, 'comm': p.get('comm'), 'opens': opens, 'status': p.get('status'),
                      'url': p.get('url'), 'lat': p['lat'], 'lon': p['lon']})
    facs = out_f
    for k in ('library', 'rec_centre'):
        pts = [proj.xy(f['lon'], f['lat']) for f in facs if f['kind'] == k]
        catch[k] = {}
        for rr in access.KINDS[k]['thresholds_m']:
            near = access.homes_near_points(xy, pts, rr) if pts else []
            catch[k][str(rr)] = [[1.0, by_comm(ii)] for ii in near]
    by = {}
    for p in plan_parks:
        e = by.setdefault(p['comm'], {'reserve_ha': 0.0, 'polygons': 0, 'by_zone': {}})
        e['reserve_ha'] = round(e['reserve_ha'] + p['ha'], 2)
        e['polygons'] += 1
        e['by_zone'][p['zone']] = round(e['by_zone'].get(p['zone'], 0.0) + p['ha'], 2)
    return {'version': VERSION, 'built_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'last_year': last_year,
            'zones': RESERVE_CODES, 'parks': plan_parks, 'parks_by_comm': by, 'facilities': facs, 'catch': catch,
            'rules': {'new_classes': NEW_CLASSES, 'park_share': PARK_SHARE, 'min_ha': MIN_HA}}


def load(cache_dir, projects, last_year, force=False):
    path = os.path.join(cache_dir or '.', 'srg', 'planned.json')
    if os.path.exists(path) and not force and time.time() - os.path.getmtime(path) < KEEP_DAYS * 86400:
        with open(path, encoding='utf-8') as f:
            kept = json.load(f)
        if kept.get('version') == VERSION:
            return kept
    try:
        out = build(cache_dir, projects, last_year)
    except Exception as e:                              # noqa: BLE001
        print('planned amenities not worked out:', repr(e))
        out = None
    if out:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path + '.tmp', 'w', encoding='utf-8') as f:
            json.dump(out, f, separators=(',', ':'))
        os.replace(path + '.tmp', path)
        return out
    if os.path.exists(path):
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    return None
