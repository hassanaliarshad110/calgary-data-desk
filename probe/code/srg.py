"""The City's Suburban Residential Growth (SRG) forecast, put through the growth model and Growth vs amenities.

The City (Growth Analytics, City and Regional Planning) publishes, once a year:
  e7ib-v9n4  Suburban Residential Growth (SRG) Forecast: for each of the seven suburban planning sectors and each
             year, the new homes taken up ("absorbed": built and lived in) in new communities, by kind of home, and the
             people in them. Past years are what happened; the last five are the City's forecast, with a low and a high
             yearly average for each kind of home.
  szyj-edpn  Suburban Residential Growth (SRG) Policy Infrastructure Lines: the growth-related capital projects (water,
             sanitary, storm, mobility) that future suburban homes need, and the area plan each one supports.
  surr-xmvs  Community District Boundaries: each community's planning sector and its SRG class (developing, future,
             complete, established).
  n4vp-3exq  Suburban Residential Growth (SRG) Forecast Map: the City's map of e7ib-v9n4 (no other fields).

What this file adds, the same way for every community:
  1. Each sector's forecast homes and people (the City's figures, unchanged) are shared among the sector's new
     communities (SRG class developing, future or complete) in proportion to the homes each one had built in the last
     five years on the property roll: the forecast follows where building is happening now.
  2. Residents in 2030 = residents today (the way of counting chosen in Settings) + the community's share of the
     forecast people. Children 0 to 14 in 2030 = children today + the new people x the community's own share of
     children today (its sector's, for a community with under 500 residents today).
  3. Growth vs amenities is worked out again with the 2030 residents and children and today's amenities: the same
     two-step catchment (access.crowding) and the same amenity scores (scores.compute), today and in 2030, so the two
     can be compared. Communities outside the forecast keep today's residents, but they share playgrounds, parks and
     centres with growing neighbours, so their figures move too.
  4. A plain reading for each community: becomes crowded, more crowded, already crowded, far from amenities and
     growing, or keeps up.
methods.py explains it in words (growth_forecast); tests/t_srg.py checks the arithmetic.
"""
import datetime as dt
import json
import math
import os
import time
import urllib.request

FORECAST = 'e7ib-v9n4'
INFRA = 'szyj-edpn'
MAP = 'n4vp-3exq'
COMMUNITIES = 'surr-xmvs'
SITE = 'https://calgaryinsight.ca/'
KEEP_DAYS = 7
VERSION = 1
ADDED = '2026-11-06'
NEW_CLASSES = ('DEVELOPING', 'FUTURE', 'COMPLETE')     # the communities the forecast is about (surr-xmvs srg field)
SMALL = 500                 # a community with fewer residents today takes its sector's share of children
TYPES = {'ss': 'Single and semi-detached', 'rt': 'Rows and townhouses', 'ap': 'Apartments'}
SECTOR_NAMES = {'NORTH': 'North', 'NORTHEAST': 'Northeast', 'EAST': 'East', 'SOUTHEAST': 'Southeast', 'SOUTH': 'South',
                'WEST': 'West', 'NORTHWEST': 'Northwest', 'CENTRE': 'Centre'}
SERVICES = {'WATER': 'Water', 'SANITARY': 'Sanitary sewer', 'STORM': 'Storm sewer', 'MOBILITY': 'Roads (mobility)',
            'EMERGENCY RESPONSE': 'Emergency response'}
READINGS = {'becomes_crowded': 'Becomes crowded by 2030', 'more_crowded': 'Already crowded, more so by 2030',
            'crowded': 'Crowded today and in 2030', 'far_growing': 'Far from amenities and growing',
            'keeps_up': 'Keeps up', 'no_score': 'Too few homes to score'}

# every field of the City's datasets, in words (the portal gives the column names only)
FIELDS = {
    FORECAST: {
        'sector': 'Suburban planning sector (North, Northeast, East, Southeast, South, West, Northwest); the Centre has no rows',
        'sector_key': 'Sector and year together, e.g. NORTHEAST-2027 (one row per sector per year)',
        'year': 'Calendar year. Years before the forecast are what happened (homes absorbed); the last five are the forecast',
        'ss_dwell': 'Single and semi-detached homes absorbed (built and lived in) in the sector\'s new communities that year',
        'rt_dwell': 'Rows and townhouses absorbed that year (blank before 2021, when they were counted with the other kinds)',
        'ap_dwell': 'Apartments absorbed that year',
        'total_dwell': 'All new homes absorbed that year (ss + rt + ap)',
        'ss_pop': 'People in the single and semi-detached homes absorbed that year (homes x the City\'s people per home)',
        'rt_pop': 'People in the rows and townhouses absorbed that year',
        'ap_pop': 'People in the apartments absorbed that year',
        'total_pop': 'People in all new homes absorbed that year',
        'ss_5_year_avg_low': 'Low end of the forecast\'s yearly average of single and semi-detached homes over the five forecast years (on the first forecast year\'s row)',
        'ss_5_year_avg_high': 'High end of the same yearly average',
        'rt_5_year_avg_low': 'Low end of the forecast\'s yearly average of rows and townhouses',
        'rt_5_year_avg_high': 'High end of the same yearly average',
        'ap_5_year_avg_low': 'Low end of the forecast\'s yearly average of apartments',
        'ap_5_year_avg_high': 'High end of the same yearly average',
        'multipolygon': 'The sector\'s outline (the new-community area the forecast covers)',
        'shape_area': 'Area of the outline, in the map\'s units', 'shape_length': 'Perimeter of the outline, in the map\'s units',
        'objectid': 'Row number in the City\'s system', 'globalid': 'Row ID in the City\'s system', 'globalid_guid': 'Row ID (GUID form)',
        'create_dt_local': 'When the row was created', 'mod_dt_local': 'When the row was last changed (the forecast\'s edition date)'},
    INFRA: {
        'label': 'The capital project, e.g. "Belvedere Feedermain Ph 1"',
        'service': 'Water, sanitary sewer, storm sewer or mobility (roads); emergency response where listed',
        'type': 'Kind of project: feedermain, trunk, road widening, overpass, skeletal road',
        'pol_name': 'The area structure plan (policy) the project supports; a project that supports several plans has one row for each',
        'multilinestring': 'Where the project runs, as a line',
        'globalid': 'Row ID in the City\'s system', 'create_dt_local': 'When the row was created',
        'mod_dt_local': 'When the row was last changed'},
    COMMUNITIES: {
        'sector': 'The community\'s planning sector', 'srg': 'Its Suburban Residential Growth class: DEVELOPING (being '
        'built), FUTURE (planned, building not yet or just started), COMPLETE (built out), ESTABLISHED (older), N/A',
        'comm_structure': 'When it was built (1950s ... 2020s), BUILDING OUT, INNER CITY, EMPLOYMENT, UNDEVELOPED',
        'class': 'Residential, Industrial, Major Park or Residual Sub Area'},
}
LIMITS = [
    'The forecast is the City\'s, for new communities only (its seven suburban sectors); growth in established '
    'communities (infill, redevelopment) is not in it and is not added here.',
    'The City forecasts by sector, not by community. Each sector\'s figure is shared among its new communities by the '
    'homes built there in the last five years: a community just opening up (or one about to run out of land) will get '
    'more (or less) than this share.',
    'The forecast\'s 2026 homes are added in full; homes built early in 2026 may already be in today\'s count.',
    'Amenities in 2030 are shown two ways: today\'s only (nothing new opens), and today\'s plus what is already planned: '
    'park land zoned as reserve in new communities that is not yet a City park, and libraries, recreation centres and '
    'community centres being built and due by 2030. Planned playgrounds and new transit stops are not in any published '
    'list, so they are not added; a reserve may hold a school as well as a park.',
    'New residents are spread over a community\'s homes like today\'s residents: new homes on the growing edge are often '
    'farther from amenities than the community\'s average, so 2030 crowding there may be worse than shown.',
    'Children: the community\'s share of children today, applied to its new residents.',
]


def _num(v):
    try:
        return None if v in (None, '') else float(v)
    except (TypeError, ValueError):
        return None


def _km(line):
    """Length of a multilinestring (GeoJSON-like dict from the portal), in km."""
    tot = 0.0
    try:
        for part in (line or {}).get('coordinates') or []:
            for (x1, y1), (x2, y2) in zip(part, part[1:]):
                p1, p2 = math.radians(y1), math.radians(y2)
                a = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(x2 - x1) / 2) ** 2
                tot += 2 * 6371.0 * math.asin(min(1.0, math.sqrt(a)))
    except (TypeError, ValueError):
        return None
    return round(tot, 2)


# ---------------------------------------------------------------------------------------------- reading the data
def fetch():
    """The three City datasets, as published (the website build)."""
    import calgary_data as cd                           # noqa: PLC0415
    keep = ','.join(k for k in FIELDS[FORECAST] if k not in ('multipolygon', 'shape_area', 'shape_length', 'globalid_guid'))
    rows = cd.query(FORECAST, select=keep, order='sector, year', limit=5000)
    infra = cd.query(INFRA, select='label,service,type,pol_name,mod_dt_local,multilinestring', limit=5000)
    comms = cd.query(COMMUNITIES, select='comm_code,name,class,sector,srg,comm_structure', limit=1000)
    return {'version': VERSION, 'read_at': dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'rows': rows,
            'infra': [{**{k: r.get(k) for k in ('label', 'service', 'type', 'pol_name', 'mod_dt_local')},
                       'km': _km(r.get('multilinestring'))} for r in infra],
            'communities': comms}


def load(cache_dir, force=False):
    """This week's copy; else read again; else the copy the website published; else last week's."""
    path = os.path.join(cache_dir or '.', 'srg', 'raw.json')
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
            with urllib.request.urlopen(SITE + 'data/srg_raw.json', timeout=60) as r:
                raw = json.loads(r.read().decode('utf-8'))
        except Exception:                               # noqa: BLE001
            raw = None
    if raw and raw.get('rows'):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path + '.tmp', 'w', encoding='utf-8') as f:
            json.dump(raw, f, separators=(',', ':'))
        os.replace(path + '.tmp', path)
        return raw
    if os.path.exists(path):
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    return None


# ---------------------------------------------------------------------------------------------- the City's figures
def sectors(raw):
    """Each sector, year by year, as the City publishes it; which years are forecast; the forecast's totals and range."""
    by = {}
    for r in raw['rows']:
        s, y = (r.get('sector') or '').upper(), _num(r.get('year'))
        if not s or y is None:
            continue
        by.setdefault(s, {})[int(y)] = r
    first = None                                            # the forecast starts on the row carrying the averages
    for s, ys in by.items():
        for y, r in ys.items():
            if any(_num(r.get(f'{t}_5_year_avg_low')) is not None for t in TYPES):
                first = y if first is None else min(first, y)
    years = sorted({y for ys in by.values() for y in ys})
    if first is None:
        first = years[-5] if len(years) >= 5 else years[-1]
    last = years[-1]
    edition = max((r.get('mod_dt_local') or '')[:10] for r in raw['rows'])
    out = []
    for s in sorted(by, key=lambda x: list(SECTOR_NAMES).index(x) if x in SECTOR_NAMES else 99):
        ys = by[s]
        series = []
        for y in years:
            r = ys.get(y) or {}
            series.append({'year': y, 'forecast': y >= first,
                           **{f'{t}_homes': _num(r.get(f'{t}_dwell')) for t in TYPES},
                           'homes': _num(r.get('total_dwell')),
                           **{f'{t}_people': _num(r.get(f'{t}_pop')) for t in TYPES},
                           'people': _num(r.get('total_pop'))})
        fc = [x for x in series if x['forecast']]
        past5 = [x for x in series if first - 5 <= x['year'] < first]
        r0 = ys.get(first) or {}
        rng = {t: [_num(r0.get(f'{t}_5_year_avg_low')), _num(r0.get(f'{t}_5_year_avg_high'))] for t in TYPES}
        n = len(fc)
        homes = sum(x['homes'] or 0 for x in fc)
        people = sum(x['people'] or 0 for x in fc)
        low = sum(v[0] for v in rng.values() if v[0] is not None) * n if any(v[0] is not None for v in rng.values()) else None
        high = sum(v[1] for v in rng.values() if v[1] is not None) * n if any(v[1] is not None for v in rng.values()) else None
        ppl_per = people / homes if homes else None
        out.append({'sector': s, 'name': SECTOR_NAMES.get(s, s.title()), 'series': series,
                    'forecast_homes': round(homes), 'forecast_people': round(people),
                    'forecast_by_type': {t: round(sum(x[f'{t}_homes'] or 0 for x in fc)) for t in TYPES},
                    'yearly_average_range': rng,
                    'forecast_homes_low': None if low is None else round(low),
                    'forecast_homes_high': None if high is None else round(high),
                    'forecast_people_low': None if low is None or not ppl_per else round(low * ppl_per),
                    'forecast_people_high': None if high is None or not ppl_per else round(high * ppl_per),
                    'people_per_home': None if not ppl_per else round(ppl_per, 3),
                    'past5_homes': round(sum(x['homes'] or 0 for x in past5)),
                    'past5_people': round(sum(x['people'] or 0 for x in past5)),
                    'apartment_share_forecast': round(sum(x['ap_homes'] or 0 for x in fc) / homes, 3) if homes else None})
    tot_h = sum(s['forecast_homes'] for s in out)
    for s in out:
        s['share_of_forecast'] = round(s['forecast_homes'] / tot_h, 4) if tot_h else None
    city_series = []
    for i, y in enumerate(years):
        row = {'year': y, 'forecast': y >= first}
        for f in ('homes', 'people', *[f'{t}_homes' for t in TYPES]):
            row[f] = round(sum((s['series'][i][f] or 0) for s in out))
        city_series.append(row)
    city = {'forecast_homes': tot_h, 'forecast_people': sum(s['forecast_people'] for s in out),
            'forecast_homes_low': sum(s['forecast_homes_low'] or 0 for s in out),
            'forecast_homes_high': sum(s['forecast_homes_high'] or 0 for s in out),
            'forecast_people_low': sum(s['forecast_people_low'] or 0 for s in out),
            'forecast_people_high': sum(s['forecast_people_high'] or 0 for s in out),
            'forecast_by_type': {t: sum(s['forecast_by_type'][t] for s in out) for t in TYPES},
            'past5_homes': sum(s['past5_homes'] for s in out), 'past5_people': sum(s['past5_people'] for s in out),
            'series': city_series}
    return {'first_forecast_year': first, 'last_year': last, 'first_year': years[0], 'edition': edition,
            'sectors': out, 'city': city}


def infrastructure(raw):
    """The growth-related projects, one row each (with every plan it supports), grouped by service."""
    by = {}
    for r in raw.get('infra') or []:
        key = (r.get('label') or '').strip()
        if not key:
            continue
        e = by.setdefault(key, {'project': key, 'service': SERVICES.get((r.get('service') or '').upper(), (r.get('service') or '').title()),
                                'type': (r.get('type') or '').title(), 'plans': [], 'km': r.get('km')})
        p = (r.get('pol_name') or '').strip()
        if p and p not in e['plans']:
            e['plans'].append(p)
        if r.get('km') and (e['km'] or 0) < r['km']:
            e['km'] = r['km']
    rows = sorted(by.values(), key=lambda x: (x['service'], x['project']))
    plans = {}
    for x in rows:
        for p in x['plans']:
            plans.setdefault(p, []).append(x['project'])
    return {'projects': rows, 'by_plan': {p: sorted(v) for p, v in sorted(plans.items())},
            'by_service': {s: sum(1 for x in rows if x['service'] == s) for s in sorted({x['service'] for x in rows})},
            'rows_published': len(raw.get('infra') or [])}


# ---------------------------------------------------------------------------------------------- shared to communities
def allocate(sec, comm_rows, base):
    """Each sector's forecast shared among its new communities by the homes built in the last five years."""
    recent = {c: (v.get('units_recent') or 0.0) for c, v in (base or {}).get('comm', {}).items()}
    info = {}
    for r in comm_rows:
        code = r.get('comm_code')
        if code:
            info[code] = {'name': r.get('name'), 'sector': (r.get('sector') or '').upper(), 'srg': (r.get('srg') or '').upper(),
                          'structure': r.get('comm_structure'), 'class': r.get('class')}
    out = {}
    for s in sec['sectors']:
        pool = [c for c, v in info.items() if v['sector'] == s['sector'] and v['srg'] in NEW_CLASSES]
        tot = sum(recent.get(c, 0.0) for c in pool)
        for c in pool:
            share = recent.get(c, 0.0) / tot if tot else (1.0 / len(pool) if pool else 0.0)
            out[c] = {'sector': s['sector'], 'srg': info[c]['srg'], 'structure': info[c]['structure'],
                      'recent_homes': round(recent.get(c, 0.0), 1), 'share': round(share, 4),
                      'homes': round(s['forecast_homes'] * share, 1), 'people': round(s['forecast_people'] * share, 1),
                      'homes_low': None if s['forecast_homes_low'] is None else round(s['forecast_homes_low'] * share, 1),
                      'homes_high': None if s['forecast_homes_high'] is None else round(s['forecast_homes_high'] * share, 1),
                      'people_low': None if s['forecast_people_low'] is None else round(s['forecast_people_low'] * share, 1),
                      'people_high': None if s['forecast_people_high'] is None else round(s['forecast_people_high'] * share, 1)}
    return out, info


def future_people(alloc, info, pops, kids):
    """Residents and children in 2030 for every community (unchanged where the forecast adds nobody)."""
    sec_ratio = {}
    for c, a in alloc.items():
        p, k = pops.get(c) or 0, kids.get(c) or 0
        t = sec_ratio.setdefault(a['sector'], [0.0, 0.0])
        t[0] += p
        t[1] += k
    p30, k30, ratio = dict(pops), dict(kids), {}
    for c, a in alloc.items():
        p, k = pops.get(c) or 0, kids.get(c) or 0
        sp, sk = sec_ratio.get(a['sector'], [0, 0])
        r = (k / p) if p >= SMALL else (sk / sp if sp else 0.2)
        ratio[c] = round(r, 4)
        p30[c] = p + a['people']
        k30[c] = k + a['people'] * r
    return p30, k30, ratio


def _crowd(base, pops, kids):
    """Crowding for all six amenities at the shorter distance, every community and Calgary (access.crowding)."""
    import access                                       # noqa: PLC0415
    units = {c: v['units'] for c, v in base['comm'].items()}
    out = {}
    for key in access.CROWD_ALL:
        if key not in (base.get('catch') or {}):
            continue
        cr = access.KINDS[key]['crowding_spec']
        src = kids if cr['people'] == 'children' else pops
        per_unit = {c: float(src.get(c) or 0) / units[c] for c in units if units[c]}
        r = access.KINDS[key]['thresholds_m'][0]
        f, ppl, _ = access.crowding(base['catch'][key][str(r)], per_unit, units, float(cr['per']))
        out[key] = {'by': f, 'calgary': access.average(f, ppl, list(units)), 'distance_m': r}
    return out


def _scores(base, pops, kids, by_ward, yardstick=None):
    """Amenity scores (scores.compute). yardstick: today's crowding figures; when given, every 2030 figure is scored
    against Calgary (and each ward) TODAY, so a score falls only where crowding itself gets worse."""
    import access                                       # noqa: PLC0415
    import scores                                       # noqa: PLC0415
    if any(k not in (base.get('catch') or {}) for k in access.CROWD_ALL):
        return {}, None
    crowd = access.crowding_inputs(base, {'f': (pops, kids)}, by_ward, default='f')
    if yardstick:
        for k, kc in crowd['kinds'].items():
            for d, by in kc['by_option']['f'].items():
                ref = yardstick['kinds'][k]['by_option']['f'][d]
                for key in list(by):
                    if key == '_all' or (key.startswith('W') and key[1:].isdigit()):
                        by[key] = ref.get(key)
    kinds_cfg = {k: {'thresholds_m': access.KINDS[k]['thresholds_m'], 'group': access.KINDS[k]['group']}
                 for k in base['kinds'] if k in access.KINDS}
    eligible = [c for c, v in base['comm'].items() if v['units'] >= access.RULES['min_units']]
    return scores.compute(crowd, kinds_cfg, eligible)['areas'], crowd


def with_planned(base, planned):
    """The base figures with the planned park land and facilities added to the catchments (planned.py)."""
    if not planned or not planned.get('catch'):
        return None
    catch = {}
    for k, by in (base.get('catch') or {}).items():
        extra = (planned['catch'].get(k) or {})
        catch[k] = {r: list(rows) + list(extra.get(r) or []) for r, rows in by.items()}
    return {**base, 'catch': catch}


def reading(now, then, growing, far):
    """The plain reading for one community: the band of its local amenities score (playgrounds, parks, transit stops,
    community centres) today and in 2030, both against Calgary today."""
    order = {'well_below': 0, 'below': 1, 'around': 2, 'above': 3}
    if not now or not then or now.get('band') is None or then.get('band') is None:
        return 'no_score'
    a, b = order[now['band']], order[then['band']]
    if a >= 2 and b <= 1:
        return 'becomes_crowded'
    if a <= 1 and (b < a or (then['score'] or 0) <= 0.9 * (now['score'] or 0)):
        return 'more_crowded'
    if a <= 1:
        return 'crowded'
    if growing and far:
        return 'far_growing'
    return 'keeps_up'


def view(raw, base, pops, kids, scope_codes, ward_of, names, method_label='', planned=None):
    """Everything the Forecast to 2030 screen and Data Genie show, for one area (a ward, or Calgary)."""
    if not raw or not raw.get('rows'):
        return None
    import access                                       # noqa: PLC0415
    sec = sectors(raw)
    inf = infrastructure(raw)
    out = {'version': VERSION, 'added': ADDED, 'edition': sec['edition'], 'read_at': raw.get('read_at'),
           'first_forecast_year': sec['first_forecast_year'], 'last_year': sec['last_year'], 'first_year': sec['first_year'],
           'sectors': sec['sectors'], 'city': sec['city'], 'infrastructure': inf, 'types': TYPES,
           'readings': READINGS, 'limits': LIMITS, 'fields': FIELDS, 'method': method_label,
           'datasets': {FORECAST: 'Suburban Residential Growth (SRG) Forecast', INFRA: 'Suburban Residential Growth (SRG) Policy '
                        'Infrastructure Lines', COMMUNITIES: 'Community District Boundaries (sector, SRG class)',
                        MAP: 'Suburban Residential Growth (SRG) Forecast Map'}}
    if not base or not base.get('comm'):
        out['communities'] = []
        return out
    alloc, info = allocate(sec, raw.get('communities') or [], base)
    p30, k30, ratio = future_people(alloc, info, pops, kids)
    by_ward = {}
    for c in base['comm']:
        if ward_of.get(c):
            by_ward.setdefault(int(ward_of[c]), []).append(c)
    cr_now, cr_30 = _crowd(base, pops, kids), _crowd(base, p30, k30)
    sc_now, yard = _scores(base, pops, kids, by_ward)
    sc_30, _ = _scores(base, p30, k30, by_ward, yardstick=yard)
    base_p = with_planned(base, planned)
    cr_p = _crowd(base_p, p30, k30) if base_p else None
    sc_p = _scores(base_p, p30, k30, by_ward, yardstick=yard)[0] if base_p else None
    pl_by = (planned or {}).get('parks_by_comm') or {}
    pl_fac = (planned or {}).get('facilities') or []
    out['calgary_crowding'] = {k: {'now': None if v['calgary'] is None else round(v['calgary'], 3),
                                   'then': None if cr_30[k]['calgary'] is None else round(cr_30[k]['calgary'], 3),
                                   'planned': None if not cr_p or cr_p[k]['calgary'] is None else round(cr_p[k]['calgary'], 3),
                                   'distance_m': v['distance_m'], 'unit': access.KINDS[k]['crowding_spec']['short']}
                               for k, v in cr_now.items()}
    out['kinds'] = {k: access.KINDS[k]['label'] for k in cr_now}
    shown = set(scope_codes)
    local = ('playground', 'park', 'transit_stop')
    rows = []
    for c in sorted(set(alloc) | {c for c in shown if c in base['comm']}):
        a = alloc.get(c)
        moved = False
        if c not in alloc:
            bands = lambda sc: {g: (((sc.get(c) or {}).get('groups') or {}).get(g) or {}).get('band') for g in ('local', 'district')}
            moved = bands(sc_now) != bands(sc_p if sc_p else sc_30)
        if c not in shown or (not a and not moved) or (a and a['homes'] < 1 and not moved):
            continue
        st = (base['comm'].get(c) or {}).get('access') or {}
        far = [k for k in local if k in st and st[k].get('units') and access.reading(st[k]) in ('gap', 'gap_check')]
        g_now, g_30 = (sc_now.get(c) or {}).get('groups') or {}, (sc_30.get(c) or {}).get('groups') or {}
        g_p = ((sc_p or {}).get(c) or {}).get('groups') or {}
        o, n = g_now.get('local'), (g_p if sc_p else g_30).get('local')   # the reading: local amenities, with what is planned
        p_now, p_then = pops.get(c) or 0, p30.get(c) or 0
        growing = bool(a and p_now and a['people'] / max(p_now, 1) >= 0.10) or bool(a and not p_now and a['people'] > 0)
        crowd = {k: {'now': None if cr_now[k]['by'].get(c) is None else round(cr_now[k]['by'][c], 3),
                     'then': None if cr_30[k]['by'].get(c) is None else round(cr_30[k]['by'][c], 3),
                     'planned': None if not cr_p or cr_p[k]['by'].get(c) is None else round(cr_p[k]['by'][c], 3)}
                 for k in cr_now}
        am_now = (sc_now.get(c) or {}).get('amenities') or {}
        am_30 = ((sc_p if sc_p else sc_30).get(c) or {}).get('amenities') or {}
        falls = [k for k in am_30 if (am_30[k] or {}).get('band') in ('below', 'well_below')
                 and (am_now.get(k) or {}).get('band') not in ('below', 'well_below')]
        rows.append({'code': c, 'name': names.get(c, (info.get(c) or {}).get('name') or c), 'ward': ward_of.get(c),
                     'sector': (a or {}).get('sector') or (info.get(c) or {}).get('sector'),
                     'srg': (a or {}).get('srg') or (info.get(c) or {}).get('srg'),
                     'structure': (info.get(c) or {}).get('structure'), 'in_forecast': bool(a),
                     'recent_homes': (a or {}).get('recent_homes'), 'share_of_sector': (a or {}).get('share'),
                     'forecast_homes': (a or {}).get('homes', 0.0), 'forecast_people': (a or {}).get('people', 0.0),
                     'forecast_homes_low': (a or {}).get('homes_low'), 'forecast_homes_high': (a or {}).get('homes_high'),
                     'forecast_people_low': (a or {}).get('people_low'), 'forecast_people_high': (a or {}).get('people_high'),
                     'homes_today': round((base['comm'].get(c) or {}).get('units') or 0, 1),
                     'residents_now': round(p_now), 'residents_2030': round(p_then),
                     'growth_pct': round(100 * (p_then - p_now) / p_now, 1) if p_now else None,
                     'children_now': round(kids.get(c) or 0), 'children_2030': round(k30.get(c) or 0),
                     'children_share_used': ratio.get(c),
                     'crowding': crowd,
                     'scores': {g: {'now': (g_now.get(g) or {}).get('score'), 'band_now': (g_now.get(g) or {}).get('band'),
                                    'then': (g_30.get(g) or {}).get('score'), 'band_then': (g_30.get(g) or {}).get('band'),
                                    'planned': (g_p.get(g) or {}).get('score') if sc_p else None,
                                    'band_planned': (g_p.get(g) or {}).get('band') if sc_p else None}
                                for g in ('local', 'district')},
                     'planned_park_ha': (pl_by.get(c) or {}).get('reserve_ha'),
                     'planned_park_by_zone': (pl_by.get(c) or {}).get('by_zone'),
                     'planned_facilities': [{k: f[k] for k in ('title', 'kind', 'opens', 'url')} for f in pl_fac if f.get('comm') == c],
                     'reading_nothing_new': reading(o, g_30.get('local'), growing, bool(far)) if sc_p else None,
                     'falls_below': falls, 'far_from': far,
                     'reading': reading(o, n, growing, bool(far))})
    rank = {'becomes_crowded': 0, 'more_crowded': 1, 'far_growing': 2, 'crowded': 3, 'keeps_up': 4, 'no_score': 5}
    rows.sort(key=lambda r: (rank.get(r['reading'], 9), -(r['forecast_people'] or 0)))
    out['communities'] = rows
    out['counts'] = {k: sum(1 for r in rows if r['reading'] == k) for k in READINGS}
    if planned:
        out['planned'] = {'built_at': planned.get('built_at'), 'zones': planned.get('zones'), 'rules': planned.get('rules'),
                          'facilities': pl_fac,
                          'park_ha': round(sum(p['ha'] for p in planned.get('parks') or []), 1),
                          'park_ha_scope': round(sum((pl_by.get(c) or {}).get('reserve_ha') or 0 for c in shown), 1),
                          'park_polygons': len(planned.get('parks') or []),
                          'park_ha_by_zone': {z: round(sum(p['ha'] for p in planned.get('parks') or [] if p['zone'] == z), 1)
                                              for z in (planned.get('zones') or {})}}
    scope_alloc = [c for c in alloc if c in shown]
    out['scope'] = {'forecast_homes': round(sum(alloc[c]['homes'] for c in scope_alloc)),
                    'forecast_people': round(sum(alloc[c]['people'] for c in scope_alloc)),
                    'residents_now': round(sum(pops.get(c) or 0 for c in shown)),
                    'residents_2030': round(sum(p30.get(c) or 0 for c in shown)),
                    'communities_in_forecast': len(scope_alloc)}
    out['allocation_check'] = {s['sector']: {'city': s['forecast_homes'],
                                             'shared': round(sum(a['homes'] for a in alloc.values() if a['sector'] == s['sector']))}
                               for s in sec['sectors']}
    return out


def raw_for_site(raw):
    """The copy the website publishes (data/srg_raw.json), for Data Genie and the desktop app."""
    return raw
