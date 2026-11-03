"""Ward 5 dashboard: live figures from City of Calgary Open Data.

Compares the last 12 complete months with the 12 months before. Every number comes from the City's API at
the moment the dashboard is refreshed.
"""
import datetime as dt
import json
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor

import calgary_data as cd
import population as popmodel
import families
import context
import police
import rents
import wards as wardmap
import profiles
import methods
import census as censusmod
import geo
import assets as assetmap

WARD = 5
SERVICE_REQUESTS = 'iahh-g8bj'
TRAFFIC = '35ra-9556'
PERMITS = 'c2es-76ed'
DISORDER = '4evm-wx9a'
WARDS = 'tz8z-hyaz'
COMMUNITIES = 'surr-xmvs'
MIN_RATE_RESIDENTS = 100      # communities with fewer residents get no rates per 1,000 (they are still counted in totals)
COMMUNITY_REGIONS = 'kxmf-bzkv'
DEV_PERMITS = '6933-unw5'
ROADWORK = 'sizs-hgef'
REC_FACILITIES = 'hxfu-6d96'
TRANSIT_STOPS = 'muzh-c9qc'
CITY_BOUNDARY = 'erra-cqp9'
PLAYGROUNDS = 'bdu9-amk8'
COMMUNITY_SERVICES = 'x34e-bcjz'
DEV_MAP_PAGE = 'https://www.calgary.ca/development/permits/permit-application-search/'
DATASET_PAGE = 'https://data.calgary.ca/d/'
# The 21 infrastructure service types of the 311 equity study (12 roads, 5 water and sewer, 4 parks)
INFRASTRUCTURE = [
    'Roads - Pothole Maintenance', 'Roads - Streetlight Maintenance', 'Roads - Traffic or Pedestrian Light Repair',
    'Roads - Sidewalk - Curb and Gutter Repair', 'Roads - Roadway Maintenance', 'Roads - Backlane Maintenance',
    'Roads - Debris on Street/Sidewalk/Boulevard', 'Roads - Signs - Missing - Damaged', 'Roads - Snow and Ice Control',
    'Roads - Dead Animal Pick-Up', 'Roads - Pathway Concerns', 'Roads - Pathway Snow and Ice Concerns',
    'WATS - Catch Basin Concerns', 'WATS - Sewage Back-up', 'WATS - Sewer Maintenance', 'WATS - Water Main Break or Leak',
    'WATS - Service and Main Valve Issues',
    'Parks - Tree Concern - GIS', 'Parks - Garbage - GIS', 'Parks - Maintenance - GIS', 'Parks - Infrastructure - GIS']

# Ward 5 communities (the ward holding most of each community's area). Residential ones have homes and residents;
# the others are business, industrial and undeveloped areas. Kept as a fallback and for tests: every ward's lists are
# worked out from the City's outlines at refresh (wards.py), and give exactly these for Ward 5.
RESIDENTIAL_CODES = ['CAS', 'CSC', 'CNS', 'FAL', 'HSD', 'MRT', 'RSN', 'SAD', 'SKR', 'TAR']
OTHER_AREAS = ['SRI', 'DBC', 'SGL', 'SKE', 'WES', 'PEG', 'CIA', 'ST2', 'ST3', 'ST4', '05D', '05E', '05F', '05G']
ALL_CODES = RESIDENTIAL_CODES + OTHER_AREAS
NEW_COMMUNITIES_2021 = ['CSC', 'CNS']    # Calgary's newest communities at the 2021 Census (both in Ward 5): their share of children is used for new homes in every ward
CAMERAS = 'k7p9-kppz'
CAMERA_PAGE = 'https://www.calgary.ca/roads/conditions/traffic-cameras.html'
# Service areas named by the first part of each 311 service name ("Roads - Pothole Maintenance" -> Roads)
AREA_NAMES = {'WRS': 'Waste and Recycling', 'WATS': 'Water', 'CT': 'Calgary Transit', 'CFD': 'Calgary Fire',
              'CT AC': 'Calgary Transit Access', 'After Hours Transit': 'Calgary Transit', 'AT': 'Property tax and assessment',
              'RSP': 'Subsidized programs and seniors', 'DBBS': 'Development and building', 'DBBS Concern': 'Development and building',
              'AS': 'Animal services', 'ACPL': 'Animal services', 'UEP': 'Odour inquiries', 'PSD': 'Road and lane projects',
              'PD': 'Road and lane projects'}
class PeriodError(ValueError):
    """A period the user chose that can't be used (the message says why)."""


DATA_VERSION = 13          # bump when the dashboard's data layout changes, so old saved copies are rebuilt
# The City of Calgary's total population on April 1 (Calgary and Region Economic Outlook 2026-2031, spring 2026,
# Table 4: 2021-2025 estimates, 2026 onward forecast). Used for city-wide crime rates, read at the middle of the
# crime period so Calgary and Ward 5 are counted at the same date.
CITY_POP_APRIL = {2021: 1_321_600, 2022: 1_347_800, 2023: 1_422_200, 2024: 1_509_800, 2025: 1_558_700,
                  2026: 1_583_200, 2027: 1_608_700, 2028: 1_634_800, 2029: 1_662_300, 2030: 1_689_400, 2031: 1_717_600}
# Children in the same table (Population by Cohort, April): (aged 0 to 4, aged 0 to 14 = 0-4 + 5-9 + 10-14)
CITY_KIDS_APRIL = {2021: (79_000, 238_300), 2022: (79_000, 241_000), 2023: (80_900, 250_000), 2024: (82_900, 261_700),
                   2025: (83_900, 267_300), 2026: (85_200, 270_400), 2027: (87_500, 273_300), 2028: (89_700, 275_900),
                   2029: (91_700, 278_700), 2030: (92_800, 281_100), 2031: (92_600, 283_200)}
CITY_POP_SOURCE = {
    'name': 'Calgary and Region Economic Outlook 2026-2031 (Spring 2026), Table 4 City of Calgary Population Projection, '
            'page 19: Total Population (as of April); 2021-2025 estimates, 2026 on forecast (completed January 2026)',
    'publisher': 'City of Calgary, Corporate Economics',
    'url': 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/corporate-economics/calgary-and-region-economic-outlook/Calgary-and-Region-Economic-Outlook-2026-Spring.pdf',
    'page': 'https://www.calgary.ca/cfod/finance/corporate-economics/economic-outlook-population-outlook.html',
    'how': 'The figure for a month is read on a straight line between the April figures before and after it '
           '(November 2026: 1,583,200 in April 2026 + 7/12 of the way to 1,608,700 in April 2027 = 1,598,075).'}


DEFAULT_POP_METHOD = 'city_pace'   # the City's own total (its population forecast) unless the office chooses otherwise
# How residents are counted. Every per-1,000 rate, the population figures and the children estimates follow it.
POP_METHODS = {
    'city_pace': {'label': "2021 Census grown to the City's total",
                  'short': "City's total",
                  'about': "All of Calgary adds up to the City's own population estimate and forecast for that month. "
                           "Communities built since 2021 keep their growth model count; every other community is its 2021 "
                           "Census count grown by one factor, the same for all, so each keeps its 2021 share. The factor "
                           "also brings in people the Census count of private homes leaves out (seniors' homes, residences, "
                           "shelters), so its growth since 2021 reads about 3 points higher than real growth."},
    'model': {'label': 'Growth model',
              'short': 'growth model',
              'about': "The 2021 Census for each community, grown with the homes on the City's current property "
                       "assessment roll (homes lived in x 2021 people per home). Follows the homes actually built."},
    'census2021': {'label': '2021 Census, no growth',
                   'short': '2021 Census',
                   'about': "Each community's 2021 Census count (May 2021), unchanged. This is how the City's own 311 "
                            "ward dashboard counts (it divides by 2021 Census households). Undercounts fast-growing "
                            "communities."},
}


DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
PROFILE_FILE = os.path.join(DATA_DIR, 'ward5_profile_2021.json')
PROFILES_FILE = os.path.join(DATA_DIR, 'ward_profiles_2021.json')


def ward_profile(ward=WARD, cache_dir=None, census=None):
    """The City's ward profile (2021 Census), kept with the app: who lives in the ward, against Calgary.
    Each item has the ward's figure in 'ward' (and in 'w5' for older screens) and Calgary's in 'cal'."""
    prof = None
    try:
        with open(PROFILES_FILE, encoding='utf-8') as f:
            prof = (json.load(f).get('wards') or {}).get(str(ward))
    except (OSError, ValueError):
        prof = None
    newer = int((census or {}).get('year') or 2021) > 2021     # a newer Census: the printed 2021 profiles are out of date
    if newer:
        prof = None
    if prof is None and int(ward) == WARD and not newer:
        try:
            with open(PROFILE_FILE, encoding='utf-8') as f:
                prof = json.load(f)
        except (OSError, ValueError):
            prof = None
    if prof is None and int(ward) != wardmap.CITY and cache_dir:
        try:                                     # every other ward: the 2021 Census by ward, from the City's open data
            prof = profiles.profile(profiles.load(cache_dir, census), int(ward))
        except Exception:                        # noqa: BLE001 - the profile is extra; the dashboard goes on without it
            prof = None
    if not prof:
        return None
    for g in prof.get('groups') or []:
        for it in g.get('items') or []:
            if 'ward' not in it and 'w5' in it:
                it['ward'] = it['w5']
            it.setdefault('w5', it.get('ward'))
    prof['ward'] = int(ward)
    return prof


PROJECTS_FILE = os.path.join(DATA_DIR, 'ward5_projects.json')
PROJECTS_ALL_FILE = os.path.join(DATA_DIR, 'ward_projects.json')


def city_projects(ward=WARD):
    """City projects being built in the ward that the open data lists of facilities don't have yet (checked by hand).
    A list per ward in data/ward_projects.json; Ward 5's original list in data/ward5_projects.json."""
    d = None
    try:
        with open(PROJECTS_ALL_FILE, encoding='utf-8') as f:
            all_ = json.load(f)
        d = (all_.get('wards') or {}).get(str(ward))
        if d is not None:
            d = {'projects': d, 'checked': all_.get('checked')}
    except (OSError, ValueError):
        d = None
    if d is None and int(ward) == WARD:
        try:
            with open(PROJECTS_FILE, encoding='utf-8') as f:
                d = json.load(f)
        except (OSError, ValueError):
            d = None
    if not d:
        return []
    return [{**p, 'type': p.get('kind', 'City project'), 'in_ward': True, 'checked': d.get('checked')}
            for p in d.get('projects') or []]


def _dist_m(lat1, lon1, lat2, lon2):
    """Distance in metres (good enough within a city)."""
    import math
    dy = (lat2 - lat1) * 111320
    dx = (lon2 - lon1) * 111320 * math.cos(math.radians((lat1 + lat2) / 2))
    return (dx * dx + dy * dy) ** 0.5


def project_states(projects, amenities, fam, ref):
    """Mark each project being built as completed once the City lists it as open (a recreation facility, library,
    community centre or school with a matching name, or within 400 m of the project's site), or as set by hand.
    A project past its expected date and not listed yet is flagged so the office can check it."""
    places = [(f.get('name') or '', f.get('lat'), f.get('lon'), 'City recreation facilities and community services')
              for f in (amenities or {}).get('facilities') or []]
    places += [(s.get('name') or '', s.get('lat'), s.get('lon'), 'schools list')
               for s in ((fam or {}).get('schools') or {}).get('schools') or []]
    month = ref.isoformat()[:7]
    for p in projects:
        if p.get('state') == 'completed':
            p['completed_note'] = f"Marked as open{(' in ' + p['opened']) if p.get('opened') else ''} (checked by hand)"
            continue
        words = [w.lower() for w in p.get('match') or []]
        hit = None
        for name, lat, lon, where in places:
            if words and any(w in name.lower() for w in words):
                hit = (name, where)
                break
            if (p.get('lat') is not None and lat is not None and lon is not None
                    and p.get('kind', '').lower().startswith(('city recreation', 'provincial school'))
                    and not re.search(r'design|planning|proposed', p.get('status') or '', re.I)
                    and name not in (p.get('known_nearby') or [])          # already there when the project was checked
                    and _dist_m(p['lat'], p['lon'], lat, lon) <= 400):
                hit = (name, where)
                break
        if hit:
            p['state'] = 'completed'
            p['completed_note'] = f'Now listed by the City as open: "{hit[0]}" ({hit[1]}, found at this refresh)'
        else:
            p['state'] = 'planned' if re.search(r'design|planning|proposed|approved', p.get('status') or '', re.I) \
                and not re.search(r'construction', p.get('status') or '', re.I) else 'building'
            if p.get('expected_by') and month > p['expected_by']:
                p['overdue'] = True
                p['overdue_note'] = (f"Expected by {p['expected_by']} but not yet listed by the City as open: check the "
                                     "project page and update the list if it has opened.")
    return projects


def pop_method_ok(method):
    if method == 'model_city':                  # retired: the City's total is now model 3 (city_pace)
        return 'city_pace'
    return method if method in POP_METHODS else DEFAULT_POP_METHOD


def city_children_at(ym):
    """Calgary's children (aged 0 to 4, aged 0 to 14) in month ym, from the City's forecast, straight line between Aprils."""
    years = sorted(CITY_KIDS_APRIL)
    t = min(max(ym / 12 - 3 / 12, years[0]), years[-1])
    y0 = min(int(t), years[-2])
    f = t - y0
    return tuple(round(a + (b - a) * f) for a, b in zip(CITY_KIDS_APRIL[y0], CITY_KIDS_APRIL[y0 + 1]))


def city_population_at(ym):
    """Calgary's population in month ym (year*12 + month-1), straight line between April 1 figures."""
    years = sorted(CITY_POP_APRIL)
    t = ym / 12 - 3 / 12                       # years since 1 January of year 0, April 1 = whole number
    t = min(max(t, years[0]), years[-1])
    y0 = min(int(t), years[-2])
    f = t - y0
    return round(CITY_POP_APRIL[y0] + (CITY_POP_APRIL[y0 + 1] - CITY_POP_APRIL[y0]) * f)
GROWING_PCT = 30          # communities that grew more than this since 2021 are flagged


def _in(field, values):
    return f"{field} in(" + ','.join("'" + v.replace("'", "''") + "'" for v in values) + ')'


def _month_start(d, back=0):
    y, m = d.year, d.month - back
    while m <= 0:
        m += 12
        y -= 1
    while m > 12:
        m -= 12
        y += 1
    return dt.date(y, m, 1)


def periods(today=None, spec=None):
    """The period shown and the one it is compared with, in whole months (end dates are exclusive).
    spec: None or {'kind': 'last12' | 'ytd' | 'last3' | 'lastmonth' | 'study' | 'custom',
                   'start': 'YYYY-MM', 'end': 'YYYY-MM' (last month included), 'cstart', 'cend' (optional)}"""
    today = today or calgary_now().date()
    latest = _month_start(today)                   # first day of the current month: only complete months are used
    spec = spec or {}
    kind = spec.get('kind') or 'last12'
    ym = lambda v: dt.date(int(v[:4]), int(v[5:7]), 1)
    back = lambda d, n: _month_start(d, n)
    if kind == 'ytd':
        start = dt.date(latest.year, 1, 1) if latest.month > 1 else dt.date(latest.year - 1, 1, 1)
        end = latest
    elif kind == 'last3':
        start, end = back(latest, 3), latest
    elif kind == 'lastmonth':
        start, end = back(latest, 1), latest
    elif kind == 'study':
        start, end = dt.date(2025, 10, 1), dt.date(2026, 10, 1)
    elif kind == 'custom':
        start, end = ym(spec['start']), _month_start(ym(spec['end']), -1)
        if end > latest:
            end = latest
        if not start < end:
            raise PeriodError('The period must start before it ends and use complete months.')
        if _months_between(start, end) > 36:
            raise PeriodError('Choose a period of 36 months or less.')
    else:
        kind = 'last12'
        start, end = back(latest, 12), latest
    n = _months_between(start, end)
    if kind == 'custom' and spec.get('cstart') and spec.get('cend'):
        cstart, cend = ym(spec['cstart']), _month_start(ym(spec['cend']), -1)
    elif kind == 'last12':
        cstart, cend = back(start, 12), start
    else:
        cstart, cend = back(start, 12), back(end, 12)
    if not cstart < cend:
        raise PeriodError('The comparison period must start before it ends.')
    return {'kind': kind, 'start': start, 'end': end, 'cstart': cstart, 'cend': cend, 'months': n,
            'cmonths': _months_between(cstart, cend),
            # keep the old names working
            'start12': start, 'start24': cstart}


def _months_between(a, b):
    return (b.year - a.year) * 12 + b.month - a.month


def period_key(spec):
    """A short name for a period choice, used for its saved copy."""
    if not spec or (spec.get('kind') or 'last12') == 'last12':
        return 'last12'
    if spec.get('kind') == 'custom':
        return 'custom_' + '_'.join(str(spec.get(k) or '') for k in ('start', 'end', 'cstart', 'cend')).replace('-', '')
    return str(spec.get('kind'))


def _label(start, end):
    last = end - dt.timedelta(days=1)
    return f"{start.strftime('%b %Y')} to {last.strftime('%b %Y')}"


def _pct(new, old):
    if not old:
        return None
    return round((new - old) / old * 100, 1)


def _simplify(multipolygon, step=3):
    """Drop points to keep map shapes light (keeps every ring closed)."""
    out = []
    for polygon in multipolygon.get('coordinates', []):
        rings = []
        for ring in polygon:
            keep = ring[::step] if len(ring) > 40 else ring
            if keep[-1] != ring[-1]:
                keep = keep + [ring[-1]]
            rings.append([[round(x, 5), round(y, 5)] for x, y, *_ in keep])
        out.append(rings)
    return {'type': 'MultiPolygon', 'coordinates': out}


def _mid(a, b):
    return a + (b - a) / 2


def _area(service_name):
    head = (service_name or 'Other').split(' - ')[0].strip()
    return AREA_NAMES.get(head, head)


def dp_type(category):
    """A plain-language group for a development permit's category."""
    c = (category or '').strip()
    if c.startswith(('Residential - Multi-Family - Renovations', 'Residential - Additions')):
        return 'Home additions and renovations'
    if c.startswith(('Residential - Multi-Family', 'Residential - New', 'Residential - Contextual')):
        return 'New homes and apartment buildings'
    if c.startswith('Residential - Secondary Suite'):
        return 'Secondary (basement) suites'
    if c.startswith('Change of Use'):
        return 'Change of use'
    if c.startswith(('Commercial', 'Industrial')):
        return 'New commercial and industrial'
    if c.startswith('Renovations'):
        return 'Non-residential renovations'
    if c.startswith('Home Occupation'):
        return 'Home businesses'
    if c.startswith('Signs'):
        return 'Signs'
    if c.startswith('Relaxation'):
        return 'Relaxations (small exceptions to the rules)'
    return 'Other'


LARGER_DP = ('New homes and apartment buildings', 'Change of use', 'New commercial and industrial')


def _local(utc_text):
    """A UTC timestamp from the City (2026-09-19T21:05:00.000) as Calgary local time, 'YYYY-MM-DD HH:MM'.
    Mountain Daylight Time from the second Sunday of March to the first Sunday of November."""
    try:
        t = dt.datetime.fromisoformat(str(utc_text)[:19])
    except ValueError:
        return str(utc_text or '')[:16].replace('T', ' ')
    y = t.year
    mar = dt.datetime(y, 3, 8) + dt.timedelta(days=(6 - dt.date(y, 3, 8).weekday()) % 7)
    nov = dt.datetime(y, 11, 1) + dt.timedelta(days=(6 - dt.date(y, 11, 1).weekday()) % 7)
    dst = mar + dt.timedelta(hours=9) <= t < nov + dt.timedelta(hours=8)     # 2 a.m. local, in UTC
    return (t - dt.timedelta(hours=6 if dst else 7)).strftime('%Y-%m-%d %H:%M')


def _when(utc_text, fallback=None):
    """When a source was really read (Calgary time), or the fallback."""
    return _local(utc_text) if utc_text else fallback


def calgary_now():
    """The time in Calgary now, whatever time zone this computer is set to."""
    utc = dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S')
    return dt.datetime.strptime(_local(utc), '%Y-%m-%d %H:%M')


def _safe(fn):
    """Run an optional query; a failure there must not stop the dashboard. Returns (rows, error)."""
    try:
        return fn(), None
    except Exception as e:                        # noqa: BLE001 - shown in the data status panel
        return None, str(e)[:200]


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _dataset_status(ids):
    """When the City last updated each dataset (from the dataset's own record on data.calgary.ca)."""
    def one(i):
        try:
            m = cd.get_json(f'{cd.BASE}/api/views/{i}.json')
            t = m.get('rowsUpdatedAt')
            return i, (_local(dt.datetime.fromtimestamp(int(t), dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S')) if t else None), m.get('name')
        except Exception:                          # noqa: BLE001
            return i, None, None
    with ThreadPoolExecutor(max_workers=6) as pool:
        return {i: (u, n) for i, u, n in pool.map(one, ids)}


def ward_lists(cache_dir, ward, live=False):
    """(residential codes, other codes, community table) for a ward, from the City's ward and community outlines."""
    ward = wardmap.ward_ok(ward)
    try:
        table = wardmap.load(cache_dir, force=False)
    except Exception:
        if ward == WARD:
            return list(RESIDENTIAL_CODES), list(OTHER_AREAS), None
        raise
    res, other = wardmap.ward_codes(table, ward)
    if ward == WARD and set(res) == set(RESIDENTIAL_CODES) and set(other) == set(OTHER_AREAS):
        return list(RESIDENTIAL_CODES), list(OTHER_AREAS), table      # Ward 5 as before (same communities, same order)
    return res, other, table


def build(today=None, cache_dir=None, spec=None, pop_method='city_pace', live=False, ward=WARD):
    """The dashboard, counted from the newest federal Census the City has published (census.py checks weekly)."""
    cdir = cache_dir or os.path.join(os.path.expanduser('~'), '.ward5datadesk')
    try:
        info = censusmod.load(cdir)
    except Exception:                            # noqa: BLE001 - never stop the dashboard over this check
        info = dict(censusmod.BASE_2021)
    popmodel.set_base(info)
    data = _build(today=today, cache_dir=cache_dir, spec=spec, pop_method=pop_method, live=live, ward=ward, census=info)
    data['census'] = {k: info.get(k) for k in ('year', 'day', 'community_pop', 'community_hh', 'ward_pop', 'checked',
                                               'newer_seen')}
    return censusmod.relabel(data, int(info.get('year') or 2021))


def _build(today=None, cache_dir=None, spec=None, pop_method='city_pace', live=False, ward=WARD, census=None):
    """live: the office pressed Refresh, so every source is asked again now (no week-old saved copies).
    ward: any of Calgary's 14 wards (its communities come from the City's outlines), or 0 for the whole city:
    every community, with a summary of each ward for comparing them."""
    ward = wardmap.ward_ok(ward)
    city = ward == wardmap.CITY
    cdir = cache_dir or os.path.join(os.path.expanduser('~'), '.ward5datadesk')
    RESIDENTIAL_CODES, OTHER_AREAS, ward_table = ward_lists(cdir, ward, live)
    ALL_CODES = RESIDENTIAL_CODES + OTHER_AREAS
    P = periods(today, spec)
    pop_method = pop_method_ok(pop_method)
    ref = today or calgary_now().date()
    old_cutoff = (ref - dt.timedelta(days=90)).isoformat()
    s, e, cs, ce = (P[k].isoformat() for k in ('start', 'end', 'cstart', 'cend'))
    # the City's records carry a community code; the whole city is every record that has one
    codes = 'comm_code IS NOT NULL' if city else _in('comm_code', ALL_CODES)
    pcodes = 'communitycode IS NOT NULL' if city else _in('communitycode', ALL_CODES)
    in_ward = 'ward IS NOT NULL' if city else f"ward='{ward}'"
    not_dup = "status_description not like 'Duplicate%'"
    cur = f"requested_date>='{s}' AND requested_date<'{e}'"
    cmp_ = f"requested_date>='{cs}' AND requested_date<'{ce}'"
    both = f'(({cur}) OR ({cmp_}))'
    days = 'date_diff_d(closed_date,requested_date)'
    # the growth model runs for every community, so each ward can be set against the whole city
    ALL_RES = wardmap.ward_codes(ward_table, wardmap.CITY)[0] if ward_table else list(RESIDENTIAL_CODES)
    pq = popmodel.queries(ALL_RES + [c for c in NEW_COMMUNITIES_2021 if c not in ALL_RES])
    infra = _in('service_name', INFRASTRUCTURE)
    fetched_at = calgary_now().strftime('%Y-%m-%d %H:%M')     # Calgary time

    def permits(field, a, b):
        return lambda: cd.query(PERMITS, select='communitycode,count(*) as n,sum(housingunits) as units',
                                where=f"{field}>='{a}' AND {field}<'{b}' AND " + pcodes,
                                group='communitycode', limit=1000)

    jobs = {
        'ward': ((lambda: cd.query(CITY_BOUNDARY, select='multipolygon', limit=5)) if city
                 else (lambda: cd.query(WARDS, where=f'ward_num={ward}', limit=5))),
        'areas': lambda: cd.query(COMMUNITIES, select='comm_code,name,class,multipolygon', where=codes, limit=1000 if city else 100),
        'monthly_all': lambda: cd.query(SERVICE_REQUESTS, select='comm_code,date_trunc_ym(requested_date) as m,count(*) as n',
                                        where=f'{both} AND {not_dup} AND {codes}', group='comm_code,m', limit=50000),
        'types': lambda: cd.query(SERVICE_REQUESTS,
                                  select=(f"service_name,sum(case({cur},1,true,0)) as n12,"
                                          f"sum(case({cmp_},1,true,0)) as nprev"),
                                  where=f'{both} AND {not_dup} AND {codes}', group='service_name', limit=5000),
        'infra': lambda: cd.query(SERVICE_REQUESTS,
                                  select=f"comm_code,sum(case({cur},1,true,0)) as n12,sum(case({cmp_},1,true,0)) as nprev",
                                  where=f'{both} AND {not_dup} AND {codes} AND {infra}', group='comm_code', limit=1000),
        'open': lambda: cd.query(SERVICE_REQUESTS, select='comm_code,service_name,count(*) as n,min(requested_date) as oldest',
                                 where=f"status_description='Open' AND {codes}", group='comm_code,service_name', limit=50000),
        'open_old': lambda: cd.query(SERVICE_REQUESTS, select='comm_code,count(*) as n',
                                     where=f"status_description='Open' AND requested_date<'{old_cutoff}' AND {codes}",
                                     group='comm_code', limit=1000),
        'open_list': lambda: cd.query(SERVICE_REQUESTS,
                                      select=('service_request_id,requested_date,updated_date,source,service_name,'
                                              'agency_responsible,address,comm_code,location_type,latitude,longitude'),
                                      where=f"status_description='Open' AND {codes}", order='requested_date',
                                      limit=1 if city else 20000),
        'newest': lambda: cd.query(SERVICE_REQUESTS,
                                   select='service_request_id,requested_date,status_description,service_name,comm_code',
                                   where=f'{not_dup} AND {codes}', order='requested_date DESC,service_request_id DESC',
                                   limit=40),
        'close_ward': lambda: cd.query(SERVICE_REQUESTS, select=f'count(*) as n,sum(case({days}<=7,1,true,0)) as w7',
                                       where=f"{cur} AND status_description='Closed' AND {codes}", limit=1),
        'close_city': lambda: cd.query(SERVICE_REQUESTS, select=f'count(*) as n,sum(case({days}<=7,1,true,0)) as w7',
                                       where=f"{cur} AND status_description='Closed' AND comm_code IS NOT NULL", limit=1),
        'channel_ward': lambda: cd.query(SERVICE_REQUESTS, select='source,count(*) as n',
                                         where=f'{cur} AND {not_dup} AND {codes}', group='source', limit=20),
        'channel_city': lambda: cd.query(SERVICE_REQUESTS, select='source,count(*) as n',
                                         where=f'{cur} AND {not_dup} AND comm_code IS NOT NULL', group='source', limit=20),
        'permits12': permits('applieddate', s, e),
        'permits_prev': permits('applieddate', cs, ce),
        'issued12': permits('issueddate', s, e),
        'issued_prev': permits('issueddate', cs, ce),
        'cameras': lambda: cd.query(CAMERAS, select='camera_url,quadrant,camera_location,point', limit=1000),
        'homes': lambda: cd.query(pq['homes'][0], select=pq['homes'][1], where=pq['homes'][2], group=pq['homes'][3], limit=50000),
        'census': lambda: cd.query(pq['census'][0], select=pq['census'][1], where=pq['census'][2], limit=1000),
        'households': lambda: cd.query(pq['households'][0], select=pq['households'][1], where=pq['households'][2], limit=1000),
    }
    # optional layers: a failure shows in the data status panel instead of stopping the dashboard
    optional = {
        'wards_all': lambda: cd.query(WARDS, select='ward_num,multipolygon', limit=50),
        'city': lambda: cd.query(CITY_BOUNDARY, select='multipolygon', limit=5),
        'dp_counts': lambda: cd.query(DEV_PERMITS, select='communitycode,statuscurrent,count(*) as n',
                                      where=f"{in_ward} AND applieddate>='{s}' AND applieddate<'{e}'",
                                      group='communitycode,statuscurrent', limit=5000),
        'dp_prev': lambda: cd.query(DEV_PERMITS, select='category,count(*) as n',
                                    where=f"{in_ward} AND applieddate>='{cs}' AND applieddate<'{ce}'",
                                    group='category', limit=1000),
        'dp_list': lambda: cd.query(DEV_PERMITS,
                                    select=('permitnum,address,category,description,proposedusedescription,statuscurrent,'
                                            'applieddate,decision,decisiondate,communitycode,latitude,longitude'),
                                    where=f"{in_ward} AND applieddate>='{s}' AND applieddate<'{e}'",
                                    order='applieddate DESC', limit=1500),
        'disorder_latest': lambda: cd.query(DISORDER, select='max(reported_date_time) as last', limit=1),
        'regions': lambda: cd.query(COMMUNITY_REGIONS, select='_feature_id,comm_code', limit=2000),
        'big_permits': lambda: cd.query(PERMITS, where=(f"issueddate>='{s}' AND issueddate<'{e}' AND estprojectcost > 1000000 "
                                                        f"AND (housingunits IS NULL OR housingunits = 0) AND "
                                                        + pcodes),
                                        order='estprojectcost DESC', limit=30),
        'roadwork': lambda: cd.query(ROADWORK, select='title,budget,url,description,projecttype,completion,point', limit=500),
    }
    if city:                      # closing speed and app use by community, to summarise each ward
        jobs['close_by_comm'] = lambda: cd.query(SERVICE_REQUESTS, select=f'comm_code,count(*) as n,sum(case({days}<=7,1,true,0)) as w7',
                                                 where=f"{cur} AND status_description='Closed' AND {codes}", group='comm_code', limit=2000)
        jobs['channel_by_comm'] = lambda: cd.query(SERVICE_REQUESTS, select='comm_code,source,count(*) as n',
                                                   where=f'{cur} AND {not_dup} AND {codes}', group='comm_code,source', limit=5000)
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {k: pool.submit(f) for k, f in jobs.items()}
        opt_f = {k: pool.submit(_safe, f) for k, f in optional.items()}
        R = {k: f.result() for k, f in futures.items()}
        O = {k: f.result() for k, f in opt_f.items()}

    ward_row = R['ward'][0]
    ward_shape = ward_row['multipolygon']
    ward_geo = geo.Shape(ward_shape)
    inside = ward_geo.contains
    x0, y0, x1, y1 = cd.bbox(ward_shape)

    # ---- population: growth model, for today and for the middle of each period ----
    model = popmodel.GrowthModel(R['homes'], R['census'], R['households'])
    census_ym = popmodel.CENSUS_DAY.year * 12 + popmodel.CENSUS_DAY.month - 1
    city_at_census = city_population_at(census_ym)

    # Calgary's 2021 Census count over every community: city_pace grows it to the City's own total. Communities with
    # no 2021 count (built since) are counted from their homes with the growth model, and the rest share what is left.
    at_census = popmodel.estimate(model, ALL_RES, popmodel.CENSUS_DAY)
    census_all = sum((v.get('census2021') or 0) for v in at_census.values())
    new_codes = [c for c, v in at_census.items() if not v.get('census2021')]
    whole_city = len(ALL_RES) > len(RESIDENTIAL_CODES) or city
    _new_at = {}

    def new_people(when):
        """Growth model residents of the communities built since the 2021 Census, on a date."""
        key = when.isoformat()
        if key not in _new_at:
            _new_at[key] = sum(v['model'] for v in popmodel.estimate(model, new_codes, when).values()) if new_codes else 0
        return _new_at[key]

    def city_factor(when):
        """(The City's population estimate for that month - the residents of communities built since 2021) / Calgary's
        2021 Census count (people in private households). Every older community's 2021 count x this factor, plus the
        new communities, adds up to the City's own total."""
        if whole_city and census_all:
            return (city_population_at(when.year * 12 + when.month - 1) - new_people(when)) / census_all
        # without every community known: Calgary's growth since Census day only
        return city_population_at(when.year * 12 + when.month - 1) / city_at_census if when > popmodel.CENSUS_DAY else 1.0

    _fix = {}

    def pace_fix(when, f):
        """Rounding each community leaves Calgary a person or two off the City's total: the largest community takes
        the difference, the same in every view, so Calgary's total matches the City's figure exactly."""
        key = (when.isoformat(), round(f, 12))
        if key not in _fix:
            _fix[key] = (None, 0)
            if whole_city and census_all:
                allc = popmodel.estimate(model, ALL_RES, when)
                total = sum(int(round(v['census2021'] * f)) if v.get('census2021') else v['model'] for v in allc.values())
                big = max(allc, key=lambda c: allc[c].get('census2021') or 0)
                _fix[key] = (big, city_population_at(when.year * 12 + when.month - 1) - total)
        return _fix[key]

    def estimate(when, codes=None):
        """Residents of each community on a date, counted the way the office chose (pop_method).
        'model' keeps the growth model's figure; the others replace it, and growth_pct follows."""
        est = popmodel.estimate(model, codes or RESIDENTIAL_CODES, when)
        if pop_method == 'model':
            return est
        f = city_factor(when) if pop_method == 'city_pace' else 1.0
        big, diff = pace_fix(when, f) if pop_method == 'city_pace' else (None, 0)
        for c_, v in est.items():
            p21 = v['census2021']
            v['growth_model'] = v['model']
            v['growth_model_pct'] = v.get('growth_pct')
            if p21 or pop_method != 'city_pace':
                v['model'] = int(round((p21 or 0) * f)) + (diff if c_ == big else 0)
            # (city_pace: a community built since 2021 keeps its growth model count)
            v['growth_pct'] = round((v['model'] / p21 - 1) * 100, 1) if p21 else None
            v['method'] = POP_METHODS[pop_method]['short']
        return est
    pop_now = estimate(ref)
    pop_mid12 = estimate(_mid(P['start'], P['end']))
    pop_midprev = estimate(_mid(P['cstart'], P['cend']))
    yr12, yrprev = 12 / P['months'], 12 / P['cmonths']           # rates are per 1,000 residents a year

    # ---- traffic incidents inside the ward boundary (exact locations) ----
    # The City stores UTC times; months are counted in Calgary time, so ask for one more day and use local dates.
    lo, hi = min(s, cs), (dt.date.fromisoformat(max(e, ce)) + dt.timedelta(days=1)).isoformat()
    rows = cd.query(TRAFFIC, select='start_dt_utc,incident_info,description,latitude,longitude',
                    where=(f"start_dt_utc>='{lo}' AND start_dt_utc<'{hi}' AND latitude>{y0} AND latitude<{y1} "
                           f"AND longitude>{x0} AND longitude<{x1}"), limit=200000 if city else 50000)
    traffic = [r for r in rows if r.get('latitude') and inside(float(r['longitude']), float(r['latitude']))]
    for r in traffic:
        r['_day'] = _local(r['start_dt_utc'])[:10]
    t12 = [r for r in traffic if s <= r['_day'] < e]
    tprev = [r for r in traffic if cs <= r['_day'] < ce]
    recent_from = (P['end'] - dt.timedelta(days=90)).isoformat()
    traffic_points = [{'lat': round(float(r['latitude']), 5), 'lon': round(float(r['longitude']), 5),
                       'date': _local(r['start_dt_utc'])[:10], 'time': _local(r['start_dt_utc'])[11:16],
                       'where': r.get('incident_info', ''),
                       'what': r.get('description', '')} for r in t12 if r['_day'] >= recent_from]

    # ---- traffic cameras: those in the ward and within about 2 km of it ----
    near = lambda lon, lat: x0 - 0.03 < lon < x1 + 0.03 and y0 - 0.02 < lat < y1 + 0.02
    cameras = []
    for r in R['cameras']:
        pt = (r.get('point') or {}).get('coordinates')
        url = (r.get('camera_url') or {}).get('url') if isinstance(r.get('camera_url'), dict) else r.get('camera_url')
        if not pt or not url:
            continue
        lon, lat = float(pt[0]), float(pt[1])
        cameras.append({'name': r.get('camera_location', ''), 'url': url, 'lat': round(lat, 5), 'lon': round(lon, 5),
                        'quadrant': r.get('quadrant', ''), 'in_ward': inside(lon, lat), 'near_ward': near(lon, lat)})

    # ---- police-reported social disorder (public data stops before today) ----
    # The City's dataset stopped in July 2025; it is optional so a change there never stops the dashboard.
    region_to_code = {str(r.get('_feature_id')): r.get('comm_code') for r in (O['regions'][0] or [])}
    ward_regions = [rid for rid, code in region_to_code.items() if code in ALL_CODES]
    disorder = None
    last = ((O['disorder_latest'][0] or [{}])[0] or {}).get('last')

    def _city_disorder():
        dl = dt.date.fromisoformat(last[:10])
        d_end = _month_start(dl, -1) if dl.day >= 28 else _month_start(dl)
        d12, d24 = _month_start(d_end, 12), _month_start(d_end, 24)
        rows = cd.query(DISORDER, select='category_level_1 as c,count(*) as n',
                        where=(f"reported_date_time>='{d12.isoformat()}' AND reported_date_time<'{d_end.isoformat()}' AND "
                               + _in(':@computed_region_kxmf_bzkv', ward_regions)), group='c', limit=100)
        prev = cd.query(DISORDER, select='count(*) as n',
                        where=(f"reported_date_time>='{d24.isoformat()}' AND reported_date_time<'{d12.isoformat()}' AND "
                               + _in(':@computed_region_kxmf_bzkv', ward_regions)), limit=1)
        n12 = sum(int(r['n']) for r in rows)
        nprev = int(prev[0]['n']) if prev else 0
        return {'period': _label(d12, d_end), 'last12': n12, 'prev12': nprev, 'change_pct': _pct(n12, nprev),
                'by_category': sorted(({'category': r.get('c') or 'Other', 'n': int(r['n'])} for r in rows),
                                      key=lambda x: -x['n']),
                'data_ends': dl.isoformat()}
    if last and ward_regions:
        disorder, _ = _safe(_city_disorder)

    # ---- 311 by community and month ----
    months = [_month_start(P['end'], k).isoformat()[:7] for k in range(P['months'], 0, -1)]
    cmonths = [_month_start(P['cend'], k).isoformat()[:7] for k in range(P['cmonths'], 0, -1)]
    all_g = {}
    for r in R['monthly_all']:
        all_g[(r.get('comm_code'), r['m'][:7])] = int(r['n'])
    m12, mprev = set(months), set(cmonths)
    names = {a['comm_code']: a['name'].title() for a in R['areas']}

    open_by_comm, open_types = {}, {}
    for r in R['open']:
        c, n = r.get('comm_code'), int(r['n'])
        open_by_comm.setdefault(c, []).append({'type': r['service_name'], 'n': n, 'oldest': (r.get('oldest') or '')[:10]})
        t = open_types.setdefault(r['service_name'], {'type': r['service_name'], 'n': 0, 'oldest': '9999'})
        t['n'] += n
        t['oldest'] = min(t['oldest'], (r.get('oldest') or '9999')[:10])

    open_old = {r.get('comm_code'): int(r['n']) for r in R['open_old']}
    units = lambda rows, code: int(_num(({r.get('communitycode'): r for r in rows}.get(code) or {}).get('units')))
    infra_g = {r.get('comm_code'): (int(_num(r.get('n12'))), int(_num(r.get('nprev')))) for r in R['infra']}
    per1000 = lambda n, p, f=1: round(n / p * 1000 * f, 1) if p else None

    # ---- development permits (ward field of each permit) ----
    dp_counts, dp_err = O['dp_counts']
    dp_by_comm, dp_status = {}, {}
    for r in dp_counts or []:
        c, st, n = r.get('communitycode'), r.get('statuscurrent') or 'Unknown', int(_num(r.get('n')))
        dp_by_comm[c] = dp_by_comm.get(c, 0) + n
        dp_status[st] = dp_status.get(st, 0) + n

    communities = []
    for code in ALL_CODES:
        res = code in RESIDENTIAL_CODES
        pn, pm, pp = pop_now.get(code, {}), pop_mid12.get(code, {}), pop_midprev.get(code, {})
        pop = pn.get('model') if res else None
        all12 = sum(v for (c, m), v in all_g.items() if c == code and m in m12)
        allprev = sum(v for (c, m), v in all_g.items() if c == code and m in mprev)
        i12, iprev = infra_g.get(code, (0, 0))
        opens = sorted(open_by_comm.get(code, []), key=lambda x: -x['n'])
        n_open = sum(o['n'] for o in opens)
        rated = res and (pop or 0) >= MIN_RATE_RESIDENTS     # a handful of residents makes a rate per 1,000 meaningless
        communities.append({
            'code': code, 'name': names.get(code, code), 'residential': res,
            'residents': pop, 'census2021': pn.get('census2021') if res else None, 'growth_pct': pn.get('growth_pct') if res else None,
            'pop_method': pn.get('method'), 'homes_now': pn.get('homes_now'), 'homes_census': pn.get('homes_census'),
            'growing': bool(res and (pn.get('growth_pct') is None or pn.get('growth_pct') > GROWING_PCT)),
            'requests12': all12, 'requests_prev': allprev, 'requests_change_pct': _pct(all12 * yr12, allprev * yrprev),
            'requests_per_1000': per1000(all12, pm.get('model'), yr12) if rated else None,
            'requests_per_1000_prev': per1000(allprev, pp.get('model'), yrprev) if rated else None,
            'infra12': i12, 'infra_prev': iprev,
            'infra_per_1000': per1000(i12, pm.get('model'), yr12) if rated else None,
            'infra_per_1000_prev': per1000(iprev, pp.get('model'), yrprev) if rated else None,
            'open': n_open, 'open_top': opens[:6], 'open_over_90_days': open_old.get(code, 0),
            'open_per_1000': per1000(n_open, pop) if rated else None,
            'new_homes12': units(R['permits12'], code), 'new_homes_prev': units(R['permits_prev'], code),
            'issued_homes12': units(R['issued12'], code), 'issued_homes_prev': units(R['issued_prev'], code),
            'dev_permits12': dp_by_comm.get(code, 0), 'few_residents': bool(res and not rated),
        })

    res = [c for c in communities if c['residential']]
    tot = lambda key, rows=communities: sum(c[key] or 0 for c in rows)
    residents = tot('residents', res)
    census_total = tot('census2021', res)
    mid12_total = sum(v['model'] for v in pop_mid12.values())
    midprev_total = sum(v['model'] for v in pop_midprev.values())
    cw, cc = R['close_ward'][0], R['close_city'][0]

    def app_share(rows):
        total = sum(int(r['n']) for r in rows)
        app = sum(int(r['n']) for r in rows if r.get('source') == 'App')
        return round(app / total * 100, 1) if total else None

    areas_n = {}
    for r in R['types']:
        a = areas_n.setdefault(_area(r.get('service_name')), [0, 0])
        a[0] += int(_num(r.get('n12')))
        a[1] += int(_num(r.get('nprev')))
    service_areas = sorted(({'area': k, 'n12': v[0], 'prev': v[1], 'change_pct': _pct(v[0] * yr12, v[1] * yrprev)}
                            for k, v in areas_n.items()), key=lambda x: -x['n12'])

    open_list = [{'id': r.get('service_request_id'), 'date': (r.get('requested_date') or '')[:10],
                  'updated': (r.get('updated_date') or '')[:10], 'type': r.get('service_name'),
                  'area': _area(r.get('service_name')),
                  'agency': r.get('agency_responsible', ''), 'comm': r.get('comm_code'), 'address': r.get('address', ''),
                  'where': r.get('location_type', ''), 'source': r.get('source', ''),
                  'lat': round(float(r['latitude']), 5) if r.get('latitude') else None,
                  'lon': round(float(r['longitude']), 5) if r.get('longitude') else None} for r in R['open_list']]
    newest = [{'id': r.get('service_request_id'), 'date': (r.get('requested_date') or '')[:10],
               'status': r.get('status_description'), 'type': r.get('service_name'), 'comm': r.get('comm_code')}
              for r in R['newest']]

    shapes = {a['comm_code']: _simplify(a['multipolygon']) for a in R['areas'] if a.get('multipolygon')}
    full_shapes = {a['comm_code']: a['multipolygon'] for a in R['areas'] if a.get('multipolygon')}

    comm_locator = geo.Locator(full_shapes)

    def comm_of(lon, lat):
        return comm_locator.find(lon, lat)

    # ---- development permit list ----
    dp_list, _ = O['dp_list']
    in_review = ('In Circulation', 'Under Review', 'In Advertising', 'Pending Decision', 'Pending Release', 'New',
                 'Hold', 'Pending Appeal', 'Approved')
    development = None
    if dp_counts is not None:
        dp_prev, _ = O['dp_prev']
        n_dp = sum(dp_status.values())
        prev_by_type = {}
        for r in dp_prev or []:
            t = dp_type(r.get('category'))
            prev_by_type[t] = prev_by_type.get(t, 0) + int(_num(r.get('n')))
        development = {
            'applied': n_dp, 'applied_prev': sum(prev_by_type.values()) if dp_prev is not None else None,
            'prev_by_type': prev_by_type, 'larger_types': list(LARGER_DP),
            'released': dp_status.get('Released', 0),
            'in_review': sum(v for k, v in dp_status.items() if k in in_review),
            'refused': dp_status.get('Refused', 0),
            'cancelled': sum(v for k, v in dp_status.items() if k.startswith('Cancelled') or k == 'Inactive'),
            'by_status': sorted(({'status': k, 'n': v} for k, v in dp_status.items()), key=lambda x: -x['n']),
            'page': DEV_MAP_PAGE,
            'list': [{'id': r.get('permitnum'), 'address': r.get('address', ''), 'category': r.get('category', ''),
                      'type': dp_type(r.get('category')),
                      'what': (r.get('description') or '')[:240], 'use': r.get('proposedusedescription', ''),
                      'status': r.get('statuscurrent', ''), 'applied': (r.get('applieddate') or '')[:10],
                      'decision': r.get('decision', ''), 'decided': (r.get('decisiondate') or '')[:10],
                      'comm': r.get('communitycode'),
                      'lat': round(_num(r.get('latitude')), 5) or None, 'lon': round(_num(r.get('longitude')), 5) or None}
                     for r in (dp_list or [])],
        }
        development['change_pct'] = _pct(n_dp * yr12, (development['applied_prev'] or 0) * yrprev)
        by_type = {}
        for p in development['list']:
            b = by_type.setdefault(p['type'], {'type': p['type'], 'n': 0, 'released': 0, 'larger': p['type'] in LARGER_DP})
            b['n'] += 1
            b['released'] += p['status'] == 'Released'
        for t, n in prev_by_type.items():
            by_type.setdefault(t, {'type': t, 'n': 0, 'released': 0, 'larger': t in LARGER_DP})['prev'] = n
        development['by_type'] = sorted(by_type.values(), key=lambda x: -x['n'])
        larger = [p for p in development['list'] if p['type'] in LARGER_DP]
        development['larger'] = len(larger)
        development['larger_prev'] = sum(n for t, n in prev_by_type.items() if t in LARGER_DP) if dp_prev is not None else None
        development['larger_change_pct'] = _pct(len(larger) * yr12, (development['larger_prev'] or 0) * yrprev)
        development['larger_released'] = sum(1 for p in larger if p['status'] == 'Released')
        development['list_complete'] = len(development['list']) >= n_dp

    # ---- road construction: City projects in or near the ward ----
    rw, _ = O['roadwork']
    roadwork = None
    if rw is not None:
        roadwork = []
        for r in rw:
            pt = (r.get('point') or {}).get('coordinates')
            if not pt:
                continue
            lon, lat = float(pt[0]), float(pt[1])
            if not near(lon, lat):
                continue
            url = r.get('url')
            url = url.get('url') if isinstance(url, dict) else url
            roadwork.append({'title': r.get('title', ''), 'budget': r.get('budget', ''), 'url': url or '',
                             'what': (r.get('description') or '')[:400], 'type': r.get('projecttype', ''),
                             'completion': r.get('completion', ''), 'lat': round(lat, 5), 'lon': round(lon, 5),
                             'in_ward': inside(lon, lat), 'comm': comm_of(lon, lat)})

    # ---- large building permits (not homes) issued in the period: big projects under way ----
    bp, bp_err = O['big_permits']
    big_permits = None
    if bp is not None:
        big_permits = []
        for r in bp:
            cost = _num(r.get('estprojectcost'))
            try:
                lat, lon = float(r.get('latitude')), float(r.get('longitude'))
            except (TypeError, ValueError):
                lat = lon = None
            big_permits.append({
                'id': r.get('permitnum', ''), 'title': (r.get('description') or r.get('workclassgroup') or 'Building permit')[:160],
                'type': ' / '.join(x for x in (r.get('permitclassgroup') or r.get('permitclass'), r.get('workclassgroup')) if x),
                'cost': cost, 'budget': f'${cost:,.0f} estimated' if cost else '', 'issued': (r.get('issueddate') or '')[:10],
                'status': r.get('statuscurrent', ''), 'address': r.get('originaladdress') or r.get('address') or '',
                'comm': r.get('communitycode'), 'lat': round(lat, 5) if lat else None, 'lon': round(lon, 5) if lon else None,
                'in_ward': True})

    # ---- amenities: recreation facilities and transit stops in each community ----
    box = f'within_box(point,{y1 + 0.005},{x0 - 0.005},{y0 - 0.005},{x1 + 0.005})'
    rec, rec_err = _safe(lambda: cd.query(REC_FACILITIES, select='complex_name,facility_type,facility_name,address,website,point',
                                          where=box, limit=2000))
    stops, stop_err = _safe(lambda: cd.query(TRANSIT_STOPS, select='teleride_number,stop_name,point',
                                             where=f"{box} AND status='ACTIVE'", limit=50000 if city else 5000))
    play, play_err = _safe(lambda: cd.query(PLAYGROUNDS, select='location_detail,point',
                                            where=f"{box} AND life_cycle_status='ACTIVE' AND "
                                                  "type_description='MULTI PLAY COMPLEX'", limit=20000 if city else 5000))
    svc, svc_err = _safe(lambda: cd.query(COMMUNITY_SERVICES, select='type,name,address,comm_code,point',
                                          where=codes, limit=5000 if city else 1000))
    amenities = None
    if rec is not None or stops is not None or play is not None or svc is not None:
        facilities, stop_pts, stop_n, play_pts, play_n = [], [], {}, [], {}
        for r in svc or []:                      # libraries, community centres and other City services
            pt = (r.get('point') or {}).get('coordinates')
            if not pt:
                continue
            lon, lat = float(pt[0]), float(pt[1])
            facilities.append({'name': r.get('name', ''), 'type': r.get('type', ''), 'address': r.get('address', ''),
                               'website': '', 'comm': r.get('comm_code'), 'lat': round(lat, 5), 'lon': round(lon, 5)})
        for r in play or []:
            pt = (r.get('point') or {}).get('coordinates')
            if not pt:
                continue
            lon, lat = float(pt[0]), float(pt[1])
            code = comm_of(lon, lat)
            if not code:
                continue
            play_n[code] = play_n.get(code, 0) + 1
            play_pts.append([round(lat, 5), round(lon, 5), (r.get('location_detail') or '').title()])
        for r in rec or []:
            pt = (r.get('point') or {}).get('coordinates')
            if not pt:
                continue
            lon, lat = float(pt[0]), float(pt[1])
            code = comm_of(lon, lat)
            if not code:
                continue
            web = r.get('website')
            web = web.get('url') if isinstance(web, dict) else web
            facilities.append({'name': r.get('complex_name') or r.get('facility_name') or '', 'type': r.get('facility_type', ''),
                               'address': r.get('address', ''), 'website': web or '', 'comm': code,
                               'lat': round(lat, 5), 'lon': round(lon, 5)})
        for r in stops or []:
            pt = (r.get('point') or {}).get('coordinates')
            if not pt:
                continue
            lon, lat = float(pt[0]), float(pt[1])
            code = comm_of(lon, lat)
            if not code:
                continue
            stop_n[code] = stop_n.get(code, 0) + 1
            stop_pts.append([round(lat, 5), round(lon, 5), r.get('stop_name', '')])
        by = {}
        for c in communities:
            if not c['residential']:
                continue
            fac = [f for f in facilities if f['comm'] == c['code']]
            pop = c['residents'] or 0
            by[c['code']] = {'facilities': len(fac), 'stops': stop_n.get(c['code'], 0),
                             'playgrounds': play_n.get(c['code'], 0),
                             'kids_per_playground': None,
                             'residents_per_facility': round(pop / len(fac)) if fac else None,
                             'stops_per_1000': round(stop_n.get(c['code'], 0) / pop * 1000, 2) if pop else None}
        amenities = {'facilities': facilities, 'stops': stop_pts if stops is not None else None, 'by_comm': by,
                     'playgrounds': play_pts if play is not None else None,
                     'facilities_total': len(facilities), 'stops_total': sum(stop_n.values()),
                     'playgrounds_total': sum(play_n.values())}

    # ---- families: child care and schools (Government of Alberta), children from the Census grown with the model ----
    # Children: each community keeps its 2021 share of children for the residents it had in 2021; residents added
    # since then are counted at the share seen in 2021 in Ward 5's newest communities (Cityscape, Cornerstone), where
    # new homes were filled mostly by young families. An estimate: no public count of children by community after 2021.
    k04 = {r.get('community_code'): float(r.get('pop_age_0_to_4') or 0) for r in R['census']}
    k014 = {r.get('community_code'): float(r.get('pop_age_0_to_14') or 0) for r in R['census']}
    p21 = {r.get('community_code'): float(r.get('total_pop_household') or 0) for r in R['census']}
    new_comms = [c for c in NEW_COMMUNITIES_2021 if p21.get(c)]
    base = sum(p21[c] for c in new_comms) or 1
    new04 = sum(k04.get(c, 0) for c in new_comms) / base
    new014 = sum(k014.get(c, 0) for c in new_comms) / base

    def kids_at(code, pop):
        added = max(0.0, pop - p21.get(code, 0))
        return (k04.get(code, 0) + added * new04, k014.get(code, 0) + added * new014)

    # Grown to the City's total: children follow the City's own forecast of children (the same table), shared by each
    # community's 2021 count of children; communities built since 2021 keep the growth model's estimate.
    k04_all = sum(k04.get(c, 0) for c in ALL_RES if p21.get(c))
    k014_all = sum(k014.get(c, 0) for c in ALL_RES if p21.get(c))
    _kf = {}

    def kid_factors(when):
        key = when.isoformat()
        if key not in _kf:
            _kf[key] = None
            if whole_city and k014_all:
                c04, c014 = city_children_at(when.year * 12 + when.month - 1)
                n04 = n014 = 0.0
                for c_, v_ in (popmodel.estimate(model, new_codes, when).items() if new_codes else []):
                    a_, b_ = kids_at(c_, v_['model'])
                    n04, n014 = n04 + a_, n014 + b_
                _kf[key] = ((c04 - n04) / k04_all, (c014 - n014) / k014_all)
        return _kf[key]

    def kids_for(code, pop, when):
        """(aged 0 to 4, aged 0 to 14) in a community on a date, for the way residents are counted."""
        if pop_method == 'city_pace' and p21.get(code):
            f_ = kid_factors(when)
            if f_:
                return (k04.get(code, 0) * f_[0], k014.get(code, 0) * f_[1])
        return kids_at(code, pop)

    kids = {}
    for code in RESIDENTIAL_CODES:
        now = pop_now.get(code, {}).get('model') or 0
        a, b = kids_for(code, now, ref)
        kids[code] = {'k0_4': round(a), 'k0_14': round(b), 'k0_4_2021': round(k04.get(code, 0)),
                      'k0_14_2021': round(k014.get(code, 0)), 'pop_2021': round(p21.get(code, 0))}
    # ---- amenities against residents and children, every community in the city, and the gap where growth is fast ----
    pop_all = estimate(ref, ALL_RES)
    kids_all = {c: kids_for(c, (pop_all.get(c) or {}).get('model') or 0, ref)[1] for c in ALL_RES}
    asset_data, asset_err = _safe(lambda: assetmap.load(cdir, force=False))
    # against the whole city: only when every community is known (without the ward table the "city" would be the ward)
    amenity_gap = amenity_view(asset_data, RESIDENTIAL_CODES, ALL_RES, pop_all, kids_all, names, amenities) \
        if asset_data and ward_table else None
    # the same amenity levels under each way of counting residents, so the office can see how much the count matters
    f_city = city_factor(ref)
    gap_pops = {}
    for m_key in POP_METHODS:
        pm_, km_ = {}, {}
        for c, v in pop_all.items():
            mod = v.get('growth_model', v.get('model'))
            base = mod if m_key == 'model' else ((v.get('census2021') or 0) * f_city if v.get('census2021') else mod) \
                if m_key == 'city_pace' else (v.get('census2021') or 0)
            # growth and "new since 2021" stay the growth model's: they say whether a community grew, whatever the count
            g_ = v.get('growth_pct') if pop_method == 'model' else (round((v['growth_model'] / v['census2021'] - 1) * 100, 1)
                                                                     if v.get('census2021') and v.get('growth_model') else None)
            pm_[c] = {'model': round(base or 0), 'census2021': v.get('census2021'), 'growth_pct': g_, 'growth_model': mod}
            kf_ = kid_factors(ref) if m_key == 'city_pace' else None
            km_[c] = (kids_at(c, base or 0)[1] if m_key == 'model' or (m_key == 'city_pace' and not v.get('census2021'))
                      else k014.get(c, 0) * (kf_[1] if kf_ else f_city) if m_key == 'city_pace' else k014.get(c, 0))
        gap_pops[m_key] = (pm_, km_)
    if amenity_gap:
        amenity_gap['by_method'] = {}
        for m_key, (pm_, km_) in gap_pops.items():
            sub = amenity_view(asset_data, RESIDENTIAL_CODES, ALL_RES, pm_, km_, names)
            amenity_gap['by_method'][m_key] = {
                'label': POP_METHODS[m_key]['label'], 'level': scope_level(sub),
                'residents': sum(r['residents'] or 0 for r in sub['by_comm']),
                'communities': {r['code']: r['level'] for r in sub['by_comm']},
                'flagged': [r['code'] for r in sub['by_comm'] if r['flag']]}
        amenity_gap['level'] = scope_level(amenity_gap)

    # ---- population month by month since Census day, from the same growth model ----
    series_months, by_comm_series, kid14, kid04 = [], {c: [] for c in RESIDENTIAL_CODES}, [], []
    m = popmodel.CENSUS_DAY.replace(day=1)
    while m <= ref:
        est = estimate(m)
        series_months.append(m.isoformat()[:7])
        t14 = t04 = 0.0
        for c in RESIDENTIAL_CODES:
            v = est.get(c, {}).get('model') or 0
            by_comm_series[c].append(v)
            a, b = kids_for(c, v, m)
            t04 += a
            t14 += b
        kid14.append(round(t14))
        kid04.append(round(t04))
        m = _month_start(m, -1)
    pop_series = {'months': series_months, 'by_comm': by_comm_series, 'children_0_14': kid14, 'children_0_4': kid04,
                  'census': {c: round(p21.get(c, 0)) for c in RESIDENTIAL_CODES},
                  'census_children_0_14': round(sum(k014.get(c, 0) for c in RESIDENTIAL_CODES)),
                  'census_children_0_4': round(sum(k04.get(c, 0) for c in RESIDENTIAL_CODES)),
                  'new_share_0_14': round(new014 * 100, 1), 'new_share_0_4': round(new04 * 100, 1)}
    fam = families.build(cdir, ward_shape, full_shapes, kids, ref, ward=ward, names=names)
    # ---- crime: the Crime Severity Index (Statistics Canada, yearly, city level) ----
    safety, safety_err = _safe(lambda: context.csi(cdir, force=live))
    # ---- crime and disorder by community and ward (Calgary Police Service, monthly) ----
    rentdata, rent_err = _safe(lambda: rents.load(cdir, force=live))
    pdata, police_err = _safe(lambda: police.load(cdir))
    crime = None
    if pdata:
        name_to_code = {' '.join((a.get('name') or '').upper().split()): a['comm_code'] for a in R['areas']}
        residents_now = {c: pop_now.get(c, {}).get('model') or 0 for c in RESIDENTIAL_CODES}
        ps_months = pop_series['months']

        def residents_at(ym):
            # each community's modelled residents in that month (the nearest month the model covers)
            key = f'{ym // 12}-{ym % 12 + 1:02d}'
            if key not in ps_months:
                return residents_now
            i = ps_months.index(key)
            return {c: (pop_series['by_comm'].get(c) or [0] * len(ps_months))[i] or residents_now.get(c, 0)
                    for c in RESIDENTIAL_CODES}
        def city_model_at(ym):
            # Calgary counted the same way as the wards (the growth model over every community), so ward and city
            # rates compare like with like; the City's own estimate is shown with the residents
            when = dt.date(ym // 12, ym % 12 + 1, 15)
            return sum((v.get('model') or 0) for v in estimate(when, ALL_RES).values()) or city_population_at(ym)
        crime, err2 = _safe(lambda: police.summary(pdata, None if city else f'Ward {ward}', name_to_code, residents_at,
                                                   city_model_at if len(ALL_RES) > len(RESIDENTIAL_CODES) or city else city_population_at,
                                                   P['start'], P['end']))
        police_err = police_err or err2

    # ---- outlines: every ward, and the City boundary ----
    wards_all, _ = O['wards_all']
    city_rows, _ = O['city']
    geo_out = {'ward': _simplify(ward_shape, 2), 'communities': shapes,
           'wards': {str(int(_num(w.get('ward_num')))): _simplify(w['multipolygon'], 6)
                     for w in (wards_all or []) if w.get('multipolygon')},
           'city': _simplify(city_rows[0]['multipolygon'], 6) if city_rows and city_rows[0].get('multipolygon') else None}

    # ---- data status: when the City last updated each source, and whether this refresh got it ----
    upd = _dataset_status([SERVICE_REQUESTS, TRAFFIC, PERMITS, DEV_PERMITS, ROADWORK, REC_FACILITIES, TRANSIT_STOPS,
                           PLAYGROUNDS, COMMUNITY_SERVICES,
                           CAMERAS, popmodel.HOMES_DATASET, DISORDER])
    def st(name, ids, ok=True, err=None, note=''):
        when = max((upd.get(i, (None,))[0] or '' for i in ids), default='') or None
        return {'name': name, 'ids': ids, 'city_updated': when, 'fetched': fetched_at, 'ok': ok and not err,
                'error': err, 'note': note, 'page': DATASET_PAGE + ids[0]}
    ferr = ' '.join(fam.get('errors') or [])
    status = [
        st('311 requests', [SERVICE_REQUESTS]),
        st('Traffic incidents', [TRAFFIC]),
        st('Building permits', [PERMITS]),
        st('Development permits', [DEV_PERMITS], err=dp_err),
        st('Road construction projects', [ROADWORK], err=O['roadwork'][1]),
        st('Recreation facilities', [REC_FACILITIES], err=rec_err),
        st('Transit stops', [TRANSIT_STOPS], err=stop_err),
        st('Playgrounds', [PLAYGROUNDS], err=play_err),
        st('Libraries and community centres', [COMMUNITY_SERVICES], err=svc_err),
        {'name': 'Park and City assets (benches, playgrounds, sports, washrooms, parks, trees)', 'ids': list(assetmap.SOURCES.values()),
         'fetched': _when((asset_data or {}).get('counted_utc'), (asset_data or {}).get('counted')), 'city_updated': None,
         'ok': bool(asset_data) and not (asset_data or {}).get('errors'), 'error': asset_err or '; '.join((asset_data or {}).get('errors') or []) or None,
         'note': 'Counted for the whole city once a week', 'page': DATASET_PAGE + 'ikeb-n5bc'},
        st('Traffic cameras', [CAMERAS], note='New image about once a minute'),
        st('Population model (assessments and 2021 Census)', [popmodel.HOMES_DATASET],
           note='Census counts are from 2021'),
        st('Police-reported social disorder', [DISORDER], ok=True,
           note=(f"Public data ends {dt.date.fromisoformat(disorder['data_ends']).day} "
                 f"{dt.date.fromisoformat(disorder['data_ends']).strftime('%b %Y')}") if disorder else 'No data'),
        {'name': 'Crime and disorder by community (Calgary Police Service)', 'ids': [], 'fetched': _when((pdata or {}).get('checked_utc') or (pdata or {}).get('downloaded_utc'), fetched_at if pdata and not police_err else None),
         'city_updated': None, 'published': (crime or {}).get('latest'), 'ok': bool(crime), 'error': police_err,
         'note': 'Monthly, published each quarter', 'page': police.PAGE},
        {'name': 'Rents and vacancy (CMHC Rental Market Survey)', 'ids': [], 'fetched': _when((rentdata or {}).get('fetched_utc'), (rentdata or {}).get('fetched')), 'city_updated': None,
         'published': (rentdata or {}).get('survey'), 'ok': bool(rentdata), 'error': rent_err,
         'note': 'Surveyed each October, published in December or January', 'page': rents.PAGE},
        {'name': 'Crime Severity Index (Statistics Canada)', 'ids': [], 'fetched': _when((safety or {}).get('fetched_utc'), (safety or {}).get('fetched')), 'city_updated': None,
         'published': str(safety['latest_year']) if safety else None, 'ok': bool(safety), 'error': safety_err,
         'note': 'Published yearly, each July. City level', 'page': context.CSI_PAGE},
        {'name': 'Child care (Government of Alberta)', 'ids': [], 'fetched': fetched_at,
         'city_updated': None, 'published': (fam.get('child_care') or {}).get('as_of'),
         'ok': 'child_care' in fam, 'error': ferr if 'child_care' not in fam else None,
         'note': 'Published quarterly', 'page': alberta_pages()[0]},
        {'name': 'School enrolment (Government of Alberta)', 'ids': [], 'fetched': fetched_at,
         'city_updated': None, 'published': (fam.get('schools') or {}).get('latest_year'),
         'ok': 'schools' in fam, 'error': ferr if 'schools' not in fam else None,
         'note': 'Published yearly', 'page': alberta_pages()[1]},
    ]

    # ---- the city view: a summary of each ward, for comparing wards ----
    comm_ward = {c: v['ward'] for c, v in ((ward_table or {}).get('communities') or {}).items()}
    for c in communities:
        c['ward'] = comm_ward.get(c['code'], None if city else ward)
    wards_summary = None
    if city:
        wards_summary = ward_summaries(communities, comm_ward, pop_mid12, pop_midprev, yr12, yrprev, R, O, t12, tprev,
                                       amenities, fam, pdata, P, city_population_at, ward_table,
                                       crime_residents_at=residents_at if pdata else None)
        open_list = []                         # the whole city's open requests are too many to list; each ward lists its own
        if amenity_gap:                        # amenities in each ward, against the city level
            for r in wards_summary['wards']:
                codes_w = [c for c in ALL_RES if comm_ward.get(c) == r['ward']]
                r['amenity_level_by_method'] = {m_key: scope_level(amenity_view(asset_data, codes_w, ALL_RES, pm_, km_, names))
                                                for m_key, (pm_, km_) in gap_pops.items()}
                sub = amenity_view(asset_data, codes_w, ALL_RES, pop_all, kids_all, names)
                r['amenities'] = {k: v['per_1000'] for k, v in sub['scope'].items()}
                # every asset in the ward, counted over all its communities (parks in business areas too)
                byc = asset_data.get('by_comm') or {}
                r['amenity_counts'] = {k: round(sum((byc.get(c) or {}).get(k, 0) for c, w_ in comm_ward.items() if w_ == r['ward']), 1)
                                       for k in sub['scope']}
                r['amenities_vs_city'] = {k: v['vs_city'] for k, v in sub['scope'].items()}
                r['amenity_level'] = scope_level(sub)
                r['amenity_flagged'] = len(sub['flagged'])
            wards_summary['amenity_kinds'] = amenity_gap['kinds']
            wards_summary['pop_methods'] = {k: v['label'] for k, v in POP_METHODS.items()}
            wards_summary['amenities_city'] = {k: v['per_1000'] for k, v in amenity_gap['city'].items()}
            byc = asset_data.get('by_comm') or {}
            wards_summary['amenity_counts_city'] = {k: round(sum((v or {}).get(k, 0) for v in byc.values()), 1)
                                                    for k in amenity_gap['city']}

    sum_ = {
        'requests12': tot('requests12'), 'requests_prev': tot('requests_prev'),
        'requests_change_pct': _pct(tot('requests12') * yr12, tot('requests_prev') * yrprev),
        'requests_per_1000': per1000(tot('requests12', res), mid12_total, yr12),
        'requests_per_1000_prev': per1000(tot('requests_prev', res), midprev_total, yrprev),
        # counts over every community (as 311 requests and the ward table); rates over lived-in communities
        'infra12': tot('infra12'), 'infra_prev': tot('infra_prev'),
        'infra_per_1000': per1000(tot('infra12', res), mid12_total, yr12),
        'infra_per_1000_prev': per1000(tot('infra_prev', res), midprev_total, yrprev),
        'open_now': tot('open'), 'open_over_90_days': tot('open_over_90_days'),
        'open_per_1000': per1000(tot('open', res), residents),
        'closed_7_days_pct': round(int(cw['w7']) / int(cw['n']) * 100, 1) if int(cw.get('n', 0)) else None,
        'closed_7_days_pct_city': round(int(cc['w7']) / int(cc['n']) * 100, 1) if int(cc.get('n', 0)) else None,
        'app_share_pct': app_share(R['channel_ward']), 'app_share_pct_city': app_share(R['channel_city']),
        'traffic12': len(t12), 'traffic_prev': len(tprev),
        'traffic_change_pct': _pct(len(t12) * yr12, len(tprev) * yrprev),
        'new_homes12': tot('new_homes12'), 'new_homes_prev': tot('new_homes_prev'),
        'new_homes_change_pct': _pct(tot('new_homes12') * yr12, tot('new_homes_prev') * yrprev),
        'issued_homes12': tot('issued_homes12'), 'issued_homes_prev': tot('issued_homes_prev'),
        'issued_homes_change_pct': _pct(tot('issued_homes12') * yr12, tot('issued_homes_prev') * yrprev),
    }
    return {
        'version': DATA_VERSION,
        'built_at': fetched_at,
        'period': _label(P['start'], P['end']), 'prev_period': _label(P['cstart'], P['cend']),
        'period_spec': {'kind': P['kind'], 'start': s[:7], 'end': (P['end'] - dt.timedelta(days=1)).isoformat()[:7],
                        'cstart': cs[:7], 'cend': (P['cend'] - dt.timedelta(days=1)).isoformat()[:7],
                        'months': P['months'], 'cmonths': P['cmonths'], 'key': period_key(spec)},
        'ward': {'number': ward, 'councillor': None if city else ward_row.get('councillor'), 'residents': residents,
                 'census2021': census_total, 'growth_pct': _pct(residents, census_total)},
        'scope': {'kind': 'city' if city else 'ward', 'ward': ward, 'name': 'Calgary' if city else f'Ward {ward}',
                  'councillor': None if city else ward_row.get('councillor'),
                  'wards': {k: v for k, v in ((ward_table or {}).get('wards') or {}).items()}},
        'wards_summary': wards_summary,
        'population': {'as_of': ref.isoformat(), 'model_total': residents, 'census_total': census_total,
                       'method': pop_method, 'method_label': POP_METHODS[pop_method]['label'],
                       'method_about': POP_METHODS[pop_method]['about'],
                       'city_now': city_population_at(ref.year * 12 + ref.month - 1), 'city_source': CITY_POP_SOURCE,
                       # the ward today under each way of counting, so the office can compare them
                       'by_method': {
                           'model': sum(v.get('growth_model', v['model']) for k, v in pop_now.items() if k in RESIDENTIAL_CODES),
                           'census2021': census_total,
                           # each community rounded, as the dashboard counts it, so the figures match to the person
                           'city_pace': (pace_fix(ref, city_factor(ref))[1] if pace_fix(ref, city_factor(ref))[0] in RESIDENTIAL_CODES else 0)
                                        + sum(int(round(c['census2021'] * city_factor(ref))) if c['census2021'] else
                                            (pop_now.get(c['code']) or {}).get('growth_model', (pop_now.get(c['code']) or {}).get('model')) or 0
                                            for c in res)},
                       'city_factor': round(city_factor(ref), 4), 'census_city': census_all,
                       'mid_period': mid12_total, 'mid_prev': midprev_total,
                       'homes_now': tot('homes_now', res), 'homes_census': tot('homes_census', res),
                       'sources': {'Current Year Property Assessments (Parcel)': popmodel.HOMES_DATASET,
                                   '2021 Federal Census Population by Community': popmodel.CENSUS_POP_DATASET,
                                   '2021 Federal Census Households by Community': popmodel.CENSUS_HH_DATASET}},
        'summary': sum_,
        'disorder': disorder,
        'families': fam,
        'safety': safety,
        'crime': crime,
        'rents': rents.for_ward(rentdata, [] if city else [names.get(c, c) for c in RESIDENTIAL_CODES],
                                [] if city else [(ward_table or {}).get('communities', {}).get(c, {}).get('sector')
                                                 for c in RESIDENTIAL_CODES]),
        'pop_series': pop_series,
        'profile': ward_profile(ward, cdir, census),
        'development': development,
        'roadwork': roadwork,
        'projects': project_states(city_projects(ward), amenities, fam, ref),
        'big_permits': big_permits,
        'amenities': amenities,
        'amenity_gap': amenity_gap,
        'status': status,
        'communities': communities,
        'open_by_type': sorted(open_types.values(), key=lambda x: -x['n'])[:12],
        'service_areas': service_areas,
        'open_list': open_list,
        'newest': newest,
        'cameras': cameras,
        'camera_page': CAMERA_PAGE,
        'dataset_page': DATASET_PAGE + SERVICE_REQUESTS,
        'trend': {'months': months, 'all': [sum(v for (c, m), v in all_g.items() if m == mo) for mo in months],
                  'prev_months': cmonths, 'prev': [sum(v for (c, m), v in all_g.items() if m == mo) for mo in cmonths]},
        'traffic_points': traffic_points,
        'geo': geo_out,
        'notes': [
            'Residents are counted with ' + POP_METHODS[pop_method]['label'] + ' (chosen in Settings): '
            + POP_METHODS[pop_method]['about'] + ' The 2021 Census count is shown beside it. Rates per 1,000 residents '
            'a year use residents in the middle of each period.',
            'Infrastructure reports are the 21 roads, water and sewer, and parks and trees service types used in the '
            '311 equity study.',
            'The City publishes most 311 requests at their community\'s centre point, not their address, so 311 is '
            'mapped by community, not by street.',
            'Traffic incidents are the City\'s reported incidents with exact locations, inside '
            + ('the City boundary.' if city else f'the Ward {ward} boundary.'),
            'Crime and disorder by community come from the Calgary Police Service community safety data (the data behind '
            'its Community Safety Dashboard), published every quarter by month. Incidents without a location are '
            'left out. The Crime Severity Index (Statistics Canada) compares '
            'Calgary with other cities each year.',
        ],
        'sources': {'311 Service Requests': SERVICE_REQUESTS, 'Traffic Incidents': TRAFFIC, 'Building Permits': PERMITS,
                    'Development Permits': DEV_PERMITS, 'Road Construction Projects': ROADWORK,
                    'Recreation Facilities': REC_FACILITIES, 'Calgary Transit Stops': TRANSIT_STOPS,
                    'Playground Equipment': PLAYGROUNDS, 'Community Services': COMMUNITY_SERVICES,
                    'Social Disorder Statistics': DISORDER, 'Traffic Cameras': CAMERAS,
                    'Property Assessments': popmodel.HOMES_DATASET, 'Parcel Address': families.PARCEL_ADDRESS,
                    'Schools': families.SCHOOLS, '2021 Census by Community': popmodel.CENSUS_POP_DATASET,
                    'Ward Boundaries': WARDS, 'City Boundary': CITY_BOUNDARY,
                    'Community District Boundaries': COMMUNITIES},
    }


GAP_GROWTH_PCT = 20          # communities that grew faster than this since 2021 ...
GAP_LEVEL = 0.75             # ... and have fewer amenities per resident than this share of the city level are flagged
GAP_KINDS = ['playgrounds', 'benches', 'picnic_tables', 'basketball', 'goal_posts', 'fitness', 'washrooms', 'fountains',
             'garbage', 'off_leash', 'local_park_ha', 'trees', 'rec_facilities', 'libraries', 'community_centres',
             'transit_stops']


def scope_level(view):
    """An area's amenity level: its amenities per resident as a share of the city's, averaged over every kind (each
    kind counts at most double). 1.00 = the city level."""
    vals = [min(v['vs_city'], 2.0) for v in (view or {}).get('scope', {}).values() if v.get('vs_city') is not None]
    return round(sum(vals) / len(vals), 2) if vals else None


def amenity_view(asset_data, scope_codes, all_codes, pop_all, kids_all, names, amenities=None):
    """Amenities per 1,000 residents (playgrounds: per 1,000 children aged 0 to 14) in each community of the scope,
    against the whole city, and an amenity level: the community's figures as a share of the city's, averaged over
    every kind (1.0 = the city level). Communities that grew fast and sit well below the city level are flagged."""
    kinds = dict(assetmap.kinds())
    counts = {c: dict(v) for c, v in (asset_data.get('by_comm') or {}).items()}

    def per(code_list, key):
        n = sum((counts.get(c) or {}).get(key, 0) for c in code_list)
        base = sum((kids_all.get(c) or 0) if kinds[key]['per'] == 'children' else ((pop_all.get(c) or {}).get('model') or 0)
                   for c in code_list)
        return n, (n / base * 1000 if base else None)
    use = [k for k in GAP_KINDS if k in kinds]
    city = {}
    for k in use:
        n, r = per(all_codes, k)
        city[k] = {'n': round(n, 1), 'per_1000': round(r, 3) if r is not None else None}
    # neighbourhood amenities: ones the city has enough of for most communities to have some. The rare ones (park
    # washrooms, libraries, recreation centres) serve several communities, so a community without one is not short.
    # (counted from homes, whatever way residents are counted, so the kinds don't change with the setting)
    lived_in = sum(1 for c in all_codes if (pop_all.get(c) or {}).get('growth_model', (pop_all.get(c) or {}).get('model')))
    local = [k for k in use if k.endswith('_ha') or k == 'trees' or city[k]['n'] >= lived_in / 2]
    rows = []
    for code in scope_codes:
        p = pop_all.get(code) or {}
        if (p.get('model') or 0) < MIN_RATE_RESIDENTS:   # a handful of residents: rates per 1,000 mean nothing
            continue
        row = {'code': code, 'name': names.get(code, code), 'residents': p.get('model'), 'census2021': p.get('census2021'),
               # growth since 2021 is the growth model's (homes built) whatever way residents are counted
               'growth_pct': p.get('growth_model_pct', p.get('growth_pct')), 'children_0_14': round(kids_all.get(code) or 0), 'n': {}, 'per_1000': {},
               'vs_city': {}}
        ratios = []
        for k in use:
            n, r = per([code], k)
            row['n'][k] = round(n, 1)
            row['per_1000'][k] = round(r, 3) if r is not None else None
            cr = (city.get(k) or {}).get('per_1000')
            if r is not None and cr:
                v = r / cr
                row['vs_city'][k] = round(v, 2)
                if k in local:
                    ratios.append(min(v, 2.0))       # a big surplus of one thing can't make up for missing others
        row['level'] = round(sum(ratios) / len(ratios), 2) if ratios else None
        row['short'] = [k for k in local if (row['vs_city'].get(k) is not None and row['vs_city'][k] < GAP_LEVEL)]
        row['new'] = not p.get('census2021')                 # built since the 2021 Census: all of it is growth
        row['flag'] = bool(row['level'] is not None and row['level'] < GAP_LEVEL
                           and (row['new'] or (row['growth_pct'] or 0) > GAP_GROWTH_PCT))
        rows.append(row)
    rows.sort(key=lambda r: (not r['flag'], r['level'] if r['level'] is not None else 9))
    tot = {}
    for k in use:
        n, r = per([r['code'] for r in rows], k)
        tot[k] = {'n': round(n, 1), 'per_1000': round(r, 3) if r is not None else None,
                  'vs_city': round(r / city[k]['per_1000'], 2) if r is not None and city[k]['per_1000'] else None}
    return {'kinds': {k: dict(kinds[k], local=k in local) for k in use}, 'city': city, 'scope': tot, 'by_comm': rows,
            'flagged': [r['code'] for r in rows if r['flag']],
            'growth_pct_threshold': GAP_GROWTH_PCT, 'level_threshold': GAP_LEVEL, 'counted': asset_data.get('counted'),
            'note': ('Amenities per 1,000 residents (playgrounds per 1,000 children aged 0 to 14) against the whole city. '
                     'A community\'s amenity level averages its figures as a share of the city\'s (1.00 = the city '
                     'level; any one kind counts at most double) over the neighbourhood amenities, the ones the city has '
                     'enough of for most communities to have some. Park washrooms, drinking fountains, libraries and '
                     'recreation centres serve several communities, so they count in each ward\'s level but not a '
                     'community\'s. Communities that grew more than '
                     f'{GAP_GROWTH_PCT}% since 2021 (or are new since then) and sit below {GAP_LEVEL:.2f} are flagged: amenities have not kept up '
                     'with growth. Counts are City assets in open data; private, school and community association '
                     'facilities are not included.'),
            'method': AMENITY_METHOD}


AMENITY_METHOD = methods.AMENITY_STEPS   # the method, step by step, shown on screen and to the Genie


def ward_summaries(communities, comm_ward, pop_mid12, pop_midprev, yr12, yrprev, R, O, t12, tprev, amenities, fam,
                   pdata, P, city_population_at, ward_table, crime_residents_at=None):
    """One row per ward (and one for Calgary) with the figures the comparison screen sets side by side.
    Rates are per 1,000 residents a year, using each ward's residents in the middle of the period."""
    W = {w: {'ward': w} for w in wardmap.WARD_NUMBERS}
    details = (ward_table or {}).get('wards') or {}
    add = lambda w, k, v: W[w].__setitem__(k, W[w].get(k, 0) + (v or 0)) if w in W else None
    for c in communities:
        w = c.get('ward')
        if w not in W:
            continue
        add(w, 'communities', 1)
        for k in ('requests12', 'requests_prev', 'infra12', 'infra_prev', 'open', 'open_over_90_days', 'new_homes12',
                  'new_homes_prev', 'issued_homes12', 'dev_permits12'):
            add(w, k, c.get(k))
        if c['residential']:
            add(w, 'residential', 1)
            add(w, 'residents', c.get('residents'))
            add(w, 'census2021', c.get('census2021'))
            add(w, 'mid12', (pop_mid12.get(c['code']) or {}).get('model'))
            add(w, 'midprev', (pop_midprev.get(c['code']) or {}).get('model'))
            add(w, 'res_requests12', c.get('requests12'))
            add(w, 'res_requests_prev', c.get('requests_prev'))
            add(w, 'res_infra12', c.get('infra12'))
            add(w, 'res_infra_prev', c.get('infra_prev'))
            add(w, 'res_open', c.get('open'))
    for r in R.get('close_by_comm') or []:
        w = comm_ward.get(r.get('comm_code'))
        add(w, 'closed', int(_num(r.get('n'))))
        add(w, 'closed_w7', int(_num(r.get('w7'))))
    for r in R.get('channel_by_comm') or []:
        w = comm_ward.get(r.get('comm_code'))
        add(w, 'channel_all', int(_num(r.get('n'))))
        if r.get('source') == 'App':
            add(w, 'channel_app', int(_num(r.get('n'))))
    # traffic incidents: placed in wards by their exact location
    wards_all, _ = O.get('wards_all') or (None, None)
    loc = geo.Locator({int(_num(x.get('ward_num'))): x['multipolygon'] for x in (wards_all or []) if x.get('multipolygon')})
    for rows, k in ((t12, 'traffic12'), (tprev, 'traffic_prev')):
        for r in rows:
            add(loc.find(float(r['longitude']), float(r['latitude'])), k, 1)
    # amenities and families, from the community each one is in
    for f in (amenities or {}).get('facilities') or []:
        add(comm_ward.get(f.get('comm')), 'facilities', 1)
    for code, b in ((amenities or {}).get('by_comm') or {}).items():
        add(comm_ward.get(code), 'stops', b.get('stops'))
        add(comm_ward.get(code), 'playgrounds', b.get('playgrounds'))
    cc = (fam or {}).get('child_care') or {}
    for code, b in (cc.get('by_comm') or {}).items():
        w = comm_ward.get(code)
        add(w, 'child_care_spaces', b.get('spaces'))
        add(w, 'children_0_14', b.get('k0_14'))
        add(w, 'children_0_4', b.get('k0_4'))
        add(w, 'daycare_spaces', b.get('daycare'))
    for sch in ((fam or {}).get('schools') or {}).get('schools') or []:
        add(comm_ward.get(sch.get('comm')), 'schools', 1)
        add(comm_ward.get(sch.get('comm')), 'students', sch.get('latest'))
    crime = police.by_ward(pdata, P['start'], P['end']) if pdata else None
    if crime and crime_residents_at and crime.get('mid_ym') is not None:
        for code, n in crime_residents_at(crime['mid_ym']).items():
            add(comm_ward.get(code), 'crime_res', n)
    for label, v in ((crime or {}).get('wards') or {}).items():
        try:
            w = int(str(label).replace('Ward', '').strip())
        except ValueError:
            continue
        add(w, 'crimes', v['n'])
        add(w, 'crimes_prev', v['prev'])
        add(w, 'violent', v['violent'])
        add(w, 'violent_prev', v['violent_prev'])

    def finish(r):
        rate = lambda n, p, f: round(n / p * 1000 * f, 1) if p else None
        r['growth_pct'] = _pct(r.get('residents') or 0, r.get('census2021') or 0) if r.get('census2021') else None
        r['requests_per_1000'] = rate(r.get('res_requests12', 0), r.get('mid12'), yr12)
        r['requests_per_1000_prev'] = rate(r.get('res_requests_prev', 0), r.get('midprev'), yrprev)
        r['infra_per_1000'] = rate(r.get('res_infra12', 0), r.get('mid12'), yr12)
        r['infra_per_1000_prev'] = rate(r.get('res_infra_prev', 0), r.get('midprev'), yrprev)
        r['open_per_1000'] = rate(r.get('res_open', 0), r.get('residents'), 1)
        r['requests_change_pct'] = _pct((r.get('requests12') or 0) * yr12, (r.get('requests_prev') or 0) * yrprev)
        r['closed_7_days_pct'] = round(r['closed_w7'] / r['closed'] * 100, 1) if r.get('closed') else None
        r['app_share_pct'] = round(r.get('channel_app', 0) / r['channel_all'] * 100, 1) if r.get('channel_all') else None
        r['traffic_per_1000'] = rate(r.get('traffic12', 0), r.get('mid12'), yr12)
        r['traffic_change_pct'] = _pct(r.get('traffic12', 0) * yr12, r.get('traffic_prev', 0) * yrprev)
        r['crime_per_1000'] = rate(r.get('crimes', 0), r.get('crime_res') or r.get('mid12'), 12 / ((crime or {}).get('months') or 12)) if crime else None
        r['crime_change_pct'] = _pct(r.get('crimes', 0), r.get('crimes_prev', 0)) if crime else None
        r['violent_change_pct'] = _pct(r.get('violent', 0), r.get('violent_prev', 0)) if crime else None
        r['new_homes_change_pct'] = _pct((r.get('new_homes12') or 0) * yr12, (r.get('new_homes_prev') or 0) * yrprev)
        r['facilities_per_10000'] = round(r.get('facilities', 0) / r['residents'] * 10000, 2) if r.get('residents') else None
        r['playgrounds_per_1000_kids'] = round(r.get('playgrounds', 0) / r['children_0_14'] * 1000, 2) if r.get('children_0_14') else None
        r['stops_per_1000'] = round(r.get('stops', 0) / r['residents'] * 1000, 2) if r.get('residents') else None
        r['child_care_per_100_kids'] = round(r.get('child_care_spaces', 0) / r['children_0_14'] * 100, 1) if r.get('children_0_14') else None
        r['daycare_per_100_0_4'] = round(r.get('daycare_spaces', 0) / r['children_0_4'] * 100, 1) if r.get('children_0_4') else None
        return r
    rows = []
    for w in wardmap.WARD_NUMBERS:
        r = W[w]
        r['councillor'] = (details.get(str(w)) or {}).get('councillor')
        rows.append(finish(r))
    total = {'ward': 0, 'name': 'Calgary'}
    for r in rows:
        for k, v in r.items():
            if isinstance(v, (int, float)) and not k.endswith(('_pct', '_per_1000', '_per_1000_prev', '_per_10000',
                                                                   '_per_1000_kids', '_per_100_kids', '_per_100_0_4')) and k != 'ward':
                total[k] = total.get(k, 0) + v
    finish(total)
    total['amenity_level'] = 1.0                    # the city is the yardstick
    return {'wards': rows, 'city': total, 'crime_period': (crime or {}).get('period'),
            'note': ('Each ward is its communities (the ward holding most of each community\'s area). Rates are per 1,000 '
                     'residents a year, using residents in the middle of the period, counted the way chosen in Settings. Traffic incidents '
                     'are placed by their exact location; crime is the Calgary Police Service figure for each ward.')}


def alberta_pages():
    import alberta
    return alberta.CHILD_CARE_PAGE, alberta.ENROLMENT_PAGE


def _read_cache(cache_file, any_version=False):
    """The saved dashboard, or None. any_version: also accept a copy saved by an older version of the app
    (used only when a refresh fails, so the office still sees the last figures instead of an error)."""
    try:
        with open(cache_file, encoding='utf-8') as f:
            data = json.load(f)
    except (OSError, ValueError):
        return None
    if data.get('version') == DATA_VERSION or (any_version and isinstance(data.get('version'), int) and data['version'] >= 6):
        return data
    return None


def _write_json(path, data):
    """Write to a temporary file first, so closing the app mid-write never leaves a broken file."""
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    tmp = path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f)
    os.replace(tmp, path)


def cache_path(cache_file, spec=None, pop_method='city_pace', ward=WARD):
    key = period_key(spec)
    pop_method = pop_method_ok(pop_method)
    ward = wardmap.ward_ok(ward)
    if pop_method != 'model':
        key = f'{key}_pop-{pop_method}'
    if ward == wardmap.CITY:
        key = f'city_{key}'
    elif ward != WARD:                   # Ward 5 keeps the file names of earlier versions
        key = f'w{ward}_{key}'
    if key == 'last12':
        return cache_file
    base, ext = os.path.splitext(cache_file)
    return f'{base}_{key}{ext}'


def saved(cache_file, spec=None, pop_method='city_pace', ward=WARD):
    """The last saved copy of a view, however old, and its age in hours (None, None if there is none).
    Shown at once when the office switches view, while a fresh copy is built behind it."""
    path = cache_path(cache_file, spec, pop_method, wardmap.ward_ok(ward))
    if not os.path.exists(path):
        return None, None
    data = _read_cache(path)
    return (data, (time.time() - os.path.getmtime(path)) / 3600) if data else (None, None)


def load(cache_file, max_age_hours=6, force=False, spec=None, pop_method='city_pace', ward=WARD):
    """Return the dashboard from cache if fresh, otherwise rebuild it. Each ward, period and way of counting
    residents has its own saved copy."""
    ward = wardmap.ward_ok(ward)
    path = cache_path(cache_file, spec, pop_method, ward)
    if not force and os.path.exists(path) and time.time() - os.path.getmtime(path) < max_age_hours * 3600:
        data = _read_cache(path)
        if data:
            return data
    if force:
        cd.clear_kept()                          # Refresh: ask the City for everything again
    try:
        data = build(cache_dir=os.path.dirname(cache_file), spec=spec, pop_method=pop_method, live=bool(force), ward=ward)
    except PeriodError:
        raise                                    # a period that can't be used: say why
    except Exception:
        data = _read_cache(path, any_version=True)   # offline or a site is down: show the last copy
        if data:
            data['stale'] = True
            return data
        raise
    _write_json(path, data)
    return data
