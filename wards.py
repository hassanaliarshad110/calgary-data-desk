"""Calgary's 14 wards and the communities in each, worked out from the City's own outlines.

Each community belongs to the ward holding most of its area (Community District Boundaries against Ward
Boundaries, both City of Calgary open data). Residential communities have homes and residents; the others are
industrial and business areas, major parks and undeveloped land. The outlines change rarely (after a ward
boundary review or when a new community is named), so they are kept for a week and read again after that.
"""
import json
import os
import time

import calgary_data as cd
import geo

WARDS = 'tz8z-hyaz'
COMMUNITIES = 'surr-xmvs'
KEEP_DAYS = 7
WARD_NUMBERS = list(range(1, 15))


def _fetch():
    wards = cd.query(WARDS, select='ward_num,councillor,label,multipolygon', limit=50)
    comms = cd.query(COMMUNITIES, select='comm_code,name,class,sector,comm_structure,multipolygon', limit=5000)
    return wards, comms


def assign(wards, comms):
    """{community code: {'ward', 'share', 'name', 'class', 'sector', 'structure', 'residential'}} and ward details."""
    shapes = {int(float(w['ward_num'])): geo.Shape(w['multipolygon'], int(float(w['ward_num'])))
              for w in wards if w.get('multipolygon') and w.get('ward_num')}
    out = {}
    for c in comms:
        code = c.get('comm_code')
        if not code or not c.get('multipolygon'):
            continue
        shares = geo.area_shares(geo.Shape(c['multipolygon']), shapes)
        if not shares:                      # a sliver too thin for the sample grid: use its middle point
            lon, lat = geo.centre(c['multipolygon'])
            w = next((k for k, s in shapes.items() if s.contains(lon, lat)), None)
            shares = {w: 1.0} if w else {}
        if not shares:
            continue
        w, share = max(shares.items(), key=lambda kv: kv[1])
        out[code] = {'ward': w, 'share': round(share, 3), 'shares': {str(k): round(v, 3) for k, v in shares.items()},
                     'name': (c.get('name') or code).strip(), 'class': c.get('class') or '',
                     'sector': c.get('sector') or '', 'structure': c.get('comm_structure') or '',
                     'residential': (c.get('class') or '') == 'Residential'}
    details = {int(float(w['ward_num'])): {'councillor': w.get('councillor'), 'label': w.get('label')}
               for w in wards if w.get('ward_num')}
    return out, details


def load(cache_dir, force=False):
    """The community-to-ward table, kept for a week. Falls back to the last saved copy if the City can't be reached."""
    path = os.path.join(cache_dir, 'wards_communities.json')
    if not force and os.path.exists(path) and time.time() - os.path.getmtime(path) < KEEP_DAYS * 86400:
        try:
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        except (OSError, ValueError):
            pass
    try:
        wards, comms = _fetch()
        table, details = assign(wards, comms)
    except Exception:
        if os.path.exists(path):
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        raise
    data = {'built': time.strftime('%Y-%m-%d'), 'communities': table,
            'wards': {str(k): v for k, v in details.items()}}
    os.makedirs(cache_dir, exist_ok=True)
    tmp = path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f)
    os.replace(tmp, path)
    return data


def ward_codes(table, ward):
    """(residential codes, other codes) for one ward (or every community for ward 0), each sorted by name."""
    comms = table['communities']
    mine = sorted((c for c, v in comms.items() if int(ward) == CITY or v['ward'] == int(ward)), key=lambda c: comms[c]['name'])
    return [c for c in mine if comms[c]['residential']], [c for c in mine if not comms[c]['residential']]


CITY = 0          # "ward 0" is the whole city


def ward_ok(ward):
    """A ward number 1 to 14, or 0 for the whole city. Anything else gives Ward 5."""
    try:
        w = int(ward)
    except (TypeError, ValueError):
        return 5
    return w if w in WARD_NUMBERS or w == CITY else 5
