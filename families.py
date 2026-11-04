"""Families and schools in a ward: licensed child care and school enrolment (Government of Alberta), placed on
the map with the City's Parcel Address and Schools data.

Child care spaces are licensed capacity of programs whose address is inside the ward. Family day home agencies
are listed but not counted: their capacity covers homes anywhere in the city and the file gives only the office.
Children are the 2021 Census counts by community, grown in line with each community's live model population.
"""
import datetime as dt
import json
import re
import os

import alberta
import calgary_data as cd
import geo

PARCEL_ADDRESS = '9zvu-p8uz'
SCHOOLS = 'fd9t-tdn2'
WARD_POSTAL = ('T3J', 'T3N', 'T1Y', 'T2E')       # postal areas that reach into Ward 5 (kept for reference; every ward is placed by the map)
NOT_COUNTED = 'Family day home agency'


# Streets that carry a Ward 5 community's name lie only in that community
STREET_COMMUNITY = {'CITYSCAPE': 'CSC', 'HOMESTEAD': 'HSD', 'REDSTONE': 'RSN', 'CORNERSTONE': 'CNS', 'SKYVIEW': 'SKR'}


def street_communities(names):
    """In newer communities, streets are named after the community (Cityscape Drive, Redstone Park). For a
    ward's communities {code: name}, the one-word names long enough to be distinctive."""
    out = {}
    for code, name in (names or {}).items():
        words = (name or '').upper().split()
        if len(words) == 1 and len(words[0]) >= 6 and words[0].isalpha():
            out[words[0]] = code
    return out


def _geocode(keys, cache_file):
    """address key 'house|name|quad' -> (lat, lon) or None, using the City's Parcel Address points."""
    try:
        cache = json.load(open(cache_file, encoding='utf-8'))
    except (OSError, ValueError):
        cache = {}
    todo = [k for k in keys if k not in cache]
    for i in range(0, len(todo), 40):
        batch = todo[i:i + 40]
        q = lambda v: "'" + str(v).replace("'", "''") + "'"
        conds = []
        for k in batch:
            house, name, quad = k.split('|')
            c = f"house_number={q(house)} AND street_name={q(name)}"
            conds.append('(' + c + (f" AND street_quad={q(quad)}" if quad else '') + ')')
        try:
            rows = cd.query(PARCEL_ADDRESS, select='house_number,street_name,street_quad,latitude,longitude',
                            where=' OR '.join(conds), limit=5000)
        except cd.DataError:                      # one odd address must not lose the whole batch: ask one at a time
            rows = []
            for c in conds:
                try:
                    rows += cd.query(PARCEL_ADDRESS, select='house_number,street_name,street_quad,latitude,longitude',
                                     where=c, limit=50)
                except cd.DataError:
                    pass
        found = {}
        for r in rows:
            if not r.get('latitude'):
                continue
            for k in batch:
                house, name, quad = k.split('|')
                if r.get('house_number') == house and (r.get('street_name') or '').upper() == name and \
                        (not quad or r.get('street_quad') == quad):
                    found.setdefault(k, []).append((float(r['latitude']), float(r['longitude'])))
        for k in batch:
            pts = found.get(k)
            cache[k] = [round(sum(p[0] for p in pts) / len(pts), 6), round(sum(p[1] for p in pts) / len(pts), 6)] if pts else None
    try:
        os.makedirs(os.path.dirname(cache_file), exist_ok=True)
        json.dump(cache, open(cache_file, 'w', encoding='utf-8'))
    except OSError:
        pass
    return cache


def _near(misses, cache_file):
    """For addresses the City has no exact point for, the nearest house number on the same street (within 150).
    misses: {key: street type or None}. Returns {key: [lat, lon] or None}."""
    try:
        cache = json.load(open(cache_file, encoding='utf-8'))
    except (OSError, ValueError):
        cache = {}
    todo = {k: t for k, t in misses.items() if k not in cache and k.split('|')[-1] in ('NE', 'NW', 'SE', 'SW')}
    if todo:
        streets = sorted({(k.split('|')[1], t, k.split('|')[2]) for k, t in todo.items()})
        rows = []
        for i in range(0, len(streets), 30):              # keep each request a sensible length
            conds = []
            for name, t, quad in streets[i:i + 30]:
                c = f"street_name='{name.replace(chr(39), chr(39) * 2)}' AND street_quad='{quad}'"
                if t:
                    c += f" AND street_type='{t.replace(chr(39), chr(39) * 2)}'"
                conds.append('(' + c + ')')
            try:
                rows += cd.query(PARCEL_ADDRESS,
                                 select='street_name,street_type,street_quad,house_number,avg(latitude) as lat,avg(longitude) as lon',
                                 where=' OR '.join(conds), group='street_name,street_type,street_quad,house_number', limit=50000)
            except cd.DataError:                  # leave this batch unplaced rather than lose every program
                pass
        for k, t in todo.items():
            house, name, quad = k.split('|')
            try:
                h = int(re.match(r'\d+', house).group())
            except (AttributeError, ValueError):
                cache[k] = None
                continue
            numbered = name.isdigit()
            best = None
            for r in rows:
                if (r.get('street_name') or '').upper() != name or not r.get('lat') or r.get('street_quad') != quad:
                    continue
                if t and r.get('street_type') != t:
                    continue
                if numbered and not t:
                    continue
                m = re.match(r'\d+', r.get('house_number') or '')
                if not m:
                    continue
                d = abs(int(m.group()) - h)
                if d <= 150 and (best is None or d < best[0]):
                    best = (d, float(r['lat']), float(r['lon']))
            cache[k] = [round(best[1], 6), round(best[2], 6)] if best else None
        try:
            json.dump(cache, open(cache_file, 'w', encoding='utf-8'))
        except OSError:
            pass
    return {k: cache.get(k) for k in misses}


_SHAPES = {}


def _where(lat, lon, ward_shape, comm_shapes):
    """(inside the ward?, community code or None). Outlines are indexed once per build for speed."""
    held = _SHAPES.get('src')                    # the outlines themselves are kept, so a later build can't match by mistake
    if not held or held[0] is not ward_shape or held[1] is not comm_shapes:
        _SHAPES['src'] = (ward_shape, comm_shapes)
        _SHAPES['idx'] = (geo.Shape(ward_shape), geo.Locator(comm_shapes))
    ws, loc = _SHAPES['idx']
    if not ws.contains(lon, lat):
        return False, None
    return True, loc.find(lon, lat)


def child_care(cache_dir, ward_shape, comm_shapes, children, as_of, ward=5, names=None):
    quarters = alberta.child_care_quarters(os.path.join(cache_dir, 'alberta'))
    if not quarters:
        raise alberta.AlbertaError('No child care files could be read.')
    # every Calgary program is placed on the map once (the City's address points), then kept: the map decides the ward
    near = {}
    for _, _, q in quarters:
        for p in q['programs']:
            if p.get('postal'):
                k = alberta.address_key(p['address'])
                if k and not near.get(k):
                    near[k] = alberta.street_type(p['address'])
    points = _geocode(sorted(near), os.path.join(cache_dir, 'alberta', 'addresses.json'))
    misses = {k: near[k] for k in near if not points.get(k)}
    if misses:
        try:
            for k, pt in _near(misses, os.path.join(cache_dir, 'alberta', 'addresses_near.json')).items():
                if pt:
                    points[k] = pt
        except Exception:      # the nearest-number lookup is a bonus; exact matches still stand
            pass
    place = {}
    for k, pt in points.items():
        if pt:
            inside, comm = _where(pt[0], pt[1], ward_shape, comm_shapes)
            place[k] = (inside, comm, pt)

    streets = street_communities(names) if names is not None else STREET_COMMUNITY
    # the ward's postal areas: those where most of the programs placed on the map are inside the ward
    tally = {}
    for _, _, q in quarters:
        for p in q['programs']:
            hit = place.get(alberta.address_key(p['address']) or '')
            if hit:
                t = tally.setdefault(p['postal'][:3], [0, 0])
                t[0] += hit[0]
                t[1] += 1
    ward_fsa = {f for f, (i, n) in tally.items() if n and i / n > 0.5}

    def in_ward(p):
        k = alberta.address_key(p['address']) or ''
        hit = place.get(k)
        if hit:
            return hit if hit[0] else None
        # a new address the City's list doesn't have yet: streets named after one of the ward's newer communities
        # are only in it (Cityscape Drive is in Cityscape)
        name = k.split('|')[1] if k.count('|') == 2 else ''
        for prefix, code in streets.items():
            if name.startswith(prefix) and p['postal'][:3] in ward_fsa:
                return (True, code, None)
        return None

    trend = []
    for label, ym, q in quarters:
        progs = [(p, in_ward(p)) for p in q['programs']]
        progs = [(p, h) for p, h in progs if h]
        counted = [p for p, _ in progs if alberta.kind(p) != NOT_COUNTED]
        by = lambda k: sum(p['capacity'] for p in counted if alberta.kind(p) == k)
        trend.append({'quarter': label, 'ym': ym, 'programs': len(counted), 'spaces': sum(p['capacity'] for p in counted),
                      'daycare': by('Daycare'), 'osc': by('Out-of-school care'), 'preschool': by('Preschool'),
                      'other': sum(p['capacity'] for p in counted if alberta.kind(p) not in ('Daycare', 'Out-of-school care', 'Preschool'))})

    # programs in the latest quarter, with their inspection record over the 12 months before it
    label, ym, q = quarters[-1]
    end = dt.date(int(ym[:4]), int(ym[5:]), 1)
    # the file covers inspections to the end of its month, so 12 months = from the 1st of the following month a year back
    nxt = dt.date(end.year + (end.month == 12), end.month % 12 + 1, 1)
    since = nxt.replace(year=nxt.year - 1).isoformat()
    insp = {}
    for i in q['inspections']:
        insp.setdefault(i['id'], []).append(i)
    first_seen = {}
    for lab, _, qq in quarters:
        for p in qq['programs']:
            first_seen.setdefault(p['id'], lab)
    programs = []
    for p in q['programs']:
        h = in_ward(p)
        if not h:
            continue
        rec = sorted(insp.get(p['id'], []), key=lambda x: x['date'])
        recent = [r for r in rec if r['date'] >= since]
        visits = sorted({r['date'] for r in recent})
        actions = [r for r in recent if r['action']]
        programs.append({
            'id': p['id'], 'name': p['name'].title(), 'kind': alberta.kind(p), 'type': p['type'].title(),
            'capacity': p['capacity'], 'counted': alberta.kind(p) != NOT_COUNTED,
            'address': p['address'], 'postal': p['postal'], 'phone': p['phone'], 'comm': h[1],
            'lat': h[2][0] if h[2] else None, 'lon': h[2][1] if h[2] else None, 'since': first_seen.get(p['id']),
            'daycare': p['daycare'], 'osc': p['osc'], 'preschool': p['preschool'],
            'visits_12m': len(visits), 'last_visit': rec[-1]['date'] if rec else None,
            'noncompliance_12m': sum(1 for r in recent if r['noncompliance']),
            'actions_12m': len(actions), 'last_action': actions[-1]['action'].title() if actions else None,
            'record': [{'date': r['date'], 'reason': r['reason'].title(), 'finding': r['noncompliance'],
                        'action': r['action'].title(), 'remedy': '' if r['remedy'].upper() == 'NULL' else r['remedy']}
                       for r in rec[-25:]],
        })
    # programs in the ward's postal areas that couldn't be placed on the map at all
    unlocated = sum(1 for p in q['programs'] if p['postal'][:3] in ward_fsa and not in_ward(p)
                    and not place.get(alberta.address_key(p['address']) or ''))

    # spaces and children by community
    by_comm = {}
    for p in programs:
        if p['counted'] and p['comm']:
            b = by_comm.setdefault(p['comm'], {'spaces': 0, 'daycare': 0, 'programs': 0})
            b['spaces'] += p['capacity']
            b['programs'] += 1
            if p['kind'] in ('Daycare', 'Preschool'):
                b['daycare'] += p['capacity']
    for code, kids in children.items():
        b = by_comm.setdefault(code, {'spaces': 0, 'daycare': 0, 'programs': 0})
        b.update(kids)
        b['per_100_0_14'] = round(b['spaces'] / kids['k0_14'] * 100, 1) if kids.get('k0_14') else None
        b['daycare_per_100_0_4'] = round(b['daycare'] / kids['k0_4'] * 100, 1) if kids.get('k0_4') else None
    total_k014 = sum(v.get('k0_14') or 0 for v in children.values())
    total_k04 = sum(v.get('k0_4') or 0 for v in children.values())
    latest = trend[-1]
    first = trend[0]
    return {
        'as_of': label, 'quarters': trend, 'programs': sorted(programs, key=lambda x: -x['capacity']),
        'by_comm': by_comm, 'unlocated': unlocated,
        'spaces': latest['spaces'], 'programs_counted': latest['programs'],
        'spaces_first': first['spaces'], 'first_quarter': first['quarter'],
        'children_0_14': round(total_k014), 'children_0_4': round(total_k04),
        'children_0_14_2021': round(sum(v.get('k0_14_2021') or 0 for v in children.values())),
        'children_0_4_2021': round(sum(v.get('k0_4_2021') or 0 for v in children.values())),
        'per_100_0_14': round(latest['spaces'] / total_k014 * 100, 1) if total_k014 else None,
        'daycare_per_100_0_4': round((latest['daycare'] + latest['preschool']) / total_k04 * 100, 1) if total_k04 else None,
        'page': alberta.CHILD_CARE_PAGE,
        'note': (f"Licensed spaces: how many children each licensed program may care for at once, for programs whose "
                 f"address is in Ward {ward} (Government of Alberta, Child Care Information). Family day home agencies are "
                 "listed but not counted, because the day homes they oversee are spread across the city."),
        'children_note': ("Children are estimated, not counted: each community's 2021 Census children, plus children "
                          "for the residents added since 2021 at the share seen in Calgary's newest communities in 2021 "
                          "(Cityscape and Cornerstone), where new homes filled mostly with young families. No public count "
                          "of children by community exists after 2021."),
    }


def schools(cache_dir, ward_shape, comm_shapes, ward=5):
    years = alberta.enrolment_years(os.path.join(cache_dir, 'alberta'))
    if not years:
        raise alberta.AlbertaError('No enrolment files could be read.')
    x0, y0, x1, y1 = cd.bbox(ward_shape)
    rows = cd.query(SCHOOLS, select='name,board,grades,elem,junior_h,senior_h,postsecond,address_ab,point',
                    where=f"within_box(point, {y1}, {x0}, {y0}, {x1})", limit=2000)
    latest_year, latest = years[-1]
    by_light = {}
    light = lambda s: ' '.join(w for w in alberta.norm_name(s).split())
    for code, s in latest.items():
        by_light.setdefault(light(s['name']), []).append(code)
    out = []
    for r in rows:
        if (r.get('postsecond') or '').upper() == 'Y' or not r.get('point'):
            continue
        lon, lat = r['point']['coordinates'][:2]
        inside, comm = _where(lat, lon, ward_shape, comm_shapes)
        if not inside:
            continue
        cands = by_light.get(light(r.get('name')), [])
        if len(cands) > 1:            # same name elsewhere in Alberta: keep the one run by the same school board
            board = alberta.norm_name(r.get('board'))
            same = [c for c in cands if alberta.norm_name(latest[c]['authority']) == board or
                    'CALGARY' in latest[c]['authority'].upper()]
            cands = same or cands
        code = cands[0] if len(cands) == 1 else None
        enrol = {}
        if code:
            for y, d in years:
                if code in d and d[code]['total']:
                    enrol[y] = d[code]['total']
        ys = sorted(enrol)
        five = f'{int(latest_year[:4]) - 5}/{int(latest_year[:4]) - 4}'
        base = enrol.get(five) if five in enrol else (enrol[ys[0]] if ys else None)
        base_year = five if five in enrol else (ys[0] if ys else None)
        now = enrol.get(latest_year)
        grades = latest[code]['grades'] if code and code in latest else {}
        span = [g for g, n in grades.items() if n]
        level = []
        if any(grades.get(g) for g in alberta.GRADES[:7]):
            level.append('elementary')
        if any(grades.get(g) for g in alberta.GRADES[7:10]):
            level.append('junior')
        if any(grades.get(g) for g in alberta.GRADES[10:]):
            level.append('high')
        out.append({
            'level': level,
            'name': r.get('name'), 'board': r.get('board'), 'address': r.get('address_ab'), 'comm': comm,
            'lat': round(lat, 6), 'lon': round(lon, 6), 'code': code, 'enrolment': enrol, 'latest': now,
            'base_year': base_year if base_year != latest_year else None, 'base': base if base_year != latest_year else None,
            'change_pct': round((now - base) / base * 100, 1) if now and base and base >= 50 and base_year != latest_year else None,
            'grades': (f'{span[0]} to {span[-1]}' if len(span) > 1 else span[0]) if span else (r.get('grades') or ''),
            'matched': bool(code),
        })
    out.sort(key=lambda s: -(s['latest'] or 0))
    matched = [s for s in out if s['latest']]
    totals = []
    k9 = alberta.GRADES[:10]                       # kindergarten (ECS) to Grade 9: roughly ages 5 to 14
    for y, d in years:
        codes = [s['code'] for s in matched]
        band = lambda c, gs: sum((d[c]['grades'].get(g) or 0) for g in gs) if c in d else 0
        totals.append({'year': y, 'students': sum(d[c]['total'] for c in codes if c in d),
                       'k_to_9': sum(band(c, k9) for c in codes), 'g10_12': sum(band(c, alberta.GRADES[10:]) for c in codes)})
    return {
        'latest_year': latest_year, 'years': [y for y, _ in years], 'schools': out, 'totals': totals,
        'students': sum(s['latest'] for s in matched), 'unmatched': [s['name'] for s in out if not s['matched']],
        'page': alberta.ENROLMENT_PAGE,
        'note': (f"Students enrolled in each school inside Ward {ward} (Government of Alberta, Student enrolment by school, "
                 "authority and grade level). Schools are placed with the City's Schools map. Totals over years count "
                 "the same schools in every year."),
    }


def build(cache_dir, ward_shape, comm_shapes, children, as_of, ward=5, names=None):
    out, errors = {}, []
    try:
        out['child_care'] = child_care(cache_dir, ward_shape, comm_shapes, children, as_of, ward, names)
    except (alberta.AlbertaError, cd.DataError, OSError, ValueError, KeyError) as e:
        errors.append(f'Child care: {e}')
    try:
        out['schools'] = schools(cache_dir, ward_shape, comm_shapes, ward)
    except (alberta.AlbertaError, cd.DataError, OSError, ValueError, KeyError) as e:
        errors.append(f'Schools: {e}')
    out['errors'] = errors
    return out


def city_school_totals(cache_dir, keep_days=7):
    """Students enrolled in every school inside Calgary, year by year (the same schools in every year): Calgary's side
    of the growth checks. Counted once a week."""
    path = os.path.join(cache_dir, 'school_totals_city.json')
    try:
        import time
        if os.path.exists(path) and time.time() - os.path.getmtime(path) < keep_days * 86400:
            with open(path, encoding='utf-8') as f:
                return json.load(f)
    except (OSError, ValueError):
        pass
    years = alberta.enrolment_years(os.path.join(cache_dir, 'alberta'))
    if not years:
        raise alberta.AlbertaError('No enrolment files could be read.')
    comms = cd.query('surr-xmvs', select='comm_code,multipolygon', limit=5000)
    loc = geo.Locator({c['comm_code']: c['multipolygon'] for c in comms if c.get('comm_code') and c.get('multipolygon')})
    rows = cd.query(SCHOOLS, select='name,board,postsecond,point', limit=5000)
    latest_year, latest = years[-1]
    by_light = {}
    light = lambda s: ' '.join(w for w in alberta.norm_name(s).split())
    for code, s in latest.items():
        by_light.setdefault(light(s['name']), []).append(code)
    codes = set()
    for r in rows:
        if (r.get('postsecond') or '').upper() == 'Y' or not r.get('point'):
            continue
        lon, lat = r['point']['coordinates'][:2]
        if loc.find(lon, lat) is None:
            continue
        cands = by_light.get(light(r.get('name')), [])
        if len(cands) > 1:
            board = alberta.norm_name(r.get('board'))
            cands = [c for c in cands if alberta.norm_name(latest[c]['authority']) == board or
                     'CALGARY' in latest[c]['authority'].upper()] or cands
        if len(cands) == 1:
            codes.add(cands[0])
    out = {'years': [{'year': y, 'students': sum(d[c]['total'] for c in codes if c in d)} for y, d in years],
           'schools': len(codes)}
    try:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(out, f)
    except OSError:
        pass
    return out
