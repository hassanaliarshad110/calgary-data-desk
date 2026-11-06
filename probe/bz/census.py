"""Which federal Census the app counts from: the newest one the City has published by community.

The City of Calgary publishes each federal Census by community, by ward and for the whole city as open data tables
named "<year> Federal Census Population and Dwellings by Community" and so on. Once a week the app searches the
City's catalogue for those tables. When a newer Census than 2021 appears (the 2026 Census, expected from 2027), and its
tables have the columns the app reads, the app switches to it on its own: the growth model starts from the new Census
day, rates and "growth since" use it, and every label names the new year. Until then it stays on 2021.
"""
import datetime as dt
import json
import os
import re
import time
import urllib.parse

import calgary_data as cd

KEEP_DAYS = 7
# Census day of each federal Census (Statistics Canada): the model counts homes lived in on this day
CENSUS_DAYS = {2021: dt.date(2021, 5, 11), 2026: dt.date(2026, 5, 12), 2031: dt.date(2031, 5, 13)}
BASE_2021 = {
    'year': 2021, 'day': '2021-05-11',
    'community_pop': 'f9wk-wej9', 'community_hh': 'msjx-5ygv',
    'ward_pop': 'k4pr-cznc', 'ward_hh': 'jzfi-qvb4', 'ward_work': 'b5q8-82zn',
    'city_pop': 'fm6w-acnx', 'city_hh': 'u75s-8rqc', 'city_work': '8w7b-2yqx',
}
# table kind: (words in the City's dataset name, columns the app needs)
TABLES = {
    'community_pop': ('Federal Census Population and Dwellings by Community',
                      ('community_code', 'total_pop_household', 'pop_age_0_to_4', 'pop_age_0_to_14')),
    'community_hh': ('Federal Census Families and Households by Community',
                     ('community_code', 'total_private_households', 'avg_household_size')),
    'ward_pop': ('Federal Census Population and Dwellings by Ward', ('ward_number', 'total_pop_household', 'pop_age_0_to_14')),
    'ward_hh': ('Federal Census Families and Households by Ward', ('ward_number', 'total_private_households')),
    'ward_work': ('Federal Census Employment by Ward', ('ward_number', 'in_labour_force')),
    'city_pop': ('Federal Census Population and Dwellings by City', ('total_pop_household',)),
    'city_hh': ('Federal Census Families and Households by City', ('total_private_households',)),
    'city_work': ('Federal Census Employment by City', ('in_labour_force',)),
}


def _search(words):
    url = f'{cd.BASE}/api/catalog/v1?' + urllib.parse.urlencode({
        'domains': 'data.calgary.ca', 'search_context': 'data.calgary.ca', 'q': words, 'limit': 20})
    return [(r['resource']['id'], r['resource']['name']) for r in (cd.get_json(url).get('results') or [])]


def _has_columns(dataset_id, needed):
    try:
        rows = cd.query(dataset_id, limit=1)
    except cd.DataError:
        return False
    return bool(rows) and all(k in rows[0] for k in needed)


def discover():
    """The newest Census year with every community table published and readable; its dataset IDs."""
    found = {}                                  # year -> {kind: id}
    for kind, (words, _) in TABLES.items():
        for ds_id, name in _search(words):
            m = re.match(r'^(\d{4}) ' + re.escape(words) + r'\s*$', name.strip(), re.I)
            if m and int(m.group(1)) > 2021:
                found.setdefault(int(m.group(1)), {})[kind] = ds_id
    for year in sorted(found, reverse=True):
        ids = found[year]
        if year not in CENSUS_DAYS or not all(k in ids for k in ('community_pop', 'community_hh')):
            continue                            # the growth model needs both community tables
        if not all(_has_columns(ids[k], TABLES[k][1]) for k in ('community_pop', 'community_hh')):
            continue                            # published, but laid out differently: stay on the last one that works
        base = dict(BASE_2021, **{k: v for k, v in ids.items() if _has_columns(v, TABLES[k][1])})
        base.update(year=year, day=CENSUS_DAYS[year].isoformat())
        return base, sorted(found)
    return dict(BASE_2021), sorted(found)


def load(cache_dir, force=False):
    """The Census to count from, checked against the City's catalogue once a week (2021 if it can't be checked)."""
    path = os.path.join(cache_dir, 'census_latest.json')
    if not force and os.path.exists(path) and time.time() - os.path.getmtime(path) < KEEP_DAYS * 86400:
        try:
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        except (OSError, ValueError):
            pass
    try:
        base, seen = discover()
        base['newer_seen'] = seen
        base['checked'] = time.strftime('%Y-%m-%d')
    except Exception:                           # noqa: BLE001 - offline: the last answer, or 2021
        if os.path.exists(path):
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        return dict(BASE_2021, checked=None, newer_seen=[])
    os.makedirs(cache_dir, exist_ok=True)
    with open(path + '.tmp', 'w', encoding='utf-8') as f:
        json.dump(base, f)
    os.replace(path + '.tmp', path)
    return base


def relabel(obj, year):
    """Every "2021 Census" / "since 2021" in the app's text, for the Census in use (nothing changes for 2021)."""
    if year == 2021:
        return obj
    y = str(year)
    if isinstance(obj, str):
        return (obj.replace('2021 Census', y + ' Census').replace('since 2021', 'since ' + y)
                .replace('Census (May 2021)', f'Census (May {y})').replace('2021 ward boundaries', y + ' ward boundaries'))
    if isinstance(obj, list):
        return [relabel(x, year) for x in obj]
    if isinstance(obj, dict):
        return {(relabel(k, year) if isinstance(k, str) else k): relabel(v, year) for k, v in obj.items()}
    return obj
