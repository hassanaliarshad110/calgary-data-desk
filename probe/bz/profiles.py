"""Who lives in each ward: the 2021 Census by ward, read live from the City of Calgary's open data.

Three ward tables (population and ages, families and households, work) and the same three for the whole city. Ward 5
also has the City's full printed ward profile (languages, newcomers, housing costs, income) kept with the app; the
other wards get the figures these open tables hold. The Census does not change until the 2026 results are out, so
the tables are kept for a week.
"""
import json
import os
import time

import calgary_data as cd

KEEP_DAYS = 7
TABLES = {  # ward table, city table, fields
    'pop': ('k4pr-cznc', 'fm6w-acnx', 'total_pop_household,pop_age_0_to_14,pop_age_0_to_4,pop_age_65_to_84,pop_age_85_and_over'),
    'hh': ('jzfi-qvb4', 'u75s-8rqc', 'total_private_households,avg_household_size,house_size_1_person,house_size_5_plus_persons,'
                                     'total_census_families,one_parent_families'),
    'work': ('b5q8-82zn', '8w7b-2yqx', 'total_pop_over_15_household,in_labour_force,unemployed,self_employed,top_1_industry,'
                                       'top_1_industry_pop,top_1_industry_per,top_2_industry,top_2_industry_pop,top_2_industry_per,top_3_industry,'
                                       'top_3_industry_pop,top_3_industry_per'),
}
PAGE = 'https://www.calgary.ca/communities/profiles/wards.html'


def _ids(census, key):
    """The ward and city table for one topic, for the Census in use (census.py), else the 2021 tables."""
    w, c, _ = TABLES[key]
    census = census or {}
    return census.get('ward_' + key, w), census.get('city_' + key, c)


def _fetch(census=None):
    out = {'year': int((census or {}).get('year') or 2021)}
    for key, (_, _, fields) in TABLES.items():
        ward_id, city_id = _ids(census, key)
        out[key] = {'wards': cd.query(ward_id, select='ward_number,' + fields, limit=50),
                    'city': cd.query(city_id, select=fields, limit=5), 'ids': [ward_id, city_id]}
    return out


def load(cache_dir, census=None, force=False):
    """The six tables, kept for a week (the last saved copy if the City can't be reached)."""
    year = int((census or {}).get('year') or 2021)
    path = os.path.join(cache_dir, f'census_by_ward_{year}.json')
    if not force and os.path.exists(path) and time.time() - os.path.getmtime(path) < KEEP_DAYS * 86400:
        try:
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        except (OSError, ValueError):
            pass
    try:
        data = _fetch(census)
    except Exception:
        if os.path.exists(path):
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        raise
    os.makedirs(cache_dir, exist_ok=True)
    with open(path + '.tmp', 'w', encoding='utf-8') as f:
        json.dump(data, f)
    os.replace(path + '.tmp', path)
    return data


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _pct(a, b):
    return round(100 * a / b, 1) if a is not None and b else None


def profile(data, ward):
    """The ward against Calgary, in the same shape as the printed Ward 5 profile (groups of items)."""
    if not data:
        return None
    row = lambda key: next((r for r in data[key]['wards'] if str(int(_num(r.get('ward_number')) or 0)) == str(ward)), None)
    city = lambda key: (data[key]['city'] or [{}])[0]
    p, h, w = row('pop'), row('hh'), row('work')
    if not (p and h):
        return None
    year = data.get('year', 2021)
    may = f'May {year}' + (', during the pandemic' if year == 2021 else '')
    cp, ch, cw = city('pop'), city('hh'), city('work')
    g = lambda r, k: _num((r or {}).get(k))
    people, cpeople = g(p, 'total_pop_household'), g(cp, 'total_pop_household')
    sen = lambda r: (g(r, 'pop_age_65_to_84') or 0) + (g(r, 'pop_age_85_and_over') or 0)
    item = lambda label, a, b, unit, note=None: {'label': label, 'ward': a, 'cal': b, 'unit': unit, **({'note': note} if note else {})}
    people_items = [
        item('People in private households', people, cpeople, 'n'),
        item("Share of Calgary's people", _pct(people, cpeople), None, '%', f'{people:,.0f} of {cpeople:,.0f}' if people and cpeople else None),
        item('Households', g(h, 'total_private_households'), g(ch, 'total_private_households'), 'n'),
        item('People per household', g(h, 'avg_household_size') and round(g(h, 'avg_household_size'), 1),
             g(ch, 'avg_household_size') and round(g(ch, 'avg_household_size'), 1), 'x'),
        item('Households of 5 or more people', _pct(g(h, 'house_size_5_plus_persons'), g(h, 'total_private_households')),
             _pct(g(ch, 'house_size_5_plus_persons'), g(ch, 'total_private_households')), '%'),
        item('People living alone (one-person households)', _pct(g(h, 'house_size_1_person'), g(h, 'total_private_households')),
             _pct(g(ch, 'house_size_1_person'), g(ch, 'total_private_households')), '%'),
        item('Children aged 0 to 14', _pct(g(p, 'pop_age_0_to_14'), people), _pct(g(cp, 'pop_age_0_to_14'), cpeople), '%',
             f"{g(p, 'pop_age_0_to_14'):,.0f} children" if g(p, 'pop_age_0_to_14') else None),
        item('Children under 5', _pct(g(p, 'pop_age_0_to_4'), people), _pct(g(cp, 'pop_age_0_to_4'), cpeople), '%'),
        item('Aged 65 and over', _pct(sen(p), people), _pct(sen(cp), cpeople), '%', f'{sen(p):,.0f} people' if sen(p) else None),
        item('One-parent families', _pct(g(h, 'one_parent_families'), g(h, 'total_census_families')),
             _pct(g(ch, 'one_parent_families'), g(ch, 'total_census_families')), '%'),
    ]
    groups = [{'key': 'people', 'title': 'People and households', 'items': people_items}]
    if w:
        over15, cover15 = g(w, 'total_pop_over_15_household'), g(cw, 'total_pop_over_15_household')
        lf, clf = g(w, 'in_labour_force'), g(cw, 'in_labour_force')
        work_items = [
            item('In the labour force', _pct(lf, over15), _pct(clf, cover15), '%'),
            item(f'Unemployed ({may})', _pct(g(w, 'unemployed'), lf), _pct(g(cw, 'unemployed'), clf), '%'),
            item('Self-employed', _pct(g(w, 'self_employed'), lf), _pct(g(cw, 'self_employed'), clf), '%'),
        ]
        rows = [[w.get(f'top_{i}_industry'), g(w, f'top_{i}_industry_pop'), g(w, f'top_{i}_industry_per')] for i in (1, 2, 3) if w.get(f'top_{i}_industry')]
        groups.append({'key': 'work', 'title': f'Work (May {year})', 'items': work_items,
                       'list': {'title': 'Largest industries residents work in', 'rows': rows,
                                'note': 'Share of the ward\'s workers.'} if rows else None})
    return {'source': {'name': f'{year} Census by ward: Ward {ward}', 'publisher': f'City of Calgary open data (Statistics Canada {year} Census)',
                       'page': PAGE, 'census_day': '2021-05-11' if year == 2021 else None,
                       'datasets': {k: (data.get(k) or {}).get('ids') or [v[0], v[1]] for k, v in TABLES.items()},
                       'notes': 'People in private households (not seniors\' homes or other collective dwellings), 2021 '
                                'Census by ward from the City\'s open data. Work questions refer to ' + may + '. Statistics Canada rounds counts to the nearest 5. Languages, newcomers, housing '
                                'costs and income are in the City\'s printed ward profiles, not in these open tables.'},
            'groups': groups, 'partial': True}
