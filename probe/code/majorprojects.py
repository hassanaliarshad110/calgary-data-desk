"""Major projects in every ward: the Government of Alberta's Major Projects inventory (majorprojects.alberta.ca), read
every week, placed in each community and ward by its own map point, plus the City facilities checked by hand that the
inventory does not list (data/civic_projects.json).

The inventory lists every project in Alberta worth $5 million or more that is proposed, under construction or recently
completed, with its sector, type, cost, schedule, developer and map point. Projects completed are left out. A line
project (a road, an LRT line) is listed in every ward its line passes through.

Each project comes out in the shape the "Being built" list already uses (dashboard.city_projects): title, kind, owner,
amenity, status, budget, cost, completion, address, comm, lat, lon, url, match, sources, and the ward(s) it is in.
"""
import datetime as dt
import json
import os
import re
import time
import urllib.request

API = 'https://majorprojects.alberta.ca/api/MajorProjects?years=1'
PAGE = 'https://majorprojects.alberta.ca/details/{slug}/{id}'
COMMUNITIES = 'surr-xmvs'
SITE = 'https://calgaryinsight.ca/'
KEEP_DAYS = 7
VERSION = 1
HERE = os.path.dirname(os.path.abspath(__file__))
CIVIC_FILE = os.path.join(HERE, 'data', 'civic_projects.json')
UA = {'User-Agent': 'Mozilla/5.0 (CalgaryInsight civic data)', 'Accept': 'application/json'}

# which projects are amenities residents use (the rest: housing, offices, shops, industry, utilities)
AMENITY = {('Institutional', 'School'), ('Institutional', 'Library'), ('Institutional', 'Health Care'),
           ('Institutional', 'Emergency Services'), ('Institutional', 'Continuing Care'), ('Institutional', 'Post-Secondary'),
           ('Tourism / Recreation', 'Sports Facility'), ('Tourism / Recreation', 'Park'),
           ('Tourism / Recreation', 'Community Centre'), ('Tourism / Recreation', 'Arts and Culture'),
           ('Infrastructure', 'Transit')}
KIND = {'School': 'School project', 'Library': 'Library', 'Health Care': 'Health care project',
        'Emergency Services': 'Emergency services project', 'Continuing Care': 'Continuing care project',
        'Post-Secondary': 'Post-secondary project', 'Sports Facility': 'Recreation facility', 'Park': 'Park project',
        'Community Centre': 'Community centre', 'Arts and Culture': 'Arts and culture project', 'Transit': 'Transit project',
        'Roadwork': 'Road project', 'Airport': 'Airport project', 'Water/Wastewater': 'Water and wastewater project'}
# what each one adds to Growth vs amenities (the six amenities measured there), from its type and name
MEASURED = [('library', re.compile(r'\blibrary\b', re.I)),
            ('rec_centre', re.compile(r'fieldhouse|leisure centre|aquatic|ymca|recreation centre|sport centre|athletic complex', re.I)),
            ('community_centre', re.compile(r'community (centre|association)', re.I))]


def _get(url, timeout=180):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        return json.loads(r.read().decode('utf-8'))


def _points(geom):
    """Every vertex (lon, lat) of a project's geometry; a point project has one."""
    out = []

    def walk(g):
        if not isinstance(g, dict):
            return
        t, c = g.get('type'), g.get('coordinates')
        if t == 'GeometryCollection':
            for x in g.get('geometries') or []:
                walk(x)
        elif t == 'Point' and c:
            out.append((c[0], c[1]))
        elif t in ('LineString', 'MultiPoint') and c:
            out.extend((p[0], p[1]) for p in c)
        elif t == 'MultiLineString' and c:
            out.extend((p[0], p[1]) for line in c for p in line)
    walk(geom)
    return out


def _in_ring(x, y, ring):
    inside, j = False, len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def _community(lon, lat, comms):
    for c in comms:
        x0, y0, x1, y1 = c['bbox']
        if not (x0 <= lon <= x1 and y0 <= lat <= y1):
            continue
        for poly in c['mp']:
            if poly and _in_ring(lon, lat, poly[0]) and not any(_in_ring(lon, lat, h) for h in poly[1:]):
                return c['code']
    return None


def fetch():
    import calgary_data as cd                           # noqa: PLC0415
    feats = _get(API, 300)
    rows = cd.query(COMMUNITIES, select='comm_code,name,class,multipolygon', limit=1000)
    comms = []
    for r in rows:
        g = r.get('multipolygon') or {}
        mp = g.get('coordinates') if g.get('type') == 'MultiPolygon' else [g.get('coordinates')] if g.get('type') == 'Polygon' else None
        if not mp or not r.get('comm_code'):
            continue
        xs = [p[0] for poly in mp for p in poly[0]]
        ys = [p[1] for poly in mp for p in poly[0]]
        comms.append({'code': r['comm_code'], 'name': (r.get('name') or '').strip(), 'res': r.get('class') == 'Residential',
                      'mp': mp, 'bbox': (min(xs), min(ys), max(xs), max(ys)),
                      'centre': (sum(xs) / len(xs), sum(ys) / len(ys))})
    # a project whose name gives its community ("New K-5 School in Kincora-Sage Hill") but whose map point is elsewhere
    # (the inventory sometimes places a proposed project at a stand-in point) is placed in the community it names
    named = sorted(((re.compile(r'(\bin (the )?' + re.escape(c['name']) + r'\b|\b' + re.escape(c['name']) + r' (high |middle )?school\b)', re.I), c)
                    for c in comms if c['res'] and len(c['name']) >= 5),
                   key=lambda x: -len(x[1]['name']))
    out = []
    for f in feats:
        p = f.get('properties') or {}
        if 'Calgary' not in (p.get('municipalities') or []) or (p.get('stage') or '').lower().startswith('complete'):
            continue
        pts = _points(f.get('geometry'))
        in_comms = []
        for lon, lat in pts:
            c = _community(lon, lat, comms)
            if c and c not in in_comms:
                in_comms.append(c)
        lon, lat = pts[0] if pts else (None, None)
        placed = 'map point'
        if len(pts) <= 1 and p.get('sector') in ('Institutional', 'Tourism / Recreation'):
            hits = [c for rx, c in named if rx.search(p.get('name') or '')]
            if hits and not any(h['code'] in in_comms for h in hits):
                in_comms, (lon, lat), placed = [hits[0]['code']], hits[0]['centre'], 'community named in the project'
        out.append({'placed': placed, 'id': p.get('id'), 'name': (p.get('name') or '').strip(), 'slug': p.get('friendlyName'),
                    'sector': p.get('sector'), 'type': p.get('type'), 'stage': p.get('stage'), 'status': p.get('status'),
                    'start': p.get('schedule'), 'end': p.get('scheduleEnd'), 'cost_m': p.get('cost'),
                    'developer': p.get('developer'), 'contractor': p.get('contractor'), 'website': p.get('website'),
                    'reviewed': (p.get('ReviewDate') or '')[:10], 'line': len(pts) > 1,
                    'lon': lon, 'lat': lat, 'comms': in_comms, 'municipalities': p.get('municipalities')})
    return {'version': VERSION, 'read_at': dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'source': 'https://majorprojects.alberta.ca/', 'projects': out}


def load(cache_dir, force=False):
    """This week's copy; else read again; else the copy the website published; else last week's."""
    path = os.path.join(cache_dir or '.', 'majorprojects', 'raw.json')
    if os.path.exists(path) and not force and time.time() - os.path.getmtime(path) < KEEP_DAYS * 86400:
        with open(path, encoding='utf-8') as f:
            kept = json.load(f)
        if kept.get('version') == VERSION:
            return kept
    raw = None
    try:
        raw = fetch()
    except Exception:                                   # noqa: BLE001
        try:
            with urllib.request.urlopen(SITE + 'data/majorprojects.json', timeout=60) as r:
                raw = json.loads(r.read().decode('utf-8'))
        except Exception:                               # noqa: BLE001
            raw = None
    if raw and raw.get('projects'):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path + '.tmp', 'w', encoding='utf-8') as f:
            json.dump(raw, f, separators=(',', ':'))
        os.replace(path + '.tmp', path)
        return raw
    if os.path.exists(path):
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    return None


def civic():
    """City facilities checked by hand that the provincial inventory does not list (fire stations, libraries, parks)."""
    try:
        with open(CIVIC_FILE, encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return {'projects': []}


def measured(title, kind=''):
    """Which of Growth vs amenities' six amenities a project adds (a fieldhouse and library adds two), if any."""
    return [key for key, rx in MEASURED if rx.search(title or '') or rx.search(kind or '')]


def _status(p):
    when = ' to '.join(x for x in (p.get('start'), p.get('end')) if x)
    return f"{p.get('stage') or 'Stage not given'}{(' (' + when + ')') if when else ''}"


def as_project(p):
    """One inventory row in the shape of the "Being built" list."""
    t = p.get('type') or ''
    title = re.sub(r'\s*\(Calgary\)\s*$', '', p['name'])
    url = PAGE.format(slug=p.get('slug') or 'project', id=p.get('id'))
    cost = p.get('cost_m')
    return {'title': title, 'kind': KIND.get(t, t or (p.get('sector') or 'Project')), 'owner': p.get('developer') or '',
            'amenity': (p.get('sector'), t) in AMENITY, 'measured': measured(title, t),
            'status': _status(p) if not re.search(r'proposed', p.get('stage') or '', re.I) else 'Proposed' + (
                f" ({' to '.join(x for x in (p.get('start'), p.get('end')) if x)})" if (p.get('start') or p.get('end')) else ''),
            'budget': f'${cost:,.1f} million (estimate)'.replace('.0 million', ' million') if cost else 'Not published',
            'cost': round(cost * 1e6) if cost else None,
            'completion': f"Expected {p['end']}" if p.get('end') else 'Not yet scheduled',
            'expected_by': f"{p['end']}-12" if p.get('end') and str(p['end']).isdigit() else None,
            'address': '', 'comm': (p.get('comms') or [None])[0], 'comms': p.get('comms') or [],
            'lat': p.get('lat'), 'lon': p.get('lon'), 'url': url, 'sources': [url] + ([p['website']] if p.get('website') else []),
            'match': [title[:40]], 'source': 'Alberta Major Projects', 'reviewed': p.get('reviewed'),
            'line': p.get('line')}


def _words(s):
    return {w for w in re.findall(r'[a-z0-9]+', (s or '').lower()) if len(w) > 2 and w not in
            {'new', 'the', 'and', 'calgary', 'school', 'project', 'phase', 'centre', 'center', 'for'}}


def same(a, b):
    """The same project listed twice (by hand and in the inventory): most of the words of the shorter name match."""
    wa, wb = _words(a.get('title')), _words(b.get('title'))
    if not wa or not wb:
        return False
    return len(wa & wb) / min(len(wa), len(wb)) >= 0.75


def for_wards(raw, ward_of, hand_by_ward=None):
    """{ward: [projects]} for every ward, and '0' for all of Calgary: hand-checked lists first, then the City facilities
    checked by hand, then the inventory, without listing one project twice."""
    out = {}
    hand_by_ward = hand_by_ward or {}
    civ = civic().get('projects') or []
    inv = [as_project(p) for p in (raw or {}).get('projects') or []]
    every = []
    for src in (civ, inv):
        for p in src:
            if any(same(p, q) for q in every):
                continue
            every.append(p)
    wards = sorted({int(w) for w in ward_of.values() if w})
    for w in wards:
        lst = list(hand_by_ward.get(w) or [])
        for p in every:
            comms = p.get('comms') or ([p['comm']] if p.get('comm') else [])
            if any(ward_of.get(c) == w for c in comms) and not any(same(p, q) for q in lst):
                lst.append({**p, 'in_ward': True})
        out[w] = lst
    allp = []
    for w in wards:
        for p in out[w]:
            if not any(same(p, q) for q in allp):
                allp.append(p)
    out[0] = allp
    return out
